/* LinguaFlash bootstrap v89
   Loads the unchanged application core plus stable 51Talk mobile fallback UI directly.
   v89 hides English workspace outside English study and adds resumable full-library HQ audio generation.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V89__) return;
  window.__LF_APP_BOOTSTRAP_V89__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  document.write('<script src="./data/english-51talk-lessons-v1.js?v=89"><\/script>');
  document.write('<script src="./app-core.js?v=89"><\/script>');
  document.write('<script src="./english-unit2-data-v1.js?v=89"><\/script>');
  document.write('<script src="./english-class158-health-data-v1.js?v=89"><\/script>');

  if (mobile) {
    document.write('<script src="./english-mobile-lessons-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-practice-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=89"><\/script>');
    // Workspace fetch pipeline: Unit 2 → Class 158 Health → Class 158 Work → shared parity workspace.
    document.write('<script src="./english-mobile-unit2-bridge-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-class158-health-bridge-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-class158-bridge-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-direction-v1.js?v=89"><\/script>');
    document.write('<script src="./english-mobile-playlist-v1.js?v=89"><\/script>');
    // Last mobile layer: English UI is completely hidden whenever study language is not English.
    document.write('<script src="./english-mobile-language-visibility-v1.js?v=89"><\/script>');
  } else {
    document.write('<script src="./english-desktop-unit2-bridge-v1.js?v=89"><\/script>');
  }

  // Admin-only, resumable HQ audio generator for the complete English + Chinese library.
  document.write('<script src="./audio-hq-bulk-admin-v1.js?v=89"><\/script>');
})();
