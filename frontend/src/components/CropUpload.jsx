import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export default function CropUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/crops/analyze`, fd, {
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.analysis);
    } catch (e) { setResult('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="font-bold text-lg mb-4">🌱 Upload Crop Image</h3>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="mb-4" />
      <button onClick={upload} disabled={!file || loading} className="btn-primary">{loading ? 'Analyzing...' : 'Analyze'}</button>
      {result && <div className="mt-4 p-4 bg-green-50 rounded whitespace-pre-wrap">{result}</div>}
    </div>
  );
}