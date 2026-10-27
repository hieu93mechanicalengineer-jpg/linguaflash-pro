/* LinguaFlash study card touch/click fix v1
   Routes card taps/clicks through window.flipCard() so mobile reveal, flip penalty,
   and visual flip all use the same path. Prevents the legacy inline onclick from
   firing a second time after our handler.
*/
(() => {
  'use strict';

  let lastActionAt = 0;
  let pointerDown = null;

  function cardSurfaceFrom(target) {
    const surface = target?.closest?.('#flashcardContainer > div.perspective-1000');
    if (!surface || !surface.querySelector('#flashcardInner')) return null;
    return surface;
  }

  function isInteractive(target) {
    return !!target?.closest?.('button, input, textarea, select, a, label, [role="button"]');
  }

  function hasTextSelection() {
    try {
      return !!window.getSelection?.().toString().trim();
    } catch (_) {
      return false;
    }
  }

  function cancel(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function revealOrHide() {
    if (typeof window.flipCard !== 'function') return;
    window.flipCard();
  }

  function onPointerDown(event) {
    const surface = cardSurfaceFrom(event.target);
    if (!surface || isInteractive(event.target)) return;
    pointerDown = { x: event.clientX, y: event.clientY, id: event.pointerId, at: Date.now() };
  }

  function onPointerUp(event) {
    const surface = cardSurfaceFrom(event.target);
    if (!surface || isInteractive(event.target)) return;
    if (!pointerDown || pointerDown.id !== event.pointerId) return;

    const dx = Math.abs(event.clientX - pointerDown.x);
    const dy = Math.abs(event.clientY - pointerDown.y);
    const elapsed = Date.now() - pointerDown.at;
    pointerDown = null;

    if (dx > 12 || dy > 12 || elapsed > 900 || hasTextSelection()) return;

    cancel(event);
    lastActionAt = Date.now();
    revealOrHide();
  }

  function onClick(event) {
    const surface = cardSurfaceFrom(event.target);
    if (!surface || isInteractive(event.target)) return;

    // iOS normally emits a synthetic click after pointerup. Swallow it so one tap
    // flips exactly once instead of revealing and instantly hiding again.
    if (Date.now() - lastActionAt < 600) {
      cancel(event);
      return;
    }
    if (hasTextSelection()) return;

    cancel(event);
    lastActionAt = Date.now();
    revealOrHide();
  }

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointerup', onPointerUp, true);
  document.addEventListener('click', onClick, true);

  window.lfStudyCardTouchFix = { enabled: true };
})();
