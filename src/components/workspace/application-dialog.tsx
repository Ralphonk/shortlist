import type { Application, TrackerData } from "@/types/tracker";
import { Check, X } from "lucide-react";
import { stages, stageLabels, type Modal, type Mutate } from "./shared";
export function ApplicationDialog({
  dialog,
  modal,
  setModal,
  editing,
  active,
  selected,
  mutate,
  data,
  error,
  busy,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>;
  modal: Modal;
  setModal: (value: Modal) => void;
  editing: boolean;
  active: Application | undefined;
  selected: string | null;
  mutate: Mutate;
  data: TrackerData;
  error: string;
  busy: boolean;
}) {
  return (
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
  );
}
