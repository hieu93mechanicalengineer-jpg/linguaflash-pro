/* LinguaFlash data quality guard v2
   Removes OCR/notebook placeholder cards and explicitly deleted Gia Han source items.
   It does not guess or alter legitimate vocabulary cards.
*/
(function () {
  'use strict';

  const USER_KEY = 'linguaflash_user_cards_v2';
  const PROGRESS_KEY = 'linguaflash_card_progress_v2';
  const SESSION_KEY = 'linguaflash_study_session_v1';

  // User-confirmed deletions. Match both the visible word and the source row code
  // so these entries stay deleted even if an older data pack contains them again.
  const DELETED_WORDS = new Set(['永用', '奇形怪衣', '证条']);
  const DELETED_SOURCE_CODES = new Set(['B17-BS25', 'B24-V16', 'B24-V39']);

  const BAD_PATTERNS = [
    /chữ\s*ghi\s*tay\s*chưa\s*rõ/i,
    /ghi\s*tay[^.!?\n]{0,80}(?:chưa|không)\s*rõ/i,
    /không\s*đủ\s*ngữ\s*cảnh\s*để\s*xác\s*nhận/i,
    /không\s*xác\s*định\s*được[^.!?\n]{0,80}(?:chữ|từ|nghĩa)/i,
    /(?:unclear|illegible)\s*handwriting/i,
    /insufficient\s*context\s*(?:to|for)\s*(?:confirm|identify)/i
  ];

  function text(value) {
    return String(value == null ? '' : value).normalize('NFKC').trim();
  }

  function canonicalWord(value) {
    return text(value)
      .replace(/[（(][^()（）]*[）)]/g, '')
      .split(/[\/／;；]/)[0]
      .replace(/\s+/g, '')
      .trim();
  }

  function sourceCodeOf(card) {
    if (!card || typeof card !== 'object') return '';
    const raw = [
      card.sourceCode, card.code, card.sourceLabel, card.sourceSection,
      card.label, card.topic, card.id
    ].map(text).join(' ');
    const match = raw.match(/\bB\d{2}-(?:BS\d+|V\d+|\d+)\b/i);
    return match ? match[0].toUpperCase() : '';
  }

  function isExplicitlyDeleted(card) {
    if (!card || typeof card !== 'object') return false;
    const visibleCandidates = [card.word, card.front, card.hanzi, card.chineseText]
      .map(canonicalWord)
      .filter(Boolean);
    if (visibleCandidates.some(value => DELETED_WORDS.has(value))) return true;
    return DELETED_SOURCE_CODES.has(sourceCodeOf(card));
  }

  function textOf(card) {
    if (!card || typeof card !== 'object') return '';
    return [
      card.front, card.back, card.meaning, card.meaningVi, card.meaningEn,
      card.example, card.exampleTrans, card.exampleEn, card.note, card.notes,
      card.translation, card.description
    ].filter(v => typeof v === 'string').join(' | ');
  }

  function isUncertain(card) {
    const body = textOf(card);
    return !!body && BAD_PATTERNS.some(re => re.test(body));
  }

  function shouldRemove(card) {
    return isExplicitlyDeleted(card) || isUncertain(card);
  }

  const removedIds = new Set();

  function filterArray(arr, label) {
    if (!Array.isArray(arr)) return arr;
    let write = 0;
    let removed = 0;
    for (let read = 0; read < arr.length; read += 1) {
      const card = arr[read];
      if (shouldRemove(card)) {
        if (card && card.id != null) removedIds.add(String(card.id));
        removed += 1;
        continue;
      }
      arr[write++] = card;
    }
    if (write !== arr.length) arr.length = write;
    if (removed) console.info(`[LinguaFlash] Removed ${removed} deleted/uncertain card(s) from ${label}.`);
    return arr;
  }

  // Arrays exposed on window by bundled packs.
  [
    ['GIA_HAN_CORE_CARDS', window.GIA_HAN_CORE_CARDS],
    ['GIA_HAN_TC2_CARDS', window.GIA_HAN_TC2_CARDS],
    ['HUYEN_ANH_CARDS', window.HUYEN_ANH_CARDS],
    ['HUYEN_ANH_L3_L4_CARDS', window.HUYEN_ANH_L3_L4_CARDS],
    ['TAV_DICTIONARY_CARDS', window.TAV_DICTIONARY_CARDS]
  ].forEach(([name, arr]) => filterArray(arr, name));

  // Also cover global lexical bindings used by the current app data model.
  try { if (typeof DEFAULT_CARDS !== 'undefined') filterArray(DEFAULT_CARDS, 'DEFAULT_CARDS'); } catch (_) {}
  try { if (typeof GIA_HAN_TC2_CARDS_31_45 !== 'undefined') filterArray(GIA_HAN_TC2_CARDS_31_45, 'GIA_HAN_TC2_CARDS_31_45'); } catch (_) {}

  // Clean private user cards too, in case an older import saved one of these rows locally.
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const before = parsed.length;
        const clean = parsed.filter(card => {
          if (!shouldRemove(card)) return true;
          if (card && card.id != null) removedIds.add(String(card.id));
          return false;
        });
        if (clean.length !== before) {
          localStorage.setItem(USER_KEY, JSON.stringify(clean));
          console.info(`[LinguaFlash] Removed ${before - clean.length} deleted/uncertain private card(s).`);
        }
      }
    }
  } catch (err) {
    console.warn('[LinguaFlash] Could not sanitize private deleted/uncertain cards.', err);
  }

  // Remove stale SRS progress records for cards that were deleted from bundled/private data.
  if (removedIds.size) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const progress = JSON.parse(raw);
        if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
          let changed = false;
          removedIds.forEach(id => {
            if (Object.prototype.hasOwnProperty.call(progress, id)) {
              delete progress[id];
              changed = true;
            }
          });
          if (changed) localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        }
      }
    } catch (err) {
      console.warn('[LinguaFlash] Could not remove progress for deleted cards.', err);
    }
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
  window.lfIsExplicitlyDeletedCard = isExplicitlyDeleted;
})();
