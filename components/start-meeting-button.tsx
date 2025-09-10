"use client";

import { Button } from "@/components/ui/button";
import { StartMeetingDTO } from "@/types/meeting";
import { User } from "@/types/user";
import { BadgePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function StartMeetingButton({
  friend,
  user,
}: {
  friend: User;
  user: User;
}) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const requestBody: StartMeetingDTO = {
    members: [
      {
        id: user.id,
        firstName: user.name,
        lastName: user.surname,
        avatarURL: user.avatarUrl,
      },
      {
        id: friend.id,
        firstName: friend.name,
        lastName: friend.surname,
        avatarURL: friend.avatarUrl,
      },
    ],
  };

  const startMeeting = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/meeting/start", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();

        const existing = localStorage.getItem("meetingsHistory");
        const meetings = existing ? JSON.parse(existing) : [];

        meetings.unshift(data);
        localStorage.setItem("meetingsHistory", JSON.stringify(meetings));

        toast("Meeting started!", {
          description: `We will redirect you shortly!`,
        });

        router.push(`/meeting/${data.data.meetingID}`);
      } else {
        const error = await res.json();
        toast("Error!", {
          description: error,
        });
      }
    } catch (error) {
      toast("Error starting meeting!", {
        description: error as string,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" ">
      <Button onClick={startMeeting} disabled={isLoading}>
        {isLoading ? "Creating..." : <BadgePlus />}
      </Button>
    </div>
  );
}
