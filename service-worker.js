const CACHE_NAME = 'linguaflash-recovery-v10';
const APP_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './supabase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './data/core-cards.js',
  './data/giahan-tc2-cards.js',
  './data/huyenanh-level3-4.js',
  './data/dialogues.js',
  './data/giahan-grammar-extra.js',
  './data/dictionary.js',
  './data/youtube-podcast.js'
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

  // Recovery build: prefer network for all same-origin files so stale modules/config cannot survive.
  if (url.origin === self.location.origin) {
    event.respondWith(fetch(req, { cache: 'no-store' }).then(res => {
      if (res && res.ok && !url.pathname.endsWith('/recovery.html')) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
