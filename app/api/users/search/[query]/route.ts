import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: { query: string } }
) {
  const { query } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USER_SERVICE}/users/search?query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
