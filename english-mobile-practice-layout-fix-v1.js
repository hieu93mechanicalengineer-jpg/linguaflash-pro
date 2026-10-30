/* LinguaFlash · English Mobile Practice layout fix v1
   Keeps isolated practice content clear of the fixed app nav / iOS browser chrome.
   CSS-only: no touch interception, no observer, no Lesson Mode logic changes.
*/
(() => {
  'use strict';
  if (window.__LF_ENGLISH_MOBILE_PRACTICE_LAYOUT_FIX_V1__) return;
  window.__LF_ENGLISH_MOBILE_PRACTICE_LAYOUT_FIX_V1__ = true;

  const style = document.createElement('style');
  style.id = 'lfEnglishPracticeLayoutFixV1';
  style.textContent = `
    html { scroll-padding-bottom: calc(170px + env(safe-area-inset-bottom, 0px)); }
    body.lf-english-mobile-v1-active {
      padding-bottom: calc(170px + env(safe-area-inset-bottom, 0px)) !important;
    }
    body.lf-english-mobile-v1-active #lfEnglishPracticeV1 {
      margin-bottom: 0 !important;
      padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px)) !important;
    }
    #lfEnglishPracticeV1 .lfp-card,
    #lfEnglishPracticeV1 .lfp-input,
    #lfEnglishPracticeV1 .lfp-result {
      scroll-margin-bottom: calc(165px + env(safe-area-inset-bottom, 0px));
    }
    @media (orientation: landscape) {
      body.lf-english-mobile-v1-active { padding-bottom: calc(145px + env(safe-area-inset-bottom, 0px)) !important; }
      body.lf-english-mobile-v1-active #lfEnglishPracticeV1 { padding-bottom: calc(105px + env(safe-area-inset-bottom, 0px)) !important; }
    }
  `;
  document.head.appendChild(style);
})();
