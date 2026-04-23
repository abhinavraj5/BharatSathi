module.exports = (io) => {
  const users = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('🟢 Connected:', socket.id);

    // ===============================
    // REGISTER USER
    // ===============================
    socket.on('register', ({ userId }) => {
      users.set(userId, socket.id);
      socket.userId = userId;

      console.log(`✅ User registered: ${userId}`);
      console.log("🔥 Current users:", Object.fromEntries(users));
    });

    // ===============================
    // CALL REQUEST (USER -> EXPERT)
    // ===============================
    socket.on('call-request', ({ expertId, callerId, callerName, callId }) => {
      console.log("📞 CALL REQUEST:", { expertId, callerId });

      const expertSocket = users.get(expertId);

      if (!expertSocket) {
        console.log("❌ Expert not connected:", expertId);
        return;
      }

      io.to(expertSocket).emit('incoming-call', {
        callerId,
        callerName,
        callId
      });

      console.log("📡 Call sent to expert:", expertSocket);
    });

    // ===============================
    // CALL RESPONSE (EXPERT -> USER)
    // ===============================
    socket.on('call-response', ({ callerId, accepted, callId }) => {
      console.log("📲 CALL RESPONSE:", { callerId, accepted });

      const callerSocket = users.get(callerId);

      if (!callerSocket) {
        console.log("❌ Caller not found:", callerId);
        return;
      }

      io.to(callerSocket).emit('call-response', {
        accepted,
        callId
      });
    });

    // ===============================
    // WEBRTC SIGNALING
    // ===============================
    socket.on('offer', ({ to, offer, callId }) => {
      const target = users.get(to);
      if (target) {
        io.to(target).emit('offer', {
          from: socket.userId,
          offer,
          callId
        });
      }
    });

    socket.on('answer', ({ to, answer, callId }) => {
      const target = users.get(to);
      if (target) {
        io.to(target).emit('answer', {
          from: socket.userId,
          answer,
          callId
        });
      }
    });

    socket.on('ice-candidate', ({ to, candidate, callId }) => {
      const target = users.get(to);
      if (target) {
        io.to(target).emit('ice-candidate', {
          from: socket.userId,
          candidate,
          callId
        });
      }
    });

    // ===============================
    // END CALL
    // ===============================
    socket.on('end-call', ({ to, callId }) => {
      const target = users.get(to);
      if (target) {
        io.to(target).emit('call-ended', { callId });
      }
    });

    // ===============================
    // DISCONNECT
    // ===============================
    socket.on('disconnect', () => {
      if (socket.userId) {
        users.delete(socket.userId);
        console.log(`🔴 Disconnected: ${socket.userId}`);
      } else {
        console.log('🔴 Socket disconnected:', socket.id);
      }

      console.log("🔥 Remaining users:", Object.fromEntries(users));
    });
  });
};