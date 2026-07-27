/**
 * 客户端 AI 调用封装 —— 纯前端 mock，无需 API Routes。
 * 当有真实 API Key 时仍可通过 fetch 调用后端 API。
 */
import { generate } from "./ai";
import type { ModuleKey, AIContext } from "@/types";

/** 模拟 SSE 流式返回的异步迭代器（兼容 fetch + ReadableStream 用法） */
export async function generateClient(
  module: ModuleKey,
  input: string,
  ctx?: AIContext
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      send({ type: "start" });

      // 模拟一点延迟，让用户感觉 AI 在思考
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

      try {
        const result = generate(module, input, ctx);
        send({ type: "result", result });
      } catch {
        send({ type: "error", error: "生成失败了，稍后再试一次～" });
      } finally {
        send({ type: "done" });
        controller.close();
      }
    },
  });
}

/** 客户端天气获取 —— 纯 mock */
export async function getWeatherClient(
  city: string
): Promise<{ city: string; temp: number; desc: string }> {
  return { city, temp: 26, desc: "晴" };
}
