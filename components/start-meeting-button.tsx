"use client";

import { Button } from "@/components/ui/button";
import { StartMeetingDTO } from "@/types/meeting";
import { User } from "@/types/user";
import { Phone } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function StartMeetingButton({
  friend,
  user,
  classId,
}: {
  friend: User;
  user: User;
  classId: string;
}) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const requestBody: StartMeetingDTO = {
    finishDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    title: "Temporay Meeting",
    classId: classId,
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

        toast("Meeting started!", {
          description: `We will redirect you shortly!`,
        });

        router.push(`/room/${classId}/meeting/${data.data.meetingId}`);
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
    <Button onClick={startMeeting} disabled={isLoading} variant="outline">
      <Phone />
    </Button>
  );
}
