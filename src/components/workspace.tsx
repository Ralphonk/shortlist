"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Files,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Check,
  LogOut,
  X,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { Application, TrackerData, Stage } from "@/types/tracker";
import { validateCommand } from "@/lib/commands";
const stageLabels: Record<Stage, string> = {
  APPLIED: "Applied",
  OA: "Online assessment",
  TECHNICAL: "Technical",
  HR: "HR interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};
const stages = Object.keys(stageLabels) as Stage[];
const navigation = [
  ["Overview", LayoutDashboard],
  ["Applications", BriefcaseBusiness],
  ["Interviews", CalendarDays],
  ["Analytics", ChartNoAxesCombined],
  ["Resumes", Files],
  ["Reminders", Bell],
] as const;
const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
type Modal =
  "application" | "resume" | "interview" | "reminder" | "note" | null;
export function Workspace({
  initial,
  user,
  demo = false,
}: {
  initial: TrackerData;
  user: { name: string; email: string };
  demo?: boolean;
}) {
  const [data, setData] = useState(initial),
    [view, setView] = useState("Overview"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("ALL"),
    [modal, setModal] = useState<Modal>(null),
    [selected, setSelected] = useState<string | null>(null),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [logoutBusy, setLogoutBusy] = useState(false),
    [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const loggingOut = useRef(false);

  useEffect(() => {
    if (demo) return;

    if (!history.state?.shortlistDashboardGuard) {
      history.pushState(
        { ...(history.state ?? {}), shortlistDashboardGuard: true },
        "",
        location.href,
      );
    }

    const keepDashboardOpen = () => {
      if (!loggingOut.current) history.forward();
    };

    window.addEventListener("popstate", keepDashboardOpen);
    return () => window.removeEventListener("popstate", keepDashboardOpen);
  }, [demo]);

  useEffect(() => {
    if (demo) {
      try {
        const saved = sessionStorage.getItem("shortlist-demo");
        if (saved) setData(JSON.parse(saved));
      } catch {
        /* A fresh demo remains available if storage is disabled. */
      }
    }
  }, [demo]);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const active = data.applications.find((a) => a.id === selected);
  const interviews = data.applications
    .flatMap((a) => a.interviews.map((i) => ({ ...i, application: a })))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const upcoming = interviews.filter((i) => new Date(i.startsAt) >= new Date());
  const reminders = data.applications
    .flatMap((a) => a.reminders.map((r) => ({ ...r, application: a })))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const pending = reminders.filter((r) => !r.done);
  const filtered = data.applications.filter(
    (a) =>
      (filter === "ALL" || a.stage === filter) &&
      `${a.company} ${a.role} ${a.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function mutate(
    action: string,
    payload: Record<string, unknown>,
    id?: string,
  ) {
    setBusy(true);
    setError("");
    try {
      payload = validateCommand(action, payload);
      let next: TrackerData;
      if (demo) {
        next = structuredClone(data);
        const uid = crypto.randomUUID(),
          now = new Date().toISOString();
        if (action === "saveResume")
          next.resumes.unshift({
            ...payload,
            id: uid,
            createdAt: now,
          } as TrackerData["resumes"][number]);
        else if (action === "saveApplication") {
          if (id)
            next.applications = next.applications.map((a) =>
              a.id === id ? { ...a, ...payload } : a,
            );
          else
            next.applications.unshift({
              ...payload,
              id: uid,
              appliedAt: String(payload.appliedAt || now),
              interviews: [],
              notes: [],
              reminders: [],
            } as unknown as Application);
        } else {
          const a = next.applications.find((a) => a.id === id);
          if (!a) throw new Error("Application not found");
          if (action === "addNote")
            a.notes.unshift({
              id: uid,
              body: String(payload.body),
              createdAt: now,
            });
          if (action === "addInterview")
            a.interviews.push({
              ...payload,
              id: uid,
            } as Application["interviews"][number]);
          if (action === "addReminder")
            a.reminders.push({
              ...payload,
              id: uid,
              done: false,
            } as Application["reminders"][number]);
          if (action === "toggleReminder")
            a.reminders = a.reminders.map((r) =>
              r.id === payload.reminderId
                ? { ...r, done: Boolean(payload.done) }
                : r,
            );
          if (action === "deleteApplication")
            next.applications = next.applications.filter((a) => a.id !== id);
        }
        sessionStorage.setItem("shortlist-demo", JSON.stringify(next));
      } else {
        const response = await fetch("/api/tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action, id, data: payload }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Please sign in again");
        next = result;
      }
      setData(next);
      setModal(null);
      setToast("Changes saved");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function open(kind: Modal, edit = false) {
    setError("");
    setEditing(edit);
    setModal(kind);
  }
  function changeView(next: string) {
    setView(next);
    setSelected(null);
    setQuery("");
    setFilter("ALL");
  }
  function applicationTable() {
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Company & role</th>
              <th>Stage</th>
              <th>Location</th>
              <th>Applied</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id}>
                <td>
                  <button
                    className="company-cell"
                    onClick={() => setSelected(a.id)}
                  >
                    <span className={`company-logo logo-${i % 5}`}>
                      {a.company.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{a.company}</strong>
                      <small>{a.role}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <span className={`badge ${a.stage.toLowerCase()}`}>
                    {stageLabels[a.stage]}
                  </span>
                </td>
                <td className="muted">{a.location || "—"}</td>
                <td className="muted">{date(a.appliedAt)}</td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Open ${a.company}`}
                    onClick={() => setSelected(a.id)}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty">
            No applications found. Add your next opportunity or change the
            filters.
          </div>
        )}
      </div>
    );
  }
  function interviewCards(items = upcoming) {
    return items.length ? (
      items.map((i) => (
        <button
          key={i.id}
          className="interview-card"
          onClick={() => setSelected(i.application.id)}
        >
          <span className="date-tile">
            <small>
              {new Date(i.startsAt).toLocaleDateString(undefined, {
                month: "short",
              })}
            </small>
            <b>{new Date(i.startsAt).getDate()}</b>
          </span>
          <span>
            <strong>{i.title}</strong>
            <small>
              {i.application.company} · {i.application.role}
            </small>
            <span className="time">
              <Clock size={13} />
              {new Date(i.startsAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {i.duration} min
            </span>
          </span>
          <ChevronRight size={16} />
        </button>
      ))
    ) : (
      <div className="empty">
        Your next conversation will appear here. Schedule an interview from an
        application.
      </div>
    );
  }
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
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          ◈ shortlist<span>YOUR NEXT CHAPTER</span>
        </Link>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav>
          {navigation.map(([name, Icon]) => (
            <button
              key={name}
              className={view === name ? "nav-active" : ""}
              onClick={() => changeView(name)}
            >
              <Icon size={19} />
              {name}
              {name === "Reminders" && pending.length > 0 && (
                <span className="count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span>ONE STEP AT A TIME</span>
          <p>Good things take a little follow-through.</p>
          <div className="tip-line" />
        </div>
        <div className="user">
          <span className="avatar">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div>
            <strong>{user.name}</strong>
            <small>{demo ? "Demo workspace" : "Personal account"}</small>
          </div>
          {!demo && (
            <button
              className="icon-button"
              aria-label="Sign out"
              disabled={logoutBusy}
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>
            Workspace <ChevronRight size={14} /> <strong>{view}</strong>
          </span>
          <span className="top-date">
            <ThemeToggle />
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            <button
              className="icon-button"
              aria-label="View reminders"
              onClick={() => changeView("Reminders")}
            >
              <Bell size={18} />
            </button>
          </span>
        </header>
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
              onClick={() =>
                open(view === "Resumes" ? "resume" : "application")
              }
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
                      <b>
                        {data.applications.filter((a) => a.stage === s).length}
                      </b>
                      <small>
                        {s === "OA" ? "Assessment" : stageLabels[s]}
                      </small>
                      <div
                        style={{
                          height: Math.max(
                            8,
                            (data.applications.filter((a) => a.stage === s)
                              .length /
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
                {interviewCards(upcoming.slice(0, 2))}
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
                    {view === "Overview"
                      ? "Your applications"
                      : "All applications"}{" "}
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
              {applicationTable()}
            </section>
          )}
          {view === "Interviews" && (
            <section className="panel">
              <div className="panel-title">
                <h2>Interview schedule</h2>
                <span className="muted">
                  Times shown in your local timezone
                </span>
              </div>
              {interviewCards(interviews)}
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
                <div className="empty">
                  No follow-ups yet. Open an application to add a reminder.
                </div>
              )}
              <div className="panel-footer">
                Reminders are shown in this workspace. Email notifications are
                not enabled.
              </div>
            </section>
          )}
          {view === "Resumes" && (
            <div className="resume-grid">
              {data.resumes.map((r) => (
                <section className="panel resume-card" key={r.id}>
                  <Files size={28} />
                  <h2>{r.name}</h2>
                  <span className="badge applied">{r.version}</span>
                  <p>{r.notes || "Ready for your next application."}</p>
                  <small>
                    {
                      data.applications.filter((a) => a.resumeId === r.id)
                        .length
                    }{" "}
                    applications · Added {date(r.createdAt)}
                  </small>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    Open resume <ExternalLink size={15} />
                  </a>
                </section>
              ))}
              {!data.resumes.length && (
                <section className="panel empty">
                  <Files size={32} />
                  <h2>A place for every version.</h2>
                  <p>
                    Add a hosted PDF or Google Drive link, then attach it to an
                    application.
                  </p>
                  <button className="primary" onClick={() => open("resume")}>
                    Add your first resume
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
                      <b>
                        {data.applications.filter((a) => a.stage === s).length}
                      </b>
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
                    {
                      data.applications.filter((a) => a.stage === "REJECTED")
                        .length
                    }{" "}
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
      </div>
      {logoutConfirmOpen && (
        <div
          className="logout-confirm-backdrop"
          onClick={() => setLogoutConfirmOpen(false)}
        >
          <div
            className="logout-confirm-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm logout"
          >
            <div className="logout-confirm-icon">
              <LogOut size={20} />
            </div>
            <h3>Log out?</h3>
            <p>Are you sure you want to sign out of this workspace?</p>
            <div className="logout-confirm-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setLogoutConfirmOpen(false)}
                disabled={logoutBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={async () => {
                  setLogoutBusy(true);
                  loggingOut.current = true;
                  try {
                    await fetch("/api/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    location.replace("/login");
                  } finally {
                    loggingOut.current = false;
                    setLogoutBusy(false);
                  }
                }}
                disabled={logoutBusy}
              >
                {logoutBusy ? (
                  <span className="logout-spinner inline-spinner" role="status" aria-label="Logging out" />
                ) : (
                  "Yes, log out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {active && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <section
            className="drawer"
            aria-label="Application details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-top">
              <span className="eyebrow">APPLICATION DETAILS</span>
              <button
                className="icon-button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
            </div>
            <span className="company-logo logo-0">{active.company[0]}</span>
            <h1>{active.company}</h1>
            <h2>{active.role}</h2>
            <p className="muted">
              <MapPin size={15} />
              {active.location || "Location not specified"}
            </p>
            <div className="actions">
              <span className={`badge ${active.stage.toLowerCase()}`}>
                {stageLabels[active.stage]}
              </span>
              <button
                className="secondary"
                onClick={() => open("application", true)}
              >
                Edit application
              </button>
            </div>
            <dl>
              <dt>Applied</dt>
              <dd>{date(active.appliedAt)}</dd>
              <dt>Salary</dt>
              <dd>{active.salary || "Not specified"}</dd>
              <dt>Resume version</dt>
              <dd>
                {data.resumes.find((r) => r.id === active.resumeId)?.name ||
                  "Not attached"}
              </dd>
            </dl>
            {active.website && (
              <a href={active.website} target="_blank" rel="noreferrer">
                Company website <ExternalLink size={14} />
              </a>
            )}
            <h3>Company information</h3>
            <p className="prewrap">
              {active.companyInfo ||
                "Add company research using Edit application."}
            </p>
            <h3>Job description</h3>
            <p className="prewrap">
              {active.description || "No description added."}
            </p>
            <div className="section-head">
              <h3>Interviews</h3>
              <button onClick={() => open("interview")}>
                <Plus size={16} />
                Schedule
              </button>
            </div>
            {active.interviews.map((i) => (
              <div className="detail-item" key={i.id}>
                <strong>{i.title}</strong>
                <small>
                  {new Date(i.startsAt).toLocaleString()} · {i.duration} min
                </small>
                <p>{i.location}</p>
                <p>{i.notes}</p>
              </div>
            ))}
            <div className="section-head">
              <h3>Notes</h3>
              <button onClick={() => open("note")}>
                <Plus size={16} />
                Add note
              </button>
            </div>
            {active.notes.map((n) => (
              <div className="detail-item" key={n.id}>
                <p className="prewrap">{n.body}</p>
                <small>{date(n.createdAt)}</small>
              </div>
            ))}
            <div className="section-head">
              <h3>Reminders</h3>
              <button onClick={() => open("reminder")}>
                <Plus size={16} />
                Add reminder
              </button>
            </div>
            {active.reminders.map((r) => (
              <div className="detail-item" key={r.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={r.done}
                    disabled={busy}
                    onChange={(e) =>
                      mutate(
                        "toggleReminder",
                        { reminderId: r.id, done: e.target.checked },
                        active.id,
                      )
                    }
                  />
                  {r.title}
                </label>
                <small>{new Date(r.dueAt).toLocaleString()}</small>
              </div>
            ))}
            <button
              className="delete"
              disabled={busy}
              onClick={async () => {
                if (
                  confirm(
                    "Delete this application and its interviews, notes and reminders?",
                  )
                ) {
                  if (await mutate("deleteApplication", {}, active.id))
                    setSelected(null);
                }
              }}
            >
              Delete application
            </button>
          </section>
        </div>
      )}
      <dialog
        ref={dialog}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
      >
        <form
          key={`${modal}-${editing}`}
          onSubmit={(e) => {
            e.preventDefault();
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            if (modal === "application")
              mutate(
                "saveApplication",
                {
                  ...fields,
                  resumeId: fields.resumeId || null,
                  appliedAt: new Date(String(fields.appliedAt)).toISOString(),
                },
                editing ? selected || undefined : undefined,
              );
            if (modal === "resume") mutate("saveResume", fields);
            if (modal === "interview")
              mutate(
                "addInterview",
                {
                  ...fields,
                  startsAt: new Date(String(fields.startsAt)).toISOString(),
                  duration: Number(fields.duration),
                },
                selected || undefined,
              );
            if (modal === "reminder")
              mutate(
                "addReminder",
                {
                  ...fields,
                  dueAt: new Date(String(fields.dueAt)).toISOString(),
                },
                selected || undefined,
              );
            if (modal === "note")
              mutate("addNote", fields, selected || undefined);
          }}
        >
          <div className="dialog-heading">
            <h2>
              {modal === "application"
                ? editing
                  ? "Edit application"
                  : "A new possibility"
                : modal === "resume"
                  ? "Add a resume version"
                  : modal === "interview"
                    ? "Schedule an interview"
                    : modal === "note"
                      ? "Add a note"
                      : "Set a reminder"}
            </h2>
            <button
              type="button"
              className="icon-button"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          {modal === "application" && (
            <>
              <div className="form-grid">
                <label>
                  Company
                  <input
                    name="company"
                    required
                    maxLength={150}
                    defaultValue={editing ? active?.company : ""}
                    placeholder="e.g. Linear"
                  />
                </label>
                <label>
                  Role
                  <input
                    name="role"
                    required
                    maxLength={200}
                    defaultValue={editing ? active?.role : ""}
                    placeholder="Frontend Engineer"
                  />
                </label>
                <label>
                  Stage
                  <select
                    name="stage"
                    defaultValue={editing ? active?.stage : "APPLIED"}
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {stageLabels[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Applied on
                  <input
                    type="date"
                    name="appliedAt"
                    required
                    defaultValue={(editing
                      ? active?.appliedAt
                      : new Date().toISOString()
                    )?.slice(0, 10)}
                  />
                </label>
                <label>
                  Location
                  <input
                    name="location"
                    defaultValue={editing ? active?.location : ""}
                    placeholder="Remote / Bengaluru"
                  />
                </label>
                <label>
                  Salary range
                  <input
                    name="salary"
                    defaultValue={editing ? active?.salary : ""}
                    placeholder="₹12–18 LPA"
                  />
                </label>
              </div>
              <label>
                Company website
                <input
                  type="url"
                  name="website"
                  defaultValue={editing ? active?.website : ""}
                  placeholder="https://"
                />
              </label>
              <label>
                Company information
                <textarea
                  name="companyInfo"
                  maxLength={10000}
                  defaultValue={editing ? active?.companyInfo : ""}
                />
              </label>
              <label>
                Job description
                <textarea
                  name="description"
                  maxLength={10000}
                  defaultValue={editing ? active?.description : ""}
                />
              </label>
              <label>
                Resume version
                <select
                  name="resumeId"
                  defaultValue={editing ? active?.resumeId || "" : ""}
                >
                  <option value="">No resume attached</option>
                  {data.resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {r.version}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {modal === "resume" && (
            <>
              <label>
                Resume name
                <input
                  name="name"
                  required
                  maxLength={150}
                  placeholder="Frontend Developer"
                />
              </label>
              <label>
                Version
                <input
                  name="version"
                  required
                  maxLength={50}
                  placeholder="v2 · September 2026"
                />
              </label>
              <label>
                Document URL
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://drive.google.com/…"
                />
              </label>
              <small>Use a hosted PDF or a shareable document link.</small>
              <label>
                Notes
                <textarea
                  name="notes"
                  maxLength={10000}
                  placeholder="What changed in this version?"
                />
              </label>
            </>
          )}
          {modal === "interview" && (
            <>
              <label>
                Interview title
                <input
                  name="title"
                  required
                  maxLength={200}
                  placeholder="Technical round 1"
                />
              </label>
              <label>
                Date & time (your local timezone)
                <input type="datetime-local" name="startsAt" required />
              </label>
              <label>
                Duration (minutes)
                <input
                  name="duration"
                  type="number"
                  min={5}
                  max={480}
                  defaultValue={60}
                  required
                />
              </label>
              <label>
                Meeting link / location
                <input
                  name="location"
                  placeholder="Video link or office address"
                />
              </label>
              <label>
                Preparation notes
                <textarea name="notes" maxLength={10000} />
              </label>
            </>
          )}
          {modal === "reminder" && (
            <>
              <label>
                What needs a follow-up?
                <input
                  name="title"
                  required
                  maxLength={200}
                  placeholder="Follow up with recruiter"
                />
              </label>
              <label>
                Due date & time
                <input name="dueAt" type="datetime-local" required />
              </label>
            </>
          )}
          {modal === "note" && (
            <label>
              Your note
              <textarea
                name="body"
                required
                maxLength={10000}
                rows={6}
                placeholder="Capture feedback, research or your next step…"
              />
            </label>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
              <Check size={16} />
            </button>
          </div>
        </form>
      </dialog>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

