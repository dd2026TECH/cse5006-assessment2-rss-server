"use client";

import { useTheme } from "./ThemeProvider";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { resolvedTheme, setPreference, mounted } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  // Until mounted we can't know the OS theme, so show a neutral icon —
  // the server render and first client render must match.
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setPreference(next)}
      aria-label={mounted ? `Switch to ${next} theme` : "Toggle theme"}
    >
      <span aria-hidden="true">
        {mounted ? (resolvedTheme === "dark" ? "☀️" : "🌙") : "◐"}
      </span>
    </button>
  );
}
