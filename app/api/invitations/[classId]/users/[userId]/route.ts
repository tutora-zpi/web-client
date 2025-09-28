import { cookies } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ classId: string; userId: string }> }
) {
  const { classId, userId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/invitations/${classId}/users/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 404) {
    return new Response(
      JSON.stringify({ error: "Failed to invite the user." }),
      { status: 404 }
    );
  }

  if (response.status === 409) {
    return new Response(
      JSON.stringify({
        error: "You have already sent an invitation to this user.",
      }),
      { status: 409 }
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
