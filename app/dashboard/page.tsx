import { FriendCard } from "@/components/dashboard/friend-card";
import MeetingsDashboard from "@/components/dashboard/meetings-dashboard";
import { Navbar } from "@/components/navbar";
import { requireAuth } from "@/lib/auth";
import { MeetingMember } from "@/types/meeting";

const friendsList: MeetingMember[] = [
  {
    id: "dd423675-fee6-496b-81ae-95d027bb99a4",
    firstName: "Jan",
    lastName: "Kowalski",
    avatarURL: "https://robohash.org/avatar",
  },
  {
    id: "a4c81a3e-2804-483f-be2d-7f0ae96be66c",
    firstName: "Michał",
    lastName: "Nowak",
    avatarURL: "https://robohash.org/avatar2",
  },
];

export default async function Dashboard() {
  const user = await requireAuth();

  const availableFriends = friendsList.filter(
    (friend: MeetingMember) => friend.id !== user.id
  );

  const meetingUser = friendsList.find(
    (meetingUser: MeetingMember) => meetingUser.id === user.id
  );

  return (
    <>
      <Navbar />
      <div className="flex justify-around">
        <div>
          <div className="text-xl">Friends: </div>
          {availableFriends.map((friend) => (
            <FriendCard key={friend.id} user={meetingUser!} friend={friend} />
          ))}
        </div>

        <MeetingsDashboard />
      </div>
    </>
  );
}
