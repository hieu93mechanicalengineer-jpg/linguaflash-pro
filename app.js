/* LinguaFlash bootstrap v94
   v90: direct HQ audio stack for Safari/PWA/Zalo.
   v91: Chinese HQ storage policy is dialogue-only; English HQ remains full-library.
   v92: show Chinese dialogue HQ coverage without touching legacy audio files.
   v93: full-dialogue playback uses HQ audio.
   v94: native speech bridge + hard language isolation fix iOS VI/EN freezes.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V94__) return;
  window.__LF_APP_BOOTSTRAP_V94__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  document.write('<script src="./data/english-51talk-lessons-v1.js?v=94"><\/script>');
  document.write('<script src="./app-core.js?v=94"><\/script>');

  // Capture untouched iOS/browser speech APIs before English/Chinese HQ wrappers patch speechSynthesis.
  document.write('<script src="./audio-native-bridge-v1.js?v=94"><\/script>');
  document.write('<script src="./english-hq-audio-v1.js?v=94"><\/script>');
  document.write('<script src="./chinese-hq-audio-v1.js?v=94"><\/script>');
  document.write('<script src="./dialogue-full-hq-v1.js?v=94"><\/script>');
  document.write('<script src="./english-audio-admin-v1.js?v=94"><\/script>');
  document.write('<script src="./chinese-audio-admin-v1.js?v=94"><\/script>');

  document.write('<script src="./english-unit2-data-v1.js?v=94"><\/script>');
  document.write('<script src="./english-class158-health-data-v1.js?v=94"><\/script>');

  if (mobile) {
    document.write('<script src="./english-mobile-lessons-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-practice-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-unit2-bridge-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-class158-health-bridge-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-class158-bridge-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-direction-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-playlist-v1.js?v=94"><\/script>');
    document.write('<script src="./english-mobile-language-visibility-v1.js?v=94"><\/script>');
  } else {
    document.write('<script src="./english-desktop-unit2-bridge-v1.js?v=94"><\/script>');
  }

  document.write('<script src="./audio-hq-bulk-admin-v1.js?v=94"><\/script>');
  document.write('<script src="./chinese-dialogue-hq-status-v1.js?v=94"><\/script>');
})();
