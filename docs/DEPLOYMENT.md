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

Optional variables:

`Settings` -> `Secrets and variables` -> `Actions` -> `Variables`

- `ANTHROPIC_MODEL`: defaults to `claude-haiku-4-5-20251001` in the script
- `RSS_LIMIT`: default workflow value is `15`
- `AI_LIMIT`: default workflow value is `8`

## Daily Automation

The workflow is in `.github/workflows/daily-update.yml`.

It runs every day at `05:30 UTC`, which is `07:30` in Prague during summer time and `06:30` during winter time.

You can also run it manually:

`Actions` -> `Daily Signalmind Update` -> `Run workflow`

## Vercel

Import the GitHub repository into Vercel:

`Add New` -> `Project` -> select `zemanhonza/signalmind`

Use the default Next.js settings.

Add these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do not add `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` to Vercel unless a server-side feature needs them later. The current public app only needs read access.

After the first deploy, Vercel will show a production URL. If the project name is available, it is usually:

`https://signalmind.vercel.app`

If that URL is already taken, Vercel will assign a different project URL. You can then attach a custom domain in Vercel project settings.
