/* LinguaFlash · 51Talk Mobile Lesson Mode v63
   Source: user's 6-page English summary PDF.
   Mobile-only. Isolated from legacy flashcard/touch handlers.
*/
(() => {
  'use strict';
  if (window.__LF51_MOBILE_LESSON_V63__) return;
  window.__LF51_MOBILE_LESSON_V63__ = true;

  const V = [
    ['look well','[lʊk wel]','Trông khỏe mạnh, thần sắc tốt',"S + look(s) / don't look + well. Khi nói về sức khỏe, well là tính từ.",'look healthy, look fine, be in good shape','PDF'],
    ['headache',"['hedeɪk]",'Cơn đau đầu, chứng nhức đầu','Dùng với mạo từ a: have a headache / have a terrible headache.','head pain, migraine','PDF'],
    ['umbrella',"[ʌm'brelə]",'Cái ô, cái dù che mưa','Dùng an umbrella; bring/take an umbrella with you.','rain shade, parasol','PDF'],
    ['catch a cold','[kætʃ ə kəʊld]','Bị cảm lạnh','Quá khứ: catch → caught a cold.','get a cold, come down with a cold','PDF'],
    ['take care of','[teɪk keə(r) əv]','Chăm sóc, trông nom','take care of + tân ngữ / đại từ phản thân.','look after, care for','PDF'],
    ['not feeling well / ill',"[nɒt 'fiːlɪŋ wel] / [ɪl]",'Cảm thấy không khỏe / bị ốm',"not feeling well = don't feel very good = be ill/sick.",'sick, unwell, under the weather','PDF'],
    ['have a (good) rest','[hæv ə ɡʊd rest]','Nghỉ ngơi','need to have a good rest / need some rest.','get some rest, take a break, relax','PDF'],
    ['take some medicine',"[teɪk sʌm 'medɪsn]",'Uống thuốc','Dùng take với medicine; không dùng drink/eat.','take pills, take medication','PDF'],
    ['go to the hospital',"[ɡəʊ tuː ðə 'hɒspɪtl]",'Đi bệnh viện, đi khám','Đối lập trong Warm-up với stay at home.','see a doctor, visit a clinic','PDF'],
    ['heavy rain / get wet',"['hevi reɪn] / [ɡet wet]",'Mưa to / bị ướt','The rain was really heavy; I got all wet.','downpour / get soaked','PDF'],
    ['technical support',"['teknɪk(ə)l sə'pɔː(r)t]",'Hỗ trợ kỹ thuật','provide / offer technical support for/to clients.','tech support, IT support','Trên lớp'],
    ['training',"['treɪnɪŋ]",'Sự đào tạo, huấn luyện','receive training in + lĩnh vực.','coaching, instruction','Trên lớp'],
    ['employee',"[ɪm'plɔɪiː]",'Nhân viên','an employee of + tên công ty. Phân biệt employer.','worker, staff member','Trên lớp'],
    ['adapt to',"[ə'dæpt tu]",'Thích nghi, làm quen với','adapt to + danh từ / V-ing.','adjust to, get used to','Trên lớp'],
    ['a couple of',"[ə 'kʌp(ə)l əv]",'Hai / một vài','a couple of + danh từ số nhiều.','a few, two or three','Trên lớp'],
    ['feel nervous / worried',"[fiːl 'nɜː(r)vəs] / ['wɜːrid]",'Cảm thấy lo lắng, hồi hộp','I feel nervous. You can also say I feel worried.','anxious, uneasy','Trên lớp']
  ];

  const E = [
    ['look well',"You don't look well. What happened?",'Trông bạn không được khỏe. Đã có chuyện gì xảy ra vậy?','/ju doʊnt lʊk wel | wʌt ˈhæpənd/','PDF'],
    ['headache','Jenny is not feeling well because she has a headache.','Jenny cảm thấy không khỏe vì cô ấy bị đau đầu.','/ˈdʒeni ɪz nɑːt ˈfiːlɪŋ wel bɪˈkɔːz ʃi hæz ə ˈhedeɪk/','PDF'],
    ['umbrella','It is raining outside. Remember to bring an umbrella.','Bên ngoài trời đang mưa. Hãy nhớ mang theo một chiếc ô.','/ɪt ɪz ˈreɪnɪŋ ˌaʊtˈsaɪd | rɪˈmembər tə brɪŋ ən ʌmˈbrelə/','PDF'],
    ['catch a cold','Daisy caught a cold yesterday. She needs some rest.','Hôm qua Daisy bị cảm lạnh. Cô ấy cần nghỉ ngơi một chút.','/ˈdeɪzi kɔːt ə koʊld ˈjestərdeɪ | ʃi niːdz sʌm rest/','PDF'],
    ['take care of',"Lucy's husband is ill and she is taking care of him.",'Chồng của Lucy bị ốm và cô ấy đang chăm sóc anh ấy.','/ˈluːsiz ˈhʌzbənd ɪz ɪl ænd ʃi ɪz ˈteɪkɪŋ ker əv hɪm/','PDF'],
    ['technical support',"Mr. Smith's role is to provide technical support for the clients all over Europe.",'Vai trò của ông Smith là cung cấp hỗ trợ kỹ thuật cho khách hàng trên khắp châu Âu.','/ˌmɪstər ˈsmɪθs roʊl ɪz tə prəˈvaɪd ˈteknɪkəl səˈpɔːrt fər ðə ˈklaɪənts ɔːl ˈoʊvər ˈjʊrəp/','Trên lớp'],
    ['training','On the course we received training in every aspect of the job.','Trong khóa học, chúng tôi được đào tạo về mọi khía cạnh của công việc.','/ɑːn ðə kɔːrs wi rɪˈsiːvd ˈtreɪnɪŋ ɪn ˈevri ˈæspekt əv ðə dʒɑːb/','Trên lớp'],
    ['employee','Linda is an employee of Citibank in the States.','Linda là nhân viên của Citibank tại Hoa Kỳ.','/ˈlɪndə ɪz ən ɪmˈplɔɪiː əv ˈsɪtibæŋk ɪn ðə steɪts/','Trên lớp'],
    ['adapt to','It takes time for me to adapt to a new working environment.','Tôi cần thời gian để thích nghi với một môi trường làm việc mới.','/ɪt teɪks taɪm fər mi tə əˈdæpt tə ə nuː ˈwɜːrkɪŋ ɪnˈvaɪrənmənt/','Trên lớp'],
    ['a couple of','A couple of months after I moved to London, I felt completely at home there.','Một vài tháng sau khi chuyển đến London, tôi cảm thấy hoàn toàn quen thuộc như ở nhà.','/ə ˈkʌpəl əv mʌnθs ˈæftər aɪ muːvd tə ˈlʌndən | aɪ felt kəmˈpliːtli æt hoʊm ðer/','Trên lớp']
  ];

  const D = [
    ['Lily',"Hi, Joe! Are you okay? You don't look well.",'Chào Joe! Bạn ổn chứ? Trông bạn không khỏe.'],
    ['Joe',"I don't feel very good. I have a terrible headache.",'Tôi cảm thấy không khỏe lắm. Tôi bị đau đầu dữ dội.'],
    ['Lily',"I'm sorry to hear that. What happened?",'Rất tiếc khi nghe điều đó. Có chuyện gì xảy ra vậy?'],
    ['Joe','I went out with my friends last night and it started to rain on my way home.','Tối qua tôi đi chơi với bạn và trời bắt đầu mưa trên đường về nhà.'],
    ['Lily',"That's unlucky. Did you take an umbrella with you?",'Thật không may. Bạn có mang theo ô không?'],
    ['Joe','No. I got all wet. The rain was really heavy.','Không. Tôi bị ướt sũng. Mưa thực sự rất to.'],
    ['Lily',"That is not good. It's easy to catch a cold when you are wet.",'Thế thì không ổn. Rất dễ bị cảm lạnh khi người bị ướt.'],
    ['Joe','Well, maybe I need to have a good rest tonight.','Có lẽ tối nay tôi cần nghỉ ngơi thật tốt.'],
    ['Lily','Also, drinking more water may make you feel better.','Uống thêm nước có thể giúp bạn cảm thấy khỏe hơn.'],
    ['Joe','Thank you. I will take care of myself.','Cảm ơn. Tôi sẽ tự chăm sóc bản thân.']
  ];

  const G = [
    ['1. Well và good sau động từ nối','Khi nói về sức khỏe, well có thể là tính từ sau look, feel, be. “You don’t look well.” / “Jenny is not feeling well.” / “I don’t feel very good.”'],
    ['2. Chủ ngữ giả It','It is + adjective + (for sb) + to V. It takes + time + for sb + to V. Ví dụ: It’s easy to catch a cold... / It takes time for me to adapt...'],
    ['3. V-ing làm chủ ngữ & make + O + V','Động từ làm chủ ngữ dùng V-ing. Sau make + tân ngữ dùng V nguyên mẫu không “to”: Drinking more water may make you feel better.'],
    ['4. Đại từ phản thân & cụm cố định','I → myself, you → yourself, he → himself, she → herself. Ghi nhớ on my way home (không dùng to home) và get all wet.'],
    ['5. Quá khứ đơn','Kể việc đã qua dùng V2/ed: went, started, got, was, caught, felt. Câu hỏi: Did + S + V nguyên mẫu: Did you take...?'],
    ['6. Mẫu câu luyện nói','Hai mẫu trọng tâm: “I have a...” và “Maybe I need to...”. Dùng cùng từ của bài để kể một tình huống sức khỏe.']
  ];

  const S = [
    ['Teacher','Hi! When was the last time you caught a cold?'],
    ['You','It was a couple of months ago. I went out in the heavy rain without an umbrella and got all wet.'],
    ['Teacher','Oh no! How did you feel and what did you do?'],
    ['You',"I didn't feel well and I had a terrible headache. I went to the hospital, took some medicine, and stayed at home to have a good rest."]
  ];

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  let tab='vocab', ri=0, reveal=false, direction='en-vi';
  const review=E.map(x=>({type:'Câu mẫu',en:x[1],vi:x[2],ipa:x[3]})).concat(V.map(x=>({type:'Từ vựng',en:x[0],vi:x[2],ipa:x[1]})));

  function mobile(){return matchMedia('(max-width:760px)').matches;}
  function active(){
    if(!mobile()) return false;
    const lang=document.getElementById('studyLangFilter')?.value||'';
    if(lang!=='Tiếng Anh') return false;
    const cat=document.getElementById('studyCategoryFilter')?.value||'';
    const topic=document.getElementById('studyTopicFilter')?.value||'';
    let card=null; try{card=Array.isArray(filteredDeck)&&filteredDeck.length?filteredDeck[currentIndex]:null;}catch(_){}
    return /51Talk/i.test(cat)||/51Talk/i.test(topic)||String(card?.id||'').startsWith('en51_')||card?.category==='51Talk English';
  }
  function speak(text){
    if(!text)return;
    try{if(typeof window.lfSpeak51TalkEnglish==='function'){window.lfSpeak51TalkEnglish(text);return;}}catch(_){}
    if(!('speechSynthesis'in window))return; try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.9;speechSynthesis.speak(u);}catch(_){}
  }
  function style(){if(document.getElementById('lf51mStyleV63'))return;const s=document.createElement('style');s.id='lf51mStyleV63';s.textContent=`
    #lf51MobileLesson{display:none;width:min(100%,800px);margin:0 auto 18px;background:#f8fafc;color:#0f172a}#lf51MobileLesson.on{display:block}.lf51m-hero{background:#173b74;color:#fff;border-radius:20px;padding:16px}.lf51m-k{font-size:.68rem;font-weight:900;color:#fde68a}.lf51m-title{font-size:1.2rem;font-weight:950;margin-top:4px}.lf51m-sub{font-size:.78rem;color:#dbeafe;margin-top:4px;line-height:1.4}.lf51m-stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.lf51m-stats span{background:#0f2e5c;border-radius:8px;padding:5px 7px;font-size:.68rem;font-weight:800}.lf51m-tabs{display:flex;gap:7px;overflow:auto;padding:10px 2px 8px;scrollbar-width:none}.lf51m-tab{flex:0 0 auto;min-height:43px;border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:8px 10px;font-size:.78rem;font-weight:900;color:#475569}.lf51m-tab.on{background:#173b74;color:#fff;border-color:#173b74}.lf51m-list{display:grid;gap:8px}.lf51m-card{background:#fff;border:1px solid #dbe3ef;border-radius:15px;padding:11px;box-shadow:0 3px 12px rgba(15,23,42,.035)}details.lf51m-card summary{list-style:none;cursor:pointer}.lf51m-row{display:flex;gap:8px;justify-content:space-between;align-items:flex-start}.lf51m-term,.lf51m-en{font-weight:900;line-height:1.45}.lf51m-ipa{font-size:.77rem;color:#6366f1;margin-top:3px}.lf51m-vi,.lf51m-extra{font-size:.8rem;line-height:1.5;color:#475569;margin-top:4px}.lf51m-badge{font-size:.62rem;font-weight:900;border-radius:999px;padding:3px 6px;background:#e0f2fe;color:#075985}.lf51m-badge.class{background:#ffedd5;color:#9a3412}.lf51m-audio{flex:0 0 42px;width:42px;height:42px;border:0;border-radius:999px;background:#eef2ff;font-size:1rem}.lf51m-bubble{max-width:92%;background:#eff6ff;border:1px solid #bfdbfe;border-radius:15px;padding:10px}.lf51m-bubble.joe{margin-left:auto;background:#fff7ed;border-color:#fed7aa}.lf51m-speaker{font-size:.68rem;font-weight:950;color:#0369a1}.lf51m-bubble.joe .lf51m-speaker{color:#c2410c}.lf51m-note{background:#fffbea;border:1px solid #fde68a;border-radius:14px;padding:10px;font-size:.8rem;line-height:1.5;color:#78350f}.lf51m-actions{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px}.lf51m-btn{min-height:43px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:8px 11px;font-weight:900}.lf51m-btn.primary{background:#173b74;color:#fff;border-color:#173b74}.lf51m-review{text-align:center;min-height:240px;display:flex;flex-direction:column;justify-content:center}.lf51m-rmain{font-size:1.25rem;font-weight:950;line-height:1.5}.lf51m-rans{margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0}.lf51m-rnav{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:7px;margin-top:8px}.lf51m-rnav button{min-height:46px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;font-weight:900}.lf51m-rnav button:nth-child(2){background:#173b74;color:#fff;border-color:#173b74}
    body.lf51-mobile-active #flashcardContainer,body.lf51-mobile-active #studyAnswerPanel,body.lf51-mobile-active #lf51CoachShell,body.lf51-mobile-active #lf51GrammarPanel,body.lf51-mobile-active #lf51PatternPractice,body.lf51-mobile-active #lf51Listening{display:none!important}body.lf51-mobile-active{padding-bottom:100px!important}@media(min-width:761px){#lf51MobileLesson{display:none!important}}
  `;document.head.appendChild(s);}
  function root(){let r=document.getElementById('lf51MobileLesson');if(r)return r;const f=document.getElementById('flashcardContainer');if(!f)return null;r=document.createElement('section');r.id='lf51MobileLesson';r.innerHTML=`<div class="lf51m-hero"><div class="lf51m-k">51TALK CLASSIC ENGLISH · LEVEL 4</div><div class="lf51m-title">Tiếng Anh · Tổng hợp bài học</div><div class="lf51m-sub">Sức khỏe “I have a headache” + Công việc trên lớp · bám theo bản tổng hợp 6 trang của bạn.</div><div class="lf51m-stats"><span>16 từ / cụm</span><span>10 câu ví dụ</span><span>1 hội thoại & bài tập</span><span>6 chủ điểm ngữ pháp</span></div></div><div class="lf51m-tabs"></div><div class="lf51m-content"></div>`;f.insertAdjacentElement('beforebegin',r);return r;}
  const badge=src=>`<span class="lf51m-badge ${src==='Trên lớp'?'class':''}">${esc(src)}</span>`;
  function tabs(r){const T=[['vocab','📚 Từ vựng'],['examples','📝 Câu mẫu'],['dialogue','💬 Hội thoại'],['grammar','📘 Ngữ pháp'],['speaking','🗣️ Luyện nói'],['review','🧠 Ôn nhanh']];r.querySelector('.lf51m-tabs').innerHTML=T.map(x=>`<button class="lf51m-tab ${tab===x[0]?'on':''}" data-tab="${x[0]}">${x[1]}</button>`).join('');}
  function rv(){return `<div class="lf51m-list">${V.map((x,i)=>`<details class="lf51m-card" ${i<2?'open':''}><summary><div class="lf51m-row"><div>${badge(x[5])}<div class="lf51m-term">${esc(x[0])}</div><div class="lf51m-ipa">${esc(x[1])}</div><div class="lf51m-vi">${esc(x[2])}</div></div><button class="lf51m-audio" data-audio="${esc(x[0])}" type="button">🔊</button></div></summary><div class="lf51m-extra"><b>Cách dùng:</b> ${esc(x[3])}<br><b>Đồng nghĩa:</b> ${esc(x[4])}</div></details>`).join('')}</div>`;}
  function re(){return `<div class="lf51m-list">${E.map(x=>`<div class="lf51m-card"><div class="lf51m-row"><div>${badge(x[4])}<div class="lf51m-term" style="color:#c2410c">${esc(x[0])}</div><div class="lf51m-en">${esc(x[1])}</div><div class="lf51m-ipa">${esc(x[3])}</div><div class="lf51m-vi">${esc(x[2])}</div></div><button class="lf51m-audio" data-audio="${esc(x[1])}" type="button">🔊</button></div></div>`).join('')}<div class="lf51m-note"><b>Cụm cần thuộc:</b> provide support for sb · receive training in sth · an employee of + công ty · remember to V · feel completely at home.</div></div>`;}
  function rd(){return `<div class="lf51m-actions"><button class="lf51m-btn primary" data-dialogue type="button">▶ Nghe toàn hội thoại</button></div><div class="lf51m-list">${D.map(x=>`<div class="lf51m-bubble ${x[0]==='Joe'?'joe':''}"><div class="lf51m-row"><div><div class="lf51m-speaker">${x[0]}</div><div class="lf51m-en">${esc(x[1])}</div><div class="lf51m-vi">${esc(x[2])}</div></div><button class="lf51m-audio" data-audio="${esc(x[1])}" type="button">🔊</button></div></div>`).join('')}</div><details class="lf51m-card" style="margin-top:9px"><summary class="lf51m-term">✅ Đáp án bài tập</summary><div class="lf51m-extra">• Joe will take care of himself.<br>• Joe will have a good rest tonight.<br>• Joe will drink more water.<br>• He doesn’t look well because he has a terrible headache.<br>• Getting wet in the heavy rain can make Joe catch a cold.<br>• headache → umbrella → catch a cold → take care of.</div></details>`;}
  function rg(){return `<div class="lf51m-list">${G.map((x,i)=>`<details class="lf51m-card" ${i===0?'open':''}><summary class="lf51m-term">${esc(x[0])}</summary><div class="lf51m-extra">${esc(x[1])}</div></details>`).join('')}</div>`;}
  function rs(){return `<div class="lf51m-note"><b>Mục tiêu:</b> dùng “I have a...” và “Maybe I need to...” để kể tình huống sức khỏe.</div><div class="lf51m-list" style="margin-top:9px">${S.map(x=>`<div class="lf51m-bubble ${x[0]==='You'?'joe':''}"><div class="lf51m-row"><div><div class="lf51m-speaker">${x[0]}</div><div class="lf51m-en">${esc(x[1])}</div></div><button class="lf51m-audio" data-audio="${esc(x[1])}" type="button">🔊</button></div></div>`).join('')}</div>`;}
  function rr(){const x=review[ri%review.length],front=direction==='en-vi'?x.en:x.vi,ans=direction==='en-vi'?x.vi:x.en;return `<div class="lf51m-actions"><button class="lf51m-btn" data-dir type="button">${direction==='en-vi'?'Anh → Việt':'Việt → Anh'}</button><button class="lf51m-btn" data-audio="${esc(x.en)}" type="button">🔊 Nghe</button></div><div class="lf51m-card lf51m-review"><div style="font-size:.7rem;font-weight:900;color:#64748b">${x.type} · ${ri+1}/${review.length}</div><div class="lf51m-rmain">${esc(front)}</div><div class="lf51m-rans">${reveal?`${esc(ans)}<div class="lf51m-ipa">${esc(x.ipa||'')}</div>`:'<span style="color:#94a3b8">Bấm Lật để xem đáp án</span>'}</div></div><div class="lf51m-rnav"><button data-prev>← Trước</button><button data-reveal>${reveal?'Ẩn':'Lật'}</button><button data-next>Tiếp →</button></div>`;}
  function render(){const r=root();if(!r)return;tabs(r);r.querySelector('.lf51m-content').innerHTML=tab==='vocab'?rv():tab==='examples'?re():tab==='dialogue'?rd():tab==='grammar'?rg():tab==='speaking'?rs():rr();}
  function sync(){const r=root();if(!r)return;const on=active();r.classList.toggle('on',on);document.body.classList.toggle('lf51-mobile-active',on);if(on)render();}
  function allDialogue(){if(!('speechSynthesis'in window)){speak(D.map(x=>x[1]).join(' '));return;}try{speechSynthesis.cancel();let i=0;const next=()=>{if(i>=D.length)return;const u=new SpeechSynthesisUtterance(D[i++][1]);u.lang='en-US';u.rate=.9;u.onend=()=>setTimeout(next,250);speechSynthesis.speak(u);};next();}catch(_){}}
  function bind(){const r=root();if(!r||r.dataset.bound)return;r.dataset.bound='1';r.addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;render();return;}const a=e.target.closest('[data-audio]');if(a){speak(a.dataset.audio);return;}if(e.target.closest('[data-dialogue]')){allDialogue();return;}if(e.target.closest('[data-prev]')){ri=(ri-1+review.length)%review.length;reveal=false;render();return;}if(e.target.closest('[data-next]')){ri=(ri+1)%review.length;reveal=false;render();return;}if(e.target.closest('[data-reveal]')){reveal=!reveal;render();return;}if(e.target.closest('[data-dir]')){direction=direction==='en-vi'?'vi-en':'en-vi';reveal=false;render();}});}
  function init(){style();root();bind();['studyLangFilter','studyCategoryFilter','studyTopicFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(sync,0)));addEventListener('resize',()=>setTimeout(sync,0),{passive:true});setTimeout(sync,150);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();