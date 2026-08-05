import type { Metadata } from "next";
import RssClient from "@/components/RssClient";
import styles from "./rss-client.module.css";

export const metadata: Metadata = {
  title: "RSS Client",
  description:
    "Fetches a channel's RSS 2.0 feed from the RSS Server over HTTP and displays what it received.",
};

export default function RssClientPage() {
  return (
    <section className={styles.page}>
      <h1>RSS Client</h1>
      <p className={styles.lede}>
        This page is a feed reader. It requests a feed&apos;s public RSS 2.0
        document from the RSS Server over HTTP and parses the XML in your
        browser — the same thing any real reader does. Nothing here touches the
        database directly.
      </p>

      <RssClient />
    </section>
  );
}
