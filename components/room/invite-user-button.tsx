"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";

export function InviteUserButton({
  sender,
  receiver,
  classId,
}: {
  sender: User;
  receiver: User;
  classId: string;
}) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const inviteUser = async () => {
    try {
      const res = await fetch(`/api/invitations`, {
        method: "POST",
        body: JSON.stringify({
          classId: classId,
          sender: sender,
          receiver: receiver,
        }),
      });

      if (res.ok) {
        setIsButtonDisabled(true);
      } else {
        const error = await res.json();
        toast.error("Error inviting the user!", {
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
