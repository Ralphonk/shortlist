import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Files,
  Bell,
} from "lucide-react";
import type { Stage } from "@/types/tracker";
export const stageLabels: Record<Stage, string> = {
  APPLIED: "Applied",
  OA: "Online assessment",
  TECHNICAL: "Technical",
  HR: "HR interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};
export const stages = Object.keys(stageLabels) as Stage[];
export const navigation = [
  ["Overview", LayoutDashboard],
  ["Applications", BriefcaseBusiness],
  ["Interviews", CalendarDays],
  ["Analytics", ChartNoAxesCombined],
  ["Resumes", Files],
  ["Reminders", Bell],
] as const;
export const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
export type Modal =
  "application" | "resume" | "interview" | "reminder" | "note" | null;

export type Mutate = (
  action: string,
  payload: Record<string, unknown>,
  id?: string,
) => Promise<boolean>;
