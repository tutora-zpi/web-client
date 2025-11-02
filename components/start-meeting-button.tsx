"use client";

import { Button } from "@/components/ui/button";
import { StartMeetingDTO } from "@/types/meeting";
import { User } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { Phone } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createMeeting = async (requestBody: StartMeetingDTO) => {
  const res = await fetch("/api/meeting/start", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  return res.json();
};

export function StartMeetingButton({
  members,
  classId,
}: {
  members: User[];
  classId: string;
}) {
  const router = useRouter();

  const { mutate: createMeetingMutation, isPending } = useMutation({
    mutationFn: createMeeting,
    onSuccess: (data) => {
      toast.success("Meeting started!", {
        description: `We will redirect you shortly!`,
        richColors: true,
      });
      router.push(`/room/${classId}/meeting/${data.data.meetingId}`);
    },
    onError: () => {
      toast.error("Error!", {
        description: `We couldn't start the meeting.`,
        richColors: true,
      });
    },
  });

  const requestBody: StartMeetingDTO = {
    finishDate: new Date(Date.now() + 60 * 45 * 1000).toISOString(),
    title: "Temporary Meeting",
    classId: classId,
    members: members.map((user: User) => ({
      id: user.id,
      firstName: user.name,
      lastName: user.surname,
      avatarURL: user.avatarUrl,
    })),
  };

  return (
    <Button
      onClick={() => createMeetingMutation(requestBody)}
      disabled={isPending}
      variant="outline"
    >
      <Phone />
    </Button>
  );
}
