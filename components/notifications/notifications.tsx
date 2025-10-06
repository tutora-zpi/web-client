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
import { Bell } from "lucide-react";
import { Badge } from "../ui/badge";
import { Notification } from "@/types/notification";

import { NotificationItem } from "./notification-item";

export default function Notifications({ token }: { token: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/stream?token=${token}`
    );

    const handleNotification = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      toast("Notification", {
        description: data.title,
      });
      fetchNotifications();
    };

    eventSource.addEventListener("notification", handleNotification);

    eventSource.onerror = () => {
      console.error("Error connecting to SSE server.");
      eventSource.close();
    };

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
    setNotifications(data.data);
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
        <Button variant="outline" className="relative">
          <Bell />
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center p-1 rounded-full"
          >
            {notifications.length}
          </Badge>
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
            link="#"
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
