import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authSchema } from "@/lib/validation";
import {
  createSession,
  hashPassword,
  verifyPassword,
  logout,
} from "@/lib/auth";
import { checkOrigin, failure } from "@/lib/http";
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
    if (!["login", "register"].includes(action))
      return new NextResponse(null, { status: 404 });
    const data = authSchema.parse(await req.json());
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
