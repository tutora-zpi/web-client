"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ArrowRight, Trash } from "lucide-react";
import Link from "next/link";

export function NotificationItem({
  title,
  description,
  link,
  dismiss,
}: {
  title: string;
  description: string;
  link: string;
  dismiss: () => void;
}) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button asChild variant="outline" size="sm">
          <Link href={link}>
            <ArrowRight />
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={dismiss}>
          <Trash />
        </Button>
      </ItemActions>
    </Item>
  );
}
