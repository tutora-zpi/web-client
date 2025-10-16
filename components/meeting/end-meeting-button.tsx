"use client";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function EndMeetingButton({
  meetingId,
  classId,
}: {
  meetingId: string;
  classId: string;
}) {
  const router = useRouter();

  const requestBody = {
    meetingId,
    classId,
  };

  const endMeeting = async () => {
    try {
      const res = await fetch("/api/meeting/end", {
        method: "DELETE",
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        toast("Meeting Ended!", {
          description: `We will redirect you shortly!`,
        });

        router.push(`/room/${classId}`);
      } else {
        const error = await res.json();
        toast("Error!", {
          description: error,
        });
      }
    } catch (error) {
      toast("Error ending meeting!", {
        description: error as string,
      });
    }
  };

  return (
    <Button onClick={endMeeting} variant="outline">
      End Meeting
    </Button>
  );
}
