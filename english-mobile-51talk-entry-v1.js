/* LinguaFlash · Mobile 51Talk entry recovery v2
   Browser-independent mobile entry controller.
   - Does not depend on prior localStorage/history, so Safari, PWA and Zalo WebView behave the same.
   - On mobile English, a generic All/empty category defaults to 51Talk English.
   - An explicit non-51Talk category chosen by the user is never overridden.
   - If 51Talk is already selected, one safe change event refreshes the deck/UI.
*/
(() => {
  'use strict';
  if (window.__LF_MOBILE_51TALK_ENTRY_V2__) return;
  window.__LF_MOBILE_51TALK_ENTRY_V2__ = true;

  let internalChange = false;
  let refreshed51Talk = false;

  const textOf = el => String(el?.options?.[el.selectedIndex]?.textContent || el?.value || '').trim();
  const is51Talk = value => /51\s*talk/i.test(String(value || ''));
  const isAll = value => {
    const s = String(value || '').trim();
    return !s || /^(all|all lessons?|all topics?|tất cả|tất cả bài học|tất cả chủ đề)$/i.test(s);
  };

  function isMobileDevice() {
    const ua = String(navigator.userAgent || '');
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    let coarse = false;
    try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
    const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
    return mobileUA || (touch && coarse && shortSide <= 1024);
  }

  function isEnglishSelected(lang) {
    const s = `${lang?.value || ''} ${textOf(lang)}`;
    return /Tiếng Anh|English/i.test(s);
  }

  function find51TalkOption(select) {
    return Array.from(select?.options || []).find(option => is51Talk(`${option.value} ${option.textContent}`)) || null;
  }

  function fireChange(select) {
    if (!select) return;
    internalChange = true;
    try { select.dispatchEvent(new Event('change', { bubbles: true })); }
    finally { setTimeout(() => { internalChange = false; }, 0); }
  }

  function recover() {
    if (!isMobileDevice()) return;

    const lang = document.getElementById('studyLangFilter');
    const category = document.getElementById('studyCategoryFilter');
    const topic = document.getElementById('studyTopicFilter');
    if (!lang || !category || !isEnglishSelected(lang)) return;

    const categoryText = `${category.value || ''} ${textOf(category)}`.trim();
    const topicText = `${topic?.value || ''} ${textOf(topic)}`.trim();

    if (is51Talk(categoryText) || is51Talk(topicText)) {
      if (!refreshed51Talk) {
        refreshed51Talk = true;
        fireChange(category);
      }
      return;
    }

    // Only auto-enter 51Talk from a generic All/empty English category.
    // Explicit categories such as General English remain untouched.
    if (!isAll(category.value) && !isAll(textOf(category))) return;

    const option = find51TalkOption(category);
    if (!option) return;

    category.value = option.value;
    refreshed51Talk = true;
    fireChange(category);
  }

  function bind() {
    const lang = document.getElementById('studyLangFilter');
    const category = document.getElementById('studyCategoryFilter');

    if (lang && lang.dataset.lf51EntryV2Bound !== '1') {
      lang.dataset.lf51EntryV2Bound = '1';
      lang.addEventListener('change', () => {
        refreshed51Talk = false;
        setTimeout(recover, 60);
      });
    }

    if (category && category.dataset.lf51EntryV2Bound !== '1') {
      category.dataset.lf51EntryV2Bound = '1';
      category.addEventListener('change', () => {
        if (internalChange) return;
        const s = `${category.value || ''} ${textOf(category)}`;
        refreshed51Talk = is51Talk(s);
      });
    }
  }

  function init() {
    if (!isMobileDevice()) return;
    bind();
    [60, 220, 600, 1200, 2400, 4000].forEach(ms => setTimeout(() => {
      bind();
      recover();
    }, ms));
    window.addEventListener('pageshow', () => {
      refreshed51Talk = false;
      setTimeout(recover, 80);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        refreshed51Talk = false;
        setTimeout(recover, 80);
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
