# DISCIPLINE — No Excuses Task System

A brutal accountability app. Add tasks with hard deadlines. Get scored on whether you did them — and how late you were. No extensions. No mercy.

---

## Stack

- **Frontend + API**: Next.js 14 (App Router)
- **Database**: SQLite (local) → PostgreSQL (production via Supabase/Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Deploy**: Vercel (frontend + API) + Supabase/Neon (database)

---

## 1. Local Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install

```bash
git clone https://github.com/YOUR_USERNAME/disciplineapp.git
cd disciplineapp
npm install
```

### Set up environment

```bash
cp .env.example .env
# .env already has: DATABASE_URL="file:./dev.db"
```

### Initialize database

```bash
npx prisma db push        # creates the SQLite DB and tables
npx prisma generate       # generates the Prisma client
```

### (Optional) Seed with sample tasks

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 2. Scoring System

| Grade | Condition | Points |
|-------|-----------|--------|
| S | Finished ≥25% before deadline | +120 |
| A | Finished on time | +100 |
| B | < 1 hour late | +75 |
| C | 1–24 hours late | +25–50 |
| F | > 24 hours late | +10 |
| X | Gave up / marked failed | −20 |
| — | Deleted task | −30 |
| — | Abandoned task | −30 |

---

## 3. Deploy to Vercel + Production Database

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: DISCIPLINE app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/disciplineapp.git
git push -u origin main
```

### Step 2 — Create a production database

**Option A: Supabase (free tier)**
1. Go to [supabase.com](https://supabase.com) → New project
2. Go to Project Settings → Database → Connection string (URI mode)
3. Copy the connection string — looks like:
   `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

**Option B: Neon (free tier)**
1. Go to [neon.tech](https://neon.tech) → New project
2. Copy the connection string from the dashboard

**Option C: Railway**
1. Go to [railway.app](https://railway.app) → New project → PostgreSQL
2. Copy `DATABASE_URL` from the Variables tab

### Step 3 — Update Prisma schema for PostgreSQL

In `prisma/schema.prisma`, change the datasource:

```prisma
datasource db {
  provider = "postgresql"   # ← change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Commit this change:

```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

### Step 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. In **Environment Variables**, add:
   ```
   DATABASE_URL = postgresql://...your-production-url...
   ```
4. In **Build & Output Settings**, set the build command to:
   ```
   prisma generate && prisma db push && next build
   ```
   Or add this to your `package.json` scripts as `"build"` (already done).

5. Click **Deploy**

Vercel will automatically run `prisma db push` on every deploy, keeping your schema in sync.

### Step 5 — Verify

Visit your Vercel URL. The app should be live and connected to your production database.

---

## 4. Local Development with Production DB (optional)

If you want to develop against the production database locally:

```bash
# In .env.local (gitignored):
DATABASE_URL="postgresql://your-production-url"
```

---

## 5. Project Structure

```
disciplineapp/
├── prisma/
│   ├── schema.prisma          # DB schema
│   └── seed.ts                # Sample data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts       # GET all, POST new task
│   │   │   │   └── [id]/route.ts  # PATCH (start/complete/fail), DELETE
│   │   │   └── stats/route.ts     # GET stats
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main dashboard
│   ├── components/
│   │   ├── AddTaskModal.tsx   # Task creation form
│   │   ├── GuiltTicker.tsx    # Rotating guilt messages
│   │   ├── ScoreBoard.tsx     # Stats sidebar
│   │   └── TaskCard.tsx       # Individual task card
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── scoring.ts         # Scoring logic
│       └── types.ts           # TypeScript types
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 6. API Reference

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create task `{ title, description?, deadline }` |
| `PATCH` | `/api/tasks/:id` | Action: `{ action: "start" \| "complete" \| "fail" \| "abandon" }` |
| `DELETE` | `/api/tasks/:id` | Delete task (−30 pts penalty) |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get global stats |

---

## 7. Environment Variables Reference

| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | `file:./dev.db` | PostgreSQL connection string |

---

## License

MIT. Use it. Abuse yourself productively.
