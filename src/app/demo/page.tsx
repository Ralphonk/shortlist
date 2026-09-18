import { Workspace } from "@/components/workspace";
import { demoData } from "@/lib/demo";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Workspace
      initial={demoData()}
      user={{ name: "Alex Morgan", email: "alex@example.com", avatarUrl: null }}
      demo
    />
  );
}
