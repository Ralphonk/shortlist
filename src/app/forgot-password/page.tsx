import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RecoveryForm } from "@/components/recovery-form";
import { ThemeToggle } from "@/components/theme-toggle";
export default async function ForgotPasswordPage() {
  if (await getUser()) redirect("/dashboard");
  return <main className="auth"><nav className="auth-nav" aria-label="Main navigation"><Link href="/" className="brand">◈ shortlist</Link><ThemeToggle /></nav><RecoveryForm /></main>;
}
