/* 51Talk Classic English Level 2 · User-supplied Unit 5 and Unit 6 Lesson 2 PDFs. */
(() => {
  const lessons = [
  {
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
  {
    "id": "basketballL2",
    "unit": "UNIT 5 · LESSON 2",
    "title": "My Favorite Sport Is Basketball",
    "subtitle": "Nói về môn thể thao yêu thích",
    "vocab": [
      [
        "sports",
        "/spɔː(r)ts/",
        "Thể thao, các môn thể thao",
        "Dùng sport trong “my favorite sport”, sports trong “all kinds of sports”."
      ],
      [
        "basketball",
        "/ˈbæskɪtbɔːl/",
        "Môn bóng rổ hoặc quả bóng rổ",
        "play basketball · a basketball on the ground"
      ],
      [
        "tennis",
        "/ˈtenɪs/",
        "Môn quần vợt",
        "play tennis · a tennis racket"
      ],
      [
        "ping pong",
        "/ˈpɪŋ pɒŋ/",
        "Môn bóng bàn",
        "Cũng gọi là table tennis."
      ],
      [
        "be good at",
        "/biː ɡʊd æt/",
        "Giỏi về việc gì",
        "be good at + danh từ hoặc V-ing"
      ],
      [
        "running",
        "/ˈrʌnɪŋ/",
        "Chạy bộ",
        "go running · be good at running"
      ],
      [
        "football",
        "/ˈfʊtbɔːl/",
        "Môn bóng đá hoặc quả bóng đá",
        "play football · soccer"
      ],
      [
        "all kinds of",
        "/ɔːl kaɪndz əv/",
        "Tất cả các loại",
        "all kinds of sports"
      ],
      [
        "on the ground",
        "/ɒn ðə ɡraʊnd/",
        "Trên mặt đất, trên mặt sân",
        "on the ground ngoài sân · on the floor trong nhà"
      ],
      [
        "roommate",
        "/ˈruːmmeɪt/",
        "Bạn cùng phòng",
        "Bella is talking to her roommate Clark."
      ],
      [
        "do some sports",
        "/duː sʌm spɔːts/",
        "Tập thể thao",
        "We are going to do some sports on Sunday."
      ],
      [
        "Thanks for inviting me",
        "/θæŋks fɔːr ɪnˈvaɪtɪŋ miː/",
        "Cảm ơn vì đã mời mình",
        "Sau for, invite chuyển thành inviting."
      ]
    ],
    "examples": [
      [
        "sports",
        "Jim likes all kinds of sports.",
        "Jim thích tất cả các môn thể thao."
      ],
      [
        "basketball",
        "There is a basketball on the ground.",
        "Có một quả bóng rổ trên mặt sân."
      ],
      [
        "tennis",
        "The two men are playing tennis.",
        "Hai người đàn ông đang chơi quần vợt."
      ],
      [
        "ping pong",
        "Many Chinese people play ping pong.",
        "Nhiều người Trung Quốc chơi bóng bàn."
      ],
      [
        "be good at",
        "The girl is good at running.",
        "Cô gái ấy giỏi chạy bộ."
      ],
      [
        "Sắp xếp câu 1",
        "My favorite sport is tennis.",
        "Môn thể thao yêu thích của tôi là quần vợt."
      ],
      [
        "Sắp xếp câu 2",
        "I like playing basketball and football.",
        "Tôi thích chơi bóng rổ và bóng đá."
      ],
      [
        "Sắp xếp câu 3",
        "I am good at playing ping pong.",
        "Tôi giỏi chơi bóng bàn."
      ]
    ],
    "dialogue": [
      [
        "Bella",
        "Hey Clark, we are going to do some sports on Sunday. Do you want to come?",
        "Chào Clark, Chủ nhật này bọn mình định đi chơi thể thao. Bạn muốn đi cùng không?"
      ],
      [
        "Clark",
        "Do you play basketball? My favorite sport is basketball.",
        "Các bạn có chơi bóng rổ không? Môn thể thao yêu thích của mình là bóng rổ."
      ],
      [
        "Bella",
        "No, we are going to play ping pong and tennis.",
        "Không, bọn mình định chơi bóng bàn và quần vợt."
      ],
      [
        "Clark",
        "I like playing ping pong, too. I'm really good at it.",
        "Mình cũng thích chơi bóng bàn. Mình thực sự giỏi môn đó."
      ],
      [
        "Bella",
        "That's great. Let's play ping pong on Sunday.",
        "Tuyệt quá. Chủ nhật mình cùng chơi bóng bàn nhé."
      ],
      [
        "Clark",
        "Okay. Thanks for inviting me.",
        "Được thôi. Cảm ơn bạn đã mời mình."
      ]
    ],
    "grammar": [
      [
        "My favorite sport is …",
        "Dùng sport ở số ít với is. My favorite sport is football."
      ],
      [
        "Play, do và go",
        "play basketball, play football, play tennis · go running, go swimming · do some sports, do yoga."
      ],
      [
        "Be good at + danh từ hoặc V-ing",
        "She is good at running. Sau giới từ at, dùng dạng -ing của động từ."
      ],
      [
        "Be going to + động từ",
        "We are going to do some sports on Sunday. Dùng on trước thứ trong tuần."
      ]
    ],
    "speaking": [
      [
        "Teacher Eva",
        "Hi, Mr. Harry! I want to play tennis on Friday. Do you want to come?"
      ],
      [
        "You (Harry)",
        "Yes, I'd love to! I like playing tennis, too."
      ],
      [
        "Teacher Eva",
        "Are you good at playing tennis? What is your favorite sport?"
      ],
      [
        "You (Harry)",
        "Yes, I am good at it. My favorite sport is basketball."
      ],
      [
        "Teacher Eva",
        "That's great! Let's play together on Friday after work."
      ],
      [
        "You (Harry)",
        "Okay! Thanks for inviting me!"
      ]
    ],
    "extras": [
      [
        "Sắp xếp câu",
        "is / tennis / favorite / My / sport · basketball / I like / and football / playing · ping pong / playing / I / am good at."
      ],
      [
        "Điền lời thoại của Clark",
        "Do you play basketball? My favorite sport is basketball. → I like playing ping pong, too. I'm really good at it."
      ]
    ]
  },
  {
    "id": "blueEyesL2",
    "unit": "UNIT 6 · LESSON 2",
    "title": "Big Blue Eyes",
    "subtitle": "Miêu tả ngoại hình của anh hoặc em trai",
    "vocab": [
      [
        "blonde",
        "/blɒnd/",
        "Vàng hoe (màu tóc)",
        "blonde hair · cũng có thể viết blond"
      ],
      [
        "short",
        "/ʃɔː(r)t/",
        "Thấp (người), ngắn (tóc, đồ vật)",
        "He is short and slim. Trái nghĩa với tall khi tả chiều cao."
      ],
      [
        "slim",
        "/slɪm/",
        "Mảnh mai, thon gọn",
        "a slim body"
      ],
      [
        "blue eyes",
        "/bluː aɪz/",
        "Đôi mắt xanh dương",
        "big blue eyes · eyes kết thúc bằng âm /z/"
      ],
      [
        "fair skin",
        "/feə(r) skɪn/",
        "Làn da trắng sáng",
        "Skin không đếm được. Dùng has fair skin."
      ],
      [
        "appearance",
        "/əˈpɪərəns/",
        "Ngoại hình, diện mạo",
        "different appearances"
      ],
      [
        "dark skin",
        "/dɑːk skɪn/",
        "Làn da ngăm",
        "So sánh với fair skin."
      ],
      [
        "black eyes",
        "/blæk aɪz/",
        "Đôi mắt đen",
        "Trong bài dùng để miêu tả màu mắt."
      ],
      [
        "long hair",
        "/lɒŋ heə(r)/",
        "Mái tóc dài",
        "She has long black hair."
      ],
      [
        "short hair",
        "/ʃɔːt heə(r)/",
        "Mái tóc ngắn",
        "short brown hair"
      ],
      [
        "tall",
        "/tɔːl/",
        "Cao, cao ráo",
        "Is he tall?"
      ],
      [
        "little brother",
        "/ˈlɪtl ˈbrʌðə(r)/",
        "Em trai",
        "younger brother · older brother là anh trai"
      ],
      [
        "What does he look like?",
        "/wɒt dʌz hiː lʊk laɪk/",
        "Anh ấy trông như thế nào?",
        "Đổi he thành she khi hỏi về nữ."
      ],
      [
        "I heard",
        "/aɪ hɜː(r)d/",
        "Mình nghe nói",
        "I heard (that) you have a brother."
      ]
    ],
    "examples": [
      [
        "blonde",
        "The woman with blonde hair is sitting at a table.",
        "Người phụ nữ có mái tóc vàng đang ngồi ở bàn."
      ],
      [
        "slim",
        "Sally wants to have a slim body just like her friend's.",
        "Sally muốn có vóc dáng mảnh mai giống bạn mình."
      ],
      [
        "blue eyes",
        "The little girl with blue eyes is very cute.",
        "Cô bé có đôi mắt xanh dương rất dễ thương."
      ],
      [
        "fair skin",
        "Sasha has blue eyes and fair skin.",
        "Sasha có đôi mắt xanh dương và làn da trắng sáng."
      ],
      [
        "short",
        "My brother Adam is short.",
        "Anh/em trai Adam của tôi có vóc người thấp."
      ],
      [
        "Khám phá 1",
        "Nancy's big blue eyes are very beautiful.",
        "Đôi mắt to màu xanh dương của Nancy rất đẹp."
      ],
      [
        "Khám phá 2",
        "My brother Tommy has fair skin.",
        "Em trai Tommy của tôi có làn da trắng trẻo."
      ],
      [
        "Khám phá 3",
        "What does the man in the picture look like?",
        "Người đàn ông trong bức ảnh trông như thế nào?"
      ]
    ],
    "dialogue": [
      [
        "Matt",
        "Karen, I heard you have a brother.",
        "Karen này, mình nghe nói bạn có anh hoặc em trai."
      ],
      [
        "Karen",
        "Yes. I have a little brother. He is eight.",
        "Đúng vậy. Mình có một cậu em trai. Em ấy tám tuổi."
      ],
      [
        "Matt",
        "What does he look like?",
        "Em ấy trông như thế nào?"
      ],
      [
        "Karen",
        "He has blonde hair, blue eyes, and fair skin. He's really cute.",
        "Em ấy có mái tóc vàng, đôi mắt xanh dương và làn da trắng sáng. Em ấy rất dễ thương."
      ],
      [
        "Matt",
        "Is he tall?",
        "Em ấy có cao không?"
      ],
      [
        "Karen",
        "No, he is short and slim.",
        "Không, em ấy thấp và mảnh mai."
      ]
    ],
    "grammar": [
      [
        "Is hay has?",
        "Dùng is + tính từ cho vóc dáng: He is short and slim. Dùng has + cụm danh từ cho tóc, mắt, da: He has blonde hair."
      ],
      [
        "Hỏi về ngoại hình",
        "What does he look like? Sau does, dùng look ở dạng nguyên mẫu. What does he like? hỏi về sở thích."
      ],
      [
        "Trật tự tính từ",
        "Kích thước hoặc độ dài đứng trước màu sắc: big blue eyes, long black hair, short brown hair."
      ],
      [
        "With + đặc điểm",
        "The woman with blonde hair is sitting at a table. With đứng sau danh từ chỉ người."
      ]
    ],
    "speaking": [
      [
        "Teacher Eva",
        "Hey, Mr. Harry! Do you have a brother?"
      ],
      [
        "You (Harry)",
        "Yes, I have a brother."
      ],
      [
        "Teacher Eva",
        "What does he look like?"
      ],
      [
        "You (Harry)",
        "He has short black hair, black eyes, and fair skin."
      ],
      [
        "Teacher Eva",
        "Is he tall?"
      ],
      [
        "You (Harry)",
        "Yes, he is tall and slim."
      ]
    ],
    "extras": [
      [
        "Đổi vai khi luyện nói",
        "She has long black hair, big black eyes, and fair skin. She is very pretty. → She is short and slim."
      ],
      [
        "Điền lời thoại của Karen",
        "He has blonde hair, blue eyes, and fair skin. He's really cute. → No, he is short and slim."
      ]
    ]
  }
];
  window.LF51_LEVEL2_LESSONS = Object.fromEntries(lessons.map(lesson => [lesson.id, lesson]));
  window.LF51_LEVEL2_IPA = {
    'My favorite sport is tennis.':'/maɪ ˈfeɪvərɪt spɔːt ɪz ˈtenɪs/',
    'I like playing basketball and football.':'/aɪ laɪk ˈpleɪɪŋ ˈbæskɪtbɔːl ænd ˈfʊtbɔːl/',
    'I am good at playing ping pong.':'/aɪ æm ɡʊd æt ˈpleɪɪŋ pɪŋ pɒŋ/'
  };
  const existing = new Set(DEFAULT_CARDS.map(card => card.id));
  for (const lesson of lessons) {
    lesson.topic = '51Talk English - ' + lesson.unit + ' · ' + lesson.title;
    const base = {lang:'Tiếng Anh', level:lesson.id === 'birthday' ? '51Talk · Unit 1' : '51Talk · Level 2', category:'51Talk English', topic:lesson.topic,
      interval:0, repetitions:0, easeFactor:2.5, nextReview:0};
    function add(section, index, fields) {
      const id = 'en51_' + lesson.id + '_' + section + '_' + (index + 1);
      if (existing.has(id)) return;
      existing.add(id);
      DEFAULT_CARDS.push({...base, id, sourceSection:lesson.unit + ' · ' + section, ...fields});
    }
    lesson.vocab.forEach(([word, phonetic, meaning, usage], i) => {
      const example = lesson.examples.find(row => row[0] === word);
      add('Vocabulary', i, {cardType:'vocab', word, phonetic, meaning, usage, example:example?.[1] || '', exampleTrans:example?.[2] || ''});
    });
    for (const [section, rows] of [['Examples',lesson.examples], ['Dialogue',lesson.dialogue]]) {
      rows.forEach(([sourceLabel,en,vi], i) => add(section,i,{cardType:'sentence', word:vi, chinese:en, phonetic:window.LF51_LEVEL2_IPA[en] || '', meaning:'', example:en, exampleTrans:vi, sourceLabel}));
    }
  }
})();
