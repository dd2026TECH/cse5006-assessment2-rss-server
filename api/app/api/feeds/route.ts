import { NextRequest } from "next/server";
import { fail, mapPrismaError, ok, preflight, readId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// CRUD for RSS feeds. Uses ?id= for single-record operations, matching the
// Module 7 lab's route shape.

export async function OPTIONS() {
  return preflight();
}

/** GET /api/feeds — all feeds, or one with ?id=. `?withPosts=true` includes posts. */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  const withPosts = request.nextUrl.searchParams.get("withPosts") === "true";

  try {
    if (id !== null) {
      const feed = await prisma.feed.findUnique({
        where: { id },
        include: {
          posts: withPosts
            ? { orderBy: { publishedAt: "desc" }, include: { author: true } }
            : false,
          _count: { select: { posts: true } },
        },
      });
      if (!feed) return fail(request, "Feed not found", 404, startedAt);
      return ok(request, feed, startedAt);
    }

    const feeds = await prisma.feed.findMany({
      orderBy: { name: "asc" },
      include: {
        posts: withPosts
          ? { orderBy: { publishedAt: "desc" }, include: { author: true } }
          : false,
        _count: { select: { posts: true } },
      },
    });
    return ok(request, feeds, startedAt);
  } catch (error) {
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** POST /api/feeds — create a feed. Requires slug and name. */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json();
    const { slug, name, url, description } = body ?? {};

    if (typeof slug !== "string" || slug.trim() === "") {
      return fail(request, "slug is required", 400, startedAt);
    }
    if (typeof name !== "string" || name.trim() === "") {
      return fail(request, "name is required", 400, startedAt);
    }

    const feed = await prisma.feed.create({
      data: {
        slug: slug.trim(),
        name: name.trim(),
        url: typeof url === "string" && url.trim() !== "" ? url.trim() : null,
        description:
          typeof description === "string" && description.trim() !== ""
            ? description.trim()
            : null,
      },
    });
    return ok(request, feed, startedAt, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail(request, "Request body must be valid JSON", 400, startedAt);
    }
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** PATCH /api/feeds?id= — partial update; only the fields supplied change. */
export async function PATCH(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === null) return fail(request, "id is required", 400, startedAt);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    const body = await request.json();
    const { slug, name, url, description } = body ?? {};

    const feed = await prisma.feed.update({
      where: { id },
      data: {
        ...(typeof slug === "string" && { slug: slug.trim() }),
        ...(typeof name === "string" && { name: name.trim() }),
        ...(url !== undefined && { url: typeof url === "string" ? url : null }),
        ...(description !== undefined && {
          description: typeof description === "string" ? description : null,
        }),
      },
    });
    return ok(request, feed, startedAt);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail(request, "Request body must be valid JSON", 400, startedAt);
    }
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** DELETE /api/feeds?id= — removes the feed and cascades to its posts. */
export async function DELETE(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === null) return fail(request, "id is required", 400, startedAt);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    await prisma.feed.delete({ where: { id } });
    return ok(request, null, startedAt, 204);
  } catch (error) {
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}
