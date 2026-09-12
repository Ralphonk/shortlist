"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="auth">
      <h1>We couldn’t open your workspace.</h1>
      <p>Please check the database connection and try again.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
