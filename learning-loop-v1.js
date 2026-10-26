/* LinguaFlash Learning Loop v1
   Guides the learner through existing modules instead of duplicating study logic:
   Vocabulary -> Examples -> Dialogue -> Listening -> Translation -> Quiz -> FSRS.
*/
(() => {
  'use strict';

  const KEY = 'linguaflash_learning_loop_v1';
  const STEP_COUNT = 7;
  let state = readState();

  function parse(raw, fallback = null) { try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function readState() {
    const saved = parse(localStorage.getItem(KEY), null);
    if (!saved || typeof saved !== 'object') return { version: 1, active: false, step: 0, context: null };
    return { version: 1, active: !!saved.active, step: Math.max(0, Math.min(6, Number(saved.step) || 0)), context: saved.context || null, startedAt: saved.startedAt || 0, updatedAt: saved.updatedAt || 0 };
  }
  function saveState() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  }

  function uiText() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      title: 'Learning Loop', path: 'Vocabulary → examples → dialogue → listening → translation → quiz → FSRS',
      start: 'Start Learning Loop', resume: 'Continue Loop', next: 'Next step', prev: 'Back', stop: 'Stop', finish: 'Finish',
      active: 'Active learning path', noDialogue: 'No matching dialogue was found for this lesson; the current dialogue lesson will be used.',
      done: 'Learning Loop complete. FSRS will now keep the material returning at the right time.',
      steps: [
        ['Vocabulary', 'Answer the current flashcards from memory. Let FSRS record real recall quality.'],
        ['Examples', 'Flip the cards and read/listen to the example sentence. Connect the word with a real sentence.'],
        ['Dialogue', 'Read the matching dialogue. Notice how the vocabulary appears in context.'],
        ['Listening', 'Listen line by line or to the whole dialogue. Hide Hanzi if you want to transcribe from listening.'],
        ['Translation', 'Use Dialogue practice in Translation mode. Produce the meaning yourself before checking.'],
        ['Quiz', 'Test recall again with the lesson/dialogue quiz.'],
        ['FSRS', 'Return to due cards. FSRS-6 decides when each card should appear again.']
      ]
    };
    if (lang === 'zh') return {
      title: '学习循环', path: '词汇 → 例句 → 会话 → 听力 → 翻译 → 测验 → FSRS',
      start: '开始学习循环', resume: '继续学习循环', next: '下一步', prev: '上一步', stop: '停止', finish: '完成',
      active: '当前学习路径', noDialogue: '没有找到完全匹配的会话，将使用当前选择的会话课程。',
      done: '学习循环已完成。接下来由 FSRS 按合适时间安排复习。',
      steps: [
        ['词汇', '先凭记忆回答当前卡片，让 FSRS 记录真实回忆质量。'],
        ['例句', '翻卡并阅读/收听例句，把词汇放进真实句子。'],
        ['会话', '阅读对应会话，观察词汇在语境中的用法。'],
        ['听力', '逐句或整课收听；也可以隐藏汉字后听写。'],
        ['翻译', '使用会话里的翻译练习，先自己输出再检查。'],
        ['测验', '用本课/会话测验再次检验记忆。'],
        ['FSRS', '回到到期卡片，由 FSRS-6 决定下一次复习时间。']
      ]
    };
    return {
      title: 'Learning Loop', path: 'Từ vựng → câu ví dụ → hội thoại → nghe → dịch → quiz → FSRS',
      start: 'Bắt đầu Learning Loop', resume: 'Tiếp tục Learning Loop', next: 'Bước tiếp theo', prev: 'Quay lại', stop: 'Dừng', finish: 'Hoàn tất',
      active: 'Lộ trình học đang chạy', noDialogue: 'Chưa tìm thấy bài hội thoại khớp hoàn toàn; hệ thống sẽ dùng bài hội thoại đang chọn.',
      done: 'Đã hoàn thành Learning Loop. Từ đây FSRS sẽ đưa nội dung quay lại đúng thời điểm cần ôn.',
      steps: [
        ['Từ vựng', 'Trả lời các flashcard hiện tại từ trí nhớ. FSRS ghi nhận đúng chất lượng nhớ thật.'],
        ['Câu ví dụ', 'Lật thẻ, đọc và nghe câu ví dụ để nối từ vựng với ngữ cảnh thực tế.'],
        ['Hội thoại', 'Đọc bài hội thoại phù hợp và quan sát cách từ được dùng trong ngữ cảnh.'],
        ['Nghe', 'Nghe từng câu hoặc toàn bài. Có thể ẩn Hán tự để nghe rồi tự nhập lại.'],
        ['Dịch', 'Dùng phần Luyện dịch của Hội thoại: tự tạo câu trả lời trước rồi mới kiểm tra.'],
        ['Quiz', 'Kiểm tra lại trí nhớ bằng quiz của bài/hội thoại.'],
        ['FSRS', 'Quay lại các thẻ đến hạn. FSRS-6 quyết định khi nào từng thẻ cần xuất hiện lại.']
      ]
    };
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function optionExists(select, value) {
    return !!select && Array.from(select.options || []).some(o => o.value === value);
  }

  function captureContext() {
    const context = {
      language: document.getElementById('studyLangFilter')?.value || 'Tiếng Trung',
      category: document.getElementById('studyCategoryFilter')?.value || 'ALL',
      topic: document.getElementById('studyTopicFilter')?.value || 'ALL',
      dueOnly: !!document.getElementById('studyDueOnly')?.checked,
      dialogueKey: null
    };
    context.dialogueKey = findDialogueKey(context);
    return context;
  }

  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ').trim();
  }

  function lessonNumber(value) {
    const text = String(value || '');
    const m = text.match(/(?:bài|lesson|l)\s*[-:]?\s*(\d{1,3})/i) || text.match(/\b(\d{1,3})\b/);
    return m ? Number(m[1]) : null;
  }

  function findDialogueKey(context) {
    let db;
    try { db = DIALOGUES_DB || {}; } catch (_) { return null; }
    const topic = String(context?.topic || '');
    const category = String(context?.category || '');
    const num = lessonNumber(topic);
    if (num && db[`zh_l${num}`]) return `zh_l${num}`;
    const sMatch = topic.match(/(?:phần|part|s)\s*[-:]?\s*s?(\d{1,2})/i);
    if (sMatch && db[`s${Number(sMatch[1])}`]) return `s${Number(sMatch[1])}`;

    const nt = norm(topic), nc = norm(category);
    let best = null, bestScore = 0;
    Object.entries(db).forEach(([key, dlg]) => {
      if (!dlg) return;
      const dt = norm(dlg.topic), title = norm(dlg.title), course = norm(dlg.course);
      let score = 0;
      if (nt && nt !== 'all') {
        if (dt === nt) score += 8;
        else if (dt.includes(nt) || nt.includes(dt)) score += 5;
        if (title.includes(nt)) score += 3;
      }
      if (nc && nc !== 'all') {
        if (course.includes(nc) || nc.includes(course)) score += 3;
        if (title.includes(nc)) score += 2;
      }
      const dnum = lessonNumber(dlg.topic || dlg.title);
      if (num && dnum === num) score += 5;
      if (score > bestScore) { best = key; bestScore = score; }
    });
    return bestScore >= 4 ? best : null;
  }

  function contextLabel(context) {
    if (!context) return '';
    const bits = [];
    if (context.category && context.category !== 'ALL' && context.category !== '__LF_WEAK__') bits.push(context.category);
    if (context.topic && context.topic !== 'ALL') bits.push(context.topic);
    return bits.join(' · ') || context.language || '';
  }

  function ensureStyles() {
    if (document.getElementById('lfLearningLoopStyles')) return;
    const style = document.createElement('style');
    style.id = 'lfLearningLoopStyles';
    style.textContent = `
      #lfLearningLoopBar{position:fixed;z-index:99970;left:50%;transform:translateX(-50%);bottom:18px;width:min(940px,calc(100% - 28px));background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:20px;box-shadow:0 18px 50px rgba(15,23,42,.28);padding:13px 14px;display:none}
      #lfLearningLoopBar.open{display:block}.lf-loop-dots{display:flex;gap:5px}.lf-loop-dot{height:5px;flex:1;border-radius:99px;background:#334155}.lf-loop-dot.done{background:#14b8a6}.lf-loop-dot.current{background:#818cf8}
      .lf-loop-btn{border-radius:11px;padding:8px 11px;font-size:12px;font-weight:850;border:1px solid #475569;background:#1e293b;color:#fff}.lf-loop-btn.primary{background:#4f46e5;border-color:#4f46e5}.lf-loop-btn.finish{background:#059669;border-color:#059669}
      @media(max-width:767px){#lfLearningLoopBar{bottom:88px;width:calc(100% - 16px);padding:11px;border-radius:17px}.lf-loop-desc{display:none}}
    `;
    document.head.appendChild(style);
  }

  function ensureHomeCard() {
    const home = document.getElementById('tab-home');
    if (!home) return null;
    let card = document.getElementById('lfLearningLoopHomeCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'lfLearningLoopHomeCard';
      card.className = 'app-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4';
      const weak = document.getElementById('lfWeakWordsHomeCard');
      const cloud = document.getElementById('lfCloudHomeCard');
      if (weak) weak.insertAdjacentElement('afterend', card);
      else if (cloud) cloud.insertAdjacentElement('afterend', card);
      else home.querySelector('.app-hero')?.insertAdjacentElement('afterend', card);
    }
    renderHomeCard(card);
    return card;
  }

  function renderHomeCard(card = document.getElementById('lfLearningLoopHomeCard')) {
    if (!card) return;
    const t = uiText();
    const active = state.active;
    const step = Math.max(0, Math.min(6, state.step || 0));
    const label = contextLabel(state.context);
    card.innerHTML = `
      <div class="min-w-0">
        <div class="font-extrabold text-slate-900">🧭 ${esc(t.title)}${active ? ` <span class="text-indigo-600">${step + 1}/${STEP_COUNT}</span>` : ''}</div>
        <div class="text-sm text-slate-600 mt-1">${active ? `${esc(t.steps[step][0])} · ${esc(label || t.path)}` : esc(t.path)}</div>
      </div>
      <button type="button" class="app-primary-btn shrink-0" onclick="${active ? 'lfLearningLoopResume()' : 'lfLearningLoopStart()'}">${active ? '▶ ' + esc(t.resume) : '🧭 ' + esc(t.start)}</button>`;
  }

  function ensureBar() {
    ensureStyles();
    let bar = document.getElementById('lfLearningLoopBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'lfLearningLoopBar';
      document.body.appendChild(bar);
    }
    renderBar(bar);
    return bar;
  }

  function renderBar(bar = document.getElementById('lfLearningLoopBar')) {
    if (!bar) return;
    if (!state.active) { bar.classList.remove('open'); return; }
    const t = uiText();
    const step = Math.max(0, Math.min(6, state.step || 0));
    const item = t.steps[step];
    bar.classList.add('open');
    bar.innerHTML = `
      <div class="lf-loop-dots mb-2">${Array.from({length:STEP_COUNT}, (_, i) => `<span class="lf-loop-dot ${i < step ? 'done' : i === step ? 'current' : ''}"></span>`).join('')}</div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0 flex-1"><div class="text-xs font-extrabold text-indigo-300">🧭 ${esc(t.active)} · ${step + 1}/${STEP_COUNT}</div><div class="font-extrabold mt-0.5">${esc(item[0])}</div><div class="lf-loop-desc text-xs text-slate-300 mt-1">${esc(item[1])}</div></div>
        <div class="flex flex-wrap gap-2">
          ${step > 0 ? `<button class="lf-loop-btn" onclick="lfLearningLoopPrev()">← ${esc(t.prev)}</button>` : ''}
          <button class="lf-loop-btn" onclick="lfLearningLoopStop()">✕ ${esc(t.stop)}</button>
          <button class="lf-loop-btn ${step === STEP_COUNT - 1 ? 'finish' : 'primary'}" onclick="${step === STEP_COUNT - 1 ? 'lfLearningLoopFinish()' : 'lfLearningLoopNext()'}">${step === STEP_COUNT - 1 ? '✓ ' + esc(t.finish) : esc(t.next) + ' →'}</button>
        </div>
      </div>`;
  }

  function restoreStudyContext(context, dueOnly = null, reapply = false) {
    if (!context) return;
    const lang = document.getElementById('studyLangFilter');
    const cat = document.getElementById('studyCategoryFilter');
    const topic = document.getElementById('studyTopicFilter');
    const due = document.getElementById('studyDueOnly');
    if (lang && optionExists(lang, context.language)) lang.value = context.language;
    if (cat && optionExists(cat, context.category)) {
      cat.value = context.category;
      try { if (typeof updateSubtopicDropdown === 'function') updateSubtopicDropdown(); } catch (_) {}
    }
    if (topic && optionExists(topic, context.topic)) topic.value = context.topic;
    if (due && dueOnly !== null) due.checked = !!dueOnly;
    if (reapply) {
      try { if (typeof applyStudyFilters === 'function') applyStudyFilters(); } catch (_) {}
    }
  }

  function selectDialogue(context) {
    try { if (typeof switchTab === 'function') switchTab('dialogue'); } catch (_) {}
    let key = context?.dialogueKey;
    let db = {};
    try { db = DIALOGUES_DB || {}; } catch (_) {}
    if (!key || !db[key]) {
      const current = document.getElementById('dialogueLessonSelector')?.value;
      key = current && db[current] ? current : Object.keys(db)[0];
    }
    if (!key || !db[key]) return null;
    const dlg = db[key];
    const course = document.getElementById('dialogueCourseSelector');
    if (course && optionExists(course, dlg.course)) {
      course.value = dlg.course;
      try { if (typeof populateDialogueLessonDropdown === 'function') populateDialogueLessonDropdown(true); } catch (_) {}
    }
    const lesson = document.getElementById('dialogueLessonSelector');
    if (lesson && optionExists(lesson, key)) lesson.value = key;
    try { if (typeof changeDialogueLesson === 'function') changeDialogueLesson(key); } catch (_) {}
    return key;
  }

  function prepareTranslation(context) {
    selectDialogue(context);
    const mode = document.getElementById('dialoguePracticeMode');
    if (mode && optionExists(mode, 'translate')) mode.value = 'translate';
    try { if (typeof newDialoguePracticeQuestion === 'function') newDialoguePracticeQuestion(); } catch (_) {}
    setTimeout(() => document.getElementById('dialoguePracticeTitle')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  function prepareQuiz(context) {
    try { if (typeof switchTab === 'function') switchTab('quiz'); } catch (_) {}
    const content = document.getElementById('quizContentFilter');
    const isGiaHanDialogue = /^zh_l(?:1[6-9]|2\d|3\d|4[0-5])$/.test(String(context?.dialogueKey || ''));
    if (content && optionExists(content, isGiaHanDialogue ? 'DIALOGUE' : 'CARDS')) content.value = isGiaHanDialogue ? 'DIALOGUE' : 'CARDS';
    const lang = document.getElementById('quizLangFilter');
    if (lang && optionExists(lang, context?.language)) lang.value = context.language;
    try { if (typeof populateQuizCategoryDropdown === 'function') populateQuizCategoryDropdown(); } catch (_) {}
    const cat = document.getElementById('quizCategoryFilter');
    if (cat) {
      const preferred = isGiaHanDialogue && optionExists(cat, 'Gia Hân') ? 'Gia Hân' : context?.category;
      if (preferred && optionExists(cat, preferred)) cat.value = preferred;
    }
    try { if (typeof populateQuizSubtopicDropdown === 'function') populateQuizSubtopicDropdown(); } catch (_) {}
    const topic = document.getElementById('quizTopicFilter');
    if (topic && context?.topic && optionExists(topic, context.topic)) topic.value = context.topic;
    try { if (typeof startQuiz === 'function') startQuiz(); } catch (_) {}
  }

  function applyStep(step) {
    if (!state.active) return;
    state.step = Math.max(0, Math.min(6, Number(step) || 0));
    saveState();
    const context = state.context || captureContext();
    if (!state.context) { state.context = context; saveState(); }

    if (state.step === 0) {
      try { if (typeof switchTab === 'function') switchTab('study'); } catch (_) {}
      restoreStudyContext(context, false, false);
    } else if (state.step === 1) {
      try { if (typeof switchTab === 'function') switchTab('study'); } catch (_) {}
      restoreStudyContext(context, false, false);
    } else if (state.step === 2) {
      selectDialogue(context);
    } else if (state.step === 3) {
      selectDialogue(context);
    } else if (state.step === 4) {
      prepareTranslation(context);
    } else if (state.step === 5) {
      prepareQuiz(context);
    } else if (state.step === 6) {
      try { if (typeof switchTab === 'function') switchTab('study'); } catch (_) {}
      restoreStudyContext(context, true, true);
    }
    ensureBar();
    ensureHomeCard();
  }

  function start() {
    state = { version: 1, active: true, step: 0, context: captureContext(), startedAt: Date.now(), updatedAt: Date.now() };
    saveState();
    applyStep(0);
  }

  function resume() {
    if (!state.active) return start();
    applyStep(state.step);
  }

  function next() { if (state.active && state.step < STEP_COUNT - 1) applyStep(state.step + 1); }
  function prev() { if (state.active && state.step > 0) applyStep(state.step - 1); }

  function stop() {
    state.active = false;
    saveState();
    renderBar();
    renderHomeCard();
  }

  function finish() {
    const t = uiText();
    state.active = false;
    saveState();
    renderBar();
    renderHomeCard();
    try { if (typeof showToast === 'function') showToast(t.done, '🏁'); } catch (_) {}
  }

  function patchFunction(name, after) {
    const original = window[name];
    if (typeof original !== 'function' || original.__lfLoopPatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      try { after(args, result); } catch (_) {}
      return result;
    };
    wrapped.__lfLoopPatched = true;
    window[name] = wrapped;
  }

  function init() {
    ensureStyles();
    ensureHomeCard();
    ensureBar();
    patchFunction('switchTab', args => { if (args?.[0] === 'home') setTimeout(ensureHomeCard, 0); });
    document.getElementById('uiLangSelector')?.addEventListener('change', () => { setTimeout(() => { ensureHomeCard(); renderBar(); }, 0); });
  }

  window.lfLearningLoopStart = start;
  window.lfLearningLoopResume = resume;
  window.lfLearningLoopNext = next;
  window.lfLearningLoopPrev = prev;
  window.lfLearningLoopStop = stop;
  window.lfLearningLoopFinish = finish;
  window.lfLearningLoopGo = applyStep;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
