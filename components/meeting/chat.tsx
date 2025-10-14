"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/meeting";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useMemo } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { MessageCircleX } from "lucide-react";
import Message from "./message";
import { User } from "@/types/user";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

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
    meetingId
  );

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage(values.message);
    form.reset();
  }

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <div className="overflow-y-auto border p-2 rounded flex flex-col gap-2">
        {allMessages.length > 0 ? (
          allMessages.map((message) => {
            const user = users.find((user) => user.id === message.sender);
            console.log(message.id);
            return (
              <Message
                key={message.id}
                name={user?.name}
                surname={user?.surname}
                message={message.content}
                avatarUrl={user?.avatarUrl}
                reactions={message.reactions}
                messageId={message.id}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mt-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="type here." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            Send message
          </Button>
        </form>
      </Form>
    </div>
  );
}
