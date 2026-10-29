/* LinguaFlash · HQ English Audio v1
   - Reads pre-generated English audio metadata from Supabase.
   - Plays stored audio first; falls back to existing browser TTS when no HQ file exists.
   - Keeps current learning logic unchanged.
*/
(() => {
  'use strict';
  if (window.__LF_ENGLISH_HQ_AUDIO_V1__) return;
  window.__LF_ENGLISH_HQ_AUDIO_V1__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const SUPABASE_URL = String(cfg.url || '').replace(/\/$/, '');
  const API_KEY = String(cfg.anonKey || '');
  const BUCKET = 'english-audio';
  const DEFAULT_RATE = 0.75;

  const entries = new Map();
  let manifestLoaded = false;
  let currentAudio = null;
  let originalSpeakSentence = null;
  let speechPatched = false;

  const norm = value => String(value || '')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  function storageUrl(path) {
    const safePath = String(path || '')
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safePath}`;
  }

  async function refresh() {
    if (!SUPABASE_URL || !API_KEY) {
      manifestLoaded = true;
      return 0;
    }
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/english_audio_manifest?select=audio_key,lesson_id,content_type,source_text,locale,generated_speed,storage_path,duration_seconds&locale=eq.en-US`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: API_KEY,
          Accept: 'application/json'
        },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`HQ audio manifest HTTP ${response.status}`);
      const rows = await response.json();
      entries.clear();
      (Array.isArray(rows) ? rows : []).forEach(row => {
        if (!row?.source_text || !row?.storage_path) return;
        entries.set(norm(row.source_text), row);
      });
      manifestLoaded = true;
      return entries.size;
    } catch (error) {
      console.warn('[LinguaFlash HQ Audio] manifest unavailable; browser TTS remains active.', error);
      manifestLoaded = true;
      return 0;
    }
  }

  const ready = refresh();

  function getEntry(text) {
    return entries.get(norm(text)) || null;
  }

  function has(text) {
    return !!getEntry(text);
  }

  function stop() {
    if (!currentAudio) return;
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}
    currentAudio = null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function play(text, desiredRate = DEFAULT_RATE, hooks = {}) {
    const entry = getEntry(text);
    if (!entry) return false;

    stop();
    const audio = new Audio(storageUrl(entry.storage_path));
    const generatedRate = Number(entry.generated_speed) || DEFAULT_RATE;
    const requestedRate = Number(desiredRate) || DEFAULT_RATE;
    audio.preload = 'auto';
    audio.playbackRate = clamp(requestedRate / generatedRate, 0.5, 2);
    try { audio.preservesPitch = true; } catch (_) {}
    try { audio.webkitPreservesPitch = true; } catch (_) {}

    audio.onplay = () => {
      currentAudio = audio;
      try { hooks.onstart?.(); } catch (_) {}
    };
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      try { hooks.onend?.(); } catch (_) {}
    };
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      try { hooks.onerror?.(); } catch (_) {}
    };

    currentAudio = audio;
    const result = audio.play();
    if (result?.catch) {
      result.catch(error => {
        if (currentAudio === audio) currentAudio = null;
        console.warn('[LinguaFlash HQ Audio] playback failed.', error);
        try { hooks.onerror?.(error); } catch (_) {}
      });
    }
    return true;
  }

  function playSequence(texts, desiredRate = DEFAULT_RATE) {
    const queue = (Array.isArray(texts) ? texts : []).filter(Boolean);
    if (!queue.length || !queue.every(has)) return false;
    let index = 0;
    const next = () => {
      if (index >= queue.length) return;
      const text = queue[index++];
      play(text, desiredRate, { onend: next });
    };
    next();
    return true;
  }

  function patchSpeechSynthesis() {
    if (speechPatched || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    try {
      const nativeSpeak = synth.speak.bind(synth);
      const nativeCancel = synth.cancel.bind(synth);
      synth.speak = utterance => {
        try {
          const text = String(utterance?.text || '').trim();
          const lang = String(utterance?.lang || '');
          if (manifestLoaded && /^en(?:-|$)/i.test(lang) && has(text)) {
            nativeCancel();
            const requested = Number(utterance?.rate);
            const rate = Number.isFinite(requested) && requested !== 1 ? requested : DEFAULT_RATE;
            play(text, rate, {
              onstart: () => {
                try { utterance.onstart?.(new Event('start')); } catch (_) {}
              },
              onend: () => {
                try { utterance.onend?.(new Event('end')); } catch (_) {}
              },
              onerror: () => {
                try { utterance.onerror?.(new Event('error')); } catch (_) {}
              }
            });
            return;
          }
        } catch (_) {}
        nativeSpeak(utterance);
      };
      synth.cancel = () => {
        stop();
        nativeCancel();
      };
      speechPatched = true;
    } catch (error) {
      console.warn('[LinguaFlash HQ Audio] speechSynthesis patch skipped.', error);
    }
  }

  function patchSpeakSentence() {
    try {
      if (typeof window.speakSentence !== 'function') return;
      if (window.speakSentence.__lfHQAudioPatched) return;
      originalSpeakSentence = window.speakSentence;
      const wrapped = function(text, locale, ...rest) {
        const lang = String(locale || '');
        if (/^en(?:-|$)/i.test(lang) && manifestLoaded && has(text)) {
          play(text, DEFAULT_RATE);
          return;
        }
        return originalSpeakSentence.call(this, text, locale, ...rest);
      };
      wrapped.__lfHQAudioPatched = true;
      window.speakSentence = wrapped;
    } catch (_) {}
  }

  function coachFocusText(button) {
    const card = button?.closest?.('.lf51d-coachCard');
    return card?.querySelector?.('.lf51d-coachMain')?.textContent?.trim() || '';
  }

  function bindDesktopControls() {
    if (document.__lfHQAudioControlsBound) return;
    document.__lfHQAudioControlsBound = true;

    document.addEventListener('click', event => {
      const button = event.target?.closest?.('button');
      if (!button || !manifestLoaded) return;

      if (button.dataset?.audio) {
        const text = button.dataset.audio;
        if (!has(text)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        try { window.speechSynthesis?.cancel?.(); } catch (_) {}
        play(text, DEFAULT_RATE);
        return;
      }

      if (button.dataset?.speed) {
        const text = coachFocusText(button);
        if (!text || !has(text)) return;
        const rate = Number(button.dataset.speed) || DEFAULT_RATE;
        event.preventDefault();
        event.stopImmediatePropagation();
        try { window.speechSynthesis?.cancel?.(); } catch (_) {}
        play(text, rate);
        return;
      }

      if (button.hasAttribute?.('data-play-dialogue')) {
        const texts = [...document.querySelectorAll('#lf51DesktopWorkspace .lf51d-line button[data-audio]')]
          .map(el => el.dataset.audio)
          .filter(Boolean);
        if (!texts.length || !texts.every(has)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        try { window.speechSynthesis?.cancel?.(); } catch (_) {}
        playSequence(texts, DEFAULT_RATE);
      }
    }, true);
  }

  function init() {
    patchSpeechSynthesis();
    patchSpeakSentence();
    bindDesktopControls();
    setTimeout(patchSpeakSentence, 300);
    setTimeout(patchSpeakSentence, 1200);
    setTimeout(patchSpeakSentence, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.LFEnglishHQAudio = {
    ready,
    refresh,
    has,
    play,
    playSequence,
    stop,
    getEntry,
    defaultRate: DEFAULT_RATE,
    bucket: BUCKET
  };
})();