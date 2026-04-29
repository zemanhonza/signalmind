import Link from "next/link";
import { Filter, Search } from "lucide-react";

import { NewsListItem } from "@/components/news-list-item";
import { SectionHeading } from "@/components/section-heading";
import { getNewsArchive, topicOptions } from "@/lib/data";
import type { NewsStatus, Topic } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusOptions: Array<{ value: NewsStatus | "all"; label: string }> = [
  { value: "summarized", label: "AI zpracovane" },
  { value: "new", label: "Ceka na AI" },
  { value: "all", label: "Vse" },
];

const sortOptions = [
  { value: "newest", label: "Nejnovejsi" },
  { value: "score", label: "Nejvyssi relevance" },
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref(
  params: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...params, ...updates })) {
    if (value && value !== "all" && !(key === "page" && value === "1")) {
      next.set(key, value);
    }
  }

  const query = next.toString();
  return query ? `/news?${query}` : "/news";
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

export default async function NewsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const q = firstParam(params.q) ?? "";
  const topic = (firstParam(params.topic) ?? "all") as Topic | "all";
  const status = (firstParam(params.status) ?? "summarized") as NewsStatus | "all";
  const sort = (firstParam(params.sort) ?? "newest") as "newest" | "score";
  const page = pageNumber(firstParam(params.page));

  const archive = await getNewsArchive({
    query: q,
    topic,
    status,
    sort,
    page,
    pageSize: 20,
  });

  const currentParams = {
    q: q || undefined,
    topic,
    status,
    sort,
    page: String(page),
  };

  return (
    <section className="grid gap-5">
      <SectionHeading
        eyebrow="Archiv"
        title="Clanky a relevance"
        action={
          <Link
            href="/ai"
            className="rounded-lg border border-[#dfe4dd] bg-white px-3 py-2 text-sm font-semibold text-[#0d6b57] hover:bg-[#f2f7f4]"
          >
            Stav AI zpracovani
          </Link>
        }
      />

      <div className="rounded-lg border border-[#dfe4dd] bg-white p-4 shadow-sm">
        <form action="/news" className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-lg border border-[#dfe4dd] bg-[#f6f7f4] px-4 py-3">
            <Search size={20} className="text-[#0d6b57]" />
            <input
              name="q"
              defaultValue={q}
              className="w-full bg-transparent text-base outline-none placeholder:text-[#8a938d]"
              placeholder="Hledat v titulcich, shrnutich, zdrojich a stitcich"
            />
          </label>
          <input type="hidden" name="topic" value={topic} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="sort" value={sort} />
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145238] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0f3f2b]">
            <Filter size={16} />
            Filtrovat
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <FilterLink
              key={option.value}
              active={status === option.value}
              href={buildHref(currentParams, { status: option.value, page: "1" })}
              label={option.label}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <FilterLink
            active={topic === "all"}
            href={buildHref(currentParams, { topic: "all", page: "1" })}
            label="Vsechna temata"
          />
          {topicOptions.map((option) => (
            <FilterLink
              key={option}
              active={topic === option}
              href={buildHref(currentParams, { topic: option, page: "1" })}
              label={option}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <FilterLink
              key={option.value}
              active={sort === option.value}
              href={buildHref(currentParams, { sort: option.value, page: "1" })}
              label={option.label}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#dfe4dd] bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-[#dfe4dd] bg-[#f2f5f1] px-4 py-3 text-sm text-[#65716b] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Zobrazeno {archive.items.length} z {archive.total}
          </span>
          <span>
            Strana {archive.page} / {archive.totalPages}
          </span>
        </div>

        {archive.items.length > 0 ? (
          archive.items.map((item) => <NewsListItem key={item.id} item={item} />)
        ) : (
          <div className="px-4 py-8 text-sm text-[#65716b]">
            Pro vybrane filtry zatim nejsou zadne clanky.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={buildHref(currentParams, { page: String(Math.max(1, page - 1)) })}
          className={`rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm font-semibold ${
            page <= 1
              ? "pointer-events-none bg-[#f0f2ef] text-[#9aa39d]"
              : "bg-white text-[#0d6b57] hover:bg-[#f2f7f4]"
          }`}
        >
          Predchozi
        </Link>
        <Link
          href={buildHref(currentParams, {
            page: String(Math.min(archive.totalPages, page + 1)),
          })}
          className={`rounded-lg border border-[#dfe4dd] px-3 py-2 text-sm font-semibold ${
            page >= archive.totalPages
              ? "pointer-events-none bg-[#f0f2ef] text-[#9aa39d]"
              : "bg-white text-[#0d6b57] hover:bg-[#f2f7f4]"
          }`}
        >
          Dalsi
        </Link>
      </div>
    </section>
  );
}
