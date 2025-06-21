"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartMeetingButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const startMeeting = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/meeting/start", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Meeting started:", data);

        router.push(`/meeting/${data.data.meetingID}`);
      } else {
        const err = await res.json();
        alert("Błąd: " + err.error);
      }
    } catch (error) {
      console.error("Error starting meeting:", error);
      // zrobic tu toasta
      alert("Wystąpił błąd podczas tworzenia meetingu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Button onClick={startMeeting} disabled={isLoading}>
        {isLoading ? "Creating meeting..." : "Start meeting"}
      </Button>
    </div>
  );
}
