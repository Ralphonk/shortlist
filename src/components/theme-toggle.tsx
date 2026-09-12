"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("shortlist-theme", next); } catch { /* Storage is optional. */ }
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle color theme" title="Toggle color theme">
      <span className="theme-to-dark"><Moon size={19} aria-hidden="true" /></span>
      <span className="theme-to-light"><Sun size={19} aria-hidden="true" /></span>
    </button>
  );
}
