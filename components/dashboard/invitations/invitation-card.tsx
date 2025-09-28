import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InvitationButtons from "./invitation-buttons";

export async function InvitationCard({
  classId,
  createdAt,
}: {
  classId: string;
  createdAt: Date;
}) {
  return (
    <Card className="aspect-square flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{classId}</CardTitle>
        <CardDescription>
          {new Date(createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col ">
        <div className="flex flex-col gap-2">SenderName SenderSurname</div>
      </CardContent>
      <CardFooter>
        <InvitationButtons classId={classId} />
      </CardFooter>
    </Card>
  );
}
