import { getUser } from "@/lib/auth";
import { StartMeetingDTO } from "@/types/meeting";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const requestBody: StartMeetingDTO = {
    members: [
      {
        id: user.id,
        firstName: user.email,
        lastName: user.email || "User",
        avatarURL:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fnobita.me%2",
      },
      {
        id: user.id,
        firstName: user.email,
        lastName: user.email || "User",
        avatarURL:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fnobita.me%2",
      },
    ],
  };

  try {
    const res = await fetch("http://localhost:8003/api/v1/meeting/start", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Meeting start error:", error);
    return NextResponse.json(
      { error: "Failed to start meeting" },
      { status: 500 }
    );
  }
}
