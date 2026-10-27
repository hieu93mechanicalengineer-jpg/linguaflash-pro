/* LinguaFlash: accept either side of inline slash alternatives in typed answers.
   Example: 这几年工人的生活比前几年好/好多了。 accepts either
   这几年工人的生活比前几年好 or 这几年工人的生活比前几年好多了。
   This is an isolated pre-submit adapter; FSRS-6 and existing answer grading stay unchanged.
*/
(() => {
  'use strict';

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

  function currentExpected() {
    try {
      if (typeof filteredDeck === 'undefined' || !Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      if (typeof currentIndex === 'undefined') return null;
      const card = filteredDeck[currentIndex];
      if (!card) return null;
      const language = document.getElementById('studyLangFilter')?.value || card.lang || 'Tiếng Trung';
      const expected = typeof getCardTextInLanguage === 'function'
        ? getCardTextInLanguage(card, language)
        : (card.word || '');
      return { language, expected: String(expected || '') };
    } catch (_) {
      return null;
    }
  }

  function matchesSlashAlternative(userRaw, expectedRaw, language) {
    const raw = String(expectedRaw || '');
    const slashIndex = raw.search(/[\/／]/);
    if (slashIndex < 0) return false;

    const leftRaw = raw.slice(0, slashIndex);
    const rightRaw = raw.slice(slashIndex + 1);
    const user = normalizeAnswer(userRaw, language);
    const left = normalizeAnswer(leftRaw, language);
    const right = normalizeAnswer(rightRaw, language);
    if (!user || !left || !right) return false;

    // Variant 1 when the slash is at the end (or only punctuation follows it).
    if (user === left) return true;

    // A X / Y B  -> accept A X B.
    if (user.startsWith(left)) {
      const tail = user.slice(left.length);
      if (tail && right.endsWith(tail)) return true;
    }

    // A X / Y B  -> accept A Y B.
    // Infer A from what the learner actually typed; X must remain a short alternative,
    // preventing an inline sentence from accepting only the text after the slash.
    if (user.endsWith(right)) {
      const prefix = user.slice(0, user.length - right.length);
      if (left.startsWith(prefix)) {
        const replacedLeft = left.slice(prefix.length);
        const maxAlternativeLength = language === 'Tiếng Trung' ? 12 : 40;
        if (replacedLeft && replacedLeft.length <= maxAlternativeLength) return true;
      }
    }

    return false;
  }

  function prepareSlashAlternative() {
    const input = document.getElementById('studyAnswerInput');
    if (!input || !input.value.trim()) return;
    const info = currentExpected();
    if (!info || !/[\/／]/.test(info.expected)) return;
    if (matchesSlashAlternative(input.value, info.expected, info.language)) {
      // Existing study-answer-mode will then validate normally against its full expected text.
      input.value = info.expected;
    }
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#studyAnswerCheckBtn')) prepareSlashAlternative();
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target?.id === 'studyAnswerInput') prepareSlashAlternative();
  }, true);

  window.lfSlashAnswerAlternatives = {
    enabled: true,
    matches: matchesSlashAlternative
  };
})();
