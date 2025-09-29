import { InvitationCard } from "@/components/dashboard/invitations/invitation-card";
import { Navbar } from "@/components/navbar";
import { Class, Invitation, InvitationWithDetails } from "@/types/class";
import { User } from "@/types/user";

import { cookies } from "next/headers";

const getInvitations = async (token: string): Promise<Invitation[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/invitations/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const invitations = await response.json();

  return invitations;
};

const getClassDetails = async (
  classId: string,
  token: string
): Promise<Class> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/classes/${classId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getUserDetails = async (userId: string, token: string): Promise<User> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_USER_SERVICE}/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

export const getInvitationsWithDetails = async (): Promise<
  InvitationWithDetails[]
> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unable to get the token");
  }

  const invitations = await getInvitations(token);

  const invitationsWithDetails = await Promise.all(
    invitations.map(async (invitation: Invitation) => {
      const [classDetails, userDetails] = await Promise.all([
        getClassDetails(invitation.classId, token),
        getUserDetails(invitation.userId, token),
      ]);

      return {
        ...invitation,
        classDetails,
        userDetails,
      };
    })
  );

  return invitationsWithDetails;
};

export default async function Dashboard() {
  const invitations = await getInvitationsWithDetails();

  return (
    <>
      <Navbar />
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4 sm:justify-start md:grid-cols-3 lg:grid-cols-5">
        {invitations.map((invitation, i) => (
          <InvitationCard
            key={i}
            classroom={invitation.classDetails}
            user={invitation.userDetails}
            createdAt={invitation.createdAt}
          />
        ))}
      </div>
    </>
  );
}
