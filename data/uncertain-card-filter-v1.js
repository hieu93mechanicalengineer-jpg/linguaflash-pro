/* LinguaFlash data quality guard v1
   Removes OCR/notebook placeholder cards that explicitly say the source text was uncertain.
   It does not guess or alter legitimate vocabulary cards.
*/
(function () {
  'use strict';

  const USER_KEY = 'linguaflash_user_cards_v2';
  const SESSION_KEY = 'linguaflash_study_session_v1';
  const BAD_PATTERNS = [
    /chữ\s*ghi\s*tay\s*chưa\s*rõ/i,
    /ghi\s*tay[^.!?\n]{0,80}(?:chưa|không)\s*rõ/i,
    /không\s*đủ\s*ngữ\s*cảnh\s*để\s*xác\s*nhận/i,
    /không\s*xác\s*định\s*được[^.!?\n]{0,80}(?:chữ|từ|nghĩa)/i,
    /(?:unclear|illegible)\s*handwriting/i,
    /insufficient\s*context\s*(?:to|for)\s*(?:confirm|identify)/i
  ];

  function textOf(card) {
    if (!card || typeof card !== 'object') return '';
    return [
      card.front, card.back, card.meaning, card.meaningVi, card.meaningEn,
      card.example, card.exampleTrans, card.exampleEn, card.note, card.notes,
      card.translation, card.description
    ].filter(v => typeof v === 'string').join(' | ');
  }

  function isUncertain(card) {
    const text = textOf(card);
    return !!text && BAD_PATTERNS.some(re => re.test(text));
  }

  const removedIds = new Set();

  function filterArray(arr, label) {
    if (!Array.isArray(arr)) return arr;
    let write = 0;
    let removed = 0;
    for (let read = 0; read < arr.length; read += 1) {
      const card = arr[read];
      if (isUncertain(card)) {
        if (card && card.id != null) removedIds.add(String(card.id));
        removed += 1;
        continue;
      }
      arr[write++] = card;
    }
    if (write !== arr.length) arr.length = write;
    if (removed) console.info(`[LinguaFlash] Removed ${removed} uncertain placeholder card(s) from ${label}.`);
    return arr;
  }

  // Arrays available before app.js builds the unified deck.
  [
    ['GIA_HAN_CORE_CARDS', window.GIA_HAN_CORE_CARDS],
    ['GIA_HAN_TC2_CARDS', window.GIA_HAN_TC2_CARDS],
    ['HUYEN_ANH_CARDS', window.HUYEN_ANH_CARDS],
    ['HUYEN_ANH_L3_L4_CARDS', window.HUYEN_ANH_L3_L4_CARDS],
    ['TAV_DICTIONARY_CARDS', window.TAV_DICTIONARY_CARDS]
  ].forEach(([name, arr]) => filterArray(arr, name));

  // Also clean private user cards if an old uncertain OCR placeholder was ever saved there.
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const before = parsed.length;
        const clean = parsed.filter(card => {
          if (!isUncertain(card)) return true;
          if (card && card.id != null) removedIds.add(String(card.id));
          return false;
        });
        if (clean.length !== before) {
          localStorage.setItem(USER_KEY, JSON.stringify(clean));
          console.info(`[LinguaFlash] Removed ${before - clean.length} uncertain private card(s).`);
        }
      }
    }
  } catch (err) {
    console.warn('[LinguaFlash] Could not sanitize private uncertain cards.', err);
  }

  // Prevent a saved Continue Session from pointing at a card that has just been removed.
  if (removedIds.size) {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && typeof session === 'object') {
          const oldDeck = Array.isArray(session.deckIds) ? session.deckIds.map(String) : [];
          const newDeck = oldDeck.filter(id => !removedIds.has(id));
          const oldCompleted = Array.isArray(session.completedIds) ? session.completedIds.map(String) : [];
          const newCompleted = oldCompleted.filter(id => !removedIds.has(id));
          const currentRemoved = session.currentCardId != null && removedIds.has(String(session.currentCardId));
          if (newDeck.length !== oldDeck.length || newCompleted.length !== oldCompleted.length || currentRemoved) {
            session.deckIds = newDeck;
            session.completedIds = newCompleted;
            if (currentRemoved) {
              const idx = Math.max(0, Math.min(Number(session.currentIndex) || 0, Math.max(0, newDeck.length - 1)));
              session.currentIndex = idx;
              session.currentCardId = newDeck[idx] || null;
            }
            session.updatedAt = Date.now();
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          }
        }
      }
    } catch (err) {
      console.warn('[LinguaFlash] Could not repair Continue Session after card cleanup.', err);
    }
  }

  window.lfIsUncertainPlaceholderCard = isUncertain;
})();
