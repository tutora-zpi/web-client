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

export default function PlannedMeetingItem({
  meeting,
}: {
  meeting: MeetingData;
}) {
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
        <Button variant="destructive" size="icon">
          <CalendarMinus />
        </Button>
      </ItemActions>
    </Item>
  );
}
