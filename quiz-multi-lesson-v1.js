/* LinguaFlash Pro · Multi-lesson Quiz Selector v1
   Lets learners choose multiple lessons and mix them into one quiz.
   Keeps the existing quiz engine and question types unchanged.
*/
(() => {
  'use strict';
  if (window.__LF_QUIZ_MULTI_LESSON_V1__) return;
  window.__LF_QUIZ_MULTI_LESSON_V1__ = true;

  const SELECT_ID = 'quizTopicFilter';
  const WRAP_ID = 'lfQuizLessonMultiWrap';
  const BUTTON_ID = 'lfQuizLessonMultiButton';
  const SHEET_ID = 'lfQuizLessonSheet';
  const LIST_ID = 'lfQuizLessonList';
  const STYLE_ID = 'lfQuizLessonMultiStyle';
  const STORAGE_KEY = 'linguaflash_quiz_multi_lessons_v1';

  let selectedTopics = new Set();
  let allSelected = true;
  let initializedCategoryKey = '';

  const text = value => String(value == null ? '' : value).trim();
  const esc = value => text(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function categoryKey() {
    const cat = document.getElementById('quizCategoryFilter')?.value || 'ALL';
    const lang = document.getElementById('quizLangFilter')?.value || 'ALL';
    const source = document.getElementById('quizContentFilter')?.value || 'ALL';
    return `${source}::${lang}::${cat}`;
  }

  function readSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const state = saved?.[categoryKey()];
      if (!state) return null;
      if (state.all === true) return { all:true, topics:[] };
      if (Array.isArray(state.topics)) return { all:false, topics:state.topics.map(String) };
    } catch (_) {}
    return null;
  }

  function saveState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      saved[categoryKey()] = { all: allSelected, topics:[...selectedTopics] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (_) {}
  }

  function availableTopics() {
    const select = document.getElementById(SELECT_ID);
    if (!select) return [];
    return [...select.options]
      .filter(opt => opt.value && opt.value !== 'ALL')
      .map(opt => ({ value:opt.value, label:text(opt.textContent) || opt.value }));
  }

  function normalizeSelection(resetForNewCategory = false) {
    const options = availableTopics();
    const valid = new Set(options.map(o => o.value));
    const key = categoryKey();

    if (resetForNewCategory || initializedCategoryKey !== key) {
      initializedCategoryKey = key;
      const saved = readSaved();
      if (saved?.all === false) {
        selectedTopics = new Set(saved.topics.filter(v => valid.has(v)));
        allSelected = selectedTopics.size === 0 ? true : false;
      } else {
        selectedTopics = new Set();
        allSelected = true;
      }
    } else if (!allSelected) {
      selectedTopics = new Set([...selectedTopics].filter(v => valid.has(v)));
      if (!selectedTopics.size) allSelected = true;
    }

    const original = document.getElementById(SELECT_ID);
    if (original) original.value = 'ALL';
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${WRAP_ID}{width:100%}
      #${BUTTON_ID}{width:100%;display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.78rem .95rem;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#0f172a;font-weight:750;text-align:left;min-height:48px}
      #${BUTTON_ID} .lf-qm-summary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #${SHEET_ID}{position:fixed;inset:0;z-index:10050;display:none;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.46);padding:16px}
      #${SHEET_ID}.open{display:flex}
      #${SHEET_ID} .lf-qm-panel{width:min(100%,640px);max-height:min(78vh,720px);display:flex;flex-direction:column;background:#fff;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.28);overflow:hidden}
      #${SHEET_ID} .lf-qm-head{padding:16px 18px 12px;border-bottom:1px solid #e2e8f0}
      #${SHEET_ID} .lf-qm-title{font-size:1.05rem;font-weight:900;color:#0f172a}
      #${SHEET_ID} .lf-qm-sub{font-size:.82rem;color:#64748b;margin-top:3px}
      #${LIST_ID}{overflow:auto;padding:10px 14px 14px}
      #${LIST_ID} label{display:flex;align-items:center;gap:12px;padding:12px 10px;border-radius:12px;font-size:1rem;color:#0f172a}
      #${LIST_ID} label:active{background:#f1f5f9}
      #${LIST_ID} input{width:20px;height:20px;accent-color:#4f46e5;flex:0 0 auto}
      #${SHEET_ID} .lf-qm-all{font-weight:850;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:6px}
      #${SHEET_ID} .lf-qm-actions{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:8px;padding:12px 14px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e2e8f0;background:#fff}
      #${SHEET_ID} .lf-qm-actions button{border-radius:12px;padding:11px 9px;font-weight:850;border:1px solid #cbd5e1;background:#fff;color:#334155}
      #${SHEET_ID} .lf-qm-actions .primary{background:#4f46e5;color:#fff;border-color:#4f46e5}
      @media(min-width:700px){#${SHEET_ID}{align-items:center}#${SHEET_ID} .lf-qm-panel{max-height:74vh}}
    `;
    document.head.appendChild(style);
  }

  function summaryText() {
    const options = availableTopics();
    if (allSelected || !selectedTopics.size) return 'Tất cả bài học';
    const picked = options.filter(o => selectedTopics.has(o.value));
    if (picked.length === 1) return picked[0].label;
    if (picked.length <= 3) return picked.map(o => o.label.replace(/^Trung cấp\s*\d+\s*-\s*/i,'')).join(', ');
    return `Đã chọn ${picked.length} bài`;
  }

  function updateButton() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;
    button.innerHTML = `<span class="lf-qm-summary">${esc(summaryText())}</span><span aria-hidden="true">⌄</span>`;
  }

  function renderSheet() {
    const list = document.getElementById(LIST_ID);
    if (!list) return;
    const options = availableTopics();
    list.innerHTML = `
      <label class="lf-qm-all"><input type="checkbox" data-lf-qm-all ${allSelected ? 'checked' : ''}><span>Tất cả bài học</span></label>
      ${options.map(o => `<label><input type="checkbox" data-lf-qm-topic="${esc(o.value)}" ${!allSelected && selectedTopics.has(o.value) ? 'checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}`;
  }

  function openSheet() {
    normalizeSelection(false);
    renderSheet();
    document.getElementById(SHEET_ID)?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet(save = true) {
    document.getElementById(SHEET_ID)?.classList.remove('open');
    document.body.style.overflow = '';
    if (save) saveState();
    updateButton();
  }

  function ensureUi() {
    ensureStyle();
    const select = document.getElementById(SELECT_ID);
    if (!select) return false;

    normalizeSelection(false);
    select.style.display = 'none';
    select.setAttribute('aria-hidden','true');

    let wrap = document.getElementById(WRAP_ID);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = WRAP_ID;
      const button = document.createElement('button');
      button.type = 'button';
      button.id = BUTTON_ID;
      button.addEventListener('click', openSheet);
      wrap.appendChild(button);
      select.insertAdjacentElement('afterend', wrap);
    }

    let sheet = document.getElementById(SHEET_ID);
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = SHEET_ID;
      sheet.innerHTML = `
        <div class="lf-qm-panel" role="dialog" aria-modal="true" aria-label="Chọn nhiều bài học">
          <div class="lf-qm-head"><div class="lf-qm-title">Chọn bài để trộn chung</div><div class="lf-qm-sub">Bạn có thể chọn nhiều bài rồi tạo một đề kiểm tra chung.</div></div>
          <div id="${LIST_ID}"></div>
          <div class="lf-qm-actions">
            <button type="button" data-lf-qm-clear>Bỏ chọn</button>
            <button type="button" data-lf-qm-allbtn>Tất cả</button>
            <button type="button" class="primary" data-lf-qm-done>Xong</button>
          </div>
        </div>`;
      document.body.appendChild(sheet);

      sheet.addEventListener('click', event => {
        if (event.target === sheet) return closeSheet(false);
        const allBox = event.target.closest?.('[data-lf-qm-all]');
        if (allBox) {
          allSelected = allBox.checked;
          if (allSelected) selectedTopics.clear();
          renderSheet();
          return;
        }
        const topicBox = event.target.closest?.('[data-lf-qm-topic]');
        if (topicBox) {
          if (allSelected) { allSelected = false; selectedTopics.clear(); }
          if (topicBox.checked) selectedTopics.add(topicBox.dataset.lfQmTopic);
          else selectedTopics.delete(topicBox.dataset.lfQmTopic);
          if (!selectedTopics.size) allSelected = true;
          renderSheet();
          return;
        }
        if (event.target.closest?.('[data-lf-qm-clear]')) {
          allSelected = false;
          selectedTopics.clear();
          renderSheet();
          return;
        }
        if (event.target.closest?.('[data-lf-qm-allbtn]')) {
          allSelected = true;
          selectedTopics.clear();
          renderSheet();
          return;
        }
        if (event.target.closest?.('[data-lf-qm-done]')) {
          if (!allSelected && selectedTopics.size === 0) allSelected = true;
          closeSheet(true);
          try { if (typeof startQuiz === 'function') startQuiz(); } catch (_) {}
        }
      });
    }

    updateButton();
    return true;
  }

  function patchQuizPool() {
    const original = window.getQuizPool;
    if (typeof original !== 'function' || original.__lfMultiLessonV1) return;
    const wrapped = function(...args) {
      const select = document.getElementById(SELECT_ID);
      const oldValue = select?.value;
      if (select) select.value = 'ALL';
      let pool = original.apply(this,args);
      if (select) select.value = 'ALL';
      if (!allSelected && selectedTopics.size) {
        pool = pool.filter(card => selectedTopics.has(card?.topic || 'Chung'));
      }
      return pool;
    };
    wrapped.__lfMultiLessonV1 = true;
    window.getQuizPool = wrapped;
  }

  function patchPopulate() {
    const original = window.populateQuizSubtopicDropdown;
    if (typeof original !== 'function' || original.__lfMultiLessonV1) return;
    const wrapped = function(...args) {
      const result = original.apply(this,args);
      setTimeout(() => {
        normalizeSelection(true);
        ensureUi();
        updateButton();
      },0);
      return result;
    };
    wrapped.__lfMultiLessonV1 = true;
    window.populateQuizSubtopicDropdown = wrapped;
  }

  function observeSelect() {
    const select = document.getElementById(SELECT_ID);
    if (!select || select.__lfMultiObserved) return;
    select.__lfMultiObserved = true;
    const obs = new MutationObserver(() => {
      normalizeSelection(true);
      ensureUi();
      updateButton();
    });
    obs.observe(select,{childList:true,subtree:true});
  }

  function bindFilterChanges() {
    ['quizCategoryFilter','quizLangFilter','quizContentFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.__lfMultiBound) return;
      el.__lfMultiBound = true;
      el.addEventListener('change',() => setTimeout(() => {
        initializedCategoryKey = '';
        normalizeSelection(true);
        ensureUi();
        observeSelect();
      },0));
    });
  }

  function init() {
    if (!ensureUi()) return;
    patchQuizPool();
    patchPopulate();
    observeSelect();
    bindFilterChanges();
    window.lfQuizMultiLessonV1 = {
      get selected(){ return allSelected ? ['ALL'] : [...selectedTopics]; },
      open:openSheet
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
