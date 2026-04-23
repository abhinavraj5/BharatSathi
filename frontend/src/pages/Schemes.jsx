import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/schemes`).then(r => setSchemes(r.data));
  }, []);
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Government Schemes</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {schemes.map(s => (
          <div key={s.id} className="border p-4 rounded-lg bg-white shadow">
            <h3 className="font-bold text-lg">{s.title}</h3>
            <p className="text-gray-600">{s.description}</p>
            <p className="mt-2 text-sm"><b>Eligibility:</b> {s.eligibility}</p>
          </div>
        ))}
      </div>
    </div>
  );
}