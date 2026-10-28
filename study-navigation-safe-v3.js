/* LinguaFlash study navigation safe v3
   Reliable Prev / Flip / Next controls on desktop and mobile.
   - No document-level event interception.
   - No dependency on window.nextCard/window.prevCard.
   - Uses the app's shared globals directly.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_NAV_SAFE_V3__) return;
  window.__LF_STUDY_NAV_SAFE_V3__ = true;

  const BOUND = 'data-lf-nav-safe-v3';
  let suppressClickUntil = 0;

  function actionFor(btn) {
    const key = btn?.getAttribute('data-i18n');
    if (key === 'btn_prev') return 'prev';
    if (key === 'btn_flip') return 'flip';
    if (key === 'btn_next') return 'next';
    return '';
  }

  function run(action) {
    try {
      if (action === 'flip') {
        if (typeof flipCard === 'function') flipCard();
        return true;
      }
      if (!Array.isArray(filteredDeck) || !filteredDeck.length || typeof renderCurrentCard !== 'function') return false;
      if (action === 'prev') currentIndex -= 1;
      else if (action === 'next') currentIndex += 1;
      else return false;
      renderCurrentCard();
      return true;
    } catch (err) {
      console.warn('Study navigation safe v3:', err);
      return false;
    }
  }

  function bind(btn) {
    if (!btn || btn.hasAttribute(BOUND)) return;
    const action = actionFor(btn);
    if (!action) return;

    btn.setAttribute(BOUND, action);
    btn.removeAttribute('onclick');
    btn.type = 'button';
    btn.style.touchAction = 'manipulation';
    btn.style.pointerEvents = 'auto';
    btn.style.position = 'relative';
    btn.style.zIndex = '20';
    btn.style.webkitTapHighlightColor = 'transparent';

    btn.addEventListener('pointerup', event => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
      event.preventDefault();
      suppressClickUntil = Date.now() + 700;
      run(action);
    }, { passive:false });

    btn.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      run(action);
    });
  }

  function bindAll() {
    document.querySelectorAll('#flashcardContainer button[data-i18n="btn_prev"], #flashcardContainer button[data-i18n="btn_flip"], #flashcardContainer button[data-i18n="btn_next"]').forEach(bind);
  }

  function init() {
    bindAll();
    const root = document.getElementById('flashcardContainer');
    if (root) new MutationObserver(bindAll).observe(root,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();