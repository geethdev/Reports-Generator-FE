# Weekly Report Generator & Team Dashboard — Frontend

Next.js frontend for the Weekly Report Generator & Team Dashboard. Built as a Turborepo monorepo with shadcn/ui components.

The backend API lives in a separate repository: `assessment-backend`. Both are needed to run the app — see the full walkthrough below.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS + shadcn/ui (`packages/ui`)
- Recharts for the manager dashboard charts

## 1. Installing dependencies

This repo:

```bash
git clone <this-repo-url> assessment-frontend
cd assessment-frontend
npm install
```

The backend (separate repo):

```bash
git clone <backend-repo-url> assessment-backend
cd assessment-backend
npm install
```

Both use plain `npm` — no other package manager needed.

## 2. Running the database

The app uses MongoDB. Easiest path is a free MongoDB Atlas cluster:

1. Create a free account/cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — needed since most local/dev networks and deploy platforms don't have a fixed IP.
4. From **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Append a database name before the `?`, e.g. `.../weekly-report-app?retryWrites=true...` — this is the `MONGO_URI` used by the backend in step 3.

(A local `mongod` instance also works — just point `MONGO_URI` at `mongodb://localhost:27017/weekly-report-app` instead.)

## 3. Running the backend

In the `assessment-backend` folder:

```bash
cp .env.example .env
# edit .env: set MONGO_URI (from step 2) and JWT_SECRET (any random string)
npm run seed   # populates demo data — 1 manager, 4 team members, 3 projects, 12 reports
npm run dev    # starts the API on http://localhost:5000
```

Verify it's up: `curl http://localhost:5000/api/health` → `{"status":"ok"}`.

See `assessment-backend/README.md` for the full API reference and design notes.

## 4. Running the frontend

Back in this repo:

```bash
cp apps/web/.env.local.example apps/web/.env.local
# defaults to http://localhost:5000/api — matches the backend's default port
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

### Demo accounts (from the backend's seed data)

| Role | Email | Password |
|---|---|---|
| Manager | `manager@example.com` | `password123` |
| Team member | `alice@example.com` (or `bob`/`carol`/`dave`@example.com) | `password123` |

## Project structure

```
apps/web/            The Next.js app
  app/                Routes (login, register, reports/*, manager/*)
  components/         Shared page-level components (ReportForm, ReportView, layouts)
  lib/                API client, auth context, shared types
packages/ui/          Shared shadcn/ui component library (@workspace/ui)
```

## Notes

- If port `3000` is already in use by another project, run `npm run dev -- -p 3001` from `apps/web` and update the backend's `CLIENT_ORIGIN` env var to include `http://localhost:3001` (comma-separated).
- Frontend and backend currently live in separate repos. See `assessment-backend/README.md` for backend-specific deployment notes (Render/Railway + Vercel + Atlas).
