import { FriendCard } from "@/components/dashboard/friend-card";
import MeetingsDashboard from "@/components/dashboard/meetings-dashboard";
import { Navbar } from "@/components/navbar";
import { requireAuth } from "@/lib/auth";
import { MeetingMember } from "@/types/meeting";

const friendsList: MeetingMember[] = [
  {
    id: "a2fc315c-326b-4bd0-aae4-ca932f9c3874",
    firstName: "Jan",
    lastName: "Kowalski",
    avatarURL: "https://robohash.org/avatar",
  },
  {
    id: "8e9ef623-5f27-4557-8ad6-6cf511351a15",
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
