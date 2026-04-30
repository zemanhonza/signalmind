import "./load-env";

import { createClient } from "@supabase/supabase-js";

type Pricing = "Free" | "Freemium" | "Paid" | "Research" | "Unknown";

type ExistingTool = {
  name: string;
  homepage_url: string;
};

type VutToolImport = {
  name: string;
  homepage_url: string;
  category: string;
  pricing: Pricing;
  summary_cs: string;
  use_case_cs: string;
  signal_score: number;
  tool_type: string | null;
  typical_data: string | null;
  risk_level: string | null;
  data_residency: string | null;
  compliance_status: string | null;
  recommended_decision: string | null;
  ai_act_note_cs: string | null;
  legal_security_note_cs: string | null;
  risk_conditions_cs: string | null;
  risk_rationale_cs: string | null;
  risk_guarantor: string | null;
  risk_source_name: string;
  risk_source_url: string;
  risk_checked_at: string | null;
  risk_updated_at: string;
  updated_at: string;
};

type ImportOptions = {
  url: string;
  dryRun: boolean;
  limit?: number;
};

const defaultUrl = "https://www.vut.cz/ai/katalog";
const sourceName = "VUT katalog AI nastroju";

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
    url: defaultUrl,
    dryRun: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--url=")) {
      options.url = arg.slice("--url=".length);
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const limit = Number(arg.slice("--limit=".length));
      if (Number.isFinite(limit) && limit > 0) options.limit = Math.floor(limit);
    }
  }

  return options;
}

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    bdquo: '"',
    gt: ">",
    ldquo: '"',
    lt: "<",
    nbsp: " ",
    quot: '"',
    rdquo: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (_, key: string) => named[key.toLocaleLowerCase("en-US")] ?? `&${key};`);
}

function cleanText(value: string) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\s+\n/g, "\n"),
  ).trim();
}

function singleLine(value: string) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const trimmed = value.slice(0, maxLength - 1);
  const boundary = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, boundary > 80 ? boundary : trimmed.length).trim()}...`;
}

function normalizeUrl(value: string, baseUrl: string) {
  try {
    const url = new URL(decodeHtml(value), baseUrl);
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

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

function normalizeCategory(value: string) {
  const category = singleLine(value)
    .replace(/^\d+\s+/, "")
    .replace(/\s*\(\d+\s+položek\)\s*$/i, "")
    .trim();

  return category || "AI nastroje";
}

function extractStrongValue(html: string, label: string) {
  const pattern = new RegExp(
    `<strong>\\s*${escapeRegExp(label)}\\s*:<\\/strong>\\s*([\\s\\S]*?)(?=<\\/p>|<br\\s*\\/?>)`,
    "i",
  );
  const match = html.match(pattern);
  return match ? singleLine(match[1]) : "";
}

function extractRiskCell(html: string, label: string) {
  const pattern = new RegExp(
    `<th>\\s*${escapeRegExp(label)}\\s*<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? singleLine(match[1]) : "";
}

