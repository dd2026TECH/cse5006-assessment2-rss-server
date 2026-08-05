// Seeds the database with Assessment 1's real published content — the same 11
// posts the site already shows, across the two feeds they were written for.
// Using the real content (rather than lorem ipsum) means the Assessment 2
// frontend renders exactly what Assessment 1 did once it reads from the API,
// which is what makes the migration verifiable.
//
// Idempotent: re-running upserts rather than duplicating, so it is safe to run
// on every container start.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — cannot seed.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type SeedPost = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  imageUrl: string;
  imageAlt: string;
  category: string;
  publishedAt: string;
  author: string;
  feed: string;
  citations: { text: string; href: string }[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const FEED_DESCRIPTIONS: Record<string, string> = {
  "Build Journal":
    "Reflections written while building the app — what was new, what was difficult, and why each decision was made.",
  "Research Notes":
    "Posts where a real source was read and then tied back to a concrete decision in this codebase.",
};

async function main() {
  const posts: SeedPost[] = JSON.parse(
    readFileSync(join(__dirname, "seed-data.json"), "utf8"),
  );

  for (const authorName of new Set(posts.map((p) => p.author))) {
    await prisma.author.upsert({
      where: { name: authorName },
      update: {},
      create: { name: authorName },
    });
  }

  for (const feedName of new Set(posts.map((p) => p.feed))) {
    await prisma.feed.upsert({
      where: { slug: slugify(feedName) },
      update: { name: feedName },
      create: {
        slug: slugify(feedName),
        name: feedName,
        description: FEED_DESCRIPTIONS[feedName] ?? null,
        // Authored in-house rather than ingested, so there is no source URL.
        url: null,
      },
    });
  }

  for (const post of posts) {
    const feed = await prisma.feed.findUniqueOrThrow({
      where: { slug: slugify(post.feed) },
    });
    const author = await prisma.author.findUniqueOrThrow({
      where: { name: post.author },
    });

    const saved = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        body: post.body,
        imageUrl: post.imageUrl,
        imageAlt: post.imageAlt,
        category: post.category,
        publishedAt: new Date(post.publishedAt),
        feedId: feed.id,
        authorId: author.id,
      },
      create: {
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        body: post.body,
        imageUrl: post.imageUrl,
        imageAlt: post.imageAlt,
        category: post.category,
        publishedAt: new Date(post.publishedAt),
        feedId: feed.id,
        authorId: author.id,
      },
    });

    // Citations have no natural key, so replace them wholesale rather than
    // trying to match rows — cheap at this size and keeps the seed idempotent.
    await prisma.citation.deleteMany({ where: { postId: saved.id } });
    if (post.citations.length > 0) {
      await prisma.citation.createMany({
        data: post.citations.map((c) => ({
          text: c.text,
          href: c.href,
          postId: saved.id,
        })),
      });
    }
  }

  const [feeds, authors, postCount, citations] = await Promise.all([
    prisma.feed.count(),
    prisma.author.count(),
    prisma.post.count(),
    prisma.citation.count(),
  ]);
  // Written to the stream directly rather than via console: this is a CLI
  // script whose output is the point, not leftover debug logging.
  process.stdout.write(
    `seeded: ${feeds} feeds, ${authors} authors, ${postCount} posts, ${citations} citations\n`,
  );
}

main()
  .catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
