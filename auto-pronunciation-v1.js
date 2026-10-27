/* LinguaFlash Auto Pronunciation v1
   Automatically plays learned words/sentences after correct typed answers.
   Multiple-choice answers are spoken immediately when the learner taps any option,
   whether that option is correct or incorrect.
   Reuses app.js speakSentence() so manual and automatic audio share the same TTS engine.
   Does not change grading, FSRS, accepted answers, or Learning Loop completion.
*/
(() => {
  'use strict';

  const LANG_LOCALE = {
    'Tiếng Trung': 'zh-CN', cn: 'zh-CN', zh: 'zh-CN',
    'Tiếng Anh': 'en-US', en: 'en-US',
    'Tiếng Việt': 'vi-VN', vn: 'vi-VN', vi: 'vi-VN'
  };

  let studyObserver = null;
  let studySpokenKey = '';

  function localeFor(language) {
    return LANG_LOCALE[language] || 'zh-CN';
  }

  function speak(text, language) {
    const value = String(text || '').trim();
    if (!value) return;
    const locale = localeFor(language);
    try {
      if (typeof speakSentence === 'function') {
        speakSentence(value, locale);
        return;
      }
    } catch (_) {}

    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.lang = locale;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function currentStudyInfo() {
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return null;
      const card = filteredDeck[currentIndex];
      if (!card) return null;
      const language = document.getElementById('studyLangFilter')?.value || card.lang || 'Tiếng Trung';
      const text = typeof getCardTextInLanguage === 'function'
        ? getCardTextInLanguage(card, language)
        : (card.word || card.front || '');
      return { card, language, text };
    } catch (_) {
      return null;
    }
  }

  function handleStudyFeedback() {
    const box = document.getElementById('studyAnswerFeedback');
    if (!box) return;
    const correct = !box.classList.contains('hidden') && box.className.includes('border-emerald-200');
    if (!correct) {
      studySpokenKey = '';
      return;
    }

    const info = currentStudyInfo();
    if (!info) return;
    const inputValue = document.getElementById('studyAnswerInput')?.value || '';
    const key = `${info.card?.id || ''}::${inputValue}::${box.textContent || ''}`;
    if (key === studySpokenKey) return;
    studySpokenKey = key;
    speak(info.text, info.language);
  }

  function observeStudyFeedback() {
    const box = document.getElementById('studyAnswerFeedback');
    if (!box || box.__lfAutoPronunciationObserved) return;
    box.__lfAutoPronunciationObserved = true;
    studyObserver?.disconnect();
    studyObserver = new MutationObserver(handleStudyFeedback);
    studyObserver.observe(box, { attributes: true, childList: true, subtree: true });
  }

  function getDialogueLine(lineIndex) {
    try {
      const select = document.getElementById('dialogueLessonSelector');
      const lessonKey = select?.value || Object.keys(DIALOGUES_DB || {})[0];
      const dialogue = (DIALOGUES_DB || {})[lessonKey];
      return dialogue?.lines?.[Number(lineIndex)] || null;
    } catch (_) {
      return null;
    }
  }

  function patchDialogueRecall() {
    const original = window.lfDialogueRecallCheck;
    if (typeof original !== 'function' || original.__lfAutoPronunciationPatched) return;

    const wrapped = function(lineIndex, field, ...rest) {
      const result = original.call(this, lineIndex, field, ...rest);
      setTimeout(() => {
        const input = document.getElementById(`lfDialogueInput-${lineIndex}-${field}`);
        if (!input?.classList.contains('ok')) return;
        const line = getDialogueLine(lineIndex);
        if (!line) return;
        const text = line[field] || '';
        const language = field === 'cn' ? 'cn' : field === 'en' ? 'en' : 'vn';
        speak(text, language);
      }, 0);
      return result;
    };
    wrapped.__lfAutoPronunciationPatched = true;
    window.lfDialogueRecallCheck = wrapped;
  }

  function dialoguePracticeExpected() {
    try {
      const question = typeof dialoguePracticeQuestion !== 'undefined' ? dialoguePracticeQuestion : null;
      const lang = document.getElementById('dialoguePracticeLang')?.value || 'cn';
      if (!question) return null;
      const expected = question.mode === 'comprehension'
        ? String(question.item?.a?.[lang] || question.item?.a?.vn || '')
        : String(question.item?.[lang] || '');
      return { text: expected, language: lang };
    } catch (_) {
      return null;
    }
  }

  function patchDialoguePractice() {
    let original;
    try { original = typeof checkDialoguePracticeAnswer === 'function' ? checkDialoguePracticeAnswer : window.checkDialoguePracticeAnswer; }
    catch (_) { original = window.checkDialoguePracticeAnswer; }
    if (typeof original !== 'function' || original.__lfAutoPronunciationPatched) return;

    const wrapped = function(...args) {
      const result = original.apply(this, args);
      setTimeout(() => {
        const box = document.getElementById('dialoguePracticeFeedback');
        if (!box || box.classList.contains('hidden') || !box.className.includes('border-emerald-200')) return;
        const info = dialoguePracticeExpected();
        if (info?.text) speak(info.text, info.language);
      }, 0);
      return result;
    };
    wrapped.__lfAutoPronunciationPatched = true;
    try { checkDialoguePracticeAnswer = wrapped; } catch (_) {}
    window.checkDialoguePracticeAnswer = wrapped;
  }

  function preferredQuizAudio(card) {
    try {
      const targetLanguage = typeof getQuizTargetLanguage === 'function' ? getQuizTargetLanguage() : 'Tiếng Trung';
      const supportLanguage = typeof getQuizSupportLanguage === 'function' ? getQuizSupportLanguage() : 'Tiếng Việt';
      const language = targetLanguage !== 'Tiếng Việt'
        ? targetLanguage
        : (supportLanguage !== 'Tiếng Việt' ? supportLanguage : targetLanguage);
      const text = typeof getQuizTextInLanguage === 'function'
        ? getQuizTextInLanguage(card, language)
        : (typeof getQuizTargetText === 'function' ? getQuizTargetText(card) : (card?.word || ''));
      return { text, language };
    } catch (_) {
      return null;
    }
  }

  function quizOptionInfo(button) {
    try {
      const mode = document.getElementById('quizModeSelect')?.value || '';
      if (mode !== 'mc_meaning' && mode !== 'mc_word') return null;

      const clone = button.cloneNode(true);
      clone.querySelectorAll('span').forEach(el => el.remove());
      const text = String(clone.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return null;

      let language = 'Tiếng Trung';
      if (mode === 'mc_meaning') {
        language = typeof getQuizTargetLanguage === 'function' ? getQuizTargetLanguage() : language;
      } else {
        language = typeof getQuizSupportLanguage === 'function' ? getQuizSupportLanguage() : 'Tiếng Việt';
      }
      return { text, language };
    } catch (_) {
      return null;
    }
  }

  function bindQuizOptionAudio() {
    if (document.__lfQuizOptionAudioBound) return;
    document.__lfQuizOptionAudioBound = true;

    document.addEventListener('click', event => {
      const button = event.target?.closest?.('button[id^="qopt-"]');
      if (!button) return;
      const info = quizOptionInfo(button);
      if (!info?.text) return;

      // Run after the inline grading handler. This guarantees the selected option's
      // audio is the final sound even when the option is correct.
      setTimeout(() => speak(info.text, info.language), 0);
    });
  }

  function patchQuizFeedback() {
    let original;
    try { original = typeof showQuizFeedback === 'function' ? showQuizFeedback : window.showQuizFeedback; }
    catch (_) { original = window.showQuizFeedback; }
    if (typeof original !== 'function' || original.__lfAutoPronunciationPatched) return;

    const wrapped = function(isCorrect, text, ...rest) {
      const result = original.call(this, isCorrect, text, ...rest);
      if (isCorrect) {
        try {
          const mode = document.getElementById('quizModeSelect')?.value || '';
          // Multiple choice is handled by the clicked option itself, for both right and wrong answers.
          if (mode === 'mc_meaning' || mode === 'mc_word') return result;

          const card = Array.isArray(quizDeck) ? quizDeck[quizIndex] : null;
          const audio = preferredQuizAudio(card);
          if (audio?.text) speak(audio.text, audio.language);
        } catch (_) {}
      }
      return result;
    };
    wrapped.__lfAutoPronunciationPatched = true;
    try { showQuizFeedback = wrapped; } catch (_) {}
    window.showQuizFeedback = wrapped;
  }

  function patchAll() {
    observeStudyFeedback();
    patchDialogueRecall();
    patchDialoguePractice();
    bindQuizOptionAudio();
    patchQuizFeedback();
  }

  const domObserver = new MutationObserver(() => patchAll());
  domObserver.observe(document.documentElement, { childList: true, subtree: true });

  const init = () => {
    patchAll();
    setTimeout(patchAll, 300);
    setTimeout(patchAll, 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.lfAutoPronunciation = {
    speak,
    enabled: true,
    behavior: 'typed-correct-and-every-multiple-choice-option'
  };
})();