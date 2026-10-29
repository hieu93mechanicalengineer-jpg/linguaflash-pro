/* LinguaFlash · Chinese HQ Audio Admin v1 */
(() => {
  'use strict';
  if (window.__LF_CHINESE_AUDIO_ADMIN_V1__) return;
  window.__LF_CHINESE_AUDIO_ADMIN_V1__ = true;

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
    return han >= 2 && latin <= Math.max(4, han * 0.7);
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

  function collectCards(map) {
    let cards = [];
    try { if (typeof allCards !== 'undefined' && Array.isArray(allCards)) cards = allCards; } catch (_) {}
    cards.forEach(card => {
      if (!card || card.lang !== 'Tiếng Trung') return;
      const lessonId = card.topic || card.category || 'chinese-card';
      if (card.cardType === 'sentence') {
        if (hasHanzi(card.meaning)) pushItem(map, lessonId, 'sentence', card.meaning);
      } else {
        if (hasHanzi(card.word)) pushItem(map, lessonId, 'vocab', card.word);
      }
      splitCandidateText(card.example).forEach(part => {
        if (looksMostlyChinese(part)) pushItem(map, lessonId, 'example', part);
      });
    });
  }

  function collectDialogues(map) {
    let db = null;
    try { if (typeof DIALOGUES_DB !== 'undefined') db = DIALOGUES_DB; } catch (_) {}
    if (!db || typeof db !== 'object') return;
    Object.entries(db).forEach(([key, dlg]) => {
      const lines = Array.isArray(dlg?.lines) ? dlg.lines : [];
      lines.forEach(line => {
        const text = line?.cn || '';
        const locale = String(line?.lang || dlg?.language || '');
        if (hasHanzi(text) && (/^zh/i.test(locale) || looksMostlyChinese(text))) {
          pushItem(map, `dialogue_${key}`, 'dialogue', text);
        }
      });
    });
  }

  function collectGrammarObject(map, value, context = 'grammar') {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(item => collectGrammarObject(map, item, context));
      return;
    }
    if (typeof value !== 'object') return;
    const nextContext = value.section || value.lesson || value.title || context;
    if (typeof value.cn === 'string' && hasHanzi(value.cn)) {
      pushItem(map, nextContext, 'grammar', value.cn);
    }
    Object.entries(value).forEach(([key, child]) => {
      if (key === 'cn') return;
      if (child && typeof child === 'object') collectGrammarObject(map, child, `${nextContext}_${key}`);
    });
  }

  function collectGrammar(map) {
    try { if (typeof GIA_HAN_GRAMMAR_DB !== 'undefined') collectGrammarObject(map, GIA_HAN_GRAMMAR_DB, 'giahan_grammar'); } catch (_) {}
    try { if (typeof GIA_HAN_GRAMMAR_PACK_TC2 !== 'undefined') collectGrammarObject(map, GIA_HAN_GRAMMAR_PACK_TC2, 'giahan_tc2_grammar'); } catch (_) {}
  }

  function collectAllChineseAudio() {
    const map = new Map();
    collectCards(map);
    collectDialogues(map);
    collectGrammar(map);
    return [...map.values()];
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
    if (generating) return;
    setBusy(true);
    try {
      const all = collectAllChineseAudio();
      const sample = all.slice(0, 5);
      if (!sample.length) throw new Error('Chưa đọc được dữ liệu tiếng Trung trong app.');
      await generateItems(sample, 'Thử giọng Shuxian');
      await window.LFChineseHQAudio?.refresh?.();
      const texts = sample.map(item => item.text);
      setTimeout(() => window.LFChineseHQAudio?.playSequence?.(texts, 0.75), 150);
    } catch (error) {
      console.error('[Chinese Audio Admin sample]', error);
      setStatus(`❌ ${String(error?.message || error)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function generateAll() {
    if (generating) return;
    setBusy(true);
    try {
      setStatus('Đang quét toàn bộ nội dung tiếng Trung…');
      const all = collectAllChineseAudio();
      if (!all.length) throw new Error('Chưa đọc được dữ liệu tiếng Trung trong app.');
      const existing = await getExistingKeys();
      const missingCount = all.filter(item => !existing.has(item.audio_key)).length;
      setStatus(`Đã quét ${all.length} nội dung tiếng Trung · còn thiếu ${missingCount}. Bắt đầu tạo…`);
      await generateItems(all, 'Tiếng Trung HQ');
    } catch (error) {
      console.error('[Chinese Audio Admin]', error);
      setStatus(`❌ ${String(error?.message || error)}`, 'error');
    } finally {
      setBusy(false);
    }
  }

  function updatePanelVisibility() {
    const panel = document.getElementById(PANEL_ID);
    const select = document.getElementById('studyLangFilter');
    if (!panel || !select) return;
    panel.style.display = select.value === 'Tiếng Trung' ? 'flex' : 'none';
  }

  function ensureAdminControl() {
    if (!isAdmin || document.getElementById(PANEL_ID)) { updatePanelVisibility(); return; }
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
    createBtn.textContent = '🎙️ Tạo audio HQ tiếng Trung';
    createBtn.style.cssText = 'border:1px solid #f0abfc;background:#fdf4ff;color:#a21caf;border-radius:10px;padding:7px 10px;font-weight:850;cursor:pointer';
    createBtn.addEventListener('click', generateAll);

    const status = document.createElement('span');
    status.id = STATUS_ID;
    status.textContent = `Turbo Free · ${VOICE_NAME} · phát mặc định 0.75×`;
    status.style.cssText = 'font-size:.72rem;font-weight:700;color:#64748b;max-width:520px';

    panel.append(sampleBtn, createBtn, status);
    host.appendChild(panel);
    select.addEventListener('change', updatePanelVisibility);
    updatePanelVisibility();
  }

  async function initAuth() {
    if (!cfg.url || !cfg.anonKey || !window.supabase?.createClient) return;
    try {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) return;
      const { data: admin, error } = await client.from('linguaflash_admins').select('role').eq('user_id', session.user.id).maybeSingle();
      if (error || !admin) return;
      isAdmin = true;
      ensureAdminControl();
      client.auth.onAuthStateChange((_event, nextSession) => { session = nextSession || null; setTimeout(ensureAdminControl, 50); });
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

  window.LFChineseAudioAdmin = { collectAllChineseAudio, generateSample, generateAll, model: MODEL, voice: VOICE_NAME };
})();