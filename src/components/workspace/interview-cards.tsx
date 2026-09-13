import type { Application } from "@/types/tracker";
import { Clock, ChevronRight } from "lucide-react";
export function InterviewCards({
  items,
  setSelected,
}: {
  items: (Application["interviews"][number] & { application: Application })[];
  setSelected: (id: string) => void;
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
    <div className="empty">
      Your next conversation will appear here. Schedule an interview from an
      application.
    </div>
  );
}
