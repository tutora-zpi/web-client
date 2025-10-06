"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { UserRoundCheck } from "lucide-react";

export function UsersDropdown({ users }: { users: User[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <UserRoundCheck />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 bg-secondary rounded-xl p-2">
        <DropdownMenuGroup className="flex flex-col gap-2">
          {users.map((user) => (
            <DropdownMenuItem key={user.id}>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    className="rounded-full h-6 w-6"
                    src={user.avatarUrl}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    {user.name} {user.surname}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
