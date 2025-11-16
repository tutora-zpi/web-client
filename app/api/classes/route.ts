import { CreateChatDTO } from "@/types/class";

import { cookies } from "next/headers";

const createChat = async (token: string, roomId: string, members: string[]) => {
  const requestBody: CreateChatDTO = {
    classId: roomId,
    memberIds: members,
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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/classes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  await createChat(token, data.id, body.members);

  return new Response(JSON.stringify(data), { status: 200 });
}
