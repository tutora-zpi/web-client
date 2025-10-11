import { Button } from "./ui/button";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { tutoraInfo } from "@/lib/config";
import { LibraryBig, School } from "lucide-react";
import Notifications from "./notifications/notifications";
import { cookies } from "next/headers";

export async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getUser();

  return (
    <div className="p-4 flex justify-between items-center border-b-2">
      <div className="flex justify-center items-center gap-2">
        <Link href="/" className="font-bold md:text-xl">
          {tutoraInfo.name}
        </Link>
      </div>
      <div className="flex justify-center items-center gap-3">
        {user ? (
          <>
            <Notifications token={token!} />
            <Button
              asChild
              variant="secondary"
              className="hidden md:inline-flex"
            >
              <Link href="/dashboard/invitations">
                <LibraryBig /> Invitations
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="md:hidden"
              size="icon"
            >
              <Link href="/dashboard/invitations">
                <LibraryBig />
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="hidden md:inline-flex"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="md:hidden"
              size="icon"
            >
              <Link href="/dashboard">
                <School />
              </Link>
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
