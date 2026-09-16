import { InterviewCards } from "./interview-cards";
import { ApplicationTable } from "./application-table";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CalendarDays,
  Check,
  Search,
  Plus,
  Files,
  ExternalLink,
  BellPlus,
  Upload,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Application, TrackerData } from "@/types/tracker";
import { stages, stageLabels, date, type Modal, type Mutate } from "./shared";
type WorkspaceInterview = Application["interviews"][number] & {
  application: Application;
};
type WorkspaceReminder = Application["reminders"][number] & {
  application: Application;
};
export function WorkspaceContent({
  demo,
  view,
  user,
  open,
  error,
  modal,
  data,
  upcoming,
  interviews,
  reminders,
  pending,
  filtered,
  query,
  setQuery,
  filter,
  setFilter,
  setView,
  changeView,
  setSelected,
  busy,
  mutate,
  editResume,
  requestDeleteResume,
}: {
  demo: boolean;
  view: string;
  user: { name: string; email: string };
  open: (kind: Modal, edit?: boolean) => void;
  error: string;
  modal: Modal;
  data: TrackerData;
  upcoming: WorkspaceInterview[];
  interviews: WorkspaceInterview[];
  reminders: WorkspaceReminder[];
  pending: WorkspaceReminder[];
  filtered: Application[];
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  setView: (value: string) => void;
  changeView: (value: string) => void;
  setSelected: (id: string | null) => void;
  busy: boolean;
  mutate: Mutate;
  editResume: (id: string) => void;
  requestDeleteResume: (id: string) => void;
}) {
  const stats = [
    [
      "Total applications",
      data.applications.length,
      "Every opportunity, organized",
      BriefcaseBusiness,
    ],
    [
      "In progress",
      data.applications.filter((a) =>
        ["OA", "TECHNICAL", "HR"].includes(a.stage),
      ).length,
      "Moving through the process",
      ChartNoAxesCombined,
    ],
    [
      "Upcoming interviews",
      upcoming.length,
      "Your next conversations",
      CalendarDays,
    ],
    [
      "Offers received",
      data.applications.filter((a) => a.stage === "OFFER").length,
      "A new chapter awaits",
      Check,
    ],
  ] as const;

  function openForApplication(kind: "interview" | "reminder") {
    if (!data.applications.length) {
      open("application");
      return;
    }
    open(kind);
  }

  return (
    <main className="content">
      {demo && (
        <div className="demo-banner">
          Demo workspace · Sample data, saved for this browser session.
          <Link href="/register">
            Create your account <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {view === "Overview"
              ? "YOUR JOB SEARCH, IN FOCUS"
              : "YOUR PERSONAL WORKSPACE"}
          </span>
          <h1>
            {view === "Overview"
              ? `Let’s make your next move, ${user.name.split(" ")[0]}.`
              : view}
          </h1>
          <p>
            {view === "Overview"
              ? "A little progress, every day. Here’s where things stand."
              : view === "Applications"
                ? "Every opportunity, from the first click to the final decision."
                : view === "Interviews"
                  ? "Prepare well. Show up with confidence."
                  : view === "Analytics"
                    ? "See the patterns behind your progress."
                    : view === "Resumes"
                      ? "The right version for the right opportunity."
                      : "Keep the important follow-ups in sight."}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => open(view === "Resumes" ? "resume" : "application")}
        >
          <Plus size={17} />
          {view === "Resumes" ? "Add resume" : "Add application"}
        </button>
      </div>
      {error && !modal && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {(view === "Overview" || view === "Analytics") && (
        <div className="stats">
          {stats.map(([label, value, caption, Icon]) => (
            <section className="stat" key={label}>
              <div>
                <span>{label}</span>
                <Icon size={17} />
              </div>
              <b>{value.toString().padStart(2, "0")}</b>
              <small>{caption}</small>
            </section>
          ))}
        </div>
      )}
      {view === "Overview" && (
        <div className="overview-grid">
          <section className="panel">
            <div className="panel-title">
              <div>
                <h2>Application pipeline</h2>
                <p>Every step brings you closer.</p>
              </div>
              <span className="muted">All time</span>
            </div>
            <div className="pipeline">
              {stages.slice(0, 5).map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    setView("Applications");
                    setFilter(s);
                  }}
                >
                  <span className={`stage-dot dot-${i}`} />
                  <b>{data.applications.filter((a) => a.stage === s).length}</b>
                  <small>{s === "OA" ? "Assessment" : stageLabels[s]}</small>
                  <div
                    style={{
                      height: Math.max(
                        8,
                        (data.applications.filter((a) => a.stage === s).length /
                          Math.max(1, data.applications.length)) *
                          130,
                      ),
                    }}
                    className={`bar bar-${i}`}
                  />
                </button>
              ))}
            </div>
            <div className="panel-footer">
              <span>Small steps. Real momentum.</span>
              <button onClick={() => changeView("Analytics")}>
                View analytics <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
          <section className="panel">
            <div className="panel-title">
              <div>
                <h2>Coming up next</h2>
                <p>Make room for your next conversation.</p>
              </div>
              <CalendarDays size={18} />
            </div>
            <InterviewCards
              items={upcoming.slice(0, 2)}
              setSelected={setSelected}
            />
            <div className="panel-footer">
              <span>{upcoming.length} scheduled</span>
              <button onClick={() => changeView("Interviews")}>
                All interviews <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        </div>
      )}
      {(view === "Overview" || view === "Applications") && (
        <section className="panel applications">
          <div className="panel-title">
            <div>
              <h2>
                {view === "Overview" ? "Your applications" : "All applications"}{" "}
                <span className="count">{data.applications.length}</span>
              </h2>
              <p>A home for every possibility.</p>
            </div>
            <div className="filters">
              <label className="search">
                <Search size={16} />
                <input
                  aria-label="Search applications"
                  placeholder="Search company or role…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Filter stage"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">All stages</option>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {stageLabels[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ApplicationTable filtered={filtered} setSelected={setSelected} />
        </section>
      )}
      {view === "Interviews" && (
        <section className="panel">
          <div className="panel-title">
            <h2>Interview schedule</h2>
            <span className="muted">Times shown in your local timezone</span>
          </div>
          <InterviewCards
            items={interviews}
            setSelected={setSelected}
            emptyAction={{
              label: data.applications.length
                ? "Schedule interview"
                : "Add an application first",
              onClick: () => openForApplication("interview"),
            }}
          />
        </section>
      )}
      {view === "Reminders" && (
        <section className="panel">
          <div className="panel-title">
            <h2>Your follow-ups</h2>
            <span>{pending.length} pending</span>
          </div>
          {reminders.map((r) => (
            <div className="reminder-row" key={r.id}>
              <input
                type="checkbox"
                aria-label={`Complete ${r.title}`}
                checked={r.done}
                disabled={busy}
                onChange={(e) =>
                  mutate(
                    "toggleReminder",
                    { reminderId: r.id, done: e.target.checked },
                    r.application.id,
                  )
                }
              />
              <button onClick={() => setSelected(r.application.id)}>
                <strong className={r.done ? "strikethrough" : ""}>
                  {r.title}
                </strong>
                <small>
                  {r.application.company} · {date(r.dueAt)}
                </small>
              </button>
              <span
                className={`badge ${!r.done && new Date(r.dueAt) < new Date() ? "rejected" : "applied"}`}
              >
                {r.done
                  ? "Done"
                  : new Date(r.dueAt) < new Date()
                    ? "Overdue"
                    : "Upcoming"}
              </span>
            </div>
          ))}
          {!reminders.length && (
            <div className="empty empty-state">
              <span className="empty-icon">
                <BellPlus size={22} aria-hidden="true" />
              </span>
              <h2>No reminders yet</h2>
              <p>Stay ahead of recruiter follow-ups and important deadlines.</p>
              <button
                className="primary"
                onClick={() => openForApplication("reminder")}
              >
                <Plus size={17} aria-hidden="true" />
                {data.applications.length
                  ? "Add reminder"
                  : "Add an application first"}
              </button>
            </div>
          )}
        </section>
      )}
      {view === "Resumes" && (
        <div className="resume-grid">
          {data.resumes.map((r) => (
            <section className="panel resume-card" key={r.id}>
              <div className="resume-card-header">
                <span className="resume-file-icon">
                  <Files size={22} aria-hidden="true" />
                </span>
                <span className="badge applied">{r.version}</span>
              </div>
              <h2>{r.name}</h2>
              <p className="resume-notes">
                {r.notes || "Ready for your next application."}
              </p>
              <div className="resume-meta">
                <span>
                  <BriefcaseBusiness size={14} aria-hidden="true" />
                  {
                    data.applications.filter((a) => a.resumeId === r.id).length
                  }{" "}
                  applications
                </span>
                <span>
                  <CalendarDays size={14} aria-hidden="true" />
                  Added {date(r.createdAt)}
                </span>
              </div>
              <a
                className="resume-open"
                href={
                  r.url.includes(".blob.vercel-storage.com")
                    ? `/api/resumes/${r.id}`
                    : r.url
                }
                target="_blank"
                rel="noreferrer"
              >
                View document <ExternalLink size={15} />
              </a>
              <div className="resume-card-actions">
                <button className="secondary" onClick={() => editResume(r.id)}>
                  <Pencil size={14} aria-hidden="true" />
                  Edit
                </button>
                <button
                  className="resume-delete"
                  onClick={() => requestDeleteResume(r.id)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Delete
                </button>
              </div>
            </section>
          ))}
          {!data.resumes.length && (
            <section className="panel empty empty-state">
              <span className="empty-icon">
                <Files size={24} aria-hidden="true" />
              </span>
              <h2>No resumes uploaded</h2>
              <p>
                Add a hosted PDF or Google Drive link, then attach it to an
                application.
              </p>
              <button className="primary" onClick={() => open("resume")}>
                <Upload size={17} aria-hidden="true" />
                Upload resume
              </button>
            </section>
          )}
        </div>
      )}
      {view === "Analytics" && (
        <div className="overview-grid">
          <section className="panel">
            <div className="panel-title">
              <h2>Applications by stage</h2>
            </div>
            <div className="analytics-bars">
              {stages.map((s) => (
                <div key={s}>
                  <span>{stageLabels[s]}</span>
                  <div>
                    <i
                      style={{
                        width: `${data.applications.length ? (data.applications.filter((a) => a.stage === s).length / data.applications.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <b>{data.applications.filter((a) => a.stage === s).length}</b>
                </div>
              ))}
            </div>
          </section>
          <section className="panel">
            <div className="panel-title">
              <h2>Offer conversion</h2>
            </div>
            <div className="conversion">
              <b>
                {data.applications.length
                  ? Math.round(
                      (data.applications.filter((a) => a.stage === "OFFER")
                        .length /
                        data.applications.length) *
                        100,
                    )
                  : 0}
                <span>%</span>
              </b>
              <p>of all applications currently at offer stage</p>
              <small>
                {data.applications.filter((a) => a.stage === "REJECTED").length}{" "}
                rejected ·{" "}
                {
                  data.applications.filter((a) => a.stage === "WITHDRAWN")
                    .length
                }{" "}
                withdrawn
              </small>
            </div>
          </section>
        </div>
      )}
      <footer className="workspace-footer">
        A little more organized. A little closer to what’s next.
        <span>shortlist ◈</span>
      </footer>
    </main>
  );
}
