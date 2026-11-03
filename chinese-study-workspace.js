/* Supply real Chinese lessons to the shared lesson workspace. */
(() => {
  const select=id=>document.getElementById(id);
  const han=s=>/[\u3400-\u9fff]/.test(s||'');
  let cached, ref, size, scope, topics;
  function lesson(requestedTopic){
    const category=select('studyCategoryFilter').value, topic=requestedTopic ?? select('studyTopicFilter').value;
    const key=JSON.stringify([category,topic]);
    if(ref===allCards && size===allCards.length && scope===key) return cached;
    ref=allCards;size=allCards.length;scope=key;
    const names=new Set(), vocab=[],examples=[],speaking=[],review=[],dialogue=[],grammar=[],phonetics=new Map(),seen=new Set();
    for(const card of allCards){
      if(category!=='ALL' && getCardCategory(card)!==category)continue;
      const word=getCardTextInLanguage(card,'Tiếng Trung');
      if(!han(word))continue;
      names.add(card.topic);
      if(topic!=='ALL' && card.topic!==topic)continue;
      const vi=getCardTextInLanguage(card,'Tiếng Việt'), py=isTavDictionaryCard(card)?getTavChineseParts(card).pinyin:card.phonetic || '';
      if(py)phonetics.set(word,py);
      const sentence=card.cardType==='sentence';
      if(!sentence)vocab.push([word,py,vi,card.usage || '',card.related || '']);
      const ex=sentence?word:card.example;
      if(han(ex) && !seen.has(ex)){seen.add(ex);examples.push([word,ex,sentence?vi:card.exampleTrans || '']);}
      speaking.push([card.topic,word]);
      if(vi)review.push({id:String(card.id),card,en:word,vi,ipa:py,type:sentence?'Câu mẫu':'Từ vựng',index:review.length});
    }
    topics=['ALL',...names].filter(Boolean);
    if(typeof DIALOGUES_DB!=='undefined')for(const d of Object.values(DIALOGUES_DB)){
      if(!String(d.language).startsWith('zh') || category!=='ALL' && d.course!==category)continue;
      if(topic!=='ALL' && !(d.topic===topic || d.course===getCardCategory({topic}) && d.topic===parseCategoryAndTopic(topic).sub))continue;
      for(const l of d.lines){dialogue.push([l.speaker,l.cn,l.vn]);if(l.pinyin)phonetics.set(l.cn,l.pinyin);}
    }
    if(typeof GIA_HAN_GRAMMAR_DB!=='undefined' && (category==='ALL'||category==='Gia Hân')){
      const number=topic.match(/Bài\s*(\d+)/i)?.[1];
      const items=topic==='ALL'?Object.values(GIA_HAN_GRAMMAR_DB).flat():/^Gia Hân/i.test(topic)?GIA_HAN_GRAMMAR_DB[number] || []:[];
      for(const x of items)grammar.push([x.cn || x.code || 'Ngữ pháp',[x.pinyin,x.vi,x.note,x.en].filter(Boolean).join(' · ')]);
    }
    cached={unit:'中文',id:'zh:'+key,title:topic==='ALL'?'Tất cả bài':topic,topic,vocab,examples,dialogue,grammar,speaking,review,phonetics};
    return cached;
  }
  window.lfChineseStudy={lesson,topics(){lesson();return topics;},
    sync(){window.lfSharedStudySync?.();},openReview(){window.lfSharedStudyReview?.();}};
})();