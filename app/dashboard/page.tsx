import { CreateRoomDialog } from "@/components/dashboard/create-room-dialog";
import MeetingsDashboard from "@/components/dashboard/meetings-dashboard";
import { Navbar } from "@/components/navbar";
import { requireAuth } from "@/lib/auth";

export default async function Dashboard() {
  const user = await requireAuth();

  return (
    <>
      <Navbar />
      <div className="flex justify-around">
        <CreateRoomDialog host={user} />
        <MeetingsDashboard />
      </div>
    </>
  );
}
