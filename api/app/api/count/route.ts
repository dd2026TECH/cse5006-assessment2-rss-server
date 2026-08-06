import { NextRequest } from "next/server";
import { fail, ok, preflight } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Details PDF instruction 4: "/count for number of client request".
//
// Read from the RequestLog table rather than an in-memory counter, so the
// number survives a container restart. An in-memory count would reset to zero
// every deploy and would not be a count of anything useful.

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [total, last24h, firstRow] = await Promise.all([
      prisma.requestLog.count(),
      prisma.requestLog.count({ where: { createdAt: { gte: since } } }),
      prisma.requestLog.findFirst({ orderBy: { createdAt: "asc" } }),
    ]);

    return ok(
      request,
      {
        totalRequests: total,
        last24Hours: last24h,
        countingSince: firstRow?.createdAt ?? null,
      },
      startedAt,
    );
  } catch {
    return fail(request, "Could not read request log", 500, startedAt);
  }
}
