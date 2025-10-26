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

interface QueuedCandidate {
  candidate: RTCIceCandidateInit;
  from: string;
}

interface QueuedOffer {
  offer: RTCSessionDescriptionInit;
  from: string;
}

export const useVoiceCall = ({
  roomId,
  token,
  userId,
  autoConnect = true,
}: {
  roomId: string;
  token: string;
  userId: string;
  autoConnect?: boolean;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const iceCandidateQueueRef = useRef<Map<string, QueuedCandidate[]>>(
    new Map()
  );
  const queuedOffersRef = useRef<QueuedOffer[]>([]);
  const hasJoinedRef = useRef(false);
  const isNegotiatingRef = useRef<Map<string, boolean>>(new Map());

  const initializeAudio = useCallback(async () => {
    try {
      console.log("🎤 Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;
      console.log("✅ Microphone access granted");

      // Przetwórz kolejkowane oferty
      if (queuedOffersRef.current.length > 0) {
        console.log(
          `📦 Processing ${queuedOffersRef.current.length} queued offers`
        );
        const offers = [...queuedOffersRef.current];
        queuedOffersRef.current = [];

        for (const queuedOffer of offers) {
          await processOffer(queuedOffer.offer, queuedOffer.from);
        }
      }

      return stream;
    } catch (err) {
      console.error("❌ Microphone access denied:", err);
      setError("No microphone access");
      throw err;
    }
  }, []);

  const sendMessage = useCallback((name: string, data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ name, data }));
    }
  }, []);

  const processQueuedCandidates = useCallback(async (peerId: string) => {
    const queue = iceCandidateQueueRef.current.get(peerId);
    if (!queue || queue.length === 0) return;

    const peerData = peerConnectionsRef.current.get(peerId);
    if (!peerData || !peerData.connection.remoteDescription) return;

    console.log(`🧊 Processing ${queue.length} queued candidates for:`, peerId);

    for (const { candidate } of queue) {
      try {
        await peerData.connection.addIceCandidate(candidate);
      } catch (err) {
        console.error("❌ Error adding queued candidate:", err);
      }
    }

    iceCandidateQueueRef.current.delete(peerId);
  }, []);

  const createPeerConnection = useCallback(
    (peerId: string, shouldInitiate: boolean) => {
      console.log(
        "🔗 Creating peer connection for:",
        peerId,
        "shouldInitiate:",
        shouldInitiate
      );

      const existingPeer = peerConnectionsRef.current.get(peerId);
      if (existingPeer) {
        console.log("♻️ Closing existing connection for:", peerId);
        existingPeer.connection.close();
      }

      const peerConnection = new RTCPeerConnection(iceServers);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      peerConnection.ontrack = (event) => {
        console.log("📻 Received remote track from:", peerId);
        const [remoteStream] = event.streams;

        const oldAudio = remoteAudiosRef.current.get(peerId);
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.srcObject = null;
        }

        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.autoplay = true;
        audioElement.play().catch(console.error);
        remoteAudiosRef.current.set(peerId, audioElement);
        console.log("🔊 Playing audio from:", peerId);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendMessage(WSRTC.IceCandidateWSEvent, {
            from: userId,
            to: peerId,
            candidate: event.candidate,
          });
        } else {
          console.log("✅ All ICE candidates sent for:", peerId);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log(
          `🔌 Connection state [${peerId}]:`,
          peerConnection.connectionState
        );
      };

      peerConnection.onnegotiationneeded = async () => {
        if (!shouldInitiate) return;

        if (isNegotiatingRef.current.get(peerId)) {
          console.log("⏭️ Already negotiating with:", peerId);
          return;
        }

        try {
          isNegotiatingRef.current.set(peerId, true);
          console.log("🔄 Renegotiation needed for:", peerId);

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          sendMessage(WSRTC.OfferWSEvent, {
            offer,
            from: userId,
            to: peerId,
          });
        } catch (err) {
          console.error("❌ Renegotiation error:", err);
        } finally {
          isNegotiatingRef.current.set(peerId, false);
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

  const processOffer = useCallback(
    async (offer: RTCSessionDescriptionInit, from: string) => {
      console.log("🔄 Processing offer from:", from);

      try {
        let peerConnection = peerConnectionsRef.current.get(from)?.connection;

        if (!peerConnection) {
          console.log("🔗 Creating peer connection as responder");
          peerConnection = createPeerConnection(from, false);
        }

        if (peerConnection.signalingState !== "stable") {
          console.log(
            "⚠️ Not in stable state, rolling back:",
            peerConnection.signalingState
          );
          await peerConnection.setLocalDescription({ type: "rollback" });
        }

        console.log("📝 Setting remote description...");
        await peerConnection.setRemoteDescription(offer);
        console.log("✅ Remote description set");

        console.log("📝 Creating answer...");
        const answer = await peerConnection.createAnswer();
        console.log("✅ Answer created");

        console.log("📝 Setting local description...");
        await peerConnection.setLocalDescription(answer);
        console.log("✅ Local description set");

        console.log("📤 Sending answer to:", from);
        sendMessage(WSRTC.AnswerWSEvent, {
          answer,
          to: from,
          from: userId,
        });
        console.log("✅ Answer sent!");

        await processQueuedCandidates(from);
      } catch (err) {
        console.error("❌ Error processing offer:", err);
      }
    },
    [createPeerConnection, sendMessage, userId, processQueuedCandidates]
  );

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const msg = JSON.parse(event.data);

      switch (msg.name) {
        case WSGeneral.RoomUsersWSEvent: {
          const allUsers = msg.data.users as string[];
          console.log("👥 Room users:", allUsers);

          // Pierwszy użytkownik na liście jest initiatorem
          const firstUser = allUsers[0];
          const amIInitiator = firstUser === userId;

          console.log(
            `${amIInitiator ? "👑" : "👤"} I am ${
              amIInitiator ? "INITIATOR" : "RESPONDER"
            }`
          );

          const otherUsers = allUsers.filter((id) => id !== userId);
          setParticipants(otherUsers);

          // Jeśli jestem initiatorem, tworzę oferty dla wszystkich pozostałych
          if (amIInitiator && otherUsers.length > 0) {
            console.log("👑 Initiator creating offers for:", otherUsers);

            for (const id of otherUsers) {
              if (isNegotiatingRef.current.get(id)) {
                console.log("⏭️ Skipping, already negotiating with:", id);
                continue;
              }

              if (!peerConnectionsRef.current.has(id)) {
                try {
                  isNegotiatingRef.current.set(id, true);
                  const peerConnection = createPeerConnection(id, true);

                  const offer = await peerConnection.createOffer();
                  await peerConnection.setLocalDescription(offer);
                  console.log("✅ Sending offer to:", id);

                  sendMessage(WSRTC.OfferWSEvent, {
                    offer,
                    from: userId,
                    to: id,
                  });
                } catch (err) {
                  console.error("❌ Error creating offer for", id, err);
                  isNegotiatingRef.current.set(id, false);
                }
              }
            }
          } else if (!amIInitiator) {
            console.log(
              "👤 Responder waiting for offer from initiator:",
              firstUser
            );
          }
          break;
        }

        case WSRTC.OfferWSEvent: {
          const { offer, from } = msg.data;
          console.log("📥 Received offer from:", from);
          console.log("🎤 Local stream ready?", !!localStreamRef.current);

          // Jeśli nie mamy jeszcze streamu, kolejkuj ofertę
          if (!localStreamRef.current) {
            console.warn(
              "⚠️ Local stream not ready, queueing offer from:",
              from
            );
            queuedOffersRef.current.push({ offer, from });
            return;
          }

          await processOffer(offer, from);
          break;
        }

        case WSRTC.AnswerWSEvent: {
          const { answer, from } = msg.data;
          console.log("📥 Received answer from:", from);

          try {
            const peerData = peerConnectionsRef.current.get(from);

            if (peerData) {
              if (peerData.connection.signalingState === "have-local-offer") {
                await peerData.connection.setRemoteDescription(answer);
                console.log("✅ Answer set for:", from);

                isNegotiatingRef.current.set(from, false);

                await processQueuedCandidates(from);
              } else {
                console.warn(
                  "⚠️ Wrong state for answer:",
                  peerData.connection.signalingState
                );
              }
            }
          } catch (err) {
            console.error("❌ Error handling answer:", err);
          }
          break;
        }

        case WSRTC.IceCandidateWSEvent: {
          try {
            const { candidate, from } = msg.data;
            const peerData = peerConnectionsRef.current.get(from);

            if (peerData) {
              if (peerData.connection.remoteDescription) {
                await peerData.connection.addIceCandidate(candidate);
              } else {
                if (!iceCandidateQueueRef.current.has(from)) {
                  iceCandidateQueueRef.current.set(from, []);
                }
                iceCandidateQueueRef.current
                  .get(from)!
                  .push({ candidate, from });
              }
            }
          } catch (err) {
            console.error("❌ Error adding ICE candidate:", err);
          }
          break;
        }

        case WSGeneral.UserLeftWSEvent: {
          const leftUserId = msg.data.userId;
          console.log("👋 User left:", leftUserId);

          const peerData = peerConnectionsRef.current.get(leftUserId);
          if (peerData) {
            peerData.connection.close();
            peerConnectionsRef.current.delete(leftUserId);
          }

          const audio = remoteAudiosRef.current.get(leftUserId);
          if (audio) {
            audio.pause();
            audio.srcObject = null;
            remoteAudiosRef.current.delete(leftUserId);
          }

          iceCandidateQueueRef.current.delete(leftUserId);
          isNegotiatingRef.current.delete(leftUserId);

          setParticipants((prev) => prev.filter((id) => id !== leftUserId));
          break;
        }
      }
    },
    [userId, createPeerConnection, sendMessage, processQueuedCandidates]
  );

  const connect = useCallback(async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log("🚀 Connecting...", { roomId, userId });

    try {
      setError(null);
      await initializeAudio();

      const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;
      const url = `${gateway}/ws?token=${token}`;

      const ws = WSConnect(url);
      socketRef.current = ws;

      const handleOpen = () => {
        console.log("✅ WebSocket opened");
        setIsConnected(true);

        if (!hasJoinedRef.current) {
          sendMessage(WSGeneral.UserJoinedWSEvent, {
            roomId,
            userId,
          });
          hasJoinedRef.current = true;
        }
      };

      const handleClose = () => {
        console.log("❌ WebSocket closed");
        setIsConnected(false);
        hasJoinedRef.current = false;
      };

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("close", handleClose);

      if (ws.readyState === WebSocket.OPEN) {
        handleOpen();
      }
    } catch (err) {
      console.error("❌ Connection error:", err);
      setError("Cannot start the call");
    }
  }, [roomId, token, userId, initializeAudio, handleMessage, sendMessage]);

  const disconnect = useCallback(() => {
    console.log("🛑 Disconnecting...");

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      sendMessage(WSGeneral.UserLeftWSEvent, {
        roomId,
        userId,
      });
    }

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
      audio.srcObject = null;
    });
    remoteAudiosRef.current.clear();

    if (socketRef.current) {
      socketRef.current = null;
    }

    iceCandidateQueueRef.current.clear();
    queuedOffersRef.current = [];
    isNegotiatingRef.current.clear();

    setIsConnected(false);
    setParticipants([]);
    setIsMuted(false);
    hasJoinedRef.current = false;
  }, [roomId, userId, sendMessage]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log("🎤 Muted:", !audioTrack.enabled);
      }
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isMuted,
    error,
    participants,
    connect,
    disconnect,
    toggleMute,
  };
};
