import { Button } from "@/components/ui/button";
import Link from "next/link";
import ThemeModeToggle from "@/components/theme-mode-toggle";
import { ChatMessage } from "@/types/meeting";
import Chat from "./chat";
import Board from "./board";
import VoiceConnection from "./voice-connection";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { CopyUrlButton } from "./copy-url-button";

const getChatMessages = async (meetingId: string): Promise<ChatMessage[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/${meetingId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const chatData = await response.json();
  if (chatData.success === true) {
    return chatData.data;
  }
  return [];
};

export default async function Meeting({ meetingId }: { meetingId: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await requireAuth();
  const chatData = await getChatMessages(meetingId);

  return (
    <>
      <div className="flex justify-between items-center m-2">
        <div className="flex justify-center items-center gap-2">
          <h2>Meeting</h2>
          <CopyUrlButton />
        </div>
        <ThemeModeToggle />
      </div>
      <div className="flex md:flex-row md:justify-between flex-col justify-center items-center mt-2">
        <div className="w-4/5 md:w-3/4  h-140 m-2 flex flex-col justify-between">
          <Board meetingId={meetingId} />
          <div className="flex justify-between items-center mt-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <VoiceConnection meetingId={meetingId} />
          </div>
        </div>
        <div className="w-4/5 md:w-1/4 flex flex-col m-2 h-140 justify-between">
          <Chat
            meetingId={meetingId}
            userId={user?.id}
            token={token!}
            chatMessages={chatData}
          />
        </div>
      </div>
    </>
  );
}
