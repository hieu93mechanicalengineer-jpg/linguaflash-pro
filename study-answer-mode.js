/* LinguaFlash: typed-answer study mode + automatic FSRS-6 grading.
   Manual Again/Hard/Good/Easy buttons are hidden. Difficulty is inferred from wrong attempts.
   v20 keeps the existing progress fields so Sync v2 remains backwards-compatible. */
(() => {
  'use strict';

  const DAY_MS = 86400000;
  const FSRS6_W = [
    0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194,
    0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629,
    1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542
  ];
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
      hint: 'Press Enter to check. Correct answer advances automatically.',
      wrong: n => `Not correct yet — try again. Wrong attempts: ${n}`,
      correct: n => n ? `Correct ✓ · ${n} wrong attempt${n > 1 ? 's' : ''}.` : 'Correct ✓',
      auto: 'FSRS-6 automatic grading',
      level: n => n === 0 ? 'Strong recall' : n === 1 ? 'Good recall' : n === 2 ? 'Hard recall' : 'Review soon',
      forecast: (r, when) => `Memory now ~${r}% · if correct next: review in ${when}`,
      newForecast: when => `New card · if correct next: review in ${when}`,
      next: when => `Next review in ${when}`
    };
    if (lang === 'zh') return {
      title: '输入答案', placeholder: '请输入答案…', check: '检查',
      hint: '按 Enter 检查。答对后自动进入下一张卡。',
      wrong: n => `还不正确，请再试一次。错误次数：${n}`,
      correct: n => n ? `正确 ✓ · 本卡答错 ${n} 次。` : '正确 ✓',
      auto: 'FSRS-6 自动评估',
      level: n => n === 0 ? '记忆很强' : n === 1 ? '记忆良好' : n === 2 ? '较难' : '需要尽快复习',
      forecast: (r, when) => `当前记忆率约 ${r}% · 下一次答对后：${when} 后复习`,
      newForecast: when => `新卡 · 下一次答对后：${when} 后复习`,
      next: when => `预计 ${when} 后复习`
    };
    return {
      title: 'Nhập đáp án', placeholder: 'Nhập đáp án…', check: 'Kiểm tra',
      hint: 'Nhấn Enter để kiểm tra. Trả lời đúng sẽ tự chuyển sang thẻ tiếp theo.',
      wrong: n => `Chưa đúng — hãy thử lại. Số lần sai: ${n}`,
      correct: n => n ? `Đúng ✓ · Thẻ này đã sai ${n} lần.` : 'Đúng ✓',
      auto: 'FSRS-6 tự động đánh giá',
      level: n => n === 0 ? 'Nhớ tốt' : n === 1 ? 'Nhớ khá' : n === 2 ? 'Khó' : 'Cần ôn lại sớm',
      forecast: (r, when) => `Khả năng nhớ hiện tại ~${r}% · nếu đúng tiếp: ôn lại sau ${when}`,
      newForecast: when => `Thẻ mới · nếu đúng tiếp: ôn lại sau ${when}`,
      next: when => `Dự kiến ôn lại sau ${when}`
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
    return candidates.includes(user);
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
    // Preserve the tested LinguaFlash mapping: 0 wrong=Easy, 1=Good, 2=Hard, >=3=Again.
    if (mistakes <= 0) return 4;
    if (mistakes === 1) return 3;
    if (mistakes === 2) return 2;
    return 1;
  }

  function initialDifficulty(grade) {
    const w = FSRS6_W;
    return clamp(w[4] - Math.exp(w[5] * (grade - 1)) + 1, 1, 10);
  }

  function nextDifficulty(previousDifficulty, grade) {
    const w = FSRS6_W;
    const delta = -w[6] * (grade - 3);
    const damped = previousDifficulty + delta * (10 - previousDifficulty) / 9;
    const meanReverted = w[7] * initialDifficulty(4) + (1 - w[7]) * damped;
    return clamp(meanReverted, 1, 10);
  }

  function retrievabilityAt(elapsedDays, stability) {
    if (!(stability > 0)) return 0.9;
    const decay = FSRS6_W[20];
    const factor = Math.pow(0.9, -1 / decay) - 1;
    return clamp(Math.pow(1 + factor * Math.max(0, elapsedDays) / stability, -decay), 0.01, 1);
  }

  function intervalForRetention(stability, retention) {
    const decay = FSRS6_W[20];
    const factor = Math.pow(0.9, -1 / decay) - 1;
    return Math.max(1 / (24 * 60), (stability / factor) * (Math.pow(retention, -1 / decay) - 1));
  }

  function sameDayStability(previousStability, grade) {
    const w = FSRS6_W;
    const raw = previousStability * Math.exp(w[17] * (grade - 3 + w[18])) * Math.pow(previousStability, -w[19]);
    return grade >= 2 ? Math.max(previousStability, raw) : Math.max(0.01, raw);
  }

  function recallStability(previousStability, difficulty, retrievability, grade) {
    const w = FSRS6_W;
    const modifier = grade === 2 ? w[15] : grade === 4 ? w[16] : 1;
    const growth = Math.exp(w[8]) * (11 - difficulty) * Math.pow(previousStability, -w[9]) *
      (Math.exp(w[10] * (1 - retrievability)) - 1) * modifier;
    return Math.max(previousStability, previousStability * (1 + Math.max(0, growth)));
  }

  function lapseStability(previousStability, difficulty, retrievability) {
    const w = FSRS6_W;
    const raw = w[11] * Math.pow(difficulty, -w[12]) *
      (Math.pow(previousStability + 1, w[13]) - 1) * Math.exp(w[14] * (1 - retrievability));
    return clamp(raw, 0.01, previousStability);
  }

  function computeFsrsState(card, mistakes) {
    const now = Date.now();
    const grade = autoGradeFromMistakes(mistakes);
    const settings = typeof getDailyGoalSettings === 'function' ? getDailyGoalSettings() : { desiredRetention: 90 };
    const retention = clamp((Number(settings.desiredRetention) || 90) / 100, 0.80, 0.95);
    const lastReview = Number(card.lastReview || card.lastReviewedAt || 0);
    const hasHistory = !!lastReview && (Number(card.reviewCount) > 0 || Number(card.repetitions) > 0);
    const elapsedDays = lastReview ? Math.max(0, (now - lastReview) / DAY_MS) : 0;
    const previousStability = Math.max(0.01, Number(card.stability) || Math.max(0.01, Number(card.interval) || FSRS6_W[2]));
    const previousDifficulty = clamp(Number(card.difficulty) || initialDifficulty(3), 1, 10);
    const retrievability = hasHistory ? retrievabilityAt(elapsedDays, previousStability) : 0.9;

    let difficulty;
    let stability;
    if (!hasHistory) {
      stability = FSRS6_W[grade - 1];
      difficulty = initialDifficulty(grade);
    } else {
      difficulty = nextDifficulty(previousDifficulty, grade);
      if (elapsedDays < 1) {
        stability = sameDayStability(previousStability, grade);
      } else if (grade === 1) {
        stability = lapseStability(previousStability, difficulty, retrievability);
      } else {
        stability = recallStability(previousStability, difficulty, retrievability, grade);
      }
    }

    let scheduledDays;
    if (grade === 1) {
      scheduledDays = 10 / (24 * 60); // 10-minute relearning step remains explicit in LinguaFlash.
    } else {
      scheduledDays = intervalForRetention(stability, retention);
      if (grade === 2) scheduledDays = Math.max(1, scheduledDays);
      if (grade === 3) scheduledDays = Math.max(1, scheduledDays);
      if (grade === 4) scheduledDays = Math.max(2, scheduledDays);
    }

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

  function formatInterval(days) {
    const minutes = Math.max(1, Math.round(Number(days || 0) * 24 * 60));
    const lang = typeof currentUiLang === 'string' ? currentUiLang : 'vi';
    if (minutes < 60) return lang === 'zh' ? `${minutes} 分钟` : lang === 'en' ? `${minutes} min` : `${minutes} phút`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return lang === 'zh' ? `${hours} 小时` : lang === 'en' ? `${hours} hr` : `${hours} giờ`;
    const daysRounded = Math.max(1, Math.round(minutes / 1440));
    if (daysRounded < 30) return lang === 'zh' ? `${daysRounded} 天` : lang === 'en' ? `${daysRounded} day${daysRounded === 1 ? '' : 's'}` : `${daysRounded} ngày`;
    const months = Math.max(1, Math.round(daysRounded / 30));
    return lang === 'zh' ? `${months} 个月` : lang === 'en' ? `${months} month${months === 1 ? '' : 's'}` : `${months} tháng`;
  }

  function currentMemoryPercent(card) {
    const lastReview = Number(card?.lastReview || card?.lastReviewedAt || 0);
    const stability = Number(card?.stability || 0);
    if (!lastReview || !(stability > 0)) return null;
    const elapsedDays = Math.max(0, (Date.now() - lastReview) / DAY_MS);
    return Math.round(retrievabilityAt(elapsedDays, stability) * 100);
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
    card.lastReviewedAt = plan.now;
    card.reviewCount = (Number(card.reviewCount) || 0) + 1;
    card.lapses = (Number(card.lapses) || 0) + (plan.grade === 1 ? 1 : 0);
    card.state = plan.grade === 1 ? 'relearning' : 'review';
    card.nextReview = plan.nextReview;
    card.interval = plan.grade === 1 ? 0 : Math.max(1, Math.round(plan.scheduledDays));
    card.lastAnswerQuality = plan.grade - 1;
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
      <div id="studyFsrsForecast" class="mt-2 rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-800"></div>
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

  function updateForecast(info, t) {
    const el = document.getElementById('studyFsrsForecast');
    if (!el || !info?.card) return;
    try {
      const plan = computeFsrsState(info.card, state.wrongAttempts);
      const when = formatInterval(plan.scheduledDays);
      const memory = currentMemoryPercent(info.card);
      el.textContent = memory == null ? t.newForecast(when) : t.forecast(memory, when);
    } catch (_) {
      el.textContent = '';
    }
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
    updateForecast(info, t);

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
      updateForecast(info, t);
      input.select();
      return;
    }

    state.submitting = true;
    input.disabled = true;
    input.classList.remove('border-rose-400', 'bg-rose-50');
    input.classList.add('border-emerald-400', 'bg-emerald-50');

    const mistakes = state.wrongAttempts;
    const quality = mistakes <= 0 ? 3 : mistakes === 1 ? 2 : mistakes === 2 ? 1 : 0;
    const plan = computeFsrsState(info.card, mistakes);
    feedback.className = 'mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700';
    feedback.textContent = `${t.correct(mistakes)} · ${t.next(formatInterval(plan.scheduledDays))}`;

    setTimeout(() => {
      try {
        if (originalRateCard) originalRateCard(quality);
        applyFsrsState(info.card, plan, mistakes);
      } catch (err) {
        console.error('Typed study answer:', err);
        state.submitting = false;
      }
      updatePanelForCurrentCard(true);
    }, 260);
  }

  if (originalRenderCurrentCard) {
    renderCurrentCard = function(...args) {
      const result = originalRenderCurrentCard.apply(this, args);
      updatePanelForCurrentCard(true);
      return result;
    };
  }

  ensureAnswerPanel();
  updatePanelForCurrentCard(true);

  window.lfFsrs6Preview = (card, mistakes = 0) => computeFsrsState(card, mistakes);
  window.lfFsrs6Retrievability = card => currentMemoryPercent(card);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updatePanelForCurrentCard(true), { once: true });
  }
})();
