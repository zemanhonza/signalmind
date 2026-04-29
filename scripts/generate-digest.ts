import "./load-env";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const DigestSchema = z.object({
  title_cs: z.string().min(8).max(120),
  focus_cs: z.string().min(8).max(140),
  body_lines_cs: z.array(z.string().min(10).max(260)).min(4).max(8),
});

type ItemRow = {
  id: string;
  title: string;
  canonical_url: string;
  published_at: string | null;
  topic: string | null;
  score: number | null;
  sources: {
    name: string;
  } | null;
  item_summaries: Array<{
    title_cs?: string | null;
    summary_short_cs: string | null;
    why_it_matters_cs: string | null;
    key_points_cs: string[] | null;
    created_at: string;
  }> | null;
};

type AnthropicResponse = {
  content: Array<{
    type: string;
    text?: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const model =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-4-5-20251001";

if (!supabaseUrl || !serviceRoleKey || !anthropicKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or ANTHROPIC_API_KEY.",
  );
}

const anthropicApiKey = anthropicKey;
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const itemLimit = limitArg ? Number(limitArg.split("=")[1]) : 12;
const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const configuredTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS);
const requestTimeoutMs =
  Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
    ? configuredTimeoutMs
    : 45000;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function pragueDate() {
  if (dateArg) return dateArg.split("=")[1];

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function latestSummary(item: ItemRow) {
  return [...(item.item_summaries ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude response did not contain a JSON object.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

async function loadItems() {
  const { data, error } = await supabase
    .from("items")
    .select(
      "id, title, canonical_url, published_at, topic, score, sources(name), item_summaries(title_cs, summary_short_cs, why_it_matters_cs, key_points_cs, created_at)",
    )
    .eq("status", "summarized")
    .order("score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(itemLimit);

  if (error) throw error;
  return (data ?? []) as unknown as ItemRow[];
}

function buildPrompt(items: ItemRow[]) {
  const lines = items.map((item, index) => {
    const summary = latestSummary(item);
    return [
      `${index + 1}. ${summary?.title_cs ?? item.title}`,
      `Zdroj: ${item.sources?.name ?? "neznamy"}`,
      `Tema: ${item.topic ?? "nezarazeno"}`,
      `Skore: ${item.score ?? 0}`,
      `Datum: ${item.published_at ?? "bez data"}`,
      `Shrnuti: ${summary?.summary_short_cs ?? ""}`,
      `Dulezitost: ${summary?.why_it_matters_cs ?? ""}`,
      `Body: ${summary?.key_points_cs?.join(", ") ?? ""}`,
      `URL: ${item.canonical_url}`,
    ].join("\n");
  });

  return `
Vytvor cesky denni digest pro Signalmind z techto AI novinek.

Vrat pouze validni JSON bez Markdownu ve tvaru:
{
  "title_cs": "kratky titulek digestu",
  "focus_cs": "3-6 klicovych slov nebo temat",
  "body_lines_cs": [
    "kratky bod s tematem a jasnym dopadem",
    "kratky bod s tematem a jasnym dopadem"
  ]
}

Pravidla:
- Pis cesky, vecne a bez hype.
- Vyber nejdulezitejsi vzorce napric zdroji, ne jen prepis titulku.
- Body zacinaji tematickou znackou jako Medicina:, Vzdelavani:, Nastroje:, Vyzkum:, Regulace:.
- Maximalne 8 bodu.

Novinky:

${lines.join("\n\n")}
`.trim();
}

async function generateDigest(items: ItemRow[]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      temperature: 0.2,
      system:
        "Jsi editor ceskeho AI digestu. Vracis pouze validni JSON podle zadaneho schematu.",
      messages: [{ role: "user", content: buildPrompt(items) }],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${body.slice(0, 300)}`);
  }

  const json = (await response.json()) as AnthropicResponse;
  const text = json.content.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("Claude response did not contain text.");

  return DigestSchema.parse(extractJson(text));
}

async function main() {
  const digestDate = pragueDate();
  const items = await loadItems();
  console.log(`Loaded ${items.length} summarized items for digest ${digestDate}.`);

  if (items.length === 0) {
    console.log("No summarized items available; skipping digest.");
    return;
  }

  const digest = await generateDigest(items);
  const { error } = await supabase.from("daily_digests").upsert(
    {
      digest_date: digestDate,
      title_cs: digest.title_cs,
      focus_cs: digest.focus_cs,
      body_cs: digest.body_lines_cs.join("\n"),
    },
    { onConflict: "digest_date" },
  );

  if (error) throw error;

  console.log(`Generated digest for ${digestDate}: ${digest.title_cs}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
