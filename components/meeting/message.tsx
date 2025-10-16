"use client";

import { SmilePlus, UserRound } from "lucide-react";

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
import { Reaction } from "@/types/meeting";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢"];

export default function Message({
  messageId,
  name,
  surname,
  message,
  avatarUrl,
  reactions,
  onAddReaction,
}: {
  messageId: string;
  name?: string;
  surname?: string;
  message: string;
  avatarUrl?: string;
  reactions?: Reaction[];
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
          <div className="absolute -top-2 -right-2 flex items-center p-1 rounded-md bg-secondary">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span key={emoji} className="flex items-center gap-1 text-xs">
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
            <span>{reactions?.length}</span>
          </ItemDescription>
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
