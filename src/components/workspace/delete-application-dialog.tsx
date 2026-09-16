import { Trash2 } from "lucide-react";

export function DeleteApplicationDialog({
  company,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  company: string;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="logout-confirm-backdrop"
      onClick={() => !busy && onCancel()}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) onCancel();
      }}
    >
      <div
        className="logout-confirm-card danger-confirm-card"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-application-title"
        aria-describedby="delete-application-description"
      >
        <div className="logout-confirm-icon danger-confirm-icon">
          <Trash2 size={20} />
        </div>
        <h3 id="delete-application-title">Delete application?</h3>
        <p id="delete-application-description">
          <strong>{company}</strong> and its interviews, notes, and reminders
          will be permanently removed.
        </p>
        {error && <p className="error confirm-error">{error}</p>}
        <div className="logout-confirm-actions">
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
            disabled={busy}
            autoFocus
          >
            Keep application
          </button>
          <button
            type="button"
            className="danger-primary"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? (
              <span
                className="logout-spinner inline-spinner"
                role="status"
                aria-label="Deleting application"
              />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
            {busy ? "Deleting" : "Delete application"}
          </button>
        </div>
      </div>
    </div>
  );
}
