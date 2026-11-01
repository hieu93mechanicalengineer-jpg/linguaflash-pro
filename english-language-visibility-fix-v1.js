/* LinguaFlash · English lesson language visibility fix v1
   51Talk English UI must only be visible while the Study language is Tiếng Anh.
   Event-driven; no MutationObserver.
*/
(() => {
  'use strict';
  if (window.__LF51_LANGUAGE_VISIBILITY_FIX_V1__) return;
  window.__LF51_LANGUAGE_VISIBILITY_FIX_V1__ = true;

  const CLASS_NAME = 'lf-hide-english-lessons';

  function ensureStyle() {
    if (document.getElementById('lf51LanguageVisibilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'lf51LanguageVisibilityStyle';
    style.textContent = `
      body.${CLASS_NAME} #lf51DesktopWorkspace,
      body.${CLASS_NAME} #lfEnglishMobileV1,
      body.${CLASS_NAME} #lfEnglishPracticeV1,
      body.${CLASS_NAME} #lf51PlaylistLauncher,
      body.${CLASS_NAME} #lf51PlaylistOverlay,
      body.${CLASS_NAME} #lf51PlaylistMini { display:none !important; }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    ensureStyle();
    const lang = document.getElementById('studyLangFilter')?.value || '';
    const english = lang === 'Tiếng Anh';
    document.body.classList.toggle(CLASS_NAME, !english);
    if (!english) {
      try { window.LF51ContinuousPlaylist?.stop?.(); } catch (_) {}
    }
  }

  document.addEventListener('change', event => {
    if (event.target?.id === 'studyLangFilter') {
      sync();
      setTimeout(sync, 0);
      setTimeout(sync, 120);
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      sync();
      [300, 900, 1800].forEach(ms => setTimeout(sync, ms));
    }, { once:true });
  } else {
    sync();
    [300, 900, 1800].forEach(ms => setTimeout(sync, ms));
  }
})();
