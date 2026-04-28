create extension if not exists vector with schema extensions;

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  homepage_url text not null,
  feed_url text,
  tier text not null check (tier in ('primary', 'research', 'expert', 'sector', 'tools')),
  topic text not null,
  cadence text,
  trust_score integer not null default 75 check (trust_score between 0 and 100),
  status text not null default 'active' check (status in ('active', 'review', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  external_id text,
  title text not null,
  canonical_url text not null unique,
  author text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  topic text,
  score integer not null default 0 check (score between 0 and 100),
  language text not null default 'en',
  raw_excerpt text,
  clean_text text,
  status text not null default 'new' check (status in ('new', 'summarized', 'archived', 'hidden')),
  created_at timestamptz not null default now()
);

create table public.item_summaries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  summary_short_cs text not null,
  summary_long_cs text,
  why_it_matters_cs text,
  key_points_cs text[] not null default '{}',
  model_name text,
  created_at timestamptz not null default now()
);

create table public.item_chunks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  unique (item_id, chunk_index)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  homepage_url text not null unique,
  category text not null,
  pricing text not null default 'Unknown',
  summary_cs text,
  use_case_cs text,
  signal_score integer not null default 0 check (signal_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_digests (
  id uuid primary key default gen_random_uuid(),
  digest_date date not null unique,
  title_cs text not null,
  focus_cs text,
  body_cs text not null,
  created_at timestamptz not null default now()
);

create index sources_topic_idx on public.sources(topic);
create index items_published_at_idx on public.items(published_at desc);
create index items_topic_score_idx on public.items(topic, score desc);
create index item_chunks_embedding_idx on public.item_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_item_chunks(
  query_embedding extensions.vector(1536),
  match_count integer default 10
)
returns table (
  item_id uuid,
  chunk_id uuid,
  title text,
  canonical_url text,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    items.id as item_id,
    item_chunks.id as chunk_id,
    items.title,
    items.canonical_url,
    item_chunks.content,
    1 - (item_chunks.embedding <=> query_embedding) as similarity
  from public.item_chunks
  join public.items on items.id = item_chunks.item_id
  where item_chunks.embedding is not null
  order by item_chunks.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.sources enable row level security;
alter table public.items enable row level security;
alter table public.item_summaries enable row level security;
alter table public.item_chunks enable row level security;
alter table public.tags enable row level security;
alter table public.item_tags enable row level security;
alter table public.tools enable row level security;
alter table public.daily_digests enable row level security;

create policy "Public sources are readable" on public.sources
  for select using (true);

create policy "Public items are readable" on public.items
  for select using (status <> 'hidden');

create policy "Public summaries are readable" on public.item_summaries
  for select using (true);

create policy "Public tools are readable" on public.tools
  for select using (true);

create policy "Public digests are readable" on public.daily_digests
  for select using (true);
