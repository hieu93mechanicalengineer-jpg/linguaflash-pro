// LinguaFlash · Gia Hân Trung cấp 1 · Bài 19 supplement normalization v1
// Converts the notebook supplement's legacy raw-card schema into the current
// DEFAULT_CARDS schema before app-core builds its built-in baseline.
(() => {
  'use strict';
  if (window.__LF_GIAHAN_B19_NORMALIZE_V1__) return;
  window.__LF_GIAHAN_B19_NORMALIZE_V1__ = true;

  const raw = Array.isArray(window.GIA_HAN_CORE_CARDS) ? window.GIA_HAN_CORE_CARDS : [];
  const target = (typeof DEFAULT_CARDS !== 'undefined' && Array.isArray(DEFAULT_CARDS)) ? DEFAULT_CARDS : null;
  if (!target || !raw.length) {
    console.warn('[LinguaFlash] Bài 19 normalization skipped: source or DEFAULT_CARDS unavailable.');
    return;
  }

  const isB19Supplement = card => {
    if (!card) return false;
    const id = String(card.id || '');
    const topic = String(card.topic || '').trim();
    return /^gh_b19_sup(?:_|$)/i.test(id) && /^Bài\s*19$/i.test(topic);
  };

  const existingIds = new Set(target.map(card => String(card?.id || '')).filter(Boolean));
  const existingLessonWords = new Set(
    target
      .filter(card => /Gia Hân\s*-\s*Trung cấp 1\s*-\s*Bài 19/i.test(String(card?.topic || '')))
      .map(card => String(card?.word || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase())
      .filter(Boolean)
  );

  let added = 0;
  let skipped = 0;
  raw.filter(isB19Supplement).forEach(src => {
    const id = String(src.id || '').trim();
    const word = String(src.front || src.word || src.chinese || '').trim();
    const wordKey = word.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
    if (!id || !word || existingIds.has(id) || existingLessonWords.has(wordKey)) {
      skipped++;
      return;
    }

    // Keep the verified notebook wording clean in the normalized app card.
    const exampleTrans = id === 'gh_b19_sup_034'
      ? 'Trước khi làm thủ tục cần chuẩn bị giấy hẹn.'
      : String(src.exampleTrans || '').trim();

    target.push({
      id,
      lang: 'Tiếng Trung',
      word,
      phonetic: String(src.phonetic || '').trim(),
      meaning: String(src.back || src.meaning || '').trim(),
      chinese: String(src.meaningEn || '').trim(),
      example: String(src.example || '').trim(),
      exampleTrans,
      exampleEn: String(src.exampleEn || '').trim(),
      topic: 'Gia Hân - Trung cấp 1 - Bài 19',
      category: 'Gia Hân',
      level: 'Trung cấp 1',
      interval: Number(src.interval || 0),
      repetitions: Number(src.repetitions || 0),
      easeFactor: Number(src.easeFactor || 2.5),
      nextReview: 0,
      cardType: 'vocab',
      sourceLabel: 'Bài 19 · Từ vựng bổ sung',
      sourceSection: 'Gia Hân - Trung cấp 1 - Bài 19 · Ghi chú bổ sung'
    });
    existingIds.add(id);
    existingLessonWords.add(wordKey);
    added++;
  });

  console.info(`[LinguaFlash] Bài 19 normalized supplements: ${added} added to DEFAULT_CARDS, ${skipped} already present/skipped.`);
})();