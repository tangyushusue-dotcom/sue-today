// Sue 今日电子签 · Service Worker
// 策略：
//  - 页面导航（HTML）：网络优先，保证每次拿到最新页面（根治「旧 HTML 指向已删除旧 JS」的白屏）
//  - 带哈希的静态资源（JS/CSS/字体/图片）：缓存优先（内容不可变，离线也能用）
const CACHE = "sue-today-v1";
const ASSET_RE = /\/_next\/static\//;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：网络优先，失败则回退缓存
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 静态资源：缓存优先（内容哈希不可变）
  if (
    ASSET_RE.test(url.pathname) ||
    /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }
});
