import Chat from "@/components/meeting/chat";
import { Navbar } from "@/components/navbar";
import { EmptyRoom } from "@/components/room/empty-room";
import { InviteUserDialog } from "@/components/room/invite-user-dialog";
import { UsersDropdown } from "@/components/room/users-dropdown";
import { StartMeetingButton } from "@/components/start-meeting-button";
import { requireAuth } from "@/lib/auth";
import { ActiveMeeting, Class, CreateChatDTO, Invitation } from "@/types/class";
import { ChatMessage, MeetingData } from "@/types/meeting";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryBig } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import PlannedMeetings from "@/components/room/planned-meetings";
import PlanMeetingCalendar from "@/components/room/plan-meetings-calendar";

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

const getClass = async (id: string, token: string): Promise<Class> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/classes/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const classRoom = await response.json();

  return classRoom;
};

const getClassInvitations = async (
  id: string,
  token: string
): Promise<Invitation[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/invitations/classes/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return await response.json();
};

const getActiveMeeting = async (
  classId: string,
  token: string
): Promise<ActiveMeeting | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEETING_SCHEDULER_SERVICE}/api/v1/meeting/${classId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.data ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};

const getChatMessages = async (
  roomId: string,
  members: User[],
  token: string
): Promise<ChatMessage[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chat/${roomId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const chatData = await response.json();
  if (chatData.data) {
    return chatData.data;
  } else {
    await createChat(roomId, members);
  }
  return [];
};

const createChat = async (roomId: string, members: User[]) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const requestBody: CreateChatDTO = {
    classId: roomId,
    memberIds: [members[0].id, members[1].id],
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chat/general`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  return await response.json();
};

const getActiveMeetings = async (
  id: string,
  token: string
): Promise<MeetingData[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEETING_SCHEDULER_SERVICE}/api/v1/meeting/plan/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const meetingsData = await response.json();

  console.log(meetingsData);

  if (meetingsData.success === true) {
    const meetings = meetingsData.data.filter((meeting: MeetingData) => {
      const finishDate = new Date(meeting.finishDate);
      const newDateToIsoString = new Date().toISOString();
      console.log(newDateToIsoString);
      return finishDate > new Date(newDateToIsoString);
    });

    return meetings;
  }

  return [];
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const host = await requireAuth();

  const data = await getClass(slug, token);

  const users = await getUsers(
    data.members.map((member) => member.userId),
    token
  );

  const invitations = await getClassInvitations(slug, token);

  const activeMeeting = await getActiveMeeting(slug, token);

  const meetings = await getActiveMeetings(slug, token);

  let chatMessages: ChatMessage[] = [];

  if (users.length > 1) {
    chatMessages = await getChatMessages(slug, users, token);
  }

  console.log(meetings);

  return (
    <>
      <Navbar />
      <div className="m-4">
        <div className="flex justify-between gap-2 items-center">
          <div className="flex justify-center gap-2 items-center">
            <div>
              <LibraryBig />
            </div>
            <h1 className="text-center text-3xl font-bold">{data.name}</h1>
          </div>

          <div className="flex justify-center items-center gap-2">
            {users.length > 1 && !activeMeeting && (
              <StartMeetingButton members={users} classId={slug} />
            )}

            {activeMeeting && (
              <Button asChild variant="outline" className="relative ">
                <div>
                  <Link
                    href={`/room/${slug}/meeting/${activeMeeting.meetingId}`}
                  >
                    Join
                  </Link>
                  <Badge
                    variant="default"
                    className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center p-1 rounded-full"
                  >
                    Live
                  </Badge>
                </div>
              </Button>
            )}
            <UsersDropdown users={users} />
            <InviteUserDialog
              classId={slug}
              host={host}
              userIds={invitations.map((invitation) => invitation.userId)}
            />
          </div>
        </div>

        <div className="flex w-full justify-around items-start mt-5">
          <div className="flex flex-col items-center gap-2">
            <PlannedMeetings meetings={meetings} />
            <PlanMeetingCalendar
              user={host}
              friend={users.find((user) => user.id !== host.id)!}
              classId={slug}
            />
          </div>

          <Tabs defaultValue="chat" className=" w-3/5">
            <div className="flex items-center justify-start w-full">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="chat"
              className="w-full flex justify-center gap-4"
            >
              <div className="flex-1 h-120 min-w-full">
                {users.length > 1 ? (
                  <Chat
                    meetingId={slug}
                    userId={host.id}
                    token={token!}
                    chatMessages={chatMessages}
                    users={users}
                  />
                ) : (
                  <div className="text-center">
                    <EmptyRoom />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="notes">
              <div className="flex-1 text-center min-h-15 bg-secondary w-full">
                <h2>Notes Container</h2>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
