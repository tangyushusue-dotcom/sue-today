const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/** 按真实时间返回问候语 */
export function getGreeting(hour: number): string {
  if (hour < 5) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

/** 格式化为「2025年7月27日 · 星期日」 */
export function formatDateLabel(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${WEEKDAYS[d.getDay()]}`;
}

/** 本地日期主键 YYYY-MM-DD */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 返回往前 n 天的日期主键（n=0 为今天） */
export function dayKeyOffset(offset: number, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() - offset);
  return todayKey(d);
}

/**
 * 计算连续打开天数：基于已打开的日期集合，
 * 若今天或昨天有记录，则向前数连续天数；否则为 0。
 */
export function computeStreak(openedDates: Set<string>): number {
  const today = todayKey();
  const yesterday = dayKeyOffset(1);
  if (!openedDates.has(today) && !openedDates.has(yesterday)) return 0;

  let streak = 0;
  // 从今天往前数；若今天还没记录则从昨天开始
  let cursor = openedDates.has(today) ? 0 : 1;
  while (openedDates.has(dayKeyOffset(cursor))) {
    streak += 1;
    cursor += 1;
  }
  return streak;
}
