"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { saveModuleResult } from "@/lib/db";
import type { EatResult } from "@/types";

const EXAMPLES = ["想吃辣，两个人，预算80", "想吃清淡的，一个人", "今晚想吃点特别的，预算不限"];

export default function EatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EatResult | null>(null);
  const [error, setError] = useState("");

  async function run() {
    const text = input.trim();
    if (!text) { setError("告诉我口味、人数和预算吧～"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: "eat", input: text }),
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
            const r = evt.result as EatResult;
            setResult(r);
            saveModuleResult("eat", r);
          } else if (evt.type === "error") {
            setError(evt.error || "生成失败了，稍后再试一次～");
          }
        }
      }
    } catch { setError("生成失败了，稍后再试一次～"); }
    finally { setLoading(false); }
  }

  return (
    <PageShell title="今天吃什么">
      <Card className="p-5">
        <label className="text-sm text-muted">口味 / 人数 / 预算（一句话）</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="例：想吃辣，两个人，预算80"
          className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 p-3 text-ink outline-none placeholder:text-muted/70 focus:border-rose/50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setInput(ex)} className="rounded-full bg-blush/70 px-3 py-1.5 text-xs text-ink/80 transition hover:bg-blush">
              {ex}
            </button>
          ))}
        </div>
        <button onClick={run} disabled={loading} className="mt-4 w-full rounded-2xl bg-rose/90 py-3 font-medium text-white shadow-card transition hover:bg-rose disabled:opacity-60">
          {loading ? "生成中…" : "帮我推荐今天吃什么"}
        </button>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
      </Card>

      {loading && !result && (
        <Card className="mt-4 animate-pulse p-6 text-center text-muted">正在为你轻轻搭配今天的菜单…</Card>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="font-serif text-lg font-medium">🍽️ 推荐菜单</h3>
            <ul className="mt-3 divide-y divide-blush/50">
              {result.menu.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink/90">{item.name}</p>
                    {item.note && <p className="mt-0.5 text-xs text-muted">{item.note}</p>}
                  </div>
                  {item.kcal !== undefined && (
                    <span className="shrink-0 rounded-full bg-sage/15 px-2.5 py-1 text-xs font-medium text-sage">{item.kcal} kcal</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          {result.kcalHint && (
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">✨ 热量小贴士</h3>
              <p className="mt-2 text-ink/80">{result.kcalHint}</p>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
