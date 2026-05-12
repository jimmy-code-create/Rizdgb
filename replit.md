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
- Create a new **Web Service** on render.com
- Point to your GitHub repo, **Root Directory**: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables (set in Render dashboard):
  - `DATABASE_URL` — your PostgreSQL connection string
  - `SESSION_SECRET` — a long random string
  - `NODE_ENV=production`
  - `PORT=3000` (Render sets this automatically)
  - Optional: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
- Run DB migrations: `npm run db:push` (in Render shell or one-off job)

### 3. Deploy Frontend to Netlify
- Create a **New Site** on netlify.com from GitHub
- **Base directory**: `frontend`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `frontend/dist`
- Environment Variables (set in Netlify):
  - `VITE_API_URL` — your Render backend URL (e.g. `https://rizz-api.onrender.com`)

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

## User preferences

- Deploy frontend to Netlify, backend to Render
- Connect GitHub to Replit for pushing changes

## Gotchas

- After changing DB schema, run `npm run db:push` in the backend
- The frontend uses `VITE_API_URL` env var for the backend URL in production
- In dev, Vite proxies `/api` to `localhost:3000`
- Session cookies use `sameSite: "none"` + `secure: true` in production — both frontend and backend must be on HTTPS
