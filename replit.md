# Rizz — Social App

A full-stack social media app with posts, DMs, stories, reels, servers, and real-time notifications.

## Project Structure

```
frontend/   → React + Vite app → deploy to Netlify
backend/    → Express API server → deploy to Render
```

## Run & Operate (Replit)

- `frontend` workflow — runs the Vite dev server
- `backend` workflow — runs the Express API server

## Deploying to GitHub → Netlify + Render

### 1. Connect GitHub to Replit
- Go to Replit → Version Control → Connect to GitHub repo
- Push changes: all commits auto-sync

### 2. Deploy Backend to Render

**Option A — Blueprint (recommended, uses render.yaml)**
- On render.com → New → Blueprint → connect your GitHub repo
- Render auto-reads `render.yaml` and configures the service with `rootDir: backend`

**Option B — Manual Web Service**
- New → Web Service → connect GitHub repo
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables to set on Render:**
- `DATABASE_URL` — your PostgreSQL connection string
- `SESSION_SECRET` — a long random string
- `NODE_ENV=production`
- `FRONTEND_URL` — your Netlify site URL (e.g. `https://yoursite.netlify.app`) — set this AFTER deploying Netlify
- Optional: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`

**After first deploy:** Run DB migrations in Render Shell → `npm run db:push`

### 3. Deploy Frontend to Netlify

Netlify auto-reads `netlify.toml` at the repo root which sets `base = "frontend"`.

- New Site → Import from GitHub → select your repo
- Netlify reads `netlify.toml` automatically — no manual settings needed
- **Add one Environment Variable in Netlify:**
  - `VITE_API_URL` = your Render backend URL (e.g. `https://rizdgb.onrender.com`)

### 4. Wire them together
1. Copy your Netlify URL (e.g. `https://yoursite.netlify.app`)
2. Go to Render → Environment → set `FRONTEND_URL` = your Netlify URL
3. Render redeploys automatically — CORS is now locked to your Netlify domain

## Stack

- Frontend: React 18, Vite, TailwindCSS, TanStack Query, Wouter
- Backend: Node.js 24, Express 5, Drizzle ORM, PostgreSQL
- Auth: Session-based (express-session + bcrypt)
- Real-time: SSE (Server-Sent Events)
- Push: Web Push (VAPID)

## Where things live

- `frontend/src/lib/api-client.ts` — all API hooks and types
- `frontend/src/hooks/use-auth.ts` — auth state
- `backend/src/schema.ts` — database schema (source of truth)
- `backend/src/routes/` — all API route handlers
- `backend/drizzle.config.ts` — Drizzle ORM config

## Gotchas

- After changing DB schema, run `npm run db:push` in the backend shell on Render
- The frontend uses `VITE_API_URL` env var for the backend URL in production
- In dev, Vite proxies `/api` to `localhost:3000`
- Session cookies use `sameSite: "none"` + `secure: true` in production — both frontend and backend must be on HTTPS
- CORS: set `FRONTEND_URL` on Render to your Netlify domain — without it, all origins are allowed (less secure)

## User preferences

- Deploy frontend to Netlify, backend to Render
- Connect GitHub to Replit for pushing changes
