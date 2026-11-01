/* LinguaFlash · Study List Hanzi Zoom v1
   Tap/click Chinese source text in Study List to open a large, card-like Hanzi view.
   Keeps hidden-answer state intact: the zoom view shows Hanzi only + audio.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_LIST_HANZI_ZOOM_V1__) return;
  window.__LF_STUDY_LIST_HANZI_ZOOM_V1__ = true;

  const OVERLAY_ID = 'lfHanziZoomOverlay';
  const STYLE_ID = 'lfHanziZoomStyle';
  const hasHan = v => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(v || ''));
  const clean = v => String(v || '').replace(/\s+/g, ' ').trim();

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
#lfStudyListPanel .lfsl-source{transition:background-color .15s ease,border-color .15s ease}
#lfStudyListPanel .lfsl-source:hover{background:#f8fafc}
#lfStudyListPanel .lfsl-source[data-lf-hanzi-clickable="1"]{cursor:zoom-in;border-radius:8px;padding:2px 5px;margin:-2px -5px;touch-action:manipulation}
#${OVERLAY_ID}{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(15,23,42,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
#${OVERLAY_ID}.open{display:flex}
.lfhz-card{position:relative;width:min(92vw,760px);min-height:min(64vh,560px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:44px 36px 34px;border-radius:28px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.34);text-align:center}
.lfhz-word{max-width:100%;font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei","Heiti SC",sans-serif;font-size:clamp(88px,15vw,190px);line-height:1.12;font-weight:850;color:#0f172a;letter-spacing:.03em;overflow-wrap:anywhere}
.lfhz-word[data-len="5"],.lfhz-word[data-len="6"]{font-size:clamp(70px,12vw,150px)}
.lfhz-word[data-len="7"],.lfhz-word[data-len="8"]{font-size:clamp(58px,10vw,125px)}
.lfhz-word.long{font-size:clamp(46px,8vw,105px)}
.lfhz-hint{font-size:.9rem;color:#64748b;font-weight:700}.lfhz-actions{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap}
.lfhz-btn{min-width:54px;min-height:48px;border:1px solid #d8e2ef;border-radius:14px;background:#f8fbff;color:#1e293b;font-size:1rem;font-weight:850;cursor:pointer;touch-action:manipulation;padding:10px 16px}.lfhz-btn.primary{background:#eef4ff;color:#1d4ed8;border-color:#c7d7fe}.lfhz-close{position:absolute;top:14px;right:14px;width:46px;height:46px;border:0;border-radius:50%;background:#f1f5f9;color:#334155;font-size:1.4rem;font-weight:900;cursor:pointer}
@media(max-width:720px){#${OVERLAY_ID}{padding:14px}.lfhz-card{width:100%;min-height:55vh;padding:40px 18px 26px;border-radius:24px}.lfhz-word{font-size:clamp(76px,24vw,138px)}.lfhz-word[data-len="5"],.lfhz-word[data-len="6"]{font-size:clamp(60px,18vw,112px)}.lfhz-word[data-len="7"],.lfhz-word[data-len="8"]{font-size:clamp(50px,15vw,94px)}.lfhz-word.long{font-size:clamp(42px,12vw,78px)}}
@media(prefers-reduced-motion:no-preference){#${OVERLAY_ID}.open .lfhz-card{animation:lfhzIn .16s ease-out}@keyframes lfhzIn{from{opacity:.3;transform:scale(.96)}to{opacity:1;transform:scale(1)}}}
`;
    document.head.appendChild(s);
  }

  function ensureOverlay() {
    let el = document.getElementById(OVERLAY_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = OVERLAY_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Phóng to Hán tự');
    el.innerHTML = `
      <div class="lfhz-card" role="document">
        <button type="button" class="lfhz-close" data-lfhz-close aria-label="Đóng">×</button>
        <div class="lfhz-word" data-lfhz-word></div>
        <div class="lfhz-hint">Chạm ra ngoài hoặc nhấn Esc để đóng</div>
        <div class="lfhz-actions">
          <button type="button" class="lfhz-btn primary" data-lfhz-audio>🔊 Nghe</button>
          <button type="button" class="lfhz-btn" data-lfhz-close>Đóng</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function speak(text) {
    const t = clean(text);
    if (!t) return;
    try {
      if (window.LFChineseHQAudio?.has?.(t)) {
        window.LFChineseHQAudio.play(t, .8);
        return;
      }
    } catch (_) {}
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN';
      u.rate = .8;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  function openZoom(text) {
    const t = clean(text);
    if (!t || !hasHan(t)) return;
    installStyle();
    const overlay = ensureOverlay();
    const word = overlay.querySelector('[data-lfhz-word]');
    word.textContent = t;
    const len = [...t].length;
    word.dataset.len = String(Math.min(len, 8));
    word.classList.toggle('long', len > 8);
    overlay.dataset.text = t;
    overlay.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => overlay.querySelector('[data-lfhz-audio]')?.focus(), 0);
  }

  function closeZoom() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay?.classList.contains('open')) return;
    overlay.classList.remove('open');
    document.documentElement.style.overflow = '';
  }

  function markClickable(target) {
    if (!target) return;
    const text = clean(target.textContent);
    if (hasHan(text)) target.dataset.lfHanziClickable = '1';
  }

  document.addEventListener('pointerover', e => {
    const source = e.target.closest?.('#lfStudyListPanel .lfsl-source');
    if (source) markClickable(source);
  }, { passive: true });

  document.addEventListener('click', e => {
    const close = e.target.closest?.('[data-lfhz-close]');
    if (close) { closeZoom(); return; }

    const audio = e.target.closest?.('[data-lfhz-audio]');
    if (audio) {
      const overlay = document.getElementById(OVERLAY_ID);
      speak(overlay?.dataset.text || '');
      return;
    }

    const overlay = e.target.closest?.(`#${OVERLAY_ID}`);
    if (overlay && e.target === overlay) { closeZoom(); return; }

    const source = e.target.closest?.('#lfStudyListPanel .lfsl-source');
    if (!source) return;
    const text = clean(source.textContent);
    if (!hasHan(text)) return;
    e.preventDefault();
    openZoom(text);
  }, true);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeZoom();
  });

  installStyle();
  window.LFStudyListHanziZoom = { open: openZoom, close: closeZoom };
})();
