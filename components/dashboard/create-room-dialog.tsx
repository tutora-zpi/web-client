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
import { useState } from "react";
import { CreateRoomButton } from "./create-room-button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function CreateRoomDialog() {
  const [roomName, setRoomName] = useState("");

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild className="aspect-square">
          <button className="w-full h-full justify-center flex items-center">
            <Card className="hover:cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/10 w-full h-full flex items-center justify-center">
              <CardContent>
                <Plus className="h-24 w-24 text-gray-400  group-hover:text-primary dark:text-gray-600" />
              </CardContent>
            </Card>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Classroom</DialogTitle>
            <DialogDescription>
              Create a new classroom by entering its name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Classroom Name</Label>
              <Input
                id="name-1"
                name="name"
                placeholder="enter classroom name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <CreateRoomButton roomName={roomName} />
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
