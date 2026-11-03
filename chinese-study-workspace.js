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
  let cached, ref, size, scope, topics;
  function lesson(requestedTopic,reference=refLang){
    const category=select('studyCategoryFilter').value, topic=requestedTopic ?? select('studyTopicFilter').value;
    const key=JSON.stringify([category,topic,reference]);
    if(ref===allCards && size===allCards.length && scope===key) return cached;
    ref=allCards;size=allCards.length;scope=key;
    const names=new Set(), vocab=[],examples=[],speaking=[],review=[],dialogue=[],grammar=[],phonetics=new Map(),seen=new Set();
    for(const card of allCards){
      if(category!=='ALL' && getCardCategory(card)!==category)continue;
      const word=getCardTextInLanguage(card,'Tiếng Trung');
      if(!han(word))continue;
      names.add(card.topic);
      if(topic!=='ALL' && card.topic!==topic)continue;
      const originalVi=getCardTextInLanguage(card,'Tiếng Việt');
      const en=card.meaningEn || card.english || getCardTextInLanguage(card,'Tiếng Anh');
      const vi=translation(originalVi,en,reference), py=isTavDictionaryCard(card)?getTavChineseParts(card).pinyin:card.phonetic || '';
      if(py)phonetics.set(word,py);
      const sentence=card.cardType==='sentence';
      if(!sentence)vocab.push([word,py,vi,card.usage || '',card.related || '']);
      const ex=sentence?word:card.example;
      if(han(ex) && !seen.has(ex)){seen.add(ex);examples.push([word,ex,sentence?vi:translation(card.exampleTrans,card.exampleEn,reference)]);}
      speaking.push([card.topic,word]);
      if(originalVi || en)review.push({id:String(card.id),card,en:word,vi,ipa:py,type:sentence?'Câu mẫu':'Từ vựng',index:review.length});
    }
    topics=['ALL',...names].filter(Boolean);
    if(typeof DIALOGUES_DB!=='undefined')for(const d of Object.values(DIALOGUES_DB)){
      if(!String(d.language).startsWith('zh') || category!=='ALL' && d.course!==category)continue;
      if(topic!=='ALL' && !(d.topic===topic || d.course===getCardCategory({topic}) && d.topic===parseCategoryAndTopic(topic).sub))continue;
      for(const l of d.lines){dialogue.push([l.speaker,l.cn,translation(l.vn,l.en,reference)]);if(l.pinyin)phonetics.set(l.cn,l.pinyin);}
    }
    if(typeof GIA_HAN_GRAMMAR_DB!=='undefined' && (category==='ALL'||category==='Gia Hân')){
      const number=topic.match(/Bài\s*(\d+)/i)?.[1];
      const items=topic==='ALL'?Object.values(GIA_HAN_GRAMMAR_DB).flat():/^Gia Hân/i.test(topic)?GIA_HAN_GRAMMAR_DB[number] || []:[];
      for(const x of items)grammar.push([x.cn || x.code || 'Ngữ pháp',[x.pinyin,translation(x.vi,x.en,reference),x.note].filter(Boolean).join(' · ')]);
    }
    cached={unit:'中文',id:'zh:'+JSON.stringify([category,topic]),title:topic==='ALL'?'Tất cả bài':topic,topic,vocab,examples,dialogue,grammar,speaking,review,phonetics};
    return cached;
  }
  window.lfChineseStudy={lesson,get reference(){return refLang;},get refCode(){return {vi:'VI',en:'EN',both:'VI/EN'}[refLang];},get refLabel(){return {vi:'tiếng Việt',en:'tiếng Anh',both:'tiếng Việt và tiếng Anh'}[refLang];},setReference(value){
      if(!['vi','en','both'].includes(value))return;
      refLang=value;try{localStorage.setItem('lf_zh_reference',value);}catch(_){}
      window.lfSharedStudySync?.();
    },topics(){lesson();return topics;},
    sync(){window.lfSharedStudySync?.();},openReview(){window.lfSharedStudyReview?.();}};
})();