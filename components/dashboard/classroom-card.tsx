import Link from "next/link";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { ClassUser, ClassUserRole } from "@/types/class";
import { GraduationCap } from "lucide-react";
import { DeleteClassroomButton } from "./delete-classroom-button";
import { cn } from "@/lib/utils";

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

export async function ClassroomCard({
  id,
  name,
  classUsers,
  ableToDelete,
}: {
  id: string;
  name: string;
  classUsers: ClassUser[];
  ableToDelete: boolean;
}) {
  const host = classUsers.find(
    (user: ClassUser) => user.role === ClassUserRole.HOST
  );
  const users = await getUsers(
    classUsers.map((user: ClassUser) => user.userId)
  );

  return (
    <Card className="aspect-square flex flex-col justify-between ">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col ">
        <div className="flex flex-col gap-2 ">
          {users.map((user) => (
            <div key={user.id} className="text-sm flex items-center gap-2">
              {user.id === host?.userId && <GraduationCap />}
              {user.name} {user.surname}{" "}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter
        className={cn("flex justify-between ", !ableToDelete && "justify-end")}
      >
        {ableToDelete && <DeleteClassroomButton classId={id} />}
        <Button asChild>
          <Link href={`/room/${id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
