import { NextRequest } from "next/server";
import { fail, mapPrismaError, ok, preflight, readId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// CRUD for authors — "who posted them" from Details PDF instruction 1.

export async function OPTIONS() {
  return preflight();
}

/** GET /api/authors — all authors, or one with ?id=. */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    if (id !== null) {
      const author = await prisma.author.findUnique({
        where: { id },
        include: { _count: { select: { posts: true } } },
      });
      if (!author) return fail(request, "Author not found", 404, startedAt);
      return ok(request, author, startedAt);
    }

    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return ok(request, authors, startedAt);
  } catch (error) {
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** POST /api/authors — create an author. Requires name. */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json();
    const { name, email } = body ?? {};

    if (typeof name !== "string" || name.trim() === "") {
      return fail(request, "name is required", 400, startedAt);
    }

    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        email: typeof email === "string" && email.trim() !== "" ? email.trim() : null,
      },
    });
    return ok(request, author, startedAt, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail(request, "Request body must be valid JSON", 400, startedAt);
    }
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/** PATCH /api/authors?id= — partial update. */
export async function PATCH(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === null) return fail(request, "id is required", 400, startedAt);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    const body = await request.json();
    const { name, email } = body ?? {};

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(typeof name === "string" && { name: name.trim() }),
        ...(email !== undefined && { email: typeof email === "string" ? email : null }),
      },
    });
    return ok(request, author, startedAt);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return fail(request, "Request body must be valid JSON", 400, startedAt);
    }
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}

/**
 * DELETE /api/authors?id=
 * Deliberately not cascading: an author's posts are content, so removing an
 * author who still has posts fails on the foreign key (mapped to 400) rather
 * than silently destroying them.
 */
export async function DELETE(request: NextRequest) {
  const startedAt = Date.now();
  const id = readId(request);
  if (id === null) return fail(request, "id is required", 400, startedAt);
  if (id === "invalid") return fail(request, "id must be a positive integer", 400, startedAt);

  try {
    await prisma.author.delete({ where: { id } });
    return ok(request, null, startedAt, 204);
  } catch (error) {
    const { message, status } = mapPrismaError(error);
    return fail(request, message, status, startedAt);
  }
}
