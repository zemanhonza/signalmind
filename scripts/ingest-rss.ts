import "./load-env";

import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";

type SourceRow = {
  id: string;
  slug: string;
  name: string;
  feed_url: string | null;
  topic: string | null;
  status: string;
};

type ItemInsert = {
  source_id: string;
  external_id: string | null;
  title: string;
  canonical_url: string;
  author: string | null;
  published_at: string | null;
  topic: string | null;
  language: string;
  raw_excerpt: string | null;
  status: "new";
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
}

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const sourceLimit = limitArg ? Number(limitArg.split("=")[1]) : 10;
const itemsPerSourceArg = process.argv.find((arg) =>
  arg.startsWith("--items-per-source="),
);
const itemsPerSource = itemsPerSourceArg
  ? Number(itemsPerSourceArg.split("=")[1])
  : Number(process.env.RSS_ITEMS_PER_SOURCE || 20);
const configuredTimeoutMs = Number(process.env.RSS_FETCH_TIMEOUT_MS);
const fetchTimeoutMs =
  Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
    ? configuredTimeoutMs
    : 15000;

const parser = new Parser({
  headers: {
    "user-agent": "Signalmind RSS ingest/0.1",
  },
  timeout: fetchTimeoutMs,
});

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const withoutTags = value.replace(/<[^>]*>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim() || null;
}

function normalizeUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function getPublishedAt(item: Parser.Item) {
  const rawDate = item.isoDate ?? item.pubDate;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function optionalString(item: Parser.Item, key: string) {
  const value = (item as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

async function loadSources() {
  const { data, error } = await supabase
    .from("sources")
    .select("id, slug, name, feed_url, topic, status")
    .eq("status", "active")
    .not("feed_url", "is", null)
    .order("trust_score", { ascending: false })
    .limit(sourceLimit);

  if (error) throw error;
  return (data ?? []) as SourceRow[];
}

function toInsert(source: SourceRow, item: Parser.Item): ItemInsert | null {
  const canonicalUrl = normalizeUrl(item.link ?? item.guid);
  const title = cleanText(item.title);

  if (!canonicalUrl || !title) {
    return null;
  }

  return {
    source_id: source.id,
    external_id: item.guid ?? canonicalUrl,
    title,
    canonical_url: canonicalUrl,
    author: cleanText(item.creator ?? optionalString(item, "author")),
    published_at: getPublishedAt(item),
    topic: source.topic,
    language: "en",
    raw_excerpt: cleanText(item.contentSnippet ?? item.content ?? item.summary),
    status: "new",
  };
}

async function ingestSource(source: SourceRow) {
  if (!source.feed_url) return { source: source.slug, fetched: 0, inserted: 0 };

  const feed = await parser.parseURL(source.feed_url);
  const rows = feed.items
    .slice(0, itemsPerSource)
    .map((item) => toInsert(source, item))
    .filter((row): row is ItemInsert => Boolean(row));

  if (rows.length === 0) {
    return { source: source.slug, fetched: feed.items.length, inserted: 0 };
  }

  const { data, error } = await supabase
    .from("items")
    .upsert(rows, { onConflict: "canonical_url", ignoreDuplicates: true })
    .select("id");

  if (error) {
    throw new Error(`${source.slug}: ${error.message}`);
  }

  return {
    source: source.slug,
    fetched: feed.items.length,
    inserted: data?.length ?? 0,
  };
}

async function main() {
  if (!Number.isFinite(sourceLimit) || sourceLimit <= 0) {
    console.log("RSS source limit is 0; skipping.");
    return;
  }

  const startedAt = Date.now();
  const sources = await loadSources();
  console.log(
    `Loaded ${sources.length} RSS sources; max ${itemsPerSource} items/source; timeout ${fetchTimeoutMs}ms.`,
  );

  let insertedTotal = 0;

  for (const source of sources) {
    try {
      const result = await ingestSource(source);
      insertedTotal += result.inserted;
      console.log(
        `${result.source}: fetched ${result.fetched}, inserted ${result.inserted}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${source.slug}: skipped (${message})`);
    }
  }

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(`Inserted ${insertedTotal} new items in ${elapsedSeconds}s.`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
