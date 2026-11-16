/* LinguaFlash Import Lessons v1. Published lessons use existing flashcards and SRS. */
(function () {
  'use strict';
  if (window.__lfLessonImportV1) return;
  window.__lfLessonImportV1 = true;
  var TABLE = 'linguaflash_import_lessons', client, admin = false, pending = null;
  var asText = function (x) { return String(x == null ? '' : x).trim(); };
  function field(o, names) {
    for (var i=0;i<names.length;i++) if(o && asText(o[names[i]])) return asText(o[names[i]]);
    return '';
  }
  function slug(s) {
    return asText(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/đ/g,'d').replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,76);
  }
  function hash(s) {
    var h=2166136261;
    for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function key(c) {
    return [c.lang,c.cardType,c.word,c.meaning,c.chinese,c.example].map(function(v){
      return asText(v).normalize('NFC').toLowerCase().replace(/\s+/g,' ');
    }).join('|');
  }
  function lessonFrom(source) {
    if(!source || typeof source!=='object' || Array.isArray(source)) throw Error('JSON phải là một bài học dạng đối tượng.');
    var title=field(source,['title','lesson','name']);
    var id=slug(field(source,['lesson_id','id'])||title);
    var rawLang=field(source,['language','lang']).toLowerCase();
    var language=/^(en|english|tiếng anh|tieng anh)$/.test(rawLang)?'en':/^(zh|cn|chinese|tiếng trung|tieng trung)$/.test(rawLang)?'zh':'';
    var category=field(source,['category','course'])||(language==='en'?'51Talk English':'Gia Hân');
    if(!title || title.length>180 || id.length<3) throw Error('Thiếu tên hoặc mã bài học hợp lệ.');
    if(!language) throw Error('language phải là en hoặc zh.');
    if(category.length>100) throw Error('Tên khóa học vượt 100 ký tự.');
    if(!Array.isArray(source.cards)||source.cards.length<1||source.cards.length>500) throw Error('Mỗi bài cần 1–500 thẻ.');
    var cards=[], invalid=0, insideDuplicates=0, ids=new Set();
    source.cards.forEach(function(item){
      if(!item || typeof item!=='object') {invalid++;return;}
      var rawType=field(item,['type','cardType']).toLowerCase();
      var type=/^(dialogue|conversation|hội thoại)$/.test(rawType)?'dialogue':/^(sentence|câu|câu mẫu)$/.test(rawType)?'sentence':'vocab';
      var word=field(item,['word','term']), meaning=field(item,['meaning','translation_vi']);
      var other=field(item,['chinese','translation_other']);
      // Existing LinguaFlash sentence schema is ALWAYS word=Vietnamese,
      // meaning=Chinese, chinese=English, independently of course language.
      if(type==='dialogue' || type==='sentence'){
        var en=field(item,['en','english']) || (language==='en'?word:other);
        var zh=field(item,['zh','cn','chinese_text']) || (language==='zh'?word:other);
        var vi=field(item,['vi','vietnamese']) || meaning;
        word=vi; meaning=zh; other=en;
      }
      if(!word||!meaning|| (type!=='vocab'&&!other)){invalid++;return;}
      var section=field(item,['topic','section']);
      var topic=!section?category+' - '+title:(section.indexOf(category+' - ')===0?section:category+' - '+section);
      var card={
        lang:language==='en'?'Tiếng Anh':'Tiếng Trung',
        cardType:type==='dialogue'?'sentence':type,word:word,meaning:meaning,chinese:other,
        phonetic:type==='vocab'
          ? field(item,['phonetic','ipa','pinyin'])
          : field(item,['zhPinyin','chinesePinyin','pinyin']),
        englishIpa:field(item,['enIpa','ipa']),
        chinesePinyin:field(item,['zhPinyin','chinesePinyin','pinyin']),
        example:field(item,['example']),exampleTrans:field(item,['exampleTrans','example_translation']),
        topic:topic,category:category,level:field(item,['level'])||title,
        speaker:type==='dialogue'?field(item,['speaker']):'',
        sourceLabel:title,sourceSection:field(item,['sourceSection','section']),
        interval:0,repetitions:0,easeFactor:2.5,nextReview:0
      };
      card.id='lfimp_'+id+'_'+hash(type+'|'+word+'|'+meaning+'|'+other+'|'+card.example+'|'+card.speaker);
      if(ids.has(card.id)){insideDuplicates++;return;}
      ids.add(card.id);cards.push(card);
    });
    if(!cards.length) throw Error('Không có thẻ hợp lệ: mỗi thẻ cần nội dung và nghĩa tiếng Việt.');
    return {lesson_id:id,title:title,language:language,category:category,cards:cards,
      invalid:invalid,insideDuplicates:insideDuplicates};
  }
  async function parseFile(file) {
    if(/\.json$/i.test(file.name)) return JSON.parse(await file.text());
    if(!/\.(xlsx|xls|csv)$/i.test(file.name)||!window.XLSX) throw Error('Chỉ hỗ trợ JSON và Excel/CSV.');
    var book=XLSX.read(await file.arrayBuffer(),{type:'array'});
    var rows=XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{defval:''});
    if(!rows.length) throw Error('File không chứa dòng dữ liệu nào.');
    var first=rows[0];
    return {
      lesson_id:field(first,['Lesson ID','lesson_id','Mã bài']),
      title:field(first,['Lesson','title','Tên bài']),
      language:field(first,['Language','language','Ngôn ngữ']),
      category:field(first,['Category','category','Khóa học']),
      cards:rows.map(function(r){return {
        type:field(r,['Card Type','type','Loại thẻ'])||'vocab',
        word:field(r,['Word','word','Từ vựng']),
        meaning:field(r,['Meaning','meaning','Nghĩa tiếng Việt']),
        phonetic:field(r,['IPA/Pinyin','Phonetic','phonetic','Phiên âm']),
        chinese:field(r,['Chinese/English','chinese','Tiếng Trung/Anh']),
        example:field(r,['Example','example','Ví dụ']),
        exampleTrans:field(r,['Example Translation','exampleTrans','Dịch ví dụ']),
        topic:field(r,['Topic','topic','Chủ đề']),
        speaker:field(r,['Speaker','speaker','Người nói']),
        en:field(r,['English','en']),zh:field(r,['Chinese','zh','cn']),
        vi:field(r,['Vietnamese','vi','Tiếng Việt']),
        zhPinyin:field(r,['Chinese Pinyin','zhPinyin','Pinyin Trung']),
        enIpa:field(r,['English IPA','enIpa','IPA Anh'])
      };})
    };
  }
  function addToStudy(rows) {
    if(typeof DEFAULT_CARDS==='undefined'||typeof loadData!=='function') return;
    var modified=false, dialogue=false;
    rows.forEach(function(lesson){
      if(!Array.isArray(lesson.cards))return;
      var cards=lesson.cards.filter(function(c){return c&&typeof c.id==='string'&&c.id.indexOf('lfimp_')===0;});
      cards.forEach(function(card){
        var index=DEFAULT_CARDS.findIndex(function(c){return c.id===card.id;});
        if(index>=0)DEFAULT_CARDS[index]=card; else DEFAULT_CARDS.push(card);
        if(typeof BUILTIN_CARD_IDS!=='undefined')BUILTIN_CARD_IDS.add(card.id);
        if(typeof BUILTIN_PROGRESS_BASELINE!=='undefined')BUILTIN_PROGRESS_BASELINE.set(card.id,{
          interval:0,repetitions:0,easeFactor:2.5,nextReview:0
        });
        modified=true;
      });
      var lines=cards.filter(function(c){return !!asText(c.speaker);});
      if(lines.length && typeof DIALOGUES_DB!=='undefined') {
        DIALOGUES_DB['lfimp_'+lesson.lesson_id]={
          course:lesson.category,topic:lesson.title,title:lesson.title,
          language:lesson.language==='zh'?'zh-CN':'en-US',
          lines:lines.map(function(c){return {
            speaker:c.speaker, vn:c.meaning,
            en:c.chinese,
            cn:c.meaning,
            lang:lesson.language==='zh'?'zh-CN':'en-US'
          };})
        };
        dialogue=true;
      }
    });
    if(modified){loadData();if(typeof renderManageTable==='function')renderManageTable();}
    if(dialogue&&typeof populateDialogueLessonDropdown==='function')populateDialogueLessonDropdown();
  }
  async function refresh() {
    if(!client)return;
    var rows=[];
    try {
      for(var offset=0;offset<5000;offset+=100){
        var res=await client.from(TABLE).select('lesson_id,title,language,category,cards')
          .eq('status','published').order('lesson_id').range(offset,offset+99);
        if(res.error)throw res.error;
        rows.push.apply(rows,res.data||[]);
        if(!res.data||res.data.length<100)break;
      }
      addToStudy(rows);
    }catch(e){console.warn('Published lesson load:',e);}
  }
  function status(t,red) {
    var el=document.getElementById('lfLessonImportStatus');
    if(el){el.textContent=t;el.style.color=red?'#b91c1c':'#475569';}
  }
  function disablePublish(disabled) {
    var b=document.getElementById('lfLessonPublish');
    if(b)b.disabled=disabled;
  }
  function sampleDownload() {
    var example={
      lesson_id:'en-unit-1-lesson-7', title:'Unit 1 Lesson 7 - My Work',
      language:'en',category:'51Talk English',
      cards:[
        {type:'vocab',word:'designer',phonetic:'/dɪˈzaɪnər/',meaning:'nhà thiết kế',
          chinese:'设计师',example:'I am a designer.',exampleTrans:'Tôi là nhà thiết kế.'},
        {type:'dialogue',speaker:'A',en:'What do you do?',vi:'Bạn làm nghề gì?',zh:'你做什么工作？'},
        {type:'dialogue',speaker:'B',en:'I am a designer.',vi:'Tôi là nhà thiết kế.',zh:'我是一名设计师。'}
      ]
    };
    var url=URL.createObjectURL(new Blob([JSON.stringify(example,null,2)],{type:'application/json'}));
    var a=document.createElement('a');a.href=url;a.download='linguaflash-lesson-template.json';
    a.click();setTimeout(function(){URL.revokeObjectURL(url);},2000);
  }
  async function preview() {
    pending=null;disablePublish(true);
    try{
      if(!admin||!client)throw Error('Chưa có quyền quản trị.');
      var file=document.getElementById('lfLessonImportFile').files[0];
      var input=document.getElementById('lfLessonImportJson').value.trim();
      if(!file&&!input)throw Error('Chọn file JSON/Excel hoặc dán JSON trước.');
      var source=file?await parseFile(file):JSON.parse(input);
      var lesson=lessonFrom(source);
      var res=await client.from(TABLE).select('lesson_id').eq('lesson_id',lesson.lesson_id).maybeSingle();
      if(res.error)throw res.error;
      var existing=new Set();
      if(typeof allCards!=='undefined')allCards.forEach(function(c){
        if(asText(c.id).indexOf('lfimp_'+lesson.lesson_id+'_')!==0)existing.add(key(c));
      });
      var good=lesson.cards.filter(function(c){return !existing.has(key(c));});
      var skipped=lesson.cards.length-good.length;
      var previewText=[
        'Bài học: '+lesson.title, 'Mã bài: '+lesson.lesson_id,
        'Ngôn ngữ: '+lesson.language, 'Khóa học: '+lesson.category,
        'Thẻ mới hợp lệ: '+good.length,'Trùng dữ liệu đang có: '+skipped,
        'Dòng thiếu dữ liệu: '+lesson.invalid,'Trùng trong file: '+lesson.insideDuplicates
      ];
      if(res.data)previewText.push('⚠ Bài học đã tồn tại; cần bật cho phép cập nhật.');
      document.getElementById('lfLessonImportPreview').textContent=previewText.join('\n');
      if(!good.length)throw Error('Không còn thẻ mới hợp lệ để nhập.');
      lesson.cards=good;
      pending={lesson:lesson,exists:!!res.data};disablePublish(false);
      status('Đã xem trước. Nhấn Xuất bản để lưu lên Supabase.');
    }catch(e){status('Không thể xem trước: '+(e.message||e),true);}
  }
  async function publish() {
    if(!pending||!admin||!client)return;
    disablePublish(true);
    try{
      var lesson=pending.lesson, overwrite=!!document.getElementById('lfLessonOverwrite').checked;
      if(pending.exists&&!overwrite)throw Error('Bài này đã có. Đánh dấu Cho phép cập nhật rồi thử lại.');
      status('Đang lưu bài học…');
      var payload={
        lesson_id:lesson.lesson_id,title:lesson.title,language:lesson.language,
        category:lesson.category,cards:lesson.cards,status:'published',
        updated_at:new Date().toISOString()
      };
      var res=overwrite
        ?await client.from(TABLE).upsert(payload,{onConflict:'lesson_id'})
        :await client.from(TABLE).insert(payload);
      if(res.error)throw res.error;
      pending=null;
      status('Đã xuất bản '+lesson.title+' ('+lesson.cards.length+' thẻ).');
      await refresh();
    }catch(e){status('Chưa xuất bản: '+(e.message||e),true);disablePublish(false);}
  }
  function mount() {
    if(!admin||document.getElementById('lfLessonImportPanel'))return;
    var host=document.getElementById('tab-manage');if(!host)return;
    var section=document.createElement('section');section.id='lfLessonImportPanel';
    section.className='bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-indigo-200 space-y-3';
    section.innerHTML=[
      '<h2 class="text-lg font-extrabold text-slate-900">📚 Import Lessons · Nhập bài từ ChatGPT</h2>',
      '<p class="text-sm text-slate-600">Đưa PDF cho ChatGPT biên soạn thành JSON/Excel, chọn file và xem trước. Chỉ quản trị viên được xuất bản.</p>',
      '<div class="flex flex-wrap gap-2 items-center"><input id="lfLessonImportFile" type="file" accept=".json,.xlsx,.xls,.csv" class="text-sm w-full sm:w-auto">',
      '<button type="button" id="lfLessonDownloadSample" class="rounded-xl border px-3 py-2 text-sm font-bold">Tải mẫu JSON</button></div>',
      '<textarea id="lfLessonImportJson" rows="6" spellcheck="false" class="w-full rounded-xl border border-slate-300 p-3 text-sm font-mono" placeholder="Hoặc dán JSON từ ChatGPT tại đây"></textarea>',
      '<div class="flex flex-wrap gap-3 items-center">',
      '<button type="button" id="lfLessonPreview" class="rounded-xl bg-indigo-600 text-white font-bold px-4 py-2">1. Xem trước</button>',
      '<label class="text-sm"><input type="checkbox" id="lfLessonOverwrite"> Cho phép cập nhật bài đã có</label>',
      '<button type="button" id="lfLessonPublish" disabled class="rounded-xl bg-emerald-600 disabled:opacity-40 text-white font-bold px-4 py-2">2. Xuất bản</button>',
      '</div><pre id="lfLessonImportPreview" class="whitespace-pre-wrap text-sm text-slate-700"></pre>',
      '<p id="lfLessonImportStatus" aria-live="polite" class="text-sm text-slate-500">Chưa xem trước bài học.</p>',
      '<p class="text-xs text-slate-500">Chức năng nhập nội dung; MP3 sử dụng quy trình âm thanh hiện tại.</p>'
    ].join('');
    host.insertBefore(section,host.firstChild);
    section.querySelector('#lfLessonPreview').addEventListener('click',preview);
    section.querySelector('#lfLessonPublish').addEventListener('click',publish);
    section.querySelector('#lfLessonDownloadSample').addEventListener('click',sampleDownload);
    ['lfLessonImportFile','lfLessonImportJson'].forEach(function(id){
      section.querySelector('#'+id).addEventListener('change',function(){pending=null;disablePublish(true);});
    });
  }
  async function checkAdmin() {
    if(!client)return;
    var s=await client.auth.getSession();
    if(!s.data || !s.data.session || !s.data.session.user){
      admin=false;document.getElementById('lfLessonImportPanel')?.remove();return;
    }
    var res=await client.from('linguaflash_admins').select('role').maybeSingle();
    admin=!res.error&&!!res.data?.role;
    if(admin)mount();else document.getElementById('lfLessonImportPanel')?.remove();
  }
  async function init() {
    var config=window.LINGUAFLASH_SUPABASE||{};
    if(!window.supabase?.createClient||!config.url||!config.anonKey)return;
    client=window.supabase.createClient(config.url,config.anonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    await refresh();
    await checkAdmin();
    client.auth.onAuthStateChange(function(){
      setTimeout(function(){checkAdmin().catch(function(e){console.warn(e);});},0);
    });
    window.lfRefreshPublishedLessons=refresh;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
