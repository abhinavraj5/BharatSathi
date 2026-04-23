import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message); else nav('/dashboard');
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-8 space-y-4">
      <h2 className="text-2xl font-bold">Login</h2>
      {err && <p className="text-red-600">{err}</p>}
      <input className="w-full border p-3 rounded" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="w-full border p-3 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button className="btn-primary w-full">Login</button>
    </form>
  );
}