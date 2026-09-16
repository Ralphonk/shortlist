import { z } from "zod";
import {
  applicationSchema,
  interviewSchema,
  reminderSchema,
  resumeSchema,
} from "./validation";
export function validateCommand(action: string, data: Record<string, unknown>) {
  switch (action) {
    case "saveApplication":
      return applicationSchema.parse(data);
    case "saveResume":
      return resumeSchema.parse(data);
    case "addInterview":
      return interviewSchema.parse(data);
    case "addReminder":
      return reminderSchema.parse(data);
    case "addNote":
      return z
        .object({ body: z.string().trim().min(1).max(10000) })
        .parse(data);
    case "toggleReminder":
      return z
        .object({ reminderId: z.string().min(1), done: z.boolean() })
        .parse(data);
    case "deleteApplication":
    case "deleteResume":
      return {};
    default:
      throw new Error("Unknown action");
  }
}
