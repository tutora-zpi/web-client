"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Classname is too short!",
    })
    .max(20, {
      message: "Classname is too long!",
    }),
});

export function CreateRoomDialog({ hostId }: { hostId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          members: [hostId],
        }),
      });

      if (res.ok) {
        const data = await res.json();

        toast.success("Room Created!", {
          description: `We will redirect you shortly!`,
          richColors: true,
        });

        router.push(`/room/${data.id}`);
      } else {
        const error = await res.json();
        toast.error("Error!", {
          description: error,
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error creating the room!", {
        description: error as string,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="aspect-square">
        <button className="w-full h-full justify-center flex items-center">
          <Card className="hover:cursor-pointer hover:bg-secondary/50 dark:hover:bg-secondary/10 w-full h-full flex items-center justify-center">
            <CardContent>
              <Plus className="h-24 w-24 text-gray-400  group-hover:text-primary dark:text-gray-600" />
            </CardContent>
          </Card>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Classroom</DialogTitle>
          <DialogDescription>
            Create a new classroom by entering its name.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ClassName</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button disabled={isLoading} type="submit">
                {isLoading ? "Creating..." : "Create"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
