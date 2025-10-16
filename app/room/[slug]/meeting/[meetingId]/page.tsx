import Meeting from "@/components/meeting/meeting";
import { Navbar } from "@/components/navbar";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; meetingId: string }>;
}) {
  const { slug, meetingId } = await params;
  return (
    <>
      <Navbar />
      <Meeting meetingId={meetingId} classId={slug} />
    </>
  );
}
