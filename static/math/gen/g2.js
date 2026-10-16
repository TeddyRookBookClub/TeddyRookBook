/* Math Ladder: problem generators for Grade 2 (static/math/gen/g2.js).
   One generator per topic in data/math/topics/g2.json. Problems are spoken to a 7- or 8-year-old: typed whole numbers
   or tappable choices, often with a picture (p.viz). Pictures inside problems use the quiet Grade 2 visuals from
   static/math/viz/g2.js (g2-blocks, g2-coins, g2-ruler, g2-graph, g2-array, g2-shapes, g2-line), because the shared
   interactive visuals print what they show (a total, a time) in their readout; the shared clock (digital: false)
   and tape diagram (custom tapes, no steps) are quiet already and are used directly.
   Every answer is computed from the numbers generated here; /tmp/work_mlp2/test-gen.js checks them independently. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  var BOX = '\\boxed{\\,?\\,}';

  /* ---------------------------------------------------------------- helpers */
  function N(v) { return { t: 'num', v: String(v), form: 'int' }; }
  function mcKeep(choices, i) { return { t: 'mc', choices: choices, v: i, keep: true }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function c(n) { return T.commas(n); }
  function m(s) { return '$' + s + '$'; }
  function pl(n, w, p) { return n + ' ' + (n === 1 ? w : (p || w + 's')); }
  function digits(n) { return { h: Math.floor(n / 100) % 10, t: Math.floor(n / 10) % 10, o: n % 10, th: Math.floor(n / 1000) }; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function range(a, b, s) { var o = []; for (var x = a; s > 0 ? x <= b : x >= b; x += s) o.push(x); return o; }
  function chance(R, p) { return R.next() < p; }

  var KIDS = [['Ava', 'she', 'her'], ['Ben', 'he', 'his'], ['Carlos', 'he', 'his'], ['Dev', 'he', 'his'], ['Ella', 'she', 'her'], ['Fatima', 'she', 'her'],
    ['Grace', 'she', 'her'], ['Hana', 'she', 'her'], ['Isaac', 'he', 'his'], ['Jada', 'she', 'her'], ['Kofi', 'he', 'his'], ['Lena', 'she', 'her'],
    ['Mateo', 'he', 'his'], ['Nora', 'she', 'her'], ['Omar', 'he', 'his'], ['Priya', 'she', 'her'], ['Rosa', 'she', 'her'], ['Sam', 'he', 'his'],
    ['Tia', 'she', 'her'], ['Uma', 'she', 'her'], ['Wes', 'he', 'his'], ['Yuki', 'she', 'her'], ['Leo', 'he', 'his'], ['Maya', 'she', 'her'],
    ['Noah', 'he', 'his'], ['Zoe', 'she', 'her'], ['Amir', 'he', 'his'], ['Ivy', 'she', 'her'], ['Raj', 'he', 'his'], ['Theo', 'he', 'his']];
  function kids(R, k) { return R.sample(KIDS, k).map(function (x) { return { n: x[0], p: x[1], P: cap(x[1]), q: x[2] }; }); }
  var THINGS = [['sticker', 'stickers'], ['marble', 'marbles'], ['shell', 'shells'], ['bead', 'beads'], ['baseball card', 'baseball cards'], ['rock', 'rocks'],
    ['stamp', 'stamps'], ['block', 'blocks'], ['button', 'buttons'], ['acorn', 'acorns'], ['toy car', 'toy cars'], ['seashell', 'seashells'], ['crayon', 'crayons']];

  /* place-value steps for a + b (a, b, a + b within 1,000) */
  function addCols(a, b) {
    var A = digits(a), B = digits(b), s = a + b, out = [], so = A.o + B.o, c1 = so >= 10 ? 1 : 0;
    out.push('Ones: ' + m(A.o + ' + ' + B.o + ' = ' + so) + '.' + (c1 ? ' That is 1 ten and ' + pl(so - 10, 'one') + '. Write ' + (so - 10) + ' in the ones place and trade 10 ones for 1 new ten.' : ''));
    var st = A.t + B.t + c1, c2 = st >= 10 ? 1 : 0, tsum = b < 10 ? A.t + (c1 ? ' + 1' : '') : A.t + ' + ' + B.t + (c1 ? ' + 1' : '');
    if (b < 10 && !c1) out.push('Tens: no new ten, so there are still ' + pl(A.t, 'ten') + '.');
    else out.push('Tens: ' + m(tsum + ' = ' + st) + ' ' + (st === 1 ? 'ten' : 'tens') + (c1 ? ' (with the new ten)' : '') + '.' + (c2 ? ' That is 1 hundred and ' + pl(st - 10, 'ten') + '. Write ' + (st - 10) + ' in the tens place and trade 10 tens for 1 new hundred.' : ''));
    if (A.h || B.h || c2) {
      var sh = A.h + B.h + c2;
      out.push('Hundreds: ' + m((b < 100 ? A.h : A.h + ' + ' + B.h) + (c2 ? ' + 1' : '') + ' = ' + sh) + ' ' + (sh === 1 ? 'hundred' : 'hundreds') + (c2 ? ' (with the new hundred)' : '') + '.' + (sh === 10 ? ' Ten hundreds make one thousand.' : ''));
    }
    out.push('So ' + m(c(a) + ' + ' + c(b) + ' = ' + c(s)) + '.');
    return out;
  }
  /* place-value steps for a − b (0 ≤ b ≤ a ≤ 1,000), breaking a ten or a hundred when a place is short */
  function subCols(a, b) {
    var A = digits(a), B = digits(b), h = A.h + 10 * A.th, t = A.t, o = A.o, out = [];
    if (A.th) out.push(c(a) + ' is 10 hundreds, 0 tens and 0 ones.');
    if (o < B.o) {
      if (t > 0) { t -= 1; o += 10; out.push('Ones: ' + m(A.o + ' - ' + B.o) + ' does not work, because there are not enough ones. Break 1 ten into 10 ones: now you have ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.'); }
      else { h -= 1; t = 9; o += 10; out.push('Ones: there are not enough ones, and there are 0 tens to break. So break 1 hundred into 10 tens, then break 1 of those tens into 10 ones: now you have ' + pl(h, 'hundred') + ', 9 tens and ' + pl(o, 'one') + '.'); }
      out.push('Ones: ' + m(o + ' - ' + B.o + ' = ' + (o - B.o)) + '.');
    } else out.push('Ones: ' + m(o + ' - ' + B.o + ' = ' + (o - B.o)) + '.');
    if (t < B.t) { h -= 1; t += 10; out.push('Tens: ' + pl(t - 10, 'ten') + ' take away ' + pl(B.t, 'ten') + ' does not work. Break 1 hundred into 10 tens: now you have ' + pl(h, 'hundred') + ' and ' + pl(t, 'ten') + '.'); }
    if (b < 10) out.push('Tens: nothing to take away, so ' + pl(t, 'ten') + ' are left.'.replace('1 ten are', '1 ten is'));
    else out.push('Tens: ' + m(t + ' - ' + B.t + ' = ' + (t - B.t)) + ' ' + (t - B.t === 1 ? 'ten' : 'tens') + '.');
    if (h || B.h) out.push('Hundreds: ' + m(h + ' - ' + B.h + ' = ' + (h - B.h)) + ' ' + (h - B.h === 1 ? 'hundred' : 'hundreds') + '.');
    out.push('So ' + m(c(a) + ' - ' + c(b) + ' = ' + c(a - b)) + '. Check by adding: ' + m(c(a - b) + ' + ' + c(b) + ' = ' + c(a)) + '.');
    return out;
  }
  function needsTrade(a, b) { var A = digits(a), B = digits(b); return { o: A.o + B.o >= 10, t: A.t + B.t + (A.o + B.o >= 10 ? 1 : 0) >= 10 }; }
  function needsBreak(a, b) { var A = digits(a), B = digits(b), o = A.o < B.o, t = A.t - (o ? 1 : 0) < B.t; return { o: o, t: t }; }

  /* ================================================================ unit: facts */
  function addSteps(a, b) {
    var s = a + b, big = Math.max(a, b), sm = Math.min(a, b);
    if (a === b) return ['This is a double: ' + m(a + ' + ' + a + ' = ' + s) + '.'];
    if (Math.abs(a - b) === 1) return [m(a + ' + ' + b) + ' is close to a double: ' + m(sm + ' + ' + sm + ' = ' + 2 * sm) + '.', 'One more makes ' + m(s) + '. So ' + m(a + ' + ' + b + ' = ' + s) + '.'];
    if (s > 10) { var need = 10 - big, rest = sm - need; return ['Make a ten. ' + m(big) + ' needs ' + need + ' more to make 10, so split ' + m(sm) + ' into ' + m(need + ' + ' + rest) + '.', m(big + ' + ' + need + ' = 10') + ', and ' + m('10 + ' + rest + ' = ' + s) + '.', 'So ' + m(a + ' + ' + b + ' = ' + s) + '.']; }
    if (s === 10) return [m(a + ' + ' + b) + ' is a make-ten pair: ' + m(a + ' + ' + b + ' = 10') + '.'];
    var seq = []; for (var i = 1; i <= sm; i++) seq.push(big + i);
    return ['Start at the bigger number, ' + big + ', and count on ' + sm + ': ' + seq.join(', ') + '.', 'So ' + m(a + ' + ' + b + ' = ' + s) + '.'];
  }
  function subSteps(s, a) {
    var b = s - a;
    if (s > 10 && a > s - 10) {
      var k = s - 10, more = a - k;
      return ['Go back to 10 first: ' + m(s + ' - ' + k + ' = 10') + '.', 'You still need to take away ' + more + ' more: ' + m('10 - ' + more + ' = ' + b) + '.', 'So ' + m(s + ' - ' + a + ' = ' + b) + '. Check: ' + m(b + ' + ' + a + ' = ' + s) + '.'];
    }
    return ['Think addition: what goes with ' + a + ' to make ' + s + '?', m(a + ' + ' + b + ' = ' + s) + ', so ' + m(s + ' - ' + a + ' = ' + b) + '.'];
  }
  G('g2.facts-from-memory', function (R, ctx) {
    var shape = by(ctx, R.pick(['add', 'add', 'sub']), R.pick(['add', 'sub', 'missA', 'missB']), R.pick(['add', 'sub', 'missA', 'missB', 'start', 'ten']));
    var a = R.int(2, 9), b = R.int(2, 9);
    if (a + b < 11 && chance(R, 0.75)) b = R.int(Math.max(2, 11 - a), 9);
    var s = a + b;
    if (shape === 'ten' && s <= 10) shape = 'add';
    var q, ans, steps, hint;
    if (shape === 'add') { q = m(a + ' + ' + b + ' = ' + BOX); ans = s; steps = addSteps(a, b); hint = a === b ? 'It is a double.' : Math.abs(a - b) === 1 ? 'It is close to a double.' : s > 10 ? 'Can you make a 10 first?' : 'Start at the bigger number.'; }
    else if (shape === 'sub') { q = m(s + ' - ' + a + ' = ' + BOX); ans = b; steps = subSteps(s, a); hint = 'Think: ' + a + ' plus what makes ' + s + '?'; }
    else if (shape === 'missA') { q = m(a + ' + ' + BOX + ' = ' + s); ans = b; steps = ['What goes with ' + a + ' to make ' + s + '? That is ' + m(s + ' - ' + a) + '.'].concat(subSteps(s, a)); hint = 'Count up from ' + a + ' to ' + s + '.'; }
    else if (shape === 'missB') { q = m(BOX + ' + ' + b + ' = ' + s); ans = a; steps = ['What goes with ' + b + ' to make ' + s + '? That is ' + m(s + ' - ' + b) + '.'].concat(subSteps(s, b)); hint = 'Count up from ' + b + ' to ' + s + '.'; }
    else if (shape === 'start') { q = m(BOX + ' - ' + a + ' = ' + b); ans = s; steps = ['You start with a number, take away ' + a + ', and ' + b + ' is left.', 'Put the ' + a + ' back: ' + m(b + ' + ' + a + ' = ' + s) + '.'].concat(addSteps(b, a).slice(-1)); hint = 'Add the ' + a + ' back to ' + b + '.'; }
    else { q = m(a + ' + ' + b + ' = 10 + ' + BOX); ans = s - 10; steps = addSteps(a, b).concat(['Both sides must be the same amount: ' + m(s + ' = 10 + ' + (s - 10)) + '. The missing number is ' + (s - 10) + '.']); hint = 'Find ' + a + ' + ' + b + ' first.'; }
    return { q: 'Fill in the box. ' + q, a: N(ans), steps: steps, hint: hint };
  });

  G('g2.even-odd', function (R, ctx) {
    var shape = by(ctx, 'pic', R.pick(['two', 'two', 'double', 'zero']), R.pick(['three', 'which', 'two']));
    var EO = ['even', 'odd'];
    function why(n) {
      var d = n % 10, ev = n % 2 === 0;
      var out = [];
      if (n >= 10) out.push('Every ten makes 5 pairs, so the tens never leave one over. Only the ones digit matters.');
      out.push('The ones digit is ' + d + '. ' + (d === 0 ? '0 ones leaves nothing over.' : d + ' ones make ' + pl(Math.floor(d / 2), 'pair') + (d % 2 ? ' with 1 left over.' : ' with none left over.')));
      out.push('So ' + c(n) + ' is <b>' + (ev ? 'even' : 'odd') + '</b>.');
      return out;
    }
    if (shape === 'pic') {
      var n = R.int(5, 18), h = Math.floor(n / 2);
      return { q: 'Is the number of dots even or odd? Look for pairs.', viz: { name: 'g2-array', opts: { n: n, layout: 'pairs', highlight: false, label: n + ' dots set out in pairs' } }, a: mcKeep(EO, n % 2),
        steps: ['Count the dots: there are ' + n + '.', 'Match them in pairs: ' + pl(h, 'pair') + (n % 2 ? ' and 1 dot left over.' : ' and none left over.'), (n % 2 ? m(n + ' = ' + h + ' + ' + h + ' + 1') + ', so ' + n + ' is <b>odd</b>.' : m(n + ' = ' + h + ' + ' + h) + ' (a double), so ' + n + ' is <b>even</b>.')],
        hint: 'Is there a dot with no partner?' };
    }
    if (shape === 'zero') return { q: 'Is ' + m(0) + ' even or odd?', a: mcKeep(EO, 0), steps: ['Zero things can be shared into two equal groups of 0, with nothing left over: ' + m('0 = 0 + 0') + '.', 'Also, counting by 2s goes 0, 2, 4, 6, … and 0 is on that list.', 'So 0 is <b>even</b>.'], hint: 'Can you split 0 into two equal groups?' };
    if (shape === 'double') {
      var d2 = R.int(6, 25), n2 = 2 * d2;
      return { q: m(n2) + ' is even, so it is a double. Fill in the box: ' + m(n2 + ' = ' + BOX + ' + ' + BOX) + ' (the same number twice).', a: N(d2),
        steps: ['Split ' + n2 + ' into two equal groups.', n2 >= 20 ? 'Halve the tens and the ones: half of ' + (n2 - n2 % 10) + ' and half of ' + (n2 % 10) + '.' + (Math.floor(n2 / 10) % 2 ? ' The tens are odd, so think of ' + n2 + ' as ' + (n2 - 10 - n2 % 10) + ' and ' + (10 + n2 % 10) + ': halves ' + (n2 - 10 - n2 % 10) / 2 + ' and ' + (10 + n2 % 10) / 2 + '.' : '') : 'Think of a double you know.', m(d2 + ' + ' + d2 + ' = ' + n2) + ', so the number is ' + d2 + '.'], hint: 'What number plus itself makes ' + n2 + '?' };
    }
    if (shape === 'which') {
      var wantEven = R.coin(), pool = [], k = 0;
      while (pool.length < 3 && k++ < 50) { var x = R.int(11, 499); if ((x % 2 === 0) !== wantEven && pool.indexOf(x) < 0) pool.push(x); }
      var good = R.int(11, 499); if ((good % 2 === 0) !== wantEven) good += 1;
      // make one wrong choice look tempting: its tens digit matches the kind we want
      return { q: 'Which number is ' + (wantEven ? 'even' : 'odd') + '?', a: mc(String(good), pool.map(String)),
        steps: ['Look only at the ones digit. Even numbers end in 0, 2, 4, 6 or 8; odd numbers end in 1, 3, 5, 7 or 9.', pool.concat([good]).sort(function (p, q2) { return p - q2; }).map(function (v) { return v + ' ends in ' + v % 10 + ': ' + (v % 2 ? 'odd' : 'even'); }).join('; ') + '.', 'So <b>' + good + '</b> is the ' + (wantEven ? 'even' : 'odd') + ' one.'],
        hint: 'Only the ones digit decides.' };
    }
    var n3;
    if (shape === 'two') { // tempting: the tens digit has the other parity
      var ev = R.coin(), td = R.int(1, 9), od = R.int(0, 9);
      if (chance(R, 0.6)) { od = ev ? R.pick([0, 2, 4, 6, 8]) : R.pick([1, 3, 5, 7, 9]); if ((td % 2 === 0) === ev) td = td === 9 ? 8 : td + 1; }
      n3 = 10 * td + od;
    } else n3 = R.int(100, 999);
    return { q: 'Is ' + m(c(n3)) + ' even or odd?', a: mcKeep(EO, n3 % 2), steps: why(n3), hint: 'Look at the ones digit. Can those ones all be paired?' };
  });

  /* ================================================================ unit: place value */
  G('g2.hundred-is-ten-tens', function (R, ctx) {
    var shape = by(ctx, R.pick(['tensIn100', 'hToT', 'hNum', 'pic10']), R.pick(['hToT', 'tToH', 'picT', 'tensIn', 'hNum']), R.pick(['mixT', 'tensOf', 'picT', 'tensIn']));
    var h, t;
    if (shape === 'tensIn100') return { q: 'Count by tens: 10, 20, 30, … all the way to 100. How many tens make 100?', a: N(10), steps: ['Count the tens on your fingers: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.', 'That is 10 tens.', 'So 10 tens make 1 hundred: ' + m('10 \\text{ tens} = 100') + '.'], hint: 'Put up one finger for each ten you say.' };
    if (shape === 'pic10') return { q: 'Here are 10 tens. Bundle them into 1 hundred. What number is that?', viz: { name: 'g2-blocks', opts: { t: 10, cols: 3 } }, a: N(100), steps: ['Count the rods by tens: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.', '10 tens make 1 hundred, which is written 100: 1 in the hundreds place, 0 tens and 0 ones.'], hint: 'Count the rods by tens.' };
    var box = R.pick(['crayons come in boxes of 10', 'pencils come in packs of 10', 'stickers come in strips of 10', 'beads come on strings of 10']);
    if (shape === 'hToT') { h = by(ctx, R.int(2, 4), R.int(2, 9)); return { q: R.pick(['How many tens are in ' + pl(h, 'hundred') + '?', 'At a school store, ' + box + '. How many tens make ' + 100 * h + '?']), a: N(10 * h), steps: ['Each hundred is 10 tens.', pl(h, 'hundred') + ' is ' + (h <= 5 ? range(1, h, 1).map(function () { return '10'; }).join(' + ') + ' = ' : '') + (10 * h) + ' tens.', 'Check: ' + 10 * h + ' tens is ' + c(100 * h) + ', and so is ' + pl(h, 'hundred') + '.'], hint: '1 hundred is 10 tens.' }; }
    if (shape === 'hNum') { h = R.int(1, 9); return { q: 'Write the number for ' + pl(h, 'hundred') + ', 0 tens and 0 ones.', a: N(100 * h), steps: ['Put ' + h + ' in the hundreds place, 0 in the tens place and 0 in the ones place.', 'The number is ' + 100 * h + ' (' + U.words(100 * h) + ').'], hint: 'The zeros hold the tens and ones places.' }; }
    if (shape === 'tToH') { h = R.int(2, 9); return { q: m(10 * h) + ' tens make how many hundreds?', a: N(h), steps: ['Every 10 tens make 1 hundred.', 'Count the tens by tens: ' + range(10, 10 * h, 10).join(', ') + ' tens. That is ' + h + ' groups of 10 tens.', 'So ' + 10 * h + ' tens make ' + pl(h, 'hundred') + ' = ' + 100 * h + '.'], hint: 'How many groups of 10 tens can you make?' }; }
    if (shape === 'tensIn') { h = R.int(2, 9); t = by(ctx, 0, R.pick([0, 0, R.int(1, 9)])); var n = 100 * h + 10 * t; return { q: 'How many tens are in ' + m(n) + '?', a: N(10 * h + t), steps: [n + ' is ' + pl(h, 'hundred') + (t ? ' and ' + pl(t, 'ten') : '') + '.', 'Each hundred is 10 tens, so ' + pl(h, 'hundred') + ' is ' + 10 * h + ' tens.' + (t ? ' Add the other ' + t + ': ' + (10 * h + t) + ' tens.' : ''), 'So ' + n + ' has ' + (10 * h + t) + ' tens in all.'], hint: 'Each hundred is 10 tens.' }; }
    if (shape === 'picT') {
      t = by(ctx, 10, R.int(10, 16), R.int(11, 19));
      return { q: 'How much do these tens make? Count them by tens.', viz: { name: 'g2-blocks', opts: { t: t, cols: 3 } }, a: N(10 * t), steps: ['There are ' + t + ' tens.', '10 of them make 1 hundred. ' + (t > 10 ? 'The other ' + (t - 10) + ' tens are ' + 10 * (t - 10) + '.' : ''), 'So ' + t + ' tens make ' + 10 * t + '.'], hint: 'Find 10 tens first: that is 1 hundred.' };
    }
    if (shape === 'mixT') { h = R.int(1, 8); t = R.int(1, 9); return { q: pl(h, 'hundred') + ' and ' + pl(t, 'ten') + ' make how many tens in all?', a: N(10 * h + t), steps: [pl(h, 'hundred') + ' is ' + 10 * h + ' tens.', 'Add ' + t + ' more tens: ' + m(10 * h + ' + ' + t + ' = ' + (10 * h + t)) + ' tens.', 'Check: ' + (10 * h + t) + ' tens is ' + (100 * h + 10 * t) + '.'], hint: 'Change the hundreds into tens first.' }; }
    // tensOf: ? tens = n
    h = R.int(1, 9); t = R.int(1, 9);
    return { q: 'Fill in the box: ' + m(BOX + '\\text{ tens} = ' + (100 * h + 10 * t)) + '.', a: N(10 * h + t), steps: [(100 * h + 10 * t) + ' is ' + pl(h, 'hundred') + ' and ' + pl(t, 'ten') + '.', pl(h, 'hundred') + ' is ' + 10 * h + ' tens, and ' + 10 * h + ' + ' + t + ' = ' + (10 * h + t) + '.', 'So ' + (100 * h + 10 * t) + ' is ' + (10 * h + t) + ' tens.'], hint: 'How many tens are in each hundred?' };
  });

  function pvSteps(h, t, o) {
    var n = 100 * h + 10 * t + o, out = [];
    out.push(pl(h, 'hundred') + ' is ' + 100 * h + '; ' + pl(t, 'ten') + ' is ' + 10 * t + '; ' + pl(o, 'one') + ' is ' + o + '.');
    if (!t || !o) out.push((!t ? 'There are no tens, so a 0 holds the tens place.' : '') + (!t && !o ? ' ' : '') + (!o ? 'There are no ones, so a 0 holds the ones place.' : ''));
    out.push('Write one digit in each place: hundreds ' + h + ', tens ' + t + ', ones ' + o + '. The number is <b>' + n + '</b>.');
    return out;
  }
  G('g2.place-value-hundreds', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['pic', 'pic', 'words', 'digit']), R.pick(['pic', 'words', 'value', 'split']), R.pick(['wordsMix', 'which', 'value', 'pic', 'split']));
    var h = R.int(1, 9), t = R.int(1, 9), o = R.int(1, 9);
    if (L >= 2 && chance(R, 0.45)) { if (R.coin()) t = 0; else o = 0; }
    if (L === 1 && shape === 'pic') h = R.int(1, 5);
    if (shape === 'pic' && L >= 2) h = R.int(1, 6);
    var n = 100 * h + 10 * t + o;
    if (shape === 'pic') return { q: 'What number do the blocks show?', viz: { name: 'g2-blocks', opts: { h: h, t: t, o: o } }, a: N(n), steps: ['Count each kind of block: ' + pl(h, 'hundred') + ', ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.'].concat(pvSteps(h, t, o)), hint: 'Count the flats, then the rods, then the small cubes.' };
    if (shape === 'words') return { q: 'What number has ' + pl(h, 'hundred') + ', ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '?', a: N(n), steps: pvSteps(h, t, o), hint: 'Write one digit for each place: hundreds, tens, ones.' };
    if (shape === 'wordsMix') {
      var parts = R.shuffle([pl(h, 'hundred'), pl(t, 'ten'), pl(o, 'one')].filter(function (x) { return !/^0 /.test(x); }));
      return { q: 'What number is ' + U.list(parts) + '?', a: N(n), steps: ['Sort the parts by place: ' + pl(h, 'hundred') + ', ' + pl(t, 'ten') + ', ' + pl(o, 'one') + '.'].concat(pvSteps(h, t, o)), hint: 'Find the hundreds first, then the tens, then the ones.' };
    }
    if (shape === 'digit') {
      var pk = R.pick(['hundreds', 'tens', 'ones']), dv = { hundreds: h, tens: t, ones: o }[pk];
      return { q: 'Which digit is in the <b>' + pk + '</b> place in ' + m(n) + '?', a: N(dv), steps: ['From the right, the places are ones, tens, hundreds.', 'In ' + n + ': hundreds ' + h + ', tens ' + t + ', ones ' + o + '.', 'The ' + pk + ' digit is ' + dv + '.'], hint: 'The ones place is on the right.' };
    }
    if (shape === 'value') {
      var opts = [['hundreds', h, 100 * h], ['tens', t, 10 * t], ['ones', o, o]].filter(function (z) { return z[1] > 0; });
      // pick a digit that appears once
      opts = opts.filter(function (z) { return String(n).split('').filter(function (ch) { return +ch === z[1]; }).length === 1; });
      if (!opts.length) { o = (o + 1) % 10 || 1; n = 100 * h + 10 * t + o; opts = [['ones', o, o]]; if (o === h || o === t) { h = h === 9 ? 8 : h; } }
      var z = R.pick(opts.filter(function (y) { return y[0] !== 'ones'; }).concat(opts.length === 1 ? opts : []));
      if (!z) z = opts[0];
      return { q: 'What is the <b>' + z[1] + '</b> worth in ' + m(n) + '?', a: N(z[2]), steps: ['The ' + z[1] + ' is in the ' + z[0] + ' place.', z[0] === 'ones' ? 'So it is worth ' + z[1] + '.' : 'So it means ' + pl(z[1], z[0].slice(0, -1), z[0]) + ', which is worth ' + z[2] + '.'], hint: 'Which place is the ' + z[1] + ' in?' };
    }
    if (shape === 'split') return { q: 'How many hundreds, tens and ones are in ' + m(n) + '?', a: { t: 'multi', parts: [{ label: 'Hundreds:', a: N(h) }, { label: 'Tens:', a: N(t) }, { label: 'Ones:', a: N(o) }] }, steps: ['Read the digits from left to right: hundreds, tens, ones.', n + ' has ' + pl(h, 'hundred') + ', ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.', 'Check: ' + m(100 * h + ' + ' + 10 * t + ' + ' + o + ' = ' + n) + '.'], hint: 'The digit on the left is the hundreds digit.' };
    // which: mc with the placeholder trap
    h = R.int(2, 9); o = R.int(1, 9); t = 0;
    var right = String(100 * h + o), wr = [String(10 * h + o), String(1000 * h + o), String(100 * h + 10 * o)];
    return { q: 'Which number has ' + pl(h, 'hundred') + ', 0 tens and ' + pl(o, 'one') + '?', a: mc(right, wr), steps: [pl(h, 'hundred') + ' and ' + pl(o, 'one') + ', with no tens.', 'A three-digit number needs a digit in every place, so 0 holds the tens place.', 'The number is ' + right + '. (' + (10 * h + o) + ' is only ' + pl(h, 'ten') + ' and ' + pl(o, 'one') + ', and ' + c(1000 * h + o) + ' has thousands.)'], hint: 'Each place gets exactly one digit.' };
  });

  G('g2.skip-count-5-10-100', function (R, ctx) {
    var L = ctx.level, d, s, back = false;
    var kind = R.pick([5, 10, 100]);
    if (L === 1) { d = kind; s = d === 5 ? 5 * R.int(0, 10) : d === 10 ? 10 * R.int(0, 5) : 100 * R.int(0, 4); }
    else if (L === 2) { d = kind; s = d === 5 ? 5 * R.int(20, 190) : d === 10 ? R.int(100, 950) : R.int(10, 590); if (d === 10 && chance(R, 0.6)) s = 100 * R.int(1, 9) - 10 * R.int(2, 3) + R.int(0, 9); }
    else { d = kind; back = chance(R, 0.4); s = d === 5 ? 5 * R.int(20, 190) : d === 10 ? 100 * R.int(1, 9) - 10 * R.int(1, 3) + R.int(0, 9) : R.int(10, 590); if (back) { s = s + 4 * d; } }
    var seq = []; for (var i = 0; i < 5; i++) seq.push(back ? s - i * d : s + i * d);
    if (seq.some(function (x) { return x < 0 || x > 1000; })) { back = false; seq = []; s = d === 100 ? 100 : d * 2; for (i = 0; i < 5; i++) seq.push(s + i * d); }
    var askStep = L === 3 && chance(R, 0.25);
    var pos = askStep ? -1 : by(ctx, R.int(2, 4), R.int(1, 4), R.int(0, 3));
    var shown = seq.map(function (x, j) { return j === pos ? BOX : c(x); }).join(',\\ ');
    var word = back ? 'Count back by ' + d + 's.' : 'Count by ' + d + 's.';
    if (askStep) return { q: 'What are these numbers counting by? ' + m(seq.map(c).join(',\\ ')), a: N(d), steps: ['Find how much the numbers change each time: ' + m(c(seq[1]) + ' - ' + c(seq[0]) + ' = ' + Math.abs(seq[1] - seq[0])) + '.', 'Each number is ' + d + (back ? ' less' : ' more') + ' than the one before, so they count ' + (back ? 'back ' : '') + 'by ' + d + 's.'], hint: 'How much bigger is each number than the one before?' };
    var ans = seq[pos], prev = pos > 0 ? seq[pos - 1] : null, next = seq[pos + 1];
    var steps = ['Each number is ' + d + (back ? ' less' : ' more') + ' than the one before it.'];
    if (prev !== null) steps.push('The number before the box is ' + c(prev) + '. ' + m(c(prev) + (back ? ' - ' : ' + ') + d + ' = ' + c(ans)) + '.');
    else steps.push('The number after the box is ' + c(next) + ', so go the other way: ' + m(c(next) + (back ? ' + ' : ' - ') + d + ' = ' + c(ans)) + '.');
    var crossed = Math.floor(ans / 100) !== Math.floor((prev !== null ? prev : next) / 100);
    if (d === 10 && crossed) steps.push('Watch the hundreds: ' + (back ? 'going back past a hundred, the hundreds digit goes down by 1.' : '10 more than ' + c(prev !== null ? prev : ans - 10) + ' makes a new hundred, so the hundreds digit goes up by 1.'));
    steps.push('The missing number is <b>' + c(ans) + '</b>.');
    return { q: word + ' What number goes in the box? ' + m(shown), a: N(ans), steps: steps, hint: d === 100 ? 'Only the hundreds digit changes.' : d === 10 ? 'The tens digit changes by 1 each time.' : 'Count by 5s: the ones digit goes 0, 5, 0, 5 …' };
  });

  G('g2.number-forms', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['w2d', 'e2d', 'w2d']), R.pick(['w2d', 'e2d', 'blank', 'pickWords']), R.pick(['w2d', 'e2dMix', 'blank', 'pickNum', 'pickWords']));
    var h = R.int(1, 9), t = R.int(1, 9), o = R.int(1, 9);
    if (L >= 2 && chance(R, 0.5)) { if (R.coin()) t = 0; else o = 0; }
    var n = 100 * h + 10 * t + o, terms = [100 * h, 10 * t, o].filter(Boolean), exp = terms.join(' + ');
    function form3() { return ['Digits: ' + n + '. Words: ' + U.words(n) + '. Expanded form: ' + m(exp) + '.']; }
    if (shape === 'w2d') return { q: 'Write the number in digits: <b>' + U.words(n) + '</b>', a: N(n), steps: ['"' + cap(U.words(100 * h)) + '" means ' + h + ' in the hundreds place.', (t ? '"' + U.words(10 * t + o) + '" is ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.' : '"' + U.words(o) + '" is ' + pl(o, 'one') + ', and there are no tens, so the tens place gets a 0.').replace('and 0 ones', 'and no ones, so the ones place gets a 0'), 'One digit in each place: <b>' + n + '</b>. (Not ' + c(100 * h * 10 + 10 * t + o) + ': a number in the hundreds has just 3 digits.)'], hint: 'A number in the hundreds has exactly 3 digits.' };
    if (shape === 'e2d' || shape === 'e2dMix') {
      var sh = shape === 'e2dMix' ? R.shuffle(terms.slice()) : terms;
      if (shape === 'e2dMix' && sh.join() === terms.join()) sh = terms.slice().reverse();
      return { q: 'What number is ' + m(sh.join(' + ')) + '?', a: N(n), steps: ['Sort by place: ' + terms.map(function (x) { return x >= 100 ? x + ' is ' + pl(x / 100, 'hundred') : x >= 10 ? x + ' is ' + pl(x / 10, 'ten') : pl(x, 'one'); }).join(', ') + '.', (!t ? 'There are no tens, so write 0 in the tens place. ' : '') + (!o ? 'There are no ones, so write 0 in the ones place. ' : '') + 'The number is <b>' + n + '</b>.'], hint: 'Which part is the hundreds? the tens? the ones?' };
    }
    if (shape === 'blank') {
      if (!t) t = R.int(1, 9); if (!o) o = R.int(1, 9); n = 100 * h + 10 * t + o;
      var miss = R.pick([0, 1, 2]), pieces = [100 * h, 10 * t, o], ans = pieces[miss];
      return { q: 'Fill in the box: ' + m(n + ' = ' + pieces.map(function (x, j) { return j === miss ? BOX : x; }).join(' + ')), a: N(ans), steps: [n + ' is ' + pl(h, 'hundred') + ', ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.', 'In expanded form that is ' + m(pieces.join(' + ')) + '.', 'The missing part is ' + ans + '.'], hint: 'What is each digit worth?' };
    }
    if (shape === 'pickWords') {
      if (!o) { o = R.int(1, 9); } t = R.coin() ? 0 : t; n = 100 * h + 10 * t + o;
      var right = U.words(n), wr = [U.words(100 * h + 10 * o + (t ? t : 0)), U.words(10 * h + o), U.words(1000 * h + 10 * t + o)];
      if (!t) wr[0] = U.words(100 * h + 10 * o);
      return { q: 'Which words name ' + m(n) + '?', a: mc(right, wr), steps: [n + ' has ' + pl(h, 'hundred') + ', ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.', 'Say the hundreds, then the rest: "' + U.words(100 * h) + '" and "' + U.words(10 * t + o) + '".', 'So ' + n + ' is <b>' + right + '</b>.'], hint: 'Say the hundreds first.' };
    }
    // pickNum: the 4006 trap
    o = R.int(1, 9); t = 0; n = 100 * h + o;
    return { q: 'Which number is <b>' + U.words(n) + '</b>?', a: mc(String(n), [c(1000 * h + o), String(10 * h + o), String(100 * h + 10 * o)]), steps: ['"' + cap(U.words(100 * h)) + '" is ' + 100 * h + ', so the hundreds digit is ' + h + '.', '"' + U.words(o) + '" is ' + pl(o, 'one') + '. There are no tens, so 0 holds the tens place.', 'The number is <b>' + n + '</b>. Writing ' + 100 * h + ' and then ' + o + ' side by side (' + c(1000 * h + o) + ') would be a number in the thousands.'], hint: 'How many digits does a number in the hundreds have?' };
  });

  G('g2.compare-3-digit', function (R, ctx) {
    var L = ctx.level, SIG = ['<', '>', '='], a, b, la, lb, kind = by(ctx, R.pick(['h', 't']), R.pick(['t', 'o', 'o', 'exp']), R.pick(['trap', 'o', 'exp', 'greatest', 'trap']));
    if (kind === 'greatest') {
      var ds = R.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3), perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(function (p) { return 100 * ds[p[0]] + 10 * ds[p[1]] + ds[p[2]]; });
      var four = R.sample(perms, 4), wantMax = R.coin(), best = wantMax ? Math.max.apply(null, four) : Math.min.apply(null, four);
      return { q: 'Which number is the ' + (wantMax ? 'greatest' : 'least') + '?', a: mc(String(best), four.filter(function (x) { return x !== best; }).map(String)), steps: ['Compare the hundreds digits first: ' + four.map(function (x) { return x; }).join(', ') + '.', 'The ' + (wantMax ? 'biggest' : 'smallest') + ' hundreds digit is ' + Math.floor(best / 100) + '. ' + (four.filter(function (x) { return Math.floor(x / 100) === Math.floor(best / 100); }).length > 1 ? 'Two numbers have it, so compare their tens.' : 'Only one number has it.'), '<b>' + best + '</b> is the ' + (wantMax ? 'greatest' : 'least') + '.'], hint: 'Start with the hundreds digits.' };
    }
    function make() {
      var h = R.int(1, 9), t = R.int(0, 9), o = R.int(0, 9);
      a = 100 * h + 10 * t + o;
      if (kind === 'h') { var h2 = R.intNot(1, 9, h); b = 100 * h2 + 10 * R.int(0, 9) + R.int(0, 9); }
      else if (kind === 't') { var t2 = R.intNot(0, 9, t); b = 100 * h + 10 * t2 + R.int(0, 9); }
      else if (kind === 'o') { b = 100 * h + 10 * t + R.intNot(0, 9, o); }
      else if (kind === 'eq') b = a;
      else if (kind === 'exp') { b = chance(R, 0.35) ? a : a + R.pick([-10, 10, -1, 1, 100, -100]); if (b < 100 || b > 999) b = a; }
      else { // trap: bigger digits in the smaller number
        var hh = R.int(2, 8); a = 100 * hh + 10 * R.int(0, 2) + R.int(0, 3); b = 100 * (hh - 1) + 10 * R.int(7, 9) + R.int(6, 9); if (R.coin()) { var z = a; a = b; b = z; }
      }
    }
    make(); if (a === b && kind !== 'eq' && kind !== 'exp') b = a + 1;
    la = c(a); lb = c(b);
    if (kind === 'exp') { var D = digits(b); lb = [100 * D.h, 10 * D.t, D.o].filter(Boolean).join(' + '); if (R.coin()) { var tmp = la; la = lb; lb = tmp; var t3 = a; a = b; b = t3; } }
    var ans = a < b ? 0 : a > b ? 1 : 2, A = digits(a), B = digits(b), steps = [];
    if (kind === 'exp') steps.push('First write the expanded form as a number: ' + m((/\+/.test(la) ? la : lb) + ' = ' + (/\+/.test(la) ? a : b)) + '.');
    if (A.h !== B.h) steps.push('Compare the hundreds: ' + A.h + ' hundreds ' + (A.h > B.h ? '>' : '<') + ' ' + B.h + ' hundreds. That decides it, because even 99 is less than 1 hundred.');
    else {
      steps.push('The hundreds are the same (' + A.h + '), so compare the tens.');
      if (A.t !== B.t) steps.push(A.t + ' tens ' + (A.t > B.t ? '>' : '<') + ' ' + B.t + ' tens.');
      else { steps.push('The tens are the same too (' + A.t + '), so compare the ones.'); if (A.o !== B.o) steps.push(A.o + ' ' + (A.o > B.o ? '>' : '<') + ' ' + B.o + '.'); else steps.push('The ones are the same: the numbers are equal.'); }
    }
    steps.push('So ' + m(c(a) + ' ' + SIG[ans] + ' ' + c(b)) + '.' + (ans < 2 ? ' The open side of the sign faces the bigger number.' : ''));
    return { q: 'Which sign goes in the box? ' + m(la + ' \\;' + BOX + '\\; ' + lb), a: mcKeep(SIG, ans), steps: steps, hint: 'Compare the hundreds first, then the tens, then the ones.' };
  });

  G('g2.number-line-to-1000', function (R, ctx) {
    var L = ctx.level, kind = by(ctx, R.pick(['0to100', 'tenOnes']), R.pick(['hund10', '0to1000', 'by5', 'hund10']), R.pick(['mid', 'jump', 'by20', 'by2', 'hund10']));
    var lo, step, n = 10, labels = 'ends', v, askJump = false;
    if (kind === '0to100') { lo = 0; step = 10; labels = R.coin() ? 'ends' : [0, 50, 100]; }
    else if (kind === 'tenOnes') { lo = 10 * R.int(1, 9); step = 1; }
    else if (kind === 'hund10') { lo = 100 * R.int(1, 8); step = 10; }
    else if (kind === '0to1000') { lo = 0; step = 100; }
    else if (kind === 'by5') { lo = 50 * R.int(0, 18); step = 5; }
    else if (kind === 'by20') { lo = 100 * R.int(0, 8); step = 20; n = 5; }
    else if (kind === 'by2') { lo = 10 * R.int(2, 40); step = 2; n = 10; }
    else if (kind === 'jump') { var pick = R.pick([[0, 100, 10], [0, 1000, 100], [0, 50, 5], [200, 300, 20], [0, 20, 2], [400, 500, 10]]); lo = pick[0]; step = pick[2]; n = (pick[1] - pick[0]) / step; askJump = true; }
    else { lo = 100 * R.int(1, 8) + 10 * R.int(0, 5); step = 10; }
    var hi = lo + n * step;
    if (kind === 'mid') { var k0 = R.int(1, n - 3); labels = [lo + k0 * step, lo + (k0 + 1) * step]; }
    var k = R.int(1, n - 1);
    if (Array.isArray(labels)) while (labels.indexOf(lo + k * step) >= 0) k = (k % (n - 1)) + 1;
    v = lo + k * step;
    if (askJump) return { q: 'The marks on this number line are the same distance apart. How much is each jump from one mark to the next?', viz: { name: 'g2-line', opts: { min: lo, max: hi, step: step, labels: 'ends' } }, a: N(step), steps: ['From ' + c(lo) + ' to ' + c(hi) + ' is ' + m(c(hi) + ' - ' + c(lo) + ' = ' + c(hi - lo)) + '.', 'Count the jumps between the marks (not the marks): there are ' + n + '.', 'Try counting by ' + step + 's from ' + c(lo) + ': ' + range(lo, hi, step).map(c).join(', ') + '. That lands on ' + c(hi) + ' in ' + n + ' jumps, so each jump is <b>' + step + '</b>.'], hint: 'Count the spaces between the marks, not the marks.' };
    var steps = [];
    var ref = Array.isArray(labels) ? labels : [lo, hi];
    var refL = ref[0], refR = ref[ref.length - 1];
    if (labels === 'ends' || kind === '0to100') steps.push('Find the size of each jump: from ' + c(lo) + ' to ' + c(hi) + ' there are ' + n + ' jumps, and counting by ' + step + 's gets there (' + range(lo, Math.min(hi, lo + 3 * step), step).map(c).join(', ') + ', …). Each jump is ' + step + '.');
    else steps.push('The two numbers shown, ' + c(refL) + ' and ' + c(refR) + ', are ' + (refR - refL) / step + ' jump' + ((refR - refL) / step > 1 ? 's' : '') + ' apart, so each jump is ' + step + '.');
    var base = refL <= v ? (v - refL <= Math.abs(refR - v) || refR < v ? refL : refR) : refL;
    if (v > refR) base = refR;
    var j = Math.round((v - base) / step);
    if (j >= 0) steps.push('Start at ' + c(base) + ' and count ' + Math.abs(j) + ' jump' + (Math.abs(j) === 1 ? '' : 's') + ' to the right: ' + range(base + step, v, step).map(c).join(', ') + '.');
    else steps.push('Start at ' + c(base) + ' and count ' + Math.abs(j) + ' jump' + (Math.abs(j) === 1 ? '' : 's') + ' to the left: ' + range(base - step, v, -step).map(c).join(', ') + '.');
    steps.push('The dot is at <b>' + c(v) + '</b>.');
    return { q: 'What number is the dot at?', viz: { name: 'g2-line', opts: { min: lo, max: hi, step: step, labels: labels, points: [{ v: v, text: '?' }] } }, a: N(v), steps: steps, hint: 'First find how much each jump is worth. Count jumps, not marks.' };
  });

  G('g2.ten-hundred-more-less', function (R, ctx) {
    var L = ctx.level, d = R.pick([10, 10, 100]), sign = R.pick([1, -1]), n, ans, cross;
    function pickN() {
      if (L === 1) { // no crossing
        n = 100 * R.int(1, 8) + 10 * R.int(1, 8) + R.int(0, 9);
      } else {
        cross = d === 10 && chance(R, 0.6);
        n = cross ? (sign > 0 ? 100 * R.int(1, 8) + 90 + R.int(0, 9) : 100 * R.int(2, 9) + R.int(0, 9)) : 100 * R.int(1, 8) + 10 * R.int(0, 9) + R.int(0, 9);
      }
      ans = n + sign * d;
    }
    pickN(); if (ans < 0 || ans > 1000) { sign = -sign; ans = n + sign * d; }
    var rev = L === 3 && chance(R, 0.45), word = (d === 10 ? '10 ' : '100 ') + (sign > 0 ? 'more' : 'less');
    var steps = [];
    var place = d === 10 ? 'tens' : 'hundreds', D = digits(n), Dn = digits(ans);
    var crossT = d === 10 && Math.floor(n / 100) !== Math.floor(ans / 100);
    if (!rev) {
      steps.push(word + ' means ' + (sign > 0 ? 'one more ' : 'one less ') + (d === 10 ? 'ten' : 'hundred') + ', so the ' + place + ' digit changes by 1.');
      if (crossT) steps.push(sign > 0 ? c(n) + ' has 9 tens. One more ten makes 10 tens, which is a new hundred. So the hundreds go up by 1 and the tens become 0.' : c(n) + ' has 0 tens, so take the ten from a hundred: the hundreds go down by 1 and the tens become 9.');
      else steps.push('The ' + place + ' digit goes from ' + (d === 10 ? D.t : D.h) + ' to ' + (d === 10 ? Dn.t : Dn.h) + '. The other digits stay the same.');
      steps.push(m(c(n) + (sign > 0 ? ' + ' : ' - ') + d + ' = ' + c(ans)) + '.');
      return { q: 'What is ' + word + ' than ' + m(c(n)) + '?', a: N(ans), steps: steps, hint: 'Which digit changes when you ' + (sign > 0 ? 'add' : 'take away') + ' ' + (d === 10 ? 'a ten' : 'a hundred') + '?' };
    }
    // reverse: word than ? is ans  ->  ? = n
    steps.push('Work backward: if ' + word + ' than the mystery number is ' + c(ans) + ', the mystery number is ' + d + (sign > 0 ? ' less' : ' more') + ' than ' + c(ans) + '.');
    steps.push(m(c(ans) + (sign > 0 ? ' - ' : ' + ') + d + ' = ' + c(n)) + '.');
    steps.push('Check: ' + word + ' than ' + c(n) + ' is ' + c(ans) + '.');
    return { q: m(c(ans)) + ' is ' + word + ' than what number?', a: N(n), steps: steps, hint: 'Undo it: go the other way.' };
  });

  /* ================================================================ unit: add and subtract within 100 */
  G('g2.trade-ten-ones', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['pic', 'pic', 'split']), R.pick(['split', 'break', 'tf', 'pic']), R.pick(['hund', 'break', 'tf', 'breakH']));
    var t, o, n;
    if (shape === 'pic') {
      t = R.int(1, 6); o = R.int(11, 19); n = 10 * t + o;
      return { q: 'What number do the blocks show? (Hint: there are more than 9 ones.)', viz: { name: 'g2-blocks', opts: { t: t, o: o, ring: L === 1 } }, a: N(n), steps: ['The blocks show ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.', 'Trade 10 ones for 1 ten. Now there are ' + pl(t + 1, 'ten') + ' and ' + pl(o - 10, 'one') + '.', 'Trading does not change how much there is: ' + m(10 * t + ' + ' + o + ' = ' + n) + ' and ' + m(10 * (t + 1) + ' + ' + (o - 10) + ' = ' + n) + '.', 'The number is <b>' + n + '</b>.'], hint: 'Make a ten from 10 of the ones.' };
    }
    if (shape === 'split') {
      t = R.int(1, 7); o = R.int(10, 19); n = 10 * t + o;
      return { q: 'Trade 10 ones for 1 ten. ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + ' is the same as how many tens and ones?', a: { t: 'multi', parts: [{ label: 'Tens:', a: N(t + 1) }, { label: 'Ones:', a: N(o - 10) }] }, steps: ['Take 10 of the ' + o + ' ones and trade them for 1 ten.', 'Tens: ' + m(t + ' + 1 = ' + (t + 1)) + '. Ones: ' + m(o + ' - 10 = ' + (o - 10)) + '.', 'Both ways show ' + n + '.'], hint: '10 ones make 1 ten.' };
    }
    if (shape === 'break') {
      t = R.int(2, 9); o = R.int(0, 9); n = 10 * t + o;
      return { q: 'Break 1 ten into 10 ones. ' + m(n) + ' is ' + pl(t - 1, 'ten') + ' and how many ones?', a: N(o + 10), steps: [n + ' is ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + '.', 'Break 1 ten into 10 ones: ' + pl(t - 1, 'ten') + ' and ' + m(o + ' + 10 = ' + (o + 10)) + ' ones.', 'Check: ' + m(10 * (t - 1) + ' + ' + (o + 10) + ' = ' + n) + '.'], hint: 'The broken ten becomes 10 more ones.' };
    }
    if (shape === 'tf') {
      t = R.int(2, 7); o = R.int(11, 19); n = 10 * t + o;
      var claim = R.pick([n, n, Number(String(t) + String(o)), 10 * t + o - 10]), ok = claim === n;
      return { q: 'True or false: ' + pl(t, 'ten') + ' and ' + pl(o, 'one') + ' is the same number as ' + m(claim) + '.', a: { t: 'tf', v: ok }, steps: ['Trade 10 ones for 1 ten: ' + pl(t + 1, 'ten') + ' and ' + pl(o - 10, 'one') + '.', 'That is ' + m(10 * (t + 1) + ' + ' + (o - 10) + ' = ' + n) + '.', ok ? 'So it is <b>true</b>.' : 'So it is <b>false</b>: the number is ' + n + ', not ' + claim + '.'], hint: 'Trade 10 ones for a ten, then read the number.' };
    }
    if (shape === 'breakH') {
      var h = R.int(2, 9); o = R.int(1, 9); n = 100 * h + o;
      return { q: 'Break 1 hundred into 10 tens. ' + m(n) + ' is ' + pl(h - 1, 'hundred') + ', how many tens, and ' + pl(o, 'one') + '?', a: N(10), steps: [n + ' is ' + pl(h, 'hundred') + ', 0 tens and ' + pl(o, 'one') + '.', '1 hundred is 10 tens. Breaking it gives ' + pl(h - 1, 'hundred') + ', 10 tens and ' + pl(o, 'one') + '.', 'Check: ' + m(100 * (h - 1) + ' + 100 + ' + o + ' = ' + n) + '.'], hint: 'How many tens are in 1 hundred?' };
    }
    // hund: h hundreds, 1x tens, o ones
    var hh = R.int(1, 7), tt = R.int(10, 16); o = R.int(0, 9); n = 100 * hh + 10 * tt + o;
    return { q: 'What number is ' + pl(hh, 'hundred') + ', ' + pl(tt, 'ten') + ' and ' + pl(o, 'one') + '?', a: N(n), steps: ['There are ' + tt + ' tens: trade 10 tens for 1 hundred.', 'Now there are ' + pl(hh + 1, 'hundred') + ', ' + pl(tt - 10, 'ten') + ' and ' + pl(o, 'one') + '.', 'The number is <b>' + n + '</b>. Check: ' + m(100 * hh + ' + ' + 10 * tt + ' + ' + o + ' = ' + n) + '.'], hint: '10 tens make 1 hundred.' };
  });

  function pair100(R, regroup, maxSum) {
    for (var k = 0; k < 200; k++) {
      var a = R.int(12, 79), b = R.int(11, 69);
      if (a + b > maxSum) continue;
      if (((a % 10) + (b % 10) >= 10) !== regroup) continue;
      if (a % 10 === 0 || b % 10 === 0) continue;
      return [a, b];
    }
    return regroup ? [38, 47] : [34, 25];
  }
  G('g2.add-within-100', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'add', 'add', R.pick(['add', 'add', 'oops', 'miss']));
    var p, a, b;
    if (L === 1) { if (chance(R, 0.35)) { a = R.int(14, 89); b = R.int(3, 9); if (a + b > 99) a = 99 - b - R.int(0, 5); p = [a, b]; } else p = pair100(R, chance(R, 0.55), 99); }
    else p = pair100(R, chance(R, 0.85), L === 3 ? 100 : 99);
    a = p[0]; b = p[1];
    var s = a + b;
    if (shape === 'oops') {
      var ones = (a % 10) + (b % 10);
      if (ones < 10) { p = pair100(R, true, 99); a = p[0]; b = p[1]; s = a + b; ones = (a % 10) + (b % 10); }
      var wrong = s - 10, who = kids(R, 1)[0];
      return { q: who.n + ' says ' + m(a + ' + ' + b + ' = ' + wrong) + '. That is not right. What is ' + m(a + ' + ' + b) + '?', a: N(s), steps: ['Ones: ' + m((a % 10) + ' + ' + (b % 10) + ' = ' + ones) + '. That is 1 ten and ' + pl(ones - 10, 'one') + '.', 'Tens: ' + m(Math.floor(a / 10) + ' + ' + Math.floor(b / 10) + ' + 1 = ' + Math.floor(s / 10)) + ' tens. ' + who.n + ' forgot the new ten from the ones.', 'So ' + m(a + ' + ' + b + ' = ' + s) + '. Check: ' + m(a) + ' is about ' + Math.round(a / 10) * 10 + ' and ' + m(b) + ' is about ' + Math.round(b / 10) * 10 + ', so the sum should be about ' + (Math.round(a / 10) * 10 + Math.round(b / 10) * 10) + '.'], hint: 'Add the ones first. Do they make a new ten?' };
    }
    if (shape === 'miss') return { q: 'Fill in the box: ' + m(a + ' + ' + BOX + ' = ' + s), a: N(b), steps: ['Count up from ' + a + ' to ' + s + '.', 'To the next ten: ' + m(a + ' + ' + (10 - a % 10) + ' = ' + (a + 10 - a % 10)) + '. Then tens: ' + m((a + 10 - a % 10) + ' + ' + (Math.floor(s / 10) * 10 - (a + 10 - a % 10)) + ' = ' + Math.floor(s / 10) * 10) + '. Then ' + m(Math.floor(s / 10) * 10 + ' + ' + s % 10 + ' = ' + s) + '.', 'Add the jumps: ' + m((10 - a % 10) + ' + ' + (Math.floor(s / 10) * 10 - (a + 10 - a % 10)) + ' + ' + s % 10 + ' = ' + b) + '.', 'Check: ' + m(a + ' + ' + b + ' = ' + s) + '.'].filter(function (x) { return !/\+ 0 =/.test(x); }), hint: 'Count up from ' + a + ': first to the next ten.' };
    var viz = L === 1 ? { name: 'g2-blocks', opts: { groups: [{ n: a }, { n: b }], ring: true, label: 'Blocks for ' + a + ' in green and ' + b + ' in blue' } } : undefined;
    return { q: 'Add: ' + m(a + ' + ' + b + ' = ' + BOX), viz: viz, a: N(s), steps: addCols(a, b), hint: (a % 10) + (b % 10) >= 10 ? 'The ones make 10 or more. Trade 10 ones for a ten.' : 'Add the ones, then add the tens.' };
  });

  G('g2.subtract-within-100', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'sub', 'sub', R.pick(['sub', 'zero', 'hundred', 'miss', 'check']));
    var a, b, k = 0, brk = L === 1 ? chance(R, 0.6) : true;
    do { a = R.int(31, 98); b = R.int(L === 1 && chance(R, 0.3) ? 3 : 12, a - 8); k++; } while (k < 200 && ((a % 10 < b % 10) !== brk || b % 10 === 0 || a - b < 4));
    if (shape === 'zero') { a = 10 * R.int(4, 9); b = R.int(11, a - 6); if (b % 10 === 0) b += R.int(1, 4); }
    if (shape === 'hundred') { a = 100; b = R.int(12, 88); if (b % 10 === 0) b += 3; }
    var d = a - b;
    if (shape === 'miss') return { q: 'Fill in the box: ' + m(a + ' - ' + BOX + ' = ' + d), a: N(b), steps: ['Taking away the mystery number from ' + a + ' leaves ' + d + '.', 'So the mystery number is the difference between ' + a + ' and ' + d + ': ' + m(a + ' - ' + d + ' = ' + b) + '.', 'Check: ' + m(a + ' - ' + b + ' = ' + d) + '.'], hint: 'How far is it from ' + d + ' up to ' + a + '?' };
    if (shape === 'check') {
      var A = digits(a), B = digits(b), wrongD = 10 * Math.abs(A.t - B.t) + Math.abs(A.o - B.o), claim = R.coin() ? d : wrongD, who = kids(R, 1)[0];
      if (claim === d && wrongD === d) claim = d;
      return { q: who.n + ' says ' + m(a + ' - ' + b + ' = ' + claim) + '. Check by adding: is ' + who.p + ' right?', a: { t: 'tf', v: claim === d }, steps: ['Add back: ' + m(claim + ' + ' + b + ' = ' + (claim + b)) + '.', claim + b === a ? 'That makes ' + a + ', so ' + who.n + ' is right.' : 'That should make ' + a + ', but it makes ' + (claim + b) + '. So ' + who.n + ' is not right.', 'The answer is ' + m(a + ' - ' + b + ' = ' + d) + '.'], hint: 'Add your answer to ' + b + '. Do you get ' + a + '?' };
    }
    var viz = L === 1 ? { name: 'g2-blocks', opts: { n: a, label: 'Base-ten blocks for ' + a } } : undefined;
    return { q: 'Subtract: ' + m(a + ' - ' + b + ' = ' + BOX), viz: viz, a: N(d), steps: subCols(a, b), hint: a % 10 < b % 10 ? 'There are not enough ones. Break a ten into 10 ones.' : 'Take away the ones, then the tens.' };
  });

  G('g2.add-four-numbers', function (R, ctx) {
    var L = ctx.level, cnt = by(ctx, 3, R.pick([3, 4]), 4), nums = [], k = 0;
    do {
      nums = []; for (var i = 0; i < cnt; i++) nums.push(R.int(11, L === 1 ? 39 : 59));
      var os = nums.reduce(function (s, x) { return s + x % 10; }, 0), tot = U.sum(nums); k++;
    } while (k < 200 && ((L === 1 && (tot > 100 || os > 19)) || (L === 3 && os < 20) || tot > 200 || nums.some(function (x) { return x % 10 === 0; })));
    var tens = nums.map(function (x) { return 10 * Math.floor(x / 10); }), ones = nums.map(function (x) { return x % 10; }), ts = U.sum(tens), osum = U.sum(ones), total = ts + osum;
    var steps = ['Add the tens: ' + m(tens.join(' + ') + ' = ' + ts) + '.', 'Add the ones: ' + m(ones.join(' + ') + ' = ' + osum) + (osum >= 10 ? ' (that is ' + pl(Math.floor(osum / 10), 'ten') + ' and ' + pl(osum % 10, 'one') + ')' : '') + '.', 'Put them together: ' + m(ts + ' + ' + osum + ' = ' + total) + '.'];
    // friendly pair tip
    for (var x = 0; x < cnt; x++) for (var y = x + 1; y < cnt; y++) if ((ones[x] + ones[y]) % 10 === 0 && steps.length < 4) steps.splice(1, 0, 'Tip: ' + nums[x] + ' and ' + nums[y] + ' have ones that make a ten (' + m(ones[x] + ' + ' + ones[y] + ' = 10') + '). Looking for tens makes adding easier.');
    var viz = L === 1 ? { name: 'g2-blocks', opts: { groups: nums.map(function (v) { return { n: v }; }), label: 'Blocks for ' + U.list(nums.map(String)) + ' in different colors' } } : undefined;
    var things = R.pick([['pages', 'read'], ['points', 'scored'], ['cans', 'collected'], ['steps', 'counted']]), who = kids(R, 1)[0];
    var q = chance(R, 0.5) || L === 1 ? 'Add: ' + m(nums.join(' + ') + ' = ' + BOX) : who.n + ' ' + things[1] + ' ' + U.list(nums.map(String)) + ' ' + things[0] + ' on ' + ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].slice(0, cnt).join(', ').replace(/, ([^,]*)$/, ' and $1') + '. How many ' + things[0] + ' in all?';
    return { q: q, viz: viz, a: N(total), steps: steps, hint: 'Add all the tens, then all the ones.' };
  });

  G('g2.number-line-add-subtract', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['addLand', 'addLand', 'subLand']), R.pick(['subLand', 'dist', 'addLand']), R.pick(['dist', 'which', 'subLand', 'big']));
    var s, add, e, hops = [], tensJ, onesJ;
    function lineFor(a, b, extraPts) {
      var lo = Math.floor(Math.min(a, b) / 10) * 10, hi = Math.ceil(Math.max(a, b) / 10) * 10; if (hi === lo) hi += 10;
      if (hi - lo < 30) hi = lo + 30;
      var step = hi - lo <= 60 ? 1 : 5, labels = range(lo, hi, hi - lo <= 60 ? 10 : 20);
      if (labels[labels.length - 1] !== hi) labels.push(hi);
      return { min: lo, max: hi, step: step, labels: labels, hops: hops, points: extraPts };
    }
    if (shape === 'addLand' || shape === 'subLand') {
      var sub = shape === 'subLand';
      s = sub ? R.int(45, 95) : R.int(12, 58); add = R.int(13, 39); if (add % 10 === 0) add++;
      if (!sub && s + add > 99) s = 99 - add - R.int(0, 9);
      if (sub && s - add < 5) s = add + R.int(10, 40);
      tensJ = 10 * Math.floor(add / 10); onesJ = add % 10; var cur = s, dir = sub ? -1 : 1;
      for (var i = 0; i < tensJ / 10; i++) { hops.push({ from: cur, to: cur + dir * 10 }); cur += dir * 10; }
      if (onesJ) hops.push({ from: cur, to: cur + dir * onesJ }); cur += dir * onesJ; e = cur;
      return { q: 'Start at ' + s + '. Follow the jumps. Where do you land? Write the ' + (sub ? 'difference' : 'sum') + '.', viz: { name: 'g2-line', opts: lineFor(s, e, [{ v: s, text: String(s), color: 'blue' }, { v: e, text: '?' }]) }, a: N(e),
        steps: ['The jumps are ' + hops.map(function (h) { return (sub ? '−' : '+') + Math.abs(h.to - h.from); }).join(', ') + '. Together they ' + (sub ? 'take away ' : 'add ') + add + '.', hops.map(function (h) { return h.to; }).join(', ') + '.', 'So ' + m(s + (sub ? ' - ' : ' + ') + add + ' = ' + e) + '.'], hint: 'Do the big jumps first, then the small one.' };
    }
    if (shape === 'dist' || shape === 'big') {
      var big = shape === 'big';
      s = big ? R.int(120, 680) : R.int(14, 57); if (s % 10 === 0) s += 3;
      e = big ? s + R.int(124, 290) : s + R.int(18, 39); if (e % 10 === 0) e += 2;
      if (!big && e > 99) e = 99;
      var p1 = Math.ceil(s / 10) * 10, p2 = Math.floor(e / 10) * 10;
      if (big) { var q1 = Math.ceil(p1 / 100) * 100; hops = [{ from: s, to: p1 }]; if (q1 > p1 && q1 <= p2) hops.push({ from: p1, to: q1 }); else q1 = p1; var q2 = Math.floor(p2 / 100) * 100; if (q2 > q1) hops.push({ from: q1, to: q2 }); else q2 = q1; if (p2 > q2) hops.push({ from: q2, to: p2 }); if (e > p2) hops.push({ from: p2, to: e }); }
      else { hops = [{ from: s, to: p1 }]; if (p2 > p1) hops.push({ from: p1, to: p2 }); if (e > p2) hops.push({ from: p2, to: e }); }
      var d = e - s, sizes = hops.map(function (h) { return h.to - h.from; });
      var opts = big ? { min: Math.floor(s / 100) * 100, max: Math.ceil(e / 100) * 100, step: 10, labels: range(Math.floor(s / 100) * 100, Math.ceil(e / 100) * 100, 100), hops: hops, points: [{ v: s, text: String(s), color: 'blue' }, { v: e, text: String(e), color: 'red' }] } : lineFor(s, e, [{ v: s, text: String(s), color: 'blue' }, { v: e, text: String(e), color: 'red' }]);
      return { q: 'How far is it from ' + s + ' to ' + e + '? Add up the jumps. (This is ' + m(e + ' - ' + s) + '.)', viz: { name: 'g2-line', opts: opts }, a: N(d), steps: ['Jump to friendly numbers: ' + hops.map(function (h) { return h.from + ' to ' + h.to + ' is ' + (h.to - h.from); }).join('; ') + '.', 'Add the jumps: ' + m(sizes.join(' + ') + ' = ' + d) + '.', 'So ' + m(e + ' - ' + s + ' = ' + d) + '. Check: ' + m(s + ' + ' + d + ' = ' + e) + '.'], hint: 'Add the jump sizes together.' };
    }
    // which equation does the picture show
    s = R.int(15, 55); add = R.int(12, 38); if (add % 10 === 0) add++; var sb = R.coin();
    if (sb) s = s + add;
    tensJ = 10 * Math.floor(add / 10); onesJ = add % 10; var cur2 = s, dir2 = sb ? -1 : 1;
    for (var j = 0; j < tensJ / 10; j++) { hops.push({ from: cur2, to: cur2 + dir2 * 10 }); cur2 += dir2 * 10; }
    hops.push({ from: cur2, to: cur2 + dir2 * onesJ }); cur2 += dir2 * onesJ; e = cur2;
    var op = sb ? ' - ' : ' + ', right = s + op + add + ' = ' + e;
    var wr = [s + op + tensJ + ' = ' + (sb ? s - tensJ : s + tensJ), s + (sb ? ' + ' : ' - ') + add + ' = ' + (sb ? s + add : s - add), s + op + (add + 10) + ' = ' + (sb ? e - 10 : e + 10)];
    return { q: 'Which number sentence matches the jumps?', viz: { name: 'g2-line', opts: lineFor(s, e, [{ v: s, text: String(s), color: 'blue' }, { v: e, text: String(e), color: 'red' }]) }, a: mc('$' + right + '$', wr.map(function (w) { return '$' + w + '$'; })),
      steps: ['The jumps start at ' + s + ' and go ' + (sb ? 'left (taking away)' : 'right (adding)') + '.', 'The jumps are ' + hops.map(function (h) { return (sb ? '−' : '+') + Math.abs(h.to - h.from); }).join(', ') + ', which is ' + add + ' in all.', 'They end at ' + e + ', so the sentence is ' + m(right) + '.'], hint: 'Which way do the jumps go, and how far in all?' };
  });

  /* word problems: x + y = z, x and y are the parts */
  function story(R, type, x, y, ctx) {
    var z = x + y, ks = kids(R, 2), A = ks[0], B = ks[1], th = R.pick(THINGS), it = th[1], col = R.pick(['beads', 'marbles', 'blocks', 'buttons', 'crayons', 'balloons', 'cubes']);
    var S = {
      addRes: [A.n + ' has ' + x + ' ' + it + '. ' + A.P + ' gets ' + y + ' more. How many ' + it + ' does ' + A.n + ' have now?', z, x + ' + ' + y + ' = ' + BOX, 'Something is added to a group, so the group gets bigger: add.', 'whole'],
      addChange: [A.n + ' has ' + x + ' ' + it + '. ' + A.P + ' gets some more. Now ' + A.p + ' has ' + z + '. How many ' + it + ' did ' + A.n + ' get?', y, x + ' + ' + BOX + ' = ' + z, 'The start (' + x + ') and the end (' + z + ') are known. The part that was added is missing.', 'b'],
      addStart: ['At first, ' + A.n + ' had some ' + it + '. Then ' + A.p + ' got ' + y + ' more. Now ' + A.p + ' has ' + z + '. How many ' + it + ' did ' + A.n + ' have at first?', x, BOX + ' + ' + y + ' = ' + z, 'The start is missing. The ' + y + ' that came is one part, and ' + z + ' is the whole.', 'a'],
      takeRes: [A.n + ' has ' + z + ' ' + it + '. ' + A.P + ' gives ' + y + ' to ' + B.n + '. How many ' + it + ' does ' + A.n + ' have left?', x, z + ' - ' + y + ' = ' + BOX, 'Some are taken away, so the group gets smaller: subtract.', 'a'],
      takeChange: [A.n + ' had ' + z + ' ' + it + '. ' + A.P + ' gave some to ' + B.n + '. Now ' + A.p + ' has ' + x + ' left. How many did ' + A.n + ' give away?', y, z + ' - ' + BOX + ' = ' + x, 'The start (' + z + ') and what is left (' + x + ') are known. The part given away is missing.', 'b'],
      takeStart: ['At first, ' + A.n + ' had some ' + it + '. ' + A.P + ' gave ' + y + ' to ' + B.n + '. Now ' + A.p + ' has ' + x + ' left. How many ' + it + ' did ' + A.n + ' have at first?', z, BOX + ' - ' + y + ' = ' + x, 'The start is the whole: the ' + y + ' given away and the ' + x + ' left are its two parts.', 'whole'],
      putTotal: ['A box has ' + x + ' red ' + col + ' and ' + y + ' blue ' + col + '. How many ' + col + ' are in the box?', z, x + ' + ' + y + ' = ' + BOX, 'Two parts make the whole: add.', 'whole'],
      putPart: ['A box has ' + z + ' ' + col + '. ' + x + ' of them are red and the rest are blue. How many are blue?', y, x + ' + ' + BOX + ' = ' + z, 'The whole (' + z + ') and one part (' + x + ') are known. The other part is missing.', 'b'],
      cmpDiff: [A.n + ' has ' + z + ' ' + it + '. ' + B.n + ' has ' + x + ' ' + it + '. How many more ' + it + ' does ' + A.n + ' have than ' + B.n + '?', y, x + ' + ' + BOX + ' = ' + z, 'Compare: line up the two amounts. The extra piece is the difference.', 'diff'],
      cmpBigMore: [B.n + ' has ' + x + ' ' + it + '. ' + A.n + ' has ' + y + ' more ' + it + ' than ' + B.n + '. How many ' + it + ' does ' + A.n + ' have?', z, x + ' + ' + y + ' = ' + BOX, A.n + ' has the same as ' + B.n + ' and ' + y + ' more.', 'big'],
      cmpBigFewer: [B.n + ' has ' + x + ' ' + it + '. ' + B.n + ' has ' + y + ' fewer ' + it + ' than ' + A.n + '. How many ' + it + ' does ' + A.n + ' have?', z, x + ' + ' + y + ' = ' + BOX, 'If ' + B.n + ' has ' + y + ' fewer than ' + A.n + ', then ' + A.n + ' has ' + y + ' more than ' + B.n + '. The word "fewer" is in the story, but ' + A.n + ' has the bigger amount.', 'big'],
      cmpSmallFewer: [A.n + ' has ' + z + ' ' + it + '. ' + B.n + ' has ' + y + ' fewer ' + it + ' than ' + A.n + '. How many ' + it + ' does ' + B.n + ' have?', x, z + ' - ' + y + ' = ' + BOX, B.n + ' has ' + y + ' less than ' + A.n + '.', 'small'],
      cmpSmallMore: [A.n + ' has ' + z + ' ' + it + '. ' + A.n + ' has ' + y + ' more ' + it + ' than ' + B.n + '. How many ' + it + ' does ' + B.n + ' have?', x, BOX + ' + ' + y + ' = ' + z, 'If ' + A.n + ' has ' + y + ' more than ' + B.n + ', then ' + B.n + ' has ' + y + ' fewer. The word "more" is in the story, but you need the smaller amount.', 'small']
    }[type];
    var ans = S[1], unknown = S[4], tape;
    var isCmp = /^cmp/.test(type);
    if (!isCmp) tape = { tapes: [{ parts: [x, y], labels: [unknown === 'a' ? '?' : String(x), unknown === 'b' ? '?' : String(y)] }], braces: [{ tape: 0, from: 0, to: 2, label: unknown === 'whole' ? '?' : String(z) }] };
    else {
      var bigName = A.n, smallName = B.n;
      tape = { tapes: [{ parts: [x, y], labels: [unknown === 'big' ? '' : '', unknown === 'diff' ? '?' : String(y)], name: bigName }, { parts: [x], labels: [unknown === 'small' ? '?' : String(x)], name: smallName }], braces: [{ tape: 0, from: 0, to: 2, label: unknown === 'big' ? '?' : String(z) }] };
      tape.tapes[0].labels[0] = unknown === 'small' ? '?' : String(x);
    }
    var solve;
    if (unknown === 'whole' || unknown === 'big') solve = 'Add the parts: ' + m(x + ' + ' + y + ' = ' + z) + '.';
    else if (unknown === 'a' || unknown === 'small') solve = 'Find the missing part: ' + m(z + ' - ' + y + ' = ' + x) + '.';
    else solve = 'Find the missing part: ' + m(z + ' - ' + x + ' = ' + y) + '.';
    var check = unknown === 'whole' || unknown === 'big' ? 'Check: ' + m(z + ' - ' + y + ' = ' + x) + '.' : 'Check: ' + m(x + ' + ' + y + ' = ' + z) + '.';
    return { q: S[0], ans: ans, eq: S[2], idea: S[3], tape: tape, steps: ['Picture it. ' + S[3], 'A number sentence for the story: ' + m(S[2]) + '.', solve, check + ' The answer is ' + ans + '.'] };
  }
  function parts100(R, lo, maxZ) { for (var k = 0; k < 100; k++) { var x = R.int(lo, 70), y = R.int(lo, 60); if (x + y <= maxZ && x !== y) return [x, y]; } return [27, 18]; }
  G('g2.word-problems-100', function (R, ctx) {
    var L = ctx.level, type = by(ctx, R.pick(['addRes', 'takeRes', 'putTotal', 'cmpDiff']),
      R.pick(['addChange', 'addStart', 'takeChange', 'takeStart', 'putPart', 'cmpDiff', 'cmpBigMore', 'cmpSmallFewer']),
      R.pick(['addStart', 'takeStart', 'cmpBigFewer', 'cmpSmallMore', 'takeChange', 'putPart']));
    var p = parts100(R, L === 1 ? 6 : 11, L === 1 ? 80 : 99), S = story(R, type, p[0], p[1], ctx);
    var viz = L === 1 ? { name: 'tapediagram', opts: Object.assign({ controls: false, label: 'A tape diagram for the story, with a question mark for the unknown' }, S.tape) } : undefined;
    return { q: S.q, viz: viz, a: N(S.ans), steps: S.steps, hint: 'Picture what happens. Which number is missing: a part or the whole?' };
  });

  G('g2.two-step-word-problems', function (R, ctx) {
    var L = ctx.level, tpl = by(ctx, R.pick(['bus', 'combineRemove']), R.pick(['bus', 'combineRemove', 'moreTogether', 'fewerTogether', 'compareTotal']), R.pick(['moreTogether', 'fewerTogether', 'compareTotal', 'startUnknown']));
    var ks = kids(R, 2), A = ks[0], B = ks[1], q, s1, s2, ans, a, b, d, k = 0;
    if (tpl === 'bus') {
      do { a = R.int(25, 60); b = R.int(8, 20); d = R.int(6, 25); k++; } while (k < 50 && a - b + d > 99);
      ans = a - b + d;
      q = 'A bus has ' + a + ' people on it. At the first stop, ' + b + ' people get off and ' + d + ' people get on. How many people are on the bus now?';
      s1 = ['Step 1: ' + b + ' get off: ' + m(a + ' - ' + b + ' = ' + (a - b)) + '.', 'Step 2: ' + d + ' get on: ' + m((a - b) + ' + ' + d + ' = ' + ans) + '.'];
    } else if (tpl === 'combineRemove') {
      do { a = R.int(15, 45); b = R.int(12, 40); d = R.int(8, 30); k++; } while (k < 50 && (a + b > 99 || d >= a + b - 5));
      ans = a + b - d;
      q = 'There are ' + a + ' red balloons and ' + b + ' blue balloons at a party. Then ' + d + ' balloons pop. How many balloons are left?';
      s1 = ['Step 1: find all the balloons: ' + m(a + ' + ' + b + ' = ' + (a + b)) + '.', 'Step 2: take away the ones that popped: ' + m((a + b) + ' - ' + d + ' = ' + ans) + '.'];
    } else if (tpl === 'moreTogether') {
      do { a = R.int(14, 40); d = R.int(5, 20); k++; } while (k < 50 && 2 * a + d > 99);
      ans = a + (a + d);
      q = A.n + ' has ' + a + ' shells. ' + B.n + ' has ' + d + ' more shells than ' + A.n + '. How many shells do they have together?';
      s1 = ['Step 1: find how many ' + B.n + ' has: ' + m(a + ' + ' + d + ' = ' + (a + d)) + '.', 'Step 2: put both together: ' + m(a + ' + ' + (a + d) + ' = ' + ans) + '.'];
    } else if (tpl === 'fewerTogether') {
      do { a = R.int(20, 50); d = R.int(5, 18); k++; } while (k < 50 && (2 * a - d > 99 || a - d < 5));
      ans = a + (a - d);
      q = A.n + ' read ' + a + ' pages. ' + B.n + ' read ' + d + ' fewer pages than ' + A.n + '. How many pages did they read in all?';
      s1 = ['Step 1: find how many pages ' + B.n + ' read: ' + m(a + ' - ' + d + ' = ' + (a - d)) + '.', 'Step 2: add both: ' + m(a + ' + ' + (a - d) + ' = ' + ans) + '.'];
    } else if (tpl === 'compareTotal') {
      do { a = R.int(15, 45); b = R.int(12, 40); d = R.int(15, 60); k++; } while (k < 50 && (a + b > 99 || a + b - d < 3 || d >= a + b));
      ans = a + b - d;
      q = A.n + ' scored ' + a + ' points in the first game and ' + b + ' points in the second game. ' + B.n + ' scored ' + d + ' points in all. How many more points did ' + A.n + ' score than ' + B.n + '?';
      s1 = ['Step 1: find ' + A.n + '’s total: ' + m(a + ' + ' + b + ' = ' + (a + b)) + '.', 'Step 2: compare: ' + m((a + b) + ' - ' + d + ' = ' + ans) + '.'];
    } else {
      do { a = R.int(20, 50); b = R.int(10, 30); d = R.int(8, 25); k++; } while (k < 50 && (a + b > 99 || a + b - d < 5));
      var now = a + b - d; ans = a;
      q = A.n + ' had some stickers. ' + A.P + ' got ' + b + ' more, and then gave ' + d + ' to ' + B.n + '. Now ' + A.n + ' has ' + now + ' stickers. How many stickers did ' + A.n + ' have at first?';
      s1 = ['Work backward. Before giving ' + d + ' away, ' + A.n + ' had ' + m(now + ' + ' + d + ' = ' + (now + d)) + '.', 'Before getting ' + b + ' more, ' + A.p + ' had ' + m((now + d) + ' - ' + b + ' = ' + ans) + '.'];
    }
    s2 = s1.concat(['The question asks for the final number, so the answer is ' + ans + ' (not the number from step 1).']);
    return { q: q, a: N(ans), steps: s2, hint: 'Find the number the story does not tell you first. Then answer the question.' };
  });

  /* ================================================================ unit: add and subtract within 1,000 */
  function pair1000(R, wantO, wantT, small) {
    for (var k = 0; k < 400; k++) {
      var a = R.int(101, 899), b = small && chance(R, 0.3) ? R.int(12, 98) : R.int(101, 899);
      if (a + b > 999) continue;
      var nt = needsTrade(a, b);
      if (wantO !== null && nt.o !== wantO) continue;
      if (wantT !== null && nt.t !== wantT) continue;
      return [a, b];
    }
    return [367, 258];
  }
  G('g2.add-3-digit', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'add', R.pick(['add', 'add', 'word']), R.pick(['add', 'k1000', 'oops', 'word']));
    var p;
    if (L === 1) { var r = R.pick([0, 1, 2]); p = pair1000(R, r === 1, r === 2, true); }
    else if (L === 2) p = pair1000(R, chance(R, 0.75), chance(R, 0.6), false);
    else p = pair1000(R, true, true, false);
    var a = p[0], b = p[1], s = a + b;
    if (shape === 'k1000') { a = R.int(101, 899); if (a % 10 === 0) a += 3; b = 1000 - a; s = 1000; }
    if (shape === 'oops') {
      var A = digits(a), B = digits(b); if (A.o + B.o < 10) { p = pair1000(R, true, null, false); a = p[0]; b = p[1]; s = a + b; A = digits(a); B = digits(b); }
      var ones = A.o + B.o, wrong = String(A.h + B.h) + String(A.t + B.t) + String(ones), who = kids(R, 1)[0];
      return { q: who.n + ' added ' + m(a + ' + ' + b) + ' and wrote ' + m(c(Number(wrong))) + '. Something went wrong. What is the right sum?', a: N(s), steps: [who.n + ' wrote all of ' + ones + ' in the ones place. A place can hold only one digit.', 'Ones: ' + ones + ' is 1 ten and ' + pl(ones - 10, 'one') + '. Write ' + (ones - 10) + ' and trade 10 ones for a ten.'].concat(addCols(a, b).slice(1)).concat(['Check: ' + a + ' is about ' + Math.round(a / 100) * 100 + ' and ' + b + ' is about ' + Math.round(b / 100) * 100 + ', so the sum must be close to ' + c(Math.round(a / 100) * 100 + Math.round(b / 100) * 100) + ', not in the thousands.']), hint: 'Add the ones first. Is it 10 or more?' };
    }
    if (shape === 'word') {
      var ctxs = [['A school library has ' + a + ' picture books and ' + b + ' chapter books. How many books is that?', 'books'], ['On Saturday ' + a + ' people visited the zoo. On Sunday ' + b + ' people visited. How many people visited in the two days?', 'people'], ['A farmer picked ' + a + ' apples on Monday and ' + b + ' apples on Tuesday. How many apples did the farmer pick?', 'apples']];
      var w = R.pick(ctxs);
      return { q: w[0], a: N(s), steps: ['Put the two amounts together: ' + m(a + ' + ' + b) + '.'].concat(addCols(a, b)), hint: 'Add the ones, then the tens, then the hundreds.' };
    }
    return { q: 'Add: ' + m(c(a) + ' + ' + c(b) + ' = ' + BOX), a: N(s), steps: addCols(a, b), hint: 'Add the ones, then the tens, then the hundreds. Trade when a place gets 10 or more.' };
  });

  function pairSub(R, wantO, wantT) {
    for (var k = 0; k < 400; k++) {
      var a = R.int(200, 999), b = R.int(101, a - 20);
      var nb = needsBreak(a, b);
      if (wantO !== null && nb.o !== wantO) continue;
      if (wantT !== null && nb.t !== wantT) continue;
      return [a, b];
    }
    return [532, 175];
  }
  G('g2.subtract-3-digit', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'sub', R.pick(['sub', 'sub', 'word']), R.pick(['zeros', 'zeros', 'check', 'sub']));
    var p;
    if (L === 1) { var r = R.pick([0, 1, 2]); p = pairSub(R, r === 1, r === 2); }
    else p = pairSub(R, chance(R, 0.8) ? true : null, chance(R, 0.7));
    var a = p[0], b = p[1];
    if (shape === 'zeros') {
      var z = R.pick(['h00', 'h0o', 'k']);
      if (z === 'h00') { a = 100 * R.int(3, 9); b = R.int(112, a - 30); }
      else if (z === 'h0o') { a = 100 * R.int(3, 9) + R.int(1, 5); b = R.int(112, a - 30); if (b % 10 <= a % 10) b += (a % 10) - (b % 10) + R.int(1, 3); if (b >= a) b = a - 37; }
      else { a = 1000; b = R.int(105, 895); }
      if (b % 10 === 0) b += 7;
    }
    var d = a - b;
    if (shape === 'check') {
      var A = digits(a), B = digits(b); var nb = needsBreak(a, b);
      if (!nb.o && !nb.t) { p = pairSub(R, true, true); a = p[0]; b = p[1]; d = a - b; A = digits(a); B = digits(b); }
      // forgot to lower the hundreds after breaking a hundred, or subtracted smaller from bigger
      var wrong = R.coin() ? d + 100 : 100 * Math.abs(A.h - B.h) + 10 * Math.abs(A.t - B.t) + Math.abs(A.o - B.o);
      if (wrong === d) wrong = d + 100;
      var claim = R.coin() ? d : wrong, who = kids(R, 1)[0];
      return { q: who.n + ' says ' + m(a + ' - ' + b + ' = ' + claim) + '. Add to check. Is ' + who.p + ' right?', a: { t: 'tf', v: claim === d }, steps: ['Add back: ' + m(claim + ' + ' + b + ' = ' + c(claim + b)) + '.', claim + b === a ? 'That makes ' + a + ', so ' + who.n + ' is right.' : 'It should make ' + a + ', so ' + who.n + ' is not right.', 'The difference is ' + m(a + ' - ' + b + ' = ' + d) + '.'], hint: 'Add ' + who.q + ' answer to ' + b + '.' };
    }
    if (shape === 'word') {
      var w = R.pick([['A school has ' + a + ' students. ' + b + ' of them are on a field trip. How many students are still at school?'], ['A store had ' + a + ' pencils. It sold ' + b + ' of them. How many pencils are left?'], ['A tree had ' + a + ' leaves. ' + b + ' leaves fell off. How many leaves are still on the tree?']]);
      return { q: w[0], a: N(d), steps: ['Take away: ' + m(a + ' - ' + b) + '.'].concat(subCols(a, b)), hint: 'Start with the ones. Break a ten or a hundred if a place is short.' };
    }
    return { q: 'Subtract: ' + m(c(a) + ' - ' + c(b) + ' = ' + BOX), a: N(d), steps: subCols(a, b), hint: 'Start with the ones. If there are not enough, break a ten (or a hundred).' };
  });

  G('g2.explain-strategies', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['comp', 'split', 'checkAdd']), R.pick(['comp', 'compSub', 'countUp', 'digitsTrap']), R.pick(['compSub', 'countUp', 'digitsTrap', 'why', 'comp']));
    var a, b, k = 0, ks = kids(R, 1), who = ks[0];
    if (shape === 'comp') {
      var near = R.pick([98, 99, 97, 198, 199, 298, 399, 498]), gap = (Math.ceil(near / 100) * 100) - near; a = near; b = R.int(123, 489); if (a + b > 999) b = 999 - a - R.int(0, 50);
      if (L === 1) { a = R.pick([98, 99, 97, 198, 199]); gap = Math.ceil(a / 100) * 100 - a; b = R.int(115, 389); }
      var A2 = a + gap, B2 = b - gap;
      return { q: 'To find ' + m(a + ' + ' + b) + ', ' + who.n + ' moves ' + gap + ' from ' + b + ' over to ' + a + '. Fill in the box: ' + m(a + ' + ' + b + ' = ' + A2 + ' + ' + BOX), a: N(B2), steps: [m(a + ' + ' + gap + ' = ' + A2) + ', a friendly number.', 'The ' + gap + ' came out of ' + b + ', so ' + m(b + ' - ' + gap + ' = ' + B2) + '.', 'Nothing was added or lost, so the total is the same: ' + m(A2 + ' + ' + B2 + ' = ' + (a + b)) + '.'], hint: 'What is left of ' + b + ' after giving away ' + gap + '?' };
    }
    if (shape === 'split') {
      do { a = R.int(111, 499); b = R.int(111, 499); k++; } while (k < 80 && (needsTrade(a, b).o || needsTrade(a, b).t || digits(a).t + digits(b).t === 0 || digits(a).o + digits(b).o === 0));
      var A = digits(a), B = digits(b), miss = R.pick(['h', 't', 'o']);
      var H = 100 * (A.h + B.h), Tt = 10 * (A.t + B.t), O = A.o + B.o, partsS = { h: H, t: Tt, o: O };
      var shown = ['h', 't', 'o'].map(function (p) { return p === miss ? BOX : partsS[p]; }).join(' + ');
      return { q: who.n + ' adds ' + m(a + ' + ' + b) + ' by adding hundreds, tens and ones. Fill in the box: ' + m(shown + ' = ' + (a + b)), a: N(partsS[miss]), steps: ['Hundreds: ' + m(100 * A.h + ' + ' + 100 * B.h + ' = ' + H) + '.', 'Tens: ' + m(10 * A.t + ' + ' + 10 * B.t + ' = ' + Tt) + '.', 'Ones: ' + m(A.o + ' + ' + B.o + ' = ' + O) + '.', 'The missing part is ' + partsS[miss] + ', and ' + m(H + ' + ' + Tt + ' + ' + O + ' = ' + (a + b)) + '.'], hint: 'Add only the ' + { h: 'hundreds', t: 'tens', o: 'ones' }[miss] + '.' };
    }
    if (shape === 'checkAdd') {
      a = 100 * R.int(3, 9); b = R.int(112, a - 50); var d = a - b;
      return { q: who.n + ' found ' + m(a + ' - ' + b + ' = ' + d) + '. Which addition checks the answer?', a: mc('$' + d + ' + ' + b + '$', ['$' + a + ' + ' + b + '$', '$' + d + ' + ' + a + '$', '$' + d + ' - ' + b + '$']), steps: ['Subtraction finds a missing part: ' + b + ' and ' + d + ' should be the two parts of ' + a + '.', 'So add the parts: ' + m(d + ' + ' + b) + '.', 'It makes ' + m(d + ' + ' + b + ' = ' + (d + b)) + ', so the answer checks out.'], hint: 'The answer plus the number taken away should give the number you started with.' };
    }
    if (shape === 'compSub') {
      var m2 = R.pick([198, 199, 298, 299, 397, 98, 99]), gap2 = Math.ceil(m2 / 100) * 100 - m2, round2 = m2 + gap2; a = R.int(round2 + 105, 989); if (a % 10 === 0) a += 3;
      var mid = a - round2;
      return { q: 'To find ' + m(a + ' - ' + m2) + ', ' + who.n + ' first finds ' + m(a + ' - ' + round2 + ' = ' + mid) + '. What should ' + who.p + ' do next?', a: mc('Add ' + gap2 + ', because ' + who.p + ' took away ' + gap2 + ' too many', ['Take away ' + gap2 + ' more, because ' + m2 + ' is less than ' + round2, 'Nothing: ' + mid + ' is the answer', 'Add ' + round2 + ' back']), steps: [who.P + ' was asked to take away ' + m2 + ' but took away ' + round2 + ', which is ' + gap2 + ' too many.', 'Give back the extra ' + gap2 + ': ' + m(mid + ' + ' + gap2 + ' = ' + (a - m2)) + '.', 'So ' + m(a + ' - ' + m2 + ' = ' + (a - m2)) + '. Check: ' + m((a - m2) + ' + ' + m2 + ' = ' + a) + '.'], hint: 'Did ' + who.p + ' take away too many or too few?' };
    }
    if (shape === 'countUp') {
      b = R.int(112, 468); if (b % 10 === 0) b += 4; a = 100 * R.int(Math.floor(b / 100) + 2, 9);
      var t1 = Math.ceil(b / 10) * 10, t2 = Math.ceil(t1 / 100) * 100, j1 = t1 - b, j2 = t2 - t1, j3 = a - t2, jumps = [j1, j2, j3].filter(Boolean), stops = [b, t1, t2, a].filter(function (v, i, arr) { return i === 0 || v !== arr[i - 1]; });
      return { q: who.n + ' finds ' + m(a + ' - ' + b) + ' by counting up from ' + b + ': ' + stops.join(' → ') + '. What is ' + m(a + ' - ' + b) + '?', a: N(a - b), steps: ['The jumps are ' + jumps.join(', ') + '.', 'Add the jumps: ' + m(jumps.join(' + ') + ' = ' + (a - b)) + '.', 'Counting up works because subtraction finds the distance between two numbers. Check: ' + m(b + ' + ' + (a - b) + ' = ' + a) + '.'], hint: 'Add up the sizes of the jumps.' };
    }
    if (shape === 'digitsTrap') {
      do { a = R.int(312, 952); b = R.int(118, a - 60); k++; } while (k < 100 && !(digits(a).o < digits(b).o));
      var Aa = digits(a), Bb = digits(b), wrongT = 100 * Math.abs(Aa.h - Bb.h) + 10 * Math.abs(Aa.t - Bb.t) + Math.abs(Aa.o - Bb.o);
      return { q: who.n + ' says ' + m(a + ' - ' + b + ' = ' + wrongT) + ' because ' + who.p + ' took the smaller digit from the bigger one in each place. What is ' + m(a + ' - ' + b) + ' really?', a: N(a - b), steps: ['In the ones place you must take ' + Bb.o + ' away from ' + Aa.o + ', not ' + Aa.o + ' from ' + Bb.o + '. There are not enough ones, so break a ten.'].concat(subCols(a, b).slice(1)), hint: 'Always take the bottom number away from the top number. Break a ten if needed.' };
    }
    // why
    var Q = R.pick([
      ['Why can you trade 10 tens for 1 hundred when you add?', 'Because 10 tens and 1 hundred are the same amount', ['Because hundreds are bigger blocks', 'Because you always carry a 1', 'Because the tens place is full after 5 tens'], ['10 tens is ' + m('10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 = 100') + '.', 'So trading 10 tens for 1 hundred keeps the total the same. It only lets you write the number with one digit in each place.']],
      ['When you break 1 ten into 10 ones to subtract, what happens to the number?', 'It stays the same; it is just shown in a new way', ['It gets 10 bigger', 'It gets 1 smaller', 'It gets 9 smaller'], ['1 ten and 10 ones are the same amount.', 'For example, 52 is 5 tens and 2 ones, and it is also 4 tens and 12 ones: ' + m('40 + 12 = 52') + '.']],
      ['Why does adding ' + m('300 + 200') + ' help you find ' + m('342 + 215') + '?', 'Because 342 has 3 hundreds and 215 has 2 hundreds, so they make 5 hundreds', ['Because you can skip the tens and ones', 'Because 300 + 200 is the answer', 'Because you should always round'], ['Adding by place value adds hundreds to hundreds, tens to tens and ones to ones.', m('300 + 200 = 500') + ', ' + m('40 + 10 = 50') + ', ' + m('2 + 5 = 7') + ', so ' + m('342 + 215 = 557') + '.']]
    ]);
    return { q: Q[0], a: mc(Q[1], Q[2]), steps: Q[3], hint: 'Think about what the blocks would look like.' };
  });

  /* ================================================================ unit: measurement */
  var OBJ = ['pencil', 'crayon', 'ribbon', 'stick', 'straw'];
  G('g2.measure-length', function (R, ctx) {
    var L = ctx.level, unit = R.pick(['in', 'cm']), uw = unit === 'in' ? 'inches' : 'centimeters', u1 = unit === 'in' ? 'inch' : 'centimeter';
    var len = unit === 'in' ? R.int(6, 9) : R.int(10, 15), from, to, kind = R.pick(OBJ);
    var shape = by(ctx, 'zero', R.pick(['zero', 'mid']), R.pick(['mid', 'mid', 'oops']));
    if (shape === 'zero') { from = 0; to = R.int(2, len - 1); }
    else { from = R.int(1, Math.min(L === 3 ? 6 : 3, len - 3)); to = R.int(from + 2, len); }
    var L2 = to - from;
    if (shape === 'oops') {
      var who = kids(R, 1)[0]; from = 1; to = R.int(4, len); L2 = to - 1;
      return { q: who.n + ' lined up the ' + kind + ' with the 1 mark, read ' + to + ', and said it is ' + pl(to, u1, uw) + ' long. How long is it really?', viz: { name: 'g2-ruler', opts: { unit: unit, len: len, objs: [{ from: 1, to: to, kind: kind }], controls: false } }, a: N(L2), steps: ['A ruler starts at 0, not 1. From 0 to 1 is the first ' + u1 + '.', 'The ' + kind + ' starts at 1, so it covers the spaces from 1 to ' + to + ': ' + m(to + ' - 1 = ' + L2) + '.', 'It is ' + pl(L2, u1, uw) + ' long. ' + who.n + '’s answer was one too many.'], hint: 'Count the spaces under the ' + kind + ', not the marks.', unit: uw };
    }
    var steps = from === 0 ? ['The ' + kind + ' starts at 0.', 'Its other end is at ' + to + ', so it is ' + pl(to, u1, uw) + ' long.'] : ['The ' + kind + ' starts at ' + from + ', not at 0, so count the spaces under it.', 'From ' + from + ' to ' + to + ': ' + m(to + ' - ' + from + ' = ' + L2) + '.', 'It is ' + pl(L2, u1, uw) + ' long.'];
    var own = kids(R, 1)[0];
    return { q: R.pick([own.n + ' measured ' + own.q + ' ' + kind + '. How many ' + uw + ' long is it?', 'How long is ' + own.n + '\u2019s ' + kind + '? Write the number of ' + uw + '.', own.n + ' put ' + own.q + ' ' + kind + ' above a ruler. How long is the ' + kind + '?']), viz: { name: 'g2-ruler', opts: { unit: unit, len: len, objs: [{ from: from, to: to, kind: kind }], controls: false } }, a: N(L2), steps: steps, hint: from === 0 ? 'Read the number at the end of the ' + kind + '.' : 'It does not start at 0. Count the spaces it covers.', unit: uw };
  });

  G('g2.unit-size', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['moreNum', 'longerUnit']), R.pick(['convert', 'compare', 'moreNum']), R.pick(['compare', 'convert2', 'longerUnit', 'convert']));
    var PAIRS = [['inches', 'feet', 'an inch', 'a foot'], ['centimeters', 'meters', 'a centimeter', 'a meter'], ['centimeters', 'inches', 'a centimeter', 'an inch'], ['feet', 'yards', 'a foot', 'a yard']];
    var THINGS2 = ['a rug', 'a hallway', 'a table', 'a garden', 'a rope', 'a bookshelf'];
    if (shape === 'moreNum') {
      var P = R.pick(PAIRS), th = R.pick(THINGS2), who = kids(R, 1)[0];
      return { q: who.n + ' measures ' + th + ' two times: once in ' + P[0] + ' and once in ' + P[1] + '. Which measurement will be the bigger number?', a: mc('The number of ' + P[0], ['The number of ' + P[1], 'They will be the same number']), steps: [cap(P[2]) + ' is shorter than ' + P[3] + '.', 'It takes more short units than long units to cover the same length.', 'So the number of ' + P[0] + ' is bigger. The length did not change, only the size of the unit.'], hint: 'Which unit is smaller? You need more of the smaller one.' };
    }
    if (shape === 'longerUnit') {
      var U2 = R.pick([['paper clips', 'pencils', 5], ['inch tiles', 'foot-long rulers', 12], ['short sticks', 'long sticks', 3], ['cubes', 'rods', 10]]), nB = R.int(2, 5), nS = nB * U2[2], sw = R.coin(), who2 = kids(R, 1)[0];
      var unitA = sw ? U2[1] : U2[0], unitB = sw ? U2[0] : U2[1], nA = sw ? nB : nS, nB2 = sw ? nS : nB, longer = nA < nB2 ? unitA : unitB;
      return { q: who2.n + ' measures a desk. It is ' + nA + ' ' + unitA + ' long, or ' + nB2 + ' ' + unitB + ' long. Which unit is longer?', a: mc('The ' + longer.replace(/s$/, ''), ['The ' + (longer === unitA ? unitB : unitA).replace(/s$/, ''), 'They are the same length']), steps: ['The desk is the same length both times.', 'Fewer of a unit fit when the unit is longer.', 'Only ' + Math.min(nA, nB2) + ' ' + longer + ' fit, so the ' + longer.replace(/s$/, '') + ' is the longer unit.'], hint: 'Longer units: fewer of them fit.' };
    }
    if (shape === 'convert') {
      var kind = R.pick(['ft', 'yd', 'm']);
      if (kind === 'ft') { var f = R.int(2, 8); return { q: '1 foot is 12 inches. How many inches long is a board that is ' + f + ' feet long?', a: N(12 * f), steps: ['Each foot is 12 inches.', f + ' feet is ' + m(Array(f + 1).join('12 + ').slice(0, -3) + ' = ' + 12 * f) + '.', 'So ' + f + ' feet = ' + 12 * f + ' inches. More units, because inches are smaller.'], hint: 'Add 12 for each foot.', unit: 'inches' }; }
      if (kind === 'yd') { var y = R.int(2, 9); return { q: '1 yard is 3 feet. How many feet long is a rope that is ' + y + ' yards long?', a: N(3 * y), steps: ['Each yard is 3 feet.', y + ' yards is ' + m(Array(y + 1).join('3 + ').slice(0, -3) + ' = ' + 3 * y) + '.', 'So ' + y + ' yards = ' + 3 * y + ' feet.'], hint: 'Count by 3s, once for each yard.', unit: 'feet' }; }
      var mm = R.int(2, 9); return { q: '1 meter is 100 centimeters. How many centimeters long is a path that is ' + mm + ' meters long?', a: N(100 * mm), steps: ['Each meter is 100 centimeters.', 'Count by hundreds: ' + range(100, 100 * mm, 100).join(', ') + '.', 'So ' + mm + ' meters = ' + 100 * mm + ' centimeters.'], hint: 'Count by 100s, once for each meter.', unit: 'centimeters' };
    }
    if (shape === 'convert2') {
      var f2 = R.int(1, 5), in2 = R.int(1, 11); return { q: 'A plant is ' + pl(f2, 'foot', 'feet') + ' and ' + pl(in2, 'inch', 'inches') + ' tall. How many inches tall is it? (1 foot is 12 inches.)', a: N(12 * f2 + in2), steps: [pl(f2, 'foot', 'feet') + ' is ' + 12 * f2 + ' inches.', 'Add the other ' + in2 + ': ' + m(12 * f2 + ' + ' + in2 + ' = ' + (12 * f2 + in2)) + '.', 'It is ' + (12 * f2 + in2) + ' inches tall.'], hint: 'Change the feet into inches first.', unit: 'inches' };
    }
    // compare two lengths in different units
    var C2 = R.pick([
      function () { var f = R.int(2, 4), i = 12 * f + R.pick([-6, -3, 3, 6, 0]); return [i + ' inches', pl(f, 'foot', 'feet'), i, 12 * f, pl(f, 'foot', 'feet') + ' is ' + 12 * f + ' inches']; },
      function () { var mt = R.int(1, 3), cm = 100 * mt + R.pick([-30, -10, 20, 40, 0]); return [cm + ' centimeters', pl(mt, 'meter'), cm, 100 * mt, pl(mt, 'meter') + ' is ' + 100 * mt + ' centimeters']; },
      function () { var yd = R.int(1, 4), ft = 3 * yd + R.pick([-1, 1, 2, 0]); return [ft + ' feet', pl(yd, 'yard'), ft, 3 * yd, pl(yd, 'yard') + ' is ' + 3 * yd + ' feet']; }
    ])();
    var right = C2[2] > C2[3] ? C2[0] : C2[2] < C2[3] ? C2[1] : 'They are the same length';
    return { q: 'Which is longer: ' + C2[0] + ' or ' + C2[1] + '?', a: mcKeep([C2[0], C2[1], 'They are the same length'], C2[2] > C2[3] ? 0 : C2[2] < C2[3] ? 1 : 2), steps: ['Use the same unit for both. ' + cap(C2[4]) + '.', 'Compare ' + C2[2] + ' and ' + C2[3] + '.', C2[2] === C2[3] ? 'They are equal, so the lengths are the same.' : 'So <b>' + right + '</b> is longer. A bigger number does not always mean longer: check the units.'], hint: 'Change both to the smaller unit, then compare.' };
  });

  var EST = [
    ['a new crayon', 'long', '4 inches', ['4 feet', '40 inches', '4 yards']],
    ['a new pencil', 'long', '7 inches', ['7 feet', '7 yards', '70 inches']],
    ['a classroom door', 'tall', '2 meters', ['2 centimeters', '20 meters', '2 inches']],
    ['a paper clip', 'long', '3 centimeters', ['3 meters', '3 feet', '30 inches']],
    ['a school bus', 'long', '12 meters', ['12 centimeters', '12 inches', '120 meters']],
    ['a bed', 'long', '2 meters', ['2 centimeters', '20 meters', '2 inches']],
    ['a sheet of paper', 'long', '11 inches', ['11 feet', '11 yards', '1 inch']],
    ['a kitchen table', 'tall', '30 inches', ['30 feet', '3 inches', '30 yards']],
    ['a car', 'long', '4 meters', ['4 centimeters', '40 meters', '4 inches']],
    ['a ladybug', 'long', '1 centimeter', ['1 meter', '1 foot', '1 yard']],
    ['a fork', 'long', '7 inches', ['7 feet', '7 yards', '70 inches']],
    ['a basketball hoop', 'high off the ground', '10 feet', ['10 inches', '100 feet', '10 centimeters']],
    ['a soccer ball', 'across', '22 centimeters', ['22 meters', '2 centimeters', '22 yards']],
    ['a big dog', 'tall', '2 feet', ['2 inches', '20 feet', '2 yards']]
  ];
  var BESTU = [['the length of a soccer field', 'meters', 'centimeters'], ['the length of an ant', 'centimeters', 'meters'], ['the length of your shoe', 'inches', 'yards'], ['the length of a hallway', 'feet', 'inches'], ['the width of a book', 'centimeters', 'meters'], ['the height of a tree', 'feet', 'inches'], ['the length of a pencil', 'centimeters', 'meters'], ['how far you can throw a ball', 'meters', 'centimeters']];
  G('g2.estimate-length', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['about', 'unit']), R.pick(['about', 'tf', 'guess']), R.pick(['guess', 'about', 'tf']));
    if (shape === 'about') { var e = R.pick(EST); return { q: 'About how ' + e[1].split(' ')[0] + ' is ' + e[0] + (e[1].indexOf(' ') > 0 ? ' ' + e[1].split(' ').slice(1).join(' ') : '') + '? Pick the best estimate.', a: mc(e[2], e[3]), steps: ['Think of benchmarks: 1 centimeter is about the width of a fingertip, 1 inch is about the width of a quarter, 1 foot is about the length of a sheet of paper, and 1 meter is about one big step.', cap(e[0]) + ' is about ' + e[2] + ' ' + e[1] + '.', 'The other choices are much too big or much too small.'], hint: 'Picture the thing next to a ruler or a meter stick.' }; }
    if (shape === 'unit') { var b = R.pick(BESTU); return { q: 'Which unit is better for measuring ' + b[0] + ': ' + b[1] + ' or ' + b[2] + '?', a: mc(cap(b[1]), [cap(b[2])]), steps: ['Small things: use small units (centimeters, inches). Big things: use big units (meters, feet, yards).', 'For ' + b[0] + ', ' + b[1] + ' fit best. With ' + b[2] + ', the number would be ' + (/meters|yards|feet/.test(b[2]) && !/centi/.test(b[2]) ? 'too tiny to be useful.' : 'very large and hard to measure.')], hint: 'Is the thing small or big?' }; }
    if (shape === 'tf') {
      var e2 = R.pick(EST), good = R.coin(), est = good ? e2[2] : R.pick(e2[3]);
      return { q: 'True or false: ' + cap(e2[0]) + ' is about ' + est + ' ' + e2[1] + '.', a: { t: 'tf', v: good }, steps: [cap(e2[0]) + ' is about ' + e2[2] + ' ' + e2[1] + '.', good ? 'So the statement is <b>true</b>.' : est + ' is ' + (est === e2[3][0] || /0 /.test(est) ? 'far off' : 'far off') + ', so the statement is <b>false</b>.'], hint: 'Compare it with a ruler (1 foot) or a big step (1 meter).' };
    }
    // guess vs measure
    var unit = R.pick(['in', 'cm']), uw = unit === 'in' ? 'inches' : 'centimeters', len = unit === 'in' ? 9 : 15, kind = R.pick(OBJ), real = R.int(3, len - 1), guess = real + R.pick([-3, -2, -1, 1, 2, 3, 4]), who = kids(R, 1)[0];
    if (guess < 1) guess = real + 2;
    return { q: who.n + ' guessed the ' + kind + ' is ' + guess + ' ' + uw + ' long. Then ' + who.p + ' measured it. How far off was the guess?', viz: { name: 'g2-ruler', opts: { unit: unit, len: len, objs: [{ from: 0, to: real, kind: kind }], controls: false } }, a: N(Math.abs(real - guess)), steps: ['The ruler shows the ' + kind + ' is ' + real + ' ' + uw + ' long.', 'The guess was ' + guess + '. The difference: ' + m(Math.max(real, guess) + ' - ' + Math.min(real, guess) + ' = ' + Math.abs(real - guess)) + '.', 'The guess was ' + Math.abs(real - guess) + ' ' + (Math.abs(real - guess) === 1 ? (unit === 'in' ? 'inch' : 'centimeter') : uw) + ' too ' + (guess > real ? 'long' : 'short') + '.'], hint: 'Measure first, then find the difference.', unit: uw };
  });

  G('g2.how-much-longer', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'pic', R.pick(['pic', 'text']), R.pick(['picOff', 'textShort', 'text']));
    var unit = R.pick(['in', 'cm']), uw = unit === 'in' ? 'inches' : 'centimeters', u1 = unit === 'in' ? 'inch' : 'centimeter';
    var k2 = R.sample(OBJ, 2), A, B;
    if (shape === 'pic' || shape === 'picOff') {
      var len = unit === 'in' ? 9 : 15; A = R.int(4, len); B = R.int(2, A - 1);
      var fa = 0, fb = 0;
      if (shape === 'picOff') { fa = R.int(0, 2); fb = R.int(1, 3); A = R.int(fa + 4, len) - fa; B = R.int(2, A - 1); if (fb + B > len) fb = len - B; }
      var top = R.coin(), objs = top ? [{ from: fa, to: fa + A, kind: k2[0] }, { from: fb, to: fb + B, kind: k2[1] }] : [{ from: fb, to: fb + B, kind: k2[1] }, { from: fa, to: fa + A, kind: k2[0] }];
      var steps = shape === 'picOff' ? ['Measure each one. The ' + k2[0] + ' goes from ' + fa + ' to ' + (fa + A) + ': ' + m((fa + A) + ' - ' + fa + ' = ' + A) + '. The ' + k2[1] + ' goes from ' + fb + ' to ' + (fb + B) + ': ' + m((fb + B) + ' - ' + fb + ' = ' + B) + '.'] : ['The ' + k2[0] + ' is ' + pl(A, u1, uw) + ' long. The ' + k2[1] + ' is ' + pl(B, u1, uw) + ' long.'];
      steps.push('Compare by subtracting: ' + m(A + ' - ' + B + ' = ' + (A - B)) + '.');
      steps.push('The ' + k2[0] + ' is ' + pl(A - B, u1, uw) + ' longer.');
      return { q: 'How much longer is the ' + k2[0] + ' than the ' + k2[1] + '?', viz: { name: 'g2-ruler', opts: { unit: unit, len: len, objs: objs, controls: false } }, a: N(A - B), steps: steps, hint: 'Find each length, then subtract the shorter from the longer.', unit: uw };
    }
    var jk = kids(R, 2), TH = [[['red ribbon', 'blue ribbon'], ['centimeters', 'inches']], [['snake at the zoo', 'lizard at the zoo'], ['inches', 'centimeters']], [[jk[0].n + '\u2019s jump', jk[1].n + '\u2019s jump'], ['inches', 'centimeters']], [['green rope', 'yellow rope'], ['feet', 'meters']], [['tall plant', 'short plant'], ['centimeters', 'inches']]], pickT = R.pick(TH), things = pickT[0], uu = R.pick(pickT[1]), U3 = [uu, { centimeters: 'centimeter', inches: 'inch', feet: 'foot', meters: 'meter' }[uu]];
    A = R.int(30, 95); B = R.int(12, A - 8);
    if (U3[0] === 'feet' || U3[0] === 'meters') { A = R.int(20, 60); B = R.int(9, A - 5); }
    var shorter = shape === 'textShort';
    var art = function (t) { return /\u2019s/.test(t) ? t : 'the ' + t; };
    return { q: cap(art(things[0])) + ' is ' + A + ' ' + U3[0] + ' long. ' + cap(art(things[1])) + ' is ' + B + ' ' + U3[0] + ' long. How much ' + (shorter ? 'shorter is ' + art(things[1]) + ' than ' + art(things[0]) : 'longer is ' + art(things[0]) + ' than ' + art(things[1])) + '?', a: N(A - B), steps: ['Both lengths are in ' + U3[0] + ', so you can compare them.', (shorter ? '"How much shorter" ' : '"How much longer" ') + 'asks for the difference: ' + m(A + ' - ' + B + ' = ' + (A - B)) + '.', 'Check: ' + m(B + ' + ' + (A - B) + ' = ' + A) + '. The answer is ' + pl(A - B, U3[1], U3[0]) + '.'], hint: 'Subtract the shorter length from the longer one.', unit: U3[0] };
  });

  G('g2.length-word-problems', function (R, ctx) {
    var L = ctx.level, tpl = by(ctx, R.pick(['join', 'cut', 'grow']), R.pick(['join', 'cut', 'startUnknown', 'compareMore', 'grow']), R.pick(['startUnknown', 'three', 'cutTwo', 'compareMore']));
    var UNITS = { join: ['inches', 'centimeters'], cut: ['feet', 'meters', 'yards', 'inches'], grow: ['inches', 'centimeters'], startUnknown: ['inches', 'centimeters'], compareMore: ['feet', 'meters', 'yards'], three: ['meters', 'feet', 'yards'], cutTwo: ['inches', 'feet', 'centimeters'] };
    var u = R.pick(UNITS[tpl]), who = kids(R, 2), A = who[0], B = who[1], a, b, c2, q, ans, steps, k = 0;
    if (tpl === 'join') { do { a = R.int(15, 60); b = R.int(12, 45); k++; } while (k < 30 && a + b > 99); ans = a + b; q = A.n + ' puts two boards end to end. One is ' + a + ' ' + u + ' long and the other is ' + b + ' ' + u + ' long. How long are they together?'; steps = ['End to end means the lengths join: add.', m(a + ' + ' + b + ' = ' + ans) + '.', 'Together they are ' + ans + ' ' + u + ' long.']; }
    else if (tpl === 'cut') { a = R.int(40, 99); b = R.int(12, a - 10); ans = a - b; q = A.n + ' has a rope that is ' + a + ' ' + u + ' long. ' + A.P + ' cuts off ' + b + ' ' + u + '. How long is the rope now?'; steps = ['Cutting off makes the rope shorter: subtract.', m(a + ' - ' + b + ' = ' + ans) + '.', 'The rope is ' + ans + ' ' + u + ' long now.']; }
    else if (tpl === 'grow') { a = R.int(12, 50); b = R.int(9, 40); ans = a + b; q = 'A sunflower was ' + a + ' ' + u + ' tall. It grew ' + b + ' ' + u + ' more. How tall is it now?'; steps = ['Growing adds to the height: add.', m(a + ' + ' + b + ' = ' + ans) + '.', 'It is ' + ans + ' ' + u + ' tall now.']; }
    else if (tpl === 'startUnknown') { b = R.int(12, 40); c2 = R.int(15, 55); ans = b + c2; q = A.n + ' had a ribbon. ' + A.P + ' cut off ' + b + ' ' + u + ' for a bow. Now the ribbon is ' + c2 + ' ' + u + ' long. How long was the ribbon at first?'; steps = ['The ribbon at first is the whole. The piece cut off (' + b + ') and the piece left (' + c2 + ') are its parts.', m(BOX + ' - ' + b + ' = ' + c2) + ', so add the parts: ' + m(c2 + ' + ' + b + ' = ' + ans) + '.', 'Check: ' + m(ans + ' - ' + b + ' = ' + c2) + '. The ribbon was ' + ans + ' ' + u + ' long.']; }
    else if (tpl === 'compareMore') { a = R.int(20, 60); b = R.int(8, 30); ans = a + b; q = A.n + ' threw a ball ' + a + ' ' + u + '. ' + B.n + ' threw it ' + b + ' ' + u + ' farther than ' + A.n + '. How far did ' + B.n + ' throw the ball?'; steps = [B.n + ' threw as far as ' + A.n + ' and ' + b + ' more.', m(a + ' + ' + b + ' = ' + ans) + '.', B.n + ' threw it ' + ans + ' ' + u + '.']; }
    else if (tpl === 'three') { do { a = R.int(12, 40); b = R.int(10, 35); c2 = R.int(8, 30); k++; } while (k < 30 && a + b + c2 > 99); ans = a + b + c2; q = 'A path has three parts. They are ' + a + ', ' + b + ' and ' + c2 + ' ' + u + ' long. How long is the whole path?'; steps = ['The whole path is all three parts together.', m(a + ' + ' + b + ' = ' + (a + b)) + ', then ' + m((a + b) + ' + ' + c2 + ' = ' + ans) + '.', 'The path is ' + ans + ' ' + u + ' long.']; }
    else { do { a = R.int(60, 99); b = R.int(10, 30); c2 = R.int(10, 30); k++; } while (k < 30 && a - b - c2 < 5); ans = a - b - c2; q = 'A rope is ' + a + ' ' + u + ' long. ' + A.n + ' cuts off ' + b + ' ' + u + ', and then ' + B.n + ' cuts off ' + c2 + ' ' + u + '. How much rope is left?'; steps = ['Take away both pieces.', m(a + ' - ' + b + ' = ' + (a - b)) + ', then ' + m((a - b) + ' - ' + c2 + ' = ' + ans) + '.', 'There are ' + ans + ' ' + u + ' left.']; }
    return { q: q, a: N(ans), steps: steps, hint: 'Do the lengths join (add) or get shorter (subtract)? Draw a number line if it helps.', unit: u };
  });

  /* ================================================================ unit: time and money */
  function hm(h, mm) { return h + ':' + (mm < 10 ? '0' : '') + mm; }
  function timeSteps(h, mm) {
    var nx = h % 12 + 1, out = [];
    out.push(mm === 0 ? 'The short hand points right at ' + h + ', so the hour is ' + h + '.' : 'The short hand is between ' + h + ' and ' + nx + '. It has passed ' + h + ' but not reached ' + nx + ', so the hour is ' + h + '.');
    if (mm === 0) out.push('The long hand points straight up at 12: 0 minutes.');
    else { var seq = range(5, mm, 5); out.push('The long hand points to the ' + (mm / 5) + '. Count by 5s for each number: ' + seq.join(', ') + '. That is ' + mm + ' minutes.'); }
    out.push('The time is <b>' + hm(h, mm) + '</b>.');
    return out;
  }
  G('g2.time-five-minutes', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'mc', R.pick(['typed', 'typed', 'minutesAfter', 'mc']), R.pick(['typed', 'whereHand', 'later', 'typed']));
    var h = R.int(1, 12), mm = 5 * by(ctx, R.int(1, 11), R.int(0, 11), R.int(5, 11));
    var clock = { name: 'clock', opts: { time: hm(h, mm), digital: false, controls: false, ring: L === 1, label: 'A clock with a short hour hand and a long minute hand' } };
    if (shape === 'mc') {
      if (mm === 0) mm = 5 * R.int(1, 11);
      clock.opts.time = hm(h, mm);
      var N5 = mm / 5, nx = h % 12 + 1, wr = [h + ':' + (N5 < 10 ? '0' : '') + N5, hm(nx, mm), hm(N5 === 0 ? 12 : N5, (5 * h) % 60), hm(h, (60 - mm) % 60)];
      return { q: 'What time does the clock show?', viz: clock, a: mc(hm(h, mm), wr.filter(function (w) { return w !== hm(h, mm); })), steps: timeSteps(h, mm), hint: 'The long hand: count by 5s. The short hand: the number it has just passed.' };
    }
    if (shape === 'typed') return { q: 'What time does the clock show? Write the hour and the minutes.', viz: clock, a: { t: 'multi', parts: [{ label: 'Hour:', a: N(h) }, { label: 'Minutes:', a: N(mm) }] }, steps: timeSteps(h, mm), hint: 'Count by 5s around the clock for the long hand.' };
    if (shape === 'minutesAfter') { if (mm === 0) mm = 5 * R.int(1, 11); clock.opts.time = hm(h, mm); return { q: 'How many minutes after ' + h + ' o’clock is it?', viz: clock, a: N(mm), steps: timeSteps(h, mm).slice(1, 2).concat(['So it is ' + mm + ' minutes after ' + h + ' o’clock: ' + hm(h, mm) + '.']), hint: 'Count by 5s from the 12 to the long hand.', unit: 'minutes' }; }
    if (shape === 'whereHand') { if (mm === 0) mm = 5 * R.int(1, 11); return { q: 'At ' + hm(h, mm) + ', which number does the long minute hand point to?', a: N(mm / 5), steps: ['Each number on the clock is 5 more minutes for the long hand.', 'Count by 5s until you reach ' + mm + ': ' + range(5, mm, 5).join(', ') + '. That is ' + mm / 5 + ' numbers.', 'So the minute hand points to the <b>' + mm / 5 + '</b>.'], hint: 'How many 5s make ' + mm + '?' }; }
    // later: 5 or 10 minutes later, crossing the hour sometimes
    var add = R.pick([5, 10, 15]); mm = 5 * R.int(8, 11); clock.opts.time = hm(h, mm);
    var t2 = mm + add, h2 = h, m2 = t2; if (t2 >= 60) { m2 = t2 - 60; h2 = h % 12 + 1; }
    return { q: 'What time will it be ' + add + ' minutes after the time on the clock?', viz: clock, a: { t: 'multi', parts: [{ label: 'Hour:', a: N(h2) }, { label: 'Minutes:', a: N(m2) }] }, steps: timeSteps(h, mm).slice(0, 2).concat(['Now count on ' + add + ' minutes by 5s: ' + range(mm + 5, mm + add, 5).map(function (v) { return v >= 60 ? hm(h2, v - 60) : hm(h, v); }).join(', ') + '.', t2 >= 60 ? 'At 60 minutes a new hour starts, so the hour goes up to ' + h2 + '.' : 'The hour stays ' + h + '.', 'The time will be <b>' + hm(h2, m2) + '</b>.']), hint: 'Count on by 5s. After 55 minutes comes a new hour.' };
  });

  var AM = [['eats breakfast', 7, [0, 15, 30]], ['wakes up', 6, [30, 45]], ['walks to school', 8, [0, 5, 10, 15]], ['goes out for morning recess', 10, [0, 15, 20]], ['watches the sun rise', 6, [15, 30]], ['hears the first school bell', 8, [25, 30]]];
  var PM = [['eats dinner', 6, [0, 15, 30]], ['goes to bed', 8, [0, 15, 30]], ['gets home from school', 3, [30, 45]], ['goes to soccer practice after school', 4, [0, 30]], ['reads a bedtime story', 7, [45, 50]], ['eats an afternoon snack', 3, [15, 20]], ['watches the sun set', 7, [30, 40]]];
  G('g2.am-pm', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['act', 'word']), R.pick(['act', 'best', 'first']), R.pick(['later', 'best', 'first', 'later']));
    var who = kids(R, 1)[0], AP = ['a.m.', 'p.m.'];
    if (shape === 'act') { var am = R.coin(), e = R.pick(am ? AM : PM), t = hm(e[1], R.pick(e[2])); return { q: who.n + ' ' + e[0] + ' at ' + t + '. Is that ' + t + ' a.m. or ' + t + ' p.m.?', a: mcKeep(AP, am ? 0 : 1), steps: ['a.m. times are from midnight until noon: night and morning.', 'p.m. times are from noon until midnight: afternoon, evening and night.', who.n + ' ' + e[0] + ' in the ' + (am ? 'morning' : e[1] >= 6 ? 'evening' : 'afternoon') + ', so it is <b>' + t + ' ' + (am ? 'a.m.' : 'p.m.') + '</b>'], hint: 'Does it happen in the morning, or after lunch?' }; }
    if (shape === 'word') { var part = R.pick([['in the morning', 0, 6, 11], ['in the afternoon', 1, 1, 4], ['in the evening', 1, 6, 8], ['before lunch', 0, 8, 11], ['after lunch', 1, 1, 3]]), t3 = hm(R.int(part[2], part[3]), 5 * R.int(0, 11)); return { q: 'It is ' + t3 + ' ' + part[0] + '. Is it ' + t3 + ' a.m. or p.m.?', a: mcKeep(AP, part[1]), steps: ['a.m. is the morning (before noon). p.m. is after noon: afternoon and evening.', cap(part[0]) + ' is ' + (part[1] ? 'after noon' : 'before noon') + ', so it is <b>' + t3 + ' ' + AP[part[1]] + '</b>'], hint: 'Noon is the middle of the day. Before noon is a.m.' }; }
    if (shape === 'best') { var am2 = R.coin(), e2 = R.pick(am2 ? AM : PM), mn = R.pick(e2[2]), right = hm(e2[1], mn) + ' ' + AP[am2 ? 0 : 1], wr = [hm(e2[1], mn) + ' ' + AP[am2 ? 1 : 0], hm(am2 ? e2[1] + 4 : e2[1] + 3, mn) + ' ' + AP[am2 ? 1 : 0], hm(e2[1] === 12 ? 12 : (e2[1] + 5) % 12 || 12, mn) + ' ' + AP[am2 ? 1 : 0]];
      return { q: 'What is the best time for ' + who.n + ' to say ' + who.p + ' ' + e2[0] + '?', a: mc(right, wr), steps: ['First decide: does it happen in the morning (a.m.) or in the afternoon or evening (p.m.)?', cap(e2[0]) + ' happens in the ' + (am2 ? 'morning' : e2[1] >= 6 ? 'evening' : 'afternoon') + '.', 'So the best time is <b>' + right + '</b>'], hint: 'Morning is a.m.; afternoon and evening are p.m.' }; }
    if (shape === 'first') { var hh = R.int(1, 11), mm = 5 * R.int(0, 11), t4 = hm(hh, mm); return { q: 'Which time comes first in the same day: ' + t4 + ' p.m. or ' + t4 + ' a.m.?', a: mcKeep([t4 + ' a.m.', t4 + ' p.m.'], 0), steps: ['A day starts at midnight. The a.m. hours come first, then noon, then the p.m. hours.', t4 + ' a.m. comes first, and ' + t4 + ' p.m. is 12 hours later.'], hint: 'Which half of the day comes first?' }; }
    // later
    var start = R.int(8, 11), mm2 = 5 * R.int(0, 11), add = R.int(2, 5), end = start + add, endH = end > 12 ? end - 12 : end, endAP = end >= 12 ? 'p.m.' : 'a.m.';
    var right2 = hm(endH, mm2) + ' ' + endAP, wr2 = [hm(endH, mm2) + ' ' + (endAP === 'p.m.' ? 'a.m.' : 'p.m.'), hm(start + add - 1 > 12 ? start + add - 13 : start + add - 1, mm2) + ' ' + endAP, hm(start, mm2) + ' p.m.'];
    return { q: 'A field trip starts at ' + hm(start, mm2) + ' a.m. It lasts ' + add + ' hours. When does it end?', a: mc(right2, wr2), steps: ['Count on ' + add + ' hours from ' + hm(start, mm2) + ' a.m.: ' + range(1, add, 1).map(function (i) { var hh2 = start + i; return hm(hh2 > 12 ? hh2 - 12 : hh2, mm2) + (hh2 >= 12 ? ' p.m.' : ' a.m.'); }).join(', '), end >= 12 ? 'At 12 noon, a.m. changes to p.m.' : 'It is still morning, so it stays a.m.', 'The trip ends at <b>' + right2 + '</b>'], hint: 'Count on one hour at a time. Watch for noon.' };
  });

  var CV = { penny: 1, nickel: 5, dime: 10, quarter: 25 }, CP = { penny: 'pennies', nickel: 'nickels', dime: 'dimes', quarter: 'quarters' };
  G('g2.coin-values', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['value', 'more']), R.pick(['howMany', 'more', 'which', 'value']), R.pick(['howMany', 'tf', 'dollar', 'howMany']));
    var coin = R.pick(['penny', 'nickel', 'dime', 'quarter']), kid = kids(R, 1)[0];
    if (shape === 'howMany' && chance(R, 0.4)) shape = 'two';
    if (shape === 'two') { var two = R.sample(['penny', 'nickel', 'dime', 'quarter'], 2).sort(function (x, y) { return CV[y] - CV[x]; }); return { q: kid.n + ' has a ' + two[0] + ' and a ' + two[1] + '. How many cents is that?', viz: { name: 'g2-coins', opts: { coins: two, show: 'name' } }, a: N(CV[two[0]] + CV[two[1]]), steps: ['A ' + two[0] + ' is ' + CV[two[0]] + '¢ and a ' + two[1] + ' is ' + CV[two[1]] + '¢.', 'Start with the bigger value and count on: ' + m(CV[two[0]] + ' + ' + CV[two[1]] + ' = ' + (CV[two[0]] + CV[two[1]])) + '.', 'That is ' + (CV[two[0]] + CV[two[1]]) + '¢.'], hint: 'What is each coin worth?', unit: '¢' }; }
    if (shape === 'value') return { q: kid.n + ' found a ' + coin + '. How many cents is it worth?', viz: { name: 'g2-coins', opts: { coins: [coin], show: 'name' } }, a: N(CV[coin]), steps: ['A penny is 1¢, a nickel is 5¢, a dime is 10¢ and a quarter is 25¢.', 'So a ' + coin + ' is worth <b>' + CV[coin] + '¢</b>.'], hint: 'Penny 1, nickel 5, dime 10, quarter 25.', unit: '¢' };
    if (shape === 'more') { var pr = R.pick([['nickel', 'dime'], ['penny', 'dime'], ['nickel', 'quarter'], ['penny', 'nickel'], ['dime', 'quarter']]), sh = R.shuffle(pr), hi = CV[pr[0]] > CV[pr[1]] ? pr[0] : pr[1];
      return { q: kid.n + ' can keep one coin: a ' + sh[0] + ' or a ' + sh[1] + '. Which coin is worth more?', viz: { name: 'g2-coins', opts: { coins: sh, show: 'name' } }, a: mcKeep(['A ' + sh[0], 'A ' + sh[1]], hi === sh[0] ? 0 : 1), steps: ['A ' + pr[0] + ' is worth ' + CV[pr[0]] + '¢ and a ' + pr[1] + ' is worth ' + CV[pr[1]] + '¢.', 'So a <b>' + hi + '</b> is worth more.' + ((hi === 'dime' && (pr[0] === 'nickel' || pr[0] === 'penny')) ? ' A dime is the smallest coin, but its value is bigger: size does not tell value.' : '')], hint: 'Think of the values, not the sizes.' }; }
    if (shape === 'which') { var cn = R.pick(['nickel', 'dime', 'quarter']); return { q: 'Which coin is worth ' + CV[cn] + '¢?', a: mc('A ' + cn, ['A penny', 'A nickel', 'A dime', 'A quarter'].filter(function (s) { return s !== 'A ' + cn; })), steps: ['Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢.', 'The coin worth ' + CV[cn] + '¢ is a <b>' + cn + '</b>.'], hint: 'Say the four coins and their values.' }; }
    if (shape === 'howMany') { var pairs = [['penny', 'nickel'], ['penny', 'dime'], ['nickel', 'dime'], ['nickel', 'quarter'], ['penny', 'quarter']], p2 = R.pick(pairs), n = CV[p2[1]] / CV[p2[0]];
      return { q: kid.n + ' wants to trade 1 ' + p2[1] + ' for ' + CP[p2[0]] + '. How many ' + CP[p2[0]] + ' are worth the same as 1 ' + p2[1] + '?', a: N(n), steps: ['A ' + p2[1] + ' is worth ' + CV[p2[1]] + '¢. A ' + p2[0] + ' is worth ' + CV[p2[0]] + '¢.', 'Count by ' + CV[p2[0]] + 's to ' + CV[p2[1]] + ': ' + range(CV[p2[0]], CV[p2[1]], CV[p2[0]]).join(', ') + '.', 'That is <b>' + n + '</b> ' + CP[p2[0]] + '.'], hint: 'Count by ' + CV[p2[0]] + 's until you reach ' + CV[p2[1]] + '.' }; }
    if (shape === 'dollar') { var cd = R.pick(['dime', 'quarter', 'nickel']), n2 = 100 / CV[cd]; return { q: 'One dollar is 100¢. How many ' + CP[cd] + ' make 1 dollar?', a: N(n2), steps: ['A ' + cd + ' is ' + CV[cd] + '¢.', 'Count by ' + CV[cd] + 's to 100: ' + range(CV[cd], 100, CV[cd]).join(', ') + '.', 'That is <b>' + n2 + '</b> ' + CP[cd] + '.'], hint: 'Count by ' + CV[cd] + 's up to 100.' }; }
    var TF = R.pick([['2 dimes and 1 nickel are worth the same as 1 quarter.', true, '2 dimes are 20¢ and 1 nickel is 5¢: 25¢. A quarter is 25¢ too.'], ['3 nickels are worth the same as 1 dime.', false, '3 nickels are 15¢, but a dime is 10¢. It takes 2 nickels to make a dime.'], ['5 nickels are worth the same as 1 quarter.', true, '5 nickels: 5, 10, 15, 20, 25. That is 25¢, the same as a quarter.'], ['A nickel is worth more than a dime because it is bigger.', false, 'A nickel is bigger, but it is worth 5¢. A dime is worth 10¢.'], ['10 pennies are worth the same as 1 dime.', true, '10 pennies are 10¢, and a dime is 10¢.'], ['4 quarters make 1 dollar.', true, '25, 50, 75, 100: 4 quarters are 100¢, which is 1 dollar.'], ['2 quarters are worth the same as 5 dimes.', true, '2 quarters are 50¢ and 5 dimes are 50¢.'], ['A quarter is worth the same as 2 dimes.', false, '2 dimes are 20¢, but a quarter is 25¢.']]);
    return { q: 'True or false: ' + TF[0], a: { t: 'tf', v: TF[1] }, steps: [TF[2], 'So it is <b>' + (TF[1] ? 'true' : 'false') + '</b>.'], hint: 'Find the value of each side in cents.' };
  });

  function coinCount(list) { // list sorted big to small -> running totals
    var t = 0; return list.map(function (k) { t += CV[k]; return t; });
  }
  G('g2.count-money', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'count', R.pick(['count', 'count', 'toDollar']), R.pick(['bills', 'count', 'toDollar']));
    var cnt, total, list, k = 0;
    do {
      cnt = { quarter: R.int(0, L === 1 ? 2 : 3), dime: R.int(0, 4), nickel: R.int(0, L === 1 ? 2 : 3), penny: R.int(0, 4) };
      list = []; ['quarter', 'dime', 'nickel', 'penny'].forEach(function (c3) { for (var i = 0; i < cnt[c3]; i++) list.push(c3); });
      total = list.reduce(function (s, c3) { return s + CV[c3]; }, 0); k++;
    } while (k < 100 && (total >= 100 || list.length < 3 || Object.keys(cnt).filter(function (c3) { return cnt[c3]; }).length < 2));
    var run = coinCount(list), steps = ['Start with the coin worth the most and count on: ' + list.map(function (c3, i) { return c3 + ' ' + run[i] + '¢'; }).join(', ') + '.'];
    var kinds = ['quarter', 'dime', 'nickel', 'penny'].filter(function (c3) { return cnt[c3]; });
    steps.unshift('Sort the coins: ' + kinds.map(function (c3) { return pl(cnt[c3], c3, CP[c3]); }).join(', ') + '. Count quarters by 25s, dimes by 10s, nickels by 5s and pennies by 1s.');
    if (shape === 'count') {
      steps.push('The total is <b>' + total + '¢</b>.');
      return { q: 'How much money is this? Write the number of cents.', viz: { name: 'g2-coins', opts: { coins: L === 1 ? list : R.shuffle(list), show: L === 1 ? 'both' : 'name' } }, a: N(total), steps: steps, hint: 'Start with the biggest coins. Change how you count when the coin changes.', unit: '¢' };
    }
    if (shape === 'toDollar') {
      steps.push('The coins make ' + total + '¢.', 'A dollar is 100¢. Count up from ' + total + ' to 100: ' + m('100 - ' + total + ' = ' + (100 - total)) + '.');
      return { q: 'How many more cents do you need to make 1 dollar?', viz: { name: 'g2-coins', opts: { coins: R.shuffle(list), show: L === 2 ? 'both' : 'name' } }, a: N(100 - total), steps: steps, hint: 'Find the total first. 1 dollar is 100¢.', unit: '¢' };
    }
    var bills = R.int(1, 3), bl = []; for (var i = 0; i < bills; i++) bl.push('dollar');
    steps.unshift('There ' + (bills === 1 ? 'is 1 one-dollar bill' : 'are ' + bills + ' one-dollar bills') + ': that is ' + bills + ' dollar' + (bills > 1 ? 's' : '') + '.');
    steps.push('The coins make ' + total + '¢, so the money is ' + bills + ' dollar' + (bills > 1 ? 's' : '') + ' and ' + total + ' cents, written ' + T.money(bills + total / 100) + '.');
    return { q: 'How much money is this? Write the dollars and the cents.', viz: { name: 'g2-coins', opts: { coins: bl.concat(R.shuffle(list)), show: 'name' } }, a: { t: 'multi', parts: [{ label: 'Dollars:', a: N(bills) }, { label: 'Cents:', a: N(total) }] }, steps: steps, hint: 'Count the bills, then count the coins.' };
  });

  var ITEMS = [['a pencil', 'an eraser'], ['a sticker', 'a bookmark'], ['an apple', 'a juice box'], ['a pencil topper', 'a bouncy ball'], ['a sheet of stickers', 'a pencil'], ['a granola bar', 'a banana']];
  G('g2.money-word-problems', function (R, ctx) {
    var L = ctx.level, tpl = by(ctx, R.pick(['total', 'left']), R.pick(['total', 'left', 'change', 'more', 'dollars']), R.pick(['coins', 'change', 'more', 'dollarsCmp']));
    var who = kids(R, 2), A = who[0], B = who[1], it = R.pick(ITEMS), a, b, q, ans, steps, unit = '¢', k = 0;
    if (tpl === 'total') { do { a = R.int(15, 60); b = R.int(12, 45); k++; } while (k < 30 && a + b >= 100); ans = a + b; q = cap(it[0]) + ' costs ' + a + '¢ and ' + it[1] + ' costs ' + b + '¢. How much do they cost together?'; steps = ['Together means add: ' + m(a + ' + ' + b + ' = ' + ans) + '.', 'They cost ' + ans + '¢ together.']; }
    else if (tpl === 'left') { a = R.int(50, 99); b = R.int(15, a - 8); ans = a - b; q = A.n + ' has ' + a + '¢. ' + A.P + ' buys ' + it[0] + ' for ' + b + '¢. How much money does ' + A.n + ' have left?'; steps = ['Spending takes money away: ' + m(a + ' - ' + b + ' = ' + ans) + '.', A.n + ' has ' + ans + '¢ left. Check: ' + m(ans + ' + ' + b + ' = ' + a) + '.']; }
    else if (tpl === 'change') { b = R.int(21, 89); if (b % 5 === 0 && R.coin()) b += 2; ans = 100 - b; q = cap(it[0]) + ' costs ' + b + '¢. ' + A.n + ' pays with a one-dollar bill. How much change does ' + A.p + ' get?'; steps = ['A dollar is 100¢. Change is what is left: ' + m('100 - ' + b) + '.', 'Count up from ' + b + ': to ' + (Math.ceil(b / 10) * 10) + ' is ' + (Math.ceil(b / 10) * 10 - b) + ', then to 100 is ' + (100 - Math.ceil(b / 10) * 10) + '. ' + m((Math.ceil(b / 10) * 10 - b) + ' + ' + (100 - Math.ceil(b / 10) * 10) + ' = ' + ans) + '.', 'The change is ' + ans + '¢.']; steps[1] = steps[1].replace(/to \d+ is 0, then /, ''); }
    else if (tpl === 'more') { a = R.int(40, 95); b = R.int(12, a - 6); ans = a - b; q = cap(it[1]) + ' costs ' + a + '¢. ' + A.n + ' has ' + b + '¢. How much more money does ' + A.p + ' need?'; steps = ['Find the missing part: ' + m(b + ' + ' + BOX + ' = ' + a) + '.', m(a + ' - ' + b + ' = ' + ans) + '.', A.n + ' needs ' + ans + '¢ more.']; }
    else if (tpl === 'dollars') { a = R.int(12, 55); b = R.int(8, 40); ans = a + b; unit = 'dollars'; q = A.n + ' saved ' + T.money(a) + '. ' + A.P + ' got ' + T.money(b) + ' more for a birthday. How many dollars does ' + A.n + ' have now?'; steps = ['Add the dollars: ' + m(a + ' + ' + b + ' = ' + ans) + '.', A.n + ' has ' + T.money(ans) + '.']; }
    else if (tpl === 'dollarsCmp') { a = R.int(30, 95); b = R.int(12, a - 6); ans = a - b; unit = 'dollars'; q = 'A bike helmet costs ' + T.money(a) + '. A water bottle costs ' + T.money(b) + '. How many more dollars does the helmet cost?'; steps = ['"How many more" means find the difference: ' + m(a + ' - ' + b + ' = ' + ans) + '.', 'The helmet costs ' + T.money(ans) + ' more.']; }
    else { var qn, dn, nn, have; do { qn = R.int(1, 3); dn = R.int(1, 4); nn = R.int(0, 3); have = 25 * qn + 10 * dn + 5 * nn; k++; } while (k < 60 && have > 99); if (have > 99) { qn = 2; dn = 3; nn = 1; have = 85; } b = R.int(10, have - 5); ans = have - b; q = A.n + ' has ' + U.list([pl(qn, 'quarter'), pl(dn, 'dime')].concat(nn ? [pl(nn, 'nickel')] : [])) + '. ' + A.P + ' buys ' + it[0] + ' for ' + b + '¢. How much money is left?'; steps = ['Count the coins: ' + range(25, 25 * qn, 25).concat(range(25 * qn + 10, 25 * qn + 10 * dn, 10)).concat(nn ? range(25 * qn + 10 * dn + 5, have, 5) : []).join(', ') + '. That is ' + have + '¢.', 'Take away the cost: ' + m(have + ' - ' + b + ' = ' + ans) + '.', 'There is ' + ans + '¢ left.']; }
    return { q: q, a: N(ans), steps: steps, hint: 'Do you put money together (add) or take some away (subtract)?', unit: unit };
  });

  /* ================================================================ unit: data */
  var GRAPHS = [
    ['Our favorite fruit', ['Apples', 'Bananas', 'Grapes', 'Pears'], 'children', 'chose'],
    ['Our pets', ['Dogs', 'Cats', 'Fish', 'Birds'], 'children', 'have'],
    ['Weather this month', ['Sunny', 'Cloudy', 'Rainy', 'Windy'], 'days', 'were'],
    ['Our favorite color', ['Red', 'Blue', 'Green', 'Yellow'], 'children', 'chose'],
    ['How we get to school', ['Walk', 'Bus', 'Car', 'Bike'], 'children', 'chose'],
    ['Books we read', ['Animals', 'Space', 'Sports', 'Jokes'], 'books', 'were about']
  ];
  G('g2.picture-bar-graphs', function (R, ctx) {
    var L = ctx.level, gr = R.pick(GRAPHS), nc = by(ctx, 3, R.pick([3, 4]), 4), cats = gr[1].slice(0, nc), maxV = by(ctx, 8, 12, 19);
    var vals, k = 0;
    do { vals = cats.map(function () { return R.int(1, maxV); }); k++; } while (k < 50 && (U.uniq(vals).length < vals.length || (L === 3 && !vals.some(function (v) { return v % 2; }))));
    var kind = L === 1 ? 'picture' : L === 2 ? R.pick(['picture', 'bar']) : 'bar';
    var viz = { name: 'g2-graph', opts: { kind: kind, title: gr[0], cats: cats, vals: vals, icon: R.pick(['star', 'smile', 'heart', 'circle']), labelEvery: L === 3 ? 2 : 1, yLabel: kind === 'bar' ? 'Number of ' + gr[2] : undefined, key: kind === 'picture' ? 'Each picture stands for 1 ' + gr[2].replace(/s$/, '').replace('childre', 'child').replace(/^child.*$/, 'child') : undefined } };
    var shape = by(ctx, R.pick(['read', 'more', 'most']), R.pick(['read', 'more', 'total', 'fewer']), R.pick(['read', 'more', 'total', 'fewer']));
    var i = R.int(0, nc - 1), j = R.intNot(0, nc - 1, i), readHow = kind === 'bar' ? 'Find the top of the bar and read across to the numbers on the side' + (L === 3 ? '. Only every other line has a number, so count the lines' : '') + '.' : 'Count the pictures in the row.';
    if (shape === 'read') { var tgt = i; if (L === 3) { var odd = vals.map(function (v, x) { return v % 2 ? x : -1; }).filter(function (x) { return x >= 0; }); if (odd.length) tgt = R.pick(odd); } return { q: 'How many ' + gr[2] + ' ' + gr[3] + ' <b>' + cats[tgt] + '</b>?', viz: viz, a: N(vals[tgt]), steps: [readHow, cats[tgt] + ': ' + vals[tgt] + '.' + (kind === 'bar' && vals[tgt] % 2 && L === 3 ? ' The bar stops one line above ' + (vals[tgt] - 1) + ', so it is ' + vals[tgt] + ', not ' + (vals[tgt] - 1) + '.' : '')], hint: kind === 'bar' ? 'Read straight across from the top of the bar.' : 'Count the pictures.' }; }
    if (shape === 'most') { var mx = Math.max.apply(null, vals), wi = vals.indexOf(mx); return { q: 'Which group has the most?', viz: viz, a: mc(cats[wi], cats.filter(function (x, y) { return y !== wi; })), steps: [cats.map(function (x, y) { return x + ' ' + vals[y]; }).join(', ') + '.', 'The biggest number is ' + mx + ', so <b>' + cats[wi] + '</b> has the most.'], hint: 'Find the longest row or the tallest bar.' }; }
    var a = vals[i], b = vals[j]; if (a < b) { var tmp = i; i = j; j = tmp; a = vals[i]; b = vals[j]; }
    if (shape === 'more') return { q: 'How many more ' + gr[2] + ' ' + gr[3] + ' ' + cats[i] + ' than ' + cats[j] + '?', viz: viz, a: N(a - b), steps: [readHow, cats[i] + ': ' + a + '. ' + cats[j] + ': ' + b + '.', 'Compare: ' + m(a + ' - ' + b + ' = ' + (a - b)) + '. So ' + (a - b) + ' more.'], hint: 'Find both numbers, then subtract.' };
    if (shape === 'fewer') return { q: 'How many fewer ' + gr[2] + ' ' + gr[3] + ' ' + cats[j] + ' than ' + cats[i] + '?', viz: viz, a: N(a - b), steps: [readHow, cats[j] + ': ' + b + '. ' + cats[i] + ': ' + a + '.', '"How many fewer" asks for the difference: ' + m(a + ' - ' + b + ' = ' + (a - b)) + '.'], hint: 'Find both numbers, then subtract.' };
    var tot = U.sum(vals);
    return { q: 'How many ' + gr[2] + ' are shown in the graph in all?', viz: viz, a: N(tot), steps: [readHow, cats.map(function (x, y) { return x + ' ' + vals[y]; }).join(', ') + '.', 'Add them: ' + m(vals.join(' + ') + ' = ' + tot) + '.'], hint: 'Find every group’s number, then add them all.' };
  });

  var LP = [['pencils', 'inches', 3, 9], ['leaves', 'centimeters', 4, 12], ['shoes', 'inches', 6, 11], ['crayons', 'centimeters', 5, 10], ['worms', 'centimeters', 3, 9], ['ribbons', 'inches', 4, 10]];
  G('g2.line-plots', function (R, ctx) {
    var L = ctx.level, lp = R.pick(LP), lo = lp[2], hi = lp[3], data, k = 0, by2;
    do {
      var span = R.int(4, 6), a0 = R.int(lo, hi - span); data = [];
      for (var v = a0; v <= a0 + span; v++) { var n = R.int(0, 4); for (var i = 0; i < n; i++) data.push(v); }
      by2 = {}; data.forEach(function (x) { by2[x] = (by2[x] || 0) + 1; }); k++;
      var counts = Object.keys(by2).map(function (x) { return by2[x]; }), mx = Math.max.apply(null, counts);
    } while (k < 100 && (data.length < 7 || data.length > 14 || counts.filter(function (x) { return x === mx; }).length > 1));
    var dmin = Math.min.apply(null, data), dmax = Math.max.apply(null, data), keys = Object.keys(by2).map(Number).sort(function (a, b) { return a - b; });
    var viz = { name: 'g2-graph', opts: { kind: 'lineplot', data: R.shuffle(data), min: dmin - 1, max: dmax + 1, unitLabel: 'Length of ' + lp[0] + ' (' + lp[1] + ')' } };
    var shape = by(ctx, R.pick(['count', 'total']), R.pick(['count', 'longer', 'most', 'range']), R.pick(['range', 'longer', 'compare', 'build']));
    var pick = R.pick(keys), u1 = lp[1] === 'inches' ? 'inch' : 'centimeter', one = lp[0].replace(/s$/, '');
    if (shape === 'count') return { q: 'Each X is one of the ' + lp[0] + ' a class measured. How many ' + lp[0] + ' are ' + pl(pick, u1, lp[1]) + ' long?', viz: viz, a: N(by2[pick]), steps: ['Find ' + pick + ' on the number line.', 'Count the Xs above it: there ' + (by2[pick] === 1 ? 'is 1' : 'are ' + by2[pick]) + '.', 'So ' + pl(by2[pick], one, lp[0]) + ' ' + (by2[pick] === 1 ? 'is' : 'are') + ' ' + pick + ' ' + lp[1] + ' long.'], hint: 'Count the Xs above ' + pick + '.' };
    if (shape === 'total') return { q: 'Each X is one of the ' + lp[0] + ' a class measured. How many ' + lp[0] + ' did they measure in all?', viz: viz, a: N(data.length), steps: ['Each X stands for one ' + one + '.', 'Count every X: ' + keys.map(function (x) { return by2[x]; }).join(' + ') + ' = ' + data.length + '.'], hint: 'Count all the Xs.' };
    if (shape === 'most') { var best = keys.reduce(function (b, x) { return by2[x] > by2[b] ? x : b; }, keys[0]); return { q: 'Which length did the most ' + lp[0] + ' have? (Write the number of ' + lp[1] + '.)', viz: viz, a: N(best), steps: ['The tallest stack of Xs shows the most common length.', 'There are ' + by2[best] + ' Xs above ' + best + ', more than anywhere else.', 'So the most common length is ' + pl(best, u1, lp[1]) + '.'], hint: 'Find the tallest stack of Xs.', unit: lp[1] }; }
    if (shape === 'range') return { q: 'How much longer is the longest ' + one + ' than the shortest ' + one + '?', viz: viz, a: N(dmax - dmin), steps: ['The longest has an X at ' + dmax + '. The shortest has an X at ' + dmin + '.', m(dmax + ' - ' + dmin + ' = ' + (dmax - dmin)) + '.', 'The longest is ' + pl(dmax - dmin, u1, lp[1]) + ' longer.'], hint: 'Find the Xs farthest to the right and farthest to the left.', unit: lp[1] };
    if (shape === 'longer') { var cut = R.pick(keys.slice(0, -1)), cntL = data.filter(function (x) { return x > cut; }).length; return { q: 'How many ' + lp[0] + ' are longer than ' + pl(cut, u1, lp[1]) + '?', viz: viz, a: N(cntL), steps: ['Longer than ' + cut + ' means the Xs to the right of ' + cut + ' (not the ones at ' + cut + ').', keys.filter(function (x) { return x > cut; }).map(function (x) { return x + ': ' + by2[x]; }).join(', ') + '.', 'Add them: ' + cntL + '.'], hint: 'Count only the Xs to the right of ' + cut + '.' }; }
    if (shape === 'compare') { var two = R.sample(keys, 2).sort(function (a, b) { return by2[b] - by2[a]; }); if (by2[two[0]] === by2[two[1]]) two = [keys[0], keys[keys.length - 1]].sort(function (a, b) { return by2[b] - by2[a]; }); var dd = by2[two[0]] - by2[two[1]];
      return { q: 'How many more ' + lp[0] + ' are ' + two[0] + ' ' + lp[1] + ' long than ' + two[1] + ' ' + lp[1] + ' long?', viz: viz, a: N(dd), steps: ['Above ' + two[0] + ': ' + pl(by2[two[0]], 'X', 'Xs') + '. Above ' + two[1] + ': ' + pl(by2[two[1]], 'X', 'Xs') + '.', m(by2[two[0]] + ' - ' + by2[two[1]] + ' = ' + dd) + '.'], hint: 'Count the Xs above each number, then subtract.' }; }
    // build: no picture
    var small = R.shuffle(data).slice(0, Math.min(8, data.length)), tv = R.pick(small), nX = small.filter(function (x) { return x === tv; }).length;
    return { q: 'A class measured ' + small.length + ' ' + lp[0] + ' in ' + lp[1] + ': ' + small.join(', ') + '. In a line plot of these lengths, how many Xs go above ' + tv + '?', a: N(nX), steps: ['A line plot puts one X above the number line for each measurement.', 'Count how many times ' + tv + ' is in the list: ' + nX + '.', 'So ' + pl(nX, 'X', 'Xs') + ' go above ' + tv + '.'], hint: 'Count how many times ' + tv + ' appears in the list.' };
  });

  /* ================================================================ unit: shapes */
  var POLYS = {
    3: [[[1, 1], [9, 1], [3, 7]], [[2, 1], [8, 2], [5, 7]], [[1, 2], [9, 1], [6, 7]], [[1, 1], [9, 4], [2, 7]]],
    4: [[[1, 1], [8, 1], [9, 6], [2, 7]], [[2, 1], [9, 2], [7, 7], [1, 5]], [[1, 1], [9, 1], [7, 6], [3, 6]], [[5, 0.5], [8.5, 4], [5, 7.5], [1.5, 4]], [[1, 1], [5, 3], [9, 1], [5, 7.5]]],
    5: [[[1, 1], [9, 1], [9, 5], [5, 7.5], [1, 5]], [[2, 1], [8, 1], [9, 5], [5, 7], [1, 4]], [[1, 2], [6, 1], [9, 4], [6, 7], [2, 6]], [[1, 1], [9, 1], [9, 7], [5, 4], [1, 7]]],
    6: [[[1, 1], [9, 1], [9, 4], [6, 7], [3, 7], [1, 4]], [[3, 1], [7, 1], [9, 4], [7, 7], [3, 7], [1, 4]], [[1, 1], [5, 1], [5, 4], [9, 4], [9, 7], [1, 7]], [[2, 1], [8, 2], [9, 6], [6, 7.5], [2, 7], [1, 4]]]
  };
  var PNAME = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon' };
  function shapeItem(R, n, irregular) { if (!irregular) return { shape: { 3: 'tri', 4: 'square', 5: 'pent', 6: 'hex' }[n] }; var pts = R.pick(POLYS[n]); if (R.coin()) pts = pts.map(function (p) { return [10 - p[0], p[1]]; }); return { shape: 'poly', pts: pts }; }
  G('g2.shapes-attributes', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['sides', 'name']), R.pick(['sides', 'corners', 'name', 'nameFrom', 'cube']), R.pick(['name', 'cube', 'tf', 'compare', 'corners']));
    var n = R.int(3, 6), item = shapeItem(R, n, L >= 2 || (L === 1 && chance(R, 0.3))), NAMES = ['triangle', 'quadrilateral', 'pentagon', 'hexagon'];
    var viz = { name: 'g2-shapes', opts: { items: [item], label: 'A flat shape' } };
    var count = ['Count the ' + (shape === 'corners' ? 'corners (where two sides meet)' : 'straight sides') + ' one at a time as you go around: ' + range(1, n, 1).join(', ') + '.'];
    var who = kids(R, 1)[0];
    if (shape === 'sides' || shape === 'corners') return { q: R.pick(['How many ' + (shape === 'corners' ? 'corners (angles)' : 'sides') + ' does this shape have?', who.n + ' drew this shape. How many ' + (shape === 'corners' ? 'corners (angles)' : 'sides') + ' does it have?', 'Count the ' + (shape === 'corners' ? 'corners (angles)' : 'sides') + ' of the shape ' + who.n + ' cut out of paper.']), viz: viz, a: N(n), steps: count.concat(['It has ' + n + ' ' + (shape === 'corners' ? 'corners' : 'sides') + (shape === 'corners' ? ', the same as its number of sides.' : '.') + ' A shape with ' + n + ' sides is a ' + PNAME[n] + '.']), hint: 'Put your finger on one ' + (shape === 'corners' ? 'corner' : 'side') + ' and count around.' };
    if (shape === 'name') return { q: R.pick(['What is the name of this shape?', who.n + ' made this shape with sticks. What is it called?']), viz: viz, a: mc(cap(PNAME[n]), NAMES.filter(function (x) { return x !== PNAME[n]; }).map(cap)), steps: ['Count the sides: ' + range(1, n, 1).join(', ') + '. It has ' + n + ' sides and ' + n + ' corners.', 'A shape with ' + n + ' sides is a <b>' + PNAME[n] + '</b>, even if its sides are not all the same length or it is turned.'], hint: 'Count the sides first.' };
    if (shape === 'nameFrom') return { q: 'A flat shape has ' + n + ' straight sides and ' + n + ' corners. What is it called?', a: mc(cap(PNAME[n]), NAMES.filter(function (x) { return x !== PNAME[n]; }).map(cap)), steps: ['Triangle: 3 sides. Quadrilateral: 4 sides. Pentagon: 5 sides. Hexagon: 6 sides.', 'So ' + n + ' sides makes a <b>' + PNAME[n] + '</b>.'], hint: 'Tri- means 3, quad- means 4, penta- means 5, hexa- means 6.' };
    if (shape === 'cube') { var w = R.pick([['faces (flat sides)', 6, 'Each face is a square: top, bottom, front, back, left and right.'], ['corners (vertices)', 8, '4 corners on the top square and 4 on the bottom square.'], ['edges', 12, '4 edges around the top, 4 around the bottom, and 4 going up and down.']]);
      return { q: 'How many ' + w[0] + ' does a cube have?', viz: { name: 'g2-shapes', opts: { items: [{ shape: 'cube' }], label: 'A cube' } }, a: N(w[1]), steps: [w[2], 'So a cube has <b>' + w[1] + '</b> ' + w[0].split(' ')[0] + '.'], hint: 'Think of the top, the bottom and the sides.' }; }
    if (shape === 'compare') { var a2 = R.sample([3, 4, 5, 6], 2).sort(function (p, q) { return q - p; }); return { q: 'How many more sides does a ' + PNAME[a2[0]] + ' have than a ' + PNAME[a2[1]] + '?', a: N(a2[0] - a2[1]), steps: ['A ' + PNAME[a2[0]] + ' has ' + a2[0] + ' sides. A ' + PNAME[a2[1]] + ' has ' + a2[1] + ' sides.', m(a2[0] + ' - ' + a2[1] + ' = ' + (a2[0] - a2[1])) + '.'], hint: 'How many sides does each shape have?' }; }
    var TF = R.pick([['Every shape with 4 sides is a square.', false, 'A square has 4 sides, but so do rectangles and many other quadrilaterals with sides of different lengths.'], ['A triangle has 3 sides and 3 corners.', true, 'Tri- means 3: 3 sides and 3 corners.'], ['A hexagon has 6 sides.', true, 'Hexa- means 6.'], ['If you turn a square, it is not a square anymore.', false, 'Turning a shape does not change its sides or corners, so it is still a square.'], ['A pentagon has more sides than a quadrilateral.', true, 'A pentagon has 5 sides and a quadrilateral has 4.'], ['A big triangle has more corners than a small triangle.', false, 'Every triangle has 3 corners, big or small.']]);
    return { q: 'True or false: ' + TF[0], a: { t: 'tf', v: TF[1] }, steps: [TF[2], 'So it is <b>' + (TF[1] ? 'true' : 'false') + '</b>.'], hint: 'Size, color and turning do not change a shape’s name.' };
  });

  G('g2.partition-rectangle', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['total', 'total', 'rows']), R.pick(['total', 'text', 'rows']), R.pick(['each', 'howRows', 'total']));
    var r = by(ctx, R.int(2, 3), R.int(2, 5), R.int(2, 5)), cl = by(ctx, R.int(2, 5), R.int(2, 6), R.int(3, 6)), tot = r * cl;
    var viz = { name: 'g2-array', opts: { rows: r, cols: cl, squares: true } };
    var add = range(1, r, 1).map(function () { return cl; }).join(' + ');
    var CTX = [['a sheet of stamps', 'stamps'], ['a pan of corn bread', 'pieces'], ['a garden', 'garden beds'], ['a quilt', 'quilt squares'], ['a window', 'panes of glass'], ['a chocolate bar', 'pieces'], ['a sheet of stickers', 'stickers'], ['a tray of ice', 'ice cubes']], cx = R.pick(CTX);
    if (shape === 'total') return { q: R.pick(['The rectangle is cut into same-size squares. How many squares are there?', cap(cx[0]) + ' is a rectangle cut into same-size squares. How many ' + cx[1] + ' are there?']), viz: viz, a: N(tot), steps: ['There are ' + pl(r, 'row') + ' with ' + cl + ' squares in each row.', 'Add the rows: ' + m(add + ' = ' + tot) + '.', 'There are ' + tot + ' squares.'], hint: 'Count one row, then add the rows together.' };
    if (shape === 'rows') { var askR = R.coin(); return { q: 'How many ' + (askR ? 'rows (going across)' : 'columns (going up and down)') + ' of squares are there?', viz: viz, a: N(askR ? r : cl), steps: [askR ? 'Rows go across, left to right. Count them from top to bottom: ' + range(1, r, 1).join(', ') + '.' : 'Columns go up and down. Count them from left to right: ' + range(1, cl, 1).join(', ') + '.', 'There are ' + (askR ? pl(r, 'row') : pl(cl, 'column')) + '.'], hint: askR ? 'Rows go across, like seats in a movie theater.' : 'Columns stand up and down, like the columns of a building.' }; }
    if (shape === 'text') return { q: cap(cx[0]) + ' is cut into ' + pl(r, 'row') + ' of same-size squares. Each row has ' + cl + ' ' + cx[1] + '. How many ' + cx[1] + ' are there in all?', a: N(tot), steps: ['Each row has ' + cl + '.', 'Add ' + r + ' rows of ' + cl + ': ' + m(add + ' = ' + tot) + '.'], hint: 'Add ' + cl + ' once for each row.' };
    if (shape === 'each') return { q: cap(cx[0]) + ' is cut into ' + tot + ' same-size squares in ' + pl(r, 'row') + '. Each row has the same number. How many ' + cx[1] + ' are in each row?', a: N(cl), steps: ['Try a number for each row and add it ' + r + ' times.', 'With ' + cl + ' in each row: ' + m(add + ' = ' + tot) + '. That matches.', 'So each row has ' + cl + ' squares.'], hint: 'What number added ' + r + ' times makes ' + tot + '?' };
    return { q: cap(cx[0]) + ' is cut into ' + tot + ' same-size squares. Each row has ' + cl + ' ' + cx[1] + '. How many rows are there?', a: N(r), steps: ['Count by ' + cl + 's until you reach ' + tot + ': ' + range(cl, tot, cl).join(', ') + '.', 'That took ' + r + ' counts, so there are ' + pl(r, 'row') + '.'], hint: 'Count by ' + cl + 's to ' + tot + '.' };
  });

  G('g2.arrays-repeated-addition', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, 'total', R.pick(['total', 'which', 'cols']), R.pick(['each', 'which', 'total', 'rowsFrom']));
    var r = R.int(2, 5), cl = R.int(2, 5); if (r === cl && R.coin()) cl = cl === 5 ? 4 : cl + 1;
    var tot = r * cl, item = R.pick(['dot', 'star', 'heart', 'apple']), word = { dot: 'dots', star: 'stars', heart: 'hearts', apple: 'apples' }[item];
    var viz = { name: 'g2-array', opts: { rows: r, cols: cl, item: item, groups: L === 1 ? 'rows' : undefined } };
    var add = range(1, r, 1).map(function () { return cl; }).join(' + '), addC = range(1, cl, 1).map(function () { return r; }).join(' + ');
    if (shape === 'total') return { q: 'There are ' + pl(r, 'row') + ' of ' + word + '. Add the rows. How many ' + word + ' are there in all?', viz: viz, a: N(tot), steps: ['Each row has ' + cl + ' ' + word + '.', 'Add the equal rows: ' + m(add + ' = ' + tot) + '. (Skip count: ' + range(cl, tot, cl).join(', ') + '.)', 'There are ' + tot + ' ' + word + '.'], hint: 'How many are in one row? Add that number once for each row.' };
    if (shape === 'cols') return { q: 'Add the columns (up and down) to find how many ' + word + ' there are.', viz: viz, a: N(tot), steps: ['There are ' + pl(cl, 'column') + ' with ' + r + ' in each.', m(addC + ' = ' + tot) + '.', 'Adding the rows gives the same total: ' + m(add + ' = ' + tot) + '.'], hint: 'Each column has ' + r + '.' };
    if (shape === 'which') {
      var wrongs = [range(1, r, 1).map(function () { return r; }).join(' + '), r + ' + ' + cl, range(1, r + 1, 1).map(function () { return cl; }).join(' + ')];
      if (r === cl) wrongs[0] = range(1, r - 1, 1).map(function () { return cl; }).join(' + ');
      return { q: 'Which addition adds the rows of this array?', viz: viz, a: mc('$' + add + '$', wrongs.filter(function (w) { return w !== add; }).map(function (w) { return '$' + w + '$'; })), steps: ['There are ' + pl(r, 'row') + '. Each row has ' + cl + '.', 'So add ' + cl + ', ' + r + ' times: ' + m(add) + ', which is ' + tot + '.'], hint: 'How many rows? How many in each row?' };
    }
    if (shape === 'each') return { q: 'An array has ' + pl(r, 'row') + ' and ' + tot + ' ' + word + ' in all. Every row has the same number. How many ' + word + ' are in each row?', a: N(cl), steps: ['Find a number that you can add ' + r + ' times to make ' + tot + '.', m(add + ' = ' + tot) + '.', 'So each row has ' + cl + '.'], hint: 'Try a number and add it ' + r + ' times.' };
    return { q: 'An array has ' + cl + ' ' + word + ' in each row and ' + tot + ' ' + word + ' in all. How many rows does it have?', a: N(r), steps: ['Skip count by ' + cl + 's to ' + tot + ': ' + range(cl, tot, cl).join(', ') + '.', 'That is ' + r + ' counts, so there are ' + pl(r, 'row') + '.'], hint: 'Count by ' + cl + 's.' };
  });

  var SHN = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'] };
  G('g2.equal-shares', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['equal', 'name', 'count']), R.pick(['equal', 'name', 'whole', 'bigger']), R.pick(['diag', 'equal', 'bigger', 'whole', 'name']));
    var n = R.int(2, 4), sh = R.pick(['circle', 'rect', 'square']), kid = kids(R, 1)[0], food = sh === 'circle' ? R.pick(['pizza', 'pie', 'pancake', 'orange slice']) : R.pick(['sandwich', 'brownie', 'piece of toast', 'granola bar', 'flag', 'garden']);
    function item(eq) { var it = { shape: sh, parts: n, equal: eq }; if (sh !== 'circle') it.dir = n === 4 && R.coin() ? 'grid' : R.pick(['v', 'h']); if (n === 3 && it.dir === 'grid') it.dir = 'v'; return it; }
    var aF = (/^[aeiou]/.test(food) ? 'an ' : 'a ') + food;
    if (shape === 'equal') { var eq = R.coin(); return { q: kid.n + ' cut ' + aF + ' into ' + n + ' parts. Is it cut into equal shares?', viz: { name: 'g2-shapes', opts: { items: [item(eq)], label: 'A ' + (sh === 'rect' ? 'rectangle' : sh) + ' cut into ' + n + ' parts' } }, a: mcKeep(['Yes', 'No'], eq ? 0 : 1), steps: ['Equal shares must all be the same size.', eq ? 'All ' + n + ' parts are the same size, so these are equal shares: ' + n + ' ' + SHN[n][1] + '.' : 'Some parts are bigger than others, so these are <b>not</b> equal shares.'], hint: 'Would everyone get the same amount?' }; }
    if (shape === 'count') return { q: kid.n + ' cut ' + aF + ' into equal shares. How many equal shares are there?', viz: { name: 'g2-shapes', opts: { items: [item(true)] } }, a: N(n), steps: ['Count the parts: ' + range(1, n, 1).join(', ') + '.', 'There are ' + n + ' equal shares. Each one is a ' + SHN[n][0] + ' of the whole.'], hint: 'Count the parts.' };
    if (shape === 'name') { var it2 = item(true); it2.shade = 1; return { q: cap(aF) + ' is cut into equal shares. ' + kid.n + ' eats the shaded share. What is that share called?', viz: { name: 'g2-shapes', opts: { items: [it2] } }, a: mcKeep(['A half', 'A third', 'A fourth'], n - 2), steps: ['There are ' + n + ' equal shares.', n === 2 ? '2 equal shares are halves.' : n === 3 ? '3 equal shares are thirds.' : '4 equal shares are fourths (also called quarters).', 'So the shaded share is <b>a ' + SHN[n][0] + '</b> of the ' + food + '.'], hint: 'Count the equal shares first.' }; }
    if (shape === 'whole') return { q: kid.n + ' cuts ' + aF + ' into ' + SHN[n][1] + '. How many ' + SHN[n][1] + ' make the whole ' + food + '?', a: N(n), steps: ['When a whole is cut into ' + SHN[n][1] + ', there are ' + n + ' equal shares.', 'Put them all back together and you have the whole: ' + n + ' ' + SHN[n][1] + ' make 1 whole.'], hint: 'How many equal shares are there when you cut a whole into ' + SHN[n][1] + '?' };
    if (shape === 'bigger') { var pr = R.pick([[2, 3], [2, 4], [3, 4]]), food = R.pick(['pizza', 'sandwich', 'pie', 'granola bar']), ord = R.shuffle(pr);
      return { q: 'Which is bigger: a ' + SHN[ord[0]][0] + ' of a ' + food + ' or a ' + SHN[ord[1]][0] + ' of the same ' + food + '?', viz: { name: 'g2-shapes', opts: { items: [{ shape: food === 'pizza' || food === 'pie' ? 'circle' : 'rect', parts: ord[0], shade: 1, dir: 'v', label: 'A' }, { shape: food === 'pizza' || food === 'pie' ? 'circle' : 'rect', parts: ord[1], shade: 1, dir: 'v', label: 'B' }], label: 'Two same-size shapes: A cut into ' + ord[0] + ' equal shares and B cut into ' + ord[1] + ', one share shaded in each' } }, a: mcKeep(['A ' + SHN[ord[0]][0], 'A ' + SHN[ord[1]][0], 'They are the same size'], ord[0] < ord[1] ? 0 : 1), steps: ['A ' + SHN[pr[0]][0] + ' means the ' + food + ' is shared by ' + pr[0] + '. A ' + SHN[pr[1]][0] + ' means it is shared by ' + pr[1] + '.', 'More equal shares means smaller shares.', 'So <b>a ' + SHN[pr[0]][0] + '</b> is bigger.'], hint: 'Would you rather share with fewer people or more people?' }; }
    // diag: same rectangle cut two ways
    var good = R.coin(), B2 = good ? { shape: 'square', parts: 2, dir: 'diag', shade: 1, label: 'B' } : { shape: 'square', parts: 2, dir: 'v', equal: false, shade: 1, label: 'B' };
    return { q: 'Two same-size squares are cut into 2 parts. Square A is cut into halves. Is square B cut into halves too?', viz: { name: 'g2-shapes', opts: { items: [{ shape: 'square', parts: 2, dir: 'v', shade: 1, label: 'A' }, B2], label: 'Square A cut down the middle; square B cut ' + (good ? 'from corner to corner' : 'off-center') } }, a: mcKeep(['Yes', 'No'], good ? 0 : 1), steps: good ? ['Square B is cut from corner to corner into two triangles.', 'The two triangles are exactly the same size: one would fit on top of the other.', 'So yes: they are halves. Equal shares must be the same size, but they do not have to be the same shape as the halves of A.'] : ['Square B is cut off to one side, so one part is bigger than the other.', 'Halves must be the same size, so square B is <b>not</b> cut into halves.'], hint: 'Halves must be the same size. Do they have to be the same shape?' };
  });
})(window.MathLadder);
