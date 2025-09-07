import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const body = await request.json();

  console.log("Token from cookies:", token);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEETING_SCHEDULER_SERVICE}/api/v1/meeting/start`,
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
  return new Response(JSON.stringify(data), { status: 200 });
}
