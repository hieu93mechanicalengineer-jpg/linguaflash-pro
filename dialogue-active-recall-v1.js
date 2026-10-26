/* LinguaFlash Dialogue Active Recall v1
   Podcast-style hide/show controls for dialogue lines.
   Pinyin is display-only; typing checks are available for Hanzi, Vietnamese and English only.
*/
(() => {
  'use strict';

  const PREF_KEY = 'linguaflash_dialogue_recall_view_v1';
  const DEFAULT_VISIBLE = { cn: true, pinyin: true, vn: true, en: true };
  const view = {
    visible: loadVisible(),
    answers: Object.create(null),
    results: Object.create(null)
  };

  function parse(raw, fallback) { try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function loadVisible() {
    const saved = parse(localStorage.getItem(PREF_KEY), null);
    return { ...DEFAULT_VISIBLE, ...(saved && typeof saved === 'object' ? saved : {}) };
  }
  function saveVisible() { try { localStorage.setItem(PREF_KEY, JSON.stringify(view.visible)); } catch (_) {} }

  function uiText() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      title: 'Active recall', hint: 'Hide a language, then type it from memory. Pinyin can be hidden, but it is never a typing target.',
      reset: 'Reset answers', cn: 'Hanzi', pinyin: 'Pinyin', vn: 'Vietnamese', en: 'English',
      check: 'Check', placeholder: 'Type from memory…', correct: 'Correct ✓', wrong: 'Not correct yet — try again.',
      near: 'Almost correct — check spelling and try again.', chineseOnly: 'Type the Chinese answer in Hanzi. Pinyin is not accepted.'
    };
    if (lang === 'zh') return {
      title: '主动回忆', hint: '隐藏某种语言后凭记忆输入。拼音只能隐藏/显示，不能作为输入答案。',
      reset: '清空答案', cn: '汉字', pinyin: '拼音', vn: '越南语', en: '英语',
      check: '检查', placeholder: '凭记忆输入…', correct: '正确 ✓', wrong: '还不正确，请再试一次。',
      near: '很接近——请检查拼写后再试。', chineseOnly: '中文答案必须输入汉字，不接受拼音。'
    };
    return {
      title: 'Chủ động nhớ lại', hint: 'Ẩn một ngôn ngữ rồi tự nhập từ trí nhớ. Pinyin chỉ được ẩn/hiện, không dùng làm đáp án.',
      reset: 'Xóa câu trả lời', cn: 'Hán tự', pinyin: 'Pinyin', vn: 'Tiếng Việt', en: 'English',
      check: 'Kiểm tra', placeholder: 'Nhập lại từ trí nhớ…', correct: 'Đúng ✓', wrong: 'Chưa đúng — hãy thử lại.',
      near: 'Gần đúng — kiểm tra chính tả rồi thử lại.', chineseOnly: 'Đáp án tiếng Trung phải nhập Hán tự. Không chấp nhận Pinyin.'
    };
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function currentLessonKey() {
    const select = document.getElementById('dialogueLessonSelector');
    if (select?.value) return select.value;
    try { return Object.keys(DIALOGUES_DB || {})[0] || ''; } catch (_) { return ''; }
  }

  function currentDialogue() {
    const key = currentLessonKey();
    try { return { key, dialogue: (DIALOGUES_DB || {})[key] || null }; } catch (_) { return { key, dialogue: null }; }
  }

  function answerKey(lesson, lineIndex, field) { return `${lesson}::${lineIndex}::${field}`; }

  function normalize(value, field) {
    let v = String(value == null ? '' : value).normalize('NFKC').toLocaleLowerCase().trim();
    if (field === 'cn') return v.replace(/[\s\p{P}\p{S}]+/gu, '');
    v = v.replace(/['’]/g, '').replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
    if (field === 'en') v = v.replace(/^to\s+/, '');
    return v;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    const curr = new Array(b.length + 1);
    for (let i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (let j = 1; j <= b.length; j++) {
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
    }
    return prev[b.length];
  }

  function classify(input, expected, field) {
    const a = normalize(input, field);
    const e = normalize(expected, field);
    if (!a || !e) return { status: 'wrong' };
    if (field === 'cn') {
      const expectsHanzi = /\p{Script=Han}/u.test(e);
      const hasHanzi = /\p{Script=Han}/u.test(a);
      if (expectsHanzi && !hasHanzi) return { status: 'hanzi' };
      return { status: a === e ? 'correct' : 'wrong' };
    }
    if (a === e) return { status: 'correct' };
    const maxLen = Math.max(a.length, e.length);
    const dist = maxLen <= 80 ? levenshtein(a, e) : maxLen;
    const limit = maxLen <= 8 ? 1 : maxLen <= 24 ? 2 : Math.min(4, Math.floor(maxLen * 0.08));
    if (dist <= limit) return { status: 'near' };
    return { status: 'wrong' };
  }

  function ensureStyles() {
    if (document.getElementById('lfDialogueRecallStyles')) return;
    const style = document.createElement('style');
    style.id = 'lfDialogueRecallStyles';
    style.textContent = `
      #lfDialogueRecallToolbar{border:1px solid #c7d2fe;background:#eef2ff;border-radius:18px;padding:12px 14px;margin-bottom:14px}
      .lf-dialogue-toggle{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:11px;padding:8px 10px;font-size:12px;font-weight:800}
      .lf-dialogue-toggle.on{background:#4f46e5;color:#fff;border-color:#4f46e5}
      .lf-dialogue-toggle.off{opacity:.62;text-decoration:line-through}
      .lf-dialogue-recall{margin-top:12px;display:grid;gap:8px}
      .lf-dialogue-test{border-top:1px dashed #cbd5e1;padding-top:10px}
      .lf-dialogue-test-label{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:6px}
      .lf-dialogue-test-row{display:flex;gap:7px;align-items:center}
      .lf-dialogue-test-input{min-width:0;flex:1;border:1.5px solid #cbd5e1;border-radius:11px;padding:9px 10px;background:#fff;outline:none}
      .lf-dialogue-test-input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.1)}
      .lf-dialogue-test-input.ok{border-color:#10b981;background:#ecfdf5}.lf-dialogue-test-input.bad{border-color:#ef4444;background:#fef2f2}.lf-dialogue-test-input.near{border-color:#f59e0b;background:#fffbeb}
      .lf-dialogue-test-feedback{font-size:12px;font-weight:800;margin-top:5px}.lf-dialogue-test-feedback.ok{color:#047857}.lf-dialogue-test-feedback.bad{color:#be123c}.lf-dialogue-test-feedback.near{color:#b45309}
      @media(max-width:520px){.lf-dialogue-test-row{align-items:stretch;flex-direction:column}.lf-dialogue-test-row button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function ensureToolbar() {
    const container = document.getElementById('dialogueContainer');
    if (!container?.parentElement) return null;
    let toolbar = document.getElementById('lfDialogueRecallToolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'lfDialogueRecallToolbar';
      container.parentElement.insertBefore(toolbar, container);
    }
    const t = uiText();
    toolbar.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div><div class="font-extrabold text-indigo-950">✍️ ${esc(t.title)}</div><div class="text-xs text-indigo-800/80 mt-1">${esc(t.hint)}</div></div>
        <button type="button" class="lf-dialogue-toggle" onclick="lfDialogueRecallReset()">↺ ${esc(t.reset)}</button>
      </div>
      <div class="flex flex-wrap gap-2 mt-3">
        ${['cn','pinyin','vn','en'].map(field => `<button type="button" class="lf-dialogue-toggle ${view.visible[field] ? 'on' : 'off'}" onclick="lfDialogueRecallToggle('${field}')">${view.visible[field] ? '👁' : '🙈'} ${esc(t[field])}</button>`).join('')}
      </div>`;
    return toolbar;
  }

  function mapLineParagraphs(article, line) {
    const paras = Array.from(article.querySelectorAll(':scope > p')).filter(p => !p.closest('.lf-dialogue-recall'));
    let i = 0;
    const map = {};
    if (line?.cn && paras[i]) map.cn = paras[i++];
    if (line?.pinyin && paras[i]) map.pinyin = paras[i++];
    if (line?.vn && paras[i]) map.vn = paras[i++];
    if (line?.en && paras[i]) map.en = paras[i++];
    return map;
  }

  function testBlock(lessonKey, lineIndex, field, expected) {
    const t = uiText();
    const key = answerKey(lessonKey, lineIndex, field);
    const value = view.answers[key] || '';
    const result = view.results[key] || null;
    const cls = result?.status === 'correct' ? 'ok' : result?.status === 'near' ? 'near' : result ? 'bad' : '';
    let feedback = '';
    if (result?.status === 'correct') feedback = t.correct;
    else if (result?.status === 'near') feedback = t.near;
    else if (result?.status === 'hanzi') feedback = t.chineseOnly;
    else if (result) feedback = t.wrong;
    return `<div class="lf-dialogue-test" data-field="${field}">
      <div class="lf-dialogue-test-label">${esc(t[field])}</div>
      <div class="lf-dialogue-test-row">
        <input id="lfDialogueInput-${lineIndex}-${field}" class="lf-dialogue-test-input ${cls}" value="${esc(value)}" placeholder="${esc(t.placeholder)}" oninput="lfDialogueRecallStore(${lineIndex},'${field}',this.value)" onkeydown="lfDialogueRecallKeydown(event,${lineIndex},'${field}')" autocomplete="off" spellcheck="false" />
        <button type="button" class="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold" onclick="lfDialogueRecallCheck(${lineIndex},'${field}')">${esc(t.check)}</button>
      </div>
      ${feedback ? `<div class="lf-dialogue-test-feedback ${cls}">${esc(feedback)}</div>` : ''}
    </div>`;
  }

  function decorateDialogue() {
    ensureStyles();
    ensureToolbar();
    const { key, dialogue } = currentDialogue();
    const container = document.getElementById('dialogueContainer');
    if (!container || !dialogue?.lines) return;
    const articles = Array.from(container.querySelectorAll(':scope > article'));
    articles.forEach((article, lineIndex) => {
      const line = dialogue.lines[lineIndex];
      if (!line) return;
      article.dataset.lfDialogueLine = String(lineIndex);
      const fieldEls = mapLineParagraphs(article, line);
      for (const field of ['cn','pinyin','vn','en']) {
        if (fieldEls[field]) fieldEls[field].style.display = view.visible[field] ? '' : 'none';
      }
      article.querySelector(':scope > .lf-dialogue-recall')?.remove();
      const hiddenTargets = ['cn','vn','en'].filter(field => !view.visible[field] && line[field]);
      if (hiddenTargets.length) {
        const recall = document.createElement('div');
        recall.className = 'lf-dialogue-recall';
        recall.innerHTML = hiddenTargets.map(field => testBlock(key, lineIndex, field, line[field])).join('');
        article.appendChild(recall);
      }
    });
  }

  function toggle(field) {
    if (!(field in view.visible)) return;
    view.visible[field] = !view.visible[field];
    saveVisible();
    decorateDialogue();
  }

  function setVisible(field, value) {
    if (!(field in view.visible)) return;
    view.visible[field] = !!value;
    saveVisible();
    decorateDialogue();
  }

  function resetAnswers() {
    view.answers = Object.create(null);
    view.results = Object.create(null);
    decorateDialogue();
  }

  function store(lineIndex, field, value) {
    const key = answerKey(currentLessonKey(), lineIndex, field);
    view.answers[key] = String(value || '');
    delete view.results[key];
  }

  function check(lineIndex, field) {
    const { key, dialogue } = currentDialogue();
    const line = dialogue?.lines?.[lineIndex];
    if (!line || !['cn','vn','en'].includes(field)) return;
    const k = answerKey(key, lineIndex, field);
    const input = document.getElementById(`lfDialogueInput-${lineIndex}-${field}`)?.value ?? view.answers[k] ?? '';
    view.answers[k] = input;
    view.results[k] = classify(input, line[field] || '', field);
    decorateDialogue();
    setTimeout(() => document.getElementById(`lfDialogueInput-${lineIndex}-${field}`)?.focus(), 0);
  }

  function keydown(event, lineIndex, field) {
    if (event.key === 'Enter') { event.preventDefault(); check(lineIndex, field); }
  }

  function patchFunction(name, after) {
    const original = window[name];
    if (typeof original !== 'function' || original.__lfDialogueRecallPatched) return;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      try { after(args, result); } catch (_) {}
      return result;
    };
    wrapped.__lfDialogueRecallPatched = true;
    window[name] = wrapped;
  }

  function init() {
    patchFunction('changeDialogueLesson', () => setTimeout(decorateDialogue, 0));
    patchFunction('switchTab', args => { if (args?.[0] === 'dialogue') setTimeout(decorateDialogue, 0); });
    document.getElementById('uiLangSelector')?.addEventListener('change', () => setTimeout(decorateDialogue, 0));
    setTimeout(decorateDialogue, 250);
  }

  window.lfDialogueRecallToggle = toggle;
  window.lfDialogueRecallSetVisible = setVisible;
  window.lfDialogueRecallReset = resetAnswers;
  window.lfDialogueRecallStore = store;
  window.lfDialogueRecallCheck = check;
  window.lfDialogueRecallKeydown = keydown;
  window.lfDialogueRecallRefresh = decorateDialogue;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
