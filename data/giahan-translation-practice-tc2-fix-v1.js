/* LinguaFlash Gia Han TC2 translation-practice fix.
   v36/v37 looked for `Trung cấp 2 - Bài N`, while the real TC2 pack stores
   `Gia Hân - Trung cấp 2 - Bài N`. This module builds B31-B45 translation decks
   from the actual TC2 topics before app.js initializes.
*/
(() => {
  'use strict';

  const pad = n => String(n).padStart(2, '0');
  const firstLine = value => String(value || '').split(/\r?\n/)[0].trim();
  const countHan = value => (String(value || '').match(/[\u3400-\u9fff]/g) || []).length;
  const normalizeKey = value => String(value || '').replace(/[\s，。！？、；：,.!?;:（）()“”"']/g, '');

  const CORRECTIONS = {
    '这里太多路了，我迷路啊。': ['这里路太多了，我迷路了。','Ở đây có quá nhiều đường, tôi bị lạc rồi.'],
    '我自己想，都是一个专业的工作。': ['我想找一份专业对口的工作。','Tôi muốn tìm một công việc đúng chuyên môn.'],
    '这座桥用钢铁，很结实。': ['这座桥是用钢铁建的，很结实。','Cây cầu này được xây bằng thép nên rất chắc chắn.'],
    '你给我点儿钱，就叫是工资吧。': ['这是你这个月的工资，请确认一下。','Đây là tiền lương tháng này của bạn, hãy kiểm tra lại.'],
    '我不会这个怎么做。': ['我不知道这个应该怎么做。','Tôi không biết việc này nên làm như thế nào.'],
    '这个工作我做不来。': ['这份工作我暂时还做不了。','Công việc này hiện tại tôi vẫn chưa làm được.']
  };

  const BAD_CN = [/阿雄|阿娥|阿秋/, /不清楚|看不清|字迹|手写/, /叫是/, /自己想，都是/, /太多路/, /[？?]{2,}/, /[=+<>]/];
  const BAD_VI = [/chưa rõ|không rõ chữ|không đủ ngữ cảnh|không xác định|ghi tay/i, /unclear|unknown|ocr/i];

  function pairFromCard(card) {
    const rawCn = firstLine(card?.example);
    const hit = CORRECTIONS[rawCn];
    const cn = hit ? hit[0] : rawCn;
    const vi = hit ? hit[1] : firstLine(card?.exampleTrans);
    return { cn, vi };
  }

  function usable(pair, relaxed = false) {
    const han = countHan(pair.cn);
    if (!pair.cn || !pair.vi) return false;
    if (han < (relaxed ? 4 : 6) || han > (relaxed ? 36 : 30)) return false;
    if (pair.vi.length < (relaxed ? 7 : 12) || pair.vi.length > 170) return false;
    if (BAD_CN.some(rx => rx.test(pair.cn)) || BAD_VI.some(rx => rx.test(pair.vi))) return false;
    if (/[A-Za-z]{5,}/.test(pair.cn)) return false;
    return true;
  }

  function score(pair) {
    const han = countHan(pair.cn);
    let s = 0;
    if (han >= 8 && han <= 20) s += 4;
    else if (han >= 6 && han <= 28) s += 2;
    if (pair.vi.length >= 18 && pair.vi.length <= 90) s += 3;
    if (/[。！？]$/.test(pair.cn)) s += 1;
    if (!/[、；：]/.test(pair.cn)) s += 1;
    return s;
  }

  function curate(cards, max = 8) {
    const out = [];
    const seen = new Set();
    const collect = relaxed => {
      for (const card of cards) {
        const pair = pairFromCard(card);
        const key = normalizeKey(pair.cn);
        if (!key || seen.has(key) || !usable(pair, relaxed)) continue;
        seen.add(key);
        out.push({ ...pair, score: score(pair) - (relaxed ? 2 : 0) });
      }
    };
    collect(false);
    if (out.length < 6) collect(true);
    return out.sort((a,b) => b.score - a.score).slice(0, max).map(({cn,vi}) => ({cn,vi}));
  }

  function makeCard(lesson, index, pair) {
    return {
      id: `gh_tc2_b${lesson}_tr_${pad(index)}`,
      lang: 'Tiếng Trung',
      word: pair.cn,
      phonetic: '',
      meaning: pair.vi,
      chinese: pair.cn,
      example: pair.cn,
      exampleTrans: pair.vi,
      topic: `Gia Hân - Trung cấp 2 - Bài ${lesson} - Luyện dịch`,
      category: 'Gia Hân',
      level: 'Trung cấp 2',
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: 0,
      cardType: 'translation',
      sourceLabel: `Bài ${lesson} - Luyện dịch ${index}`,
      sourceSection: 'Luyện dịch TC2 v1'
    };
  }

  let tc2 = [];
  try {
    if (typeof GIA_HAN_TC2_CARDS_31_45 !== 'undefined' && Array.isArray(GIA_HAN_TC2_CARDS_31_45)) tc2 = GIA_HAN_TC2_CARDS_31_45;
    else if (Array.isArray(window.GIA_HAN_TC2_CARDS_31_45)) tc2 = window.GIA_HAN_TC2_CARDS_31_45;
  } catch (_) {}
  if (!Array.isArray(tc2) || !tc2.length) return;

  // Remove only previously generated TC2 translation cards, leaving normal TC2 cards untouched.
  for (let i = tc2.length - 1; i >= 0; i--) {
    if (tc2[i]?.category === 'Gia Hân' && /Trung cấp 2 - Bài \d+ - Luyện dịch$/.test(String(tc2[i]?.topic || ''))) {
      tc2.splice(i, 1);
    }
  }

  const additions = [];
  const counts = {};
  for (let lesson = 31; lesson <= 45; lesson++) {
    const regularTopic = `Gia Hân - Trung cấp 2 - Bài ${lesson}`;
    const sourceCards = tc2.filter(card => card?.category === 'Gia Hân' && card?.topic === regularTopic);
    const pairs = curate(sourceCards, 8);
    counts[lesson] = pairs.length;
    pairs.forEach((pair, i) => additions.push(makeCard(lesson, i + 1, pair)));
  }

  tc2.unshift(...additions);
  window.lfTranslationPracticeTc2Fix = { enabled: true, lessons: '31-45', counts, total: additions.length };
})();
