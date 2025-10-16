"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User } from "@/types/user";
import { PlanMeetingButton } from "./plan-meeting-button";

export default function PlanMeetingCalendar({
  friend,
  user,
  classId,
}: {
  friend: User;
  user: User;
  classId: string;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("16:00:00");
  const [finishTime, setFinishTime] = useState("16:45:00");

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <>
      <Card className="w-fit py-4 ">
        <CardContent className="px-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            startMonth={date}
            disabled={isDateDisabled}
            className="bg-transparent p-0 [--cell-size:--spacing(10.5)]"
          />
        </CardContent>
        <CardFooter className="flex gap-2 border-t px-4 !pt-4 *:[div]:w-full">
          <div>
            <Label htmlFor="time-from" className="sr-only">
              Start Time
            </Label>
            <Input
              id="time-from"
              type="time"
              step="1"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
          <span>-</span>
          <div>
            <Label htmlFor="time-to" className="sr-only">
              End Time
            </Label>
            <Input
              id="time-to"
              type="time"
              step="1"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>

          <PlanMeetingButton
            user={user}
            friend={friend}
            classId={classId}
            date={date}
            startTime={startTime}
            finishTime={finishTime}
          />
        </CardFooter>
      </Card>
    </>
  );
}
