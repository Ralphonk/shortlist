import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getTracker } from "@/server/tracker";
import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await getUser();
  if (!user) redirect("/login");
  const data = await getTracker(user.id);
  return <Workspace initial={JSON.parse(JSON.stringify(data))} user={user} />;
}
