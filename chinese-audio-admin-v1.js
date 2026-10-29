/* LinguaFlash · Chinese HQ Audio Admin v2
   Admin-only generation. Generates only the current study scope, or one missing
   Chinese item on demand when the admin actually listens to it.
*/
(() => {
  'use strict';
  if (window.__LF_CHINESE_AUDIO_ADMIN_V2__) return;
  window.__LF_CHINESE_AUDIO_ADMIN_V2__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const MODEL = 'heygen-voice-1-turbo-free';
  const VOICE_NAME = 'Shuxian · Clear & Trustworthy';
  const BATCH_SIZE = 10;
  const PANEL_ID = 'lfChineseAudioAdminPanel';
  const STATUS_ID = 'lfChineseAudioAdminStatus';
  const CREATE_ID = 'lfChineseAudioCreateButton';
  const SAMPLE_ID = 'lfChineseAudioSampleButton';

  let client = null;
  let session = null;
  let isAdmin = false;
  let generating = false;
  const pendingOnDemand = new Map();

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const norm = value => String(value || '').replace(/\s+/g, ' ').trim();
  const hasHanzi = text => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(text || ''));

  function hashText(value) {
    const text = norm(value);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function looksMostlyChinese(text) {
    const s = norm(text);
    if (!hasHanzi(s)) return false;
    const han = (s.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
    const latin = (s.match(/[A-Za-zÀ-ỹ]/g) || []).length;
    return han >= 1 && latin <= Math.max(4, han * 0.7);
  }

  function splitCandidateText(text) {
    return String(text || '')
      .split(/\n+/)
      .map(part => part.replace(/^[•·\-–—]\s*/, '').trim())
      .filter(Boolean);
  }

  function pushItem(map, lessonId, contentType, text) {
    const clean = norm(text);
    if (!clean || !hasHanzi(clean)) return;
    const audioKey = `zh_${hashText(clean)}`;
    if (map.has(audioKey)) return;
    map.set(audioKey, {
      audio_key: audioKey,
      lesson_id: String(lessonId || 'chinese'),
      content_type: contentType || 'other',
      text: clean
    });
  }

  function getAllCards() {
    try {
      if (typeof allCards !== 'undefined' && Array.isArray(allCards)) return allCards;
    } catch (_) {}
    return [];
  }

  function cardCategory(card) {
    try {
      if (typeof parseCategoryAndTopic === 'function') {
        const parsed = parseCategoryAndTopic(card?.topic || 'Chung');
        if (parsed?.cat) return parsed.cat;
      }
    } catch (_) {}
    return card?.category || 'Chung';
  }

  function currentScope() {
    const category = document.getElementById('studyCategoryFilter')?.value || 'ALL';
    const topic = document.getElementById('studyTopicFilter')?.value || 'ALL';
    let cards = getAllCards().filter(card => card?.lang === 'Tiếng Trung');

    if (topic !== 'ALL') {
      cards = cards.filter(card => String(card?.topic || 'Chung') === topic);
    } else if (category !== 'ALL') {
      cards = cards.filter(card => cardCategory(card) === category || card?.category === category);
    } else {
      // Avoid accidental full-library generation. When no scope is selected,
      // use only the currently visible study deck instead of every Chinese card.
      try {
        if (typeof filteredDeck !== 'undefined' && Array.isArray(filteredDeck) && filteredDeck.length) {
          cards = filteredDeck.filter(card => card?.lang === 'Tiếng Trung');
        } else {
          cards = cards.slice(0, 20);
        }
      } catch (_) {
        cards = cards.slice(0, 20);
      }
    }

    const label = topic !== 'ALL'
      ? topic
      : category !== 'ALL'
        ? category
        : 'phần đang học';

    return { category, topic, cards, label };
  }

  function collectCardsFromList(cards, map) {
    (cards || []).forEach(card => {
      if (!card || card.lang !== 'Tiếng Trung') return;
      const lessonId = card.topic || card.category || 'chinese-card';
      if (card.cardType === 'sentence') {
        if (hasHanzi(card.meaning)) pushItem(map, lessonId, 'sentence', card.meaning);
      } else if (hasHanzi(card.word)) {
        pushItem(map, lessonId, 'vocab', card.word);
      }
      splitCandidateText(card.example).forEach(part => {
        if (looksMostlyChinese(part)) pushItem(map, lessonId, 'example', part);
      });
      if (hasHanzi(card.exampleChinese)) pushItem(map, lessonId, 'example', card.exampleChinese);
    });
  }

  function collectCurrentStudyAudio() {
    const scope = currentScope();
    const map = new Map();
    collectCardsFromList(scope.cards, map);
    return { ...scope, items: [...map.values()] };
  }

  async function getExistingKeys() {
    const keys = new Set();
    let from = 0;
    const page = 1000;
    while (true) {
      const { data, error } = await client
        .from('chinese_audio_manifest')
        .select('audio_key')
        .range(from, from + page - 1);
      if (error) throw error;
      (data || []).forEach(row => row?.audio_key && keys.add(row.audio_key));
      if (!data || data.length < page) break;
      from += page;
    }
    return keys;
  }

  async function getMissingItems(items) {
    const existing = await getExistingKeys();
    return items.filter(item => !existing.has(item.audio_key));
  }

  async function callGenerator(items) {
    if (!isAdmin || !session?.access_token) throw new Error('Chỉ tài khoản admin mới được tạo audio.');
    const response = await fetch(`${String(cfg.url || '').replace(/\/$/, '')}/functions/v1/generate-chinese-audio`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: MODEL, items })
    });
    const raw = await response.text();
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch (_) {}
    if (!response.ok) throw new Error(payload?.error || payload?.message || raw || `HTTP ${response.status}`);
    return payload || {};
  }

  function setStatus(text, tone = 'info') {
    const el = document.getElementById(STATUS_ID);
    if (!el) return;
    el.textContent = text || '';
    el.style.color = tone === 'error' ? '#b42318' : tone === 'ok' ? '#15803d' : '#64748b';
  }

  function setBusy(value) {
    generating = value;
    [CREATE_ID, SAMPLE_ID].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = value;
    });
  }

  async function generateItems(items, label) {
    const missing = await getMissingItems(items);
    if (!missing.length) {
      setStatus(`✅ ${label}: đã có đủ ${items.length} audio.`, 'ok');
      await window.LFChineseHQAudio?.refresh?.();
      return { generated: 0, failed: 0, missing: 0 };
    }

    let generated = 0;
    let failed = 0;
    const failures = [];
    for (let offset = 0; offset < missing.length; offset += BATCH_SIZE) {
      const batch = missing.slice(offset, offset + BATCH_SIZE);
      setStatus(`${label}: đang tạo ${offset + 1}–${Math.min(offset + batch.length, missing.length)} / ${missing.length}…`);
      const result = await callGenerator(batch);
      generated += Number(result.generated || 0);
      failed += Number(result.failed || 0);
      (result.results || []).filter(row => !row.ok).forEach(row => failures.push(row));
      await window.LFChineseHQAudio?.refresh?.();
      if (offset + BATCH_SIZE < missing.length) await sleep(350);
    }

    if (failed) {
      setStatus(`⚠️ ${label}: tạo ${generated}, lỗi ${failed}. ${failures[0]?.error || ''}`, 'error');
    } else {
      setStatus(`✅ ${label}: hoàn tất ${generated} audio mới. Tổng nội dung ${items.length}.`, 'ok');
    }
    return { generated, failed, missing: missing.length };
  }

  async function generateSample() {
    if (generating || !isAdmin) return;
    setBusy(true);
    try {
      const scope = collectCurrentStudyAudio();
      const sample = scope.items.slice(0, 5);
      if (!sample.length) throw new Error('Bài/phần đang chọn chưa có nội dung tiếng Trung để thử.');
      await generateItems(sample, 'Thử giọng Shuxian');
      await window.LFChineseHQAudio?.refresh?.();
      setTimeout(() => window.LFChineseHQAudio?.playSequence?.(sample.map(item => item.text), 0.75), 150);
    } catch (error) {
      console.error('[Chinese Audio Admin sample]', error);
      setStatus(`❌ ${String(error?.message || error)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function generateCurrentScope() {
    if (generating || !isAdmin) return;
    setBusy(true);
    try {
      const scope = collectCurrentStudyAudio();
      if (!scope.items.length) throw new Error('Bài/phần đang chọn chưa có nội dung tiếng Trung.');
      setStatus(`Đang kiểm tra ${scope.items.length} nội dung của ${scope.label}…`);
      await generateItems(scope.items, scope.label);
    } catch (error) {
      console.error('[Chinese Audio Admin scope]', error);
      setStatus(`❌ ${String(error?.message || error)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  function currentLessonId() {
    const topic = document.getElementById('studyTopicFilter')?.value || 'ALL';
    const category = document.getElementById('studyCategoryFilter')?.value || 'ALL';
    if (topic !== 'ALL') return topic;
    if (category !== 'ALL') return category;
    return 'admin-on-demand';
  }

  async function ensureAudio(text, contentType = 'ondemand') {
    const clean = norm(text);
    if (!isAdmin || !session?.access_token || !hasHanzi(clean)) return false;
    if (window.LFChineseHQAudio?.has?.(clean)) return true;

    const key = `zh_${hashText(clean)}`;
    if (pendingOnDemand.has(key)) return pendingOnDemand.get(key);

    const job = (async () => {
      try {
        const result = await callGenerator([{
          audio_key: key,
          lesson_id: currentLessonId(),
          content_type: contentType,
          text: clean
        }]);
        const ok = Number(result.generated || 0) > 0 || (result.results || []).some(row => row?.ok);
        if (ok) await window.LFChineseHQAudio?.refresh?.();
        return ok && !!window.LFChineseHQAudio?.has?.(clean);
      } catch (error) {
        console.warn('[Chinese Audio Admin on-demand]', error);
        return false;
      } finally {
        pendingOnDemand.delete(key);
      }
    })();

    pendingOnDemand.set(key, job);
    return job;
  }

  function updatePanelVisibility() {
    const panel = document.getElementById(PANEL_ID);
    const select = document.getElementById('studyLangFilter');
    if (!panel || !select) return;
    panel.style.display = isAdmin && select.value === 'Tiếng Trung' ? 'flex' : 'none';
  }

  function ensureAdminControl() {
    if (!isAdmin) return;
    if (document.getElementById(PANEL_ID)) { updatePanelVisibility(); return; }
    const select = document.getElementById('studyLangFilter');
    if (!select) return;
    const host = select.closest('.bg-white') || select.parentElement?.parentElement || select.parentElement;
    if (!host) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.marginTop = '10px';
    panel.style.display = 'flex';
    panel.style.flexWrap = 'wrap';
    panel.style.alignItems = 'center';
    panel.style.justifyContent = 'flex-end';
    panel.style.gap = '8px';

    const sampleBtn = document.createElement('button');
    sampleBtn.id = SAMPLE_ID;
    sampleBtn.type = 'button';
    sampleBtn.textContent = '🔊 Thử giọng Trung · 5 câu';
    sampleBtn.style.cssText = 'border:1px solid #a7f3d0;background:#ecfdf5;color:#047857;border-radius:10px;padding:7px 10px;font-weight:800;cursor:pointer';
    sampleBtn.addEventListener('click', generateSample);

    const createBtn = document.createElement('button');
    createBtn.id = CREATE_ID;
    createBtn.type = 'button';
    createBtn.textContent = '🎙️ Tạo audio bài đang học';
    createBtn.style.cssText = 'border:1px solid #f0abfc;background:#fdf4ff;color:#a21caf;border-radius:10px;padding:7px 10px;font-weight:850;cursor:pointer';
    createBtn.addEventListener('click', generateCurrentScope);

    const status = document.createElement('span');
    status.id = STATUS_ID;
    status.textContent = `Admin only · Turbo Free · ${VOICE_NAME} · tự tạo khi bạn bấm nghe`;
    status.style.cssText = 'font-size:.72rem;font-weight:700;color:#64748b;max-width:560px';

    panel.append(sampleBtn, createBtn, status);
    host.appendChild(panel);
    select.addEventListener('change', updatePanelVisibility);
    updatePanelVisibility();
  }

  async function initAuth() {
    if (!cfg.url || !cfg.anonKey || !window.supabase?.createClient) return;
    try {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) return;

      const { data: admin, error } = await client
        .from('linguaflash_admins')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (error || !admin) return;

      isAdmin = true;
      ensureAdminControl();
      client.auth.onAuthStateChange(async (_event, nextSession) => {
        session = nextSession || null;
        if (!session?.user) {
          isAdmin = false;
          document.getElementById(PANEL_ID)?.remove();
          return;
        }
        const { data: nextAdmin } = await client.from('linguaflash_admins').select('role').eq('user_id', session.user.id).maybeSingle();
        isAdmin = !!nextAdmin;
        if (isAdmin) setTimeout(ensureAdminControl, 50);
        else document.getElementById(PANEL_ID)?.remove();
      });
    } catch (error) {
      console.warn('[Chinese Audio Admin] init skipped', error);
    }
  }

  const observer = new MutationObserver(() => { if (isAdmin) ensureAdminControl(); });
  function init() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    initAuth();
    setTimeout(() => isAdmin && ensureAdminControl(), 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFChineseAudioAdmin = {
    collectCurrentStudyAudio,
    generateSample,
    generateCurrentScope,
    ensureAudio,
    canGenerate: () => isAdmin && !!session?.access_token,
    model: MODEL,
    voice: VOICE_NAME
  };
})();