/* LinguaFlash · Study List Auto Font v1
   Enlarges the remaining visible study-list content as columns are hidden.
   Works for both Chinese and English without changing list/SRS logic.
*/
(() => {
  'use strict';
  if (window.__LF_STUDY_LIST_AUTO_FONT_V1__) return;
  window.__LF_STUDY_LIST_AUTO_FONT_V1__ = true;

  const ROOT_ID = 'lfStudyListMode';
  const PANEL_ID = 'lfStudyListPanel';

  function visibleColumnCount() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return 5;
    const chips = [...root.querySelectorAll('[data-lfsl-col]')];
    if (!chips.length) return 5;
    return Math.max(1, chips.filter(btn => btn.classList.contains('on')).length);
  }

  function refresh() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.dataset.lfslVisible = String(visibleColumnCount());
  }

  function installStyle() {
    if (document.getElementById('lfStudyListAutoFontStyle')) return;
    const style = document.createElement('style');
    style.id = 'lfStudyListAutoFontStyle';
    style.textContent = `
      #${PANEL_ID} .lfsl-cell,
      #${PANEL_ID} .lfsl-source,
      #${PANEL_ID} .lfsl-phonetic,
      #${PANEL_ID} .lfsl-example-main,
      #${PANEL_ID} .lfsl-example-sub,
      #${PANEL_ID} .lfsl-example-en {
        transition: font-size .16s ease, line-height .16s ease, padding .16s ease;
      }

      /* 4 visible content columns */
      #${PANEL_ID}[data-lfsl-visible="4"] .lfsl-cell:not(.lfsl-audio){font-size:.90rem;line-height:1.5;padding-top:12px;padding-bottom:12px}
      #${PANEL_ID}[data-lfsl-visible="4"] .lfsl-source{font-size:1.10rem}
      #${PANEL_ID}[data-lfsl-visible="4"] .lfsl-phonetic{font-size:.96rem}

      /* 3 visible content columns */
      #${PANEL_ID}[data-lfsl-visible="3"] .lfsl-cell:not(.lfsl-audio){font-size:1rem;line-height:1.55;padding-top:14px;padding-bottom:14px}
      #${PANEL_ID}[data-lfsl-visible="3"] .lfsl-source{font-size:1.22rem}
      #${PANEL_ID}[data-lfsl-visible="3"] .lfsl-phonetic{font-size:1.05rem}
      #${PANEL_ID}[data-lfsl-visible="3"] .lfsl-example-sub,
      #${PANEL_ID}[data-lfsl-visible="3"] .lfsl-example-en{font-size:.88rem}

      /* 2 visible content columns: easy-reading mode */
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-cell:not(.lfsl-audio){font-size:1.12rem;line-height:1.6;padding-top:16px;padding-bottom:16px}
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-source{font-size:1.42rem;line-height:1.35}
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-phonetic{font-size:1.18rem}
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-example-main{font-size:1.12rem}
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-example-sub,
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-example-en{font-size:.96rem}
      #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-topic{font-size:.72rem}

      /* 1 visible content column: focus mode */
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-cell:not(.lfsl-audio){font-size:1.35rem;line-height:1.65;padding-top:20px;padding-bottom:20px}
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-source{font-size:1.82rem;line-height:1.3}
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-phonetic{font-size:1.38rem}
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-example-main{font-size:1.30rem}
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-example-sub,
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-example-en{font-size:1.08rem}
      #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-topic{font-size:.76rem}

      @media (max-width:720px){
        #${PANEL_ID}[data-lfsl-visible="3"] .lfsl-cell:not(.lfsl-audio){font-size:.98rem}
        #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-cell:not(.lfsl-audio){font-size:1.04rem;padding-top:12px;padding-bottom:12px}
        #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-source{font-size:1.32rem}
        #${PANEL_ID}[data-lfsl-visible="2"] .lfsl-phonetic{font-size:1.10rem}
        #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-cell:not(.lfsl-audio){font-size:1.14rem;padding-top:15px;padding-bottom:15px}
        #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-source{font-size:1.52rem}
        #${PANEL_ID}[data-lfsl-visible="1"] .lfsl-phonetic{font-size:1.22rem}
      }
    `;
    document.head.appendChild(style);
  }

  function scheduleRefresh() {
    [0, 30, 120].forEach(ms => setTimeout(refresh, ms));
  }

  function init() {
    installStyle();
    scheduleRefresh();

    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-lfsl-col], [data-lfsl-quick], [data-lfsl-view]')) {
        scheduleRefresh();
      }
    });

    document.addEventListener('change', event => {
      if (['studyLangFilter','studyCategoryFilter','studyTopicFilter'].includes(event.target?.id)) {
        scheduleRefresh();
      }
    }, true);

    window.addEventListener('pageshow', scheduleRefresh);
    [300, 900, 1800, 3500].forEach(ms => setTimeout(refresh, ms));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.LFStudyListAutoFont = { refresh };
})();
