import { Navbar } from "@/components/navbar";
import { InviteUserDialog } from "@/components/room/invite-user-dialog";
import { requireAuth } from "@/lib/auth";
import { Class } from "@/types/class";
import { User } from "@/types/user";
import { cookies } from "next/headers";

const getUsers = async (userIds: string[]): Promise<User[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const users = await Promise.all(
    userIds.map(async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    })
  );

  return users;
};

const getClass = async (id: string): Promise<Class> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/classes/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const classRoom = await response.json();

  return classRoom;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const host = await requireAuth();

  const data = await getClass(slug);

  const users = await getUsers(data.members.map((member) => member.userId));

  return (
    <>
      <Navbar />

      <div>
        <h1>{data.name}</h1>
        <div>
          {users.map((member) => (
            <div key={member.id}>
              {member.name} {member.surname}
            </div>
          ))}
        </div>
      </div>
      <InviteUserDialog classId={slug} host={host} />
    </>
  );
}
