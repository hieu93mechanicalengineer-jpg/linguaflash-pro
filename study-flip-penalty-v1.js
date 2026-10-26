/* LinguaFlash study flip penalty v1
   If the learner reveals the answer by flipping a study card, count that reveal as one failed recall.
   The penalty is applied only once for the current card attempt, even if the card is flipped repeatedly.
*/
(() => {
  'use strict';

  const originalFlipCard = typeof window.flipCard === 'function' ? window.flipCard : null;
  if (!originalFlipCard) return;

  let penalizedCardId = null;

  function currentCardId() {
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      const card = filteredDeck[currentIndex];
      return card?.id == null ? null : String(card.id);
    } catch (_) {
      return null;
    }
  }

  function uiMessage() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return 'Answer revealed · counted as 1 failed recall.';
    if (lang === 'zh') return '已查看答案 · 记为 1 次未想起。';
    return 'Đã xem đáp án · tính 1 lần chưa nhớ.';
  }

  function applyRevealPenalty(cardId) {
    if (!cardId || penalizedCardId === cardId) return;

    const input = document.getElementById('studyAnswerInput');
    const button = document.getElementById('studyAnswerCheckBtn');
    const feedback = document.getElementById('studyAnswerFeedback');
    if (!input || !button || input.disabled) return;

    const previousValue = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Reuse the existing typed-answer grading path so the reveal affects the exact
    // same wrongAttempts counter, FSRS forecast and final automatic grade.
    input.value = `__lf_reveal_${Date.now()}_${Math.random().toString(36).slice(2)}__`;
    button.click();
    input.value = previousValue;

    if (feedback) {
      feedback.className = 'mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700';
      feedback.textContent = uiMessage();
    }

    try {
      if (typeof start === 'number' && typeof end === 'number') input.setSelectionRange(start, end);
    } catch (_) {}

    penalizedCardId = cardId;
  }

  window.flipCard = function(...args) {
    const cardId = currentCardId();
    const shouldPenalize = !!cardId && penalizedCardId !== cardId;
    const result = originalFlipCard.apply(this, args);
    if (shouldPenalize) applyRevealPenalty(cardId);
    return result;
  };
})();
