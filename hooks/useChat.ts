import socketManager from "@/lib/websocket/socket-manager";
import { ChatMessage } from "@/types/meeting";
import { WSChat, WSGeneral } from "@/types/websocket";
import { useEffect, useState } from "react";

interface ChatMessageData {
  messageId: string;
  senderId: string;
  sentAt: number;
  content: string;
}

interface ChatMessageEvent {
  name: WSChat.SendMessageWSEvent;
  data: ChatMessageData;
}

export function useChat(userId: string, token: string, meetingID: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const gateway = process.env.NEXT_PUBLIC_WEBSOCKET_GATEWAY!;

    socketManager.connect(`${gateway}/ws?token=${token}`).then(() => {
      const joinMsg = {
        name: WSGeneral.UserJoinedWSEvent,
        data: {
          roomId: meetingID,
          userId: userId,
        },
      };
      socketManager.send(joinMsg);
    });

    const handleChatMessage = (msg: any) => {
      const chatMessage = msg.data;
      console.log(chatMessage);
      const chatMessageParsed: ChatMessage = {
        id: chatMessage.messageId,
        senderId: chatMessage.senderId,
        sentAt: chatMessage.sentAt,
        content: chatMessage.content,
      };
      setMessages((prev) => [...prev, chatMessageParsed]);
    };

    socketManager.on(WSChat.SendMessageWSEvent, handleChatMessage);

    const pingInterval = setInterval(() => {
      socketManager.send({ event: "ping" });
    }, 2900);

    return () => {
      clearInterval(pingInterval);
      socketManager.off(WSChat.SendMessageWSEvent, handleChatMessage);
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
    socketManager.send(message);
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
    socketManager.send(reaction);
  };

  return { messages, sendMessage, addReaction };
}
