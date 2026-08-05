import type { Metadata } from "next";
import { Suspense } from "react";
import { getPosts } from "@/lib/posts";
import Breadcrumbs from "@/components/Breadcrumbs";
import FeedsView from "@/components/FeedsView";
import styles from "./feeds.module.css";

export const metadata: Metadata = {
  title: "Feeds",
  description: "Live RSS feed items read from the RSS Server's database.",
};

// The awaiting part is split into its own component and wrapped in Suspense
// rather than using a loading.tsx file. A loading.tsx at this segment would
// also cover /feeds/[slug], and streaming that route sends a 200 header before
// notFound() runs — which silently breaks the 404 on unknown slugs.
async function FeedsList() {
  const posts = await getPosts();
  return <FeedsView posts={posts} />;
}

export default function FeedsPage() {
  return (
    <section>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Feeds" }]} />
      <h1>Feeds</h1>
      <p className={styles.lede}>
        Live RSS feed items, read from the RSS Server&apos;s database through its
        API. Newest first.
      </p>
      <Suspense
        fallback={
          <p className={styles.lede} aria-busy="true">
            Loading feed items from the RSS Server…
          </p>
        }
      >
        <FeedsList />
      </Suspense>
    </section>
  );
}
