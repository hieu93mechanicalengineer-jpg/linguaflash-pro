/* LinguaFlash Smart Daily Queue v1
   Reorders only the cards already selected by the existing daily-goal/filter logic.
   It does not add extra reviews or new cards, so the learner's limits and FSRS due dates stay intact. */
(() => {
  'use strict';

  const WEAK_CATEGORY = '__LF_WEAK__';

  function cardMetrics(card, now = Date.now()) {
    const reviewCount = Math.max(Number(card?.reviewCount || 0), Number(card?.repetitions || 0));
    const hasHistory = reviewCount > 0 || Number(card?.lastReview || card?.lastReviewedAt || 0) > 0;
    const isNew = !hasHistory;
    const nextReview = Number(card?.nextReview || 0);
    const due = !!card?.needsReview || (nextReview > 0 && nextReview <= now) || card?.lastAnswerQuality === 0 || card?.lastAnswerQuality === 1;
    let weakScore = 0;
    try { weakScore = Number(window.lfWeakMetrics?.(card)?.score || 0); } catch (_) {}
    const overdueDays = due && nextReview > 0 ? Math.max(0, (now - nextReview) / 86400000) : 0;
    return { isNew, due, weakScore, overdueDays, nextReview };
  }

  function smartOrder(deck) {
    const now = Date.now();
    const review = [];
    const fresh = [];
    (deck || []).forEach((card, index) => {
      const metrics = cardMetrics(card, now);
      const item = { card, index, metrics };
      (metrics.isNew ? fresh : review).push(item);
    });

    review.sort((a, b) => {
      if (a.metrics.due !== b.metrics.due) return a.metrics.due ? -1 : 1;
      if (b.metrics.weakScore !== a.metrics.weakScore) return b.metrics.weakScore - a.metrics.weakScore;
      if (b.metrics.overdueDays !== a.metrics.overdueDays) return b.metrics.overdueDays - a.metrics.overdueDays;
      return a.index - b.index;
    });

    const out = [];
    let r = 0, n = 0;
    while (r < review.length || n < fresh.length) {
      let taken = 0;
      while (r < review.length && taken < 2) {
        out.push(review[r++].card);
        taken += 1;
      }
      if (n < fresh.length) out.push(fresh[n++].card);
      if (r >= review.length) while (n < fresh.length) out.push(fresh[n++].card);
    }
    return { deck: out, reviewCount: review.length, newCount: fresh.length, dueCount: review.filter(x => x.metrics.due).length };
  }

  function ensureBanner() {
    let banner = document.getElementById('lfSmartQueueBanner');
    if (banner) return banner;
    const host = document.getElementById('flashcardContainer');
    if (!host || !host.parentElement) return null;
    banner = document.createElement('div');
    banner.id = 'lfSmartQueueBanner';
    banner.className = 'hidden rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-800';
    host.parentElement.insertBefore(banner, host);
    return banner;
  }

  function text(summary) {
    const lang = typeof currentUiLang === 'string' ? currentUiLang : 'vi';
    if (lang === 'en') return `🧠 Smart session · ${summary.dueCount} due · ${summary.reviewCount} reviews · ${summary.newCount} new. Urgent/weak reviews first, new cards interleaved.`;
    if (lang === 'zh') return `🧠 智能学习 · ${summary.dueCount} 张到期 · ${summary.reviewCount} 张复习 · ${summary.newCount} 张新卡。优先到期/薄弱卡，并穿插新卡。`;
    return `🧠 Phiên thông minh · ${summary.dueCount} đến hạn · ${summary.reviewCount} ôn · ${summary.newCount} mới. Thẻ đến hạn/từ yếu xếp trước, từ mới được xen kẽ.`;
  }

  function hideBanner() {
    document.getElementById('lfSmartQueueBanner')?.classList.add('hidden');
  }

  function applySmartOrder() {
    if (document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY) {
      hideBanner();
      return false;
    }
    let deck;
    try { deck = Array.isArray(filteredDeck) ? filteredDeck.slice() : []; } catch (_) { deck = []; }
    if (!deck.length) {
      hideBanner();
      return false;
    }
    const summary = smartOrder(deck);
    try {
      filteredDeck = summary.deck;
      activeStudyBatchIds = new Set(filteredDeck.map(card => card.id));
      activeStudyCompletedIds = new Set();
      currentIndex = 0;
      if (typeof renderCurrentCard === 'function') renderCurrentCard();
    } catch (err) {
      console.warn('Smart daily queue:', err);
      return false;
    }
    const banner = ensureBanner();
    if (banner) {
      banner.textContent = text(summary);
      banner.classList.remove('hidden');
    }
    return true;
  }

  function patchRuntime() {
    const original = window.applyStudyFilters;
    if (typeof original !== 'function' || original.__lfSmartQueuePatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      if (document.getElementById('studyCategoryFilter')?.value !== WEAK_CATEGORY) applySmartOrder();
      else hideBanner();
      return result;
    };
    wrapped.__lfSmartQueuePatched = true;
    window.applyStudyFilters = wrapped;
  }

  function init() {
    ensureBanner();
    patchRuntime();
    setTimeout(() => {
      if (document.getElementById('studyCategoryFilter')?.value !== WEAK_CATEGORY) applySmartOrder();
    }, 120);
  }

  window.lfApplySmartStudyQueue = applySmartOrder;
  window.lfSmartStudyOrder = smartOrder;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
