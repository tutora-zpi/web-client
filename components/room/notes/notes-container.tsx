import { FileType, NoteFile } from "@/types/class";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Eye, FlaskConical, NotebookTabs } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      <div className="text-center py-8 text-muted-foreground">Brak notatek</div>
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
