/* LinguaFlash bootstrap v83
   Loads the unchanged application core plus stable 51Talk mobile fallback UI directly.
   v83 adds a safe mobile workspace adapter that reuses the tested desktop workspace logic.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V83__) return;
  window.__LF_APP_BOOTSTRAP_V83__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  // 51Talk built-in cards must exist before app-core builds its built-in baseline.
  document.write('<script src="./data/english-51talk-lessons-v1.js?v=83"><\/script>');
  // Exact original application core, kept unchanged.
  document.write('<script src="./app-core.js?v=83"><\/script>');

  if (mobile) {
    // Stable fallback UI: user-tested v77/v80 foundation.
    document.write('<script src="./english-mobile-lessons-v1.js?v=83"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=83"><\/script>');
    // Existing isolated practice fallback.
    document.write('<script src="./english-mobile-practice-v1.js?v=83"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=83"><\/script>');
    // v83: reuse the desktop workspace feature logic with phone-specific responsive CSS.
    // If this adapter fails, all fallback modules above remain visible and usable.
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=83"><\/script>');
  }
})();
