import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  const socket = useRef();
  const peerConnection = useRef();

  const [stream, setStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // 🔗 Connect socket
  useEffect(() => {
    socket.current = io("http://localhost:5000"); // change to deployed URL later

    if (userId) {
      socket.current.emit("register", userId);
    }

    // 📞 Incoming call
    socket.current.on("incoming-call", ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);
      setIncomingCall({ from, offer });
    });

    // ✅ Call answered
    socket.current.on("call-answered", ({ answer }) => {
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // ICE candidates
    socket.current.on("ice-candidate", ({ candidate }) => {
      peerConnection.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userId]);

  // 🎥 Start media
  const startStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    setStream(localStream);
    return localStream;
  };

  // 📞 Call expert
  const callUser = async (targetId) => {
    const localStream = await startStream();

    peerConnection.current = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          to: targetId,
          candidate: event.candidate
        });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.current.emit("call-user", {
      to: targetId,
      offer
    });
  };

  // ✅ Answer call
  const answerCall = async () => {
    const localStream = await startStream();

    peerConnection.current = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          to: incomingCall.from,
          candidate: event.candidate
        });
      }
    };

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.current.emit("answer-call", {
      to: incomingCall.from,
      answer
    });
  };

  return (
    <SocketContext.Provider
      value={{
        callUser,
        answerCall,
        incomingCall,
        stream
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);