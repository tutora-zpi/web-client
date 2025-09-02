"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AudioLines, Copy, Mic, MicOff, Volume2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import ThemeModeToggle from "@/components/theme-mode-toggle";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useVoiceCall } from "@/hooks/useVoiceCall";
import { ChatMessage } from "@/types/meeting";
import Loading from "@/app/meeting/[slug]/loading";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../excelidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function Meeting({ meetingId }: { meetingId: string }) {
  const { user, token } = useAuth();
  const [chatData, setChatData] = useState<ChatMessage[] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    fetch(`/api/chats/${meetingId}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setChatData(data.data);
      });
  }, [meetingId, token]);

  const { messages, sendMessage } = useChat(
    user?.id ?? "",
    token ?? "",
    meetingId
  );

  const {
    isConnected,
    isCallActive,
    isMuted,
    participants,
    startCall,
    endCall,
    toggleMute,
  } = useVoiceCall({ roomId: meetingId });

  const allMessages = [...(chatData ?? []), ...messages];

  const handleSend = () => {
    if (!newMessage.trim() || !user?.id) return;

    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleJoinCall = async () => {
    setHasJoined(true);
    await startCall();
  };

  const handleLeaveCall = () => {
    endCall();
    setHasJoined(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.toString());
  };

  return (
    <>
      <div className="flex justify-between items-center m-2">
        <div className="flex justify-center items-center gap-2">
          <h2>Meeting</h2>
          <Button onClick={copyToClipboard} size="icon" variant="ghost">
            <Copy />
          </Button>
        </div>
        <ThemeModeToggle />
      </div>
      <div className="flex md:flex-row md:justify-between flex-col justify-center items-center mt-2">
        <div className="w-4/5 md:w-3/4  h-140 m-2 flex flex-col justify-between">
          <Suspense fallback={<Loading />}>
            <div className="h-130">
              <ExcalidrawWrapper sessionId={meetingId} />
            </div>
          </Suspense>
          <div className="flex justify-between items-center mt-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <div className="flex justify-center items-center gap-2">
              {isConnected && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}

              {isCallActive && (
                <div className="text-sm text-gray-400">
                  Call participants: {participants.length + 1}
                </div>
              )}
            </div>
            <div className="flex justify-center items-center gap-2">
              {!hasJoined ? (
                <Button variant="secondary" onClick={handleJoinCall}>
                  <AudioLines /> Join with voice
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleLeaveCall}
                  >
                    <Volume2 />
                  </Button>
                  <Button variant="secondary" size="icon" onClick={toggleMute}>
                    {isMuted ? <MicOff /> : <Mic />}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="w-4/5 md:w-1/4 flex flex-col m-2 h-140 justify-between">
          <h2 className="text-center">Chat</h2>
          <div className="overflow-y-auto h-100 border p-2 rounded">
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
