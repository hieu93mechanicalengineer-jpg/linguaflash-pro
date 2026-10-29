/* LinguaFlash · 51Talk Mobile Lesson Mode v64
   Three lesson packs. Mobile-only and isolated from legacy flashcard/touch handlers.
   Added from user's two 6-page English summary PDFs:
   - Unit 1: My Birthday Is Coming!
   - Unit 6: You Look Just Like Your Dad
*/
(() => {
  'use strict';
  if (window.__LF51_MOBILE_LESSON_V64__) return;
  window.__LF51_MOBILE_LESSON_V64__ = true;

  const LESSONS = {
    health: {
      id:'health',
      unit:'BÀI HIỆN TẠI',
      title:'SỨC KHỎE & CÔNG VIỆC',
      subtitle:'Sức khỏe · Cảm lạnh · Công việc & thích nghi',
      stats:['16 từ/cụm','10 câu mẫu','Hội thoại Lily · Joe','6 chủ điểm ngữ pháp'],
      vocab:[
        ['look well','[lʊk wel]','Trông khỏe mạnh, thần sắc tốt',"S + look(s) / don't look + well. Khi nói về sức khỏe, well là tính từ.",'look healthy, look fine, be in good shape'],
        ['headache',"['hedeɪk]",'Cơn đau đầu, chứng nhức đầu','Dùng với mạo từ a: have a headache / have a terrible headache.','head pain, migraine'],
        ['umbrella',"[ʌm'brelə]",'Cái ô, cái dù che mưa','Dùng an umbrella; bring/take an umbrella with you.','rain shade, parasol'],
        ['catch a cold','[kætʃ ə kəʊld]','Bị cảm lạnh','Quá khứ: catch → caught a cold.','get a cold, come down with a cold'],
        ['take care of','[teɪk keə(r) əv]','Chăm sóc, trông nom','take care of + tân ngữ / đại từ phản thân.','look after, care for'],
        ['not feeling well / ill',"[nɒt 'fiːlɪŋ wel] / [ɪl]",'Cảm thấy không khỏe / bị ốm',"not feeling well = don't feel very good = be ill/sick.",'sick, unwell, under the weather'],
        ['have a (good) rest','[hæv ə ɡʊd rest]','Nghỉ ngơi','need to have a good rest / need some rest.','get some rest, take a break, relax'],
        ['take some medicine',"[teɪk sʌm 'medɪsn]",'Uống thuốc','Dùng take với medicine; không dùng drink/eat.','take pills, take medication'],
        ['go to the hospital',"[ɡəʊ tuː ðə 'hɒspɪtl]",'Đi bệnh viện, đi khám','Đối lập với stay at home.','see a doctor, visit a clinic'],
        ['heavy rain / get wet',"['hevi reɪn] / [ɡet wet]",'Mưa to / bị ướt','The rain was really heavy; I got all wet.','downpour / get soaked'],
        ['technical support',"['teknɪk(ə)l sə'pɔː(r)t]",'Hỗ trợ kỹ thuật','provide / offer technical support for/to clients.','tech support, IT support'],
        ['training',"['treɪnɪŋ]",'Sự đào tạo, huấn luyện','receive training in + lĩnh vực.','coaching, instruction'],
        ['employee',"[ɪm'plɔɪiː]",'Nhân viên','an employee of + tên công ty. Phân biệt employer.','worker, staff member'],
        ['adapt to',"[ə'dæpt tu]",'Thích nghi, làm quen với','adapt to + danh từ / V-ing.','adjust to, get used to'],
        ['a couple of',"[ə 'kʌp(ə)l əv]",'Hai / một vài','a couple of + danh từ số nhiều.','a few, two or three'],
        ['feel nervous / worried',"[fiːl 'nɜː(r)vəs] / ['wɜːrid]",'Cảm thấy lo lắng, hồi hộp','I feel nervous. You can also say I feel worried.','anxious, uneasy']
      ],
      examples:[
        ['look well',"You don't look well. What happened?",'Trông bạn không được khỏe. Đã có chuyện gì xảy ra vậy?'],
        ['headache','Jenny is not feeling well because she has a headache.','Jenny cảm thấy không khỏe vì cô ấy bị đau đầu.'],
        ['umbrella','It is raining outside. Remember to bring an umbrella.','Bên ngoài trời đang mưa. Hãy nhớ mang theo một chiếc ô.'],
        ['catch a cold','Daisy caught a cold yesterday. She needs some rest.','Hôm qua Daisy bị cảm lạnh. Cô ấy cần nghỉ ngơi một chút.'],
        ['take care of',"Lucy's husband is ill and she is taking care of him.",'Chồng của Lucy bị ốm và cô ấy đang chăm sóc anh ấy.'],
        ['technical support',"Mr. Smith's role is to provide technical support for the clients all over Europe.",'Vai trò của ông Smith là cung cấp hỗ trợ kỹ thuật cho khách hàng trên khắp châu Âu.'],
        ['training','On the course we received training in every aspect of the job.','Trong khóa học, chúng tôi được đào tạo về mọi khía cạnh của công việc.'],
        ['employee','Linda is an employee of Citibank in the States.','Linda là nhân viên của Citibank tại Hoa Kỳ.'],
        ['adapt to','It takes time for me to adapt to a new working environment.','Tôi cần thời gian để thích nghi với một môi trường làm việc mới.'],
        ['a couple of','A couple of months after I moved to London, I felt completely at home there.','Một vài tháng sau khi chuyển đến London, tôi cảm thấy hoàn toàn quen thuộc như ở nhà.']
      ],
      dialogue:[
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
      ],
      grammar:[
        ['1. Well và good sau động từ nối','Khi nói về sức khỏe, well có thể là tính từ sau look, feel, be. “You don’t look well.” / “Jenny is not feeling well.” / “I don’t feel very good.”'],
        ['2. Chủ ngữ giả It','It is + adjective + (for sb) + to V. It takes + time + for sb + to V. Ví dụ: It’s easy to catch a cold... / It takes time for me to adapt...'],
        ['3. V-ing làm chủ ngữ & make + O + V','Động từ làm chủ ngữ dùng V-ing. Sau make + tân ngữ dùng V nguyên mẫu không “to”: Drinking more water may make you feel better.'],
        ['4. Đại từ phản thân & cụm cố định','I → myself, you → yourself, he → himself, she → herself. Ghi nhớ on my way home (không dùng to home) và get all wet.'],
        ['5. Quá khứ đơn','Kể việc đã qua dùng V2/ed: went, started, got, was, caught, felt. Câu hỏi: Did + S + V nguyên mẫu: Did you take...?'],
        ['6. Mẫu câu luyện nói','Hai mẫu trọng tâm: “I have a...” và “Maybe I need to...”. Dùng cùng từ của bài để kể một tình huống sức khỏe.']
      ],
      speaking:[
        ['Teacher','Hi! When was the last time you caught a cold?'],
        ['You','It was a couple of months ago. I went out in the heavy rain without an umbrella and got all wet.'],
        ['Teacher','Oh no! How did you feel and what did you do?'],
        ['You',"I didn't feel well and I had a terrible headache. I went to the hospital, took some medicine, and stayed at home to have a good rest."]
      ],
      extras:[]
    },

    birthday: {
      id:'birthday',
      unit:'UNIT 1',
      title:'MY BIRTHDAY IS COMING!',
      subtitle:'Lesson 1: Cách hỏi và trả lời về Ngày tháng · Sinh nhật & Công việc',
      stats:['5 từ/cụm trọng tâm','12 tháng & số thứ tự','8 câu ví dụ & bài tập','6 chủ điểm ngữ pháp'],
      vocab:[
        ['today',"[tə'deɪ]",'Hôm nay, ngày hôm nay','Có thể đứng đầu câu làm chủ ngữ (Today is...) hoặc cuối câu làm trạng ngữ chỉ thời gian.','this day, nowadays'],
        ['date','[deɪt]','Ngày (ngày trong tháng / lịch)',"What's the date today? · the date of my birthday. Phân biệt date (ngày mấy) ≠ day (thứ mấy).",'calendar date'],
        ['May','[meɪ]','Tháng Năm (Tháng 5)','Luôn viết hoa. Dùng in May, nhưng on May 30th.','May 28th, May 30th'],
        ['be busy with',"[bi 'bɪzi wɪð]",'Bận rộn với (công việc / điều gì)','am/is/are/was + busy with + danh từ; hoặc busy + V-ing.','be occupied with, be tied up with'],
        ['the first one',"[ðə fɜː(r)st wʌn]",'Người đầu tiên','be the first one + to V.','the first person, the pioneer'],
        ['a big day','[ə bɪɡ deɪ]','Một ngày trọng đại / ngày quan trọng','Today is a big day for me.','an important day, a special day'],
        ['all the time / all day','[ɔːl ðə taɪm] / [ɔːl deɪ]','Suốt cả ngày, lúc nào cũng vậy','busy with his work all the time / all day.','constantly, throughout the day'],
        ['my birthday is coming',"['bɜː(r)θdeɪ ɪz 'kʌmɪŋ]",'Sinh nhật của tôi sắp đến rồi','Hiện tại tiếp diễn có thể nói về sự việc sắp xảy ra.','my birthday is coming soon'],
        ['only one week from your birthday','[ˈoʊnli wʌn wiːk frəm jʊr ˈbɜːrθdeɪ]','Chỉ còn đúng 1 tuần nữa là đến sinh nhật của bạn','It is only one week from your birthday.','one week until your birthday'],
        ['Oh dear!','[oʊ dɪr]','Ôi trời ơi! / Chết thật!','Cảm thán lịch sự khi ngạc nhiên hoặc chợt nhận ra điều gì.','Oh no!'],
        ['forgot all about it','[fərˈɡɑːt ɔːl əˈbaʊt ɪt]','Quên khuấy đi mất, quên sạch hoàn toàn về việc đó','forget → forgot.','completely forgot it']
      ],
      examples:[
        ['today','Today is a big day for me.','Hôm nay là một ngày trọng đại (rất quan trọng) đối với tôi.'],
        ['date','The date of my birthday is the 24th of this month.','Ngày sinh nhật của tôi là ngày 24 của tháng này.'],
        ['May',"My friend Tim's birthday is on May 30th.",'Sinh nhật của bạn tôi là Tim vào ngày 30 tháng 5.'],
        ['be busy with','Ben is busy with his work all the time.','Lúc nào Ben cũng bận rộn với công việc của anh ấy.'],
        ['the first one','Lee is the first one to finish the work.','Lee là người đầu tiên hoàn thành công việc.'],
        ['Bài 3.1','I am busy with my work all day.','Tôi bận rộn với công việc của mình suốt cả ngày.'],
        ['Bài 3.2','Erica is the first one to say happy birthday to me.','Erica là người đầu tiên nói lời chúc mừng sinh nhật với tôi.'],
        ['Bài 3.3',"What's the date today?",'Hôm nay là ngày mấy?']
      ],
      dialogue:[
        ['Tracy',"Betty, what's the date today?",'Betty ơi, hôm nay là ngày mấy nhỉ?'],
        ['Betty',"It's May 28th. Oh, it's only one week from your birthday.",'Hôm nay là ngày 28 tháng 5. Ồ, chỉ còn một tuần nữa là đến sinh nhật bạn rồi.'],
        ['Tracy','Oh dear! I was so busy with my work that I forgot all about it!','Ôi trời! Mình bận rộn với công việc quá đến nỗi quên khuấy đi mất!'],
        ['Betty','I must be the first one to say "Happy birthday" to you, right?','Chắc hẳn mình là người đầu tiên chúc mừng sinh nhật bạn, đúng không?'],
        ['Tracy','Yes, you are. Thank you, Betty.','Đúng vậy. Cảm ơn bạn nhé, Betty.'],
        ['Betty',"You're welcome.",'Không có chi đâu.']
      ],
      grammar:[
        ['1. “What’s the date?” và “What day is it?”','What’s the date today? hỏi ngày mấy trong tháng. What day is it today? hỏi thứ mấy trong tuần. Cách Mỹ: It’s May 28th. Cách Anh: the 24th of April.'],
        ['2. IN (tháng) và ON (ngày cụ thể)','IN + tháng/năm: My birthday is in May. ON + tháng + ngày cụ thể: Tim’s birthday is on May 30th.'],
        ['3. be busy with + Danh từ / be busy + V-ing','S + be + busy with + N: Ben is busy with his work. S + be + busy + V-ing: I am busy working all day.'],
        ['4. the first one + to V','Sau the first one, the second one, the last one dùng to + V: Lee is the first one to finish the work.'],
        ['5. so... that...','S + be/V + so + tính từ/trạng từ + that + S + V. Ví dụ: I was so busy with my work that I forgot all about it!'],
        ['6. must be & mẫu câu tổng kết','must + V có thể dùng để suy đoán chắc chắn: I must be the first one... Mẫu cần thuộc: What’s the date today? / What’s the date of your birthday?']
      ],
      speaking:[
        ['Teacher',"Hi! What's the date today?"],
        ['You',"It's October 29th. My birthday is coming soon!"],
        ['Teacher','Really? When is your birthday?'],
        ['You','The date of my birthday is on November 5th. I am busy with my work all week, so I will have a small party at home.'],
        ['Teacher','Happy early birthday to you!'],
        ['You','Thank you! You are the first one to say "Happy birthday" to me!']
      ],
      extras:[
        {
          title:'12 tháng trong năm',
          html:`<div class="lf51m-grid2">
            <div><b>1. January (Jan.)</b><span>['dʒænjuəri] · Tháng 1</span></div>
            <div><b>7. July (Jul.)</b><span>[dʒu'laɪ] · Tháng 7</span></div>
            <div><b>2. February (Feb.)</b><span>['februəri] · Tháng 2</span></div>
            <div><b>8. August (Aug.)</b><span>['ɔːɡəst] · Tháng 8</span></div>
            <div><b>3. March (Mar.)</b><span>[mɑː(r)tʃ] · Tháng 3</span></div>
            <div><b>9. September (Sep.)</b><span>[sep'tembə(r)] · Tháng 9</span></div>
            <div><b>4. April (Apr.)</b><span>['eɪprəl] · Tháng 4</span></div>
            <div><b>10. October (Oct.)</b><span>[ɒk'təʊbə(r)] · Tháng 10</span></div>
            <div><b>5. May</b><span>[meɪ] · Tháng 5</span></div>
            <div><b>11. November (Nov.)</b><span>[nəʊ'vembə(r)] · Tháng 11</span></div>
            <div><b>6. June (Jun.)</b><span>[dʒuːn] · Tháng 6</span></div>
            <div><b>12. December (Dec.)</b><span>[dɪ'sembə(r)] · Tháng 12</span></div>
          </div>`
        },
        {
          title:'Số thứ tự khi nói ngày trong tháng',
          html:`<p><b>Nhóm đặc biệt:</b> 1st (first) · 2nd (second) · 3rd (third) · 21st · 22nd · 23rd · 31st.</p>
                <p><b>Nhóm -th:</b> 24th (twenty-fourth) · 28th (twenty-eighth) · 30th (thirtieth). Lưu ý: 11th, 12th, 13th luôn dùng -th.</p>`
        }
      ]
    },

    family: {
      id:'family',
      unit:'UNIT 6',
      title:'YOU LOOK JUST LIKE YOUR DAD',
      subtitle:'Lesson 1: Miêu tả ngoại hình bản thân & So sánh nét giống nhau trong gia đình',
      stats:['5 từ/cụm trọng tâm','8 cụm mở rộng & so sánh','8 câu ví dụ & bài tập','6 chủ điểm ngữ pháp'],
      vocab:[
        ['fat','[fæt]','Béo, mập, mũm mĩm','Đứng sau to be (be fat) hoặc trước danh từ (a fat baby). So sánh hơn: fatter.','chubby, plump, overweight'],
        ['baby',"['beɪbi]",'Em bé, trẻ sơ sinh','Số nhiều: babies. Cụm: baby pictures.','infant, newborn, little child'],
        ['thin','[θɪn]','Gầy, mảnh mai, thon thả','be / become thin. So sánh hơn: thinner.','slim, slender, skinny'],
        ['taller than',"['tɔːlə(r) ðæn]",'Cao hơn (ai đó)','S1 + am/is/are + taller than + S2.','shorter than (trái nghĩa)'],
        ['super cute',"['suːpə(r) kjuːt]",'Siêu dễ thương, cực kỳ đáng yêu','super = very / really / extremely + cute.','adorable, lovely, charming, so cute'],
        ['look (just) like','[lʊk dʒʌst laɪk]','Trông (y) giống như, giống hệt','S + look(s) (just) like + người.','resemble, take after'],
        ['not ... any more','[nɒt ... ˌeni ˈmɔːr]','Không còn ... nữa',"I don't want to be fat any more.",'not ... anymore'],
        ['10 months old','[ten mʌnθs oʊld]','10 tháng tuổi','Có số 10 nên month thêm -s.',''],
        ['become + adjective','[bɪˈkʌm]','Trở nên, trở thành','becomes thin = trở nên gầy/thon thả.',''],
        ['by + V-ing','[baɪ]','Bằng cách làm gì đó','by running = bằng việc chạy bộ.',''],
        ['at that time','[æt ðæt taɪm]','Vào lúc đó, vào thời điểm đó','Dấu hiệu của quá khứ đơn trong bài.',''],
        ['nose / eyes','[nəʊz] / [aɪz]','Cái mũi / đôi mắt',"You have your mom's nose. / I have his eyes and nose.",'']
      ],
      examples:[
        ['fat',"I don't want to be fat any more.",'Tôi không muốn bị béo (mập) thêm nữa.'],
        ['baby','The baby is 10 months old now.','Em bé hiện giờ đã được 10 tháng tuổi.'],
        ['thin','Emily becomes thin by running.','Emily trở nên thon gầy nhờ việc chạy bộ.'],
        ['taller than','Bella is taller than her mother now.','Bella bây giờ đã cao hơn mẹ của cô ấy.'],
        ['super cute','The little dogs are super cute.','Những chú cún nhỏ siêu dễ thương.'],
        ['Bài 3.1','These little cats are super cute.','Những chú mèo nhỏ này cực kỳ đáng yêu.'],
        ['Bài 3.2','We are taller than our dad now.','Bây giờ chúng tôi đã cao hơn bố của mình.'],
        ['Bài 3.3','You look just like your mom in the picture.','Bạn trông giống hệt mẹ của bạn trong bức ảnh.']
      ],
      dialogue:[
        ['Jen','Wow, you were a fat baby at that time.','Chà, hồi đó bạn là một em bé mũm mĩm (béo) thật đấy.'],
        ['Adam','I know I was. But I am thinner now, and I am taller than my dad.','Mình biết mà. Nhưng bây giờ mình gầy hơn rồi, và mình còn cao hơn cả bố mình nữa.'],
        ['Jen','These are super cute baby pictures.','Đây đúng là những bức ảnh em bé siêu dễ thương.'],
        ['Adam',"Your baby pictures are super cute, too. You have your mom's nose.",'Ảnh hồi bé của bạn cũng siêu đáng yêu. Bạn có chiếc mũi giống mẹ của bạn.'],
        ['Jen','Yes, I do. You look just like your dad.','Đúng vậy. Còn bạn thì trông giống hệt bố của bạn.'],
        ['Adam','Yes, I have his eyes and nose.','Ừ, mình thừa hưởng đôi mắt và chiếc mũi của ông ấy.']
      ],
      grammar:[
        ['1. look (just) like & “Who do you look like?”','look like + danh từ/đại từ để nói ngoại hình giống ai. Thêm just để nhấn mạnh. Với động từ thường look, câu hỏi dùng do/does: Who do you look like in your family?'],
        ['2. So sánh hơn với tính từ ngắn','S1 + be + adj-er + than + S2. Ví dụ: Bella is taller than her mother now. Khi đối tượng so sánh đã rõ, có thể lược bỏ than: I am thinner now.'],
        ['3. become + Tính từ & by + V-ing','become + adjective diễn tả thay đổi trạng thái. by + V-ing diễn tả phương pháp: Emily becomes thin by running.'],
        ['4. not ... any more & cách nói tuổi',"S + don't/doesn't + V + ... + any more. Tuổi: be + số + month(s)/year(s) + old. Ví dụ: The baby is 10 months old now."],
        ['5. Nét giống bố mẹ: have + sở hữu + bộ phận','S + have/has + mom’s/dad’s hoặc his/her + bộ phận cơ thể. Ví dụ: You have your mom’s nose. / I have his eyes and nose.'],
        ['6. Quá khứ was/were & hiện tại am/is/are','Hồi nhỏ: You were a fat baby. → I know I was. Bây giờ: But I am thinner now, and I am taller than my dad.']
      ],
      speaking:[
        ['Teacher','Hi! Were you fat when you were a child?'],
        ['You · Cách 1','Yes, I was a fat baby at that time. But I am thinner now by playing sports!'],
        ['You · Cách 2',"No, I wasn't. I was thin when I was a child, and I am taller than my dad now."],
        ['Teacher','Who do you look like in your family?'],
        ['You','I look just like my dad. I have his eyes and nose!']
      ],
      extras:[
        {
          title:'Bảng tính từ ngoại hình & so sánh hơn',
          html:`<div class="lf51m-table">
            <div class="h"><b>Tính từ gốc</b><b>So sánh hơn</b><b>Quy tắc</b></div>
            <div><span>tall [tɔːl]</span><strong>taller than</strong><span>Thêm -er</span></div>
            <div><span>thin [θɪn]</span><strong>thinner (than)</strong><span>Gấp đôi n + -er</span></div>
            <div><span>fat [fæt]</span><strong>fatter (than)</strong><span>Gấp đôi t + -er</span></div>
            <div><span>cute [kjuːt]</span><strong>cuter (than)</strong><span>Tận cùng -e, thêm -r</span></div>
            <div><span>big [bɪɡ]</span><strong>bigger (than)</strong><span>Gấp đôi g + -er</span></div>
            <div><span>young [jʌŋ]</span><strong>younger than</strong><span>Thêm -er</span></div>
          </div>
          <p><b>Quy tắc CVC:</b> thin → thinner · fat → fatter · big → bigger · slim → slimmer.</p>`
        }
      ]
    }
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  let lessonId = (() => {
    try {
      const saved = localStorage.getItem('lf51_mobile_lesson_v64');
      return LESSONS[saved] ? saved : 'health';
    } catch (_) { return 'health'; }
  })();
  let tab = 'vocab';
  let reviewIndex = 0;
  let reveal = false;
  let direction = 'en-vi';

  function currentLesson(){ return LESSONS[lessonId] || LESSONS.health; }
  function reviewItems(){
    const L = currentLesson();
    return L.examples.map(x=>({type:'Câu mẫu',en:x[1],vi:x[2]}))
      .concat(L.vocab.map(x=>({type:'Từ vựng',en:x[0],vi:x[2],ipa:x[1]})));
  }
  function mobile(){ return window.matchMedia ? matchMedia('(max-width:760px)').matches : innerWidth <= 760; }

  function is51TalkActive(){
    if(!mobile()) return false;
    const lang = document.getElementById('studyLangFilter')?.value || '';
    if(lang !== 'Tiếng Anh') return false;
    const cat = document.getElementById('studyCategoryFilter')?.value || '';
    const topic = document.getElementById('studyTopicFilter')?.value || '';
    let card = null;
    try{ card = Array.isArray(filteredDeck) && filteredDeck.length ? filteredDeck[currentIndex] : null; }catch(_){}
    return /51Talk/i.test(cat) || /51Talk/i.test(topic) || String(card?.id||'').startsWith('en51_') || card?.category === '51Talk English';
  }

  function inferLessonFromFilter(){
    const topic = String(document.getElementById('studyTopicFilter')?.value || '').toLowerCase();
    if(/birthday|happy birthday|unit 1|u1/.test(topic)) return 'birthday';
    if(/dad|appearance|different appearance|unit 6|u6/.test(topic)) return 'family';
    return null;
  }

  function speak(text){
    if(!text) return;
    try{
      if(typeof window.lfSpeak51TalkEnglish === 'function'){
        window.lfSpeak51TalkEnglish(text);
        return;
      }
    }catch(_){}
    if(!('speechSynthesis' in window)) return;
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = .9;
      speechSynthesis.speak(u);
    }catch(_){}
  }

  function ensureStyle(){
    if(document.getElementById('lf51mStyleV64')) return;
    const s = document.createElement('style');
    s.id = 'lf51mStyleV64';
    s.textContent = `
      #lf51MobileLessonV64{display:none;width:min(100%,820px);margin:0 auto 18px;background:#f8fafc;color:#0f172a}
      #lf51MobileLessonV64.on{display:block}
      .lf51m-hero{background:#173b74;color:#fff;border-radius:20px;padding:16px;box-shadow:0 8px 22px rgba(15,23,42,.12)}
      .lf51m-k{font-size:.68rem;font-weight:900;color:#fde68a;letter-spacing:.06em}.lf51m-title{font-size:1.18rem;font-weight:950;margin-top:4px}
      .lf51m-sub{font-size:.78rem;color:#dbeafe;margin-top:4px;line-height:1.45}.lf51m-stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
      .lf51m-stats span{background:#0f2e5c;border-radius:8px;padding:5px 7px;font-size:.68rem;font-weight:800}
      .lf51m-lessons{display:flex;gap:8px;overflow-x:auto;padding:10px 2px 2px;scrollbar-width:none}.lf51m-lessons::-webkit-scrollbar,.lf51m-tabs::-webkit-scrollbar{display:none}
      .lf51m-lesson{flex:0 0 auto;min-height:48px;border:1px solid #cbd5e1;background:#fff;border-radius:13px;padding:8px 10px;text-align:left;color:#334155;touch-action:manipulation}
      .lf51m-lesson b{display:block;font-size:.73rem}.lf51m-lesson span{display:block;font-size:.64rem;color:#64748b;margin-top:2px}
      .lf51m-lesson.active{border-color:#2563eb;background:#eff6ff;color:#1d4ed8}
      .lf51m-tabs{display:flex;gap:7px;overflow:auto;padding:9px 2px 8px;scrollbar-width:none;position:sticky;top:0;z-index:15;background:rgba(248,250,252,.96);backdrop-filter:blur(8px)}
      .lf51m-tab{flex:0 0 auto;min-height:43px;border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:8px 10px;font-size:.77rem;font-weight:900;color:#475569;touch-action:manipulation}
      .lf51m-tab.active{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
      .lf51m-pane{display:none}.lf51m-pane.active{display:block}.lf51m-card,.lf51m-extra,.lf51m-review{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:12px;margin:0 0 9px}
      .lf51m-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.lf51m-word{font-size:1rem;font-weight:950;color:#0f3c78}.lf51m-ipa{font-size:.72rem;color:#64748b;margin-top:2px}
      .lf51m-mean{font-size:.84rem;font-weight:850;margin-top:8px}.lf51m-use,.lf51m-syn,.lf51m-vi{font-size:.75rem;line-height:1.5;color:#475569;margin-top:6px}.lf51m-syn b,.lf51m-use b{color:#1d4ed8}
      .lf51m-audio{flex:0 0 auto;border:0;background:#eff6ff;color:#1d4ed8;border-radius:10px;min-width:42px;min-height:42px;font-size:1rem;touch-action:manipulation}
      .lf51m-en{font-size:.88rem;font-weight:850;line-height:1.5}.lf51m-label{font-size:.67rem;font-weight:900;color:#d97706;text-transform:uppercase;margin-bottom:4px}
      .lf51m-dialogue{border-left:4px solid #2563eb}.lf51m-speaker{font-size:.72rem;font-weight:950;color:#1d4ed8;margin-bottom:4px}
      .lf51m-actions{display:flex;gap:7px;flex-wrap:wrap;margin:6px 0 10px}.lf51m-btn{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:11px;min-height:42px;padding:8px 11px;font-weight:850;touch-action:manipulation}
      .lf51m-btn.primary{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
      .lf51m-grammar details{background:#fff;border:1px solid #e2e8f0;border-radius:13px;margin-bottom:8px;padding:0 11px}.lf51m-grammar summary{padding:12px 0;font-size:.82rem;font-weight:900;cursor:pointer}.lf51m-grammar p{font-size:.76rem;color:#475569;line-height:1.55;margin:0 0 12px}
      .lf51m-extra h3{font-size:.86rem;margin:0 0 9px;color:#0f3c78}.lf51m-extra p{font-size:.75rem;line-height:1.55;color:#475569}
      .lf51m-grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px}.lf51m-grid2>div{border:1px solid #e2e8f0;border-radius:9px;padding:7px}.lf51m-grid2 b{font-size:.7rem}.lf51m-grid2 span{display:block;font-size:.65rem;color:#64748b;margin-top:2px}
      .lf51m-table{display:grid;gap:4px}.lf51m-table>div{display:grid;grid-template-columns:1.05fr 1.1fr 1.1fr;gap:5px;border-bottom:1px solid #e2e8f0;padding:6px 3px;font-size:.68rem}.lf51m-table .h{background:#173b74;color:#fff;border-radius:8px;padding:7px}.lf51m-table strong{color:#1d4ed8}
      .lf51m-review{text-align:center;padding:18px 13px}.lf51m-review-type{font-size:.68rem;font-weight:900;color:#d97706}.lf51m-review-q{font-size:1.05rem;font-weight:950;line-height:1.45;margin:12px 0}.lf51m-review-a{font-size:.84rem;color:#475569;line-height:1.5;padding:10px;background:#f8fafc;border-radius:10px}
      body.lf51-lesson-v64-active #flashcardContainer,
      body.lf51-lesson-v64-active #studyAnswerPanel,
      body.lf51-lesson-v64-active #lf51CoachShell,
      body.lf51-lesson-v64-active #lf51GrammarPanel,
      body.lf51-lesson-v64-active #lf51PatternPractice,
      body.lf51-lesson-v64-active #lf51Listening{display:none!important}
      @media(max-width:760px){
        body.lf51-lesson-v64-active{padding-bottom:100px!important}
        #lf51MobileLessonV64{padding:0 2px}.lf51m-hero{border-radius:16px;padding:14px}
        .lf51m-grid2{grid-template-columns:1fr}.lf51m-table>div{grid-template-columns:1fr 1fr 1fr;font-size:.64rem}
        .lf51m-title{font-size:1.08rem}.lf51m-sub{font-size:.74rem}
      }`;
    document.head.appendChild(s);
  }

  function ensureRoot(){
    let r = document.getElementById('lf51MobileLessonV64');
    if(r) return r;
    const flash = document.getElementById('flashcardContainer');
    if(!flash) return null;
    r = document.createElement('section');
    r.id = 'lf51MobileLessonV64';
    flash.parentElement?.insertBefore(r, flash);
    return r;
  }

  function renderVocab(L){
    const extras = (L.extras||[]).map(x => `<section class="lf51m-extra"><h3>${esc(x.title)}</h3>${x.html}</section>`).join('');
    return L.vocab.map(v=>`
      <article class="lf51m-card">
        <div class="lf51m-row">
          <div><div class="lf51m-word">${esc(v[0])}</div><div class="lf51m-ipa">${esc(v[1])}</div></div>
          <button class="lf51m-audio" type="button" data-audio="${esc(v[0])}" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="lf51m-mean">${esc(v[2])}</div>
        ${v[3]?`<div class="lf51m-use"><b>Cách dùng:</b> ${esc(v[3])}</div>`:''}
        ${v[4]?`<div class="lf51m-syn"><b>Đồng nghĩa / ghi chú:</b> ${esc(v[4])}</div>`:''}
      </article>`).join('') + extras;
  }

  function renderExamples(L){
    return L.examples.map(e=>`
      <article class="lf51m-card">
        <div class="lf51m-row">
          <div><div class="lf51m-label">${esc(e[0])}</div><div class="lf51m-en">${esc(e[1])}</div></div>
          <button class="lf51m-audio" type="button" data-audio="${esc(e[1])}">🔊</button>
        </div>
        <div class="lf51m-vi">${esc(e[2])}</div>
      </article>`).join('');
  }

  function renderDialogue(L){
    return `<div class="lf51m-actions"><button class="lf51m-btn primary" type="button" data-play-dialogue>▶ Nghe toàn bộ hội thoại</button></div>` +
      L.dialogue.map(d=>`
        <article class="lf51m-card lf51m-dialogue">
          <div class="lf51m-row">
            <div><div class="lf51m-speaker">${esc(d[0])}</div><div class="lf51m-en">${esc(d[1])}</div></div>
            <button class="lf51m-audio" type="button" data-audio="${esc(d[1])}">🔊</button>
          </div>
          <div class="lf51m-vi">${esc(d[2])}</div>
        </article>`).join('');
  }

  function renderGrammar(L){
    return `<div class="lf51m-grammar">` + L.grammar.map((g,i)=>`
      <details ${i===0?'open':''}><summary>${esc(g[0])}</summary><p>${esc(g[1])}</p></details>`).join('') + `</div>`;
  }

  function renderSpeaking(L){
    return `<div class="lf51m-actions"><button class="lf51m-btn primary" type="button" data-play-speaking>▶ Nghe kịch bản</button></div>` +
      L.speaking.map(s=>`
        <article class="lf51m-card">
          <div class="lf51m-row">
            <div><div class="lf51m-speaker">${esc(s[0])}</div><div class="lf51m-en">${esc(s[1])}</div></div>
            <button class="lf51m-audio" type="button" data-audio="${esc(s[1])}">🔊</button>
          </div>
        </article>`).join('');
  }

  function renderReview(){
    const items = reviewItems();
    if(!items.length) return '';
    reviewIndex = Math.max(0, Math.min(reviewIndex, items.length-1));
    const x = items[reviewIndex];
    const q = direction === 'en-vi' ? x.en : x.vi;
    const a = direction === 'en-vi' ? x.vi : x.en;
    return `
      <div class="lf51m-review">
        <div class="lf51m-review-type">${esc(x.type)} · ${reviewIndex+1}/${items.length}</div>
        <div class="lf51m-review-q">${esc(q)}</div>
        ${reveal?`<div class="lf51m-review-a">${esc(a)}</div>`:''}
        <div class="lf51m-actions" style="justify-content:center;margin-top:12px">
          <button class="lf51m-btn" type="button" data-prev>← Trước</button>
          <button class="lf51m-btn primary" type="button" data-reveal>${reveal?'Ẩn đáp án':'Hiện đáp án'}</button>
          <button class="lf51m-btn" type="button" data-next>Tiếp →</button>
        </div>
        <div class="lf51m-actions" style="justify-content:center">
          <button class="lf51m-btn" type="button" data-dir>${direction==='en-vi'?'EN → VI':'VI → EN'}</button>
          ${direction==='en-vi'?`<button class="lf51m-btn" type="button" data-audio="${esc(x.en)}">🔊 Nghe</button>`:''}
        </div>
      </div>`;
  }

  function render(){
    const r = ensureRoot();
    if(!r) return;
    const L = currentLesson();
    const lessonBtns = Object.values(LESSONS).map(x=>`
      <button class="lf51m-lesson ${x.id===lessonId?'active':''}" type="button" data-lesson="${x.id}">
        <b>${esc(x.unit)} · ${esc(x.title)}</b><span>${esc(x.subtitle)}</span>
      </button>`).join('');
    const tabs = [
      ['vocab','📚 Từ vựng'],['examples','📝 Câu mẫu'],['dialogue','💬 Hội thoại'],
      ['grammar','📘 Ngữ pháp'],['speaking','🗣️ Luyện nói'],['review','🧠 Ôn nhanh']
    ];
    r.innerHTML = `
      <header class="lf51m-hero">
        <div class="lf51m-k">51TALK CLASSIC ENGLISH V3.0 · LEVEL 2</div>
        <div class="lf51m-title">${esc(L.unit)} · ${esc(L.title)}</div>
        <div class="lf51m-sub">${esc(L.subtitle)}</div>
        <div class="lf51m-stats">${L.stats.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
      </header>
      <nav class="lf51m-lessons" aria-label="Chọn bài học">${lessonBtns}</nav>
      <nav class="lf51m-tabs" aria-label="Nội dung bài học">
        ${tabs.map(x=>`<button class="lf51m-tab ${tab===x[0]?'active':''}" type="button" data-tab="${x[0]}">${x[1]}</button>`).join('')}
      </nav>
      <section class="lf51m-pane ${tab==='vocab'?'active':''}">${renderVocab(L)}</section>
      <section class="lf51m-pane ${tab==='examples'?'active':''}">${renderExamples(L)}</section>
      <section class="lf51m-pane ${tab==='dialogue'?'active':''}">${renderDialogue(L)}</section>
      <section class="lf51m-pane ${tab==='grammar'?'active':''}">${renderGrammar(L)}</section>
      <section class="lf51m-pane ${tab==='speaking'?'active':''}">${renderSpeaking(L)}</section>
      <section class="lf51m-pane ${tab==='review'?'active':''}">${renderReview()}</section>`;
  }

  function playSequence(lines){
    if(!('speechSynthesis' in window)){
      if(lines[0]) speak(lines[0]);
      return;
    }
    try{
      speechSynthesis.cancel();
      let i = 0;
      const next = () => {
        if(i >= lines.length) return;
        const u = new SpeechSynthesisUtterance(lines[i++]);
        u.lang='en-US'; u.rate=.9; u.onend=next;
        speechSynthesis.speak(u);
      };
      next();
    }catch(_){ if(lines[0]) speak(lines[0]); }
  }

  function bind(){
    const r = ensureRoot();
    if(!r || r.dataset.bound === '1') return;
    r.dataset.bound = '1';
    r.addEventListener('click', e=>{
      const lessonBtn = e.target.closest('[data-lesson]');
      if(lessonBtn){
        lessonId = lessonBtn.dataset.lesson;
        try{localStorage.setItem('lf51_mobile_lesson_v64', lessonId);}catch(_){}
        reviewIndex=0; reveal=false; tab='vocab'; render(); return;
      }
      const tabBtn = e.target.closest('[data-tab]');
      if(tabBtn){ tab=tabBtn.dataset.tab; render(); return; }
      const audio = e.target.closest('[data-audio]');
      if(audio){ speak(audio.dataset.audio); return; }
      if(e.target.closest('[data-play-dialogue]')){ playSequence(currentLesson().dialogue.map(x=>x[1])); return; }
      if(e.target.closest('[data-play-speaking]')){ playSequence(currentLesson().speaking.map(x=>x[1])); return; }
      const items = reviewItems();
      if(e.target.closest('[data-prev]')){ reviewIndex=(reviewIndex-1+items.length)%items.length; reveal=false; render(); return; }
      if(e.target.closest('[data-next]')){ reviewIndex=(reviewIndex+1)%items.length; reveal=false; render(); return; }
      if(e.target.closest('[data-reveal]')){ reveal=!reveal; render(); return; }
      if(e.target.closest('[data-dir]')){ direction=direction==='en-vi'?'vi-en':'en-vi'; reveal=false; render(); return; }
    });
  }

  function sync(){
    ensureStyle();
    const r = ensureRoot();
    if(!r) return;
    const on = is51TalkActive();
    r.classList.toggle('on', on);
    document.body.classList.toggle('lf51-lesson-v64-active', on);
    if(!on) return;

    const inferred = inferLessonFromFilter();
    if(inferred && inferred !== lessonId){
      lessonId = inferred;
      reviewIndex = 0; reveal = false; tab = 'vocab';
      try{localStorage.setItem('lf51_mobile_lesson_v64', lessonId);}catch(_){}
      render();
    } else if(!r.innerHTML.trim()){
      render();
    }
  }

  function init(){
    ensureStyle();
    ensureRoot();
    bind();
    ['studyLangFilter','studyCategoryFilter','studyTopicFilter'].forEach(id=>{
      document.getElementById(id)?.addEventListener('change',()=>setTimeout(sync,0));
    });
    addEventListener('resize',()=>setTimeout(sync,50),{passive:true});
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) setTimeout(sync,50); });
    render();
    sync();
    setInterval(sync,1200);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
