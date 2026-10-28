/* LinguaFlash Gia Han source corrections v1
   User-confirmed correction:
   B16-V40 is 采购 (cǎigòu), not 采风.
   If another 采购 card already exists, B16-V40 is removed as a duplicate.
*/
(() => {
  'use strict';
  if (window.__LF_GIAHAN_SOURCE_FIXES_V1__) return;
  window.__LF_GIAHAN_SOURCE_FIXES_V1__ = true;

  const TARGET_CODE = 'B16-V40';
  const CORRECT_WORD = '采购';

  function text(value) {
    return String(value == null ? '' : value).normalize('NFKC').trim();
  }

  function canonicalWord(value) {
    return text(value)
      .replace(/[（(][^()（）]*[）)]/g, '')
      .split(/[\/／;；|｜]/)[0]
      .replace(/[\s。！？!?，,；;：:]+/g, '')
      .trim();
  }

  function sourceCode(card) {
    if (!card || typeof card !== 'object') return '';
    const raw = [
      card.sourceCode, card.code, card.sourceLabel, card.sourceSection,
      card.label, card.topic, card.id
    ].map(text).join(' ');
    const m = raw.match(/\bB\d{2}-(?:BS\d+|V\d+|\d+)\b/i);
    return m ? m[0].toUpperCase() : '';
  }

  function visibleWord(card) {
    return canonicalWord(card?.word || card?.front || card?.hanzi || card?.chineseText || '');
  }

  function candidateArrays() {
    const names = [
      'GIA_HAN_CORE_CARDS',
      'GIA_HAN_TC2_CARDS',
      'GIA_HAN_TC2_CARDS_31_45',
      'GIA_HAN_B17_SUPPLEMENT',
      'GIA_HAN_B18_SUPPLEMENT',
      'GIA_HAN_B19_SUPPLEMENT',
      'GIA_HAN_B19_SUPPLEMENT_2'
    ];
    const out = [];
    const seen = new Set();
    names.forEach(name => {
      const arr = window[name];
      if (Array.isArray(arr) && !seen.has(arr)) {
        seen.add(arr);
        out.push({ name, arr });
      }
    });
    return out;
  }

  function correctCard(card) {
    if (!card || typeof card !== 'object') return;

    card.word = CORRECT_WORD;
    if ('front' in card) card.front = CORRECT_WORD;
    if ('hanzi' in card) card.hanzi = CORRECT_WORD;
    if ('chineseText' in card) card.chineseText = CORRECT_WORD;

    // Keep common phonetic field variants aligned.
    card.phonetic = 'cǎigòu';
    if ('pinyin' in card) card.pinyin = 'cǎigòu';
    if ('pronunciation' in card && /c[aǎ]i/i.test(text(card.pronunciation))) card.pronunciation = 'cǎigòu';

    const vi = 'mua hàng; thu mua; mua sắm (cho công ty/nhà máy)';
    const en = 'purchase; procurement';
    if ('meaning' in card) card.meaning = vi;
    if ('meaningVi' in card) card.meaningVi = vi;
    if ('vietnamese' in card) card.vietnamese = vi;
    if ('meaningEn' in card) card.meaningEn = en;
    if ('english' in card) card.english = en;
    if ('meaningEnglish' in card) card.meaningEnglish = en;

    // Real workplace example; replaces the old handwriting/OCR note.
    card.example = '我们需要提前采购下个月生产用的原材料。';
    card.exampleTrans = 'Chúng ta cần mua trước nguyên vật liệu dùng cho sản xuất tháng sau.';
    card.exampleEn = "We need to purchase in advance the raw materials for next month's production.";

    // Remove stale warning/IPA text from the previous misread entry when present.
    ['note','notes','usageNote','description'].forEach(key => {
      if (typeof card[key] === 'string' && /手写|chữ viết tay|handwrit|phụ thuộc ngữ cảnh|context/i.test(card[key])) {
        card[key] = '';
      }
    });
    if (typeof card.englishIpa === 'string') card.englishIpa = '';
  }

  const groups = candidateArrays();
  const all = groups.flatMap(group => group.arr.map((card, index) => ({ ...group, card, index })));
  const targets = all.filter(item => sourceCode(item.card) === TARGET_CODE);

  if (!targets.length) return;

  const duplicate = all.find(item =>
    sourceCode(item.card) !== TARGET_CODE && visibleWord(item.card) === CORRECT_WORD
  );

  if (duplicate) {
    // Remove B16-V40 from every source array where it appears; preserve the existing canonical 采购 card.
    groups.forEach(group => {
      for (let i = group.arr.length - 1; i >= 0; i -= 1) {
        if (sourceCode(group.arr[i]) === TARGET_CODE) group.arr.splice(i, 1);
      }
    });
    console.info(`[LinguaFlash] Removed duplicate ${TARGET_CODE}; existing 采购 card kept (${sourceCode(duplicate.card) || duplicate.card?.id || 'canonical'}).`);
  } else {
    targets.forEach(item => correctCard(item.card));
    console.info(`[LinguaFlash] Corrected ${TARGET_CODE}: 采风 → 采购 (cǎigòu).`);
  }
})();