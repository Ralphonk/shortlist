import { Trash2 } from "lucide-react";

export function DeleteResumeDialog({
  name,
  attachedCount,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  name: string;
  attachedCount: number;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="logout-confirm-backdrop"
      onClick={() => !busy && onCancel()}
    >
      <div
        className="logout-confirm-card danger-confirm-card"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-resume-title"
        aria-describedby="delete-resume-description"
      >
        <div className="logout-confirm-icon danger-confirm-icon">
          <Trash2 size={20} />
        </div>
        <h3 id="delete-resume-title">Delete resume?</h3>
        <p id="delete-resume-description">
          <strong>{name}</strong> will be permanently removed.
          {attachedCount > 0 &&
            ` It will also be detached from ${attachedCount} application${attachedCount === 1 ? "" : "s"}.`}
        </p>
        {error && <p className="error confirm-error">{error}</p>}
        <div className="logout-confirm-actions">
          <button
            className="secondary"
            onClick={onCancel}
            disabled={busy}
            autoFocus
          >
            Keep resume
          </button>
          <button
            className="danger-primary"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <span className="logout-spinner inline-spinner" />}
            {busy ? "Deleting" : "Delete resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
