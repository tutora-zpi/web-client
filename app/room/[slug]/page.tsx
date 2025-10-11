import Chat from "@/components/meeting/chat";
import { Navbar } from "@/components/navbar";
import { EmptyRoom } from "@/components/room/empty-room";
import { InviteUserDialog } from "@/components/room/invite-user-dialog";
import { UsersDropdown } from "@/components/room/users-dropdown";
import { StartMeetingButton } from "@/components/start-meeting-button";
import { requireAuth } from "@/lib/auth";
import { ActiveMeeting, Class, CreateChatDTO, Invitation } from "@/types/class";
import { ChatMessage } from "@/types/meeting";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryBig, Power } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const getUsers = async (userIds: string[]): Promise<User[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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

const getClass = async (id: string): Promise<Class> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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

const getClassInvitations = async (id: string): Promise<Invitation[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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
  classId: string
): Promise<ActiveMeeting | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

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
  members: User[]
): Promise<ChatMessage[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/${roomId}/messages`,
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
  } else {
    await createChat(roomId, members);
  }
  return [];
};

const createChat = async (roomId: string, members: User[]) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const requestBody: CreateChatDTO = {
    roomID: roomId,
    members: [
      {
        id: members[0].id,
        firstName: members[0].name,
        lastName: members[0].surname,
        avatarURL: members[0].avatarUrl,
      },
      {
        id: members[1].id,
        firstName: members[1].name,
        lastName: members[1].surname,
        avatarURL: members[1].avatarUrl,
      },
    ],
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/general`,
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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const host = await requireAuth();

  const data = await getClass(slug);

  const users = await getUsers(data.members.map((member) => member.userId));

  const invitations = await getClassInvitations(slug);

  const activeMeeting = await getActiveMeeting(slug);

  let chatMessages: ChatMessage[] = [];

  if (users.length > 1) {
    chatMessages = await getChatMessages(slug, users);
  }

  return (
    <>
      <Navbar />
      <div className="m-4">
        <div className="flex justify-between gap-2 items-center">
          <div className="flex justify-center items-center gap-2">
            <div>
              <LibraryBig />
            </div>
            <h1 className="text-center text-3xl font-bold">{data.name}</h1>
          </div>
          <div className="flex justify-center items-center gap-2">
            {users.length > 1 && !activeMeeting && (
              <StartMeetingButton
                user={host}
                friend={users.find((user) => user.id !== host.id)!}
                classId={slug}
              />
            )}

            {activeMeeting && (
              <Button asChild variant="outline" className="relative ">
                <div>
                  <Link href={`/meeting/${activeMeeting.meetingId}`}>Join</Link>
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

        <Tabs defaultValue="chat" className="mt-2">
          <div className="flex items-center justify-center">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="chat"
            className="w-full flex justify-center gap-4"
          >
            <div className="min-h-15 w-9/12 ">
              {users.length > 1 ? (
                <Chat
                  meetingId={slug}
                  userId={host.id}
                  token={token!}
                  chatMessages={chatMessages}
                />
              ) : (
                <div className="text-center">
                  <EmptyRoom />
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="notes">
            <div className="flex-1 text-center min-h-15 bg-secondary">
              <h2>Notes Container</h2>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
