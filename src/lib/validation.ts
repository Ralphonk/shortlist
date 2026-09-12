import { z } from "zod";
export const stages = [
  "APPLIED",
  "OA",
  "TECHNICAL",
  "HR",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;
const text = z.string().trim().max(10000);
const optionalText = text.default("");
export const url = z.union([
  z.literal(""),
  z.url().refine((v) => /^https?:\/\//.test(v), "Use an HTTP or HTTPS URL"),
]);
export const applicationSchema = z.object({
  company: text.min(1).max(150),
  role: text.min(1).max(200),
  location: optionalText,
  website: url.default(""),
  companyInfo: optionalText,
  description: optionalText,
  salary: optionalText,
  stage: z.enum(stages).default("APPLIED"),
  appliedAt: z.iso.datetime().optional(),
  resumeId: z.string().nullable().optional(),
});
export const interviewSchema = z.object({
  title: text.min(1).max(200),
  startsAt: z.iso.datetime(),
  duration: z.number().int().min(5).max(480),
  location: optionalText,
  notes: optionalText,
});
export const reminderSchema = z.object({
  title: text.min(1).max(200),
  dueAt: z.iso.datetime(),
});
export const resumeSchema = z.object({
  name: text.min(1).max(150),
  version: text.min(1).max(50),
  url: url.refine(Boolean, "A resume URL is required"),
  notes: optionalText,
});
export const authSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(10).max(128),
  name: z.string().trim().min(1).max(100).optional(),
});
