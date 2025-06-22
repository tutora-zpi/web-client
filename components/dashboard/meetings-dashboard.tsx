"use client";

import { useEffect, useState } from "react";
import { Meeting, MeetingMember } from "@/types/meeting";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function MeetingsDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("meetingsHistory");
    const parsed = stored ? JSON.parse(stored) : [];
    setMeetings(parsed);
  }, []);

  const endMeeting = async (meeting: Meeting) => {
    const updatedMeetings = meetings.filter(
      (m) => m.data.meetingID !== meeting.data.meetingID
    );
    localStorage.setItem("meetingsHistory", JSON.stringify(updatedMeetings));
    setMeetings(updatedMeetings);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xl">Meetings:</div>
      {meetings.map((meeting) => (
        <div key={meeting.data.meetingID}>
          <MeetingCard
            id={meeting.data.meetingID}
            members={meeting.data.members}
            onDelete={() => endMeeting(meeting)}
          />
        </div>
      ))}
    </div>
  );
}

const MeetingCard = ({
  id,
  members,
  onDelete,
}: {
  id: string;
  members: MeetingMember[];
  onDelete: () => void;
}) => {
  return (
    <div className="border-2 rounded-xl p-4 flex justify-center flex-col gap-2">
      <div className="flex gap-2 items-center justify-between">
        <p className="text-xs">{id}</p>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="destructive" className="size-8">
              <Trash />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to end this meeting?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-2 mt-2">
          <Avatar className="border-2">
            <AvatarImage src={member.avatarURL} />
            <AvatarFallback>
              {member.firstName[0]}
              {member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <p>
            {member.firstName} {member.lastName}
          </p>
        </div>
      ))}

      <Button asChild>
        <Link href={`/meeting/${id}`}>Join room</Link>
      </Button>
    </div>
  );
};
