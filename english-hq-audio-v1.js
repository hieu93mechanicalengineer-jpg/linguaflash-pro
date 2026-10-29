/* LinguaFlash · HQ English Audio v2
   - Plays stored English HQ audio for every user.
   - If the current account is admin and an item is missing, generates only that
     item on demand, stores it in Supabase, then plays it.
   - Normal users never call HeyGen; they fall back to device/browser TTS when
     an HQ file does not exist yet.
*/
(() => {
  'use strict';
  if (window.__LF_ENGLISH_HQ_AUDIO_V2__) return;
  window.__LF_ENGLISH_HQ_AUDIO_V2__ = true;

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
    const safePath = String(path || '').split('/').filter(Boolean).map(encodeURIComponent).join('/');
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safePath}`;
  }

  async function refresh() {
    if (!SUPABASE_URL || !API_KEY) { manifestLoaded = true; return 0; }
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/english_audio_manifest?select=audio_key,lesson_id,content_type,source_text,locale,generated_speed,storage_path,duration_seconds&locale=eq.en-US`;
      const response = await fetch(endpoint, { headers: { apikey: API_KEY, Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`HQ audio manifest HTTP ${response.status}`);
      const rows = await response.json();
      entries.clear();
      (Array.isArray(rows) ? rows : []).forEach(row => {
        if (row?.source_text && row?.storage_path) entries.set(norm(row.source_text), row);
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
  const getEntry = text => entries.get(norm(text)) || null;
  const has = text => !!getEntry(text);

  function stop() {
    if (!currentAudio) return;
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
    currentAudio = null;
  }

  function play(text, desiredRate = DEFAULT_RATE, hooks = {}) {
    const entry = getEntry(text);
    if (!entry) return false;
    stop();
    const audio = new Audio(storageUrl(entry.storage_path));
    const generatedRate = Number(entry.generated_speed) || 1;
    const requestedRate = Number(desiredRate) || DEFAULT_RATE;
    audio.preload = 'auto';
    audio.playbackRate = Math.max(0.5, Math.min(2, requestedRate / generatedRate));
    try { audio.preservesPitch = true; audio.webkitPreservesPitch = true; } catch (_) {}
    audio.onplay = () => { currentAudio = audio; try { hooks.onstart?.(); } catch (_) {} };
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; try { hooks.onend?.(); } catch (_) {} };
    audio.onerror = () => { if (currentAudio === audio) currentAudio = null; try { hooks.onerror?.(); } catch (_) {} };
    currentAudio = audio;
    const result = audio.play();
    result?.catch?.(error => { if (currentAudio === audio) currentAudio = null; try { hooks.onerror?.(error); } catch (_) {} });
    return true;
  }

  function playSequence(texts, desiredRate = DEFAULT_RATE) {
    const queue = (Array.isArray(texts) ? texts : []).filter(Boolean);
    if (!queue.length || !queue.every(has)) return false;
    let index = 0;
    const next = () => {
      if (index >= queue.length) return;
      play(queue[index++], desiredRate, { onend: next });
    };
    next();
    return true;
  }

  async function tryAdminGenerate(text, contentType = 'lesson') {
    try {
      const admin = window.LFEnglishAudioAdmin;
      if (!admin?.canGenerate?.() || typeof admin.ensureAudio !== 'function') return false;
      return !!(await admin.ensureAudio(text, contentType));
    } catch (_) {
      return false;
    }
  }

  function playForUtterance(utterance, rate, fallbackSpeak) {
    const text = String(utterance?.text || '').trim();
    const hooks = {
      onstart: () => { try { utterance.onstart?.(new Event('start')); } catch (_) {} },
      onend: () => { try { utterance.onend?.(new Event('end')); } catch (_) {} },
      onerror: () => { try { utterance.onerror?.(new Event('error')); } catch (_) {} }
    };

    if (has(text)) { play(text, rate, hooks); return; }

    tryAdminGenerate(text, 'lesson').then(ok => {
      if (ok && has(text)) play(text, rate, hooks);
      else fallbackSpeak(utterance);
    }).catch(() => fallbackSpeak(utterance));
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
          if (manifestLoaded && /^en(?:-|$)/i.test(lang) && text) {
            nativeCancel();
            const requested = Number(utterance?.rate);
            const rate = Number.isFinite(requested) && requested !== 1 ? requested : DEFAULT_RATE;
            if (has(text) || window.LFEnglishAudioAdmin?.canGenerate?.()) {
              playForUtterance(utterance, rate, nativeSpeak);
              return;
            }
          }
        } catch (_) {}
        nativeSpeak(utterance);
      };
      synth.cancel = () => { stop(); nativeCancel(); };
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
    if (document.__lfHQAudioControlsBoundV2) return;
    document.__lfHQAudioControlsBoundV2 = true;

    document.addEventListener('click', event => {
      const button = event.target?.closest?.('button');
      if (!button || !manifestLoaded) return;

      if (button.dataset?.audio) {
        const text = button.dataset.audio;
        if (has(text)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          try { window.speechSynthesis?.cancel?.(); } catch (_) {}
          play(text, DEFAULT_RATE);
          return;
        }
        if (window.LFEnglishAudioAdmin?.canGenerate?.()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          tryAdminGenerate(text, 'lesson').then(ok => {
            if (ok) play(text, DEFAULT_RATE);
          });
        }
        return;
      }

      if (button.dataset?.speed) {
        const text = coachFocusText(button);
        if (!text) return;
        const rate = Number(button.dataset.speed) || DEFAULT_RATE;
        if (has(text)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          try { window.speechSynthesis?.cancel?.(); } catch (_) {}
          play(text, rate);
          return;
        }
        if (window.LFEnglishAudioAdmin?.canGenerate?.()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          tryAdminGenerate(text, 'lesson').then(ok => { if (ok) play(text, rate); });
        }
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
    [300, 1200, 3000, 5000].forEach(ms => setTimeout(patchSpeakSentence, ms));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFEnglishHQAudio = {
    ready, refresh, has, play, playSequence, stop, getEntry,
    defaultRate: DEFAULT_RATE,
    bucket: BUCKET
  };
})();