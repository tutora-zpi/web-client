"use client";

import { useVoiceCall } from "@/hooks/useVoiceCall";
import { AudioLines, Mic, MicOff, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export default function VoiceConnection({ meetingId }: { meetingId: string }) {
  const [hasJoined, setHasJoined] = useState(false);

  const {
    isConnected,
    isCallActive,
    isMuted,
    participants,
    startCall,
    endCall,
    toggleMute,
  } = useVoiceCall({ roomId: meetingId });

  const handleJoinCall = async () => {
    setHasJoined(true);
    await startCall();
  };

  const handleLeaveCall = () => {
    endCall();
    setHasJoined(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-center gap-2">
        {isConnected && (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        )}

        {isCallActive && (
          <div className="text-sm text-gray-400">
            Call participants: {participants.length + 1}
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-2">
        {!hasJoined ? (
          <Button variant="secondary" onClick={handleJoinCall}>
            <AudioLines className="mr-2 h-4 w-4" />
            Join with voice
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="icon" onClick={handleLeaveCall}>
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
