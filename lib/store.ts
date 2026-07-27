import { create } from "zustand";
import type { UserPrefs, DailyRecord } from "@/types";
import { getPrefs, savePrefs, getDaily, saveDaily, getAllDaily } from "@/lib/db";
import { computeStreak, todayKey } from "@/lib/time";

interface AppState {
  prefs: UserPrefs | null;
  streak: number;
  loaded: boolean;
  loadPrefs: () => Promise<void>;
  savePrefs: (patch: Partial<UserPrefs>) => Promise<void>;
  recordOpenToday: () => Promise<void>;
}

const DEFAULT_PREFS: UserPrefs = {
  id: "me",
  goal: "keep_healthy",
  workoutDaysPerWeek: 3,
  city: "上海",
  theme: "light",
  reminderEnabled: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useAppStore = create<AppState>((set, get) => ({
  prefs: null,
  streak: 0,
  loaded: false,

  loadPrefs: async () => {
    const prefs = (await getPrefs()) ?? DEFAULT_PREFS;
    const all = await getAllDaily();
    const opened = new Set(all.map((r) => r.date));
    set({ prefs, streak: computeStreak(opened), loaded: true });
  },

  savePrefs: async (patch) => {
    const current = get().prefs ?? DEFAULT_PREFS;
    const next: UserPrefs = { ...current, ...patch, updatedAt: Date.now() };
    await savePrefs(next);
    set({ prefs: next });
  },

  recordOpenToday: async () => {
    const date = todayKey();
    const existing = await getDaily(date);
    const record: DailyRecord = existing
      ? { ...existing, openedAt: Date.now() }
      : { date, openedAt: Date.now() };
    await saveDaily(record);
    const all = await getAllDaily();
    const opened = new Set(all.map((r) => r.date));
    set({ streak: computeStreak(opened) });
  },
}));
