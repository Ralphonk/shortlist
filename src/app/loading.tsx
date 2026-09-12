export default function Loading() {
  return (
    <main className="route-loader" role="status" aria-label="Loading workspace">
      <div className="route-loader-mark" aria-hidden="true">
        <span className="route-loader-ring" />
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 3 29 16 16 29 3 16Z" stroke="currentColor" strokeWidth="2" />
          <path d="m11 16 3.5 3.5L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="route-loader-dots" aria-hidden="true"><i /><i /><i /></div>
    </main>
  );
}
