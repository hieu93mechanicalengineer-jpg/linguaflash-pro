/* LinguaFlash · 51Talk Mobile UX v1
   Consolidates the English learning tools into one compact English Coach.
   Goals:
   - One activity visible at a time: Grammar / Pattern / Listening
   - Keep Coach OUTSIDE the flashcard surface so card-touch handlers cannot hijack it
   - Prevent hidden practice inputs from stealing focus / opening the mobile keyboard
   - Keep Prev / Flip / Next reachable above the bottom app navigation
   - Return to the new card after explicit Prev / Next navigation
   - Improve touch targets and iOS input ergonomics without changing SRS/FSRS
*/
(() => {
  'use strict';
  if (window.__LF_51TALK_MOBILE_UX_V1__) return;
  window.__LF_51TALK_MOBILE_UX_V1__ = true;

  const TAB_KEY = 'lf51_coach_tab_v1';
  const VALID_TABS = new Set(['grammar','pattern','listen']);
  let activeTab = (() => {
    try { const saved = localStorage.getItem(TAB_KEY); return VALID_TABS.has(saved) ? saved : 'grammar'; }
    catch (_) { return 'grammar'; }
  })();
  let lastCardId = '';
  let navScrollRequested = false;
  let scheduled = false;

  function currentCard() {
    try { return Array.isArray(filteredDeck) && filteredDeck.length ? filteredDeck[currentIndex] : null; }
    catch (_) { return null; }
  }

  function is51Talk(card) {
    return !!card && (String(card.id || '').startsWith('en51_') || card.category === '51Talk English');
  }

  function isMobile() {
    return window.matchMedia?.('(max-width: 700px)').matches ?? (window.innerWidth <= 700);
  }

  function ensureStyle() {
    if (document.getElementById('lf51CoachStyle')) return;
    const style = document.createElement('style');
    style.id = 'lf51CoachStyle';
    style.textContent = `
      #lf51CoachShell{width:min(100%,780px);margin:14px auto 0;border:1px solid #dbeafe;background:#fff;border-radius:22px;box-shadow:0 10px 28px rgba(15,23,42,.07);overflow:hidden}
      #lf51CoachShell.hidden{display:none!important}.lf51c-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:13px 14px 10px;background:linear-gradient(135deg,#eff6ff,#f8fafc)}
      .lf51c-kicker{font-size:.7rem;font-weight:950;letter-spacing:.08em;text-transform:uppercase;color:#2563eb}.lf51c-title{font-size:1rem;font-weight:950;color:#0f172a;margin-top:2px}.lf51c-sub{font-size:.76rem;color:#64748b;margin-top:2px;line-height:1.4}
      .lf51c-collapse{border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:10px;padding:7px 9px;font-size:.75rem;font-weight:850;white-space:nowrap;touch-action:manipulation}
      .lf51c-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:8px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background:#f8fafc}
      .lf51c-tab{min-height:44px;border:1px solid transparent;background:transparent;color:#64748b;border-radius:12px;padding:8px 7px;font-size:.8rem;font-weight:900;touch-action:manipulation;user-select:none;-webkit-user-select:none}
      .lf51c-tab[aria-selected="true"]{background:#fff;color:#3730a3;border-color:#c7d2fe;box-shadow:0 2px 8px rgba(79,70,229,.08)}
      .lf51c-body{padding:10px}.lf51c-pane{display:none}.lf51c-pane.active{display:block}.lf51c-placeholder{padding:18px 12px;text-align:center;color:#64748b;font-size:.82rem;border:1px dashed #cbd5e1;border-radius:14px;background:#f8fafc}
      #lf51CoachShell #lf51GrammarPanel,#lf51CoachShell #lf51PatternPractice,#lf51CoachShell #lf51Listening{width:100%!important;margin:0!important;border:0!important;box-shadow:none!important;border-radius:14px!important;padding:10px!important;background:transparent!important}
      #lf51CoachShell input,#lf51CoachShell textarea,#lf51CoachShell select{font-size:16px!important;max-width:100%;touch-action:manipulation}
      #lf51CoachShell button{touch-action:manipulation;min-height:40px}
      body.lf51-active .lf51-study-nav{position:sticky;bottom:calc(82px + env(safe-area-inset-bottom));z-index:70;background:rgba(248,250,252,.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid #e2e8f0;border-radius:16px;padding:7px;box-shadow:0 8px 24px rgba(15,23,42,.13)}
      body.lf51-active .lf51-study-nav button{min-height:44px;touch-action:manipulation}
      body.lf51-active #studyAnswerPanel input,body.lf51-active #studyAnswerPanel textarea{font-size:16px!important}
      @media(max-width:700px){
        #lf51CoachShell{margin-top:10px;border-radius:17px}.lf51c-head{padding:11px 11px 9px}.lf51c-body{padding:7px}.lf51c-tabs{position:sticky;top:0;z-index:3;padding:6px;background:rgba(248,250,252,.96);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
        .lf51c-tab{font-size:.76rem;padding:7px 4px}.lf51c-sub{font-size:.72rem}
        body.lf51-active{padding-bottom:150px!important}
        body.lf51-active #flashcardContainer{scroll-margin-top:10px}
        body.lf51-active #flashcardContainer button,body.lf51-active #studyAnswerPanel button{touch-action:manipulation}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureShell() {
    let shell = document.getElementById('lf51CoachShell');
    if (shell) return shell;
    const flash = document.getElementById('flashcardContainer');
    if (!flash) return null;
    shell = document.createElement('section');
    shell.id = 'lf51CoachShell';
    shell.className = 'hidden';
    shell.innerHTML = `
      <div class="lf51c-head">
        <div><div class="lf51c-kicker">🇬🇧 ENGLISH COACH</div><div class="lf51c-title">Học một việc tại một thời điểm</div><div class="lf51c-sub">Ngữ pháp · luyện mẫu câu · nghe chép chính tả — không còn xếp chồng thành trang dài.</div></div>
        <button type="button" class="lf51c-collapse" data-lf51c-collapse>Thu gọn</button>
      </div>
      <div class="lf51c-tabs" role="tablist" aria-label="English Coach">
        <button type="button" class="lf51c-tab" role="tab" data-lf51c-tab="grammar">📘 Ngữ pháp</button>
        <button type="button" class="lf51c-tab" role="tab" data-lf51c-tab="pattern">✍️ Luyện câu</button>
        <button type="button" class="lf51c-tab" role="tab" data-lf51c-tab="listen">🎧 Nghe</button>
      </div>
      <div class="lf51c-body">
        <div class="lf51c-pane" data-lf51c-pane="grammar"><div class="lf51c-slot" data-lf51c-slot="grammar"></div><div class="lf51c-placeholder" data-lf51c-empty="grammar">Lật thẻ để xem ngữ pháp của câu đang học.</div></div>
        <div class="lf51c-pane" data-lf51c-pane="pattern"><div class="lf51c-slot" data-lf51c-slot="pattern"></div><div class="lf51c-placeholder" data-lf51c-empty="pattern">Thẻ này chưa có bài luyện mẫu câu.</div></div>
        <div class="lf51c-pane" data-lf51c-pane="listen"><div class="lf51c-slot" data-lf51c-slot="listen"></div><div class="lf51c-placeholder" data-lf51c-empty="listen">Chưa có câu nghe phù hợp cho thẻ này.</div></div>
      </div>`;
    flash.insertAdjacentElement('afterend', shell);
    return shell;
  }

  function tagStudyNav() {
    const prev = document.querySelector('#flashcardContainer button[data-i18n="btn_prev"]');
    const flip = document.querySelector('#flashcardContainer button[data-i18n="btn_flip"]');
    const next = document.querySelector('#flashcardContainer button[data-i18n="btn_next"]');
    const parent = prev?.parentElement;
    if (parent && flip?.parentElement === parent && next?.parentElement === parent) parent.classList.add('lf51-study-nav');
    [prev,next].forEach(btn => {
      if (!btn || btn.dataset.lf51ScrollBound === '1') return;
      btn.dataset.lf51ScrollBound = '1';
      const request = () => { navScrollRequested = true; };
      btn.addEventListener('pointerdown', request, {passive:true});
      btn.addEventListener('mousedown', request, {passive:true});
    });
  }

  function moveTool(panelId, slotName) {
    const panel = document.getElementById(panelId);
    const slot = document.querySelector(`#lf51CoachShell [data-lf51c-slot="${slotName}"]`);
    if (!panel || !slot) return null;
    if (panel.parentElement !== slot) slot.appendChild(panel);
    return panel;
  }

  function blurInactivePaneInputs() {
    const shell = document.getElementById('lf51CoachShell');
    if (!shell) return;
    shell.querySelectorAll('.lf51c-pane:not(.active) input,.lf51c-pane:not(.active) textarea,.lf51c-pane:not(.active) select').forEach(el => {
      if (document.activeElement === el) { try { el.blur(); } catch (_) {} }
    });
  }

  function saveTab() { try { localStorage.setItem(TAB_KEY, activeTab); } catch (_) {} }

  function applyTab(scroll = false) {
    const shell = document.getElementById('lf51CoachShell');
    if (!shell) return;
    shell.querySelectorAll('[data-lf51c-tab]').forEach(btn => btn.setAttribute('aria-selected', btn.dataset.lf51cTab === activeTab ? 'true' : 'false'));
    shell.querySelectorAll('[data-lf51c-pane]').forEach(pane => pane.classList.toggle('active', pane.dataset.lf51cPane === activeTab));
    blurInactivePaneInputs();
    saveTab();
    if (scroll && isMobile()) setTimeout(() => shell.scrollIntoView({behavior:'smooth',block:'start'}), 30);
  }

  function updatePlaceholders() {
    const map = {grammar:'lf51GrammarPanel',pattern:'lf51PatternPractice',listen:'lf51Listening'};
    Object.entries(map).forEach(([name,id]) => {
      const panel = document.getElementById(id);
      const empty = document.querySelector(`#lf51CoachShell [data-lf51c-empty="${name}"]`);
      if (!empty) return;
      const visible = !!panel && !panel.classList.contains('hidden') && String(panel.textContent || '').trim().length > 0;
      empty.style.display = visible ? 'none' : '';
    });
  }

  function setCollapsed(collapsed) {
    const shell = document.getElementById('lf51CoachShell');
    if (!shell) return;
    const tabs = shell.querySelector('.lf51c-tabs');
    const body = shell.querySelector('.lf51c-body');
    const btn = shell.querySelector('[data-lf51c-collapse]');
    if (tabs) tabs.style.display = collapsed ? 'none' : '';
    if (body) body.style.display = collapsed ? 'none' : '';
    if (btn) btn.textContent = collapsed ? 'Mở công cụ' : 'Thu gọn';
    shell.dataset.collapsed = collapsed ? '1' : '0';
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }

  function update() {
    ensureStyle();
    const shell = ensureShell();
    if (!shell) return;
    tagStudyNav();

    const card = currentCard();
    const active = is51Talk(card);
    document.body.classList.toggle('lf51-active', active);
    shell.classList.toggle('hidden', !active);
    if (!active) return;

    moveTool('lf51GrammarPanel','grammar');
    moveTool('lf51PatternPractice','pattern');
    moveTool('lf51Listening','listen');
    applyTab(false);
    updatePlaceholders();

    const cardId = String(card?.id || '');
    const changed = cardId && cardId !== lastCardId;
    lastCardId = cardId;
    if (changed) {
      // Hidden tool inputs must never steal the keyboard on mobile when a new card renders.
      setTimeout(() => { blurInactivePaneInputs(); updatePlaceholders(); }, 30);
      if (navScrollRequested && isMobile()) {
        navScrollRequested = false;
        setTimeout(() => document.getElementById('flashcardContainer')?.scrollIntoView({behavior:'smooth',block:'start'}), 40);
      } else navScrollRequested = false;
    }
  }

  function bindShell() {
    const shell = ensureShell();
    if (!shell || shell.dataset.bound === '1') return;
    shell.dataset.bound = '1';
    shell.addEventListener('click', e => {
      const tab = e.target?.closest?.('[data-lf51c-tab]');
      if (tab) { activeTab = tab.dataset.lf51cTab; applyTab(true); return; }
      const collapse = e.target?.closest?.('[data-lf51c-collapse]');
      if (collapse) setCollapsed(shell.dataset.collapsed !== '1');
    });
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lf51CoachPatched) return;
    const wrapped = function(...args) {
      const out = original.apply(this,args);
      setTimeout(scheduleUpdate,0);
      return out;
    };
    wrapped.__lf51CoachPatched = true;
    window.renderCurrentCard = wrapped;
  }

  function init() {
    ensureStyle(); ensureShell(); bindShell(); patchRender();
    const root = document.getElementById('tab-study') || document.body;
    new MutationObserver(scheduleUpdate).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',scheduleUpdate,{passive:true});
    setTimeout(update,120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();