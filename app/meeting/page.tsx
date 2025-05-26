"use client";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";
import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../../components/excelidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center">
        <h2>Meeting #2</h2>
      </div>
      <div className="flex md:flex-row md:justify-between flex-col justify-center items-center mt-2">
        <div className="w-4/5 md:w-3/4  h-140 m-2 flex flex-col justify-between">
          <div className="h-130">
            <ExcalidrawWrapper />
          </div>
          <div className="flex justify-between items-center mt-2">
            <Button variant="secondary">End lesson</Button>
            <div className="flex justify-center items-center gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
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
          </div>
        </div>
      </div>
    </>
  );
}
