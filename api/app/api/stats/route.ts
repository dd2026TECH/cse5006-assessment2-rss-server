import { NextRequest } from "next/server";
import { fail, ok, preflight } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// The "at least one additional operational endpoint such as request counts,
// feed statistics or similar usage monitoring" the A-band descriptor asks for.
//
// Combines content statistics (what the server holds) with usage statistics
// (what clients have asked for) — the two things Assessment 3's dashboards and
// alert rules will need to read.

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const [feeds, authors, posts, citations, byPath, statuses, latest, slowest] =
      await Promise.all([
        prisma.feed.count(),
        prisma.author.count(),
        prisma.post.count(),
        prisma.citation.count(),
        prisma.requestLog.groupBy({
          by: ["path"],
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: 10,
        }),
        prisma.requestLog.groupBy({
          by: ["status"],
          _count: { status: true },
          orderBy: { status: "asc" },
        }),
        prisma.post.findFirst({
          orderBy: { publishedAt: "desc" },
          select: { title: true, slug: true, publishedAt: true },
        }),
        prisma.requestLog.aggregate({ _avg: { durationMs: true }, _max: { durationMs: true } }),
      ]);

    const perFeed = await prisma.feed.findMany({
      select: { slug: true, name: true, _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });

    return ok(
      request,
      {
        content: {
          feeds,
          authors,
          posts,
          citations,
          latestPost: latest,
          postsPerFeed: perFeed.map((f) => ({
            slug: f.slug,
            name: f.name,
            posts: f._count.posts,
          })),
        },
        usage: {
          requestsByPath: byPath.map((r) => ({ path: r.path, requests: r._count.path })),
          responsesByStatus: statuses.map((r) => ({
            status: r.status,
            count: r._count.status,
          })),
          averageDurationMs: slowest._avg.durationMs,
          slowestDurationMs: slowest._max.durationMs,
        },
      },
      startedAt,
    );
  } catch {
    return fail(request, "Could not compute statistics", 500, startedAt);
  }
}
