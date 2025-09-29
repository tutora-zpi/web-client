"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function InviteUserButton({
  classId,
  userId,
}: {
  classId: string;
  userId: string;
}) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const inviteUser = async () => {
    try {
      const res = await fetch(`/api/invitations/${classId}/users/${userId}`, {
        method: "POST",
      });

      if (res.ok) {
        setIsButtonDisabled(true);
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
      <Button onClick={inviteUser} disabled={isButtonDisabled}>
        Invite
      </Button>
    </div>
  );
}
