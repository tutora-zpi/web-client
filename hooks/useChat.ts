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
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

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
        case WSChat.SendMessageWSEvent:
        case WSChat.SendFileMessageEvent: {
          const d = msg.data;
          const chatMessage: ChatMessage = {
            id: d.messageId,
            senderId: d.senderId,
            sentAt: d.sentAt,
            content: d.content,
            fileLink: d.fileLink ?? undefined,
            fileName: d.fileName ?? undefined,
          };
          setMessages((prev) => [...prev, chatMessage]);
          break;
        }

        case WSChat.ReplyOnMessageWSEvent: {
          const d = msg.data;
          setMessages((prev) => {
            const originalMessage = prev.find(
              (m) => m.id === d.replyToMessageId
            );

            const chatMessage: ChatMessage = {
              id: d.messageId,
              senderId: d.senderId,
              sentAt: d.sentAt,
              content: d.content,
              fileLink: d.fileLink ? d.fileLink : undefined,
              replyToMessageId: d.replyToMessageId,
              replyToMessageContent: originalMessage?.content,
            };

            return [...prev, chatMessage];
          });
          break;
        }
        case WSChat.ReactOnMessageWSEvent: {
          const reaction: Reaction = msg.data;
          setMessages((prev) =>
            prev.map((m) =>
              m.id !== reaction.messageId
                ? m
                : {
                  ...m,
                  reactions: [
                    ...(m.reactions?.filter(
                      (r) => r.userId !== reaction.userId
                    ) ?? []),
                    reaction,
                  ],
                }
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

  const replyToMessage = (messageId: string, content: string) => {
    wsRef.current?.send(
      JSON.stringify({
        name: WSChat.ReplyOnMessageWSEvent,
        data: {
          replyToMessageId: messageId,
          content: content,
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

    wsRef.current?.send(
      JSON.stringify({
        name: WSChat.ReactOnMessageWSEvent,
        data: { emoji, chatId: meetingID, userId, messageId },
      })
    );
  };

  return {
    messages,
    sendMessage,
    addReaction,
    replyToMessage,
    replyingTo,
    setReplyingTo,
  };
}
