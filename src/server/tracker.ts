import { db } from "@/lib/db";
export const relations = {
  interviews: { orderBy: { startsAt: "asc" as const } },
  notes: { orderBy: { createdAt: "desc" as const } },
  reminders: { orderBy: { dueAt: "asc" as const } },
};
export async function getTracker(userId: string) {
  const [applications, resumes] = await Promise.all([
    db.application.findMany({
      where: { userId },
      include: relations,
      orderBy: { appliedAt: "desc" },
    }),
    db.resume.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  return { applications, resumes };
}
export async function ownedApplication(id: string, userId: string) {
  return db.application.findFirst({ where: { id, userId } });
}
