/* LinguaFlash · Mobile 51Talk entry recovery v1
   Keeps the stable mobile Lesson UI selected across reloads/cache refreshes.
   It only auto-recovers from an All/empty English filter after the user has
   already used 51Talk Lesson Mode. Choosing another explicit category disables
   auto-recovery until 51Talk is selected again.
*/
(() => {
  'use strict';
  if (window.__LF_MOBILE_51TALK_ENTRY_V1__) return;
  window.__LF_MOBILE_51TALK_ENTRY_V1__ = true;

  const MODE_KEY = 'lf_mobile_51talk_lesson_mode_v1';
  const LESSON_KEYS = ['lf_mobile_english_lesson_v1','lf_mobile_english_lesson_v2'];
  let internalChange = false;
  let staleRefreshDone = false;

  const txt = el => String(el?.options?.[el.selectedIndex]?.textContent || el?.value || '').trim();
  const is51 = value => /51\s*talk/i.test(String(value || ''));
  const isAll = value => !String(value || '').trim() || /tất cả|all lessons?|all topics?|all/i.test(String(value || ''));
  const hasLessonHistory = () => {
    try {
      if (localStorage.getItem(MODE_KEY) === '1') return true;
      return LESSON_KEYS.some(k => !!localStorage.getItem(k));
    } catch (_) { return false; }
  };
  const setMode = on => { try { localStorage.setItem(MODE_KEY, on ? '1' : '0'); } catch (_) {} };

  function isMobileDevice() {
    const ua = String(navigator.userAgent || '');
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    let coarse = false;
    try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
    const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
    return mobileUA || (touch && coarse && shortSide <= 1024);
  }

  function currentCardIs51Talk() {
    try {
      const deck = window.filteredDeck;
      const index = Number(window.currentIndex || 0);
      const card = Array.isArray(deck) ? deck[index] : null;
      return is51(card?.category) || String(card?.id || '').startsWith('en51_') || is51(card?.topic);
    } catch (_) { return false; }
  }

  function find51TalkOption(select) {
    return Array.from(select?.options || []).find(o => is51(`${o.value} ${o.textContent}`)) || null;
  }

  function dispatchChange(select) {
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
    if (!lang || !category) return;

    const langText = `${lang.value} ${txt(lang)}`;
    if (!/Tiếng Anh|English/i.test(langText)) return;

    const categoryText = `${category.value} ${txt(category)}`;
    const topicText = `${topic?.value || ''} ${txt(topic)}`;
    const currently51 = is51(categoryText) || is51(topicText);

    if (currently51) {
      setMode(true);
      // If the filter says 51Talk but the deck is still stale/general English,
      // force exactly one rebuild so the Lesson UI can activate.
      if (!currentCardIs51Talk() && !staleRefreshDone) {
        staleRefreshDone = true;
        dispatchChange(category);
      }
      return;
    }

    if (!hasLessonHistory()) return;

    // Only recover from a generic All/empty category. Never override another
    // explicit English category chosen by the user.
    if (isAll(categoryText)) {
      const option = find51TalkOption(category);
      if (option) {
        category.value = option.value;
        setMode(true);
        staleRefreshDone = false;
        dispatchChange(category);
      }
    }
  }

  function bind() {
    const category = document.getElementById('studyCategoryFilter');
    if (category && category.dataset.lf51EntryBound !== '1') {
      category.dataset.lf51EntryBound = '1';
      category.addEventListener('change', () => {
        if (internalChange) return;
        const value = `${category.value} ${txt(category)}`;
        if (is51(value)) { setMode(true); staleRefreshDone = false; }
        else if (!isAll(value)) setMode(false);
      });
    }
    const lang = document.getElementById('studyLangFilter');
    if (lang && lang.dataset.lf51EntryBound !== '1') {
      lang.dataset.lf51EntryBound = '1';
      lang.addEventListener('change', () => setTimeout(recover, 80));
    }
  }

  function init() {
    if (!isMobileDevice()) return;
    bind();
    [80, 300, 900].forEach(ms => setTimeout(() => { bind(); recover(); }, ms));
    window.addEventListener('pageshow', () => setTimeout(recover, 80), { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(recover, 80); }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();