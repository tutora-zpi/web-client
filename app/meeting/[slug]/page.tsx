import Meeting from "@/components/meeting/meeting";

export default async function Page({ params }: { params: { slug: string } }) {
  return <Meeting meetingId={params.slug} />;
}
