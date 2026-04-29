import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { scoreLabel } from "@/lib/format";
import type { NewsItem } from "@/lib/types";
import { TopicBadge } from "./topic-badge";

export function NewsListItem({ item }: { item: NewsItem }) {
  const articleUrl = item.url ?? item.sourceUrl;

  return (
    <article className="grid gap-4 border-b border-[#edf0ec] px-4 py-4 last:border-b-0 lg:grid-cols-[88px_1fr_160px] lg:items-start">
      <div className="flex items-center gap-2 lg:block">
        <div className="w-fit rounded-lg bg-[#eef6f1] px-3 py-2 text-lg font-semibold text-[#145238]">
          {item.score}
        </div>
        <p className="text-xs font-medium text-[#68716c] lg:mt-2">
          {scoreLabel(item.score)}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <TopicBadge topic={item.topic} />
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#f0f2ef] px-2.5 py-1 text-xs font-medium text-[#59645e] hover:bg-[#e4e8e3]"
          >
            {item.source}
          </a>
          <span className="text-xs text-[#68716c]">{item.publishedAt}</span>
          {item.status === "new" ? (
            <span className="rounded-lg bg-[#fff0bd] px-2.5 py-1 text-xs font-semibold text-[#684900]">
              ceka na AI
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 max-w-4xl text-base font-semibold leading-6 text-[#1d211f]">
          <Link href={`/news/${item.id}`} className="hover:underline">
            {item.title}
          </Link>
        </h3>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#4f5d55]">
          {item.summary}
        </p>
        {item.semanticSnippet ? (
          <p className="mt-2 max-w-4xl rounded-lg bg-[#f6f7f4] px-3 py-2 text-sm leading-6 text-[#40524b]">
            Nalezeno v kontextu: {item.semanticSnippet}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-[#dfe4dd] px-2.5 py-1 text-xs text-[#59645e]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <span className="text-xs text-[#68716c]">{item.readTime}</span>
        <Link
          href={`/news/${item.id}`}
          className="rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
        >
          Detail
        </Link>
        <a
          href={articleUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
        >
          Zdroj
          <ExternalLink size={15} />
        </a>
      </div>
    </article>
  );
}
