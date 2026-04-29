import Link from "next/link";
import { Search } from "lucide-react";

import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { getRecentNews, getSearchResults } from "@/lib/data";

const queries = [
  "AI v radiologii za posledni mesic",
  "nastroje pro ucitele mediciny",
  "agentni evaluace a monitoring",
  "regulace AI zdravotnickych prostredku",
];

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const q = firstParam(params.q) ?? "";
  const results = q ? await getSearchResults(q, 10) : null;
  const newsItems = results?.items ?? (await getRecentNews(4));

  return (
    <section className="grid gap-6">
      <SectionHeading eyebrow="Archiv" title="Vyhledavani v archivu" />
      <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm">
        <form action="/search" className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-lg border border-[#dfe4dd] bg-[#f6f7f4] px-4 py-3">
            <Search size={20} className="text-[#0d6b57]" />
            <input
              name="q"
              defaultValue={q}
              className="w-full bg-transparent text-base outline-none placeholder:text-[#8a938d]"
              placeholder="Zadej dotaz nad AI novinkami, nastroji a vyzkumem"
            />
          </label>
          <button className="rounded-lg bg-[#145238] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0f3f2b]">
            Hledat
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {queries.map((query) => (
            <Link
              key={query}
              href={`/search?q=${encodeURIComponent(query)}`}
              className="rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm text-[#40524b]"
            >
              {query}
            </Link>
          ))}
        </div>
      </div>
      {q ? (
        <div className="grid gap-2">
          <p className="text-sm text-[#65716b]">
            {results?.mode === "semantic" ? "Semanticke hledani" : "Textove hledani"} naslo{" "}
            {results?.total ?? 0} vysledku pro dotaz &quot;{q}&quot;.
          </p>
          {results?.message ? (
            <p className="rounded-lg border border-[#dfe4dd] bg-[#fffdf3] px-3 py-2 text-sm text-[#684900]">
              {results.message}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-4">
        {newsItems.length > 0 ? (
          newsItems.map((item) => <NewsCard key={item.id} item={item} />)
        ) : (
          <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 text-sm text-[#65716b]">
            Pro zadany dotaz zatim nic nenachazim.
          </div>
        )}
      </div>
    </section>
  );
}
