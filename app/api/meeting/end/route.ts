import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const body = await request.json();

  await fetch(
    `${process.env.NEXT_PUBLIC_MEETING_SCHEDULER_SERVICE}/api/v1/meeting/end`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return new Response(null, { status: 204 });
}
