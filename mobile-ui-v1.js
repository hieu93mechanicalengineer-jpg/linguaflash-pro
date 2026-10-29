/* LinguaFlash · Unified Mobile UI v1
   Mobile-only visual/interaction layer. Keeps desktop/core learning logic untouched.
*/
(() => {
  'use strict';
  if (window.__LF_UNIFIED_MOBILE_UI_V1__) return;
  window.__LF_UNIFIED_MOBILE_UI_V1__ = true;

  const STYLE_ID = 'lfUnifiedMobileUIV1';
  const css = `
@media (max-width: 767px) {
  :root { --lf-mobile-nav-h: 72px; }
  html { -webkit-text-size-adjust: 100%; }
  html, body { width:100%; max-width:100%; overflow-x:hidden !important; }
  body {
    overscroll-behavior-y: contain;
    padding-bottom: calc(var(--lf-mobile-nav-h) + env(safe-area-inset-bottom, 0px) + 16px) !important;
  }
  button, a, select, input, textarea { touch-action: manipulation; }
  button { -webkit-tap-highlight-color: transparent; }
  input, select, textarea { font-size:16px !important; }

  /* Header: compact but readable. Bottom nav handles primary navigation. */
  header > div:first-child { padding:10px 10px 8px !important; gap:8px !important; }
  header h1 { font-size:1rem !important; line-height:1.15 !important; }
  #headerSubtitle, #headerSubTag { font-size:.7rem !important; }
  #uiLangSelector { min-height:42px; border-radius:10px !important; }
  #headerDueCount { min-height:40px; display:inline-flex; align-items:center; }

  main.max-w-5xl { width:100% !important; max-width:100% !important; padding:10px 8px 14px !important; }

  /* Study filters: one clear control per row on phone. */
  #tab-study > .bg-white:first-child {
    padding:12px !important;
    border-radius:16px !important;
    box-shadow:0 4px 18px rgba(15,23,42,.06) !important;
  }
  #tab-study > .bg-white:first-child > div.flex.flex-wrap.items-center.gap-2 {
    display:grid !important;
    grid-template-columns:1fr !important;
    gap:7px !important;
    width:100% !important;
  }
  #tab-study > .bg-white:first-child label {
    margin:2px 0 -2px !important;
    font-size:.68rem !important;
  }
  #studyLangFilter, #studyCategoryFilter, #studyTopicFilter {
    width:100% !important;
    max-width:none !important;
    min-height:46px !important;
    padding:9px 12px !important;
    border-radius:12px !important;
    background:#f8fafc !important;
  }
  #togglePhonetic { min-height:42px; }

  /* Admin audio tools should fit naturally instead of overflowing. */
  #lfChineseAudioAdminPanel {
    width:100% !important;
    display:grid !important;
    grid-template-columns:1fr !important;
    justify-content:stretch !important;
    gap:7px !important;
    margin-top:10px !important;
  }
  #lfChineseAudioAdminPanel button,
  #lf51AudioAdminButton {
    width:100% !important;
    min-height:44px !important;
    font-size:.84rem !important;
  }
  #lfChineseAudioAdminStatus, #lf51AudioAdminStatus {
    display:block !important;
    max-width:none !important;
    width:100% !important;
    text-align:center !important;
    line-height:1.35 !important;
  }

  /* Flashcard: maximize useful screen area and keep controls thumb-friendly. */
  #flashcardContainer { width:100% !important; padding-inline:0 !important; }
  #flashcardContainer > div.w-full.max-w-xl.mb-3 { width:100% !important; max-width:100% !important; }
  #flashcardContainer > div.perspective-1000 {
    width:100% !important;
    max-width:100% !important;
    height:clamp(320px, 52dvh, 470px) !important;
    min-height:320px !important;
  }
  #flashcardInner > div {
    padding:16px 14px !important;
    border-radius:20px !important;
    overflow-y:auto !important;
    -webkit-overflow-scrolling:touch;
  }
  #frontWord {
    font-size:clamp(1.45rem, 7vw, 2.15rem) !important;
    line-height:1.13 !important;
    text-align:center;
  }
  #frontPhonetic { font-size:1rem !important; }
  #frontTopicBadge { display:none !important; }
  #backWordSmall, #backExample { overflow-wrap:anywhere; }

  #flashcardContainer button { min-height:46px; }
  #flashcardContainer .grid.grid-cols-4 {
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
    gap:7px !important;
    width:100% !important;
  }
  #flashcardContainer .grid.grid-cols-4 button {
    min-height:54px !important;
    padding:9px 6px !important;
  }
  #flashcardContainer .flex.items-center.justify-between.mt-4 {
    display:grid !important;
    grid-template-columns:1fr 1.15fr 1fr !important;
    gap:6px !important;
    width:100% !important;
  }
  #flashcardContainer .flex.items-center.justify-between.mt-4 button {
    width:100% !important;
    padding:9px 5px !important;
    font-size:.76rem !important;
  }

  /* Other learning areas: no horizontal layouts or tiny controls. */
  #tab-dialogue, #tab-grammar, #tab-pronunciation, #tab-quiz, #tab-manage, #tab-stats {
    width:100% !important;
    max-width:100% !important;
  }
  #tab-dialogue button, #tab-grammar button, #tab-pronunciation button, #tab-quiz button,
  #tab-manage button, #tab-stats button { min-height:44px; }
  #tab-dialogue select, #tab-grammar select, #tab-pronunciation select, #tab-quiz select,
  #tab-manage select { width:100% !important; max-width:100% !important; min-height:46px; }
  #tab-stats .grid { gap:8px !important; }
  #tab-stats .bg-white { padding:14px !important; border-radius:16px !important; }
  #tab-stats .text-3xl { font-size:1.55rem !important; }

  /* 51Talk desktop workspace should never force desktop width on phones. */
  #lf51DesktopWorkspace {
    width:100% !important;
    max-width:100% !important;
    overflow:hidden !important;
    border-radius:16px !important;
  }
  #lf51DesktopWorkspace .lf51d-top {
    flex-wrap:wrap !important;
    gap:7px !important;
    padding:10px !important;
  }
  #lf51DesktopWorkspace .lf51d-top select { width:100% !important; max-width:100% !important; min-height:44px; }
  #lf51DesktopWorkspace .lf51d-tabs {
    overflow-x:auto !important;
    justify-content:flex-start !important;
    scrollbar-width:none;
    padding-bottom:4px;
  }
  #lf51DesktopWorkspace .lf51d-tabs::-webkit-scrollbar { display:none; }
  #lf51DesktopWorkspace .lf51d-tab { flex:0 0 auto !important; min-height:42px; padding-inline:12px !important; }
  #lf51DesktopWorkspace .lf51d-body { display:block !important; }
  #lf51DesktopWorkspace .lf51d-coach { width:100% !important; max-width:100% !important; }

  /* Search/auth overlays become phone-sized sheets. */
  #globalSearchOverlay { padding:0 !important; align-items:stretch !important; }
  #globalSearchPanel {
    width:100% !important;
    max-width:100% !important;
    height:100dvh !important;
    max-height:100dvh !important;
    border-radius:0 !important;
    padding-top:env(safe-area-inset-top,0px);
  }
  .lf-auth-panel { width:calc(100% - 16px) !important; max-width:520px !important; max-height:90dvh; overflow-y:auto; }

  /* Mobile bottom navigation: stable, thumb-friendly, safe-area aware. */
  .mobile-app-nav {
    min-height:var(--lf-mobile-nav-h) !important;
    padding:7px 6px max(7px, env(safe-area-inset-bottom,0px)) !important;
    background:rgba(255,255,255,.96) !important;
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    box-shadow:0 -8px 28px rgba(15,23,42,.08);
    z-index:9990 !important;
  }
  .mobile-app-nav .app-mobile-nav-btn {
    min-width:0 !important;
    min-height:52px !important;
    border-radius:12px !important;
    padding:5px 2px !important;
    font-size:.68rem !important;
    line-height:1.05 !important;
  }
  .mobile-app-nav .nav-ico { font-size:1.2rem !important; line-height:1.15; }
  .mobile-app-nav .app-mobile-nav-btn.active { background:#eef2ff !important; color:#4338ca !important; }

  /* Prevent tables/content from expanding the viewport. */
  table { max-width:100%; }
  .overflow-x-auto { -webkit-overflow-scrolling:touch; }
}

@media (max-width: 390px) {
  #flashcardContainer > div.perspective-1000 { height:clamp(310px, 50dvh, 420px) !important; }
  #frontWord { font-size:clamp(1.3rem, 7.2vw, 1.85rem) !important; }
  .mobile-app-nav .app-mobile-nav-btn { font-size:.62rem !important; }
  #flashcardContainer .flex.items-center.justify-between.mt-4 button { font-size:.7rem !important; }
}
`;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function updateClass() {
    document.documentElement.classList.toggle('lf-phone-ui', window.matchMedia('(max-width: 767px)').matches);
  }

  function keepFocusedControlVisible(event) {
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const el = event.target;
    if (!el?.matches?.('input, textarea, select')) return;
    setTimeout(() => {
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (_) {}
    }, 260);
  }

  installStyle();
  updateClass();
  window.addEventListener('resize', updateClass, { passive:true });
  document.addEventListener('focusin', keepFocusedControlVisible, true);
})();