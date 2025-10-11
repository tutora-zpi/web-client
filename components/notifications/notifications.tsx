"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Bell, UsersRound } from "lucide-react";
import { Badge } from "../ui/badge";
import { Notification } from "@/types/notification";
import { NotificationItem } from "./notification-item";
import { useRouter } from "next/navigation";

export default function Notifications({ token }: { token: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const router = useRouter();

  const handleNotification = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.data.redirectionLink.includes("meeting")) {
      const notificationDate = new Date(data.data.startedTime);
      toast.info("Meeting started!", {
        description: notificationDate.toISOString(),
        action: {
          label: "Join",
          onClick: () => router.push(`meeting/${data.data.meetingId}`),
        },
      });
    } else {
      toast.info("You got new invitation to class!", {
        description: `Go to invitations and start learning!`,
        action: {
          label: <UsersRound />,
          onClick: () => router.push(`dashboard/invitations`),
        },
      });
    }
    fetchNotifications();
  };

  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/stream?token=${token}`
      );

      eventSource.addEventListener("notification", handleNotification);

      eventSource.onerror = () => {
        eventSource.close();
        connect();
      };
    };

    fetchNotifications();
    connect();

    return () => {
      eventSource.removeEventListener("notification", handleNotification);
      eventSource.close();
    };
  }, [token]);

  const fetchNotifications = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/notification`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (!data.data) {
      setNotifications([]);
    } else {
      setNotifications(data.data);
    }
  };

  const dismissNotification = async (id: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/notification`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: [id],
        }),
      }
    );

    if (response.ok) {
      setNotifications(
        notifications.filter(
          (notification: Notification) => notification.id !== id
        )
      );
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className="relative" size="icon">
          <Bell />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center p-1 rounded-full"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Here are the list of the notifications
          </SheetDescription>
        </SheetHeader>
        {notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            title={notification.id}
            description={notification.title}
            link={notification.redirectionLink}
            dismiss={() => dismissNotification(notification.id)}
          />
        ))}
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
