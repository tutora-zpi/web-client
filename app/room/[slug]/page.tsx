import { Navbar } from "@/components/navbar";
import { InviteUserDialog } from "@/components/room/invite-user-dialog";
import { requireAuth } from "@/lib/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await requireAuth();

  return (
    <>
      <Navbar />
      <div>Room Page</div>
      <InviteUserDialog classId={slug} host={user} />
    </>
  );
}
