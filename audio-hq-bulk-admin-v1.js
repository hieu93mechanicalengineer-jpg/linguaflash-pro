/* LinguaFlash · HQ Audio Bulk Admin v2
   English: complete HQ library.
   Chinese: HQ storage is DIALOGUE ONLY to control Supabase usage.
   Existing manifest rows are skipped, so repeated runs are resumable and non-duplicating.
*/
(() => {
  'use strict';
  if (window.__LF_AUDIO_HQ_BULK_ADMIN_V2__) return;
  window.__LF_AUDIO_HQ_BULK_ADMIN_V2__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const MODEL = 'heygen-voice-1-turbo-free';
  const PANEL_ID = 'lfAudioBulkAdminPanel';
  const STATUS_ID = 'lfAudioBulkAdminStatus';
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
    !!window.matchMedia?.('(max-width: 767px)').matches;

  let client = null;
  let session = null;
  let isAdmin = false;
  let running = false;
  let authSubscribed = false;
  let latestScan = null;
  let reportAfterRun = null;
  const HISTORY_KEY = 'lf_audio_admin_last_report_v3';

  const normEn = value => String(value || '').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const normZh = value => String(value || '').replace(/\s+/g, ' ').trim();
  const hasHanzi = value => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(value || ''));
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

  function add(map, lang, text, lessonId = 'library', contentType = 'lesson', lessonTitle = '') {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const normalizer = lang === 'zh' ? normZh : normEn;
    if (lang === 'zh' && !hasHanzi(clean)) return;
    if (lang === 'en' && (!hasLatin(clean) || hasHanzi(clean))) return;
    const key = normalizer(clean);
    if (map.has(key)) return;
    map.set(key, {
      audio_key: `${lang}_${hashText(clean, normalizer)}`,
      lesson_id: String(lessonId || 'library'),
      lesson_title: String(lessonTitle || lessonId || 'library'),
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

  // English keeps the full-library policy.
  async function collectEnglishCards(en) {
    const cards = getAllCards();
    // Yield to the browser between batches instead of blocking mobile taps.
    for (let index = 0; index < cards.length; index++) {
      if (index && index % 160 === 0) {
        setStatus('🔎 Đang rà soát thẻ tiếng Anh: ' + index + '/' + cards.length + '…');
        await sleep(0);
      }
      const card = cards[index];
      if (!card || String(card.lang || '') !== 'Tiếng Anh') continue;
      const lessonId = card.topic || card.level || card.sourceLabel || 'cards';
      const lessonTitle = card.topic || card.sourceLabel || card.level || lessonId;
      if (card.cardType === 'sentence') add(en, 'en', card.chinese, lessonId, 'sentence', lessonTitle);
      else add(en, 'en', card.word, lessonId, 'vocab', lessonTitle);
      add(en, 'en', card.exampleEnglish, lessonId, 'example', lessonTitle);
      const ex = String(card.example || '').trim();
      if (ex && hasLatin(ex) && !hasHanzi(ex)) add(en, 'en', ex, lessonId, 'example', lessonTitle);
    }
  }

  // Chinese storage policy: only source dialogue lines are eligible for new HQ files.
  function collectDialogueAudio(zh, en) {
    try {
      if (typeof DIALOGUES_DB === 'undefined' || !DIALOGUES_DB) return;
      Object.entries(DIALOGUES_DB).forEach(([dialogueKey, dialogue]) => {
        const lessonId = dialogueKey || dialogue?.id || dialogue?.title || 'dialogue';
        const lessonTitle = dialogue?.title || dialogue?.topic || lessonId;
        (dialogue?.lines || []).forEach(line => {
          if (hasHanzi(line?.cn)) add(zh, 'zh', line?.cn, lessonId, 'dialogue', lessonTitle);
          // English dialogue translations remain part of the full English HQ library.
          add(en, 'en', line?.en, lessonId, 'dialogue', lessonTitle);
        });
      });
    } catch (_) {}
  }

  function addEnglishLesson(map, lesson) {
    if (!lesson) return;
    const id = lesson.id || lesson.unit || '51talk';
    const title = lesson.title || lesson.name || lesson.unit || id;
    (lesson.vocab || []).forEach(row => add(map, 'en', row?.[0], id, 'vocab', title));
    (lesson.examples || []).forEach(row => add(map, 'en', row?.[1], id, 'example', title));
    (lesson.dialogue || []).forEach(row => add(map, 'en', row?.[1], id, 'dialogue', title));
    (lesson.speaking || []).forEach(row => add(map, 'en', row?.[1], id, 'speaking', title));
  }

  async function loadWorkspaceLessons(en) {
    // Mobile: use modules already loaded in memory rather than fetching,
    // regex-matching and evaluating separate workspace scripts.
    if (isMobile) {
      try {
        const loaded = window.LF51_LEVEL2_LESSONS || {};
        Object.values(loaded).forEach(lesson => addEnglishLesson(en, lesson));
        const business = window.LF51_BUSINESS_UNIT1;
        if (Array.isArray(business)) business.forEach(lesson => addEnglishLesson(en, lesson));
        addEnglishLesson(en, window.LF51_UNIT2_LESSON_V1);
        addEnglishLesson(en, window.LF51_CLASS158_HEALTH_LESSON_V1);
      } catch (error) {
        console.warn('[HQ Bulk] mobile loaded lesson scan skipped', error);
      }
      return;
    }
    try {
      const response = await fetch('./english-51talk-desktop-workspace-v1.js?v=91', { cache: 'no-store' });
      if (response.ok) {
        const source = await response.text();
        const match = source.match(/const LESSONS\s*=\s*(\{[\s\S]*?\n\s*\});\s*\n\s*const IPA\s*=/);
        if (match) {
          const lessons = Function(`"use strict"; return (${match[1]});`)();
          Object.values(lessons || {}).forEach(lesson => addEnglishLesson(en, lesson));
        }
      }
    } catch (error) {
      console.warn('[HQ Bulk] base 51Talk source unavailable', error);
    }

    try { addEnglishLesson(en, window.LF51_UNIT2_LESSON_V1); } catch (_) {}
    try { addEnglishLesson(en, window.LF51_CLASS158_HEALTH_LESSON_V1); } catch (_) {}

    try {
      const response = await fetch('./english-mobile-class158-bridge-v1.js?v=91', { cache: 'no-store' });
      const source = response.ok ? await response.text() : '';
      const match = source.match(/const WORK_LESSON\s*=\s*String\.raw`([\s\S]*?)`;\s*\n/);
      if (match) {
        const obj = Function(`"use strict"; return ({${match[1]}});`)();
        Object.values(obj || {}).forEach(lesson => addEnglishLesson(en, lesson));
      }
    } catch (error) {
      console.warn('[HQ Bulk] Class 158 work source unavailable', error);
    }
  }

  async function collectAll(scope) {
    setStatus('Đang kiểm tra kho HQ: Trung chỉ hội thoại · Anh toàn bộ…');
    // Never load 9+ MB of optional dictionary/level packs during audio scan.
    // Users can explicitly open a large pack in Study first when needed.
    const zh = new Map();
    const en = new Map();
    if (scope !== 'zh') await collectEnglishCards(en);
    collectDialogueAudio(zh, en);
    if (scope !== 'zh') await loadWorkspaceLessons(en);
    return { zh: [...zh.values()], en: [...en.values()] };
  }

  async function existingSet(lang) {
    const table = lang === 'zh' ? 'chinese_audio_manifest' : 'english_audio_manifest';
    const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
    const normalizer = lang === 'zh' ? normZh : normEn;
    const result = new Set();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client
        .from(table)
        .select('source_text')
        .eq('locale', locale)
        .range(from, from + 999);
      if (error) throw error;
      (data || []).forEach(row => row?.source_text && result.add(normalizer(row.source_text)));
      if (!data || data.length < 1000) break;
    }
    return result;
  }

  async function callGenerator(lang, items) {
    const endpoint = lang === 'zh' ? 'generate-chinese-audio' : 'generate-english-audio';
    const safeItems = lang === 'zh'
      ? (items || []).filter(item => item?.content_type === 'dialogue')
      : (items || []);
    if (!safeItems.length) throw new Error(lang === 'zh' ? 'Tiếng Trung chỉ tạo HQ cho hội thoại.' : 'Không có nội dung để tạo audio.');

    const response = await fetch(`${String(cfg.url || '').replace(/\/$/, '')}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: MODEL, items: safeItems.map(item => ({ audio_key:item.audio_key, lesson_id:item.lesson_id, content_type:item.content_type, text:item.text })) })
    });
    const raw = await response.text();
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch (_) {}
    if (!response.ok) throw new Error(payload?.error || payload?.message || raw || `HTTP ${response.status}`);
    return payload || {};
  }


  function languageLabel(lang) {
    return lang === 'zh' ? '🇨🇳 Tiếng Trung · hội thoại' : '🇬🇧 Tiếng Anh';
  }

  function setBusy(busy) {
    ['lfAudioLanguage', 'lfAudioScan', 'lfAudioLesson', 'lfAudioGenerate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = !!busy;
    });
    if (!busy) refreshGenerateButton();
  }

  function setProgress(done, total, label) {
    const wrap = document.getElementById('lfAudioProgress');
    const bar = document.getElementById('lfAudioProgressBar');
    const value = document.getElementById('lfAudioProgressText');
    if (wrap) wrap.hidden = false;
    if (bar) { bar.max = Math.max(1, total); bar.value = done; }
    if (value) value.textContent = label || (done + ' / ' + total);
  }

  function saveRunReport(report) {
    reportAfterRun = report;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(report)); } catch (_) {}
    renderRunReport();
  }

  function renderRunReport() {
    const host = document.getElementById('lfAudioRunReport');
    if (!host) return;
    host.replaceChildren();
    let last = reportAfterRun;
    if (!last) {
      try { last = JSON.parse(localStorage.getItem(HISTORY_KEY) || 'null'); } catch (_) {}
    }
    if (!last) {
      const hint = document.createElement('p');
      hint.textContent = 'Chưa có nhật ký cập nhật trên trình duyệt này. Bạn có thể bấm "Kiểm tra" để xem hiện còn thiếu những âm thanh nào.';
      host.appendChild(hint);
      return;
    }
    const summary = document.createElement('div');
    summary.className = 'lf-audio-run-title';
    const state = last.status === 'complete' ? '✅ Đã kết thúc' : last.status === 'running' ? '⚠️ Lần chạy trước chưa ghi nhận kết thúc' : '⚠️ Đã dừng / có lỗi';
    const stamp = new Date(last.updatedAt || Date.now()).toLocaleString('vi-VN');
    summary.textContent = state + ' · ' + stamp + ' · Đã tạo ' + (last.generated || 0) + '/' + (last.target || 0) + ' · Lỗi ' + (last.failed || 0);
    host.appendChild(summary);
    const rows = (last.lessons || []).filter(x => x.generated || x.failed || x.error);
    if (!rows.length) return;
    const list = document.createElement('div');
    list.className = 'lf-audio-run-list';
    rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'lf-audio-lesson-row';
      item.textContent = languageLabel(row.lang) + ' — ' + row.title + ': đã tạo ' + (row.generated || 0) + ', lỗi ' + (row.failed || 0) + (row.error ? ' · ' + row.error : '');
      list.appendChild(item);
    });
    host.appendChild(list);
    const note = document.createElement('p');
    note.textContent = 'Nhật ký này chỉ ghi các lần chạy nút cập nhật trên trình duyệt hiện tại. Bấm "Kiểm tra" lần nữa để đối chiếu kho âm thanh thực tế.';
    host.appendChild(note);
  }

  function selectedScanGroups() {
    if (!latestScan) return [];
    const select = document.getElementById('lfAudioLesson');
    const wanted = select?.value || 'all';
    return wanted === 'all' ? latestScan.groups : latestScan.groups.filter(group => group.key === wanted);
  }

  function refreshGenerateButton() {
    const button = document.getElementById('lfAudioGenerate');
    if (!button) return;
    const missing = selectedScanGroups().reduce((n, group) => n + group.itemsMissing.length, 0);
    button.textContent = missing ? '🎙️ Tạo ' + missing + ' âm thanh còn thiếu' : '🎙️ Chưa có âm thanh cần tạo';
    button.disabled = !isAdmin || !latestScan || !missing || running;
  }

  function renderScanReport() {
    const summary = document.getElementById('lfAudioScanSummary');
    const list = document.getElementById('lfAudioLessonList');
    const selector = document.getElementById('lfAudioLesson');
    if (!summary || !list || !selector) return;
    list.replaceChildren();
    const prior = selector.value || 'all';
    selector.replaceChildren();
    selector.add(new Option('Tất cả bài tìm thấy', 'all'));

    if (!latestScan) {
      summary.textContent = 'Chưa kiểm tra âm thanh. Chọn ngôn ngữ và bấm "1. Kiểm tra".';
      selector.disabled = true;
      refreshGenerateButton();
      return;
    }
    const groups = latestScan.groups;
    const total = groups.reduce((n, group) => n + group.total, 0);
    const missing = groups.reduce((n, group) => n + group.itemsMissing.length, 0);
    const complete = total - missing;
    summary.textContent = 'Đã quét ' + groups.length + ' bài/nhóm · ' + complete + '/' + total + ' âm thanh đã có · còn thiếu ' + missing + '.';
    const ordered = [...groups].sort((a, b) => b.itemsMissing.length - a.itemsMissing.length || a.title.localeCompare(b.title, 'vi'));
    ordered.forEach(group => {
      selector.add(new Option(languageLabel(group.lang) + ' — ' + group.title + ' (thiếu ' + group.itemsMissing.length + ')', group.key));
      const item = document.createElement('div');
      item.className = 'lf-audio-lesson-row';
      const title = document.createElement('strong');
      title.textContent = languageLabel(group.lang) + ' — ' + group.title;
      const count = document.createElement('span');
      count.textContent = group.itemsMissing.length
        ? '⚠️ Thiếu ' + group.itemsMissing.length + '/' + group.total
        : '✅ Đủ ' + group.total + '/' + group.total;
      item.append(title, count);
      list.appendChild(item);
    });
    if ([...selector.options].some(option => option.value === prior)) selector.value = prior;
    selector.disabled = false;
    refreshGenerateButton();
  }

  async function performScan(scope) {
    const langs = scope === 'both' ? ['zh', 'en'] : scope === 'zh' || scope === 'en' ? [scope] : [];
    if (!langs.length) throw new Error('Hãy chọn ngôn ngữ trước khi kiểm tra.');
    setStatus('🔎 Đang đọc các bài học và đối chiếu với thư viện âm thanh…');
    const all = await collectAll(scope);
    const groups = [];
    for (const lang of langs) {
      setStatus('🔎 Đang kiểm tra ' + languageLabel(lang) + ' với kho âm thanh đã lưu…');
      const source = lang === 'zh' ? all.zh.filter(item => item.content_type === 'dialogue') : all.en;
      const stored = await existingSet(lang);
      const normalizer = lang === 'zh' ? normZh : normEn;
      const byLesson = new Map();
      source.forEach(item => {
        const key = lang + ':' + String(item.lesson_id);
        let group = byLesson.get(key);
        if (!group) {
          group = { key, lang, title: item.lesson_title || item.lesson_id, lessonId: item.lesson_id, total: 0, itemsMissing: [] };
          byLesson.set(key, group);
        }
        group.total++;
        if (!stored.has(normalizer(item.text))) group.itemsMissing.push(item);
      });
      groups.push(...byLesson.values());
    }
    latestScan = { scope, groups, scannedAt: Date.now() };
    renderScanReport();
    return latestScan;
  }

  async function checkAudio() {
    if (running) return;
    if (!isAdmin) await initAuth();
    if (!isAdmin) {
      setStatus('🔒 Đăng nhập bằng tài khoản quản trị để kiểm tra và cập nhật âm thanh.', 'error');
      if (!session?.user && typeof window.lfOpenAuthModal === 'function') window.lfOpenAuthModal();
      return;
    }
    const scope = document.getElementById('lfAudioLanguage')?.value || 'en';
    running = true;
    latestScan = null;
    setBusy(true);
    try {
      const scan = await performScan(scope);
      const missing = scan.groups.reduce((n, group) => n + group.itemsMissing.length, 0);
      setStatus(missing
        ? '✅ Đã kiểm tra. Còn ' + missing + ' âm thanh chưa có. Chọn bài muốn tạo và bấm "2. Tạo". Chưa tạo file nào.'
        : '✅ Đã kiểm tra. Các nội dung tìm thấy đều đã có âm thanh. Không cần tạo mới.', 'ok');
    } catch (error) {
      console.error('[LinguaFlash HQ Audio scan]', error);
      setStatus('❌ Không thể kiểm tra: ' + String(error?.message || error), 'error');
    } finally {
      running = false;
      setBusy(false);
      renderScanReport();
    }
  }

  async function generateSelected() {
    if (running || !latestScan || !isAdmin || !session?.access_token) return;
    const groups = selectedScanGroups().filter(group => group.itemsMissing.length);
    const total = groups.reduce((n, group) => n + group.itemsMissing.length, 0);
    if (!total) {
      setStatus('✅ Không có mục mới cần tạo. Hãy kiểm tra lại nếu bạn vừa thêm bài.');
      return;
    }
    const headline = groups.length === 1 ? languageLabel(groups[0].lang) + ' — ' + groups[0].title : groups.length + ' bài/nhóm';
    const confirmed = window.confirm('Sẽ tạo ' + total + ' âm thanh còn thiếu cho ' + headline + '.\nKhông ghi đè mục đã có. Có thể sử dụng hạn mức HeyGen Turbo Free.\n\nBắt đầu tạo?');
    if (!confirmed) { setStatus('Đã hủy tạo âm thanh. Chưa có file mới.'); return; }
    running = true;
    setBusy(true);
    const outcome = {
      status: 'running', updatedAt: Date.now(), scope: latestScan.scope,
      target: total, generated: 0, failed: 0,
      lessons: groups.map(group => ({ key: group.key, lang: group.lang, title: group.title, generated: 0, failed: 0, error: '' }))
    };
    saveRunReport(outcome);
    let processed = 0;
    setProgress(0, total, '⏳ Bắt đầu tạo 0 / ' + total + ' âm thanh…');
    document.getElementById('lfAudioProgress')?.scrollIntoView({ behavior:'smooth', block:'center' });
    try {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const row = outcome.lessons[i];
        const batchSize = group.lang === 'zh' ? 10 : 8;
        for (let offset = 0; offset < group.itemsMissing.length; offset += batchSize) {
          const batch = group.itemsMissing.slice(offset, offset + batchSize);
          const current = processed + 1;
          const text = '⏳ ' + languageLabel(group.lang) + ' — ' + group.title + ' · đang xử lý ' + current + '–' + (processed + batch.length) + '/' + total;
          setStatus(text);
          setProgress(processed, total, text);
          let payload;
          try {
            payload = await callGenerator(group.lang, batch);
          } catch (error) {
            row.error = String(error?.message || error);
            throw new Error(group.title + ': ' + row.error);
          }
          const generated = Number(payload.generated || 0);
          const failed = Number(payload.failed || 0);
          row.generated += generated;
          row.failed += failed;
          outcome.generated += generated;
          outcome.failed += failed;
          processed += batch.length;
          outcome.updatedAt = Date.now();
          saveRunReport(outcome);
          setProgress(processed, total, 'Đã xử lý ' + processed + '/' + total + ' · tạo được ' + outcome.generated + ' · lỗi ' + outcome.failed);
          if (group.lang === 'zh') await window.LFChineseHQAudio?.refresh?.();
          else await window.LFEnglishHQAudio?.refresh?.();
          if (offset + batchSize < group.itemsMissing.length) await sleep(250);
        }
      }
      outcome.status = outcome.failed ? 'partial' : 'complete';
      outcome.updatedAt = Date.now();
      saveRunReport(outcome);
      setStatus((outcome.failed ? '⚠️' : '✅') + ' Đã xử lý xong ' + processed + '/' + total + ': tạo ' + outcome.generated + ', lỗi ' + outcome.failed + '. Bấm "Kiểm tra" lại để đối chiếu bài còn thiếu.', outcome.failed ? 'error' : 'ok');
    } catch (error) {
      outcome.status = 'partial';
      outcome.updatedAt = Date.now();
      saveRunReport(outcome);
      setStatus('⚠️ Đã dừng khi xử lý ' + processed + '/' + total + ' mục. Đã tạo ' + outcome.generated + ', lỗi đã báo ' + outcome.failed + '. ' + String(error?.message || error) + '. Kiểm tra lại để tiếp tục các mục thiếu.', 'error');
    } finally {
      running = false;
      latestScan = null; // Force a fresh manifest check before another generation.
      setBusy(false);
      renderScanReport();
    }
  }

  // Legacy API compatibility. This only scans; generation always needs an explicit second click.
  function run(scope) {
    const select = document.getElementById('lfAudioLanguage');
    if (select && (scope === 'en' || scope === 'zh' || scope === 'both')) select.value = scope;
    return checkAudio();
  }

  function installStyle() {
    if (document.getElementById('lfAudioBulkAdminStyle')) return;
    const style = document.createElement('style');
    style.id = 'lfAudioBulkAdminStyle';
    style.textContent = `
      #${PANEL_ID}{display:none;width:100%;margin-top:14px;padding:16px;border:1px solid #c7d2fe;border-radius:15px;background:#f8faff;box-sizing:border-box}
      #${PANEL_ID}.on{display:block}
      .lf-audio-bulk-title{font-size:.87rem;font-weight:900;color:#1e293b;margin-bottom:9px}
      .lf-audio-controls{display:grid;grid-template-columns:minmax(170px,1fr) auto;gap:9px;align-items:end}
      .lf-audio-controls label,.lf-audio-lesson-picker label{font-size:.75rem;font-weight:800;color:#475569;display:block;margin-bottom:5px}
      .lf-audio-controls select,.lf-audio-lesson-picker select{width:100%;padding:10px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;font-size:.83rem}
      .lf-audio-controls button,.lf-audio-generate{padding:10px 14px;border-radius:10px;background:#4f46e5;color:#fff;font-weight:850;font-size:.82rem;min-height:43px}
      .lf-audio-generate{width:100%;margin-top:11px;background:#047857}
      #${PANEL_ID} button:disabled{opacity:.48;cursor:not-allowed}
      .lf-audio-summary{margin-top:11px;padding:10px 12px;border:1px solid #dbeafe;border-radius:10px;background:#fff;color:#1e293b;font-size:.8rem;font-weight:800}
      .lf-audio-lesson-picker{margin-top:12px}
      .lf-audio-lesson-list{max-height:225px;overflow:auto;margin-top:9px;padding:3px 8px;border:1px solid #e2e8f0;border-radius:10px;background:#fff}
      .lf-audio-lesson-row{display:flex;justify-content:space-between;gap:10px;padding:8px 3px;align-items:flex-start;font-size:.75rem;color:#475569;border-bottom:1px solid #f1f5f9}
      .lf-audio-lesson-row:last-child{border-bottom:0}
      .lf-audio-lesson-row strong{font-weight:800;color:#334155;overflow-wrap:anywhere}
      .lf-audio-lesson-row span{flex:0 0 auto;font-weight:850}
      #${STATUS_ID}{margin-top:12px;padding:11px 13px;border-radius:10px;background:#eef2ff;color:#3730a3;font-size:.8rem;line-height:1.55;font-weight:800;white-space:pre-wrap;overflow-wrap:anywhere}
      #lfAudioProgress{margin-top:12px}
      #lfAudioProgress progress{width:100%;height:11px;accent-color:#4f46e5}
      #lfAudioProgressText{margin-top:3px;font-size:.78rem;font-weight:800;color:#475569}
      #lfAudioRunReport{margin-top:8px;font-size:.75rem;color:#64748b}
      #lfAudioRunReport .lf-audio-run-title{font-size:.79rem;color:#1e293b;font-weight:900;padding:7px 0}
      #lfAudioRunReport .lf-audio-run-list{max-height:165px;overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:4px 9px}
      #lfAudioRunReport p{margin-top:5px}
      .lf-audio-note{font-size:.75rem;color:#64748b;margin-top:8px;line-height:1.5}
      @media(max-width:640px){.lf-audio-controls{grid-template-columns:1fr}.lf-audio-controls button{width:100%}.lf-audio-lesson-row{flex-direction:column;gap:3px}.lf-audio-lesson-row span{flex:auto}}
    `;
    document.head.appendChild(style);
  }


  // Keep bulk audio tools in management, not above the learning cards.
  function ensurePanel() {
    const manage = document.getElementById('tab-manage');
    if (!manage) return;

    let card = document.getElementById('lfAudioUpdateCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'lfAudioUpdateCard';
      card.className = 'bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-indigo-100';
      card.innerHTML = '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
        '<div><h3 class="text-base font-extrabold text-slate-900">🔊 Cập nhật âm thanh bài mới</h3>' +
        '<p class="text-xs sm:text-sm text-slate-500 mt-1">Tự tìm âm thanh HQ còn thiếu sau khi thêm bài. Không ghi đè âm thanh cũ.</p></div>' +
        '<button id="lfAudioUpdateOpen" type="button" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0">🎙️ Kiểm tra / cập nhật</button></div>';
      const first = manage.firstElementChild;
      if (first) first.insertAdjacentElement('afterend', card);
      else manage.appendChild(card);
      card.querySelector('#lfAudioUpdateOpen')?.addEventListener('click', () => openPanel(false));
    }

    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.innerHTML =
        '<div class="lf-audio-bulk-title">🔍 Kiểm tra trước · chỉ tạo sau khi xác nhận</div>' +
        '<div class="lf-audio-controls">' +
        '<div><label for="lfAudioLanguage">1. Chọn ngôn ngữ</label>' +
        '<select id="lfAudioLanguage"><option value="en">🇬🇧 Tiếng Anh (toàn bộ bài có trong thư viện)</option>' +
        '<option value="zh">🇨🇳 Tiếng Trung (chỉ hội thoại)</option>' +
        '<option value="both">🌐 Cả hai ngôn ngữ</option></select></div>' +
        '<button id="lfAudioScan" type="button">🔎 1. Kiểm tra âm thanh</button></div>' +
        '<div id="lfAudioScanSummary" class="lf-audio-summary">Chưa kiểm tra. Bấm "1. Kiểm tra âm thanh" để xem bài nào còn thiếu. Chưa tạo file nào.</div>' +
        '<div class="lf-audio-lesson-picker"><label for="lfAudioLesson">Bài cần cập nhật (sau khi kiểm tra)</label>' +
        '<select id="lfAudioLesson" disabled><option value="all">Tất cả bài tìm thấy</option></select></div>' +
        '<div id="lfAudioLessonList" class="lf-audio-lesson-list" aria-label="Tình trạng âm thanh theo bài"></div>' +
        '<button id="lfAudioGenerate" class="lf-audio-generate" type="button" disabled>🎙️ 2. Kiểm tra trước khi tạo</button>' +
        '<p class="lf-audio-note">Bước 1 chỉ kiểm tra, không tốn lượt HeyGen. Bước 2 xác nhận mới tạo file. Trên điện thoại chỉ quét các bài đang có trong bộ nhớ, không tự tải các bộ từ điển lớn. Câu trùng giữa các bài chỉ tính một lần; tiếng Trung chỉ lưu HQ hội thoại.</p>' +
        '<div id="lfAudioProgress" hidden><progress id="lfAudioProgressBar" value="0" max="1"></progress>' +
        '<div id="lfAudioProgressText" aria-live="polite"></div></div>' +
        '<div id="' + STATUS_ID + '" role="status" aria-live="polite">Sẵn sàng. Chọn ngôn ngữ rồi bấm "Kiểm tra".</div>' +
        '<div class="lf-audio-bulk-title" style="margin-top:15px">📋 Nhật ký lần cập nhật gần nhất</div>' +
        '<div id="lfAudioRunReport"></div>';
      panel.querySelector('#lfAudioLanguage').addEventListener('change', () => {
        latestScan = null;
        renderScanReport();
        setStatus('Đã thay đổi ngôn ngữ. Bấm "1. Kiểm tra" để lấy danh sách bài.');
      });
      panel.querySelector('#lfAudioLesson').addEventListener('change', refreshGenerateButton);
      panel.querySelector('#lfAudioScan').addEventListener('click', checkAudio);
      panel.querySelector('#lfAudioGenerate').addEventListener('click', generateSelected);
    }
    if (panel.parentElement !== card) card.appendChild(panel);
    if (!panel.dataset.reportInitialized) {
      renderRunReport();
      panel.dataset.reportInitialized = '1';
    }
    // Do not re-render/clear the lesson list whenever authentication checks the panel.

    // A discoverable shortcut from Library; management hosts the actual controls.
    const libraryGrid = document.querySelector('#tab-library > .app-action-grid');
    if (libraryGrid && !document.getElementById('lfAudioUpdateLibraryLink')) {
      const shortcut = document.createElement('button');
      shortcut.type = 'button';
      shortcut.id = 'lfAudioUpdateLibraryLink';
      shortcut.className = 'app-action';
      shortcut.innerHTML = '<div class="app-action-icon">🎙️</div>' +
        '<div class="app-action-title">Cập nhật âm thanh</div>' +
        '<div class="app-action-desc">Tạo giọng đọc cho bài mới, tự bỏ qua âm thanh đã có.</div>';
      shortcut.addEventListener('click', () => {
        if (typeof window.switchTab === 'function') window.switchTab('manage');
        openPanel(true);
      });
      libraryGrid.appendChild(shortcut);
    }
  }

  function openPanel(forceOpen) {
    ensurePanel();
    renderRunReport();
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.classList.toggle('on', !!forceOpen || !panel.classList.contains('on'));
    if (panel.classList.contains('on')) {
      if (!isAdmin) {
        setStatus('🔒 Bạn cần đăng nhập tài khoản quản trị để kiểm tra và tạo âm thanh.');
        void initAuth().then(ok => {
          if (ok) setStatus('Sẵn sàng. Bấm "1. Kiểm tra" để xem bài nào thiếu âm thanh; chưa tạo file nào.');
        });
      } else {
        if (!latestScan && !running) setStatus('Sẵn sàng. Bấm "1. Kiểm tra" để xem bài nào còn thiếu; chưa tạo file nào.');
      }
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function initAuth() {
    if (!cfg.url || !cfg.anonKey || !window.supabase?.createClient) return false;
    try {
      if (!client) {
        client = window.supabase.createClient(cfg.url, cfg.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
      }
      if (!authSubscribed) {
        authSubscribed = true;
        client.auth.onAuthStateChange((_event, nextSession) => {
          session = nextSession || null;
          isAdmin = false;
          setTimeout(() => { void initAuth(); }, 60);
        });
      }
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) { isAdmin = false; return false; }
      const { data: admin, error } = await client
        .from('linguaflash_admins')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      isAdmin = !error && !!admin;
      ensurePanel();
      return isAdmin;
    } catch (error) {
      console.warn('[HQ Bulk] admin init skipped', error);
      return false;
    }
  }

  function init() {
    installStyle();
    ensurePanel();
    // Wait for Supabase to become available without repeatedly touching the DOM.
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      if (window.supabase?.createClient) {
        clearInterval(timer);
        await initAuth();
      } else if (attempts >= 16) clearInterval(timer);
    }, 650);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFAudioHQBulkAdmin = {
    run,
    open: () => openPanel(true),
    policy: { zh: 'dialogue-only', en: 'full-library' },
    canGenerate: () => isAdmin && !!session?.access_token
  };
})();