"use client";

import styles from "./feeds.module.css";

// Error boundary for the Feeds route. The frontend now depends on a separate
// container, so "the API is down" is a real state a user can reach — showing a
// blank page or a stack trace would not be acceptable.
export default function FeedsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section>
      <h1>Feeds unavailable</h1>
      <p className={styles.lede}>
        The RSS Server could not be reached, so there are no feed items to show
        right now.
      </p>
      <p className={styles.lede}>
        <strong>Details:</strong> {error.message}
      </p>
      <button type="button" onClick={reset} className={styles.retry}>
        Try again
      </button>
    </section>
  );
}
