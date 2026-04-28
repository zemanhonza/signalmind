import { SectionHeading } from "@/components/section-heading";
import { ToolCard } from "@/components/tool-card";
import { getTools } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <section>
      <SectionHeading eyebrow="Katalog" title="AI nastroje" />
      <div className="grid gap-4 lg:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
