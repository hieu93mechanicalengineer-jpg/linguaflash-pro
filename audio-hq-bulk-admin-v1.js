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
  function collectEnglishCards(en) {
    for (const card of getAllCards()) {
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

  async function collectAll() {
    setStatus('Đang kiểm tra kho HQ: Trung chỉ hội thoại · Anh toàn bộ…');
    try { await window.lfLoadAllLargePacks?.(); } catch (_) {}
    const zh = new Map();
    const en = new Map();
    collectEnglishCards(en);
    collectDialogueAudio(zh, en);
    await loadWorkspaceLessons(en);
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
      body: JSON.stringify({ model: MODEL, items: safeItems })
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
    const state = last.status === 'complete' ? '✅ Đã kết thúc' : last.status === 'running' ? '⏳ Đang xử lý ở lần chạy trước' : '⚠️ Đã dừng / có lỗi';
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
    const all = await collectAll();
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
        '<button id="lfAudioUpdateOpen" type="button" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0">🎙️ Cập nhật âm thanh</button></div>';
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
        '<div class="lf-audio-bulk-title">Chọn phạm vi · chỉ tạo âm thanh còn thiếu</div>' +
        '<div class="lf-audio-bulk-actions">' +
        '<button type="button" data-bulk="zh">🇨🇳 Hội thoại tiếng Trung mới</button>' +
        '<button type="button" data-bulk="en">🇬🇧 Tiếng Anh mới</button>' +
        '<button type="button" data-bulk="both">🌐 Cập nhật cả hai</button>' +
        '</div>' +
        '<div id="' + STATUS_ID + '">HeyGen Turbo Free · Trung chỉ lưu HQ hội thoại, Anh lưu HQ toàn bộ.</div>';
      panel.addEventListener('click', event => {
        const button = event.target.closest('button[data-bulk]');
        if (button) run(button.dataset.bulk);
      });
    }
    if (panel.parentElement !== card) card.appendChild(panel);

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
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.classList.toggle('on', !!forceOpen || !panel.classList.contains('on'));
    if (panel.classList.contains('on')) {
      if (!isAdmin) {
        setStatus('🔒 Bạn cần đăng nhập bằng tài khoản quản trị để tạo âm thanh.');
        void initAuth().then(ok => {
          if (ok) setStatus('Sẵn sàng. Chọn ngôn ngữ để kiểm tra và tạo audio còn thiếu.');
        });
      } else {
        setStatus('Sẵn sàng. Chọn ngôn ngữ để kiểm tra audio còn thiếu.');
      }
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      if (!isAdmin && window.supabase?.createClient) await initAuth();
      ensurePanel();
      if (isAdmin || attempts >= 50) clearInterval(timer);
    }, 300);
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