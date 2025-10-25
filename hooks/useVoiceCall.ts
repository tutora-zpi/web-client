import { WSConnect } from "@/lib/websocket/ws-connect";
import { PeerConnection } from "@/types/meeting";
import { useEffect, useRef, useState, useCallback } from "react";
import { WSGeneral, WSRTC } from "@/types/websocket";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useVoiceCall = ({
  roomId,
  token,
  userId,
}: {
  roomId: string;
  token: string;
  userId: string;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const hasJoinedRef = useRef(false);

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
      setError("No micro access");
      throw err;
    }
  }, []);

  const sendMessage = useCallback((name: string, data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ name, data }));
    }
  }, []);

  const createPeerConnection = useCallback(
    (peerId: string) => {
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
        if (event.candidate) {
          sendMessage(WSRTC.IceCandidateWSEvent, {
            from: userId,
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
    },
    [sendMessage, userId]
  );

  const startCall = useCallback(async () => {
    if (isCallActive || socketRef.current?.readyState === WebSocket.OPEN) {
      console.log("Already connected, skipping...");
      return;
    }

    console.log("🚀 START CALL - roomId:", roomId, "userId:", userId);

    try {
      setError(null);

      await initializeAudio();

      const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;
      const url = `${gateway}/ws?token=${token}`;
      const ws = WSConnect(url);
      socketRef.current = ws;

      if (ws.readyState === WebSocket.OPEN) {
        if (!hasJoinedRef.current) {
          const joinMsg = {
            name: WSGeneral.UserJoinedWSEvent,
            data: {
              roomId: roomId,
              userId: userId,
            },
          };
          ws.send(JSON.stringify(joinMsg));
          hasJoinedRef.current = true;
        }
      }

      const handleOpen = () => {
        setIsConnected(true);
        if (!hasJoinedRef.current) {
          const joinMsg = {
            name: WSGeneral.UserJoinedWSEvent,
            data: {
              roomId: roomId,
              userId: userId,
            },
          };
          ws.send(JSON.stringify(joinMsg));
          hasJoinedRef.current = true;
        }
      };

      const handleMessage = async (event: MessageEvent) => {
        console.log("Received message:", event.data);
        const msg = JSON.parse(event.data);
        switch (msg.name) {
          case WSGeneral.RoomUsersWSEvent: {
            const users = msg.data.users.filter((id: string) => id !== userId);
            setParticipants(users);

            // Twórz oferty tylko dla użytkowników z mniejszym ID (polite/impolite pattern)
            for (const id of users) {
              if (!peerConnectionsRef.current.has(id)) {
                createPeerConnection(id);

                // Tylko user z większym ID inicjuje połączenie
                if (userId > id) {
                  const peerData = peerConnectionsRef.current.get(id);
                  if (peerData) {
                    const offer = await peerData.connection.createOffer();
                    await peerData.connection.setLocalDescription(offer);
                    emitOffer(offer, id, userId);
                  }
                }
              }
            }
            break;
          }
          case WSRTC.OfferWSEvent: {
            await handleOffer(msg.data.offer, msg.data.from);
            break;
          }

          case WSRTC.AnswerWSEvent: {
            await handleAnswer(msg.data.answer, msg.data.from);
            break;
          }

          case WSRTC.IceCandidateWSEvent: {
            await handleIceCandidate(msg.data.candidate, msg.data.from);
            break;
          }

          case WSGeneral.UserLeftWSEvent: {
            const userId = msg.data.userId;
            const peerData = peerConnectionsRef.current.get(userId);
            if (peerData) {
              peerData.connection.close();
              peerConnectionsRef.current.delete(userId);
            }

            const audio = remoteAudiosRef.current.get(userId);
            if (audio) {
              audio.pause();
              remoteAudiosRef.current.delete(userId);
            }

            setParticipants((prev) => prev.filter((id) => id !== userId));
            break;
          }

          default:
            console.warn(`⚠️ [VOICE] Unknown event type: ${msg.name}`);
        }
      };

      const handleClose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        hasJoinedRef.current = false;
      };

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("close", handleClose);

      setIsCallActive(true);

      return () => {
        ws.removeEventListener("open", handleOpen);
        ws.removeEventListener("message", handleMessage);
        ws.removeEventListener("close", handleClose);
      };
    } catch (err) {
      setError("Cannot start the call");
      console.error("Error starting call:", err);
    }
  }, [
    roomId,
    token,
    userId,
    initializeAudio,
    createPeerConnection,
    sendMessage,
  ]);

  const emitOffer = (
    offer: RTCSessionDescriptionInit,
    to: string,
    from: string
  ) => {
    const message = {
      name: WSRTC.OfferWSEvent,
      data: {
        offer,
        from,
        to,
      },
    };
    socketRef.current?.send(JSON.stringify(message));
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: string
  ) => {
    let peerConnection = peerConnectionsRef.current.get(from)?.connection;

    if (!peerConnection) {
      peerConnection = createPeerConnection(from);
    }

    // Jeśli mamy konflikt (obie strony wysłały offer), użyj rollback
    if (peerConnection.signalingState !== "stable") {
      console.log("Collision detected, rolling back...");

      // Polite peer (z mniejszym ID) robi rollback
      if (userId < from) {
        await peerConnection.setLocalDescription({ type: "rollback" });
      } else {
        // Impolite peer ignoruje przychodzącą ofertę
        return;
      }
    }

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const message = {
      name: WSRTC.AnswerWSEvent,
      data: {
        answer,
        to: from,
        from: userId,
      },
    };
    socketRef.current?.send(JSON.stringify(message));
  };

  const handleAnswer = async (
    answer: RTCSessionDescriptionInit,
    from: string
  ) => {
    const peerData = peerConnectionsRef.current.get(from);
    if (peerData) {
      const state = peerData.connection.signalingState;

      if (state === "have-local-offer") {
        await peerData.connection.setRemoteDescription(answer);
      } else {
        console.warn(
          `Cannot set remote answer - connection in state: ${state}`
        );
      }
    }
  };

  const handleIceCandidate = async (
    candidate: RTCIceCandidateInit,
    from: string
  ) => {
    const peerData = peerConnectionsRef.current.get(from);
    if (peerData) {
      await peerData.connection.addIceCandidate(candidate);
    }
  };

  const endCall = useCallback(() => {
    // Wyślij informację o opuszczeniu pokoju
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const leaveMsg = {
        name: WSGeneral.UserLeftWSEvent,
        data: {
          roomId: roomId,
          userId: userId,
        },
      };
      socketRef.current.send(JSON.stringify(leaveMsg));
    }

    // Zamknij wszystkie peer connections
    peerConnectionsRef.current.forEach(({ connection }) => {
      connection.close();
    });
    peerConnectionsRef.current.clear();

    // Zatrzymaj lokalne ścieżki audio
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Zatrzymaj zdalne audio
    remoteAudiosRef.current.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
    });
    remoteAudiosRef.current.clear();

    // Zamknij WebSocket
    if (socketRef.current) {
      socketRef.current = null;
    }

    // Zresetuj stan lokalnego audio
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
      localAudioRef.current = null;
    }

    setIsCallActive(false);
    setIsConnected(false);
    setParticipants([]);
    setIsMuted(false);
    hasJoinedRef.current = false;
  }, [roomId, userId]);

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
