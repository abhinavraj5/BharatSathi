import { useSocket } from '../context/SocketContext';
import VideoCall from '../components/VideoCall';

export default function ExpertDashboard() {
  const { incomingCall, answerCall, stream } = useSocket();

  if (stream) return <VideoCall />;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Expert Dashboard</h2>

      {incomingCall && (
        <div className="mt-6 p-6 bg-white rounded shadow">
          <p>📞 Incoming Call</p>

          <button
            onClick={answerCall}
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}