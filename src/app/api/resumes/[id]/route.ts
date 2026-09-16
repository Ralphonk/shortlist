import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const resume = await db.resume.findFirst({
    where: { id: (await params).id, userId: user.id },
  });
  if (!resume) return new NextResponse(null, { status: 404 });

  if (!resume.url.includes(".blob.vercel-storage.com"))
    return NextResponse.redirect(resume.url);

  const result = await get(resume.url, {
    access: "private",
    headers: {
      "If-None-Match": request.headers.get("if-none-match") ?? "",
    },
  });
  if (!result) return new NextResponse(null, { status: 404 });
  if (result.statusCode === 304)
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: result.blob.etag },
    });

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": `inline; filename="${resume.name.replace(/["\\]/g, "")}.pdf"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache",
      ETag: result.blob.etag,
    },
  });
}
