/* LinguaFlash study navigation mobile hotfix v2
   Safe mobile-only navigation fix.
   IMPORTANT: no document-level touch/click interception and no stopImmediatePropagation.
   Handlers are attached only to Prev / Flip / Next buttons inside the study controls.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_NAV_MOBILE_HOTFIX_V2__) return;
  window.__LF_STUDY_NAV_MOBILE_HOTFIX_V2__ = true;

  const BOUND = 'data-lf-mobile-nav-v2';
  let lastTouchAt = 0;

  function actionFor(btn) {
    const code = String(btn?.getAttribute('onclick') || '').replace(/\s+/g, '');
    if (code.includes('prevCard()')) return 'prev';
    if (code.includes('flipCard()')) return 'flip';
    if (code.includes('nextCard()')) return 'next';
    return '';
  }

  function run(action) {
    const fn = action === 'prev' ? window.prevCard
      : action === 'flip' ? window.flipCard
      : action === 'next' ? window.nextCard
      : null;
    if (typeof fn === 'function') fn();
  }

  function bindButton(btn) {
    if (!btn || btn.hasAttribute(BOUND)) return;
    const action = actionFor(btn);
    if (!action) return;

    btn.setAttribute(BOUND, action);
    btn.style.touchAction = 'manipulation';
    btn.style.pointerEvents = 'auto';
    btn.style.webkitTapHighlightColor = 'transparent';

    // iOS/PWA: invoke the action directly on touchend. This listener is scoped
    // to the button itself and cannot swallow taps on the rest of the app.
    btn.addEventListener('touchend', event => {
      const now = Date.now();
      if (now - lastTouchAt < 280) return;
      lastTouchAt = now;
      event.preventDefault();
      run(action);
    }, { passive: false });

    // If a synthetic click follows touchend, suppress only this button's inline
    // onclick once. Desktop/mouse click continues to use the existing inline handler.
    btn.addEventListener('click', event => {
      if (Date.now() - lastTouchAt < 650) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, false);
  }

  function bindAll() {
    document.querySelectorAll('#flashcardContainer button[onclick]').forEach(bindButton);
  }

  function init() {
    bindAll();
    const root = document.getElementById('flashcardContainer') || document.body;
    if (!root) return;
    const observer = new MutationObserver(bindAll);
    observer.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
