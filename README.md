# CSE5006 Assessment 2 — RSS Server

Backend implementation, API and database for the RSS Server project. Extends the Assessment 1
frontend with a database, CRUD and operational APIs, an RSS Client page, and Docker.

**Student:** Xueting Denise Chin (22663637)
**Assessment 1 frontend:** [cse5006-assessment1-rss-server](https://github.com/dd2026TECH/cse5006-assessment1-rss-server)

## Why the history looks long

This repo was created by cloning the Assessment 1 app rather than copying its files, so A1's
full build history (64 commits, back to the original `create-next-app` scaffold) is an ancestor
of every commit here. `git log --graph --oneline` shows one continuous story from A1 into A2.
The Assessment 1 repo itself is left untouched exactly as it was submitted.

## Architecture

Two Next.js packages plus a database service, following the Module 7 lab's split (Lab 7b's
Prisma + Postgres variant, not 7a's Sequelize + SQLite one):

```
.
├── frontend/           Next.js UI (the Assessment 1 app, extended)
├── api/                Next.js API only — route handlers + Prisma
└── docker-compose.yml  frontend · api · postgres
```

| Service | Role | Tech | Port (host:container) |
|---|---|---|---|
| `frontend` | UI only | Next.js | `80:3000` |
| `api` | REST API only | Next.js + Prisma 7 | `4080:3000` |
| `postgres` | Database | `postgres:15`, named volume | `5432:5432` |

Server components in `frontend/` reach the API inside the Docker network by service name
(`http://api:3000`, set via `API_INTERNAL_URL`). Client-side code — the RSS Client page and the
footer's `ServerStatus` — cannot resolve that name, so it derives the API's address from
`window.location.hostname` instead (`frontend/lib/apiConfig.ts`). That also means the frontend
never needs rebuilding when the EC2 instance's public DNS changes between sessions.

## Running it

Docker runs on an **AWS EC2 instance**, following Labs 7a/7b. Local development instead runs the
`api` and `frontend` packages directly (see below) — Docker Desktop is installed locally too, and
`docker-compose up --build` has been verified to work there, but EC2 is still where it's meant to
run for submission. The EC2 security group must allow inbound **80** and **4080**.

```bash
# on the EC2 box, after connecting with the *.pem key via VSCode Remote-SSH
git clone https://github.com/dd2026TECH/cse5006-assessment2-rss-server.git
cd cse5006-assessment2-rss-server
docker-compose up --build
```

Then browse to `http://<ec2-public-address>/` for the UI,
`http://<ec2-public-address>:4080/` for the API's own documentation page, and
`http://<ec2-public-address>:4080/api/...` for the endpoints themselves.

The `api` container's `entrypoint.sh` waits for Postgres, runs `prisma migrate deploy`, then seeds
the database with Assessment 1's real content — a fresh volume comes up already populated.

### EC2 prerequisites (Lab 7a)

```bash
# Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc && nvm install --lts

# Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo yum install git -y
git config --global user.name "Xueting Denise Chin"
git config --global user.email "22663637@students.latrobe.edu.au"
```

## Local development

Two packages, each a standalone Next.js app.

```bash
# database (either works locally — Docker Desktop or a Postgres instance in WSL2)
# DATABASE_URL in api/.env must point at it; see api/.env.example

cd api
npm install
npx prisma migrate deploy
npm run db:seed
PORT=4080 npm run start      # http://localhost:4080

cd ../frontend
npm install
npm run dev                  # http://localhost:3000
npm run lint
npm test                     # production build + Playwright suite (needs the api above running)
```

**Prisma 7 note:** the runtime client requires a driver adapter (`@prisma/adapter-pg`), and CLI
commands read `DATABASE_URL` from `prisma.config.ts`, not from an auto-loaded `.env` — the schema
file itself carries no `url`. Both are set up already; see `api/SCHEMA_RATIONALE.md` for why.

## API endpoints

Every response uses the same envelope: `{ data, error }`, with `error: null` on success.

| Method | Path | Purpose |
|---|---|---|
| `GET` `POST` | `/api/feeds` | List / create feeds. `?id=`, `?withPosts=true` |
| `PATCH` `DELETE` | `/api/feeds?id=` | Update / delete one feed (delete cascades to its posts) |
| `GET` `POST` | `/api/posts` | List / create posts. `?id=`, `?slug=`, `?feedId=` |
| `PATCH` `DELETE` | `/api/posts?id=` | Update / delete one post |
| `GET` `POST` | `/api/authors` | List / create authors. `?id=` |
| `PATCH` `DELETE` | `/api/authors?id=` | Update / delete one author (fails if they still have posts) |
| `GET` | `/api/feeds/rss.xml?slug=` | A feed republished as real RSS 2.0 |
| `GET` | `/api/health` | Healthcheck — a real query against Postgres |
| `GET` | `/api/count` | Number of client requests served, read from `RequestLog` |
| `GET` | `/api/stats` | Content and usage statistics |

Full descriptions and runnable curl / PowerShell commands for every endpoint are on the API's own
root page (`http://localhost:4080/` locally, or `:4080` on EC2) — it derives the correct base URL
from the request itself, so the commands it shows always work as written.

## Frontend pages added or changed in Assessment 2

- **`/feeds`** and **`/feeds/[slug]`** — read live from the database via `getPosts()` /
  `getPostBySlug()` in `frontend/lib/posts.ts`, instead of a hardcoded array. Loading state via
  `Suspense`; error state via `frontend/app/feeds/error.tsx` if the API is unreachable. Every post's
  own page (`/feeds/[slug]`) has **Edit** and **Delete** buttons (`PostDetail.tsx`) — editing swaps
  in `PostForm.tsx`, which `PATCH`es `/api/posts?id=` directly; delete confirms then `DELETE`s and
  returns to `/feeds`. Visible to everyone — there is no login system, so a fake "admin only" gate
  would be dishonest UI.
- **`/feeds/new`** — publishes a brand-new post (`PostForm.tsx` in create mode): picks an existing
  feed/author from a dropdown, or "+ Add new…" to create one inline first. `POST`s to `/api/posts`
  (and `/api/feeds` / `/api/authors` first, if a new one was created) and lands on the new post's
  page.
- **`/rss-client`** — fetches a feed's RSS 2.0 document over HTTP and renders it, the way a real
  reader would. Shows the feed URL on screen and a raw-XML toggle.
- **Footer** — a live status line (`ServerStatus`) explicitly naming both operational endpoints:
  `/api/health: {latency}ms · /api/count: {n} requests`.

There is no longer a separate `/admin` page — it only ever managed feed metadata (name/url/
description), not the actual content. Feed/author CRUD still exists at the API level
(`/api/feeds`, `/api/authors`), it's just reached through the "+ Add new…" flow above instead of a
standalone admin panel.

## Testing

```bash
cd frontend && npx playwright test
```

16 tests: Assessment 1's original 13 (still passing against API-backed data) plus 3 driving the
RSS Client against the live server. Requires the `api` package running on `:4080`.

## Status

- [x] Assessment 1 frontend brought across with full history, restructured into `frontend/`
- [x] `api/` package — Prisma 7 + Postgres schema, migrations, seed (verified against real
      Postgres: 2 feeds, 1 author, 11 posts, 10 citations)
- [x] CRUD routes for feeds, posts and authors — verified live (full create→read→update→delete
      round trip, correct status codes, CORS preflight)
- [x] Operational endpoints (`/api/health`, `/api/count`, `/api/stats`) — verified live
- [x] API documentation page at the api package's root, with runnable curl/PowerShell commands
- [x] Frontend wired to the API — `getPosts()`/`getPostBySlug()` read the database; 16/16
      Playwright tests pass
- [x] RSS Client page — fetches and renders real RSS 2.0; validated with a real XML parser
- [x] Dockerfiles and `docker-compose.yml`, per the Module 7 lab structure — running on EC2
- [x] Full post CRUD (Create/Update/Delete) reachable from the UI on `/feeds/[slug]` and
      `/feeds/new`, not just the API — verified live end to end on EC2
