"use client";

import type { Application, Resume, TrackerData } from "@/types/tracker";
import { upload } from "@vercel/blob/client";
import { useEffect, useState } from "react";
import { Check, FileText, Upload, X } from "lucide-react";
import { stages, stageLabels, type Modal, type Mutate } from "./shared";
export function ApplicationDialog({
  dialog,
  modal,
  setModal,
  editing,
  active,
  activeResume,
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
  activeResume: Resume | undefined;
  selected: string | null;
  mutate: Mutate;
  data: TrackerData;
  error: string;
  busy: boolean;
}) {
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploadedName, setUploadedName] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [useDocumentLink, setUseDocumentLink] = useState(false);

  useEffect(() => {
    if (modal !== "resume") return;
    const currentUrl = editing ? activeResume?.url || "" : "";
    setDocumentUrl(currentUrl);
    setUseDocumentLink(
      Boolean(currentUrl && !currentUrl.includes(".blob.vercel-storage.com")),
    );
    setUploadedName("");
    setPendingFile(null);
    setUploadProgress(0);
    setUploadError("");
  }, [modal, editing, activeResume]);

  function selectResume(file: File) {
    setUploadError("");
    if (file.type !== "application/pdf") {
      setUploadError("Choose a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("PDF must be 5 MB or smaller.");
      return;
    }
    setPendingFile(file);
    setDocumentUrl("");
    setUploadedName(file.name);
    setUseDocumentLink(false);
    setUploadProgress(0);
  }

  return (
    <dialog
      ref={dialog}
      onCancel={() => setModal(null)}
      onClose={() => setModal(null)}
    >
      <form
        key={`${modal}-${editing}`}
        onSubmit={async (e) => {
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
          if (modal === "resume") {
            let resumeUrl = documentUrl;
            if (pendingFile) {
              setUploadBusy(true);
              setUploadProgress(0);
              setUploadError("");
              try {
                const safeName = pendingFile.name.replace(
                  /[^a-zA-Z0-9._-]/g,
                  "-",
                );
                const blob = await upload(
                  `resumes/${crypto.randomUUID()}-${safeName}`,
                  pendingFile,
                  {
                    access: "private",
                    handleUploadUrl: "/api/resumes/upload",
                    contentType: "application/pdf",
                    onUploadProgress: ({ percentage }) =>
                      setUploadProgress(percentage),
                  },
                );
                resumeUrl = blob.url;
                setDocumentUrl(blob.url);
                setUploadProgress(100);
              } catch {
                setUploadError("Upload failed. Please try again.");
                setUploadBusy(false);
                return;
              }
              setUploadBusy(false);
            }
            await mutate(
              "saveResume",
              { ...fields, url: resumeUrl },
              editing ? activeResume?.id : undefined,
            );
          }
          if (modal === "interview")
            mutate(
              "addInterview",
              {
                ...fields,
                startsAt: new Date(String(fields.startsAt)).toISOString(),
                duration: Number(fields.duration),
              },
              String(fields.applicationId || selected || "") || undefined,
            );
          if (modal === "reminder")
            mutate(
              "addReminder",
              {
                ...fields,
                dueAt: new Date(String(fields.dueAt)).toISOString(),
              },
              String(fields.applicationId || selected || "") || undefined,
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
                ? editing
                  ? "Edit resume"
                  : "Add a resume version"
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
                defaultValue={editing ? activeResume?.name : ""}
                placeholder="Frontend Developer"
              />
            </label>
            <label>
              Version
              <input
                name="version"
                required
                maxLength={50}
                defaultValue={editing ? activeResume?.version : ""}
                placeholder="v2 · September 2026"
              />
            </label>
            <div className="resume-upload-field">
              <span className="resume-upload-label">Resume PDF</span>
              <label
                className={`resume-dropzone ${dragActive ? "is-dragging" : ""} ${pendingFile || documentUrl ? "has-file" : ""}`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  const file = event.dataTransfer.files[0];
                  if (file) selectResume(file);
                }}
              >
                <input
                  className="resume-file-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={uploadBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) selectResume(file);
                    event.target.value = "";
                  }}
                />
                <span className="resume-dropzone-icon">
                  {pendingFile || documentUrl ? (
                    <FileText size={22} />
                  ) : (
                    <Upload size={22} />
                  )}
                </span>
                <span className="resume-dropzone-copy">
                  <strong>
                    {uploadBusy
                      ? `Uploading ${Math.round(uploadProgress)}%`
                      : uploadedName ||
                        (documentUrl
                          ? "Resume attached"
                          : "Drop your PDF here")}
                  </strong>
                  <small>
                    {pendingFile || documentUrl
                      ? "Click to replace this file"
                      : "or choose from your computer · Max 5 MB"}
                  </small>
                </span>
              </label>
              {uploadBusy && (
                <span className="resume-upload-progress">
                  <i style={{ width: `${uploadProgress}%` }} />
                </span>
              )}
              {uploadError && (
                <small className="upload-error">{uploadError}</small>
              )}
            </div>
            {!useDocumentLink && (
              <>
                <input type="hidden" name="url" value={documentUrl} />
                <div className="resume-url-divider">
                  <button
                    type="button"
                    onClick={() => {
                      if (documentUrl.includes(".blob.vercel-storage.com"))
                        setDocumentUrl("");
                      setPendingFile(null);
                      setUploadedName("");
                      setUseDocumentLink(true);
                    }}
                  >
                    Use a document link instead
                  </button>
                </div>
              </>
            )}
            {useDocumentLink && (
              <label>
                Document URL
                <input
                  name="url"
                  type="url"
                  required
                  value={documentUrl}
                  onChange={(event) => {
                    setDocumentUrl(event.target.value);
                    setPendingFile(null);
                    setUploadedName("");
                  }}
                  placeholder="https://drive.google.com/…"
                />
                <small>Use a shareable PDF or document link.</small>
              </label>
            )}
            <label>
              Notes
              <textarea
                name="notes"
                maxLength={10000}
                defaultValue={editing ? activeResume?.notes : ""}
                placeholder="What changed in this version?"
              />
            </label>
          </>
        )}
        {modal === "interview" && (
          <>
            <label>
              Application
              <select
                name="applicationId"
                defaultValue={selected || data.applications[0]?.id}
                required
              >
                {data.applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.company} · {application.role}
                  </option>
                ))}
              </select>
            </label>
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
              Application
              <select
                name="applicationId"
                defaultValue={selected || data.applications[0]?.id}
                required
              >
                {data.applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.company} · {application.role}
                  </option>
                ))}
              </select>
            </label>
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
          <button
            className="primary"
            disabled={
              busy ||
              uploadBusy ||
              (modal === "resume" && !documentUrl && !pendingFile)
            }
          >
            {uploadBusy ? "Uploading…" : busy ? "Saving…" : "Save changes"}
            <Check size={16} />
          </button>
        </div>
      </form>
    </dialog>
  );
}
