/* LinguaFlash study navigation mobile hotfix v1
   Makes Prev / Flip / Next reliable on iOS/Android PWA.
   Uses pointerup for touch/pen, with click fallback for desktop/keyboard,
   and suppresses the synthetic click so one tap advances exactly one card.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_NAV_MOBILE_HOTFIX_V1__) return;
  window.__LF_STUDY_NAV_MOBILE_HOTFIX_V1__ = true;

  const STYLE_ID = 'lfStudyNavMobileHotfixStyle';
  let lastActionAt = 0;
  let lastAction = '';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #flashcardContainer .flex.items-center.justify-between.mt-4{
        position:relative!important;
        z-index:80!important;
        pointer-events:auto!important;
        isolation:isolate;
      }
      #flashcardContainer .flex.items-center.justify-between.mt-4 > button{
        position:relative!important;
        z-index:81!important;
        pointer-events:auto!important;
        touch-action:manipulation!important;
        -webkit-tap-highlight-color:transparent!important;
      }
    `;
    document.head.appendChild(style);
  }

  function navButton(target) {
    const btn = target?.closest?.('#flashcardContainer button');
    if (!btn) return null;
    const code = String(btn.getAttribute('onclick') || '').replace(/\s+/g, '');
    if (code.includes('prevCard()')) return { btn, action: 'prev' };
    if (code.includes('flipCard()')) return { btn, action: 'flip' };
    if (code.includes('nextCard()')) return { btn, action: 'next' };
    return null;
  }

  function run(action) {
    const map = {
      prev: window.prevCard,
      flip: window.flipCard,
      next: window.nextCard
    };
    const fn = map[action];
    if (typeof fn !== 'function') return false;
    fn();
    return true;
  }

  function cancel(event) {
    try { event.preventDefault(); } catch (_) {}
    try { event.stopPropagation(); } catch (_) {}
    try { event.stopImmediatePropagation?.(); } catch (_) {}
  }

  function handlePointerUp(event) {
    const found = navButton(event.target);
    if (!found) return;
    if (event.pointerType === 'mouse') return;

    const now = Date.now();
    cancel(event);
    if (now - lastActionAt < 320 && lastAction === found.action) return;

    if (run(found.action)) {
      lastActionAt = now;
      lastAction = found.action;
    }
  }

  function handleTouchEnd(event) {
    // Fallback for older iOS webviews that do not dispatch PointerEvent consistently.
    if ('PointerEvent' in window) return;
    const found = navButton(event.target);
    if (!found) return;

    const now = Date.now();
    cancel(event);
    if (now - lastActionAt < 320 && lastAction === found.action) return;

    if (run(found.action)) {
      lastActionAt = now;
      lastAction = found.action;
    }
  }

  function handleClick(event) {
    const found = navButton(event.target);
    if (!found) return;

    const now = Date.now();
    // Swallow iOS's synthetic click after our pointerup/touchend action.
    if (now - lastActionAt < 650 && lastAction === found.action) {
      cancel(event);
      return;
    }

    // Desktop / keyboard fallback. Prevent inline onclick from firing a second time.
    cancel(event);
    if (run(found.action)) {
      lastActionAt = now;
      lastAction = found.action;
    }
  }

  function improveButtons() {
    ensureStyle();
    document.querySelectorAll('#flashcardContainer button').forEach(btn => {
      const code = String(btn.getAttribute('onclick') || '').replace(/\s+/g, '');
      if (!/(prevCard|flipCard|nextCard)\(\)/.test(code)) return;
      btn.style.pointerEvents = 'auto';
      btn.style.touchAction = 'manipulation';
      btn.style.webkitTapHighlightColor = 'transparent';
    });
  }

  document.addEventListener('pointerup', handlePointerUp, true);
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('click', handleClick, true);

  const observer = new MutationObserver(improveButtons);
  function init() {
    improveButtons();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
