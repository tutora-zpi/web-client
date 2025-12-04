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

  const summaries = files.filter((file) => file.file_type === FileType.NOTES);
  const tests = files.filter((file) => file.file_type === FileType.TEST);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Summaries
        </h2>
        {summaries.length === 0 ? (
          <p className="text-muted-foreground">No summaries available</p>
        ) : (
          <ItemGroup className="gap-2">
            {summaries.map((file, index) => (
              <React.Fragment key={file.file_id}>
                <Item>
                  <ItemContent>
                    <ItemTitle>
                      {" "}
                      <NotebookTabs /> Summary
                    </ItemTitle>
                    <ItemDescription>
                      {format(new Date(file.created_at), "dd.MM.yyyy")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button asChild variant="outline">
                      <Link href={`${roomId}/note/${file.file_id}`}>
                        <Eye /> Read
                      </Link>
                    </Button>
                  </ItemActions>
                </Item>
                {index !== summaries.length - 1 && <ItemSeparator />}
              </React.Fragment>
            ))}
          </ItemGroup>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Tests
        </h2>
        {tests.length === 0 ? (
          <p className="text-muted-foreground">No tests available</p>
        ) : (
          <ItemGroup className="gap-2">
            {tests.map((file, index) => (
              <React.Fragment key={file.file_id}>
                <Item>
                  <ItemContent>
                    <ItemTitle>
                      {" "}
                      <FlaskConical />
                      Test
                    </ItemTitle>
                    <ItemDescription>
                      {format(new Date(file.created_at), "dd.MM.yyyy")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button asChild variant="outline">
                      <Link href={`${roomId}/test/${file.file_id}`}>
                        <Eye /> Read
                      </Link>
                    </Button>
                  </ItemActions>
                </Item>
                {index !== tests.length - 1 && <ItemSeparator />}
              </React.Fragment>
            ))}
          </ItemGroup>
        )}
      </div>
    </div>
  );
};
