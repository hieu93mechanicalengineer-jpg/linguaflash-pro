const CACHE_NAME = 'linguaflash-english-mobile-v79';

// Common startup shell. Mobile uses the clean English lesson UI; desktop keeps
// the compact 51Talk workspace, Class 158 work lesson and two-way review trainer.
const CORE_ASSETS = [
  './manifest.webmanifest',
  './supabase-config.js',
  './mobile-ui-v1.js',
  './english-hq-audio-v1.js',
  './chinese-hq-audio-v1.js',
  './english-audio-admin-v1.js',
  './chinese-audio-admin-v1.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './data/core-cards.js',
  './data/english-51talk-lessons-v1.js',
  './data/giahan-b17-supplement.js',
  './data/giahan-b18-supplement.js',
  './data/giahan-b19-supplement.js',
  './data/giahan-b19-supplement-2.js',
  './data/giahan-source-fixes-v1.js',
  './data/uncertain-card-filter-v1.js',
  './data/giahan-tc2-cards.js',
  './data/giahan-translation-practice-v2.js',
  './data/giahan-translation-practice-tc2-fix-v1.js',
  './data/dialogues.js',
  './data/giahan-grammar-extra.js',
  './giahan-usage-examples-v2.js',
  './giahan-usage-hotfix-v1.js',
  './data/youtube-podcast.js',
  './app.js',
  './english-mobile-lessons-v1.js',
  './english-mobile-51talk-entry-v1.js',
  './english-51talk-desktop-workspace-v1.js',
  './english-51talk-class158-work-v1.js',
  './english-51talk-review-trainer-v1.js',
  './lazy-large-packs.js',
  './study-answer-mode.js',
  './study-answer-alternatives-v1.js',
  './study-show-all-vocab-v1.js',
  './answer-quality-v1.js',
  './quiz-multi-lesson-v1.js',
  './auto-pronunciation-v1.js',
  './podcast-auto-pronunciation-v1.js',
  './study-filter-prefs.js',
  './study-session-v1.js',
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
    '<script src="./data/core-cards.js"></script>\n<script src="./data/giahan-b17-supplement.js?v=39"></script>\n<script src="./data/giahan-b18-supplement.js?v=39"></script>\n<script src="./data/giahan-b19-supplement.js?v=39"></script>\n<script src="./data/giahan-b19-supplement-2.js?v=39"></script>\n<script src="./data/giahan-source-fixes-v1.js?v=49"></script>\n<script src="./data/uncertain-card-filter-v1.js?v=45"></script>'
  );

  html = html.replace(
    '<script src="./app.js"></script>',
    `<script src="./data/giahan-translation-practice-v2.js?v=39"></script>
<script src="./data/giahan-translation-practice-tc2-fix-v1.js?v=39"></script>
<script src="./data/english-51talk-lessons-v1.js?v=58"></script>
<script src="./app.js"></script>
<script>
(function(){
  var ua = String(navigator.userAgent || '');
  var mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  var touch = Number(navigator.maxTouchPoints || 0) > 0;
  var coarse = false;
  try { coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (_) {}
  var shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  var mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  var mobileScripts = [
    './english-mobile-lessons-v1.js?v=78',
    './english-mobile-51talk-entry-v1.js?v=79',
    './lazy-large-packs.js?v=66',
    './study-answer-mode.js?v=66',
    './study-answer-alternatives-v1.js?v=66',
    './study-show-all-vocab-v1.js?v=66',
    './answer-quality-v1.js?v=66',
    './quiz-multi-lesson-v1.js?v=66',
    './auto-pronunciation-v1.js?v=66',
    './podcast-auto-pronunciation-v1.js?v=66',
    './study-filter-prefs.js?v=66',
    './study-session-v1.js?v=66'
  ];
  var desktopScripts = [
    './english-51talk-desktop-workspace-v1.js?v=67',
    './english-51talk-class158-work-v1.js?v=69',
    './english-51talk-review-trainer-v1.js?v=68',
    './lazy-large-packs.js?v=39',
    './study-answer-mode.js?v=39',
    './study-input-mobile-hotfix-v1.js?v=53',
    './study-navigation-safe-v3.js?v=59',
    './study-answer-alternatives-v1.js?v=39',
    './study-show-all-vocab-v1.js?v=39',
    './study-flip-penalty-v1.js?v=39',
    './study-card-touch-fix-v1.js?v=39',
    './answer-quality-v1.js?v=39',
    './study-character-feedback-v1.js?v=39',
    './study-hint-ladder-v2.js?v=54',
    './study-chunk-mode-v1.js?v=50',
    './study-chunk-external-panel-v1.js?v=55',
    './quiz-multi-lesson-v1.js?v=51',
    './auto-pronunciation-v1.js?v=39',
    './podcast-auto-pronunciation-v1.js?v=39',
    './study-filter-prefs.js?v=39',
    './weak-words-v1.js?v=39',
    './smart-study-queue-v1.js?v=39',
    './study-session-v1.js?v=39',
    './smart-daily-session-v2.js?v=44',
    './dialogue-active-recall-v1.js?v=39',
    './learning-loop-v1.js?v=39',
    './learning-loop-tasks-v1.js?v=39',
    './learning-loop-mobile-fix-v1.js?v=39',
    './admin-dashboard-v1.js?v=39'
  ];
  var scripts = mobile ? mobileScripts : desktopScripts;
  for (var i=0;i<scripts.length;i++) {
    document.write('<script src="'+scripts[i]+'"><\\/script>');
  }
})();
</script>
<script src="./giahan-usage-examples-v2.js?v=49"></script>
<script src="./giahan-usage-hotfix-v1.js?v=49"></script>`
  );

  const legacyCloudSync = /<script id="lf-cloud-sync-script">[\s\S]*?<\/script>/i;
  if (legacyCloudSync.test(html)) {
    html = html.replace(legacyCloudSync, '<script src="./cloud-sync-v2.js?v=69"></script>');
  } else if (!html.includes('cloud-sync-v2.js')) {
    html = html.replace('</body>', '<script src="./cloud-sync-v2.js?v=69"></script>\n</body>');
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