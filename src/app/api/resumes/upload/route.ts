import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { checkOrigin } from "@/lib/http";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        checkOrigin(request);
        const user = await getUser();
        if (!user) throw new Error("Unauthorized");
        if (
          !pathname.startsWith("resumes/") ||
          !pathname.toLowerCase().endsWith(".pdf")
        )
          throw new Error("Only resume PDFs are allowed");

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_RESUME_SIZE,
          addRandomSuffix: true,
          tokenPayload: user.id,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Resume upload failed", error);
    return NextResponse.json(
      { error: "Unable to upload this resume" },
      { status: 400 },
    );
  }
}
