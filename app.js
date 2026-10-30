/* LinguaFlash bootstrap v87
   Loads the unchanged application core plus stable 51Talk mobile fallback UI directly.
   v83 added desktop-parity mobile workspace; v84 added VI→EN / EN→VI study direction;
   v85 integrates Class 158; v86 adds continuous listening; v87 adds Unit 2 · She Is A Poodle.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V87__) return;
  window.__LF_APP_BOOTSTRAP_V87__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  // 51Talk built-in cards must exist before app-core builds its built-in baseline.
  document.write('<script src="./data/english-51talk-lessons-v1.js?v=87"><\/script>');
  // Exact original application core, kept unchanged.
  document.write('<script src="./app-core.js?v=87"><\/script>');
  // Shared Unit 2 lesson object + full-sentence IPA used by both desktop and mobile workspace adapters.
  document.write('<script src="./english-unit2-data-v1.js?v=87"><\/script>');

  if (mobile) {
    // Stable fallback UI: user-tested v77/v80 foundation.
    document.write('<script src="./english-mobile-lessons-v1.js?v=87"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=87"><\/script>');
    // Existing isolated practice fallback.
    document.write('<script src="./english-mobile-practice-v1.js?v=87"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=87"><\/script>');
    // Unit 2 must be injected before Class 158 and before the shared parity workspace fetches its source.
    document.write('<script src="./english-mobile-unit2-bridge-v1.js?v=87"><\/script>');
    // Inject Class 158 into the shared workspace source before parity adapter loads it.
    document.write('<script src="./english-mobile-class158-bridge-v1.js?v=87"><\/script>');
    // Shared desktop-parity workspace with phone-specific responsive CSS.
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=87"><\/script>');
    // Choose study direction without changing the stable workspace core.
    document.write('<script src="./english-mobile-direction-v1.js?v=87"><\/script>');
    // Independent background-friendly listening playlist. Its workspace fetch also receives Unit 2 via the bridge above.
    document.write('<script src="./english-mobile-playlist-v1.js?v=87"><\/script>');
  } else {
    // Desktop: synchronously evaluate the shared workspace with Unit 2 before the legacy direct script is parsed.
    document.write('<script src="./english-desktop-unit2-bridge-v1.js?v=87"><\/script>');
  }
})();
