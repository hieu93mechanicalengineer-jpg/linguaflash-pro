/* LinguaFlash Smart Daily Session v2 + Focus Mode
   Builds one deliberate daily session from due reviews + weak cards + a few new cards.
   Uses existing FSRS/Daily Goal/progress data only; no new database tables.
*/
(() => {
  'use strict';

  const MAX_SESSION = 20;
  const MAX_NEW_PER_SESSION = 5;
  const FOCUS_CLASS = 'lf-focus-mode';
  let activeSummary = null;

  function ui() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      title: 'Study today',
      desc: 'LinguaFlash chooses due reviews, weak cards and a few new cards for you.',
      start: mins => `▶ Study today · ${mins} min`,
      done: 'Today’s goal is complete',
      extra: 'Practice weak words',
      due: 'due', weak: 'weak', fresh: 'new',
      focus: 'Focus', exit: 'Exit focus', empty: 'No cards need attention right now.'
    };
    if (lang === 'zh') return {
      title: '今天学习',
      desc: '自动组合到期复习、薄弱卡和少量新卡。',
      start: mins => `▶ 今天学习 · ${mins} 分钟`,
      done: '今天的目标已完成',
      extra: '练习薄弱词汇',
      due: '到期', weak: '薄弱', fresh: '新卡',
      focus: '专注模式', exit: '退出专注', empty: '目前没有需要优先学习的卡片。'
    };
    return {
      title: 'Học hôm nay',
      desc: 'LinguaFlash tự chọn thẻ đến hạn, từ yếu và một ít từ mới cho bạn.',
      start: mins => `▶ Học hôm nay · ${mins} phút`,
      done: 'Đã hoàn thành mục tiêu hôm nay',
      extra: 'Luyện thêm từ yếu',
      due: 'đến hạn', weak: 'từ yếu', fresh: 'mới',
      focus: 'Tập trung', exit: 'Thoát Focus', empty: 'Hiện chưa có thẻ nào cần ưu tiên.'
    };
  }

  function safeCards() {
    try { return Array.isArray(allCards) ? allCards : []; } catch (_) { return []; }
  }

  function settings() {
    try { if (typeof getDailyGoalSettings === 'function') return getDailyGoalSettings(); } catch (_) {}
    return { newLimit: 20, reviewLimit: 30 };
  }

  function dailyProgress() {
    try { if (typeof getDailyProgress === 'function') return getDailyProgress(); } catch (_) {}
    return { newIds: [], reviewIds: [] };
  }

  function targetLanguage() {
    return document.getElementById('studyLangFilter')?.value || 'Tiếng Trung';
  }

  function metrics(card, now = Date.now()) {
    const reviews = Math.max(Number(card?.reviewCount || 0), Number(card?.repetitions || 0));
    const last = Number(card?.lastReview || card?.lastReviewedAt || 0);
    const isNew = reviews <= 0 && last <= 0;
    const next = Number(card?.nextReview || 0);
    const quality = Number(card?.lastAnswerQuality);
    const due = !isNew && (!!card?.needsReview || (next > 0 && next <= now) || quality === 0 || quality === 1);
    let weakScore = 0;
    try { weakScore = Number(window.lfWeakMetrics?.(card, now)?.score || 0); } catch (_) {}
    const overdueDays = due && next > 0 ? Math.max(0, (now - next) / 86400000) : 0;
    return { isNew, due, weakScore, overdueDays, next };
  }

  function cardFitsLanguage(card, language) {
    if (!card || card.lang !== language) return false;
    const word = String(card.word || '').trim();
    if (!word) return false;
    if (/chữ ghi tay|không đủ ngữ cảnh|không xác định|unclear|unknown/i.test(word)) return false;
    return true;
  }

  function alternateHardCards(items) {
    const hard = items.filter(x => x.m.weakScore >= 6);
    const normal = items.filter(x => x.m.weakScore < 6);
    const out = [];
    let h = 0, n = 0;
    while (h < hard.length || n < normal.length) {
      if (h < hard.length) out.push(hard[h++]);
      let count = 0;
      while (n < normal.length && count < 2) { out.push(normal[n++]); count++; }
      if (n >= normal.length && h < hard.length) {
        // No normal cards left: remaining hard cards are unavoidable.
        while (h < hard.length) out.push(hard[h++]);
      }
    }
    return out;
  }

  function buildPlan(language = targetLanguage()) {
    const now = Date.now();
    const cfg = settings();
    const progress = dailyProgress();
    const studied = new Set([...(progress.newIds || []), ...(progress.reviewIds || [])]);
    const reviewRemaining = Math.max(0, Number(cfg.reviewLimit || 30) - (progress.reviewIds || []).length);
    const newRemaining = Math.max(0, Number(cfg.newLimit || 20) - (progress.newIds || []).length);

    const due = [], weak = [], fresh = [];
    safeCards().forEach((card, index) => {
      if (!cardFitsLanguage(card, language) || studied.has(card.id)) return;
      const m = metrics(card, now);
      const item = { card, m, index };
      if (m.isNew) fresh.push(item);
      else if (m.due) due.push(item);
      else if (m.weakScore >= 3) weak.push(item);
    });

    due.sort((a,b) => b.m.weakScore - a.m.weakScore || b.m.overdueDays - a.m.overdueDays || a.index - b.index);
    weak.sort((a,b) => b.m.weakScore - a.m.weakScore || (a.m.next || Number.MAX_SAFE_INTEGER) - (b.m.next || Number.MAX_SAFE_INTEGER));

    // Keep new-card order stable so lesson progression does not feel random.
    const maxReview = Math.min(reviewRemaining, MAX_SESSION);
    const chosenReview = [];
    const dueTake = Math.min(due.length, maxReview);
    chosenReview.push(...due.slice(0, dueTake));
    let reviewSlots = maxReview - chosenReview.length;
    if (reviewSlots > 0) chosenReview.push(...weak.slice(0, reviewSlots));

    const newSlots = Math.min(newRemaining, MAX_NEW_PER_SESSION, Math.max(0, MAX_SESSION - chosenReview.length));
    const chosenNew = fresh.slice(0, newSlots);

    // If reviews are scarce, use more allowed new cards but never exceed the daily limit/session cap.
    if (chosenReview.length + chosenNew.length < MAX_SESSION && chosenNew.length < newRemaining) {
      const extra = Math.min(newRemaining - chosenNew.length, MAX_SESSION - chosenReview.length - chosenNew.length);
      chosenNew.push(...fresh.slice(chosenNew.length, chosenNew.length + extra));
    }

    const reviewOrdered = alternateHardCards(chosenReview);
    const deck = [];
    let r = 0, n = 0;
    while (r < reviewOrdered.length || n < chosenNew.length) {
      let took = 0;
      while (r < reviewOrdered.length && took < 2) { deck.push(reviewOrdered[r++].card); took++; }
      if (n < chosenNew.length) deck.push(chosenNew[n++].card);
      if (r >= reviewOrdered.length) while (n < chosenNew.length) deck.push(chosenNew[n++].card);
    }

    const chosenIds = new Set(deck.map(c => c.id));
    const summary = {
      language,
      deck,
      due: chosenReview.filter(x => x.m.due && chosenIds.has(x.card.id)).length,
      weak: chosenReview.filter(x => x.m.weakScore >= 3 && chosenIds.has(x.card.id)).length,
      fresh: chosenNew.filter(x => chosenIds.has(x.card.id)).length,
      reviewRemaining,
      newRemaining
    };
    summary.minutes = Math.max(3, Math.round(deck.length * 0.75));
    return summary;
  }

  function ensureHomeCard() {
    let el = document.getElementById('lfSmartDailyHomeCard');
    if (el) return el;
    const home = document.getElementById('tab-home');
    const hero = home?.querySelector('.app-hero');
    if (!home || !hero) return null;
    el = document.createElement('div');
    el.id = 'lfSmartDailyHomeCard';
    el.className = 'app-card p-4 sm:p-5 border-2 border-indigo-100';
    hero.insertAdjacentElement('afterend', el);
    return el;
  }

  function renderHomeCard() {
    const el = ensureHomeCard();
    if (!el) return;
    const t = ui();
    const plan = buildPlan();
    if (!plan.deck.length) {
      el.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div class="text-lg font-extrabold text-slate-900">✅ ${t.done}</div><div class="text-sm text-slate-600 mt-1">${t.empty}</div></div>
          <button type="button" class="app-primary-btn shrink-0" id="lfSmartDailyExtraBtn">🔥 ${t.extra}</button>
        </div>`;
      el.querySelector('#lfSmartDailyExtraBtn')?.addEventListener('click', () => {
        if (typeof window.lfOpenWeakDeck === 'function') window.lfOpenWeakDeck();
      });
      return;
    }
    el.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="text-xl font-extrabold text-slate-900">🧠 ${t.title}</div>
          <div class="text-sm text-slate-600 mt-1">${t.desc}</div>
          <div class="mt-2 flex flex-wrap gap-2 text-xs font-bold">
            <span class="rounded-full bg-rose-50 text-rose-700 px-2.5 py-1">${plan.due} ${t.due}</span>
            <span class="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1">${plan.weak} ${t.weak}</span>
            <span class="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">${plan.fresh} ${t.fresh}</span>
          </div>
        </div>
        <button type="button" class="app-primary-btn shrink-0 text-base" id="lfSmartDailyStartBtn">${t.start(plan.minutes)}</button>
      </div>`;
    el.querySelector('#lfSmartDailyStartBtn')?.addEventListener('click', () => openSmartDaily());
  }

  function injectFocusStyle() {
    if (document.getElementById('lfFocusModeStyle')) return;
    const style = document.createElement('style');
    style.id = 'lfFocusModeStyle';
    style.textContent = `
      body.${FOCUS_CLASS} header{display:none!important}
      body.${FOCUS_CLASS} nav.fixed.bottom-0{display:none!important}
      body.${FOCUS_CLASS} #tab-study > .bg-white:first-child{display:none!important}
      body.${FOCUS_CLASS} #lfWeakDeckBanner,body.${FOCUS_CLASS} #lfSmartQueueBanner{display:none!important}
      body.${FOCUS_CLASS} main.max-w-5xl{padding-top:64px!important}
      body.${FOCUS_CLASS} #tab-study{max-width:820px;margin:0 auto}
      body.${FOCUS_CLASS}{padding-bottom:max(24px,env(safe-area-inset-bottom))!important}
      #lfFocusBar{position:fixed;z-index:9998;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(94vw,760px);background:#0f172a;color:white;border-radius:16px;padding:9px 12px;box-shadow:0 10px 28px rgba(15,23,42,.28);display:flex;align-items:center;justify-content:space-between;gap:10px}
      #lfFocusBar.hidden{display:none!important}
      #lfFocusBar button{border:1px solid #475569;border-radius:10px;padding:7px 10px;font-weight:800;background:#1e293b;color:white;white-space:nowrap}
      @media(max-width:640px){body.${FOCUS_CLASS} main.max-w-5xl{padding-top:58px!important}#lfFocusBar{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function ensureFocusBar() {
    let bar = document.getElementById('lfFocusBar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'lfFocusBar';
    bar.className = 'hidden';
    document.body.appendChild(bar);
    return bar;
  }

  function focusProgressText() {
    const t = ui();
    let index = 0, total = 0;
    try { index = Number(currentIndex || 0) + 1; total = Array.isArray(filteredDeck) ? filteredDeck.length : 0; } catch (_) {}
    const detail = activeSummary ? ` · ${activeSummary.due} ${t.due} · ${activeSummary.fresh} ${t.fresh}` : '';
    return `🎯 ${t.focus} · ${Math.min(index, total || index)}/${total || 0}${detail}`;
  }

  function updateFocusBar() {
    const bar = ensureFocusBar();
    if (!document.body.classList.contains(FOCUS_CLASS)) { bar.classList.add('hidden'); return; }
    const t = ui();
    bar.classList.remove('hidden');
    bar.innerHTML = `<div class="font-extrabold min-w-0 truncate">${focusProgressText()}</div><button type="button" id="lfExitFocusBtn">× ${t.exit}</button>`;
    bar.querySelector('#lfExitFocusBtn')?.addEventListener('click', exitFocus);
  }

  function enterFocus() {
    injectFocusStyle();
    document.body.classList.add(FOCUS_CLASS);
    updateFocusBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exitFocus() {
    document.body.classList.remove(FOCUS_CLASS);
    updateFocusBar();
  }

  function applyDeck(plan) {
    try {
      filteredDeck = plan.deck.slice();
      activeStudyBatchIds = new Set(filteredDeck.map(card => card.id));
      activeStudyCompletedIds = new Set();
      currentIndex = 0;
      if (typeof renderCurrentCard === 'function') renderCurrentCard();
      return true;
    } catch (err) {
      console.warn('Smart Daily v2:', err);
      return false;
    }
  }

  function openSmartDaily() {
    const plan = buildPlan();
    if (!plan.deck.length) {
      renderHomeCard();
      if (typeof window.lfOpenWeakDeck === 'function') window.lfOpenWeakDeck();
      return;
    }
    activeSummary = plan;
    try { if (typeof switchTab === 'function') switchTab('study'); } catch (_) {}
    const lang = document.getElementById('studyLangFilter');
    if (lang) lang.value = plan.language;
    const dueOnly = document.getElementById('studyDueOnly');
    if (dueOnly) dueOnly.checked = false;
    if (!applyDeck(plan)) return;
    enterFocus();
    try { if (typeof window.lfSaveStudySession === 'function') window.lfSaveStudySession(); } catch (_) {}
    try { if (typeof window.lfSaveStudyFilterPrefs === 'function') window.lfSaveStudyFilterPrefs(); } catch (_) {}
  }

  function patchRuntime() {
    const oldRender = window.renderCurrentCard;
    if (typeof oldRender === 'function' && !oldRender.__lfSmartDailyV2) {
      const wrapped = function(...args) {
        const result = oldRender.apply(this, args);
        setTimeout(updateFocusBar, 0);
        setTimeout(renderHomeCard, 0);
        return result;
      };
      wrapped.__lfSmartDailyV2 = true;
      window.renderCurrentCard = wrapped;
    }

    const oldSwitch = window.switchTab;
    if (typeof oldSwitch === 'function' && !oldSwitch.__lfSmartDailyV2) {
      const wrapped = function(...args) {
        const result = oldSwitch.apply(this, args);
        if (args?.[0] !== 'study' && document.body.classList.contains(FOCUS_CLASS)) exitFocus();
        if (args?.[0] === 'home') setTimeout(renderHomeCard, 0);
        return result;
      };
      wrapped.__lfSmartDailyV2 = true;
      window.switchTab = wrapped;
    }
  }

  function init() {
    injectFocusStyle();
    ensureFocusBar();
    patchRuntime();
    renderHomeCard();
    ['studyLangFilter','studyCategoryFilter','studyTopicFilter','studyDueOnly'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => setTimeout(renderHomeCard, 0));
    });
    window.addEventListener('storage', () => setTimeout(renderHomeCard, 50));
  }

  window.lfBuildSmartDailyV2 = buildPlan;
  window.lfOpenSmartDailyV2 = openSmartDaily;
  window.lfEnterFocusMode = enterFocus;
  window.lfExitFocusMode = exitFocus;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
