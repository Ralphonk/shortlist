import { LogOut } from "lucide-react";
export function LogoutDialog({
  setLogoutConfirmOpen,
  logoutBusy,
  setLogoutBusy,
  loggingOut,
}: {
  setLogoutConfirmOpen: (open: boolean) => void;
  logoutBusy: boolean;
  setLogoutBusy: (busy: boolean) => void;
  loggingOut: React.RefObject<boolean>;
}) {
  return (
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
              <span
                className="logout-spinner inline-spinner"
                role="status"
                aria-label="Logging out"
              />
            ) : (
              "Yes, log out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
