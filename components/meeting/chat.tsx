"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/meeting";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { MessageCircleX, Paperclip, ArrowUp } from "lucide-react";
import Message from "./message";
import { User } from "@/types/user";
import { toast } from "sonner";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

const formSchema = z.object({
  message: z.string(),
});

const MESSAGES_LIMIT = 10;
const MAX_FILE_SIZE = 10_000_000;

const toSeconds = (v: string | number | undefined): number | undefined => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "number") return Math.floor(v);
  const ms = Date.parse(String(v));
  if (!isNaN(ms)) return Math.floor(ms / 1000);
  const n = Number(v);
  return isNaN(n) ? undefined : Math.floor(n);
};

const getChatMessages = async (
  meetingId: string,
  token: string,
  lastMessageId?: string
) => {
  const params = lastMessageId ? `?lastMessageId=${lastMessageId}` : "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/${meetingId}/messages${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  const chatData = await response.json();
  return chatData.success ? chatData.data : [];
};

export default function Chat({
  meetingId,
  userId,
  token,
  users,
}: {
  meetingId: string;
  userId: string | undefined;
  token: string;
  users: User[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", meetingId],
    queryFn: ({ pageParam }) => getChatMessages(meetingId, token, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.length >= MESSAGES_LIMIT) {
        return lastPage[0].id;
      }
      return undefined;
    },
    initialPageParam: undefined,
  });

  const chatMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flat()
      .map((m) => ({ ...m, sentAt: toSeconds(m.sentAt) }));
  }, [data]);

  const { messages, sendMessage, addReaction } = useChat(
    userId ?? "",
    token,
    meetingId,
    chatMessages
  );

  const allMessages = useMemo(() => {
    const combined = [...chatMessages, ...messages];
    const uniqueMessages = new Map<string, ChatMessage>();

    combined.forEach((raw) => {
      const message: ChatMessage = {
        ...raw,
        sentAt: toSeconds(raw.sentAt),
      } as ChatMessage;
      uniqueMessages.set(message.id, message);
    });

    return Array.from(uniqueMessages.values()).sort(
      (a, b) => Number(a.sentAt ?? 0) - Number(b.sentAt ?? 0)
    );
  }, [chatMessages, messages]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (isInitialLoadRef.current && allMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialLoadRef.current = false;
    }
  }, [allMessages]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async (message: string) => {
    if (!selectedFile || !userId) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("content", message);
    formData.append("senderId", userId);
    formData.append("chatId", meetingId);
    formData.append("sentAt", Math.floor(Date.now() / 1000).toString());

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/${meetingId}/upload-file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      toast.success("File uploaded successfully");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const messageText = values.message.trim();

    if (!selectedFile && !messageText) {
      return;
    }

    if (selectedFile) {
      await uploadFile(messageText);
    } else if (messageText) {
      sendMessage(messageText);
    }

    form.reset();
  };

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto border p-2 rounded flex flex-col gap-3 h-full"
      >
        {allMessages.length > 0 ? (
          <>
            <div ref={ref} className="h-1">
              {isFetchingNextPage && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  Loading older messages...
                </div>
              )}
            </div>

            {/* Messages */}
            {allMessages.map((message) => {
              const user = users.find((u) => u.id === message.senderId);
              return (
                <Message
                  key={message.id}
                  name={user?.name}
                  surname={user?.surname}
                  message={message.content}
                  avatarUrl={user?.avatarUrl}
                  messageId={message.id}
                  reactions={message.reactions}
                  fileLink={message.fileLink}
                  onAddReaction={addReaction}
                />
              );
            })}

            {/* Scroll anchor at bottom */}
            <div ref={bottomRef} />
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleX />
              </EmptyMedia>
              <EmptyTitle>No Messages Yet</EmptyTitle>
              <EmptyDescription>
                Start chatting by sending your first message.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 mt-2 bg-secondary p-2 rounded-sm"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Type a message..."
                    {...field}
                    className="border-none focus-visible:ring-0"
                    autoFocus
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <div className="flex">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                size="sm"
                variant={selectedFile ? "default" : "outline"}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
                {selectedFile && (
                  <span className="ml-2 max-w-[150px] truncate">
                    {selectedFile.name}
                  </span>
                )}
              </Button>
            </div>

            <Button type="submit" size="sm">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
