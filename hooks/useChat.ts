import { ChatMessage, Reaction, SentChatMessage } from "@/types/meeting";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useChat(userId: string, token: string, meetingID: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_CHAT_SERVICE}/ws/chat`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", { roomID: meetingID });
    });

    socket.on("message", (msg: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) {
          return prev.map((m) => (m.id === msg.id ? msg : m));
        }
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, meetingID]);

  const sendMessage = (content: string) => {
    const message: SentChatMessage = {
      content,
      meetingID,
      senderID: userId,
    };
    socketRef.current?.emit("sendMessage", message);
  };

  const addReaction = (emoji: string, messageID: string) => {
    const reaction: Reaction = {
      emoji,
      chatID: meetingID,
      userID: userId,
      messageID: messageID,
    };
    socketRef.current?.emit("react", reaction);
  };

  return { messages, sendMessage, addReaction };
}
