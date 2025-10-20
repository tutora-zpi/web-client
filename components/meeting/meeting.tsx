import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChatMessage, MeetingData } from "@/types/meeting";
import Chat from "./chat";
import Board from "./board";
import VoiceConnection from "./voice-connection";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User } from "@/types/user";
import { EndMeetingButton } from "./end-meeting-button";

const getChatMessages = async (
  meetingId: string,
  token: string
): Promise<ChatMessage[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chat/${meetingId}/messages`,
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

const getMeetingDetails = async (
  classId: string,
  token: string
): Promise<MeetingData | null> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEETING_SCHEDULER_SERVICE}/api/v1/meeting/${classId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const messageData = await response.json();
  if (messageData.success === true) {
    return messageData.data;
  }
  return null;
};

const getUsers = async (userIds: string[], token: string): Promise<User[]> => {
  const users = await Promise.all(
    userIds.map(async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    })
  );

  return users;
};

export default async function Meeting({
  meetingId,
  classId,
}: {
  meetingId: string;
  classId: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  const user = await requireAuth();
  const chatData = await getChatMessages(meetingId, token);
  const meetingDetails = await getMeetingDetails(classId, token);

  if (!meetingDetails) {
    redirect(`/room/${classId}`);
  }

  const users = await getUsers(
    meetingDetails.members.map((member) => member.id),
    token
  );

  return (
    <>
      <div className="flex items-center m-2">
        <h2>{meetingDetails.title}</h2>
      </div>
      <div className="flex md:flex-row md:justify-between flex-col justify-center items-center mt-2">
        <div className="w-4/5 md:w-3/4  h-140 m-2 flex flex-col justify-between">
          <Board meetingId={meetingId} />
          <div className="flex justify-between items-center mt-2">
            <Button asChild variant="secondary" className="mt-2">
              <Link href={`/room/${classId}`}>Back to class</Link>
            </Button>
            <EndMeetingButton meetingId={meetingId} classId={classId} />
            <VoiceConnection meetingId={meetingId} />
          </div>
        </div>
        <div className="w-4/5 md:w-1/4 flex flex-col m-2 h-140 justify-between">
          <Chat
            meetingId={meetingId}
            userId={user?.id}
            token={token}
            chatMessages={chatData}
            users={users}
          />
        </div>
      </div>
    </>
  );
}
