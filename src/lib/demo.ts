import { TrackerData, Stage } from "@/types/tracker";
export function demoData(): TrackerData {
  const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString();
  return {
    resumes: [],
    applications: [
      ["Linear", "Frontend Engineer", "TECHNICAL", "Remote", "₹18–24 LPA"],
      ["Figma", "UI Engineer", "OA", "Bengaluru", "₹20–28 LPA"],
      ["Notion", "Product Engineer", "APPLIED", "Remote", "₹16–22 LPA"],
      ["Razorpay", "Frontend Developer", "HR", "Bengaluru", "₹14–20 LPA"],
      ["Vercel", "Design Engineer", "APPLIED", "Remote", ""],
      ["Atlassian", "Software Engineer", "OFFER", "Bengaluru", "₹24 LPA"],
    ].map(([company, role, stage, location, salary], i) => ({
      id: `demo-${i}`,
      company,
      role,
      stage: stage as Stage,
      location,
      salary,
      website: "",
      companyInfo: "Sample company information. Replace with your research.",
      description:
        "Build thoughtful, accessible web experiences with React and TypeScript.",
      appliedAt: day(-i - 2),
      notes: [],
      reminders:
        i === 1
          ? [
              {
                id: "reminder-1",
                title: "Complete the online assessment",
                dueAt: day(1),
                done: false,
              },
            ]
          : [],
      interviews:
        i === 0 || i === 3
          ? [
              {
                id: `interview-${i}`,
                title: i === 0 ? "Technical interview" : "HR conversation",
                startsAt: day(i === 0 ? 1 : 3),
                duration: 60,
                location: "Video call",
                notes: "",
              },
            ]
          : [],
    })),
  };
}
