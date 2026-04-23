import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ExpertList({ onStartCall }) {
  const [experts, setExperts] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchExperts();
  }, []);

  async function fetchExperts() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'expert');

    if (!error) setExperts(data);
  }

  function startCall(expert) {
    if (!socket) {
      alert("Socket not connected");
      return;
    }

    const callId = Date.now().toString();

    console.log("CALLING EXPERT:", expert.id); // DEBUG

    // 🔥 SEND CALL REQUEST
    socket.emit('call-request', {
      expertId: expert.id,     // ✅ MUST BE ID (NOT EMAIL)
      callerId: user.id,
      callerName: user.email,
      callId
    });

    // 🔥 START WEBRTC FLOW
    onStartCall({
      peerId: expert.id,
      callId,
      isInitiator: true
    });
  }

  return (
    <div className="space-y-4">
      {experts.map((expert) => (
        <div key={expert.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
          <div>
            <p className="font-bold">{expert.email}</p>
            <p className="text-sm text-gray-500">Expert</p>
          </div>

          <button
            onClick={() => startCall(expert)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            📞 Call
          </button>
        </div>
      ))}
    </div>
  );
}