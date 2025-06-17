"use client";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Mic } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import Loading from "./loading";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../../components/excelidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function Page() {
  const { user, loading } = useAuth();

  return (
    <>
      <div className="flex justify-center items-center mt-2">
        <h2>Meeting #2</h2>
      </div>
      <div className="flex md:flex-row md:justify-between flex-col justify-center items-center mt-2">
        <div className="w-4/5 md:w-3/4  h-140 m-2 flex flex-col justify-between">
          <Suspense fallback={<Loading />}>
            <div className="h-130">
              <ExcalidrawWrapper />
            </div>
          </Suspense>
          <div className="flex justify-between items-center mt-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">End Lesson</Link>
            </Button>
            <Button variant="secondary" size="icon">
              <Mic />
            </Button>
          </div>
        </div>
        <div className="w-4/5 md:w-1/4 flex flex-col m-2 h-140 justify-between">
          <h2 className="text-center">Chat</h2>
          <div className="grid w-full gap-2">
            <Textarea placeholder="Type your message here." />
            <Button>Send message</Button>
            <div className="flex justify-center items-center">
              {!loading && user && (
                <span className="text-sm font-medium hidden md:inline">
                  Joined as {user.email.split("@")[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
