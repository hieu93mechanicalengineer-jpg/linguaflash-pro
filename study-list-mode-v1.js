/* LinguaFlash · Study List Mode v1
   Adds Card/List view to Study for both Chinese and English without touching SRS logic.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_LIST_MODE_V1__) return;
  window.__LF_STUDY_LIST_MODE_V1__ = true;

  const MODE_KEY = 'lf_study_view_mode_v1';
  const COL_KEY = 'lf_study_list_columns_v1';
  const ROOT_ID = 'lfStudyListMode';
  const PANEL_ID = 'lfStudyListPanel';
  const BODY_CLASS = 'lf-study-list-mode';

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const hasHan = v => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(v || ''));
  const hasLatin = v => /[A-Za-z]/.test(String(v || ''));
  const first = (...vals) => vals.map(clean).find(Boolean) || '';

  let mode = localStorage.getItem(MODE_KEY) === 'list' ? 'list' : 'card';
  let columns = loadColumns();

  function loadColumns() {
    const base = {
      zh: { source:true, phonetic:true, meaning:true, other:true, example:true },
      en: { source:true, phonetic:true, meaning:true, other:true, example:true }
    };
    try {
      const saved = JSON.parse(localStorage.getItem(COL_KEY) || '{}');
      return {
        zh: { ...base.zh, ...(saved.zh || {}) },
        en: { ...base.en, ...(saved.en || {}) }
      };
    } catch (_) { return base; }
  }

  function saveColumns() {
    try { localStorage.setItem(COL_KEY, JSON.stringify(columns)); } catch (_) {}
  }

  function currentLang() {
    const select = document.getElementById('studyLangFilter');
    const value = String(select?.value || '');
    const label = String(select?.selectedOptions?.[0]?.textContent || '');
    if (value === 'Tiếng Trung' || /Tiếng Trung|Chinese|中文/i.test(label)) return 'zh';
    return 'en';
  }

  function getDeck() {
    try {
      if (typeof filteredDeck !== 'undefined' && Array.isArray(filteredDeck)) return filteredDeck.slice();
    } catch (_) {}
    let cards = [];
    try {
      if (typeof allCards !== 'undefined' && Array.isArray(allCards)) cards = allCards.slice();
    } catch (_) {}
    const lang = currentLang() === 'zh' ? 'Tiếng Trung' : 'Tiếng Anh';
    const cat = document.getElementById('studyCategoryFilter')?.value || 'ALL';
    const topic = document.getElementById('studyTopicFilter')?.value || 'ALL';
    return cards.filter(card => {
      const cardLang = String(card?.lang || '');
      const langOk = cardLang === lang || (lang === 'Tiếng Trung' && cardLang === 'zh') || (lang === 'Tiếng Anh' && cardLang === 'en');
      if (!langOk) return false;
      if (topic !== 'ALL' && String(card?.topic || '') !== topic) return false;
      if (cat !== 'ALL') {
        const c = String(card?.category || card?.topic || '');
        if (!c.includes(cat)) return false;
      }
      return true;
    });
  }

  function normalizeCard(card, lang) {
    const sentence = card?.cardType === 'sentence';
    let source = '', phonetic = clean(card?.phonetic || card?.pinyin), meaning = '', other = '';

    if (lang === 'zh') {
      source = sentence
        ? first(card?.meaning, card?.front, card?.chinese, card?.word)
        : first(card?.word, card?.front, card?.chinese);
      meaning = sentence
        ? first(card?.word, card?.back, card?.exampleTrans)
        : first(card?.meaning, card?.back);
      const candidates = sentence
        ? [card?.chinese, card?.meaningEn, card?.english, card?.exampleEn]
        : [card?.meaningEn, card?.english, card?.exampleEn, card?.chinese];
      other = candidates.map(clean).find(v => v && v !== source && hasLatin(v) && !hasHan(v)) || '';
    } else {
      source = sentence
        ? first(card?.chinese, card?.english, card?.word, card?.front)
        : first(card?.word, card?.front, card?.english);
      meaning = sentence
        ? first(card?.word, card?.meaning, card?.back)
        : first(card?.meaning, card?.back);
      const candidates = sentence
        ? [card?.meaning, card?.chinese, card?.back]
        : [card?.chinese, card?.meaningZh, card?.chineseMeaning];
      other = candidates.map(clean).find(v => v && v !== source && hasHan(v)) || '';
    }

    let example = clean(card?.example);
    const exVi = clean(card?.exampleTrans);
    const exEn = clean(card?.exampleEn);
    if (example === source) example = '';
    return {
      id: String(card?.id || ''),
      source, phonetic, meaning, other,
      example, exVi, exEn,
      topic: clean(card?.topic || card?.category),
      cardType: card?.cardType || 'vocab'
    };
  }

  function labelSet(lang) {
    return lang === 'zh'
      ? { source:'Từ', phonetic:'Pinyin', meaning:'Nghĩa', other:'English', example:'Ví dụ', title:'Danh sách học tiếng Trung' }
      : { source:'English', phonetic:'IPA', meaning:'Nghĩa', other:'Tiếng Trung', example:'Ví dụ', title:'Danh sách học tiếng Anh' };
  }

  function gridTemplate(lang) {
    const c = columns[lang];
    const parts = [];
    if (c.source) parts.push('minmax(150px,1.1fr)');
    if (c.phonetic) parts.push('minmax(120px,.85fr)');
    if (c.meaning) parts.push('minmax(160px,1.15fr)');
    if (c.other) parts.push('minmax(150px,1.1fr)');
    if (c.example) parts.push('minmax(260px,2fr)');
    parts.push('56px');
    return parts.join(' ');
  }

  function exampleHtml(row, lang) {
    if (!row.example && !row.exVi && !row.exEn) return '—';
    const bits = [];
    if (row.example) bits.push(`<div class="lfsl-example-main">${esc(row.example)}</div>`);
    if (row.exVi && row.exVi !== row.example) bits.push(`<div class="lfsl-example-sub">${esc(row.exVi)}</div>`);
    if (lang === 'zh' && row.exEn && row.exEn !== row.example) bits.push(`<div class="lfsl-example-en">${esc(row.exEn)}</div>`);
    return bits.join('');
  }

  function cell(key, label, content) {
    return `<div class="lfsl-cell lfsl-${key}" data-label="${esc(label)}">${content || '—'}</div>`;
  }

  function renderRows(rows, lang) {
    const labels = labelSet(lang);
    const c = columns[lang];
    const grid = gridTemplate(lang);
    const head = [
      c.source ? `<div>${esc(labels.source)}</div>` : '',
      c.phonetic ? `<div>${esc(labels.phonetic)}</div>` : '',
      c.meaning ? `<div>${esc(labels.meaning)}</div>` : '',
      c.other ? `<div>${esc(labels.other)}</div>` : '',
      c.example ? `<div>${esc(labels.example)}</div>` : '',
      '<div>🔊</div>'
    ].join('');

    return `<div class="lfsl-head" style="grid-template-columns:${grid}">${head}</div>` + rows.map((row, i) => {
      const audioText = row.source;
      return `<div class="lfsl-row" style="grid-template-columns:${grid}" data-row="${i}">
        ${c.source ? cell('source', labels.source, `<div class="lfsl-source">${esc(row.source || '—')}</div>${row.topic ? `<div class="lfsl-topic">${esc(row.topic)}</div>` : ''}`) : ''}
        ${c.phonetic ? cell('phonetic', labels.phonetic, `<span class="lfsl-phonetic">${esc(row.phonetic || '—')}</span>`) : ''}
        ${c.meaning ? cell('meaning', labels.meaning, `<span>${esc(row.meaning || '—')}</span>`) : ''}
        ${c.other ? cell('other', labels.other, `<span>${esc(row.other || '—')}</span>`) : ''}
        ${c.example ? cell('example', labels.example, exampleHtml(row, lang)) : ''}
        <div class="lfsl-cell lfsl-audio" data-label="Nghe"><button type="button" class="lfsl-listen" data-lfsl-audio="${esc(audioText)}" data-lfsl-lang="${lang}">🔊</button></div>
      </div>`;
    }).join('');
  }

  function controlsHtml(lang) {
    const labels = labelSet(lang), c = columns[lang];
    const chips = ['source','phonetic','meaning','other','example'].map(key =>
      `<button type="button" class="lfsl-chip ${c[key] ? 'on' : ''}" data-lfsl-col="${key}">${c[key] ? '✓ ' : ''}${esc(labels[key])}</button>`
    ).join('');
    return `<div class="lfsl-columns"><span class="lfsl-caption">Cột hiển thị:</span>${chips}
      <button type="button" class="lfsl-quick" data-lfsl-quick="answers">🙈 Ẩn đáp án</button>
      <button type="button" class="lfsl-quick" data-lfsl-quick="word">👁 Chỉ hiện từ</button>
      <button type="button" class="lfsl-quick" data-lfsl-quick="all">Hiện tất cả</button>
    </div>`;
  }

  function render() {
    const root = document.getElementById(ROOT_ID);
    const panel = document.getElementById(PANEL_ID);
    if (!root || !panel) return;
    const lang = currentLang();
    root.dataset.lang = lang;
    root.querySelectorAll('[data-lfsl-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.lfslView === mode));
    document.body?.classList.toggle(BODY_CLASS, mode === 'list');
    panel.classList.toggle('active', mode === 'list');
    const tools = root.querySelector('.lfsl-tools');
    if (tools) tools.innerHTML = mode === 'list' ? controlsHtml(lang) : '';
    if (mode !== 'list') return;

    const deck = getDeck();
    const rows = deck.map(card => normalizeCard(card, lang)).filter(row => row.source);
    const labels = labelSet(lang);
    panel.innerHTML = `<div class="lfsl-panel-top"><div><b>📋 ${esc(labels.title)}</b><span>${rows.length} mục · hiển thị đúng bộ đang lọc trong Học</span></div></div>
      ${rows.length ? `<div class="lfsl-list">${renderRows(rows, lang)}</div>` : '<div class="lfsl-empty">Không có nội dung phù hợp với bộ lọc hiện tại.</div>'}`;
  }

  function setMode(next) {
    mode = next === 'list' ? 'list' : 'card';
    try { localStorage.setItem(MODE_KEY, mode); } catch (_) {}
    render();
    if (mode === 'card') {
      try { if (typeof renderCurrentCard === 'function') renderCurrentCard(); } catch (_) {}
    }
  }

  function setQuick(kind) {
    const lang = currentLang();
    if (kind === 'all') columns[lang] = { source:true, phonetic:true, meaning:true, other:true, example:true };
    if (kind === 'answers') columns[lang] = { source:true, phonetic:true, meaning:false, other:false, example:false };
    if (kind === 'word') columns[lang] = { source:true, phonetic:false, meaning:false, other:false, example:false };
    saveColumns();
    render();
  }

  function speak(text, lang) {
    const t = clean(text); if (!t) return;
    try {
      if (lang === 'en' && window.LFEnglishHQAudio?.has?.(t)) { window.LFEnglishHQAudio.play(t, .9); return; }
      if (lang === 'zh' && window.LFChineseHQAudio?.has?.(t)) { window.LFChineseHQAudio.play(t, .8); return; }
    } catch (_) {}
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      u.rate = lang === 'zh' ? .8 : .9;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  function installStyle() {
    if (document.getElementById('lfStudyListModeStyle')) return;
    const style = document.createElement('style');
    style.id = 'lfStudyListModeStyle';
    style.textContent = `
      #${ROOT_ID}{width:min(100%,1280px);margin:0 auto 12px;display:flex;flex-direction:column;gap:8px}
      .lfsl-switch{display:flex;justify-content:center;gap:7px}.lfsl-view{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:10px;padding:8px 14px;font-weight:850;cursor:pointer;touch-action:manipulation}.lfsl-view.active{background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 5px 14px rgba(79,70,229,.18)}
      .lfsl-tools{min-height:0}.lfsl-columns{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;padding:9px 10px;border:1px solid #dbe3ef;border-radius:13px;background:#fff}.lfsl-caption{font-size:.76rem;font-weight:850;color:#64748b;margin-right:2px}.lfsl-chip,.lfsl-quick{border:1px solid #d4deea;background:#fff;color:#334155;border-radius:9px;padding:6px 9px;font-size:.75rem;font-weight:800;cursor:pointer;touch-action:manipulation}.lfsl-chip.on{background:#4f46e5;color:#fff;border-color:#4f46e5}.lfsl-quick{background:#f8fafc}
      #${PANEL_ID}{display:none;width:min(100%,1280px);margin:0 auto 140px;border:1px solid #dbe3ef;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 8px 26px rgba(15,23,42,.07)}#${PANEL_ID}.active{display:block}.lfsl-panel-top{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #e5eaf1;background:#f8fafc}.lfsl-panel-top b{font-size:.95rem;color:#172554}.lfsl-panel-top span{display:block;margin-top:2px;font-size:.72rem;color:#64748b}
      .lfsl-list{overflow:auto}.lfsl-head,.lfsl-row{display:grid;align-items:stretch}.lfsl-head{position:sticky;top:0;z-index:2;background:#f1f5f9;border-bottom:1px solid #dbe3ef;font-size:.7rem;font-weight:900;color:#475569;text-transform:uppercase}.lfsl-head>div{padding:9px 10px}.lfsl-row{border-bottom:1px solid #e7edf4}.lfsl-row:last-child{border-bottom:0}.lfsl-row:nth-child(even){background:#fbfdff}.lfsl-cell{min-width:0;padding:11px 10px;font-size:.83rem;line-height:1.45;overflow-wrap:anywhere}.lfsl-source{font-size:1rem;font-weight:900;color:#0f172a}.lfsl-topic{margin-top:4px;color:#94a3b8;font-size:.66rem;font-weight:700}.lfsl-phonetic{color:#4f46e5;font-weight:800}.lfsl-example-main{font-weight:750;color:#0f172a}.lfsl-example-sub{margin-top:3px;color:#64748b;font-size:.76rem}.lfsl-example-en{margin-top:3px;color:#2563eb;font-size:.76rem}.lfsl-audio{display:flex;align-items:flex-start;justify-content:center}.lfsl-listen{width:36px;height:36px;border:1px solid #d9e5f3;border-radius:10px;background:#f8fbff;cursor:pointer;touch-action:manipulation}.lfsl-empty{padding:28px;text-align:center;color:#64748b}
      body.${BODY_CLASS} #flashcardContainer,body.${BODY_CLASS} #studyEmptyState,body.${BODY_CLASS} #lf51DesktopWorkspace,body.${BODY_CLASS} #lfEnglishMobileV1,body.${BODY_CLASS} #lfEnglishPracticeV1{display:none!important}
      @media(max-width:720px){#${ROOT_ID}{margin-bottom:6px}.lfsl-columns{justify-content:flex-start}.lfsl-caption{width:100%;margin-bottom:1px}.lfsl-head{display:none}.lfsl-list{overflow:visible;padding:8px}.lfsl-row{display:block!important;margin-bottom:9px;border:1px solid #dce5f0!important;border-radius:13px;background:#fff!important;box-shadow:0 3px 10px rgba(15,23,42,.04)}.lfsl-cell{display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px;padding:8px 10px;border-bottom:1px dashed #edf1f5}.lfsl-cell:last-child{border-bottom:0}.lfsl-cell::before{content:attr(data-label);font-size:.68rem;font-weight:900;color:#64748b;text-transform:uppercase}.lfsl-audio{display:grid;grid-template-columns:92px 1fr;justify-content:stretch}.lfsl-listen{justify-self:start}.lfsl-source{font-size:1.05rem}.lfsl-panel-top{padding:10px 11px}#${PANEL_ID}{margin-bottom:125px}}
    `;
    document.head.appendChild(style);
  }

  function ensureUI() {
    if (document.getElementById(ROOT_ID)) return true;
    const toggle = document.getElementById('togglePhonetic');
    const flash = document.getElementById('flashcardContainer');
    if (!toggle || !flash) return false;
    installStyle();
    const anchor = toggle.closest('.bg-white') || toggle.parentElement;
    const root = document.createElement('section');
    root.id = ROOT_ID;
    root.innerHTML = `<div class="lfsl-switch"><button type="button" class="lfsl-view" data-lfsl-view="card">🃏 Thẻ</button><button type="button" class="lfsl-view" data-lfsl-view="list">📋 Danh sách</button></div><div class="lfsl-tools"></div>`;
    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    anchor?.insertAdjacentElement('afterend', root);
    root.insertAdjacentElement('afterend', panel);
    render();
    return true;
  }

  function bind() {
    document.addEventListener('click', e => {
      const view = e.target.closest?.('[data-lfsl-view]');
      if (view) { setMode(view.dataset.lfslView); return; }
      const col = e.target.closest?.('[data-lfsl-col]');
      if (col) {
        const lang = currentLang(), key = col.dataset.lfslCol;
        columns[lang][key] = !columns[lang][key];
        saveColumns(); render(); return;
      }
      const quick = e.target.closest?.('[data-lfsl-quick]');
      if (quick) { setQuick(quick.dataset.lfslQuick); return; }
      const audio = e.target.closest?.('[data-lfsl-audio]');
      if (audio) { speak(audio.dataset.lfslAudio, audio.dataset.lfslLang); return; }
    });

    document.addEventListener('change', e => {
      if (!['studyLangFilter','studyCategoryFilter','studyTopicFilter','studyDueOnly'].includes(e.target?.id)) return;
      [0,80,220].forEach(ms => setTimeout(() => { ensureUI(); render(); }, ms));
    }, true);
  }

  function init() {
    bind();
    [0,100,350,900,1800,3500].forEach(ms => setTimeout(() => { ensureUI(); if (mode === 'list') render(); }, ms));
    window.addEventListener('pageshow', () => setTimeout(() => { ensureUI(); render(); }, 0));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.LFStudyListMode = { render, setMode, getMode:() => mode };
})();