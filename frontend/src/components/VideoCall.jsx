import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { getIceServers, createPeerConnection } from '../lib/webrtc';

export default function VideoCall({ call, onEnd }) {
  const socket = useSocket();
  const localRef = useRef();
  const remoteRef = useRef();
  const pcRef = useRef();
  const localStreamRef = useRef();
  const [status, setStatus] = useState('connecting');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    startCall();
    return () => cleanup();
  }, []);

  async function startCall() {
    try {
      const iceServers = await getIceServers();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = createPeerConnection(iceServers,
        (candidate) => socket.emit('ice-candidate', { to: call.peerId, candidate, callId: call.callId }),
        (remoteStream) => { if (remoteRef.current) remoteRef.current.srcObject = remoteStream; setStatus('connected'); }
      );
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      socket.on('offer', async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: call.peerId, answer, callId: call.callId });
      });

      socket.on('answer', async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('ice-candidate', async ({ candidate }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch(e) {}
      });

      socket.on('call-ended', () => { cleanup(); onEnd(); });

      if (call.isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { to: call.peerId, offer, callId: call.callId });
      }
    } catch (e) {
      alert('Call failed: ' + e.message);
      onEnd();
    }
  }

  function cleanup() {
    socket?.off('offer'); socket?.off('answer'); socket?.off('ice-candidate'); socket?.off('call-ended');
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
  }

  function endCall() {
    socket.emit('end-call', { to: call.peerId, callId: call.callId });
    cleanup();
    onEnd();
  }

  function toggleMute() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(!track.enabled); }
  }

  function toggleVideo() {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setVideoOff(!track.enabled); }
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      <div className="p-4 bg-gray-800">Status: {status}</div>
      <div className="flex-1 relative">
        <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={localRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-40 h-32 border-2 border-white rounded object-cover" />
      </div>
      <div className="p-4 bg-gray-800 flex justify-center gap-4">
        <button onClick={toggleMute} className="bg-gray-600 px-4 py-2 rounded">{muted ? '🔇' : '🎤'}</button>
        <button onClick={toggleVideo} className="bg-gray-600 px-4 py-2 rounded">{videoOff ? '📷❌' : '📷'}</button>
        <button onClick={endCall} className="bg-red-600 px-6 py-2 rounded">📞 End Call</button>
      </div>
    </div>
  );
}