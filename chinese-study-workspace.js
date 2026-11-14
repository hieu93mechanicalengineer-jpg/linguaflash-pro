/* Supply real Chinese lessons to the shared lesson workspace. */
(() => {
  const select=id=>document.getElementById(id);
  const han=s=>/[\u3400-\u9fff]/.test(s||'');
  let refLang='vi';
  try{const saved=localStorage.getItem('lf_zh_reference');if(['vi','en','both'].includes(saved))refLang=saved;}catch(_){}
  function translation(vi,en,language=refLang){
    vi=String(vi||'').trim();en=String(en||'').trim();
    if(!/[a-z]/i.test(en) || han(en))en='';
    if(language==='vi')return vi;
    if(language==='en')return en || 'Chưa có bản tiếng Anh';
    return [vi && 'VI: '+vi,en?'EN: '+en:'Chưa có bản tiếng Anh'].filter(Boolean).join(' · ');
  }
  let targetEnglish=false;
  try{targetEnglish=localStorage.getItem('lf_zh_target')==='en';}catch(_){}
  function courseSelected(){
    return ['Gia Hân','Tiếng Trung Huyền Anh'].includes(select('studyCategoryFilter')?.value);
  }
  function englishTarget(){
    return select('studyLangFilter')?.value==='Tiếng Anh' && courseSelected() || targetEnglish;
  }
  // Match a textbook lesson independently of its vocabulary/translation subsection.
  function matchesDialogue(d, category, topic){
    if(category!=='ALL' && d.course!==category)return false;
    if(topic==='ALL')return true;
    if(d.topic===topic || d.course===getCardCategory({topic}) && d.topic===parseCategoryAndTopic(topic).sub)return true;
    const requestedCourse=category==='ALL'?getCardCategory({topic}):category;
    if(requestedCourse!=='Gia Hân' || d.course!=='Gia Hân')return false;
    const identity=value=>String(value||'').match(/Trung cấp\s*(\d+)\s*[-–—]\s*Bài\s*(\d+)(?!\d)/i);
    const wanted=identity(topic), actual=identity(d.topic);
    return !!(wanted && actual && Number(wanted[1])===Number(actual[1]) && Number(wanted[2])===Number(actual[2]));
  }
  let cached, ref, size, scope, topics;
  function lesson(requestedTopic,reference=refLang){
    const category=select('studyCategoryFilter').value, topic=requestedTopic ?? select('studyTopicFilter').value;
    const english=englishTarget() && requestedTopic===undefined;
    const key=JSON.stringify([category,topic,reference,english]);
    if(ref===allCards && size===allCards.length && scope===key) return cached;
    ref=allCards;size=allCards.length;scope=key;
    const names=new Set(), vocab=[],examples=[],speaking=[],review=[],dialogue=[],grammar=[],phonetics=new Map(),seen=new Set();
    for(const card of allCards){
      if(category!=='ALL' && getCardCategory(card)!==category)continue;
      const zh=getCardTextInLanguage(card,'Tiếng Trung');
      if(!han(zh))continue;
      names.add(card.topic);
      if(topic!=='ALL' && card.topic!==topic)continue;
      const originalVi=getCardTextInLanguage(card,'Tiếng Việt');
      const en=card.meaningEn || card.english || getCardTextInLanguage(card,'Tiếng Anh');
      if(english && (!/[a-z]/i.test(en) || han(en)))continue;
      const word=english?en:zh;
      const vi=english?originalVi:translation(originalVi,en,reference), py=english?(card.ipaEn || card.englishIpa || ''):isTavDictionaryCard(card)?getTavChineseParts(card).pinyin:card.phonetic || '';
      if(py)phonetics.set(word,py);
      const sentence=card.cardType==='sentence';
      if(!sentence)vocab.push([word,py,vi,card.usage || '',card.related || '']);
      const ex=sentence?word:(english?card.exampleEn:card.example);
      if((english?ex && /[a-z]/i.test(ex) && !han(ex):han(ex)) && !seen.has(ex)){seen.add(ex);examples.push([word,ex,sentence?vi:(english?card.exampleTrans:translation(card.exampleTrans,card.exampleEn,reference))]);}
      speaking.push([card.topic,word]);
      if(originalVi || en)review.push({id:String(card.id),card,en:word,vi,ipa:py,type:sentence?'Câu mẫu':'Từ vựng',index:review.length});
    }
    topics=['ALL',...names].filter(Boolean);
    if(typeof DIALOGUES_DB!=='undefined')for(const d of Object.values(DIALOGUES_DB)){
      if(!String(d.language).startsWith('zh') || !matchesDialogue(d,category,topic))continue;
      for(const l of d.lines){if(english){if(l.en)dialogue.push([l.speaker,l.en,l.vn]);}else dialogue.push([l.speaker,l.cn,translation(l.vn,l.en,reference)]);if(l.pinyin)phonetics.set(l.cn,l.pinyin);}
    }
    if(typeof GIA_HAN_GRAMMAR_DB!=='undefined' && (category==='ALL'||category==='Gia Hân')){
      const number=topic.match(/Bài\s*(\d+)/i)?.[1];
      const items=topic==='ALL'?Object.values(GIA_HAN_GRAMMAR_DB).flat():/^Gia Hân/i.test(topic)?GIA_HAN_GRAMMAR_DB[number] || []:[];
      for(const x of items)if(english){if(x.en)grammar.push([x.en,x.vi||x.note||'']);}else grammar.push([x.cn || x.code || 'Ngữ pháp',[x.pinyin,translation(x.vi,x.en,reference),x.note].filter(Boolean).join(' · ')]);
    }
    cached={unit:category,id:'zh:'+JSON.stringify([category,topic,english]),title:topic==='ALL'?'Tất cả bài':topic,topic,vocab,examples,dialogue,grammar,speaking,review,phonetics};
    return cached;
  }
  window.lfChineseStudy={lesson,get active(){const lang=select('studyLangFilter')?.value;return lang==='Tiếng Trung' || lang==='Tiếng Anh' && courseSelected();},get targetEnglish(){return englishTarget();},toggleTarget(){targetEnglish=!englishTarget();if(select('studyLangFilter')?.value==='Tiếng Anh' && courseSelected()){select('studyLangFilter').value='Tiếng Trung';select('studyLangFilter').dispatchEvent(new Event('change',{bubbles:true}));}try{localStorage.setItem("lf_zh_target",targetEnglish?"en":"zh");}catch(_){}window.lfSharedStudySync?.();},get reference(){return refLang;},get refCode(){if(englishTarget())return 'VI';return {vi:'VI',en:'EN',both:'VI/EN'}[refLang];},get refLabel(){if(englishTarget())return 'tiếng Việt';return {vi:'tiếng Việt',en:'tiếng Anh',both:'tiếng Việt và tiếng Anh'}[refLang];},setReference(value){
      if(!['vi','en','both'].includes(value))return;
      targetEnglish=false;refLang=value;try{localStorage.setItem("lf_zh_target","zh");localStorage.setItem('lf_zh_reference',value);}catch(_){}
      window.lfSharedStudySync?.();
    },topics(){lesson();return topics;},
    sync(){window.lfSharedStudySync?.();},openReview(){window.lfSharedStudyReview?.();}};
})();

