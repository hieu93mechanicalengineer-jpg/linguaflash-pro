/* LinguaFlash · Mobile Class 158 bridge v1
   Injects the existing Class 158 teacher-summary content into the shared 51Talk
   workspace before the mobile parity adapter evaluates it. Narrow one-shot fetch
   interception only; restored immediately after the workspace source is requested.
*/
(() => {
  'use strict';
  if (window.__LF51_MOBILE_CLASS158_BRIDGE_V1__) return;
  window.__LF51_MOBILE_CLASS158_BRIDGE_V1__ = true;

  const originalFetch = window.fetch.bind(window);

  const WORK_LESSON = String.raw`    work158: {
      id:'work158', unit:'CLASS 158', title:'WORK & COMMUNICATION',
      subtitle:'Công việc · Cảm xúc · Phản xạ lớp học · Hội thoại IT',
      vocab:[
        ['excited','/ɪkˈsaɪtɪd/','Hào hứng, phấn khích, nôn nao','Cảm giác vui sướng khi đến sinh nhật, ngày lĩnh lương, nhận quà, đi nghỉ mát hoặc có ngày nghỉ. ⚠️ excited không đồng nghĩa với comfortable.','thrilled, eager, enthusiastic'],
        ['comfortable','/ˈkʌmftəbl/','Thoải mái, dễ chịu, thư thái','Dùng cho cảm giác bình yên, dễ chịu như comfortable at home / feel at ease. Khác excited = phấn khích.','at ease, relaxed, cozy'],
        ['nervous','/ˈnɜːrvəs/','Lo lắng, căng thẳng, hồi hộp','Dùng khi căng thẳng hoặc hồi hộp vì một tình huống: I feel nervous when there is a problem in my work.','worried, anxious, tense, uneasy'],
        ['worried / worry','/ˈwɜːrid/ · /ˈwɜːri/','Lo âu, băn khoăn / lo lắng','nervous và worried gần nghĩa nhau. worried là tính từ; worry là động từ/danh từ. Mẫu: feel worried · be worried about...','concerned, anxious'],
        ['uncertain','/ʌnˈsɜːrtn/','Không chắc chắn, còn phân vân','uncertain = not sure = not certain. Mẫu: be uncertain about sth.','not sure, unsure, doubtful'],
        ['certain / sure','/ˈsɜːrtn/ · /ʃʊr/','Chắc chắn, nắm chắc','Trái nghĩa với uncertain. Mẫu: be certain of/about sth; be sure about sth.','sure, definite'],
        ['responsible for','/rɪˈspɒnsəbl fɔːr/','Chịu trách nhiệm, phụ trách','responsible là tính từ. Dùng be responsible for + N / V-ing.','in charge of, accountable for'],
        ['responsibility','/rɪˌspɒnsəˈbɪləti/','Trách nhiệm, nhiệm vụ chính','Danh từ. Mẫu: My/Your main responsibility is + V-ing / N.','duty, task'],
        ['provide','/prəˈvaɪd/','Cung cấp, mang lại, đưa ra','provide = give. Mẫu: provide sth / provide sth for sb / provide sb with sth.','give, supply, offer'],
        ['furniture design','/ˈfɜːrnɪtʃər dɪˈzaɪn/','Thiết kế đồ nội thất','Câu nghề nghiệp: I am responsible for providing furniture design.','furniture designer = người thiết kế'],
        ['colleagues / coworkers','/ˈkɑːliːɡz/ · /ˈkoʊwɜːrkərz/','Đồng nghiệp','Người làm cùng công ty hoặc cùng nơi làm việc.','teammates, workmates'],
        ['new arrivals','/nuː əˈraɪvəlz/','Những nhân viên mới tới','Dùng trong hội thoại về khóa training dành cho người mới.','new employees, newcomers'],
        ['guide','/ɡaɪd/','Hướng dẫn, dìu dắt','guide + someone. Ví dụ: Wade is here to guide you in the first month.','help, coach'],
        ['arrive home','/əˈraɪv hoʊm/','Về đến nhà','Khác go home. arrive home nhấn thời điểm đã tới nhà; trước home không dùng to/at.','reach home'],
        ['work overtime','/wɜːrk ˈoʊvərtaɪm/','Làm thêm giờ, tăng ca','Dùng work overtime. Quá khứ: worked overtime.','work late'],
        ['have a meeting','/hæv ə ˈmiːtɪŋ/','Có một cuộc họp','Quá khứ: had a meeting. Chú ý phát âm meeting /ˈmiːtɪŋ/.','attend a meeting'],
        ['concern(s)','/kənˈsɜːrn(z)/','Băn khoăn, mối quan tâm','Mẫu công sở: Should you have any questions or concerns...','question, worry'],
        ['go ahead','/ɡoʊ əˈhed/','Cứ hỏi đi / cứ tiếp tục đi','Dùng khi cho phép người khác bắt đầu nói hoặc làm điều gì.','please continue, sure']
      ],
      examples:[
        ['excited','I feel excited about my birthday.','Tôi cảm thấy háo hức về sinh nhật của mình.'],
        ['comfortable','I feel comfortable at home.','Tôi cảm thấy thoải mái khi ở nhà.'],
        ['nervous',"I feel nervous when there's a problem in my work.",'Tôi cảm thấy căng thẳng khi có vấn đề phát sinh trong công việc.'],
        ['worried','I feel worried because I did not finish my work.','Tôi cảm thấy lo lắng vì tôi chưa hoàn thành công việc.'],
        ['uncertain','I am uncertain about my answer.','Tôi không chắc chắn về câu trả lời của mình.'],
        ['certain / sure','I am certain of my answer.','Tôi chắc chắn về câu trả lời của mình.'],
        ['Yesterday + Past Simple','Yesterday, I had a meeting and worked overtime, so I arrived home at 9 p.m.','Hôm qua tôi có cuộc họp và phải tăng ca, nên tôi về đến nhà lúc 9 giờ tối.'],
        ['responsible for','In my job, I am responsible for providing furniture design.','Trong công việc, tôi chịu trách nhiệm cung cấp các thiết kế nội thất.'],
        ['responsibilities','He is responsible for developing programs and providing technical support.','Anh ấy chịu trách nhiệm phát triển chương trình và cung cấp hỗ trợ kỹ thuật.'],
        ['Classroom reflex',"I don't understand the word uncertain.",'Tôi không hiểu từ uncertain.'],
        ['Compare meanings','Are comfortable and excited the same?','Comfortable và excited có giống nhau không?'],
        ['Compare meanings','Do not sure and uncertain mean the same?','Not sure và uncertain có cùng nghĩa không?']
      ],
      dialogue:[
        ['Mr. Anthony','Good morning, Robert. I am Bruce Anthony, Manager of the IT Department. Welcome to join us.','Chào buổi sáng, Robert. Tôi là Bruce Anthony, Trưởng phòng CNTT. Chào mừng bạn gia nhập.'],
        ['Robert',"Nice to meet you, Mr. Anthony. I'm glad to be a member of this team.",'Rất vui được gặp ông Anthony. Tôi rất vui khi trở thành một thành viên của nhóm.'],
        ['Mr. Anthony','Glad to have you here. Your main responsibility is developing programs. Besides that, you are also responsible for providing technical support for all the teams.','Rất vui khi có bạn ở đây. Trách nhiệm chính của bạn là phát triển chương trình. Ngoài ra, bạn cũng phụ trách hỗ trợ kỹ thuật cho tất cả các nhóm.'],
        ['Robert',"I got it. I'll do my best.",'Tôi hiểu rồi. Tôi sẽ cố gắng hết sức.'],
        ['Mr. Anthony','Also, we have Wade here to guide you in the first month. I will introduce you to him in a minute. Should you have any questions or concerns, please feel free to ask him or me.','Ngoài ra, Wade sẽ hướng dẫn bạn trong tháng đầu. Nếu có câu hỏi hay băn khoăn nào, cứ thoải mái hỏi anh ấy hoặc tôi.'],
        ['Robert',"That's very nice of you. Thank you, Mr. Anthony. May I ask a question?",'Ông thật tốt bụng. Tôi có thể hỏi một câu được không?'],
        ['Mr. Anthony','Sure, go ahead.','Chắc chắn rồi, bạn cứ hỏi đi.'],
        ['Robert','Is there training for new employees?','Có chương trình đào tạo cho nhân viên mới không ạ?'],
        ['Mr. Anthony',"Yes, we have a one-week training course for new arrivals. You'll meet new colleagues in that class. Do you have any other questions?",'Có, chúng tôi có khóa đào tạo một tuần cho người mới. Bạn sẽ gặp các đồng nghiệp mới trong lớp đó.'],
        ['Robert',"Not for the moment, I think. I'm ready to start working now.",'Hiện tại thì chưa. Tôi đã sẵn sàng bắt đầu làm việc.'],
        ['Mr. Anthony','Good. I believe you will adapt to the team in a couple of weeks.','Tốt. Tôi tin rằng bạn sẽ thích nghi với nhóm trong một vài tuần.']
      ],
      grammar:[
        ['excited vs comfortable','excited = phấn khích/hào hứng; comfortable = thoải mái/dễ chịu. Hai từ không đồng nghĩa. Ví dụ: I am excited about my birthday. / I feel comfortable at home.'],
        ['nervous vs worried','Hai từ gần nghĩa. nervous thường nhấn cảm giác căng thẳng/hồi hộp; worried nhấn sự lo lắng về một vấn đề. Mẫu: feel nervous · feel worried · be worried about...'],
        ['certain / sure ↔ uncertain','certain/sure = chắc chắn; uncertain/not sure/not certain = không chắc. Dùng be certain of/about sth; be uncertain about sth.'],
        ['Responsible for vs Responsibility','responsible là tính từ: be responsible for + N/V-ing. responsibility là danh từ: My main responsibility is + V-ing/N.'],
        ['go home vs arrive home','go home = đi về nhà; arrive home = về đến nhà. Trước home không dùng to/at.'],
        ['Yesterday → Past Simple','Kể việc hôm qua dùng quá khứ đơn: have → had, work → worked, arrive → arrived, go → went.'],
        ['It takes / It will take','Dùng để nói thời gian cần cho một việc: It takes time... / It will take a couple of weeks.'],
        ['Should you have...','Mẫu lịch sự nơi công sở: Should you have any questions... = If you have any questions...']
      ],
      speaking:[
        ['Teacher','How do you feel about your birthday?'],
        ['You','I feel excited about my birthday.'],
        ['Teacher','How do you feel when you are at home?'],
        ['You','I feel comfortable at home.'],
        ['Teacher','How do you feel when there is a problem in your work?'],
        ['You',"I feel nervous or worried when there's a problem in my work."],
        ['Teacher','What can you say when you are not sure about an answer?'],
        ['You','I am uncertain about my answer.'],
        ['Teacher','What is your responsibility in your job?'],
        ['You','I am responsible for providing furniture design.']
      ],
      extras:[
        ['Nhóm từ cần phân biệt','excited ≠ comfortable · nervous ≈ worried · certain/sure ↔ uncertain/not sure']
      ]
    },`;

  const IPA_LINES = String.raw`    'I feel excited about my birthday.':'/aɪ fiːl ɪkˈsaɪtɪd əˈbaʊt maɪ ˈbɜːrθdeɪ/',
    'I feel comfortable at home.':'/aɪ fiːl ˈkʌmftəbl æt hoʊm/',
    "I feel nervous when there's a problem in my work.":'/aɪ fiːl ˈnɜːrvəs wen ðerz ə ˈprɑːbləm ɪn maɪ wɜːrk/',
    'I feel worried because I did not finish my work.':'/aɪ fiːl ˈwɜːrid bɪˈkɔːz aɪ dɪd nɑːt ˈfɪnɪʃ maɪ wɜːrk/',
    'I am uncertain about my answer.':'/aɪ æm ʌnˈsɜːrtn əˈbaʊt maɪ ˈænsər/',
    'I am certain of my answer.':'/aɪ æm ˈsɜːrtn əv maɪ ˈænsər/',
    'Yesterday, I had a meeting and worked overtime, so I arrived home at 9 p.m.':'/ˈjestərdeɪ aɪ hæd ə ˈmiːtɪŋ ænd wɜːrkt ˈoʊvərtaɪm soʊ aɪ əˈraɪvd hoʊm æt naɪn piː em/',
    'In my job, I am responsible for providing furniture design.':'/ɪn maɪ dʒɑːb aɪ æm rɪˈspɑːnsəbl fər prəˈvaɪdɪŋ ˈfɜːrnɪtʃər dɪˈzaɪn/',`;

  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : String(input?.url || '');
    if (!/english-51talk-desktop-workspace-v1\.js(?:\?|$)/.test(url)) {
      return originalFetch(input, init);
    }

    // One-shot interception. Restore immediately so no other network path is affected.
    window.fetch = originalFetch;
    const response = await originalFetch(input, init);
    if (!response.ok) return response;

    let code = await response.text();
    const lessonAnchor = "  const LESSONS = {\n    health:";
    const ipaAnchor = "  const IPA = {\n";
    if (!code.includes(lessonAnchor)) return new Response(code, response);

    code = code.replace(lessonAnchor, `  const LESSONS = {\n${WORK_LESSON}\n    health:`);
    if (code.includes(ipaAnchor)) code = code.replace(ipaAnchor, `  const IPA = {\n${IPA_LINES}`);

    const inferOld = "function inferLesson(){const t=String(document.getElementById('studyTopicFilter')?.value||'').toLowerCase();if(/birthday|unit 1|u1/.test(t))return'birthday';if(/dad|appearance|unit 6|u6/.test(t))return'family';return null;}";
    const inferNew = "function inferLesson(){const t=String(document.getElementById('studyTopicFilter')?.value||'').toLowerCase();if(/class 158|work|communication/.test(t))return'work158';if(/birthday|unit 1|u1/.test(t))return'birthday';if(/dad|appearance|unit 6|u6/.test(t))return'family';return null;}";
    if (code.includes(inferOld)) code = code.replace(inferOld, inferNew);

    const headers = new Headers(response.headers);
    headers.set('content-type','application/javascript; charset=utf-8');
    headers.delete('content-length');
    headers.delete('content-encoding');
    return new Response(code, {status:response.status,statusText:response.statusText,headers});
  };
})();