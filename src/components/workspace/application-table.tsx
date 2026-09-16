import type { Application } from "@/types/tracker";
import { ArrowUpRight } from "lucide-react";
import { stageLabels, date } from "./shared";
export function ApplicationTable({
  filtered,
  setSelected,
}: {
  filtered: Application[];
  setSelected: (id: string) => void;
}) {
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
              <td className="muted">{a.location || "Not specified"}</td>
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
