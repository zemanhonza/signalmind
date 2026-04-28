import { ExternalLink } from "lucide-react";

import { scoreLabel } from "@/lib/format";
import type { NewsItem } from "@/lib/types";
import { TopicBadge } from "./topic-badge";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <TopicBadge topic={item.topic} />
          <span className="rounded-lg bg-[#f0f2ef] px-2.5 py-1 text-xs font-medium text-[#59645e]">
            {item.source}
          </span>
          <span className="text-xs text-[#68716c]">{item.publishedAt}</span>
          <span className="text-xs text-[#68716c]">{item.readTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#145238]">
          <span>{item.score}</span>
          <span className="text-xs font-medium text-[#68716c]">
            {scoreLabel(item.score)}
          </span>
        </div>
      </div>

      <h3 className="mt-4 max-w-3xl text-lg font-semibold leading-7 text-[#1d211f]">
        {item.title}
      </h3>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-[#4f5d55]">
        {item.summary}
      </p>
      <p className="mt-3 max-w-4xl border-l-2 border-[#37b981] pl-3 text-sm leading-6 text-[#40524b]">
        {item.whyItMatters}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-[#dfe4dd] px-2.5 py-1 text-xs text-[#59645e]"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={item.url ?? item.sourceUrl}
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
