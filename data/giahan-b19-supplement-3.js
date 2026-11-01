// Gia Han Trung cap 1 - Bài 19 notebook corrections and final additions (#15, #59, #73-#78, #92-#95)
(function(){'use strict';
const C='Gia Hân – Trung cấp 1',T='Bài 19';
const n=v=>String(v||'').trim().replace(/\s+/g,'').replace(/[／]/g,'/').toLowerCase();
if(!Array.isArray(window.GIA_HAN_CORE_CARDS)){console.warn('[LinguaFlash] Bài 19 supplement 3 skipped: core cards unavailable.');return;}

function patchById(id,data){
  const c=window.GIA_HAN_CORE_CARDS.find(x=>x&&x.id===id);
  if(!c) return false;
  Object.assign(c,data);
  return true;
}

// Corrections verified from the user's handwritten notebook photos.
patchById('gh_b19_sup_059',{
  front:'按照',phonetic:'ànzhào',back:'theo; căn cứ theo; chiếu theo',meaningEn:'according to; in accordance with',chinese:'按照',
  example:'请按照公司的规定填写这张表。',exampleTrans:'Hãy điền biểu mẫu này theo quy định của công ty.',exampleEn:'Please fill in this form according to company rules.'
});
patchById('gh_b19_sup_073',{
  front:'评估成绩',phonetic:'pínggū chéngjì',back:'đánh giá thành tích; đánh giá kết quả',meaningEn:'assess performance; evaluate results',chinese:'评估成绩',
  example:'主管会根据工作表现评估成绩。',exampleTrans:'Quản lý sẽ đánh giá thành tích dựa trên biểu hiện công việc.',exampleEn:'The supervisor will assess performance based on work results.'
});

const R=[
['gh_b19_sup_extra_015_file','文件','wénjiàn','tài liệu; văn bản; file','document; file','请把这份文件发给我。','Hãy gửi tài liệu này cho tôi.','Please send this document to me.'],
['gh_b19_sup_074','优秀','yōuxiù','xuất sắc','excellent; outstanding','他的工作成绩很优秀。','Thành tích công việc của anh ấy rất xuất sắc.','His work performance is excellent.'],
['gh_b19_sup_075','良好','liánghǎo','tốt; khá tốt','good; favorable','他的工作表现良好。','Biểu hiện công việc của anh ấy tốt.','His work performance is good.'],
['gh_b19_sup_076','一般','yībān','bình thường; trung bình','average; ordinary','这次的成绩一般。','Kết quả lần này ở mức trung bình.','The result this time is average.'],
['gh_b19_sup_077','及格','jígé','đạt; đỗ; qua mức yêu cầu','pass; reach the passing grade','这次考试他及格了。','Lần thi này anh ấy đã đạt.','He passed the exam this time.'],
['gh_b19_sup_078','不及格','bù jígé','không đạt; không đỗ','fail; below passing grade','这次考试他不及格。','Lần thi này anh ấy không đạt.','He failed the exam this time.'],
['gh_b19_sup_092','请随我来','qǐng suí wǒ lái','hãy đi theo tôi','please follow me','请随我来，我带你去办公室。','Hãy đi theo tôi, tôi dẫn bạn đến văn phòng.','Please follow me. I will take you to the office.'],
['gh_b19_sup_093','条','tiáo','lượng từ cho vật dài/hẹp; dòng; điều','measure word for long things; item; article','请看合同的第一条。','Hãy xem điều thứ nhất của hợp đồng.','Please look at the first article of the contract.'],
['gh_b19_sup_094','行','háng','hàng; dòng','row; line','请在下一行签名。','Hãy ký tên ở dòng tiếp theo.','Please sign on the next line.'],
['gh_b19_sup_095','抱怨','bàoyuàn','phàn nàn; oán trách','complain; grumble','遇到问题时不要一直抱怨。','Khi gặp vấn đề đừng liên tục phàn nàn.','Do not keep complaining when you encounter a problem.']
];

// Dedupe only inside Bài 19 so the lesson still contains all of its own vocabulary,
// even when the same word appears in another Gia Hân lesson.
const E=new Set(window.GIA_HAN_CORE_CARDS.filter(c=>c&&c.lang==='zh'&&n(c.topic)===n(T)).map(c=>n(c.front)).filter(Boolean));
const A=R.filter(r=>!E.has(n(r[1]))).map(r=>({
  id:r[0],lang:'zh',front:r[1],phonetic:r[2],back:r[3],meaningEn:r[4],chinese:r[1],category:C,topic:T,
  example:r[5],exampleTrans:r[6],exampleEn:r[7],interval:0,repetitions:0,easeFactor:2.5,nextReview:new Date(0).toISOString(),cardType:'vocab'
}));
window.GIA_HAN_CORE_CARDS.push(...A);
console.info(`[LinguaFlash] Bài 19 supplement 3: ${A.length} additions; corrected #59 and #73 when present.`);
})();