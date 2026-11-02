/* LinguaFlash · FSRS-6 Scheduler v1
   Backward-compatible scheduler layered over the existing app-core SRS UI.
   - Keeps SM-2 available as an immediate fallback.
   - Soft-migrates legacy interval/ease progress only when a card is reviewed under FSRS.
   - Stores D/S state using the progress fields already supported by app-core.
*/
(() => {
  'use strict';
  if (window.__LF_FSRS_SCHEDULER_V1__) return;
  window.__LF_FSRS_SCHEDULER_V1__ = true;

  const DAY_MS = 86400000;
  const TEN_MIN_MS = 10 * 60 * 1000;
  const REVLOG_KEY = 'linguaflash_fsrs_revlog_v1';
  const MAX_REVLOG = 10000;
  const MAX_INTERVAL = 36500;
  const FSRS_VERSION = '6';

  // FSRS-6 default parameters (21 weights).
  const W = [
    0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194,
    0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629,
    1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542
  ];

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));
  const cleanNum = (n, fallback = 0) => Number.isFinite(Number(n)) ? Number(n) : fallback;
  const nowMs = () => Date.now();

  try {
    if (Array.isArray(PROGRESS_FIELDS)) {
      ['leech','fsrsVersion'].forEach(k => { if (!PROGRESS_FIELDS.includes(k)) PROGRESS_FIELDS.push(k); });
    }
  } catch (_) {}

  function settings() {
    try { return getDailyGoalSettings(); }
    catch (_) { return { srsAlgorithm:'FSRS', desiredRetention:90, newLimit:20, reviewLimit:30, reviewMode:'due' }; }
  }
  function isFsrsEnabled() { return String(settings().srsAlgorithm || 'FSRS').toUpperCase() !== 'SM-2'; }
  function desiredRetention() { return clamp(cleanNum(settings().desiredRetention, 90) / 100, 0.80, 0.95); }

  function forgettingFactor() {
    const decay = W[20];
    return Math.pow(0.9, -1 / decay) - 1;
  }
  function retrievabilityFrom(S, elapsedDays) {
    const s = Math.max(0.001, cleanNum(S, 0.001));
    const t = Math.max(0, cleanNum(elapsedDays, 0));
    return Math.pow(1 + forgettingFactor() * t / s, -W[20]);
  }
  function intervalForStability(S, retention = desiredRetention()) {
    const s = Math.max(0.001, cleanNum(S, 0.001));
    const r = clamp(retention, 0.70, 0.99);
    const days = s / forgettingFactor() * (Math.pow(r, -1 / W[20]) - 1);
    return Math.max(1, Math.min(MAX_INTERVAL, Math.round(days)));
  }
  function initialStability(grade) { return Math.max(0.001, W[clamp(grade,1,4)-1]); }
  function initialDifficulty(grade) {
    return clamp(W[4] - Math.exp(W[5] * (clamp(grade,1,4) - 1)) + 1, 1, 10);
  }
  function nextDifficulty(D, grade) {
    const d = clamp(D, 1, 10);
    const delta = -W[6] * (clamp(grade,1,4) - 3);
    const damped = d + delta * (10 - d) / 9;
    const mean = W[7] * initialDifficulty(4) + (1 - W[7]) * damped;
    return clamp(mean, 1, 10);
  }
  function nextRecallStability(D, S, R, grade) {
    const d = clamp(D,1,10), s = Math.max(0.001,S), r = clamp(R,0.01,1);
    const hardPenalty = grade === 2 ? W[15] : 1;
    const easyBonus = grade === 4 ? W[16] : 1;
    const gain = Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) *
      (Math.exp((1 - r) * W[10]) - 1) * hardPenalty * easyBonus;
    return Math.max(0.001, s * (1 + gain));
  }
  function nextForgetStability(D, S, R) {
    const d = clamp(D,1,10), s = Math.max(0.001,S), r = clamp(R,0.01,1);
    const candidate = W[11] * Math.pow(d, -W[12]) *
      (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]);
    return Math.max(0.001, Math.min(s, candidate));
  }
  function nextSameDayStability(S, grade) {
    const s = Math.max(0.001, S);
    let multiplier = Math.exp(W[17] * (grade - 3 + W[18])) * Math.pow(s, -W[19]);
    if (grade >= 2) multiplier = Math.max(1, multiplier);
    return Math.max(0.001, s * multiplier);
  }

  function inferLastReview(card, now = nowMs()) {
    const explicit = cleanNum(card?.lastReviewedAt || card?.lastReview, 0);
    if (explicit > 0 && explicit <= now) return explicit;
    const due = cleanNum(card?.nextReview, 0);
    const ivl = Math.max(0, cleanNum(card?.interval, 0));
    if (due > 0 && ivl > 0) return Math.min(now, due - ivl * DAY_MS);
    return now;
  }

  function migrateLegacyState(card, now = nowMs()) {
    const out = { ...card };
    if (cleanNum(out.stability, 0) > 0 && cleanNum(out.difficulty, 0) > 0) return out;
    const reps = Math.max(0, cleanNum(out.repetitions, 0));
    if (reps <= 0) return out;
    const S = Math.max(0.001, cleanNum(out.interval, 1));
    const ease = Math.max(1.3, cleanNum(out.easeFactor, 2.5));
    const denom = Math.exp(W[8]) * Math.pow(S, -W[9]) * (Math.exp(0.1 * W[10]) - 1);
    const D = denom > 0 ? clamp(11 - (ease - 1) / denom, 1, 10) : 5;
    out.stability = S;
    out.difficulty = D;
    out.lastReviewedAt = inferLastReview(out, now);
    out.lastReview = out.lastReviewedAt;
    out.fsrsVersion = FSRS_VERSION;
    if (!out.state) out.state = 'review';
    return out;
  }

  function getElapsedDays(card, now = nowMs()) {
    const last = inferLastReview(card, now);
    return Math.max(0, (now - last) / DAY_MS);
  }
  function cardRetrievability(card, now = nowMs()) {
    const migrated = migrateLegacyState(card, now);
    if (!(cleanNum(migrated.stability, 0) > 0)) return 1;
    return retrievabilityFrom(migrated.stability, getElapsedDays(migrated, now));
  }

  function simulate(card, quality, now = nowMs()) {
    const q = clamp(Math.round(quality), 0, 3);
    const grade = q + 1;
    const wasNew = Math.max(0, cleanNum(card?.repetitions, 0)) === 0 && !(cleanNum(card?.stability,0) > 0);
    let next = migrateLegacyState(card, now);
    const hadState = cleanNum(next.stability, 0) > 0 && cleanNum(next.difficulty, 0) > 0;
    const elapsedDays = hadState ? getElapsedDays(next, now) : 0;
    const R = hadState ? retrievabilityFrom(next.stability, elapsedDays) : 1;

    let D, S;
    if (!hadState) {
      D = initialDifficulty(grade);
      S = initialStability(grade);
    } else {
      D = nextDifficulty(next.difficulty, grade);
      if (elapsedDays < 1) S = nextSameDayStability(next.stability, grade);
      else if (grade === 1) S = nextForgetStability(D, next.stability, R);
      else S = nextRecallStability(D, next.stability, R, grade);
    }

    const lapses = Math.max(0, cleanNum(next.lapses, 0)) + (grade === 1 && !wasNew && card.state !== 'learning' ? 1 : 0);
    const reviewCount = Math.max(0, cleanNum(next.reviewCount, 0)) + 1;
    const existingRep = Math.max(0, cleanNum(next.repetitions, 0));
    let interval = 0;
    let nextReview;
    let state;
    let repetitions = existingRep;

    const delay = studyDelay(card, q, intervalForStability(S, desiredRetention()));
    const short = delay < DAY_MS;
    interval = short ? 0 : delay / DAY_MS;
    nextReview = now + delay;
    state = short ? (wasNew || card.state === 'learning' ? 'learning' : 'relearning') : 'review';
    repetitions = Math.max(1, existingRep + 1);

    next = {
      ...next,
      difficulty: D,
      stability: S,
      interval,
      scheduledDays: interval,
      elapsedDays,
      nextReview,
      repetitions,
      state,
      lapses,
      reviewCount,
      lastReview: now,
      lastReviewedAt: now,
      lastAnswerQuality: q,
      needsReview: grade === 1,
      leech: lapses >= 8,
      fsrsVersion: FSRS_VERSION
    };

    return { card: next, grade, quality:q, wasNew, R, interval, nextReview, D, S, elapsedDays };
  }

  function copyProgress(target, source) {
    ['difficulty','stability','interval','scheduledDays','elapsedDays','nextReview','repetitions','state','lapses','reviewCount','lastReview','lastReviewedAt','lastAnswerQuality','needsReview','leech','fsrsVersion']
      .forEach(k => { target[k] = source[k]; });
  }

  function appendRevlog(card, result, before) {
    try {
      const log = JSON.parse(localStorage.getItem(REVLOG_KEY) || '[]');
      const rows = Array.isArray(log) ? log : [];
      rows.push({
        t: result.card.lastReviewedAt,
        id: String(card.id || ''),
        q: result.quality,
        g: result.grade,
        d: Number(result.D.toFixed(4)),
        s: Number(result.S.toFixed(4)),
        r: Number(result.R.toFixed(4)),
        i: result.interval,
        e: Number(result.elapsedDays.toFixed(4)),
        prevI: cleanNum(before?.interval,0),
        prevS: cleanNum(before?.stability,0),
        lang: String(card.lang || ''),
        topic: String(card.topic || '')
      });
      if (rows.length > MAX_REVLOG) rows.splice(0, rows.length - MAX_REVLOG);
      localStorage.setItem(REVLOG_KEY, JSON.stringify(rows));
    } catch (_) {}
  }

  function intervalText(result) { return studyDelayText(result.nextReview - result.card.lastReviewedAt); }
  function previewLabels(card) {
    return [0,1,2,3].map(q => isFsrsEnabled() ? intervalText(simulate(card,q)) : studyDelayText(studyDelay(card,q,legacyReviewDays(card,q))));
  }

  function ensureRibbon() {
    const hard = document.getElementById('lblIntervalHard');
    const grid = hard?.closest?.('.grid');
    if (!grid || document.getElementById('lfFsrsRibbon')) return document.getElementById('lfFsrsRibbon');
    const ribbon = document.createElement('div');
    ribbon.id = 'lfFsrsRibbon';
    ribbon.style.cssText = 'width:min(100%,760px);margin:8px auto 0;padding:9px 12px;border:1px solid #dbeafe;border-radius:12px;background:#eff6ff;color:#334155;font-size:12px;line-height:1.45;text-align:center';
    grid.insertAdjacentElement('beforebegin', ribbon);
    return ribbon;
  }

  function refreshCardPreview() {
    const card = filteredDeck[currentIndex];
    if (!card) return;
    const now = nowMs();
    const labels = previewLabels(card);
    const buttons = document.querySelectorAll('#tab-study button[onclick^="rateCard("]');
    buttons.forEach((button,q) => {
      const name = button.firstElementChild, time = button.lastElementChild;
      if (!name || !time || name === time || q > 3) return;
      button.dataset.lfGrade = q;
      name.textContent = ['Lại','Khó','Được','Dễ'][q];
      time.textContent = labels[q];
    });
    if (!isFsrsEnabled()) {
      const ribbon = document.getElementById('lfFsrsRibbon');
      if (ribbon) ribbon.style.display = 'none';
      return;
    }
    const ribbon = ensureRibbon();
    if (!ribbon) return;
    ribbon.style.display = '';
    const migrated = migrateLegacyState(card, now);
    if (cleanNum(migrated.stability,0) > 0) {
      const R = cardRetrievability(card, now);
      ribbon.innerHTML = `<b>FSRS-6</b> · D ${cleanNum(migrated.difficulty,5).toFixed(1)} · S ${cleanNum(migrated.stability,0).toFixed(1)}d · R ${Math.round(R*100)}% · mục tiêu ${Math.round(desiredRetention()*100)}%<br><span style="color:#64748b">Hard = vẫn nhớ nhưng khó · Quên thật sự → Again</span>`;
    } else {
      ribbon.innerHTML = `<b>FSRS-6</b> · Thẻ mới · mục tiêu ${Math.round(desiredRetention()*100)}%<br><span style="color:#64748b">Hard = vẫn nhớ nhưng khó · Quên thật sự → Again</span>`;
    }
  }

  function installOverrides() {
    const legacyRateCard = typeof rateCard === 'function' ? rateCard : null;
    const legacyRenderCurrentCard = typeof renderCurrentCard === 'function' ? renderCurrentCard : null;
    const legacyApplyStudyFilters = typeof applyStudyFilters === 'function' ? applyStudyFilters : null;
    const legacyUpdateCardFromQuiz = typeof updateCardFromQuiz === 'function' ? updateCardFromQuiz : null;
    const legacyRenderStats = typeof renderStats === 'function' ? renderStats : null;

    if (legacyRenderCurrentCard && !legacyRenderCurrentCard.__lfFsrsWrapped) {
      const wrappedRender = function() {
        const out = legacyRenderCurrentCard.apply(this, arguments);
        try { refreshCardPreview(); } catch (e) { console.warn('FSRS preview:', e); }
        return out;
      };
      wrappedRender.__lfFsrsWrapped = true;
      renderCurrentCard = wrappedRender;
    }

    function fsrsApplyStudyFilters() {
      const lang = document.getElementById('studyLangFilter')?.value || 'Tiếng Trung';
      const cat = document.getElementById('studyCategoryFilter')?.value || 'ALL';
      const sub = document.getElementById('studyTopicFilter')?.value || 'ALL';
      const dueOnly = !!document.getElementById('studyDueOnly')?.checked;
      const now = nowMs();
      const s = settings();

      const pool = allCards.filter(c => {
        if (!String(getCardTextInLanguage(c, lang) || '').trim()) return false;
        const parsed = parseCategoryAndTopic(c.topic);
        if (cat !== 'ALL' && getCardCategory(c) !== cat) return false;
        if (sub !== 'ALL') {
          const selectedSub = parseCategoryAndTopic(sub).sub;
          if (parsed.sub !== selectedSub) return false;
        }
        return true;
      });

      const newCards = pool.filter(c => Math.max(0, cleanNum(c.repetitions,0)) === 0 && !(cleanNum(c.nextReview,0) > now));
      let reviewCards;
      if (s.reviewMode === 'missed') {
        reviewCards = pool.filter(c => c.lastAnswerQuality === 0 || c.leech === true);
      } else if (s.reviewMode === 'all') {
        reviewCards = pool.filter(c => Math.max(0,cleanNum(c.repetitions,0)) > 0);
      } else {
        reviewCards = pool.filter(c => Math.max(0,cleanNum(c.repetitions,0)) > 0 && cleanNum(c.nextReview,0) <= now);
      }

      reviewCards.sort((a,b) => {
        const ra = cardRetrievability(a,now), rb = cardRetrievability(b,now);
        return ra - rb || cleanNum(a.nextReview,0) - cleanNum(b.nextReview,0);
      });

      const p = getDailyProgress();
      const remainingNew = Math.max(0, cleanNum(s.newLimit,20) - new Set(p.newIds || []).size);
      const remainingReview = Math.max(0, cleanNum(s.reviewLimit,30) - new Set(p.reviewIds || []).size);
      const selectedNew = newCards.filter(c => !isStudyStep(c)).slice(0, remainingNew);
      const dueSteps = pool.filter(c => isStudyStep(c) && c.nextReview <= now);
      const selectedReview = [...dueSteps, ...reviewCards.filter(c => !isStudyStep(c)).slice(0, remainingReview)];
      filteredDeck = (dueOnly ? selectedReview : [...selectedReview, ...selectedNew]).slice(0,20);
      activeStudyBatchIds = new Set(filteredDeck.map(c => c.id));
      activeStudyCompletedIds = new Set();
      currentIndex = 0;
      renderCurrentCard();
      updateDailyGoalSummary(s);
    }

    if (legacyApplyStudyFilters && !legacyApplyStudyFilters.__lfFsrsWrapped) {
      const wrappedApply = function() {
        if (!isFsrsEnabled()) return legacyApplyStudyFilters.apply(this, arguments);
        return fsrsApplyStudyFilters();
      };
      wrappedApply.__lfFsrsWrapped = true;
      applyStudyFilters = wrappedApply;
    }

    if (legacyRateCard && !legacyRateCard.__lfFsrsWrapped) {
      const wrappedRate = function(quality) {
        if (!isFsrsEnabled()) return legacyRateCard.apply(this, arguments);
        if (!filteredDeck?.length) return;
        const card = filteredDeck[currentIndex];
        if (!card) return;
        recordFsrsStudyCard(card, quality, false);
      };
      wrappedRate.__lfFsrsWrapped = true;
      rateCard = wrappedRate;
    }

    if (legacyUpdateCardFromQuiz && !legacyUpdateCardFromQuiz.__lfFsrsWrapped) {
      const wrappedQuiz = function(card, correct) {
        if (!isFsrsEnabled()) return legacyUpdateCardFromQuiz.apply(this, arguments);
        if (!card) return;
        const before = { ...card };
        const result = simulate(card, correct ? 2 : 0, nowMs());
        copyProgress(card, result.card);
        appendRevlog(card, result, before);
        if (card.quizOnly === true && card.quizSource === 'giahan_dialogue') {
          try {
            const map = getDialogueQuizProgressMap();
            map[card.id] = {};
            ['interval','repetitions','easeFactor','nextReview','difficulty','stability','state','lapses','lastReview','reviewCount','scheduledDays','elapsedDays','lastReviewedAt','lastAnswerQuality','leech','fsrsVersion']
              .forEach(k => { if (card[k] !== undefined) map[card.id][k] = card[k]; });
            map[card.id].needsReview = card.needsReview === true;
          } catch (_) {}
        }
        userStats.totalReviews = Math.max(0,cleanNum(userStats.totalReviews,0)) + 1;
        saveData();
      };
      wrappedQuiz.__lfFsrsWrapped = true;
      updateCardFromQuiz = wrappedQuiz;
    }

    if (legacyRenderStats && !legacyRenderStats.__lfFsrsWrapped) {
      const wrappedStats = function() {
        const out=legacyRenderStats.apply(this,arguments);
        try{renderFsrsStats();}catch(e){console.warn('FSRS stats:',e);}
        return out;
      };
      wrappedStats.__lfFsrsWrapped = true;
      renderStats = wrappedStats;
    }

    try { renderCurrentCard(); } catch (_) {}
  }

  function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function ensureStatsPanel() {
    const tab = document.getElementById('tab-stats');
    if (!tab) return null;
    let panel = document.getElementById('lfFsrsMemoryPanel');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'lfFsrsMemoryPanel';
    panel.className = 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5';
    const firstGrid = tab.querySelector('.grid');
    if (firstGrid) firstGrid.insertAdjacentElement('afterend', panel); else tab.prepend(panel);
    return panel;
  }

  function curveSvg(S, retention) {
    const s = Math.max(0.1,S || 1);
    const due = intervalForStability(s, retention);
    const maxDays = Math.max(7, Math.ceil(Math.max(s*2.2, due*1.6)));
    const Wd=620,H=180,padL=42,padR=18,padT=15,padB=30;
    const x = d => padL + (Wd-padL-padR) * d/maxDays;
    const y = r => padT + (H-padT-padB) * (1-r)/0.55;
    const pts=[];
    for(let i=0;i<=60;i++){const d=maxDays*i/60;pts.push(`${x(d).toFixed(1)},${y(clamp(retrievabilityFrom(s,d),0.45,1)).toFixed(1)}`);}
    const ry=y(retention), dx=x(due);
    return `<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Đường cong khả năng nhớ FSRS" style="width:100%;height:auto;display:block">
      <line x1="${padL}" y1="${y(1)}" x2="${padL}" y2="${y(.45)}" stroke="#cbd5e1"/>
      <line x1="${padL}" y1="${y(.45)}" x2="${Wd-padR}" y2="${y(.45)}" stroke="#cbd5e1"/>
      <line x1="${padL}" y1="${ry}" x2="${Wd-padR}" y2="${ry}" stroke="#f59e0b" stroke-dasharray="5 4"/>
      <line x1="${dx}" y1="${padT}" x2="${dx}" y2="${H-padB}" stroke="#6366f1" stroke-dasharray="4 4"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
      <text x="6" y="${y(1)+4}" font-size="11" fill="#64748b">100%</text>
      <text x="6" y="${ry+4}" font-size="11" fill="#b45309">${Math.round(retention*100)}%</text>
      <text x="${Math.min(Wd-100,dx+5)}" y="${padT+12}" font-size="11" fill="#4f46e5">ôn ~${due}d</text>
      <text x="${Wd-padR-48}" y="${H-8}" font-size="11" fill="#64748b">${maxDays} ngày</text>
    </svg>`;
  }

  function renderFsrsStats() {
    const panel = ensureStatsPanel();
    if (!panel) return;
    if (!isFsrsEnabled()) {
      panel.innerHTML = '<div class="font-extrabold text-slate-900">🧠 Trí nhớ / SRS</div><div class="mt-2 text-sm text-slate-500">Đang dùng SM-2. Chuyển sang FSRS trong Mục tiêu hằng ngày để xem D / S / R.</div>';
      return;
    }
    const now=nowMs(), retention=desiredRetention();
    const reviewed = allCards.filter(c => Math.max(0,cleanNum(c.repetitions,0))>0).map(c => {
      const m=migrateLegacyState(c,now), R=cardRetrievability(m,now);
      return {c,m,R};
    });
    if (!reviewed.length) {
      panel.innerHTML = '<div class="font-extrabold text-slate-900">🧠 Trí nhớ / FSRS-6</div><div class="mt-2 text-sm text-slate-500">Chưa có thẻ đã ôn để tính D / S / R.</div>';
      return;
    }
    const avgD=reviewed.reduce((a,x)=>a+cleanNum(x.m.difficulty,5),0)/reviewed.length;
    const avgS=reviewed.reduce((a,x)=>a+cleanNum(x.m.stability,0),0)/reviewed.length;
    const avgR=reviewed.reduce((a,x)=>a+x.R,0)/reviewed.length;
    const atRisk=reviewed.filter(x=>x.R<retention).length;
    const sorted=[...reviewed].sort((a,b)=>a.R-b.R).slice(0,8);
    const focus=sorted[0] || reviewed[0];
    panel.innerHTML = `<div class="flex flex-wrap items-start justify-between gap-3"><div><div class="font-extrabold text-slate-900">🧠 Trí nhớ / FSRS-6</div><div class="text-xs text-slate-500 mt-1">D = độ khó · S = độ bền (ngày) · R = khả năng nhớ hiện tại · mục tiêu ${Math.round(retention*100)}%</div></div><span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">Desired Retention ${Math.round(retention*100)}%</span></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs text-slate-500">Thẻ đã ôn</div><div class="text-xl font-extrabold">${reviewed.length}</div></div>
      <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs text-slate-500">D trung bình</div><div class="text-xl font-extrabold">${avgD.toFixed(1)}</div></div>
      <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs text-slate-500">S trung bình</div><div class="text-xl font-extrabold">${avgS.toFixed(1)}d</div></div>
      <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs text-slate-500">R trung bình / dưới ngưỡng</div><div class="text-xl font-extrabold">${Math.round(avgR*100)}% <span class="text-sm text-rose-600">· ${atRisk}</span></div></div>
    </div>
    <div class="mt-4 grid lg:grid-cols-2 gap-4"><div class="rounded-xl border border-slate-100 p-3"><div class="text-sm font-bold text-slate-700 mb-2">Đường cong nhớ mẫu · ${esc(focus.c.word || focus.c.meaning || '')}</div>${curveSvg(cleanNum(focus.m.stability,1),retention)}</div>
    <div class="rounded-xl border border-slate-100 overflow-hidden"><div class="px-3 py-2 bg-slate-50 text-sm font-bold text-slate-700">Thẻ có R thấp nhất</div>${sorted.map(x=>`<div class="px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-3 text-sm"><div class="min-w-0"><b>${esc(x.c.word||x.c.meaning||'—')}</b><div class="text-xs text-slate-500 truncate">D ${cleanNum(x.m.difficulty,5).toFixed(1)} · S ${cleanNum(x.m.stability,0).toFixed(1)}d</div></div><span class="font-extrabold ${x.R<retention?'text-rose-600':'text-emerald-600'}">${Math.round(x.R*100)}%</span></div>`).join('')}</div></div>`;
  }

  function refreshAll() {
    try { if (typeof renderCurrentCard === 'function') renderCurrentCard(); } catch (_) {}
    try { if (!document.getElementById('tab-stats')?.classList.contains('hidden')) renderFsrsStats(); } catch (_) {}
  }

  document.addEventListener('change', e => {
    if (e.target?.name === 'srsAlgorithm' || e.target?.id === 'desiredRetentionSlider') setTimeout(refreshAll,0);
  }, true);

  // Delay installation until the parser has finished loading any generic study helpers
  // that a service worker may inject after app.js. This makes FSRS the final scheduler layer.
  setTimeout(() => {
    try { installOverrides(); } catch (e) { console.error('FSRS install:', e); }
  }, 0);

  function recordFsrsStudyCard(card, quality, fromList) {
    const before = { ...card };
    const isNewForToday = Math.max(0, cleanNum(card.repetitions,0)) === 0;
    const result = simulate(card, quality, nowMs());
    copyProgress(card, result.card);
    appendRevlog(card, result, before);
    userStats.totalReviews = Math.max(0,cleanNum(userStats.totalReviews,0)) + 1;
    saveData();

    if (quality !== 0 && !getDailyProgress().newIds?.includes(card.id) && !getDailyProgress().reviewIds?.includes(card.id) && !activeStudyCompletedIds.has(card.id)) {
      activeStudyCompletedIds.add(card.id);
      const p = getDailyProgress();
      const bucket = isNewForToday ? 'newIds' : 'reviewIds';
      const limit = isNewForToday ? settings().newLimit : settings().reviewLimit;
      const ids = new Set(p[bucket] || []);
      if (ids.size < limit) ids.add(card.id);
      p[bucket] = [...ids];
      saveDailyProgress(p);
      updateDailyGoalSummary();
    }
    showToast(`FSRS: ôn lại sau ${intervalText(result)} · R mục tiêu ${Math.round(desiredRetention()*100)}%`, result.quality===3?'🌟':'✅');
    if (fromList) return;
    if (document.getElementById('studyDueOnly')?.checked) applyStudyFilters();
    else nextCard();
  }

  window.LFFSRS = {
    previewLabels,
    rateListCard(card, quality) {
      if (isFsrsEnabled()) recordFsrsStudyCard(card, quality, true);
      else rateLegacyStudyCard(card, quality, true);
    },
    version: FSRS_VERSION,
    weights: W.slice(),
    retrievability: cardRetrievability,
    intervalForStability,
    migrateLegacy: migrateLegacyState,
    simulate,
    renderStats: renderFsrsStats
  };
})();
