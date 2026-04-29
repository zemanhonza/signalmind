import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { NewsListItem } from "@/components/news-list-item";
import { SectionHeading } from "@/components/section-heading";
import { TopicBadge } from "@/components/topic-badge";
import { getNewsItem, getRelatedNews } from "@/lib/data";
import { scoreLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [item, related] = await Promise.all([
    getNewsItem(id),
    getRelatedNews(id, 5),
  ]);

  if (!item) notFound();

  const articleUrl = item.url ?? item.sourceUrl;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#65716b]">
        <Link href="/news" className="font-semibold text-[#0d6b57] hover:underline">
          Clanky
        </Link>
        <span>/</span>
        <span>{item.source}</span>
      </div>

      <article className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm lg:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              <span className="text-xs text-[#68716c]">{item.readTime}</span>
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[#1d211f]">
              {item.title}
            </h1>
            {item.originalTitle !== item.title ? (
              <p className="mt-3 max-w-4xl text-sm leading-6 text-[#65716b]">
                Puvodni titulek: {item.originalTitle}
              </p>
            ) : null}
          </div>

          <div className="w-fit rounded-lg bg-[#eef6f1] px-4 py-3 text-[#145238]">
            <p className="text-3xl font-semibold">{item.score}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#68716c]">
              relevance
            </p>
            <p className="mt-1 text-xs font-semibold">{scoreLabel(item.score)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-4">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#68716c]">
                Shrnuti
              </h2>
              <p className="mt-2 text-base leading-7 text-[#40524b]">
                {item.longSummary}
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#68716c]">
                Proc je to dulezite
              </h2>
              <p className="mt-2 border-l-2 border-[#37b981] pl-4 text-base leading-7 text-[#40524b]">
                {item.whyItMatters}
              </p>
            </section>

            {item.rawExcerpt ? (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#68716c]">
                  Excerpt
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#4f5d55]">
                  {item.rawExcerpt}
                </p>
              </section>
            ) : null}
          </div>

          <aside className="grid h-fit gap-3 rounded-lg border border-[#dfe4dd] bg-[#f6f7f4] p-4">
            <a
              href={articleUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145238] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0f3f2b]"
            >
              Otevrit puvodni zdroj
              <ExternalLink size={16} />
            </a>
            <Link
              href={`/news?topic=${encodeURIComponent(item.topic)}`}
              className="rounded-lg border border-[#dfe4dd] bg-white px-4 py-3 text-center text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
            >
              Stejne tema
            </Link>
            <div className="flex flex-wrap gap-2 pt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-[#dfe4dd] bg-white px-2.5 py-1 text-xs text-[#59645e]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </article>

      <section>
        <SectionHeading eyebrow="Souvislosti" title="Podobne clanky" />
        <div className="overflow-hidden rounded-lg border border-[#dfe4dd] bg-white shadow-sm">
          {related.length > 0 ? (
            related.map((relatedItem) => (
              <NewsListItem key={relatedItem.id} item={relatedItem} />
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-[#65716b]">
              Podobne clanky se doplni, jakmile bude v archivu vice embeddingu.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
