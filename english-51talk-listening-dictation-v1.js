/* LinguaFlash · 51Talk Listening Dictation v1
   Beginner-friendly listening practice derived only from the user's 51Talk lesson cards.
   - Listen at 0.75x / 1.0x / 1.1x
   - Listen 3 times
   - Type what you hear
   - Word-level comparison + IPA + Vietnamese meaning after checking
   - Does not change SRS/FSRS grading
*/
(() => {
  'use strict';
  if (window.__LF_51TALK_LISTENING_DICTATION_V1__) return;
  window.__LF_51TALK_LISTENING_DICTATION_V1__ = true;

  let lessonKey = '';
  let pool = [];
  let index = 0;
  let checked = false;
  let correctCount = 0;
  let attemptCount = 0;

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalizeApostrophe = value => String(value || '').replace(/[’‘`]/g, "'");
  const normalizeText = value => normalizeApostrophe(value)
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = value => normalizeText(value).split(' ').filter(Boolean);

  function is51Talk(card) {
    return !!card && (String(card.id || '').startsWith('en51_') || card.category === '51Talk English');
  }

  function lessonFromCard(card) {
    const id = String(card?.id || '');
    if (id.includes('20261028')) return '2026-10-28';
    if (id.includes('20261029')) return '2026-10-29';
    return '';
  }

  function currentCard() {
    try { return Array.isArray(filteredDeck) && filteredDeck.length ? filteredDeck[currentIndex] : null; }
    catch (_) { return null; }
  }

  function all51TalkCards() {
    const lists = [];
    try { if (typeof allCards !== 'undefined' && Array.isArray(allCards)) lists.push(allCards); } catch (_) {}
    try { if (typeof DEFAULT_CARDS !== 'undefined' && Array.isArray(DEFAULT_CARDS)) lists.push(DEFAULT_CARDS); } catch (_) {}
    if (Array.isArray(window.LF_51TALK_ENGLISH_CARDS_V1)) lists.push(window.LF_51TALK_ENGLISH_CARDS_V1);
    const out = [], ids = new Set();
    lists.flat().forEach(card => {
      if (!is51Talk(card)) return;
      const key = String(card.id || '') + '|' + String(card.word || '');
      if (ids.has(key)) return;
      ids.add(key);
      out.push(card);
    });
    return out;
  }

  function entryFromCard(card) {
    if (!card || !is51Talk(card)) return null;
    if (card.cardType === 'sentence') {
      const en = String(card.chinese || '').trim();
      if (!en) return null;
      return {
        id: card.id + ':sentence', cardId: card.id, en,
        vi: String(card.word || '').trim(),
        ipa: String(card.phonetic || '').trim(),
        label: String(card.sourceLabel || 'Câu trong bài').trim(),
        lesson: lessonFromCard(card)
      };
    }
    const en = String(card.example || '').trim();
    if (!en || en.length < 8) return null;
    return {
      id: card.id + ':example', cardId: card.id, en,
      vi: String(card.exampleTrans || '').trim(),
      ipa: String(card.exampleIpa || '').trim(),
      label: String(card.sourceLabel || card.word || 'Ví dụ trong bài').trim(),
      lesson: lessonFromCard(card)
    };
  }

  function buildPool(key) {
    const seen = new Set(), entries = [];
    all51TalkCards().forEach(card => {
      const entry = entryFromCard(card);
      if (!entry || entry.lesson !== key) return;
      const sentenceKey = normalizeText(entry.en);
      if (!sentenceKey || seen.has(sentenceKey)) return;
      seen.add(sentenceKey);
      entries.push(entry);
    });
    return entries;
  }

  function ensureStyle() {
    if (document.getElementById('lf51ListeningStyle')) return;
    const style = document.createElement('style');
    style.id = 'lf51ListeningStyle';
    style.textContent = `
      #lf51Listening{width:min(100%,760px);margin:12px auto 0;border:1px solid #bae6fd;background:linear-gradient(135deg,#f0f9ff,#fff);border-radius:18px;padding:14px;box-shadow:0 8px 24px rgba(15,23,42,.04)}
      #lf51Listening.hidden{display:none!important}.lf51l-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap}.lf51l-title{font-weight:900;color:#075985}.lf51l-sub{font-size:.78rem;color:#64748b;margin-top:2px}.lf51l-score{font-size:.75rem;font-weight:850;color:#0369a1;background:#e0f2fe;border-radius:999px;padding:5px 8px}
      .lf51l-controls{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.lf51l-btn{border:1px solid #bae6fd;background:#fff;color:#075985;border-radius:11px;padding:8px 10px;font-size:.78rem;font-weight:850}.lf51l-btn.primary{background:#0284c7;color:#fff;border-color:#0284c7}.lf51l-btn.active{background:#e0f2fe;border-color:#38bdf8}.lf51l-btn:disabled{opacity:.5}
      .lf51l-prompt{margin-top:10px;border:1px dashed #7dd3fc;background:#f8fdff;border-radius:13px;padding:11px}.lf51l-prompt-label{font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:#0284c7}.lf51l-hidden-text{font-weight:850;color:#334155;margin-top:4px}
      .lf51l-inputrow{display:flex;gap:8px;margin-top:9px}.lf51l-inputrow textarea{flex:1;min-width:0;min-height:82px;resize:vertical;border:2px solid #cbd5e1;border-radius:13px;padding:10px 12px;font-size:1rem;line-height:1.45;outline:none}.lf51l-inputrow textarea:focus{border-color:#0ea5e9}.lf51l-check{align-self:stretch;border:0;border-radius:13px;padding:10px 15px;background:#0284c7;color:#fff;font-weight:900;white-space:nowrap}
      .lf51l-result{display:none;margin-top:10px}.lf51l-result.show{display:block}.lf51l-answer{border-radius:13px;background:#fff;border:1px solid #e2e8f0;padding:10px 11px}.lf51l-answer-en{font-weight:900;color:#0f172a;line-height:1.55}.lf51l-ipa{font-size:.8rem;color:#4f46e5;margin-top:4px;line-height:1.5}.lf51l-vi{font-size:.82rem;color:#64748b;margin-top:4px;line-height:1.5}.lf51l-diff{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.lf51l-token{border-radius:8px;padding:4px 7px;font-size:.78rem;font-weight:850}.lf51l-token.ok{background:#dcfce7;color:#166534}.lf51l-token.bad{background:#fee2e2;color:#991b1b}.lf51l-token.missing{background:#fef3c7;color:#92400e}.lf51l-token.extra{background:#f3e8ff;color:#6b21a8;text-decoration:line-through}.lf51l-msg{margin-top:8px;border-radius:11px;padding:8px 10px;font-size:.8rem;font-weight:750}.lf51l-msg.ok{background:#ecfdf5;color:#065f46}.lf51l-msg.bad{background:#fff7ed;color:#9a3412}
      .lf51l-bottom{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.lf51l-bottom button{border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:7px 10px;font-size:.76rem;font-weight:850;color:#334155}
      @media(max-width:520px){#lf51Listening{padding:11px;border-radius:15px}.lf51l-inputrow{flex-direction:column}.lf51l-check{width:100%;min-height:46px}.lf51l-controls .lf51l-btn{flex:1 1 auto}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    let panel = document.getElementById('lf51Listening');
    if (panel) return panel;
    const anchor = document.getElementById('lf51PatternPractice') || document.getElementById('lf51GrammarPanel') || document.getElementById('studyAnswerPanel') || document.getElementById('flashcardContainer');
    if (!anchor) return null;
    panel = document.createElement('section');
    panel.id = 'lf51Listening';
    panel.className = 'hidden';
    if (anchor.id === 'lf51PatternPractice' || anchor.id === 'lf51GrammarPanel') anchor.insertAdjacentElement('afterend', panel);
    else anchor.appendChild(panel);
    return panel;
  }

  function chooseVoice() {
    try {
      const voices = speechSynthesis.getVoices?.() || [];
      return voices.find(v => /^en-US$/i.test(v.lang) && /Samantha|Ava|Jenny|Aria|Google US English|Microsoft/i.test(v.name))
        || voices.find(v => /^en-US/i.test(v.lang))
        || voices.find(v => /^en/i.test(v.lang))
        || null;
    } catch (_) { return null; }
  }

  function speak(text, rate = 1, repeat = 1) {
    const value = String(text || '').trim();
    if (!value || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); } catch (_) {}
    let remaining = Math.max(1, Number(repeat) || 1);
    const playOne = () => {
      if (remaining <= 0) return;
      const utter = new SpeechSynthesisUtterance(value);
      utter.lang = 'en-US';
      utter.rate = Math.max(.6, Math.min(1.2, Number(rate) || 1));
      utter.pitch = 1;
      const voice = chooseVoice(); if (voice) utter.voice = voice;
      remaining -= 1;
      utter.onend = () => { if (remaining > 0) setTimeout(playOne, 420); };
      speechSynthesis.speak(utter);
    };
    playOne();
  }

  function currentEntry() { return pool[index] || null; }

  function alignWords(expectedTokens, userTokens) {
    const n = expectedTokens.length, m = userTokens.length;
    const dp = Array.from({length:n+1},()=>Array(m+1).fill(0));
    for(let i=0;i<=n;i++) dp[i][0]=i;
    for(let j=0;j<=m;j++) dp[0][j]=j;
    for(let i=1;i<=n;i++) for(let j=1;j<=m;j++) {
      const cost = expectedTokens[i-1] === userTokens[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
    const out=[]; let i=n,j=m;
    while(i>0||j>0){
      if(i>0&&j>0&&expectedTokens[i-1]===userTokens[j-1]&&dp[i][j]===dp[i-1][j-1]){out.push({type:'ok',expected:expectedTokens[i-1],user:userTokens[j-1]});i--;j--;continue;}
      if(i>0&&j>0&&dp[i][j]===dp[i-1][j-1]+1){out.push({type:'bad',expected:expectedTokens[i-1],user:userTokens[j-1]});i--;j--;continue;}
      if(i>0&&dp[i][j]===dp[i-1][j]+1){out.push({type:'missing',expected:expectedTokens[i-1],user:''});i--;continue;}
      if(j>0){out.push({type:'extra',expected:'',user:userTokens[j-1]});j--;continue;}
    }
    return out.reverse();
  }

  function renderDiff(answer, user) {
    const aligned = alignWords(tokens(answer), tokens(user));
    return aligned.map(item => {
      if(item.type==='ok') return `<span class="lf51l-token ok">${esc(item.expected)}</span>`;
      if(item.type==='bad') return `<span class="lf51l-token bad" title="Bạn nhập: ${esc(item.user)}">${esc(item.expected)}</span>`;
      if(item.type==='missing') return `<span class="lf51l-token missing" title="Thiếu từ">+ ${esc(item.expected)}</span>`;
      return `<span class="lf51l-token extra" title="Từ dư">${esc(item.user)}</span>`;
    }).join('');
  }

  function resetQuestion(preferCardId = '') {
    checked = false;
    if (!pool.length) return;
    if (preferCardId) {
      const found = pool.findIndex(entry => entry.cardId === preferCardId);
      if (found >= 0) index = found;
    }
    index = Math.max(0, Math.min(index, pool.length - 1));
    render();
  }

  function render() {
    ensureStyle();
    const panel = ensurePanel();
    const card = currentCard();
    if (!panel || !is51Talk(card)) { if(panel) panel.classList.add('hidden'); return; }

    const key = lessonFromCard(card);
    if (!key) { panel.classList.add('hidden'); return; }
    if (key !== lessonKey || !pool.length) {
      lessonKey = key;
      pool = buildPool(key);
      index = 0;
      const preferred = pool.findIndex(x => x.cardId === card.id);
      if (preferred >= 0) index = preferred;
      checked = false;
    }
    if (!pool.length) { panel.classList.add('hidden'); return; }

    const entry = currentEntry();
    const lessonName = key === '2026-10-28' ? 'Bài 28/10 · Workplace' : 'Unit 3 · Lesson 1 · I have a headache';
    panel.innerHTML = `
      <div class="lf51l-top">
        <div><div class="lf51l-title">🎧 Nghe & chép chính tả</div><div class="lf51l-sub">${esc(lessonName)} · Nghe trước, chưa xem đáp án.</div></div>
        <div class="lf51l-score">${index+1}/${pool.length} · đúng ${correctCount}/${attemptCount}</div>
      </div>
      <div class="lf51l-controls">
        <button type="button" class="lf51l-btn" data-lf51-rate="0.75">🔊 0.75×</button>
        <button type="button" class="lf51l-btn primary" data-lf51-rate="1">🔊 1×</button>
        <button type="button" class="lf51l-btn" data-lf51-rate="1.1">🔊 1.1×</button>
        <button type="button" class="lf51l-btn" data-lf51-repeat>🔁 Nghe 3 lần</button>
      </div>
      <div class="lf51l-prompt">
        <div class="lf51l-prompt-label">Câu ${index+1} · ${esc(entry.label)}</div>
        <div class="lf51l-hidden-text">🎧 Nội dung tiếng Anh đang được ẩn. Hãy nghe và gõ lại.</div>
      </div>
      <div class="lf51l-inputrow">
        <textarea id="lf51ListeningInput" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Gõ câu tiếng Anh bạn nghe được..."></textarea>
        <button type="button" class="lf51l-check" data-lf51-check>Kiểm tra</button>
      </div>
      <div id="lf51ListeningResult" class="lf51l-result${checked?' show':''}"></div>
      <div class="lf51l-bottom">
        <button type="button" data-lf51-prev>← Câu trước</button>
        <button type="button" data-lf51-hint>💡 Gợi ý tiếng Việt</button>
        <button type="button" data-lf51-next>Câu tiếp →</button>
      </div>`;
    panel.classList.remove('hidden');
  }

  function checkAnswer() {
    const entry = currentEntry();
    const input = document.getElementById('lf51ListeningInput');
    const result = document.getElementById('lf51ListeningResult');
    if (!entry || !input || !result) return;
    const user = input.value.trim();
    if (!user) { input.focus(); return; }
    const ok = normalizeText(user) === normalizeText(entry.en);
    attemptCount += 1;
    if (ok) correctCount += 1;
    checked = true;
    result.className = 'lf51l-result show';
    result.innerHTML = `
      <div class="lf51l-answer">
        <div class="lf51l-answer-en">${esc(entry.en)}</div>
        ${entry.ipa ? `<div class="lf51l-ipa">IPA: ${esc(entry.ipa)}</div>` : ''}
        ${entry.vi ? `<div class="lf51l-vi">${esc(entry.vi)}</div>` : ''}
        <div class="lf51l-diff">${renderDiff(entry.en,user)}</div>
        <div class="lf51l-msg ${ok?'ok':'bad'}">${ok?'✅ Chính xác. Nghe lại một lần rồi chuyển câu tiếp theo.':'🔎 Chưa khớp hoàn toàn. Màu đỏ = sai, vàng = thiếu, tím gạch = từ dư.'}</div>
      </div>`;
    const score = panelScore(); if (score) score.textContent = `${index+1}/${pool.length} · đúng ${correctCount}/${attemptCount}`;
  }

  function panelScore(){ return document.querySelector('#lf51Listening .lf51l-score'); }

  function showHint() {
    const entry = currentEntry(); if (!entry) return;
    const prompt = document.querySelector('#lf51Listening .lf51l-hidden-text');
    if (prompt) prompt.innerHTML = entry.vi ? `💡 ${esc(entry.vi)}` : '💡 Không có bản dịch Việt cho câu này.';
  }

  function move(delta) {
    if (!pool.length) return;
    index = (index + delta + pool.length) % pool.length;
    checked = false;
    render();
    setTimeout(() => speak(currentEntry()?.en,1,1),80);
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const btn = event.target?.closest?.('#lf51Listening button');
      if (!btn) return;
      const entry = currentEntry(); if (!entry) return;
      if (btn.hasAttribute('data-lf51-rate')) speak(entry.en, Number(btn.getAttribute('data-lf51-rate')) || 1, 1);
      else if (btn.hasAttribute('data-lf51-repeat')) speak(entry.en, .9, 3);
      else if (btn.hasAttribute('data-lf51-check')) checkAnswer();
      else if (btn.hasAttribute('data-lf51-prev')) move(-1);
      else if (btn.hasAttribute('data-lf51-next')) move(1);
      else if (btn.hasAttribute('data-lf51-hint')) showHint();
    });
    document.addEventListener('keydown', event => {
      if (event.target?.id === 'lf51ListeningInput' && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); checkAnswer();
      }
    });
  }

  function patchRender() {
    try {
      const original = window.renderCurrentCard;
      if (typeof original !== 'function' || original.__lf51ListeningPatched) return;
      const wrapped = function(...args) {
        const result = original.apply(this,args);
        setTimeout(() => {
          const card = currentCard();
          if (is51Talk(card)) {
            const key = lessonFromCard(card);
            if (key !== lessonKey) { lessonKey = key; pool = buildPool(key); }
            const preferred = pool.findIndex(x => x.cardId === card.id);
            if (preferred >= 0) index = preferred;
            checked = false;
          }
          render();
        },0);
        return result;
      };
      wrapped.__lf51ListeningPatched = true;
      window.renderCurrentCard = wrapped;
    } catch (_) {}
  }

  function init() {
    ensureStyle();
    ensurePanel();
    bindEvents();
    patchRender();
    setTimeout(render,120);
    const root = document.getElementById('flashcardContainer');
    if (root) new MutationObserver(() => { ensurePanel(); }).observe(root,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
