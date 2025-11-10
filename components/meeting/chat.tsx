"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/meeting";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useMemo, useRef, useState } from "react";
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

const formSchema = z
  .object({
    message: z.string(),
  })
  .refine(
    () => {
      return true;
    },
    {
      message: "Message or file required",
    }
  );

export default function Chat({
  meetingId,
  userId,
  token,
  chatMessages,
  users,
}: {
  meetingId: string;
  userId: string | undefined;
  token: string;
  chatMessages: ChatMessage[];
  users: User[];
}) {
  const { messages, sendMessage, addReaction } = useChat(
    userId ?? "",
    token,
    meetingId,
    chatMessages
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const allMessages = useMemo(() => {
    const messageMap = new Map<string, ChatMessage>();
    chatMessages.forEach((msg) => messageMap.set(msg.id, msg));
    messages.forEach((msg) => messageMap.set(msg.id, msg));
    return Array.from(messageMap.values());
  }, [chatMessages, messages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = async (message: string) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("content", message);
    formData.append("senderId", userId ?? "");
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
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      setSelectedFile(null);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedFile && !values.message.trim()) {
      return;
    }

    if (selectedFile) {
      uploadFile(values.message);
    } else {
      sendMessage(values.message);
    }

    form.reset();
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="overflow-y-auto border p-2 rounded flex flex-col gap-3 h-full">
        {allMessages.length > 0 ? (
          allMessages.map((message) => {
            const user = users.find((user) => user.id === message.senderId);
            return (
              <Message
                key={message.sentAt}
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
          })
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
      <div />
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
                    placeholder="type here."
                    {...field}
                    className="border-none active:border-none focus-visible:ring-0 focus-visible:border-none"
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10_000_000) {
                      toast.error("File too large. Maximum size is 10MB");
                      setSelectedFile(null);
                    }
                    setSelectedFile(file);
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip />
                {selectedFile ? selectedFile.name : ""}
              </Button>
            </div>
            <Button type="submit" size="sm">
              <ArrowUp />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
