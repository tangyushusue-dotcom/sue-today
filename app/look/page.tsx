"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { saveModuleResult } from "@/lib/db";
import { generateClient, getWeatherClient } from "@/lib/ai-client";
import { parseSSEStream } from "@/lib/sse-helper";
import { useAppStore } from "@/lib/store";
import type { LookResult } from "@/types";

const SCENES = ["上班", "约会", "面试", "旅行", "逛街", "宅家"];

export default function LookPage() {
  const prefs = useAppStore((s) => s.prefs);
  const loaded = useAppStore((s) => s.loaded);
  const loadPrefs = useAppStore((s) => s.loadPrefs);

  const [scene, setScene] = useState("上班");
  const [customScene, setCustomScene] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookResult | null>(null);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState<{ temp: number; desc: string } | null>(null);

  useEffect(() => { if (!loaded) loadPrefs(); }, [loaded, loadPrefs]);

  // 自动获取天气（客户端 mock）
  useEffect(() => {
    const city = prefs?.city || "上海";
    getWeatherClient(city).then(setWeather);
  }, [prefs?.city]);

  async function run() {
    const s = customScene.trim() || scene;
    setLoading(true); setError(""); setResult(null);
    try {
      const stream = await generateClient("look", s, {
        weather: weather ?? undefined,
        prefs: { city: prefs?.city },
      });
      await parseSSEStream<LookResult>(stream, (r) => {
        setResult(r);
        saveModuleResult("look", r);
      }, setError);
    } catch { setError("生成失败了，稍后再试一次～"); }
    finally { setLoading(false); }
  }

  return (
    <PageShell title="今日形象">
      <Card className="p-5">
        <label className="text-sm text-muted">今天是什么场景？</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENES.map((s) => (
            <button
              key={s}
              onClick={() => { setScene(s); setCustomScene(""); }}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                scene === s && !customScene
                  ? "bg-rose/30 font-medium text-ink"
                  : "bg-blush/70 text-ink/80 hover:bg-blush"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          value={customScene}
          onChange={(e) => setCustomScene(e.target.value)}
          placeholder="或自己写一个场景…"
          className="mt-3 w-full rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-rose/50"
        />

        {weather && (
          <p className="mt-3 rounded-2xl bg-sky/10 px-3 py-2 text-xs text-muted">
            🌤 {prefs?.city || "上海"} · {weather.desc} {weather.temp}°C（已自动关联天气）
          </p>
        )}

        <button onClick={run} disabled={loading} className="mt-4 w-full rounded-2xl bg-rose/90 py-3 font-medium text-white shadow-card transition hover:bg-rose disabled:opacity-60">
          {loading ? "生成中…" : "帮我看看今天怎么穿"}
        </button>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
      </Card>

      {loading && !result && (
        <Card className="mt-4 animate-pulse p-6 text-center text-muted">正在为你搭配今天的形象…</Card>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">👗 穿搭建议</h3>
              <p className="mt-3 leading-relaxed text-ink/85">{result.outfit}</p>
            </Card>
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">🎨 配色建议</h3>
              <p className="mt-3 leading-relaxed text-ink/85">{result.color}</p>
            </Card>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">💇 发型建议</h3>
              <p className="mt-3 leading-relaxed text-ink/85">{result.hair}</p>
            </Card>
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">✨ 神态提醒</h3>
              <p className="mt-3 leading-relaxed text-ink/85">{result.demeanor}</p>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
