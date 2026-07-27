import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "上海";
  const key = process.env.WEATHER_API_KEY;

  if (!key) {
    // 无 Key 兜底：返回温和示例天气，保证体验可演示
    return Response.json({ city, temp: 26, desc: "晴", mock: true });
  }

  try {
    const r = await fetch(
      `https://devapi.qweather.com/v7/weather/now?location=${encodeURIComponent(
        city
      )}&key=${key}`
    );
    const data = await r.json();
    const now = data?.now;
    if (!now) return Response.json({ city, temp: 26, desc: "晴", mock: true });
    return Response.json({ city, temp: Number(now.temp), desc: now.text });
  } catch {
    return Response.json({ city, temp: 26, desc: "晴", mock: true });
  }
}
