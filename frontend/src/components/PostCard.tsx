"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate, type Post } from "@/lib/posts";
import type { FeedLayout } from "@/lib/preferences";
import styles from "./PostCard.module.css";

const categoryStyles: Record<Post["category"], string> = {
  Announcements: styles.announcements,
  Learning: styles.learning,
  Theming: styles.theming,
  Research: styles.research,
};

export default function PostCard({
  post,
  layout = "card",
}: {
  post: Post;
  layout?: FeedLayout;
}) {
  const [expanded, setExpanded] = useState(false);
  const summaryId = `post-summary-${post.id}`;

  return (
    <article
      className={`${styles.card} ${
        layout === "list" ? styles.listVariant : ""
      } ${categoryStyles[post.category]}`}
    >
      <p className={styles.banner}>{post.category}</p>
      <Image
        src={post.imageUrl}
        alt={post.imageAlt}
        width={800}
        height={450}
        className={styles.image}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>
          <Link href={`/feeds/${post.slug}`} className={styles.titleLink}>
            {post.title}
          </Link>
        </h3>
        <p className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true"> · </span>
          {post.source}
          <span aria-hidden="true"> · </span>
          By {post.author}
          {layout === "list" && (
            <>
              <span aria-hidden="true"> · </span>
              <span className={styles.categoryInline}>{post.category}</span>
            </>
          )}
        </p>
        <p
          id={summaryId}
          className={`${styles.summary} ${
            expanded ? "" : styles.summaryClamped
          }`}
        >
          {post.summary}
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.expandButton}
            aria-expanded={expanded}
            aria-controls={summaryId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Show more"}
            <span className="sr-only"> of the summary for {post.title}</span>
          </button>
          <Link href={`/feeds/${post.slug}`} className={styles.readMore}>
            Read more
            <span className="sr-only">: {post.title}</span>
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
