import { SectionHeading } from "@/components/section-heading";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/lib/demo-data";

export default function ToolsPage() {
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
