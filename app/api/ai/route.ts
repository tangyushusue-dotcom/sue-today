import { NextRequest } from "next/server";
import { z } from "zod";
import { generate } from "@/lib/ai";
import type { ModuleKey } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  module: z.enum(["planner", "eat", "workout", "look", "review"]),
  input: z.string().min(1, "说一句今天的事吧").max(500),
  context: z
    .object({
      date: z.string().optional(),
      weather: z.object({ temp: z.number(), desc: z.string() }).optional(),
      prefs: z
        .object({
          goal: z.string().optional(),
          workoutDaysPerWeek: z.number().optional(),
          city: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ ok: false, error: "说一句今天的事吧～" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "说一句今天的事吧～" }, { status: 400 });
  }

  const { module, input, context } = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ type: "start" });
      try {
        const result = await generate(
          module as ModuleKey,
          input,
          context as Parameters<typeof generate>[2]
        );
        send({ type: "result", result });
      } catch {
        send({ type: "error", error: "生成失败了，稍后再试一次～" });
      } finally {
        send({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
