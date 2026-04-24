import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

let users = {}; // { userId: socketId }

// 🔥 SOCKET
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // ✅ REGISTER USER
  socket.on("register", (userId) => {
    if (typeof userId === "object") userId = userId.userId;

    users[userId] = socket.id;

    console.log("✅ Registered:", userId);
    console.log("🔥 Users:", users);
  });

  // 📞 CALL REQUEST (USER → EXPERT)
  socket.on("call-request", ({ expertId, callerId, callerName, callId }) => {
    const expertSocket = users[expertId];

    if (expertSocket) {
      io.to(expertSocket).emit("incoming-call", {
        callerId,
        callerName,
        callId,
      });
    }
  });

  // ✅ CALL RESPONSE (EXPERT → USER)
  socket.on("call-response", ({ callerId, accepted, callId }) => {
    const callerSocket = users[callerId];

    if (callerSocket) {
      io.to(callerSocket).emit("call-response", {
        accepted,
        callId,
      });
    }
  });

  // 🔄 WEBRTC SIGNALS
  socket.on("offer", ({ to, offer }) => {
    io.to(users[to]).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(users[to]).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(users[to]).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    io.to(users[to]).emit("call-ended");
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    for (let id in users) {
      if (users[id] === socket.id) delete users[id];
    }

    console.log("🔥 Remaining:", users);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});