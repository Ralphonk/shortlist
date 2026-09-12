import { createHash } from "node:crypto";
import { db } from "./db";
// Database-backed counters work across multiple server instances.
export async function allowAuthAttempt(email: string) {
  const windowMs = 15 * 60 * 1000;
  const bucket = Math.floor(Date.now() / windowMs);
  const key = createHash("sha256").update(`${email}:${bucket}`).digest("hex");
  const counter = await db.authAttempt.upsert({
    where: { key },
    create: { key, count: 1, expiresAt: new Date((bucket + 1) * windowMs) },
    update: { count: { increment: 1 } },
  });
  return counter.count <= 10;
}
