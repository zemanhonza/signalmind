create index if not exists item_chunks_item_id_idx on public.item_chunks(item_id);

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
security definer
set search_path = public, extensions
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
    and items.status <> 'hidden'
  order by item_chunks.embedding <=> query_embedding
  limit greatest(1, least(coalesce(match_count, 10), 50));
$$;

grant execute on function public.match_item_chunks(extensions.vector, integer)
  to anon, authenticated, service_role;
