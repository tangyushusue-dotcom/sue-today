// 用户偏好（首次引导 + 设置），存于本地 Dexie
export type Goal = "fat_loss" | "tone" | "muscle_gain" | "keep_healthy";

export interface UserPrefs {
  id: "me";
  goal: Goal;
  workoutDaysPerWeek: number;
  city: string;
  theme: "light" | "dark" | "auto";
  reminderEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// 手动添加的 Todo（带照片/描述/截止时间）
export interface PlannerTodo {
  id: string; // crypto.randomUUID()
  title: string;
  description?: string;
  photoDataUrl?: string; // base64 照片
  deadline?: string; // HH:mm 或 ISO
  done: boolean;
  createdAt: number;
}

// 每日记录（每天一条，date 为主键）
export interface DailyRecord {
  date: string; // YYYY-MM-DD
  planner?: PlannerResult;
  todos?: PlannerTodo[]; // 手动添加的 Todo 列表
  eat?: EatResult;
  workout?: WorkoutResult;
  look?: LookResult;
  review?: ReviewResult;
  openedAt: number;
}

export interface PlannerResult {
  schedule: { time: string; title: string }[];
  focus: string[];
  order: string[];
  reminders: string[];
}
export interface EatResult {
  menu: { name: string; note?: string; kcal?: number }[];
  kcalHint?: string;
}
export interface WorkoutResult {
  items: { name: string; durationMin: number; reps?: string }[];
  totalMin: number;
  stretch: string[];
}
export interface LookResult {
  outfit: string;
  color: string;
  hair: string;
  demeanor: string;
}
export interface ReviewResult {
  summary: string;
  completion: string;
  tomorrow: string;
  encouragement: string;
}

export type ModuleKey = "planner" | "eat" | "workout" | "look" | "review";

export interface AIContext {
  date?: string;
  weather?: { temp: number; desc: string };
  prefs?: { goal?: Goal; workoutDaysPerWeek?: number; city?: string };
}
export interface AIRequest {
  module: ModuleKey;
  input: string;
  context?: AIContext;
}
export interface AIResponse {
  ok: boolean;
  result?: unknown;
  error?: string;
}
