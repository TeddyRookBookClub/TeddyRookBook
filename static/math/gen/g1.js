/* Math Ladder: problem generators for Grade 1 (static/math/gen/g1.js).
   One generator per topic in data/math/topics/g1.json. Problems are mostly pictures with a short question, made for
   young learners and the grown-up reading with them. Pictures use the course visual "g1-pic" (static/math/viz/g1.js)
   and the shared visuals (clock). Built from /tmp/work_mlp1/src (gen_common.js + gen_g1.js); tested by
   /tmp/work_mlp1/test/verify_gen.js and scripts/math/check-gen.js.                                                    */
(function (ML) {
  'use strict';
  var G = ML.gen, PIC = 'g1-pic';
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

  // ================================================================ Grade 1: Adding and Subtracting within 20
  function tens(n) { return n + ' ' + (n === 1 ? 'ten' : 'tens'); }
  function makeTenSteps(a, b) { // a + b, filling a up to ten
    var need = 10 - a, rest = b - need;
    return [a + ' needs ' + need + ' more to make 10.', 'Break ' + b + ' into ' + need + ' and ' + rest + '.', '$' + a + ' + ' + need + ' = 10$, then $10 + ' + rest + ' = ' + (10 + rest) + '$.'];
  }
  function addSteps(a, b) { // a good strategy for a + b within 20
    var s = a + b, big = M.max(a, b), small = M.min(a, b);
    if (a === b) return ['This is a double: $' + a + ' + ' + a + ' = ' + s + '$.'];
    if (big - small === 1) return ['This is a near double: $' + small + ' + ' + small + ' = ' + 2 * small + '$.', 'One more is ' + s + '.'];
    if (s > 10 && big >= 6 && big < 10) return makeTenSteps(big, small);
    if (s === 10) return [small + ' and ' + big + ' make 10.'];
    if (big === 10) return ['10 and ' + small + ' more is ' + s + '.'];
    return ['Start at ' + big + ' and count on ' + small + ': ' + list(seq(big + 1, s)) + '.'];
  }
  function subSteps(c, b) { // c - b within 20
    var d = c - b;
    if (b <= 3) return ['Start at ' + c + ' and count back ' + b + ': ' + list(seq(c - 1, d)) + '.'];
    if (c > 10 && b < 10 && d < 10) return ['Think addition: $' + b + ' + ' + sq() + ' = ' + c + '$.', b + ' and ' + (10 - b) + ' make 10, and ' + (c - 10) + ' more make ' + c + '.', 'So the missing part is ' + (10 - b) + ' + ' + (c - 10) + ' = ' + d + '.'];
    return ['Think: ' + b + ' and what make ' + c + '? $' + b + ' + ' + d + ' = ' + c + '$.'];
  }

  G('g1.count-on-to-add', function (R, ctx) {
    var who = R.pick(NAMES);
    if (ctx.level === 1) {
      var a = R.int(4, 12), b = R.int(1, 3);
      return { q: who + ' finds $' + a + ' + ' + b + '$ on the number path: start at ' + a + ' and count on ' + b + '. What is $' + a + ' + ' + b + '$?', viz: pic({ kind: 'path', from: a - 2, to: a + b + 2, start: a, hops: b, hide: [a + b] }), a: num(a + b),
        steps: ['Start at ' + a + '. Keep ' + a + ' in your head; do not count it again.', 'Count on ' + b + ': ' + list(seq(a + 1, a + b)) + '.', '$' + a + ' + ' + b + ' = ' + (a + b) + '$'], hint: 'The first hop lands on ' + (a + 1) + '.' };
    }
    if (ctx.level === 2) {
      var big = R.int(5, 16), small = R.int(1, M.min(4, 20 - big)), flip = R.coin(), x = flip ? small : big, y = flip ? big : small;
      return { q: who + ' counts on to add. What is $' + x + ' + ' + y + '$?', a: num(big + small),
        steps: (flip ? ['Start at the bigger number, ' + big + '. It is quicker.'] : ['Start at ' + big + '.']).concat(['Count on ' + small + ': ' + list(seq(big + 1, big + small)) + '.', '$' + x + ' + ' + y + ' = ' + (big + small) + '$']), hint: 'Start at ' + big + ' and count on ' + small + '.' };
    }
    var p = R.int(6, 15), q = R.int(2, 4), wrong = p + q - 1;
    return { q: who + ' found $' + p + ' + ' + q + '$ by saying “' + list(seq(p, p + q - 1)) + '.” ' + who + ' said the answer is ' + wrong + '. What is $' + p + ' + ' + q + '$ really?', a: num(p + q),
      steps: [who + ' counted ' + p + ' again as the first step.', 'Start at ' + p + ' and say the next ' + q + ' numbers: ' + list(seq(p + 1, p + q)) + '.', '$' + p + ' + ' + q + ' = ' + (p + q) + '$'], hint: 'The first number you say after ' + p + ' is ' + (p + 1) + '.' };
  });

  G('g1.count-back-to-subtract', function (R, ctx) {
    var who = R.pick(NAMES);
    if (ctx.level === 1) {
      var a = R.int(6, 15), b = R.int(1, 3);
      return { q: who + ' finds $' + a + ' - ' + b + '$ on the number path: start at ' + a + ' and count back ' + b + '. What is $' + a + ' - ' + b + '$?', viz: pic({ kind: 'path', from: a - b - 2, to: a + 1, start: a, hops: b, dir: -1, hide: [a - b] }), a: num(a - b),
        steps: ['Start at ' + a + '. Do not count ' + a + ' as a step.', 'Count back ' + b + ': ' + list(seq(a - 1, a - b)) + '.', '$' + a + ' - ' + b + ' = ' + (a - b) + '$'], hint: 'The first hop back lands on ' + (a - 1) + '.' };
    }
    if (ctx.level === 2) {
      var c = R.int(6, 20), d = R.int(1, 4);
      return { q: who + ' counts back to subtract. What is $' + c + ' - ' + d + '$?', a: num(c - d),
        steps: ['Start at ' + c + '.', 'Count back ' + d + ': ' + list(seq(c - 1, c - d)) + '.', '$' + c + ' - ' + d + ' = ' + (c - d) + '$'], hint: 'Say the numbers backward, starting with ' + (c - 1) + '.' };
    }
    var p = R.int(8, 18), q = R.int(2, 4), wrong = p - q + 1;
    return { q: who + ' found $' + p + ' - ' + q + '$ by saying “' + list(seq(p, p - q + 1)) + '.” ' + who + ' said the answer is ' + wrong + '. What is $' + p + ' - ' + q + '$ really?', a: num(p - q),
      steps: [who + ' said ' + p + ' as the first step back, but ' + p + ' is where you start.', 'Count back ' + q + ' steps: ' + list(seq(p - 1, p - q)) + '.', '$' + p + ' - ' + q + ' = ' + (p - q) + '$'], hint: 'The first step back from ' + p + ' is ' + (p - 1) + '.' };
  });

  G('g1.facts-within-10', function (R, ctx) {
    var add = R.coin(), a, b, c, who = R.pick(NAMES);
    if (add) { a = R.int(1, 8); b = R.int(1, 9 - a); c = a + b; } else { c = R.int(3, 10); b = R.int(1, c - 1); a = c - b; }
    if (ctx.level === 1) {
      if (add) return { q: who + ' shows $' + a + ' + ' + b + '$ on a ten frame. What is $' + a + ' + ' + b + '$?', viz: pic({ layout: 'frame', n: a, m: b, frames: 1, tap: false }), a: num(c),
        steps: [a + ' red and ' + b + ' yellow counters.', c === 10 ? 'The frame is full: 10.' : c > 5 ? 'One full row of 5 and ' + (c - 5) + ' more is ' + c + '.' : 'Count them: ' + countList(1, c) + '.', '$' + a + ' + ' + b + ' = ' + c + '$'], hint: 'Count all the counters. A full row is 5.' };
      return { q: who + ' knows the parts of ' + c + '. What is $' + c + ' - ' + b + '$?', viz: pic({ kind: 'bond', whole: c, a: b, hide: 'b' }), a: num(a),
        steps: [c + ' is ' + b + ' and ' + a + '.', 'Take away the ' + b + ' and ' + a + ' ' + (a === 1 ? 'is' : 'are') + ' left.', '$' + c + ' - ' + b + ' = ' + a + '$'], hint: b + ' and what number make ' + c + '?' };
    }
    if (ctx.level === 2) {
      if (add) return { q: who + '’s fact: $' + a + ' + ' + b + ' = ' + sq() + '$', a: num(c), steps: addSteps(a, b).concat(['$' + a + ' + ' + b + ' = ' + c + '$']), hint: 'Count on from the bigger number, or use a fact you know.' };
      return { q: who + '’s fact: $' + c + ' - ' + b + ' = ' + sq() + '$', a: num(a), steps: subSteps(c, b).concat(['$' + c + ' - ' + b + ' = ' + a + '$']), hint: 'Think: ' + b + ' and what make ' + c + '?' };
    }
    if (R.coin()) return { q: 'If $' + b + ' + ' + a + ' = ' + c + '$, what is $' + c + ' - ' + b + '$?', a: num(a),
      steps: [b + ' and ' + a + ' make ' + c + '.', 'So taking ' + b + ' from ' + c + ' leaves ' + a + '.', '$' + c + ' - ' + b + ' = ' + a + '$'], hint: 'Addition and subtraction use the same three numbers.' };
    return { q: who + ' needs to find the missing number:<br>' + big(b + ' + ' + sq() + ' = ' + c), a: num(a),
      steps: ['Count up from ' + b + ' to ' + c + ', or think ' + c + ' − ' + b + '.', '$' + b + ' + ' + a + ' = ' + c + '$'], hint: 'How many more than ' + b + ' make ' + c + '?' };
  });

  G('g1.add-in-any-order', function (R, ctx) {
    var a = R.int(2, 9), b = R.intNot(1, 9, [a]), s = a + b, who = R.pick(NAMES), t = pickColored(R), cs = colorPair(R, t);
    if (ctx.level === 1) return { q: who + ' has ' + a + ' ' + cs[0] + ' and ' + b + ' ' + cs[1] + ' ' + t.many + '. $' + a + ' + ' + b + ' = ' + s + '$. What is $' + b + ' + ' + a + '$?',
      viz: pic({ groups: [{ n: a, obj: t.obj, color: cs[0] }, { n: b, obj: t.obj, color: cs[1] }], op: '+' }), a: num(s),
      steps: ['$' + b + ' + ' + a + '$ uses the same two groups, just in the other order.', 'Turning the picture around does not change how many there are.', '$' + b + ' + ' + a + ' = ' + s + '$'], hint: 'Is the total any different if you add the other group first?' };
    if (ctx.level === 2) return { q: who + ' says this is true. What number goes in the box?<br>' + big(a + ' + ' + b + ' = ' + b + ' + ' + sq()), a: num(a),
      steps: ['You can add in any order and get the same sum.', 'Both sides need the same two numbers: ' + a + ' and ' + b + '.', '$' + a + ' + ' + b + ' = ' + b + ' + ' + a + '$'], hint: 'Which number is missing from the right side?' };
    if (R.coin()) {
      var x = R.int(1, 3), y = R.int(6, 9);
      return { q: who + ' wants to find $' + x + ' + ' + y + '$ by counting on. Which number is quicker to start from?', a: mc(String(y), [String(x)]),
        steps: ['$' + x + ' + ' + y + ' = ' + y + ' + ' + x + '$, so you may start with either one.', 'Starting at ' + y + ' means counting on only ' + x + ': ' + list(seq(y + 1, x + y)) + '.', 'Start at ' + y + '.'], hint: 'Counting on a small number is quicker.' };
    }
    var wr = ['$' + a + ' + ' + a + '$', '$' + b + ' + ' + b + '$', '$' + (a + 1) + ' + ' + b + '$'];
    return { q: 'Which has the same sum as $' + a + ' + ' + b + '$?', a: mc('$' + b + ' + ' + a + '$', R.sample(wr, 2)),
      steps: ['$' + a + ' + ' + b + ' = ' + s + '$.', 'Adding in the other order gives the same sum: $' + b + ' + ' + a + ' = ' + s + '$.'], hint: 'Look for the same two numbers.' };
  });

  G('g1.doubles-near-doubles', function (R, ctx) {
    var who = R.pick(NAMES), a;
    if (ctx.level === 1) {
      a = R.int(2, 10);
      return { q: who + ' shows a double on two ten frames. What is $' + a + ' + ' + a + '$?', viz: pic({ layout: 'frame', n: a, m: a, split: true, tap: false }), a: num(2 * a),
        steps: ['Each frame has ' + a + '.', a + ' and ' + a + ' is a double.', '$' + a + ' + ' + a + ' = ' + 2 * a + '$'], hint: 'Count one frame, then count on the same number.' };
    }
    a = R.int(2, 9);
    var up = R.coin(), b = up ? a + 1 : a - 1, first = R.coin(), x = first ? a : b, y = first ? b : a, small = M.min(a, b);
    if (ctx.level === 2) return { q: who + ' knows $' + a + ' + ' + a + ' = ' + 2 * a + '$. Use it to find $' + x + ' + ' + y + '$.', a: num(a + b),
      steps: ['$' + x + ' + ' + y + '$ is one ' + (up ? 'more' : 'less') + ' than $' + a + ' + ' + a + '$.', '$' + a + ' + ' + a + ' = ' + 2 * a + '$, and ' + (up ? 'one more is ' : 'one less is ') + (a + b) + '.', '$' + x + ' + ' + y + ' = ' + (a + b) + '$'], hint: (up ? b + ' is one more than ' + a : b + ' is one less than ' + a) + '.' };
    if (R.coin()) return { q: 'Which double helps you find $' + small + ' + ' + (small + 1) + '$?', a: mc('$' + small + ' + ' + small + '$', ['$' + (small + 2) + ' + ' + (small + 2) + '$', '$' + (small + 3) + ' + ' + (small + 3) + '$']),
      steps: ['$' + small + ' + ' + (small + 1) + '$ is close to $' + small + ' + ' + small + '$.', '$' + small + ' + ' + small + ' = ' + 2 * small + '$, so $' + small + ' + ' + (small + 1) + ' = ' + (2 * small + 1) + '$.'], hint: 'Look for a double with one of the same numbers.' };
    return { q: who + ' uses a near double. What is $' + x + ' + ' + y + '$?', a: num(a + b), steps: ['$' + small + ' + ' + small + ' = ' + 2 * small + '$.', 'One more: $' + x + ' + ' + y + ' = ' + (a + b) + '$.'], hint: 'Find the double of the smaller number first.' };
  });

  G('g1.make-ten-to-add', function (R, ctx) {
    var a = R.int(6, 9), b = R.int(11 - a, 9), s = a + b, need = 10 - a, rest = b - need, who = R.pick(NAMES), first = R.coin();
    if (ctx.level === 1) return { q: who + ' moves counters to fill the first ten frame. What number goes in the box?<br>' + big(a + ' + ' + b + ' = 10 + ' + sq()), viz: pic({ layout: 'frame', n: a, m: b, split: true, tap: false }), a: num(rest),
      steps: makeTenSteps(a, b).concat(['So $' + a + ' + ' + b + ' = 10 + ' + rest + '$.']), hint: 'How many yellow counters fill the empty squares in the first frame? How many are left?' };
    if (ctx.level === 2) {
      var x = first ? a : b, y = first ? b : a;
      return { q: who + ' makes a ten to add. What is $' + x + ' + ' + y + '$?', viz: R.coin() ? pic({ layout: 'frame', n: a, m: b, split: true, tap: false }) : undefined, a: num(s),
        steps: makeTenSteps(a, b).concat(['$' + x + ' + ' + y + ' = ' + s + '$']), hint: a + ' needs ' + need + ' more to make 10.' };
    }
    if (R.coin()) return { q: who + ' says $' + a + ' + ' + b + ' = 10 + ' + b + ' = ' + (10 + b) + '$. What is $' + a + ' + ' + b + '$ really?', a: num(s),
      steps: ['To make 10, ' + who + ' moved ' + need + ' from the ' + b + ' over to the ' + a + '.', 'Then only ' + rest + ' are left, not ' + b + '.', '$' + a + ' + ' + b + ' = 10 + ' + rest + ' = ' + s + '$'], hint: 'After you move ' + need + ' to make the ten, how many of the ' + b + ' are left?' };
    return { q: 'To make a ten for $' + a + ' + ' + b + '$, break ' + b + ' into ' + need + ' and what number?', a: num(rest),
      steps: [a + ' needs ' + need + ' to make 10.', b + ' is ' + need + ' and ' + rest + '.', 'So $' + a + ' + ' + b + ' = 10 + ' + rest + ' = ' + s + '$.'], hint: need + ' and what make ' + b + '?' };
  });

  G('g1.subtract-as-missing-addend', function (R, ctx) {
    var b = R.int(ctx.level === 1 ? 5 : 6, 9), d = R.int(11 - b, 9), c = b + d, who = R.pick(NAMES);
    var upSteps = ['From ' + b + ' up to 10 is ' + (10 - b) + '.', 'From 10 up to ' + c + ' is ' + (c - 10) + ' more.', (10 - b) + ' + ' + (c - 10) + ' = ' + d + '.'];
    if (ctx.level === 1) return { q: who + ' thinks addition to subtract: $' + b + ' + ' + sq() + ' = ' + c + '$, so $' + c + ' - ' + b + ' = ' + sq() + '$. What number goes in both boxes?', viz: pic({ kind: 'bond', whole: c, a: b, hide: 'b' }), a: num(d),
      steps: upSteps.concat(['So $' + b + ' + ' + d + ' = ' + c + '$ and $' + c + ' - ' + b + ' = ' + d + '$.']), hint: 'Count up from ' + b + '. Stop at 10 on the way.' };
    if (ctx.level === 2) return { q: who + ' thinks: ' + b + ' plus what makes ' + c + '? What is $' + c + ' - ' + b + '$?', a: num(d),
      steps: ['Think $' + b + ' + ' + sq() + ' = ' + c + '$.'].concat(upSteps).concat(['$' + c + ' - ' + b + ' = ' + d + '$']), hint: 'Count up from ' + b + ' to ' + c + '.' };
    var t = pickThing(R, ['bear']);
    return { q: 'There are ' + w(c, t) + '. ' + b + ' are in a box. The rest are on the table. How many ' + t.many + ' are on the table?', a: num(d),
      steps: ['We need $' + b + ' + ' + sq() + ' = ' + c + '$, which is $' + c + ' - ' + b + '$.'].concat(upSteps).concat(['There are ' + w(d, t) + ' on the table.']), hint: 'Think: ' + b + ' and how many more make ' + c + '?' };
  });

  G('g1.facts-within-20', function (R, ctx) {
    var who = R.pick(NAMES), kind = ML.byLevel(ctx, 'add', 'sub', R.pick(['add', 'sub', 'miss', 'miss']));
    var a = R.int(3, 9), b = R.int(M.max(2, 11 - a), 9), s = a + b;
    if (kind === 'add') { if (R.coin()) { var t0 = a; a = b; b = t0; } return { q: who + '’s fact: $' + a + ' + ' + b + ' = ' + sq() + '$', a: num(s), steps: addSteps(a, b).concat(['$' + a + ' + ' + b + ' = ' + s + '$']), hint: 'Make a ten, or use a double you know.' }; }
    if (kind === 'sub') return { q: who + '’s fact: $' + s + ' - ' + b + ' = ' + sq() + '$', a: num(a), steps: subSteps(s, b).concat(['$' + s + ' - ' + b + ' = ' + a + '$']), hint: 'Think: ' + b + ' and what make ' + s + '?' };
    if (R.coin()) return { q: who + ' needs the missing number:<br>' + big(a + ' + ' + sq() + ' = ' + s), a: num(b), steps: ['The box is the missing part: $' + s + ' - ' + a + '$.'].concat(subSteps(s, a)).concat(['$' + a + ' + ' + b + ' = ' + s + '$']), hint: 'Count up from ' + a + ' to ' + s + '.' };
    return { q: who + ' needs the missing number:<br>' + big(s + ' - ' + sq() + ' = ' + a), a: num(b), steps: ['Think: $' + a + ' + ' + sq() + ' = ' + s + '$.', 'From ' + a + ' up to ' + s + ' is ' + b + '.', '$' + s + ' - ' + b + ' = ' + a + '$'], hint: 'How many must you take away from ' + s + ' to leave ' + a + '?' };
  });

  G('g1.three-addends', function (R, ctx) {
    var p = R.int(1, 9), q = 10 - p, r = R.int(1, 9), who = R.pick(NAMES), order;
    if (ctx.level === 1) order = [p, q, r];
    else if (ctx.level === 2) order = R.pick([[p, r, q], [r, p, q]]);
    else order = R.shuffle([p, q, r]);
    var total = p + q + r, tex = order.join(' + ');
    var steps = ['Look for two numbers that make 10: ' + p + ' and ' + q + '.', '$' + p + ' + ' + q + ' = 10$.', 'Then $10 + ' + r + ' = ' + total + '$.'];
    if (ctx.level === 3 && R.coin()) {
      var t = pickColored(R), cs = R.sample(['red', 'blue', 'green', 'yellow', 'purple'], 3);
      return { q: who + ' has ' + order[0] + ' ' + cs[0] + ', ' + order[1] + ' ' + cs[1] + ' and ' + order[2] + ' ' + cs[2] + ' ' + t.many + '. How many ' + t.many + ' in all?', a: num(total), steps: ['Add: $' + tex + '$.'].concat(steps), hint: 'Find two numbers that make 10 first.' };
    }
    return { q: who + ' adds three numbers. What is $' + tex + '$?', a: num(total), steps: (order[0] === p && order[1] === q ? [] : ['You can add in any order.']).concat(steps), hint: 'Which two numbers make 10?' };
  });

  // ================================================================ Grade 1: The Equal Sign and Word Problems
  G('g1.equal-sign', function (R, ctx) {
    var who = R.pick(NAMES);
    if (ctx.level === 1) {
      var a = R.int(1, 8), b = R.int(1, 9 - a), s = a + b;
      if (R.coin()) return { q: who + ' put the answer first. What number goes in the box?<br>' + big(sq() + ' = ' + a + ' + ' + b), viz: pic({ kind: 'balance', left: [{ text: '?' }], right: [{ text: a + ' + ' + b }], tilt: 'level' }), a: num(s),
        steps: ['= means both sides are the same amount.', a + ' + ' + b + ' is ' + s + '.', 'So $' + s + ' = ' + a + ' + ' + b + '$. Both sides are ' + s + '.'], hint: 'The box must be the same amount as ' + a + ' + ' + b + '.' };
      return { q: who + ' keeps the scale level. What number goes in the box?<br>' + big(s + ' = ' + a + ' + ' + sq()), viz: pic({ kind: 'balance', left: [{ text: String(s) }], right: [{ text: a + ' + ?' }], tilt: 'level' }), a: num(b),
        steps: ['Both sides must be ' + s + '.', a + ' and ' + b + ' make ' + s + '.', '$' + s + ' = ' + a + ' + ' + b + '$'], hint: a + ' and what make ' + s + '?' };
    }
    if (ctx.level === 2) {
      var x = R.int(2, 8), y = R.int(2, 9), k = R.intNot(1, M.min(9, x + y - 1), [x, y]), m = x + y - k;
      return { q: who + ' says the scale is level. What number goes in the box?<br>' + big(x + ' + ' + y + ' = ' + sq() + ' + ' + k), viz: pic({ kind: 'balance', left: [{ text: x + ' + ' + y }], right: [{ text: '? + ' + k }], tilt: 'level' }), a: num(m),
        steps: ['Left side: $' + x + ' + ' + y + ' = ' + (x + y) + '$.', 'The right side must also be ' + (x + y) + '.', 'What goes with ' + k + ' to make ' + (x + y) + '? ' + m + '.', 'Check: $' + m + ' + ' + k + ' = ' + (x + y) + '$. Both sides are ' + (x + y) + '.'], hint: 'First find ' + x + ' + ' + y + '. Then what goes with ' + k + ' to make that?' };
    }
    if (R.coin()) {
      var u = R.int(2, 8), v = R.int(2, 8), kk = R.intNot(1, M.min(9, u + v - 1), [u, v]), mm = u + v - kk;
      return { q: who + ' wrote ' + (u + v) + ' in the box. Fix it! What number makes this true?<br>' + big(u + ' + ' + v + ' = ' + kk + ' + ' + sq()), a: num(mm),
        steps: [who + ' just added ' + u + ' + ' + v + '. But = does not mean "the answer comes next."', 'Both sides must be the same amount: ' + (u + v) + '.', kk + ' + ' + mm + ' = ' + (u + v) + ', so the box is ' + mm + '.'], hint: 'What goes with ' + kk + ' to make ' + (u + v) + '?' };
    }
    return { q: who + ' asks: what does the = sign mean?', a: mc('Both sides are the same amount', ['The answer comes next', 'Add the numbers', 'The left side is bigger']),
      steps: ['= is like a level balance.', 'It says both sides are the same amount. The answer can be on either side.'], hint: 'Think of a balance that is level.' };
  });

  G('g1.true-false-equations', function (R, ctx) {
    var truth = R.coin(), L, Rt, lv, rv;
    function pk() {
      if (ctx.level === 1) {
        var a = R.int(1, 9), b = R.int(1, 9), s = a + b;
        return R.pick([[a + ' + ' + b, s, String(s), s], [String(s), s, a + ' + ' + b, s], [String(a), a, String(a), a]]);
      }
      if (ctx.level === 2) {
        var c = R.int(1, 9), d = R.int(1, 9), e = R.int(1, 9), f = c + d - e;
        if (f < 1) { e = 1; f = c + d - 1; }
        return R.pick([[c + ' + ' + d, c + d, d + ' + ' + c, c + d], [c + ' + ' + d, c + d, e + ' + ' + f, c + d], [(c + d) + ' - ' + d, c, String(c), c]]);
      }
      var g = R.int(8, 18), h = R.int(1, 7), i2 = R.int(1, 9), j = g - h + i2;
      return R.pick([[g + ' - ' + h, g - h, (g - h - 1) + ' + 1', g - h], [g + ' - ' + h, g - h, j + ' - ' + i2, g - h]]);
    }
    var p = pk(); L = p[0]; lv = p[1]; Rt = p[2]; rv = p[3];
    if (!truth) { // change the right side so it is off by 1 or 2
      var off = R.pick([1, 2, -1]);
      if (/^\d+$/.test(Rt)) { Rt = String(Number(Rt) + off); rv = Number(Rt); }
      else {
        var parts = Rt.split(' '), n2 = Number(parts[2]) + (parts[1] === '+' ? off : -off);
        if (n2 < 1) n2 += 3;
        parts[2] = String(n2); Rt = parts.join(' '); rv = parts[1] === '+' ? Number(parts[0]) + n2 : Number(parts[0]) - n2;
      }
    }
    var ok = lv === rv;
    if (R.coin()) { var tt = L; L = Rt; Rt = tt; var tv = lv; lv = rv; rv = tv; }
    function side(s, v) { return /\s/.test(s) ? '$' + s + ' = ' + v + '$' : String(v); }
    return { q: R.pick(NAMES) + ' wrote this. True or false?<br>' + big(L + ' = ' + Rt), a: { t: 'tf', v: ok },
      steps: ['Left side: ' + side(L, lv) + '.', 'Right side: ' + side(Rt, rv) + '.', ok ? 'Both sides are ' + lv + ', so it is true.' : lv + ' and ' + rv + ' are not the same amount, so it is false.'], hint: 'Work out each side. Are they the same amount?' };
  });

  G('g1.missing-number', function (R, ctx) {
    var a = R.int(2, 9), b = R.int(2, 9), c = a + b, who = R.pick(NAMES), kind = ML.byLevel(ctx, 'addB', R.pick(['subB', 'addA']), R.pick(['subStart', 'eqLeft', 'subB']));
    if (kind === 'addB') return { q: who + ' needs the missing number:<br>' + big(a + ' + ' + sq() + ' = ' + c), a: num(b),
      steps: ['Think: ' + a + ' and how many more make ' + c + '?', 'Count up from ' + a + ' to ' + c + ': that is ' + b + '. (Or find ' + c + ' − ' + a + '.)', 'Check: $' + a + ' + ' + b + ' = ' + c + '$'], hint: 'Do not add ' + a + ' and ' + c + '. The ' + c + ' is the total.' };
    if (kind === 'addA') return { q: who + ' needs the missing number:<br>' + big(sq() + ' + ' + b + ' = ' + c), a: num(a),
      steps: ['What number and ' + b + ' make ' + c + '?', c + ' − ' + b + ' = ' + a + '.', 'Check: $' + a + ' + ' + b + ' = ' + c + '$'], hint: c + ' is the total. Take away the part you know.' };
    if (kind === 'subB') return { q: who + ' needs the missing number:<br>' + big(c + ' - ' + sq() + ' = ' + a), a: num(b),
      steps: ['Start with ' + c + '. How many go away to leave ' + a + '?', 'From ' + a + ' up to ' + c + ' is ' + b + '.', 'Check: $' + c + ' - ' + b + ' = ' + a + '$'], hint: 'Count up from ' + a + ' to ' + c + '.' };
    if (kind === 'subStart') return { q: who + ' needs the missing number:<br>' + big(sq() + ' - ' + b + ' = ' + a), a: num(c),
      steps: ['Some number take away ' + b + ' leaves ' + a + '.', 'Put the ' + b + ' back: ' + a + ' + ' + b + ' = ' + c + '.', 'Check: $' + c + ' - ' + b + ' = ' + a + '$'], hint: 'What you start with is the biggest number here. Add ' + a + ' and ' + b + '.' };
    return { q: who + ' needs the missing number:<br>' + big(c + ' = ' + a + ' + ' + sq()), a: num(b),
      steps: ['= means both sides are the same amount.', a + ' and ' + b + ' make ' + c + '.', 'Check: $' + c + ' = ' + a + ' + ' + b + '$'], hint: a + ' and what make ' + c + '?' };
  });

  var VERB_GET = [['stickers', 'gets', 'got'], ['shells', 'finds', 'found'], ['marbles', 'wins', 'won'], ['stamps', 'gets', 'got'], ['crayons', 'gets', 'got'], ['rocks', 'finds', 'found'], ['beads', 'buys', 'bought']];
  G('g1.add-to-take-from', function (R, ctx) {
    var who = R.pick(NAMES), it = R.pick(VERB_GET), thing = it[0], add = R.coin(), a = R.int(3, 12), b = R.int(2, M.min(9, 20 - a)), c = a + b;
    var kind = ML.byLevel(ctx, 'result', 'change', 'start');
    if (kind === 'result') {
      if (add) return { q: who + ' has ' + a + ' ' + thing + '. ' + who + ' ' + it[1] + ' ' + b + ' more. How many ' + thing + ' does ' + who + ' have now?', viz: c <= 10 ? pic({ groups: [{ n: a, obj: 'dot', color: 'blue' }, { n: b, obj: 'dot', color: 'yellow' }], op: '+' }) : undefined, a: num(c),
        steps: ['Some are added, so we add: $' + a + ' + ' + b + ' = ' + sq() + '$.'].concat(addSteps(a, b)).concat(['$' + a + ' + ' + b + ' = ' + c + '$. ' + who + ' has ' + c + ' ' + thing + '.']), hint: 'Start with ' + a + ' and add ' + b + '.' };
      return { q: who + ' has ' + c + ' ' + thing + '. ' + who + ' gives ' + b + ' away. How many ' + thing + ' does ' + who + ' have left?', viz: c <= 10 ? pic({ n: c, obj: 'dot', color: 'blue', cross: b }) : undefined, a: num(a),
        steps: ['Some are taken away, so we subtract: $' + c + ' - ' + b + ' = ' + sq() + '$.'].concat(subSteps(c, b)).concat(['$' + c + ' - ' + b + ' = ' + a + '$. ' + who + ' has ' + a + ' left.']), hint: 'Start with ' + c + ' and take away ' + b + '.' };
    }
    if (kind === 'change') {
      if (add) return { q: who + ' had ' + a + ' ' + thing + '. Then ' + who + ' ' + it[2] + ' some more. Now ' + who + ' has ' + c + '. How many more did ' + who + ' get?', a: num(b),
        steps: ['$' + a + ' + ' + sq() + ' = ' + c + '$', 'Count up from ' + a + ' to ' + c + ', or find ' + c + ' − ' + a + '.', 'The missing part is ' + b + '. ' + who + ' got ' + b + ' more.'], hint: 'Count up from ' + a + ' to ' + c + '.' };
      return { q: who + ' had ' + c + ' ' + thing + '. ' + who + ' gave some to a friend. Now ' + who + ' has ' + a + '. How many did ' + who + ' give away?', a: num(b),
        steps: ['$' + c + ' - ' + sq() + ' = ' + a + '$', 'From ' + a + ' up to ' + c + ' is ' + b + '.', who + ' gave away ' + b + '.'], hint: 'How many go from ' + c + ' down to ' + a + '?' };
    }
    if (add) return { q: who + ' had some ' + thing + '. Then ' + who + ' ' + it[2] + ' ' + b + ' more. Now ' + who + ' has ' + c + '. How many ' + thing + ' did ' + who + ' have at first?', a: num(a),
      steps: ['$' + sq() + ' + ' + b + ' = ' + c + '$', 'Take away the ' + b + ' new ones: $' + c + ' - ' + b + ' = ' + a + '$.', who + ' had ' + a + ' at first. Check: $' + a + ' + ' + b + ' = ' + c + '$.'], hint: 'Undo the ' + b + ' that came: take them away from ' + c + '.' };
    return { q: who + ' had some ' + thing + '. ' + who + ' gave ' + b + ' away. Now ' + who + ' has ' + a + '. How many ' + thing + ' did ' + who + ' have at first?', a: num(c),
      steps: ['$' + sq() + ' - ' + b + ' = ' + a + '$', 'Put the ' + b + ' back: $' + a + ' + ' + b + ' = ' + c + '$.', who + ' had ' + c + ' at first. Check: $' + c + ' - ' + b + ' = ' + a + '$.'], hint: 'Put back the ones that were given away.' };
  });

  G('g1.put-together-take-apart', function (R, ctx) {
    var t = pickColored(R), cs = colorPair(R, t), who = R.pick(NAMES), a = R.int(2, 10), b = R.int(2, M.min(10, 20 - a)), c = a + b;
    if (ctx.level === 1) return { q: 'In ' + who + '’s box there are ' + a + ' ' + cs[0] + ' ' + t.many + ' and ' + b + ' ' + cs[1] + ' ' + t.many + '. How many ' + t.many + ' are in the box?',
      viz: pic({ groups: [{ n: a, obj: t.obj, color: cs[0], layout: a > 5 ? 'grid' : 'row' }, { n: b, obj: t.obj, color: cs[1], layout: b > 5 ? 'grid' : 'row' }], op: 'and' }), a: num(c),
      steps: ['Two parts make the whole: put them together.'].concat(addSteps(a, b)).concat(['$' + a + ' + ' + b + ' = ' + c + '$']), hint: 'Add the two parts.' };
    if (ctx.level === 2) return { q: who + ' has ' + c + ' ' + t.many + '. ' + a + ' are ' + cs[0] + '. The rest are ' + cs[1] + '. How many are ' + cs[1] + '?', a: num(b),
      steps: ['The whole is ' + c + '. One part is ' + a + '.', '$' + a + ' + ' + sq() + ' = ' + c + '$, or $' + c + ' - ' + a + ' = ' + sq() + '$.'].concat(subSteps(c, a)).concat([b + ' are ' + cs[1] + '.']), hint: 'Take the ' + cs[0] + ' ones away from the whole.' };
    var c2 = R.int(6, 14), p = R.int(1, c2 - 1), q = c2 - p;
    return { q: who + ' has ' + c2 + ' ' + t.many + '. Some are ' + cs[0] + ' and the rest are ' + cs[1] + '. Which could be true?',
      a: mc(p + ' ' + cs[0] + ' and ' + q + ' ' + cs[1], [p + ' ' + cs[0] + ' and ' + (q + 1) + ' ' + cs[1], (p > 1 ? p - 1 : p + 2) + ' ' + cs[0] + ' and ' + (p > 1 ? q : q + 1) + ' ' + cs[1]]),
      steps: ['The two parts must add up to ' + c2 + '.', '$' + p + ' + ' + q + ' = ' + c2 + '$, so ' + p + ' ' + cs[0] + ' and ' + q + ' ' + cs[1] + ' could be true.', 'Other ways work too, but the other choices do not make ' + c2 + '.'], hint: 'Add each pair. Which one makes ' + c2 + '?' };
  });

  G('g1.compare-stories', function (R, ctx) {
    var nm = names(R, 2), A = nm[0], B = nm[1], it = R.pick(['shells', 'stickers', 'apples', 'marbles', 'books', 'blocks', 'stamps']), big = R.int(6, 15), d = R.int(2, M.min(8, big - 1)), small = big - d;
    var lv = ctx.level, kind = lv === 1 ? R.pick(['more', 'fewer']) : lv === 2 ? R.pick(['bigU', 'smallU']) : R.pick(['bigFewer', 'smallMore', 'more']);
    if (kind === 'more' || kind === 'fewer') {
      var view = lv === 1 && big <= 12 ? pic({ groups: [{ n: big, obj: 'dot', color: 'blue', label: A }, { n: small, obj: 'dot', color: 'orange', label: B }], stack: true, rows: true, size: 16 }) : undefined;
      var q = kind === 'more' ? A + ' has ' + big + ' ' + it + '. ' + B + ' has ' + small + ' ' + it + '. How many more ' + it + ' does ' + A + ' have than ' + B + '?' : A + ' has ' + big + ' ' + it + '. ' + B + ' has ' + small + ' ' + it + '. How many fewer ' + it + ' does ' + B + ' have than ' + A + '?';
      return { q: q, viz: view, a: num(d),
        steps: ['We are comparing, so we find the difference. We do not add.', '$' + small + ' + ' + sq() + ' = ' + big + '$, or $' + big + ' - ' + small + ' = ' + sq() + '$.', 'From ' + small + ' up to ' + big + ' is ' + d + '.', (kind === 'more' ? A + ' has ' + d + ' more.' : B + ' has ' + d + ' fewer.')], hint: 'Match them up. How many of ' + A + '’s have no partner?' };
    }
    if (kind === 'bigU') return { q: B + ' has ' + small + ' ' + it + '. ' + A + ' has ' + d + ' more than ' + B + '. How many ' + it + ' does ' + A + ' have?', a: num(big),
      steps: [A + ' has the same as ' + B + ', plus ' + d + ' more.', '$' + small + ' + ' + d + ' = ' + big + '$', A + ' has ' + big + ' ' + it + '.'], hint: A + ' has more, so ' + A + '’s number is bigger than ' + small + '.' };
    if (kind === 'smallU') return { q: A + ' has ' + big + ' ' + it + '. ' + B + ' has ' + d + ' fewer than ' + A + '. How many ' + it + ' does ' + B + ' have?', a: num(small),
      steps: [B + ' has ' + d + ' fewer, so take ' + d + ' away from ' + big + '.', '$' + big + ' - ' + d + ' = ' + small + '$', B + ' has ' + small + ' ' + it + '.'], hint: B + ' has fewer, so ' + B + '’s number is smaller than ' + big + '.' };
    if (kind === 'bigFewer') return { q: B + ' has ' + d + ' fewer ' + it + ' than ' + A + '. ' + B + ' has ' + small + '. How many ' + it + ' does ' + A + ' have?', a: num(big),
      steps: ['The word "fewer" is about ' + B + '. ' + B + ' has fewer, so ' + A + ' has more.', A + ' has ' + d + ' more than ' + B + ': $' + small + ' + ' + d + ' = ' + big + '$.', A + ' has ' + big + ' ' + it + '.'], hint: 'Who has more? Their number must be the bigger one.' };
    return { q: A + ' has ' + d + ' more ' + it + ' than ' + B + '. ' + A + ' has ' + big + '. How many ' + it + ' does ' + B + ' have?', a: num(small),
      steps: ['The word "more" is about ' + A + '. ' + A + ' has more, so ' + B + ' has fewer.', 'Take the extra ' + d + ' away: $' + big + ' - ' + d + ' = ' + small + '$.', B + ' has ' + small + ' ' + it + '.'], hint: 'Who has fewer? Their number must be the smaller one.' };
  });

  // ================================================================ Grade 1: Tens and Ones
  G('g1.count-to-120', function (R, ctx) {
    var who = R.pick(NAMES);
    if (ctx.level === 1) {
      var a = R.int(95, 116);
      return { q: who + ' is counting. What number comes next?<br>' + big(list([a, a + 1, a + 2]) + ', ' + sq()), a: num(a + 3),
        steps: [(a + 3) === 100 ? 'After 99 comes 100: ten tens.' : (a + 3) % 10 === 0 ? 'After ' + (a + 2) + ' comes a new ten: ' + (a + 3) + '.' : 'Count on by ones: ' + list([a, a + 1, a + 2, a + 3]) + '.', 'The next number is ' + (a + 3) + '.'], hint: 'Count on from ' + (a + 2) + '.' };
    }
    if (ctx.level === 2) {
      var start = R.pick([81, 91, 101]), ask = M.min(120, start + R.int(2, 19));
      return { q: who + ' covered a square on the chart. What number goes in the <b>?</b> square?', viz: pic({ kind: 'chart', start: start, rows: 2, cols: 10, ask: ask }), a: num(ask),
        steps: ['Each square is 1 more than the one before it. Each row down is 10 more.', 'The square before it is ' + (ask - 1) + ', so the ? is ' + ask + '.'], hint: 'Look at the square just before it, or the one just above it.' };
    }
    var x = R.int(1, 20), n = 100 + x;
    if (R.coin()) return { q: 'Which is the number <b>' + U.words(n) + '</b>?', a: mc(n, ['100' + x, x < 10 ? '1' + x : '10' + x, String(100 + (x + 10 <= 20 ? x + 10 : x - 10))]),
      steps: [cap(U.words(n)) + ' is 100 and ' + x + ' more.', 'We do not write 100 and then ' + x + ' side by side. The ' + x + ' fills the last ' + (x >= 10 ? 'two places' : 'place') + ': ' + n + '.', 'Count on from 100 to check: 101, 102 … ' + n + '.'], hint: 'One hundred ' + U.words(x) + ' has 3 digits, starting with 1.' };
    return { q: who + ' needs to write the number ' + U.words(n) + '. Type it.', a: num(n),
      steps: [cap(U.words(n)) + ' is 100 and ' + x + ' more.', 'We write it with 3 digits: ' + n + '.'], hint: 'It has 3 digits and starts with 1.' };
  });

  G('g1.tens-and-ones', function (R, ctx) {
    var t = R.int(1, 9), o = R.int(0, 9), n = 10 * t + o, who = R.pick(NAMES);
    if (ctx.level === 1) return { q: who + ' built a number with ten-sticks and single cubes. What number is it?', viz: pic({ kind: 'blocks', tens: t, ones: o }), a: num(n),
      steps: ['Count the tens: ' + t + ' ' + (t === 1 ? 'ten is' : 'tens is') + ' ' + 10 * t + '.', o ? 'Count the ones: ' + o + '.' : 'There are no single cubes: 0 ones.', t + ' ' + (t === 1 ? 'ten' : 'tens') + ' and ' + o + ' ' + (o === 1 ? 'one' : 'ones') + ' is ' + n + '.'], hint: 'Count the ten-sticks by tens: 10, 20, 30 …' };
    if (ctx.level === 2) {
      if (o === 0) { o = R.int(1, 9); n = 10 * t + o; }
      if (R.coin()) {
        var askT = R.coin(), v = askT ? t : o;
        return { q: who + ' asks: how many <b>' + (askT ? 'tens' : 'ones') + '</b> are in ' + n + '?', a: num(v),
          steps: [n + ' is ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + ' and ' + o + ' ' + (o === 1 ? 'one' : 'ones') + '.', 'The left digit tells the tens; the right digit tells the ones.', 'The answer is ' + v + '.'], hint: 'In a two-digit number, the left digit counts tens.' };
      }
      return { q: who + ' has ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + ' and ' + o + ' ' + (o === 1 ? 'one' : 'ones') + '. What number is that?', a: num(n), steps: [t + ' ' + (t === 1 ? 'ten is' : 'tens is') + ' ' + 10 * t + '.', 10 * t + ' and ' + o + ' more is ' + n + '.'], hint: 'Write the tens digit first, then the ones digit.' };
    }
    if (R.coin()) {
      if (o === 0 || o === t) { o = t === 9 ? 1 : t + 1; n = 10 * t + o; }
      return { q: 'In ' + n + ', what is the ' + t + ' worth?', a: mc(String(10 * t), [String(t), String(n), String(10 * o)]),
        steps: ['The ' + t + ' is in the tens place.', 'It means ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + ', which is ' + 10 * t + '.', 'The ' + o + ' is worth just ' + o + '.'], hint: 'Which place is the ' + t + ' in?' };
    }
    var t2 = R.int(1, 7), o2 = R.int(10, 15), n2 = 10 * t2 + o2;
    return { q: who + ' has ' + t2 + ' ten-' + (t2 === 1 ? 'stick' : 'sticks') + ' and ' + o2 + ' single cubes. How many cubes is that in all?', viz: pic({ kind: 'blocks', tens: t2, ones: o2 }), a: num(n2),
      steps: [o2 + ' ones is enough to make another ten: 10 ones and ' + (o2 - 10) + ' more.', 'Now there are ' + (t2 + 1) + ' tens and ' + (o2 - 10) + ' ' + (o2 - 10 === 1 ? 'one' : 'ones') + '.', 'That is ' + n2 + '.'], hint: 'Bundle 10 of the single cubes into a new ten.' };
  });

  G('g1.count-by-tens', function (R, ctx) {
    var who = R.pick(NAMES);
    if (ctx.level === 1) {
      var t = R.int(2, 9);
      return { q: who + ' has these ten-sticks. Count by tens. How many cubes in all?', viz: pic({ kind: 'blocks', tens: t, ones: 0 }), a: num(10 * t),
        steps: ['Each stick is 10 cubes.', 'Count by tens: ' + list(seq(1, t).map(function (k) { return 10 * k; })) + '.', t + ' tens is ' + 10 * t + '.'], hint: 'Say 10, 20, 30 … one number for each stick.' };
    }
    if (ctx.level === 2) {
      if (R.coin()) {
        var d = R.int(1, 6), s4 = [d, d + 1, d + 2].map(function (k) { return 10 * k; });
        return { q: who + ' counts by tens. What comes next?<br>' + big(list(s4) + ', ' + sq()), a: num(10 * d + 30), steps: ['Each jump is one more ten.', list(s4) + ', ' + (10 * d + 30) + '.'], hint: 'Add one more ten to ' + s4[2] + '.' };
      }
      var k = R.int(2, 9);
      return { q: who + ' has ' + k + ' bags of 10 marbles. ' + k + ' tens is what number?', a: num(10 * k), steps: ['Count by tens ' + k + ' times: ' + list(seq(1, k).map(function (x) { return 10 * x; })) + '.', k + ' tens is ' + 10 * k + '.'], hint: 'Count 10, 20, 30 … and stop after ' + k + ' tens.' };
    }
    if (R.coin()) { var m = R.int(2, 9); return { q: who + ' asks: how many tens make ' + 10 * m + '?', a: num(m), steps: ['Count by tens up to ' + 10 * m + ': ' + list(seq(1, m).map(function (x) { return 10 * x; })) + '.', 'That is ' + m + ' tens.'], hint: 'Count by tens and keep track on your fingers.' }; }
    var s0 = R.int(1, 9) + 10 * R.int(0, 3), s5 = [s0, s0 + 10, s0 + 20];
    return { q: who + ' counts by tens starting at ' + s0 + '. What comes next?<br>' + big(list(s5) + ', ' + sq()), a: num(s0 + 30),
      steps: ['Each jump is 10 more: the tens digit goes up by 1, and the ones digit stays ' + (s0 % 10) + '.', list(s5) + ', ' + (s0 + 30) + '.'], hint: 'Only the tens digit changes.' };
  });

  G('g1.compare-two-digit', function (R, ctx) {
    var a, b, who = R.pick(NAMES);
    if (ctx.level === 1) {
      do { a = R.int(10, 99); b = R.int(10, 99); } while (Math.floor(a / 10) === Math.floor(b / 10));
      return { q: who + ' built two numbers. Which number is greater?', viz: pic({ kind: 'blocks', items: [{ tens: Math.floor(a / 10), ones: a % 10, name: String(a) }, { tens: Math.floor(b / 10), ones: b % 10, name: String(b) }] }), a: mc(String(M.max(a, b)), [String(M.min(a, b))]),
        steps: ['Compare the tens first: ' + tens(Math.floor(a / 10)) + ' and ' + tens(Math.floor(b / 10)) + '.', 'More tens means a greater number, no matter the ones.', M.max(a, b) + ' is greater than ' + M.min(a, b) + '.'], hint: 'Which one has more ten-sticks?' };
    }
    if (ctx.level === 2) {
      var tt = R.int(1, 9); a = 10 * tt + R.int(0, 9); b = R.chance(0.15) ? a : 10 * tt + R.intNot(0, 9, [a % 10]);
      if (R.chance(0.4)) b = R.int(10, 99);
    } else if (R.coin()) { var x = R.int(1, 9), y = R.intNot(1, 9, [x]); a = 10 * x + y; b = 10 * y + x; }
    else { var t3 = R.int(2, 9); a = 10 * (t3 - 1) + R.int(6, 9); b = 10 * t3 + R.int(0, 3); if (R.coin()) { var tmp = a; a = b; b = tmp; } }
    var sign = a < b ? '<' : a > b ? '>' : '=', ta = Math.floor(a / 10), tb = Math.floor(b / 10);
    var steps = ta !== tb ? ['Compare the tens first: ' + tens(ta) + ' and ' + tens(tb) + '.', (ta > tb ? a : b) + ' has more tens, so it is greater.'] : ['The tens are the same: ' + tens(ta) + ' each.', a === b ? 'The ones are the same too.' : 'Compare the ones: ' + (a % 10) + ' and ' + (b % 10) + '.'];
    steps.push('$' + a + ' ' + sign + ' ' + b + '$. ' + (sign === '=' ? 'They are equal.' : 'The open side of the sign faces the greater number.'));
    return { q: who + ' compares two numbers. Which sign goes in the box?<br>' + big(a + ' ' + sq() + ' ' + b), a: mcKeep(['$<$', '$=$', '$>$'], sign === '<' ? 0 : sign === '=' ? 1 : 2), steps: steps,
      hint: '< means "is less than" and > means "is greater than." Compare the tens first.' };
  });

  G('g1.ten-more-ten-less', function (R, ctx) {
    var who = R.pick(NAMES), more = ctx.level === 1 ? true : ctx.level === 2 ? false : R.coin(), n = more ? R.int(11, 89) : R.int(20, 99);
    var ans = more ? n + 10 : n - 10, view;
    if (ctx.level === 1) view = pic({ kind: 'chart', start: Math.floor((n - 1) / 10) * 10 + 1, rows: 2, cols: 10, mark: [n], ask: ans });
    var wrongNote = more ? 'Not ' + (n + 1) + ': that is only 1 more.' : 'Not ' + (n - 1) + ': that is only 1 less.';
    if (ctx.level === 3 && R.coin()) return { q: who + ' says 10 ' + (more ? 'more' : 'less') + ' than ' + n + ' is ' + (more ? n + 1 : n - 1) + '. What is 10 ' + (more ? 'more' : 'less') + ' than ' + n + '?', a: num(ans),
      steps: [who + ' changed the ones digit. That is 1 ' + (more ? 'more' : 'less') + ', not 10.', '10 ' + (more ? 'more' : 'less') + ' changes the tens: ' + Math.floor(n / 10) + ' tens becomes ' + Math.floor(ans / 10) + ' tens. The ones stay ' + (n % 10) + '.', 'The answer is ' + ans + '.'], hint: 'Which digit shows the tens?' };
    return { q: who + ' asks: what is 10 ' + (more ? 'more' : 'less') + ' than ' + n + '?' + (view ? ' (On the chart, 10 more is one row down.)' : ''), viz: view, a: num(ans),
      steps: [n + ' is ' + Math.floor(n / 10) + ' tens and ' + (n % 10) + ' ones.', '10 ' + (more ? 'more' : 'less') + ' is one ' + (more ? 'more' : 'less') + ' ten: ' + Math.floor(ans / 10) + ' tens and ' + (n % 10) + ' ones.', 'That is ' + ans + '. ' + wrongNote], hint: 'Only the tens digit changes.' };
  });

  G('g1.add-tens', function (R, ctx) {
    var t = R.int(1, 7), o = R.int(1, 9), n = 10 * t + o, k = R.int(1, 9 - t), s = n + 10 * k, who = R.pick(NAMES);
    if (ctx.level === 1) return { q: who + ' adds the blue ten-sticks. What is $' + n + ' + ' + 10 * k + '$?', viz: pic({ kind: 'blocks', tens: t, ones: o, tens2: k }), a: num(s),
      steps: [n + ' is ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + ' and ' + o + ' ones. ' + 10 * k + ' is ' + k + ' ' + (k === 1 ? 'ten' : 'tens') + '.', 'Add the tens: ' + t + ' + ' + k + ' = ' + (t + k) + ' tens. The ones stay ' + o + '.', '$' + n + ' + ' + 10 * k + ' = ' + s + '$'], hint: 'Count on by tens from ' + n + ': ' + (n + 10) + ', …' };
    if (ctx.level === 2) { var flip = R.coin(); return { q: who + ' adds tens. What is $' + (flip ? 10 * k + ' + ' + n : n + ' + ' + 10 * k) + '$?', a: num(s),
      steps: ['Add tens to tens: ' + tens(t) + ' + ' + tens(k) + ' = ' + tens(t + k) + '.', 'The ones do not change: ' + o + '.', 'The answer is ' + s + '.'], hint: 'Count on by tens from ' + n + '.' }; }
    if (R.coin()) return { q: who + ' has ' + n + ' stickers and gets ' + k + ' more ' + (k === 1 ? 'pack' : 'packs') + ' of 10. How many stickers now?', a: num(s),
      steps: [k + ' ' + (k === 1 ? 'pack' : 'packs') + ' of 10 is ' + 10 * k + '.', '$' + n + ' + ' + 10 * k + '$: add ' + k + ' to the tens digit.', who + ' has ' + s + ' stickers.'], hint: 'Count on by tens from ' + n + '.' };
    return { q: who + ' needs the missing number:<br>' + big(n + ' + ' + sq() + ' = ' + s), a: num(10 * k),
      steps: ['The ones stay the same: ' + o + '.', 'The tens go from ' + t + ' to ' + (t + k) + ': that is ' + k + ' ' + (k === 1 ? 'ten' : 'tens') + '.', 'The box is ' + 10 * k + '.'], hint: 'Compare the tens digits of ' + n + ' and ' + s + '.' };
  });

  G('g1.add-within-100', function (R, ctx) {
    var t = R.int(1, 8), o = R.int(0, 8), b = R.int(1, 9 - o), n = 10 * t + o, s = n + b, who = R.pick(NAMES);
    var steps = [n + ' is ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + ' and ' + o + ' ones.', 'Add ones to ones: ' + o + ' + ' + b + ' = ' + (o + b) + ' ones.', 'The tens stay ' + t + '. So the answer is ' + s + '.'];
    if (ctx.level === 1) return { q: who + ' adds the blue cubes. What is $' + n + ' + ' + b + '$?', viz: pic({ kind: 'blocks', tens: t, ones: o, ones2: b }), a: num(s), steps: steps, hint: 'Add the single cubes to the single cubes.' };
    if (ctx.level === 2) { var flip = R.coin(); return { q: who + ' adds. What is $' + (flip ? b + ' + ' + n : n + ' + ' + b) + '$?', a: num(s), steps: steps, hint: 'The ' + b + ' is ' + b + ' ' + (b === 1 ? 'one' : 'ones') + '. Add it to the ones digit.' }; }
    var wrong = n + 10 * b;
    if (R.coin() && wrong < 100) return { q: who + ' says $' + n + ' + ' + b + ' = ' + wrong + '$. What is $' + n + ' + ' + b + '$ really?', a: num(s),
      steps: [who + ' added ' + b + ' to the tens. But ' + b + ' is ' + b + ' ' + (b === 1 ? 'one' : 'ones') + ', not ' + tens(b) + '.'].concat(steps), hint: 'Is ' + b + ' ones or tens?' };
    var it = R.pick(['marbles', 'stickers', 'beads', 'cards']);
    return { q: who + ' has ' + n + ' ' + it + ' and gets ' + b + ' more. How many ' + it + ' now?', a: num(s), steps: ['$' + n + ' + ' + b + '$'].concat(steps), hint: 'Add the ones.' };
  });

  G('g1.make-a-new-ten', function (R, ctx) {
    var t = R.int(1, 8), o = R.int(3, 9), b = R.int(10 - o, 9), n = 10 * t + o, s = n + b, ones = o + b, who = R.pick(NAMES);
    var steps = ['Ones: ' + o + ' + ' + b + ' = ' + ones + '. That is 1 new ten and ' + (ones - 10) + ' ' + (ones - 10 === 1 ? 'one' : 'ones') + '.', 'Tens: ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + ' and the new ten make ' + (t + 1) + ' tens.', (t + 1) + ' tens and ' + (ones - 10) + ' ' + (ones - 10 === 1 ? 'one' : 'ones') + ' is ' + s + '.'];
    if (ctx.level === 1) return { q: who + ' adds the blue cubes and makes a new ten. What is $' + n + ' + ' + b + '$?', viz: pic({ kind: 'blocks', tens: t, ones: o, ones2: b }), a: num(s), steps: steps, hint: 'Ten single cubes make a new ten-stick.' };
    if (ctx.level === 2) return { q: who + ' adds. What is $' + n + ' + ' + b + '$?', a: num(s), steps: steps, hint: o + ' + ' + b + ' is ' + (ones === 10 ? '10' : 'more than 10') + ', so you get a new ten.' };
    var bad = String(t) + String(ones);
    if (R.coin()) return { q: who + ' wrote ' + bad + ' for $' + n + ' + ' + b + '$. What is $' + n + ' + ' + b + '$ really?', a: num(s),
      steps: [who + ' put all ' + ones + ' ones next to the ' + t + ' ' + (t === 1 ? 'ten' : 'tens') + '. A place can hold only one digit.'].concat(steps), hint: 'Is ' + bad + ' even close to ' + n + '? Make a new ten from the ones.' };
    var it = R.pick(['beads', 'cards', 'shells', 'buttons']);
    return { q: who + ' has ' + n + ' ' + it + ' and finds ' + b + ' more. How many ' + it + ' now?', a: num(s), steps: ['$' + n + ' + ' + b + '$'].concat(steps), hint: 'Add the ones first. Make a new ten if you can.' };
  });

  G('g1.subtract-tens', function (R, ctx) {
    var a = R.int(2, 9), b = R.int(1, a - 1), who = R.pick(NAMES);
    var steps = [10 * a + ' is ' + a + ' tens. ' + 10 * b + ' is ' + b + ' ' + (b === 1 ? 'ten' : 'tens') + '.', a + ' tens − ' + b + ' ' + (b === 1 ? 'ten' : 'tens') + ' = ' + (a - b) + ' ' + (a - b === 1 ? 'ten' : 'tens') + '.', '$' + 10 * a + ' - ' + 10 * b + ' = ' + 10 * (a - b) + '$'];
    if (ctx.level === 1) return { q: who + ' takes away the crossed-out ten-sticks. What is $' + 10 * a + ' - ' + 10 * b + '$?', viz: pic({ kind: 'blocks', tens: a, crossT: b }), a: num(10 * (a - b)), steps: steps, hint: 'Count the ten-sticks that are left, by tens.' };
    if (ctx.level === 2) return { q: who + ' subtracts tens. What is $' + 10 * a + ' - ' + 10 * b + '$?', a: num(10 * (a - b)), steps: steps, hint: 'Think of ' + a + ' − ' + b + ', in tens.' };
    if (R.coin()) return { q: who + ' needs the missing number:<br>' + big(10 * a + ' - ' + sq() + ' = ' + 10 * (a - b)), a: num(10 * b),
      steps: ['From ' + 10 * (a - b) + ' up to ' + 10 * a + ' is ' + b + ' ' + (b === 1 ? 'ten' : 'tens') + '.', 'So the box is ' + 10 * b + '.', 'Check: $' + 10 * a + ' - ' + 10 * b + ' = ' + 10 * (a - b) + '$'], hint: 'How many tens must go away?' };
    var it = R.pick(['crayons', 'beads', 'cards', 'stickers']);
    return { q: 'A box has ' + 10 * a + ' ' + it + '. ' + who + ' takes out ' + 10 * b + '. How many ' + it + ' are left in the box?', a: num(10 * (a - b)), steps: steps, hint: 'Take away tens from tens.' };
  });

  // ================================================================ Grade 1: Length, Time and Data
  var COLOR_WORDS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  G('g1.order-by-length', function (R, ctx) {
    var who = R.pick(NAMES);
    if (ctx.level === 1) {
      var ob = R.pick(['ribbon', 'pencil', 'crayon', 'worm', 'straw']), lens = R.sample([3, 4, 5, 6, 7, 8, 9], 3), cs = R.sample(COLOR_WORDS, 3), longest = R.coin();
      var items = lens.map(function (L, i) { return { len: L, obj: ob, color: cs[i], name: LET[i] }; }), best = 0;
      lens.forEach(function (L, i) { if (longest ? L > lens[best] : L < lens[best]) best = i; });
      return { q: who + ' lined up three ' + ob + 's. Which one is the <b>' + (longest ? 'longest' : 'shortest') + '</b>?', viz: pic({ kind: 'lengths', items: items, line: true }), a: mcKeep(['A', 'B', 'C'], best),
        steps: ['The left ends are lined up.', 'Look at the right ends. ' + LET[best] + (longest ? ' goes the farthest.' : ' stops first.'), LET[best] + ' is the ' + (longest ? 'longest' : 'shortest') + '.'], hint: 'Compare the right ends.' };
    }
    if (ctx.level === 2) {
      var c3 = R.sample(COLOR_WORDS, 3), ob2 = R.pick(['ribbon', 'string', 'scarf', 'jump rope']), askLong = R.coin();   // c3[0] > c3[1] > c3[2]
      return { q: 'The ' + c3[0] + ' ' + ob2 + ' is longer than the ' + c3[1] + ' ' + ob2 + '. The ' + c3[1] + ' ' + ob2 + ' is longer than the ' + c3[2] + ' ' + ob2 + '. Which ' + ob2 + ' is the ' + (askLong ? 'longest' : 'shortest') + '?',
        a: mc('The ' + c3[askLong ? 0 : 2] + ' ' + ob2, ['The ' + c3[1] + ' ' + ob2, 'The ' + c3[askLong ? 2 : 0] + ' ' + ob2]), steps: ['Put them in order from longest to shortest: ' + c3[0] + ', ' + c3[1] + ', ' + c3[2] + '.', 'The ' + c3[askLong ? 0 : 2] + ' ' + ob2 + ' is the ' + (askLong ? 'longest' : 'shortest') + '.'], hint: 'Draw three lines in the order the story tells.' };
    }
    var objs = R.pick([['pencil', 'crayon', 'eraser'], ['rope', 'string', 'ribbon'], ['bus', 'car', 'bike'], ['snake', 'worm', 'caterpillar'], ['table', 'chair', 'stool']]);
    if (R.coin()) return { q: 'The ' + objs[0] + ' is longer than the ' + objs[1] + '. The ' + objs[1] + ' is longer than the ' + objs[2] + '. Is the ' + objs[0] + ' longer than the ' + objs[2] + '?', a: mcKeep(['Yes', 'No', 'We can’t tell'], 0),
      steps: ['The ' + objs[0] + ' is longer than the ' + objs[1] + ', and the ' + objs[1] + ' is longer than the ' + objs[2] + '.', 'So the ' + objs[0] + ' is longer than the ' + objs[2] + ' too.', 'Yes.'], hint: 'Use the ' + objs[1] + ' to compare the other two.' };
    return { q: 'The ' + objs[2] + ' is shorter than the ' + objs[1] + '. The ' + objs[1] + ' is shorter than the ' + objs[0] + '. Which is the shortest?', a: mc('The ' + objs[2], ['The ' + objs[1], 'The ' + objs[0]]),
      steps: ['Order from shortest to longest: ' + objs[2] + ', ' + objs[1] + ', ' + objs[0] + '.', 'The ' + objs[2] + ' is the shortest.'], hint: 'Which one is shorter than something that is already short?' };
  });

  G('g1.measure-with-units', function (R, ctx) {
    var who = R.pick(NAMES), ob = R.pick(['pencil', 'crayon', 'ribbon', 'straw', 'worm']), L = R.int(3, 8), unit = R.pick(['cube', 'clip']), uw = unit === 'cube' ? 'cubes' : 'paper clips';
    if (ctx.level === 1) return { q: who + ' measured the ' + ob + ' with ' + uw + '. How many ' + uw + ' long is it?', viz: pic({ kind: 'lengths', items: [{ len: L, obj: ob, units: { n: L, obj: unit } }] }), a: num(L),
      steps: ['The ' + uw + ' are laid end to end with no gaps and no overlaps.', 'Count them: ' + countList(1, L) + '.', 'The ' + ob + ' is ' + L + ' ' + uw + ' long.'], hint: 'Count the ' + uw + ' under the ' + ob + '.' };
    if (ctx.level === 2) {
      var bad = R.pick(['gaps', 'overlaps']), goodFirst = R.coin(), badUnits = bad === 'gaps' ? { n: L - 1, obj: unit, gaps: [1] } : { n: L + 1, obj: unit, overlaps: [2, M.max(3, L - 1)] };
      var good = { len: L, obj: ob, units: { n: L, obj: unit } }, wrong = { len: L, obj: ob, units: badUnits };
      var items = goodFirst ? [good, wrong] : [wrong, good]; items[0].name = 'A'; items[1].name = 'B';
      return { q: 'Two children measured the same ' + ob + ' with ' + uw + '. Who measured the right way?', viz: pic({ kind: 'lengths', items: items }), a: mcKeep(['A', 'B'], goodFirst ? 0 : 1),
        steps: ['Units must touch end to end: no gaps and no overlaps.', (goodFirst ? 'B' : 'A') + ' has ' + (bad === 'gaps' ? 'a gap between two units.' : 'units that overlap.'), (goodFirst ? 'A' : 'B') + ' measured the right way: ' + L + ' ' + uw + '.'], hint: 'Look for a space between units, or units on top of each other.' };
    }
    var L2 = R.intNot(2, 9, [L]), big = M.max(L, L2), small = M.min(L, L2), o2 = R.pick(['pencil', 'crayon', 'straw', 'ribbon'].filter(function (x) { return x !== ob; }));
    if (R.coin()) return { q: 'The ' + ob + ' is ' + L + ' cubes long. The ' + o2 + ' is ' + L2 + ' cubes long. How many cubes longer is the ' + (L > L2 ? ob : o2) + '?', a: num(big - small),
      steps: ['Compare: ' + big + ' cubes and ' + small + ' cubes.', '$' + big + ' - ' + small + ' = ' + (big - small) + '$', 'The ' + (L > L2 ? ob : o2) + ' is ' + (big - small) + ' ' + (big - small === 1 ? 'cube' : 'cubes') + ' longer.'], hint: 'How many more is ' + big + ' than ' + small + '?' };
    return { q: who + ' measured two things with cubes. How many cubes long is the longer one?', viz: pic({ kind: 'lengths', items: [{ len: L, obj: ob, units: { n: L, obj: 'cube' }, name: 'A' }, { len: L2, obj: o2, units: { n: L2, obj: 'cube' }, name: 'B' }] }), a: num(big),
      steps: ['A is ' + L + ' cubes long. B is ' + L2 + ' cubes long.', 'The longer one is ' + big + ' cubes long.'], hint: 'Count the cubes under each one.' };
  });

  function tStr(h, half) { return h + ':' + (half ? '30' : '00'); }
  G('g1.time-hour-half-hour', function (R, ctx) {
    var h = R.int(1, 12), half = ctx.level === 1 ? false : ctx.level === 2 ? true : R.coin(), nx = h % 12 + 1, pv = (h + 10) % 12 + 1, who = R.pick(NAMES), right = tStr(h, half);
    if (ctx.level === 3 && R.coin()) {
      var wr3 = half ? [tStr(nx, true), tStr(h, false), tStr(pv, true)] : [tStr(nx, false), tStr(h, true), tStr(pv, false)];
      return { q: who + ' gets up at ' + (half ? 'half past ' + h : h + ' o’clock') + '. Which time is that?', a: mc(right, wr3),
        steps: [half ? 'Half past ' + h + ' means 30 minutes after ' + h + ' o’clock.' : h + ' o’clock means ' + h + ' hours and 0 minutes.', 'We write ' + right + '.'], hint: half ? 'Half an hour is 30 minutes.' : 'O’clock means 0 minutes: :00.' };
    }
    var mm = ('0' + (5 * h) % 60).slice(-2), swapped = half ? '6:' + mm : '12:' + mm;   // reading the two hands the wrong way round
    if (swapped === right) swapped = tStr(pv, half);
    var wrongs = [tStr(nx, half), tStr(h, !half), swapped];
    return { q: who + ' looks at the clock. What time is it?', viz: { name: 'clock', opts: { time: right, digital: false, words: false, controls: false, label: 'A clock' } }, a: mc(right, wrongs),
      steps: half ? ['The long minute hand points to 6. That is 30 minutes: half past.', 'The short hour hand is halfway between ' + h + ' and ' + nx + '. It has passed ' + h + ', so the hour is still ' + h + '.', 'It is ' + right + ', half past ' + h + '.']
        : ['The long minute hand points straight up to 12: o’clock.', 'The short hour hand points to ' + h + '.', 'It is ' + right + ', ' + h + ' o’clock.'],
      hint: half ? 'The hour hand is between two numbers. Use the number it has already passed.' : 'Read the short hand for the hour.' };
  });

  var THEMES = [
    { t: 'Favorite toy', cats: [['Ball', 'ball', null], ['Car', 'car', null], ['Teddy bear', 'bear', null]], kids: true },
    { t: 'Favorite fruit', cats: [['Apple', 'apple', null], ['Grapes', 'dot', 'purple'], ['Orange', 'dot', 'orange']], kids: true },
    { t: 'Animals we saw at the pond', cats: [['Ducks', 'duck', null], ['Fish', 'fish', null], ['Ladybugs', 'ladybug', null]], kids: false },
    { t: 'Favorite color', cats: [['Red', 'dot', 'red'], ['Blue', 'dot', 'blue'], ['Yellow', 'dot', 'yellow']], kids: true },
    { t: 'Favorite snack', cats: [['Cookies', 'cookie', null], ['Apples', 'apple', null], ['Crackers', 'cube', 'tan']], kids: true }
  ];
  G('g1.data-three-groups', function (R, ctx) {
    var th = R.pick(THEMES), ns = R.sample(seq(1, 9), 3), cats = th.cats.map(function (c, i) { var o = { name: c[0], obj: c[1], n: ns[i] }; if (c[2]) o.color = c[2]; return o; });
    var view = pic({ kind: 'graph', cats: cats, note: 'Each picture stands for ' + (th.kids ? '1 child.' : '1 animal.'), title: th.t });
    function nameOf(i) { return '“' + th.cats[i][0] + '”'; }
    function how(i) { return th.kids ? 'How many children picked ' + nameOf(i) + '?' : 'How many ' + th.cats[i][0].toLowerCase() + ' were seen?'; }
    if (ctx.level === 1) { var i = R.int(0, 2); return { q: 'Look at the graph. ' + how(i), viz: view, a: num(ns[i]), steps: ['Find the ' + th.cats[i][0] + ' row.', 'Count the pictures: ' + countList(1, ns[i]) + '.', 'The answer is ' + ns[i] + '.'], hint: 'Count the pictures in one row.' }; }
    if (ctx.level === 2) {
      if (R.coin()) { var tot = ns[0] + ns[1] + ns[2]; return { q: 'Look at the graph. How many ' + (th.kids ? 'children answered' : 'animals were seen') + ' in all?', viz: view, a: num(tot), steps: ['Count each row: ' + ns.join(', ') + '.', 'Add: $' + ns.join(' + ') + ' = ' + tot + '$.'], hint: 'Count each row. Then add the three numbers.' }; }
      var most = R.coin(), bi = 0; ns.forEach(function (x, k) { if (most ? x > ns[bi] : x < ns[bi]) bi = k; });
      return { q: 'Look at the graph. Which row has the ' + (most ? 'most' : 'fewest') + '?', viz: view, a: mc(th.cats[bi][0], th.cats.filter(function (c, k) { return k !== bi; }).map(function (c) { return c[0]; })),
        steps: ['Count each row: ' + th.cats.map(function (c, k) { return c[0] + ' ' + ns[k]; }).join(', ') + '.', th.cats[bi][0] + ' has the ' + (most ? 'most' : 'fewest') + ': ' + ns[bi] + '.'], hint: 'Count each row, or look for the ' + (most ? 'longest' : 'shortest') + ' row.' };
    }
    var p = R.sample([0, 1, 2], 2), hi = ns[p[0]] > ns[p[1]] ? p[0] : p[1], lo = hi === p[0] ? p[1] : p[0], d = ns[hi] - ns[lo], askMore = R.coin();
    var q = th.kids ? (askMore ? 'How many more children picked ' + nameOf(hi) + ' than ' + nameOf(lo) + '?' : 'How many fewer children picked ' + nameOf(lo) + ' than ' + nameOf(hi) + '?')
      : (askMore ? 'How many more ' + th.cats[hi][0].toLowerCase() + ' than ' + th.cats[lo][0].toLowerCase() + ' were seen?' : 'How many fewer ' + th.cats[lo][0].toLowerCase() + ' than ' + th.cats[hi][0].toLowerCase() + ' were seen?');
    return { q: 'Look at the graph. ' + q, viz: view, a: num(d), steps: [th.cats[hi][0] + ': ' + ns[hi] + '. ' + th.cats[lo][0] + ': ' + ns[lo] + '.', 'Compare: $' + ns[hi] + ' - ' + ns[lo] + ' = ' + d + '$.', 'The difference is ' + d + '.'], hint: 'Line up the two rows. How many pictures have no partner?' };
  });

  // ================================================================ Grade 1: Shapes and Equal Shares
  G('g1.defining-attributes', function (R, ctx) {
    var colors = ['green', 'blue', 'red', 'orange', 'purple', 'yellow', 'pink'], who = R.pick(NAMES);
    if (ctx.level === 1) {
      var isT = R.chance(0.6), s = isT ? R.pick(['triangle', 'triangle-right', 'triangle-skinny', 'triangle-wide', 'triangle-obtuse']) : R.pick(['open-triangle', 'curvy-triangle']);
      var change = R.pick(['big', 'small', 'turned', 'colored']), col = R.pick(colors);
      var it = { s: s, color: col, scale: change === 'big' ? 1.2 : change === 'small' ? 0.6 : 1, rot: change === 'turned' ? R.pick([60, 110, 180, 230]) : 0 };
      var says = { big: 'is very big', small: 'is small', turned: 'is turned around', colored: 'is ' + col };
      return { q: who + ' drew this shape. It ' + says[change] + '. Is it a triangle?', viz: pic({ kind: 'shapes', items: [it] }), a: mcKeep(['Yes', 'No'], isT ? 0 : 1),
        steps: ['A triangle is a closed shape with 3 straight sides and 3 corners.', isT ? 'This shape has 3 straight sides and 3 corners. Its size, color and turn do not matter.' : s === 'open-triangle' ? 'This shape has a gap, so it is not closed.' : 'One side is curved, not straight.', isT ? 'Yes, it is a triangle.' : 'No, it is not a triangle.'], hint: 'Check: closed? 3 straight sides? Size, color and turning do not matter.' };
    }
    if (ctx.level === 2) {
      var shp = R.pick([['triangle', '3 straight sides and 3 corners'], ['rectangle', '4 straight sides and 4 square corners'], ['hexagon', '6 straight sides and 6 corners'], ['square', '4 equal straight sides and 4 square corners']]);
      return { q: who + ' asks: what makes a shape a ' + shp[0] + '?', a: mc(cap(shp[1]), ['Its color', 'Its size', 'Which way it points']),
        steps: ['Color, size and which way a shape is turned do not change its name.', 'A ' + shp[0] + ' has ' + shp[1] + '.'], hint: 'Would a ' + shp[0] + ' still be a ' + shp[0] + ' if you painted it?' };
    }
    var target = R.pick(['triangle', 'rectangle', 'hexagon']), goods, bad;
    if (target === 'triangle') { goods = ['triangle-right', 'triangle-skinny', 'triangle-obtuse', 'triangle-wide']; bad = R.pick(['open-triangle', 'curvy-triangle', 'trapezoid']); }
    else if (target === 'rectangle') { goods = ['rectangle', 'rectangle-tall']; bad = R.pick(['trapezoid', 'rhombus', 'open-square']); }
    else { goods = ['hexagon']; bad = R.pick(['pentagon', 'octagon', 'circle']); }
    var items = [{ s: R.pick(goods), rot: R.pick([0, 30, 90]), scale: 0.7 }, { s: R.pick(goods), rot: R.pick([0, 150, 200]), scale: 1.1 }, { s: bad, rot: 0, scale: 0.9 }];
    items = R.shuffle(items).map(function (x, i) { x.name = LET[i]; x.color = R.pick(colors); return x; });
    var bi = items.map(function (x) { return x.s; }).indexOf(bad);
    var whyNot = { 'open-triangle': 'it is not closed', 'curvy-triangle': 'it has a curved side', trapezoid: 'it has 4 sides', rhombus: 'its corners are not square', 'open-square': 'it is not closed', pentagon: 'it has 5 sides', octagon: 'it has 8 sides', circle: 'it has no straight sides' };
    return { q: who + ' drew three shapes. Which one is <b>not</b> a ' + target + '?', viz: pic({ kind: 'shapes', items: items }), a: mcKeep(LET.slice(0, 3), bi),
      steps: ['Big, small, colored or turned: those do not matter.', LET[bi] + ' is not a ' + target + ' because ' + whyNot[bad] + '.'], hint: 'Count the sides. Check that each shape is closed and the sides are straight.' };
  });

  function hexV() { var v = []; for (var i = 0; i < 6; i++) v.push([.95 * Math.cos(i * Math.PI / 3), .95 * Math.sin(i * Math.PI / 3)]); return v; }
  var COMPOSE = {
    circleHalves: { name: 'circle', parts: [{ path: 'M-.95,0A.95,.95 0 0 1 .95,0Z' }, { path: 'M-.95,0A.95,.95 0 0 0 .95,0Z' }], n: 2, pieces: 'half-circles' },
    circleQuarters: { name: 'circle', parts: [{ path: 'M0,0L.95,0A.95,.95 0 0 1 0,.95Z' }, { path: 'M0,0L0,.95A.95,.95 0 0 1 -.95,0Z' }, { path: 'M0,0L-.95,0A.95,.95 0 0 1 0,-.95Z' }, { path: 'M0,0L0,-.95A.95,.95 0 0 1 .95,0Z' }], n: 4, pieces: 'quarter-circles' },
    rect2sq: { name: 'rectangle', parts: [[[-1.1, -.55], [0, -.55], [0, .55], [-1.1, .55]], [[0, -.55], [1.1, -.55], [1.1, .55], [0, .55]]], n: 2, pieces: 'squares' },
    sq2tri: { name: 'square', parts: [[[-.8, -.8], [.8, -.8], [-.8, .8]], [[.8, -.8], [.8, .8], [-.8, .8]]], n: 2, pieces: 'triangles' },
    trap3: { name: 'trapezoid', parts: [[[-.9, .39], [0, .39], [-.45, -.39]], [[-.45, -.39], [0, .39], [.45, -.39]], [[0, .39], [.9, .39], [.45, -.39]]], n: 3, pieces: 'triangles' },
    hex2trap: { name: 'hexagon', parts: (function () { var v = hexV(); return [[v[0], v[5], v[4], v[3]], [v[0], v[1], v[2], v[3]]]; })(), n: 2, pieces: 'trapezoids' },
    hex6: { name: 'hexagon', parts: (function () { var v = hexV(), out = []; for (var i = 0; i < 6; i++) out.push([[0, 0], v[i], v[(i + 1) % 6]]); return out; })(), n: 6, pieces: 'triangles' },
    hex3: { name: 'hexagon', parts: (function () { var v = hexV(); return [[[0, 0], v[0], v[1], v[2]], [[0, 0], v[2], v[3], v[4]], [[0, 0], v[4], v[5], v[0]]]; })(), n: 3, pieces: 'rhombuses' },
    rect3: { name: 'rectangle', parts: [[[-1.2, -.4], [-.4, -.4], [-.4, .4], [-1.2, .4]], [[-.4, -.4], [.4, -.4], [.4, .4], [-.4, .4]], [[.4, -.4], [1.2, -.4], [1.2, .4], [.4, .4]]], n: 3, pieces: 'squares' },
    rect8: { name: 'rectangle', parts: (function () { var out = []; for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) { var x = -1.2 + c * .6, y = -.6 + r * .6; out.push([[x, y], [x + .6, y], [x + .6, y + .6], [x, y + .6]]); } return out; })(), n: 8, pieces: 'squares' },
    sq4tri: { name: 'square', parts: [[[-.8, -.8], [.8, -.8], [0, 0]], [[.8, -.8], [.8, .8], [0, 0]], [[.8, .8], [-.8, .8], [0, 0]], [[-.8, .8], [-.8, -.8], [0, 0]]], n: 4, pieces: 'triangles' }
  };
  var SH_FACT = { circle: 'a circle: round, with no corners', rectangle: 'a rectangle: 4 straight sides and 4 square corners', square: 'a square: 4 equal sides and 4 square corners', trapezoid: 'a trapezoid: 4 sides, with a long bottom and a shorter top', hexagon: 'a hexagon: 6 sides and 6 corners' };
  G('g1.compose-shapes', function (R, ctx) {
    var c1 = R.pick(['blue', 'green', 'orange', 'purple']), c2 = R.pick(['yellow', 'pink', 'tan']), who = R.pick(NAMES);
    if (ctx.level === 1) {
      var b = COMPOSE[R.pick(['circleHalves', 'circleQuarters', 'rect2sq', 'sq2tri', 'trap3', 'hex2trap'])];
      return { q: who + ' put these pieces together. What new shape did ' + who + ' make?', viz: pic({ kind: 'shapes', items: [{ parts: b.parts, color: c1, color2: c2 }] }),
        a: mc(cap(b.name), ['circle', 'rectangle', 'square', 'trapezoid', 'hexagon', 'triangle'].filter(function (x) { return x !== b.name; }).slice(0, 3).map(cap)),
        steps: [b.n + ' ' + b.pieces + ' fit together with no gaps.', 'Trace only the outside edge: it is ' + SH_FACT[b.name] + '.', 'The new shape is a ' + b.name + '.'], hint: 'Ignore the lines inside. Look at the outside edge.' };
    }
    var keys = ctx.level === 2 ? ['trap3', 'hex6', 'hex3', 'rect3', 'circleQuarters', 'sq4tri'] : ['hex6', 'rect8', 'hex3', 'sq4tri', 'trap3'];
    var bb = COMPOSE[R.pick(keys)];
    return { q: who + ' made this ' + bb.name + ' from smaller pieces. How many ' + bb.pieces + ' did ' + who + ' use?', viz: pic({ kind: 'shapes', items: [{ parts: bb.parts, color: c1, color2: c2 }] }), a: num(bb.n),
      steps: ['Count each piece once: ' + countList(1, bb.n) + '.', bb.n + ' ' + bb.pieces + ' make the ' + bb.name + '.'], hint: 'Touch each piece as you count.' };
  });

  G('g1.halves-fourths', function (R, ctx) {
    var who = R.pick(NAMES), food = R.pick([['pizza', 'circle'], ['pie', 'circle'], ['sandwich', 'square'], ['cracker', 'rect'], ['tortilla', 'circle'], ['cake', 'rect']]);
    if (ctx.level === 1) {
      var eq = R.coin(), parts = R.pick([2, 4]), how = food[1] === 'circle' ? (parts === 2 ? R.pick(['v', 'h']) : 'grid') : (parts === 2 ? R.pick(['v', 'h', 'diag']) : R.pick(['grid', 'v', 'h']));
      if (!eq && how === 'diag') how = 'v';
      return { q: who + ' cut a ' + food[0] + '. Are the parts <b>equal</b>, all the same size?', viz: pic({ kind: 'split', items: [{ s: food[1], parts: parts, equal: eq, how: how }] }), a: mcKeep(['Yes, equal parts', 'No, not equal'], eq ? 0 : 1),
        steps: ['Equal parts are all the same size.', eq ? 'Every part here is the same size.' : 'Some parts are bigger than others.', eq ? 'Yes, these are equal parts: ' + (parts === 2 ? 'halves.' : 'fourths.') : 'No, they are not equal, so they are not ' + (parts === 2 ? 'halves.' : 'fourths.')], hint: 'Would each person get the same amount?' };
    }
    if (ctx.level === 2) {
      var p2 = R.pick([2, 4]), how2 = food[1] === 'circle' ? (p2 === 2 ? 'v' : 'grid') : R.pick(p2 === 2 ? ['v', 'h', 'diag'] : ['grid', 'v']);
      var nm = p2 === 2 ? 'One half' : 'One fourth';
      return { q: who + ' cut a ' + food[0] + ' into equal parts and ate the green part. What is the green part called?', viz: pic({ kind: 'split', items: [{ s: food[1], parts: p2, how: how2, shade: 1 }] }), a: mc(nm, ['One half', 'One fourth', 'One whole'].filter(function (x) { return x !== nm; })),
        steps: ['The ' + food[0] + ' is cut into ' + p2 + ' equal parts.', p2 === 2 ? '2 equal parts are halves. One part is one half.' : '4 equal parts are fourths, also called quarters. One part is one fourth.'], hint: 'Count the equal parts.' };
    }
    var kind = R.pick(['bigger', 'howmany', 'which']);
    if (kind === 'bigger') return { q: who + ' can have one half of a ' + food[0] + ' or one fourth of the same ' + food[0] + '. Which piece is bigger?', viz: pic({ kind: 'split', items: [{ s: food[1], parts: 2, how: 'v', shade: 1, name: 'Half' }, { s: food[1], parts: 4, how: 'grid', shade: 1, name: 'Fourth' }] }),
      a: mcKeep(['One half', 'One fourth', 'They are the same'], 0), steps: ['Cutting into more equal parts makes each part smaller.', 'Halves: 2 parts. Fourths: 4 smaller parts.', 'One half is bigger than one fourth.'], hint: 'Would you rather share with 1 friend or with 3 friends?' };
    if (kind === 'howmany') { var hp = R.coin(); return { q: who + ' cut a ' + food[0] + ' into ' + (hp ? 'halves' : 'fourths') + '. How many ' + (hp ? 'halves' : 'fourths') + ' make the whole ' + food[0] + '?', a: num(hp ? 2 : 4),
      steps: [hp ? 'Halves are 2 equal parts.' : 'Fourths are 4 equal parts.', 'All ' + (hp ? '2 halves' : '4 fourths') + ' together make the whole.'], hint: 'How many equal parts are there?' }; }
    var items = R.shuffle([{ s: food[1], parts: 4, how: 'grid', equal: true }, { s: food[1], parts: 4, how: 'grid', equal: false }, { s: food[1], parts: 2, how: 'v', equal: true }]);
    items.forEach(function (x, i) { x.name = LET[i]; });
    var gi = items.map(function (x) { return x.parts === 4 && x.equal; }).indexOf(true);
    return { q: who + ' cut three ' + food[0] + 's. Which one shows <b>fourths</b>?', viz: pic({ kind: 'split', items: items }), a: mcKeep(['A', 'B', 'C'], gi),
      steps: ['Fourths are 4 equal parts.', 'One choice has 2 parts, and one has 4 parts that are not equal.', LET[gi] + ' shows 4 equal parts: fourths.'], hint: 'Count the parts. Are they all the same size?' };
  });

})(window.MathLadder);
