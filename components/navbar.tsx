import { Button } from "./ui/button";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { tutoraInfo } from "@/lib/config";
import { UsersRound } from "lucide-react";
import Notifications from "./notifications/notifications";
import { cookies } from "next/headers";

export async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getUser();

  return (
    <div className="p-4 flex justify-between items-center border-b-2">
      <div className="flex justify-center items-center gap-2">
        <Link href="/" className="text-xl font-bold">
          {tutoraInfo.name}
        </Link>
      </div>
      <div className="flex justify-center items-center gap-3">
        {user ? (
          <>
            <Notifications token={token!} />
            <Button asChild variant="secondary">
              <Link href="/dashboard/invitations">
                <UsersRound />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <LogoutButton />
          </>
        ) : (
          <Button asChild variant="secondary">
            <Link href="/login">Login</Link>
          </Button>
        )}
        <ThemeModeToggle />
      </div>
    </div>
  );
}
