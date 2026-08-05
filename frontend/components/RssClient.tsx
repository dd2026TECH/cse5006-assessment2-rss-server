"use client";

import { useCallback, useEffect, useState } from "react";
import { feedUrl } from "@/lib/apiConfig";
import { useApiBaseUrl } from "@/lib/useApiBaseUrl";
import styles from "./RssClient.module.css";

// The RSS Client (Details PDF instruction 3: "develop a RSS Client page to
// connect to your RSS Server").
//
// This deliberately does NOT read the database or any internal API. It fetches
// the feed's public RSS 2.0 URL over HTTP and parses the XML in the browser,
// exactly as a real feed reader would — which is what makes the demonstration
// "the RSS Server sending feeds to the RSS Client" rather than one page reading
// another page's data.

type FeedOption = { slug: string; name: string };

type Item = {
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
  category: string | null;
};

type Channel = { title: string; description: string; items: Item[] };

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; channel: Channel; raw: string; fetchedAt: string };

const text = (parent: Element, tag: string) =>
  parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";

export default function RssClient() {
  const [feeds, setFeeds] = useState<FeedOption[]>([]);
  const [slug, setSlug] = useState<string>("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const [showRaw, setShowRaw] = useState(false);

  // null while server-rendering; the real origin once hydrated.
  const base = useApiBaseUrl();

  // Ask the server which feeds it publishes, so the page is not hardcoded.
  useEffect(() => {
    if (!base) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${base}/api/feeds`);
        if (!res.ok) return;
        const body = await res.json();
        if (cancelled) return;
        const options: FeedOption[] = (body.data ?? []).map(
          (f: { slug: string; name: string }) => ({ slug: f.slug, name: f.name }),
        );
        setFeeds(options);
        setSlug((current) => current || options[0]?.slug || "");
      } catch {
        // Leaving feeds empty is enough; fetchFeed surfaces the real error.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [base]);

  const fetchFeed = useCallback(async (targetSlug: string) => {
    if (!targetSlug) return;
    setState({ phase: "loading" });
    try {
      const res = await fetch(feedUrl(targetSlug));
      if (!res.ok) {
        setState({
          phase: "error",
          message: `The RSS Server responded ${res.status} ${res.statusText}.`,
        });
        return;
      }
      const raw = await res.text();
      const doc = new DOMParser().parseFromString(raw, "application/xml");

      if (doc.getElementsByTagName("parsererror").length > 0) {
        setState({ phase: "error", message: "The feed was not valid XML." });
        return;
      }

      const channelEl = doc.getElementsByTagName("channel")[0];
      if (!channelEl) {
        setState({ phase: "error", message: "No <channel> element in the feed." });
        return;
      }

      const items = Array.from(doc.getElementsByTagName("item")).map((item) => ({
        title: text(item, "title"),
        link: text(item, "link"),
        description: text(item, "description"),
        author: text(item, "author"),
        pubDate: text(item, "pubDate"),
        category: text(item, "category") || null,
      }));

      setState({
        phase: "ready",
        channel: {
          title: text(channelEl, "title"),
          description: text(channelEl, "description"),
          items,
        },
        raw,
        fetchedAt: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      setState({
        phase: "error",
        message:
          error instanceof Error
            ? `Could not reach the RSS Server: ${error.message}`
            : "Could not reach the RSS Server.",
      });
    }
  }, []);

  const url = slug && base ? feedUrl(slug) : "";

  return (
    <div className={styles.client}>
      <div className={styles.controls}>
        <label className={styles.field}>
          <span>Feed</span>
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={feeds.length === 0}
          >
            {feeds.length === 0 && <option value="">No feeds available</option>}
            {feeds.map((feed) => (
              <option key={feed.slug} value={feed.slug}>
                {feed.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.fetch}
          onClick={() => fetchFeed(slug)}
          disabled={!slug || state.phase === "loading"}
        >
          {state.phase === "loading" ? "Fetching…" : "Fetch feed"}
        </button>
      </div>

      {/* The feed URL must be visible on screen — it is what proves the client
          is talking to the server over HTTP, and it is subscribable in a real reader. */}
      <p className={styles.urlLabel}>Subscribing to</p>
      <code className={styles.url}>{url || "resolving…"}</code>

      <div aria-live="polite" className={styles.results}>
        {state.phase === "idle" && (
          <p className={styles.hint}>
            Choose a feed and select <strong>Fetch feed</strong> to request it from
            the RSS Server.
          </p>
        )}

        {state.phase === "loading" && <p className={styles.hint}>Requesting the feed…</p>}

        {state.phase === "error" && (
          <p className={styles.error} role="alert">
            {state.message}
          </p>
        )}

        {state.phase === "ready" && (
          <>
            <div className={styles.channelHead}>
              <h2>{state.channel.title}</h2>
              <p>{state.channel.description}</p>
              <p className={styles.meta}>
                Received {state.channel.items.length} items at {state.fetchedAt}
              </p>
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowRaw((value) => !value)}
                aria-expanded={showRaw}
              >
                {showRaw ? "Hide raw XML" : "Show raw XML"}
              </button>
            </div>

            {showRaw && <pre className={styles.raw}>{state.raw}</pre>}

            <ul className={styles.items}>
              {state.channel.items.map((item) => (
                <li key={item.link || item.title} className={styles.item}>
                  <h3>
                    <a href={item.link}>{item.title}</a>
                  </h3>
                  <p className={styles.itemMeta}>
                    {item.author}
                    {item.category ? ` · ${item.category}` : ""} · {item.pubDate}
                  </p>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
