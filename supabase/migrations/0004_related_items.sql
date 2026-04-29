create or replace function public.match_related_item_chunks(
  source_item_id uuid,
  match_count integer default 6
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
  with source_chunk as (
    select embedding
    from public.item_chunks
    where item_id = source_item_id
      and embedding is not null
    order by chunk_index asc
    limit 1
  )
  select
    items.id as item_id,
    item_chunks.id as chunk_id,
    items.title,
    items.canonical_url,
    item_chunks.content,
    1 - (item_chunks.embedding <=> source_chunk.embedding) as similarity
  from source_chunk
  join public.item_chunks on item_chunks.embedding is not null
  join public.items on items.id = item_chunks.item_id
  where items.id <> source_item_id
    and items.status <> 'hidden'
  order by item_chunks.embedding <=> source_chunk.embedding
  limit greatest(1, least(coalesce(match_count, 6), 20));
$$;

grant execute on function public.match_related_item_chunks(uuid, integer)
  to anon, authenticated, service_role;
