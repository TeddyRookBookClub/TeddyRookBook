/* Math Ladder: problem generators for Grade 3 (key g3, /math/grade-3/).
   One generator per topic in data/math/topics/g3.json, registered with MathLadder.gen.
   Built from source parts in the course builder's work dir; each problem also carries `chk`, the raw numbers of the
   problem, which a separate test uses to re-derive every answer independently.
   Pictures inside problems use the still visuals in static/math/viz/g3.js (they never print the answer). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, U = ML.util, BL = ML.byLevel;

  /* ------------------------------------------------------------------ answers */
  function aInt(v) { return { t: 'num', v: String(v), form: 'int' }; }
  function aFrac(n, d) { return U.gcd(n, d) === 1 && d !== 1 ? { t: 'num', v: n + '/' + d, form: 'frac' } : { t: 'num', v: n + '/' + d }; }
  function aMix(n, d) { return { t: 'num', v: qPlain(n, d) }; }
  function aTF(v) { return { t: 'tf', v: !!v }; }
  function aYN(v) { return { t: 'mc', choices: ['Yes', 'No'], v: v ? 0 : 1, keep: true }; }
  function aMC(correct, wrongs, keep) { var s = U.mc(correct, wrongs, 4); if (keep) s.keep = true; return s; }
  /* a time as two boxes, hour and minutes (a text box would invite "Type a word"; digits are easier for children) */
  function aTime(h, m) { return { t: 'multi', parts: [{ label: 'Hour:', a: aInt(h) }, { label: 'Minutes:', a: aInt(m) }] }; }

  /* ------------------------------------------------------------------ text */
  function F(n, d) { return '\\frac{' + n + '}{' + d + '}'; }
  function mixTex(n, d) { var w = Math.floor(n / d), r = n - w * d; if (!r) return String(w); var g = U.gcd(r, d); r /= g; var dd = d / g; return (w ? w : '') + F(r, dd); }
  function qPlain(n, d) { var w = Math.floor(n / d), r = n - w * d; if (!r) return String(w); var g = U.gcd(r, d); r /= g; var dd = d / g; return (w ? w + ' ' : '') + r + '/' + dd; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function m(s) { return '$' + s + '$'; }
  var X = ' \\times ', DV = ' \\div ', BOX = '\\square';
  function pl(n, w, p) { return n + ' ' + (n === 1 ? w : (p || w + 's')); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function hm(t) { t = ((t % 720) + 720) % 720; var h = Math.floor(t / 60) || 12, mm = t % 60; return h + ':' + (mm < 10 ? '0' : '') + mm; }
  var NAMES = ['Maya', 'Leo', 'Ava', 'Sam', 'Nora', 'Eli', 'Zoe', 'Omar', 'Lily', 'Ben', 'Ivy', 'Max', 'Rosa', 'Kai', 'Tess', 'Raj', 'Mia', 'Jack', 'Lena', 'Theo', 'Amir', 'Ella', 'Noah', 'June', 'Ana', 'Finn', 'Grace', 'Hugo'];
  var THINGS = [
    { g: 'box', gp: 'boxes', i: 'crayon' }, { g: 'bag', i: 'apple' }, { g: 'team', i: 'player' }, { g: 'shelf', gp: 'shelves', i: 'book' },
    { g: 'vase', i: 'flower' }, { g: 'pack', i: 'marker' }, { g: 'plate', i: 'cookie' }, { g: 'jar', i: 'marble' }, { g: 'tray', i: 'muffin' },
    { g: 'car', i: 'person', ip: 'people' }, { g: 'basket', i: 'egg' }, { g: 'page', i: 'sticker' }, { g: 'tank', i: 'fish', ip: 'fish' }, { g: 'bunch', gp: 'bunches', i: 'banana' }
  ];
  function gp(t) { return t.gp || t.g + 's'; }
  function ip(t) { return t.ip || t.i + 's'; }
  function gN(n, t) { return n + ' ' + (n === 1 ? t.g : gp(t)); }
  function iN(n, t) { return n + ' ' + (n === 1 ? t.i : ip(t)); }
  function skip(by, n) { var o = []; for (var k = 1; k <= n; k++) o.push(by * k); return o.join(', '); }
  function digs(n) { return [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10, Math.floor(n / 1000) % 10]; }
  function vz(name, opts, label) { var v = { name: name, opts: opts }; if (label) v.label = label; return v; }

  /* ================================================================== Numbers to 1,000 */
  var PL = ['ones', 'tens', 'hundreds', 'thousands'], P1 = ['one', 'ten', 'hundred', 'thousand'], PN = ['Ones', 'Tens', 'Hundreds', 'Thousands'];
  function roundTo(n, to) { var lo = Math.floor(n / to) * to; return n - lo >= to / 2 ? lo + to : lo; }
  function roundSteps(n, to) {
    var lo = Math.floor(n / to) * to, hi = lo + to, mid = lo + to / 2, dig = to === 10 ? n % 10 : Math.floor(n / 10) % 10, dn = to === 10 ? 'ones' : 'tens';
    var s = ['$' + commas(n) + '$ is between $' + commas(lo) + '$ and $' + commas(hi) + '$. Halfway between them is $' + commas(mid) + '$.'];
    if (n === mid) s.push('$' + commas(n) + '$ is exactly halfway. A number that is halfway rounds up.');
    else if (n < mid) s.push('The ' + dn + ' digit is ' + dig + ', which is less than 5, so $' + commas(n) + '$ is closer to $' + commas(lo) + '$.');
    else s.push('The ' + dn + ' digit is ' + dig + ', which is 5 or more, so $' + commas(n) + '$ is at or past the halfway point, closer to $' + commas(hi) + '$.');
    s.push('So $' + commas(n) + '$ rounds to $' + commas(roundTo(n, to)) + '$.');
    return s;
  }
  G('g3.round-10-100', function (R, ctx) {
    var kind = BL(ctx, R.pick(['t', 't', 't3']), R.pick(['t3', 'h', 'h', 'half']), R.pick(['h', 'half', 'roll', 'rev', 'rev'])), n, to, p;
    if (kind === 'rev') {
      to = R.pick([10, 100]); var tgt = to === 10 ? R.int(3, 98) * 10 : R.int(2, 9) * 100, small = R.coin();
      var ans = small ? tgt - to / 2 : tgt + to / 2 - 1;
      return {
        q: 'What is the ' + (small ? 'smallest' : 'largest') + ' whole number that rounds to $' + commas(tgt) + '$ when you round to the nearest ' + (to === 10 ? 'ten' : 'hundred') + '?',
        a: aInt(ans),
        steps: ['Numbers that round to $' + commas(tgt) + '$ are the ones closer to $' + commas(tgt) + '$ than to the next ' + (to === 10 ? 'ten' : 'hundred') + ' on either side.',
          'The halfway points are $' + commas(tgt - to / 2) + '$ (below) and $' + commas(tgt + to / 2) + '$ (above). Halfway numbers round up.',
          small ? 'So $' + commas(tgt - to / 2) + '$ rounds up to $' + commas(tgt) + '$, but $' + commas(tgt - to / 2 - 1) + '$ rounds down to $' + commas(tgt - to) + '$. The smallest is $' + commas(ans) + '$.'
            : 'So $' + commas(tgt + to / 2) + '$ rounds up to $' + commas(tgt + to) + '$, but $' + commas(ans) + '$ still rounds to $' + commas(tgt) + '$. The largest is $' + commas(ans) + '$.'],
        hint: 'Find the halfway number between $' + commas(tgt) + '$ and its neighbor ' + (to === 10 ? 'ten' : 'hundred') + '. Halfway numbers round up.',
        chk: { k: 'roundRev', tgt: tgt, to: to, small: small }
      };
    }
    if (kind === 't') { to = 10; n = R.coin() ? R.int(11, 94) : R.int(101, 989); if (n % 10 === 0) n += R.int(1, 4); }
    else if (kind === 't3') { to = 10; n = R.int(101, 989); if (n % 10 === 0) n += R.int(5, 9); }
    else if (kind === 'h') { to = 100; n = R.int(101, 949); if (n % 100 === 0) n += R.int(11, 39); }
    else if (kind === 'half') {
      if (R.coin()) { to = 100; var hb = R.int(1, 8) * 100; n = R.pick([hb + 50, hb + 49, hb + 51, hb + 45]); }
      else { to = 10; n = R.int(10, 98) * 10 + 5; }
    } else { to = R.pick([10, 100]); n = to === 10 ? R.pick([R.int(95, 99), R.int(1, 9) * 100 + R.int(95, 99)]) : R.int(950, 999); }
    p = {
      q: 'Round $' + commas(n) + '$ to the nearest ' + (to === 10 ? 'ten' : 'hundred') + '.',
      a: aInt(roundTo(n, to)), steps: roundSteps(n, to),
      hint: 'Find the two ' + (to === 10 ? 'tens' : 'hundreds') + ' that $' + commas(n) + '$ is between, then look at the ' + (to === 10 ? 'ones' : 'tens') + ' digit.',
      chk: { k: 'round', n: n, to: to }
    };
    if (ctx.level === 1 && to === 10) { var lo = Math.floor(n / 10) * 10; p.viz = vz('numberline', { min: lo, max: lo + 10, step: 1, points: [{ v: n, label: 'A', drag: false }], controls: false, label: 'A number line from ' + lo + ' to ' + (lo + 10) + ' with point A at ' + n }, 'A number line from ' + lo + ' to ' + (lo + 10) + ' with point A at ' + n); }
    return p;
  });

  function addSteps(a, b) {
    var A = digs(a), B = digs(b), la = String(a).length, lb = String(b).length, len = Math.max(la, lb), carry = 0, out = [];
    for (var i = 0; i < len; i++) {
      var s = A[i] + B[i] + carry;
      if (i >= lb && !carry) { out.push(PN[i] + ': there is nothing to add, so write ' + A[i] + '.'); continue; }
      var ex = (i < la ? A[i] : 0) + (i < lb ? ' + ' + B[i] : '') + (carry ? ' + 1' : '');
      if (s >= 10) out.push(PN[i] + ': $' + ex + ' = ' + s + '$ ' + PL[i] + '. That is 1 ' + P1[i + 1] + ' and ' + (s - 10) + ' ' + (s - 10 === 1 ? P1[i] : PL[i]) + '. Write ' + (s - 10) + ' and regroup 1 ' + P1[i + 1] + ' to the ' + PL[i + 1] + '.');
      else out.push(PN[i] + ': $' + ex + ' = ' + s + '$ ' + PL[i] + '. Write ' + s + '.');
      carry = s >= 10 ? 1 : 0;
    }
    if (carry) out.push(PN[len] + ': the regrouped 1 ' + P1[len] + ' is all there is. Write 1.');
    out.push('So $' + commas(a) + ' + ' + commas(b) + ' = ' + commas(a + b) + '$.');
    return out;
  }
  /* a + b with a chosen number of regroups (0, 1 or 2), b has bd digits */
  function addPair(R, regroups, bd, maxSum) {
    for (var t = 0; t < 200; t++) {
      var a = R.int(101, 899), b = bd === 2 ? R.int(12, 98) : R.int(101, 899);
      if (a + b > (maxSum || 999) || a % 10 === 0 || b % 10 === 0) continue;
      var A = digs(a), B = digs(b), c1 = A[0] + B[0] >= 10 ? 1 : 0, c2 = A[1] + B[1] + c1 >= 10 ? 1 : 0;
      if (c1 + c2 === regroups) return [a, b];
    }
    return [347, 285];
  }
  G('g3.add-within-1000', function (R, ctx) {
    var kind = BL(ctx, R.pick(['one', 'one', 'one2']), R.pick(['two', 'two', 'word']), R.pick(['two', 'word', 'three'])), a, b, pr;
    if (kind === 'three') {
      var x = R.int(102, 380), y = R.int(21, 98), z = R.int(102, 380); if (x % 10 === 0) x++; if (z % 10 === 0) z++;
      var s1 = x + y;
      return {
        q: 'Find $' + x + ' + ' + y + ' + ' + z + '$.', a: aInt(x + y + z),
        steps: ['Add two numbers first: $' + x + ' + ' + y + ' = ' + s1 + '$.', 'Then add $' + z + '$ to $' + s1 + '$, one place at a time.'].concat(addSteps(s1, z).map(function (s, i, arr) { return i === arr.length - 1 ? 'So $' + x + ' + ' + y + ' + ' + z + ' = ' + commas(x + y + z) + '$.' : s; })),
        hint: 'Add two of the numbers first, then add the third.', chk: { k: 'add', nums: [x, y, z] }
      };
    }
    pr = kind === 'one' ? addPair(R, 1, R.pick([2, 3])) : kind === 'one2' ? addPair(R, 1, 3) : addPair(R, 2, kind === 'word' ? 3 : R.pick([2, 3, 3]), ctx.level === 3 ? 1000 : 999);
    a = pr[0]; b = pr[1];
    var q = 'Find $' + a + ' + ' + b + '$.';
    if (kind === 'word') {
      var nm = R.pick(NAMES), ctxs = [
        ['A library had ' + a + ' books. It got ' + b + ' new books. How many books does it have now?', 'books'],
        [nm + ' counted ' + a + ' cars on Monday and ' + b + ' cars on Tuesday. How many cars did ' + nm + ' count in all?', 'cars'],
        ['A school sold ' + a + ' tickets for the first show and ' + b + ' tickets for the second show. How many tickets did it sell?', 'tickets'],
        ['A farm picked ' + a + ' apples in the morning and ' + b + ' in the afternoon. How many apples were picked?', 'apples']
      ], cc = R.pick(ctxs);
      return { q: cc[0], a: aInt(a + b), unit: cc[1], steps: ['Put the two amounts together: $' + a + ' + ' + b + '$.'].concat(addSteps(a, b)), hint: 'Add the ones, then the tens, then the hundreds. Regroup when a place gets to 10 or more.', chk: { k: 'add', nums: [a, b] } };
    }
    return { q: q, a: aInt(a + b), steps: addSteps(a, b), hint: 'Line up the places. Add the ones first, and regroup 10 ones as 1 ten.', chk: { k: 'add', nums: [a, b] } };
  });

  function subSteps(a, b) {
    var top = digs(a), bot = digs(b), len = String(a).length, out = [];
    for (var i = 0; i < len; i++) {
      if (i === len - 1 && i >= String(b).length && top[i] === 0) break; // a leading place that was used up (1,000 − …)
      var t0 = top[i];
      if (top[i] < bot[i]) {
        var j = i + 1; while (top[j] === 0) j++;
        var chain = ['break 1 ' + P1[j] + ' into 10 ' + PL[j - 1]];
        for (var k = j - 1; k > i; k--) chain.push('1 ' + P1[k] + ' into 10 ' + PL[k - 1]);
        top[j]--; for (k = j - 1; k > i; k--) top[k] = 9; top[i] += 10;
        var now = []; for (k = j; k >= i; k--) now.push(top[k] + ' ' + (top[k] === 1 ? P1[k] : PL[k]));
        var why = j > i + 1 ? ', and there are 0 ' + PL[i + 1] + (j > i + 2 ? ' and 0 ' + PL[i + 2] : '') + ' to break' : '';
        out.push(PN[i] + ': ' + t0 + ' is less than ' + bot[i] + why + '. So ' + (chain.length > 1 ? chain.slice(0, -1).join(', ') + ', then ' + chain[chain.length - 1] : chain[0]) + '. Now there are ' + now.join(', ').replace(/, ([^,]*)$/, ' and $1') + '. $' + top[i] + ' - ' + bot[i] + ' = ' + (top[i] - bot[i]) + '$.');
      } else out.push(PN[i] + ': $' + top[i] + ' - ' + bot[i] + ' = ' + (top[i] - bot[i]) + '$.');
    }
    out.push('So $' + commas(a) + ' - ' + commas(b) + ' = ' + commas(a - b) + '$. Check by adding: $' + commas(a - b) + ' + ' + commas(b) + ' = ' + commas(a) + '$.');
    return out;
  }
  function smallFromLarge(a, b) { var A = digs(a), B = digs(b), r = 0, p = 1; for (var i = 0; i < 3; i++) { r += Math.abs(A[i] - B[i]) * p; p *= 10; } return r; }
  function subPair(R, mode) { // mode: 'ones' (regroup a ten), 'tens' (regroup a hundred), 'both'
    for (var t = 0; t < 300; t++) {
      var a = R.int(211, 989), b = R.int(102, a - 11), A = digs(a), B = digs(b);
      if (A[1] === 0 || A[0] === 0 || b % 10 === 0) continue;
      var r1 = A[0] < B[0], r2 = A[1] - (r1 ? 1 : 0) < B[1];
      if ((mode === 'ones' && r1 && !r2) || (mode === 'tens' && !r1 && r2) || (mode === 'both' && r1 && r2)) return [a, b];
    }
    return [352, 178];
  }
  G('g3.subtract-within-1000', function (R, ctx) {
    var kind = BL(ctx, R.pick(['ones', 'ones', 'tens']), R.pick(['both', 'both', 'tens', 'word']), R.pick(['both', 'word', 'error', 'error'])), pr, a, b;
    pr = subPair(R, kind === 'ones' ? 'ones' : kind === 'tens' ? 'tens' : 'both'); a = pr[0]; b = pr[1];
    if (kind === 'error') {
      var wrong = smallFromLarge(a, b), nm = R.pick(NAMES);
      if (wrong === a - b) { pr = [352, 178]; a = 352; b = 178; wrong = 226; }
      return {
        q: nm + ' worked out $' + a + ' - ' + b + '$ and got $' + wrong + '$. ' + nm + ' took the smaller digit from the larger digit in each place. What is the correct difference?',
        a: aInt(a - b),
        steps: ['Taking the smaller digit from the larger one ignores which number is on top. When the top digit is smaller, you must regroup instead.'].concat(subSteps(a, b)),
        hint: 'Start with the ones. If the top digit is smaller, break a ten into 10 ones.', chk: { k: 'sub', a: a, b: b }
      };
    }
    if (kind === 'word') {
      var c1 = R.pick([
        ['A theater has ' + a + ' seats. ' + b + ' seats are filled. How many seats are empty?', 'seats'],
        ['A puzzle has ' + a + ' pieces. ' + R.pick(NAMES) + ' has placed ' + b + ' of them. How many pieces are left?', 'pieces'],
        ['A school has ' + a + ' students. ' + b + ' of them ride a bus. How many students do not ride a bus?', 'students'],
        ['A bakery made ' + a + ' rolls and sold ' + b + '. How many rolls are left?', 'rolls']
      ]);
      return { q: c1[0], a: aInt(a - b), unit: c1[1], steps: ['Take away to find what is left: $' + a + ' - ' + b + '$.'].concat(subSteps(a, b)), hint: 'Subtract one place at a time, starting with the ones.', chk: { k: 'sub', a: a, b: b } };
    }
    return { q: 'Find $' + a + ' - ' + b + '$.', a: aInt(a - b), steps: subSteps(a, b), hint: 'Start with the ones. If the top digit is smaller than the bottom digit, regroup.', chk: { k: 'sub', a: a, b: b } };
  });

  G('g3.subtract-across-zeros', function (R, ctx) {
    var kind = BL(ctx, R.pick(['h00s', 'h00s', 'h0x']), R.pick(['h00', 'h0x', 'h0x', 'word']), R.pick(['h00', 'h0x', 'k', 'word'])), a, b;
    if (kind === 'h00s') { a = R.int(2, 9) * 100; b = R.int(12, 98); if (b % 10 === 0) b += 3; }
    else if (kind === 'h00') { a = R.int(3, 9) * 100; b = R.int(102, a - 101); if (b % 10 === 0) b += 7; }
    else if (kind === 'k') { a = 1000; b = R.int(102, 989); if (b % 10 === 0) b += 4; }
    else { var h = R.int(3, 9); var o = R.int(1, 7); a = h * 100 + o; b = R.int(1, h - 1) * 100 + R.int(1, 9) * 10 + R.int(o + 1, 9); }
    if (kind === 'word') {
      var nm = R.pick(NAMES), cc = R.pick([
        [nm + ' has ' + a + ' points in a game and spends ' + b + ' points on a new hat. How many points are left?', 'points'],
        ['A school needs ' + a + ' cans for a food drive. It has ' + b + ' cans so far. How many more cans does it need?', 'cans'],
        ['A trail is ' + a + ' meters long. ' + nm + ' has walked ' + b + ' meters. How many meters are left?', 'meters']
      ]);
      return { q: cc[0], a: aInt(a - b), unit: cc[1], steps: ['Find the difference: $' + a + ' - ' + b + '$.'].concat(subSteps(a, b)), hint: 'There are 0 tens to break, so break a hundred into 10 tens first.', chk: { k: 'sub', a: a, b: b } };
    }
    return { q: 'Find $' + commas(a) + ' - ' + b + '$.', a: aInt(a - b), steps: subSteps(a, b), hint: 'When a place has 0, go to the next place over and break that one first.', chk: { k: 'sub', a: a, b: b } };
  });

  G('g3.estimate-sums-differences', function (R, ctx) {
    var kind = BL(ctx, R.pick(['est10', 'est10', 'est100']), R.pick(['est100', 'reason', 'reason']), R.pick(['reason', 'word', 'est100'])), a, b, op, to, ra, rb, e;
    if (kind === 'reason') {
      op = R.pick(['+', '-']); var nm = R.pick(NAMES), claim, exact, wrongWhy = '';
      if (op === '+') { var pr = addPair(R, R.pick([1, 2]), 3); a = pr[0]; b = pr[1]; exact = a + b; var A = digs(a), B = digs(b), c1 = A[0] + B[0] >= 10 ? 1 : 0; var tensCarry = A[1] + B[1] + c1 >= 10; claim = R.coin() ? exact : tensCarry ? exact - 100 : exact + 100; wrongWhy = tensCarry ? ' (a regrouped hundred was left out)' : ''; }
      else { var sp = subPair(R, 'both'); a = sp[0]; b = sp[1]; exact = a - b; var w = smallFromLarge(a, b); claim = R.coin() || Math.abs(w - exact) < 40 ? exact : w; }
      ra = roundTo(a, 10); rb = roundTo(b, 10); e = op === '+' ? ra + rb : ra - rb; var ok = claim === exact;
      return {
        q: nm + ' found that $' + a + ' ' + op + ' ' + b + ' = ' + claim + '$. Round each number to the nearest ten to estimate. Is ' + nm + '’s answer reasonable?',
        a: aTF(ok),
        steps: ['$' + a + '$ rounds to $' + ra + '$ and $' + b + '$ rounds to $' + rb + '$.', 'Estimate: $' + ra + ' ' + op + ' ' + rb + ' = ' + e + '$.',
          ok ? '$' + claim + '$ is close to $' + e + '$, so the answer is reasonable. (It is also exactly right: $' + a + ' ' + op + ' ' + b + ' = ' + exact + '$.)'
            : '$' + claim + '$ is far from $' + e + '$, so the answer is not reasonable. The exact answer is $' + exact + '$' + wrongWhy + '.'],
        hint: 'Round both numbers, do the easy math, and see whether the answer is close.', chk: { k: 'reason', a: a, b: b, op: op, claim: claim }
      };
    }
    to = kind === 'est10' ? 10 : 100; op = R.pick(['+', '+', '-']);
    function off(v) { return v % to === 0 ? v + R.int(1, to === 10 ? 4 : 40) : v; }
    if (to === 10) { if (op === '+') { a = off(R.int(21, 89)); b = off(R.int(12, 89)); } else { a = off(R.int(41, 97)); b = off(R.int(12, a - 16)); } }
    else if (op === '+') { a = off(R.int(151, 749)); b = off(R.int(112, 940 - a)); }
    else { a = off(R.int(351, 949)); b = off(R.int(112, a - 160)); }
    ra = roundTo(a, to); rb = roundTo(b, to); e = op === '+' ? ra + rb : ra - rb;
    var word = kind === 'word', q;
    if (word) {
      var c1 = op === '+' ? R.pick([['A farm stand sold ' + a + ' apples on Saturday and ' + b + ' apples on Sunday. About how many apples did it sell in all?', 'apples'], ['A zoo had ' + a + ' visitors on Friday and ' + b + ' visitors on Saturday. About how many visitors came on the two days?', 'visitors']])
        : R.pick([['A box holds ' + a + ' beads. ' + R.pick(NAMES) + ' uses ' + b + ' beads. About how many beads are left?', 'beads'], ['A plane can hold ' + a + ' people. ' + b + ' seats are taken. About how many seats are still empty?', 'seats']]);
      q = c1[0] + ' Round each number to the nearest ' + (to === 10 ? 'ten' : 'hundred') + ' to estimate.';
    } else q = 'Estimate $' + a + ' ' + op + ' ' + b + '$ by rounding each number to the nearest ' + (to === 10 ? 'ten' : 'hundred') + '.';
    return {
      q: q, a: aInt(e), unit: word ? c1[1] : undefined,
      steps: ['$' + a + '$ rounds to $' + ra + '$.', '$' + b + '$ rounds to $' + rb + '$.', 'Estimate: $' + ra + ' ' + op + ' ' + rb + ' = ' + e + '$.', 'The exact answer, $' + (op === '+' ? a + b : a - b) + '$, is close to the estimate, as it should be.'],
      hint: 'Round each number first, then ' + (op === '+' ? 'add' : 'subtract') + ' the rounded numbers.', chk: { k: 'est', a: a, b: b, op: op, to: to }
    };
  });

  /* ================================================================== What Multiplication Means */
  var NPL = { 1: 'ones', 2: 'twos', 3: 'threes', 4: 'fours', 5: 'fives', 6: 'sixes', 7: 'sevens', 8: 'eights', 9: 'nines', 10: 'tens' };
  G('g3.equal-groups', function (R, ctx) {
    var kind = BL(ctx, R.pick(['parts', 'match', 'word']), R.pick(['word', 'rep', 'match', 'parts']), R.pick(['word', 'rep', 'word', 'match'])), g, e;
    g = BL(ctx, R.int(2, 6), R.int(3, 7), R.int(4, 9)); e = R.intNot(BL(ctx, 2, 3, 3), BL(ctx, 6, 9, 9), g);
    var tot = g * e, pic = vz('g3-groups', { groups: g, each: e }, pl(g, 'plate') + ' with ' + pl(e, 'dot') + ' on each');
    if (kind === 'parts') return {
      q: R.pick(NAMES) + ' put dots on plates. How many equal groups are there? How many dots are in each group? How many dots are there in all?', viz: pic,
      a: { t: 'multi', parts: [{ label: 'Equal groups:', a: aInt(g) }, { label: 'Dots in each group:', a: aInt(e) }, { label: 'Dots in all:', a: aInt(tot) }] },
      steps: ['Count the plates: there are ' + g + ' equal groups.', 'Each plate has ' + e + ' dots.', g + ' groups of ' + e + ' is $' + g + X + e + '$. Skip count by ' + e + ': ' + skip(e, g) + '.', 'There are ' + tot + ' dots in all: $' + g + X + e + ' = ' + tot + '$.'],
      hint: 'Count the plates first. Then skip count by the number on each plate.', chk: { k: 'eqparts', g: g, e: e }
    };
    if (kind === 'match') return {
      q: R.pick(NAMES) + ' ' + R.pick(['set out', 'drew', 'made']) + ' these plates of dots. Which multiplication tells how many dots there are in all?', viz: pic,
      a: aMC(m(g + X + e), [m(g + ' + ' + e), m(g + X + g), m((g + 1) + X + e), m(e + ' + ' + e)]),
      steps: ['There are ' + g + ' groups, and each group has ' + e + ' dots.', g + ' groups of ' + e + ' is written $' + g + X + e + '$.', 'Adding $' + g + ' + ' + e + '$ would only give ' + (g + e) + ', but there are ' + tot + ' dots.'],
      hint: 'The first number tells how many groups. The second tells how many are in each group.', chk: { k: 'mc' }
    };
    if (kind === 'rep') {
      var adds = []; for (var i = 0; i < g; i++) adds.push(e);
      return {
        q: 'Fill in the box: $' + adds.join(' + ') + ' = ' + BOX + X + e + '$', a: aInt(g),
        steps: ['Count how many ' + NPL[e] + ' are added: there are ' + g + '.', 'So this is ' + g + ' groups of ' + e + ': $' + adds.join(' + ') + ' = ' + g + X + e + '$.', 'Both sides equal ' + tot + '.'],
        hint: 'Count how many ' + e + 's are being added.', chk: { k: 'rep', g: g, e: e }
      };
    }
    var t = R.pick(THINGS);
    return {
      q: R.pick(NAMES) + ' has ' + gN(g, t) + '. Each ' + t.g + ' has ' + iN(e, t) + '. How many ' + ip(t) + ' are there in all?', a: aInt(tot), unit: ip(t),
      steps: ['This is ' + g + ' equal groups with ' + e + ' in each group.', 'Multiply: $' + g + X + e + '$.', 'Skip count by ' + e + ': ' + skip(e, g) + '.', 'There are ' + tot + ' ' + ip(t) + '.'],
      hint: 'How many groups? How many in each? Multiply.', chk: { k: 'mul', a: g, b: e }
    };
  });

  G('g3.arrays-multiplication', function (R, ctx) {
    var kind = BL(ctx, R.pick(['parts', 'total', 'word']), R.pick(['total', 'word', 'add', 'parts']), R.pick(['word', 'total', 'add'])), r, cc, who = R.pick(NAMES);
    r = BL(ctx, R.int(2, 5), R.int(3, 7), R.int(4, 9)); cc = R.intNot(BL(ctx, 2, 3, 4), BL(ctx, 6, 9, 9), r);
    var tot = r * cc, pic = vz('g3-array', { rows: r, cols: cc }, 'An array with ' + r + ' rows of ' + cc + ' dots');
    if (kind === 'parts') return {
      q: who + ' made this array. How many rows are there? How many dots are in each row? How many dots are there in all?', viz: pic,
      a: { t: 'multi', parts: [{ label: 'Rows:', a: aInt(r) }, { label: 'Dots in each row:', a: aInt(cc) }, { label: 'Dots in all:', a: aInt(tot) }] },
      steps: ['Rows go across. There are ' + r + ' rows.', 'Each row has ' + cc + ' dots, the same in every row.', r + ' rows of ' + cc + ' is $' + r + X + cc + '$. Count by rows: ' + skip(cc, r) + '.', '$' + r + X + cc + ' = ' + tot + '$ dots.'],
      hint: 'Count the dots in one row, then count the rows.', chk: { k: 'eqparts', g: r, e: cc }
    };
    if (kind === 'total') return {
      q: R.pick(['How many dots are in this array?', who + ' drew this array. How many dots are in it?', who + ' wants to know how many dots are in this array without counting each one. How many are there?']), viz: pic, a: aInt(tot),
      steps: ['There are ' + r + ' rows with ' + cc + ' dots in each row.', 'So the array shows $' + r + X + cc + '$.', 'Skip count by ' + cc + ' for each row: ' + skip(cc, r) + '.', 'There are ' + tot + ' dots.'],
      hint: 'You don’t need to count every dot. Count one row, then skip count.', chk: { k: 'mul', a: r, b: cc }
    };
    if (kind === 'add') {
      var adds = []; for (var i = 0; i < r; i++) adds.push(cc);
      return {
        q: 'An array has ' + r + ' rows with ' + cc + ' in each row. ' + R.pick(NAMES) + ' adds the rows: $' + adds.join(' + ') + '$. Write this as $' + BOX + X + cc + '$ and find the total.',
        a: { t: 'multi', parts: [{ label: 'The box:', a: aInt(r) }, { label: 'Total:', a: aInt(tot) }] },
        steps: ['Each row adds ' + cc + ', and there are ' + r + ' rows.', 'That is ' + r + ' ' + NPL[cc] + ', so it is $' + r + X + cc + '$. The box is ' + r + '.', 'Total: ' + skip(cc, r) + ', so $' + r + X + cc + ' = ' + tot + '$.'],
        hint: 'How many rows are being added?', chk: { k: 'eqparts2', g: r, e: cc }
      };
    }
    var ctxs = [['A marching band stands in ' + r + ' rows. Each row has ' + cc + ' players. How many players are in the band?', 'players'],
      ['A garden has ' + r + ' rows of carrots with ' + cc + ' carrots in each row. How many carrots are there?', 'carrots'],
      ['A sheet of stamps has ' + r + ' rows of ' + cc + ' stamps. How many stamps are on the sheet?', 'stamps'],
      ['Chairs are set up in ' + r + ' rows with ' + cc + ' chairs in each row. How many chairs are there?', 'chairs'],
      ['A box of chocolates has ' + r + ' rows of ' + cc + ' chocolates. How many chocolates are in the box?', 'chocolates'],
      [who + ' tiles a wall with ' + r + ' rows of ' + cc + ' tiles. How many tiles does ' + who + ' use?', 'tiles'],
      ['A muffin pan has ' + r + ' rows with ' + cc + ' cups in each row. How many muffins can it hold?', 'muffins'],
      ['An orchard has ' + r + ' rows of apple trees with ' + cc + ' trees in each row. How many trees are there?', 'trees'],
      [who + ' plants ' + r + ' rows of tulips with ' + cc + ' tulips in each row. How many tulips are there?', 'tulips'],
      ['A parking lot has ' + r + ' rows with ' + cc + ' spaces in each row. How many spaces are there?', 'spaces'],
      [who + ' puts photos on a wall in ' + r + ' rows of ' + cc + '. How many photos are on the wall?', 'photos'],
      ['A window has ' + r + ' rows of ' + cc + ' panes of glass. How many panes are there?', 'panes']], w = R.pick(ctxs);
    return { q: w[0], a: aInt(tot), unit: w[1], steps: ['Rows and columns make an array: ' + r + ' rows of ' + cc + '.', 'Multiply: $' + r + X + cc + ' = ' + tot + '$.'], hint: 'Picture the rows. Multiply the number of rows by the number in each row.', chk: { k: 'mul', a: r, b: cc } };
  });

  G('g3.commutative-multiplication', function (R, ctx) {
    var kind = BL(ctx, R.pick(['known', 'fill', 'known']), R.pick(['fill', 'tf', 'turn', 'known']), R.pick(['turn', 'tf', 'big', 'fill'])), a = R.int(2, 9), b = R.intNot(2, 10, a);
    if (kind === 'known') return {
      q: R.pick(NAMES) + ' knows that $' + a + X + b + ' = ' + a * b + '$. What is $' + b + X + a + '$?', a: aInt(a * b),
      steps: ['$' + b + X + a + '$ uses the same two numbers in the other order.', 'Turning an array of ' + a + ' rows of ' + b + ' gives ' + b + ' rows of ' + a + '. No dots are added or taken away.', 'So $' + b + X + a + ' = ' + a + X + b + ' = ' + a * b + '$.'],
      hint: 'Picture the array turned on its side. Does the number of dots change?', chk: { k: 'mul', a: a, b: b }
    };
    if (kind === 'fill') return {
      q: 'Fill in the box: $' + a + X + b + ' = ' + b + X + BOX + '$', a: aInt(a),
      steps: ['Changing the order of the factors does not change the product.', 'So $' + a + X + b + ' = ' + b + X + a + '$. The box is ' + a + '.', 'Check: both sides equal ' + a * b + '.'],
      hint: 'The same two numbers, turned around.', chk: { k: 'val', v: a }
    };
    if (kind === 'big') { var B = R.int(13, 99); return {
      q: 'You don’t need to work anything out. Fill in the box: $' + a + X + B + ' = ' + B + X + BOX + '$', a: aInt(a),
      steps: ['Turn-around facts work for every pair of numbers, big or small.', 'An array of ' + a + ' rows of ' + B + ' turned on its side is ' + B + ' rows of ' + a + ', with the same number of dots.', 'So the box is ' + a + '.'],
      hint: 'Turn the factors around.', chk: { k: 'val', v: a }
    }; }
    if (kind === 'turn') return {
      q: 'This array has ' + a + ' rows of ' + b + '. If you turn it so it has ' + b + ' rows, how many dots are in each row? How many dots are there in all?',
      viz: vz('g3-array', { rows: a, cols: b }, 'An array with ' + a + ' rows of ' + b + ' dots'),
      a: { t: 'multi', parts: [{ label: 'Dots in each row:', a: aInt(a) }, { label: 'Dots in all:', a: aInt(a * b) }] },
      steps: ['Turning the array makes its columns into rows. There were ' + b + ' columns, each ' + a + ' dots tall.', 'So now there are ' + b + ' rows with ' + a + ' dots in each.', 'The dots are the same dots: $' + b + X + a + ' = ' + a + X + b + ' = ' + a * b + '$.'],
      hint: 'Each column of the array becomes a row.', chk: { k: 'turn', a: a, b: b }
    };
    var st = R.pick([['$' + a + X + b + ' = ' + b + X + a + '$', true], ['$' + a + X + b + ' = ' + a + ' + ' + b + '$', false], ['$' + a + X + b + ' = ' + b + X + (a + 1) + '$', false], ['$' + b + X + a + ' = ' + a * b + '$', true]]);
    return {
      q: 'True or false: ' + st[0], a: aTF(st[1]),
      steps: ['$' + a + X + b + ' = ' + a * b + '$.', st[1] ? 'The other side is also ' + a * b + ', so the statement is true.' : 'The other side is not ' + a * b + ', so the statement is false. Only the same two factors in either order give the same product.'],
      hint: 'Work out each side.', chk: { k: 'tfcomm', s: st[0], v: st[1] }
    };
  });

  G('g3.multiply-0-1', function (R, ctx) {
    var kind = BL(ctx, R.pick(['calc', 'calc', 'pic']), R.pick(['calc', 'miss', 'tf', 'pic']), R.pick(['miss', 'tf', 'big', 'calc'])), n = R.int(2, BL(ctx, 30, 60, 100)), z = R.coin(), first = R.coin();
    if (kind === 'pic') {
      n = R.int(2, 10); var tz = R.pick(THINGS.filter(function (t) { return ['box', 'bag', 'vase', 'pack', 'jar', 'basket', 'tank'].indexOf(t.g) >= 0; })), who0 = R.pick(NAMES);
      if (z) return { q: who0 + ' has ' + gN(n, tz) + ', but there are no ' + ip(tz) + ' in any ' + tz.g + '. How many ' + ip(tz) + ' are there?', viz: vz('g3-groups', { groups: n, each: 0 }, n + ' empty groups'), a: aInt(0), unit: ip(tz), steps: [n + ' groups of 0 is $' + n + X + '0$.', 'Adding ' + n + ' zeros still gives 0.', 'So $' + n + X + '0 = 0$. There are 0 ' + ip(tz) + '.'], hint: 'How many are on each plate?', chk: { k: 'mul', a: n, b: 0 } };
      return { q: who0 + ' has 1 ' + tz.g + ' with ' + iN(n, tz) + ' in it. How many ' + ip(tz) + ' are there?', viz: vz('g3-groups', { groups: 1, each: n }, '1 group of ' + n + ' dots'), a: aInt(n), unit: ip(tz), steps: ['1 group of ' + n + ' is $1' + X + n + '$.', 'One group of ' + n + ' is just ' + n + '.', 'So $1' + X + n + ' = ' + n + '$.'], hint: 'How many groups are there?', chk: { k: 'mul', a: 1, b: n } };
    }
    if (kind === 'miss') {
      if (z) return { q: 'Fill in the box: $' + n + X + BOX + ' = 0$', a: aInt(0), steps: ['Only one number times ' + n + ' gives 0: the number 0.', 'Any number times 1 is itself, and other numbers give more.', 'So the box is 0: $' + n + X + '0 = 0$.'], hint: 'How many in each group would make 0 in all?', chk: { k: 'val', v: 0 } };
      return { q: 'Fill in the box: $' + BOX + X + n + ' = ' + n + '$', a: aInt(1), steps: ['How many groups of ' + n + ' make ' + n + '?', 'Exactly 1 group.', 'So the box is 1: $1' + X + n + ' = ' + n + '$.'], hint: 'How many groups of ' + n + ' do you need to get ' + n + '?', chk: { k: 'val', v: 1 } };
    }
    if (kind === 'tf') {
      var st = R.pick([[n + X + '0 = ' + n, false, 'Times 0 means groups of nothing, so the product is 0, not ' + n + '. Adding 0 leaves a number the same; multiplying by 0 does not.'],
        ['0' + X + n + ' = 0', true, '0 groups of ' + n + ' is nothing at all, so the product is 0.'],
        ['1' + X + n + ' = 1', false, '1 group of ' + n + ' is ' + n + ', not 1.'],
        [n + X + '1 = ' + n, true, n + ' groups with 1 in each is ' + n + '.'],
        [n + X + '0 = ' + n + ' + 0', false, n + ' + 0 = ' + n + ', but $' + n + X + '0 = 0$.']]);
      return { q: 'True or false: $' + st[0] + '$', a: aTF(st[1]), steps: [st[2], 'So the statement is ' + (st[1] ? 'true' : 'false') + '.'], hint: 'Think of equal groups: how many groups, and how many in each?', chk: { k: 'tf01', s: st[0], v: st[1] } };
    }
    if (kind === 'big') n = R.int(101, 999);
    var a = first ? (z ? 0 : 1) : n, b = first ? n : (z ? 0 : 1), ans = a * b;
    return {
      q: 'Find $' + a + X + b + '$.', a: aInt(ans),
      steps: z ? [(a === 0 ? '0 groups of ' + b + ' is nothing.' : a + ' groups of 0 is nothing.'), 'Any number times 0 is 0.', 'So $' + a + X + b + ' = 0$.'] : [(a === 1 ? '1 group of ' + b + ' is ' + b + '.' : a + ' groups of 1 is ' + a + '.'), 'Any number times 1 is that number.', 'So $' + a + X + b + ' = ' + ans + '$.'],
      hint: z ? 'What do you get when every group is empty, or there are no groups?' : 'What is one group of a number?', chk: { k: 'mul', a: a, b: b }
    };
  });

  function factSteps(a, b) { // a strategy for a x b, chosen by the smaller-friendly factor
    var f = [2, 5, 10, 3, 4, 6, 9, 8, 7].filter(function (k) { return k === a || k === b; })[0] || a, n = f === a ? b : a, p = a * b, s = [];
    if (f === 2) s.push('Times 2 is a double: $' + n + ' + ' + n + ' = ' + p + '$.');
    else if (f === 5) s.push('Count by 5s: ' + skip(5, n) + '. (Or take half of $10' + X + n + ' = ' + 10 * n + '$.)');
    else if (f === 10) s.push(n + ' tens is ' + p + '. Count by 10s: ' + skip(10, n) + '.');
    else if (f === 3) s.push('Double ' + n + ' and add one more ' + n + ': $' + 2 * n + ' + ' + n + ' = ' + p + '$.');
    else if (f === 4) s.push('Double, then double again: $2' + X + n + ' = ' + 2 * n + '$, and $' + 2 * n + ' + ' + 2 * n + ' = ' + p + '$.');
    else if (f === 6) s.push('Five ' + n + 's and one more ' + n + ': $' + 5 * n + ' + ' + n + ' = ' + p + '$.');
    else if (f === 9) s.push('Ten ' + n + 's take away one ' + n + ': $' + 10 * n + ' - ' + n + ' = ' + p + '$.');
    else if (f === 8) s.push('Double four ' + n + 's: $4' + X + n + ' = ' + 4 * n + '$, and $' + 4 * n + ' + ' + 4 * n + ' = ' + p + '$.');
    else if (f === 7) s.push('Five ' + n + 's and two ' + n + 's: $' + 5 * n + ' + ' + 2 * n + ' = ' + p + '$.');
    s.push('So $' + a + X + b + ' = ' + p + '$.');
    return s;
  }
  /* the same fact in different forms: plain, a story, an array picture, or checking someone's answer */
  function factProblem(R, f, ctx, lo) {
    var n = R.int(lo || 2, 10), a = R.coin() ? f : n, b = a === f ? n : f, form = R.pick(['plain', 'plain', 'story', 'array', 'check']), who = R.pick(NAMES);
    if (form === 'story') {
      var t = R.pick(THINGS);
      return { q: who + ' has ' + gN(a, t) + ' with ' + iN(b, t) + ' in each ' + t.g + '. How many ' + ip(t) + ' are there in all?', a: aInt(a * b), unit: ip(t), steps: [a + ' groups of ' + b + ' is $' + a + X + b + '$.'].concat(factSteps(a, b)), hint: 'How many groups? How many in each group?', chk: { k: 'mul', a: a, b: b } };
    }
    if (form === 'array') return { q: who + ' made an array with ' + a + ' rows of ' + b + ' dots. How many dots are there?', viz: vz('g3-array', { rows: a, cols: b }, 'An array with ' + a + ' rows of ' + b + ' dots'), a: aInt(a * b), steps: [a + ' rows of ' + b + ' is $' + a + X + b + '$.'].concat(factSteps(a, b)), hint: 'Count one row, then skip count by rows.', chk: { k: 'mul', a: a, b: b } };
    if (form === 'check') {
      var ok = R.coin(), shown = ok ? a * b : a * b + R.pick([-f, f, -1, 1].filter(function (d) { return a * b + d > 0; }));
      return { q: who + ' says $' + a + X + b + ' = ' + shown + '$. Is ' + who + ' right?', a: { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, steps: factSteps(a, b).concat([ok ? 'So ' + who + ' is right.' : 'So ' + who + ' is not right: $' + a + X + b + ' = ' + a * b + '$, not ' + shown + '.']), hint: 'Find the product yourself, then compare.', chk: { k: 'tfmul', a: a, b: b, shown: shown, v: ok } };
    }
    return { q: 'Find $' + a + X + b + '$.', a: aInt(a * b), steps: factSteps(a, b), hint: 'Use a fact you know: a double, a count by 5s or 10s, or one group more or less.', chk: { k: 'mul', a: a, b: b } };
  }
  function missProblem(R, f) {
    var n = R.int(2, 10), p = f * n, left = R.coin();
    if (R.chance(0.4)) {
      var t = R.pick(THINGS), who = R.pick(NAMES);
      return { q: who + ' puts ' + iN(p, t) + ' into ' + gp(t) + ', with ' + f + ' in each ' + t.g + '. How many ' + gp(t) + ' does ' + who + ' fill? (Think: $' + BOX + X + f + ' = ' + p + '$.)', a: aInt(n), unit: gp(t), steps: ['Ask: what number times ' + f + ' makes ' + p + '?', 'Count by ' + f + 's until you reach ' + p + ': ' + skip(f, n) + '. That is ' + n + ' jumps.', 'So ' + who + ' fills ' + gN(n, t) + ': $' + n + X + f + ' = ' + p + '$.'], hint: 'Count by ' + f + 's up to ' + p + '.', chk: { k: 'val', v: n, f: f, p: p } };
    }
    return { q: 'Fill in the box: $' + (left ? f + X + BOX : BOX + X + f) + ' = ' + p + '$', a: aInt(n), steps: ['Ask: what number times ' + f + ' makes ' + p + '?', 'Count by ' + f + 's until you reach ' + p + ': ' + skip(f, n) + '. That is ' + n + ' jumps.', 'So the box is ' + n + ': $' + f + X + n + ' = ' + p + '$.'], hint: 'Skip count by ' + f + 's and count the jumps.', chk: { k: 'miss', f: f, p: p } };
  }

  G('g3.facts-2-5-10', function (R, ctx) {
    var kind = BL(ctx, R.pick(['fact', 'fact', 'word']), R.pick(['fact', 'miss', 'half', 'word']), R.pick(['word', 'miss', 'half', 'fact'])), f = R.pick([2, 5, 10]);
    if (kind === 'fact') return factProblem(R, f, ctx, BL(ctx, 2, 3, 3));
    if (kind === 'miss') return missProblem(R, f);
    var n = R.int(3, 10);
    if (kind === 'half') return {
      q: R.pick(NAMES) + ' knows $10' + X + n + ' = ' + 10 * n + '$. Use it to find $5' + X + n + '$.', a: aInt(5 * n),
      steps: ['5 is half of 10, so 5 groups are half as many as 10 groups.', 'Half of ' + 10 * n + ' is ' + 5 * n + '.', 'So $5' + X + n + ' = ' + 5 * n + '$.'],
      hint: 'How is 5 related to 10?', chk: { k: 'mul', a: 5, b: n }
    };
    var w = R.pick([['How many cents are ' + n + ' nickels worth? (A nickel is 5 cents.)', 5, 'cents'], ['How many socks are in ' + n + ' pairs of socks?', 2, 'socks'], ['How many cents are ' + n + ' dimes worth? (A dime is 10 cents.)', 10, 'cents'], ['How many fingers are on ' + n + ' people’s hands, if each person has 10 fingers?', 10, 'fingers'], ['How many wheels are on ' + n + ' bikes?', 2, 'wheels']]);
    return { q: w[0], a: aInt(w[1] * n), unit: w[2], steps: ['There are ' + n + ' groups of ' + w[1] + ': $' + n + X + w[1] + '$.'].concat(factSteps(n, w[1])), hint: 'How many groups, and how many in each group?', chk: { k: 'mul', a: n, b: w[1] } };
  });

  G('g3.facts-3-4-6', function (R, ctx) {
    var kind = BL(ctx, R.pick(['fact', 'fact', 'dbl']), R.pick(['dbl', 'six', 'three', 'fact', 'miss']), R.pick(['miss', 'word', 'fact', 'six'])), f = R.pick([3, 4, 6]), n = R.int(3, 10);
    if (kind === 'fact') return factProblem(R, f, ctx, 2);
    if (kind === 'miss') return missProblem(R, f);
    if (kind === 'dbl') return {
      q: R.pick(NAMES) + ' knows $2' + X + n + ' = ' + 2 * n + '$. Use it to find $4' + X + n + '$.', a: aInt(4 * n),
      steps: ['4 groups is 2 groups and 2 more groups, so $4' + X + n + '$ is double $2' + X + n + '$.', 'Double ' + 2 * n + ': $' + 2 * n + ' + ' + 2 * n + ' = ' + 4 * n + '$.', 'So $4' + X + n + ' = ' + 4 * n + '$.'],
      hint: 'Double it.', chk: { k: 'mul', a: 4, b: n }
    };
    if (kind === 'six') return {
      q: R.pick(NAMES) + ' knows $5' + X + n + ' = ' + 5 * n + '$. Use it to find $6' + X + n + '$.', a: aInt(6 * n),
      steps: ['6 groups of ' + n + ' is 5 groups of ' + n + ' and 1 more group of ' + n + '.', 'So $6' + X + n + ' = ' + 5 * n + ' + ' + n + '$.', '$' + 5 * n + ' + ' + n + ' = ' + 6 * n + '$.'],
      hint: 'Add one more group of ' + n + '.', chk: { k: 'mul', a: 6, b: n }
    };
    if (kind === 'three') return {
      q: R.pick(NAMES) + ' knows $2' + X + n + ' = ' + 2 * n + '$. Use it to find $3' + X + n + '$.', a: aInt(3 * n),
      steps: ['3 groups of ' + n + ' is 2 groups of ' + n + ' and 1 more group.', 'So $3' + X + n + ' = ' + 2 * n + ' + ' + n + '$.', '$' + 2 * n + ' + ' + n + ' = ' + 3 * n + '$.'],
      hint: 'Add one more group of ' + n + '.', chk: { k: 'mul', a: 3, b: n }
    };
    var w = R.pick([['How many wheels are on ' + n + ' tricycles?', 3, 'wheels'], ['How many legs are on ' + n + ' chairs?', 4, 'legs'], ['An insect has 6 legs. How many legs do ' + n + ' insects have?', 6, 'legs'], ['A pack has 4 juice boxes. How many juice boxes are in ' + n + ' packs?', 4, 'juice boxes'], ['Eggs come in rows of 6. How many eggs are in ' + n + ' rows?', 6, 'eggs']]);
    return { q: w[0], a: aInt(w[1] * n), unit: w[2], steps: ['There are ' + n + ' groups of ' + w[1] + ': $' + n + X + w[1] + '$.'].concat(factSteps(n, w[1])), hint: 'How many groups, and how many in each group?', chk: { k: 'mul', a: n, b: w[1] } };
  });

  G('g3.distributive-facts', function (R, ctx) {
    var kind = BL(ctx, R.pick(['parts', 'parts', 'fill']), R.pick(['fill', 'mc', 'parts2', 'parts']), R.pick(['big', 'mc', 'fill', 'parts2'])), a = R.int(6, 9), b = R.int(2, 10), p1, p2, whoD = R.pick(NAMES);
    if (kind === 'parts' || kind === 'parts2') {
      var s1 = kind === 'parts' ? 5 : R.pick([2, 3, 4].filter(function (v) { return v < a; })), s2 = a - s1;
      p1 = s1 * b; p2 = s2 * b;
      return {
        q: whoD + ' breaks apart $' + a + X + b + '$ into $' + s1 + X + b + '$ and $' + s2 + X + b + '$. Find each part, then the whole product.',
        viz: vz('g3-array', { rows: a, cols: b, splitRows: s1, labels: true }, 'An array of ' + a + ' rows of ' + b + ', split into ' + s1 + ' rows and ' + s2 + ' rows'),
        a: { t: 'multi', parts: [{ label: '$' + s1 + X + b + ' =$', a: aInt(p1) }, { label: '$' + s2 + X + b + ' =$', a: aInt(p2) }, { label: '$' + a + X + b + ' =$', a: aInt(a * b) }] },
        steps: [a + ' rows is ' + s1 + ' rows and ' + s2 + ' more rows, so $' + a + X + b + ' = ' + s1 + X + b + ' + ' + s2 + X + b + '$.', '$' + s1 + X + b + ' = ' + p1 + '$.', '$' + s2 + X + b + ' = ' + p2 + '$.', 'Add the parts: $' + p1 + ' + ' + p2 + ' = ' + a * b + '$.'],
        hint: 'Find the top part and the bottom part, then add them.', chk: { k: 'dist', a: a, b: b, s1: s1 }
      };
    }
    if (kind === 'fill') {
      var t = R.int(1, a - 2), sa = a - t;
      return {
        q: whoD + ' broke apart a fact. Fill in the box: $' + a + X + b + ' = ' + sa + X + b + ' + ' + BOX + X + b + '$', a: aInt(t),
        steps: ['The ' + a + ' is broken into two parts. One part is ' + sa + '.', 'The parts must add back to ' + a + ': $' + sa + ' + ' + t + ' = ' + a + '$.', 'So the box is ' + t + '. Check: $' + sa * b + ' + ' + t * b + ' = ' + a * b + '$, and $' + a + X + b + ' = ' + a * b + '$.'],
        hint: sa + ' plus what makes ' + a + '?', chk: { k: 'val', v: t }
      };
    }
    if (kind === 'big') {
      var B = R.int(11, 15), t2 = B - 10;
      return {
        q: 'Find $' + a + X + B + '$ by breaking ' + B + ' into $10 + ' + t2 + '$.',
        a: { t: 'multi', parts: [{ label: '$' + a + X + '10 =$', a: aInt(10 * a) }, { label: '$' + a + X + t2 + ' =$', a: aInt(a * t2) }, { label: '$' + a + X + B + ' =$', a: aInt(a * B) }] },
        steps: ['$' + a + X + B + ' = ' + a + X + '10 + ' + a + X + t2 + '$.', '$' + a + X + '10 = ' + 10 * a + '$ and $' + a + X + t2 + ' = ' + a * t2 + '$.', 'Add: $' + 10 * a + ' + ' + a * t2 + ' = ' + a * B + '$.'],
        hint: 'Multiply ' + a + ' by each part, then add.', chk: { k: 'distbig', a: a, B: B }
      };
    }
    var s = R.int(2, a - 2), r = a - s;
    return {
      q: 'Which one is equal to $' + a + X + b + '$?',
      a: aMC(m(s + X + b + ' + ' + r + X + b), [m(s + X + b + ' + ' + r), m(s + ' + ' + r + X + b), m(s + X + r + ' + ' + b)]),
      steps: ['Break the ' + a + ' into ' + s + ' and ' + r + '. Both parts must be multiplied by ' + b + '.', '$' + s + X + b + ' + ' + r + X + b + ' = ' + s * b + ' + ' + r * b + ' = ' + a * b + '$, the same as $' + a + X + b + '$.', 'In $' + s + X + b + ' + ' + r + '$, the ' + r + ' was never multiplied by ' + b + ', so it only gives ' + (s * b + r) + '.'],
      hint: 'Each part of ' + a + ' has to be multiplied by ' + b + '.', chk: { k: 'mc' }
    };
  });

  G('g3.facts-7-8-9', function (R, ctx) {
    var kind = BL(ctx, R.pick(['fact', 'fact', 'nine']), R.pick(['nine', 'eight', 'seven', 'fact']), R.pick(['miss', 'word', 'fact', 'eight'])), n = R.int(3, 10);
    if (kind === 'fact') return factProblem(R, R.pick([7, 8, 9]), ctx, 2);
    if (kind === 'miss') return missProblem(R, R.pick([7, 8, 9]));
    if (kind === 'nine') return {
      q: R.pick(NAMES) + ' knows $10' + X + n + ' = ' + 10 * n + '$. Use it to find $9' + X + n + '$.', a: aInt(9 * n),
      steps: ['9 groups of ' + n + ' is one group less than 10 groups of ' + n + '.', 'So take away one ' + n + ': $' + 10 * n + ' - ' + n + ' = ' + 9 * n + '$.', 'Check the 9s pattern: the digits of ' + 9 * n + ' add to ' + U.digitSum(9 * n) + '.'],
      hint: 'Take away one group of ' + n + '.', chk: { k: 'mul', a: 9, b: n }
    };
    if (kind === 'eight') return {
      q: R.pick(NAMES) + ' knows $4' + X + n + ' = ' + 4 * n + '$. Use it to find $8' + X + n + '$.', a: aInt(8 * n),
      steps: ['8 is double 4, so 8 groups are double 4 groups.', 'Double ' + 4 * n + ': $' + 4 * n + ' + ' + 4 * n + ' = ' + 8 * n + '$.', 'So $8' + X + n + ' = ' + 8 * n + '$.'],
      hint: 'Double it.', chk: { k: 'mul', a: 8, b: n }
    };
    if (kind === 'seven') return {
      q: R.pick(NAMES) + ' finds $7' + X + n + '$ by breaking 7 into $5 + 2$. What is $7' + X + n + '$?', a: aInt(7 * n),
      steps: ['$7' + X + n + ' = 5' + X + n + ' + 2' + X + n + '$.', '$5' + X + n + ' = ' + 5 * n + '$ and $2' + X + n + ' = ' + 2 * n + '$.', 'Add: $' + 5 * n + ' + ' + 2 * n + ' = ' + 7 * n + '$.'],
      hint: 'Find 5 groups and 2 groups, then add.', chk: { k: 'mul', a: 7, b: n }
    };
    var w = R.pick([['There are 7 days in a week. How many days are in ' + n + ' weeks?', 7, 'days'], ['A spider has 8 legs. How many legs do ' + n + ' spiders have?', 8, 'legs'], ['Each team has 9 players. How many players are on ' + n + ' teams?', 9, 'players'], ['An octopus has 8 arms. How many arms do ' + n + ' octopuses have?', 8, 'arms']]);
    return { q: w[0], a: aInt(w[1] * n), unit: w[2], steps: ['There are ' + n + ' groups of ' + w[1] + ': $' + n + X + w[1] + '$.'].concat(factSteps(n, w[1])), hint: 'Use a fact you know, then add or take away a group.', chk: { k: 'mul', a: n, b: w[1] } };
  });

  G('g3.associative-multiplication', function (R, ctx) {
    var kind = BL(ctx, R.pick(['calc', 'calc', 'fill']), R.pick(['calc', 'fill', 'tf', 'calc2', 'word']), R.pick(['word', 'calc2', 'tf'])), n = R.int(3, 12), a, b, cc, whoA = R.pick(NAMES);
    if (kind === 'calc') {
      var ord = R.pick([[2, n, 5], [5, n, 2], [n, 2, 5], [2, 5, n], [5, 2, n]]); a = ord[0]; b = ord[1]; cc = ord[2];
      return {
        q: whoA + ' wants to find $' + a + X + b + X + cc + '$. Look for two numbers that are easy to multiply first. What is the product?', a: aInt(a * b * cc),
        steps: ['$2' + X + '5 = 10$ is easy, so group those two first.', 'Grouping does not change the product: $' + a + X + b + X + cc + ' = ' + n + X + '(2' + X + '5)$.', '$' + n + X + '10 = ' + 10 * n + '$.'],
        hint: 'Which two numbers make 10?', chk: { k: 'mul3', f: [a, b, cc] }
      };
    }
    if (kind === 'calc2') {
      var tr = R.pick([[3, 2, n], [2, 3, n], [2, 4, n], [4, 2, n], [2, n, 3]]); a = tr[0]; b = tr[1]; cc = tr[2];
      if (a * b * cc > 100) { cc = Math.floor(100 / (a * b)); if (tr[2] !== n) { b = Math.floor(100 / (a * cc)); } }
      var s = [a, b, cc].filter(function (v) { return v <= 4; }), p = a * b * cc;
      return {
        q: 'Find $' + a + X + b + X + cc + '$.', a: aInt(p),
        steps: ['Multiply two of the numbers first: $' + a + X + b + ' = ' + a * b + '$.', 'Then multiply by the third: $' + a * b + X + cc + ' = ' + p + '$.', 'Grouping another way gives the same answer: $' + a + X + '(' + b + X + cc + ') = ' + a + X + b * cc + ' = ' + p + '$.'],
        hint: 'Multiply any two numbers first, then multiply by the last one.', chk: { k: 'mul3', f: [a, b, cc] }
      };
    }
    if (kind === 'fill') {
      a = R.int(2, 5); b = R.int(2, 4); cc = R.int(2, 5);
      return {
        q: whoA + ' groups the factors another way. Fill in the box: $(' + a + X + b + ')' + X + cc + ' = ' + a + X + '(' + b + X + BOX + ')$', a: aInt(cc),
        steps: ['Both sides multiply the same three numbers: ' + a + ', ' + b + ' and ' + cc + '.', 'Only the grouping (the parentheses) moved. So the box is ' + cc + '.', 'Check: $(' + a * b + ')' + X + cc + ' = ' + a * b * cc + '$ and $' + a + X + '(' + b * cc + ') = ' + a * b * cc + '$.'],
        hint: 'The same three numbers are on both sides.', chk: { k: 'val', v: cc }
      };
    }
    if (kind === 'tf') {
      a = R.int(2, 5); b = R.int(2, 4); cc = R.int(2, 5);
      var st = R.pick([['$(' + a + X + b + ')' + X + cc + ' = ' + a + X + '(' + b + X + cc + ')$', true], ['$(' + a + X + b + ')' + X + cc + ' = ' + a + X + b + ' + ' + cc + '$', false], ['$' + a + X + b + X + cc + ' = ' + cc + X + b + X + a + '$', true], ['$(' + a + X + b + ')' + X + cc + ' = ' + (a * b * cc + a) + '$', false]]);
      return { q: 'True or false: ' + st[0], a: aTF(st[1]), steps: ['$' + a + X + b + X + cc + ' = ' + a * b * cc + '$, however you group it.', st[1] ? 'The other side also equals ' + a * b * cc + ', so it is true.' : 'The other side does not equal ' + a * b * cc + ', so it is false.'], hint: 'Work out both sides.', chk: { k: 'tfassoc', a: a, b: b, c: cc, v: st[1] } };
    }
    a = R.int(2, 4); b = R.pick([2, 5]); cc = R.int(2, 5);
    var w3 = R.pick([['shelves', 'shelf', 'boxes', 'box', 'toys'], ['tables', 'table', 'plates', 'plate', 'crackers'], ['bags', 'bag', 'packs', 'pack', 'stickers'], ['rows', 'row', 'pots', 'pot', 'flowers'], ['crates', 'crate', 'cartons', 'carton', 'eggs']]);
    return {
      q: whoA + ' sees ' + a + ' ' + w3[0] + '. Each ' + w3[1] + ' has ' + b + ' ' + w3[2] + '. Each ' + w3[3] + ' holds ' + cc + ' ' + w3[4] + '. How many ' + w3[4] + ' are there?', a: aInt(a * b * cc), unit: w3[4],
      steps: [cap(w3[2]) + ': $' + a + X + b + ' = ' + a * b + '$.', cap(w3[4]) + ': $' + a * b + X + cc + ' = ' + a * b * cc + '$.', 'Another way: ' + w3[4] + ' for one ' + w3[1] + ', $' + b + X + cc + ' = ' + b * cc + '$, then $' + a + X + b * cc + ' = ' + a * b * cc + '$. Same answer.'],
      hint: 'Find how many ' + w3[2] + ' there are first, or how many ' + w3[4] + ' go with one ' + w3[1] + '.', chk: { k: 'mul3', f: [a, b, cc] }
    };
  });

  G('g3.multiply-by-multiples-of-10', function (R, ctx) {
    var kind = BL(ctx, R.pick(['calc', 'tens', 'word']), R.pick(['calc', 'tens', 'miss', 'word']), R.pick(['miss', 'word', 'calc'])), n = R.int(2, 9), t = R.int(2, 9), M = t * 10, p = n * M;
    var first = R.coin(), a = first ? n : M, b = first ? M : n;
    var why = ['$' + M + '$ is ' + t + ' tens.', '$' + n + X + t + '$ tens is $' + n * t + '$ tens, because $' + n + X + t + ' = ' + n * t + '$.', n * t + ' tens is ' + commas(p) + '.'];
    if (kind === 'tens') return { q: 'How many tens are in $' + a + X + b + '$?', a: aInt(n * t), unit: 'tens', steps: why.slice(0, 2), hint: 'How many tens is ' + M + '?', chk: { k: 'mul', a: n, b: t } };
    if (kind === 'miss') {
      var left = R.coin();
      if (left) return { q: 'Fill in the box: $' + n + X + BOX + ' = ' + commas(p) + '$', a: aInt(M), steps: [commas(p) + ' is ' + n * t + ' tens.', n + ' times how many tens makes ' + n * t + ' tens? $' + n + X + t + ' = ' + n * t + '$, so ' + t + ' tens.', t + ' tens is ' + M + '. The box is ' + M + '.'], hint: 'Think in tens: ' + commas(p) + ' is ' + n * t + ' tens.', chk: { k: 'divv', p: p, d: n } };
      return { q: 'Fill in the box: $' + BOX + X + M + ' = ' + commas(p) + '$', a: aInt(n), steps: [M + ' is ' + t + ' tens and ' + commas(p) + ' is ' + n * t + ' tens.', 'What times ' + t + ' tens makes ' + n * t + ' tens? $' + n + X + t + ' = ' + n * t + '$.', 'The box is ' + n + '.'], hint: 'Think in tens: ' + M + ' is ' + t + ' tens.', chk: { k: 'divv', p: p, d: M } };
    }
    if (kind === 'word') {
      var w = R.pick([['A store has ' + n + ' boxes of pencils. Each box holds ' + M + ' pencils. How many pencils are there?', 'pencils'], ['A bus drives ' + M + ' miles each day. How many miles does it drive in ' + n + ' days?', 'miles'], [n + ' classes each collect ' + M + ' cans. How many cans do they collect?', 'cans'], ['A ticket costs ' + M + ' cents. How many cents do ' + n + ' tickets cost?', 'cents']]);
      return { q: w[0], a: aInt(p), unit: w[1], steps: ['Multiply: $' + n + X + M + '$.'].concat(why), hint: 'Think of ' + M + ' as ' + t + ' tens.', chk: { k: 'mul', a: n, b: M } };
    }
    return { q: 'Find $' + a + X + b + '$.', a: aInt(p), steps: why, hint: 'Think of ' + M + ' as ' + t + ' tens.', chk: { k: 'mul', a: a, b: b } };
  });

  /* ================================================================== What Division Means */
  G('g3.division-sharing', function (R, ctx) {
    var kind = BL(ctx, R.pick(['pic', 'word', 'eq']), R.pick(['word', 'word', 'eq', 'pic']), R.pick(['word', 'rev', 'eq'])), g = BL(ctx, R.int(2, 5), R.int(2, 8), R.int(3, 9)), e = BL(ctx, R.int(2, 6), R.int(2, 9), R.int(3, 9)), t = g * e;
    var deal = ['Share them out one at a time, like dealing cards: each round puts 1 on every one of the ' + g + ' ' + (kind === 'pic' ? 'plates' : 'groups') + ' and uses ' + g + '.', 'Keep dealing: ' + skip(g, e) + '. That is ' + e + ' rounds, so each gets ' + e + '.', 'So $' + t + DV + g + ' = ' + e + '$. Check: $' + g + X + e + ' = ' + t + '$.'];
    if (kind === 'pic') return {
      q: (function () { var fd = R.pick(['strawberries', 'grapes', 'crackers', 'cherries', 'blueberries', 'cookies', 'carrot sticks', 'pretzels']); kind = fd; return R.pick(NAMES) + ' shares the ' + t + ' ' + fd + ' equally on the ' + g + ' plates. How many ' + fd + ' go on each plate?'; })(),
      viz: vz('g3-groups', { groups: g, each: 0, pile: t }, 'A pile of ' + t + ' dots and ' + g + ' empty plates'), a: aInt(e), unit: kind, steps: deal,
      hint: 'Put one on each plate, then another on each plate, until the pile is gone.', chk: { k: 'div', t: t, d: g }
    };
    if (kind === 'eq') return { q: 'Find $' + t + DV + g + '$. Think of sharing ' + t + ' things equally into ' + g + ' groups.', a: aInt(e), steps: deal, hint: 'How many would each of the ' + g + ' groups get?', chk: { k: 'div', t: t, d: g } };
    var th = R.pick([['stickers', 'friends'], ['crayons', 'tables'], ['grapes', 'bowls'], ['books', 'shelves'], ['marbles', 'jars'], ['pencils', 'students'], ['seeds', 'pots'], ['beads', 'necklaces'], ['cards', 'players'], ['shells', 'buckets'], ['apples', 'baskets'], ['stamps', 'pages']]), nm = R.pick(NAMES);
    if (kind === 'rev') return {
      q: nm + ' shared some ' + th[0] + ' equally among ' + g + ' ' + th[1] + '. Each got ' + e + ' ' + th[0] + '. How many ' + th[0] + ' did ' + nm + ' share?', a: aInt(t), unit: th[0],
      steps: ['There are ' + g + ' equal groups with ' + e + ' in each.', 'The total is $' + g + X + e + ' = ' + t + '$.', 'Check: $' + t + DV + g + ' = ' + e + '$.'], hint: 'The groups and the size of each group are known. What is missing?', chk: { k: 'mul', a: g, b: e }
    };
    return {
      q: nm + ' has ' + t + ' ' + th[0] + ' to share equally among ' + g + ' ' + th[1] + '. How many ' + th[0] + ' does each get?', a: aInt(e), unit: th[0],
      steps: ['Sharing equally into ' + g + ' groups is $' + t + DV + g + '$.'].concat(deal.slice(1)), hint: 'Ask: ' + g + ' times what number makes ' + t + '?', chk: { k: 'div', t: t, d: g }
    };
  });

  G('g3.division-grouping', function (R, ctx) {
    var kind = BL(ctx, R.pick(['pic', 'word', 'word']), R.pick(['word', 'mean', 'word']), R.pick(['mean', 'word', 'mix'])), e = BL(ctx, R.int(2, 6), R.int(2, 9), R.int(3, 9)), g = BL(ctx, R.int(2, 6), R.int(2, 8), R.int(3, 9)), t = g * e;
    var take = ['Make groups of ' + e + ' until none are left. Each group uses ' + e + '.', 'Count by ' + e + 's to ' + t + ': ' + skip(e, g) + '. That is ' + g + ' groups.', 'So $' + t + DV + e + ' = ' + g + '$. Check: $' + g + X + e + ' = ' + t + '$.'];
    if (kind === 'pic') return {
      q: R.pick(NAMES) + ' puts these ' + t + ' dots into groups of ' + e + '. How many groups can ' + R.pick(['they', 'you']) + ' make?', viz: vz('g3-groups', { pile: t }, 'A pile of ' + t + ' dots'), a: aInt(g), unit: 'groups', steps: take,
      hint: 'Circle ' + e + ' dots at a time and count the circles.', chk: { k: 'div', t: t, d: e }
    };
    var th = R.pick([['apples', 'bag', 'bags'], ['eggs', 'carton', 'cartons'], ['students', 'team', 'teams'], ['flowers', 'vase', 'vases'], ['cookies', 'box', 'boxes'], ['cards', 'pile', 'piles'], ['muffins', 'tray', 'trays'], ['books', 'stack', 'stacks'], ['pencils', 'cup', 'cups'], ['crayons', 'pack', 'packs'], ['tulips', 'pot', 'pots'], ['marbles', 'bag', 'bags']]);
    if (kind === 'mean' || (kind === 'mix' && R.coin())) {
      var share = R.coin(), story = share ? t + ' ' + th[0] + ' are split equally into ' + g + ' ' + th[2] + '.' : t + ' ' + th[0] + ' are put into ' + th[2] + ' with ' + e + ' in each ' + th[1] + '.';
      return {
        q: story + ' What does the answer to the division tell you?', a: aMC(share ? 'how many ' + th[0] + ' go in each ' + th[1] : 'how many ' + th[2] + ' there are', [share ? 'how many ' + th[2] + ' there are' : 'how many ' + th[0] + ' go in each ' + th[1], 'how many ' + th[0] + ' there are in all']),
        steps: share ? ['The number of ' + th[2] + ' is known: ' + g + '.', 'The unknown is the size of each group, so $' + t + DV + g + ' = ' + e + '$ tells how many ' + th[0] + ' go in each ' + th[1] + '.'] : ['The size of each group is known: ' + e + '.', 'The unknown is how many groups, so $' + t + DV + e + ' = ' + g + '$ tells how many ' + th[2] + ' there are.'],
        hint: 'Which do you know already: the number of groups, or how many go in each group?', chk: { k: 'mc' }
      };
    }
    return {
      q: R.pick(NAMES) + ' has ' + t + ' ' + th[0] + '. They are put into ' + th[2] + ' with ' + e + ' ' + th[0] + ' in each ' + th[1] + '. How many ' + th[2] + ' are needed?', a: aInt(g), unit: th[2],
      steps: ['The size of each group is ' + e + '. The number of groups is unknown, so divide: $' + t + DV + e + '$.'].concat(take.slice(1)), hint: 'How many groups of ' + e + ' fit in ' + t + '?', chk: { k: 'div', t: t, d: e }
    };
  });

  G('g3.division-missing-factor', function (R, ctx) {
    var kind = BL(ctx, R.pick(['div', 'story', 'pair', 'check']), R.pick(['div', 'use', 'pair', 'story', 'check']), R.pick(['div', 'use', 'pair', 'story', 'check'])), d = BL(ctx, R.pick([2, 3, 4, 5, 10]), R.int(3, 9), R.int(6, 9)), qn = R.int(2, BL(ctx, 9, 10, 10)), t = d * qn, whoM = R.pick(NAMES);
    if (kind === 'story') {
      var ts = R.pick([['chairs', 'rows', 'row'], ['plants', 'rows', 'row'], ['photos', 'pages', 'page'], ['eggs', 'cartons', 'carton'], ['juice boxes', 'packs', 'pack'], ['cupcakes', 'boxes', 'box'], ['toy cars', 'shelves', 'shelf']]);
      return { q: whoM + ' puts ' + t + ' ' + ts[0] + ' into ' + ts[1] + ' of ' + d + '. How many ' + ts[1] + ' are there? Write the missing factor: $' + BOX + X + d + ' = ' + t + '$.', a: aInt(qn), unit: ts[1],
        steps: ['The question is $' + t + DV + d + '$: what number times ' + d + ' makes ' + t + '?', 'Count by ' + d + 's: ' + skip(d, qn) + '. That is ' + qn + ' jumps.', 'So there are ' + qn + ' ' + ts[1] + ': $' + qn + X + d + ' = ' + t + '$.'], hint: 'Count by ' + d + 's until you reach ' + t + '.', chk: { k: 'div', t: t, d: d } };
    }
    if (kind === 'check') {
      var okM = R.coin(), shownM = okM ? qn : qn + R.pick([-1, 1]);
      return { q: whoM + ' says $' + t + DV + d + ' = ' + shownM + '$ because $' + shownM + X + d + ' = ' + t + '$. Is ' + whoM + ' right?', a: aYN(okM),
        steps: ['Check the multiplication: $' + shownM + X + d + ' = ' + shownM * d + '$.', okM ? 'That is ' + t + ', so ' + whoM + ' is right.' : 'That is not ' + t + '. In fact $' + qn + X + d + ' = ' + t + '$, so $' + t + DV + d + ' = ' + qn + '$.'], hint: 'Multiply to check a division.', chk: { k: 'tfdivchk', t: t, d: d, shown: shownM, v: okM } };
    }
    if (kind === 'use') return {
      q: 'Use $' + qn + X + d + ' = ' + t + '$ to find $' + t + DV + d + '$.', a: aInt(qn),
      steps: ['$' + t + DV + d + '$ asks: what number times ' + d + ' makes ' + t + '?', 'You know $' + qn + X + d + ' = ' + t + '$.', 'So $' + t + DV + d + ' = ' + qn + '$.'], hint: 'Division asks for the missing factor.', chk: { k: 'div', t: t, d: d }
    };
    if (kind === 'pair') return {
      q: 'Fill in both boxes with the same number: $' + BOX + X + d + ' = ' + t + '$, so $' + t + DV + d + ' = ' + BOX + '$', a: aInt(qn),
      steps: ['Count by ' + d + 's to ' + t + ': ' + skip(d, qn) + '.', 'That is ' + qn + ' jumps, so $' + qn + X + d + ' = ' + t + '$.', 'And $' + t + DV + d + ' = ' + qn + '$.'], hint: 'Count by ' + d + 's until you reach ' + t + '.', chk: { k: 'div', t: t, d: d }
    };
    return {
      q: 'Find $' + t + DV + d + '$.', a: aInt(qn),
      steps: ['Think of a multiplication: $' + BOX + X + d + ' = ' + t + '$.', 'Count by ' + d + 's: ' + skip(d, qn) + '. That is ' + qn + ' jumps.', 'So $' + qn + X + d + ' = ' + t + '$, and $' + t + DV + d + ' = ' + qn + '$.'], hint: 'What number times ' + d + ' makes ' + t + '?', chk: { k: 'div', t: t, d: d }
    };
  });

  G('g3.fact-families', function (R, ctx) {
    var kind = BL(ctx, R.pick(['missing', 'missing', 'which']), R.pick(['notin', 'missing', 'which']), R.pick(['notin', 'third', 'missing'])), a = R.int(2, 9), b = R.intNot(BL(ctx, 2, 3, 3), 9, a), p = a * b;
    var fam = ['$' + a + X + b + ' = ' + p + '$', '$' + b + X + a + ' = ' + p + '$', '$' + p + DV + a + ' = ' + b + '$', '$' + p + DV + b + ' = ' + a + '$'];
    var famStep = 'The fact family for ' + a + ', ' + b + ' and ' + p + ' is: ' + fam.join(', ') + '.';
    if (kind === 'missing') {
      var which = R.pick([1, 2, 2, 3, 3]), qs = ['$' + b + X + a + ' = ' + BOX + '$', '$' + p + DV + a + ' = ' + BOX + '$', '$' + p + DV + b + ' = ' + BOX + '$'][which - 1], ans = [p, b, a][which - 1];
      return { q: 'You know $' + a + X + b + ' = ' + p + '$. Use the fact family to fill in the box: ' + qs, a: aInt(ans), steps: [famStep, 'So the box is ' + ans + '.'], hint: 'Every fact in a family uses the same three numbers.', chk: { k: 'fam', a: a, b: b, which: which } };
    }
    if (kind === 'notin') return {
      q: 'Which fact is NOT in the fact family for ' + a + ', ' + b + ' and ' + p + '?', a: aMC('$' + a + DV + p + ' = ' + b + '$', fam.slice(0, 3)),
      steps: [famStep, 'In every division in the family, the biggest number, ' + p + ', is divided.', '$' + a + DV + p + ' = ' + b + '$ is not true, so it is not in the family.'], hint: 'In a division fact, which number gets divided?', chk: { k: 'mc' }
    };
    if (kind === 'which') return {
      q: '$' + p + DV + a + ' = ' + b + '$. Which multiplication fact is in the same family?', a: aMC('$' + a + X + b + ' = ' + p + '$', ['$' + p + X + a + ' = ' + b + '$', '$' + a + ' + ' + b + ' = ' + p + '$', '$' + b + X + p + ' = ' + a + '$']),
      steps: ['Division undoes multiplication: $' + p + DV + a + ' = ' + b + '$ because $' + a + X + b + ' = ' + p + '$.', famStep], hint: 'Which multiplication has the same three numbers and is true?', chk: { k: 'mc' }
    };
    return {
      q: 'Three numbers make a fact family: ' + a + ', ? and ' + p + '. What is the missing number?', a: aInt(b),
      steps: ['The biggest number, ' + p + ', is the product of the other two.', 'So ' + a + ' times the missing number is ' + p + ': $' + a + X + b + ' = ' + p + '$.', 'The missing number is ' + b + '.'], hint: a + ' times what makes ' + p + '?', chk: { k: 'div', t: p, d: a }
    };
  });

  G('g3.divide-with-0-1', function (R, ctx) {
    var kind = BL(ctx, R.pick(['calc', 'calc', 'byzero', 'word']), R.pick(['calc', 'tf', 'byzero', 'word']), R.pick(['tf', 'byzero', 'word', 'calc'])), n = R.int(2, BL(ctx, 20, 50, 100));
    if (kind === 'byzero') return {
      q: R.pick(['What is $' + n + DV + '0$?', R.pick(NAMES) + ' wants to find $' + n + DV + '0$. What is it?']), a: aMC('It has no answer: no number times 0 makes ' + n + '.', [m('0'), m(n), m('1')]),
      steps: ['$' + n + DV + '0 = ' + BOX + '$ would mean $' + BOX + X + '0 = ' + n + '$.', 'But any number times 0 is 0, never ' + n + '.', 'So no number works. We say you cannot divide by 0.'], hint: 'Turn it into a multiplication: what times 0 makes ' + n + '?', chk: { k: 'mc' }
    };
    if (kind === 'tf') {
      var st = R.pick([['0' + DV + n + ' = 0', true, '0 shared into ' + n + ' groups gives 0 in each group. Check: $0' + X + n + ' = 0$.'], [n + DV + '0 = 0', false, 'If $' + n + DV + '0$ were 0, then $0' + X + '0$ would be ' + n + '. It is 0. No number works, so you cannot divide by 0.'], [n + DV + n + ' = 0', false, n + ' shared into ' + n + ' groups gives 1 in each group, so $' + n + DV + n + ' = 1$.'], [n + DV + '1 = ' + n, true, n + ' put into 1 group is all ' + n + ' in that group. Check: $' + n + X + '1 = ' + n + '$.'], [n + DV + '1 = 1', false, n + ' put into 1 group keeps all ' + n + ' together, so $' + n + DV + '1 = ' + n + '$.']]);
      return { q: 'True or false: $' + st[0] + '$', a: aTF(st[1]), steps: [st[2], 'So the statement is ' + (st[1] ? 'true' : 'false') + '.'], hint: 'Turn the division into a multiplication and check it.', chk: { k: 'tfdiv', s: st[0], v: st[1] } };
    }
    var c3 = R.pick(['zero', 'one', 'self']);
    if (kind === 'word') {
      if (n > 12) n = R.int(2, 12);
      if (c3 === 'zero') return { q: 'There are 0 cookies left in the jar. ' + R.pick(NAMES) + ' and ' + (n - 1) + (n === 2 ? ' friend' : ' friends') + ' share them equally. How many cookies does each friend get?', a: aInt(0), unit: 'cookies', steps: ['$0' + DV + n + '$: there is nothing to share.', 'Each friend gets 0. Check: $' + n + X + '0 = 0$.'], hint: 'How many cookies are there to share?', chk: { k: 'div', t: 0, d: n } };
      var o1 = R.pick([['stickers', 'page'], ['photos', 'album page'], ['marbles', 'jar'], ['crayons', 'box'], ['shells', 'bucket'], ['coins', 'piggy bank']]);
      if (c3 === 'one') return { q: R.pick(NAMES) + ' has ' + n + ' ' + o1[0] + ' and puts them all in 1 ' + o1[1] + '. How many ' + o1[0] + ' are in the ' + o1[1] + '?', a: aInt(n), unit: o1[0], steps: ['$' + n + DV + '1$: one group holds everything.', 'So $' + n + DV + '1 = ' + n + '$. Check: $1' + X + n + ' = ' + n + '$.'], hint: 'There is only 1 group.', chk: { k: 'div', t: n, d: 1 } };
      var o2 = R.pick(['apples', 'pencils', 'oranges', 'bookmarks', 'juice boxes', 'granola bars']);
      return { q: n + ' ' + o2 + ' are shared equally among ' + n + ' children. How many ' + o2 + ' does each child get?', a: aInt(1), unit: o2, steps: ['$' + n + DV + n + '$: one for each child.', 'So $' + n + DV + n + ' = 1$. Check: $' + n + X + '1 = ' + n + '$.'], hint: 'Is there one for everybody?', chk: { k: 'div', t: n, d: n } };
    }
    var t = c3 === 'zero' ? 0 : n, d = c3 === 'zero' ? n : c3 === 'one' ? 1 : n, ans = t / d;
    return {
      q: 'Find $' + t + DV + d + '$.', a: aInt(ans),
      steps: ['Ask: what number times ' + d + ' makes ' + t + '?', '$' + ans + X + d + ' = ' + t + '$.', 'So $' + t + DV + d + ' = ' + ans + '$.'], hint: 'Turn it into a multiplication: what times ' + d + ' makes ' + t + '?', chk: { k: 'div', t: t, d: d }
    };
  });

  G('g3.unknown-in-equations', function (R, ctx) {
    var a = R.int(2, 9), b = R.int(2, 10), p = a * b, form = BL(ctx, R.pick(['aX', 'Xb']), R.pick(['pdX', 'Xda', 'aX', 'pda']), R.pick(['eqX', 'qeq', 'Xda', 'pdX'])), q, ans, st;
    if (form === 'aX') { q = a + X + BOX + ' = ' + p; ans = b; st = ['Ask: ' + a + ' times what number makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$.']; }
    else if (form === 'Xb') { q = BOX + X + b + ' = ' + p; ans = a; st = ['Ask: what number times ' + b + ' makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$.']; }
    else if (form === 'pdX') { q = p + DV + BOX + ' = ' + a; ans = b; st = [p + ' divided by what number gives ' + a + '? That is the same as asking: ' + a + ' times what makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$, so $' + p + DV + b + ' = ' + a + '$.']; }
    else if (form === 'Xda') { q = BOX + DV + a + ' = ' + b; ans = p; st = ['The box is the number being divided. Splitting it by ' + a + ' gives ' + b + ', so the box is ' + a + ' groups of ' + b + '.', '$' + a + X + b + ' = ' + p + '$, and $' + p + DV + a + ' = ' + b + '$.']; }
    else if (form === 'pda') { q = p + DV + a + ' = ' + BOX; ans = b; st = ['Ask: ' + a + ' times what makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$.']; }
    else if (form === 'eqX') { q = p + ' = ' + BOX + X + b; ans = a; st = ['The equals sign means both sides are the same amount. It can come first.', 'So ' + p + ' is the same as some number times ' + b + '. What times ' + b + ' makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$.']; }
    else { q = a + ' = ' + p + DV + BOX; ans = b; st = ['The equals sign means both sides are the same amount. So ' + p + ' divided by the box must give ' + a + '.', 'That means ' + a + ' times the box is ' + p + ': $' + a + X + b + ' = ' + p + '$.']; }
    st.push('The box is ' + ans + '. Check: put ' + ans + ' in the box and both sides match.');
    var whoU = R.pick(NAMES);
    return { q: R.pick(['Find the number that goes in the box: $' + q + '$', whoU + ' hid a number under the box. What number is it? $' + q + '$', whoU + ' needs the missing number: $' + q + '$']), a: aInt(ans), steps: st, hint: 'Turn it into a question: what number makes both sides equal?', chk: { k: 'unk', form: form, a: a, b: b } };
  });

  /* ================================================================== Word Problems and Patterns */
  G('g3.mult-div-word-problems', function (R, ctx) {
    var type = BL(ctx, R.pick(['prod', 'share', 'array']), R.pick(['prod', 'share', 'count', 'arrayRows', 'measure']), R.pick(['op', 'op', 'count', 'arrayRows', 'measure', 'share'])), g = R.int(3, 9), e = R.int(3, 9), t = g * e, nm = R.pick(NAMES);
    if (type === 'op') {
      var st = R.pick([[nm + ' has ' + t + ' beads. ' + nm + ' puts ' + e + ' beads on each bracelet. How many bracelets can ' + nm + ' make?', t + DV + e, g], [nm + ' buys ' + g + ' packs of juice with ' + e + ' boxes in each pack. How many juice boxes is that?', g + X + e, t], [t + ' students line up in ' + g + ' equal lines. How many students are in each line?', t + DV + g, e]]);
      var wr = st[1].indexOf('div') >= 0 ? [t + X + (st[2] === g ? e : g), t + ' - ' + (st[2] === g ? e : g), t + ' + ' + (st[2] === g ? e : g)] : [g + ' + ' + e, e + ' + ' + e, g + ' + ' + g];
      return {
        q: st[0] + ' Which number sentence solves the problem?', a: aMC(m(st[1]), wr.map(m)),
        steps: [st[1].indexOf('div') >= 0 ? 'The total is known, and so is ' + (st[2] === g ? 'the size of each group' : 'the number of groups') + '. Find the missing part with division.' : 'The number of groups and the size of each group are known. Find the total with multiplication.', 'So the number sentence is $' + st[1] + ' = ' + st[2] + '$.'],
        hint: 'Picture the story. Is the total known or unknown?', chk: { k: 'mc' }
      };
    }
    var w;
    if (type === 'prod') w = R.pick([[nm + ' has ' + g + ' bags of oranges. Each bag has ' + e + ' oranges. How many oranges does ' + nm + ' have?', 'oranges', t, 'Equal groups with the total unknown: multiply. $' + g + X + e + ' = ' + t + '$.'], ['A van carries ' + e + ' people. How many people can ' + g + ' vans carry?', 'people', t, 'Equal groups with the total unknown: multiply. $' + g + X + e + ' = ' + t + '$.']]);
    else if (type === 'share') w = R.pick([[t + ' crayons are shared equally among ' + g + ' tables. How many crayons does each table get?', 'crayons', e, 'The total and the number of groups are known: divide. $' + t + DV + g + ' = ' + e + '$, because $' + g + X + e + ' = ' + t + '$.'], [nm + ' has ' + t + ' cents and buys ' + g + ' erasers that all cost the same. The money is used up. How many cents is each eraser?', 'cents', e, 'The total and the number of erasers are known: divide. $' + t + DV + g + ' = ' + e + '$, because $' + g + X + e + ' = ' + t + '$.']]);
    else if (type === 'count') w = R.pick([['A baker has ' + t + ' muffins. Each box holds ' + e + ' muffins. How many boxes does the baker fill?', 'boxes', g, 'The total and the size of each group are known: divide. $' + t + DV + e + ' = ' + g + '$, because $' + g + X + e + ' = ' + t + '$.'], [t + ' players are split into teams of ' + e + '. How many teams are there?', 'teams', g, 'The total and the size of each team are known: divide. $' + t + DV + e + ' = ' + g + '$, because $' + g + X + e + ' = ' + t + '$.']]);
    else if (type === 'array') w = R.pick([['A window has ' + g + ' rows of panes with ' + e + ' panes in each row. How many panes are there?', 'panes', t, 'An array: rows times the number in each row. $' + g + X + e + ' = ' + t + '$.'], ['A parking lot has ' + g + ' rows with ' + e + ' cars in each row. How many cars are there?', 'cars', t, 'An array: rows times the number in each row. $' + g + X + e + ' = ' + t + '$.']]);
    else if (type === 'arrayRows') w = [t + ' chairs are set up in rows of ' + e + '. How many rows are there?', 'rows', g, 'An array with the total and the row size known: divide. $' + t + DV + e + ' = ' + g + '$, because $' + g + X + e + ' = ' + t + '$.'];
    else w = R.pick([['A ribbon is ' + t + ' inches long. It is cut into ' + g + ' pieces of equal length. How long is each piece?', 'inches', e, 'Cutting into equal pieces is sharing the length: $' + t + DV + g + ' = ' + e + '$, because $' + g + X + e + ' = ' + t + '$.'], ['A path is made of ' + g + ' stones. Each stone is ' + e + ' feet long, end to end. How long is the path?', 'feet', t, g + ' equal lengths of ' + e + ': $' + g + X + e + ' = ' + t + '$.']]);
    return { q: w[0], a: aInt(w[2]), unit: w[1], steps: ['Picture the story: what is known, and what is missing?', w[3], 'The answer is ' + w[2] + ' ' + w[1] + '.'], hint: 'Is the total known? If it is, divide. If it is missing, multiply.', chk: { k: 'val', v: w[2] } };
  });

  var LET = ['n', 'p', 'b', 'k', 't', 'm', 'c', 'r'];
  G('g3.letter-for-unknown', function (R, ctx) {
    var kind = BL(ctx, R.pick(['solve', 'solve', 'match']), R.pick(['match', 'solve', 'story']), R.pick(['story', 'match', 'solve'])), L = R.pick(LET), a = R.int(2, 9), b = R.int(2, 9), p = a * b, nm = R.pick(NAMES);
    if (kind === 'solve') {
      var f = BL(ctx, R.pick(['LX', 'XL']), R.pick(['LX', 'pdL', 'Lda']), R.pick(['pdL', 'Lda', 'eq'])), q, ans, st;
      if (f === 'LX') { q = L + X + a + ' = ' + p; ans = b; st = ['What number times ' + a + ' makes ' + p + '?', '$' + b + X + a + ' = ' + p + '$, so $' + L + ' = ' + b + '$.']; }
      else if (f === 'XL') { q = a + X + L + ' = ' + p; ans = b; st = [a + ' times what number makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$, so $' + L + ' = ' + b + '$.']; }
      else if (f === 'pdL') { q = p + DV + L + ' = ' + a; ans = b; st = [p + ' divided by what gives ' + a + '? Think: ' + a + ' times what makes ' + p + '?', '$' + a + X + b + ' = ' + p + '$, so $' + L + ' = ' + b + '$.']; }
      else if (f === 'Lda') { q = L + DV + a + ' = ' + b; ans = p; st = ['$' + L + '$ is the number being divided. Splitting it by ' + a + ' gives ' + b + '.', 'So $' + L + '$ is ' + a + ' groups of ' + b + ': $' + L + ' = ' + a + X + b + ' = ' + p + '$.']; }
      else { q = p + ' = ' + a + X + L; ans = b; st = ['The equals sign means the two sides are the same amount.', a + ' times what makes ' + p + '? $' + a + X + b + ' = ' + p + '$, so $' + L + ' = ' + b + '$.']; }
      st.push('Check: put ' + ans + ' in place of $' + L + '$, and the equation is true.');
      return { q: 'Find the value of $' + L + '$: $' + q + '$', a: aInt(ans), steps: st, hint: 'The letter is just a number you don’t know yet. What number makes the equation true?', chk: { k: 'letter', f: f, a: a, b: b } };
    }
    var sts = [
      { s: nm + ' has some packs of cards. Each pack has ' + a + ' cards. ' + nm + ' has ' + p + ' cards in all. Let $' + L + '$ be the number of packs.', eq: L + X + a + ' = ' + p, ans: b, wr: [L + ' = ' + p + X + a, L + ' + ' + a + ' = ' + p, L + DV + a + ' = ' + p], why: 'Packs times cards in each pack makes the total: $' + L + X + a + ' = ' + p + '$.' },
      { s: p + ' chairs are set up in ' + a + ' equal rows. Let $' + L + '$ be the number of chairs in each row.', eq: a + X + L + ' = ' + p, ans: b, wr: [L + ' = ' + p + X + a, a + ' + ' + L + ' = ' + p, L + ' - ' + a + ' = ' + p], why: 'Rows times chairs in each row makes the total: $' + a + X + L + ' = ' + p + '$.' },
      { s: 'Some stickers are shared equally by ' + a + ' friends. Each friend gets ' + b + ' stickers. Let $' + L + '$ be the number of stickers.', eq: L + DV + a + ' = ' + b, ans: p, wr: [L + X + b + ' = ' + a, a + DV + L + ' = ' + b, L + ' + ' + a + ' = ' + b], why: 'The stickers, shared by ' + a + ', give ' + b + ' each: $' + L + DV + a + ' = ' + b + '$.' }
    ], S = R.pick(sts);
    if (kind === 'match') return {
      q: S.s + ' Which equation matches the story?', a: aMC(m(S.eq), S.wr.map(m)),
      steps: [S.why, 'The other equations put the numbers together in ways the story does not describe.'], hint: 'Say the story in words first, then write it with the letter.', chk: { k: 'mc' }
    };
    return {
      q: S.s + ' Write an equation and find $' + L + '$.', a: aInt(S.ans),
      steps: [S.why, 'Solve it: $' + L + ' = ' + S.ans + '$.', 'Check: put ' + S.ans + ' in place of $' + L + '$ and the equation is true.'], hint: 'Write the story as an equation with the letter in the place of the number you don’t know.', chk: { k: 'val', v: S.ans }
    };
  });

  G('g3.two-step-word-problems', function (R, ctx) {
    var type = BL(ctx, R.pick(['buyGive', 'haveBuy']), R.pick(['removeShare', 'twoGroups', 'money', 'buyGive']), R.pick(['removeShare', 'twoGroups', 'money', 'compare'])), nm = R.pick(NAMES), g = R.int(3, BL(ctx, 6, 9, 9)), e = R.int(3, BL(ctx, 6, 9, 9)), s1, ans, q, steps, unit;
    var IT = R.pick([['stickers', 'packs', 'pack'], ['marbles', 'bags', 'bag'], ['pencils', 'boxes', 'box'], ['beads', 'jars', 'jar'], ['cards', 'packs', 'pack']]);
    if (type === 'buyGive') {
      s1 = g * e; var k = R.int(2, s1 - 5); ans = s1 - k; unit = IT[0];
      q = nm + ' buys ' + g + ' ' + IT[1] + ' of ' + IT[0] + ' with ' + e + ' ' + IT[0] + ' in each ' + IT[2] + '. Then ' + nm + ' gives ' + k + ' ' + IT[0] + ' to a friend. How many ' + IT[0] + ' does ' + nm + ' have now?';
      steps = ['Step 1: ' + IT[0] + ' bought: $' + g + X + e + ' = ' + s1 + '$.', 'Step 2: give some away: $' + s1 + ' - ' + k + ' = ' + ans + '$.', 'Check: ' + ans + ' is less than ' + s1 + ', which makes sense after giving some away.'];
    } else if (type === 'haveBuy') {
      s1 = g * e; var h = R.int(5, 40); ans = h + s1; unit = IT[0];
      q = nm + ' has ' + h + ' ' + IT[0] + '. Then ' + nm + ' buys ' + g + ' ' + IT[1] + ' with ' + e + ' ' + IT[0] + ' in each ' + IT[2] + '. How many ' + IT[0] + ' does ' + nm + ' have now?';
      steps = ['Step 1: ' + IT[0] + ' in the ' + IT[1] + ': $' + g + X + e + ' = ' + s1 + '$.', 'Step 2: add the ' + IT[0] + ' ' + nm + ' already had: $' + h + ' + ' + s1 + ' = ' + ans + '$.', 'Check: the answer should be more than both ' + h + ' and ' + s1 + '. It is.'];
    } else if (type === 'removeShare') {
      var rest = g * e, k2 = R.int(2, 12), t = rest + k2; ans = e; s1 = rest; unit = 'cookies';
      q = 'A plate has ' + t + ' cookies. ' + nm + ' eats ' + k2 + ' of them. The rest are shared equally among ' + g + ' friends. How many cookies does each friend get?';
      steps = ['Step 1: cookies left: $' + t + ' - ' + k2 + ' = ' + rest + '$.', 'Step 2: share them among ' + g + ': $' + rest + DV + g + ' = ' + e + '$, because $' + g + X + e + ' = ' + rest + '$.', 'Check: $' + g + X + e + ' + ' + k2 + ' = ' + t + '$.'];
    } else if (type === 'twoGroups') {
      var b1 = R.int(2, 6), b2 = R.int(2, 6), x1 = R.pick([6, 8, 10]), x2 = R.pick([4, 5, 3]); s1 = b1 * x1; ans = s1 + b2 * x2; unit = 'muffins';
      q = 'A bakery sells ' + b1 + ' big boxes with ' + x1 + ' muffins each and ' + b2 + ' small boxes with ' + x2 + ' muffins each. How many muffins does it sell in all?';
      steps = ['Step 1: big boxes: $' + b1 + X + x1 + ' = ' + s1 + '$.', 'Step 2: small boxes: $' + b2 + X + x2 + ' = ' + b2 * x2 + '$.', 'Step 3: add: $' + s1 + ' + ' + b2 * x2 + ' = ' + ans + '$.'];
    } else if (type === 'money') {
      var price = R.int(2, 9), cnt = R.int(2, 5), pay = price * cnt < 20 ? 20 : 50; s1 = price * cnt; ans = pay - s1; unit = 'dollars';
      q = nm + ' buys ' + cnt + ' books that cost \\$' + price + ' each and pays with a \\$' + pay + ' bill. How much change should ' + nm + ' get?';
      steps = ['Step 1: cost of the books: $' + cnt + X + price + ' = ' + s1 + '$, so \\$' + s1 + '.', 'Step 2: change: $' + pay + ' - ' + s1 + ' = ' + ans + '$, so \\$' + ans + '.', 'Check: $' + s1 + ' + ' + ans + ' = ' + pay + '$.'];
    } else {
      s1 = g * e; var other = R.int(5, s1 - 3); ans = s1 - other; unit = 'cards'; var nm2 = R.pick(NAMES.filter(function (x) { return x !== nm; }));
      q = nm + ' has ' + g + ' boxes with ' + e + ' cards in each box. ' + nm2 + ' has ' + other + ' cards. How many more cards does ' + nm + ' have than ' + nm2 + '?';
      steps = ['Step 1: ' + nm + '’s cards: $' + g + X + e + ' = ' + s1 + '$.', 'Step 2: compare by subtracting: $' + s1 + ' - ' + other + ' = ' + ans + '$.', 'Check: $' + other + ' + ' + ans + ' = ' + s1 + '$.'];
    }
    steps.push('The answer is ' + ans + (type === 'money' ? ' dollars' : ' ' + unit) + '. The first result, ' + s1 + ', was only a step along the way.');
    return { q: q, a: aInt(ans), unit: type === 'money' ? 'dollars' : unit, steps: steps, hint: 'Do one step at a time. What do you need to know first?', chk: { k: 'two', type: type, q: q, ans: ans } };
  });

  G('g3.arithmetic-patterns', function (R, ctx) {
    var kind = BL(ctx, R.pick(['next', 'mid', 'rule', 'tf']), R.pick(['mid', 'table', 'tf', 'eo', 'rule', 'next', 'mid', 'rule']), R.pick(['table', 'eo', 'mid', 'tf', 'rule', 'next', 'mid'])), f = R.int(2, 9);
    if (kind === 'rule') {
      var st0 = R.int(1, 6), sq0 = []; for (var i0 = 0; i0 < 5; i0++) sq0.push(f * (st0 + i0));
      return { q: R.pick(NAMES) + ' wrote this pattern: $' + sq0.join(',\\ ') + '$. How much does it grow each time?', a: aInt(f),
        steps: ['Subtract one number from the next: $' + sq0[1] + ' - ' + sq0[0] + ' = ' + f + '$.', 'Check another pair: $' + sq0[3] + ' - ' + sq0[2] + ' = ' + f + '$.', 'It grows by ' + f + ' each time. These are the ' + f + 's facts, from $' + f + X + st0 + '$ to $' + f + X + (st0 + 4) + '$.'], hint: 'How far is it from one number to the next?', chk: { k: 'val', v: f } };
    }
    if (kind === 'next' || kind === 'mid') {
      var st = R.int(1, 6), seq = []; for (var i = 0; i < 5; i++) seq.push(f * (st + i));
      var hole = kind === 'next' ? 4 : R.int(1, 3), ans = seq[hole], shown = seq.map(function (v, i) { return i === hole ? BOX : v; });
      return {
        q: 'Find the missing number in the pattern: $' + shown.join(',\\ ') + '$', a: aInt(ans),
        steps: ['Each number is ' + f + ' more than the one before: $' + seq[0] + ' + ' + f + ' = ' + seq[1] + '$.', 'These are the ' + f + 's facts: ' + seq.map(function (v, i) { return '$' + f + X + (st + i) + ' = ' + v + '$'; }).join(', ') + '.', 'So the missing number is ' + ans + '.'],
        hint: 'How much does the pattern grow each time?', chk: { k: 'seq', f: f, st: st, hole: hole }
      };
    }
    if (kind === 'table') {
      var pr = R.pick([[2, 4], [3, 6], [5, 10], [4, 8]]), col = R.int(3, 8), cols = [1, 2, 3, 4, 5, 6, 7, 8];
      var row1 = pr[0] + ' & ' + cols.map(function (k) { return pr[0] * k; }).join(' & '), row2 = pr[1] + ' & ' + cols.map(function (k) { return k === col ? BOX : pr[1] * k; }).join(' & ');
      return {
        q: 'Here are two rows of the multiplication table. $$\\begin{array}{c|cccccccc} \\times & ' + cols.join(' & ') + ' \\\\ \\hline ' + row1 + ' \\\\ ' + row2 + ' \\end{array}$$ Each number in the ' + pr[1] + 's row is double the number above it. What goes in the box?',
        a: aInt(pr[1] * col),
        steps: [pr[1] + ' groups is double ' + pr[0] + ' groups, so each number in the ' + pr[1] + 's row is double the ' + pr[0] + 's row.', 'Above the box is $' + pr[0] + X + col + ' = ' + pr[0] * col + '$.', 'Double it: $' + pr[0] * col + ' + ' + pr[0] * col + ' = ' + pr[1] * col + '$. Check: $' + pr[1] + X + col + ' = ' + pr[1] * col + '$.'],
        hint: 'Find the number above the box and double it.', chk: { k: 'mul', a: pr[1], b: col }
      };
    }
    if (kind === 'eo') {
      var c4 = R.pick([['the product of two odd numbers', 'always odd', 'Odd groups of an odd number: pairs leave one left over in each group, and an odd number of leftovers is odd. For example, $3' + X + '5 = 15$.'],
        ['the product of an even number and any whole number', 'always even', 'An even number of groups can be split into two equal halves, so the total can too. For example, $4' + X + '7 = 28$.'],
        ['the sum of two odd numbers', 'always even', 'Each odd number has one left over after making pairs. The two leftovers make one more pair. For example, $5 + 7 = 12$.'],
        ['the sum of an odd number and an even number', 'always odd', 'The even number makes pairs, and the odd number has one left over. For example, $6 + 9 = 15$.']]);
      return { q: 'Is ' + c4[0] + ' even or odd?', a: { t: 'mc', choices: ['always even', 'always odd', 'sometimes even and sometimes odd'], v: c4[1] === 'always even' ? 0 : 1, keep: true }, steps: [c4[2], 'So it is ' + c4[1] + '.'], hint: 'Try a few examples, then think about pairs.', chk: { k: 'mc' } };
    }
    var s5 = R.pick([['Every number in the 5s row of the multiplication table ends in 0 or 5.', true, 'Counting by 5s goes 5, 10, 15, 20 …, so the ones digit takes turns between 5 and 0.'],
      ['Every number in the 4s row is even.', true, '4 groups can always be split into two equal halves of 2 groups each.'],
      ['Every number in the 3s row is odd.', false, '$3' + X + '2 = 6$ is even. The 3s row takes turns: odd, even, odd, even.'],
      ['Every number in the 10s row ends in 0.', true, 'Each group of 10 is one ten, so the products are whole tens: 10, 20, 30 ….'],
      ['Every number in the 7s row is odd.', false, '$7' + X + '2 = 14$ is even. Times an even number, the product is even.'],
      ['Every number in the 6s row is even.', true, '6 groups can be split into two equal halves of 3 groups each.'],
      ['In the 9s row, the digits of each product from $9' + X + '1$ to $9' + X + '10$ add up to 9.', true, 'For example, $9' + X + '4 = 36$ and $3 + 6 = 9$. Each step adds 10 and takes away 1, so the tens digit goes up as the ones digit goes down.']]);
    return { q: 'True or false: ' + s5[0], a: aTF(s5[1]), steps: [s5[2], 'So the statement is ' + (s5[1] ? 'true' : 'false') + '.'], hint: 'Write out a few numbers in that row and look.', chk: { k: 'tfpat', s: s5[0], v: s5[1] } };
  });

  /* ================================================================== Fractions */
  var FN = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'] };
  function fracPic(R, d, n, opt) { // a random equal-parts picture of n/d (one whole)
    opt = opt || {};
    var models = ['bar', 'circle', 'rect'], model = opt.model || R.pick(models), o = { model: model, d: d, n: n };
    if (model === 'rect') {
      var pats = ['cols'];
      if (d === 4) pats = pats.concat(['grid', 'diag']); if (d === 6 || d === 8) pats.push('grid'); if (d === 2) pats.push('tri'); if (d <= 4) pats.push('rows');
      o.pattern = R.pick(pats); if (o.pattern === 'grid') o.gr = d === 4 ? [2, 2] : d === 6 ? [2, 3] : [2, 4]; if (o.pattern === 'diag' || o.pattern === 'tri') o.square = true;
    }
    if (opt.shade) o.shade = opt.shade;
    else if (n > 0 && n < d && !opt.firstParts && R.chance(0.6)) { // the shaded parts need not be next to each other
      var idx = []; for (var k = 0; k < d; k++) idx.push(k);
      o.shade = R.sample(idx, n).sort(function (x, y) { return x - y; });
    }
    var lab = (model === 'bar' ? 'A bar' : model === 'circle' ? 'A circle' : 'A rectangle') + ' cut into ' + d + ' equal parts, with ' + n + ' shaded';
    return vz('g3-frac', o, lab);
  }
  G('g3.equal-parts', function (R, ctx) {
    var kind = BL(ctx, R.pick(['eq', 'eq', 'name']), R.pick(['eq', 'name', 'count', 'story']), R.pick(['eq', 'story', 'name', 'count'])), d = R.pick([2, 3, 4, 6, 8]);
    if (kind === 'eq') {
      var equal = R.coin(), dd = equal ? d : R.pick([2, 3, 4]), model = equal ? null : R.pick(['bar', 'circle']), pic;
      pic = equal ? fracPic(R, dd, 0) : vz('g3-frac', { model: model, d: dd, n: 0, unequal: true }, 'A ' + (model === 'bar' ? 'bar' : 'circle') + ' cut into ' + dd + ' parts that are not the same size');
      return {
        q: R.pick(['Is this shape cut into equal parts?', R.pick(NAMES) + ' cut this shape to share it. Is it cut into equal parts?', R.pick(NAMES) + ' says this shape shows equal parts. Is that true?']), viz: pic, a: aTF(equal),
        steps: equal ? ['Look at the size of each part. All ' + dd + ' parts are the same size.', 'So yes, these are equal parts. Each part is one ' + FN[dd][0] + ' of the whole.'] : ['Look at the size of each part. Some parts are bigger than others.', 'So these are not equal parts, and the parts are not ' + FN[dd][1] + '. A fraction needs parts of the same size.'],
        hint: 'Would every part be the same amount if this were a snack you were sharing?', chk: { k: 'eqparts?', equal: equal }
      };
    }
    if (kind === 'name') return {
      q: R.pick(['The shape is cut into equal parts. What is each part called?', R.pick(NAMES) + ' cut this shape into equal parts. What is each part called?']), viz: fracPic(R, d, 0),
      a: aMC(FN[d][1], [2, 3, 4, 6, 8].filter(function (x) { return x !== d; }).map(function (x) { return FN[x][1]; }).slice(0, 3)),
      steps: ['Count the equal parts: there are ' + d + '.', 'When a whole is cut into ' + d + ' equal parts, each part is one ' + FN[d][0] + ', and the parts are called ' + FN[d][1] + '.'],
      hint: 'Count the equal parts.', chk: { k: 'mc' }
    };
    if (kind === 'count') return {
      q: 'A whole is cut into equal parts called ' + FN[d][1] + '. How many ' + FN[d][1] + ' make the whole?', a: aInt(d),
      steps: ['The name tells the number of equal parts: ' + FN[d][1] + ' means ' + d + ' equal parts.', 'So ' + d + ' ' + FN[d][1] + ' make one whole.'], hint: 'Halves means 2 parts, thirds means 3 parts …', chk: { k: 'val', v: d }
    };
    var nm = R.pick(NAMES), eq2 = R.coin(), k = R.pick([2, 3, 4]);
    return {
      q: nm + ' cuts a sandwich into ' + k + ' pieces. ' + (eq2 ? 'All the pieces are the same size.' : 'One piece is much bigger than the others.') + ' Is each piece one ' + FN[k][0] + ' of the sandwich?', a: aTF(eq2),
      steps: eq2 ? ['The ' + k + ' pieces are the same size, so they are equal parts.', 'Each piece is one ' + FN[k][0] + '.'] : ['The pieces are not the same size, so they are not equal parts.', 'A ' + FN[k][0] + ' must be one of ' + k + ' equal parts, so these pieces are not ' + FN[k][1] + '.'],
      hint: 'Fractions need equal parts.', chk: { k: 'tfeq', v: eq2 }
    };
  });

  G('g3.unit-fractions', function (R, ctx) {
    var kind = BL(ctx, R.pick(['shade', 'shade', 'cmp']), R.pick(['shade', 'cmp', 'count', 'story']), R.pick(['cmp', 'story', 'order', 'shade'])), d = R.pick(BL(ctx, [2, 3, 4, 6, 8], [2, 3, 4, 5, 6, 8], [3, 4, 5, 6, 8, 10]));
    if (kind === 'shade') return {
      q: R.pick(['What fraction of the shape is shaded?', R.pick(NAMES) + ' shaded one part of this shape. What fraction is shaded?', R.pick(NAMES) + ' colored part of a ' + R.pick(['cracker', 'card', 'cake', 'garden plan', 'flag']) + '. What fraction of it is shaded?']), viz: fracPic(R, d, 1), a: aFrac(1, d),
      steps: ['The whole is cut into ' + d + ' equal parts. That is the bottom number (the denominator): ' + d + '.', '1 part is shaded. That is the top number (the numerator): 1.', 'So $' + F(1, d) + '$ is shaded.'],
      hint: 'How many equal parts in all? How many are shaded?', chk: { k: 'frac', n: 1, d: d }
    };
    if (kind === 'count') return {
      q: 'How many pieces of size $' + F(1, d) + '$ make one whole?', a: aInt(d),
      steps: ['$' + F(1, d) + '$ is one of ' + d + ' equal parts of a whole.', 'So it takes ' + d + ' of them to make the whole.'], hint: 'What does the bottom number tell you?', chk: { k: 'val', v: d }
    };
    var a = R.pick([2, 3, 4, 6, 8]), b = R.pick([2, 3, 4, 6, 8].filter(function (x) { return x !== a; })), big = a < b ? a : b, small = a < b ? b : a, wantBig = R.coin();
    var why = ['Both are one piece of the same-size whole.', 'Cutting into ' + small + ' parts makes smaller pieces than cutting into ' + big + ' parts: more parts means smaller parts.', 'So $' + F(1, big) + '$ is greater than $' + F(1, small) + '$, even though ' + small + ' is bigger than ' + big + '.'];
    if (kind === 'cmp') {
      var p = { q: 'Which is ' + (wantBig ? 'greater' : 'less') + ': $' + F(1, a) + '$ or $' + F(1, b) + '$?', a: aMC(m(F(1, wantBig ? big : small)), [m(F(1, wantBig ? small : big)), 'They are equal.']), steps: why, hint: 'Picture the whole cut into ' + a + ' parts and into ' + b + ' parts. Which pieces are bigger?', chk: { k: 'mc' } };
      if (ctx.level === 1) p.viz = vz('g3-frac', { bars: [{ n: 1, d: a, label: '1/' + a }, { n: 1, d: b, label: '1/' + b }] }, 'Two bars of the same length: one cut into ' + a + ' parts, one into ' + b + ' parts, with one part of each shaded');
      return p;
    }
    if (kind === 'order') {
      var three = R.sample([2, 3, 4, 6, 8, 10], 3), mx = Math.min.apply(null, three), mn = Math.max.apply(null, three), wantS = R.coin(), tgt = wantS ? mn : mx;
      return { q: 'Which fraction is the ' + (wantS ? 'smallest' : 'largest') + '? $' + three.map(function (x) { return F(1, x); }).join(',\\ ') + '$', a: aMC(m(F(1, tgt)), three.filter(function (x) { return x !== tgt; }).map(function (x) { return m(F(1, x)); })), steps: ['All three are one piece of the same whole.', 'The more parts the whole is cut into, the smaller each part.', 'So the ' + (wantS ? 'smallest is $' + F(1, mn) + '$ (the most parts)' : 'largest is $' + F(1, mx) + '$ (the fewest parts)') + '.'], hint: 'More parts means smaller parts.', chk: { k: 'mc' } };
    }
    var n1 = R.pick(NAMES), n2 = R.pick(NAMES.filter(function (x) { return x !== n1; }));
    return {
      q: 'Two pizzas are the same size. ' + n1 + ' eats $' + F(1, a) + '$ of one pizza. ' + n2 + ' eats $' + F(1, b) + '$ of the other pizza. Who eats more?', a: aMC(a < b ? n1 : n2, [a < b ? n2 : n1, 'They eat the same amount.']),
      steps: why.concat([(a < b ? n1 : n2) + ' eats more.']), hint: 'Which pizza was cut into fewer, bigger slices?', chk: { k: 'mc' }
    };
  });

  G('g3.build-fractions', function (R, ctx) {
    var kind = BL(ctx, R.pick(['shade', 'shade', 'count', 'not']), R.pick(['shade', 'make', 'count', 'not']), R.pick(['not', 'more', 'make', 'shade'])), d = R.pick([3, 4, 5, 6, 8]), n = R.int(2, d - 1);
    if (kind === 'shade') return {
      q: R.pick(['What fraction of the shape is shaded?', R.pick(NAMES) + ' shaded some equal parts. What fraction of the shape is shaded?']), viz: fracPic(R, d, n), a: aFrac(n, d),
      steps: ['The whole is cut into ' + d + ' equal parts, so each part is $' + F(1, d) + '$.', n + ' parts are shaded.', n + ' pieces of size $' + F(1, d) + '$ make $' + F(n, d) + '$.'],
      hint: 'Count all the equal parts, then count the shaded ones.', chk: { k: 'frac', n: n, d: d }
    };
    if (kind === 'count') return {
      q: R.pick(['$' + F(n, d) + '$ is how many pieces of size $' + F(1, d) + '$?', R.pick(NAMES) + ' has $' + F(n, d) + '$ of a ' + R.pick(['pizza', 'pan of cornbread', 'ribbon', 'garden', 'sheet of paper']) + '. How many pieces of size $' + F(1, d) + '$ is that?']), a: aInt(n),
      steps: ['The bottom number, ' + d + ', tells the size of each piece: $' + F(1, d) + '$.', 'The top number, ' + n + ', counts the pieces.', 'So $' + F(n, d) + '$ is ' + n + ' pieces of size $' + F(1, d) + '$.'], hint: 'The top number counts the pieces.', chk: { k: 'val', v: n }
    };
    if (kind === 'make') return {
      q: (function () { var rb = R.pick(['ribbon', 'rope', 'pizza', 'pan of brownies', 'chocolate bar', 'strip of paper', 'garden']); return R.pick(NAMES) + ' has ' + n + ' pieces of a ' + rb + '. Each piece is $' + F(1, d) + '$ of the ' + rb + '. What fraction of the ' + rb + ' is that?'; })(), a: aFrac(n, d),
      steps: ['Each piece is $' + F(1, d) + '$: one of ' + d + ' equal parts.', n + ' of those pieces is $' + F(n, d) + '$.'], hint: 'Count the pieces of size $' + F(1, d) + '$.', chk: { k: 'frac', n: n, d: d }
    };
    if (kind === 'not') return {
      q: R.pick(['What fraction of the shape is NOT shaded?', R.pick(NAMES) + ' shaded some equal parts. What fraction of the shape is NOT shaded?']), viz: fracPic(R, d, n), a: aFrac(d - n, d),
      steps: ['There are ' + d + ' equal parts in all.', n + ' are shaded, so $' + d + ' - ' + n + ' = ' + (d - n) + '$ are not shaded.', 'So $' + F(d - n, d) + '$ of the shape is not shaded.'], hint: 'Count the parts that are not shaded.', chk: { k: 'frac', n: d - n, d: d }
    };
    return {
      q: R.pick(NAMES) + ' has $' + F(n, d) + '$ of a whole. How many more pieces of size $' + F(1, d) + '$ do you need to make one whole?', a: aInt(d - n),
      steps: ['One whole is $' + F(d, d) + '$: all ' + d + ' pieces.', 'You have ' + n + ' pieces, so you need $' + d + ' - ' + n + ' = ' + (d - n) + '$ more.'], hint: 'How many pieces make the whole?', chk: { k: 'val', v: d - n }
    };
  });

  G('g3.unit-fractions-number-line', function (R, ctx) {
    var kind = BL(ctx, R.pick(['point', 'point', 'parts']), R.pick(['point', 'parts', 'len', 'point']), R.pick(['point2', 'rev', 'len', 'parts', 'point'])), d = BL(ctx, R.pick([2, 3, 4, 6]), R.pick([3, 4, 5, 6, 8, 10]), R.pick([4, 5, 6, 8, 10]));
    var LT = R.pick(['A', 'B', 'C', 'D', 'K', 'M', 'P', 'Q']);
    if (kind === 'point' || kind === 'point2') {
 var mx = kind === 'point2' ? 2 : 1, pv = vz('g3-nline', { max: mx, d: d, points: [{ v: '1/' + d, label: LT }], hops: ctx.level === 1 && R.coin(), tickNums: R.chance(0.3) }, 'A number line from 0 to ' + mx + ', each whole cut into ' + d + ' equal parts, with point ' + LT + ' at the first mark after 0');
      if (R.chance(0.5)) { var tr = R.pick([['A trail from 0 to 1 mile', 'bench'], ['A ribbon from 0 to 1 meter', 'knot'], ['A path from 0 to 1 kilometer', 'water stop'], ['A swim lane from 0 to 1 length of the pool', 'float'], ['A garden row from 0 to 1 meter', 'tomato plant'], ['A race track from 0 to 1 lap', 'flag'], ['A board from 0 to 1 foot', 'nail'], ['A bike route from 0 to 1 mile', 'rest stop']]); return {
        q: R.pick(NAMES) + ' looks at a map. ' + tr[0] + ' is shown on the number line. It is split into ' + d + ' equal parts. A ' + tr[1] + ' is at point ' + LT + '. What fraction tells where the ' + tr[1] + ' is?', viz: vz('g3-nline', { max: 1, d: d, points: [{ v: '1/' + d, label: LT }] }, 'A number line from 0 to 1 cut into ' + d + ' equal parts, with point ' + LT + ' at the first mark after 0'), a: aFrac(1, d),
        steps: ['The whole, from 0 to 1, is cut into ' + d + ' equal parts, so each part is $' + F(1, d) + '$.', 'Point ' + LT + ' is one part from 0.', 'So the ' + tr[1] + ' is at $' + F(1, d) + '$.'], hint: 'Count the spaces between 0 and 1.', chk: { k: 'frac', n: 1, d: d } }; }
      return {
        q: 'What fraction is at point ' + LT + '?', viz: pv, a: aFrac(1, d),
        steps: ['Look at the space from 0 to 1. Count the spaces (not the tick marks): there are ' + d + ' equal parts.', 'So each part is $' + F(1, d) + '$ long.', 'Point ' + LT + ' is one part from 0, so it is at $' + F(1, d) + '$.'],
        hint: 'Count the spaces between 0 and 1, not the marks.', chk: { k: 'frac', n: 1, d: d }
      };
    }
    if (kind === 'parts') return {
      q: R.pick(['How many equal parts is the space from 0 to 1 cut into?', 'The space from 0 to 1 is cut into equal parts. How many parts are there?', 'Count the equal parts between 0 and 1. How many are there?']), viz: vz('g3-nline', { max: 1, d: d }, 'A number line from 0 to 1 with tick marks'), a: aInt(d),
      steps: ['Count the spaces between the marks, from 0 to 1.', 'There are ' + (d + 1) + ' marks (counting the ones at 0 and 1), but only ' + d + ' spaces.', 'So the space is cut into ' + d + ' equal parts, and each part is $' + F(1, d) + '$.'],
      hint: 'Count spaces, not marks.', chk: { k: 'val', v: d }
    };
    if (kind === 'len' && R.chance(0.6)) { var lt = R.pick([['A ribbon 1 meter long', 'meter', 'pieces', 'piece'], ['A path 1 mile long', 'mile', 'stretches', 'stretch'], ['A board 1 yard long', 'yard', 'pieces', 'piece'], ['A swim lane 1 lap long', 'lap', 'sections', 'section'], ['A rope 1 meter long', 'meter', 'pieces', 'piece'], ['A trail 1 kilometer long', 'kilometer', 'parts', 'part']]);
      return { q: lt[0] + ' is shown as the space from 0 to 1 on a number line. It is cut into ' + d + ' equal ' + lt[2] + '. How long is each ' + lt[3] + ', in ' + lt[1] + 's?', a: aFrac(1, d),
        steps: ['The whole, from 0 to 1, is 1 ' + lt[1] + '.', 'Cutting it into ' + d + ' equal ' + lt[2] + ' makes each one $' + F(1, d) + '$ of a ' + lt[1] + '.'], hint: 'Each ' + lt[3] + ' is one of ' + d + ' equal parts of the whole.', chk: { k: 'frac', n: 1, d: d } }; }
    if (kind === 'len') return {
      q: 'The space from 0 to 1 on a number line is cut into ' + d + ' equal parts. How long is each part?', a: aFrac(1, d),
      steps: ['The whole, from 0 to 1, has length 1.', 'Cutting it into ' + d + ' equal parts makes each part $' + F(1, d) + '$ long.'], hint: 'Each part is one of ' + d + ' equal parts of the whole.', chk: { k: 'frac', n: 1, d: d }
    };
    return {
      q: 'On a number line, point ' + LT + ' is at $' + F(1, d) + '$, the first mark after 0. How many equal parts is the space from 0 to 1 cut into?', a: aInt(d),
      steps: ['$' + F(1, d) + '$ means one of ' + d + ' equal parts of the whole.', 'So the space from 0 to 1 is cut into ' + d + ' equal parts.'], hint: 'What does the bottom number of $' + F(1, d) + '$ tell you?', chk: { k: 'val', v: d }
    };
  });

  function nlAns(n, d) { return n < d ? aFrac(n, d) : { t: 'num', v: n + '/' + d }; }
  G('g3.fractions-number-line', function (R, ctx) {
    var kind = BL(ctx, R.pick(['point', 'point', 'jumps']), R.pick(['point', 'point2', 'jumps']), R.pick(['point2', 'past', 'point2', 'jumps'])), d = R.pick(BL(ctx, [3, 4, 5, 6, 8], [2, 3, 4, 6, 8], [2, 3, 4, 5, 6])), n, LT2 = R.pick(['A', 'B', 'C', 'D', 'K', 'M', 'P', 'Q']);
    if (kind === 'point' || kind === 'point2') {
      var mx = kind === 'point2' ? R.pick([2, 2, 3]) : 1; if (mx === 1 && d < 3) d = R.pick([3, 4, 6]); n = R.intNot(2, mx * d - 1, mx === 1 ? [] : [d, 2 * d]);
      if (mx === 1 && n >= d) n = d - 1;
      return {
        q: R.pick(['What fraction is at point ' + LT2 + '?', R.pick(NAMES) + ' marked point ' + LT2 + ' on the number line. What fraction is at point ' + LT2 + '?', R.pick(NAMES) + ' walks along a path from 0 to ' + mx + ' ' + (mx === 1 ? 'mile' : 'miles') + ' and stops at point ' + LT2 + '. What fraction is at point ' + LT2 + '?']), viz: vz('g3-nline', { max: mx, d: d, points: [{ v: n + '/' + d, label: LT2 }], tickNums: R.chance(0.25) }, 'A number line from 0 to ' + mx + ', each whole cut into ' + d + ' equal parts, with point ' + LT2 + ' on one of the marks'),
        a: nlAns(n, d),
        steps: ['From 0 to 1 there are ' + d + ' equal spaces, so each space is $' + F(1, d) + '$.', 'Start at 0 (not at the first mark) and count the spaces to ' + LT2 + ': ' + n + ' spaces.', n + ' lengths of $' + F(1, d) + '$ is $' + F(n, d) + '$. Point ' + LT2 + ' is at $' + F(n, d) + '$.'],
        hint: 'Start counting at 0. Each space is one ' + FN[d][0] + '.', chk: { k: 'frac', n: n, d: d }
      };
    }
    if (kind === 'jumps') {
      n = R.int(2, d + (ctx.level > 1 ? d - 1 : -1)); if (n === d) n = d - 1;
      var p = { q: R.pick(['', R.pick(NAMES) + ' hops along a number line. ']) + 'Starting at 0, how many jumps of $' + F(1, d) + '$ does it take to reach $' + F(n, d) + '$?', a: aInt(n), steps: ['Each jump is one ' + FN[d][0] + '.', '$' + F(n, d) + '$ means ' + n + ' ' + FN[d][1] + '.', 'So it takes ' + n + ' jumps.'], hint: 'The top number counts the jumps of $' + F(1, d) + '$.', chk: { k: 'val', v: n } };
      if (ctx.level === 1) p.viz = vz('g3-nline', { max: n > d ? 2 : 1, d: d, points: [{ v: n + '/' + d, label: 'B' }] }, 'A number line with point B');
      return p;
    }
    var k = R.int(1, d - 1), w = R.pick([1, 2]); n = w * d + k;
    return {
      q: 'Point B is ' + pl(k, 'jump') + ' of $' + F(1, d) + '$ past ' + w + ' on the number line. What fraction is at B? Use ' + FN[d][1] + '.', a: { t: 'num', v: n + '/' + d },
      steps: [w + ' whole' + (w > 1 ? 's are' : ' is') + ' ' + w * d + ' ' + FN[d][1] + ': $' + w + ' = ' + F(w * d, d) + '$.', 'Then ' + k + ' more ' + (k === 1 ? FN[d][0] : FN[d][1]) + ' makes ' + n + ' ' + FN[d][1] + '.', 'So B is at $' + F(n, d) + '$.'],
      hint: 'How many ' + FN[d][1] + ' are in ' + w + '?', chk: { k: 'frac', n: n, d: d }
    };
  });

  G('g3.whole-numbers-as-fractions', function (R, ctx) {
    var kind = BL(ctx, R.pick(['eval', 'eval', 'pic', 'line']), R.pick(['eval', 'make', 'den1', 'pic', 'line']), R.pick(['make', 'tf', 'den1', 'eval', 'line'])), d = R.pick([2, 3, 4, 5, 6, 8]), k = BL(ctx, R.int(1, 2), R.int(1, 3), R.int(2, 4));
    if (kind === 'line') { var w3 = R.int(1, BL(ctx, 2, 3, 3)), L3 = R.pick(['A', 'B', 'P', 'Q']), mx3 = Math.max(2, w3); return {
      q: 'Point ' + L3 + ' is at ' + w3 + ' on the number line. Each whole is cut into ' + FN[d][1] + '. Fill in the box: $' + w3 + ' = ' + F(BOX, d) + '$', viz: vz('g3-nline', { max: mx3, d: d, points: [{ v: w3, label: L3 }] }, 'A number line from 0 to ' + mx3 + ', each whole cut into ' + d + ' equal parts, with point ' + L3 + ' at ' + w3), a: aInt(w3 * d),
      steps: ['From 0 to 1 there are ' + d + ' equal spaces, each $' + F(1, d) + '$.', 'To get to ' + w3 + ', count all the spaces from 0: ' + (w3 > 1 ? w3 + ' wholes with ' + d + ' spaces each, $' + w3 + X + d + ' = ' + w3 * d + '$' : d) + '.', 'So $' + w3 + ' = ' + F(w3 * d, d) + '$: the same point, two names.'], hint: 'Count the spaces from 0 to ' + w3 + '.', chk: { k: 'val', v: w3 * d } }; }
    if (kind === 'eval') return {
      q: R.pick(['What whole number is $' + F(k * d, d) + '$?', R.pick(NAMES) + ' has $' + F(k * d, d) + '$ of a ' + R.pick(['pizza', 'pie', 'ribbon', 'loaf of bread', 'pan of brownies']) + ' (some of the same size, all cut into ' + FN[d][1] + '). How many whole ones is that?']), a: aInt(k),
      steps: ['$' + F(d, d) + '$ is all ' + d + ' parts of one whole, so $' + F(d, d) + ' = 1$.', k === 1 ? 'So $' + F(d, d) + ' = 1$.' : '$' + F(k * d, d) + '$ is ' + k * d + ' ' + FN[d][1] + '. Every ' + d + ' of them make a whole: $' + k * d + DV + d + ' = ' + k + '$.', 'So $' + F(k * d, d) + ' = ' + k + '$.'],
      hint: 'How many ' + FN[d][1] + ' make one whole?', chk: { k: 'fracval', n: k * d, d: d }
    };
    if (kind === 'pic') return {
      q: 'Each bar is one whole. The shaded parts make $' + F(k * d, d) + '$. What whole number is that?', viz: vz('g3-frac', { model: 'bar', d: d, n: k * d, wholes: k + 1 }, (k + 1) + ' bars, each cut into ' + d + ' equal parts, with ' + k * d + ' parts shaded'), a: aInt(k),
      steps: ['Each bar has ' + d + ' equal parts, so ' + d + ' shaded parts fill one bar.', k * d + ' parts are shaded: that is $' + F(k * d, d) + '$.', 'They fill ' + pl(k, 'whole bar') + ', so $' + F(k * d, d) + ' = ' + k + '$.'],
      hint: 'Count the bars that are shaded all the way.', chk: { k: 'fracval', n: k * d, d: d }
    };
    if (kind === 'den1') { var w = R.int(2, 12); return {
      q: R.pick(['', R.pick(NAMES) + ' writes a whole number as a fraction. ']) + 'Fill in the box: $' + w + ' = ' + F(BOX, 1) + '$', a: aInt(w),
      steps: ['A denominator of 1 means each whole is cut into 1 part, so each part is a whole.', w + ' wholes is ' + w + ' of those parts.', 'So $' + w + ' = ' + F(w, 1) + '$.'], hint: 'If each whole is just 1 part, how many parts make ' + w + '?', chk: { k: 'val', v: w }
    }; }
    if (kind === 'make') { var w2 = R.int(2, 5); return {
      q: R.pick(['', R.pick(NAMES) + ' cuts ' + w2 + ' ' + R.pick(['pies', 'pizzas', 'sandwiches', 'cakes']) + ' into ' + FN[d][1] + '. ']) + 'How many ' + FN[d][1] + ' make ' + w2 + ' wholes? Fill in the box: $' + w2 + ' = ' + F(BOX, d) + '$', a: aInt(w2 * d),
      steps: ['One whole is ' + d + ' ' + FN[d][1] + '.', w2 + ' wholes is $' + w2 + X + d + ' = ' + w2 * d + '$ ' + FN[d][1] + '.', 'So $' + w2 + ' = ' + F(w2 * d, d) + '$.'], hint: 'Each whole has ' + d + ' ' + FN[d][1] + '.', chk: { k: 'val', v: w2 * d }
    }; }
    var st = R.pick([['A fraction can never be greater than 1.', false, 'Fractions like $' + F(d + 1, d) + '$ are greater than 1: they need more than one whole.'], ['$' + F(d, d) + ' = 1$', true, 'All ' + d + ' of the ' + d + ' parts make the whole.'], ['$' + F(3, 1) + ' = 3$', true, 'Each whole is 1 part, so 3 parts are 3 wholes.'], ['$' + F(1, 3) + ' = 3$', false, '$' + F(1, 3) + '$ is one of 3 equal parts, less than 1. It is $' + F(3, 1) + '$ that equals 3.'], ['$' + F(2 * d, d) + ' = 2$', true, 'Every ' + d + ' ' + FN[d][1] + ' make a whole, so ' + 2 * d + ' of them make 2 wholes.'], ['$' + F(8, 4) + ' = 4$', false, 'Every 4 fourths make a whole, so 8 fourths make 2 wholes, not 4.']]);
    return { q: 'True or false: ' + st[0], a: aTF(st[1]), steps: [st[2], 'So the statement is ' + (st[1] ? 'true' : 'false') + '.'], hint: 'Think about how many parts make one whole.', chk: { k: 'tfwhole', s: st[0], v: st[1] } };
  });

  var EQP = [[1, 2, 2, 4], [1, 2, 3, 6], [1, 2, 4, 8], [1, 3, 2, 6], [2, 3, 4, 6], [1, 4, 2, 8], [3, 4, 6, 8], [2, 4, 4, 8]];
  G('g3.equivalent-fractions-models', function (R, ctx) {
    var kind = BL(ctx, R.pick(['fill', 'fill', 'tf', 'story', 'story']), R.pick(['fill', 'which', 'tf', 'back', 'story']), R.pick(['which', 'back', 'tf', 'fill', 'story'])), e = R.pick(EQP), n = e[0], d = e[1], N = e[2], D = e[3];
    if (kind === 'story') {
      var two = R.sample(NAMES, 2), food = R.pick(['pizza', 'pan of cornbread', 'sandwich', 'pie', 'chocolate bar', 'loaf of bread', 'ribbon', 'garden']), rev = ctx.level > 1 && R.coin();
      var a1 = rev ? N : n, b1 = rev ? D : d, a2 = rev ? n : N, b2 = rev ? d : D;
      return { q: two[0] + ' and ' + two[1] + ' each have the same size ' + food + '. ' + two[0] + ' cuts ' + (food === 'garden' ? 'theirs' : 'one') + ' into ' + FN[b1][1] + ' and takes $' + F(a1, b1) + '$ of it. ' + two[1] + ' cuts the other into ' + FN[b2][1] + ' and wants the same amount. How many ' + FN[b2][1] + ' should ' + two[1] + ' take?', a: aInt(a2),
        viz: ctx.level === 1 ? vz('g3-frac', { bars: [{ n: a1, d: b1, label: a1 + '/' + b1 }, { n: 0, d: b2, label: '?/' + b2 }] }, 'Two bars of the same length: the top one shows ' + a1 + '/' + b1 + ', the bottom one is cut into ' + b2 + ' parts') : undefined,
        steps: [b2 > b1 ? 'Each ' + FN[b1][0] + ' is the same amount as ' + b2 / b1 + ' ' + FN[b2][1] + '.' : 'Every ' + b1 / b2 + ' ' + FN[b1][1] + ' make one ' + FN[b2][0] + '.', 'So $' + F(a1, b1) + ' = ' + F(a2, b2) + '$.', two[1] + ' should take ' + a2 + ' ' + (a2 === 1 ? FN[b2][0] : FN[b2][1]) + '.'], hint: 'Picture the two wholes as bars of the same length.', chk: { k: 'eqv', n: a1, d: b1, D: b2 } };
    }
    if (kind === 'fill') {
      var p = {
        q: 'Fill in the box: $' + F(n, d) + ' = ' + F(BOX, D) + '$', a: aInt(N),
        steps: ['Each ' + FN[d][0] + ' is the same length as ' + D / d + ' ' + FN[D][1] + ' (cut each ' + FN[d][0] + ' into ' + D / d + ' pieces).', 'So ' + n + ' ' + (n === 1 ? FN[d][0] : FN[d][1]) + ' is $' + n + X + (D / d) + ' = ' + N + '$ ' + FN[D][1] + '.', '$' + F(n, d) + ' = ' + F(N, D) + '$: the same amount, cut into more, smaller pieces.'],
        hint: 'How many ' + FN[D][1] + ' fit in one ' + FN[d][0] + '?', chk: { k: 'eqv', n: n, d: d, D: D }
      };
      if (ctx.level === 1) p.viz = vz('g3-frac', { bars: [{ n: n, d: d, label: n + '/' + d }, { n: 0, d: D, label: '?/' + D }] }, 'Two bars of the same length: the top one shows ' + n + '/' + d + ' shaded, the bottom one is cut into ' + D + ' parts');
      return p;
    }
    if (kind === 'back') return {
      q: 'Fill in the box: $' + F(N, D) + ' = ' + F(BOX, d) + '$', a: aInt(n),
      steps: ['Put every ' + D / d + ' ' + FN[D][1] + ' together to make one ' + FN[d][0] + '.', N + ' ' + FN[D][1] + ' make $' + N + DV + (D / d) + ' = ' + n + '$ ' + (n === 1 ? FN[d][0] : FN[d][1]) + '.', 'So $' + F(N, D) + ' = ' + F(n, d) + '$.'],
      hint: 'How many ' + FN[D][1] + ' make one ' + FN[d][0] + '?', chk: { k: 'eqv', n: N, d: D, D: d }
    };
    if (kind === 'which') {
      var cands = [], dens = [2, 3, 4, 6, 8];
      dens.forEach(function (dd) { for (var k = 1; k < dd; k++) if (k * d !== n * dd && !(k === n && dd === d)) cands.push([k, dd]); });
      var wr = R.sample(cands.filter(function (x) { return x[1] === D || x[0] === n || x[0] === N; }), 3);
      return {
        q: 'Which fraction is equal to $' + F(n, d) + '$?', a: aMC(m(F(N, D)), wr.map(function (x) { return m(F(x[0], x[1])); })),
        steps: ['Cut each ' + FN[d][0] + ' into ' + D / d + ' equal pieces. The pieces become ' + FN[D][1] + '.', n + ' ' + (n === 1 ? FN[d][0] : FN[d][1]) + ' becomes ' + N + ' ' + FN[D][1] + ', so $' + F(n, d) + ' = ' + F(N, D) + '$.', 'The other fractions name different points on the number line.'],
        hint: 'Picture the two fractions as bars of the same length.', chk: { k: 'mc' }
      };
    }
    var st = R.pick([['$' + F(N, D) + '$ is greater than $' + F(n, d) + '$ because ' + N + ' and ' + D + ' are bigger numbers.', false, 'Bigger numbers do not mean a bigger amount here: the pieces are smaller. $' + F(N, D) + '$ and $' + F(n, d) + '$ cover the same length, so they are equal.'],
      ['$' + F(n, d) + ' = ' + F(N, D) + '$', true, 'Cut each ' + FN[d][0] + ' into ' + D / d + ' pieces: ' + n + ' ' + (n === 1 ? FN[d][0] : FN[d][1]) + ' become ' + N + ' ' + FN[D][1] + '. Same amount.'],
      ['$' + F(n, d) + ' = ' + F(n, D) + '$', false, FN[D][1].charAt(0).toUpperCase() + FN[D][1].slice(1) + ' are smaller pieces than ' + FN[d][1] + ', so ' + n + ' ' + (n === 1 ? FN[D][0] : FN[D][1]) + ' is less than ' + n + ' ' + (n === 1 ? FN[d][0] : FN[d][1]) + '.'],
      ['$' + F(n, d) + '$ and $' + F(N, D) + '$ are at the same point on the number line.', true, 'Equal fractions name the same point: both are ' + n + ' ' + (n === 1 ? FN[d][0] : FN[d][1]) + ' of the way from 0 to 1.']]);
    return { q: 'True or false: ' + st[0], a: aTF(st[1]), steps: [st[2], 'So the statement is ' + (st[1] ? 'true' : 'false') + '.'], hint: 'Picture both fractions as bars of the same length.', chk: { k: 'tfeqv', s: st[0], v: st[1] } };
  });

  function relMC(a, b, c, d2) { // compare a/b with c/d2, choices in a fixed order
    var x = a * d2, y = c * b, lt = '$' + F(a, b) + ' < ' + F(c, d2) + '$', gt = '$' + F(a, b) + ' > ' + F(c, d2) + '$', eq = '$' + F(a, b) + ' = ' + F(c, d2) + '$';
    return { t: 'mc', choices: [lt, gt, eq], v: x < y ? 0 : x > y ? 1 : 2, keep: true };
  }
  G('g3.compare-same-denominator', function (R, ctx) {
    var kind = BL(ctx, R.pick(['rel', 'relpic', 'story']), R.pick(['rel', 'greatest', 'story']), R.pick(['greatest', 'story', 'rel'])), d = R.pick([3, 4, 5, 6, 8, 10]), ab = R.sample(U.range(1, d - 1), 2), a = ab[0], b = ab[1];
    var why = ['Both fractions use ' + FN[d][1] + ', so the pieces are the same size.', 'Compare how many pieces: ' + a + ' ' + (a === 1 ? FN[d][0] : FN[d][1]) + ' and ' + b + ' ' + (b === 1 ? FN[d][0] : FN[d][1]) + '.', a < b ? 'Fewer pieces of the same size is less, so $' + F(a, d) + ' < ' + F(b, d) + '$.' : 'More pieces of the same size is more, so $' + F(a, d) + ' > ' + F(b, d) + '$.'];
    if (kind === 'rel' || kind === 'relpic') {
      var p = { q: 'Which is true?', a: relMC(a, d, b, d), steps: why, hint: 'The pieces are the same size. Who has more pieces?', chk: { k: 'mc' } };
      if (kind === 'relpic') p.viz = vz('g3-frac', { bars: [{ n: a, d: d, label: a + '/' + d }, { n: b, d: d, label: b + '/' + d }] }, 'Two bars cut into ' + d + ' equal parts, one with ' + a + ' shaded and one with ' + b + ' shaded');
      return p;
    }
    if (kind === 'greatest') {
      var three = R.sample(U.range(1, d - 1), Math.min(3, d - 1)), want = R.coin(), t = want ? Math.max.apply(null, three) : Math.min.apply(null, three);
      return { q: 'Which fraction is the ' + (want ? 'greatest' : 'least') + '? $' + three.map(function (x) { return F(x, d); }).join(',\\ ') + '$', a: aMC(m(F(t, d)), three.filter(function (x) { return x !== t; }).map(function (x) { return m(F(x, d)); })), steps: ['All the pieces are ' + FN[d][1] + ', the same size.', 'So compare the top numbers. The ' + (want ? 'greatest' : 'least') + ' top number is ' + t + '.', 'The answer is $' + F(t, d) + '$.'], hint: 'Same-size pieces: compare how many.', chk: { k: 'mc' } };
    }
    var n1 = R.pick(NAMES), n2 = R.pick(NAMES.filter(function (x) { return x !== n1; }));
    var sv = R.pick([['ran', 'of a mile', 'ran farther'], ['walked', 'of a mile', 'walked farther'], ['ate', 'of a pizza (the pizzas are the same size)', 'ate more'], ['painted', 'of a fence (the fences are the same size)', 'painted more'], ['read', 'of a book (the same book)', 'read more'], ['swam', 'of a lap', 'swam farther']]);
    return { q: n1 + ' ' + sv[0] + ' $' + F(a, d) + '$ ' + sv[1] + '. ' + n2 + ' ' + sv[0] + ' $' + F(b, d) + '$ ' + sv[1].replace(/ \(.*\)$/, '') + '. Who ' + sv[2] + '?', a: aMC(a > b ? n1 : n2, [a > b ? n2 : n1, 'They ran the same distance.']), steps: why.concat([(a > b ? n1 : n2) + ' ran farther.']), hint: 'Both distances are in ' + FN[d][1] + ' of a mile.', chk: { k: 'mc' } };
  });

  G('g3.compare-same-numerator', function (R, ctx) {
    var kind = BL(ctx, R.pick(['relpic', 'rel', 'story']), R.pick(['rel', 'why', 'story']), R.pick(['order', 'rel', 'story', 'why'])), xy = R.sample([2, 3, 4, 5, 6, 8, 10], 2), x = xy[0], y = xy[1], a = R.int(1, Math.min(x, y) - 1);
    var why = ['Both fractions have ' + pl(a, 'piece') + ' of the same-size whole.', 'Compare the size of the pieces: ' + FN[Math.min(x, y)][1] + ' are bigger than ' + FN[Math.max(x, y)][1] + ', because a whole cut into fewer parts has bigger parts.', 'Same number of bigger pieces is more, so $' + F(a, Math.min(x, y)) + ' > ' + F(a, Math.max(x, y)) + '$.'];
    if (kind === 'rel' || kind === 'relpic') {
      var p = { q: 'Which is true?', a: relMC(a, x, a, y), steps: why, hint: 'Same number of pieces. Which pieces are bigger?', chk: { k: 'mc' } };
      if (kind === 'relpic') p.viz = vz('g3-frac', { bars: [{ n: a, d: x, label: a + '/' + x }, { n: a, d: y, label: a + '/' + y }] }, 'Two bars of the same length, cut into ' + x + ' and ' + y + ' equal parts, each with ' + a + ' shaded');
      return p;
    }
    if (kind === 'why') return {
      q: 'Why is $' + F(1, Math.min(x, y)) + '$ greater than $' + F(1, Math.max(x, y)) + '$?',
      a: aMC('A whole cut into ' + Math.min(x, y) + ' equal parts has bigger parts than one cut into ' + Math.max(x, y) + '.', ['Because ' + Math.max(x, y) + ' is bigger than ' + Math.min(x, y) + '.', '$' + F(1, Math.max(x, y)) + '$ has more pieces, so it is bigger.', 'They are equal because the top numbers are the same.']),
      steps: ['Both fractions are one piece of the same whole.', 'Fewer parts means each part is bigger.', 'So one ' + FN[Math.min(x, y)][0] + ' is more than one ' + FN[Math.max(x, y)][0] + '.'], hint: 'Picture a sandwich cut into ' + Math.min(x, y) + ' parts and another cut into ' + Math.max(x, y) + ' parts.', chk: { k: 'mc' }
    };
    if (kind === 'order') {
      var dens = R.sample([2, 3, 4, 6, 8, 10].filter(function (v) { return v > 1; }), 3), aa = 1, want = R.coin(), t = want ? Math.min.apply(null, dens) : Math.max.apply(null, dens);
      return { q: 'Which fraction is the ' + (want ? 'greatest' : 'least') + '? $' + dens.map(function (v) { return F(aa, v); }).join(',\\ ') + '$', a: aMC(m(F(aa, t)), dens.filter(function (v) { return v !== t; }).map(function (v) { return m(F(aa, v)); })), steps: ['Each fraction is one piece of the same whole.', 'Fewer parts means bigger pieces.', 'The ' + (want ? 'greatest is the one with the fewest parts' : 'least is the one with the most parts') + ': $' + F(aa, t) + '$.'], hint: 'More parts means smaller parts.', chk: { k: 'mc' } };
    }
    var n1 = R.pick(NAMES), n2 = R.pick(NAMES.filter(function (v) { return v !== n1; }));
    return { q: 'Two pans of cornbread are the same size. ' + n1 + ' ate $' + F(a, x) + '$ of one pan. ' + n2 + ' ate $' + F(a, y) + '$ of the other pan. Who ate more?', a: aMC(x < y ? n1 : n2, [x < y ? n2 : n1, 'They ate the same amount.']), steps: why.concat([(x < y ? n1 : n2) + ' ate more.']), hint: 'They ate the same number of pieces. Whose pieces were bigger?', chk: { k: 'mc' } };
  });

  /* ================================================================== Time, Mass and Liquid Volume */
  function face(x) { x = ((x - 1) % 12 + 12) % 12 + 1; return x; }
  function tAns(t) { t = ((t % 720) + 720) % 720; var h = Math.floor(t / 60) || 12, mm = t % 60; return aTime(h, mm); }
  function readSteps(h, mm) {
    var k = Math.floor(mm / 5), r = mm % 5, s = [];
    s.push(mm >= 45 ? 'The short blue hour hand is close to ' + face(h + 1) + ', but it has not reached ' + face(h + 1) + ' yet. So the hour is still ' + h + '.' : 'The short blue hour hand is ' + (mm < 15 ? 'just past ' + h : 'between ' + h + ' and ' + face(h + 1)) + ', so the hour is ' + h + '.');
    if (k === 0) s.push('The long red minute hand is ' + pl(r, 'small mark') + ' past the 12, so it shows ' + mm + ' minutes.');
    else if (r === 0) s.push('The long red minute hand points at the ' + k + '. Count by 5s: ' + skip(5, k) + '. That is ' + mm + ' minutes.');
    else s.push('The long red minute hand is ' + pl(r, 'small mark') + ' past the ' + k + '. Count by 5s to the ' + k + ': ' + skip(5, k) + '. Then count on ' + r + ': ' + U.range(5 * k + 1, mm).join(', ') + '.');
    s.push('The time is ' + h + ':' + (mm < 10 ? '0' : '') + mm + '.');
    return s;
  }
  G('g3.time-to-minute', function (R, ctx) {
    var kind = BL(ctx, R.pick(['read', 'read', 'hand']), R.pick(['read', 'read', 'hand', 'near']), R.pick(['near', 'read', 'before', 'hand'])), h = R.int(1, 12), mm;
    if (kind === 'near') mm = R.int(50, 59); else if (ctx.level === 1) mm = 5 * R.int(1, 10) + R.int(1, 4); else mm = R.intNot(1, 59, [15, 30, 45]);
    if (kind === 'before') {
      var H = R.int(2, 12), back = R.int(3, 19), t = H * 60 - back;
      return { q: 'What time is it ' + back + ' minutes before ' + H + ':00? Give the hour and the minutes.', a: tAns(t), steps: ['Count back ' + back + ' minutes from ' + H + ':00.', 'One minute before ' + H + ':00 is ' + hm(H * 60 - 1) + '. The hour goes back to ' + face(H - 1) + '.', '$60 - ' + back + ' = ' + (60 - back) + '$, so the time is ' + hm(t) + '.'], hint: 'An hour has 60 minutes. Count back from 60.', chk: { k: 'timeAt', t: t } };
    }
    var time = h + ':' + (mm < 10 ? '0' : '') + mm;
    if (kind === 'hand') {
      var k = Math.floor(mm / 5), r = mm % 5, nm = function (a, b) { return 'between the ' + face(a) + ' and the ' + face(b); };
      var right = r === 0 ? 'right on the ' + face(k) : nm(k, k + 1), wr = [nm(k + 1, k + 2), nm(h, h + 1), r === 0 ? nm(k, k + 1) : 'right on the ' + face(k + 1), nm(k - 1, k)].filter(function (x) { return x !== right; });
      return { q: 'The time is ' + time + '. Where does the long minute hand point?', a: aMC(right, wr), steps: [mm + ' minutes is ' + (k ? pl(k, 'jump') + ' of 5 (to the ' + face(k) + ')' : '0 jumps of 5') + (r ? ' and ' + pl(r, 'more minute') : '') + '.', 'So the minute hand is ' + right + '.', 'The short hour hand is a different hand: at ' + time + ' it is between the ' + h + ' and the ' + face(h + 1) + '.'], hint: 'Each number on the clock is 5 more minutes. What is ' + mm + ' in 5s?', chk: { k: 'mc' } };
    }
    return { q: 'What time does the clock show? Give the hour and the minutes.', viz: vz('g3-clock', { time: time }, 'An analog clock'), a: aTime(h, mm), steps: readSteps(h, mm), hint: 'Read the short hand for the hour. Then count the minutes by 5s and 1s.', chk: { k: 'time', h: h, m: mm } };
  });

  var EVENTS = ['Recess', 'Art class', 'Swim practice', 'The bus ride', 'A puppet show', 'Baking the bread', 'The fire drill', 'Music class'];
  G('g3.elapsed-time', function (R, ctx) {
    var kind = BL(ctx, R.pick(['same', 'same', 'cross']), R.pick(['cross', 'end', 'same', 'cross']), R.pick(['cross', 'end', 'start', 'long'])), h = R.int(1, 11), ev = R.pick(EVENTS), m1, m2, t1, t2, dur;
    if (kind === 'same') {
      m1 = 5 * R.int(0, 8); dur = R.int(8, 55 - m1); m2 = m1 + dur; t1 = h * 60 + m1; t2 = h * 60 + m2;
      return { q: ev + ' starts at ' + hm(t1) + ' and ends at ' + hm(t2) + '. How many minutes long is it?', a: aInt(dur), unit: 'minutes', steps: ['Both times are in the same hour, ' + h + ' o’clock.', 'Count the minutes from ' + m1 + ' to ' + m2 + ': $' + m2 + ' - ' + m1 + ' = ' + dur + '$.', 'It lasts ' + dur + ' minutes.'], hint: 'Subtract the minutes, or count up from the start time.', chk: { k: 'el', t1: t1, t2: t2 } };
    }
    if (kind === 'cross') {
      m1 = R.int(35, 57); m2 = R.int(2, 35); t1 = h * 60 + m1; t2 = (h + 1) * 60 + m2; dur = t2 - t1;
      return { q: ev + ' starts at ' + hm(t1) + ' and ends at ' + hm(t2) + '. How many minutes long is it?', a: aInt(dur), unit: 'minutes',
        steps: ['Count up to the next hour first: from ' + hm(t1) + ' to ' + hm((h + 1) * 60) + ' is $60 - ' + m1 + ' = ' + (60 - m1) + '$ minutes.', 'Then from ' + hm((h + 1) * 60) + ' to ' + hm(t2) + ' is ' + m2 + ' minutes.', 'Add: $' + (60 - m1) + ' + ' + m2 + ' = ' + dur + '$ minutes.', 'Subtracting the times like ordinary numbers does not work: an hour has 60 minutes, not 100.'],
        hint: 'Count up to the next o’clock first, then count on.', chk: { k: 'el', t1: t1, t2: t2 } };
    }
    if (kind === 'end') {
      m1 = R.int(5, 55); dur = R.int(12, 50); t1 = h * 60 + m1; t2 = t1 + dur; var toHr = 60 - m1;
      var st = t2 >= (h + 1) * 60 ? ['From ' + hm(t1) + ', ' + toHr + ' minutes gets to ' + hm((h + 1) * 60) + '.', 'That leaves $' + dur + ' - ' + toHr + ' = ' + (dur - toHr) + '$ minutes.', hm((h + 1) * 60) + ' and ' + (dur - toHr) + ' more minutes is ' + hm(t2) + '.'] : ['Add the minutes: $' + m1 + ' + ' + dur + ' = ' + (m1 + dur) + '$.', 'That is less than 60, so the hour stays ' + h + '. It ends at ' + hm(t2) + '.'];
      return { q: ev + ' starts at ' + hm(t1) + ' and lasts ' + dur + ' minutes. What time does it end? Give the hour and the minutes.', a: tAns(t2), steps: st, hint: 'How many minutes until the next o’clock? Start there.', chk: { k: 'timeAt', t: t2 } };
    }
    if (kind === 'start') {
      m2 = R.int(3, 40); dur = R.int(15, 50); t2 = (h + 1) * 60 + m2; t1 = t2 - dur;
      var st2 = dur > m2 ? ['Go back ' + m2 + ' minutes from ' + hm(t2) + ' to ' + hm((h + 1) * 60) + '.', 'That leaves $' + dur + ' - ' + m2 + ' = ' + (dur - m2) + '$ minutes to go back.', (dur - m2) + ' minutes before ' + hm((h + 1) * 60) + ' is ' + hm(t1) + ' (because $60 - ' + (dur - m2) + ' = ' + (60 - dur + m2) + '$).'] : ['Take away the minutes: $' + m2 + ' - ' + dur + ' = ' + (m2 - dur) + '$.', 'So it started at ' + hm(t1) + '.'];
      return { q: ev + ' ended at ' + hm(t2) + '. It lasted ' + dur + ' minutes. What time did it start? Give the hour and the minutes.', a: tAns(t1), steps: st2, hint: 'Count back to the o’clock first.', chk: { k: 'timeAt', t: t1 } };
    }
    m1 = R.int(10, 55); var hrs = 1, extra = R.int(5, 55); t1 = h * 60 + m1; t2 = t1 + 60 + extra; dur = t2 - t1;
    return { q: 'A trip starts at ' + hm(t1) + ' and ends at ' + hm(t2) + '. How long is the trip? Give hours and minutes.', a: { t: 'multi', parts: [{ label: 'Hours:', a: aInt(hrs) }, { label: 'Minutes:', a: aInt(extra) }] },
      steps: ['From ' + hm(t1) + ' to ' + hm(t1 + 60) + ' is 1 hour.', (function () { var mid = t1 + 60, nx = Math.ceil(mid / 60) * 60; if (t2 > nx) return 'From ' + hm(mid) + ' to ' + hm(nx) + ' is ' + (nx - mid) + ' minutes, and from ' + hm(nx) + ' to ' + hm(t2) + ' is ' + (t2 - nx) + ' more: $' + (nx - mid) + ' + ' + (t2 - nx) + ' = ' + extra + '$ minutes.'; return 'From ' + hm(mid) + ' to ' + hm(t2) + ' is $' + (t2 % 60 || 60) + ' - ' + (mid % 60) + ' = ' + extra + '$ minutes.'; })(), 'So the trip takes 1 hour ' + extra + ' minutes (' + dur + ' minutes in all).'], hint: 'Jump ahead one whole hour first.', chk: { k: 'elhm', t1: t1, t2: t2 } };
  });

  G('g3.mass-and-liquid-volume', function (R, ctx) {
    var kind = BL(ctx, R.pick(['beaker', 'scale', 'est']), R.pick(['beaker', 'scale', 'word', 'same']), R.pick(['word', 'word', 'beaker', 'scale', 'est'])), v, o;
    if (kind === 'beaker') {
      if (ctx.level === 1) { o = { kind: 'beaker', max: 10, step: 1, value: R.int(1, 9), unit: 'L' }; }
      else if (R.coin()) { o = { kind: 'beaker', max: 20, step: 5, minor: 4, value: R.intNot(3, 19, [5, 10, 15]), unit: 'L' }; }
      else { o = { kind: 'beaker', max: 10, step: 2, minor: 1, value: R.pick([1, 3, 5, 7, 9]), unit: 'L' }; }
      v = o.value; var each = o.step / ((o.minor || 0) + 1);
      return { q: R.pick(['How many liters of water are in the container?', R.pick(NAMES) + ' poured water into this container. How many liters are in it?', R.pick(NAMES) + ' is filling a ' + R.pick(['fish tank', 'watering can', 'bucket', 'cooler']) + '. How many liters of water does the container show?']), viz: vz('g3-measure', o, 'A container marked in liters, with water in it'), a: aInt(v), unit: 'liters',
        steps: ['The numbered lines go up by ' + o.step + (o.minor ? ', and each small mark between them is ' + each + ' liter' + (each > 1 ? 's' : '') : '') + '.', 'Find the top of the water and read the nearest line' + (o.minor ? ': count up from the numbered line below it' : '') + '.', 'The water is at ' + v + ' liters.'], hint: 'What does each mark on the side stand for?', chk: { k: 'read', v: v } };
    }
    if (kind === 'scale') {
      if (ctx.level === 1) o = { kind: 'scale', max: 10, step: 1, value: R.int(1, 9), unit: 'kg' };
      else if (R.coin()) o = { kind: 'scale', max: 1000, step: 100, minor: 1, value: 50 * R.pick([3, 5, 7, 9, 11, 13, 15, 17]), unit: 'g' };
      else o = { kind: 'scale', max: 20, step: 5, minor: 4, value: R.intNot(3, 19, [5, 10, 15]), unit: 'kg' };
      v = o.value; var each2 = o.step / ((o.minor || 0) + 1), un = o.unit === 'g' ? 'grams' : 'kilograms';
      return { q: R.pick(['What mass does the scale show, in ' + un + '?', R.pick(NAMES) + ' put ' + R.pick(['a bag of apples', 'a pumpkin', 'a box of books', 'a sack of potatoes', 'a melon']) + ' on the scale. What mass does it show, in ' + un + '?']), viz: vz('g3-measure', o, 'A dial scale in ' + un), a: aInt(v), unit: un,
        steps: ['The numbers on the dial go up by ' + o.step + (o.minor ? ', and each small mark is ' + each2 + ' ' + (each2 === 1 ? un.slice(0, -1) : un) : '') + '.', 'The needle points ' + (v % o.step ? 'between ' + (v - v % o.step) + ' and ' + (v - v % o.step + o.step) + ', at the mark for ' + v : 'right at ' + v) + '.', 'The mass is ' + v + ' ' + un + '.'], hint: 'Look at the numbers on each side of the needle.', chk: { k: 'read', v: v } };
    }
    if (kind === 'est') {
      var it = R.pick([['a paper clip', 'about 1 gram', ['about 1 kilogram', 'about 100 grams', 'about 10 kilograms'], 'A paper clip is very light: about the mass of 1 gram.'],
        ['an apple', 'about 200 grams', ['about 2 grams', 'about 2 kilograms', 'about 20 kilograms'], 'An apple is light but not tiny. Five apples are about 1 kilogram, so one is about 200 grams.'],
        ['a bicycle', 'about 12 kilograms', ['about 12 grams', 'about 120 grams', 'about 120 kilograms'], 'A bike is heavy to lift but you can carry it: about 12 kilograms.'],
        ['a big dictionary', 'about 1 kilogram', ['about 1 gram', 'about 10 grams', 'about 50 kilograms'], 'A big book is about 1 kilogram.'],
        ['a bucket of water', 'about 10 liters', ['about 1 liter', 'about 100 liters', 'about 1,000 liters'], 'A bucket holds about 10 liters, ten big bottles of water.'],
        ['a large water bottle', 'about 1 liter', ['about 10 liters', 'about 100 liters', 'about 1,000 liters'], 'A large water bottle holds about 1 liter.'],
        ['a full bathtub', 'about 150 liters', ['about 1 liter', 'about 15 liters', 'about 1,500 liters'], 'A bathtub holds many buckets of water: about 150 liters.']]);
      return { q: 'Which is the best estimate for ' + (/water|bathtub/.test(it[0]) ? 'how much water is in ' : 'the mass of ') + it[0] + '?', a: aMC(it[1], it[2]), steps: [it[3], 'So the best estimate is ' + it[1] + '.'], hint: 'A gram is about a paper clip; a kilogram is about a big book; a liter is about a big water bottle.', chk: { k: 'mc' } };
    }
    if (kind === 'same') { var heavyLook = R.pick(['a kilogram of feathers or a kilogram of rocks', 'a bag of 1 kilogram of popcorn or a 1 kilogram brick']); return {
      q: 'Which has more mass: ' + heavyLook + '?', a: aMC('They have the same mass.', ['the ' + (heavyLook.indexOf('feathers') >= 0 ? 'rocks' : 'brick'), 'the ' + (heavyLook.indexOf('feathers') >= 0 ? 'feathers' : 'popcorn')]),
      steps: ['Both are exactly 1 kilogram.', 'One takes up more space, but size is not the same as mass. On a balance they would be level.', 'So they have the same mass.'], hint: 'Look at the amounts, not the sizes.', chk: { k: 'mc' } }; }
    var nm = R.pick(NAMES), w = R.pick(['add', 'sub', 'mul', 'div', 'addg']), q, ans, st, un2;
    if (w === 'add') { var a1 = R.int(3, 25), a2 = R.int(2, 15); ans = a1 + a2; un2 = 'kilograms'; q = 'A dog has a mass of ' + a1 + ' kg. A cat has a mass of ' + a2 + ' kg. What is their total mass?'; st = ['Put the masses together: $' + a1 + ' + ' + a2 + ' = ' + ans + '$.', 'Their total mass is ' + ans + ' kg.']; }
    else if (w === 'sub') { var b1 = R.int(12, 40), b2 = R.int(3, b1 - 4); ans = b1 - b2; un2 = 'liters'; q = 'A fish tank holds ' + b1 + ' liters of water. ' + nm + ' takes out ' + b2 + ' liters to clean it. How many liters are left?'; st = ['Take away: $' + b1 + ' - ' + b2 + ' = ' + ans + '$.', ans + ' liters are left.']; }
    else if (w === 'mul') { var c1 = R.int(2, 9), c2 = R.int(2, 9); ans = c1 * c2; un2 = 'kilograms'; q = 'Each bag of rice has a mass of ' + c1 + ' kg. What is the mass of ' + c2 + ' bags?'; st = [c2 + ' equal groups of ' + c1 + ' kg: $' + c2 + X + c1 + ' = ' + ans + '$.', 'The bags have a mass of ' + ans + ' kg.']; }
    else if (w === 'div') { var d1 = R.int(2, 9), d2 = R.int(2, 9); ans = d1; un2 = 'liters'; q = (d1 * d2) + ' liters of lemonade are poured equally into ' + d2 + ' jugs. How many liters go in each jug?'; st = ['Share ' + (d1 * d2) + ' liters equally into ' + d2 + ': $' + (d1 * d2) + DV + d2 + ' = ' + d1 + '$, because $' + d2 + X + d1 + ' = ' + (d1 * d2) + '$.', 'Each jug gets ' + d1 + ' liters.']; }
    else { var g1 = 10 * R.int(10, 40), g2 = 10 * R.int(5, 30); ans = g1 + g2; un2 = 'grams'; q = 'An apple has a mass of ' + g1 + ' grams and a pear has a mass of ' + g2 + ' grams. What is their total mass?'; st = ['Add: $' + g1 + ' + ' + g2 + ' = ' + ans + '$.', 'Together they have a mass of ' + ans + ' grams.']; }
    return { q: q, a: aInt(ans), unit: un2, steps: st, hint: 'Picture the story: are you putting together, taking away, making equal groups, or sharing?', chk: { k: 'val', v: ans } };
  });

  /* ================================================================== Area and Perimeter */
  var UNITS = [['cm', 'centimeters'], ['m', 'meters'], ['in', 'inches'], ['ft', 'feet']];
  function lShape(W, H, w2, h2, corner) {
    var P = [[0, 0], [W - w2, 0], [W - w2, h2], [W, h2], [W, H], [0, H]], cut = [W - w2, 0, W - w2, H], parts = [[0, 0, W - w2, H], [W - w2, h2, w2, H - h2]];
    var fx = corner === 1 || corner === 3, fy = corner === 2 || corner === 3;
    function tp(p) { return [fx ? W - p[0] : p[0], fy ? H - p[1] : p[1]]; }
    P = P.map(tp); var c0 = tp([cut[0], cut[1]]), c1 = tp([cut[2], cut[3]]);
    parts = parts.map(function (r, i) { return [fx ? W - r[0] - r[2] : r[0], fy ? H - r[1] - r[3] : r[1], r[2], r[3], i ? 'gold' : 'blue']; });
    return { poly: P, cut: [c0[0], c0[1], c1[0], c1[1]], parts: parts, area: W * H - w2 * h2, a1: (W - w2) * H, a2: w2 * (H - h2), W: W, H: H, w2: w2, h2: h2 };
  }
  function sideLens(P) { return P.map(function (p, i) { var q = P[(i + 1) % P.length]; return Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) * 1000) / 1000; }); }
  function outer(P, i) { var p = P[i], q = P[(i + 1) % P.length], xs = P.map(function (v) { return v[0]; }), ys = P.map(function (v) { return v[1]; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys); return (p[0] === q[0] && (p[0] === x0 || p[0] === x1)) || (p[1] === q[1] && (p[1] === y0 || p[1] === y1)); }

  G('g3.area-unit-squares', function (R, ctx) {
    var kind = BL(ctx, R.pick(['rect', 'rect', 'L']), R.pick(['L', 'rect', 'L']), R.pick(['L', 'cm', 'tf'])), w, h;
    if (kind === 'rect' || kind === 'cm') {
      w = R.int(BL(ctx, 2, 3, 3), BL(ctx, 5, 7, 8)); h = R.intNot(2, BL(ctx, 4, 6, 6), w);
      var uu = kind === 'cm' ? R.pick([['square centimeter', 'square centimeters', 'square cm'], ['square inch', 'square inches', 'square in']]) : R.pick([['square unit', 'square units', 'square units'], ['square centimeter', 'square centimeters', 'square cm'], ['square inch', 'square inches', 'square in']]);
      return { q: 'Each small square is 1 ' + uu[0] + '. What is the area of the ' + R.pick(['rectangle', 'shape', 'figure']) + '?', viz: vz('g3-shape', { rect: [w, h], grid: 'squares' }, 'A rectangle covered with unit squares, ' + h + ' rows of ' + w), a: aInt(w * h), unit: uu[2],
        steps: ['Area counts the unit squares that cover the shape, with no gaps and no overlaps.', 'There are ' + h + ' rows with ' + w + ' squares in each row.', 'Count by rows: ' + skip(w, h) + '. Or multiply: $' + h + X + w + ' = ' + w * h + '$.', 'The area is ' + w * h + ' ' + uu[1] + '.'], hint: 'Count the squares inside, not the edges. Count a row, then count by rows.', chk: { k: 'area', w: w, h: h } };
    }
    if (kind === 'tf') {
      w = R.int(3, 6); h = R.intNot(2, 5, w); if (2 * (w + h) === w * h) { w = 5; h = 3; } var nm = R.pick(NAMES), per = 2 * (w + h);
      return { q: nm + ' says the area of this rectangle is ' + per + ' square units, because ' + nm + ' counted the unit lengths all the way around the edge. Is ' + nm + ' right?', viz: vz('g3-shape', { rect: [w, h], grid: 'squares' }, 'A rectangle covered with unit squares, ' + h + ' rows of ' + w), a: aTF(false),
        steps: ['Counting the lengths around the edge gives the perimeter, ' + per + ' units. That measures the distance around.', 'Area counts the squares inside: $' + h + X + w + ' = ' + w * h + '$ square units.', 'So ' + nm + ' is not right. The area is ' + w * h + ' square units.'], hint: 'Does area measure the inside or the edge?', chk: { k: 'tf', v: false } };
    }
    var W = R.int(4, 7), H = R.int(3, 6), w2 = R.int(1, W - 2), h2 = R.int(1, H - 2), L = lShape(W, H, w2, h2, R.int(0, 3));
    var u2 = R.pick([['square unit', 'square units'], ['square centimeter', 'square cm'], ['square meter', 'square m'], ['square foot', 'square ft']]);
    return { q: 'Each small square is 1 ' + u2[0] + '. What is the area of this ' + R.pick(['shape', 'figure', 'garden', 'floor plan']) + '?', viz: vz('g3-shape', { poly: L.poly, grid: 'squares' }, 'An L-shaped figure covered with unit squares'), a: aInt(L.area), unit: u2[1],
      steps: ['Count the unit squares inside the shape. Splitting it into two rectangles makes counting faster.', 'One rectangle is ' + (W - w2) + ' by ' + H + ': $' + (W - w2) + X + H + ' = ' + L.a1 + '$ squares.', 'The other is ' + w2 + ' by ' + (H - h2) + ': $' + w2 + X + (H - h2) + ' = ' + L.a2 + '$ squares.', 'Add: $' + L.a1 + ' + ' + L.a2 + ' = ' + L.area + '$ ' + u2[1] + '.'], hint: 'Split the shape into rectangles, count each, and add.', chk: { k: 'areaL', W: W, H: H, w2: w2, h2: h2 } };
  });

  G('g3.area-by-multiplying', function (R, ctx) {
    var kind = BL(ctx, R.pick(['grid', 'grid', 'label']), R.pick(['label', 'word', 'tiles']), R.pick(['word', 'side', 'label', 'side'])), un = R.pick(UNITS), w = R.int(3, BL(ctx, 6, 9, 10)), h = R.intNot(2, BL(ctx, 5, 8, 9), w), A = w * h;
    if (kind === 'grid' || kind === 'label') {
      var o = { rect: [w, h], sides: [w + ' ' + un[0], h + ' ' + un[0], null, null] }; if (kind === 'grid') o.grid = 'squares';
      return { q: R.pick(['What is the area of the rectangle?', R.pick(NAMES) + ' drew this rectangle. What is its area?', 'What is the area of this rectangle, in square ' + un[1] + '?']), viz: vz('g3-shape', o, 'A rectangle ' + w + ' ' + un[0] + ' by ' + h + ' ' + un[0]), a: aInt(A), unit: 'square ' + un[0],
        steps: ['Unit squares fit in ' + h + ' rows with ' + w + ' squares in each row.', 'So the area is $' + h + X + w + ' = ' + A + '$.', 'The area is ' + A + ' square ' + un[1] + '.'], hint: 'Multiply the length by the width.', chk: { k: 'area', w: w, h: h } };
    }
    if (kind === 'tiles') return { q: 'A floor is ' + w + ' feet long and ' + h + ' feet wide. How many square tiles, each 1 foot on a side, cover the floor?', a: aInt(A), unit: 'tiles', steps: ['The tiles make ' + h + ' rows with ' + w + ' tiles in each row.', '$' + h + X + w + ' = ' + A + '$ tiles. That is the area: ' + A + ' square feet.'], hint: 'Picture the rows of tiles.', chk: { k: 'area', w: w, h: h } };
    if (kind === 'side') return { q: 'A rectangle has an area of ' + A + ' square ' + un[1] + '. One side is ' + w + ' ' + un[1] + ' long. How long is the other side?', a: aInt(h), unit: un[1], steps: ['Area = one side times the other side, so $' + w + X + BOX + ' = ' + A + '$.', 'What times ' + w + ' makes ' + A + '? $' + w + X + h + ' = ' + A + '$.', 'The other side is ' + h + ' ' + un[1] + '.'], hint: 'Write the area as a multiplication with a missing factor.', chk: { k: 'div', t: A, d: w } };
    var it = R.pick([['A rug', 'feet', 'ft'], ['A garden', 'meters', 'm'], ['A poster', 'inches', 'in'], ['A playground', 'meters', 'm'], ['A photo', 'centimeters', 'cm']]);
    return { q: it[0] + ' is ' + w + ' ' + it[1] + ' long and ' + h + ' ' + it[1] + ' wide. What is its area?', a: aInt(A), unit: 'square ' + it[2], steps: ['The rug is a rectangle, so multiply the side lengths.'.replace('The rug', it[0]), '$' + w + X + h + ' = ' + A + '$.', 'The area is ' + A + ' square ' + it[1] + '.'], hint: 'Area of a rectangle: length times width.', chk: { k: 'area', w: w, h: h } };
  });

  function splitRect(h, b1, b2, un) {
    return vz('g3-shape', { poly: [[0, 0], [b1, 0], [b1 + b2, 0], [b1 + b2, h], [0, h]], sides: [b1 + ' ' + un, b2 + ' ' + un, null, null, h + ' ' + un], parts: [[0, 0, b1, h, 'blue'], [b1, 0, b2, h, 'gold']], cuts: [[b1, 0, b1, h]], fill: 'none' }, 'A rectangle ' + h + ' ' + un + ' tall, split into a part ' + b1 + ' ' + un + ' wide and a part ' + b2 + ' ' + un + ' wide');
  }
  G('g3.area-distributive', function (R, ctx) {
    var kind = BL(ctx, R.pick(['parts', 'parts', 'fill']), R.pick(['parts', 'mc', 'fill']), R.pick(['big', 'mc', 'big', 'fill'])), un = R.pick(UNITS)[0], h = R.int(3, 8), b1 = R.pick([4, 5, 6]), b2 = R.int(2, 4);
    if (kind === 'big') { b1 = 10; b2 = R.int(2, 6); h = R.int(3, 7); }
    var b = b1 + b2, A1 = h * b1, A2 = h * b2;
    if (kind === 'parts' || kind === 'big') return {
      q: 'The rectangle is split into two parts. Find the area of each part and of the whole rectangle.', viz: splitRect(h, b1, b2, un),
      a: { t: 'multi', parts: [{ label: 'Blue part:', a: aInt(A1) }, { label: 'Gold part:', a: aInt(A2) }, { label: 'Whole rectangle:', a: aInt(A1 + A2) }] }, unit: 'square ' + un,
      steps: ['Blue part: $' + h + X + b1 + ' = ' + A1 + '$ square ' + un + '.', 'Gold part: $' + h + X + b2 + ' = ' + A2 + '$ square ' + un + '.', 'Whole: $' + A1 + ' + ' + A2 + ' = ' + (A1 + A2) + '$ square ' + un + '.', 'Check: the whole is ' + h + ' by ' + b + ', and $' + h + X + b + ' = ' + h * b + '$. So $' + h + X + '(' + b1 + ' + ' + b2 + ') = ' + h + X + b1 + ' + ' + h + X + b2 + '$.'],
      hint: 'Each part is a rectangle. Multiply its sides.', chk: { k: 'distA', h: h, b1: b1, b2: b2 }
    };
    if (kind === 'fill') return {
      q: 'Fill in the box: $' + h + X + b + ' = ' + h + X + b1 + ' + ' + h + X + BOX + '$', viz: splitRect(h, b1, b2, un), a: aInt(b2),
      steps: ['The rectangle is ' + h + ' by ' + b + '. Splitting the ' + b + ' side into ' + b1 + ' and ' + b2 + ' makes two rectangles.', 'So $' + h + X + b + ' = ' + h + X + b1 + ' + ' + h + X + b2 + '$. The box is ' + b2 + '.', 'Check: $' + A1 + ' + ' + A2 + ' = ' + h * b + '$.'], hint: b1 + ' plus what makes ' + b + '?', chk: { k: 'val', v: b2 }
    };
    return {
      q: 'Which expression gives the area of the whole rectangle?', viz: splitRect(h, b1, b2, un),
      a: aMC(m(h + X + '(' + b1 + ' + ' + b2 + ')'), [m(h + X + b1 + ' + ' + b2), m(h + ' + ' + b1 + X + b2), m(h + ' + ' + b1 + ' + ' + b2)]),
      steps: ['The whole rectangle is ' + h + ' tall and $' + b1 + ' + ' + b2 + '$ wide.', 'So its area is $' + h + X + '(' + b1 + ' + ' + b2 + ') = ' + h + X + b + ' = ' + h * b + '$.', 'It is also $' + h + X + b1 + ' + ' + h + X + b2 + ' = ' + A1 + ' + ' + A2 + '$, the two parts added.'], hint: 'What are the two side lengths of the whole rectangle?', chk: { k: 'mc' }
    };
  });

  G('g3.area-composite', function (R, ctx) {
    var kind = BL(ctx, R.pick(['grid', 'label']), R.pick(['label', 'label', 'tf']), R.pick(['hidden', 'hidden', 'label', 'tf'])), un = R.pick(UNITS), W = R.int(5, 9), H = R.int(4, 8), w2 = R.int(2, W - 2), h2 = R.int(2, H - 2), L = lShape(W, H, w2, h2, R.int(0, 3));
    var lens = sideLens(L.poly), sides = lens.map(function (v, i) { return kind === 'hidden' && !outer(L.poly, i) ? null : v + ' ' + un[0]; });
    var o = { poly: L.poly, sides: sides }; if (kind === 'grid') o.grid = 'squares';
    var steps = ['Draw a line to split the shape into two rectangles' + (kind === 'tf' ? '.' : ' (the dashed line in the picture shows one way).'),
      'The first rectangle is ' + (W - w2) + ' by ' + H + ': $' + (W - w2) + X + H + ' = ' + L.a1 + '$.', 'The second rectangle is ' + w2 + ' by ' + (H - h2) + ': $' + w2 + X + (H - h2) + ' = ' + L.a2 + '$.', 'Add the two areas: $' + L.a1 + ' + ' + L.a2 + ' = ' + L.area + '$ square ' + un[1] + '.'];
    if (kind === 'hidden') steps.splice(1, 0, 'First find the missing sides. The whole shape is ' + W + ' wide, so the short top side is $' + W + ' - ' + (W - w2) + ' = ' + w2 + '$. It is ' + H + ' tall, so the short side is $' + H + ' - ' + (H - h2) + ' = ' + h2 + '$.');
    if (kind === 'tf') return { q: R.pick(NAMES) + ' says the area of this shape is $' + W + X + H + ' = ' + W * H + '$ square ' + un[1] + '. Is that right?', viz: vz('g3-shape', o, 'An L-shaped figure with its side lengths marked'), a: aTF(false),
      steps: ['$' + W + X + H + '$ is the area of the whole ' + W + ' by ' + H + ' rectangle, but a ' + w2 + ' by ' + h2 + ' corner is missing.'].concat(steps.slice(1)).concat(['So the area is ' + L.area + ', not ' + W * H + '.']), hint: 'Is the shape a whole rectangle?', chk: { k: 'tf', v: false } };
    return { q: 'What is the area of this shape?', viz: vz('g3-shape', Object.assign(o, { cuts: [L.cut] }), 'An L-shaped figure with its side lengths marked and a dashed line splitting it into two rectangles'), a: aInt(L.area), unit: 'square ' + un[0], steps: steps,
      hint: 'Split it into two rectangles. Find each area, then add.', chk: { k: 'areaL', W: W, H: H, w2: w2, h2: h2 } };
  });

  function triPts(a, b, c) { var x = (b * b - a * a + c * c) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x)); return [[0, y], [c, y], [x, 0]]; } // base c, left side b, right side a
  function polyPer(R, lvl) { // a labeled polygon: returns {poly, sides (numbers), name}
    var t = R.pick(lvl === 1 ? ['tri', 'house'] : ['tri', 'house', 'hex', 'quad']);
    if (t === 'tri') { for (var k = 0; k < 50; k++) { var a = R.int(3, 9), b = R.int(3, 9), c = R.int(4, 10); if (a + b > c + 1 && a + c > b + 1 && b + c > a + 1) break; } var P = triPts(a, b, c); return { poly: [P[0], P[1], P[2]], sides: [c, a, b], name: 'triangle' }; }
    if (t === 'house') { var hw = R.pick([[6, 4, 5], [8, 3, 5]]), wall = R.int(3, 6); return { poly: [[0, hw[1]], [hw[0] / 2, 0], [hw[0], hw[1]], [hw[0], hw[1] + wall], [0, hw[1] + wall]], sides: [hw[2], hw[2], wall, hw[0], wall], name: 'pentagon' }; }
    if (t === 'hex') { var s = R.int(2, 9), pts = []; for (var i = 0; i < 6; i++) pts.push([2 + 2 * Math.cos(Math.PI / 3 * i), 2 + 2 * Math.sin(Math.PI / 3 * i)].map(function (v) { return Math.round(v * 1000) / 1000; })); return { poly: pts, sides: [s, s, s, s, s, s], name: 'hexagon' }; }
    var q1 = R.int(3, 8), q2 = R.int(3, 8), q3 = R.int(4, 9), q4 = R.int(3, 8); return { poly: [[0, 4], [1, 0], [5, 0], [6, 4]], sides: [q1, q2, q3, q4], name: 'quadrilateral' };
  }
  G('g3.perimeter', function (R, ctx) {
    var kind = BL(ctx, R.pick(['rect4', 'poly', 'rect4']), R.pick(['rect2', 'poly', 'grid']), R.pick(['grid', 'square', 'mc', 'rect2'])), un = R.pick(UNITS), w = R.int(3, 9), h = R.intNot(2, 8, w), P = 2 * (w + h);
    if (kind === 'rect4' || kind === 'rect2') {
      var four = kind === 'rect4';
      return { q: 'What is the perimeter of the rectangle, in ' + un[1] + '?', viz: vz('g3-shape', { rect: [w, h], sides: four ? [w + ' ' + un[0], h + ' ' + un[0], w + ' ' + un[0], h + ' ' + un[0]] : [w + ' ' + un[0], h + ' ' + un[0], null, null] }, 'A rectangle ' + w + ' by ' + h + ' ' + un[1]), a: aInt(P), unit: un[1],
        steps: (four ? [] : ['Opposite sides of a rectangle are equal, so the unmarked sides are ' + w + ' and ' + h + '.']).concat(['Perimeter is the distance around: add all four sides.', '$' + w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + P + '$.', 'The perimeter is ' + P + ' ' + un[1] + '.']), hint: four ? 'Add all the sides.' : 'Opposite sides of a rectangle are the same length.', chk: { k: 'per', s: [w, h, w, h] } };
    }
    if (kind === 'poly') {
      var pp = polyPer(R, ctx.level), tot = U.sum(pp.sides);
      return { q: 'What is the perimeter of this ' + pp.name + ', in ' + un[1] + '?', viz: vz('g3-shape', { poly: pp.poly, sides: pp.sides.map(function (v) { return v + ' ' + un[0]; }) }, 'A ' + pp.name + ' with each side length marked'), a: aInt(tot), unit: un[1],
        steps: ['Perimeter is the distance all the way around, so add every side.', '$' + pp.sides.join(' + ') + ' = ' + tot + '$.', 'The perimeter is ' + tot + ' ' + un[1] + '.'], hint: 'Go around the shape and add each side once.', chk: { k: 'per', s: pp.sides } };
    }
    if (kind === 'grid') {
      var W = R.int(4, 7), H = R.int(3, 6), Lg = lShape(W, H, R.int(1, W - 2), R.int(1, H - 2), R.int(0, 3)), ls = sideLens(Lg.poly), tot2 = U.sum(ls);
      return { q: 'Each small square is 1 centimeter on each side. What is the perimeter of the ' + R.pick(['shape', 'figure', 'garden bed', 'patio']) + '?', viz: vz('g3-shape', { poly: Lg.poly, grid: 'squares' }, 'An L-shaped figure made of unit squares'), a: aInt(tot2), unit: 'centimeters',
        steps: ['Walk around the edge and count the unit lengths along each side (not the squares).', 'The sides are ' + ls.join(', ') + ' cm.', '$' + ls.join(' + ') + ' = ' + tot2 + '$.', 'The perimeter is ' + tot2 + ' cm. (Corner squares touch two sides, but each edge is counted once.)'], hint: 'Count edges, not squares. Go side by side.', chk: { k: 'per', s: ls } };
    }
    if (kind === 'square') { var s = R.int(3, 12); return { q: 'A square has sides that are ' + s + ' ' + un[1] + ' long. What is its perimeter?', a: aInt(4 * s), unit: un[1], steps: ['A square has 4 equal sides.', 'Perimeter: $' + s + ' + ' + s + ' + ' + s + ' + ' + s + ' = 4' + X + s + ' = ' + 4 * s + '$.', 'The perimeter is ' + 4 * s + ' ' + un[1] + '.'], hint: 'How many sides does a square have, and how long is each?', chk: { k: 'per', s: [s, s, s, s] } }; }
    return { q: 'A rectangle is ' + w + ' ' + un[0] + ' long and ' + h + ' ' + un[0] + ' wide. Which is its perimeter?', a: aMC(P + ' ' + un[0], [w * h + ' square ' + un[0], (w + h) + ' ' + un[0], (2 * w * h) + ' ' + un[0]]),
      steps: ['Perimeter is the distance around: $' + w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + P + '$ ' + un[0] + '.', w * h + ' square ' + un[0] + ' is the area (the space inside), not the perimeter.', (w + h) + ' ' + un[0] + ' only goes halfway around.'], hint: 'Perimeter is a length around the outside, measured in ' + un[1] + '.', chk: { k: 'mc' } };
  });

  G('g3.perimeter-unknown-side', function (R, ctx) {
    var kind = BL(ctx, R.pick(['poly', 'poly', 'square']), R.pick(['poly', 'rect', 'square']), R.pick(['rect', 'poly', 'rect'])), un = R.pick(UNITS);
    if (kind === 'poly') {
      var pp = polyPer(R, 2), tot = U.sum(pp.sides), hid = R.int(0, pp.sides.length - 1), miss = pp.sides[hid], known = pp.sides.filter(function (_, i) { return i !== hid; });
      if (pp.name === 'hexagon') { pp = polyPer(R, 1); tot = U.sum(pp.sides); hid = R.int(0, pp.sides.length - 1); miss = pp.sides[hid]; known = pp.sides.filter(function (_, i) { return i !== hid; }); }
      return { q: 'The perimeter of this ' + pp.name + ' is ' + tot + ' ' + un[1] + '. How long is the side marked with a question mark?', viz: vz('g3-shape', { poly: pp.poly, sides: pp.sides.map(function (v, i) { return i === hid ? '?' : v + ' ' + un[0]; }) }, 'A ' + pp.name + ' with one side marked with a question mark'), a: aInt(miss), unit: un[1],
        steps: ['Add the sides you know: $' + known.join(' + ') + ' = ' + U.sum(known) + '$.', 'All the sides together make ' + tot + ', so the missing side is $' + tot + ' - ' + U.sum(known) + ' = ' + miss + '$.', 'Check: $' + U.sum(known) + ' + ' + miss + ' = ' + tot + '$.'], hint: 'Add the sides you know, then find what is missing to make the perimeter.', chk: { k: 'perMiss', s: pp.sides, hid: hid } };
    }
    if (kind === 'square') { var s = R.int(3, 12), P = 4 * s; return { q: 'A square has a perimeter of ' + P + ' ' + un[1] + '. How long is each side?', a: aInt(s), unit: un[1], steps: ['A square has 4 equal sides, so the perimeter is 4 times one side: $4' + X + BOX + ' = ' + P + '$.', '$' + P + DV + '4 = ' + s + '$, because $4' + X + s + ' = ' + P + '$.', 'Each side is ' + s + ' ' + un[1] + '.'], hint: 'The 4 sides are equal. Share the perimeter among them.', chk: { k: 'div', t: P, d: 4 } }; }
    var l = R.int(4, 12), w = R.intNot(2, 9, l), P2 = 2 * (l + w);
    return { q: 'A rectangle has a perimeter of ' + P2 + ' ' + un[1] + '. Its length is ' + l + ' ' + un[1] + '. What is its width?', viz: vz('g3-shape', { rect: [l, w], sides: [l + ' ' + un[0], '?', null, null] }, 'A rectangle with its length marked and its width unknown'), a: aInt(w), unit: un[1],
      steps: ['The two lengths add to $' + l + ' + ' + l + ' = ' + 2 * l + '$.', 'The two widths make the rest: $' + P2 + ' - ' + 2 * l + ' = ' + 2 * w + '$.', 'The widths are equal, so each is $' + 2 * w + DV + '2 = ' + w + '$.', 'Check: $' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P2 + '$.'], hint: 'Take away both lengths first. What is left is two widths.', chk: { k: 'rectW', P: P2, l: l } };
  });

  G('g3.same-perimeter-different-area', function (R, ctx) {
    var kind = BL(ctx, R.pick(['diff', 'area']), R.pick(['diff', 'max', 'area', 'tf']), R.pick(['max', 'samearea', 'min', 'area'])), half = R.int(6, 10), P = 2 * half, un = R.pick(UNITS);
    if (kind === 'diff') {
      var dims = R.sample(U.range(1, Math.floor(half / 2)), 2).sort(function (x, y) { return x - y; }), a = dims[0], c = dims[1], b = half - a, d = half - c, A1 = a * b, A2 = c * d;
      return { q: 'Rectangle A is ' + a + ' ' + un[0] + ' by ' + b + ' ' + un[0] + '. Rectangle B is ' + c + ' ' + un[0] + ' by ' + d + ' ' + un[0] + '. Both have a perimeter of ' + P + ' ' + un[0] + '. How much more area does rectangle B have?', a: aInt(A2 - A1), unit: 'square ' + un[0],
        steps: ['Check the perimeters: $' + a + ' + ' + b + ' + ' + a + ' + ' + b + ' = ' + P + '$ and $' + c + ' + ' + d + ' + ' + c + ' + ' + d + ' = ' + P + '$. The same.', 'Area of A: $' + a + X + b + ' = ' + A1 + '$. Area of B: $' + c + X + d + ' = ' + A2 + '$.', 'B has $' + A2 + ' - ' + A1 + ' = ' + (A2 - A1) + '$ more square ' + un[0] + '. Same perimeter, different area.'], hint: 'Find each area, then subtract.', chk: { k: 'areadiff', a: a, b: b, c: c, d: d } };
    }
    if (kind === 'area') { var s1 = R.int(2, half - 2), s2 = half - s1; return { q: 'A rectangle has a perimeter of ' + P + ' ' + un[1] + '. One side is ' + s1 + ' ' + un[1] + ' long. What is its area?', a: aInt(s1 * s2), unit: 'square ' + un[0],
      steps: ['One length and one width make half of the perimeter: $' + P + DV + '2 = ' + half + '$.', 'So the other side is $' + half + ' - ' + s1 + ' = ' + s2 + '$.', 'Area: $' + s1 + X + s2 + ' = ' + s1 * s2 + '$ square ' + un[1] + '.'], hint: 'Find the missing side first. Half the perimeter is one length plus one width.', chk: { k: 'perArea', P: P, s: s1 } }; }
    if (kind === 'max' || kind === 'min') {
      var opts = U.range(1, Math.floor(half / 2)).map(function (x) { return [x, half - x]; }), best = kind === 'max' ? opts[opts.length - 1] : opts[0];
      var wr = opts.filter(function (o) { return o !== best; }).slice(-3).map(function (o) { return o[0] + ' by ' + o[1]; });
      return { q: 'All of these rectangles have a perimeter of ' + P + ' units. Which one has the ' + (kind === 'max' ? 'greatest' : 'least') + ' area?', a: aMC(best[0] + ' by ' + best[1], wr),
        steps: opts.map(function (o) { return o[0] + ' by ' + o[1] + ': area $' + o[0] + X + o[1] + ' = ' + o[0] * o[1] + '$.'; }).concat(['The ' + (kind === 'max' ? 'closer the sides are to equal, the more area' : 'longer and thinner the rectangle, the less area') + '. The answer is ' + best[0] + ' by ' + best[1] + '.']), hint: 'Find the area of each one.', chk: { k: 'mc' } };
    }
    if (kind === 'samearea') {
      var pairs = R.pick([[12, [2, 6], [3, 4]], [18, [2, 9], [3, 6]], [24, [3, 8], [4, 6]], [16, [2, 8], [4, 4]], [20, [2, 10], [4, 5]], [36, [3, 12], [4, 9]]]), r1 = pairs[1], r2 = pairs[2], p1 = 2 * (r1[0] + r1[1]), p2 = 2 * (r2[0] + r2[1]);
      return { q: 'A ' + r1[0] + ' by ' + r1[1] + ' rectangle and a ' + r2[0] + ' by ' + r2[1] + ' rectangle both have an area of ' + pairs[0] + ' square units. How much longer is the perimeter of the ' + r1[0] + ' by ' + r1[1] + ' rectangle?', a: aInt(p1 - p2), unit: 'units',
        steps: ['Perimeter of the ' + r1[0] + ' by ' + r1[1] + ': $' + r1[0] + ' + ' + r1[1] + ' + ' + r1[0] + ' + ' + r1[1] + ' = ' + p1 + '$.', 'Perimeter of the ' + r2[0] + ' by ' + r2[1] + ': $' + r2[0] + ' + ' + r2[1] + ' + ' + r2[0] + ' + ' + r2[1] + ' = ' + p2 + '$.', 'Difference: $' + p1 + ' - ' + p2 + ' = ' + (p1 - p2) + '$. Same area, different perimeter.'], hint: 'Find each perimeter, then subtract.', chk: { k: 'perdiff', r1: r1, r2: r2 } };
    }
    return { q: 'True or false: If two rectangles have the same perimeter, they must have the same area.', a: aTF(false),
      steps: ['Try two rectangles with perimeter ' + P + ': a 1 by ' + (half - 1) + ' rectangle and a ' + Math.floor(half / 2) + ' by ' + Math.ceil(half / 2) + ' rectangle.', 'Their areas are ' + (half - 1) + ' and ' + Math.floor(half / 2) * Math.ceil(half / 2) + ' square units: not the same.', 'So the statement is false.'], hint: 'Try a long, thin rectangle and one that is nearly a square.', chk: { k: 'tf', v: false } };
  });

  /* ================================================================== Graphs and Line Plots */
  var GSETS = [[['Apples', 'Pears', 'Grapes', 'Plums'], 'votes', 'Favorite fruits'], [['Soccer', 'Swim', 'Tennis', 'Track'], 'students', 'Favorite sports'], [['Mon', 'Tue', 'Wed', 'Thu'], 'books', 'Books read'], [['Red', 'Blue', 'Green', 'Yellow'], 'votes', 'Favorite colors'], [['Cats', 'Dogs', 'Fish', 'Birds'], 'pets', 'Class pets']];
  G('g3.scaled-graphs', function (R, ctx) {
    var gs = R.pick(GSETS), n = R.pick([3, 4]), cats = gs[0].slice(0, n), bar = BL(ctx, R.coin(), R.coin(), R.coin()), half = ctx.level > 1 && R.coin(), scale, vals, o;
    if (bar) { scale = R.pick([2, 5, 10]); var mxk = scale === 10 ? 9 : scale === 5 ? 8 : 10; vals = cats.map(function () { return scale * R.int(1, mxk) + (half && scale !== 5 ? scale / 2 : 0); }); if (U.uniq(vals).length < n) vals = vals.map(function (v, i) { return v + i * scale; }); var top = Math.max.apply(null, vals); o = { kind: 'bar', cats: cats, vals: vals, step: scale, max: Math.ceil(top / scale) * scale, title: gs[2], ylabel: 'Number of ' + gs[1] }; }
    else { scale = R.pick([2, 5, 10]); vals = cats.map(function () { return scale * R.int(1, 6) + (half && scale !== 5 ? scale / 2 : 0); }); if (U.uniq(vals).length < n) vals = vals.map(function (v, i) { return v + i * scale; }); o = { kind: 'picture', cats: cats, vals: vals, scale: scale, symbol: R.pick(['circle', 'star', 'square']), key: gs[1], title: gs[2] }; }
    var q2 = BL(ctx, 'read', R.pick(['read', 'more']), R.pick(['more', 'total'])), i = R.int(0, n - 1), j = R.intNot(0, n - 1, i), ans, steps = [];
    function readOne(k) { return bar ? 'The ' + cats[k] + ' bar ends at ' + vals[k] + (vals[k] % scale ? ', halfway between ' + (vals[k] - scale / 2) + ' and ' + (vals[k] + scale / 2) : '') + '.' : cats[k] + ' has ' + Math.floor(vals[k] / scale) + ' whole symbol' + (Math.floor(vals[k] / scale) === 1 ? '' : 's') + (vals[k] % scale ? ' and a half' : '') + '. Each symbol is ' + scale + ', ' + (vals[k] % scale ? 'and half a symbol is ' + scale / 2 + ', ' : '') + 'so: $' + Math.floor(vals[k] / scale) + X + scale + (vals[k] % scale ? ' + ' + scale / 2 : '') + ' = ' + vals[k] + '$.'; }
    var keyStep = bar ? 'Read the scale: each line goes up by ' + scale + '.' : 'Read the key: each symbol stands for ' + scale + ' ' + gs[1] + ', not 1.';
    var q;
    if (q2 === 'read') { ans = vals[i]; q = 'How many ' + gs[1] + ' are shown for ' + cats[i] + '?'; steps = [keyStep, readOne(i)]; }
    else if (q2 === 'more') { var hi = vals[i] >= vals[j] ? i : j, lo = hi === i ? j : i; ans = vals[hi] - vals[lo]; q = 'How many more ' + gs[1] + ' are shown for ' + cats[hi] + ' than for ' + cats[lo] + '?'; steps = [keyStep, readOne(hi), readOne(lo), 'Subtract: $' + vals[hi] + ' - ' + vals[lo] + ' = ' + ans + '$.']; }
    else { ans = vals[i] + vals[j]; q = 'How many ' + gs[1] + ' are shown for ' + cats[i] + ' and ' + cats[j] + ' together?'; steps = [keyStep, readOne(i), readOne(j), 'Add: $' + vals[i] + ' + ' + vals[j] + ' = ' + ans + '$.']; }
    return { q: q, viz: vz('g3-graph', o, (bar ? 'A bar graph' : 'A picture graph') + ' titled ' + gs[2]), a: aInt(ans), unit: gs[1], steps: steps, hint: bar ? 'Check how much each line on the scale stands for.' : 'Check the key: how many does one symbol stand for?', chk: { k: 'graph', vals: vals, i: i, j: j, q: q2 } };
  });

  G('g3.measure-half-quarter-inch', function (R, ctx) {
    var marks = BL(ctx, 2, 4, 4), inches = R.pick([5, 6]), start = ctx.level === 3 && R.chance(0.6) ? R.int(1, 2) : 0, maxQ = (inches - start) * marks - 2, k = R.int(marks + 1, maxQ);
    if (k % marks === 0) k += 1;
    var obj = R.pick([['pencil', 'pencil'], ['crayon', 'crayon'], ['worm', 'toy worm'], ['key', 'key'], ['ribbon', 'piece of ribbon'], ['ribbon', 'piece of string'], ['crayon', 'marker'], ['pencil', 'colored pencil']]), len = qPlain(k, marks), endQ = start * marks + k, end = qPlain(endQ, marks);
    var steps = ['Each inch is cut into ' + (marks === 2 ? '2 halves' : '4 quarters') + ': the long marks are whole inches, ' + (marks === 4 ? 'the middle marks are halves and the short marks are quarters.' : 'and the short marks are halves.')];
    if (start) steps.push('The ' + obj[1] + ' starts at the ' + start + ', not at 0. Its right end is at ' + end + ' inches.', 'Length = end − start: from ' + start + ' to ' + end + ' is ' + len + ' inches. (Count the inches and marks from ' + start + ' instead of from 0.)');
    else steps.push('The left end lines up with 0.', 'The right end is ' + Math.floor(k / marks) + ' whole inches and ' + (k % marks) + ' more ' + (marks === 2 ? 'half' : (k % marks === 1 ? 'quarter' : 'quarters')) + (marks === 4 && k % 4 === 2 ? ' (that is a half)' : '') + ' past 0.', 'The ' + obj[1] + ' is ' + len + ' inches long.');
    return { q: R.pick(['How long is the ' + obj[1] + ', to the nearest ' + (marks === 2 ? 'half' : 'quarter') + ' inch?', 'Measure the ' + obj[1] + ' to the nearest ' + (marks === 2 ? 'half' : 'quarter') + ' inch. How long is it?', 'What is the length of the ' + obj[1] + '? The ruler is marked in ' + (marks === 2 ? 'halves' : 'quarters') + ' of an inch.']), viz: vz('g3-ruler', { inches: inches, marks: marks, len: len, start: start, object: obj[0] === 'ribbon' ? 'ribbon' : obj[0], name: obj[1] }, 'A ruler with a ' + obj[1] + ' on it'), a: aMix(k, marks), unit: 'inches', steps: steps,
      hint: start ? 'Where does it start? Count the inches and marks from there.' : 'Count whole inches first, then the small marks past the last whole inch.', chk: { k: 'ruler', q: k, marks: marks } };
  });

  G('g3.line-plots-fractions', function (R, ctx) {
    var d = BL(ctx, 2, 4, 4), lo = R.pick([0, 1]), hi = lo + 2, slots = U.range(lo * d + 1, hi * d - 1), counts = {}, data = [], i;
    var pick = R.sample(slots, Math.min(slots.length, BL(ctx, 4, 5, 6)));
    pick.forEach(function (s) { counts[s] = R.int(1, 4); });
    var modeSlot = R.pick(pick); counts[modeSlot] = 5;
    pick.forEach(function (s) { for (var k = 0; k < counts[s]; k++) data.push(qPlain(s, d)); });
    var thing = R.pick([['leaves', 'leaf', 'Length of each leaf (inches)'], ['shells', 'shell', 'Length of each shell (inches)'], ['pencil stubs', 'pencil stub', 'Length of each pencil stub (inches)'], ['bean plants', 'bean plant', 'Height of each bean plant (inches)']]);
    var a1, a2, o = { min: lo, max: hi, d: d, data: R.shuffle(data), caption: thing[2] }, kind = BL(ctx, R.pick(['count', 'total']), R.pick(['count', 'longer', 'most', 'more']), R.pick(['longer', 'more', 'most'])), q, ans, steps;
    var s0 = R.pick(pick);
    if (kind === 'count') { ans = counts[s0]; q = 'How many ' + thing[0] + ' measured $' + mixTex(s0, d) + '$ inches?'; steps = ['Find $' + mixTex(s0, d) + '$ on the line.', 'Count the X marks above it: ' + ans + '.', 'Each X is one ' + thing[1] + ', so ' + ans + ' ' + (ans === 1 ? thing[1] : thing[0]) + ' measured $' + mixTex(s0, d) + '$ inches.']; }
    else if (kind === 'total') { ans = data.length; q = 'How many ' + thing[0] + ' were measured in all?'; steps = ['Each X stands for one ' + thing[1] + '.', 'Count every X: ' + pick.map(function (s) { return counts[s]; }).join(' + ') + ' = ' + ans + '.']; }
    else if (kind === 'longer') { var cut = lo + 1, over = pick.filter(function (s) { return s > cut * d; }); if (!over.length) { counts[hi * d - 1] = (counts[hi * d - 1] || 0); } ans = U.sum(over.map(function (s) { return counts[s]; })); q = 'How many ' + thing[0] + ' measured more than ' + cut + ' inch' + (cut === 1 ? '' : 'es') + '?'; steps = ['Look only to the right of ' + cut + ' (not at ' + cut + ' itself).', over.length ? 'Count the X marks there: ' + over.map(function (s) { return counts[s] + ' at $' + mixTex(s, d) + '$'; }).join(', ') + '.' : 'There are no X marks to the right of ' + cut + '.', 'In all: ' + ans + '.']; }
    else if (kind === 'most') { ans = null; q = 'Which length was measured most often? (Write it in inches.)'; steps = ['Find the tallest stack of X marks.', 'It has 5 X marks, above $' + mixTex(modeSlot, d) + '$.', 'So the most common length is $' + mixTex(modeSlot, d) + '$ inches.']; }
    else { var two = R.sample(pick.filter(function (s) { return s !== modeSlot; }), 1).concat([modeSlot]); a1 = two[1]; a2 = two[0]; ans = counts[a1] - counts[a2]; q = 'How many more ' + thing[0] + ' measured $' + mixTex(a1, d) + '$ inches than $' + mixTex(a2, d) + '$ inches?'; steps = ['Above $' + mixTex(a1, d) + '$ there are ' + counts[a1] + ' X marks.', 'Above $' + mixTex(a2, d) + '$ there are ' + counts[a2] + '.', 'Subtract: $' + counts[a1] + ' - ' + counts[a2] + ' = ' + ans + '$.']; }
    return { q: q, viz: vz('g3-lineplot', o, 'A line plot: ' + thing[2]), a: kind === 'most' ? aMix(modeSlot, d) : aInt(ans), unit: kind === 'most' ? 'inches' : thing[0], steps: steps, hint: 'Each X is one ' + thing[1] + '.', chk: { k: 'plot', data: data, kind: kind, s0: s0, d: d, lo: lo, pair: kind === 'more' ? [a1, a2] : null, mode: modeSlot } };
  });

  /* ================================================================== Shapes */
  var QUADS = [
    { k: 'square', name: 'square', pts: function (R) { var s = R.int(2, 4); return [[0, 0], [s, 0], [s, s], [0, s]]; } },
    { k: 'square', name: 'square', pts: function (R) { var a = R.int(1, 2), b = R.int(1, 3); return [[b, 0], [a + b, b], [a, a + b], [0, a]]; } },
    { k: 'rectangle', name: 'rectangle', pts: function (R) { var w = R.int(3, 6), h = R.intNot(2, 4, w); return [[0, 0], [w, 0], [w, h], [0, h]]; } },
    { k: 'rectangle', name: 'rectangle', pts: function () { return [[0, 1], [1, 0], [4, 3], [3, 4]]; } },
    { k: 'rhombus', name: 'rhombus', pts: function () { return [[0, 2], [3, 0], [6, 2], [3, 4]]; } },
    { k: 'rhombus', name: 'rhombus', pts: function () { return [[0, 0], [5, 0], [8, 4], [3, 4]]; } },
    { k: 'other', name: 'parallelogram', pts: function () { return [[2, 0], [6, 0], [4, 3], [0, 3]]; } },
    { k: 'other', name: 'trapezoid', pts: function () { return [[1, 0], [4, 0], [6, 3], [0, 3]]; } },
    { k: 'other', name: 'kite', pts: function () { return [[2, 0], [4, 2], [2, 5], [0, 2]]; } },
    { k: 'other', name: 'quadrilateral', pts: function () { return [[0, 0], [5, 1], [4, 4], [1, 3]]; } }
  ];
  var QWHY = { square: '4 equal sides and 4 right angles', rectangle: '4 right angles, with sides that are not all equal', rhombus: '4 equal sides, with angles that are not right angles', other: 'its sides are not all equal and it does not have 4 right angles' };
  G('g3.quadrilaterals', function (R, ctx) {
    var kind = BL(ctx, R.pick(['name', 'name', 'tf', 'right', 'desc']), R.pick(['name', 'all', 'tf', 'right', 'desc']), R.pick(['all', 'tf', 'name', 'right', 'desc'])), Q = R.pick(ctx.level === 1 ? QUADS.filter(function (x, i) { return i !== 1 && i !== 3; }) : QUADS), P = Q.pts(R), SN = R.pick(['ABCD', 'PQRS', 'WXYZ', 'EFGH', 'JKLM', 'MNOP']);
    if (kind === 'desc') {
      var D0 = R.pick([['4 equal sides and 4 right angles', 'square', 'It has 4 right angles, so it is a rectangle, and 4 equal sides, so it is a rhombus. A shape that is both is a square.'],
        ['4 right angles, with two long sides and two short sides', 'rectangle', '4 right angles make it a rectangle. The sides are not all equal, so it is not a square.'],
        ['4 equal sides, but no right angles', 'rhombus', '4 equal sides make it a rhombus. Without right angles it cannot be a square.'],
        ['4 sides that are all different lengths and no right angles', 'none of these (another quadrilateral)', 'It has 4 sides, so it is a quadrilateral, but it has neither 4 equal sides nor 4 right angles.']]), who = R.pick(NAMES);
      return { q: who + ' drew a shape with ' + D0[0] + '. What is the best name for it?', a: { t: 'mc', choices: ['square', 'rectangle', 'rhombus', 'none of these (another quadrilateral)'], v: ['square', 'rectangle', 'rhombus', 'none of these (another quadrilateral)'].indexOf(D0[1]), keep: true },
        steps: ['Use the attributes: equal sides and right angles.', D0[2], 'So the best name is: ' + D0[1] + '.'], hint: 'A rhombus needs 4 equal sides; a rectangle needs 4 right angles; a square needs both.', chk: { k: 'mc' } };
    }
    if (kind === 'right') {
      var nr = 0; P.forEach(function (p, i) { var a = P[(i + 3) % 4], b = P[(i + 1) % 4]; if ((a[0] - p[0]) * (b[0] - p[0]) + (a[1] - p[1]) * (b[1] - p[1]) === 0) nr++; });
      return { q: 'How many right angles does shape ' + SN + ' have? (A right angle is a square corner. Use the dot grid to check.)', viz: vz('g3-shape', { poly: P, grid: 'dots', sides: false }, 'A quadrilateral on a dot grid'), a: aInt(nr),
        steps: ['Check each corner: is it a square corner, like the corner of a sheet of paper?', nr === 4 ? 'All 4 corners are square corners.' : nr === 0 ? 'None of the corners is a square corner: each one is wider or narrower.' : nr + ' corners are square corners.', 'So shape ' + SN + ' has ' + nr + ' right angle' + (nr === 1 ? '' : 's') + '. ' + (nr === 4 ? 'That makes it a rectangle' + (Q.k === 'square' ? ' (and, with 4 equal sides, a square)' : '') + '.' : 'So it is not a rectangle.')],
        hint: 'Hold the corner of a sheet of paper up to each corner.', chk: { k: 'rightcount', poly: P } };
    }
    var pic = vz('g3-shape', { poly: P, grid: 'dots', right: true, ticks: true, sides: false }, 'A quadrilateral on a dot grid, with right angles and equal sides marked');
    if (kind === 'name') {
      var ch = ['square', 'rectangle', 'rhombus', 'none of these (another quadrilateral)'];
      return { q: 'What is the best name for shape ' + SN + '? Matching marks show equal sides, and small squares show right angles.', viz: pic, a: { t: 'mc', choices: ch, v: ['square', 'rectangle', 'rhombus', 'other'].indexOf(Q.k), keep: true },
        steps: ['Check the attributes, not how the shape is turned.', 'This shape has ' + QWHY[Q.k] + '.', Q.k === 'other' ? 'So it is a quadrilateral, but not a square, rectangle or rhombus' + (Q.name !== 'quadrilateral' ? ' (it is called a ' + Q.name + ')' : '') + '.' : 'So the best name is ' + Q.name + (Q.k === 'square' ? '. A square is also a rectangle and a rhombus, but "square" says the most.' : '.')],
        hint: 'Are all 4 sides equal? Are all 4 angles right angles?', chk: { k: 'quad', poly: P, kind: Q.k } };
    }
    if (kind === 'all') {
      var v = Q.k === 'square' ? [0, 1, 2, 3] : Q.k === 'rectangle' ? [0, 1] : Q.k === 'rhombus' ? [0, 2] : [0];
      return { q: 'Choose every name that fits shape ' + SN + '.', viz: pic, a: { t: 'mc', choices: ['quadrilateral', 'rectangle', 'rhombus', 'square'], v: v, keep: true },
        steps: ['It has 4 sides, so it is a quadrilateral.', Q.k === 'square' ? 'It has 4 right angles, so it is a rectangle. It has 4 equal sides, so it is a rhombus. It has both, so it is a square.' : Q.k === 'rectangle' ? 'It has 4 right angles, so it is a rectangle. Its sides are not all equal, so it is not a rhombus or a square.' : Q.k === 'rhombus' ? 'It has 4 equal sides, so it is a rhombus. It has no right angles, so it is not a rectangle or a square.' : 'It does not have 4 right angles or 4 equal sides, so the only name that fits is quadrilateral.'],
        hint: 'Check each name: what does a shape need to have that name?', chk: { k: 'quadall', poly: P, kind: Q.k } };
    }
    var st = R.pick([['Every square is a rectangle.', true, 'A rectangle needs 4 right angles. Every square has 4 right angles.'], ['Every rectangle is a square.', false, 'A rectangle can have two long sides and two short sides, so it is not always a square.'], ['Every square is a rhombus.', true, 'A rhombus needs 4 equal sides. Every square has 4 equal sides.'], ['Every rhombus is a square.', false, 'A rhombus can have slanted corners that are not right angles.'], ['A square turned on its corner is no longer a square.', false, 'Turning a shape does not change its sides or angles. It is still a square.'], ['Every rectangle is a quadrilateral.', true, 'A rectangle has 4 sides, so it is a quadrilateral.'], ['A triangle is a quadrilateral.', false, 'A triangle has 3 sides. A quadrilateral has 4.']]);
    return { q: 'True or false: ' + st[0], a: aTF(st[1]), steps: [st[2], 'So the statement is ' + (st[1] ? 'true' : 'false') + '.'], hint: 'What does each name require?', chk: { k: 'tfquad', s: st[0], v: st[1] } };
  });

  G('g3.partition-shapes', function (R, ctx) {
    var kind = BL(ctx, R.pick(['each', 'each', 'shaded', 'text']), R.pick(['shaded', 'mix', 'each', 'text']), R.pick(['mix', 'text', 'shaded', 'uneq', 'text', 'shaded'])), d, n, o;
    if (kind === 'mix') { var sh = R.int(1, 2); return { q: 'This square is split into 4 parts with equal area: two small rectangles and two triangles. True or false: the shaded part' + (sh > 1 ? 's are' : ' is') + ' $' + F(sh, 4) + '$ of the area of the square.', viz: vz('g3-frac', { model: 'rect', d: 4, n: 0, shade: sh === 1 ? [R.pick([0, 2])] : [0, 2], pattern: 'mix4', square: true }, 'A square split into two small rectangles and two triangles, with ' + sh + ' shaded'), a: aTF(true),
      steps: ['The left half is cut into two rectangles; each is half of a half, so $' + F(1, 4) + '$ of the square.', 'The right half is cut by a diagonal into two triangles; each is also half of a half, so $' + F(1, 4) + '$.', 'Equal parts need equal area, not the same shape. So ' + sh + ' of these parts ' + (sh > 1 ? 'are' : 'is') + ' $' + F(sh, 4) + '$, and the statement is true.'], hint: 'Compare each part with half of the square.', chk: { k: 'tf', v: true } }; }
    if (kind === 'uneq') return { q: 'True or false: each part of this bar is $' + F(1, 3) + '$ of its area.', viz: vz('g3-frac', { model: 'bar', d: 3, n: 1, unequal: true }, 'A bar cut into 3 parts of different sizes'), a: aTF(false), steps: ['The 3 parts are not the same size: the middle one is much bigger.', 'A third must be one of 3 parts with equal area, so these parts are not thirds.', 'The statement is false.'], hint: 'Are the parts the same size?', chk: { k: 'tf', v: false } };
    if (kind === 'text' && ctx.level === 3 && R.coin()) { d = R.pick([3, 4, 5, 6, 8, 10, 12]); var nn = R.int(2, d - 1), thg = R.pick(['hexagon', 'square rug', 'round pie', 'garden', 'paper star', 'flag', 'pizza', 'quilt', 'sheet of paper', 'park', 'cake', 'tile floor']);
      return { q: 'A ' + thg + ' is split into ' + d + ' parts with equal area. ' + R.pick(NAMES) + ' paints ' + nn + ' of the parts. What fraction of the whole area is painted?', a: aFrac(nn, d),
        steps: ['The whole area is shared equally into ' + d + ' parts, so each part is $' + F(1, d) + '$ of the area, whatever its shape.', nn + ' parts are painted: $' + F(nn, d) + '$ of the area.'], hint: 'Each part is one ' + (d === 2 ? 'half' : d === 3 ? 'third' : d === 4 ? 'fourth' : d + 'th') + '. Count the painted parts.', chk: { k: 'frac', n: nn, d: d } }; }
    if (kind === 'text') { d = R.pick([3, 4, 6, 8, 10, 5, 12]); return { q: 'A ' + R.pick(['hexagon', 'square rug', 'round pie', 'garden', 'paper star', 'flag', 'pizza', 'quilt', 'park', 'cake']) + ' is split into ' + d + ' parts with equal area. What fraction of the whole area is one part?', a: aFrac(1, d), steps: ['The whole area is shared equally into ' + d + ' parts.', 'Each part is $' + F(1, d) + '$ of the area, whatever its shape.'], hint: 'How many equal parts?', chk: { k: 'frac', n: 1, d: d } }; }
    d = R.pick([2, 3, 4, 6, 8]); n = kind === 'each' ? 1 : R.int(2, d - 1 > 1 ? d - 1 : 2);
    if (d === 2) n = 1;
    var pics = fracPic(R, d, n, { model: 'rect' }), thing = R.pick(['rectangle', 'flag', 'garden', 'sheet cake', 'quilt', 'window', 'poster', 'tablecloth', 'card', 'field']);
    return { q: 'The ' + thing + ' is split into ' + d + ' parts with equal area. What fraction of its area is shaded?', viz: pics, a: aFrac(n, d),
      steps: ['There are ' + d + ' parts with equal area, so each part is $' + F(1, d) + '$ of the area.', n + ' part' + (n > 1 ? 's are' : ' is') + ' shaded.', 'So $' + F(n, d) + '$ of the area is shaded.'], hint: 'How many equal parts? How many shaded?', chk: { k: 'frac', n: n, d: d } };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof globalThis !== 'undefined' ? globalThis.MathLadder : undefined));
