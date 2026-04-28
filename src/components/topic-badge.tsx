import type { Topic } from "@/lib/types";

const topicStyles: Record<Topic, string> = {
  "AI obecne": "bg-[#e8eefc] text-[#243d7a]",
  Medicina: "bg-[#dff6ea] text-[#145238]",
  Vzdelavani: "bg-[#fff0bd] text-[#684900]",
  Vyzkum: "bg-[#eee4ff] text-[#4b2b79]",
  Nastroje: "bg-[#dff5fb] text-[#0d5264]",
  Regulace: "bg-[#ffe2dd] text-[#7a261a]",
  Bezpecnost: "bg-[#e7e7e0] text-[#3f433d]",
};

export function TopicBadge({ topic }: { topic: Topic }) {
  return (
    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${topicStyles[topic]}`}>
      {topic}
    </span>
  );
}
