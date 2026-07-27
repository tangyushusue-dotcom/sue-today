"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { getDaily, getTodayTodos, saveTodayTodos } from "@/lib/db";
import { dayKeyOffset } from "@/lib/time";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { StreakBadge } from "@/components/home/StreakBadge";
import { CoreEntryCard } from "@/components/home/CoreEntryCard";
import { EveningReviewBanner } from "@/components/home/EveningReviewBanner";
import { Card } from "@/components/ui/Card";
import type { ReviewResult, PlannerTodo } from "@/types";

export default function HomePage() {
  const streak = useAppStore((s) => s.streak);
  const loadPrefs = useAppStore((s) => s.loadPrefs);
  const recordOpenToday = useAppStore((s) => s.recordOpenToday);
  const [yesterdayReview, setYesterdayReview] = useState<ReviewResult | null>(null);

  // 首页 Todo
  const [todos, setTodos] = useState<PlannerTodo[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPrefs().then(() => recordOpenToday());
    (async () => {
      const yesterday = await getDaily(dayKeyOffset(1));
      if (yesterday?.review) setYesterdayReview(yesterday.review as ReviewResult);
      setTodos(await getTodayTodos());
    })();
  }, [loadPrefs, recordOpenToday]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setNewPhoto(r.result as string);
    r.readAsDataURL(file);
  }

  function addTodo() {
    const t = newTitle.trim();
    if (!t) return;
    const todo: PlannerTodo = {
      id: crypto.randomUUID(), title: t,
      description: newDesc.trim() || undefined,
      photoDataUrl: newPhoto || undefined,
      deadline: newDeadline || undefined,
      done: false, createdAt: Date.now(),
    };
    const next = [todo, ...todos];
    setTodos(next); saveTodayTodos(next);
    setNewTitle(""); setNewDesc(""); setNewDeadline(""); setNewPhoto("");
    setShowAdd(false);
  }

  function toggleTodo(id: string) {
    const next = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(next); saveTodayTodos(next);
  }

  function deleteTodo(id: string) {
    const next = todos.filter((t) => t.id !== id);
    setTodos(next); saveTodayTodos(next);
  }

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-5 pb-16 pt-8 sm:pt-12">
      <div className="blob bg-rose/40 h-72 w-72 -top-16 -left-20" />
      <div className="blob bg-peach/40 h-80 w-80 top-40 -right-24" />
      <div className="blob bg-sky/30 h-64 w-64 bottom-10 left-10" />

      {/* 顶部栏 */}
      <header className="fade-up flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70 text-lg shadow-card">🌸</div>
          <span className="font-serif text-lg font-medium tracking-wide">Sue的今天</span>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} />
          <Link href="/settings" aria-label="设置" className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70 text-muted shadow-card transition hover:text-ink">⚙️</Link>
        </div>
      </header>

      <GreetingHeader />

      {/* 昨日复盘 */}
      {yesterdayReview && (
        <section className="mt-6 animate-fadeUp delay-1">
          <Link href="/review" className="block rounded-4xl border border-sage/30 bg-gradient-to-r from-sage/10 to-sky/10 p-5 shadow-card backdrop-blur transition hover:shadow-soft">
            <p className="text-xs font-medium tracking-wide text-sage">昨天 · 复盘</p>
            <p className="mt-2 font-serif text-base leading-relaxed text-ink/85 line-clamp-2">{yesterdayReview.encouragement}</p>
            <p className="mt-1 text-xs text-muted">点击查看完整复盘 →</p>
          </Link>
        </section>
      )}

      {/* ====== 首页 Todo ====== */}
      <section className="mt-6 animate-fadeUp delay-1">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium">
            📋 今天要做的事
            {todos.length > 0 && <span className="ml-2 text-sm font-normal text-muted">{doneCount}/{todos.length}</span>}
          </h2>
          <button onClick={() => setShowAdd(!showAdd)} className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-ink shadow-card transition hover:bg-white">
            {showAdd ? "取消" : "+ 快速添加"}
          </button>
        </div>

        {/* 快速添加表单 */}
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
              <input type="time" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)}
                className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-rose/50" />
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="rounded-full bg-blush/70 px-3 py-1.5 text-xs text-ink/80 transition hover:bg-blush">
                {newPhoto ? "📷 已选" : "📷 照片"}
              </button>
              {newPhoto && <button onClick={() => setNewPhoto("")} className="text-xs text-muted underline">清除</button>}
            </div>
            {newPhoto && <img src={newPhoto} alt="预览" className="mt-2 h-24 rounded-xl object-cover" />}
            <button onClick={addTodo} disabled={!newTitle.trim()} className="mt-3 w-full rounded-xl bg-rose/90 py-2.5 text-sm font-medium text-white transition hover:bg-rose disabled:opacity-50">
              添加任务
            </button>
          </Card>
        )}

        {/* Todo 列表 */}
        {todos.length === 0 && !showAdd && (
          <Card className="mt-3 p-5 text-center text-sm text-muted">
            还没有今天的任务，点「+ 快速添加」或去
            <Link href="/planner" className="mx-1 underline text-rose">今天计划</Link>
            让 AI 帮你排。
          </Card>
        )}
        {todos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {todos.map((t) => (
              <li key={t.id}>
                <Card className={`p-4 transition ${t.done ? "opacity-55" : ""}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTodo(t.id)}
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                        t.done ? "border-sage bg-sage text-white" : "border-muted/40 bg-transparent"
                      }`}
                    >{t.done && "✓"}</button>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium ${t.done ? "line-through text-muted" : "text-ink"}`}>{t.title}</p>
                      {t.description && <p className="mt-1 text-sm text-muted">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {t.deadline && (
                          <span className="rounded-full bg-rose/15 px-2 py-0.5 text-xs font-medium text-terracotta">⏰ {t.deadline}</span>
                        )}
                        {t.photoDataUrl && (
                          <img src={t.photoDataUrl} alt="" className="h-14 rounded-xl object-cover" />
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteTodo(t.id)} className="shrink-0 text-sm text-muted hover:text-terracotta">✕</button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 三个核心入口 */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <CoreEntryCard href="/planner" icon="📝" title="今天要做什么？" desc="说一句今天的事，AI 帮你排好时间、重点和顺序。" example="例：「开会、健身、晚上和朋友吃饭」" spanClass="sm:col-span-2" delayClass="delay-2" />
        <CoreEntryCard icon="🍲" title="今天怎么照顾自己？" desc="吃顿舒服的，动一动身体。" chips={[{ label: "今天吃什么", href: "/eat" }, { label: "今日运动", href: "/workout" }]} delayClass="delay-3" />
        <CoreEntryCard href="/look" icon="👗" title="今天以什么状态出门？" desc="结合天气和场景，给你穿搭与神态小建议。" example="今天：上班 · 约会 · 面试 · 旅行" delayClass="delay-3" />
      </section>

      {/* 晚间复盘 */}
      <section className="mt-5 animate-fadeUp delay-4">
        <EveningReviewBanner href="/review" />
      </section>

      <footer className="mt-12 text-center text-xs leading-relaxed text-muted">
        把网页加到主屏或收藏夹，每天回来一次，<br className="sm:hidden" />让它陪你慢慢过好每一天。
      </footer>
    </main>
  );
}
