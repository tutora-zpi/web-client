"use client";

import { AudioLines, Mic, MicOff } from "lucide-react";
import { Button } from "../ui/button";
import { useWebRTC } from "@/hooks/useVoiceCall";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@/types/user";
import { Badge } from "../ui/badge";

export default function VoiceConnection({
  meetingId,
  token,
  userId,
  meetingUsers,
}: {
  meetingId: string;
  token: string;
  userId: string;
  meetingUsers: User[];
}) {
  const { isConnected, isMuted, participants, toggleMute } = useWebRTC(
    userId,
    token,
    meetingId
  );

  return (
    <div className="flex flex-row gap-2 mt-2">
      {isConnected && (
        <div className="flex flex-row items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-green-500 text-white dark:bg-green-600 rounded-full"
          >
            <AudioLines />
            Connected
          </Badge>
          {participants.length && (
            <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
              {participants.map((p) => (
                <Avatar key={p}>
                  <AvatarImage
                    src={meetingUsers.find((user) => user.id === p)?.avatarUrl}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </div>
      )}

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
