"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, Eye, EyeOff } from "lucide-react";

export function RecoveryForm({ token: initialToken }: { token?: string }) {
  const [step, setStep] = useState<"email" | "otp" | "password" | "done">(initialToken ? "password" : "email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [token, setToken] = useState(initialToken ?? "");
  const [digits, setDigits] = useState(Array<string>(6).fill(""));
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const readOtpCode = () => {
    const nextCode = inputs.current.map((input) => input?.value ?? "").join("").replace(/\D/g, "").slice(0, 6);
    if (nextCode !== otpCode) setOtpCode(nextCode);
    return nextCode;
  };
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => { if (step === "otp") inputs.current[0]?.focus(); }, [step]);

  async function request(action: string, data: object) {
    const response = await fetch(`/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || "Unable to complete this request. Please try again.");
    return result;
  }
  async function sendCode() {
    const result = await request("forgot-password", { email });
    setChallengeId(result.challengeId);
    setDigits(Array<string>(6).fill(""));
    setCooldown(result.resendAfter ?? 60);
    setStep("otp");
  }
  function fillDigits(value: string, index: number) {
    const numbers = value.replace(/\D/g, "").slice(0, 6 - index);
    setDigits(previous => {
      const next = [...previous];
      if (!numbers) next[index] = "";
      else numbers.split("").forEach((digit, offset) => { next[index + offset] = digit; });
      const mergedCode = next.join("").replace(/\D/g, "").slice(0, 6);
      setOtpCode(mergedCode);
      return next;
    });
    if (numbers) inputs.current[Math.min(index + numbers.length, 5)]?.focus();
  }
  if (step === "done") return <section role="status" className="recovery-success">
    <CheckCircle2 size={38} /><h1>Password updated.</h1>
    <p>Sign in with your new password. Your previous sessions have been signed out.</p>
    <Link className="primary" href="/login">Back to sign in →</Link>
  </section>;

  return <form onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setBusy(true); setError("");
    try {
      if (step === "email") await sendCode();
      else if (step === "otp") {
        const code = readOtpCode() || otpCode;
        if (code.length !== 6) {
          setError("Please enter the full 6-digit code.");
          return;
        }
        const result = await request("verify-reset-otp", { challengeId, code });
        setToken(result.token); setOtpCode(""); setDigits(Array<string>(6).fill("")); setStep("password");
      } else {
        await request("reset-password", { token, password: new FormData(form).get("password") });
        setToken(""); setStep("done");
      }
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }}>
    <span className="eyebrow">ACCOUNT RECOVERY</span>
    <h1>{step === "email" ? "Reset your password." : step === "otp" ? "Check your email." : "Choose a new password."}</h1>
    {step === "email" && <label>Email<input name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" disabled={busy} /></label>}
    {step === "otp" && <>
      <p className="recovery-copy">If an account exists for <strong>{email}</strong>, you’ll receive a six-digit code. Check your spam folder too.</p>
      <fieldset className="otp-fields" disabled={busy}>
        <legend>Verification code</legend>
        <div className="otp-inputs">{digits.map((digit, index) => <input key={index}
          ref={element => { inputs.current[index] = element; }}
          aria-label={`Digit ${index + 1} of 6`} inputMode="numeric" type="text"
          autoComplete={index === 0 ? "one-time-code" : "off"} pattern="[0-9]" required
          value={digit} onFocus={event => event.target.select()}
          onChange={event => fillDigits(event.target.value, index)}
          onPaste={event => { event.preventDefault(); fillDigits(event.clipboardData.getData("text"), index); }}
          onKeyDown={event => {
            if (event.key === "Backspace" && !digit && index > 0) inputs.current[index - 1]?.focus();
            if (event.key === "ArrowLeft" && index > 0) { event.preventDefault(); inputs.current[index - 1]?.focus(); }
            if (event.key === "ArrowRight" && index < 5) { event.preventDefault(); inputs.current[index + 1]?.focus(); }
          }}
        />)}</div>
      </fieldset>
      <p className="recovery-copy">Valid for 5 minutes. Maximum 5 verification attempts.</p>
      <button type="button" className="secondary" disabled={busy || cooldown > 0} onClick={async () => {
        setBusy(true); setError("");
        try { setOtpCode(""); setDigits(Array<string>(6).fill("")); await sendCode(); inputs.current[0]?.focus(); }
        catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
        finally { setBusy(false); }
      }}>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}</button>
      <button type="button" className="recovery-change" disabled={busy} onClick={() => { setStep("email"); setError(""); }}>Change email</button>
    </>}
    {step === "password" && <label>New password<div className="password-input-wrap">
      <input name="password" type={showPassword ? "text" : "password"} minLength={10} maxLength={128} required autoComplete="new-password" disabled={busy} />
      <button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>
        {showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
      </button>
    </div></label>}
    {error && <p className="error" role="alert">{error}</p>}
    <button className="primary" disabled={busy || (step === "otp" && (readOtpCode() || otpCode).length !== 6)} aria-busy={busy}>
      {busy && <LoaderCircle size={16} className="recovery-spinner" aria-hidden="true" />}
      {busy ? "Please wait…" : step === "email" ? "Send code →" : step === "otp" ? "Verify code →" : "Update password →"}
    </button>
    <p><Link href="/login">Back to sign in</Link></p>
  </form>;
}
