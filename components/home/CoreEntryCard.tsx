import Link from "next/link";

interface Chip {
  label: string;
  href: string;
}

export function CoreEntryCard({
  href,
  icon,
  title,
  desc,
  example,
  chips,
  spanClass = "",
  delayClass = "",
}: {
  href?: string;
  icon: string;
  title: string;
  desc: string;
  example?: string;
  chips?: Chip[];
  spanClass?: string;
  delayClass?: string;
}) {
  const inner = (
    <>
      <div className="flex w-full items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose/15 text-2xl">
          {icon}
        </span>
        <span className="translate-x-1 text-muted opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
          →
        </span>
      </div>
      <h2 className="mt-4 font-serif text-xl font-medium">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
      {example && (
        <p className="mt-3 rounded-2xl bg-blush/60 px-3 py-2 text-xs text-ink/70">
          {example}
        </p>
      )}
      {chips && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {chips.map((c) => (
            <span
              key={c.label}
              className="rounded-full bg-blush/70 px-3 py-1.5 text-ink/80"
            >
              {c.label}
            </span>
          ))}
        </div>
      )}
    </>
  );

  const base =
    "card-hover group flex flex-col items-start rounded-4xl border border-white/60 bg-white/75 p-6 text-left shadow-card backdrop-blur animate-fadeUp " +
    spanClass +
    " " +
    delayClass;

  if (chips && chips.length > 0) {
    // 带子入口的卡片：整体不作为单一链接，子项各自跳转
    return (
      <div className={base}>
        {inner}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-full bg-peach/30 px-3 py-1.5 font-medium text-ink/80 transition hover:bg-peach/50"
            >
              {c.label} →
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link href={href ?? "#"} className={base}>
      {inner}
    </Link>
  );
}
