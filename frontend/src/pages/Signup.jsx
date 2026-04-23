import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'user', phone: '', language: 'en' });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, form);
      nav('/login');
    } catch (e) { setErr(e.response?.data?.error || 'Error'); }
  }

  return (
    <form onSubmit={handleSignup} className="max-w-md mx-auto p-8 space-y-4">
      <h2 className="text-2xl font-bold">Sign Up</h2>
      {err && <p className="text-red-600">{err}</p>}
      <input className="w-full border p-3 rounded" placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
      <input className="w-full border p-3 rounded" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
      <input className="w-full border p-3 rounded" type="password" placeholder="Password (min 6)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
      <input className="w-full border p-3 rounded" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
      <select className="w-full border p-3 rounded" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
        <option value="user">Rural User</option>
        <option value="expert">Expert</option>
      </select>
      <select className="w-full border p-3 rounded" value={form.language} onChange={e => setForm({...form, language: e.target.value})}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="kn">Kannada</option>
      </select>
      <button className="btn-primary w-full">Sign Up</button>
    </form>
  );
}