/* LinguaFlash character-level answer feedback v1
   For Chinese typed answers, highlights each entered Hanzi as correct/incorrect.
   Uses sequence alignment so one missing character does not make the rest of the sentence look wrong.
   This module is visual only: it does not change FSRS grading or accepted-answer policy.
*/
(() => {
  'use strict';

  let composing = false;
  let lastCardId = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function normalizeChinese(value) {
    return String(value == null ? '' : value)
      .normalize('NFKC')
      .toLocaleLowerCase()
      .replace(/[\s\p{P}\p{S}]+/gu, '');
  }

  function expectedCandidates(raw) {
    const source = String(raw || '').trim();
    const values = new Set([source]);
    const withoutExamples = source.split(/\b(?:ví dụ|example|例句)\s*[:：]/i)[0].trim();
    if (withoutExamples) values.add(withoutExamples);
    source.split(/[|;；\n]+/).forEach(value => {
      const clean = String(value || '').trim();
      if (clean) values.add(clean);
    });
    return [...values].map(normalizeChinese).filter(Boolean);
  }

  function currentInfo() {
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      const card = filteredDeck[currentIndex];
      if (!card) return null;
      const language = document.getElementById('studyLangFilter')?.value || card.lang || 'Tiếng Trung';
      const expected = typeof getCardTextInLanguage === 'function'
        ? getCardTextInLanguage(card, language)
        : (card.word || '');
      return { card, language, expected };
    } catch (_) {
      return null;
    }
  }

  function editDistance(a, b) {
    const aa = Array.from(a), bb = Array.from(b);
    const prev = Array.from({ length: bb.length + 1 }, (_, i) => i);
    const cur = new Array(bb.length + 1);
    for (let i = 1; i <= aa.length; i++) {
      cur[0] = i;
      for (let j = 1; j <= bb.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (aa[i - 1] === bb[j - 1] ? 0 : 1)
        );
      }
      for (let j = 0; j <= bb.length; j++) prev[j] = cur[j];
    }
    return prev[bb.length];
  }

  function bestExpected(user, rawExpected) {
    const candidates = expectedCandidates(rawExpected);
    if (!candidates.length) return '';
    let best = candidates[0];
    let bestDistance = editDistance(best, user);
    for (let i = 1; i < candidates.length; i++) {
      const distance = editDistance(candidates[i], user);
      if (distance < bestDistance) {
        best = candidates[i];
        bestDistance = distance;
      }
    }
    return best;
  }

  function align(expected, user) {
    const e = Array.from(expected);
    const u = Array.from(user);
    const rows = e.length + 1;
    const cols = u.length + 1;
    const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let i = 0; i < rows; i++) dp[i][0] = i;
    for (let j = 0; j < cols; j++) dp[0][j] = j;

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const same = e[i - 1] === u[j - 1];
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + (same ? 0 : 1),
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }

    const ops = [];
    let i = e.length;
    let j = u.length;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && e[i - 1] === u[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
        ops.push({ type: 'match', char: u[j - 1] });
        i--; j--;
        continue;
      }
      // Prefer a substitution on equal-cost paths, then a missing expected character,
      // then an extra user character. This keeps nearby correct runs visually stable.
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        ops.push({ type: 'wrong', char: u[j - 1] });
        i--; j--;
        continue;
      }
      if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        ops.push({ type: 'missing', char: '' });
        i--;
        continue;
      }
      if (j > 0) {
        ops.push({ type: 'extra', char: u[j - 1] });
        j--;
        continue;
      }
      break;
    }
    return ops.reverse();
  }

  function uiText() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      title: 'Character check', correct: 'correct', wrong: 'wrong', missing: 'missing',
      hint: 'Green = correct character · Red = wrong/extra character · □ = missing character'
    };
    if (lang === 'zh') return {
      title: '逐字检查', correct: '正确', wrong: '错误', missing: '缺少',
      hint: '绿色 = 正确 · 红色 = 错误/多余 · □ = 缺少字符'
    };
    return {
      title: 'So khớp từng chữ', correct: 'đúng', wrong: 'sai', missing: 'thiếu',
      hint: 'Xanh = đúng · Đỏ = sai/thừa · □ = thiếu chữ'
    };
  }

  function ensureStyles() {
    if (document.getElementById('lfCharacterFeedbackStyles')) return;
    const style = document.createElement('style');
    style.id = 'lfCharacterFeedbackStyles';
    style.textContent = `
      #studyCharacterFeedback{margin-top:10px;border:1px solid #dbeafe;background:#f8fafc;border-radius:14px;padding:10px 12px}
      #studyCharacterFeedback.hidden{display:none}
      .lf-char-row{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
      .lf-char{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:32px;padding:0 6px;border-radius:8px;font-size:17px;font-weight:900;line-height:1}
      .lf-char.ok{background:#d1fae5;color:#047857;border:1px solid #6ee7b7}
      .lf-char.bad{background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5}
      .lf-char.missing{background:#fff7ed;color:#c2410c;border:1px dashed #fb923c}
      .lf-char-summary{font-size:11px;font-weight:800;color:#475569}
      @media(max-width:520px){.lf-char{min-width:25px;height:29px;padding:0 5px;font-size:16px}}
    `;
    document.head.appendChild(style);
  }

  function ensureBox() {
    const panel = document.getElementById('studyAnswerPanel');
    if (!panel) return null;
    let box = document.getElementById('studyCharacterFeedback');
    if (!box) {
      box = document.createElement('div');
      box.id = 'studyCharacterFeedback';
      box.className = 'hidden';
      const inputRow = document.getElementById('studyAnswerInput')?.parentElement;
      if (inputRow) inputRow.insertAdjacentElement('afterend', box);
      else panel.appendChild(box);
    }
    return box;
  }

  function clear() {
    const box = document.getElementById('studyCharacterFeedback');
    if (!box) return;
    box.innerHTML = '';
    box.classList.add('hidden');
  }

  function render() {
    if (composing) return;
    ensureStyles();
    const box = ensureBox();
    const input = document.getElementById('studyAnswerInput');
    const info = currentInfo();
    if (!box || !input || !info || info.language !== 'Tiếng Trung') {
      clear();
      return;
    }

    const cardId = String(info.card?.id ?? '');
    if (cardId !== lastCardId) {
      lastCardId = cardId;
      clear();
    }

    const user = normalizeChinese(input.value);
    if (!user) {
      clear();
      return;
    }
    const expected = bestExpected(user, info.expected);
    if (!expected) {
      clear();
      return;
    }

    const ops = align(expected, user);
    const correct = ops.filter(op => op.type === 'match').length;
    const wrong = ops.filter(op => op.type === 'wrong' || op.type === 'extra').length;
    const missing = ops.filter(op => op.type === 'missing').length;
    const t = uiText();

    const chars = ops.map(op => {
      if (op.type === 'match') return `<span class="lf-char ok">${esc(op.char)}</span>`;
      if (op.type === 'wrong' || op.type === 'extra') return `<span class="lf-char bad">${esc(op.char)}</span>`;
      return '<span class="lf-char missing">□</span>';
    }).join('');

    box.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div class="text-xs font-extrabold text-slate-700">${esc(t.title)}</div>
        <div class="lf-char-summary">${correct}/${expected.length} ${esc(t.correct)}${wrong ? ` · ${wrong} ${esc(t.wrong)}` : ''}${missing ? ` · ${missing} ${esc(t.missing)}` : ''}</div>
      </div>
      <div class="lf-char-row">${chars}</div>
      <div class="mt-2 text-[11px] font-semibold text-slate-500">${esc(t.hint)}</div>`;
    box.classList.remove('hidden');
  }

  function moveCaretToEndAfterWrong() {
    const input = document.getElementById('studyAnswerInput');
    const feedback = document.getElementById('studyAnswerFeedback');
    const info = currentInfo();
    if (!input || !feedback || info?.language !== 'Tiếng Trung' || input.disabled) return;
    if (!feedback.className.includes('rose')) return;
    try {
      const end = input.value.length;
      input.setSelectionRange(end, end);
    } catch (_) {}
  }

  function afterCheck() {
    setTimeout(() => {
      render();
      moveCaretToEndAfterWrong();
    }, 0);
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lfCharacterFeedbackPatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      setTimeout(() => {
        const info = currentInfo();
        const id = String(info?.card?.id ?? '');
        if (id !== lastCardId) {
          lastCardId = id;
          clear();
        }
        render();
      }, 0);
      return result;
    };
    wrapped.__lfCharacterFeedbackPatched = true;
    window.renderCurrentCard = wrapped;
  }

  function bind() {
    ensureStyles();
    ensureBox();
    const input = document.getElementById('studyAnswerInput');
    if (!input || input.__lfCharacterFeedbackBound) return;
    input.__lfCharacterFeedbackBound = true;
    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; render(); });
    input.addEventListener('input', event => { if (!event.isComposing) render(); });
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#studyAnswerCheckBtn')) afterCheck();
  }, true);
  document.addEventListener('keydown', event => {
    if (event.target?.id === 'studyAnswerInput' && event.key === 'Enter') afterCheck();
  }, true);
  document.addEventListener('change', event => {
    if (event.target?.id === 'studyLangFilter') setTimeout(() => { clear(); render(); }, 0);
  }, true);

  const observer = new MutationObserver(() => {
    bind();
    ensureBox();
  });

  function init() {
    bind();
    patchRender();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(render, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
