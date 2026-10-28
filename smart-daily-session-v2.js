/* LinguaFlash Smart Daily Session v2.2 + Focus Mode
   Goal-driven: the user's Daily Goal is the source of truth.
   No fixed 20-card cap for "Study today"; manual study batches remain unchanged.
*/
(() => {
  'use strict';

  const FOCUS_CLASS = 'lf-focus-mode';
  let activeSummary = null;

  function ui() {
    let lang = 'vi';
    try { if (typeof currentUiLang === 'string') lang = currentUiLang; } catch (_) {}
    if (lang === 'en') return {
      title:'Study today', desc:'Built from the rest of your daily goal: reviews first, then new cards.',
      start:mins=>`▶ Study today · ${mins} min`, done:'Today’s goal is complete', extra:'Practice weak words',
      review:'reviews', due:'due', weak:'weak', fresh:'new', focus:'Focus', exit:'Exit focus',
      empty:'No eligible cards are available for the remaining goal with the current review mode.',
      goal:(r,n)=>`Remaining goal: ${r} reviews · ${n} new`
    };
    if (lang === 'zh') return {
      title:'今天学习', desc:'按照你今天剩余的目标自动组卷：先复习，再学习新词。',
      start:mins=>`▶ 今天学习 · ${mins} 分钟`, done:'今天的目标已完成', extra:'练习薄弱词汇',
      review:'复习', due:'到期', weak:'薄弱', fresh:'新词', focus:'专注模式', exit:'退出专注',
      empty:'当前复习模式下，没有符合剩余目标的卡片。',
      goal:(r,n)=>`剩余目标：复习 ${r} · 新词 ${n}`
    };
    return {
      title:'Học hôm nay', desc:'Tự tạo phiên đúng theo phần mục tiêu hôm nay còn thiếu: ưu tiên ôn trước, rồi từ mới.',
      start:mins=>`▶ Học hôm nay · ${mins} phút`, done:'Đã hoàn thành mục tiêu hôm nay', extra:'Luyện thêm từ yếu',
      review:'ôn', due:'đến hạn', weak:'yếu', fresh:'mới', focus:'Tập trung', exit:'Thoát Focus',
      empty:'Hiện không có đủ thẻ phù hợp với phần mục tiêu còn lại và chế độ ôn đang chọn.',
      goal:(r,n)=>`Còn mục tiêu: ${r} ôn · ${n} mới`
    };
  }

  function safeCards(){ try { return Array.isArray(allCards) ? allCards : []; } catch(_){ return []; } }
  function settings(){ try { if (typeof getDailyGoalSettings === 'function') return getDailyGoalSettings(); } catch(_){} return {newLimit:20,reviewLimit:30,reviewMode:'due'}; }
  function dailyProgress(){ try { if (typeof getDailyProgress === 'function') return getDailyProgress(); } catch(_){} return {newIds:[],reviewIds:[]}; }
  function limitValue(value, fallback){ const n=Number(value); return Number.isFinite(n) ? Math.max(0,Math.floor(n)) : fallback; }
  function targetLanguage(){ return document.getElementById('studyLangFilter')?.value || 'Tiếng Trung'; }
  function currentTrack(){ return {category:document.getElementById('studyCategoryFilter')?.value||'ALL',topic:document.getElementById('studyTopicFilter')?.value||'ALL'}; }

  function metrics(card, now=Date.now()) {
    const repetitions = Number(card?.repetitions || 0);
    const reviews = Number(card?.reviewCount || 0);
    const last = Number(card?.lastReview || card?.lastReviewedAt || 0);
    const interval = Number(card?.interval || 0);
    const hasQuality = card?.lastAnswerQuality !== undefined && card?.lastAnswerQuality !== null && card?.lastAnswerQuality !== '';
    const quality = hasQuality ? Number(card.lastAnswerQuality) : NaN;
    const learned = repetitions > 0 || reviews > 0 || last > 0 || interval > 0 || card?.needsReview === true || hasQuality;
    const isNew = !learned;
    const next = Number(card?.nextReview || 0);
    let weakScore=0; try { weakScore=Number(window.lfWeakMetrics?.(card,now)?.score||0); } catch(_){}
    const missed = learned && (card?.needsReview === true || quality === 0 || quality === 1);
    const due = learned && (missed || (next > 0 && next <= now));
    const overdueDays = due && next > 0 ? Math.max(0,(now-next)/86400000) : 0;
    return {isNew,learned,due,missed,weakScore,overdueDays,next};
  }

  function isNormalVocabularyCard(card){
    if(!card) return false;
    const topic=String(card.topic||''), section=String(card.sourceSection||'');
    if(/Luyện dịch/i.test(topic)||/Luyện dịch/i.test(section)) return false;
    if(card.cardType && card.cardType!=='vocab') return false;
    return true;
  }
  function cardFitsLanguage(card,language){
    if(!card||card.lang!==language||!isNormalVocabularyCard(card)) return false;
    const word=String(card.word||'').trim();
    if(!word) return false;
    return !/chữ ghi tay|không đủ ngữ cảnh|không xác định|unclear|unknown/i.test(word);
  }
  function newCardFitsTrack(card,track){
    if(!card) return false;
    let category=''; try { category=typeof getCardCategory==='function'?getCardCategory(card):(card.category||''); } catch(_){ category=card.category||''; }
    if(track.category&&track.category!=='ALL'&&track.category!=='__LF_WEAK__'&&category!==track.category) return false;
    if(track.topic&&track.topic!=='ALL'&&card.topic!==track.topic) return false;
    return true;
  }
  function shuffle(items){
    const out=items.slice();
    for(let i=out.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
    return out;
  }
  function reviewSort(a,b){ return b.m.weakScore-a.m.weakScore || Number(b.m.due)-Number(a.m.due) || b.m.overdueDays-a.m.overdueDays || a.index-b.index; }

  function buildPlan(language=targetLanguage()) {
    const now=Date.now(), cfg=settings(), progress=dailyProgress(), track=currentTrack();
    const newLimit=limitValue(cfg.newLimit,20), reviewLimit=limitValue(cfg.reviewLimit,30);
    const doneNew=new Set(progress.newIds||[]), doneReview=new Set(progress.reviewIds||[]);
    const newRemaining=Math.max(0,newLimit-doneNew.size), reviewRemaining=Math.max(0,reviewLimit-doneReview.size);
    const studied=new Set([...doneNew,...doneReview]);
    const fresh=[], learned=[];

    safeCards().forEach((card,index)=>{
      if(!cardFitsLanguage(card,language)||studied.has(card.id)) return;
      const m=metrics(card,now), item={card,m,index};
      if(m.isNew){ if(newCardFitsTrack(card,track)) fresh.push(item); }
      else learned.push(item);
    });

    const mode=String(cfg.reviewMode||'due');
    let eligibleReview;
    if(mode==='missed') eligibleReview=learned.filter(x=>x.m.missed||x.m.weakScore>=3).sort(reviewSort);
    else if(mode==='all') {
      const weak=learned.filter(x=>x.m.weakScore>=3).sort(reviewSort);
      const weakIds=new Set(weak.map(x=>x.card.id));
      eligibleReview=[...weak,...shuffle(learned.filter(x=>!weakIds.has(x.card.id)))];
    } else eligibleReview=learned.filter(x=>x.m.due).sort(reviewSort);

    const chosenReview=eligibleReview.slice(0,reviewRemaining);
    const chosenNew=fresh.slice(0,newRemaining);
    const deck=[], reviewOrdered=chosenReview.slice();
    let r=0,n=0;
    while(r<reviewOrdered.length||n<chosenNew.length){
      let took=0;
      while(r<reviewOrdered.length&&took<2){deck.push(reviewOrdered[r++].card);took++;}
      if(n<chosenNew.length) deck.push(chosenNew[n++].card);
      if(r>=reviewOrdered.length) while(n<chosenNew.length) deck.push(chosenNew[n++].card);
    }

    const bucketById=new Map(); chosenReview.forEach(x=>bucketById.set(x.card.id,'review')); chosenNew.forEach(x=>bucketById.set(x.card.id,'new'));
    const summary={language,deck,review:chosenReview.length,due:chosenReview.filter(x=>x.m.due).length,weak:chosenReview.filter(x=>x.m.weakScore>=3||x.m.missed).length,fresh:chosenNew.length,reviewRemaining,newRemaining,newLimit,reviewLimit,mode,track,bucketById};
    summary.minutes=deck.length?Math.max(2,Math.round(deck.length*0.75)):0;
    summary.goalsComplete=reviewRemaining===0&&newRemaining===0;
    return summary;
  }

  function ensureHomeCard(){
    let el=document.getElementById('lfSmartDailyHomeCard'); if(el) return el;
    const home=document.getElementById('tab-home'), hero=home?.querySelector('.app-hero'); if(!home||!hero) return null;
    el=document.createElement('div'); el.id='lfSmartDailyHomeCard'; el.className='app-card p-4 sm:p-5 border-2 border-indigo-100'; hero.insertAdjacentElement('afterend',el); return el;
  }
  function renderHomeCard(){
    const el=ensureHomeCard(); if(!el) return;
    const t=ui(), plan=buildPlan();
    if(!plan.deck.length){
      const title=plan.goalsComplete?`✅ ${t.done}`:`🎯 ${t.title}`;
      const detail=plan.goalsComplete?t.done:`${t.goal(plan.reviewRemaining,plan.newRemaining)} · ${t.empty}`;
      el.innerHTML=`<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div class="text-lg font-extrabold text-slate-900">${title}</div><div class="text-sm text-slate-600 mt-1">${detail}</div></div><button type="button" class="app-primary-btn shrink-0" id="lfSmartDailyExtraBtn">🔥 ${t.extra}</button></div>`;
      el.querySelector('#lfSmartDailyExtraBtn')?.addEventListener('click',()=>{ if(typeof window.lfOpenWeakDeck==='function') window.lfOpenWeakDeck(); });
      return;
    }
    el.innerHTML=`<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div class="min-w-0"><div class="text-xl font-extrabold text-slate-900">🧠 ${t.title}</div><div class="text-sm text-slate-600 mt-1">${t.desc}</div><div class="text-xs text-slate-500 mt-1 font-semibold">${t.goal(plan.reviewRemaining,plan.newRemaining)}</div><div class="mt-2 flex flex-wrap gap-2 text-xs font-bold"><span class="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1">${plan.review} ${t.review}</span><span class="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1">${plan.weak} ${t.weak}</span><span class="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">${plan.fresh} ${t.fresh}</span></div></div><button type="button" class="app-primary-btn shrink-0 text-base" id="lfSmartDailyStartBtn">${t.start(plan.minutes)}</button></div>`;
    el.querySelector('#lfSmartDailyStartBtn')?.addEventListener('click',openSmartDaily);
  }

  function injectFocusStyle(){
    if(document.getElementById('lfFocusModeStyle')) return;
    const style=document.createElement('style'); style.id='lfFocusModeStyle'; style.textContent=`body.${FOCUS_CLASS} header{display:none!important}body.${FOCUS_CLASS} nav.fixed.bottom-0{display:none!important}body.${FOCUS_CLASS} #tab-study>.bg-white:first-child{display:none!important}body.${FOCUS_CLASS} #lfWeakDeckBanner,body.${FOCUS_CLASS} #lfSmartQueueBanner{display:none!important}body.${FOCUS_CLASS} main.max-w-5xl{padding-top:64px!important}body.${FOCUS_CLASS} #tab-study{max-width:820px;margin:0 auto}body.${FOCUS_CLASS}{padding-bottom:max(24px,env(safe-area-inset-bottom))!important}#lfFocusBar{position:fixed;z-index:9998;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(94vw,760px);background:#0f172a;color:white;border-radius:16px;padding:9px 12px;box-shadow:0 10px 28px rgba(15,23,42,.28);display:flex;align-items:center;justify-content:space-between;gap:10px}#lfFocusBar.hidden{display:none!important}#lfFocusBar button{border:1px solid #475569;border-radius:10px;padding:7px 10px;font-weight:800;background:#1e293b;color:white;white-space:nowrap}@media(max-width:640px){body.${FOCUS_CLASS} main.max-w-5xl{padding-top:58px!important}#lfFocusBar{font-size:13px}}`; document.head.appendChild(style);
  }
  function ensureFocusBar(){ let bar=document.getElementById('lfFocusBar'); if(bar)return bar; bar=document.createElement('div');bar.id='lfFocusBar';bar.className='hidden';document.body.appendChild(bar);return bar; }
  function focusProgressText(){
    const t=ui(); let index=0,total=0; try{index=Number(currentIndex||0)+1;total=Array.isArray(filteredDeck)?filteredDeck.length:0;}catch(_){}
    const detail=activeSummary?` · ${activeSummary.review} ${t.review} · ${activeSummary.fresh} ${t.fresh}`:'';
    return `🎯 ${t.focus} · ${Math.min(index,total||index)}/${total||0}${detail}`;
  }
  function updateFocusBar(){
    const bar=ensureFocusBar(); if(!document.body.classList.contains(FOCUS_CLASS)){bar.classList.add('hidden');return;}
    const t=ui();bar.classList.remove('hidden');bar.innerHTML=`<div class="font-extrabold min-w-0 truncate">${focusProgressText()}</div><button type="button" id="lfExitFocusBtn">× ${t.exit}</button>`;bar.querySelector('#lfExitFocusBtn')?.addEventListener('click',exitFocus);
  }
  function enterFocus(){injectFocusStyle();document.body.classList.add(FOCUS_CLASS);updateFocusBar();window.scrollTo({top:0,behavior:'smooth'});}
  function exitFocus(){document.body.classList.remove(FOCUS_CLASS);updateFocusBar();}

  function applyDeck(plan){
    try{filteredDeck=plan.deck.slice();activeStudyBatchIds=new Set(filteredDeck.map(c=>c.id));activeStudyCompletedIds=new Set();currentIndex=0;if(typeof renderCurrentCard==='function')renderCurrentCard();return true;}catch(err){console.warn('Smart Daily v2.2:',err);return false;}
  }
  function openSmartDaily(){
    const plan=buildPlan();
    if(!plan.deck.length){renderHomeCard();try{if(typeof showToast==='function')showToast(plan.goalsComplete?'Bạn đã hoàn thành mục tiêu học hôm nay.':'Hiện chưa có đủ thẻ phù hợp với mục tiêu còn lại.','🎯');}catch(_){}return;}
    activeSummary=plan;
    try{if(typeof switchTab==='function')switchTab('study');}catch(_){}
    const lang=document.getElementById('studyLangFilter');if(lang)lang.value=plan.language;
    const dueOnly=document.getElementById('studyDueOnly');if(dueOnly)dueOnly.checked=false;
    if(!applyDeck(plan))return;enterFocus();
    try{if(typeof window.lfSaveStudySession==='function')window.lfSaveStudySession();}catch(_){}
    try{if(typeof window.lfSaveStudyFilterPrefs==='function')window.lfSaveStudyFilterPrefs();}catch(_){}
  }

  function repairDailyBucket(cardId,bucket){
    if(!cardId||!bucket) return;
    try{
      const p=dailyProgress(), cfg=settings();
      const newIds=new Set(p.newIds||[]), reviewIds=new Set(p.reviewIds||[]);
      if(bucket==='review'){
        newIds.delete(cardId);
        const cap=limitValue(cfg.reviewLimit,30); if(reviewIds.has(cardId)||reviewIds.size<cap)reviewIds.add(cardId);
      }else{
        reviewIds.delete(cardId);
        const cap=limitValue(cfg.newLimit,20); if(newIds.has(cardId)||newIds.size<cap)newIds.add(cardId);
      }
      p.newIds=[...newIds];p.reviewIds=[...reviewIds];
      if(typeof saveDailyProgress==='function')saveDailyProgress(p); else try{localStorage.setItem('linguaflash_daily_progress_v1',JSON.stringify(p));}catch(_){}
      if(typeof updateDailyGoalSummary==='function')updateDailyGoalSummary();
      if(typeof refreshAppHome==='function')refreshAppHome();
    }catch(err){console.warn('Smart Daily daily bucket repair:',err);}
  }

  function patchRuntime(){
    const oldRender=window.renderCurrentCard;
    if(typeof oldRender==='function'&&!oldRender.__lfSmartDailyV22){const wrapped=function(...args){const result=oldRender.apply(this,args);setTimeout(updateFocusBar,0);setTimeout(renderHomeCard,0);return result;};wrapped.__lfSmartDailyV22=true;window.renderCurrentCard=wrapped;}

    const oldSwitch=window.switchTab;
    if(typeof oldSwitch==='function'&&!oldSwitch.__lfSmartDailyV22){const wrapped=function(...args){const result=oldSwitch.apply(this,args);if(args?.[0]!=='study'&&document.body.classList.contains(FOCUS_CLASS))exitFocus();if(args?.[0]==='home')setTimeout(renderHomeCard,0);return result;};wrapped.__lfSmartDailyV22=true;window.switchTab=wrapped;}

    const oldRate=window.rateCard;
    if(typeof oldRate==='function'&&!oldRate.__lfSmartDailyV22){
      const wrapped=function(quality,...args){
        let card=null,bucket=null;try{card=Array.isArray(filteredDeck)?filteredDeck[currentIndex]:null;bucket=activeSummary?.bucketById?.get(card?.id)||null;}catch(_){}
        const result=oldRate.call(this,quality,...args);
        if(card&&bucket&&Number(quality)!==0)repairDailyBucket(card.id,bucket);
        if(card&&bucket&&Number(quality)===0){try{if(typeof showToast==='function')showToast('Thẻ này sẽ xuất hiện lại trong phiên Học hôm nay.','🔄');}catch(_){}}
        setTimeout(renderHomeCard,0);return result;
      };
      wrapped.__lfSmartDailyV22=true;window.rateCard=wrapped;
    }
  }

  function init(){
    injectFocusStyle();ensureFocusBar();patchRuntime();renderHomeCard();
    ['studyLangFilter','studyCategoryFilter','studyTopicFilter','studyDueOnly'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>{activeSummary=null;if(document.body.classList.contains(FOCUS_CLASS))exitFocus();setTimeout(renderHomeCard,0);}));
    ['dailyNewLimit','dailyReviewLimit','dailyReviewMode'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(renderHomeCard,0)));
    window.addEventListener('storage',()=>setTimeout(renderHomeCard,50));
  }

  window.lfBuildSmartDailyV2=buildPlan;window.lfOpenSmartDailyV2=openSmartDaily;window.lfEnterFocusMode=enterFocus;window.lfExitFocusMode=exitFocus;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();