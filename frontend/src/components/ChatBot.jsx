import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(m => [...m, userMsg]);
    setInput(''); setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`,
        { message: input }, { headers: { Authorization: `Bearer ${session.access_token}` } });
      setMessages(m => [...m, { role: 'ai', text: data.reply }]);
    } catch (e) { setMessages(m => [...m, { role: 'ai', text: 'Error: ' + e.message }]); }
    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="h-96 overflow-y-auto mb-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded ${m.role === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'}`}>{m.text}</div>
        ))}
        {loading && <p>🤖 Thinking...</p>}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border p-2 rounded" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Ask anything..." />
        <button onClick={send} className="btn-primary">Send</button>
      </div>
    </div>
  );
}