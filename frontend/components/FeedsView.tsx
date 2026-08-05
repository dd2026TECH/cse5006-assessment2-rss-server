"use client";

import { useState } from "react";
import type { Post } from "@/lib/posts";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  FEED_LAYOUT_KEY,
  SAVED_FEEDS_KEY,
  type FeedLayout,
  type SavedFeed,
} from "@/lib/preferences";
import PostCard from "./PostCard";
import AddFeedDialog from "./AddFeedDialog";
import styles from "./FeedsView.module.css";

export default function FeedsView({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useLocalStorage<FeedLayout>(
    FEED_LAYOUT_KEY,
    "card",
  );
  const [savedFeeds, setSavedFeeds] = useLocalStorage<SavedFeed[]>(
    SAVED_FEEDS_KEY,
    [],
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? posts.filter((post) =>
        [post.title, post.summary, post.source, post.category, post.author]
          .join(" ")
          .toLowerCase()
          .includes(trimmed),
      )
    : posts;

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label htmlFor="feed-search" className="sr-only">
            Search posts
          </label>
          <input
            id="feed-search"
            type="search"
            placeholder="Search posts…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.search}
          />
        </div>
        <div
          className={styles.layoutToggle}
          role="group"
          aria-label="Feed layout"
        >
          <button
            type="button"
            className={styles.toggleButton}
            aria-pressed={layout === "card"}
            onClick={() => setLayout("card")}
          >
            Cards
          </button>
          <button
            type="button"
            className={styles.toggleButton}
            aria-pressed={layout === "list"}
            onClick={() => setLayout("list")}
          >
            List
          </button>
        </div>
        <button
          type="button"
          className={styles.addFeedButton}
          onClick={() => setDialogOpen(true)}
        >
          + Add RSS feed
        </button>
      </div>

      {savedFeeds.length > 0 && (
        <section
          className={styles.savedFeeds}
          aria-labelledby="saved-feeds-heading"
        >
          <h2 id="saved-feeds-heading" className={styles.savedFeedsHeading}>
            My feeds
          </h2>
          <ul className={styles.savedFeedsList}>
            {savedFeeds.map((feed) => (
              <li key={feed.id} className={styles.savedFeedItem}>
                <div className={styles.savedFeedInfo}>
                  <span className={styles.savedFeedName}>{feed.name}</span>
                  <span className={styles.savedFeedMeta}>
                    {feed.category}
                    <span aria-hidden="true"> · </span>
                    {feed.url}
                  </span>
                  {feed.description && (
                    <span className={styles.savedFeedDescription}>
                      {feed.description}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.removeFeedButton}
                  onClick={() =>
                    setSavedFeeds(
                      savedFeeds.filter((item) => item.id !== feed.id),
                    )
                  }
                >
                  Remove
                  <span className="sr-only"> {feed.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AddFeedDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={(feed) => setSavedFeeds([...savedFeeds, feed])}
      />

      <p className={styles.count} role="status">
        {filtered.length === posts.length
          ? `${posts.length} posts`
          : `${filtered.length} of ${posts.length} posts match`}
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          No posts match &ldquo;{query}&rdquo;. Try a different search term.
        </p>
      ) : (
        <ul className={layout === "card" ? styles.grid : styles.stack}>
          {filtered.map((post) => (
            <li key={post.id}>
              <PostCard post={post} layout={layout} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
