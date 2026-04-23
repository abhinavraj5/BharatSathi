const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // change to frontend URL in production
    methods: ["GET", "POST"]
  }
});

const users = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // ✅ Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    socket.userId = userId;

    console.log("✅ Registered:", userId);
    console.log("🔥 Users:", users);
  });

  // 📞 Call user
  socket.on("call-user", ({ to, offer }) => {
    const targetSocket = users[to];

    if (targetSocket) {
      console.log("📞 Calling:", to);

      io.to(targetSocket).emit("incoming-call", {
        from: socket.userId,
        offer
      });
    } else {
      console.log("❌ User not found:", to);
    }
  });

  // ✅ Answer call
  socket.on("answer-call", ({ to, answer }) => {
    const targetSocket = users[to];

    if (targetSocket) {
      io.to(targetSocket).emit("call-answered", {
        answer
      });
    }
  });

  // ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocket = users[to];

    if (targetSocket) {
      io.to(targetSocket).emit("ice-candidate", {
        candidate
      });
    }
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      delete users[socket.userId];
      console.log("🔴 Disconnected:", socket.userId);
      console.log("🔥 Remaining users:", users);
    }
  });
});

server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:5000");
});