"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { MeetingData } from "@/types/meeting";
import { ChevronsUpDown, NotebookPen } from "lucide-react";
import { useState } from "react";
import PlannedMeetingItem from "./planned-meeting-item";

export default function PlannedMeetings({
  meetings,
}: {
  meetings: MeetingData[];
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="w-full">
      {meetings.length > 0 ? (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="flex w-full flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2 px-2">
            <h4 className="text-sm font-semibold">
              You got {meetings.length} upcoming meetings
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsUpDown />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <PlannedMeetingItem meeting={meetings[0]} />
          {meetings.length > 1 && (
            <CollapsibleContent className="flex flex-col gap-2">
              {meetings.slice(1).map((meeting, index) => (
                <PlannedMeetingItem key={index} meeting={meeting} />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      ) : (
        <Empty className="mb-5 md:p-0">
          <EmptyHeader>
            <EmptyTitle className="flex items-center gap-2">
              <NotebookPen /> <span>No Planned Meetings Yet</span>
            </EmptyTitle>
            <EmptyDescription>
              You haven&apos;t planned any meetings yet. Get started by planning
              your first meeting or starting it!
            </EmptyDescription>
          </EmptyHeader>

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
