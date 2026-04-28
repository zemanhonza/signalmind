type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
};

export function SectionHeading({ eyebrow, title, action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68716c]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#1d211f]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
