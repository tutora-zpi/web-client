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

    if (ws.readyState === WebSocket.OPEN) {
      if (!hasJoinedRef.current) {
        const joinMsg = {
          name: WSGeneral.UserJoinedWSEvent,
          data: {
            roomId: meetingID,
            userId: userId,
          },
        };
        ws.send(JSON.stringify(joinMsg));
        hasJoinedRef.current = true;
      }
    }

    const handleOpen = () => {
      if (!hasJoinedRef.current) {
        const joinMsg = {
          name: WSGeneral.UserJoinedWSEvent,
          data: {
            roomId: meetingID,
            userId: userId,
          },
        };
        ws.send(JSON.stringify(joinMsg));
        hasJoinedRef.current = true;
      }
    };

    const handleMessage = (event: MessageEvent) => {
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
        case WSChat.ReactOnMessageWSEvent: {
          const reaction: Reaction = msg.data;

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== reaction.messageId) return m;

              const existing = Array.isArray(m.reactions) ? m.reactions : [];
              return { ...m, reactions: [...existing, reaction] };
            })
          );
          break;
        }
        default:
          console.warn(`Unknown event type: ${msg.name}`);
      }
    };

    const handleClose = () => {
      console.log("WebSocket disconnected");
      hasJoinedRef.current = false;
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", handleClose);

    // const pingInterval = setInterval(() => {
    //   if (ws.readyState === WebSocket.OPEN) {
    //     ws.send(`{"event":"ping"}`);
    //   }
    // }, 2900);

    return () => {
      // clearInterval(pingInterval);
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("close", handleClose);
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
