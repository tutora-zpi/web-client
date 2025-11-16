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

export default function PlannedMeetingItem({
  meeting,
}: {
  meeting: MeetingData;
}) {
  const router = useRouter();
  console.log(meeting);

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
        <Button variant="destructive" size="icon" onClick={cancelMeeting}>
          <CalendarMinus />
        </Button>
      </ItemActions>
    </Item>
  );
}
