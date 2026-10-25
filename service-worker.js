const CACHE_NAME = 'linguaflash-pwa-v1';
const APP_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.webmanifest",
  "./supabase-config.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./data/core-cards.js",
  "./data/giahan-tc2-cards.js",
  "./data/huyenanh-level3-4.js",
  "./data/dialogues.js",
  "./data/giahan-grammar-extra.js",
  "./data/dictionary.js",
  "./data/youtube-podcast.js"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigation: prefer fresh app, fall back to installed shell offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  // Same-origin assets: cache first for fast startup, refresh in background.
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(cached => {
      const update = fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || update;
    }));
    return;
  }

  // External libraries/fonts: network first, runtime-cache for later offline use.
  event.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(c => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req)));
});
