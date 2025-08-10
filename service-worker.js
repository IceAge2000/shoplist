const CACHE_NAME = 'shoplist-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// install: 事前キャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// activate: 古いキャッシュ削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))))
  );
  self.clients.claim();
});

// fetch: オフラインでも動く（キャッシュ優先、なければネット）
self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(res => res || fetch(req).then(networkRes => {
      // 動的にHTML以外はキャッシュ（雑にやり過ぎない程度）
      const copyTypes = ['image/', 'text/css', 'application/javascript'];
      if (copyTypes.some(t => networkRes.headers.get('content-type')?.startsWith(t))) {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return networkRes;
    }).catch(() => caches.match('./index.html')))
  );
});
