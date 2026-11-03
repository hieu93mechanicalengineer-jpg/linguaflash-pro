/* Chinese lesson workspace. Read the active course and use the existing card IDs for ratings. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const han = value => /[\u3400-\u9fff]/.test(value || '');
  const tabs = {vocab:'📚 Từ vựng',examples:'📝 Câu mẫu',dialogue:'💬 Hội thoại',grammar:'📘 Ngữ pháp',speaking:'🗣️ Luyện nói',review:'🧠 Ôn nhanh'};
  let tab='vocab', mode='vi-zh', page=0, signature='', rows=[], current=null, timer;
  let root, useChoices=false;
  const topic = () => byId('studyTopicFilter').value;
  const category = () => byId('studyCategoryFilter').value;
  const cn = c => getCardTextInLanguage(c,'Tiếng Trung');
  const vi = c => getCardTextInLanguage(c,'Tiếng Việt');
  const noteKey = () => 'lfzh_note_' + category() + '_' + topic();
  function sameScope(c) {
    return (topic()==='ALL' || c.topic===topic()) && (category()==='ALL' || getCardCategory(c)===category());
  }
  function content(cards) {
    if(tab==='grammar') {
      const n=topic().match(/Bài\s*(\d+)/i)?.[1];
      if(typeof GIA_HAN_GRAMMAR_DB==='undefined') return [];
      const all=topic()==='ALL' && (category()==='ALL'||category()==='Gia Hân');
      if(!all && (!n || !/^Gia Hân/i.test(topic()))) return [];
      return (all?Object.values(GIA_HAN_GRAMMAR_DB).flat():GIA_HAN_GRAMMAR_DB[n] || []).map(x=>({cn:x.cn || '',vi:x.vi || x.code,pinyin:x.pinyin,detail:x.note || x.en,label:x.code}));
    }
    if(tab==='dialogue') {
      if(typeof DIALOGUES_DB==='undefined') return [];
      return Object.values(DIALOGUES_DB).filter(d=>String(d.language).startsWith('zh') &&
        (category()==='ALL' || d.course===category()) && (topic()==='ALL' || d.topic===topic() || (d.course===getCardCategory({topic:topic()}) && d.topic===parseCategoryAndTopic(topic()).sub)))
        .flatMap(d=>d.lines.map(l=>({cn:l.cn,vi:l.vn,pinyin:l.pinyin,label:d.title+' · '+l.speaker})));
    }
    const out=[], seen=new Set();
    for(const c of cards) {
      const sentence=c.cardType==='sentence', example=han(c.example)?c.example:'';
      if(tab==='vocab' && sentence) continue;
      const useExample=tab==='examples' && !sentence;
      const word=useExample?example:cn(c);
      if(!han(word) || (tab==='examples' && seen.has(word))) continue;
      seen.add(word);
      out.push({cn:word,vi:useExample?c.exampleTrans:vi(c),pinyin:useExample?'':c.phonetic,example:useExample?'':example,
        detail:useExample?'':c.exampleTrans,label:c.topic});
    }
    return out;
  }
  function say(text) { if(text) speakText(text,'Tiếng Trung'); }
  function render() {
    clearTimeout(timer);
    const pool=allCards.filter(c=>sameScope(c) && han(cn(c)));
    const topicOptions=[...new Set(allCards.filter(c=>(category()==='ALL'||category()===getCardCategory(c)) && han(cn(c))).map(c=>c.topic).filter(Boolean))];
    root.innerHTML='<header><strong>中文 · Tiếng Trung</strong><select aria-label="Chọn bài tiếng Trung"><option value="ALL">Tất cả bài</option>'+topicOptions.map(t=>'<option '+(topic()===t?'selected ':'')+'value="'+esc(t)+'">'+esc(t)+'</option>').join('')+'</select></header><nav>'+Object.entries(tabs).map(([key,label])=>'<button data-tab="'+key+'" aria-pressed="'+(key===tab)+'">'+label+'</button>').join('')+'</nav><div class="zh-layout"><article></article><aside></aside></div>';
    const aside=root.querySelector('aside');
    aside.innerHTML='<b>中文 · Góc học tập</b><label>Ghi chú bài học<textarea placeholder="Ghi chú của bạn"></textarea></label>';
    try{aside.querySelector('textarea').value=localStorage.getItem(noteKey()) || '';}catch(_){}
    if(tab==='review'){renderReview(pool);return;}
    rows=content(pool);
    page=Math.min(page,Math.max(0,rows.length-1));
    current=rows[page];
    const article=root.querySelector('article');
    if(!current){article.textContent='Chưa có nội dung '+tabs[tab].slice(2).trim().toLowerCase()+' cho bài đã chọn.';return;}
    const r=current;
    article.innerHTML='<div class="zh-count">'+esc(tabs[tab])+' · '+(page+1)+' / '+rows.length+'</div><div class="zh-word"><strong lang="zh-CN">'+esc(r.cn || r.label)+'</strong>'+
      (byId('togglePhonetic')?.checked && r.pinyin?'<div class="zh-pinyin">'+esc(r.pinyin)+'</div>':'')+'<p>'+esc(r.vi)+'</p>'+(r.cn?'<button data-act="listen">🔊 Nghe</button>':'')+'</div>'+
      (r.example?'<div class="zh-example"><b>Ví dụ</b><p lang="zh-CN">'+esc(r.example)+'</p><button data-act="example">🔊 Nghe câu</button></div>':'')+
      (r.detail?'<p>'+esc(r.detail)+'</p>':'')+(tab==='speaking'?'<button data-act="speak">🎙 Luyện phát âm câu này</button>':'')+
      '<footer><button data-step="-1" '+(page===0?'disabled':'')+'>← Trước</button><button data-step="1" '+(page+1===rows.length?'disabled':'')+'>Tiếp →</button></footer>';
  }
  function renderReview(pool) {
    const article=root.querySelector('article'),now=Date.now();
    const eligibleIds=new Set(pool.map(c=>c.id));
    current=filteredDeck.find(c=>eligibleIds.has(c.id) && !(Number(c.nextReview)>now));
    if(!current){
      article.textContent='Đã hết thẻ cần ôn trong bài theo lịch và mục tiêu hôm nay.';
      const midnight=new Date();midnight.setHours(24,0,0,0);
      let next=midnight.getTime();for(const c of pool)if(c.nextReview>now)next=Math.min(next,c.nextReview);
      timer=setTimeout(()=>{if(!root.hidden && tab==='review'){applyStudyFilters();render();}},Math.max(50,next-now+50));return;
    }
    article.innerHTML='<div class="zh-modes">'+[['zh-vi','ZH → VI'],['vi-zh','VI → ZH'],['listen','🎧 Nghe viết']].map(([v,label])=>'<button data-mode="'+v+'" aria-pressed="'+(v===mode)+'">'+label+'</button>').join('')+'</div><div class="zh-word"><strong>'+esc(mode==='listen'?'Nghe và viết lại':mode==='vi-zh'?vi(current):cn(current))+'</strong>'+
      (mode!=='vi-zh'?'<button data-act="listen">🔊 Nghe</button>':'')+'</div>'+
      (mode==='zh-vi'?'':'<form><input required maxlength="1000" autocomplete="off" spellcheck="false" aria-label="Nhập tiếng Trung" placeholder="Nhập tiếng Trung…"><button>Kiểm tra</button></form>')+
      '<div role="status"></div><details><summary>Hiện đáp án</summary><div>'+esc(mode==='zh-vi'?vi(current):cn(current))+'</div><small>'+esc(current.phonetic || '')+'</small></details><div class="zh-grades"></div>';
    if(mode!=='zh-vi'){
      const alternatives=[...new Set(pool.filter(c=>c.cardType===current.cardType).map(cn))].filter(v=>v && v!==cn(current));
      if(alternatives.length){
        const form=article.querySelector('form');
        form.insertAdjacentHTML('beforebegin','<button data-act="choices">'+(useChoices?'Chuyển sang nhập':'Chọn đáp án')+'</button>');
        if(useChoices){
          const draw = values => values.splice(Math.floor(Math.random()*values.length),1)[0];
          const choices=[cn(current)];
          while(alternatives.length && choices.length<4) choices.push(draw(alternatives));
          const picks=[];
          while(choices.length){const value=draw(choices);picks.push('<button data-choice="'+esc(value)+'">'+esc(value)+'</button>');}
          form.hidden=true;
          form.insertAdjacentHTML('afterend','<div class="zh-modes">'+picks.join('')+'</div>');
        }
      }
    }
    article.querySelector('details').addEventListener('toggle',e=>{if(e.target.open)showGrades();});
  }
  function showGrades(){
    const labels=window.LFFSRS.previewLabels(current);
    root.querySelector('.zh-grades').innerHTML=labels.map((l,i)=>'<button data-grade="'+i+'">'+['Lại','Khó','Được','Dễ'][i]+'<small>'+esc(l)+'</small></button>').join('');
  }
  function enterPronunciation() {
    byId('pronunLangFilter').value='Tiếng Trung';
    populatePronunCategoryDropdown();byId('pronunCategoryFilter').value=category();
    populatePronunTopicDropdown();byId('pronunTopicFilter').value=topic();
    const index=getPronunciationPool().findIndex(t=>t.word===current.cn);
    pronunIndex=Math.max(0,index);switchTab('pronunciation');
  }
  function sync() {
    if(!root)return;
    const on=byId('studyLangFilter')?.value==='Tiếng Trung' && !byId('tab-study').classList.contains('hidden') &&
      !document.body.classList.contains('lf-focus-mode') && !document.body.classList.contains('lf-study-list-mode');
    root.hidden=!on; document.body.classList.toggle('lfzh-browse',on);
    clearTimeout(timer);
    if(!on)return;
    const scope=JSON.stringify([category(),topic()]);if(scope!==signature){page=0;signature=scope;}
    render();
  }
  function init(){
    const flash=byId('flashcardContainer');if(!flash)return;
    root=document.createElement('section');root.id='lfChineseStudy';root.hidden=true;flash.before(root);
    root.addEventListener('change',e=>{if(e.target.matches('header select')){const sel=byId('studyTopicFilter');sel.value=e.target.value;sel.dispatchEvent(new Event('change',{bubbles:true}));}});
    root.addEventListener('input',e=>{if(e.target.matches('textarea'))try{localStorage.setItem(noteKey(),e.target.value);}catch(_){}});
    root.addEventListener('submit',e=>{
      e.preventDefault();const input=e.target.querySelector('input');if(!input || !current)return;
      const normalize=v=>v.normalize('NFKC').replace(/[\s。！？.!?,，、]/gu,'');
      const ok=normalize(input.value)===normalize(cn(current));
      root.querySelector('[role=status]').textContent=ok?'✓ Chính xác':'Chưa đúng. Bạn có thể thử lại.';
      if (!ok && !e.target.hidden) {
        const typed=[...normalize(input.value)], expected=[...normalize(cn(current))];
        const lengths=Array.from({length:typed.length+1},()=>new Uint16Array(expected.length+1));
        for(let i=typed.length-1;i>=0;i--)for(let j=expected.length-1;j>=0;j--)
          lengths[i][j]=typed[i]===expected[j]?1+lengths[i+1][j+1]:Math.max(lengths[i+1][j],lengths[i][j+1]);
        const slots=[];let i=0,j=0;
        while(j<expected.length){
          if(i<typed.length && typed[i]===expected[j]){slots.push(expected[j++]);i++;}
          else if(i<typed.length && lengths[i+1][j]>=lengths[i][j+1])i++;
          else{slots.push('＿');j++;}
        }
        root.querySelector('[role=status]').append(document.createElement('br'),slots.join(' '));
      } else if(ok) say(cn(current));
      showGrades();
    });
    root.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.tab){tab=b.dataset.tab;page=0;if(tab==='review')applyStudyFilters();render();}
      else if(b.dataset.mode){mode=b.dataset.mode;render();}
      else if(b.dataset.step){page+=Number(b.dataset.step);render();}
      else if(b.dataset.grade!==undefined && current){window.LFFSRS.rateListCard(current,Number(b.dataset.grade));applyStudyFilters();render();}
      else if(b.dataset.act==='choices'){useChoices=!useChoices;render();}
      else if(b.dataset.choice){const form=root.querySelector('form');form.querySelector('input').value=b.dataset.choice;form.requestSubmit();}
      else if(b.dataset.act==='speak')enterPronunciation();
      else if(b.dataset.act==='example')say(current?.example);
      else if(b.dataset.act==='listen')say(tab==='review'?cn(current):current?.cn);
    });
    document.addEventListener('change',e=>{if(['studyLangFilter','studyCategoryFilter','studyTopicFilter','studyDueOnly','togglePhonetic'].includes(e.target.id))sync();});
    new MutationObserver(records=>{if(records.some(r=>['lf-study-list-mode','lf-focus-mode'].some(cl=>(r.oldValue || '').split(' ').includes(cl)!==document.body.classList.contains(cl))))sync();}).observe(document.body,{attributes:true,attributeOldValue:true,attributeFilter:['class']});
    window.addEventListener('pageshow',sync);sync();
  }
  window.lfChineseStudy={sync,openReview(){tab='review';sync();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
