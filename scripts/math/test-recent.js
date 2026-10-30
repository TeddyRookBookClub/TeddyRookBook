#!/usr/bin/env node
/* Tests for the recent-problem memory (MathLadder.recent in static/math/core/gen.js).
   node scripts/math/test-recent.js        prints one line per test; exit status 1 if any fails. */
'use strict';
var path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
global.window = global;
require(path.join(ROOT, 'static/math/core/gen.js'));
var ML = global.MathLadder, fails = 0, n = 0;
function ok(cond, name, info) { n++; if (!cond) fails++; console.log((cond ? '  ok  ' : '  ✗   ') + name + (info ? '  (' + info + ')' : '')); }
function mem(limit) { // a localStorage stand-in; limit: setItem throws past this many characters (a full storage)
  var d = {};
  return { d: d, getItem: function (k) { return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; },
    setItem: function (k, v) { v = String(v); if (limit && v.length > limit) { var e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } d[k] = v; },
    removeItem: function (k) { delete d[k]; } };
}
function problem(q) { return { q: q, a: { t: 'num', v: '1' }, steps: ['x'] }; }
ML.gen('test.big', function (R) { return problem('Big ' + R.int(1, 5000)); });     // thousands of different problems
ML.gen('test.eight', function (R) { return problem('Eight ' + R.int(1, 8)); });    // exactly 8 different problems
ML.gen('test.one', function () { return problem('Only one'); });
function drawer(id, lv) { var s = Math.floor(Math.random() * 1e9), k = 0; return function () { return ML.makeProblem(id, s + (k++) * 7919, { level: lv || 1 }); }; }

// 1. plenty of variety: no repeat in 40 draws (with memory), many times over
(function () {
  var bad = 0;
  for (var t = 0; t < 50; t++) {
    var M = ML.recent.create({ storage: mem() }), seen = {}, rep = 0;
    for (var i = 0; i < 40; i++) { var p = M.pick('test.big', drawer('test.big')); if (seen[p.q]) rep++; seen[p.q] = 1; }
    if (rep) bad++;
  }
  ok(bad === 0, 'a topic with thousands of problems: no repeat in 40 draws', bad + ' of 50 runs repeated');
})();
// a real generator with 200+ different problems
(function () {
  var file = path.join(ROOT, 'static/math/gen/alg1.js'); require(file);
  var id = 'alg1.two-way-relative-frequency', all = {};
  for (var s = 0; s < 400; s++) all[ML.recent.key(ML.makeProblem(id, s, { level: 2 }))] = 1;
  var bad = 0;
  for (var t = 0; t < 20; t++) {
    var M = ML.recent.create({ storage: mem() }), seen = {}, rep = 0;
    for (var i = 0; i < 40; i++) { var p = M.pick(id, drawer(id, 2)), k = ML.recent.key(p); if (seen[k]) rep++; seen[k] = 1; }
    if (rep) bad++;
  }
  ok(Object.keys(all).length >= 200 && bad === 0, id + ': no repeat in 40 draws', Object.keys(all).length + ' distinct in 400 seeds; ' + bad + ' of 20 runs repeated');
})();

// 2. only 8 problems: all 8 before any repeat, and again in the next 8
(function () {
  var bad = 0, worst = '';
  for (var t = 0; t < 200; t++) {
    var M = ML.recent.create({ storage: mem() }), d = drawer('test.eight'), ok1 = true;
    for (var b = 0; b < 3; b++) {
      var seen = {};
      for (var i = 0; i < 8; i++) { var p = M.pick('test.eight', d); if (seen[p.q]) ok1 = false; seen[p.q] = 1; }
    }
    if (!ok1) { bad++; worst = 'run ' + t; }
  }
  ok(bad === 0, 'a topic with only 8 problems: cycles through all 8 before repeating (3 cycles, 200 runs)', bad ? bad + ' runs repeated early, e.g. ' + worst : '');
})();
// one problem only: never blocks
(function () {
  var M = ML.recent.create({ storage: mem() }), got = 0;
  for (var i = 0; i < 10; i++) if (M.pick('test.one', drawer('test.one'))) got++;
  ok(got === 10, 'a topic with one problem: always gives it (never blocks)');
  ok(M.pick('test.one', function () { return null; }) === null, 'a draw that gives nothing: null, no loop');
})();

// 3. remembered across visits: a new page (new memory, same storage) avoids the last session's problems
(function () {
  var st = mem(), A = ML.recent.create({ storage: st }), last = {};
  for (var i = 0; i < 6; i++) last[A.pick('test.eight', drawer('test.eight')).q] = 1;
  var B = ML.recent.create({ storage: st }), hit = 0;
  for (var j = 0; j < 2; j++) if (last[B.pick('test.eight', drawer('test.eight')).q]) hit++;
  ok(hit === 0, 'the next visit (e.g. a review the next day) avoids the last session\'s problems', Object.keys(last).length + ' seen before; ' + hit + ' repeated');
})();

