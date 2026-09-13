import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";
import { recoveryEmailConfig } from "@/lib/recovery-email";
import { issuePasswordOtp, verifyPasswordOtp } from "@/server/password-otp";
import {
  authSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "@/lib/validation";
import {
  createSession,
  hashPassword,
  verifyPassword,
  logout,
} from "@/lib/auth";
import { checkOrigin, failure, parseRequestBody } from "@/lib/http";
import { allowAuthAttempt } from "@/lib/rate-limit";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    checkOrigin(req);
    const { action } = await params;
    if (action === "logout") {
      await logout();
      return NextResponse.json({ ok: true });
    }
    if (action === "forgot-password") {
      const data = forgotPasswordSchema.parse(await parseRequestBody(req));
      const config = recoveryEmailConfig();
      if (!config) return NextResponse.json({ error: "Password reset emails are temporarily unavailable. Please try again later." }, { status: 503 });
      if (!(await allowAuthAttempt(`recovery:${data.email}`))) return NextResponse.json({ error: "Too many requests. Please try again in 15 minutes." }, { status: 429 });
      const result = await issuePasswordOtp(data.email, config);
      if (!result) {
        return NextResponse.json(
          { error: "Password reset emails are temporarily unavailable. Please try again later." },
          { status: 503 },
        );
      }
      return NextResponse.json({
        ok: true,
        challengeId: result.challengeId,
        resendAfter: 60,
        message:
          "If an account exists for that email, you will receive a six-digit code.",
      });
    }

    if (action === "verify-reset-otp") {
      const { challengeId, code } = verifyOtpSchema.parse(await parseRequestBody(req));
      const token = await verifyPasswordOtp(challengeId, code);
      if (!token) return NextResponse.json({ error: "Invalid or expired code. After 5 attempts, request a new code." }, { status: 400 });
      return NextResponse.json({ ok: true, token }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "reset-password") {
      const data = resetPasswordSchema.parse(await parseRequestBody(req));
      const user = await db.user.findFirst({
        where: {
          resetToken: createHash("sha256").update(data.token).digest("hex"),
          resetTokenExpiresAt: { gt: new Date() },
        },
      });
      if (!user) {
        return NextResponse.json(
          { error: "Your reset session has expired. Please request a new code." },
          { status: 400 },
        );
      }
      if (verifyPassword(data.password, user.passwordHash)) {
        return NextResponse.json(
          { error: "Your new password must be different from your current password." },
          { status: 400 },
        );
      }
      await db.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: user.id, resetToken: createHash("sha256").update(data.token).digest("hex"), resetTokenExpiresAt: { gt: new Date() } },
        data: {
          passwordHash: hashPassword(data.password),
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      });
      if (result.count !== 1) throw new Error("Reset token already consumed");
      await tx.session.deleteMany({ where: { userId: user.id } });
      });
      return NextResponse.json({ ok: true });
    }

    if (!["login", "register"].includes(action))
      return new NextResponse(null, { status: 404 });
    const data = authSchema.parse(await parseRequestBody(req));
    if (!(await allowAuthAttempt(data.email)))
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        { status: 429 },
      );
    let user = await db.user.findUnique({ where: { email: data.email } });
    if (action === "register") {
      if (!data.name)
        return NextResponse.json({ error: "Enter your name" }, { status: 400 });
      if (user)
        return NextResponse.json(
          { error: "Unable to register this email. Try signing in." },
          { status: 400 },
        );
      user = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: hashPassword(data.password),
        },
      });
    } else if (!user || !verifyPassword(data.password, user.passwordHash))
      return NextResponse.json(
        { error: "Email or password is incorrect" },
        { status: 401 },
      );
    await createSession(user!.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
