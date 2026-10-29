/* LinguaFlash · Class 158 Work & Communication v1
   Desktop add-on built from user's teacher summary.
   Focuses on new vocabulary, teacher corrections, weak points, IT dialogue and workplace grammar.
*/
(() => {
  'use strict';
  if (window.__LF51_CLASS158_WORK_V1__) return;
  window.__LF51_CLASS158_WORK_V1__ = true;

  const LESSON = {
    id:'work158',
    unit:'CLASS 158',
    title:'WORK & COMMUNICATION',
    subtitle:'Công việc · Phản xạ lớp học · Hội thoại IT · Các điểm giáo viên đã sửa',
    vocab:[
      ['excited','/ɪkˈsaɪtɪd/','Hào hứng, phấn khích, nôn nao','Dùng khi rất vui/hào hứng như birthday, payday, vacation. ⚠️ Cần phân biệt với comfortable.','thrilled, eager, enthusiastic'],
      ['comfortable','/ˈkʌmftəbl/','Thoải mái, dễ chịu, thư thái','Cảm giác bình yên, dễ chịu như at home / at ease. Không đồng nghĩa với excited.','at ease, relaxed, cozy'],
      ['uncertain','/ʌnˈsɜːtn/','Không chắc chắn, còn phân vân','uncertain = not sure = not certain. Cấu trúc cần nhớ: be uncertain about sth.','not sure, unsure, doubtful'],
      ['certain / sure','/ˈsɜːtn/ · /ʃʊə(r)/','Chắc chắn, nắm chắc','Trái nghĩa với uncertain. Dùng be certain of / about sth.','sure, definite'],
      ['responsible for','/rɪˈspɒnsəbl fɔː(r)/','Chịu trách nhiệm, phụ trách','⚠️ Điểm bạn bị nhầm: responsible là tính từ. Dùng be responsible for + N / V-ing.','in charge of, accountable for'],
      ['responsibility','/rɪˌspɒnsəˈbɪləti/','Trách nhiệm, nhiệm vụ chính','Danh từ. Mẫu: My/Your main responsibility is + V-ing / N.','duty, task'],
      ['provide','/prəˈvaɪd/','Cung cấp, mang lại, đưa ra','Cô Eva giải thích provide = give. Ví dụ: provide design; provide money for the family.','give, supply, offer'],
      ['furniture design','/ˈfɜːnɪtʃə dɪˈzaɪn/','Thiết kế nội thất / thiết kế đồ nội thất','Câu nghề nghiệp đã luyện: I am responsible for providing furniture design.','furniture designer = người thiết kế'],
      ['colleagues / coworkers','/ˈkɒliːɡz/ · /ˈkəʊwɜːkəz/','Đồng nghiệp','Dùng cho người làm cùng công ty / cùng nơi làm việc.','teammates, workmates'],
      ['new arrivals','/njuː əˈraɪvlz/','Những nhân viên mới tới','Xuất hiện trong hội thoại về khóa training cho nhân viên mới.','new employees, newcomers'],
      ['guide','/ɡaɪd/','Hướng dẫn, dìu dắt','guide + someone. Ví dụ: Wade is here to guide you in the first month.','help, coach'],
      ['arrive home','/əˈraɪv həʊm/','Về đến nhà','⚠️ Khác go home. arrive home nhấn thời điểm đã tới nhà; trước home không dùng to/at.','reach home'],
      ['work overtime','/wɜːk ˈəʊvətaɪm/','Làm thêm giờ, tăng ca','Dùng work overtime. Quá khứ: worked overtime.','work late'],
      ['have a meeting','/hæv ə ˈmiːtɪŋ/','Có một cuộc họp','Quá khứ: had a meeting. Cần phát âm meeting /ˈmiːtɪŋ/, không thành missing.','attend a meeting'],
      ['concern(s)','/kənˈsɜːn(z)/','Băn khoăn, mối quan tâm','Mẫu công sở: Should you have any questions or concerns...','question, worry'],
      ['go ahead','/ɡəʊ əˈhed/','Cứ hỏi đi / cứ tiếp tục đi','Dùng khi cho phép người khác bắt đầu nói hoặc làm điều gì.','please continue, sure']
    ],
    examples:[
      ['Yesterday + Past Simple','Yesterday, I had a meeting and worked overtime, so I arrived home at 9 p.m.','Hôm qua tôi có cuộc họp và phải tăng ca, nên tôi về đến nhà lúc 9 giờ tối.'],
      ['arrive home / motorbike','Today, I arrived home early at 4 p.m. I go home by motorbike and it takes 40 minutes.','Hôm nay tôi về nhà sớm lúc 4 giờ chiều. Tôi về bằng xe máy và mất khoảng 40 phút.'],
      ['nervous / worried',"I feel nervous (or worried) when there's a problem in my work.",'Tôi cảm thấy căng thẳng (hoặc lo lắng) khi có vấn đề phát sinh trong công việc của mình.'],
      ['certain / uncertain','I am not certain (= uncertain) of my answer.','Tôi không chắc chắn về câu trả lời của mình.'],
      ['responsible for','In my job, I am responsible for providing furniture design.','Trong công việc, tôi chịu trách nhiệm cung cấp các thiết kế nội thất.'],
      ['responsibilities','He is responsible for developing programs and providing technical support.','Anh ấy chịu trách nhiệm phát triển chương trình và cung cấp hỗ trợ kỹ thuật.'],
      ['It will take...','It will take a couple of weeks.','Sẽ mất một vài tuần.'],
      ['Classroom reflex',"I don't understand the word uncertain.",'Tôi không hiểu từ uncertain.'],
      ['Compare meanings','Are comfortable and excited the same?','Comfortable và excited có giống nhau không?'],
      ['Compare meanings','Do not sure and uncertain mean the same?','Not sure và uncertain có cùng nghĩa không?']
    ],
    dialogue:[
      ['Mr. Anthony','Good morning, Robert. I am Bruce Anthony, Manager of the IT Department. Welcome to join us.','Chào buổi sáng, Robert. Tôi là Bruce Anthony, Trưởng phòng CNTT. Chào mừng bạn gia nhập.'],
      ['Robert',"Nice to meet you, Mr. Anthony. I'm glad to be a member of this team.",'Rất vui được gặp ông, ông Anthony. Tôi rất vui khi trở thành một thành viên của nhóm.'],
      ['Mr. Anthony','Glad to have you here. Your main responsibility is developing programs. Besides that, you are also responsible for providing technical support for all the teams.','Rất vui khi có bạn ở đây. Trách nhiệm chính của bạn là phát triển chương trình. Ngoài ra, bạn cũng phụ trách hỗ trợ kỹ thuật cho tất cả các nhóm.'],
      ['Robert',"I got it. I'll do my best.",'Tôi hiểu rồi. Tôi sẽ cố gắng hết sức mình.'],
      ['Mr. Anthony','Also, we have Wade here to guide you in the first month. I will introduce you to him in a minute. Should you have any questions or concerns, please feel free to ask him or me.','Ngoài ra, chúng ta có Wade ở đây để hướng dẫn bạn trong tháng đầu tiên. Tôi sẽ giới thiệu bạn với anh ấy ngay. Nếu bạn có bất kỳ câu hỏi hay băn khoăn nào, cứ thoải mái hỏi anh ấy hoặc tôi.'],
      ['Robert',"That's very nice of you. Thank you, Mr. Anthony. May I ask a question?",'Ông thật tốt bụng. Cảm ơn ông Anthony. Tôi có thể hỏi một câu được không?'],
      ['Mr. Anthony','Sure, go ahead.','Chắc chắn rồi, bạn cứ hỏi đi.'],
      ['Robert','Is there training for new employees?','Có chương trình đào tạo cho nhân viên mới không ạ?'],
      ['Mr. Anthony',"Yes, we have a one-week training course for new arrivals. You'll meet new colleagues in that class. Do you have any other questions?",'Có chứ, chúng tôi có khóa đào tạo kéo dài một tuần cho người mới. Bạn sẽ gặp các đồng nghiệp mới trong lớp đó. Bạn còn câu hỏi nào khác không?'],
      ['Robert',"Not for the moment, I think. I'm ready to start working now.",'Hiện tại thì chưa ạ. Tôi đã sẵn sàng bắt đầu làm việc ngay bây giờ.'],
      ['Mr. Anthony','Good. I believe you will adapt to the team in a couple of weeks.','Tốt lắm. Tôi tin rằng bạn sẽ thích nghi với nhóm trong một vài tuần thôi.']
    ],
    grammar:[
      ['Responsible for vs. Responsibility','⚠️ Điểm cần ôn: responsible là tính từ, responsibility là danh từ. Mẫu phổ biến: S + am/is/are + responsible for + N / V-ing. Mẫu danh từ: My/Your main responsibility + is + V-ing / N.'],
      ['go home vs. arrive home','go home = đi về nhà; arrive home = về đến nhà. Trước home không dùng to/at. Ví dụ sửa trên lớp: I arrived home at 9 p.m.'],
      ['Yesterday → Past Simple','Khi kể việc hôm qua: have → had, work → worked, arrive → arrived, go → went. Câu cô Eva sửa: Yesterday, I had a meeting and worked overtime. I arrived home at 9 p.m.'],
      ['It takes time / It will take...','Dùng để nói thời gian cần cho một việc: It takes time for me to adapt to a new working environment. / It will take a couple of weeks.'],
      ['Should you have...','Mẫu đảo ngữ lịch sự nơi công sở: Should you have any questions... = If you have any questions...; thường đi với please feel free to ask...'],
      ['certain / uncertain + giới từ','Dùng be certain of/about sth; be uncertain about sth. Ví dụ của bạn: I am not certain of my answer.']
    ],
    speaking:[
      ['Teacher','What is your responsibility in your job, Mr. Harry?'],
      ['You','I am responsible for providing furniture design.'],
      ['Teacher','What happened yesterday?'],
      ['You','Yesterday, I had a meeting and worked overtime, so I arrived home at 9 p.m.'],
      ['Teacher','How do you feel when there is a problem in your work?'],
      ['You',"I feel nervous or worried when there's a problem in my work."],
      ['Teacher','What can you say when you do not understand a word?'],
      ['You',"I don't understand the word uncertain."],
      ['Teacher','How can you ask whether two words have the same meaning?'],
      ['You','Are comfortable and excited the same?']
    ],
    pronunciation:'role /rəʊl/ · clients /ˈklaɪənts/ · Europe /ˈjʊərəp/ · received /rɪˈsiːvd/ · aspect /ˈæspekt/ · States /steɪts/ · felt /felt/ · completely /kəmˈpliːtli/ · weeks /wiːks/ · meeting /ˈmiːtɪŋ/ · forty /ˈfɔːti/',
    contrasts:'excited ≠ comfortable · nervous ≈ worried · certain/sure ↔ uncertain/not sure'
  };

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
  let opened=false, backup='', tab='vocab', idx={vocab:0,examples:0,grammar:0,speaking:0,review:0}, reveal=false, showTranslation=true;
  const root=()=>document.getElementById('lf51DesktopWorkspace');
  const reviewItems=()=>LESSON.examples.map(x=>({type:'Câu sửa / thực hành',en:x[1],vi:x[2]})).concat(LESSON.vocab.map(x=>({type:'Từ/cụm cần ôn',en:x[0],vi:x[2],ipa:x[1]})));

  function ensureStyle(){if(document.getElementById('lf51w158Style'))return;const s=document.createElement('style');s.id='lf51w158Style';s.textContent=`
    #lf51DesktopWorkspace .lf51w158-open{border:1px solid rgba(255,255,255,.45);background:#fff;color:#0d4f93;border-radius:10px;padding:8px 11px;font-weight:900;cursor:pointer;white-space:nowrap}
    #lf51DesktopWorkspace .lf51w158-weak{margin-top:10px;padding:10px 12px;border:1px solid #fed7aa;background:#fff7ed;border-radius:12px;font-size:.8rem;line-height:1.55;color:#7c2d12}
    #lf51DesktopWorkspace .lf51w158-pron{margin-top:10px;padding:10px 12px;border:1px solid #c7d2fe;background:#eef2ff;border-radius:12px;font-size:.8rem;line-height:1.6;color:#3730a3}
    #lf51DesktopWorkspace .lf51w158-back{border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:8px 10px;font-weight:850;cursor:pointer}
  `;document.head.appendChild(s);}

  function speak(text,rate=1){if(!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;speechSynthesis.speak(u);}catch(_){}}
  function play(lines){if(!('speechSynthesis'in window))return;try{speechSynthesis.cancel();let i=0;const next=()=>{if(i>=lines.length)return;const u=new SpeechSynthesisUtterance(lines[i++]);u.lang='en-US';u.rate=.92;u.onend=next;speechSynthesis.speak(u)};next();}catch(_){}}

  function launchButton(){const r=root();if(!r||opened||!r.classList.contains('on'))return;if(r.querySelector('.lf51w158-open'))return;const top=r.querySelector('.lf51d-top');if(!top)return;const b=document.createElement('button');b.type='button';b.className='lf51w158-open';b.dataset.w158Open='1';b.textContent='⭐ Class 158 · Work';const badge=top.querySelector('.lf51d-badge');badge?top.insertBefore(b,badge):top.appendChild(b);}
  function saveBackup(){const r=root();if(!r)return;backup=r.innerHTML;}
  function close(){const r=root();if(!r)return;opened=false;r.dataset.w158='';r.innerHTML=backup;backup='';setTimeout(launchButton,0);}

  function head(title,count,i){return `<div class="lf51d-sectionhead"><h2>${esc(title)}</h2><div class="lf51d-count">${i+1} / ${count}</div></div>`;}
  function nav(type,count){return `<div class="lf51d-nav"><button class="lf51d-btn" data-w158-step="${type}:-1">← Trước</button><button class="lf51d-btn primary" data-w158-step="${type}:1">Tiếp →</button></div>`;}
  function renderVocab(){const v=LESSON.vocab[idx.vocab];const e=LESSON.examples.find(x=>norm(x[0]).includes(norm(v[0]).split('/')[0].trim()))||LESSON.examples[Math.min(idx.vocab,LESSON.examples.length-1)];return `${head('1. Từ mới & Điểm yếu cần ôn',LESSON.vocab.length,idx.vocab)}<div class="lf51d-body"><div class="lf51d-vocabhero"><div><div class="lf51d-word">${esc(v[0])}</div><div class="lf51d-ipa">${esc(v[1])}</div><div class="lf51d-meaning">${esc(v[2])}</div></div><button class="lf51d-listen" data-w158-audio="${esc(v[0])}">🔊</button></div><div class="lf51d-cards2"><div class="lf51d-info"><b>📖 Câu đã luyện / được sửa</b><div class="lf51d-example" style="margin-top:7px">${esc(e?.[1]||'')}</div><div class="lf51d-vi">${esc(e?.[2]||'')}</div></div><div class="lf51d-info"><b>💡 Cách dùng & điểm cần nhớ</b><div style="margin-top:7px">${esc(v[3])}</div><div style="margin-top:8px"><b>Đồng nghĩa / ghi chú:</b> ${esc(v[4]||'—')}</div></div></div><div class="lf51w158-weak"><b>⚠️ 3 cặp giáo viên nhấn mạnh:</b><br>${esc(LESSON.contrasts)}</div><div class="lf51w158-pron"><b>🎧 Phát âm cô Eva đã chỉnh:</b><br>${esc(LESSON.pronunciation)}</div></div>${nav('vocab',LESSON.vocab.length)}`;}
  function renderExamples(){const e=LESSON.examples[idx.examples];return `${head('2. Câu bạn đã làm chưa tốt & câu được sửa',LESSON.examples.length,idx.examples)}<div class="lf51d-body"><div class="lf51d-vocabhero"><div><div class="lf51d-key">${esc(e[0])}</div><div class="lf51d-example">${esc(e[1])}</div><div class="lf51d-vi">${esc(e[2])}</div></div><button class="lf51d-listen" data-w158-audio="${esc(e[1])}">🔊</button></div><div class="lf51d-cards2"><div class="lf51d-info"><b>✅ Cách học</b><div style="margin-top:7px">Nghe → che câu tiếng Anh → nói lại → chuyển sang Ôn nhanh để luyện VI → EN hoặc Listening.</div></div><div class="lf51d-info lf51d-toolbox"><b>✍️ Tự gõ lại</b><div class="lf51d-vi" style="font-style:normal;margin-top:6px">${esc(e[2])}</div><input id="lf51w158Input" placeholder="Nhập câu tiếng Anh..."><button class="lf51d-btn primary" style="margin-top:7px" data-w158-check="example">Kiểm tra</button><div id="lf51w158Result" class="lf51d-result"></div></div></div></div>${nav('examples',LESSON.examples.length)}`;}
  function renderDialogue(){return `<div class="lf51d-sectionhead"><h2>3. Hội thoại IT · Mr. Anthony & Robert</h2><div><button class="lf51d-btn soft" data-w158-translation>${showTranslation?'Ẩn bản dịch':'Hiện bản dịch'}</button> <button class="lf51d-btn primary" data-w158-play>▶ Nghe toàn bộ</button></div></div><div class="lf51d-body"><div class="lf51d-dialogue">${LESSON.dialogue.map((d,i)=>`<div class="lf51d-line"><div class="lf51d-speaker">${esc(d[0])}</div><div class="lf51d-bubble"><div class="lf51d-example" style="font-size:.9rem">${esc(d[1])}</div>${showTranslation?`<div class="lf51d-translation">${esc(d[2])}</div>`:''}</div><button class="lf51d-listen" style="width:38px;height:38px;font-size:.95rem" data-w158-audio="${esc(d[1])}">🔊</button></div>`).join('')}</div></div><div class="lf51d-nav"><span style="margin-right:auto;font-size:.76rem;color:#64748b">Hội thoại giữ nguyên nội dung bạn và giáo viên đã học.</span></div>`;}
  function renderGrammar(){const g=LESSON.grammar[idx.grammar];return `${head('4. Ngữ pháp · Các lỗi cần sửa',LESSON.grammar.length,idx.grammar)}<div class="lf51d-body"><div class="lf51d-grammarbox"><div class="lf51d-key">Điểm yếu ${idx.grammar+1}</div><h3>${esc(g[0])}</h3><p>${esc(g[1])}</p></div><div class="lf51d-info" style="margin-top:10px"><b>🎯 Mục tiêu:</b> Không chỉ nhận biết cấu trúc; hãy tự nói một câu về công việc của bạn bằng đúng mẫu này.</div></div>${nav('grammar',LESSON.grammar.length)}`;}
  function renderSpeaking(){const s=LESSON.speaking[idx.speaking];return `${head('5. Luyện phản xạ theo đúng buổi học',LESSON.speaking.length,idx.speaking)}<div class="lf51d-body"><div class="lf51d-speakrow"><div class="lf51d-role">${esc(s[0])}</div><div class="lf51d-speaktext">${esc(s[1])}</div><div style="margin-top:9px"><button class="lf51d-btn soft" data-w158-audio="${esc(s[1])}">🔊 Nghe mẫu</button></div></div><div class="lf51d-info"><b>Gợi ý học:</b> Với câu của “You”, hãy nói lại 3 lần mà không nhìn; với câu của “Teacher”, tự trả lời trước khi chuyển thẻ.</div></div>${nav('speaking',LESSON.speaking.length)}`;}
  function renderReview(){const items=reviewItems();idx.review=(idx.review+items.length)%items.length;const q=items[idx.review];return `<div class="lf51d-sectionhead"><h2>6. Ôn nhanh · Class 158</h2><div class="lf51d-count">${idx.review+1} / ${items.length}</div></div><div class="lf51d-body"><div class="lf51d-review"><div class="lf51d-reviewcard"><div class="lf51d-key">${esc(q.type)}</div><div class="lf51d-reviewq">${esc(q.en)}</div>${q.ipa?`<div class="lf51d-ipa">${esc(q.ipa)}</div>`:''}${reveal?`<div class="lf51d-reviewa">${esc(q.vi)}</div>`:''}<div style="margin-top:15px"><button class="lf51d-btn soft" data-w158-audio="${esc(q.en)}">🔊 Nghe</button> <button class="lf51d-btn primary" data-reveal>${reveal?'Ẩn đáp án':'Hiện đáp án'}</button></div></div></div></div>${nav('review',items.length)}`;}
  function main(){if(tab==='vocab')return renderVocab();if(tab==='examples')return renderExamples();if(tab==='dialogue')return renderDialogue();if(tab==='grammar')return renderGrammar();if(tab==='speaking')return renderSpeaking();return renderReview();}
  function coach(){return `<div class="lf51d-coachTitle">⭐ Class 158 Coach</div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">Trọng tâm yếu</div><div class="lf51d-pattern">responsible ↔ responsibility</div><div class="lf51d-pattern">go home ↔ arrive home</div><div class="lf51d-pattern">Yesterday → Past Simple</div><div class="lf51d-pattern">certain of/about · uncertain about</div><div class="lf51d-pattern">Should you have... = If you have...</div></div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">📝 Ghi chú học tập</div><textarea class="lf51d-note" id="lf51w158Note" placeholder="Ghi lại lỗi bạn vẫn còn hay mắc...">${esc(localStorage.getItem('lf51_work158_note')||'')}</textarea></div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">🎧 Phát âm cần ôn</div><div class="lf51d-pattern">${esc(LESSON.pronunciation)}</div></div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">Trạng thái</div><div class="lf51d-coachMain">Bài được tạo từ Class 158 · E-Teacher Eva & Harry Hiếu</div></div>`;}
  function render(){const r=root();if(!r)return;r.dataset.w158='1';const tabs=[['vocab','📚 Từ mới'],['examples','📝 Câu sửa lỗi'],['dialogue','💬 Hội thoại IT'],['grammar','📘 Điểm yếu'],['speaking','🗣️ Phản xạ'],['review','🧠 Ôn nhanh']];r.innerHTML=`<div class="lf51d-shell"><div class="lf51d-top"><button class="lf51w158-back" data-w158-close>← Trở lại</button><div class="lf51d-brand">${LESSON.unit} · ${LESSON.title}</div><select data-lesson-select style="display:none"><option value="work158" selected>work158</option></select><div class="lf51d-badge">Teacher corrections</div></div><div class="lf51d-tabs">${tabs.map(t=>`<button class="lf51d-tab ${tab===t[0]?'active':''}" data-tab="${t[0]}" data-w158-tab="${t[0]}">${t[1]}</button>`).join('')}</div><div class="lf51d-grid"><main class="lf51d-main">${main()}</main><aside class="lf51d-coach">${coach()}</aside></div><div class="lf51d-quickbar"><button class="lf51d-quick" data-tool="flash"><b>🗂️ EN → VI</b><span>Ôn nghĩa từ/câu</span></button><button class="lf51d-quick" data-tool="input"><b>⌨️ VI → EN</b><span>Tự gõ lại tiếng Anh</span></button><button class="lf51d-quick" data-tool="dictation"><b>🎧 Listening</b><span>Nghe và chép chính tả</span></button><button class="lf51d-quick" data-w158-weaklist><b>⚠️ Điểm yếu buổi 158</b><span>Ôn đúng lỗi giáo viên đã sửa</span></button></div></div>`;}

  function open(){const r=root();if(!r||opened)return;saveBackup();opened=true;tab='vocab';idx={vocab:0,examples:0,grammar:0,speaking:0,review:0};reveal=false;render();}
  function step(type,d){const n={vocab:LESSON.vocab.length,examples:LESSON.examples.length,grammar:LESSON.grammar.length,speaking:LESSON.speaking.length,review:reviewItems().length}[type];if(!n)return;idx[type]=(idx[type]+Number(d)+n)%n;reveal=false;render();}
  function checkExample(){const input=document.getElementById('lf51w158Input'),out=document.getElementById('lf51w158Result');if(!input||!out)return;const expected=LESSON.examples[idx.examples][1],ok=norm(input.value)===norm(expected);out.style.color=ok?'#15803d':'#b42318';out.textContent=ok?'✅ Chính xác.':`❌ Chưa đúng. Đáp án: ${expected}`;}

  function bind(){const r=root();if(!r||r.dataset.w158Bound)return;r.dataset.w158Bound='1';r.addEventListener('click',e=>{
    const openBtn=e.target.closest('[data-w158-open]');if(openBtn){e.preventDefault();e.stopPropagation();open();return;}
    if(!opened)return;
    const closeBtn=e.target.closest('[data-w158-close]');if(closeBtn){e.preventDefault();e.stopPropagation();close();return;}
    const tabBtn=e.target.closest('[data-w158-tab]');if(tabBtn){e.preventDefault();e.stopPropagation();tab=tabBtn.dataset.w158Tab;reveal=false;render();return;}
    const audio=e.target.closest('[data-w158-audio]');if(audio){e.preventDefault();e.stopPropagation();speak(audio.dataset.w158Audio);return;}
    const st=e.target.closest('[data-w158-step]');if(st){e.preventDefault();e.stopPropagation();const [t,d]=st.dataset.w158Step.split(':');step(t,d);return;}
    if(e.target.closest('[data-w158-translation]')){e.preventDefault();e.stopPropagation();showTranslation=!showTranslation;render();return;}
    if(e.target.closest('[data-w158-play]')){e.preventDefault();e.stopPropagation();play(LESSON.dialogue.map(x=>x[1]));return;}
    if(e.target.closest('[data-w158-check]')){e.preventDefault();e.stopPropagation();checkExample();return;}
    if(e.target.closest('[data-reveal]')){e.preventDefault();e.stopPropagation();reveal=!reveal;render();return;}
    if(e.target.closest('[data-w158-weaklist]')){e.preventDefault();e.stopPropagation();tab='grammar';idx.grammar=0;render();return;}
    const tool=e.target.closest('[data-tool]');if(tool){tab='review';render();e.preventDefault();e.stopPropagation();return;}
  },true);r.addEventListener('input',e=>{if(opened&&e.target.id==='lf51w158Note'){try{localStorage.setItem('lf51_work158_note',e.target.value);}catch(_){}}});}

  function init(){ensureStyle();bind();const r=root();if(!r)return;new MutationObserver(()=>{if(!opened)launchButton();}).observe(r,{childList:true,subtree:true});setTimeout(launchButton,250);setTimeout(launchButton,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();