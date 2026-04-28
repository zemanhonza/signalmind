import { Search } from "lucide-react";

import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { getRecentNews } from "@/lib/data";

const queries = [
  "AI v radiologii za posledni mesic",
  "nastroje pro ucitele mediciny",
  "agentni evaluace a monitoring",
  "regulace AI zdravotnickych prostredku",
];

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const newsItems = await getRecentNews(8);

  return (
    <section className="grid gap-6">
      <SectionHeading eyebrow="Semantic search" title="Vyhledavani v archivu" />
      <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm">
        <label className="flex items-center gap-3 rounded-lg border border-[#dfe4dd] bg-[#f6f7f4] px-4 py-3">
          <Search size={20} className="text-[#0d6b57]" />
          <input
            className="w-full bg-transparent text-base outline-none placeholder:text-[#8a938d]"
            placeholder="Zadej dotaz nad AI novinkami, nastroji a vyzkumem"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {queries.map((query) => (
            <span
              key={query}
              className="rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm text-[#40524b]"
            >
              {query}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        {newsItems.slice(0, 2).map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
