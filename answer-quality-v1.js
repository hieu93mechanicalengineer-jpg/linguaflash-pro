/* LinguaFlash Answer Quality v1
   - Keeps Chinese typed answers Hanzi-only (Pinyin/Latin is never accepted as correct).
   - Accepts explicit aliases/synonyms only when they are stored on the card.
   - English near-typos are shown as "almost correct" and must be fixed; they do not count as an FSRS mistake.
   - Runs as a guard in front of the tested v20 answer/FSRS module.
*/
(() => {
  'use strict';

  const ALIAS_FIELDS = ['acceptedAnswers', 'aliases', 'synonyms', 'answerVariants', 'altAnswers', 'alternativeAnswers'];

  function uiText() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      near: 'Almost correct — check the spelling and try again. This does not count as a wrong FSRS attempt.',
      chineseOnly: 'Chinese answers must be typed in Hanzi. Pinyin / Latin letters are not accepted as correct.',
      englishHint: 'Minor typing slips are flagged for correction without an FSRS penalty.',
      chineseHint: 'Chinese answer: Hanzi only · Pinyin is not accepted.'
    };
    if (lang === 'zh') return {
      near: '很接近——请检查拼写后再试。本次不计入 FSRS 错误次数。',
      chineseOnly: '中文答案只接受汉字；拼音或拉丁字母不能算正确答案。',
      englishHint: '轻微打字错误会提示修改，不计入 FSRS 错误。',
      chineseHint: '中文答案：只输入汉字 · 不接受拼音。'
    };
    return {
      near: 'Gần đúng — hãy kiểm tra chính tả rồi nhập lại. Lần này không tính là sai FSRS.',
      chineseOnly: 'Đáp án tiếng Trung phải nhập bằng Hán tự. Pinyin / chữ Latin không được tính là đúng.',
      englishHint: 'Lỗi gõ nhẹ sẽ được nhắc sửa và không tính là sai FSRS.',
      chineseHint: 'Tiếng Trung: chỉ nhập Hán tự · không chấp nhận Pinyin.'
    };
  }

  function normalize(value, language) {
    let v = String(value == null ? '' : value)
      .normalize('NFKC')
      .toLocaleLowerCase()
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .trim();
    if (language === 'Tiếng Trung') return v.replace(/[\s\p{P}\p{S}]+/gu, '');
    // Apostrophe differences are formatting, not a vocabulary error (can't vs cant).
    v = v.replace(/['’]/g, '');
    v = v.replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
    if (language === 'Tiếng Anh') v = v.replace(/^to\s+/, '');
    return v;
  }

  function splitValues(raw) {
    if (Array.isArray(raw)) return raw.flatMap(splitValues);
    if (raw == null) return [];
    return String(raw).split(/[|;；\n]+|\s+\/\s+/).map(v => v.trim()).filter(Boolean);
  }

  function expectedCandidates(raw, language) {
    const source = String(raw || '').trim();
    const values = new Set([source]);
    const withoutExamples = source.split(/\b(?:ví dụ|example|例句)\s*[:：]/i)[0].trim();
    if (withoutExamples) values.add(withoutExamples);
    splitValues(source).forEach(v => values.add(v));
    if (language !== 'Tiếng Trung' && source.length < 180) {
      source.split(/\s*,\s*/).forEach(v => { if (v.trim()) values.add(v.trim()); });
    }
    return [...values].map(v => normalize(v, language)).filter(Boolean);
  }

  function aliasCandidates(card, language) {
    const values = [];
    for (const field of ALIAS_FIELDS) {
      if (card && card[field] != null) values.push(...splitValues(card[field]));
    }
    return [...new Set(values.map(v => normalize(v, language)).filter(Boolean))];
  }

  function currentInfo() {
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      const card = filteredDeck[currentIndex];
      if (!card) return null;
      const language = document.getElementById('studyLangFilter')?.value || card.lang || 'Tiếng Trung';
      const expected = typeof getCardTextInLanguage === 'function' ? getCardTextInLanguage(card, language) : (card.word || '');
      return { card, language, expected };
    } catch (_) { return null; }
  }

  function damerauLevenshtein(a, b, maxDistance = 3) {
    if (a === b) return 0;
    const al = a.length, bl = b.length;
    if (Math.abs(al - bl) > maxDistance) return maxDistance + 1;
    const prev2 = new Array(bl + 1).fill(0);
    let prev = Array.from({ length: bl + 1 }, (_, i) => i);
    let cur = new Array(bl + 1).fill(0);
    for (let i = 1; i <= al; i++) {
      cur[0] = i;
      let rowMin = cur[0];
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let value = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          value = Math.min(value, prev2[j - 2] + 1);
        }
        cur[j] = value;
        rowMin = Math.min(rowMin, value);
      }
      if (rowMin > maxDistance) return maxDistance + 1;
      for (let j = 0; j <= bl; j++) prev2[j] = prev[j];
      const temp = prev; prev = cur; cur = temp;
    }
    return prev[bl];
  }

  function isNearEnglishTypo(userRaw, candidates) {
    const user = normalize(userRaw, 'Tiếng Anh');
    if (!user || user.length < 5) return false;
    for (const candidate of candidates) {
      if (!candidate || candidate === user) continue;
      // Phrase structure must remain the same; this prevents forgiving omitted/added words.
      const ut = user.split(' '), ct = candidate.split(' ');
      if (ut.length !== ct.length) continue;
      const longest = Math.max(user.length, candidate.length);
      const threshold = longest >= 13 ? 2 : 1;
      if (Math.abs(user.length - candidate.length) > threshold) continue;
      const distance = damerauLevenshtein(user, candidate, threshold);
      if (distance > 0 && distance <= threshold && distance / longest <= 0.16) return true;
    }
    return false;
  }

  function hasLatinWithoutHanzi(value) {
    const s = String(value || '');
    return /\p{Script=Latin}/u.test(s) && !/\p{Script=Han}/u.test(s);
  }

  function feedbackBox() {
    return document.getElementById('studyAnswerFeedback');
  }

  function showNearTypo(input) {
    const feedback = feedbackBox();
    if (!feedback) return;
    feedback.className = 'mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800';
    feedback.textContent = uiText().near;
    feedback.classList.remove('hidden');
    input.classList.remove('border-rose-400', 'bg-rose-50', 'border-emerald-400', 'bg-emerald-50');
    input.classList.add('border-amber-400', 'bg-amber-50');
    input.select();
  }

  function addChineseOnlyMessage() {
    const feedback = feedbackBox();
    if (!feedback || feedback.classList.contains('hidden')) return;
    const msg = uiText().chineseOnly;
    if (!feedback.textContent.includes(msg)) feedback.textContent = `${feedback.textContent} · ${msg}`;
  }

  function updatePolicyHint() {
    const panel = document.getElementById('studyAnswerPanel');
    if (!panel) return;
    let hint = document.getElementById('studyAnswerPolicyHint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'studyAnswerPolicyHint';
      hint.className = 'mt-2 text-[11px] font-semibold text-slate-500';
      const forecast = document.getElementById('studyFsrsForecast');
      if (forecast) forecast.insertAdjacentElement('afterend', hint);
      else panel.appendChild(hint);
    }
    const info = currentInfo();
    if (!info) { hint.textContent = ''; return; }
    const t = uiText();
    hint.textContent = info.language === 'Tiếng Trung' ? t.chineseHint : t.englishHint;
    const input = document.getElementById('studyAnswerInput');
    if (input) {
      input.setAttribute('lang', info.language === 'Tiếng Trung' ? 'zh-Hans' : 'en');
      input.setAttribute('inputmode', 'text');
    }
  }

  function preflight(input) {
    const info = currentInfo();
    const raw = input?.value?.trim() || '';
    if (!info || !raw) return { block: false };

    const user = normalize(raw, info.language);
    const expected = expectedCandidates(info.expected, info.language);
    if (expected.includes(user)) return { block: false };

    const aliases = aliasCandidates(info.card, info.language);
    if (aliases.includes(user)) {
      // Feed the tested v20 grader a canonical value so its FSRS path stays unchanged.
      input.value = String(info.expected || '').trim();
      return { block: false };
    }

    if (info.language === 'Tiếng Anh' && isNearEnglishTypo(raw, expected.concat(aliases))) {
      return { block: true, reason: 'near' };
    }

    if (info.language === 'Tiếng Trung' && hasLatinWithoutHanzi(raw)) {
      return { block: false, reason: 'latin-chinese' };
    }
    return { block: false };
  }

  function guardEvent(event) {
    const input = document.getElementById('studyAnswerInput');
    if (!input) return;
    const isButton = event.type === 'click' && event.target?.closest?.('#studyAnswerCheckBtn');
    const isEnter = event.type === 'keydown' && event.target === input && event.key === 'Enter';
    if (!isButton && !isEnter) return;

    const result = preflight(input);
    if (result.block && result.reason === 'near') {
      event.preventDefault();
      event.stopImmediatePropagation();
      showNearTypo(input);
      return;
    }
    if (result.reason === 'latin-chinese') setTimeout(addChineseOnlyMessage, 0);
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lfAnswerQualityPatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      setTimeout(updatePolicyHint, 0);
      return result;
    };
    wrapped.__lfAnswerQualityPatched = true;
    window.renderCurrentCard = wrapped;
  }

  document.addEventListener('click', guardEvent, true);
  document.addEventListener('keydown', guardEvent, true);
  document.addEventListener('change', event => {
    if (event.target?.id === 'studyLangFilter') setTimeout(updatePolicyHint, 0);
  }, true);

  patchRender();
  const init = () => { patchRender(); setTimeout(updatePolicyHint, 0); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.lfAnswerQualityPolicy = {
    chineseAnswerMode: 'hanzi-only',
    pinyinAccepted: false,
    englishNearTypoPenalty: false,
    explicitAliasFields: ALIAS_FIELDS.slice()
  };
})();
