/* LinguaFlash · Chinese Dialogue HQ Coverage v1
   Read-only status helper. Keeps all legacy Chinese HQ files untouched and
   reports coverage only for dialogue lines eligible under the v91 policy.
*/
(() => {
  'use strict';
  if (window.__LF_ZH_DIALOGUE_HQ_STATUS_V1__) return;
  window.__LF_ZH_DIALOGUE_HQ_STATUS_V1__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const STATUS_BOX_ID = 'lfZhDialogueHQCoverage';
  const norm = value => String(value || '').replace(/\s+/g, ' ').trim();
  const hasHanzi = value => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(value || ''));

  function collectDialogueLines() {
    const map = new Map();
    try {
      if (typeof DIALOGUES_DB === 'undefined' || !DIALOGUES_DB) return [];
      Object.entries(DIALOGUES_DB).forEach(([dialogueKey, dialogue]) => {
        (dialogue?.lines || []).forEach(line => {
          const text = norm(line?.cn);
          if (!text || !hasHanzi(text) || map.has(text)) return;
          map.set(text, {
            text,
            lesson_id: dialogueKey || dialogue?.id || dialogue?.title || 'dialogue'
          });
        });
      });
    } catch (_) {}
    return [...map.values()];
  }

  async function fetchExisting() {
    const url = String(cfg.url || '').replace(/\/$/, '');
    const key = String(cfg.anonKey || '');
    if (!url || !key) throw new Error('Thiếu cấu hình Supabase.');

    const result = new Set();
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const endpoint = `${url}/rest/v1/chinese_audio_manifest?select=source_text&locale=eq.zh-CN&offset=${from}&limit=${pageSize}`;
      const response = await fetch(endpoint, {
        headers: { apikey: key, Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
      const rows = await response.json();
      (Array.isArray(rows) ? rows : []).forEach(row => {
        const text = norm(row?.source_text);
        if (text) result.add(text);
      });
      if (!Array.isArray(rows) || rows.length < pageSize) break;
    }
    return result;
  }

  function ensureBox() {
    const panel = document.getElementById('lfAudioBulkAdminPanel');
    if (!panel) return null;
    let box = document.getElementById(STATUS_BOX_ID);
    if (box) return box;

    box = document.createElement('div');
    box.id = STATUS_BOX_ID;
    box.style.cssText = 'margin-top:8px;padding:8px 10px;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;color:#1e3a8a;font-size:.72rem;font-weight:800;line-height:1.45;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap';

    const text = document.createElement('span');
    text.dataset.role = 'coverage-text';
    text.textContent = '🇨🇳 Hội thoại Trung HQ: đang kiểm tra…';

    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.textContent = '↻ Cập nhật';
    refreshBtn.style.cssText = 'border:1px solid #93c5fd;background:#fff;color:#1d4ed8;border-radius:8px;padding:5px 8px;font-weight:900;cursor:pointer;touch-action:manipulation';
    refreshBtn.addEventListener('click', () => refresh(true));

    box.append(text, refreshBtn);
    panel.appendChild(box);
    return box;
  }

  async function refresh(showLoading = false) {
    const box = ensureBox();
    if (!box) return null;
    const textEl = box.querySelector('[data-role="coverage-text"]');
    if (showLoading && textEl) textEl.textContent = '🇨🇳 Hội thoại Trung HQ: đang kiểm tra…';

    try {
      const dialogueLines = collectDialogueLines();
      const existing = await fetchExisting();
      const covered = dialogueLines.filter(item => existing.has(item.text)).length;
      const total = dialogueLines.length;
      const missing = Math.max(0, total - covered);
      if (textEl) {
        textEl.textContent = `🇨🇳 Hội thoại Trung HQ: ${covered}/${total} câu đã có · còn thiếu ${missing}`;
        textEl.style.color = missing ? '#1e3a8a' : '#166534';
      }
      box.dataset.covered = String(covered);
      box.dataset.total = String(total);
      box.dataset.missing = String(missing);
      return { covered, total, missing };
    } catch (error) {
      if (textEl) {
        textEl.textContent = `⚠️ Chưa đọc được trạng thái hội thoại HQ: ${String(error?.message || error)}`;
        textEl.style.color = '#b42318';
      }
      return null;
    }
  }

  function hookBulkRun() {
    const api = window.LFAudioHQBulkAdmin;
    if (!api || typeof api.run !== 'function' || api.run.__lfZhCoverageWrapped) return false;
    const original = api.run;
    const wrapped = async function(scope, ...rest) {
      const result = await original.call(this, scope, ...rest);
      if (scope === 'zh' || scope === 'both') setTimeout(() => refresh(false), 250);
      return result;
    };
    wrapped.__lfZhCoverageWrapped = true;
    api.run = wrapped;
    return true;
  }

  function init() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      const box = ensureBox();
      const hooked = hookBulkRun();
      if (box) refresh(false);
      if ((box && hooked) || attempts >= 60) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFZhDialogueHQStatus = { refresh, collectDialogueLines };
})();
