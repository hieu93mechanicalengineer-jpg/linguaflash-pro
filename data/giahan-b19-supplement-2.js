// Gia Han Trung cap 1 - Bài 19 notebook supplement, continuation (#48-#91)
// Blank notebook numbers 65 and 74-78 are intentionally omitted.
(function(){'use strict';
const C='Gia Hân – Trung cấp 1',T='Bài 19';
const R=[
["gh_b19_sup_048","PDF档","PDF dàng","file PDF","PDF file","请把合同发成PDF档。","Hãy gửi hợp đồng dưới dạng file PDF.","Please send the contract as a PDF file.",null],
["gh_b19_sup_049","网络","wǎngluò","mạng; mạng lưới; Internet","network; Internet","今天公司的网络有点慢。","Hôm nay mạng công ty hơi chậm.","The company's network is a little slow today.",null],
["gh_b19_sup_050","寄出","jìchū","gửi đi; gửi ra ngoài","send out; mail","文件已经寄出了。","Tài liệu đã được gửi đi rồi.","The documents have already been sent out.",null],
["gh_b19_sup_051","电子签名","diànzǐ qiānmíng","chữ ký điện tử","electronic signature","这份文件可以使用电子签名。","Tài liệu này có thể dùng chữ ký điện tử.","This document can use an electronic signature.",null],
["gh_b19_sup_052","下载","xiàzài","tải xuống","download","请先下载这个文件。","Hãy tải file này xuống trước.","Please download this file first.",null],
["gh_b19_sup_053","擦除","cāchú","xóa; lau bỏ","erase; remove","请把错误的内容擦除。","Hãy xóa nội dung sai đi.","Please erase the incorrect content.",null],
["gh_b19_sup_054","缩写","suōxiě","viết tắt; chữ viết tắt","abbreviation; abbreviate","PDF是一个常见的英文缩写。","PDF là một chữ viết tắt tiếng Anh phổ biến.","PDF is a common English abbreviation.",null],
["gh_b19_sup_055","乘以","chéngyǐ","nhân với","multiply by","三乘以四等于十二。","Ba nhân bốn bằng mười hai.","Three multiplied by four equals twelve.",null],
["gh_b19_sup_056","附上","fùshàng","đính kèm","attach; enclose","邮件里请附上报价单。","Trong email hãy đính kèm báo giá.","Please attach the quotation to the email.",null],
["gh_b19_sup_057","效果","xiàoguǒ","hiệu quả; hiệu ứng; kết quả","effect; result","这个方法的效果很好。","Phương pháp này có hiệu quả rất tốt.","This method works very well.",null],
["gh_b19_sup_058","无果","wúguǒ","không có kết quả","without result; unsuccessful","双方谈了很久，但最后无果。","Hai bên đã bàn rất lâu nhưng cuối cùng không có kết quả.","The two sides talked for a long time, but without result.",null],
["gh_b19_sup_059","护照","hùzhào","hộ chiếu","passport","出国的时候别忘了带护照。","Khi ra nước ngoài đừng quên mang hộ chiếu.","Don't forget your passport when traveling abroad.",null],
["gh_b19_sup_060","出示","chūshì","đưa ra; xuất trình","show; present","请出示您的身份证。","Hãy xuất trình căn cước của bạn.","Please show your ID card.",null],
["gh_b19_sup_061","扫码","sǎomǎ","quét mã","scan a code","请扫码登记。","Hãy quét mã để đăng ký thông tin.","Please scan the code to register.",null],
["gh_b19_sup_062","驾照","jiàzhào","bằng lái xe","driver's license","开车必须带驾照。","Lái xe phải mang bằng lái.","You must carry your driver's license when driving.",null],
["gh_b19_sup_063","签证","qiānzhèng","visa; thị thực","visa","去中国以前要先办好签证。","Trước khi đi Trung Quốc phải làm visa xong.","You need to get your visa before going to China.",null],
["gh_b19_sup_064","二维码","èrwéimǎ","mã QR; mã hai chiều","QR code","请扫描这个二维码。","Hãy quét mã QR này.","Please scan this QR code.",null],
["gh_b19_sup_066","证书","zhèngshū","chứng chỉ; giấy chứng nhận","certificate","培训结束后会发证书。","Sau khi kết thúc đào tạo sẽ cấp chứng chỉ.","A certificate will be issued after the training.",null],
["gh_b19_sup_067","凭","píng","dựa vào; căn cứ vào; bằng","on the basis of; by","你凭什么骂我？","Bạn dựa vào đâu mà mắng tôi?","What gives you the right to scold me?",null],
["gh_b19_sup_068","博士","bóshì","tiến sĩ; bậc tiến sĩ","doctor; PhD","他正在读博士。","Anh ấy đang học tiến sĩ.","He is studying for a PhD.",null],
["gh_b19_sup_069","硕士","shuòshì","thạc sĩ; bậc thạc sĩ","master's degree; master","她已经拿到硕士学位了。","Cô ấy đã lấy bằng thạc sĩ.","She has already earned a master's degree.",null],
["gh_b19_sup_070","大学","dàxué","đại học","university; college","他在大学学习机械设计。","Anh ấy học thiết kế cơ khí ở đại học.","He studies mechanical design at university.",null],
["gh_b19_sup_071","大专","dàzhuān","cao đẳng; hệ cao đẳng","junior college; associate-level college","这个岗位要求大专以上学历。","Vị trí này yêu cầu trình độ cao đẳng trở lên.","This position requires at least a junior college education.",null],
["gh_b19_sup_072","高中","gāozhōng","trung học phổ thông; cấp ba","senior high school","他高中毕业以后就开始工作了。","Sau khi tốt nghiệp cấp ba anh ấy bắt đầu đi làm.","He started working after graduating from high school.",null],
["gh_b19_sup_073","评价成绩","píngjià chéngjì","đánh giá thành tích; đánh giá kết quả","evaluate performance; assess results","主管会根据工作表现评价成绩。","Quản lý sẽ đánh giá thành tích dựa trên biểu hiện công việc.","The supervisor will evaluate performance based on work results.",null],
["gh_b19_sup_079","目标","mùbiāo","mục tiêu","goal; target","我们的目标是按时完成项目。","Mục tiêu của chúng ta là hoàn thành dự án đúng hạn.","Our goal is to complete the project on time.",null],
["gh_b19_sup_080","手续","shǒuxù","thủ tục","procedure; formalities","入职手续已经办好了。","Thủ tục nhận việc đã làm xong.","The onboarding formalities have been completed.",null],
["gh_b19_sup_081","戴","dài","đeo; đội; mang trên người","wear; put on","进入车间必须戴安全帽。","Vào xưởng phải đội mũ bảo hộ.","You must wear a safety helmet in the workshop.",null],
["gh_b19_sup_082","登记","dēngjì","đăng ký; ghi danh; đăng ký thông tin","register; record","入住酒店时需要登记个人信息。","Khi nhận phòng khách sạn cần đăng ký thông tin cá nhân.","You need to register personal information when checking into a hotel.",null],
["gh_b19_sup_083","之恩","zhī ēn","ân huệ; ơn (dùng trong cấu trúc ...之恩)","favor; kindness (in ...之恩)","滴水之恩，当涌泉相报。","Ơn dù nhỏ cũng nên báo đáp thật hậu.","A small favor should be repaid generously.",null],
["gh_b19_sup_084","营业","yíngyè","kinh doanh; mở cửa kinh doanh","do business; be open for business","这家店每天九点开始营业。","Cửa hàng này bắt đầu kinh doanh lúc 9 giờ mỗi ngày.","This shop opens for business at nine every day.",null],
["gh_b19_sup_085","经营","jīngyíng","kinh doanh; điều hành; quản lý","operate; manage a business","他经营一家家具公司。","Anh ấy điều hành một công ty nội thất.","He runs a furniture company.",null],
["gh_b19_sup_086","栏","lán","cột; mục; ô thông tin","column; field; section","请在这一栏填写姓名。","Hãy điền họ tên vào cột này.","Please fill in your name in this field.",null],
["gh_b19_sup_087","横","héng","ngang; nằm ngang","horizontal; across","请把这张纸横着放。","Hãy đặt tờ giấy này nằm ngang.","Please place this sheet horizontally.",null],
["gh_b19_sup_088","补助","bǔzhù","trợ cấp; phụ cấp; hỗ trợ","subsidy; allowance","公司给员工提供交通补助。","Công ty cung cấp phụ cấp đi lại cho nhân viên.","The company provides a transportation allowance to employees.",null],
["gh_b19_sup_089","全勤","quánqín","chuyên cần; đi làm đầy đủ","full attendance; perfect attendance","这个月全勤可以拿奖金。","Tháng này nếu chuyên cần có thể nhận thưởng.","Perfect attendance this month earns a bonus.",null],
["gh_b19_sup_090","随","suí","theo; cùng với; tùy theo","follow; along with; according to","请随我来。","Hãy đi theo tôi.","Please follow me.",null],
["gh_b19_sup_091","亲自","qīnzì","đích thân; tự mình","personally; in person","这个问题我会亲自处理。","Vấn đề này tôi sẽ đích thân xử lý.","I will handle this issue personally.",null]
];
const n=v=>String(v||'').trim().replace(/\s+/g,'').replace(/[／]/g,'/').toLowerCase();
if(!Array.isArray(window.GIA_HAN_CORE_CARDS)){console.warn('[LinguaFlash] Bài 19 continuation skipped: core cards unavailable.');return;}
const E=new Set(window.GIA_HAN_CORE_CARDS.filter(c=>c&&c.lang==='zh'&&String(c.category||'').includes('Gia Hân')).map(c=>n(c.front)).filter(Boolean));
const A=R.filter(r=>!((r[8]&&r[8].length?r[8]:[r[1]]).some(a=>E.has(n(a))))).map(r=>({id:r[0],lang:'zh',front:r[1],phonetic:r[2],back:r[3],meaningEn:r[4],chinese:r[1],category:C,topic:T,example:r[5],exampleTrans:r[6],exampleEn:r[7],interval:0,repetitions:0,easeFactor:2.5,nextReview:new Date(0).toISOString(),cardType:'vocab'}));
window.GIA_HAN_CORE_CARDS.push(...A);
console.info(`[LinguaFlash] Bài 19 continuation: ${A.length} missing cards added, ${R.length-A.length} existing cards skipped.`);
})();