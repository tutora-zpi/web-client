"use client";

import Loading from "@/app/meeting/[slug]/loading";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../excelidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function Board({ meetingId }: { meetingId: string }) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="h-130">
        <ExcalidrawWrapper sessionId={meetingId} />
      </div>
    </Suspense>
  );
}
