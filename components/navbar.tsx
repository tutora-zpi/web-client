import { Button } from "./ui/button";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { tutoraInfo } from "@/lib/config";

export async function Navbar() {
  const user = await getUser();

  return (
    <div className="p-4 flex justify-between items-center border-b-2">
      <div className="flex justify-center items-center gap-2">
        <Link href="/" className="text-xl font-bold">
          {tutoraInfo.name}
        </Link>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Button asChild variant="secondary">
          <Link href="/meeting">Canva</Link>
        </Button>
        {user ? (
          <>
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
