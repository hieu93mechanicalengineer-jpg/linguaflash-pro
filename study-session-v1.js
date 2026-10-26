/* LinguaFlash Continue Session v1
   Restores the same study batch/card within the same local day.
   On a new day, keeps study filters but lets the app build a fresh FSRS/daily-goal batch.
*/
(() => {
  'use strict';

  const KEY = 'linguaflash_study_session_v1';
  let restoring = true;
  let saveTimer = null;

  function dayKey(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function readSession() {
    try {
      const raw = localStorage.getItem(KEY);
      const value = raw ? JSON.parse(raw) : null;
      return value && typeof value === 'object' ? value : null;
    } catch (_) {
      return null;
    }
  }

  function currentFilters() {
    return {
      language: document.getElementById('studyLangFilter')?.value || '',
      category: document.getElementById('studyCategoryFilter')?.value || 'ALL',
      topic: document.getElementById('studyTopicFilter')?.value || 'ALL',
      dueOnly: !!document.getElementById('studyDueOnly')?.checked,
      showPhonetic: document.getElementById('togglePhonetic') ? !!document.getElementById('togglePhonetic').checked : true
    };
  }

  function buildSession() {
    try {
      if (typeof filteredDeck === 'undefined' || !Array.isArray(filteredDeck)) return null;
      const deckIds = filteredDeck.map(card => card?.id).filter(Boolean);
      const safeIndex = deckIds.length ? Math.max(0, Math.min(Number(currentIndex) || 0, deckIds.length - 1)) : 0;
      const currentCardId = deckIds[safeIndex] || null;
      let completedIds = [];
      try {
        if (typeof activeStudyCompletedIds !== 'undefined' && activeStudyCompletedIds && typeof activeStudyCompletedIds[Symbol.iterator] === 'function') {
          completedIds = [...activeStudyCompletedIds];
        }
      } catch (_) {}

      return {
        version: 1,
        day: dayKey(),
        ...currentFilters(),
        deckIds,
        currentCardId,
        currentIndex: safeIndex,
        completedIds,
        updatedAt: Date.now()
      };
    } catch (_) {
      return null;
    }
  }

  function saveSession() {
    if (restoring) return;
    const state = buildSession();
    if (!state) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  }

  function queueSave(delay = 80) {
    if (restoring) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveSession, delay);
  }

  function optionExists(select, value) {
    return !!select && Array.from(select.options || []).some(option => option.value === value);
  }

  async function ensureCategoryLoaded(category) {
    try {
      if (category === 'TRILINGUAL DICTIONARY' && typeof window.lfLoadDictionaryPack === 'function') {
        await window.lfLoadDictionaryPack();
      } else if (category === 'Tiếng Trung Huyền Anh' && typeof window.lfLoadHuyenAnhPack === 'function') {
        await window.lfLoadHuyenAnhPack();
      }
    } catch (_) {}
  }

  function applySavedFilters(session) {
    const lang = document.getElementById('studyLangFilter');
    const category = document.getElementById('studyCategoryFilter');
    const topic = document.getElementById('studyTopicFilter');
    const dueOnly = document.getElementById('studyDueOnly');
    const phonetic = document.getElementById('togglePhonetic');

    if (lang && optionExists(lang, session.language)) lang.value = session.language;
    if (category && optionExists(category, session.category)) {
      category.value = session.category;
      try { if (typeof updateSubtopicDropdown === 'function') updateSubtopicDropdown(); } catch (_) {}
    }
    if (topic && optionExists(topic, session.topic)) topic.value = session.topic;
    if (dueOnly && typeof session.dueOnly === 'boolean') dueOnly.checked = session.dueOnly;
    if (phonetic && typeof session.showPhonetic === 'boolean') phonetic.checked = session.showPhonetic;
  }

  function restoreSavedBatch(session) {
    try {
      if (session.day !== dayKey()) return false;
      if (!Array.isArray(session.deckIds) || !session.deckIds.length) return false;
      if (typeof allCards === 'undefined' || !Array.isArray(allCards)) return false;

      const byId = new Map(allCards.filter(card => card?.id).map(card => [card.id, card]));
      const restoredDeck = session.deckIds.map(id => byId.get(id)).filter(Boolean);
      if (!restoredDeck.length) return false;

      filteredDeck = restoredDeck;
      try { activeStudyBatchIds = new Set(restoredDeck.map(card => card.id)); } catch (_) {}
      try { activeStudyCompletedIds = new Set(Array.isArray(session.completedIds) ? session.completedIds : []); } catch (_) {}

      let idx = Math.max(0, Math.min(Number(session.currentIndex) || 0, restoredDeck.length - 1));
      if (session.currentCardId && restoredDeck[idx]?.id !== session.currentCardId) {
        const exact = restoredDeck.findIndex(card => card.id === session.currentCardId);
        if (exact >= 0) idx = exact;
      }
      currentIndex = idx;
      try { if (typeof renderCurrentCard === 'function') renderCurrentCard(); } catch (_) {}
      return true;
    } catch (_) {
      return false;
    }
  }

  async function restoreSession() {
    const session = readSession();
    if (!session) {
      restoring = false;
      queueSave(300);
      return;
    }

    await ensureCategoryLoaded(session.category);
    applySavedFilters(session);

    // First let the current app rebuild a valid deck for these filters.
    try { if (typeof applyStudyFilters === 'function') applyStudyFilters(); } catch (_) {}

    // Only restore the exact 20-card batch within the same local day.
    // A new day gets a fresh batch so today's due schedule stays correct.
    restoreSavedBatch(session);

    restoring = false;
    queueSave(150);
  }

  function patchFunction(name, after) {
    try {
      const original = window[name];
      if (typeof original !== 'function' || original.__lfSessionPatched) return;
      const wrapped = function(...args) {
        const result = original.apply(this, args);
        try { after(name, args, result); } catch (_) {}
        return result;
      };
      wrapped.__lfSessionPatched = true;
      window[name] = wrapped;
    } catch (_) {}
  }

  function patchRuntime() {
    // renderCurrentCard is called after Next/Previous and after automatic typed-answer grading.
    patchFunction('renderCurrentCard', () => queueSave());
    patchFunction('applyStudyFilters', () => queueSave(120));
    patchFunction('switchTab', (_name, args) => {
      if (args?.[0] === 'study') queueSave(180);
    });
  }

  function bindLifecycle() {
    ['studyLangFilter', 'studyCategoryFilter', 'studyTopicFilter', 'studyDueOnly', 'togglePhonetic'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => queueSave(150));
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveSession();
    });
    window.addEventListener('pagehide', saveSession);
  }

  patchRuntime();

  const start = () => {
    bindLifecycle();
    // study-filter-prefs restores at ~60 ms; wait until that and app initialization settle.
    setTimeout(() => restoreSession().catch(() => { restoring = false; }), 220);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  window.lfSaveStudySession = saveSession;
  window.lfRestoreStudySession = restoreSession;
})();
