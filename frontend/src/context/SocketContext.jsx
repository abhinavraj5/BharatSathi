import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // ❌ No user → no socket
    if (!user) return;

    console.log("🔌 Connecting socket...");

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    const s = io(socketUrl, {
      transports: ['websocket'], // ✅ force stable connection
      withCredentials: true
    });

    // ✅ On connect → register user
    s.on('connect', () => {
      console.log("✅ SOCKET CONNECTED:", s.id);

      s.emit('register', {
        userId: user.id   // 🔥 MUST be user.id (UUID)
      });
    });

    // ❗ Debug errors
    s.on('connect_error', (err) => {
      console.error("❌ Socket error:", err.message);
    });

    s.on('disconnect', () => {
      console.log("❌ Socket disconnected");
    });

    setSocket(s);

    // ✅ Cleanup
    return () => {
      console.log("🧹 Cleaning socket...");
      s.disconnect();
    };

  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);