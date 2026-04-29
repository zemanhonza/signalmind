import { ExternalLink } from "lucide-react";

import type { ToolItem } from "@/lib/types";

const pricingLabels: Record<ToolItem["pricing"], string> = {
  Free: "Zdarma",
  Freemium: "Freemium",
  Paid: "Placene",
  Research: "Vyzkum",
  Unknown: "Nejasne",
};

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
      <p className="mt-3 text-sm leading-6 text-[#4f5d55]">{tool.summary}</p>
      <p className="mt-3 text-sm leading-6 text-[#40524b]">{tool.useCase}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#145238]">
          signal {tool.signal}
        </span>
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
    </article>
  );
}
