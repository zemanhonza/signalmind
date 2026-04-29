# Deployment

The low-cost production setup is:

- Vercel Hobby for the Next.js application
- Supabase Free for Postgres and pgvector
- GitHub Actions for scheduled ingest and AI processing

## GitHub Secrets

Add these in GitHub:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

Optional variables:

`Settings` -> `Secrets and variables` -> `Actions` -> `Variables`

- `ANTHROPIC_MODEL`: defaults to `claude-haiku-4-5-20251001` in the script
- `EMBEDDING_MODEL`: defaults to `text-embedding-3-small`
- `RSS_LIMIT`: default workflow value is `10`
- `AI_LIMIT`: default workflow value is `5`
- `EMBEDDING_LIMIT`: default workflow value is `10`
- `AI_REQUEST_TIMEOUT_MS`: default script value is `45000`
- `EMBEDDING_REQUEST_TIMEOUT_MS`: default script value is `45000`

## Daily Automation

The workflow is in `.github/workflows/daily-update.yml`.

It runs every day at `05:30 UTC`, which is `07:30` in Prague during summer time and `06:30` during winter time.

You can also run it manually:

`Actions` -> `Daily Signalmind Update` -> `Run workflow`

For a first manual run, use small limits such as `rss_limit=5` and `ai_limit=3`. Larger backfills can be run later once the workflow is stable.

If the UI is deployed before a database migration, run the pending SQL migration in Supabase first and then redeploy or rerun the workflow.

## Vercel

Import the GitHub repository into Vercel:

`Add New` -> `Project` -> select `zemanhonza/signalmind`

Use the default Next.js settings.

Add these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

Do not add `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` to Vercel unless a server-side feature needs them later. Semantic search needs `OPENAI_API_KEY` on Vercel, but it is server-side only and must not use the `NEXT_PUBLIC_` prefix.

## Vector Search

Run `supabase/migrations/0003_vector_search.sql` in Supabase SQL editor before enabling public semantic search. It updates the `match_item_chunks` RPC function so the app can search embeddings without exposing direct table write access.

After adding `OPENAI_API_KEY`, generate embeddings manually with:

```bash
npm run embeddings:process -- --limit=20
```

The daily GitHub workflow also runs this step after AI summarization when `OPENAI_API_KEY` is configured.

After the first deploy, Vercel will show a production URL. If the project name is available, it is usually:

`https://signalmind.vercel.app`

If that URL is already taken, Vercel will assign a different project URL. You can then attach a custom domain in Vercel project settings.
