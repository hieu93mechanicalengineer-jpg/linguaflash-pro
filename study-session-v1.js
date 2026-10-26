/* LinguaFlash Continue Session v2
   - Restores the exact same study batch/card on the same local day.
   - Keeps filters but rebuilds a fresh FSRS/daily-goal batch on a new day.
   - Uses a dedicated Supabase row per user so phone/desktop sessions do not
     get mixed with stats metadata or overwrite each other during startup.
*/
(() => {
  'use strict';

  const KEY = 'linguaflash_study_session_v1';
  const TABLE = 'linguaflash_study_session';
  let restoring = true;
  let bootstrapDone = false;
  let saveTimer = null;
  let cloudTimer = null;
  let cloudClient = null;
  let authSession = null;

  function dayKey(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function parse(raw, fallback = null) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
  }

  function readLocalSession() {
    const value = parse(localStorage.getItem(KEY), null);
    return value && typeof value === 'object' ? value : null;
  }

  function writeLocalSession(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  }

  function newerSession(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return Number(a.updatedAt || 0) >= Number(b.updatedAt || 0) ? a : b;
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
        version: 2,
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

  async function applySession(session) {
    if (!session) return false;
    writeLocalSession(session);
    await ensureCategoryLoaded(session.category);
    applySavedFilters(session);
    try { if (typeof applyStudyFilters === 'function') applyStudyFilters(); } catch (_) {}
    restoreSavedBatch(session);
    return true;
  }

  function configured() {
    const c = window.LINGUAFLASH_SUPABASE || {};
    return /^https:\/\//.test(c.url || '') && String(c.anonKey || '').length > 20 && !/YOUR_|PASTE_|example/i.test((c.url || '') + (c.anonKey || ''));
  }

  async function initCloudClient() {
    if (cloudClient || !configured() || !window.supabase?.createClient) return;
    const c = window.LINGUAFLASH_SUPABASE;
    cloudClient = window.supabase.createClient(c.url, c.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const { data } = await cloudClient.auth.getSession();
    authSession = data?.session || null;
    cloudClient.auth.onAuthStateChange((event, newSession) => {
      authSession = newSession || null;
      if (event === 'SIGNED_IN' && authSession?.user) {
        setTimeout(() => pullCloudAndRestore().catch(() => {}), 0);
      }
    });
  }

  async function readCloudSession() {
    if (!cloudClient || !authSession?.user) return null;
    const { data, error } = await cloudClient
      .from(TABLE)
      .select('session,updated_at')
      .eq('user_id', authSession.user.id)
      .maybeSingle();
    if (error) throw error;
    return data?.session && typeof data.session === 'object' ? data.session : null;
  }

  async function writeCloudSession(state) {
    if (!cloudClient || !authSession?.user || !state) return;
    const { error } = await cloudClient.from(TABLE).upsert({
      user_id: authSession.user.id,
      session: state,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw error;
  }

  async function pullCloudAndRestore() {
    if (!cloudClient || !authSession?.user) return false;
    const local = readLocalSession();
    const cloud = await readCloudSession();
    const chosen = newerSession(local, cloud);
    if (chosen) {
      await applySession(chosen);
      if (!cloud || Number(chosen.updatedAt || 0) > Number(cloud.updatedAt || 0)) {
        await writeCloudSession(chosen).catch(() => {});
      }
    }
    return !!chosen;
  }

  function saveSession() {
    if (restoring || !bootstrapDone) return;
    const state = buildSession();
    if (!state) return;
    writeLocalSession(state);
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => writeCloudSession(state).catch(err => console.warn('Study session cloud sync:', err)), 700);
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

  async function bootstrap() {
    restoring = true;
    try {
      await initCloudClient();
      let chosen = readLocalSession();
      if (authSession?.user) {
        try {
          const cloud = await readCloudSession();
          chosen = newerSession(chosen, cloud);
        } catch (err) {
          console.warn('Study session cloud pull:', err);
        }
      }
      if (chosen) await applySession(chosen);
    } finally {
      restoring = false;
      bootstrapDone = true;
    }
  }

  patchRuntime();

  const start = () => {
    bindLifecycle();
    // Let app.js and study-filter-prefs initialize first, then pull the newest session
    // before this device is allowed to write anything back to cloud.
    setTimeout(() => bootstrap().catch(() => {
      restoring = false;
      bootstrapDone = true;
    }), 220);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  window.lfSaveStudySession = saveSession;
  window.lfRestoreStudySession = async () => {
    restoring = true;
    try {
      await initCloudClient();
      if (authSession?.user) await pullCloudAndRestore();
      else {
        const local = readLocalSession();
        if (local) await applySession(local);
      }
    } finally {
      restoring = false;
      bootstrapDone = true;
    }
  };
})();
