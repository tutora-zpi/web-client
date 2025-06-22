import { ReceivedChatMessage, SentChatMessage } from "@/types/meeting";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useChat(userId: string, token: string, meetingID: string) {
  const [messages, setMessages] = useState<ReceivedChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3001/ws/chat", {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", { roomId: meetingID });
    });

    socket.on("message", (msg: ReceivedChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, meetingID]);

  const sendMessage = (content: string, receiverID: string) => {
    const message: SentChatMessage = {
      content,
      meetingID,
      receiverID,
      senderID: userId,
    };
    socketRef.current?.emit("sendMessage", message);
  };

  return { messages, sendMessage };
}
