import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chats/${id}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return new Response("Failed to fetch messages", { status: 500 });
  }
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
