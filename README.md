# HIT Training App

Arthur Jones–style High Intensity Training logger. Mobile-first web app.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## Quick Start

### 1. Start Postgres
```bash
docker compose up -d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run migrations + seed data
```bash
npm run db:migrate
npm run db:seed
```
Seeds 15 muscle groups, ~35 HIT machines, and a default "Full Body — Jones Protocol" routine.

### 4. Start dev servers
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Deployment (Railway / Fly.io)
1. Provision a Postgres database and copy the `DATABASE_URL`.
2. Set env vars: `DATABASE_URL`, `NODE_ENV=production`, `CLIENT_URL=<your-frontend-url>`.
3. Build the client: `npm run build` (outputs to `client/dist`).
4. Serve static assets from Express or a CDN, then deploy the server.

## Workout Flow
1. **Home** — select a routine → tap "Start Workout".
2. **Slots** — all muscle groups listed in order; progress bar shows completion.
3. **Machine Selector** — all machines for that muscle group, each with last-session stats. Last-used machine is highlighted and sorted first.
4. **Set Logger** — progression card shows target (increase/hold/reduce). Built-in TUT stopwatch. Log weight, reps, seat settings, failure, RPE.
5. Auto-advances to next slot after each set.

## Progression Logic
| Last session | Suggestion |
|---|---|
| Reps ≥ rep_max | Add ~2.5% weight (rounded to nearest 2.5 lbs) |
| rep_min ≤ reps < rep_max | Same weight, aim for more reps |
| Reps < rep_min | Reduce 10% |

## Data Model
A routine slot holds a **muscle group**, not a specific machine. The machine is chosen at logging time — enabling the "swap on the fly" flow without breaking Jones-protocol continuity.
