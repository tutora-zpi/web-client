import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InvitationButtons from "./invitation-buttons";
import { Class } from "@/types/class";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function InvitationCard({
  classroom,
  user,
  createdAt,
}: {
  classroom: Class;
  user: User;
  createdAt: Date;
}) {
  return (
    <Card className="aspect-square flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{classroom.name}</CardTitle>
        <CardDescription>
          {new Date(createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col ">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage className="rounded-full" src={user.avatarUrl} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="text-sm">
            {user.name} {user.surname}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <InvitationButtons classId={classroom.id} userId={user.id} />
      </CardFooter>
    </Card>
  );
}
