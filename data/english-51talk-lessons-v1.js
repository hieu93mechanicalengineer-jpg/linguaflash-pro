/* LinguaFlash · 51Talk English lessons v1
   User-provided lesson sources:
   - 2026-10-28: class screenshot (workplace vocabulary + teacher correction)
   - 2026-10-29: Classic English V3.0 Level 4 · Unit 3 · Lesson 1 · I have a headache

   English/Vietnamese annotations (IPA + Vietnamese meanings/translations) are
   learning annotations added for LinguaFlash. Source sentences are preserved.
*/
(() => {
  'use strict';
  if (globalThis.__LF_51TALK_ENGLISH_LESSONS_V1__) return;
  globalThis.__LF_51TALK_ENGLISH_LESSONS_V1__ = true;

  const BASE = {
    lang: 'Tiếng Anh',
    level: '51Talk · Level 4',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: 0
  };

  const vocab = (id, topic, word, phonetic, meaning, example, exampleTrans, sourceLabel, sourceSection) => ({
    ...BASE, id, cardType: 'vocab', word, phonetic, meaning, chinese: '',
    example, exampleTrans, topic, sourceLabel, sourceSection,
    category: '51Talk English'
  });

  // Sentence cards follow LinguaFlash's multilingual sentence schema:
  // Vietnamese in `word`, English in `chinese`, Chinese left blank in `meaning`.
  const sentence = (id, topic, vi, en, sourceLabel, sourceSection) => ({
    ...BASE, id, cardType: 'sentence', word: vi, meaning: '', chinese: en,
    phonetic: '', example: en, exampleTrans: vi, topic, sourceLabel, sourceSection,
    category: '51Talk English'
  });

  const TODAY_TOPIC = '51Talk English - 2026-10-28 · Workplace vocabulary';
  const TODAY_SENTENCES = '51Talk English - 2026-10-28 · Luyện câu';
  const TOMORROW_TOPIC = '51Talk English - Unit 3 · Lesson 1 · I have a headache';
  const TOMORROW_WARMUP = '51Talk English - Unit 3 · Lesson 1 · Warm-up';
  const TOMORROW_DIALOGUE = '51Talk English - Unit 3 · Lesson 1 · Hội thoại Lily & Joe';

  const cards = [
    // 2026-10-28 · content visible in the user's class screenshot
    vocab('en51_20261028_v01', TODAY_TOPIC, 'technical support', '/ˈteknɪkəl səˈpɔːrt/', 'hỗ trợ kỹ thuật',
      "Mr. Smith's role is to provide technical support for the clients all over Europe.",
      'Vai trò của ông Smith là cung cấp hỗ trợ kỹ thuật cho các khách hàng trên khắp châu Âu.',
      'Bài học 28/10 · technical support', '51Talk · New words and expressions'),
    vocab('en51_20261028_v02', TODAY_TOPIC, 'training', '/ˈtreɪnɪŋ/', 'đào tạo; sự huấn luyện',
      'On the course we received training in every aspect of the job.',
      'Trong khóa học, chúng tôi được đào tạo về mọi khía cạnh của công việc.',
      'Bài học 28/10 · training', '51Talk · New words and expressions'),
    vocab('en51_20261028_v03', TODAY_TOPIC, 'employee', '/ɪmˈplɔɪiː/', 'nhân viên',
      'Linda is an employee of Citibank in the States.',
      'Linda là nhân viên của Citibank tại Mỹ.',
      'Bài học 28/10 · employee', '51Talk · New words and expressions'),
    vocab('en51_20261028_v04', TODAY_TOPIC, 'adapt', '/əˈdæpt/', 'thích nghi; điều chỉnh cho phù hợp',
      'It takes time for me to adapt to a new working environment.',
      'Tôi cần thời gian để thích nghi với một môi trường làm việc mới.',
      'Bài học 28/10 · adapt', '51Talk · New words and expressions'),
    vocab('en51_20261028_v05', TODAY_TOPIC, 'a couple of', '/ə ˈkʌpəl əv/', 'một vài; khoảng hai',
      'A couple of months after I moved to London, I felt completely at home there.',
      'Vài tháng sau khi chuyển đến London, tôi đã cảm thấy hoàn toàn như ở nhà tại đó.',
      'Bài học 28/10 · a couple of', '51Talk · New words and expressions'),
    vocab('en51_20261028_v06', TODAY_TOPIC, 'nervous', '/ˈnɜːrvəs/', 'lo lắng; căng thẳng; hồi hộp',
      'I feel nervous.', 'Tôi cảm thấy lo lắng / căng thẳng.',
      'Ghi chú giáo viên · nervous', '51Talk · Teacher correction'),
    vocab('en51_20261028_v07', TODAY_TOPIC, 'worried', '/ˈwɜːrid/', 'lo lắng; bận tâm',
      'I feel worried.', 'Tôi cảm thấy lo lắng.',
      'Ghi chú giáo viên · worried', '51Talk · Teacher correction'),

    sentence('en51_20261028_s01', TODAY_SENTENCES,
      'Vai trò của ông Smith là cung cấp hỗ trợ kỹ thuật cho các khách hàng trên khắp châu Âu.',
      "Mr. Smith's role is to provide technical support for the clients all over Europe.",
      'Câu mẫu 1 · technical support', '51Talk · New words and expressions'),
    sentence('en51_20261028_s02', TODAY_SENTENCES,
      'Trong khóa học, chúng tôi được đào tạo về mọi khía cạnh của công việc.',
      'On the course we received training in every aspect of the job.',
      'Câu mẫu 2 · training', '51Talk · New words and expressions'),
    sentence('en51_20261028_s03', TODAY_SENTENCES,
      'Linda là nhân viên của Citibank tại Mỹ.',
      'Linda is an employee of Citibank in the States.',
      'Câu mẫu 3 · employee', '51Talk · New words and expressions'),
    sentence('en51_20261028_s04', TODAY_SENTENCES,
      'Tôi cần thời gian để thích nghi với một môi trường làm việc mới.',
      'It takes time for me to adapt to a new working environment.',
      'Câu mẫu 4 · adapt', '51Talk · New words and expressions'),
    sentence('en51_20261028_s05', TODAY_SENTENCES,
      'Vài tháng sau khi chuyển đến London, tôi đã cảm thấy hoàn toàn như ở nhà tại đó.',
      'A couple of months after I moved to London, I felt completely at home there.',
      'Câu mẫu 5 · a couple of', '51Talk · New words and expressions'),

    // 2026-10-29 · Unit 3 / Lesson 1, source PDF
    vocab('en51_20261029_w01', TOMORROW_WARMUP, 'stay at home', '/steɪ æt hoʊm/', 'ở nhà',
      'What do you do when you are sick? — Stay at home.',
      'Bạn làm gì khi bị ốm? — Ở nhà.',
      'Warm-up · stay at home', 'Unit 3 · Lesson 1 · Warm-up'),
    vocab('en51_20261029_w02', TOMORROW_WARMUP, 'go to the hospital', '/ɡoʊ tə ðə ˈhɑːspɪtəl/', 'đi bệnh viện',
      'What do you do when you are sick? — Go to the hospital.',
      'Bạn làm gì khi bị ốm? — Đi bệnh viện.',
      'Warm-up · go to the hospital', 'Unit 3 · Lesson 1 · Warm-up'),
    vocab('en51_20261029_w03', TOMORROW_WARMUP, 'have a rest', '/hæv ə rest/', 'nghỉ ngơi',
      'What do you do when you are sick? — Have a rest.',
      'Bạn làm gì khi bị ốm? — Nghỉ ngơi.',
      'Warm-up · have a rest', 'Unit 3 · Lesson 1 · Warm-up'),

    vocab('en51_20261029_v01', TOMORROW_TOPIC, 'look well', '/lʊk wel/', 'trông khỏe; trông có vẻ khỏe',
      "You don't look well. What happened?", 'Trông bạn không khỏe. Có chuyện gì vậy?',
      'New words · look well', 'Unit 3 · Lesson 1 · New words and expressions'),
    vocab('en51_20261029_v02', TOMORROW_TOPIC, 'headache', '/ˈhedeɪk/', 'đau đầu; cơn đau đầu',
      'Jenny is not feeling well because she has a headache.',
      'Jenny cảm thấy không khỏe vì cô ấy bị đau đầu.',
      'New words · headache', 'Unit 3 · Lesson 1 · New words and expressions'),
    vocab('en51_20261029_v03', TOMORROW_TOPIC, 'umbrella', '/ʌmˈbrelə/', 'ô; dù',
      'It is raining outside. Remember to bring an umbrella.',
      'Ngoài trời đang mưa. Nhớ mang theo ô.',
      'New words · umbrella', 'Unit 3 · Lesson 1 · New words and expressions'),
    vocab('en51_20261029_v04', TOMORROW_TOPIC, 'catch a cold', '/kætʃ ə koʊld/', 'bị cảm; bị cảm lạnh',
      'Daisy caught a cold yesterday. She needs some rest.',
      'Hôm qua Daisy bị cảm. Cô ấy cần nghỉ ngơi.',
      'New words · catch a cold', 'Unit 3 · Lesson 1 · New words and expressions'),
    vocab('en51_20261029_v05', TOMORROW_TOPIC, 'take care of', '/teɪk ker əv/', 'chăm sóc; trông nom',
      "Lucy's husband is ill and she is taking care of him.",
      'Chồng của Lucy bị ốm và cô ấy đang chăm sóc anh ấy.',
      'New words · take care of', 'Unit 3 · Lesson 1 · New words and expressions'),

    // Useful expressions appearing in the source dialogue
    vocab('en51_20261029_p01', TOMORROW_TOPIC, 'not feel very good', '/nɑːt fiːl ˈveri ɡʊd/', 'cảm thấy không khỏe lắm',
      "I don't feel very good. I have a terrible headache.",
      'Tôi cảm thấy không khỏe lắm. Tôi đau đầu kinh khủng.',
      'Dialogue phrase · not feel very good', 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p02', TOMORROW_TOPIC, 'a terrible headache', '/ə ˈterəbəl ˈhedeɪk/', 'một cơn đau đầu khủng khiếp',
      'I have a terrible headache.', 'Tôi đau đầu kinh khủng.',
      'Dialogue phrase · a terrible headache', 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p03', TOMORROW_TOPIC, "I'm sorry to hear that", '/aɪm ˈsɑːri tə hɪr ðæt/', 'tôi rất tiếc khi nghe điều đó',
      "I'm sorry to hear that. What happened?", 'Tôi rất tiếc khi nghe vậy. Có chuyện gì xảy ra?',
      "Dialogue phrase · I'm sorry to hear that", 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p04', TOMORROW_TOPIC, 'on my way home', '/ɑːn maɪ weɪ hoʊm/', 'trên đường về nhà',
      'It started to rain on my way home.', 'Trời bắt đầu mưa trên đường tôi về nhà.',
      'Dialogue phrase · on my way home', 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p05', TOMORROW_TOPIC, 'get all wet', '/ɡet ɔːl wet/', 'bị ướt hết; ướt sũng',
      'No. I got all wet. The rain was really heavy.', 'Không. Tôi bị ướt hết. Mưa rất lớn.',
      'Dialogue phrase · get all wet', 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p06', TOMORROW_TOPIC, 'have a good rest', '/hæv ə ɡʊd rest/', 'nghỉ ngơi thật tốt',
      'Maybe I need to have a good rest tonight.', 'Có lẽ tối nay tôi cần nghỉ ngơi thật tốt.',
      'Dialogue phrase · have a good rest', 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p07', TOMORROW_TOPIC, 'feel better', '/fiːl ˈbetər/', 'cảm thấy khỏe hơn; cảm thấy tốt hơn',
      'Drinking more water may make you feel better.', 'Uống nhiều nước hơn có thể làm bạn cảm thấy khỏe hơn.',
      'Dialogue phrase · feel better', 'Unit 3 · Lesson 1 · Conversation'),
    vocab('en51_20261029_p08', TOMORROW_TOPIC, 'take care of myself', '/teɪk ker əv maɪˈself/', 'tự chăm sóc bản thân',
      'Thank you. I will take care of myself.', 'Cảm ơn. Tôi sẽ tự chăm sóc bản thân.',
      'Dialogue phrase · take care of myself', 'Unit 3 · Lesson 1 · Conversation'),

    // Lily & Joe dialogue as active-recall sentence cards
    sentence('en51_20261029_d01', TOMORROW_DIALOGUE,
      'Chào Joe! Bạn ổn không? Trông bạn không khỏe.',
      "Hi, Joe! Are you okay? You don't look well.",
      'Lily · câu 1', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d02', TOMORROW_DIALOGUE,
      'Tôi cảm thấy không khỏe lắm. Tôi đau đầu kinh khủng.',
      "I don't feel very good. I have a terrible headache.",
      'Joe · câu 2', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d03', TOMORROW_DIALOGUE,
      'Tôi rất tiếc khi nghe vậy. Có chuyện gì xảy ra?',
      "I'm sorry to hear that. What happened?",
      'Lily · câu 3', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d04', TOMORROW_DIALOGUE,
      'Tối qua tôi đi chơi với bạn và trời bắt đầu mưa trên đường tôi về nhà.',
      'I went out with my friends last night and it started to rain on my way home.',
      'Joe · câu 4', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d05', TOMORROW_DIALOGUE,
      'Thật không may. Bạn có mang ô theo không?',
      "That's unlucky. Did you take an umbrella with you?",
      'Lily · câu 5', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d06', TOMORROW_DIALOGUE,
      'Không. Tôi bị ướt hết. Mưa rất lớn.',
      'No. I got all wet. The rain was really heavy.',
      'Joe · câu 6', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d07', TOMORROW_DIALOGUE,
      'Như vậy không tốt. Rất dễ bị cảm khi bạn bị ướt.',
      "That is not good. It's easy to catch a cold when you are wet.",
      'Lily · câu 7', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d08', TOMORROW_DIALOGUE,
      'Có lẽ tối nay tôi cần nghỉ ngơi thật tốt.',
      'Well, maybe I need to have a good rest tonight.',
      'Joe · câu 8', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d09', TOMORROW_DIALOGUE,
      'Ngoài ra, uống nhiều nước hơn có thể làm bạn cảm thấy khỏe hơn.',
      'Also, drinking more water may make you feel better.',
      'Lily · câu 9', 'Unit 3 · Lesson 1 · Conversation'),
    sentence('en51_20261029_d10', TOMORROW_DIALOGUE,
      'Cảm ơn. Tôi sẽ tự chăm sóc bản thân.',
      'Thank you. I will take care of myself.',
      'Joe · câu 10', 'Unit 3 · Lesson 1 · Conversation')
  ];

  // Add to DEFAULT_CARDS before app.js creates the built-in ID/progress baseline.
  try {
    if (typeof DEFAULT_CARDS !== 'undefined' && Array.isArray(DEFAULT_CARDS)) {
      const existing = new Set(DEFAULT_CARDS.map(c => String(c?.id || '')));
      cards.forEach(card => { if (!existing.has(card.id)) DEFAULT_CARDS.push(card); });
    }
  } catch (err) {
    console.warn('51Talk English pack could not extend DEFAULT_CARDS:', err);
  }

  globalThis.LF_51TALK_ENGLISH_CARDS_V1 = cards;
  globalThis.LF_51TALK_ENGLISH_META_V1 = {
    course: '51Talk English',
    today: '2026-10-28',
    nextLesson: '2026-10-29',
    todayTopic: TODAY_TOPIC,
    nextTopic: TOMORROW_TOPIC,
    totalCards: cards.length
  };
})();
