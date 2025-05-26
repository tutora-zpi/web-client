import { Button } from "./ui/button";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";

export function Navbar() {
  return (
    <div className="p-4 flex justify-between items-center border-b-2">
      <div className="flex justify-center items-center gap-2">
        <Link href="/" className="text-xl font-bold">
          .tutora
        </Link>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Button asChild variant="secondary">
          <Link href="/meeting">Canva</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/log-in">Login</Link>
        </Button>
        <ThemeModeToggle />
      </div>
    </div>
  );
}
