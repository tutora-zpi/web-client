"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck } from "lucide-react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { z } from "zod";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

const formSchema = z.object({
  title: z.string().min(2),
});

export function PlanMeetingForm({
  friend,
  user,
  classId,
  date,
  startTime,
  finishTime,
}: {
  friend: User;
  user: User;
  classId: string;
  date: Date | undefined;
  startTime: string;
  finishTime: string;
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const planMeeting = async (values: z.infer<typeof formSchema>) => {
    if (!date) return;

    const [startHour, startMin, startSec] = startTime.split(":").map(Number);
    const [endHour, endMin, endSec] = finishTime.split(":").map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, startSec);

    const finishDate = new Date(date);
    finishDate.setHours(endHour, endMin, endSec);

    const requestBody = {
      finishDate,
      startDate,
      title: values.title,
      classId,
      members: [
        {
          id: user.id,
          firstName: user.name,
          lastName: user.surname,
          avatarURL: user.avatarUrl,
        },
        {
          id: friend.id,
          firstName: friend.name,
          lastName: friend.surname,
          avatarURL: friend.avatarUrl,
        },
      ],
    };

    try {
      const res = await fetch("/api/meeting/plan", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        toast.success("Meeting Planned!", {
          description: `Meeting scheduled!`,
          richColors: true,
        });

        router.refresh();
      } else {
        const error = await res.text();
        toast.error("Error!", {
          description: JSON.stringify(error),
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error starting meeting!", {
        description: error as string,
        richColors: true,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(planMeeting)}
        className="flex min-w-full items-center gap-2 justify-center"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="title" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" variant="outline">
          <CalendarCheck />
        </Button>
      </form>
    </Form>
  );
}
