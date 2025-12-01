import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { FileType, NoteFile } from "@/types/class";
import { format } from "date-fns";
import { BookX, Eye, FlaskConical, NotebookTabs } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const getFiles = async (token: string, roomId: string): Promise<NoteFile[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NOTE_SERVICE}/list/${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status}`);
    }

    const filesData = await response.json();
    return filesData.files || [];
  } catch (error) {
    console.error("Error fetching files:", error);
    return [];
  }
};

export const NotesContainer = async ({ roomId }: { roomId: string }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const files = await getFiles(token, roomId);

  if (files.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookX />
          </EmptyMedia>
          <EmptyTitle>No Notes Yet</EmptyTitle>
          <EmptyDescription>
            Start recording your meetings to generate AI materials.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="gap-2">
      {files.map((file, index) => (
        <React.Fragment key={file.file_id + file.file_type}>
          <Item>
            <ItemContent>
              <ItemTitle>
                {file.file_type === FileType.NOTES ? (
                  <span className="flex items-center gap-2 font-bold text-lg">
                    <NotebookTabs /> Notes
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-lg">
                    <FlaskConical /> Test
                  </span>
                )}
              </ItemTitle>
              <ItemDescription>
                {format(new Date(file.created_at), "dd.MM.yyyy HH:mm")}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button asChild variant="outline">
                <Link
                  href={
                    file.file_type === FileType.NOTES
                      ? `${roomId}/note/${file.file_id}`
                      : `${roomId}/test/${file.file_id}`
                  }
                >
                  <Eye /> Read
                </Link>
              </Button>
            </ItemActions>
          </Item>
          {index !== files.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  );
};
