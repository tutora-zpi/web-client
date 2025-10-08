"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { toast } from "sonner";

export function DeleteClassroomButton({ classId }: { classId: string }) {
  const router = useRouter();

  const declineInvitation = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        toast.success("Class successfully deleted!", {
          richColors: true,
        });
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Error while deleting the class" + classId, {
        richColors: true,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          {" "}
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form action={declineInvitation}>
          <DialogHeader>
            <DialogTitle>Delete class</DialogTitle>
            <DialogDescription>
              All the data associated with this class will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-10">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              <Trash />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
