import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { checkOrigin } from "../src/lib/http.ts";
import {
  applicationSchema,
  resumeSchema,
  interviewSchema,
} from "../src/lib/validation.ts";
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
