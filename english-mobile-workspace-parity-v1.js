/* LinguaFlash · Mobile 51Talk Workspace Parity v1
   Reuses the tested desktop 51Talk workspace logic on phones, with a mobile-only
   adapter + CSS. If loading/transformation fails, the stable v80 Lesson Mode stays visible.
*/
(() => {
  'use strict';
  if (window.__LF51_MOBILE_WORKSPACE_PARITY_V1__) return;
  window.__LF51_MOBILE_WORKSPACE_PARITY_V1__ = true;

  function isMobileDevice() {
    const ua = String(navigator.userAgent || '');
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    let coarse = false;
    try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
    const shortSide = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
    return mobileUA || (touch && coarse && shortSide <= 1024);
  }

  if (!isMobileDevice()) return;

  function addMobileCss() {
    if (document.getElementById('lf51MobileWorkspaceParityStyle')) return;
    const s = document.createElement('style');
    s.id = 'lf51MobileWorkspaceParityStyle';
    s.textContent = `
      /* Only when the shared workspace is active: hide the old mobile fallback UI. */
      body.lf51-desktop-active #lfEnglishMobileV1,
      body.lf51-desktop-active #lfEnglishPracticeV1 { display:none !important; }

      @media (max-width: 899px), (pointer: coarse) {
        #lf51DesktopWorkspace {
          width:100% !important;
          max-width:760px !important;
          margin:4px auto calc(130px + env(safe-area-inset-bottom,0px)) !important;
          padding:0 5px !important;
          box-sizing:border-box !important;
        }
        #lf51DesktopWorkspace.on { display:block !important; }
        .lf51d-shell {
          height:auto !important;
          min-height:0 !important;
          overflow:visible !important;
          display:block !important;
          border-radius:18px !important;
          background:#f5f8fc !important;
          box-shadow:0 8px 28px rgba(15,35,70,.10) !important;
        }
        .lf51d-top {
          display:grid !important;
          grid-template-columns:1fr auto !important;
          gap:8px !important;
          padding:12px !important;
          border-radius:18px 18px 0 0 !important;
          position:relative !important;
        }
        .lf51d-brand {
          font-size:1.08rem !important;
          align-self:center !important;
        }
        .lf51d-select {
          grid-column:1 / -1 !important;
          grid-row:2 !important;
          width:100% !important;
          max-width:none !important;
          min-height:44px !important;
          font-size:14px !important;
        }
        .lf51d-badge {
          grid-column:2 !important;
          grid-row:1 !important;
          margin:0 !important;
          align-self:center !important;
          justify-self:end !important;
          font-size:.68rem !important;
          padding:5px 8px !important;
          border-radius:999px !important;
          background:rgba(255,255,255,.13) !important;
          color:#eaf4ff !important;
        }
        .lf51d-tabs {
          grid-template-columns:repeat(3,minmax(0,1fr)) !important;
          gap:6px !important;
          padding:8px !important;
          position:sticky !important;
          top:0 !important;
          z-index:16 !important;
        }
        .lf51d-tab {
          min-width:0 !important;
          min-height:45px !important;
          padding:7px 4px !important;
          font-size:.72rem !important;
          line-height:1.15 !important;
          white-space:normal !important;
          touch-action:manipulation !important;
        }
        .lf51d-grid {
          display:block !important;
          padding:8px !important;
        }
        .lf51d-main,
        .lf51d-coach {
          width:100% !important;
          min-height:0 !important;
          overflow:visible !important;
          border-radius:15px !important;
        }
        .lf51d-main { display:block !important; }
        .lf51d-sectionhead {
          padding:10px 11px !important;
          align-items:flex-start !important;
        }
        .lf51d-sectionhead h2 { font-size:.95rem !important; line-height:1.3 !important; }
        .lf51d-body {
          overflow:visible !important;
          padding:10px !important;
        }
        .lf51d-nav {
          padding:9px 10px !important;
          display:grid !important;
          grid-template-columns:1fr 1fr !important;
          gap:8px !important;
        }
        .lf51d-nav > span { grid-column:1 / -1 !important; margin:0 !important; }
        .lf51d-btn {
          min-height:43px !important;
          font-size:13px !important;
          touch-action:manipulation !important;
        }
        .lf51d-vocabhero {
          padding:14px !important;
          gap:8px !important;
        }
        .lf51d-word { font-size:1.8rem !important; line-height:1.08 !important; }
        .lf51d-meaning { font-size:1rem !important; }
        .lf51d-listen { width:46px !important; height:46px !important; flex:0 0 46px !important; }
        .lf51d-cards2 { grid-template-columns:1fr !important; gap:8px !important; }
        .lf51d-info { font-size:.83rem !important; padding:11px !important; }
        .lf51d-example { font-size:1rem !important; }
        .lf51d-dialogue { overflow:visible !important; height:auto !important; }
        .lf51d-line {
          grid-template-columns:50px minmax(0,1fr) auto !important;
          gap:7px !important;
        }
        .lf51d-speaker { font-size:.72rem !important; overflow-wrap:anywhere !important; }
        .lf51d-bubble { padding:9px !important; min-width:0 !important; }
        .lf51d-review { min-height:300px !important; }
        .lf51d-reviewcard { width:100% !important; padding:20px 13px !important; }
        .lf51d-reviewq { font-size:1.2rem !important; }

        /* English Coach becomes a stacked mobile panel below the active lesson item. */
        .lf51d-coach {
          margin-top:10px !important;
          padding:10px !important;
          background:#fff !important;
        }
        .lf51d-coachTitle { font-size:1rem !important; }
        .lf51d-coachCard {
          margin-bottom:7px !important;
          padding:10px !important;
          border-radius:12px !important;
        }
        .lf51d-speed button {
          min-height:38px !important;
          font-size:13px !important;
          touch-action:manipulation !important;
        }
        .lf51d-note,
        .lf51d-toolbox input {
          font-size:16px !important;
          min-height:46px !important;
        }

        /* Bottom quick actions mirror desktop, but use a 2x2 phone grid. */
        .lf51d-quickbar {
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
          gap:7px !important;
          padding:8px 8px 14px !important;
          border-radius:0 0 18px 18px !important;
        }
        .lf51d-quick {
          min-height:62px !important;
          padding:9px !important;
          touch-action:manipulation !important;
        }
        .lf51d-quick b { font-size:.76rem !important; line-height:1.2 !important; }
        .lf51d-quick span { font-size:.65rem !important; line-height:1.3 !important; }

        html { scroll-padding-bottom:150px !important; }
        body.lf51-desktop-active { padding-bottom:calc(125px + env(safe-area-inset-bottom,0px)) !important; }
      }

      @media (orientation: landscape) and (pointer: coarse) {
        #lf51DesktopWorkspace { max-width:980px !important; }
        .lf51d-tabs { grid-template-columns:repeat(6,minmax(0,1fr)) !important; }
        .lf51d-grid { display:grid !important; grid-template-columns:minmax(0,1fr) minmax(260px,.65fr) !important; gap:8px !important; }
        .lf51d-coach { margin-top:0 !important; }
      }
    `;
    document.head.appendChild(s);
  }

  async function loadSharedWorkspace() {
    try {
      const response = await fetch('./english-51talk-desktop-workspace-v1.js?v=83', { cache:'no-store' });
      if (!response.ok) throw new Error('workspace source unavailable');
      let code = await response.text();

      // Give the mobile instance its own guard while keeping all feature logic identical.
      code = code.replaceAll('__LF51_DESKTOP_WORKSPACE_V1__', '__LF51_MOBILE_SHARED_WORKSPACE_V1__');

      // Reuse the desktop module's existing active() flow, but make its device gate mobile-safe
      // and orientation-independent.
      const oldGate = "function desktop(){return window.matchMedia?matchMedia('(min-width:900px)').matches:innerWidth>=900;}";
      const newGate = `function desktop(){const ua=String(navigator.userAgent||'');const m=/Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);const t=Number(navigator.maxTouchPoints||0)>0;let c=false;try{c=!!window.matchMedia?.('(pointer: coarse)').matches}catch(_){}const s=Math.min(Number(screen.width||9999),Number(screen.height||9999));return m||(t&&c&&s<=1024);}`;
      if (!code.includes(oldGate)) throw new Error('workspace device gate changed');
      code = code.replace(oldGate, newGate);

      // Do not let the desktop stylesheet hide the reused workspace on phones.
      code = code.replace('@media(max-width:899px){#lf51DesktopWorkspace{display:none!important}}', '@media(max-width:899px){#lf51DesktopWorkspace{display:block!important}}');
      code = code.replaceAll('Desktop Workspace', 'Mobile Workspace');

      // Run same-origin trusted app code only after all transformations succeeded.
      Function(`${code}\n//# sourceURL=english-mobile-shared-workspace-v83.js`)();
      addMobileCss();
      document.documentElement.dataset.lf51MobileWorkspace = '83';
    } catch (err) {
      // Safe fallback: leave v80/v82 Lesson Mode untouched and visible.
      console.warn('LinguaFlash mobile workspace fallback:', err);
      document.documentElement.dataset.lf51MobileWorkspace = 'fallback';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { addMobileCss(); loadSharedWorkspace(); }, { once:true });
  } else {
    addMobileCss();
    loadSharedWorkspace();
  }
})();
