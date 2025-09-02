import { User } from "@/types/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUser(): Promise<(User & { token: string }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch("http://localhost:8080/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const user: User = await response.json();
    return { ...user, token };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
