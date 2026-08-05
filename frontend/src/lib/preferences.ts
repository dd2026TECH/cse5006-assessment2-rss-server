// Keys and types for preferences persisted in localStorage.

export type FeedLayout = "card" | "list";

export const FEED_LAYOUT_KEY = "feed-layout";

// User-added RSS feeds (Assessment 1 stores these client-side only; the
// feed URL isn't fetched yet — that arrives with the real backend in
// Assessment 2). Kept separate from the sample posts in lib/posts.ts.
export type SavedFeed = {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
};

export const SAVED_FEEDS_KEY = "saved-feeds";
