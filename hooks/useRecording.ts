import { WSConnect } from "@/lib/websocket/ws-connect";
import { WSGeneral, WSRecording } from "@/types/websocket";
import { useEffect, useRef, useState } from "react";

export function useRecording(
  userId: string,
  token: string,
  meetingID: string,
  finishTime: Date
) {
  const wsRef = useRef<WebSocket | null>(null);
  const hasJoinedRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;
    const url = `${gateway}/ws?token=${token}`;
    const ws = WSConnect(url);
    wsRef.current = ws;

    const handleOpen = () => {
      if (hasJoinedRef.current) return;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            name: WSGeneral.UserJoinedWSEvent,
            data: { roomId: meetingID, userId },
          })
        );
        hasJoinedRef.current = true;
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
    };

    const handleMessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data);
      switch (msg.name) {
        case WSRecording.RecordRequestedWSEvent: {
          setIsRecording(true);
          break;
        }
      }
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);

    handleOpen();

    return () => {
      handleLeave();

      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
    };
  }, [token, meetingID, userId]);

  const startRecording = () => {
    wsRef.current?.send(
      JSON.stringify({
        name: WSRecording.RecordRequestedWSEvent,
        data: {
          recordingRequesterId: userId,
          roomId: meetingID,
          finishTime,
        },
      })
    );
  };

  const stopRecording = () => {
    wsRef.current?.send(
      JSON.stringify({
        name: WSRecording.StopRecordingRequestedWSEvent,
        data: {
          roomId: meetingID,
          stopTime: new Date().toISOString(),
        },
      })
    );
  };

  return { isRecording, startRecording, stopRecording };
}
