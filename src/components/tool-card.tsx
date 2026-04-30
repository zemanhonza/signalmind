import { ExternalLink } from "lucide-react";

import type { ToolItem } from "@/lib/types";

const pricingLabels: Record<ToolItem["pricing"], string> = {
  Free: "Zdarma",
  Freemium: "Freemium",
  Paid: "Placene",
  Research: "Vyzkum",
  Unknown: "Nejasne",
};

function normalize(value: string | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("cs-CZ");
}

function riskClass(value: string | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("niz")) return "bg-[#dff6ea] text-[#145238]";
  if (normalized.includes("stred")) return "bg-[#fff0bd] text-[#684900]";
  if (normalized.includes("vys")) return "bg-[#ffe1dc] text-[#7f1d1d]";
  return "bg-[#f0f2ef] text-[#40524b]";
}

function decisionClass(value: string | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("zam")) return "bg-[#ffe1dc] text-[#7f1d1d]";
  if (normalized.includes("omezeni")) return "bg-[#ffe8c7] text-[#6b3a00]";
  if (normalized.includes("podmin")) return "bg-[#fff0bd] text-[#684900]";
  if (normalized.includes("schval")) return "bg-[#dff6ea] text-[#145238]";
  return "bg-[#f0f2ef] text-[#40524b]";
}

export function ToolCard({ tool }: { tool: ToolItem }) {
  return (
    <article className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm transition hover:border-[#c9d3cd]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68716c]">
            {tool.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#1d211f]">
            <a href={tool.url} target="_blank" rel="noreferrer" className="hover:underline">
              {tool.name}
            </a>
          </h3>
        </div>
        <span className="rounded-lg bg-[#f0f2ef] px-2.5 py-1 text-xs font-semibold text-[#40524b]">
          {pricingLabels[tool.pricing]}
        </span>
      </div>
      {(tool.riskLevel || tool.recommendedDecision) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tool.riskLevel && (
            <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${riskClass(tool.riskLevel)}`}>
              Riziko: {tool.riskLevel}
            </span>
          )}
          {tool.recommendedDecision && (
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${decisionClass(tool.recommendedDecision)}`}
            >
              Doporuceni: {tool.recommendedDecision}
            </span>
          )}
        </div>
      )}
      <p className="mt-3 text-sm leading-6 text-[#4f5d55]">{tool.summary}</p>
      <p className="mt-3 text-sm leading-6 text-[#40524b]">{tool.useCase}</p>
      {(tool.toolType || tool.typicalData || tool.dataResidency) && (
        <div className="mt-4 grid gap-2 border-t border-[#edf0ec] pt-4 text-xs leading-5 text-[#59645e]">
          {tool.toolType && (
            <p>
              <span className="font-semibold text-[#40524b]">Typ:</span> {tool.toolType}
            </p>
          )}
          {tool.typicalData && (
            <p>
              <span className="font-semibold text-[#40524b]">Typicka data:</span>{" "}
              {tool.typicalData}
            </p>
          )}
          {tool.dataResidency && (
            <p>
              <span className="font-semibold text-[#40524b]">Data residency:</span>{" "}
              {tool.dataResidency}
            </p>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#145238]">
          relevance {tool.signal}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {tool.riskSourceUrl && (
            <a
              href={tool.riskSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#0d6b57] hover:underline"
            >
              Rizikovy zdroj
            </a>
          )}
          <a
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d6b57] hover:underline"
          >
            Otevrit
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
