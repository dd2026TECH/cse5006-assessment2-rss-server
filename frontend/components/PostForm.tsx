"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiBaseUrl } from "@/lib/useApiBaseUrl";
import { POST_CATEGORIES, type Post, type PostCategory } from "@/lib/posts";
import styles from "./PostForm.module.css";

// Full Create/Update for posts — the article content itself, not just the
// feed/channel metadata Admin used to manage. feedId/authorId are only
// settable at creation (the API's PATCH /api/posts doesn't accept them), so
// edit mode never shows those pickers.

type FeedOption = { id: number; name: string };
type AuthorOption = { id: number; name: string };

const NEW_OPTION = "__new__";

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const toDateInputValue = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

type Props =
  | { mode: "create" }
  | { mode: "edit"; post: Post; onCancel: () => void; onSaved: () => void };

export default function PostForm(props: Props) {
  const base = useApiBaseUrl();
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const [title, setTitle] = useState(isEdit ? props.post.title : "");
  const [summary, setSummary] = useState(isEdit ? props.post.summary : "");
  const [bodyText, setBodyText] = useState(isEdit ? props.post.body.join("\n\n") : "");
  const [imageUrl, setImageUrl] = useState(isEdit ? props.post.imageUrl : "");
  const [imageAlt, setImageAlt] = useState(isEdit ? props.post.imageAlt : "");
  const [link, setLink] = useState(isEdit ? props.post.link : "");
  const [category, setCategory] = useState<PostCategory>(
    isEdit ? props.post.category : "Announcements",
  );
  const [publishedAt, setPublishedAt] = useState(
    isEdit ? toDateInputValue(props.post.date) : toDateInputValue(new Date().toISOString()),
  );

  const [feeds, setFeeds] = useState<FeedOption[]>([]);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [feedId, setFeedId] = useState<string>("");
  const [authorId, setAuthorId] = useState<string>("");
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorEmail, setNewAuthorEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const summaryId = useId();
  const bodyId = useId();
  const imageUrlId = useId();
  const imageAltId = useId();
  const linkId = useId();
  const categoryId = useId();
  const publishedAtId = useId();
  const feedIdId = useId();
  const authorIdId = useId();

  // Feed/author pickers only matter on create — edit can't reassign either.
  useEffect(() => {
    if (isEdit || !base) return;
    let cancelled = false;

    async function loadOptions() {
      try {
        const [feedsRes, authorsRes] = await Promise.all([
          fetch(`${base}/api/feeds`),
          fetch(`${base}/api/authors`),
        ]);
        const feedsBody = await feedsRes.json();
        const authorsBody = await authorsRes.json();
        if (cancelled) return;

        const feedOptions: FeedOption[] = feedsBody.data ?? [];
        const authorOptions: AuthorOption[] = authorsBody.data ?? [];
        setFeeds(feedOptions);
        setAuthors(authorOptions);
        setFeedId(feedOptions[0] ? String(feedOptions[0].id) : NEW_OPTION);
        setAuthorId(authorOptions[0] ? String(authorOptions[0].id) : NEW_OPTION);
      } catch {
        // Leave pickers empty; submit will surface "feedId is required" from the API.
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [base, isEdit]);

  async function resolveFeedId(): Promise<number> {
    if (feedId !== NEW_OPTION) return Number(feedId);
    const res = await fetch(`${base}/api/feeds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slugify(newFeedName),
        name: newFeedName.trim(),
        url: newFeedUrl.trim(),
      }),
    });
    const body = await res.json();
    if (res.status !== 201 || body.error) {
      throw new Error(body.error ?? "Could not create the new feed");
    }
    return body.data.id;
  }

  async function resolveAuthorId(): Promise<number> {
    if (authorId !== NEW_OPTION) return Number(authorId);
    const res = await fetch(`${base}/api/authors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAuthorName.trim(),
        email: newAuthorEmail.trim() || undefined,
      }),
    });
    const body = await res.json();
    if (res.status !== 201 || body.error) {
      throw new Error(body.error ?? "Could not create the new author");
    }
    return body.data.id;
  }

  function parseBody(): string[] {
    return bodyText
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!base) return;
    setSubmitting(true);
    setError(null);

    try {
      const shared = {
        title: title.trim(),
        summary: summary.trim(),
        body: parseBody(),
        imageUrl: imageUrl.trim() || null,
        imageAlt: imageAlt.trim() || null,
        link: link.trim() || null,
        category,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      };

      if (isEdit) {
        const res = await fetch(`${base}/api/posts?id=${props.post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shared),
        });
        const responseBody = await res.json();
        if (!res.ok || responseBody.error) {
          throw new Error(
            responseBody.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`,
          );
        }
        router.refresh();
        props.onSaved();
        return;
      }

      const resolvedFeedId = await resolveFeedId();
      const resolvedAuthorId = await resolveAuthorId();
      const slug = slugify(title);
      const res = await fetch(`${base}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...shared, slug, feedId: resolvedFeedId, authorId: resolvedAuthorId }),
      });
      const responseBody = await res.json();
      if (res.status !== 201 || responseBody.error) {
        throw new Error(
          responseBody.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`,
        );
      }
      router.push(`/feeds/${slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reach the RSS Server.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {!isEdit && (
        <>
          <div className={styles.field}>
            <label htmlFor={feedIdId}>Feed</label>
            <select
              id={feedIdId}
              required
              value={feedId}
              onChange={(event) => setFeedId(event.target.value)}
            >
              {feeds.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name}
                </option>
              ))}
              <option value={NEW_OPTION}>+ Add new feed…</option>
            </select>
          </div>
          {feedId === NEW_OPTION && (
            <div className={styles.subFields}>
              <div className={styles.field}>
                <label htmlFor={`${feedIdId}-name`}>New feed name</label>
                <input
                  id={`${feedIdId}-name`}
                  type="text"
                  required
                  value={newFeedName}
                  onChange={(event) => setNewFeedName(event.target.value)}
                  placeholder="e.g. Product Updates"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${feedIdId}-url`}>New feed URL</label>
                <input
                  id={`${feedIdId}-url`}
                  type="url"
                  required
                  value={newFeedUrl}
                  onChange={(event) => setNewFeedUrl(event.target.value)}
                  placeholder="https://example.com/feed.xml"
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor={authorIdId}>Author</label>
            <select
              id={authorIdId}
              required
              value={authorId}
              onChange={(event) => setAuthorId(event.target.value)}
            >
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
              <option value={NEW_OPTION}>+ Add new author…</option>
            </select>
          </div>
          {authorId === NEW_OPTION && (
            <div className={styles.subFields}>
              <div className={styles.field}>
                <label htmlFor={`${authorIdId}-name`}>New author name</label>
                <input
                  id={`${authorIdId}-name`}
                  type="text"
                  required
                  value={newAuthorName}
                  onChange={(event) => setNewAuthorName(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${authorIdId}-email`}>New author email (optional)</label>
                <input
                  id={`${authorIdId}-email`}
                  type="email"
                  value={newAuthorEmail}
                  onChange={(event) => setNewAuthorEmail(event.target.value)}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className={styles.field}>
        <label htmlFor={titleId}>Title</label>
        <input
          id={titleId}
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={summaryId}>Summary</label>
        <textarea
          id={summaryId}
          rows={2}
          required
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={bodyId}>Body (blank line between paragraphs)</label>
        <textarea
          id={bodyId}
          rows={8}
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={categoryId}>Category</label>
        <select
          id={categoryId}
          value={category}
          onChange={(event) => setCategory(event.target.value as PostCategory)}
        >
          {POST_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={publishedAtId}>Published date</label>
        <input
          id={publishedAtId}
          type="date"
          value={publishedAt}
          onChange={(event) => setPublishedAt(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={imageUrlId}>Image URL (optional)</label>
        <input
          id={imageUrlId}
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={imageAltId}>Image alt text (optional)</label>
        <input
          id={imageAltId}
          type="text"
          value={imageAlt}
          onChange={(event) => setImageAlt(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={linkId}>Source link (optional)</label>
        <input
          id={linkId}
          type="url"
          value={link}
          onChange={(event) => setLink(event.target.value)}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        {isEdit && (
          <button
            type="button"
            className={styles.cancel}
            onClick={props.onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save" : "Publish post"}
        </button>
      </div>
    </form>
  );
}
