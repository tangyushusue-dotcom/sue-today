"use client";

import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";
import { saveModuleResult, getTodayTodos, saveTodayTodos } from "@/lib/db";
import type { PlannerResult, PlannerTodo } from "@/types";

const EXAMPLES = [
  "今天要开会、健身、晚上和朋友吃饭",
  "上午写方案，下午逛街，早点睡",
  "在家办公，想抽空看书和运动",
];

export default function PlannerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [error, setError] = useState("");

  // 手动 Todo
  const [todos, setTodos] = useState<PlannerTodo[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPhoto, setNewPhoto] = useState<string>(""); // base64
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getTodayTodos().then(setTodos); }, []);

  // 照片 → base64
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  // 保存 Todo
  function addTodo() {
    const title = newTitle.trim();
    if (!title) return;
    const todo: PlannerTodo = {
      id: crypto.randomUUID(),
      title,
      description: newDesc.trim() || undefined,
      photoDataUrl: newPhoto || undefined,
      deadline: newDeadline || undefined,
      done: false,
      createdAt: Date.now(),
    };
    const next = [...todos, todo];
    setTodos(next);
    saveTodayTodos(next);
    setNewTitle(""); setNewDesc(""); setNewDeadline(""); setNewPhoto("");
    setShowAdd(false);
  }

  function toggleTodo(id: string) {
    const next = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(next);
    saveTodayTodos(next);
  }

  function deleteTodo(id: string) {
    const next = todos.filter((t) => t.id !== id);
    setTodos(next);
    saveTodayTodos(next);
  }

  // AI 生成
  async function run() {
    const text = input.trim();
    if (!text) { setError("先说一句今天打算做的事吧～"); return; }
    setLoading(true); setError(""); setResult(null);

    // 把已有的未完成 Todo 拼进 AI 输入
    const pendingTodos = todos.filter((t) => !t.done);
    let aiInput = text;
    if (pendingTodos.length > 0) {
      const todoLines = pendingTodos.map((t) => {
        let line = `- ${t.title}`;
        if (t.deadline) line += `（截止 ${t.deadline}）`;
        if (t.description) line += `：${t.description}`;
        return line;
      });
      aiInput = `${text}\n\n我已经手动添加了以下待办事项，请在安排时把它们也排进去：\n${todoLines.join("\n")}`;
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: "planner", input: aiInput }),
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
            const r = evt.result as PlannerResult;
            setResult(r);
            saveModuleResult("planner", r);
          } else if (evt.type === "error") {
            setError(evt.error || "生成失败了，稍后再试一次～");
          }
        }
      }
    } catch { setError("生成失败了，稍后再试一次～"); }
    finally { setLoading(false); }
  }

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <PageShell title="今天计划">
      {/* AI 一句话入口 */}
      <Card className="p-5">
        <label className="text-sm text-muted">说一句今天打算做的事，AI 帮你排</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="例：今天要开会、��身、晚上和朋友吃饭"
          className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 p-3 text-ink outline-none placeholder:text-muted/70 focus:border-rose/50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setInput(ex)} className="rounded-full bg-blush/70 px-3 py-1.5 text-xs text-ink/80 transition hover:bg-blush">{ex}</button>
          ))}
        </div>
        {todos.filter(t => !t.done).length > 0 && (
          <p className="mt-3 rounded-2xl bg-sky/10 px-3 py-2 text-xs text-muted">
            💡 已自动关联 {todos.filter(t => !t.done).length} 个待办事项，AI 会把它们排进时间安排里
          </p>
        )}
        <button onClick={run} disabled={loading} className="mt-4 w-full rounded-2xl bg-rose/90 py-3 font-medium text-white shadow-card transition hover:bg-rose disabled:opacity-60">
          {loading ? "生成中…" : "帮我安排今天"}
        </button>
        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
      </Card>

      {/* 手动 Todo 区域 */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium">📋 我的 Todo</h2>
          <div className="flex items-center gap-3">
            {todos.length > 0 && (
              <span className="text-xs text-muted">{doneCount}/{todos.length}</span>
            )}
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-ink shadow-card transition hover:bg-white"
            >
              {showAdd ? "取消" : "+ 添加"}
            </button>
          </div>
        </div>

        {/* 添加表单 */}
        {showAdd && (
          <Card className="mt-3 p-4">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="任务名称 *"
              className="w-full rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-ink outline-none placeholder:text-muted/70 focus:border-rose/50"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              placeholder="描述（可选）"
              className="mt-2 w-full resize-none rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-rose/50"
            />
            <div className="mt-2 flex items-center gap-3">
              <input
                type="time"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-rose/50"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-full bg-blush/70 px-3 py-1.5 text-xs text-ink/80 transition hover:bg-blush"
              >
                {newPhoto ? "📷 已选照片" : "📷 添加照片"}
              </button>
              {newPhoto && (
                <button onClick={() => setNewPhoto("")} className="text-xs text-muted underline">清除</button>
              )}
            </div>
            {newPhoto && (
              <img src={newPhoto} alt="预览" className="mt-2 h-24 rounded-xl object-cover" />
            )}
            <button onClick={addTodo} disabled={!newTitle.trim()} className="mt-3 w-full rounded-xl bg-rose/90 py-2.5 text-sm font-medium text-white transition hover:bg-rose disabled:opacity-50">
              添加任务
            </button>
          </Card>
        )}

        {/* Todo 列表 */}
        {todos.length === 0 && !showAdd && (
          <Card className="mt-3 p-5 text-center text-sm text-muted">
            还没有手动添加的任务，点「+ 添加」或直接用 AI 帮你排。
          </Card>
        )}
        {todos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {todos
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((t) => (
              <li key={t.id}>
                <Card className={`p-4 transition ${t.done ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTodo(t.id)}
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                        t.done ? "border-sage bg-sage text-white" : "border-muted/40 bg-transparent"
                      }`}
                    >
                      {t.done && "✓"}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium ${t.done ? "line-through text-muted" : "text-ink"}`}>
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="mt-1 text-sm text-muted">{t.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {t.deadline && (
                          <span className="rounded-full bg-rose/15 px-2 py-0.5 text-xs font-medium text-terracotta">
                            ⏰ {t.deadline}
                          </span>
                        )}
                        {t.photoDataUrl && (
                          <img src={t.photoDataUrl} alt="" className="mt-1 h-16 rounded-xl object-cover" />
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteTodo(t.id)} className="shrink-0 text-sm text-muted hover:text-terracotta">
                      ✕
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI 结果 */}
      {loading && !result && (
        <Card className="mt-4 animate-pulse p-6 text-center text-muted">正在为你轻轻排好今天…</Card>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="font-serif text-lg font-medium">🕐 AI 推荐时间安排</h3>
            <ul className="mt-3 space-y-2">
              {result.schedule.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 rounded-lg bg-rose/15 px-2 py-0.5 text-xs font-medium text-terracotta">{s.time}</span>
                  <span className="text-ink/85">{s.title}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">✨ 重点事项</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/85">
                {result.focus.map((f, i) => (<li key={i}>{f}</li>))}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="font-serif text-lg font-medium">🔢 建议顺序</h3>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-ink/85">
                {result.order.map((o, i) => (<li key={i}>{o}</li>))}
              </ol>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-serif text-lg font-medium">🔔 今日提醒</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.reminders.map((r, i) => (
                <span key={i} className="rounded-full bg-peach/30 px-3 py-1.5 text-sm text-ink/80">{r}</span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
