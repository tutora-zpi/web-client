"use client";

import { useRecording } from "@/hooks/useRecording";
import { Disc, Disc2 } from "lucide-react";
import { Button } from "../ui/button";

export default function RecordMeeting({
  meetingId,
  token,
  userId,
  finishTime,
}: {
  meetingId: string;
  token: string;
  userId: string;
  finishTime: Date;
}) {
  const { isRecording, startRecording, stopRecording } = useRecording(
    userId,
    token,
    meetingId,
    finishTime
  );

  return (
    <div className="flex justify-center items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "default"}
        size="icon"
        onClick={!isRecording ? startRecording : stopRecording}
      >
        {isRecording ? <Disc2 /> : <Disc />}
      </Button>
    </div>
  );
}
