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

Two Next.js packages plus a database volume, following the Module 7 lab's split:

```
.
├── frontend/           Next.js UI (the Assessment 1 app, extended)
├── api/                Next.js API only — route handlers + Sequelize
└── docker-compose.yml  frontend · api · sqlite volume holder
```

| Service | Role | Tech | Port (host:container) |
|---|---|---|---|
| `frontend` | UI only | Next.js | `80:3000` |
| `api` | REST API only | Next.js + Sequelize | `4080:3000` |
| `sqlite` | Data volume holder | Alpine + shared volume | — |

Inside the Docker network the frontend reaches the API by service name (`http://api:3000`).
From outside, the API is on port `4080` of the EC2 instance's public address.

## Running it

Docker runs on an **AWS EC2 instance**, following Labs 7a/7b — not on a local Windows machine.

```bash
# on the EC2 box, after connecting with the *.pem key via VSCode Remote-SSH
git clone https://github.com/dd2026TECH/cse5006-assessment2-rss-server.git
cd cse5006-assessment2-rss-server
docker-compose up --build
```

Then browse to `http://<ec2-public-address>/` for the UI and
`http://<ec2-public-address>:4080/api/...` for the API.

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

## Local development (frontend only)

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run lint
npm test         # production build + Playwright suite
```

## API endpoints

Documented as they are built. Planned surface:

| Method | Path | Purpose |
|---|---|---|
| `GET` `POST` | `/api/feeds` | List / create RSS feeds |
| `GET` `PATCH` `DELETE` | `/api/feeds?id=` | Read / update / delete one feed |
| `GET` `POST` | `/api/posts` | List / create posts |
| `GET` `PATCH` `DELETE` | `/api/posts?id=` | Read / update / delete one post |
| `GET` | `/api/feeds/rss.xml?id=` | Feed republished as RSS 2.0 |
| `GET` | `/api/health` | Healthcheck — database ping |
| `GET` | `/api/count` | Number of client requests served |
| `GET` | `/api/stats` | Feed and usage statistics |

## Status

- [x] Assessment 1 frontend brought across with full history, restructured into `frontend/`
- [ ] `api/` package — Sequelize models, migrations, CRUD routes
- [ ] Operational endpoints (`/api/health`, `/api/count`, `/api/stats`)
- [ ] Frontend wired to the API
- [ ] RSS Client page
- [ ] Dockerfiles and `docker-compose.yml` verified on EC2
