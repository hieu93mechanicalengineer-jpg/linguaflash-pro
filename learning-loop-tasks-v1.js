/* LinguaFlash Learning Loop Tasks v1
   Adds small, concrete completion tasks to steps 2-6 of the existing Learning Loop.
   Does not change FSRS or card progress. Missing content can be explicitly skipped.
*/
(() => {
  'use strict';

  const LOOP_KEY = 'linguaflash_learning_loop_v1';
  const TASK_KEY = 'linguaflash_learning_loop_tasks_v1';
  const REQUIRED_STEPS = new Set([1, 2, 3, 4, 5]);
  let renderQueued = false;
  let lastConfiguredStep = null;

  function parse(raw, fallback = null) { try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function readLoop() { return parse(localStorage.getItem(LOOP_KEY), { active: false, step: 0, startedAt: 0, context: null }) || { active: false, step: 0, startedAt: 0, context: null }; }
  function readTasks() { return parse(localStorage.getItem(TASK_KEY), null); }
  function freshTasks(startedAt) {
    return { version: 1, startedAt: Number(startedAt) || 0, completed: {}, listen: { heardCn: false, typedCn: false }, updatedAt: Date.now() };
  }
  function taskState() {
    const loop = readLoop();
    let tasks = readTasks();
    if (!tasks || Number(tasks.startedAt) !== Number(loop.startedAt || 0)) {
      tasks = freshTasks(loop.startedAt);
      saveTasks(tasks);
    }
    tasks.completed = tasks.completed || {};
    tasks.listen = { heardCn: false, typedCn: false, ...(tasks.listen || {}) };
    return tasks;
  }
  function saveTasks(tasks) {
    tasks.updatedAt = Date.now();
    try { localStorage.setItem(TASK_KEY, JSON.stringify(tasks)); } catch (_) {}
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function toast(message, icon = '🎯') {
    try { if (typeof showToast === 'function') showToast(message, icon); else console.info(message); } catch (_) { console.info(message); }
  }
  function currentStep() { return Math.max(0, Math.min(6, Number(readLoop().step) || 0)); }
  function isComplete(step = currentStep()) {
    if (!REQUIRED_STEPS.has(step)) return true;
    return !!taskState().completed[String(step)];
  }
  function markComplete(step = currentStep(), message = '') {
    const tasks = taskState();
    tasks.completed[String(step)] = true;
    saveTasks(tasks);
    if (message) toast(message, '✅');
    scheduleRender();
  }
  function skipCurrent() {
    const step = currentStep();
    if (!REQUIRED_STEPS.has(step)) return;
    markComplete(step, 'Đã bỏ qua nhiệm vụ của bước này.');
  }

  function currentCard() {
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      return filteredDeck[currentIndex] || null;
    } catch (_) { return null; }
  }

  function taskText(step) {
    const done = isComplete(step);
    const tasks = taskState();
    const card = currentCard();
    if (step === 1) {
      const example = String(card?.example || '').trim();
      return {
        title: done ? '✅ Câu ví dụ đã hoàn thành' : '🎯 Câu ví dụ',
        body: example || 'Thẻ hiện tại chưa có câu ví dụ.',
        extra: example ? `<div class="mt-2 flex flex-wrap gap-2"><button type="button" class="lf-loop-task-btn" onclick="lfLoopTaskSpeakExample()">🔊 Nghe câu ví dụ</button><button type="button" class="lf-loop-task-btn good" onclick="lfLoopTaskCompleteExample()">✓ Đã đọc & hiểu</button></div>` : ''
      };
    }
    if (step === 2) return {
      title: done ? '✅ Hội thoại đã hoàn thành' : '🎯 Hội thoại chủ động nhớ',
      body: 'Hán tự đang được ẩn. Hãy nhập đúng ít nhất 1 câu Hán tự trong phần Hội thoại.',
      extra: ''
    };
    if (step === 3) {
      const heard = !!tasks.listen.heardCn;
      const typed = !!tasks.listen.typedCn;
      return {
        title: done ? '✅ Nghe đã hoàn thành' : '🎧 Nghe rồi viết lại',
        body: `Ẩn Hán tự + Pinyin. Nghe một câu tiếng Trung rồi gõ lại Hán tự. ${heard ? '✅ Đã nghe' : '⬜ Chưa nghe'} · ${typed ? '✅ Đã gõ đúng' : '⬜ Chưa gõ đúng'}`,
        extra: ''
      };
    }
    if (step === 4) return {
      title: done ? '✅ Luyện dịch đã hoàn thành' : '✍️ Luyện dịch',
      body: 'Dịch ít nhất 1 câu sang Hán tự rồi bấm Kiểm tra. Kết quả xanh hoặc vàng đều được tính đạt; Pinyin không được dùng làm đáp án.',
      extra: ''
    };
    if (step === 5) return {
      title: done ? '✅ Quiz đã hoàn thành' : '🎯 Quiz',
      body: 'Làm đúng ít nhất 1 câu Quiz để củng cố lại nội dung vừa học.',
      extra: ''
    };
    return null;
  }

  function ensureTaskPanel() {
    const bar = document.getElementById('lfLearningLoopBar');
    if (!bar || !bar.classList.contains('open')) return null;
    let panel = document.getElementById('lfLearningLoopTaskPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'lfLearningLoopTaskPanel';
      panel.style.cssText = 'margin:8px 0 9px;padding:9px 10px;border-radius:13px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:12px;line-height:1.35';
      const dots = bar.querySelector('.lf-loop-dots');
      if (dots) dots.insertAdjacentElement('afterend', panel); else bar.prepend(panel);
    }
    return panel;
  }

  function renderTaskPanel() {
    renderQueued = false;
    const loop = readLoop();
    const bar = document.getElementById('lfLearningLoopBar');
    if (!bar || !loop.active) return;
    const step = currentStep();
    const panel = ensureTaskPanel();
    if (!panel) return;
    const task = taskText(step);
    if (!task) {
      panel.style.display = 'none';
    } else {
      panel.style.display = '';
      const done = isComplete(step);
      const html = `<div class="font-extrabold text-indigo-200">${esc(task.title)}</div><div class="mt-1 text-slate-200">${esc(task.body)}</div>${task.extra}${!done ? `<div class="mt-2"><button type="button" class="lf-loop-task-btn skip" onclick="lfLoopTaskSkip()">Bỏ qua bước này</button></div>` : ''}`;
      if (panel.dataset.signature !== html) {
        panel.dataset.signature = html;
        panel.innerHTML = html;
      }
    }
    const nextBtn = Array.from(bar.querySelectorAll('button')).find(btn => String(btn.getAttribute('onclick') || '').includes('lfLearningLoopNext'));
    if (nextBtn) {
      const locked = REQUIRED_STEPS.has(step) && !isComplete(step);
      nextBtn.style.opacity = locked ? '.7' : '1';
      nextBtn.title = locked ? 'Hoàn thành nhiệm vụ của bước này trước.' : '';
    }
  }

  function ensureStyles() {
    if (document.getElementById('lfLearningLoopTaskStyles')) return;
    const style = document.createElement('style');
    style.id = 'lfLearningLoopTaskStyles';
    style.textContent = `
      .lf-loop-task-btn{border:1px solid rgba(255,255,255,.2);background:#1e293b;color:#fff;border-radius:10px;padding:7px 9px;font-size:11px;font-weight:850}
      .lf-loop-task-btn.good{background:#047857;border-color:#059669}.lf-loop-task-btn.skip{background:transparent;color:#cbd5e1}
      @media(max-width:767px){#lfLearningLoopTaskPanel{max-height:150px;overflow:auto}}
    `;
    document.head.appendChild(style);
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(renderTaskPanel);
  }

  function configureStep(step) {
    if (step === lastConfiguredStep) { scheduleRender(); return; }
    lastConfiguredStep = step;
    const tasks = taskState();

    if (step === 2) {
      setTimeout(() => {
        try { window.lfDialogueRecallSetVisible?.('pinyin', true); } catch (_) {}
        try { window.lfDialogueRecallSetVisible?.('cn', false); } catch (_) {}
      }, 80);
    } else if (step === 3) {
      if (!tasks.completed['3']) {
        tasks.listen = { heardCn: false, typedCn: false };
        saveTasks(tasks);
      }
      setTimeout(() => {
        try { window.lfDialogueRecallSetVisible?.('cn', false); } catch (_) {}
        try { window.lfDialogueRecallSetVisible?.('pinyin', false); } catch (_) {}
        try { window.lfDialogueRecallReset?.(); } catch (_) {}
      }, 80);
    } else if (step === 4) {
      setTimeout(() => {
        const lang = document.getElementById('dialoguePracticeLang');
        if (lang && Array.from(lang.options || []).some(o => o.value === 'cn')) lang.value = 'cn';
        const mode = document.getElementById('dialoguePracticeMode');
        if (mode && Array.from(mode.options || []).some(o => o.value === 'translate')) mode.value = 'translate';
        try { if (typeof newDialoguePracticeQuestion === 'function') newDialoguePracticeQuestion(); } catch (_) {}
      }, 100);
    }
    scheduleRender();
  }

  function syncFromLoop() {
    const loop = readLoop();
    taskState();
    if (loop.active) configureStep(currentStep());
    scheduleRender();
  }

  function wrapLoopAction(name, { gate = false } = {}) {
    const original = window[name];
    if (typeof original !== 'function' || original.__lfTaskWrapped) return;
    const wrapped = function(...args) {
      if (gate) {
        const step = currentStep();
        if (REQUIRED_STEPS.has(step) && !isComplete(step)) {
          toast('Hoàn thành nhiệm vụ nhỏ của bước này trước khi sang bước tiếp theo.', '🔒');
          document.getElementById('lfLearningLoopTaskPanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
      }
      const result = original.apply(this, args);
      setTimeout(syncFromLoop, 0);
      return result;
    };
    wrapped.__lfTaskWrapped = true;
    window[name] = wrapped;
  }

  function wrapDialogueRecallCheck() {
    const original = window.lfDialogueRecallCheck;
    if (typeof original !== 'function' || original.__lfTaskWrapped) return;
    const wrapped = function(lineIndex, field, ...rest) {
      const result = original.call(this, lineIndex, field, ...rest);
      setTimeout(() => {
        if (field !== 'cn') return;
        const input = document.getElementById(`lfDialogueInput-${lineIndex}-${field}`);
        if (!input?.classList.contains('ok')) return;
        const step = currentStep();
        if (step === 2) {
          markComplete(2, 'Đã nhập đúng 1 câu hội thoại.');
        } else if (step === 3) {
          const tasks = taskState();
          tasks.listen.typedCn = true;
          if (tasks.listen.heardCn) tasks.completed['3'] = true;
          saveTasks(tasks);
          if (tasks.completed['3']) toast('Đã hoàn thành bước Nghe.', '✅');
          scheduleRender();
        }
      }, 35);
      return result;
    };
    wrapped.__lfTaskWrapped = true;
    window.lfDialogueRecallCheck = wrapped;
  }

  function markHeardChinese() {
    if (currentStep() !== 3) return;
    const tasks = taskState();
    tasks.listen.heardCn = true;
    if (tasks.listen.typedCn) tasks.completed['3'] = true;
    saveTasks(tasks);
    if (tasks.completed['3']) toast('Đã hoàn thành bước Nghe.', '✅');
    scheduleRender();
  }

  function wrapAudio(name, languageArgIndex) {
    const original = window[name];
    if (typeof original !== 'function' || original.__lfTaskWrapped) return;
    const wrapped = function(...args) {
      const lang = args[languageArgIndex] == null ? 'cn' : args[languageArgIndex];
      const result = original.apply(this, args);
      if (lang === 'cn') markHeardChinese();
      return result;
    };
    wrapped.__lfTaskWrapped = true;
    window[name] = wrapped;
  }

  function wrapTranslationCheck() {
    const original = window.checkDialoguePracticeAnswer;
    if (typeof original !== 'function' || original.__lfTaskWrapped) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      setTimeout(() => {
        if (currentStep() !== 4) return;
        const box = document.getElementById('dialoguePracticeFeedback');
        if (!box || box.classList.contains('hidden')) return;
        const passed = box.className.includes('border-emerald-200') || box.className.includes('border-amber-200');
        if (passed) markComplete(4, 'Đã hoàn thành 1 câu luyện dịch.');
      }, 20);
      return result;
    };
    wrapped.__lfTaskWrapped = true;
    window.checkDialoguePracticeAnswer = wrapped;
  }

  function observeQuiz() {
    const attach = () => {
      const box = document.getElementById('quizFeedback');
      if (!box || box.__lfTaskObserved) return;
      box.__lfTaskObserved = true;
      const observer = new MutationObserver(() => {
        if (currentStep() !== 5 || box.classList.contains('hidden')) return;
        if (box.className.includes('bg-emerald-100')) markComplete(5, 'Đã làm đúng 1 câu Quiz.');
      });
      observer.observe(box, { attributes: true, childList: true, subtree: true });
    };
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function speakExample() {
    try {
      if (typeof speakCurrentExample === 'function') speakCurrentExample();
      else toast('Thiết bị chưa có chức năng đọc câu ví dụ ở màn này.', 'ℹ️');
    } catch (_) { toast('Không phát được câu ví dụ.', '⚠️'); }
  }
  function completeExample() { markComplete(1, 'Đã hoàn thành câu ví dụ.'); }

  function init() {
    ensureStyles();
    taskState();
    wrapLoopAction('lfLearningLoopStart');
    wrapLoopAction('lfLearningLoopResume');
    wrapLoopAction('lfLearningLoopPrev');
    wrapLoopAction('lfLearningLoopGo');
    wrapLoopAction('lfLearningLoopNext', { gate: true });
    wrapDialogueRecallCheck();
    wrapAudio('speakDialogueLine', 1);
    wrapAudio('speakFullDialogue', 0);
    wrapTranslationCheck();
    observeQuiz();

    const barObserver = new MutationObserver(scheduleRender);
    barObserver.observe(document.documentElement, { childList: true, subtree: true });
    syncFromLoop();
  }

  window.lfLoopTaskSkip = skipCurrent;
  window.lfLoopTaskSpeakExample = speakExample;
  window.lfLoopTaskCompleteExample = completeExample;
  window.lfLearningLoopTaskComplete = markComplete;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
