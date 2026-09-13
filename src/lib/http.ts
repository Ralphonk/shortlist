import { NextRequest, NextResponse } from "next/server.js";
import { ZodError } from "zod";

export function checkOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) {
    const referer = req.headers.get("referer");
    if (!referer) return;

    try {
      const ref = new URL(referer);
      if (ref.origin === req.nextUrl.origin) return;
    } catch {
      // Ignore malformed referer values and continue with the same-origin fallback.
    }

    throw new Error("Invalid request origin");
  }

  const allowedOrigins = new Set([req.nextUrl.origin]);

  if (process.env.NODE_ENV !== "production") {
    const host = req.nextUrl.host;
    if (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) {
      allowedOrigins.add(`http://localhost:${req.nextUrl.port || "3001"}`);
      allowedOrigins.add(`http://127.0.0.1:${req.nextUrl.port || "3001"}`);
    }
  }

  if (!allowedOrigins.has(origin)) throw new Error("Invalid request origin");
}

export async function parseRequestBody(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await req.json();
  }

  const form = await req.formData();
  return Object.fromEntries(
    [...form.entries()].map(([key, value]) => [key, value instanceof File ? value.name : String(value)]),
  );
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  if (error instanceof Error && error.message === "Invalid request origin")
    return NextResponse.json({ error: error.message }, { status: 403 });
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "Unknown",
  );
  return NextResponse.json(
    { error: "Unable to save. Please try again." },
    { status: 500 },
  );
}
