/* LinguaFlash startup recovery: load the two largest card packs only when needed. */
(() => {
  'use strict';

  const PACKS = {
    huyen: { src: './data/huyenanh-level3-4.js', label: 'Huyền Anh Level 3–4' },
    dictionary: { src: './data/dictionary.js', label: 'TRILINGUAL DICTIONARY' }
  };
  const state = {
    huyen: { loaded: false, promise: null },
    dictionary: { loaded: false, promise: null }
  };

  function toast(message, icon = '⏳') {
    try {
      if (typeof showToast === 'function') showToast(message, icon);
    } catch (_) {}
  }

  function readProgress() {
    try {
      const raw = localStorage.getItem('linguaflash_card_progress_v2') || '{}';
      const parsed = JSON.parse(raw);
      return parsed && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function packCards(name) {
    try {
      if (name === 'huyen') {
        return (typeof HUYEN_ANH_L3_L4_CARDS !== 'undefined' && Array.isArray(HUYEN_ANH_L3_L4_CARDS))
          ? HUYEN_ANH_L3_L4_CARDS : [];
      }
      return (typeof TAV_DICTIONARY_CARDS !== 'undefined' && Array.isArray(TAV_DICTIONARY_CARDS))
        ? TAV_DICTIONARY_CARDS : [];
    } catch (_) {
      return [];
    }
  }

  function mergePack(name) {
    const cards = packCards(name);
    if (!cards.length || typeof allCards === 'undefined' || !Array.isArray(allCards)) return 0;

    const progress = readProgress();
    const existing = new Set(allCards.map(c => c && c.id).filter(Boolean));
    const additions = [];

    for (const baseCard of cards) {
      if (!baseCard || !baseCard.id) continue;
      try {
        if (typeof BUILTIN_CARD_IDS !== 'undefined' && BUILTIN_CARD_IDS && typeof BUILTIN_CARD_IDS.add === 'function') {
          BUILTIN_CARD_IDS.add(baseCard.id);
        }
        if (typeof BUILTIN_PROGRESS_BASELINE !== 'undefined' && BUILTIN_PROGRESS_BASELINE && typeof BUILTIN_PROGRESS_BASELINE.set === 'function' && typeof extractCardProgress === 'function') {
          BUILTIN_PROGRESS_BASELINE.set(baseCard.id, extractCardProgress(baseCard));
        }
      } catch (_) {}
      if (!existing.has(baseCard.id)) {
        additions.push({ ...baseCard, ...(progress[baseCard.id] || {}) });
        existing.add(baseCard.id);
      }
    }

    if (additions.length) allCards.push(...additions);

    try { if (typeof populateCategoryDropdown === 'function') populateCategoryDropdown(); } catch (_) {}
    try { if (typeof populateQuizCategoryDropdown === 'function') populateQuizCategoryDropdown(); } catch (_) {}
    try {
      if (typeof populatePronunLanguageOptions === 'function') populatePronunLanguageOptions();
      if (typeof populatePronunCategoryDropdown === 'function') populatePronunCategoryDropdown();
    } catch (_) {}
    try { if (typeof applyStudyFilters === 'function') applyStudyFilters(); } catch (_) {}
    try { if (typeof updateHeaderStats === 'function') updateHeaderStats(); } catch (_) {}
    try { if (typeof refreshAppLibrary === 'function') refreshAppLibrary(); } catch (_) {}
    try { if (typeof refreshAppHome === 'function') refreshAppHome(); } catch (_) {}
    ensureLazyOptions();
    return additions.length;
  }

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Không thể tải ' + src));
      document.head.appendChild(script);
    });
  }

  async function loadPack(name, quiet = false) {
    const cfg = PACKS[name];
    const slot = state[name];
    if (!cfg || !slot) return false;
    if (slot.loaded) return true;
    if (slot.promise) return slot.promise;

    slot.promise = (async () => {
      if (!quiet) toast(`Đang nạp ${cfg.label}…`, '⏳');
      try {
        await injectScript(cfg.src);
        const added = mergePack(name);
        slot.loaded = true;
        if (!quiet) toast(`Đã nạp ${cfg.label}${added ? ` (${added.toLocaleString()} mục)` : ''}.`, '✅');
        return true;
      } catch (err) {
        console.error('LinguaFlash lazy pack:', name, err);
        slot.promise = null;
        toast(`Không nạp được ${cfg.label}. Hãy kiểm tra mạng rồi thử lại.`, '⚠️');
        return false;
      }
    })();
    return slot.promise;
  }

  function appendOption(select, value, text) {
    if (!select || Array.from(select.options || []).some(o => o.value === value)) return;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  }

  function ensureLazyOptions() {
    if (!state.dictionary.loaded) {
      appendOption(document.getElementById('studyCategoryFilter'), 'TRILINGUAL DICTIONARY', 'TRILINGUAL DICTIONARY');
      appendOption(document.getElementById('quizCategoryFilter'), 'TRILINGUAL DICTIONARY', 'TRILINGUAL DICTIONARY');
      appendOption(document.getElementById('pronunCategoryFilter'), 'TRILINGUAL DICTIONARY', 'TRILINGUAL DICTIONARY');
    }
  }

  function loadForCategory(value) {
    if (value === 'TRILINGUAL DICTIONARY') return loadPack('dictionary');
    if (value === 'Tiếng Trung Huyền Anh') return loadPack('huyen');
    return Promise.resolve(true);
  }

  document.addEventListener('change', event => {
    const el = event.target;
    if (!el || !['studyCategoryFilter', 'quizCategoryFilter', 'pronunCategoryFilter'].includes(el.id)) return;
    loadForCategory(el.value);
  }, true);

  if (typeof window.changeUiLanguage === 'function') {
    const originalChangeUiLanguage = window.changeUiLanguage;
    window.changeUiLanguage = function(...args) {
      const result = originalChangeUiLanguage.apply(this, args);
      ensureLazyOptions();
      return result;
    };
  }

  if (typeof window.switchTab === 'function') {
    const originalSwitchTab = window.switchTab;
    window.switchTab = function(tabId) {
      const result = originalSwitchTab.apply(this, arguments);
      if (tabId === 'library' || tabId === 'stats') {
        loadPack('huyen', true);
        loadPack('dictionary', true);
      }
      return result;
    };
  }

  function patchGlobalSearch() {
    if (typeof window.openGlobalSearch !== 'function' || window.openGlobalSearch.__lfLazyPatched) return;
    const original = window.openGlobalSearch;
    const wrapped = async function() {
      toast('Đang chuẩn bị dữ liệu tìm kiếm…', '🔎');
      await Promise.all([loadPack('huyen', true), loadPack('dictionary', true)]);
      return original.apply(this, arguments);
    };
    wrapped.__lfLazyPatched = true;
    window.openGlobalSearch = wrapped;
  }

  window.lfLoadHuyenAnhPack = () => loadPack('huyen');
  window.lfLoadDictionaryPack = () => loadPack('dictionary');
  window.lfLoadAllLargePacks = () => Promise.all([loadPack('huyen'), loadPack('dictionary')]);
  window.lfLargePackState = state;

  ensureLazyOptions();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureLazyOptions();
      setTimeout(patchGlobalSearch, 0);
    }, { once: true });
  } else {
    ensureLazyOptions();
    setTimeout(patchGlobalSearch, 0);
  }
  window.addEventListener('load', () => setTimeout(patchGlobalSearch, 0), { once: true });
})();
