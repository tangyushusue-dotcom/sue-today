"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { saveModuleResult, getDaily } from "@/lib/db";
import { generateClient } from "@/lib/ai-client";
import { parseSSEStream } from "@/lib/sse-helper";
import { todayKey } from "@/lib/time";
import type { ReviewResult, PlannerResult } from "@/types";

export default function ReviewPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [todayPlan, setTodayPlan] = useState<string>("");

  // 打开页面时读取今日计划，给 AI 做上下文（前端自动注入，用户无感）
  useEffect(() => {
    (async () => {
      const daily = await getDaily(todayKey());
      if (daily?.planner) {
        const p = daily.planner as PlannerResult;
        const lines = p.schedule.map((s) => `${s.time} ${s.title}`).join("；");
        setTodayPlan(`今天计划：${lines}`);
      }
    })();
  }, []);

  async function run() {
    const text = input.trim();
    if (!text) { setError("和我聊聊今天吧，哪怕一句话也好～"); return; }
    setLoading(true); setError(""); setResult(null); setSaved(false);

    // 自动注入今日计划上下文（用户无感）
    const ctxInput = todayPlan ? `${text}\n（${todayPlan}）` : text;

    try {
      const stream = await generateClient("review", ctxInput);
      await parseSSEStream<ReviewResult>(stream, (r) => {
        setResult(r);
        saveModuleResult("review", r);
        setSaved(true);
      }, setError);
    } catch { setError("生成失败了，稍后再试一次～"); }
    finally { setLoading(false); }
  }

  return (
    <PageShell title="晚间复盘">
      <Card className="p-5">
        <label className="text-sm text-muted">今天发生了什么？（一句话就好）</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="例：今天有点忙，但该做的都做了"
          className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 p-3 text-ink outline-none placeholder:text-muted/70 focus:border-rose/50"
        />
        {todayPlan && (
          <p className="mt-2 rounded-2xl bg-sky/10 px-3 py-2 text-xs text-muted">
            已自动关联今日计划，帮你更准确地复盘。
          </p>
        )}
        <button onClick={run} disabled={loading} className="mt-4 w-full rounded-2xl bg-rose/90 py-3 font-medium text-white shadow-card transition hover:bg-rose disabled:opacity-60">
          {loading ? "生成中…" : "帮我轻轻总结今天"}
        </button>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
        {saved && <p className="mt-2 text-xs text-sage">已保存到今天的记录里了 🌱</p>}
      </Card>

      {loading && !result && (
        <Card className="mt-4 animate-pulse p-6 text-center text-muted">正在倾听你的今天…</Card>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="font-serif text-lg font-medium">📝 今日小结</h3>
            <p className="mt-3 leading-relaxed text-ink/85">{result.summary}</p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">✅ 完成情况</h3>
              <p className="mt-3 leading-relaxed text-ink/85">{result.completion}</p>
            </Card>
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">🔮 明日建议</h3>
              <p className="mt-3 leading-relaxed text-ink/85">{result.tomorrow}</p>
            </Card>
          </div>

          <Card className="border-terracotta/30 bg-gradient-to-r from-blush/60 to-peach/40 p-5 text-center">
            <h3 className="font-serif text-lg font-medium text-terracotta">💗 送你一句话</h3>
            <p className="mt-3 font-serif text-lg italic leading-relaxed text-ink/85">
              “{result.encouragement}”
            </p>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
