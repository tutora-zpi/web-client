import { logout } from "@/app/auth/logout/action";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function LogoutButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Logout</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form action={logout}>
          <DialogHeader>
            <DialogTitle>Are you sure that you want to logout?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="mt-10">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              Logout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
