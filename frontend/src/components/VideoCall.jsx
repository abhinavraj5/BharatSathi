import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

export default function VideoCall() {
  const { stream, remoteStream } = useSocket();

  const localRef = useRef();
  const remoteRef = useRef();

  useEffect(() => {
    if (localRef.current && stream) {
      localRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 bg-black">
      <video ref={remoteRef} autoPlay className="w-full h-full object-cover" />
      <video
        ref={localRef}
        autoPlay
        muted
        className="absolute bottom-4 right-4 w-40 h-32"
      />
    </div>
  );
}useEffect(() => {
  if (!socket) return;

  startCall();

  socket.on("offer", async ({ offer, from }) => {
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socket.emit("answer", { to: call.peerId, answer });
  });

  socket.on("answer", async ({ answer }) => {
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {}
  });

  return () => {
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
  };
}, [socket]);