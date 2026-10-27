/* LinguaFlash Podcast Auto Pronunciation v1
   Adds automatic Chinese pronunciation inside the embedded Chinese Daily Podcast.
   When a typed answer is marked correct (button click or Enter), speak the Chinese
   word/sentence that the learner just entered. Does not change podcast grading.
*/
(() => {
  'use strict';

  const attachedDocs = new WeakSet();
  const spokenByInput = new WeakMap();
  const HAN = /[\u3400-\u9fff]/;
  const SUCCESS = /(?:✓|✔|✅)?\s*(?:Đúng|Correct|正确|答对)/i;
  const FAILURE = /(?:Chưa đúng|Không đúng|Sai|Incorrect|错误|答错)/i;
  const CHECK = /^(?:Kiểm tra|Check|检查)$/i;
  const PODCAST_MARKER = /Chinese Daily Podcast|Podcast\s*#\s*\d+|Từ vựng trọng tâm/i;

  function normalizeText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function isChinese(value) {
    return HAN.test(String(value || ''));
  }

  function rootWindow() {
    try { return window.top || window; } catch (_) { return window; }
  }

  function speakChinese(text) {
    const value = normalizeText(text);
    if (!value || !isChinese(value)) return;
    const topWin = rootWindow();

    try {
      if (topWin.lfAutoPronunciation?.speak) {
        topWin.lfAutoPronunciation.speak(value, 'cn');
        return;
      }
    } catch (_) {}

    try {
      if (typeof topWin.speakSentence === 'function') {
        topWin.speakSentence(value, 'zh-CN');
        return;
      }
    } catch (_) {}

    try {
      if (!topWin.speechSynthesis) return;
      topWin.speechSynthesis.cancel();
      const utterance = new topWin.SpeechSynthesisUtterance(value);
      utterance.lang = 'zh-CN';
      topWin.speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function podcastScope(target, doc) {
    let node = target?.nodeType === 1 ? target : target?.parentElement;
    for (let depth = 0; node && depth < 12; depth += 1, node = node.parentElement) {
      if (node === doc.body || node === doc.documentElement) break;
      const text = normalizeText(node.innerText || node.textContent || '');
      if (PODCAST_MARKER.test(text)) return node;
    }

    // Embedded podcast documents are dedicated to the podcast, so body-level scope is safe there.
    try {
      if (doc.defaultView && doc.defaultView !== window && PODCAST_MARKER.test(normalizeText(doc.body?.innerText || ''))) {
        return doc.body;
      }
    } catch (_) {}
    return null;
  }

  function nearestAnswerContainer(control, doc) {
    return control?.closest?.('td, tr, form, .vocab-row, .vocab-test, .test-row, .answer-row, .card')
      || podcastScope(control, doc)
      || control?.parentElement
      || null;
  }

  function correctState(control, doc) {
    if (!control) return false;
    const cls = String(control.className || '');
    if (/(^|\s)(?:ok|correct|success)(\s|$)/i.test(cls)) return true;

    const container = nearestAnswerContainer(control, doc);
    const text = normalizeText(container?.innerText || container?.textContent || '');
    if (!text) return false;
    return SUCCESS.test(text) && !FAILURE.test(text);
  }

  function speakIfCorrect(control, doc) {
    if (!control || !podcastScope(control, doc)) return false;
    const value = normalizeText(control.value);
    if (!value || !isChinese(value) || !correctState(control, doc)) return false;

    const key = value;
    if (spokenByInput.get(control) === key) return true;
    spokenByInput.set(control, key);
    speakChinese(value);
    return true;
  }

  function inputForCheckButton(button, doc) {
    const direct = button.parentElement?.querySelector?.('input,textarea');
    if (direct && isChinese(direct.value)) return direct;

    let node = button.parentElement;
    for (let depth = 0; node && depth < 5; depth += 1, node = node.parentElement) {
      const inputs = Array.from(node.querySelectorAll?.('input,textarea') || []);
      const chinese = inputs.find(input => isChinese(input.value));
      if (chinese) return chinese;
    }
    return null;
  }

  function scheduleCheck(control, doc) {
    if (!control) return;
    [30, 100, 220].forEach(delay => setTimeout(() => speakIfCorrect(control, doc), delay));
  }

  function handleClick(event, doc) {
    const button = event.target?.closest?.('button');
    if (!button) return;
    if (!CHECK.test(normalizeText(button.textContent))) return;
    if (!podcastScope(button, doc)) return;
    scheduleCheck(inputForCheckButton(button, doc), doc);
  }

  function handleKeydown(event, doc) {
    if (event.key !== 'Enter') return;
    const control = event.target?.closest?.('input,textarea');
    if (!control || !podcastScope(control, doc)) return;
    scheduleCheck(control, doc);
  }

  function handleMutations(mutations, doc) {
    for (const mutation of mutations) {
      const target = mutation.target?.nodeType === 1 ? mutation.target : mutation.target?.parentElement;
      if (!target) continue;
      const text = normalizeText(target.innerText || target.textContent || '');
      if (!SUCCESS.test(text) || FAILURE.test(text)) continue;

      const container = target.closest?.('td, tr, form, .vocab-row, .vocab-test, .test-row, .answer-row, .card') || target.parentElement;
      const inputs = Array.from(container?.querySelectorAll?.('input,textarea') || []);
      const control = inputs.find(input => isChinese(input.value));
      if (control && podcastScope(control, doc)) speakIfCorrect(control, doc);
    }
  }

  function attachDocument(doc) {
    if (!doc || attachedDocs.has(doc)) return;
    attachedDocs.add(doc);
    doc.addEventListener('click', event => handleClick(event, doc), true);
    doc.addEventListener('keydown', event => handleKeydown(event, doc), true);
    try {
      const observer = new MutationObserver(mutations => handleMutations(mutations, doc));
      observer.observe(doc.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'style'] });
    } catch (_) {}
  }

  function attachFrame(frame) {
    const tryAttach = () => {
      try { attachDocument(frame.contentDocument); } catch (_) {}
    };
    tryAttach();
    frame.addEventListener('load', tryAttach);
  }

  function scan() {
    attachDocument(document);
    document.querySelectorAll('iframe').forEach(attachFrame);
  }

  const pageObserver = new MutationObserver(scan);
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();

  window.lfPodcastAutoPronunciation = { enabled: true, behavior: 'speak-chinese-after-correct-podcast-input' };
})();
