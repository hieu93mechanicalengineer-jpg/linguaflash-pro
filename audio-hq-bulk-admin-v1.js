/* LinguaFlash · HQ Audio Bulk Admin v2
   English: complete HQ library.
   Chinese: scan lesson vocabulary, example sentences and dialogue.
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
    if (!clean || /dictionary|trilingual|từ điển|词典/i.test(String(lessonId)+' '+String(lessonTitle))) return;
    const normalizer = lang === 'zh' ? normZh : normEn;
    if (lang === 'zh' && !hasHanzi(clean)) return;
    if (lang === 'en' && (!hasLatin(clean) || hasHanzi(clean))) return;
    const key = JSON.stringify([lessonId, contentType, normalizer(clean)]);
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
      if (!card || String(card.lang || '') !== 'Tiếng Anh' || /dictionary|trilingual|từ điển|词典/i.test([card.category,card.topic,card.sourceLabel].join(' '))) continue;
      const lessonId = card.topic || card.level || card.sourceLabel || 'cards';
      const lessonTitle = card.topic || card.sourceLabel || card.level || lessonId;
      if (card.cardType === 'sentence') add(en, 'en', card.chinese, lessonId, 'sentence', lessonTitle);
      else add(en, 'en', card.word, lessonId, 'vocab', lessonTitle);
      add(en, 'en', card.exampleEnglish, lessonId, 'example', lessonTitle);
      const ex = String(card.example || '').trim();
      if (ex && hasLatin(ex) && !hasHanzi(ex)) add(en, 'en', ex, lessonId, 'example', lessonTitle);
    }
  }

  function chineseText(value) {
    const text = normZh(value).split(/Ví dụ:\s*/i).pop().split('|')[0].trim();
    return hasHanzi(text) && !/[A-Za-zÀ-ỹ]/.test(text) ? text : '';
  }

  async function collectChineseCards(map) {
    const cards = [...getAllCards(), ...(window.CORE_STARTER_CARDS || []), ...(window.GIA_HAN_CORE_CARDS || [])];
    for (let i = 0; i < cards.length; i++) {
      if (i && i % 160 === 0) await sleep(0);
      const card = cards[i];
      if (!['zh','Tiếng Trung'].includes(card?.lang) || /dictionary|trilingual|từ điển|词典/i.test([card.category,card.topic,card.sourceLabel].join(' '))) continue;
      const lesson = card.lang === 'zh'
        ? [card.category, card.topic].filter(Boolean).join(' - ').replace(/\s+[–—]\s+/g, ' - ')
        : card.topic || card.category;
      const sentence = card.cardType === 'sentence';
      const target = card.lang === 'zh' ? card.front : sentence ? card.meaning : card.word;
      add(map,'zh',chineseText(target),lesson,sentence ? 'sentence' : 'vocab');
      for (const example of [card.example, card.exampleChinese]) {
        add(map,'zh',chineseText(example),lesson,'example');
      }
    }
  }

  function collectDialogueAudio(zh, en) {
    try {
      if (typeof DIALOGUES_DB === 'undefined' || !DIALOGUES_DB) return;
      Object.entries(DIALOGUES_DB).forEach(([dialogueKey, dialogue]) => {
        const lessonId = dialogueKey || dialogue?.id || dialogue?.title || 'dialogue';
        const lessonTitle = dialogue?.title || dialogue?.topic || lessonId;
        (dialogue?.lines || []).forEach(line => {
          if (hasHanzi(line?.cn)) {
            const topic = dialogue.course && dialogue.topic ? dialogue.course + ' - ' + dialogue.topic : lessonId;
            add(zh, 'zh', line.cn, topic, 'dialogue', topic);
          }
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
    setStatus('Đang kiểm tra kho HQ: từ vựng, câu mẫu và hội thoại…');
    // Never load 9+ MB of optional dictionary/level packs during audio scan.
    // Users can explicitly open a large pack in Study first when needed.
    const zh = new Map();
    const en = new Map();
    if (scope !== 'zh') await collectEnglishCards(en);
    if (scope !== 'en') {
      await collectChineseCards(zh);
      if (typeof GIA_HAN_GRAMMAR_DB !== 'undefined') {
        for (const [n, items] of Object.entries(GIA_HAN_GRAMMAR_DB)) {
          const lesson = 'Gia Hân - Trung cấp ' + (Number(n) < 31 ? 1 : 2) + ' - Bài ' + n;
          for (const item of items) add(zh,'zh',chineseText(item.cn),lesson,'grammar');
        }
      }
    }
    collectDialogueAudio(zh, en);
    if (scope !== 'zh') await loadWorkspaceLessons(en);
    return { zh: [...zh.values()], en: [...en.values()] };
  }

  async function existingSet(lang) {
    const table = lang === 'zh' ? 'chinese_audio_manifest' : 'english_audio_manifest';
    const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
    const normalizer = lang === 'zh' ? normZh : normEn;
    const result = new Map();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client
        .from(table)
        .select('source_text,storage_path')
        .eq('locale', locale)
        .order('audio_key')
        .range(from, from + 999);
      if (error) throw error;
      (data || []).forEach(row => row?.source_text && result.set(normalizer(row.source_text),row.storage_path || ''));
      if (!data || data.length < 1000) break;
    }
    return result;
  }

  async function callGenerator(lang, items) {
    const endpoint = 'generate-audio-mp3';
    const safeItems = items || [];
    if (!safeItems.length) throw new Error('Chưa có nội dung để tạo âm thanh.');

    const response = await fetch(`${String(cfg.url || '').replace(/\/$/, '')}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language: lang, items: safeItems.map(item => ({ audio_key:item.audio_key, lesson_id:item.lesson_id, content_type:item.content_type, text:item.text })) })
    });
    const raw = await response.text();
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch (_) {}
    if (!response.ok) throw new Error(payload?.error || payload?.message || raw || `HTTP ${response.status}`);
    return payload || {};
  }


  function languageLabel(lang) {
    return lang === 'zh' ? '🇨🇳 Tiếng Trung' : '🇬🇧 Tiếng Anh';
  }

  function setBusy(busy) {
    ['lfAudioLanguage', 'lfAudioScan', 'lfAudioCategory', 'lfAudioContentType', 'lfAudioLesson', 'lfAudioGenerate'].forEach(id => {
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

  let lastReportSave = 0;
  function saveRunReport(report) {
    reportAfterRun = report;
    const now = Date.now();
    // Generating a large library may involve hundreds of network batches.
    // Persist/redraw at most once per second while running to keep mobile responsive.
    if (report.status === 'running' && lastReportSave && now - lastReportSave < 1000) return;
    lastReportSave = now;
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

  function categoryOf(group) {
    return group.lang + ':' + String(group.title).split(/\s+[-–—]\s+/)[0];
  }

  function filteredScanGroups() {
    const category = document.getElementById('lfAudioCategory')?.value || 'all';
    const type = document.getElementById('lfAudioContentType')?.value || 'all';
    return (latestScan?.groups || []).filter(group => category === 'all' || categoryOf(group) === category)
      .map(group => ({ ...group,
        total: type === 'all' ? group.total : (group.typeTotals[type] || 0),
        itemsMissing: group.itemsMissing.filter(item => type === 'all' || item.content_type === type)
      })).filter(group => group.total);
  }

  function selectedScanGroups() {
    const wanted = document.getElementById('lfAudioLesson')?.value || 'all';
    return filteredScanGroups().filter(group => wanted === 'all' || group.key === wanted);
  }

  function renderCategoryOptions() {
    const selector = document.getElementById('lfAudioCategory');
    if (!selector) return;
    const prior = selector.value;
    selector.replaceChildren();
    selector.add(new Option('Tất cả giáo trình / nhóm', 'all'));
    const categories = new Map();
    (latestScan?.groups || []).forEach(group => categories.set(categoryOf(group),
      languageLabel(group.lang) + ' — ' + String(group.title).split(/\s+[-–—]\s+/)[0]));
    [...categories].sort((a,b) => a[1].localeCompare(b[1], 'vi')).forEach(([key,title]) => selector.add(new Option(title,key)));
    if ([...selector.options].some(option => option.value === prior)) selector.value = prior;
    selector.disabled = !latestScan || running;
  }

  function renderSelectedReport() {
    const list = document.getElementById('lfAudioLessonList');
    if (!list) return;
    list.replaceChildren();
    selectedScanGroups().forEach(group => {
      const item = document.createElement('div');
      item.className = 'lf-audio-lesson-row';
      const title = document.createElement('strong');
      title.textContent = languageLabel(group.lang) + ' — ' + group.title;
      const count = document.createElement('span');
      count.textContent = group.itemsMissing.length ? '⚠️ Thiếu ' + group.itemsMissing.length + '/' + group.total : '✅ Đủ ' + group.total + '/' + group.total;
      item.append(title, count);
      list.appendChild(item);
    });
    refreshGenerateButton();
  }

  function selectedMissingGroups() {
    // Small, resumable runs protect Supabase Free quota and iOS foreground time.
    const seen=new Set(),groups=[];
    let remaining=80;
    for(const group of selectedScanGroups()) {
      if(remaining<=0) break;
      const itemsMissing=group.itemsMissing.filter(item=>{
        if(seen.has(item.audio_key))return false;
        seen.add(item.audio_key);return true;
      }).slice(0,remaining);
      if(itemsMissing.length){groups.push({...group,itemsMissing});remaining-=itemsMissing.length;}
    }
    return groups;
  }

  function refreshGenerateButton() {
    const button = document.getElementById('lfAudioGenerate');
    if (!button) return;
    const missing = selectedMissingGroups().reduce((n, group) => n + group.itemsMissing.length, 0);
    button.textContent = missing ? '🎙️ 2. Tạo tiếp ' + missing + ' MP3 (~60 kbps)' : '🎙️ Chưa có âm thanh cần tạo';
    button.disabled = !isAdmin || !latestScan || !missing || running;
  }

  function renderScanReport() {
    const summary = document.getElementById('lfAudioScanSummary');
    const list = document.getElementById('lfAudioLessonList');
    const selector = document.getElementById('lfAudioLesson');
    if (!summary || !list || !selector) return;
    renderCategoryOptions();
    list.replaceChildren();
    const prior = selector.value || 'all';
    selector.replaceChildren();
    selector.add(new Option('Tất cả bài trong nhóm đã lọc', 'all'));

    if (!latestScan) {
      summary.textContent = 'Chưa kiểm tra âm thanh. Chọn ngôn ngữ và bấm "1. Kiểm tra".';
      selector.disabled = true;
      refreshGenerateButton();
      return;
    }
    const groups = filteredScanGroups();
    const total = groups.reduce((n, group) => n + group.total, 0);
    const missing = groups.reduce((n, group) => n + group.itemsMissing.length, 0);
    const complete = total - missing;
    summary.textContent = 'Đã quét ' + groups.length + ' bài/nhóm · ' + complete + '/' + total + ' âm thanh đã có · còn thiếu ' + missing + '.';
    const ordered = [...groups].sort((a, b) => b.itemsMissing.length - a.itemsMissing.length || a.title.localeCompare(b.title, 'vi'));
    ordered.forEach(group => {
      selector.add(new Option(languageLabel(group.lang) + ' — ' + group.title + ' (thiếu ' + group.itemsMissing.length + ')', group.key));
    });
    if ([...selector.options].some(option => option.value === prior)) selector.value = prior;
    selector.disabled = running;
    renderSelectedReport();
  }

  async function performScan(scope) {
    const langs = scope === 'both' ? ['zh', 'en'] : scope === 'zh' || scope === 'en' ? [scope] : [];
    if (!langs.length) throw new Error('Hãy chọn ngôn ngữ trước khi kiểm tra.');
    setStatus('🔎 Đang đọc các bài học và đối chiếu với thư viện âm thanh…');
    const all = await collectAll(scope);
    const groups = [];
    for (const lang of langs) {
      setStatus('🔎 Đang kiểm tra ' + languageLabel(lang) + ' với kho âm thanh đã lưu…');
      const source = lang === 'zh' ? all.zh : all.en;
      const stored = await existingSet(lang);
      const normalizer = lang === 'zh' ? normZh : normEn;
      const byLesson = new Map();
      source.forEach(item => {
        const key = lang + ':' + String(item.lesson_id);
        let group = byLesson.get(key);
        if (!group) {
          group = { key, lang, title: item.lesson_title || item.lesson_id, lessonId: item.lesson_id, total: 0, typeTotals: {}, itemsMissing: [] };
          byLesson.set(key, group);
        }
        group.total++;
        group.typeTotals[item.content_type] = (group.typeTotals[item.content_type] || 0) + 1;
        if (!stored.has(normalizer(item.text)) || !String(stored.get(normalizer(item.text))).toLowerCase().endsWith('.mp3')) group.itemsMissing.push(item);
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
    const groups = selectedMissingGroups();
    const total = groups.reduce((n, group) => n + group.itemsMissing.length, 0);
    if (!total) {
      setStatus('✅ Không có mục mới cần tạo. Hãy kiểm tra lại nếu bạn vừa thêm bài.');
      return;
    }
    const headline = groups.length === 1 ? languageLabel(groups[0].lang) + ' — ' + groups[0].title : groups.length + ' bài/nhóm';
    const confirmed = window.confirm('Sẽ tạo tối đa ' + total + ' MP3 mono 56 kbps (~60 kbps) cho ' + headline + '.\nKhông nén lại MP3 đã có. WAV cũ sẽ được giữ lại sau khi tạo MP3. Chỉ admin được dùng HeyGen Turbo Free.\n\nBắt đầu tạo?');
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
        const batchSize = 4;
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
          if (failed) {
            const failure = payload.results?.find(item => item.ok === false);
            row.error = String(failure?.error || 'Dịch vụ tạo giọng báo lỗi.');
            throw new Error(group.title + ': ' + row.error);
          }
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
      const languages = new Set(groups.map(group => group.lang));
      if (languages.has('zh')) void window.LFChineseHQAudio?.refresh?.();
      if (languages.has('en')) void window.LFEnglishHQAudio?.refresh?.();
      latestScan = null; // Force a fresh manifest check before another generation.
      setBusy(false);
      renderScanReport();
    }
  }


  // One-time, admin-gated cleanup of Chinese WAV originals after MP3 migration.
  // All removals are performed by Supabase Storage API with counterpart checks.
  let chineseWavCleanupRunning=false;
  async function cleanupChineseWav() {
    if(chineseWavCleanupRunning||running)return;
    if(!isAdmin||!session?.access_token) {
      window.alert('Chỉ tài khoản admin được xóa WAV cũ. Hãy đăng nhập lại.');
      return;
    }
    if(!window.confirm('Đã xác minh 1.070 WAV tiếng Trung có đủ MP3 thay thế và manifest không còn dùng WAV.\n\nXóa vĩnh viễn CHỈ file WAV trong bucket chinese-audio? File MP3 và tiếng Anh giữ nguyên.'))return;
    const button=document.getElementById('lfChineseWavCleanupButton');
    const status=document.getElementById('lfChineseWavCleanupStatus');
    chineseWavCleanupRunning=true;
    if(button)button.disabled=true;
    let offset=0,totalDeleted=0,totalBytes=0,batches=0;
    try {
      while(batches++<200){
        if(status)status.textContent='⏳ Đang dọn WAV tiếng Trung: đã xử lý '+offset+' mục, đã xóa '+totalDeleted+' file…';
        const res=await fetch(String(cfg.url||'').replace(/\/$/,'')+'/functions/v1/cleanup-chinese-wav',{
          method:'POST',
          headers:{apikey:cfg.anonKey,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
          body:JSON.stringify({action:'cleanup-chinese-wav-only',cursor:offset,limit:80})
        });
        const raw=await res.text();
        let payload={};try{payload=JSON.parse(raw)}catch(_){}
        if(!res.ok)throw Error(payload.error||'Lỗi xóa WAV: HTTP '+res.status);
        totalDeleted+=Number(payload.deleted||0);
        totalBytes+=Number(payload.estimated_bytes_removed||0);
        offset=Number(payload.next_cursor||offset);
        if(payload.done)break;
        await sleep(80);
      }
      if(status)status.textContent='✅ Hoàn tất dọn WAV tiếng Trung: '+totalDeleted+' file; ước tính giải phóng '+(totalBytes/1048576).toFixed(2)+' MB. MP3 và tiếng Anh được giữ nguyên.';
    }catch(error){
      if(status)status.textContent='⚠️ Đã xóa '+totalDeleted+' WAV, sau đó dừng: '+String(error.message||error)+'. Có thể bấm lại để tiếp tục, không xóa MP3.';
    }finally{
      chineseWavCleanupRunning=false;
      if(button)button.disabled=false;
    }
  }

  function ensureChineseWavCleanupButton() {
    const panel=document.getElementById(PANEL_ID);
    if(!panel)return;
    const existing=document.getElementById('lfChineseWavCleanupButton');
    if(!isAdmin){if(existing)existing.parentElement?.remove();return;}
    if(existing)return;
    const area=document.createElement('div');
    area.style.cssText='margin-top:12px;padding:12px;border:1px solid #94a3b8;border-radius:12px;background:rgba(148,163,184,.08)';
    const label=document.createElement('div');
    label.textContent='🧹 Dọn file WAV cũ — chỉ tiếng Trung';
    label.style.cssText='font-weight:800;margin-bottom:6px';
    const btn=document.createElement('button');
    btn.id='lfChineseWavCleanupButton';
    btn.type='button';
    btn.textContent='Xóa WAV tiếng Trung đã có MP3';
    btn.style.cssText='font-weight:750;padding:11px 14px;min-height:44px;border:1px solid #eab308;background:#fef3c7;color:#713f12;border-radius:10px;cursor:pointer';
    btn.addEventListener('click',cleanupChineseWav);
    const status=document.createElement('div');
    status.id='lfChineseWavCleanupStatus';
    status.style.cssText='font-size:.8rem;color:#64748b;margin-top:7px;line-height:1.5;overflow-wrap:anywhere';
    status.textContent='Chỉ xóa WAV có MP3 cùng tên và không còn được bài học sử dụng. Thao tác không thể hoàn tác.';
    area.append(label,btn,status);
    panel.appendChild(area);
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
      #lfAudioUpdateCard #${PANEL_ID}.on{display:block!important}
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
        '<option value="zh">🇨🇳 Tiếng Trung (từ vựng, câu mẫu, hội thoại)</option>' +
        '<option value="both">🌐 Cả hai ngôn ngữ</option></select></div>' +
        '<button id="lfAudioScan" type="button">🔎 1. Kiểm tra âm thanh</button></div>' +
        '<div id="lfAudioScanSummary" class="lf-audio-summary">Chưa kiểm tra. Bấm "1. Kiểm tra âm thanh" để xem bài nào còn thiếu. Chưa tạo file nào.</div>' +
        '<div class="lf-audio-controls lf-audio-lesson-picker">' +
        '<div><label for="lfAudioCategory">2. Chọn giáo trình / nhóm</label><select id="lfAudioCategory" disabled><option value="all">Tất cả giáo trình / nhóm</option></select></div>' +
        '<div><label for="lfAudioContentType">Mục con cần cập nhật</label><select id="lfAudioContentType"><option value="all">Tất cả nội dung</option><option value="vocab">Từ vựng</option><option value="sentence">Câu luyện tập</option><option value="example">Câu ví dụ</option><option value="dialogue">Hội thoại</option><option value="grammar">Ngữ pháp</option><option value="speaking">Luyện nói</option></select></div></div>' +
        '<div class="lf-audio-lesson-picker"><label for="lfAudioLesson">Bài cần cập nhật (sau khi kiểm tra)</label>' +
        '<select id="lfAudioLesson" disabled><option value="all">Tất cả bài trong nhóm đã lọc</option></select></div>' +
        '<div id="lfAudioLessonList" class="lf-audio-lesson-list" aria-label="Tình trạng âm thanh theo bài"></div>' +
        '<button id="lfAudioGenerate" class="lf-audio-generate" type="button" disabled>🎙️ 2. Kiểm tra trước khi tạo</button>' +
        '<p class="lf-audio-note">Bước 1 chỉ kiểm tra, không tốn lượt HeyGen. Bước 2 tạo tối đa 80 MP3 mono 56 kbps (xấp xỉ 60 kbps) mỗi lần; muốn tiếp tục hãy kiểm tra lại. Loại trừ toàn bộ TRILINGUAL DICTIONARY. File WAV cũ giữ nguyên để đối chiếu, không gọi HeyGen lại khi chỉ cần chuyển WAV sang MP3. Chỉ admin được tạo âm thanh, người dùng chỉ nghe.</p>' +
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
      panel.querySelector('#lfAudioLesson').addEventListener('change', renderSelectedReport);
      for (const id of ['lfAudioCategory', 'lfAudioContentType']) {
        panel.querySelector('#' + id).addEventListener('change', () => {
          panel.querySelector('#lfAudioLesson').value = 'all';
          renderScanReport();
        });
      }
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
      if (!session?.user) { isAdmin = false; ensureChineseWavCleanupButton(); return false; }
      const { data: admin, error } = await client
        .from('linguaflash_admins')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      isAdmin = !error && !!admin;
      ensurePanel();
      ensureChineseWavCleanupButton();
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
    policy: { zh: 'lesson-content', en: 'full-library' },
    canGenerate: () => isAdmin && !!session?.access_token
  };
})();