/* LinguaFlash guided recall v1
   Adds two study helpers without changing core FSRS grading:
   1) Chunk Mode for long Chinese sentences.
   2) Progressive Hint Ladder after repeated wrong typed answers.
*/
(() => {
  'use strict';
  if (window.__LF_GUIDED_RECALL_V1__) return;
  window.__LF_GUIDED_RECALL_V1__ = true;

  let chunkCardId = null;
  let chunkIndex = 0;
  let chunkExpanded = false;
  let lastHintCardId = null;

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  function uiLang() {
    try { return typeof currentUiLang === 'string' ? currentUiLang : 'vi'; }
    catch (_) { return 'vi'; }
  }

  function text() {
    const lang = uiLang();
    if (lang === 'en') return {
      chunkTitle: 'Chunk Mode', chunkDesc: 'Learn the sentence in short chunks, then rebuild the full sentence.',
      openChunks: 'Learn by chunks', newAuto: 'New long sentence · chunk practice opened automatically',
      listen: 'Listen', prev: 'Previous', next: 'Next chunk', combine: 'Combine sentence', recall: 'Start recall',
      chunkOf: (i, n) => `Chunk ${i}/${n}`,
      hintTitle: 'Hint Ladder', h1: 'Step 1 · Wrong or missing characters are highlighted above.',
      h2: n => `Step 2 · You are missing ${n} character${n === 1 ? '' : 's'}. Check the red characters too.`,
      h3: c => `Step 3 · First character: ${c}`,
      h4: a => `Step 4 · Full answer: ${a}`, forgotten: 'This card now counts as not remembered for scheduling.'
    };
    if (lang === 'zh') return {
      chunkTitle: '分块学习', chunkDesc: '先学短语块，再把整句连起来。',
      openChunks: '按短语学习', newAuto: '新长句 · 已自动打开分块练习',
      listen: '听', prev: '上一块', next: '下一块', combine: '合并整句', recall: '开始回忆',
      chunkOf: (i, n) => `第 ${i}/${n} 块`,
      hintTitle: '渐进提示', h1: '第 1 步 · 上方已标出错误或缺少的字。',
      h2: n => `第 2 步 · 还缺 ${n} 个字；也请检查红色字符。`,
      h3: c => `第 3 步 · 第一个字：${c}`,
      h4: a => `第 4 步 · 完整答案：${a}`, forgotten: '这张卡将按“未记住”安排复习。'
    };
    return {
      chunkTitle: 'Chia câu', chunkDesc: 'Học từng cụm ngắn trước, sau đó ghép lại thành câu hoàn chỉnh.',
      openChunks: 'Học theo cụm', newAuto: 'Câu dài mới · đã tự mở luyện theo cụm',
      listen: 'Nghe', prev: 'Cụm trước', next: 'Cụm tiếp', combine: 'Ghép cả câu', recall: 'Bắt đầu nhớ lại',
      chunkOf: (i, n) => `Cụm ${i}/${n}`,
      hintTitle: 'Gợi ý từng bước', h1: 'Bước 1 · Các chữ sai hoặc thiếu đã được đánh dấu ở phía trên.',
      h2: n => `Bước 2 · Bạn còn thiếu ${n} chữ. Đồng thời kiểm tra các chữ màu đỏ.`,
      h3: c => `Bước 3 · Chữ đầu tiên: ${c}`,
      h4: a => `Bước 4 · Đáp án đầy đủ: ${a}`, forgotten: 'Thẻ này sẽ được tính là chưa nhớ khi xếp lịch ôn.'
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
    return Array.from(String(value || '').normalize('NFKC')).filter(ch => /[\u3400-\u9fff]/u.test(ch)).join('');
  }

  function isLongChinese(info) {
    if (!info || info.language !== 'Tiếng Trung') return false;
    return hanziOnly(answerText(info.expected)).length >= 10;
  }

  function splitBalanced(segment, maxLen = 10) {
    const chars = Array.from(segment).filter(ch => !/[，。！？；、,.!?;\s]/u.test(ch));
    if (chars.length <= maxLen) return [chars.join('')];
    const out = [];
    let start = 0;
    while (chars.length - start > maxLen) {
      const remain = chars.length - start;
      let size = Math.min(maxLen, Math.ceil(remain / Math.ceil(remain / maxLen)));
      if (remain - size < 3) size = remain - 3;
      out.push(chars.slice(start, start + size).join(''));
      start += size;
    }
    if (start < chars.length) out.push(chars.slice(start).join(''));
    return out.filter(Boolean);
  }

  function buildChunks(raw) {
    let sentence = answerText(raw).replace(/[。！？!?]+$/u, '').trim();
    if (!sentence) return [];

    const explicit = sentence.split(/[\/／｜|]+/u).map(s => s.trim()).filter(Boolean);
    if (explicit.length > 1) return explicit.flatMap(s => splitBalanced(s));

    sentence = sentence.replace(/[，；、,;]+/gu, '|');
    sentence = sentence.replace(/(为了[\u3400-\u9fff]{2,7}?)(?=(?:出货|发货|生产|包装|安装|检查|上班|下班|进厂|进车间|交货|开工))/gu, '$1|');
    sentence = sentence.replace(/([\u3400-\u9fff]{2,9}?(?:之前|以后|以前|之后|的时候|前|后|时))(?=(?:要|需要|必须|应该|可以|不能|不要|请|再|先|才|就))/gu, '$1|');
    sentence = sentence.replace(/([\u3400-\u9fff]{4,10})(?=(?:需要|必须|应该|不能|不要|请|然后|再))/gu, '$1|');

    const rawParts = sentence.split('|').map(s => s.trim()).filter(Boolean);
    const chunks = rawParts.flatMap(part => splitBalanced(part));
    return chunks.length > 1 ? chunks : splitBalanced(answerText(raw), 10);
  }

  function ensureStyles() {
    if (document.getElementById('lfGuidedRecallStyles')) return;
    const style = document.createElement('style');
    style.id = 'lfGuidedRecallStyles';
    style.textContent = `
      #lfChunkPanel,#lfHintLadder{width:min(100%,760px);margin:10px auto 0;border-radius:16px;padding:12px 14px}
      #lfChunkPanel{border:1px solid #c7d2fe;background:#eef2ff}
      #lfHintLadder{border:1px solid #fde68a;background:#fffbeb}
      .lf-gr-title{font-size:12px;font-weight:900;color:#334155;letter-spacing:.02em}
      .lf-gr-sub{font-size:11px;font-weight:650;color:#64748b;margin-top:2px}
      .lf-chunk-main{margin-top:10px;min-height:52px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(1.2rem,4vw,1.7rem);font-weight:900;color:#312e81;background:white;border:1px solid #c7d2fe;border-radius:14px;padding:10px}
      .lf-chunk-all{margin-top:8px;font-size:clamp(1rem,3.4vw,1.25rem);font-weight:850;color:#1e293b;line-height:1.7;text-align:center}
      .lf-gr-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
      .lf-gr-btn{border:1px solid #cbd5e1;background:white;border-radius:10px;padding:7px 10px;font-size:12px;font-weight:800;color:#334155}
      .lf-gr-btn.primary{background:#4338ca;color:white;border-color:#4338ca}
      .lf-gr-btn:disabled{opacity:.45}
      .lf-hint-answer{margin-top:8px;font-size:1.05rem;font-weight:900;color:#92400e;overflow-wrap:anywhere}
      .lf-hidden{display:none!important}
      @media(max-width:520px){#lfChunkPanel,#lfHintLadder{padding:10px 11px;border-radius:14px}.lf-gr-actions{gap:6px}.lf-gr-btn{flex:1 1 auto;padding:8px 7px}}
    `;
    document.head.appendChild(style);
  }

  function hostForPanels() {
    return document.getElementById('studyAnswerPanel') || document.getElementById('flashcardContainer');
  }

  function ensureChunkPanel() {
    const host = hostForPanels();
    if (!host) return null;
    let panel = document.getElementById('lfChunkPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'lfChunkPanel';
      panel.className = 'lf-hidden';
      if (host.id === 'studyAnswerPanel') host.insertAdjacentElement('beforebegin', panel);
      else host.appendChild(panel);
    }
    return panel;
  }

  function ensureHintPanel() {
    const host = document.getElementById('studyAnswerPanel') || hostForPanels();
    if (!host) return null;
    let panel = document.getElementById('lfHintLadder');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'lfHintLadder';
      panel.className = 'lf-hidden';
      if (host.id === 'studyAnswerPanel') host.insertAdjacentElement('afterend', panel);
      else host.appendChild(panel);
    }
    return panel;
  }

  function isNewCard(card) {
    return !(Number(card?.reviewCount) > 0 || Number(card?.repetitions) > 0 || Number(card?.lastReview) > 0 || Number(card?.lastReviewedAt) > 0);
  }

  function renderChunkPanel(forceOpen = false) {
    ensureStyles();
    const panel = ensureChunkPanel();
    const info = currentInfo();
    if (!panel || !isLongChinese(info)) {
      if (panel) panel.classList.add('lf-hidden');
      return;
    }

    const id = String(info.card?.id ?? '');
    const chunks = buildChunks(info.expected);
    if (chunks.length < 2) {
      panel.classList.add('lf-hidden');
      return;
    }

    if (id !== chunkCardId) {
      chunkCardId = id;
      chunkIndex = 0;
      chunkExpanded = isNewCard(info.card);
    }
    if (forceOpen) chunkExpanded = true;

    const t = text();
    if (!chunkExpanded) {
      panel.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <div><div class="lf-gr-title">🧩 ${esc(t.chunkTitle)}</div><div class="lf-gr-sub">${esc(t.chunkDesc)}</div></div>
          <button type="button" class="lf-gr-btn primary" data-lf-chunk-open>${esc(t.openChunks)}</button>
        </div>`;
      panel.classList.remove('lf-hidden');
      return;
    }

    chunkIndex = Math.max(0, Math.min(chunkIndex, chunks.length - 1));
    const current = chunks[chunkIndex];
    const atLast = chunkIndex === chunks.length - 1;
    panel.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div><div class="lf-gr-title">🧩 ${esc(t.chunkTitle)} · ${esc(t.chunkOf(chunkIndex + 1, chunks.length))}</div>
        <div class="lf-gr-sub">${esc(isNewCard(info.card) ? t.newAuto : t.chunkDesc)}</div></div>
      </div>
      <div class="lf-chunk-main">${esc(current)}</div>
      ${atLast ? `<div class="lf-chunk-all">${chunks.map(esc).join(' <span aria-hidden="true">/</span> ')}</div>` : ''}
      <div class="lf-gr-actions">
        <button type="button" class="lf-gr-btn" data-lf-chunk-prev ${chunkIndex === 0 ? 'disabled' : ''}>← ${esc(t.prev)}</button>
        <button type="button" class="lf-gr-btn" data-lf-chunk-listen>🔊 ${esc(t.listen)}</button>
        ${!atLast
          ? `<button type="button" class="lf-gr-btn primary" data-lf-chunk-next>${esc(t.next)} →</button>`
          : `<button type="button" class="lf-gr-btn primary" data-lf-chunk-recall>${esc(t.recall)} →</button>`}
      </div>`;
    panel.classList.remove('lf-hidden');
  }

  function listenChunk() {
    const info = currentInfo();
    if (!isLongChinese(info)) return;
    const chunks = buildChunks(info.expected);
    const value = chunks[chunkIndex] || '';
    if (!value) return;
    try {
      if (typeof speakText === 'function') speakText(value, 'Tiếng Trung');
      else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(value);
        utter.lang = 'zh-CN';
        utter.rate = 0.88;
        window.speechSynthesis.speak(utter);
      }
    } catch (_) {}
  }

  function startRecall() {
    chunkExpanded = false;
    const panel = document.getElementById('lfChunkPanel');
    if (panel) panel.classList.add('lf-hidden');
    const input = document.getElementById('studyAnswerInput');
    if (input && !input.disabled) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
    }
  }

  function wrongAttemptsFromUi() {
    const wrong = document.getElementById('studyWrongCount');
    const raw = String(wrong?.textContent || '');
    const match = raw.match(/(\d+)\s*[×x]/i) || raw.match(/(?:wrong attempts|错误次数|số lần sai)\D*(\d+)/i);
    return match ? Number(match[1]) || 0 : 0;
  }

  function renderHints() {
    ensureStyles();
    const panel = ensureHintPanel();
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

    const t = text();
    const expectedRaw = answerText(info.expected);
    const expected = hanziOnly(expectedRaw);
    const input = hanziOnly(document.getElementById('studyAnswerInput')?.value || '');
    const missing = Math.max(0, expected.length - input.length);
    const first = Array.from(expected)[0] || Array.from(expectedRaw)[0] || '';

    let body = '';
    if (attempts === 1) body = esc(t.h1);
    else if (attempts === 2) body = esc(t.h2(missing));
    else if (attempts === 3) body = `${esc(t.h3(first))}`;
    else body = `<div>${esc(t.h4(expectedRaw))}</div><div class="lf-gr-sub mt-1">${esc(t.forgotten)}</div>`;

    panel.innerHTML = `<div class="lf-gr-title">💡 ${esc(t.hintTitle)}</div><div class="lf-hint-answer">${body}</div>`;
    panel.classList.remove('lf-hidden');
  }

  function afterAnswerCheck() {
    setTimeout(() => {
      renderHints();
      renderChunkPanel(false);
    }, 0);
  }

  function resetOnCardChange() {
    setTimeout(() => {
      const info = currentInfo();
      const id = String(info?.card?.id ?? '');
      if (id !== lastHintCardId) {
        const hint = document.getElementById('lfHintLadder');
        if (hint) hint.classList.add('lf-hidden');
      }
      renderChunkPanel(false);
      renderHints();
    }, 0);
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lfGuidedRecallPatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      resetOnCardChange();
      return result;
    };
    wrapped.__lfGuidedRecallPatched = true;
    window.renderCurrentCard = wrapped;
  }

  document.addEventListener('click', event => {
    const target = event.target?.closest?.('button,[role="button"]');
    if (!target) return;
    if (target.matches('#studyAnswerCheckBtn')) afterAnswerCheck();
    else if (target.matches('[data-lf-chunk-open]')) renderChunkPanel(true);
    else if (target.matches('[data-lf-chunk-prev]')) { chunkIndex -= 1; renderChunkPanel(true); }
    else if (target.matches('[data-lf-chunk-next]')) { chunkIndex += 1; renderChunkPanel(true); }
    else if (target.matches('[data-lf-chunk-listen]')) listenChunk();
    else if (target.matches('[data-lf-chunk-recall]')) startRecall();
  }, true);

  document.addEventListener('keydown', event => {
    if (event.target?.id === 'studyAnswerInput' && event.key === 'Enter') afterAnswerCheck();
  }, true);

  document.addEventListener('change', event => {
    if (event.target?.id === 'studyLangFilter') resetOnCardChange();
  }, true);

  const observer = new MutationObserver(() => {
    ensureChunkPanel();
    ensureHintPanel();
    patchRender();
  });

  function init() {
    ensureStyles();
    ensureChunkPanel();
    ensureHintPanel();
    patchRender();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => { renderChunkPanel(false); renderHints(); }, 80);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
