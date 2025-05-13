"use client";
import dynamic from "next/dynamic";

// Since client components get prerenderd on server as well hence importing
// the excalidraw stuff dynamically with ssr false

const ExcalidrawWrapper = dynamic(
  async () => (await import("../components/ExcelidrawWrapper")).default,
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">.letslearn</h1>
      <div className="h-3/4 w-3/4 border-2 rounded-sm p-1">
        <ExcalidrawWrapper />
      </div>
    </div>
  );
}
