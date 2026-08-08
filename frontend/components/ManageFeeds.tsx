"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiBaseUrl } from "@/lib/useApiBaseUrl";
import styles from "./ManageFeeds.module.css";

// Deletes real database feeds through the RSS Server's API, unlike the "My
// feeds" list above which only edits a browser-local array (see
// AddFeedDialog's note). This is the admin-facing counterpart: it reads
// GET /api/feeds and issues DELETE /api/feeds?id= — the endpoint the API
// docs page already documents but nothing in the UI called until now.

type FeedRow = {
  id: number;
  slug: string;
  name: string;
  url: string | null;
  description: string | null;
};

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready" };

export default function ManageFeeds() {
  const base = useApiBaseUrl();
  const router = useRouter();
  const [feeds, setFeeds] = useState<FeedRow[]>([]);
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadFeeds = useCallback(async () => {
    if (!base) return;
    setState({ phase: "loading" });
    try {
      const res = await fetch(`${base}/api/feeds`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok || body.error) {
        setState({
          phase: "error",
          message: body.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`,
        });
        return;
      }
      setFeeds(body.data ?? []);
      setState({ phase: "ready" });
    } catch (error) {
      setState({
        phase: "error",
        message:
          error instanceof Error
            ? `Could not reach the RSS Server: ${error.message}`
            : "Could not reach the RSS Server.",
      });
    }
  }, [base]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  async function handleDelete(feed: FeedRow) {
    if (!base) return;
    if (
      !window.confirm(
        `Delete "${feed.name}"? This also deletes all of its posts and citations.`,
      )
    ) {
      return;
    }

    setDeletingId(feed.id);
    setDeleteError(null);
    try {
      const res = await fetch(`${base}/api/feeds?id=${feed.id}`, { method: "DELETE" });
      if (res.status !== 204) {
        const body = await res.json().catch(() => null);
        setDeleteError(
          body?.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`,
        );
        return;
      }
      setFeeds((current) => current.filter((item) => item.id !== feed.id));
      // Posts (feeds/page.tsx) are fetched server-side; refresh so a deleted
      // feed's posts stop showing up in the list below.
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? `Could not reach the RSS Server: ${error.message}`
          : "Could not reach the RSS Server.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="manage-feeds-heading">
      <h2 id="manage-feeds-heading" className={styles.heading}>
        Manage feeds
      </h2>
      <p className={styles.note}>
        Deletes the feed from the RSS Server&rsquo;s database (and cascades to its
        posts) &mdash; not the local &ldquo;My feeds&rdquo; list above.
      </p>

      {state.phase === "loading" && feeds.length === 0 && (
        <p className={styles.hint}>Loading feeds from the RSS Server…</p>
      )}

      {state.phase === "error" && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      {deleteError && (
        <p className={styles.error} role="alert">
          {deleteError}
        </p>
      )}

      {state.phase === "ready" && feeds.length === 0 && (
        <p className={styles.hint}>No feeds in the database.</p>
      )}

      {feeds.length > 0 && (
        <ul className={styles.list}>
          {feeds.map((feed) => (
            <li key={feed.id} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.name}>{feed.name}</span>
                <span className={styles.meta}>
                  /{feed.slug}
                  {feed.url ? ` · ${feed.url}` : ""}
                </span>
                {feed.description && (
                  <span className={styles.description}>{feed.description}</span>
                )}
              </div>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => handleDelete(feed)}
                disabled={deletingId === feed.id}
              >
                {deletingId === feed.id ? "Deleting…" : "Delete"}
                <span className="sr-only"> {feed.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
