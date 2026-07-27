"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { saveModuleResult } from "@/lib/db";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import type { WorkoutResult } from "@/types";

export default function WorkoutPage() {
  const prefs = useAppStore((s) => s.prefs);
  const loaded = useAppStore((s) => s.loaded);
  const loadPrefs = useAppStore((s) => s.loadPrefs);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkoutResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { if (!loaded) loadPrefs(); }, [loaded, loadPrefs]);

  async function run() {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "workout",
          input: "今天适合什么运动？",
          context: {
            prefs: { goal: prefs?.goal, workoutDaysPerWeek: prefs?.workoutDaysPerWeek },
          },
        }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() || "";
        for (const frame of frames) {
          if (!frame.startsWith("data: ")) continue;
          const evt = JSON.parse(frame.slice(6));
          if (evt.type === "result") {
            const r = evt.result as WorkoutResult;
            setResult(r);
            saveModuleResult("workout", r);
          } else if (evt.type === "error") {
            setError(evt.error || "生成失败了，稍后再试一次～");
          }
        }
      }
    } catch { setError("生成失败了，稍后再试一次～"); }
    finally { setLoading(false); }
  }

  const goalLabels: Record<string, string> = {
    fat_loss: "减脂", tone: "塑形", muscle_gain: "增肌", keep_healthy: "保持健康",
  };

  return (
    <PageShell title="今日运动">
      {prefs ? (
        <Card className="p-5">
          <div className="flex flex-wrap gap-2 text-sm text-muted">
            <span className="rounded-full bg-rose/15 px-3 py-1 text-rose">🎯 {goalLabels[prefs.goal] || prefs.goal}</span>
            <span className="rounded-full bg-sky/15 px-3 py-1 text-sky">📅 每周 {prefs.workoutDaysPerWeek} 天</span>
          </div>
          <p className="mt-4 text-sm text-muted">每天打开即可获得今天的训练推荐，无需重复配置。</p>
          <button onClick={run} disabled={loading} className="mt-4 w-full rounded-2xl bg-rose/90 py-3 font-medium text-white shadow-card transition hover:bg-rose disabled:opacity-60">
            {loading ? "生成中…" : "获取今日训练"}
          </button>
          {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
        </Card>
      ) : (
        <Card className="p-5 text-center">
          <p className="text-muted">还没设置运动偏好，先去设置一下吧～</p>
          <Link href="/onboarding" className="mt-4 inline-block rounded-2xl bg-rose/90 px-6 py-3 font-medium text-white shadow-card transition hover:bg-rose">
            去设置
          </Link>
        </Card>
      )}

      {loading && !result && (
        <Card className="mt-4 animate-pulse p-6 text-center text-muted">正在为你搭配今天的运动…</Card>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="font-serif text-lg font-medium">💪 今日训练</h3>
            <ul className="mt-3 divide-y divide-blush/50">
              {result.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink/90">{item.name}</p>
                    {item.reps && <p className="mt-0.5 text-xs text-muted">{item.reps}</p>}
                  </div>
                  <span className="shrink-0 rounded-full bg-rose/15 px-2.5 py-1 text-xs font-medium text-terracotta">
                    {item.durationMin} min
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-2xl bg-sky/10 px-4 py-3 text-center text-sm text-sky font-medium">
              总时长约 {result.totalMin} 分钟
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-serif text-lg font-medium">🧘 拉伸建议</h3>
            <ul className="mt-3 space-y-1.5">
              {result.stretch.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-ink/85">
                  <span className="mt-0.5 text-sage">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
