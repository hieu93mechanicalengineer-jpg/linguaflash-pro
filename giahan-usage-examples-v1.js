/* LinguaFlash Gia Han usage examples v1
   Replaces TC1 note-like "examples" with real usage sentences, preserves notes,
   and fills the remaining TC2 vocabulary examples. */
(() => {
  'use strict';
  if (window.__LF_GIAHAN_USAGE_V1__) return;
  window.__LF_GIAHAN_USAGE_V1__ = true;

  const TC1_EXTRA = {
    'B16-V29':['这把椅子很耐用，用了很多年还没坏。','Chiếc ghế này rất bền, dùng nhiều năm rồi vẫn chưa hỏng.'],
    'B16-V32':['他明天去一家新公司应聘。','Ngày mai anh ấy đi ứng tuyển ở một công ty mới.'],
    'B16-V33':['这个地区的经济很发达。','Kinh tế của khu vực này rất phát triển.'],
    'B16-V34':['听到这个解释，我真的很无语。','Nghe lời giải thích này, tôi thật sự cạn lời.'],
    'B16-V35':['人生无常，所以要珍惜现在。','Đời người vô thường, vì vậy hãy trân trọng hiện tại.'],
    'B16-V39':['最近工作的节奏比较快。','Gần đây nhịp độ công việc khá nhanh.'],
    'B16-V40':['设计师去乡下采风，寻找新的灵感。','Nhà thiết kế về vùng quê thu thập tư liệu thực tế để tìm cảm hứng mới.'],
    'B16-V42':['如果你不方便，我就不为难你了。','Nếu bạn không tiện thì tôi sẽ không làm khó bạn nữa.'],
    'B17-BS01':['下午三点我们在会议室开会。','Ba giờ chiều chúng ta họp ở phòng họp.'],
    'B17-BS02':['请把重点记在笔记本上。','Hãy ghi những điểm chính vào sổ.'],
    'B17-BS03':['我出差时会带笔记本电脑。','Khi đi công tác tôi sẽ mang theo máy tính xách tay.'],
    'B17-BS07':['请大家明天准时到公司。','Ngày mai mọi người hãy đến công ty đúng giờ.'],
    'B17-BS08':['我们必须按时完成订单。','Chúng ta phải hoàn thành đơn hàng đúng thời hạn.'],
    'B17-BS10':['如果员工严重违反规定，公司可能会开除他。','Nếu nhân viên vi phạm quy định nghiêm trọng, công ty có thể sa thải họ.'],
    'B17-BS11':['这次事故必须追究相关人员的责任。','Sự cố lần này phải truy cứu trách nhiệm của những người liên quan.'],
    'B17-BS13':['请在发票上填写公司的税号。','Hãy điền mã số thuế của công ty trên hóa đơn.'],
    'B17-BS14':['我们下个月要参加家具展会。','Tháng sau chúng tôi sẽ tham gia hội chợ triển lãm nội thất.'],
    'B17-BS15':['这次展览展示了很多新产品。','Triển lãm lần này trưng bày rất nhiều sản phẩm mới.'],
    'B17-BS18':['他的中文说得很好。','Tiếng Trung của anh ấy nói rất tốt.'],
    'B17-BS21':['他性格比较内向，不太爱说话。','Tính cách anh ấy khá hướng nội, không thích nói nhiều.'],
    'B17-BS22':['她很外向，很容易跟别人交朋友。','Cô ấy rất hướng ngoại, rất dễ kết bạn với người khác.'],
    'B17-BS23':['这台机器太旧了，需要更换。','Chiếc máy này quá cũ, cần phải thay.'],
    'B17-BS26':['今年公司的利润比去年高。','Lợi nhuận công ty năm nay cao hơn năm ngoái.'],
    'B17-BS27':['做决定时要考虑公司的整体利益。','Khi đưa ra quyết định cần cân nhắc lợi ích chung của công ty.'],
    'B17-BS28':['员工无故缺勤会受到处罚。','Nhân viên vắng mặt không lý do sẽ bị xử lý.'],
    'B17-BS29':['这个要求太无理了，我们不能接受。','Yêu cầu này quá vô lý, chúng tôi không thể chấp nhận.'],
    'B17-BS30':['对客户说话不能这么无礼。','Không được nói chuyện với khách hàng bất lịch sự như vậy.'],
    'B17-BS31':['看到这样的结果，我真的无话可说。','Nhìn kết quả như vậy, tôi thật sự không còn gì để nói.'],
    'B17-BS32':['提高产品质量可以增强公司的竞争力。','Nâng cao chất lượng sản phẩm có thể tăng sức cạnh tranh của công ty.'],
    'B17-BS34':['请留下您的联系方式，方便我们联系。','Vui lòng để lại thông tin liên hệ để chúng tôi tiện liên lạc.'],
    'B17-BS36':['这项规定适用于所有普通员工。','Quy định này áp dụng cho tất cả nhân viên thông thường.'],
    'B17-BS37':['行政人员负责准备会议资料。','Nhân viên hành chính phụ trách chuẩn bị tài liệu cuộc họp.'],
    'B17-BS41':['原来如此，我现在明白了。','Thì ra là như vậy, bây giờ tôi hiểu rồi.'],
    'B17-BS42':['这个新设计吸引了很多客户。','Thiết kế mới này thu hút rất nhiều khách hàng.'],
    'B17-BS43':['请大家关注今天的生产进度。','Mọi người hãy chú ý đến tiến độ sản xuất hôm nay.'],
    'B21-V51':['除了学中文以外，我还学英语。','Ngoài học tiếng Trung ra, tôi còn học tiếng Anh.'],
    'B24-V04':['一切都准备好了，可以开始生产了。','Mọi thứ đã chuẩn bị xong, có thể bắt đầu sản xuất.'],
    'B24-V06':['主管正在现场指挥工人搬货。','Quản lý đang chỉ huy công nhân vận chuyển hàng tại hiện trường.'],
    'B24-V07':['出货前务必再检查一次。','Trước khi xuất hàng nhất định phải kiểm tra lại một lần.'],
    'B24-V08':['进入车间必须穿工作服。','Vào xưởng bắt buộc phải mặc quần áo làm việc.'],
    'B24-V10':['她把头发染成了棕色。','Cô ấy nhuộm tóc màu nâu.'],
    'B24-V11':['这份说明书里有很多彩色图片。','Trong tài liệu hướng dẫn này có nhiều hình ảnh màu.'],
    'B24-V12':['进入车间前请把长头发扎起来。','Trước khi vào xưởng hãy buộc tóc dài gọn lại.'],
    'B24-V13':['上班时员工必须穿公司制服。','Khi làm việc nhân viên phải mặc đồng phục công ty.'],
    'B24-V14':['请保持工作区域干净。','Hãy giữ khu vực làm việc sạch sẽ.'],
    'B24-V15':['工具用完后要摆放整齐。','Sau khi dùng xong phải sắp xếp dụng cụ ngăn nắp.'],
    'B24-V18':['她把头发扎起来以后才进车间。','Cô ấy buộc tóc lên rồi mới vào xưởng.'],
    'B24-V19':['车间里禁止打赤脚。','Trong xưởng cấm đi chân đất.'],
    'B24-V20':['进入生产区不能穿拖鞋。','Không được mang dép lê vào khu vực sản xuất.'],
    'B24-V23':['上班前要保持指甲干净。','Trước khi làm việc cần giữ móng tay sạch sẽ.'],
    'B24-V24':['不要在车间里乱扔垃圾。','Đừng vứt rác bừa bãi trong xưởng.'],
    'B24-V25':['请把垃圾放进指定的垃圾桶。','Hãy bỏ rác vào thùng rác được chỉ định.'],
    'B24-V27':['进厂时请把厂牌戴在胸前。','Khi vào nhà máy hãy đeo thẻ nhà máy trước ngực.'],
    'B24-V28':['工牌应该戴在胸前明显的位置。','Thẻ nhân viên nên được đeo ở vị trí dễ thấy trước ngực.'],
    'B24-V30':['请不要破坏公司的设备。','Xin đừng làm hư hỏng thiết bị của công ty.'],
    'B24-V31':['公司严禁任何偷窃行为。','Công ty nghiêm cấm mọi hành vi trộm cắp.'],
    'B24-V35':['这个问题很严重，必须马上处理。','Vấn đề này rất nghiêm trọng, phải xử lý ngay.'],
    'B24-V38':['假造资料会受到公司的严肃处理。','Làm giả tài liệu sẽ bị công ty xử lý nghiêm.'],
    'B24-V40':['办理这项业务需要提供授权书。','Làm thủ tục này cần cung cấp giấy ủy quyền.'],
    'B25-V04':['他昨天出了事故，所以没来上班。','Hôm qua anh ấy gặp tai nạn nên không đi làm.'],
    'B26-V20':['进办公室前请先敲门。','Trước khi vào văn phòng hãy gõ cửa.'],
    'B28-01':['我的同屋是一个很热情的人。','Bạn cùng phòng của tôi là một người rất nhiệt tình.'],
    'B28-06':['每个人都有选择自己信仰的自由。','Mỗi người đều có quyền tự do lựa chọn tín ngưỡng của mình.'],
    'B28-08':['这条河的一部分是两国的国界。','Một phần con sông này là biên giới giữa hai nước.'],
    'B28-10':['一家人平安健康就是幸福。','Cả gia đình bình an khỏe mạnh chính là hạnh phúc.'],
    'B28-13':['国庆节我们公司放假两天。','Ngày Quốc khánh công ty chúng tôi nghỉ hai ngày.'],
    'B28-14':['我下班回家后先洗澡。','Sau khi tan làm về nhà tôi tắm trước.'],
    'B28-17':['医生劝他少喝酒，多休息。','Bác sĩ khuyên anh ấy uống ít rượu và nghỉ ngơi nhiều hơn.'],
    'B29-01':['每天运动半小时对身体很好。','Mỗi ngày vận động nửa giờ rất tốt cho cơ thể.'],
    'B29-02':['他下班后累得躺在沙发上。','Sau khi tan làm anh ấy mệt đến mức nằm trên ghế sofa.'],
    'B29-03':['周末我偶尔会睡懒觉。','Cuối tuần thỉnh thoảng tôi ngủ nướng.'],
    'B29-04':['他打算明年开店做生意。','Anh ấy dự định năm sau mở cửa hàng kinh doanh.'],
    'B29-05':['我每天早晚都刷牙。','Mỗi ngày tôi đều đánh răng sáng và tối.'],
    'B29-12':['这家新店下周正式开业。','Cửa hàng mới này tuần sau chính thức khai trương.'],
    'B29-13':['自从来这家公司以来，我学到了很多东西。','Kể từ khi vào công ty này đến nay, tôi đã học được rất nhiều điều.'],
    'B29-14':['谢谢大家一直支持我们的工作。','Cảm ơn mọi người đã luôn ủng hộ công việc của chúng tôi.'],
    'B29-18':['进入工地要戴安全帽。','Vào công trường phải đội mũ bảo hộ.'],
    'B29-20':['这双鞋有点紧，我想换大一码。','Đôi giày này hơi chật, tôi muốn đổi cỡ lớn hơn.'],
    'B29-21':['你今天看起来挺精神的。','Hôm nay trông bạn khá tỉnh táo và đầy sức sống.'],
    'B29-23':['俗话说，熟能生巧。','Tục ngữ có câu: quen tay hay việc.'],
    'B29-24':['春天天气暖和，很多花都开了。','Mùa xuân thời tiết ấm áp, nhiều loài hoa nở.'],
    'B30-V07':['这次违规会被记在记录簿里。','Lần vi phạm này sẽ được ghi vào sổ theo dõi.'],
    'B30-V08':['会议结束后我们一起去吃饭。','Sau khi cuộc họp kết thúc chúng ta cùng đi ăn.']
  };

  const TC2_MISSING = {
    '扳手':['请用扳手把这个螺栓拧紧。','Hãy dùng cờ lê siết chặt bu lông này.'],
    '纸箱':['请把这些产品装进纸箱里。','Hãy đóng những sản phẩm này vào thùng carton.'],
    '螺栓':['这个螺栓有点松，需要拧紧。','Bu lông này hơi lỏng, cần siết chặt.'],
    '螺丝':['这颗螺丝松了，请拧紧一点。','Con vít này bị lỏng, hãy siết chặt thêm một chút.'],
    '弹簧':['这个弹簧已经变形了，需要更换。','Lò xo này đã biến dạng, cần thay mới.'],
    '研磨机':['使用研磨机时一定要戴防护眼镜。','Khi sử dụng máy mài nhất định phải đeo kính bảo hộ.'],
    '电钻':['师傅正在用电钻打孔。','Thợ đang dùng máy khoan điện để khoan lỗ.'],
    '斜口钳':['请用斜口钳剪断这根电线。','Hãy dùng kìm cắt chéo cắt đứt dây điện này.'],
    '电线':['这根电线破了，不能继续使用。','Dây điện này bị hỏng, không thể tiếp tục sử dụng.'],
    '塑料袋':['请把小零件装进塑料袋里。','Hãy cho các chi tiết nhỏ vào túi nhựa.'],
    '两面胶':['用两面胶把标签贴在盒子上。','Dùng băng keo hai mặt dán nhãn lên hộp.'],
    '量尺':['先用量尺确认这个零件的长度。','Trước tiên dùng thước đo xác nhận chiều dài chi tiết này.'],
    '锹':['工人用锹把沙子铲到一边。','Công nhân dùng xẻng xúc cát sang một bên.'],
    '锯子':['他用锯子把木板锯开。','Anh ấy dùng cưa cắt tấm gỗ ra.'],
    '钳子':['请用钳子夹住这个零件。','Hãy dùng kìm kẹp giữ chi tiết này.'],
    '机油':['机器运行前要检查机油是否足够。','Trước khi máy chạy phải kiểm tra dầu máy có đủ hay không.'],
    '工厂':['这家工厂有五百多名员工。','Nhà máy này có hơn 500 nhân viên.'],
    '办公室':['经理现在在办公室开会。','Quản lý hiện đang họp trong văn phòng.'],
    '宿舍':['员工宿舍在工厂后面。','Ký túc xá nhân viên ở phía sau nhà máy.'],
    '餐厅':['中午我们在公司餐厅吃饭。','Buổi trưa chúng tôi ăn ở nhà ăn công ty.'],
    '足球场':['宿舍旁边有一个足球场。','Bên cạnh ký túc xá có một sân bóng đá.'],
    '垃圾堆':['请不要把材料放在垃圾堆旁边。','Đừng để vật liệu cạnh khu rác.'],
    '消防器':['消防器必须放在容易拿到的地方。','Thiết bị chữa cháy phải đặt ở nơi dễ lấy.'],
    '花盆':['办公室门口放着几个花盆。','Trước cửa văn phòng có đặt vài chậu hoa.'],
    '出入口':['这个出入口不能堆放货物。','Lối ra vào này không được chất hàng hóa.'],
    '大门口':['我在公司大门口等你。','Tôi đợi bạn ở cổng chính công ty.'],
    '客人停车场':['来访车辆请停在客人停车场。','Xe của khách đến thăm vui lòng đỗ ở bãi đỗ xe khách.'],
    '人员存车处':['员工的摩托车要停在人员存车处。','Xe máy của nhân viên phải để ở khu để xe nhân viên.']
  };

  const UNCERTAIN = new Set(['B17-BS25','B24-V16','B24-V39']);
  function text(v){ return String(v == null ? '' : v).trim(); }
  function hasHanzi(v){ return /[\u3400-\u9fff]/u.test(text(v)); }
  function sourceCode(card){ const raw=`${text(card?.sourceLabel)} ${text(card?.sourceSection)}`; const m=raw.match(/\bB\d{2}-(?:[A-Z]{1,3}\d+|\d+)\b/i); return m?m[0].toUpperCase():''; }
  function lessonOf(card){ const raw=`${text(card?.sourceLabel)} ${text(card?.topic)} ${text(card?.sourceSection)}`; const m=raw.match(/(?:B(?:ài)?\s*|B)(1[6-9]|2\d|3\d|4[0-5])/i); return m?Number(m[1]):0; }
  function canonicalWord(raw){ return text(raw).replace(/[（(].*?[）)]/g,'').split(/[\/／;；]/)[0].replace(/\.{2,}|…+/g,'').trim(); }
  function looksLikeUsage(v){ const s=text(v); return hasHanzi(s)&&s.length>=5&&!/^(名词|动词|形容词|副词|介词|量词|连词|助词)/.test(s); }
  function dialogueLines(){
    const rows=[]; const add=pack=>{ if(!pack||typeof pack!=='object')return; Object.entries(pack).forEach(([key,d])=>{const km=String(key).match(/(\d{2})/);const lesson=km?Number(km[1]):0;(d?.lines||[]).forEach(line=>{if(text(line?.cn))rows.push({lesson,cn:text(line.cn),vn:text(line.vn),en:text(line.en)});});});};
    try{if(typeof GIA_HAN_DIALOGUES_PACK!=='undefined')add(GIA_HAN_DIALOGUES_PACK);}catch(_){}
    try{if(typeof GIA_HAN_DIALOGUES_PACK_TC2!=='undefined')add(GIA_HAN_DIALOGUES_PACK_TC2);}catch(_){}
    return rows;
  }
  const DIALOGUE_LINES=dialogueLines();
  function findDialogueExample(card){ const word=canonicalWord(card?.word); if(!word||!hasHanzi(word))return null; const lesson=lessonOf(card); const same=DIALOGUE_LINES.filter(x=>!lesson||x.lesson===lesson); const hit=same.find(x=>x.cn.includes(word))||DIALOGUE_LINES.find(x=>x.cn.includes(word)); return hit?[hit.cn,hit.vn,hit.en]:null; }
  function preserveOldNotes(card){ const oldEx=text(card.example),oldTr=text(card.exampleTrans); if(oldEx&&!looksLikeUsage(oldEx)&&!card.usageNote)card.usageNote=oldEx; if(oldTr&&/^IPA\s*tiếng Anh\s*:/i.test(oldTr)&&!card.englishIpa)card.englishIpa=oldTr.replace(/^IPA\s*tiếng Anh\s*:\s*/i,''); }
  function applyExample(card,example){ if(!card||!example||!text(example[0]))return false; card.example=text(example[0]);card.exampleTrans=text(example[1]);if(text(example[2]))card.exampleEn=text(example[2]);return true; }
  function b16Example(code){ const m=code.match(/^B16-V(\d+)$/);if(!m)return null;try{if(typeof GIAHAN_BAI16_EXAMPLES==='undefined')return null;const key=`gh_l1_b16_vocab_${String(Number(m[1])).padStart(2,'0')}`;const ex=GIAHAN_BAI16_EXAMPLES[key];return ex?[ex.example,ex.exampleTrans,ex.exampleEn]:null;}catch(_){return null;} }
  function isGiaHanTc1Vocab(card){ const hay=`${text(card?.topic)} ${text(card?.sourceSection)} ${text(card?.id)}`; return card?.cardType!=='sentence'&&card?.lang==='Tiếng Trung'&&/Gia Hân|Gia Han|gh_l1_/i.test(hay)&&/Trung cấp 1|gh_l1_/i.test(hay); }
  function isGiaHanTc2Vocab(card){ const hay=`${text(card?.topic)} ${text(card?.sourceSection)} ${text(card?.id)}`; return card?.cardType!=='sentence'&&card?.lang==='Tiếng Trung'&&/Gia Hân|Gia Han|gh_tc2|Trung cấp 2/i.test(hay)&&/Trung cấp 2|tc2/i.test(hay); }

  let tc1Total=0,tc1Usage=0,tc2Total=0,tc2Usage=0;
  try{if(typeof DEFAULT_CARDS!=='undefined'&&Array.isArray(DEFAULT_CARDS)){DEFAULT_CARDS.forEach(card=>{if(!isGiaHanTc1Vocab(card))return;tc1Total++;preserveOldNotes(card);if(!looksLikeUsage(card.example)){card.example='';card.exampleTrans='';const code=sourceCode(card);if(!UNCERTAIN.has(code))applyExample(card,b16Example(code)||findDialogueExample(card)||TC1_EXTRA[code]);}if(looksLikeUsage(card.example))tc1Usage++;});}}catch(err){console.warn('Gia Han TC1 usage enrichment:',err);}
  try{if(typeof GIA_HAN_TC2_CARDS_31_45!=='undefined'&&Array.isArray(GIA_HAN_TC2_CARDS_31_45)){GIA_HAN_TC2_CARDS_31_45.forEach(card=>{if(!isGiaHanTc2Vocab(card))return;tc2Total++;if(!looksLikeUsage(card.example))applyExample(card,findDialogueExample(card)||TC2_MISSING[canonicalWord(card.word)]);if(looksLikeUsage(card.example))tc2Usage++;});}}catch(err){console.warn('Gia Han TC2 usage enrichment:',err);}
  window.LF_GIAHAN_USAGE_STATS={tc1Total,tc1Usage,tc2Total,tc2Usage,intentionallyUnresolved:[...UNCERTAIN]};
})();