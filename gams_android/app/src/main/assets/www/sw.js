const CACHE = 'gams-v3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/config.js',
  './js/api.js',
  './js/utils.js',
  './app.js',
  './manifest.json',
  './assets/vendor/fontawesome/css/all.min.css',
  './assets/vendor/dm-sans/400.css',
  './assets/vendor/dm-sans/600.css',
  './assets/vendor/dm-sans/700.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => cached))
  );
});
