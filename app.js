/* LinguaFlash bootstrap v88
   Loads the unchanged application core plus stable 51Talk mobile fallback UI directly.
   v83 added desktop-parity mobile workspace; v84 added VI→EN / EN→VI study direction;
   v85 integrates Class 158 work; v86 continuous listening; v87 Unit 2; v88 Class 158 Health.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V88__) return;
  window.__LF_APP_BOOTSTRAP_V88__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  document.write('<script src="./data/english-51talk-lessons-v1.js?v=88"><\/script>');
  document.write('<script src="./app-core.js?v=88"><\/script>');
  document.write('<script src="./english-unit2-data-v1.js?v=88"><\/script>');
  document.write('<script src="./english-class158-health-data-v1.js?v=88"><\/script>');

  if (mobile) {
    document.write('<script src="./english-mobile-lessons-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-practice-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=88"><\/script>');
    // Workspace fetch pipeline: Unit 2 → Class 158 Health → Class 158 Work → shared parity workspace.
    document.write('<script src="./english-mobile-unit2-bridge-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-class158-health-bridge-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-class158-bridge-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=88"><\/script>');
    document.write('<script src="./english-mobile-direction-v1.js?v=88"><\/script>');
    // Playlist reuses the same transformed workspace source, so Class 158 Health is automatically selectable.
    document.write('<script src="./english-mobile-playlist-v1.js?v=88"><\/script>');
  } else {
    document.write('<script src="./english-desktop-unit2-bridge-v1.js?v=88"><\/script>');
  }
})();
