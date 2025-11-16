"use client";

import Loading from "@/app/room/[slug]/meeting/[meetingId]/loading";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../excelidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function Board({
  meetingId,
  token,
  userId,
}: {
  meetingId: string;
  token: string;
  userId: string;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="h-130">
        <ExcalidrawWrapper
          meetingId={meetingId}
          token={token}
          userId={userId}
        />
      </div>
    </Suspense>
  );
}
