import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { MeetingData } from "@/types/meeting";
import { CalendarMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function PlannedMeetingItem({
  meeting,
}: {
  meeting: MeetingData;
}) {
  const router = useRouter();

  const cancelMeeting = async () => {
    try {
      const res = await fetch("/api/meeting/plan", {
        method: "DELETE",
        body: JSON.stringify({
          meetingId: meeting.id,
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const error = await res.text();
        toast.error("Error!", {
          description: JSON.stringify(error).split('"').join(""),
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error while canceling the meeting!", {
        description: error as string,
        richColors: true,
      });
    }
  };

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{meeting.title}</ItemTitle>
        <ItemDescription>
          {new Date(meeting.startDate).toLocaleString()}-
          {new Date(meeting.finishDate).toLocaleTimeString()}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <CalendarMinus />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Meeting?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Participants will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Return</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={cancelMeeting}>
                  Cancel
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ItemActions>
    </Item>
  );
}
