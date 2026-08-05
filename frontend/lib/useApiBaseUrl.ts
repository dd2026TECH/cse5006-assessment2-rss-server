"use client";

import { useSyncExternalStore } from "react";
import { apiBaseUrl } from "./apiConfig";

// The API base URL depends on window.location, which does not exist during
// server rendering. Reading it through useSyncExternalStore — the same pattern
// useLocalStorage uses — gives SSR a null snapshot so markup matches on
// hydration, then the real value after mount. Setting it from an effect instead
// would trigger the cascading-render lint rule the React Compiler enforces.

// The host cannot change without a navigation, so there is nothing to subscribe
// to; the unsubscribe is a no-op.
const subscribe = () => () => {};

/** Returns the API origin, or null while server-rendering / before hydration. */
export function useApiBaseUrl(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => apiBaseUrl(),
    () => null,
  );
}
