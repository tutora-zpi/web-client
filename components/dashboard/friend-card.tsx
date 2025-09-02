import { MeetingMember } from "@/types/meeting";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StartMeetingButton } from "../start-meeting-button";

export function FriendCard({
  friend,
  user,
}: {
  friend: MeetingMember;
  user: MeetingMember;
}) {
  return (
    <div className="flex  flex-col border-2 rounded-xl px-10 py-2 mt-2">
      <div className="flex items-center justify-center flex-col">
        <Avatar className="w-[75px] h-[75px] border-2 m-2">
          <AvatarImage src={friend.avatarURL} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <p>
          {friend.firstName} {friend.lastName}
        </p>
      </div>

      <div className="flex justify-center items-center">
        <StartMeetingButton user={user} friend={friend} />
      </div>
    </div>
  );
}
