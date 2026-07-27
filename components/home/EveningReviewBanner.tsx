import Link from "next/link";

export function EveningReviewBanner({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-4 rounded-4xl border border-terracotta/30 bg-gradient-to-r from-blush/80 to-peach/50 p-5 text-left shadow-card backdrop-blur transition hover:shadow-soft"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-2xl shadow-card">
        🌙
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg font-medium">晚间复盘</h2>
          <span className="rounded-full bg-terracotta/90 px-2 py-0.5 text-[10px] font-medium text-white">
            傍晚推荐
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink/75">
          睡前一句话，AI 帮你轻轻总结今天、温柔开启明天。
        </p>
      </div>
      <span className="text-xl text-terracotta">→</span>
    </Link>
  );
}
