import { InvitationCard } from "@/components/dashboard/invitations/invitation-card";
import { Navbar } from "@/components/navbar";
import { Invitation } from "@/types/class";

import { cookies } from "next/headers";

const getInvitations = async (): Promise<Invitation[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/invitations/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const invitations = await response.json();

  return invitations;
};

export default async function Dashboard() {
  const invitations = await getInvitations();

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4 sm:justify-start md:grid-cols-3 lg:grid-cols-5">
        {invitations.map((invitation, i) => (
          <InvitationCard
            key={i}
            classId={invitation.classId}
            createdAt={invitation.createdAt}
          />
        ))}
      </div>
    </>
  );
}
