"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { CalendarCheck } from "lucide-react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

export function PlanMeetingButton({
  friend,
  user,
  classId,
  date,
  startTime,
  finishTime,
}: {
  friend: User;
  user: User;
  classId: string;
  date: Date | undefined;
  startTime: string;
  finishTime: string;
}) {
  const router = useRouter();

  const planMeeting = async () => {
    if (!date) return;

    const [startHour, startMin, startSec] = startTime.split(":").map(Number);
    const [endHour, endMin, endSec] = finishTime.split(":").map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, startSec);

    const finishDate = new Date(date);
    finishDate.setHours(endHour, endMin, endSec);

    const requestBody = {
      finishDate,
      startDate,
      title: "Temporary Meeting",
      classId,
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

    try {
      const res = await fetch("/api/meeting/plan", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        toast("Meeting Planned!", {
          description: `Meeting scheduled!`,
        });

        router.refresh();
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
    }
  };

  return (
    <Button onClick={planMeeting} variant="outline">
      <CalendarCheck />
    </Button>
  );
}
