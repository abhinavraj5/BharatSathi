import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import VideoCall from '../components/VideoCall';

export default function ExpertDashboard() {
  const socket = useSocket();
  const { user } = useAuth();
  const [incoming, setIncoming] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!socket) return;
    socket.on('incoming-call', ({ callerId, callerName, callId }) => {
      setIncoming({ callerId, callerName, callId });
    });
    return () => socket.off('incoming-call');
  }, [socket]);

  async function toggleAvailability() {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_API_URL}/api/experts/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ is_available: !available })
    });
    setAvailable(!available);
  }

  function accept() {
    socket.emit('call-response', { callerId: incoming.callerId, accepted: true, callId: incoming.callId });
    setActiveCall({ peerId: incoming.callerId, callId: incoming.callId, isInitiator: false });
    setIncoming(null);
  }

  function reject() {
    socket.emit('call-response', { callerId: incoming.callerId, accepted: false, callId: incoming.callId });
    setIncoming(null);
  }

  if (activeCall) return <VideoCall call={activeCall} onEnd={() => setActiveCall(null)} />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Expert Dashboard</h2>
      <button onClick={toggleAvailability} className={`px-4 py-2 rounded ${available?'bg-green-600':'bg-gray-600'} text-white mb-6`}>
        {available ? '🟢 Available' : '⚫ Unavailable'}
      </button>

      {incoming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg">
            <h3 className="text-xl font-bold mb-4">📞 Incoming Call</h3>
            <p className="mb-4">From: {incoming.callerName}</p>
            <div className="flex gap-4">
              <button onClick={accept} className="bg-green-600 text-white px-6 py-3 rounded">✅ Accept</button>
              <button onClick={reject} className="bg-red-600 text-white px-6 py-3 rounded">❌ Reject</button>
            </div>
          </div>
        </div>
      )}

      <p>Waiting for incoming calls...</p>
    </div>
  );
}