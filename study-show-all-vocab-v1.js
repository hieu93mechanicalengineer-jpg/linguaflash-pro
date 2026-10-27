/* LinguaFlash Study Show All Vocabulary v1
   When a learner explicitly selects a lesson and turns OFF "due only",
   Daily Goal exhaustion must not hide the lesson. If the scheduled batch is empty,
   rebuild the deck from all cards in the selected lesson.
   Also makes the empty-state "show all vocabulary" action reliable.
*/
(() => {
  'use strict';

  function optionValue(id, fallback = '') {
    return document.getElementById(id)?.value || fallback;
  }

  function dueOnlyEnabled() {
    return !!document.getElementById('studyDueOnly')?.checked;
  }

  function cardMatches(card, lang, category, topic) {
    try {
      const text = typeof getCardTextInLanguage === 'function'
        ? getCardTextInLanguage(card, lang)
        : (card?.word || '');
      if (!String(text || '').trim()) return false;

      if (category && category !== 'ALL') {
        const cardCategory = typeof getCardCategory === 'function'
          ? getCardCategory(card)
          : String(card?.topic || '').split(' - ')[0];
        if (cardCategory !== category) return false;
      }

      if (topic && topic !== 'ALL') {
        if (typeof parseCategoryAndTopic === 'function') {
          const selectedSub = parseCategoryAndTopic(topic)?.sub;
          const cardSub = parseCategoryAndTopic(card?.topic || '')?.sub;
          if (cardSub !== selectedSub) return false;
        } else if (!String(card?.topic || '').includes(topic)) {
          return false;
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function buildFullLessonDeck({ requireSpecificLesson = false } = {}) {
    try {
      if (dueOnlyEnabled()) return false;
      if (!Array.isArray(allCards) || !allCards.length) return false;

      const lang = optionValue('studyLangFilter', 'Tiếng Trung');
      const category = optionValue('studyCategoryFilter', 'ALL');
      const topic = optionValue('studyTopicFilter', 'ALL');
      if (requireSpecificLesson && topic === 'ALL') return false;

      const pool = allCards.filter(card => cardMatches(card, lang, category, topic));
      if (!pool.length) return false;

      filteredDeck = pool;
      try { activeStudyBatchIds = new Set(pool.map(card => card?.id).filter(Boolean)); } catch (_) {}
      try { activeStudyCompletedIds = new Set(); } catch (_) {}
      currentIndex = 0;
      try { if (typeof renderCurrentCard === 'function') renderCurrentCard(); } catch (_) {}
      try { if (typeof window.lfSaveStudySession === 'function') window.lfSaveStudySession(); } catch (_) {}
      return true;
    } catch (_) {
      return false;
    }
  }

  function patchApplyStudyFilters() {
    const original = window.applyStudyFilters;
    if (typeof original !== 'function' || original.__lfShowAllPatched) return;

    const wrapped = function(...args) {
      const result = original.apply(this, args);
      try {
        const topic = optionValue('studyTopicFilter', 'ALL');
        if (!dueOnlyEnabled() && topic !== 'ALL' && Array.isArray(filteredDeck) && filteredDeck.length === 0) {
          buildFullLessonDeck({ requireSpecificLesson: true });
        }
      } catch (_) {}
      return result;
    };
    wrapped.__lfShowAllPatched = true;
    window.applyStudyFilters = wrapped;
  }

  function handleEmptyStateAction(event) {
    const empty = event.target?.closest?.('#studyEmptyState');
    if (!empty) return;
    const button = event.target?.closest?.('button');
    if (!button) return;

    const label = String(button.textContent || '').toLocaleLowerCase();
    const looksLikeShowAll = /xem tất cả|tất cả từ vựng|show all|全部|所有词/.test(label);
    if (!looksLikeShowAll) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    const due = document.getElementById('studyDueOnly');
    if (due) due.checked = false;
    buildFullLessonDeck({ requireSpecificLesson: false });
  }

  function init() {
    patchApplyStudyFilters();
    document.addEventListener('click', handleEmptyStateAction, true);

    // Some older wrappers may replace applyStudyFilters after DOM ready.
    setTimeout(patchApplyStudyFilters, 300);
    setTimeout(patchApplyStudyFilters, 1200);
  }

  window.lfStudyShowAllVocabulary = () => {
    const due = document.getElementById('studyDueOnly');
    if (due) due.checked = false;
    return buildFullLessonDeck({ requireSpecificLesson: false });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
