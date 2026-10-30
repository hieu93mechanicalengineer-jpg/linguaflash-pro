/* LinguaFlash · English Mobile Lessons v1
   Clean mobile-only lesson UI for 51Talk English.
   Goals:
   - Same UI in portrait and landscape (device detection, not viewport breakpoint).
   - Render only the active section to keep DOM small and responsive.
   - No document-level touch interception, no MutationObserver, no flashcard patching.
   - Phase 1 sections: Vocabulary, Example sentences, Dialogue, Grammar.
*/
(() => {
  'use strict';
  if (window.__LF_ENGLISH_MOBILE_LESSONS_V1__) return;
  window.__LF_ENGLISH_MOBILE_LESSONS_V1__ = true;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  const LESSONS = {
    health: {
      id: 'health',
      unit: 'Bài hiện tại',
      title: 'Sức khỏe & Công việc',
      subtitle: 'Sức khỏe · cảm lạnh · công việc & thích nghi',
      vocab: [
        ['look well','/lʊk wel/','Trông khỏe mạnh, thần sắc tốt','S + look(s) / do not look + well. Khi nói về sức khỏe, well có thể là tính từ.'],
        ['headache','/ˈhedeɪk/','Cơn đau đầu, chứng nhức đầu','Dùng với a: have a headache / have a terrible headache.'],
        ['umbrella','/ʌmˈbrelə/','Cái ô, cái dù che mưa','Dùng an umbrella; bring/take an umbrella with you.'],
        ['catch a cold','/kætʃ ə koʊld/','Bị cảm lạnh','Quá khứ: catch → caught.'],
        ['take care of','/teɪk ker əv/','Chăm sóc, trông nom','take care of + người/vật; take care of myself.'],
        ['not feeling well / ill','/nɑːt ˈfiːlɪŋ wel/ · /ɪl/','Cảm thấy không khỏe / bị ốm','not feeling well = do not feel very good = be ill/sick.'],
        ['have a good rest','/hæv ə ɡʊd rest/','Nghỉ ngơi thật tốt','need to have a good rest / need some rest.'],
        ['take some medicine','/teɪk sʌm ˈmedɪsɪn/','Uống thuốc','Dùng take với medicine.'],
        ['go to the hospital','/ɡoʊ tə ðə ˈhɑːspɪtəl/','Đi bệnh viện, đi khám','Có thể dùng see a doctor / visit a clinic tùy ngữ cảnh.'],
        ['heavy rain / get wet','/ˈhevi reɪn/ · /ɡet wet/','Mưa to / bị ướt','The rain was really heavy. I got all wet.'],
        ['technical support','/ˈteknɪkəl səˈpɔːrt/','Hỗ trợ kỹ thuật','provide technical support for/to clients.'],
        ['training','/ˈtreɪnɪŋ/','Sự đào tạo, huấn luyện','receive training in + lĩnh vực.'],
        ['employee','/ɪmˈplɔɪiː/','Nhân viên','an employee of + công ty; phân biệt employer.'],
        ['adapt to','/əˈdæpt tuː/','Thích nghi, làm quen với','adapt to + danh từ / V-ing.'],
        ['a couple of','/ə ˈkʌpəl əv/','Hai / một vài','a couple of + danh từ số nhiều.'],
        ['feel nervous / worried','/fiːl ˈnɜːrvəs/ · /fiːl ˈwɜːrid/','Cảm thấy lo lắng, hồi hộp','feel + tính từ.']
      ],
      examples: [
        ["You don't look well. What happened?",'/ju doʊnt lʊk wel | wʌt ˈhæpənd/','Trông bạn không được khỏe. Đã có chuyện gì xảy ra vậy?'],
        ['Jenny is not feeling well because she has a headache.','/ˈdʒeni ɪz nɑːt ˈfiːlɪŋ wel bɪˈkɔːz ʃi hæz ə ˈhedeɪk/','Jenny cảm thấy không khỏe vì cô ấy bị đau đầu.'],
        ['It is raining outside. Remember to bring an umbrella.','/ɪt ɪz ˈreɪnɪŋ ˌaʊtˈsaɪd | rɪˈmembər tə brɪŋ ən ʌmˈbrelə/','Bên ngoài trời đang mưa. Hãy nhớ mang theo một chiếc ô.'],
        ['Daisy caught a cold yesterday. She needs some rest.','/ˈdeɪzi kɔːt ə koʊld ˈjestərdeɪ | ʃi niːdz sʌm rest/','Hôm qua Daisy bị cảm lạnh. Cô ấy cần nghỉ ngơi một chút.'],
        ["Lucy's husband is ill and she is taking care of him.",'/ˈluːsiz ˈhʌzbənd ɪz ɪl ænd ʃi ɪz ˈteɪkɪŋ ker əv hɪm/','Chồng của Lucy bị ốm và cô ấy đang chăm sóc anh ấy.'],
        ["Mr. Smith's role is to provide technical support for the clients all over Europe.",'/ˌmɪstər ˈsmɪθs roʊl ɪz tə prəˈvaɪd ˈteknɪkəl səˈpɔːrt fər ðə ˈklaɪənts ɔːl ˈoʊvər ˈjʊrəp/','Vai trò của ông Smith là cung cấp hỗ trợ kỹ thuật cho khách hàng trên khắp châu Âu.'],
        ['On the course we received training in every aspect of the job.','/ɑːn ðə kɔːrs wi rɪˈsiːvd ˈtreɪnɪŋ ɪn ˈevri ˈæspekt əv ðə dʒɑːb/','Trong khóa học, chúng tôi được đào tạo về mọi khía cạnh của công việc.'],
        ['Linda is an employee of Citibank in the States.','/ˈlɪndə ɪz ən ɪmˈplɔɪiː əv ˈsɪtibæŋk ɪn ðə steɪts/','Linda là nhân viên của Citibank tại Hoa Kỳ.'],
        ['It takes time for me to adapt to a new working environment.','/ɪt teɪks taɪm fər mi tə əˈdæpt tə ə nuː ˈwɜːrkɪŋ ɪnˈvaɪrənmənt/','Tôi cần thời gian để thích nghi với một môi trường làm việc mới.'],
        ['A couple of months after I moved to London, I felt completely at home there.','/ə ˈkʌpəl əv mʌnθs ˈæftər aɪ muːvd tə ˈlʌndən | aɪ felt kəmˈpliːtli æt hoʊm ðer/','Một vài tháng sau khi chuyển đến London, tôi cảm thấy hoàn toàn quen thuộc như ở nhà.']
      ],
      dialogue: [
        ['Lily',"Hi, Joe! Are you okay? You don't look well.",'/haɪ dʒoʊ | ɑːr ju oʊˈkeɪ | ju doʊnt lʊk wel/','Chào Joe! Bạn ổn chứ? Trông bạn không khỏe.'],
        ['Joe',"I don't feel very good. I have a terrible headache.",'/aɪ doʊnt fiːl ˈveri ɡʊd | aɪ hæv ə ˈterəbəl ˈhedeɪk/','Tôi cảm thấy không khỏe lắm. Tôi bị đau đầu dữ dội.'],
        ['Lily',"I'm sorry to hear that. What happened?",'/aɪm ˈsɑːri tə hɪr ðæt | wʌt ˈhæpənd/','Rất tiếc khi nghe điều đó. Có chuyện gì xảy ra vậy?'],
        ['Joe','I went out with my friends last night and it started to rain on my way home.','/aɪ went aʊt wɪð maɪ frendz læst naɪt ænd ɪt ˈstɑːrtɪd tə reɪn ɑːn maɪ weɪ hoʊm/','Tối qua tôi đi chơi với bạn và trời bắt đầu mưa trên đường về nhà.'],
        ['Lily',"That's unlucky. Did you take an umbrella with you?",'/ðæts ʌnˈlʌki | dɪd ju teɪk ən ʌmˈbrelə wɪð ju/','Thật không may. Bạn có mang theo ô không?'],
        ['Joe','No. I got all wet. The rain was really heavy.','/noʊ | aɪ ɡɑːt ɔːl wet | ðə reɪn wəz ˈrɪəli ˈhevi/','Không. Tôi bị ướt sũng. Mưa thực sự rất to.'],
        ['Lily',"That is not good. It's easy to catch a cold when you are wet.",'/ðæt ɪz nɑːt ɡʊd | ɪts ˈiːzi tə kætʃ ə koʊld wen ju ɑːr wet/','Thế thì không ổn. Rất dễ bị cảm lạnh khi người bị ướt.'],
        ['Joe','Well, maybe I need to have a good rest tonight.','/wel | ˈmeɪbi aɪ niːd tə hæv ə ɡʊd rest təˈnaɪt/','Có lẽ tối nay tôi cần nghỉ ngơi thật tốt.'],
        ['Lily','Also, drinking more water may make you feel better.','/ˈɔːlsoʊ | ˈdrɪŋkɪŋ mɔːr ˈwɔːtər meɪ meɪk ju fiːl ˈbetər/','Uống thêm nước có thể giúp bạn cảm thấy khỏe hơn.'],
        ['Joe','Thank you. I will take care of myself.','/θæŋk ju | aɪ wɪl teɪk ker əv maɪˈself/','Cảm ơn. Tôi sẽ tự chăm sóc bản thân.']
      ],
      grammar: [
        ['Well / good sau động từ nối','Khi nói về sức khỏe, well có thể là tính từ sau look, feel, be. Ví dụ: You do not look well. / I do not feel very good.'],
        ['Chủ ngữ giả It','It is + adjective + (for someone) + to V. It takes + time + for someone + to V.'],
        ['V-ing làm chủ ngữ & make + O + V','Động từ làm chủ ngữ dùng V-ing. Sau make + tân ngữ dùng V nguyên mẫu không “to”.'],
        ['Đại từ phản thân & cụm cố định','I → myself, you → yourself, he → himself, she → herself. Ghi nhớ on my way home và get all wet.'],
        ['Quá khứ đơn','Kể việc đã qua dùng V2/ed: went, started, got, was, caught, felt. Câu hỏi dùng Did + S + V nguyên mẫu.'],
        ['Mẫu câu luyện nói','Hai mẫu trọng tâm: I have a... và Maybe I need to...']
      ],
      notes: []
    },

    birthday: {
      id: 'birthday',
      unit: 'Unit 1',
      title: 'My Birthday Is Coming!',
      subtitle: 'Ngày tháng · sinh nhật · công việc',
      vocab: [
        ['today','/təˈdeɪ/','Hôm nay, ngày hôm nay','Có thể đứng đầu câu làm chủ ngữ hoặc cuối câu làm trạng ngữ thời gian.'],
        ['date','/deɪt/','Ngày trong tháng / ngày trên lịch',"What's the date today? Phân biệt date (ngày mấy) và day (thứ mấy)."],
        ['May','/meɪ/','Tháng Năm','Luôn viết hoa. Dùng in May nhưng on May 30th.'],
        ['be busy with','/bi ˈbɪzi wɪð/','Bận rộn với','be + busy with + danh từ; hoặc be busy + V-ing.'],
        ['the first one','/ðə fɜːrst wʌn/','Người đầu tiên','be the first one + to V.'],
        ['a big day','/ə bɪɡ deɪ/','Một ngày trọng đại / ngày quan trọng','Today is a big day for me.'],
        ['all the time / all day','/ɔːl ðə taɪm/ · /ɔːl deɪ/','Suốt cả ngày, lúc nào cũng vậy','busy with his work all the time / all day.'],
        ['my birthday is coming','/maɪ ˈbɜːrθdeɪ ɪz ˈkʌmɪŋ/','Sinh nhật của tôi sắp đến rồi','Hiện tại tiếp diễn có thể nói về một sự việc sắp xảy ra.'],
        ['only one week from your birthday','/ˈoʊnli wʌn wiːk frəm jʊr ˈbɜːrθdeɪ/','Chỉ còn đúng một tuần nữa là đến sinh nhật','Cụm thời gian dùng trong hội thoại.'],
        ['Oh dear!','/oʊ dɪr/','Ôi trời ơi! / Chết thật!','Cảm thán lịch sự khi ngạc nhiên hoặc chợt nhớ ra điều gì.'],
        ['forgot all about it','/fərˈɡɑːt ɔːl əˈbaʊt ɪt/','Quên khuấy đi mất','forget → forgot.']
      ],
      examples: [
        ['Today is a big day for me.','/təˈdeɪ ɪz ə bɪɡ deɪ fər miː/','Hôm nay là một ngày trọng đại đối với tôi.'],
        ['The date of my birthday is the 24th of this month.','/ðə deɪt əv maɪ ˈbɜːrθdeɪ ɪz ðə ˌtwenti ˈfɔːrθ əv ðɪs mʌnθ/','Ngày sinh nhật của tôi là ngày 24 của tháng này.'],
        ["My friend Tim's birthday is on May 30th.",'/maɪ frend tɪmz ˈbɜːrθdeɪ ɪz ɑːn meɪ ˈθɜːrtiəθ/','Sinh nhật của bạn tôi Tim vào ngày 30 tháng 5.'],
        ['Ben is busy with his work all the time.','/ben ɪz ˈbɪzi wɪð hɪz wɜːrk ɔːl ðə taɪm/','Lúc nào Ben cũng bận rộn với công việc của anh ấy.'],
        ['Lee is the first one to finish the work.','/liː ɪz ðə fɜːrst wʌn tə ˈfɪnɪʃ ðə wɜːrk/','Lee là người đầu tiên hoàn thành công việc.'],
        ['I am busy with my work all day.','/aɪ æm ˈbɪzi wɪð maɪ wɜːrk ɔːl deɪ/','Tôi bận rộn với công việc của mình suốt cả ngày.'],
        ['Erica is the first one to say happy birthday to me.','/ˈerɪkə ɪz ðə fɜːrst wʌn tə seɪ ˈhæpi ˈbɜːrθdeɪ tə miː/','Erica là người đầu tiên nói lời chúc mừng sinh nhật với tôi.'],
        ["What's the date today?",'/wʌts ðə deɪt təˈdeɪ/','Hôm nay là ngày mấy?']
      ],
      dialogue: [
        ['Tracy',"Betty, what's the date today?",'/ˈbeti | wʌts ðə deɪt təˈdeɪ/','Betty ơi, hôm nay là ngày mấy nhỉ?'],
        ['Betty',"It's May 28th. Oh, it's only one week from your birthday.",'/ɪts meɪ ˌtwenti ˈeɪtθ | oʊ | ɪts ˈoʊnli wʌn wiːk frəm jʊr ˈbɜːrθdeɪ/','Hôm nay là ngày 28 tháng 5. Chỉ còn một tuần nữa là đến sinh nhật bạn.'],
        ['Tracy','Oh dear! I was so busy with my work that I forgot all about it!','/oʊ dɪr | aɪ wəz soʊ ˈbɪzi wɪð maɪ wɜːrk ðæt aɪ fərˈɡɑːt ɔːl əˈbaʊt ɪt/','Ôi trời! Mình bận công việc quá đến nỗi quên khuấy đi mất!'],
        ['Betty','I must be the first one to say “Happy birthday” to you, right?','/aɪ mʌst bi ðə fɜːrst wʌn tə seɪ ˈhæpi ˈbɜːrθdeɪ tə ju | raɪt/','Chắc hẳn mình là người đầu tiên chúc mừng sinh nhật bạn, đúng không?'],
        ['Tracy','Yes, you are. Thank you, Betty.','/jes ju ɑːr | θæŋk ju ˈbeti/','Đúng vậy. Cảm ơn bạn nhé, Betty.'],
        ['Betty',"You're welcome.",'/jʊr ˈwelkəm/','Không có chi đâu.']
      ],
      grammar: [
        ["What's the date? và What day is it?","What's the date today? hỏi ngày mấy trong tháng. What day is it today? hỏi thứ mấy trong tuần."],
        ['IN và ON với thời gian','IN + tháng/năm. ON + ngày cụ thể: in May nhưng on May 30th.'],
        ['be busy with + N / be busy + V-ing','S + be + busy with + danh từ; hoặc S + be + busy + V-ing.'],
        ['the first one + to V','Sau the first/second/last one dùng to + động từ nguyên mẫu.'],
        ['so... that...','S + be/V + so + tính từ/trạng từ + that + S + V: quá... đến nỗi...'],
        ['must be & câu xác nhận','must + V có thể diễn tả suy đoán chắc chắn. Trong hội thoại có “..., right?” để xin xác nhận.']
      ],
      notes: [
        ['12 tháng trong năm','January / February / March / April / May / June / July / August / September / October / November / December.'],
        ['Số thứ tự khi nói ngày','1st first · 2nd second · 3rd third · 21st twenty-first · 22nd twenty-second · 23rd twenty-third · 24th twenty-fourth · 28th twenty-eighth · 30th thirtieth · 31st thirty-first. 11th, 12th, 13th luôn dùng -th.']
      ]
    },

    family: {
      id: 'family',
      unit: 'Unit 6',
      title: 'You Look Just Like Your Dad',
      subtitle: 'Ngoại hình · so sánh · nét giống trong gia đình',
      vocab: [
        ['fat','/fæt/','Béo, mập, mũm mĩm','be fat / a fat baby. So sánh hơn: fatter.'],
        ['baby','/ˈbeɪbi/','Em bé, trẻ sơ sinh','Số nhiều: babies. Cụm baby pictures.'],
        ['thin','/θɪn/','Gầy, mảnh mai, thon thả','be/become thin. So sánh hơn: thinner.'],
        ['taller than','/ˈtɔːlər ðæn/','Cao hơn ai đó','S1 + be + taller than + S2.'],
        ['super cute','/ˈsuːpər kjuːt/','Siêu dễ thương','super + tính từ để nhấn mạnh.'],
        ['look just like','/lʊk dʒʌst laɪk/','Trông giống hệt','S + look(s) just like + người.'],
        ['tall → taller','/tɔːl/ → /ˈtɔːlər/','Cao → cao hơn','Tính từ ngắn thường thêm -er.'],
        ['thin → thinner','/θɪn/ → /ˈθɪnər/','Gầy → gầy hơn','CVC: gấp đôi phụ âm cuối + -er.'],
        ['fat → fatter','/fæt/ → /ˈfætər/','Béo → béo hơn','CVC: gấp đôi t + -er.'],
        ['cute → cuter','/kjuːt/ → /ˈkjuːtər/','Dễ thương → dễ thương hơn','Tận cùng -e chỉ thêm -r.'],
        ['young → younger than','/jʌŋ/ → /ˈjʌŋɡər ðæn/','Trẻ → trẻ hơn','Thêm -er.'],
        ['not ... any more','/nɑːt ... ˌeni ˈmɔːr/','Không còn... nữa','I do not want to be fat any more.'],
        ['by + V-ing','/baɪ/ + V-ing','Bằng cách làm gì đó','by running = bằng việc chạy bộ.'],
        ['nose / eyes','/noʊz/ · /aɪz/','Cái mũi / đôi mắt','You have your mom’s nose. I have his eyes and nose.']
      ],
      examples: [
        ["I don't want to be fat any more.",'/aɪ doʊnt wɑːnt tə bi fæt ˌeni ˈmɔːr/','Tôi không muốn bị béo thêm nữa.'],
        ['The baby is 10 months old now.','/ðə ˈbeɪbi ɪz ten mʌnθs oʊld naʊ/','Em bé hiện giờ đã được 10 tháng tuổi.'],
        ['Emily becomes thin by running.','/ˈeməli bɪˈkʌmz θɪn baɪ ˈrʌnɪŋ/','Emily trở nên thon gầy nhờ việc chạy bộ.'],
        ['Bella is taller than her mother now.','/ˈbelə ɪz ˈtɔːlər ðæn hər ˈmʌðər naʊ/','Bella bây giờ đã cao hơn mẹ của cô ấy.'],
        ['The little dogs are super cute.','/ðə ˈlɪtəl dɔːɡz ɑːr ˈsuːpər kjuːt/','Những chú cún nhỏ siêu dễ thương.'],
        ['These little cats are super cute.','/ðiːz ˈlɪtəl kæts ɑːr ˈsuːpər kjuːt/','Những chú mèo nhỏ này cực kỳ đáng yêu.'],
        ['We are taller than our dad now.','/wi ɑːr ˈtɔːlər ðæn aʊər dæd naʊ/','Bây giờ chúng tôi đã cao hơn bố của mình.'],
        ['You look just like your mom in the picture.','/ju lʊk dʒʌst laɪk jʊr mɑːm ɪn ðə ˈpɪktʃər/','Bạn trông giống hệt mẹ của bạn trong bức ảnh.']
      ],
      dialogue: [
        ['Jen','Wow, you were a fat baby at that time.','/waʊ | ju wɜːr ə fæt ˈbeɪbi æt ðæt taɪm/','Chà, hồi đó bạn là một em bé mũm mĩm thật đấy.'],
        ['Adam','I know I was. But I am thinner now, and I am taller than my dad.','/aɪ noʊ aɪ wəz | bʌt aɪ æm ˈθɪnər naʊ ænd aɪ æm ˈtɔːlər ðæn maɪ dæd/','Mình biết mà. Nhưng bây giờ mình gầy hơn và cao hơn bố mình.'],
        ['Jen','These are super cute baby pictures.','/ðiːz ɑːr ˈsuːpər kjuːt ˈbeɪbi ˈpɪktʃərz/','Đây đúng là những bức ảnh em bé siêu dễ thương.'],
        ['Adam',"Your baby pictures are super cute, too. You have your mom's nose.",'/jʊr ˈbeɪbi ˈpɪktʃərz ɑːr ˈsuːpər kjuːt tuː | ju hæv jʊr mɑːmz noʊz/','Ảnh hồi bé của bạn cũng siêu đáng yêu. Bạn có chiếc mũi giống mẹ.'],
        ['Jen','Yes, I do. You look just like your dad.','/jes aɪ duː | ju lʊk dʒʌst laɪk jʊr dæd/','Đúng vậy. Còn bạn thì trông giống hệt bố của bạn.'],
        ['Adam','Yes, I have his eyes and nose.','/jes | aɪ hæv hɪz aɪz ænd noʊz/','Ừ, mình có đôi mắt và chiếc mũi giống của bố.']
      ],
      grammar: [
        ['look (just) like','look like + danh từ/đại từ để nói ai trông giống ai. Câu hỏi: Who do you look like in your family?'],
        ['So sánh hơn với tính từ ngắn','S1 + be + adj-er + than + S2. Ví dụ taller than, thinner than, fatter than.'],
        ['become + adjective & by + V-ing','become + tính từ diễn tả thay đổi trạng thái. by + V-ing diễn tả cách thức.'],
        ['not ... any more & cách nói tuổi','S + do/does not + V + ... + any more. Nói tuổi: be + số + month(s)/year(s) + old.'],
        ['Nét giống bố mẹ','S + have/has + sở hữu cách hoặc tính từ sở hữu + bộ phận cơ thể: your mom’s nose / his eyes.'],
        ['was/were và am/is/are','Dùng was/were cho quá khứ và am/is/are cho hiện tại khi mô tả sự thay đổi ngoại hình.']
      ],
      notes: [
        ['Quy tắc CVC khi thêm -er','thin → thinner · fat → fatter · big → bigger · slim → slimmer.'],
        ['Có thể lược bỏ than khi ngữ cảnh đã rõ','But I am thinner now. → ngầm so với lúc nhỏ.']
      ]
    }
  };

  const STORE_LESSON = 'lf_mobile_english_lesson_v1';
  const STORE_TAB = 'lf_mobile_english_tab_v1';
  const VALID_TABS = new Set(['vocab','examples','dialogue','grammar']);
  let lessonId = (() => { try { return localStorage.getItem(STORE_LESSON) || 'birthday'; } catch (_) { return 'birthday'; } })();
  let tab = (() => { try { const x = localStorage.getItem(STORE_TAB); return VALID_TABS.has(x) ? x : 'vocab'; } catch (_) { return 'vocab'; } })();
  let playingToken = 0;

  function isMobileDevice() {
    const ua = String(navigator.userAgent || '');
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    let coarse = false;
    try { coarse = !!window.matchMedia?.('(pointer: coarse)').matches; } catch (_) {}
    const sw = Math.min(Number(screen.width || 9999), Number(screen.height || 9999));
    return mobileUA || (touch && coarse && sw <= 1024);
  }

  function selected51Talk() {
    const lang = String(document.getElementById('studyLangFilter')?.value || '');
    const category = String(document.getElementById('studyCategoryFilter')?.value || '');
    const topic = String(document.getElementById('studyTopicFilter')?.value || '');
    let card = null;
    try { card = Array.isArray(window.filteredDeck) && window.filteredDeck.length ? window.filteredDeck[window.currentIndex || 0] : null; } catch (_) {}
    return lang === 'Tiếng Anh' && (/51Talk/i.test(category) || /51Talk/i.test(topic) || String(card?.id || '').startsWith('en51_') || card?.category === '51Talk English');
  }

  function inferLesson() {
    const topic = String(document.getElementById('studyTopicFilter')?.value || '').toLowerCase();
    if (/birthday|happy birthday|unit 1|u1/.test(topic)) return 'birthday';
    if (/dad|appearance|unit 6|u6/.test(topic)) return 'family';
    if (/headache|health|workplace|2026-10-28|2026-10-29|unit 3/.test(topic)) return 'health';
    return null;
  }

  function speak(text, rate = 0.82, onEnd) {
    if (!text || !('speechSynthesis' in window)) { onEnd?.(); return; }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate;
      if (onEnd) u.onend = onEnd;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (_) { onEnd?.(); }
  }

  function speakSequence(lines) {
    const token = ++playingToken;
    const queue = (lines || []).filter(Boolean).slice();
    const next = () => {
      if (token !== playingToken || !queue.length) return;
      const text = queue.shift();
      if (!text) return next();
      if (!('speechSynthesis' in window)) return;
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.82;
        u.onend = next;
        speechSynthesis.speak(u);
      } catch (_) {}
    };
    try { speechSynthesis.cancel(); } catch (_) {}
    next();
  }

  function ensureStyle() {
    if (document.getElementById('lfEnglishMobileV1Style')) return;
    const s = document.createElement('style');
    s.id = 'lfEnglishMobileV1Style';
    s.textContent = `
      #lfEnglishMobileV1{display:none;width:100%;max-width:860px;margin:0 auto 22px;padding:0 10px;color:#0f172a;box-sizing:border-box}
      #lfEnglishMobileV1 *{box-sizing:border-box}
      #lfEnglishMobileV1.on{display:block}
      .lfem-hero{background:#173b74;color:#fff;border-radius:18px;padding:16px;box-shadow:0 8px 22px rgba(15,23,42,.12)}
      .lfem-kicker{font-size:12px;font-weight:900;letter-spacing:.05em;color:#fde68a}.lfem-title{font-size:21px;line-height:1.2;font-weight:950;margin-top:5px}.lfem-sub{font-size:13px;line-height:1.45;color:#dbeafe;margin-top:6px}
      .lfem-picker{margin-top:10px}.lfem-picker label{display:block;font-size:11px;font-weight:900;color:#64748b;margin:0 0 5px 3px}.lfem-picker select{width:100%;min-height:48px;border:1px solid #cbd5e1;border-radius:13px;background:#fff;color:#0f172a;padding:0 12px;font-size:16px;font-weight:800}
      .lfem-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0}.lfem-tab{min-height:46px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#475569;font-size:12px;font-weight:900;padding:6px 4px;touch-action:manipulation}.lfem-tab.active{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
      .lfem-note{background:#fff7ed;border:1px solid #fed7aa;border-radius:13px;padding:10px 11px;margin-bottom:9px}.lfem-note b{display:block;color:#9a3412;font-size:13px}.lfem-note p{margin:5px 0 0;color:#7c2d12;font-size:12px;line-height:1.5}
      .lfem-card{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:13px;margin-bottom:9px;box-shadow:0 2px 8px rgba(15,23,42,.035)}
      .lfem-row{display:flex;align-items:flex-start;gap:9px}.lfem-main{min-width:0;flex:1}.lfem-word{font-size:17px;font-weight:950;color:#0f3c78;line-height:1.25}.lfem-en{font-size:15px;font-weight:850;line-height:1.5;color:#172033}.lfem-ipa{font-size:12px;color:#64748b;line-height:1.4;margin-top:4px}.lfem-vi{font-size:13px;line-height:1.5;color:#475569;margin-top:8px}.lfem-use{font-size:12px;line-height:1.5;color:#475569;margin-top:7px}.lfem-use b{color:#1d4ed8}
      .lfem-audio{flex:0 0 44px;width:44px;height:44px;border:0;border-radius:12px;background:#eff6ff;color:#1d4ed8;font-size:18px;touch-action:manipulation}
      .lfem-speaker{display:inline-block;font-size:11px;font-weight:950;color:#1d4ed8;background:#eff6ff;border-radius:999px;padding:4px 7px;margin-bottom:5px}.lfem-dialogue{border-left:4px solid #2563eb}
      .lfem-playall{width:100%;min-height:46px;border:0;border-radius:12px;background:#173b74;color:#fff;font-weight:900;font-size:14px;margin-bottom:10px;touch-action:manipulation}
      .lfem-grammar details{background:#fff;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:8px;padding:0 12px}.lfem-grammar summary{padding:13px 0;font-size:14px;font-weight:900;line-height:1.35}.lfem-grammar p{font-size:13px;line-height:1.55;color:#475569;margin:0 0 13px}
      body.lf-english-mobile-v1-active #flashcardContainer,
      body.lf-english-mobile-v1-active #studyAnswerPanel,
      body.lf-english-mobile-v1-active #lf51CoachShell,
      body.lf-english-mobile-v1-active #lf51GrammarPanel,
      body.lf-english-mobile-v1-active #lf51PatternPractice,
      body.lf-english-mobile-v1-active #lf51Listening,
      body.lf-english-mobile-v1-active #lf51MobileLessonV64{display:none!important}
      @media (max-width:390px){.lfem-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.lfem-title{font-size:19px}}
      @media (orientation:landscape){#lfEnglishMobileV1{max-width:920px}.lfem-hero{padding:14px 16px}.lfem-tabs{grid-template-columns:repeat(4,minmax(0,1fr))}}
    `;
    document.head.appendChild(s);
  }

  function ensureRoot() {
    let root = document.getElementById('lfEnglishMobileV1');
    if (root) return root;
    const flash = document.getElementById('flashcardContainer');
    if (!flash?.parentElement) return null;
    root = document.createElement('section');
    root.id = 'lfEnglishMobileV1';
    flash.parentElement.insertBefore(root, flash);
    return root;
  }

  function renderVocab(L) {
    const notes = (L.notes || []).map(n => `<div class="lfem-note"><b>${esc(n[0])}</b><p>${esc(n[1])}</p></div>`).join('');
    return notes + L.vocab.map(v => `<article class="lfem-card"><div class="lfem-row"><div class="lfem-main"><div class="lfem-word">${esc(v[0])}</div><div class="lfem-ipa">${esc(v[1])}</div></div><button type="button" class="lfem-audio" data-audio="${esc(v[0])}" aria-label="Nghe phát âm">🔊</button></div><div class="lfem-vi"><b>${esc(v[2])}</b></div>${v[3] ? `<div class="lfem-use"><b>Cách dùng:</b> ${esc(v[3])}</div>` : ''}</article>`).join('');
  }

  function renderExamples(L) {
    return L.examples.map((e, i) => `<article class="lfem-card"><div class="lfem-row"><div class="lfem-main"><div class="lfem-use"><b>Câu ${i+1}</b></div><div class="lfem-en">${esc(e[0])}</div><div class="lfem-ipa">${esc(e[1])}</div></div><button type="button" class="lfem-audio" data-audio="${esc(e[0])}" aria-label="Nghe câu">🔊</button></div><div class="lfem-vi">${esc(e[2])}</div></article>`).join('');
  }

  function renderDialogue(L) {
    return `<button type="button" class="lfem-playall" data-play-dialogue>▶ Nghe toàn bộ hội thoại</button>` + L.dialogue.map(d => `<article class="lfem-card lfem-dialogue"><div class="lfem-row"><div class="lfem-main"><span class="lfem-speaker">${esc(d[0])}</span><div class="lfem-en">${esc(d[1])}</div><div class="lfem-ipa">${esc(d[2])}</div></div><button type="button" class="lfem-audio" data-audio="${esc(d[1])}" aria-label="Nghe câu thoại">🔊</button></div><div class="lfem-vi">${esc(d[3])}</div></article>`).join('');
  }

  function renderGrammar(L) {
    return `<div class="lfem-grammar">${L.grammar.map((g, i) => `<details ${i===0?'open':''}><summary>${i+1}. ${esc(g[0])}</summary><p>${esc(g[1])}</p></details>`).join('')}</div>`;
  }

  function renderActiveContent(L) {
    if (tab === 'examples') return renderExamples(L);
    if (tab === 'dialogue') return renderDialogue(L);
    if (tab === 'grammar') return renderGrammar(L);
    return renderVocab(L);
  }

  function render() {
    const root = ensureRoot();
    if (!root) return;
    const L = LESSONS[lessonId] || LESSONS.birthday;
    const tabs = [
      ['vocab','📚 Từ vựng'],['examples','📝 Câu mẫu'],['dialogue','💬 Hội thoại'],['grammar','📘 Ngữ pháp']
    ];
    root.innerHTML = `
      <header class="lfem-hero"><div class="lfem-kicker">51TALK CLASSIC ENGLISH · MOBILE LESSON</div><div class="lfem-title">${esc(L.unit)} · ${esc(L.title)}</div><div class="lfem-sub">${esc(L.subtitle)}</div></header>
      <div class="lfem-picker"><label for="lfEnglishLessonSelect">CHỌN BÀI HỌC</label><select id="lfEnglishLessonSelect">${Object.values(LESSONS).map(x => `<option value="${x.id}" ${x.id===lessonId?'selected':''}>${esc(x.unit)} · ${esc(x.title)}</option>`).join('')}</select></div>
      <nav class="lfem-tabs" aria-label="Nội dung bài học">${tabs.map(x => `<button type="button" class="lfem-tab ${tab===x[0]?'active':''}" data-tab="${x[0]}">${x[1]}</button>`).join('')}</nav>
      <main id="lfEnglishMobileContent">${renderActiveContent(L)}</main>`;
  }

  function setActive(on) {
    const root = ensureRoot();
    if (!root) return;
    document.body.classList.toggle('lf-english-mobile-v1-active', !!on);
    root.classList.toggle('on', !!on);
    if (on) render();
    else { ++playingToken; try { speechSynthesis?.cancel?.(); } catch (_) {} }
  }

  function sync() {
    if (!isMobileDevice()) { setActive(false); return; }
    const on = selected51Talk();
    if (on) {
      const inferred = inferLesson();
      if (inferred && LESSONS[inferred]) lessonId = inferred;
    }
    setActive(on);
  }

  function bind() {
    const root = ensureRoot();
    if (root && root.dataset.bound !== '1') {
      root.dataset.bound = '1';
      root.addEventListener('click', event => {
        const tabBtn = event.target.closest?.('[data-tab]');
        if (tabBtn) {
          tab = tabBtn.dataset.tab;
          try { localStorage.setItem(STORE_TAB, tab); } catch (_) {}
          render();
          return;
        }
        const audio = event.target.closest?.('[data-audio]');
        if (audio) { ++playingToken; speak(audio.dataset.audio); return; }
        if (event.target.closest?.('[data-play-dialogue]')) {
          const L = LESSONS[lessonId] || LESSONS.birthday;
          speakSequence(L.dialogue.map(d => d[1]));
        }
      });
      root.addEventListener('change', event => {
        if (event.target?.id === 'lfEnglishLessonSelect') {
          const next = event.target.value;
          if (LESSONS[next]) {
            lessonId = next;
            try { localStorage.setItem(STORE_LESSON, lessonId); } catch (_) {}
            render();
          }
        }
      });
    }

    ['studyLangFilter','studyCategoryFilter','studyTopicFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.dataset.lfEnglishMobileBound !== '1') {
        el.dataset.lfEnglishMobileBound = '1';
        el.addEventListener('change', () => setTimeout(sync, 0));
      }
    });
  }

  function init() {
    if (!isMobileDevice()) return;
    ensureStyle();
    ensureRoot();
    bind();
    setTimeout(sync, 100);
    window.addEventListener('pageshow', () => setTimeout(sync, 0), { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(sync, 0); }, { passive: true });
    // No resize/orientation mode switch: portrait and landscape keep this same UI.
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();