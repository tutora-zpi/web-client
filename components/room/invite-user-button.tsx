"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InviteUserButton({
  classId,
  userId,
}: {
  classId: string;
  userId: string;
}) {
  const createRoom = async () => {
    try {
      const res = await fetch(`/api/invitations/${classId}/users/${userId}`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        toast("User Invited!", {
          description: `User will be notified!`,
        });
      } else {
        const error = await res.json();
        toast.error("Error!", {
          description: error.error || "Unknown error",
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error inviting the user!", {
        description: error as string,
        richColors: true,
      });
    }
  };

  return (
    <div className=" ">
      <Button onClick={createRoom}>Invite</Button>
    </div>
  );
}
