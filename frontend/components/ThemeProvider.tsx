"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Preference is written to BOTH localStorage and a cookie. The cookie is
// what the inline script in layout.tsx reads before the browser paints,
// which is what prevents a flash of the wrong theme; localStorage is the
// fallback that survives the cookie being cleared, re-applied by the
// effect below.
function applyToDom(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") {
    delete root.dataset.theme;
    localStorage.removeItem("theme");
    document.cookie = "theme=; path=/; max-age=0; samesite=lax";
  } else {
    root.dataset.theme = preference;
    localStorage.setItem("theme", preference);
    document.cookie = `theme=${preference}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }
}

function subscribeToSystemTheme(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const noopSubscribe = () => () => {};

export function ThemeProvider({
  initialTheme,
  children,
}: {
  /** Explicit theme read from the cookie during server render, if any. */
  initialTheme: "light" | "dark" | null;
  children: React.ReactNode;
}) {
  // Set once the user picks a theme in this session; wins over everything.
  const [override, setOverride] = useState<ThemePreference | null>(null);

  // OS-level preference, live-updating if it changes while the app is open.
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "light" as const,
  );

  // False during SSR and hydration, true after mount — consumers use this
  // to avoid presenting the SSR fallback as the real resolved theme.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // If the cookie was cleared but localStorage survived, fall back to it.
  const storedTheme = useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return window.localStorage.getItem("theme");
      } catch {
        return null;
      }
    },
    () => null,
  );
  const storedPreference =
    !initialTheme && (storedTheme === "light" || storedTheme === "dark")
      ? storedTheme
      : null;

  const preference: ThemePreference =
    override ?? initialTheme ?? storedPreference ?? "system";

  // When restoring from localStorage the DOM attribute and cookie are
  // missing — re-apply them so CSS and the next server render agree.
  useEffect(() => {
    if (!override && storedPreference) {
      applyToDom(storedPreference);
    }
  }, [override, storedPreference]);

  const setPreference = useCallback((next: ThemePreference) => {
    applyToDom(next);
    setOverride(next);
  }, []);

  const resolvedTheme = preference === "system" ? systemTheme : preference;

  return (
    <ThemeContext.Provider
      value={{ preference, resolvedTheme, setPreference, mounted }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return context;
}
