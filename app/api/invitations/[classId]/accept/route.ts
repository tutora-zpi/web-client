import { cookies } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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

  return new Response(null, { status: 200 });
}
