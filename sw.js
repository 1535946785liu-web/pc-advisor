/* 莫比价离线缓存：网页和价格数据优先联网（保证每月新价格能马上看到），没网时用上次缓存的版本 */
const CACHE = "mobiprice-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 只处理本站文件；商店图片、字体等外站资源交给浏览器自己处理，不占手机空间
  if (url.origin !== self.location.origin) return;

  const isPage = req.mode === "navigate";
  const isData = url.pathname.includes("/data/") || url.pathname.endsWith("/sw.js");
  if (isPage || isData) {
    // 联网优先：拿到新版本就顺便更新缓存
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(isPage ? "./index.html" : req, copy));
          return res;
        })
        .catch(() => caches.match(isPage ? "./index.html" : req, { ignoreSearch: !isPage }))
    );
    return;
  }
  // 图标等静态文件：缓存优先
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
