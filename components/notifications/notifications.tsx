"use client";

import { useEffect } from "react";
import { Action, toast } from "sonner";
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
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

const fetchNotifications = async (
  token: string,
  lastNotificationId?: string
) => {
  const params = lastNotificationId
    ? `?last_notification_id=${lastNotificationId}`
    : "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/notification${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();
  return result.data ?? [];
};

const deleteNotification = async (token: string, id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/notification`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [id],
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.status}`);
  }
};

export default function Notifications({ token }: { token: string }) {
  const queryClient = useQueryClient();

  const router = useRouter();

  const { data, status, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotifications(token, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.length > 0) {
        return lastPage[lastPage.length - 1].id;
      }
      return undefined;
    },
    initialPageParam: undefined,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to dismiss notification");
    },
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const matchLabelToLink = (link: string) => {
    if (link.includes("meeting")) {
      return "Join";
    } else {
      return "View";
    }
  };

  const handleNotification = (event: MessageEvent) => {
    const data = JSON.parse(event.data) satisfies Notification;

    const autoRedirect = data.metadata["autoRedirect"] satisfies boolean;

    if (autoRedirect) {
      router.push(data.redirectionLink);
    }

    const action: Action = {
      label: matchLabelToLink(data.redirectionLink),
      onClick: () => router.push(data.redirectionLink),
    };

    toast.info(data.title, {
      description: data.body,
      action: !autoRedirect ? action : null,
      duration: 5000,
    });

    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE}/api/v1/notification/stream?token=${token}`
      );

      eventSource.addEventListener("notification", handleNotification);

      eventSource.onerror = () => {
        eventSource.close();
        connect();
      };
    };
    connect();

    return () => {
      eventSource.removeEventListener("notification", handleNotification);
      eventSource.close();
    };
  }, [token]);

  return status === "pending" || status === "error" ? (
    <Button variant="secondary" className="relative" size="icon" disabled>
      {" "}
      <Bell />
    </Button>
  ) : (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className="relative" size="icon">
          <Bell />
          {data.pages.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center p-1 rounded-full"
            >
              {data.pages[0].length === 10 ? "10+" : data.pages[0].length}
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
        <div className="overflow-auto p-2 gap-2 flex flex-col">
          {data.pages.map((page, idx) => {
            return (
              <div key={idx}>
                {page.map((notification: Notification) => (
                  <NotificationItem
                    key={notification.id}
                    title={notification.title}
                    description={notification.body}
                    link={notification.redirectionLink}
                    dismiss={() => dismissMutation.mutate(notification.id)}
                  />
                ))}
              </div>
            );
          })}
          <div ref={ref}>{isFetchingNextPage && "Loading..."}</div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
