/* LinguaFlash · Mobile 51Talk Study Direction v1
   Adds VI→EN / EN→VI direction to the shared mobile workspace without changing
   the stable workspace core. English audio/IPA always stays English.
*/
(() => {
  'use strict';
  if (window.__LF51_MOBILE_DIRECTION_V1__) return;
  window.__LF51_MOBILE_DIRECTION_V1__ = true;

  const STORE = 'lf51_mobile_direction_v1';
  let direction = 'vi-en';
  let lessons = null;
  try { direction = localStorage.getItem(STORE) || 'vi-en'; } catch (_) {}
  if (!['vi-en','en-vi'].includes(direction)) direction = 'vi-en';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFKC').replace(/[’']/g,"'").replace(/[^\p{L}\p{N}' ]+/gu,' ').replace(/\s+/g,' ').trim();

  async function loadLessonData(){
    try {
      const r = await fetch('./english-51talk-desktop-workspace-v1.js?v=84', {cache:'no-store'});
      if (!r.ok) return;
      const t = await r.text();
      const a = t.indexOf('const LESSONS = ');
      const b = t.indexOf('\n\n  const IPA = ', a);
      if (a < 0 || b < 0) return;
      const literal = t.slice(a + 'const LESSONS = '.length, b).trim().replace(/;$/,'');
      lessons = Function(`return (${literal})`)();
    } catch (_) { lessons = null; }
  }

  function root(){ return document.getElementById('lf51DesktopWorkspace'); }
  function lessonId(){ return root()?.querySelector('[data-lesson-select]')?.value || 'birthday'; }
  function lesson(){ return lessons?.[lessonId()] || null; }
  function activeTab(){ return root()?.querySelector('.lf51d-tab.active')?.dataset.tab || 'vocab'; }
  function indexFromCount(){
    const m = String(root()?.querySelector('.lf51d-count')?.textContent || '').match(/(\d+)\s*\//);
    return Math.max(0, Number(m?.[1] || 1) - 1);
  }
  function pair(){
    const L = lesson(); if (!L) return null;
    const tab = activeTab(), i = indexFromCount();
    if (tab === 'vocab') { const x=L.vocab?.[i] || L.vocab?.[0]; return x ? {en:x[0],vi:x[2],ipa:x[1]} : null; }
    if (tab === 'examples') { const x=L.examples?.[i] || L.examples?.[0]; return x ? {en:x[1],vi:x[2],ipa:''} : null; }
    if (tab === 'dialogue') {
      const line = root()?.querySelector('[data-dialogue-line].lf51m-focus-line');
      const j = Number(line?.dataset.dialogueLine || 0); const x=L.dialogue?.[j] || L.dialogue?.[0];
      return x ? {en:x[1],vi:x[2],ipa:''} : null;
    }
    if (tab === 'review') {
      const en = root()?.querySelector('.lf51d-reviewq')?.dataset.lfEn || root()?.querySelector('.lf51d-reviewq')?.textContent || '';
      if (en) {
        const all=[...(L.examples||[]).map(x=>({en:x[1],vi:x[2]})),...(L.vocab||[]).map(x=>({en:x[0],vi:x[2],ipa:x[1]}))];
        return all.find(x=>norm(x.en)===norm(en)) || all[i] || null;
      }
    }
    return null;
  }

  function ensureBar(){
    const r=root(); if(!r || r.querySelector('.lf51m-direction')) return;
    const tabs=r.querySelector('.lf51d-tabs'); if(!tabs) return;
    const bar=document.createElement('div'); bar.className='lf51m-direction';
    bar.innerHTML=`<div class="lf51m-dir-label">Chiều học</div><div class="lf51m-dir-buttons"><button data-lf-dir="vi-en">🇻🇳 VI → EN</button><button data-lf-dir="en-vi">🇬🇧 EN → VI</button></div>`;
    tabs.parentElement?.insertBefore(bar,tabs);
  }

  function ensureStyle(){
    if(document.getElementById('lf51MobileDirectionStyle')) return;
    const s=document.createElement('style'); s.id='lf51MobileDirectionStyle'; s.textContent=`
      .lf51m-direction{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#eef5ff;border-bottom:1px solid #d8e5f5}
      .lf51m-dir-label{font-size:.72rem;font-weight:900;color:#52657d;white-space:nowrap}
      .lf51m-dir-buttons{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1}
      .lf51m-dir-buttons button{min-height:40px;border:1px solid #c9d9ec;border-radius:10px;background:#fff;color:#25415f;font-weight:900;font-size:.78rem;touch-action:manipulation}
      .lf51m-dir-buttons button.active{background:#1677ff;border-color:#1677ff;color:#fff;box-shadow:0 4px 12px rgba(22,119,255,.2)}
      .lf51m-direction-note{font-size:.72rem;color:#64748b;margin-top:5px;font-weight:700}
      @media (min-width:700px) and (orientation:landscape){.lf51m-direction{max-width:100%}.lf51m-dir-buttons{max-width:420px}}
    `; document.head.appendChild(s);
  }

  function applyDirection(){
    const r=root(); if(!r || !r.classList.contains('on')) return;
    ensureBar();
    r.querySelectorAll('[data-lf-dir]').forEach(b=>b.classList.toggle('active', b.dataset.lfDir===direction));
    r.dataset.studyDirection=direction;
    const L=lesson(); if(!L) return;
    const tab=activeTab(), i=indexFromCount();

    if(tab==='vocab'){
      const x=L.vocab?.[i]||L.vocab?.[0]; if(x){
        const word=r.querySelector('.lf51d-word'), ipa=r.querySelector('.lf51d-vocabhero .lf51d-ipa'), meaning=r.querySelector('.lf51d-vocabhero .lf51d-meaning');
        if(word&&ipa&&meaning){
          if(direction==='vi-en'){word.textContent=x[2]; ipa.textContent='🇻🇳 Tiếng Việt → nhớ tiếng Anh'; meaning.innerHTML=`<span style="color:#1677ff;font-weight:950">${esc(x[0])}</span> <span style="font-weight:500;color:#6b7a90">${esc(x[1]||'')}</span>`;}
          else{word.textContent=x[0]; ipa.textContent=x[1]||''; meaning.textContent=x[2];}
        }
      }
    }

    if(tab==='examples'){
      const x=L.examples?.[i]||L.examples?.[0]; if(x){
        const box=r.querySelector('.lf51d-vocabhero > div'); if(box){
          const ex=box.querySelector('.lf51d-example'), vi=box.querySelector('.lf51d-vi');
          if(ex&&vi){ if(direction==='vi-en'){ex.textContent=x[2]; vi.textContent=x[1]; vi.style.fontStyle='normal'; vi.style.fontWeight='850'; vi.style.color='#1677ff';} else {ex.textContent=x[1];vi.textContent=x[2];vi.style.fontStyle='italic';vi.style.fontWeight='';vi.style.color='';} }
        }
        const task=r.querySelector('.lf51d-toolbox');
        if(task){const title=task.querySelector('b');const prompt=task.querySelector('.lf51d-vi');const input=task.querySelector('input');if(direction==='en-vi'){if(title)title.textContent='✍️ Bài tập nhỏ · EN → VI';if(prompt){prompt.textContent=x[1];prompt.style.fontStyle='normal'}if(input)input.placeholder='Nhập nghĩa tiếng Việt...';}else{if(title)title.textContent='✍️ Bài tập nhỏ · VI → EN';if(prompt)prompt.textContent=x[2];if(input)input.placeholder='Nhập câu tiếng Anh...';}}
      }
    }

    if(tab==='review'){
      const items=[...(L.examples||[]).map(x=>({en:x[1],vi:x[2]})),...(L.vocab||[]).map(x=>({en:x[0],vi:x[2],ipa:x[1]}))];
      const q=r.querySelector('.lf51d-reviewq'); const a=r.querySelector('.lf51d-reviewa');
      if(q){
        if(!q.dataset.lfEn){const found=items.find(x=>norm(x.en)===norm(q.textContent));if(found){q.dataset.lfEn=found.en;q.dataset.lfVi=found.vi;}}
        const en=q.dataset.lfEn,vi=q.dataset.lfVi;
        if(en&&vi){q.textContent=direction==='vi-en'?vi:en;if(a)a.textContent=direction==='vi-en'?en:vi;}
      }
    }

    const inputTool=[...r.querySelectorAll('.lf51d-coachCard')].find(x=>/Luyện nhập đáp án/i.test(x.textContent||''));
    const p=pair();
    if(inputTool&&p){const main=inputTool.querySelector('.lf51d-coachMain');const inp=inputTool.querySelector('input');if(direction==='en-vi'){if(main)main.textContent=p.en;if(inp)inp.placeholder='Nhập nghĩa tiếng Việt...';}else{if(main)main.textContent=p.vi;if(inp)inp.placeholder='Nhập tiếng Anh...';}}
  }

  function customCheck(button){
    if(direction!=='en-vi') return false;
    const p=pair(); if(!p) return false;
    const r=root();
    let input=null,out=null;
    if(button.hasAttribute('data-check-main')){input=r.querySelector('#lf51dMainAnswer');out=r.querySelector('#lf51dMainResult');}
    else if(button.hasAttribute('data-check-coach')){input=r.querySelector('#lf51dCoachInput');out=r.querySelector('#lf51dCoachResult');}
    else return false;
    if(!input||!out) return false;
    const ok=norm(input.value)===norm(p.vi);
    out.textContent=ok?'✅ Chính xác.':`❌ Chưa đúng. Đáp án: ${p.vi}`;
    out.style.color=ok?'#15803d':'#b42318';
    return true;
  }

  function bind(){
    const r=root(); if(!r || r.dataset.lfDirBound) return;
    r.dataset.lfDirBound='1';
    r.addEventListener('click',e=>{
      const dir=e.target.closest('[data-lf-dir]');
      if(dir){direction=dir.dataset.lfDir;try{localStorage.setItem(STORE,direction);}catch(_){}applyDirection();return;}
      const line=e.target.closest('[data-dialogue-line]');
      if(line){r.querySelectorAll('[data-dialogue-line]').forEach(x=>x.classList.remove('lf51m-focus-line'));line.classList.add('lf51m-focus-line');}
      const b=e.target.closest('button');
      if(b&&customCheck(b)){e.preventDefault();e.stopImmediatePropagation();return;}
      setTimeout(applyDirection,0);setTimeout(applyDirection,60);
    },true);
    r.addEventListener('change',()=>{setTimeout(applyDirection,0);setTimeout(applyDirection,80);},true);
  }

  async function init(){
    ensureStyle(); await loadLessonData();
    let n=0; const t=setInterval(()=>{n++; const r=root(); if(r){bind();applyDirection();} if(r&&lessons||n>40)clearInterval(t);},150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
