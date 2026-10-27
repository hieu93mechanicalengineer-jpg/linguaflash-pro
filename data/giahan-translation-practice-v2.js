/* LinguaFlash Gia Han Translation Practice v2
   Rebuilds B16-B30 with curated natural sentences while reusing existing IDs,
   and adds dedicated B31-B45 translation-practice topics with stable IDs.
   Runs before app.js and does not change FSRS, grading, cloud sync, or normal vocab cards.
*/
(() => {
  'use strict';

  const MANUAL = {
    16: [
      ['今天订单很多，请大家按顺序处理。','Hôm nay có nhiều đơn hàng, mọi người hãy xử lý theo thứ tự.'],
      ['请先检查资料，再提交申请。','Hãy kiểm tra tài liệu trước rồi mới nộp đơn.'],
      ['客户已经排队等了十分钟。','Khách hàng đã xếp hàng chờ mười phút.'],
      ['有急单时，要先跟主管确认。','Khi có đơn gấp, phải xác nhận với quản lý trước.'],
      ['这批货不能插队生产，除非经理批准。','Lô hàng này không được chen lịch sản xuất, trừ khi quản lý phê duyệt.'],
      ['请你排在我后面，不要着急。','Bạn hãy xếp sau tôi, đừng vội.'],
      ['如果前面的订单还没完成，新订单就不能安排生产。','Nếu đơn hàng phía trước chưa hoàn thành thì đơn mới chưa thể sắp xếp sản xuất.'],
      ['遇到紧急情况，我们再调整生产顺序。','Khi gặp tình huống khẩn cấp, chúng ta sẽ điều chỉnh lại thứ tự sản xuất.']
    ],
    17: [
      ['员工必须遵守公司的规定。','Nhân viên phải tuân thủ quy định của công ty.'],
      ['我要的是质量，而不是数量。','Điều tôi cần là chất lượng, không phải số lượng.'],
      ['如果工作有问题，请及时提出来。','Nếu công việc có vấn đề, hãy kịp thời nêu ra.'],
      ['为了避免出错，出货前要再检查一次。','Để tránh sai sót, trước khi xuất hàng phải kiểm tra lại một lần.'],
      ['公司不能包庇违反规定的员工。','Công ty không thể bao che cho nhân viên vi phạm quy định.'],
      ['我们应该按时完成任务，不要迟到。','Chúng ta nên hoàn thành nhiệm vụ đúng giờ và không đi muộn.'],
      ['这个问题的原因还需要进一步调查。','Nguyên nhân của vấn đề này vẫn cần được điều tra thêm.'],
      ['发现异常时，要马上报告并处理。','Khi phát hiện bất thường, phải báo cáo và xử lý ngay.']
    ],
    18: [
      ['我理解你的意思，但这个方案还需要调整。','Tôi hiểu ý bạn, nhưng phương án này vẫn cần điều chỉnh.'],
      ['只要每天练习，中文水平一定会提高。','Chỉ cần luyện tập mỗi ngày, trình độ tiếng Trung chắc chắn sẽ nâng cao.'],
      ['请把这份文件再看一遍。','Hãy xem lại tài liệu này một lần nữa.'],
      ['不要盲目追求速度，质量更重要。','Đừng mù quáng chạy theo tốc độ, chất lượng quan trọng hơn.'],
      ['他对工作很积极，也愿意帮助同事。','Anh ấy rất tích cực trong công việc và cũng sẵn lòng giúp đồng nghiệp.'],
      ['工作再忙，也要留一点时间给家庭。','Dù công việc bận đến đâu cũng nên dành một chút thời gian cho gia đình.'],
      ['这件事我已经说了好几遍，你应该记住。','Việc này tôi đã nói mấy lần rồi, bạn nên nhớ.'],
      ['遇到问题时，先冷静下来再想办法。','Khi gặp vấn đề, hãy bình tĩnh lại rồi tìm cách giải quyết.']
    ],
    19: [
      ['合同签好以后，请把电子版存进档案。','Sau khi ký hợp đồng xong, hãy lưu bản điện tử vào hồ sơ.'],
      ['新员工入职前需要提交身份证和体检表。','Trước khi nhân viên mới vào làm cần nộp giấy tờ tùy thân và phiếu khám sức khỏe.'],
      ['这批货已经到港口，明天安排报关和卸货。','Lô hàng này đã đến cảng, ngày mai sắp xếp khai báo hải quan và dỡ hàng.'],
      ['报价里已经包含运费和安装费。','Báo giá đã bao gồm phí vận chuyển và phí lắp đặt.'],
      ['请把签字后的文件扫描成PDF发给我。','Hãy quét tài liệu đã ký thành PDF rồi gửi cho tôi.'],
      ['如果资料不完整，手续就办不了。','Nếu hồ sơ không đầy đủ thì không thể làm thủ tục.'],
      ['这份合同还需要公证。','Hợp đồng này vẫn cần được công chứng.'],
      ['请确认签证和居住证明是否还在有效期内。','Hãy xác nhận visa và giấy xác nhận cư trú còn trong thời hạn hiệu lực hay không.']
    ]
  };

  const CORRECTIONS = {
    '这里太多路了，我迷路啊。': ['这里路太多了，我迷路了。','Ở đây có quá nhiều đường, tôi bị lạc rồi.'],
    '我自己想，都是一个专业的工作。': ['我想找一份专业对口的工作。','Tôi muốn tìm một công việc đúng chuyên môn.'],
    '这座桥用钢铁，很结实。': ['这座桥是用钢铁建的，很结实。','Cây cầu này được xây bằng thép nên rất chắc chắn.'],
    '你给我点儿钱，就叫是工资吧。': ['这是你这个月的工资，请确认一下。','Đây là tiền lương tháng này của bạn, hãy kiểm tra lại.'],
    '我不会这个怎么做。': ['我不知道这个应该怎么做。','Tôi không biết việc này nên làm như thế nào.'],
    '这个工作我做不来。': ['这份工作我暂时还做不了。','Công việc này hiện tại tôi vẫn chưa làm được.']
  };

  const BAD_CN = [
    /阿雄|阿娥|阿秋/,
    /不清楚|看不清|字迹|手写/,
    /叫是/,
    /自己想，都是/,
    /太多路/,
    /[？?]{2,}/,
    /[=+<>]/
  ];
  const BAD_VI = [
    /chưa rõ|không rõ chữ|không đủ ngữ cảnh|không xác định|ghi tay/i,
    /unclear|unknown|ocr/i
  ];

  const firstLine = value => String(value || '').split(/\r?\n/)[0].trim();
  const countHan = value => (String(value || '').match(/[\u3400-\u9fff]/g) || []).length;
  const normalizeCnKey = value => String(value || '').replace(/[\s，。！？、；：,.!?;:（）()“”"']/g, '');
  const pad = n => String(n).padStart(2, '0');

  function correctedPair(cn, vi) {
    const rawCn = firstLine(cn);
    const hit = CORRECTIONS[rawCn];
    return hit ? { cn: hit[0], vi: hit[1] } : { cn: rawCn, vi: firstLine(vi) };
  }

  function isGoodPair(cn, vi, relaxed = false) {
    cn = firstLine(cn);
    vi = firstLine(vi);
    const han = countHan(cn);
    if (!cn || !vi) return false;
    if (han < (relaxed ? 4 : 6) || han > (relaxed ? 34 : 28)) return false;
    if (vi.length < (relaxed ? 7 : 12) || vi.length > 150) return false;
    if (BAD_CN.some(rx => rx.test(cn)) || BAD_VI.some(rx => rx.test(vi))) return false;
    if (/[A-Za-z]{5,}/.test(cn)) return false;
    if (!relaxed && /啊[。！？]?$/.test(cn)) return false;
    if (!relaxed && /^\(?[^（）()]{0,8}\)?[:：]/.test(cn)) return false;
    return true;
  }

  function qualityScore(cn, vi) {
    const han = countHan(cn);
    let score = 0;
    if (han >= 8 && han <= 20) score += 4;
    else if (han >= 6 && han <= 26) score += 2;
    if (vi.length >= 18 && vi.length <= 90) score += 3;
    if (/[。！？]$/.test(cn)) score += 1;
    if (!/[、；：]/.test(cn)) score += 1;
    return score;
  }

  function curateFromCards(cards, maxCount = 8) {
    const candidates = [];
    const seen = new Set();
    for (const card of cards || []) {
      const pair = correctedPair(card.example, card.exampleTrans);
      const key = normalizeCnKey(pair.cn);
      if (!key || seen.has(key) || !isGoodPair(pair.cn, pair.vi, false)) continue;
      seen.add(key);
      candidates.push({ ...pair, score: qualityScore(pair.cn, pair.vi) });
    }
    if (candidates.length < 6) {
      for (const card of cards || []) {
        const pair = correctedPair(card.example, card.exampleTrans);
        const key = normalizeCnKey(pair.cn);
        if (!key || seen.has(key) || !isGoodPair(pair.cn, pair.vi, true)) continue;
        seen.add(key);
        candidates.push({ ...pair, score: qualityScore(pair.cn, pair.vi) - 2 });
      }
    }
    return candidates.sort((a, b) => b.score - a.score).slice(0, maxCount).map(({ cn, vi }) => ({ cn, vi }));
  }

  function regularLessonCards(array, topic) {
    return (array || []).filter(card =>
      card && card.category === 'Gia Hân' && card.topic === topic && !String(card.topic || '').includes('Luyện dịch')
    );
  }

  function makeTranslationCard(base, id, topic, pair) {
    return {
      ...(base || {}),
      id,
      lang: 'Tiếng Trung',
      category: 'Gia Hân',
      topic,
      word: pair.cn,
      phonetic: '',
      meaning: pair.vi,
      chinese: pair.cn,
      example: pair.cn,
      exampleTrans: pair.vi,
      sourceSection: 'Luyện dịch v2',
      interval: base?.interval ?? 0,
      repetitions: base?.repetitions ?? 0,
      easeFactor: base?.easeFactor ?? 2.5,
      nextReview: base?.nextReview ?? 0
    };
  }

  function replaceDeckInPlace(array, topic, pairs, idFactory) {
    if (!Array.isArray(array) || !pairs.length) return;
    const existing = array.filter(card => card?.category === 'Gia Hân' && card?.topic === topic);
    const firstIndex = array.findIndex(card => card?.category === 'Gia Hân' && card?.topic === topic);
    const replacements = pairs.map((pair, i) => {
      const old = existing[i] || null;
      const id = old?.id || idFactory(i + 1);
      return makeTranslationCard(old, id, topic, pair);
    });
    for (let i = array.length - 1; i >= 0; i--) {
      const card = array[i];
      if (card?.category === 'Gia Hân' && card?.topic === topic) array.splice(i, 1);
    }
    array.splice(firstIndex >= 0 ? Math.min(firstIndex, array.length) : array.length, 0, ...replacements);
  }

  const core = Array.isArray(window.DEFAULT_CARDS) ? window.DEFAULT_CARDS : [];

  for (let lesson = 16; lesson <= 30; lesson++) {
    const regularTopic = `Trung cấp 1 - Bài ${lesson}`;
    const translationTopic = `${regularTopic} - Luyện dịch`;
    const pairs = MANUAL[lesson]
      ? MANUAL[lesson].map(([cn, vi]) => ({ cn, vi }))
      : curateFromCards(regularLessonCards(core, regularTopic), 8);
    if (pairs.length) {
      replaceDeckInPlace(core, translationTopic, pairs, index => `gh_pack_b${lesson}_tr_v2_${pad(index)}`);
    }
  }

  let tc2 = [];
  try {
    if (typeof GIA_HAN_TC2_CARDS_31_45 !== 'undefined' && Array.isArray(GIA_HAN_TC2_CARDS_31_45)) {
      tc2 = GIA_HAN_TC2_CARDS_31_45;
    } else if (Array.isArray(window.GIA_HAN_TC2_CARDS_31_45)) {
      tc2 = window.GIA_HAN_TC2_CARDS_31_45;
    }
  } catch (_) {}

  if (Array.isArray(tc2) && tc2.length) {
    for (let i = tc2.length - 1; i >= 0; i--) {
      if (tc2[i]?.category === 'Gia Hân' && / - Luyện dịch$/.test(String(tc2[i]?.topic || ''))) tc2.splice(i, 1);
    }
    const translationCards = [];
    for (let lesson = 31; lesson <= 45; lesson++) {
      const regularTopic = `Trung cấp 2 - Bài ${lesson}`;
      const translationTopic = `${regularTopic} - Luyện dịch`;
      const pairs = curateFromCards(regularLessonCards(tc2, regularTopic), 8);
      pairs.forEach((pair, i) => {
        translationCards.push(makeTranslationCard(null, `gh_tc2_b${lesson}_tr_${pad(i + 1)}`, translationTopic, pair));
      });
    }
    tc2.unshift(...translationCards);
  }

  window.lfTranslationPracticeV2 = {
    enabled: true,
    tc1Lessons: '16-30',
    tc2Lessons: '31-45',
    quality: 'curated-natural-sentences',
    preservesExistingIds: true
  };
})();
