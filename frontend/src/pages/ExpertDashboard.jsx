import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall';

export default function ExpertDashboard() {
  const socket = useSocket();
  const { user } = useAuth();

  const [incoming, setIncoming] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (!socket || !user) return;

    console.log("👂 Expert listening for calls...");

    socket.on('incoming-call', (data) => {
      console.log("📞 INCOMING CALL:", data);
      setIncoming(data);
    });

    return () => {
      socket.off('incoming-call');
    };
  }, [socket, user]);

  function accept() {
    console.log("✅ Call accepted");

    socket.emit('call-response', {
      callerId: incoming.callerId,
      accepted: true,
      callId: incoming.callId
    });

    setActiveCall({
      peerId: incoming.callerId,
      callId: incoming.callId,
      isInitiator: false
    });

    setIncoming(null);
  }

  function reject() {
    console.log("❌ Call rejected");

    socket.emit('call-response', {
      callerId: incoming.callerId,
      accepted: false,
      callId: incoming.callId
    });

    setIncoming(null);
  }

  if (activeCall) {
    return <VideoCall call={activeCall} onEnd={() => setActiveCall(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Expert Dashboard</h2>

      {incoming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg">
            <h3 className="text-xl font-bold mb-4">📞 Incoming Call</h3>
            <p className="mb-4">From: {incoming.callerName}</p>

            <div className="flex gap-4">
              <button onClick={accept} className="bg-green-600 text-white px-6 py-3 rounded">
                Accept
              </button>
              <button onClick={reject} className="bg-red-600 text-white px-6 py-3 rounded">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <p>Waiting for incoming calls...</p>
    </div>
  );
}