/* LinguaFlash · Full Dialogue HQ Audio v2
   Unified dialogue playback on iOS/mobile.
   - Chinese/English prefer stored HQ audio.
   - Vietnamese and missing HQ use the untouched native speech bridge.
   - Avoids routing fallback speech through stacked HQ speechSynthesis patches.
*/
(() => {
  'use strict';
  if (window.__LF_DIALOGUE_FULL_HQ_V2__) return;
  window.__LF_DIALOGUE_FULL_HQ_V2__ = true;

  let playbackToken = 0;

  function toast(message, icon) {
    try { if (typeof window.showToast === 'function') window.showToast(message, icon || '🎧'); } catch (_) {}
  }

  function getDialogue() {
    try {
      if (typeof window.getCurrentDialogue === 'function') {
        const current = window.getCurrentDialogue();
        if (current?.dialogue) return current.dialogue;
      }
    } catch (_) {}
    try {
      const select = document.getElementById('dialogueLessonSelector');
      const key = select?.value || '';
      if (typeof DIALOGUES_DB !== 'undefined' && DIALOGUES_DB) {
        return DIALOGUES_DB[key] || DIALOGUES_DB[Object.keys(DIALOGUES_DB)[0]] || null;
      }
    } catch (_) {}
    return null;
  }

  function getPieces(dialogue, languageKey) {
    const lines = Array.isArray(dialogue?.lines) ? dialogue.lines : [];
    return lines.map(line => {
      if (languageKey === 'vn') return { text: String(line?.vn || '').trim(), lang: 'vi-VN' };
      if (languageKey === 'en') return { text: String(line?.en || '').trim(), lang: 'en-US' };
      return { text: String(line?.cn || '').trim(), lang: String(line?.lang || 'zh-CN') };
    }).filter(item => item.text);
  }

  function hqFor(languageKey) {
    if (languageKey === 'cn') return window.LFChineseHQAudio || null;
    if (languageKey === 'en') return window.LFEnglishHQAudio || null;
    return null;
  }

  function nativeSpeak(piece, onEnd) {
    const native = window.LFNativeSpeech;
    if (!native?.speak || typeof SpeechSynthesisUtterance === 'undefined') {
      onEnd();
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(piece.text);
      utterance.lang = piece.lang;
      utterance.rate = 0.88;
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      native.speak(utterance);
    } catch (_) { onEnd(); }
  }

  function stopAll(showMessage = false) {
    playbackToken += 1;
    try { window.LFChineseHQAudio?.stop?.(); } catch (_) {}
    try { window.LFEnglishHQAudio?.stop?.(); } catch (_) {}
    try { window.LFNativeSpeech?.cancel?.(); } catch (_) {
      try { window.speechSynthesis?.cancel?.(); } catch (__){ }
    }
    if (showMessage) toast('Đã dừng phát âm thanh', '⏹️');
  }

  function playFull(languageKey = 'cn') {
    const dialogue = getDialogue();
    const pieces = getPieces(dialogue, languageKey);
    if (!pieces.length) return false;

    stopAll(false);
    const token = ++playbackToken;
    const hq = hqFor(languageKey);
    let index = 0;

    const next = () => {
      if (token !== playbackToken || index >= pieces.length) return;
      const piece = pieces[index++];
      if (hq?.has?.(piece.text) && typeof hq.play === 'function') {
        const started = hq.play(piece.text, Number(hq.defaultRate) || 0.75, {
          onend: next,
          onerror: () => nativeSpeak(piece, next)
        });
        if (started) return;
      }
      nativeSpeak(piece, next);
    };

    next();
    toast(
      languageKey === 'vn'
        ? 'Đang phát bản tiếng Việt bằng giọng hệ thống…'
        : languageKey === 'en'
          ? 'Playing the full dialogue with HQ audio where available…'
          : 'Đang phát toàn bộ hội thoại bằng audio HQ…',
      '🎧'
    );
    return true;
  }

  const originalFull = typeof window.speakFullDialogue === 'function' ? window.speakFullDialogue : null;
  const originalStop = typeof window.stopDialogue === 'function' ? window.stopDialogue : null;

  if (originalFull) {
    const wrappedFull = function(languageKey = 'cn', ...rest) {
      if (playFull(languageKey)) return;
      return originalFull.apply(this, [languageKey, ...rest]);
    };
    wrappedFull.__lfDialogueFullHQPatchedV2 = true;
    window.speakFullDialogue = wrappedFull;
  }

  if (originalStop) {
    const wrappedStop = function(...rest) {
      stopAll(false);
      try { return originalStop.apply(this, rest); } catch (_) { toast('Đã dừng phát âm thanh', '⏹️'); }
    };
    wrappedStop.__lfDialogueFullHQPatchedV2 = true;
    window.stopDialogue = wrappedStop;
  }

  window.LFDialogueFullHQ = { play: playFull, stop: () => stopAll(true), getPieces };
})();
