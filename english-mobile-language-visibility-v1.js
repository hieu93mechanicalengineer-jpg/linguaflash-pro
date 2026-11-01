/* LinguaFlash · Mobile language visibility guard v2
   Hard-isolates the English 51Talk UI from Chinese/Vietnamese study flows.
   v2 clears stale English body/root state immediately on language changes.
*/
(() => {
  'use strict';
  if (window.__LF_MOBILE_LANGUAGE_VISIBILITY_V2__) return;
  window.__LF_MOBILE_LANGUAGE_VISIBILITY_V2__ = true;

  const STYLE_ID = 'lfMobileLanguageVisibilityV2';
  const HIDE_CLASS = 'lf-study-not-english';

  function isMobileDevice() {
    const ua = String(navigator.userAgent || '');
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    let coarse = false;
    try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
    const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
    return mobileUA || (touch && coarse && shortSide <= 1024);
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.${HIDE_CLASS} #lfEnglishMobileV1,
      body.${HIDE_CLASS} #lfEnglishPracticeV1,
      body.${HIDE_CLASS} #lf51DesktopWorkspace,
      body.${HIDE_CLASS} #lf51CoachShell,
      body.${HIDE_CLASS} #lf51GrammarPanel,
      body.${HIDE_CLASS} #lf51PatternPractice,
      body.${HIDE_CLASS} #lf51Listening,
      body.${HIDE_CLASS} #lf51PlaylistLauncher,
      body.${HIDE_CLASS} #lf51PlaylistMini,
      body.${HIDE_CLASS} #lf51PlaylistOverlay {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function englishSelected() {
    const select = document.getElementById('studyLangFilter');
    if (!select) return false;
    const value = String(select.value || '').trim();
    const label = String(select.selectedOptions?.[0]?.textContent || '').trim();
    return value === 'Tiếng Anh' || /Tiếng Anh|English/i.test(label);
  }

  function hardDisableEnglish() {
    const body = document.body;
    if (!body) return;

    body.classList.remove('lf51-desktop-active', 'lf-english-mobile-v1-active');
    document.getElementById('lf51DesktopWorkspace')?.classList.remove('on');
    document.getElementById('lfEnglishMobileV1')?.classList.remove('on');
    document.getElementById('lfEnglishPracticeV1')?.classList.remove('on');
    document.getElementById('lf51PlaylistOverlay')?.classList.remove('open');

    // If a hidden English player is still running, stop it so it cannot compete
    // with Chinese/Vietnamese playback or leave an invisible control layer alive.
    try { window.LF51ContinuousPlaylist?.stop?.(); } catch (_) {}
    body.classList.remove('lf51-playlist-playing');
  }

  function sync() {
    if (!isMobileDevice()) return;
    const english = englishSelected();
    document.body?.classList.toggle(HIDE_CLASS, !english);
    if (!english) hardDisableEnglish();
  }

  function bind() {
    installStyle();
    const select = document.getElementById('studyLangFilter');
    if (select && !select.dataset.lfLanguageVisibilityV2Bound) {
      select.dataset.lfLanguageVisibilityV2Bound = '1';
      // Capture phase clears stale English state before older target listeners run.
      select.addEventListener('change', sync, true);
      select.addEventListener('change', () => {
        setTimeout(sync, 0);
        setTimeout(sync, 80);
        setTimeout(sync, 220);
      });
    }
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  [80, 260, 700, 1500, 3000, 5000].forEach(ms => setTimeout(bind, ms));
  window.addEventListener('pageshow', () => setTimeout(bind, 0));
})();
