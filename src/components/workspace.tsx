"use client";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, ChevronRight, Check } from "lucide-react";
import type { Application, TrackerData } from "@/types/tracker";
import { validateCommand } from "@/lib/commands";
import { ApplicationDialog } from "./workspace/application-dialog";
import { ApplicationDrawer } from "./workspace/application-drawer";
import { LogoutDialog } from "./workspace/logout-dialog";
import { DeleteApplicationDialog } from "./workspace/delete-application-dialog";
import { DeleteResumeDialog } from "./workspace/delete-resume-dialog";
import { WorkspaceSidebar } from "./workspace/sidebar";
import { WorkspaceContent } from "./workspace/workspace-content";
import { type Modal } from "./workspace/shared";
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
    [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false),
    [editingResumeId, setEditingResumeId] = useState<string | null>(null),
    [deleteResumeId, setDeleteResumeId] = useState<string | null>(null),
    [error, setError] = useState(""),
    [toast, setToast] = useState<{
      message: string;
      tone: "success" | "deleted";
    } | null>(null),
    [todayLabel, setTodayLabel] = useState("Today");
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
    setTodayLabel(
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    );
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const active = data.applications.find((a) => a.id === selected);
  const activeResume = data.resumes.find(
    (resume) => resume.id === editingResumeId,
  );
  const resumeToDelete = data.resumes.find(
    (resume) => resume.id === deleteResumeId,
  );
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
        if (action === "saveResume") {
          if (id)
            next.resumes = next.resumes.map((resume) =>
              resume.id === id ? { ...resume, ...payload } : resume,
            );
          else
            next.resumes.unshift({
              ...payload,
              id: uid,
              createdAt: now,
            } as TrackerData["resumes"][number]);
        } else if (action === "deleteResume") {
          next.resumes = next.resumes.filter((resume) => resume.id !== id);
          next.applications = next.applications.map((application) =>
            application.resumeId === id
              ? { ...application, resumeId: null }
              : application,
          );
        } else if (action === "saveApplication") {
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
      setEditingResumeId(null);
      setToast(
        action === "deleteApplication" || action === "deleteResume"
          ? {
              message:
                action === "deleteResume"
                  ? "Resume deleted"
                  : "Application deleted",
              tone: "deleted",
            }
          : { message: "Changes saved", tone: "success" },
      );
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
  function requestDelete() {
    setError("");
    setDeleteConfirmOpen(true);
  }
  function editResume(id: string) {
    setError("");
    setEditing(true);
    setEditingResumeId(id);
    setModal("resume");
  }
  function requestDeleteResume(id: string) {
    setError("");
    setDeleteResumeId(id);
  }
  return (
    <div className="shell">
      <WorkspaceSidebar
        view={view}
        changeView={changeView}
        pendingCount={pending.length}
        user={user}
        demo={demo}
        logoutBusy={logoutBusy}
        setLogoutConfirmOpen={setLogoutConfirmOpen}
      />
      <div className="main">
        <header className="topbar">
          <span>
            Workspace <ChevronRight size={14} /> <strong>{view}</strong>
          </span>
          <span className="top-date">
            <ThemeToggle />
            {todayLabel}
            <button
              className="icon-button"
              aria-label="View reminders"
              onClick={() => changeView("Reminders")}
            >
              <Bell size={18} />
            </button>
          </span>
        </header>
        <WorkspaceContent
          demo={demo}
          view={view}
          user={user}
          open={open}
          error={error}
          modal={modal}
          data={data}
          upcoming={upcoming}
          interviews={interviews}
          reminders={reminders}
          pending={pending}
          filtered={filtered}
          query={query}
          setQuery={setQuery}
          filter={filter}
          setFilter={setFilter}
          setView={setView}
          changeView={changeView}
          setSelected={setSelected}
          busy={busy}
          mutate={mutate}
          editResume={editResume}
          requestDeleteResume={requestDeleteResume}
        />
      </div>
      {logoutConfirmOpen && (
        <LogoutDialog
          setLogoutConfirmOpen={setLogoutConfirmOpen}
          logoutBusy={logoutBusy}
          setLogoutBusy={setLogoutBusy}
          loggingOut={loggingOut}
        />
      )}
      {active && (
        <ApplicationDrawer
          active={active}
          setSelected={setSelected}
          open={open}
          data={data}
          mutate={mutate}
          busy={busy}
          requestDelete={requestDelete}
        />
      )}
      {deleteConfirmOpen && active && (
        <DeleteApplicationDialog
          company={active.company}
          busy={busy}
          error={error}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={async () => {
            if (await mutate("deleteApplication", {}, active.id)) {
              setDeleteConfirmOpen(false);
              setSelected(null);
            }
          }}
        />
      )}
      {resumeToDelete && (
        <DeleteResumeDialog
          name={resumeToDelete.name}
          attachedCount={
            data.applications.filter(
              (application) => application.resumeId === resumeToDelete.id,
            ).length
          }
          busy={busy}
          error={error}
          onCancel={() => setDeleteResumeId(null)}
          onConfirm={async () => {
            if (await mutate("deleteResume", {}, resumeToDelete.id))
              setDeleteResumeId(null);
          }}
        />
      )}
      <ApplicationDialog
        dialog={dialog}
        modal={modal}
        setModal={setModal}
        editing={editing}
        active={active}
        activeResume={activeResume}
        selected={selected}
        mutate={mutate}
        data={data}
        error={error}
        busy={busy}
      />
      {toast && (
        <div className={`toast toast-${toast.tone}`} role="status">
          <Check size={17} aria-hidden="true" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
