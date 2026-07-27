import { moduleSchemas } from "./schemas";
import { SYSTEM_PROMPTS, SCHEMA_EXAMPLES } from "./prompts";
import type { ModuleKey, AIContext } from "@/types";

const BASE = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";
const MODEL = process.env.AI_MODEL || "deepseek-chat";

function userContent(module: ModuleKey, input: string, ctx?: AIContext): string {
  const parts = [`今天她说：「${input}」`];
  if (ctx?.date) parts.push(`日期：${ctx.date}`);
  if (ctx?.weather) parts.push(`天气：${ctx.weather.desc} ${ctx.weather.temp}°C`);
  if (ctx?.prefs?.city) parts.push(`城市：${ctx.prefs.city}`);
  if (ctx?.prefs?.goal) parts.push(`她的目标：${ctx.prefs.goal}`);
  if (ctx?.prefs?.workoutDaysPerWeek)
    parts.push(`每周运动：${ctx.prefs.workoutDaysPerWeek} 天`);
  return parts.join("\n");
}

export async function generate(
  module: ModuleKey,
  input: string,
  ctx?: AIContext
): Promise<unknown> {
  const key = process.env.AI_API_KEY;
  if (!key) return mock(module, input, ctx);

  const sys =
    SYSTEM_PROMPTS[module] +
    `\n只输出 JSON，参考结构：\n${SCHEMA_EXAMPLES[module]}`;
  const r = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userContent(module, input, ctx) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
    }),
  });
  if (!r.ok) throw new Error(`ai ${r.status}`);
  const data = await r.json();
  const content: string = data?.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return moduleSchemas[module].parse(parsed);
}

// ---------- 无 Key 时的本地兜底 ----------

/** 从 input 中提取 Todo 行：- 任务名（截止 HH:MM）：描述 */
function parseTodosFromInput(input: string): { title: string; deadline?: string; desc?: string }[] {
  const todos: { title: string; deadline?: string; desc?: string }[] = [];
  const lines = input.split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    let rest = line.slice(2).trim();
    if (!rest) continue;
    let deadline: string | undefined;
    const dlMatch = rest.match(/^(.+?)（截止\s*([\d:]+)）/);
    if (dlMatch) {
      rest = dlMatch[1];
      deadline = dlMatch[2];
    }
    let title = rest;
    let desc: string | undefined;
    const colonIdx = rest.indexOf("：");
    if (colonIdx > 0) {
      title = rest.slice(0, colonIdx).trim();
      desc = rest.slice(colonIdx + 1).trim() || undefined;
    }
    if (!title) continue;
    todos.push({ title, deadline, desc });
  }
  return todos;
}

function mock(module: ModuleKey, input: string, ctx?: AIContext): unknown {
  const has = (k: string) => input.includes(k);
  switch (module) {
    case "planner": {
      const todos = parseTodosFromInput(input);

      const baseSlots = [
        { time: "08:30", title: "慢慢吃顿舒服的早餐，醒过来" },
        { time: "10:00", title: has("开会") ? "开会（提前 5 分钟进会议室，先理清要拍板的事）" : "处理今天最重要的一件事" },
        { time: "12:30", title: "午餐 + 散步 15 分钟，晒晒太阳" },
      ];
      const evening = { time: "19:00", title: has("朋友吃饭") || has("吃饭") ? "和朋友吃饭，放下手机好好聊" : "晚饭 + 一段不被打扰的放松" };
      const late = has("健身") || has("运动")
        ? { time: "21:00", title: "轻松动一动，出点汗更安睡" }
        : { time: "22:30", title: "早点洗漱，给今天一个温柔的结尾" };

      const todoSlots: { time: string; title: string }[] = [];
      if (todos.length > 0) {
        const slotTimes = ["11:00", "14:00", "15:00", "16:00", "17:00", "20:00"];
        for (let i = 0; i < todos.length; i++) {
          const t = todos[i];
          const time = t.deadline || slotTimes[i % slotTimes.length];
          let label = t.title;
          if (t.desc) label += `（${t.desc}）`;
          if (t.deadline) label += ` ⚠️${t.deadline} 前`;
          todoSlots.push({ time, title: label });
        }
      }

      const all = [...todoSlots, ...baseSlots, evening, late].sort((a, b) => {
        const ta = a.time.split(":").map(Number);
        const tb = b.time.split(":").map(Number);
        return ta[0] * 60 + ta[1] - (tb[0] * 60 + tb[1]);
      });
      const seen = new Set<string>();
      const merged: { time: string; title: string }[] = [];
      for (const s of all) {
        if (seen.has(s.time)) continue;
        seen.add(s.time);
        merged.push(s);
      }

      return {
        schedule: merged,
        focus: ["先把最费脑子的事做完", "留一段只属于自己的时间"],
        order: ["重要且紧急 → 重要不紧急 → 喜欢的小事 → 琐事"],
        reminders: ["喝水 8 杯", "23:00 前把手机放远一点"],
      };
    }
    case "eat":
      return {
        menu: [
          { name: "番茄牛腩煲", note: "下饭又暖胃", kcal: 430 },
          { name: "白灼菜心", note: "清爽解腻", kcal: 90 },
          { name: "杂粮饭", note: "顶饱不长胖", kcal: 180 },
          { name: "木瓜银耳羹", note: "甜而不腻的小奖励", kcal: 150 },
        ],
        kcalHint: "今天整体偏家常、热量友好，吃饱也不慌。",
      };
    case "workout":
      return {
        items: [
          { name: "快走 / 慢跑", durationMin: 20, reps: "微微出汗即可" },
          { name: "深蹲", durationMin: 8, reps: "3 组 × 12 次" },
          { name: "平板支撑", durationMin: 2, reps: "2 组" },
        ],
        totalMin: 30,
        stretch: ["猫牛式放松脊柱", "小腿拉伸防酸痛", "肩颈绕环"],
      };
    case "look":
      return {
        outfit: "米白针织衫 + 直筒牛仔裤，利落又舒服",
        color: "奶油白 + 浅卡其，干净显气色",
        hair: "低马尾或随性半扎，露出额头更精神",
        demeanor: "抬头挺胸，说话时带着笑，肩颈放松别耸肩",
      };
    case "review":
      return {
        summary: "今天虽然有点忙，但节奏是稳的，该做的事都慢慢落地了。",
        completion: "你说的事基本都完成了，给自己点个赞。",
        tomorrow: "明天留一段只属于自己的时间，做点纯粹喜欢的事。",
        encouragement: "你已经很努力了，今天也辛苦啦，好好睡一觉。",
      };
  }
}
