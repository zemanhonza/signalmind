import "./load-env";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const TopicSchema = z.enum([
  "AI obecne",
  "Medicina",
  "Vzdelavani",
  "Vyzkum",
  "Nastroje",
  "Regulace",
  "Bezpecnost",
]);

const AiResultSchema = z.object({
  summary_short_cs: z.string().min(20),
  summary_long_cs: z.string().min(20).optional(),
  why_it_matters_cs: z.string().min(20),
  key_points_cs: z.array(z.string().min(3)).min(2).max(5),
  topic: TopicSchema,
  score: z.number().int().min(0).max(100),
  tags: z.array(z.string().min(2)).max(8),
});

type ItemRow = {
  id: string;
  title: string;
  canonical_url: string;
  raw_excerpt: string | null;
  topic: string | null;
  published_at: string | null;
  sources: {
    name: string;
    trust_score: number;
    tier: string;
  } | null;
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
const itemLimit = limitArg ? Number(limitArg.split("=")[1]) : 5;
const configuredTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS);
const requestTimeoutMs =
  Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
    ? configuredTimeoutMs
    : 45000;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude response did not contain a JSON object.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function buildPrompt(item: ItemRow) {
  return `
Zpracuj nasledujici AI novinku pro cesky znalostni system Signalmind.

Vrat pouze validni JSON bez Markdownu a bez komentare ve tvaru:
{
  "summary_short_cs": "2-3 vety cesky",
  "summary_long_cs": "4-6 vet cesky",
  "why_it_matters_cs": "proc je to dulezite pro praxi/vyzkum/medicinu/vzdelavani",
  "key_points_cs": ["bod 1", "bod 2", "bod 3"],
  "topic": "AI obecne | Medicina | Vzdelavani | Vyzkum | Nastroje | Regulace | Bezpecnost",
  "score": 0-100,
  "tags": ["kratky tag", "kratky tag"]
}

Skore 90-100 znamena zasadni primarni informace nebo velmi silny prakticky dopad.
Skore 75-89 znamena dulezity signal pro sledovani.
Skore 50-74 znamena uzitecny, ale mene zasadni prispevek.
Skore pod 50 znamena nizkou prioritu.

Zdroj: ${item.sources?.name ?? "neznamy"} (${item.sources?.tier ?? "unknown"}, duveryhodnost ${item.sources?.trust_score ?? "unknown"})
Puvodni topic: ${item.topic ?? "neuvedeno"}
Datum: ${item.published_at ?? "neuvedeno"}
Titulek: ${item.title}
URL: ${item.canonical_url}
Excerpt:
${item.raw_excerpt ?? "Bez excerptu."}
`.trim();
}

async function loadItems() {
  const { data, error } = await supabase
    .from("items")
    .select(
      "id, title, canonical_url, raw_excerpt, topic, published_at, sources(name, trust_score, tier)",
    )
    .eq("status", "new")
    .order("published_at", { ascending: false })
    .limit(itemLimit);

  if (error) throw error;
  return (data ?? []) as unknown as ItemRow[];
}

async function summarizeWithClaude(item: ItemRow) {
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
      max_tokens: 900,
      temperature: 0.2,
      system:
        "Jsi analytik AI novinek. Vracis pouze validni JSON podle zadaneho schematu. Pises cesky, vecne a bez marketingoveho hype.",
      messages: [
        {
          role: "user",
          content: buildPrompt(item),
        },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${body.slice(0, 300)}`);
  }

  const json = (await response.json()) as AnthropicResponse;
  const text = json.content.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("Claude response did not contain text.");

  return AiResultSchema.parse(extractJson(text));
}

async function attachTags(itemId: string, tags: string[]) {
  for (const label of tags.map((tag) => tag.trim()).filter(Boolean)) {
    const slug = slugify(label);
    if (!slug) continue;

    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .upsert({ slug, label }, { onConflict: "slug" })
      .select("id")
      .single();

    if (tagError) throw tagError;

    const { error: linkError } = await supabase
      .from("item_tags")
      .upsert(
        { item_id: itemId, tag_id: tag.id },
        { onConflict: "item_id,tag_id", ignoreDuplicates: true },
      );

    if (linkError) throw linkError;
  }
}

async function processItem(item: ItemRow) {
  const result = await summarizeWithClaude(item);

  const { error: summaryError } = await supabase.from("item_summaries").insert({
    item_id: item.id,
    summary_short_cs: result.summary_short_cs,
    summary_long_cs: result.summary_long_cs ?? result.summary_short_cs,
    why_it_matters_cs: result.why_it_matters_cs,
    key_points_cs: result.key_points_cs,
    model_name: model,
  });

  if (summaryError) throw summaryError;

  const { error: itemError } = await supabase
    .from("items")
    .update({
      topic: result.topic,
      score: result.score,
      status: "summarized",
    })
    .eq("id", item.id);

  if (itemError) throw itemError;

  await attachTags(item.id, result.tags);

  return result;
}

async function main() {
  const items = await loadItems();
  console.log(`Loaded ${items.length} items for AI processing.`);

  let processed = 0;

  for (const item of items) {
    try {
      const result = await processItem(item);
      processed += 1;
      console.log(`${item.title}: score ${result.score}, topic ${result.topic}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${item.title}: skipped (${message})`);
    }
  }

  console.log(`Processed ${processed} items with ${model}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
