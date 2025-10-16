import { MeetingData } from "@/types/meeting";
import { School } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function PlannedMeetings({
  meetings,
}: {
  meetings: MeetingData[];
}) {
  return (
    <div>
      {meetings.length > 0 ? (
        <div>siema</div>
      ) : (
        <Empty className="mb-5 md:p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <School />
            </EmptyMedia>
            <EmptyTitle>No Planned Meetings Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t planned any meetings yet. Get started by planning
              your first meeting or starting it!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button>Plan Meeting</Button>
            </div>
          </EmptyContent>
          <Button
            variant="link"
            asChild
            className="text-muted-foreground"
            size="sm"
          ></Button>
        </Empty>
      )}
    </div>
  );
}
