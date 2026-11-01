/* LinguaFlash · HQ Audio Bulk Admin v1
   Admin-only, resumable generation for all English + Chinese learning content.
   Existing manifest rows are always skipped, so repeated runs do not duplicate audio.
*/
(() => {
  'use strict';
  if (window.__LF_AUDIO_HQ_BULK_ADMIN_V1__) return;
  window.__LF_AUDIO_HQ_BULK_ADMIN_V1__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const MODEL = 'heygen-voice-1-turbo-free';
  const PANEL_ID = 'lfAudioBulkAdminPanel';
  const STATUS_ID = 'lfAudioBulkAdminStatus';
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  let client = null;
  let session = null;
  let isAdmin = false;
  let running = false;

  const normEn = value => String(value || '').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const normZh = value => String(value || '').replace(/\s+/g, ' ').trim();
  const hasHanzi = value => /[\u3400-\u9fff]/.test(String(value || ''));
  const hasLatin = value => /[A-Za-z]/.test(String(value || ''));

  function hashText(value, norm) {
    const text = norm(value);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function setStatus(text, tone = 'info') {
    const el = document.getElementById(STATUS_ID);
    if (!el) return;
    el.textContent = text || '';
    el.style.color = tone === 'error' ? '#b42318' : tone === 'ok' ? '#15803d' : '#475569';
  }

  function add(map, lang, text, lessonId = 'library', contentType = 'lesson') {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const norm = lang === 'zh' ? normZh : normEn;
    if (lang === 'zh' && !hasHanzi(clean)) return;
    if (lang === 'en' && (!hasLatin(clean) || hasHanzi(clean))) return;
    const key = norm(clean);
    if (map.has(key)) return;
    map.set(key, {
      audio_key: `${lang}_${hashText(clean, norm)}`,
      lesson_id: String(lessonId || 'library'),
      content_type: String(contentType || 'lesson'),
      text: clean
    });
  }

  function getAllCards() {
    try {
      if (typeof allCards !== 'undefined' && Array.isArray(allCards)) return allCards;
    } catch (_) {}
    return [];
  }

  function collectCards() {
    const zh = new Map(), en = new Map();
    for (const card of getAllCards()) {
      if (!card) continue;
      const lang = String(card.lang || '');
      const lessonId = card.topic || card.level || card.sourceLabel || 'cards';
      if (lang === 'Tiếng Trung') {
        if (card.cardType === 'sentence') add(zh, 'zh', card.meaning, lessonId, 'sentence');
        else add(zh, 'zh', card.word, lessonId, 'vocab');
        add(zh, 'zh', card.exampleChinese, lessonId, 'example');
        String(card.example || '').split(/\n+/).forEach(x => { if (hasHanzi(x)) add(zh, 'zh', x, lessonId, 'example'); });
      } else if (lang === 'Tiếng Anh') {
        if (card.cardType === 'sentence') add(en, 'en', card.chinese, lessonId, 'sentence');
        else add(en, 'en', card.word, lessonId, 'vocab');
        add(en, 'en', card.exampleEnglish, lessonId, 'example');
        const ex = String(card.example || '').trim();
        if (ex && hasLatin(ex) && !hasHanzi(ex)) add(en, 'en', ex, lessonId, 'example');
      }
    }
    return { zh, en };
  }

  function collectDialogues(zh, en) {
    try {
      if (typeof DIALOGUES_DB === 'undefined' || !DIALOGUES_DB) return;
      Object.values(DIALOGUES_DB).forEach(dialogue => {
        const lessonId = dialogue?.id || dialogue?.title || 'dialogue';
        (dialogue?.lines || []).forEach(line => {
          add(zh, 'zh', line?.cn, lessonId, 'dialogue');
          add(en, 'en', line?.en, lessonId, 'dialogue');
        });
      });
    } catch (_) {}
  }

  function addLesson(map, lesson) {
    if (!lesson) return;
    const id = lesson.id || lesson.unit || '51talk';
    (lesson.vocab || []).forEach(row => add(map, 'en', row?.[0], id, 'vocab'));
    (lesson.examples || []).forEach(row => add(map, 'en', row?.[1], id, 'example'));
    (lesson.dialogue || []).forEach(row => add(map, 'en', row?.[1], id, 'dialogue'));
    (lesson.speaking || []).forEach(row => add(map, 'en', row?.[1], id, 'speaking'));
  }

  async function loadWorkspaceLessons(en) {
    try {
      const response = await fetch('./english-51talk-desktop-workspace-v1.js?v=89', { cache: 'no-store' });
      if (response.ok) {
        const source = await response.text();
        const match = source.match(/const LESSONS\s*=\s*(\{[\s\S]*?\n\s*\});\s*\n\s*const IPA\s*=/);
        if (match) {
          const lessons = Function(`"use strict"; return (${match[1]});`)();
          Object.values(lessons || {}).forEach(lesson => addLesson(en, lesson));
        }
      }
    } catch (error) {
      console.warn('[HQ Bulk] base 51Talk source unavailable', error);
    }

    try { addLesson(en, window.LF51_UNIT2_LESSON_V1); } catch (_) {}
    try { addLesson(en, window.LF51_CLASS158_HEALTH_LESSON_V1); } catch (_) {}

    try {
      const response = await fetch('./english-mobile-class158-bridge-v1.js?v=89', { cache: 'no-store' });
      const source = response.ok ? await response.text() : '';
      const match = source.match(/const WORK_LESSON\s*=\s*String\.raw`([\s\S]*?)`;\s*\n/);
      if (match) {
        const obj = Function(`"use strict"; return ({${match[1]}});`)();
        Object.values(obj || {}).forEach(lesson => addLesson(en, lesson));
      }
    } catch (error) {
      console.warn('[HQ Bulk] Class 158 work source unavailable', error);
    }
  }

  async function collectAll() {
    setStatus('Đang nạp toàn bộ kho từ vựng để kiểm tra audio…');
    try { await window.lfLoadAllLargePacks?.(); } catch (_) {}
    const { zh, en } = collectCards();
    collectDialogues(zh, en);
    await loadWorkspaceLessons(en);
    return { zh: [...zh.values()], en: [...en.values()] };
  }

  async function existingSet(lang) {
    const table = lang === 'zh' ? 'chinese_audio_manifest' : 'english_audio_manifest';
    const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
    const norm = lang === 'zh' ? normZh : normEn;
    const result = new Set();
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await client
        .from(table)
        .select('source_text')
        .eq('locale', locale)
        .range(from, from + pageSize - 1);
      if (error) throw error;
      (data || []).forEach(row => row?.source_text && result.add(norm(row.source_text)));
      if (!data || data.length < pageSize) break;
    }
    return result;
  }

  async function callGenerator(lang, items) {
    const endpoint = lang === 'zh' ? 'generate-chinese-audio' : 'generate-english-audio';
    const response = await fetch(`${String(cfg.url || '').replace(/\/$/, '')}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${session?.access_token || ''}`,
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

  async function generateLanguage(lang, items) {
    const label = lang === 'zh' ? 'Tiếng Trung' : 'Tiếng Anh';
    const norm = lang === 'zh' ? normZh : normEn;
    const batchSize = lang === 'zh' ? 10 : 8;
    const existing = await existingSet(lang);
    const missing = items.filter(item => !existing.has(norm(item.text)));
    if (!missing.length) return { total: items.length, missing: 0, generated: 0, failed: 0 };

    let generated = 0, failed = 0;
    for (let offset = 0; offset < missing.length; offset += batchSize) {
      const batch = missing.slice(offset, offset + batchSize);
      setStatus(`${label}: đang tạo ${offset + 1}–${Math.min(offset + batch.length, missing.length)} / ${missing.length} audio còn thiếu…`);
      let payload;
      try {
        payload = await callGenerator(lang, batch);
      } catch (error) {
        throw new Error(`${label}: ${String(error?.message || error)}. Các audio đã tạo trước đó vẫn được giữ; bấm lại sau để tiếp tục.`);
      }
      generated += Number(payload.generated || 0);
      failed += Number(payload.failed || 0);
      if (lang === 'zh') await window.LFChineseHQAudio?.refresh?.();
      else await window.LFEnglishHQAudio?.refresh?.();
      if (offset + batchSize < missing.length) await sleep(250);
    }
    return { total: items.length, missing: missing.length, generated, failed };
  }

  async function run(scope) {
    if (running || !isAdmin || !session?.access_token) return;
    running = true;
    document.querySelectorAll('#lfAudioBulkAdminPanel button').forEach(b => b.disabled = true);
    try {
      const all = await collectAll();
      const parts = [];
      if (scope === 'zh' || scope === 'both') {
        const r = await generateLanguage('zh', all.zh);
        parts.push(`Trung: ${r.total - r.missing + r.generated}/${r.total}`);
      }
      if (scope === 'en' || scope === 'both') {
        const r = await generateLanguage('en', all.en);
        parts.push(`Anh: ${r.total - r.missing + r.generated}/${r.total}`);
      }
      setStatus(`✅ Hoàn tất kiểm tra/tạo HQ. ${parts.join(' · ')}`, 'ok');
    } catch (error) {
      console.error('[LinguaFlash HQ Bulk Admin]', error);
      setStatus(`⚠️ ${String(error?.message || error)}`, 'error');
    } finally {
      running = false;
      document.querySelectorAll('#lfAudioBulkAdminPanel button').forEach(b => b.disabled = false);
    }
  }

  function installStyle() {
    if (document.getElementById('lfAudioBulkAdminStyle')) return;
    const style = document.createElement('style');
    style.id = 'lfAudioBulkAdminStyle';
    style.textContent = `
      #${PANEL_ID}{display:none;width:100%;margin-top:9px;padding:10px;border:1px solid #dbe3ef;border-radius:13px;background:#f8fafc;box-sizing:border-box}
      #${PANEL_ID}.on{display:block}
      .lf-audio-bulk-title{font-size:.76rem;font-weight:950;color:#334155;margin-bottom:7px}
      .lf-audio-bulk-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
      .lf-audio-bulk-actions button{min-height:42px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#334155;font-size:.72rem;font-weight:900;padding:6px;touch-action:manipulation}
      .lf-audio-bulk-actions button[data-bulk='both']{background:#4f46e5;border-color:#4f46e5;color:#fff}
      #${STATUS_ID}{margin-top:7px;font-size:.68rem;line-height:1.4;font-weight:750;color:#64748b}
      @media(max-width:767px){.lf-audio-bulk-actions{grid-template-columns:1fr}.lf-audio-bulk-actions button{font-size:.82rem;min-height:44px}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    if (!isAdmin) return;
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.innerHTML = `
        <div class="lf-audio-bulk-title">🎙️ HQ Audio toàn thư viện · bỏ qua file đã có · có thể chạy tiếp</div>
        <div class="lf-audio-bulk-actions">
          <button type="button" data-bulk="zh">🇨🇳 Tạo toàn bộ tiếng Trung</button>
          <button type="button" data-bulk="en">🇬🇧 Tạo toàn bộ tiếng Anh</button>
          <button type="button" data-bulk="both">🌐 Tạo cả hai</button>
        </div>
        <div id="${STATUS_ID}">Admin only · Turbo Free · audio đã có sẽ không tạo lại.</div>`;
      panel.addEventListener('click', event => {
        const button = event.target.closest('button[data-bulk]');
        if (button) run(button.dataset.bulk);
      });
    }

    const filterBox = document.querySelector('#tab-study > .bg-white:first-child');
    const chinesePanel = document.getElementById('lfChineseAudioAdminPanel');
    if (chinesePanel?.parentElement) {
      chinesePanel.insertAdjacentElement('afterend', panel);
    } else if (filterBox) {
      filterBox.appendChild(panel);
    }
    panel.classList.add('on');
  }

  async function initAuth() {
    if (!cfg.url || !cfg.anonKey || !window.supabase?.createClient) return false;
    try {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) return false;
      const { data: admin, error } = await client
        .from('linguaflash_admins')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (error || !admin) return false;
      isAdmin = true;
      ensurePanel();
      return true;
    } catch (error) {
      console.warn('[HQ Bulk] admin init skipped', error);
      return false;
    }
  }

  function init() {
    installStyle();
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      if (!isAdmin && window.supabase?.createClient) await initAuth();
      if (isAdmin) ensurePanel();
      if (isAdmin || attempts >= 50) clearInterval(timer);
    }, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFAudioHQBulkAdmin = {
    run,
    canGenerate: () => isAdmin && !!session?.access_token
  };
})();
