import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RecoveryForm } from "@/components/recovery-form";
import { ThemeToggle } from "@/components/theme-toggle";
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const token = (await searchParams).token ?? "";
  return <main className="auth"><nav className="auth-nav" aria-label="Main navigation"><Link href="/" className="brand">◈ shortlist</Link><ThemeToggle /></nav><RecoveryForm token={token} /></main>;
}
