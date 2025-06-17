import { logout } from "@/app/auth/logout/action";
import { Button } from "./ui/button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="destructive">
        Wyloguj
      </Button>
    </form>
  );
}
