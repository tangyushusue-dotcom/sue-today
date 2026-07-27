import { z } from "zod";
import type { ModuleKey } from "@/types";

export const plannerSchema = z.object({
  schedule: z.array(z.object({ time: z.string(), title: z.string() })),
  focus: z.array(z.string()),
  order: z.array(z.string()),
  reminders: z.array(z.string()),
});

export const eatSchema = z.object({
  menu: z.array(
    z.object({
      name: z.string(),
      note: z.string().optional(),
      kcal: z.number().optional(),
    })
  ),
  kcalHint: z.string().optional(),
});

export const workoutSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      durationMin: z.number(),
      reps: z.string().optional(),
    })
  ),
  totalMin: z.number(),
  stretch: z.array(z.string()),
});

export const lookSchema = z.object({
  outfit: z.string(),
  color: z.string(),
  hair: z.string(),
  demeanor: z.string(),
});

export const reviewSchema = z.object({
  summary: z.string(),
  completion: z.string(),
  tomorrow: z.string(),
  encouragement: z.string(),
});

export const moduleSchemas: Record<ModuleKey, z.ZodTypeAny> = {
  planner: plannerSchema,
  eat: eatSchema,
  workout: workoutSchema,
  look: lookSchema,
  review: reviewSchema,
};
