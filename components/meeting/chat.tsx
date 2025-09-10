"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types/meeting";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export default function Chat({
  meetingId,
  userId,
  token,
  chatMessages,
}: {
  meetingId: string;
  userId: string | undefined;
  token: string;
  chatMessages: ChatMessage[];
}) {
  const { messages, sendMessage } = useChat(userId ?? "", token, meetingId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const allMessages = [...chatMessages, ...messages];

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage(values.message);
    form.reset();
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <h2 className="text-center">Chat</h2>
      <div className="overflow-y-auto h-100 border p-2 rounded">
        {allMessages.length > 0 ? (
          allMessages.map((message, idx) => (
            <div key={`${message.sender}-${idx}`} className="mb-1">
              <strong>{message.sender === userId ? `You` : `Guest`}:</strong>{" "}
              {message.content}
            </div>
          ))
        ) : (
          <p className="text-center">No messages yet.</p>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
