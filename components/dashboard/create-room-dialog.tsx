"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";
import { StartMeetingButton } from "../start-meeting-button";

export function CreateRoomDialog({ host }: { host: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setUsers([]);
      return;
    }

    fetch(`api/users/search/${debouncedSearch}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.content.filter((user: User) => user.id !== host.id));
      });
  }, [debouncedSearch, host]);

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Create Classroom</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Classroom</DialogTitle>
            <DialogDescription>
              Search through user and create a classroom.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Search</Label>
              <Input
                id="name-1"
                name="name"
                placeholder="find ur friend"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              {users.map((user) => (
                <div key={user.id} className="flex justify-between">
                  <div className="flex items-center gap-2 ">
                    <Avatar>
                      <AvatarImage
                        className="rounded-full h-10 w-10"
                        src={user.avatarUrl}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>
                        {user.name} {user.surname}
                      </p>
                      <p className="text-xs">{user.email}</p>
                    </div>
                  </div>
                  <StartMeetingButton friend={user} user={host} />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
