/* LinguaFlash study filter preferences
   Keeps Study language/topic filters stable across app restarts on this device.
*/
(() => {
  'use strict';

  const KEY = 'linguaflash_study_filter_prefs_v1';
  let restoring = false;

  function readPrefs() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function optionExists(select, value) {
    if (!select || value == null) return false;
    return Array.from(select.options || []).some(opt => opt.value === value);
  }

  function savePrefs() {
    if (restoring) return;
    const lang = document.getElementById('studyLangFilter');
    const category = document.getElementById('studyCategoryFilter');
    const topic = document.getElementById('studyTopicFilter');
    const dueOnly = document.getElementById('studyDueOnly');
    const phonetic = document.getElementById('togglePhonetic');
    if (!lang) return;

    const prefs = {
      language: lang.value || '',
      category: category?.value || 'ALL',
      topic: topic?.value || 'ALL',
      dueOnly: !!dueOnly?.checked,
      showPhonetic: phonetic ? !!phonetic.checked : true,
      updatedAt: Date.now()
    };
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) {}
  }

  function restorePrefs() {
    const prefs = readPrefs();
    if (!prefs) return;

    const lang = document.getElementById('studyLangFilter');
    const category = document.getElementById('studyCategoryFilter');
    const topic = document.getElementById('studyTopicFilter');
    const dueOnly = document.getElementById('studyDueOnly');
    const phonetic = document.getElementById('togglePhonetic');
    if (!lang) return;

    restoring = true;
    try {
      if (optionExists(lang, prefs.language)) lang.value = prefs.language;

      // Category/topic options are data-dependent. Restore category first, rebuild topics,
      // then restore the exact lesson if it still exists in the current content bundle.
      if (category && optionExists(category, prefs.category)) {
        category.value = prefs.category;
        try { if (typeof updateSubtopicDropdown === 'function') updateSubtopicDropdown(); } catch (_) {}
      }
      if (topic && optionExists(topic, prefs.topic)) topic.value = prefs.topic;
      if (dueOnly && typeof prefs.dueOnly === 'boolean') dueOnly.checked = prefs.dueOnly;
      if (phonetic && typeof prefs.showPhonetic === 'boolean') phonetic.checked = prefs.showPhonetic;

      try { if (typeof applyStudyFilters === 'function') applyStudyFilters(); } catch (_) {}
      try { if (typeof renderCurrentCard === 'function') renderCurrentCard(); } catch (_) {}
    } finally {
      restoring = false;
    }
  }

  function bind() {
    const ids = ['studyLangFilter', 'studyCategoryFilter', 'studyTopicFilter', 'studyDueOnly', 'togglePhonetic'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => setTimeout(savePrefs, 0));
    });

    // app.js initializes filters synchronously. Restore after that initialization settles.
    setTimeout(restorePrefs, 60);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();

  window.lfSaveStudyFilterPrefs = savePrefs;
  window.lfRestoreStudyFilterPrefs = restorePrefs;
})();
