/* LinguaFlash · Native Speech Bridge v1
   Captures untouched browser speech APIs before HQ wrappers are installed, then
   routes dialogue line playback without chaining English/Chinese speech patches.
   iOS goal: Chinese/English prefer HQ; Vietnamese and missing HQ use native TTS.
*/
(() => {
  'use strict';
  if (window.__LF_NATIVE_SPEECH_BRIDGE_V1__) return;
  window.__LF_NATIVE_SPEECH_BRIDGE_V1__ = true;

  const synth = window.speechSynthesis;
  const native = {
    speak: synth?.speak ? synth.speak.bind(synth) : null,
    cancel: synth?.cancel ? synth.cancel.bind(synth) : null,
    pause: synth?.pause ? synth.pause.bind(synth) : null,
    resume: synth?.resume ? synth.resume.bind(synth) : null
  };
  window.LFNativeSpeech = native;

  let nativeUtterance = null;

  function stopAll() {
    try { window.LFEnglishHQAudio?.stop?.(); } catch (_) {}
    try { window.LFChineseHQAudio?.stop?.(); } catch (_) {}
    try { native.cancel?.(); } catch (_) {}
    nativeUtterance = null;
  }

  function nativeSpeak(text, lang = 'en-US', rate = 0.88) {
    const clean = String(text || '').trim();
    if (!clean || !native.speak || typeof SpeechSynthesisUtterance === 'undefined') return false;
    try {
      stopAll();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang || 'en-US';
      u.rate = Number(rate) || 0.88;
      nativeUtterance = u;
      u.onend = () => { if (nativeUtterance === u) nativeUtterance = null; };
      u.onerror = () => { if (nativeUtterance === u) nativeUtterance = null; };
      native.speak(u);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function tryGenerate(lang, text) {
    try {
      if (/^en(?:-|$)/i.test(lang)) {
        const admin = window.LFEnglishAudioAdmin;
        if (admin?.canGenerate?.() && typeof admin.ensureAudio === 'function') {
          return !!(await admin.ensureAudio(text, 'dialogue'));
        }
      }
      if (/^zh(?:-|$)/i.test(lang)) {
        const admin = window.LFChineseAudioAdmin;
        if (admin?.canGenerate?.() && typeof admin.ensureAudio === 'function') {
          return !!(await admin.ensureAudio(text, 'dialogue'));
        }
      }
    } catch (_) {}
    return false;
  }

  function route(text, locale = 'en-US', rate = 0.88) {
    const clean = String(text || '').trim();
    const lang = String(locale || '');
    if (!clean) return;

    stopAll();

    if (/^en(?:-|$)/i.test(lang)) {
      const hq = window.LFEnglishHQAudio;
      if (hq?.has?.(clean) && hq?.play?.(clean, rate)) return;
      tryGenerate(lang, clean).then(ok => {
        if (ok && window.LFEnglishHQAudio?.has?.(clean)) {
          window.LFEnglishHQAudio.play(clean, rate);
        } else nativeSpeak(clean, 'en-US', rate);
      }).catch(() => nativeSpeak(clean, 'en-US', rate));
      return;
    }

    if (/^zh(?:-|$)/i.test(lang)) {
      const hq = window.LFChineseHQAudio;
      if (hq?.has?.(clean) && hq?.play?.(clean, rate)) return;
      tryGenerate(lang, clean).then(ok => {
        if (ok && window.LFChineseHQAudio?.has?.(clean)) {
          window.LFChineseHQAudio.play(clean, rate);
        } else nativeSpeak(clean, lang || 'zh-CN', rate);
      }).catch(() => nativeSpeak(clean, lang || 'zh-CN', rate));
      return;
    }

    // Vietnamese and other locales never pass through HQ speechSynthesis wrappers.
    nativeSpeak(clean, lang || 'vi-VN', rate);
  }

  function patchSpeakSentence() {
    if (typeof window.speakSentence !== 'function') return;
    if (window.speakSentence.__lfNativeBridgeV1) return;
    const wrapped = function(text, locale, ..._rest) {
      route(text, locale || 'en-US', 0.88);
    };
    wrapped.__lfNativeBridgeV1 = true;
    window.speakSentence = wrapped;
  }

  function initLate() {
    patchSpeakSentence();
    [80, 250, 700, 1500, 3000, 5000].forEach(ms => setTimeout(patchSpeakSentence, ms));
  }

  // HQ scripts are loaded synchronously after this bridge; defer our final router
  // so it becomes the outermost speakSentence implementation.
  setTimeout(initLate, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLate, { once: true });
  else initLate();

  window.LFNativeAudioBridge = { route, speak: nativeSpeak, stop: stopAll, native };
})();
