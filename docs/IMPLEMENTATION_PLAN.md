# Signalmind Implementation Plan

Signalmind is a personal AI intelligence system. The first production target is a low-cost deployment with Next.js, Supabase Postgres/pgvector, GitHub Actions, and optional paid AI APIs for summarization and embeddings.

## Phase 1: Product Shell

- Next.js App Router dashboard
- Source map
- Daily summary archive
- Tool catalog
- Semantic search screen
- Supabase schema and environment template

## Phase 2: Data Ingest

- Seed 30-50 curated sources
- Store the source seed in `supabase/seed_sources.sql`
- RSS ingestion with duplicate detection
- Store source metadata and canonical URLs
- Extract clean article text where available
- Persist raw excerpt and cleaned text

## Phase 3: AI Processing

- Classify topic and tags
- Score relevance
- Generate Czech summaries
- Extract mentioned tools
- Generate embeddings for article chunks

Current first-pass command:

- `npm run ai:process -- --limit=5`
- `npm run embeddings:process -- --limit=10`
- `npm run summary:generate -- --limit=12`

The initial AI pass uses Anthropic Messages API with `claude-haiku-4-5-20251001` by default. It writes Czech summaries into `item_summaries`, updates `items.score`, updates `items.topic`, marks processed items as `summarized`, and stores generated tags.

The second migration adds `item_summaries.title_cs` so the UI can display Czech article titles while retaining the original source title in `items.title`.

The third migration updates `match_item_chunks` for public semantic search. Embeddings use `text-embedding-3-small` by default and are stored in `item_chunks.embedding` as 1536-dimensional vectors.

The fourth migration adds vector-based related article lookup for article detail pages.

## Phase 4: Retrieval

- Hybrid search: SQL filters plus vector similarity
- Related articles on detail pages
- Saved searches for medicine, education, tools, and policy
- Daily summary generation from top-scored items

## Phase 5: Deployment

- Vercel Hobby for the Next.js app
- Supabase Free for Postgres/pgvector while the dataset is small
- GitHub Actions scheduled workflow for morning updates
- Hard limits for AI processing cost

Current automation:

- `.github/workflows/daily-update.yml`
- `.github/workflows/backfill.yml`
- Daily schedule: `05:30 UTC`
- Defaults: `RSS_LIMIT=10`, `AI_LIMIT=5`, `EMBEDDING_LIMIT=10`
- Anthropic request timeout: `AI_REQUEST_TIMEOUT_MS=45000`
- Embedding request timeout: `EMBEDDING_REQUEST_TIMEOUT_MS=45000`

## Initial Source Groups

- Primary labs: OpenAI, Anthropic, Google DeepMind, Google AI, Meta AI, Microsoft Research, Hugging Face, Mistral, Cohere, NVIDIA
- Research: arXiv cs.AI/cs.CL/cs.LG/stat.ML, Semantic Scholar, BAIR, MIT CSAIL, Ai2, Stanford HAI, Epoch AI, METR
- Medicine: FDA AI-enabled devices, NEJM AI, Lancet Digital Health, Nature Medicine, JAMA Network Open, Stanford Medicine
- Education: EDUCAUSE, EdSurge, Digital Promise, Common Sense Education, OECD, UNESCO
- Experts: Simon Willison, Sebastian Raschka, Andrej Karpathy, Lilian Weng, Chip Huyen, Eugene Yan, Jay Alammar, Import AI, The Batch, Latent Space
