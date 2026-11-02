/* LinguaFlash · Unit 2 Study Cards bridge v1
   Makes the workspace lesson "UNIT 2 · SHE IS A POODLE" available to the
   normal Study Card/List filters before app-core builds allCards.
*/
(() => {
  'use strict';
  if (window.__LF51_UNIT2_STUDY_CARDS_V1__) return;
  window.__LF51_UNIT2_STUDY_CARDS_V1__ = true;

  const lesson = window.LF51_UNIT2_LESSON_V1;
  if (!lesson || !Array.isArray(lesson.vocab)) return;

  const TOPIC = '51Talk English - UNIT 2 · SHE IS A POODLE';
  const CATEGORY = '51Talk English';
  const ipaMap = window.LF51_UNIT2_IPA_V1 || {};
  const examples = new Map((lesson.examples || []).map(row => [String(row?.[0] || ''), row]));
  const base = {
    lang: 'Tiếng Anh',
    level: '51Talk · Unit 2',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: 0,
    category: CATEGORY,
    topic: TOPIC
  };

  const cards = [];

  lesson.vocab.forEach((row, index) => {
    if (!Array.isArray(row) || !row[0]) return;
    const match = examples.get(String(row[0])) || null;
    cards.push({
      ...base,
      id: `en51_unit2_v${String(index + 1).padStart(2, '0')}`,
      cardType: 'vocab',
      word: String(row[0] || ''),
      phonetic: String(row[1] || ''),
      meaning: String(row[2] || ''),
      chinese: '',
      example: String(match?.[1] || ''),
      exampleTrans: String(match?.[2] || ''),
      sourceLabel: `UNIT 2 · ${String(row[0] || '')}`,
      sourceSection: '51Talk · Unit 2 · Vocabulary',
      usage: String(row[3] || ''),
      related: String(row[4] || '')
    });
  });

  (lesson.examples || []).forEach((row, index) => {
    if (!Array.isArray(row) || !row[1]) return;
    const en = String(row[1] || '');
    const vi = String(row[2] || '');
    cards.push({
      ...base,
      id: `en51_unit2_e${String(index + 1).padStart(2, '0')}`,
      cardType: 'sentence',
      word: vi,
      meaning: '',
      chinese: en,
      phonetic: String(ipaMap[en] || ''),
      example: en,
      exampleTrans: vi,
      sourceLabel: String(row[0] || `Câu mẫu ${index + 1}`),
      sourceSection: '51Talk · Unit 2 · Examples'
    });
  });

  (lesson.dialogue || []).forEach((row, index) => {
    if (!Array.isArray(row) || !row[1]) return;
    const en = String(row[1] || '');
    const vi = String(row[2] || '');
    cards.push({
      ...base,
      id: `en51_unit2_d${String(index + 1).padStart(2, '0')}`,
      cardType: 'sentence',
      word: vi,
      meaning: '',
      chinese: en,
      phonetic: String(ipaMap[en] || ''),
      example: en,
      exampleTrans: vi,
      sourceLabel: `${String(row[0] || 'Dialogue')} · câu ${index + 1}`,
      sourceSection: '51Talk · Unit 2 · Dialogue'
    });
  });

  try {
    if (typeof DEFAULT_CARDS !== 'undefined' && Array.isArray(DEFAULT_CARDS)) {
      const existing = new Set(DEFAULT_CARDS.map(card => String(card?.id || '')));
      cards.forEach(card => {
        if (!existing.has(card.id)) DEFAULT_CARDS.push(card);
      });
    }
  } catch (error) {
    console.warn('Unit 2 study cards could not extend DEFAULT_CARDS:', error);
  }

  window.LF51_UNIT2_STUDY_CARDS_V1 = cards;
  window.LF51_UNIT2_STUDY_TOPIC_V1 = TOPIC;

  // Keep Card → List navigation on the same 51Talk lesson.
  document.addEventListener('click', event => {
    const listButton = event.target?.closest?.('[data-lfsl-view="list"]');
    if (!listButton) return;

    const lessonSelect = document.querySelector(
      '#lf51DesktopWorkspace [data-lesson-select], #lfEnglishMobileV1 [data-lesson-select], [data-lesson-select]'
    );
    if (!lessonSelect || String(lessonSelect.value || '') !== 'poodle') return;

    const langSelect = document.getElementById('studyLangFilter');
    const categorySelect = document.getElementById('studyCategoryFilter');
    const topicSelect = document.getElementById('studyTopicFilter');

    if (langSelect) langSelect.value = 'Tiếng Anh';
    if (categorySelect) categorySelect.value = CATEGORY;
    try {
      if (typeof updateSubtopicDropdown === 'function') updateSubtopicDropdown();
    } catch (_) {}
    if (topicSelect) topicSelect.value = TOPIC;
  }, true);
})();
