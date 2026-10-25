/* LinguaFlash: typed-answer study mode + automatic difficulty grading.
   Manual Again/Hard/Good/Easy buttons are hidden. Difficulty is inferred from wrong attempts. */
(() => {
  'use strict';

  const DAY_MS = 86400000;
  const state = {
    cardId: null,
    wrongAttempts: 0,
    submitting: false
  };

  const originalRenderCurrentCard = typeof renderCurrentCard === 'function' ? renderCurrentCard : null;
  const originalRateCard = typeof rateCard === 'function' ? rateCard : null;

  function uiText() {
    const lang = typeof currentUiLang === 'string' ? currentUiLang : 'vi';
    if (lang === 'en') return {
      title: 'Type your answer', placeholder: 'Type the answer…', check: 'Check',
      hint: 'Press Enter to check. Correct answer advances automatically.', wrong: n => `Not correct yet — try again. Wrong attempts: ${n}`,
      correct: n => n ? `Correct ✓ · ${n} wrong attempt${n > 1 ? 's' : ''}. Review priority adjusted automatically.` : 'Correct ✓ · moving to the next card…',
      auto: 'Automatic FSRS grading', level: n => n === 0 ? 'Strong recall' : n === 1 ? 'Good recall' : n === 2 ? 'Hard recall' : 'Review soon'
    };
    if (lang === 'zh') return {
      title: '输入答案', placeholder: '请输入答案…', check: '检查',
      hint: '按 Enter 检查。答对后自动进入下一张卡。', wrong: n => `还不正确，请再试一次。错误次数：${n}`,
      correct: n => n ? `正确 ✓ · 本卡答错 ${n} 次，系统已自动调整复习优先级。` : '正确 ✓ · 正在进入下一张卡…',
      auto: 'FSRS 自动评估', level: n => n === 0 ? '记忆很强' : n === 1 ? '记忆良好' : n === 2 ? '较难' : '需要尽快复习'
    };
    return {
      title: 'Nhập đáp án', placeholder: 'Nhập đáp án…', check: 'Kiểm tra',
      hint: 'Nhấn Enter để kiểm tra. Trả lời đúng sẽ tự chuyển sang thẻ tiếp theo.', wrong: n => `Chưa đúng — hãy thử lại. Số lần sai: ${n}`,
      correct: n => n ? `Đúng ✓ · Thẻ này đã sai ${n} lần, lịch ôn được tự động ưu tiên lại.` : 'Đúng ✓ · đang chuyển sang thẻ tiếp theo…',
      auto: 'FSRS tự động đánh giá', level: n => n === 0 ? 'Nhớ tốt' : n === 1 ? 'Nhớ khá' : n === 2 ? 'Khó' : 'Cần ôn lại sớm'
    };
  }

  function normalizeCommon(value) {
    return String(value == null ? '' : value)
      .normalize('NFKC')
      .toLocaleLowerCase()
      .replace(/[“”‘’]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeAnswer(value, language) {
    let v = normalizeCommon(value);
    if (language === 'Tiếng Trung') {
      return v.replace(/[\s\p{P}\p{S}]+/gu, '');
    }
    v = v.replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
    if (language === 'Tiếng Anh') v = v.replace(/^to\s+/, '');
    return v;
  }

  function candidateAnswers(raw, language) {
    const source = String(raw || '').trim();
    const values = new Set([source]);
    const withoutExamples = source.split(/\b(?:ví dụ|example|例句)\s*[:：]/i)[0].trim();
    if (withoutExamples) values.add(withoutExamples);
    source.split(/[|;；\n]+/).forEach(v => { if (v.trim()) values.add(v.trim()); });
    if (language !== 'Tiếng Trung' && source.length < 180) {
      source.split(/\s+\/\s+|\s*,\s*/).forEach(v => { if (v.trim()) values.add(v.trim()); });
    }
    const normalized = [...values].map(v => normalizeAnswer(v, language)).filter(Boolean);
    return [...new Set(normalized)];
  }

  function answerMatches(userValue, expectedRaw, language) {
    const user = normalizeAnswer(userValue, language);
    if (!user) return false;
    const candidates = candidateAnswers(expectedRaw, language);
    if (candidates.includes(user)) return true;

    // English cards commonly store infinitive answers as "to + verb"; normalization already removes "to".
    // For long sentence cards, punctuation and repeated spaces are ignored but the wording must still match.
    return false;
  }

  function currentCardInfo() {
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      const card = filteredDeck[currentIndex];
      if (!card) return null;
      const targetLanguage = document.getElementById('studyLangFilter')?.value || card.lang || 'Tiếng Trung';
      const expected = typeof getCardTextInLanguage === 'function' ? getCardTextInLanguage(card, targetLanguage) : (card.word || '');
      return { card, targetLanguage, expected };
    } catch (_) {
      return null;
    }
  }

  function autoGradeFromMistakes(mistakes) {
    // FSRS rating semantics: Again=1, Hard=2, Good=3, Easy=4.
    if (mistakes <= 0) return 4;
    if (mistakes === 1) return 3;
    if (mistakes === 2) return 2;
    return 1;
  }

  function computeFsrsState(card, mistakes) {
    const now = Date.now();
    const grade = autoGradeFromMistakes(mistakes);
    const settings = typeof getDailyGoalSettings === 'function' ? getDailyGoalSettings() : { desiredRetention: 90 };
    const retention = Math.max(0.80, Math.min(0.95, (Number(settings.desiredRetention) || 90) / 100));
    const previousStability = Math.max(0.1, Number(card.stability) || Math.max(0.1, Number(card.interval) || 0.1));
    const previousDifficulty = Math.max(1, Math.min(10, Number(card.difficulty) || 5));
    const lastReview = Number(card.lastReview || card.lastReviewedAt || 0);
    const elapsedDays = lastReview ? Math.max(0.01, (now - lastReview) / DAY_MS) : 0;
    const retrievability = lastReview ? Math.max(0.01, Math.min(1, Math.exp(Math.log(0.9) * elapsedDays / previousStability))) : 0.9;

    let difficulty;
    let stability;
    if (!lastReview || !(Number(card.reviewCount) > 0)) {
      const initialStability = { 1: 0.18, 2: 0.9, 3: 2.5, 4: 5.5 };
      const initialDifficulty = { 1: 8.8, 2: 7.2, 3: 5.2, 4: 3.5 };
      stability = initialStability[grade];
      difficulty = initialDifficulty[grade];
    } else {
      const difficultyDelta = { 1: 1.5, 2: 0.7, 3: -0.25, 4: -0.75 }[grade];
      difficulty = Math.max(1, Math.min(10, previousDifficulty + difficultyDelta));
      const memoryGap = Math.max(0.03, 1 - retrievability);
      const ease = Math.max(0.2, (11 - difficulty) / 5);
      if (grade === 1) {
        stability = Math.max(0.18, previousStability * (0.32 + 0.18 * retrievability));
      } else if (grade === 2) {
        stability = Math.max(0.5, previousStability * (1 + 0.45 * memoryGap * ease));
      } else if (grade === 3) {
        stability = Math.max(1, previousStability * (1 + 1.65 * memoryGap * ease));
      } else {
        stability = Math.max(2, previousStability * (1 + 2.8 * memoryGap * ease));
      }
    }

    let scheduledDays = stability * (Math.log(retention) / Math.log(0.9));
    if (grade === 1) scheduledDays = 10 / (24 * 60); // relearning step: 10 minutes
    else if (grade === 2) scheduledDays = Math.max(1, scheduledDays);
    else if (grade === 3) scheduledDays = Math.max(1, scheduledDays);
    else scheduledDays = Math.max(2, scheduledDays);

    return {
      grade,
      difficulty: Number(difficulty.toFixed(4)),
      stability: Number(stability.toFixed(4)),
      retrievability: Number(retrievability.toFixed(4)),
      elapsedDays: Number(elapsedDays.toFixed(4)),
      scheduledDays: Number(scheduledDays.toFixed(4)),
      nextReview: now + scheduledDays * DAY_MS,
      now
    };
  }

  function applyFsrsState(card, plan, mistakes) {
    if (!card || !plan) return;
    const settings = typeof getDailyGoalSettings === 'function' ? getDailyGoalSettings() : { srsAlgorithm: 'FSRS' };
    if ((settings.srsAlgorithm || 'FSRS') !== 'FSRS') return;

    card.difficulty = plan.difficulty;
    card.stability = plan.stability;
    card.elapsedDays = plan.elapsedDays;
    card.scheduledDays = plan.scheduledDays;
    card.lastReview = plan.now;
    card.reviewCount = (Number(card.reviewCount) || 0) + 1;
    card.lapses = (Number(card.lapses) || 0) + (plan.grade === 1 ? 1 : 0);
    card.state = plan.grade === 1 ? 'relearning' : 'review';
    card.nextReview = plan.nextReview;
    card.interval = plan.grade === 1 ? 0 : Math.max(1, Math.round(plan.scheduledDays));
    card.lastAnswerQuality = plan.grade - 1; // retain compatibility with existing filters: 0..3
    card.lastWrongAttempts = mistakes;
    try { if (typeof saveData === 'function') saveData(); } catch (_) {}
  }

  function hideManualRatingUi() {
    const title = document.querySelector('[data-i18n="srs_title"]');
    if (title) {
      title.style.display = 'none';
      const buttons = title.nextElementSibling;
      if (buttons) buttons.style.display = 'none';
    }
    const hint = document.querySelector('[data-i18n="rating_hint"]');
    if (hint) hint.style.display = 'none';
  }

  function ensureAnswerPanel() {
    hideManualRatingUi();
    let panel = document.getElementById('studyAnswerPanel');
    if (panel) return panel;

    const ratingTitle = document.querySelector('[data-i18n="srs_title"]');
    const host = ratingTitle?.parentElement || document.getElementById('flashcardContainer');
    if (!host) return null;

    panel = document.createElement('div');
    panel.id = 'studyAnswerPanel';
    panel.className = 'w-full max-w-xl mt-5 rounded-2xl bg-white border border-indigo-100 shadow-sm p-4';
    panel.innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-2">
        <label id="studyAnswerTitle" for="studyAnswerInput" class="text-sm font-extrabold text-slate-800"></label>
        <span id="studyAutoGradeBadge" class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"></span>
      </div>
      <div class="flex gap-2">
        <input id="studyAnswerInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
          class="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        <button id="studyAnswerCheckBtn" type="button" class="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-3 font-bold text-sm"></button>
      </div>
      <div class="mt-2 flex items-start justify-between gap-3 text-xs">
        <span id="studyAnswerHint" class="text-slate-500"></span>
        <span id="studyWrongCount" class="font-bold text-slate-500 whitespace-nowrap"></span>
      </div>
      <div id="studyAnswerFeedback" class="hidden mt-3 rounded-xl border px-3 py-2.5 text-sm font-semibold" aria-live="polite"></div>
    `;
    host.insertBefore(panel, ratingTitle || host.firstChild);

    const input = panel.querySelector('#studyAnswerInput');
    const button = panel.querySelector('#studyAnswerCheckBtn');
    button.addEventListener('click', submitAnswer);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitAnswer();
      }
    });
    return panel;
  }

  function updatePanelForCurrentCard(resetIfChanged = true) {
    const panel = ensureAnswerPanel();
    if (!panel) return;
    const info = currentCardInfo();
    const t = uiText();
    const input = document.getElementById('studyAnswerInput');
    const feedback = document.getElementById('studyAnswerFeedback');

    document.getElementById('studyAnswerTitle').textContent = `${t.title}${info?.targetLanguage ? ` · ${info.targetLanguage}` : ''}`;
    document.getElementById('studyAnswerCheckBtn').textContent = t.check;
    document.getElementById('studyAnswerHint').textContent = t.hint;
    document.getElementById('studyAutoGradeBadge').textContent = t.auto;

    if (!info) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');

    if (resetIfChanged && state.cardId !== info.card.id) {
      state.cardId = info.card.id;
      state.wrongAttempts = 0;
      state.submitting = false;
      if (input) {
        input.value = '';
        input.disabled = false;
        input.classList.remove('border-rose-400', 'bg-rose-50', 'border-emerald-400', 'bg-emerald-50');
      }
      if (feedback) feedback.classList.add('hidden');
    }
    if (input) input.placeholder = t.placeholder;
    const wrong = document.getElementById('studyWrongCount');
    if (wrong) wrong.textContent = state.wrongAttempts ? `${state.wrongAttempts} × sai · ${t.level(state.wrongAttempts)}` : t.level(0);

    // Focus only while the Study tab is visible; do not steal focus elsewhere in the app.
    const studyTab = document.getElementById('tab-study');
    if (input && studyTab && !studyTab.classList.contains('hidden')) {
      setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); } }, 0);
    }
  }

  function submitAnswer() {
    if (state.submitting) return;
    const info = currentCardInfo();
    const input = document.getElementById('studyAnswerInput');
    const feedback = document.getElementById('studyAnswerFeedback');
    if (!info || !input || !feedback) return;
    const value = input.value.trim();
    if (!value) { input.focus(); return; }

    const t = uiText();
    const ok = answerMatches(value, info.expected, info.targetLanguage);
    feedback.classList.remove('hidden');

    if (!ok) {
      state.wrongAttempts += 1;
      input.classList.remove('border-emerald-400', 'bg-emerald-50');
      input.classList.add('border-rose-400', 'bg-rose-50');
      feedback.className = 'mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700';
      feedback.textContent = t.wrong(state.wrongAttempts);
      const wrong = document.getElementById('studyWrongCount');
      if (wrong) wrong.textContent = `${state.wrongAttempts} × sai · ${t.level(state.wrongAttempts)}`;
      input.select();
      return;
    }

    state.submitting = true;
    input.disabled = true;
    input.classList.remove('border-rose-400', 'bg-rose-50');
    input.classList.add('border-emerald-400', 'bg-emerald-50');
    feedback.className = 'mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700';
    feedback.textContent = t.correct(state.wrongAttempts);

    const mistakes = state.wrongAttempts;
    const quality = mistakes <= 0 ? 3 : mistakes === 1 ? 2 : mistakes === 2 ? 1 : 0;
    const plan = computeFsrsState(info.card, mistakes);

    setTimeout(() => {
      try {
        if (originalRateCard) originalRateCard(quality);
        applyFsrsState(info.card, plan, mistakes);
      } catch (err) {
        console.error('Typed study answer:', err);
        state.submitting = false;
      }
      updatePanelForCurrentCard(true);
    }, 220);
  }

  if (originalRenderCurrentCard) {
    renderCurrentCard = function(...args) {
      const result = originalRenderCurrentCard.apply(this, args);
      updatePanelForCurrentCard(true);
      return result;
    };
  }

  // The old buttons remain in the DOM only for backwards compatibility with renderCurrentCard(),
  // but are no longer visible or needed by the learner.
  ensureAnswerPanel();
  updatePanelForCurrentCard(true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updatePanelForCurrentCard(true), { once: true });
  }
})();
