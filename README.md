# Signalmind

Signalmind is a Next.js application for monitoring important AI developments across medicine, education, research, policy, and practical tools.

The app contains a public dashboard, article archive, source map, AI processing overview, searchable news flow, and a filterable tool catalog backed by Supabase.

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
- `npm run ingest:rss -- --limit=10` loads recent RSS items from active sources.
- `npm run ingest:rss -- --limit=20 --items-per-source=20` runs a larger RSS backfill.
- `npm run ai:process -- --limit=5` summarizes and scores new items with Anthropic.
- `npm run ai:process -- --status=summarized --limit=3` refreshes already summarized items.
- `npm run embeddings:process -- --limit=10` stores pgvector embeddings for summarized items.
- `npm run seed:tools` fills the Supabase tool catalog with curated AI tools.

## Configuration

Copy `.env.example` to `.env.local` and add Supabase credentials when the database is ready.

The initial database schema is in `supabase/migrations/0001_initial_schema.sql`.
The initial curated source list is in `supabase/seed_sources.sql`.
Vector search updates are in `supabase/migrations/0003_vector_search.sql`.

## Plan

See `docs/IMPLEMENTATION_PLAN.md`.

## Deployment

The intended low-cost setup is Vercel Hobby for the frontend, Supabase Free for Postgres/pgvector, and GitHub Actions for scheduled ingest jobs.

See `docs/DEPLOYMENT.md`.
