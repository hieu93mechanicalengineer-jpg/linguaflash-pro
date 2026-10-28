/* LinguaFlash Pro · Chunk Mode v1
   Guided chunk practice for long sentence cards.
   - Only appears on long sentence cards.
   - Does not alter SRS scoring or existing card data.
   - Learner explicitly opens chunks, then can rebuild the full sentence.
*/
(() => {
  'use strict';
  if (window.__LF_CHUNK_MODE_V1__) return;
  window.__LF_CHUNK_MODE_V1__ = true;

  const PANEL_ID = 'lfChunkModePanel';
  const STYLE_ID = 'lfChunkModeStyleV1';
  const state = { cardKey: '', open: false, index: 0, assembled: false };

  function text(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return text(value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function getActiveCard() {
    try {
      if (typeof filteredDeck !== 'undefined' && Array.isArray(filteredDeck) && filteredDeck.length) {
        const idx = typeof currentIndex === 'number' ? currentIndex : 0;
        return filteredDeck[idx] || null;
      }
    } catch (_) {}
    return null;
  }

  function getTargetLanguage() {
    const select = document.getElementById('studyLangFilter');
    return select?.value || 'Tiếng Trung';
  }

  function getTargetText(card, targetLanguage) {
    try {
      if (typeof getCardTextInLanguage === 'function') {
        return text(getCardTextInLanguage(card, targetLanguage));
      }
    } catch (_) {}
    if (targetLanguage === 'Tiếng Trung') return text(card?.meaningZh || card?.chinese || card?.word);
    if (targetLanguage === 'Tiếng Anh') return text(card?.meaningEn || card?.english || card?.word);
    return text(card?.meaning || card?.meaningVi || card?.vietnamese || card?.word);
  }

  function countHanzi(value) {
    return (text(value).match(/[\u3400-\u9fff]/gu) || []).length;
  }

  function isLongSentence(card, targetText, targetLanguage) {
    if (!card || card.cardType !== 'sentence') return false;
    if (!targetText) return false;
    if (targetLanguage === 'Tiếng Trung') return countHanzi(targetText) >= 10;
    return targetText.split(/\s+/).filter(Boolean).length >= 7;
  }

  function explicitChunks(card, targetLanguage) {
    const raw = card?.chunkSegments || card?.chunks || card?.chunkMode;
    if (!raw) return null;
    if (Array.isArray(raw)) {
      const chunks = raw.map(text).filter(Boolean);
      return chunks.length >= 2 ? chunks : null;
    }
    if (typeof raw === 'object') {
      const key = targetLanguage === 'Tiếng Trung' ? 'zh' : targetLanguage === 'Tiếng Anh' ? 'en' : 'vi';
      const chosen = raw[key] || raw[targetLanguage];
      if (Array.isArray(chosen)) {
        const chunks = chosen.map(text).filter(Boolean);
        return chunks.length >= 2 ? chunks : null;
      }
      if (typeof chosen === 'string') {
        const chunks = chosen.split(/[\/｜|]/).map(text).filter(Boolean);
        return chunks.length >= 2 ? chunks : null;
      }
    }
    if (typeof raw === 'string') {
      const chunks = raw.split(/[\/｜|]/).map(text).filter(Boolean);
      return chunks.length >= 2 ? chunks : null;
    }
    return null;
  }

  function splitChineseClause(clause) {
    let value = text(clause).replace(/[。！？；，、]+$/g, '');
    if (!value) return [];
    if (countHanzi(value) <= 8) return [value];

    const result = [];

    // Split before strong logical connectors while keeping the connector with the following chunk.
    const connectorRegex = /(所以|但是|可是|不过|然后|而且|并且|或者|还是|因此|同时|另外|如果|因为|虽然|为了)/g;
    const positions = [];
    let match;
    while ((match = connectorRegex.exec(value))) {
      if (match.index >= 4 && value.length - match.index >= 4) positions.push(match.index);
    }
    if (positions.length) {
      let start = 0;
      positions.forEach(pos => {
        const piece = text(value.slice(start, pos));
        if (piece) result.push(piece);
        start = pos;
      });
      const tail = text(value.slice(start));
      if (tail) result.push(tail);
    } else {
      result.push(value);
    }

    const refined = [];
    result.forEach(piece => {
      if (countHanzi(piece) <= 8) {
        refined.push(piece);
        return;
      }

      // Natural time/location lead-in, e.g. 出货前 / 下班以后 / 进车间时.
      const lead = piece.match(/^(.{2,6}?(?:之前|之后|以前|以后|的时候|前|后|时))(.{4,})$/u);
      if (lead && countHanzi(lead[1]) >= 2 && countHanzi(lead[2]) >= 4) {
        refined.push(text(lead[1]), text(lead[2]));
        return;
      }

      // Common instruction verb phrase, e.g. 请先检查 / 安全帽和工作服.
      const instruction = piece.match(/^((?:请)?(?:先|再)?(?:检查|确认|准备|保持|完成|使用|打开|关闭|填写|提供|安排|通知|联系|处理|更换|进入|离开))(.{4,})$/u);
      if (instruction && countHanzi(instruction[2]) >= 4) {
        refined.push(text(instruction[1]), text(instruction[2]));
        return;
      }

      // Last fallback: balanced 5–7 Hanzi chunks. This is only for very long clauses.
      const chars = Array.from(piece);
      if (chars.length <= 12) {
        let cut = Math.ceil(chars.length / 2);
        cut = Math.max(4, Math.min(7, cut));
        refined.push(text(chars.slice(0, cut).join('')), text(chars.slice(cut).join('')));
        return;
      }
      for (let i = 0; i < chars.length; i += 6) {
        const part = text(chars.slice(i, i + 6).join(''));
        if (part) refined.push(part);
      }
    });

    return refined.filter(Boolean);
  }

  function splitChinese(value) {
    const source = text(value);
    const clauses = source.split(/[，,；;。！？!?：:]+/u).map(text).filter(Boolean);
    const chunks = clauses.flatMap(splitChineseClause).filter(Boolean);
    return chunks.length >= 2 ? chunks : [source];
  }

  function splitLatin(value) {
    const source = text(value);
    const primary = source
      .replace(/([,;:])/g, '$1|')
      .replace(/\b(because|so|but|however|therefore|then|before|after|when|while|if|although|because of|in order to)\b/gi, '|$1')
      .split('|')
      .map(text)
      .filter(Boolean);

    const chunks = [];
    primary.forEach(part => {
      const words = part.split(/\s+/).filter(Boolean);
      if (words.length <= 7) {
        chunks.push(part);
        return;
      }
      for (let i = 0; i < words.length; i += 6) {
        chunks.push(words.slice(i, i + 6).join(' '));
      }
    });
    return chunks.length >= 2 ? chunks : [source];
  }

  function getChunks(card, targetText, targetLanguage) {
    return explicitChunks(card, targetLanguage) ||
      (targetLanguage === 'Tiếng Trung' ? splitChinese(targetText) : splitLatin(targetText));
  }

  function cardKey(card, targetLanguage, targetText) {
    return `${text(card?.id || card?.sourceLabel || card?.topic)}::${targetLanguage}::${targetText}`;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{width:min(100%,620px);margin:.65rem auto 0;padding:.65rem .75rem;border-radius:14px;border:1px solid rgba(148,163,184,.32);background:rgba(148,163,184,.10);color:inherit;position:relative;z-index:5}
      #${PANEL_ID} button{touch-action:manipulation}
      #${PANEL_ID} .lf-chunk-head{display:flex;align-items:center;justify-content:center;gap:.45rem;flex-wrap:wrap;font-size:.76rem;font-weight:700;opacity:.9}
      #${PANEL_ID} .lf-chunk-open{border:1px solid rgba(148,163,184,.38);background:rgba(148,163,184,.18);padding:.42rem .7rem;border-radius:999px;font-weight:800;color:inherit}
      #${PANEL_ID} .lf-chunk-stage{margin-top:.55rem;padding:.65rem .75rem;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(148,163,184,.24)}
      #${PANEL_ID} .lf-chunk-label{font-size:.7rem;font-weight:800;opacity:.72;text-transform:uppercase;letter-spacing:.04em}
      #${PANEL_ID} .lf-chunk-text{font-size:clamp(1rem,2.4vw,1.35rem);line-height:1.45;font-weight:800;margin-top:.28rem;overflow-wrap:anywhere}
      #${PANEL_ID} .lf-chunk-actions{display:flex;justify-content:center;gap:.4rem;flex-wrap:wrap;margin-top:.6rem}
      #${PANEL_ID} .lf-chunk-btn{border:1px solid rgba(148,163,184,.35);background:rgba(148,163,184,.16);padding:.42rem .62rem;border-radius:10px;font-size:.78rem;font-weight:800;color:inherit}
      #${PANEL_ID} .lf-chunk-map{display:flex;justify-content:center;gap:.3rem;flex-wrap:wrap;margin-top:.55rem}
      #${PANEL_ID} .lf-chunk-chip{padding:.25rem .42rem;border-radius:8px;background:rgba(148,163,184,.16);font-size:.82rem;font-weight:700;opacity:.82}
      #${PANEL_ID} .lf-chunk-chip.active{outline:2px solid rgba(99,102,241,.55);opacity:1}
      @media(max-width:480px){#${PANEL_ID}{margin-top:.45rem;padding:.5rem .55rem}#${PANEL_ID} .lf-chunk-text{font-size:1rem}#${PANEL_ID} .lf-chunk-btn{padding:.38rem .52rem;font-size:.72rem}}
    `;
    document.head.appendChild(style);
  }

  function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function speak(value, language) {
    try {
      if (typeof speakText === 'function') {
        speakText(value, language);
        return;
      }
    } catch (_) {}
  }

  function render() {
    ensureStyle();
    const frontWord = document.getElementById('frontWord');
    if (!frontWord || !frontWord.parentElement) return;

    const card = getActiveCard();
    const targetLanguage = getTargetLanguage();
    const targetText = getTargetText(card, targetLanguage);
    let panel = document.getElementById(PANEL_ID);

    if (!isLongSentence(card, targetText, targetLanguage)) {
      if (panel) panel.remove();
      state.cardKey = '';
      state.open = false;
      state.index = 0;
      state.assembled = false;
      return;
    }

    const chunks = getChunks(card, targetText, targetLanguage);
    if (chunks.length < 2) {
      if (panel) panel.remove();
      return;
    }

    const key = cardKey(card, targetLanguage, targetText);
    if (state.cardKey !== key) {
      state.cardKey = key;
      state.open = false;
      state.index = 0;
      state.assembled = false;
    }

    if (!panel) {
      panel = document.createElement('section');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-live', 'polite');
      frontWord.insertAdjacentElement('afterend', panel);
    }

    if (!state.open) {
      panel.innerHTML = `
        <div class="lf-chunk-head">
          <span>🧩 Câu dài · ${chunks.length} cụm</span>
          <button type="button" class="lf-chunk-open" data-lf-chunk-action="open">Học theo cụm</button>
        </div>`;
    } else {
      const current = chunks[Math.max(0, Math.min(state.index, chunks.length - 1))];
      const map = chunks.map((chunk, idx) => `<span class="lf-chunk-chip ${idx === state.index && !state.assembled ? 'active' : ''}">${idx + 1}</span>`).join('');
      const stageText = state.assembled ? chunks.join(' / ') : current;
      const stageLabel = state.assembled ? 'Ghép toàn câu' : `Cụm ${state.index + 1} / ${chunks.length}`;
      panel.innerHTML = `
        <div class="lf-chunk-head"><span>🧩 Chunk Mode</span><button type="button" class="lf-chunk-btn" data-lf-chunk-action="close">Ẩn</button></div>
        <div class="lf-chunk-stage">
          <div class="lf-chunk-label">${stageLabel}</div>
          <div class="lf-chunk-text">${escapeHtml(stageText)}</div>
          <div class="lf-chunk-map">${map}</div>
          <div class="lf-chunk-actions">
            ${!state.assembled && state.index > 0 ? '<button type="button" class="lf-chunk-btn" data-lf-chunk-action="prev">← Cụm trước</button>' : ''}
            <button type="button" class="lf-chunk-btn" data-lf-chunk-action="speak">🔊 Nghe</button>
            ${!state.assembled && state.index < chunks.length - 1 ? '<button type="button" class="lf-chunk-btn" data-lf-chunk-action="next">Cụm tiếp →</button>' : ''}
            ${!state.assembled && state.index === chunks.length - 1 ? '<button type="button" class="lf-chunk-btn" data-lf-chunk-action="assemble">Ghép cả câu</button>' : ''}
            ${state.assembled ? '<button type="button" class="lf-chunk-btn" data-lf-chunk-action="restart">Học lại từng cụm</button>' : ''}
          </div>
        </div>`;
    }

    panel.onclick = event => {
      const button = event.target.closest('[data-lf-chunk-action]');
      if (!button) return;
      stopEvent(event);
      const action = button.dataset.lfChunkAction;
      if (action === 'open') { state.open = true; state.index = 0; state.assembled = false; }
      if (action === 'close') { state.open = false; state.index = 0; state.assembled = false; }
      if (action === 'prev') { state.index = Math.max(0, state.index - 1); state.assembled = false; }
      if (action === 'next') { state.index = Math.min(chunks.length - 1, state.index + 1); state.assembled = false; }
      if (action === 'assemble') { state.assembled = true; }
      if (action === 'restart') { state.index = 0; state.assembled = false; }
      if (action === 'speak') {
        speak(state.assembled ? targetText : chunks[state.index], targetLanguage);
        return;
      }
      render();
    };

    panel.onpointerdown = event => event.stopPropagation();
  }

  let queued = false;
  function queueRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }

  const observer = new MutationObserver(queueRender);
  function start() {
    const root = document.getElementById('flashcardContainer') || document.body;
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    queueRender();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  window.lfChunkModeV1 = {
    render: queueRender,
    splitChinese,
    splitLatin,
    getChunks
  };
})();
