import { NextResponse } from "next/server";
import { corsHeaders, preflight } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Details PDF instruction 4: "/health healthcheck endpoint".
//
// Deliberately does a real query rather than returning a hardcoded OK — a
// healthcheck that cannot fail tells you nothing. If Postgres is unreachable
// this returns 503, which is what a container orchestrator should act on.
//
// Not logged to RequestLog: healthchecks are polled, and letting them inflate
// /api/count would make the usage numbers meaningless.

const startedAt = Date.now();

export async function OPTIONS() {
  return preflight();
}

export async function GET() {
  const began = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        data: {
          status: "ok",
          database: "connected",
          uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
          latencyMs: Date.now() - began,
          timestamp: new Date().toISOString(),
        },
        error: null,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        data: {
          status: "degraded",
          database: "unreachable",
          uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
          timestamp: new Date().toISOString(),
        },
        error: "Database unreachable",
      },
      { status: 503, headers: corsHeaders },
    );
  }
}
