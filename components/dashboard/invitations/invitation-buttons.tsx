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
import { Check, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvitationButtons({
  classId,
  userId,
}: {
  classId: string;
  userId: string;
}) {
  const router = useRouter();

  const acceptInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${classId}/accept`, {
        method: "POST",
        body: JSON.stringify({ memberIds: [userId] }),
      });

      if (response.ok) {
        router.push(`/room/${classId}`);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const declineInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${classId}/decline`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error declining invitation:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline the invitation</DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={declineInvitation}>
                Decline
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Check />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept the invitation</DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={acceptInvitation}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
