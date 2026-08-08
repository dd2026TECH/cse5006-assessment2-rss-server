"use client";

import { useEffect, useState } from "react";
import { useApiBaseUrl } from "@/lib/useApiBaseUrl";
import styles from "./ServerStatus.module.css";

// Surfaces the RSS Server's operational endpoints in the interface, which is
// the "operational output" half of the frontend-backend integration criterion:
// /api/health for liveness and /api/count for how many requests it has served.
//
// Rendered in the footer so it is visible on every page — useful on camera,
// because it updates as you click around the site.

type Status =
  | { phase: "checking" }
  | { phase: "up"; requests: number; latencyMs: number }
  | { phase: "down" };

export default function ServerStatus() {
  const base = useApiBaseUrl();
  const [status, setStatus] = useState<Status>({ phase: "checking" });

  useEffect(() => {
    if (!base) return;
    let cancelled = false;

    async function poll() {
      try {
        const [health, count] = await Promise.all([
          fetch(`${base}/api/health`),
          fetch(`${base}/api/count`),
        ]);
        if (!health.ok || !count.ok) throw new Error("unhealthy");

        const healthBody = await health.json();
        const countBody = await count.json();
        if (cancelled) return;

        setStatus({
          phase: "up",
          requests: countBody.data.totalRequests,
          latencyMs: healthBody.data.latencyMs,
        });
      } catch {
        if (!cancelled) setStatus({ phase: "down" });
      }
    }

    poll();
    // Slow poll: enough to visibly tick up during a demo without hammering the
    // API (and inflating its own request count).
    const timer = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [base]);

  return (
    <p className={styles.status} aria-live="polite">
      <span
        className={`${styles.dot} ${
          status.phase === "up"
            ? styles.up
            : status.phase === "down"
              ? styles.down
              : styles.checking
        }`}
        aria-hidden="true"
      />
      {status.phase === "checking" && "Checking RSS Server…"}
      {status.phase === "down" && "RSS Server unreachable"}
      {status.phase === "up" && (
        <>
          RSS Server online · /api/health: {status.latencyMs}ms database ·{" "}
          /api/count: {status.requests.toLocaleString()} requests served
        </>
      )}
    </p>
  );
}
