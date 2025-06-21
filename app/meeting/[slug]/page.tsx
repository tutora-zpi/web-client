"use client";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Mic } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import Loading from "./loading";
import { useParams } from "next/navigation";
import { ChatData } from "@/types/meeting";
import { useChat } from "@/hooks/useChat";
import { Input } from "@/components/ui/input";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../../../components/excelidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function Page() {
  const { user, token } = useAuth();
  const params = useParams();
  const slug = params.slug;
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/chats/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setChatData(data);
      });
  }, [slug, token]);

  const { messages, sendMessage } = useChat(
    user?.id ?? "",
    token ?? "",
    slug as string
  );

  const allMessages = [...(chatData?.messages ?? []), ...messages];

  const handleSend = () => {
    if (!newMessage.trim() || !user?.id) return;

    sendMessage(newMessage, user.id);
    setNewMessage("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.toString());
  };

  return (
    <>
      <div className="flex justify-center items-center mt-2 gap-2">
        <h2>Meeting</h2>
        <Button onClick={copyToClipboard} size="icon" variant="ghost">
          <Copy />
        </Button>
      </div>
      <div className="flex md:flex-row md:justify-between flex-col justify-center items-center mt-2">
        <div className="w-4/5 md:w-3/4  h-140 m-2 flex flex-col justify-between">
          <Suspense fallback={<Loading />}>
            <div className="h-130">
              <ExcalidrawWrapper sessionId={slug} />
            </div>
          </Suspense>
          <div className="flex justify-between items-center mt-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button variant="secondary" size="icon">
              <Mic />
            </Button>
          </div>
        </div>
        <div className="w-4/5 md:w-1/4 flex flex-col m-2 h-140 justify-between">
          <h2 className="text-center">Chat</h2>
          <div className="overflow-y-auto h-80 border p-2 rounded">
            {allMessages.length > 0 ? (
              allMessages.map((message) => (
                <div key={message.id} className="mb-1">
                  <strong>
                    {message.sender === user?.id ? `You` : `Guest`}:
                  </strong>{" "}
                  {message.content}
                </div>
              ))
            ) : (
              <p className="text-center">No messages yet.</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex flex-col w-full gap-2 h-f"
          >
            <Input
              placeholder="type here."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit">Send message</Button>
          </form>
        </div>
      </div>
    </>
  );
}
