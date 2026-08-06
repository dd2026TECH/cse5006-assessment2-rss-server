import Link from "next/link";
import styles from "./not-found.module.css";

// Rendered inside the root layout, so it keeps the header, nav, footer and
// theme — a consistent, branded 404 instead of the unstyled framework default.
export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>This page could not be found</h1>
      <p className={styles.lede}>
        The page you were looking for doesn&apos;t exist — it may have been a
        mistyped address, or a feed post that isn&apos;t here.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primaryCta}>
          Back to home
        </Link>
        <Link href="/feeds" className={styles.secondaryCta}>
          Browse the feeds
        </Link>
      </div>
    </div>
  );
}
