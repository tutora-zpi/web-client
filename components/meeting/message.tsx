"use client";

import { SmilePlus, UserRound, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { EMOJI_OPTIONS, Reaction } from "@/types/meeting";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { AspectRatio } from "../ui/aspect-ratio";

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
  onAddReaction,
}: {
  messageId: string;
  name?: string;
  surname?: string;
  message: string;
  avatarUrl?: string;
  reactions?: Reaction[];
  fileLink?: string;
  onAddReaction: (emoji: string, messageId: string) => void;
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

                  <DialogContent className="w-[90vw]">
                    <DialogHeader>
                      <DialogTitle>{fileLink.slice(14)}</DialogTitle>
                    </DialogHeader>

                    <AspectRatio ratio={16 / 9}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_CHAT_SERVICE}${fileLink}`}
                        alt="Attachment"
                        fill
                        className="rounded-lg object-cover "
                      />
                    </AspectRatio>
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
                    <span className="truncate">{fileLink.slice(14)}</span>
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
        </ItemActions>
      </Item>
    </div>
  );
}
