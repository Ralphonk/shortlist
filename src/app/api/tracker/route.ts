import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, failure } from "@/lib/http";
import {
  applicationSchema,
  interviewSchema,
  reminderSchema,
  resumeSchema,
} from "@/lib/validation";
import { getTracker, ownedApplication } from "@/server/tracker";
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return new NextResponse(null, { status: 401 });
    return NextResponse.json(await getTracker(user.id));
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const user = await getUser();
    if (!user) return new NextResponse(null, { status: 401 });
    const body = await req.json();
    const { action, id, data } = body;
    if (action === "saveResume") {
      const parsed = resumeSchema.parse(data);
      if (id) {
        const previous = await db.resume.findFirst({
          where: { id, userId: user.id },
        });
        if (!previous) return new NextResponse(null, { status: 404 });
        const updated = await db.resume.updateMany({
          where: { id, userId: user.id },
          data: parsed,
        });
        if (!updated.count) return new NextResponse(null, { status: 404 });
        if (previous.url !== parsed.url) await deleteBlob(previous.url);
      } else {
        await db.resume.create({ data: { ...parsed, userId: user.id } });
      }
    } else if (action === "deleteResume") {
      if (typeof id !== "string")
        return new NextResponse(null, { status: 404 });
      const resume = await db.resume.findFirst({
        where: { id, userId: user.id },
      });
      if (!resume) return new NextResponse(null, { status: 404 });
      const deleted = await db.resume.deleteMany({
        where: { id, userId: user.id },
      });
      if (!deleted.count) return new NextResponse(null, { status: 404 });
      await deleteBlob(resume.url);
    } else if (action === "saveApplication") {
      const parsed = applicationSchema.parse(data);
      if (
        parsed.resumeId &&
        !(await db.resume.findFirst({
          where: { id: parsed.resumeId, userId: user.id },
        }))
      )
        return new NextResponse(null, { status: 404 });
      if (id) {
        if (!(await ownedApplication(id, user.id)))
          return new NextResponse(null, { status: 404 });
        await db.application.update({ where: { id }, data: parsed });
      } else
        await db.application.create({ data: { ...parsed, userId: user.id } });
    } else {
      if (typeof id !== "string" || !(await ownedApplication(id, user.id)))
        return new NextResponse(null, { status: 404 });
      if (action === "deleteApplication")
        await db.application.delete({ where: { id } });
      else if (action === "addInterview")
        await db.interview.create({
          data: { ...interviewSchema.parse(data), applicationId: id },
        });
      else if (action === "addReminder")
        await db.reminder.create({
          data: { ...reminderSchema.parse(data), applicationId: id },
        });
      else if (action === "addNote") {
        if (
          typeof data.body !== "string" ||
          !data.body.trim() ||
          data.body.length > 10000
        )
          return NextResponse.json(
            { error: "Enter a note under 10,000 characters" },
            { status: 400 },
          );
        await db.note.create({
          data: { body: data.body.trim(), applicationId: id },
        });
      } else if (action === "toggleReminder") {
        await db.reminder.updateMany({
          where: { id: data.reminderId, applicationId: id },
          data: { done: Boolean(data.done) },
        });
      } else
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json(await getTracker(user.id));
  } catch (e) {
    return failure(e);
  }
}

async function deleteBlob(url: string) {
  if (!url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (error) {
    console.error("Unable to clean up resume blob", error);
  }
}
