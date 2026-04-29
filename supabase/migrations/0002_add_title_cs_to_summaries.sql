alter table public.item_summaries
  add column if not exists title_cs text;

create index if not exists item_summaries_item_created_idx
  on public.item_summaries(item_id, created_at desc);