// 4. corrupt or unusable storage
(function () {
  var cases = ['{not json', '[]', 'null', '42', '{"v":2,"t":{}}', '{"v":1,"t":[]}', '{"v":1,"n":"x","t":{"test.eight":"abc"}}',
    '{"v":1,"n":5,"t":{"test.eight":[3,"ZZZ!! 12 <b>"],"bad id":[1,"a"],"test.big":[1,7]}}', JSON.stringify({ v: 1, n: 1, t: { 'test.eight': [1, new Array(5000).join('a ')] } })];
  var good = 0;
  cases.forEach(function (c) {
    var st = mem(); st.d['trb-recent-v1'] = c;
    try {
      var M = ML.recent.create({ storage: st }), seen = {}, rep = 0;
      for (var i = 0; i < 8; i++) { var p = M.pick('test.eight', drawer('test.eight')); if (seen[p.q]) rep++; seen[p.q] = 1; }
      var o = JSON.parse(st.d['trb-recent-v1']);
      if (!rep && o.v === 1 && M.list('test.eight').length >= 8 && M.list('test.eight').length <= 40) good++;
    } catch (e) { }
  });
  ok(good === cases.length, 'corrupt saves are dropped and replaced, practice goes on', good + ' of ' + cases.length);
  var throwing = { getItem: function () { throw new Error('denied'); }, setItem: function () { throw new Error('denied'); }, removeItem: function () { throw new Error('denied'); } };
  var M2 = ML.recent.create({ storage: throwing }), seen2 = {}, rep2 = 0;
  for (var i = 0; i < 8; i++) { var p = M2.pick('test.eight', drawer('test.eight')); if (seen2[p.q]) rep2++; seen2[p.q] = 1; }
  ok(rep2 === 0, 'storage that throws: works for the visit (in memory)');
  var M3 = ML.recent.create({ storage: null }), seen3 = {}, rep3 = 0;
  for (var j = 0; j < 8; j++) { var p3 = M3.pick('test.eight', drawer('test.eight')); if (seen3[p3.q]) rep3++; seen3[p3.q] = 1; }
  ok(rep3 === 0, 'no storage at all: works for the visit');
  var M4 = ML.recent.create({ storage: mem() }); M4.off = true;
  var d4 = drawer('test.eight'), p4 = M4.pick('test.eight', d4);
  ok(!!p4 && M4.list('test.eight').length === 0, 'switched off: the first draw, nothing remembered');
})();

// 5. the size cap
(function () {
  var st = mem(), M = ML.recent.create({ storage: st });
  for (var t = 0; t < 600; t++) { var id = 'cap.topic-' + t; for (var i = 0; i < 45; i++) M.add(id, 'p' + t + 'x' + i); }
  var o = JSON.parse(st.d['trb-recent-v1']), total = 0, topics = Object.keys(o.t);
  topics.forEach(function (k) { total += o.t[k][1].split(' ').length; });
  var size = st.d['trb-recent-v1'].length;
  ok(total <= M.CAP && topics.length <= 400 && size < 100000, 'size cap: ' + total + ' fingerprints in ' + topics.length + ' topics, ' + Math.round(size / 1024) + ' KB', 'cap ' + M.CAP);
  ok(o.t['cap.topic-599'] && o.t['cap.topic-599'][1].split(' ').length === 40 && !o.t['cap.topic-0'], 'the newest topic keeps its last 40; the least recently used go first');
  var st2 = mem(20000), M2 = ML.recent.create({ storage: st2 });
  for (var u = 0; u < 300; u++) M2.add('full.t' + u, 'q' + u);
  ok(st2.d['trb-recent-v1'] && st2.d['trb-recent-v1'].length <= 20000, 'a full storage: keeps less and still saves', st2.d['trb-recent-v1'] ? Math.round(st2.d['trb-recent-v1'].length / 1024) + ' KB saved' : 'nothing saved');
  // real fingerprints: 3,000 hashes
  var st3 = mem(), M3 = ML.recent.create({ storage: st3 });
  for (var w = 0; w < 100; w++) for (var x = 0; x < 40; x++) M3.add('alg1.some-topic-name-' + w, problem('Q ' + w + ' ' + x));
  ok(st3.d['trb-recent-v1'].length < 60000, 'a full memory of real fingerprints is ' + Math.round(st3.d['trb-recent-v1'].length / 1024) + ' KB');
})();

// 6. makeProblem is unchanged: the same seed makes the same problem, memory or not
(function () {
  var a = ML.makeProblem('test.big', 123, { level: 2 }), M = ML.recent.create({ storage: mem() });
  M.add('test.big', a);
  var b = ML.makeProblem('test.big', 123, { level: 2 });
  ok(a.q === b.q && ML.recent.fp(a) === ML.recent.fp(b), 'makeProblem(id, seed) still gives the same problem');
})();

console.log((fails ? 'FAIL' : 'PASS') + ': ' + (n - fails) + ' of ' + n + ' tests passed.');
process.exit(fails ? 1 : 0);
