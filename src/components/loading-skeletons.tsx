const Skeleton = ({ className = "" }: { className?: string }) => (
  <span className={`skeleton ${className}`} aria-hidden="true" />
);

export function AuthSkeleton() {
  return (
    <main className="auth auth-skeleton" aria-busy="true" aria-label="Loading page">
      <div className="skeleton-nav">
        <Skeleton className="skeleton-brand" />
        <Skeleton className="skeleton-circle" />
      </div>
      <Skeleton className="skeleton-title" />
      <div className="skeleton-form">
        <Skeleton className="skeleton-label" />
        <Skeleton className="skeleton-input" />
        <Skeleton className="skeleton-label short" />
        <Skeleton className="skeleton-input" />
        <Skeleton className="skeleton-button" />
        <Skeleton className="skeleton-copy" />
      </div>
    </main>
  );
}

export function WorkspaceSkeleton() {
  return (
    <div className="shell workspace-skeleton" aria-busy="true" aria-label="Loading workspace">
      <aside className="sidebar skeleton-sidebar">
        <Skeleton className="skeleton-brand" />
        <Skeleton className="skeleton-label" />
        <div className="skeleton-nav-list">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton className="skeleton-nav-item" key={index} />
          ))}
        </div>
        <Skeleton className="skeleton-user" />
      </aside>
      <div className="main">
        <header className="topbar skeleton-topbar">
          <Skeleton className="skeleton-copy" />
          <Skeleton className="skeleton-copy short" />
        </header>
        <main className="content">
          <div className="skeleton-page-heading">
            <div>
              <Skeleton className="skeleton-label" />
              <Skeleton className="skeleton-heading" />
              <Skeleton className="skeleton-copy wide" />
            </div>
            <Skeleton className="skeleton-action" />
          </div>
          <div className="stats">
            {Array.from({ length: 4 }, (_, index) => (
              <section className="stat skeleton-stat" key={index}>
                <Skeleton className="skeleton-copy" />
                <Skeleton className="skeleton-number" />
                <Skeleton className="skeleton-copy wide" />
              </section>
            ))}
          </div>
          <div className="overview-grid">
            {Array.from({ length: 2 }, (_, index) => (
              <section className="panel skeleton-panel" key={index}>
                <Skeleton className="skeleton-panel-title" />
                <Skeleton className="skeleton-panel-body" />
              </section>
            ))}
          </div>
          <section className="panel skeleton-table">
            <Skeleton className="skeleton-panel-title" />
            {Array.from({ length: 4 }, (_, index) => (
              <div className="skeleton-table-row" key={index}>
                <Skeleton className="skeleton-circle" />
                <Skeleton className="skeleton-copy wide" />
                <Skeleton className="skeleton-copy" />
                <Skeleton className="skeleton-pill" />
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
