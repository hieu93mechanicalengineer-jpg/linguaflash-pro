/* LinguaFlash · 51Talk Review Trainer v1
   Desktop review upgrade: EN→VI, VI→EN and Listening.
   Keeps answers hidden from English Coach while testing.
*/
(() => {
  'use strict';
  if (window.__LF51_REVIEW_TRAINER_V1__) return;
  window.__LF51_REVIEW_TRAINER_V1__ = true;

  const KEY = 'lf51_review_mode_v1';
  let mode = (() => { try { return localStorage.getItem(KEY) || 'en-vi'; } catch (_) { return 'en-vi'; } })();
  if (!['en-vi','vi-en','listen'].includes(mode)) mode = 'en-vi';
  const answers = new Map();
  let raf = 0;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFKC').replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
  const root = () => document.getElementById('lf51DesktopWorkspace');
  const isReview = () => !!root()?.querySelector('.lf51d-tab.active[data-tab="review"]');
  const lessonKey = () => root()?.querySelector('[data-lesson-select]')?.value || 'lesson';

  function ensureStyle(){
    if (document.getElementById('lf51rtStyleV1')) return;
    const s = document.createElement('style');
    s.id = 'lf51rtStyleV1';
    s.textContent = `
      #lf51DesktopWorkspace .lf51rt-modes{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:18px}
      #lf51DesktopWorkspace .lf51rt-mode{border:1px solid #cbd8e8;background:#fff;color:#31506f;border-radius:999px;padding:8px 13px;font-size:.76rem;font-weight:900;cursor:pointer}
      #lf51DesktopWorkspace .lf51rt-mode.active{background:#1677ff;border-color:#1677ff;color:#fff;box-shadow:0 5px 14px rgba(22,119,255,.18)}
      #lf51DesktopWorkspace .lf51rt-hint{font-size:.73rem;color:#718096;margin:5px 0 14px}
      #lf51DesktopWorkspace .lf51rt-input{width:min(560px,100%);border:2px solid #d5e0ed;border-radius:12px;padding:11px 13px;font:inherit;font-size:1rem;outline:none;text-align:center;margin-top:14px}
      #lf51DesktopWorkspace .lf51rt-input:focus{border-color:#1677ff;box-shadow:0 0 0 3px rgba(22,119,255,.09)}
      #lf51DesktopWorkspace .lf51rt-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px}
      #lf51DesktopWorkspace .lf51rt-answer{margin-top:14px;padding:12px 14px;border-radius:12px;background:#eef6ff;color:#263d59;line-height:1.55}
      #lf51DesktopWorkspace .lf51rt-result{margin-top:11px;font-size:.85rem;font-weight:850;line-height:1.55}
      #lf51DesktopWorkspace .lf51rt-lock{border:1px solid #cfe4ff;background:linear-gradient(135deg,#f4f9ff,#eef6ff);border-radius:13px;padding:11px;margin-bottom:8px}
      #lf51DesktopWorkspace .lf51rt-lock b{display:block;color:#145da0;font-size:.8rem}.lf51rt-lock span{display:block;color:#65778b;font-size:.72rem;margin-top:3px;line-height:1.45}
      #lf51DesktopWorkspace.lf51rt-capturing .lf51d-reviewcard{visibility:hidden}
    `;
    document.head.appendChild(s);
  }

  function setMode(next){
    if (!['en-vi','vi-en','listen'].includes(next)) return;
    mode = next;
    try { localStorage.setItem(KEY, mode); } catch (_) {}
    enhance();
  }

  function pairKey(en){ return `${lessonKey()}::${en}`; }

  function modeBar(){
    return `<div class="lf51rt-modes">
      <button type="button" class="lf51rt-mode ${mode==='en-vi'?'active':''}" data-rt-mode="en-vi">🇬🇧 EN → VI</button>
      <button type="button" class="lf51rt-mode ${mode==='vi-en'?'active':''}" data-rt-mode="vi-en">🇻🇳 VI → EN</button>
      <button type="button" class="lf51rt-mode ${mode==='listen'?'active':''}" data-rt-mode="listen">🎧 Listening</button>
    </div>`;
  }

  function renderTrainer(card,en,vi,ipa){
    card.dataset.rtApplied = `${pairKey(en)}::${mode}`;
    let body = '';
    if (mode === 'en-vi') {
      body = `<div class="lf51d-key">Mặt kiểm tra: Tiếng Anh</div>
        <div class="lf51d-reviewq">${esc(en)}</div>
        <div class="lf51rt-hint">Tự nhớ nghĩa tiếng Việt trước khi xem đáp án.</div>
        <div class="lf51rt-actions"><button type="button" class="lf51d-btn soft" data-rt-audio="${esc(en)}">🔊 Nghe</button><button type="button" class="lf51d-btn primary" data-rt-reveal>Hiện đáp án</button></div>
        <div class="lf51rt-answer" data-rt-answer hidden><b>${esc(vi)}</b>${ipa?`<div class="lf51d-ipa" style="margin-top:7px">${esc(ipa)}</div>`:''}</div>`;
    } else if (mode === 'vi-en') {
      body = `<div class="lf51d-key">Mặt kiểm tra: Tiếng Việt</div>
        <div class="lf51d-reviewq">${esc(vi)}</div>
        <div class="lf51rt-hint">Hãy tự tạo lại câu/từ tiếng Anh, không nhìn gợi ý.</div>
        <input class="lf51rt-input" id="lf51rtInput" autocomplete="off" spellcheck="false" placeholder="Nhập tiếng Anh...">
        <div class="lf51rt-actions"><button type="button" class="lf51d-btn primary" data-rt-check>Kiểm tra</button></div>
        <div class="lf51rt-result" id="lf51rtResult"></div>`;
    } else {
      body = `<div class="lf51d-key">Listening Dictation</div>
        <div class="lf51d-reviewq">🎧 Nghe và viết lại câu</div>
        <div class="lf51rt-hint">Không hiển thị tiếng Anh hoặc tiếng Việt trước khi kiểm tra.</div>
        <div class="lf51rt-actions"><button type="button" class="lf51d-btn soft" data-rt-audio="${esc(en)}">▶ Nghe câu</button><button type="button" class="lf51d-btn soft" data-rt-repeat="${esc(en)}">🔁 Nghe 3 lần</button></div>
        <input class="lf51rt-input" id="lf51rtInput" autocomplete="off" spellcheck="false" placeholder="Gõ câu bạn nghe được...">
        <div class="lf51rt-actions"><button type="button" class="lf51d-btn primary" data-rt-check>Kiểm tra</button></div>
        <div class="lf51rt-result" id="lf51rtResult"></div>`;
    }
    card.innerHTML = `${modeBar()}${body}`;
  }

  function lockCoach(){
    const r = root(); if (!r || !isReview()) return;
    const coach = r.querySelector('.lf51d-coach'); if (!coach) return;
    coach.querySelectorAll('.lf51d-coachCard').forEach(card => {
      const label = (card.querySelector('.lf51d-coachLabel')?.textContent || '').toLowerCase();
      const keep = label.includes('ghi chú') || label.includes('trạng thái');
      card.style.display = keep ? '' : 'none';
    });
    if (!coach.querySelector('.lf51rt-lock')) {
      const title = coach.querySelector('.lf51d-coachTitle');
      const box = document.createElement('div');
      box.className = 'lf51rt-lock';
      box.innerHTML = `<b>🔒 Exam Mode · Không lộ đáp án</b><span>Mẫu câu, giải thích và nội dung tiếng Anh liên quan được ẩn trong lúc kiểm tra.</span>`;
      title?.insertAdjacentElement('afterend', box);
    }
  }

  function captureOrRender(){
    const r = root(); if (!r || !isReview()) return;
    lockCoach();
    const card = r.querySelector('.lf51d-reviewcard');
    const q = card?.querySelector('.lf51d-reviewq');
    if (!card || !q) return;
    const en = q.textContent.trim();
    if (!en || q.closest('[data-rt-ready]')) return;
    const ipa = card.querySelector('.lf51d-ipa')?.textContent?.trim() || '';
    const visibleAnswer = card.querySelector('.lf51d-reviewa')?.textContent?.trim() || '';
    const key = pairKey(en);
    if (visibleAnswer) answers.set(key, {vi:visibleAnswer,ipa});
    const saved = answers.get(key);
    if (saved?.vi) {
      r.classList.remove('lf51rt-capturing');
      renderTrainer(card,en,saved.vi,saved.ipa || ipa);
      return;
    }
    const reveal = card.querySelector('[data-reveal]');
    if (reveal) {
      r.classList.add('lf51rt-capturing');
      reveal.click();
    }
  }

  function enhance(){
    ensureStyle();
    const r = root(); if (!r) return;
    if (!isReview()) { r.classList.remove('lf51rt-capturing'); return; }
    captureOrRender();
  }

  function speak(text,rate=1){
    if (!text) return;
    try { speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=rate; speechSynthesis.speak(u); } catch (_) {}
  }
  function repeat3(text){
    try { speechSynthesis.cancel(); let n=0; const go=()=>{ if(n++>=3)return; const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.88;u.onend=()=>setTimeout(go,250);speechSynthesis.speak(u);};go(); } catch (_) {}
  }

  function check(){
    const r=root(); const input=r?.querySelector('#lf51rtInput'); const out=r?.querySelector('#lf51rtResult');
    const card=r?.querySelector('.lf51d-reviewcard'); if(!input||!out||!card)return;
    const en = card.dataset.rtApplied?.split('::').slice(1,-1).join('::') || '';
    const typed=norm(input.value), expected=norm(en);
    const ok=typed===expected;
    out.style.color=ok?'#15803d':'#b42318';
    out.innerHTML=ok?`✅ Chính xác.${answers.get(pairKey(en))?.ipa?`<div class="lf51d-ipa" style="margin-top:6px">${esc(answers.get(pairKey(en)).ipa)}</div>`:''}`:`❌ Chưa đúng.<div style="margin-top:5px">Đáp án: <b>${esc(en)}</b></div>${answers.get(pairKey(en))?.ipa?`<div class="lf51d-ipa" style="margin-top:5px">${esc(answers.get(pairKey(en)).ipa)}</div>`:''}`;
  }

  function bind(){
    const r=root(); if(!r || r.dataset.rtBound) return; r.dataset.rtBound='1';
    r.addEventListener('click',e=>{
      const modeBtn=e.target.closest('[data-rt-mode]'); if(modeBtn){e.preventDefault();e.stopPropagation();setMode(modeBtn.dataset.rtMode);return;}
      const aud=e.target.closest('[data-rt-audio]'); if(aud){e.preventDefault();e.stopPropagation();speak(aud.dataset.rtAudio);return;}
      const rep=e.target.closest('[data-rt-repeat]'); if(rep){e.preventDefault();e.stopPropagation();repeat3(rep.dataset.rtRepeat);return;}
      const rev=e.target.closest('[data-rt-reveal]'); if(rev){e.preventDefault();e.stopPropagation();const a=r.querySelector('[data-rt-answer]');if(a){a.hidden=!a.hidden;rev.textContent=a.hidden?'Hiện đáp án':'Ẩn đáp án';}return;}
      const chk=e.target.closest('[data-rt-check]'); if(chk){e.preventDefault();e.stopPropagation();check();return;}
    },true);
    r.addEventListener('keydown',e=>{if(e.target?.id==='lf51rtInput'&&e.key==='Enter'){e.preventDefault();check();}});
    r.addEventListener('click',e=>{
      if(!isReview()) return;
      const tool=e.target.closest('[data-tool]'); if(!tool)return;
      const t=tool.dataset.tool;
      if(t==='flash'||t==='input'||t==='dictation'){
        e.preventDefault();e.stopImmediatePropagation();
        setMode(t==='flash'?'en-vi':t==='input'?'vi-en':'listen');
      }
    },true);
  }

  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{bind();enhance();});}
  function init(){ensureStyle();bind();const r=root();if(r){new MutationObserver(schedule).observe(r,{childList:true,subtree:true});}schedule();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();