function extractParagraphValue(html: string, label: string) {
  const pattern = new RegExp(
    `<strong>\\s*${escapeRegExp(label)}\\s*:<\\/strong>\\s*([\\s\\S]*?)<\\/p>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? singleLine(match[1]) : "";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitCategorySections(html: string) {
  return html
    .split(/<table border="0"><caption>/i)
    .slice(1)
    .map((segment) => {
      const captionEnd = segment.search(/<\/caption>/i);
      const caption = captionEnd >= 0 ? segment.slice(0, captionEnd) : "";
      const content = captionEnd >= 0 ? segment.slice(captionEnd) : segment;
      return {
        category: normalizeCategory(caption),
        content,
      };
    })
    .filter((section) => /\d+\s+/.test(section.category) === false);
}

function parseCheckedAt(html: string) {
  const text = singleLine(html);
  const match = text.match(/Ověřeno k\s+(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/i);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function scoreFromRisk(riskLevel: string, recommendedDecision: string) {
  const decision = normalizeKey(recommendedDecision);
  const risk = normalizeKey(riskLevel);
  let score = 74;

  if (decision.includes("schvaleni")) score = 90;
  if (decision.includes("podmin")) score = 82;
  if (decision.includes("omezeni")) score = 66;
  if (decision.includes("zam")) score = 36;

  if (risk.includes("niz")) score += 5;
  if (risk.includes("vys")) score -= 12;

  return Math.min(Math.max(score, 25), 96);
}

function parseTools(html: string, sourceUrl: string, existingByName: Map<string, string>) {
  const checkedAt = parseCheckedAt(html);
  const now = new Date().toISOString();
  const tools: VutToolImport[] = [];

  for (const section of splitCategorySections(html)) {
    const rowRegex =
      /<tr>\s*<td>\s*<p><strong><a href="([^"]+)">([\s\S]*?)<\/a><\/strong><\/p>([\s\S]*?)(?=<tr>\s*<td>\s*<p><strong><a href=|<table border="0"><caption>|$)/gi;

    for (const match of section.content.matchAll(rowRegex)) {
      const sourceToolUrl = normalizeUrl(match[1], sourceUrl);
      const name = singleLine(match[2]);
      const rowHtml = match[0];
      if (!name || !sourceToolUrl) continue;

      const existingUrl = existingByName.get(normalizeKey(name));
      const homepageUrl = existingUrl ?? sourceToolUrl;
      const typicalPurpose = extractStrongValue(rowHtml, "Typický účel");
      const typicalData = extractStrongValue(rowHtml, "Typická data");
      const toolType = extractStrongValue(rowHtml, "Typ");
      const riskLevel = extractRiskCell(rowHtml, "Bezpečnostní klasifikace");
      const dataResidency = extractRiskCell(rowHtml, "EU/EHP úložiště / rezidence");
      const complianceStatus = extractRiskCell(rowHtml, "Stav vůči EU/ČR požadavkům");
      const recommendedDecision = extractRiskCell(rowHtml, "Doporučené rozhodnutí");
      const aiActNote = extractParagraphValue(rowHtml, "AI Act poznámka");
      const legalNote = extractParagraphValue(rowHtml, "ČR právní a bezpečnostní poznámka");
      const guarantor = extractParagraphValue(rowHtml, "Garant");
      const conditions = extractParagraphValue(rowHtml, "Klíčové podmínky");
      const rationale = extractParagraphValue(rowHtml, "Hlavní zdůvodnění");

      tools.push({
        name: truncateAtWord(name, 120),
        homepage_url: homepageUrl,
        category: section.category,
        pricing: "Unknown",
        summary_cs:
          truncateAtWord(typicalPurpose, 260) ||
          "Nastroj z VUT katalogu AI nastroju; popis bude doplnen po kuraci.",
        use_case_cs:
          truncateAtWord(
            conditions || typicalData || `Posouzeni rizika v kategorii ${section.category}.`,
            260,
          ) || `Posouzeni rizika v kategorii ${section.category}.`,
        signal_score: scoreFromRisk(riskLevel, recommendedDecision),
        tool_type: toolType || null,
        typical_data: typicalData || null,
        risk_level: riskLevel || null,
        data_residency: dataResidency || null,
        compliance_status: complianceStatus || null,
        recommended_decision: recommendedDecision || null,
        ai_act_note_cs: aiActNote || null,
        legal_security_note_cs: legalNote || null,
        risk_conditions_cs: conditions || null,
        risk_rationale_cs: rationale || null,
        risk_guarantor: guarantor || null,
        risk_source_name: sourceName,
        risk_source_url: sourceUrl,
        risk_checked_at: checkedAt,
        risk_updated_at: now,
        updated_at: now,
      });
    }
  }

  return tools;
}

async function loadExistingTools() {
  const { data, error } = await supabase.from("tools").select("name, homepage_url");
  if (error || !data) return new Map<string, string>();

  return new Map(
    (data as ExistingTool[]).map((tool) => [normalizeKey(tool.name), tool.homepage_url]),
  );
}

async function main() {
  const options = parseArgs();
  const response = await fetch(options.url, {
    headers: {
      "user-agent": "Signalmind tool-risk importer",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch VUT catalog: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const existingByName = await loadExistingTools();
  const tools = parseTools(html, options.url, existingByName).slice(
    0,
    options.limit ?? Number.POSITIVE_INFINITY,
  );

  if (tools.length === 0) {
    throw new Error("No tools parsed from VUT catalog.");
  }

  if (options.dryRun) {
    console.table(
      tools.slice(0, 25).map((tool) => ({
        name: tool.name,
        category: tool.category,
        risk: tool.risk_level,
        decision: tool.recommended_decision,
        url: tool.homepage_url,
      })),
    );
    console.log(`Dry run: ${tools.length} VUT tools would be upserted.`);
    return;
  }

  const { error } = await supabase.from("tools").upsert(tools, {
    onConflict: "homepage_url",
  });

  if (error) {
    throw new Error(`Failed to import VUT tools: ${error.message}`);
  }

  console.log(`Imported or updated ${tools.length} tools from ${options.url}.`);
}

void main();
