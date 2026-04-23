module.exports = (io) => {
  const users = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('✅ Connected:', socket.id);

    // 🔹 Register user
    socket.on('register', ({ userId }) => {
      if (!userId) return;

      users.set(userId, socket.id);
      socket.userId = userId;

      console.log(`👤 User registered: ${userId} -> ${socket.id}`);
    });

    // 🔹 CALL REQUEST (User -> Expert)
    socket.on('call-request', ({ expertId, callerId, callerName, callId }) => {
      console.log('📞 CALL REQUEST:', { expertId, callerId, callId });

      const expertSocket = users.get(expertId);

      if (expertSocket) {
        console.log('✅ Expert found:', expertSocket);

        io.to(expertSocket).emit('incoming-call', {
          callerId,
          callerName,
          callId
        });
      } else {
        console.log('❌ Expert NOT connected:', expertId);
      }
    });

    // 🔹 CALL RESPONSE (Expert -> User)
    socket.on('call-response', ({ callerId, accepted, callId }) => {
      console.log('📩 CALL RESPONSE:', { callerId, accepted });

      const callerSocket = users.get(callerId);

      if (callerSocket) {
        io.to(callerSocket).emit('call-response', {
          accepted,
          callId
        });
      }
    });

    // 🔹 WEBRTC OFFER
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

    // 🔹 WEBRTC ANSWER
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

    // 🔹 ICE CANDIDATES
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

    // 🔹 END CALL
    socket.on('end-call', ({ to, callId }) => {
      const target = users.get(to);

      if (target) {
        io.to(target).emit('call-ended', { callId });
      }
    });

    // 🔹 DISCONNECT
    socket.on('disconnect', () => {
      if (socket.userId) {
        users.delete(socket.userId);
        console.log(`❌ Disconnected: ${socket.userId}`);
      } else {
        console.log('❌ Socket disconnected:', socket.id);
      }
    });
  });
};