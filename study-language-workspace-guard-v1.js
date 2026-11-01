/* LinguaFlash · Study language workspace guard v1
   Keeps 51Talk English mobile UI completely out of the way while studying Chinese.
   This is deliberately CSS/state based so orientation changes and late DOM inserts
   cannot make the English workspace reappear under Chinese study content.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_LANGUAGE_WORKSPACE_GUARD_V1__) return;
  window.__LF_STUDY_LANGUAGE_WORKSPACE_GUARD_V1__ = true;

  const STYLE_ID = 'lfStudyLanguageWorkspaceGuardStyle';
  const ENGLISH_VALUE = 'Tiếng Anh';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body:not(.lf-study-lang-english) #lf51DesktopWorkspace,
      body:not(.lf-study-lang-english) #lfEnglishMobileV1,
      body:not(.lf-study-lang-english) #lfEnglishPracticeV1,
      body:not(.lf-study-lang-english) #lf51PlaylistLauncher,
      body:not(.lf-study-lang-english) #lf51PlaylistOverlay,
      body:not(.lf-study-lang-english) #lf51PlaylistMini {
        display:none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    const select = document.getElementById('studyLangFilter');
    const english = !!select && select.value === ENGLISH_VALUE;
    document.body?.classList.toggle('lf-study-lang-english', english);

    if (!english) {
      // Close any open English-only sheet immediately when switching language.
      document.getElementById('lf51PlaylistOverlay')?.classList.remove('open');
    }
  }

  function bind() {
    ensureStyle();
    const select = document.getElementById('studyLangFilter');
    if (select && !select.dataset.lfLanguageWorkspaceGuard) {
      select.dataset.lfLanguageWorkspaceGuard = '1';
      select.addEventListener('change', sync);
      select.addEventListener('input', sync);
    }
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  // App/cloud reloads can rebuild study controls. Rebind without touching study logic.
  [300, 1000, 2500, 5000].forEach(ms => setTimeout(bind, ms));

  window.LFStudyLanguageWorkspaceGuard = { sync };
})();
