import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const url = import.meta.env.VITE_SOCKET_URL;
    console.log("🔌 Connecting to:", url);

    const s = io(url, {
      transports: ['websocket'],
      withCredentials: false
    });

    s.on('connect', () => {
      console.log("✅ SOCKET CONNECTED:", s.id, "USER:", user.id);
      s.emit('register', { userId: user.id });
    });

    s.on('connect_error', (err) => {
      console.error("❌ Socket connect_error:", err.message);
    });

    s.on('disconnect', () => {
      console.log("❌ Socket disconnected");
    });

    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);