import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, preflight, readId, requestOrigin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Republishes a feed as real RSS 2.0 so the RSS Client page — and any actual
// feed reader — can consume it. This is what makes "RSS Server" literal rather
// than just a JSON API with RSS in the name.
//
//   GET /api/feeds/rss.xml?id=1
//   GET /api/feeds/rss.xml?slug=build-journal
//
// Returns application/rss+xml, so pasting the URL into a reader works.

/** Escapes the five XML predefined entities. Without this a title containing
 *  & or < produces a feed that will not parse. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: NextRequest) {
  const id = readId(request);
  const slug = request.nextUrl.searchParams.get("slug");

  if (id === "invalid") {
    return new NextResponse("id must be a positive integer", {
      status: 400,
      headers: corsHeaders,
    });
  }
  if (id === null && slug === null) {
    return new NextResponse("Provide ?id= or ?slug=", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const feed = await prisma.feed.findUnique({
    where: id !== null ? { id } : { slug: slug as string },
    include: { posts: { orderBy: { publishedAt: "desc" }, include: { author: true } } },
  });

  if (!feed) {
    return new NextResponse("Feed not found", { status: 404, headers: corsHeaders });
  }

  // The public origin of this request, so <link> elements point somewhere real
  // whether running on localhost or the EC2 public address. request.nextUrl.origin
  // reflects the container's internal bind address (localhost:3000) rather than
  // the Docker-published port the client actually used — see requestOrigin().
  const origin = requestOrigin(request);
  const selfUrl = `${origin}/api/feeds/rss.xml?slug=${encodeURIComponent(feed.slug)}`;

  const items = feed.posts
    .map((post) => {
      const link = post.link ?? `${origin}/api/posts?slug=${encodeURIComponent(post.slug)}`;
      return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="false">${xmlEscape(post.slug)}</guid>
      <description>${xmlEscape(post.summary)}</description>
      <author>${xmlEscape(post.author.name)}</author>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>${
        post.category ? `\n      <category>${xmlEscape(post.category)}</category>` : ""
      }${
        post.imageUrl
          ? `\n      <enclosure url="${xmlEscape(origin + post.imageUrl)}" type="image/svg+xml" length="0" />`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(feed.name)}</title>
    <link>${xmlEscape(origin)}</link>
    <description>${xmlEscape(feed.description ?? `${feed.name} — CSE5006 RSS Server`)}</description>
    <language>en-au</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
