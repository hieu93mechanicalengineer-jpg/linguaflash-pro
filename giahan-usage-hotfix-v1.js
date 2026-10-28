/* Final small text corrections for Gia Han usage examples. */
(() => {
  'use strict';
  function text(v){return String(v==null?'':v).trim();}
  function sourceCode(card){
    const raw=[card?.sourceCode,card?.code,card?.sourceLabel,card?.sourceSection,card?.label,card?.topic,card?.id].map(text).join(' ');
    const m=raw.match(/\bB\d{2}-(?:[A-Z]{1,3}\d+|\d+)\b/i);
    return m?m[0].toUpperCase():'';
  }
  function patchArray(arr){
    if(!Array.isArray(arr))return;
    arr.forEach(card=>{
      const code=sourceCode(card);
      if(code==='B29-V12' && text(card.example).includes('正式开业')){
        card.exampleTrans='Cửa hàng mới này tuần sau chính thức khai trương.';
      }
      if(code==='B16-V40' && text(card.word)==='采购'){
        card.phonetic='cǎigòu';
        if('pinyin' in card)card.pinyin='cǎigòu';
        card.example='我们需要提前采购下个月生产用的原材料。';
        card.exampleTrans='Chúng ta cần mua trước nguyên vật liệu dùng cho sản xuất tháng sau.';
        card.exampleEn="We need to purchase in advance the raw materials for next month's production.";
      }
    });
  }
  function run(){
    try{if(typeof allCards!=='undefined')patchArray(allCards);}catch(_){}
    try{if(typeof DEFAULT_CARDS!=='undefined')patchArray(DEFAULT_CARDS);}catch(_){}
    try{if(typeof GIA_HAN_TC2_CARDS_31_45!=='undefined')patchArray(GIA_HAN_TC2_CARDS_31_45);}catch(_){}
  }
  run();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  setTimeout(run,100);
})();