import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Link from "next/link";
import ThemeModeToggle from "@/components/theme-mode-toggle";
import { ChatMessage } from "@/types/meeting";
import Chat from "./chat";
import Board from "./board";
import VoiceConnection from "./voice-connection";
import { cookies } from "next/headers";
import { User } from "@/types/user";

const getChatMessages = async (meetingId: string): Promise<ChatMessage[]> => {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_NEXT_JS_API_URL + "/auth/me"}/chats/${meetingId}`
  );
  const chatData = await data.json();
  return chatData.data;
};

export const getUser = async (): Promise<User> => {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_NEXT_JS_API_URL}/auth/me`
  );
  const user = await data.json();
  return user;
};

export default async function Meeting({ meetingId }: { meetingId: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  const user = await getUser();
  const chatData = await getChatMessages(meetingId);

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
            token={token}
            chatMessages={chatData}
          />
        </div>
      </div>
    </>
  );
}
