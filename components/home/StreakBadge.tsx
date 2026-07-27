export function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="hidden items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs text-muted shadow-card sm:flex">
      <span className="text-rose">🔥</span>
      连续打开 <span className="font-medium text-ink">{streak}</span> 天
    </div>
  );
}
