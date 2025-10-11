import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const body = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/invitations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

  if (response.status === 500) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        body: await response.text(),
      }),

      { status: 500 }
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
