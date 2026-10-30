/* LinguaFlash bootstrap v80
   Loads the unchanged application core plus 51Talk mobile lesson UI directly.
   This makes first-load behavior identical in Safari, PWA and in-app browsers
   such as Zalo, without waiting for the service worker to control the page.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V80__) return;
  window.__LF_APP_BOOTSTRAP_V80__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  // 51Talk built-in cards must exist before app-core builds its built-in baseline.
  document.write('<script src="./data/english-51talk-lessons-v1.js?v=80"><\/script>');
  // Exact previous app.js content, moved without modification.
  document.write('<script src="./app-core.js?v=80"><\/script>');

  if (mobile) {
    // Stable mobile UI restored from the user-tested v77 blob.
    document.write('<script src="./english-mobile-lessons-v1.js?v=80"><\/script>');
    // Browser-independent entry controller for Safari/PWA/Zalo WebView.
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=80"><\/script>');
  }
})();
