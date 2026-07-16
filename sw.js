/* =====================================================================
   Service Worker — 讓 RRG 互動圖能離線用 + 支援 App 內「檢查更新」
   ⚠️ 改版規則：每次更新前端檔案，把 CACHE 版本號 +1（例 v1.0.0 → v1.0.1）
      使用者的瀏覽器才會抓到新版（對應 App Versioning Rule）
   ===================================================================== */
const CACHE = 'rrg-v2.1.2';

// App shell：前端本體，預先快取（相對路徑，配合 GitHub Pages 子目錄）
// ⚠️ 注意 rrg_web.json（資料檔）不放這裡 → 它每天更新，改走 network-first（見下方 fetch）
const ASSETS = [
  './',
  './index.html',
  './rrg_web_data.js',       // 離線 fallback 資料（fetch json 失敗時前端會改吃這份）
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// 安裝：把 app shell 存進快取（{cache:'reload'} 強制走網路抓最新，避開瀏覽器 HTTP 舊快取）
// skipWaiting()＝新版裝好就立刻接管，不用等所有分頁關掉（配合前端 controllerchange 自動重整）
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))
    )
  );
});

// 啟用：清掉舊版快取，立刻接管所有頁面
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 收到頁面的「SKIP_WAITING」就接管 → 這是「檢查更新」鍵的後端
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// 攔截請求
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 資料檔 rrg_web.json：network-first（每天更新，要抓最新落點；離線才退回快取）
  if (url.pathname.endsWith('rrg_web.json')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();                       // 抓到最新就順手更新快取（給離線用）
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))             // 離線：用上次抓到的
    );
    return;
  }

  // 其他 app shell：cache-first（有快取先用，沒有再連網路）
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
