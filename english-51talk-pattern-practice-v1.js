/* LinguaFlash · 51Talk Pattern Practice v1
   Beginner-friendly grammar drills derived only from grammar points already
   taught in the user's 51Talk lessons. This module does not change SRS grading.
*/
(() => {
  'use strict';
  if (window.__LF_51TALK_PATTERN_PRACTICE_V1__) return;
  window.__LF_51TALK_PATTERN_PRACTICE_V1__ = true;

  const DRILLS = {
    ROLE_TO:{q:'Vai trò của tôi là kiểm tra bản vẽ.\nMy role is to ___ the drawings.',a:['check'],why:'Sau “is to” dùng động từ nguyên mẫu: to check.'},
    TRAINING_IN:{q:'I received ___ in furniture design.',a:['training'],why:'“training” là danh từ: receive training in + lĩnh vực.'},
    EMPLOYEE_OF:{q:'Linda is an ___ of Citibank.',a:['employee'],why:'employee = nhân viên; employer = người/công ty tuyển dụng.'},
    IT_TAKES:{q:'It ___ me 30 minutes to get to work.',a:['takes'],why:'Mẫu: It takes + người + thời gian + to V.'},
    ADAPT_TO:{q:'I am adapting to ___ with a new team.',a:['working'],why:'Trong “adapt to”, to là giới từ nên động từ theo sau dùng V-ing.'},
    COUPLE_OF:{q:'Give me a couple of ___.',a:['minutes','days'],why:'Sau “a couple of” dùng danh từ số nhiều.'},
    AFTER_CLAUSE:{q:'___ finishing work, I went home.',a:['after'],why:'Mẫu: after + V-ing hoặc after + S + V.'},
    FEEL_ADJ:{q:'I feel ___ today.',a:['tired','nervous','worried','sick','better'],why:'Sau “feel” khi nói trạng thái dùng tính từ.'},
    WHAT_DO_WHEN:{q:'What ___ you do when you are sick?',a:['do'],why:'Với “you” ở hiện tại đơn dùng trợ động từ do.'},
    LOOK_ADJ:{q:'You look ___ today.',a:['tired','well','sick','nervous'],why:'Sau “look” khi mô tả trạng thái dùng tính từ.'},
    HAVE_SYMPTOM:{q:'I ___ a headache.',a:['have'],why:'Dùng have + triệu chứng: have a headache / a cold / a fever.'},
    REMEMBER_TO:{q:'Remember ___ bring an umbrella.',a:['to'],why:'remember to + V = nhớ làm một việc.'},
    PAST_IRREGULAR:{q:'Yesterday I ___ home early. (go)',a:['went'],why:'Quá khứ của go là went.'},
    TAKE_CARE_OF:{q:'She is taking care ___ him.',a:['of'],why:'Cụm cố định: take care of + người/vật.'},
    PRESENT_CONT:{q:'She ___ taking care of him.',a:['is'],why:'Hiện tại tiếp diễn: am/is/are + V-ing.'},
    SORRY_TO_HEAR:{q:"I'm sorry ___ hear that.",a:['to'],why:"Cụm tự nhiên: I'm sorry to hear that."},
    WHAT_HAPPENED:{q:'What ___?',a:['happened'],why:'“What happened?” không cần did vì what là chủ ngữ.'},
    ON_MY_WAY:{q:'It started to rain on my way ___ .',a:['home'],why:'Nói “on my way home”; home không cần to.'},
    DID_QUESTION:{q:'Did you ___ an umbrella with you?',a:['take'],why:'Sau did dùng động từ nguyên mẫu: Did you take...? Không dùng took.'},
    GET_ADJ:{q:'I got all ___.',a:['wet'],why:'get/got + tính từ = trở nên/rơi vào trạng thái.'},
    EASY_TO:{q:"It's easy ___ catch a cold when you are wet.",a:['to'],why:'Mẫu: It is + adjective + to + V.'},
    NEED_TO:{q:'I need ___ have a good rest tonight.',a:['to'],why:'need to + V nguyên mẫu.'},
    GERUND_SUBJECT:{q:'___ English takes time. (learn)',a:['learning'],why:'V-ing có thể làm chủ ngữ: Learning English takes time.'},
    MAY_BASE:{q:'This change may ___ the schedule. (affect)',a:['affect'],why:'Sau may dùng động từ nguyên mẫu, không có to.'},
    MAKE_OBJECT:{q:'Drinking water may make you ___ better.',a:['feel'],why:'make + someone + V nguyên mẫu: make you feel.'},
    WILL_BASE:{q:'I will ___ the drawing this afternoon. (send)',a:['send'],why:'Sau will dùng động từ nguyên mẫu.'},
    REFLEXIVE:{q:'I will take care of ___.',a:['myself'],why:'I → myself khi người làm và người nhận tác động là cùng một người.'}
  };

  const LESSON_KEYS = {
    '2026-10-28':['ROLE_TO','TRAINING_IN','EMPLOYEE_OF','IT_TAKES','ADAPT_TO','COUPLE_OF','AFTER_CLAUSE','FEEL_ADJ'],
    '2026-10-29':['WHAT_DO_WHEN','LOOK_ADJ','HAVE_SYMPTOM','REMEMBER_TO','PAST_IRREGULAR','TAKE_CARE_OF','PRESENT_CONT','SORRY_TO_HEAR','WHAT_HAPPENED','ON_MY_WAY','DID_QUESTION','GET_ADJ','EASY_TO','NEED_TO','GERUND_SUBJECT','MAY_BASE','MAKE_OBJECT','WILL_BASE','REFLEXIVE']
  };

  let activeKeys = [];
  let index = 0;
  let correct = 0;
  let answered = false;

  const norm = value => String(value || '').trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function currentCardKeys(){
    try {
      if (!Array.isArray(filteredDeck) || !filteredDeck.length) return [];
      const card = filteredDeck[currentIndex];
      if (!card || !(String(card.id||'').startsWith('en51_') || card.category === '51Talk English')) return [];
      return Array.isArray(card.grammarKeys) ? card.grammarKeys.filter(k=>DRILLS[k]) : [];
    } catch (_) { return []; }
  }

  function ensureStyle(){
    if(document.getElementById('lf51PatternStyle')) return;
    const style=document.createElement('style');style.id='lf51PatternStyle';style.textContent=`
      #lf51PatternPractice{width:min(100%,760px);margin:12px auto 0;border:1px solid #bbf7d0;background:linear-gradient(135deg,#f0fdf4,#fff);border-radius:18px;padding:14px;box-shadow:0 8px 24px rgba(15,23,42,.04)}
      #lf51PatternPractice.hidden{display:none!important}.lf51p-top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.lf51p-title{font-weight:900;color:#166534}.lf51p-progress{font-size:.75rem;font-weight:800;color:#64748b}.lf51p-q{white-space:pre-line;margin-top:10px;border:1px solid #d1fae5;background:#fff;border-radius:13px;padding:11px;font-weight:800;color:#1e293b;line-height:1.55}.lf51p-row{display:flex;gap:8px;margin-top:9px}.lf51p-row input{flex:1;min-width:0;border:2px solid #cbd5e1;border-radius:12px;padding:10px 12px;font-size:1rem;outline:none}.lf51p-row input:focus{border-color:#22c55e}.lf51p-btn{border:0;border-radius:12px;padding:10px 14px;font-weight:900;background:#16a34a;color:#fff;white-space:nowrap}.lf51p-nav{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.lf51p-nav button{border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:7px 10px;font-size:.78rem;font-weight:800;color:#334155}.lf51p-feedback{display:none;margin-top:9px;border-radius:12px;padding:9px 11px;font-size:.82rem;line-height:1.5}.lf51p-feedback.ok{display:block;background:#ecfdf5;color:#065f46}.lf51p-feedback.bad{display:block;background:#fff1f2;color:#9f1239}.lf51p-why{margin-top:4px;font-weight:650}.lf51p-library{margin-top:10px;display:flex;gap:7px;flex-wrap:wrap}.lf51p-library button{border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;border-radius:999px;padding:6px 9px;font-size:.72rem;font-weight:850}
      @media(max-width:520px){.lf51p-row{flex-direction:column}.lf51p-btn{width:100%}}
    `;document.head.appendChild(style);
  }

  function ensurePanel(){
    let panel=document.getElementById('lf51PatternPractice');
    if(panel) return panel;
    const anchor=document.getElementById('lf51GrammarPanel') || document.getElementById('studyAnswerPanel') || document.getElementById('flashcardContainer');
    if(!anchor) return null;
    panel=document.createElement('section');panel.id='lf51PatternPractice';panel.className='hidden';
    if(anchor.id==='lf51GrammarPanel') anchor.insertAdjacentElement('afterend',panel);
    else anchor.appendChild(panel);
    return panel;
  }

  function chooseKeys(keys){
    activeKeys=(keys||[]).filter(k=>DRILLS[k]);
    index=0;correct=0;answered=false;render();
  }

  function render(){
    ensureStyle();const panel=ensurePanel();if(!panel)return;
    if(!activeKeys.length){panel.classList.add('hidden');panel.innerHTML='';return;}
    index=Math.max(0,Math.min(index,activeKeys.length-1));
    const key=activeKeys[index],drill=DRILLS[key];if(!drill){panel.classList.add('hidden');return;}
    answered=false;
    panel.innerHTML=`<div class="lf51p-top"><div><div class="lf51p-title">✍️ Luyện mẫu câu</div><div class="lf51p-progress">Câu ${index+1}/${activeKeys.length} · đúng ${correct}</div></div><button type="button" class="lf51p-btn" data-lf51p-new>Đổi bài</button></div><div class="lf51p-q">${esc(drill.q)}</div><div class="lf51p-row"><input id="lf51PatternInput" type="text" autocomplete="off" autocapitalize="none" placeholder="Điền phần còn thiếu..."><button type="button" class="lf51p-btn" data-lf51p-check>Kiểm tra</button></div><div id="lf51PatternFeedback" class="lf51p-feedback"></div><div class="lf51p-nav"><button type="button" data-lf51p-prev>← Câu trước</button><button type="button" data-lf51p-next>Câu tiếp →</button></div><div class="lf51p-library"><button type="button" data-lf51p-lesson="2026-10-28">Bài 28/10</button><button type="button" data-lf51p-lesson="2026-10-29">Unit 3 · Lesson 1</button></div>`;
    panel.classList.remove('hidden');
    setTimeout(()=>document.getElementById('lf51PatternInput')?.focus?.(),0);
  }

  function check(){
    const key=activeKeys[index],drill=DRILLS[key],input=document.getElementById('lf51PatternInput'),fb=document.getElementById('lf51PatternFeedback');if(!drill||!input||!fb)return;
    const value=norm(input.value);const ok=drill.a.some(a=>norm(a)===value);
    if(ok&&!answered){correct++;answered=true;}
    fb.className='lf51p-feedback '+(ok?'ok':'bad');
    fb.innerHTML=ok?`✅ Đúng.<div class="lf51p-why">${esc(drill.why)}</div>`:`❌ Chưa đúng. Đáp án: <b>${esc(drill.a[0])}</b><div class="lf51p-why">${esc(drill.why)}</div>`;
    const p=document.querySelector('#lf51PatternPractice .lf51p-progress');if(p)p.textContent=`Câu ${index+1}/${activeKeys.length} · đúng ${correct}`;
  }

  function next(delta){if(!activeKeys.length)return;index=(index+delta+activeKeys.length)%activeKeys.length;render();}
  function syncToCard(){const keys=currentCardKeys();if(keys.length)chooseKeys(keys);else{const panel=document.getElementById('lf51PatternPractice');if(panel)panel.classList.add('hidden');}}

  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('button');if(!b)return;
    if(b.matches('[data-lf51p-check]'))check();
    else if(b.matches('[data-lf51p-prev]'))next(-1);
    else if(b.matches('[data-lf51p-next]'))next(1);
    else if(b.matches('[data-lf51p-new]')){const copy=activeKeys.slice().sort(()=>Math.random()-.5);chooseKeys(copy);}
    else if(b.matches('[data-lf51p-lesson]'))chooseKeys(LESSON_KEYS[b.getAttribute('data-lf51p-lesson')]||[]);
  });
  document.addEventListener('keydown',e=>{if(e.target?.id==='lf51PatternInput'&&e.key==='Enter'){e.preventDefault();check();}});

  function patchRender(){
    const old=window.renderCurrentCard;
    if(typeof old!=='function'||old.__lf51PatternPatched)return;
    const wrapped=function(...args){const out=old.apply(this,args);setTimeout(syncToCard,0);return out;};
    wrapped.__lf51PatternPatched=true;window.renderCurrentCard=wrapped;
  }

  function init(){ensureStyle();ensurePanel();patchRender();setTimeout(syncToCard,120);}
  window.lf51PracticeLesson=date=>chooseKeys(LESSON_KEYS[date]||[]);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();