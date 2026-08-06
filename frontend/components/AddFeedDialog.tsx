"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SavedFeed } from "@/lib/preferences";
import styles from "./AddFeedDialog.module.css";

const categories = ["Announcements", "Learning", "Theming", "Research"] as const;

export default function AddFeedDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (feed: SavedFeed) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState("");
  const nameId = useId();
  const urlId = useId();
  const categoryId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function resetForm() {
    setName("");
    setUrl("");
    setCategory(categories[0]);
    setDescription("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl) return;

    onAdd({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmedName,
      url: trimmedUrl,
      category,
      description: description.trim(),
    });
    resetForm();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="add-feed-heading"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <h2 id="add-feed-heading" className={styles.heading}>
            Add an RSS feed
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className={styles.note}>
          Saved in this browser. The feed URL isn&rsquo;t fetched yet — that
          arrives with the real RSS backend in Assessment 2.
        </p>

        <div className={styles.field}>
          <label htmlFor={nameId}>Feed name</label>
          <input
            id={nameId}
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. NN/g Articles"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={urlId}>Feed URL</label>
          <input
            id={urlId}
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/feed.xml"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={categoryId}>Category</label>
          <select
            id={categoryId}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={descriptionId}>Description (optional)</label>
          <textarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="What this feed covers"
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.submit}>
            Add feed
          </button>
        </div>
      </form>
    </dialog>
  );
}
