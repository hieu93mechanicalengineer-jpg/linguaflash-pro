/* LinguaFlash · 51Talk English learning layer v2
   Beginner-friendly lesson support:
   - IPA for every English sentence card and every example sentence
   - Explicit English TTS buttons for answer + example
   - Contextual grammar explanations on each 51Talk card
   - Lesson-level grammar overview inside the Grammar tab
*/
(() => {
  'use strict';
  if (window.__LF_51TALK_LEARNING_V2__) return;
  window.__LF_51TALK_LEARNING_V2__ = true;

  const SENTENCE_IPA = {
    en51_20261028_s01: '/ˌmɪstər ˈsmɪθs roʊl ɪz tə prəˈvaɪd ˈteknɪkəl səˈpɔːrt fər ðə ˈklaɪənts ɔːl ˈoʊvər ˈjʊrəp/',
    en51_20261028_s02: '/ɑːn ðə kɔːrs wi rɪˈsiːvd ˈtreɪnɪŋ ɪn ˈevri ˈæspekt əv ðə dʒɑːb/',
    en51_20261028_s03: '/ˈlɪndə ɪz ən ɪmˈplɔɪiː əv ˈsɪtibæŋk ɪn ðə steɪts/',
    en51_20261028_s04: '/ɪt teɪks taɪm fər mi tə əˈdæpt tə ə nuː ˈwɜːrkɪŋ ɪnˈvaɪrənmənt/',
    en51_20261028_s05: '/ə ˈkʌpəl əv mʌnθs ˈæftər aɪ muːvd tə ˈlʌndən | aɪ felt kəmˈpliːtli æt hoʊm ðer/',
    en51_20261029_d01: '/haɪ dʒoʊ | ɑːr ju oʊˈkeɪ | ju doʊnt lʊk wel/',
    en51_20261029_d02: '/aɪ doʊnt fiːl ˈveri ɡʊd | aɪ hæv ə ˈterəbəl ˈhedeɪk/',
    en51_20261029_d03: '/aɪm ˈsɑːri tə hɪr ðæt | wʌt ˈhæpənd/',
    en51_20261029_d04: '/aɪ went aʊt wɪð maɪ frendz læst naɪt ænd ɪt ˈstɑːrtɪd tə reɪn ɑːn maɪ weɪ hoʊm/',
    en51_20261029_d05: '/ðæts ʌnˈlʌki | dɪd ju teɪk ən ʌmˈbrelə wɪð ju/',
    en51_20261029_d06: '/noʊ | aɪ ɡɑːt ɔːl wet | ðə reɪn wəz ˈrɪəli ˈhevi/',
    en51_20261029_d07: '/ðæt ɪz nɑːt ɡʊd | ɪts ˈiːzi tə kætʃ ə koʊld wen ju ɑːr wet/',
    en51_20261029_d08: '/wel | ˈmeɪbi aɪ niːd tə hæv ə ɡʊd rest təˈnaɪt/',
    en51_20261029_d09: '/ˈɔːlsoʊ | ˈdrɪŋkɪŋ mɔːr ˈwɔːtər meɪ meɪk ju fiːl ˈbetər/',
    en51_20261029_d10: '/θæŋk ju | aɪ wɪl teɪk ker əv maɪˈself/'
  };

  const EXAMPLE_IPA = {
    en51_20261028_v01: SENTENCE_IPA.en51_20261028_s01,
    en51_20261028_v02: SENTENCE_IPA.en51_20261028_s02,
    en51_20261028_v03: SENTENCE_IPA.en51_20261028_s03,
    en51_20261028_v04: SENTENCE_IPA.en51_20261028_s04,
    en51_20261028_v05: SENTENCE_IPA.en51_20261028_s05,
    en51_20261028_v06: '/aɪ fiːl ˈnɜːrvəs/',
    en51_20261028_v07: '/aɪ fiːl ˈwɜːrid/',
    en51_20261028_s01: SENTENCE_IPA.en51_20261028_s01,
    en51_20261028_s02: SENTENCE_IPA.en51_20261028_s02,
    en51_20261028_s03: SENTENCE_IPA.en51_20261028_s03,
    en51_20261028_s04: SENTENCE_IPA.en51_20261028_s04,
    en51_20261028_s05: SENTENCE_IPA.en51_20261028_s05,
    en51_20261029_w01: '/wʌt də ju duː wen ju ɑːr sɪk | steɪ æt hoʊm/',
    en51_20261029_w02: '/wʌt də ju duː wen ju ɑːr sɪk | ɡoʊ tə ðə ˈhɑːspɪtəl/',
    en51_20261029_w03: '/wʌt də ju duː wen ju ɑːr sɪk | hæv ə rest/',
    en51_20261029_v01: '/ju doʊnt lʊk wel | wʌt ˈhæpənd/',
    en51_20261029_v02: '/ˈdʒeni ɪz nɑːt ˈfiːlɪŋ wel bɪˈkɔːz ʃi hæz ə ˈhedeɪk/',
    en51_20261029_v03: '/ɪt ɪz ˈreɪnɪŋ ˌaʊtˈsaɪd | rɪˈmembər tə brɪŋ ən ʌmˈbrelə/',
    en51_20261029_v04: '/ˈdeɪzi kɔːt ə koʊld ˈjestərdeɪ | ʃi niːdz sʌm rest/',
    en51_20261029_v05: '/ˈluːsiz ˈhʌzbənd ɪz ɪl ænd ʃi ɪz ˈteɪkɪŋ ker əv hɪm/',
    en51_20261029_p01: SENTENCE_IPA.en51_20261029_d02,
    en51_20261029_p02: '/aɪ hæv ə ˈterəbəl ˈhedeɪk/',
    en51_20261029_p03: SENTENCE_IPA.en51_20261029_d03,
    en51_20261029_p04: '/ɪt ˈstɑːrtɪd tə reɪn ɑːn maɪ weɪ hoʊm/',
    en51_20261029_p05: SENTENCE_IPA.en51_20261029_d06,
    en51_20261029_p06: '/ˈmeɪbi aɪ niːd tə hæv ə ɡʊd rest təˈnaɪt/',
    en51_20261029_p07: '/ˈdrɪŋkɪŋ mɔːr ˈwɔːtər meɪ meɪk ju fiːl ˈbetər/',
    en51_20261029_p08: SENTENCE_IPA.en51_20261029_d10,
    en51_20261029_d01: SENTENCE_IPA.en51_20261029_d01,
    en51_20261029_d02: SENTENCE_IPA.en51_20261029_d02,
    en51_20261029_d03: SENTENCE_IPA.en51_20261029_d03,
    en51_20261029_d04: SENTENCE_IPA.en51_20261029_d04,
    en51_20261029_d05: SENTENCE_IPA.en51_20261029_d05,
    en51_20261029_d06: SENTENCE_IPA.en51_20261029_d06,
    en51_20261029_d07: SENTENCE_IPA.en51_20261029_d07,
    en51_20261029_d08: SENTENCE_IPA.en51_20261029_d08,
    en51_20261029_d09: SENTENCE_IPA.en51_20261029_d09,
    en51_20261029_d10: SENTENCE_IPA.en51_20261029_d10
  };

  const G = {
    ROLE_TO: {
      title: 'S + be + to + V — nói vai trò / nhiệm vụ',
      pattern: 'My/His role is to + động từ nguyên mẫu.',
      explain: 'Dùng khi nói nhiệm vụ hoặc mục đích chính của một người/vị trí.',
      lesson: "Mr. Smith's role is to provide technical support...",
      extra: 'My job is to check the drawings before production.',
      mistake: 'Sau “is to” dùng động từ nguyên mẫu: is to provide, không phải is to providing.'
    },
    TRAINING_IN: {
      title: 'receive/get training in + lĩnh vực',
      pattern: 'receive/get training in + noun / field',
      explain: '“training” thường là danh từ không đếm được khi nói chung về việc đào tạo.',
      lesson: 'We received training in every aspect of the job.',
      extra: 'I received training in furniture design.',
      mistake: 'Không cần “a” trong nghĩa chung: received training, không phải received a training.'
    },
    EMPLOYEE_OF: {
      title: 'be an employee of + công ty',
      pattern: 'S + be + an employee of + organization.',
      explain: 'Cách trang trọng để nói ai là nhân viên của công ty nào. Giao tiếp thường ngày có thể dùng “work for”.',
      lesson: 'Linda is an employee of Citibank.',
      extra: 'I work for a furniture company.',
      mistake: '“employee” là người lao động; “employer” là người/công ty tuyển dụng.'
    },
    IT_TAKES: {
      title: 'It takes + thời gian + (for someone) + to V',
      pattern: 'It takes + time + for + person + to + V.',
      explain: 'Dùng để nói một việc cần bao nhiêu thời gian hoặc cần thời gian để làm quen.',
      lesson: 'It takes time for me to adapt to a new working environment.',
      extra: 'It takes me 30 minutes to get to work.',
      mistake: 'Không dùng “It takes me 30 minutes for go”. Phải là “to go”.'
    },
    ADAPT_TO: {
      title: 'adapt to + danh từ / V-ing',
      pattern: 'adapt to + noun / pronoun / V-ing',
      explain: '“to” ở đây là giới từ, nên nếu theo sau là động từ thì dùng V-ing.',
      lesson: 'adapt to a new working environment',
      extra: 'I am adapting to working with a new team.',
      mistake: 'Không nói “adapt to work with...” khi “to” là giới từ; dùng “adapt to working...”.'
    },
    COUPLE_OF: {
      title: 'a couple of + danh từ số nhiều',
      pattern: 'a couple of + plural noun',
      explain: 'Thường nghĩa là “hai” hoặc trong giao tiếp có thể hiểu là “một vài”.',
      lesson: 'A couple of months after I moved to London...',
      extra: 'Give me a couple of minutes.',
      mistake: 'Danh từ sau “a couple of” dùng số nhiều: a couple of days.'
    },
    AFTER_CLAUSE: {
      title: 'after + mệnh đề / V-ing',
      pattern: 'after + S + V  |  after + V-ing',
      explain: 'Dùng để nói hành động xảy ra sau một hành động khác.',
      lesson: 'A couple of months after I moved to London, I felt at home there.',
      extra: 'After finishing work, I went home.',
      mistake: 'Nếu dùng mệnh đề đầy đủ phải có chủ ngữ: after I moved, không phải after moved.'
    },
    FEEL_ADJ: {
      title: 'feel + tính từ',
      pattern: 'S + feel + adjective',
      explain: 'Sau “feel” khi mô tả trạng thái, dùng tính từ: nervous, worried, tired, sick, better.',
      lesson: 'I feel nervous. / I feel worried.',
      extra: 'I feel tired today.',
      mistake: 'Không dùng trạng từ: “feel nervously” sai trong nghĩa “cảm thấy lo lắng”.'
    },
    WHAT_DO_WHEN: {
      title: 'What do you do when...? — hỏi thói quen / cách xử lý',
      pattern: 'What do/does + S + do when + S + V/be...?',
      explain: 'Dùng hiện tại đơn khi hỏi một tình huống thường xảy ra hoặc cách bạn thường xử lý.',
      lesson: 'What do you do when you are sick?',
      extra: 'What do you do when you feel tired?',
      mistake: 'Với “you” dùng do, không dùng does.'
    },
    LOOK_ADJ: {
      title: 'look + tính từ',
      pattern: 'S + look(s) + adjective',
      explain: '“look” là động từ nối khi nói ai/cái gì trông như thế nào.',
      lesson: "You don't look well.",
      extra: 'You look tired today.',
      mistake: 'Nói “look tired/well”, không dùng “look tiredly/wellly”.'
    },
    HAVE_SYMPTOM: {
      title: 'have + triệu chứng / bệnh',
      pattern: 'have + a headache / a cold / a fever / a cough',
      explain: 'Dùng “have” để nói mình đang có triệu chứng hoặc bệnh.',
      lesson: 'I have a terrible headache.',
      extra: 'I have a cold and a cough.',
      mistake: 'Không nói “I am headache”. Phải nói “I have a headache”.'
    },
    REMEMBER_TO: {
      title: 'remember to + V — nhớ phải làm việc gì',
      pattern: 'remember to + base verb',
      explain: 'Dùng khi nhắc ai đừng quên làm một việc trong tương lai.',
      lesson: 'Remember to bring an umbrella.',
      extra: 'Remember to check the drawing before you send it.',
      mistake: '“remember doing” là nhớ một việc đã làm; “remember to do” là nhớ phải làm.'
    },
    PAST_IRREGULAR: {
      title: 'Quá khứ đơn với động từ bất quy tắc',
      pattern: 'S + V2 + ...',
      explain: 'Bài này có nhiều động từ bất quy tắc cần nhớ theo cụm.',
      lesson: 'catch → caught, go → went, get → got, take → took, be → was/were',
      extra: 'I caught a cold yesterday. / I went home early.',
      mistake: 'Không thêm -ed vào động từ bất quy tắc: “catched” và “goed” là sai.'
    },
    TAKE_CARE_OF: {
      title: 'take care of + người / vật',
      pattern: 'take care of + noun / object pronoun',
      explain: 'Dùng để nói chăm sóc hoặc trông nom ai/cái gì.',
      lesson: 'She is taking care of him.',
      extra: 'I need to take care of my son.',
      mistake: 'Sau “of” dùng tân ngữ: him/her/me/us, không dùng he/she/I.'
    },
    PRESENT_CONT: {
      title: 'Hiện tại tiếp diễn: be + V-ing',
      pattern: 'am/is/are + V-ing',
      explain: 'Dùng cho hành động đang diễn ra ở hiện tại hoặc quanh thời điểm nói.',
      lesson: 'She is taking care of him.',
      extra: 'I am studying English now.',
      mistake: 'Phải có “be”: “She taking care...” là sai.'
    },
    SORRY_TO_HEAR: {
      title: "I'm sorry to hear that — phản hồi khi nghe tin không vui",
      pattern: "I'm sorry to hear that. + follow-up question",
      explain: 'Mẫu câu tự nhiên để thể hiện sự quan tâm, không nhất thiết là xin lỗi vì lỗi của mình.',
      lesson: "I'm sorry to hear that. What happened?",
      extra: "I'm sorry to hear that. Are you okay now?",
      mistake: 'Không dịch máy móc thành “tôi xin lỗi” trong mọi ngữ cảnh; ở đây nghĩa gần “tôi rất tiếc khi nghe vậy”.'
    },
    WHAT_HAPPENED: {
      title: 'What happened? — hỏi chuyện gì đã xảy ra',
      pattern: 'What happened?',
      explain: 'Ở đây “what” là chủ ngữ của “happened”, nên không cần did.',
      lesson: 'What happened?',
      extra: 'What happened yesterday?',
      mistake: 'Câu trung tính thường là “What happened?”, không phải “What did happen?”.'
    },
    ON_MY_WAY: {
      title: 'on my/your/his way + nơi chốn',
      pattern: 'on + possessive + way + home / to + place',
      explain: 'Dùng để nói “trên đường đi/về”. “home” không cần “to”.',
      lesson: 'It started to rain on my way home.',
      extra: 'I called you on my way to work.',
      mistake: 'Nói “on my way home”, không nói “on my way to home”.'
    },
    DID_QUESTION: {
      title: 'Câu hỏi quá khứ: Did + S + V nguyên mẫu?',
      pattern: 'Did + subject + base verb + ...?',
      explain: 'Khi đã có “did”, động từ chính quay về nguyên mẫu.',
      lesson: 'Did you take an umbrella with you?',
      extra: 'Did you finish the drawing yesterday?',
      mistake: 'Không nói “Did you took...?” hoặc “Did you finished...?”.'
    },
    GET_ADJ: {
      title: 'get + tính từ — trở nên / rơi vào trạng thái',
      pattern: 'get + adjective',
      explain: 'Dùng khi trạng thái thay đổi: get wet, get tired, get better, get sick.',
      lesson: 'I got all wet.',
      extra: 'I got tired after work.',
      mistake: '“got” là quá khứ của “get”.'
    },
    EASY_TO: {
      title: 'It is + tính từ + to V',
      pattern: 'It is + adjective + to + base verb',
      explain: 'Dùng để đánh giá một hành động là dễ, khó, quan trọng, cần thiết...',
      lesson: "It's easy to catch a cold when you are wet.",
      extra: 'It is important to check the dimensions twice.',
      mistake: 'Sau tính từ dùng “to + V”: easy to catch, không phải easy catching trong mẫu này.'
    },
    NEED_TO: {
      title: 'need to + V — cần phải làm gì',
      pattern: 'S + need(s) to + base verb',
      explain: 'Dùng để nói nhu cầu hoặc việc cần làm.',
      lesson: 'Maybe I need to have a good rest tonight.',
      extra: 'I need to finish this drawing today.',
      mistake: 'Sau “need to” dùng động từ nguyên mẫu: need to rest.'
    },
    GERUND_SUBJECT: {
      title: 'V-ing làm chủ ngữ',
      pattern: 'V-ing phrase + verb ...',
      explain: 'Một hành động có thể đứng đầu câu như một danh từ. Cả cụm thường được xem là số ít.',
      lesson: 'Drinking more water may make you feel better.',
      extra: 'Learning English takes time.',
      mistake: 'Đừng thêm chủ ngữ thừa: “Drinking more water it may...” là sai.'
    },
    MAY_BASE: {
      title: 'may + V nguyên mẫu — có thể',
      pattern: 'S + may + base verb',
      explain: '“may” diễn tả khả năng. Sau may không có “to” và không chia động từ.',
      lesson: 'Drinking more water may make you feel better.',
      extra: 'This change may affect the production schedule.',
      mistake: 'Không nói “may to make” hoặc “may makes”.'
    },
    MAKE_OBJECT: {
      title: 'make + someone + V — làm cho ai...',
      pattern: 'make + object + base verb / adjective',
      explain: 'Sau “make + người” dùng động từ nguyên mẫu không “to”.',
      lesson: '...may make you feel better.',
      extra: 'This mistake made me check the drawing again.',
      mistake: 'Không nói “make you to feel”. Phải là “make you feel”.'
    },
    WILL_BASE: {
      title: 'will + V nguyên mẫu — quyết định / tương lai',
      pattern: 'S + will + base verb',
      explain: 'Dùng cho quyết định, lời hứa hoặc dự đoán về tương lai.',
      lesson: 'I will take care of myself.',
      extra: 'I will send the drawing this afternoon.',
      mistake: 'Sau will không thêm -s/-ed: will send, không phải will sends.'
    },
    REFLEXIVE: {
      title: 'Đại từ phản thân: myself, yourself...',
      pattern: 'take care of + myself/yourself/himself/herself...',
      explain: 'Dùng khi người thực hiện hành động cũng là người nhận tác động.',
      lesson: 'I will take care of myself.',
      extra: 'Please take care of yourself.',
      mistake: 'I → myself; you → yourself; he → himself; she → herself.'
    }
  };

  const CARD_GRAMMAR = {
    en51_20261028_v01:['ROLE_TO'], en51_20261028_s01:['ROLE_TO'],
    en51_20261028_v02:['TRAINING_IN'], en51_20261028_s02:['TRAINING_IN'],
    en51_20261028_v03:['EMPLOYEE_OF'], en51_20261028_s03:['EMPLOYEE_OF'],
    en51_20261028_v04:['IT_TAKES','ADAPT_TO'], en51_20261028_s04:['IT_TAKES','ADAPT_TO'],
    en51_20261028_v05:['COUPLE_OF','AFTER_CLAUSE'], en51_20261028_s05:['COUPLE_OF','AFTER_CLAUSE'],
    en51_20261028_v06:['FEEL_ADJ'], en51_20261028_v07:['FEEL_ADJ'],
    en51_20261029_w01:['WHAT_DO_WHEN'], en51_20261029_w02:['WHAT_DO_WHEN'], en51_20261029_w03:['WHAT_DO_WHEN'],
    en51_20261029_v01:['LOOK_ADJ','WHAT_HAPPENED'],
    en51_20261029_v02:['HAVE_SYMPTOM'],
    en51_20261029_v03:['REMEMBER_TO'],
    en51_20261029_v04:['PAST_IRREGULAR'],
    en51_20261029_v05:['TAKE_CARE_OF','PRESENT_CONT'],
    en51_20261029_p01:['FEEL_ADJ','HAVE_SYMPTOM'],
    en51_20261029_p02:['HAVE_SYMPTOM'],
    en51_20261029_p03:['SORRY_TO_HEAR','WHAT_HAPPENED'],
    en51_20261029_p04:['ON_MY_WAY'],
    en51_20261029_p05:['GET_ADJ','PAST_IRREGULAR'],
    en51_20261029_p06:['NEED_TO'],
    en51_20261029_p07:['GERUND_SUBJECT','MAY_BASE','MAKE_OBJECT'],
    en51_20261029_p08:['WILL_BASE','REFLEXIVE'],
    en51_20261029_d01:['LOOK_ADJ'],
    en51_20261029_d02:['FEEL_ADJ','HAVE_SYMPTOM'],
    en51_20261029_d03:['SORRY_TO_HEAR','WHAT_HAPPENED'],
    en51_20261029_d04:['PAST_IRREGULAR','ON_MY_WAY'],
    en51_20261029_d05:['DID_QUESTION'],
    en51_20261029_d06:['PAST_IRREGULAR','GET_ADJ'],
    en51_20261029_d07:['EASY_TO'],
    en51_20261029_d08:['NEED_TO'],
    en51_20261029_d09:['GERUND_SUBJECT','MAY_BASE','MAKE_OBJECT'],
    en51_20261029_d10:['WILL_BASE','TAKE_CARE_OF','REFLEXIVE']
  };

  const LESSON_GRAMMAR = {
    '2026-10-28': ['ROLE_TO','TRAINING_IN','EMPLOYEE_OF','IT_TAKES','ADAPT_TO','COUPLE_OF','AFTER_CLAUSE','FEEL_ADJ'],
    '2026-10-29': ['WHAT_DO_WHEN','LOOK_ADJ','HAVE_SYMPTOM','REMEMBER_TO','PAST_IRREGULAR','TAKE_CARE_OF','PRESENT_CONT','SORRY_TO_HEAR','WHAT_HAPPENED','ON_MY_WAY','DID_QUESTION','GET_ADJ','EASY_TO','NEED_TO','GERUND_SUBJECT','MAY_BASE','MAKE_OBJECT','WILL_BASE','REFLEXIVE']
  };

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const is51Talk = card => !!card && (String(card.id || '').startsWith('en51_') || card.category === '51Talk English');

  function enhanceCard(card) {
    if (!is51Talk(card)) return;
    if (SENTENCE_IPA[card.id]) card.phonetic = SENTENCE_IPA[card.id];
    if (EXAMPLE_IPA[card.id]) card.exampleIpa = EXAMPLE_IPA[card.id];
    card.grammarKeys = CARD_GRAMMAR[card.id] || [];
  }

  function applyData() {
    const lists = [];
    try { if (typeof DEFAULT_CARDS !== 'undefined' && Array.isArray(DEFAULT_CARDS)) lists.push(DEFAULT_CARDS); } catch (_) {}
    try { if (typeof allCards !== 'undefined' && Array.isArray(allCards)) lists.push(allCards); } catch (_) {}
    if (Array.isArray(window.LF_51TALK_ENGLISH_CARDS_V1)) lists.push(window.LF_51TALK_ENGLISH_CARDS_V1);
    const seen = new Set();
    lists.forEach(list => list.forEach(card => { if (card && !seen.has(card)) { seen.add(card); enhanceCard(card); } }));
  }

  function currentCard() {
    try { return Array.isArray(filteredDeck) && filteredDeck.length ? filteredDeck[currentIndex] : null; }
    catch (_) { return null; }
  }

  function englishAnswer(card) {
    if (!card) return '';
    if (card.cardType === 'sentence') return String(card.chinese || '').trim();
    return String(card.word || '').trim();
  }

  function speakEnglish(value) {
    const text = String(value || '').trim();
    if (!text) return;
    try { if (typeof speakText === 'function') { speakText(text, 'Tiếng Anh'); return; } } catch (_) {}
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      speechSynthesis.speak(utter);
    } catch (_) {}
  }

  function ensureStyle() {
    if (document.getElementById('lf51LearningStyle')) return;
    const style = document.createElement('style');
    style.id = 'lf51LearningStyle';
    style.textContent = `
      #lf51ExampleIpa{font-size:.78rem;line-height:1.45;color:#a5b4fc;margin-top:4px;display:flex;gap:8px;align-items:flex-start}
      #lf51GrammarPanel{width:min(100%,760px);margin:12px auto 0;border:1px solid #c7d2fe;background:#fff;border-radius:18px;padding:14px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
      #lf51GrammarPanel.hidden{display:none!important}.lf51-g-title{font-weight:900;color:#312e81}.lf51-g-sub{font-size:.78rem;color:#64748b;margin-top:2px}
      .lf51-g-item{border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;margin-top:8px;overflow:hidden}.lf51-g-item summary{cursor:pointer;padding:10px 12px;font-weight:850;color:#1e293b}.lf51-g-body{padding:0 12px 12px;font-size:.82rem;line-height:1.55;color:#334155}.lf51-g-pattern{font-weight:850;color:#4338ca;background:#eef2ff;border-radius:9px;padding:7px 9px;margin:6px 0}.lf51-g-example{background:#ecfdf5;color:#065f46;border-radius:9px;padding:7px 9px;margin-top:6px}.lf51-g-warn{background:#fff7ed;color:#9a3412;border-radius:9px;padding:7px 9px;margin-top:6px}
      #lf51GrammarLibrary{border:1px solid #bfdbfe;background:linear-gradient(135deg,#eff6ff,#fff);border-radius:20px;padding:16px;margin-bottom:14px}.lf51-lesson-grid{display:grid;gap:8px}
      #lf51AnswerAudio{margin-left:8px;border:1px solid rgba(165,180,252,.35);background:rgba(99,102,241,.18);color:#c7d2fe;border-radius:999px;padding:4px 9px;font-size:.72rem;font-weight:850}
      @media(max-width:640px){#lf51GrammarPanel{padding:11px;border-radius:15px}.lf51-g-body{font-size:.8rem}}
    `;
    document.head.appendChild(style);
  }

  function grammarHtml(keys, openFirst = true) {
    const valid = [...new Set(keys || [])].map(k => G[k]).filter(Boolean);
    if (!valid.length) return '<div class="text-sm text-slate-500">Chưa có điểm ngữ pháp riêng cho thẻ này.</div>';
    return valid.map((item, index) => `
      <details class="lf51-g-item" ${openFirst && index === 0 ? 'open' : ''}>
        <summary>📘 ${esc(item.title)}</summary>
        <div class="lf51-g-body">
          <div class="lf51-g-pattern">Cấu trúc: ${esc(item.pattern)}</div>
          <div>${esc(item.explain)}</div>
          <div class="lf51-g-example"><b>Trong bài:</b> ${esc(item.lesson)}<br><b>Ví dụ thêm:</b> ${esc(item.extra)}</div>
          <div class="lf51-g-warn"><b>⚠️ Dễ sai:</b> ${esc(item.mistake)}</div>
        </div>
      </details>`).join('');
  }

  function ensureAudioUi() {
    const phonetic = document.getElementById('backPhoneticSmall');
    const host = phonetic?.parentElement;
    if (host && !document.getElementById('lf51AnswerAudio')) {
      const btn = document.createElement('button');
      btn.id = 'lf51AnswerAudio'; btn.type = 'button'; btn.textContent = '🔊 Nghe tiếng Anh';
      btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); const card=currentCard(); if(is51Talk(card)) speakEnglish(englishAnswer(card)); });
      host.appendChild(btn);
    }
    const example = document.getElementById('backExample');
    if (example?.parentElement && !document.getElementById('lf51ExampleIpa')) {
      const row = document.createElement('div');
      row.id = 'lf51ExampleIpa';
      row.innerHTML = '<span id="lf51ExampleIpaText" style="flex:1"></span><button type="button" style="border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:3px 7px;font-weight:800">🔊</button>';
      row.querySelector('button').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); const card=currentCard(); if(is51Talk(card)) speakEnglish(card.example || englishAnswer(card)); });
      example.insertAdjacentElement('afterend', row);
    }
  }

  function ensureGrammarPanel() {
    let panel = document.getElementById('lf51GrammarPanel');
    if (panel) return panel;
    const surface = document.querySelector('#flashcardContainer > div.perspective-1000');
    if (!surface) return null;
    panel = document.createElement('section');
    panel.id = 'lf51GrammarPanel'; panel.className = 'hidden';
    surface.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function isFlippedNow() { return !!document.getElementById('flashcardInner')?.classList.contains('flipped'); }

  function refreshCardUi() {
    applyData(); ensureStyle(); ensureAudioUi();
    const card = currentCard();
    const answerAudio = document.getElementById('lf51AnswerAudio');
    const exampleIpa = document.getElementById('lf51ExampleIpa');
    const panel = ensureGrammarPanel();
    const active = is51Talk(card);
    if (answerAudio) answerAudio.style.display = active ? '' : 'none';
    if (exampleIpa) exampleIpa.style.display = active ? '' : 'none';
    if (!active) { if(panel) panel.classList.add('hidden'); return; }

    // Core app currently hides English sentence IPA; force the correct 51Talk IPA on the answer side.
    const showPhonetic = document.getElementById('togglePhonetic') ? document.getElementById('togglePhonetic').checked : true;
    const backPhonetic = document.getElementById('backPhoneticSmall');
    if (backPhonetic) {
      backPhonetic.textContent = showPhonetic ? String(card.phonetic || '') : '';
      backPhonetic.style.display = showPhonetic && card.phonetic ? 'inline' : 'none';
    }
    const ipaText = document.getElementById('lf51ExampleIpaText');
    if (ipaText) ipaText.textContent = showPhonetic && card.exampleIpa ? `IPA câu: ${card.exampleIpa}` : '';
    if (exampleIpa) exampleIpa.style.display = showPhonetic && card.exampleIpa ? 'flex' : 'none';

    if (panel) {
      if (isFlippedNow()) {
        panel.innerHTML = `<div class="lf51-g-title">📚 Ngữ pháp cần nhớ</div><div class="lf51-g-sub">Giải thích theo đúng câu đang học, ưu tiên nền tảng và lỗi dễ mắc.</div>${grammarHtml(card.grammarKeys || [], true)}`;
        panel.classList.remove('hidden');
      } else panel.classList.add('hidden');
    }
  }

  function ensureGrammarLibrary() {
    const tab = document.getElementById('tab-grammar');
    if (!tab || document.getElementById('lf51GrammarLibrary')) return;
    const box = document.createElement('section');
    box.id = 'lf51GrammarLibrary';
    box.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-end gap-3">
        <div class="flex-1"><div class="text-xs font-black uppercase tracking-wide text-blue-600">🇬🇧 51Talk English · Ngữ pháp cơ bản</div><h3 class="text-lg font-extrabold text-slate-900 mt-1">Ngữ pháp theo đúng bài đang học</h3><p class="text-sm text-slate-600 mt-1">Mỗi điểm có cấu trúc, cách dùng, ví dụ trong bài và lỗi người mới học thường mắc.</p></div>
        <select id="lf51GrammarLessonSelect" class="rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-bold"><option value="2026-10-28">28/10 · Workplace vocabulary</option><option value="2026-10-29">Unit 3 · Lesson 1 · I have a headache</option></select>
      </div><div id="lf51GrammarLessonBody" class="lf51-lesson-grid mt-3"></div>`;
    tab.insertAdjacentElement('afterbegin', box);
    const select = box.querySelector('#lf51GrammarLessonSelect');
    const render = () => { const body=box.querySelector('#lf51GrammarLessonBody'); if(body) body.innerHTML=grammarHtml(LESSON_GRAMMAR[select.value] || [], false); };
    select.addEventListener('change', render); render();
  }

  function observeFlip() {
    const inner = document.getElementById('flashcardInner');
    if (!inner || inner.dataset.lf51Observed === '1') return;
    inner.dataset.lf51Observed = '1';
    new MutationObserver(() => setTimeout(refreshCardUi, 0)).observe(inner, { attributes:true, attributeFilter:['class'] });
  }

  function patchRender() {
    const original = window.renderCurrentCard;
    if (typeof original !== 'function' || original.__lf51LearningV2) return;
    const wrapped = function(...args) { const result=original.apply(this,args); setTimeout(() => { observeFlip(); refreshCardUi(); },0); return result; };
    wrapped.__lf51LearningV2 = true; window.renderCurrentCard = wrapped;
  }

  function init() {
    applyData(); ensureStyle(); ensureGrammarLibrary(); ensureAudioUi(); ensureGrammarPanel(); observeFlip(); patchRender();
    document.getElementById('togglePhonetic')?.addEventListener('change', () => setTimeout(refreshCardUi,0));
    setTimeout(refreshCardUi,80);
  }

  window.lfSpeak51TalkEnglish = speakEnglish;
  window.LF_51TALK_GRAMMAR_V2 = { points:G, cardMap:CARD_GRAMMAR, lessonMap:LESSON_GRAMMAR };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();