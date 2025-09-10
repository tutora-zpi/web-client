import { PeerConnection } from "@/types/meeting";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export const useVoiceCall = ({
  roomId,
  serverUrl = process.env.NEXT_PUBLIC_WEB_RTC_SERVICE,
}: {
  roomId: string;
  serverUrl?: string;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;

      if (!localAudioRef.current) {
        localAudioRef.current = new Audio();
        localAudioRef.current.muted = true;
        localAudioRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      setError("Nie można uzyskać dostępu do mikrofonu");
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((peerId: string) => {
    const peerConnection = new RTCPeerConnection(iceServers);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;

      if (!remoteAudiosRef.current.has(peerId)) {
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.play().catch(console.error);
        remoteAudiosRef.current.set(peerId, audioElement);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionsRef.current.set(peerId, {
      id: peerId,
      connection: peerConnection,
    });

    return peerConnection;
  }, []);

  const startCall = useCallback(async () => {
    try {
      setError(null);

      await initializeAudio();

      socketRef.current = io(serverUrl);

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        socketRef.current!.emit("join-room", roomId);
      });

      socketRef.current.on("room-users", (users: string[]) => {
        setParticipants(users);
        users.forEach(async (userId) => {
          const peerConnection = createPeerConnection(userId);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          socketRef.current!.emit("offer", {
            to: userId,
            offer,
          });
        });
      });

      socketRef.current.on("user-joined", (userId: string) => {
        setParticipants((prev) => [...prev, userId]);
      });

      socketRef.current.on(
        "offer",
        async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
          const peerConnection = createPeerConnection(data.from);
          await peerConnection.setRemoteDescription(data.offer);

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socketRef.current!.emit("answer", {
            to: data.from,
            answer,
          });
        }
      );

      socketRef.current.on(
        "answer",
        async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
          const peerData = peerConnectionsRef.current.get(data.from);
          if (peerData) {
            await peerData.connection.setRemoteDescription(data.answer);
          }
        }
      );

      socketRef.current.on(
        "ice-candidate",
        async (data: { candidate: RTCIceCandidateInit; from: string }) => {
          const peerData = peerConnectionsRef.current.get(data.from);
          if (peerData) {
            await peerData.connection.addIceCandidate(data.candidate);
          }
        }
      );

      socketRef.current.on("user-left", (userId: string) => {
        setParticipants((prev) => prev.filter((id) => id !== userId));
        const peerData = peerConnectionsRef.current.get(userId);
        if (peerData) {
          peerData.connection.close();
          peerConnectionsRef.current.delete(userId);
        }

        const audioElement = remoteAudiosRef.current.get(userId);
        if (audioElement) {
          audioElement.pause();
          remoteAudiosRef.current.delete(userId);
        }
      });

      setIsCallActive(true);
    } catch (err) {
      setError("Cannot start the call");
      console.error("Error starting call:", err);
    }
  }, [roomId, serverUrl, initializeAudio, createPeerConnection]);

  const endCall = useCallback(() => {
    peerConnectionsRef.current.forEach(({ connection }) => {
      connection.close();
    });
    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    remoteAudiosRef.current.forEach((audio) => {
      audio.pause();
    });
    remoteAudiosRef.current.clear();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsCallActive(false);
    setIsConnected(false);
    setParticipants([]);
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (isCallActive) {
        endCall();
      }
    };
  }, [isCallActive, endCall]);

  return {
    isConnected,
    isCallActive,
    isMuted,
    error,
    participants,
    startCall,
    endCall,
    toggleMute,
  };
};
