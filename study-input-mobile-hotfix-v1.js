/* LinguaFlash study input mobile hotfix v1
   Keeps the typed-answer field interactive on iOS/PWA after dynamic study modules render.
   Does not alter grading, answer checking, or FSRS scheduling.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_INPUT_MOBILE_HOTFIX_V1__) return;
  window.__LF_STUDY_INPUT_MOBILE_HOTFIX_V1__ = true;

  const STYLE_ID = 'lfStudyInputMobileHotfixStyle';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #studyAnswerPanel{position:relative!important;z-index:30!important;pointer-events:auto!important}
      #studyAnswerPanel *{pointer-events:auto}
      #studyAnswerInput{
        position:relative!important;
        z-index:31!important;
        pointer-events:auto!important;
        touch-action:manipulation!important;
        -webkit-user-select:text!important;
        user-select:text!important;
        -webkit-touch-callout:default!important;
        opacity:1!important;
      }
      #studyAnswerInput:disabled{opacity:1!important;color:#0f172a!important;-webkit-text-fill-color:#0f172a!important}
    `;
    document.head.appendChild(style);
  }

  function isAnswerLockedAfterCorrect(input) {
    if (!input) return false;
    return input.classList.contains('border-emerald-400') || input.classList.contains('bg-emerald-50');
  }

  function repairInput(force = false) {
    const input = document.getElementById('studyAnswerInput');
    if (!input) return null;
    input.readOnly = false;
    input.removeAttribute('readonly');
    input.tabIndex = 0;
    input.style.pointerEvents = 'auto';
    input.style.touchAction = 'manipulation';
    input.style.webkitUserSelect = 'text';
    input.style.userSelect = 'text';
    if ((force || !isAnswerLockedAfterCorrect(input)) && input.disabled) {
      input.disabled = false;
      input.removeAttribute('disabled');
    }
    return input;
  }

  function focusInput(event) {
    const input = event.target?.closest?.('#studyAnswerInput');
    if (!input) return;
    repairInput(true);
    try { input.focus({ preventScroll: true }); }
    catch (_) { try { input.focus(); } catch (_) {} }
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lfInputMobileHotfixPatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      setTimeout(() => repairInput(false), 0);
      setTimeout(() => repairInput(false), 80);
      return result;
    };
    wrapped.__lfInputMobileHotfixPatched = true;
    window.renderCurrentCard = wrapped;
  }

  document.addEventListener('pointerdown', focusInput, true);
  document.addEventListener('touchstart', focusInput, { capture: true, passive: true });
  document.addEventListener('click', focusInput, true);

  const observer = new MutationObserver(() => {
    ensureStyle();
    repairInput(false);
    patchRender();
  });

  function init() {
    ensureStyle();
    repairInput(false);
    patchRender();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(() => repairInput(false), 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
