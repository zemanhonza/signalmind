import { ExternalLink } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { TopicBadge } from "@/components/topic-badge";
import { trustLabel } from "@/lib/format";
import { sources } from "@/lib/demo-data";

export default function SourcesPage() {
  return (
    <section>
      <SectionHeading eyebrow="Monitoring" title="Zdrojova mapa" />
      <div className="overflow-hidden rounded-lg border border-[#dfe4dd] bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr] gap-4 border-b border-[#dfe4dd] bg-[#f2f5f1] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#65716b]">
          <span>Zdroj</span>
          <span>Tema</span>
          <span>Duv.</span>
          <span>Status</span>
        </div>
        {sources.map((source) => (
          <div
            key={source.id}
            className="grid grid-cols-1 gap-3 border-b border-[#edf0ec] px-4 py-4 last:border-b-0 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr] md:items-center"
          >
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-[#1d211f] hover:underline"
            >
              {source.name}
              <ExternalLink size={15} className="text-[#0d6b57]" />
            </a>
            <TopicBadge topic={source.topic} />
            <span className="text-sm text-[#40524b]">
              {source.trustScore} / {trustLabel(source.trustScore)}
            </span>
            <span className="w-fit rounded-lg bg-[#f0f2ef] px-2.5 py-1 text-xs font-semibold text-[#40524b]">
              {source.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
