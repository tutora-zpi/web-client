import { Navbar } from "@/components/navbar";
import { StartMeetingButton } from "@/components/start-meeting-button";
import { requireAuth } from "@/lib/auth";

export default async function Dashboard() {
  const user = await requireAuth();
  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold">Witaj, {user.email}</h1>
        <p className="mt-2 text-gray-600">ID użytkownika: {user.id}</p>
      </div>

      <div>
        <StartMeetingButton />
      </div>
    </>
  );
}
