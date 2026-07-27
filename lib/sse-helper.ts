/**
 * 从 ReadableStream 中解析 SSE 事件。
 * 兼容 fetch Response.body 和 generateClient 返回的 ReadableStream。
 */
export async function parseSSEStream<T>(
  stream: ReadableStream<Uint8Array>,
  onResult: (data: T) => void,
  onError: (msg: string) => void
): Promise<void> {
  const reader = stream.getReader();
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
        onResult(evt.result as T);
      } else if (evt.type === "error") {
        onError(evt.error || "生成失败了，稍后再试一次～");
      }
    }
  }
}
