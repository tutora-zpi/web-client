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
        <div className="flex flex-col gap-2">
          {user.name} {user.surname}
        </div>
      </CardContent>
      <CardFooter>
        <InvitationButtons classId={classroom.id} />
      </CardFooter>
    </Card>
  );
}
