"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eye, EyeOff } from "lucide-react";

export function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth">
      <nav className="auth-nav" aria-label="Main navigation">
      <Link href="/" className="brand">
        ◈ shortlist
      </Link>
      <ThemeToggle />
      </nav>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const data = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const r = await fetch(
              `/api/auth/${register ? "register" : "login"}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
              },
            );
            const json = await r.json();
            if (!r.ok) throw new Error(json.error);
            location.href = "/dashboard";
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to connect");
            setBusy(false);
          }
        }}
      >
        <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>{register ? "Make your next move." : "Welcome back."}</h1>
        {register && (
          <label>
            Your name
            <input name="name" required maxLength={100} autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <div className="password-input-wrap">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={10}
              maxLength={128}
              required
              autoComplete={register ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
            </button>
          </div>
        </label>
        <small>At least 10 characters.</small>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account" : "Sign in"} →
        </button>
        <p>
          {register ? "Already registered?" : "New here?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <Link href="/demo">Explore without an account →</Link>
      </form>
    </main>
  );
}
