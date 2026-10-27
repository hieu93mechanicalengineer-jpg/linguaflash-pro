const CACHE_NAME = 'linguaflash-lazy-recovery-v36';

// Keep startup shell small. The two largest packs are cached only after the user needs them.
const CORE_ASSETS = [
  './manifest.webmanifest',
  './supabase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './data/core-cards.js',
  './data/giahan-b17-supplement.js',
  './data/giahan-b18-supplement.js',
  './data/giahan-b19-supplement.js',
  './data/giahan-b19-supplement-2.js',
  './data/uncertain-card-filter-v1.js',
  './data/giahan-tc2-cards.js',
  './data/giahan-translation-practice-v2.js',
  './data/dialogues.js',
  './data/giahan-grammar-extra.js',
  './data/youtube-podcast.js',
  './app.js',
  './lazy-large-packs.js',
  './study-answer-mode.js',
  './study-show-all-vocab-v1.js',
  './study-flip-penalty-v1.js',
  './study-card-touch-fix-v1.js',
  './answer-quality-v1.js',
  './study-character-feedback-v1.js',
  './auto-pronunciation-v1.js',
  './podcast-auto-pronunciation-v1.js',
  './study-filter-prefs.js',
  './weak-words-v1.js',
  './smart-study-queue-v1.js',
  './study-session-v1.js',
  './dialogue-active-recall-v1.js',
  './learning-loop-v1.js',
  './learning-loop-tasks-v1.js',
  './learning-loop-mobile-fix-v1.js',
  './admin-dashboard-v1.js',
  './cloud-sync-v2.js'
];

const LARGE_PACK_PATHS = [
  '/data/huyenanh-level3-4.js',
  '/data/dictionary.js'
];

function isLargePack(url) {
  return LARGE_PACK_PATHS.some(suffix => url.pathname.endsWith(suffix));
}

function isAppPageNavigation(request, url) {
  if (url.pathname.endsWith('/index.html')) return true;
  if (request.mode !== 'navigate') return false;
  const leaf = url.pathname.split('/').filter(Boolean).pop() || '';
  return leaf === 'linguaflash-pro' || leaf === '';
}

async function transformIndexResponse(response) {
  if (!response || !response.ok) return response;
  let html = await response.text();

  html = html.replace(
    '<script src="./data/huyenanh-level3-4.js"></script>',
    '<script>window.HUYEN_ANH_L3_L4_CARDS = window.HUYEN_ANH_L3_L4_CARDS || [];</script>'
  );
  html = html.replace(
    '<script src="./data/dictionary.js"></script>',
    '<script>window.TAV_DICTIONARY_CARDS = window.TAV_DICTIONARY_CARDS || [];</script>'
  );
  html = html.replace(
    '<script src="./data/core-cards.js"></script>',
    '<script src="./data/core-cards.js"></script>\n<script src="./data/giahan-b17-supplement.js?v=36"></script>\n<script src="./data/giahan-b18-supplement.js?v=36"></script>\n<script src="./data/giahan-b19-supplement.js?v=36"></script>\n<script src="./data/giahan-b19-supplement-2.js?v=36"></script>\n<script src="./data/uncertain-card-filter-v1.js?v=36"></script>'
  );
  html = html.replace(
    '<script src="./app.js"></script>',
    '<script src="./data/giahan-translation-practice-v2.js?v=36"></script>\n<script src="./app.js"></script>\n<script src="./lazy-large-packs.js?v=36"></script>\n<script src="./study-answer-mode.js?v=36"></script>\n<script src="./study-show-all-vocab-v1.js?v=36"></script>\n<script src="./study-flip-penalty-v1.js?v=36"></script>\n<script src="./study-card-touch-fix-v1.js?v=36"></script>\n<script src="./answer-quality-v1.js?v=36"></script>\n<script src="./study-character-feedback-v1.js?v=36"></script>\n<script src="./auto-pronunciation-v1.js?v=36"></script>\n<script src="./podcast-auto-pronunciation-v1.js?v=36"></script>\n<script src="./study-filter-prefs.js?v=36"></script>\n<script src="./weak-words-v1.js?v=36"></script>\n<script src="./smart-study-queue-v1.js?v=36"></script>\n<script src="./study-session-v1.js?v=36"></script>\n<script src="./dialogue-active-recall-v1.js?v=36"></script>\n<script src="./learning-loop-v1.js?v=36"></script>\n<script src="./learning-loop-tasks-v1.js?v=36"></script>\n<script src="./learning-loop-mobile-fix-v1.js?v=36"></script>\n<script src="./admin-dashboard-v1.js?v=36"></script>'
  );

  const legacyCloudSync = /<script id="lf-cloud-sync-script">[\s\S]*?<\/script>/i;
  if (legacyCloudSync.test(html)) {
    html = html.replace(legacyCloudSync, '<script src="./cloud-sync-v2.js?v=36"></script>');
  } else if (!html.includes('cloud-sync-v2.js')) {
    html = html.replace('</body>', '<script src="./cloud-sync-v2.js?v=36"></script>\n</body>');
  }

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.delete('content-length');
  headers.delete('content-encoding');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function fetchTransformedIndex(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const network = await fetch(request, { cache: 'no-store' });
    const transformed = await transformIndexResponse(network);
    if (transformed && transformed.ok) {
      await cache.put('./index.html', transformed.clone());
      await cache.put('./', transformed.clone());
      try { await cache.put(request, transformed.clone()); } catch (_) {}
    }
    return transformed;
  } catch (err) {
    return (await cache.match(request)) || (await cache.match('./index.html')) || Response.error();
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    try {
      const raw = await fetch('./index.html', { cache: 'no-store' });
      const transformed = await transformIndexResponse(raw);
      if (transformed && transformed.ok) {
        await cache.put('./index.html', transformed.clone());
        await cache.put('./', transformed.clone());
      }
    } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (isAppPageNavigation(req, url)) {
      event.respondWith(fetchTransformedIndex(req));
      return;
    }

    if (isLargePack(url)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        const network = await fetch(req, { cache: 'no-store' });
        if (network && network.ok) await cache.put(req, network.clone());
        return network;
      })());
      return;
    }

    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const network = await fetch(req, { cache: 'no-store' });
        if (network && network.ok && !url.pathname.endsWith('/recovery.html')) {
          await cache.put(req, network.clone());
        }
        return network;
      } catch (_) {
        return (await cache.match(req)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});