"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { StartMeetingDTO, MeetingMember } from "@/types/meeting";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function StartMeetingButton({
  friend,
  user,
}: Readonly<{ friend: MeetingMember; user: MeetingMember }>) {
  const router = useRouter();

  const authUser = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const requestBody: StartMeetingDTO = {
    members: [
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarURL: user.avatarURL,
      },
      {
        id: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        avatarURL: friend.avatarURL,
      },
    ],
  };

  const startMeeting = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8003/api/v1/meeting/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authUser.token}`,
          "Content-Type": "application/json",
        },
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
    <div className="p-2">
      <Button onClick={startMeeting} disabled={isLoading}>
        {isLoading ? "Creating meeting..." : "Create meeting"}
      </Button>
    </div>
  );
}
