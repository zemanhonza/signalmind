import Link from "next/link";
import {
  Activity,
  Database,
  Newspaper,
  ScanSearch,
  Sparkles,
  Wrench,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { ToolCard } from "@/components/tool-card";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {
    activeSourceCount,
    digests,
    itemCounts,
    news,
    tools,
    topicStats,
    topScore,
  } = await getDashboardData();
  const topDigest = digests[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Zdroje"
          value={String(activeSourceCount)}
          detail="Aktivni zdroje v Supabase napric laboratoremi, vyzkumem, medicinou a vzdelavanim."
          icon={Database}
          accent="bg-[#dff6ea] text-[#145238]"
          href="/sources"
        />
        <MetricCard
          label="Archiv clanku"
          value={String(itemCounts.total)}
          detail={`${itemCounts.summarized} zpracovano AI, ${itemCounts.queued} ceka na ceske shrnuti.`}
          icon={Newspaper}
          accent="bg-[#e8eefc] text-[#243d7a]"
          href="/news"
        />
        <MetricCard
          label="AI nastroje"
          value={String(tools.length)}
          detail="Katalog bude ukladat cenu, pouziti, kategorii a souvisejici odkazy."
          icon={Wrench}
          accent="bg-[#dff5fb] text-[#0d5264]"
          href="/tools"
        />
        <MetricCard
          label="Prioritni signal"
          value={String(topScore)}
          detail="Skore bude postupne doplnovat AI zpracovani a kuratorska pravidla."
          icon={Sparkles}
          accent="bg-[#fff0bd] text-[#684900]"
          href="/ai"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68716c]">
                Dnesni digest
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1d211f]">
                {topDigest.title}
              </h2>
              <p className="mt-2 text-sm text-[#65716b]">{topDigest.focus}</p>
            </div>
            <Link
              href="/digests"
              className="inline-flex items-center gap-2 rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
            >
              Archiv
              <ScanSearch size={16} />
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {topDigest.items.map((item) => (
              <div
                key={item}
                className="border-l-2 border-[#37b981] bg-[#f7faf8] px-4 py-3 text-sm leading-6 text-[#40524b]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68716c]">
                Temata
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#1d211f]">
                Poslednich 7 dni
              </h2>
            </div>
            <Activity className="text-[#0d6b57]" size={22} />
          </div>
          <div className="mt-5 grid gap-4">
            {topicStats.map((topic) => (
              <Link key={topic.label} href={`/news?topic=${encodeURIComponent(topic.label)}`}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#40524b]">{topic.label}</span>
                  <span className="text-[#65716b]">{topic.value}</span>
                </div>
                <div className="h-2 rounded-lg bg-[#edf0ec]">
                  <div
                    className={`h-2 rounded-lg ${topic.accent}`}
                    style={{ width: `${Math.min(topic.value * 3, 100)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Kuratorovany proud"
          title="Nejdulezitejsi signaly"
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/news"
                className="rounded-lg border border-[#dfe4dd] bg-white px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
              >
                Vsechny clanky
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-[#dfe4dd] bg-white px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
              >
                Vyhledat souvislosti
                <ScanSearch size={16} />
              </Link>
            </div>
          }
        />
        <div className="grid gap-4">
          {news.length > 0 ? (
            news.map((item) => <NewsCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-lg border border-[#dfe4dd] bg-white p-5 text-sm text-[#65716b]">
              Zatim nejsou k dispozici AI zpracovane clanky.
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Katalog"
          title="AI nastroje k provereni"
          action={
            <Link
              href="/tools"
              className="rounded-lg border border-[#dfe4dd] bg-white px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
            >
              Vsechny nastroje
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {tools.slice(0, 4).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
