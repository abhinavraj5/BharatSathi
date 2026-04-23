module.exports = (io) => {
  const users = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('register', ({ userId }) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} registered`);
    });

    // Call request to expert
    socket.on('call-request', ({ expertId, callerId, callerName, callId }) => {
      const expertSocket = users.get(expertId);
      if (expertSocket) {
        io.to(expertSocket).emit('incoming-call', { callerId, callerName, callId });
      }
    });

    // Expert response
    socket.on('call-response', ({ callerId, accepted, callId }) => {
      const callerSocket = users.get(callerId);
      if (callerSocket) {
        io.to(callerSocket).emit('call-response', { accepted, callId });
      }
    });

    // WebRTC signaling
    socket.on('offer', ({ to, offer, callId }) => {
      const target = users.get(to);
      if (target) io.to(target).emit('offer', { from: socket.userId, offer, callId });
    });

    socket.on('answer', ({ to, answer, callId }) => {
      const target = users.get(to);
      if (target) io.to(target).emit('answer', { from: socket.userId, answer, callId });
    });

    socket.on('ice-candidate', ({ to, candidate, callId }) => {
      const target = users.get(to);
      if (target) io.to(target).emit('ice-candidate', { from: socket.userId, candidate, callId });
    });

    socket.on('end-call', ({ to, callId }) => {
      const target = users.get(to);
      if (target) io.to(target).emit('call-ended', { callId });
    });

    socket.on('disconnect', () => {
      if (socket.userId) users.delete(socket.userId);
      console.log('Disconnected:', socket.id);
    });
  });
};