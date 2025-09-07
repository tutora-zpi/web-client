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
import { User } from "@/types/user";
import { useEffect, useState } from "react";

export function CreateRoomDialog({ userId }: { userId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`api/users/search/${searchTerm}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.content.filter((user: User) => user.id !== userId));
      });
  }, [searchTerm, userId]);

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
                <div key={user.id} className="p-2 border-b last:border-0">
                  <div className="font-medium">
                    {user.name} {user.surname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
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
