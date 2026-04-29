import "./load-env";

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

type Pricing = "Free" | "Freemium" | "Paid" | "Research" | "Unknown";

type ToolImport = {
  name: string;
  homepage_url: string;
  category: string;
  pricing: Pricing;
  summary_cs: string;
  use_case_cs: string;
  signal_score: number;
  updated_at: string;
};

type ImportOptions = {
  file?: string;
  dryRun: boolean;
  limit?: number;
  defaultScore: number;
};

const columnAliases = {
  name: ["name", "tool", "toolname", "tool name", "product", "app", "title", "ai tool"],
  url: [
    "url",
    "link",
    "website",
    "homepage",
    "homepage url",
    "website url",
    "tool url",
    "product url",
  ],
  category: ["category", "categories", "type", "segment", "use case", "usecase"],
  pricing: ["pricing", "price", "cost", "plan", "paid", "free"],
  summary: ["description", "desc", "summary", "overview", "tagline", "what it does"],
  useCase: ["use case", "use cases", "best for", "use", "audience", "workflow"],
  score: ["score", "signal", "relevance", "rating"],
  rank: ["rank", "ranking", "position", "#"],
} as const;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function parseArgs(): ImportOptions {
  const options: ImportOptions = {
    dryRun: false,
    defaultScore: 72,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--file=")) {
      options.file = arg.slice("--file=".length);
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const limit = Number(arg.slice("--limit=".length));
      if (Number.isFinite(limit) && limit > 0) options.limit = Math.floor(limit);
      continue;
    }

    if (arg.startsWith("--default-score=")) {
      const score = Number(arg.slice("--default-score=".length));
      if (Number.isFinite(score)) options.defaultScore = clamp(Math.round(score), 0, 100);
      continue;
    }

    if (!arg.startsWith("--")) {
      options.file = arg;
    }
  }

  if (!options.file) {
    throw new Error(
      "Missing CSV file. Usage: npm run tools:import-csv -- --file=./exports/tools.csv",
    );
  }

  return options;
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);

  return rows;
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

function mapHeaders(headers: string[]) {
  const normalized = headers.map(normalizeHeader);

  function find(aliases: readonly string[]) {
    const aliasSet = new Set(aliases.map(normalizeHeader));
    return normalized.findIndex((header) => aliasSet.has(header));
  }

  return {
    name: find(columnAliases.name),
    url: find(columnAliases.url),
    category: find(columnAliases.category),
    pricing: find(columnAliases.pricing),
    summary: find(columnAliases.summary),
    useCase: find(columnAliases.useCase),
    score: find(columnAliases.score),
    rank: find(columnAliases.rank),
  };
}

function cell(row: string[], index: number) {
  if (index < 0) return "";
  return (row[index] ?? "").trim();
}

