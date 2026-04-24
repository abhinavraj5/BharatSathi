import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import ExpertList from "../components/ExpertList";

export default function UserDashboard({ user, experts, onStartCall }) {
  const socket = useSocket();

  // ✅ REGISTER USER
  useEffect(() => {
    if (socket && user?.id) {
      socket.emit("register", user.id);
      console.log("✅ Registered:", user.id);
    }
  }, [socket, user]);

  // 📞 START CALL
  function startCall(expert) {
    if (!socket) {
      alert("Socket not connected");
      return;
    }

    const callId = `${user.id}-${expert.id}-${Date.now()}`;

    socket.emit("call-request", {
      expertId: expert.id,
      callerId: user.id,
      callerName: user.email,
      callId,
    });

    onStartCall({
      peerId: expert.id,
      callId,
      isInitiator: true,
    });
  }

  return (
    <div>
      <h2>User Dashboard</h2>

      <ExpertList experts={experts} onCall={startCall} />
    </div>
  );
}