// Posts now come from the RSS Server's database instead of a hardcoded array.
//
// Assessment 1 routed every read through getPosts()/getPostBySlug() precisely
// so this swap would be possible without touching a single component — its
// original header comment said exactly that. Those two functions are now async
// and fetch the API; the Post shape they return is unchanged, so FeedsView,
// PostCard and the dynamic post page needed no edits.
//
// The content itself did not change either: the same 11 posts were loaded into
// Postgres by the api package's seed script.

import { serverApiBaseUrl } from "./apiConfig";

export type PostCategory = "Announcements" | "Learning" | "Theming" | "Research";
export const POST_CATEGORIES: PostCategory[] = [
  "Announcements",
  "Learning",
  "Theming",
  "Research",
];

/** A citation's exact substring in `body` paired with the real URL it should link to. */
export type Citation = { text: string; href: string };

export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  author: string;
  date: string; // ISO 8601
  imageUrl: string;
  imageAlt: string; // every image gets a real text alternative (WCAG)
  link: string; // external source URL, if any
  source: string; // name of the feed this item came from
  category: PostCategory;
  citations?: Citation[];
};

/** The shape the API returns — database rows with their relations included. */
type ApiPost = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  link: string | null;
  category: string | null;
  publishedAt: string;
  author: { name: string };
  feed: { name: string };
  citations: Citation[];
};

function toPost(row: ApiPost): Post {
  const category = POST_CATEGORIES.includes(row.category as PostCategory)
    ? (row.category as PostCategory)
    : "Announcements";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    author: row.author.name,
    date: row.publishedAt,
    imageUrl: row.imageUrl ?? "",
    imageAlt: row.imageAlt ?? "",
    link: row.link ?? "",
    source: row.feed.name,
    category,
    citations: row.citations.length > 0 ? row.citations : undefined,
  };
}

/**
 * Reads through the API rather than the database directly, so the frontend
 * container never needs database credentials — it only talks to the api
 * container, which is the architecture the Module 7 lab sets up.
 *
 * `no-store` because the whole point here is that the page shows live database
 * content; a cached copy would be indistinguishable from the old hardcoded array.
 */
export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${serverApiBaseUrl()}/api/posts`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `The RSS Server returned ${response.status} ${response.statusText} for /api/posts`,
    );
  }

  const body = (await response.json()) as { data: ApiPost[] | null; error: string | null };
  if (body.error !== null || body.data === null) {
    throw new Error(body.error ?? "The RSS Server returned no data");
  }

  return body.data.map(toPost);
}

/** One post by slug, or undefined when the server reports 404. */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const response = await fetch(
    `${serverApiBaseUrl()}/api/posts?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(
      `The RSS Server returned ${response.status} ${response.statusText} for /api/posts`,
    );
  }

  const body = (await response.json()) as { data: ApiPost | null; error: string | null };
  if (body.error !== null || body.data === null) return undefined;
  return toPost(body.data);
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
