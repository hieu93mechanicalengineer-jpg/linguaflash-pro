/* LinguaFlash Smart Deck: Weak Words v1
   Virtual study deck ranked from real learning evidence. No cards are duplicated.
*/
(() => {
  'use strict';

  const WEAK_CATEGORY = '__LF_WEAK__';
  const PROGRESS_KEY = 'linguaflash_card_progress_v2';
  const MAX_DECK = 20;
  let packLoadPromise = null;

  function text() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      option: '🔥 My weak words',
      title: 'Weak words',
      desc: 'Focus on cards you have missed, lapsed, or still have high difficulty / low stability.',
      button: 'Practice weak words',
      empty: 'No weak cards yet. Keep studying normally and LinguaFlash will identify them automatically.',
      summary: (total, shown, due) => `${total} weak cards · ${due} due now · practicing the top ${shown}. Due cards are prioritized.`
    };
    if (lang === 'zh') return {
      option: '🔥 我的薄弱词汇',
      title: '薄弱词汇',
      desc: '自动集中练习答错、遗忘、难度高或稳定性低的卡片。',
      button: '练习薄弱词汇',
      empty: '目前还没有明显的薄弱卡片。继续正常学习，系统会自动识别。',
      summary: (total, shown, due) => `薄弱卡 ${total} 张 · 当前到期 ${due} 张 · 优先练习前 ${shown} 张。到期卡优先。`
    };
    return {
      option: '🔥 Từ yếu của tôi',
      title: 'Từ yếu của tôi',
      desc: 'Tự động tập trung vào những thẻ bạn hay sai, bị lapse, difficulty cao hoặc stability thấp.',
      button: 'Luyện từ yếu',
      empty: 'Chưa có thẻ yếu rõ ràng. Bạn cứ học bình thường, LinguaFlash sẽ tự nhận diện dần.',
      summary: (total, shown, due) => `${total} thẻ yếu · ${due} thẻ đang đến hạn · luyện ${shown} thẻ ưu tiên nhất. Thẻ đến hạn được xếp trước.`
    };
  }

  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function weakMetrics(card, now = Date.now()) {
    if (!card || typeof card !== 'object') return { score: 0, due: false };
    const wrong = Math.max(0, num(card.lastWrongAttempts));
    const lapses = Math.max(0, num(card.lapses));
    const reviews = Math.max(num(card.reviewCount), num(card.repetitions));
    const difficulty = Math.max(1, Math.min(10, num(card.difficulty, 5)));
    const stability = Math.max(0, num(card.stability));
    const quality = Number.isFinite(Number(card.lastAnswerQuality)) ? Number(card.lastAnswerQuality) : null;
    const relearning = String(card.state || '').toLowerCase() === 'relearning';
    const nextReview = num(card.nextReview);
    const due = !!card.needsReview || (nextReview > 0 && nextReview <= now) || quality === 0 || quality === 1;
    const hasLearningEvidence = reviews > 0 || wrong > 0 || lapses > 0 || num(card.lastReview || card.lastReviewedAt) > 0;
    if (!hasLearningEvidence) return { score: 0, due };

    let score = 0;
    score += Math.min(4, wrong) * 3.0;
    score += Math.min(5, lapses) * 4.0;
    if (quality === 0) score += 5.0;
    else if (quality === 1) score += 3.0;
    if (relearning) score += 5.0;
    if (difficulty >= 6) score += (difficulty - 5) * 1.2;
    if (stability > 0 && reviews > 0) {
      if (stability < 1) score += 4.0;
      else if (stability < 3) score += 2.5;
      else if (stability < 7) score += 1.0;
    }
    if (due && score > 0) score += 2.0;

    return { score: Number(score.toFixed(2)), due, wrong, lapses, reviews, difficulty, stability, nextReview };
  }

  function isWeak(card) {
    return weakMetrics(card).score >= 3;
  }

  function hasTargetText(card, language) {
    try {
      if (typeof getCardTextInLanguage === 'function') return !!String(getCardTextInLanguage(card, language) || '').trim();
    } catch (_) {}
    return !!String(card?.word || card?.meaning || card?.chinese || '').trim();
  }

  function rankedWeakCards(language, dueOnly) {
    const now = Date.now();
    let cards = [];
    try { cards = Array.isArray(allCards) ? allCards : []; } catch (_) { cards = []; }
    return cards
      .filter(card => hasTargetText(card, language))
      .map(card => ({ card, metrics: weakMetrics(card, now) }))
      .filter(item => item.metrics.score >= 3 && (!dueOnly || item.metrics.due))
      .sort((a, b) => {
        if (a.metrics.due !== b.metrics.due) return a.metrics.due ? -1 : 1;
        if (b.metrics.score !== a.metrics.score) return b.metrics.score - a.metrics.score;
        return (a.metrics.nextReview || Number.MAX_SAFE_INTEGER) - (b.metrics.nextReview || Number.MAX_SAFE_INTEGER);
      });
  }

  function weakProgressCount() {
    try {
      const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      return Object.values(progress || {}).filter(isWeak).length;
    } catch (_) { return 0; }
  }

  function ensureWeakOption(preferredValue) {
    const select = document.getElementById('studyCategoryFilter');
    if (!select) return;
    let option = Array.from(select.options || []).find(o => o.value === WEAK_CATEGORY);
    if (!option) {
      option = document.createElement('option');
      option.value = WEAK_CATEGORY;
      select.insertBefore(option, select.options[1] || null);
    }
    option.textContent = text().option;
    if (preferredValue === WEAK_CATEGORY) select.value = WEAK_CATEGORY;
  }

  function showWeakTopicOnly() {
    const topic = document.getElementById('studyTopicFilter');
    if (!topic) return;
    topic.innerHTML = '<option value="ALL">Tất cả từ yếu</option>';
    topic.value = 'ALL';
  }

  function ensureBanner() {
    let banner = document.getElementById('lfWeakDeckBanner');
    if (banner) return banner;
    const host = document.getElementById('flashcardContainer');
    if (!host || !host.parentElement) return null;
    banner = document.createElement('div');
    banner.id = 'lfWeakDeckBanner';
    banner.className = 'hidden rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900';
    host.parentElement.insertBefore(banner, host);
    return banner;
  }

  function renderWeakBanner(total = 0, shown = 0, due = 0) {
    const banner = ensureBanner();
    if (!banner) return;
    const selected = document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY;
    if (!selected) { banner.classList.add('hidden'); return; }
    const t = text();
    banner.classList.remove('hidden');
    banner.innerHTML = `<div class="font-extrabold">🔥 ${t.title}</div><div class="mt-1">${total ? t.summary(total, shown, due) : t.empty}</div>`;
  }

  function buildWeakDeck() {
    if (document.getElementById('studyCategoryFilter')?.value !== WEAK_CATEGORY) {
      renderWeakBanner();
      return false;
    }
    const language = document.getElementById('studyLangFilter')?.value || 'Tiếng Trung';
    const dueOnly = !!document.getElementById('studyDueOnly')?.checked;
    const ranked = rankedWeakCards(language, dueOnly);
    const deck = ranked.slice(0, MAX_DECK).map(item => item.card);
    try {
      filteredDeck = deck;
      activeStudyBatchIds = new Set(deck.map(card => card.id));
      activeStudyCompletedIds = new Set();
      currentIndex = 0;
      if (typeof renderCurrentCard === 'function') renderCurrentCard();
    } catch (err) {
      console.warn('Weak deck build:', err);
      return false;
    }
    renderWeakBanner(ranked.length, deck.length, ranked.filter(item => item.metrics.due).length);
    updateHomeCard();
    if (!deck.length) {
      try { if (typeof showToast === 'function') showToast(text().empty, '🔥'); } catch (_) {}
    }
    return true;
  }

  function largePacksReady() {
    const state = window.lfLargePackState;
    return !!(state?.huyen?.loaded && state?.dictionary?.loaded);
  }

  function ensureAllPacksForWeak() {
    if (largePacksReady() || typeof window.lfLoadAllLargePacks !== 'function') return Promise.resolve(true);
    if (packLoadPromise) return packLoadPromise;
    packLoadPromise = Promise.resolve(window.lfLoadAllLargePacks())
      .catch(err => { console.warn('Weak deck large packs:', err); return false; })
      .finally(() => { packLoadPromise = null; });
    return packLoadPromise;
  }

  function ensureHomeCard() {
    let card = document.getElementById('lfWeakWordsHomeCard');
    if (card) return card;
    const home = document.getElementById('tab-home');
    const hero = home?.querySelector('.app-hero');
    if (!home || !hero) return null;
    card = document.createElement('div');
    card.id = 'lfWeakWordsHomeCard';
    card.className = 'app-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4';
    hero.insertAdjacentElement('afterend', card);
    return card;
  }

  function updateHomeCard() {
    const card = ensureHomeCard();
    if (!card) return;
    const t = text();
    const count = weakProgressCount();
    card.innerHTML = `
      <div class="min-w-0">
        <div class="font-extrabold text-slate-900">🔥 ${t.title}${count ? ` <span class="text-amber-600">(${count})</span>` : ''}</div>
        <div class="text-sm text-slate-600 mt-1">${count ? t.desc : t.empty}</div>
      </div>
      <button type="button" class="app-primary-btn shrink-0" onclick="lfOpenWeakDeck()">🔥 ${t.button}</button>`;
  }

  async function openWeakDeck() {
    try { if (typeof switchTab === 'function') switchTab('study'); } catch (_) {}
    ensureWeakOption(WEAK_CATEGORY);
    const cat = document.getElementById('studyCategoryFilter');
    if (cat) cat.value = WEAK_CATEGORY;
    const due = document.getElementById('studyDueOnly');
    if (due) due.checked = false;
    showWeakTopicOnly();
    buildWeakDeck();
    await ensureAllPacksForWeak();
    ensureWeakOption(WEAK_CATEGORY);
    if (cat) cat.value = WEAK_CATEGORY;
    showWeakTopicOnly();
    buildWeakDeck();
    try { if (typeof window.lfSaveStudyFilterPrefs === 'function') window.lfSaveStudyFilterPrefs(); } catch (_) {}
    try { if (typeof window.lfSaveStudySession === 'function') window.lfSaveStudySession(); } catch (_) {}
  }

  function patchFunction(name, factory) {
    const original = window[name];
    if (typeof original !== 'function' || original.__lfWeakPatched) return;
    const wrapped = factory(original);
    wrapped.__lfWeakPatched = true;
    window[name] = wrapped;
  }

  function patchRuntime() {
    patchFunction('populateCategoryDropdown', original => function(...args) {
      const before = document.getElementById('studyCategoryFilter')?.value;
      const result = original.apply(this, args);
      ensureWeakOption(before);
      if (before === WEAK_CATEGORY) showWeakTopicOnly();
      return result;
    });

    patchFunction('updateSubtopicDropdown', original => function(...args) {
      if (document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY) {
        showWeakTopicOnly();
        return;
      }
      return original.apply(this, args);
    });

    patchFunction('applyStudyFilters', original => function(...args) {
      if (document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY) {
        buildWeakDeck();
        ensureAllPacksForWeak().then(() => {
          if (document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY) buildWeakDeck();
        });
        return;
      }
      renderWeakBanner();
      return original.apply(this, args);
    });

    patchFunction('changeUiLanguage', original => function(...args) {
      const result = original.apply(this, args);
      ensureWeakOption(document.getElementById('studyCategoryFilter')?.value);
      updateHomeCard();
      if (document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY) buildWeakDeck();
      return result;
    });

    patchFunction('switchTab', original => function(...args) {
      const result = original.apply(this, args);
      if (args?.[0] === 'home') updateHomeCard();
      return result;
    });

    patchFunction('renderCurrentCard', original => function(...args) {
      const result = original.apply(this, args);
      setTimeout(updateHomeCard, 0);
      return result;
    });
  }

  function init() {
    patchRuntime();
    ensureWeakOption();
    ensureBanner();
    updateHomeCard();
    document.getElementById('studyCategoryFilter')?.addEventListener('change', () => {
      if (document.getElementById('studyCategoryFilter')?.value === WEAK_CATEGORY) {
        showWeakTopicOnly();
        ensureAllPacksForWeak().then(buildWeakDeck);
      } else {
        renderWeakBanner();
      }
    });
  }

  window.LF_WEAK_CATEGORY = WEAK_CATEGORY;
  window.lfWeakMetrics = weakMetrics;
  window.lfBuildWeakDeck = buildWeakDeck;
  window.lfOpenWeakDeck = openWeakDeck;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
