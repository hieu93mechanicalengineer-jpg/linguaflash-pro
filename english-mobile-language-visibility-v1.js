/* LinguaFlash · Mobile language visibility guard v1
   Keeps the English 51Talk workspace completely out of the Chinese study flow.
   No MutationObserver and no global touch interception.
*/
(() => {
  'use strict';
  if (window.__LF_MOBILE_LANGUAGE_VISIBILITY_V1__) return;
  window.__LF_MOBILE_LANGUAGE_VISIBILITY_V1__ = true;

  const STYLE_ID = 'lfMobileLanguageVisibilityV1';
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

  function sync() {
    if (!isMobileDevice()) return;
    const english = englishSelected();
    document.body?.classList.toggle(HIDE_CLASS, !english);
    if (!english) {
      document.getElementById('lf51PlaylistOverlay')?.classList.remove('open');
    }
  }

  function bind() {
    installStyle();
    const select = document.getElementById('studyLangFilter');
    if (select && !select.dataset.lfLanguageVisibilityBound) {
      select.dataset.lfLanguageVisibilityBound = '1';
      select.addEventListener('change', () => {
        sync();
        setTimeout(sync, 0);
        setTimeout(sync, 120);
      });
    }
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  [100, 350, 800, 1600, 3000, 5000].forEach(ms => setTimeout(bind, ms));
  window.addEventListener('pageshow', () => setTimeout(bind, 0));
})();
