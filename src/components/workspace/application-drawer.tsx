import type { Application, TrackerData } from "@/types/tracker";
import { X, MapPin, ExternalLink, Plus } from "lucide-react";
import { date, stageLabels, type Modal, type Mutate } from "./shared";
export function ApplicationDrawer({
  active,
  setSelected,
  open,
  data,
  mutate,
  busy,
}: {
  active: Application;
  setSelected: (id: string | null) => void;
  open: (kind: Modal, edit?: boolean) => void;
  data: TrackerData;
  mutate: Mutate;
  busy: boolean;
}) {
  return (
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
          {active.companyInfo || "Add company research using Edit application."}
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
  );
}
