/* LinguaFlash Chunk Mode external panel v1
   Keeps the compact control under the prompt, but renders the actual chunk practice
   outside the flashcard, directly above the typed-answer panel. This avoids the
   practice UI disappearing when the card flips/re-renders. Nothing is revealed
   until the learner explicitly taps "Học theo cụm".
*/
(() => {
  'use strict';
  if (window.__LF_CHUNK_EXTERNAL_PANEL_V1__) return;
  window.__LF_CHUNK_EXTERNAL_PANEL_V1__ = true;

  const PANEL_ID = 'lfChunkPracticePanel';
  const STYLE_ID = 'lfChunkPracticePanelStyle';
  const state = { cardKey: '', open: false, index: 0, assembled: false };

  const clean = v => String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  const esc = v => clean(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function activeCard() {
    try {
      if (Array.isArray(filteredDeck) && filteredDeck.length) return filteredDeck[currentIndex] || null;
    } catch (_) {}
    return null;
  }

  function targetLanguage() {
    return document.getElementById('studyLangFilter')?.value || 'Tiếng Trung';
  }

  function targetText(card, lang) {
    try {
      if (typeof getCardTextInLanguage === 'function') return clean(getCardTextInLanguage(card, lang));
    } catch (_) {}
    if (lang === 'Tiếng Trung') return clean(card?.meaningZh || card?.chinese || card?.word);
    if (lang === 'Tiếng Anh') return clean(card?.meaningEn || card?.english || card?.word);
    return clean(card?.meaning || card?.meaningVi || card?.vietnamese || card?.word);
  }

  function chunksFor(card, text, lang) {
    try {
      if (window.lfChunkModeV1?.getChunks) return window.lfChunkModeV1.getChunks(card, text, lang) || [];
    } catch (_) {}
    return [];
  }

  function makeKey(card, lang, text) {
    return `${clean(card?.id || card?.sourceLabel || card?.topic)}::${lang}::${text}`;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{width:min(100%,760px);margin:12px auto 0;padding:12px 14px;border:1px solid #c7d2fe;border-radius:16px;background:#eef2ff;color:#1e293b;box-sizing:border-box}
      #${PANEL_ID} .lfcx-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #${PANEL_ID} .lfcx-title{font-size:13px;font-weight:900;color:#334155}
      #${PANEL_ID} .lfcx-stage{margin-top:10px;padding:12px;border:1px solid #c7d2fe;border-radius:14px;background:#fff;text-align:center}
      #${PANEL_ID} .lfcx-label{font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
      #${PANEL_ID} .lfcx-text{margin-top:6px;font-size:clamp(1.15rem,4vw,1.55rem);line-height:1.5;font-weight:900;color:#312e81;overflow-wrap:anywhere}
      #${PANEL_ID} .lfcx-map{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px}
      #${PANEL_ID} .lfcx-dot{min-width:28px;padding:4px 8px;border-radius:999px;background:#e2e8f0;font-size:12px;font-weight:800;color:#475569}
      #${PANEL_ID} .lfcx-dot.active{background:#4f46e5;color:#fff}
      #${PANEL_ID} .lfcx-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:11px}
      #${PANEL_ID} button{touch-action:manipulation;border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:10px;padding:8px 11px;font-size:12px;font-weight:800}
      #${PANEL_ID} button.primary{background:#4f46e5;border-color:#4f46e5;color:#fff}
      @media(max-width:520px){#${PANEL_ID}{padding:10px 11px}#${PANEL_ID} .lfcx-text{font-size:1.15rem}#${PANEL_ID} button{flex:1 1 auto}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    const answer = document.getElementById('studyAnswerPanel');
    if (!answer) return null;
    if (!panel) {
      panel = document.createElement('section');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-live', 'polite');
      answer.insertAdjacentElement('beforebegin', panel);
    } else if (panel.nextElementSibling !== answer) {
      answer.insertAdjacentElement('beforebegin', panel);
    }
    return panel;
  }

  function hidePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
    state.open = false;
    state.index = 0;
    state.assembled = false;
  }

  function speak(value, lang) {
    try {
      if (typeof speakText === 'function') speakText(value, lang);
    } catch (_) {}
  }

  function renderExternal() {
    if (!state.open) { hidePanel(); return; }
    ensureStyle();
    const card = activeCard();
    const lang = targetLanguage();
    const full = targetText(card, lang);
    const chunks = chunksFor(card, full, lang);
    if (!card || chunks.length < 2) { hidePanel(); return; }

    const key = makeKey(card, lang, full);
    if (state.cardKey !== key) {
      state.cardKey = key;
      state.index = 0;
      state.assembled = false;
    }

    state.index = Math.max(0, Math.min(state.index, chunks.length - 1));
    const panel = ensurePanel();
    if (!panel) return;

    const current = chunks[state.index];
    const shown = state.assembled ? chunks.join(' / ') : current;
    const label = state.assembled ? 'Ghép toàn câu' : `Cụm ${state.index + 1}/${chunks.length}`;
    const dots = chunks.map((_, i) => `<span class="lfcx-dot ${!state.assembled && i === state.index ? 'active' : ''}">${i + 1}</span>`).join('');

    panel.innerHTML = `
      <div class="lfcx-head">
        <div><div class="lfcx-title">🧩 Học theo cụm</div><div style="font-size:11px;color:#64748b;margin-top:2px">Chỉ hiện vì bạn vừa chủ động mở Chunk Mode</div></div>
        <button type="button" data-lfcx="close">Ẩn</button>
      </div>
      <div class="lfcx-stage">
        <div class="lfcx-label">${label}</div>
        <div class="lfcx-text">${esc(shown)}</div>
        <div class="lfcx-map">${dots}</div>
        <div class="lfcx-actions">
          ${!state.assembled && state.index > 0 ? '<button type="button" data-lfcx="prev">← Cụm trước</button>' : ''}
          <button type="button" data-lfcx="speak">🔊 Nghe</button>
          ${!state.assembled && state.index < chunks.length - 1 ? '<button type="button" class="primary" data-lfcx="next">Cụm tiếp →</button>' : ''}
          ${!state.assembled && state.index === chunks.length - 1 ? '<button type="button" class="primary" data-lfcx="assemble">Ghép cả câu</button>' : ''}
          ${state.assembled ? '<button type="button" data-lfcx="restart">Học lại từng cụm</button>' : ''}
        </div>
      </div>`;

    panel.onclick = event => {
      const btn = event.target.closest('[data-lfcx]');
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      const action = btn.dataset.lfcx;
      if (action === 'close') { hidePanel(); return; }
      if (action === 'prev') state.index = Math.max(0, state.index - 1);
      if (action === 'next') state.index = Math.min(chunks.length - 1, state.index + 1);
      if (action === 'assemble') state.assembled = true;
      if (action === 'restart') { state.index = 0; state.assembled = false; }
      if (action === 'speak') { speak(state.assembled ? full : chunks[state.index], lang); return; }
      renderExternal();
    };
  }

  function openFromControl(event, button) {
    const card = activeCard();
    const lang = targetLanguage();
    const full = targetText(card, lang);
    const chunks = chunksFor(card, full, lang);
    if (!card || chunks.length < 2) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    state.cardKey = makeKey(card, lang, full);
    state.open = true;
    state.index = 0;
    state.assembled = false;
    renderExternal();

    setTimeout(() => {
      document.getElementById(PANEL_ID)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 20);
  }

  document.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-lf-chunk-action="open"]');
    if (button) openFromControl(event, button);
  }, true);

  document.addEventListener('pointerup', event => {
    const button = event.target?.closest?.('[data-lf-chunk-action="open"]');
    if (!button || event.pointerType === 'mouse') return;
    openFromControl(event, button);
  }, true);

  const observer = new MutationObserver(() => {
    if (!state.open) return;
    const card = activeCard();
    const lang = targetLanguage();
    const full = targetText(card, lang);
    const key = makeKey(card, lang, full);
    if (state.cardKey && key !== state.cardKey) {
      hidePanel();
      state.cardKey = key;
      return;
    }
    if (!document.getElementById(PANEL_ID)) renderExternal();
  });

  function init() {
    ensureStyle();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
