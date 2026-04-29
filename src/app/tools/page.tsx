import Link from "next/link";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { ToolCard } from "@/components/tool-card";
import { getTools, toolPricingOptions } from "@/lib/data";
import type { ToolItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pricingLabels: Record<ToolItem["pricing"], string> = {
  Free: "Zdarma",
  Freemium: "Freemium",
  Paid: "Placene",
  Research: "Vyzkum",
  Unknown: "Nejasne",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(
  params: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...params, ...updates })) {
    if (value && value !== "all") next.set(key, value);
  }

  const query = next.toString();
  return query ? `/tools?${query}` : "/tools";
}

function FilterLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
        active
          ? "border-[#145238] bg-[#145238] text-white"
          : "border-[#dfe4dd] bg-white text-[#40524b] hover:bg-[#f2f7f4]"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function ToolsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const q = firstParam(params.q) ?? "";
  const category = firstParam(params.category) ?? "all";
  const pricing = (firstParam(params.pricing) ?? "all") as ToolItem["pricing"] | "all";
  const allTools = await getTools();
  const tools = await getTools({ query: q, category, pricing });
  const categories = Array.from(new Set(allTools.map((tool) => tool.category))).sort();
  const currentParams = {
    q: q || undefined,
    category,
    pricing,
  };

  return (
    <section className="grid gap-5">
      <SectionHeading eyebrow="Katalog" title="AI nastroje" />

      <div className="rounded-lg border border-[#dfe4dd] bg-white p-4 shadow-sm">
        <form action="/tools" className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-lg border border-[#dfe4dd] bg-[#f6f7f4] px-4 py-3">
            <Search size={20} className="text-[#0d6b57]" />
            <input
              name="q"
              defaultValue={q}
              className="w-full bg-transparent text-base outline-none placeholder:text-[#8a938d]"
              placeholder="Hledat podle nazvu, pouziti nebo kategorie"
            />
          </label>
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="pricing" value={pricing} />
          <button className="rounded-lg bg-[#145238] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0f3f2b]">
            Hledat
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterLink
            active={category === "all"}
            href={buildHref(currentParams, { category: "all" })}
            label="Vsechny kategorie"
          />
          {categories.map((option) => (
            <FilterLink
              key={option}
              active={category === option}
              href={buildHref(currentParams, { category: option })}
              label={option}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <FilterLink
            active={pricing === "all"}
            href={buildHref(currentParams, { pricing: "all" })}
            label="Vsechny ceny"
          />
          {toolPricingOptions.map((option) => (
            <FilterLink
              key={option}
              active={pricing === option}
              href={buildHref(currentParams, { pricing: option })}
              label={pricingLabels[option]}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-[#65716b]">
        Zobrazeno {tools.length} z {allTools.length} nastroju.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {tools.length > 0 ? (
          tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
        ) : (
          <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 text-sm text-[#65716b] lg:col-span-2">
            Pro vybrane filtry zatim neni zadny nastroj.
          </div>
        )}
      </div>
    </section>
  );
}
