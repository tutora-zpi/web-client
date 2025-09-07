"use client";

import { Copy } from "lucide-react";
import { Button } from "../ui/button";

export function CopyUrlButton() {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.toString());
  };

  return (
    <Button onClick={copyToClipboard} size="icon" variant="ghost">
      <Copy />
    </Button>
  );
}
