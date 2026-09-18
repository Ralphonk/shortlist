import Link from "next/link";
import { navigation } from "./shared";
import { ThemeToggle } from "../theme-toggle";
import { AccountMenu, type AccountUser } from "./account-menu";
export function WorkspaceSidebar({
  view,
  changeView,
  pendingCount,
  user,
  demo,
  setLogoutConfirmOpen,
  onUserUpdate,
}: {
  view: string;
  changeView: (view: string) => void;
  pendingCount: number;
  user: AccountUser;
  demo: boolean;
  setLogoutConfirmOpen: (open: boolean) => void;
  onUserUpdate: (user: AccountUser) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand-row">
        <Link href="/" className="brand">
          ◈ shortlist<span>YOUR NEXT CHAPTER</span>
        </Link>
        <div className="mobile-account">
          <AccountMenu
            compact
            user={user}
            demo={demo}
            onUserUpdate={onUserUpdate}
            onLogout={() => setLogoutConfirmOpen(true)}
          />
          <ThemeToggle />
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
        <AccountMenu
          user={user}
          demo={demo}
          onUserUpdate={onUserUpdate}
          onLogout={() => setLogoutConfirmOpen(true)}
        />
      </div>
    </aside>
  );
}
