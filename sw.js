/* =====================================================================
   Service Worker — 讓 RRG 互動圖能離線用 + 支援 App 內「檢查更新」
   ⚠️ 改版規則：每次更新前端檔案，把 CACHE 版本號 +1（例 v1.0.0 → v1.0.1）
      使用者的瀏覽器才會抓到新版（對應 App Versioning Rule）
   ===================================================================== */
const CACHE = 'rrg-v4.9.13';

// App shell：前端本體，預先快取（相對路徑，配合 GitHub Pages 子目錄）
// ⚠️ 注意 rrg_web.json（資料檔）不放這裡 → 它每天更新，改走 network-first（見下方 fetch）
// v4.9.13：拿掉 rrg_web_data.js（rrg_web.json 的 19.4MB 複本）——每次版號 bump 都會強迫重抓一次，
//   而離線需求靠 rrg_web.json 的 network-first＋快取回退早已滿足；公開站也不再部署它
const ASSETS = [
  './',
  './index.html',
  './signals.html',
  './signals.css',
  './signals.js',
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

  // 每日 RRG、每月回測、每日輪動訊號 JSON 都採 network-first；離線時才退回上次成功快取。
  if (url.pathname.endsWith('rrg_web.json') || url.pathname.endsWith('rrg_validation.json')
      || url.pathname.endsWith('rotation_signals.json')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // v4.9.13：非 2xx（Pages 暫時 404／5xx）以前被當成功回傳、還把錯誤頁覆寫進快取，
          // 等於自己把離線回退的好資料弄壞 → 改成丟出去走下面的快取回退，且不快取
          if (!res.ok) throw new Error('http ' + res.status);
          const copy = res.clone();                       // 抓到最新就順手更新快取（給離線用）
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        // 離線／伺服器出錯：用上次抓到的；真的沒有快取就回網路錯誤，讓頁面自己走 fallback
        .catch(() => caches.match(e.request).then((hit) => hit || Response.error()))
    );
    return;
  }

  // 其他 app shell：cache-first（有快取先用，沒有再連網路）
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
