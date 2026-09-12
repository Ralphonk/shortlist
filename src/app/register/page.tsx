import { AuthForm } from "@/components/auth-form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  if (await getUser()) redirect("/dashboard");
  return <AuthForm register />;
}

