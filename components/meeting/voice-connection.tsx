"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "../ui/button";
import { useWebRTC } from "@/hooks/useVoiceCall";

export default function VoiceConnection({
  meetingId,
  token,
  userId,
}: {
  meetingId: string;
  token: string;
  userId: string;
}) {
  const { isConnected, isMuted, participants, toggleMute } = useWebRTC(
    userId,
    token,
    meetingId
  );

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex justify-center items-center gap-2">
        {isConnected && (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-400">
              {participants.length + 1}{" "}
              {participants.length === 0 ? "participant" : "participants"}
            </span>
          </>
        )}
      </div>

      <div className="flex justify-center items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleMute}
          disabled={!isConnected}
        >
          {isMuted ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
