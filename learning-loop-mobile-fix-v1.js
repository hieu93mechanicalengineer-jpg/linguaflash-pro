/* LinguaFlash Learning Loop mobile controls fix v1
   Uses delegated pointer/touch handling so the fixed bottom bar works reliably on iOS/mobile.
*/
(function () {
  'use strict';

  let lastActionAt = 0;

  function actionFor(button) {
    if (!button) return null;
    const code = String(button.getAttribute('onclick') || '');
    if (code.includes('lfLearningLoopNext')) return 'next';
    if (code.includes('lfLearningLoopPrev')) return 'prev';
    if (code.includes('lfLearningLoopStop')) return 'stop';
    if (code.includes('lfLearningLoopFinish')) return 'finish';
    return null;
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

  function handle(event) {
    const button = event.target?.closest?.('#lfLearningLoopBar button');
    if (!button) return;
    const action = actionFor(button);
    if (!action) return;

    // Handle touch/pointer before the study card or bottom navigation can swallow the click.
    const now = Date.now();
    if (now - lastActionAt < 350) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      return;
    }
    lastActionAt = now;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    run(action);
  }

  function improveButtons() {
    document.querySelectorAll('#lfLearningLoopBar button').forEach(btn => {
      btn.style.touchAction = 'manipulation';
      btn.style.pointerEvents = 'auto';
      btn.style.webkitTapHighlightColor = 'transparent';
    });
  }

  // Pointer events cover modern iOS Safari/PWA. Click is a keyboard/desktop fallback.
  document.addEventListener('pointerup', handle, true);
  document.addEventListener('click', event => {
    // Mouse/keyboard click fallback only. Pointer clicks were already handled above.
    if (Date.now() - lastActionAt < 450) return;
    handle(event);
  }, true);

  const observer = new MutationObserver(improveButtons);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', improveButtons, { once: true });
  else improveButtons();
})();
