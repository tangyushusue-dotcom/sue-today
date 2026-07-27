import Dexie, { type Table } from "dexie";
import type { UserPrefs, DailyRecord, ModuleKey, PlannerTodo } from "@/types";
import { todayKey } from "@/lib/time";

class HerTodayDB extends Dexie {
  prefs!: Table<UserPrefs, string>;
  daily!: Table<DailyRecord, string>;

  constructor() {
    super("her-today");
    this.version(2).stores({
      prefs: "id",
      daily: "date",
    });
  }
}

export const db = new HerTodayDB();

export async function getPrefs(): Promise<UserPrefs | undefined> {
  if (typeof window === "undefined") return undefined;
  return db.prefs.get("me");
}

export async function savePrefs(p: UserPrefs): Promise<void> {
  if (typeof window === "undefined") return;
  await db.prefs.put(p);
}

export async function getDaily(date: string): Promise<DailyRecord | undefined> {
  if (typeof window === "undefined") return undefined;
  return db.daily.get(date);
}

export async function saveDaily(r: DailyRecord): Promise<void> {
  if (typeof window === "undefined") return;
  await db.daily.put(r);
}

export async function getAllDaily(): Promise<DailyRecord[]> {
  if (typeof window === "undefined") return [];
  return db.daily.toArray();
}

export async function saveModuleResult(
  module: ModuleKey,
  result: unknown
): Promise<void> {
  if (typeof window === "undefined") return;
  const date = todayKey();
  const existing = await getDaily(date);
  const record: DailyRecord = existing ?? { date, openedAt: Date.now() };
  const key = module as string;
  (record as unknown as Record<string, unknown>)[key] = result;
  await saveDaily(record);
}

/** 获取今天的 Todo 列表 */
export async function getTodayTodos(): Promise<PlannerTodo[]> {
  if (typeof window === "undefined") return [];
  const daily = await getDaily(todayKey());
  return daily?.todos ?? [];
}

/** 保存今天的 Todo 列表 */
export async function saveTodayTodos(todos: PlannerTodo[]): Promise<void> {
  if (typeof window === "undefined") return;
  const date = todayKey();
  const existing = await getDaily(date);
  const record: DailyRecord = existing ?? { date, openedAt: Date.now() };
  record.todos = todos;
  await saveDaily(record);
}
