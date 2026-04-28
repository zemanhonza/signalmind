# Signalmind

Signalmind is a Next.js application for monitoring important AI developments across medicine, education, research, policy, and practical tools.

The app currently contains a working dashboard shell with demo data and a Supabase-ready schema. The next step is wiring the ingest pipeline to real curated sources.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Useful scripts:

- `npm run dev` starts the local app.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript checks.
- `npm run build` creates a production build.

## Configuration

Copy `.env.example` to `.env.local` and add Supabase credentials when the database is ready.

The initial database schema is in `supabase/migrations/0001_initial_schema.sql`.
The initial curated source list is in `supabase/seed_sources.sql`.

## Plan

See `docs/IMPLEMENTATION_PLAN.md`.

## Deployment

The intended low-cost setup is Vercel Hobby for the frontend, Supabase Free for Postgres/pgvector, and GitHub Actions for scheduled ingest jobs.
