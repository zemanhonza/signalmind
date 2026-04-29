import { SectionHeading } from "@/components/section-heading";
import { getDigests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SummariesPage() {
  const digests = await getDigests();

  return (
    <section>
      <SectionHeading eyebrow="Archiv" title="Denni souhrny" />
      <div className="grid gap-4">
        {digests.map((digest) => (
          <article
            key={digest.id}
            className="rounded-lg border border-[#dfe4dd] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#65716b]">
                  {digest.date}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#1d211f]">
                  {digest.title}
                </h2>
              </div>
              <span className="rounded-lg bg-[#fff0bd] px-3 py-1.5 text-sm font-semibold text-[#684900]">
                {digest.focus}
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {digest.items.map((item) => (
                <p key={item} className="text-sm leading-6 text-[#40524b]">
                  {item}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
