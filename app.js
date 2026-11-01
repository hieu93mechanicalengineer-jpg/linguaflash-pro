/* LinguaFlash bootstrap v103
   v90: direct HQ audio stack for Safari/PWA/Zalo.
   v91: Chinese HQ storage policy is dialogue-only; English HQ remains full-library.
   v92: show Chinese dialogue HQ coverage without touching legacy audio files.
   v93: full-dialogue playback uses HQ audio.
   v94: native speech bridge + hard language isolation fix iOS VI/EN freezes.
   v95: guarantee complete visible English transcripts for every 51Talk dialogue.
   v96: add Study Card/List view with hideable columns for English and Chinese.
   v97: Study List shows the complete selected lesson, independent of Smart/SRS queue.
   v98: load Bài 19 notebook supplements directly and apply verified notebook corrections.
   v99: automatically enlarge remaining Study List text as columns are hidden.
   v100: tap/click Hanzi in Study List to open a large card-like zoom view.
   v101: real FSRS-6 scheduler with D/S/R, soft legacy migration and SM-2 fallback.
   v102: normalize legacy Bài 19 notebook supplements into the current built-in card schema.
   v103: initialize the legacy Bài 19 staging array before supplement scripts run.
*/
(() => {
  'use strict';
  if (window.__LF_APP_BOOTSTRAP_V103__) return;
  window.__LF_APP_BOOTSTRAP_V103__ = true;

  const ua = String(navigator.userAgent || '');
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touch = Number(navigator.maxTouchPoints || 0) > 0;
  let coarse = false;
  try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
  const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
  const mobile = mobileUA || (touch && coarse && shortSide <= 1024);

  // The Bài 19 notebook files were authored against the old GIA_HAN_CORE_CARDS
  // staging array. The current bundle no longer creates it, so initialize a
  // temporary staging array here. The three supplement files populate/correct it,
  // then giahan-b19-normalize-v1.js converts the complete result into DEFAULT_CARDS
  // before app-core snapshots the built-in baseline.
  if (!Array.isArray(window.GIA_HAN_CORE_CARDS)) window.GIA_HAN_CORE_CARDS = [];

  document.write('<script src="./data/giahan-b19-supplement.js?v=103"><\/script>');
  document.write('<script src="./data/giahan-b19-supplement-2.js?v=103"><\/script>');
  document.write('<script src="./data/giahan-b19-supplement-3.js?v=103"><\/script>');
  document.write('<script src="./data/giahan-b19-normalize-v1.js?v=103"><\/script>');
  document.write('<script src="./data/english-51talk-lessons-v1.js?v=103"><\/script>');
  document.write('<script src="./app-core.js?v=103"><\/script>');

  document.write('<script src="./audio-native-bridge-v1.js?v=103"><\/script>');
  document.write('<script src="./english-hq-audio-v1.js?v=103"><\/script>');
  document.write('<script src="./chinese-hq-audio-v1.js?v=103"><\/script>');
  document.write('<script src="./dialogue-full-hq-v1.js?v=103"><\/script>');
  document.write('<script src="./english-audio-admin-v1.js?v=103"><\/script>');
  document.write('<script src="./chinese-audio-admin-v1.js?v=103"><\/script>');

  document.write('<script src="./english-unit2-data-v1.js?v=103"><\/script>');
  document.write('<script src="./english-class158-health-data-v1.js?v=103"><\/script>');

  if (mobile) {
    document.write('<script src="./english-mobile-lessons-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-51talk-entry-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-practice-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-practice-layout-fix-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-unit2-bridge-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-class158-health-bridge-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-class158-bridge-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-workspace-parity-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-direction-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-playlist-v1.js?v=103"><\/script>');
    document.write('<script src="./english-mobile-language-visibility-v1.js?v=103"><\/script>');
  } else {
    document.write('<script src="./english-desktop-unit2-bridge-v1.js?v=103"><\/script>');
  }

  document.write('<script src="./audio-hq-bulk-admin-v1.js?v=103"><\/script>');
  document.write('<script src="./chinese-dialogue-hq-status-v1.js?v=103"><\/script>');
  document.write('<script src="./english-dialogue-transcript-v1.js?v=103"><\/script>');
  document.write('<script src="./study-list-mode-v1.js?v=103"><\/script>');
  document.write('<script src="./study-list-auto-font-v1.js?v=103"><\/script>');
  document.write('<script src="./study-list-hanzi-zoom-v1.js?v=103"><\/script>');
  document.write('<script src="./fsrs-scheduler-v1.js?v=103"><\/script>');
})();
