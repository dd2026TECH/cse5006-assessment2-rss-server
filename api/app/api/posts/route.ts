import { NextRequest } from "next/server";
import { fail, mapPrismaError, ok, preflight, readId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// CRUD for posts (the articles inside a feed). This is the endpoint the
// frontend's getPosts() reads.

export async function OPTIONS() {
  return preflight();
}

/**
 * GET /api/posts — newest first.
 *   ?id=       one post by id
 *   ?slug=     one post by slug (how the frontend's /feeds/[slug] page looks up)
 *   ?feedId=   only posts in that feed
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  const slug = request.nextUrl.searchParams.get("slug");
  const feedIdRaw = request.nextUrl.searchParams.get("feedId");
  const include = { author: true, feed: true, citations: true } as const;

  try {
    if (id !== null) {
      const post = await prisma.post.findUnique({ where: { id }, include });
      if (!post) return fail(request, "Post not found", 404, startedAt);
      return ok(request, post, startedAt);
    }

    if (slug !== null) {
      const post = await prisma.post.findUnique({ where: { slug }, include });
      if (!post) return fail(request, "Post not found", 404, startedAt);
      return ok(request, post, startedAt);
    }

    let feedId: number | undefined;
    if (feedIdRaw !== null) {
      const parsed = Number(feedIdRaw);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return fail(request, "feedId must be a positive integer", 400, startedAt);
      }
      feedId = parsed;
    }

    const posts = await prisma.post.findMany({
      where: feedId === undefined ? undefined : { feedId },
      orderBy: { publishedAt: "desc" },
      include,
    });
    return ok(request, posts, startedAt);
  } catch (error) {
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** POST /api/posts — create a post. */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json();
    const {
      slug,
      title,
      summary,
      body: paragraphs,
      imageUrl,
      imageAlt,
      link,
      category,
      publishedAt,
      feedId,
      authorId,
    } = body ?? {};

    for (const [field, value] of [
      ["slug", slug],
      ["title", title],
      ["summary", summary],
    ] as const) {
      if (typeof value !== "string" || value.trim() === "") {
        return fail(request, `${field} is required`, 400, startedAt);
      }
    }
    if (!Number.isInteger(feedId) || feedId <= 0) {
      return fail(request, "feedId is required and must be a positive integer", 400, startedAt);
    }
    if (!Number.isInteger(authorId) || authorId <= 0) {
      return fail(request, "authorId is required and must be a positive integer", 400, startedAt);
    }

    const published = publishedAt === undefined ? new Date() : new Date(publishedAt);
    if (Number.isNaN(published.getTime())) {
      return fail(request, "publishedAt must be a valid date", 400, startedAt);
    }

    const post = await prisma.post.create({
      data: {
        slug: slug.trim(),
        title: title.trim(),
        summary: summary.trim(),
        body: Array.isArray(paragraphs) ? paragraphs.map(String) : [],
        imageUrl: typeof imageUrl === "string" ? imageUrl : null,
        imageAlt: typeof imageAlt === "string" ? imageAlt : null,
        link: typeof link === "string" ? link : null,
        category: typeof category === "string" ? category : null,
        publishedAt: published,
        feedId,
        authorId,
      },
      include: { author: true, feed: true, citations: true },
    });
    return ok(request, post, startedAt, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail(request, "Request body must be valid JSON", 400, startedAt);
    }
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** PATCH /api/posts?id= — partial update. */
export async function PATCH(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === null) return fail(request, "id is required", 400, startedAt);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    const body = await request.json();
    const { title, summary, body: paragraphs, imageUrl, imageAlt, link, category, publishedAt } =
      body ?? {};

    let published: Date | undefined;
    if (publishedAt !== undefined) {
      published = new Date(publishedAt);
      if (Number.isNaN(published.getTime())) {
        return fail(request, "publishedAt must be a valid date", 400, startedAt);
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(typeof title === "string" && { title: title.trim() }),
        ...(typeof summary === "string" && { summary: summary.trim() }),
        ...(Array.isArray(paragraphs) && { body: paragraphs.map(String) }),
        ...(imageUrl !== undefined && {
          imageUrl: typeof imageUrl === "string" ? imageUrl : null,
        }),
        ...(imageAlt !== undefined && {
          imageAlt: typeof imageAlt === "string" ? imageAlt : null,
        }),
        ...(link !== undefined && { link: typeof link === "string" ? link : null }),
        ...(category !== undefined && {
          category: typeof category === "string" ? category : null,
        }),
        ...(published !== undefined && { publishedAt: published }),
      },
      include: { author: true, feed: true, citations: true },
    });
    return ok(request, post, startedAt);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail(request, "Request body must be valid JSON", 400, startedAt);
    }
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** DELETE /api/posts?id= */
export async function DELETE(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === null) return fail(request, "id is required", 400, startedAt);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    await prisma.post.delete({ where: { id } });
    return ok(request, null, startedAt, 204);
  } catch (error) {
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}
