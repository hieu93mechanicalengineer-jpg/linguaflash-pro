/* LinguaFlash Learning Loop mobile controls fix v1
   Uses delegated pointer/touch handling so the fixed bottom bar works reliably on iOS/mobile.
*/
(function () {
  'use strict';

  let lastActionAt = 0;

  function buttonFrom(event) {
    return event.target?.closest?.('#lfLearningLoopBar button') || null;
  }

  function actionFor(button) {
    if (!button) return null;
    const code = String(button.getAttribute('onclick') || '');
    if (code.includes('lfLearningLoopNext')) return 'next';
    if (code.includes('lfLearningLoopPrev')) return 'prev';
    if (code.includes('lfLearningLoopStop')) return 'stop';
    if (code.includes('lfLearningLoopFinish')) return 'finish';
    return null;
  }

  function cancel(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function run(action) {
    const map = {
      next: window.lfLearningLoopNext,
      prev: window.lfLearningLoopPrev,
      stop: window.lfLearningLoopStop,
      finish: window.lfLearningLoopFinish
    };
    const fn = map[action];
    if (typeof fn === 'function') fn();
  }

  function handlePointer(event) {
    const button = buttonFrom(event);
    if (!button) return;
    const action = actionFor(button);
    if (!action) return;

    const now = Date.now();
    cancel(event);
    if (now - lastActionAt < 350) return;
    lastActionAt = now;
    run(action);
  }

  function handleClick(event) {
    const button = buttonFrom(event);
    if (!button) return;
    const action = actionFor(button);
    if (!action) return;

    const now = Date.now();
    // iOS synthesizes a click after pointerup. Swallow it so one tap advances exactly one step.
    if (now - lastActionAt < 500) {
      cancel(event);
      return;
    }

    // Keyboard/desktop fallback when no pointerup was seen.
    cancel(event);
    lastActionAt = now;
    run(action);
  }

  function improveButtons() {
    document.querySelectorAll('#lfLearningLoopBar button').forEach(btn => {
      btn.style.touchAction = 'manipulation';
      btn.style.pointerEvents = 'auto';
      btn.style.webkitTapHighlightColor = 'transparent';
    });
  }

  document.addEventListener('pointerup', handlePointer, true);
  document.addEventListener('click', handleClick, true);

  const observer = new MutationObserver(improveButtons);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', improveButtons, { once: true });
  else improveButtons();
})();
