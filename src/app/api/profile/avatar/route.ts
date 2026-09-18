import { get, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { checkOrigin } from "@/lib/http";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user || !user.avatarUrl) return new NextResponse(null, { status: 404 });
  if (!user.avatarUrl.includes(".blob.vercel-storage.com"))
    return NextResponse.redirect(user.avatarUrl);

  const result = await get(user.avatarUrl, {
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
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-cache",
      ETag: result.blob.etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File))
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return NextResponse.json({ error: "Only JPG, PNG or WebP photos are allowed" }, { status: 400 });
    if (file.size > MAX_AVATAR_SIZE)
      return NextResponse.json({ error: "Photo must be 2 MB or smaller" }, { status: 400 });

    const blob = await put(`avatars/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Unable to upload this photo",
      },
      { status: 400 },
    );
  }
}
