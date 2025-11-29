import { Navbar } from "@/components/navbar";
import { getMarkdown } from "@/lib/getFileContent";
import { FileType } from "@/types/class";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Response } from "@/components/ui/shadcn-io/ai/response";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }
  const { slug, id } = await params;

  const content = await getMarkdown(token, slug, id, FileType.NOTES);

  return (
    <>
      <Navbar />
      <Response className="mt-2 px-4">{content}</Response>
    </>
  );
}
