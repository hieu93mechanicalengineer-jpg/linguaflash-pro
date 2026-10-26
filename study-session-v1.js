/* LinguaFlash Continue Session v2 */
(() => {
  'use strict';

  const KEY = 'linguaflash_study_session_v1';
  const INIT_KEY = 'linguaflash_study_session_cloud_v17_ready';
  const TABLE = 'linguaflash_study_session';
  let cloudClient = null;
  let authSession = null;
  let restoring = true;
  let bootstrapDone = false;
  let saveTimer = null;
  let cloudTimer = null;

  const parse = (raw, fallback = null) => { try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } };
  const readLocal = () => { const v = parse(localStorage.getItem(KEY), null); return v && typeof v === 'object' ? v : null; };
  const writeLocal = state => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  const clearLocal = () => { try { localStorage.removeItem(KEY); localStorage.removeItem(INIT_KEY); } catch (_) {} };
  const newer = (a, b) => !a ? (b || null) : !b ? a : (Number(a.updatedAt || 0) >= Number(b.updatedAt || 0) ? a : b);

  function dayKey(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
      const index = deckIds.length ? Math.max(0, Math.min(Number(currentIndex) || 0, deckIds.length - 1)) : 0;
      let completedIds = [];
      try {
        if (typeof activeStudyCompletedIds !== 'undefined' && activeStudyCompletedIds?.[Symbol.iterator]) completedIds = [...activeStudyCompletedIds];
      } catch (_) {}
      return {
        version: 2,
        day: dayKey(),
        ...currentFilters(),
        deckIds,
        currentCardId: deckIds[index] || null,
        currentIndex: index,
        completedIds,
        updatedAt: Date.now()
      };
    } catch (_) { return null; }
  }

  function optionExists(select, value) {
    return !!select && Array.from(select.options || []).some(option => option.value === value);
  }

  async function ensureCategoryLoaded(category) {
    try {
      if (category === 'TRILINGUAL DICTIONARY' && typeof window.lfLoadDictionaryPack === 'function') await window.lfLoadDictionaryPack();
      else if (category === 'Tiếng Trung Huyền Anh' && typeof window.lfLoadHuyenAnhPack === 'function') await window.lfLoadHuyenAnhPack();
      else if (category === '__LF_WEAK__' && typeof window.lfLoadAllLargePacks === 'function') await window.lfLoadAllLargePacks();
    } catch (_) {}
  }

  function applyFiltersFromSession(session) {
    const lang = document.getElementById('studyLangFilter');
    const cat = document.getElementById('studyCategoryFilter');
    const topic = document.getElementById('studyTopicFilter');
    const due = document.getElementById('studyDueOnly');
    const phonetic = document.getElementById('togglePhonetic');
    if (lang && optionExists(lang, session.language)) lang.value = session.language;
    if (cat && optionExists(cat, session.category)) {
      cat.value = session.category;
      try { if (typeof updateSubtopicDropdown === 'function') updateSubtopicDropdown(); } catch (_) {}
    }
    if (topic && optionExists(topic, session.topic)) topic.value = session.topic;
    if (due && typeof session.dueOnly === 'boolean') due.checked = session.dueOnly;
    if (phonetic && typeof session.showPhonetic === 'boolean') phonetic.checked = session.showPhonetic;
  }

  function restoreExactBatch(session) {
    try {
      if (session.day !== dayKey() || !Array.isArray(session.deckIds) || !session.deckIds.length) return false;
      if (typeof allCards === 'undefined' || !Array.isArray(allCards)) return false;
      const byId = new Map(allCards.filter(c => c?.id).map(c => [c.id, c]));
      const deck = session.deckIds.map(id => byId.get(id)).filter(Boolean);
      if (!deck.length) return false;
      filteredDeck = deck;
      try { activeStudyBatchIds = new Set(deck.map(c => c.id)); } catch (_) {}
      try { activeStudyCompletedIds = new Set(Array.isArray(session.completedIds) ? session.completedIds : []); } catch (_) {}
      let idx = Math.max(0, Math.min(Number(session.currentIndex) || 0, deck.length - 1));
      if (session.currentCardId && deck[idx]?.id !== session.currentCardId) {
        const exact = deck.findIndex(c => c.id === session.currentCardId);
        if (exact >= 0) idx = exact;
      }
      currentIndex = idx;
      try { if (typeof renderCurrentCard === 'function') renderCurrentCard(); } catch (_) {}
      return true;
    } catch (_) { return false; }
  }

  async function applySession(session) {
    if (!session) return false;
    writeLocal(session);
    await ensureCategoryLoaded(session.category);
    applyFiltersFromSession(session);
    try { if (typeof applyStudyFilters === 'function') applyStudyFilters(); } catch (_) {}
    restoreExactBatch(session);
    return true;
  }

  function configured() {
    const c = window.LINGUAFLASH_SUPABASE || {};
    return /^https:\/\//.test(c.url || '') && String(c.anonKey || '').length > 20 && !/YOUR_|PASTE_|example/i.test((c.url || '') + (c.anonKey || ''));
  }

  async function readCloud() {
    if (!cloudClient || !authSession?.user) return null;
    const { data, error } = await cloudClient.from(TABLE).select('session,updated_at').eq('user_id', authSession.user.id).maybeSingle();
    if (error) throw error;
    return data?.session && typeof data.session === 'object' ? data.session : null;
  }

  async function writeCloud(state) {
    if (!cloudClient || !authSession?.user || !state) return;
    const { error } = await cloudClient.from(TABLE).upsert({
      user_id: authSession.user.id,
      session: state,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw error;
  }

  async function syncFromCloud(preferCloud = false) {
    if (!cloudClient || !authSession?.user) return false;
    restoring = true;
    try {
      const local = readLocal();
      const cloud = await readCloud();
      const chosen = (preferCloud && cloud) ? cloud : newer(local, cloud);
      if (chosen) {
        await applySession(chosen);
        if (!cloud || Number(chosen.updatedAt || 0) > Number(cloud.updatedAt || 0)) await writeCloud(chosen).catch(() => {});
      }
      try { localStorage.setItem(INIT_KEY, '1'); } catch (_) {}
      return !!chosen;
    } finally {
      restoring = false;
      bootstrapDone = true;
    }
  }

  async function initCloud() {
    if (cloudClient || !configured() || !window.supabase?.createClient) return;
    const c = window.LINGUAFLASH_SUPABASE;
    cloudClient = window.supabase.createClient(c.url, c.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data } = await cloudClient.auth.getSession();
    authSession = data?.session || null;
    cloudClient.auth.onAuthStateChange((event, newSession) => {
      authSession = newSession || null;
      if (event === 'SIGNED_OUT') {
        clearLocal();
        return;
      }
      if (event === 'SIGNED_IN' && authSession?.user) {
        setTimeout(() => syncFromCloud(true).catch(err => console.warn('Study session sign-in sync:', err)), 0);
      }
    });
  }

  function saveSession() {
    if (restoring || !bootstrapDone) return;
    const state = buildSession();
    if (!state) return;
    writeLocal(state);
    clearTimeout(cloudTimer);
    if (authSession?.user) cloudTimer = setTimeout(() => writeCloud(state).catch(err => console.warn('Study session cloud sync:', err)), 700);
  }

  function queueSave(delay = 80) {
    if (restoring || !bootstrapDone) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveSession, delay);
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
    patchFunction('renderCurrentCard', () => queueSave());
    patchFunction('applyStudyFilters', () => queueSave(120));
    patchFunction('switchTab', (_name, args) => { if (args?.[0] === 'study') queueSave(180); });
  }

  function bindLifecycle() {
    ['studyLangFilter', 'studyCategoryFilter', 'studyTopicFilter', 'studyDueOnly', 'togglePhonetic'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => queueSave(150));
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSession(); });
    window.addEventListener('pagehide', saveSession);
  }

  async function bootstrap() {
    restoring = true;
    try {
      await initCloud();
      if (authSession?.user) {
        const local = readLocal();
        const cloud = await readCloud().catch(() => null);
        const alreadyMigrated = localStorage.getItem(INIT_KEY) === '1';
        const chosen = (cloud && !alreadyMigrated) ? cloud : newer(local, cloud);
        if (chosen) {
          await applySession(chosen);
          if (!cloud || Number(chosen.updatedAt || 0) > Number(cloud.updatedAt || 0)) await writeCloud(chosen).catch(() => {});
        }
        try { localStorage.setItem(INIT_KEY, '1'); } catch (_) {}
      } else {
        const local = readLocal();
        if (local) await applySession(local);
      }
    } finally {
      restoring = false;
      bootstrapDone = true;
    }
  }

  patchRuntime();
  const start = () => {
    bindLifecycle();
    setTimeout(() => bootstrap().catch(err => {
      console.warn('Study session bootstrap:', err);
      restoring = false;
      bootstrapDone = true;
    }), 220);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  window.lfSaveStudySession = saveSession;
  window.lfRestoreStudySession = () => syncFromCloud(false);
})();
