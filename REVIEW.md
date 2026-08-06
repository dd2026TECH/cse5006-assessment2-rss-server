# Review — unattended run, 5 August 2026

Nine commits across seven branches. **Nothing is merged to `main` and nothing is pushed.**
Read this file, then the branches, then decide what to merge.

Branches chain in order (each builds on the previous), so review them in this sequence:

```
refactor/drop-src-folder → fix/iframe-video → feature/database-orm
  → feature/crud-api → feature/rss-client → feature/frontend-integration
  → chore/docker-config → docs/review
```

---

## What changed, and how it was verified

### 1. `refactor/drop-src-folder`
Moved `frontend/src/{app,components,lib}` to the package root; `tsconfig` paths now `"@/*": ["./*"]`.
Addresses the A1 feedback that cost marks in two criteria, and matches the lab layout.

**Verified:** eslint, production build (all 10 routes still statically prerendered), 13/13 Playwright.

### 2. `fix/iframe-video`
`HowToVideo` now uses `<iframe>` instead of `<video>`, per the A1 feedback.

**Verified:** eslint, build, 13/13 Playwright.
**⚠ Needs your judgement** — see "Decisions for you" below.

### 3. `feature/database-orm`
The `api/` package: Prisma 7 + Postgres, models `Feed`, `Author`, `Post`, `Citation`, `RequestLog`.
Seed loads Assessment 1's real 11 posts, extracted programmatically from `frontend/lib/posts.ts`
into `prisma/seed-data.json` rather than hand-copied.

**Read `api/SCHEMA_RATIONALE.md` first** — it justifies every model and relation, and is the script
for that part of the video and the A4 verbal.

**Verified against real Postgres:** migration applied, seed produced 2 feeds / 1 author / 11 posts /
10 citations, and a relational query returned build-journal (6) and research-notes (5) with author,
`body` arrays and citations intact.

### 4. `feature/crud-api`
Full CRUD for feeds, posts and authors, plus `/api/health`, `/api/count`, `/api/stats`.
Shared `{ data, error }` envelope in `lib/api.ts`; Prisma error codes mapped to HTTP.

**Verified live, every endpoint:** create→read→update→delete round trip; 201/204/404/409;
400 for missing id, non-numeric id, missing fields and malformed JSON; CORS preflight 204 with all
three headers; `/api/count` rose 20→25 and 27 rows were confirmed directly in Postgres via `psql`.

### 5. `feature/rss-client`
`GET /api/feeds/rss.xml?slug=` emits real RSS 2.0 with `application/rss+xml`. `/rss-client` fetches
that URL over HTTP and parses the XML in the browser, like a real reader would.

**Verified:** output parses with a real XML parser (6 and 5 items, every item carrying
title/link/guid/description/pubDate); 404 unknown slug; 400 with no parameters; **3 new Playwright
tests drive the client against the live server**.

### 6. `feature/frontend-integration`
`getPosts()`/`getPostBySlug()` now read the API. The hardcoded 300-line array is gone. `ServerStatus`
in the footer shows liveness, request count and DB latency on every page.

**Verified:** 16/16 Playwright including A1's original 13, against live API-backed data.

**Bug found and fixed during verification:** a `loading.tsx` at `app/feeds/` also covered
`/feeds/[slug]`; streaming that route sent the 200 header before `notFound()` ran, so unknown slugs
returned 200 instead of 404. A1's own 404 test caught it. Replaced with a Suspense boundary scoped
to the list.

### 7. `chore/docker-config`
`docker-compose.yml` (frontend `80:3000`, api `4080:3000`, `postgres:15` + named volume), both
Dockerfiles, `entrypoint.sh`, `wait-for-it.sh`, and `.dockerignore` per package. Plus `.gitattributes`
forcing LF endings.

**Verified:** compose YAML parses with expected services/ports/volumes; both scripts pass `bash -n`;
`wait-for-it.sh` run for real against Postgres (detected the open port; exit 1 on a closed one with
`--strict`); all seven container files store zero CR bytes.

**Update 7 Aug: `docker-compose up --build` has now been run**, once Docker Desktop was installed.
All three services came up clean on the first attempt — none of the five predicted first-run
problems occurred. Verified live against the running containers: `/api/health` (DB connected),
`/api/stats` (2 feeds / 1 author / 11 posts / 10 citations), `/feeds` and `/rss-client` both
serving, a `docker-compose down && up` proving the named volume persists data (`No pending
migrations to apply` in the logs on the second start, idempotent re-seed, identical counts), and
`npx playwright test` 16/16 against the containerised stack. Full detail in `PLAN.md`'s "build-up
to EC2" section. The only remaining Docker-related unknown is the actual EC2 instance itself.

---

## Decisions for you

1. **The iframe change.** A stronger reading of *"use iFrames instead of Video tags"* is to host the
   clip on YouTube/Vimeo and embed that, which would also drop the binary from the repo. That needs
   an upload, so it was left as a decision rather than assumed. Current version iframes the local file.
2. **Response envelope.** The API returns `{ data, error }`; the lab returns bare JSON with
   plain-text errors. The envelope is more predictable and the rubric asks for exactly that, but it
   is a deliberate divergence from the lab worth being able to explain.
3. **Author deletion does not cascade.** Deleting an author who still has posts fails with a 400
   rather than destroying content. Reasonable, but it is a design choice you should own.

## Environment changes made on your machine

- **PostgreSQL 18 installed inside WSL2 Ubuntu**, with role `user` / database `mydb` matching the
  compose values, listening on all interfaces. This is what made real verification possible.
  `api/.env` (gitignored) points at the WSL IP — **that IP changes when WSL restarts**; re-check with
  `wsl hostname -I`. In Docker none of this matters; compose supplies `DATABASE_URL`.
- Prisma's `init` dropped agent/editor skill folders (`.claude/`, `.agents/`, `.windsurf/`,
  `skills-lock.json`) into `api/`. Gitignored rather than committed — they are tooling, not code.

## Prisma 7 gotchas (recorded so EC2 doesn't rediscover them)

1. `new PrismaClient()` with no arguments does not compile — a driver adapter is required
   (`@prisma/adapter-pg`).
2. `url = env("DATABASE_URL")` in `schema.prisma` is a hard error (P1012) in Prisma 7. It belongs in
   `prisma.config.ts`; the runtime connection comes from the adapter.
3. Neither Prisma 7 nor `tsx` auto-loads `.env` — the seed imports `dotenv/config` explicitly.

## Still to do

All of the below were open when this file was first written (5 Aug); all are now done as of 7 Aug:

- [x] `docker-compose up --build` — run, verified, see the update above
- [x] `feature/api-docs-page` — built and merged
- [x] Full Lab 7a/7b breakdown transcribed into `PLAN.md` and `VERIFICATION_CHECKLIST.md`
- [x] Root `README.md` endpoint table updated
- [x] Merged to `main` and pushed — `origin/main` matches local `main` exactly

What's actually left now is EC2-specific: see "Remaining human tasks" in `assessment_2/PLAN.md`.

## How to run it right now

```bash
# 1. Postgres (WSL) — needs to stay running
wsl -d Ubuntu -- bash -lc "service postgresql start"
wsl -d Ubuntu -- hostname -I          # update api/.env if this changed

# 2. API
cd api && npm run build && PORT=4080 npm run start

# 3. Frontend (separate shell)
cd frontend && npm run build && npm run start   # http://localhost:3000

# 4. Tests
cd frontend && npx playwright test               # 16 tests, needs the API up
```
