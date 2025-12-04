"use client";

import {
  File,
  MessageSquareReply,
  Reply,
  SmilePlus,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { EMOJI_OPTIONS, Reaction } from "@/types/meeting";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const isImageFile = (filename: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? imageExtensions.includes(extension) : false;
};

export default function Message({
  messageId,
  name,
  surname,
  message,
  avatarUrl,
  reactions,
  fileLink,
  fileName,
  timestamp,
  onAddReaction,
  onReply,
  replyToMessageContent,
}: {
  messageId: string;
  name?: string;
  surname?: string;
  message: string;
  avatarUrl?: string;
  reactions?: Reaction[];
  fileLink?: string;
  fileName?: string;
  replyToMessageContent?: string;
  timestamp: number;
  onAddReaction: (emoji: string, messageId: string) => void;
  onReply: (messageId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleAddReaction = (emoji: string) => {
    onAddReaction(emoji, messageId);
    setOpen(false);
  };
  const groupedReactions: Record<string, number> = {};
  if (reactions && reactions.length > 0) {
    for (const r of reactions) {
      groupedReactions[r.emoji] = (groupedReactions[r.emoji] || 0) + 1;
    }
  }
  return (
    <div className="flex w-full max-w-lg flex-col">
      {replyToMessageContent && (
        <div className="flex flex-col rounded-md border-l-4 border-primary/40 bg-muted/50 px-3 py-2 text-xs">
          <span className="flex  items-center gap-1 font-medium text-muted-foreground ">
            <MessageSquareReply size={12} />
            Answer to:
          </span>
          <span className="italic text-foreground/80">
            {replyToMessageContent}
          </span>
        </div>
      )}
      <Item variant="outline" className="relative">
        {Object.keys(groupedReactions).length > 0 && (
          <div className="absolute -top-2 -right-2 flex items-center p-1 rounded-md bg-secondary gap-1">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span key={emoji} className="flex items-center text-xs">
                <span>{emoji}</span>
                {count > 1 && (
                  <span className="text-xs font-medium leading-none">
                    {count}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} className="rounded-full" />
          <AvatarFallback>
            <UserRound />
          </AvatarFallback>
        </Avatar>

        <ItemContent className="min-w-0">
          <ItemTitle>
            {name} {surname}
          </ItemTitle>

          <ItemDescription className="break-words">
            <span>{message}</span>
          </ItemDescription>
          <ItemDescription className="text-xs">
            <span>
              {format(new Date(timestamp * 1000), "dd.MM.yyyy HH:mm")}
            </span>
          </ItemDescription>

          {fileLink && (
            <div className="mt-2">
              {isImageFile(fileLink) ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_CHAT_SERVICE}${fileLink}`}
                        alt="Attachment"
                        width={200}
                        height={200}
                        className="rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto p-4">
                    <DialogHeader>
                      <DialogTitle>{fileLink.slice(14)}</DialogTitle>
                    </DialogHeader>

                    <div className="relative w-full">
                      <img
                        src={`${process.env.NEXT_PUBLIC_CHAT_SERVICE}${fileLink}`}
                        alt="Attachment"
                        className="rounded-lg w-full h-auto max-w-full"
                        style={{ maxHeight: "calc(90vh - 100px)" }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  asChild
                  variant="secondary"
                  className="w-44 sm:w-auto max-w-90"
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_CHAT_SERVICE}${fileLink}`}
                  >
                    <File />
                    <span className="truncate">{fileName}</span>
                  </a>
                </Button>
              )}
            </div>
          )}
        </ItemContent>
        <ItemActions>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="outline">
                <SmilePlus />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1">
                {EMOJI_OPTIONS.map((emoji: string) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddReaction(emoji)}
                    className="text-xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            disabled={!!fileLink}
            onClick={() => onReply(messageId)}
          >
            <Reply />
          </Button>
        </ItemActions>
      </Item>
    </div>
  );
}
