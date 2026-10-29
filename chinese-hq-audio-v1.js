/* LinguaFlash · HQ Chinese Audio v2
   - Plays stored Chinese HQ audio for every user.
   - If the current account is admin and an item is missing, generates only that
     item on demand, stores it in Supabase, then plays it.
   - Normal users never call HeyGen; they fall back to device/browser TTS when
     an HQ file does not exist yet.
*/
(() => {
  'use strict';
  if (window.__LF_CHINESE_HQ_AUDIO_V2__) return;
  window.__LF_CHINESE_HQ_AUDIO_V2__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const SUPABASE_URL = String(cfg.url || '').replace(/\/$/, '');
  const API_KEY = String(cfg.anonKey || '');
  const BUCKET = 'chinese-audio';
  const DEFAULT_RATE = 0.75;
  const entries = new Map();
  let manifestLoaded = false;
  let currentAudio = null;
  let speechPatched = false;
  let originalSpeakText = null;
  let originalSpeakSentence = null;

  const norm = value => String(value || '').replace(/\s+/g, ' ').trim();
  const isZhLocale = value => /^zh(?:-|$)/i.test(String(value || ''));
  const isZhLabel = value => String(value || '').includes('Trung') || String(value || '').includes('中文') || isZhLocale(value);

  function storageUrl(path) {
    const safePath = String(path || '').split('/').filter(Boolean).map(encodeURIComponent).join('/');
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safePath}`;
  }

  async function refresh() {
    if (!SUPABASE_URL || !API_KEY) { manifestLoaded = true; return 0; }
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/chinese_audio_manifest?select=audio_key,lesson_id,content_type,source_text,locale,generated_speed,storage_path,duration_seconds&locale=eq.zh-CN`;
      const response = await fetch(endpoint, { headers: { apikey: API_KEY, Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`Chinese HQ manifest HTTP ${response.status}`);
      const rows = await response.json();
      entries.clear();
      (Array.isArray(rows) ? rows : []).forEach(row => {
        if (row?.source_text && row?.storage_path) entries.set(norm(row.source_text), row);
      });
      manifestLoaded = true;
      return entries.size;
    } catch (error) {
      console.warn('[LinguaFlash Chinese HQ Audio] manifest unavailable; fallback TTS remains active.', error);
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

  async function tryAdminGenerate(text) {
    try {
      const admin = window.LFChineseAudioAdmin;
      if (!admin?.canGenerate?.() || typeof admin.ensureAudio !== 'function') return false;
      return !!(await admin.ensureAudio(text, 'ondemand'));
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

    if (has(text)) {
      play(text, rate, hooks);
      return;
    }

    // Admin only: generate exactly this missing item, then play it. For normal
    // users tryAdminGenerate returns false and the original TTS is used.
    tryAdminGenerate(text).then(ok => {
      if (ok && has(text)) {
        play(text, rate, hooks);
      } else {
        fallbackSpeak(utterance);
      }
    }).catch(() => fallbackSpeak(utterance));
  }

  function patchSpeechSynthesis() {
    if (speechPatched || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    try {
      const previousSpeak = synth.speak.bind(synth);
      const previousCancel = synth.cancel.bind(synth);
      synth.speak = utterance => {
        try {
          const text = String(utterance?.text || '').trim();
          const lang = String(utterance?.lang || '');
          if (manifestLoaded && isZhLocale(lang) && text) {
            previousCancel();
            const requested = Number(utterance?.rate);
            const rate = Number.isFinite(requested) && requested !== 1 ? requested : DEFAULT_RATE;

            if (has(text)) {
              playForUtterance(utterance, rate, previousSpeak);
              return;
            }

            const admin = window.LFChineseAudioAdmin;
            if (admin?.canGenerate?.()) {
              playForUtterance(utterance, rate, previousSpeak);
              return;
            }
          }
        } catch (_) {}
        previousSpeak(utterance);
      };
      synth.cancel = () => { stop(); previousCancel(); };
      speechPatched = true;
    } catch (error) {
      console.warn('[LinguaFlash Chinese HQ Audio] speech patch skipped.', error);
    }
  }

  function patchAppFunctions() {
    try {
      if (typeof window.speakText === 'function' && !window.speakText.__lfChineseHQPatched) {
        originalSpeakText = window.speakText;
        const wrapped = function(text, langLabel, ...rest) {
          if (manifestLoaded && isZhLabel(langLabel) && has(text)) { play(text, DEFAULT_RATE); return; }
          return originalSpeakText.call(this, text, langLabel, ...rest);
        };
        wrapped.__lfChineseHQPatched = true;
        window.speakText = wrapped;
      }
      if (typeof window.speakSentence === 'function' && !window.speakSentence.__lfChineseHQPatched) {
        originalSpeakSentence = window.speakSentence;
        const wrappedSentence = function(text, locale, ...rest) {
          if (manifestLoaded && isZhLocale(locale) && has(text)) { play(text, DEFAULT_RATE); return; }
          return originalSpeakSentence.call(this, text, locale, ...rest);
        };
        wrappedSentence.__lfChineseHQPatched = true;
        window.speakSentence = wrappedSentence;
      }
    } catch (_) {}
  }

  function init() {
    patchSpeechSynthesis();
    patchAppFunctions();
    [300, 1000, 2500, 5000].forEach(ms => setTimeout(patchAppFunctions, ms));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFChineseHQAudio = {
    ready, refresh, has, play, playSequence, stop, getEntry,
    defaultRate: DEFAULT_RATE,
    bucket: BUCKET
  };
})();