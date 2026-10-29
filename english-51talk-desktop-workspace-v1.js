/* LinguaFlash · 51Talk Desktop Workspace v1
   Desktop-first redesign approved by user.
   Goal: keep the whole English lesson in one workspace instead of a long page.
*/
(() => {
  'use strict';
  if (window.__LF51_DESKTOP_WORKSPACE_V1__) return;
  window.__LF51_DESKTOP_WORKSPACE_V1__ = true;

  const LESSONS = {
    health: {
      id:'health', unit:'BÀI HIỆN TẠI', title:'SỨC KHỎE & CÔNG VIỆC',
      subtitle:'Sức khỏe · Cảm lạnh · Công việc & thích nghi',
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
        ['Well và good sau động từ nối','Khi nói về sức khỏe, well có thể là tính từ sau look, feel, be. “You don’t look well.” / “Jenny is not feeling well.” / “I don’t feel very good.”'],
        ['Chủ ngữ giả It','It is + adjective + (for sb) + to V. It takes + time + for sb + to V. Ví dụ: It’s easy to catch a cold... / It takes time for me to adapt...'],
        ['V-ing làm chủ ngữ & make + O + V','Động từ làm chủ ngữ dùng V-ing. Sau make + tân ngữ dùng V nguyên mẫu không “to”: Drinking more water may make you feel better.'],
        ['Đại từ phản thân & cụm cố định','I → myself, you → yourself, he → himself, she → herself. Ghi nhớ on my way home và get all wet.'],
        ['Quá khứ đơn','Kể việc đã qua dùng V2/ed: went, started, got, was, caught, felt. Câu hỏi: Did + S + V nguyên mẫu: Did you take...?'],
        ['Mẫu câu luyện nói','Hai mẫu trọng tâm: “I have a...” và “Maybe I need to...”. Dùng cùng từ của bài để kể một tình huống sức khỏe.']
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
      id:'birthday', unit:'UNIT 1', title:'MY BIRTHDAY IS COMING!',
      subtitle:'Lesson 1: Cách hỏi và trả lời về Ngày tháng · Sinh nhật & Công việc',
      vocab:[
        ['today',"[tə'deɪ]",'Hôm nay, ngày hôm nay','Có thể đứng đầu câu làm chủ ngữ (Today is...) hoặc cuối câu làm trạng ngữ chỉ thời gian.','this day, nowadays'],
        ['date','[deɪt]','Ngày (ngày trong tháng / lịch)',"What's the date today? · the date of my birthday. Phân biệt date ≠ day.",'calendar date'],
        ['May','[meɪ]','Tháng Năm (Tháng 5)','Luôn viết hoa. Dùng in May, nhưng on May 30th.','May 28th, May 30th'],
        ['be busy with',"[bi 'bɪzi wɪð]",'Bận rộn với (công việc / điều gì)','am/is/are/was + busy with + danh từ; hoặc busy + V-ing.','be occupied with, be tied up with'],
        ['the first one',"[ðə fɜː(r)st wʌn]",'Người đầu tiên','be the first one + to V.','the first person, the pioneer'],
        ['a big day','[ə bɪɡ deɪ]','Một ngày trọng đại / ngày quan trọng','Today is a big day for me.','an important day, a special day'],
        ['all the time / all day','[ɔːl ðə taɪm] / [ɔːl deɪ]','Suốt cả ngày, lúc nào cũng vậy','busy with his work all the time / all day.','constantly, throughout the day'],
        ['my birthday is coming',"['bɜː(r)θdeɪ ɪz 'kʌmɪŋ]",'Sinh nhật của tôi sắp đến rồi','Hiện tại tiếp diễn có thể nói về sự việc sắp xảy ra.','my birthday is coming soon'],
        ['only one week from your birthday','[ˈoʊnli wʌn wiːk frəm jʊr ˈbɜːrθdeɪ]','Chỉ còn đúng 1 tuần nữa là đến sinh nhật của bạn','It is only one week from your birthday.','one week until your birthday'],
        ['Oh dear!','[oʊ dɪr]','Ôi trời ơi! / Chết thật!','Cảm thán lịch sự khi ngạc nhiên hoặc chợt nhận ra điều gì.','Oh no!'],
        ['forgot all about it','[fərˈɡɑːt ɔːl əˈbaʊt ɪt]','Quên khuấy đi mất','forget → forgot.','completely forgot it']
      ],
      examples:[
        ['today','Today is a big day for me.','Hôm nay là một ngày trọng đại đối với tôi.'],
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
        ['“What’s the date?” và “What day is it?”','What’s the date today? hỏi ngày mấy trong tháng. What day is it today? hỏi thứ mấy trong tuần. Cách Mỹ: It’s May 28th. Cách Anh: the 24th of April.'],
        ['IN (tháng) và ON (ngày cụ thể)','IN + tháng/năm: My birthday is in May. ON + tháng + ngày cụ thể: Tim’s birthday is on May 30th.'],
        ['be busy with + Danh từ / be busy + V-ing','S + be + busy with + N: Ben is busy with his work. S + be + busy + V-ing: I am busy working all day.'],
        ['the first one + to V','Sau the first one, the second one, the last one dùng to + V: Lee is the first one to finish the work.'],
        ['so... that...','S + be/V + so + tính từ/trạng từ + that + S + V. Ví dụ: I was so busy with my work that I forgot all about it!'],
        ['must be & mẫu câu tổng kết','must + V có thể dùng để suy đoán chắc chắn. Mẫu cần thuộc: What’s the date today? / What’s the date of your birthday?']
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
        ['12 tháng trong năm','January · February · March · April · May · June · July · August · September · October · November · December'],
        ['Số thứ tự khi nói ngày','1st first · 2nd second · 3rd third · 21st · 22nd · 23rd · 24th · 28th · 30th · 31st. 11th, 12th, 13th luôn dùng -th.']
      ]
    },
    family: {
      id:'family', unit:'UNIT 6', title:'YOU LOOK JUST LIKE YOUR DAD',
      subtitle:'Lesson 1: Miêu tả ngoại hình bản thân & So sánh nét giống nhau trong gia đình',
      vocab:[
        ['fat','[fæt]','Béo, mập, mũm mĩm','Đứng sau to be hoặc trước danh từ. So sánh hơn: fatter.','chubby, plump, overweight'],
        ['baby',"['beɪbi]",'Em bé, trẻ sơ sinh','Số nhiều: babies. Cụm: baby pictures.','infant, newborn, little child'],
        ['thin','[θɪn]','Gầy, mảnh mai, thon thả','be / become thin. So sánh hơn: thinner.','slim, slender, skinny'],
        ['taller than',"['tɔːlə(r) ðæn]",'Cao hơn (ai đó)','S1 + am/is/are + taller than + S2.','shorter than'],
        ['super cute',"['suːpə(r) kjuːt]",'Siêu dễ thương, cực kỳ đáng yêu','super = very / really / extremely + cute.','adorable, lovely, charming'],
        ['look (just) like','[lʊk dʒʌst laɪk]','Trông giống như, giống hệt','S + look(s) (just) like + người.','resemble, take after'],
        ['not ... any more','[nɒt ... ˌeni ˈmɔːr]','Không còn ... nữa',"I don't want to be fat any more.",'not ... anymore'],
        ['10 months old','[ten mʌnθs oʊld]','10 tháng tuổi','Có số 10 nên month thêm -s.',''],
        ['become + adjective','[bɪˈkʌm]','Trở nên, trở thành','becomes thin = trở nên gầy/thon thả.',''],
        ['by + V-ing','[baɪ]','Bằng cách làm gì đó','by running = bằng việc chạy bộ.',''],
        ['at that time','[æt ðæt taɪm]','Vào lúc đó, vào thời điểm đó','Dấu hiệu của quá khứ đơn trong bài.',''],
        ['nose / eyes','[nəʊz] / [aɪz]','Cái mũi / đôi mắt',"You have your mom's nose. / I have his eyes and nose.",'']
      ],
      examples:[
        ['fat',"I don't want to be fat any more.",'Tôi không muốn bị béo thêm nữa.'],
        ['baby','The baby is 10 months old now.','Em bé hiện giờ đã được 10 tháng tuổi.'],
        ['thin','Emily becomes thin by running.','Emily trở nên thon gầy nhờ việc chạy bộ.'],
        ['taller than','Bella is taller than her mother now.','Bella bây giờ đã cao hơn mẹ của cô ấy.'],
        ['super cute','The little dogs are super cute.','Những chú cún nhỏ siêu dễ thương.'],
        ['Bài 3.1','These little cats are super cute.','Những chú mèo nhỏ này cực kỳ đáng yêu.'],
        ['Bài 3.2','We are taller than our dad now.','Bây giờ chúng tôi đã cao hơn bố của mình.'],
        ['Bài 3.3','You look just like your mom in the picture.','Bạn trông giống hệt mẹ của bạn trong bức ảnh.']
      ],
      dialogue:[
        ['Jen','Wow, you were a fat baby at that time.','Chà, hồi đó bạn là một em bé mũm mĩm thật đấy.'],
        ['Adam','I know I was. But I am thinner now, and I am taller than my dad.','Mình biết mà. Nhưng bây giờ mình gầy hơn rồi, và mình còn cao hơn cả bố mình nữa.'],
        ['Jen','These are super cute baby pictures.','Đây đúng là những bức ảnh em bé siêu dễ thương.'],
        ['Adam',"Your baby pictures are super cute, too. You have your mom's nose.",'Ảnh hồi bé của bạn cũng siêu đáng yêu. Bạn có chiếc mũi giống mẹ của bạn.'],
        ['Jen','Yes, I do. You look just like your dad.','Đúng vậy. Còn bạn thì trông giống hệt bố của bạn.'],
        ['Adam','Yes, I have his eyes and nose.','Ừ, mình thừa hưởng đôi mắt và chiếc mũi của ông ấy.']
      ],
      grammar:[
        ['look (just) like & “Who do you look like?”','look like + danh từ/đại từ để nói ngoại hình giống ai. Thêm just để nhấn mạnh. Câu hỏi dùng do/does: Who do you look like in your family?'],
        ['So sánh hơn với tính từ ngắn','S1 + be + adj-er + than + S2. Ví dụ: Bella is taller than her mother now. Khi đối tượng so sánh đã rõ, có thể lược bỏ than: I am thinner now.'],
        ['become + Tính từ & by + V-ing','become + adjective diễn tả thay đổi trạng thái. by + V-ing diễn tả phương pháp: Emily becomes thin by running.'],
        ['not ... any more & cách nói tuổi',"S + don't/doesn't + V + ... + any more. Tuổi: be + số + month(s)/year(s) + old."],
        ['Nét giống bố mẹ: have + sở hữu + bộ phận','S + have/has + mom’s/dad’s hoặc his/her + bộ phận cơ thể. Ví dụ: You have your mom’s nose.'],
        ['Quá khứ was/were & hiện tại am/is/are','Hồi nhỏ: You were a fat baby. → I know I was. Bây giờ: But I am thinner now, and I am taller than my dad.']
      ],
      speaking:[
        ['Teacher','Hi! Were you fat when you were a child?'],
        ['You · Cách 1','Yes, I was a fat baby at that time. But I am thinner now by playing sports!'],
        ['You · Cách 2',"No, I wasn't. I was thin when I was a child, and I am taller than my dad now."],
        ['Teacher','Who do you look like in your family?'],
        ['You','I look just like my dad. I have his eyes and nose!']
      ],
      extras:[
        ['Bảng tính từ & so sánh hơn','tall → taller than · thin → thinner · fat → fatter · cute → cuter · big → bigger · young → younger than. Quy tắc CVC: thin → thinner, fat → fatter, big → bigger, slim → slimmer.']
      ]
    }
  };

  const IPA = {
    "You don't look well. What happened?":'/ju doʊnt lʊk wel | wʌt ˈhæpənd/',
    'Jenny is not feeling well because she has a headache.':'/ˈdʒeni ɪz nɑːt ˈfiːlɪŋ wel bɪˈkɔːz ʃi hæz ə ˈhedeɪk/',
    'It is raining outside. Remember to bring an umbrella.':'/ɪt ɪz ˈreɪnɪŋ ˌaʊtˈsaɪd | rɪˈmembər tə brɪŋ ən ʌmˈbrelə/',
    'Daisy caught a cold yesterday. She needs some rest.':'/ˈdeɪzi kɔːt ə koʊld ˈjestərdeɪ | ʃi niːdz sʌm rest/',
    "Lucy's husband is ill and she is taking care of him.":'/ˈluːsiz ˈhʌzbənd ɪz ɪl ænd ʃi ɪz ˈteɪkɪŋ ker əv hɪm/',
    "Mr. Smith's role is to provide technical support for the clients all over Europe.":'/ˌmɪstər ˈsmɪθs roʊl ɪz tə prəˈvaɪd ˈteknɪkəl səˈpɔːrt fər ðə ˈklaɪənts ɔːl ˈoʊvər ˈjʊrəp/',
    'On the course we received training in every aspect of the job.':'/ɑːn ðə kɔːrs wi rɪˈsiːvd ˈtreɪnɪŋ ɪn ˈevri ˈæspekt əv ðə dʒɑːb/',
    'Linda is an employee of Citibank in the States.':'/ˈlɪndə ɪz ən ɪmˈplɔɪiː əv ˈsɪtibæŋk ɪn ðə steɪts/',
    'It takes time for me to adapt to a new working environment.':'/ɪt teɪks taɪm fər mi tə əˈdæpt tə ə nuː ˈwɜːrkɪŋ ɪnˈvaɪrənmənt/',
    'A couple of months after I moved to London, I felt completely at home there.':'/ə ˈkʌpəl əv mʌnθs ˈæftər aɪ muːvd tə ˈlʌndən | aɪ felt kəmˈpliːtli æt hoʊm ðer/',
    'Today is a big day for me.':'/təˈdeɪ ɪz ə bɪɡ deɪ fər miː/',
    'The date of my birthday is the 24th of this month.':'/ðə deɪt əv maɪ ˈbɜːrθdeɪ ɪz ðə ˌtwenti ˈfɔːrθ əv ðɪs mʌnθ/',
    "My friend Tim's birthday is on May 30th.":'/maɪ frend tɪmz ˈbɜːrθdeɪ ɪz ɑːn meɪ ˈθɜːrtiəθ/',
    'Ben is busy with his work all the time.':'/ben ɪz ˈbɪzi wɪð hɪz wɜːrk ɔːl ðə taɪm/',
    'Lee is the first one to finish the work.':'/liː ɪz ðə fɜːrst wʌn tə ˈfɪnɪʃ ðə wɜːrk/',
    'I am busy with my work all day.':'/aɪ æm ˈbɪzi wɪð maɪ wɜːrk ɔːl deɪ/',
    'Erica is the first one to say happy birthday to me.':'/ˈerɪkə ɪz ðə fɜːrst wʌn tə seɪ ˈhæpi ˈbɜːrθdeɪ tə miː/',
    "What's the date today?":'/wʌts ðə deɪt təˈdeɪ/',
    "I don't want to be fat any more.":'/aɪ doʊnt wɑːnt tə biː fæt ˌeniˈmɔːr/',
    'The baby is 10 months old now.':'/ðə ˈbeɪbi ɪz ten mʌnθs oʊld naʊ/',
    'Emily becomes thin by running.':'/ˈeməli bɪˈkʌmz θɪn baɪ ˈrʌnɪŋ/',
    'Bella is taller than her mother now.':'/ˈbelə ɪz ˈtɔːlər ðæn hər ˈmʌðər naʊ/',
    'The little dogs are super cute.':'/ðə ˈlɪtəl dɔːɡz ɑːr ˈsuːpər kjuːt/',
    'These little cats are super cute.':'/ðiːz ˈlɪtəl kæts ɑːr ˈsuːpər kjuːt/',
    'We are taller than our dad now.':'/wiː ɑːr ˈtɔːlər ðæn aʊər dæd naʊ/',
    'You look just like your mom in the picture.':'/juː lʊk dʒʌst laɪk jʊr mɑːm ɪn ðə ˈpɪktʃər/'
  };

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[’']/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
  const state={lesson:'birthday',tab:'vocab',vocab:0,example:0,grammar:0,speaking:0,review:0,reveal:false,showTranslation:true,tool:'coach',dialogueLine:0};
  let recognition=null;

  function L(){return LESSONS[state.lesson]||LESSONS.birthday;}
  function desktop(){return window.matchMedia?matchMedia('(min-width:900px)').matches:innerWidth>=900;}
  function active(){
    if(!desktop()) return false;
    const lang=document.getElementById('studyLangFilter')?.value||'';
    if(lang!=='Tiếng Anh') return false;
    const cat=document.getElementById('studyCategoryFilter')?.value||'';
    const topic=document.getElementById('studyTopicFilter')?.value||'';
    let card=null;try{card=Array.isArray(filteredDeck)&&filteredDeck.length?filteredDeck[currentIndex]:null;}catch(_){}
    return /51Talk/i.test(cat)||/51Talk/i.test(topic)||String(card?.id||'').startsWith('en51_')||card?.category==='51Talk English';
  }
  function inferLesson(){const t=String(document.getElementById('studyTopicFilter')?.value||'').toLowerCase();if(/birthday|unit 1|u1/.test(t))return'birthday';if(/dad|appearance|unit 6|u6/.test(t))return'family';return null;}
  function speak(text,rate=1){if(!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;speechSynthesis.speak(u);}catch(_){try{window.lfSpeak51TalkEnglish?.(text);}catch(__){}}}
  function playSequence(lines){if(!('speechSynthesis'in window))return;try{speechSynthesis.cancel();let i=0;const n=()=>{if(i>=lines.length)return;const u=new SpeechSynthesisUtterance(lines[i++]);u.lang='en-US';u.rate=.92;u.onend=n;speechSynthesis.speak(u)};n();}catch(_){}}
  function reviewItems(){return L().examples.map(x=>({type:'Câu mẫu',en:x[1],vi:x[2]})).concat(L().vocab.map(x=>({type:'Từ vựng',en:x[0],vi:x[2],ipa:x[1]})));}
  function learnedKey(){return `${state.lesson}:${state.tab}:${state.tab==='vocab'?state.vocab:state.tab==='examples'?state.example:state.tab==='grammar'?state.grammar:state.tab==='speaking'?state.speaking:state.review}`;}
  function learnedSet(){try{return new Set(JSON.parse(localStorage.getItem('lf51_desktop_learned_v1')||'[]'));}catch(_){return new Set();}}
  function isLearned(){return learnedSet().has(learnedKey());}
  function toggleLearned(){const s=learnedSet(),k=learnedKey();s.has(k)?s.delete(k):s.add(k);try{localStorage.setItem('lf51_desktop_learned_v1',JSON.stringify([...s]));}catch(_){}render();}
  function noteKey(){return `lf51_note_v1_${state.lesson}_${state.tab}`;}
  function noteValue(){try{return localStorage.getItem(noteKey())||'';}catch(_){return'';}}
  function saveNote(v){try{localStorage.setItem(noteKey(),v);}catch(_){}}

  function ensureStyle(){
    if(document.getElementById('lf51dStyleV1'))return;
    const s=document.createElement('style');s.id='lf51dStyleV1';s.textContent=`
      #lf51DesktopWorkspace{display:none;width:min(1320px,100%);margin:10px auto 18px;color:#132238;font-family:inherit}#lf51DesktopWorkspace.on{display:block}
      body.lf51-desktop-active #flashcardContainer,body.lf51-desktop-active #studyAnswerPanel,body.lf51-desktop-active #lf51GrammarPanel,body.lf51-desktop-active #lf51PatternPractice,body.lf51-desktop-active #lf51Listening{display:none!important}
      .lf51d-shell{height:clamp(630px,calc(100vh - 145px),850px);min-height:630px;border:1px solid #dbe5f2;border-radius:22px;background:#f5f8fc;box-shadow:0 18px 48px rgba(15,35,70,.12);overflow:hidden;display:grid;grid-template-rows:auto auto 1fr auto}
      .lf51d-top{display:flex;align-items:center;gap:16px;padding:12px 16px;background:linear-gradient(135deg,#123e75,#0759a6);color:#fff}.lf51d-brand{font-size:1.15rem;font-weight:950;white-space:nowrap}.lf51d-select{flex:1;max-width:560px;border:0;border-radius:10px;padding:9px 12px;font-weight:850;color:#173b74;background:#fff}.lf51d-badge{margin-left:auto;font-size:.75rem;color:#dbeafe}
      .lf51d-tabs{display:grid;grid-template-columns:repeat(6,minmax(100px,1fr));gap:6px;padding:8px 12px;background:#fff;border-bottom:1px solid #dde6f2}.lf51d-tab{border:0;background:#f4f7fb;color:#3b4b63;border-radius:12px;padding:9px 7px;font-size:.78rem;font-weight:900;cursor:pointer}.lf51d-tab.active{background:#1677ff;color:#fff;box-shadow:0 6px 16px rgba(22,119,255,.22)}
      .lf51d-grid{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:10px;padding:10px 12px}.lf51d-main,.lf51d-coach{min-height:0;background:#fff;border:1px solid #dfe7f2;border-radius:16px;overflow:hidden}.lf51d-main{display:grid;grid-template-rows:auto 1fr auto}.lf51d-sectionhead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;border-bottom:1px solid #e4ebf4}.lf51d-sectionhead h2{font-size:1rem;margin:0;color:#153d72}.lf51d-count{font-size:.78rem;font-weight:850;color:#64748b}.lf51d-body{min-height:0;padding:12px 14px;overflow:auto}.lf51d-nav{display:flex;gap:8px;justify-content:flex-end;padding:9px 14px;border-top:1px solid #e4ebf4}.lf51d-btn{border:1px solid #cbd8e8;background:#fff;color:#24415f;border-radius:10px;padding:8px 12px;font-weight:850;cursor:pointer}.lf51d-btn.primary{background:#1677ff;border-color:#1677ff;color:#fff}.lf51d-btn.soft{background:#edf5ff;color:#0e5eb8;border-color:#cfe4ff}
      .lf51d-vocabhero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:16px;border:1px solid #cfe4ff;border-left:5px solid #1677ff;border-radius:15px;background:linear-gradient(135deg,#f9fcff,#eef6ff)}.lf51d-word{font-size:2rem;font-weight:950;color:#163e72}.lf51d-ipa{font-size:.92rem;color:#6b7a90;margin-top:4px}.lf51d-meaning{font-size:1.05rem;font-weight:850;margin-top:10px}.lf51d-listen{width:48px;height:48px;border:0;border-radius:50%;background:#e6f1ff;color:#0964c5;font-size:1.15rem;cursor:pointer}.lf51d-cards2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.lf51d-info{border-radius:13px;padding:12px;background:#f7f9fc;border:1px solid #e4eaf2;font-size:.82rem;line-height:1.55}.lf51d-info b{color:#174c8b}.lf51d-example{font-size:1.05rem;font-weight:850;line-height:1.55;color:#172d49}.lf51d-vi{margin-top:7px;color:#68768a;font-size:.88rem;font-style:italic}.lf51d-key{font-size:.72rem;font-weight:900;text-transform:uppercase;color:#dd6b20;margin-bottom:6px}
      .lf51d-dialogue{height:100%;overflow:auto;padding-right:4px}.lf51d-line{display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:start;padding:10px 0;border-bottom:1px solid #edf1f6}.lf51d-speaker{font-size:.78rem;font-weight:950;color:#125ca7}.lf51d-bubble{border-radius:13px;padding:10px 12px;background:#eef7ff}.lf51d-line:nth-child(even) .lf51d-bubble{background:#fff3f3}.lf51d-translation{font-size:.78rem;color:#6b7584;margin-top:5px}.lf51d-grammarbox{padding:16px;border-radius:16px;background:linear-gradient(135deg,#f5efff,#fbf9ff);border:1px solid #e5d8ff}.lf51d-grammarbox h3{margin:0 0 10px;color:#5b21b6}.lf51d-grammarbox p{font-size:.92rem;line-height:1.7;color:#39485e}.lf51d-speakrow{padding:12px;border:1px solid #e3eaf3;border-radius:13px;margin-bottom:9px;background:#fbfdff}.lf51d-role{font-size:.72rem;font-weight:950;color:#e05d25;text-transform:uppercase}.lf51d-speaktext{font-weight:800;line-height:1.55;margin-top:4px}
      .lf51d-review{height:100%;display:grid;place-items:center}.lf51d-reviewcard{width:min(720px,90%);text-align:center;padding:28px;border:1px solid #dce7f5;border-radius:20px;background:linear-gradient(135deg,#fff,#f3f8ff)}.lf51d-reviewq{font-size:1.5rem;font-weight:950;line-height:1.45;color:#163e72}.lf51d-reviewa{margin-top:15px;padding:12px;border-radius:12px;background:#eef6ff;color:#3a4b61}.lf51d-extra{margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff8e8;border:1px solid #fde3a7;font-size:.8rem;line-height:1.55}
      .lf51d-coach{padding:11px;overflow:auto}.lf51d-coachTitle{display:flex;align-items:center;gap:8px;font-size:1rem;font-weight:950;color:#174c8b;margin:2px 2px 9px}.lf51d-coachCard{border:1px solid #e0e8f2;border-radius:13px;padding:11px;margin-bottom:8px;background:#fff}.lf51d-coachLabel{font-size:.7rem;font-weight:950;color:#53657b;text-transform:uppercase;letter-spacing:.04em}.lf51d-coachMain{font-size:.95rem;font-weight:850;margin-top:6px;line-height:1.45}.lf51d-speed{display:flex;gap:6px;margin-top:8px}.lf51d-speed button{flex:1;border:1px solid #d2deed;background:#f7faff;border-radius:9px;padding:6px;font-weight:850;cursor:pointer}.lf51d-note{width:100%;min-height:72px;resize:vertical;border:1px solid #d5dfeb;border-radius:9px;padding:8px;font:inherit;font-size:.82rem;margin-top:7px}.lf51d-toolbox input{width:100%;border:1px solid #cbd8e8;border-radius:9px;padding:9px;font-size:.9rem;margin-top:8px}.lf51d-result{margin-top:7px;font-size:.78rem;font-weight:800}.lf51d-pattern{font-size:.78rem;line-height:1.5;color:#475569;margin:5px 0}
      .lf51d-quickbar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px 12px 11px;background:#fff;border-top:1px solid #dfe7f1}.lf51d-quick{border:1px solid #dce6f2;border-radius:12px;padding:9px 11px;background:#f8fbff;text-align:left;cursor:pointer}.lf51d-quick b{display:block;font-size:.79rem;color:#153d72}.lf51d-quick span{display:block;font-size:.68rem;color:#6b7b8e;margin-top:2px}.lf51d-quick.learned{background:#ecfdf5;border-color:#bbf7d0}
      @media(max-width:1100px){.lf51d-grid{grid-template-columns:minmax(0,1fr) 300px}.lf51d-tabs{grid-template-columns:repeat(6,minmax(90px,1fr))}.lf51d-cards2{grid-template-columns:1fr}.lf51d-word{font-size:1.65rem}}
      @media(max-width:899px){#lf51DesktopWorkspace{display:none!important}}
    `;document.head.appendChild(s);
  }

  function ensureRoot(){let r=document.getElementById('lf51DesktopWorkspace');if(r)return r;const flash=document.getElementById('flashcardContainer');if(!flash)return null;r=document.createElement('section');r.id='lf51DesktopWorkspace';flash.parentElement?.insertBefore(r,flash);return r;}
  function focus(){const x=L();if(state.tab==='vocab'){const v=x.vocab[state.vocab]||x.vocab[0],e=x.examples.find(y=>y[0]===v[0]);return{text:v[0],ipa:v[1],meaning:v[2],explain:v[3],patterns:[e?.[1],v[4]].filter(Boolean)}}if(state.tab==='examples'){const e=x.examples[state.example]||x.examples[0];return{text:e[1],ipa:IPA[e[1]]||'',meaning:e[2],explain:`Từ/cụm trọng tâm: ${e[0]}`,patterns:[e[1],...x.examples.slice(0,2).map(y=>y[1])]}}if(state.tab==='grammar'){const g=x.grammar[state.grammar]||x.grammar[0];return{text:g[0],ipa:'',meaning:g[1],explain:g[1],patterns:x.examples.slice(0,3).map(y=>y[1])}}if(state.tab==='speaking'){const s=x.speaking[state.speaking]||x.speaking[0];return{text:s[1],ipa:IPA[s[1]]||'',meaning:s[0],explain:'Luyện nói theo mẫu, sau đó thay thông tin bằng thông tin của bạn.',patterns:x.speaking.filter(y=>/^You/.test(y[0])).slice(0,3).map(y=>y[1])}}if(state.tab==='dialogue'){const d=x.dialogue[state.dialogueLine]||x.dialogue[0];return{text:d[1],ipa:IPA[d[1]]||'',meaning:d[2],explain:`Lời thoại của ${d[0]}`,patterns:x.dialogue.slice(0,3).map(y=>y[1])}}const items=reviewItems(),q=items[state.review]||items[0];return{text:q?.en||'',ipa:q?.ipa||IPA[q?.en]||'',meaning:q?.vi||'',explain:'Ôn nhanh để kiểm tra khả năng nhớ.',patterns:x.examples.slice(0,3).map(y=>y[1])};}

  function pager(title,count,index,type){return `<div class="lf51d-sectionhead"><h2>${esc(title)}</h2><div class="lf51d-count">${index+1} / ${count}</div></div>`;}
  function nav(type,count){return `<div class="lf51d-nav"><button class="lf51d-btn" data-step="${type}:-1">← Trước</button><button class="lf51d-btn primary" data-step="${type}:1">Tiếp →</button></div>`;}
  function renderVocab(){const x=L(),v=x.vocab[state.vocab]||x.vocab[0],e=x.examples.find(y=>y[0]===v[0])||x.examples[Math.min(state.vocab,x.examples.length-1)];return `${pager('1. Từ vựng trọng tâm',x.vocab.length,state.vocab,'vocab')}<div class="lf51d-body"><div class="lf51d-vocabhero"><div><div class="lf51d-word">${esc(v[0])}</div><div class="lf51d-ipa">${esc(v[1])}</div><div class="lf51d-meaning">${esc(v[2])}</div></div><button class="lf51d-listen" data-audio="${esc(v[0])}">🔊</button></div><div class="lf51d-cards2"><div class="lf51d-info"><b>📖 Ví dụ</b><div class="lf51d-example" style="margin-top:7px">${esc(e?.[1]||'')}</div><div class="lf51d-vi">${esc(e?.[2]||'')}</div>${e?.[1]?`<button class="lf51d-btn soft" style="margin-top:8px" data-audio="${esc(e[1])}">🔊 Nghe câu</button>`:''}</div><div class="lf51d-info"><b>💡 Cách dùng</b><div style="margin-top:7px">${esc(v[3]||'')}</div><div style="margin-top:8px"><b>Đồng nghĩa / ghi chú:</b> ${esc(v[4]||'—')}</div></div></div>${x.extras?.length?`<div class="lf51d-extra"><b>${esc(x.extras[0][0])}</b><br>${esc(x.extras[0][1])}</div>`:''}</div>${nav('vocab',x.vocab.length)}`;}
  function renderExamples(){const x=L(),e=x.examples[state.example]||x.examples[0],ipa=IPA[e[1]]||'';return `${pager('2. Câu mẫu & Bài tập',x.examples.length,state.example,'example')}<div class="lf51d-body"><div class="lf51d-vocabhero"><div><div class="lf51d-key">${esc(e[0])}</div><div class="lf51d-example">${esc(e[1])}</div>${ipa?`<div class="lf51d-ipa">${esc(ipa)}</div>`:''}<div class="lf51d-vi">${esc(e[2])}</div></div><button class="lf51d-listen" data-audio="${esc(e[1])}">🔊</button></div><div class="lf51d-cards2"><div class="lf51d-info"><b>🧩 Giải thích nhanh</b><div style="margin-top:7px">Từ/cụm đang luyện: <strong>${esc(e[0])}</strong>. Hãy chú ý vị trí của cụm này trong câu và nghe lại trước khi tự nói.</div></div><div class="lf51d-info lf51d-toolbox"><b>✍️ Bài tập nhỏ</b><div style="margin-top:6px">Dịch sang tiếng Anh:</div><div class="lf51d-vi" style="font-style:normal">${esc(e[2])}</div><input id="lf51dMainAnswer" placeholder="Nhập câu tiếng Anh..."><button class="lf51d-btn primary" style="margin-top:7px" data-check-main>Kiểm tra</button><div id="lf51dMainResult" class="lf51d-result"></div></div></div></div>${nav('example',x.examples.length)}`;}
  function renderDialogue(){const x=L();return `<div class="lf51d-sectionhead"><h2>3. Hội thoại</h2><div><button class="lf51d-btn soft" data-toggle-translation>${state.showTranslation?'Ẩn bản dịch':'Hiện bản dịch'}</button> <button class="lf51d-btn primary" data-play-dialogue>▶ Nghe toàn bộ</button></div></div><div class="lf51d-body"><div class="lf51d-dialogue">${x.dialogue.map((d,i)=>`<div class="lf51d-line" data-dialogue-line="${i}"><div class="lf51d-speaker">${esc(d[0])}</div><div class="lf51d-bubble"><div class="lf51d-example" style="font-size:.9rem">${esc(d[1])}</div>${state.showTranslation?`<div class="lf51d-translation">${esc(d[2])}</div>`:''}</div><button class="lf51d-listen" style="width:38px;height:38px;font-size:.95rem" data-audio="${esc(d[1])}">🔊</button></div>`).join('')}</div></div><div class="lf51d-nav"><span style="margin-right:auto;font-size:.76rem;color:#64748b">Nhấp vào một câu để đưa câu đó sang English Coach.</span></div>`;}
  function renderGrammar(){const x=L(),g=x.grammar[state.grammar]||x.grammar[0];return `${pager('4. Ngữ pháp',x.grammar.length,state.grammar,'grammar')}<div class="lf51d-body"><div class="lf51d-grammarbox"><div class="lf51d-key">Ngữ pháp ${state.grammar+1}</div><h3>${esc(g[0])}</h3><p>${esc(g[1])}</p></div><div class="lf51d-cards2"><div class="lf51d-info"><b>✅ Cách học</b><div style="margin-top:7px">Đọc cấu trúc → nghe câu mẫu → tự tạo một câu mới liên quan đến công việc hoặc đời sống của bạn.</div></div><div class="lf51d-info"><b>📌 Ví dụ trong bài</b>${x.examples.slice(0,3).map(e=>`<div style="margin-top:7px">• ${esc(e[1])}</div>`).join('')}</div></div></div>${nav('grammar',x.grammar.length)}`;}
  function renderSpeaking(){const x=L(),s=x.speaking[state.speaking]||x.speaking[0];return `${pager('5. Luyện nói',x.speaking.length,state.speaking,'speaking')}<div class="lf51d-body"><div class="lf51d-speakrow"><div class="lf51d-role">${esc(s[0])}</div><div class="lf51d-speaktext">${esc(s[1])}</div><div style="margin-top:9px"><button class="lf51d-btn soft" data-audio="${esc(s[1])}">🔊 Nghe mẫu</button> <button class="lf51d-btn primary" data-record>🎙️ Nói câu này</button></div><div id="lf51dSpeechResult" class="lf51d-result"></div></div><div class="lf51d-info"><b>Gợi ý:</b> Nghe 1 lần → đọc theo chậm → nói lại không nhìn câu → cuối cùng thay thông tin trong câu bằng thông tin thật của bạn.</div></div>${nav('speaking',x.speaking.length)}`;}
  function renderReview(){const items=reviewItems();state.review=(state.review+items.length)%items.length;const q=items[state.review];return `<div class="lf51d-sectionhead"><h2>6. Ôn nhanh</h2><div class="lf51d-count">${state.review+1} / ${items.length}</div></div><div class="lf51d-body"><div class="lf51d-review"><div class="lf51d-reviewcard"><div class="lf51d-key">${esc(q.type)}</div><div class="lf51d-reviewq">${esc(q.en)}</div>${q.ipa?`<div class="lf51d-ipa">${esc(q.ipa)}</div>`:''}${state.reveal?`<div class="lf51d-reviewa">${esc(q.vi)}</div>`:''}<div style="margin-top:15px"><button class="lf51d-btn soft" data-audio="${esc(q.en)}">🔊 Nghe</button> <button class="lf51d-btn primary" data-reveal>${state.reveal?'Ẩn đáp án':'Hiện đáp án'}</button></div></div></div></div>${nav('review',items.length)}`;}
  function renderMain(){if(state.tab==='vocab')return renderVocab();if(state.tab==='examples')return renderExamples();if(state.tab==='dialogue')return renderDialogue();if(state.tab==='grammar')return renderGrammar();if(state.tab==='speaking')return renderSpeaking();return renderReview();}

  function renderCoach(){const f=focus(),learned=isLearned();let tool='';if(state.tool==='input')tool=`<div class="lf51d-coachCard lf51d-toolbox"><div class="lf51d-coachLabel">Luyện nhập đáp án</div><div class="lf51d-coachMain">${esc(f.meaning||'Nhập lại nội dung tiếng Anh đang học.')}</div><input id="lf51dCoachInput" placeholder="Nhập tiếng Anh..."><button class="lf51d-btn primary" style="margin-top:7px" data-check-coach>Kiểm tra</button><div id="lf51dCoachResult" class="lf51d-result"></div></div>`;else if(state.tool==='dictation')tool=`<div class="lf51d-coachCard lf51d-toolbox"><div class="lf51d-coachLabel">Nghe & chép chính tả</div><div class="lf51d-coachMain">Nghe câu rồi gõ lại chính xác.</div><button class="lf51d-btn soft" style="margin-top:8px" data-audio="${esc(f.text)}">▶ Nghe câu</button><input id="lf51dDictationInput" placeholder="Gõ câu bạn nghe được..."><button class="lf51d-btn primary" style="margin-top:7px" data-check-dictation>Kiểm tra</button><div id="lf51dDictationResult" class="lf51d-result"></div></div>`;else if(state.tool==='flash')tool=`<div class="lf51d-coachCard"><div class="lf51d-coachLabel">Flashcard nhanh</div><div class="lf51d-coachMain">${esc(f.text)}</div><div class="lf51d-vi">${esc(f.meaning)}</div></div>`;
    return `<div class="lf51d-coachTitle">🤖 English Coach</div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">IPA & Phát âm</div><div class="lf51d-coachMain">${esc(f.text)}</div>${f.ipa?`<div class="lf51d-ipa">${esc(f.ipa)}</div>`:''}<div class="lf51d-speed"><button data-speed=".75">0.75×</button><button data-speed="1">1.0×</button><button data-speed="1.25">1.25×</button></div></div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">💡 Giải thích nhanh</div><div class="lf51d-pattern">${esc(f.explain||f.meaning||'')}</div></div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">📝 Ghi chú học tập</div><textarea id="lf51dNote" class="lf51d-note" placeholder="Viết ghi chú của bạn...">${esc(noteValue())}</textarea></div><div class="lf51d-coachCard"><div class="lf51d-coachLabel">📌 Mẫu câu cần nhớ</div>${(f.patterns||[]).slice(0,3).map(p=>`<div class="lf51d-pattern">• ${esc(p)}</div>`).join('')||'<div class="lf51d-pattern">Chọn một câu mẫu để xem cấu trúc liên quan.</div>'}</div>${tool}<div class="lf51d-coachCard"><div class="lf51d-coachLabel">Trạng thái</div><div class="lf51d-coachMain">${learned?'✅ Đã đánh dấu đã học':'○ Chưa đánh dấu'}</div></div>`;}
  function render(){const r=ensureRoot();if(!r)return;const x=L();const tabs=[['vocab','📚 Từ vựng'],['examples','📝 Câu mẫu'],['dialogue','💬 Hội thoại'],['grammar','📘 Ngữ pháp'],['speaking','🗣️ Luyện nói'],['review','🧠 Ôn nhanh']];r.innerHTML=`<div class="lf51d-shell"><div class="lf51d-top"><div class="lf51d-brand">51Talk English</div><select class="lf51d-select" data-lesson-select>${Object.values(LESSONS).map(y=>`<option value="${y.id}" ${y.id===state.lesson?'selected':''}>${esc(y.unit)} · ${esc(y.title)}</option>`).join('')}</select><div class="lf51d-badge">Desktop Workspace</div></div><div class="lf51d-tabs">${tabs.map(t=>`<button class="lf51d-tab ${state.tab===t[0]?'active':''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div><div class="lf51d-grid"><main class="lf51d-main">${renderMain()}</main><aside class="lf51d-coach">${renderCoach()}</aside></div><div class="lf51d-quickbar"><button class="lf51d-quick" data-tool="flash"><b>🗂️ Học bằng Flashcard</b><span>Xem thẻ từ và luyện ghi nhớ</span></button><button class="lf51d-quick" data-tool="input"><b>⌨️ Luyện nhập đáp án</b><span>Kiểm tra và củng cố kiến thức</span></button><button class="lf51d-quick" data-tool="dictation"><b>🎧 Nghe & chép chính tả</b><span>Rèn kỹ năng nghe - viết</span></button><button class="lf51d-quick ${isLearned()?'learned':''}" data-learned><b>${isLearned()?'✅ Đã học':'○ Đánh dấu đã học'}</b><span>Lưu tiến độ của nội dung hiện tại</span></button></div></div>`;}

  function checkValue(input,expected,result){const el=document.getElementById(input),out=document.getElementById(result);if(!el||!out)return;const ok=norm(el.value)===norm(expected);out.textContent=ok?'✅ Chính xác.':`❌ Chưa đúng. Đáp án: ${expected}`;out.style.color=ok?'#15803d':'#b42318';}
  function step(type,delta){const x=L();const map={vocab:['vocab',x.vocab.length],example:['example',x.examples.length],grammar:['grammar',x.grammar.length],speaking:['speaking',x.speaking.length],review:['review',reviewItems().length]};const m=map[type];if(!m)return;state[m[0]]=(state[m[0]]+Number(delta)+m[1])%m[1];state.reveal=false;render();}
  function startRecognition(){const C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C){const o=document.getElementById('lf51dSpeechResult');if(o)o.textContent='Trình duyệt này chưa hỗ trợ nhận diện giọng nói.';return;}try{recognition?.abort?.();recognition=new C();recognition.lang='en-US';recognition.interimResults=false;recognition.maxAlternatives=1;const o=document.getElementById('lf51dSpeechResult');if(o)o.textContent='🎙️ Đang nghe...';recognition.onresult=e=>{const t=e.results?.[0]?.[0]?.transcript||'';if(o)o.textContent=`Bạn nói: ${t}`;};recognition.onerror=()=>{if(o)o.textContent='Không nhận được giọng nói. Hãy thử lại.';};recognition.start();}catch(_){}}
  function bind(){const r=ensureRoot();if(!r||r.dataset.bound)return;r.dataset.bound='1';r.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.tab){state.tab=b.dataset.tab;state.tool='coach';render();return;}if(b?.dataset.audio){speak(b.dataset.audio);return;}if(b?.dataset.speed){speak(focus().text,Number(b.dataset.speed));return;}if(b?.dataset.step){const [t,d]=b.dataset.step.split(':');step(t,d);return;}if(b?.hasAttribute('data-reveal')){state.reveal=!state.reveal;render();return;}if(b?.hasAttribute('data-toggle-translation')){state.showTranslation=!state.showTranslation;render();return;}if(b?.hasAttribute('data-play-dialogue')){playSequence(L().dialogue.map(x=>x[1]));return;}if(b?.hasAttribute('data-record')){startRecognition();return;}if(b?.dataset.tool){state.tool=b.dataset.tool;if(b.dataset.tool==='flash')state.tab='review';render();return;}if(b?.hasAttribute('data-learned')){toggleLearned();return;}if(b?.hasAttribute('data-check-main')){const e0=L().examples[state.example]||L().examples[0];checkValue('lf51dMainAnswer',e0[1],'lf51dMainResult');return;}if(b?.hasAttribute('data-check-coach')){checkValue('lf51dCoachInput',focus().text,'lf51dCoachResult');return;}if(b?.hasAttribute('data-check-dictation')){checkValue('lf51dDictationInput',focus().text,'lf51dDictationResult');return;}const line=e.target.closest('[data-dialogue-line]');if(line){state.dialogueLine=Number(line.dataset.dialogueLine)||0;render();}});r.addEventListener('change',e=>{if(e.target.matches('[data-lesson-select]')){state.lesson=e.target.value;state.vocab=state.example=state.grammar=state.speaking=state.review=state.dialogueLine=0;state.reveal=false;render();}});r.addEventListener('input',e=>{if(e.target.id==='lf51dNote')saveNote(e.target.value);});}
  function sync(){ensureStyle();const r=ensureRoot();if(!r)return;const on=active();r.classList.toggle('on',on);document.body.classList.toggle('lf51-desktop-active',on);if(!on)return;const inf=inferLesson();if(inf&&inf!==state.lesson){state.lesson=inf;state.vocab=state.example=state.grammar=state.speaking=state.review=state.dialogueLine=0;}render();}
  function init(){ensureStyle();ensureRoot();bind();['studyLangFilter','studyCategoryFilter','studyTopicFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(sync,0)));addEventListener('resize',()=>setTimeout(sync,50),{passive:true});setTimeout(sync,200);setTimeout(sync,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();