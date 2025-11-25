"use client";

import { useRecording } from "@/hooks/useRecording";
import { Disc, Disc2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    <>
      {!isRecording ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default">
              <div className="flex items-center gap-2">
                <Disc /> <span>Start Recording</span>
              </div>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start Recording Meeting?</AlertDialogTitle>
              <AlertDialogDescription>
                AI materials will be generated after you start the recording.
                This will capture audio and create meeting notes and quiz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={startRecording}>
                Start Recording
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          className="animate-pulse"
          variant="destructive"
          onClick={stopRecording}
        >
          <div className="flex items-center gap-2">
            <Disc2 /> <span>Recording</span>
          </div>
        </Button>
      )}
    </>
  );
}
