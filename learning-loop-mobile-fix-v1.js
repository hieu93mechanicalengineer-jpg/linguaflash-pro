/* LinguaFlash Learning Loop mobile controls fix v2
   - Reliable iOS/mobile controls for the fixed Learning Loop bar.
   - Adds a dynamic bottom spacer so Quiz/Dialogue/Practice content can scroll fully above the bar.
*/
(function () {
  'use strict';

  let lastActionAt = 0;
  let layoutQueued = false;
  let resizeObserver = null;

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
    scheduleLayoutUpdate();
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

  function ensureSpacer() {
    let spacer = document.getElementById('lfLearningLoopBottomSpacer');
    if (!spacer && document.body) {
      spacer = document.createElement('div');
      spacer.id = 'lfLearningLoopBottomSpacer';
      spacer.setAttribute('aria-hidden', 'true');
      spacer.style.cssText = 'height:0;min-height:0;width:100%;pointer-events:none;visibility:hidden;flex:0 0 auto;';
      document.body.appendChild(spacer);
    }
    return spacer;
  }

  function barIsVisible(bar) {
    if (!bar) return false;
    const rect = bar.getBoundingClientRect();
    const style = getComputedStyle(bar);
    return rect.height > 1 && rect.width > 1 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function updateBottomInset() {
    layoutQueued = false;
    improveButtons();

    const bar = document.getElementById('lfLearningLoopBar');
    const spacer = ensureSpacer();
    if (!spacer) return;

    if (!barIsVisible(bar)) {
      spacer.style.height = '0px';
      spacer.style.visibility = 'hidden';
      document.documentElement.style.removeProperty('--lf-loop-bottom-inset');
      document.documentElement.style.scrollPaddingBottom = '';
      if (document.body) document.body.style.scrollPaddingBottom = '';
      return;
    }

    const rect = bar.getBoundingClientRect();
    // Use the bar's top edge rather than only its own height. This also accounts for
    // the fixed mobile navigation / iPhone safe-area sitting below the Learning Loop bar.
    const viewportBottom = window.innerHeight;
    const overlayInset = Math.max(0, Math.ceil(viewportBottom - rect.top));
    const extra = 24;
    const total = overlayInset + extra;

    document.documentElement.style.setProperty('--lf-loop-bottom-inset', `${total}px`);
    document.documentElement.style.scrollPaddingBottom = `${total}px`;
    if (document.body) document.body.style.scrollPaddingBottom = `${total}px`;

    spacer.style.height = `${total}px`;
    spacer.style.visibility = 'hidden';
  }

  function scheduleLayoutUpdate() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(updateBottomInset);
  }

  function attachResizeObserver() {
    const bar = document.getElementById('lfLearningLoopBar');
    if (!bar || typeof ResizeObserver !== 'function') return;
    if (resizeObserver) resizeObserver.disconnect();
    resizeObserver = new ResizeObserver(scheduleLayoutUpdate);
    resizeObserver.observe(bar);
  }

  function init() {
    improveButtons();
    ensureSpacer();
    attachResizeObserver();
    scheduleLayoutUpdate();
  }

  document.addEventListener('pointerup', handlePointer, true);
  document.addEventListener('click', handleClick, true);
  window.addEventListener('resize', scheduleLayoutUpdate, { passive: true });
  window.addEventListener('orientationchange', scheduleLayoutUpdate, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleLayoutUpdate, { passive: true });
  window.visualViewport?.addEventListener('scroll', scheduleLayoutUpdate, { passive: true });

  const observer = new MutationObserver(() => {
    improveButtons();
    attachResizeObserver();
    scheduleLayoutUpdate();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

  window.lfRefreshLoopBottomInset = scheduleLayoutUpdate;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
