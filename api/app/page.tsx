import { headers } from "next/headers";
import styles from "./page.module.css";

// The api package's root is documentation, not UI — this is what a marker (or
// a curious developer) sees when they open :4080 directly. Both Module 7 labs
// use this exact pattern: derive baseUrl from the request itself so the curl
// and PowerShell commands are always correct, whether running on localhost, on
// an EC2 public address, or behind whatever port-forwarding a marker is using.

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  curl: (base: string) => string;
  powershell: (base: string) => string;
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/health",
    description: "Healthcheck. Runs a real query against Postgres rather than returning a hardcoded 200 — a healthcheck that cannot fail tells you nothing.",
    curl: (b) => `curl ${b}/api/health`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/health"`,
  },
  {
    method: "GET",
    path: "/api/count",
    description: "Number of client requests served, read from the RequestLog table — persisted, so it survives a container restart.",
    curl: (b) => `curl ${b}/api/count`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/count"`,
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "Content statistics (feeds, authors, posts, citations) and usage statistics (requests by path, responses by status).",
    curl: (b) => `curl ${b}/api/stats`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/stats"`,
  },
  {
    method: "GET",
    path: "/api/feeds",
    description: "All feeds. Add ?id=<n> for one feed, or ?withPosts=true to include its posts.",
    curl: (b) => `curl ${b}/api/feeds`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/feeds"`,
  },
  {
    method: "POST",
    path: "/api/feeds",
    description: "Create a feed. Requires slug and name.",
    curl: (b) =>
      `curl -X POST ${b}/api/feeds -H "Content-Type: application/json" -d '{"slug":"example","name":"Example Feed"}'`,
    powershell: (b) =>
      `Invoke-RestMethod -Uri "${b}/api/feeds" -Method Post -ContentType "application/json" -Body '{"slug":"example","name":"Example Feed"}'`,
  },
  {
    method: "PATCH",
    path: "/api/feeds?id=1",
    description: "Update a feed. Only the fields supplied change.",
    curl: (b) =>
      `curl -X PATCH "${b}/api/feeds?id=1" -H "Content-Type: application/json" -d '{"name":"Renamed"}'`,
    powershell: (b) =>
      `Invoke-RestMethod -Uri "${b}/api/feeds?id=1" -Method Patch -ContentType "application/json" -Body '{"name":"Renamed"}'`,
  },
  {
    method: "DELETE",
    path: "/api/feeds?id=1",
    description: "Delete a feed. Cascades to its posts.",
    curl: (b) => `curl -X DELETE "${b}/api/feeds?id=1"`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/feeds?id=1" -Method Delete`,
  },
  {
    method: "GET",
    path: "/api/posts",
    description: "All posts, newest first. ?id=, ?slug=, or ?feedId= narrow the result.",
    curl: (b) => `curl ${b}/api/posts`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/posts"`,
  },
  {
    method: "POST",
    path: "/api/posts",
    description: "Create a post. Requires slug, title, summary, feedId and authorId.",
    curl: (b) =>
      `curl -X POST ${b}/api/posts -H "Content-Type: application/json" -d '{"slug":"example-post","title":"Example","summary":"...","feedId":1,"authorId":1}'`,
    powershell: (b) =>
      `Invoke-RestMethod -Uri "${b}/api/posts" -Method Post -ContentType "application/json" -Body '{"slug":"example-post","title":"Example","summary":"...","feedId":1,"authorId":1}'`,
  },
  {
    method: "PATCH",
    path: "/api/posts?id=1",
    description: "Update a post.",
    curl: (b) =>
      `curl -X PATCH "${b}/api/posts?id=1" -H "Content-Type: application/json" -d '{"title":"Updated title"}'`,
    powershell: (b) =>
      `Invoke-RestMethod -Uri "${b}/api/posts?id=1" -Method Patch -ContentType "application/json" -Body '{"title":"Updated title"}'`,
  },
  {
    method: "DELETE",
    path: "/api/posts?id=1",
    description: "Delete a post.",
    curl: (b) => `curl -X DELETE "${b}/api/posts?id=1"`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/posts?id=1" -Method Delete`,
  },
  {
    method: "GET",
    path: "/api/authors",
    description: "All authors, or one with ?id=.",
    curl: (b) => `curl ${b}/api/authors`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/authors"`,
  },
  {
    method: "GET",
    path: "/api/feeds/rss.xml?slug=build-journal",
    description: "A feed republished as real RSS 2.0 (Content-Type: application/rss+xml) — subscribable in an actual feed reader, and what the RSS Client page consumes.",
    curl: (b) => `curl "${b}/api/feeds/rss.xml?slug=build-journal"`,
    powershell: (b) => `Invoke-RestMethod -Uri "${b}/api/feeds/rss.xml?slug=build-journal"`,
  },
];

const METHOD_CLASS: Record<Endpoint["method"], string> = {
  GET: styles.methodGET,
  POST: styles.methodPOST,
  PATCH: styles.methodPATCH,
  DELETE: styles.methodDELETE,
};

async function checkHealth(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
    const body = await res.json();
    return { ok: res.ok, database: body?.data?.database as string | undefined };
  } catch {
    return { ok: false, database: undefined };
  }
}

export default async function ApiDocumentation() {
  // Built from the incoming request's own Host header — the same idea as the
  // labs' getPathUrl(), so this page is correct on localhost, in Docker, and on
  // the EC2 public address without any configuration.
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:4080";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const health = await checkHealth(baseUrl);

  return (
    <main className={styles.main}>
      <h1>RSS Server API</h1>
      <p className={styles.subtitle}>
        CSE5006 Assessment 2 — every endpoint below runs against{" "}
        <code className={styles.baseUrl}>{baseUrl}</code>
      </p>

      <p className={styles.status}>
        {health.ok ? (
          <span className={styles.statusOk}>
            ● Database connected ({health.database ?? "connected"})
          </span>
        ) : (
          <span className={styles.statusBad}>● Database unreachable</span>
        )}
      </p>

      {ENDPOINTS.map((endpoint) => (
        <section key={`${endpoint.method} ${endpoint.path}`} className={styles.endpoint}>
          <h2>
            <span className={`${styles.method} ${METHOD_CLASS[endpoint.method]}`}>
              {endpoint.method}
            </span>
            <span className={styles.path}>{endpoint.path}</span>
          </h2>
          <p className={styles.description}>{endpoint.description}</p>

          <p className={styles.commandLabel}>curl</p>
          <pre className={styles.code}>{endpoint.curl(baseUrl)}</pre>

          <p className={styles.commandLabel}>PowerShell</p>
          <pre className={styles.code}>{endpoint.powershell(baseUrl)}</pre>
        </section>
      ))}

      <p className={styles.footer}>
        Every response uses the same <code>{"{ data, error }"}</code> envelope. The
        frontend (same host, port 80) consumes these through{" "}
        <code>frontend/lib/posts.ts</code> and <code>frontend/lib/apiConfig.ts</code>.
      </p>
    </main>
  );
}
