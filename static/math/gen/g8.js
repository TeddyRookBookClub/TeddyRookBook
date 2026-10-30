/* Math Ladder: problem generators for Pre-Algebra (Grade 8), course key g8.
   One generator per topic in data/math/topics/g8.json (spec section 3). Built from source parts in the course builder's work
   folder; every answer is computed from the numbers drawn here and checked independently by a node test.
   Each problem may carry `chk`, a small record of what was asked in plain math (for the test; the page ignores it).
   Note: products raised to a power, like (2x^3)^4, are answered in parts (coefficient and exponent) because the
   expression checker accepts the unsimplified (2x^3)^4 as "simplified". */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, Q = ML.Q, U = ML.util, by = ML.byLevel;

  // ---------------------------------------------------------------- small helpers
  function rep(s, n, op) { var a = []; for (var i = 0; i < n; i++) a.push(s); return a.join(op === undefined ? ' \\cdot ' : op); }
  function pw(b, e) { return T.pow(b, e); }                          // TeX power, e.g. pw('x', 3) -> x^{3}
  function pwP(b, e) { return e === 1 ? String(b) : b + '^' + (e < 0 ? '(' + e + ')' : e); } // plain power
  function vars(fs) { return fs.filter(function (f) { return f[1] !== 0; }).map(function (f) { return pw(f[0], f[1]); }).join(''); }
  function mono(c, fs) { var v = vars(fs); return v ? T.coef(c, v) : T.num(c); }    // 3x^{2}y
  function monoP(c, fs) {                                              // plain: 3*x^2*y
    var v = fs.filter(function (f) { return f[1] !== 0; }).map(function (f) { return pwP(f[0], f[1]); }).join('*');
    if (!v) return String(c);
    return c === 1 ? v : c === -1 ? '-' + v : c + '*' + v;
  }
  function mcq(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function m$(s) { return '$' + s + '$'; }
  function sgn(n) { return n < 0 ? '-' + Math.abs(n) : String(n); }
  function commas(n) { return T.commas(n); }
  function hTable(xl, yl, xs, ys) {                                     // a sideways table of values as display math
    return '$$\\begin{array}{c|' + xs.map(function () { return 'c'; }).join('') + '} ' + xl + ' & ' + xs.map(T.num).join(' & ') + ' \\\\ \\hline ' + yl + ' & ' + ys.map(T.num).join(' & ') + ' \\end{array}$$';
  }
  function frac(n, d) { return T.frac(n, d); }
  function qp(q) { return Q.from(q).toPlain(); }
  function gcd(a, b) { return U.gcd(a, b); }
  function pick2(R, arr) { return R.sample(arr, 2); }
  function names(R, k) { return R.sample(['Ana', 'Ben', 'Carmen', 'Dev', 'Eli', 'Fatima', 'Gus', 'Hana', 'Iris', 'Jamal', 'Kai', 'Lena', 'Mateo', 'Nia', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sam', 'Tariq', 'Uma', 'Vic', 'Wen', 'Yara', 'Zoe'], k || 1); }
  function ptT(x, y) { return T.pt([x, y]); }


  // ================================================================ Unit 1: exponents and scientific notation
  var LET = ['x', 'a', 'm', 'n', 'y', 'p', 't', 'k', 'b', 'w'];

  G('g8.exponent-product-rule', function (R, ctx) {
    var kind = R.pick(by(ctx, ['num', 'var', 'var', 'miss', 'mc'], ['num', 'coef', 'three', 'two', 'miss', 'mc'], ['coef', 'two', 'three', 'neg', 'mc', 'miss']));
    var v = R.pick(LET), hi = by(ctx, 6, 9, 12), m, n, s, b;
    if (kind === 'num' || kind === 'mc') {
      b = R.int(2, 9); m = R.int(2, hi); n = R.int(2, hi);
      if (kind === 'mc') { while (m * n === m + n) n = R.int(3, hi); }
      s = m + n;
      var lead = m <= 4 && n <= 4 ? '$' + pw(b, m) + ' \\cdot ' + pw(b, n) + ' = (' + rep(b, m) + ') \\cdot (' + rep(b, n) + ')$' : '$' + pw(b, m) + '$ has ' + m + ' factors of ' + b + ', and $' + pw(b, n) + '$ has ' + n + ' more.';
      var st = [lead, 'Count all the factors of ' + b + ': $' + m + ' + ' + n + ' = ' + s + '$.', 'So $' + pw(b, m) + ' \\cdot ' + pw(b, n) + ' = ' + pw(b, s) + '$.'];
      if (kind === 'num') return { q: 'Write as one power: $' + pw(b, m) + ' \\cdot ' + pw(b, n) + ' = ' + b + '^{\\square}$. What number goes in the box?', a: { t: 'num', v: String(s), form: 'int' }, steps: st, hint: 'Count the factors of ' + b + ' in each power, then count them all together.', chk: { t: 'equiv', a: b + '^' + m + '*' + b + '^' + n, b: b + '^' + s } };
      var bb = b * b;
      var a = mcq(m$(pw(b, s)), [m$(pw(bb, s)), m$(pw(b, m * n)), m$(pw(bb, m * n))]);
      st.push('Adding the exponents keeps the base ' + b + '. Multiplying the bases ($' + b + ' \\cdot ' + b + ' = ' + bb + '$) or the exponents ($' + m + ' \\cdot ' + n + ' = ' + m * n + '$) gives a different number.');
      return { q: 'Which is equal to $' + pw(b, m) + ' \\cdot ' + pw(b, n) + '$?', a: a, steps: st, hint: 'How many factors of ' + b + ' are there in all?', chk: { t: 'mc', a: b + '^' + m + '*' + b + '^' + n, right: b + '^' + s, wrong: [bb + '^' + s, b + '^' + m * n, bb + '^' + m * n] } };
    }
    if (kind === 'var') {
      m = R.int(2, hi); n = R.int(2, hi); s = m + n;
      return { q: 'Simplify: $' + pw(v, m) + ' \\cdot ' + pw(v, n) + '$', a: { t: 'expr', v: v + '^' + s, vars: [v], form: 'simplified' },
        steps: ['$' + pw(v, m) + '$ is ' + m + ' factors of $' + v + '$ and $' + pw(v, n) + '$ is ' + n + ' more.', 'Same base, so add the exponents: $' + m + ' + ' + n + ' = ' + s + '$.', '$' + pw(v, m) + ' \\cdot ' + pw(v, n) + ' = ' + pw(v, s) + '$'],
        hint: 'Keep the base and count the factors.', chk: { t: 'equiv', a: v + '^' + m + '*' + v + '^' + n, b: v + '^' + s, vars: [v], back: v + '^' + m + '*' + v + '^' + n } };
    }
    if (kind === 'miss') {
      m = R.int(2, hi); s = m + R.int(2, hi);
      var useNum = R.coin(), base = useNum ? String(R.int(2, 9)) : v;
      return { q: 'Find the missing exponent: $' + pw(base, m) + ' \\cdot ' + base + '^{\\square} = ' + pw(base, s) + '$', a: { t: 'num', v: String(s - m), form: 'int' },
        steps: ['Multiplying powers of the same base adds the exponents, so $' + m + ' + \\square = ' + s + '$.', 'The missing exponent is $' + s + ' - ' + m + ' = ' + (s - m) + '$.', 'Check: $' + m + ' + ' + (s - m) + ' = ' + s + '$.'],
        hint: 'The exponents must add up to ' + s + '.', chk: { t: 'equiv', a: pwP(base, m) + '*' + pwP(base, s - m), b: pwP(base, s), vars: useNum ? [] : [v] } };
    }
    if (kind === 'coef' || kind === 'neg') {
      var c1 = R.int(2, 9), c2 = R.int(2, 9); m = R.int(2, hi); n = R.int(2, hi);
      var c3 = null, k = 1;
      if (kind === 'neg') { c1 = -c1; if (R.coin()) c2 = -c2; c3 = R.pick([1, -1]); k = R.int(1, 4); }
      var prod = c1 * c2 * (c3 === null ? 1 : c3), e = m + n + (c3 === null ? 0 : k);
      var f1 = mono(c1, [[v, m]]), f2 = mono(c2, [[v, n]]), f3 = c3 === null ? null : mono(c3, [[v, k]]);
      var qs = '(' + f1 + ')(' + f2 + ')' + (f3 ? '(' + f3 + ')' : '');
      var expP = '(' + monoP(c1, [[v, m]]) + ')*(' + monoP(c2, [[v, n]]) + ')' + (f3 ? '*(' + monoP(c3, [[v, k]]) + ')' : '');
      return { q: 'Simplify: $' + qs + '$', a: { t: 'expr', v: monoP(prod, [[v, e]]), vars: [v], form: 'simplified' },
        steps: ['Group the numbers and the powers: $(' + [c1, c2].concat(c3 === null ? [] : [c3]).map(T.p).join(' \\cdot ') + ')(' + [pw(v, m), pw(v, n)].concat(f3 ? [pw(v, k)] : []).join(' \\cdot ') + ')$.', 'Multiply the numbers: $' + [c1, c2].concat(c3 === null ? [] : [c3]).map(T.p).join(' \\cdot ') + ' = ' + prod + '$.', 'Add the exponents of $' + v + '$: $' + [m, n].concat(f3 ? [k] : []).join(' + ') + ' = ' + e + '$.', 'Answer: $' + mono(prod, [[v, e]]) + '$'],
        hint: 'Multiply the numbers in front, then add the exponents.', chk: { t: 'equiv', a: expP, b: monoP(prod, [[v, e]]), vars: [v], back: c3 === null && c2 > 0 ? monoP(c1, [[v, m]]) + '*' + monoP(c2, [[v, n]]) : undefined } };
    }
    if (kind === 'three') {
      m = R.int(2, hi); n = R.int(2, hi); s = m + 1 + n;
      return { q: 'Simplify: $' + pw(v, m) + ' \\cdot ' + v + ' \\cdot ' + pw(v, n) + '$', a: { t: 'expr', v: v + '^' + s, vars: [v], form: 'simplified' },
        steps: ['A plain $' + v + '$ is one factor: $' + v + ' = ' + v + '^{1}$.', 'Add all the exponents: $' + m + ' + 1 + ' + n + ' = ' + s + '$.', 'Answer: $' + pw(v, s) + '$'],
        hint: 'A variable with no exponent shown has exponent 1.', chk: { t: 'equiv', a: v + '^' + m + '*' + v + '*' + v + '^' + n, b: v + '^' + s, vars: [v], back: v + '^' + m + '*' + v + '*' + v + '^' + n } };
    }
    // two variables
    var u = R.pick([['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']]), a1 = R.int(1, 6), b1 = R.int(1, 6), a2 = R.int(1, 6), b2 = R.int(1, 6), d1 = R.int(2, 7), d2 = R.int(2, 7);
    var res = monoP(d1 * d2, [[u[0], a1 + a2], [u[1], b1 + b2]]), qP = '(' + monoP(d1, [[u[0], a1], [u[1], b1]]) + ')*(' + monoP(d2, [[u[0], a2], [u[1], b2]]) + ')';
    return { q: 'Simplify: $(' + mono(d1, [[u[0], a1], [u[1], b1]]) + ')(' + mono(d2, [[u[0], a2], [u[1], b2]]) + ')$', a: { t: 'expr', v: res, vars: u, form: 'simplified' },
      steps: ['Multiply the numbers: $' + d1 + ' \\cdot ' + d2 + ' = ' + d1 * d2 + '$.', 'Add the exponents of $' + u[0] + '$: $' + a1 + ' + ' + a2 + ' = ' + (a1 + a2) + '$.', 'Add the exponents of $' + u[1] + '$: $' + b1 + ' + ' + b2 + ' = ' + (b1 + b2) + '$.', 'Answer: $' + mono(d1 * d2, [[u[0], a1 + a2], [u[1], b1 + b2]]) + '$'],
      hint: 'Handle the numbers, then each letter on its own.', chk: { t: 'equiv', a: qP, b: res, vars: u, back: monoP(d1, [[u[0], a1], [u[1], b1]]) + '*' + monoP(d2, [[u[0], a2], [u[1], b2]]) } };
  });

  G('g8.exponent-quotient-rule', function (R, ctx) {
    var kind = R.pick(by(ctx, ['num', 'var', 'var', 'miss', 'mc'], ['num', 'coef', 'two', 'eval', 'miss', 'mc'], ['coef', 'two', 'eval', 'mc', 'miss', 'coef']));
    var v = R.pick(LET), hi = by(ctx, 9, 12, 15), m, n, b;
    var note = ' (Assume no variable is 0.)';
    if (kind === 'num' || kind === 'eval') {
      b = R.int(2, kind === 'eval' ? 5 : 9); n = R.int(2, hi - 2); var d = kind === 'eval' ? R.int(1, b <= 3 ? 4 : 2) : R.int(1, hi - n); m = n + d;
      var st = ['Write the top as ' + m + ' factors of ' + b + ' and the bottom as ' + n + '.', 'Each ' + b + ' on the bottom cancels one on top, because $\\frac{' + b + '}{' + b + '} = 1$. That cancels ' + n + ' pairs.', '$' + m + ' - ' + n + ' = ' + d + '$ factors are left: $' + pw(b, d) + '$.'];
      if (kind === 'num') return { q: 'Write as one power: $\\dfrac{' + pw(b, m) + '}{' + pw(b, n) + '} = ' + b + '^{\\square}$. What number goes in the box?', a: { t: 'num', v: String(d), form: 'int' }, steps: st, hint: 'How many factors of ' + b + ' are left after the pairs cancel?', chk: { t: 'equiv', a: b + '^' + m + '/' + b + '^' + n, b: b + '^' + d } };
      var val = Math.pow(b, d);
      st.push('$' + pw(b, d) + ' = ' + (d > 1 ? rep(b, d) + ' = ' : '') + val + '$');
      return { q: 'Find the value: $\\dfrac{' + pw(b, m) + '}{' + pw(b, n) + '}$', a: { t: 'num', v: String(val), form: 'simplest' }, steps: st, hint: 'Subtract the exponents first. Then the number is small enough to work out.', chk: { t: 'val', a: b + '^' + m + '/' + b + '^' + n, v: String(val) } };
    }
    if (kind === 'var') {
      n = R.int(2, hi - 2); m = n + R.int(1, hi - n);
      return { q: 'Simplify: $\\dfrac{' + pw(v, m) + '}{' + pw(v, n) + '}$' + note, a: { t: 'expr', v: pwP(v, m - n), vars: [v], form: 'simplified' },
        steps: [n + ' factors of $' + v + '$ on the bottom cancel ' + n + ' of the ' + m + ' on top.', 'Subtract the exponents: $' + m + ' - ' + n + ' = ' + (m - n) + '$.', 'Answer: $' + pw(v, m - n) + '$'],
        hint: 'Cancel matching factors in pairs: subtract, don’t divide.', chk: { t: 'equiv', a: v + '^' + m + '/' + v + '^' + n, b: pwP(v, m - n), vars: [v], back: v + '^' + m + '/' + v + '^' + n } };
    }
    if (kind === 'miss') {
      n = R.int(2, hi - 2); m = n + R.int(2, hi - n);
      var top = R.coin();
      if (top) return { q: 'Find the missing exponent: $\\dfrac{' + v + '^{\\square}}{' + pw(v, n) + '} = ' + pw(v, m - n) + '$' + note, a: { t: 'num', v: String(m), form: 'int' },
        steps: ['Dividing subtracts the exponents: $\\square - ' + n + ' = ' + (m - n) + '$.', 'So the box is $' + (m - n) + ' + ' + n + ' = ' + m + '$.', 'Check: $' + m + ' - ' + n + ' = ' + (m - n) + '$.'], hint: 'What minus ' + n + ' gives ' + (m - n) + '?', chk: { t: 'equiv', a: v + '^' + m + '/' + v + '^' + n, b: pwP(v, m - n), vars: [v] } };
      return { q: 'Find the missing exponent: $\\dfrac{' + pw(v, m) + '}{' + v + '^{\\square}} = ' + pw(v, m - n) + '$' + note, a: { t: 'num', v: String(n), form: 'int' },
        steps: ['Dividing subtracts the exponents: $' + m + ' - \\square = ' + (m - n) + '$.', 'So the box is $' + m + ' - ' + (m - n) + ' = ' + n + '$.', 'Check: $' + m + ' - ' + n + ' = ' + (m - n) + '$.'], hint: m + ' minus what gives ' + (m - n) + '?', chk: { t: 'equiv', a: v + '^' + m + '/' + v + '^' + n, b: pwP(v, m - n), vars: [v] } };
    }
    if (kind === 'mc') {
      b = R.pick(['x', 'a', '5', '3', '7', 'y']); n = R.int(2, 3); var kk = R.int(3, 5); m = n * kk;
      var a = mcq(m$(pw(b, m - n)), [m$(pw(b, kk)), m$(pw(b, m + n)), m$(pw(b, m * n))]);
      return { q: 'Which is equal to $\\dfrac{' + pw(b, m) + '}{' + pw(b, n) + '}$?' + (/[a-z]/.test(b) ? note : ''), a: a,
        steps: ['Cancel ' + n + ' matching factors from the top and the bottom.', m + ' factors on top minus ' + n + ' cancelled leaves $' + m + ' - ' + n + ' = ' + (m - n) + '$.', 'So it equals $' + pw(b, m - n) + '$. Dividing the exponents ($' + m + ' \\div ' + n + ' = ' + kk + '$) is a common slip.'],
        hint: 'Subtract the exponents. Don’t divide them.', chk: { t: 'mc', a: pwP(b, m) + '/' + pwP(b, n), right: pwP(b, m - n), wrong: [pwP(b, kk), pwP(b, m + n), pwP(b, m * n)], vars: /[a-z]/.test(b) ? [b] : [] } };
    }
    if (kind === 'coef') {
      var c2 = R.int(2, 6), qq = R.int(2, 9), c1 = c2 * qq; n = R.int(1, 6); m = n + R.int(1, 7);
      if (R.chance(0.3)) c1 = -c1;
      var res = monoP(c1 / c2, [[v, m - n]]), qP = '(' + monoP(c1, [[v, m]]) + ')/(' + monoP(c2, [[v, n]]) + ')';
      return { q: 'Simplify: $\\dfrac{' + mono(c1, [[v, m]]) + '}{' + mono(c2, [[v, n]]) + '}$' + note, a: { t: 'expr', v: res, vars: [v], form: 'simplified' },
        steps: ['Divide the numbers: $' + c1 + ' \\div ' + c2 + ' = ' + c1 / c2 + '$.', 'Subtract the exponents of $' + v + '$: $' + m + ' - ' + n + ' = ' + (m - n) + '$.', 'Answer: $' + mono(c1 / c2, [[v, m - n]]) + '$'],
        hint: 'Numbers divide; exponents of the same base subtract.', chk: { t: 'equiv', a: qP, b: res, vars: [v], back: qP } };
    }
    var u = R.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), a1 = R.int(3, 9), b1 = R.int(2, 8), a2 = R.int(1, a1 - 1), b2 = R.int(1, b1 - 1);
    var res2 = monoP(1, [[u[0], a1 - a2], [u[1], b1 - b2]]), qP2 = '(' + monoP(1, [[u[0], a1], [u[1], b1]]) + ')/(' + monoP(1, [[u[0], a2], [u[1], b2]]) + ')';
    return { q: 'Simplify: $\\dfrac{' + mono(1, [[u[0], a1], [u[1], b1]]) + '}{' + mono(1, [[u[0], a2], [u[1], b2]]) + '}$' + note, a: { t: 'expr', v: res2, vars: u, form: 'simplified' },
      steps: ['Work with each letter on its own.', '$' + u[0] + '$: $' + a1 + ' - ' + a2 + ' = ' + (a1 - a2) + '$.', '$' + u[1] + '$: $' + b1 + ' - ' + b2 + ' = ' + (b1 - b2) + '$.', 'Answer: $' + mono(1, [[u[0], a1 - a2], [u[1], b1 - b2]]) + '$'],
      hint: 'Subtract the exponents of x from each other, and the exponents of y from each other.'.replace(/x/, u[0]).replace(/y/, u[1]), chk: { t: 'equiv', a: qP2, b: res2, vars: u, back: qP2 } };
  });

  G('g8.power-of-power', function (R, ctx) {
    var kind = R.pick(by(ctx, ['num', 'var', 'var', 'prod', 'mc'], ['num', 'var', 'prod', 'two', 'mc', 'mix'], ['prod', 'neg', 'two', 'mix', 'mc']));
    var v = R.pick(LET), m, n, b;
    if (kind === 'num') {
      b = R.int(2, 9); m = R.int(2, 6); n = R.int(2, by(ctx, 4, 5, 6));
      return { q: 'Write as one power: $(' + pw(b, m) + ')^{' + n + '} = ' + b + '^{\\square}$. What number goes in the box?', a: { t: 'num', v: String(m * n), form: 'int' },
        steps: ['$(' + pw(b, m) + ')^{' + n + '}$ means ' + n + ' copies of $' + pw(b, m) + '$ multiplied: $' + rep(pw(b, m), n) + '$.', 'That is ' + n + ' groups of ' + m + ' factors: $' + n + ' \\cdot ' + m + ' = ' + m * n + '$ factors.', 'So the box is ' + m * n + '.'],
        hint: 'Count the factors: ' + n + ' groups of ' + m + '.', chk: { t: 'equiv', a: '(' + b + '^' + m + ')^' + n, b: b + '^' + m * n } };
    }
    if (kind === 'var') {
      m = R.int(2, 7); n = R.int(2, 5);
      return { q: 'Simplify: $(' + pw(v, m) + ')^{' + n + '}$', a: { t: 'expr', v: v + '^' + m * n, vars: [v], form: 'simplified' },
        steps: ['That is ' + n + ' copies of $' + pw(v, m) + '$: $' + rep(pw(v, m), n) + '$.', 'Add ' + m + ' a total of ' + n + ' times, which is $' + m + ' \\cdot ' + n + ' = ' + m * n + '$.', 'Answer: $' + pw(v, m * n) + '$'],
        hint: 'A power of a power multiplies the exponents.', chk: { t: 'equiv', a: '(' + v + '^' + m + ')^' + n, b: v + '^' + m * n, vars: [v], back: '(' + v + '^' + m + ')^' + n } };
    }
    if (kind === 'prod' || kind === 'neg') {
      var c = kind === 'neg' ? -R.int(2, 4) : R.int(2, 5); m = R.int(1, 4); n = kind === 'neg' ? R.int(2, 3) : R.int(2, c > 3 ? 2 : 3);
      if (kind === 'neg' && c === -4) n = 2;
      var cn = Math.pow(c, n), inner = mono(c, [[v, m]]);
      return { q: 'Simplify $(' + inner + ')^{' + n + '}$ and write it as $a' + pw(v, '{n}').replace('^{{n}}', '^{n}') + '$. Give $a$ and $n$.', a: { t: 'multi', parts: [{ label: '$a =$', a: { t: 'num', v: String(cn), form: 'int' } }, { label: '$n =$', a: { t: 'num', v: String(m * n), form: 'int' } }] },
        steps: ['$(' + inner + ')^{' + n + '} = ' + rep('(' + inner + ')', n, '') + '$', 'Every factor inside is used ' + n + ' times: $' + pw(T.p(c), n) + ' \\cdot ' + pw(m === 1 ? v : '(' + pw(v, m) + ')', n) + '$.', 'Numbers: $' + pw(T.p(c), n) + ' = ' + cn + '$. Exponents: $' + m + ' \\cdot ' + n + ' = ' + m * n + '$.', 'So $(' + inner + ')^{' + n + '} = ' + mono(cn, [[v, m * n]]) + '$: $a = ' + cn + '$ and $n = ' + m * n + '$.'],
        hint: 'Raise the number ' + (c < 0 ? '(sign included) ' : '') + 'and the power of ' + v + ' to the ' + U.ordinal(n) + ' power.', chk: { t: 'equiv', a: '(' + monoP(c, [[v, m]]) + ')^' + n, b: monoP(cn, [[v, m * n]]), vars: [v] } };
    }
    if (kind === 'two') {
      var u = R.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), p = R.int(1, 4), q2 = R.int(1, 4); n = R.int(2, 4);
      var inn = mono(1, [[u[0], p], [u[1], q2]]);
      return { q: 'Simplify $(' + inn + ')^{' + n + '}$ and write it as ' + m$(u[0] + '^{r}' + u[1] + '^{s}') + '. Give $r$ and $s$.', a: { t: 'multi', parts: [{ label: '$r =$', a: { t: 'num', v: String(p * n), form: 'int' } }, { label: '$s =$', a: { t: 'num', v: String(q2 * n), form: 'int' } }] },
        steps: ['Each factor inside gets the outside exponent: $(' + inn + ')^{' + n + '} = ' + pw('(' + pw(u[0], p) + ')', n).replace('((', '(').replace(/\)\)\^/, ')^') + pw('(' + pw(u[1], q2) + ')', n).replace('((', '(').replace(/\)\)\^/, ')^') + '$.', 'Multiply exponents: $' + p + ' \\cdot ' + n + ' = ' + p * n + '$ and $' + q2 + ' \\cdot ' + n + ' = ' + q2 * n + '$.', 'Answer: $' + mono(1, [[u[0], p * n], [u[1], q2 * n]]) + '$, so $r = ' + p * n + '$ and $s = ' + q2 * n + '$.'],
        hint: 'Both letters inside the parentheses get the exponent ' + n + '.', chk: { t: 'equiv', a: '(' + monoP(1, [[u[0], p], [u[1], q2]]) + ')^' + n, b: monoP(1, [[u[0], p * n], [u[1], q2 * n]]), vars: u } };
    }
    if (kind === 'mix') {
      m = R.int(2, 5); n = R.int(2, 4); var k = R.int(1, 6), tot = m * n + k;
      return { q: 'Simplify: $(' + pw(v, m) + ')^{' + n + '} \\cdot ' + pw(v, k) + '$', a: { t: 'expr', v: v + '^' + tot, vars: [v], form: 'simplified' },
        steps: ['Power of a power first: $(' + pw(v, m) + ')^{' + n + '} = ' + pw(v, m * n) + '$.', 'Then multiply powers, adding exponents: $' + m * n + ' + ' + k + ' = ' + tot + '$.', 'Answer: $' + pw(v, tot) + '$'],
        hint: 'Multiply the exponents inside the power first, then add.', chk: { t: 'equiv', a: '(' + v + '^' + m + ')^' + n + '*' + pwP(v, k), b: v + '^' + tot, vars: [v], back: '(' + v + '^' + m + ')^' + n + '*' + pwP(v, k) } };
    }
    // mc: the classic slip (2x)^3 = 2x^3
    var c3 = R.int(2, 5), e3 = R.int(2, 3), m3 = R.int(1, 3);
    if (e3 === 2 && m3 === 2) m3 = 3;
    if (e3 === 2 && c3 === 2) c3 = R.int(3, 5);
    var right = Math.pow(c3, e3);
    var inner3 = mono(c3, [[v, m3]]);
    var a3 = mcq(m$(mono(right, [[v, m3 * e3]])), [m$(mono(c3, [[v, m3 * e3]])), m$(mono(c3 * e3, [[v, m3 * e3]])), m$(mono(right, [[v, m3 + e3]]))]);
    return { q: 'Which is equal to $(' + inner3 + ')^{' + e3 + '}$?', a: a3,
      steps: ['$(' + inner3 + ')^{' + e3 + '}$ is ' + e3 + ' copies of $' + inner3 + '$ multiplied together.', 'The ' + c3 + ' is used ' + e3 + ' times too: $' + pw(c3, e3) + ' = ' + right + '$.', 'The exponent of $' + v + '$ is $' + m3 + ' \\cdot ' + e3 + ' = ' + m3 * e3 + '$.', 'So it equals $' + mono(right, [[v, m3 * e3]]) + '$. Raising only the letter is the common slip.'],
      hint: 'The number inside the parentheses gets the exponent too.', chk: { t: 'mc', a: '(' + monoP(c3, [[v, m3]]) + ')^' + e3, right: monoP(right, [[v, m3 * e3]]), wrong: [monoP(c3, [[v, m3 * e3]]), monoP(c3 * e3, [[v, m3 * e3]]), monoP(right, [[v, m3 + e3]])], vars: [v] } };
  });

  G('g8.zero-negative-exponents', function (R, ctx) {
    var kind = R.pick(by(ctx, ['zero', 'neg', 'neg', 'mc', 'neg'], ['neg', 'recip', 'frac', 'var', 'mc', 'zero'], ['frac', 'negbase', 'minus0', 'sum', 'recip', 'var']));
    var bases = { 2: 5, 3: 4, 4: 3, 5: 3, 6: 2, 10: 4 }, b, n;
    function pickBN() { b = +R.pick(Object.keys(bases)); n = R.int(1, bases[b]); }
    if (kind === 'zero') {
      var opts = [String(R.int(2, 99)), '(-' + R.int(2, 9) + ')', '\\left(\\frac{' + R.int(1, 4) + '}{' + R.int(5, 9) + '}\\right)', String(R.int(100, 999))], z = R.pick(opts);
      return { q: 'Find the value: $' + z + '^{0}$', a: { t: 'num', v: '1', form: 'simplest' },
        steps: ['Go down the pattern of powers: each step divides by the base.', 'From the first power to the zeroth power you divide the base by itself, which gives 1.', 'So $' + z + '^{0} = 1$ (any base except 0).'],
        hint: 'What do you get when you divide a number by itself?', chk: { t: 'val', a: '1', v: '1' } };
    }
    if (kind === 'neg' || kind === 'mc') {
      pickBN(); if (kind === 'mc' && n === 1) n = 2; var big = Math.pow(b, n);
      var st = ['A negative exponent means divide by the base that many times: $' + pw(b, -n) + ' = \\dfrac{1}{' + pw(b, n) + '}$.', '$' + pw(b, n) + ' = ' + (n > 1 ? rep(b, n) + ' = ' : '') + big + '$.', 'So $' + pw(b, -n) + ' = \\dfrac{1}{' + big + '}$, a small positive number.'];
      if (kind === 'neg') return { q: 'Find the value as a fraction: $' + pw(b, -n) + '$', a: { t: 'num', v: '1/' + big, form: 'simplest' }, steps: st, hint: 'Continue the pattern $' + pw(b, 2) + ', ' + b + ', 1, \\ldots$: each step down divides by ' + b + '.', chk: { t: 'val', a: b + '^(-' + n + ')', v: '1/' + big } };
      var a = mcq(m$('\\frac{1}{' + big + '}'), [m$('-' + big), m$('-' + b * n), m$(String(big))]);
      return { q: 'Which is equal to $' + pw(b, -n) + '$?', a: a, steps: st.concat(['It is not negative: the minus sign is in the exponent, so it tells you to divide.']), hint: 'Does a negative exponent make the number negative, or does it tell you to divide?', chk: { t: 'mc', a: b + '^(-' + n + ')', right: '1/' + big, wrong: ['-' + big, '-' + b * n, String(big)] } };
    }
    if (kind === 'recip') {
      pickBN(); var bg = Math.pow(b, n);
      return { q: 'Find the value: $\\dfrac{1}{' + pw(b, -n) + '}$', a: { t: 'num', v: String(bg), form: 'simplest' },
        steps: ['$' + pw(b, -n) + ' = \\dfrac{1}{' + pw(b, n) + '}$.', 'Dividing 1 by a fraction flips it: $\\dfrac{1}{1/' + pw(b, n) + '} = ' + pw(b, n) + '$.', '$' + pw(b, n) + ' = ' + bg + '$'],
        hint: 'Rewrite the bottom with a positive exponent first.', chk: { t: 'val', a: '1/(' + b + '^(-' + n + '))', v: String(bg) } };
    }
    if (kind === 'frac') {
      var p = R.int(1, 5), d = R.int(2, 7); while (gcd(p, d) !== 1 || p === d) { p = R.int(1, 5); d = R.int(2, 7); }
      n = R.int(1, by(ctx, 2, 2, 3)); if (Math.pow(Math.max(p, d), n) > 400) n = 1;
      var val = Q(d, p).pow(n);
      return { q: 'Find the value: $\\left(\\dfrac{' + p + '}{' + d + '}\\right)^{-' + n + '}$', a: { t: 'num', v: val.toPlain(), form: 'simplest' },
        steps: ['A negative exponent means 1 divided by the power: $\\left(\\frac{' + p + '}{' + d + '}\\right)^{-' + n + '} = \\dfrac{1}{(' + p + '/' + d + ')^{' + n + '}}$.', 'Dividing by a fraction flips it, so this is $\\left(\\frac{' + d + '}{' + p + '}\\right)^{' + n + '}$.', '$\\left(\\frac{' + d + '}{' + p + '}\\right)^{' + n + '} = ' + val.toTex() + '$'],
        hint: 'Flip the fraction, then use the positive exponent.', chk: { t: 'val', a: '(' + p + '/' + d + ')^(-' + n + ')', v: val.toPlain() } };
    }
    if (kind === 'var') {
      var v = R.pick(LET); n = R.int(2, 9);
      return { q: 'Write with a positive exponent: $' + pw(v, -n) + ' = \\dfrac{1}{' + v + '^{\\square}}$. What number goes in the box? (Assume $' + v + ' \\ne 0$.)', a: { t: 'num', v: String(n), form: 'int' },
        steps: ['$' + pw(v, -n) + '$ means 1 divided by ' + n + ' factors of $' + v + '$.', 'So $' + pw(v, -n) + ' = \\dfrac{1}{' + pw(v, n) + '}$ and the box is ' + n + '.'],
        hint: 'The negative exponent moves the power to the bottom of a fraction.', chk: { t: 'equiv', a: v + '^(-' + n + ')', b: '1/' + v + '^' + n, vars: [v] } };
    }
    if (kind === 'negbase') {
      var nb = R.int(2, 4); n = nb === 2 ? R.pick([2, 3, 4]) : R.pick([2, 3]); var pv = Math.pow(-nb, n);
      var vq = Q(1, pv);
      return { q: 'Find the value as a fraction: $(-' + nb + ')^{-' + n + '}$', a: { t: 'num', v: vq.toPlain(), form: 'simplest' },
        steps: ['$(-' + nb + ')^{-' + n + '} = \\dfrac{1}{(-' + nb + ')^{' + n + '}}$.', '$(-' + nb + ')^{' + n + '} = ' + pv + '$ (' + (n % 2 ? 'an odd number of negative factors is negative' : 'an even number of negative factors is positive') + ').', 'So the value is $' + vq.toTex() + '$. The sign comes from the negative base, not from the negative exponent.'],
        hint: 'First write it as 1 over a positive power. Then think about the sign of the base.', chk: { t: 'val', a: '(-' + nb + ')^(-' + n + ')', v: vq.toPlain() } };
    }
    if (kind === 'minus0') {
      var c = R.int(2, 9), withP = R.coin();
      if (withP) return { q: 'Find the value: $(-' + c + ')^{0}$', a: { t: 'num', v: '1', form: 'simplest' }, steps: ['The base is $-' + c + '$, inside the parentheses.', 'Any nonzero base to the zero power is 1: $(-' + c + ')^{0} = 1$.'], hint: 'What is the base here?', chk: { t: 'val', a: '(-' + c + ')^0', v: '1' } };
      return { q: 'Find the value: $-' + c + '^{0}$', a: { t: 'num', v: '-1', form: 'simplest' }, steps: ['Without parentheses the exponent belongs to ' + c + ' only: $-' + c + '^{0} = -(' + c + '^{0})$.', '$' + c + '^{0} = 1$, so the value is $-1$.'], hint: 'Without parentheses, the exponent belongs only to the number right under it.', chk: { t: 'val', a: '-(' + c + '^0)', v: '-1' } };
    }
    // sum
    b = R.pick([2, 3, 4, 5, 10]); n = R.int(1, 2); var k2 = R.int(0, 2);
    var tot = Q(Math.pow(b, k2)).add(Q(1, Math.pow(b, n)));
    return { q: 'Find the value as a fraction: $' + pw(b, k2) + ' + ' + pw(b, -n) + '$', a: { t: 'num', v: tot.toPlain(), form: 'simplest' },
      steps: ['$' + pw(b, k2) + ' = ' + Math.pow(b, k2) + '$' + (k2 === 0 ? ' (any nonzero base to the zero power is 1)' : '') + '.', '$' + pw(b, -n) + ' = \\frac{1}{' + Math.pow(b, n) + '}$.', 'Add: $' + Math.pow(b, k2) + ' + \\frac{1}{' + Math.pow(b, n) + '} = ' + tot.toTex() + '$'],
      hint: 'Find each power’s value first. You can’t add exponents when adding.', chk: { t: 'val', a: b + '^' + k2 + '+' + b + '^(-' + n + ')', v: tot.toPlain() } };
  });

  G('g8.exponent-properties', function (R, ctx) {
    var kind = R.pick(by(ctx, ['eval', 'var', 'tf', 'like'], ['eval', 'var', 'tf', 'mc', 'like', 'eval'], ['eval', 'var2', 'tf', 'mc', 'var2']));
    var v = R.pick(['x', 'a', 'm', 'n', 'p', 'k']);
    if (kind === 'eval') {
      var b = R.pick([2, 2, 3, 3, 5, 10]), lim = { 2: [-3, 5], 3: [-2, 4], 5: [-2, 3], 10: [-3, 4] }[b], f = R.int(lim[0], lim[1]);
      var shape = R.int(0, 2), qs, steps, qP, p, q, r;
      if (shape === 0) { p = R.int(2, 7); q = R.int(-4, 6); r = p + q - f; qs = '\\dfrac{' + pw(b, p) + ' \\cdot ' + pw(b, q) + '}{' + pw(b, r) + '}'; qP = b + '^(' + p + ')*' + b + '^(' + q + ')/' + b + '^(' + r + ')'; steps = ['Top: add the exponents, $' + p + ' + ' + T.p(q) + ' = ' + (p + q) + '$.', 'Divide: subtract the exponents, $' + (p + q) + ' - ' + T.p(r) + ' = ' + f + '$.']; }
      else if (shape === 1) { p = R.int(2, 3); q = R.int(2, 3); r = p * q - f; qs = '\\dfrac{(' + pw(b, p) + ')^{' + q + '}}{' + pw(b, r) + '}'; qP = '(' + b + '^' + p + ')^' + q + '/' + b + '^(' + r + ')'; steps = ['Power of a power: $(' + pw(b, p) + ')^{' + q + '} = ' + pw(b, p * q) + '$.', 'Divide: $' + p * q + ' - ' + T.p(r) + ' = ' + f + '$.']; }
      else { p = R.int(-5, 6); q = f - p; if (q === 0) { q = 1; p = f - 1; } qs = pw(b, p) + ' \\cdot ' + pw(b, q); qP = b + '^(' + p + ')*' + b + '^(' + q + ')'; steps = ['Same base: add the exponents, $' + p + ' + ' + T.p(q) + ' = ' + f + '$.']; }
      var val = Q(b).pow(f);
      steps.push('$' + pw(b, f) + ' = ' + val.toTex() + '$' + (f === 0 ? ' (the zeroth power is 1)' : f < 0 ? ' (a negative exponent means 1 over the power)' : ''));
      return { q: 'Find the value: $' + qs + '$', a: { t: 'num', v: val.toPlain(), form: 'simplest' }, steps: steps, hint: 'Write everything as one power of ' + b + ' first, then find its value.', chk: { t: 'val', a: qP, v: val.toPlain() } };
    }
    if (kind === 'var' || kind === 'var2') {
      var a1 = R.int(2, 4), a2 = R.int(2, 3), a3 = R.int(1, 6), a4 = R.int(1, 8), e = a1 * a2 + a3 - a4;
      if (e <= 0) { a4 = a1 * a2 + a3 - R.int(1, 5); e = a1 * a2 + a3 - a4; }
      var cc = kind === 'var2' ? R.int(2, 6) : 1, cd = kind === 'var2' ? R.pick([1, 2, 3].filter(function (z) { return cc % z === 0; })) : 1;
      var qsV = '\\dfrac{' + (cc > 1 ? cc : '') + '(' + pw(v, a1) + ')^{' + a2 + '} \\cdot ' + pw(v, a3) + '}{' + mono(cd, [[v, a4]]) + '}', qPV = cc + '*(' + v + '^' + a1 + ')^' + a2 + '*' + pwP(v, a3) + '/(' + monoP(cd, [[v, a4]]) + ')';
      var resV = monoP(cc / cd, [[v, e]]);
      return { q: 'Simplify: $' + qsV + '$ (Assume $' + v + ' \\ne 0$.)', a: { t: 'expr', v: resV, vars: [v], form: 'simplified' },
        steps: ['Power of a power: $(' + pw(v, a1) + ')^{' + a2 + '} = ' + pw(v, a1 * a2) + '$.', 'Multiply on top: $' + pw(v, a1 * a2) + ' \\cdot ' + pw(v, a3) + ' = ' + pw(v, a1 * a2 + a3) + '$.', (cd > 1 ? 'Numbers: $' + cc + ' \\div ' + cd + ' = ' + cc / cd + '$. ' : '') + 'Divide: $' + (a1 * a2 + a3) + ' - ' + a4 + ' = ' + e + '$.', 'Answer: $' + mono(cc / cd, [[v, e]]) + '$'],
        hint: 'Work inside out: power of a power, then multiply, then divide.', chk: { t: 'equiv', a: qPV, b: resV, vars: [v], back: qPV } };
    }
    if (kind === 'like') {
      var c1 = R.int(2, 9), c2 = R.int(2, 9), ex = R.int(2, 5), add = R.coin();
      if (add) return { q: 'Simplify: $' + mono(c1, [[v, ex]]) + ' + ' + mono(c2, [[v, ex]]) + '$', a: { t: 'expr', v: monoP(c1 + c2, [[v, ex]]), vars: [v], form: 'simplified' },
        steps: ['These are like terms: both are a number of $' + pw(v, ex) + '$.', 'Adding like terms adds the counts and keeps $' + pw(v, ex) + '$: $' + c1 + ' + ' + c2 + ' = ' + (c1 + c2) + '$.', 'Answer: $' + mono(c1 + c2, [[v, ex]]) + '$. The exponent stays ' + ex + ': exponent rules are for multiplying, not adding.'],
        hint: 'Is this a sum or a product? For a sum of like terms, add the numbers in front.', chk: { t: 'equiv', a: monoP(c1, [[v, ex]]) + '+' + monoP(c2, [[v, ex]]), b: monoP(c1 + c2, [[v, ex]]), vars: [v], back: monoP(c1, [[v, ex]]) + '+' + monoP(c2, [[v, ex]]) } };
      return { q: 'Simplify: $' + mono(c1, [[v, ex]]) + ' \\cdot ' + mono(c2, [[v, ex]]) + '$', a: { t: 'expr', v: monoP(c1 * c2, [[v, 2 * ex]]), vars: [v], form: 'simplified' },
        steps: ['This is a product, so multiply the numbers: $' + c1 + ' \\cdot ' + c2 + ' = ' + c1 * c2 + '$.', 'And add the exponents: $' + ex + ' + ' + ex + ' = ' + 2 * ex + '$.', 'Answer: $' + mono(c1 * c2, [[v, 2 * ex]]) + '$'],
        hint: 'A product: multiply the numbers, add the exponents.', chk: { t: 'equiv', a: monoP(c1, [[v, ex]]) + '*' + monoP(c2, [[v, ex]]), b: monoP(c1 * c2, [[v, 2 * ex]]), vars: [v], back: monoP(c1, [[v, ex]]) + '*' + monoP(c2, [[v, ex]]) } };
    }
    if (kind === 'tf') {
      var p1 = R.int(2, 5), p2 = R.int(2, 5); while (p1 * p2 === p1 + p2 || p1 === p2) p2 = R.int(2, 6);
      var cands = [
        [pw(v, p1) + ' \\cdot ' + pw(v, p2) + ' = ' + pw(v, p1 + p2), true, 'Multiplying powers of the same base adds the exponents.', pwP(v, p1) + '*' + pwP(v, p2), pwP(v, p1 + p2)],
        [pw(v, p1) + ' + ' + pw(v, p2) + ' = ' + pw(v, p1 + p2), false, 'You can’t add powers by adding exponents. Try $' + v + ' = 2$: $' + pw(2, p1) + ' + ' + pw(2, p2) + ' = ' + (Math.pow(2, p1) + Math.pow(2, p2)) + '$, but $' + pw(2, p1 + p2) + ' = ' + Math.pow(2, p1 + p2) + '$.', pwP(v, p1) + '+' + pwP(v, p2), pwP(v, p1 + p2)],
        ['(' + pw(v, p1) + ')^{' + p2 + '} = ' + pw(v, p1 + p2), false, 'A power of a power multiplies the exponents: $(' + pw(v, p1) + ')^{' + p2 + '} = ' + pw(v, p1 * p2) + '$.', '(' + pwP(v, p1) + ')^' + p2, pwP(v, p1 + p2)],
        ['\\dfrac{' + pw(v, p1 * p2) + '}{' + pw(v, p2) + '} = ' + pw(v, p1), false, 'Dividing subtracts the exponents: $' + p1 * p2 + ' - ' + p2 + ' = ' + (p1 * p2 - p2) + '$, so it equals $' + pw(v, p1 * p2 - p2) + '$.', pwP(v, p1 * p2) + '/' + pwP(v, p2), pwP(v, p1)],
        [pw(v, -p1) + ' = ' + T.coef(-1, pw(v, p1)), false, 'A negative exponent means 1 over the power: $' + pw(v, -p1) + ' = \\frac{1}{' + pw(v, p1) + '}$.', pwP(v, -p1), '-' + pwP(v, p1)],
        ['(2' + v + ')^{' + p1 + '} = 2' + pw(v, p1), false, 'The 2 is raised to the power too: $(2' + v + ')^{' + p1 + '} = ' + Math.pow(2, p1) + pw(v, p1) + '$.', '(2*' + v + ')^' + p1, '2*' + pwP(v, p1)],
        [pw(v, p1) + ' \\cdot ' + pw('y', p1) + ' = (' + v + 'y)^{' + p1 + '}', v !== 'y', 'Each side is ' + p1 + ' factors of $' + v + '$ and ' + p1 + ' factors of $y$, regrouped.', pwP(v, p1) + '*y^' + p1, '(' + v + '*y)^' + p1],
        [pw(v, p1) + ' \\cdot ' + pw(v, -p1) + ' = 1', true, 'Add the exponents: $' + p1 + ' + (-' + p1 + ') = 0$, and $' + pw(v, 0) + ' = 1$.', pwP(v, p1) + '*' + pwP(v, -p1), '1']
      ];
      var pc = R.pick(cands);
      return { q: 'True or false? $' + pc[0] + '$ (for every nonzero value of $' + v + '$)', a: { t: 'tf', v: pc[1] }, steps: [pc[2], pc[1] ? 'So the statement is true.' : 'So the statement is false.'], hint: 'Try a small number for ' + v + ', like 2, on both sides.', chk: { t: 'tf', a: pc[3], b: pc[4], v: pc[1], vars: [v, 'y'] } };
    }
    // mc: which equals x^n?
    var tgt = R.int(5, 9), s1 = R.int(2, tgt - 2), d4 = R.int(2, 4), mm = R.pick([2, 3].filter(function (z) { return tgt % z !== 0; }).concat([2]));
    var right = pw(v, s1) + ' \\cdot ' + pw(v, tgt - s1);
    var wr = [pw(v, s1) + ' + ' + pw(v, tgt - s1), '(' + pw(v, tgt - mm) + ')^{' + mm + '}', '\\dfrac{' + pw(v, tgt * d4) + '}{' + pw(v, d4) + '}'];
    return { q: 'Which expression is equal to $' + pw(v, tgt) + '$ for every nonzero $' + v + '$?', a: mcq(m$(right), wr.map(m$)),
      steps: ['$' + right + ' = ' + pw(v, tgt) + '$ (add the exponents).', '$' + wr[0] + '$ is a sum; it can’t be combined into one power.', '$' + wr[1] + ' = ' + pw(v, (tgt - mm) * mm) + '$ and $' + wr[2] + ' = ' + pw(v, tgt * d4 - d4) + '$.'],
      hint: 'Simplify each choice with the rules, and remember sums can’t be combined.', chk: { t: 'mc', right: pwP(v, s1) + '*' + pwP(v, tgt - s1), a: pwP(v, tgt), wrong: [pwP(v, s1) + '+' + pwP(v, tgt - s1), '(' + pwP(v, tgt - mm) + ')^' + mm, pwP(v, tgt * d4) + '/' + pwP(v, d4)], vars: [v] } };
  });

  // ---------------------------------------------------------------- scientific notation helpers
  function sciOf(q) { // q: positive Q -> {a: Q (1 <= a < 10), n}
    q = Q.from(q); var n = 0;
    while (q.ge(10)) { q = q.div(10); n++; }
    while (q.lt(1)) { q = q.mul(10); n--; }
    return { a: q, n: n };
  }
  function decStr(q) { q = Q.from(q); return U.numStr(q); }               // exact decimal string (terminating values only)
  function sciTex(a, n) { return T.num(decStr(a)) + ' \\times 10^{' + n + '}'; }
  function stdTex(q) { var s = decStr(q); return /^\d+$/.test(s) ? T.commas(s) : s; }
  function randCoef(R, digits) { // a decimal 1 <= a < 10 with up to `digits` significant digits, last digit nonzero
    var d = R.int(1, 9), s = String(d);
    for (var i = 1; i < digits; i++) s += String(i === digits - 1 ? R.int(1, 9) : R.int(0, 9));
    return Q(Number(s), Math.pow(10, digits - 1));
  }
  function sciMulti(a, n) { return { t: 'multi', parts: [{ label: '$a =$', a: { t: 'num', v: decStr(a) } }, { label: '$n =$', a: { t: 'num', v: String(n), form: 'int' } }] }; }

  G('g8.scientific-notation', function (R, ctx) {
    var kind = R.pick(by(ctx, ['big', 'big', 'small', 'tostd', 'mc'], ['big', 'small', 'small', 'tostd', 'fix', 'mc'], ['small', 'fix', 'tostd', 'big', 'ctx']));
    if (kind === 'big' || kind === 'small' || kind === 'ctx') {
      var a = randCoef(R, R.int(1, 3)), n = kind === 'big' ? R.int(by(ctx, 3, 4, 5), by(ctx, 6, 8, 11)) : -R.int(by(ctx, 2, 3, 4), by(ctx, 4, 6, 7));
      var val = a.mul(Q(10).pow(n)), sv = stdTex(val), aS = decStr(a);
      var ctxt = kind === 'ctx' ? R.pick([['A grain of pollen is about', 'meters wide.'], ['A thin sheet of foil is', 'meters thick.'], ['A small bacterium is about', 'meters long.'], ['A drop of water has a mass of about', 'kilograms.']]) : null;
      var moves = Math.abs(n);
      var steps = n > 0 ? ['Place the decimal point after the first nonzero digit: $' + T.num(aS) + '$ is between 1 and 10.', 'From $' + T.num(aS) + '$ to $' + sv + '$ the point moves ' + moves + ' places to the right, which is multiplying by $10^{' + n + '}$.', 'So $' + sv + ' = ' + sciTex(a, n) + '$: $a = ' + T.num(aS) + '$, $n = ' + n + '$.']
        : ['Place the decimal point after the first nonzero digit: $' + T.num(aS) + '$ is between 1 and 10.', 'To get from $' + T.num(aS) + '$ back to $' + sv + '$, the point moves ' + moves + ' places to the left, which is dividing by $10^{' + moves + '}$, the same as multiplying by $10^{' + n + '}$.', 'So $' + sv + ' = ' + sciTex(a, n) + '$. A number less than 1 has a negative exponent.'];
      return { q: (ctxt ? ctxt[0] + ' $' + sv + '$ ' + ctxt[1] + ' Write this number in scientific notation, $a \\times 10^{n}$.' : 'Write $' + sv + '$ in scientific notation, $a \\times 10^{n}$ with $1 \\le a < 10$.'), a: sciMulti(a, n), steps: steps,
        hint: n > 0 ? 'Count how many places the decimal point moves to make a number between 1 and 10.' : 'The number is less than 1, so the exponent is negative.', chk: { t: 'sci', x: val.toPlain(), a: aS, n: n } };
    }
    if (kind === 'tostd') {
      var a2 = randCoef(R, R.int(1, 3)), n2 = R.coin() ? R.int(3, by(ctx, 6, 7, 9)) : -R.int(1, by(ctx, 4, 5, 7)), v2 = a2.mul(Q(10).pow(n2));
      return { q: 'Write $' + sciTex(a2, n2) + '$ in standard form (as an ordinary number).', a: { t: 'num', v: decStr(v2), form: 'dec' },
        steps: [n2 > 0 ? 'Multiplying by $10^{' + n2 + '}$ moves the decimal point ' + n2 + ' places to the right.' : 'Multiplying by $10^{' + n2 + '}$ divides by $10^{' + (-n2) + '}$: the point moves ' + (-n2) + ' places to the left.', 'Fill empty places with zeros.', '$' + sciTex(a2, n2) + ' = ' + stdTex(v2) + '$'],
        hint: n2 > 0 ? 'Positive exponent: the number is big.' : 'Negative exponent: the number is less than 1.', chk: { t: 'val', a: decStr(a2) + '*10^(' + n2 + ')', v: decStr(v2) } };
    }
    if (kind === 'fix') {
      var big = R.coin(), c, e, tv;
      if (big) { c = Q(R.int(11, 99), R.pick([1, 10])); if (c.isInt() && c.num() % 10 === 0) c = c.add(1); e = R.int(-6, 7); }
      else { c = Q(R.int(1, 9), R.pick([10, 100])); e = R.int(-6, 7); }
      tv = c.mul(Q(10).pow(e)); var s = sciOf(tv);
      return { q: '$' + T.num(decStr(c)) + ' \\times 10^{' + e + '}$ is not in scientific notation. Rewrite it as $a \\times 10^{n}$ with $1 \\le a < 10$.', a: sciMulti(s.a, s.n),
        steps: ['$' + T.num(decStr(c)) + '$ is ' + (big ? 'not less than 10' : 'less than 1') + '. Write it as $' + T.num(decStr(s.a)) + ' \\times 10^{' + (s.n - e) + '}$.', 'Then $' + T.num(decStr(c)) + ' \\times 10^{' + e + '} = ' + T.num(decStr(s.a)) + ' \\times 10^{' + (s.n - e) + '} \\times 10^{' + e + '}$.', 'Add the exponents: $' + (s.n - e) + ' + ' + T.p(e) + ' = ' + s.n + '$. Answer: $' + sciTex(s.a, s.n) + '$.'],
        hint: big ? 'Making the first factor smaller by 10 means the power of 10 must get bigger by one.' : 'Making the first factor bigger means the power of 10 must get smaller.', chk: { t: 'sci', x: tv.toPlain(), a: decStr(s.a), n: s.n } };
    }
    // mc: which is in scientific notation?
    var a3 = randCoef(R, 2), n3 = R.int(3, 7) * (R.coin() ? 1 : -1);
    var right = sciTex(a3, n3), w1 = T.num(decStr(a3.mul(10))) + ' \\times 10^{' + (n3 - 1) + '}', w2 = T.num(decStr(a3.div(10))) + ' \\times 10^{' + (n3 + 1) + '}', w3 = T.num(decStr(a3.mul(100))) + ' \\times 10^{' + (n3 - 2) + '}';
    return { q: 'All four numbers are equal. Which one is written in scientific notation?', a: mcq(m$(right), [m$(w1), m$(w2), m$(w3)]),
      steps: ['In scientific notation the first factor is at least 1 and less than 10.', 'Only $' + T.num(decStr(a3)) + '$ fits: $' + right + '$.'],
      hint: 'Look at the first factor in each one.', chk: { t: 'sci', x: a3.mul(Q(10).pow(n3)).toPlain(), a: decStr(a3), n: n3 } };
  });

  G('g8.compare-scientific', function (R, ctx) {
    var kind = R.pick(by(ctx, ['bigger', 'times', 'estimate', 'bigger'], ['bigger', 'times', 'estimate', 'order', 'times'], ['times', 'order', 'estimate', 'bigger', 'times']));
    if (kind === 'bigger') {
      var neg = ctx.level > 1 && R.coin(), n1 = R.int(2, 8) * (neg ? -1 : 1), n2 = n1 + R.pick([1, 2]) * (R.coin() ? 1 : -1);
      var a1 = randCoef(R, 2), a2 = randCoef(R, 2);
      if (n1 > n2 && a1.gt(a2)) { var t = a1; a1 = a2; a2 = t; }
      if (n2 > n1 && a2.gt(a1)) { var t2 = a1; a1 = a2; a2 = t2; }
      var A = sciTex(a1, n1), B = sciTex(a2, n2), big = n1 > n2 ? A : B;
      return { q: 'Which number is greater?', a: { t: 'mc', choices: [m$(big), m$(big === A ? B : A)], v: 0 },
        steps: ['Compare the powers of 10 first: $10^{' + Math.max(n1, n2) + '}$ is ' + Math.pow(10, Math.abs(n1 - n2)) + ' times $10^{' + Math.min(n1, n2) + '}$.', 'Both first factors are between 1 and 10, so they can’t make up that difference.', 'So $' + big + '$ is greater' + (neg ? ' (with negative exponents, the one closer to 0, here $' + Math.max(n1, n2) + '$, is bigger)' : '') + '.'],
        hint: 'Look at the exponents before the first factors.', chk: { t: 'cmp', x: decStr(a1) + '*10^(' + n1 + ')', y: decStr(a2) + '*10^(' + n2 + ')', big: big === A ? 0 : 1 } };
    }
    if (kind === 'times') {
      var pairs = [[6, 2], [8, 2], [9, 3], [8, 4], [6, 3], [4, 2], [3, 6], [2, 4], [1, 2], [2, 5], [3, 5], [4, 8], [5, 2], [9, 2], [6, 4]];
      var pr = R.pick(pairs), e1 = R.int(4, 10), e2 = e1 - R.int(1, 5), ratio = Q(pr[0], pr[1]).mul(Q(10).pow(e1 - e2));
      var ctxs = [['A large city has about', 'people. A small town has about', 'people. About how many times as many people live in the city?'],
        ['A computer does about', 'operations each second. An older one does about', '. About how many times as many does the new one do?'],
        ['A star is about', 'kilometers away. A planet is about', 'kilometers away. About how many times as far away is the star?']];
      var cx = R.pick(ctxs), A2 = sciTex(Q(pr[0]), e1), B2 = sciTex(Q(pr[1]), e2);
      var ans = sciOf(ratio);
      return { q: cx[0] + ' $' + A2 + '$ ' + cx[1] + ' $' + B2 + '$' + (cx[1].slice(-1) === '.' ? '' : ' ') + cx[2].replace(/^ /, ''), a: { t: 'num', v: ratio.toPlain() },
        steps: ['Divide: $\\dfrac{' + A2 + '}{' + B2 + '} = \\dfrac{' + pr[0] + '}{' + pr[1] + '} \\times \\dfrac{10^{' + e1 + '}}{10^{' + e2 + '}}$.', '$\\frac{' + pr[0] + '}{' + pr[1] + '} = ' + T.num(decStr(Q(pr[0], pr[1]))) + '$ and $\\frac{10^{' + e1 + '}}{10^{' + e2 + '}} = 10^{' + (e1 - e2) + '}$.', 'So it is $' + T.num(decStr(Q(pr[0], pr[1]))) + ' \\times 10^{' + (e1 - e2) + '} = ' + stdTex(ratio) + '$ times as many' + (ans.n !== e1 - e2 ? ', or $' + sciTex(ans.a, ans.n) + '$' : '') + '.'],
        hint: 'Divide the first factors, and subtract the exponents.', chk: { t: 'val', a: '(' + pr[0] + '*10^' + e1 + ')/(' + pr[1] + '*10^' + e2 + ')', v: ratio.toPlain() } };
    }
    if (kind === 'estimate') {
      var big3 = R.coin(), d = R.int(1, 8), next = R.int(0, 9), more = R.int(0, 9), e3 = big3 ? R.int(4, 9) : -R.int(2, 6);
      var digits = Q(d * 100 + next * 10 + more, 100), val3 = digits.mul(Q(10).pow(e3)), rd = next >= 5 ? d + 1 : d;
      return { q: 'Estimate $' + stdTex(val3) + '$ as a single digit times a power of 10, $a \\times 10^{n}$. Give $a$ and $n$.', a: { t: 'multi', parts: [{ label: '$a =$', a: { t: 'num', v: String(rd), form: 'int' } }, { label: '$n =$', a: { t: 'num', v: String(e3), form: 'int' } }] },
        steps: ['In scientific notation, $' + stdTex(val3) + ' = ' + sciTex(digits, e3) + '$.', 'Round $' + T.num(decStr(digits)) + '$ to the nearest whole number: $' + rd + '$.', 'Estimate: about $' + rd + ' \\times 10^{' + e3 + '}$.'],
        hint: 'Write it in scientific notation first, then round the first factor.', chk: { t: 'est', x: val3.toPlain(), a: rd, n: e3 } };
    }
    // order three numbers, least to greatest
    var ns = R.sample([2, 3, 4, 5, 6, 7], 3).map(function (z) { return ctx.level > 2 && R.coin() ? -z : z; }), list = ns.map(function (e) { return { a: randCoef(R, 2), n: e }; });
    if (R.coin()) list[1].n = list[0].n;
    if (list[1].n === list[0].n && list[1].a.eq(list[0].a)) list[1].a = list[1].a.add(Q(1, 10)).lt(10) ? list[1].a.add(Q(1, 10)) : list[1].a.sub(Q(1, 10));
    var vals = list.map(function (z) { return z.a.mul(Q(10).pow(z.n)); });
    var idx = [0, 1, 2].sort(function (i, j) { return vals[i].cmp(vals[j]); }), texs = list.map(function (z) { return sciTex(z.a, z.n); });
    var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(function (p) { return p.map(function (i) { return idx[i]; }); });
    var show = function (p) { return p.map(function (i) { return m$(texs[i]); }).join(', '); };
    var wrongs = R.shuffle(perms.slice(1)).slice(0, 3).map(show);
    return { q: 'Order from least to greatest: $' + texs.join('$, $') + '$', a: mcq(show(perms[0]), wrongs),
      steps: ['Compare exponents first; the smallest power of 10 is the smallest number.', 'When two exponents match, compare the first factors.', 'Least to greatest: ' + show(perms[0]) + '.'],
      hint: 'Sort by the exponent first, then by the first factor.', chk: { t: 'order', xs: vals.map(function (z) { return z.toPlain(); }), order: perms[0] } };
  });

  G('g8.scientific-operations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['mul', 'div', 'add', 'mul'], ['mul', 'div', 'add', 'sub', 'word', 'mc'], ['mul', 'div', 'add', 'sub', 'word', 'mc']));
    function sci(a, n) { return sciTex(a, n); }
    function finish(val, steps) { var s = sciOf(val); return { s: s, steps: steps }; }
    if (kind === 'mul' || kind === 'word') {
      var a1 = R.pick([Q(3, 2), Q(2), Q(5, 2), Q(3), Q(4), Q(5), Q(6), Q(7), Q(8), Q(12, 10), Q(9)]);
      var a2 = Q(R.int(2, 9)), n1 = R.int(-5, 9), n2 = R.int(-5, 9);
      if (kind === 'word') { n1 = R.int(3, 8); n2 = R.int(2, 5); }
      var prod = a1.mul(a2), tot = n1 + n2, val = prod.mul(Q(10).pow(tot)), s = sciOf(val);
      var steps = ['Regroup: $(' + T.num(decStr(a1)) + ' \\times ' + T.num(decStr(a2)) + ') \\times (10^{' + n1 + '} \\times 10^{' + n2 + '})$.', 'Multiply the first factors: $' + T.num(decStr(a1)) + ' \\times ' + T.num(decStr(a2)) + ' = ' + T.num(decStr(prod)) + '$. Add the exponents: $' + n1 + ' + ' + T.p(n2) + ' = ' + tot + '$.'];
      steps.push(prod.ge(10) ? '$' + T.num(decStr(prod)) + ' \\times 10^{' + tot + '}$ has a first factor of 10 or more, so write $' + T.num(decStr(prod)) + ' = ' + T.num(decStr(s.a)) + ' \\times 10^{1}$: answer $' + sci(s.a, s.n) + '$.' : 'Answer: $' + sci(s.a, s.n) + '$.');
      var qs = 'Multiply. Write the answer in scientific notation, $a \\times 10^{n}$: $(' + sci(a1, n1) + ')(' + sci(a2, n2) + ')$';
      if (kind === 'word') {
        var w = R.pick([['A library’s server holds', 'files. Each file uses about', 'bytes. About how many bytes do the files use in all?'], ['A warehouse ships', 'boxes a year. Each box holds', 'items. How many items is that?'], ['A farm grows', 'plants. Each plant makes about', 'seeds. About how many seeds is that?']]);
        qs = w[0] + ' $' + sci(a1, n1) + '$ ' + w[1] + ' $' + sci(a2, n2) + '$ ' + w[2] + ' Write the answer in scientific notation, $a \\times 10^{n}$.';
      }
      return { q: qs, a: sciMulti(s.a, s.n), steps: steps, hint: 'Multiply the first factors and add the exponents. Then make sure the first factor is between 1 and 10.', chk: { t: 'sci', x: '(' + decStr(a1) + '*10^(' + n1 + '))*(' + decStr(a2) + '*10^(' + n2 + '))', a: decStr(s.a), n: s.n } };
    }
    if (kind === 'div') {
      var b2 = Q(R.int(2, 8)), k = R.pick([Q(1, 2), Q(2), Q(3), Q(4), Q(3, 2), Q(5, 2), Q(1, 4), Q(3, 4)]);
      var b1 = b2.mul(k); if (b1.ge(10)) { k = Q(1, 2); b1 = b2.mul(k); }
      var m1 = R.int(-3, 12), m2 = R.int(-6, 8), dv = m1 - m2, qv = k.mul(Q(10).pow(dv)), s2 = sciOf(qv);
      var st2 = ['Divide the first factors: $' + T.num(decStr(b1)) + ' \\div ' + T.num(decStr(b2)) + ' = ' + T.num(decStr(k)) + '$.', 'Subtract the exponents: $' + m1 + ' - ' + T.p(m2) + ' = ' + dv + '$.'];
      st2.push(k.lt(1) ? '$' + T.num(decStr(k)) + '$ is less than 1, so write it as $' + T.num(decStr(s2.a)) + ' \\times 10^{-1}$: answer $' + sci(s2.a, s2.n) + '$.' : 'Answer: $' + sci(s2.a, s2.n) + '$.');
      return { q: 'Divide. Write the answer in scientific notation, $a \\times 10^{n}$: $\\dfrac{' + sci(b1, m1) + '}{' + sci(b2, m2) + '}$', a: sciMulti(s2.a, s2.n), steps: st2,
        hint: 'Divide the first factors and subtract the exponents.', chk: { t: 'sci', x: '(' + decStr(b1) + '*10^(' + m1 + '))/(' + decStr(b2) + '*10^(' + m2 + '))', a: decStr(s2.a), n: s2.n } };
    }
    if (kind === 'add' || kind === 'sub') {
      var e = R.int(-4, 9), gap = R.pick(by(ctx, [0, 0, 1], [0, 1, 1], [1, 1, 2])), x1 = Q(R.int(11, 89), 10), x2 = Q(R.int(11, 89), 10);
      var e2 = e - gap, sub = kind === 'sub';
      if (sub && gap === 0) while (x2.eq(x1)) x2 = Q(R.int(11, 89), 10); // equal numbers would subtract to 0, which has no scientific form
      var v1 = x1.mul(Q(10).pow(e)), v2 = x2.mul(Q(10).pow(e2));
      if (sub && v2.gt(v1)) { var tq = x1; x1 = x2; x2 = tq; var te = e; e = e2; e2 = te; v1 = x1.mul(Q(10).pow(e)); v2 = x2.mul(Q(10).pow(e2)); }
      var hiE = Math.max(e, e2), conv1 = v1.div(Q(10).pow(hiE)), conv2 = v2.div(Q(10).pow(hiE)), sumc = sub ? conv1.sub(conv2) : conv1.add(conv2), res = sumc.mul(Q(10).pow(hiE)), s3 = sciOf(res);
      var op = sub ? ' - ' : ' + ';
      var st3 = [];
      if (e !== e2) st3.push('Make the powers of 10 match. Rewrite the one with the smaller exponent: $' + sci(e < e2 ? x1 : x2, Math.min(e, e2)) + ' = ' + T.num(decStr(e < e2 ? conv1 : conv2)) + ' \\times 10^{' + hiE + '}$.');
      else st3.push('The powers of 10 already match: both are $10^{' + e + '}$.');
      st3.push((sub ? 'Subtract' : 'Add') + ' the first factors and keep $10^{' + hiE + '}$: $(' + T.num(decStr(conv1)) + op + T.num(decStr(conv2)) + ') \\times 10^{' + hiE + '} = ' + T.num(decStr(sumc)) + ' \\times 10^{' + hiE + '}$.');
      st3.push((s3.n !== hiE ? 'Adjust so the first factor is between 1 and 10: ' : 'Answer: ') + '$' + sci(s3.a, s3.n) + '$' + (s3.n !== hiE ? '.' : ''));
      return { q: (sub ? 'Subtract' : 'Add') + '. Write the answer in scientific notation, $a \\times 10^{n}$: $' + sci(x1, e) + op + sci(x2, e2) + '$', a: sciMulti(s3.a, s3.n), steps: st3,
        hint: 'You can only add or subtract the first factors when the powers of 10 are the same. The exponent does not change.', chk: { t: 'sci', x: decStr(x1) + '*10^(' + e + ')' + (sub ? '-' : '+') + decStr(x2) + '*10^(' + e2 + ')', a: decStr(s3.a), n: s3.n } };
    }
    // mc: adding with equal exponents (the classic slip)
    var p = R.int(1, 4), q = R.int(1, 4), n = R.int(2, 8);
    var right = (p + q) + ' \\times 10^{' + n + '}';
    return { q: 'What is $(' + p + ' \\times 10^{' + n + '}) + (' + q + ' \\times 10^{' + n + '})$?', a: mcq(m$(right), [m$((p + q) + ' \\times 10^{' + 2 * n + '}'), m$((p * q) + ' \\times 10^{' + 2 * n + '}'), m$((p + q) + ' \\times 10^{' + n * n + '}')]),
      steps: ['Both numbers count the same thing: $10^{' + n + '}$s.', '$' + p + '$ of them plus $' + q + '$ of them is $' + (p + q) + '$ of them.', 'So the sum is $' + right + '$. Adding does not add exponents; that rule is for multiplying.'],
      hint: 'Think of 10^' + n + ' as a unit, like “thousands.”', chk: { t: 'mcval', right: (p + q) + '*10^' + n, a: p + '*10^' + n + '+' + q + '*10^' + n, wrong: [(p + q) + '*10^' + 2 * n, p * q + '*10^' + 2 * n, (p + q) + '*10^' + n * n] } };
  });


  // ================================================================ Unit 2: roots and irrational numbers
  function isqrt(n) { var r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; }
  function nonSquare(R, lo, hi) { var n; do { n = R.int(lo, hi); } while (U.isSquare(n)); return n; }
  function squarefree(R, lo, hi) { var n; do { n = R.int(lo, hi); } while (U.simplifyRadical(n)[0] !== 1); return n; }
  function sqrtTenth(n) { // the square root of a whole number n, rounded to the nearest tenth, exactly: returns a Q
    var t = isqrt(100 * n);                    // t <= 10*sqrt(n) < t + 1
    var up = 400 * n >= (2 * t + 1) * (2 * t + 1); // 10*sqrt(n) >= t + 0.5
    return Q(up ? t + 1 : t, 10);
  }

  G('g8.square-roots', function (R, ctx) {
    var kind = R.pick(by(ctx, ['root', 'root', 'area', 'mc', 'rev'], ['root', 'frac', 'dec', 'area', 'mc', 'neg'], ['frac', 'dec', 'sum', 'tf', 'root', 'neg']));
    var k = R.int(2, by(ctx, 15, 20, 25)), n = k * k;
    if (R.chance(0.25)) {
      var okS = R.coin(), shownS = okS ? k : R.pick([n / 2, 2 * k, k + 1, k - 1].filter(function (z) { return z !== k && z > 0 && z === Math.floor(z); })), whoS = R.pick(['Ava', 'Ben', 'Chen', 'Dara', 'Eli', 'Farah', 'Gus', 'Hana', 'Ivan', 'Jada', 'Kofi', 'Lena', 'Milo', 'Nia', 'Omar', 'Pia']);
      return { q: whoS + ' says $\\sqrt{' + n + '} = ' + shownS + '$. Is that right?', a: { t: 'mc', choices: ['Yes', 'No'], v: okS ? 0 : 1, keep: true },
        steps: ['Check by squaring: $' + shownS + ' \\times ' + shownS + ' = ' + shownS * shownS + '$.', okS ? 'That is ' + n + ', so yes.' : 'That is not ' + n + '. In fact $' + k + ' \\times ' + k + ' = ' + n + '$, so $\\sqrt{' + n + '} = ' + k + '$.' + (shownS === n / 2 ? ' (Halving is not the same as taking a square root.)' : '')], hint: 'Square the answer to check it.', chk: { t: 'val', a: 'sqrt(' + n + ')', v: String(k) } };
    }
    if (kind === 'root') return { q: R.pick(['Find $\\sqrt{' + n + '}$.', 'What positive number times itself makes ' + n + '? Find $\\sqrt{' + n + '}$.']), a: { t: 'num', v: String(k), form: 'simplest' },
      steps: ['Look for the number that times itself makes ' + n + '.', '$' + k + ' \\times ' + k + ' = ' + n + '$', 'So $\\sqrt{' + n + '} = ' + k + '$.'], hint: 'Which number squared is ' + n + '?', chk: { t: 'val', a: 'sqrt(' + n + ')', v: String(k) } };
    if (kind === 'area') {
      var ctxs = [['A square garden', 'square feet'], ['A square rug', 'square feet'], ['A square tile', 'square inches'], ['A square patio', 'square meters'], ['A square field', 'square yards']], cc = R.pick(ctxs), u = cc[1], what = cc[0];
      return { q: what + ' has an area of ' + n + ' ' + u + '. How long is each side?', a: { t: 'num', v: String(k), form: 'simplest' }, unit: u.replace('square ', ''),
        steps: ['The area of a square is side × side.', 'So the side is the square root of the area: $\\sqrt{' + n + '}$.', '$' + k + ' \\times ' + k + ' = ' + n + '$, so each side is ' + k + ' ' + u.replace('square ', '') + '.'], hint: 'Which length times itself gives ' + n + '?', chk: { t: 'val', a: 'sqrt(' + n + ')', v: String(k) } };
    }
    if (kind === 'mc') {
      if (k % 2 === 1 || k === 2) k = 2 * R.int(2, 6); n = k * k;
      return { q: 'What is $\\sqrt{' + n + '}$?', a: mcq(m$(String(k)), [m$(String(n / 2)), m$(String(n * n)), m$(String(2 * n))].concat(n / 2 === k ? [] : [])),
        steps: ['The square root asks: what number times itself gives ' + n + '?', '$' + k + ' \\times ' + k + ' = ' + n + '$, so $\\sqrt{' + n + '} = ' + k + '$.', 'Halving gives ' + n / 2 + ', but $' + n / 2 + ' \\times ' + n / 2 + ' = ' + (n * n / 4) + '$, not ' + n + '.'],
        hint: 'Check each choice by squaring it.', chk: { t: 'mcval', a: 'sqrt(' + n + ')', right: String(k), wrong: [String(n / 2), String(n * n), String(2 * n)] } };
    }
    if (kind === 'rev') return { q: 'The square root of a number is ' + k + '. What is the number?', a: { t: 'num', v: String(n), form: 'int' },
      steps: ['If $\\sqrt{N} = ' + k + '$, then $N = ' + k + ' \\times ' + k + '$.', '$N = ' + n + '$'], hint: 'Undo the square root by squaring.', chk: { t: 'val', a: k + '^2', v: String(n) } };
    if (kind === 'frac') {
      var p = R.int(1, 9), d = R.int(2, 12); while (gcd(p, d) !== 1 || p === d) { p = R.int(1, 9); d = R.int(2, 12); }
      return { q: 'Find $\\sqrt{\\dfrac{' + p * p + '}{' + d * d + '}}$.', a: { t: 'num', v: p + '/' + d, form: 'simplest' },
        steps: ['$\\left(\\frac{' + p + '}{' + d + '}\\right)^{2} = \\frac{' + p * p + '}{' + d * d + '}$', 'So $\\sqrt{\\frac{' + p * p + '}{' + d * d + '}} = \\frac{' + p + '}{' + d + '}$: take the root of the top and of the bottom.'], hint: 'Find the square root of the top and of the bottom separately.', chk: { t: 'val', a: 'sqrt(' + p * p + '/' + d * d + ')', v: p + '/' + d } };
    }
    if (kind === 'dec') {
      var kk = R.int(2, 12), useH = kk % 10 !== 0 && R.coin(); // 0.kk^2 style
      var rt = useH ? Q(kk, 10) : Q(R.int(1, 9), 10); var sq = rt.mul(rt);
      var sS = U.numStr(sq), rS = U.numStr(rt);
      return { q: 'Find $\\sqrt{' + sS + '}$.', a: { t: 'num', v: rS, form: 'dec' },
        steps: ['Try $' + rS + '$: $' + rS + ' \\times ' + rS + ' = ' + sS + '$.', 'So $\\sqrt{' + sS + '} = ' + rS + '$. (Check the decimal places: tenths times tenths make hundredths.)'], hint: 'Think of ' + sS + ' as a fraction of 100, then take the root of the top and the bottom.', chk: { t: 'val', a: 'sqrt(' + sS + ')', v: rS } };
    }
    if (kind === 'neg') return { q: 'Find $-\\sqrt{' + n + '}$.', a: { t: 'num', v: String(-k), form: 'simplest' },
      steps: ['First find $\\sqrt{' + n + '} = ' + k + '$, because $' + k + '^{2} = ' + n + '$.', 'The minus sign in front makes it the opposite: $-\\sqrt{' + n + '} = -' + k + '$.'], hint: 'Take the square root first, then apply the minus sign.', chk: { t: 'val', a: '-sqrt(' + n + ')', v: String(-k) } };
    if (kind === 'sum') {
      var a1 = R.int(2, 12), b1 = R.int(2, 12);
      return { q: 'Find $\\sqrt{' + a1 * a1 + '} + \\sqrt{' + b1 * b1 + '}$.', a: { t: 'num', v: String(a1 + b1), form: 'simplest' },
        steps: ['$\\sqrt{' + a1 * a1 + '} = ' + a1 + '$ and $\\sqrt{' + b1 * b1 + '} = ' + b1 + '$.', 'Add: $' + a1 + ' + ' + b1 + ' = ' + (a1 + b1) + '$.'], hint: 'Find each square root first.', chk: { t: 'val', a: 'sqrt(' + a1 * a1 + ')+sqrt(' + b1 * b1 + ')', v: String(a1 + b1) } };
    }
    // tf: sqrt(a^2 + b^2) vs a + b
    var tr = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
    return { q: 'True or false? $\\sqrt{' + tr[0] * tr[0] + ' + ' + tr[1] * tr[1] + '} = \\sqrt{' + tr[0] * tr[0] + '} + \\sqrt{' + tr[1] * tr[1] + '}$', a: { t: 'tf', v: false },
      steps: ['Left side: $\\sqrt{' + tr[0] * tr[0] + ' + ' + tr[1] * tr[1] + '} = \\sqrt{' + tr[2] * tr[2] + '} = ' + tr[2] + '$.', 'Right side: $' + tr[0] + ' + ' + tr[1] + ' = ' + (tr[0] + tr[1]) + '$.', 'They are different, so the statement is false. A square root of a sum is not the sum of the square roots.'],
      hint: 'Work out each side.', chk: { t: 'tf', a: 'sqrt(' + tr[0] * tr[0] + '+' + tr[1] * tr[1] + ')', b: 'sqrt(' + tr[0] * tr[0] + ')+sqrt(' + tr[1] * tr[1] + ')', v: false } };
  });

  G('g8.cube-roots', function (R, ctx) {
    var kind = R.pick(by(ctx, ['root', 'root', 'vol', 'mc', 'rev'], ['root', 'neg', 'vol', 'mc', 'frac'], ['neg', 'frac', 'dec', 'cmp', 'vol']));
    var k = R.int(2, by(ctx, 10, 12, 12)), n = k * k * k;
    if (R.chance(0.25)) {
      var okC = R.coin(), shownC = okC ? k : R.pick([n / 3, 3 * k, k + 1, k * k].filter(function (z) { return z !== k && z === Math.floor(z); })), whoC = R.pick(['Ava', 'Ben', 'Chen', 'Dara', 'Eli', 'Farah', 'Gus', 'Hana', 'Ivan', 'Jada', 'Kofi', 'Lena', 'Milo', 'Nia', 'Omar', 'Pia']);
      return { q: whoC + ' says $\\sqrt[3]{' + n + '} = ' + shownC + '$. Is that right?', a: { t: 'mc', choices: ['Yes', 'No'], v: okC ? 0 : 1, keep: true },
        steps: ['Check by cubing: $' + shownC + ' \\times ' + shownC + ' \\times ' + shownC + ' = ' + T.commas(shownC * shownC * shownC) + '$.', okC ? 'That is ' + n + ', so yes.' : 'That is not ' + n + '. In fact $' + k + ' \\times ' + k + ' \\times ' + k + ' = ' + n + '$, so $\\sqrt[3]{' + n + '} = ' + k + '$.' + (shownC === n / 3 ? ' (Dividing by 3 is not the same as taking a cube root.)' : '')], hint: 'Cube the answer to check it.', chk: { t: 'val', a: 'cbrt(' + n + ')', v: String(k) } };
    }
    if (kind === 'root') return { q: R.pick(['Find $\\sqrt[3]{' + n + '}$.', 'What number, used as a factor three times, makes ' + n + '? Find $\\sqrt[3]{' + n + '}$.']), a: { t: 'num', v: String(k), form: 'simplest' },
      steps: ['Look for the number that, used as a factor three times, makes ' + n + '.', '$' + k + ' \\times ' + k + ' \\times ' + k + ' = ' + n + '$', 'So $\\sqrt[3]{' + n + '} = ' + k + '$.'], hint: 'Which number cubed is ' + n + '?', chk: { t: 'val', a: n + '^(1/3)', v: String(k) } };
    if (kind === 'vol') {
      var u = R.pick(['cm', 'in', 'ft', 'm']);
      return { q: 'A cube-shaped ' + R.pick(['box', 'block', 'ice cube tray cell', 'storage bin', 'planter', 'gift box']) + ' has a volume of ' + n + ' cubic ' + { cm: 'centimeters', 'in': 'inches', ft: 'feet', m: 'meters' }[u] + '. How long is each edge?', a: { t: 'num', v: String(k), form: 'simplest' },
        steps: ['The volume of a cube is edge × edge × edge.', 'So the edge is the cube root of the volume: $\\sqrt[3]{' + n + '}$.', '$' + k + ' \\times ' + k + ' \\times ' + k + ' = ' + n + '$, so each edge is ' + k + ' ' + { cm: 'centimeters', 'in': 'inches', ft: 'feet', m: 'meters' }[u] + '.'], hint: 'Which number times itself times itself gives ' + n + '?', chk: { t: 'val', a: n + '^(1/3)', v: String(k) } };
    }
    if (kind === 'mc') {
      k = R.int(3, 6); n = k * k * k;
      var w = U.uniq([3 * k, k * k, n % 3 === 0 ? n / 3 : Math.round(n / 2), k + 3, 2 * k * k].filter(function (z) { return z !== k; })).slice(0, 3).map(String);
      return { q: 'What is $\\sqrt[3]{' + n + '}$?', a: mcq(m$(String(k)), w.map(m$)),
        steps: ['The cube root asks: what number times itself times itself gives ' + n + '?', '$' + k + ' \\times ' + k + ' \\times ' + k + ' = ' + n + '$, so $\\sqrt[3]{' + n + '} = ' + k + '$.', 'Dividing by 3 or multiplying by 3 is not the same as taking the cube root.'], hint: 'Cube each choice.', chk: { t: 'mcval', a: n + '^(1/3)', right: String(k), wrong: w } };
    }
    if (kind === 'rev') return { q: 'The cube root of a number is ' + k + '. What is the number?', a: { t: 'num', v: String(n), form: 'int' },
      steps: ['If $\\sqrt[3]{N} = ' + k + '$, then $N = ' + k + ' \\times ' + k + ' \\times ' + k + '$.', '$N = ' + n + '$'], hint: 'Undo the cube root by cubing.', chk: { t: 'val', a: k + '^3', v: String(n) } };
    if (kind === 'neg') return { q: 'Find $\\sqrt[3]{-' + n + '}$.', a: { t: 'num', v: String(-k), form: 'simplest' },
      steps: ['A negative number times itself three times is negative: $(-' + k + ')(-' + k + ')(-' + k + ') = -' + n + '$.', 'So $\\sqrt[3]{-' + n + '} = -' + k + '$. Cube roots of negative numbers exist (square roots of negatives do not).'], hint: 'Try a negative number: is (negative)³ negative?', chk: { t: 'val', a: '-(' + n + '^(1/3))', v: String(-k) } };
    if (kind === 'frac') {
      var p = R.int(1, 5), d = R.int(2, 6); while (gcd(p, d) !== 1 || p === d) { p = R.int(1, 5); d = R.int(2, 6); }
      return { q: 'Find $\\sqrt[3]{\\dfrac{' + p * p * p + '}{' + d * d * d + '}}$.', a: { t: 'num', v: p + '/' + d, form: 'simplest' },
        steps: ['$\\left(\\frac{' + p + '}{' + d + '}\\right)^{3} = \\frac{' + p * p * p + '}{' + d * d * d + '}$', 'So the cube root is $\\frac{' + p + '}{' + d + '}$.'], hint: 'Take the cube root of the top and of the bottom.', chk: { t: 'val', a: '(' + p * p * p + '/' + d * d * d + ')^(1/3)', v: p + '/' + d } };
    }
    if (kind === 'dec') {
      var r = R.int(1, 5), sq = Q(r, 10).pow(3), sS = U.numStr(sq);
      return { q: 'Find $\\sqrt[3]{' + sS + '}$.', a: { t: 'num', v: U.numStr(Q(r, 10)), form: 'dec' },
        steps: ['$' + sS + ' = \\frac{' + r * r * r + '}{1000}$ and $1000 = 10^{3}$.', '$\\sqrt[3]{' + r * r * r + '} = ' + r + '$ and $\\sqrt[3]{1000} = 10$, so the cube root is $\\frac{' + r + '}{10} = ' + U.numStr(Q(r, 10)) + '$.'], hint: 'Write it as a fraction over 1000.', chk: { t: 'val', a: '(' + sS + ')^(1/3)', v: U.numStr(Q(r, 10)) } };
    }
    // cmp: cube root vs square root
    var a1 = R.int(2, 5), b1 = R.int(2, 9), c1 = a1 * a1 * a1, s1 = b1 * b1;
    if (a1 === b1) b1 = a1 + 1, s1 = b1 * b1;
    var bigger = a1 > b1 ? 0 : 1;
    return { q: 'Which is greater: $\\sqrt[3]{' + c1 + '}$ or $\\sqrt{' + s1 + '}$?', a: { t: 'mc', choices: ['$\\sqrt[3]{' + c1 + '}$', '$\\sqrt{' + s1 + '}$'], v: bigger },
      steps: ['$\\sqrt[3]{' + c1 + '} = ' + a1 + '$ because $' + a1 + '^{3} = ' + c1 + '$.', '$\\sqrt{' + s1 + '} = ' + b1 + '$ because $' + b1 + '^{2} = ' + s1 + '$.', (bigger ? '$\\sqrt{' + s1 + '}$' : '$\\sqrt[3]{' + c1 + '}$') + ' is greater.'],
      hint: 'Find both roots first.', chk: { t: 'cmp', x: c1 + '^(1/3)', y: 'sqrt(' + s1 + ')', big: bigger } };
  });

  G('g8.solve-squares-cubes', function (R, ctx) {
    var kind = R.pick(by(ctx, ['sq', 'sq', 'cube', 'sq', 'cube'], ['sq', 'irr', 'none', 'coef', 'cube', 'shift'], ['frac', 'coef', 'cube2', 'shift', 'irr', 'none', 'zero']));
    var v = R.pick(['x', 'x', 'y', 'n', 'm', 't', 'a', 'k', 'p', 'w']), k = R.int(2, by(ctx, 15, 15, 15)), sol, eq, steps, set;
    if (kind === 'sq') {
      eq = pw(v, 2) + ' = ' + k * k; set = [String(k), String(-k)];
      steps = ['Both $' + k + '^{2} = ' + k * k + '$ and $(-' + k + ')^{2} = ' + k * k + '$ (a negative times a negative is positive).', 'So there are two solutions: $' + v + ' = ' + k + '$ or $' + v + ' = -' + k + '$, written $' + v + ' = \\pm ' + k + '$.'];
      return { q: 'Solve: $' + eq + '$. Give every solution.', a: { t: 'set', v: set }, steps: steps, hint: 'Is there a negative number that also works?', chk: { t: 'set', eq: 'x^2=' + k * k, sols: set, count: 2 } };
    }
    if (kind === 'irr') {
      var n = squarefree(R, 2, by(ctx, 30, 50, 80));
      set = ['sqrt(' + n + ')', '-sqrt(' + n + ')'];
      return { q: 'Solve: $' + pw(v, 2) + ' = ' + n + '$. Give every solution (use $\\sqrt{\\ }$ if needed).', a: { t: 'set', v: set },
        steps: ['$' + n + '$ is not a perfect square, so the solutions are square roots we leave as they are.', 'The positive solution is $\\sqrt{' + n + '}$; its opposite works too, because $(-\\sqrt{' + n + '})^{2} = ' + n + '$.', '$' + v + ' = \\pm\\sqrt{' + n + '}$'], hint: 'Take the square root of both sides, and don’t forget the negative one.', chk: { t: 'set', eq: 'x^2=' + n, sols: set, count: 2 } };
    }
    if (kind === 'none') {
      var nn = R.int(1, 49);
      return { q: 'Solve: $' + pw(v, 2) + ' = -' + nn + '$. Give every solution, or say there is no solution.', a: { t: 'set', v: [] },
        steps: ['Any number squared is 0 or positive: a positive times a positive is positive, and a negative times a negative is positive too.', 'So no number squared can equal $-' + nn + '$.', 'There is no solution.'], hint: 'Can a square ever be negative?', chk: { t: 'ok' } };
    }
    if (kind === 'zero') return { q: 'Solve: $' + pw(v, 2) + ' = 0$. Give every solution.', a: { t: 'set', v: ['0'] },
      steps: ['$0 \\times 0 = 0$, and any other number squared is positive.', 'So the only solution is $' + v + ' = 0$.'], hint: 'Which number times itself is 0?', chk: { t: 'set', eq: 'x^2=0', sols: ['0'] } };
    if (kind === 'coef') {
      var a = R.int(2, 5); eq = a + pw(v, 2) + ' = ' + a * k * k; set = [String(k), String(-k)];
      return { q: 'Solve: $' + eq + '$. Give every solution.', a: { t: 'set', v: set },
        steps: ['Divide both sides by ' + a + ': $' + pw(v, 2) + ' = ' + k * k + '$.', 'Take square roots: $' + v + ' = \\pm ' + k + '$.'], hint: 'Get the square by itself first.', chk: { t: 'set', eq: a + '*x^2=' + a * k * k, sols: set, count: 2 } };
    }
    if (kind === 'shift') {
      var c = R.nz(-20, 30), rhs = k * k + c;
      eq = pw(v, 2) + T.signed(c) + ' = ' + rhs; set = [String(k), String(-k)];
      return { q: 'Solve: $' + eq + '$. Give every solution.', a: { t: 'set', v: set },
        steps: [(c > 0 ? 'Subtract ' + c : 'Add ' + (-c)) + ' on both sides: $' + pw(v, 2) + ' = ' + k * k + '$.', 'Take square roots: $' + v + ' = \\pm ' + k + '$.'], hint: 'Undo the ' + (c > 0 ? 'addition' : 'subtraction') + ' first, then take the square root.', chk: { t: 'set', eq: 'x^2' + (c > 0 ? '+' : '') + c + '=' + rhs, sols: set, count: 2 } };
    }
    if (kind === 'frac') {
      var p = R.int(1, 9), d = R.int(2, 12); while (gcd(p, d) !== 1 || p === d) { p = R.int(1, 9); d = R.int(2, 12); }
      set = [p + '/' + d, '-' + p + '/' + d];
      return { q: 'Solve: $' + pw(v, 2) + ' = \\dfrac{' + p * p + '}{' + d * d + '}$. Give every solution.', a: { t: 'set', v: set },
        steps: ['$\\left(\\frac{' + p + '}{' + d + '}\\right)^{2} = \\frac{' + p * p + '}{' + d * d + '}$, and the negative works too.', '$' + v + ' = \\pm\\frac{' + p + '}{' + d + '}$'], hint: 'Take the square root of the top and of the bottom.', chk: { t: 'set', eq: 'x^2=' + p * p + '/' + d * d, sols: set, count: 2 } };
    }
    // cubes
    k = R.int(2, by(ctx, 5, 6, 6)); var neg = kind === 'cube2' ? R.coin() : R.coin(), cube = k * k * k * (neg ? -1 : 1), s = neg ? -k : k;
    if (kind === 'cube2') {
      var a2 = R.int(2, 4); eq = a2 + pw(v, 3) + ' = ' + a2 * cube;
      return { q: 'Solve: $' + eq + '$. Give every solution.', a: { t: 'set', v: [String(s)] },
        steps: ['Divide by ' + a2 + ': $' + pw(v, 3) + ' = ' + cube + '$.', '$(' + s + ')^{3} = ' + cube + '$, so $' + v + ' = ' + s + '$.', 'A cube has only one real solution: ' + (neg ? 'a positive number cubed is positive, so it must be negative.' : 'a negative number cubed is negative, so only the positive one works.')], hint: 'Divide first, then take the cube root.', chk: { t: 'set', eq: a2 + '*x^3=' + a2 * cube, sols: [String(s)], count: 1 } };
    }
    eq = pw(v, 3) + ' = ' + cube;
    return { q: 'Solve: $' + eq + '$. Give every solution.', a: { t: 'set', v: [String(s)] },
      steps: ['$(' + s + ')^{3} = ' + rep(T.p(s), 3, ' \\cdot ') + ' = ' + cube + '$.', (neg ? 'A positive number cubed is positive, so $' + k + '$ does not work.' : 'A negative number cubed is negative, so $-' + k + '$ does not work.'), 'There is exactly one solution: $' + v + ' = ' + s + '$.'],
      hint: 'Which number cubed gives ' + cube + '? Is there more than one?', chk: { t: 'set', eq: 'x^3=' + cube, sols: [String(s)], count: 1 } };
  });

  G('g8.repeating-decimals', function (R, ctx) {
    var kind = R.pick(by(ctx, ['one', 'one', 'two', 'two', 'nines', 'pick', 'pick'], ['two', 'delay', 'whole', 'mult', 'two', 'nines'], ['delay', 'three', 'whole', 'two', 'delay']));
    if (kind === 'pick') {
      var two = R.coin(), dg = two ? R.intNot(10, 98, [33, 66]) : R.int(1, 8), den = two ? 99 : 9, fp = Q(dg, den), ds0 = two ? (dg < 10 ? '0' + dg : String(dg)) : String(dg);
      var right = '$0.\\overline{' + ds0 + '}$', wrongs = ['$0.' + ds0 + '$', '$0.0\\overline{' + ds0 + '}$', '$' + ds0.charAt(0) + '.\\overline{' + (ds0.charAt(1) || '9') + '}$'];
      return { q: 'Which decimal is equal to $\\frac{' + fp.num() + '}{' + fp.den() + '}$' + (fp.den() !== den ? ' (which is $\\frac{' + dg + '}{' + den + '}$)' : '') + '?', a: mcq(right, wrongs),
        steps: ['A fraction with denominator ' + den + ' repeats its ' + (two ? 'two-digit' : 'one-digit') + ' numerator forever: $\\frac{1}{' + den + '} = 0.\\overline{' + (two ? '01' : '1') + '}$.', 'So $\\frac{' + dg + '}{' + den + '} = ' + dg + ' \\times 0.\\overline{' + (two ? '01' : '1') + '} = 0.\\overline{' + ds0 + '}$.', 'Check: $0.' + ds0 + '$ stops, so it is only $\\frac{' + dg + '}{' + (two ? 100 : 10) + '}$, not the same.'], hint: 'Divide the numerator by the denominator, or think of 1/' + den + '.', chk: { t: 'mc' } };
    }
    if (kind === 'one') {
      var d = R.int(1, 8), f = Q(d, 9);
      return { q: 'Write $0.\\overline{' + d + '} = 0.' + rep(String(d), 4, '') + '\\ldots$ as a fraction in lowest terms.', a: { t: 'num', v: f.toPlain(), form: 'frac' },
        steps: ['Let $x = 0.\\overline{' + d + '}$.', 'One digit repeats, so multiply by 10: $10x = ' + d + '.\\overline{' + d + '}$.', 'Subtract: $10x - x = ' + d + '.\\overline{' + d + '} - 0.\\overline{' + d + '} = ' + d + '$, so $9x = ' + d + '$.', '$x = \\frac{' + d + '}{9}' + (f.den() !== 9 ? ' = ' + f.toTex() : '') + '$'],
        hint: 'Call it x and multiply by 10 so the repeating tails line up.', chk: { t: 'val', a: d + '/9', v: f.toPlain() } };
    }
    if (kind === 'two' || kind === 'mult') {
      var a = R.int(0, 9), b = R.int(1, 9); while (a === b) b = R.int(1, 9);
      var ab = 10 * a + b, f2 = Q(ab, 99), blk = String(a) + String(b);
      if (kind === 'mult') return { q: 'To write $0.\\overline{' + blk + '}$ as a fraction, you set $x = 0.\\overline{' + blk + '}$ and multiply both sides by a power of 10 so the repeating parts line up. Which number should you multiply by?', a: { t: 'num', v: '100', form: 'int' },
        steps: ['The repeating block "' + blk + '" has 2 digits.', 'Multiplying by $100$ shifts the digits two places: $100x = ' + ab + '.\\overline{' + blk + '}$, whose tail matches $x$.', 'So multiply by 100. Then $100x - x = ' + ab + '$, and $x = \\frac{' + ab + '}{99}$.'], hint: 'How many digits are in the repeating block?', chk: { t: 'val', a: '100', v: '100' } };
      return { q: 'Write $0.\\overline{' + blk + '} = 0.' + rep(blk, 3, '') + '\\ldots$ as a fraction in lowest terms.', a: { t: 'num', v: f2.toPlain(), form: 'frac' },
        steps: ['Let $x = 0.\\overline{' + blk + '}$.', 'Two digits repeat, so multiply by 100: $100x = ' + ab + '.\\overline{' + blk + '}$.', 'Subtract: $100x - x = ' + ab + '$, so $99x = ' + ab + '$.', '$x = \\frac{' + ab + '}{99}' + (f2.den() !== 99 ? ' = ' + f2.toTex() : '') + '$'],
        hint: 'Two digits repeat. Multiply by 100 and subtract.', chk: { t: 'val', a: ab + '/99', v: f2.toPlain() } };
    }
    if (kind === 'three') {
      var dg = [R.int(0, 9), R.int(0, 9), R.int(1, 9)]; while (dg[0] === dg[1] && dg[1] === dg[2]) dg[2] = R.int(1, 9);
      var abc = dg[0] * 100 + dg[1] * 10 + dg[2], f3 = Q(abc, 999), bl = dg.join('');
      return { q: 'Write $0.\\overline{' + bl + '}$ as a fraction in lowest terms.', a: { t: 'num', v: f3.toPlain(), form: 'frac' },
        steps: ['Let $x = 0.\\overline{' + bl + '}$. Three digits repeat, so multiply by 1000: $1000x = ' + abc + '.\\overline{' + bl + '}$.', 'Subtract: $999x = ' + abc + '$.', '$x = \\frac{' + abc + '}{999}' + (f3.den() !== 999 ? ' = ' + f3.toTex() : '') + '$'],
        hint: 'Three digits repeat: multiply by 1000.', chk: { t: 'val', a: abc + '/999', v: f3.toPlain() } };
    }
    if (kind === 'delay') {
      var a4 = R.int(1, 9), b4 = R.int(1, 8); while (b4 === a4) b4 = R.int(1, 8);
      var num = 10 * a4 + b4 - a4, f4 = Q(num, 90);
      return { q: 'Write $0.' + a4 + '\\overline{' + b4 + '} = 0.' + a4 + rep(String(b4), 4, '') + '\\ldots$ as a fraction in lowest terms.', a: { t: 'num', v: f4.toPlain(), form: 'frac' },
        steps: ['Let $x = 0.' + a4 + '\\overline{' + b4 + '}$. Only the ' + b4 + ' repeats.', '$10x = ' + a4 + '.\\overline{' + b4 + '}$ and $100x = ' + (10 * a4 + b4) + '.\\overline{' + b4 + '}$: both tails are $.\\overline{' + b4 + '}$.', 'Subtract: $100x - 10x = ' + (10 * a4 + b4) + ' - ' + a4 + '$, so $90x = ' + num + '$.', '$x = \\frac{' + num + '}{90}' + (f4.den() !== 90 ? ' = ' + f4.toTex() : '') + '$'],
        hint: 'Find two multiples of x (by 10 and by 100) whose repeating tails are the same.', chk: { t: 'val', a: num + '/90', v: f4.toPlain() } };
    }
    if (kind === 'whole') {
      var w = R.int(1, 4), two = ctx.level > 2 || R.coin(), dd, frac0, blk2;
      if (two) { var p1 = R.int(0, 9), p2 = R.int(1, 9); while (p1 === p2) p2 = R.int(1, 9); dd = 10 * p1 + p2; frac0 = Q(dd, 99); blk2 = '' + p1 + p2; }
      else { dd = R.int(1, 8); frac0 = Q(dd, 9); blk2 = String(dd); }
      var tot = frac0.add(w);
      return { q: 'Write $' + w + '.\\overline{' + blk2 + '}$ as a fraction in lowest terms.', a: { t: 'num', v: tot.toPlain(), form: 'frac' },
        steps: ['Split it: $' + w + '.\\overline{' + blk2 + '} = ' + w + ' + 0.\\overline{' + blk2 + '}$.', '$0.\\overline{' + blk2 + '} = \\frac{' + dd + '}{' + (two ? 99 : 9) + '}' + (frac0.den() !== (two ? 99 : 9) ? ' = ' + frac0.toTex() : '') + '$ (multiply by ' + (two ? 100 : 10) + ' and subtract).', 'Add: $' + w + ' + ' + frac0.toTex() + ' = ' + tot.toTex() + '$'],
        hint: 'Handle the whole number and the repeating part separately.', chk: { t: 'val', a: w + '+' + dd + '/' + (two ? 99 : 9), v: tot.toPlain() } };
    }
    // nines
    var form = R.int(0, 2);
    var stmt = [['0.\\overline{9} = 1', true], ['0.\\overline{9} < 1', false], ['0.\\overline{9}', null]][form];
    if (form === 2) return { q: 'Write $0.\\overline{9} = 0.9999\\ldots$ as a whole number.', a: { t: 'num', v: '1', form: 'int' },
      steps: ['Let $x = 0.\\overline{9}$. Then $10x = 9.\\overline{9}$.', 'Subtract: $10x - x = 9$, so $9x = 9$ and $x = 1$.', 'Another way: $\\frac{1}{3} = 0.\\overline{3}$, and three times that is $1 = 0.\\overline{9}$.'], hint: 'Use the same trick as always: multiply by 10 and subtract.', chk: { t: 'ok' } };
    return { q: 'True or false? $' + stmt[0] + '$', a: { t: 'tf', v: stmt[1] },
      steps: ['Let $x = 0.\\overline{9}$. Then $10x = 9.\\overline{9}$, and $10x - x = 9$, so $9x = 9$ and $x = 1$.', 'There is no number between $0.\\overline{9}$ and 1, because the 9s never stop. They are two names for the same number.', 'So the statement is ' + (stmt[1] ? 'true' : 'false') + '.'], hint: 'Try the multiply-and-subtract method on 0.999…', chk: { t: 'ok' } };
  });

  G('g8.irrational-numbers', function (R, ctx) {
    var kind = R.pick(by(ctx, ['one', 'one', 'tf', 'all'], ['one', 'all', 'tf', 'all', 'between'], ['all', 'tf', 'between', 'one']));
    var sq = R.int(2, 15), ns = nonSquare(R, 2, 99);
    var pool = [
      ['\\sqrt{' + sq * sq + '}', false, '$\\sqrt{' + sq * sq + '} = ' + sq + '$, a whole number.'],
      ['\\sqrt{' + ns + '}', true, ns + ' is not a perfect square, so $\\sqrt{' + ns + '}$ is irrational.'],
      ['\\pi', true, '$\\pi$ is irrational; 3.14 and $\\frac{22}{7}$ are only close to it.'],
      ['\\frac{22}{7}', false, '$\\frac{22}{7}$ is a fraction of whole numbers, so it is rational (it is close to $\\pi$ but not equal).'],
      ['0.\\overline{' + R.int(1, 8) + '}', false, 'A repeating decimal can be written as a fraction, so it is rational.'],
      ['-' + R.int(2, 40), false, 'Every integer is rational: it is itself over 1.'],
      ['3.14', false, '3.14 = $\\frac{314}{100}$, a fraction.'],
      ['0.1010010001\\ldots', true, 'The pattern of 1s with more and more 0s never ends and never repeats.'],
      ['\\sqrt{\\frac{' + sq * sq + '}{' + (sq + 1) * (sq + 1) + '}}', false, 'It equals $\\frac{' + sq + '}{' + (sq + 1) + '}$, a fraction.'],
      ['\\sqrt{0.' + R.pick(['25', '36', '49', '64', '81', '16', '09', '04']) + '}', false, 'It is a decimal times itself: for example $\\sqrt{0.25} = 0.5$.'],
      ['2\\pi', true, 'A nonzero rational number times $\\pi$ is still irrational.']
    ];
    if (kind === 'one') {
      var it = R.pick(pool.slice(0, 8));
      return { q: 'Is $' + it[0] + '$ rational or irrational?', a: { t: 'mc', choices: ['rational', 'irrational'], v: it[1] ? 1 : 0, keep: true },
        steps: ['A rational number can be written as a fraction of integers; its decimal ends or repeats.', it[2], 'So it is ' + (it[1] ? 'irrational' : 'rational') + '.'], hint: 'Can you write it as a fraction of two whole numbers?', chk: { t: 'ok' } };
    }
    if (kind === 'all') {
      var pick = R.sample(pool, 5);
      if (!pick.some(function (z) { return z[1]; })) pick[0] = pool[1];
      if (pick.every(function (z) { return z[1]; })) pick[1] = pool[0] === pick[0] ? pool[3] : pool[0];
      var choices = pick.map(function (z) { return m$(z[0]); }), vv = [];
      pick.forEach(function (z, i) { if (z[1]) vv.push(i); });
      if (U.uniq(choices).length !== choices.length) { pick = [pool[0], pool[1], pool[2], pool[3], pool[5]]; choices = pick.map(function (z) { return m$(z[0]); }); vv = [1, 2]; }
      return { q: 'Select all the irrational numbers.', a: { t: 'mc', choices: choices, v: vv },
        steps: pick.map(function (z) { return '$' + z[0] + '$: ' + (z[1] ? 'irrational. ' : 'rational. ') + z[2]; }), hint: 'Rational means it can be written as a fraction. Check each one.', chk: { t: 'ok' } };
    }
    if (kind === 'between') {
      var a = nonSquare(R, 2, 60), b = a + R.int(3, 8); while (U.isSquare(b)) b++;
      var lo = Math.sqrt(a), hi = Math.sqrt(b), cand = Q(Math.floor(lo * 10) + 1, 10);
      var c = a + 1; while (U.isSquare(c)) c++;
      var good = U.numStr(cand), wrong1 = U.numStr(Q(Math.floor(lo * 10) - 2, 10)), wrong2 = U.numStr(Q(Math.ceil(hi * 10) + 2, 10)), mid = '\\sqrt{' + c + '}';
      return { q: 'Which number is <b>rational</b> and between $\\sqrt{' + a + '}$ and $\\sqrt{' + b + '}$?', a: mcq(m$(good), [m$(wrong1), m$(wrong2), m$(mid)]),
        steps: ['$\\sqrt{' + a + '} \\approx ' + U.numStr(U.round(lo, 3)) + '$ and $\\sqrt{' + b + '} \\approx ' + U.numStr(U.round(hi, 3)) + '$.', '$' + good + '$ is a terminating decimal (a fraction), and it lies between them.', '$' + mid + '$ is between them too, but ' + c + ' is not a perfect square, so it is irrational. The other two are outside the range.'],
        hint: 'Estimate both square roots to one decimal place.', chk: { t: 'between', lo: 'sqrt(' + a + ')', hi: 'sqrt(' + b + ')', x: good, out: [wrong1, wrong2] } };
    }
    var stmts = [
      ['$\\pi = \\frac{22}{7}$', false, '$\\frac{22}{7} = 3.142857\\ldots$ but $\\pi = 3.141592\\ldots$. They are close, not equal; $\\pi$ is irrational.'],
      ['$\\pi = 3.14$', false, '3.14 is a rounded value. The digits of $\\pi$ go on forever without repeating.'],
      ['The square root of every whole number is irrational.', false, 'Perfect squares have whole-number roots: $\\sqrt{' + sq * sq + '} = ' + sq + '$.'],
      ['The decimal form of an irrational number never ends and never repeats.', true, 'That is exactly what makes it irrational: if it ended or repeated, it could be written as a fraction.'],
      ['Every repeating decimal is a rational number.', true, 'Multiply and subtract to write it as a fraction.'],
      ['$\\sqrt{' + ns + '}$ is irrational.', true, ns + ' is not a perfect square, so its square root is not a fraction.'],
      ['$\\sqrt{2} \\cdot \\sqrt{2}$ is irrational.', false, '$\\sqrt{2} \\cdot \\sqrt{2} = 2$, which is rational.'],
      ['Some numbers are neither rational nor irrational.', false, 'Every real number is one or the other: its decimal either ends or repeats (rational) or does neither (irrational).']
    ];
    var s = R.pick(stmts);
    return { q: 'True or false? ' + s[0], a: { t: 'tf', v: s[1] }, steps: [s[2], 'So the statement is ' + (s[1] ? 'true' : 'false') + '.'], hint: 'Think about whether the number can be written as a fraction.', chk: { t: 'ok' } };
  });

  G('g8.estimate-irrationals', function (R, ctx) {
    var kind = R.pick(by(ctx, ['between', 'between', 'nearest', 'mc'], ['between', 'nearest', 'tenth', 'mc', 'cmp', 'line'], ['tenth', 'cmp', 'line', 'nearest', 'mc']));
    var n = nonSquare(R, 3, by(ctx, 99, 150, 200)), k = isqrt(n);
    if (kind === 'between') return { q: '$\\sqrt{' + n + '}$ is between which two consecutive whole numbers?', a: { t: 'multi', parts: [{ label: 'smaller:', a: { t: 'num', v: String(k), form: 'int' } }, { label: 'larger:', a: { t: 'num', v: String(k + 1), form: 'int' } }] },
      steps: ['Find the perfect squares on each side of ' + n + ': $' + k + '^{2} = ' + k * k + '$ and $' + (k + 1) + '^{2} = ' + (k + 1) * (k + 1) + '$.', 'Since $' + k * k + ' < ' + n + ' < ' + (k + 1) * (k + 1) + '$, we get $' + k + ' < \\sqrt{' + n + '} < ' + (k + 1) + '$.'],
      hint: 'Which perfect squares are just below and just above ' + n + '?', chk: { t: 'multi', vs: [String(Math.floor(Math.sqrt(n))), String(Math.floor(Math.sqrt(n)) + 1)] } };
    if (kind === 'nearest') {
      var near = n <= k * k + k ? k : k + 1;
      return { q: 'What is $\\sqrt{' + n + '}$ to the nearest whole number?', a: { t: 'num', v: String(near), form: 'int' },
        steps: ['$' + k + '^{2} = ' + k * k + '$ and $' + (k + 1) + '^{2} = ' + (k + 1) * (k + 1) + '$, so $\\sqrt{' + n + '}$ is between ' + k + ' and ' + (k + 1) + '.', 'Halfway is ' + k + '.5, and $' + k + '.5^{2} = ' + U.numStr(U.fix((k + 0.5) * (k + 0.5))) + '$.', n < (k + 0.5) * (k + 0.5) ? n + ' is less than that, so $\\sqrt{' + n + '}$ is closer to ' + k + '.' : n + ' is more than that, so $\\sqrt{' + n + '}$ is closer to ' + (k + 1) + '.'],
        hint: 'Find the perfect squares around ' + n + ', then compare ' + n + ' with $' + k + '.5^{2}$.', chk: { t: 'num', v: String(Math.round(Math.sqrt(n))), why: 'Math.round(sqrt)' } };
    }
    if (kind === 'tenth') {
      var t = sqrtTenth(n), ts = U.numStr(t), lo = t.sub(Q(1, 10)), hi = t.add(Q(1, 10));
      return { q: 'Estimate $\\sqrt{' + n + '}$ to the nearest tenth, without a calculator.', a: { t: 'num', v: ts, dp: 1 },
        steps: ['$' + k + '^{2} = ' + k * k + '$ and $' + (k + 1) + '^{2} = ' + (k + 1) * (k + 1) + '$, so the root is ' + k + '.something.', 'Square some tenths: $' + lo.toDec(1) + '^{2} = ' + U.numStr(lo.mul(lo)) + '$, $' + ts + '^{2} = ' + U.numStr(t.mul(t)) + '$, $' + hi.toDec(1) + '^{2} = ' + U.numStr(hi.mul(hi)) + '$.', n + ' is closest to $' + ts + '^{2}$' + ', so $\\sqrt{' + n + '} \\approx ' + ts + '$.'],
        hint: 'Start from the nearest perfect squares, then try tenths and square them.', chk: { t: 'num', v: String(Math.round(Math.sqrt(n) * 10) / 10), why: 'Math.round(10 sqrt)', tol: 1e-9 } };
    }
    if (kind === 'mc') {
      var t2 = sqrtTenth(n);
      var wr = [U.numStr(U.fix(n / 2)), U.numStr(U.fix(k - 0.5)), U.numStr(U.fix(k + 1.4))].filter(function (z) { return z !== U.numStr(t2); });
      return { q: 'Which is the best estimate of $\\sqrt{' + n + '}$?', a: mcq(m$(U.numStr(t2)), wr.map(m$)),
        steps: ['$' + k + '^{2} = ' + k * k + '$ and $' + (k + 1) + '^{2} = ' + (k + 1) * (k + 1) + '$, so $\\sqrt{' + n + '}$ is between ' + k + ' and ' + (k + 1) + '.', 'Only $' + U.numStr(t2) + '$ is in that range.', 'Halving (' + U.numStr(U.fix(n / 2)) + ') is a common slip: a square root is the number that times itself gives ' + n + '.'],
        hint: 'Find the two perfect squares around ' + n + ' first.', chk: { t: 'nearest', x: 'sqrt(' + n + ')', spots: [U.numStr(t2)].concat(wr), best: 0 } };
    }
    if (kind === 'cmp') {
      var vs;
      if (R.coin()) { n = R.pick([7, 8, 10, 11, 12, 13]); vs = ['\\pi', Math.PI, 'pi']; }
      else { while (Math.abs(Math.sqrt(n) - (k + 0.5)) < 0.03) { n = nonSquare(R, 3, 150); k = isqrt(n); } vs = R.coin() ? [k + '.5', k + 0.5, String(k + 0.5)] : ['\\frac{' + (2 * k + 1) + '}{2}', k + 0.5, (2 * k + 1) + '/2']; }
      var big = Math.sqrt(n) > vs[1] ? 0 : 1;
      return { q: 'Which is greater: $\\sqrt{' + n + '}$ or $' + vs[0] + '$?', a: { t: 'mc', choices: ['$\\sqrt{' + n + '}$', '$' + vs[0] + '$'], v: big },
        steps: [vs[0] === '\\pi' ? '$\\pi \\approx 3.14$, and $3.14^{2} \\approx 9.86$.' : 'Square the other number: $(' + vs[0] + ')^{2} = ' + U.numStr(U.fix(vs[1] * vs[1])) + '$.', 'Compare with $(\\sqrt{' + n + '})^{2} = ' + n + '$, which is ' + (big === 0 ? 'greater.' : 'less.'), 'For positive numbers, the one with the bigger square is bigger, so $' + (big === 0 ? '\\sqrt{' + n + '}' : vs[0]) + '$ is greater.'],
        hint: 'Compare their squares.', chk: { t: 'cmp', x: 'sqrt(' + n + ')', y: vs[2], big: big } };
    }
    // line: which letter marks the root on a number line?
    var spots, rt, dist, best;
    for (var tries = 0; tries < 40; tries++) {
      spots = [k - 0.5, k + 0.2, k + 0.5, k + 0.8]; rt = Math.sqrt(n);
      dist = spots.map(function (z) { return Math.abs(z - rt); }); best = dist.indexOf(Math.min.apply(null, dist));
      var second = dist.slice().sort(function (a, b) { return a - b; })[1];
      if (second - dist[best] >= 0.06) break;
      n = nonSquare(R, 3, by(ctx, 99, 150, 200)); k = isqrt(n);
    }
    var labs = ['A', 'B', 'C', 'D'];
    return { q: 'Which point on the number line is closest to $\\sqrt{' + n + '}$?', a: { t: 'mc', choices: labs.slice(), v: best, keep: true },
      viz: { name: 'numberline', opts: { min: k - 1, max: k + 2, step: 1, sub: 10, labels: 'whole', controls: false, value: false, label: 'A number line with points A, B, C and D', points: spots.map(function (s, i) { return { v: U.numStr(U.fix(s)), label: labs[i], color: ['red', 'blue', 'green', 'purple'][i], drag: false }; }) } },
      steps: ['$' + k + '^{2} = ' + k * k + '$ and $' + (k + 1) + '^{2} = ' + (k + 1) * (k + 1) + '$, so $\\sqrt{' + n + '}$ is between ' + k + ' and ' + (k + 1) + '.', 'Try tenths: $\\sqrt{' + n + '} \\approx ' + U.numStr(sqrtTenth(n)) + '$, because $' + U.numStr(sqrtTenth(n)) + '^{2} = ' + U.numStr(sqrtTenth(n).mul(sqrtTenth(n))) + '$ is close to ' + n + '.', 'Point ' + labs[best] + ' (at ' + U.numStr(U.fix(spots[best])) + ') is closest.'],
      hint: 'Between which two whole numbers is it, and which one is it nearer?', chk: { t: 'nearest', x: 'sqrt(' + n + ')', spots: spots.map(function (z) { return String(U.fix(z)); }), best: best } };
  });


  // ================================================================ Unit 3: linear equations
  function par(a, inner) { return (a === 1 ? '' : a === -1 ? '-' : String(a)) + '(' + inner + ')'; }       // TeX a(inner)
  function parP(a, inner) { return '(' + a + ')*(' + inner + ')'; }                                       // plain
  function linP(a, b) { return '(' + a + ')*x+(' + b + ')'; }
  function solveSteps(v, A, B, C) { // A v + B = C  ->  steps (A != 0)
    var st = [];
    if (B !== 0) st.push((B > 0 ? 'Subtract ' + B + ' from' : 'Add ' + (-B) + ' to') + ' both sides: $' + T.mono(A, v) + ' = ' + (C - B) + '$.');
    if (A !== 1) st.push('Divide both sides by $' + A + '$: $' + v + ' = ' + T.num(Q(C - B, A)) + '$.');
    return st;
  }
  var EVAR = ['x', 'x', 'x', 'n', 'y', 'a', 'm', 'p', 'k', 't'];

  G('g8.multi-step-equations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['dist', 'combine', 'dist', 'combine'], ['dist', 'negdist', 'combine', 'mixed', 'mc'], ['negdist', 'mixed', 'frac', 'sub', 'mc', 'dec']));
    var v = R.pick(EVAR), x = R.intNot(-10, 10, 0), a, b, c, d, e, A, B, st, eq, eqP;
    if (kind === 'dist') {
      a = R.int(2, 9); b = R.nz(-9, 9); c = R.nz(-15, 15); d = a * (x + b) + c;
      eq = par(a, T.lin(1, v, b)) + T.signed(c) + ' = ' + d; eqP = parP(a, 'x+(' + b + ')') + '+(' + c + ')=' + d;
      A = a; B = a * b + c;
      st = ['Distribute the ' + a + ': $' + T.lin(a, v, a * b) + T.signed(c) + ' = ' + d + '$.', 'Combine the numbers on the left: $' + T.lin(A, v, B) + ' = ' + d + '$.'].concat(solveSteps(v, A, B, d));
    } else if (kind === 'negdist') {
      a = -R.int(2, 6); b = R.nz(-8, 8); c = R.intNot(-6, 9, [0, -a]); d = a * (x + b) + c * x;
      eq = par(a, T.lin(1, v, b)) + T.coef(c, v, false) + ' = ' + d; eqP = parP(a, 'x+(' + b + ')') + '+(' + c + ')*x=' + d;
      A = a + c; B = a * b;
      if (A === 0) { c = c + 1; if (c === 0 || a + c === 0) c = c + 1; d = a * (x + b) + c * x; A = a + c; eq = par(a, T.lin(1, v, b)) + T.coef(c, v, false) + ' = ' + d; eqP = parP(a, 'x+(' + b + ')') + '+(' + c + ')*x=' + d; }
      st = ['Distribute $' + a + '$ to both terms inside: $' + a + ' \\cdot ' + v + ' = ' + T.mono(a, v) + '$ and $' + a + ' \\cdot ' + T.p(b) + ' = ' + a * b + '$.', 'So the left side is $' + T.lin(a, v, a * b) + T.coef(c, v, false) + '$.', 'Combine like terms: $' + T.lin(A, v, B) + ' = ' + d + '$.'].concat(solveSteps(v, A, B, d));
    } else if (kind === 'combine') {
      a = R.int(2, 9); c = R.intNot(-6, 9, [0, -a]); b = R.nz(-20, 20); A = a + c; d = A * x + b;
      eq = T.lin(a, v, b) + T.coef(c, v, false) + ' = ' + d; eqP = linP(a, b) + '+(' + c + ')*x=' + d; B = b;
      st = ['Combine the like terms $' + T.mono(a, v) + '$ and $' + T.mono(c, v) + '$: $' + T.lin(A, v, b) + ' = ' + d + '$.'].concat(solveSteps(v, A, b, d));
    } else if (kind === 'mixed') {
      a = R.int(2, 6); b = R.nz(-6, 6); c = R.int(2, 5); e = R.nz(-6, 6); if (a === c) a++;
      var sign = R.coin() ? 1 : -1; // a(x+b) + sign*c(x+e)
      A = a + sign * c; B = a * b + sign * c * e; d = A * x + B;
      eq = par(a, T.lin(1, v, b)) + (sign > 0 ? ' + ' : ' - ') + par(c, T.lin(1, v, e)) + ' = ' + d; eqP = parP(a, 'x+(' + b + ')') + '+(' + sign * c + ')*(x+(' + e + '))=' + d;
      st = ['Distribute both: $' + T.lin(a, v, a * b) + (sign > 0 ? ' + ' + T.lin(c, v, c * e) : ' - ' + T.mono(c, v) + T.signed(-c * e)) + ' = ' + d + '$' + (sign < 0 ? ' (the minus sign goes to both terms in the second parentheses)' : '') + '.', 'Combine like terms: $' + T.lin(A, v, B) + ' = ' + d + '$.'].concat(solveSteps(v, A, B, d));
    } else if (kind === 'sub') {
      c = R.int(5, 20); b = R.nz(-6, 9); // c - (x + b) = d  -> -x + (c - b) = d
      d = c - (x + b); A = -1; B = c - b;
      eq = c + ' - (' + T.lin(1, v, b) + ') = ' + d; eqP = c + '-(x+(' + b + '))=' + d;
      st = ['Subtract all of the parentheses: $' + c + ' - ' + v + T.signed(-b) + ' = ' + d + '$.', 'Combine the numbers: $' + T.lin(-1, v, B) + ' = ' + d + '$.'].concat(solveSteps(v, A, B, d));
    } else if (kind === 'frac') {
      var dd = R.int(2, 5), k = R.nz(-6, 6); b = R.nz(-9, 9); x = dd * k - b; c = R.nz(-8, 8); d = k + c; // (x + b)/dd + c = d
      eq = '\\dfrac{' + T.lin(1, v, b) + '}{' + dd + '}' + T.signed(c) + ' = ' + d; eqP = '(x+(' + b + '))/' + dd + '+(' + c + ')=' + d;
      st = [(c > 0 ? 'Subtract ' + c + ' from' : 'Add ' + (-c) + ' to') + ' both sides: $\\dfrac{' + T.lin(1, v, b) + '}{' + dd + '} = ' + k + '$.', 'Multiply both sides by ' + dd + ': $' + T.lin(1, v, b) + ' = ' + dd * k + '$.', (b > 0 ? 'Subtract ' + b : 'Add ' + (-b)) + ': $' + v + ' = ' + x + '$.'];
    } else if (kind === 'dec') {
      var hh = R.pick([[0.5, 2], [0.2, 5], [0.25, 4]]); b = R.nz(-6, 6); x = hh[1] * R.intNot(-4, 5, 0) - b; c = R.nz(-5, 5); d = U.fix(hh[0] * (x + b) + c);
      eq = T.num(hh[0]) + '(' + T.lin(1, v, b) + ')' + T.signed(c) + ' = ' + T.num(d); eqP = hh[0] + '*(x+(' + b + '))+(' + c + ')=' + d;
      st = [(c > 0 ? 'Subtract ' + c + ' from' : 'Add ' + (-c) + ' to') + ' both sides: $' + T.num(hh[0]) + '(' + T.lin(1, v, b) + ') = ' + T.num(U.fix(d - c)) + '$.', 'Multiplying by ' + T.num(hh[0]) + ' is dividing by ' + hh[1] + ', so multiply both sides by ' + hh[1] + ': $' + T.lin(1, v, b) + ' = ' + T.num(U.fix((d - c) * hh[1])) + '$.', (b > 0 ? 'Subtract ' + b : 'Add ' + (-b)) + ': $' + v + ' = ' + x + '$.'];
    } else {
      a = R.int(2, 7); b = R.int(2, 9); d = R.nz(-30, 30); var vv = v;
      var rt = T.lin(-a, vv, a * b) + ' = ' + d, w1 = T.lin(-a, vv, -a * b) + ' = ' + d, w2 = T.lin(-a, vv, -b) + ' = ' + d, w3 = T.lin(a, vv, a * b) + ' = ' + d;
      return { q: 'What is the correct result of distributing in $-' + a + '(' + T.lin(1, vv, -b) + ') = ' + d + '$?', a: mcq(m$(rt), [m$(w1), m$(w2), m$(w3)]),
        steps: ['Multiply each term inside by $-' + a + '$.', '$-' + a + ' \\cdot ' + vv + ' = ' + T.mono(-a, vv) + '$ and $-' + a + ' \\cdot (-' + b + ') = ' + a * b + '$ (negative times negative is positive).', 'So the equation becomes $' + rt + '$.'],
        hint: 'The −' + a + ' multiplies both terms, and a negative times a negative is positive.', chk: { t: 'equiv', a: '-' + a + '*(x-' + b + ')', b: (-a) + '*x+' + a * b, vars: ['x'] } };
    }
    st.push('Check: put $' + v + ' = ' + x + '$ back into the original equation; both sides match.');
    return { q: 'Solve for $' + v + '$: $' + eq + '$', a: { t: 'num', v: String(x) }, steps: st,
      hint: kind === 'combine' ? 'Combine the ' + v + ' terms first.' : kind === 'frac' ? 'Undo the addition, then multiply away the fraction.' : 'Distribute first. Watch the signs.', chk: { t: 'set', eq: eqP, sols: [String(x)] } };
  });

  G('g8.variables-both-sides', function (R, ctx) {
    var kind = R.pick(by(ctx, ['basic', 'basic', 'negs', 'basic'], ['basic', 'negs', 'paren', 'mc', 'paren'], ['paren', 'frac', 'dec', 'negs', 'mc']));
    var v = R.pick(EVAR), x = R.intNot(-9, 9, 0), a, b, c, d, eq, eqP, st;
    if (kind === 'basic' || kind === 'negs') {
      if (kind === 'basic') { a = R.int(3, 9); c = R.int(1, a - 1); }
      else { a = R.nz(-8, 8); c = R.intNot(-8, 8, [0, a]); }
      b = R.nz(-15, 15); d = (a - c) * x + b; // a x + b = c x + d
      eq = T.lin(a, v, b) + ' = ' + T.lin(c, v, d); eqP = linP(a, b) + '=' + linP(c, d);
      var small = Math.min(a, c), left = a - small, right = c - small; // subtract the smaller x-term from both sides
      st = [(small > 0 ? 'Subtract $' + T.mono(small, v) + '$ from' : 'Add $' + T.mono(-small, v) + '$ to') + ' both sides, so the $' + v + '$ terms are on one side: $' + (left ? T.lin(left, v, b) + ' = ' + d : b + ' = ' + T.lin(right, v, d)) + '$.'];
      if (left) st = st.concat(solveSteps(v, left, b, d));
      else { st.push((d > 0 ? 'Subtract ' + d + ' from' : 'Add ' + (-d) + ' to') + ' both sides: $' + (b - d) + ' = ' + T.mono(right, v) + '$.'); st.push('Divide by ' + T.p(right) + ': $' + v + ' = ' + x + '$.'); }
    } else if (kind === 'paren') {
      a = R.int(2, 6); b = R.nz(-6, 6); c = R.intNot(2, 6, a); var e = R.nz(-6, 6), f = R.int(-10, 10); // a(x+b) = c(x+e) + f
      f = a * (x + b) - c * (x + e);
      eq = par(a, T.lin(1, v, b)) + ' = ' + par(c, T.lin(1, v, e)) + (f ? T.signed(f) : ''); eqP = parP(a, 'x+(' + b + ')') + '=' + parP(c, 'x+(' + e + ')') + '+(' + f + ')';
      var L = a, Lb = a * b, Rr = c, Rb = c * e + f;
      st = ['Distribute on both sides: $' + T.lin(L, v, Lb) + ' = ' + T.lin(Rr, v, Rb) + '$.'];
      var sm = Math.min(L, Rr);
      st.push('Subtract $' + T.mono(sm, v) + '$ from both sides: $' + (L - sm ? T.lin(L - sm, v, Lb) + ' = ' + Rb : Lb + ' = ' + T.lin(Rr - sm, v, Rb)) + '$.');
      if (L - sm) st = st.concat(solveSteps(v, L - sm, Lb, Rb));
      else { st.push((Rb > 0 ? 'Subtract ' + Rb + ' from' : 'Add ' + (-Rb) + ' to') + ' both sides: $' + (Lb - Rb) + ' = ' + T.mono(Rr - sm, v) + '$.'); st.push('Divide by ' + (Rr - sm) + ': $' + v + ' = ' + x + '$.'); }
    } else if (kind === 'frac') {
      var p = R.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 6], [2, 4]]), L2 = U.lcm(p[0], p[1]), k = R.intNot(-4, 4, 0); x = L2 * k;
      b = R.nz(-6, 6); var gap = x / p[0] - x / p[1]; d = b + gap; // x/p0 + b = x/p1 + d
      eq = '\\dfrac{' + v + '}{' + p[0] + '}' + T.signed(b) + ' = \\dfrac{' + v + '}{' + p[1] + '}' + T.signed(d); eqP = 'x/' + p[0] + '+(' + b + ')=x/' + p[1] + '+(' + d + ')';
      var m0 = L2 / p[0], m1 = L2 / p[1];
      st = ['Multiply every term by ' + L2 + ' to clear the fractions: $' + T.lin(m0, v, L2 * b) + ' = ' + T.lin(m1, v, L2 * d) + '$.', 'Subtract $' + T.mono(m1, v) + '$ from both sides: $' + T.lin(m0 - m1, v, L2 * b) + ' = ' + L2 * d + '$.'].concat(solveSteps(v, m0 - m1, L2 * b, L2 * d));
    } else if (kind === 'dec') {
      a = R.int(2, 9); c = R.intNot(1, 9, a); b = R.nz(-30, 30); d = (a - c) * x + b; // a/10 x + b/10 = c/10 x + d/10
      var aq = Q(a, 10), bq = Q(b, 10), cq = Q(c, 10), dq = Q(d, 10);
      eq = T.lin(U.numStr(aq), v, U.numStr(bq)) + ' = ' + T.lin(U.numStr(cq), v, U.numStr(dq)); eqP = linP(aq.toPlain(), bq.toPlain()) + '=' + linP(cq.toPlain(), dq.toPlain());
      st = ['Multiply every term by 10 to clear the decimals: $' + T.lin(a, v, b) + ' = ' + T.lin(c, v, d) + '$.'];
      var sm2 = Math.min(a, c);
      st.push('Subtract $' + T.mono(sm2, v) + '$ from both sides: $' + (a - sm2 ? T.lin(a - sm2, v, b) + ' = ' + d : b + ' = ' + T.lin(c - sm2, v, d)) + '$.');
      if (a - sm2) st = st.concat(solveSteps(v, a - sm2, b, d)); else { st.push((d > 0 ? 'Subtract ' + d + ' from' : 'Add ' + (-d) + ' to') + ' both sides: $' + (b - d) + ' = ' + T.mono(c - sm2, v) + '$.'); st.push('Divide by ' + (c - sm2) + ': $' + v + ' = ' + x + '$.'); }
    } else {
      a = R.int(4, 9); c = R.int(2, a - 1); b = R.int(1, 9); d = (a - c) * R.int(1, 5) + b; var who = names(R)[0];
      var wrongLine = T.lin(a + c, v, b) + ' = ' + d;
      var choices = ['$' + T.mono(c, v) + '$ was subtracted on the left but added on the right. Subtract $' + T.mono(c, v) + '$ from both sides: $' + T.lin(a - c, v, b) + ' = ' + d + '$.',
        'Nothing; the step is correct.', 'The first step should be to divide both sides by ' + a + '.', 'The ' + b + ' should have been subtracted from the left side only.'];
      return { q: who + ' is solving $' + T.lin(a, v, b) + ' = ' + T.lin(c, v, d) + '$. The first step written is $' + wrongLine + '$. What went wrong?', a: { t: 'mc', choices: choices, v: 0 },
        steps: ['To move $' + T.mono(c, v) + '$ off the right side, subtract it from <b>both</b> sides.', 'Left: $' + T.mono(a, v) + ' - ' + T.mono(c, v) + ' = ' + T.mono(a - c, v) + '$. Right: $' + T.mono(c, v) + ' - ' + T.mono(c, v) + ' = 0$.', 'The correct next line is $' + T.lin(a - c, v, b) + ' = ' + d + '$. Writing $' + T.mono(a + c, v) + '$ means it was added on one side and subtracted on the other, which tips the balance.'],
        hint: 'Whatever you do to one side, do the same to the other.', chk: { t: 'set', eq: linP(a - c, b) + '=' + d, sols: [U.numStr(Q(d - b, a - c))] } };
    }
    st.push('Check: $' + v + ' = ' + x + '$ makes both sides equal.');
    return { q: 'Solve for $' + v + '$: $' + eq + '$', a: { t: 'num', v: String(x) }, steps: st,
      hint: kind === 'frac' ? 'Multiply every term by a common denominator first.' : kind === 'dec' ? 'Multiply every term by 10 first.' : 'Get the ' + v + ' terms together on one side by doing the same thing to both sides.', chk: { t: 'set', eq: eqP, sols: [String(x)] } };
  });

  G('g8.solution-count', function (R, ctx) {
    var kind = R.pick(by(ctx, ['solve', 'classify', 'solve', 'solve'], ['solve', 'classify', 'fill', 'solve', 'mean'], ['solve', 'classify', 'fill', 'solve']));
    var v = R.pick(['x', 'x', 'n', 'y', 'a']), type = R.pick(['one', 'none', 'all']);
    function build() { // returns {tex, plain, type, sol, steps}
      var a = R.int(2, 6), b = R.nz(-6, 6), c = R.nz(-9, 9), k, rhsC, tex, plain, st;
      if (type === 'one') {
        var x = R.intNot(-8, 8, 0), c2 = R.intNot(-6, 6, [0, a]);
        // a(x + b) + c = c2 x + rhsC  with x unique
        rhsC = (a - c2) * x + a * b + c;
        tex = par(a, T.lin(1, v, b)) + T.signed(c) + ' = ' + T.lin(c2, v, rhsC); plain = parP(a, 'x+(' + b + ')') + '+(' + c + ')=' + linP(c2, rhsC);
        st = ['Distribute and combine the numbers: $' + T.lin(a, v, a * b + c) + ' = ' + T.lin(c2, v, rhsC) + '$.', (c2 > 0 ? 'Subtract $' + T.mono(c2, v) + '$ from' : 'Add $' + T.mono(-c2, v) + '$ to') + ' both sides: $' + T.lin(a - c2, v, a * b + c) + ' = ' + rhsC + '$.'].concat(solveSteps(v, a - c2, a * b + c, rhsC));
        st.push('Exactly one solution: $' + v + ' = ' + x + '$.');
        return { tex: tex, plain: plain, sol: [String(x)], steps: st };
      }
      k = a * b + c; rhsC = type === 'all' ? k : R.intNot(-20, 20, k);
      var form = R.int(0, 1);
      if (form === 0) { tex = par(a, T.lin(1, v, b)) + T.signed(c) + ' = ' + T.lin(a, v, rhsC); plain = parP(a, 'x+(' + b + ')') + '+(' + c + ')=' + linP(a, rhsC); }
      else { var s1 = R.int(1, a - 1), inner = R.nz(-6, 6); k = (a - s1) * inner + c; rhsC = type === 'all' ? k : R.intNot(-20, 20, k); tex = T.lin(s1, v, c) + ' + ' + par(a - s1, T.lin(1, v, inner)) + ' = ' + T.lin(a, v, rhsC); plain = linP(s1, c) + '+' + parP(a - s1, 'x+(' + inner + ')') + '=' + linP(a, rhsC); }
      st = ['Simplify the left side: $' + T.lin(a, v, k) + ' = ' + T.lin(a, v, rhsC) + '$.', 'Subtract $' + T.mono(a, v) + '$ from both sides: $' + k + ' = ' + rhsC + '$. The ' + v + ' terms are gone.'];
      st.push(type === 'all' ? '$' + k + ' = ' + rhsC + '$ is always true, whatever ' + v + ' is. Every number is a solution: infinitely many solutions.' : '$' + k + ' = ' + rhsC + '$ is never true, whatever ' + v + ' is. There is no solution.');
      return { tex: tex, plain: plain, sol: type === 'all' ? 'all' : [], steps: st };
    }
    if (kind === 'solve' || kind === 'classify') {
      var E = build(), chk = type === 'one' ? { t: 'set', eq: E.plain, sols: E.sol } : type === 'all' ? { t: 'set', eq: E.plain, all: true } : { t: 'set', eq: E.plain, none: true };
      if (kind === 'solve') return { q: 'Solve: $' + E.tex + '$. If every number works, say “all real numbers”; if none does, say “no solution.”', a: { t: 'set', v: E.sol }, steps: E.steps, hint: 'Simplify both sides, then collect the ' + v + ' terms. If they cancel, read what is left.', chk: chk };
      var ch = ['exactly one solution', 'no solution', 'infinitely many solutions'];
      return { q: 'How many solutions does $' + E.tex + '$ have?', a: { t: 'mc', choices: ch, v: type === 'one' ? 0 : type === 'none' ? 1 : 2, keep: true }, steps: E.steps, hint: 'Simplify and see whether the ' + v + ' terms cancel.', chk: chk };
    }
    if (kind === 'fill') {
      var a2 = R.int(2, 9), b2 = R.nz(-12, 12), c3 = R.nz(-12, 12), want = R.coin() ? 'all' : 'none';
      if (want === 'all') return { q: 'What number should replace $\\square$ so that $' + T.lin(a2, v, b2) + ' = ' + T.mono(a2, v) + ' + \\square$ has infinitely many solutions?', a: { t: 'num', v: String(b2) },
        steps: ['Subtract $' + T.mono(a2, v) + '$ from both sides: $' + b2 + ' = \\square$.', 'For every number to work, this must be true, so the box is ' + b2 + '.', 'Then both sides are the same expression.'], hint: 'Make the two sides identical.', chk: { t: 'set', eq: linP(a2, b2) + '=' + linP(a2, b2), all: true } };
      return { q: 'What number should replace $\\square$ so that $' + T.lin(a2, v, b2) + ' = \\square ' + v + T.signed(c3 === b2 ? c3 + 1 : c3) + '$ has <b>no</b> solution?', a: { t: 'num', v: String(a2) },
        steps: ['If the box were any number other than ' + a2 + ', the ' + v + ' terms would not cancel and there would be exactly one solution.', 'With $' + a2 + '$: subtracting $' + T.mono(a2, v) + '$ leaves $' + b2 + ' = ' + (c3 === b2 ? c3 + 1 : c3) + '$, which is false.', 'So the box is ' + a2 + '.'], hint: 'No solution happens when the ' + v + ' terms cancel but the numbers do not match.', chk: { t: 'set', eq: linP(a2, b2) + '=' + linP(a2, c3 === b2 ? c3 + 1 : c3), none: true } };
    }
    // mean: what does 0 = 0 mean?
    var a3 = R.int(2, 5), b3 = R.nz(-5, 5), who = names(R)[0];
    return { q: who + ' simplified $' + par(a3, T.lin(1, v, b3)) + ' = ' + T.lin(a3, v, a3 * b3) + '$ and got $0 = 0$. What does that mean?', a: { t: 'mc', choices: ['Every number is a solution.', 'The only solution is $' + v + ' = 0$.', 'There is no solution.', 'A mistake was made, because $' + v + '$ disappeared.'], v: 0 },
      steps: ['$0 = 0$ is a true statement, and it no longer depends on ' + v + '.', 'So whatever number ' + v + ' is, the equation is true: try $' + v + ' = 1$ and $' + v + ' = 10$ in the original.', 'Both sides are the same expression, so there are infinitely many solutions.'], hint: 'Is 0 = 0 true or false? Does it depend on ' + v + '?', chk: { t: 'set', eq: parP(a3, 'x+(' + b3 + ')') + '=' + linP(a3, a3 * b3), all: true } };
  });


  // ================================================================ Unit 4: functions
  function plot(o, label) { o.controls = false; if (label) o.label = label; return { name: 'g8-plot', opts: o, label: label || 'A graph for this problem' }; }
  function pairsTex(ps) { return '\\{' + ps.map(function (p) { return '(' + T.num(p[0]) + ', ' + T.num(p[1]) + ')'; }).join(', ') + '\\}'; }
  var YN = ['Yes, it is a function.', 'No, it is not a function.'];

  G('g8.function-definition', function (R, ctx) {
    var kind = R.pick(by(ctx, ['pairs', 'map', 'context', 'table'], ['pairs', 'map', 'table', 'context', 'fix'], ['pairs', 'fix', 'graph', 'context', 'map']));
    function makeRel(n) { // -> {pairs, isF, dupIn, sharedOut}
      var xs = R.sample(U.range(-5, 9), n), isF = R.coin(), ps = xs.map(function (x) { return [x, R.int(-6, 12)]; });
      if (!isF) { var j = R.int(0, n - 1), y2 = R.intNot(-6, 12, ps[j][1]); ps.push([ps[j][0], y2]); ps = R.shuffle(ps); return { ps: ps, isF: false, dup: xs[j] }; }
      if (R.coin()) { var i1 = R.int(0, n - 1), i2 = (i1 + 1) % n; ps[i2][1] = ps[i1][1]; }
      return { ps: ps, isF: true };
    }
    function why(rel) {
      if (!rel.isF) { var d = rel.dup, outs = rel.ps.filter(function (p) { return p[0] === d; }).map(function (p) { return p[1]; }); return ['Look for an input that appears twice with different outputs.', 'The input ' + d + ' goes to both ' + outs[0] + ' and ' + outs[1] + '.', 'One input with two outputs: not a function.']; }
      var outsAll = rel.ps.map(function (p) { return p[1]; }), rep2 = outsAll.filter(function (y, i) { return outsAll.indexOf(y) !== i; });
      return ['Every input appears exactly once, so each input has exactly one output.'].concat(rep2.length ? ['Two inputs share the output ' + rep2[0] + '. That is allowed: a function may give the same output for different inputs.'] : []).concat(['So it is a function.']);
    }
    if (kind === 'pairs' || kind === 'table' || kind === 'map') {
      var rel = makeRel(R.int(3, 5)), q, viz;
      if (kind === 'pairs') q = 'Is this relation a function? $' + pairsTex(rel.ps) + '$';
      else if (kind === 'table') q = 'Is the relation in this table a function?' + hTable('\\text{input}', '\\text{output}', rel.ps.map(function (p) { return p[0]; }), rel.ps.map(function (p) { return p[1]; }));
      else { q = 'Is the relation in this mapping diagram a function?'; viz = { name: 'g8-mapping', opts: { pairs: rel.ps, verdict: false, controls: false }, label: 'A mapping diagram' }; }
      var out = { q: q, a: { t: 'mc', choices: YN.slice(), v: rel.isF ? 0 : 1, keep: true }, steps: why(rel), hint: 'Check each input: does it go to exactly one output?', chk: { t: 'fn', ps: rel.ps, isF: rel.isF } };
      if (viz) out.viz = viz;
      return out;
    }
    if (kind === 'context') {
      var C = R.pick([
        ['Input: a student in your class. Output: that student’s birthday.', true, 'Each student has exactly one birthday (two students may share one, which is fine).'],
        ['Input: a day of the year. Output: a student in your class born on that day.', false, 'Some days have two or more students born on them, and some have none, so an input can have more than one output.'],
        ['Input: the number of hours a plumber works. Output: the bill, at \\$60 an hour plus \\$40.', true, 'Each number of hours gives exactly one bill.'],
        ['Input: a person’s first name. Output: that person’s phone number.', false, 'Many people share a first name, so one name can lead to many phone numbers.'],
        ['Input: the side length of a square. Output: its area.', true, 'Each side length gives exactly one area.'],
        ['Input: a temperature reading. Output: a city that had that temperature today.', false, 'Many cities can have the same temperature, so one input can have several outputs.'],
        ['Input: a whole number. Output: that number squared.', true, 'Every number has exactly one square, even though 3 and −3 share the square 9.'],
        ['Input: a positive number. Output: a number whose square is the input.', false, 'Both 3 and −3 square to 9, so the input 9 has two outputs.']
      ]);
      return { q: 'Is this a function? ' + C[0], a: { t: 'mc', choices: YN.slice(), v: C[1] ? 0 : 1, keep: true }, steps: [C[2], C[1] ? 'So it is a function.' : 'So it is not a function.'], hint: 'Can one input lead to two different outputs?', chk: { t: 'ok' } };
    }
    if (kind === 'fix') {
      var xs = R.sample(U.range(-4, 9), 3), ys = xs.map(function () { return R.int(-5, 10); }), bad = R.pick(xs);
      var others = R.sample(U.range(-6, 12).filter(function (z) { return xs.indexOf(z) < 0; }), 3);
      var ps = [[xs[0], ys[0]], [xs[1], ys[1]], [xs[2], ys[2]]], newY = R.intNot(-5, 10, ps[xs.indexOf(bad)][1]);
      return { q: 'The relation $' + pairsTex(ps).replace(/\\\}$/, '') + ', (a, ' + newY + ')\\}$ is <b>not</b> a function. Which could $a$ be?', a: mcq(m$(String(bad)), others.map(function (z) { return m$(String(z)); })),
        steps: ['A relation fails to be a function when one input has two different outputs.', 'If $a = ' + bad + '$, the input ' + bad + ' would go to both ' + ps[xs.indexOf(bad)][1] + ' and ' + newY + '.', 'Any of the other choices is a new input, which keeps it a function.'], hint: 'Which choice is already used as an input?', chk: { t: 'ok' } };
    }
    // graph: points on a grid (vertical line test)
    var n = R.int(4, 6), xs2 = R.sample(U.range(-4, 4), n), pts = xs2.map(function (x) { return [x, R.int(-4, 4)]; }), isF = R.coin();
    if (!isF) { var jj = R.int(0, n - 1), y3 = R.intNot(-4, 4, pts[jj][1]); pts.push([pts[jj][0], y3]); }
    var vx = !isF ? pts[pts.length - 1][0] : null;
    return { q: 'The graph shows a relation as a set of points. Is it a function?', a: { t: 'mc', choices: YN.slice(), v: isF ? 0 : 1, keep: true },
      viz: plot({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: pts.map(function (p) { return { x: p[0], y: p[1], color: 'blue' }; }) }, 'Points on a coordinate grid'),
      steps: isF ? ['No two points are straight above each other, so no input (x-value) has two outputs.', 'It is a function.'] : ['Two points have the same x-value, ' + vx + ', one straight above the other.', 'So the input ' + vx + ' has two outputs: not a function.'],
      hint: 'Are two points ever on the same vertical line?', chk: { t: 'fn', ps: pts, isF: isF } };
  });

  G('g8.function-representations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['eval', 'eval', 'missing', 'words'], ['eval', 'input', 'table', 'words', 'graph'], ['input', 'table', 'words', 'graph', 'missing']));
    var m = R.nz(-5, 6), b = R.int(-9, 12), v = 'x';
    if (m === 1) m = 2;
    var rule = T.lin(m, 'x', b), ruleP = linNice(m, b);
    if (kind === 'eval') {
      var x = R.int(-5, 9), y = m * x + b;
      return { q: 'The rule $y = ' + rule + '$ is a function. What is the output when the input is $x = ' + x + '$?', a: { t: 'num', v: String(y) },
        steps: ['Put ' + x + ' in for $x$: $y = ' + T.p(m) + ' \\cdot ' + T.p(x) + T.signed(b) + '$.', 'Multiply first, then add: $y = ' + m * x + T.signed(b) + ' = ' + y + '$.'],
        hint: 'Replace x with ' + x + ' and work it out.', chk: { t: 'num', v: String(m * x + b), why: 'eval' } };
    }
    if (kind === 'input') {
      var x2 = R.int(-6, 9), y2 = m * x2 + b;
      return { q: 'For the function $y = ' + rule + '$, which input gives the output $y = ' + y2 + '$?', a: { t: 'num', v: String(x2) },
        steps: ['Set the rule equal to ' + y2 + ': $' + rule + ' = ' + y2 + '$.'].concat(solveSteps('x', m, b, y2)), hint: 'Write an equation and solve it for x.', chk: { t: 'set', eq: ruleP + '=' + y2, sols: [String(x2)] } };
    }
    if (kind === 'table' || kind === 'missing') {
      var x0 = kind === 'table' && ctx.level > 2 ? R.int(-3, 2) : R.int(0, 2), xs = [x0, x0 + 1, x0 + 2, x0 + 3], ys = xs.map(function (z) { return m * z + b; });
      if (kind === 'missing') {
        var hide = R.int(1, 3), xs5 = xs.concat([x0 + 4]), ys5 = xs5.map(function (z) { return m * z + b; }), shown = ys5.map(function (z, i) { return i === hide ? '?' : z; });
        return { q: 'This table shows a linear function. What number goes in place of the question mark?' + hTable('x', 'y', xs5, shown).replace(/ \?/, ' \\,?\\,'), a: { t: 'num', v: String(ys5[hide]) },
          steps: ['Each time $x$ goes up 1, $y$ changes by ' + m + ' (look at two neighboring columns).', 'So the missing value is $' + ys5[hide - 1] + T.signed(m) + ' = ' + ys5[hide] + '$.'], hint: 'How much does y change each time x goes up by 1?', chk: { t: 'num', v: String(m * (x0 + hide) + b), why: 'missing' } };
      }
      return { q: 'Write a rule for this linear function, in the form $y = mx + b$.' + hTable('x', 'y', xs, ys), a: { t: 'expr', v: ruleP, vars: ['x'] },
        steps: ['Each time $x$ goes up 1, $y$ changes by ' + m + ', so $y = ' + T.mono(m, 'x') + ' + \\ldots$', 'At $x = ' + x0 + '$, $' + T.mono(m, 'x') + ' = ' + m * x0 + '$, but $y = ' + ys[0] + '$, so add $' + (ys[0] - m * x0) + '$.', 'Rule: $y = ' + rule + '$. Check another column: $x = ' + xs[2] + '$ gives $' + ys[2] + '$.'],
        hint: 'Find how much y changes per step of 1 in x, then find what to add.', chk: { t: 'equiv', a: ruleP, b: ruleP, vars: ['x'], pts: xs.map(function (z, i) { return [z, ys[i]]; }) } };
    }
    if (kind === 'words') {
      var W = R.pick([['A gym charges a \\$%b joining fee plus \\$%m for each month. Write a rule for the total cost $y$ (in dollars) after $x$ months.', [10, 50], [15, 40]],
        ['A plant is %b cm tall and grows %m cm each week. Write a rule for its height $y$ (in cm) after $x$ weeks.', [2, 20], [2, 5]],
        ['A taxi ride costs \\$%b to start plus \\$%m per mile. Write a rule for the cost $y$ (in dollars) of an $x$-mile ride.', [2, 6], [2, 4]],
        ['A pool has %b inches of water and is filled %m inches each hour. Write a rule for the depth $y$ (in inches) after $x$ hours.', [5, 30], [2, 6]]]);
      var bb = R.int(W[1][0], W[1][1]), mm = R.int(W[2][0], W[2][1]);
      return { q: W[0].replace('%b', bb).replace('%m', mm), a: { t: 'expr', v: mm + '*x+' + bb, vars: ['x'] },
        steps: ['The amount that repeats each time is ' + mm + ': that is $' + mm + 'x$ after $x$ of them.', 'The starting amount, ' + bb + ', is added once.', 'Rule: $y = ' + mm + 'x + ' + bb + '$.'], hint: 'What is added once, and what is added for each x?', chk: { t: 'equiv', a: mm + '*x+' + bb, b: mm + '*x+' + bb, vars: ['x'] } };
    }
    // graph: read an output from a graph of a line
    var mg = R.pick([1, 2, -1, -2, 3]), bg = R.int(-3, 3), xq = R.int(-2, 3), yq = mg * xq + bg;
    while (Math.abs(yq) > 6) { xq = R.int(-2, 2); yq = mg * xq + bg; }
    return { q: 'The graph shows a function. What is the output $y$ when the input is $x = ' + xq + '$?', a: { t: 'num', v: String(yq) },
      viz: plot({ xmin: -6, xmax: 6, ymin: -7, ymax: 7, lines: [{ m: mg, b: bg, color: 'blue' }] }, 'The graph of a line'),
      steps: ['Find $x = ' + xq + '$ on the horizontal axis.', 'Go straight ' + (yq >= 0 ? 'up' : 'down') + ' to the line, then across to the $y$-axis.', 'The output is $y = ' + yq + '$.'], hint: 'Find x = ' + xq + ', then move straight up or down to the line.', chk: { t: 'num', v: String(mg * xq + bg), why: 'graph' } };
  });

  G('g8.qualitative-graphs', function (R, ctx) {
    var kind = R.pick(by(ctx, ['still', 'fast', 'back', 'meaning'], ['still', 'fast', 'back', 'story', 'meaning'], ['fast', 'story', 'back', 'still', 'tank']));
    var who = names(R)[0];
    var tank = kind === 'tank';
    // four parts; one stop, one return trip, two outward legs of different speeds
    var order = R.pick([['slow', 'stop', 'fast', 'back'], ['fast', 'stop', 'slow', 'back'], ['slow', 'fast', 'stop', 'back'], ['fast', 'slow', 'stop', 'back'], ['slow', 'stop', 'back', 'fast'], ['fast', 'back', 'stop', 'slow']]);
    var slope = { slow: 1, fast: 3, stop: 0, back: -2 }, pts = [[0, 0]], x = 0, y = 0, segs = [];
    order.forEach(function (t) { var d = R.int(2, 3); if (t === 'back') d = Math.min(d, Math.floor(y / 2)) || 1; x += d; y += slope[t] * d; if (y < 0) y = 0; pts.push([x, y]); segs.push(t); });
    var labs = ['A', 'B', 'C', 'D'], ymax = Math.max.apply(null, pts.map(function (p) { return p[1]; })) + 2;
    var xl = tank ? 'time (minutes)' : 'time (minutes)', yl = tank ? 'water in tank (gallons)' : 'distance from home (blocks)';
    var viz = plot({ xmin: 0, xmax: x + 1, ymin: 0, ymax: ymax, xstep: 1, ystep: 1, every: ymax > 12 ? 2 : 1, equal: false, xlabel: xl, ylabel: yl, height: 300, paths: [{ pts: pts, labels: labs, color: 'blue' }] }, 'A graph made of four straight parts labeled A, B, C and D');
    function ans(t) { return { t: 'mc', choices: labs.slice(), v: segs.indexOf(t), keep: true }; }
    if (kind === 'still' || (tank && R.coin())) return { q: tank ? 'The graph shows the water in a tank. During which part did the amount of water stay the same?' : 'The graph shows ' + who + '’s distance from home on a walk. During which part was ' + who + ' not moving?', a: ans('stop'), viz: viz,
      steps: ['When nothing changes, the graph is flat (horizontal): time goes on but the ' + (tank ? 'amount' : 'distance') + ' stays the same.', 'Part ' + labs[segs.indexOf('stop')] + ' is flat.'], hint: 'Look for the flat part.', chk: { t: 'ok' } };
    if (kind === 'fast') return { q: 'The graph shows ' + who + '’s distance from home on a bike ride. During which part was ' + who + ' moving away from home the fastest?', a: ans('fast'), viz: viz,
      steps: ['Moving away from home makes the distance go up, so look at the parts that rise.', 'Faster means more distance in the same time: a steeper rise.', 'Part ' + labs[segs.indexOf('fast')] + ' rises most steeply.'], hint: 'Which rising part is steepest?', chk: { t: 'ok' } };
    if (kind === 'back' || kind === 'tank') return { q: tank ? 'The graph shows the water in a tank. During which part was water draining out?' : 'The graph shows ' + who + '’s distance from home on a walk. During which part was ' + who + ' heading back toward home?', a: ans('back'), viz: viz,
      steps: [tank ? 'Draining means the amount of water goes down.' : 'Heading home means the distance from home gets smaller.', 'So the graph goes down from left to right: part ' + labs[segs.indexOf('back')] + '.'], hint: 'Which part goes down?', chk: { t: 'ok' } };
    if (kind === 'meaning') return { q: 'The graph shows ' + who + '’s distance from home on a walk. Part ' + labs[segs.indexOf('fast')] + ' goes up steeply. What does that tell you?', a: { t: 'mc', choices: [who + ' was moving away from home quickly.', who + ' was walking up a steep hill.', who + ' was standing still on a hill.', who + ' was walking back home.'], v: 0 }, viz: viz,
      steps: ['The graph is not a picture of the path. Its height is the distance from home.', 'Going up steeply means the distance from home grows quickly.', 'So ' + who + ' was moving away from home fast; the ground could be flat.'], hint: 'What does the height of the graph measure?', chk: { t: 'ok' } };
    // story: which story matches the graph?
    var words = { slow: 'walked slowly away from home', fast: 'jogged quickly away from home', stop: 'stopped to rest', back: 'walked back toward home' };
    function story(o2) { return who + ' ' + o2.map(function (t) { return words[t]; }).join(', then ') + '.'; }
    var wrongs = [], tries = 0;
    while (wrongs.length < 3 && tries++ < 40) { var sh = R.shuffle(order); var st = story(sh); if (sh.join() !== order.join() && wrongs.indexOf(st) < 0) wrongs.push(st); }
    return { q: 'Which story matches the graph of distance from home?', a: mcq(story(order), wrongs), viz: viz,
      steps: order.map(function (t, i) { return 'Part ' + labs[i] + ' ' + (t === 'stop' ? 'is flat: stopped.' : t === 'back' ? 'goes down: heading home.' : t === 'fast' ? 'rises steeply: moving away fast.' : 'rises gently: moving away slowly.'); }), hint: 'Describe each part in order: up steep, up gentle, flat or down.', chk: { t: 'ok' } };
  });


  // ================================================================ Unit 5: slope and lines
  function linNice(m, b, v) { // plain math for y = m x + b with fractions written as x/d: "2x - 3", "-x/2 + 4", "3x/4", "5"
    v = v || 'x'; m = Q.from(m); b = Q.from(b); var s = '';
    if (!m.isZero()) {
      var n = m.num(), d = m.den(), an = Math.abs(n);
      s = (n < 0 ? '-' : '') + (an === 1 ? v : an + v) + (d !== 1 ? '/' + d : '');
    }
    if (!b.isZero() || !s) s += (s ? (b.sign() < 0 ? ' - ' : ' + ') + b.abs().toPlain() : b.toPlain());
    return s;
  }
  function linTex(m, b, v) { return T.lin(Q.from(m), v || 'x', Q.from(b)); }
  function slopeOf(p1, p2) { return Q(p2[1] - p1[1], p2[0] - p1[0]); }
  function qTex(q) { return Q.from(q).toTex(); }
  var NICE_K = [2, 3, 4, 5, 6, 8, 12, 1.5, 2.5, 0.5, 0.25, 7, 9, 10];

  G('g8.proportional-slope', function (R, ctx) {
    var kind = R.pick(by(ctx, ['table', 'graph', 'equation', 'point'], ['table', 'graph', 'compare', 'equation', 'point'], ['graph', 'compare', 'equation', 'table']));
    var k = R.pick(NICE_K), kq = Q.from(k), ks = U.numStr(k);
    var C = R.pick([['pounds of apples', 'cost (\\$)', 'dollars per pound', 'x', 'y'], ['hours worked', 'pay (\\$)', 'dollars per hour', 'x', 'y'], ['minutes', 'pages printed', 'pages per minute', 'x', 'y'], ['gallons of gas', 'miles driven', 'miles per gallon', 'x', 'y']]);
    if (kind === 'table') {
      var step = kq.isInt() ? R.pick([1, 2, 3]) : (k === 0.25 ? 4 : 2), x0 = step * R.int(1, 2), xs = [x0, x0 + step, x0 + 2 * step, x0 + 3 * step], ys = xs.map(function (x) { return kq.mul(x); });
      return { q: 'The table shows a proportional relationship between $x$ (' + C[0] + ') and $y$ (' + C[1].replace('\\$', 'dollars').replace(/[()]/g, '') + '). What is the unit rate, the slope of its graph?' + hTable('x', 'y', xs, ys.map(function (q) { return U.numStr(q); })), a: { t: 'num', v: kq.toPlain() },
        steps: ['In a proportional relationship $y = kx$, and the unit rate is $k = \\frac{y}{x}$ for any column.', '$k = \\dfrac{' + U.numStr(ys[0]) + '}{' + xs[0] + '} = ' + T.num(ks) + '$', 'Check another column: $\\frac{' + U.numStr(ys[2]) + '}{' + xs[2] + '} = ' + T.num(ks) + '$. The unit rate (and the slope) is ' + T.num(ks) + ' ' + C[2] + '.'],
        hint: 'Divide y by x in any column.', chk: { t: 'num', v: U.numStr(Q.from(ys[1]).div(xs[1])), why: 'y/x' } };
    }
    if (kind === 'graph') {
      var kk = R.pick([Q(2), Q(3), Q(1, 2), Q(3, 2), Q(4), Q(2, 3), Q(5, 2)]), a = kk.den() * R.int(1, kk.den() === 1 ? 3 : 2), bb = kk.mul(a).num();
      var xmax = a + 2, ymax = bb + 2, ys2 = ymax > 14 ? 2 : 1;
      return { q: 'The graph shows a proportional relationship. What is its unit rate (slope)?', a: { t: 'num', v: kk.toPlain() },
        viz: plot({ xmin: 0, xmax: xmax, ymin: 0, ymax: ymax, xstep: 1, ystep: ys2, equal: ys2 === 1, lines: [{ p: [[0, 0], [a, bb]], color: 'blue', ray: true }], points: [{ x: a, y: bb, coords: true, color: 'red' }, { x: 0, y: 0, color: 'blue' }] }, 'A line through the origin and the point (' + a + ', ' + bb + ')'),
        steps: ['The line goes through $(0, 0)$ and $(' + a + ', ' + bb + ')$.', 'Unit rate $= \\dfrac{y}{x} = \\dfrac{' + bb + '}{' + a + '}' + (kk.den() === a && kk.num() === bb ? '' : ' = ' + kk.toTex()) + '$.', 'So $y = ' + T.coef(kk, 'x') + '$, and the slope of the line is ' + '$' + kk.toTex() + '$.'],
        hint: 'Use the marked point: divide its y-coordinate by its x-coordinate.', chk: { t: 'num', v: bb + '/' + a, why: 'b/a' } };
    }
    if (kind === 'compare') {
      var k1 = R.pick([2, 3, 4, 5, 6, 1.5, 2.5]), k2 = R.pick([2, 3, 4, 5, 6, 1.5, 2.5].filter(function (z) { return z !== k1; })), nm = names(R, 2);
      var xs3 = [2, 4, 6], ys3 = xs3.map(function (x) { return U.fix(k2 * x); });
      var bigA = k1 > k2;
      return { q: nm[0] + '’s printer: $y = ' + T.coef(U.numStr(k1), 'x') + '$, where $y$ is pages and $x$ is minutes. ' + nm[1] + '’s printer is shown in the table. Whose printer is faster?' + hTable('x\\ \\text{(min)}', 'y\\ \\text{(pages)}', xs3, ys3), a: { t: 'mc', choices: [nm[0] + '’s', nm[1] + '’s'], v: bigA ? 0 : 1, keep: true },
        steps: [nm[0] + '’s unit rate is the $k$ in $y = kx$: ' + U.numStr(k1) + ' pages per minute.', nm[1] + '’s unit rate: $\\frac{' + ys3[0] + '}{2} = ' + U.numStr(k2) + '$ pages per minute.', (bigA ? nm[0] : nm[1]) + '’s printer has the greater rate, so its graph is steeper and it is faster.'],
        hint: 'Find each unit rate, then compare.', chk: { t: 'cmp', x: String(k1), y: String(k2), big: bigA ? 0 : 1 } };
    }
    if (kind === 'equation') {
      var kq2 = R.pick([Q(2), Q(3), Q(4), Q(5), Q(5, 2), Q(3, 2), Q(6), Q(8)]), qty = kq2.den() * R.int(2, 5), tot = kq2.mul(qty);
      var S = R.pick([['Grapes cost \\$%t for %q pounds.', 'cost $y$ (in dollars) of $x$ pounds'], ['A car goes %t miles on %q gallons of gas.', 'distance $y$ (in miles) on $x$ gallons'], ['A worker earns \\$%t for %q hours.', 'pay $y$ (in dollars) for $x$ hours']]);
      return { q: S[0].replace('%t', U.numStr(tot)).replace('%q', qty) + ' The relationship is proportional. Write an equation $y = kx$ for the ' + S[1] + '.', a: { t: 'eq', v: 'y = ' + linNice(kq2, 0), form: 'slope' },
        steps: ['The unit rate is $k = \\dfrac{' + U.numStr(tot) + '}{' + qty + '} = ' + T.num(U.numStr(kq2)) + '$.', 'So $y = ' + T.coef(U.numStr(kq2), 'x') + '$.'], hint: 'Find the amount for 1 unit first.', chk: { t: 'equiv', a: U.numStr(tot) + '/' + qty + '*x', b: linNice(kq2, 0), vars: ['x'] } };
    }
    var kp = R.pick([3, 4, 6, 8, 12, 15]);
    return { q: 'A graph of a proportional relationship between hours worked ($x$) and pay in dollars ($y$) passes through the point $(1, ' + kp + ')$. What does the ' + kp + ' tell you?', a: { t: 'mc', choices: ['The pay for each hour: \\$' + kp + ' per hour.', 'The number of hours worked.', 'The pay before any work is done.', 'The total pay for the whole job.'], v: 0 },
      steps: ['At $x = 1$ hour the pay is $y = ' + kp + '$ dollars.', 'For a proportional relationship, the $y$-value at $x = 1$ is the unit rate $k$.', 'So the worker earns \\$' + kp + ' per hour, and the slope of the graph is ' + kp + '.'], hint: 'What is y when x is exactly 1?', chk: { t: 'ok' } };
  });

  G('g8.slope-rate-of-change', function (R, ctx) {
    var kind = R.pick(by(ctx, ['table', 'two', 'meaning', 'sign'], ['table', 'two', 'meaning', 'table'], ['two', 'table', 'meaning', 'sign']));
    if (kind === 'table') {
      var r = R.nz(-6, 8), s = R.pick(by(ctx, [1, 1, 2], [1, 2, 5], [2, 5, 3])), x0 = R.int(0, 3) * s, y0 = R.int(r < 0 ? 40 : 0, r < 0 ? 80 : 30);
      var xs = [x0, x0 + s, x0 + 2 * s, x0 + 3 * s], ys = xs.map(function (x) { return y0 + r * (x - x0); });
      var C = r > 0 ? R.pick([['weeks', 'savings (\\$)', 'dollars per week'], ['hours', 'distance (miles)', 'miles per hour'], ['days', 'height (cm)', 'centimeters per day']]) : R.pick([['minutes', 'water left (gallons)', 'gallons per minute'], ['hours', 'battery left (%)', 'percent per hour'], ['weeks', 'money left (\\$)', 'dollars per week']]);
      return { q: 'The table shows a linear relationship. What is the rate of change, in ' + C[2] + '?' + hTable('\\text{' + C[0] + '}', '\\text{' + C[1].replace(/ \(.*\)/, '') + '}', xs, ys), a: { t: 'num', v: String(r) },
        steps: ['Pick two columns: from $x = ' + xs[0] + '$ to $x = ' + xs[1] + '$, the change in $x$ is ' + s + '.', 'The change in $y$ is $' + ys[1] + ' - ' + T.p(ys[0]) + ' = ' + (ys[1] - ys[0]) + '$.', 'Rate of change $= \\dfrac{\\text{change in } y}{\\text{change in } x} = \\dfrac{' + (ys[1] - ys[0]) + '}{' + s + '} = ' + r + '$ ' + C[2] + '.' + (r < 0 ? ' It is negative because the amount goes down.' : '')],
        hint: s === 1 ? 'How much does y change each time x goes up by 1?' : 'x goes up by ' + s + ' each time. Divide the change in y by ' + s + '.', chk: { t: 'num', v: '(' + ys[3] + '-' + ys[0] + ')/(' + xs[3] + '-' + xs[0] + ')', why: 'end to end' } };
    }
    if (kind === 'two') {
      var rr = R.nz(-5, 6), t1 = R.int(1, 4), t2 = t1 + R.int(2, 5), h1 = R.int(rr < 0 ? 30 : 5, rr < 0 ? 60 : 30), h2 = h1 + rr * (t2 - t1);
      var S = rr < 0 ? R.pick([['A candle', 'tall', 'cm', 'hours', 'centimeters per hour'], ['A phone’s battery', 'charged', '%', 'hours', 'percent per hour']]) : R.pick([['A plant', 'tall', 'cm', 'weeks', 'centimeters per week'], ['A savings account', 'worth', 'dollars', 'months', 'dollars per month']]);
      var amt = function (h) { return S[2] === 'dollars' ? '\\$' + h : S[2] === '%' ? h + '\\%' : h + ' ' + S[2]; };
      return { q: S[0] + ' is ' + amt(h1) + ' ' + S[1] + ' after ' + t1 + ' ' + S[3] + ' and ' + amt(h2) + ' ' + S[1] + ' after ' + t2 + ' ' + S[3] + '. It changes at a constant rate. What is the rate of change, in ' + S[4] + '?', a: { t: 'num', v: String(rr) },
        steps: ['Change in amount: $' + h2 + ' - ' + h1 + ' = ' + (h2 - h1) + '$.', 'Change in time: $' + t2 + ' - ' + t1 + ' = ' + (t2 - t1) + '$ ' + S[3] + '.', 'Rate $= \\dfrac{' + (h2 - h1) + '}{' + (t2 - t1) + '} = ' + rr + '$ ' + S[4] + (rr < 0 ? ' (negative, because it is going down)' : '') + '.'],
        hint: 'Divide the change in the amount by the change in time.', chk: { t: 'num', v: '(' + h2 + '-' + h1 + ')/(' + t2 + '-' + t1 + ')', why: 'diff quotient' } };
    }
    if (kind === 'meaning') {
      var mm = R.nz(-25, 25), am = Math.abs(mm);
      var Cm = R.pick([['savings in dollars', 'weeks', '\\$' + am, 'per week'], ['water in a tank in liters', 'minutes', am + ' liters', 'per minute'], ['the height of a stack in centimeters', 'boxes added', am + ' cm', 'per box']]);
      var right = (mm > 0 ? 'It goes up by ' : 'It goes down by ') + Cm[2] + ' ' + Cm[3] + '.';
      return { q: 'A line graphs ' + Cm[0] + ' ($y$) against ' + Cm[1] + ' ($x$). Its slope is $' + mm + '$. What does the slope tell you?', a: mcq(right, [(mm > 0 ? 'It goes down by ' : 'It goes up by ') + Cm[2] + ' ' + Cm[3] + '.', 'It starts at ' + Cm[2] + '.', 'It reaches ' + Cm[2] + ' at the end.']),
        steps: ['Slope is a rate: the change in $y$ for each 1 that $x$ increases.', 'A slope of $' + mm + '$ means $y$ changes by $' + mm + '$ ' + Cm[3] + '.', right + ' The slope says nothing about where the line starts.'], hint: 'Slope = change in y for each 1 step in x.', chk: { t: 'ok' } };
    }
    var S2 = R.pick([['the distance a car has traveled as time passes', 'positive'], ['the water left in a draining bathtub as time passes', 'negative'], ['the number of pages left to read as you read a book', 'negative'], ['the height of a table as time passes', 'zero'], ['the total cost as you buy more tickets', 'positive'], ['the price of a stamp as you buy more letters, each with one stamp, if each stamp costs the same', 'zero']]);
    return { q: 'Is the rate of change positive, negative or zero for ' + S2[0] + '?', a: { t: 'mc', choices: ['positive', 'negative', 'zero'], v: ['positive', 'negative', 'zero'].indexOf(S2[1]), keep: true },
      steps: [S2[1] === 'positive' ? 'As $x$ increases, the amount increases, so the rate is positive.' : S2[1] === 'negative' ? 'As $x$ increases, the amount decreases, so the rate is negative.' : 'As $x$ increases, the amount stays the same, so the rate is zero.'], hint: 'As the first quantity grows, does the second go up, go down or stay the same?', chk: { t: 'ok' } };
  });

  function latticeLine(R, opt) { // two lattice points in [-lim, lim] with the given slope sign
    var lim = opt.lim || 5, p1, p2, s;
    for (var t = 0; t < 80; t++) {
      var run = R.int(1, opt.maxRun || 4), rise = R.int(opt.flat ? 0 : 1, opt.maxRise || 5) * (opt.neg ? -1 : 1);
      if (opt.flat) rise = 0;
      p1 = [R.int(-lim, lim - run), R.int(-lim, lim)]; p2 = [p1[0] + run, p1[1] + rise];
      if (Math.abs(p2[1]) <= lim && (opt.flat || rise !== 0)) break;
    }
    s = slopeOf(p1, p2);
    return { p1: p1, p2: p2, m: s };
  }

  G('g8.slope-from-graph', function (R, ctx) {
    var kind = R.pick(by(ctx, ['read', 'read', 'trap', 'read'], ['read', 'readneg', 'trap', 'flat', 'readneg'], ['scaled', 'readneg', 'scaled', 'read', 'trap']));
    if (kind === 'read' || kind === 'readneg' || kind === 'flat') {
      var L = latticeLine(R, { neg: kind === 'readneg', flat: kind === 'flat', maxRun: by(ctx, 3, 4, 5), maxRise: by(ctx, 4, 5, 6) }), run = L.p2[0] - L.p1[0], rise = L.p2[1] - L.p1[1];
      return { q: 'What is the slope of the line? Use the two marked points.', a: { t: 'num', v: L.m.toPlain() },
        viz: plot({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, lines: [{ p: [L.p1, L.p2], color: 'blue' }], points: [{ x: L.p1[0], y: L.p1[1], color: 'red', coords: ctx.level === 1 }, { x: L.p2[0], y: L.p2[1], color: 'red', coords: ctx.level === 1 }] }, 'A line through two marked points'),
        steps: ['From the left point to the right point, the run is ' + run + ' (to the right).', rise === 0 ? 'The rise is 0: the line is flat.' : 'The rise is ' + Math.abs(rise) + ' ' + (rise > 0 ? 'up, so $+' + rise + '$' : 'down, so $' + rise + '$') + '.', 'Slope $= \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{' + rise + '}{' + run + '}' + (L.m.den() !== run || L.m.isInt() ? ' = ' + L.m.toTex() : '') + '$'],
        hint: 'Count up or down (rise) first, then right (run). Slope = rise ÷ run.', chk: { t: 'num', v: '(' + L.p2[1] + '-' + L.p1[1] + ')/(' + L.p2[0] + '-' + L.p1[0] + ')', why: 'points' } };
    }
    if (kind === 'scaled') {
      var xs = R.pick([2, 5]), ys = R.pick([2, 5, 10].filter(function (z) { return z !== xs; })), ru = R.int(1, 4), ri = R.nz(-4, 4), a0 = R.int(0, 4 - ru), b0 = ri < 0 ? R.int(-ri, 5) : R.int(0, 5 - ri);
      var P1 = [a0 * xs, b0 * ys], P2 = [(a0 + ru) * xs, (b0 + ri) * ys], m = slopeOf(P1, P2);
      return { q: 'What is the slope of the line? Look carefully at the scale on each axis.', a: { t: 'num', v: m.toPlain() },
        viz: plot({ xmin: 0, xmax: 5 * xs, ymin: 0, ymax: 5 * ys, xstep: xs, ystep: ys, equal: false, height: 300, lines: [{ p: [P1, P2], color: 'blue' }], points: [{ x: P1[0], y: P1[1], color: 'red' }, { x: P2[0], y: P2[1], color: 'red' }] }, 'A line on axes with different scales'),
        steps: ['Each grid square is ' + xs + ' across and ' + ys + ' up, so count squares and multiply by the scale.', 'Run: ' + ru + ' squares × ' + xs + ' = ' + ru * xs + '. Rise: ' + Math.abs(ri) + ' squares × ' + ys + ' = ' + Math.abs(ri) * ys + (ri < 0 ? ' down' : ' up') + '.', 'Slope $= \\dfrac{' + ri * ys + '}{' + ru * xs + '} = ' + m.toTex() + '$'],
        hint: 'Read the actual coordinates of the two points from the axis numbers.', chk: { t: 'num', v: '(' + P2[1] + '-' + P1[1] + ')/(' + P2[0] + '-' + P1[0] + ')', why: 'scaled points' } };
    }
    var ru2 = R.int(2, 6), ri2 = R.intNot(1, 9, ru2), mq = Q(ri2, ru2), up = R.coin();
    var right = up ? mq : mq.neg();
    return { q: 'Going from one point on a line to another, you move ' + ru2 + ' units to the right and ' + ri2 + ' units ' + (up ? 'up' : 'down') + '. What is the slope?', a: mcq(m$(right.toTex()), [m$(right.inv().toTex()), m$(right.neg().toTex()), m$(String(ri2 + ru2))]),
      steps: ['Rise: ' + (up ? '+' : '−') + ri2 + '. Run: +' + ru2 + '.', 'Slope is rise over run, not run over rise: $\\dfrac{' + (up ? '' : '-') + ri2 + '}{' + ru2 + '} = ' + right.toTex() + '$.'], hint: 'Slope = rise ÷ run. Down means a negative rise.', chk: { t: 'mcval', a: (up ? '' : '-') + ri2 + '/' + ru2, right: right.toPlain(), wrong: [right.inv().toPlain(), right.neg().toPlain(), String(ri2 + ru2)] } };
  });

  G('g8.slope-similar-triangles', function (R, ctx) {
    var kind = R.pick(by(ctx, ['scale', 'graph', 'same', 'scale'], ['scale', 'graph', 'same', 'why', 'run'], ['run', 'graph', 'same', 'scale']));
    var r1 = R.int(1, 5), s1 = R.int(1, 5); while (r1 === s1) s1 = R.int(1, 6);
    var k = R.int(2, 4), sign = ctx.level > 1 && R.coin() ? -1 : 1;
    if (kind === 'scale' || kind === 'run') {
      var r2 = r1 * k, s2 = s1 * k;
      if (kind === 'scale') return { q: 'On a line, one slope triangle has a rise of ' + (sign < 0 ? '$-' + r1 + '$ (down)' : r1) + ' and a run of ' + s1 + '. A bigger slope triangle on the same line has a run of ' + s2 + '. What is its rise?', a: { t: 'num', v: String(sign * r2) },
        steps: ['Slope triangles on the same line are similar, so rise ÷ run is the same for both.', 'The run grew from ' + s1 + ' to ' + s2 + ', a scale factor of ' + k + '.', 'So the rise grows by the same factor: $' + (sign * r1) + ' \\times ' + k + ' = ' + sign * r2 + '$. Check: $\\frac{' + sign * r2 + '}{' + s2 + '} = \\frac{' + sign * r1 + '}{' + s1 + '}$.'],
        hint: 'How many times bigger is the new run?', chk: { t: 'num', v: '(' + sign * r1 + '/' + s1 + ')*' + s2, why: 'same slope' } };
      return { q: 'A line has a slope triangle with a rise of ' + r1 + ' and a run of ' + s1 + '. Another slope triangle on the same line has a rise of ' + r2 + '. What is its run?', a: { t: 'num', v: String(s2) },
        steps: ['Both triangles give the same slope, $\\frac{' + r1 + '}{' + s1 + '}$.', 'The rise grew by a factor of $' + r2 + ' \\div ' + r1 + ' = ' + k + '$, so the run does too.', 'Run $= ' + s1 + ' \\times ' + k + ' = ' + s2 + '$.'], hint: 'Find the scale factor from the rises.', chk: { t: 'num', v: r2 + '/(' + r1 + '/' + s1 + ')', why: 'same slope' } };
    }
    if (kind === 'graph') {
      var a1 = R.int(1, 2), b1 = R.int(1, 3), ru = R.int(1, 2), ri = R.int(1, 3); if (ri === ru) ri++;
      var kk = R.int(2, 3), A = [0, 0], B = [ru, ri], C = [ru + 1, ri + ri / ru], D = [ru + 1 + ru * kk, ri + ri / ru + ri * kk];
      A = [a1 - 6, b1 - 6]; B = [A[0] + ru, A[1] + ri]; C = [B[0] + 1, B[1] + ri / ru]; D = [C[0] + ru * kk, C[1] + ri * kk];
      if (D[1] > 6 || D[0] > 6) { kk = 2; D = [C[0] + ru * kk, C[1] + ri * kk]; }
      return { q: 'Both dashed slope triangles sit on the same line. The small one has a run of ' + ru + ' and a rise of ' + ri + '. The big one has a run of ' + ru * kk + '. What is the rise of the big one?', a: { t: 'num', v: String(ri * kk) },
        viz: plot({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, lines: [{ p: [A, B], color: 'blue' }], tri: [{ p1: A, p2: B, run: String(ru), rise: String(ri), color: 'orange' }, { p1: C, p2: D, run: String(ru * kk), rise: '?', color: 'purple' }] }, 'A line with two slope triangles'),
        steps: ['The triangles are similar: the big one is the small one scaled by $' + ru * kk + ' \\div ' + ru + ' = ' + kk + '$.', 'So its rise is $' + ri + ' \\times ' + kk + ' = ' + ri * kk + '$.', 'Both give the slope $\\frac{' + ri + '}{' + ru + '} = \\frac{' + ri * kk + '}{' + ru * kk + '}$.'],
        hint: 'The big triangle is a scaled copy of the small one.', chk: { t: 'num', v: '(' + ri + '/' + ru + ')*' + ru * kk, why: 'slope' } };
    }
    if (kind === 'same') {
      var yes = R.coin(), r3 = r1 * k, s3 = yes ? s1 * k : s1 * k + R.pick([-1, 1]);
      return { q: 'Triangle P has a rise of ' + r1 + ' and a run of ' + s1 + '. Triangle Q has a rise of ' + r3 + ' and a run of ' + s3 + '. Could both be slope triangles on the same line?', a: { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true },
        steps: ['Slope triangles on one line all give the same rise ÷ run.', 'P: $\\frac{' + r1 + '}{' + s1 + '}' + (Q(r1, s1).den() !== s1 ? ' = ' + Q(r1, s1).toTex() : '') + '$. Q: $\\frac{' + r3 + '}{' + s3 + '}' + (Q(r3, s3).den() !== s3 ? ' = ' + Q(r3, s3).toTex() : '') + '$.', yes ? 'They match, so yes.' : 'They are different, so no: the lines would have different slopes.'], hint: 'Compare rise ÷ run for each.', chk: { t: 'tfv', v: yes, x: r1 + '/' + s1, y: r3 + '/' + s3 } };
    }
    return { q: 'Why do any two slope triangles on the same line give the same slope?', a: { t: 'mc', choices: ['They are similar triangles, so rise and run grow by the same factor and their ratio stays the same.', 'They always have the same rise.', 'They always have the same run.', 'They are congruent: exactly the same size.'], v: 0 },
      steps: ['Two slope triangles on one line have the same angles, so one is a scaled copy (a dilation) of the other.', 'Scaling multiplies the rise and the run by the same number, so rise ÷ run does not change.', 'That is why slope is the same everywhere on a line.'], hint: 'Think about scale drawings.', chk: { t: 'ok' } };
  });

  G('g8.slope-formula', function (R, ctx) {
    var kind = R.pick(by(ctx, ['compute', 'compute', 'missing', 'compute'], ['compute', 'error', 'vert', 'missing', 'compute'], ['compute', 'error', 'vert', 'missing']));
    var lim = by(ctx, 9, 10, 12);
    if (kind === 'compute') {
      var p1 = [R.int(ctx.level > 1 ? -lim : 0, lim), R.int(ctx.level > 1 ? -lim : 0, lim)], p2;
      do { p2 = [R.int(ctx.level > 1 ? -lim : 0, lim), R.int(ctx.level > 1 ? -lim : 0, lim)]; } while (p2[0] === p1[0] || p2[1] === p1[1]);
      var m = slopeOf(p1, p2);
      return { q: 'Find the slope of the line through $' + ptT(p1[0], p1[1]) + '$ and $' + ptT(p2[0], p2[1]) + '$.', a: { t: 'num', v: m.toPlain() },
        steps: ['Label the points: $(x_1, y_1) = ' + ptT(p1[0], p1[1]) + '$ and $(x_2, y_2) = ' + ptT(p2[0], p2[1]) + '$.', '$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{' + p2[1] + ' - ' + T.p(p1[1]) + '}{' + p2[0] + ' - ' + T.p(p1[0]) + '} = \\dfrac{' + (p2[1] - p1[1]) + '}{' + (p2[0] - p1[0]) + '}$', '$m = ' + m.toTex() + '$. (Subtract in the same order on top and bottom.)'],
        hint: 'Subtract the y-values and the x-values in the same order.', chk: { t: 'num', v: '(' + p1[1] + '-(' + p2[1] + '))/(' + p1[0] + '-(' + p2[0] + '))', why: 'reversed order' } };
    }
    if (kind === 'vert') {
      var vert = R.coin(), a = R.int(-8, 8), y1 = R.int(-8, 8), y2 = R.intNot(-8, 8, y1), P = vert ? [[a, y1], [a, y2]] : [[y1, a], [y2, a]];
      var NOS = 'No slope: dividing by 0 is not defined.', other = m$(String(vert ? y2 - y1 : Q(1, y2 - y1).toTex()));
      return { q: 'What is the slope of the line through $' + ptT(P[0][0], P[0][1]) + '$ and $' + ptT(P[1][0], P[1][1]) + '$?', a: mcq(vert ? NOS : '$0$', [vert ? '$0$' : NOS, other, '$1$']),
        steps: vert ? ['The x-coordinates are equal, so the run is $' + a + ' - ' + T.p(a) + ' = 0$.', 'Dividing by 0 is not possible, so the slope is undefined: the line is vertical.'] : ['The y-coordinates are equal, so the rise is 0.', '$m = \\frac{0}{' + (y2 - y1) + '} = 0$: the line is horizontal.'],
        hint: 'Which coordinate stays the same? Is the run 0 or the rise 0?', chk: { t: 'ok' } };
    }
    if (kind === 'missing') {
      var mm = R.pick([Q(2), Q(3), Q(-2), Q(1, 2), Q(-1, 2), Q(3, 2), Q(-3), Q(2, 3)]), x1 = R.int(-6, 4), yy1 = R.int(-6, 6), x2 = x1 + mm.den() * R.int(1, 3), yy2 = mm.mul(x2 - x1).add(yy1).num(), yMinus = yy1 === 0 ? 'y' : 'y - ' + T.p(yy1);
      return { q: 'A line with slope $' + mm.toTex() + '$ passes through $' + ptT(x1, yy1) + '$ and $(' + x2 + ', y)$. Find $y$.', a: { t: 'num', v: String(yy2) },
        steps: ['$\\dfrac{' + yMinus + '}{' + x2 + ' - ' + T.p(x1) + '} = ' + mm.toTex() + '$, so $\\dfrac{' + yMinus + '}{' + (x2 - x1) + '} = ' + mm.toTex() + '$.', 'Multiply both sides by ' + (x2 - x1) + ': $' + yMinus + ' = ' + mm.mul(x2 - x1).toTex() + '$.', '$y = ' + yy2 + '$'],
        hint: 'The run is ' + (x2 - x1) + ', so the rise must be the slope times ' + (x2 - x1) + '.', chk: { t: 'num', v: '(' + yy1 + ')+(' + mm.toPlain() + ')*(' + x2 + '-(' + x1 + '))', why: 'point-slope' } };
    }
    var q1 = [R.int(-5, 5), R.int(-5, 5)], q2; do { q2 = [R.int(-5, 6), R.int(-5, 6)]; } while (q2[0] === q1[0] || q2[1] === q1[1]);
    var mr = slopeOf(q1, q2), who = names(R)[0];
    return { q: who + ' found the slope through $' + ptT(q1[0], q1[1]) + '$ and $' + ptT(q2[0], q2[1]) + '$ by computing $\\dfrac{' + q2[1] + ' - ' + T.p(q1[1]) + '}{' + q1[0] + ' - ' + T.p(q2[0]) + '}$. What is the correct slope?', a: mcq(m$(mr.toTex()), [m$(mr.neg().toTex()), m$(mr.inv().toTex()), m$(mr.inv().neg().toTex())].filter(function (z) { return z !== m$(mr.toTex()); })),
      steps: [who + ' subtracted in different orders on the top and the bottom, which flips the sign.', 'Use the same order: $\\dfrac{' + q2[1] + ' - ' + T.p(q1[1]) + '}{' + q2[0] + ' - ' + T.p(q1[0]) + '} = \\dfrac{' + (q2[1] - q1[1]) + '}{' + (q2[0] - q1[0]) + '}$.', 'The slope is $' + mr.toTex() + '$.'], hint: 'Start with the same point on the top and the bottom.', chk: { t: 'num', v: '(' + q2[1] + '-(' + q1[1] + '))/(' + q2[0] + '-(' + q1[0] + '))', why: 'slope', choice: true } };
  });

  G('g8.slope-intercept-form', function (R, ctx) {
    var kind = R.pick(by(ctx, ['read', 'write', 'graph', 'read'], ['read', 'graph', 'table', 'trap', 'write'], ['read', 'graph', 'table', 'trap', 'point']));
    var m = R.pick([Q(2), Q(3), Q(-2), Q(-1), Q(1, 2), Q(-1, 3), Q(3, 4), Q(-3, 2), Q(4), Q(-4), Q(1)]), b = R.int(-6, 6);
    if (kind === 'read') {
      var form = R.int(0, 3), tex;
      if (form === 0) tex = 'y = ' + linTex(m, b);
      else if (form === 1) tex = 'y = ' + (b === 0 ? linTex(m, 0) : b + ' ' + (m.sign() < 0 ? '-' : '+') + ' ' + T.coef(m.abs(), 'x'));
      else if (form === 2 && !m.isInt()) tex = 'y = \\dfrac{' + T.coef(m.num(), 'x') + '}{' + m.den() + '}' + T.signed(b);
      else { m = R.pick([Q(-1), Q(1), Q(0)]); tex = 'y = ' + linTex(m, b); }
      return { q: 'For the line $' + tex + '$, what are the slope $m$ and the $y$-intercept $b$?', a: { t: 'multi', parts: [{ label: '$m =$', a: { t: 'num', v: m.toPlain() } }, { label: '$b =$', a: { t: 'num', v: String(b) } }] },
        steps: ['Match it to $y = mx + b$: the slope is the number multiplying $x$, and $b$ is the number added on its own.', 'Here the $x$-term is $' + (m.isZero() ? '0x' : T.coef(m, 'x')) + '$, so $m = ' + m.toTex() + '$' + (m.abs().eq(1) ? ' (a lone $x$ means $1x$)' : '') + '.', 'The constant is $' + b + '$, so $b = ' + b + '$: the line crosses the $y$-axis at $(0, ' + b + ')$.'],
        hint: 'The slope is the coefficient of x, wherever it is written.', chk: { t: 'multi', vs: [null, String(b)] }, nolint: m.abs().eq(1) ? ['1x'] : undefined };
    }
    var ans = { t: 'eq', v: 'y = ' + linNice(m, b), form: 'slope' }, chkE = { t: 'line', m: m.toPlain(), b: String(b) };
    if (kind === 'write') return { q: 'Write the equation of the line with slope $' + m.toTex() + '$ and $y$-intercept $' + b + '$.', a: ans,
      steps: ['Slope-intercept form is $y = mx + b$.', 'Put in $m = ' + m.toTex() + '$ and $b = ' + b + '$: $y = ' + linTex(m, b) + '$.'], hint: 'm is the slope, b is the y-intercept.', chk: chkE };
    if (kind === 'graph' || kind === 'point') {
      var run = m.den(), mult = R.int(1, 2), rise = m.num() * mult; run *= mult;
      if (Math.abs(b + rise) > 6) { mult = 1; run = m.den(); rise = m.num(); }
      if (Math.abs(b + rise) > 6) b = rise > 0 ? -2 : 2;
      var P2 = [run, b + rise];
      ans = { t: 'eq', v: 'y = ' + linNice(m, b), form: 'slope' }; chkE = { t: 'line', m: m.toPlain(), b: String(b), pts: [[0, b], P2] };
      if (kind === 'point') return { q: 'A line crosses the $y$-axis at $(0, ' + b + ')$ and also passes through $' + ptT(P2[0], P2[1]) + '$. Write its equation in slope-intercept form.', a: ans,
        steps: ['The $y$-intercept is $b = ' + b + '$.', 'Slope: $m = \\dfrac{' + P2[1] + ' - ' + T.p(b) + '}{' + P2[0] + ' - 0} = ' + m.toTex() + '$.', 'Equation: $y = ' + linTex(m, b) + '$.'], hint: 'b is where it crosses the y-axis. Find the slope from the two points.', chk: chkE };
      return { q: 'Write the equation of the line in slope-intercept form, $y = mx + b$.', a: ans,
        viz: plot({ xmin: -6, xmax: 6, ymin: -7, ymax: 7, lines: [{ p: [[0, b], P2], color: 'blue' }], points: [{ x: 0, y: b, color: 'red' }, { x: P2[0], y: P2[1], color: 'red' }] }, 'A line through two marked points'),
        steps: ['The line crosses the $y$-axis at $(0, ' + b + ')$, so $b = ' + b + '$.', 'From there to the other marked point: run ' + run + ', rise ' + rise + '. Slope $m = \\frac{' + rise + '}{' + run + '} = ' + m.toTex() + '$.', 'Equation: $y = ' + linTex(m, b) + '$.'], hint: 'Read b where the line crosses the y-axis; count rise and run for m.', chk: chkE };
    }
    if (kind === 'table') {
      var mi = R.nz(-4, 5), xs = [-1, 0, 1, 2, 3].slice(R.int(0, 1), R.int(4, 5)), ys = xs.map(function (x) { return mi * x + b; });
      return { q: 'Write the equation of the line in slope-intercept form.' + hTable('x', 'y', xs, ys), a: { t: 'eq', v: 'y = ' + linNice(mi, b), form: 'slope' },
        steps: ['$b$ is the value of $y$ when $x = 0$: $b = ' + b + '$.', 'Each time $x$ goes up 1, $y$ changes by ' + mi + ', so $m = ' + mi + '$.', 'Equation: $y = ' + linTex(mi, b) + '$.'], hint: 'Find the column where x = 0.', chk: { t: 'line', m: String(mi), b: String(b), pts: xs.map(function (x, i) { return [x, ys[i]]; }) } };
    }
    var mt = R.nz(-6, 6), bt = R.intNot(-9, 9, [0, mt, -mt]); if (Math.abs(mt) === 1) mt = mt * 2;
    return { q: 'What is the $y$-intercept of $y = ' + bt + ' ' + (mt < 0 ? '-' : '+') + ' ' + Math.abs(mt) + 'x$?', a: mcq(m$(String(bt)), [m$(String(mt)), m$(String(-bt)), m$(String(Q(-bt, mt).toTex()))]),
      steps: ['Rewrite in the usual order: $y = ' + T.lin(mt, 'x', bt) + '$.', 'The $y$-intercept is the constant term: $b = ' + bt + '$ (the line crosses the $y$-axis at $(0, ' + bt + ')$).', 'The slope is $' + mt + '$, the number multiplying $x$, even though it is written second.'], hint: 'What is y when x = 0?', chk: { t: 'mcval', a: String(bt), right: String(bt), wrong: [String(mt), String(-bt), String(-bt / mt)] } };
  });

  G('g8.linear-nonlinear', function (R, ctx) {
    var kind = R.pick(by(ctx, ['table', 'eq', 'ctx', 'table'], ['table', 'eq', 'ctx', 'trick'], ['trick', 'eq', 'table', 'uneven']));
    var LN = ['linear', 'nonlinear'];
    if (kind === 'table' || kind === 'trick' || kind === 'uneven') {
      var lin = R.coin(), xs = kind === 'uneven' ? [0, 1, 3, 4, 7] : [0, 1, 2, 3, 4], ys, why;
      var m = R.nz(-4, 5), b = R.int(-5, 10);
      if (lin) { ys = xs.map(function (x) { return m * x + b; }); why = kind === 'uneven' ? ['The $x$-steps are not equal (1, 2, 1, 3), so compare change in $y$ ÷ change in $x$.', 'Every pair gives $' + m + '$: for example $\\frac{' + (ys[2] - ys[1]) + '}{2} = ' + m + '$.', 'A constant rate of change: linear.'] : ['Each time $x$ goes up 1, $y$ changes by ' + m + ', every time.', 'A constant rate of change: linear.']; }
      else if (kind === 'trick') { var d = R.int(2, 4); ys = [b, b + d, b + 2 * d, b + 3 * d + R.pick([1, 2, -1]), b + 4 * d + 3]; why = ['The first steps change by ' + d + ' each, which looks linear.', 'But from $x = 2$ to $x = 3$, $y$ changes by ' + (ys[3] - ys[2]) + ', not ' + d + '.', 'The rate is not constant, so it is nonlinear. Check every step, not just the first two.']; }
      else { var c = R.int(-3, 6); ys = xs.map(function (x) { return x * x + c; }); why = ['The changes in $y$ are ' + ys.slice(1).map(function (y, i) { return y - ys[i]; }).join(', ') + '.', 'The rate of change is not constant, so it is nonlinear (these are squares plus ' + c + ').']; }
      return { q: 'Is the function in the table linear or nonlinear?' + hTable('x', 'y', xs, ys), a: { t: 'mc', choices: LN.slice(), v: lin ? 0 : 1, keep: true }, steps: why, hint: 'Find the change in y for each step in x. Is the rate the same every time?', chk: { t: 'linTable', xs: xs, ys: ys, lin: lin } };
    }
    if (kind === 'eq') {
      var lins = ['y = ' + T.lin(R.nz(-5, 5), 'x', R.int(-9, 9)), 'y = \\dfrac{x}{' + R.int(2, 5) + '}', 'y = ' + R.int(2, 9) + ' - ' + R.int(2, 6) + 'x', 'y = -x', '2x + 3y = ' + R.int(1, 12), 'y = ' + R.int(1, 9)];
      var nons = ['y = x^{2}' + T.signed(R.int(-5, 5)), 'y = \\dfrac{' + R.int(2, 9) + '}{x}', 'y = ' + R.int(2, 5) + '^{x}', 'y = x^{3}', 'y = \\sqrt{x}', 'y = x(x + ' + R.int(1, 5) + ')'];
      var askLin = R.coin();
      if (askLin) return { q: 'Which equation describes a <b>linear</b> function?', a: mcq(m$(R.pick(lins)), R.sample(nons, 3).map(m$)), steps: ['A linear function can be written $y = mx + b$: $x$ appears only to the first power, not squared, under a root, in an exponent or in a denominator.', 'Only one choice fits that form.'], hint: 'Look for x to the first power only.', chk: { t: 'ok' } };
      return { q: 'Which equation describes a <b>nonlinear</b> function?', a: mcq(m$(R.pick(nons)), R.sample(lins, 3).map(m$)), steps: ['The others can all be written as $y = mx + b$ (a constant rate of change).', 'The nonlinear one has $x$ squared, cubed, under a root, in an exponent, or in a denominator.'], hint: 'Which one cannot be written as y = mx + b?', chk: { t: 'ok' } };
    }
    var Cx = R.pick([['the area of a square as a function of its side length', false, 'Area = side², so doubling the side multiplies the area by 4. Not a constant rate.'],
      ['the perimeter of a square as a function of its side length', true, 'Perimeter = 4 × side: it goes up 4 for each 1 added to the side.'],
      ['the cost of tickets at \\$9 each as a function of the number of tickets', true, 'The cost goes up \\$9 for each ticket: a constant rate.'],
      ['money in an account that doubles every year, as a function of the number of years', false, 'Doubling adds more each year (1, 2, 4, 8, …), not the same amount.'],
      ['the distance traveled at a steady 50 miles per hour as a function of time', true, 'The distance goes up 50 miles each hour.'],
      ['the volume of a cube as a function of its edge length', false, 'Volume = edge³, which grows faster and faster.'],
      ['the temperature in °F as a function of the temperature in °C', true, '°F = 1.8 × °C + 32, which has the form y = mx + b.']]);
    return { q: 'Think about ' + Cx[0] + '. Is this function linear or nonlinear?', a: { t: 'mc', choices: LN.slice(), v: Cx[1] ? 0 : 1, keep: true }, steps: [Cx[2], 'So it is ' + (Cx[1] ? 'linear' : 'nonlinear') + '.'], hint: 'Does it change by the same amount for each step of 1?', chk: { t: 'ok' } };
  });

  G('g8.compare-functions', function (R, ctx) {
    var kind = R.pick(by(ctx, ['rate', 'start', 'rate'], ['rate', 'start', 'diff', 'rate'], ['rate', 'start', 'diff', 'graph']));
    var m1 = R.pick([2, 3, 4, 5, 6, 1.5, 2.5, 10, 12, 15]), m2 = R.pick([2, 3, 4, 5, 6, 1.5, 2.5, 10, 12, 15].filter(function (z) { return z !== m1; }));
    var b1 = R.int(0, 30), b2 = R.intNot(0, 30, b1), nm = names(R, 2);
    var eqA = 'y = ' + T.lin(U.numStr(m1), 'x', b1);
    var off = kind === 'start' ? 0 : R.int(0, 1), xs = [0, 2, 4, 6].map(function (x) { return x + off; }), ys = xs.map(function (x) { return U.fix(m2 * x + b2); });
    var form = kind === 'graph' ? 'graph' : R.pick(['table', 'words', 'points']), Bdesc, viz = null;
    if (form === 'table') Bdesc = nm[1] + '’s savings are shown in the table ($x$ = weeks, $y$ = dollars).' + hTable('x', 'y', xs, ys);
    else if (form === 'words') Bdesc = nm[1] + ' starts with \\$' + b2 + ' and saves \\$' + U.numStr(m2) + ' each week.';
    else if (form === 'points') Bdesc = nm[1] + '’s savings: \\$' + ys[1] + ' after ' + xs[1] + ' weeks and \\$' + ys[3] + ' after ' + xs[3] + ' weeks, growing at a steady rate.';
    else {
      m1 = R.int(1, 4); m2 = R.intNot(1, 4, m1); b1 = R.int(0, 8); b2 = R.intNot(0, 8, b1); eqA = 'y = ' + T.lin(m1, 'x', b1);
      Bdesc = nm[1] + '’s savings are shown in the graph ($x$ = weeks, $y$ = dollars).';
      viz = plot({ xmin: 0, xmax: 8, ymin: 0, ymax: 8 + 4 * m2 + b2 > 40 ? 40 : 30, xstep: 1, ystep: 5, equal: false, xlabel: 'weeks', ylabel: 'dollars', height: 280, lines: [{ p: [[0, b2], [4, b2 + 4 * m2]], color: 'blue', ray: true }], points: [{ x: 0, y: b2, color: 'red' }, { x: 4, y: b2 + 4 * m2, color: 'red', coords: true }] }, 'A line graph of savings');
    }
    var q0 = nm[0] + '’s savings follow $' + eqA + '$ ($x$ = weeks, $y$ = dollars). ' + Bdesc + ' ';
    var mB = form === 'points' ? '\\frac{' + ys[3] + ' - ' + ys[1] + '}{' + xs[3] + ' - ' + xs[1] + '} = ' + U.numStr(m2) : form === 'table' ? '\\frac{' + ys[1] + ' - ' + ys[0] + '}{' + xs[1] + ' - ' + xs[0] + '} = ' + U.numStr(m2) : String(U.numStr(m2));
    var bB = form === 'words' ? 'the amount at the start, \\$' + b2 : form === 'graph' ? 'where the line meets the $y$-axis, \\$' + b2 : form === 'table' && xs[0] === 0 ? 'the $y$-value in the column $x = 0$, \\$' + b2 : 'found by working back from $x = ' + xs[1] + '$: $' + ys[1] + ' - ' + U.numStr(m2) + ' \\cdot ' + xs[1] + ' = ' + b2 + '$, so \\$' + b2;
    var stepsRate = [nm[0] + '’s rate is the coefficient of $x$: ' + U.numStr(m1) + ' dollars per week.', nm[1] + '’s rate: $' + mB + '$ dollars per week' + (form === 'graph' ? ' (from $(0, ' + b2 + ')$ to $(4, ' + (b2 + 4 * m2) + ')$)' : '') + '.'];
    if (kind === 'rate' || kind === 'graph' && R.coin()) return { q: q0 + 'Who saves money faster (has the greater rate of change)?', a: { t: 'mc', choices: [nm[0], nm[1]], v: m1 > m2 ? 0 : 1, keep: true }, viz: viz || undefined,
      steps: stepsRate.concat([(m1 > m2 ? nm[0] : nm[1]) + ' has the greater rate.']), hint: 'Find each rate of change (dollars per week).', chk: { t: 'cmp', x: String(m1), y: String(m2), big: m1 > m2 ? 0 : 1 } };
    if (kind === 'start' || kind === 'graph') return { q: q0 + 'Who started with more money (the greater initial value)?', a: { t: 'mc', choices: [nm[0], nm[1]], v: b1 > b2 ? 0 : 1, keep: true }, viz: viz || undefined,
      steps: [nm[0] + '’s initial value is the constant: \\$' + b1 + '.', nm[1] + '’s initial value is ' + bB + '.', (b1 > b2 ? nm[0] : nm[1]) + ' started with more.'], hint: 'The initial value is y when x = 0.', chk: { t: 'cmp', x: String(b1), y: String(b2), big: b1 > b2 ? 0 : 1 } };
    var diff = U.fix(Math.abs(m1 - m2));
    return { q: q0 + 'How many more dollars per week does the faster saver save?', a: { t: 'num', v: U.numStr(diff) }, viz: viz || undefined,
      steps: stepsRate.concat(['Difference: $' + U.numStr(Math.max(m1, m2)) + ' - ' + U.numStr(Math.min(m1, m2)) + ' = ' + U.numStr(diff) + '$ dollars per week.']), hint: 'Find both rates, then subtract.', chk: { t: 'num', v: 'abs(' + m1 + '-' + m2 + ')', why: 'diff' } };
  });

  G('g8.linear-models', function (R, ctx) {
    var kind = R.pick(by(ctx, ['two', 'predict', 'interpret', 'b'], ['two', 'b', 'predict', 'interpret'], ['two', 'b', 'predict', 'two']));
    var S = R.pick([
      { what: 'A plumber’s bill', x: 'hours', y: 'dollars', m: [30, 90, 5], b: [40, 95, 5], money: true, mean: ['the charge for each hour of work', 'the fixed charge just for coming to the job'] },
      { what: 'A tree’s height', x: 'years after planting', y: 'feet', m: [1, 3, 1], b: [3, 9, 1], money: false, mean: ['how many feet it grows each year', 'its height when it was planted'] },
      { what: 'The water in a tank', x: 'minutes', y: 'gallons', m: [-8, -3, 1], b: [120, 200, 10], money: false, mean: ['how many gallons drain out each minute (as a negative change)', 'how much water was in the tank at the start'] },
      { what: 'A phone plan’s cost', x: 'gigabytes used', y: 'dollars', m: [5, 15, 5], b: [20, 45, 5], money: true, mean: ['the cost for each gigabyte', 'the monthly cost before using any data'] }]);
    function rnd(a) { return a[0] + a[2] * R.int(0, Math.floor((a[1] - a[0]) / a[2])); }
    var m = rnd(S.m), b = rnd(S.b), x1 = R.int(1, 4), x2 = x1 + R.int(1, 4), y1 = m * x1 + b, y2 = m * x2 + b;
    function amt(v) { return S.money ? '\\$' + v : v + ' ' + S.y; }
    var ans = { t: 'eq', v: 'y = ' + linNice(m, b), form: 'slope' };
    if (kind === 'two') return { q: S.what + ' changes at a constant rate. After ' + x1 + ' ' + S.x + ' it is ' + amt(y1) + '; after ' + x2 + ' ' + S.x + ' it is ' + amt(y2) + '. Write an equation $y = mx + b$, where $x$ is ' + S.x + ' and $y$ is ' + S.y + '.', a: ans,
      steps: ['Rate: $m = \\dfrac{' + y2 + ' - ' + y1 + '}{' + x2 + ' - ' + x1 + '} = \\dfrac{' + (y2 - y1) + '}{' + (x2 - x1) + '} = ' + m + '$.', 'Starting value: work back to $x = 0$. $b = ' + y1 + ' - ' + T.p(m) + ' \\cdot ' + x1 + ' = ' + b + '$.', 'Equation: $y = ' + T.lin(m, 'x', b) + '$. Check with the other point: $' + T.p(m) + ' \\cdot ' + x2 + ' + ' + b + ' = ' + y2 + '$.'],
      hint: 'Find the rate from the two points first. Then use one point to find b.', chk: { t: 'line', m: String(m), b: String(b), pts: [[x1, y1], [x2, y2]] } };
    if (kind === 'b') {
      var xs = [x1, x1 + 2, x1 + 4, x1 + 6], ys = xs.map(function (x) { return m * x + b; });
      return { q: S.what + ' is shown in the table (' + S.x + ', ' + S.y + '). It is linear. What is the starting value $b$ (the value at $x = 0$)?' + hTable('x', 'y', xs, ys), a: { t: 'num', v: String(b) },
        steps: ['Rate: $\\dfrac{' + ys[1] + ' - ' + ys[0] + '}{2} = ' + m + '$ per ' + S.x.replace(/s$/, '').replace('gigabytes used', 'gigabyte') + '.', 'The table starts at $x = ' + xs[0] + '$, not 0, so ' + ys[0] + ' is not the starting value.', 'Go back ' + xs[0] + ' steps: $b = ' + ys[0] + ' - ' + T.p(m) + ' \\cdot ' + xs[0] + ' = ' + b + '$.'],
        hint: 'The first column is not at x = 0. Work backward using the rate.', chk: { t: 'num', v: ys[0] + '-(' + (ys[1] - ys[0]) + '/2)*' + xs[0], why: 'back' } };
    }
    if (kind === 'predict') {
      var xp = x2 + R.int(1, 5), yp = m * xp + b;
      return { q: S.what + ' is modeled by $y = ' + T.lin(m, 'x', b) + '$, where $x$ is ' + S.x + ' and $y$ is ' + S.y + '. What does the model predict when $x = ' + xp + '$?', a: { t: 'num', v: String(yp) },
        steps: ['Put $x = ' + xp + '$ into the model: $y = ' + T.p(m) + ' \\cdot ' + xp + ' + ' + b + '$.', '$y = ' + m * xp + ' + ' + b + ' = ' + yp + '$ ' + S.y + '.'], hint: 'Substitute x = ' + xp + '.', chk: { t: 'num', v: m + '*' + xp + '+' + b, why: 'predict' } };
    }
    var askB = R.coin();
    return { q: S.what + ' is modeled by $y = ' + T.lin(m, 'x', b) + '$, where $x$ is ' + S.x + ' and $y$ is ' + S.y + '. What does the number ' + (askB ? b : m) + ' mean?', a: mcq(askB ? S.mean[1] : S.mean[0], [askB ? S.mean[0] : S.mean[1], 'the total after ' + (askB ? b : Math.abs(m)) + ' ' + S.x, 'the number of ' + S.x]),
      steps: ['In $y = mx + b$, $m$ is the rate (change in $y$ for each 1 of $x$) and $b$ is the value when $x = 0$.', askB ? 'So ' + b + ' is ' + S.mean[1] + '.' : 'So ' + m + ' is ' + S.mean[0] + '.'], hint: askB ? 'What is y when x = 0?' : 'How much does y change when x goes up by 1?', chk: { t: 'ok' } };
  });


  // ================================================================ Unit 6: systems of linear equations
  function sysLine(R, x0, y0, avoidM) { // a line through (x0, y0) as {m, b, tex, plain} in slope-intercept form, with |b| <= 7
    for (var t = 0; t < 60; t++) {
      var m = R.pick([1, 2, 3, -1, -2, -3, Q(1, 2), Q(-1, 2)]); m = Q.from(m);
      if (avoidM && m.eq(avoidM)) continue;
      var b = Q(y0).sub(m.mul(x0)); if (!b.isInt() || Math.abs(b.num()) > 7) continue;
      return { m: m, b: b.num(), tex: 'y = ' + linTex(m, b.num()), plain: 'y=' + linNice(m, b.num()) };
    }
    return { m: Q(avoidM && avoidM.eq(1) ? 2 : 1), b: y0 - x0 * (avoidM && avoidM.eq(1) ? 2 : 1), tex: 'y = ' + linTex(avoidM && avoidM.eq(1) ? 2 : 1, y0 - x0 * (avoidM && avoidM.eq(1) ? 2 : 1)), plain: 'y=' + linNice(avoidM && avoidM.eq(1) ? 2 : 1, y0 - x0 * (avoidM && avoidM.eq(1) ? 2 : 1)) };
  }
  function stdLine(R, x0, y0) { // a x + b y = c through (x0, y0)
    var a = R.nz(-4, 5), b = R.nz(-4, 5); if (a === b) b = -b; var c = a * x0 + b * y0;
    return { a: a, b: b, c: c, tex: T.terms([[a, 'x'], [b, 'y']]) + ' = ' + c, plain: a + '*x+(' + b + ')*y=' + c };
  }
  function sysTex(e1, e2) { return '\\begin{cases} ' + e1 + ' \\\\ ' + e2 + ' \\end{cases}'; }
  function satisfies(L, p) { return L.a !== undefined ? L.a * p[0] + L.b * p[1] === L.c : L.m.mul(p[0]).add(L.b).eq(p[1]); }

  G('g8.systems-meaning', function (R, ctx) {
    var kind = R.pick(by(ctx, ['check', 'which', 'graph'], ['check', 'which', 'graph', 'check'], ['check', 'which', 'graph']));
    var x0 = R.int(-4, 4), y0 = R.int(-4, 4), L1 = sysLine(R, x0, y0), L2 = ctx.level > 1 && R.coin() ? stdLine(R, x0, y0) : sysLine(R, x0, y0, L1.m);
    if (L2.a !== undefined && L1.m.eq(Q(-L2.a, L2.b))) L2 = sysLine(R, x0, y0, L1.m);
    var on1 = [x0 + L1.m.den() * 2, null]; on1[1] = L1.m.mul(on1[0]).add(L1.b).num();
    var on2; if (L2.a !== undefined) { on2 = [x0 + L2.b, y0 - L2.a]; } else { on2 = [x0 - L2.m.den() * 2, null]; on2[1] = L2.m.mul(on2[0]).add(L2.b).num(); }
    var nei = [x0 + 1, y0 + 2]; while (satisfies(L1, nei) || satisfies(L2, nei)) nei = [nei[0] + 1, nei[1] - 3];
    var S = sysTex(L1.tex, L2.tex);
    function sub(L, p) { return L.a !== undefined ? '$' + T.terms([[L.a, '(' + p[0] + ')'], [L.b, '(' + p[1] + ')']]).replace(/\((-?\d+)\)/g, function (mm, d) { return d < 0 ? '(' + d + ')' : d; }) + ' = ' + (L.a * p[0] + L.b * p[1]) + '$' + (satisfies(L, p) ? ', which equals ' + L.c + '. True.' : ', not ' + L.c + '. False.') : '$' + linTex(L.m, L.b).replace(/x/, '(' + p[0] + ')') + ' = ' + L.m.mul(p[0]).add(L.b).toTex() + '$' + (satisfies(L, p) ? ', which is the $y$-value ' + p[1] + '. True.' : ', but $y$ is ' + p[1] + '. False.'); }
    if (kind === 'check') {
      var which = R.pick(['both', 'one', 'two', 'none']), P = which === 'both' ? [x0, y0] : which === 'one' ? on1 : which === 'two' ? on2 : nei, ok = which === 'both';
      return { q: 'Is $' + ptT(P[0], P[1]) + '$ a solution of this system? $$' + S + '$$', a: { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true },
        steps: ['A solution must make <b>both</b> equations true. Substitute $x = ' + P[0] + '$, $y = ' + P[1] + '$.', 'First equation: ' + sub(L1, P), 'Second equation: ' + sub(L2, P), ok ? 'Both are true, so yes: the point is on both lines.' : 'It is not true for both, so no.'],
        hint: 'Substitute into each equation. It must work in both.', chk: { t: 'sysPt', eqs: [L1.plain, L2.plain], pt: P, both: ok } };
    }
    if (kind === 'which') {
      var pts = [[x0, y0], on1, on2, nei], labs = pts.map(function (p) { return m$(ptT(p[0], p[1])); });
      return { q: 'Which point is a solution of the system? $$' + S + '$$', a: mcq(labs[0], labs.slice(1)),
        steps: ['Test each point in both equations.', '$' + ptT(on1[0], on1[1]) + '$ works only in the first equation, and $' + ptT(on2[0], on2[1]) + '$ only in the second.', '$' + ptT(x0, y0) + '$ works in both. First: ' + sub(L1, [x0, y0]), 'Second: ' + sub(L2, [x0, y0])],
        hint: 'A solution has to make both equations true.', chk: { t: 'sysPt', eqs: [L1.plain, L2.plain], pt: [x0, y0], both: true, others: [on1, on2, nei] } };
    }
    var L2g = sysLine(R, x0, y0, L1.m), on2g = [x0 - L2g.m.den() * 2, null]; on2g[1] = L2g.m.mul(on2g[0]).add(L2g.b).num();
    if (Math.abs(on1[0]) > 6 || Math.abs(on1[1]) > 7) { on1 = [x0 - L1.m.den() * 2, null]; on1[1] = L1.m.mul(on1[0]).add(L1.b).num(); }
    if (Math.abs(on2g[0]) > 6 || Math.abs(on2g[1]) > 7) { on2g = [x0 + L2g.m.den() * 2, null]; on2g[1] = L2g.m.mul(on2g[0]).add(L2g.b).num(); }
    var ptsG = R.shuffle([[x0, y0, 'both'], [on1[0], on1[1], 'one'], [on2g[0], on2g[1], 'two']]), labsG = ['A', 'B', 'C'];
    return { q: 'The graph shows the system $' + L1.tex + '$ (blue) and $' + L2g.tex + '$ (red). Which point is the solution of the system?', a: { t: 'mc', choices: labsG.slice(), v: ptsG.map(function (p) { return p[2]; }).indexOf('both'), keep: true },
      viz: plot({ xmin: -7, xmax: 7, ymin: -8, ymax: 8, lines: [{ m: L1.m.toNumber(), b: L1.b, color: 'blue' }, { m: L2g.m.toNumber(), b: L2g.b, color: 'red' }], points: ptsG.map(function (p, i) { return { x: p[0], y: p[1], label: labsG[i], color: 'ink' }; }) }, 'Two lines with points A, B and C'),
      steps: ['Each point on a line makes that line’s equation true.', 'A point on only one line solves only one equation.', 'The solution is where the lines cross, point ' + labsG[ptsG.map(function (p) { return p[2]; }).indexOf('both')] + ' at $' + ptT(x0, y0) + '$, because it is on both lines.'],
      hint: 'Which point is on both lines?', chk: { t: 'sysPt', eqs: [L1.plain, L2g.plain], pt: [x0, y0], both: true } };
  });

  G('g8.systems-graphing', function (R, ctx) {
    var kind = R.pick(by(ctx, ['read', 'read', 'trap'], ['read', 'trap', 'read'], ['read', 'trap', 'read']));
    var x0 = R.int(-4, 4), y0 = R.int(-4, 4), L1 = sysLine(R, x0, y0), L2 = sysLine(R, x0, y0, L1.m);
    if (kind === 'read') return { q: 'Solve the system by graphing. The graph shows $' + L1.tex + '$ (blue) and $' + L2.tex + '$ (red). What is the solution?', a: { t: 'tuple', v: [String(x0), String(y0)] },
      viz: plot({ xmin: -7, xmax: 7, ymin: -8, ymax: 8, lines: [{ m: L1.m.toNumber(), b: L1.b, color: 'blue' }, { m: L2.m.toNumber(), b: L2.b, color: 'red' }] }, 'Two lines that cross'),
      steps: ['The solution is the point where the lines cross.', 'Read it from the grid: $x = ' + x0 + '$ and $y = ' + y0 + '$.', 'Check in both equations: $' + linTex(L1.m, L1.b).replace('x', '(' + x0 + ')') + ' = ' + y0 + '$ and $' + linTex(L2.m, L2.b).replace('x', '(' + x0 + ')') + ' = ' + y0 + '$. The solution is $' + ptT(x0, y0) + '$.'],
      hint: 'Give both coordinates of the crossing point, like (2, −1).', chk: { t: 'sys', eqs: [L1.plain, L2.plain], sol: [String(x0), String(y0)] } };
    var who = names(R)[0];
    return { q: 'Two lines cross at $' + ptT(x0, y0) + '$. ' + who + ' says the solution of the system is $x = ' + x0 + '$. What is the complete solution?', a: mcq(m$(ptT(x0, y0)), [m$('x = ' + x0), m$('y = ' + y0), m$(ptT(y0, x0))].filter(function (z) { return z !== m$(ptT(x0, y0)); })),
      steps: ['A solution of a system in two variables is a pair of values: one for $x$ and one for $y$.', 'The crossing point gives both: $x = ' + x0 + '$ and $y = ' + y0 + '$.', 'So the solution is the ordered pair $' + ptT(x0, y0) + '$, with $x$ first.'], hint: 'A point has two coordinates.', chk: { t: 'ok' } };
  });

  G('g8.systems-substitution', function (R, ctx) {
    var kind = R.pick(by(ctx, ['yform', 'equal', 'yform'], ['yform', 'equal', 'xform', 'mc'], ['solveone', 'xform', 'yform', 'mc']));
    var x0 = R.intNot(-6, 6, 0), y0 = R.int(-6, 6), eqs, tex, st;
    if (kind === 'yform') {
      var m = R.nz(-4, 4), b = y0 - m * x0, a = R.nz(-5, 5), c = R.intNot(-5, 5, [0]); if (a + c * m === 0) a = a + 1 === 0 ? 2 : a + 1; var d = a * x0 + c * y0;
      tex = sysTex('y = ' + T.lin(m, 'x', b), T.terms([[a, 'x'], [c, 'y']]) + ' = ' + d); eqs = ['y=' + m + '*x+(' + b + ')', a + '*x+(' + c + ')*y=' + d];
      var A = a + c * m, B = c * b;
      st = ['The first equation says $y = ' + T.lin(m, 'x', b) + '$. Replace $y$ in the second equation with that expression:', '$' + T.coef(a, 'x') + ' ' + (c < 0 ? '-' : '+') + ' ' + (Math.abs(c) === 1 ? '' : Math.abs(c)) + '(' + T.lin(m, 'x', b) + ') = ' + d + '$', 'Distribute and combine: $' + T.lin(A, 'x', B) + ' = ' + d + '$.'].concat(solveSteps('x', A, B, d));
      st.push('Find $y$ with the first equation: $y = ' + T.p(m) + ' \\cdot ' + T.p(x0) + T.signed(b) + ' = ' + y0 + '$.');
    } else if (kind === 'equal') {
      var m1 = R.nz(-4, 4), m2 = R.intNot(-4, 4, [0, m1]), b1 = y0 - m1 * x0, b2 = y0 - m2 * x0;
      tex = sysTex('y = ' + T.lin(m1, 'x', b1), 'y = ' + T.lin(m2, 'x', b2)); eqs = ['y=' + m1 + '*x+(' + b1 + ')', 'y=' + m2 + '*x+(' + b2 + ')'];
      st = ['Both expressions equal $y$, so set them equal: $' + T.lin(m1, 'x', b1) + ' = ' + T.lin(m2, 'x', b2) + '$.', (m2 > 0 ? 'Subtract $' + T.mono(m2, 'x') + '$ from' : 'Add $' + T.mono(-m2, 'x') + '$ to') + ' both sides: $' + T.lin(m1 - m2, 'x', b1) + ' = ' + b2 + '$.'].concat(solveSteps('x', m1 - m2, b1, b2));
      st.push('Then $y = ' + T.p(m1) + ' \\cdot ' + T.p(x0) + T.signed(b1) + ' = ' + y0 + '$.');
    } else if (kind === 'xform') {
      var p = R.nz(-3, 3), q = x0 - p * y0, a2 = R.nz(-4, 4), c2 = R.nz(-4, 4); if (a2 * p + c2 === 0) c2 = c2 + 1 === 0 ? 2 : c2 + 1; var d2 = a2 * x0 + c2 * y0;
      tex = sysTex('x = ' + T.lin(p, 'y', q), T.terms([[a2, 'x'], [c2, 'y']]) + ' = ' + d2); eqs = ['x=' + p + '*y+(' + q + ')', a2 + '*x+(' + c2 + ')*y=' + d2];
      var A2 = a2 * p + c2, B2 = a2 * q;
      st = ['The first equation gives $x$. Substitute it into the second: $' + (a2 === 1 ? '' : a2 === -1 ? '-' : a2) + '(' + T.lin(p, 'y', q) + ')' + T.coef(c2, 'y', false) + ' = ' + d2 + '$.', 'Distribute and combine: $' + T.lin(A2, 'y', B2) + ' = ' + d2 + '$.'].concat(solveSteps('y', A2, B2, d2));
      st.push('Then $x = ' + T.p(p) + ' \\cdot ' + T.p(y0) + T.signed(q) + ' = ' + x0 + '$.');
    } else if (kind === 'solveone') {
      var bb = R.nz(-3, 3), cc = x0 + bb * y0, aa = R.intNot(-4, 5, [0]), dd = R.nz(-4, 4); if (dd - aa * bb === 0) dd = dd + 1 === 0 ? 2 : dd + 1; var ee = aa * x0 + dd * y0;
      tex = sysTex(T.terms([[1, 'x'], [bb, 'y']]) + ' = ' + cc, T.terms([[aa, 'x'], [dd, 'y']]) + ' = ' + ee); eqs = ['x+(' + bb + ')*y=' + cc, aa + '*x+(' + dd + ')*y=' + ee];
      var A3 = dd - aa * bb, B3 = aa * cc;
      st = ['Solve the first equation for $x$ (its coefficient is 1): $x = ' + T.lin(-bb, 'y', cc) + '$.', 'Substitute into the second: $' + (aa === 1 ? '' : aa === -1 ? '-' : aa) + '(' + T.lin(-bb, 'y', cc) + ')' + T.coef(dd, 'y', false) + ' = ' + ee + '$.', 'Distribute and combine: $' + T.lin(A3, 'y', B3) + ' = ' + ee + '$.'].concat(solveSteps('y', A3, B3, ee));
      st.push('Then $x = ' + T.lin(-bb, '(' + y0 + ')', cc).replace(/\((\-?\d+)\)/, function (mm, d) { return T.p(+d); }) + ' = ' + x0 + '$.');
    } else {
      var m3 = R.int(2, 4), b3 = R.nz(-5, 5), a3 = R.int(2, 5), who = names(R)[0], xs3 = R.intNot(-3, 4, 0), ys3 = m3 * xs3 + b3, rhs3 = a3 * xs3 + ys3;
      var e1 = 'y = ' + T.lin(m3, 'x', b3), e2 = T.lin(a3, 'x', 0) + ' + y = ' + rhs3;
      return { q: 'To solve $' + sysTex(e1, e2) + '$, ' + who + ' substituted $' + T.lin(m3, 'x', b3) + '$ for $y$ in the first equation and got $' + T.lin(m3, 'x', b3) + ' = ' + T.lin(m3, 'x', b3) + '$. What went wrong?', a: { t: 'mc', choices: ['The expression went back into the equation it came from, which is always true and tells nothing new.', 'Nothing; the system has infinitely many solutions.', 'The first equation should have been solved for $x$ instead.', 'The equations should have been added first.'], v: 0 },
        steps: ['Substituting an expression into the equation it came from always gives something like $a = a$.', 'Substitute into the <b>other</b> equation: $' + T.lin(a3, 'x', 0) + ' + (' + T.lin(m3, 'x', b3) + ') = ' + rhs3 + '$, so $' + T.lin(a3 + m3, 'x', b3) + ' = ' + rhs3 + '$ and $x = ' + xs3 + '$.', 'Then $y = ' + ys3 + '$; the solution is $' + ptT(xs3, ys3) + '$.'], hint: 'Which equation should the expression go into?', chk: { t: 'sys', eqs: ['y=' + m3 + '*x+(' + b3 + ')', a3 + '*x+y=' + rhs3], sol: [String(xs3), String(ys3)] } };
    }
    st.push('Check in both equations: $' + ptT(x0, y0) + '$ works. Solution: $' + ptT(x0, y0) + '$.');
    return { q: 'Solve by substitution: $$' + tex + '$$', a: { t: 'tuple', v: [String(x0), String(y0)] }, steps: st, hint: 'Replace one variable with the expression it equals, from the other equation.', chk: { t: 'sys', eqs: eqs, sol: [String(x0), String(y0)] } };
  });

  G('g8.systems-special-cases', function (R, ctx) {
    var kind = R.pick(by(ctx, ['classify', 'classify', 'kpar', 'meaning'], ['classify', 'kpar', 'kinf', 'meaning'], ['classify', 'kpar', 'kinf', 'classify']));
    var CH = ['exactly one solution', 'no solution', 'infinitely many solutions'];
    if (kind === 'classify') {
      var type = R.pick(['one', 'none', 'inf']), m = R.nz(-4, 4), b = R.int(-6, 6), e1, e2, plain, st;
      var kk = R.int(2, 3), A = -m * kk, B = kk; // A x + B y = C  is  y = m x + C/B
      if (type === 'one') { var m2 = R.intNot(-4, 4, [0, m]); e1 = 'y = ' + T.lin(m, 'x', b); var c2 = R.int(-6, 6); e2 = 'y = ' + T.lin(m2, 'x', c2); st = ['The slopes are $' + m + '$ and $' + m2 + '$: different, so the lines cross at exactly one point.']; plain = [m, b, m2, c2]; }
      else {
        var C = type === 'inf' ? b * kk : R.intNot(-12, 12, b * kk);
        e1 = 'y = ' + T.lin(m, 'x', b); e2 = T.terms([[A, 'x'], [B, 'y']]) + ' = ' + C;
        st = ['Solve the second equation for $y$: $' + B + 'y = ' + T.lin(-A, 'x', C) + '$, so $y = ' + linTex(Q(-A, B), Q(C, B)) + '$.', 'Both lines have slope $' + m + '$.', type === 'inf' ? 'The intercepts match too (both $' + b + '$), so they are the same line: every point on it is a solution.' : 'The intercepts are different ($' + b + '$ and $' + T.num(Q(C, B)) + '$), so the lines are parallel and never meet.'];
        plain = [m, b, m, Q(C, B).toPlain()];
      }
      return { q: 'How many solutions does this system have? $$' + sysTex(e1, e2) + '$$', a: { t: 'mc', choices: CH.slice(), v: type === 'one' ? 0 : type === 'none' ? 1 : 2, keep: true }, steps: st.concat(['So the system has ' + CH[type === 'one' ? 0 : type === 'none' ? 1 : 2] + '.']), hint: 'Write both in y = mx + b form and compare slopes and intercepts.', chk: { t: 'sysCount', l: plain, type: type } };
    }
    if (kind === 'kpar') {
      var m3 = R.nz(-5, 6), b3 = R.int(-6, 6), b4 = R.intNot(-8, 8, b3);
      return { q: 'For what value of $k$ does this system have <b>no</b> solution? $$' + sysTex('y = ' + T.lin(m3, 'x', b3), 'y = kx' + T.signed(b4)) + '$$', a: { t: 'num', v: String(m3) },
        steps: ['No solution means the lines are parallel: same slope, different intercepts.', 'The intercepts ' + b3 + ' and ' + b4 + ' are already different.', 'So the slopes must match: $k = ' + m3 + '$.'], hint: 'Parallel lines have the same slope.', chk: { t: 'sysCount', l: [m3, b3, m3, b4], type: 'none' } };
    }
    if (kind === 'kinf') {
      var a = R.nz(-4, 5), bb = R.int(1, 4), c = R.nz(-9, 9), f = R.int(2, 4);
      return { q: 'For what value of $c$ does this system have <b>infinitely many</b> solutions? $$' + sysTex(T.terms([[a, 'x'], [bb, 'y']]) + ' = ' + c, T.terms([[a * f, 'x'], [bb * f, 'y']]) + ' = c') + '$$', a: { t: 'num', v: String(c * f) },
        steps: ['The left side of the second equation is ' + f + ' times the left side of the first.', 'For the two equations to describe the same line, the right side must be ' + f + ' times as well.', '$c = ' + f + ' \\cdot ' + T.p(c) + ' = ' + c * f + '$'], hint: 'What number turns the first equation into the second?', chk: { t: 'sysCount', l: [Q(-a, bb).toPlain(), Q(c, bb).toPlain(), Q(-a * f, bb * f).toPlain(), Q(c * f, bb * f).toPlain()], type: 'inf' } };
    }
    var stmt = R.coin() ? [R.int(2, 9), null] : [null, null], n1 = R.int(1, 9), n2 = R.intNot(1, 9, n1), same = R.coin();
    return { q: 'While solving a system by substitution, the variables cancel and you get $' + n1 + ' = ' + (same ? n1 : n2) + '$. What does that mean?', a: { t: 'mc', choices: CH.concat(['You made a mistake.']), v: same ? 2 : 1, keep: true },
      steps: ['When the variables cancel, the result no longer depends on $x$ or $y$.', same ? '$' + n1 + ' = ' + n1 + '$ is always true, so every point on the line works: the equations describe the same line.' : '$' + n1 + ' = ' + n2 + '$ is never true, so no point works: the lines are parallel.', 'So the system has ' + (same ? 'infinitely many solutions' : 'no solution') + '. It is not a mistake.'], hint: 'Is the statement true or false? Does it depend on x?', chk: { t: 'ok' } };
  });

  G('g8.systems-word-problems', function (R, ctx) {
    var kind = R.pick(by(ctx, ['tickets', 'plans', 'sum'], ['tickets', 'plans', 'items', 'sum'], ['tickets', 'plans', 'items', 'items']));
    if (kind === 'tickets' || kind === 'items') {
      var S = kind === 'tickets' ? R.pick([['adult tickets', 'student tickets', 'A school play sold', 'tickets'], ['adult tickets', 'child tickets', 'A museum sold', 'tickets']]) : R.pick([['notebooks', 'pens', 'A student bought', 'items'], ['large pizzas', 'small pizzas', 'A team ordered', 'pizzas'], ['two-point baskets', 'three-point baskets', 'A player made', 'baskets']]);
      var pa = kind === 'tickets' ? R.int(6, 12) : S[0] === 'two-point baskets' ? 2 : R.int(4, 15), pb = kind === 'tickets' ? R.int(2, pa - 2) : S[0] === 'two-point baskets' ? 3 : R.intNot(2, 12, pa);
      var x = R.int(kind === 'tickets' ? 20 : 2, kind === 'tickets' ? 90 : 12), y = R.int(kind === 'tickets' ? 20 : 2, kind === 'tickets' ? 90 : 12), n = x + y, tot = pa * x + pb * y;
      var unitA = S[0] === 'two-point baskets' ? '' : '\\$', isPts = S[0] === 'two-point baskets';
      var q = S[2] + ' ' + n + ' ' + S[3] + (isPts ? ' for ' + tot + ' points.' : ' for \\$' + tot + '.') + (isPts ? '' : ' ' + S[0].charAt(0).toUpperCase() + S[0].slice(1) + ' cost \\$' + pa + ' each and ' + S[1] + ' cost \\$' + pb + ' each.') + ' How many of each?';
      if (isPts) q = 'A basketball player made ' + n + ' baskets and scored ' + tot + ' points, all from two-point and three-point baskets. How many of each did the player make?';
      var aL = isPts ? 'a' : 'a', vA = S[0].split(' ')[0].charAt(0);
      return { q: q, a: { t: 'multi', parts: [{ label: S[0] + ':', a: { t: 'num', v: String(x), form: 'int' } }, { label: S[1] + ':', a: { t: 'num', v: String(y), form: 'int' } }] },
        steps: ['Let $a$ = number of ' + S[0] + ' and $b$ = number of ' + S[1] + '.', 'Count: $a + b = ' + n + '$. ' + (isPts ? 'Points' : 'Money') + ': $' + pa + 'a + ' + pb + 'b = ' + tot + '$.', 'From the first equation, $b = ' + n + ' - a$. Substitute: $' + pa + 'a + ' + pb + '(' + n + ' - a) = ' + tot + '$.', 'Simplify: $' + T.lin(pa - pb, 'a', pb * n) + ' = ' + tot + '$, so $' + T.mono(pa - pb, 'a') + ' = ' + (tot - pb * n) + '$ and $a = ' + x + '$.', 'Then $b = ' + n + ' - ' + x + ' = ' + y + '$. Check: $' + pa + ' \\cdot ' + x + ' + ' + pb + ' \\cdot ' + y + ' = ' + tot + '$.'],
        hint: 'Write one equation for the count and one for the ' + (isPts ? 'points' : 'money') + '.', chk: { t: 'sys', eqs: ['x+y=' + n, pa + '*x+' + pb + '*y=' + tot], sol: [String(x), String(y)], parts: true } };
    }
    if (kind === 'plans') {
      var m1 = R.int(2, 8) * 5, m2 = R.int(1, m1 / 5 - 1) * 5, xs = R.int(2, 12), b2 = R.int(4, 20) * 5, b1 = b2 + (m2 - m1) * xs;
      if (b1 < 0) { b2 = b2 + (-b1) + 5; b1 = b2 + (m2 - m1) * xs; }
      var cost = m1 * xs + b1, P = R.pick([['Gym A', 'Gym B', 'month', 'months', 'a joining fee'], ['Plan A', 'Plan B', 'hour', 'hours', 'a setup fee'], ['Rental A', 'Rental B', 'day', 'days', 'a flat fee']]);
      return { q: P[0] + ' charges ' + (b1 ? '\\$' + b1 + ' plus ' : '') + '\\$' + m1 + ' per ' + P[2] + '. ' + P[1] + ' charges \\$' + b2 + ' plus \\$' + m2 + ' per ' + P[2] + '. After how many ' + P[3] + ' do they cost the same, and what is that cost?', a: { t: 'multi', parts: [{ label: P[3] + ':', a: { t: 'num', v: String(xs) } }, { label: 'cost (\\$):', a: { t: 'num', v: String(cost) } }] },
        steps: ['Let $x$ = ' + P[3] + ' and $y$ = cost. ' + P[0] + ': $y = ' + T.lin(m1, 'x', b1) + '$. ' + P[1] + ': $y = ' + T.lin(m2, 'x', b2) + '$.', 'Same cost: $' + T.lin(m1, 'x', b1) + ' = ' + T.lin(m2, 'x', b2) + '$.', 'Subtract $' + m2 + 'x$ and ' + (b1 ? b1 : '0') + ': $' + (m1 - m2) + 'x = ' + (b2 - b1) + '$, so $x = ' + xs + '$.', 'Cost: $y = ' + m1 + ' \\cdot ' + xs + T.signed(b1) + ' = ' + cost + '$. Both cost \\$' + cost + ' after ' + xs + ' ' + P[3] + '.'],
        hint: 'Write a cost equation for each, then set them equal.', chk: { t: 'sys', eqs: ['y=' + m1 + '*x+' + b1, 'y=' + m2 + '*x+' + b2], sol: [String(xs), String(cost)], parts: true } };
    }
    var a = R.int(5, 40), b = R.int(3, a - 1), s = a + b, d = a - b;
    return { q: 'The sum of two numbers is ' + s + ' and their difference is ' + d + '. What are the numbers? (Give the larger one first.)', a: { t: 'multi', parts: [{ label: 'larger:', a: { t: 'num', v: String(a) } }, { label: 'smaller:', a: { t: 'num', v: String(b) } }] },
      steps: ['Let $x$ be the larger and $y$ the smaller: $x + y = ' + s + '$ and $x - y = ' + d + '$.', 'From the second, $x = y + ' + d + '$. Substitute: $(y + ' + d + ') + y = ' + s + '$.', '$2y = ' + (s - d) + '$, so $y = ' + b + '$ and $x = ' + b + ' + ' + d + ' = ' + a + '$.'], hint: 'Write two equations: one for the sum, one for the difference.', chk: { t: 'sys', eqs: ['x+y=' + s, 'x-y=' + d], sol: [String(a), String(b)], parts: true } };
  });


  // ================================================================ Unit 7: transformations, congruence and similarity
  function trP(p, a, b) { return [p[0] + a, p[1] + b]; }
  function reflP(p, L) {
    if (L === 'x') return [p[0], -p[1]]; if (L === 'y') return [-p[0], p[1]]; if (L === 'yx') return [p[1], p[0]]; if (L === 'y-x') return [-p[1], -p[0]];
    if (L.v !== undefined) return [2 * L.v - p[0], p[1]]; return [p[0], 2 * L.h - p[1]];
  }
  function rotP(p, ang, c) { c = c || [0, 0]; var x = p[0] - c[0], y = p[1] - c[1], r = ang === 90 ? [-y, x] : ang === 180 ? [-x, -y] : [y, -x]; return [r[0] + c[0], r[1] + c[1]]; }
  function dilP(p, k, c) { c = c || [0, 0]; k = Q.from(k); return [k.mul(p[0] - c[0]).add(c[0]), k.mul(p[1] - c[1]).add(c[1])]; }
  function lineName(L) { return L === 'x' ? 'the $x$-axis' : L === 'y' ? 'the $y$-axis' : L === 'yx' ? 'the line $y = x$' : L === 'y-x' ? 'the line $y = -x$' : L.v !== undefined ? 'the line $x = ' + L.v + '$' : 'the line $y = ' + L.h + '$'; }
  function rotName(a) { return a === 90 ? '$90^\\circ$ counterclockwise' : a === 180 ? '$180^\\circ$' : '$90^\\circ$ clockwise'; }
  function rotRule(a) { return a === 90 ? '(x, y) \\to (-y, x)' : a === 180 ? '(x, y) \\to (-x, -y)' : '(x, y) \\to (y, -x)'; }
  function tupleA(p) { return { t: 'tuple', v: [Q.from(p[0]).toPlain(), Q.from(p[1]).toPlain()] }; }
  function ptQ(p) { return T.pt([Q.from(p[0]), Q.from(p[1])]); }
  function triPts(R, lim) { // a scalene-looking lattice triangle
    lim = lim || 5;
    for (var t = 0; t < 50; t++) {
      var A = [R.int(-lim, lim), R.int(-lim, lim)], B = [A[0] + R.int(2, 4), A[1] + R.int(-1, 1)], C = [A[0] + R.int(0, 2), A[1] + R.int(2, 4) * (R.coin() ? 1 : -1)];
      var area2 = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]));
      if (area2 >= 4 && [A, B, C].every(function (p) { return Math.abs(p[0]) <= lim + 3 && Math.abs(p[1]) <= lim + 3; })) return [A, B, C];
    }
    return [[1, 1], [4, 1], [1, 3]];
  }
  var VN = ['A', 'B', 'C'];
  function triViz(pts, imgs, label) {
    var polys = [{ pts: pts, color: 'blue', verts: VN }];
    if (imgs) polys.push({ pts: imgs, color: 'red', verts: ['A′', 'B′', 'C′'] });
    var all = pts.concat(imgs || []), mx = Math.max(6, Math.max.apply(null, all.map(function (p) { return Math.max(Math.abs(Q.from(p[0]).toNumber()), Math.abs(Q.from(p[1]).toNumber())); })) + 1);
    return plot({ xmin: -mx, xmax: mx, ymin: -mx, ymax: mx, polys: polys.map(function (pg) { return { pts: pg.pts.map(function (p) { return [Q.from(p[0]).toNumber(), Q.from(p[1]).toNumber()]; }), color: pg.color, verts: pg.verts }; }) }, label || 'A triangle on a coordinate grid');
  }
  function moveWords(a, b) { return (a ? Math.abs(a) + ' unit' + (Math.abs(a) === 1 ? '' : 's') + ' ' + (a > 0 ? 'right' : 'left') : '') + (a && b ? ' and ' : '') + (b ? Math.abs(b) + ' unit' + (Math.abs(b) === 1 ? '' : 's') + ' ' + (b > 0 ? 'up' : 'down') : ''); }

  G('g8.translations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['point', 'point', 'rule', 'vertex'], ['point', 'rule', 'pre', 'vertex', 'prop'], ['rule', 'pre', 'vertex', 'point']));
    var a = R.nz(-7, 7), b = R.nz(-7, 7), P = [R.int(-8, 8), R.int(-8, 8)], Pi = trP(P, a, b), rule = '(x, y) \\to (' + T.lin(1, 'x', a) + ', ' + T.lin(1, 'y', b) + ')';
    if (kind === 'point') return { q: 'Translate the point $P' + ptT(P[0], P[1]) + '$ ' + moveWords(a, b) + '. What are the coordinates of the image $P\'$?', a: tupleA(Pi),
      steps: ['Moving ' + (a > 0 ? 'right adds to' : 'left subtracts from') + ' $x$: $' + P[0] + T.signed(a) + ' = ' + Pi[0] + '$.', 'Moving ' + (b > 0 ? 'up adds to' : 'down subtracts from') + ' $y$: $' + P[1] + T.signed(b) + ' = ' + Pi[1] + '$.', '$P\' = ' + ptT(Pi[0], Pi[1]) + '$'], hint: 'Right/left changes x; up/down changes y.', chk: { t: 'pts', pt: [String(P[0] + a), String(P[1] + b)] } };
    if (kind === 'rule') return { q: 'A translation moves $A' + ptT(P[0], P[1]) + '$ to $A\'' + ptT(Pi[0], Pi[1]) + '$. Write the rule as $(x, y) \\to (x + a, y + b)$. What are $a$ and $b$?', a: { t: 'multi', parts: [{ label: '$a =$', a: { t: 'num', v: String(a) } }, { label: '$b =$', a: { t: 'num', v: String(b) } }] },
      steps: ['$a$ is the change in $x$: $' + Pi[0] + ' - ' + T.p(P[0]) + ' = ' + a + '$.', '$b$ is the change in $y$: $' + Pi[1] + ' - ' + T.p(P[1]) + ' = ' + b + '$.', 'Rule: $' + rule + '$, which moves every point ' + moveWords(a, b) + '.'], hint: 'Subtract: image minus original, for each coordinate.', chk: { t: 'multi', vs: [String(Pi[0] - P[0]), String(Pi[1] - P[1])] } };
    if (kind === 'pre') return { q: 'After the translation $' + rule + '$, the image of point $Q$ is $Q\'' + ptT(Pi[0], Pi[1]) + '$. What are the coordinates of $Q$?', a: tupleA(P),
      steps: ['Undo the translation: subtract what was added.', '$x$: $' + Pi[0] + ' - ' + T.p(a) + ' = ' + P[0] + '$. $y$: $' + Pi[1] + ' - ' + T.p(b) + ' = ' + P[1] + '$.', '$Q = ' + ptT(P[0], P[1]) + '$. Check: $' + ptT(P[0], P[1]) + ' \\to ' + ptT(Pi[0], Pi[1]) + '$.'], hint: 'Work backward: move the opposite way.', chk: { t: 'pts', pt: [String(Pi[0] - a), String(Pi[1] - b)] } };
    if (kind === 'vertex') {
      var tri = triPts(R, 4), a2 = R.nz(-4, 4), b2 = R.nz(-4, 4), j = R.int(0, 2), img = trP(tri[j], a2, b2);
      return { q: 'Triangle $ABC$ is translated by the rule $(x, y) \\to (' + T.lin(1, 'x', a2) + ', ' + T.lin(1, 'y', b2) + ')$. What are the coordinates of $' + VN[j] + '\'$?', a: tupleA(img), viz: triViz(tri),
        steps: ['Read $' + VN[j] + ' = ' + ptT(tri[j][0], tri[j][1]) + '$ from the grid.', 'Apply the rule: $(' + tri[j][0] + T.signed(a2) + ', ' + tri[j][1] + T.signed(b2) + ')$.', '$' + VN[j] + '\' = ' + ptT(img[0], img[1]) + '$'], hint: 'Find the coordinates of ' + VN[j] + ' first.', chk: { t: 'pts', pt: [String(tri[j][0] + a2), String(tri[j][1] + b2)] } };
    }
    return { q: 'A triangle is translated ' + moveWords(a, b) + '. Which statement about the image is true?', a: mcq('It has the same side lengths and angle measures as the original.', ['It is larger than the original.', 'It is flipped, so its corners go around the other way.', 'Its angles change, but its side lengths stay the same.']),
      steps: ['A translation slides every point the same distance in the same direction.', 'Nothing is stretched, turned or flipped, so lengths, angles and the order of the corners stay the same.', 'Only the position changes: the image is congruent to the original.'], hint: 'Think of sliding a paper triangle across a desk.', chk: { t: 'ok' } };
  });

  G('g8.reflections', function (R, ctx) {
    var kind = R.pick(by(ctx, ['axis', 'axis', 'trap', 'vertex'], ['axis', 'yx', 'which', 'trap', 'vertex'], ['line', 'yx', 'which', 'line', 'vertex']));
    var P = [R.nz(-8, 8), R.nz(-8, 8)]; while (Math.abs(P[0]) === Math.abs(P[1])) P[1] = R.nz(-8, 8);
    if (kind === 'axis' || kind === 'yx' || kind === 'line') {
      var L = kind === 'axis' ? R.pick(['x', 'y']) : kind === 'yx' ? R.pick(['yx', 'x', 'y']) : R.coin() ? { v: R.nz(-4, 4) } : { h: R.nz(-4, 4) }, Pi = reflP(P, L), st;
      if (L === 'x') st = ['Reflecting across the $x$-axis flips the point up and down.', 'Its left-right position stays: $x$ stays ' + P[0] + '. Its distance from the axis stays, on the other side: $y$ becomes ' + (-P[1]) + '.', 'Rule $(x, y) \\to (x, -y)$: the image is $' + ptT(Pi[0], Pi[1]) + '$.'];
      else if (L === 'y') st = ['Reflecting across the $y$-axis flips the point left and right.', 'Its height stays: $y$ stays ' + P[1] + '. It moves to the other side of the axis: $x$ becomes ' + (-P[0]) + '.', 'Rule $(x, y) \\to (-x, y)$: the image is $' + ptT(Pi[0], Pi[1]) + '$.'];
      else if (L === 'yx') st = ['Reflecting across the line $y = x$ swaps the coordinates.', 'Rule $(x, y) \\to (y, x)$: the image is $' + ptT(Pi[0], Pi[1]) + '$.'];
      else if (L.v !== undefined) st = ['The mirror is the vertical line $x = ' + L.v + '$. The point is ' + Math.abs(P[0] - L.v) + ' unit' + (Math.abs(P[0] - L.v) === 1 ? '' : 's') + ' to the ' + (P[0] > L.v ? 'right' : 'left') + ' of it' + (P[0] === L.v ? ' (on it)' : '') + '.', 'The image is the same distance on the other side: $x = ' + L.v + (P[0] > L.v ? ' - ' : ' + ') + Math.abs(P[0] - L.v) + ' = ' + Pi[0] + '$, and $y$ stays ' + P[1] + '.', 'Image: $' + ptT(Pi[0], Pi[1]) + '$'];
      else st = ['The mirror is the horizontal line $y = ' + L.h + '$. The point is ' + Math.abs(P[1] - L.h) + ' unit' + (Math.abs(P[1] - L.h) === 1 ? '' : 's') + ' ' + (P[1] > L.h ? 'above' : 'below') + ' it.', 'The image is the same distance on the other side: $y = ' + L.h + (P[1] > L.h ? ' - ' : ' + ') + Math.abs(P[1] - L.h) + ' = ' + Pi[1] + '$, and $x$ stays ' + P[0] + '.', 'Image: $' + ptT(Pi[0], Pi[1]) + '$'];
      return { q: 'Reflect $P' + ptT(P[0], P[1]) + '$ across ' + lineName(L) + '. What are the coordinates of $P\'$?', a: tupleA(Pi), steps: st, hint: L === 'x' ? 'Across the x-axis, x stays the same.' : L === 'y' ? 'Across the y-axis, y stays the same.' : 'The image is the same distance from the mirror line, on the other side.', chk: { t: 'refl', p: P, L: L, img: Pi } };
    }
    if (kind === 'trap') {
      var Ly = R.pick(['x', 'y']), img = reflP(P, Ly), wrong = reflP(P, Ly === 'x' ? 'y' : 'x');
      return { q: 'What is the image of $' + ptT(P[0], P[1]) + '$ after a reflection across ' + lineName(Ly) + '?', a: mcq(m$(ptT(img[0], img[1])), [m$(ptT(wrong[0], wrong[1])), m$(ptT(-P[0], -P[1])), m$(ptT(P[1], P[0]))]),
        steps: [Ly === 'y' ? 'The $y$-axis is a vertical mirror. The point flips left to right, so its $x$-coordinate changes sign.' : 'The $x$-axis is a horizontal mirror. The point flips up and down, so its $y$-coordinate changes sign.', 'The other coordinate stays the same.', 'Image: $' + ptT(img[0], img[1]) + '$. (Changing the other coordinate would be a reflection across the other axis.)'], hint: 'Which way does the point move when it flips over this axis?', chk: { t: 'refl', p: P, L: Ly, img: img } };
    }
    if (kind === 'which') {
      var Ls = ['x', 'y', 'yx'], Lw = R.pick(Ls), im = reflP(P, Lw);
      return { q: 'A reflection maps $' + ptT(P[0], P[1]) + '$ to $' + ptT(im[0], im[1]) + '$. Across which line?', a: { t: 'mc', choices: ['the $x$-axis', 'the $y$-axis', 'the line $y = x$'], v: Ls.indexOf(Lw), keep: true },
        steps: ['Compare the coordinates.', Lw === 'x' ? '$x$ stayed the same and $y$ changed sign: an up-down flip across the $x$-axis.' : Lw === 'y' ? '$y$ stayed the same and $x$ changed sign: a left-right flip across the $y$-axis.' : 'The coordinates swapped places: a reflection across $y = x$.'], hint: 'Which coordinate changed, and how?', chk: { t: 'refl', p: P, L: Lw, img: im, unique: Ls } };
    }
    var tri = triPts(R, 4), Lv = R.pick(['x', 'y']), j = R.int(0, 2), imv = reflP(tri[j], Lv);
    return { q: 'Triangle $ABC$ is reflected across ' + lineName(Lv) + '. What are the coordinates of $' + VN[j] + '\'$?', a: tupleA(imv), viz: triViz(tri),
      steps: ['Read $' + VN[j] + ' = ' + ptT(tri[j][0], tri[j][1]) + '$ from the grid.', Lv === 'x' ? 'Across the $x$-axis: $(x, y) \\to (x, -y)$.' : 'Across the $y$-axis: $(x, y) \\to (-x, y)$.', '$' + VN[j] + '\' = ' + ptT(imv[0], imv[1]) + '$'], hint: 'Find the coordinates of ' + VN[j] + ' first.', chk: { t: 'refl', p: tri[j], L: Lv, img: imv } };
  });

  G('g8.rotations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['origin', 'origin', 'vertex', 'origin'], ['origin', 'which', 'vertex', 'origin', 'trap'], ['center', 'which', 'origin', 'trap', 'center']));
    var P = [R.nz(-7, 7), R.nz(-7, 7)]; while (Math.abs(P[0]) === Math.abs(P[1])) P[1] = R.nz(-7, 7);
    var ang = R.pick(by(ctx, [90, 180, 270], [90, 180, 270], [90, 270, 180]));
    function stepsFor(p, a, img) {
      return ['Rotating ' + rotName(a) + ' about the origin follows the rule $' + rotRule(a) + '$.', a === 180 ? 'Both coordinates change sign: $' + ptT(p[0], p[1]) + ' \\to ' + ptT(img[0], img[1]) + '$.' : 'Swap the coordinates, then change the sign of the ' + (a === 90 ? 'new first' : 'new second') + ' one: $' + ptT(p[0], p[1]) + ' \\to ' + ptT(img[0], img[1]) + '$.', a === 180 ? 'Check: a half turn sends a point to the opposite side of the origin.' : 'Check with $(1, 0)$: a ' + (a === 90 ? 'counterclockwise' : 'clockwise') + ' quarter turn sends it to $' + (a === 90 ? '(0, 1)' : '(0, -1)') + '$, and the rule agrees.'];
    }
    if (kind === 'origin' || kind === 'trap') {
      var img = rotP(P, ang);
      if (kind === 'origin') return { q: 'Rotate $P' + ptT(P[0], P[1]) + '$ ' + rotName(ang) + ' about the origin. What are the coordinates of $P\'$?', a: tupleA(img), steps: stepsFor(P, ang, img), hint: ang === 180 ? 'A half turn changes the sign of both coordinates.' : 'A quarter turn swaps the coordinates and changes one sign. Test the rule on (1, 0).', chk: { t: 'rot', p: P, a: ang, img: img } };
      var a2 = R.pick([90, 270]), im2 = rotP(P, a2), wr = rotP(P, a2 === 90 ? 270 : 90);
      return { q: 'Which is the image of $' + ptT(P[0], P[1]) + '$ after a rotation of ' + rotName(a2) + ' about the origin?', a: mcq(m$(ptT(im2[0], im2[1])), [m$(ptT(wr[0], wr[1])), m$(ptT(-P[0], -P[1])), m$(ptT(P[1], P[0]))]), steps: stepsFor(P, a2, im2).concat(['$' + ptT(wr[0], wr[1]) + '$ would be the ' + (a2 === 90 ? 'clockwise' : 'counterclockwise') + ' turn.']), hint: 'Test the rule on an easy point like (1, 0) first.', chk: { t: 'rot', p: P, a: a2, img: im2 } };
    }
    if (kind === 'which') {
      var aw = R.pick([90, 180, 270]), imw = rotP(P, aw), labs = ['$90^\\circ$ counterclockwise', '$180^\\circ$', '$90^\\circ$ clockwise'];
      return { q: 'A rotation about the origin maps $' + ptT(P[0], P[1]) + '$ to $' + ptT(imw[0], imw[1]) + '$. Which rotation is it?', a: { t: 'mc', choices: labs, v: [90, 180, 270].indexOf(aw), keep: true }, steps: stepsFor(P, aw, imw), hint: 'Try each rule on the point.', chk: { t: 'rot', p: P, a: aw, img: imw, unique: true } };
    }
    if (kind === 'vertex') {
      var tri = triPts(R, 3), j = R.int(0, 2), iv = rotP(tri[j], ang);
      return { q: 'Triangle $ABC$ is rotated ' + rotName(ang) + ' about the origin. What are the coordinates of $' + VN[j] + '\'$?', a: tupleA(iv), viz: triViz(tri), steps: ['Read $' + VN[j] + ' = ' + ptT(tri[j][0], tri[j][1]) + '$ from the grid.'].concat(stepsFor(tri[j], ang, iv)), hint: 'Find ' + VN[j] + ' first, then apply the rotation rule.', chk: { t: 'rot', p: tri[j], a: ang, img: iv } };
    }
    var c = [R.nz(-3, 3), R.nz(-3, 3)], ac = R.pick([90, 180, 270]), Pc = [c[0] + R.nz(-4, 4), c[1] + R.nz(-4, 4)], ic = rotP(Pc, ac, c), rel = [Pc[0] - c[0], Pc[1] - c[1]], rr = rotP(rel, ac);
    return { q: 'Rotate $P' + ptT(Pc[0], Pc[1]) + '$ ' + rotName(ac) + ' about the point $' + ptT(c[0], c[1]) + '$. What are the coordinates of $P\'$?', a: tupleA(ic),
      steps: ['Measure from the center: $P$ is $' + ptT(rel[0], rel[1]) + '$ away from $' + ptT(c[0], c[1]) + '$.', 'Rotate that offset with the rule $' + rotRule(ac) + '$: $' + ptT(rel[0], rel[1]) + ' \\to ' + ptT(rr[0], rr[1]) + '$.', 'Add it back to the center: $(' + c[0] + T.signed(rr[0]) + ', ' + c[1] + T.signed(rr[1]) + ') = ' + ptT(ic[0], ic[1]) + '$.'], hint: 'Work relative to the center: subtract it, rotate, then add it back.', chk: { t: 'rot', p: Pc, a: ac, img: ic, c: c } };
  });

  G('g8.congruence-transformations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['seq', 'tf', 'corr', 'seq'], ['seq', 'which', 'tf', 'corr'], ['which', 'seq', 'which', 'tf']));
    var moves = [
      { n: 'a translation 3 units right', f: function (p) { return trP(p, 3, 0); } }, { n: 'a translation 4 units down', f: function (p) { return trP(p, 0, -4); } },
      { n: 'a translation 2 units left and 3 units up', f: function (p) { return trP(p, -2, 3); } }, { n: 'a reflection across the $x$-axis', f: function (p) { return reflP(p, 'x'); } },
      { n: 'a reflection across the $y$-axis', f: function (p) { return reflP(p, 'y'); } }, { n: 'a $90^\\circ$ counterclockwise rotation about the origin', f: function (p) { return rotP(p, 90); } },
      { n: 'a $180^\\circ$ rotation about the origin', f: function (p) { return rotP(p, 180); } }, { n: 'a $90^\\circ$ clockwise rotation about the origin', f: function (p) { return rotP(p, 270); } }];
    if (kind === 'seq') {
      var two = R.sample(moves, 2), P = [R.nz(-6, 6), R.nz(-6, 6)], mid = two[0].f(P), fin = two[1].f(mid);
      return { q: 'Apply ' + two[0].n + ', then ' + two[1].n + ', to the point $' + ptT(P[0], P[1]) + '$. Where does it end up?', a: tupleA(fin),
        steps: ['First move: ' + two[0].n + ' takes $' + ptT(P[0], P[1]) + '$ to $' + ptT(mid[0], mid[1]) + '$.', 'Second move: ' + two[1].n + ' takes $' + ptT(mid[0], mid[1]) + '$ to $' + ptT(fin[0], fin[1]) + '$.', 'Final position: $' + ptT(fin[0], fin[1]) + '$. The order matters: do them one at a time.'], hint: 'Do the first move, then apply the second move to that result.', chk: { t: 'ok2', seq: true } };
    }
    if (kind === 'which') {
      var tri = triPts(R, 3), right = R.sample(moves, 2), img = tri.map(function (p) { return right[1].f(right[0].f(p)); });
      var key = function (ps) { return ps.map(function (p) { return p.join(','); }).join(';'); }, target = key(img), wrongs = [], tries = 0;
      while (wrongs.length < 3 && tries++ < 60) { var w = R.sample(moves, R.int(1, 2)), wi = tri.map(function (p) { var q = p; w.forEach(function (mv) { q = mv.f(q); }); return q; }), name = w.map(function (mv) { return mv.n; }).join(', then '); if (key(wi) !== target && wrongs.indexOf(name) < 0) wrongs.push(name); }
      var rname = right[0].n + ', then ' + right[1].n;
      return { q: 'Triangle $ABC$ (blue) is mapped onto triangle $A\'B\'C\'$ (red). Which sequence of rigid motions does it?', a: mcq(rname.charAt(0).toUpperCase() + rname.slice(1), wrongs.map(function (z) { return z.charAt(0).toUpperCase() + z.slice(1); })), viz: triViz(tri, img, 'A blue triangle and its red image'),
        steps: ['Follow one vertex. $A = ' + ptT(tri[0][0], tri[0][1]) + '$ must end at $A\' = ' + ptT(img[0][0], img[0][1]) + '$.', 'Apply ' + right[0].n + ': $' + ptT(tri[0][0], tri[0][1]) + ' \\to ' + ptT(right[0].f(tri[0])[0], right[0].f(tri[0])[1]) + '$. Then ' + right[1].n + ': $\\to ' + ptT(img[0][0], img[0][1]) + '$.', 'Check $B$ and $C$ the same way; they land on $B\'$ and $C\'$. The other choices send at least one vertex somewhere else.'], hint: 'Pick vertex A and trace it through each choice.', chk: { t: 'ok' } };
    }
    if (kind === 'tf') {
      var S = R.pick([['A reflection keeps every side length the same.', true, 'Rigid motions (translations, reflections, rotations) never stretch or shrink.'],
        ['A dilation with scale factor 2 is a rigid motion.', false, 'A dilation changes lengths (here it doubles them), so it is not rigid. The image is similar, not congruent.'],
        ['Rotations keep angle measures the same.', true, 'A turn does not bend any corner, so every angle keeps its measure.'],
        ['If a sequence of rigid motions maps one triangle onto another, the triangles are congruent.', true, 'That is what congruent means: one can be moved exactly onto the other.'],
        ['Two figures with the same area must be congruent.', false, 'A 2 by 8 rectangle and a 4 by 4 square both have area 16, but no rigid motion maps one onto the other.'],
        ['A translation can change the direction a figure faces.', false, 'A translation only slides; the figure keeps facing the same way. A rotation or reflection changes the facing.']]);
      return { q: 'True or false? ' + S[0], a: { t: 'tf', v: S[1] }, steps: [S[2], 'So the statement is ' + (S[1] ? 'true' : 'false') + '.'], hint: 'Rigid motions keep lengths and angles. Which moves are rigid?', chk: { t: 'ok' } };
    }
    var sides = [R.int(4, 12), R.int(4, 12), R.int(4, 12)], ang = R.int(35, 80), j = R.int(0, 2), askAng = R.coin();
    var names2 = ['AB', 'BC', 'CA'], names3 = ['DE', 'EF', 'FD'];
    if (askAng) return { q: 'Triangle $ABC$ is congruent to triangle $DEF$, with $A$ matching $D$, $B$ matching $E$ and $C$ matching $F$. If $\\angle B = ' + ang + '^\\circ$, what is $\\angle E$ in degrees?', a: { t: 'num', v: String(ang) },
      steps: ['Congruent figures match exactly: corresponding angles are equal.', '$\\angle B$ corresponds to $\\angle E$, so $\\angle E = ' + ang + '^\\circ$.'], hint: 'Which angle in DEF matches angle B?', chk: { t: 'ok' } };
    return { q: 'Triangle $ABC$ is congruent to triangle $DEF$, with $A$ matching $D$, $B$ matching $E$ and $C$ matching $F$. If $' + names2[j] + ' = ' + sides[j] + '$, what is $' + names3[j] + '$?', a: { t: 'num', v: String(sides[j]) },
      steps: ['Congruent figures have equal corresponding sides.', '$' + names2[j] + '$ matches $' + names3[j] + '$ (same letters in the same positions), so $' + names3[j] + ' = ' + sides[j] + '$.'], hint: 'Match the letters in order: A with D, B with E, C with F.', chk: { t: 'ok' } };
  });

  G('g8.dilations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['origin', 'origin', 'factor', 'length'], ['origin', 'center', 'factor', 'length', 'trap'], ['center', 'center', 'area', 'factor', 'trap']));
    var k = R.pick(by(ctx, [Q(2), Q(3), Q(1, 2)], [Q(2), Q(3), Q(1, 2), Q(3, 2)], [Q(2), Q(1, 2), Q(3, 2), Q(1, 3), Q(3)])), d = k.den();
    var P = [d * R.nz(-4, 4), d * R.nz(-4, 4)];
    if (kind === 'origin') { var im = dilP(P, k); return { q: 'Dilate $P' + ptT(P[0], P[1]) + '$ by a scale factor of $' + k.toTex() + '$ with center at the origin. What are the coordinates of $P\'$?', a: tupleA(im),
      steps: ['With the center at the origin, multiply both coordinates by the scale factor.', '$(' + k.toTex() + ' \\cdot ' + T.p(P[0]) + ', ' + k.toTex() + ' \\cdot ' + T.p(P[1]) + ') = ' + ptQ(im) + '$', 'The point moves along the ray from the origin, ' + (k.gt(1) ? 'farther away' : 'closer') + ': its distance from the origin is multiplied by $' + k.toTex() + '$.'], hint: 'Multiply each coordinate by ' + U.numStr(k.toNumber()) + '.', chk: { t: 'dil', p: P, k: k.toPlain(), c: [0, 0], img: im.map(String) } }; }
    if (kind === 'center' || kind === 'trap') {
      var c = [R.nz(-3, 3), R.nz(-3, 3)], Pc = [c[0] + d * R.nz(-3, 3), c[1] + d * R.nz(-3, 3)], ic = dilP(Pc, k, c), off = [Pc[0] - c[0], Pc[1] - c[1]], offk = [k.mul(off[0]), k.mul(off[1])];
      var st = ['Measure from the center: $P$ is $' + ptT(off[0], off[1]) + '$ away from $' + ptT(c[0], c[1]) + '$.', 'Scale that offset by $' + k.toTex() + '$: $' + ptQ(offk) + '$.', 'Add it back to the center: $' + ptQ(ic) + '$.'];
      if (kind === 'center') return { q: 'Dilate $P' + ptT(Pc[0], Pc[1]) + '$ by a scale factor of $' + k.toTex() + '$ with center $' + ptT(c[0], c[1]) + '$. What are the coordinates of $P\'$?', a: tupleA(ic), steps: st, hint: 'The center is not the origin: work with the distance from the center.', chk: { t: 'dil', p: Pc, k: k.toPlain(), c: c, img: ic.map(String) } };
      var wrong = dilP(Pc, k);
      if (wrong[0].eq(ic[0]) && wrong[1].eq(ic[1])) wrong = [ic[0].add(1), ic[1]];
      return { q: 'Which is the image of $' + ptT(Pc[0], Pc[1]) + '$ after a dilation by $' + k.toTex() + '$ with center $' + ptT(c[0], c[1]) + '$?', a: mcq(m$(ptQ(ic)), [m$(ptQ(wrong)), m$(ptQ([ic[0].add(c[0]), ic[1].add(c[1])])), m$(ptQ([Q.from(Pc[0]).add(off[0]), Q.from(Pc[1]).add(off[1])]))]),
        steps: st.concat(['Multiplying the coordinates directly, $' + ptQ(wrong) + '$, would use the origin as the center.']), hint: 'The center is not the origin.', chk: { t: 'dil', p: Pc, k: k.toPlain(), c: c, img: ic.map(String) } };
    }
    if (kind === 'factor') {
      var big = R.coin(), kk = big ? R.int(2, 4) : R.pick([2, 3, 4]), A = [kk * R.nz(-3, 3), kk * R.nz(-3, 3)], B = big ? A.map(function (z) { return z * kk; }) : A.map(function (z) { return z / kk; });
      var kq = big ? Q(kk) : Q(1, kk);
      return { q: 'A dilation with center at the origin maps $' + ptT(A[0], A[1]) + '$ to $' + ptT(B[0], B[1]) + '$. What is the scale factor?', a: { t: 'num', v: kq.toPlain() },
        steps: ['Each coordinate is multiplied by the scale factor $k$.', '$k = \\dfrac{' + B[0] + '}{' + A[0] + '} = ' + kq.toTex() + '$ (and $\\frac{' + B[1] + '}{' + A[1] + '}$ gives the same).', big ? 'A factor greater than 1 enlarges.' : 'A factor between 0 and 1 shrinks.'], hint: 'Divide an image coordinate by the matching original coordinate.', chk: { t: 'num', v: B[1] + '/(' + A[1] + ')', why: 'ratio' } };
    }
    if (kind === 'length') {
      var len = d * R.int(2, 9), nl = k.mul(len), per = R.coin();
      if (per) { var s3 = [d * R.int(2, 6), d * R.int(2, 6), d * R.int(2, 6)], pe = s3[0] + s3[1] + s3[2]; return { q: 'A triangle has sides ' + s3.join(', ') + '. It is dilated by a scale factor of $' + k.toTex() + '$. What is the perimeter of the image?', a: { t: 'num', v: k.mul(pe).toPlain() },
        steps: ['A dilation multiplies every length by the scale factor.', 'Original perimeter: $' + s3.join(' + ') + ' = ' + pe + '$.', 'Image perimeter: $' + k.toTex() + ' \\cdot ' + pe + ' = ' + k.mul(pe).toTex() + '$.'], hint: 'Every side is multiplied by the same factor, so the perimeter is too.', chk: { t: 'num', v: '(' + k.toPlain() + ')*(' + s3.join('+') + ')', why: 'perimeter' } }; }
      return { q: 'A segment is ' + len + ' cm long. It is dilated by a scale factor of $' + k.toTex() + '$. How long is the image?', a: { t: 'num', v: nl.toPlain() }, unit: 'cm',
        steps: ['A dilation multiplies every length by the scale factor.', '$' + k.toTex() + ' \\cdot ' + len + ' = ' + nl.toTex() + '$ cm'], hint: 'Multiply the length by the scale factor.', chk: { t: 'num', v: '(' + k.toPlain() + ')*' + len, why: 'length' } };
    }
    var w = d * R.int(1, 4), h = d * R.int(1, 4), area = w * h, na = k.mul(k).mul(area);
    return { q: 'A ' + w + ' by ' + h + ' rectangle is dilated by a scale factor of $' + k.toTex() + '$. What is the area of the image?', a: { t: 'num', v: na.toPlain() },
      steps: ['The new sides are $' + k.toTex() + ' \\cdot ' + w + ' = ' + k.mul(w).toTex() + '$ and $' + k.toTex() + ' \\cdot ' + h + ' = ' + k.mul(h).toTex() + '$.', 'New area: $' + k.mul(w).toTex() + ' \\cdot ' + k.mul(h).toTex() + ' = ' + na.toTex() + '$.', 'Area changes by the square of the scale factor: $(' + k.toTex() + ')^{2} \\cdot ' + area + ' = ' + na.toTex() + '$.'], hint: 'Find the new length and width first.', chk: { t: 'num', v: '(' + k.toPlain() + '*' + w + ')*(' + k.toPlain() + '*' + h + ')', why: 'area' } };
  });

  G('g8.similar-figures', function (R, ctx) {
    var kind = R.pick(by(ctx, ['side', 'side', 'k', 'angle'], ['side', 'is', 'k', 'angle', 'seq'], ['side', 'is', 'seq', 'side']));
    var k = R.pick([Q(2), Q(3), Q(3, 2), Q(1, 2), Q(5, 2), Q(4, 3)]), d = k.den();
    var s = [d * R.int(2, 6), d * R.int(2, 6), d * R.int(2, 6)], img = s.map(function (z) { return k.mul(z); });
    if (kind === 'side') {
      var j = R.int(0, 2), i = (j + 1) % 3, nm = [['AB', 'DE'], ['BC', 'EF'], ['CA', 'FD']];
      return { q: 'Triangle $ABC$ is similar to triangle $DEF$ ($A \\to D$, $B \\to E$, $C \\to F$). $' + nm[i][0] + ' = ' + s[i] + '$, $' + nm[i][1] + ' = ' + img[i].toTex() + '$ and $' + nm[j][0] + ' = ' + s[j] + '$. Find $' + nm[j][1] + '$.', a: { t: 'num', v: img[j].toPlain() },
        steps: ['Similar figures have proportional sides. The scale factor from $ABC$ to $DEF$ is $\\dfrac{' + nm[i][1] + '}{' + nm[i][0] + '} = \\dfrac{' + img[i].toTex() + '}{' + s[i] + '} = ' + k.toTex() + '$.', 'So $' + nm[j][1] + ' = ' + k.toTex() + ' \\cdot ' + s[j] + ' = ' + img[j].toTex() + '$.'], hint: 'Find the scale factor from a matching pair of sides.', chk: { t: 'num', v: '(' + img[i].toPlain() + ')/' + s[i] + '*' + s[j], why: 'proportion' } };
    }
    if (kind === 'k') return { q: 'A rectangle is ' + s[0] + ' by ' + s[1] + '. A similar rectangle is $' + img[0].toTex() + '$ by $' + img[1].toTex() + '$. What is the scale factor from the first rectangle to the second?', a: { t: 'num', v: k.toPlain() },
      steps: ['Scale factor $= \\dfrac{\\text{new length}}{\\text{original length}} = \\dfrac{' + img[0].toTex() + '}{' + s[0] + '} = ' + k.toTex() + '$.', 'Check with the other side: $\\dfrac{' + img[1].toTex() + '}{' + s[1] + '} = ' + k.toTex() + '$.'], hint: 'Divide a side of the new rectangle by the matching side of the first.', chk: { t: 'num', v: '(' + img[1].toPlain() + ')/' + s[1], why: 'k' } };
    if (kind === 'angle') { var a1 = R.int(30, 80), a2 = R.int(30, 70); return { q: 'Triangle $PQR$ is similar to triangle $XYZ$ ($P \\to X$, $Q \\to Y$, $R \\to Z$). $\\angle P = ' + a1 + '^\\circ$ and $\\angle Q = ' + a2 + '^\\circ$. What is $\\angle Z$ in degrees?', a: { t: 'num', v: String(180 - a1 - a2) },
      steps: ['Similar figures have equal corresponding angles, so $\\angle X = ' + a1 + '^\\circ$ and $\\angle Y = ' + a2 + '^\\circ$.', 'The angles of a triangle add to $180^\\circ$: $\\angle Z = 180 - ' + a1 + ' - ' + a2 + ' = ' + (180 - a1 - a2) + '^\\circ$.'], hint: 'Angles stay the same under a dilation. Then use the triangle angle sum.', chk: { t: 'num', v: '180-' + a1 + '-' + a2, why: 'sum' } }; }
    if (kind === 'is') {
      var w = R.int(2, 9), h = R.intNot(2, 9, w), f = R.pick([2, 3, Q(3, 2)]), yes = R.coin(), w2 = Q.from(f).mul(w), h2 = yes ? Q.from(f).mul(h) : Q.from(f).mul(h).add(R.pick([1, 2]));
      return { q: 'Is a ' + w + ' by ' + h + ' rectangle similar to a ' + U.numStr(w2) + ' by ' + U.numStr(h2) + ' rectangle?', a: { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true },
        steps: ['Similar rectangles have the same ratio of sides (all angles are already $90^\\circ$).', 'Compare: $\\frac{' + U.numStr(w2) + '}{' + w + '} = ' + T.num(U.numStr(w2.div(w))) + '$ and $\\frac{' + U.numStr(h2) + '}{' + h + '}' + (h2.div(h).isTerminating() ? ' = ' + T.num(U.numStr(h2.div(h))) : ' = ' + h2.div(h).toTex()) + '$.', yes ? 'The same factor: yes, they are similar.' : 'Different factors: no, one is stretched more one way.'], hint: 'Is the same scale factor used for both sides?', chk: { t: 'tfv', v: yes, x: w2.toPlain() + '/' + w, y: h2.toPlain() + '/' + h } };
    }
    return { q: 'A figure is mapped onto a larger copy that is turned and moved. Which sequence could do this?', a: mcq('A rotation, then a translation, then a dilation with scale factor 2', ['A rotation, then a translation', 'Two reflections', 'A translation only']),
      steps: ['The copy is larger, so a dilation (scale factor not 1) is needed: rigid motions never change size.', 'The turning and moving come from a rotation and a translation.', 'A sequence of rigid motions and a dilation shows the figures are similar.'], hint: 'Which kind of move changes size?', chk: { t: 'ok' } };
  });


  // ================================================================ Unit 8: angles and triangles
  var PAIRS = { // angle numbering as in the "angle" visual: 1 upper right, counterclockwise; 5 to 8 the same at the lower crossing
    vertical: [[1, 3], [2, 4], [5, 7], [6, 8]], corresponding: [[1, 5], [2, 6], [3, 7], [4, 8]], 'alternate interior': [[4, 6], [3, 5]],
    'alternate exterior': [[1, 7], [2, 8]], 'same-side interior': [[4, 5], [3, 6]], 'linear pair': [[1, 2], [2, 3], [3, 4], [1, 4], [5, 6], [6, 7], [7, 8], [5, 8]]
  };
  function angMeasure(n, a) { return (n % 2 === 1) ? a : 180 - a; } // odd angles equal the transversal angle a, even ones its supplement
  function pairName(i, j) { for (var k in PAIRS) if (PAIRS[k].some(function (p) { return (p[0] === i && p[1] === j) || (p[0] === j && p[1] === i); })) return k; return null; }
  var PAIR_WHY = { vertical: 'Vertical angles (across from each other at one crossing) are equal.', corresponding: 'Corresponding angles (same position at each crossing) are equal when the lines are parallel.', 'alternate interior': 'Alternate interior angles (between the lines, on opposite sides of the transversal) are equal when the lines are parallel.', 'alternate exterior': 'Alternate exterior angles (outside the lines, on opposite sides) are equal when the lines are parallel.', 'same-side interior': 'Same-side interior angles (between the lines, on the same side) add to $180^\\circ$ when the lines are parallel.', 'linear pair': 'Angles side by side on a straight line add to $180^\\circ$.' };
  function triangleViz(A, B, labels, opts) { // a triangle with angles A at the left, B at the right (degrees), base 6
    var a = A * Math.PI / 180, b = B * Math.PI / 180, c = 6, t = c * Math.sin(b) / Math.sin(a + b), C = [t * Math.cos(a), t * Math.sin(a)];
    var pts = [[0, 0], [c, 0], [U.round(C[0], 3), U.round(C[1], 3)]], xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var xmin = Math.min.apply(null, xs) - 1.6, xmax = Math.max.apply(null, xs) + (opts && opts.ext ? 4 : 1.6), ymin = -1.4, ymax = Math.max.apply(null, ys) + 1.2;
    var o = { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, grid: false, axes: false, equal: true, height: 240, polys: [{ pts: pts, color: 'blue', angs: labels, verts: opts && opts.verts }] };
    if (opts && opts.ext) { o.paths = [{ pts: [[c, 0], [c + 3.4, 0]], color: 'blue', dots: false }]; o.points = [{ x: c + 1.6, y: 0.75, label: opts.ext, color: 'red', r: 0.01 }]; }
    return plot(o, 'A triangle with its angles marked');
  }

  G('g8.parallel-lines-transversal', function (R, ctx) {
    var kind = R.pick(by(ctx, ['find', 'find', 'name', 'find'], ['find', 'name', 'alg', 'notpar', 'find'], ['alg', 'find', 'notpar', 'alg']));
    var a = R.intNot(35, 145, U.range(85, 95)), names2 = Object.keys(PAIRS).filter(function (k) { return k !== 'linear pair'; });
    if (kind === 'find' || kind === 'name') {
      var rel = R.pick(kind === 'name' ? names2 : names2.concat(['linear pair'])), pr = R.pick(PAIRS[rel]); if (R.coin()) pr = [pr[1], pr[0]];
      var g = pr[0], k = pr[1], vg = angMeasure(g, a), vk = angMeasure(k, a);
      var viz = { name: 'g8-transversal', opts: { deg: a, given: { n: g, v: vg + '°' }, ask: kind === 'find' ? k : null, pair: kind === 'name' ? pr : null, controls: false }, label: 'Two parallel lines cut by a transversal' };
      if (kind === 'name') { viz.opts.given = null; viz.opts.pair = pr; }
      if (kind === 'find') return { q: 'The two lines are parallel. $\\angle ' + g + ' = ' + vg + '^\\circ$. What is $\\angle ' + k + '$ in degrees?', a: { t: 'num', v: String(vk) }, viz: viz,
        steps: ['$\\angle ' + g + '$ and $\\angle ' + k + '$ are ' + (rel === 'linear pair' ? 'a linear pair' : rel + ' angles') + '.', PAIR_WHY[rel], vg === vk ? 'So $\\angle ' + k + ' = ' + vk + '^\\circ$.' : 'So $\\angle ' + k + ' = 180^\\circ - ' + vg + '^\\circ = ' + vk + '^\\circ$.'],
        hint: 'Find where the two angles sit. Same-looking angles are equal; the others add to 180°.', chk: { t: 'ang', g: g, k: k, a: a, vk: vk } };
      var ch = ['corresponding', 'alternate interior', 'alternate exterior', 'same-side interior', 'vertical'];
      return { q: 'In the picture, the two lines are parallel. What kind of angle pair are $\\angle ' + pr[0] + '$ and $\\angle ' + pr[1] + '$?', a: { t: 'mc', choices: ch.slice(), v: ch.indexOf(rel), keep: true }, viz: viz,
        steps: [PAIR_WHY[rel].replace(/ when the lines are parallel/, ''), 'So $\\angle ' + pr[0] + '$ and $\\angle ' + pr[1] + '$ are ' + rel + ' angles.'], hint: 'Are they between the lines or outside? On the same side of the transversal or opposite sides?', chk: { t: 'ok' } };
    }
    if (kind === 'alg') {
      var rel2 = R.pick(['corresponding', 'alternate interior', 'alternate exterior', 'same-side interior']), x = R.int(8, 30), m1 = R.int(2, 5), m2 = R.intNot(1, 6, m1);
      var v1 = R.int(40, 130); if (rel2 === 'same-side interior') v1 = R.int(40, 130);
      var c1 = v1 - m1 * x, v2 = rel2 === 'same-side interior' ? 180 - v1 : v1, c2 = v2 - m2 * x;
      var e1 = T.lin(m1, 'x', c1), e2 = T.lin(m2, 'x', c2), sum = rel2 === 'same-side interior';
      return { q: 'Two parallel lines are cut by a transversal. A pair of ' + rel2 + ' angles measure $(' + e1 + ')^\\circ$ and $(' + e2 + ')^\\circ$. Find $x$.', a: { t: 'num', v: String(x) },
        steps: [sum ? 'Same-side interior angles add to $180^\\circ$: $(' + e1 + ') + (' + e2 + ') = 180$.' : PAIR_WHY[rel2].replace(' when the lines are parallel', '') + ' So $' + e1 + ' = ' + e2 + '$.', sum ? 'Combine: $' + T.lin(m1 + m2, 'x', c1 + c2) + ' = 180$.' : 'Collect $x$ terms: $' + T.lin(m1 - m2, 'x', c1 - c2) + ' = 0$.'].concat(sum ? solveSteps('x', m1 + m2, c1 + c2, 180) : solveSteps('x', m1 - m2, c1 - c2, 0)).concat(['Check: the angles are $' + v1 + '^\\circ$ and $' + v2 + '^\\circ$.']),
        hint: sum ? 'These two angles add up to 180°.' : 'These two angles are equal. Set the expressions equal.', chk: { t: 'set', eq: sum ? '(' + m1 + '*x+(' + c1 + '))+(' + m2 + '*x+(' + c2 + '))=180' : m1 + '*x+(' + c1 + ')=' + m2 + '*x+(' + c2 + ')', sols: [String(x)] } };
    }
    var tilt = R.pick([12, 15, -12, -15]);
    return { q: 'In this picture the two lines are <b>not</b> parallel. Can you conclude that $\\angle 1 = \\angle 5$?', a: { t: 'mc', choices: ['No: corresponding angles are equal only when the lines are parallel.', 'Yes: corresponding angles are always equal.', 'Yes: they are vertical angles.', 'No: they always add to 180°.'], v: 0 },
      viz: { name: 'g8-transversal', opts: { deg: a, parallel: false, tilt: tilt, pair: [1, 5], controls: false }, label: 'Two lines that are not parallel, cut by a transversal' },
      steps: ['$\\angle 1$ and $\\angle 5$ are in corresponding positions.', 'The rule “corresponding angles are equal” depends on the lines being parallel (one crossing slides onto the other).', 'Here the lower line is tilted, so the angles differ: you cannot conclude they are equal.'], hint: 'What has to be true about the lines for the angle-pair rules to work?', chk: { t: 'ok' } };
  });

  G('g8.triangle-angle-sum', function (R, ctx) {
    var kind = R.pick(by(ctx, ['third', 'third', 'ext', 'right'], ['third', 'alg', 'ext', 'iso', 'right'], ['alg', 'ext', 'iso', 'ratio', 'extalg']));
    if (kind === 'third' || kind === 'right') {
      var A = kind === 'right' ? 90 : R.int(30, 100), B = kind === 'right' ? R.int(20, 70) : R.int(25, Math.min(110, 160 - A)), C = 180 - A - B;
      var sw = R.coin(), L = sw ? [A + '°', '?', B + '°'] : [A + '°', B + '°', '?'];
      var angleA = A, angleB = sw ? C : B; // picture: left vertex A, right vertex angleB, top the third
      var labels = sw ? [A + '°', '?', B + '°'] : [A + '°', B + '°', '?'];
      return { q: 'Two angles of a triangle measure $' + A + '^\\circ$ and $' + B + '^\\circ$. What is the third angle in degrees?', a: { t: 'num', v: String(C) }, viz: triangleViz(angleA, angleB, labels),
        steps: ['The angles of every triangle add to $180^\\circ$.', '$180 - ' + A + ' - ' + B + ' = ' + C + '$', 'The third angle is $' + C + '^\\circ$.'], hint: 'Subtract both known angles from 180°.', chk: { t: 'num', v: '180-' + A + '-' + B, why: 'sum' } };
    }
    if (kind === 'alg' || kind === 'ratio') {
      var r = R.pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [1, 2, 6], [2, 3, 7], [4, 5, 9]]), tot = r[0] + r[1] + r[2], x = 180 / tot;
      if (kind === 'ratio') return { q: 'The angles of a triangle are in the ratio $' + r.join(' : ') + '$. What is the largest angle in degrees?', a: { t: 'num', v: String(r[2] * x) },
        steps: ['Call the angles $' + r.map(function (z) { return T.mono(z, 'x'); }).join(', ') + '$.', 'They add to 180: $' + T.mono(tot, 'x') + ' = 180$, so $x = ' + x + '$.', 'Largest: $' + r[2] + ' \\cdot ' + x + ' = ' + r[2] * x + '^\\circ$.'], hint: 'Write the angles as multiples of x and add them.', chk: { t: 'num', v: r[2] + '*180/(' + tot + ')', why: 'ratio' } };
      var c0 = R.int(-10, 20), xs = R.int(10, 25), A2 = 2 * xs + c0, B2 = R.int(30, 80), C2 = 180 - A2 - B2;
      if (C2 <= 10) { B2 = 40; C2 = 180 - A2 - B2; }
      var cc = C2 - xs; // third angle written as (x + cc)
      return { q: 'A triangle has angles $(' + T.lin(2, 'x', c0) + ')^\\circ$, $' + B2 + '^\\circ$ and $(' + T.lin(1, 'x', cc) + ')^\\circ$. Find $x$.', a: { t: 'num', v: String(xs) },
        steps: ['The angles add to 180: $(' + T.lin(2, 'x', c0) + ') + ' + B2 + ' + (' + T.lin(1, 'x', cc) + ') = 180$.', 'Combine: $' + T.lin(3, 'x', c0 + B2 + cc) + ' = 180$.'].concat(solveSteps('x', 3, c0 + B2 + cc, 180)).concat(['Check: $' + A2 + ' + ' + B2 + ' + ' + C2 + ' = 180$.']), hint: 'Add all three angles and set the sum equal to 180.', chk: { t: 'set', eq: '(2*x+(' + c0 + '))+' + B2 + '+(x+(' + cc + '))=180', sols: [String(xs)] } };
    }
    if (kind === 'ext' || kind === 'extalg') {
      var P = R.int(30, 75), Qa = R.int(30, 75), ext = P + Qa;
      if (kind === 'extalg') { var xq = R.int(10, 30), k1 = R.int(2, 3), cst = ext - k1 * xq; return { q: 'In a triangle, two angles measure $' + P + '^\\circ$ and $' + Qa + '^\\circ$. The exterior angle at the third vertex measures $(' + T.lin(k1, 'x', cst) + ')^\\circ$. Find $x$.', a: { t: 'num', v: String(xq) },
        steps: ['An exterior angle equals the sum of the two interior angles that are not next to it.', '$' + T.lin(k1, 'x', cst) + ' = ' + P + ' + ' + Qa + ' = ' + ext + '$.'].concat(solveSteps('x', k1, cst, ext)), hint: 'The exterior angle equals the sum of the two far-away angles.', chk: { t: 'set', eq: k1 + '*x+(' + cst + ')=' + ext, sols: [String(xq)] } }; }
      return { q: 'Two angles of a triangle measure $' + P + '^\\circ$ and $' + Qa + '^\\circ$. What is the exterior angle at the third vertex, in degrees?', a: { t: 'num', v: String(ext) }, viz: triangleViz(P, 180 - P - Qa, [P + '°', '', Qa + '°'].map(function (z, i) { return i === 1 ? '' : z; }), { ext: '?' }),
        steps: ['The interior angle at the third vertex is $180 - ' + P + ' - ' + Qa + ' = ' + (180 - ext) + '^\\circ$.', 'The exterior angle makes a straight line with it: $180 - ' + (180 - ext) + ' = ' + ext + '^\\circ$.', 'Shortcut: an exterior angle equals the sum of the two far-away interior angles, $' + P + ' + ' + Qa + ' = ' + ext + '$.'], hint: 'Find the interior angle next to it first, or add the two far-away angles.', chk: { t: 'num', v: '180-(180-' + P + '-' + Qa + ')', why: 'ext' } };
    }
    var top = R.int(20, 140); if (top % 2) top++; var base = (180 - top) / 2, askTop = R.coin();
    if (askTop) return { q: 'An isosceles triangle has two equal base angles of $' + base + '^\\circ$ each. What is the third angle?', a: { t: 'num', v: String(top) }, steps: ['The angles add to 180: $180 - ' + base + ' - ' + base + ' = ' + top + '$.'], hint: 'Both base angles count.', chk: { t: 'num', v: '180-2*' + base, why: 'iso' } };
    return { q: 'An isosceles triangle has a top angle of $' + top + '^\\circ$. Its two base angles are equal. What is each base angle?', a: { t: 'num', v: String(base) }, viz: triangleViz(base, base, ['?', '?', top + '°']),
      steps: ['The two base angles together are $180 - ' + top + ' = ' + (180 - top) + '^\\circ$.', 'They are equal, so each is $' + (180 - top) + ' \\div 2 = ' + base + '^\\circ$.'], hint: 'Subtract the top angle from 180, then split the rest equally.', chk: { t: 'num', v: '(180-' + top + ')/2', why: 'iso' } };
  });

  G('g8.angle-angle-similarity', function (R, ctx) {
    var kind = R.pick(by(ctx, ['is', 'side', 'shadow', 'is'], ['is', 'side', 'shadow', 'nested'], ['side', 'nested', 'shadow', 'is']));
    if (kind === 'is') {
      var A = R.int(30, 80), B = R.int(30, 80), C = 180 - A - B, yes = R.coin(), form = R.int(0, 1);
      var t2 = yes ? (form ? [C, A] : [B, A]) : [A, R.intNot(30, 80, [B, C, A])];
      var C2 = 180 - t2[0] - t2[1];
      return { q: 'Triangle 1 has angles of $' + A + '^\\circ$ and $' + B + '^\\circ$. Triangle 2 has angles of $' + t2[0] + '^\\circ$ and $' + t2[1] + '^\\circ$. Are the triangles similar?', a: { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true },
        steps: ['Find each third angle: Triangle 1 has $180 - ' + A + ' - ' + B + ' = ' + C + '^\\circ$; Triangle 2 has $180 - ' + t2[0] + ' - ' + t2[1] + ' = ' + C2 + '^\\circ$.', 'Triangle 1: $' + [A, B, C].sort(function (p, q) { return p - q; }).join('^\\circ, ') + '^\\circ$. Triangle 2: $' + [t2[0], t2[1], C2].sort(function (p, q) { return p - q; }).join('^\\circ, ') + '^\\circ$.', yes ? 'The angles match, so the triangles are similar (two matching angles are enough).' : 'The angles do not all match, so the triangles are not similar.'],
        hint: 'Find the third angle of each triangle, then compare all three.', chk: { t: 'aa', a: [A, B], b: t2, yes: yes } };
    }
    if (kind === 'side') {
      var k = R.pick([Q(2), Q(3), Q(3, 2), Q(5, 2), Q(1, 2)]), d = k.den(), s1 = d * R.int(2, 6), s2 = d * R.int(2, 7), a1 = R.int(35, 75), b1 = R.int(35, 75);
      return { q: 'In triangles $ABC$ and $DEF$, $\\angle A = \\angle D = ' + a1 + '^\\circ$ and $\\angle B = \\angle E = ' + b1 + '^\\circ$. If $AB = ' + s1 + '$, $DE = ' + k.mul(s1).toTex() + '$ and $BC = ' + s2 + '$, find $EF$.', a: { t: 'num', v: k.mul(s2).toPlain() },
        steps: ['Two pairs of matching angles mean the triangles are similar (angle-angle).', 'Scale factor: $\\dfrac{DE}{AB} = \\dfrac{' + k.mul(s1).toTex() + '}{' + s1 + '} = ' + k.toTex() + '$.', '$EF = ' + k.toTex() + ' \\cdot BC = ' + k.toTex() + ' \\cdot ' + s2 + ' = ' + k.mul(s2).toTex() + '$'], hint: 'The triangles are similar. Find the scale factor from AB and DE.', chk: { t: 'num', v: '(' + k.mul(s1).toPlain() + ')/' + s1 + '*' + s2, why: 'similar' } };
    }
    if (kind === 'shadow') {
      var ph = R.pick([5, 6]), ps = R.pick([2, 3, 4, 8]), f = R.int(3, 8), ts = ps * f, th = ph * f, obj = R.pick(['tree', 'flagpole', 'building', 'light pole']);
      return { q: 'At the same time of day, a ' + ph + '-foot person casts a ' + ps + '-foot shadow and a ' + obj + ' casts a ' + ts + '-foot shadow. How tall is the ' + obj + '?', a: { t: 'num', v: String(th) }, unit: 'ft',
        steps: ['The sun’s rays make the same angle with the ground for both, and both stand straight up (right angles). Two matching angles: the triangles are similar.', 'So height ÷ shadow is the same: $\\dfrac{h}{' + ts + '} = \\dfrac{' + ph + '}{' + ps + '}$.', '$h = ' + ts + ' \\cdot \\dfrac{' + ph + '}{' + ps + '} = ' + th + '$ feet.'], hint: 'Set up height over shadow for both and make them equal.', chk: { t: 'num', v: ts + '*' + ph + '/' + ps, why: 'shadow' } };
    }
    var ab = R.int(2, 6), f2 = R.int(2, 3), bigAB = ab * f2, de = R.int(3, 9), big = de * f2;
    return { q: 'In a triangle, segment $DE$ is parallel to side $BC$, with $D$ on $AB$ and $E$ on $AC$. So triangle $ADE$ is similar to triangle $ABC$. If $AD = ' + ab + '$, $AB = ' + bigAB + '$ and $DE = ' + de + '$, find $BC$.', a: { t: 'num', v: String(big) },
      steps: ['$DE \\parallel BC$ makes matching corresponding angles at $D$ and $B$ (and at $E$ and $C$), and the angle at $A$ is shared. So the triangles are similar.', 'Scale factor: $\\dfrac{AB}{AD} = \\dfrac{' + bigAB + '}{' + ab + '} = ' + f2 + '$.', '$BC = ' + f2 + ' \\cdot DE = ' + f2 + ' \\cdot ' + de + ' = ' + big + '$'], hint: 'Compare the whole side AB with the part AD.', chk: { t: 'num', v: de + '*' + bigAB + '/' + ab, why: 'nested' } };
  });

  // ================================================================ Unit 9: the Pythagorean theorem
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  function triple(R, maxC) { for (var t = 0; t < 50; t++) { var b = R.pick(TRIPLES), k = R.int(1, 4), tr = b.map(function (z) { return z * k; }); if (tr[2] <= (maxC || 40)) return R.coin() ? tr : [tr[1], tr[0], tr[2]]; } return [3, 4, 5]; }
  function rightTriViz(a, b, labels) { // legs a (horizontal) and b (vertical), labels for [bottom, hypotenuse, left]
    var s = 6 / Math.max(a, b), A = [0, 0], B = [U.round(a * s, 3), 0], C = [0, U.round(b * s, 3)];
    return plot({ xmin: -1.8, xmax: B[0] + 1.6, ymin: -1.3, ymax: C[1] + 1, grid: false, axes: false, equal: true, height: 230, polys: [{ pts: [A, B, C], color: 'blue', sides: labels, right: [0] }] }, 'A right triangle with its sides labeled');
  }
  function sqrtAns(n) { var r = U.simplifyRadical(n); return r[1] === 1 ? String(r[0]) : 'sqrt(' + n + ')'; }
  function sqrtTex(n) { return U.isSquare(n) ? String(Math.round(Math.sqrt(n))) : '\\sqrt{' + n + '}'; }

  G('g8.pythagorean-theorem', function (R, ctx) {
    var kind = R.pick(by(ctx, ['hyp', 'hyp', 'leg', 'mc'], ['hyp', 'leg', 'exact', 'mc', 'leg'], ['exact', 'leg', 'exactleg', 'hyp', 'mc']));
    if (kind === 'hyp' || kind === 'leg') {
      var t = triple(R, by(ctx, 40, 50, 60)), a = t[0], b = t[1], c = t[2]; if (R.coin()) { var tb = a; a = b; b = tb; }
      if (kind === 'hyp') return { q: R.pick(['A right triangle has legs ' + a + ' and ' + b + '. How long is the hypotenuse?', 'The two shorter sides of a right triangle are ' + a + ' cm and ' + b + ' cm. How long, in cm, is the hypotenuse?', 'A right triangle has legs of ' + a + ' and ' + b + ' units. Find the length of the side across from the right angle.']), a: { t: 'num', v: String(c) }, viz: rightTriViz(a, b, [String(a), '?', String(b)]),
        steps: ['The hypotenuse $c$ is the side across from the right angle. $a^{2} + b^{2} = c^{2}$.', '$' + a + '^{2} + ' + b + '^{2} = ' + a * a + ' + ' + b * b + ' = ' + c * c + '$', '$c = \\sqrt{' + c * c + '} = ' + c + '$'], hint: 'Square the legs, add, then take the square root.', chk: { t: 'pyth', legs: [a, b], hyp: c, ask: 'hyp' } };
      return { q: R.pick(['A right triangle has a hypotenuse of ' + c + ' and one leg of ' + a + '. How long is the other leg?', 'In a right triangle, the side across from the right angle is ' + c + ' units and one leg is ' + a + ' units. Find the other leg.']), a: { t: 'num', v: String(b) }, viz: rightTriViz(a, b, [String(a), String(c), '?']),
        steps: ['$a^{2} + b^{2} = c^{2}$, with $c = ' + c + '$ the hypotenuse.', '$' + a + '^{2} + b^{2} = ' + c + '^{2}$, so $b^{2} = ' + c * c + ' - ' + a * a + ' = ' + b * b + '$.', '$b = \\sqrt{' + b * b + '} = ' + b + '$'], hint: 'The hypotenuse is the longest side: subtract, don’t add.', chk: { t: 'pyth', legs: [a, b], hyp: c, ask: 'leg' } };
    }
    if (kind === 'exact' || kind === 'exactleg') {
      for (var tries = 0; tries < 40; tries++) { var p = R.int(2, 9), q = R.int(2, 10), n = p * p + q * q; if (!U.isSquare(n) && U.simplifyRadical(n)[0] === 1) break; }
      if (kind === 'exact') return { q: 'A right triangle has legs ' + p + ' and ' + q + '. Find the exact length of the hypotenuse (use $\\sqrt{\\ }$).', a: { t: 'num', v: 'sqrt(' + n + ')' }, viz: rightTriViz(p, q, [String(p), '?', String(q)]),
        steps: ['$c^{2} = ' + p + '^{2} + ' + q + '^{2} = ' + p * p + ' + ' + q * q + ' = ' + n + '$', n + ' is not a perfect square, so $c = \\sqrt{' + n + '}$ (about ' + U.numStr(U.round(Math.sqrt(n), 2)) + ').'], hint: 'Add the squares of the legs. The answer can stay as a square root.', chk: { t: 'pyth', legs: [p, 'sqrt(' + q * q + ')'], hyp: 'sqrt(' + n + ')', ask: 'hyp' } };
      var hyp = q + R.int(1, 3), legSq = hyp * hyp - p * p; if (legSq <= 0 || U.isSquare(legSq)) { hyp = p + q; legSq = hyp * hyp - p * p; }
      if (U.isSquare(legSq)) hyp++, legSq = hyp * hyp - p * p;
      return { q: 'A right triangle has a hypotenuse of ' + hyp + ' and a leg of ' + p + '. Find the exact length of the other leg (use $\\sqrt{\\ }$ if needed).', a: { t: 'num', v: 'sqrt(' + legSq + ')' },
        steps: ['$b^{2} = c^{2} - a^{2} = ' + hyp + '^{2} - ' + p + '^{2} = ' + hyp * hyp + ' - ' + p * p + ' = ' + legSq + '$', '$b = \\sqrt{' + legSq + '}$ (about ' + U.numStr(U.round(Math.sqrt(legSq), 2)) + ').'], hint: 'Subtract the square of the leg from the square of the hypotenuse.', chk: { t: 'pyth', legs: [p, 'sqrt(' + legSq + ')'], hyp: hyp, ask: 'leg' } };
    }
    var t2 = triple(R, 30), a2 = t2[0], b2 = t2[1], c2 = t2[2];
    return { q: 'A right triangle has legs ' + a2 + ' and ' + b2 + '. Which is the length of the hypotenuse?', a: mcq(m$(String(c2)), [m$(String(a2 + b2)), m$(String(c2 * c2)), m$(sqrtTex(Math.abs(b2 * b2 - a2 * a2)) === '0' ? String(c2 + 1) : sqrtTex(Math.abs(b2 * b2 - a2 * a2)))]),
      steps: ['Square first, then add: $' + a2 + '^{2} + ' + b2 + '^{2} = ' + (a2 * a2 + b2 * b2) + '$.', 'Then take the square root: $\\sqrt{' + c2 * c2 + '} = ' + c2 + '$.', 'Adding the legs first ($' + a2 + ' + ' + b2 + ' = ' + (a2 + b2) + '$) is a common slip: two sides of a triangle always add to more than the third.'], hint: 'Square each leg first.', chk: { t: 'pyth', legs: [a2, b2], hyp: c2, ask: 'hyp' } };
  });

  G('g8.pythagorean-converse', function (R, ctx) {
    var kind = R.pick(by(ctx, ['is', 'is', 'which'], ['is', 'which', 'carp', 'is'], ['is', 'which', 'carp', 'missing']));
    function nearMiss(R2) {
      for (var tt = 0; tt < 50; tt++) {
        var t = triple(R2, 30).slice(), i = R2.int(0, 2); t[i] += R2.pick([1, -1, 2]);
        var o = t.slice().sort(function (p, q) { return p - q; });
        if (o[0] > 0 && o[0] + o[1] > o[2] && o[0] * o[0] + o[1] * o[1] !== o[2] * o[2]) return t;
      }
      return [4, 5, 6];
    }
    if (kind === 'is') {
      var yes = R.coin(), t = yes ? triple(R, 40) : nearMiss(R), s = R.shuffle(t).slice(), so = s.slice().sort(function (p, q) { return p - q; });
      var lhs = so[0] * so[0] + so[1] * so[1], rhs = so[2] * so[2]; yes = lhs === rhs;
      return { q: 'A triangle has sides ' + s.join(', ') + '. Is it a right triangle?', a: { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true },
        steps: ['If it is a right triangle, the longest side, ' + so[2] + ', must be the hypotenuse.', 'Check: $' + so[0] + '^{2} + ' + so[1] + '^{2} = ' + so[0] * so[0] + ' + ' + so[1] * so[1] + ' = ' + lhs + '$ and $' + so[2] + '^{2} = ' + rhs + '$.', yes ? 'They are equal, so by the converse of the Pythagorean theorem, it is a right triangle.' : 'They are not equal, so it is not a right triangle.'],
        hint: 'Use the longest side as c and test a² + b² = c².', chk: { t: 'conv', s: s, yes: yes } };
    }
    if (kind === 'which') {
      var good = triple(R, 30), bads = [nearMiss(R), nearMiss(R), [good[0] + 1, good[1] + 1, good[2] + 1]];
      var fmt = function (z) { return z.slice().sort(function (p, q) { return p - q; }).join(', '); };
      var badsF = U.uniq(bads.filter(function (z) { var o = z.slice().sort(function (p, q) { return p - q; }); return o[0] * o[0] + o[1] * o[1] !== o[2] * o[2] && o[0] + o[1] > o[2]; }).map(fmt)).filter(function (z) { return z !== fmt(good); });
      while (badsF.length < 3) badsF.push(fmt([good[0] + badsF.length + 2, good[1], good[2]]));
      return { q: 'Which set of side lengths makes a right triangle?', a: mcq(fmt(good), badsF.slice(0, 3)),
        steps: ['Test each set: the two shorter sides squared and added must equal the longest side squared.', 'For ' + fmt(good) + ': $' + good.slice().sort(function (p, q) { return p - q; }).map(function (z, i) { return z + '^{2}' + (i === 0 ? ' + ' : i === 1 ? ' = ' : ''); }).join('') + '$ checks out: $' + (Math.min(good[0], good[1]) * Math.min(good[0], good[1]) + Math.max(good[0], good[1]) * Math.max(good[0], good[1])) + ' = ' + good[2] * good[2] + '$.', 'The other sets miss.'], hint: 'For each set, compare a² + b² with c² using the longest side as c.', chk: { t: 'conv', s: good, yes: true } };
    }
    if (kind === 'carp') {
      var u = R.pick([[3, 4, 5], [6, 8, 10], [9, 12, 15]]), ok = R.coin(), diag = ok ? u[2] : U.fix(u[2] + R.pick([0.25, 0.5, -0.25])), who = names(R)[0];
      return { q: who + ' is building a frame. One side is ' + u[0] + ' ft, the other is ' + u[1] + ' ft, and the diagonal between their ends measures ' + U.numStr(diag) + ' ft. Is the corner a right angle?', a: { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true },
        steps: ['$' + u[0] + '^{2} + ' + u[1] + '^{2} = ' + (u[0] * u[0] + u[1] * u[1]) + '$.', '$' + U.numStr(diag) + '^{2} = ' + U.numStr(U.fix(diag * diag)) + '$.', ok ? 'They match, so the corner is square (a right angle).' : 'They do not match, so the corner is not a right angle. (A diagonal longer than ' + u[2] + ' ft means the corner is wider than $90^\\circ$; shorter means narrower.)'], hint: 'Does a² + b² equal the diagonal squared?', chk: { t: 'conv', s: [u[0], u[1], diag], yes: ok } };
    }
    var t3 = triple(R, 41);
    return { q: 'For which whole number $c$ is a triangle with sides ' + t3[0] + ', ' + t3[1] + ' and $c$ a right triangle, if $c$ is the longest side?', a: { t: 'num', v: String(t3[2]) },
      steps: ['$c^{2} = ' + t3[0] + '^{2} + ' + t3[1] + '^{2} = ' + (t3[0] * t3[0] + t3[1] * t3[1]) + '$.', '$c = \\sqrt{' + t3[2] * t3[2] + '} = ' + t3[2] + '$. By the converse, sides ' + t3.join(', ') + ' make a right triangle.'], hint: 'Make a² + b² = c² true.', chk: { t: 'pyth', legs: [t3[0], t3[1]], hyp: t3[2], ask: 'hyp' } };
  });

  G('g8.pythagorean-applications', function (R, ctx) {
    var kind = R.pick(by(ctx, ['ladder', 'rect', 'walk'], ['ladder', 'rect', 'box', 'walk', 'tenth'], ['box', 'tenth', 'box', 'ladder', 'rect', 'walk', 'tenth']));
    if (kind === 'ladder') {
      var t = triple(R, 40), base = Math.min(t[0], t[1]), up = Math.max(t[0], t[1]), askUp = R.coin();
      return { q: askUp ? 'A ' + t[2] + '-foot ladder leans against a wall. Its foot is ' + base + ' feet from the wall. How high up the wall does it reach?' : 'A ladder reaches ' + up + ' feet up a wall, and its foot is ' + base + ' feet from the wall. How long is the ladder?', a: { t: 'num', v: String(askUp ? up : t[2]) }, unit: 'ft',
        viz: rightTriViz(base, up, [base + ' ft', askUp ? t[2] + ' ft' : '?', askUp ? '?' : up + ' ft']),
        steps: ['The wall, the ground and the ladder form a right triangle; the ladder is the hypotenuse.', askUp ? '$h^{2} = ' + t[2] + '^{2} - ' + base + '^{2} = ' + t[2] * t[2] + ' - ' + base * base + ' = ' + up * up + '$' : '$L^{2} = ' + base + '^{2} + ' + up + '^{2} = ' + (base * base + up * up) + '$', askUp ? '$h = \\sqrt{' + up * up + '} = ' + up + '$ feet' : '$L = \\sqrt{' + t[2] * t[2] + '} = ' + t[2] + '$ feet'], hint: 'Which side is the hypotenuse here?', chk: { t: 'pyth', legs: [base, up], hyp: t[2], ask: askUp ? 'leg' : 'hyp' } };
    }
    if (kind === 'rect' || kind === 'walk') {
      var t2 = triple(R, 50), w = t2[0], h = t2[1];
      if (kind === 'walk') { var who = names(R)[0], dirs = R.pick([['east', 'north'], ['west', 'north'], ['east', 'south'], ['west', 'south'], ['north', 'east'], ['south', 'west']]); return { q: who + ' ' + R.pick(['walks', 'bikes', 'jogs', 'skates']) + ' ' + w + ' blocks ' + dirs[0] + ' and then ' + h + ' blocks ' + dirs[1] + '. How far is ' + who + ' from the start, in a straight line?', a: { t: 'num', v: String(t2[2]) }, unit: 'blocks',
        steps: [dirs[0].charAt(0).toUpperCase() + dirs[0].slice(1) + ' and ' + dirs[1] + ' meet at a right angle, so the straight-line distance is a hypotenuse.', '$d^{2} = ' + w + '^{2} + ' + h + '^{2} = ' + (w * w + h * h) + '$', '$d = ' + t2[2] + '$ blocks'], hint: 'Draw the path: it makes a right triangle.', chk: { t: 'pyth', legs: [w, h], hyp: t2[2], ask: 'hyp' } }; }
      return { q: 'A rectangular ' + R.pick(['screen', 'picture frame', 'window', 'tabletop', 'poster', 'tablet']) + ' is ' + Math.max(w, h) + ' inches wide and ' + Math.min(w, h) + ' inches tall. How long is its diagonal?', a: { t: 'num', v: String(t2[2]) }, unit: 'in',
        steps: ['The diagonal splits the rectangle into two right triangles; the diagonal is the hypotenuse.', '$d^{2} = ' + w + '^{2} + ' + h + '^{2} = ' + (w * w + h * h) + '$', '$d = ' + t2[2] + '$ inches'], hint: 'The width and height are the legs.', chk: { t: 'pyth', legs: [w, h], hyp: t2[2], ask: 'hyp' } };
    }
    if (kind === 'box') {
      var QD = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [2, 5, 14, 15], [8, 9, 12, 17], [1, 12, 12, 17], [6, 10, 15, 19], [4, 5, 20, 21], [4, 8, 19, 21], [4, 13, 16, 21], [8, 11, 16, 21], [3, 6, 22, 23], [3, 14, 18, 23], [6, 13, 18, 23], [9, 12, 20, 25], [12, 15, 16, 25]];
      var qd = R.pick(QD), k = qd[3] <= 9 ? R.int(1, 2) : 1, L = qd[2] * k, W = qd[1] * k, H = qd[0] * k, D = qd[3] * k, fl = L * L + W * W;
      return { q: 'A ' + R.pick(['box', 'crate', 'storage bin', 'toolbox', 'shipping box']) + ' is ' + L + ' in long, ' + W + ' in wide and ' + H + ' in tall. How long is the longest straight ' + R.pick(['rod', 'stick', 'dowel', 'pole']) + ' that fits inside, from one bottom corner to the opposite top corner?', a: { t: 'num', v: String(D) }, unit: 'in',
        viz: { name: 'g8-solid', opts: { shape: 'box', l: L, w: W, h: H, diag: true, controls: false, readout: false }, label: 'A box with its floor diagonal and space diagonal' },
        steps: ['First the diagonal of the floor (dashed): $d^{2} = ' + L + '^{2} + ' + W + '^{2} = ' + fl + '$.', 'That floor diagonal and the height make a right triangle with the rod as hypotenuse: $D^{2} = d^{2} + ' + H + '^{2} = ' + fl + ' + ' + H * H + ' = ' + D * D + '$.', '$D = \\sqrt{' + D * D + '} = ' + D + '$ inches'], hint: 'Use the Pythagorean theorem twice: across the floor, then up.', chk: { t: 'num', v: 'sqrt(' + L + '^2+' + W + '^2+' + H + '^2)', why: 'space diagonal' } };
    }
    for (var tr = 0; tr < 30; tr++) { var a = R.int(2, 12), b = R.int(2, 12), n = a * a + b * b; if (!U.isSquare(n)) break; }
    var tq = sqrtTenth(n);
    return { q: 'A right triangle has legs ' + a + ' cm and ' + b + ' cm. Find the hypotenuse to the nearest tenth of a centimeter.', a: { t: 'num', v: U.numStr(tq), dp: 1 }, unit: 'cm',
      steps: ['$c^{2} = ' + a + '^{2} + ' + b + '^{2} = ' + n + '$, so $c = \\sqrt{' + n + '}$.', '$' + isqrt(n) + '^{2} = ' + isqrt(n) * isqrt(n) + '$ and $' + (isqrt(n) + 1) + '^{2} = ' + (isqrt(n) + 1) * (isqrt(n) + 1) + '$, so $c$ is between ' + isqrt(n) + ' and ' + (isqrt(n) + 1) + '.', 'Squaring tenths, $' + U.numStr(tq) + '^{2} = ' + U.numStr(tq.mul(tq)) + '$ is closest to ' + n + ': $c \\approx ' + U.numStr(tq) + '$ cm.'], hint: 'Find c² first, then estimate its square root.', chk: { t: 'num', v: String(Math.round(Math.sqrt(n) * 10) / 10), why: 'round' } };
  });

  G('g8.distance-between-points', function (R, ctx) {
    var kind = R.pick(by(ctx, ['grid', 'grid', 'coords'], ['coords', 'grid', 'exact', 'far'], ['coords', 'exact', 'tenth', 'far']));
    if (kind === 'grid' || kind === 'coords') {
      var t = triple(R, by(ctx, 10, 15, 25)), dx = t[0] * R.sign(), dy = t[1] * R.sign(), lim = kind === 'grid' ? 6 : 12;
      if (kind === 'grid') { while (Math.abs(dx) > 8 || Math.abs(dy) > 8) { t = [3, 4, 5]; dx = 3 * R.sign(); dy = 4 * R.sign(); } }
      var A = [R.int(-lim, lim - Math.max(dx, 0)), R.int(-lim, lim - Math.max(dy, 0))]; A[0] = Math.max(-lim - Math.min(dx, 0), Math.min(A[0], lim - Math.max(dx, 0))); A[1] = Math.max(-lim - Math.min(dy, 0), Math.min(A[1], lim - Math.max(dy, 0)));
      var B = [A[0] + dx, A[1] + dy];
      var out = { q: 'What is the distance between $A' + ptT(A[0], A[1]) + '$ and $B' + ptT(B[0], B[1]) + '$?', a: { t: 'num', v: String(t[2]) },
        steps: ['Draw a right triangle with $AB$ as the hypotenuse: one leg across, one leg up or down.', 'Horizontal leg: $|' + B[0] + ' - ' + T.p(A[0]) + '| = ' + Math.abs(dx) + '$. Vertical leg: $|' + B[1] + ' - ' + T.p(A[1]) + '| = ' + Math.abs(dy) + '$.', '$AB^{2} = ' + Math.abs(dx) + '^{2} + ' + Math.abs(dy) + '^{2} = ' + t[2] * t[2] + '$, so $AB = ' + t[2] + '$.'],
        hint: 'Find how far across and how far up, then use a² + b² = c².', chk: { t: 'num', v: 'sqrt((' + B[0] + '-(' + A[0] + '))^2+(' + B[1] + '-(' + A[1] + '))^2)', why: 'distance' } };
      if (kind === 'grid') { out.q = 'What is the distance between points $A$ and $B$?'; out.viz = plot({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, points: [{ x: A[0], y: A[1], label: 'A', color: 'red' }, { x: B[0], y: B[1], label: 'B', color: 'blue' }], paths: [{ pts: [A, B], color: 'purple', dots: false, dash: true }] }, 'Points A and B on a grid'); out.steps[1] = 'Count the legs on the grid: across ' + Math.abs(dx) + ', ' + (dy > 0 ? 'up ' : 'down ') + Math.abs(dy) + '.'; }
      return out;
    }
    var A2 = [R.int(-6, 6), R.int(-6, 6)], dx2, dy2, n;
    for (var tr = 0; tr < 40; tr++) { dx2 = R.nz(-7, 7); dy2 = R.nz(-7, 7); n = dx2 * dx2 + dy2 * dy2; if (!U.isSquare(n) && (kind !== 'exact' || U.simplifyRadical(n)[0] === 1)) break; }
    var B2 = [A2[0] + dx2, A2[1] + dy2];
    if (kind === 'exact') return { q: 'Find the exact distance between $' + ptT(A2[0], A2[1]) + '$ and $' + ptT(B2[0], B2[1]) + '$ (use $\\sqrt{\\ }$).', a: { t: 'num', v: 'sqrt(' + n + ')' },
      steps: ['Legs: $|' + B2[0] + ' - ' + T.p(A2[0]) + '| = ' + Math.abs(dx2) + '$ and $|' + B2[1] + ' - ' + T.p(A2[1]) + '| = ' + Math.abs(dy2) + '$.', '$d^{2} = ' + Math.abs(dx2) + '^{2} + ' + Math.abs(dy2) + '^{2} = ' + n + '$, so $d = \\sqrt{' + n + '}$.'], hint: 'Make a right triangle from the differences in x and y.', chk: { t: 'num', v: 'sqrt(' + n + ')', why: 'd' } };
    if (kind === 'tenth') { var tq = sqrtTenth(n); return { q: 'Find the distance between $' + ptT(A2[0], A2[1]) + '$ and $' + ptT(B2[0], B2[1]) + '$ to the nearest tenth.', a: { t: 'num', v: U.numStr(tq), dp: 1 },
      steps: ['Legs: ' + Math.abs(dx2) + ' and ' + Math.abs(dy2) + '. $d^{2} = ' + n + '$.', '$d = \\sqrt{' + n + '} \\approx ' + U.numStr(tq) + '$ (check: $' + U.numStr(tq) + '^{2} = ' + U.numStr(tq.mul(tq)) + '$).'], hint: 'Find d² first, then estimate the square root.', chk: { t: 'num', v: String(Math.round(Math.sqrt(n) * 10) / 10), why: 'round' } }; }
    var P1 = [R.nz(-6, 6), R.nz(-6, 6)], P2 = [R.nz(-6, 6), R.nz(-6, 6)], d1 = P1[0] * P1[0] + P1[1] * P1[1], d2 = P2[0] * P2[0] + P2[1] * P2[1];
    while (d1 === d2) { P2[0] = P2[0] === 6 ? 5 : P2[0] + 1; d2 = P2[0] * P2[0] + P2[1] * P2[1]; }
    return { q: 'Which point is farther from the origin: $' + ptT(P1[0], P1[1]) + '$ or $' + ptT(P2[0], P2[1]) + '$?', a: { t: 'mc', choices: [m$(ptT(P1[0], P1[1])), m$(ptT(P2[0], P2[1]))], v: d1 > d2 ? 0 : 1, keep: true },
      steps: ['Distance squared from the origin is $x^{2} + y^{2}$.', '$' + ptT(P1[0], P1[1]) + '$: $' + P1[0] * P1[0] + ' + ' + P1[1] * P1[1] + ' = ' + d1 + '$. $' + ptT(P2[0], P2[1]) + '$: $' + P2[0] * P2[0] + ' + ' + P2[1] * P2[1] + ' = ' + d2 + '$.', 'The bigger square means the bigger distance, so $' + (d1 > d2 ? ptT(P1[0], P1[1]) : ptT(P2[0], P2[1])) + '$ is farther.'], hint: 'Compare x² + y² for each point.', chk: { t: 'cmp', x: 'sqrt(' + d1 + ')', y: 'sqrt(' + d2 + ')', big: d1 > d2 ? 0 : 1 } };
  });


  // ================================================================ Unit 10: volume of cylinders, cones and spheres
  function piAns(q) { q = Q.from(q); return { t: 'num', v: (q.isInt() ? q.toPlain() : '(' + q.toPlain() + ')') + '*pi' }; }
  function piTex(q) { q = Q.from(q); return (q.isInt() ? q.toPlain() : q.toTex()) + '\\pi'; }
  function solidViz(o, label) { o.controls = false; o.readout = false; return { name: 'g8-solid', opts: o, label: label }; }
  function approxAns(coef) { // coef * pi, using 3.14 and rounding to a whole number; tolerance covers using the pi key instead
    var v314 = Math.round(3.14 * coef.toNumber()), vpi = Math.round(Math.PI * coef.toNumber());
    return { t: 'num', v: String(v314), tol: Math.max(1, Math.abs(vpi - v314)) + 0.01 };
  }
  var UNITS = ['cm', 'in', 'ft', 'm'];
  function cu(u) { return 'cubic ' + { cm: 'centimeters', 'in': 'inches', ft: 'feet', m: 'meters' }[u]; }

  G('g8.volume-cylinders', function (R, ctx) {
    var kind = R.pick(by(ctx, ['r', 'r', 'd', 'trap'], ['r', 'd', 'h', 'approx', 'trap'], ['d', 'h', 'rr', 'approx', 'word']));
    var r = R.int(2, by(ctx, 6, 8, 10)), h = R.int(2, 12), u = R.pick(UNITS), V = Q(r * r * h);
    var st = ['The base is a circle with area $\\pi r^{2} = \\pi \\cdot ' + r + '^{2} = ' + r * r + '\\pi$.', 'A cylinder is a stack of these circles, ' + h + ' units high: $V = \\pi r^{2} h = ' + r * r + '\\pi \\cdot ' + h + '$.', '$V = ' + piTex(V) + '$ ' + cu(u) + ' (about ' + U.numStr(U.round(V.toNumber() * Math.PI, 1)) + ').'];
    if (kind === 'r' || kind === 'd') {
      var useD = kind === 'd';
      if (useD) st.unshift('The diameter is ' + 2 * r + ', so the radius is half of it: $r = ' + r + '$.');
      return { q: 'A cylinder has a ' + (useD ? 'diameter of ' + 2 * r : 'radius of ' + r) + ' ' + u + ' and a height of ' + h + ' ' + u + '. Find its volume. Give the exact answer in terms of $\\pi$.', a: piAns(V), viz: solidViz({ shape: 'cylinder', r: r, h: h, diam: useD, unit: u }, 'A cylinder with its measurements'),
        steps: st, hint: useD ? 'Halve the diameter to get the radius first.' : 'Base area times height: V = πr²h.', chk: { t: 'num', v: 'pi*' + r + '^2*' + h, why: 'cyl' } };
    }
    if (kind === 'trap') {
      var d = 2 * r, wrongD = Q(d * d * h);
      return { q: 'A cylinder has a diameter of ' + d + ' ' + u + ' and a height of ' + h + ' ' + u + '. Which is its volume?', a: mcq(m$(piTex(V)), [m$(piTex(wrongD)), m$(piTex(Q(r * h))), m$(piTex(Q(2 * r * h)))]),
        steps: ['The formula uses the radius: $r = ' + d + ' \\div 2 = ' + r + '$.', '$V = \\pi r^{2} h = \\pi \\cdot ' + r + '^{2} \\cdot ' + h + ' = ' + piTex(V) + '$.', 'Using the diameter in place of the radius gives $' + piTex(wrongD) + '$, four times too big.'], hint: 'The formula needs the radius, not the diameter.', chk: { t: 'num', v: 'pi*(' + d + '/2)^2*' + h, why: 'cyl', mc: true } };
    }
    if (kind === 'h') {
      return { q: 'A cylinder has a volume of $' + piTex(V) + '$ ' + cu(u) + ' and a radius of ' + r + ' ' + u + '. How tall is it?', a: { t: 'num', v: String(h) }, unit: u,
        steps: ['$V = \\pi r^{2} h$, so $' + piTex(V) + ' = \\pi \\cdot ' + r * r + ' \\cdot h$.', 'Divide both sides by $' + r * r + '\\pi$: $h = ' + V.num() + ' \\div ' + r * r + ' = ' + h + '$.'], hint: 'Find the base area first, then divide.', chk: { t: 'num', v: V.num() + '/' + r + '^2', why: 'h' } };
    }
    if (kind === 'rr') return { q: 'A cylinder has a volume of $' + piTex(V) + '$ ' + cu(u) + ' and a height of ' + h + ' ' + u + '. What is its radius?', a: { t: 'num', v: String(r) }, unit: u,
      steps: ['$' + piTex(V) + ' = \\pi r^{2} \\cdot ' + h + '$. Divide by $' + h + '\\pi$: $r^{2} = ' + r * r + '$.', '$r = \\sqrt{' + r * r + '} = ' + r + '$ (a length is positive).'], hint: 'Undo the multiplication by h and π, then take a square root.', chk: { t: 'num', v: 'sqrt(' + V.num() + '/' + h + ')', why: 'r' } };
    if (kind === 'approx' || kind === 'word') {
      var ctxt = kind === 'word' ? R.pick([['A can of soup', 'How much soup can it hold'], ['A round water tank', 'How much water can it hold'], ['A candle shaped like a cylinder', 'How much wax is in it']]) : null;
      return { q: (ctxt ? ctxt[0] + ' is a cylinder with radius ' + r + ' ' + u + ' and height ' + h + ' ' + u + '. ' + ctxt[1] + '?' : 'A cylinder has radius ' + r + ' ' + u + ' and height ' + h + ' ' + u + '. Find its volume.') + ' Use 3.14 for $\\pi$ and round to the nearest whole number.', a: approxAns(V), unit: cu(u),
        steps: ['$V = \\pi r^{2} h = \\pi \\cdot ' + r + '^{2} \\cdot ' + h + ' = ' + piTex(V) + '$.', '$' + V.num() + ' \\times 3.14 = ' + U.numStr(U.fix(V.num() * 3.14)) + '$, which rounds to ' + Math.round(3.14 * V.num()) + ' ' + cu(u) + '.'], hint: 'Work it out in terms of π first, then multiply by 3.14.', chk: { t: 'num', v: '3.14*' + r + '^2*' + h, why: 'approx', tol: 0.51 } };
    }
  });

  G('g8.volume-cones', function (R, ctx) {
    var kind = R.pick(by(ctx, ['v', 'v', 'compare', 'trap'], ['v', 'slant', 'h', 'compare', 'trap'], ['slant', 'h', 'v', 'approx', 'trap']));
    var u = R.pick(UNITS), r = R.int(2, 9), h = R.int(2, 12);
    if (ctx.level === 1) { while ((r * r * h) % 3) h = R.int(2, 12); }
    var V = Q(r * r * h, 3), base = Q(r * r);
    var st = ['A cone holds one third of the cylinder with the same base and height.', '$V = \\frac{1}{3} \\pi r^{2} h = \\frac{1}{3} \\cdot \\pi \\cdot ' + r + '^{2} \\cdot ' + h + ' = \\frac{1}{3} \\cdot ' + piTex(Q(r * r * h)) + '$', '$V = ' + piTex(V) + '$ ' + cu(u) + (V.isInt() ? '' : ' (about ' + U.numStr(U.round(V.toNumber() * Math.PI, 1)) + ')') + '.'];
    if (kind === 'v') return { q: 'A cone has a radius of ' + r + ' ' + u + ' and a height of ' + h + ' ' + u + '. Find its volume in terms of $\\pi$.', a: piAns(V), viz: solidViz({ shape: 'cone', r: r, h: h, unit: u }, 'A cone with its measurements'), steps: st, hint: 'Find the matching cylinder’s volume, then take one third.', chk: { t: 'num', v: 'pi*' + r + '^2*' + h + '/3', why: 'cone' } };
    if (kind === 'slant') {
      var SL = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [4, 3, 5], [8, 6, 10], [12, 5, 13]]);
      r = SL[0]; h = SL[1]; var sl = SL[2]; V = Q(r * r * h, 3);
      return { q: 'A cone has a radius of ' + r + ' ' + u + ' and a slant height of ' + sl + ' ' + u + ' (the distance from the tip to the edge of the base). Find its volume in terms of $\\pi$.', a: piAns(V), viz: solidViz({ shape: 'cone', r: r, h: h, slant: true, slantLabel: String(sl), unit: u }, 'A cone with its radius and slant height'),
        steps: ['The formula needs the height (straight up the middle), not the slant height.', 'Height, radius and slant height make a right triangle: $h^{2} = ' + sl + '^{2} - ' + r + '^{2} = ' + (sl * sl - r * r) + '$, so $h = ' + h + '$.', '$V = \\frac{1}{3} \\pi \\cdot ' + r + '^{2} \\cdot ' + h + ' = ' + piTex(V) + '$ ' + cu(u) + '.'], hint: 'Use the Pythagorean theorem to find the height first.', chk: { t: 'num', v: 'pi*' + r + '^2*sqrt(' + sl + '^2-' + r + '^2)/3', why: 'slant' } };
    }
    if (kind === 'h') {
      while ((r * r * h) % 3) h++;
      V = Q(r * r * h, 3);
      return { q: 'A cone has a volume of $' + piTex(V) + '$ ' + cu(u) + ' and a radius of ' + r + ' ' + u + '. What is its height?', a: { t: 'num', v: String(h) }, unit: u,
        steps: ['$' + piTex(V) + ' = \\frac{1}{3} \\pi \\cdot ' + r * r + ' \\cdot h$.', 'Multiply both sides by 3: $' + piTex(V.mul(3)) + ' = ' + r * r + '\\pi h$.', 'Divide by $' + r * r + '\\pi$: $h = ' + V.mul(3).num() + ' \\div ' + r * r + ' = ' + h + '$.'], hint: 'Undo the one third by multiplying by 3.', chk: { t: 'num', v: '3*' + V.num() + '/' + r + '^2', why: 'h' } };
    }
    if (kind === 'compare') {
      var cyl = Q(r * r * h);
      return { q: 'A cylinder and a cone have the same radius and the same height. The cylinder holds $' + piTex(cyl) + '$ ' + cu(u) + '. How much does the cone hold?', a: piAns(cyl.div(3)), viz: { name: 'g8-solid', opts: { mode: 'pour', r: 3, h: 5, controls: false }, label: 'A cone and a cylinder with the same base and height' },
        steps: ['It takes three cones of water to fill a cylinder with the same base and height.', 'So the cone holds one third: $' + piTex(cyl) + ' \\div 3 = ' + piTex(cyl.div(3)) + '$ ' + cu(u) + '.'], hint: 'How many cones fill the matching cylinder?', chk: { t: 'num', v: 'pi*' + cyl.num() + '/3', why: 'compare' } };
    }
    if (kind === 'approx') return { q: 'A cone-shaped paper cup has a radius of ' + r + ' cm and a height of ' + h + ' cm. Find its volume. Use 3.14 for $\\pi$ and round to the nearest whole number.', a: approxAns(V), unit: 'cubic centimeters',
      steps: ['$V = \\frac{1}{3} \\pi r^{2} h = \\frac{1}{3} \\cdot ' + r * r * h + '\\pi = ' + piTex(V) + '$.', '$' + V.toTex() + ' \\times 3.14 \\approx ' + U.numStr(U.round(V.toNumber() * 3.14, 2)) + '$, which rounds to ' + Math.round(3.14 * V.toNumber()) + '.'], hint: 'Find the volume in terms of π first.', chk: { t: 'num', v: '3.14*' + r + '^2*' + h + '/3', why: 'approx', tol: 0.51 } };
    while ((r * r * h) % 3) h++;
    V = Q(r * r * h, 3);
    return { q: 'A cone has a radius of ' + r + ' ' + u + ' and a height of ' + h + ' ' + u + '. Which is its volume?', a: mcq(m$(piTex(V)), [m$(piTex(Q(r * r * h))), m$(piTex(Q(r * h, 3))), m$(piTex(Q(4 * r * r * h, 3)))]),
      steps: ['$V = \\frac{1}{3} \\pi r^{2} h = \\frac{1}{3} \\cdot ' + r * r * h + '\\pi = ' + piTex(V) + '$.', '$' + piTex(Q(r * r * h)) + '$ forgets the $\\frac{1}{3}$: that is the volume of the matching cylinder.'], hint: 'A cone is one third of a cylinder.', chk: { t: 'num', v: 'pi*' + r + '^2*' + h + '/3', why: 'cone', mc: true } };
  });

  G('g8.volume-spheres', function (R, ctx) {
    var kind = R.pick(by(ctx, ['v', 'v', 'd', 'hemi'], ['v', 'd', 'hemi', 'rev', 'approx'], ['d', 'rev', 'combo', 'hemi', 'approx']));
    var u = R.pick(UNITS), r = ctx.level === 1 ? (R.chance(0.6) ? R.pick([3, 6, 9, 12]) : R.int(2, 10)) : R.int(2, 12), V = Q(4 * r * r * r, 3);
    var st = ['$V = \\frac{4}{3} \\pi r^{3} = \\frac{4}{3} \\cdot \\pi \\cdot ' + r + '^{3} = \\frac{4}{3} \\cdot ' + r * r * r + '\\pi$', '$V = ' + piTex(V) + '$ ' + cu(u) + (V.isInt() ? '' : ' (about ' + U.numStr(U.round(V.toNumber() * Math.PI, 1)) + ')') + '.'];
    if (kind === 'v' || kind === 'd') {
      if (kind === 'd') st.unshift('The radius is half the diameter: $r = ' + 2 * r + ' \\div 2 = ' + r + '$.');
      return { q: R.pick(['A sphere', 'A ball', 'A globe', 'A round lantern', 'A gumball', 'A model planet', 'A snow globe', 'A bead']) + ' has a ' + (kind === 'd' ? 'diameter of ' + 2 * r : 'radius of ' + r) + ' ' + u + '. Find its volume in terms of $\\pi$.', a: piAns(V), viz: solidViz({ shape: 'sphere', r: r, diam: kind === 'd', unit: u }, 'A sphere with its measurement'), steps: st, hint: kind === 'd' ? 'Halve the diameter first. Then V = (4/3)πr³.' : 'V = (4/3)πr³: cube the radius first.', chk: { t: 'num', v: '4/3*pi*' + r + '^3', why: 'sphere' } };
    }
    if (kind === 'hemi') {
      var Hm = Q(2 * r * r * r, 3);
      return { q: 'A bowl is shaped like a hemisphere (half a sphere) with a radius of ' + r + ' ' + u + '. How much can it hold? Give the answer in terms of $\\pi$.', a: piAns(Hm),
        steps: ['A whole sphere: $\\frac{4}{3} \\pi \\cdot ' + r + '^{3} = ' + piTex(V) + '$.', 'Half of it: $' + piTex(V) + ' \\div 2 = ' + piTex(Hm) + '$ ' + cu(u) + '.'], hint: 'Find the volume of the whole sphere, then halve it.', chk: { t: 'num', v: '2/3*pi*' + r + '^3', why: 'hemi' } };
    }
    if (kind === 'rev') {
      r = R.pick([3, 6, 9, 3]); V = Q(4 * r * r * r, 3);
      return { q: 'A ball has a volume of $' + piTex(V) + '$ ' + cu(u) + '. What is its radius?', a: { t: 'num', v: String(r) }, unit: u,
        steps: ['$\\frac{4}{3} \\pi r^{3} = ' + piTex(V) + '$. Divide both sides by $\\pi$: $\\frac{4}{3} r^{3} = ' + V.num() + '$.', 'Multiply by $\\frac{3}{4}$: $r^{3} = ' + r * r * r + '$.', '$r = \\sqrt[3]{' + r * r * r + '} = ' + r + '$'], hint: 'Undo each step: divide by π, multiply by 3/4, then take a cube root.', chk: { t: 'num', v: '(3*' + V.num() + '/4)^(1/3)', why: 'rev' } };
    }
    if (kind === 'approx') return { q: 'A sphere has a radius of ' + r + ' ' + u + '. Find its volume. Use 3.14 for $\\pi$ and round to the nearest whole number.', a: approxAns(V), unit: cu(u),
      steps: st.slice(0, 1).concat(['$' + V.toTex() + ' \\times 3.14 \\approx ' + U.numStr(U.round(V.toNumber() * 3.14, 2)) + '$, which rounds to ' + Math.round(3.14 * V.toNumber()) + '.']), hint: 'Find the volume in terms of π first.', chk: { t: 'num', v: '4/3*3.14*' + r + '^3', why: 'approx', tol: 0.51 } };
    var rc = R.pick([2, 3, 4, 6]), hc = R.int(2, 4) * 3, cone = Q(rc * rc * hc, 3), hemi = Q(2 * rc * rc * rc, 3), tot = cone.add(hemi);
    return { q: 'An ice cream cone is a cone with radius ' + rc + ' cm and height ' + hc + ' cm, topped with a hemisphere of ice cream with the same radius. What is the total volume, in terms of $\\pi$?', a: piAns(tot), unit: 'cubic centimeters',
      steps: ['Cone: $\\frac{1}{3} \\pi \\cdot ' + rc + '^{2} \\cdot ' + hc + ' = ' + piTex(cone) + '$.', 'Hemisphere: $\\frac{1}{2} \\cdot \\frac{4}{3} \\pi \\cdot ' + rc + '^{3} = ' + piTex(hemi) + '$.', 'Total: $' + piTex(cone) + ' + ' + piTex(hemi) + ' = ' + piTex(tot) + '$.'], hint: 'Find each part, then add.', chk: { t: 'num', v: 'pi*' + rc + '^2*' + hc + '/3+2/3*pi*' + rc + '^3', why: 'combo' } };
  });

  // ================================================================ Unit 11: data in two variables
  function scatterPts(R, n, m, b, noise, xmax) {
    var xs = R.sample(U.range(1, xmax || 12), n).sort(function (p, q) { return p - q; });
    return xs.map(function (x) { return [x, U.round(m * x + b + (R.next() * 2 - 1) * noise, 1)]; });
  }
  function scatterViz(pts, o) {
    var ys = pts.map(function (p) { return p[1]; }), xs = pts.map(function (p) { return p[0]; });
    var ymax = Math.max.apply(null, ys), ystep = ymax > 60 ? 10 : ymax > 24 ? 5 : ymax > 12 ? 2 : 1, xmax = Math.max.apply(null, xs);
    var opts = { xmin: 0, xmax: Math.ceil((xmax + 1) / (xmax > 12 ? 2 : 1)) * (xmax > 12 ? 2 : 1), ymin: 0, ymax: Math.ceil((ymax + ystep) / ystep) * ystep, xstep: xmax > 12 ? 2 : 1, ystep: ystep, equal: false, height: 290, xlabel: o.xlabel || 'x', ylabel: o.ylabel || 'y', points: pts.map(function (p, i) { return { x: p[0], y: p[1], color: o.labels && o.labels[i] ? 'red' : 'blue', label: o.labels ? o.labels[i] || '' : '', r: 4.5 }; }) };
    if (o.lines) opts.lines = o.lines;
    return plot(opts, o.label || 'A scatter plot');
  }

  var SCTX = {
    positive: [['hours of practice', 'points scored', 'players'], ['days of growth', 'height (cm)', 'plants'], ['study time (hours)', 'quiz score', 'students'], ['age (years)', 'height (inches)', 'children'], ['outdoor temperature (°F)', 'cold drinks sold', 'days']],
    negative: [['price (dollars)', 'number sold', 'products'], ['hours of TV per day', 'hours of sleep', 'students'], ['age of a car (years)', 'value (thousands of dollars)', 'cars'], ['outdoor temperature (°F)', 'hot drinks sold', 'days']],
    none: [['shoe size', 'quiz score', 'students'], ['birth month', 'height (inches)', 'adults'], ['house number', 'age (years)', 'neighbors']]
  };
  G('g8.scatter-plots', function (R, ctx) {
    var kind = R.pick(by(ctx, ['assoc', 'assoc', 'context', 'outlier'], ['assoc', 'outlier', 'linear', 'context'], ['assoc', 'outlier', 'linear', 'context']));
    var type = R.pick(['positive', 'negative', 'none']), SC = R.pick(SCTX[kind === 'assoc' ? type : 'positive']), np = R.int(9, 12), lead = 'The scatter plot shows ' + SC[0].replace(/ \(.*\)/, '') + ' ($x$) and ' + SC[1].replace(/ \(.*\)/, '') + ' ($y$) for ' + np + ' ' + SC[2] + '. ';
    if (kind === 'assoc') {
      var pts;
      if (type === 'positive') pts = scatterPts(R, np, R.pick([1.5, 2, 2.5]), R.int(2, 6), 2.2);
      else if (type === 'negative') pts = scatterPts(R, np, -R.pick([1.5, 2, 2.5]), 34, 2.2);
      else { var xs = R.sample(U.range(1, 12), np).sort(function (p, q) { return p - q; }); pts = xs.map(function (x) { return [x, U.round(4 + R.next() * 16, 1)]; }); }
      if (type === 'none') { // make sure there is no clear trend: correlation near 0
        var n = pts.length, mx = U.mean(pts.map(function (p) { return p[0]; })), my = U.mean(pts.map(function (p) { return p[1]; })), sxy = 0, sxx = 0, syy = 0;
        pts.forEach(function (p) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) * (p[0] - mx); syy += (p[1] - my) * (p[1] - my); });
        var rr = sxy / Math.sqrt(sxx * syy); if (Math.abs(rr) > 0.3) { pts = pts.map(function (p, i) { return [p[0], U.round(4 + ((i * 7) % 11) * 1.5, 1)]; }); }
      }
      var ch = ['positive association', 'negative association', 'no association'];
      return { q: lead + 'What kind of association does it show?', a: { t: 'mc', choices: ch.slice(), v: ['positive', 'negative', 'none'].indexOf(type), keep: true }, viz: scatterViz(pts, { xlabel: SC[0], ylabel: SC[1] }),
        steps: [type === 'positive' ? 'As $x$ increases, $y$ tends to increase: the points rise from left to right.' : type === 'negative' ? 'As $x$ increases, $y$ tends to decrease: the points fall from left to right.' : 'The points are scattered with no upward or downward pattern.', 'So the plot shows ' + ch[['positive', 'negative', 'none'].indexOf(type)] + '.'], hint: 'Read the cloud of points from left to right: does it go up, down or neither?', chk: { t: 'corr', pts: pts, type: type } };
    }
    if (kind === 'outlier') {
      var pts2 = scatterPts(R, np, R.pick([2, 2.5, 3]), R.int(2, 5), 1.5, 12), j = R.int(2, np - 3), labs = ['A', 'B', 'C', 'D'];
      var off = R.coin() ? 1 : -1; pts2[j] = [pts2[j][0], U.round(Math.max(1, pts2[j][1] + off * R.int(12, 16)), 1)];
      if (off < 0 && pts2[j][1] < 3) pts2[j][1] = pts2[j][1] + 30;
      var others = R.sample(U.range(0, pts2.length - 1).filter(function (z) { return z !== j; }), 3), cand = R.shuffle([j].concat(others)), lab = pts2.map(function () { return ''; });
      cand.forEach(function (ci, i) { lab[ci] = labs[i]; });
      return { q: lead + 'Which labeled point is an outlier?', a: { t: 'mc', choices: labs.slice(), v: cand.indexOf(j), keep: true }, viz: scatterViz(pts2, { labels: lab, xlabel: SC[0], ylabel: SC[1] }),
        steps: ['Most points follow a clear upward trend.', 'An outlier is far from the pattern of the others.', 'Point ' + labs[cand.indexOf(j)] + ' at $' + ptT(pts2[j][0], pts2[j][1]) + '$ is far ' + (off > 0 ? 'above' : 'below') + ' the trend.'], hint: 'Which point sits far away from the trend of the rest?', chk: { t: 'outlier', pts: pts2, j: j } };
    }
    if (kind === 'linear') {
      var lin = R.coin(), xs2 = U.range(1, np), pts3 = lin ? xs2.map(function (x) { return [x, U.round(3 * x + 2 + (R.next() * 2 - 1) * 1.5, 1)]; }) : xs2.map(function (x) { return [x, U.round(0.4 * x * x + 1 + (R.next() * 2 - 1) * 0.8, 1)]; });
      return { q: lead + 'Is the association linear or nonlinear?', a: { t: 'mc', choices: ['linear', 'nonlinear'], v: lin ? 0 : 1, keep: true }, viz: scatterViz(pts3, { xlabel: SC[0], ylabel: SC[1] }),
        steps: [lin ? 'The points cluster around a straight line.' : 'The points bend: they rise slowly at first, then faster and faster.', lin ? 'So the association is linear.' : 'A straight line would not follow them well, so the association is nonlinear.'], hint: 'Could a straight line follow the points closely?', chk: { t: 'ok' } };
    }
    var C = R.pick([['the outdoor temperature', 'the number of hot drinks a café sells', 'negative'], ['a person’s height', 'their arm span', 'positive'], ['a student’s shoe size', 'their score on a spelling test', 'none'], ['hours spent practicing piano', 'mistakes in a recital', 'negative'], ['the number of hours of daylight', 'the time spent outdoors', 'positive'], ['a car’s age in years', 'its resale value', 'negative'], ['the last digit of a phone number', 'height', 'none'], ['the number of people in a household', 'the amount of milk the household buys', 'positive'], ['the speed of a runner', 'the time it takes to finish a race', 'negative'], ['a person’s birth month', 'their height', 'none'], ['the size of a TV screen', 'its price', 'positive'], ['the number of absences', 'the grade in a class', 'negative'], ['the distance of a trip', 'the gas used', 'positive']]);
    var ch2 = ['positive association', 'negative association', 'no association'];
    return { q: 'A scatter plot compares ' + C[0] + ' ($x$) with ' + C[1] + ' ($y$). Which association would you expect?', a: { t: 'mc', choices: ch2.slice(), v: ['positive', 'negative', 'none'].indexOf(C[2]), keep: true },
      steps: [C[2] === 'positive' ? 'When one is larger, the other tends to be larger too.' : C[2] === 'negative' ? 'When one is larger, the other tends to be smaller.' : 'There is no reason for one to change with the other.', 'So expect ' + ch2[['positive', 'negative', 'none'].indexOf(C[2])] + '. (An association alone does not prove that one causes the other.)'], hint: 'As x gets bigger, what tends to happen to y?', chk: { t: 'ok' } };
  });

  G('g8.line-of-fit', function (R, ctx) {
    var kind = R.pick(by(ctx, ['predict', 'predict', 'interpret', 'good'], ['predict', 'eq', 'interpret', 'best', 'good'], ['eq', 'best', 'predict', 'interpret']));
    var S = R.pick([{ x: 'hours studied', y: 'test score', m: [4, 8], b: [40, 60], xr: [1, 8] }, { x: 'age of a tree (years)', y: 'height (feet)', m: [1, 3], b: [2, 8], xr: [2, 15] }, { x: 'temperature (°F)', y: 'cold drinks sold', m: [2, 5], b: [-60, -20], xr: [50, 90] }, { x: 'weeks of training', y: 'push-ups in a row', m: [2, 4], b: [5, 15], xr: [1, 10] }]);
    var m = R.int(S.m[0], S.m[1]), b = R.int(S.b[0], S.b[1]);
    if (kind === 'predict') {
      var x = R.int(S.xr[0], S.xr[1]), y = m * x + b;
      return { q: 'A line of fit for data on ' + S.x + ' ($x$) and ' + S.y + ' ($y$) is $y = ' + T.lin(m, 'x', b) + '$. What does it predict for $x = ' + x + '$?', a: { t: 'num', v: String(y) },
        steps: ['Substitute $x = ' + x + '$: $y = ' + m + ' \\cdot ' + x + T.signed(b) + '$.', '$y = ' + m * x + T.signed(b) + ' = ' + y + '$.', 'This is a prediction from the trend; actual values may be a bit higher or lower.'], hint: 'Put the x-value into the equation.', chk: { t: 'num', v: m + '*' + x + '+(' + b + ')', why: 'predict' } };
    }
    if (kind === 'interpret') {
      return { q: 'A line of fit for data on ' + S.x + ' ($x$) and ' + S.y + ' ($y$) is $y = ' + T.lin(m, 'x', b) + '$. What does the slope, ' + m + ', mean?', a: mcq('For each 1 more unit of ' + S.x.replace(/ \(.*\)/, '') + ', the ' + S.y.replace(/ \(.*\)/, '') + ' tends to go up by about ' + m + '.', ['The ' + S.y.replace(/ \(.*\)/, '') + ' is always exactly ' + m + '.', 'The ' + S.y.replace(/ \(.*\)/, '') + ' is ' + m + ' when the ' + S.x.replace(/ \(.*\)/, '') + ' is 0.', 'Every data point lies on the line.']),
        steps: ['The slope is the change in $y$ for each increase of 1 in $x$.', 'On a line of fit it describes the trend, so it says what tends to happen, about ' + m + ' more for each 1 more.'], hint: 'Slope = change in y per 1 change in x.', chk: { t: 'ok' } };
    }
    if (kind === 'good') return { q: 'Which line is the best choice for a line of fit on a scatter plot?', a: mcq('A line that follows the trend, with about as many points above it as below it', ['A line through the first and last points', 'A line through as many points as possible, even if most other points are on one side', 'A line that always starts at $(0, 0)$']),
      steps: ['A line of fit should show the overall trend of all the points.', 'The first and last points might be unusual, so a line through them can miss the trend.', 'A good line runs through the middle of the cloud, with points balanced above and below it.'], hint: 'Think about all the points, not just a few.', chk: { t: 'ok' } };
    // a scatter plot with a fitted line through two marked points
    var mm = R.pick([Q(1, 2), Q(1), Q(2), Q(3, 2), Q(-1, 2), Q(-1)]), bb = mm.sign() > 0 ? R.int(1, 4) : R.int(8, 11);
    var xs = U.range(1, 10), pts = xs.map(function (x) { return [x, U.round(mm.toNumber() * x + bb + (R.next() * 2 - 1) * 1.2, 1)]; });
    if (kind === 'eq') {
      var x1 = mm.den(), x2 = mm.den() * (mm.den() === 1 ? 6 : 4), P1 = [x1, mm.mul(x1).add(bb).toNumber()], P2 = [x2, mm.mul(x2).add(bb).toNumber()];
      var vz = scatterViz(pts, { lines: [{ m: mm.toNumber(), b: bb, color: 'green' }], label: 'A scatter plot with a line of fit' });
      vz.opts.points = vz.opts.points.concat([{ x: P1[0], y: P1[1], color: 'red', coords: true, r: 6 }, { x: P2[0], y: P2[1], color: 'red', coords: true, r: 6 }]);
      return { q: 'The scatter plot shows a line of fit through the two marked points. Write its equation in slope-intercept form.', a: { t: 'eq', v: 'y = ' + linNice(mm, bb), form: 'slope' }, viz: vz,
        steps: ['Use the two marked points on the line: $' + ptQ(P1) + '$ and $' + ptQ(P2) + '$.', 'Slope: $m = \\dfrac{' + U.numStr(P2[1]) + ' - ' + T.p(U.numStr(P1[1])) + '}{' + P2[0] + ' - ' + P1[0] + '} = ' + mm.toTex() + '$.', '$b = ' + U.numStr(P1[1]) + ' - ' + T.p(mm) + ' \\cdot ' + P1[0] + ' = ' + bb + '$, so $y = ' + linTex(mm, bb) + '$.'], hint: 'Use the marked points, not the data points.', chk: { t: 'line', m: mm.toPlain(), b: String(bb), pts: [P1, P2] } };
    }
    // best: which equation fits the points best?
    var cand = [[mm, bb], [mm.neg(), bb + mm.toNumber() * 10], [mm, bb + 5], [mm.mul(2), bb]];
    function sse(l) { return pts.reduce(function (s, p) { var e = p[1] - (Q.from(l[0]).toNumber() * p[0] + Number(l[1])); return s + e * e; }, 0); }
    var errs = cand.map(sse), best = errs.indexOf(Math.min.apply(null, errs));
    var tex = cand.map(function (l) { return m$('y = ' + linTex(l[0], U.round(Number(l[1]), 1))); });
    return { q: 'Which equation is the best line of fit for the scatter plot?', a: mcq(tex[0], tex.slice(1)), viz: scatterViz(pts, {}),
      steps: ['Estimate the trend: the points ' + (mm.sign() > 0 ? 'rise' : 'fall') + ' by about $' + mm.abs().toTex() + '$ for each 1 step right, starting near $y = ' + bb + '$ at $x = 0$.', 'So the slope should be about $' + mm.toTex() + '$ and the $y$-intercept about ' + bb + '.', 'That matches $y = ' + linTex(mm, bb) + '$. The others have the wrong slope or sit above most of the points.'], hint: 'Check the slope’s sign and size first, then the y-intercept.', chk: { t: 'bestfit', errs: errs, best: best } };
  });

  G('g8.two-way-tables', function (R, ctx) {
    var kind = R.pick(by(ctx, ['fill', 'fill', 'rel'], ['fill', 'rel', 'col', 'assoc'], ['rel', 'col', 'assoc', 'fill']));
    var S = R.pick([{ rows: ['7th graders', '8th graders'], cols: ['play an instrument', 'do not'], rl: '7th grade', rl2: '8th grade' }, { rows: ['students who walk to school', 'students who ride'], cols: ['ate breakfast', 'did not'], rl: 'walk', rl2: 'ride' }, { rows: ['dog owners', 'non-owners'], cols: ['exercise daily', 'do not'], rl: 'dog owners', rl2: 'non-owners' }]);
    var tot1 = R.pick([20, 25, 40, 50]), tot2 = R.pick([20, 25, 40, 50]);
    var p1 = R.pick(tot1 === 25 ? [20, 40, 60, 80] : tot1 === 40 ? [25, 50, 75, 20, 40, 60, 80] : [20, 30, 40, 50, 60, 70, 80]);
    var assoc = R.coin(), p2 = assoc ? (p1 >= 50 ? p1 - R.pick([30, 40]) : p1 + R.pick([30, 40])) : p1;
    if (tot2 === 25 && p2 % 4) p2 = p2 + (4 - p2 % 4) <= 100 ? p2 + (4 - p2 % 4) : p2 - p2 % 4;
    if (tot2 === 40 && p2 % 5 && p2 % 25) p2 -= p2 % 5;
    var a = tot1 * p1 / 100, b = tot1 - a, c = Math.round(tot2 * p2 / 100), d = tot2 - c; p2 = 100 * c / tot2;
    function table(hide) {
      var cells = [[a, b, a + b], [c, d, c + d], [a + c, b + d, a + b + c + d]], lab = [S.rows[0], S.rows[1], 'Total'];
      return '$$\\begin{array}{l|cc|c} & \\text{' + S.cols[0] + '} & \\text{' + S.cols[1] + '} & \\text{Total} \\\\ \\hline ' + cells.map(function (r, i) { return '\\text{' + lab[i] + '} & ' + r.map(function (v, j) { return hide && hide[0] === i && hide[1] === j ? '?' : v; }).join(' & ') + ' \\\\ ' + (i === 1 ? '\\hline ' : ''); }).join('') + '\\end{array}$$';
    }
    if (kind === 'fill') {
      var hide = [R.int(0, 1), R.int(0, 1)], cells = [[a, b], [c, d]], val = cells[hide[0]][hide[1]];
      var rowT = hide[0] === 0 ? a + b : c + d, other = cells[hide[0]][1 - hide[1]];
      return { q: 'Some students were surveyed. Find the missing number in the two-way table.' + table(hide), a: { t: 'num', v: String(val) },
        steps: ['Each row adds up to its total.', 'In the row for ' + S.rows[hide[0]] + ': $\\text{?} + ' + other + ' = ' + rowT + '$.', 'So the missing number is $' + rowT + ' - ' + other + ' = ' + val + '$. (The column total checks it too.)'], hint: 'Use the row total (or the column total).', chk: { t: 'num', v: String(rowT - other), why: 'fill' } };
    }
    if (kind === 'rel') return { q: 'What percent of the ' + S.rows[0] + ' ' + S.cols[0] + '?' + table(), a: { t: 'num', v: String(p1), pct: true },
      steps: ['Use only the row for ' + S.rows[0] + ': ' + a + ' out of ' + (a + b) + '.', '$\\dfrac{' + a + '}{' + (a + b) + '} = ' + U.numStr(U.fix(a / (a + b))) + ' = ' + p1 + '\\%$'], hint: 'Divide the cell by its row total.', chk: { t: 'num', v: '100*' + a + '/' + (a + b), why: 'row pct' } };
    if (kind === 'col') { var pc = Q(100 * a, a + c); if (!pc.isInt()) return { q: 'What fraction of the students who ' + S.cols[0] + ' are ' + S.rows[0] + '?' + table(), a: { t: 'num', v: Q(a, a + c).toPlain() }, steps: ['Use only the column for "' + S.cols[0] + '": ' + (a + c) + ' students in all.', 'Of those, ' + a + ' are ' + S.rows[0] + ': $\\dfrac{' + a + '}{' + (a + c) + '} = ' + Q(a, a + c).toTex() + '$.'], hint: 'This time divide by the column total.', chk: { t: 'num', v: a + '/' + (a + c), why: 'col frac' } };
      return { q: 'What percent of the students who ' + S.cols[0] + ' are ' + S.rows[0] + '?' + table(), a: { t: 'num', v: pc.toPlain(), pct: true }, steps: ['Use only the column for "' + S.cols[0] + '": ' + (a + c) + ' students in all.', 'Of those, ' + a + ' are ' + S.rows[0] + ': $\\dfrac{' + a + '}{' + (a + c) + '} = ' + pc.toPlain() + '\\%$.'], hint: 'This time divide by the column total.', chk: { t: 'num', v: '100*' + a + '/' + (a + c), why: 'col pct' } }; }
    var r1 = Math.round(100 * a / (a + b)), r2 = Math.round(100 * c / (c + d)), has = Math.abs(r1 - r2) >= 20;
    return { q: 'Is there an association between being in a row group and ' + S.cols[0] + '? Compare row percentages.' + table(), a: { t: 'mc', choices: ['Yes: ' + r1 + '% of ' + S.rows[0] + ' and ' + r2 + '% of ' + S.rows[1] + ' ' + S.cols[0] + '.', 'No: ' + r1 + '% of ' + S.rows[0] + ' and ' + r2 + '% of ' + S.rows[1] + ' ' + S.cols[0] + ', about the same.'], v: has ? 0 : 1, keep: true },
      steps: [S.rows[0] + ': $\\frac{' + a + '}{' + (a + b) + '} = ' + r1 + '\\%$. ' + S.rows[1] + ': $\\frac{' + c + '}{' + (c + d) + '} = ' + r2 + '\\%$.', has ? 'The percents are far apart, so there is an association: the groups behave differently.' : 'The percents are about the same, so there is no association.', 'Compare percents, not raw counts, because the rows have different totals.'], hint: 'Find the percent within each row, then compare.', chk: { t: 'assoc2', a: a, b: b, c: c, d: d, has: has } };
  });

})(window.MathLadder);
