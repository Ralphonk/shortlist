import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
export const metadata: Metadata = {
  title: "Shortlist — Your next chapter",
  description:
    "A considered workspace for your job search. Track applications, interviews, resumes and your next move.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('shortlist-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
