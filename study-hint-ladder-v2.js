/* LinguaFlash Pro · Hint Ladder v2
   Progressive hints for typed Chinese recall.
   This module intentionally contains NO Chunk Mode.
*/
(() => {
  'use strict';
  if (window.__LF_HINT_LADDER_V2__) return;
  window.__LF_HINT_LADDER_V2__ = true;

  const PANEL_ID = 'lfHintLadder';
  const STYLE_ID = 'lfHintLadderStyleV2';
  let lastHintCardId = null;

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  function uiLang() {
    try { return typeof currentUiLang === 'string' ? currentUiLang : 'vi'; }
    catch (_) { return 'vi'; }
  }

  function labels() {
    const lang = uiLang();
    if (lang === 'en') return {
      title: 'Hint Ladder',
      h1: 'Step 1 · Wrong or missing characters are highlighted above.',
      h2: n => `Step 2 · You are missing ${n} character${n === 1 ? '' : 's'}. Check the red characters too.`,
      h3: c => `Step 3 · First character: ${c}`,
      h4: a => `Step 4 · Full answer: ${a}`,
      forgotten: 'This card now counts as not remembered for scheduling.'
    };
    if (lang === 'zh') return {
      title: '渐进提示',
      h1: '第 1 步 · 上方已标出错误或缺少的字。',
      h2: n => `第 2 步 · 还缺 ${n} 个字；也请检查红色字符。`,
      h3: c => `第 3 步 · 第一个字：${c}`,
      h4: a => `第 4 步 · 完整答案：${a}`,
      forgotten: '这张卡将按“未记住”安排复习。'
    };
    return {
      title: 'Gợi ý từng bước',
      h1: 'Bước 1 · Các chữ sai hoặc thiếu đã được đánh dấu ở phía trên.',
      h2: n => `Bước 2 · Bạn còn thiếu ${n} chữ. Đồng thời kiểm tra các chữ màu đỏ.`,
      h3: c => `Bước 3 · Chữ đầu tiên: ${c}`,
      h4: a => `Bước 4 · Đáp án đầy đủ: ${a}`,
      forgotten: 'Thẻ này sẽ được tính là chưa nhớ khi xếp lịch ôn.'
    };
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
      return { card, language, expected: String(expected || '').trim() };
    } catch (_) {
      return null;
    }
  }

  function answerText(raw) {
    let source = String(raw || '').trim();
    source = source.split(/\b(?:ví dụ|example|例句)\s*[:：]/i)[0].trim();
    source = source.split(/[|;；\n]+/)[0].trim();
    return source;
  }

  function hanziOnly(value) {
    return Array.from(String(value || '').normalize('NFKC'))
      .filter(ch => /[\u3400-\u9fff]/u.test(ch))
      .join('');
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{width:min(100%,760px);margin:10px auto 0;border-radius:16px;padding:12px 14px;border:1px solid #fde68a;background:#fffbeb}
      #${PANEL_ID}.lf-hidden{display:none!important}
      #${PANEL_ID} .lf-hint-title{font-size:12px;font-weight:900;color:#334155;letter-spacing:.02em}
      #${PANEL_ID} .lf-hint-answer{margin-top:8px;font-size:1.05rem;font-weight:900;color:#92400e;overflow-wrap:anywhere}
      #${PANEL_ID} .lf-hint-sub{font-size:11px;font-weight:650;color:#64748b;margin-top:4px}
      @media(max-width:520px){#${PANEL_ID}{padding:10px 11px;border-radius:14px}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    const host = document.getElementById('studyAnswerPanel') || document.getElementById('flashcardContainer');
    if (!host) return null;
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.className = 'lf-hidden';
      if (host.id === 'studyAnswerPanel') host.insertAdjacentElement('afterend', panel);
      else host.appendChild(panel);
    }
    return panel;
  }

  function wrongAttemptsFromUi() {
    const wrong = document.getElementById('studyWrongCount');
    const raw = String(wrong?.textContent || '');
    const match = raw.match(/(\d+)\s*[×x]/i) || raw.match(/(?:wrong attempts|错误次数|số lần sai)\D*(\d+)/i);
    return match ? Number(match[1]) || 0 : 0;
  }

  function renderHints() {
    ensureStyle();
    const panel = ensurePanel();
    const info = currentInfo();
    if (!panel || !info || info.language !== 'Tiếng Trung') {
      if (panel) panel.classList.add('lf-hidden');
      return;
    }

    const id = String(info.card?.id ?? '');
    if (id !== lastHintCardId) {
      lastHintCardId = id;
      panel.innerHTML = '';
      panel.classList.add('lf-hidden');
    }

    const attempts = wrongAttemptsFromUi();
    const feedback = document.getElementById('studyAnswerFeedback');
    const isWrong = !!feedback && !feedback.classList.contains('hidden') && /rose/.test(feedback.className);
    if (!isWrong || attempts <= 0) {
      panel.classList.add('lf-hidden');
      return;
    }

    const t = labels();
    const expectedRaw = answerText(info.expected);
    const expected = hanziOnly(expectedRaw);
    const input = hanziOnly(document.getElementById('studyAnswerInput')?.value || '');
    const missing = Math.max(0, expected.length - input.length);
    const first = Array.from(expected)[0] || Array.from(expectedRaw)[0] || '';

    let body = '';
    if (attempts === 1) body = esc(t.h1);
    else if (attempts === 2) body = esc(t.h2(missing));
    else if (attempts === 3) body = esc(t.h3(first));
    else body = `<div>${esc(t.h4(expectedRaw))}</div><div class="lf-hint-sub">${esc(t.forgotten)}</div>`;

    panel.innerHTML = `<div class="lf-hint-title">💡 ${esc(t.title)}</div><div class="lf-hint-answer">${body}</div>`;
    panel.classList.remove('lf-hidden');
  }

  function afterAnswerCheck() {
    setTimeout(renderHints, 0);
  }

  function resetOnCardChange() {
    setTimeout(() => {
      const info = currentInfo();
      const id = String(info?.card?.id ?? '');
      if (id !== lastHintCardId) {
        const panel = document.getElementById(PANEL_ID);
        if (panel) panel.classList.add('lf-hidden');
      }
      renderHints();
    }, 0);
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lfHintLadderV2Patched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      resetOnCardChange();
      return result;
    };
    wrapped.__lfHintLadderV2Patched = true;
    window.renderCurrentCard = wrapped;
  }

  document.addEventListener('click', event => {
    const target = event.target?.closest?.('button,[role="button"]');
    if (target?.matches('#studyAnswerCheckBtn')) afterAnswerCheck();
  }, true);

  document.addEventListener('keydown', event => {
    if (event.target?.id === 'studyAnswerInput' && event.key === 'Enter') afterAnswerCheck();
  }, true);

  document.addEventListener('change', event => {
    if (event.target?.id === 'studyLangFilter') resetOnCardChange();
  }, true);

  const observer = new MutationObserver(() => {
    ensurePanel();
    patchRender();
  });

  function init() {
    ensureStyle();
    document.getElementById('lfChunkPanel')?.remove();
    ensurePanel();
    patchRender();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(renderHints, 80);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