function cleanText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[\p{Extended_Pictographic}\p{Symbol}\s*+-]+/u, "")
    .trim();
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const trimmed = value.slice(0, maxLength - 1);
  const boundary = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, boundary > 80 ? boundary : trimmed.length).trim()}...`;
}

function normalizeUrl(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (
        key.toLocaleLowerCase("en-US").startsWith("utm_") ||
        key.toLocaleLowerCase("en-US") === "_bhlid"
      ) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return "";
  }
}

function normalizePricing(value: string): Pricing {
  const normalized = normalizeHeader(value);

  if (!normalized) return "Unknown";
  if (normalized.includes("freemium")) return "Freemium";
  if (normalized.includes("research") || normalized.includes("academic")) return "Research";
  if (normalized.includes("free") || normalized.includes("zdarma")) return "Free";
  if (
    normalized.includes("paid") ||
    normalized.includes("placen") ||
    normalized.includes("subscription") ||
    normalized.includes("month")
  ) {
    return "Paid";
  }

  return "Unknown";
}

function inferCategory(value: string) {
  const normalized = normalizeHeader(value);

  if (!normalized) return "AI nastroje";
  if (/health|medical|clinic|medicine|doctor|patient/.test(normalized)) return "Medicina";
  if (/education|school|student|teacher|learn|course|tutor/.test(normalized)) return "Vzdelavani";
  if (/code|developer|program|github|software|dev/.test(normalized)) return "Vyvoj";
  if (/research|paper|source|search|literature|knowledge/.test(normalized)) {
    return "Vyzkum a zdroje";
  }
  if (/data|analytics|bi|spreadsheet|excel|sql/.test(normalized)) return "Data a analytika";
  if (/video|image|audio|design|presentation|content|write|copy/.test(normalized)) {
    return "Tvorba obsahu";
  }
  if (/sales|marketing|seo|crm|competitor|lead/.test(normalized)) return "Marketing a obchod";
  if (/agent|automation|workflow|integrat/.test(normalized)) return "Automatizace";
  if (/security|compliance|soc|privacy/.test(normalized)) return "Bezpecnost a compliance";
  if (/productivity|email|meeting|document|office|pdf/.test(normalized)) return "Produktivita";

  return truncateAtWord(cleanText(value), 48) || "AI nastroje";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseScore(scoreText: string, rankText: string, defaultScore: number) {
  const score = Number(scoreText.replace(/[^\d.]/g, ""));
  if (Number.isFinite(score) && score > 0) return clamp(Math.round(score), 0, 100);

  const rank = Number(rankText.replace(/[^\d.]/g, ""));
  if (Number.isFinite(rank) && rank > 0) {
    return clamp(Math.round(96 - (rank - 1) * 0.22), 65, 96);
  }

  return defaultScore;
}

function rowToTool(
  row: string[],
  headerMap: ReturnType<typeof mapHeaders>,
  defaultScore: number,
  updatedAt: string,
): ToolImport | null {
  const name = cleanText(cell(row, headerMap.name));
  const homepageUrl = normalizeUrl(cell(row, headerMap.url));

  if (!name || !homepageUrl) return null;

  const categorySource = cell(row, headerMap.category) || cell(row, headerMap.summary);
  const category = inferCategory(categorySource);
  const summary = cleanText(cell(row, headerMap.summary));
  const useCase = cleanText(cell(row, headerMap.useCase));

  return {
    name: truncateAtWord(name, 120),
    homepage_url: homepageUrl,
    category,
    pricing: normalizePricing(cell(row, headerMap.pricing)),
    summary_cs:
      truncateAtWord(summary, 260) ||
      "Nastroj z importovaneho seznamu AI nastroju; popis bude doplnen po kuraci.",
    use_case_cs:
      truncateAtWord(useCase, 220) ||
      `Vhodne k otestovani v kategorii ${category.toLocaleLowerCase("cs-CZ")}.`,
    signal_score: parseScore(cell(row, headerMap.score), cell(row, headerMap.rank), defaultScore),
    updated_at: updatedAt,
  };
}

async function main() {
  const options = parseArgs();
  const csv = await readFile(options.file!, "utf8");
  const rows = parseCsv(csv);
  const [headers, ...body] = rows;

  if (!headers || body.length === 0) {
    throw new Error("CSV does not contain a header and at least one data row.");
  }

  const headerMap = mapHeaders(headers);
  if (headerMap.name < 0 || headerMap.url < 0) {
    throw new Error(
      `CSV must include name/tool and url/link columns. Found headers: ${headers.join(", ")}`,
    );
  }

  const updatedAt = new Date().toISOString();
  const tools = body
    .map((row) => rowToTool(row, headerMap, options.defaultScore, updatedAt))
    .filter((tool): tool is ToolImport => tool !== null)
    .slice(0, options.limit ?? Number.POSITIVE_INFINITY);

  if (tools.length === 0) {
    throw new Error("No importable tools found. Check that rows include both name and URL.");
  }

  if (options.dryRun) {
    console.table(
      tools.slice(0, 20).map((tool) => ({
        name: tool.name,
        url: tool.homepage_url,
        category: tool.category,
        pricing: tool.pricing,
        relevance: tool.signal_score,
      })),
    );
    console.log(`Dry run: ${tools.length} tools would be upserted.`);
    return;
  }

  const { error } = await supabase.from("tools").upsert(tools, {
    onConflict: "homepage_url",
  });

  if (error) {
    throw new Error(`Failed to import tools: ${error.message}`);
  }

  console.log(`Imported or updated ${tools.length} tools from ${options.file}.`);
}

void main();
