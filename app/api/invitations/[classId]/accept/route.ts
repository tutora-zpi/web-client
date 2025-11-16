import { cookies } from "next/headers";

const updateChat = async (
  token: string,
  chatId: string,
  memberIds: string[]
) => {
  const requestBody = {
    chatId,
    MembersIDs: memberIds,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/update-members`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  return await response.json();
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/invitations/${classId}/accept`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 404) {
    return new Response(
      JSON.stringify({ error: "Failed to accept the invitation." }),
      { status: 404 }
    );
  }
  await updateChat(token, classId, body.memberIds);

  return new Response(null, { status: 200 });
}
