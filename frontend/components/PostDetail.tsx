"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDate, type Post } from "@/lib/posts";
import { useApiBaseUrl } from "@/lib/useApiBaseUrl";
import CitedParagraph from "@/components/CitedParagraph";
import PostForm from "@/components/PostForm";
import styles from "./PostDetail.module.css";

// Everyone can edit or delete a post here — there is no login system in this
// app, so a fake "admin only" gate on the button would be dishonest UI. The
// API itself is what actually persists the change to Postgres.
export default function PostDetail({ post }: { post: Post }) {
  const base = useApiBaseUrl();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!base) return;
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${base}/api/posts?id=${post.id}`, { method: "DELETE" });
      if (res.status !== 204) {
        const body = await res.json().catch(() => null);
        setDeleteError(body?.error ?? `The RSS Server responded ${res.status} ${res.statusText}.`);
        return;
      }
      router.push("/feeds");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? `Could not reach the RSS Server: ${error.message}`
          : "Could not reach the RSS Server.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <article className={styles.post}>
        <PostForm mode="edit" post={post} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
      </article>
    );
  }

  return (
    <article className={styles.post}>
      <header className={styles.header}>
        <p className={styles.category}>{post.category}</p>
        <h1>{post.title}</h1>
        <p className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true"> · </span>
          {post.source}
          <span aria-hidden="true"> · </span>
          By {post.author}
        </p>
      </header>

      <Image
        src={post.imageUrl}
        alt={post.imageAlt}
        width={800}
        height={450}
        className={styles.hero}
        priority
      />

      <div className={styles.body}>
        {post.body.map((paragraph, index) => (
          <CitedParagraph key={index} text={paragraph} citations={post.citations} />
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.editButton} onClick={() => setEditing(true)}>
          Edit post
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete post"}
        </button>
      </div>
      {deleteError && (
        <p className={styles.error} role="alert">
          {deleteError}
        </p>
      )}
    </article>
  );
}
