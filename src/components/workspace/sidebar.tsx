import Link from "next/link";
import { LogOut } from "lucide-react";
import { navigation } from "./shared";
import { ThemeToggle } from "../theme-toggle";
export function WorkspaceSidebar({
  view,
  changeView,
  pendingCount,
  user,
  demo,
  logoutBusy,
  setLogoutConfirmOpen,
}: {
  view: string;
  changeView: (view: string) => void;
  pendingCount: number;
  user: { name: string; email: string };
  demo: boolean;
  logoutBusy: boolean;
  setLogoutConfirmOpen: (open: boolean) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand-row">
        <Link href="/" className="brand">
          ◈ shortlist<span>YOUR NEXT CHAPTER</span>
        </Link>
        <div className="mobile-account">
          <span className="avatar" title={user.name} aria-label={user.name}>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <ThemeToggle />
          {!demo && (
            <button
              className="icon-button"
              aria-label="Sign out"
              disabled={logoutBusy}
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav aria-label="Main navigation">
        {navigation.map(([name, Icon]) => (
          <button
            key={name}
            className={view === name ? "nav-active" : ""}
            aria-current={view === name ? "page" : undefined}
            aria-label={name}
            onClick={() => changeView(name)}
          >
            <Icon size={19} />
            <span className="nav-label-desktop">{name}</span>
            <span className="nav-label-mobile">
              {name === "Applications"
                ? "Jobs"
                : name === "Reminders"
                  ? "Remind"
                  : name}
            </span>
            {name === "Reminders" && pendingCount > 0 && (
              <span className="count">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-tip">
        <span>ONE STEP AT A TIME</span>
        <p>Good things take a little follow-through.</p>
        <div className="tip-line" />
      </div>
      <div className="user">
        <span className="avatar">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div>
          <strong>{user.name}</strong>
          <small>{demo ? "Demo workspace" : "Personal account"}</small>
        </div>
        {!demo && (
          <button
            className="icon-button"
            aria-label="Sign out"
            disabled={logoutBusy}
            onClick={() => setLogoutConfirmOpen(true)}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
