import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { scoreLabel } from "@/lib/format";
import type { NewsItem } from "@/lib/types";
import { TopicBadge } from "./topic-badge";

export function NewsCard({ item }: { item: NewsItem }) {
  const articleUrl = item.url ?? item.sourceUrl;

  return (
    <article className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm transition hover:border-[#c9d3cd]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <TopicBadge topic={item.topic} />
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#f0f2ef] px-2.5 py-1 text-xs font-medium text-[#59645e] hover:bg-[#e4e8e3] hover:text-[#1d211f]"
          >
            {item.source}
          </a>
          <span className="text-xs text-[#68716c]">{item.publishedAt}</span>
          <span className="text-xs text-[#68716c]">{item.readTime}</span>
          {item.status === "new" ? (
            <span className="rounded-lg bg-[#fff0bd] px-2.5 py-1 text-xs font-semibold text-[#684900]">
              ceka na AI
            </span>
          ) : null}
        </div>
        <div className="rounded-lg bg-[#eef6f1] px-3 py-2 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#68716c]">
            Relevance
          </p>
          <div className="mt-1 flex items-baseline justify-end gap-2 text-[#145238]">
            <span className="text-lg font-semibold">{item.score}</span>
            <span className="text-xs font-medium text-[#68716c]">
              {scoreLabel(item.score)}
            </span>
          </div>
        </div>
      </div>

      <h3 className="mt-4 max-w-3xl text-lg font-semibold leading-7 text-[#1d211f]">
        <Link href={`/news/${item.id}`} className="hover:underline">
          {item.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-[#4f5d55]">
        {item.summary}
      </p>
      <p className="mt-3 max-w-4xl border-l-2 border-[#37b981] pl-3 text-sm leading-6 text-[#40524b]">
        {item.whyItMatters}
      </p>
      {item.semanticSnippet ? (
        <p className="mt-3 max-w-4xl rounded-lg bg-[#f6f7f4] px-3 py-2 text-sm leading-6 text-[#40524b]">
          Nalezeno v kontextu: {item.semanticSnippet}
        </p>
      ) : null}

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
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/news/${item.id}`}
            className="text-sm font-semibold text-[#0d6b57] hover:underline"
          >
            Detail
          </Link>
          <a
            href={articleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d6b57] hover:underline"
          >
            Otevrit zdroj
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
