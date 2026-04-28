# Signalmind Implementation Plan

Signalmind is a personal AI intelligence system. The first production target is a low-cost deployment with Next.js, Supabase Postgres/pgvector, GitHub Actions, and optional paid AI APIs for summarization and embeddings.

## Phase 1: Product Shell

- Next.js App Router dashboard
- Source map
- Daily digest archive
- Tool catalog
- Semantic search screen
- Supabase schema and environment template

## Phase 2: Data Ingest

- Seed 30-50 curated sources
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

## Phase 4: Retrieval

- Hybrid search: SQL filters plus vector similarity
- Related articles on detail pages
- Saved searches for medicine, education, tools, and policy
- Digest generation from top-scored items

## Phase 5: Deployment

- Vercel Hobby for the Next.js app
- Supabase Free for Postgres/pgvector while the dataset is small
- GitHub Actions scheduled workflow for morning updates
- Hard limits for AI processing cost

## Initial Source Groups

- Primary labs: OpenAI, Anthropic, Google DeepMind, Google AI, Meta AI, Microsoft Research, Hugging Face, Mistral, Cohere, NVIDIA
- Research: arXiv cs.AI/cs.CL/cs.LG/stat.ML, Semantic Scholar, BAIR, MIT CSAIL, Ai2, Stanford HAI, Epoch AI, METR
- Medicine: FDA AI-enabled devices, NEJM AI, Lancet Digital Health, Nature Medicine, JAMA Network Open, Stanford Medicine
- Education: EDUCAUSE, EdSurge, Digital Promise, Common Sense Education, OECD, UNESCO
- Experts: Simon Willison, Sebastian Raschka, Andrej Karpathy, Lilian Weng, Chip Huyen, Eugene Yan, Jay Alammar, Import AI, The Batch, Latent Space
