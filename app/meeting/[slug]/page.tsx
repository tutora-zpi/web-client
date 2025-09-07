import Meeting from "@/components/meeting/meeting";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Meeting meetingId={slug} />;
}
