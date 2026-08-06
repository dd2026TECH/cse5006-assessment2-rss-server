// Where the RSS Server lives, resolved at runtime rather than baked in.
//
// The Module 7 lab hardcodes the EC2 public DNS in page.tsx and tells you to
// edit it by hand. That breaks every time the Learner Lab session restarts the
// instance, because the public DNS changes — and fixing it means rebuilding the
// image. Deriving it from the browser's own hostname avoids that entirely: the
// frontend and API are always served from the same host, only on different
// ports.
//
// NEXT_PUBLIC_API_URL still wins if set, so a different topology stays possible
// without touching code.

/** Port the API container publishes on the host (docker-compose: "4080:3000"). */
export const API_PORT = 4080;

export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window === "undefined") {
    // Server-side render / build: only used for absolute URLs in metadata.
    return `http://localhost:${API_PORT}`;
  }

  return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
}

/**
 * Base URL for calls made **on the server** (server components, metadata).
 *
 * Inside Docker the frontend container reaches the api container by service
 * name on its internal port — `http://api:3000` — which is the path the Module 7
 * lab diagram shows. That never leaves the Docker network, so it cannot use the
 * browser-facing hostname. docker-compose sets API_INTERNAL_URL; without it,
 * local development falls back to the published port.
 */
export function serverApiBaseUrl(): string {
  return (process.env.API_INTERNAL_URL ?? `http://localhost:${API_PORT}`).replace(/\/$/, "");
}

/** Absolute URL of a feed's RSS 2.0 document — the URL an RSS reader subscribes to. */
export function feedUrl(slug: string): string {
  return `${apiBaseUrl()}/api/feeds/rss.xml?slug=${encodeURIComponent(slug)}`;
}
