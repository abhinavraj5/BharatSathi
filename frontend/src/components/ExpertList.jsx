import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ExpertList({ onStartCall }) {
  const [experts, setExperts] = useState([]);
  const [category, setCategory] = useState('');
  const [waiting, setWaiting] = useState(null);
  const socket = useSocket();
  const { user, profile } = useAuth();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/experts${category?`?category=${category}`:''}`)
      .then(r => setExperts(r.data));
  }, [category]);

  useEffect(() => {
    if (!socket) return;
    socket.on('call-response', ({ accepted, callId }) => {
      if (accepted && waiting?.callId === callId) {
        onStartCall({ peerId: waiting.expertUserId, callId, isInitiator: true });
      } else {
        alert('Expert rejected the call');
      }
      setWaiting(null);
    });
    return () => socket.off('call-response');
  }, [socket, waiting]);

  async function requestCall(expert) {
    const callId = `call_${Date.now()}`;
    const { data: { session } } = await supabase.auth.getSession();
    await axios.post(`${import.meta.env.VITE_API_URL}/api/calls/request`,
      { expert_id: expert.user_id, category: expert.category },
      { headers: { Authorization: `Bearer ${session.access_token}` } });
    
    socket.emit('call-request', {
      expertId: expert.user_id, callerId: user.id,
      callerName: profile?.full_name || 'User', callId
    });
    setWaiting({ callId, expertUserId: expert.user_id });
  }

  return (
    <div>
      <select className="border p-2 rounded mb-4" value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="doctor">Doctor</option>
        <option value="education">Education</option>
        <option value="government">Government</option>
        <option value="agriculture">Agriculture</option>
      </select>
      
      {waiting && <p className="bg-yellow-100 p-3 rounded mb-4">📞 Calling expert... waiting for response</p>}
      
      <div className="grid md:grid-cols-2 gap-4">
        {experts.map(e => (
          <div key={e.id} className="border p-4 rounded-lg bg-white shadow">
            <h3 className="font-bold text-lg">{e.users?.full_name}</h3>
            <p className="text-gray-600 capitalize">{e.category} • {e.specialization}</p>
            <p className="text-sm mt-2">{e.bio}</p>
            <button onClick={() => requestCall(e)} className="btn-primary mt-3 w-full">📞 Call Now</button>
          </div>
        ))}
        {experts.length === 0 && <p>No experts available right now.</p>}
      </div>
    </div>
  );
}