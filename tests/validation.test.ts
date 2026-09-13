import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { checkOrigin } from "../src/lib/http.ts";
import {
  applicationSchema,
  resumeSchema,
  interviewSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../src/lib/validation.ts";
import { parseRequestBody } from "../src/lib/http.ts";
test("Rejects executable resume URLs", () => {
  assert.equal(
    resumeSchema.safeParse({
      name: "CV",
      version: "v1",
      url: "javascript:alert(1)",
    }).success,
    false,
  );
});
test("Rejects unknown application stages", () => {
  assert.equal(
    applicationSchema.safeParse({
      company: "Acme",
      role: "Engineer",
      stage: "INVALID",
    }).success,
    false,
  );
});
test("Rejects invalid interview duration", () => {
  assert.equal(
    interviewSchema.safeParse({
      title: "Call",
      startsAt: new Date().toISOString(),
      duration: -1,
    }).success,
    false,
  );
});
test("Defaults new applications to applied", () => {
  assert.equal(
    applicationSchema.parse({ company: "Acme", role: "Engineer" }).stage,
    "APPLIED",
  );
});

test("Rejects invalid forgot-password email input", () => {
  assert.equal(
    forgotPasswordSchema.safeParse({ email: "not-an-email" }).success,
    false,
  );
});

test("Parses HTML form submissions for forgot-password and reset-password", async () => {
  const req = new Request("http://localhost:3001/api/auth/forgot-password", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: "user@example.com" }).toString(),
  });

  const parsed = await parseRequestBody(req as unknown as NextRequest);
  assert.deepEqual(parsed, { email: "user@example.com" });
});

test("Requires a reset token and strong password", () => {
  assert.equal(
    resetPasswordSchema.safeParse({ token: "abc", password: "short" }).success,
    false,
  );
});

test("Allows same-site HTML form posts without an Origin header", () => {
  const req = {
    headers: new Headers({ referer: "http://127.0.0.1:3001/forgot-password" }),
    nextUrl: {
      origin: "http://127.0.0.1:3001",
      host: "127.0.0.1:3001",
      port: "3001",
    },
  } as unknown as NextRequest;

  assert.doesNotThrow(() => checkOrigin(req));
});

test("Allows localhost and 127.0.0.1 in local development", () => {
  const req = {
    headers: new Headers({ origin: "http://localhost:3001" }),
    nextUrl: {
      origin: "http://127.0.0.1:3001",
      host: "127.0.0.1:3001",
      port: "3001",
    },
  } as unknown as NextRequest;

  assert.doesNotThrow(() => checkOrigin(req));
});
