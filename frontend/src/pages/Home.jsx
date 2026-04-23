import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4 text-green-800">🌾 Rural Expert Connect</h1>
      <p className="text-xl mb-8">Connect with doctors, educators, and government experts. Get AI-powered help for farming, health, and schemes.</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-green-100 p-6 rounded-lg"><h3 className="font-bold text-xl">📞 Talk to Expert</h3><p>Live video calls</p></div>
        <div className="bg-blue-100 p-6 rounded-lg"><h3 className="font-bold text-xl">🤖 AI Assistant</h3><p>24/7 help in your language</p></div>
        <div className="bg-yellow-100 p-6 rounded-lg"><h3 className="font-bold text-xl">🌱 Crop Disease</h3><p>Upload photo, get diagnosis</p></div>
      </div>
      <Link to="/signup" className="btn-primary inline-block mt-8">Get Started</Link>
    </div>
  );
}