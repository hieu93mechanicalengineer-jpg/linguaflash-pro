/* LinguaFlash · English HQ Audio Admin v1
   Admin-only helper for generating stored HeyGen Turbo audio for the current
   51Talk desktop lessons. It discovers the exact visible lesson content from
   the existing workspace instead of duplicating lesson data.
*/
(() => {
  'use strict';
  if (window.__LF_ENGLISH_AUDIO_ADMIN_V1__) return;
  window.__LF_ENGLISH_AUDIO_ADMIN_V1__ = true;

  const cfg = window.LINGUAFLASH_SUPABASE || {};
  const MODEL = 'heygen-voice-1-turbo-free';
  const BATCH_SIZE = 8;
  const STATUS_ID = 'lf51AudioAdminStatus';
  const BUTTON_ID = 'lf51AudioAdminButton';

  let client = null;
  let session = null;
  let isAdmin = false;
  let generating = false;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const norm = value => String(value || '')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  function hashText(value) {
    const text = norm(value);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function setStatus(text, tone = 'info') {
    const el = document.getElementById(STATUS_ID);
    if (!el) return;
    el.textContent = text || '';
    el.style.color = tone === 'error' ? '#b42318' : tone === 'ok' ? '#15803d' : '#475569';
  }

  function workspaceReady() {
    return !!document.querySelector('#lf51DesktopWorkspace [data-lesson-select]');
  }

  function currentLessonSelect() {
    return document.querySelector('#lf51DesktopWorkspace [data-lesson-select]');
  }

  function currentTab() {
    return document.querySelector('#lf51DesktopWorkspace .lf51d-tab.active')?.dataset?.tab || 'vocab';
  }

  function clickTab(tab) {
    const button = document.querySelector(`#lf51DesktopWorkspace .lf51d-tab[data-tab="${tab}"]`);
    button?.click();
  }

  function setLesson(lessonId) {
    const select = currentLessonSelect();
    if (!select) return false;
    select.value = lessonId;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function countCurrentPager() {
    const text = document.querySelector('#lf51DesktopWorkspace .lf51d-main .lf51d-count')?.textContent || '';
    const match = text.match(/\/\s*(\d+)/);
    return match ? Math.max(1, Number(match[1]) || 1) : 1;
  }

  function pushItem(map, lessonId, contentType, text) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const key = norm(clean);
    if (map.has(key)) return;
    map.set(key, {
      audio_key: `${lessonId}_${contentType}_${hashText(clean)}`,
      lesson_id: lessonId,
      content_type: contentType,
      text: clean
    });
  }

  async function collectPagedTab(map, lessonId, tab, stepType) {
    clickTab(tab);
    await sleep(0);
    const total = countCurrentPager();
    for (let i = 0; i < total; i++) {
      const buttons = [...document.querySelectorAll('#lf51DesktopWorkspace .lf51d-main button[data-audio]')];
      buttons.forEach((button, index) => {
        let type = tab;
        if (tab === 'vocab') type = index === 0 ? 'vocab' : 'example';
        if (tab === 'examples') type = 'example';
        if (tab === 'speaking') type = 'speaking';
        pushItem(map, lessonId, type, button.dataset.audio);
      });
      if (i < total - 1) {
        const next = document.querySelector(`#lf51DesktopWorkspace .lf51d-main [data-step="${stepType}:1"]`);
        next?.click();
        await sleep(0);
      }
    }
  }

  async function collectDialogue(map, lessonId) {
    clickTab('dialogue');
    await sleep(0);
    [...document.querySelectorAll('#lf51DesktopWorkspace .lf51d-main .lf51d-line button[data-audio]')]
      .forEach(button => pushItem(map, lessonId, 'dialogue', button.dataset.audio));
  }

  async function collectAllLessonAudio() {
    if (!workspaceReady()) throw new Error('Mở phần 51Talk English trên máy tính trước khi tạo audio.');

    const originalLesson = currentLessonSelect()?.value || '';
    const originalTab = currentTab();
    const lessonIds = [...currentLessonSelect().options].map(option => option.value).filter(Boolean);
    const map = new Map();

    for (const lessonId of lessonIds) {
      if (!setLesson(lessonId)) continue;
      await sleep(0);
      await collectPagedTab(map, lessonId, 'vocab', 'vocab');
      await collectPagedTab(map, lessonId, 'examples', 'example');
      await collectDialogue(map, lessonId);
      await collectPagedTab(map, lessonId, 'speaking', 'speaking');
    }

    if (originalLesson) {
      setLesson(originalLesson);
      await sleep(0);
      clickTab(originalTab);
    }

    return [...map.values()];
  }

  async function getMissingItems(items) {
    const { data, error } = await client
      .from('english_audio_manifest')
      .select('source_text')
      .eq('locale', 'en-US');
    if (error) throw error;
    const existing = new Set((data || []).map(row => norm(row.source_text)));
    return items.filter(item => !existing.has(norm(item.text)));
  }

  async function callGenerator(items) {
    const response = await fetch(`${String(cfg.url || '').replace(/\/$/, '')}/functions/v1/generate-english-audio`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: MODEL, items })
    });

    const raw = await response.text();
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch (_) {}
    if (!response.ok) {
      const message = payload?.error || payload?.message || raw || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return payload || {};
  }

  async function generateAll() {
    if (generating) return;
    generating = true;
    const button = document.getElementById(BUTTON_ID);
    if (button) button.disabled = true;

    try {
      setStatus('Đang đọc nội dung 3 bài hiện tại…');
      const all = await collectAllLessonAudio();
      const missing = await getMissingItems(all);

      if (!missing.length) {
        setStatus(`✅ Đã có đủ ${all.length} audio HQ.`, 'ok');
        await window.LFEnglishHQAudio?.refresh?.();
        return;
      }

      let generated = 0;
      let failed = 0;
      const failures = [];
      for (let offset = 0; offset < missing.length; offset += BATCH_SIZE) {
        const batch = missing.slice(offset, offset + BATCH_SIZE);
        setStatus(`Đang tạo audio ${offset + 1}–${Math.min(offset + batch.length, missing.length)} / ${missing.length}…`);
        const result = await callGenerator(batch);
        generated += Number(result.generated || 0);
        failed += Number(result.failed || 0);
        (result.results || []).filter(row => !row.ok).forEach(row => failures.push(row));
        await window.LFEnglishHQAudio?.refresh?.();
        if (offset + BATCH_SIZE < missing.length) await sleep(300);
      }

      if (failed) {
        const first = failures[0]?.error || 'Có một số audio chưa tạo được.';
        setStatus(`⚠️ Đã tạo ${generated}, lỗi ${failed}. ${first}`, 'error');
      } else {
        setStatus(`✅ Hoàn tất ${generated} audio mới. Tổng nội dung: ${all.length}.`, 'ok');
      }
    } catch (error) {
      console.error('[LinguaFlash Audio Admin]', error);
      setStatus(`❌ ${String(error?.message || error)}`, 'error');
    } finally {
      generating = false;
      if (button) button.disabled = false;
    }
  }

  function ensureAdminControl() {
    if (!isAdmin || !workspaceReady()) return;
    const top = document.querySelector('#lf51DesktopWorkspace .lf51d-top');
    if (!top || document.getElementById(BUTTON_ID)) return;

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'flex-end';
    wrap.style.gap = '3px';
    wrap.style.marginLeft = 'auto';

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.textContent = '🎙️ Tạo audio HQ · 3 bài';
    button.style.border = '1px solid #b7d3f6';
    button.style.background = '#edf6ff';
    button.style.color = '#0f5fae';
    button.style.borderRadius = '10px';
    button.style.padding = '7px 10px';
    button.style.fontWeight = '850';
    button.style.cursor = 'pointer';
    button.addEventListener('click', generateAll);

    const status = document.createElement('div');
    status.id = STATUS_ID;
    status.textContent = 'Turbo Free · Nadine · phát mặc định 0.75×';
    status.style.fontSize = '.66rem';
    status.style.fontWeight = '700';
    status.style.maxWidth = '320px';
    status.style.textAlign = 'right';
    status.style.color = '#64748b';

    wrap.append(button, status);
    top.appendChild(wrap);
  }

  async function initAuth() {
    if (!cfg.url || !cfg.anonKey || !window.supabase?.createClient) return;
    try {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) return;

      const { data: admin, error } = await client
        .from('linguaflash_admins')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (error || !admin) return;
      isAdmin = true;
      ensureAdminControl();

      client.auth.onAuthStateChange((_event, newSession) => {
        session = newSession || null;
        if (!session?.user) return;
        setTimeout(ensureAdminControl, 50);
      });
    } catch (error) {
      console.warn('[LinguaFlash Audio Admin] init skipped', error);
    }
  }

  const observer = new MutationObserver(() => {
    if (isAdmin) ensureAdminControl();
  });

  function init() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    initAuth();
    setTimeout(() => isAdmin && ensureAdminControl(), 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.LFEnglishAudioAdmin = {
    collectAllLessonAudio,
    generateAll,
    model: MODEL
  };
})();