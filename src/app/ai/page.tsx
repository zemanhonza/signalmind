import { Bot, Clock, Sparkles } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { getAiOverview } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const overview = await getAiOverview();

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Ceka na AI"
          value={String(overview.queuedCount)}
          detail="Polozky ve stavu new, ktere jeste nemaji ceske shrnuti a skore."
          icon={Clock}
          accent="bg-[#fff0bd] text-[#684900]"
        />
        <MetricCard
          label="Shrnuto"
          value={String(overview.summarizedCount)}
          detail="Polozky, ktere prosly AI sumarizaci, tematickym zarazenim a scoringem."
          icon={Bot}
          accent="bg-[#dff6ea] text-[#145238]"
        />
        <MetricCard
          label="Top signal"
          value={String(overview.topScored[0]?.score ?? 0)}
          detail="Nejvyssi aktualni skore mezi poslednimi nactenymi polozkami."
          icon={Sparkles}
          accent="bg-[#e8eefc] text-[#243d7a]"
        />
      </section>

      <section>
        <SectionHeading
          eyebrow="AI kurace"
          title="Nejvyssi skore a posledni shrnuti"
        />
        <div className="grid gap-4">
          {overview.topScored.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
