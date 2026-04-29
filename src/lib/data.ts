import { createClient } from "@supabase/supabase-js";

import {
  digests as demoDigests,
  newsItems as demoNewsItems,
  sources as demoSources,
  tools as demoTools,
} from "./demo-data";
import type {
  Digest,
  NewsItem,
  NewsStatus,
  Source,
  SourceStatus,
  SourceTier,
  ToolItem,
  Topic,
} from "./types";

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

export type NewsArchiveFilters = {
  query?: string;
  topic?: Topic | "all";
  status?: NewsStatus | "all";
  sort?: "score" | "newest";
  page?: number;
  pageSize?: number;
  minScore?: number;
};

export type NewsArchiveResult = {
  items: NewsItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ToolFilters = {
  query?: string;
  category?: string;
  pricing?: ToolItem["pricing"] | "all";
  limit?: number;
};

export type ItemCounts = {
  total: number;
  queued: number;
  summarized: number;
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

export const topicOptions = topics;

const sourceTiers: SourceTier[] = ["primary", "research", "expert", "sector", "tools"];
const sourceStatuses: SourceStatus[] = ["active", "review", "paused"];
const newsStatuses: NewsStatus[] = ["new", "summarized", "archived", "hidden"];
const pricingOptions: ToolItem["pricing"][] = ["Free", "Freemium", "Paid", "Research", "Unknown"];
export const toolPricingOptions = pricingOptions;
const itemSelectWithTitle =
  "id, title, canonical_url, published_at, topic, score, raw_excerpt, status, sources(name, homepage_url), item_summaries(title_cs, summary_short_cs, summary_long_cs, why_it_matters_cs, key_points_cs, created_at)";
const itemSelectLegacy =
  "id, title, canonical_url, published_at, topic, score, raw_excerpt, status, sources(name, homepage_url), item_summaries(summary_short_cs, summary_long_cs, why_it_matters_cs, key_points_cs, created_at)";

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

function normalizeNewsStatus(value: string): NewsStatus {
  if (newsStatuses.includes(value as NewsStatus)) return value as NewsStatus;
  return "new";
}

function normalizePricing(value: string): ToolItem["pricing"] {
  if (pricingOptions.includes(value as ToolItem["pricing"])) {
    return value as ToolItem["pricing"];
  }
  return "Unknown";
}

function cleanSearchTerm(value: string | undefined) {
  return (value ?? "")
    .replace(/[,%(){}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function includesQuery(item: NewsItem | ToolItem, query: string) {
  const haystack = Object.values(item)
    .flat()
    .join(" ")
    .toLocaleLowerCase("cs-CZ");
  const terms = query
    .toLocaleLowerCase("cs-CZ")
    .split(/\s+/)
    .filter((term) => term.length > 2);

  if (terms.length === 0) return haystack.includes(query.toLocaleLowerCase("cs-CZ"));
  return terms.some((term) => haystack.includes(term));
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

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
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
    "Ceka na ceske AI shrnuti. Polozka je uz ulozena v archivu a bude zpracovana v dalsi davce.";
  const whyItMatters =
    summary?.why_it_matters_cs ??
    "Dulezitost doplni AI zpracovani po vyhodnoceni zdroje, tematu a praktickeho dopadu.";

  return {
    id: row.id,
    title: summary?.title_cs ?? row.title,
    url: row.canonical_url,
    source: row.sources?.name ?? "Neznamy zdroj",
    sourceUrl: row.sources?.homepage_url ?? row.canonical_url,
    publishedAt: formatDate(row.published_at),
    topic: normalizeTopic(row.topic),
    score: row.score ?? 0,
    summary: truncateText(summaryText, 230),
    whyItMatters: truncateText(whyItMatters, 190),
    tags: summary?.key_points_cs?.slice(0, 3) ?? [row.status],
    readTime: estimateReadTime(summaryText),
    status: normalizeNewsStatus(row.status),
  };
}

function toolFromRow(row: ToolRow): ToolItem {
  return {
    id: row.id,
    name: row.name,
    url: row.homepage_url,
    category: row.category,
    pricing: normalizePricing(row.pricing),
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

  const summarized = await supabase
    .from("items")
    .select(itemSelectWithTitle)
    .eq("status", "summarized")
    .order("score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  const summarizedData =
    summarized.error && summarized.error.message.includes("title_cs")
      ? await supabase
          .from("items")
          .select(itemSelectLegacy)
          .eq("status", "summarized")
          .order("score", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(limit)
      : summarized;

  if (summarizedData.error || !summarizedData.data) {
    return demoNewsItems.slice(0, limit);
  }

  return (summarizedData.data as unknown as ItemRow[]).map(newsFromRow);
}

export async function getNewsArchive(
  filters: NewsArchiveFilters = {},
): Promise<NewsArchiveResult> {
  const supabase = getSupabaseClient();
  const pageSize = clamp(filters.pageSize ?? 20, 6, 48);
  const page = Math.max(1, filters.page ?? 1);
  const status = filters.status ?? "summarized";
  const sort = filters.sort ?? "newest";
  const query = cleanSearchTerm(filters.query);
  const topic = filters.topic && filters.topic !== "all" ? filters.topic : undefined;
  const minScore = filters.minScore ? clamp(filters.minScore, 0, 100) : undefined;

  if (!supabase) {
    const filtered = demoNewsItems.filter((item) => {
      if (topic && item.topic !== topic) return false;
      if (minScore && item.score < minScore) return false;
      if (query && !includesQuery(item, query)) return false;
      return true;
    });

    const sorted = filtered.sort((a, b) =>
      sort === "score" ? b.score - a.score : b.publishedAt.localeCompare(a.publishedAt),
    );
    const from = (page - 1) * pageSize;

    return {
      items: sorted.slice(from, from + pageSize),
      total: sorted.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
    };
  }

  if (query) {
    let candidates = supabase.from("items").select(itemSelectWithTitle);
    if (status !== "all") candidates = candidates.eq("status", status);
    if (topic) candidates = candidates.eq("topic", topic);
    if (minScore !== undefined) candidates = candidates.gte("score", minScore);

    if (sort === "score") {
      candidates = candidates
        .order("score", { ascending: false })
        .order("published_at", { ascending: false });
    } else {
      candidates = candidates
        .order("published_at", { ascending: false })
        .order("score", { ascending: false });
    }

    const { data, error } = await candidates.limit(300);

    if (error || !data) {
      return { items: [], total: 0, page, pageSize, totalPages: 1 };
    }

    const filtered = (data as unknown as ItemRow[])
      .map(newsFromRow)
      .filter((item) => includesQuery(item, query));
    const from = (page - 1) * pageSize;

    return {
      items: filtered.slice(from, from + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  }

  const from = (page - 1) * pageSize;
  let request = supabase.from("items").select(itemSelectWithTitle, { count: "exact" });
  if (status !== "all") request = request.eq("status", status);
  if (topic) request = request.eq("topic", topic);
  if (minScore !== undefined) request = request.gte("score", minScore);

  if (sort === "score") {
    request = request
      .order("score", { ascending: false })
      .order("published_at", { ascending: false });
  } else {
    request = request
      .order("published_at", { ascending: false })
      .order("score", { ascending: false });
  }

  request = request.range(from, from + pageSize - 1);
  const { data, error, count } = await request;

  if (error || !data) {
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }

  const total = count ?? data.length;

  return {
    items: (data as unknown as ItemRow[]).map(newsFromRow),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getItemCounts(): Promise<ItemCounts> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      total: demoNewsItems.length,
      queued: 0,
      summarized: demoNewsItems.length,
    };
  }

  const [total, queued, summarized] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase.from("items").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("status", "summarized"),
  ]);

  return {
    total: total.count ?? 0,
    queued: queued.count ?? 0,
    summarized: summarized.count ?? 0,
  };
}

function filterTools(items: ToolItem[], filters: ToolFilters) {
  const query = cleanSearchTerm(filters.query);

  return items.filter((tool) => {
    if (filters.category && filters.category !== "all" && tool.category !== filters.category) {
      return false;
    }

    if (filters.pricing && filters.pricing !== "all" && tool.pricing !== filters.pricing) {
      return false;
    }

    if (query && !includesQuery(tool, query)) return false;

    return true;
  });
}

export async function getTools(filters: ToolFilters = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return filterTools(demoTools, filters).slice(0, filters.limit);

  const { data, error } = await supabase
    .from("tools")
    .select("id, name, homepage_url, category, pricing, summary_cs, use_case_cs, signal_score")
    .order("signal_score", { ascending: false });

  const rows = error || !data || data.length === 0 ? demoTools : (data as ToolRow[]).map(toolFromRow);
  return filterTools(rows, filters).slice(0, filters.limit);
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
  const [sources, news, tools, digests, itemCounts] = await Promise.all([
    getSources(),
    getRecentNews(12),
    getTools(),
    getDigests(),
    getItemCounts(),
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
    itemCounts,
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
