/* LinguaFlash · Full HQ Audio Library Admin v1
   Admin-only bulk completion for Chinese + English HQ audio.
   - Never regenerates manifest entries that already exist.
   - Chinese: scans all Chinese study cards.
   - English: scans all English study cards + every lesson in the 51Talk workspace.
   - Runs only after an explicit admin tap, so HeyGen quota is never spent on page load.
*/
(() => {
  'use strict';
  if (window.__LF_AUDIO_LIBRARY_ADMIN_V1__) return;
  window.__LF_AUDIO_LIBRARY_ADMIN_V1__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const MODEL = 'heygen-voice-1-turbo-free';
  const PANEL_ID = 'lfAudioLibraryAdminPanel';
  const STATUS_ID = 'lfAudioLibraryAdminStatus';
  const BTN_ZH = 'lfAudioLibraryAllZh';
  const BTN_EN = 'lfAudioLibraryAllEn';
  const BTN_STOP = 'lfAudioLibraryStop';
  const ZH_BATCH = 10;
  const EN_BATCH = 8;

  let client = null;
  let session = null;
  let isAdmin = false;
  let running = false;
  let stopRequested = false;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const normEn = value => clean(value).replace(/[’]/g, "'").toLowerCase();
  const hasHanzi = value => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(value || ''));
  const hasVietnameseMarks = value => /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(String(value || ''));
  const looksEnglish = value => {
    const s = clean(value);
    return !!s && /[A-Za-z]/.test(s) && !hasHanzi(s) && !hasVietnameseMarks(s);
  };

  function hashText(value, normalizer = clean) {
    const text = normalizer(value);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function getAllCards() {
    try {
      if (typeof allCards !== 'undefined' && Array.isArray(allCards)) return allCards;
    } catch (_) {}
    return [];
  }

  function pushZh(map, lessonId, type, text) {
    const value = clean(text);
    if (!value || !hasHanzi(value)) return;
    const key = `zh_${hashText(value)}`;
    if (!map.has(key)) map.set(key, { audio_key:key, lesson_id:String(lessonId || 'chinese'), content_type:type || 'other', text:value });
  }

  function pushEn(map, lessonId, type, text) {
    const value = clean(text);
    if (!value || !looksEnglish(value)) return;
    const key = normEn(value);
    if (!map.has(key)) map.set(key, { audio_key:`en_${hashText(value, normEn)}`, lesson_id:String(lessonId || 'english'), content_type:type || 'lesson', text:value });
  }

  function collectAllChineseCards() {
    const map = new Map();
    getAllCards().forEach(card => {
      if (!card || card.lang !== 'Tiếng Trung') return;
      const lesson = card.topic || card.category || 'chinese-card';
      if (card.cardType === 'sentence') {
        pushZh(map, lesson, 'sentence', card.meaning);
      } else {
        pushZh(map, lesson, 'vocab', card.word);
      }
      pushZh(map, lesson, 'example', card.example);
      pushZh(map, lesson, 'example', card.exampleChinese);
      if (card.cardType !== 'sentence') pushZh(map, lesson, 'related', card.chinese);
    });
    return [...map.values()];
  }

  function collectEnglishCards(map) {
    getAllCards().forEach(card => {
      if (!card || card.lang !== 'Tiếng Anh') return;
      const lesson = card.topic || card.category || 'english-card';
      if (card.cardType === 'sentence') {
        // Current multilingual sentence schema: English target is stored in `chinese`.
        pushEn(map, lesson, 'sentence', card.chinese);
      } else {
        pushEn(map, lesson, 'vocab', card.word);
      }
      pushEn(map, lesson, 'example', card.example);
    });
  }

  async function collectAllEnglish() {
    const map = new Map();
    collectEnglishCards(map);

    // The shared workspace contains the richer 51Talk lessons that are not all
    // represented as flashcards. Reuse the tested current-lesson collector.
    const select = document.querySelector('#lf51DesktopWorkspace [data-lesson-select]');
    const admin = window.LFEnglishAudioAdmin;
    if (!select || typeof admin?.collectCurrentLessonAudio !== 'function') return [...map.values()];

    const original = select.value;
    const options = [...select.options].map(o => o.value).filter(Boolean);
    for (const lessonId of options) {
      if (stopRequested) break;
      try {
        select.value = lessonId;
        select.dispatchEvent(new Event('change', { bubbles:true }));
        await sleep(40);
        const scope = await admin.collectCurrentLessonAudio();
        (scope?.items || []).forEach(item => pushEn(map, item.lesson_id || lessonId, item.content_type || 'lesson', item.text));
      } catch (error) {
        console.warn('[Bulk HQ Audio] skip English lesson', lessonId, error);
      }
    }
    if (original && [...select.options].some(o => o.value === original)) {
      select.value = original;
      select.dispatchEvent(new Event('change', { bubbles:true }));
    }
    return [...map.values()];
  }

  async function existingZhKeys() {
    const keys = new Set();
    let from = 0;
    const page = 1000;
    while (true) {
      const { data, error } = await client.from('chinese_audio_manifest').select('audio_key').range(from, from + page - 1);
      if (error) throw error;
      (data || []).forEach(row => row?.audio_key && keys.add(row.audio_key));
      if (!data || data.length < page) break;
      from += page;
    }
    return keys;
  }

  async function existingEnTexts() {
    const texts = new Set();
    let from = 0;
    const page = 1000;
    while (true) {
      const { data, error } = await client.from('english_audio_manifest').select('source_text').eq('locale','en-US').range(from, from + page - 1);
      if (error) throw error;
      (data || []).forEach(row => row?.source_text && texts.add(normEn(row.source_text)));
      if (!data || data.length < page) break;
      from += page;
    }
    return texts;
  }

  async function callGenerator(language, items) {
    if (!session?.access_token) throw new Error('Phiên đăng nhập admin đã hết hạn.');
    const fn = language === 'zh' ? 'generate-chinese-audio' : 'generate-english-audio';
    const response = await fetch(`${String(cfg.url || '').replace(/\/$/, '')}/functions/v1/${fn}`, {
      method:'POST',
      headers:{ apikey:cfg.anonKey, Authorization:`Bearer ${session.access_token}`, 'Content-Type':'application/json' },
      body:JSON.stringify({ model:MODEL, items })
    });
    const raw = await response.text();
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch (_) {}
    if (!response.ok) throw new Error(payload?.error || payload?.message || raw || `HTTP ${response.status}`);
    return payload || {};
  }

  function setStatus(text, tone='info') {
    const el = document.getElementById(STATUS_ID);
    if (!el) return;
    el.textContent = text || '';
    el.style.color = tone === 'error' ? '#b42318' : tone === 'ok' ? '#15803d' : '#64748b';
  }

  function setRunning(value) {
    running = value;
    [BTN_ZH, BTN_EN].forEach(id => { const b=document.getElementById(id); if (b) b.disabled=value; });
    const stop = document.getElementById(BTN_STOP);
    if (stop) stop.style.display = value ? 'inline-flex' : 'none';
  }

  async function generateAll(language) {
    if (!isAdmin || running) return;
    stopRequested = false;
    setRunning(true);
    try {
      setStatus(language === 'zh' ? 'Đang quét toàn bộ nội dung tiếng Trung…' : 'Đang quét toàn bộ nội dung tiếng Anh…');
      const items = language === 'zh' ? collectAllChineseCards() : await collectAllEnglish();
      if (!items.length) throw new Error('Không tìm thấy nội dung để tạo audio.');

      const existing = language === 'zh' ? await existingZhKeys() : await existingEnTexts();
      const missing = language === 'zh'
        ? items.filter(item => !existing.has(item.audio_key))
        : items.filter(item => !existing.has(normEn(item.text)));

      if (!missing.length) {
        setStatus(`✅ ${language === 'zh' ? 'Tiếng Trung' : 'Tiếng Anh'} đã có đủ ${items.length} audio HQ.`, 'ok');
        await (language === 'zh' ? window.LFChineseHQAudio?.refresh?.() : window.LFEnglishHQAudio?.refresh?.());
        return;
      }

      const label = language === 'zh' ? 'Trung' : 'Anh';
      const ok = window.confirm(`Kho ${label}: ${items.length} nội dung, còn thiếu ${missing.length} audio HQ.\n\nTạo toàn bộ phần còn thiếu bằng HeyGen Turbo Free? Các mục đã có sẽ được bỏ qua.`);
      if (!ok) { setStatus(`Đã kiểm tra: còn thiếu ${missing.length}/${items.length} audio HQ ${label}.`); return; }

      let generated = 0, failed = 0;
      const batchSize = language === 'zh' ? ZH_BATCH : EN_BATCH;
      for (let offset=0; offset<missing.length; offset += batchSize) {
        if (stopRequested) break;
        const batch = missing.slice(offset, offset + batchSize);
        setStatus(`${label}: đang tạo ${offset + 1}–${Math.min(offset + batch.length, missing.length)} / ${missing.length}…`);
        try {
          const result = await callGenerator(language, batch);
          generated += Number(result.generated || 0);
          failed += Number(result.failed || 0);
          await (language === 'zh' ? window.LFChineseHQAudio?.refresh?.() : window.LFEnglishHQAudio?.refresh?.());
        } catch (error) {
          failed += batch.length;
          setStatus(`⚠️ ${label}: dừng tại ${offset + 1}/${missing.length}. ${String(error?.message || error)}. Bạn có thể bấm lại để tiếp tục các mục còn thiếu.`, 'error');
          stopRequested = true;
          break;
        }
        if (offset + batchSize < missing.length) await sleep(350);
      }

      if (!stopRequested) {
        setStatus(`✅ ${label}: hoàn tất ${generated} audio mới${failed ? `, lỗi ${failed}` : ''}. Lần chạy sau sẽ tự bỏ qua toàn bộ mục đã có.`, failed ? 'error' : 'ok');
      } else if (generated) {
        setStatus(`⏸ ${label}: đã tạo ${generated} audio mới rồi dừng. Bấm lại để tiếp tục phần còn thiếu.`, 'info');
      }
    } catch (error) {
      console.error('[Bulk HQ Audio]', error);
      setStatus(`❌ ${String(error?.message || error)}`, 'error');
    } finally {
      setRunning(false);
      stopRequested = false;
    }
  }

  function ensurePanel() {
    if (!isAdmin) return;
    if (document.getElementById(PANEL_ID)) return;
    const lang = document.getElementById('studyLangFilter');
    if (!lang) return;
    const host = lang.closest('.bg-white') || lang.parentElement?.parentElement || lang.parentElement;
    if (!host) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px dashed #cbd5e1;display:flex;flex-wrap:wrap;gap:8px;align-items:center';

    const zh = document.createElement('button');
    zh.id = BTN_ZH; zh.type='button'; zh.textContent='🎙️ Tạo toàn bộ HQ Trung còn thiếu';
    zh.style.cssText='border:1px solid #86efac;background:#f0fdf4;color:#047857;border-radius:10px;padding:8px 10px;font-weight:850;cursor:pointer';
    zh.addEventListener('click', () => generateAll('zh'));

    const en = document.createElement('button');
    en.id = BTN_EN; en.type='button'; en.textContent='🎙️ Tạo toàn bộ HQ Anh còn thiếu';
    en.style.cssText='border:1px solid #93c5fd;background:#eff6ff;color:#1d4ed8;border-radius:10px;padding:8px 10px;font-weight:850;cursor:pointer';
    en.addEventListener('click', () => generateAll('en'));

    const stop = document.createElement('button');
    stop.id = BTN_STOP; stop.type='button'; stop.textContent='■ Dừng'; stop.style.display='none';
    stop.style.cssText += 'border:1px solid #fca5a5;background:#fff1f2;color:#be123c;border-radius:10px;padding:8px 10px;font-weight:850;cursor:pointer';
    stop.addEventListener('click', () => { stopRequested = true; setStatus('Đang dừng sau batch hiện tại…'); });

    const status = document.createElement('div');
    status.id = STATUS_ID;
    status.textContent = 'HQ toàn thư viện · chỉ tạo mục còn thiếu · HeyGen Turbo Free';
    status.style.cssText='flex:1 1 100%;font-size:.72rem;font-weight:700;color:#64748b';

    panel.append(zh, en, stop, status);
    host.appendChild(panel);
  }

  async function initAuth() {
    if (!cfg.url || !cfg.anonKey || !window.supabase?.createClient) return;
    try {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) return;
      const { data: admin, error } = await client.from('linguaflash_admins').select('role').eq('user_id', session.user.id).maybeSingle();
      if (error || !admin) return;
      isAdmin = true;
      ensurePanel();
      client.auth.onAuthStateChange(async (_event, nextSession) => {
        session = nextSession || null;
        if (!session?.user) { isAdmin=false; document.getElementById(PANEL_ID)?.remove(); return; }
        const { data: nextAdmin } = await client.from('linguaflash_admins').select('role').eq('user_id', session.user.id).maybeSingle();
        isAdmin = !!nextAdmin;
        if (isAdmin) setTimeout(ensurePanel, 50); else document.getElementById(PANEL_ID)?.remove();
      });
    } catch (error) {
      console.warn('[Bulk HQ Audio] admin init skipped', error);
    }
  }

  function init() {
    initAuth();
    [500,1500,3500].forEach(ms => setTimeout(() => isAdmin && ensurePanel(), ms));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.LFAudioLibraryAdmin = {
    collectAllChineseCards,
    collectAllEnglish,
    generateChinese: () => generateAll('zh'),
    generateEnglish: () => generateAll('en')
  };
})();
