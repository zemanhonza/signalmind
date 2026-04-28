import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-[#dfe4dd] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#65716b]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#1d211f]">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${accent}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#65716b]">{detail}</p>
    </div>
  );
}
