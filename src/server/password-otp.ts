import { randomInt, randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { recoveryEmailConfig, sendRecoveryEmail } from "@/lib/recovery-email";

export async function issuePasswordOtp(email: string, config: NonNullable<ReturnType<typeof recoveryEmailConfig>>) {
  const challengeId = randomBytes(32).toString("hex");
  const code = randomInt(0, 1000000).toString().padStart(6, "0");
  const codeHash = hashPassword(code);
  const now = new Date();
  const changed = await db.user.updateMany({
    where: { email, OR: [{ resetSentAt: null }, { resetSentAt: { lte: new Date(now.getTime() - 60000) } }] },
    data: { resetChallengeId: challengeId, resetCodeHash: codeHash, resetAttempts: 0, resetSentAt: now, resetToken: null, resetTokenExpiresAt: new Date(now.getTime() + 300000) },
  });

  if (!changed.count) return { challengeId };

  try {
    await sendRecoveryEmail(email, code, config);
    return { challengeId };
  } catch (error) {
    await db.user.updateMany({ where: { resetChallengeId: challengeId }, data: { resetCodeHash: null, resetChallengeId: null, resetTokenExpiresAt: null } });
    console.error("Password recovery email delivery failed", error);
    return null;
  }
}

export async function verifyPasswordOtp(challengeId: string, code: string) {
  return db.$transaction(async tx => {
    // Lock and reserve one of five attempts, including under concurrent requests.
    const attempt = await tx.user.updateMany({
      where: { resetChallengeId: challengeId, resetAttempts: { lt: 5 }, resetCodeHash: { not: null }, resetTokenExpiresAt: { gt: new Date() } },
      data: { resetAttempts: { increment: 1 } },
    });
    if (!attempt.count) return null;
    const user = await tx.user.findUnique({ where: { resetChallengeId: challengeId } });
    if (!user?.resetCodeHash || !verifyPassword(code, user.resetCodeHash)) return null;
    const token = randomBytes(32).toString("hex");
    await tx.user.update({ where: { id: user.id }, data: {
      resetCodeHash: null, resetChallengeId: null,
      resetToken: createHash("sha256").update(token).digest("hex"),
      resetTokenExpiresAt: new Date(Date.now() + 600000),
    } });
    return token;
  });
}
