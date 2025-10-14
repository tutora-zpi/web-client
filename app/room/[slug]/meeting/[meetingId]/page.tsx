import Meeting from "@/components/meeting/meeting";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; meetingId: string }>;
}) {
  const { slug, meetingId } = await params;
  return <Meeting meetingId={meetingId} classId={slug} />;
}
