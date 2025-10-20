import { ChatMessage } from "@/types/meeting";
import { WSChat, WSGeneral } from "@/types/websocket";
import { useEffect, useRef, useState } from "react";

export function useChat(userId: string, token: string, meetingID: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;
    const ws = new WebSocket(`${gateway}/ws?token=${token}`);

    wsRef.current = ws;

    ws.onopen = () => {
      const joinMsg = {
        name: WSGeneral.UserJoinedWSEvent,
        data: {
          roomId: meetingID,
          userId: userId,
        },
      };
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.name) {
        case WSChat.SendMessageWSEvent: {
          const chatMessage = msg.data;
          const chatMessageParsed: ChatMessage = {
            id: chatMessage.messageId,
            senderId: chatMessage.senderId,
            sentAt: chatMessage.sentAt,
            content: chatMessage.content,
          };
          setMessages((prev) => [...prev, chatMessageParsed]);
          break;
        }
        default:
          console.warn(`Unknown event type: ${msg.name}`);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`{"event":"ping"}`);
      }
    }, 2900);

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, meetingID, userId]);

  const sendMessage = (content: string) => {
    const message = {
      name: WSChat.SendMessageWSEvent,
      data: {
        content,
        senderId: userId,
        chatId: meetingID,
        sentAt: Math.floor(Date.now() / 1000),
      },
    };
    wsRef.current?.send(JSON.stringify(message));
  };

  const addReaction = (emoji: string, messageID: string) => {
    const reaction = {
      name: WSChat.ReactOnMessageWSEvent,
      data: {
        emoji,
        chatId: meetingID,
        userId: userId,
        messageId: messageID,
      },
    };
    wsRef.current?.send(JSON.stringify(reaction));
  };

  return { messages, sendMessage, addReaction };
}
