/* LinguaFlash · English Mobile Practice Add-on v1
   Safe companion module for the stable v80 mobile Lesson Mode.
   Adds Speaking + Listening without modifying the v77 lesson UI.
   No MutationObserver, no document-level touch interception, no flashcard patching.
*/
(() => {
  'use strict';
  if (window.__LF_ENGLISH_MOBILE_PRACTICE_V1__) return;
  window.__LF_ENGLISH_MOBILE_PRACTICE_V1__ = true;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const norm = value => String(value || '')
    .toLowerCase().normalize('NFKC').replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

  const DATA = {
    health: {
      title: 'Sức khỏe & Công việc',
      speaking: [
        ['Teacher','Hi! When was the last time you caught a cold?'],
        ['You','It was a couple of months ago. I went out in the heavy rain without an umbrella and got all wet.'],
        ['Teacher','Oh no! How did you feel and what did you do?'],
        ['You',"I didn't feel well and I had a terrible headache. I went to the hospital, took some medicine, and stayed at home to have a good rest."]
      ],
      listening: [
        ["You don't look well. What happened?",'Trông bạn không được khỏe. Đã có chuyện gì xảy ra vậy?'],
        ['Jenny is not feeling well because she has a headache.','Jenny cảm thấy không khỏe vì cô ấy bị đau đầu.'],
        ['It is raining outside. Remember to bring an umbrella.','Bên ngoài trời đang mưa. Hãy nhớ mang theo một chiếc ô.'],
        ['Daisy caught a cold yesterday. She needs some rest.','Hôm qua Daisy bị cảm lạnh. Cô ấy cần nghỉ ngơi một chút.'],
        ['It takes time for me to adapt to a new working environment.','Tôi cần thời gian để thích nghi với một môi trường làm việc mới.'],
        ['A couple of months after I moved to London, I felt completely at home there.','Một vài tháng sau khi chuyển đến London, tôi cảm thấy hoàn toàn quen thuộc như ở nhà.'],
        ["Did you take an umbrella with you?",'Bạn có mang theo ô không?'],
        ['Drinking more water may make you feel better.','Uống thêm nước có thể giúp bạn cảm thấy khỏe hơn.']
      ]
    },
    birthday: {
      title: 'Unit 1 · My Birthday Is Coming!',
      speaking: [
        ['Teacher',"Hi! What's the date today?"],
        ['You',"It's October 29th. My birthday is coming soon!"],
        ['Teacher','Really? When is your birthday?'],
        ['You','The date of my birthday is on November 5th. I am busy with my work all week, so I will have a small party at home.'],
        ['Teacher','Happy early birthday to you!'],
        ['You','Thank you! You are the first one to say “Happy birthday” to me!']
      ],
      listening: [
        ["What's the date today?",'Hôm nay là ngày mấy?'],
        ["My friend Tim's birthday is on May 30th.",'Sinh nhật của bạn tôi Tim vào ngày 30 tháng 5.'],
        ['Ben is busy with his work all the time.','Lúc nào Ben cũng bận rộn với công việc của anh ấy.'],
        ['Lee is the first one to finish the work.','Lee là người đầu tiên hoàn thành công việc.'],
        ['I am busy with my work all day.','Tôi bận rộn với công việc của mình suốt cả ngày.'],
        ['Erica is the first one to say happy birthday to me.','Erica là người đầu tiên chúc mừng sinh nhật tôi.'],
        ["It's May 28th. It's only one week from your birthday.",'Hôm nay là ngày 28 tháng 5. Chỉ còn một tuần nữa là đến sinh nhật bạn.'],
        ['I was so busy with my work that I forgot all about it!','Tôi bận công việc quá đến nỗi quên khuấy đi mất!']
      ]
    },
    family: {
      title: 'Unit 6 · You Look Just Like Your Dad',
      speaking: [
        ['Teacher','Hi! Were you fat when you were a child?'],
        ['You · Cách 1','Yes, I was a fat baby at that time. But I am thinner now by playing sports!'],
        ['You · Cách 2',"No, I wasn't. I was thin when I was a child, and I am taller than my dad now."],
        ['Teacher','Who do you look like in your family?'],
        ['You','I look just like my dad. I have his eyes and nose!']
      ],
      listening: [
        ["I don't want to be fat any more.",'Tôi không muốn bị béo thêm nữa.'],
        ['The baby is 10 months old now.','Em bé hiện giờ đã được 10 tháng tuổi.'],
        ['Emily becomes thin by running.','Emily trở nên thon gầy nhờ việc chạy bộ.'],
        ['Bella is taller than her mother now.','Bella bây giờ đã cao hơn mẹ của cô ấy.'],
        ['These little cats are super cute.','Những chú mèo nhỏ này cực kỳ đáng yêu.'],
        ['We are taller than our dad now.','Bây giờ chúng tôi đã cao hơn bố của mình.'],
        ['You look just like your mom in the picture.','Bạn trông giống hệt mẹ của bạn trong bức ảnh.'],
        ['I am thinner now, and I am taller than my dad.','Bây giờ tôi gầy hơn và cao hơn bố mình.']
      ]
    }
  };

  let mode = 'speaking';
  let listenIndex = 0;
  let recognition = null;
  let playingToken = 0;

  function isMobileDevice() {
    const ua = String(navigator.userAgent || '');
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    let coarse = false;
    try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
    const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
    return mobileUA || (touch && coarse && shortSide <= 1024);
  }

  function lessonId() {
    const select = document.getElementById('lfEnglishLessonSelect');
    if (select && DATA[select.value]) return select.value;
    try {
      const stored = localStorage.getItem('lf_mobile_english_lesson_v1');
      if (DATA[stored]) return stored;
    } catch (_) {}
    return 'birthday';
  }

  function speak(text, rate = 0.82, onEnd) {
    if (!text) { onEnd?.(); return; }
    ++playingToken;
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        if (onEnd) u.onend = onEnd;
        speechSynthesis.speak(u);
        return;
      }
    } catch (_) {}
    try { window.lfSpeak51TalkEnglish?.(text); } catch (_) {}
    onEnd?.();
  }

  function speakSequence(lines) {
    const token = ++playingToken;
    const queue = lines.filter(Boolean).slice();
    const next = () => {
      if (token !== playingToken || !queue.length) return;
      const text = queue.shift();
      try {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-US';
          u.rate = 0.82;
          u.onend = next;
          speechSynthesis.speak(u);
        } else next();
      } catch (_) { next(); }
    };
    try { speechSynthesis?.cancel?.(); } catch (_) {}
    next();
  }

  function scoreWords(spoken, target) {
    const a = norm(spoken).split(' ').filter(Boolean);
    const b = norm(target).split(' ').filter(Boolean);
    if (!b.length) return 0;
    let same = 0;
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) if (a[i] && b[i] && a[i] === b[i]) same++;
    return Math.round((same / b.length) * 100);
  }

  function ensureStyle() {
    if (document.getElementById('lfEnglishPracticeV1Style')) return;
    const s = document.createElement('style');
    s.id = 'lfEnglishPracticeV1Style';
    s.textContent = `
      #lfEnglishPracticeV1{display:none;width:100%;max-width:860px;margin:0 auto 28px;padding:0 10px;box-sizing:border-box;color:#0f172a}
      body.lf-english-mobile-v1-active #lfEnglishPracticeV1{display:block}
      #lfEnglishPracticeV1 *{box-sizing:border-box}
      .lfp-shell{background:#fff;border:1px solid #dbe3ef;border-radius:18px;padding:12px;box-shadow:0 4px 16px rgba(15,23,42,.05)}
      .lfp-title{font-size:16px;font-weight:950;color:#173b74;margin:0 0 9px}.lfp-sub{font-size:12px;color:#64748b;margin:-3px 0 10px}
      .lfp-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px}.lfp-tab{min-height:46px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#475569;font-size:13px;font-weight:900;touch-action:manipulation}.lfp-tab.active{background:#0f4c81;color:#fff;border-color:#0f4c81}
      .lfp-card{border:1px solid #e2e8f0;border-radius:14px;padding:12px;margin-top:9px;background:#f8fafc}.lfp-role{display:inline-block;font-size:11px;font-weight:900;color:#1d4ed8;background:#dbeafe;border-radius:999px;padding:4px 8px;margin-bottom:6px}.lfp-role.you{color:#047857;background:#d1fae5}
      .lfp-en{font-size:15px;line-height:1.5;font-weight:750;color:#172033}.lfp-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.lfp-btn{min-height:40px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#334155;padding:7px 10px;font-size:12px;font-weight:850;touch-action:manipulation}.lfp-btn.primary{background:#2563eb;border-color:#2563eb;color:#fff}.lfp-btn.mic{background:#ecfdf5;border-color:#a7f3d0;color:#047857}
      .lfp-result{margin-top:8px;font-size:12px;line-height:1.5;color:#475569}.lfp-listen-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:#64748b;font-weight:800}.lfp-prompt{font-size:18px;font-weight:950;text-align:center;padding:22px 8px 14px;color:#173b74}.lfp-input{width:100%;min-height:46px;border:1px solid #cbd5e1;border-radius:11px;padding:10px 12px;font-size:16px;color:#0f172a;background:#fff;outline:none}.lfp-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.12)}.lfp-answer{margin-top:10px;padding:10px;border-radius:10px;background:#eff6ff;color:#1e3a8a;font-size:13px;line-height:1.5}.lfp-vi{margin-top:5px;color:#64748b}.lfp-score{font-weight:900}.lfp-score.good{color:#15803d}.lfp-score.try{color:#b45309}
      @media (orientation:landscape){#lfEnglishPracticeV1{max-width:980px}.lfp-shell{padding:14px}.lfp-card{padding:13px}}
    `;
    document.head.appendChild(s);
  }

  function ensurePanel() {
    let panel = document.getElementById('lfEnglishPracticeV1');
    if (panel) return panel;
    const root = document.getElementById('lfEnglishMobileV1');
    if (!root?.parentElement) return null;
    panel = document.createElement('section');
    panel.id = 'lfEnglishPracticeV1';
    root.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderSpeaking(D) {
    const recSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    return `<div class="lfp-actions"><button type="button" class="lfp-btn primary" data-speak-all>▶ Nghe cả đoạn</button></div>` +
      D.speaking.map((line, i) => {
        const you = /^You/.test(line[0]);
        return `<article class="lfp-card"><span class="lfp-role ${you?'you':''}">${esc(line[0])}</span><div class="lfp-en">${esc(line[1])}</div><div class="lfp-actions"><button type="button" class="lfp-btn" data-speak="${esc(line[1])}">🔊 Nghe mẫu</button>${you && recSupported ? `<button type="button" class="lfp-btn mic" data-record="${i}">🎙️ Nói câu này</button>` : ''}</div><div class="lfp-result" id="lfpSpeechResult${i}">${you && !recSupported ? 'Thiết bị/trình duyệt này chưa hỗ trợ chấm giọng nói; bạn vẫn có thể nghe mẫu và nói theo.' : ''}</div></article>`;
      }).join('');
  }

  function renderListening(D) {
    const items = D.listening;
    listenIndex = ((listenIndex % items.length) + items.length) % items.length;
    const item = items[listenIndex];
    return `<article class="lfp-card"><div class="lfp-listen-head"><span>Listening Dictation</span><span>${listenIndex+1}/${items.length}</span></div><div class="lfp-prompt">🎧 Nghe rồi gõ lại câu tiếng Anh</div><div class="lfp-actions"><button type="button" class="lfp-btn" data-listen="${esc(item[0])}" data-rate="0.75">🐢 0.75×</button><button type="button" class="lfp-btn primary" data-listen="${esc(item[0])}" data-rate="1">▶ 1×</button></div><input id="lfpListenInput" class="lfp-input" autocomplete="off" spellcheck="false" placeholder="Gõ câu bạn nghe được..."><div class="lfp-actions"><button type="button" class="lfp-btn primary" data-check-listen>Kiểm tra</button><button type="button" class="lfp-btn" data-show-meaning>💡 Gợi ý nghĩa</button></div><div id="lfpListenResult" class="lfp-result"></div><div class="lfp-actions"><button type="button" class="lfp-btn" data-listen-prev>← Trước</button><button type="button" class="lfp-btn" data-listen-next>Tiếp →</button></div></article>`;
  }

  function render() {
    const panel = ensurePanel();
    if (!panel) return;
    const id = lessonId();
    const D = DATA[id] || DATA.birthday;
    panel.innerHTML = `<div class="lfp-shell"><h3 class="lfp-title">🎯 Luyện tập thêm · ${esc(D.title)}</h3><p class="lfp-sub">Module phụ độc lập — không thay đổi Lesson Mode đang ổn.</p><div class="lfp-tabs"><button type="button" class="lfp-tab ${mode==='speaking'?'active':''}" data-practice-mode="speaking">🗣️ Luyện nói</button><button type="button" class="lfp-tab ${mode==='listening'?'active':''}" data-practice-mode="listening">🎧 Listening</button></div>${mode==='speaking'?renderSpeaking(D):renderListening(D)}</div>`;
  }

  function currentListening() {
    const D = DATA[lessonId()] || DATA.birthday;
    const items = D.listening;
    listenIndex = ((listenIndex % items.length) + items.length) % items.length;
    return items[listenIndex];
  }

  function checkListening() {
    const item = currentListening();
    const input = document.getElementById('lfpListenInput');
    const out = document.getElementById('lfpListenResult');
    if (!item || !input || !out) return;
    const score = scoreWords(input.value, item[0]);
    const good = score >= 85;
    out.innerHTML = `<div class="lfp-score ${good?'good':'try'}">${good?'✅':'🟡'} Độ khớp: ${score}%</div><div class="lfp-answer"><b>Đáp án:</b> ${esc(item[0])}<div class="lfp-vi">${esc(item[1])}</div></div>`;
  }

  function startRecognition(index) {
    const D = DATA[lessonId()] || DATA.birthday;
    const target = D.speaking[index]?.[1] || '';
    const C = window.SpeechRecognition || window.webkitSpeechRecognition;
    const out = document.getElementById(`lfpSpeechResult${index}`);
    if (!C || !out || !target) return;
    try { recognition?.abort?.(); } catch (_) {}
    try {
      recognition = new C();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      out.textContent = '🎙️ Đang nghe...';
      recognition.onresult = e => {
        const spoken = e.results?.[0]?.[0]?.transcript || '';
        const score = scoreWords(spoken, target);
        out.innerHTML = `<b>Bạn nói:</b> ${esc(spoken)}<br><span class="lfp-score ${score>=80?'good':'try'}">Khớp khoảng ${score}%</span>`;
      };
      recognition.onerror = () => { out.textContent = 'Không nhận được giọng nói. Hãy thử lại hoặc kiểm tra quyền microphone.'; };
      recognition.start();
    } catch (_) { out.textContent = 'Không thể mở microphone trên trình duyệt này.'; }
  }

  function bind() {
    const panel = ensurePanel();
    const root = document.getElementById('lfEnglishMobileV1');
    if (!panel || !root) return false;
    if (panel.dataset.bound !== '1') {
      panel.dataset.bound = '1';
      panel.addEventListener('click', e => {
        const m = e.target.closest?.('[data-practice-mode]');
        if (m) { mode = m.dataset.practiceMode; render(); return; }
        const s = e.target.closest?.('[data-speak]');
        if (s) { speak(s.dataset.speak, 0.82); return; }
        if (e.target.closest?.('[data-speak-all]')) {
          const D = DATA[lessonId()] || DATA.birthday;
          speakSequence(D.speaking.map(x => x[1]));
          return;
        }
        const rec = e.target.closest?.('[data-record]');
        if (rec) { startRecognition(Number(rec.dataset.record)); return; }
        const l = e.target.closest?.('[data-listen]');
        if (l) { speak(l.dataset.listen, Number(l.dataset.rate || 0.82)); return; }
        if (e.target.closest?.('[data-check-listen]')) { checkListening(); return; }
        if (e.target.closest?.('[data-show-meaning]')) {
          const item = currentListening();
          const out = document.getElementById('lfpListenResult');
          if (out && item) out.innerHTML = `<div class="lfp-answer"><b>Gợi ý:</b> ${esc(item[1])}</div>`;
          return;
        }
        if (e.target.closest?.('[data-listen-prev]')) { listenIndex--; render(); return; }
        if (e.target.closest?.('[data-listen-next]')) { listenIndex++; render(); return; }
      });
      panel.addEventListener('keydown', e => {
        if (e.target?.id === 'lfpListenInput' && e.key === 'Enter') { e.preventDefault(); checkListening(); }
      });
    }
    if (root.dataset.practiceAddonBound !== '1') {
      root.dataset.practiceAddonBound = '1';
      root.addEventListener('change', e => {
        if (e.target?.id === 'lfEnglishLessonSelect') {
          listenIndex = 0;
          setTimeout(render, 0);
        }
      });
    }
    return true;
  }

  function init() {
    if (!isMobileDevice()) return;
    ensureStyle();
    let tries = 0;
    const attach = () => {
      tries++;
      if (bind()) { render(); return; }
      if (tries < 30) setTimeout(attach, 150);
    };
    attach();
    window.addEventListener('pageshow', () => setTimeout(() => { if (bind()) render(); }, 80), { passive:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
