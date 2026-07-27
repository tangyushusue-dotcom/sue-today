export function ComingSoon({ note }: { note?: string }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-4xl border border-white/60 bg-white/75 p-10 text-center shadow-card backdrop-blur">
      <span className="text-4xl">🌱</span>
      <p className="mt-4 font-serif text-lg text-ink">这个空间正在生长中</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        {note ?? "功能将在后续 Sprint 接入，先让它陪你从首页开始每一天。"}
      </p>
    </div>
  );
}
