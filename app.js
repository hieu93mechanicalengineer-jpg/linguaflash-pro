/* LinguaFlash bootstrap v90
   v89: language visibility guard + full-library HQ generation.
   v90: HQ English/Chinese playback and admin generators load directly from bootstrap,
        so Safari/PWA/Zalo receive the same audio stack without relying on SW injection.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V90__) return;
  window.__LF_APP_BOOTSTRAP_V90__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  document.write('<script src="./data/english-51talk-lessons-v1.js?v=90"><\/script>');
  document.write('<script src="./app-core.js?v=90"><\/script>');

  // HQ playback + per-item/current-scope admin generation.
  document.write('<script src="./english-hq-audio-v1.js?v=90"><\/script>');
  document.write('<script src="./chinese-hq-audio-v1.js?v=90"><\/script>');
  document.write('<script src="./english-audio-admin-v1.js?v=90"><\/script>');
  document.write('<script src="./chinese-audio-admin-v1.js?v=90"><\/script>');

  // Shared English lesson data.
  document.write('<script src="./english-unit2-data-v1.js?v=90"><\/script>');
  document.write('<script src="./english-class158-health-data-v1.js?v=90"><\/script>');

  if (mobile) {
    document.write('<script src="./english-mobile-lessons-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-practice-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=90"><\/script>');
    // Workspace fetch pipeline: Unit 2 → Class 158 Health → Class 158 Work → shared parity workspace.
    document.write('<script src="./english-mobile-unit2-bridge-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-class158-health-bridge-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-class158-bridge-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-direction-v1.js?v=90"><\/script>');
    document.write('<script src="./english-mobile-playlist-v1.js?v=90"><\/script>');
    // English lesson/workspace/playlist must disappear immediately outside English study.
    document.write('<script src="./english-mobile-language-visibility-v1.js?v=90"><\/script>');
  } else {
    document.write('<script src="./english-desktop-unit2-bridge-v1.js?v=90"><\/script>');
  }

  // Admin-only, resumable HQ completion for all English + Chinese content.
  document.write('<script src="./audio-hq-bulk-admin-v1.js?v=90"><\/script>');
})();
