import { useState } from 'react';
import ChatBot from '../components/ChatBot';
import ExpertList from '../components/ExpertList';
import CropUpload from '../components/CropUpload';
import VideoCall from '../components/VideoCall';

export default function UserDashboard() {
  const [tab, setTab] = useState('experts');
  const [activeCall, setActiveCall] = useState(null);

  if (activeCall) return <VideoCall call={activeCall} onEnd={() => setActiveCall(null)} />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTab('experts')} className={`px-4 py-2 rounded ${tab==='experts'?'bg-green-600 text-white':'bg-gray-200'}`}>📞 Experts</button>
        <button onClick={() => setTab('ai')} className={`px-4 py-2 rounded ${tab==='ai'?'bg-green-600 text-white':'bg-gray-200'}`}>🤖 AI Chat</button>
        <button onClick={() => setTab('crop')} className={`px-4 py-2 rounded ${tab==='crop'?'bg-green-600 text-white':'bg-gray-200'}`}>🌱 Crop</button>
      </div>
      {tab === 'experts' && <ExpertList onStartCall={setActiveCall} />}
      {tab === 'ai' && <ChatBot />}
      {tab === 'crop' && <CropUpload />}
    </div>
  );
}