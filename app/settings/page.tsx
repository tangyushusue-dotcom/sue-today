"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";
import type { Goal } from "@/types";

const GOALS: { key: Goal; label: string; emoji: string }[] = [
  { key: "fat_loss", label: "减脂", emoji: "🔥" },
  { key: "tone", label: "塑形", emoji: "💃" },
  { key: "muscle_gain", label: "增肌", emoji: "💪" },
  { key: "keep_healthy", label: "保持健康", emoji: "🌸" },
];
const DAYS = [1, 2, 3, 4, 5, 6, 7];
const CITIES = ["上海", "北京", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安"];

export default function SettingsPage() {
  const prefs = useAppStore((s) => s.prefs);
  const loaded = useAppStore((s) => s.loaded);
  const loadPrefs = useAppStore((s) => s.loadPrefs);
  const savePrefs = useAppStore((s) => s.savePrefs);

  const [goal, setGoal] = useState<Goal>("keep_healthy");
  const [days, setDays] = useState(3);
  const [city, setCity] = useState("上海");
  const [customCity, setCustomCity] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loaded) loadPrefs();
    if (prefs) {
      setGoal(prefs.goal);
      setDays(prefs.workoutDaysPerWeek);
      setCity(prefs.city);
    }
  }, [loaded, loadPrefs, prefs]);

  const actualCity = customCity.trim() || city;

  async function save() {
    await savePrefs({ goal, workoutDaysPerWeek: days, city: actualCity });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageShell title="设置">
      {prefs && (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-serif text-lg font-medium">🎯 运动目标</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button key={g.key} onClick={() => setGoal(g.key)} className={`rounded-full px-4 py-2 text-sm transition ${goal === g.key ? "bg-rose/30 font-medium text-ink" : "bg-blush/70 text-ink/80 hover:bg-blush"}`}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-lg font-medium">📅 每周运动天数</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button key={d} onClick={() => setDays(d)} className={`grid h-10 w-10 place-items-center rounded-full text-sm transition ${days === d ? "bg-rose/30 font-medium text-ink" : "bg-blush/70 text-ink/80 hover:bg-blush"}`}>
                  {d}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-lg font-medium">📍 所在城市</h2>
            <p className="mt-1 text-xs text-muted">用于自动获取天气</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button key={c} onClick={() => { setCity(c); setCustomCity(""); }} className={`rounded-full px-3 py-1.5 text-sm transition ${actualCity === c ? "bg-rose/30 font-medium text-ink" : "bg-blush/70 text-ink/80 hover:bg-blush"}`}>
                  {c}
                </button>
              ))}
            </div>
            <input value={customCity} onChange={(e) => setCustomCity(e.target.value)} placeholder="或输入其他城市…" className="mt-3 w-full rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-rose/50" />
          </Card>

          <button onClick={save} className="w-full rounded-2xl bg-rose/90 py-3 font-medium text-white shadow-card transition hover:bg-rose">
            {saved ? "已保存 ✅" : "保存设置"}
          </button>

          <p className="text-center text-xs text-muted">
            也可以 <Link href="/onboarding" className="underline hover:text-ink">重新走一遍引导</Link>
          </p>
        </div>
      )}
    </PageShell>
  );
}
