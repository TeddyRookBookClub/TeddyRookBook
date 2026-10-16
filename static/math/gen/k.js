/* Math Ladder: problem generators for Kindergarten (static/math/gen/k.js).
   One generator per topic in data/math/topics/k.json. Problems are mostly pictures with a short question, made for
   young learners and the grown-up reading with them. Pictures use the course visual "k-pic" (static/math/viz/k.js)
   and the shared visuals (clock). Built from /tmp/work_mlp1/src (gen_common.js + gen_k.js); tested by
   /tmp/work_mlp1/test/verify_gen.js and scripts/math/check-gen.js.                                                    */
(function (ML) {
  'use strict';
  var G = ML.gen, PIC = 'k-pic';
  // ---------------------------------------------------------------- shared helpers (Kindergarten and Grade 1)
  var U = ML.util, M = Math;
  function pic(o) { return { name: PIC, opts: o }; }
  function num(v) { return { t: 'num', v: String(v) }; }
  // multiple choice: correct first, then wrong ones (shuffled at display)
  function mc(correct, wrongs) {
    var out = [String(correct)];
    (wrongs || []).forEach(function (w) { w = String(w); if (out.indexOf(w) < 0) out.push(w); });
    return { t: 'mc', choices: out, v: 0 };
  }
  // multiple choice in a fixed order (A, B, C … or Yes / No)
  function mcKeep(choices, correctIndex) { return { t: 'mc', choices: choices.map(String), v: correctIndex, keep: true }; }
  var LET = ['A', 'B', 'C', 'D', 'E'];
  // things to count: [picture name, one, many, colors that look right]
  var THINGS = [
    ['apple', 'apple', 'apples', ['red', 'green', 'yellow']], ['star', 'star', 'stars', ['yellow', 'orange', 'blue']], ['heart', 'heart', 'hearts', ['pink', 'red', 'purple']],
    ['ball', 'ball', 'balls', ['blue', 'red', 'green', 'orange']], ['fish', 'fish', 'fish', ['orange', 'blue', 'yellow']], ['duck', 'duck', 'ducks', ['yellow']],
    ['flower', 'flower', 'flowers', ['purple', 'pink', 'red', 'blue']], ['car', 'car', 'cars', ['blue', 'red', 'green', 'yellow']], ['balloon', 'balloon', 'balloons', ['red', 'blue', 'green', 'yellow', 'purple']],
    ['ladybug', 'ladybug', 'ladybugs', ['red']], ['cookie', 'cookie', 'cookies', ['tan']], ['bear', 'teddy bear', 'teddy bears', ['brown']]
  ];
  var COLORED = ['ball', 'balloon', 'car', 'flower', 'star', 'heart'];
  function thingOf(key) { for (var i = 0; i < THINGS.length; i++) if (THINGS[i][0] === key) return mkThing(THINGS[i]); return mkThing(THINGS[0]); }
  function mkThing(t) { return { obj: t[0], one: t[1], many: t[2], colors: t[3] }; }
  function pickThing(R, not) { var list = THINGS.filter(function (t) { return (not || []).indexOf(t[0]) < 0; }); return mkThing(R.pick(list)); }
  function pickColored(R) { return thingOf(R.pick(COLORED)); }
  function w(n, t) { return n + ' ' + (n === 1 ? t.one : t.many); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var NAMES = ['Ana', 'Ben', 'Mia', 'Leo', 'Sam', 'Zoe', 'Max', 'Lily', 'Omar', 'Ruby', 'Kai', 'Nora', 'Eli', 'Ava', 'Jack', 'Maya', 'Theo', 'Iris', 'Noah', 'Ella', 'Luis', 'Priya', 'Tom', 'June', 'Ravi', 'Rosa', 'Finn', 'Hana'];
  function names(R, k) { return R.sample(NAMES, k || 1); }
  function seq(a, b) { var out = []; for (var i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i); return out; }
  function list(arr) { return arr.join(', '); }
  // a short counting list for steps: "1, 2, 3, 4, 5"; long ones are shortened: "1, 2, 3 … 14"
  function countList(a, b) { var s = seq(a, b); return s.length <= 8 ? list(s) : list(s.slice(0, 3)) + ' … ' + s[s.length - 1]; }
  function sq() { return '\\square'; }
  function ord(n) { return U.ordinal(n); }
  function colorPair(R, t) { var cs = R.sample(t.colors.length >= 2 ? t.colors : ['red', 'blue'], 2); return cs; }
  function isAre(n) { return n === 1 ? 'is' : 'are'; }
  function big(tex) { return '<span class="kp-big">$' + tex + '$</span>'; }

  // ================================================================ Kindergarten: Counting to 20
  G('k.count-to-10', function (R, ctx) {
    var kind = ML.byLevel(ctx, R.pick(['next', 'path']), R.pick(['next', 'between', 'path', 'before']), R.pick(['between', 'skip', 'before', 'skip']));
    if (kind === 'next') {
      var a = ML.byLevel(ctx, R.int(1, 4), R.int(2, 7));
      return { q: R.pick(NAMES) + ' is counting. What number comes next?<br>' + big(list([a, a + 1, a + 2]) + ', ' + sq()), a: num(a + 3),
        steps: ['Say the numbers in order: ' + list([a, a + 1, a + 2]) + ' …', 'The next number is ' + (a + 3) + '.'], hint: 'Say the numbers out loud. What do you say after ' + (a + 2) + '?' };
    }
    if (kind === 'path') {
      var h = R.int(2, 9);
      return { q: R.pick(NAMES) + ' covered a number. Which number is hiding under the <b>?</b>', viz: pic({ kind: 'path', from: 1, to: 10, hide: [h] }), a: num(h),
        steps: ['Count along the path: ' + list(seq(1, h - 1)) + ' …', 'After ' + (h - 1) + ' comes ' + h + '.', 'The hiding number is ' + h + '.'], hint: 'Start at 1 and count along the squares.' };
    }
    if (kind === 'between') {
      var b = R.int(1, 8);
      return { q: 'Help ' + R.pick(NAMES) + ' count. What number goes in the box?<br>' + big(b + ', ' + sq() + ', ' + (b + 2)), a: num(b + 1),
        steps: ['Count: ' + b + ', ' + (b + 1) + ', ' + (b + 2) + '.', 'The number between ' + b + ' and ' + (b + 2) + ' is ' + (b + 1) + '.'], hint: 'Count from ' + b + '. What do you say next?' };
    }
    if (kind === 'before') {
      var c = R.int(2, 10);
      return { q: 'What number comes just <b>before</b> ' + c + '?', a: num(c - 1),
        steps: ['Count up to ' + c + ': ' + list(seq(1, c)) + '.', 'Just before ' + c + ' we say ' + (c - 1) + '.'], hint: 'Count from 1 and stop at ' + c + '. What did you say just before it?' };
    }
    var top = R.int(6, 10), miss = R.int(2, top - 1), nm = R.pick(NAMES), said = seq(1, top).filter(function (x) { return x !== miss; });
    return { q: nm + ' counted like this:<br>' + big(list(said)) + '<br>Which number did ' + nm + ' skip?', a: num(miss),
      steps: ['The right way: ' + list(seq(1, top)) + '.', nm + ' said ' + (miss - 1) + ' and then ' + (miss + 1) + '.', 'The number ' + miss + ' was skipped.'], hint: 'Count to ' + top + ' yourself. Listen for the number ' + nm + ' left out.' };
  });

  G('k.one-to-one-counting', function (R, ctx) {
    var t = pickThing(R), lv = ctx.level, n, lay;
    if (lv >= 3 && R.coin()) {
      n = R.int(5, 9); var nm = R.pick(NAMES);
      return { q: nm + ' counted these ' + t.many + ' and touched one of them two times. ' + nm + ' said ' + (n + 1) + '. How many ' + t.many + ' are there really?',
        viz: pic({ n: n, obj: t.obj, layout: 'scatter', seed: R.int(1, 999) }), a: num(n),
        steps: ['Touch each ' + t.one + ' one time only.', 'Say one number for each touch: ' + countList(1, n) + '.', 'There are ' + w(n, t) + '. Touching one twice gave one number too many.'], hint: 'Tap each one in the picture. A tapped one gets its number, so you can see which ones you already counted.' };
    }
    n = ML.byLevel(ctx, R.int(3, 6), R.int(5, 10), R.int(7, 10));
    lay = ML.byLevel(ctx, 'row', R.pick(['grid', 'scatter', 'row']), 'scatter');
    return { q: 'How many ' + t.many + '? Touch each one as you count.', viz: pic({ n: n, obj: t.obj, layout: lay, seed: R.int(1, 999) }), a: num(n),
      steps: ['Touch one ' + t.one + ' and say 1. Touch the next and say 2.', 'Say one number for each ' + t.one + ': ' + countList(1, n) + '.', 'There are ' + w(n, t) + '.'], hint: 'Tap each one in the picture. Each one gets one number.' };
  });

  G('k.how-many', function (R, ctx) {
    var t = pickThing(R), nm = R.pick(NAMES), lv = ctx.level, n;
    if (lv === 1) {
      n = R.int(3, 8);
      return { q: nm + ' counted the ' + t.many + '. The numbers show what ' + nm + ' said. How many ' + t.many + ' are there?', viz: pic({ n: n, obj: t.obj, nums: true, tap: false }), a: num(n),
        steps: [nm + ' said ' + countList(1, n) + '.', 'The last number tells how many.', 'There are ' + w(n, t) + '.'], hint: 'Look at the last number ' + nm + ' said.' };
    }
    if (lv === 2 || R.coin()) {
      n = R.int(4, 10);
      return { q: 'Count the ' + t.many + '. Then say the last number again. How many are there?', viz: pic({ n: n, obj: t.obj, layout: R.pick(['row', 'grid', 'scatter']), seed: R.int(1, 999) }), a: num(n),
        steps: ['Count: ' + countList(1, n) + '.', 'The last number you said is ' + n + '.', 'So there are ' + w(n, t) + '. You do not need to count again.'], hint: 'When you finish counting, the last number you said is the answer.' };
    }
    n = R.int(4, 8);
    return { q: nm + ' counted the ' + t.many + ': ' + list(seq(1, n)) + '. Then ' + nm + ' counted them again, starting with a different one. What number will ' + nm + ' end on this time?',
      viz: pic({ n: n, obj: t.obj, layout: 'circle' }), a: mc(n, [n + 1, n - 1, 1]),
      steps: ['There are still the same ' + t.many + '. None came and none left.', 'Any order works, as long as each one gets one number.', nm + ' will end on ' + n + ' again.'], hint: 'Did any ' + t.many + ' come or go?' };
  });

  G('k.see-small-amounts', function (R, ctx) {
    var n = ML.byLevel(ctx, R.int(1, 5), R.int(2, 6), R.int(3, 6)), flash = ctx.level >= 3;
    var how = { 1: 'One dot in the middle.', 2: 'Two dots, one in each corner.', 3: 'Three dots in a line from corner to corner.', 4: 'Four dots, one in each corner.', 5: 'Four corners and one in the middle make 5.', 6: 'Two rows of 3 make 6.' };
    var color = R.pick(['red', 'blue', 'green', 'purple']);
    var lay = ctx.level === 2 && n <= 5 && R.coin() ? 'frame' : 'dice';
    var o = lay === 'frame' ? { layout: 'frame', n: n, frames: 1 } : { n: n, obj: 'dot', color: color, layout: 'dice' };
    if (flash) o.flash = 1500;
    o.tap = false;
    var whoS = R.pick(NAMES), card = lay === 'frame' ? whoS + '’s ten frame' : whoS + '’s dot card';
    return { q: flash ? 'Look fast at ' + card + '! How many ' + (lay === 'frame' ? '' : color + ' ') + 'dots did you see?' : 'How many ' + (lay === 'frame' ? '' : color + ' ') + 'dots are on ' + card + '? Try to see it without counting one by one.', viz: pic(o), a: num(n),
      steps: [lay === 'frame' ? (n === 5 ? 'One full row of the ten frame is 5.' : n < 5 ? n + ' in the top row.' : 'A full row of 5 and ' + (n - 5) + ' more.') : how[n], 'There are ' + n + ' dots.'],
      hint: 'Look for a pattern you know, like the dots on a die.' };
  });

  G('k.numerals-0-10', function (R, ctx) {
    var kind = ML.byLevel(ctx, 'count', R.pick(['count', 'which', 'zero']), R.pick(['which', 'flip', 'count']));
    if (kind === 'count') {
      var n = R.chance(0.2) ? 0 : R.int(1, 10);
      return { q: 'How many cookies are on the plate? Type the number.', viz: pic({ n: n, obj: 'cookie', plate: true, layout: n > 5 ? 'grid' : 'row' }), a: num(n),
        steps: n ? ['Count the cookies: ' + countList(1, n) + '.', 'We write ' + n + '.'] : ['There are no cookies on the plate.', 'None at all is the number 0.'], hint: n ? 'Count each cookie one time.' : 'Look closely. Is anything on the plate?' };
    }
    if (kind === 'zero') return { q: 'Which number means <b>none</b>, nothing at all?', a: mc(0, [1, 10]), steps: ['0 means none.', 'An empty plate has 0 cookies.'], hint: 'Think of an empty plate.' };
    if (kind === 'which') {
      var t = pickThing(R), target = R.int(3, 9), others = R.sample([target - 2, target - 1, target + 1, target + 2].filter(function (x) { return x >= 1 && x <= 10; }), 2), cnts = R.shuffle([target].concat(others));
      var idx = cnts.indexOf(target);
      return { q: 'Which box has <b>' + target + '</b> ' + t.many + '?', viz: pic({ groups: cnts.map(function (c, i) { return { n: c, obj: t.obj, label: LET[i], layout: c > 5 ? 'grid' : 'row' }; }), stack: true, tap: true }),
        a: mcKeep(['A', 'B', 'C'], idx), steps: cnts.map(function (c, i) { return 'Box ' + LET[i] + ' has ' + w(c, t) + '.'; }).concat(['Box ' + LET[idx] + ' has ' + target + '.']), hint: 'Count each box. Tap the ' + t.many + ' to keep track.' };
    }
    var d = R.pick([2, 3, 4, 5, 6, 7, 9]), flipFirst = R.coin();
    return { q: 'Which ' + d + ' is written the right way?', viz: pic({ kind: 'digits', items: [{ d: String(d), flip: flipFirst, name: 'A' }, { d: String(d), flip: !flipFirst, name: 'B' }] }),
      a: mcKeep(['A', 'B'], flipFirst ? 1 : 0), steps: ['One of them is flipped, like in a mirror.', 'The right way is ' + (flipFirst ? 'B' : 'A') + '.', 'Trace it with your finger to feel the way it goes.'], hint: 'Picture how ' + d + ' looks in a book.' };
  });

  G('k.one-more', function (R, ctx) {
    var kind = ML.byLevel(ctx, 'pic', R.pick(['pic', 'say', 'path']), R.pick(['say', 'back', 'nine']));
    var t = pickThing(R);
    if (kind === 'pic') {
      var a = R.int(2, 8);
      return { q: R.pick(NAMES) + ' has ' + w(a, t) + '. One more comes. How many now?', viz: pic({ groups: [{ n: a, obj: t.obj }, { n: 1, obj: t.obj, ring: 1 }], op: '+' }), a: num(a + 1),
        steps: ['Start with ' + a + '.', 'One more is the next number: ' + a + ', ' + (a + 1) + '.', 'Now there are ' + w(a + 1, t) + '.'], hint: 'What number comes right after ' + a + '?' };
    }
    if (kind === 'path') {
      var b = R.int(2, 9);
      var hopper = R.pick(NAMES);
      return { q: hopper + ' starts on ' + b + ' and hops one step. Where does ' + hopper + ' land? That number is 1 more than ' + b + '.', viz: pic({ kind: 'path', from: M.max(0, b - 3), to: M.min(20, b + 4), start: b, hops: 1, hide: [b + 1] }), a: num(b + 1),
        steps: ['One hop goes to the next number.', '1 more than ' + b + ' is ' + (b + 1) + '.'], hint: 'What number comes after ' + b + '?' };
    }
    if (kind === 'say' || kind === 'nine') {
      var c = kind === 'nine' ? 9 : R.int(1, 8);
      return { q: R.pick(NAMES) + ' has ' + c + ' ' + R.pick(['stickers', 'shells', 'blocks', 'beads', 'crayons']) + ' and finds 1 more. What number is 1 more than ' + c + '?', a: num(c + 1), steps: ['Count: ' + c + ', ' + (c + 1) + '.', '1 more than ' + c + ' is ' + (c + 1) + '.'], hint: 'The next counting number is always 1 more.' };
    }
    var e = R.int(2, 10);
    return { q: R.pick(NAMES) + ' says: “' + e + ' is 1 more than my number.” What is the number?', a: num(e - 1), steps: ['Count up to ' + e + ': … ' + (e - 1) + ', ' + e + '.', e + ' comes right after ' + (e - 1) + ', so ' + e + ' is 1 more than ' + (e - 1) + '.'], hint: 'What number comes just before ' + e + '?' };
  });

  G('k.count-to-20', function (R, ctx) {
    var t = pickThing(R), n, lay, cols;
    if (ctx.level === 1) { n = R.int(6, 12); lay = R.pick(['row', 'grid']); }
    else if (ctx.level === 2) { n = R.int(11, 20); lay = R.pick(['grid', 'row', 'array']); }
    else { n = R.int(11, 20); lay = R.pick(['circle', 'scatter', 'circle']); }
    var o = { n: n, obj: t.obj, layout: lay === 'array' ? 'grid' : lay, seed: R.int(1, 999) };
    if (lay === 'array') { cols = n % 4 === 0 && n <= 16 ? 4 : n % 5 === 0 ? 5 : n % 3 === 0 ? 3 : 5; o.cols = cols; }
    if (lay === 'circle') o.size = n > 15 ? 18 : 20;
    var shape = lay === 'circle' ? 'a circle' : lay === 'scatter' ? 'a jumble' : 'rows';
    return { q: 'How many ' + t.many + '? Tap each one as you count.', viz: pic(o), a: num(n),
      steps: lay === 'circle' ? ['Start with one ' + t.one + '. Tap it so you remember where you started.', 'Go around the circle and count each one: ' + countList(1, n) + '.', 'Stop when you get back to the first one. There are ' + w(n, t) + '.']
        : ['The ' + t.many + ' are in ' + shape + '. Count each one once: ' + countList(1, n) + '.', 'There are ' + w(n, t) + '.'],
      hint: lay === 'circle' ? 'Tap the first one so you know where you started.' : 'Count one row at a time, or tap each one as you go.' };
  });

  G('k.count-out', function (R, ctx) {
    var t = pickThing(R), nm = R.pick(NAMES), kind = ML.byLevel(ctx, 'which', R.pick(['which', 'right']), R.pick(['right', 'more']));
    if (kind === 'which') {
      var target = R.int(4, 10), cnts = R.shuffle([target, target - 1, target + 1]), idx = cnts.indexOf(target);
      return { q: nm + ' needs exactly <b>' + target + '</b> ' + t.many + '. Which box has just the right number?', viz: pic({ groups: cnts.map(function (c, i) { return { n: c, obj: t.obj, label: LET[i], layout: c > 5 ? 'grid' : 'row' }; }), stack: true }),
        a: mcKeep(['A', 'B', 'C'], idx), steps: cnts.map(function (c, i) { return 'Box ' + LET[i] + ': ' + w(c, t) + '.'; }).concat(['Box ' + LET[idx] + ' has exactly ' + target + '.']), hint: 'Count each box and stop at the last one.' };
    }
    if (kind === 'right') {
      var need = R.int(4, 8), took = R.pick([need - 1, need, need, need + 1, need + 2]), total = R.int(M.max(took + 3, 9), 14);
      var ans = took === need ? 0 : took > need ? 1 : 2;
      return { q: nm + ' needs <b>' + need + '</b> ' + t.many + ' and took the ones with a yellow ring. Did ' + nm + ' take the right number?', viz: pic({ n: total, obj: t.obj, layout: 'grid', cols: 7, ring: took }),
        a: mcKeep(['Just right', 'Too many', 'Too few'], ans), steps: ['Count only the ' + t.many + ' with a ring: ' + countList(1, took) + '.', nm + ' took ' + took + ' and needs ' + need + '.', took === need ? 'That is just right.' : took > need ? took + ' is more than ' + need + ', so that is too many. Stop counting at ' + need + '.' : took + ' is less than ' + need + ', so that is too few.'], hint: 'Count the ringed ones. Compare with ' + need + '.' };
    }
    var want = R.int(5, 10), have = R.int(want - 3, want - 1);
    return { q: nm + ' needs ' + w(want, t) + '. Here is what ' + nm + ' has. How many more does ' + nm + ' need?', viz: pic({ n: have, obj: t.obj, layout: 'row' }), a: num(want - have),
      steps: ['Count what ' + nm + ' has: ' + have + '.', 'Keep counting up to ' + want + ': ' + list(seq(have + 1, want)) + '.', 'That is ' + (want - have) + ' more.'], hint: 'Start at ' + have + ' and count up to ' + want + '.' };
  });

  G('k.numerals-11-20', function (R, ctx) {
    var kind = ML.byLevel(ctx, 'frame', R.pick(['frame', 'word']), R.pick(['word', 'path', 'frame']));
    if (kind === 'frame') {
      var n = R.int(11, 20);
      var nm0 = R.pick(NAMES);
      return { q: nm0 + ' filled one ten frame and started another. How many counters are there? Type the number.', viz: pic({ layout: 'frame', n: 10, m: n - 10, split: true, tap: false }), a: num(n),
        steps: ['The full ten frame has 10.', 'The other frame has ' + (n - 10) + ' more.', '10 and ' + (n - 10) + ' more is ' + n + '.'], hint: 'A full ten frame is 10. Count on from 10.' };
    }
    if (kind === 'word') {
      var m = R.int(13, 19), rev = Number(String(m).split('').reverse().join(''));
      return { q: 'Which is the number <b>' + U.words(m) + '</b>?', a: mc(m, [rev, m - 10, m + 10]),
        steps: [cap(U.words(m)) + ' is 10 and ' + (m - 10) + ' more.', 'We write the ten first: 1 ten, then ' + (m - 10) + ' ones.', 'So ' + U.words(m) + ' is ' + m + '. (' + rev + ' is a much bigger number.)'], hint: cap(U.words(m)) + ' means 10 and ' + U.words(m - 10) + ' more.' };
    }
    var h = R.int(11, 19);
    return { q: R.pick(NAMES) + ' covered a number on the path. Which number is hiding under the <b>?</b>', viz: pic({ kind: 'path', from: 10, to: 20, hide: [h] }), a: num(h),
      steps: ['Count along: ' + list(seq(h - 2, h - 1)) + ' …', 'After ' + (h - 1) + ' comes ' + h + '.'], hint: 'Count from 10 along the path.' };
  });

  G('k.count-on', function (R, ctx) {
    if (ctx.level === 1) {
      var s = R.int(3, 10), h = R.int(2, 3);
      return { q: R.pick(['A frog', 'A bunny', 'A cricket', 'A kangaroo']) + ' starts on ' + s + ' and hops ' + h + ' more. Where does it land?', viz: pic({ kind: 'path', from: s - 2, to: s + h + 2, start: s, hops: h, hide: [s + h] }), a: num(s + h),
        steps: ['Start at ' + s + '. Do not go back to 1.', 'Hop and count on: ' + list(seq(s + 1, s + h)) + '.', 'You land on ' + (s + h) + '.'], hint: 'Say ' + s + ' quietly, then count the hops out loud.' };
    }
    if (ctx.level === 2 && R.coin()) {
      var a = R.int(5, 16);
      return { q: R.pick(NAMES) + ' is counting on. What number comes next?<br>' + big(list([a, a + 1, a + 2]) + ', ' + sq()), a: num(a + 3),
        steps: ['Start at ' + a + ' and keep counting.', list([a, a + 1, a + 2, a + 3]) + '.'], hint: 'Keep going from ' + (a + 2) + '.' };
    }
    var st = R.int(ctx.level === 2 ? 5 : 8, 16), k = R.int(2, ctx.level === 2 ? 3 : 4);
    if (st + k > 20) st = 20 - k;
    var who = R.pick(NAMES);
    return { q: who + ' starts at ' + st + ' and counts on ' + k + ' more. What number does ' + who + ' say last?', a: num(st + k),
      steps: ['Start at ' + st + '. Do not start over at 1.', 'Count on ' + k + ': ' + list(seq(st + 1, st + k)) + '.', 'The last number is ' + (st + k) + '.'], hint: 'Hold up ' + k + ' fingers. Say one number for each finger, starting after ' + st + '.' };
  });

  G('k.count-to-100', function (R, ctx) {
    var kind = ML.byLevel(ctx, R.pick(['next', 'tens']), R.pick(['cross', 'tens', 'chart']), R.pick(['cross', 'chart', 'hundred', 'tensmid']));
    if (kind === 'next' || kind === 'cross') {
      var a = kind === 'cross' ? R.int(1, 9) * 10 - 3 + R.int(0, 1) : R.int(11, 95);
      if (kind === 'next') while ((a + 3) % 10 === 0) a = R.int(11, 95);
      var nx = a + 3;
      return { q: R.pick(NAMES) + ' is counting. What number comes next?<br>' + big(list([a, a + 1, a + 2]) + ', ' + sq()), a: num(nx),
        steps: nx % 10 === 0 ? ['After ' + (nx - 1) + ' the ones start over, and we go to the next ten.', (nx - 1) + ' is followed by ' + nx + '.'] : ['Keep counting by ones: ' + list([a, a + 1, a + 2, nx]) + '.'], hint: nx % 10 === 0 ? 'After a 9 comes a new ten: think 19, 20 or 29, 30.' : 'What comes after ' + (a + 2) + '?' };
    }
    if (kind === 'tens' || kind === 'tensmid') {
      var d = R.int(1, kind === 'tens' ? 6 : 7), sh = kind === 'tensmid' ? R.int(0, 1) : 0, seqT = [d * 10, d * 10 + 10, d * 10 + 20, d * 10 + 30], hidx = sh ? 2 : 3, ansT = seqT[hidx];
      return { q: 'Count by tens. What number goes in the box?<br>' + big(seqT.map(function (x, i) { return i === hidx ? sq() : x; }).join(', ')), a: num(ansT),
        steps: ['Counting by tens: ' + list(seqT) + '.', 'Each jump is 10 more: one more ten.', 'The missing number is ' + ansT + '.'], hint: 'Say the tens: ten, twenty, thirty, forty …' };
    }
    if (kind === 'hundred') return { q: 'What number comes after 99?', a: num(100), steps: ['After 99 comes 100.', '100 is ten tens.'], hint: 'Count: 97, 98, 99 …' };
    var row = R.int(0, 8), start = row * 10 + 1, ask = R.pick([start + 9, start + 10, start + R.int(2, 8)]);
    return { q: 'Here is part of the hundred chart. What number goes in the <b>?</b> square?', viz: pic({ kind: 'chart', start: start, rows: 2, cols: 10, ask: ask }), a: num(ask),
      steps: ['Each row counts on by ones.', 'Count to the ? square: … ' + (ask - 1) + ', ' + ask + '.'], hint: 'Look at the number just before the ? square.' };
  });

  // ================================================================ Kindergarten: Comparing Numbers
  G('k.more-fewer-same', function (R, ctx) {
    var t1 = pickThing(R), t2 = pickThing(R, [t1.obj]), lv = ctx.level, a, b;
    a = R.int(2, lv === 1 ? 7 : 9); b = R.intNot(2, lv === 1 ? 7 : 9, [a]);
    if (lv === 3 && R.chance(0.3)) b = a;
    var askMore = lv === 1 ? true : R.coin();
    var o = { groups: [{ n: a, obj: t1.obj, label: cap(t1.many) }, { n: b, obj: t2.obj, label: cap(t2.many) }], stack: true, spread: lv >= 2, rows: true };
    var word = askMore ? 'more' : 'fewer';
    var choices = [cap(word) + ' ' + t1.many, cap(word) + ' ' + t2.many, 'The same number'];
    var ans = a === b ? 2 : ((a > b) === askMore ? 0 : 1);
    var big = a > b ? t1 : t2, small = a > b ? t2 : t1;
    return { q: 'Are there ' + word + ' ' + t1.many + ' or ' + word + ' ' + t2.many + '?', viz: pic(o), a: mcKeep(choices, ans),
      steps: ['Match each ' + t1.one + ' with one ' + t2.one + '.', a === b ? 'Every one has a partner. None are left over.' : 'Some ' + big.many + ' have no partner: there are extra ' + big.many + '.',
        'Count to check: ' + w(a, t1) + ' and ' + w(b, t2) + '.', a === b ? 'They are the same number.' : 'There are more ' + big.many + ' and fewer ' + small.many + '.'],
      hint: lv >= 2 ? 'A longer row does not always have more. Count both rows.' : 'Match them up one to one. Which kind has extras?' };
  });

  G('k.compare-numerals', function (R, ctx) {
    var a = R.int(0, 10), b = R.intNot(0, 10, [a]), big = M.max(a, b), small = M.min(a, b), kind = ML.byLevel(ctx, 'path', R.pick(['less', 'greater']), R.pick(['three', 'yesno', 'less']));
    if (kind === 'path') return { q: 'Which number is <b>greater</b>, ' + a + ' or ' + b + '?', viz: pic({ kind: 'path', from: 0, to: 10, mark: [a, b] }), a: mc(big, [small]),
      steps: ['When we count, ' + small + ' comes before ' + big + '.', 'Numbers later in the count are greater.', big + ' is greater than ' + small + '.'], hint: 'Which one do you say later when you count?' };
    if (kind === 'greater' || kind === 'less') {
      var g = kind === 'greater';
      return { q: 'Which number is <b>' + (g ? 'greater' : 'less') + '</b>, ' + a + ' or ' + b + '?', a: mc(g ? big : small, [g ? small : big]),
        steps: ['Count: ' + small + ' comes before ' + big + '.', g ? big + ' is greater.' : small + ' is less.'], hint: 'Picture ' + a + ' counters and ' + b + ' counters. Which group is bigger?' };
    }
    if (kind === 'three') {
      var xs = R.sample(seq(0, 10), 3), mx = M.max.apply(null, xs), sorted = xs.slice().sort(function (p, q) { return p - q; });
      return { q: 'Which number is the <b>greatest</b>: ' + xs.join(', ') + '?', a: mc(mx, xs.filter(function (x) { return x !== mx; })),
        steps: ['In counting order: ' + sorted.join(', ') + '.', 'The last one, ' + mx + ', is the greatest.'], hint: 'Put them in counting order.' };
    }
    var yes = a > b;
    return { q: 'Is ' + a + ' greater than ' + b + '?', a: mcKeep(['Yes', 'No'], yes ? 0 : 1),
      steps: [small + ' comes before ' + big + ' when we count.', yes ? 'Yes: ' + a + ' is greater than ' + b + '.' : 'No: ' + a + ' is less than ' + b + '.'], hint: 'Which comes later when you count?' };
  });

  // ================================================================ Kindergarten: Adding, Taking Away and Teen Numbers
  G('k.put-together', function (R, ctx) {
    var t = pickColored(R), cs = colorPair(R, t), max = ML.byLevel(ctx, 5, 10, 10), a = R.int(1, max - 1), b = R.int(1, max - a);
    var q;
    if (ctx.level < 3) q = a + ' ' + cs[0] + ' ' + (a === 1 ? t.one : t.many) + ' and ' + b + ' ' + cs[1] + ' ' + (b === 1 ? t.one : t.many) + '. How many ' + t.many + ' in all?';
    else q = 'There ' + isAre(a) + ' ' + w(a, t) + ' in the box. ' + R.pick(NAMES) + ' puts in ' + b + ' more. How many ' + t.many + ' are in the box now?';
    return { q: q, viz: ctx.level < 3 ? pic({ groups: [{ n: a, obj: t.obj, color: cs[0] }, { n: b, obj: t.obj, color: cs[1] }], op: '+' }) : undefined, a: num(a + b),
      steps: ['Put the two groups together.', 'Count them all: ' + countList(1, a + b) + '.', 'Or start at ' + a + ' and count on ' + b + ': ' + list(seq(a + 1, a + b)) + '.', '$' + a + ' + ' + b + ' = ' + (a + b) + '$'],
      hint: 'Count all of them together.' };
  });

  G('k.take-away', function (R, ctx) {
    var t = pickThing(R), n = ML.byLevel(ctx, R.int(3, 5), R.int(5, 10), R.int(5, 10)), k = R.int(1, n - 1), r = n - k, nm = R.pick(NAMES);
    var stories = [['There were ' + w(n, t) + '. ' + nm + ' took ' + k + ' away.', 'took away'], ['There were ' + w(n, t) + '. ' + k + (k === 1 ? ' rolled' : ' rolled') + ' away.', 'rolled away'], ['There were ' + w(n, t) + '. ' + nm + ' gave ' + k + ' to a friend.', 'were given away']];
    if (t.obj === 'cookie') stories = [['There were ' + w(n, t) + '. ' + nm + ' ate ' + k + '.', 'were eaten']];
    if (t.obj === 'duck' || t.obj === 'ladybug') stories = [['There were ' + w(n, t) + '. ' + k + ' went away.', 'went away']];
    if (t.obj === 'fish') stories = [['There were ' + w(n, t) + ' in the pond. ' + k + ' swam away.', 'swam away']];
    var st = R.pick(stories);
    var shown = ctx.level < 3;
    return { q: st[0] + ' How many ' + t.many + ' are left?' + (shown ? ' (The ones that are gone are crossed out.)' : ''), viz: pic(shown ? { n: n, obj: t.obj, cross: k, layout: n > 6 ? 'grid' : 'row' } : { n: n, obj: t.obj, layout: n > 6 ? 'grid' : 'row' }), a: num(r),
      steps: [shown ? 'The ' + k + ' crossed-out ' + (k === 1 ? t.one : t.many) + ' are gone.' : 'Cover or cross out ' + k + ' of them.', 'Count only the ones that are left: ' + countList(1, r) + '.', '$' + n + ' - ' + k + ' = ' + r + '$'],
      hint: 'Do not count the ones that are gone. Count what is left.' };
  });

  G('k.number-sentences', function (R, ctx) {
    var t = pickThing(R), kind = ML.byLevel(ctx, R.pick(['match', 'match', 'fill']), R.pick(['fill', 'match', 'left']), R.pick(['true', 'left', 'match']));
    var add = R.coin(), a, b, c;
    if (add) { a = R.int(1, 6); b = R.int(1, 9 - a); c = a + b; } else { a = R.int(3, 9); b = R.int(1, a - 1); c = a - b; }
    var view = add ? pic({ groups: [{ n: a, obj: t.obj }, { n: b, obj: t.obj }], op: '+' }) : pic({ n: a, obj: t.obj, cross: b, layout: a > 6 ? 'grid' : 'row' });
    var said = add ? a + ' ' + (a === 1 ? t.one : t.many) + ' and ' + b + ' more make ' + c + '.' : a + ' ' + t.many + ', take away ' + b + ', leaves ' + c + '.';
    if (kind === 'match') {
      var right = add ? '$' + a + ' + ' + b + ' = ' + c + '$' : '$' + a + ' - ' + b + ' = ' + c + '$';
      var wrongs = add ? ['$' + a + ' + ' + b + ' = ' + (c + 1) + '$', (a > b ? '$' + a + ' - ' + b + ' = ' + (a - b) + '$' : '$' + b + ' - ' + a + ' = ' + (b - a) + '$'), '$' + c + ' + ' + b + ' = ' + (c + b) + '$']
        : ['$' + a + ' + ' + b + ' = ' + (a + b) + '$', '$' + a + ' - ' + b + ' = ' + (c + 1) + '$'];
      return { q: 'Which number sentence matches the picture?', viz: view, a: mc(right, wrongs.slice(0, 2)),
        steps: [said, (add ? '+ means put together.' : '− means take away.') + ' = means "is the same amount as."', 'So the picture shows ' + right + '.'], hint: add ? 'Are the groups being put together or taken away?' : 'Some are crossed out. Is that put together or take away?' };
    }
    if (kind === 'fill') return { q: 'Look at the picture. Finish the number sentence:<br>' + big(a + (add ? ' + ' : ' - ') + b + ' = ' + sq()), viz: view, a: num(c),
      steps: [said, '$' + a + (add ? ' + ' : ' - ') + b + ' = ' + c + '$'], hint: add ? 'Count all of them.' : 'Count the ones that are not crossed out.' };
    if (kind === 'left') return { q: 'What number goes in the box?<br>' + big(sq() + ' = ' + a + (add ? ' + ' : ' - ') + b), viz: view, a: num(c),
      steps: ['= means both sides are the same amount.', a + (add ? ' + ' : ' − ') + b + ' is ' + c + '.', 'So $' + c + ' = ' + a + (add ? ' + ' : ' - ') + b + '$. The answer can come first!'], hint: 'Find ' + a + (add ? ' + ' : ' − ') + b + '. Put that number in the box.' };
    var x = R.int(1, 5), y = R.int(1, 4), s = x + y;
    return { q: 'Which number sentence is true?', a: mc('$' + s + ' = ' + x + ' + ' + y + '$', ['$' + (s + 1) + ' = ' + x + ' + ' + y + '$', '$' + s + ' = ' + x + ' + ' + (y + 1) + '$']),
      steps: ['= means "is the same amount as."', x + ' + ' + y + ' is ' + s + '.', 'So $' + s + ' = ' + x + ' + ' + y + '$ is true. Both sides are ' + s + '.'], hint: 'Work out the side with the + first.' };
  });

  G('k.story-problems-10', function (R, ctx) {
    var t = pickThing(R), nm = R.pick(NAMES), max = ML.byLevel(ctx, 5, 10, 10), kind = R.pick(ctx.level === 3 ? ['add', 'take', 'together', 'apart'] : ['add', 'take', 'together']);
    var a, b, ans, q, eq, view, steps;
    if (kind === 'add') { a = R.int(1, max - 1); b = R.int(1, max - a); ans = a + b; q = nm + ' has ' + w(a, t) + '. ' + nm + ' gets ' + b + ' more. How many ' + t.many + ' does ' + nm + ' have now?'; eq = a + ' + ' + b + ' = ' + ans; view = pic({ groups: [{ n: a, obj: t.obj }, { n: b, obj: t.obj, ring: b }], op: '+' }); steps = ['Start with ' + a + '. Add ' + b + ' more.', 'Count on from ' + a + ': ' + list(seq(a + 1, ans)) + '.']; }
    else if (kind === 'take') { a = R.int(2, max); b = R.int(1, a - 1); ans = a - b; q = nm + ' has ' + w(a, t) + '. ' + nm + ' gives ' + b + ' to a friend. How many ' + t.many + ' does ' + nm + ' have left?'; eq = a + ' - ' + b + ' = ' + ans; view = pic({ n: a, obj: t.obj, cross: b, layout: a > 6 ? 'grid' : 'row' }); steps = ['Start with ' + a + '. Take ' + b + ' away.', 'Count what is left: ' + countList(1, ans) + '.']; }
    else if (kind === 'together') { var c2 = colorPair(R, t = pickColored(R)); a = R.int(1, max - 1); b = R.int(1, max - a); ans = a + b; q = 'There are ' + a + ' ' + c2[0] + ' ' + (a === 1 ? t.one : t.many) + ' and ' + b + ' ' + c2[1] + ' ' + (b === 1 ? t.one : t.many) + '. How many ' + t.many + ' are there?'; eq = a + ' + ' + b + ' = ' + ans; view = pic({ groups: [{ n: a, obj: t.obj, color: c2[0] }, { n: b, obj: t.obj, color: c2[1] }], op: 'and' }); steps = ['Put the ' + c2[0] + ' ones and the ' + c2[1] + ' ones together.', 'Count them all: ' + countList(1, ans) + '.']; }
    else { var c3 = colorPair(R, t = pickColored(R)); ans = R.int(1, 6); a = R.int(ans + 1, 10); b = a - ans; q = 'There are ' + w(a, t) + '. ' + b + ' ' + isAre(b) + ' ' + c3[0] + '. The rest are ' + c3[1] + '. How many are ' + c3[1] + '?'; eq = a + ' - ' + b + ' = ' + ans; view = pic({ groups: [{ n: b, obj: t.obj, color: c3[0] }, { n: ans, obj: t.obj, color: c3[1] }] }); steps = ['All together there are ' + a + '.', 'Take away the ' + b + ' ' + c3[0] + ' ones.', 'The rest: ' + ans + '.']; }
    var showPic = ctx.level === 1 || (ctx.level === 2 && R.coin()) || kind === 'apart';
    return { q: q, viz: showPic && kind !== 'apart' ? view : undefined, a: num(ans), steps: steps.concat(['$' + eq + '$']), hint: 'Act it out with your fingers or draw circles for the ' + t.many + '.' };
  });

  G('k.number-partners', function (R, ctx) {
    var n = ML.byLevel(ctx, R.int(3, 7), R.int(4, 9), R.int(5, 10)), a = R.int(1, n - 1), b = n - a, kind = ML.byLevel(ctx, 'bond', R.pick(['bond', 'eq', 'another']), R.pick(['another', 'not', 'eq']));
    if (kind === 'bond') return { q: n + ' is ' + a + ' and what number?', viz: pic({ kind: 'bond', whole: n, a: a, hide: 'b' }), a: num(b),
      steps: ['Start at ' + a + ' and count up to ' + n + ': ' + list(seq(a + 1, n)) + '.', 'That is ' + b + ' more.', n + ' is ' + a + ' and ' + b + '.'], hint: 'Hold up ' + n + ' fingers. Put down ' + a + '. How many are still up?' };
    if (kind === 'eq') return { q: 'What number goes in the box?<br>' + big(n + ' = ' + a + ' + ' + sq()), a: num(b),
      steps: [n + ' can be broken into ' + a + ' and ' + b + '.', '$' + n + ' = ' + a + ' + ' + b + '$'], hint: 'How many more than ' + a + ' make ' + n + '?' };
    var pairs = []; for (var i = 1; i < n; i++) pairs.push([i, n - i]);
    if (kind === 'another') {
      var other = R.pick(pairs.filter(function (p) { return p[0] !== a && p[0] !== b; }).concat(pairs.length <= 2 ? [[b, a]] : []));
      var wr1 = [a, b + 1], wr2 = [M.max(1, a - 1), b - 1 > 0 ? b - 1 : b + 2];
      if (wr2[0] + wr2[1] === n) wr2 = [wr2[0], wr2[1] + 1];
      return { q: R.pick(NAMES) + ' broke ' + n + ' into ' + a + ' and ' + b + '. Which is <b>another</b> way to break apart ' + n + '?', a: mc(other[0] + ' and ' + other[1], [wr1[0] + ' and ' + wr1[1], wr2[0] + ' and ' + wr2[1]]),
        steps: ['A number can be broken apart in more than one way.', other[0] + ' and ' + other[1] + ' make ' + n + ': $' + other[0] + ' + ' + other[1] + ' = ' + n + '$.', 'The other two choices do not make ' + n + '.'], hint: 'Check each choice: do the two numbers make ' + n + '?' };
    }
    var good = R.sample(pairs, M.min(2, pairs.length)), bad = [a, b + 1];
    if (bad[0] + bad[1] === n) bad = [a + 1, b + 1];
    return { q: 'Which is <b>not</b> a way to make ' + n + '?', a: mc(bad[0] + ' and ' + bad[1], good.map(function (p) { return p[0] + ' and ' + p[1]; })),
      steps: good.map(function (p) { return p[0] + ' and ' + p[1] + ' make ' + n + '.'; }).concat([bad[0] + ' and ' + bad[1] + ' make ' + (bad[0] + bad[1]) + ', not ' + n + '.']), hint: 'Add each pair. Which one does not make ' + n + '?' };
  });

  G('k.make-ten', function (R, ctx) {
    var a = R.int(1, 9), b = 10 - a, kind = ML.byLevel(ctx, 'frame', R.pick(['bond', 'frame']), R.pick(['eq', 'eqL', 'bond']));
    var nmT = R.pick(NAMES);
    if (kind === 'frame') return { q: nmT + ' put ' + a + ' ' + (a === 1 ? 'counter' : 'counters') + ' in a ten frame. How many more will fill it?', viz: pic({ layout: 'frame', n: a, frames: 1, tap: false }), a: num(b),
      steps: ['There ' + isAre(a) + ' ' + a + ' ' + (a === 1 ? 'counter' : 'counters') + '.', 'Count the empty squares: ' + countList(1, b) + '.', a + ' and ' + b + ' make 10.'], hint: 'Count the empty squares.' };
    if (kind === 'bond') return { q: nmT + ' has ' + a + '. ' + a + ' and what number make 10?', viz: pic({ kind: 'bond', whole: 10, a: a, hide: 'b' }), a: num(b),
      steps: ['Start at ' + a + ' and count up to 10: ' + list(seq(a + 1, 10)) + '.', 'That is ' + b + ' more.', a + ' and ' + b + ' make 10.'], hint: 'Hold up 10 fingers. Put down ' + a + '.' };
    if (kind === 'eq') return { q: 'Help ' + nmT + ' make 10. What number goes in the box?<br>' + big(a + ' + ' + sq() + ' = 10'), a: num(b),
      steps: ['Count up from ' + a + ' to 10: ' + list(seq(a + 1, 10)) + '.', 'That is ' + b + '.', '$' + a + ' + ' + b + ' = 10$'], hint: 'Picture a ten frame with ' + a + ' counters. How many squares are empty?' };
    return { q: nmT + ' wrote this. What number goes in the box?<br>' + big('10 = ' + sq() + ' + ' + a), a: num(b),
      steps: [a + ' needs ' + b + ' more to make 10.', '$10 = ' + b + ' + ' + a + '$'], hint: 'What goes with ' + a + ' to make 10?' };
  });

  G('k.facts-within-5', function (R, ctx) {
    var add = R.coin(), a, b, c, kind = ML.byLevel(ctx, R.pick(['pic', 'story']), R.pick(['plain', 'story']), R.pick(['plain', 'missing', 'missing', 'story']));
    if (add) { a = R.int(kind === 'missing' ? 1 : 0, 4); b = R.int(1, 5 - a); if (a === 0 && kind !== 'plain') a = 1; if (a + b > 5) b = 5 - a; c = a + b; }
    else { a = R.int(2, 5); b = R.int(1, a); c = a - b; }
    if (kind === 'missing') {
      if (add) return { q: 'What number goes in the box?<br>' + big(a + ' + ' + sq() + ' = ' + c), a: num(b), steps: [a + ' and ' + b + ' make ' + c + '.', '$' + a + ' + ' + b + ' = ' + c + '$'], hint: 'Count up from ' + a + ' to ' + c + '.' };
      return { q: 'What number goes in the box?<br>' + big(a + ' - ' + sq() + ' = ' + c), a: num(b), steps: ['Take away ' + b + ' from ' + a + ' and ' + c + ' are left.', '$' + a + ' - ' + b + ' = ' + c + '$'], hint: 'How many must go away to leave ' + c + '?' };
    }
    if (kind === 'story') {
      var t = pickThing(R), nm = R.pick(NAMES);
      if (add) { if (a === 0) a = 1; if (a + b > 5) b = 5 - a; c = a + b; }
      var qq = add ? nm + ' has ' + w(a, t) + ' and gets ' + b + ' more. How many ' + t.many + ' now?' : nm + ' has ' + w(a, t) + '. ' + b + (b === 1 ? ' goes' : ' go') + ' away. How many ' + t.many + ' are left?';
      return { q: qq, viz: ctx.level === 1 ? (add ? pic({ groups: [{ n: a, obj: t.obj }, { n: b, obj: t.obj }], op: '+' }) : pic({ n: a, obj: t.obj, cross: b })) : undefined, a: num(c),
        steps: [add ? 'Put ' + a + ' and ' + b + ' together.' : 'Take ' + b + ' away from ' + a + '.', '$' + a + (add ? ' + ' : ' - ') + b + ' = ' + c + '$'], hint: 'Show it with your fingers.' };
    }
    var view = kind === 'pic' ? (add ? pic({ groups: [{ n: a, obj: 'dot', color: 'red' }, { n: b, obj: 'dot', color: 'yellow' }], op: '+' }) : pic({ n: a, obj: 'dot', cross: b })) : undefined;
    return { q: '$' + a + (add ? ' + ' : ' - ') + b + ' = ' + sq() + '$', viz: view, a: num(c),
      steps: add ? [a + ' and ' + b + ' more.', 'Count on from ' + a + (b ? ': ' + list(seq(a + 1, c)) : '') + '.', '$' + a + ' + ' + b + ' = ' + c + '$'] : ['Start with ' + a + '. Take away ' + b + '.', c === 0 ? 'None are left. That is 0.' : c + ' ' + isAre(c) + ' left.', '$' + a + ' - ' + b + ' = ' + c + '$'],
      hint: 'Use your fingers: show ' + a + ', then ' + (add ? 'put up ' : 'put down ') + b + '.' };
  });

  G('k.teens-ten-and-more', function (R, ctx) {
    var k = R.int(1, 9), n = 10 + k, kind = ML.byLevel(ctx, 'frame', R.pick(['add', 'split']), R.pick(['which', 'split', 'add']));
    var nmK = R.pick(NAMES);
    if (kind === 'frame') return { q: nmK + ' has 10 counters and ' + k + ' more. What number is that?', viz: pic({ layout: 'frame', n: 10, m: k, split: true, tap: false }), a: num(n),
      steps: ['One full ten frame is 10.', 'The other frame has ' + k + ' more.', '10 and ' + k + ' more is ' + n + '.'], hint: 'Start at 10 and count on ' + k + '.' };
    if (kind === 'add') return { q: nmK + ' has a full ten frame and ' + k + ' more. Finish the number sentence:<br>' + big('10 + ' + k + ' = ' + sq()), a: num(n), steps: ['10 and ' + k + ' more.', 'Count on from 10: ' + list(seq(11, n)) + '.', '$10 + ' + k + ' = ' + n + '$'], hint: 'Think of a full ten frame and ' + k + ' more.' };
    if (kind === 'split') return { q: nmK + ' has ' + n + ' stickers. ' + n + ' is 10 and how many more?', viz: ctx.level === 2 ? pic({ layout: 'frame', n: n, split: false, tap: false }) : undefined, a: num(k),
      steps: [n + ' is one ten and some ones.', 'The 1 in ' + n + ' stands for the 10. The ' + k + ' stands for ' + k + ' more.', n + ' is 10 and ' + k + ' more.'], hint: 'Look at the second digit of ' + n + '.' };
    return { q: 'Which one shows ' + n + '?', a: mc('10 and ' + k + ' more', ['1 and ' + k + ' more', k + ' and 1 more', '10 and ' + (k === 9 ? 8 : k + 1) + ' more']),
      steps: ['The 1 in ' + n + ' means one ten: 10.', 'The ' + k + ' means ' + k + ' more ones.', n + ' is 10 and ' + k + ' more.'], hint: 'The first digit of a teen number stands for a whole ten.' };
  });

  // ================================================================ Kindergarten: Measuring and Sorting
  var MEASURE_Q = [['a backpack', 'How heavy is it?'], ['a watermelon', 'How heavy is it?'], ['a bag of rocks', 'How heavy is it?'], ['a ribbon', 'How long is it?'], ['a snake', 'How long is it?'], ['a jump rope', 'How long is it?'], ['a giraffe', 'How tall is it?'], ['a tower of blocks', 'How tall is it?'], ['a sunflower', 'How tall is it?']];
  G('k.describe-attributes', function (R, ctx) {
    var kind = ML.byLevel(ctx, 'pic', R.pick(['pic', 'ask']), R.pick(['ask', 'measure']));
    if (kind === 'pic') {
      var which = R.pick(['len', 'tall', 'heavy']), view;
      if (which === 'len') { var o1 = R.pick(['pencil', 'ribbon', 'crayon', 'worm']), l1 = R.int(3, 5), l2 = R.int(7, 9); view = pic({ kind: 'lengths', items: R.shuffle([{ len: l1, obj: o1, color: 'red' }, { len: l2, obj: o1, color: 'blue' }]), line: true }); }
      else if (which === 'tall') { var ob = R.pick(['tower', 'tree', 'flower']); view = pic({ kind: 'heights', items: R.shuffle([{ h: R.int(2, 3), obj: ob }, { h: R.int(5, 7), obj: ob }]) }); }
      else view = pic({ kind: 'balance', left: ['feather'], right: [R.pick(['rock', 'watermelon', 'pumpkin', 'brick'])], tilt: 'right' });
      var ch = ['long and short', 'tall and short', 'heavy and light'], idx = which === 'len' ? 0 : which === 'tall' ? 1 : 2;
      return { q: R.pick(NAMES) + ' made this picture. Which words tell about it?', viz: view, a: mcKeep(ch, idx),
        steps: [which === 'len' ? 'The things lie down side by side. One is long, one is short.' : which === 'tall' ? 'The things stand up. One is tall, one is short.' : 'The balance shows weight. The heavy side goes down; the light side goes up.', 'So the words are "' + ch[idx] + '."'], hint: 'Are the things lying down, standing up, or on a balance?' };
    }
    if (kind === 'ask') {
      var m = R.pick(MEASURE_Q);
      return { q: R.pick(NAMES) + ' wants to measure ' + m[0] + '. Which question fits best?', a: mc(m[1], ['How heavy is it?', 'How long is it?', 'How tall is it?'].filter(function (x) { return x !== m[1]; })),
        steps: [/heavy/.test(m[1]) ? cap(m[0].replace(/^a /, '')) + ' can be heavy or light. We lift it to feel its weight.' : /long/.test(m[1]) ? cap(m[0].replace(/^a /, '')) + ' lies along the ground. We ask how long it is.' : cap(m[0].replace(/^a /, '')) + ' stands up high. We ask how tall it is.', 'The best question: "' + m[1] + '"'], hint: 'Would you lift it, lay it down, or stand it up to measure it?' };
    }
    var it = R.pick(['a pencil', 'a book', 'a shoe', 'a cup', 'a spoon', 'a toy car', 'a crayon', 'a sock']);
    return { q: 'Which of these can you <b>measure</b> about ' + it + '?', a: mc('how long it is', ['what color it is', 'what its name is']),
      steps: ['We measure things like length, height and weight.', 'Color and name are not measured.', 'So "how long it is" can be measured.'], hint: 'Measuring answers "how long", "how tall" or "how heavy".' };
  });

  G('k.compare-directly', function (R, ctx) {
    var kind = ML.byLevel(ctx, 'len', R.pick(['tall', 'heavy', 'len']), R.pick(['ends', 'ends', 'heavy']));
    if (kind === 'len') {
      var ob = R.pick(['pencil', 'crayon', 'ribbon', 'worm', 'straw']), a = R.int(3, 9), b = R.intNot(2, 9, [a, a - 1, a + 1]), askLong = R.coin();
      var ans = (a > b) === askLong ? 0 : 1;
      return { q: 'Which ' + ob + ' is <b>' + (askLong ? 'longer' : 'shorter') + '</b>, A or B?', viz: pic({ kind: 'lengths', items: [{ len: a, obj: ob, name: 'A', color: 'red' }, { len: b, obj: ob, name: 'B', color: 'blue' }], line: true }), a: mcKeep(['A', 'B'], ans),
        steps: ['The ends are lined up at the left.', 'Look at the other ends. ' + (a > b ? 'A' : 'B') + ' sticks out farther.', (askLong ? (a > b ? 'A' : 'B') + ' is longer.' : (a > b ? 'B' : 'A') + ' is shorter.')], hint: 'The ends are lined up. Which one goes farther?' };
    }
    if (kind === 'tall') {
      var o2 = R.pick(['tower', 'tree', 'flower']), h1 = R.int(2, 7), h2 = R.intNot(2, 7, [h1]), askTall = R.coin(), ans2 = (h1 > h2) === askTall ? 0 : 1;
      return { q: 'Which ' + o2 + ' is <b>' + (askTall ? 'taller' : 'shorter') + '</b>, A or B?', viz: pic({ kind: 'heights', items: [{ h: h1, obj: o2, name: 'A' }, { h: h2, obj: o2, name: 'B' }] }), a: mcKeep(['A', 'B'], ans2),
        steps: ['Both stand on the same ground line.', 'Look at the tops. ' + (h1 > h2 ? 'A' : 'B') + ' goes higher.', askTall ? (h1 > h2 ? 'A' : 'B') + ' is taller.' : (h1 > h2 ? 'B' : 'A') + ' is shorter.'], hint: 'They start at the same ground. Which top is higher?' };
    }
    if (kind === 'heavy') {
      var light = R.pick(['feather', 'leaf', 'balloon']), heavy = R.pick(['rock', 'watermelon', 'pumpkin', 'brick', 'book']), lightLeft = R.coin(), askHeavy = R.coin();
      var nm = { feather: 'the feather', leaf: 'the leaf', balloon: 'the balloon', rock: 'the rock', watermelon: 'the watermelon', pumpkin: 'the pumpkin', brick: 'the brick', book: 'the book' };
      var leftT = lightLeft ? light : heavy, rightT = lightLeft ? heavy : light;
      var correct = askHeavy ? heavy : light;
      return { q: R.pick(NAMES) + ' put two things on a balance. Which is <b>' + (askHeavy ? 'heavier' : 'lighter') + '</b>?', viz: pic({ kind: 'balance', left: [leftT], right: [rightT], tilt: lightLeft ? 'right' : 'left' }),
        a: mcKeep([cap(nm[leftT]), cap(nm[rightT])], correct === leftT ? 0 : 1), steps: ['On a balance, the heavier side goes down.', 'The side with ' + nm[heavy] + ' is down.', askHeavy ? cap(nm[heavy]) + ' is heavier.' : cap(nm[light]) + ' is lighter.'], hint: 'Which side of the balance went down?' };
    }
    var la = R.int(4, 6), lb = la + 1, st = R.int(2, 3), ob2 = R.pick(['crayon', 'pencil', 'straw']), aFirst = R.coin();
    // A starts late and looks longer, but B is longer
    var items = [{ len: la, obj: ob2, at: st, color: 'red' }, { len: lb, obj: ob2, at: 0, color: 'green' }];
    if (!aFirst) items.reverse();
    items[0].name = 'A'; items[1].name = 'B';
    var longIdx = items[0].len > items[1].len ? 0 : 1;
    return { q: R.pick(NAMES) + ' did not line up the ends. Which ' + ob2 + ' is longer? Count the spaces between the dashed lines.', viz: pic({ kind: 'lengths', items: items, grid: true }), a: mcKeep(['A', 'B', 'They are the same'], longIdx),
      steps: ['The ' + ob2 + 's start in different places, so the one that sticks out is not always longer.', 'Count the spaces each one covers: A covers ' + items[0].len + ', B covers ' + items[1].len + '.', LET[longIdx] + ' is longer.'], hint: 'Line them up in your head, or count the spaces each one covers.' };
  });

  G('k.sort-and-count', function (R, ctx) {
    var k = ctx.level === 1 ? 2 : 3, kinds = R.sample(['apple', 'star', 'ball', 'heart', 'fish', 'duck', 'car', 'flower'], k).map(thingOf);
    var counts = R.sample(seq(2, ctx.level === 1 ? 6 : 7), k);
    var view = pic({ mix: kinds.map(function (t, i) { return { obj: t.obj, n: counts[i] }; }), layout: 'scatter', seed: R.int(1, 999) });
    var sortStep = 'Sort them: ' + kinds.map(function (t, i) { return w(counts[i], t); }).join(', ') + '.';
    if (ctx.level === 1 || (ctx.level === 3 && R.coin())) {
      var i0 = R.int(0, k - 1);
      return { q: 'Sort the things into groups. How many <b>' + kinds[i0].many + '</b> are there?', viz: view, a: num(counts[i0]), steps: [sortStep, 'There are ' + w(counts[i0], kinds[i0]) + '.'], hint: 'Count only the ' + kinds[i0].many + '. Tap each one as you count.' };
    }
    var most = ctx.level === 2 ? true : R.coin(), best = 0;
    counts.forEach(function (c, i) { if (most ? c > counts[best] : c < counts[best]) best = i; });
    return { q: 'Sort them. Which kind has the <b>' + (most ? 'most' : 'fewest') + '</b>?', viz: view, a: mc(cap(kinds[best].many), kinds.filter(function (x, i) { return i !== best; }).map(function (x) { return cap(x.many); })),
      steps: [sortStep, (most ? 'The biggest number is ' : 'The smallest number is ') + counts[best] + '.', 'So the ' + kinds[best].many + ' have the ' + (most ? 'most' : 'fewest') + '.'], hint: 'Count each kind. Then compare the numbers.' };
  });

  // ================================================================ Kindergarten: Shapes
  var POS = {
    table: { above: 'above the table', on: 'on the table', under: 'under the table', left: 'next to the table', right: 'next to the table' },
    box: { in: 'in the box', front: 'in front of the box', behind: 'behind the box', left: 'next to the box', right: 'next to the box', on: 'on top of the box', above: 'above the box' }
  };
  G('k.position-words', function (R, ctx) {
    var ref, pos, pool;
    if (ctx.level === 1) { ref = 'table'; pos = R.pick(['above', 'on', 'under', 'left', 'right']); }
    else if (ctx.level === 2) { ref = R.pick(['table', 'box']); pos = ref === 'table' ? R.pick(['above', 'under', 'on']) : R.pick(['in', 'left', 'right', 'on']); }
    else { ref = 'box'; pos = R.pick(['front', 'behind', 'in', 'front', 'behind']); }
    var thing = pos === 'front' || pos === 'behind' || R.coin() ? 'bear' : 'ball', T = thing === 'bear' ? 'teddy bear' : 'ball';
    var right = POS[ref][pos];
    pool = []; Object.keys(POS[ref]).forEach(function (p) { var s = POS[ref][p]; if (s !== right && pool.indexOf(s) < 0) pool.push(s); });
    if (pos === 'front' || pos === 'behind') pool.sort(function (x) { return /front|behind/.test(x) ? -1 : 1; });
    var wr = (pos === 'front' || pos === 'behind') ? [pool[0]].concat(R.sample(pool.slice(1), 1)) : R.sample(pool, 2);
    var say = { above: 'It is higher than the table and not touching it.', on: 'It sits on top, touching it.', under: 'It is below the table top, between the legs.', left: 'It is beside it, on the floor.', right: 'It is beside it, on the floor.', in: 'It is inside the box.', front: 'It is closer to us than the box, so we see all of it.', behind: 'The box hides part of it. It is on the far side of the box.' };
    return { q: 'Where is the ' + T + '?', viz: pic({ kind: 'scene', thing: thing, ref: ref, pos: pos }), a: mc('The ' + T + ' is ' + right + '.', wr.map(function (x) { return 'The ' + T + ' is ' + x + '.'; })),
      steps: [say[pos], 'The ' + T + ' is ' + right + '.'], hint: pos === 'front' || pos === 'behind' ? 'Can you see all of the ' + T + ', or is the box hiding part of it?' : 'Is it touching the ' + ref + '? Is it higher, lower or beside it?' };
  });

  var SHAPE_NAME = { circle: 'circle', square: 'square', triangle: 'triangle', 'triangle-right': 'triangle', 'triangle-skinny': 'triangle', 'triangle-wide': 'triangle', 'triangle-obtuse': 'triangle', rectangle: 'rectangle', 'rectangle-tall': 'rectangle', hexagon: 'hexagon' };
  var SHAPE_FACT = { circle: 'A circle is round. It has no straight sides and no corners.', square: 'A square has 4 straight sides that are all the same length, and 4 square corners.', triangle: 'A triangle has 3 straight sides and 3 corners.', rectangle: 'A rectangle has 4 straight sides and 4 square corners.', hexagon: 'A hexagon has 6 straight sides and 6 corners.' };
  G('k.name-shapes', function (R, ctx) {
    var colors = ['green', 'blue', 'red', 'orange', 'purple', 'yellow', 'pink'];
    if (ctx.level <= 2) {
      var s = ctx.level === 1 ? R.pick(['circle', 'square', 'triangle', 'rectangle', 'hexagon']) : R.pick(['square', 'triangle-right', 'triangle-skinny', 'triangle-wide', 'triangle-obtuse', 'rectangle-tall', 'hexagon', 'triangle']);
      var nmS = SHAPE_NAME[s], rot = ctx.level === 1 ? 0 : (s === 'square' ? R.pick([45, 20, 30]) : R.pick([30, 60, 90, 120, 180, 200, 250]));
      var others = ['circle', 'square', 'triangle', 'rectangle', 'hexagon'].filter(function (x) { return x !== nmS; });
      return { q: 'What is the name of this shape?', viz: pic({ kind: 'shapes', items: [{ s: s, rot: rot, color: R.pick(colors), scale: R.pick([0.85, 1, 1.1]) }] }),
        a: mc(cap(nmS), R.sample(others, 3).map(cap)), steps: [SHAPE_FACT[nmS], rot ? 'It is turned, but turning a shape does not change its name.' : 'Count its sides and corners to check.', 'It is a ' + nmS + '.'], hint: 'Count the straight sides.' };
    }
    var target = R.pick(['triangle', 'triangle', 'square', 'circle']), items = [], good;
    if (target === 'triangle') { good = { s: R.pick(['triangle-right', 'triangle-skinny', 'triangle-obtuse', 'triangle-wide']), rot: R.pick([0, 90, 160, 210]) }; items = [{ s: 'open-triangle' }, { s: 'curvy-triangle' }, { s: R.pick(['square', 'rhombus', 'trapezoid']) }]; }
    else if (target === 'square') { good = { s: 'square', rot: R.pick([0, 45, 15]) }; items = [{ s: 'rectangle' }, { s: 'open-square' }, { s: 'rhombus' }]; }
    else { good = { s: 'circle' }; items = [{ s: 'oval' }, { s: 'hexagon' }, { s: 'octagon' }]; }
    items = R.sample(items, 2).concat([good]);
    items = R.shuffle(items).map(function (it, i) { it.name = LET[i]; it.color = R.pick(colors); return it; });
    var idx = items.indexOf(good);
    var why = target === 'triangle' ? 'A triangle is closed and has 3 straight sides.' : target === 'square' ? 'A square has 4 equal straight sides and 4 square corners, even when it is turned.' : 'A circle is perfectly round, the same all the way around.';
    return { q: 'Which one is a <b>' + target + '</b>?', viz: pic({ kind: 'shapes', items: items }), a: mcKeep(LET.slice(0, items.length), idx),
      steps: [why, items.filter(function (x) { return x !== good; }).map(function (x) { return x.name + ' is not: ' + ({ 'open-triangle': 'it has a gap, so it is not closed', 'curvy-triangle': 'one side is curved', square: 'it has 4 sides', rhombus: target === 'square' ? 'its corners are not square corners' : 'it has 4 sides', trapezoid: 'it has 4 sides', rectangle: 'its sides are not all the same length', 'open-square': 'it has a gap', oval: 'it is stretched, not perfectly round', hexagon: 'it has straight sides', octagon: 'it has straight sides' })[x.s] + '.'; }).join(' '), 'The ' + target + ' is ' + LET[idx] + '.'],
      hint: target === 'triangle' ? 'Look for 3 straight sides that close up with no gap.' : target === 'square' ? 'Look for 4 sides that are all the same length.' : 'Look for the one that is perfectly round.' };
  });

  var SOLIDS = ['cube', 'cone', 'cylinder', 'sphere'];
  var SOLID_FACT = { cube: 'A cube is a solid with 6 square faces, like a block.', cone: 'A cone has a round, flat bottom and comes to a point, like an ice cream cone.', cylinder: 'A cylinder has two flat circles at the ends and a curved side, like a can.', sphere: 'A sphere is round all over, like a ball.' };
  G('k.flat-and-solid', function (R, ctx) {
    var colors = ['blue', 'orange', 'purple', 'red', 'green', 'yellow'];
    if (ctx.level === 1) {
      var flat = R.coin(), s = flat ? R.pick(['square', 'circle', 'triangle', 'rectangle', 'hexagon']) : R.pick(SOLIDS.concat(['box']));
      return { q: 'Is this shape <b>flat</b> or <b>solid</b>?', viz: pic({ kind: 'shapes', items: [{ s: s, color: R.pick(colors) }] }), a: mcKeep(['Flat', 'Solid'], flat ? 0 : 1),
        steps: [flat ? 'It lies flat, like a drawing on paper. You cannot hold it like a block.' : 'It looks like something you can hold and turn: it has depth.', 'It is ' + (flat ? 'flat.' : 'solid.')], hint: 'Could you pick it up like a block or a ball?' };
    }
    if (ctx.level === 2) {
      var so = R.pick(SOLIDS);
      return { q: 'What is the name of this solid shape?', viz: pic({ kind: 'shapes', items: [{ s: so, color: R.pick(colors) }] }), a: mc(cap(so), SOLIDS.filter(function (x) { return x !== so; }).map(cap)),
        steps: [SOLID_FACT[so], 'It is a ' + so + '.'], hint: 'Is it round all over, pointy, or like a can or a block?' };
    }
    if (R.coin()) {
      var REAL = [['a ball', 'sphere'], ['an orange', 'sphere'], ['a can of soup', 'cylinder'], ['a drum', 'cylinder'], ['a number cube (a die)', 'cube'], ['a toy block', 'cube'], ['an ice cream cone', 'cone'], ['a party hat', 'cone']];
      var rl = R.pick(REAL);
      return { q: cap(rl[0]) + ' is shaped like which solid?', a: mc(cap(rl[1]), SOLIDS.filter(function (x) { return x !== rl[1]; }).map(cap)), steps: [SOLID_FACT[rl[1]], cap(rl[0]) + ' is shaped like a ' + rl[1] + '.'], hint: 'Picture ' + rl[0] + ' in your hand.' };
    }
    var pairs = [['cube', 'square'], ['sphere', 'circle'], ['cylinder', 'circle']], pr = R.pick(pairs), third = R.pick(SOLIDS.filter(function (x) { return x !== pr[0]; }));
    var items = R.shuffle([{ s: pr[0] }, { s: pr[1] }, { s: third }]).map(function (it, i) { it.name = LET[i]; it.color = R.pick(colors); return it; });
    var idx = items.map(function (x) { return x.s; }).indexOf(pr[0]);
    return { q: 'Which one is a <b>' + pr[0] + '</b>?', viz: pic({ kind: 'shapes', items: items }), a: mcKeep(['A', 'B', 'C'], idx),
      steps: [SOLID_FACT[pr[0]], 'A flat ' + pr[1] + ' is only one face. It is not solid.', 'The ' + pr[0] + ' is ' + LET[idx] + '.'], hint: 'Look for the one that is solid, not flat.' };
  });

  var SIDES = { triangle: 3, 'triangle-right': 3, 'triangle-skinny': 3, square: 4, rectangle: 4, 'rectangle-tall': 4, rhombus: 4, trapezoid: 4, pentagon: 5, hexagon: 6, circle: 0 };
  function shapeWord(s) { return { triangle: 'triangle', 'triangle-right': 'triangle', 'triangle-skinny': 'triangle', square: 'square', rectangle: 'rectangle', 'rectangle-tall': 'rectangle', rhombus: 'four-sided shape', trapezoid: 'four-sided shape', pentagon: 'pentagon', hexagon: 'hexagon', circle: 'circle' }[s]; }
  G('k.sides-and-corners', function (R, ctx) {
    var colors = ['green', 'blue', 'red', 'orange', 'purple'];
    if (ctx.level <= 2) {
      var s = ctx.level === 1 ? R.pick(['triangle', 'square', 'rectangle', 'hexagon']) : R.pick(['triangle-right', 'triangle-skinny', 'rectangle-tall', 'hexagon', 'pentagon', 'trapezoid', 'rhombus']);
      var askSides = R.coin(), n = SIDES[s];
      var colS = R.pick(colors);
      return { q: 'How many <b>' + (askSides ? 'sides' : 'corners') + '</b> does this ' + colS + ' shape have?', viz: pic({ kind: 'shapes', items: [{ s: s, rot: ctx.level === 1 ? 0 : R.pick([0, 30, 90, 150]), color: colS, corners: !askSides && ctx.level === 1 }] }), a: num(n),
        steps: [askSides ? 'Touch each straight side as you count: ' + countList(1, n) + '.' : 'Touch each corner, where two sides meet: ' + countList(1, n) + '.', 'It has ' + n + ' ' + (askSides ? 'sides' : 'corners') + '. (It has the same number of sides and corners.)'], hint: askSides ? 'Put your finger on one side and go around.' : 'A corner is where two straight sides meet.' };
    }
    var kind = R.pick(['compare', 'riddle', 'circle']);
    if (kind === 'circle') return { q: R.pick(NAMES) + ' drew a circle. How many corners does a circle have?', viz: pic({ kind: 'shapes', items: [{ s: 'circle', color: R.pick(colors) }] }), a: num(0), steps: ['A circle is one curved line.', 'It has no straight sides and no corners: 0.'], hint: 'Is there any place where two straight sides meet?' };
    if (kind === 'riddle') {
      var RID = [['I have 3 sides and 3 corners. What am I?', 'Triangle'], ['I have 4 sides that are all the same length and 4 square corners. What am I?', 'Square'], ['I have 6 sides and 6 corners. What am I?', 'Hexagon'], ['I am round. I have no sides and no corners. What am I?', 'Circle']];
      var rd = R.pick(RID);
      return { q: rd[0], a: mc(rd[1], ['Triangle', 'Square', 'Hexagon', 'Circle', 'Rectangle'].filter(function (x) { return x !== rd[1]; }).slice(0, 3)), steps: ['Think of each shape and count its sides and corners.', 'The answer is the ' + rd[1].toLowerCase() + '.'], hint: 'Draw the shape in the air with your finger.' };
    }
    var pool = ['triangle', 'square', 'rectangle-tall', 'pentagon', 'hexagon'], two = R.sample(pool, 2), na = SIDES[two[0]], nb = SIDES[two[1]];
    var ans = na === nb ? 2 : na > nb ? 0 : 1;
    return { q: R.pick(NAMES) + ' drew two shapes. Which shape has <b>more corners</b>?', viz: pic({ kind: 'shapes', items: [{ s: two[0], name: 'A', color: 'blue' }, { s: two[1], name: 'B', color: 'orange' }] }), a: mcKeep(['A', 'B', 'They have the same'], ans),
      steps: ['A has ' + na + ' corners.', 'B has ' + nb + ' corners.', ans === 2 ? 'They have the same number.' : (ans === 0 ? 'A' : 'B') + ' has more corners.'], hint: 'Count the corners of each shape.' };
  });

  // pieces in unit coordinates for building shapes
  var BUILD = {
    sq2: { name: 'square', parts: [[[-.8, -.8], [.8, -.8], [-.8, .8]], [[.8, -.8], [.8, .8], [-.8, .8]]], n: 2, pieces: 'triangles' },
    rect2sq: { name: 'rectangle', parts: [[[-1.1, -.55], [0, -.55], [0, .55], [-1.1, .55]], [[0, -.55], [1.1, -.55], [1.1, .55], [0, .55]]], n: 2, pieces: 'squares' },
    rect2tri: { name: 'rectangle', parts: [[[-1.1, -.6], [1.1, -.6], [-1.1, .6]], [[1.1, -.6], [1.1, .6], [-1.1, .6]]], n: 2, pieces: 'triangles' },
    tri2: { name: 'triangle', parts: [[[-1, .7], [0, .7], [0, -.9]], [[0, .7], [1, .7], [0, -.9]]], n: 2, pieces: 'triangles' },
    hex6: { name: 'hexagon', parts: (function () { var v = [], out = []; for (var i = 0; i < 6; i++) v.push([.95 * Math.cos(i * Math.PI / 3), .95 * Math.sin(i * Math.PI / 3)]); for (i = 0; i < 6; i++) out.push([[0, 0], v[i], v[(i + 1) % 6]]); return out; })(), n: 6, pieces: 'triangles' },
    sq4: { name: 'square', parts: [[[-.8, -.8], [0, -.8], [0, 0], [-.8, 0]], [[0, -.8], [.8, -.8], [.8, 0], [0, 0]], [[0, 0], [.8, 0], [.8, .8], [0, .8]], [[-.8, 0], [0, 0], [0, .8], [-.8, .8]]], n: 4, pieces: 'squares' },
    sq4tri: { name: 'square', parts: [[[-.8, -.8], [.8, -.8], [0, 0]], [[.8, -.8], [.8, .8], [0, 0]], [[.8, .8], [-.8, .8], [0, 0]], [[-.8, .8], [-.8, -.8], [0, 0]]], n: 4, pieces: 'triangles' },
    rect3: { name: 'rectangle', parts: [[[-1.2, -.4], [-.4, -.4], [-.4, .4], [-1.2, .4]], [[-.4, -.4], [.4, -.4], [.4, .4], [-.4, .4]], [[.4, -.4], [1.2, -.4], [1.2, .4], [.4, .4]]], n: 3, pieces: 'squares' },
    rect6: { name: 'rectangle', parts: (function () { var out = []; for (var r = 0; r < 2; r++) for (var c = 0; c < 3; c++) { var x = -1.05 + c * .7, y = -.7 + r * .7; out.push([[x, y], [x + .7, y], [x + .7, y + .7], [x, y + .7]]); } return out; })(), n: 6, pieces: 'squares' }
  };
  G('k.build-shapes', function (R, ctx) {
    var c1 = R.pick(['blue', 'green', 'orange', 'purple']), c2 = R.pick(['yellow', 'pink', 'tan']);
    if (ctx.level === 1) {
      var b = BUILD[R.pick(['sq2', 'rect2sq', 'rect2tri', 'tri2', 'hex6', 'sq4'])];
      return { q: R.pick(NAMES) + ' put these pieces together. What big shape do they make?', viz: pic({ kind: 'shapes', items: [{ parts: b.parts, color: c1, color2: c2 }] }),
        a: mc(cap(b.name), ['square', 'rectangle', 'triangle', 'hexagon', 'circle'].filter(function (x) { return x !== b.name; }).slice(0, 3).map(cap)),
        steps: [b.n + ' ' + b.pieces + ' are put together.', 'Look at the outside edge only: ' + SHAPE_FACT[b.name].replace(/^A /, 'a ').replace(/\.$/, '') + '.', 'They make a ' + b.name + '.'], hint: 'Trace around the outside with your finger.' };
    }
    var keys = ctx.level === 2 ? ['sq2', 'rect3', 'hex6', 'sq4tri', 'tri2'] : ['hex6', 'rect6', 'sq4', 'sq4tri', 'rect3'];
    var bb = BUILD[R.pick(keys)], one = bb.pieces.replace(/s$/, '');
    return { q: R.pick(NAMES) + ' built this big ' + bb.name + '. How many small ' + bb.pieces + ' did it take?', viz: pic({ kind: 'shapes', items: [{ parts: bb.parts, color: c1, color2: c2 }] }), a: num(bb.n),
      steps: ['Touch each small ' + one + ' as you count: ' + countList(1, bb.n) + '.', bb.n + ' ' + bb.pieces + ' make the ' + bb.name + '.'], hint: 'Count each piece once. The colors take turns.' };
  });

})(window.MathLadder);
