export type Stage =
  "APPLIED" | "OA" | "TECHNICAL" | "HR" | "OFFER" | "REJECTED" | "WITHDRAWN";
export type Interview = {
  id: string;
  title: string;
  startsAt: string;
  duration: number;
  location: string;
  notes: string;
};
export type Reminder = {
  id: string;
  title: string;
  dueAt: string;
  done: boolean;
};
export type Resume = {
  id: string;
  name: string;
  version: string;
  url: string;
  notes: string;
  createdAt: string;
};
export type Application = {
  id: string;
  company: string;
  role: string;
  location: string;
  website: string;
  companyInfo: string;
  description: string;
  salary: string;
  stage: Stage;
  appliedAt: string;
  resumeId?: string | null;
  interviews: Interview[];
  notes: { id: string; body: string; createdAt: string }[];
  reminders: Reminder[];
};
export type TrackerData = { applications: Application[]; resumes: Resume[] };
