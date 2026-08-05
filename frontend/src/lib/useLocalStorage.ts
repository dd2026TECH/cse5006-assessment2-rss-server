"use client";

import { useCallback, useSyncExternalStore } from "react";

// localStorage-backed state via useSyncExternalStore: the server snapshot
// is null (so SSR and hydration render the fallback), and the stored value
// applies after mount. Dispatching a storage event on write keeps every
// component using the same key in sync — including across browser tabs.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );

  let value = initialValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      // Corrupted stored value — keep the initial value.
    }
  }

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        // Storage unavailable (private mode, quota) — ignore.
      }
    },
    [key],
  );

  return [value, setValue] as const;
}
