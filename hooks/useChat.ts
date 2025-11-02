import { WSConnect } from "@/lib/websocket/ws-connect";
import { ChatMessage, Reaction } from "@/types/meeting";
import { WSChat, WSGeneral } from "@/types/websocket";
import { useEffect, useRef, useState } from "react";

export function useChat(
  userId: string,
  token: string,
  meetingID: string,
  initialMessages: ChatMessage[]
) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const wsRef = useRef<WebSocket | null>(null);
  const hasJoinedRef = useRef(false);

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
        case WSChat.SendMessageWSEvent: {
          const d = msg.data;
          const chatMessage: ChatMessage = {
            id: d.messageId,
            senderId: d.senderId,
            sentAt: d.sentAt,
            content: d.content,
          };
          setMessages((prev) => [...prev, chatMessage]);
          break;
        }
        case WSChat.ReactOnMessageWSEvent: {
          const reaction: Reaction = msg.data;
          setMessages((prev) =>
            prev.map((m) =>
              m.id !== reaction.messageId
                ? m
                : { ...m, reactions: [...(m.reactions ?? []), reaction] }
            )
          );
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

  const sendMessage = (content: string) => {
    wsRef.current?.send(
      JSON.stringify({
        name: WSChat.SendMessageWSEvent,
        data: {
          content,
          senderId: userId,
          chatId: meetingID,
          sentAt: Math.floor(Date.now() / 1000),
        },
      })
    );
  };

  const addReaction = (emoji: string, messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    const exists = msg.reactions?.some(
      (r) => r.emoji === emoji && r.userId === userId
    );
    if (exists) return;

    wsRef.current?.send(
      JSON.stringify({
        name: WSChat.ReactOnMessageWSEvent,
        data: { emoji, chatId: meetingID, userId, messageId },
      })
    );
  };

  return { messages, sendMessage, addReaction };
}
