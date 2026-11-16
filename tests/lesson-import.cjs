/* Offline unit tests for Import Lessons. Run: node --test tests/lesson-import.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'lesson-import-v1.js'), 'utf8');
const injected = source.replace(/\}\)\(\);\s*$/, 'window.__testLessonFrom = lessonFrom; })();');
assert.notEqual(injected, source, 'test hook must be inserted into the IIFE');
const context = {
  window: {}, document: {readyState: 'loading', addEventListener() {}},
  console
};
vm.runInNewContext(injected, context, {filename:'lesson-import-v1.js'});
const normalize = context.window.__testLessonFrom;
assert.equal(typeof normalize, 'function');

test('English vocabulary and dialogue become stable flashcards', () => {
  const input = {
    lesson_id:'unit-1-lesson-7', title:'My Work', language:'en', category:'51Talk English',
    cards:[
      {type:'vocab', word:'designer', meaning:'nhà thiết kế', phonetic:'/dɪˈzaɪnər/'},
      {type:'dialogue', speaker:'A', en:'What do you do?',vi:'Bạn làm nghề gì?',zh:'你做什么工作？'}
    ]
  };
  const a=normalize(input),b=normalize(input);
  assert.equal(a.cards.length, 2);
  assert.equal(a.cards[0].id,b.cards[0].id);
  assert.equal(a.cards[0].topic,'51Talk English - My Work');
  assert.equal(a.cards[1].cardType,'sentence');
  assert.equal(a.cards[1].speaker,'A');
  assert.equal(a.cards[1].chinese,'你做什么工作？');
});

test('duplicate entries are not published twice', () => {
  const data=normalize({title:'Duplicate lesson',language:'en',cards:[
    {word:'run',meaning:'chạy'},
    {word:'run',meaning:'chạy'},
    {word:'',meaning:'thiếu từ'}
  ]});
  assert.equal(data.cards.length,1);
  assert.equal(data.insideDuplicates,1);
  assert.equal(data.invalid,1);
});

test('Chinese Pinyin and English equivalent preserve existing card schema', () => {
  const data=normalize({lesson_id:'zh-1',title:'Gia Hân Bài 1',language:'zh',category:'Gia Hân',cards:[
    {word:'你好',meaning:'xin chào',chinese:'hello',pinyin:'nǐ hǎo'}
  ]});
  assert.equal(data.cards[0].lang,'Tiếng Trung');
  assert.equal(data.cards[0].phonetic,'nǐ hǎo');
  assert.equal(data.cards[0].chinese,'hello');
});

test('invalid language and empty lessons are rejected',()=>{
  assert.throws(()=>normalize({title:'Bad',language:'xx',cards:[{word:'a',meaning:'b'}]}));
  assert.throws(()=>normalize({title:'Bad',language:'en',cards:[]}));
});
