import "./load-env";

import { createClient } from "@supabase/supabase-js";

import { createEmbeddings, embeddingModel } from "../src/lib/embeddings";

type SummaryRow = {
  title_cs?: string | null;
  summary_short_cs: string | null;
  summary_long_cs: string | null;
  why_it_matters_cs: string | null;
  key_points_cs: string[] | null;
  created_at: string;
};

type ItemRow = {
  id: string;
  title: string;
  canonical_url: string;
  raw_excerpt: string | null;
  clean_text: string | null;
  topic: string | null;
  published_at: string | null;
  status: string;
  sources: {
    name: string;
  } | null;
  item_summaries: SummaryRow[] | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const itemLimit = limitArg ? Number(limitArg.split("=")[1]) : 10;
const statusArg = process.argv.find((arg) => arg.startsWith("--status="));
const itemStatus = statusArg ? statusArg.split("=")[1] : "summarized";
const force = process.argv.includes("--force");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function latestSummary(summaries: SummaryRow[] | null) {
  return [...(summaries ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
}

function compact(value: string | null | undefined, maxLength: number) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function vectorLiteral(embedding: number[]) {
  return `[${embedding.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

function buildEmbeddingText(item: ItemRow) {
  const summary = latestSummary(item.item_summaries);
  const title = summary?.title_cs ?? item.title;
  const keyPoints = summary?.key_points_cs?.join(", ") ?? "";

  return [
    `Titulek: ${title}`,
    `Puvodni titulek: ${item.title}`,
    `Zdroj: ${item.sources?.name ?? "neznamy zdroj"}`,
    `Tema: ${item.topic ?? "nezarazeno"}`,
    `Datum: ${item.published_at ?? "bez data"}`,
    `Kratke shrnuti: ${summary?.summary_short_cs ?? ""}`,
    `Delsi shrnuti: ${summary?.summary_long_cs ?? ""}`,
    `Proc je to dulezite: ${summary?.why_it_matters_cs ?? ""}`,
    `Klicove body: ${keyPoints}`,
    `Excerpt: ${compact(item.raw_excerpt, 1800)}`,
    `Text: ${compact(item.clean_text, 2400)}`,
    `URL: ${item.canonical_url}`,
  ]
    .filter((line) => !line.endsWith(": "))
    .join("\n")
    .slice(0, 7000);
}

async function loadItems() {
  const { data, error } = await supabase
    .from("items")
    .select(
      "id, title, canonical_url, raw_excerpt, clean_text, topic, published_at, status, sources(name), item_summaries(title_cs, summary_short_cs, summary_long_cs, why_it_matters_cs, key_points_cs, created_at)",
    )
    .eq("status", itemStatus)
    .order("published_at", { ascending: false })
    .limit(Math.max(itemLimit * 4, itemLimit));

  if (error) throw error;
  return (data ?? []) as unknown as ItemRow[];
}

async function withoutExistingChunks(items: ItemRow[]) {
  if (force || items.length === 0) return items.slice(0, itemLimit);

  const { data, error } = await supabase
    .from("item_chunks")
    .select("item_id")
    .in(
      "item_id",
      items.map((item) => item.id),
    );

  if (error) throw error;

  const existing = new Set((data ?? []).map((row) => row.item_id as string));
  return items.filter((item) => !existing.has(item.id)).slice(0, itemLimit);
}

async function main() {
  const loaded = await loadItems();
  const items = await withoutExistingChunks(loaded);

  console.log(`Loaded ${loaded.length} ${itemStatus} items; embedding ${items.length}.`);

  if (items.length === 0) {
    console.log("No items need embeddings.");
    return;
  }

  const texts = items.map(buildEmbeddingText);
  const embeddings = await createEmbeddings(texts);

  const rows = items.map((item, index) => ({
    item_id: item.id,
    chunk_index: 0,
    content: texts[index],
    embedding: vectorLiteral(embeddings[index] ?? []),
  }));

  const { error } = await supabase.from("item_chunks").upsert(rows, {
    onConflict: "item_id,chunk_index",
  });

  if (error) throw error;

  console.log(`Stored ${rows.length} embeddings with ${embeddingModel()}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
