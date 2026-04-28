import { createClient } from "@supabase/supabase-js";

import { digests as demoDigests, newsItems as demoNewsItems, sources as demoSources, tools as demoTools } from "./demo-data";
import type { Digest, NewsItem, Source, SourceStatus, SourceTier, ToolItem, Topic } from "./types";

type SourceRow = {
  id: string;
  slug: string;
  name: string;
  homepage_url: string;
  feed_url: string | null;
  tier: string;
  topic: string;
  cadence: string | null;
  trust_score: number;
  status: string;
};

type SummaryRow = {
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
  published_at: string | null;
  topic: string | null;
  score: number | null;
  raw_excerpt: string | null;
  status: string;
  sources: {
    name: string;
    homepage_url: string;
  } | null;
  item_summaries: SummaryRow[] | null;
};

type ToolRow = {
  id: string;
  name: string;
  homepage_url: string;
  category: string;
  pricing: string;
  summary_cs: string | null;
  use_case_cs: string | null;
  signal_score: number;
};

type DigestRow = {
  id: string;
  digest_date: string;
  title_cs: string;
  focus_cs: string | null;
  body_cs: string;
};

const topics: Topic[] = [
  "AI obecne",
  "Medicina",
  "Vzdelavani",
  "Vyzkum",
  "Nastroje",
  "Regulace",
  "Bezpecnost",
];

const sourceTiers: SourceTier[] = ["primary", "research", "expert", "sector", "tools"];
const sourceStatuses: SourceStatus[] = ["active", "review", "paused"];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

function normalizeTopic(value: string | null | undefined): Topic {
  if (value && topics.includes(value as Topic)) return value as Topic;
  return "AI obecne";
}

function normalizeTier(value: string): SourceTier {
  if (sourceTiers.includes(value as SourceTier)) return value as SourceTier;
  return "sector";
}

function normalizeStatus(value: string): SourceStatus {
  if (sourceStatuses.includes(value as SourceStatus)) return value as SourceStatus;
  return "review";
}

function formatDate(value: string | null) {
  if (!value) return "bez data";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min`;
}

function latestSummary(summaries: SummaryRow[] | null) {
  return [...(summaries ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
}

function sourceFromRow(row: SourceRow): Source {
  return {
    id: row.slug,
    name: row.name,
    url: row.homepage_url,
    tier: normalizeTier(row.tier),
    topic: normalizeTopic(row.topic),
    cadence: row.cadence ?? "unknown",
    trustScore: row.trust_score,
    status: normalizeStatus(row.status),
  };
}

function newsFromRow(row: ItemRow): NewsItem {
  const summary = latestSummary(row.item_summaries);
  const summaryText =
    summary?.summary_short_cs ??
    row.raw_excerpt ??
    "Zatim bez AI shrnuti. Polozka je nactena ze zdroje a ceka na zpracovani.";
  const whyItMatters =
    summary?.why_it_matters_cs ??
    "Dulezitost bude doplnena po AI zpracovani a rucni kontrole relevance.";

  return {
    id: row.id,
    title: row.title,
    url: row.canonical_url,
    source: row.sources?.name ?? "Neznamy zdroj",
    sourceUrl: row.sources?.homepage_url ?? row.canonical_url,
    publishedAt: formatDate(row.published_at),
    topic: normalizeTopic(row.topic),
    score: row.score ?? 0,
    summary: summaryText,
    whyItMatters,
    tags: summary?.key_points_cs?.slice(0, 3) ?? [row.status],
    readTime: estimateReadTime(summaryText),
  };
}

function toolFromRow(row: ToolRow): ToolItem {
  return {
    id: row.id,
    name: row.name,
    url: row.homepage_url,
    category: row.category,
    pricing: row.pricing as ToolItem["pricing"],
    summary: row.summary_cs ?? "Zatim bez popisu.",
    useCase: row.use_case_cs ?? "Use-case bude doplnen po kuraci.",
    signal: row.signal_score,
  };
}

function digestFromRow(row: DigestRow): Digest {
  return {
    id: row.id,
    date: formatDate(row.digest_date),
    title: row.title_cs,
    focus: row.focus_cs ?? "souhrn dne",
    items: row.body_cs
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export async function getSources() {
  const supabase = getSupabaseClient();
  if (!supabase) return demoSources;

  const { data, error } = await supabase
    .from("sources")
    .select("id, slug, name, homepage_url, feed_url, tier, topic, cadence, trust_score, status")
    .order("trust_score", { ascending: false })
    .order("name", { ascending: true });

  if (error || !data) return demoSources;
  return (data as SourceRow[]).map(sourceFromRow);
}

export async function getRecentNews(limit = 20) {
  const supabase = getSupabaseClient();
  if (!supabase) return demoNewsItems.slice(0, limit);

  const { data, error } = await supabase
    .from("items")
    .select(
      "id, title, canonical_url, published_at, topic, score, raw_excerpt, status, sources(name, homepage_url), item_summaries(summary_short_cs, summary_long_cs, why_it_matters_cs, key_points_cs, created_at)",
    )
    .neq("status", "hidden")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return demoNewsItems.slice(0, limit);
  return (data as unknown as ItemRow[]).map(newsFromRow);
}

export async function getTools() {
  const supabase = getSupabaseClient();
  if (!supabase) return demoTools;

  const { data, error } = await supabase
    .from("tools")
    .select("id, name, homepage_url, category, pricing, summary_cs, use_case_cs, signal_score")
    .order("signal_score", { ascending: false });

  if (error || !data || data.length === 0) return demoTools;
  return (data as ToolRow[]).map(toolFromRow);
}

export async function getDigests() {
  const supabase = getSupabaseClient();
  if (!supabase) return demoDigests;

  const { data, error } = await supabase
    .from("daily_digests")
    .select("id, digest_date, title_cs, focus_cs, body_cs")
    .order("digest_date", { ascending: false })
    .limit(14);

  if (error || !data || data.length === 0) return demoDigests;
  return (data as DigestRow[]).map(digestFromRow);
}

export async function getDashboardData() {
  const [sources, news, tools, digests] = await Promise.all([
    getSources(),
    getRecentNews(12),
    getTools(),
    getDigests(),
  ]);

  const topicCounts = news.reduce<Record<string, number>>((acc, item) => {
    acc[item.topic] = (acc[item.topic] ?? 0) + 1;
    return acc;
  }, {});

  const topicStats = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      accent: ["bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-cyan-500", "bg-rose-500"][index],
    }));

  return {
    sources,
    news,
    tools,
    digests,
    topicStats,
    activeSourceCount: sources.filter((source) => source.status === "active").length,
    topScore: news.reduce((max, item) => Math.max(max, item.score), 0),
  };
}

export async function getAiOverview() {
  const supabase = getSupabaseClient();
  const news = await getRecentNews(10);

  if (!supabase) {
    return {
      queuedCount: 0,
      summarizedCount: news.length,
      topScored: news,
    };
  }

  const [{ count: queuedCount }, { count: summarizedCount }] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("status", "summarized"),
  ]);

  return {
    queuedCount: queuedCount ?? 0,
    summarizedCount: summarizedCount ?? 0,
    topScored: [...news].sort((a, b) => b.score - a.score).slice(0, 8),
  };
}
