/* LinguaFlash · English dialogue transcript integrity v1
   Guarantees every 51Talk dialogue line shows its English transcript and adds
   one complete English transcript panel. Lightweight event-driven add-on only.
*/
(() => {
  'use strict';
  if (window.__LF51_DIALOGUE_TRANSCRIPT_V1__) return;
  window.__LF51_DIALOGUE_TRANSCRIPT_V1__ = true;

  const ROOT = '#lf51DesktopWorkspace';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function schedule() {
    requestAnimationFrame(() => requestAnimationFrame(ensureTranscript));
  }

  function ensureTranscript() {
    const root = document.querySelector(ROOT);
    if (!root) return;
    const active = root.querySelector('.lf51d-tab.active[data-tab="dialogue"]');
    if (!active) return;

    const body = root.querySelector('.lf51d-main .lf51d-body');
    if (!body) return;
    const lines = [...body.querySelectorAll('.lf51d-line')];
    if (!lines.length) return;

    const rows = [];
    lines.forEach((line, index) => {
      const speaker = line.querySelector('.lf51d-speaker')?.textContent?.trim() || `Speaker ${index + 1}`;
      const bubble = line.querySelector('.lf51d-bubble');
      let englishEl = bubble?.querySelector('.lf51d-example');
      const audioText = line.querySelector('button[data-audio]')?.dataset?.audio?.trim() || '';
      let english = englishEl?.textContent?.trim() || audioText;

      // If a dialogue row lost its visible English text, restore it from the
      // exact text already attached to that row's audio button.
      if (bubble && !englishEl && english) {
        englishEl = document.createElement('div');
        englishEl.className = 'lf51d-example';
        englishEl.style.fontSize = '.9rem';
        englishEl.textContent = english;
        bubble.prepend(englishEl);
      } else if (englishEl && !englishEl.textContent.trim() && audioText) {
        englishEl.textContent = audioText;
        english = audioText;
      }

      if (english) rows.push({ speaker, english });
    });

    if (!rows.length) return;
    const signature = rows.map(x => `${x.speaker}|${x.english}`).join('\n');
    let panel = body.querySelector('#lf51EnglishTranscriptPanel');
    if (panel?.dataset?.signature === signature) return;
    panel?.remove();

    panel = document.createElement('details');
    panel.id = 'lf51EnglishTranscriptPanel';
    panel.open = true;
    panel.dataset.signature = signature;
    panel.style.cssText = 'margin:0 0 12px;border:1px solid #cfe1f5;border-radius:14px;background:#f8fbff;overflow:hidden';
    panel.innerHTML = `
      <summary style="cursor:pointer;padding:11px 13px;font-weight:950;color:#174c8b;background:#eef6ff">📝 Bản chữ tiếng Anh đầy đủ</summary>
      <div style="padding:8px 12px 11px">
        ${rows.map(row => `<div style="display:grid;grid-template-columns:minmax(58px,auto) 1fr;gap:9px;padding:8px 0;border-bottom:1px solid #e7eef7"><b style="font-size:.76rem;color:#1260a7">${esc(row.speaker)}</b><span style="font-size:.92rem;line-height:1.5;color:#172d49;font-weight:750">${esc(row.english)}</span></div>`).join('')}
      </div>`;
    body.prepend(panel);
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.(`${ROOT} .lf51d-tab[data-tab="dialogue"]`)) schedule();
    if (event.target.closest?.(`${ROOT} [data-toggle-translation]`)) schedule();
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches?.(`${ROOT} [data-lesson-select]`)) schedule();
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      [0, 400, 1200, 2600].forEach(ms => setTimeout(ensureTranscript, ms));
    }, { once:true });
  } else {
    [0, 400, 1200, 2600].forEach(ms => setTimeout(ensureTranscript, ms));
  }
})();
