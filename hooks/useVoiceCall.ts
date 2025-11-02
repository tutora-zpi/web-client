import { WSConnect } from "@/lib/websocket/ws-connect";
import { WSGeneral, WSRTC } from "@/types/websocket";
import { useEffect, useRef, useState } from "react";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC(userId: string, token: string, meetingID: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const hasJoinedRef = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const participantsRef = useRef<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const createPeerConnection = async (
      targetUserId: string,
      shouldCreateOffer: boolean
    ) => {
      const peerConnection = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current.set(targetUserId, peerConnection);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      peerConnection.ontrack = (event) => {
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().catch((err) => {
          console.error("Error playing remote audio:", err);
        });
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              name: WSRTC.IceCandidateWSEvent,
              data: {
                candidate: event.candidate,
                to: targetUserId,
                from: userId,
              },
            })
          );
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === "failed" ||
          peerConnection.connectionState === "disconnected"
        ) {
          handleUserLeft(targetUserId);
        }
      };

      if (shouldCreateOffer) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              name: WSRTC.OfferWSEvent,
              data: {
                offer: offer,
                to: targetUserId,
                from: userId,
              },
            })
          );
        }
      }

      return peerConnection;
    };

    const handleOffer = async (
      offer: RTCSessionDescriptionInit,
      fromUserId: string
    ) => {
      let peerConnection = peerConnectionsRef.current.get(fromUserId);

      if (!peerConnection) {
        peerConnection = await createPeerConnection(fromUserId, false);
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            name: WSRTC.AnswerWSEvent,
            data: {
              answer: answer,
              to: fromUserId,
              from: userId,
            },
          })
        );
      }
    };

    const handleAnswer = async (
      answer: RTCSessionDescriptionInit,
      fromUserId: string
    ) => {
      const peerConnection = peerConnectionsRef.current.get(fromUserId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleIceCandidate = async (
      candidate: RTCIceCandidateInit,
      fromUserId: string
    ) => {
      try {
        const peerConnection = peerConnectionsRef.current.get(fromUserId);
        if (peerConnection && candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error handling ICE candidate:", err);
      }
    };

    const handleUserLeft = (leftUserId: string) => {
      const peerConnection = peerConnectionsRef.current.get(leftUserId);
      if (peerConnection) {
        peerConnection.close();
        peerConnectionsRef.current.delete(leftUserId);
      }
      setParticipants((prev) => prev.filter((id) => id !== leftUserId));
    };

    const handleMessage = async (event: MessageEvent) => {
      const msg = JSON.parse(event.data);

      switch (msg.name) {
        case WSGeneral.RoomUsersWSEvent:
          if (msg.data.users) {
            const newParticipants: string[] = msg.data.users;
            const oldParticipants = participantsRef.current;

            const joinedUsers = newParticipants.filter(
              (p) => p !== userId && !oldParticipants.includes(p)
            );

            const leftUsers = oldParticipants.filter(
              (p) => !newParticipants.includes(p)
            );

            setParticipants(newParticipants);

            leftUsers.forEach((leftUserId) => {
              handleUserLeft(leftUserId);
            });

            for (const newUserId of joinedUsers) {
              if (!peerConnectionsRef.current.has(newUserId)) {
                await createPeerConnection(newUserId, true);
              }
            }
          }
          break;

        case WSRTC.OfferWSEvent:
          await handleOffer(msg.data.offer, msg.data.from);
          break;

        case WSRTC.AnswerWSEvent:
          await handleAnswer(msg.data.answer, msg.data.from);
          break;

        case WSRTC.IceCandidateWSEvent:
          await handleIceCandidate(msg.data.candidate, msg.data.from);
          break;

        case WSGeneral.UserLeftWSEvent:
          if (msg.data.userId) {
            handleUserLeft(msg.data.userId);
          }
          break;
      }
    };

    const handleOpen = () => {
      if (hasJoinedRef.current) return;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            name: WSGeneral.UserJoinedWSEvent,
            data: { roomId: meetingID, userId },
          })
        );
        hasJoinedRef.current = true;
        setIsConnected(true);
        setIsConnecting(false);
      }
    };

    const handleLeave = () => {
      if (!hasJoinedRef.current) return;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            name: WSGeneral.UserLeftWSEvent,
            data: { roomId: meetingID, userId },
          })
        );
      }
      hasJoinedRef.current = false;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
    };

    const init = async () => {
      setIsConnecting(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      if (!mounted) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      localStreamRef.current = stream;

      const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;
      const url = `${gateway}/ws?token=${token}`;
      const ws = WSConnect(url);
      wsRef.current = ws;

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("message", handleMessage);

      handleOpen();
    };

    init();

    return () => {
      mounted = false;
      handleLeave();

      wsRef.current?.removeEventListener("open", handleOpen);
      wsRef.current?.removeEventListener("message", handleMessage);
    };
  }, [userId, token, meetingID]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return {
    isConnected,
    isMuted,
    participants,
    isConnecting,
    toggleMute,
  };
}
