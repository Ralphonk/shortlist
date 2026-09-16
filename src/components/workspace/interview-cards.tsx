import type { Application } from "@/types/tracker";
import { CalendarDays, Clock, ChevronRight, Plus } from "lucide-react";
export function InterviewCards({
  items,
  setSelected,
  emptyAction,
}: {
  items: (Application["interviews"][number] & { application: Application })[];
  setSelected: (id: string) => void;
  emptyAction?: { label: string; onClick: () => void };
}) {
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
    <div className="empty empty-state">
      <span className="empty-icon">
        <CalendarDays size={22} aria-hidden="true" />
      </span>
      <h2>No interviews scheduled</h2>
      <p>Your next conversation will appear here when you are ready.</p>
      {emptyAction && (
        <button className="primary" onClick={emptyAction.onClick}>
          <Plus size={17} aria-hidden="true" />
          {emptyAction.label}
        </button>
      )}
    </div>
  );
}
