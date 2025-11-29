import { FileType } from "@/types/class";

const getFileContent = async (
  token: string,
  roomId: string,
  fileId: string,
  fileType: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NOTE_SERVICE}/presigned/${roomId}/${fileType}/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.status}`);
    }

    const fileData = await response.json();

    return fileData.url;
  } catch (error) {
    console.error("Error fetching file content:", error);
    return null;
  }
};

export const getMarkdown = async (
  token: string,
  roomId: string,
  fileId: string,
  fileType: FileType
) => {
  const fileUrl = await getFileContent(token, roomId, fileId, fileType);

  if (!fileUrl) {
    return "";
  }

  const response = await fetch(fileUrl);
  return await response.text();
};
