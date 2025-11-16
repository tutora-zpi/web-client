"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function CreateRoomButton({
  roomName,
  hostId,
}: {
  roomName: string;
  hostId: string;
}) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        body: JSON.stringify({
          name: roomName,
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
    <div>
      <Button onClick={createRoom} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </div>
  );
}
