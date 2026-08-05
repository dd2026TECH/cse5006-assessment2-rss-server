# Schema rationale

Why each model and relation exists. The A-band descriptor for the 7-mark schema criterion asks for
models and relationships that are *"sensible and easy to justify"* — this is the justification, and
it is also the script for that part of the video and the Assessment 4 verbal.

## What the brief asks for

> "Create a database schema that represents **RSS feeds**, **who posted them**, **dates**, **blog
> data**, **images and links**, and any other core fields needed for the project." — Details PDF, #1

Each of those maps to something concrete:

| Brief phrase | Where it lives |
|---|---|
| RSS feeds | `Feed` |
| who posted them | `Author` |
| dates | `Post.publishedAt` (plus `createdAt`/`updatedAt` everywhere) |
| blog data | `Post.title`, `summary`, `body`, `category` |
| images | `Post.imageUrl`, `Post.imageAlt` |
| links | `Post.link`, `Citation.href` |
| "other core fields needed" | `Citation`, `RequestLog` |

## The models

**`Feed`** — an RSS source. Assessment 1's content came from two feeds, "Build Journal" and
"Research Notes", so those are the seeded rows. `url` is **nullable on purpose**: those two are
authored in-house and have no upstream feed to fetch, whereas a genuinely external source would
carry one. That nullability is the distinction between a feed the server *publishes* and one it
*ingests*.

**`Author`** — kept separate from `Feed` rather than as a string on `Post`, because the brief names
"who posted them" as its own concept, and because one person can publish to several feeds. `name` is
unique so the seed can upsert idempotently.

**`Post`** — one article. Two field choices worth defending:

- `body` is `String[]`, not a single blob. Assessment 1 already stores paragraphs as an array and
  Postgres supports arrays natively, so there is no join table and nothing to re-split on read. This
  is a place where choosing Postgres (Lab 7b) over SQLite (Lab 7a) buys something real.
- `publishedAt` is distinct from `createdAt`. The date the article was published is content; the
  date the row was inserted is bookkeeping. Conflating them would break ordering as soon as anything
  is re-imported.

Deleting a `Feed` cascades to its posts (`onDelete: Cascade`) — a feed's articles have no meaning
without it. Deleting an `Author` does **not** cascade; that would silently destroy content, so it is
left to fail loudly against the foreign key instead.

**`Citation`** — 7 of the 11 seeded posts cite real sources inline. A related table rather than a
JSON column keeps them queryable ("which sources does this project actually cite?"), which is
exactly the kind of question Assessment 3's reporting will ask.

**`RequestLog`** — persisted request history, written by the API routes. It exists because:

- Instruction #4 asks for `/count` — "number of client requests". Held in memory that resets on every
  container restart, which is not a count of anything meaningful.
- Instruction #9 asks for "a backend architecture that can support later dashboard, alert and
  reporting features in Assessment 3". This table is that foundation: it is what a dashboard reads
  and what an alert rule fires on. `durationMs` is nullable so latency reporting has somewhere to go
  in A3 without a migration.

## Deviations from the lab, and why

- **Prisma 7 requires a driver adapter.** The lab's `new PrismaClient()` no longer compiles; the
  generated client's own docs specify `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
  `lib/prisma.ts` follows that, with `@prisma/adapter-pg`.
- **`prisma.config.ts`** is new in Prisma 7 and holds the CLI's datasource URL, because Prisma 7 no
  longer auto-loads `.env` for CLI commands (hence the `dotenv` devDependency). `schema.prisma` still
  declares `url = env("DATABASE_URL")` for the runtime client, exactly as the lab does.
- **Generated client output** is `app/generated/prisma` (Prisma's own default here) and is gitignored;
  the Dockerfile regenerates it at build time.

## Verification status

Verified so far: `prisma validate` passes, `prisma generate` succeeds, TypeScript and ESLint are
clean, and `next build` is green.

**Not yet verified:** the migration and seed have not run against a real Postgres, because there was
no database available when this was written. `prisma migrate dev --name init` and `npm run db:seed`
are the first two things to run once one exists. Expected result: 2 feeds, 1 author, 11 posts,
and citations on 7 of them.
