import axios from 'axios';

export async function getIceServers() {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/turn-credentials`);
    return data.iceServers;
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

export function createPeerConnection(iceServers, onIceCandidate, onTrack) {
  const pc = new RTCPeerConnection({ iceServers });
  pc.onicecandidate = (e) => { if (e.candidate) onIceCandidate(e.candidate); };
  pc.ontrack = (e) => onTrack(e.streams[0]);
  return pc;
}