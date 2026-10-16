/* Math Ladder problem generators: Grade 4 (course key g4). One generator for every topic in data/math/topics/g4.json.
   Built from source parts (one per unit) by the course builder's build script; every answer is computed from the
   numbers drawn here, and a separate test recomputes each answer independently.
   Levels: 1 is the gentlest (learning), 2 for reviews, checkpoints and placement, 3 for later reviews.
   Visuals used in problems: g4-geo and g4-lineplot (static/math/viz/g4.js), numberline (basic.js). */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, U = ML.util, Q = ML.Q;
  var M = Math;
  function L(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function C(n) { return T.commas(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function num(v, form) { var a = { t: 'num', v: String(v) }; if (form) a.form = form; return a; }
  function qv(x) { // a value as a plain answer string, mixed numbers kept mixed: "3 3/4", "3/4", "5"
    var q = Q.from(x); if (q.isInt()) return q.toString();
    var a = q.abs(); if (a.gt(1)) { var w = a.floor(); return (q.sign() < 0 ? '-' : '') + w.toString() + ' ' + a.sub(w).toString(); }
    return q.toString();
  }
  function fq(n, d) { return '\\dfrac{' + n + '}{' + d + '}'; }         // a fraction exactly as written (full size, easier to read)
  function mx(w, n, d) { return (w ? String(w) : '') + (n ? fq(n, d) : (w ? '' : '0')); } // a mixed number as written
  function qt(x) { return Q.from(x).toMixedTex().replace(/\\frac/g, '\\dfrac'); } // a value as TeX, mixed when above 1
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function mcOf(correct, wrongs) { return U.mc(correct, wrongs, 4); }   // correct first; makeProblem shuffles
  var SYM = ['$<$', '$>$', '$=$'];
  function cmp(a, b) { var x = Q.from(a), y = Q.from(b); return x.lt(y) ? 0 : x.gt(y) ? 1 : 2; }
  function symMc(a, b) { return mcKeep(SYM.slice(), cmp(a, b)); }
  function symTex(i) { return ['<', '>', '='][i]; }
  var NAMES = ['Ava', 'Ben', 'Carlos', 'Dina', 'Eli', 'Fatima', 'Grace', 'Hiro', 'Imani', 'Jack', 'Kai', 'Lena', 'Mateo', 'Nia', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sam', 'Tara', 'Uma', 'Victor', 'Wen', 'Yusuf', 'Zoe'];
  function names(R, k) { return R.sample(NAMES, k || 2); }
  var PL = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
  var PL1 = ['one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million'];
  function pn(i, k) { return k === 1 ? PL1[i] : PL[i]; }
  function dig(n) { return String(n).split('').reverse().map(Number); } // ones first
  function pow10(k) { return M.pow(10, k); }
  var ORD = ['', '', 'half', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
  var ORD10 = { 20: 'twentieth', 30: 'thirtieth', 40: 'fortieth', 50: 'fiftieth', 60: 'sixtieth', 70: 'seventieth', 80: 'eightieth', 90: 'ninetieth', 100: 'hundredth' };
  function dn(d, k) { // the name of the pieces: dn(8) "eighths", dn(8, 1) "eighth", dn(24) "twenty-fourths"
    var one = d < 20 ? ORD[d] : ORD10[d] || (U.words(d - d % 10) + '-' + ORD[d % 10]);
    if (k === 1) return one;
    return d === 2 ? 'halves' : one + 's';
  }
  function vr(n, d) { // a value as written in fourth grade, not reduced: "6/8", "1 3/6", "2"
    if (n % d === 0) return String(n / d);
    return n > d ? M.floor(n / d) + ' ' + (n % d) + '/' + d : n + '/' + d;
  }
  function mr(n, d) { // the same as TeX: \frac{6}{8}, 1\frac{3}{6}, 2
    if (n % d === 0) return String(n / d);
    return n > d ? M.floor(n / d) + fq(n % d, d) : fq(n, d);
  }
  function gcd(a, b) { return U.gcd(a, b); }
  function lowest(n, d) { return gcd(n, d) === 1; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  /* ---------- worked steps for the column algorithms (shared by several topics) */
  function addSteps(a, b) {
    var A = dig(a), B = dig(b), n = M.max(A.length, B.length), c = 0;
    var out = ['Line up the digits by place value. Add one place at a time, starting with the ones.'];
    for (var i = 0; i < n; i++) {
      var x = i < A.length ? A[i] : 0, y = i < B.length ? B[i] : 0, s = x + y + c, terms = [];
      if (i < A.length) terms.push(x); if (i < B.length) terms.push(y); if (c) terms.push(c);
      var t = cap(PL[i]) + ': ' + (terms.length > 1 ? '$' + terms.join(' + ') + ' = ' + s + '$' + (c ? ' (with the 1 you carried)' : '') : 'only ' + s + ' here') + '.';
      if (s >= 10 && i < n - 1) t += ' Write ' + (s % 10) + ' and carry 1 to the ' + PL[i + 1] + '.';
      else if (s >= 10) t += ' Write ' + s + ': the 1 is ' + pn(i + 1, 1) + '.';
      else t += ' Write ' + s + '.';
      out.push(t); c = s >= 10 ? 1 : 0;
    }
    out.push('So $' + C(a) + ' + ' + C(b) + ' = ' + C(a + b) + '$.');
    return out;
  }
  function subSteps(a, b, noCheck) {
    var A = dig(a), B = dig(b), n = A.length, Tt = A.slice(), lr = String(a - b).length;
    var out = ['Line up the digits by place value. Subtract one place at a time, starting with the ones.'];
    for (var i = 0; i < n; i++) {
      var y = i < B.length ? B[i] : 0, pre = '';
      if (Tt[i] < y) {
        var j = i + 1; while (Tt[j] === 0) j++;
        var trades = [], zeros = [];
        for (var z = i + 1; z < j; z++) zeros.push(PL[z]);
        for (var k = j; k > i; k--) { Tt[k] -= 1; Tt[k - 1] += 10; trades.push('1 ' + PL1[k] + ' for 10 ' + PL[k - 1]); }
        pre = 'Not enough ' + PL[i] + ' to take away ' + y + '. ' + (zeros.length ? 'The ' + U.list(zeros) + (zeros.length > 1 ? ' are' : ' is') + ' 0, so go to the ' + PL[j] + '. ' : '') + 'Trade ' + U.list(trades) + '. ';
      }
      var d = Tt[i] - y;
      if (i >= lr && i > 0) { out.push(cap(PL[i]) + ': ' + pre + '$' + Tt[i] + ' - ' + y + ' = 0$, and a 0 in front is not written.'); continue; }
      if (i >= B.length && !pre) out.push(cap(PL[i]) + ': nothing to take away, so write ' + Tt[i] + '.');
      else out.push(cap(PL[i]) + ': ' + pre + '$' + Tt[i] + ' - ' + y + ' = ' + d + '$.');
    }
    out.push('So $' + C(a) + ' - ' + C(b) + ' = ' + C(a - b) + '$.' + (noCheck ? '' : ' Check by adding: $' + C(a - b) + ' + ' + C(b) + ' = ' + C(a) + '$.'));
    return out;
  }
  function mulSteps(a, b) {
    var A = dig(a), c = 0, out = ['Multiply each place by ' + b + ', starting with the ones. Add the carried amount after you multiply.'];
    for (var i = 0; i < A.length; i++) {
      var p0 = A[i] * b, p = p0 + c, last = i === A.length - 1;
      var t = cap(PL[i]) + ': $' + A[i] + ' \\times ' + b + ' = ' + p0 + '$' + (c ? ', plus the ' + c + ' carried makes ' + p : '') + '.';
      if (last) t += ' Write ' + p + '.';
      else if (p >= 10) t += ' Write ' + (p % 10) + ' and carry ' + M.floor(p / 10) + ' to the ' + PL[i + 1] + '.';
      else t += ' Write ' + p + '.';
      out.push(t); c = M.floor(p / 10);
    }
    out.push('So $' + C(a) + ' \\times ' + b + ' = ' + C(a * b) + '$.');
    return out;
  }
  function ldSteps(n, d) { // long division, one step per digit of the quotient
    var D = String(n).split('').map(Number), Ln = D.length, s = 0, pre = D[0], out = [], rem = 0;
    while (pre < d) { s++; pre = pre * 10 + D[s]; }
    if (s > 0) out.push('The first digit, ' + D[0] + ', is less than ' + d + ', so start with ' + pre + ' ' + PL[Ln - 1 - s] + '.');
    for (var k = s; k < Ln; k++) {
      var part = k === s ? pre : rem * 10 + D[k], qd = M.floor(part / d), pr = qd * d, r = part - pr, p = Ln - 1 - k;
      var t = cap(PL[p]) + ': $' + part + ' \\div ' + d + '$ gives ' + qd + (qd ? '' : ' (too few to share, so write 0 in the ' + PL[p] + ' place)') + '. $' + qd + ' \\times ' + d + ' = ' + pr + '$ and $' + part + ' - ' + pr + ' = ' + r + '$.';
      if (k < Ln - 1) t += ' Bring down the ' + D[k + 1] + ' to make ' + (r * 10 + D[k + 1]) + '.';
      out.push(t); rem = r;
    }
    var Qt = M.floor(n / d), Rr = n % d;
    out.push('So $' + C(n) + ' \\div ' + d + ' = ' + C(Qt) + '$' + (Rr ? ' R ' + Rr : '') + '. Check: $' + C(Qt) + ' \\times ' + d + (Rr ? ' + ' + Rr : '') + ' = ' + C(n) + '$.');
    return out;
  }
  function qrSpec(q, r) { return { t: 'multi', parts: [{ label: 'Quotient', a: num(q) }, { label: 'Remainder', a: num(r) }] }; }

  /* a number with nd digits; zeroP is the chance that a non-leading digit is 0 */
  function makeNum(R, nd, zeroP, avoid) {
    for (var t = 0; t < 50; t++) {
      var s = String(R.int(1, 9));
      for (var i = 1; i < nd; i++) s += R.chance(zeroP) ? '0' : String(R.int(1, 9));
      var v = +s; if (!avoid || !avoid(v)) return v;
    }
    return +s;
  }

  /* ================================================================ unit: place value */

  G('g4.ten-times-place', function (R, ctx) {
    var kind = R.pick(L(ctx, ['times', 'tens', 'value', 'times'], ['times', 'tens', 'value', 'missing'], ['times', 'tens', 'value', 'missing']));
    if (kind === 'times') {
      var gap = L(ctx, 1, R.pick([1, 1, 2]), R.pick([1, 2, 3])), nd = L(ctx, 4, R.pick([4, 5]), R.pick([5, 6]));
      var d = R.int(2, 9), lo = R.int(0, nd - 1 - gap), hi = lo + gap, ds = [];
      for (var i = 0; i < nd; i++) ds.push(i === hi || i === lo ? d : R.intNot(i === nd - 1 ? 1 : 0, 9, d));
      var N = +ds.slice().reverse().join(''), vH = d * pow10(hi), vL = d * pow10(lo), f = pow10(gap);
      return {
        q: 'The digit ' + d + ' appears twice in $' + C(N) + '$. How many times as much is the ' + d + ' on the left worth as the ' + d + ' on the right?',
        a: num(f),
        steps: ['The ' + d + ' on the left is in the ' + PL[hi] + ' place, so it is worth $' + C(vH) + '$.',
          'The ' + d + ' on the right is in the ' + PL[lo] + ' place, so it is worth $' + C(vL) + '$.',
          gap === 1 ? 'It is one place to the left, and each place is worth 10 times the place to its right: $' + C(vL) + ' \\times 10 = ' + C(vH) + '$.' : 'It is ' + gap + ' places to the left. Each place multiplies by 10: $' + C(vL) + ' \\times ' + C(f) + ' = ' + C(vH) + '$.',
          'So the left ' + d + ' is worth <b>' + C(f) + '</b> times as much.'],
        hint: 'Find the value of each ' + d + ', then ask what you multiply the smaller value by to get the larger one.'
      };
    }
    if (kind === 'tens') {
      var sp = L(ctx, 1, R.pick([1, 2]), R.pick([1, 2])), u = R.int(2, 9);
      var cnt = L(ctx, R.pick([u * 10, R.int(11, 99)]), R.pick([u * 10, u * 100, R.int(11, 99)]), R.pick([R.int(101, 999), R.int(11, 99) * 10]));
      var Nn = cnt * pow10(sp), lead = M.floor(cnt / 10);
      return {
        q: 'How many ' + PL[sp] + ' are in $' + C(Nn) + '$?',
        a: num(cnt),
        steps: ['One ' + PL1[sp] + ' is $' + C(pow10(sp)) + '$, and one ' + PL1[sp + 1] + ' is 10 ' + PL[sp] + '.',
          cnt % 10 === 0 ? '$' + C(Nn) + '$ is ' + C(lead) + ' ' + pn(sp + 1, lead) + ', and each of those is 10 ' + PL[sp] + ': $' + C(lead) + ' \\times 10 = ' + C(cnt) + '$ ' + PL[sp] + '.' : 'Every place from the ' + PL[sp] + ' up counts ' + PL[sp] + ': read $' + C(Nn) + '$ without its last ' + (sp === 1 ? 'digit' : sp + ' digits') + ' to get ' + C(cnt) + ' ' + PL[sp] + '.',
          'Check: $' + C(cnt) + ' \\times ' + C(pow10(sp)) + ' = ' + C(Nn) + '$. There are <b>' + C(cnt) + '</b> ' + PL[sp] + ' in $' + C(Nn) + '$, not just ' + String(Nn)[0] + '.'],
        hint: 'One ' + PL1[sp + 1] + ' is 10 ' + PL[sp] + '.'
      };
    }
    if (kind === 'value') {
      var nd2 = L(ctx, 4, R.pick([5, 6]), R.pick([6, 7])), pos = R.int(L(ctx, 1, 2, 3), nd2 - 1), dd = R.int(2, 9), ds2 = [];
      for (var j = 0; j < nd2; j++) ds2.push(j === pos ? dd : R.intNot(j === nd2 - 1 ? 1 : 0, 9, dd));
      var N2 = +ds2.slice().reverse().join(''), val = dd * pow10(pos);
      return {
        q: 'What is the value of the digit ' + dd + ' in $' + C(N2) + '$?',
        a: num(val),
        steps: ['Count places from the right: ones, tens, hundreds, thousands, …',
          'The ' + dd + ' is in the ' + PL[pos] + ' place.',
          'Its value is $' + dd + ' \\times ' + C(pow10(pos)) + ' = ' + C(val) + '$.'],
        hint: 'Which place is the ' + dd + ' in? Then multiply by that place\'s value.'
      };
    }
    // missing factor or product with 10
    var base = R.int(2, 9) * pow10(R.int(0, L(ctx, 1, 2, 3))), prod = base * 10, form = R.int(0, 2);
    if (form === 0) return {
      q: 'Find the product: $' + C(base) + ' \\times 10 = \\,?$', a: num(prod),
      steps: ['Multiplying by 10 moves every digit one place to the left.', 'The ' + dig(base)[dig(base).length - 1] + ' moves from the ' + PL[dig(base).length - 1] + ' place to the ' + PL[dig(base).length] + ' place: $' + C(base) + ' \\times 10 = ' + C(prod) + '$.'],
      hint: 'Each digit moves one place to the left.'
    };
    if (form === 1) return {
      q: 'What number times 10 makes $' + C(prod) + '$?', a: num(base),
      steps: ['Multiplying by 10 moves each digit one place left, so go back one place to the right.', '$' + C(base) + ' \\times 10 = ' + C(prod) + '$, so the number is <b>' + C(base) + '</b>.'],
      hint: 'Undo multiplying by 10: move each digit one place to the right.'
    };
    return {
      q: '$' + C(prod) + '$ is 10 times as much as what number?', a: num(base),
      steps: ['"10 times as much" means multiply by 10.', 'Find the number that becomes $' + C(prod) + '$ when its digits move one place left: $' + C(base) + '$.', 'Check: $' + C(base) + ' \\times 10 = ' + C(prod) + '$.'],
      hint: 'What times 10 makes $' + C(prod) + '$?'
    };
  });

  G('g4.large-numbers', function (R, ctx) {
    var nd = L(ctx, R.pick([4, 5]), R.pick([5, 6]), R.pick([6, 6, 7])), zp = L(ctx, 0.25, 0.4, 0.5);
    var N = nd === 7 ? 1000000 : makeNum(R, nd, zp, function (v) { return v % 1000 === 0 && nd > 4; });
    if (nd === 7 && R.coin()) { nd = 6; N = makeNum(R, 6, 0.55); }
    var kind = R.pick(L(ctx, ['w2d', 'e2d', 'd2w', 'miss'], ['w2d', 'w2d', 'e2d', 'd2w', 'miss'], ['w2d', 'e2d', 'd2w', 'miss']));
    if (N === 1000000) kind = 'w2d';
    var parts = dig(N).map(function (d, i) { return d * pow10(i); }).filter(function (v) { return v; }).reverse();
    var thou = M.floor(N / 1000), ones = N % 1000, w = U.words(N);
    function periodSteps() {
      var s = [];
      if (N >= 1000000) return ['One million is written $1,000,000$: a 1 and six zeros.'];
      if (thou) s.push('The thousands period: ' + U.words(thou) + ' thousand, so write $' + thou + '$ before the comma.');
      s.push('The ones period: ' + (ones ? U.words(ones) : 'nothing') + ', so the three digits after the comma are $' + String(ones + 1000).slice(1) + '$' + (ones < 100 ? ' (zeros hold the empty places)' : '') + '.');
      return s;
    }
    if (kind === 'w2d') return {
      q: 'Write the number in digits: <i>' + w + '</i>.', a: num(N),
      steps: periodSteps().concat(['So the number is $' + C(N) + '$.']),
      hint: 'Write the thousands part, then a comma, then exactly three digits for the rest.'
    };
    if (kind === 'e2d') return {
      q: 'Write the number in standard form: $' + parts.map(C).join(' + ') + '$', a: num(N),
      steps: ['Put each value in its place, with 0 in any place that is missing.'].concat(parts.map(function (v) { var k = String(v).length - 1; return '$' + C(v) + '$ is ' + String(v)[0] + ' in the ' + PL[k] + ' place.'; })).concat(['So the number is $' + C(N) + '$.']),
      hint: 'Which places have no value in the sum? Those get a 0.'
    };
    if (kind === 'miss') {
      var mi = R.int(0, parts.length - 1), miss = parts[mi], shown = parts.map(function (v, i) { return i === mi ? '\\,?\\,' : C(v); });
      if (parts.length < 2) { shown = ['\\,?\\,']; }
      return {
        q: 'Find the missing value: $' + C(N) + ' = ' + shown.join(' + ') + '$', a: num(miss),
        steps: ['Write $' + C(N) + '$ in expanded form: $' + parts.map(C).join(' + ') + '$.', 'The missing part is $' + C(miss) + '$.'],
        hint: 'Expand $' + C(N) + '$ place by place and compare.'
      };
    }
    // digits to words: mc with zero mistakes
    var s = String(N), wrongs = [];
    var zi = []; for (var i = 1; i < s.length; i++) if (s[i] === '0') zi.push(i);
    if (zi.length) wrongs.push(+(s.slice(0, zi[0]) + s.slice(zi[0] + 1)));
    if (N < 100000) wrongs.push(+(s.slice(0, 1) + '0' + s.slice(1)));
    wrongs.push(+(s.slice(0, -1) + '0' + s.slice(-1)) || N * 10);
    if (N % 1000 !== 0) wrongs.push(thou * 1000 + (ones % 100) * 10 + M.floor(ones / 100) % 10);
    wrongs.push(N + pow10(R.int(0, s.length - 2)) * R.pick([1, 2]));
    wrongs = U.uniq(wrongs.filter(function (v) { return v !== N && v > 0 && v < 10000000; })).slice(0, 3);
    return {
      q: 'Which words name $' + C(N) + '$?',
      a: mcOf(U.words(N), wrongs.map(function (v) { return U.words(v); })),
      steps: periodSteps().map(function (t) { return t.replace('so write', 'which is').replace('so the three digits after the comma are', 'shown by'); }).concat(['Read it as <i>' + w + '</i>. (The word "and" is saved for decimals.)']),
      hint: 'Read the part before the comma, say "thousand", then read the last three digits.'
    };
  });

  G('g4.compare-large-numbers', function (R, ctx) {
    var kind = R.pick(L(ctx, ['sym', 'sym', 'big'], ['sym', 'big', 'small'], ['sym', 'big', 'small', 'order']));
    var nd = L(ctx, R.pick([4, 5]), R.pick([5, 6]), 6);
    function near(A, deep) { // change one digit of A, deep = how far from the left
      var s = String(A).split(''), p = clamp(deep, 1, s.length - 1), d = +s[p];
      s[p] = String(R.intNot(0, 9, d)); return +s.join('');
    }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    if (kind === 'sym') {
      var A = makeNum(R, nd, 0.2), B, mode = R.int(0, 9);
      if (mode === 0) B = A; // equal
      else if (mode <= 2 && ctx.level > 1) { B = makeNum(R, nd - 1, 0.2); if (R.coin()) B = +String(B).replace(/^\d/, '9'); }
      else B = near(A, R.int(L(ctx, 1, 2, 2), nd - 1));
      if (R.coin()) { var t = A; A = B; B = t; }
      var sa = String(A), sb = String(B), i = 0, steps;
      if (sa.length !== sb.length) steps = ['$' + C(A) + '$ has ' + sa.length + ' digits and $' + C(B) + '$ has ' + sb.length + '.', 'More digits means a greater number, because its first digit is in a higher place.'];
      else if (A === B) steps = ['Every digit matches in every place.', 'The numbers are equal.'];
      else { while (sa[i] === sb[i]) i++; var p = sa.length - 1 - i;
        steps = ['Both numbers have ' + sa.length + ' digits, so compare from the greatest place.', i ? 'The digits match until the ' + PL[p] + ' place.' : 'Look at the ' + PL[p] + ' place first.', 'In the ' + PL[p] + ' place, ' + sa[i] + ' ' + (sa[i] < sb[i] ? 'is less than' : 'is greater than') + ' ' + sb[i] + '.']; }
      var k = cmp(A, B);
      steps.push('So $' + C(A) + ' ' + symTex(k) + ' ' + C(B) + '$.');
      return { q: 'Which sign makes this true? $' + C(A) + ' \\;\\square\\; ' + C(B) + '$', a: symMc(A, B), steps: steps, hint: 'Count the digits first. If they match, compare place by place from the left.' };
    }
    // greatest / least / order among four close numbers
    var base = makeNum(R, nd, 0.15), set = [base], tries = 0;
    while (set.length < 4 && tries++ < 60) { var v = near(set[R.int(0, set.length - 1)], R.int(1, nd - 1)); if (set.indexOf(v) < 0 && String(v).length === nd) set.push(v); }
    while (set.length < 4) set.push(set[set.length - 1] + 1);
    var sorted = set.slice().sort(function (x, y) { return x - y; });
    if (kind === 'order') {
      var right = sorted.map(C).join(',\\ '), sh = [];
      for (var z = 0; z < 6 && sh.length < 3; z++) { var o = R.shuffle(sorted); var t2 = o.map(C).join(',\\ '); if (t2 !== right && sh.indexOf(t2) < 0) sh.push(t2); }
      return {
        q: 'Which list is in order from least to greatest?',
        a: mcOf('$' + right + '$', sh.map(function (x) { return '$' + x + '$'; })),
        steps: ['All four numbers have ' + nd + ' digits, so compare place by place from the left.', 'From least to greatest: $' + right + '$.'],
        hint: 'Find the least number first: compare the greatest places.'
      };
    }
    var want = kind === 'big' ? sorted[3] : sorted[0];
    return {
      q: 'Which number is ' + (kind === 'big' ? 'greatest' : 'least') + '?',
      a: mcOf('$' + C(want) + '$', set.filter(function (x) { return x !== want; }).map(function (x) { return '$' + C(x) + '$'; })),
      steps: ['All the numbers have ' + nd + ' digits, so compare them place by place from the left.', 'In order from least to greatest: $' + sorted.map(C).join(',\\ ') + '$.', 'The ' + (kind === 'big' ? 'greatest' : 'least') + ' is $' + C(want) + '$.'],
      hint: 'Look at the first place where the digits are different.'
    };
  });

  G('g4.round-any-place', function (R, ctx) {
    var nd = L(ctx, R.pick([3, 4]), R.pick([4, 5, 6]), R.pick([5, 6])), p = R.int(1, M.min(nd - 1, L(ctx, 2, 4, 5)));
    var unit = pow10(p), N, special = ctx.level === 3 ? R.pick(['nine', 'half', 'plain']) : ctx.level === 2 && R.chance(0.25) ? 'half' : 'plain';
    for (var t = 0; t < 40; t++) {
      N = makeNum(R, nd, 0.2);
      if (special === 'nine') { var s = String(N).split(''); s[nd - 1 - p] = '9'; s[nd - p] = String(R.int(5, 9)); N = +s.join(''); }
      if (special === 'half') { N = M.floor(N / unit) * unit + unit / 2; }
      if (N % unit !== 0 && String(N).length === nd) break;
    }
    var lower = M.floor(N / unit) * unit, upper = lower + unit, next = M.floor(N / (unit / 10)) % 10, ans = next >= 5 ? upper : lower;
    var kind = ctx.level >= 2 && R.chance(0.25) ? 'which' : 'round';
    var pname = PL1[p];
    if (kind === 'which') {
      var Tg = ans, h = unit / 2, ok = Tg - h + R.int(0, unit - 1), w1 = Tg - h - R.int(1, M.max(1, h / 5)), w2 = Tg + h + R.int(0, M.max(1, h / 5)), w3 = Tg + unit + R.int(-h + 1, h - 1);
      if (Tg - h <= 0) { w1 = Tg + 2 * unit; }
      return {
        q: 'Which number rounds to $' + C(Tg) + '$ when you round to the nearest ' + pname + '?',
        a: mcOf('$' + C(ok) + '$', ['$' + C(w1) + '$', '$' + C(w2) + '$', '$' + C(w3) + '$']),
        steps: ['Numbers that round to $' + C(Tg) + '$ are closer to it than to the ' + PL[p] + ' on either side.', 'That means from $' + C(Tg - h) + '$ up to (but not including) $' + C(Tg + h) + '$.', '$' + C(ok) + '$ is in that range, so it rounds to $' + C(Tg) + '$.'],
        hint: 'Halfway marks: $' + C(Tg - h) + '$ and $' + C(Tg + h) + '$.'
      };
    }
    var pr = {
      q: 'Round $' + C(N) + '$ to the nearest ' + pname + '.', a: num(ans),
      steps: ['$' + C(N) + '$ is between $' + C(lower) + '$ and $' + C(upper) + '$.',
        'Look at the digit just to the right of the ' + PL[p] + ' place (the ' + PL1[p - 1] + 's digit): it is ' + next + '.',
        next >= 5 ? next + ' is 5 or more, so round up to $' + C(upper) + '$.' + (special === 'nine' ? ' Adding 1 to the ' + PL[p] + ' digit 9 makes 10, so it carries into the next place.' : '') + (special === 'half' ? ' ($' + C(N) + '$ is exactly halfway; halfway rounds up.)' : '') : next + ' is less than 5, so round down to $' + C(lower) + '$.',
        'Every digit to the right of the ' + PL[p] + ' place becomes 0. The answer is $' + C(ans) + '$.'],
      hint: 'Which two ' + PL[p] + ' is it between? Look at the digit just to the right.'
    };
    if (ctx.level === 1) pr.viz = { name: 'numberline', opts: { min: lower, max: upper, step: unit / 2, sub: 5, labels: 'whole', points: [{ v: N, label: '', color: 'red', drag: false }], value: true, controls: false, label: 'A number line from ' + lower + ' to ' + upper + ' with ' + N + ' marked' } };
    return pr;
  });

  G('g4.add-subtract-algorithm', function (R, ctx) {
    var kind = R.pick(L(ctx, ['add', 'sub', 'add', 'sub'], ['add', 'sub', 'zeros', 'zeros'], ['add', 'sub', 'zeros', 'miss', 'error']));
    var nd = L(ctx, 4, R.pick([4, 5]), R.pick([5, 6]));
    function carries(a, b) { var A = dig(a), B = dig(b), c = 0, k = 0; for (var i = 0; i < M.max(A.length, B.length); i++) { var s = (A[i] || 0) + (B[i] || 0) + c; c = s >= 10 ? 1 : 0; k += c; } return k; }
    function borrows(a, b) { var A = dig(a), B = dig(b), k = 0, br = 0; for (var i = 0; i < A.length; i++) { var x = A[i] - br - (B[i] || 0); br = x < 0 ? 1 : 0; k += br; } return k; }
    var a, b, t;
    if (kind === 'add') {
      for (t = 0; t < 60; t++) { a = makeNum(R, nd, 0.1); b = makeNum(R, R.pick([nd, nd - 1]), 0.1); var cc = carries(a, b); if (cc >= 1 && cc <= L(ctx, 2, 3, 4) && a + b < 1000000) break; }
      return { q: 'Add: $' + C(a) + ' + ' + C(b) + '$', a: num(a + b), steps: addSteps(a, b), hint: 'Start with the ones. When a place adds to 10 or more, carry 1 to the next place.' };
    }
    if (kind === 'sub') {
      for (t = 0; t < 60; t++) { a = makeNum(R, nd, 0.1); b = makeNum(R, R.pick([nd, nd - 1]), 0.1); if (b >= a) continue; var bb = borrows(a, b); if (bb >= 1 && bb <= L(ctx, 2, 3, 3)) break; }
      if (b >= a) { var sw = a; a = b; b = sw; }
      if (a === b) b = M.floor(a / 2) + 3;
      return { q: 'Subtract: $' + C(a) + ' - ' + C(b) + '$', a: num(a - b), steps: subSteps(a, b), hint: 'Start with the ones. If the top digit is too small, trade 1 from the next place for 10.' };
    }
    // a top number with zeros: 6,000; 40,005; 30,200
    function zeroTop() {
      var s = String(R.int(2, 9));
      if (nd === 4) s += R.pick(['000', '000', '005', '010', '100', '002']);
      else if (nd === 5) s += R.pick(['0000', '0005', '0020', '0300', '0040', '0001']);
      else s += R.pick(['00000', '00005', '00400', '00050', '03000']);
      return +s;
    }
    a = zeroTop(); for (t = 0; t < 40; t++) { b = makeNum(R, nd - (R.chance(0.3) ? 1 : 0), 0.05); if (b < a && dig(b)[0] > dig(a)[0]) break; }
    if (b >= a) b = M.floor(a / 3) + 7;
    if (kind === 'zeros') return { q: 'Subtract: $' + C(a) + ' - ' + C(b) + '$', a: num(a - b), steps: subSteps(a, b), hint: 'The ones place needs more, but its neighbors are 0. Go left to the first place that is not 0 and trade down one place at a time.' };
    if (kind === 'miss') {
      var d = a - b;
      if (R.coin()) return { q: 'Find the missing number: $' + C(a) + ' - \\,?\\, = ' + C(d) + '$', a: num(b), steps: ['Taking away the missing number from $' + C(a) + '$ leaves $' + C(d) + '$, so the missing number is $' + C(a) + ' - ' + C(d) + '$.'].concat(subSteps(a, d, true).slice(1)), hint: 'Subtract $' + C(d) + '$ from $' + C(a) + '$.' };
      return { q: 'Find the missing number: $\\,?\\, + ' + C(b) + ' = ' + C(a) + '$', a: num(d), steps: ['The missing number plus $' + C(b) + '$ makes $' + C(a) + '$, so it is $' + C(a) + ' - ' + C(b) + '$.'].concat(subSteps(a, b).slice(1)), hint: 'Undo the addition: subtract.' };
    }
    // error: smaller digit from larger in each column
    var A = dig(a), B = dig(b), wr = 0;
    for (var i = 0; i < A.length; i++) wr += M.abs(A[i] - (B[i] || 0)) * pow10(i);
    if (wr === a - b) wr = a - b + 1000;
    var who = names(R, 1)[0];
    return {
      q: who + ' worked out $' + C(a) + ' - ' + C(b) + '$ and got $' + C(wr) + '$. That is not right. What is the correct difference?',
      a: num(a - b),
      steps: [who + ' subtracted the smaller digit from the larger one in each place instead of trading. A top digit that is too small needs a trade first.'].concat(subSteps(a, b).slice(1)),
      hint: 'Redo it carefully, trading where the top digit is too small. Check by adding.'
    };
  });

  /* ================================================================ unit: multiplication */

  var THINGS = [['stickers', 'sticker'], ['marbles', 'marble'], ['shells', 'shell'], ['cards', 'card'], ['stamps', 'stamp'], ['books', 'book'], ['beads', 'bead'], ['rocks', 'rock']];

  G('g4.times-as-many', function (R, ctx) {
    var k = R.int(2, L(ctx, 5, 9, 9)), m = R.int(L(ctx, 2, 3, 6), L(ctx, 9, 12, 25)), p = k * m;
    var kind = R.pick(L(ctx, ['prod', 'story', 'factor', 'story'], ['prod', 'story', 'factor', 'part', 'match', 'trap'], ['story', 'factor', 'part', 'match', 'trap']));
    var nm = names(R, 2), th = R.pick(THINGS);
    if (kind === 'prod') return {
      q: 'What number is ' + k + ' times as many as ' + m + '?', a: num(p),
      steps: ['"' + k + ' times as many as ' + m + '" means ' + k + ' groups the size of ' + m + '.', '$' + k + ' \\times ' + m + ' = ' + p + '$.'],
      hint: '"Times as many" means multiply.'
    };
    if (kind === 'story') return {
      q: nm[0] + ' has ' + m + ' ' + th[0] + '. ' + nm[1] + ' has ' + k + ' times as many ' + th[0] + ' as ' + nm[0] + '. How many ' + th[0] + ' does ' + nm[1] + ' have?', a: num(p), unit: th[0],
      steps: [nm[1] + ' has ' + k + ' groups the size of ' + nm[0] + '\'s ' + m + '.', '$' + k + ' \\times ' + m + ' = ' + p + '$. ' + nm[1] + ' has ' + p + ' ' + th[0] + '.'],
      hint: 'Draw ' + nm[0] + '\'s ' + m + ' as one bar. ' + nm[1] + '\'s amount is ' + k + ' bars that size.'
    };
    if (kind === 'factor') return {
      q: '$' + p + '$ is how many times as many as $' + m + '$?', a: num(k),
      steps: ['Ask: what times ' + m + ' makes ' + p + '?', '$' + k + ' \\times ' + m + ' = ' + p + '$, so ' + p + ' is <b>' + k + '</b> times as many as ' + m + '.'],
      hint: 'Find the missing factor: $? \\times ' + m + ' = ' + p + '$.'
    };
    if (kind === 'part') return {
      q: '$' + p + '$ is ' + k + ' times as many as what number?', a: num(m),
      steps: [p + ' is ' + k + ' equal groups of the number.', 'Split ' + p + ' into ' + k + ' equal groups: $' + p + ' \\div ' + k + ' = ' + m + '$.', 'Check: $' + k + ' \\times ' + m + ' = ' + p + '$.'],
      hint: 'What times ' + k + ' makes ' + p + '?'
    };
    if (kind === 'match') {
      if (k === m) m = m + 1, p = k * m;
      return {
        q: 'Which sentence matches the equation $' + p + ' = ' + k + ' \\times ' + m + '$?',
        a: mcOf(p + ' is ' + k + ' times as many as ' + m + '.', [p + ' is ' + k + ' more than ' + m + '.', m + ' is ' + k + ' times as many as ' + p + '.', k + ' is ' + m + ' times as many as ' + p + '.']),
        steps: ['$' + k + ' \\times ' + m + '$ is ' + k + ' groups of ' + m + ', and that makes ' + p + '.', 'So ' + p + ' is ' + k + ' times as many as ' + m + '. (It is also ' + m + ' times as many as ' + k + '.)'],
        hint: 'The product is the bigger amount. Which number is ' + k + ' groups of the other?'
      };
    }
    return {
      q: nm[0] + ' has ' + m + ' ' + th[0] + '. ' + nm[1] + ' has ' + k + ' times as many. How many ' + th[0] + ' does ' + nm[1] + ' have?',
      a: mcOf(String(p), [String(m + k), String(m * k + k), String(k * m - m)].filter(function (x) { return +x !== p && +x > 0; })),
      steps: ['"' + k + ' times as many" is not "' + k + ' more". It means ' + k + ' groups of ' + m + '.', '$' + k + ' \\times ' + m + ' = ' + p + '$, not $' + m + ' + ' + k + ' = ' + (m + k) + '$.'],
      hint: 'Times as many means multiply.'
    };
  });

  /* comparison stories: A is the larger thing, B the smaller; N = a number */
  var CMP = [
    { A: 'red ribbon', B: 'blue ribbon', u: 'centimeters', is: 'is N centimeters long', times: 'is K times as long as', more: 'is N centimeters longer than', ask: 'How long is the X?', howTimes: 'is how many times as long as', howMore: 'How much longer is the A than the B?' },
    { A: 'oak tree', B: 'pine tree', u: 'feet', is: 'is N feet tall', times: 'is K times as tall as', more: 'is N feet taller than', ask: 'How tall is the X?', howTimes: 'is how many times as tall as', howMore: 'How much taller is the A than the B?' },
    { A: 'dog', B: 'cat', u: 'pounds', is: 'weighs N pounds', times: 'weighs K times as much as', more: 'weighs N pounds more than', ask: 'How much does the X weigh?', howTimes: 'weighs how many times as much as', howMore: 'How much more does the A weigh than the B?' },
    { A: 'bike', B: 'helmet', u: 'dollars', money: true, is: 'costs N', times: 'costs K times as much as', more: 'costs N more than', ask: 'How much does the X cost?', howTimes: 'costs how many times as much as', howMore: 'How much more does the A cost than the B?' },
    { A: 'river trail', B: 'park trail', u: 'miles', is: 'is N miles long', times: 'is K times as long as', more: 'is N miles longer than', ask: 'How long is the X?', howTimes: 'is how many times as long as', howMore: 'How much longer is the A than the B?' }
  ];
  G('g4.comparison-word-problems', function (R, ctx) {
    var c = R.pick(CMP), k = R.int(2, L(ctx, 5, 9, 9)), sm = R.int(L(ctx, 3, 4, 6), L(ctx, 9, 12, 20)), big = k * sm, d = R.int(4, L(ctx, 15, 30, 60));
    var kind = R.pick(L(ctx, ['times', 'more', 'times', 'howmany'], ['times', 'more', 'small', 'howmany', 'howmore'], ['times', 'small', 'howmany', 'both', 'diff2']));
    function N(n) { return c.money ? '$\\$' + n + '$' : String(n); }
    function f(t, n) { return t.replace('N', N(n)).replace('K', String(k)).replace('X', c.A).replace(/\bA\b/, c.A).replace(/\bB\b/, c.B); }
    if (c.A === 'dog') { k = M.min(k, 6); sm = M.min(sm, 15); big = k * sm; }
    var tA = 'The ' + c.A, tB = 'The ' + c.B, unit = c.money ? '' : c.u;
    if (kind === 'times') return {
      q: tB + ' ' + f(c.is, sm) + '. ' + tA + ' ' + f(c.times) + ' the ' + c.B + '. ' + f(c.ask), a: num(big), unit: unit,
      steps: ['"' + f(c.times) + '" compares by multiplying: the ' + c.A + ' is like ' + k + ' copies of the ' + c.B + '.', '$' + k + ' \\times ' + sm + ' = ' + big + '$, so the answer is ' + N(big) + (c.money ? '' : ' ' + c.u) + '.'],
      hint: 'Is it "more than" (add) or "times as" (multiply)?'
    };
    if (kind === 'more') return {
      q: tB + ' ' + f(c.is, sm) + '. ' + tA + ' ' + f(c.more, d) + ' the ' + c.B + '. ' + f(c.ask), a: num(sm + d), unit: unit,
      steps: ['"' + (c.money ? '' : d + ' ' + c.u + ' ') + 'more than" compares by adding: the ' + c.A + ' is the ' + c.B + ' plus ' + N(d) + (c.money ? '' : ' more') + '.', '$' + sm + ' + ' + d + ' = ' + (sm + d) + '$, so the answer is ' + N(sm + d) + (c.money ? '' : ' ' + c.u) + '.'],
      hint: 'Is it "more than" (add) or "times as" (multiply)?'
    };
    if (kind === 'small') return {
      q: tA + ' ' + f(c.is, big) + '. It ' + f(c.times) + ' the ' + c.B + '. ' + c.ask.replace('X', c.B), a: num(sm), unit: unit,
      steps: [N(big) + ' is ' + k + ' equal parts, each the size of the ' + c.B + '.', 'Divide: $' + big + ' \\div ' + k + ' = ' + sm + '$.', 'Check: $' + k + ' \\times ' + sm + ' = ' + big + '$.'],
      hint: 'The bigger amount is ' + k + ' copies of the smaller one. Split it into ' + k + ' equal parts.'
    };
    if (kind === 'howmany') return {
      q: tA + ' ' + f(c.is, big) + ' and the ' + c.B + ' ' + f(c.is, sm) + '. The ' + c.A + ' ' + c.howTimes + ' the ' + c.B + '?', a: num(k),
      steps: ['Ask: what times ' + sm + ' makes ' + big + '?', '$' + big + ' \\div ' + sm + ' = ' + k + '$, so the answer is ' + k + ' times.'],
      hint: 'Divide the larger amount by the smaller one.'
    };
    if (kind === 'howmore') return {
      q: tA + ' ' + f(c.is, big) + ' and the ' + c.B + ' ' + f(c.is, sm) + '. ' + f(c.howMore), a: num(big - sm), unit: unit,
      steps: ['"How much more" compares by subtracting.', '$' + big + ' - ' + sm + ' = ' + (big - sm) + '$.'],
      hint: '"How much more" means find the difference.'
    };
    if (kind === 'both') return {
      q: tB + ' ' + f(c.is, sm) + '. ' + tA + ' ' + f(c.times) + ' the ' + c.B + '. What is the total of the two, in ' + c.u + '?', a: num(big + sm), unit: unit,
      steps: ['First the ' + c.A + ': $' + k + ' \\times ' + sm + ' = ' + big + '$.', 'Then the total: $' + big + ' + ' + sm + ' = ' + (big + sm) + '$.'],
      hint: 'Two steps: multiply to find the larger amount, then add.'
    };
    return {
      q: tB + ' ' + f(c.is, sm) + '. ' + tA + ' ' + f(c.times) + ' the ' + c.B + '. ' + f(c.howMore), a: num(big - sm), unit: unit,
      steps: ['First the ' + c.A + ': $' + k + ' \\times ' + sm + ' = ' + big + '$.', 'Then the difference: $' + big + ' - ' + sm + ' = ' + (big - sm) + '$.'],
      hint: 'Two steps: multiply to find the larger amount, then subtract.'
    };
  });

  G('g4.multiply-by-10-100-1000', function (R, ctx) {
    var kind = R.pick(L(ctx, ['times', 'times', 'fact', 'miss'], ['times', 'fact', 'miss', 'fact'], ['fact', 'both', 'both', 'miss']));
    if (kind === 'times') {
      var n = L(ctx, R.int(2, 99), R.int(12, 999)), k = L(ctx, R.int(1, 2), R.int(1, 3)), P = n * pow10(k);
      return {
        q: 'Multiply: $' + C(n) + ' \\times ' + C(pow10(k)) + '$', a: num(P),
        steps: ['Multiplying by $' + C(pow10(k)) + '$ moves every digit ' + k + ' place' + (k > 1 ? 's' : '') + ' to the left; zeros fill the empty places.', '$' + C(n) + ' \\times ' + C(pow10(k)) + ' = ' + C(P) + '$.'],
        hint: 'How many zeros does $' + C(pow10(k)) + '$ have? Each one is one place to the left.'
      };
    }
    if (kind === 'miss') {
      var n2 = R.int(3, L(ctx, 99, 450, 999)), k2 = R.int(1, 3), P2 = n2 * pow10(k2);
      return {
        q: 'Find the missing number: $' + C(n2) + ' \\times \\,?\\, = ' + C(P2) + '$', a: num(pow10(k2)),
        steps: ['The digits of $' + C(n2) + '$ moved ' + k2 + ' place' + (k2 > 1 ? 's' : '') + ' to the left.', 'That is multiplying by $' + C(pow10(k2)) + '$: $' + C(n2) + ' \\times ' + C(pow10(k2)) + ' = ' + C(P2) + '$.'],
        hint: 'How many places did the digits move?'
      };
    }
    var a = R.int(2, 9), b = R.int(2, 9), ka = kind === 'both' ? R.int(1, 2) : 0, kb = R.int(1, kind === 'both' ? 2 : 3);
    if (ctx.level >= 2 && R.chance(0.35)) { a = R.pick([2, 4, 6, 8]); b = 5; }
    var A = a * pow10(ka), B = b * pow10(kb), Pr = A * B, f = a * b;
    if (R.coin()) { var t = A; A = B; B = t; t = a; a = b; b = t; t = ka; ka = kb; kb = t; }
    var kk = ka + kb, s2;
    if (!ka || !kb) { var bigF = ka ? A : B, dgt = ka ? a : b; s2 = '$' + C(bigF) + '$ is ' + dgt + ' ' + PL[kk] + ', so the product is ' + f + ' ' + PL[kk] + '.'; }
    else s2 = 'The place values multiply too: $' + C(pow10(ka)) + ' \\times ' + C(pow10(kb)) + ' = ' + C(pow10(kk)) + '$, so the product is ' + f + ' ' + PL[kk] + '.';
    return {
      q: 'Multiply: $' + C(A) + ' \\times ' + C(B) + '$', a: num(Pr),
      steps: ['Basic fact: $' + a + ' \\times ' + b + ' = ' + f + '$.', s2,
        '$' + f + ' \\times ' + C(pow10(kk)) + ' = ' + C(Pr) + '$.' + (f % 10 === 0 ? ' Notice the extra zero: the basic fact ' + f + ' already ends in 0.' : '')],
      hint: 'Multiply ' + a + ' × ' + b + ' first, then think about the place values.'
    };
  });

  function splitPV(n) { // [300, 40, 7] without zero parts
    return dig(n).map(function (d, i) { return d * pow10(i); }).filter(function (v) { return v; }).reverse();
  }
  G('g4.area-model-multiplication', function (R, ctx) {
    var kind = R.pick(L(ctx, ['parts', 'parts', 'total'], ['total', 'split', 'misspart', 'parts'], ['two', 'misspart', 'total', 'split']));
    if (kind === 'two') {
      var x = R.int(12, 49), y = R.int(11, 39);
      if (x % 10 === 0) x++; if (y % 10 === 0) y++;
      var xs = splitPV(x), ys = splitPV(y), parts = [];
      xs.forEach(function (p) { ys.forEach(function (q) { parts.push([p, q, p * q]); }); });
      return {
        q: 'Use an area model for $' + x + ' \\times ' + y + '$. Split each factor by place value and find each partial product and the total.',
        a: { t: 'multi', parts: parts.map(function (pp) { return { label: '$' + pp[0] + ' \\times ' + pp[1] + ' =$', a: num(pp[2]) }; }).concat([{ label: 'Total:', a: num(x * y) }]) },
        steps: ['Split: $' + x + ' = ' + xs.join(' + ') + '$ and $' + y + ' = ' + ys.join(' + ') + '$. The rectangle has ' + parts.length + ' parts.'].concat(parts.map(function (pp) { return '$' + pp[0] + ' \\times ' + pp[1] + ' = ' + C(pp[2]) + '$'; })).concat(['Add the parts: $' + parts.map(function (pp) { return C(pp[2]); }).join(' + ') + ' = ' + C(x * y) + '$.']),
        hint: 'Tens times tens make hundreds; tens times ones make tens.'
      };
    }
    var a = R.int(3, 9), b = L(ctx, R.int(12, 99), R.int(102, 999), R.int(1012, 4999)), bs;
    for (var t = 0; t < 20; t++) { bs = splitPV(b); if (bs.length >= 2) break; b = R.int(102, 999); }
    var pp2 = bs.map(function (v) { return a * v; }), tot = a * b;
    if (kind === 'parts') return {
      q: 'An area model splits $' + C(b) + '$ into $' + bs.map(C).join(' + ') + '$. Find each partial product for $' + a + ' \\times ' + C(b) + '$, then the total.',
      a: { t: 'multi', parts: bs.map(function (v, i) { return { label: '$' + a + ' \\times ' + C(v) + ' =$', a: num(pp2[i]) }; }).concat([{ label: 'Total:', a: num(tot) }]) },
      steps: bs.map(function (v, i) { return '$' + a + ' \\times ' + C(v) + ' = ' + C(pp2[i]) + '$ (that is ' + a + ' × ' + String(v)[0] + ' = ' + a * +String(v)[0] + ', then ' + (String(v).length - 1 ? 'move ' + (String(v).length - 1) + ' place' + (String(v).length > 2 ? 's' : '') + ' left' : 'no shift') + ').'; }).concat(['Add the parts: $' + pp2.map(C).join(' + ') + ' = ' + C(tot) + '$.']),
      hint: 'Multiply ' + a + ' by each part. A part like ' + bs[0] + ' is a basic fact with zeros after it.'
    };
    if (kind === 'total') return {
      q: 'Use an area model to find $' + a + ' \\times ' + C(b) + '$.', a: num(tot),
      steps: ['Split $' + C(b) + '$ by place value: $' + bs.map(C).join(' + ') + '$.'].concat(bs.map(function (v, i) { return '$' + a + ' \\times ' + C(v) + ' = ' + C(pp2[i]) + '$'; })).concat(['Add the partial products: $' + pp2.map(C).join(' + ') + ' = ' + C(tot) + '$.']),
      hint: 'Split $' + C(b) + '$ into ' + bs.map(C).join(', ') + '. Multiply each by ' + a + ', then add.'
    };
    if (kind === 'misspart') {
      var mi = R.int(0, bs.length - 1), shown = pp2.map(function (v, i) { return i === mi ? '?' : '$' + C(v) + '$'; });
      return {
        q: 'An area model for $' + a + ' \\times ' + C(b) + '$ has the parts ' + U.list(shown) + '. What is the missing part?', a: num(pp2[mi]),
        steps: ['Split $' + C(b) + '$ by place value: $' + bs.map(C).join(' + ') + '$.', 'The parts are $' + bs.map(function (v) { return a + ' \\times ' + C(v); }).join('$, $') + '$.', 'The missing one is $' + a + ' \\times ' + C(bs[mi]) + ' = ' + C(pp2[mi]) + '$.'],
        hint: 'Which piece of $' + C(b) + '$ has no partial product yet?'
      };
    }
    var right = bs.map(function (v) { return a + ' \\times ' + C(v); }).join(' + ');
    var w1 = bs.map(function (v) { return a + ' \\times ' + String(v)[0]; }).join(' + ');
    var w2 = a + ' \\times ' + C(bs[0]) + ' + ' + bs.slice(1).map(C).join(' + ');
    var w3 = bs.map(function (v) { return a + ' + ' + C(v); }).join(' + ');
    return {
      q: 'Which expression splits $' + a + ' \\times ' + C(b) + '$ by place value correctly?',
      a: mcOf('$' + right + '$', ['$' + w1 + '$', '$' + w2 + '$', '$' + w3 + '$']),
      steps: ['$' + C(b) + ' = ' + bs.map(C).join(' + ') + '$, and every part must be multiplied by ' + a + '.', 'So $' + a + ' \\times ' + C(b) + ' = ' + right + '$.', 'That is $' + pp2.map(C).join(' + ') + ' = ' + C(tot) + '$.'],
      hint: 'Each part keeps its place value, and each part gets multiplied.'
    };
  });

  G('g4.multiply-by-one-digit', function (R, ctx) {
    var kind = R.pick(L(ctx, ['calc'], ['calc', 'calc', 'story'], ['calc', 'story', 'error']));
    var nd = L(ctx, R.pick([2, 3]), R.pick([3, 4]), 4), a, b, t;
    function carries(x, y) { var A = dig(x), c = 0, k = 0; for (var i = 0; i < A.length - 1; i++) { c = M.floor((A[i] * y + c) / 10); if (c) k++; } return k; }
    for (t = 0; t < 50; t++) { a = makeNum(R, nd, 0.1); b = R.int(3, 9); if (carries(a, b) >= M.min(nd - 1, L(ctx, 1, 2, 2))) break; }
    if (kind === 'calc') return { q: 'Multiply: $' + C(a) + ' \\times ' + b + '$', a: num(a * b), steps: mulSteps(a, b), hint: 'Start with the ones. Multiply first, then add what you carried.' };
    if (kind === 'story') {
      var s = R.pick([
        ['A box holds ' + C(a) + ' paper clips. How many paper clips are in ' + b + ' boxes?', 'paper clips'],
        ['A farm stand sells ' + C(a) + ' apples each ' + (a > 999 ? 'month' : 'day') + '. How many apples does it sell in ' + b + ' ' + (a > 999 ? 'months' : 'days') + '?', 'apples'],
        ['A plane flies ' + C(a) + ' miles each trip. How many miles does it fly in ' + b + ' trips?', 'miles'],
        ['Each section of a stadium has ' + C(a) + ' seats. How many seats are in ' + b + ' sections?', 'seats']
      ]);
      return { q: s[0], a: num(a * b), unit: s[1], steps: ['There are ' + b + ' equal groups of ' + C(a) + ', so multiply $' + C(a) + ' \\times ' + b + '$.'].concat(mulSteps(a, b).slice(1)), hint: 'Equal groups: multiply.' };
    }
    var A = dig(a), wr = 0;
    for (var i = 0; i < A.length; i++) wr += (i === A.length - 1 ? A[i] * b : (A[i] * b) % 10) * pow10(i);
    if (wr === a * b) wr += 10;
    var who = names(R, 1)[0];
    return {
      q: who + ' multiplied $' + C(a) + ' \\times ' + b + '$ and got $' + C(wr) + '$. ' + who + ' forgot something. What is the correct product?', a: num(a * b),
      steps: [who + ' wrote down each place\'s product but never added the carried amounts to the next place.'].concat(mulSteps(a, b).slice(1)),
      hint: 'After you multiply a place, add the amount carried from the place before it.'
    };
  });

  G('g4.multiply-two-digit', function (R, ctx) {
    var kind = R.pick(L(ctx, ['parts', 'calc'], ['calc', 'calc', 'story', 'parts'], ['calc', 'story', 'error']));
    var x = R.int(L(ctx, 12, 13, 21), L(ctx, 39, 89, 98)), y = R.int(L(ctx, 11, 12, 13), L(ctx, 29, 69, 89));
    if (x % 10 === 0) x += 3; if (y % 10 === 0) y += 1;
    var x1 = M.floor(x / 10) * 10, x0 = x % 10, y1 = M.floor(y / 10) * 10, y0 = y % 10, P = x * y;
    var parts = [[x1, y1], [x1, y0], [x0, y1], [x0, y0]];
    var steps = ['Split both factors: $' + x + ' = ' + x1 + ' + ' + x0 + '$ and $' + y + ' = ' + y1 + ' + ' + y0 + '$. That makes four partial products.']
      .concat(parts.map(function (p) { return '$' + p[0] + ' \\times ' + p[1] + ' = ' + C(p[0] * p[1]) + '$'; }))
      .concat(['Add them: $' + parts.map(function (p) { return C(p[0] * p[1]); }).join(' + ') + ' = ' + C(P) + '$.']);
    if (kind === 'parts') return {
      q: 'Find the four partial products for $' + x + ' \\times ' + y + '$, then the total.',
      a: { t: 'multi', parts: parts.map(function (p) { return { label: '$' + p[0] + ' \\times ' + p[1] + ' =$', a: num(p[0] * p[1]) }; }).concat([{ label: 'Total:', a: num(P) }]) },
      steps: steps, hint: 'Tens × tens, tens × ones, ones × tens, ones × ones.'
    };
    if (kind === 'calc') return { q: 'Multiply: $' + x + ' \\times ' + y + '$', a: num(P), steps: steps, hint: 'Split both numbers into tens and ones: there are four products to add.' };
    if (kind === 'story') {
      var s = R.pick([
        ['A theater has ' + x + ' rows with ' + y + ' seats in each row. How many seats are there?', 'seats'],
        ['A garden has ' + x + ' rows of ' + y + ' carrots. How many carrots are in the garden?', 'carrots'],
        ['A baker makes ' + x + ' trays of muffins with ' + y + ' muffins on each tray. How many muffins is that?', 'muffins'],
        ['A school orders ' + y + ' boxes of ' + x + ' pencils. How many pencils is that?', 'pencils']
      ]);
      return { q: s[0], a: num(P), unit: s[1], steps: ['Equal rows or groups: multiply $' + x + ' \\times ' + y + '$.'].concat(steps.slice(0)), hint: 'Multiply the two numbers. An area model keeps the four parts in order.' };
    }
    var wr = (x1 / 10) * (y1 / 10) * 100 + x0 * y0, who = names(R, 1)[0];
    if (wr === P) wr += 10;
    return {
      q: who + ' says $' + x + ' \\times ' + y + ' = ' + C(wr) + '$, because $' + (x1 / 10) + ' \\times ' + (y1 / 10) + ' = ' + (x1 / 10) * (y1 / 10) + '$ and $' + x0 + ' \\times ' + y0 + ' = ' + x0 * y0 + '$. What is the correct product?', a: num(P),
      steps: [who + ' multiplied only tens by tens and ones by ones. Two partial products are missing: tens times ones and ones times tens.'].concat(steps),
      hint: 'An area model for two 2-digit numbers has four parts, not two.'
    };
  });

  /* ================================================================ unit: division */

  G('g4.divide-with-remainders', function (R, ctx) {
    var d = R.int(L(ctx, 2, 3, 3), L(ctx, 5, 9, 9)), qq = R.int(2, L(ctx, 9, 10, 12)), r = R.int(ctx.level === 2 && R.chance(0.15) ? 0 : 1, d - 1), n = qq * d + r;
    var kind = R.pick(L(ctx, ['qr', 'qr', 'story'], ['qr', 'story', 'which'], ['qr', 'which', 'reverse', 'story']));
    var st = ['Think of the ' + d + 's facts: $' + qq + ' \\times ' + d + ' = ' + qq * d + '$ is the biggest one that fits in ' + n + ' (the next, $' + (qq + 1) + ' \\times ' + d + ' = ' + (qq + 1) * d + '$, is too big).',
      'Left over: $' + n + ' - ' + qq * d + ' = ' + r + '$.' + (r ? ' ' + r + ' is less than ' + d + ', so no more groups fit.' : ' Nothing is left over.'),
      'So $' + n + ' \\div ' + d + ' = ' + qq + '$' + (r ? ' R ' + r : '') + '.'];
    if (kind === 'qr') return { q: 'Divide: $' + n + ' \\div ' + d + '$. Give the quotient and the remainder.', a: qrSpec(qq, r), steps: st, hint: 'Which multiple of ' + d + ' is closest to ' + n + ' without going over?' };
    if (kind === 'story') {
      var s = R.pick([['apples', 'bags'], ['crayons', 'boxes'], ['cookies', 'plates'], ['stickers', 'pages'], ['eggs', 'cartons']]);
      return {
        q: 'There are ' + n + ' ' + s[0] + '. You put ' + d + ' ' + s[0] + ' in each of the ' + s[1] + '. How many ' + s[1] + ' can you fill, and how many ' + s[0] + ' are left over?',
        a: { t: 'multi', parts: [{ label: 'Full ' + s[1] + ':', a: num(qq) }, { label: 'Left over:', a: num(r) }] },
        steps: ['Find $' + n + ' \\div ' + d + '$.'].concat(st).concat([qq + ' full ' + s[1] + ', with ' + r + ' ' + s[0] + ' left over.']),
        hint: 'How many groups of ' + d + ' fit in ' + n + '?'
      };
    }
    if (kind === 'which') {
      if (!r) { r = 1; n += 1; }
      return {
        q: 'Which is the correct answer for $' + n + ' \\div ' + d + '$?',
        a: mcOf(qq + ' R ' + r, [(qq - 1) + ' R ' + (r + d), (qq + 1) + ' R ' + r, qq + ' R ' + (r + 1 < d ? r + 1 : r - 1 || d), (qq + 1) + ' R ' + (d - r)].filter(function (x) { return !/R 0$/.test(x) && x !== qq + ' R ' + r; })),
        steps: ['$' + qq + ' \\times ' + d + ' = ' + qq * d + '$, and $' + n + ' - ' + qq * d + ' = ' + r + '$.', 'A remainder must be less than the divisor. "' + (qq - 1) + ' R ' + (r + d) + '" leaves ' + (r + d) + ', which is enough for one more group of ' + d + '.', 'So $' + n + ' \\div ' + d + ' = ' + qq + '$ R ' + r + '.'],
        hint: 'Check each choice: quotient × ' + d + ' + remainder should make ' + n + ', and the remainder must be less than ' + d + '.'
      };
    }
    if (!r) { r = 1; n += 1; }
    return {
      q: 'A number divided by ' + d + ' gives ' + qq + ' R ' + r + '. What is the number?', a: num(n),
      steps: ['The number is ' + qq + ' groups of ' + d + ' with ' + r + ' left over.', '$' + qq + ' \\times ' + d + ' + ' + r + ' = ' + qq * d + ' + ' + r + ' = ' + n + '$.'],
      hint: 'Multiply the quotient by ' + d + ', then add the remainder.'
    };
  });

  G('g4.divide-tens-hundreds', function (R, ctx) {
    var d = R.int(2, 9), k = L(ctx, 1, R.pick([1, 2]), R.pick([2, 3])), qd = R.int(2, 9), zero = ctx.level >= 2 && R.chance(0.35);
    if (zero) { d = R.pick([2, 4, 5, 6, 8]); qd = d === 5 ? R.pick([2, 4, 6, 8]) : 5; } // the fact ends in 0: 30 hundreds ÷ 5
    var units = d * qd, n = units * pow10(k), Qt = qd * pow10(k);
    if (n >= 10000) { k = 2; n = units * 100; Qt = qd * 100; }
    var kind = R.pick(L(ctx, ['calc', 'unit', 'calc'], ['calc', 'calc', 'unit'], ['calc', 'calc', 'story']));
    var uk = zero ? k + 1 : k, ucount = n / pow10(uk), uq = ucount / d; // count in the largest unit that keeps a whole number fact
    if (!Number.isInteger(uq) || ucount < d) { uk = k; ucount = units; uq = qd; }
    var steps = ['Think in ' + PL[uk] + ': $' + C(n) + '$ is ' + C(ucount) + ' ' + PL[uk] + '.',
      C(ucount) + ' ' + PL[uk] + ' $\\div ' + d + ' = ' + uq + '$ ' + pn(uk, uq) + ', because $' + uq + ' \\times ' + d + ' = ' + ucount + '$.',
      uq + ' ' + pn(uk, uq) + ' is $' + C(Qt) + '$. So $' + C(n) + ' \\div ' + d + ' = ' + C(Qt) + '$.'];
    if (kind === 'unit') return {
      q: '$' + C(n) + '$ is ' + C(ucount) + ' ' + PL[uk] + '. So $' + C(n) + ' \\div ' + d + '$ is how many ' + PL[uk] + '?', a: num(uq),
      steps: [C(ucount) + ' ' + PL[uk] + ' shared into ' + d + ' equal groups: $' + ucount + ' \\div ' + d + ' = ' + uq + '$.', 'So the answer is ' + uq + ' ' + pn(uk, uq) + ' (which is $' + C(Qt) + '$).'],
      hint: 'Use the fact $' + ucount + ' \\div ' + d + '$.'
    };
    if (kind === 'story') {
      var s = R.pick([['A school has ' + C(n) + ' pencils to share equally among ' + d + ' classes. How many pencils does each class get?', 'pencils'], ['A farmer packs ' + C(n) + ' strawberries equally into ' + d + ' crates. How many strawberries go in each crate?', 'strawberries'], ['A library has ' + C(n) + ' books on ' + d + ' equal shelves. How many books are on each shelf?', 'books']]);
      return { q: s[0], a: num(Qt), unit: s[1], steps: ['Share equally: $' + C(n) + ' \\div ' + d + '$.'].concat(steps), hint: 'Think of $' + C(n) + '$ as a number of ' + PL[uk] + '.' };
    }
    return { q: 'Divide: $' + C(n) + ' \\div ' + d + '$', a: num(Qt), steps: steps, hint: 'Think of $' + C(n) + '$ as ' + PL[uk] + '. Which basic fact helps?' };
  });

  function pqSteps(n, d, Qt, rem) { // partial quotients by place value
    var parts = splitPV(Qt), left = n, out = ['Take away easy groups of ' + d + ', using place value.'];
    parts.forEach(function (p) { var t = p * d; out.push('Take away $' + C(p) + '$ groups of ' + d + ': $' + C(p) + ' \\times ' + d + ' = ' + C(t) + '$, and $' + C(left) + ' - ' + C(t) + ' = ' + C(left - t) + '$ left.'); left -= t; });
    out.push((rem ? C(left) + ' is less than ' + d + ', so it is the remainder. ' : 'Nothing is left. ') + 'Add the groups: $' + parts.map(C).join(' + ') + ' = ' + C(Qt) + '$.');
    out.push('So $' + C(n) + ' \\div ' + d + ' = ' + C(Qt) + '$' + (rem ? ' R ' + rem : '') + '.');
    return out;
  }
  G('g4.partial-quotients', function (R, ctx) {
    var d = R.int(L(ctx, 2, 3, 3), 9), Qt, t;
    for (t = 0; t < 30; t++) { Qt = R.int(L(ctx, 21, 102, 112), L(ctx, 249, 999, 1111)); if (splitPV(Qt).length >= 2 && Qt * d < L(ctx, 1000, 10000, 10000)) break; }
    if (Qt * d >= L(ctx, 1000, 10000, 10000)) Qt = 41;
    var kind = R.pick(L(ctx, ['calc', 'calc', 'left'], ['calc', 'left', 'calc'], ['qr', 'qr', 'left']));
    var rem = kind === 'qr' ? R.int(1, d - 1) : 0, n = Qt * d + rem, parts = splitPV(Qt);
    if (kind === 'left') {
      var first = parts[0], left = n - first * d, who = names(R, 1)[0];
      return {
        q: who + ' starts $' + C(n) + ' \\div ' + d + '$ by taking away $' + C(first) + '$ groups of ' + d + '. How much is left to divide?', a: num(left),
        steps: ['$' + C(first) + '$ groups of ' + d + ' is $' + C(first) + ' \\times ' + d + ' = ' + C(first * d) + '$.', 'Left: $' + C(n) + ' - ' + C(first * d) + ' = ' + C(left) + '$.', '(The rest: $' + C(left) + ' \\div ' + d + ' = ' + C(left / d) + '$, so the whole quotient is $' + C(first) + ' + ' + C(left / d) + ' = ' + C(Qt) + '$.)'],
        hint: 'Multiply ' + C(first) + ' × ' + d + ', then subtract from ' + C(n) + '.'
      };
    }
    if (kind === 'qr') return { q: 'Use partial quotients: $' + C(n) + ' \\div ' + d + '$. Give the quotient and the remainder.', a: qrSpec(Qt, rem), steps: pqSteps(n, d, Qt, rem), hint: 'Take away big friendly groups first, like 100 or 10 groups of ' + d + '.' };
    return { q: 'Use partial quotients to find $' + C(n) + ' \\div ' + d + '$.', a: num(Qt), steps: pqSteps(n, d, Qt, 0), hint: 'How many hundreds of ' + d + 's fit? Take those away, then try tens.' };
  });

  G('g4.long-division-one-digit', function (R, ctx) {
    var d = R.int(L(ctx, 2, 3, 3), 9), kind = R.pick(L(ctx, ['plain', 'plain', 'rem'], ['zero', 'zero', 'rem', 'plain'], ['zero', 'rem', 'error', 'zero'])), Qt = 0, rem = 0, t;
    var maxN = L(ctx, 999, 9999, 9999);
    function zq() { // a quotient with a 0 digit: a0b, ab0, or four digits
      var f = ctx.level >= 3 ? R.pick([0, 2, 2]) : R.pick([0, 0, 1, 2]);
      if (f === 0) return R.int(1, 9) * 100 + R.int(1, 9);
      if (f === 1) return R.int(11, 99) * 10;
      return R.int(1, 2) * 1000 + R.pick([R.int(1, 9) * 100 + R.int(1, 9), R.int(11, 99), R.int(11, 99) * 10]);
    }
    for (t = 0; t < 80; t++) {
      if (kind === 'plain') { Qt = R.int(21, L(ctx, 299, 999, 999)); if (/0/.test(String(Qt))) continue; }
      else if (kind === 'rem') Qt = R.int(L(ctx, 21, 112, 212), L(ctx, 199, 999, 1999));
      else Qt = zq();
      rem = kind === 'rem' || (kind === 'zero' && ctx.level >= 3) ? R.int(1, d - 1) : 0;
      if (Qt * d + rem <= maxN && Qt * d + rem >= 100) break;
    }
    if (Qt * d + rem > maxN || Qt * d + rem < 100) { Qt = kind === 'plain' || kind === 'rem' ? 112 : 103; rem = kind === 'rem' ? 1 : 0; }
    var n = Qt * d + rem, steps = ldSteps(n, d);
    if (kind === 'error' && /0/.test(String(Qt))) {
      var wr = +String(Qt).replace(/0/g, ''), who = names(R, 1)[0];
      return {
        q: who + ' found $' + C(n) + ' \\div ' + d + ' = ' + C(wr) + '$. Check by multiplying, then give the correct quotient.', a: num(Qt),
        steps: ['Check: $' + C(wr) + ' \\times ' + d + ' = ' + C(wr * d) + '$, not $' + C(n) + '$. A place that was too small to share needs a 0 in the quotient.'].concat(steps),
        hint: 'When a place is too small to divide, write 0 in the quotient before you bring down the next digit.'
      };
    }
    if (rem) return { q: 'Use long division: $' + C(n) + ' \\div ' + d + '$. Give the quotient and the remainder.', a: qrSpec(Qt, rem), steps: steps, hint: 'Divide, multiply, subtract, bring down, one place at a time.' };
    return { q: 'Use long division: $' + C(n) + ' \\div ' + d + '$', a: num(Qt), steps: steps, hint: 'Divide, multiply, subtract, bring down. Every place after the first gets a digit, even if it is 0.' };
  });

  G('g4.interpret-remainders', function (R, ctx) {
    var d = R.int(3, 9), qq = R.int(3, L(ctx, 9, 12, 15)), r = R.int(1, d - 1), n = qq * d + r;
    var type = R.pick(L(ctx, ['up', 'drop', 'rem', 'up'], ['up', 'drop', 'rem'], ['up', 'drop', 'rem', 'which']));
    var head = '$' + n + ' \\div ' + d + ' = ' + qq + '$ R ' + r + '.';
    if (type === 'up') {
      var s = R.pick([[n + ' people are going on a trip. Each van holds ' + d + ' people. How many vans are needed?', 'vans', 'The ' + r + ' extra ' + (r === 1 ? 'person' : 'people') + ' still need a seat, so add one more van.'],
        ['A coach has ' + n + ' tennis balls. Each can holds ' + d + ' balls. How many cans does she need to hold all the balls?', 'cans', 'The ' + r + ' leftover ' + (r === 1 ? 'ball needs' : 'balls need') + ' a can too.'],
        [n + ' students sit at tables. Each table seats ' + d + '. How many tables are needed so everyone can sit?', 'tables', 'The ' + r + ' extra ' + (r === 1 ? 'student needs' : 'students need') + ' a table, so add one.']]);
      return { q: s[0], a: num(qq + 1), unit: s[1], steps: [head, s[2], 'Answer: $' + qq + ' + 1 = ' + (qq + 1) + '$ ' + s[1] + '. (Writing "' + qq + ' R ' + r + ' ' + s[1] + '" does not answer the question.)'], hint: 'Divide. Then ask: does the remainder still need a ' + s[1].replace(/s$/, '') + '?' };
    }
    if (type === 'drop') {
      var s2 = R.pick([['A ribbon is ' + n + ' inches long. How many ' + d + '-inch pieces can you cut from it?', 'pieces', 'The ' + r + ' inch' + (r === 1 ? '' : 'es') + ' left is too short to make another piece.'],
        ['You have ' + n + ' dollars. Each ticket costs ' + d + ' dollars. How many tickets can you buy?', 'tickets', 'The ' + r + ' dollar' + (r === 1 ? '' : 's') + ' left is not enough for another ticket.'],
        ['A baker has ' + n + ' eggs. Each cake needs ' + d + ' eggs. How many cakes can the baker make?', 'cakes', 'The ' + r + ' leftover egg' + (r === 1 ? ' is' : 's are') + ' not enough for another cake.']]);
      return { q: s2[0], a: num(qq), unit: s2[1], steps: [head, s2[2], 'Answer: ' + qq + ' ' + s2[1] + '. Drop the remainder.'], hint: 'Divide. Can the leftover make another whole one?' };
    }
    if (type === 'rem') {
      var s3 = R.pick([[n + ' cookies are shared equally among ' + d + ' friends, as many as possible each. How many cookies are left over?', 'cookies'],
        ['A teacher puts ' + n + ' markers into groups of ' + d + '. How many markers are not in a full group?', 'markers'],
        [n + ' cards are dealt equally to ' + d + ' players until there are not enough to go around. How many cards are left?', 'cards']]);
      return { q: s3[0], a: num(r), unit: s3[1], steps: [head, 'The question asks what is left, so the remainder is the answer: ' + r + ' ' + s3[1] + '.'], hint: 'The question asks about the leftovers.' };
    }
    var ctxs = [[n + ' people need rides. Each car holds ' + d + '. How many cars are needed?', 0], ['A ' + n + '-inch board is cut into ' + d + '-inch pieces. How many full pieces are there?', 1], [n + ' stickers are shared equally by ' + d + ' kids. How many stickers are left over?', 2]];
    var pick = R.pick(ctxs), choices = ['Add 1 to the quotient: ' + (qq + 1), 'Use just the quotient: ' + qq, 'The remainder is the answer: ' + r];
    return {
      q: pick[0] + ' What should you do with the remainder?', a: mcKeep(choices, pick[1]),
      steps: [head, ['Everyone needs a ride, so the extra ' + r + ' need one more car: ' + (qq + 1) + '.', 'A leftover piece shorter than ' + d + ' inches is not a full piece: ' + qq + '.', 'The question asks what is left over: ' + r + '.'][pick[1]]],
      hint: 'Read the question again: what is it asking for?'
    };
  });

  var STORIES = [
    function (R, ctx) { var a = R.int(3, L(ctx, 6, 9, 9)), b = R.int(12, L(ctx, 24, 48, 64)), c = R.int(2, 6), dd = R.int(6, 12), ans = a * b + c * dd;
      return { q: 'A school buys ' + a + ' boxes of ' + b + ' markers and ' + c + ' packs of ' + dd + ' markers. How many markers is that in all?', a: ans, unit: 'markers',
        steps: ['Boxes: $' + a + ' \\times ' + b + ' = ' + a * b + '$.', 'Packs: $' + c + ' \\times ' + dd + ' = ' + c * dd + '$.', 'In all: $' + a * b + ' + ' + c * dd + ' = ' + ans + '$.', 'Estimate to check: about $' + a + ' \\times ' + M.round(b / 10) * 10 + ' + ' + c + ' \\times ' + M.round(dd / 10) * 10 + ' = ' + (a * M.round(b / 10) * 10 + c * M.round(dd / 10) * 10) + '$, close to ' + ans + '.'] }; },
    function (R, ctx) { var p = R.int(6, L(ctx, 15, 25, 35)), n = R.int(2, 5), Mo = n * p + R.int(5, L(ctx, 40, 90, 150)), nm = names(R, 1)[0], ans = Mo - n * p;
      return { q: nm + ' has $\\$' + Mo + '$. ' + nm + ' buys ' + n + ' books that cost $\\$' + p + '$ each. How much money is left?', a: ans, unit: 'dollars',
        steps: ['Cost of the books: $' + n + ' \\times ' + p + ' = ' + n * p + '$ dollars.', 'Left: $' + Mo + ' - ' + n * p + ' = ' + ans + '$ dollars.'] }; },
    function (R, ctx) { var rr = R.int(8, L(ctx, 15, 25, 30)), s = R.int(12, L(ctx, 20, 30, 40)), f = R.int(M.floor(rr * s / 3), rr * s - 5), ans = rr * s - f;
      return { q: 'A hall has ' + rr + ' rows of ' + s + ' seats. ' + C(f) + ' seats are filled. How many seats are empty?', a: ans, unit: 'seats',
        steps: ['Seats in all: $' + rr + ' \\times ' + s + ' = ' + C(rr * s) + '$.', 'Empty: $' + C(rr * s) + ' - ' + C(f) + ' = ' + C(ans) + '$.'] }; },
    function (R, ctx) { var P = R.int(150, L(ctx, 300, 600, 900)), r = R.int(8, 25), dd = R.int(3, 7), nm = names(R, 1)[0]; if (r * dd >= P) P = r * dd + 50; var ans = P - r * dd;
      return { q: 'A book has ' + P + ' pages. ' + nm + ' reads ' + r + ' pages a day for ' + dd + ' days. How many pages are left to read?', a: ans, unit: 'pages',
        steps: ['Pages read: $' + r + ' \\times ' + dd + ' = ' + r * dd + '$.', 'Left: $' + P + ' - ' + r * dd + ' = ' + ans + '$.'] }; },
    function (R, ctx) { var B = R.pick([30, 35, 40, 45]), tot, S, Tt; for (var i = 0; i < 20; i++) { S = R.int(80, L(ctx, 150, 250, 300)); Tt = R.int(4, 12); tot = S + Tt; if (tot % B) break; } if (!(tot % B)) { Tt++; tot++; } var ans = M.ceil(tot / B);
      return { q: S + ' students and ' + Tt + ' adults are going on a trip. Each bus holds ' + B + ' people. How many buses are needed?', a: ans, unit: 'buses',
        steps: ['People in all: $' + S + ' + ' + Tt + ' = ' + tot + '$.', '$' + tot + ' \\div ' + B + ' = ' + M.floor(tot / B) + '$ R ' + (tot % B) + '.', 'The ' + (tot % B) + ' extra people need a bus too, so ' + ans + ' buses.'] }; },
    function (R, ctx) { var k = R.int(3, 4), each = R.int(15, L(ctx, 30, 60, 90)), tot = each * k, nmz = names(R, k), parts = [], left = tot;
      for (var i = 0; i < k - 1; i++) { var v = R.int(5, M.min(left - 5 * (k - 1 - i), 2 * each)); parts.push(v); left -= v; }
      parts.push(left);
      return { q: U.list(nmz) + ' earn ' + U.list(parts.map(function (v) { return '$\\$' + v + '$'; })) + ' at a bake sale. They put the money together and share it equally. How much does each person get?', a: each, unit: 'dollars',
        steps: ['Total: $' + parts.join(' + ') + ' = ' + tot + '$ dollars.', 'Share equally among ' + k + ': $' + tot + ' \\div ' + k + ' = ' + each + '$ dollars each.'] }; },
    function (R, ctx) { var dz = R.int(10, L(ctx, 20, 30, 40)), E = dz * 12, sold = R.int(3, dz - 2), ans = dz - sold;
      return { q: 'A farm collects ' + E + ' eggs and packs them in cartons of 12. It sells ' + sold + ' cartons. How many full cartons are left?', a: ans, unit: 'cartons',
        steps: ['Cartons: $' + E + ' \\div 12 = ' + dz + '$.', 'Left: $' + dz + ' - ' + sold + ' = ' + ans + '$ cartons.'] }; }
  ];
  G('g4.multistep-word-problems', function (R, ctx) {
    var pool = L(ctx, [0, 1, 2, 3], [0, 1, 2, 3, 4, 6], [0, 2, 4, 5, 6]);
    var s = STORIES[R.pick(pool)](R, ctx);
    return { q: s.q, a: num(s.a), unit: s.unit, steps: s.steps, hint: 'What do you need to find first? Write one step at a time.' };
  });

  /* ================================================================ unit: factors, multiples and patterns */

  function pairsTex(n) { return U.factorPairs(n).map(function (p) { return '$' + p[0] + ' \\times ' + p[1] + '$'; }); }
  function pairSteps(n) {
    var out = ['Try each whole number from 1 up, and keep the ones that divide ' + n + ' with no remainder.'], prs = U.factorPairs(n);
    out.push('Pairs: ' + U.list(pairsTex(n)) + '.');
    var last = prs[prs.length - 1], nx = last[0] + 1;
    out.push(last[0] === last[1] ? 'The pairs meet at $' + last[0] + ' \\times ' + last[1] + '$, so the list is complete.' : 'No number between ' + last[0] + ' and ' + last[1] + ' divides ' + n + ', so the pairs have met in the middle and the list is complete.');
    return out;
  }
  var COMPOSITES = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 54, 56, 60, 63, 64, 66, 70, 72, 75, 78, 80, 81, 84, 88, 90, 96, 98, 100];
  G('g4.factor-pairs', function (R, ctx) {
    var pool = COMPOSITES.filter(function (v) { return v <= L(ctx, 30, 60, 100) && v >= L(ctx, 12, 16, 24); });
    var n = R.pick(pool), prs = U.factorPairs(n), fs = U.factors(n);
    var kind = R.pick(L(ctx, ['list', 'partner', 'is'], ['list', 'count', 'partner', 'is'], ['list', 'count', 'notpair', 'is']));
    if (kind === 'list') return {
      q: 'List all the factors of ' + n + '. Separate them with commas.', a: { t: 'set', v: fs.map(String) },
      steps: pairSteps(n).concat(['Every number in those pairs is a factor: ' + fs.join(', ') + '.']),
      hint: 'Start with $1 \\times ' + n + '$. Try 2, 3, 4, … until the pairs meet in the middle.'
    };
    if (kind === 'count') return {
      q: 'How many factor pairs does ' + n + ' have?', a: num(prs.length),
      steps: pairSteps(n).concat(['That is ' + prs.length + ' factor pairs.']),
      hint: 'List the pairs in order, starting with 1 × ' + n + '.'
    };
    if (kind === 'partner') {
      var pr = R.pick(prs.filter(function (p) { return p[0] > 1; }).length ? prs.filter(function (p) { return p[0] > 1; }) : prs), sw = R.coin(), a = sw ? pr[1] : pr[0], b = sw ? pr[0] : pr[1];
      return {
        q: 'Complete the factor pair: $' + a + ' \\times \\,?\\, = ' + n + '$', a: num(b),
        steps: ['Ask what times ' + a + ' makes ' + n + ': $' + n + ' \\div ' + a + ' = ' + b + '$.', 'So ' + a + ' and ' + b + ' are a factor pair of ' + n + '.'],
        hint: 'Divide ' + n + ' by ' + a + '.'
      };
    }
    if (kind === 'is') {
      var cand = R.chance(0.5) ? R.pick(fs.filter(function (f) { return f > 2 && f < n; }).concat([3])) : R.intNot(3, 12, fs);
      if (cand >= n) cand = 3;
      var yes = n % cand === 0;
      return {
        q: 'True or false: ' + cand + ' is a factor of ' + n + '.', a: { t: 'tf', v: yes },
        steps: yes ? ['$' + cand + ' \\times ' + n / cand + ' = ' + n + '$, so ' + cand + ' divides ' + n + ' with no remainder.', 'True: ' + cand + ' is a factor of ' + n + '.'] : ['$' + n + ' \\div ' + cand + ' = ' + M.floor(n / cand) + '$ R ' + n % cand + ', so ' + cand + ' does not divide ' + n + ' evenly.', 'False: ' + cand + ' is not a factor of ' + n + '.'],
        hint: 'Does ' + cand + ' divide ' + n + ' with no remainder?'
      };
    }
    var good = R.pick(prs), bad = [], tries = 0;
    while (bad.length < 1 && tries++ < 30) { var x = R.int(2, 12), y = M.round(n / x) + R.pick([-1, 1]); if (x * y !== n && y > 1 && bad.indexOf(x + '×' + y) < 0) bad.push([x, y]); }
    if (!bad.length) bad.push([2, n / 2 + 1]);
    var choicesOk = R.sample(prs, M.min(3, prs.length));
    return {
      q: 'Which is <b>not</b> a factor pair of ' + n + '?',
      a: mcOf('$' + bad[0][0] + ' \\times ' + bad[0][1] + '$', choicesOk.map(function (p) { return '$' + p[0] + ' \\times ' + p[1] + '$'; })),
      steps: ['$' + bad[0][0] + ' \\times ' + bad[0][1] + ' = ' + bad[0][0] * bad[0][1] + '$, not ' + n + '.', 'The factor pairs of ' + n + ' are ' + U.list(pairsTex(n)) + '.'],
      hint: 'Multiply each pair. Which one does not make ' + n + '?'
    };
  });

  G('g4.multiples', function (R, ctx) {
    var n = R.int(L(ctx, 2, 3, 4), L(ctx, 9, 12, 12)), kind = R.pick(L(ctx, ['list', 'is', 'nth', 'which'], ['list', 'is', 'which', 'all'], ['is', 'which', 'all', 'nth']));
    if (kind === 'list') {
      var k = 5, ms = []; for (var i = 1; i <= k; i++) ms.push(n * i);
      return {
        q: 'List the first five multiples of ' + n + '. Separate them with commas.', a: { t: 'set', v: ms.map(String) },
        steps: ['A multiple of ' + n + ' is ' + n + ' times a whole number: $' + n + ' \\times 1$, $' + n + ' \\times 2$, and so on.', 'Skip-count by ' + n + ': ' + ms.join(', ') + '.'],
        hint: 'Skip-count by ' + n + ', starting at ' + n + '.'
      };
    }
    if (kind === 'nth') {
      var j = R.int(L(ctx, 3, 4, 6), L(ctx, 9, 10, 12));
      return {
        q: 'Skip-count by ' + n + ': ' + [1, 2, 3].map(function (t) { return n * t; }).join(', ') + ', … What is the ' + U.ordinal(j) + ' number in this list?', a: num(n * j),
        steps: ['The ' + U.ordinal(j) + ' multiple of ' + n + ' is $' + n + ' \\times ' + j + '$.', '$' + n + ' \\times ' + j + ' = ' + n * j + '$.'],
        hint: 'The 1st is ' + n + ' × 1, the 2nd is ' + n + ' × 2, …'
      };
    }
    if (kind === 'is') {
      var big = R.int(L(ctx, 12, 20, 30), L(ctx, 60, 90, 100)), yes = R.coin(), v = yes ? n * M.max(2, M.round(big / n)) : (M.round(big / n) * n + R.int(1, n - 1));
      yes = v % n === 0;
      return {
        q: 'True or false: ' + v + ' is a multiple of ' + n + '.', a: { t: 'tf', v: yes },
        steps: yes ? ['$' + n + ' \\times ' + v / n + ' = ' + v + '$.', 'True: ' + v + ' is in the skip-counting list for ' + n + '.'] : ['$' + n + ' \\times ' + M.floor(v / n) + ' = ' + n * M.floor(v / n) + '$ and $' + n + ' \\times ' + (M.floor(v / n) + 1) + ' = ' + n * (M.floor(v / n) + 1) + '$. ' + v + ' falls between them.', 'False: ' + v + ' is not a multiple of ' + n + '.'],
        hint: 'Is ' + v + ' equal to ' + n + ' times some whole number?'
      };
    }
    var m = [12, 15, 16, 18, 20, 24].filter(function (x) { return U.factors(x).length >= 4; }), base = ctx.level === 1 ? n : R.pick(m);
    var facs = U.factors(base).filter(function (f) { return f > 1 && f < base; });
    if (kind === 'which') {
      var right = base * R.int(2, 5), wr = R.sample(facs, M.min(2, facs.length)), extra = [];
      while (wr.length + extra.length < 3) { var e = base * R.int(1, 6) + R.int(1, base - 1); if (extra.indexOf(e) < 0) extra.push(e); }
      return {
        q: 'Which number is a multiple of ' + base + '?', a: mcOf(String(right), wr.map(String).concat(extra.map(String))),
        steps: ['A multiple of ' + base + ' is ' + base + ' times a whole number: ' + [1, 2, 3, 4, 5].map(function (t) { return base * t; }).join(', ') + ', …', right + ' = ' + base + ' × ' + right / base + ', so ' + right + ' is a multiple of ' + base + '.', wr.length ? U.list(wr.map(String)) + (wr.length > 1 ? ' are factors' : ' is a factor') + ' of ' + base + ' (they divide it), not multiples (which ' + base + ' divides).' : ''].filter(Boolean),
        hint: 'Multiples of ' + base + ' are at least as big as ' + base + '.'
      };
    }
    var opts = [], i2;
    for (i2 = 0; i2 < 3; i2++) opts.push(n * R.int(2, 9));
    for (i2 = 0; i2 < 3; i2++) opts.push(n * R.int(2, 9) + R.int(1, n - 1));
    opts = U.uniq(opts); var good = opts.filter(function (x) { return x % n === 0; }).map(String);
    var shown = R.shuffle(opts.map(String)), idx = [];
    shown.forEach(function (x, i) { if (+x % n === 0) idx.push(i); });
    return {
      q: 'Which of these are multiples of ' + n + '? Choose all that apply.', a: { t: 'mc', choices: shown, v: idx, keep: true },
      steps: ['Divide each by ' + n + ' and keep the ones with no remainder.', 'Multiples of ' + n + ': ' + U.list(shown.filter(function (x) { return +x % n === 0; })) + '.'],
      hint: 'Skip-count by ' + n + ' and see which numbers you land on.'
    };
  });

  var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  var TRICKY = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 77, 81, 85, 87, 91, 93, 95, 99];
  function primeSteps(n) {
    if (n === 1) return ['1 has only one factor: 1 itself.', 'A prime has exactly two factors, so 1 is neither prime nor composite.'];
    if (U.isPrime(n)) {
      var tried = PRIMES.filter(function (p) { return p * p <= n; });
      return [(tried.length ? 'Try dividing by ' + U.list(tried.map(String)) + ': none of them divides ' + n + ' evenly' + (tried.length ? ' (and the next prime squared is more than ' + n + ')' : '') + '.' : n + ' has no factors other than 1 and ' + n + '.'), 'Its only factors are 1 and ' + n + ', so ' + n + ' is <b>prime</b>.'];
    }
    var f = U.primeFactors(n)[0];
    return ['$' + f + ' \\times ' + n / f + ' = ' + n + '$, so ' + f + ' is a factor of ' + n + '.', n + ' has more than two factors, so it is <b>composite</b>.'];
  }
  G('g4.prime-composite', function (R, ctx) {
    var kind = R.pick(L(ctx, ['classify', 'classify', 'whichP'], ['classify', 'whichP', 'whichC'], ['classify', 'whichP', 'all']));
    var max = L(ctx, 30, 60, 100);
    if (kind === 'classify') {
      var r = R.next(), n;
      if (r < 0.08) n = 1;
      else if (r < 0.5) n = R.pick(PRIMES.filter(function (p) { return p <= max; }));
      else n = R.pick(TRICKY.concat([4, 6, 8, 10, 12, 14, 16, 18, 22, 26, 34, 38, 46, 58]).filter(function (v) { return v <= max; }));
      return { q: 'Is ' + n + ' prime, composite, or neither?', a: mcKeep(['prime', 'composite', 'neither'], n === 1 ? 2 : U.isPrime(n) ? 0 : 1), steps: primeSteps(n), hint: 'Count the factors: exactly two (1 and itself) means prime; more than two means composite.' };
    }
    var odds = TRICKY.filter(function (v) { return v <= max; }), pr = PRIMES.filter(function (p) { return p > 2 && p <= max; });
    if (kind === 'whichP') {
      var p = R.pick(pr), w = R.sample(odds, 3);
      if (ctx.level === 1 && R.coin()) w[0] = 1;
      return { q: 'Which number is prime?', a: mcOf(String(p), w.map(String)), steps: primeSteps(p).concat(w.map(function (x) { return x === 1 ? '1 is neither prime nor composite.' : x + ' = ' + U.primeFactors(x)[0] + ' × ' + x / U.primeFactors(x)[0] + ', so it is composite.'; })), hint: 'Look for a factor pair other than 1 and the number itself.' };
    }
    if (kind === 'whichC') {
      var c = R.pick(odds), ws = R.sample(pr, 3);
      return { q: 'Which number is composite?', a: mcOf(String(c), ws.map(String)), steps: primeSteps(c).concat(['The others (' + U.list(ws.map(String)) + ') are prime: each has only 1 and itself as factors.']), hint: 'An odd number can still be composite. Try 3, 5 and 7.' };
    }
    var list = R.shuffle(R.sample(pr, 2).concat(R.sample(odds, 3)).concat(R.coin() ? [1] : [2])).map(String), v = [];
    list.forEach(function (x, i) { if (U.isPrime(+x)) v.push(i); });
    return {
      q: 'Which of these numbers are prime? Choose all that apply.', a: { t: 'mc', choices: list, v: v, keep: true },
      steps: list.map(function (x) { var k = +x; return k === 1 ? '1: neither prime nor composite.' : U.isPrime(k) ? k + ': prime (only 1 and ' + k + ').' : k + ': composite (' + U.primeFactors(k)[0] + ' × ' + k / U.primeFactors(k)[0] + ').'; }),
      hint: '2 is the only even prime. Odd numbers like 51 or 91 can be composite.'
    };
  });

  G('g4.number-patterns', function (R, ctx) {
    var kind = R.pick(L(ctx, ['next', 'next', 'nth'], ['nth', 'miss', 'feature', 'next'], ['nth', 'feature', 'mult', 'miss']));
    var st = R.int(1, L(ctx, 9, 15, 25)), k = R.int(2, L(ctx, 6, 9, 12)), terms = [];
    for (var i = 0; i < 12; i++) terms.push(st + i * k);
    var rule = 'Start at ' + st + '. Add ' + k + ' each time.';
    if (kind === 'next') return {
      q: rule + ' The pattern begins $' + terms.slice(0, 4).join(',\\ ') + ',\\ \\ldots$ What is the next number?', a: num(terms[4]),
      steps: ['Add ' + k + ' to the last number: $' + terms[3] + ' + ' + k + ' = ' + terms[4] + '$.'],
      hint: 'Use the rule on the last number shown.'
    };
    if (kind === 'nth') {
      var j = R.int(L(ctx, 5, 6, 8), L(ctx, 7, 10, 12));
      return {
        q: rule + ' What is the ' + U.ordinal(j) + ' number in the pattern?', a: num(terms[j - 1]),
        steps: ['Write the numbers: $' + terms.slice(0, j).join(',\\ ') + '$.', 'Or: from the 1st number to the ' + U.ordinal(j) + ' there are ' + (j - 1) + ' jumps of ' + k + ': $' + st + ' + ' + (j - 1) + ' \\times ' + k + ' = ' + terms[j - 1] + '$.'],
        hint: 'Count the jumps: the ' + U.ordinal(j) + ' number is ' + (j - 1) + ' jumps after the 1st.'
      };
    }
    if (kind === 'miss') {
      var at = R.int(1, 3), shown = terms.slice(0, 5).map(function (v, ii) { return ii === at ? '\\square' : String(v); });
      return {
        q: 'The pattern follows the rule "add the same number each time." Find the missing number: $' + shown.join(',\\ ') + '$', a: num(terms[at]),
        steps: ['The jump is the same each time: $' + (at === 0 ? terms[2] + ' - ' + terms[1] : terms[at === 1 ? 3 : 1] + ' - ' + terms[at === 1 ? 2 : 0]) + ' = ' + k + '$.', 'So the missing number is $' + terms[at - 1] + ' + ' + k + ' = ' + terms[at] + '$.'],
        hint: 'Find the jump from two numbers next to each other.'
      };
    }
    if (kind === 'mult') {
      var s0 = R.int(1, 5), f = R.pick([2, 2, 3]), tt = [s0]; for (var ii = 1; ii < 6; ii++) tt.push(tt[ii - 1] * f);
      return {
        q: 'Start at ' + s0 + '. Multiply by ' + f + ' each time: $' + tt.slice(0, 4).join(',\\ ') + ',\\ \\ldots$ What is the next number?', a: num(tt[4]),
        steps: ['Multiply the last number by ' + f + ': $' + tt[3] + ' \\times ' + f + ' = ' + tt[4] + '$.', 'Notice the jumps get bigger each time, because this rule multiplies instead of adding.'],
        hint: 'Use the rule on the last number.'
      };
    }
    // a feature the rule does not say
    var first8 = terms.slice(0, 8), allOdd = first8.every(function (v) { return v % 2; }), allEven = first8.every(function (v) { return !(v % 2); });
    var alt = first8.every(function (v, ii) { return ii === 0 || (v % 2) !== (first8[ii - 1] % 2); }), end = first8.every(function (v) { return v % 10 === first8[0] % 10; });
    var claims = [
      ['Every number in the pattern is odd.', allOdd], ['Every number in the pattern is even.', allEven],
      ['The numbers take turns: odd, even, odd, even, …', alt], ['Every number ends in the digit ' + (st % 10) + '.', end]
    ];
    var cl = R.pick(claims);
    var why = k % 2 === 0 ? 'Adding an even number (' + k + ') never changes odd or even, so every number is ' + (st % 2 ? 'odd' : 'even') + ' like the start.' : 'Adding an odd number (' + k + ') switches odd and even each time, so the numbers take turns.';
    return {
      q: rule + ' The pattern is $' + first8.join(',\\ ') + ',\\ \\ldots$ True or false: ' + cl[0], a: { t: 'tf', v: cl[1] },
      steps: [why, k % 10 === 0 ? 'Adding a multiple of 10 never changes the ones digit, so every number ends in ' + (st % 10) + '.' : 'The ones digit changes, because ' + k + ' is not a multiple of 10.', cl[1] ? 'So the statement is true.' : 'So the statement is false.'],
      hint: 'What does adding ' + k + ' do to an odd number? To an even number?'
    };
  });

  /* ================================================================ units: equivalent fractions; adding fractions and mixed numbers */

  var DENS = [2, 3, 4, 5, 6, 8, 10, 12];
  function properLowest(R, ds) { var d = R.pick(ds), n; for (var t = 0; t < 30; t++) { n = R.int(1, d - 1); if (lowest(n, d)) break; } if (!lowest(n, d)) n = 1; return [n, d]; }

  G('g4.equivalent-fractions-multiply', function (R, ctx) {
    var f = properLowest(R, L(ctx, [2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 8, 10], [3, 4, 5, 6, 8, 10, 12])), a = f[0], b = f[1];
    var k = R.int(2, L(ctx, 4, 6, 8)); if (b * k > 100) k = 2;
    var kind = R.pick(L(ctx, ['num', 'num', 'den'], ['num', 'den', 'which', 'factor'], ['den', 'which', 'tf', 'factor']));
    var why = 'Multiplying the top and bottom by ' + k + ' cuts every piece into ' + k + ' smaller pieces: there are ' + k + ' times as many pieces, each ' + k + ' times smaller, so the amount stays the same.';
    if (kind === 'num') return {
      q: 'Find the missing number: $' + fq(a, b) + ' = ' + fq('?', b * k) + '$', a: num(a * k),
      steps: ['The bottom went from ' + b + ' to ' + b * k + ': it was multiplied by ' + k + '.', 'Multiply the top by the same number: $' + a + ' \\times ' + k + ' = ' + a * k + '$.', why, 'So $' + fq(a, b) + ' = ' + fq(a * k, b * k) + '$.'],
      hint: 'What was the denominator multiplied by? Do the same to the numerator.'
    };
    if (kind === 'den') return {
      q: 'Find the missing number: $' + fq(a, b) + ' = ' + fq(a * k, '?') + '$', a: num(b * k),
      steps: ['The top went from ' + a + ' to ' + a * k + ': it was multiplied by ' + k + '.', 'Multiply the bottom by the same number: $' + b + ' \\times ' + k + ' = ' + b * k + '$.', 'So $' + fq(a, b) + ' = ' + fq(a * k, b * k) + '$.'],
      hint: 'What was the numerator multiplied by? Do the same to the denominator.'
    };
    if (kind === 'factor') return {
      q: '$' + fq(a, b) + ' = ' + fq(a * k, b * k) + '$. What number were the top and bottom both multiplied by?', a: num(k),
      steps: ['$' + a + ' \\times ' + k + ' = ' + a * k + '$ and $' + b + ' \\times ' + k + ' = ' + b * k + '$.', 'Both were multiplied by ' + k + '. ' + why],
      hint: 'What times ' + b + ' makes ' + b * k + '?'
    };
    if (kind === 'which') {
      var wrongs = [fq(a + k, b + k), fq(a * k, b), fq(a, b * k), fq(a * k + 1, b * k)].filter(function (s) { return s !== fq(a * k, b * k); });
      return {
        q: 'Which fraction is equivalent to $' + fq(a, b) + '$?', a: mcOf('$' + fq(a * k, b * k) + '$', wrongs.map(function (s) { return '$' + s + '$'; })),
        steps: ['Multiply the top and the bottom by the same number, ' + k + ': $' + fq(a + ' \\times ' + k, b + ' \\times ' + k) + ' = ' + fq(a * k, b * k) + '$.', 'Adding the same number to the top and bottom (like $' + fq(a + k, b + k) + '$) does not keep the amount the same.'],
        hint: 'Equivalent fractions come from multiplying top and bottom by the same number.'
      };
    }
    // true / false, with the "add the same number" trap half the time
    var add = R.coin(), c = R.int(1, 3), right = add ? [a + c, b + c] : [a * k, b * k], eq = right[0] * b === right[1] * a;
    return {
      q: 'True or false: $' + fq(a, b) + ' = ' + fq(right[0], right[1]) + '$', a: { t: 'tf', v: eq },
      steps: add ? ['$' + fq(right[0], right[1]) + '$ comes from adding ' + c + ' to the top and to the bottom. Adding does not keep the amount the same.', 'Check with multiplication: $' + a + ' \\times ' + right[1] + ' = ' + a * right[1] + '$ but $' + b + ' \\times ' + right[0] + ' = ' + b * right[0] + '$. They differ, so the statement is false.'] : ['$' + fq(right[0], right[1]) + '$ is $' + fq(a, b) + '$ with the top and bottom both multiplied by ' + k + '.', why, 'So the statement is true.'],
      hint: 'Was the top and bottom multiplied by the same number, or was something added?'
    };
  });

  G('g4.simplest-form', function (R, ctx) {
    var f = properLowest(R, L(ctx, [2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 8])), a = f[0], b = f[1];
    var k = L(ctx, R.int(2, 3), R.int(2, 6), R.pick([4, 6, 8, 9])); if (b * k > 100) k = 2;
    var A = a * k, B = b * k, kind = R.pick(L(ctx, ['simp', 'simp', 'miss'], ['simp', 'miss', 'tf'], ['simp', 'fix', 'tf']));
    var gsteps = ['Find a number that divides both ' + A + ' and ' + B + '. The greatest one is ' + k + '.', 'Divide the top and the bottom by ' + k + ': $' + fq(A + ' \\div ' + k, B + ' \\div ' + k) + ' = ' + fq(a, b) + '$.', 'The only common factor of ' + a + ' and ' + b + ' is 1, so $' + fq(a, b) + '$ is in simplest form: fewer, larger pieces, the same amount.'];
    if (k > 3 && (k === 4 || k === 8)) gsteps.splice(2, 0, '(You could also divide by 2 more than once: you would get the same answer.)');
    if (kind === 'simp') return { q: 'Write $' + fq(A, B) + '$ in simplest form.', a: num(a + '/' + b, 'frac'), steps: gsteps, hint: 'Divide the top and bottom by the same number. Keep going until only 1 divides both.' };
    if (kind === 'miss') return {
      q: 'Find the missing number: $' + fq(A, B) + ' = ' + fq('?', b) + '$', a: num(a),
      steps: ['The bottom went from ' + B + ' to ' + b + ': it was divided by ' + k + '.', 'Divide the top by the same number: $' + A + ' \\div ' + k + ' = ' + a + '$.', 'So $' + fq(A, B) + ' = ' + fq(a, b) + '$.'],
      hint: 'What was the denominator divided by? Divide the numerator by the same number.'
    };
    if (kind === 'tf') {
      var simple = R.coin(), P = simple ? f : [A, B];
      return {
        q: 'True or false: $' + fq(P[0], P[1]) + '$ is in simplest form.', a: { t: 'tf', v: simple },
        steps: simple ? ['The factors of ' + P[0] + ' and ' + P[1] + ' have only 1 in common.', 'So $' + fq(P[0], P[1]) + '$ is in simplest form: true.'] : ['Both ' + A + ' and ' + B + ' can be divided by ' + k + '.', '$' + fq(A, B) + ' = ' + fq(a, b) + '$, so it is not in simplest form: false.'],
        hint: 'Is there a number bigger than 1 that divides both the top and the bottom?'
      };
    }
    var who = names(R, 1)[0], d1 = U.factors(k).filter(function (x) { return x > 1 && x < k; })[0] || 2, d2 = k;
    return {
      q: who + ' simplified $' + fq(A, B) + '$ by dividing the top by ' + d1 + ' and the bottom by ' + d2 + '. That is not allowed. What is $' + fq(A, B) + '$ in simplest form?', a: num(a + '/' + b, 'frac'),
      steps: ['Dividing the top and bottom by different numbers changes the amount. They must be divided by the same number.'].concat(gsteps),
      hint: 'Use one number that divides both the top and the bottom.'
    };
  });

  G('g4.compare-benchmarks', function (R, ctx) {
    var kind = R.pick(L(ctx, ['half', 'half', 'one'], ['half', 'one', 'pair'], ['pair', 'pair', 'half', 'one']));
    function rel(n, d) { return 2 * n < d ? 0 : 2 * n > d ? 1 : 2; } // vs 1/2: less, more, equal
    function halfStep(n, d) { return 'Half of ' + d + ' is ' + (d % 2 ? M.floor(d / 2) + ' and a half' : d / 2) + '. $' + fq(n, d) + '$ has ' + n + ' ' + dn(d, n) + ', which is ' + (2 * n < d ? 'less than' : 2 * n > d ? 'more than' : 'exactly') + ' half of ' + d + '.'; }
    if (kind === 'half') {
      var d = R.pick(L(ctx, [4, 6, 8, 10], [3, 5, 6, 7, 8, 9, 10, 12], [5, 7, 9, 11, 12])), n = R.int(1, d - 1), r = rel(n, d);
      return {
        q: 'Is $' + fq(n, d) + '$ more than, less than, or equal to $\\dfrac{1}{2}$?', a: mcKeep(['more than $\\dfrac{1}{2}$', 'less than $\\dfrac{1}{2}$', 'equal to $\\dfrac{1}{2}$'], [1, 0, 2][r]),
        steps: [halfStep(n, d), 'So $' + fq(n, d) + '$ is ' + ['less than', 'more than', 'equal to'][r] + ' $\\dfrac{1}{2}$.'],
        hint: 'Double the numerator and compare it with the denominator.'
      };
    }
    if (kind === 'one') {
      var d2 = R.pick([3, 4, 5, 6, 8, 10]), n2 = R.int(1, 2 * d2 - 1), r2 = n2 < d2 ? 0 : n2 > d2 ? 1 : 2;
      if (R.chance(0.15)) { n2 = d2; r2 = 2; }
      return {
        q: 'Is $' + fq(n2, d2) + '$ more than, less than, or equal to 1?', a: mcKeep(['more than 1', 'less than 1', 'equal to 1'], [1, 0, 2][r2]),
        steps: ['One whole is $' + fq(d2, d2) + '$: all ' + d2 + ' ' + dn(d2) + '.', '$' + fq(n2, d2) + '$ has ' + (r2 === 2 ? 'exactly ' + d2 : r2 ? 'more than ' + d2 : 'fewer than ' + d2) + ' ' + dn(d2) + ', so it is ' + ['less than', 'more than', 'equal to'][r2] + ' 1.'],
        hint: 'How many ' + dn(d2) + ' make one whole?'
      };
    }
    var a, b, c, e, t;
    for (t = 0; t < 40; t++) { b = R.pick([3, 4, 5, 6, 7, 8, 9, 10, 12]); e = R.intNot(3, 12, b); a = R.int(1, b - 1); c = R.int(1, e - 1); if (rel(a, b) !== 2 && rel(c, e) !== 2 && rel(a, b) !== rel(c, e)) break; }
    if (rel(a, b) === 2 || rel(c, e) === 2 || rel(a, b) === rel(c, e)) { a = 3; b = 8; c = 4; e = 5; }
    var k = cmp(a + '/' + b, c + '/' + e);
    return {
      q: 'Use $\\dfrac{1}{2}$ to compare. Which sign makes this true? $' + fq(a, b) + ' \\;\\square\\; ' + fq(c, e) + '$', a: symMc(a + '/' + b, c + '/' + e),
      steps: [halfStep(a, b), halfStep(c, e), 'One is less than $\\dfrac{1}{2}$ and the other is more, so $' + fq(a, b) + ' ' + symTex(k) + ' ' + fq(c, e) + '$.'],
      hint: 'Compare each fraction with one half first.'
    };
  });

  G('g4.compare-fractions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['mult', 'samenum', 'mult'], ['unlike', 'unlike', 'mult', 'equal'], ['unlike', 'greatest', 'unlike', 'equal']));
    var a, b, c, e, t;
    if (kind === 'samenum') { a = R.int(1, 5); b = R.int(a + 1, 12); e = R.intNot(a + 1, 12, b); c = a; }
    else if (kind === 'mult') { b = R.pick([2, 3, 4, 5, 6]); e = b * R.pick([2, 2, 3]); if (e > 12) e = b * 2; a = R.int(1, b - 1); c = R.int(1, e - 1); if (c * b === a * e) c = c === e - 1 ? c - 1 : c + 1; }
    else if (kind === 'equal') { var f = properLowest(R, [2, 3, 4, 5, 6]), k = R.int(2, 3); a = f[0]; b = f[1]; c = a * k; e = b * k; }
    else if (kind === 'unlike') { for (t = 0; t < 40; t++) { b = R.pick([3, 4, 5, 6, 8, 10, 12]); e = R.pick([3, 4, 5, 6, 8, 10, 12]); a = R.int(1, b - 1); c = R.int(1, e - 1); if (b !== e && a * e !== c * b && b % e && e % b) break; } }
    if (R.coin() && kind !== 'greatest') { var s1 = a, s2 = b; a = c; b = e; c = s1; e = s2; }
    if (kind === 'greatest') {
      var fs = [], tries = 0;
      while (fs.length < 3 && tries++ < 50) { var dd = R.pick([3, 4, 5, 6, 8, 10, 12]), nn = R.int(1, dd - 1); if (lowest(nn, dd) && fs.every(function (x) { return x[0] * dd !== nn * x[1] && x[1] !== dd; })) fs.push([nn, dd]); }
      while (fs.length < 3) fs.push([fs.length + 1, 12]);
      var best = fs.slice().sort(function (x, y) { return y[0] * x[1] - x[0] * y[1]; })[0], L2 = U.lcm(fs[0][1], fs[1][1], fs[2][1]);
      return {
        q: 'Which fraction is greatest?', a: mcOf('$' + fq(best[0], best[1]) + '$', fs.filter(function (x) { return x !== best; }).map(function (x) { return '$' + fq(x[0], x[1]) + '$'; })),
        steps: ['Rename them with a common denominator, ' + L2 + ': ' + fs.map(function (x) { return '$' + fq(x[0], x[1]) + ' = ' + fq(x[0] * L2 / x[1], L2) + '$'; }).join(', ') + '.', 'The most ' + dn(L2) + ' is $' + fq(best[0] * L2 / best[1], L2) + '$, so $' + fq(best[0], best[1]) + '$ is greatest.'],
        hint: 'Give them all the same denominator, or compare each with $\\dfrac{1}{2}$ first.'
      };
    }
    var k2 = cmp(a + '/' + b, c + '/' + e), steps;
    if (a === c && b !== e) steps = ['Both fractions have ' + a + ' piece' + (a > 1 ? 's' : '') + '. The pieces are different sizes.', 'A ' + dn(b, 1) + ' is ' + (b < e ? 'bigger' : 'smaller') + ' than a ' + dn(e, 1) + ', because the whole is cut into ' + (b < e ? 'fewer' : 'more') + ' parts.', 'So $' + fq(a, b) + ' ' + symTex(k2) + ' ' + fq(c, e) + '$.'];
    else if (b === e) steps = ['Same-size pieces: compare the number of pieces.', 'So $' + fq(a, b) + ' ' + symTex(k2) + ' ' + fq(c, e) + '$.'];
    else {
      var Lc = U.lcm(b, e);
      steps = ['Rename both with the common denominator ' + Lc + '.', '$' + fq(a, b) + ' = ' + fq(a * Lc / b, Lc) + '$' + (b === Lc ? ' (already in ' + dn(Lc) + ')' : ' (multiply top and bottom by ' + Lc / b + ')') + '.', '$' + fq(c, e) + ' = ' + fq(c * Lc / e, Lc) + '$' + (e === Lc ? ' (already in ' + dn(Lc) + ')' : ' (multiply top and bottom by ' + Lc / e + ')') + '.', 'Compare ' + a * Lc / b + ' and ' + c * Lc / e + ' ' + dn(Lc) + ': $' + fq(a, b) + ' ' + symTex(k2) + ' ' + fq(c, e) + '$.'];
    }
    return { q: 'Which sign makes this true? $' + fq(a, b) + ' \\;\\square\\; ' + fq(c, e) + '$', a: symMc(a + '/' + b, c + '/' + e), steps: steps, hint: 'Make the denominators the same, then compare the numerators.' };
  });

  G('g4.decompose-fractions', function (R, ctx) {
    var d = R.pick(L(ctx, [3, 4, 5, 6, 8], [5, 6, 8, 10, 12], [4, 5, 6, 8, 10, 12])), n = R.int(3, d - 1);
    var kind = R.pick(L(ctx, ['miss', 'unit', 'miss'], ['miss3', 'which', 'unit'], ['which', 'mixed', 'miss3']));
    if (kind === 'unit') return {
      q: 'How many copies of $' + fq(1, d) + '$ add up to $' + fq(n, d) + '$?', a: num(n),
      steps: ['$' + fq(n, d) + '$ means ' + n + ' pieces of size $' + fq(1, d) + '$.', (n <= 5 ? '$' + Array(n + 1).join(fq(1, d) + ' + ').slice(0, -3) + ' = ' + fq(n, d) + '$' : '$' + fq(1, d) + ' + ' + fq(1, d) + ' + \\cdots + ' + fq(1, d) + ' = ' + fq(n, d) + '$ with ' + n + ' copies') + ', so the answer is ' + n + '.'],
      hint: 'The numerator counts the pieces.'
    };
    if (kind === 'miss') {
      var p = R.int(1, n - 1);
      return {
        q: 'Find the missing number: $' + fq(n, d) + ' = ' + fq(p, d) + ' + ' + fq('?', d) + '$', a: num(n - p),
        steps: ['All the pieces are ' + dn(d) + ', so just count pieces.', n + ' ' + dn(d) + ' is ' + p + ' ' + dn(d, p) + ' and ' + (n - p) + ' more: $' + p + ' + ' + (n - p) + ' = ' + n + '$.', 'So $' + fq(n, d) + ' = ' + fq(p, d) + ' + ' + fq(n - p, d) + '$.'],
        hint: 'What plus ' + p + ' makes ' + n + '?'
      };
    }
    if (kind === 'miss3') {
      var p1 = R.int(1, n - 2), p2 = R.int(1, n - p1 - 1);
      return {
        q: 'Find the missing number: $' + fq(n, d) + ' = ' + fq(p1, d) + ' + ' + fq(p2, d) + ' + ' + fq('?', d) + '$', a: num(n - p1 - p2),
        steps: ['Count the ' + dn(d) + ': $' + p1 + ' + ' + p2 + ' = ' + (p1 + p2) + '$ so far.', 'You need ' + n + ' in all: $' + n + ' - ' + (p1 + p2) + ' = ' + (n - p1 - p2) + '$.'],
        hint: 'Add the numerators you have. How many more ' + dn(d) + ' make ' + n + '?'
      };
    }
    if (kind === 'which') {
      var q1 = R.int(1, n - 1), right = fq(q1, d) + ' + ' + fq(n - q1, d);
      var h1 = M.floor(d / 2), h2 = d - h1, target = Q(n, d);
      var w = [[fq(q1, h1) + ' + ' + fq(n - q1, h2), Q(q1, h1).add(Q(n - q1, h2))], [fq(q1, d) + ' + ' + fq(n - q1, d * 2), Q(q1, d).add(Q(n - q1, 2 * d))], [fq(q1, d) + ' + ' + fq(n - q1 + 1, d), Q(n + 1, d)], [fq(1, d) + ' + ' + fq(1, d) + ' + ' + fq(1, d) + (n === 3 ? ' + ' + fq(1, d) : ''), Q(n === 3 ? 4 : 3, d)]]
        .filter(function (x) { return !x[1].eq(target); }).map(function (x) { return x[0]; }).slice(0, 3);
      return {
        q: 'Which sum is equal to $' + fq(n, d) + '$?', a: mcOf('$' + right + '$', w.map(function (s) { return '$' + s + '$'; })),
        steps: ['To make ' + dn(d) + ', every piece must be a ' + dn(d, 1) + ', and the numerators must add to ' + n + '.', '$' + right + ' = ' + fq(n, d) + '$ because $' + q1 + ' + ' + (n - q1) + ' = ' + n + '$.'],
        hint: 'Look for a sum where every denominator is ' + d + ' and the numerators add to ' + n + '.'
      };
    }
    var wh = R.int(1, 3), fn = R.int(1, d - 1);
    var parts = []; for (var i = 0; i < wh; i++) parts.push(fq(d, d));
    return {
      q: 'Find the missing number: $' + mx(wh, fn, d) + ' = ' + parts.join(' + ') + ' + ' + fq('?', d) + '$', a: num(fn),
      steps: ['Each whole is $' + fq(d, d) + '$, so ' + wh + ' whole' + (wh > 1 ? 's are' : ' is') + ' $' + parts.join(' + ') + '$.', 'The fraction part $' + fq(fn, d) + '$ is what is left, so the missing number is ' + fn + '.'],
      hint: 'Each $' + fq(d, d) + '$ is one whole. What is left after the wholes?'
    };
  });

  G('g4.add-like-fractions', function (R, ctx) {
    var d = R.pick(L(ctx, [3, 4, 5, 6, 8], [4, 5, 6, 8, 10, 12], [5, 6, 8, 10, 12])), kind = R.pick(L(ctx, ['add', 'add', 'sub'], ['add', 'sub', 'big'], ['three', 'miss', 'fromone', 'sub']));
    var a, b, c;
    function ans(n) { return num(vr(n, d)); }
    var note = 'The pieces stay ' + dn(d) + ', so the denominator stays ' + d + '. Only the number of pieces changes.';
    if (kind === 'add' || kind === 'big') {
      if (kind === 'add') { a = R.int(1, d - 2); b = R.int(1, d - 1 - a); } else { a = R.int(2, d - 1); b = R.int(d - a + 1 > d - 1 ? 1 : d - a + 1, d - 1); }
      return {
        q: 'Add: $' + fq(a, d) + ' + ' + fq(b, d) + '$', a: ans(a + b),
        steps: [a + ' ' + dn(d, a) + ' plus ' + b + ' ' + dn(d, b) + ' is ' + (a + b) + ' ' + dn(d, a + b) + '.', note, '$' + fq(a, d) + ' + ' + fq(b, d) + ' = ' + fq(a + b, d) + '$' + (a + b >= d ? ' $= ' + mr(a + b, d) + '$' : '') + '.'],
        hint: 'Add the numerators. Does the size of the pieces change?'
      };
    }
    if (kind === 'sub') {
      a = R.int(3, ctx.level >= 2 ? 2 * d - 1 : d - 1); b = R.int(1, M.min(a - 1, d - 1));
      return {
        q: 'Subtract: $' + fq(a, d) + ' - ' + fq(b, d) + '$', a: ans(a - b),
        steps: [a + ' ' + dn(d, a) + ' take away ' + b + ' ' + dn(d, b) + ' leaves ' + (a - b) + ' ' + dn(d, a - b) + '.', note, '$' + fq(a, d) + ' - ' + fq(b, d) + ' = ' + fq(a - b, d) + '$.'],
        hint: 'Subtract the numerators. The denominator stays the same.'
      };
    }
    if (kind === 'three') {
      a = R.int(1, d - 2); b = R.int(1, d - 1); c = R.int(1, d - 1);
      return {
        q: 'Add: $' + fq(a, d) + ' + ' + fq(b, d) + ' + ' + fq(c, d) + '$', a: ans(a + b + c),
        steps: ['Count all the ' + dn(d) + ': $' + a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + '$.', note, 'The sum is $' + fq(a + b + c, d) + '$' + (a + b + c >= d ? ', which is $' + mr(a + b + c, d) + '$' : '') + '.'],
        hint: 'Add all three numerators.'
      };
    }
    if (kind === 'miss') {
      a = R.int(1, d - 2); c = R.int(a + 1, d - 1);
      return {
        q: 'Find the missing fraction: $' + fq(a, d) + ' + \\square = ' + fq(c, d) + '$', a: ans(c - a),
        steps: ['How many more ' + dn(d) + ' does ' + a + ' need to reach ' + c + '? $' + c + ' - ' + a + ' = ' + (c - a) + '$.', 'The missing fraction is $' + fq(c - a, d) + '$.'],
        hint: 'Subtract: $' + fq(c, d) + ' - ' + fq(a, d) + '$.'
      };
    }
    b = R.int(1, d - 1);
    return {
      q: 'Subtract: $1 - ' + fq(b, d) + '$', a: ans(d - b),
      steps: ['Write 1 as ' + dn(d) + ': $1 = ' + fq(d, d) + '$.', '$' + fq(d, d) + ' - ' + fq(b, d) + ' = ' + fq(d - b, d) + '$.'],
      hint: 'How many ' + dn(d) + ' make 1 whole?'
    };
  });

  G('g4.mixed-numbers', function (R, ctx) {
    var d = R.pick(L(ctx, [2, 3, 4, 5], [3, 4, 5, 6, 8], [4, 5, 6, 8, 10, 12])), w = R.int(1, L(ctx, 3, 5, 9)), n;
    for (var t = 0; t < 20; t++) { n = R.int(1, d - 1); if (lowest(n, d)) break; }
    if (!lowest(n, d)) n = 1;
    var N = w * d + n, kind = R.pick(L(ctx, ['toImp', 'toMix', 'wholes'], ['toImp', 'toMix', 'toMix', 'wholes'], ['toImp', 'toMix', 'which']));
    if (kind === 'toImp') return {
      q: 'Write $' + mx(w, n, d) + '$ as a fraction.', a: num(N + '/' + d, 'frac'),
      steps: ['Each whole is $' + fq(d, d) + '$, so ' + w + ' whole' + (w > 1 ? 's are' : ' is') + ' $' + w + ' \\times ' + d + ' = ' + w * d + '$ ' + dn(d) + '.', 'Add the ' + n + ' extra ' + dn(d, n) + ': $' + w * d + ' + ' + n + ' = ' + N + '$.', 'So $' + mx(w, n, d) + ' = ' + fq(N, d) + '$.'],
      hint: 'How many ' + dn(d) + ' are in each whole? Count all the ' + dn(d) + '.'
    };
    if (kind === 'toMix') return {
      q: 'Write $' + fq(N, d) + '$ as a mixed number.', a: num(qv(N + '/' + d), 'mixed'),
      steps: ['Every ' + d + ' ' + dn(d) + ' make one whole. How many wholes fit in ' + N + ' ' + dn(d) + '? $' + N + ' \\div ' + d + ' = ' + w + '$ R ' + n + '.', 'That is ' + w + ' whole' + (w > 1 ? 's' : '') + ' and ' + n + ' ' + dn(d, n) + ' left over.', 'So $' + fq(N, d) + ' = ' + mx(w, n, d) + '$.'],
      hint: 'How many groups of ' + d + ' are in ' + N + '? The leftover stays as ' + dn(d) + '.'
    };
    if (kind === 'wholes') {
      var W2 = R.int(2, 6);
      return {
        q: 'How many ' + dn(d) + ' are in ' + W2 + ' wholes?', a: num(W2 * d),
        steps: ['One whole is ' + d + ' ' + dn(d) + '.', W2 + ' wholes are $' + W2 + ' \\times ' + d + ' = ' + W2 * d + '$ ' + dn(d) + ', so $' + W2 + ' = ' + fq(W2 * d, d) + '$.'],
        hint: 'One whole is $' + fq(d, d) + '$.'
      };
    }
    var wr = [fq(w * n, d), fq(w + n, d), fq(N, d * w), fq(w * d + n + 1, d)].filter(function (s) { return s !== fq(N, d); });
    return {
      q: 'Which fraction is equal to $' + mx(w, n, d) + '$?', a: mcOf('$' + fq(N, d) + '$', wr.map(function (s) { return '$' + s + '$'; })),
      steps: [w + ' whole' + (w > 1 ? 's are' : ' is') + ' $' + w * d + '$ ' + dn(d) + '. Add $' + n + '$ more: $' + w * d + ' + ' + n + ' = ' + N + '$.', 'So $' + mx(w, n, d) + ' = ' + fq(N, d) + '$. (Multiplying ' + w + ' by ' + n + ', or adding ' + w + ' + ' + n + ', does not count the wholes as ' + dn(d) + '.)'],
      hint: 'Turn the wholes into ' + dn(d) + ' first.'
    };
  });

  /* a + or − problem with mixed numbers whose answer has a fraction part in lowest terms (or none) */
  function mixedPair(R, d, regroup, op) {
    for (var t = 0; t < 80; t++) {
      var w1 = R.int(1, 7), w2 = R.int(1, 5), n1 = R.int(0, d - 1), n2 = R.int(1, d - 1);
      if (op === '-') { if (w1 <= w2) w1 = w2 + R.int(1, 3); if (regroup !== n1 < n2) continue; if (!regroup && n1 === 0) continue; }
      else { if (regroup !== n1 + n2 >= d) continue; if (n1 === 0) continue; }
      var A = w1 * d + n1, B = w2 * d + n2, S = op === '-' ? A - B : A + B;
      if (S <= 0) continue;
      var fp = S % d; if (fp && !lowest(fp, d)) continue;
      if (n1 && !lowest(n1, d)) continue; if (!lowest(n2, d)) continue;
      return [w1, n1, w2, n2, S];
    }
    return op === '-' ? [3, 1, 1, 2, 3 * d + 1 - d - 2] : [2, 1, 1, 1, 3 * d + 2];
  }
  G('g4.add-mixed-numbers', function (R, ctx) {
    var d = R.pick(L(ctx, [3, 4, 5, 8], [3, 4, 5, 6, 8, 10], [4, 5, 6, 8, 10, 12])), op = R.coin() ? '+' : '-';
    var regroup = L(ctx, false, R.chance(0.6), R.chance(0.7)), kind = ctx.level === 3 && R.chance(0.25) ? 'whole' : 'pair';
    if (kind === 'whole') {
      var W0 = R.int(3, 8), w2 = R.int(1, W0 - 1), n2 = R.int(1, d - 1); if (!lowest(n2, d)) n2 = 1;
      var S0 = W0 * d - (w2 * d + n2);
      return {
        q: 'Subtract: $' + W0 + ' - ' + mx(w2, n2, d) + '$', a: num(qv(S0 + '/' + d), 'mixed'),
        steps: ['There is no fraction part to subtract from, so trade 1 whole for $' + fq(d, d) + '$: $' + W0 + ' = ' + mx(W0 - 1, d, d) + '$.', 'Fractions: $' + fq(d, d) + ' - ' + fq(n2, d) + ' = ' + fq(d - n2, d) + '$. Wholes: $' + (W0 - 1) + ' - ' + w2 + ' = ' + (W0 - 1 - w2) + '$.', 'So $' + W0 + ' - ' + mx(w2, n2, d) + ' = ' + qt(S0 + '/' + d) + '$.'],
        hint: 'Write ' + W0 + ' as ' + (W0 - 1) + ' and $' + fq(d, d) + '$.'
      };
    }
    var p = mixedPair(R, d, regroup, op), w1 = p[0], n1 = p[1], ww2 = p[2], nn2 = p[3], S = p[4];
    var A = mx(w1, n1, d), B = mx(ww2, nn2, d), steps;
    if (op === '+') {
      var fs = n1 + nn2, ws = w1 + ww2;
      steps = ['Add the wholes: $' + w1 + ' + ' + ww2 + ' = ' + ws + '$.', 'Add the fractions: $' + fq(n1, d) + ' + ' + fq(nn2, d) + ' = ' + fq(fs, d) + '$.'];
      if (fs >= d) steps.push('$' + fq(fs, d) + '$ is ' + (fs === d ? 'one whole' : 'more than one whole: $' + fq(fs, d) + ' = 1' + (fs - d ? fq(fs - d, d) : '') + '$') + '. Regroup: ' + ws + ' + 1 = ' + (ws + 1) + ' wholes' + (fs - d ? ' and $' + fq(fs - d, d) + '$' : '') + '.');
      steps.push('So $' + A + ' + ' + B + ' = ' + qt(S + '/' + d) + '$.');
    } else {
      steps = [];
      var top = n1, tw = w1;
      if (n1 < nn2) { steps.push('$' + fq(n1, d) + '$ is less than $' + fq(nn2, d) + '$, so trade 1 whole for $' + fq(d, d) + '$ (not $' + fq(10, d) + '$: one whole is ' + d + ' ' + dn(d) + '). $' + A + ' = ' + mx(w1 - 1, n1 + d, d) + '$.'); top = n1 + d; tw = w1 - 1; }
      steps.push('Subtract the fractions: $' + fq(top, d) + ' - ' + fq(nn2, d) + ' = ' + fq(top - nn2, d) + '$.');
      steps.push('Subtract the wholes: $' + tw + ' - ' + ww2 + ' = ' + (tw - ww2) + '$.');
      steps.push('So $' + A + ' - ' + B + ' = ' + qt(S + '/' + d) + '$.');
    }
    return { q: (op === '+' ? 'Add' : 'Subtract') + ': $' + A + (op === '+' ? ' + ' : ' - ') + B + '$', a: num(qv(S + '/' + d), 'mixed'), steps: steps, hint: op === '+' ? 'Add wholes to wholes and fractions to fractions. Regroup if the fractions make a whole.' : 'If the first fraction is too small, trade 1 whole for $' + fq(d, d) + '$.' };
  });

  G('g4.like-fraction-word-problems', function (R, ctx) {
    var d = R.pick(L(ctx, [4, 8, 10], [4, 6, 8, 10, 12], [4, 6, 8, 10, 12])), nm = names(R, 2), kind = R.pick(L(ctx, ['add', 'sub', 'add'], ['add', 'sub', 'mixadd', 'mixsub'], ['mixadd', 'mixsub', 'three', 'more']));
    var a, b, c, S;
    if (kind === 'add' || kind === 'sub') {
      if (kind === 'add') { a = R.int(1, d - 2); b = R.int(1, d - 1 - a); S = a + b; } else { a = R.int(3, d - 1); b = R.int(1, a - 1); S = a - b; }
      var s = R.pick([
        ['mile', 'miles', kind === 'add' ? nm[0] + ' ran $' + fq(a, d) + '$ mile in the morning and $' + fq(b, d) + '$ mile after school. How far did ' + nm[0] + ' run in all?' : nm[0] + ' had a $' + fq(a, d) + '$-mile walk to do and has gone $' + fq(b, d) + '$ mile. How much farther is left?'],
        ['liter', 'liters', kind === 'add' ? 'A pitcher has $' + fq(a, d) + '$ liter of water. ' + nm[0] + ' pours in $' + fq(b, d) + '$ liter more. How much water is in the pitcher now?' : 'A pitcher has $' + fq(a, d) + '$ liter of juice. ' + nm[0] + ' drinks $' + fq(b, d) + '$ liter. How much juice is left?'],
        ['inch', 'inches', kind === 'add' ? 'It rained $' + fq(a, d) + '$ inch on Monday and $' + fq(b, d) + '$ inch on Tuesday. How much rain fell in the two days?' : 'A plant was $' + fq(a, d) + '$ inch tall. A seedling next to it is $' + fq(b, d) + '$ inch tall. How much taller is the plant?']
      ]);
      return {
        q: s[2], a: num(vr(S, d)), unit: s[1],
        steps: [kind === 'add' ? 'Put the amounts together: add.' : 'Find what is left or the difference: subtract.', '$' + fq(a, d) + (kind === 'add' ? ' + ' : ' - ') + fq(b, d) + ' = ' + fq(S, d) + '$ ' + s[1] + '. The ' + dn(d) + ' stay ' + dn(d) + '.'],
        hint: 'Is the story putting together (add) or taking away / comparing (subtract)?'
      };
    }
    if (kind === 'three') {
      a = R.int(1, d - 1); b = R.int(1, d - 1); c = R.int(1, d - 1); S = a + b + c;
      return {
        q: 'A trail has three parts. They are $' + fq(a, d) + '$ mile, $' + fq(b, d) + '$ mile and $' + fq(c, d) + '$ mile long. How long is the whole trail?', a: num(vr(S, d)), unit: 'miles',
        steps: ['Add all three: $' + fq(a, d) + ' + ' + fq(b, d) + ' + ' + fq(c, d) + ' = ' + fq(S, d) + '$.', S >= d ? 'That is at least one whole: $' + fq(S, d) + ' = ' + mr(S, d) + '$ miles.' : 'The trail is $' + fq(S, d) + '$ mile long.'],
        hint: 'Add the three numerators.'
      };
    }
    var p = mixedPair(R, d, R.coin(), kind === 'mixadd' ? '+' : '-'), A = mx(p[0], p[1], d), B = mx(p[2], p[3], d);
    S = p[4];
    var sx = kind === 'mixadd' ? R.pick([
      ['feet', 'A board is $' + A + '$ feet long. ' + nm[0] + ' glues on another piece $' + B + '$ feet long. How long is the board now?'],
      ['cups', 'A recipe uses $' + A + '$ cups of flour for the bread and $' + B + '$ cups for the rolls. How much flour is that in all?'],
      ['hours', nm[0] + ' practiced piano for $' + A + '$ hours last week and $' + B + '$ hours this week. How many hours is that in all?']
    ]) : kind === 'mixsub' ? R.pick([
      ['feet', 'A rope is $' + A + '$ feet long. ' + nm[0] + ' cuts off $' + B + '$ feet. How much rope is left?'],
      ['pounds', 'A bag holds $' + A + '$ pounds of apples. ' + nm[0] + ' uses $' + B + '$ pounds to make a pie. How many pounds are left?'],
      ['gallons', 'A tank has $' + A + '$ gallons of water. $' + B + '$ gallons leak out. How much water is left?']
    ]) : R.pick([
      ['inches', nm[0] + '\'s plant is $' + A + '$ inches tall. ' + nm[1] + '\'s plant is $' + B + '$ inches tall. How much taller is ' + nm[0] + '\'s plant?'],
      ['miles', nm[0] + ' biked $' + A + '$ miles. ' + nm[1] + ' biked $' + B + '$ miles. How much farther did ' + nm[0] + ' bike?']
    ]);
    var add = kind === 'mixadd';
    return {
      q: sx[1], a: num(vr(S, d)), unit: sx[0],
      steps: [add ? 'Put the amounts together: add.' : 'Find what is left or how much more: subtract.', add ? 'Wholes: $' + p[0] + ' + ' + p[2] + ' = ' + (p[0] + p[2]) + '$. Fractions: $' + fq(p[1], d) + ' + ' + fq(p[3], d) + ' = ' + fq(p[1] + p[3], d) + '$' + (p[1] + p[3] >= d ? ', which is at least one whole, so regroup' : '') + '.' : (p[1] < p[3] ? 'Trade 1 whole for $' + fq(d, d) + '$: $' + A + ' = ' + mx(p[0] - 1, p[1] + d, d) + '$. ' : '') + 'Subtract the fractions, then the wholes.', 'The answer is $' + mr(S, d) + '$ ' + sx[0] + '.'],
      hint: add ? 'Add wholes and fractions separately, then regroup if you can.' : 'Subtract fractions first; trade a whole if the top fraction is too small.'
    };
  });

  G('g4.fraction-times-whole', function (R, ctx) {
    var d = R.pick(L(ctx, [3, 4, 5, 6, 8], [3, 4, 5, 6, 8, 10, 12], [4, 5, 6, 8, 10, 12])), a = R.int(L(ctx, 1, 1, 2), L(ctx, 1, d - 1, d - 1)), n = R.int(L(ctx, 2, 2, 3), L(ctx, 6, 8, 9));
    if (ctx.level === 1 && R.coin()) a = R.int(1, d - 1);
    var P = n * a, kind = R.pick(L(ctx, ['calc', 'unit', 'calc'], ['calc', 'story', 'which', 'unit'], ['story', 'which', 'between', 'calc']));
    var core = ['$' + n + ' \\times ' + fq(a, d) + '$ means ' + n + ' groups of $' + fq(a, d) + '$: $' + Array(n + 1).join(fq(a, d) + ' + ').slice(0, -3) + '$.', 'That is ' + n + ' × ' + a + ' = ' + P + ' ' + dn(d, P) + ': $' + fq(P, d) + '$' + (P >= d ? ' $= ' + mr(P, d) + '$' : '') + '.', 'Only the number of pieces is multiplied. The pieces are still ' + dn(d) + '.'];
    if (n > 5) core[0] = '$' + n + ' \\times ' + fq(a, d) + '$ means ' + n + ' groups of $' + fq(a, d) + '$, which is ' + n + ' × ' + a + ' pieces of size $' + fq(1, d) + '$.';
    if (kind === 'calc') return { q: 'Multiply: $' + n + ' \\times ' + fq(a, d) + '$', a: num(vr(P, d)), steps: core, hint: 'Count the pieces: ' + n + ' groups of ' + a + ' ' + dn(d, a) + '.' };
    if (kind === 'unit') {
      var m = R.int(2, d - 1);
      return { q: 'Fill in the number: $' + fq(m, d) + ' = \\,?\\, \\times ' + fq(1, d) + '$', a: num(m), steps: ['$' + fq(m, d) + '$ is ' + m + ' pieces, each $' + fq(1, d) + '$.', 'So $' + fq(m, d) + ' = ' + m + ' \\times ' + fq(1, d) + '$.'], hint: 'How many ' + dn(d) + ' are in $' + fq(m, d) + '$?' };
    }
    if (kind === 'story') {
      var s = R.pick([['cups', 'A recipe uses $' + fq(a, d) + '$ cup of milk for each batch. How much milk is needed for ' + n + ' batches?'], ['miles', 'Each lap around the park is $' + fq(a, d) + '$ mile. How far is ' + n + ' laps?'], ['pounds', 'Each bag of nuts weighs $' + fq(a, d) + '$ pound. How much do ' + n + ' bags weigh?']]);
      return { q: s[1], a: num(vr(P, d)), unit: s[0], steps: ['Equal groups: multiply $' + n + ' \\times ' + fq(a, d) + '$.'].concat(core.slice(1)), hint: n + ' equal amounts of $' + fq(a, d) + '$: multiply.' };
    }
    if (kind === 'which') {
      if (a === 1) a = 2, P = n * a;
      return {
        q: 'Which is equal to $' + n + ' \\times ' + fq(a, d) + '$?', a: mcOf('$' + fq(n * a, d) + '$', ['$' + fq(n * a, n * d) + '$', '$' + fq(n + a, d) + '$', '$' + fq(a, n * d) + '$']),
        steps: [n + ' groups of ' + a + ' ' + dn(d, a) + ' is ' + n * a + ' ' + dn(d, n * a) + ': $' + fq(n * a, d) + '$.', 'Multiplying the bottom too ($' + fq(n * a, n * d) + '$) would make the pieces smaller, and that equals $' + fq(a, d) + '$ again, not ' + n + ' times as much.'],
        hint: 'Only the number of pieces changes.'
      };
    }
    var lo = M.floor(P / d);
    if (P % d === 0) { a = a === d - 1 ? a - 1 : a + 1; if (a < 1) a = 1; P = n * a; lo = M.floor(P / d); }
    if (P % d === 0) { n += 1; P = n * a; lo = M.floor(P / d); }
    var ch = [lo + ' and ' + (lo + 1), (lo + 1) + ' and ' + (lo + 2), (lo > 0 ? (lo - 1) + ' and ' + lo : (lo + 2) + ' and ' + (lo + 3)), (lo + 3) + ' and ' + (lo + 4)];
    return {
      q: '$' + n + ' \\times ' + fq(a, d) + '$ is between which two whole numbers?', a: mcOf(ch[0], ch.slice(1)),
      steps: ['$' + n + ' \\times ' + fq(a, d) + ' = ' + fq(P, d) + '$.', 'Every ' + d + ' ' + dn(d) + ' make a whole: $' + P + ' \\div ' + d + ' = ' + lo + '$ R ' + P % d + ', so $' + fq(P, d) + ' = ' + mr(P, d) + '$.', 'That is between ' + lo + ' and ' + (lo + 1) + '.'],
      hint: 'Find the product, then turn it into a mixed number.'
    };
  });

  /* ================================================================ unit: decimals */

  function dec2(h) { return Q(h, 100).toDec(2).replace(/0$/, '').replace(/\.$/, ''); } // hundredths -> "0.3", "0.07", "1.25"
  G('g4.tenths-hundredths', function (R, ctx) {
    var kind = R.pick(L(ctx, ['t2h', 't2h', 'h2t', 'add'], ['t2h', 'h2t', 'add', 'which'], ['add', 'add2', 'which', 'h2t']));
    var t = R.int(1, 9), h = R.int(1, 9);
    if (kind === 't2h') return {
      q: 'Find the missing number: $' + fq(t, 10) + ' = ' + fq('?', 100) + '$', a: num(t * 10),
      steps: ['Cut each tenth into 10 equal pieces. Each piece is a hundredth.', t + ' tenths become $' + t + ' \\times 10 = ' + t * 10 + '$ hundredths: multiply the top and bottom by 10.', 'So $' + fq(t, 10) + ' = ' + fq(t * 10, 100) + '$.'],
      hint: 'How many hundredths are in one tenth?'
    };
    if (kind === 'h2t') return {
      q: 'Find the missing number: $' + fq(t * 10, 100) + ' = ' + fq('?', 10) + '$', a: num(t),
      steps: ['10 hundredths make 1 tenth.', '$' + t * 10 + '$ hundredths is $' + t * 10 + ' \\div 10 = ' + t + '$ tenths: divide the top and bottom by 10.', 'So $' + fq(t * 10, 100) + ' = ' + fq(t, 10) + '$.'],
      hint: 'How many groups of 10 hundredths are there?'
    };
    if (kind === 'add' || kind === 'add2') {
      var h2 = kind === 'add2' ? R.int(11, 99 - t * 10) : h;
      if (kind === 'add2' && h2 % 10 === 0) h2 += 1;
      return {
        q: 'Add: $' + fq(t, 10) + ' + ' + fq(h2, 100) + ' = ' + fq('?', 100) + '$', a: num(t * 10 + h2),
        steps: ['Rename the tenths as hundredths so the pieces are the same size: $' + fq(t, 10) + ' = ' + fq(t * 10, 100) + '$.', 'Now add hundredths: $' + fq(t * 10, 100) + ' + ' + fq(h2, 100) + ' = ' + fq(t * 10 + h2, 100) + '$.', 'So the missing number is ' + (t * 10 + h2) + '.'],
        hint: 'Write the tenths as hundredths first.'
      };
    }
    var right = fq(t * 10, 100), wr = [fq(t, 100), fq(t + 10, 100), fq(t * 10, 10)];
    return {
      q: 'Which fraction is equal to $' + fq(t, 10) + '$?', a: mcOf('$' + right + '$', wr.map(function (s) { return '$' + s + '$'; })),
      steps: ['Each tenth is 10 hundredths, so ' + t + ' tenths are ' + t * 10 + ' hundredths.', '$' + fq(t, 10) + ' = ' + right + '$. ($' + fq(t, 100) + '$ is only ' + t + ' hundredths: 10 times smaller.)'],
      hint: 'Multiply the top and bottom by 10.'
    };
  });

  G('g4.decimal-notation', function (R, ctx) {
    var kind = R.pick(L(ctx, ['f2d', 'w2d', 'f2d', 'd2f'], ['f2d', 'w2d', 'd2f', 'digit', 'which'], ['f2d', 'mixed', 'digit', 'which', 'd2f']));
    var useH = R.coin(), v = useH ? R.int(1, 99) : R.int(1, 9) * 10, onlyH = useH && v < 10;
    if (ctx.level >= 2 && R.chance(0.4)) { v = R.int(1, 9); onlyH = true; useH = true; }
    var D = dec2(v);
    function placeSteps(hund) {
      var tt = M.floor(hund / 10), hh = hund % 10;
      return ['The first place after the decimal point is tenths; the second is hundredths.', (hh ? '$' + fq(hund, 100) + '$ is ' + tt + ' tenth' + (tt === 1 ? '' : 's') + ' and ' + hh + ' hundredth' + (hh === 1 ? '' : 's') + ', so the digits are ' + tt + ' (tenths) and ' + hh + ' (hundredths).' : tt + ' tenths: the digit ' + tt + ' goes in the tenths place.'), 'So the decimal is $' + dec2(hund) + '$.'];
    }
    if (kind === 'f2d') {
      var fr = useH ? fq(v, 100) : fq(v / 10, 10);
      return { q: 'Write $' + fr + '$ as a decimal.', a: num(D, 'dec'), steps: placeSteps(v), hint: onlyH ? 'Hundredths need two places after the point. Is the tenths place empty?' : 'Tenths take one place after the point; hundredths take two.' };
    }
    if (kind === 'w2d') {
      var words = useH ? (v === 1 ? 'one hundredth' : U.words(v) + ' hundredths') : U.words(v / 10) + ' tenth' + (v === 10 ? '' : 's');
      return { q: 'Write <i>' + words + '</i> as a decimal.', a: num(D, 'dec'), steps: placeSteps(v), hint: 'Hundredths end two places after the decimal point.' };
    }
    if (kind === 'mixed') {
      var w = R.int(1, 9);
      return { q: 'Write $' + w + fq(v, 100) + '$ as a decimal.', a: num(w + '.' + String(100 + v).slice(1), 'dec'), steps: ['The whole number ' + w + ' goes before the decimal point.'].concat(placeSteps(v).slice(1, 2)).concat(['So the decimal is $' + w + '.' + String(100 + v).slice(1) + '$.']), hint: 'Whole number, decimal point, then two places for hundredths.' };
    }
    if (kind === 'd2f') return {
      q: 'Find the missing number: $' + D + ' = ' + fq('?', 100) + '$', a: num(v),
      steps: ['$' + D + '$ is ' + (v >= 10 && v % 10 ? M.floor(v / 10) + ' tenths and ' + v % 10 + ' hundredths' : v % 10 === 0 ? v / 10 + ' tenths' : v + ' hundredth' + (v === 1 ? '' : 's')) + '.', (v % 10 === 0 ? v / 10 + ' tenths are ' + v + ' hundredths. ' : '') + 'So $' + D + ' = ' + fq(v, 100) + '$.'],
      hint: 'How many hundredths is it in all?'
    };
    if (kind === 'digit') {
      var w2 = R.int(1, 9), tt = R.int(1, 9), hh = R.intNot(1, 9, tt), x = w2 + '.' + tt + hh, ask = R.pick(['tenths', 'hundredths']);
      return { q: 'Which digit is in the ' + ask + ' place of $' + x + '$?', a: num(ask === 'tenths' ? tt : hh), steps: ['After the decimal point: the first place is tenths, the second is hundredths.', 'In $' + x + '$, the tenths digit is ' + tt + ' and the hundredths digit is ' + hh + '.'], hint: 'Count places to the right of the decimal point.' };
    }
    var dd = R.int(1, 9), t2 = R.coin();
    var right2 = t2 ? '0.' + dd : '0.0' + dd, wrong2 = t2 ? ['0.0' + dd, dd + '.0', '0.' + dd + dd] : ['0.' + dd, dd + '.0', '0.' + dd + dd];
    return {
      q: 'Which decimal means ' + U.words(dd) + ' ' + (t2 ? 'tenth' : 'hundredth') + (dd === 1 ? '' : 's') + '?', a: mcOf('$' + right2 + '$', wrong2.map(function (s) { return '$' + s + '$'; })),
      steps: [t2 ? 'Tenths are the first place after the decimal point.' : 'Hundredths are the second place after the decimal point, so the tenths place gets a 0.', U.words(dd) + ' ' + (t2 ? 'tenth' : 'hundredth') + (dd === 1 ? '' : 's') + ' is $' + right2 + '$.'],
      hint: t2 ? 'One place after the point.' : 'Two places after the point.'
    };
  });

  G('g4.compare-decimals', function (R, ctx) {
    var kind = R.pick(L(ctx, ['sym', 'sym', 'big'], ['sym', 'sym', 'big', 'small'], ['sym', 'big', 'small', 'sym']));
    function show(h) { return dec2(h); } // h in hundredths
    function stepsFor(a, b) {
      var A = String(100 + (a % 100)).slice(1), B = String(100 + (b % 100)).slice(1), wa = M.floor(a / 100), wb = M.floor(b / 100), k = cmp(a, b);
      var st = ['Write both with two decimal places so the pieces match: $' + wa + '.' + A + '$ and $' + wb + '.' + B + '$ (a 0 at the end does not change the amount).'];
      if (wa !== wb) st.push('Compare the whole numbers first: ' + wa + ' ' + symTex(cmp(wa, wb)) + ' ' + wb + '.');
      else st.push('Now compare hundredths: ' + (a % 100) + ' hundredths ' + ['is less than', 'is more than', 'equals'][k] + ' ' + (b % 100) + ' hundredths.');
      st.push('So $' + show(a) + ' ' + symTex(k) + ' ' + show(b) + '$.');
      return st;
    }
    if (kind === 'sym') {
      var a, b, m = R.int(0, 5), w = ctx.level === 3 ? R.int(0, 3) * 100 : 0;
      if (m === 0) { a = R.int(1, 9) * 10; b = a; }                                   // 0.5 and 0.50
      else if (m <= 2) { a = R.int(1, 9) * 10; b = R.int(11, 99); if (b % 10 === 0) b++; } // 0.3 vs 0.25: more digits is not bigger
      else if (m === 3) { var dg = R.int(1, 9); a = dg; b = dg * 10; }               // 0.07 vs 0.7
      else { a = R.int(1, 99); b = R.int(1, 99); if (a === b) b = a % 99 + 1; }
      a += w; b += w;
      if (ctx.level === 3 && R.coin()) { a = R.int(1, 3) * 100 + R.int(1, 9) * 10; b = a - R.int(1, 9); m = -1; }  // 1.2 vs 1.19
      if (R.coin()) { var t = a; a = b; b = t; }
      var showA = show(a), showB = show(b);
      if (m === 0) { showB = Q(b, 100).toDec(2); if (R.coin()) { var t2 = showA; showA = showB; showB = t2; } }
      return { q: 'Which sign makes this true? $' + showA + ' \\;\\square\\; ' + showB + '$', a: symMc(a, b), steps: stepsFor(a, b), hint: 'Give both numbers two decimal places, then compare.' };
    }
    var set = [], tries = 0, base = ctx.level === 3 ? R.int(0, 2) * 100 : 0;
    while (set.length < 4 && tries++ < 40) {
      var c = base + R.pick([R.int(1, 9) * 10, R.int(1, 99), R.int(1, 9)]);
      if (set.indexOf(c) < 0) set.push(c);
    }
    var sorted = set.slice().sort(function (x, y) { return x - y; }), want = kind === 'big' ? sorted[sorted.length - 1] : sorted[0];
    return {
      q: 'Which number is ' + (kind === 'big' ? 'greatest' : 'least') + '?', a: mcOf('$' + show(want) + '$', set.filter(function (x) { return x !== want; }).map(function (x) { return '$' + show(x) + '$'; })),
      steps: ['Write each with two decimal places: ' + set.map(function (x) { return '$' + Q(x, 100).toDec(2) + '$'; }).join(', ') + '.', 'Compare the hundredths: from least to greatest, $' + sorted.map(show).join(',\\ ') + '$.', 'The ' + (kind === 'big' ? 'greatest' : 'least') + ' is $' + show(want) + '$.'],
      hint: 'More digits does not mean bigger. Compare tenths first, then hundredths.'
    };
  });

  /* ================================================================ unit: measurement */

  var UNITS = [ // big (one, many), small (one, many), how many small in one big
    ['foot', 'feet', 'inch', 'inches', 12], ['yard', 'yards', 'foot', 'feet', 3], ['yard', 'yards', 'inch', 'inches', 36],
    ['meter', 'meters', 'centimeter', 'centimeters', 100], ['kilometer', 'kilometers', 'meter', 'meters', 1000],
    ['kilogram', 'kilograms', 'gram', 'grams', 1000], ['pound', 'pounds', 'ounce', 'ounces', 16], ['liter', 'liters', 'milliliter', 'milliliters', 1000],
    ['hour', 'hours', 'minute', 'minutes', 60], ['minute', 'minutes', 'second', 'seconds', 60], ['day', 'days', 'hour', 'hours', 24],
    ['gallon', 'gallons', 'quart', 'quarts', 4], ['week', 'weeks', 'day', 'days', 7]
  ];
  G('g4.convert-units', function (R, ctx) {
    var u = R.pick(L(ctx, UNITS.filter(function (x) { return x[4] <= 100; }), UNITS, UNITS)), f = u[4];
    var kind = R.pick(L(ctx, ['simple', 'simple', 'table'], ['simple', 'two', 'table'], ['two', 'compare', 'table', 'simple']));
    var n = R.int(2, L(ctx, 9, 12, 15));
    if (f >= 1000) n = R.int(2, 9);
    if (kind === 'simple') return {
      q: 'Convert: ' + n + ' ' + u[1] + ' = ? ' + u[3], a: num(n * f), unit: u[3],
      steps: ['1 ' + u[0] + ' = ' + C(f) + ' ' + u[3] + '.', 'Each ' + u[0] + ' becomes ' + C(f) + ' ' + u[3] + ', so multiply: $' + n + ' \\times ' + C(f) + ' = ' + C(n * f) + '$.', 'Check: ' + u[3] + ' are smaller than ' + u[1] + ', so it takes more of them. The number should get bigger, and it did.'],
      hint: 'How many ' + u[3] + ' are in one ' + u[0] + '? You need ' + n + ' of those.'
    };
    if (kind === 'two') {
      var extra = R.int(1, f - 1);
      return {
        q: 'Convert: ' + n + ' ' + u[1] + ' ' + C(extra) + ' ' + (extra === 1 ? u[2] : u[3]) + ' = ? ' + u[3], a: num(n * f + extra), unit: u[3],
        steps: ['Change the ' + u[1] + ' first: $' + n + ' \\times ' + C(f) + ' = ' + C(n * f) + '$ ' + u[3] + '.', 'Add the extra ' + C(extra) + ': $' + C(n * f) + ' + ' + C(extra) + ' = ' + C(n * f + extra) + '$ ' + u[3] + '.'],
        hint: 'Convert the ' + u[1] + ', then add the ' + u[3] + ' that are already there.'
      };
    }
    if (kind === 'compare') {
      var small = n * f + R.pick([-1, 1]) * R.int(1, M.max(1, M.min(f - 1, 9)));
      var bigMore = n * f > small, ch = [n + ' ' + u[1], C(small) + ' ' + u[3], 'They are the same'];
      return {
        q: 'Which is more: ' + n + ' ' + u[1] + ' or ' + C(small) + ' ' + u[3] + '?', a: mcKeep(ch, bigMore ? 0 : 1),
        steps: ['Use the same unit: $' + n + ' \\times ' + C(f) + ' = ' + C(n * f) + '$, so ' + n + ' ' + u[1] + ' = ' + C(n * f) + ' ' + u[3] + '.', C(n * f) + ' ' + (bigMore ? '>' : '<') + ' ' + C(small) + ', so ' + (bigMore ? n + ' ' + u[1] : C(small) + ' ' + u[3]) + ' is more.'],
        hint: 'Change the ' + u[1] + ' into ' + u[3] + ' first.'
      };
    }
    var rows = [1, 2, 3, R.int(5, 9)], ask = rows[3];
    return {
      q: 'A table shows ' + u[1] + ' and ' + u[3] + ': 1 ' + u[0] + ' is ' + C(f) + ' ' + u[3] + ', 2 ' + u[1] + ' are ' + C(2 * f) + ', 3 ' + u[1] + ' are ' + C(3 * f) + '. How many ' + u[3] + ' are in ' + ask + ' ' + u[1] + '?', a: num(ask * f), unit: u[3],
      steps: ['Each row adds another ' + C(f) + ' ' + u[3] + ': the rule is "multiply the ' + u[1] + ' by ' + C(f) + '."', '$' + ask + ' \\times ' + C(f) + ' = ' + C(ask * f) + '$ ' + u[3] + '.'],
      hint: 'What do you multiply the number of ' + u[1] + ' by each time?'
    };
  });

  function clock(mins) { var h = M.floor(mins / 60), m = mins % 60, hh = ((h + 11) % 12) + 1; return hh + ':' + (m < 10 ? '0' : '') + m; }
  var MEASURE = [
    function (R, ctx) { var s = 13 * 60 + R.int(0, 11) * 5 + R.int(0, 2) * 60, len = R.int(L(ctx, 5, 10, 14), L(ctx, 11, 22, 32)) * 5, e = s + len;
      var a = (60 - s % 60) % 60, st = [];
      if (a >= len) st.push('From ' + clock(s) + ' to ' + clock(e) + ' is ' + len + ' minutes.');
      else {
        var mid = s + a, hrs = M.floor((e - mid) / 60), b = e - mid - 60 * hrs, jumps = [];
        if (a) { st.push('From ' + clock(s) + ' to ' + clock(mid) + ' is ' + a + ' minutes.'); jumps.push(a); }
        if (hrs) { st.push('From ' + clock(mid) + ' to ' + clock(mid + 60 * hrs) + ' is ' + (60 * hrs) + ' minutes.'); jumps.push(60 * hrs); }
        if (b) { st.push('From ' + clock(mid + 60 * hrs) + ' to ' + clock(e) + ' is ' + b + ' minutes.'); jumps.push(b); }
        if (jumps.length > 1) st.push('Add the jumps: $' + jumps.join(' + ') + ' = ' + len + '$ minutes.');
      }
      return { q: 'Soccer practice starts at ' + clock(s) + ' p.m. and ends at ' + clock(e) + ' p.m. How many minutes long is practice?', a: len, unit: 'minutes',
        steps: ['Count up from the start time in friendly jumps.'].concat(st) }; },
    function (R, ctx) { var h = R.int(1, 3), m = R.int(1, 11) * 5, t = h * 60 + m;
      return { q: 'A movie is ' + h + ' hour' + (h > 1 ? 's' : '') + ' ' + m + ' minutes long. How many minutes is that?', a: t, unit: 'minutes',
        steps: ['1 hour = 60 minutes, so ' + h + ' hour' + (h > 1 ? 's' : '') + ' = $' + h + ' \\times 60 = ' + h * 60 + '$ minutes.', 'Add the ' + m + ' minutes: $' + h * 60 + ' + ' + m + ' = ' + t + '$ minutes.'] }; },
    function (R, ctx) { var have = R.pick([5, 10, 20]), c1 = R.int(105, have * 100 * 0.45), c2 = R.int(50, have * 100 * 0.4); c1 -= c1 % 5; c2 -= c2 % 5; var ch = have * 100 - c1 - c2, nm = names(R, 1)[0];
      return { q: nm + ' pays for a sandwich that costs $' + T.money(c1 / 100) + '$ and a juice that costs $' + T.money(c2 / 100) + '$ with a $\\$' + have + '$ bill. How much change should ' + nm + ' get?', a: Q(ch, 100).toDec(2), unit: 'dollars',
        steps: ['Total cost: $' + T.money(c1 / 100) + ' + ' + T.money(c2 / 100) + ' = ' + T.money((c1 + c2) / 100) + '$.', 'Change: $' + T.money(have) + ' - ' + T.money((c1 + c2) / 100) + ' = ' + T.money(ch / 100) + '$.', 'Tip: think in cents: ' + C(have * 100) + ' − ' + C(c1 + c2) + ' = ' + C(ch) + ' cents.'] }; },
    function (R, ctx) { var p = R.int(15, 95), n = R.int(3, 9); p -= p % 5; var tot = p * n;
      return { q: 'Pencils cost ' + p + ' cents each. How much do ' + n + ' pencils cost, in dollars?', a: Q(tot, 100).toDec(2), unit: 'dollars',
        steps: ['Multiply the cents: $' + n + ' \\times ' + p + ' = ' + tot + '$ cents.', '100 cents make 1 dollar, so ' + tot + ' cents is $' + T.money(tot / 100) + '$.'] }; },
    function (R, ctx) { var kg = R.int(2, 5), used = R.int(2, kg * 10 - 1) * 100 - R.pick([0, 50]), left = kg * 1000 - used;
      return { q: 'A bag holds ' + kg + ' kilograms of flour. A baker uses ' + C(used) + ' grams. How many grams are left?', a: left, unit: 'grams',
        steps: ['Use the same unit. 1 kilogram = 1,000 grams, so ' + kg + ' kilograms = $' + C(kg * 1000) + '$ grams.', 'Left: $' + C(kg * 1000) + ' - ' + C(used) + ' = ' + C(left) + '$ grams.'] }; },
    function (R, ctx) { var L0 = R.int(1, 3), cup = R.pick([100, 200, 250, 500]), n = L0 * 1000 / cup;
      return { q: 'A jug holds ' + L0 + ' liter' + (L0 > 1 ? 's' : '') + ' of juice. How many ' + cup + '-milliliter cups can it fill?', a: n, unit: 'cups',
        steps: [L0 + ' liter' + (L0 > 1 ? 's' : '') + ' = $' + C(L0 * 1000) + '$ milliliters.', 'Cups: $' + C(L0 * 1000) + ' \\div ' + cup + ' = ' + n + '$.'] }; },
    function (R, ctx) { var d = R.pick([4, 8, 10]), a = R.int(1, d - 1), n = R.int(3, 7), P = n * a, nm = names(R, 1)[0];
      return { q: nm + ' walks $' + fq(a, d) + '$ mile to school each day. How far does ' + nm + ' walk to school in ' + n + ' days?', a: vr(P, d), unit: 'miles',
        steps: ['Equal amounts each day: multiply $' + n + ' \\times ' + fq(a, d) + ' = ' + fq(P, d) + '$.', P >= d ? 'As a mixed number: $' + fq(P, d) + ' = ' + mr(P, d) + '$ miles.' : 'That is $' + fq(P, d) + '$ mile.'] }; },
    function (R, ctx) { var km = R.int(2, 5), ran = R.int(5, km * 10 - 2) * 100 + R.pick([0, 50]), left = km * 1000 - ran;
      return { q: 'A race is ' + km + ' kilometers long. A runner has gone ' + C(ran) + ' meters. How many meters are left?', a: left, unit: 'meters',
        steps: [km + ' kilometers = $' + C(km * 1000) + '$ meters.', 'Left: $' + C(km * 1000) + ' - ' + C(ran) + ' = ' + C(left) + '$ meters.'] }; },
    function (R, ctx) { var lb = R.int(1, 3), oz = R.int(1, 15), g = R.int(5, 15), tot = lb * 16 + oz + g;
      return { q: 'A puppy weighed ' + lb + ' pound' + (lb > 1 ? 's' : '') + ' ' + oz + ' ounce' + (oz > 1 ? 's' : '') + '. Since then it has gained ' + g + ' ounces. How many ounces does it weigh now?', a: tot, unit: 'ounces',
        steps: ['1 pound = 16 ounces, so ' + lb + ' pound' + (lb > 1 ? 's' : '') + ' ' + oz + ' ounces = $' + lb + ' \\times 16 + ' + oz + ' = ' + (lb * 16 + oz) + '$ ounces.', 'Add what it gained: $' + (lb * 16 + oz) + ' + ' + g + ' = ' + tot + '$ ounces.'] }; }
  ];
  G('g4.measurement-word-problems', function (R, ctx) {
    var pool = L(ctx, [1, 3, 5, 0, 6], [0, 2, 3, 4, 5, 6, 7], [0, 2, 4, 6, 7, 8]);
    var s = MEASURE[R.pick(pool)](R, ctx);
    return { q: s.q, a: num(s.a), unit: s.unit, steps: s.steps, hint: 'Put the amounts in the same unit first. Then decide: add, subtract, multiply or divide?' };
  });

  function rectViz(l, w, unit, hide) { // a labeled sketch of a rectangle (not to scale when large)
    var W = 7, H = M.max(2, M.min(4, M.round(7 * w / l))), x0 = 1.5, y0 = 1;
    return { name: 'g4-geo', opts: { w: 10, h: H + 2, grid: 'none', label: 'A rectangle ' + (hide === 'l' ? '? ' : l + ' ') + unit + ' long and ' + (hide === 'w' ? '? ' : w + ' ') + unit + ' wide', items: [
      { t: 'poly', pts: [[x0, y0], [x0 + W, y0], [x0 + W, y0 + H], [x0, y0 + H]], color: 'green' },
      { t: 'right', at: [x0, y0], d1: 0, d2: 90, s: 0.35, color: 'muted' }, { t: 'right', at: [x0 + W, y0 + H], d1: 180, d2: 270, s: 0.35, color: 'muted' },
      { t: 'text', at: [x0 + W / 2, y0 + H + 0.45], s: (hide === 'l' ? '?' : l) + ' ' + unit, color: hide === 'l' ? 'red' : 'ink' },
      { t: 'text', at: [x0 - 0.2, y0 + H / 2], s: (hide === 'w' ? '?' : w) + ' ' + unit, anchor: 'end', color: hide === 'w' ? 'red' : 'ink' }] } };
  }
  G('g4.area-perimeter-formulas', function (R, ctx) {
    var kind = R.pick(L(ctx, ['area', 'per', 'area', 'per'], ['area', 'per', 'wA', 'wP'], ['area', 'wA', 'wP', 'error']));
    var l = R.int(L(ctx, 4, 6, 12), L(ctx, 12, 25, 40)), w = R.int(L(ctx, 2, 3, 6), M.min(l - 1, L(ctx, 9, 12, 25)));
    var things = [['garden', 'feet', 99], ['rug', 'feet', 15], ['poster', 'inches', 40], ['playground', 'yards', 99], ['photo', 'centimeters', 30]].filter(function (x) { return l <= x[2]; });
    var thing = R.pick(things), u = thing[1];
    var sq = 'square ' + u, A = l * w, P = 2 * l + 2 * w;
    if (kind === 'area') return {
      q: 'A rectangular ' + thing[0] + ' is ' + l + ' ' + u + ' long and ' + w + ' ' + u + ' wide. What is its area?', a: num(A), unit: sq, viz: rectViz(l, w, u.replace('centimeters', 'cm')),
      steps: ['Area counts the unit squares that cover it: ' + w + ' rows of ' + l + ' squares.', '$A = l \\times w = ' + l + ' \\times ' + w + ' = ' + A + '$ ' + sq + '.'],
      hint: 'Area of a rectangle: length times width.'
    };
    if (kind === 'per') return {
      q: 'A rectangular ' + thing[0] + ' is ' + l + ' ' + u + ' long and ' + w + ' ' + u + ' wide. What is its perimeter?', a: num(P), unit: u, viz: rectViz(l, w, u.replace('centimeters', 'cm')),
      steps: ['Perimeter is the distance all the way around: two lengths and two widths.', '$P = 2 \\times ' + l + ' + 2 \\times ' + w + ' = ' + 2 * l + ' + ' + 2 * w + ' = ' + P + '$ ' + u + '.', 'Check: $' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + '$.'],
      hint: 'Go all the way around: there are four sides, not two.'
    };
    if (kind === 'wA') return {
      q: 'A rectangular ' + thing[0] + ' has an area of ' + A + ' ' + sq + '. Its length is ' + l + ' ' + u + '. How wide is it?', a: num(w), unit: u, viz: rectViz(l, w, u.replace('centimeters', 'cm'), 'w'),
      steps: ['$A = l \\times w$, so $' + A + ' = ' + l + ' \\times w$.', 'Find the missing factor: $' + A + ' \\div ' + l + ' = ' + w + '$.', 'Check: $' + l + ' \\times ' + w + ' = ' + A + '$.'],
      hint: 'What times ' + l + ' makes ' + A + '?'
    };
    if (kind === 'wP') return {
      q: 'A rectangular ' + thing[0] + ' has a perimeter of ' + P + ' ' + u + '. Its length is ' + l + ' ' + u + '. How wide is it?', a: num(w), unit: u, viz: rectViz(l, w, u.replace('centimeters', 'cm'), 'w'),
      steps: ['The two lengths use $2 \\times ' + l + ' = ' + 2 * l + '$ ' + u + ' of the perimeter.', 'The two widths use the rest: $' + P + ' - ' + 2 * l + ' = ' + 2 * w + '$.', 'One width is half of that: $' + 2 * w + ' \\div 2 = ' + w + '$ ' + u + '.', 'Check: $2 \\times ' + l + ' + 2 \\times ' + w + ' = ' + P + '$.'],
      hint: 'Take away the two lengths, then split what is left between the two widths.'
    };
    var who = names(R, 1)[0];
    return {
      q: who + ' says the perimeter of a ' + l + '-' + u.replace(/s$/, '').replace('feet', 'foot').replace('inche', 'inch') + ' by ' + w + '-' + u.replace(/s$/, '').replace('feet', 'foot').replace('inche', 'inch') + ' rectangle is ' + (l + w) + ' ' + u + '. What is the correct perimeter?', a: num(P), unit: u,
      steps: [who + ' added only one length and one width. A rectangle has four sides.', '$P = ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + '$ ' + u + '.'],
      hint: 'Trace all four sides.'
    };
  });

  var PLOTS = [['ribbon pieces', 'length in inches', 'inch', 'inches', 'pieces of ribbon'], ['leaves', 'length in inches', 'inch', 'inches', 'leaves'], ['beetles', 'length in inches', 'inch', 'inches', 'beetles'], ['rain gauges', 'rain in inches', 'inch', 'inches', 'days of rain']];
  G('g4.line-plots-fraction-data', function (R, ctx) {
    var d = L(ctx, R.pick([4, 8]), 8, 8), lo = ctx.level === 3 && R.coin() ? d : 0, hi = lo + d, data = [], cnt = {}, n = R.int(L(ctx, 6, 8, 10), L(ctx, 9, 12, 14));
    var pk = R.pick(PLOTS), first = lo + 1, last = hi - 1;
    for (var i = 0; i < n; i++) { var v = R.int(first, last); data.push(v); cnt[v] = (cnt[v] || 0) + 1; }
    var mn = M.min.apply(null, data), mxv = M.max.apply(null, data);
    if (mn === mxv) { data.push(mn === last ? first : last); cnt[data[data.length - 1]] = (cnt[data[data.length - 1]] || 0) + 1; n++; mn = M.min.apply(null, data); mxv = M.max.apply(null, data); }
    var viz = { name: 'g4-lineplot', opts: { data: data.map(function (x) { return vr(x, d); }), d: d, min: String(lo / d), max: String(hi / d), reduce: false, label: pk[1], stats: false } };
    viz.opts.label = pk[1];
    function T2(k) { return mr(k, d); }
    var kind = R.pick(L(ctx, ['count', 'diff', 'more'], ['diff', 'more', 'total', 'count'], ['diff', 'total', 'sum2', 'more']));
    var lead = 'The line plot shows the ' + pk[1].replace(' in inches', '') + ' of some ' + pk[0] + '. ';
    if (pk[0] === 'rain gauges') lead = 'The line plot shows how much rain fell on ' + n + ' days, in inches. ';
    if (kind === 'count') return {
      q: lead + 'How many ' + pk[4] + ' were measured?', a: num(n), viz: viz,
      steps: ['Each X stands for one measurement.', 'Count all the X marks: there are ' + n + '.'],
      hint: 'Count every X.'
    };
    if (kind === 'diff') return {
      q: lead + 'What is the difference between the greatest and the least measurement?', a: num(vr(mxv - mn, d)), unit: pk[3], viz: viz,
      steps: ['The greatest measurement is $' + T2(mxv) + '$ and the least is $' + T2(mn) + '$.', 'Subtract: $' + T2(mxv) + ' - ' + T2(mn) + ' = ' + fq(mxv - mn, d) + '$' + (mxv - mn >= d ? ' $= ' + mr(mxv - mn, d) + '$' : '') + ' ' + pk[3] + '.'],
      hint: 'Find the X farthest right and the X farthest left.'
    };
    if (kind === 'more') {
      var cuts = [d / 2, d / 4 * 3, d / 4, d / 8 * 3, d / 8 * 5].filter(function (x) { return x === M.round(x); }).map(function (x) { return x + lo; });
      var okc = cuts.filter(function (x) { var k = data.filter(function (y) { return y > x; }).length; return k > 0 && k < data.length; });
      var cut = R.pick(okc.length ? okc : cuts), more = data.filter(function (x) { return x > cut; }).length;
      return {
        q: lead + 'How many ' + pk[4] + ' measured more than $' + T2(cut) + '$ ' + pk[2] + '?', a: num(more), viz: viz,
        steps: ['Find $' + T2(cut) + '$ on the scale' + (gcd(cut % d, d) > 1 ? ' (it is the same as $' + qt(cut + '/' + d) + '$)' : '') + '.', 'Count the X marks to the right of it (not on it): ' + more + '.'],
        hint: 'Only marks to the right of $' + T2(cut) + '$ count.'
      };
    }
    if (kind === 'total') {
      var keys = Object.keys(cnt).map(Number).filter(function (k) { return cnt[k] >= 2; });
      var val = keys.length ? R.pick(keys) : data[0], c = cnt[val];
      return {
        q: lead + 'If you put all the ' + pk[4] + ' that measure $' + T2(val) + '$ ' + pk[2] + ' end to end, how long would they be together?', a: num(vr(c * val, d)), unit: pk[3], viz: viz,
        steps: ['There ' + (c === 1 ? 'is 1 X' : 'are ' + c + ' X marks') + ' above $' + T2(val) + '$.', 'Add them: $' + c + ' \\times ' + T2(val) + ' = ' + fq(c * val, d) + '$' + (c * val >= d ? ' $= ' + mr(c * val, d) + '$' : '') + ' ' + pk[3] + '.'],
        hint: 'Count the X marks above $' + T2(val) + '$, then add that many of $' + T2(val) + '$.'
      };
    }
    return {
      q: lead + 'What is the total of the longest and the shortest measurement?', a: num(vr(mxv + mn, d)), unit: pk[3], viz: viz,
      steps: ['Longest: $' + T2(mxv) + '$. Shortest: $' + T2(mn) + '$.', 'Add: $' + T2(mxv) + ' + ' + T2(mn) + ' = ' + mr(mxv + mn, d) + '$ ' + pk[3] + '.'],
      hint: 'Find the X marks at the two ends of the plot.'
    };
  });

  /* ================================================================ unit: lines, angles and shapes */

  function geo(w, h, items, label) { return { name: 'g4-geo', opts: { w: w, h: h, items: items, label: label } }; }
  function at(p, deg, len) { return [+(p[0] + len * M.cos(deg * M.PI / 180)).toFixed(3), +(p[1] + len * M.sin(deg * M.PI / 180)).toFixed(3)]; }
  var LETTERS = [['A', 'B'], ['C', 'D'], ['P', 'Q'], ['M', 'N'], ['R', 'S'], ['X', 'Y'], ['J', 'K'], ['E', 'F']];

  G('g4.points-lines-rays', function (R, ctx) {
    var kind = R.pick(L(ctx, ['pic', 'pic', 'ends'], ['pic', 'pic', 'ends', 'means'], ['pic', 'three', 'means', 'pic']));
    var nm = R.pick(LETTERS), A = nm[0], B = nm[1];
    var ov = { seg: '\\overline{' , ray: '\\overrightarrow{', line: '\\overleftrightarrow{' };
    function sym(t, x, y) { return '$' + ov[t] + x + y + '}$'; }
    if (kind === 'pic') {
      var t = R.pick(['seg', 'ray', 'ray', 'line']), y1 = R.int(1, 4), y2 = R.int(1, 4), pA = [R.int(2, 3), y1], pB = [R.int(6, 7), y2], rev = R.coin();
      if (rev) { var tmp = pA; pA = pB; pB = tmp; }
      var items = [];
      if (t === 'seg') items.push({ t: 'seg', a: pA, b: pB, color: 'blue' });
      else if (t === 'ray') items.push({ t: 'ray', a: pA, b: pB, color: 'blue', ext: 1.2 });
      else items.push({ t: 'line', a: pA, b: pB, color: 'blue', ext: 1.2, dots: true });
      items.push({ t: 'pt', at: pA, name: A, pos: 'n', color: 'blue' }, { t: 'pt', at: pB, name: B, pos: 'n', color: 'blue' });
      var right = sym(t, A, B), names2 = { seg: 'segment', ray: 'ray', line: 'line' };
      var wrong = t === 'ray' ? [sym('ray', B, A), sym('seg', A, B), sym('line', A, B)] : t === 'seg' ? [sym('ray', A, B), sym('line', A, B), sym('ray', B, A)] : [sym('seg', A, B), sym('ray', A, B), sym('ray', B, A)];
      return {
        q: 'Which name matches the figure?', a: mcOf(right, wrong), viz: geo(10, 5, items, 'A figure through points ' + A + ' and ' + B),
        steps: [t === 'seg' ? 'It stops at both ' + A + ' and ' + B + ': two endpoints, so it is a segment.' : t === 'ray' ? 'It starts at ' + A + ' (an endpoint) and goes on forever through ' + B + ' (the arrow). That is a ray.' : 'It goes on forever in both directions (two arrows). That is a line.',
          t === 'ray' ? 'A ray is named with its endpoint first: ' + right + ', ray ' + A + B + '. ' + sym('ray', B, A) + ' would start at ' + B + '.' : 'Its name is ' + right + ', ' + names2[t] + ' ' + A + B + '.'],
        hint: 'Look at each end: does it stop at a point, or does an arrow show it keeps going?'
      };
    }
    if (kind === 'ends') {
      var f = R.pick([['a segment', 2], ['a ray', 1], ['a line', 0]]);
      return {
        q: 'How many endpoints does ' + f[0] + ' have?', a: num(f[1]),
        steps: ['A segment stops at both ends: 2 endpoints. A ray starts at one endpoint and goes on forever the other way: 1. A line goes on forever both ways: 0.', 'So ' + f[0] + ' has ' + f[1] + '.'],
        hint: 'An endpoint is where the figure stops.'
      };
    }
    if (kind === 'means') {
      var tt = R.pick(['seg', 'ray', 'line']), ch = ['a ray that starts at ' + A + ' and goes through ' + B, 'a ray that starts at ' + B + ' and goes through ' + A, 'a segment from ' + A + ' to ' + B, 'a line through ' + A + ' and ' + B];
      var ix = tt === 'ray' ? 0 : tt === 'seg' ? 2 : 3;
      return {
        q: 'What does ' + sym(tt, A, B) + ' name?', a: mcKeep(ch, ix),
        steps: ['The mark above the letters tells the figure: a bar for a segment, one arrow for a ray, two arrows for a line.', 'So ' + sym(tt, A, B) + ' is ' + ch[ix] + '.'],
        hint: 'Count the arrowheads on the mark.'
      };
    }
    var three = R.pick([['A', 'B', 'C'], ['P', 'Q', 'R'], ['J', 'K', 'L'], ['D', 'E', 'F']]), p1 = [1.5, 2], p2 = [5, 2], p3 = [8.5, 2];
    var items3 = [{ t: 'line', a: p1, b: p3, color: 'blue', ext: 0.6 }, { t: 'pt', at: p1, name: three[0], pos: 'n', color: 'blue' }, { t: 'pt', at: p2, name: three[1], pos: 'n', color: 'blue' }, { t: 'pt', at: p3, name: three[2], pos: 'n', color: 'blue' }];
    var startMid = R.coin(), r1 = startMid ? sym('ray', three[1], three[2]) : sym('ray', three[1], three[0]);
    var w3 = startMid ? [sym('ray', three[2], three[1]), sym('ray', three[1], three[0]), sym('seg', three[1], three[2])] : [sym('ray', three[0], three[1]), sym('ray', three[1], three[2]), sym('seg', three[0], three[1])];
    return {
      q: 'Points ' + three[0] + ', ' + three[1] + ' and ' + three[2] + ' are on a line, in that order. Which ray starts at ' + three[1] + ' and goes toward ' + (startMid ? three[2] : three[0]) + '?', a: mcOf(r1, w3), viz: geo(10, 4, items3, 'A line through points ' + three.join(', ')),
      steps: ['A ray is named by its endpoint first, then any other point on it.', 'This ray starts at ' + three[1] + ' and passes through ' + (startMid ? three[2] : three[0]) + ', so it is ' + r1 + '.'],
      hint: 'The first letter is where the ray starts.'
    };
  });

  var TURNS = [[1, 4], [1, 2], [3, 4], [1, 1], [1, 3], [1, 6], [1, 8], [1, 12], [2, 3], [1, 10], [1, 5], [1, 9], [5, 12], [1, 36], [3, 8]];
  G('g4.angles-as-turns', function (R, ctx) {
    var kind = R.pick(L(ctx, ['frac', 'fit', 'one', 'compare'], ['frac', 'clock', 'compare', 'rev', 'fit'], ['frac', 'rev', 'clock', 'compare', 'fit']));
    if (kind === 'fit') {
      var dd = R.pick(L(ctx, [90, 180, 120, 60], [30, 45, 60, 90, 120, 36, 40], [10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 72]));
      return {
        q: 'How many $' + dd + '^\\circ$ angles fit together, with no gaps or overlaps, to make a full turn?', a: num(360 / dd),
        steps: ['A full turn is $360^\\circ$.', 'Angles that fit together add, so ask how many ' + dd + 's make 360: $360 \\div ' + dd + ' = ' + 360 / dd + '$.', 'Check: $' + 360 / dd + ' \\times ' + dd + ' = 360$.'],
        hint: 'How many ' + dd + 's are in 360?'
      };
    }
    if (kind === 'frac' || kind === 'rev') {
      var f = R.pick(L(ctx, TURNS.slice(0, 4), TURNS.slice(0, 10), TURNS.slice(4))), deg = 360 * f[0] / f[1], ft = f[0] === f[1] ? '1' : fq(f[0], f[1]);
      if (kind === 'rev') return {
        q: 'An angle measures $' + deg + '^\\circ$. What fraction of a full turn is it?', a: num(f[0] + '/' + f[1]),
        steps: ['A full turn is $360^\\circ$.', 'The angle is $' + deg + '$ of the 360 one-degree turns: $' + fq(deg, 360) + ' = ' + ft + '$ of a full turn.', 'Check: $' + ft + ' \\times 360 = ' + deg + '$.'],
        hint: 'How many angles of $' + deg + '^\\circ$ fit in $360^\\circ$?'
      };
      return {
        q: 'How many degrees is ' + (f[0] === f[1] ? 'a full turn' : '$' + ft + '$ of a full turn') + '?', a: num(deg), unit: 'degrees',
        steps: ['A full turn is $360^\\circ$: 360 one-degree turns.', f[0] === f[1] ? 'So a full turn is $360^\\circ$.' : 'Split 360 into ' + f[1] + ' equal parts: $360 \\div ' + f[1] + ' = ' + 360 / f[1] + '$.' + (f[0] > 1 ? ' Take ' + f[0] + ' of them: $' + f[0] + ' \\times ' + 360 / f[1] + ' = ' + deg + '$.' : ''), 'So the angle is $' + deg + '^\\circ$.'],
        hint: 'A full turn is $360^\\circ$.'
      };
    }
    if (kind === 'one') {
      var n = R.int(15, 175);
      return { q: 'An angle turns through ' + n + ' one-degree angles. What is its measure in degrees?', a: num(n), unit: 'degrees', steps: ['Each one-degree angle adds $1^\\circ$.', n + ' of them make $' + n + '^\\circ$.'], hint: 'A degree is the turn of a one-degree angle.' };
    }
    if (kind === 'clock') {
      var k = R.int(1, 11);
      return {
        q: 'The minute hand of a clock turns from the 12 to the ' + k + '. How many degrees does it turn?', a: num(30 * k), unit: 'degrees',
        steps: ['The 12 numbers split a full turn into 12 equal parts: $360 \\div 12 = 30$, so each number is $30^\\circ$.', 'From 12 to ' + k + ' is ' + k + ' of those parts: $' + k + ' \\times 30 = ' + 30 * k + '^\\circ$.'],
        hint: 'How many degrees from one number to the next?'
      };
    }
    // which angle is bigger? Longer rays do not make a bigger angle.
    var same = R.chance(0.25), dA = R.pick([30, 35, 40, 45, 50, 55, 60]), dB = same ? dA : dA + R.pick([25, 35, 45, 60, 75]), swap = !same && R.chance(0.25);
    if (swap) { var t2 = dA; dA = dB; dB = t2; if (dA > 85) { dA = 80; } }
    var VA = [1, 0.7], VB = [6.6, 0.7], LA = 3.6, LB = 1.4, an = R.sample('ABCDEFGHJKLMNPQRST'.split(''), 2).sort();
    var items = [
      { t: 'angle', at: VA, a1: 0, a2: dA, r: 0.55, color: 'red' }, { t: 'ray', a: VA, dir: 0, len: LA, color: 'green' }, { t: 'ray', a: VA, dir: dA, len: LA, color: 'green' },
      { t: 'angle', at: VB, a1: 0, a2: dB, r: 0.55, color: 'blue' }, { t: 'ray', a: VB, dir: 0, len: LB, color: 'purple' }, { t: 'ray', a: VB, dir: dB, len: LB, color: 'purple' },
      { t: 'text', at: [VA[0] - 0.35, VA[1] + 0.1], s: an[0], color: 'red' }, { t: 'text', at: [VB[0] - 0.35, VB[1] + 0.1], s: an[1], color: 'blue' }];
    var ans = dA > dB ? 0 : dA < dB ? 1 : 2;
    return {
      q: 'Which angle is greater: angle ' + an[0] + ' or angle ' + an[1] + '?', a: mcKeep(['Angle ' + an[0], 'Angle ' + an[1], 'They are the same size'], ans), viz: geo(10, 4.4, items, 'Angle ' + an[0] + ' has long sides and angle ' + an[1] + ' has short sides'),
      steps: ['An angle measures how far one side turns from the other. The length of the sides does not matter.', 'Angle ' + an[0] + ' turns about $' + dA + '^\\circ$ and angle ' + an[1] + ' turns about $' + dB + '^\\circ$.', ans === 2 ? 'They turn the same amount, so they are the same size, even though ' + an[0] + ' has longer sides.' : 'So angle ' + an[ans] + ' is greater' + (ans === 1 ? ', even though its sides are shorter.' : '.')],
      hint: 'Ignore how long the sides are. Which one is opened wider?'
    };
  });

  function angleKind(d) { return d < 90 ? 0 : d === 90 ? 1 : d < 180 ? 2 : 3; }
  var KINDS = ['acute', 'right', 'obtuse', 'straight'];
  G('g4.angle-types', function (R, ctx) {
    var kind = R.pick(L(ctx, ['pic', 'pic', 'meas'], ['pic', 'meas', 'which', 'pic'], ['pic', 'which', 'clock', 'meas']));
    if (kind === 'pic') {
      var k = R.int(0, ctx.level === 1 ? 2 : 3), deg = k === 0 ? R.int(4, 14) * 5 : k === 1 ? 90 : k === 2 ? R.int(22, 33) * 5 : 180;
      var base = ctx.level === 1 ? R.pick([0, 0, 180 - deg]) : R.int(0, 23) * 15, V = [5, 3], items = [];
      if (k === 1) items.push({ t: 'right', at: V, d1: base, d2: base + 90, s: 0.45, color: 'red' }); else items.push({ t: 'angle', at: V, a1: base, a2: base + deg, r: 0.7, color: 'red' });
      items.push({ t: 'ray', a: V, dir: base, len: 2.5, color: 'green' }, { t: 'ray', a: V, dir: base + deg, len: 2.5, color: 'green' });
      return {
        q: 'What kind of angle is this?', a: mcKeep(KINDS.slice(), k), viz: geo(10, 6, items, 'An angle'),
        steps: ['Compare it with a right angle (a square corner, $90^\\circ$).', ['It is smaller than a right angle, so it is acute.', 'The square mark shows a right angle: exactly $90^\\circ$.', 'It opens wider than a right angle but is not a straight line, so it is obtuse.', 'The two sides make a straight line: a straight angle, $180^\\circ$.'][k]],
        hint: 'Is it smaller than a square corner, exactly a square corner, or bigger?'
      };
    }
    if (kind === 'meas') {
      var kk = R.int(0, 3), dd = kk === 0 ? R.int(5, 89) : kk === 1 ? 90 : kk === 2 ? R.int(91, 179) : 180;
      return {
        q: 'An angle measures $' + dd + '^\\circ$. What kind of angle is it?', a: mcKeep(KINDS.slice(), kk),
        steps: ['Acute: less than $90^\\circ$. Right: exactly $90^\\circ$. Obtuse: between $90^\\circ$ and $180^\\circ$. Straight: exactly $180^\\circ$.', '$' + dd + '^\\circ$ is ' + KINDS[kk] + '.'],
        hint: 'Compare the measure with 90 and with 180.'
      };
    }
    if (kind === 'which') {
      var want = R.pick([0, 2]), right = want === 0 ? R.int(10, 85) : R.int(95, 175), wr = want === 0 ? [90, R.int(95, 175), 180] : [R.int(10, 85), 90, 180];
      return {
        q: 'Which could be the measure of ' + (want === 0 ? 'an acute' : 'an obtuse') + ' angle?', a: mcOf('$' + right + '^\\circ$', wr.map(function (x) { return '$' + x + '^\\circ$'; })),
        steps: [want === 0 ? 'An acute angle is less than $90^\\circ$.' : 'An obtuse angle is more than $90^\\circ$ and less than $180^\\circ$.', 'Only $' + right + '^\\circ$ fits.'],
        hint: 'Compare with $90^\\circ$ and $180^\\circ$.'
      };
    }
    var h = R.int(1, 6), a = 30 * h, kc = angleKind(a);
    return {
      q: 'At ' + h + ':00, what kind of angle do the hands of a clock make (the smaller angle between them)?', a: mcKeep(KINDS.slice(), kc),
      steps: ['Each hour mark is $30^\\circ$ apart ($360 \\div 12$).', 'At ' + h + ':00 the hands are ' + h + ' marks apart: $' + h + ' \\times 30 = ' + a + '^\\circ$.', '$' + a + '^\\circ$ is ' + KINDS[kc] + '.'],
      hint: 'The hands are ' + h + ' hour marks apart. How many degrees is each mark?'
    };
  });

  G('g4.measure-angles', function (R, ctx) {
    var mode = L(ctx, 'outer', R.pick(['outer', 'inner', 'inner']), R.pick(['inner', 'rot', 'rot', 'outer'])), step = L(ctx, 10, 5, 5);
    var D = R.int(M.ceil(15 / step), M.floor(165 / step)) * step; if (D === 90) D += step;
    var rot = mode === 'rot' ? R.pick([15, 20, 30, 40]) : 0, V = [5, +(1 + 4 * M.sin(rot * M.PI / 180)).toFixed(3)], H = +(V[1] + 4.75).toFixed(2);
    var d0 = mode === 'inner' ? 180 : rot, d1 = mode === 'inner' ? 180 - D : rot + D;
    var items = [{ t: 'ray', a: V, dir: d0, len: 4.45, color: 'ink', width: 3.5 }, { t: 'ray', a: V, dir: d1, len: 4.45, color: 'green', width: 3.5 },
      { t: 'angle', at: V, a1: M.min(d0, d1), a2: M.max(d0, d1), r: 0.75, color: 'red' }, { t: 'protractor', at: V, r: 4, rot: rot }];
    var scale = mode === 'inner' ? 'inner scale (the one that starts at 0 on the left)' : 'outer scale (the one that starts at 0 on the ' + (rot ? 'tilted bottom ray' : 'right') + ')';
    var steps = ['The center of the protractor is on the corner of the angle, and one side lies along the 0 line.', 'That side starts at 0 on the ' + scale + '. Follow that scale to the other side: it reads $' + D + '^\\circ$.', 'Check: the angle is ' + (D < 90 ? 'acute (smaller than a square corner)' : 'obtuse (wider than a square corner)') + ', so $' + D + '^\\circ$ makes sense and $' + (180 - D) + '^\\circ$ (the other scale) does not.'];
    var viz = geo(10, H, items, 'An angle with a protractor on it'); viz.opts.grid = 'none';
    viz.opts.crop = [+(V[0] - 4.55).toFixed(2), +(V[1] - 4 * M.sin(rot * M.PI / 180) - 0.3).toFixed(2), +(V[0] + 4.55).toFixed(2), +(V[1] + 4.55).toFixed(2)];
    if (ctx.level >= 2 && R.chance(0.35)) {
      var wr = [180 - D, D + 10, D - 10].filter(function (x) { return x > 0 && x < 180 && x !== D; });
      return { q: 'Read the protractor. What is the measure of the shaded angle?', a: mcOf('$' + D + '^\\circ$', wr.map(function (x) { return '$' + x + '^\\circ$'; })), viz: viz, steps: steps, hint: 'Which scale has its 0 on the side where the angle starts? Is the angle acute or obtuse?' };
    }
    return { q: 'Read the protractor. What is the measure of the shaded angle, in degrees?', a: num(D), unit: 'degrees', viz: viz, steps: steps, hint: 'Find the scale that has 0 on the side where the angle starts. Is the angle smaller or larger than $90^\\circ$?' };
  });

  G('g4.add-angles', function (R, ctx) {
    var kind = R.pick(L(ctx, ['sum', 'sum', 'part'], ['sum', 'part', 'right', 'line'], ['part', 'line', 'three', 'story']));
    var nm = R.pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['J', 'K', 'L', 'M'], ['W', 'X', 'Y', 'Z']]), V = [5, 0.9], rl = 3.6;
    var a, b, tot;
    if (kind === 'right') { a = R.int(2, 16) * 5; tot = 90; } else if (kind === 'line' || kind === 'three') { a = R.int(3, 30) * 5; tot = 180; } else { a = R.int(3, 14) * 5; b = R.int(3, 16) * 5; tot = a + b; if (tot > 170) { b = 170 - a; tot = 170; } }
    if (kind === 'story') {
      var t1 = R.int(3, 12) * 5, t2 = R.int(3, 12) * 5;
      return { q: 'A sprinkler turns $' + t1 + '^\\circ$, stops, then turns $' + t2 + '^\\circ$ more in the same direction. How many degrees did it turn in all?', a: num(t1 + t2), unit: 'degrees', steps: ['Turns in the same direction add, like angles side by side.', '$' + t1 + '^\\circ + ' + t2 + '^\\circ = ' + (t1 + t2) + '^\\circ$.'], hint: 'Add the two turns.' };
    }
    if (kind === 'three') {
      var x1 = R.int(3, 12) * 5, x2 = R.int(3, 12) * 5, x3 = 180 - x1 - x2;
      var V3 = [5, 0.9], items3 = [{ t: 'ray', a: V3, dir: 0, len: 4.3, color: 'ink', dots: false }, { t: 'ray', a: V3, dir: 180, len: 4.3, color: 'ink', dots: false }, { t: 'ray', a: V3, dir: x1, len: 3.4, color: 'ink', dots: false }, { t: 'ray', a: V3, dir: x1 + x2, len: 3.4, color: 'ink', dots: false },
        { t: 'angle', at: V3, a1: 0, a2: x1, r: 1.0, color: 'red', label: x1 + '°' }, { t: 'angle', at: V3, a1: x1, a2: x1 + x2, r: 1.35, color: 'blue', label: x2 + '°' }, { t: 'angle', at: V3, a1: x1 + x2, a2: 180, r: 1.0, color: 'green', label: '?' }, { t: 'pt', at: V3, color: 'ink' }];
      return {
        q: 'Three angles fit together along a straight line. Two of them measure $' + x1 + '^\\circ$ and $' + x2 + '^\\circ$. What does the third angle measure?', a: num(x3), unit: 'degrees', viz: geo(10, 4.6, items3, 'Three angles along a straight line'),
        steps: ['A straight line makes a straight angle: $180^\\circ$.', 'The known parts: $' + x1 + '^\\circ + ' + x2 + '^\\circ = ' + (x1 + x2) + '^\\circ$.', 'The missing part: $180^\\circ - ' + (x1 + x2) + '^\\circ = ' + x3 + '^\\circ$.'],
        hint: 'The three angles together make a straight angle.'
      };
    }
    if (b === undefined) b = tot - a;
    var A0 = kind === 'line' ? 180 : 0, dirA = 0, dirC = a, dirD = a + b;
    var pA = at(V, dirA, rl), pC = at(V, dirC, rl), pD = at(V, dirD, rl);
    var labA = kind === 'part' || kind === 'right' || kind === 'line' ? (R.coin() ? a + '°' : '?') : a + '°';
    var askFirst = labA === '?', labB = kind === 'sum' ? b + '°' : askFirst ? b + '°' : '?';
    var items = [{ t: 'ray', a: V, b: pA, color: 'ink', ext: 0.5, dots: false }, { t: 'ray', a: V, b: pC, color: 'ink', ext: 0.5, dots: false }, { t: 'ray', a: V, b: pD, color: 'ink', ext: 0.5, dots: false },
      { t: 'angle', at: V, a1: 0, a2: a, r: 1.05, color: 'red', label: labA }, { t: 'angle', at: V, a1: a, a2: a + b, r: 1.45, color: 'blue', label: labB }];
    if (kind === 'right') items.push({ t: 'right', at: V, d1: 0, d2: 90, s: 0.38, color: 'muted' });
    items.push({ t: 'pt', at: V, name: nm[1], pos: 's' }, { t: 'pt', at: pA, name: nm[0], pos: 'se' }, { t: 'pt', at: pC, name: nm[2], pos: a + b > 150 && a > 60 ? 'n' : 'ne' }, { t: 'pt', at: pD, name: nm[3], pos: a + b > 100 ? 'nw' : 'n' });
    var big = '\\angle ' + nm[0] + nm[1] + nm[3], p1 = '\\angle ' + nm[0] + nm[1] + nm[2], p2 = '\\angle ' + nm[2] + nm[1] + nm[3];
    var viz = geo(10, 5, items, 'Angle ' + nm[0] + nm[1] + nm[3] + ' split into two angles by ray ' + nm[1] + nm[2]);
    if (kind === 'sum') return {
      q: 'Ray $' + nm[1] + nm[2] + '$ splits $' + big + '$ into two parts: $' + p1 + ' = ' + a + '^\\circ$ and $' + p2 + ' = ' + b + '^\\circ$. What is the measure of $' + big + '$?', a: num(a + b), unit: 'degrees', viz: viz,
      steps: ['The two angles fit together with no gap and no overlap, so their measures add.', '$' + big + ' = ' + a + '^\\circ + ' + b + '^\\circ = ' + (a + b) + '^\\circ$.'],
      hint: 'The whole angle is the sum of its parts.'
    };
    var whole = kind === 'right' ? 'a right angle ($90^\\circ$)' : kind === 'line' ? 'a straight angle ($180^\\circ$), because ' + nm[0] + ', ' + nm[1] + ' and ' + nm[3] + ' are on a line' : '$' + tot + '^\\circ$';
    var known = askFirst ? b : a, unknown = askFirst ? a : b, kn = askFirst ? p2 : p1, un = askFirst ? p1 : p2;
    return {
      q: '$' + big + '$ is ' + whole + '. $' + kn + ' = ' + known + '^\\circ$. What is the measure of $' + un + '$?', a: num(unknown), unit: 'degrees', viz: viz,
      steps: ['The two parts add up to the whole: $' + kn + ' + ' + un + ' = ' + tot + '^\\circ$.', 'So $' + un + ' = ' + tot + '^\\circ - ' + known + '^\\circ = ' + unknown + '^\\circ$.', 'Check: $' + known + '^\\circ + ' + unknown + '^\\circ = ' + tot + '^\\circ$.'],
      hint: 'Whole minus the known part gives the missing part.'
    };
  });

  /* lines on a 10 × 6 grid through point p with direction v, clipped to the grid */
  function lineThrough(p, v) {
    var tmax = Infinity, tmin = -Infinity;
    [[0, 0.6, 9.4], [1, 0.6, 5.4]].forEach(function (c) { var i = c[0]; if (v[i] === 0) return; var t1 = (c[1] - p[i]) / v[i], t2 = (c[2] - p[i]) / v[i]; tmin = M.max(tmin, M.min(t1, t2)); tmax = M.min(tmax, M.max(t1, t2)); });
    return [[p[0] + tmin * v[0], p[1] + tmin * v[1]], [p[0] + tmax * v[0], p[1] + tmax * v[1]]];
  }
  var DIRS = [[1, 0], [0, 1], [2, 1], [1, 2], [1, 1], [3, 1], [1, -1], [2, -1], [1, -2], [3, -1]];
  G('g4.parallel-perpendicular', function (R, ctx) {
    var kind = R.pick(L(ctx, ['pic', 'pic', 'fact'], ['pic', 'pic', 'fact', 'symb'], ['pic', 'shape', 'symb', 'fact']));
    if (kind === 'pic') {
      var rel = R.int(0, 2), v = R.pick(DIRS), w, p, q2;
      function acuteBetween(x, y) { var cs = M.abs(x[0] * y[0] + x[1] * y[1]) / M.hypot(x[0], x[1]) / M.hypot(y[0], y[1]); return M.acos(M.min(1, cs)) * 180 / M.PI; }
      if (rel === 0) { w = v; p = [R.int(2, 4), R.int(2, 3)]; q2 = v[1] === 0 ? [p[0], p[1] + 2] : [p[0] + 3, p[1]]; }
      else if (rel === 1) { w = [-v[1], v[0]]; p = [R.int(4, 6), R.int(2, 4)]; q2 = p; }
      else {
        for (var t = 0; t < 30; t++) { w = R.pick(DIRS); var ang = acuteBetween(v, w); if (ang > 20 && ang < 65) break; }
        if (!(acuteBetween(v, w) > 20 && acuteBetween(v, w) < 65)) w = [v[0] - v[1], v[0] + v[1]];
        p = [R.int(4, 6), R.int(2, 4)]; q2 = p;
      }
      var l1 = lineThrough(p, v), l2 = lineThrough(q2, w), ln4 = R.sample('ABCDEFGHJKLMNPQRSTUVWXYZ'.split(''), 4).join('');
      function on(l, f) { return [+(l[0][0] + f * (l[1][0] - l[0][0])).toFixed(3), +(l[0][1] + f * (l[1][1] - l[0][1])).toFixed(3)]; }
      var items = [{ t: 'line', a: l1[0], b: l1[1], color: 'blue', ext: 0.3 }, { t: 'line', a: l2[0], b: l2[1], color: 'purple', ext: 0.3 },
        { t: 'pt', at: on(l1, 0.2), name: ln4[0], pos: 'n', color: 'blue' }, { t: 'pt', at: on(l1, 0.8), name: ln4[1], pos: 'n', color: 'blue' },
        { t: 'pt', at: on(l2, 0.2), name: ln4[2], pos: 's', color: 'purple' }, { t: 'pt', at: on(l2, 0.8), name: ln4[3], pos: 's', color: 'purple' }];
      if (rel === 1 && ctx.level === 1) items.push({ t: 'right', at: p, d1: M.atan2(v[1], v[0]) * 180 / M.PI, d2: M.atan2(w[1], w[0]) * 180 / M.PI, s: 0.4, color: 'red' });
      return {
        q: 'Are $\\overleftrightarrow{' + ln4.slice(0, 2) + '}$ and $\\overleftrightarrow{' + ln4.slice(2) + '}$ parallel, perpendicular, or neither?', a: mcKeep(['parallel', 'perpendicular', 'neither'], rel), viz: geo(10, 6, items, 'Two lines on a dot grid'),
        steps: [['The lines go in exactly the same direction (on the grid, the same steps over and up), so they never meet. They are parallel.', 'The lines cross and make square corners (right angles), so they are perpendicular.' + (ctx.level > 1 ? ' On the grid, one goes ' + M.abs(v[0]) + ' over and ' + M.abs(v[1]) + ' up/down; the other turns that a quarter turn: ' + M.abs(w[0]) + ' over and ' + M.abs(w[1]) + ' up/down.' : ''), 'The lines cross, but not at a right angle, so they are neither parallel nor perpendicular.'][rel]],
        hint: 'Do they ever meet? If they cross, is the corner a square corner?'
      };
    }
    if (kind === 'fact') {
      var F = R.pick([['Parallel lines never meet, no matter how far they go.', true], ['Perpendicular lines meet at a right angle.', true], ['Parallel lines meet at a right angle.', false], ['Any two lines that cross are perpendicular.', false], ['Two perpendicular lines make four right angles where they cross.', true], ['Two lines that cross make an angle, so they cannot be parallel.', true], ['Two segments can be parallel even if they are different lengths.', true], ['If two lines are not parallel, they must be perpendicular.', false]]);
      return { q: 'True or false: ' + F[0], a: { t: 'tf', v: F[1] }, steps: ['Parallel lines go the same direction and never meet. Perpendicular lines cross at right angles (square corners). Many crossing lines are neither.', F[1] ? 'So the statement is true.' : 'So the statement is false.'], hint: 'Picture the two lines on a sheet of paper.' };
    }
    if (kind === 'symb') {
      var s = R.coin(), ab = R.pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['J', 'K', 'L', 'M']]), L1 = '\\overleftrightarrow{' + ab[0] + ab[1] + '}', L2 = '\\overleftrightarrow{' + ab[2] + ab[3] + '}';
      return {
        q: 'What does $' + L1 + (s ? ' \\parallel ' : ' \\perp ') + L2 + '$ mean?', a: mcKeep(['line ' + ab[0] + ab[1] + ' is parallel to line ' + ab[2] + ab[3], 'line ' + ab[0] + ab[1] + ' is perpendicular to line ' + ab[2] + ab[3], 'line ' + ab[0] + ab[1] + ' is equal to line ' + ab[2] + ab[3]], s ? 0 : 1),
        steps: ['The symbol $\\parallel$ (two matching lines) means "is parallel to." The symbol $\\perp$ (a square corner) means "is perpendicular to."', 'So it says line ' + ab[0] + ab[1] + ' is ' + (s ? 'parallel' : 'perpendicular') + ' to line ' + ab[2] + ab[3] + '.'],
        hint: 'One symbol looks like two parallel lines; the other looks like a right angle.'
      };
    }
    var sh = R.pick([['a rectangle', 2, 'pairs of parallel sides'], ['a square', 2, 'pairs of parallel sides'], ['a square', 4, 'pairs of perpendicular sides (sides meeting at a right angle)'], ['a rectangle', 4, 'right angles'], ['a right triangle', 1, 'right angles'], ['a triangle', 0, 'pairs of parallel sides']]);
    return {
      q: 'How many ' + sh[2] + ' does ' + sh[0] + ' have?', a: num(sh[1]),
      steps: [sh[0] === 'a triangle' ? 'Any two sides of a triangle meet at a corner, so no two sides are parallel.' : sh[2].indexOf('parallel') >= 0 ? 'Opposite sides of ' + sh[0] + ' are parallel: top with bottom, left with right.' : 'Count the square corners' + (sh[0] === 'a right triangle' ? ': a right triangle has exactly one.' : ': there is one at each of the 4 corners.'), 'The answer is ' + sh[1] + '.'],
      hint: 'Sketch the shape and look at each pair of sides.'
    };
  });

  /* shapes on the grid: corners, and facts computed from the coordinates */
  var QUADS = [
    ['square', [[2, 1], [6, 1], [6, 5], [2, 5]]], ['square', [[3, 1], [6, 2], [5, 5], [2, 4]]],
    ['rectangle', [[1, 1], [8, 1], [8, 4], [1, 4]]], ['rectangle', [[2, 1], [6, 3], [5, 5], [1, 3]]],
    ['parallelogram', [[1, 1], [6, 1], [8, 4], [3, 4]]], ['parallelogram', [[2, 1], [8, 2], [7, 5], [1, 4]]],
    ['rhombus', [[1, 3], [4, 5], [7, 3], [4, 1]]], ['trapezoid', [[1, 1], [8, 1], [6, 4], [3, 4]]], ['trapezoid', [[1, 1], [7, 1], [5, 4], [1, 4]]],
    ['kite', [[4, 0.5], [6, 2.5], [4, 5.5], [2, 2.5]]], ['quadrilateral', [[1, 1], [7, 2], [6, 5], [2, 4]]]
  ];
  var TRIS = [[[1, 1], [8, 1], [4, 5]], [[2, 1], [8, 1], [5, 5]], [[1, 2], [7, 1], [5, 5]], [[1, 1], [6, 1], [1, 5]], [[2, 1], [2, 5], [8, 1]], [[1, 2], [5, 1], [6, 5]], [[1, 1], [8, 1], [2, 2]], [[1, 1], [9, 1], [7, 3]], [[1, 1], [5, 1], [8, 4]]];
  function sub2(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function dot2(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function crs2(a, b) { return a[0] * b[1] - a[1] * b[0]; }
  function cornerAngles(P) { return P.map(function (p, i) { var u = sub2(P[(i + P.length - 1) % P.length], p), v = sub2(P[(i + 1) % P.length], p); return M.acos(dot2(u, v) / M.hypot(u[0], u[1]) / M.hypot(v[0], v[1])) * 180 / M.PI; }); }
  function rightCount(P) { return P.filter(function (p, i) { var u = sub2(P[(i + P.length - 1) % P.length], p), v = sub2(P[(i + 1) % P.length], p); return M.abs(dot2(u, v)) < 1e-9; }).length; }
  function parPairs(P) { if (P.length !== 4) return 0; var e = [0, 1, 2, 3].map(function (i) { return sub2(P[(i + 1) % 4], P[i]); }); return (M.abs(crs2(e[0], e[2])) < 1e-9 ? 1 : 0) + (M.abs(crs2(e[1], e[3])) < 1e-9 ? 1 : 0); }
  function sideLens(P) { return P.map(function (p, i) { var q = P[(i + 1) % P.length]; return M.hypot(q[0] - p[0], q[1] - p[1]); }); }
  function bestName(P) { var pp = parPairs(P), rc = rightCount(P), s = sideLens(P), eq = M.abs(s[0] - s[1]) < 1e-9 && M.abs(s[1] - s[2]) < 1e-9 && M.abs(s[2] - s[3]) < 1e-9; if (pp === 2) return rc === 4 ? (eq ? 'square' : 'rectangle') : (eq ? 'rhombus' : 'parallelogram'); if (pp === 1) return 'trapezoid'; return 'other'; }
  function flip(P, R) { var f = R.coin(); return P.map(function (p) { return f ? [10 - p[0], p[1]] : p.slice(); }); }
  function marks(P) { // right-angle marks and equal-side ticks for a polygon
    var out = [], s = sideLens(P), groups = [];
    P.forEach(function (p, i) { var a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length], u = sub2(a, p), v = sub2(b, p); if (M.abs(dot2(u, v)) < 1e-9) out.push({ t: 'right', at: p, d1: M.atan2(u[1], u[0]) * 180 / M.PI, d2: M.atan2(v[1], v[0]) * 180 / M.PI, s: 0.32, color: 'red' }); });
    s.forEach(function (len, i) { var g = -1; groups.forEach(function (gr, j) { if (M.abs(gr - len) < 1e-9) g = j; }); if (g < 0) { groups.push(len); g = groups.length - 1; } out.push({ t: 'ticks', a: P[i], b: P[(i + 1) % P.length], n: g + 1, color: 'ink', _g: g }); });
    var used = {}; out.forEach(function (o) { if (o.t === 'ticks') used[o._g] = (used[o._g] || 0) + 1; });
    return out.filter(function (o) { if (o.t !== 'ticks') return true; var keep = used[o._g] > 1; delete o._g; return keep; });
  }
  var SETS4 = ['ABCD', 'PQRS', 'JKLM', 'WXYZ', 'EFGH', 'RSTU', 'KLMN', 'DEFG'];
  function nameVerts(P, letters) { // pt items with names placed away from the middle of the shape
    var cx = 0, cy = 0; P.forEach(function (p) { cx += p[0] / P.length; cy += p[1] / P.length; });
    return P.map(function (p, i) { var a = M.atan2(p[1] - cy, p[0] - cx) * 180 / M.PI, k = ((M.round(a / 45) % 8) + 8) % 8; return { t: 'pt', at: p, name: letters[i], pos: ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'][k], color: 'green' }; });
  }
  G('g4.classify-shapes', function (R, ctx) {
    var kind = R.pick(L(ctx, ['tri', 'par', 'right'], ['tri', 'par', 'right', 'name'], ['name', 'tri', 'fact', 'par']));
    if (kind === 'tri') {
      var P = flip(R.pick(TRIS), R), ang = cornerAngles(P), mxA = M.max.apply(null, ang), k = M.abs(mxA - 90) < 1e-6 ? 1 : mxA > 90 ? 2 : 0;
      var nmT = R.pick(SETS4).slice(0, 3), items = [{ t: 'poly', pts: P, color: 'green' }].concat(nameVerts(P, nmT));
      if (k === 1 && ctx.level === 1) items = items.concat(marks(P).filter(function (o) { return o.t === 'right'; }));
      return {
        q: 'Is triangle $' + nmT + '$ acute, right, or obtuse?', a: mcKeep(['acute triangle', 'right triangle', 'obtuse triangle'], k), viz: geo(10, 6, items, 'A triangle on a dot grid'),
        steps: ['A triangle is named by its biggest angle: all three acute makes an acute triangle; one right angle makes a right triangle; one obtuse angle makes an obtuse triangle.', ['All three corners are smaller than a square corner, so it is an acute triangle.', 'One corner is a square corner (it follows the grid lines), so it is a right triangle.', 'One corner opens wider than a square corner, so it is an obtuse triangle.'][k]],
        hint: 'Look at the biggest corner. Is it smaller than, equal to, or bigger than a square corner?'
      };
    }
    var Q0 = R.pick(ctx.level === 1 ? QUADS.filter(function (x) { return x[1][0][1] === x[1][1][1] && x[1][0][1] === 1; }) : QUADS), P2 = flip(Q0[1], R), nq = R.pick(SETS4);
    if (kind === 'par') {
      var pp = parPairs(P2);
      return {
        q: 'How many pairs of parallel sides does quadrilateral $' + nq + '$ have?', a: num(pp), viz: geo(10, 6, [{ t: 'poly', pts: P2, color: 'green' }].concat(nameVerts(P2, nq)), 'A four-sided shape on a dot grid'),
        steps: ['Check the two pairs of opposite sides. Parallel sides go the same way on the grid: the same steps over and up.', pp === 2 ? 'Both pairs of opposite sides are parallel: 2 pairs.' : pp === 1 ? 'One pair of opposite sides is parallel and the other pair is not: 1 pair.' : 'Neither pair of opposite sides is parallel: 0 pairs.'],
        hint: 'Compare the top with the bottom, and the left side with the right side.'
      };
    }
    if (kind === 'right') {
      var rc = rightCount(P2);
      return {
        q: 'How many right angles does quadrilateral $' + nq + '$ have?', a: num(rc), viz: geo(10, 6, [{ t: 'poly', pts: P2, color: 'green' }].concat(nameVerts(P2, nq)), 'A four-sided shape on a dot grid'),
        steps: ['A right angle is a square corner. Check each of the 4 corners against the grid.', 'This shape has ' + rc + ' right angle' + (rc === 1 ? '' : 's') + '.'],
        hint: 'Use the corner of a sheet of paper to test each corner.'
      };
    }
    if (kind === 'name') {
      var PN; for (var t = 0; t < 20; t++) { PN = flip(R.pick(QUADS)[1], R); if (bestName(PN) !== 'other') break; }
      if (bestName(PN) === 'other') PN = QUADS[2][1];
      var bn = bestName(PN), ch = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid'];
      var why = { square: '4 equal sides and 4 right angles.', rectangle: '2 pairs of parallel sides and 4 right angles, but the sides are not all equal.', rhombus: '4 equal sides, but no right angles.', parallelogram: '2 pairs of parallel sides, no right angles, and the sides are not all equal.', trapezoid: 'exactly 1 pair of parallel sides.' };
      return {
        q: 'Which name describes quadrilateral $' + nq + '$ best? (Marks show right angles and equal sides.)', a: mcKeep(ch, ch.indexOf(bn)), viz: geo(10, 6, [{ t: 'poly', pts: PN, color: 'green' }].concat(marks(PN)).concat(nameVerts(PN, nq)), 'A four-sided shape with marks for right angles and equal sides'),
        steps: ['Count parallel sides and right angles, and look at the equal-side marks.', 'This shape has ' + why[bn], 'So the best name is ' + bn + '.' + (bn === 'square' ? ' (A square is also a rectangle and a rhombus, but "square" says the most.)' : bn === 'rectangle' || bn === 'rhombus' ? ' (It is also a parallelogram, but "' + bn + '" says more.)' : '')],
        hint: 'The best name is the one that tells the most about the shape.'
      };
    }
    var F = R.pick([['Every square is a rectangle.', true], ['Every rectangle is a square.', false], ['A rhombus has four equal sides.', true], ['A triangle can have two right angles.', false], ['An obtuse triangle has exactly one obtuse angle.', true], ['Every parallelogram has four right angles.', false], ['A rectangle has two pairs of parallel sides.', true], ['A right triangle can also be an obtuse triangle.', false]]);
    return { q: 'True or false: ' + F[0], a: { t: 'tf', v: F[1] }, steps: [{ 'Every square is a rectangle.': 'A rectangle needs 4 right angles. A square has them (and equal sides too), so it is a rectangle.', 'Every rectangle is a square.': 'A rectangle can be long and thin, with sides that are not all equal.', 'A rhombus has four equal sides.': 'That is what makes a shape a rhombus.', 'A triangle can have two right angles.': 'Two square corners would make two sides parallel, and they could never meet to close the triangle.', 'An obtuse triangle has exactly one obtuse angle.': 'Two obtuse angles would already be more than 180°, too much for a triangle.', 'Every parallelogram has four right angles.': 'A parallelogram can lean over, with no right angles at all.', 'A rectangle has two pairs of parallel sides.': 'Top and bottom are parallel, and so are left and right.', 'A right triangle can also be an obtuse triangle.': 'A triangle with a 90° angle has no room for an angle over 90°.' }[F[0]], F[1] ? 'True.' : 'False.'], hint: 'Draw an example, then try to draw a counterexample.' };
  });

  /* line symmetry: reflect the corners over the line and see whether they land on corners */
  function reflectPt(p, a, b) { var d = sub2(b, a), t = dot2(sub2(p, a), d) / dot2(d, d), f = [a[0] + t * d[0], a[1] + t * d[1]]; return [2 * f[0] - p[0], 2 * f[1] - p[1]]; }
  function isSym(P, a, b) { return P.every(function (p) { var r = reflectPt(p, a, b); return P.some(function (q) { return M.abs(q[0] - r[0]) < 1e-9 && M.abs(q[1] - r[1]) < 1e-9; }); }); }
  var SYMSHAPES = [
    ['rectangle', [[1, 1], [8, 1], [8, 5], [1, 5]], [[[4.5, 0], [4.5, 6]], [[0, 3], [9, 3]], [[1, 1], [8, 5]], [[8, 1], [1, 5]]], 2],
    ['square', [[2, 1], [6, 1], [6, 5], [2, 5]], [[[4, 0], [4, 6]], [[1, 0], [7, 6]], [[1, 3], [7, 3]], [[7, 0], [1, 6]]], 4],
    ['isosceles triangle', [[1, 1], [7, 1], [4, 5]], [[[4, 0], [4, 5.8]], [[1, 1], [5.5, 3]], [[0, 2.5], [8, 2.5]]], 1],
    ['parallelogram', [[1, 1], [6, 1], [8, 4], [3, 4]], [[[1, 1], [8, 4]], [[4.5, 0], [4.5, 5]], [[0, 2.5], [9, 2.5]]], 0],
    ['rhombus', [[1, 3], [4, 5], [7, 3], [4, 1]], [[[0, 3], [8, 3]], [[4, 0], [4, 6]], [[2.5, 4], [5.5, 2]]], 2],
    ['kite', [[4, 0.5], [6, 2.5], [4, 5.5], [2, 2.5]], [[[4, 0], [4, 6]], [[1, 2.5], [7, 2.5]]], 1],
    ['trapezoid', [[1, 1], [8, 1], [6, 4], [3, 4]], [[[4.5, 0], [4.5, 5]], [[0, 2.5], [9, 2.5]], [[1, 1], [6, 4]]], 1]
  ];
  var SYMCOUNT = [['a square', 4], ['a rectangle that is not a square', 2], ['an equilateral triangle', 3], ['a regular hexagon', 6], ['a regular pentagon', 5], ['an isosceles triangle that is not equilateral', 1], ['a scalene triangle', 0], ['a regular octagon', 8], ['a rhombus that is not a square', 2]];
  function clipSeg(a, b) { // stretch the line ab across a 10 × 6 board
    var d = sub2(b, a), L0 = lineThrough(a, d); return L0;
  }
  G('g4.line-symmetry', function (R, ctx) {
    var kind = R.pick(L(ctx, ['is', 'is', 'count'], ['is', 'count', 'pic'], ['is', 'pic', 'count']));
    if (kind === 'count') {
      var sc = R.pick(SYMCOUNT);
      return { q: 'How many lines of symmetry does ' + sc[0] + ' have?', a: num(sc[1]), steps: ['A line of symmetry folds the shape so the two halves match exactly.', sc[1] ? (sc[0].indexOf('regular') >= 0 || sc[0].indexOf('equilateral') >= 0 ? 'A regular shape with ' + { 3: 'three', 5: 'five', 6: 'six', 8: 'eight' }[sc[1]] + ' equal sides has one line through each corner or through the middle of each side, ' + sc[1] + ' in all.' : sc[0] === 'a square' ? 'A square folds onto itself across both middles and both diagonals: 4 lines.' : sc[0].indexOf('rectangle') >= 0 ? 'A rectangle folds across its two middles. A diagonal does not work: the corners would not match.' : sc[0].indexOf('rhombus') >= 0 ? 'A rhombus folds along both diagonals, but not across the middles of its sides.' : 'Only the line through the top corner and the middle of the base works.') : 'No fold makes the halves match, so it has 0 lines of symmetry.', 'Answer: ' + sc[1] + '.'], hint: 'Imagine folding a paper copy. Which folds make the halves match?' };
    }
    var S0 = R.pick(SYMSHAPES), P = flip(S0[1], R), nv = R.pick(SETS4).slice(0, P.length), L0 = S0[2].map(function (l) { return P === S0[1] ? l : l; });
    if (P[0][0] !== S0[1][0][0]) L0 = S0[2].map(function (l) { return [[10 - l[0][0], l[0][1]], [10 - l[1][0], l[1][1]]]; });
    if (kind === 'pic') {
      return { q: 'How many lines of symmetry does ' + S0[0] + ' $' + nv + '$ have?', a: num(S0[3]), viz: geo(10, 6, [{ t: 'poly', pts: P, color: 'green' }].concat(marks(P)).concat(nameVerts(P, nv)), 'A ' + S0[0] + ' on a dot grid'),
        steps: ['Look for every fold that makes the two halves match exactly. Try the middles and the diagonals.', 'This ' + S0[0] + ' has ' + S0[3] + ' line' + (S0[3] === 1 ? '' : 's') + ' of symmetry.' + (S0[0] === 'rectangle' || S0[0] === 'parallelogram' ? ' A diagonal does not work: folding along it does not match the corners.' : '')], hint: 'Try folding across the middle both ways, then along the diagonals.' };
    }
    var ln = R.pick(L0), ok = isSym(P, ln[0], ln[1]), seg = clipSeg(ln[0], ln[1]);
    return {
      q: 'Is the dashed line a line of symmetry for ' + S0[0] + ' $' + nv + '$?', a: { t: 'tf', v: ok },
      viz: geo(10, 6, [{ t: 'poly', pts: P, color: 'green' }, { t: 'seg', a: seg[0], b: seg[1], color: 'red', dash: true, dots: false, width: 2.5 }].concat(nameVerts(P, nv)), 'A ' + S0[0] + ' with a dashed line'),
      steps: ['Picture folding the shape along the dashed line. A line of symmetry makes each corner land exactly on another corner.', ok ? 'Every corner lands on a matching corner, so the halves match: true, it is a line of symmetry.' : 'Some corners land where there is no corner' + (S0[0] === 'rectangle' ? ' (a rectangle\'s diagonal is not a fold line: the corners end up off the shape)' : '') + ', so the halves do not match: false.'],
      hint: 'Imagine folding along the dashed line. Do the two halves fit exactly on top of each other?'
    };
  });

})(window.MathLadder);
