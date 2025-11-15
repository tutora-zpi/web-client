"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck } from "lucide-react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { z } from "zod";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const formSchema = z.object({
  title: z.string().min(2),
  selectedMembers: z
    .array(z.string())
    .min(1, "Choose at least two members for the meeting"),
});

export function PlanMeetingForm({
  members,
  classId,
  date,
  startTime,
  finishTime,
}: {
  members: User[];
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
      selectedMembers: members.map((member) => member.id),
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

    const selectedMembersData = members.filter((user) =>
      values.selectedMembers.includes(user.id)
    );

    const requestBody = {
      finishDate,
      startDate,
      title: values.title,
      classId,
      members: selectedMembersData.map((user: User) => ({
        id: user.id,
        firstName: user.name,
        lastName: user.surname,
        avatarURL: user.avatarUrl,
      })),
    };

    try {
      const res = await fetch("/api/meeting/plan", {
        method: "POST",
        body: JSON.stringify(requestBody),
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
        className="flex flex-col gap-4 w-full"
      >
        <div className="flex min-w-full items-center gap-2 justify-center">
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
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Advanced options</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="selectedMembers"
                render={() => (
                  <FormItem>
                    <FormLabel>Meeting members</FormLabel>
                    <div className="space-y-2">
                      {members.map((member) => (
                        <FormField
                          key={member.id}
                          control={form.control}
                          name="selectedMembers"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={member.id}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    defaultChecked
                                    checked={field.value?.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            member.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== member.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {member.name} {member.surname}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}
