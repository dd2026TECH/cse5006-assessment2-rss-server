"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiBaseUrl } from "@/lib/useApiBaseUrl";
import styles from "./ManageFeeds.module.css";

// Full CRUD for real database feeds through the RSS Server's API — distinct
// from the Feeds page's "My feeds" list, which only edits a browser-local
// array (see AddFeedDialog's note). Reads GET /api/feeds and issues
// POST / PATCH / DELETE /api/feeds — endpoints the API docs page already
// documents but nothing in the UI called until now.

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

// Same logic as app/api/prisma/seed.ts — the API requires a unique slug but
// the create form only asks for name/url/description, so one is derived.
const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ManageFeeds() {
  const base = useApiBaseUrl();
  const router = useRouter();
  const [feeds, setFeeds] = useState<FeedRow[]>([]);
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createNameId = useId();
  const createUrlId = useId();
  const createDescriptionId = useId();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editNameId = useId();
  const editUrlId = useId();
  const editDescriptionId = useId();

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

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = createName.trim();
    const trimmedUrl = createUrl.trim();
    const trimmedDescription = createDescription.trim();
    if (!trimmedName || !trimmedUrl) {
      setCreateError("Name and URL are required.");
      return;
    }
    if (!base) return;

    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch(`${base}/api/feeds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugify(trimmedName),
          name: trimmedName,
          url: trimmedUrl,
          description: trimmedDescription,
        }),
      });
      const body = await res.json().catch(() => null);
      if (res.status !== 201 || body?.error) {
        setCreateError(
          body?.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`,
        );
        return;
      }
      setCreateName("");
      setCreateUrl("");
      setCreateDescription("");
      await loadFeeds();
      router.refresh();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? `Could not reach the RSS Server: ${error.message}`
          : "Could not reach the RSS Server.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  }

  function startEdit(feed: FeedRow) {
    // Only one row edits at a time — switching rows discards any unsaved
    // edits on the previously-open row.
    setEditingId(feed.id);
    setEditName(feed.name);
    setEditUrl(feed.url ?? "");
    setEditDescription(feed.description ?? "");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>, feed: FeedRow) {
    event.preventDefault();
    const trimmedName = editName.trim();
    const trimmedUrl = editUrl.trim();
    const trimmedDescription = editDescription.trim();
    if (!trimmedName || !trimmedUrl) {
      setEditError("Name and URL are required.");
      return;
    }
    if (!base) return;

    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`${base}/api/feeds?id=${feed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          url: trimmedUrl,
          description: trimmedDescription === "" ? null : trimmedDescription,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || body?.error) {
        setEditError(
          body?.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`,
        );
        return;
      }
      // Refetch before leaving edit mode, so the row doesn't flip back to
      // read-mode showing the stale pre-edit name while the fetch is in
      // flight and then flicker again once fresh data lands.
      await loadFeeds();
      setEditingId(null);
      router.refresh();
    } catch (error) {
      setEditError(
        error instanceof Error
          ? `Could not reach the RSS Server: ${error.message}`
          : "Could not reach the RSS Server.",
      );
    } finally {
      setEditSubmitting(false);
    }
  }

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
      // The Feeds page's post list is fetched server-side; refresh so a
      // deleted feed's posts stop showing up there too.
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
        Create, edit and delete feeds in the RSS Server&rsquo;s database.
        Deleting cascades to a feed&rsquo;s posts and citations.
      </p>

      <p className={styles.count} role="status">
        {feeds.length} feeds
      </p>

      <form onSubmit={handleCreateSubmit} className={styles.createForm}>
        <div className={styles.field}>
          <label htmlFor={createNameId}>Name</label>
          <input
            id={createNameId}
            type="text"
            required
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="e.g. Product Updates"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={createUrlId}>URL</label>
          <input
            id={createUrlId}
            type="url"
            required
            value={createUrl}
            onChange={(event) => setCreateUrl(event.target.value)}
            placeholder="https://example.com/feed.xml"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={createDescriptionId}>Description (optional)</label>
          <textarea
            id={createDescriptionId}
            rows={2}
            value={createDescription}
            onChange={(event) => setCreateDescription(event.target.value)}
            placeholder="What this feed covers"
          />
        </div>
        {createError && (
          <p className={styles.error} role="alert">
            {createError}
          </p>
        )}
        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={createSubmitting}>
            {createSubmitting ? "Adding…" : "Add feed"}
          </button>
        </div>
      </form>

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
          {feeds.map((feed) =>
            editingId === feed.id ? (
              <li key={feed.id} className={styles.item}>
                <form
                  onSubmit={(event) => handleEditSubmit(event, feed)}
                  className={styles.editForm}
                >
                  <div className={styles.field}>
                    <label htmlFor={editNameId}>Name</label>
                    <input
                      id={editNameId}
                      type="text"
                      required
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor={editUrlId}>URL</label>
                    <input
                      id={editUrlId}
                      type="url"
                      required
                      value={editUrl}
                      onChange={(event) => setEditUrl(event.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor={editDescriptionId}>Description (optional)</label>
                    <textarea
                      id={editDescriptionId}
                      rows={2}
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                    />
                  </div>
                  {editError && (
                    <p className={styles.error} role="alert">
                      {editError}
                    </p>
                  )}
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.cancel}
                      onClick={cancelEdit}
                      disabled={editSubmitting}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submit} disabled={editSubmitting}>
                      {editSubmitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              </li>
            ) : (
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
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => startEdit(feed)}
                  >
                    Edit
                    <span className="sr-only"> {feed.name}</span>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(feed)}
                    disabled={deletingId === feed.id}
                  >
                    {deletingId === feed.id ? "Deleting…" : "Delete"}
                    <span className="sr-only"> {feed.name}</span>
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
