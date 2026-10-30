// ---- 00-head.js
/* Math Ladder problem generators for Real Analysis (course key ra). Built from /tmp/work_ra/gen/*.js by build.js.
   Every answer is computed from the generated numbers with exact rationals (ML.Q) or exact surds, and checked again
   independently by /tmp/work_ra/test/verify.js (numeric brute force over n and x, CAS evaluation of the formulas).
   p.data holds the problem's parameters (formulas as CAS strings) for that check; pages ignore it.
   "Any N that works" and "any δ that works" answers use the satisfies range of check.js:
     anyN(N0)     { t: 'num', v: N0, satisfies: { min: N0, int: true } }   (always inside a multi part)
     upTo(d)      { t: 'num', v: d, satisfies: { min: 0, minOpen: true, max: d } }  (d = the largest value that works)
   Pictures in problems use the course visuals (static/math/viz/ra.js) with quiet: true and edit: false.          */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util, Q = ML.Q, M = Math;

  // ---------------------------------------------------------------- answers
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function num(v, o) { return Object.assign({ t: 'num', v: String(v) }, o || {}); }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function mc(correct, wrongs) { var ch = [correct], seen = {}; seen[correct] = 1; wrongs.forEach(function (w) { if (!seen[w]) { seen[w] = 1; ch.push(w); } }); return { t: 'mc', choices: ch, v: 0 }; }
  function mcAll(choices, idx) { return { t: 'mc', choices: choices, v: idx.slice().sort(function (a, b) { return a - b; }) }; }
  function setA(arr) { return { t: 'set', v: arr.map(String) }; }
  function expr(v, vars) { return { t: 'expr', v: v, vars: vars }; }
  function multi(parts) { return { t: 'multi', parts: parts }; }
  function part(label, a) { return { label: label, a: a }; }
  function anyN(n0) { return { t: 'num', v: String(n0), satisfies: { min: n0, int: true } }; }
  function upTo(dPlain) { return { t: 'num', v: String(dPlain), satisfies: { min: 0, minOpen: true, max: String(dPlain) } }; }
  function seqText(arr) { // an order of labels typed many ways: "C, A, B", "CAB", "C A B", "C-A-B", "C → A → B"
    var j = [', ', '', ' ', ',', '-', ' - ', ' → ', '→', ' -> ', '->'], out = [];
    j.forEach(function (s) { var t = arr.join(s); if (out.indexOf(t) < 0) out.push(t); });
    return { t: 'text', v: out };
  }
  // proof steps to put in order: steps = the correct order; returns { list (HTML), answer spec, order (labels) }
  function orderTask(R, steps) {
    var L = 'ABCDEFG'.slice(0, steps.length).split(''), idx = R.shuffle(steps.map(function (_, i) { return i; }));
    var tries = 0; while (idx.every(function (v, i) { return v === i; }) && tries++ < 5) idx = R.shuffle(idx);
    var lines = idx.map(function (si, k) { return '<b>' + L[k] + '.</b> ' + steps[si]; });
    var ans = steps.map(function (_, si) { return L[idx.indexOf(si)]; });
    return { list: lines.join('<br>'), a: seqText(ans), order: ans };
  }

  // ---------------------------------------------------------------- exact numbers
  function q(x) { return Q.from(x); }
  function qt(x) { return T.num(q(x)); }            // TeX of a rational
  function qp(x) { return q(x).toPlain(); }         // plain (CAS) form of a rational
  function qfloor(x) { return Number(q(x).floor().toString()); }
  function qceil(x) { return -qfloor(q(x).neg()); }
  function qmax(a, b) { return q(a).ge(q(b)) ? q(a) : q(b); }
  function qmin(a, b) { return q(a).le(q(b)) ? q(a) : q(b); }
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function isq(n) { var r = M.round(M.sqrt(n)); return r * r === n; }
  // sqrt of a nonnegative rational r as a simplified surd: k·√m / d  -> { tex, plain, val, rational: Q|null }
  function surd(r) {
    r = q(r); var n = Number(r.n), d = Number(r.d), p = n * d; // √(n/d) = √(n·d)/d
    var sr = U.simplifyRadical(p), k = sr[0], m = sr[1], g = gcd(k, d); k /= g; var dd = d / g;
    var val = M.sqrt(n / d);
    if (m === 1) { var rq = Q(k, dd); return { tex: T.num(rq), plain: rq.toPlain(), val: val, rational: rq }; }
    var core = (k === 1 ? '' : k) + '\\sqrt{' + m + '}', corep = (k === 1 ? '' : k + '*') + 'sqrt(' + m + ')';
    return { tex: dd === 1 ? core : '\\frac{' + core + '}{' + dd + '}', plain: dd === 1 ? corep : corep + '/' + dd, val: val, rational: null };
  }
  // a surd plus a rational: s.tex + c  (s from surd(), c a rational)
  function surdPlus(s, c) {
    c = q(c); if (c.isZero()) return s;
    if (s.rational) { var r = s.rational.add(c); return { tex: T.num(r), plain: r.toPlain(), val: r.toNumber(), rational: r }; }
    var neg = c.sign() < 0, a = c.abs();
    return { tex: s.tex + (neg ? ' - ' : ' + ') + T.num(a), plain: s.plain + (neg ? '-' : '+') + '(' + a.toPlain() + ')', val: s.val + c.toNumber(), rational: null };
  }
  // ε values: exact, with how they print
  var EPS_DEC = ['0.1', '0.05', '0.02', '0.01', '0.005', '0.002', '0.001'];
  var EPS_FRAC = ['1/10', '1/20', '1/50', '1/100', '1/200', '1/1000'];
  function epsTex(e) { return /\//.test(String(e)) ? T.num(q(e)) : String(e); }
  function epsPick(R, lvl) { return lvl === 1 ? R.pick(['0.1', '0.05', '0.01', '1/10', '1/100', '0.2', '0.02', '1/20', '1/50', '0.04', '1/25', '0.08']) : lvl === 2 ? R.pick(['0.02', '0.01', '0.005', '1/50', '1/200', '0.004', '1/250', '0.008', '1/125', '0.0125', '1/80', '0.006']) : R.pick(['0.002', '0.001', '1/500', '1/1000', '0.0025', '0.0005', '1/2000', '0.0004', '1/400', '1/800', '0.0008', '0.0015']); }
  function E(e) { return '\\varepsilon = ' + epsTex(e); }
  // smallest n >= lo with test(n) true (test monotone: false … false true true …); exact tests only
  function firstN(test, lo, hi) { lo = lo || 1; hi = hi || 1e7; for (var n = lo; n <= hi; n++) if (test(n)) return n; throw new Error('firstN: none below ' + hi); }
  function firstNfast(test, lo) { // doubling + bisection, for monotone tests
    lo = lo || 1; if (test(lo)) return lo; var a = lo, b = lo * 2; while (!test(b)) { a = b; b *= 2; if (b > 1e12) throw new Error('firstNfast: too large'); }
    while (b - a > 1) { var m = M.floor((a + b) / 2); if (test(m)) b = m; else a = m; } return b;
  }
  function fact(n) { return U.factorial(n); }
  function pow2(n) { return M.pow(2, n); }
  function plural(n, w, ws) { return n + ' ' + (n === 1 ? w : (ws || w + 's')); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function tex(plain) { return T.plain(plain); }    // plain math -> TeX (tex.js)
  function setTex(arr) { return arr.length ? '\\{' + arr.join(', ') + '\\}' : '\\varnothing'; }
  function abs(s) { return '\\left|' + s + '\\right|'; }
  var LIMSUP = '\\limsup_{n \\to \\infty}', LIMINF = '\\liminf_{n \\to \\infty}', LIMN = '\\lim_{n \\to \\infty}';
  var BOX = '\\boxed{\\;?\\;}';

// ---- 01-reals.js
  // ================================================================ Unit 1: The Real Numbers

  G('ra.absolute-value', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['interval', 'bound']), R.pick(['interval2', 'bound', 'reverse']), R.pick(['punct', 'reverse', 'which', 'bound2']));
    if (shape === 'interval' || shape === 'punct') {
      var a = R.nz(-9, 9), r = q(L === 1 ? R.pick(['1', '2', '3', '1/2', '0.1']) : R.pick(['1/2', '0.1', '0.01', '2', '1/4']));
      var lo = q(a).sub(r), hi = q(a).add(r), aT = String(a), xa = T.lin(1, 'x', -a);
      if (shape === 'interval') return { q: 'Write the set of all $x$ with $' + abs(xa) + ' < ' + T.num(r) + '$ as an interval.', a: { t: 'interval', v: '(' + lo.toPlain() + ', ' + hi.toPlain() + ')' },
        steps: ['$' + abs(xa) + ' < ' + T.num(r) + '$ means the distance from $x$ to $' + aT + '$ is less than $' + T.num(r) + '$.', 'So $' + T.num(r.neg()) + ' < ' + xa + ' < ' + T.num(r) + '$, that is, $' + T.num(lo) + ' < x < ' + T.num(hi) + '$.', 'As an interval: $(' + T.num(lo) + ', ' + T.num(hi) + ')$, with open ends because the inequality is strict.'],
        hint: 'Unwrap it as $-r < x - a < r$.', data: { k: 'abs-int', a: a, r: r.toPlain() } };
      return { q: 'Write the set of all $x$ with $0 < ' + abs(xa) + ' < ' + T.num(r) + '$ as a union of intervals (use U for the union).', a: { t: 'interval', v: '(' + lo.toPlain() + ', ' + a + ') U (' + a + ', ' + hi.toPlain() + ')' },
        steps: ['$' + abs(xa) + ' < ' + T.num(r) + '$ gives $' + T.num(lo) + ' < x < ' + T.num(hi) + '$.', 'The condition $0 < ' + abs(xa) + '$ removes one point: $x \\ne ' + aT + '$.', 'So the set is $(' + T.num(lo) + ', ' + aT + ') \\cup (' + aT + ', ' + T.num(hi) + ')$, the "punctured" neighborhood used in limits of functions.'],
        hint: 'What does $0 < |x - a|$ rule out?', data: { k: 'abs-punct', a: a, r: r.toPlain() } };
    }
    if (shape === 'interval2') {
      var c = R.int(2, 5), b = R.int(-12, 12), d = R.int(1, 9), lo2 = Q(b - d, c), hi2 = Q(b + d, c);
      return { q: 'Write the set of all $x$ with $' + abs(T.lin(c, 'x', -b)) + ' \\le ' + d + '$ as an interval.', a: { t: 'interval', v: '[' + lo2.toPlain() + ', ' + hi2.toPlain() + ']' },
        steps: ['Unwrap: $-' + d + ' \\le ' + T.lin(c, 'x', -b) + ' \\le ' + d + '$.', 'Add $' + T.num(b) + '$: $' + (b - d) + ' \\le ' + c + 'x \\le ' + (b + d) + '$.', 'Divide by $' + c + '$: $' + T.num(lo2) + ' \\le x \\le ' + T.num(hi2) + '$, the interval $[' + T.num(lo2) + ', ' + T.num(hi2) + ']$ (closed, since the inequality allows equality).'],
        hint: 'Write $-d \\le cx - b \\le d$ and solve the double inequality.', data: { k: 'abs-int2', c: c, b: b, d: d } };
    }
    if (shape === 'bound' || shape === 'bound2') {
      var a3 = R.nz(-6, 6), r3 = q(R.pick(['1', '1', '2', '1/2'])), b3 = shape === 'bound2' ? a3 : R.intNot(-6, 6, [-a3]);
      var lo3 = q(a3 + b3).sub(r3), hi3 = q(a3 + b3).add(r3), Mv = q(M.abs(a3 + b3)).add(r3);
      var xb = T.lin(1, 'x', b3), lead = shape === 'bound2' ? 'To bound $' + abs('x^{2} - ' + (a3 * a3)) + ' = ' + abs(T.lin(1, 'x', -a3)) + '\\,' + abs(xb) + '$, a proof first restricts $x$ so that $' + abs(T.lin(1, 'x', -a3)) + ' < ' + T.num(r3) + '$. ' : 'Suppose $' + abs(T.lin(1, 'x', -a3)) + ' < ' + T.num(r3) + '$. ';
      return { q: lead + 'What is the smallest number $M$ such that $' + abs(xb) + ' < M$ for every such $x$?', a: num(Mv.toPlain()),
        steps: ['From $' + abs(T.lin(1, 'x', -a3)) + ' < ' + T.num(r3) + '$: $' + T.num(q(a3).sub(r3)) + ' < x < ' + T.num(q(a3).add(r3)) + '$.', 'Add $' + b3 + '$: $' + T.num(lo3) + ' < ' + xb + ' < ' + T.num(hi3) + '$.',
          'So $' + abs(xb) + '$ stays below $\\max\\left(' + abs(T.num(lo3)) + ', ' + abs(T.num(hi3)) + '\\right) = ' + T.num(Mv) + '$, and it gets as close to $' + T.num(Mv) + '$ as you like. So $M = ' + T.num(Mv) + '$.' + (shape === 'bound2' ? ' Then $' + abs('x^{2} - ' + (a3 * a3)) + ' < ' + T.num(Mv) + abs(T.lin(1, 'x', -a3)) + '$.' : '')],
        hint: 'Find the interval where $x$ lives, then the interval where $' + xb + '$ lives.', data: { k: 'abs-bound', a: a3, r: r3.toPlain(), b: b3 } };
    }
    if (shape === 'reverse') {
      var a4 = R.pick([1, -1]) * R.int(3, 12), r4 = q(R.pick(['1', '2', '1/2', '0.1'])), m4 = q(M.abs(a4)).sub(r4);
      return { q: 'Suppose $' + abs(T.lin(1, 'x', -a4)) + ' < ' + T.num(r4) + '$. What is the largest number $m$ such that $|x| > m$ for every such $x$? (This is the reverse triangle inequality at work.)', a: num(m4.toPlain()),
        steps: ['The reverse triangle inequality: $|x| \\ge |a| - |x - a|$.', 'Here $|x| \\ge ' + M.abs(a4) + ' - ' + abs(T.lin(1, 'x', -a4)) + ' > ' + M.abs(a4) + ' - ' + T.num(r4) + ' = ' + T.num(m4) + '$.', 'Values of $x$ near $' + T.num(a4 > 0 ? q(a4).sub(r4) : q(a4).add(r4)) + '$ get $|x|$ as close to $' + T.num(m4) + '$ as you like, so $m = ' + T.num(m4) + '$ is the largest.'],
        hint: 'How close to $0$ can a number within $r$ of $a$ get?', data: { k: 'abs-rev', a: a4, r: r4.toPlain() } };
    }
    var pool = [['$|a + b| \\le |a| + |b|$', ['$|a - b| \\le |a| - |b|$', '$|a + b| = |a| + |b|$', '$|a - b| \\ge |a| + |b|$'], 'This is the triangle inequality. The others fail: $a = 1, b = 2$ gives $|a - b| = 1 > |a| - |b| = -1$; $a = 1, b = -1$ gives $|a + b| = 0 \\ne 2$; $a = 1, b = 1$ gives $0 \\ge 2$, false.'],
      ['$|a - b| \\ge |a| - |b|$', ['$|a - b| \\le |a| - |b|$', '$|a + b| \\ge |a| + |b|$', '$|a| - |b| \\ge |a + b|$'], 'This is the reverse triangle inequality: $|a| = |(a - b) + b| \\le |a - b| + |b|$. The others fail for $a = 1, b = 2$ (first), $a = 1, b = -1$ (second and third).'],
      ['$|ab| = |a|\\,|b|$', ['$|a + b| = |a| + |b|$', '$|a - b| = |a| - |b|$', '$|a^{2} - b^{2}| = |a - b|^{2}$'], 'Absolute value multiplies: $|ab| = |a||b|$. Sums do not: $a = 1, b = -1$ breaks the second; $a = 1, b = 2$ breaks the third; $a = 2, b = 1$ gives $3 \\ne 1$ in the last.']];
    var it = R.pick(pool);
    return { q: 'Which statement is true for all real numbers $a$ and $b$?', a: mc(it[0], it[1]), steps: [it[2], 'One counterexample is enough to rule out a "for all" statement.'], hint: 'Test each with $a = 1$ and $b = -1$, or $a = 1$ and $b = 2$.', data: { k: 'mc' } };
  });

  // sets with known sup and inf: { tex, sup, inf (Q or surd objects), maxIn, minIn }
  function supInfSet(R, lvl) {
    var kinds = lvl === 1 ? ['oneminus', 'nk', 'interval', 'quad'] : ['oneminus', 'alt', 'nk', 'interval', 'sq', 'quad', 'mn', 'altplus'];
    var kd = R.pick(kinds), S = {};
    function rq(x) { var v = q(x); return { tex: T.num(v), plain: v.toPlain(), val: v.toNumber() }; }
    if (kd === 'oneminus') { var c = R.int(1, 3), top = R.int(1, 4); S = { tex: '\\left\\{' + top + ' - \\frac{' + c + '}{n} : n \\ge 1\\right\\}', sup: rq(top), inf: rq(top - c), maxIn: false, minIn: true, why: 'The terms $' + (top - c) + ', ' + T.num(Q(2 * top - c, 2)) + ', ' + T.num(Q(3 * top - c, 3)) + ', \\ldots$ increase toward $' + top + '$ and never reach it.', data: { k: 'oneminus', c: c, top: top } }; }
    else if (kd === 'alt') { var c2 = R.int(1, 6); S = { tex: '\\left\\{\\frac{(-1)^{n}\\,' + c2 + '}{n} : n \\ge 1\\right\\}', sup: rq(Q(c2, 2)), inf: rq(-c2), maxIn: true, minIn: true, why: 'The terms are $' + (-c2) + ', ' + T.num(Q(c2, 2)) + ', ' + T.num(Q(-c2, 3)) + ', ' + T.num(Q(c2, 4)) + ', \\ldots$: the positive ones are largest at $n = 2$ and the negative ones are smallest at $n = 1$.', data: { k: 'alt', c: c2 } }; }
    else if (kd === 'nk') { var k = R.int(1, 5); S = { tex: '\\left\\{\\frac{n}{n + ' + k + '} : n \\ge 1\\right\\}', sup: rq(1), inf: rq(Q(1, 1 + k)), maxIn: false, minIn: true, why: 'Since $\\frac{n}{n + ' + k + '} = 1 - \\frac{' + k + '}{n + ' + k + '}$, the terms increase from $' + T.num(Q(1, 1 + k)) + '$ toward $1$ and never reach $1$.', data: { k: 'nk', kk: k } }; }
    else if (kd === 'interval') { var a = R.int(-6, 3), b = a + R.int(2, 6), cc = b + R.int(1, 4), flip = R.coin();
      if (flip) S = { tex: '(' + a + ', ' + b + '] \\cup \\{' + cc + '\\}', sup: rq(cc), inf: rq(a), maxIn: true, minIn: false, why: 'The isolated point $' + cc + '$ is the largest element; the left end $' + a + '$ is not in the set, but every number above it (up to $' + b + '$) is.', data: { k: 'iv', a: a, b: b, c: cc, flip: 1 } };
      else { var c0 = a - R.int(1, 4); S = { tex: '\\{' + c0 + '\\} \\cup [' + a + ', ' + b + ')', sup: rq(b), inf: rq(c0), maxIn: false, minIn: true, why: 'The isolated point $' + c0 + '$ is the smallest element; the right end $' + b + '$ is not in the set, but numbers just below it are.', data: { k: 'iv', a: a, b: b, c: c0, flip: 0 } }; } }
    else if (kd === 'sq') { var kk = R.pick([2, 3, 5, 6, 7, 8, 10, 11, 12]), s = surd(kk); S = { tex: '\\{x \\in \\mathbb{R} : x^{2} < ' + kk + '\\}', sup: { tex: s.tex, plain: s.plain, val: s.val }, inf: { tex: '-' + s.tex, plain: '-' + s.plain, val: -s.val }, maxIn: false, minIn: false, why: 'The set is the open interval $(-' + s.tex + ', ' + s.tex + ')$.', data: { k: 'sq', kk: kk } }; }
    else if (kd === 'quad') { var p = R.int(-5, 3), qq = p + R.int(1, 6), strict = R.coin(); S = { tex: '\\{x \\in \\mathbb{R} : (x ' + (p < 0 ? '+ ' + (-p) : '- ' + p) + ')(x ' + (qq < 0 ? '+ ' + (-qq) : '- ' + qq) + ') ' + (strict ? '<' : '\\le') + ' 0\\}', sup: rq(qq), inf: rq(p), maxIn: !strict, minIn: !strict, why: 'The product is negative exactly between the roots $' + p + '$ and $' + qq + '$, so the set is $' + (strict ? '(' : '[') + p + ', ' + qq + (strict ? ')' : ']') + '$.', data: { k: 'quad', p: p, q: qq, strict: strict } }; S.tex = S.tex.replace('(x - 0)', 'x'); }
    else if (kd === 'mn') { var c3 = R.int(1, 3); S = { tex: '\\left\\{\\frac{' + c3 + '}{m} + \\frac{' + c3 + '}{n} : m, n \\ge 1\\right\\}', sup: rq(2 * c3), inf: rq(0), maxIn: true, minIn: false, why: 'The largest value comes from $m = n = 1$. Every element is positive, but $m = n$ large makes the element as small as you like.', data: { k: 'mn', c: c3 } }; }
    else { var c4 = R.int(1, 3), d4 = R.int(1, c4); S = { tex: '\\left\\{(-1)^{n}\\,' + (c4 === 1 ? '' : c4) + ' + \\frac{' + d4 + '}{n} : n \\ge 1\\right\\}', sup: rq(q(c4).add(Q(d4, 2))), inf: rq(-c4), maxIn: true, minIn: false, why: 'Even $n$ give $' + c4 + ' + \\frac{' + d4 + '}{n}$, largest at $n = 2$: $' + T.num(q(c4).add(Q(d4, 2))) + '$. Odd $n$ give $-' + c4 + ' + \\frac{' + d4 + '}{n}$, which stay above $-' + c4 + '$ but come as close as you like.', data: { k: 'altplus', c: c4, d: d4 } }; }
    return S;
  }
  G('ra.sup-inf', function (R, ctx) {
    var L = lv(ctx), S = supInfSet(R, L), shape = by(ctx, R.pick(['sup', 'inf']), R.pick(['both', 'both', 'max']), R.pick(['max', 'both', 'bounds']));
    var stepA = 'List or picture the elements: ' + S.why;
    if (shape === 'sup' || shape === 'inf') {
      var w = S[shape];
      return { q: 'Let $A = ' + S.tex + '$. Find $\\' + shape + ' A$.', a: num(w.plain), steps: [stepA, shape === 'sup' ? 'Every element is at most $' + w.tex + '$, and no smaller number is an upper bound.' : 'Every element is at least $' + w.tex + '$, and no larger number is a lower bound.', 'So $\\' + shape + ' A = ' + w.tex + '$' + ((shape === 'sup' ? S.maxIn : S.minIn) ? ', and it is an element of $A$.' : ', even though it is not an element of $A$.')],
        hint: shape === 'sup' ? 'Find the least upper bound: it does not have to be in the set.' : 'Find the greatest lower bound: it does not have to be in the set.', data: Object.assign({ ask: shape }, S.data) };
    }
    if (shape === 'both') return { q: 'Let $A = ' + S.tex + '$. Find $\\sup A$ and $\\inf A$.', a: multi([part('$\\sup A =$', num(S.sup.plain)), part('$\\inf A =$', num(S.inf.plain))]),
      steps: [stepA, '$\\sup A = ' + S.sup.tex + '$ (' + (S.maxIn ? 'an element, so it is also the maximum' : 'not an element, so $A$ has no maximum') + ').', '$\\inf A = ' + S.inf.tex + '$ (' + (S.minIn ? 'an element, so it is also the minimum' : 'not an element, so $A$ has no minimum') + ').'],
      hint: 'Sketch the elements on a number line. Where do they pile up?', data: Object.assign({ ask: 'both' }, S.data) };
    if (shape === 'max') return { q: 'Let $A = ' + S.tex + '$. Find $\\sup A$, and decide: does $A$ have a maximum (a largest element)?', a: multi([part('$\\sup A =$', num(S.sup.plain)), part('$A$ has a maximum:', tf(S.maxIn))]),
      steps: [stepA, '$\\sup A = ' + S.sup.tex + '$.', S.maxIn ? 'It is an element of $A$, so it is the maximum: true.' : 'It is not an element of $A$, so no element is largest (any element has a bigger one beside it): false.'],
      hint: 'A maximum is a supremum that belongs to the set.', data: Object.assign({ ask: 'max' }, S.data) };
    // which numbers are upper bounds?
    var s = S.sup.val, cands = [], seen = {};
    [S.sup.val, S.sup.val + 1, S.sup.val - 0.5, S.sup.val + 0.25, S.sup.val - 0.1, S.sup.val + 3].forEach(function (x) { var r = M.round(x * 100) / 100; if (!seen[r]) { seen[r] = 1; cands.push(r); } });
    var shown = cands.map(function (x, i) { return i === 0 ? '$' + S.sup.tex + '$' : '$' + T.num(x) + '$'; }), good = [];
    cands.forEach(function (x, i) { if (i === 0 || x >= s - 1e-12) good.push(i); });
    return { q: 'Let $A = ' + S.tex + '$. Which of these numbers are upper bounds of $A$? Select all that apply.', a: mcAll(shown, good),
      steps: [stepA, '$\\sup A = ' + S.sup.tex + '$, so the upper bounds are exactly the numbers $\\ge ' + S.sup.tex + '$.', 'A number below $' + S.sup.tex + '$ is beaten by some element of $A$.'],
      hint: 'Upper bounds are the numbers at least as big as every element; compare each with $\\sup A$.', data: Object.assign({ ask: 'bounds', cands: cands }, S.data) };
  });

  G('ra.approximation-property', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['smallest', 'smallest', 'element']), R.pick(['smallest', 'element', 'show']), R.pick(['smallest', 'flaw', 'show']));
    if (shape === 'smallest') {
      var e = epsPick(R, L), eq = q(e), kd = L === 1 ? R.pick(['oneminus', 'inf']) : R.pick(['oneminus', 'nk', 'gen', 'inf']), tx, s, n0, test, why, fj;
      if (kd === 'oneminus') { var c = R.int(1, 3); fj = '1-' + c + '/n'; tx = '\\left\\{1 - \\frac{' + c + '}{n} : n \\ge 1\\right\\}'; s = '1'; test = function (n) { return Q(c, n).lt(eq); }; why = '$1 - \\frac{' + c + '}{n} > 1 - ' + epsTex(e) + '$ means $\\frac{' + c + '}{n} < ' + epsTex(e) + '$, that is, $n > ' + T.num(q(c).div(eq)) + '$.'; }
      else if (kd === 'inf') { var c1 = R.int(1, 3); fj = '2+' + c1 + '/n'; tx = '\\left\\{2 + \\frac{' + c1 + '}{n} : n \\ge 1\\right\\}'; s = '2'; test = function (n) { return Q(c1, n).lt(eq); }; why = '$2 + \\frac{' + c1 + '}{n} < 2 + ' + epsTex(e) + '$ means $\\frac{' + c1 + '}{n} < ' + epsTex(e) + '$, that is, $n > ' + T.num(q(c1).div(eq)) + '$.'; }
      else if (kd === 'nk') { var k = R.int(2, 6); fj = 'n/(n+' + k + ')'; tx = '\\left\\{\\frac{n}{n + ' + k + '} : n \\ge 1\\right\\}'; s = '1'; test = function (n) { return Q(k, n + k).lt(eq); }; why = '$1 - \\frac{n}{n + ' + k + '} = \\frac{' + k + '}{n + ' + k + '} < ' + epsTex(e) + '$ means $n + ' + k + ' > ' + T.num(q(k).div(eq)) + '$.'; }
      else { var p = R.int(2, 4), b = R.int(1, 3), d = R.int(1, 4), gap = p * d + b; fj = '(' + p + '*n-' + b + ')/(n+' + d + ')'; tx = '\\left\\{\\frac{' + p + 'n - ' + b + '}{n + ' + d + '} : n \\ge 1\\right\\}'; s = String(p); test = function (n) { return Q(gap, n + d).lt(eq); }; why = '$' + p + ' - \\frac{' + p + 'n - ' + b + '}{n + ' + d + '} = \\frac{' + gap + '}{n + ' + d + '} < ' + epsTex(e) + '$ means $n + ' + d + ' > ' + T.num(q(gap).div(eq)) + '$.'; }
      n0 = firstNfast(test, 1);
      var isInf = kd === 'inf', word = isInf ? 'inf' : 'sup';
      return { q: 'Let $A = ' + tx + '$, so $\\' + word + ' A = ' + s + '$. For $' + E(e) + '$, find the smallest $n$ whose element is ' + (isInf ? 'less than $' + s + ' + \\varepsilon$' : 'greater than $' + s + ' - \\varepsilon$') + '.', a: num(n0),
        steps: [why, 'The smallest whole number that works is $n = ' + n0 + '$' + (n0 > 1 ? ' (at $n = ' + (n0 - 1) + '$ the inequality fails).' : '.'), 'This is the ε-test in action: for this $\\varepsilon$, an element of $A$ lies within $\\varepsilon$ of $' + s + '$, so $' + s + (isInf ? ' + ' : ' - ') + '\\varepsilon$ is not a ' + (isInf ? 'lower' : 'upper') + ' bound.'],
        hint: 'Write the condition as an inequality in $n$ and solve it. Watch the strict inequality.', data: { k: 'approx', kind: kd, e: qp(e), n0: n0, fj: fj, s: s, inf: isInf } };
    }
    if (shape === 'element') {
      var a = R.int(1, 9), bb = a + R.int(1, 5), es = R.pick(['1/2', '1/4', '0.1', '1/10', '0.01']), e2 = q(es), lo = q(bb).sub(e2), v = q(bb).sub(e2.div(2)), closed = R.coin();
      return { q: 'Let $A = ' + (closed ? '(' : '[') + a + ', ' + bb + ')$, so $\\sup A = ' + bb + '$. For $' + E(es) + '$, give an element of $A$ that is greater than $' + bb + ' - \\varepsilon$. (Many answers are right.)',
        a: { t: 'num', v: v.toPlain(), satisfies: { min: lo.toPlain(), minOpen: true, max: String(bb), maxOpen: true, msgHigh: 'That is not in A: elements of A are less than ' + bb + '.', msgLow: 'That one is not greater than ' + bb + ' − ε.' } },
        steps: ['We need $x$ in $A$ with $x > ' + bb + ' - ' + T.num(e2) + ' = ' + T.num(lo) + '$.', 'Elements of $A$ are less than $' + bb + '$, so any $x$ with $' + T.num(lo) + ' < x < ' + bb + '$ works, for example the midpoint $' + T.num(v) + '$.', 'Such an $x$ exists for every $\\varepsilon > 0$, which is exactly why $' + bb + '$ is the least upper bound.'],
        hint: 'Look between $' + bb + ' - \\varepsilon$ and $' + bb + '$.', data: { k: 'elem', lo: lo.toPlain(), hi: bb } };
    }
    if (shape === 'show') {
      var it = R.pick([['$A = \\left\\{1 - \\frac{1}{n} : n \\ge 1\\right\\}$ and $s = 1$', 'For every $\\varepsilon > 0$ there is an $n$ with $1 - \\frac{1}{n} > 1 - \\varepsilon$.', ['$1$ is an element of $A$.', 'For some $\\varepsilon > 0$, every $n$ has $1 - \\frac{1}{n} > 1 - \\varepsilon$.', 'Every element of $A$ is less than $1$.']],
        ['$A = (0, 3)$ and $s = 3$', 'For every $\\varepsilon > 0$ there is an $x$ in $A$ with $x > 3 - \\varepsilon$.', ['$3$ is an element of $A$.', 'Every $x$ in $A$ has $x < 3$.', 'There is an $\\varepsilon > 0$ with no $x$ in $A$ above $3 - \\varepsilon$.']],
        ['$A = \\left\\{\\frac{n}{n + 1} : n \\ge 1\\right\\}$ and $s = 1$', 'For every $\\varepsilon > 0$ there is an $n$ with $\\frac{n}{n + 1} > 1 - \\varepsilon$.', ['$\\frac{n}{n + 1} < 1$ for every $n$.', 'For every $n$ there is an $\\varepsilon > 0$ with $\\frac{n}{n + 1} > 1 - \\varepsilon$.', '$\\frac{1}{2}$ is the smallest element of $A$.']]]);
      return { q: 'To prove $\\sup A = s$ for ' + it[0] + ', a student has shown that $s$ is an upper bound of $A$. What else must the proof show?', a: mc(it[1], it[2]),
        steps: ['Being an upper bound shows $\\sup A \\le s$.', 'To rule out a smaller upper bound, show that every $s - \\varepsilon$ (with $\\varepsilon > 0$) is beaten by some element of $A$.', 'That is the ε-test: ' + it[1]], hint: 'An upper bound is not yet the least one. What would show that nothing smaller works?', data: { k: 'mc' } };
    }
    var fl = R.pick([['Claim: $\\sup\\,(0, 2) = 2$. “Proof”: every $x$ in $(0, 2)$ has $x < 2$, so $2$ is an upper bound. Therefore $\\sup\\,(0, 2) = 2$.', 'It shows that $2$ is an upper bound but never shows that no smaller number is one.', ['$2$ is not an upper bound, because $2 \\notin (0, 2)$.', 'It should have shown that $2$ is an element of $(0, 2)$.', 'Nothing is wrong.']],
      ['Claim: $\\sup A = 1$ for $A = \\left\\{1 - \\frac{1}{n}\\right\\}$. “Proof”: let $\\varepsilon = \\frac{1}{10}$. Then $n = 11$ gives $1 - \\frac{1}{11} > 1 - \\varepsilon$. So nothing smaller than $1$ is an upper bound.', 'It checks one value of $\\varepsilon$; the ε-test needs every $\\varepsilon > 0$.', ['$1 - \\frac{1}{11}$ is not greater than $\\frac{9}{10}$.', 'It should use $n = 10$.', 'Nothing is wrong.']],
      ['Claim: $\\sup A = 5$ for $A = [1, 5)$. “Proof”: $5$ is an upper bound. If $\\varepsilon > 0$, then $5 - \\varepsilon$ is an element of $A$ greater than $5 - \\varepsilon$.', 'A number is not greater than itself; take $5 - \\frac{\\varepsilon}{2}$ instead (or $\\max(1, 5 - \\frac{\\varepsilon}{2})$ when $\\varepsilon$ is large).', ['$5$ is not an upper bound of $[1, 5)$.', 'It should show that $5 \\in A$.', 'Nothing is wrong.']]]);
    return { q: 'Find the flaw.<br>' + fl[0], a: mc(fl[1], fl[2]), steps: ['A supremum proof has two parts: $s$ is an upper bound, and every $s - \\varepsilon$ with $\\varepsilon > 0$ is beaten by an element.', 'The flaw: ' + fl[1]], hint: 'Check both parts of the ε-test, for every $\\varepsilon > 0$.', data: { k: 'mc' } };
  });

  G('ra.completeness', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['arch1', 'arch2']), R.pick(['arch2', 'pow2', 'sqrt']), R.pick(['sqrt', 'step', 'pow2', 'which']));
    if (shape === 'arch1') {
      var e = q(R.pick(['0.01', '0.003', '0.04', '0.007', '1/30', '2/75', '0.15', '3/400'])), n0 = q(1).div(e).floor().toNumber() + 1;
      return { q: 'By the Archimedean property, some positive integer $n$ has $\\frac{1}{n} < ' + T.num(e) + '$. Find the smallest one.', a: num(n0),
        steps: ['$\\frac{1}{n} < ' + T.num(e) + '$ means $n > \\frac{1}{' + T.num(e) + '} = ' + T.num(q(1).div(e)) + '$.', 'The smallest whole number greater than $' + T.num(q(1).div(e)) + '$ is $' + n0 + '$' + (q(1).div(e).isInt() ? ' (equality is not enough, so not $' + (n0 - 1) + '$).' : '.')],
        hint: 'Turn $\\frac{1}{n} < \\varepsilon$ into $n > \\frac{1}{\\varepsilon}$.', data: { k: 'arch1', e: e.toPlain(), n0: n0 } };
    }
    if (shape === 'arch2') {
      var a = q(R.pick(['0.03', '0.07', '1/8', '2/9', '0.6', '3/7'])), b = q(R.int(5, 40)), n2 = b.div(a).floor().toNumber() + 1;
      return { q: 'The Archimedean property says that for $x = ' + T.num(a) + '$ and $y = ' + T.num(b) + '$ some positive integer $n$ has $nx > y$. Find the smallest such $n$.', a: num(n2),
        steps: ['$n \\cdot ' + T.num(a) + ' > ' + T.num(b) + '$ means $n > ' + T.num(b) + ' \\div ' + T.num(a) + ' = ' + T.num(b.div(a)) + '$.', 'The smallest whole number greater than $' + T.num(b.div(a)) + '$ is $' + n2 + '$.'],
        hint: 'Divide: $n > \\frac{y}{x}$.', data: { k: 'arch2', x: a.toPlain(), y: b.toPlain(), n0: n2 } };
    }
    if (shape === 'pow2') {
      var e3 = q(R.pick(['0.01', '0.001', '0.05', '1/300', '0.002'])), n3 = firstN(function (n) { return Q(1, pow2(n)).lt(e3); });
      return { q: 'Find the smallest positive integer $n$ with $\\frac{1}{2^{n}} < ' + T.num(e3) + '$.', a: num(n3),
        steps: ['$\\frac{1}{2^{n}} < ' + T.num(e3) + '$ means $2^{n} > ' + T.num(q(1).div(e3)) + '$.', 'Powers of $2$: $2^{' + (n3 - 1) + '} = ' + T.commas(pow2(n3 - 1)) + '$ is not enough, $2^{' + n3 + '} = ' + T.commas(pow2(n3)) + '$ is.', 'So $n = ' + n3 + '$. (Since $2^{n} \\ge n$, this is never later than the $n$ with $\\frac{1}{n} < \\varepsilon$.)'],
        hint: 'Compare $2^{n}$ with $\\frac{1}{\\varepsilon}$.', data: { k: 'pow2', e: e3.toPlain(), n0: n3 } };
    }
    if (shape === 'sqrt') {
      var k = R.pick([2, 3, 5, 6, 7, 10, 11, 13]), s = surd(k);
      if (L === 2) return { q: 'Let $S = \\{x \\in \\mathbb{Q} : x > 0,\\ x^{2} < ' + k + '\\}$. Find $\\sup S$ (as a real number).', a: num(s.plain),
        steps: ['Every element of $S$ is below $' + s.tex + '$, since $x^{2} < ' + k + '$ and $x > 0$.', 'Rationals are dense, so there are rationals in $S$ as close to $' + s.tex + '$ as you like.', 'So $\\sup S = ' + s.tex + '$. Completeness of $\\mathbb{R}$ guarantees the supremum exists; it is not rational.'], hint: 'Which real number do the elements crowd up against?', data: { k: 'sqrt', kk: k } };
      return { q: 'Let $S = \\{x \\in \\mathbb{Q} : x > 0,\\ x^{2} < ' + k + '\\}$. Find $\\sup S$ in $\\mathbb{R}$, and decide whether that supremum is a rational number.', a: multi([part('$\\sup S =$', num(s.plain)), part('$\\sup S$ is rational:', tf(false))]),
        steps: ['The elements crowd up against $' + s.tex + '$, so $\\sup S = ' + s.tex + '$ in $\\mathbb{R}$.', '$' + s.tex + '$ is irrational ($' + k + '$ is not a perfect square).', 'So $S$ is a bounded set of rationals with no least upper bound inside $\\mathbb{Q}$: the rationals are not complete.'], hint: 'Is $' + k + '$ a perfect square?', data: { k: 'sqrt', kk: k } };
    }
    if (shape === 'step') return { q: 'Proof that the positive integers are not bounded above: “Suppose they were. By completeness, $s = \\sup\\{1, 2, 3, \\ldots\\}$ exists. Then $s - 1$ is not an upper bound, so some integer $n$ has $n > s - 1$.” What is the next step?',
      a: mc('Then $n + 1 > s$, and $n + 1$ is a positive integer, which contradicts $s$ being an upper bound.', ['Then $n > s$, a contradiction.', 'Then $s - 1$ is a positive integer.', 'Then $s = n$, so $s$ is the largest integer.']),
      steps: ['Adding $1$ to $n > s - 1$ gives $n + 1 > s$.', '$n + 1$ is a positive integer bigger than the supposed upper bound $s$: a contradiction.', 'So the positive integers have no upper bound, which is the Archimedean property.'], hint: 'Add $1$ to both sides of $n > s - 1$.', data: { k: 'mc' } };
    return { q: 'Which statement is the completeness axiom of the real numbers?', a: mc('Every nonempty set of real numbers that is bounded above has a least upper bound in $\\mathbb{R}$.', ['Every set of real numbers has a largest element.', 'Every bounded set of rational numbers has a rational least upper bound.', 'Between any two real numbers there is a rational number.']),
      steps: ['Completeness: nonempty and bounded above guarantees a supremum in $\\mathbb{R}$.', '"A largest element" fails for $(0, 1)$; the rational version fails for $\\{x \\in \\mathbb{Q} : x^{2} < 2\\}$; density is a consequence, not the axiom.'], hint: 'It is about least upper bounds.', data: { k: 'mc' } };
  });

  G('ra.density', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'recipe', R.pick(['recipe', 'surd']), R.pick(['surd', 'smallest']));
    if (shape === 'recipe') {
      var a = Q(R.int(100, 899), 1000), g = q(R.pick(['0.003', '0.004', '0.006', '0.007', '0.009', '0.011', '0.013', '0.017', '0.03'])), b = a.add(g);
      var n = q(1).div(g).floor().toNumber() + 1, m = a.mul(n).floor().toNumber() + 1;
      return { q: 'The proof that $\\mathbb{Q}$ is dense finds a fraction between $a = ' + T.num(a.toNumber()) + '$ and $b = ' + T.num(b.toNumber()) + '$ in two steps: take the smallest positive integer $n$ with $\\frac{1}{n} < b - a$, then the smallest integer $m$ with $m > na$. Find $n$ and $m$.', a: multi([part('$n =$', num(n)), part('$m =$', num(m))]),
        steps: ['$b - a = ' + T.num(g.toNumber()) + '$, and $\\frac{1}{n} < ' + T.num(g.toNumber()) + '$ means $n > ' + T.num(q(1).div(g)) + '$, so $n = ' + n + '$.', '$na = ' + n + ' \\cdot ' + T.num(a.toNumber()) + ' = ' + T.num(a.mul(n).toNumber()) + '$, so the smallest integer above it is $m = ' + m + '$.', 'Check: $\\frac{m}{n} = \\frac{' + m + '}{' + n + '} \\approx ' + T.num(U.round(m / n, 5)) + '$ lies strictly between $a$ and $b$. (Always: $m - 1 \\le na$, so $\\frac{m}{n} \\le a + \\frac{1}{n} < b$.)'],
        hint: 'Solve $\\frac{1}{n} < b - a$ for $n$ first.', data: { k: 'recipe', a: a.toPlain(), b: b.toPlain(), n: n, m: m } };
    }
    if (shape === 'surd') {
      var k = R.pick([2, 3, 5, 6, 7, 10]), r = M.sqrt(k), digits = 2, bdec, gap, n2, ok = false;
      for (var t = 0; t < 30 && !ok; t++) { bdec = M.ceil(r * 100 + R.int(0, 2)) / 100; if (bdec <= r) continue; gap = bdec - r; var inv = 1 / gap; if (M.abs(inv - M.round(inv)) < 1e-6) continue; n2 = M.floor(inv) + 1; ok = true; }
      var m2 = M.floor(M.sqrt(n2 * n2 * k)); while (m2 * m2 > n2 * n2 * k) m2--; while ((m2 + 1) * (m2 + 1) <= n2 * n2 * k) m2++; m2 += 1;
      var s = surd(k);
      return { q: 'Use the density recipe to find a fraction between $a = ' + s.tex + '$ and $b = ' + T.num(bdec) + '$: take the smallest positive integer $n$ with $\\frac{1}{n} < b - a$, then the smallest integer $m$ with $m > na$. Find $n$ and $m$.', a: multi([part('$n =$', num(n2)), part('$m =$', num(m2))]),
        steps: ['$b - a = ' + T.num(bdec) + ' - ' + s.tex + ' \\approx ' + T.num(U.round(gap, 6)) + '$, so $\\frac{1}{b - a} \\approx ' + T.num(U.round(1 / gap, 3)) + '$ and $n = ' + n2 + '$.', '$na = ' + n2 + s.tex + ' = \\sqrt{' + (n2 * n2 * k) + '}$, and $' + (m2 - 1) + '^{2} = ' + ((m2 - 1) * (m2 - 1)) + ' \\le ' + (n2 * n2 * k) + ' < ' + (m2 * m2) + ' = ' + m2 + '^{2}$, so $m = ' + m2 + '$.', 'Check: $\\frac{' + m2 + '}{' + n2 + '} \\approx ' + T.num(U.round(m2 / n2, 6)) + '$ is between $' + s.tex + ' \\approx ' + T.num(U.round(r, 6)) + '$ and $' + T.num(bdec) + '$.'],
        hint: 'Estimate $b - a$ with a calculator-free bound: $' + s.tex + ' \\approx ' + T.num(U.round(r, 5)) + '$.', data: { k: 'surd', kk: k, b: bdec, n: n2, m: m2 } };
    }
    var a3 = Q(R.int(10, 80), 100), b3 = a3.add(Q(R.int(3, 9), 100)), n3 = 1, m3;
    while (true) { m3 = a3.mul(n3).floor().toNumber() + 1; if (Q(m3, n3).lt(b3)) break; n3++; }
    return { q: 'What is the smallest positive denominator $n$ of a fraction $\\frac{m}{n}$ strictly between $' + T.num(a3.toNumber()) + '$ and $' + T.num(b3.toNumber()) + '$? Give $n$ and the smallest such fraction.', a: multi([part('$n =$', num(n3)), part('fraction $=$', num(Q(m3, n3).toPlain()))]),
      steps: ['Try $n = 1, 2, 3, \\ldots$: for each $n$, the first multiple of $\\frac{1}{n}$ above $' + T.num(a3.toNumber()) + '$ is $\\frac{\\lfloor ' + T.num(a3.toNumber()) + 'n \\rfloor + 1}{n}$.', 'The first $n$ for which it is below $' + T.num(b3.toNumber()) + '$ is $n = ' + n3 + '$, with $\\frac{' + m3 + '}{' + n3 + '}' + (gcd(m3, n3) > 1 ? ' = ' + T.num(Q(m3, n3)) : '') + ' \\approx ' + T.num(U.round(m3 / n3, 4)) + '$.', 'The density proof guarantees some $n$ works once $\\frac{1}{n} < b - a$; smaller $n$ can work too, as here.'],
      hint: 'For each $n$, which multiple of $\\frac{1}{n}$ comes first after $a$?', data: { k: 'smallest', a: a3.toPlain(), b: b3.toPlain(), n: n3, m: m3 } };
  });

  // position of (m, n) in the diagonal listing: (1,1), (1,2), (2,1), (1,3), (2,2), (3,1), …
  function pairPos(m, n) { var s = m + n; return (s - 2) * (s - 1) / 2 + m; }
  G('ra.countable-sets', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['pos', 'zlist']), R.pick(['pos', 'unpair', 'diag']), R.pick(['diag', 'which', 'unpair']));
    var listTex = '(1, 1),\\ (1, 2),\\ (2, 1),\\ (1, 3),\\ (2, 2),\\ (3, 1),\\ (1, 4), \\ldots';
    if (shape === 'pos') {
      var m = R.int(1, L === 1 ? 4 : 7), n = R.int(3, L === 1 ? 5 : 7), s = m + n, before = (s - 2) * (s - 1) / 2, pos = pairPos(m, n);
      return { q: 'The pairs of positive integers are listed diagonal by diagonal, each diagonal ($m + n$ fixed) in order of increasing $m$: $' + listTex + '$ In what position is $(' + m + ', ' + n + ')$? (Position $1$ is $(1, 1)$.)', a: num(pos),
        steps: ['$(' + m + ', ' + n + ')$ is on the diagonal $m + n = ' + s + '$.', (s === 4 ? 'The earlier diagonals $m + n = 2$ and $3$ hold $1 + 2 = 3$ pairs.' : 'The earlier diagonals $m + n = 2, 3, \\ldots, ' + (s - 1) + '$ hold $1 + 2 + \\cdots + ' + (s - 2) + ' = ' + before + '$ pairs.'), 'On its own diagonal it is number $m = ' + m + '$, so its position is $' + before + ' + ' + m + ' = ' + pos + '$.'],
        hint: 'Count the pairs on the earlier diagonals first.', viz: { name: 'ra-diagonal', opts: { mode: 'pairing', size: 6, quiet: true, edit: false } }, data: { k: 'pos', m: m, n: n, pos: pos } };
    }
    if (shape === 'unpair') {
      var k = R.int(7, L === 2 ? 30 : 60), s2 = 2; while ((s2 - 1) * s2 / 2 < k) s2++; var b2 = (s2 - 2) * (s2 - 1) / 2, m2 = k - b2, n2 = s2 - m2;
      return { q: 'In the diagonal listing of pairs of positive integers, $' + listTex + '$ which pair is in position $' + k + '$? Give it as $(m, n)$.', a: { t: 'tuple', v: [String(m2), String(n2)] },
        steps: ['Diagonal $m + n = s$ holds $s - 1$ pairs, so the first $s$ diagonals end at positions $1, 3, 6, 10, 15, 21, \\ldots$ (the triangular numbers).', 'Position $' + k + '$ comes after position $' + b2 + '$, the end of diagonal $m + n = ' + (s2 - 1) + '$, so it is on the diagonal $m + n = ' + s2 + '$.', 'It is number $' + k + ' - ' + b2 + ' = ' + m2 + '$ on that diagonal, so $m = ' + m2 + '$ and $n = ' + s2 + ' - ' + m2 + ' = ' + n2 + '$: the pair $(' + m2 + ', ' + n2 + ')$.'],
        hint: 'Which triangular number is just below the position?', data: { k: 'unpair', pos: k, m: m2, n: n2 } };
    }
    if (shape === 'zlist') {
      var z = R.nz(-25, 25), p = z > 0 ? 2 * z : -2 * z + 1;
      return { q: 'The integers are listed as $0, 1, -1, 2, -2, 3, -3, \\ldots$, which shows $\\mathbb{Z}$ is countable. In what position is $' + z + '$? (Position $1$ is $0$.)', a: num(p),
        steps: ['A positive integer $k$ comes right after the pairs $0$; $1, -1$; …; $k - 1, -(k - 1)$, at position $2k$.', 'A negative integer $-k$ comes right after $k$, at position $2k + 1$.', 'So $' + z + '$ is in position $' + p + '$.'], hint: 'Find the pattern for the positions of $k$ and $-k$.', data: { k: 'zlist', z: z, pos: p } };
    }
    if (shape === 'diag') {
      var rows = [], nr = L === 2 ? 4 : 5, dig = [], anyFive = false;
      for (var i = 0; i < nr; i++) { var ds = []; for (var j = 0; j < 6; j++) ds.push(R.int(0, 9)); if (R.chance(0.35)) ds[i] = 5; rows.push(ds); if (ds[i] === 5) anyFive = true; }
      if (!anyFive) rows[0][0] = 5;
      rows.forEach(function (ds, i) { dig.push(ds[i] === 5 ? 4 : 5); });
      var xs = '0.' + dig.join('');
      return { q: 'A list begins with these numbers in $(0, 1)$:<br>' + rows.map(function (ds, i) { return '$x_{' + (i + 1) + '} = 0.' + ds.join('') + '\\ldots$'; }).join('<br>') + '<br>Build $x$ by Cantor\'s rule: its $k$th digit is $4$ if the $k$th digit of $x_{k}$ is $5$, and $5$ otherwise. Give the first ' + nr + ' digits of $x$, typed as a decimal with ' + nr + ' digits after the point.', a: num(xs),
        steps: ['The diagonal digits are ' + rows.map(function (ds, i) { return '$' + ds[i] + '$'; }).join(', ') + '.', 'Change each: $5 \\to 4$, anything else $\\to 5$. So $x = ' + xs + '\\ldots$', 'Then $x$ differs from $x_{k}$ in the $k$th digit for every $k$, so $x$ is on no line of the list. (Using only the digits $4$ and $5$ avoids the double expansions like $0.0999\\ldots = 0.1$.)'],
        hint: 'Read the digits on the diagonal: the 1st digit of $x_1$, the 2nd of $x_2$, and so on.', viz: { name: 'ra-diagonal', opts: { mode: 'diagonal', rows: rows.map(function (ds) { return ds.join(''); }), quiet: true, edit: false } }, data: { k: 'diag', rows: rows.map(function (ds) { return ds.join(''); }), x: xs } };
    }
    var items = [['$\\mathbb{Z} \\times \\mathbb{Z}$', 1], ['$\\mathbb{Q}$', 1], ['the set of finite strings of letters a and b', 1], ['the set of polynomials with integer coefficients', 1], ['the interval $[0, 1]$', 0], ['the set of all infinite sequences of 0s and 1s', 0], ['the set of irrational numbers', 0], ['the set of all subsets of $\\mathbb{N}$', 0], ['the set of prime numbers', 1], ['$\\mathbb{Q} \\cap (0, 1)$', 1]];
    var pick = R.sample(items, 5); if (!pick.some(function (x) { return x[1]; })) pick[0] = items[1]; if (pick.every(function (x) { return x[1]; })) pick[4] = items[5];
    var good = []; pick.forEach(function (x, i) { if (x[1]) good.push(i); });
    return { q: 'Which of these sets are countable? Select all that apply.', a: mcAll(pick.map(function (x) { return cap(x[0]); }), good),
      steps: ['Countable: anything you can list one after another, like $\\mathbb{Z}$, $\\mathbb{Q}$, finite strings (list by length, then alphabetically), pairs (by diagonals) and integer polynomials (by degree plus size of coefficients).', 'Uncountable: $[0, 1]$, the irrationals (else $\\mathbb{R}$ would be a union of two countable sets) and all 0–1 sequences or subsets of $\\mathbb{N}$ (Cantor\'s diagonal argument).', 'So the countable ones here: ' + pick.filter(function (x) { return x[1]; }).map(function (x) { return x[0]; }).join('; ') + '.'],
      hint: 'Can you list it? Or does a diagonal argument rule out every list?', data: { k: 'mc' } };
  });

// ---- 02-sequences.js
  // ================================================================ Unit 2: Sequences
  function linPlain(a, v, b) { var s = (a === 1 ? '' : a === -1 ? '-' : a + '*') + v; return b ? s + (b < 0 ? '-' : '+') + M.abs(b) : s; }
  // a_n = (p n + q)/(r n + s), r, s > 0, D = |qr - ps| > 0; limit p/r; |a_n - L| = D / (r (r n + s)), decreasing in n
  function ratSeq(R, lvl, o) {
    o = o || {};
    for (var t = 0; t < 200; t++) {
      var r = lvl === 1 ? R.int(1, 2) : R.int(1, 4), s = R.int(1, 6), p = R.nz(-5, 6), qq = R.int(-9, 9), D = M.abs(qq * r - p * s);
      if (!D || gcd(gcd(M.abs(p), M.abs(qq)), gcd(r, s)) > 1) continue;
      if (o.minD && D < o.minD) continue;
      if (o.big && Q(D, r * (r + s)).lt(1)) continue;
      return { p: p, q: qq, r: r, s: s, D: D, Lq: Q(p, r), tex: '\\frac{' + T.lin(p, 'n', qq) + '}{' + T.lin(r, 'n', s) + '}', plain: '(' + linPlain(p, 'n', qq) + ')/(' + linPlain(r, 'n', s) + ')',
        diff: function (n) { return Q(this.D, this.r * (this.r * n + this.s)); }, val: function (n) { return Q(this.p * n + this.q, this.r * n + this.s); },
        diffTex: (function () { var g = gcd(D, r), rr = r / g; return '\\frac{' + (D / g) + '}{' + (rr === 1 ? T.lin(r, 'n', s) : rr + '(' + T.lin(r, 'n', s) + ')') + '}'; })() };
    }
    throw new Error('ratSeq');
  }
  // families for "find N": exact diff(n) = |a_n - L| (Q), and when diff is monotone
  function nSeq(R, lvl) {
    var kd = lvl === 1 ? R.pick(['rat', 'rat', 'sq']) : lvl === 2 ? R.pick(['rat', 'sq', 'root', 'geo']) : R.pick(['zig', 'zig', 'root', 'rat']);
    if (kd === 'rat') { var S = ratSeq(R, lvl); return { kd: kd, tex: S.tex, plain: S.plain, Ltex: T.num(S.Lq), Lplain: S.Lq.toPlain(), diff: function (n) { return S.diff(n); }, mono: true, diffTex: S.diffTex, solve: '$' + S.diffTex + ' < \\varepsilon$ means $' + (S.r === 1 ? '' : S.r) + (S.r === 1 ? T.lin(1, 'n', S.s) : '(' + T.lin(S.r, 'n', S.s) + ')') + ' > \\frac{' + S.D + '}{\\varepsilon}$.' }; }
    if (kd === 'sq') { var c = R.int(1, 5), L0 = R.int(-3, 3); return { kd: kd, tex: (L0 ? L0 + ' + ' : '') + '\\frac{' + c + '}{n^{2}}', plain: (L0 ? L0 + '+' : '') + c + '/n^2', Ltex: String(L0), Lplain: String(L0), diff: function (n) { return Q(c, n * n); }, mono: true, diffTex: '\\frac{' + c + '}{n^{2}}', solve: '$\\frac{' + c + '}{n^{2}} < \\varepsilon$ means $n^{2} > \\frac{' + c + '}{\\varepsilon}$.' }; }
    if (kd === 'root') { var c2 = R.int(1, 3); return { kd: kd, tex: '\\frac{' + c2 + '}{\\sqrt{n}}', plain: c2 + '/sqrt(n)', Ltex: '0', Lplain: '0', diffSq: function (n) { return Q(c2 * c2, n); }, mono: true, diffTex: '\\frac{' + c2 + '}{\\sqrt{n}}', solve: '$\\frac{' + c2 + '}{\\sqrt{n}} < \\varepsilon$ means $n > \\frac{' + (c2 * c2) + '}{\\varepsilon^{2}}$.' }; }
    if (kd === 'geo') { var c3 = R.int(1, 5), L3 = R.int(0, 4); return { kd: kd, tex: (L3 ? L3 + ' + ' : '') + '\\frac{' + c3 + '}{2^{n}}', plain: (L3 ? L3 + '+' : '') + c3 + '/2^n', Ltex: String(L3), Lplain: String(L3), diff: function (n) { return Q(c3, pow2(n)); }, mono: true, diffTex: '\\frac{' + c3 + '}{2^{n}}', solve: '$\\frac{' + c3 + '}{2^{n}} < \\varepsilon$ means $2^{n} > \\frac{' + c3 + '}{\\varepsilon}$.' }; }
    var cz = R.int(2, 4), dz = R.int(1, cz - 1), Lz = R.int(-2, 3);
    return { kd: 'zig', tex: (Lz ? Lz + ' + ' : '') + '\\frac{' + cz + ' + ' + dz + '(-1)^{n}}{n}', plain: (Lz ? Lz + '+' : '') + '(' + cz + '+' + dz + '*(-1)^n)/n', Ltex: String(Lz), Lplain: String(Lz),
      diff: function (n) { return Q(cz + (n % 2 ? -dz : dz), n); }, mono: false, cz: cz, dz: dz, diffTex: '\\frac{' + cz + ' + ' + dz + '(-1)^{n}}{n}',
      solve: 'The distance $\\frac{' + cz + ' + ' + dz + '(-1)^{n}}{n}$ is $\\frac{' + (cz + dz) + '}{n}$ for even $n$ and $\\frac{' + (cz - dz) + '}{n}$ for odd $n$; it is not monotone, so check both kinds of $n$.' };
  }
  function smallN(S, e) { // smallest N with diff(n) < e for all n >= N
    var eq = q(e);
    if (S.kd === 'root') return firstNfast(function (n) { return S.diffSq(n).lt(eq.mul(eq)); }, 1);
    if (S.mono) return firstNfast(function (n) { return S.diff(n).lt(eq); }, 1);
    var bound = Q(S.cz + S.dz, 1).div(eq).floor().toNumber() + 2, last = 0; // diff(n) <= (c+d)/n < e beyond the bound
    for (var n = 1; n <= bound; n++) if (!S.diff(n).lt(eq)) last = n;
    return last + 1;
  }
  function diffAt(S, n) { return S.kd === 'root' ? null : S.diff(n); }

  G('ra.sequence-limit', function (R, ctx) {
    var L = lv(ctx), S = nSeq(R, L), shape = by(ctx, R.pick(['one', 'one', 'check']), R.pick(['two', 'check', 'one']), R.pick(['one', 'two', 'check']));
    var intro = 'Let $a_n = ' + S.tex + '$, which converges to $L = ' + S.Ltex + '$. ';
    if (shape === 'check') {
      var e = epsPick(R, L), n0 = smallN(S, e), Nt = M.max(1, n0 + R.pick([-3, -2, -1, 0, 1, 4])), works = Nt >= n0;
      var at = S.kd === 'root' ? null : S.diff(Nt), atTex = at ? T.num(at) : '\\frac{' + S.tex.replace(/^\\frac\{(\d+)\}.*$/, '$1') + '}{\\sqrt{' + Nt + '}}';
      var bad = !works ? (S.mono ? Nt : n0 - 1) : null;
      return { q: intro + 'For $' + E(e) + '$, does $N = ' + Nt + '$ work, that is, is $|a_n - L| < \\varepsilon$ for every $n \\ge ' + Nt + '$?', a: tf(works),
        steps: ['$|a_n - L| = ' + S.diffTex + '$.', S.solve, 'The smallest $N$ that works is $' + n0 + '$' + (works ? ', and every larger $N$ works too. So $N = ' + Nt + '$ works: true.' : '. At $n = ' + bad + '$ the distance is ' + (S.kd === 'root' ? 'not below $\\varepsilon$' : '$' + T.num(S.diff(bad)) + ' \\ge ' + epsTex(e) + '$') + ', so $N = ' + Nt + '$ fails: false.')],
        hint: 'Find where $|a_n - L| < \\varepsilon$ starts to hold for good.', data: { k: 'check', f: S.plain, L: S.Lplain, e: qp(e), N: Nt, n0: n0 } };
    }
    var es = shape === 'two' ? (L === 3 ? ['0.01', '0.001'] : R.pick([['0.1', '0.01'], ['1/10', '1/100'], ['0.05', '0.005']])) : [epsPick(R, L)];
    var ns = es.map(function (e) { return smallN(S, e); });
    var parts = es.map(function (e, i) { return part(es.length > 1 ? 'For $' + E(e) + '$: $N =$' : '$N =$', anyN(ns[i])); });
    return { q: intro + (es.length > 1 ? 'Find an $N$ that works for $' + E(es[0]) + '$ and one for $' + E(es[1]) + '$' : 'For $' + E(es[0]) + '$, find an $N$') + ' such that $|a_n - L| < \\varepsilon$ for every $n \\ge N$. (Any $N$ that works is right.)', a: multi(parts),
      steps: ['$|a_n - L| = ' + S.diffTex + '$.', S.solve].concat(es.map(function (e, i) { var n0 = ns[i]; return 'For $' + E(e) + '$ the first $n$ from which it holds is $' + n0 + '$' + (n0 > 1 && S.kd !== 'root' ? ' ($|a_{' + (n0 - 1) + '} - L| = ' + T.num(S.diff(n0 - 1)) + '$ is not below $' + epsTex(e) + '$)' : '') + ', so $N = ' + n0 + '$ works, and so does any larger $N$.'; })).concat(es.length > 1 ? ['A smaller $\\varepsilon$ needs a larger $N$: that is how the definition works.'] : []),
      hint: 'Write $|a_n - L|$ as a formula in $n$, then solve $|a_n - L| < \\varepsilon$ for $n$.', viz: L === 1 && S.kd !== 'root' ? { name: 'ra-epsband', opts: { f: S.plain, L: S.Lplain, eps: Number(q(es[0]).toNumber()), N: null, quiet: true, edit: false, nmax: M.min(60, M.max(12, ns[0] + 6)) } } : undefined,
      data: { k: 'findN', f: S.plain, L: S.Lplain, es: es.map(qp), ns: ns } };
  });

  G('ra.epsilon-n-proofs', function (R, ctx) {
    var L = lv(ctx), S = ratSeq(R, L === 1 ? 2 : L, { minD: 2 }), shape = by(ctx, R.pick(['simplify', 'choose']), R.pick(['bound', 'order', 'choose']), R.pick(['order', 'flaw', 'bound']));
    var C = Q(S.D, S.r * S.r), intro = 'For $a_n = ' + S.tex + '$ and $L = ' + T.num(S.Lq) + '$, ';
    var denPlain = (S.r * S.r) + '*n+' + (S.r * S.s);
    if (shape === 'simplify') return { q: intro + 'write $|a_n - L|$ as a single fraction in $n$ (for $n \\ge 1$).', a: expr(S.D + '/(' + denPlain + ')', ['n']),
      steps: ['$a_n - L = ' + S.tex + (S.Lq.sign() < 0 ? ' + ' + T.num(S.Lq.neg()) : ' - ' + T.num(S.Lq)) + ' = \\frac{' + (S.r === 1 ? '' : S.r) + '(' + T.lin(S.p, 'n', S.q) + ') - ' + T.p(S.p) + '(' + T.lin(S.r, 'n', S.s) + ')}{' + (S.r === 1 ? '' : S.r) + '(' + T.lin(S.r, 'n', S.s) + ')}$.', 'The $n$ terms cancel, leaving $\\frac{' + (S.q * S.r - S.p * S.s) + '}{' + T.lin(S.r * S.r, 'n', S.r * S.s) + '}$.', 'For $n \\ge 1$ the denominator is positive, so $|a_n - L| = \\frac{' + S.D + '}{' + T.lin(S.r * S.r, 'n', S.r * S.s) + '}$.'],
      hint: 'Subtract over a common denominator; the terms with $n$ in the numerator cancel.', data: { k: 'simp', f: S.plain, L: S.Lq.toPlain() } };
    if (shape === 'bound') return { q: intro + '$|a_n - L| = ' + S.diffTex + '$. What is the smallest constant $C$ with $|a_n - L| \\le \\frac{C}{n}$ for every $n \\ge 1$?', a: num(C.toPlain()),
      steps: ['We need $C \\ge n|a_n - L| = \\frac{' + S.D + 'n}{' + T.lin(S.r * S.r, 'n', S.r * S.s) + '}$ for every $n$.', 'That fraction increases with $n$ toward $' + (C.d === BigInt(S.r * S.r) ? '' : '\\frac{' + S.D + '}{' + (S.r * S.r) + '} = ') + T.num(C) + '$ and never reaches it.', 'So $C = ' + T.num(C) + '$ is the smallest constant that works. (Dropping the $' + (S.r * S.s) + '$ in the denominator gives it directly: $|a_n - L| < \\frac{' + S.D + '}{' + (S.r * S.r) + 'n}$.)'],
      hint: 'Make the denominator smaller by dropping its constant term.', data: { k: 'boundC', f: S.plain, L: S.Lq.toPlain(), C: C.toPlain() } };
    var Ct = T.num(C), Cbig = C.gt(1);
    function over(sym) { return C.isInt() ? '\\frac{' + Ct + '}{' + sym + '}' : '\\frac{' + C.n + '}{' + C.d + sym + '}'; }
    if (shape === 'choose') return { q: intro + 'scratch work shows $|a_n - L| < ' + over('n') + '$. Which choice of $N$ makes the proof work for every $\\varepsilon > 0$?', a: mc('any integer $N > ' + over('\\varepsilon') + '$', ['$N = ' + (C.isInt() ? '\\frac{\\varepsilon}{' + Ct + '}' : '\\frac{' + C.d + '\\varepsilon}{' + C.n + '}') + '$', 'any integer $N > ' + Ct + '\\varepsilon$', Cbig ? 'any integer $N > \\frac{1}{\\varepsilon}$' : '$N = 100$', 'any integer $N > ' + over('n') + '$']),
      steps: ['We want $' + over('n') + ' < \\varepsilon$ for every $n \\ge N$, that is, $n > ' + over('\\varepsilon') + '$.', 'So choose $N > ' + over('\\varepsilon') + '$; then $n \\ge N$ gives $|a_n - L| < ' + over('n') + ' \\le ' + over('N') + ' < \\varepsilon$.', 'An $N$ may depend on $\\varepsilon$ but never on $n$; a fixed $N$ like $100$ fails for small $\\varepsilon$.'],
      hint: 'Solve $\\frac{C}{n} < \\varepsilon$ for $n$.', data: { k: 'mc' } };
    if (shape === 'order') {
      var O = orderTask(R, ['Let $\\varepsilon > 0$.', 'Choose an integer $N > ' + over('\\varepsilon') + '$.', 'Let $n \\ge N$.', 'Then $|a_n - L| = ' + S.diffTex + ' < ' + over('n') + '$.', 'And $' + over('n') + ' \\le ' + over('N') + ' < \\varepsilon$, so $|a_n - L| < \\varepsilon$.']);
      return { q: 'Put the steps of a proof that $' + S.tex + ' \\to ' + T.num(S.Lq) + '$ in order. Type the letters, like CADBE.<br>' + O.list, a: O.a,
        steps: ['An ε–N proof follows the quantifiers: for every $\\varepsilon$ (let $\\varepsilon > 0$), there is an $N$ (choose it), such that every $n \\ge N$ (let $n \\ge N$) satisfies the inequality (the estimate).', 'The order is ' + O.order.join(', ') + '.'], hint: 'Read the definition left to right: for every ε, there is an N, for all n ≥ N, …', data: { k: 'order' } };
    }
    var fl = R.pick([['“Let $\\varepsilon > 0$. Choose $N = n + 1$. Then for $n \\ge N$, …”', 'The choice of $N$ depends on $n$; $N$ must be chosen before $n$, from $\\varepsilon$ alone.', ['It should start “Let $\\varepsilon = 0.01$.”', 'It should use $n > N$ instead of $n \\ge N$.', 'Nothing is wrong.']],
      ['“Suppose $|a_n - L| < \\varepsilon$. Then $' + over('n') + ' < \\varepsilon$, so $n > ' + over('\\varepsilon') + '$. Hence the limit is $L$.”', 'It starts from what it is trying to prove; this is the scratch work run backward, not a proof.', ['The algebra $\\frac{C}{n} < \\varepsilon \\Rightarrow n > \\frac{C}{\\varepsilon}$ is wrong.', 'It should choose $\\varepsilon = \\frac{1}{n}$.', 'Nothing is wrong.']],
      ['“Let $\\varepsilon = \\frac{1}{100}$. Choose $N = ' + (C.mul(100).floor().toNumber() + 1) + '$. For $n \\ge N$, $|a_n - L| < ' + over('n') + ' < \\frac{1}{100}$. So $a_n \\to L$.”', 'It proves the inequality for one $\\varepsilon$ only; the definition needs every $\\varepsilon > 0$.', ['$N$ is too small.', 'It should use $n \\le N$.', 'Nothing is wrong.']]]);
    return { q: 'A student writes this as a proof that $' + S.tex + ' \\to ' + T.num(S.Lq) + '$:<br>' + fl[0] + '<br>What is wrong?', a: mc(fl[1], fl[2]),
      steps: ['The definition: for every $\\varepsilon > 0$ there is an $N$ (depending only on $\\varepsilon$) with $|a_n - L| < \\varepsilon$ for all $n \\ge N$.', 'The flaw: ' + fl[1]], hint: 'Compare the order of the quantifiers with the definition.', data: { k: 'mc' } };
  });

  G('ra.divergence', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bound', 'negate']), R.pick(['witness', 'bound', 'tf']), R.pick(['witness', 'proofM', 'tf']));
    if (shape === 'bound') {
      var kd = L === 1 ? 'rat' : R.pick(['rat', 'alt', 'peak']), tx, Mv, why, fj;
      if (kd === 'rat') { var S = ratSeq(R, 2), a1 = S.val(1); fj = '(' + S.p + '*n+(' + S.q + '))/(' + S.r + '*n+' + S.s + ')'; Mv = qmax(a1.abs(), S.Lq.abs()); tx = S.tex; why = ['The terms move monotonically from $a_1 = ' + T.num(a1) + '$ toward the limit $' + T.num(S.Lq) + '$ (the sign of $a_n - L = \\frac{' + (S.q * S.r - S.p * S.s) + '}{' + (S.r === 1 ? '' : S.r) + '(' + T.lin(S.r, 'n', S.s) + ')}$ never changes, and its size shrinks).', 'So every $|a_n|$ is at most the larger of $|a_1| = ' + T.num(a1.abs()) + '$ and $|L| = ' + T.num(S.Lq.abs()) + '$, and that value is reached or approached.']; }
      else if (kd === 'alt') { var c = R.int(1, 5); fj = '(n%2?-1:1)*(n+' + c + ')/n'; tx = '(-1)^{n}\\,\\frac{n + ' + c + '}{n}'; Mv = q(1 + c); why = ['$|a_n| = \\frac{n + ' + c + '}{n} = 1 + \\frac{' + c + '}{n}$, which decreases.', 'Its largest value is at $n = 1$: $' + (1 + c) + '$.']; }
      else { var cc = R.pick([5, 8, 10, 15, 20, 30, 40]), best = Q(0), bn = 1; for (var n = 1; n <= 60; n++) { var v = Q(n, n * n + cc); if (v.gt(best)) { best = v; bn = n; } } tx = '\\frac{n}{n^{2} + ' + cc + '}'; fj = 'n/(n*n+' + cc + ')'; Mv = best; why = ['The terms rise while $n^{2} < ' + cc + '$ and fall after: $\\frac{n}{n^{2} + ' + cc + '} = \\frac{1}{n + ' + cc + '/n}$ and $n + \\frac{' + cc + '}{n}$ is smallest near $n = \\sqrt{' + cc + '}$.', 'Checking the whole numbers there, the largest term is $a_{' + bn + '} = ' + T.num(best) + '$.']; }
      return { q: 'Convergent sequences are bounded. For $a_n = ' + tx + '$ ($n \\ge 1$), what is the smallest $M$ with $|a_n| \\le M$ for every $n$?', a: num(Mv.toPlain()), steps: why.concat(['So $M = ' + T.num(Mv) + '$.']),
        hint: 'Find the largest value of $|a_n|$, or the value it creeps up to.', data: { k: 'bound', kind: kd, M: Mv.toPlain(), fj: fj } };
    }
    if (shape === 'witness') {
      var kd2 = R.pick(['two', 'two', 'three']), vals, tx2;
      if (kd2 === 'two') { var b = R.int(-3, 3), c2 = R.int(1, 4); vals = [b - c2, b + c2]; tx2 = (b ? b + ' + ' : '') + (c2 === 1 ? '' : c2) + '(-1)^{n}'; }
      else { var c3 = R.int(1, 3); vals = [0, -c3, c3]; tx2 = (c3 === 1 ? '' : c3) + '\\cos\\left(\\frac{n\\pi}{2}\\right)'; }
      var Lw = q(R.pick([-2, -1, 0, 1, 2, '1/2', '-1/2'])), best2 = Q(0);
      vals.forEach(function (x) { var d = q(x).sub(Lw).abs(); if (d.gt(best2)) best2 = d; });
      return { q: 'The sequence $a_n = ' + tx2 + '$ takes only the values $' + setTex(vals.slice().sort(function (x, y) { return x - y; }).map(String)).replace(/^\\\{|\\\}$/g, '') + '$, each infinitely often, so it does not converge. Give an $\\varepsilon > 0$ that proves it does not converge to $L = ' + T.num(Lw) + '$: for every $N$, some $n \\ge N$ has $|a_n - L| \\ge \\varepsilon$. (Any $\\varepsilon$ that works is right.)', a: upTo(best2.toPlain()),
        steps: ['The distances from $' + T.num(Lw) + '$ to the values are ' + vals.map(function (x) { return '$' + T.num(q(x).sub(Lw).abs()) + '$'; }).join(', ') + '.', 'The largest, $' + T.num(best2) + '$, occurs for infinitely many $n$, so beyond any $N$ there is an $n$ with $|a_n - L| = ' + T.num(best2) + '$.', 'So every $\\varepsilon$ with $0 < \\varepsilon \\le ' + T.num(best2) + '$ works; for example $\\varepsilon = ' + T.num(best2) + '$.'],
        hint: 'Which value does the sequence keep returning to that is farthest from $L$?', data: { k: 'witness', vals: vals, L: Lw.toPlain(), max: best2.toPlain() } };
    }
    if (shape === 'negate') return { q: 'Which statement says that $a_n$ does <b>not</b> converge to $L$?', a: mc('There is an $\\varepsilon > 0$ such that for every $N$ some $n \\ge N$ has $|a_n - L| \\ge \\varepsilon$.', ['For every $\\varepsilon > 0$ and every $N$, every $n \\ge N$ has $|a_n - L| \\ge \\varepsilon$.', 'For every $\\varepsilon > 0$ there is an $N$ such that every $n \\ge N$ has $|a_n - L| \\ge \\varepsilon$.', 'There is an $\\varepsilon > 0$ and an $N$ such that some $n \\ge N$ has $|a_n - L| < \\varepsilon$.']),
      steps: ['The definition: for every $\\varepsilon > 0$ there is an $N$ such that every $n \\ge N$ has $|a_n - L| < \\varepsilon$.', 'Negate each quantifier in turn: "for every" becomes "there is", "there is" becomes "for every", and $<$ becomes $\\ge$.', 'So: some $\\varepsilon > 0$ defeats every $N$.'], hint: 'Negate one quantifier at a time, left to right.', data: { k: 'mc' } };
    if (shape === 'tf') {
      var st = R.pick([['Every bounded sequence converges.', false, 'False: $(-1)^{n}$ is bounded and does not converge.'], ['Every convergent sequence is bounded.', true, 'True: past some $N$ the terms are within $1$ of $L$, and there are only finitely many terms before $N$.'],
        ['Every unbounded sequence diverges.', true, 'True: this is the contrapositive of "convergent implies bounded."'], ['If $|a_n| \\le 5$ for every $n$, then $a_n$ converges to a number in $[-5, 5]$.', false, 'False: $5(-1)^{n}$ satisfies the bound and does not converge.'], ['If $a_n$ converges, then $a_n$ is eventually constant.', false, 'False: $\\frac{1}{n} \\to 0$ and no two of its terms are equal.']]);
      return { q: 'True or false: ' + st[0], a: tf(st[1]), steps: [st[2]], hint: 'Try $(-1)^{n}$ and $\\frac{1}{n}$.', data: { k: 'tf' } };
    }
    // proofM: M = max(|a_1|, …, |a_{N-1}|, |L| + 1) with N for ε = 1
    var S2 = ratSeq(R, 3, { big: true }), N1 = firstNfast(function (n) { return S2.diff(n).lt(1); }, 1), Mm = S2.Lq.abs().add(1), terms = [];
    for (var k = 1; k < N1; k++) { terms.push(S2.val(k).abs()); if (S2.val(k).abs().gt(Mm)) Mm = S2.val(k).abs(); }
    return { q: 'The proof that convergent sequences are bounded takes $\\varepsilon = 1$, finds $N$ with $|a_n - L| < 1$ for all $n \\ge N$, and sets $M = \\max\\{|a_1|, \\ldots, |a_{N-1}|, |L| + 1\\}$. For $a_n = ' + S2.tex + '$ (limit $' + T.num(S2.Lq) + '$), using the smallest such $N$, find $N$ and $M$.', a: multi([part('$N =$', num(N1)), part('$M =$', num(Mm.toPlain()))]),
      steps: ['$|a_n - L| = ' + S2.diffTex + '$, which is less than $1$ from $n = ' + N1 + '$ on' + (N1 > 1 ? ' (at $n = ' + (N1 - 1) + '$ it is $' + T.num(S2.diff(N1 - 1)) + '$)' : '') + '. So $N = ' + N1 + '$.', 'For $n \\ge N$: $|a_n| < |L| + 1 = ' + T.num(S2.Lq.abs().add(1)) + '$.', (N1 > 1 ? 'The earlier terms have $' + terms.map(function (t, i) { return '|a_{' + (i + 1) + '}| = ' + T.num(t); }).join(',\\ ') + '$.' : 'There are no earlier terms to include.'), 'So $M = ' + T.num(Mm) + '$.'],
      hint: 'Find where $|a_n - L| < 1$ starts, then take the largest of the early terms and $|L| + 1$.', data: { k: 'proofM', f: S2.plain, L: S2.Lq.toPlain(), N: N1, M: Mm.toPlain() } };
  });

  G('ra.limit-laws', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['compute', 'identity']), R.pick(['split', 'product', 'compute']), R.pick(['product', 'quotient', 'split']));
    if (shape === 'compute') {
      for (var t = 0; t < 50; t++) {
        var A = R.nz(-5, 5), B = R.nz(-5, 5), k = R.nz(-6, 6), form = R.int(0, 3), v, tx;
        if (form === 0) { if (B + k === 0) continue; v = Q(A * B - A * A, B + k); tx = '\\frac{a_n b_n - a_n^{2}}{b_n ' + (k < 0 ? '- ' + (-k) : '+ ' + k) + '}'; }
        else if (form === 1) { v = q((2 * A - 3 * B) * (2 * A - 3 * B)); tx = '(2a_n - 3b_n)^{2}'; }
        else if (form === 2) { v = Q(A, B * B + 1); tx = '\\frac{a_n}{b_n^{2} + 1}'; }
        else { if (A * B + k === 0) continue; v = Q(A + B, A * B + k); tx = '\\frac{a_n + b_n}{a_n b_n ' + (k < 0 ? '- ' + (-k) : '+ ' + k) + '}'; }
        break;
      }
      return { q: 'Suppose $a_n \\to ' + A + '$ and $b_n \\to ' + B + '$. Find $' + LIMN + ' ' + tx + '$.', a: num(v.toPlain()),
        steps: ['By the limit laws (sums, products, and quotients with a nonzero limit in the denominator), replace $a_n$ by $' + A + '$ and $b_n$ by $' + B + '$.', 'The value is $' + T.num(v) + '$.'], hint: 'Check that the denominator\'s limit is not $0$, then substitute the limits.', data: { k: 'compute', A: A, B: B, form: form, kk: k, v: v.toPlain() } };
    }
    if (shape === 'identity') return { q: 'The product law proof rewrites $a_n b_n - ab$ by adding and subtracting one term. Which identity is correct?', a: mc('$a_n b_n - ab = a_n(b_n - b) + b(a_n - a)$', ['$a_n b_n - ab = a_n(b_n - b) - b(a_n - a)$', '$a_n b_n - ab = (a_n - a)(b_n - b)$', '$a_n b_n - ab = b_n(a_n - a) + a_n(b_n - b)$']),
      steps: ['Add and subtract $a_n b$: $a_n b_n - a_n b + a_n b - ab$.', 'Group: $a_n(b_n - b) + b(a_n - a)$.', 'Each piece is small: $|a_n|$ stays bounded and $|b_n - b| \\to 0$; $|b|$ is fixed and $|a_n - a| \\to 0$.'], hint: 'Add and subtract $a_n b$, then factor.', data: { k: 'mc' } };
    if (shape === 'split') {
      var c1 = R.int(1, 6), c2 = R.int(1, 6), e = epsPick(R, L), eq = q(e), N1 = firstNfast(function (n) { return Q(c1, n).lt(eq.div(2)); }, 1), N2 = firstNfast(function (n) { return Q(c2, n).lt(eq.div(2)); }, 1);
      return { q: 'Suppose $|a_n - a| \\le \\frac{' + c1 + '}{n}$ and $|b_n - b| \\le \\frac{' + c2 + '}{n}$ for every $n$. The sum-law proof with $' + E(e) + '$ takes the smallest $N_1$ with $|a_n - a| < \\frac{\\varepsilon}{2}$ for $n \\ge N_1$ (using the bound), the smallest such $N_2$ for $b_n$, and $N = \\max(N_1, N_2)$. Find $N_1$, $N_2$ and $N$.',
        a: multi([part('$N_1 =$', num(N1)), part('$N_2 =$', num(N2)), part('$N =$', num(M.max(N1, N2)))]),
        steps: ['$\\frac{\\varepsilon}{2} = ' + T.num(eq.div(2)) + '$.', '$\\frac{' + c1 + '}{n} < ' + T.num(eq.div(2)) + '$ means $n > ' + T.num(Q(c1).div(eq.div(2))) + '$, so $N_1 = ' + N1 + '$; likewise $n > ' + T.num(Q(c2).div(eq.div(2))) + '$ gives $N_2 = ' + N2 + '$.', 'For $n \\ge N = ' + M.max(N1, N2) + '$ both hold, so $|(a_n + b_n) - (a + b)| \\le |a_n - a| + |b_n - b| < \\frac{\\varepsilon}{2} + \\frac{\\varepsilon}{2} = \\varepsilon$.'],
        hint: 'Give each sequence half of $\\varepsilon$; the larger $N$ serves both.', data: { k: 'split', c1: c1, c2: c2, e: qp(e), N1: N1, N2: N2 } };
    }
    if (shape === 'product') {
      var Mb = R.int(2, 9), bb = R.nz(-6, 6), e2 = q(R.pick(['0.1', '0.01', '1/10', '1/20', '0.03'])), x1 = e2.div(2 * Mb), x2 = e2.div(2 * M.abs(bb));
      return { q: 'In the product-law proof, $|a_n b_n - ab| \\le |a_n|\\,|b_n - b| + |b|\\,|a_n - a|$. Suppose $|a_n| \\le ' + Mb + '$ for all $n$, $b = ' + bb + '$ and $\\varepsilon = ' + T.num(e2) + '$. To make each piece less than $\\frac{\\varepsilon}{2}$, how small must $|b_n - b|$ and $|a_n - a|$ be? Give the two bounds.',
        a: multi([part('$|b_n - b| <$', num(x1.toPlain())), part('$|a_n - a| <$', num(x2.toPlain()))]),
        steps: ['$|a_n|\\,|b_n - b| \\le ' + Mb + '|b_n - b| < \\frac{\\varepsilon}{2}$ when $|b_n - b| < \\frac{\\varepsilon}{2 \\cdot ' + Mb + '} = ' + T.num(x1) + '$.', '$|b|\\,|a_n - a| = ' + M.abs(bb) + '|a_n - a| < \\frac{\\varepsilon}{2}$ when $|a_n - a| < \\frac{\\varepsilon}{2 \\cdot ' + M.abs(bb) + '} = ' + T.num(x2) + '$.', 'Past an $N$ where both hold, $|a_n b_n - ab| < \\varepsilon$.'],
        hint: 'Divide $\\frac{\\varepsilon}{2}$ by the factor in front of each small piece.', data: { k: 'product', Mb: Mb, b: bb, e: e2.toPlain(), x1: x1.toPlain(), x2: x2.toPlain() } };
    }
    var b3 = R.nz(-6, 6), e3 = q(R.pick(['0.1', '0.01', '1/20', '0.02'])), need = e3.mul(b3 * b3).div(2);
    return { q: 'For the quotient law with $b_n \\to b = ' + b3 + '$: eventually $|b_n| > \\frac{|b|}{2}$, so $\\left|\\frac{1}{b_n} - \\frac{1}{b}\\right| = \\frac{|b_n - b|}{|b_n|\\,|b|} < \\frac{2|b_n - b|}{b^{2}}$. For $\\varepsilon = ' + T.num(e3) + '$, how small must $|b_n - b|$ be to make this less than $\\varepsilon$?', a: num(need.toPlain()),
      steps: ['We need $\\frac{2|b_n - b|}{' + (b3 * b3) + '} < ' + T.num(e3) + '$.', 'Multiply by $\\frac{' + (b3 * b3) + '}{2}$: $|b_n - b| < \\frac{' + (b3 * b3) + ' \\cdot ' + T.num(e3) + '}{2} = ' + T.num(need) + '$.'], hint: 'Solve $\\frac{2x}{b^{2}} < \\varepsilon$ for $x$.', data: { k: 'quot', b: b3, e: e3.toPlain(), need: need.toPlain() } };
  });

  G('ra.squeeze-order', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['limit', 'limit', 'order']), R.pick(['limit', 'order', 'interval']), R.pick(['limit', 'limit', 'order']));
    if (shape === 'limit') {
      var kd = L === 1 ? R.pick(['sin', 'alt']) : L === 2 ? R.pick(['sin', 'alt', 'root', 'cos2']) : R.pick(['root', 'pow', 'sum', 'cos2']), tx, v, st;
      if (kd === 'sin') { var c = R.nz(-5, 5), d = R.int(1, 9), e1 = R.int(1, 5), f = R.int(1, 9); tx = '\\frac{' + T.lin(c, 'n', 0) + ' + ' + (d === 1 ? '' : d) + '\\sin n}{' + T.lin(e1, 'n', f) + '}'; v = Q(c, e1); st = ['Divide top and bottom by $n$: $\\frac{' + c + ' + ' + (d === 1 ? '' : d) + '\\frac{\\sin n}{n}}{' + e1 + ' + \\frac{' + f + '}{n}}$.', 'Squeeze: $-\\frac{1}{n} \\le \\frac{\\sin n}{n} \\le \\frac{1}{n}$, and both bounds go to $0$, so $\\frac{\\sin n}{n} \\to 0$.', 'By the limit laws the limit is $\\frac{' + c + '}{' + e1 + '} = ' + T.num(v) + '$.']; }
      else if (kd === 'alt') { var c2 = R.nz(-6, 6), d2 = R.int(1, 9), e2 = R.int(2, 5); tx = '\\frac{' + T.lin(c2, 'n', 0) + ' + ' + (d2 === 1 ? '' : d2) + '(-1)^{n}}{' + e2 + 'n}'; v = Q(c2, e2); st = ['Split: $\\frac{' + c2 + '}{' + e2 + '} + \\frac{' + (d2 === 1 ? '' : d2) + '(-1)^{n}}{' + e2 + 'n}$.', 'The second piece is squeezed: $\\left|\\frac{' + (d2 === 1 ? '' : d2) + '(-1)^{n}}{' + e2 + 'n}\\right| = \\frac{' + d2 + '}{' + e2 + 'n} \\to 0$.', 'So the limit is $' + T.num(v) + '$.']; }
      else if (kd === 'cos2') { var c3 = R.nz(-5, 5), d3 = R.int(2, 6); tx = '\\frac{' + T.lin(c3, 'n^{2}', 0) + ' + \\cos n}{' + d3 + 'n^{2} + 1}'; v = Q(c3, d3); st = ['Divide by $n^{2}$: $\\frac{' + c3 + ' + \\frac{\\cos n}{n^{2}}}{' + d3 + ' + \\frac{1}{n^{2}}}$.', '$\\left|\\frac{\\cos n}{n^{2}}\\right| \\le \\frac{1}{n^{2}} \\to 0$, so that piece goes to $0$.', 'The limit is $' + T.num(v) + '$.']; }
      else if (kd === 'root') { var k = R.int(1, 8); tx = '\\sqrt{n^{2} + ' + (k === 1 ? '' : k) + 'n} - n'; v = Q(k, 2); st = ['Multiply by the conjugate: $\\frac{' + (k === 1 ? '' : k) + 'n}{\\sqrt{n^{2} + ' + (k === 1 ? '' : k) + 'n} + n}$.', 'Divide by $n$: $\\frac{' + k + '}{\\sqrt{1 + \\frac{' + k + '}{n}} + 1}$.', 'As $n \\to \\infty$ this tends to $\\frac{' + k + '}{2}' + (k % 2 ? '' : ' = ' + (k / 2)) + '$.']; }
      else if (kd === 'pow') { var a = R.int(2, 6), b = R.intNot(2, 7, a), mx = M.max(a, b), mn = M.min(a, b); tx = '\\left(' + a + '^{n} + ' + b + '^{n}\\right)^{1/n}'; v = q(mx); st = ['Squeeze: $' + mx + '^{n} \\le ' + a + '^{n} + ' + b + '^{n} \\le 2 \\cdot ' + mx + '^{n}$.', 'Take $n$th roots: $' + mx + ' \\le a_n \\le 2^{1/n} \\cdot ' + mx + '$.', 'Since $2^{1/n} \\to 1$, both bounds tend to $' + mx + '$, so the limit is $' + mx + '$.']; }
      else { var cc = R.int(1, 3); tx = '\\sum_{k=1}^{n} \\frac{' + (cc === 1 ? '' : cc) + 'n}{n^{2} + k}'; v = q(cc); st = ['Each of the $n$ terms lies between $\\frac{' + (cc === 1 ? '' : cc) + 'n}{n^{2} + n}$ and $\\frac{' + (cc === 1 ? '' : cc) + 'n}{n^{2} + 1}$.', 'So $\\frac{' + (cc === 1 ? '' : cc) + 'n^{2}}{n^{2} + n} \\le a_n \\le \\frac{' + (cc === 1 ? '' : cc) + 'n^{2}}{n^{2} + 1}$.', 'Both bounds tend to $' + cc + '$, so the limit is $' + cc + '$.']; }
      tx = tx.replace(/\\frac\{(-?\d+)n \+/g, '\\frac{$1n +');
      var fj = kd === 'sin' ? '(' + c + '*n+' + d + '*Math.sin(n))/(' + e1 + '*n+' + f + ')' : kd === 'alt' ? '(' + c2 + '*n+' + d2 + '*(n%2?-1:1))/(' + e2 + '*n)' : kd === 'cos2' ? '(' + c3 + '*n*n+Math.cos(n))/(' + d3 + '*n*n+1)' : kd === 'root' ? 'Math.sqrt(n*n+' + k + '*n)-n' : kd === 'pow' ? 'POW:' + a + ',' + b : 'SUM:' + cc;
      return { q: 'Find $' + LIMN + ' ' + tx + '$.', a: num(v.toPlain()), steps: st, hint: 'Trap the messy part between two simpler sequences with the same limit.', data: { k: 'lim', kind: kd, v: v.toPlain(), fj: fj } };
    }
    if (shape === 'order') {
      var it = R.pick([['If $a_n < b_n$ for every $n$, $a_n \\to a$ and $b_n \\to b$, which must be true?', '$a \\le b$', ['$a < b$', '$a = b$', '$a \\ge b$'], 'Limits keep $\\le$ but not $<$: $0 < \\frac{1}{n}$ for every $n$, yet both limits are $0$.'],
        ['If $a_n > 0$ for every $n$ and $a_n \\to L$, which must be true?', '$L \\ge 0$', ['$L > 0$', '$L = 0$', 'Nothing can be said about $L$.'], 'The order limit theorem gives $L \\ge 0$; the example $\\frac{1}{n} \\to 0$ shows $L$ can be $0$.'],
        ['If $a_n \\le c_n \\le b_n$ for every $n \\ge 10$, and $a_n \\to 3$ and $b_n \\to 3$, which must be true?', '$c_n \\to 3$', ['$c_n$ might diverge.', '$c_n \\to 3$ only if $c_n$ is monotone.', '$c_n = 3$ for $n \\ge 10$.'], 'This is the squeeze theorem; what happens before $n = 10$ does not matter.']]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Think of $\\frac{1}{n}$.', data: { k: 'mc' } };
    }
    var c4 = R.int(-5, 3), d4 = c4 + R.int(1, 6), N4 = R.int(5, 20);
    return { q: 'Suppose $a_n \\to L$ and $' + c4 + ' \\le a_n \\le ' + d4 + '$ for every $n \\ge ' + N4 + '$. What is the smallest interval that must contain $L$?', a: { t: 'interval', v: '[' + c4 + ', ' + d4 + ']' },
      steps: ['The order limit theorem: if $a_n \\le ' + d4 + '$ eventually, then $L \\le ' + d4 + '$; if $a_n \\ge ' + c4 + '$ eventually, then $L \\ge ' + c4 + '$.', 'So $L \\in [' + c4 + ', ' + d4 + ']$, a closed interval: $L$ can equal an end (as $' + d4 + ' - \\frac{1}{n} \\to ' + d4 + '$ shows).'], hint: 'Can the limit land exactly on a bound?', data: { k: 'iv', c: c4, d: d4 } };
  });

  // recursions with exact limits
  function recSeq(R, lvl) {
    var kd = lvl === 1 ? R.pick(['lin', 'sqrtk']) : R.pick(['lin', 'sqrtk', 'sqrtc', 'newton', 'recip']);
    if (kd === 'lin') { var r = q(R.pick(['1/2', '1/3', '2/3', '1/4', '3/4'])), b = R.int(1, 6), a1 = R.int(0, 2), Lq = q(b).div(q(1).sub(r)); if (q(a1).eq(Lq)) a1 = 0; return { kd: kd, tex: 'a_{n+1} = ' + T.coef(r.toTex ? T.num(r) : r, 'a_n') + ' + ' + b, a1: a1, g: function (x) { return r.mul(x).add(b); }, L: { tex: T.num(Lq), plain: Lq.toPlain() }, eq: 'L = ' + T.num(r) + 'L + ' + b, inc: q(a1).lt(Lq), roots: null, gplain: r.toPlain() + '*x+' + b, gtex: T.num(r) + 'x + ' + b }; }
    if (kd === 'sqrtk') { var k = R.int(2, 5), c = k * (k - 1), a2 = R.int(0, 1); return { kd: kd, tex: 'a_{n+1} = \\sqrt{' + c + ' + a_n}', a1: a2, L: { tex: String(k), plain: String(k) }, eq: 'L^{2} - L - ' + c + ' = 0', roots: ['$' + k + '$', '$' + (1 - k) + '$'], inc: true, gplain: 'sqrt(' + c + '+x)', gtex: '\\sqrt{' + c + ' + x}' }; }
    if (kd === 'sqrtc') { var c2 = R.pick([1, 3, 5, 7]), s = surd(1 + 4 * c2), Lp = '(1+' + s.plain + ')/2'; return { kd: kd, tex: 'a_{n+1} = \\sqrt{' + c2 + ' + a_n}', a1: 0, L: { tex: '\\frac{1 + ' + s.tex + '}{2}', plain: Lp }, eq: 'L^{2} - L - ' + c2 + ' = 0', roots: ['$\\frac{1 + ' + s.tex + '}{2}$', '$\\frac{1 - ' + s.tex + '}{2}$'], inc: true, gplain: 'sqrt(' + c2 + '+x)', gtex: '\\sqrt{' + c2 + ' + x}' }; }
    if (kd === 'newton') { var k2 = R.pick([2, 3, 5, 6, 7]), s2 = surd(k2), a3 = R.int(k2 === 2 ? 2 : 3, 4); return { kd: kd, tex: 'a_{n+1} = \\frac{1}{2}\\left(a_n + \\frac{' + k2 + '}{a_n}\\right)', a1: a3, g: function (x) { x = q(x); return x.add(q(k2).div(x)).div(2); }, L: { tex: s2.tex, plain: s2.plain }, eq: 'L = \\frac{1}{2}\\left(L + \\frac{' + k2 + '}{L}\\right)', roots: ['$' + s2.tex + '$', '$-' + s2.tex + '$'], inc: false, gplain: '(x+' + k2 + '/x)/2', gtex: '\\frac{1}{2}\\left(x + \\frac{' + k2 + '}{x}\\right)' }; }
    var c3 = R.pick([3, 4, 5]), s3 = surd(c3 * c3 - 4);
    return { kd: 'recip', tex: 'a_{n+1} = \\frac{1}{' + c3 + ' - a_n}', a1: 0, g: function (x) { return q(1).div(q(c3).sub(x)); }, L: { tex: '\\frac{' + c3 + ' - ' + s3.tex + '}{2}', plain: '(' + c3 + '-' + s3.plain + ')/2' }, eq: 'L^{2} - ' + c3 + 'L + 1 = 0', roots: ['$\\frac{' + c3 + ' - ' + s3.tex + '}{2}$', '$\\frac{' + c3 + ' + ' + s3.tex + '}{2}$'], inc: true, gplain: '1/(' + c3 + '-x)', gtex: '\\frac{1}{' + c3 + ' - x}' };
  }
  G('ra.monotone-convergence', function (R, ctx) {
    var L = lv(ctx), S = recSeq(R, L), shape = by(ctx, R.pick(['limit', 'terms']), R.pick(['limit', 'root', 'terms']), R.pick(['root', 'trap', 'limit']));
    if (shape === 'terms' && !S.g) shape = 'limit';
    if (shape === 'root' && !S.roots) shape = 'limit';
    var intro = 'Let $a_1 = ' + S.a1 + '$ and $' + S.tex + '$ for $n \\ge 1$. ';
    if (shape === 'terms') {
      var a2 = S.g(S.a1), a3 = S.g(a2);
      return { q: intro + 'Find $a_2$ and $a_3$, and decide whether the sequence increases or decreases (from $a_2$ on).', a: multi([part('$a_2 =$', num(a2.toPlain())), part('$a_3 =$', num(a3.toPlain())), part('It', mc(S.inc ? 'increases' : 'decreases', [S.inc ? 'decreases' : 'increases', 'neither']))]),
        steps: ['$a_2 = ' + T.num(a2) + '$ and $a_3 = ' + T.num(a3) + '$.', S.inc ? 'Each term is below the fixed point $' + S.L.tex + '$, and $g(x) > x$ there, so the terms rise toward $' + S.L.tex + '$ (an induction proves it).' : 'From $a_2$ on, every term is above $' + S.L.tex + '$ (by the AM–GM inequality), and then $a_{n+1} < a_n$: the terms fall toward $' + S.L.tex + '$.', 'Monotone and bounded, so the sequence converges, to $' + S.L.tex + '$.'],
        hint: 'Substitute into the recursion twice.', viz: L === 1 ? { name: 'ra-cobweb', opts: { g: S.gplain, x0: S.a1, steps: 0, quiet: true, edit: false } } : undefined, data: { k: 'terms', g: S.gplain, a1: S.a1, a2: a2.toPlain(), a3: a3.toPlain(), inc: S.inc } };
    }
    if (shape === 'limit') return { q: intro + 'The sequence is monotone and bounded, so it converges. Find its limit.', a: num(S.L.plain),
      steps: ['Let $L$ be the limit. Since $a_{n+1} \\to L$ too, $L$ satisfies $' + S.eq + '$.', S.roots ? 'The solutions are ' + S.roots.join(' and ') + '.' : 'Solve for $L$.', (S.roots ? 'Keep the one the terms can approach: ' : '') + '$L = ' + S.L.tex + '$.'],
      hint: 'Let $n \\to \\infty$ on both sides of the recursion.', data: { k: 'limit', g: S.gplain, a1: S.a1, L: S.L.plain, kind: S.kd } };
    if (shape === 'root') return { q: intro + 'If $L$ is the limit, then $' + S.eq + '$, which has two solutions. Which one is the limit, and why?', a: mc(S.roots[0] + ', because ' + (S.kd === 'newton' ? 'every term is positive' : S.kd === 'recip' ? 'the terms start at $0$, increase, and stay below the smaller root' : 'every term is at least $0$'), [S.roots[1] + ', because it is the larger solution', S.roots[1] + ', because ' + (S.kd === 'newton' ? 'the terms decrease' : 'the terms increase'), 'Both, since the equation does not decide']),
      steps: ['The equation only says what the limit must be if it exists; it does not choose between the roots.', S.kd === 'newton' ? 'All terms are positive, so the limit is at least $0$: it is $' + S.L.tex + '$.' : S.kd === 'recip' ? 'By induction $0 \\le a_n <$ the smaller root, so the limit is at most the smaller root: it is $' + S.L.tex + '$.' : 'All terms are at least $0$, so the limit is at least $0$: it is $' + S.L.tex + '$.'],
      hint: 'Which root is consistent with what you know about every term?', data: { k: 'mc' } };
    var c = R.int(2, 3), b = R.int(1, 3), Lf = Q(-b, c - 1);
    return { q: 'Let $a_1 = 1$ and $a_{n+1} = ' + c + 'a_n + ' + b + '$. A student solves $L = ' + c + 'L + ' + b + '$ and concludes $a_n \\to ' + T.num(Lf) + '$. What is wrong?', a: mc('The sequence is unbounded, so it has no limit; the equation only says what a limit would have to be.', ['The equation should be $L = ' + c + 'L$.', 'The limit is $' + T.num(Lf.neg()) + '$; the sign was dropped.', 'Nothing is wrong.']),
      steps: ['The terms are $1, ' + (c + b) + ', ' + (c * (c + b) + b) + ', \\ldots$, growing without bound.', 'Solving $L = g(L)$ is only valid once you know the limit exists (here: monotone and bounded). It is not bounded, so there is no limit.'], hint: 'Compute the first few terms.', data: { k: 'mc' } };
  });

  // sequences with finitely many subsequential limits
  function subLimSeq(R, lvl) {
    var kd = R.pick(lvl === 1 ? ['altrat', 'mod'] : ['altrat', 'cos3', 'sin2', 'mod', 'cos2c']);
    if (kd === 'altrat') { var S = ratSeq(R, 2); while (S.p === 0) S = ratSeq(R, 2); return { kd: kd, fj: '(n%2?-1:1)*(' + S.p + '*n+(' + S.q + '))/(' + S.r + '*n+' + S.s + ')', tex: '(-1)^{n}\\,' + S.tex, lims: [S.Lq, S.Lq.neg()], why: 'Even $n$ give $' + S.tex + ' \\to ' + T.num(S.Lq) + '$; odd $n$ give the negatives, which tend to $' + T.num(S.Lq.neg()) + '$.', even: S.Lq, odd: S.Lq.neg() }; }
    if (kd === 'cos3') return { kd: kd, fj: 'Math.cos(n*Math.PI/3)', tex: '\\cos\\left(\\frac{n\\pi}{3}\\right)', lims: [q('1/2'), q('-1/2'), q(-1), q(1)], why: 'The values repeat every $6$ terms: $\\frac{1}{2}, -\\frac{1}{2}, -1, -\\frac{1}{2}, \\frac{1}{2}, 1$. Each value occurs infinitely often (a constant subsequence).' };
    if (kd === 'sin2') { var c = R.int(1, 4); return { kd: kd, fj: 'Math.sin(n*Math.PI/2)+' + c + '/n', tex: '\\sin\\left(\\frac{n\\pi}{2}\\right) + \\frac{' + c + '}{n}', lims: [q(1), q(0), q(-1)], why: 'The sine part cycles through $1, 0, -1, 0$, and $\\frac{' + c + '}{n} \\to 0$. So the subsequences $n = 4k + 1$, $4k + 2$, $4k + 3$ tend to $1$, $0$, $-1$.' }; }
    if (kd === 'mod') { var k = R.int(2, 4), c2 = R.int(1, 3); return { kd: kd, fj: '(n%' + k + ')+' + c2 + '/n', tex: '(n \\bmod ' + k + ') + \\frac{' + c2 + '}{n}', lims: U.range(0, k - 1).map(function (x) { return q(x); }), why: '$n \\bmod ' + k + '$ (the remainder when $n$ is divided by $' + k + '$) cycles through $' + U.range(0, k - 1).join(', ') + '$, and $\\frac{' + c2 + '}{n} \\to 0$.' }; }
    var c3 = R.int(2, 5); return { kd: 'cos2c', fj: 'Math.cos(n*Math.PI/2)*(' + c3 + '+1/n)', tex: '\\cos\\left(\\frac{n\\pi}{2}\\right)\\left(' + c3 + ' + \\frac{1}{n}\\right)', lims: [q(0), q(c3), q(-c3)], why: 'The cosine cycles through $0, -1, 0, 1$, and $' + c3 + ' + \\frac{1}{n} \\to ' + c3 + '$: odd $n$ give $0$, $n = 4k + 2$ tend to $-' + c3 + '$, and $n = 4k$ tend to $' + c3 + '$.' };
  }
  G('ra.subsequences', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['set', 'sub']), R.pick(['set', 'sub', 'isSub']), R.pick(['set', 'isSub', 'mcdiv']));
    if (shape === 'set') { var S = subLimSeq(R, L);
      return { q: 'Find the set of all subsequential limits of $a_n = ' + S.tex + '$ (every number that some subsequence converges to).', a: setA(S.lims.map(function (x) { return x.toPlain(); })),
        steps: [S.why, 'A subsequence must eventually stay near one of these values, so there are no others.', 'The set is $' + setTex(S.lims.slice().sort(function (a, b) { return a.cmp(b); }).map(function (x) { return T.num(x); })) + '$. Since it has more than one element, $a_n$ diverges.'],
        hint: 'Split $n$ into classes (even and odd, or by remainder) and find the limit along each class.', data: { k: 'set', kind: S.kd, fj: S.fj, lims: S.lims.map(function (x) { return x.toPlain(); }) } };
    }
    if (shape === 'sub') { var S2 = ratSeq(R, 2); while (S2.p === 0) S2 = ratSeq(R, 2);
      var idx = R.pick([['2k', 1], ['2k + 1', -1], ['4k', 1], ['4k + 3', -1], ['k^{2}', 0], ['2^{k}', 1]]), Lv = idx[1] === 0 ? null : (idx[1] > 0 ? S2.Lq : S2.Lq.neg());
      if (!Lv) idx = ['2k + 1', -1], Lv = S2.Lq.neg();
      return { q: 'Let $a_n = (-1)^{n}\\,' + S2.tex + '$. Find the limit of the subsequence $a_{' + idx[0] + '}$ as $k \\to \\infty$.', a: num(Lv.toPlain()),
        steps: ['The index $n = ' + idx[0] + '$ is always ' + (idx[1] > 0 ? 'even' : 'odd') + ', so $(-1)^{n} = ' + (idx[1] > 0 ? '1' : '-1') + '$ along this subsequence.', '$' + S2.tex + ' \\to ' + T.num(S2.Lq) + '$, and a subsequence of a convergent sequence has the same limit.', 'So $a_{' + idx[0] + '} \\to ' + T.num(Lv) + '$.'], hint: 'Is the index even or odd?', data: { k: 'sub', f: S2.plain, idx: idx[0], v: Lv.toPlain() } };
    }
    if (shape === 'isSub') { var it = R.pick([['n_k = k^{2}', true, '$1, 4, 9, 16, \\ldots$ strictly increase.'], ['n_k = 3k + 1', true, '$4, 7, 10, \\ldots$ strictly increase.'], ['n_k = 2^{k}', true, '$2, 4, 8, \\ldots$ strictly increase.'], ['n_k = k + 2 + (-1)^{k}', false, 'The indices are $2, 5, 4, 7, 6, \\ldots$: $5$ then $4$ goes backward.'], ['n_k = \\left\\lceil \\frac{k}{2} \\right\\rceil', false, 'The indices are $1, 1, 2, 2, 3, \\ldots$: repeats are not allowed.'], ['n_k = 10 - k', false, 'The indices decrease (and run out).']]);
      return { q: 'Is $(a_{n_k})$ with $' + it[0] + '$ ($k \\ge 1$) a subsequence of $(a_n)$? (The indices must be positive integers that strictly increase.)', a: tf(it[1]), steps: [it[2], it[1] ? 'So it is a subsequence: true.' : 'So it is not a subsequence: false.'], hint: 'List the first few indices.', data: { k: 'tf' } };
    }
    return { q: 'Which argument proves that $a_n = (-1)^{n} + \\frac{1}{n}$ diverges?', a: mc('$a_{2k} \\to 1$ and $a_{2k+1} \\to -1$: two subsequences with different limits.', ['$a_{2k} \\to 1$, and $1$ is not the limit of $\\frac{1}{n}$.', '$a_n$ is bounded, so it diverges.', '$|a_{n+1} - a_n|$ does not go to $0$, so some subsequence diverges.']),
      steps: ['If $a_n \\to L$, every subsequence tends to $L$.', 'Here the even terms tend to $1$ and the odd terms to $-1$, so no single $L$ works: the sequence diverges.'], hint: 'What would a limit have to do along every subsequence?', data: { k: 'mc' } };
  });

  // Bolzano–Weierstrass bisection: values v_j (not dyadic) approached from above
  G('ra.bolzano-weierstrass', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bisect', 'state']), R.pick(['bisect', 'bisect', 'limit']), R.pick(['bisect', 'limit', 'tf']));
    if (shape === 'state') return { q: 'What does the Bolzano–Weierstrass theorem guarantee?', a: mc('Every bounded sequence has a convergent subsequence.', ['Every bounded sequence converges.', 'Every sequence has a convergent subsequence.', 'Every convergent sequence is bounded.']),
      steps: ['It needs boundedness ($1, 2, 3, \\ldots$ has no convergent subsequence) and gives only a subsequence ($(-1)^{n}$ is bounded and diverges).', 'The last choice is true but is a different theorem.'], hint: 'Think of $(-1)^{n}$ and $n$.', data: { k: 'mc' } };
    if (shape === 'tf') { var st = R.pick([['An unbounded sequence can still have a convergent subsequence.', true, 'True: $a_n = n$ for even $n$ and $a_n = 0$ for odd $n$ is unbounded, and its odd terms converge to $0$.'], ['If every subsequence of $a_n$ is bounded, then $a_n$ converges.', false, 'False: $(-1)^{n}$ is bounded (so are all its subsequences) and diverges.'], ['A bounded sequence can have infinitely many different subsequential limits.', true, 'True: a list of all rationals in $[0, 1]$ has every number in $[0, 1]$ as a subsequential limit.']]);
      return { q: 'True or false: ' + st[0], a: tf(st[1]), steps: [st[2]], hint: 'Try building an example.', data: { k: 'tf' } }; }
    var pool = ['1/3', '2/3', '1/5', '2/5', '3/5', '4/5', '1/6', '5/6', '1/7', '3/7', '5/7', '2/9', '7/9'], k = L === 1 ? 2 : R.int(2, 3), vs = R.sample(pool, k).map(q), steps = L === 1 ? 2 : L === 2 ? 3 : 4;
    var names = k === 2 ? ['odd', 'even'] : ['$n \\equiv 1 \\pmod{3}$', '$n \\equiv 2 \\pmod{3}$', '$n \\equiv 0 \\pmod{3}$'];
    var lines = vs.map(function (v, j) { return '$' + T.num(v) + ' + \\frac{1}{10n}$ when ' + (k === 2 ? '$n$ is ' : '') + names[j]; });
    var lo = q(0), hi = q(1), log = [];
    for (var s = 0; s < steps; s++) { var mid = lo.add(hi).div(2), left = vs.some(function (v) { return v.gt(lo) && v.lt(mid); }); log.push('$[' + T.num(lo) + ', ' + T.num(mid) + ']$ ' + (left ? 'holds infinitely many terms (they pile up at $' + T.num(vs.filter(function (v) { return v.gt(lo) && v.lt(mid); }).sort(function (a, b) { return a.cmp(b); })[0]) + '$), so keep it.' : 'holds only finitely many terms, so keep $[' + T.num(mid) + ', ' + T.num(hi) + ']$.')); if (left) hi = mid; else lo = mid; }
    var target = vs.slice().sort(function (a, b) { return a.cmp(b); })[0];
    var seqDesc = 'Let $a_n$ be ' + lines.join(', and ') + '. The terms lie in $[0, 1]$. ';
    if (shape === 'limit') return { q: seqDesc + 'Bisect $[0, 1]$ again and again, each time keeping the left half if it holds infinitely many terms, and the right half otherwise. The nested intervals close in on one number, the limit of the subsequence the proof builds. What is it?', a: num(target.toPlain()),
      steps: ['The terms pile up only at ' + vs.map(function (v) { return '$' + T.num(v) + '$'; }).join(' and ') + ' (each class tends to its own value, from above).', 'Always preferring the left half keeps the smallest pile-up point inside every interval.', 'So the intervals shrink to $' + T.num(target) + '$, the smallest subsequential limit (the lim inf).'], hint: 'Where do the terms pile up, and which pile does "left first" follow?', data: { k: 'bwlim', vs: vs.map(function (v) { return v.toPlain(); }), target: target.toPlain() } };
    return { q: seqDesc + 'Start with $I_0 = [0, 1]$. At each step, cut the interval in half and keep the left half if it holds infinitely many terms, the right half otherwise. What is $I_{' + steps + '}$?', a: { t: 'interval', v: '[' + lo.toPlain() + ', ' + hi.toPlain() + ']' },
      steps: ['The terms pile up at ' + vs.map(function (v) { return '$' + T.num(v) + '$'; }).join(' and ') + '; a closed half holds infinitely many terms exactly when one of these values is inside it.'].concat(log.map(function (x, i) { return 'Step ' + (i + 1) + ': ' + x; })).concat(['So $I_{' + steps + '} = [' + T.num(lo) + ', ' + T.num(hi) + ']$.']),
      hint: 'A half holds infinitely many terms when it contains a value the terms pile up at.', viz: L === 1 ? { name: 'ra-epsband', opts: { f: '(' + vs[0].add(vs[1]).div(2).toPlain() + ')+(' + vs[1].sub(vs[0]).div(2).toPlain() + ')*(-1)^n+1/(10n)', mode: 'plain', nmax: 30, ymin: 0, ymax: 1, quiet: true, edit: false } } : undefined,
      data: { k: 'bisect', vs: vs.map(function (v) { return v.toPlain(); }), steps: steps, lo: lo.toPlain(), hi: hi.toPlain() } };
  });

  G('ra.limsup-liminf', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['both', 'both']), R.pick(['both', 'supvs', 'tail']), R.pick(['tail', 'supvs', 'conv']));
    var kd = shape === 'tail' ? 'alt' : R.pick(L === 1 ? ['alt', 'mod'] : ['alt', 'mod', 'half', 'cos']), S = {};
    if (kd === 'alt') { var c = R.int(-5, 5), p = R.int(1, 6), qq = R.int(1, 9); S = { fj: c + '+(n%2?-1:1)*(' + p + '+' + qq + '/n)', tex: (c ? c + ' + ' : '') + '(-1)^{n}\\left(' + p + ' + \\frac{' + qq + '}{n}\\right)', ls: q(c + p), li: q(c - p), sup: q(c + p).add(Q(qq, 2)), inf: q(c - p - qq), why: 'Even $n$: $a_n = ' + T.num(c + p) + ' + \\frac{' + qq + '}{n}$, decreasing to $' + (c + p) + '$. Odd $n$: $a_n = ' + T.num(c - p) + ' - \\frac{' + qq + '}{n}$, increasing to $' + (c - p) + '$.', c: c, p: p, qq: qq }; }
    else if (kd === 'mod') { var k = R.int(2, 7), d = R.int(1, 6); S = { fj: '(n%' + k + ')+' + d + '/n', tex: '(n \\bmod ' + k + ') + \\frac{' + d + '}{n}', ls: q(k - 1), li: q(0), sup: null, inf: q(0), why: 'The remainder cycles through $0, 1, \\ldots, ' + (k - 1) + '$, and $\\frac{' + d + '}{n} \\to 0$: the subsequential limits are $0, 1, \\ldots, ' + (k - 1) + '$.' };
      var best = q(-1); for (var n = 1; n <= 40; n++) { var v = q(n % k).add(Q(d, n)); if (v.gt(best)) best = v; } S.sup = best; }
    else if (kd === 'half') { var c2 = R.int(1, 7); S = { fj: '(1+(n%2?-1:1))*' + c2 + '*n/(n+1)', tex: '\\left(1 + (-1)^{n}\\right)\\frac{' + (c2 === 1 ? '' : c2) + 'n}{n + 1}', ls: q(2 * c2), li: q(0), sup: q(2 * c2), inf: q(0), why: 'Odd $n$ give $0$. Even $n$ give $\\frac{' + (2 * c2) + 'n}{n + 1}$, increasing toward $' + (2 * c2) + '$.' }; }
    else { S = { fj: 'Math.cos(n*Math.PI/2)*(1+1/n)', tex: '\\cos\\left(\\frac{n\\pi}{2}\\right)\\left(1 + \\frac{1}{n}\\right)', ls: q(1), li: q(-1), sup: q('5/4'), inf: q('-3/2'), why: 'The cosine cycles $0, -1, 0, 1$: $n = 4k$ give $1 + \\frac{1}{n} \\to 1$ (largest at $n = 4$: $\\frac{5}{4}$), $n = 4k + 2$ give $-(1 + \\frac{1}{n}) \\to -1$ (smallest at $n = 2$: $-\\frac{3}{2}$), odd $n$ give $0$.' }; }
    var intro = 'Let $a_n = ' + S.tex + '$ for $n \\ge 1$. ';
    if (shape === 'both') return { q: intro + 'Find $' + LIMSUP + ' a_n$ and $' + LIMINF + ' a_n$.', a: multi([part('$\\limsup a_n =$', num(S.ls.toPlain())), part('$\\liminf a_n =$', num(S.li.toPlain()))]),
      steps: [S.why, 'The largest subsequential limit is $\\limsup a_n = ' + T.num(S.ls) + '$; the smallest is $\\liminf a_n = ' + T.num(S.li) + '$.'], hint: 'Find the limit along each kind of $n$; the largest and smallest are the answers.', viz: kd === 'alt' && L === 1 ? { name: 'ra-epsband', opts: { f: (S.c ? S.c + '+' : '') + '(-1)^n*(' + S.p + '+' + S.qq + '/n)', mode: 'tails', nmax: 30, quiet: true, edit: false } } : undefined, data: { k: 'both', kind: kd, ls: S.ls.toPlain(), li: S.li.toPlain(), fj: S.fj } };
    if (shape === 'supvs') return { q: intro + 'Find $\\sup\\{a_n : n \\ge 1\\}$ and $' + LIMSUP + ' a_n$. (They are different numbers here.)', a: multi([part('$\\sup a_n =$', num(S.sup.toPlain())), part('$\\limsup a_n =$', num(S.ls.toPlain()))]),
      steps: [S.why, 'The supremum of all the terms is $' + T.num(S.sup) + '$' + (S.sup.eq(S.ls) ? '' : ', an early term') + '.', 'The lim sup ignores any finite number of terms: it is the limit of the tail suprema, $' + T.num(S.ls) + '$.'], hint: 'The sup looks at every term; the lim sup only at what happens far out.', data: { k: 'supvs', kind: kd, sup: S.sup.toPlain(), ls: S.ls.toPlain(), fj: S.fj } };
    if (shape === 'tail') { var N = R.int(3, 25), ke = N % 2 ? N + 1 : N, ko = N % 2 ? N : N + 1, ts = q(S.c + S.p).add(Q(S.qq, ke)), ti = q(S.c - S.p).sub(Q(S.qq, ko));
      return { q: intro + 'Find the tail supremum $s_{' + N + '} = \\sup\\{a_k : k \\ge ' + N + '\\}$ and the tail infimum $i_{' + N + '} = \\inf\\{a_k : k \\ge ' + N + '\\}$.', a: multi([part('$s_{' + N + '} =$', num(ts.toPlain())), part('$i_{' + N + '} =$', num(ti.toPlain()))]),
        steps: [S.why, 'From $k = ' + N + '$ on, the largest term is the first even one, $k = ' + ke + '$: $s_{' + N + '} = ' + T.num(S.c + S.p) + ' + \\frac{' + S.qq + '}{' + ke + '} = ' + T.num(ts) + '$.', 'The smallest is the first odd one, $k = ' + ko + '$: $i_{' + N + '} = ' + T.num(S.c - S.p) + ' - \\frac{' + S.qq + '}{' + ko + '} = ' + T.num(ti) + '$.', 'As $N \\to \\infty$, $s_N \\to ' + (S.c + S.p) + ' = \\limsup a_n$ and $i_N \\to ' + (S.c - S.p) + ' = \\liminf a_n$.'],
        hint: 'Which terms from $k = N$ on are biggest? Look at the first even and the first odd index.', data: { k: 'tail', c: S.c, p: S.p, qq: S.qq, N: N, s: ts.toPlain(), i: ti.toPlain() } }; }
    var conv = R.coin(), tx2 = conv ? '\\frac{(-1)^{n}}{n}' : S.tex;
    return { q: 'Let $a_n = ' + tx2 + '$. Does $a_n$ converge? (Compare $\\limsup a_n$ and $\\liminf a_n$.)', a: tf(conv),
      steps: [conv ? 'Both the even and the odd terms tend to $0$, so $\\limsup a_n = \\liminf a_n = 0$.' : S.why + ' So $\\limsup a_n = ' + T.num(S.ls) + '$ and $\\liminf a_n = ' + T.num(S.li) + '$.', conv ? 'They are equal, so $a_n$ converges (to $0$): true.' : 'They differ, so $a_n$ diverges: false.'], hint: 'A sequence converges exactly when its lim sup and lim inf are equal (and finite).', data: { k: 'conv' } };
  });

  G('ra.cauchy-sequences', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['findN', 'findN', 'block']), R.pick(['findN', 'block', 'consec']), R.pick(['alt', 'findN', 'consec']));
    if (shape === 'findN' || shape === 'alt') {
      var e = epsPick(R, L), eq = q(e), kd = shape === 'alt' ? 'alt' : R.pick(L === 1 ? ['inv'] : ['inv', 'geo']), c = R.int(1, 5), tx, N0, why, fp;
      if (kd === 'inv') { var k = R.int(-3, 3); tx = (k ? k + ' + ' : '') + '\\frac{' + c + '}{n}'; fp = (k ? k + '+' : '') + c + '/n'; N0 = qceil(q(c).div(eq)); N0 = M.max(1, N0); why = ['For $m, n \\ge N$: $|a_m - a_n| = ' + c + '\\left|\\frac{1}{m} - \\frac{1}{n}\\right| < \\frac{' + c + '}{N}$, and taking $m = N$ with $n$ large gets as close to $\\frac{' + c + '}{N}$ as you like.', 'So every pair is within $\\varepsilon$ exactly when $\\frac{' + c + '}{N} \\le \\varepsilon$, that is, $N \\ge ' + T.num(q(c).div(eq)) + '$.']; }
      else if (kd === 'geo') { tx = '\\frac{' + c + '}{2^{n}}'; N0 = firstN(function (n) { return Q(c, pow2(n)).le(eq); }); why = ['For $m, n \\ge N$: $|a_m - a_n| < \\frac{' + c + '}{2^{N}}$, with values as close to $\\frac{' + c + '}{2^{N}}$ as you like ($m = N$, $n$ large).', 'So we need $\\frac{' + c + '}{2^{N}} \\le \\varepsilon$, that is, $2^{N} \\ge ' + T.num(q(c).div(eq)) + '$.']; }
      else { tx = '\\frac{(-1)^{n}\\,' + c + '}{n}'; N0 = firstN(function (n) { return Q(c * (2 * n + 1), n * (n + 1)).lt(eq); }); why = ['Two terms of opposite sign are farthest apart: the largest $|a_m - a_n|$ with $m, n \\ge N$ is $\\frac{' + c + '}{N} + \\frac{' + c + '}{N + 1}$ (from $m = N$, $n = N + 1$), and it is attained.', 'So we need $\\frac{' + c + '}{N} + \\frac{' + c + '}{N + 1} < \\varepsilon$.']; }
      return { q: 'Let $a_n = ' + tx + '$. For $' + E(e) + '$, find an $N$ such that $|a_m - a_n| < \\varepsilon$ for <b>all</b> $m, n \\ge N$. (Any $N$ that works is right.)', a: multi([part('$N =$', anyN(N0))]),
        steps: why.concat(['The smallest such $N$ is $' + N0 + '$; any larger $N$ works too.']), hint: 'Find the largest gap $|a_m - a_n|$ among the terms from $N$ on.', viz: L === 1 && fp ? { name: 'ra-epsband', opts: { f: fp, mode: 'cauchy', eps: eq.toNumber(), nmax: M.min(60, N0 + 10), quiet: true, edit: false } } : undefined,
        data: { k: 'cauchyN', kind: kd, c: c, e: eq.toPlain(), N0: N0 } };
    }
    if (shape === 'block') { var n = R.int(2, 6), h = Q(0); for (var j = n + 1; j <= 2 * n; j++) h = h.add(Q(1, j));
      return { q: 'Let $H_n = 1 + \\frac{1}{2} + \\cdots + \\frac{1}{n}$. Compute $H_{' + (2 * n) + '} - H_{' + n + '}$. (Every such block is at least $\\frac{1}{2}$, which is why $H_n$ is not Cauchy.)', a: num(h.toPlain()),
        steps: ['$H_{' + (2 * n) + '} - H_{' + n + '} = ' + U.range(n + 1, 2 * n).map(function (j) { return '\\frac{1}{' + j + '}'; }).join(' + ') + ' = ' + T.num(h) + '$.', 'Each of the $' + n + '$ terms is at least $\\frac{1}{' + (2 * n) + '}$, so the block is at least $\\frac{' + n + '}{' + (2 * n) + '} = \\frac{1}{2}$. With $\\varepsilon = \\frac{1}{2}$, no $N$ works, so $H_n$ is not Cauchy and diverges.'],
        hint: 'Add the $' + n + '$ fractions over a common denominator.', data: { k: 'block', n: n, v: h.toPlain() } }; }
    return { q: 'For $a_n = \\sqrt{n}$, the gaps $|a_{n+1} - a_n| = \\frac{1}{\\sqrt{n+1} + \\sqrt{n}}$ go to $0$. Is $a_n$ a Cauchy sequence?', a: mc('No: for instance $|a_{4n} - a_n| = \\sqrt{n}$ grows, so terms far out are not all close to each other.', ['Yes: consecutive terms get arbitrarily close.', 'Yes: every increasing sequence is Cauchy.', 'No: a Cauchy sequence must be decreasing.']),
      steps: ['Cauchy means all pairs $m, n \\ge N$ are close, not only neighbors.', '$a_{4n} - a_n = 2\\sqrt{n} - \\sqrt{n} = \\sqrt{n}$, which is huge for large $n$; so no $N$ works for $\\varepsilon = 1$.', 'Indeed $\\sqrt{n}$ is unbounded, and Cauchy sequences are bounded.'], hint: 'Compare terms that are far apart, like $a_n$ and $a_{4n}$.', data: { k: 'mc' } };
  });

// ---- 03-series.js
  // ================================================================ Unit 3: Series
  // telescoping a_k = c / (k (k + d)) = (c/d)(1/k - 1/(k + d))
  function teleSeries(R) {
    var c = R.int(1, 9), d = R.int(1, 2), S = q(c).div(d).mul(d === 1 ? 1 : Q(3, 2));
    return { c: c, d: d, tex: '\\frac{' + c + '}{k(k + ' + d + ')}', plain: c + '/(k*(k+' + d + '))', S: S,
      term: function (k) { return Q(c, k * (k + d)); }, tail: function (n) { var t = Q(0); for (var j = 1; j <= d; j++) t = t.add(Q(1, n + j)); return q(c).div(d).mul(t); },
      split: '\\frac{' + c + '}{k(k + ' + d + ')} = ' + (c === d ? '' : (d === 1 ? c : '\\frac{' + c + '}{' + d + '}')) + '\\left(\\frac{1}{k} - \\frac{1}{k + ' + d + '}\\right)' };
  }
  G('ra.series-cauchy', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['partial', 'partial', 'mc']), R.pick(['tailN', 'geoN', 'partial']), R.pick(['tailN', 'cauchyB', 'geoN']));
    if (shape === 'partial') { var S = teleSeries(R), n = R.int(2, 12), sn = Q(0); for (var k = 1; k <= n; k++) sn = sn.add(S.term(k));
      return { q: 'Find the partial sum $s_{' + n + '} = \\sum_{k=1}^{' + n + '} ' + S.tex + '$.', a: num(sn.toPlain()),
        steps: ['Split: $' + S.split + '$.', 'The sum telescopes: everything cancels except $' + (S.d === 1 ? '\\frac{1}{1}' : '\\frac{1}{1} + \\frac{1}{2}') + '$ at the start and $' + (S.d === 1 ? '\\frac{1}{' + (n + 1) + '}' : '\\frac{1}{' + (n + 1) + '} + \\frac{1}{' + (n + 2) + '}') + '$ at the end.', '$s_{' + n + '} = ' + T.num(sn) + '$, and $s_n \\to ' + T.num(S.S) + '$, the sum of the series.'],
        hint: 'Use partial fractions and watch the terms cancel.', data: { k: 'partial', f: S.plain, n: n, v: sn.toPlain() } }; }
    if (shape === 'tailN') { var S2 = teleSeries(R), e = epsPick(R, L), eq = q(e), n0 = firstNfast(function (n) { return S2.tail(n).lt(eq); }, 1);
      return { q: 'The series $\\sum_{k=1}^{\\infty} ' + S2.tex + '$ has sum $S = ' + T.num(S2.S) + '$. For $' + E(e) + '$, find an $N$ such that $|S - s_n| < \\varepsilon$ for every $n \\ge N$. (Any $N$ that works is right.)', a: multi([part('$N =$', anyN(n0))]),
        steps: ['Telescoping gives $S - s_n = ' + (S2.d === 1 ? T.coef(S2.c, '\\frac{1}{n + 1}') : T.coef(T.num(Q(S2.c, 2)), '\\left(\\frac{1}{n + 1} + \\frac{1}{n + 2}\\right)')) + '$, which decreases as $n$ grows.', 'It first drops below $' + epsTex(e) + '$ at $n = ' + n0 + '$' + (n0 > 1 ? ' (at $n = ' + (n0 - 1) + '$ it is $' + T.num(S2.tail(n0 - 1)) + '$)' : '') + '.', 'So $N = ' + n0 + '$ works, and so does any larger $N$.'],
        hint: 'Write the tail $S - s_n$ as a formula in $n$.', data: { k: 'tailN', f: S2.plain, S: S2.S.toPlain(), e: qp(e), n0: n0 } }; }
    if (shape === 'geoN') { var r = q(R.pick(['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/10'])), e2 = epsPick(R, L), eq2 = q(e2), Sg = r.div(q(1).sub(r)), n2 = firstNfast(function (n) { return r.pow(n + 1).div(q(1).sub(r)).lt(eq2); }, 1);
      return { q: 'The geometric series $\\sum_{k=1}^{\\infty} \\left(' + T.num(r) + '\\right)^{k}$ has sum $S = ' + T.num(Sg) + '$. For $' + E(e2) + '$, find an $N$ such that $|S - s_n| < \\varepsilon$ for every $n \\ge N$. (Any $N$ that works is right.)', a: multi([part('$N =$', anyN(n2))]),
        steps: ['The tail after $n$ terms is $S - s_n = \\sum_{k=n+1}^{\\infty} r^{k} = \\frac{r^{n+1}}{1 - r}$ with $r = ' + T.num(r) + '$.', 'It first drops below $' + epsTex(e2) + '$ at $n = ' + n2 + '$' + (n2 > 1 ? ' (at $n = ' + (n2 - 1) + '$ it is about $' + T.num(Number(r.pow(n2).div(q(1).sub(r)).toNumber().toPrecision(3))) + '$)' : '') + '.', 'So $N = ' + n2 + '$ works, and so does any larger $N$.'],
        hint: 'The tail of a geometric series is a geometric series too.', data: { k: 'geoN', r: r.toPlain(), e: qp(e2), n0: n2 } }; }
    if (shape === 'cauchyB') { var e3 = epsPick(R, 2), eq3 = q(e3), N3 = qceil(q(1).div(eq3));
      return { q: 'For $\\sum \\frac{1}{k^{2}}$, comparing with $\\frac{1}{k(k - 1)} = \\frac{1}{k - 1} - \\frac{1}{k}$ shows $s_n - s_m < \\frac{1}{m}$ whenever $n > m \\ge 1$. Using this bound, find an $N$ such that $|s_n - s_m| < \\varepsilon$ whenever $n > m \\ge N$, for $' + E(e3) + '$. (Any $N$ the bound justifies is right.)', a: multi([part('$N =$', anyN(N3))]),
        steps: ['For $n > m \\ge N$: $s_n - s_m < \\frac{1}{m} \\le \\frac{1}{N}$.', 'So it is enough that $\\frac{1}{N} \\le ' + epsTex(e3) + '$, that is, $N \\ge ' + T.num(q(1).div(eq3)) + '$.', 'The smallest such $N$ is $' + N3 + '$. The partial sums are Cauchy, so the series converges: this is the Cauchy criterion.'],
        hint: 'Make $\\frac{1}{N}$ at most $\\varepsilon$.', data: { k: 'cauchyB', e: qp(e3), N0: N3 } }; }
    return { q: 'The terms of $\\sum a_k$ satisfy $a_k \\to 0$. What can you conclude?', a: mc('Nothing yet: $\\sum \\frac{1}{k}$ has $\\frac{1}{k} \\to 0$ and diverges, while $\\sum \\frac{1}{k^{2}}$ converges.', ['The series converges.', 'The series diverges.', 'The series converges to $0$.']),
      steps: ['$a_k \\to 0$ is necessary for convergence (take $n = m + 1$ in the Cauchy criterion) but not sufficient.', 'The harmonic series diverges even though its terms go to $0$: its blocks $\\frac{1}{n + 1} + \\cdots + \\frac{1}{2n}$ are all at least $\\frac{1}{2}$.'], hint: 'Think of the harmonic series.', data: { k: 'mc' } };
  });

  var CLASSIFY = [
    ['\\sum_{k=1}^{\\infty} \\frac{(-1)^{k}}{k}', 'cond', 'The alternating series test gives convergence, but $\\sum \\frac{1}{k}$ diverges.'],
    ['\\sum_{k=1}^{\\infty} \\frac{(-1)^{k}}{k^{2}}', 'abs', '$\\sum \\frac{1}{k^{2}}$ converges, so the series converges absolutely.'],
    ['\\sum_{k=1}^{\\infty} \\frac{(-1)^{k} k}{k + 1}', 'div', 'The terms do not go to $0$ (their size tends to $1$).'],
    ['\\sum_{k=1}^{\\infty} \\frac{\\sin k}{k^{2}}', 'abs', '$\\left|\\frac{\\sin k}{k^{2}}\\right| \\le \\frac{1}{k^{2}}$, and $\\sum \\frac{1}{k^{2}}$ converges.'],
    ['\\sum_{k=1}^{\\infty} \\frac{(-1)^{k}}{\\sqrt{k}}', 'cond', 'Alternating with decreasing terms, so it converges; $\\sum \\frac{1}{\\sqrt{k}}$ diverges ($p = \\frac{1}{2}$).'],
    ['\\sum_{k=1}^{\\infty} \\frac{\\cos(k\\pi)}{k}', 'cond', '$\\cos(k\\pi) = (-1)^{k}$, so this is the alternating harmonic series.'],
    ['\\sum_{k=1}^{\\infty} \\frac{(-1)^{k}}{2^{k}}', 'abs', '$\\sum \\frac{1}{2^{k}}$ is a convergent geometric series.'],
    ['\\sum_{k=2}^{\\infty} \\frac{(-1)^{k}}{\\ln k}', 'cond', 'Alternating with $\\frac{1}{\\ln k}$ decreasing to $0$; but $\\frac{1}{\\ln k} > \\frac{1}{k}$, so the absolute series diverges.'],
    ['\\sum_{k=1}^{\\infty} (-1)^{k}\\left(1 + \\frac{1}{k}\\right)', 'div', 'The terms do not go to $0$.']];
  G('ra.absolute-convergence', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['classify', 'classify', 'step']), R.pick(['classify', 'const', 'direction']), R.pick(['const', 'direction', 'step']));
    var ANS = { abs: 'converges absolutely', cond: 'converges conditionally', div: 'diverges' };
    if (shape === 'classify') { var it = R.pick(CLASSIFY);
      return { q: 'Does $' + it[0] + '$ converge absolutely, converge conditionally, or diverge?', a: mc(ANS[it[1]], Object.keys(ANS).filter(function (x) { return x !== it[1]; }).map(function (x) { return ANS[x]; })),
        steps: [it[2], 'So the series ' + ANS[it[1]] + '.'], hint: 'First test $\\sum |a_k|$; if that diverges, look at the signs.', data: { k: 'mc' } }; }
    if (shape === 'const') {
      var c = R.int(1, 4), d = R.int(1, 12), best = Q(0), bk = 1;
      for (var k = 1; k <= 400; k++) { var g = Q(k * k * (k + c), k * k * k + d); if (g.gt(best)) { best = g; bk = k; } }
      return { q: 'To compare $\\sum \\frac{k + ' + c + '}{k^{3} + ' + d + '}$ with $\\sum \\frac{1}{k^{2}}$, find the smallest constant $C$ such that $\\frac{k + ' + c + '}{k^{3} + ' + d + '} \\le \\frac{C}{k^{2}}$ for every $k \\ge 1$.', a: num(best.toPlain()),
        steps: ['We need $C \\ge \\frac{k^{2}(k + ' + c + ')}{k^{3} + ' + d + '} = 1 + \\frac{' + T.coef(c, 'k^{2}') + ' - ' + d + '}{k^{3} + ' + d + '}$ for every $k$.', 'This is largest at $k = ' + bk + '$, where it equals $' + T.num(best) + '$; for larger $k$ the fraction shrinks toward $0$.', 'So $C = ' + T.num(best) + '$, and since $\\sum \\frac{C}{k^{2}}$ converges, so does the series.'],
        hint: 'Compute $k^{2} a_k$ for the first several $k$; where is it largest?', data: { k: 'const', c: c, d: d, C: best.toPlain() } };
    }
    if (shape === 'direction') { var it2 = R.pick([['$0 \\le a_k \\le \\frac{1}{k}$ for every $k$', 'Nothing: being smaller than a divergent series proves nothing.', ['$\\sum a_k$ diverges.', '$\\sum a_k$ converges.', '$a_k \\to 1$.']], ['$a_k \\ge \\frac{1}{k^{2}} > 0$ for every $k$', 'Nothing: being bigger than a convergent series proves nothing.', ['$\\sum a_k$ converges.', '$\\sum a_k$ diverges.', '$a_k$ is decreasing.']], ['$|a_k| \\le \\frac{1}{k^{2}}$ for every $k$', '$\\sum a_k$ converges (absolutely).', ['Nothing, since $a_k$ may be negative.', '$\\sum a_k$ converges only if $a_k \\ge 0$.', '$\\sum a_k$ diverges.']], ['$a_k \\ge \\frac{1}{k} > 0$ for every $k$', '$\\sum a_k$ diverges.', ['$\\sum a_k$ converges.', 'Nothing can be concluded.', '$a_k \\to 0$.']]]);
      return { q: 'Suppose ' + it2[0] + '. What can you conclude?', a: mc(it2[1], it2[2]), steps: ['The comparison test works in two directions only: below a convergent series gives convergence; above a divergent series (with positive terms) gives divergence.', it2[1]], hint: 'Is the comparison series convergent or divergent, and which side of it is $a_k$ on?', data: { k: 'mc' } }; }
    return { q: 'Proof that absolute convergence implies convergence: “Let $\\varepsilon > 0$. Since $\\sum |a_k|$ converges, by the Cauchy criterion there is an $N$ with $|a_{m+1}| + \\cdots + |a_n| < \\varepsilon$ for $n > m \\ge N$.” What is the next step?', a: mc('By the triangle inequality, $|a_{m+1} + \\cdots + a_n| \\le |a_{m+1}| + \\cdots + |a_n| < \\varepsilon$, so $\\sum a_k$ satisfies the Cauchy criterion.', ['So $|a_k| < \\varepsilon$ for every $k \\ge N$, and the series converges.', 'So $a_k \\to 0$, and the series converges.', 'So $\\sum a_k = \\sum |a_k|$.']),
      steps: ['The triangle inequality bounds any block of $\\sum a_k$ by the same block of $\\sum |a_k|$.', 'So the partial sums of $\\sum a_k$ are Cauchy, hence converge (completeness).', '$a_k \\to 0$ alone would not be enough.'], hint: 'Which inequality compares $|a + b|$ with $|a| + |b|$?', data: { k: 'mc' } };
  });

  var PS = [['2', '1/2', '\\frac{1}{2}'], ['3', '1/4', '\\frac{1}{4}'], ['1/2', 'sqrt(2)', '\\sqrt{2}'], ['3/2', 'sqrt(2)/2', '\\frac{\\sqrt{2}}{2}'], ['5/2', 'sqrt(2)/4', '\\frac{\\sqrt{2}}{4}'], ['1', '1', '1'], ['4', '1/8', '\\frac{1}{8}'], ['5', '1/16', '\\frac{1}{16}'], ['6', '1/32', '\\frac{1}{32}']];
  G('ra.condensation', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['ratio', 'ratio']), R.pick(['ratio', 'logterm', 'sum']), R.pick(['logterm', 'sum', 'hyp']));
    if (shape === 'ratio') { var p = R.pick(PS), ptex = T.num(q(p[0])), conv = q(p[0]).gt(1), cc = R.int(1, 20), cn = String(cc);
      return { q: 'Apply the condensation test to $\\sum \\frac{' + cn + '}{n^{' + ptex + '}}$: the condensed series $\\sum 2^{k} a_{2^{k}}$ is geometric. Find its ratio, and decide whether $\\sum \\frac{' + cn + '}{n^{' + ptex + '}}$ converges.', a: multi([part('ratio $=$', num(p[1])), part('It converges:', tf(conv))]),
        steps: ['$2^{k} a_{2^{k}} = \\frac{' + (cc === 1 ? '' : cc + ' \\cdot ') + '2^{k}}{(2^{k})^{' + ptex + '}} = ' + (cc === 1 ? '' : cc) + '\\left(2^{1 - ' + ptex + '}\\right)^{k}$.', 'The ratio is $2^{1 - ' + ptex + '} = ' + p[2] + '$.', conv ? 'It is less than $1$, so the condensed series converges, and so does $\\sum \\frac{' + cn + '}{n^{' + ptex + '}}$.' : 'It is at least $1$, so the condensed series diverges, and so does $\\sum \\frac{' + cn + '}{n^{' + ptex + '}}$.'],
        hint: 'Substitute $n = 2^{k}$ and simplify the powers of $2$.', data: { k: 'ratio', p: p[0], r: p[1], c: cc } }; }
    if (shape === 'logterm') { var pp = R.int(1, 8), conv2 = pp > 1, cl = R.int(1, 9);
      return { q: 'Apply the condensation test to $\\sum_{n=2}^{\\infty} \\frac{' + cl + '}{n(\\ln n)' + (pp === 1 ? '' : '^{' + pp + '}') + '}$. Write the condensed term $2^{k} a_{2^{k}}$ as a formula in $k$ (for $k \\ge 1$).', a: expr(cl + '/((ln(2))^' + pp + '*k^' + pp + ')', ['k']),
        steps: ['$a_{2^{k}} = \\frac{' + cl + '}{2^{k} (\\ln 2^{k})' + (pp === 1 ? '' : '^{' + pp + '}') + '} = \\frac{' + cl + '}{2^{k} ' + (pp === 1 ? 'k \\ln 2' : '(k \\ln 2)^{' + pp + '}') + '}$.', 'Multiply by $2^{k}$: $2^{k} a_{2^{k}} = \\frac{' + cl + '}{' + (pp === 1 ? '(\\ln 2) k' : '(\\ln 2)^{' + pp + '} k^{' + pp + '}') + '}$.', 'This is a constant times a $p$-series with $p = ' + pp + '$, so the original series ' + (conv2 ? 'converges.' : 'diverges.')],
        hint: 'Use $\\ln(2^{k}) = k \\ln 2$.', data: { k: 'logterm', p: pp, c: cl } }; }
    if (shape === 'sum') { var p3 = R.pick([2, 3, 4, 5, 6]), c3 = R.int(1, 12), r3 = Q(1, M.pow(2, p3 - 1)), sum = q(c3).div(q(1).sub(r3));
      return { q: 'For a decreasing positive sequence, $\\sum_{n=1}^{\\infty} a_n \\le \\sum_{k=0}^{\\infty} 2^{k} a_{2^{k}}$ (each block $a_{2^{k}} + \\cdots + a_{2^{k+1} - 1}$ is at most $2^{k} a_{2^{k}}$). For $a_n = \\frac{' + c3 + '}{n^{' + p3 + '}}$, compute $\\sum_{k=0}^{\\infty} 2^{k} a_{2^{k}}$, an upper bound for $\\sum \\frac{' + c3 + '}{n^{' + p3 + '}}$.', a: num(sum.toPlain()),
        steps: ['$2^{k} a_{2^{k}} = ' + (c3 === 1 ? '' : c3 + ' \\cdot ') + '2^{k} \\cdot 2^{-' + p3 + 'k} = ' + (c3 === 1 ? '' : c3) + '\\left(' + T.num(r3) + '\\right)^{k}$.', 'Geometric from $k = 0$: $\\frac{' + c3 + '}{1 - ' + T.num(r3) + '} = ' + T.num(sum) + '$.', 'So $\\sum \\frac{' + c3 + '}{n^{' + p3 + '}} \\le ' + T.num(sum) + '$.' + (p3 === 2 && c3 === 1 ? ' (The true sum is $\\frac{\\pi^{2}}{6} \\approx 1.645$.)' : '')],
        hint: 'The condensed series is geometric; sum it from $k = 0$.', data: { k: 'sum', p: p3, c: c3, v: sum.toPlain() } }; }
    return { q: 'Why does the condensation test require $a_n$ to be decreasing (and positive)?', a: mc('The proof bounds each block $a_{2^{k}} + \\cdots + a_{2^{k+1} - 1}$ by its first term times the number of terms, which needs the terms to shrink.', ['Because only decreasing sequences converge.', 'Because $2^{k}$ is increasing.', 'It does not; the test works for every sequence.']),
      steps: ['Grouping the terms in blocks of length $2^{k}$, a decreasing sequence gives $2^{k} a_{2^{k+1}} \\le$ block $\\le 2^{k} a_{2^{k}}$.', 'Without that, the samples $a_{2^{k}}$ can miss the big terms: a sequence that is $0$ at powers of $2$ and $\\frac{1}{n}$ elsewhere has condensed series $0$ but diverges.'], hint: 'Look at how the proof compares a block with $a_{2^{k}}$.', data: { k: 'mc' } };
  });

  var BASES = [['1/2', '\\frac{1}{2}'], ['1/3', '\\frac{1}{3}'], ['2/3', '\\frac{2}{3}'], ['1/4', '\\frac{1}{4}'], ['3/4', '\\frac{3}{4}'], ['2/5', '\\frac{2}{5}'], ['3/5', '\\frac{3}{5}'], ['4/5', '\\frac{4}{5}'], ['3/2', '\\frac{3}{2}'], ['2', '2'], ['5/2', '\\frac{5}{2}']];
  G('ra.root-ratio-limsup', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['interleave', 'kpow']), R.pick(['interleave', 'ratios', 'kpow']), R.pick(['ratios', 'interleave', 'one']));
    if (shape === 'interleave') { var pr = R.sample(BASES, 2), c = q(pr[0][0]), d = q(pr[1][0]), mx = qmax(c, d), conv = mx.lt(1);
      return { q: 'Let $a_k = \\left(' + pr[0][1] + '\\right)^{k}$ for even $k$ and $a_k = \\left(' + pr[1][1] + '\\right)^{k}$ for odd $k$. Find $' + '\\limsup_{k \\to \\infty}' + ' |a_k|^{1/k}$, and decide whether $\\sum a_k$ converges.', a: multi([part('$\\limsup |a_k|^{1/k} =$', num(mx.toPlain())), part('It converges:', tf(conv))]),
        steps: ['$|a_k|^{1/k}$ is $' + pr[0][1] + '$ for even $k$ and $' + pr[1][1] + '$ for odd $k$.', 'The lim sup is the larger: $' + T.num(mx) + '$.', conv ? 'It is less than $1$, so the series converges absolutely (root test).' : 'It is greater than $1$, so the terms do not go to $0$ and the series diverges.', 'The ratio test is no help here: the ratios $\\frac{a_{k+1}}{a_k}$ jump between very large and very small values.'],
        hint: 'Take the $k$th root of each kind of term.', data: { k: 'inter', c: c.toPlain(), d: d.toPlain() } }; }
    if (shape === 'ratios') { var b = R.int(2, 12), b3 = Q(1, b * b * b);
      return { q: 'Let $a_k = ' + b + '^{-k + (-1)^{k}}$. Find $\\limsup \\frac{a_{k+1}}{a_k}$, $\\liminf \\frac{a_{k+1}}{a_k}$, and $\\lim |a_k|^{1/k}$.', a: multi([part('$\\limsup$ of ratios $=$', num(b)), part('$\\liminf$ of ratios $=$', num(b3.toPlain())), part('$\\lim |a_k|^{1/k} =$', num(Q(1, b).toPlain()))]),
        steps: ['For even $k$: $a_k = ' + b + '^{-k + 1}$ and $a_{k+1} = ' + b + '^{-k - 2}$, so the ratio is $' + b + '^{-3} = ' + T.num(b3) + '$.', 'For odd $k$: $a_k = ' + b + '^{-k - 1}$ and $a_{k+1} = ' + b + '^{-k}$, so the ratio is $' + b + '$.', 'The ratios alternate, so the ratio test is inconclusive ($\\limsup = ' + b + ' > 1$ but $\\liminf < 1$).', '$|a_k|^{1/k} = ' + b + '^{-1 + (-1)^{k}/k} \\to ' + T.num(Q(1, b)) + ' < 1$: the root test shows convergence.'],
        hint: 'Write out $a_k$ separately for even and odd $k$.', data: { k: 'ratios', b: b } }; }
    if (shape === 'kpow') { var kd = R.pick(['poly', 'poly', 'e']);
      if (kd === 'poly') { var p = R.int(1, 12), rb = R.pick(BASES.slice(0, 8)), rr = q(rb[0]);
        return { q: 'Find $\\lim_{k \\to \\infty} |a_k|^{1/k}$ for $a_k = k^{' + p + '}\\left(' + rb[1] + '\\right)^{k}$. Does $\\sum a_k$ converge?', a: multi([part('limit $=$', num(rr.toPlain())), part('It converges:', tf(true))]),
          steps: ['$|a_k|^{1/k} = \\left(k^{1/k}\\right)^{' + p + '} \\cdot ' + rb[1] + '$.', '$k^{1/k} \\to 1$, so the limit is $' + rb[1] + '$.', 'It is less than $1$, so the series converges (absolutely).'], hint: 'Use $k^{1/k} \\to 1$.', data: { k: 'kpow', p: p, r: rr.toPlain() } }; }
      var mm = R.int(1, 12);
      return { q: 'Find $\\lim_{k \\to \\infty} |a_k|^{1/k}$ for $a_k = \\left(\\frac{k}{k + ' + mm + '}\\right)^{k^{2}}$.', a: num('e^(-' + mm + ')'),
        steps: ['$|a_k|^{1/k} = \\left(\\frac{k}{k + ' + mm + '}\\right)^{k} = \\left(1 + \\frac{' + mm + '}{k}\\right)^{-k}$.', 'Since $\\left(1 + \\frac{' + mm + '}{k}\\right)^{k} \\to e^{' + mm + '}$, the limit is $e^{-' + mm + '}$.', 'It is less than $1$, so $\\sum a_k$ converges.'], hint: 'Use $\\left(1 + \\frac{c}{k}\\right)^{k} \\to e^{c}$.', data: { k: 'kpowe', m: mm } }; }
    return { q: 'For both $\\sum \\frac{1}{k}$ and $\\sum \\frac{1}{k^{2}}$, $\\lim |a_k|^{1/k} = 1$. What does the root test say about a series with $\\limsup |a_k|^{1/k} = 1$?', a: mc('Nothing: such a series may converge or diverge.', ['It diverges.', 'It converges conditionally.', 'It converges absolutely.']),
      steps: ['$\\sum \\frac{1}{k}$ diverges and $\\sum \\frac{1}{k^{2}}$ converges, and both give $1$.', 'So a value of exactly $1$ decides nothing; use another test.'], hint: 'Look at the two examples in the question.', data: { k: 'mc' } };
  });

  var ALT = [['\\frac{1}{k^{2}}', function (k) { return Q(1, k * k); }, 'k^2'], ['\\frac{1}{k^{3}}', function (k) { return Q(1, k * k * k); }, 'k^3'], ['\\frac{1}{2k - 1}', function (k) { return Q(1, 2 * k - 1); }, '2k-1'], ['\\frac{1}{k!}', function (k) { return Q(1, fact(k)); }, 'k!'], ['\\frac{1}{k \\cdot 2^{k}}', function (k) { return Q(1, k * pow2(k)); }, 'k2^k'], ['\\frac{1}{k}', function (k) { return Q(1, k); }, 'k']];
  G('ra.alternating-series', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['nterms', 'side']), R.pick(['nterms', 'interval', 'side']), R.pick(['nterms', 'interval', 'hyp']));
    if (shape === 'nterms') { var it = R.pick(L === 1 ? ALT.slice(0, 3) : ALT.slice(0, 5)), e = epsPick(R, L), eq = q(e), n0 = firstN(function (n) { return it[1](n + 1).lt(eq); }, 1, 1e6);
      return { q: 'For $S = \\sum_{k=1}^{\\infty} (-1)^{k+1} ' + it[0] + '$, the alternating series test bounds the error $|S - s_n|$ by $b_{n+1}$. Find an $n$ for which this bound guarantees $|S - s_n| < ' + epsTex(e) + '$. (Any $n$ that works is right.)', a: multi([part('$n =$', anyN(n0))]),
        steps: ['$b_k = ' + it[0] + '$ decreases to $0$, so $|S - s_n| < b_{n+1}$.', 'We need $b_{n+1} < ' + epsTex(e) + '$. The first time this holds is $n = ' + n0 + '$: $b_{' + (n0 + 1) + '} = ' + T.num(it[1](n0 + 1)) + '$' + (n0 > 1 ? ', while $b_{' + n0 + '} = ' + T.num(it[1](n0)) + '$ is not small enough' : '') + '.', 'So $n = ' + n0 + '$ terms are enough, and so is any larger $n$.'],
        hint: 'The error is less than the first term you leave out.', viz: L === 1 ? { name: 'seriespartial', opts: { a: '(-1)^(n+1)/(' + it[2].replace('k^2', 'n^2').replace('k^3', 'n^3').replace('2k-1', '2n-1') + ')', N: 6, view: 'walk', quiet: true } } : undefined, data: { k: 'nterms', b: it[2], e: qp(e), n0: n0 } }; }
    if (shape === 'side') { var it2 = R.pick(ALT), n = R.int(2, 20), above = n % 2 === 1;
      return { q: 'For $S = \\sum_{k=1}^{\\infty} (-1)^{k+1} ' + it2[0] + '$, is the partial sum $s_{' + n + '}$ above or below $S$?', a: mc(above ? 'above $S$' : 'below $S$', [above ? 'below $S$' : 'above $S$', 'equal to $S$']),
        steps: ['The partial sums zigzag: adding a positive term overshoots, adding a negative term undershoots, and $S$ is always between consecutive partial sums.', 'Term $' + n + '$ has sign $(-1)^{' + (n + 1) + '} = ' + (above ? '+1' : '-1') + '$, so $s_{' + n + '}$ ' + (above ? 'overshoots: it is above $S$.' : 'undershoots: it is below $S$.')],
        hint: 'Was the last term added positive or negative?', data: { k: 'side', n: n } }; }
    if (shape === 'interval') { var it3 = R.pick([ALT[0], ALT[2], ALT[5]]), n3 = R.int(2, 6), s = Q(0); for (var k = 1; k <= n3 + 1; k++) { s = s.add(it3[1](k).mul(k % 2 ? 1 : -1)); if (k === n3) var sn = s; }
      var lo = qmin(sn, s), hi = qmax(sn, s);
      return { q: 'For $S = \\sum_{k=1}^{\\infty} (-1)^{k+1} ' + it3[0] + '$, compute $s_{' + n3 + '}$ and $s_{' + (n3 + 1) + '}$ and give the open interval between them, which must contain $S$.', a: { t: 'interval', v: '(' + lo.toPlain() + ', ' + hi.toPlain() + ')' },
        steps: ['$s_{' + n3 + '} = ' + T.num(sn) + '$ and $s_{' + (n3 + 1) + '} = ' + T.num(s) + '$.', 'Since $b_k$ decreases, $S$ lies strictly between consecutive partial sums.', 'So $S \\in (' + T.num(lo) + ', ' + T.num(hi) + ')$.'],
        hint: 'Add the terms with alternating signs, then order the two sums.', data: { k: 'interval', b: it3[2], n: n3, lo: lo.toPlain(), hi: hi.toPlain() } }; }
    return { q: 'Let $b_k = \\frac{1}{k}$ for odd $k$ and $b_k = \\frac{1}{k^{2}}$ for even $k$. Can the alternating series test be used for $\\sum (-1)^{k+1} b_k$?', a: mc('No: $b_k \\to 0$, but $b_k$ is not decreasing ($b_2 = \\frac{1}{4} < b_3 = \\frac{1}{3}$).', ['Yes: $b_k \\to 0$ and the signs alternate.', 'Yes: $b_k > 0$ for every $k$.', 'No: $b_k$ does not go to $0$.']),
      steps: ['The test needs $b_k$ decreasing and $b_k \\to 0$.', 'Here $b_2 = \\frac{1}{4}$ but $b_3 = \\frac{1}{3}$, so it is not decreasing. (In fact the series diverges: its positive part $\\sum \\frac{1}{k}$ over odd $k$ diverges while the negative part converges.)'],
      hint: 'Check the hypotheses one at a time.', data: { k: 'mc' } };
  });

  // the p-then-q rearrangement of the alternating harmonic series
  function rearr(p, qq, count) { var s = Q(0), od = 1, ev = 2, used = 0, terms = []; while (used < count) { for (var i = 0; i < p && used < count; i++) { s = s.add(Q(1, od)); terms.push(od === 1 ? '1' : '\\frac{1}{' + od + '}'); od += 2; used++; } for (var j = 0; j < qq && used < count; j++) { s = s.sub(Q(1, ev)); terms.push('-\\frac{1}{' + ev + '}'); ev += 2; used++; } } return { s: s, terms: terms }; }
  G('ra.rearrangements', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['partial', 'which', 'pq', 'abs']), R.pick(['pq', 'partial', 'greedy', 'abs']), R.pick(['pq', 'greedy', 'which']));
    if (shape === 'abs') { var rr = q(R.pick(['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/6', '5/6'])), pq3 = R.pick([[2, 1], [1, 2], [3, 1], [1, 3]]), Sabs = q(1).div(q(1).add(rr));
      return { q: 'The geometric series $1 - r + r^{2} - r^{3} + \\cdots$ with $r = ' + T.num(rr) + '$ converges absolutely to $\\frac{1}{1 + r}$. Its terms are rearranged: ' + plural(pq3[0], 'positive term') + ', then ' + plural(pq3[1], 'negative term') + ', repeating (each in its original order). What is the sum of the rearranged series?', a: num(Sabs.toPlain()),
        steps: ['$\\sum |a_k| = \\sum r^{k}$ converges, so the series converges absolutely.', 'Every rearrangement of an absolutely convergent series has the same sum.', 'So the sum is still $\\frac{1}{1 + ' + T.num(rr) + '} = ' + T.num(Sabs) + '$.'],
        hint: 'Is the convergence absolute?', data: { k: 'abs', r: rr.toPlain(), v: Sabs.toPlain() } }; }
    if (shape === 'pq') { var p = R.int(1, 9), qq = R.intNot(1, 9, p);
      var v = p === 2 * qq ? '3/2*ln(2)' : qq === 2 * p ? 'ln(2)/2' : p === 4 * qq ? '2*ln(2)' : qq === 4 * p ? '0' : 'ln(2)+ln(' + p + '/' + qq + ')/2';
      return { q: 'Rearrange $1 - \\frac{1}{2} + \\frac{1}{3} - \\frac{1}{4} + \\cdots = \\ln 2$ by taking ' + plural(p, 'positive term') + ', then ' + plural(qq, 'negative term') + ', and repeating. Using the fact that this rearrangement converges to $\\ln 2 + \\frac{1}{2}\\ln\\frac{p}{q}$ ($p$ positive and $q$ negative terms per round), find its sum.', a: num(v),
        steps: ['Here $p = ' + p + '$ and $q = ' + qq + '$.', 'The sum is $\\ln 2 + \\frac{1}{2}\\ln\\frac{' + p + '}{' + qq + '}' + (v.indexOf('ln(2)+ln(') === 0 ? '' : ' = ' + tex(v)) + '$.', 'The positive terms alone diverge, and so do the negative terms: that is what lets a different order produce a different sum. (Reason: after $n$ rounds the sum is $H_{2pn} - \\frac{1}{2}H_{pn} - \\frac{1}{2}H_{qn}$ with $H_m \\approx \\ln m + \\gamma$.)'],
        hint: 'Substitute $p$ and $q$, then simplify the logarithms.', data: { k: 'pq', p: p, q: qq, v: v } }; }
    if (shape === 'partial') { var pq2 = R.pick([[2, 1], [1, 2], [3, 1], [1, 3]]), p2 = pq2[0], q2 = pq2[1], rounds = L === 1 || p2 + q2 === 4 ? R.int(1, 2) : R.int(2, 3), cnt = rounds * (p2 + q2), rr = rearr(p2, q2, cnt), exact = L === 1 && p2 + q2 === 3;
      return { q: 'Rearrange the alternating harmonic series by taking ' + plural(p2, 'positive term') + ', then ' + plural(q2, 'negative term') + ', and repeating: $' + rearr(p2, q2, 6).terms.join(' + ').replace(/\+ -/g, '- ') + ' + \\cdots$ Find the sum of the first ' + cnt + ' terms' + (exact ? ' (as a fraction).' : ', rounded to 3 decimal places.'), a: exact ? num(rr.s.toPlain()) : num(rr.s.toPlain(), { dp: 3 }),
        steps: ['The first ' + cnt + ' terms are $' + rr.terms.join(' + ').replace(/\+ -/g, '- ') + '$.', 'Their sum is ' + (exact ? '$' + T.num(rr.s) + ' \\approx ' + T.num(U.round(rr.s.toNumber(), 4)) + '$' : '$' + T.num(U.round(rr.s.toNumber(), 3)) + '$ to 3 places') + ', compared with $\\ln 2 \\approx 0.6931$ for the original order.', 'This rearrangement tends to $\\ln 2 + \\frac{1}{2}\\ln\\frac{' + p2 + '}{' + q2 + '} \\approx ' + T.num(U.round(M.log(2) + M.log(p2 / q2) / 2, 4)) + '$.'],
        hint: 'Write the terms in the new order and add them over a common denominator.', data: { k: 'partial', p: p2, q: q2, cnt: cnt, v: rr.s.toPlain() } }; }
    if (shape === 'greedy') { var Tq = q(Q(R.int(21, 60), 20)), s = Q(0), m = 0; while (!s.gt(Tq)) { m++; s = s.add(Q(1, 2 * m - 1)); }
      var neg = 0, s2 = s; while (!s2.lt(Tq)) { neg++; s2 = s2.sub(Q(1, 2 * neg)); }
      var parts = L === 3 ? [part('positive terms:', num(m)), part('then negative terms:', num(neg))] : [part('positive terms:', num(m))];
      return { q: 'Riemann\'s method rearranges $1 - \\frac{1}{2} + \\frac{1}{3} - \\cdots$ to add up to $' + T.num(Tq) + '$: take positive terms $1, \\frac{1}{3}, \\frac{1}{5}, \\ldots$ until the sum first exceeds $' + T.num(Tq) + '$, then negative terms $-\\frac{1}{2}, -\\frac{1}{4}, \\ldots$ until it first drops below, and so on. How many positive terms are used at the start' + (L === 3 ? ', and how many negative terms after them' : '') + '?', a: multi(parts),
        steps: ['Running sums of $1, \\frac{1}{3}, \\frac{1}{5}, \\ldots$: the sum first exceeds $' + T.num(Tq) + '$ after ' + plural(m, 'term') + ' (it reaches $' + T.num(s) + ' \\approx ' + T.num(U.round(s.toNumber(), 4)) + '$).', 'Then $-\\frac{1}{2}, -\\frac{1}{4}, \\ldots$: ' + plural(neg, 'negative term') + (neg === 1 ? ' brings' : ' bring') + ' it below $' + T.num(Tq) + '$ (to about $' + T.num(U.round(s2.toNumber(), 4)) + '$).', 'Each swing overshoots by at most the last term used, and those go to $0$, so the rearranged sums converge to $' + T.num(Tq) + '$.'],
        hint: 'Keep a running sum of the odd reciprocals.', data: { k: 'greedy', T: Tq.toPlain(), m: m, neg: neg } }; }
    var it = R.pick([['$\\sum \\frac{(-1)^{k+1}}{k}$', true], ['$\\sum \\frac{(-1)^{k+1}}{k^{2}}$', false], ['$\\sum \\frac{1}{2^{k}}$', false], ['$\\sum \\frac{(-1)^{k+1}}{\\sqrt{k}}$', true], ['$\\sum \\frac{(-1)^{k+1}}{k!}$', false], ['$\\sum \\frac{(-1)^{k+1}}{\\ln(k + 1)}$', true], ['$\\sum \\frac{(-1)^{k+1}}{k^{3/2}}$', false], ['$\\sum \\frac{(-1)^{k+1} k}{k^{2} + 1}$', true], ['$\\sum \\frac{\\cos(k\\pi)}{2k + 1}$', true], ['$\\sum \\frac{\\sin k}{k^{2}}$', false]]);
    return { q: 'Can the terms of ' + it[0] + ' be rearranged so that the new series adds up to $10$?', a: tf(it[1]),
      steps: [it[1] ? 'The series converges conditionally: its positive terms and its negative terms each diverge.' : 'The series converges absolutely.', it[1] ? 'By Riemann\'s rearrangement theorem it can be rearranged to add up to any number, $10$ included: true.' : 'Every rearrangement of an absolutely convergent series has the same sum, so it cannot be made to add up to $10$: false.'],
      hint: 'Is the convergence absolute or conditional?', data: { k: 'tf' } };
  });

// ---- 04-continuity.js
  // ================================================================ Unit 4: Limits of Functions and Continuity
  // the largest δ for f near a with target value, exact: { tex, plain, val, why: [steps], f: plain f, a, L }
  function deltaStar(kind, a, e) {
    var eq = q(e), et = epsTex(e);
    if (kind === 'quad') { // f = x^2 at a: sqrt(a^2 + e) - |a|
      var A = q(a * a).add(eq), s = surd(A), d = surdPlus(s, -M.abs(a));
      return { d: d, why: ['Write $x = ' + a + ' + t$. Then $x^{2} - ' + (a * a) + ' = ' + (2 * a) + 't + t^{2}$, and the worst case is $t$ moving away from $0$ on the side ' + (a > 0 ? 'above' : 'below') + ' $' + a + '$, where both terms have the same sign: size $' + (2 * M.abs(a)) + '|t| + t^{2}$.', 'We need $' + (2 * M.abs(a)) + '\\delta + \\delta^{2} \\le ' + et + '$, that is, $(\\delta + ' + M.abs(a) + ')^{2} \\le ' + T.num(A) + '$.', 'So the largest $\\delta$ is $\\sqrt{' + T.num(A) + '} - ' + M.abs(a) + ' = ' + d.tex + ' \\approx ' + T.num(U.round(d.val, 6)) + '$.'] };
    }
    if (kind === 'sqrt') { // f = sqrt x at a = s^2: 2 e s - e^2
      var sr = M.round(M.sqrt(a)), dq = eq.mul(2 * sr).sub(eq.mul(eq));
      return { d: { tex: T.num(dq), plain: dq.toPlain(), val: dq.toNumber() }, why: ['$|\\sqrt{x} - ' + sr + '| < ' + et + '$ means $' + T.num(q(sr).sub(eq)) + ' < \\sqrt{x} < ' + T.num(q(sr).add(eq)) + '$, that is, $' + T.num(q(sr).sub(eq).pow(2)) + ' < x < ' + T.num(q(sr).add(eq).pow(2)) + '$.', 'The distances from $' + a + '$ to the two ends are $' + T.num(q(a).sub(q(sr).sub(eq).pow(2))) + '$ (left) and $' + T.num(q(sr).add(eq).pow(2).sub(a)) + '$ (right).', 'The interval $(' + a + ' - \\delta, ' + a + ' + \\delta)$ must fit inside, so the largest $\\delta$ is the smaller distance, $' + T.num(dq) + '$.'] };
    }
    var aq = q(a), dr = aq.mul(aq).mul(eq).div(q(1).add(aq.mul(eq))); // f = 1/x at a > 0
    return { d: { tex: T.num(dr), plain: dr.toPlain(), val: dr.toNumber() }, why: ['$\\left|\\frac{1}{x} - ' + T.num(aq.inv()) + '\\right| < ' + et + '$ means $' + T.num(aq.inv().sub(eq)) + ' < \\frac{1}{x} < ' + T.num(aq.inv().add(eq)) + '$.', 'On the left of $' + T.num(aq) + '$ the condition is $x > \\frac{1}{' + T.num(aq.inv().add(eq)) + '} = ' + T.num(q(1).div(aq.inv().add(eq))) + '$, a distance $' + T.num(dr) + '$ from $' + T.num(aq) + '$; on the right the allowed distance is larger (the graph is flatter there).', 'So the largest $\\delta$ is $' + T.num(dr) + '$.'] };
  }
  function mL(v) { v = q(v); if (v.isZero()) return ''; return v.sign() < 0 ? ' + ' + T.num(v.neg()) : ' - ' + T.num(v); } // " - L" with tidy signs
  function kx(k, inner) { return k === 1 ? inner : k === -1 ? '-(' + inner + ')' : k + '(' + inner + ')'; }
  function xm(a) { a = q(a); return a.isZero() ? 'x' : a.sign() < 0 ? 'x + ' + T.num(a.neg()) : 'x - ' + T.num(a); } // "x - a" with tidy signs
  G('ra.function-limits', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['lin', 'canc']), R.pick(['sqrt', 'recip', 'canc']), R.pick(['quad', 'recip', 'which']));
    var e = epsPick(R, L === 1 ? 1 : 2), et = epsTex(e), eq = q(e);
    if (shape === 'lin' || shape === 'canc') {
      var m, a, Lv, fx, fplain, dd, step0;
      if (shape === 'lin') { m = q(R.pick([2, 3, 4, 5, -2, -3, -4, '1/2', '3/2'])); a = R.int(-4, 5); var b = R.int(-6, 6); fx = T.coef(T.num(m), 'x') + T.signed(b); Lv = m.mul(a).add(b); fplain = m.toPlain() + '*x+(' + b + ')';
        step0 = '$f(x)' + mL(Lv) + ' = ' + T.coef(T.num(m), '(' + xm(a) + ')') + '$.'; }
      else { var k = R.pick([1, 2, 3, -1, -2]); a = R.nz(-4, 4); m = q(k); fx = '\\frac{' + T.coef(k, 'x^{2}') + T.signed(-k * a * a) + '}{' + xm(a) + '}'; Lv = q(2 * k * a); fplain = '(' + k + '*x^2-' + (k * a * a) + ')/(x-(' + a + '))';
        step0 = 'For $x \\ne ' + a + '$, factor and cancel: $f(x) = ' + kx(k, xm(-a)) + '$, so $f(x)' + mL(Lv) + ' = ' + kx(k, xm(a)) + '$.'; }
      dd = eq.div(m.abs());
      return { q: 'Let $f(x) = ' + fx + '$, so $\\lim_{x \\to ' + a + '} f(x) = ' + T.num(Lv) + '$. For $\\varepsilon = ' + et + '$, find a $\\delta > 0$ such that $|f(x)' + mL(Lv) + '| < \\varepsilon$ whenever $0 < |' + xm(a) + '| < \\delta$. (Any $\\delta$ that works is right.)', a: upTo(dd.toPlain()),
        steps: [step0, 'So $|f(x)' + mL(Lv) + '| = ' + (m.abs().eq(1) ? '' : T.num(m.abs())) + '|' + xm(a) + '|$, which is less than $' + et + '$ exactly when $|' + xm(a) + '| < ' + T.num(dd) + '$.', 'So $\\delta = ' + T.num(dd) + '$ works, and so does every smaller positive $\\delta$; a larger one lets in points where the distance is too big.'],
        hint: 'Write $|f(x) - L|$ as a constant times $|x - a|$.', viz: L === 1 ? { name: 'ra-epsdelta', opts: { f: fplain, a: a, L: Lv.toPlain(), eps: eq.toNumber(), quiet: true, edit: false } } : undefined, data: { k: 'lin', f: fplain, a: a, L: Lv.toPlain(), e: eq.toPlain(), d: dd.toPlain(), punct: true } };
    }
    if (shape === 'which') return { q: 'For $f(x) = 4x$ at $a = 1$, a student says "the $\\delta$ for $\\varepsilon = 0.1$ is $0.025$." Which statement is accurate?', a: mc('Every $\\delta$ with $0 < \\delta \\le 0.025$ works; $0.025$ is just the largest.', ['Only $\\delta = 0.025$ works.', 'Every $\\delta \\ge 0.025$ works.', '$\\delta$ must depend on $x$ as well as on $\\varepsilon$.']),
      steps: ['$|4x - 4| = 4|x - 1| < 0.1$ exactly when $|x - 1| < 0.025$.', 'Shrinking $\\delta$ only removes points, so any smaller positive $\\delta$ also works. A $\\delta$ may depend on $\\varepsilon$ and $a$, never on $x$.'], hint: 'If a window works, does a narrower one?', data: { k: 'mc' } };
    var kind = shape, a3, Lt, fx3, fp3;
    if (kind === 'quad') { a3 = R.nz(-5, 5); Lt = String(a3 * a3); fx3 = 'x^{2}'; fp3 = 'x^2'; }
    else if (kind === 'sqrt') { var sr = R.int(1, 5); a3 = sr * sr; Lt = String(sr); fx3 = '\\sqrt{x}'; fp3 = 'sqrt(x)'; e = R.pick(['0.1', '0.2', '1/10', '0.05', '1/4']); if (q(e).ge(sr)) e = '0.1'; et = epsTex(e); }
    else { a3 = q(R.pick(['1', '2', '3', '4', '1/2'])).toPlain(); Lt = T.num(q(a3).inv()); fx3 = '\\frac{1}{x}'; fp3 = '1/x'; }
    var D = deltaStar(kind, a3, e), aT = T.num(q(a3));
    return { q: 'For $f(x) = ' + fx3 + '$, $\\lim_{x \\to ' + aT + '} f(x) = ' + Lt + '$. For $\\varepsilon = ' + et + '$, find a $\\delta > 0$ such that $|f(x) - ' + Lt + '| < \\varepsilon$ whenever $0 < |' + xm(a3) + '| < \\delta$. (Any $\\delta$ that works is right.)', a: upTo(D.d.plain),
      steps: D.why.concat(['Any $\\delta$ with $0 < \\delta \\le ' + D.d.tex + '$ works' + (kind === 'quad' ? '; for example the textbook choice $\\min\\left(1, \\frac{\\varepsilon}{' + (2 * M.abs(a3) + 1) + '}\\right) = ' + T.num(qmin(1, q(e).div(2 * M.abs(a3) + 1))) + '$ is smaller and also works.' : '.')]),
      hint: 'Find the $x$-interval where $|f(x) - L| < \\varepsilon$, then the widest window around $a$ that fits inside it.', viz: L === 2 ? { name: 'ra-epsdelta', opts: { f: fp3, a: Number(q(a3).toNumber()), L: kind === 'recip' ? q(a3).inv().toPlain() : Lt, eps: q(e).toNumber(), quiet: true, edit: false } } : undefined, data: { k: kind, a: String(a3), e: q(e).toPlain(), d: D.d.plain, dval: D.d.val } };
  });

  G('ra.continuity', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bound', 'recipe']), R.pick(['any', 'recipe', 'choose']), R.pick(['any', 'cubic', 'flaw', 'order']));
    var a = R.nz(-4, 4), b = R.intNot(-4, 4, -2 * a), e = epsPick(R, L === 1 ? 1 : 2), eq = q(e), et = epsTex(e), Mv = M.abs(2 * a + b) + 1;
    var fx = 'x^{2}' + (b ? (b < 0 ? ' - ' : ' + ') + (M.abs(b) === 1 ? '' : M.abs(b)) + 'x' : ''), fa = a * a + b * a, sec = xm(-(a + b)), factor = '|' + xm(a) + '|\\,|' + sec + '|';
    if (shape === 'bound') return { q: 'To prove $f(x) = ' + fx + '$ is continuous at $a = ' + a + '$, write $|f(x) - f(' + a + ')| = ' + factor + '$. If $|' + xm(a) + '| < 1$, what is the smallest $M$ with $|' + sec + '| < M$ for all such $x$?', a: num(Mv),
      steps: ['$|' + xm(a) + '| < 1$ gives $' + (a - 1) + ' < x < ' + (a + 1) + '$.', 'Then $' + (2 * a + b - 1) + ' < ' + sec + ' < ' + (2 * a + b + 1) + '$, so its size stays below $' + Mv + '$ and comes as close to $' + Mv + '$ as you like.', 'So $M = ' + Mv + '$, and $|f(x) - f(' + a + ')| < ' + Mv + '|' + xm(a) + '|$. Then $\\delta = \\min\\left(1, \\frac{\\varepsilon}{' + Mv + '}\\right)$ works.'],
      hint: 'Find the interval for $x$, then for the second factor.', data: { k: 'bound', a: a, b: b, M: Mv } };
    if (shape === 'recipe') { var dr = qmin(1, eq.div(Mv));
      return { q: 'The standard proof that $f(x) = ' + fx + '$ is continuous at $a = ' + a + '$ writes $|f(x) - f(' + a + ')| = ' + factor + '$, restricts to $|' + xm(a) + '| < 1$ to get $|f(x) - f(' + a + ')| < ' + Mv + '|' + xm(a) + '|$, and then takes $\\delta = \\min\\left(1, \\frac{\\varepsilon}{' + Mv + '}\\right)$. What $\\delta$ does it give for $\\varepsilon = ' + et + '$?', a: num(dr.toPlain()),
        steps: ['$\\frac{\\varepsilon}{' + Mv + '} = ' + T.num(eq.div(Mv)) + '$.', '$\\delta = \\min(1, ' + T.num(eq.div(Mv)) + ') = ' + T.num(dr) + '$.', 'The "$\\min$ with $1$" keeps $x$ within $1$ of $a$, which is what made the bound $' + Mv + '$ true.'],
        hint: 'Compute $\\frac{\\varepsilon}{M}$, then take the smaller of it and $1$.', data: { k: 'recipe', a: a, b: b, e: eq.toPlain(), d: dr.toPlain() } }; }
    if (shape === 'any') { var c2 = q(2 * a + b).div(2), A = c2.mul(c2).add(eq), s = surd(A), dstar = surdPlus(s, c2.abs().neg()), hb = q(b).div(2);
      var sq = b ? 'Complete the square: $f(x) = (' + xm(hb.neg()) + ')^{2} - ' + T.num(hb.mul(hb)) + '$. With $u = ' + xm(hb.neg()) + '$, the question is how far $u$ can move from $' + T.num(c2) + '$ while $u^{2}$ stays within $' + et + '$ of $' + T.num(c2.mul(c2)) + '$.' : 'The question is how far $x$ can move from $' + a + '$ while $x^{2}$ stays within $' + et + '$ of $' + (a * a) + '$.';
      return { q: 'Show that $f(x) = ' + fx + '$ is continuous at $a = ' + a + '$ for $\\varepsilon = ' + et + '$: find a $\\delta > 0$ such that $|f(x) - f(' + a + ')| < \\varepsilon$ whenever $|' + xm(a) + '| < \\delta$. (Any $\\delta$ that works is right.)', a: upTo(dstar.plain),
        steps: [sq, 'The worst direction is away from $0$: we need $\\left(' + T.num(c2.abs()) + ' + \\delta\\right)^{2} \\le ' + T.num(A) + '$.', 'So the largest $\\delta$ is $\\sqrt{' + T.num(A) + '} - ' + T.num(c2.abs()) + ' = ' + dstar.tex + ' \\approx ' + T.num(U.round(dstar.val, 6)) + '$. The recipe $\\min\\left(1, \\frac{\\varepsilon}{' + Mv + '}\\right) = ' + T.num(qmin(1, eq.div(Mv))) + '$ is smaller, so it works too.'],
        hint: 'Either use the recipe $\\delta = \\min(1, \\varepsilon / M)$ or find the largest $\\delta$ exactly.', data: { k: 'any', a: a, b: b, e: eq.toPlain(), d: dstar.plain, dval: dstar.val } }; }
    var aa = M.abs(a), Mm = 2 * aa + 1;
    if (shape === 'choose') return { q: 'For $f(x) = x^{2}$ at $a = ' + aa + '$: with $|x - ' + aa + '| < 1$ we get $|x + ' + aa + '| < ' + Mm + '$. Which $\\delta$ makes the proof work for every $\\varepsilon > 0$?', a: mc('$\\delta = \\min\\left(1, \\frac{\\varepsilon}{' + Mm + '}\\right)$', ['$\\delta = \\frac{\\varepsilon}{' + Mm + '}$', '$\\delta = \\frac{\\varepsilon}{|x + ' + aa + '|}$', '$\\delta = \\min\\left(1, ' + Mm + '\\varepsilon\\right)$']),
      steps: ['The bound $|x + ' + aa + '| < ' + Mm + '$ needs $|x - ' + aa + '| < 1$, so $\\delta \\le 1$.', 'Then $|x^{2} - ' + (aa * aa) + '| < ' + Mm + '\\delta \\le \\varepsilon$ needs $\\delta \\le \\frac{\\varepsilon}{' + Mm + '}$.', 'Both at once: the minimum. Without the $1$, a large $\\varepsilon$ gives a $\\delta$ too big for the bound; and $\\delta$ can\'t depend on $x$.'],
      hint: 'Two conditions on $\\delta$ have to hold at the same time.', data: { k: 'mc' } };
    if (shape === 'cubic') { var a4 = R.int(1, 4), M4 = 3 * a4 * a4 + 3 * a4 + 1, qd = 'x^{2} + ' + (a4 === 1 ? '' : a4) + 'x + ' + (a4 * a4);
      return { q: 'To prove $x^{3}$ is continuous at $a = ' + a4 + '$, write $|x^{3} - ' + (a4 * a4 * a4) + '| = |x - ' + a4 + '|\\,|' + qd + '|$. If $|x - ' + a4 + '| < 1$, what is the smallest $M$ with $|' + qd + '| < M$ for all such $x$?', a: num(M4),
        steps: ['For $' + (a4 - 1) + ' < x < ' + (a4 + 1) + '$, the quadratic $' + qd + '$ is positive and increasing (its vertex is at $x = ' + T.num(Q(-a4, 2)) + '$).', 'So it stays below its value at $x = ' + (a4 + 1) + '$: $' + ((a4 + 1) * (a4 + 1)) + ' + ' + (a4 * (a4 + 1)) + ' + ' + (a4 * a4) + ' = ' + M4 + '$, and comes as close to it as you like.', 'So $M = ' + M4 + '$, and $\\delta = \\min\\left(1, \\frac{\\varepsilon}{' + M4 + '}\\right)$ works.'],
        hint: 'Where on the interval is the quadratic largest?', data: { k: 'cubic', a: a4, M: M4 } }; }
    if (shape === 'order') { var O = orderTask(R, ['Let $\\varepsilon > 0$.', 'Let $\\delta = \\min\\left(1, \\frac{\\varepsilon}{' + Mm + '}\\right)$.', 'Suppose $|x - ' + aa + '| < \\delta$.', 'Then $|x - ' + aa + '| < 1$, so $|x + ' + aa + '| < ' + Mm + '$.', 'So $|x^{2} - ' + (aa * aa) + '| = |x - ' + aa + '|\\,|x + ' + aa + '| < ' + Mm + '\\delta \\le \\varepsilon$.']);
      return { q: 'Put the steps of the proof that $x^{2}$ is continuous at $' + aa + '$ in order. Type the letters, like CADBE.<br>' + O.list, a: O.a, steps: ['Follow the definition: given $\\varepsilon$, choose $\\delta$, take any $x$ within $\\delta$, then estimate.', 'The order is ' + O.order.join(', ') + '.'], hint: 'For every ε there is a δ such that for every x …', data: { k: 'order' } }; }
    var fl = R.pick([['“Let $\\varepsilon > 0$ and choose $\\delta = \\frac{\\varepsilon}{|x + 2|}$. Then $|x^{2} - 4| = |x - 2||x + 2| < \\delta|x + 2| = \\varepsilon$.”', '$\\delta$ depends on $x$; it must be chosen from $\\varepsilon$ (and $a$) before $x$ is picked.', ['The factoring $x^{2} - 4 = (x - 2)(x + 2)$ is wrong.', 'It should use $\\le$ instead of $<$.', 'Nothing is wrong.']],
      ['“Let $\\varepsilon > 0$ and $\\delta = \\frac{\\varepsilon}{5}$. If $|x - 2| < \\delta$, then $|x + 2| < 5$, so $|x^{2} - 4| < 5\\delta = \\varepsilon$.”', '$|x + 2| < 5$ only follows when $|x - 2| < 1$; for large $\\varepsilon$ this $\\delta$ is bigger than $1$. Use $\\delta = \\min(1, \\frac{\\varepsilon}{5})$.', ['$|x + 2| < 5$ is never true.', 'It should choose $\\delta = 5\\varepsilon$.', 'Nothing is wrong.']],
      ['“Let $\\varepsilon = 0.01$ and $\\delta = 0.002$. If $|x - 2| < \\delta$, then $|x^{2} - 4| < 5(0.002) = 0.01$. So $x^{2}$ is continuous at $2$.”', 'It handles one $\\varepsilon$; continuity needs a $\\delta$ for every $\\varepsilon > 0$.', ['$0.002$ is too large for $\\varepsilon = 0.01$.', 'It should check $x = 2$ itself.', 'Nothing is wrong.']]]);
    return { q: 'A student tries to prove that $x^{2}$ is continuous at $2$:<br>' + fl[0] + '<br>What is wrong?', a: mc(fl[1], fl[2]), steps: ['The definition: for every $\\varepsilon > 0$ there is a $\\delta > 0$ (depending on $\\varepsilon$ and $a$ only) such that every $x$ with $|x - a| < \\delta$ has $|f(x) - f(a)| < \\varepsilon$.', 'The flaw: ' + fl[1]], hint: 'Check what $\\delta$ is allowed to depend on, and whether every $\\varepsilon$ is covered.', data: { k: 'mc' } };
  });

  var THETA = [['\\frac{\\pi}{2}', '1', '0'], ['\\frac{\\pi}{6}', '1/2', 'sqrt(3)/2'], ['\\frac{\\pi}{4}', 'sqrt(2)/2', 'sqrt(2)/2'], ['\\frac{\\pi}{3}', 'sqrt(3)/2', '1/2'], ['\\frac{3\\pi}{2}', '-1', '0'], ['\\frac{7\\pi}{6}', '-1/2', '-sqrt(3)/2'], ['\\pi', '0', '-1'], ['\\frac{2\\pi}{3}', 'sqrt(3)/2', '-1/2']];
  G('ra.sequential-criterion', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['sin', 'twoside']), R.pick(['sin', 'ratirr', 'thomae']), R.pick(['ratirr', 'twoside', 'one']));
    if (shape === 'sin') { var th = R.pick(THETA), useSin = R.coin(), v = useSin ? th[1] : th[2], fn = useSin ? '\\sin' : '\\cos';
      return { q: 'Let $f(x) = ' + fn + '\\left(\\frac{1}{x}\\right)$ for $x \\ne 0$. For $x_n = \\frac{1}{2\\pi n + ' + th[0] + '}$, which tends to $0$, find $\\lim f(x_n)$.', a: num(v),
        steps: ['$\\frac{1}{x_n} = 2\\pi n + ' + th[0] + '$, so $f(x_n) = ' + fn + '\\left(2\\pi n + ' + th[0] + '\\right) = ' + fn + '\\left(' + th[0] + '\\right) = ' + tex(v) + '$ for every $n$.', 'So $f(x_n) \\to ' + tex(v) + '$. Different choices of the angle give different limits along sequences tending to $0$, so no value of $f(0)$ makes $f$ continuous at $0$.'],
        hint: 'What is $\\frac{1}{x_n}$? The sine and cosine repeat every $2\\pi$.', data: { k: 'sin', th: th[0], fn: useSin ? 'sin' : 'cos', v: v } }; }
    if (shape === 'ratirr') { var kd = R.pick(['lin', 'quad', 'cube']), pT, qT, roots;
      if (kd === 'lin') { var c = R.nz(-9, 9); pT = 'x'; qT = String(c); roots = [c]; var pj = 'x', qj = String(c); }
      else if (kd === 'quad') { var r1 = R.int(-6, 6), r2 = R.intNot(-6, 6, r1); pT = 'x^{2}'; qT = T.lin(r1 + r2, 'x', -r1 * r2); roots = [r1, r2]; pj = 'x*x'; qj = (r1 + r2) + '*x-(' + (r1 * r2) + ')'; }
      else { var k = R.pick([1, 4, 9, 16, 25]), rk = M.sqrt(k); pT = 'x^{3}'; qT = (k === 1 ? '' : k) + 'x'; roots = [0, rk, -rk]; pj = 'x*x*x'; qj = k + '*x'; }
      return { q: 'Let $f(x) = ' + pT + '$ when $x$ is rational and $f(x) = ' + qT + '$ when $x$ is irrational. At which points is $f$ continuous? Give the set.', a: setA(roots),
        steps: ['Near any point there are rationals and irrationals, so sequences $x_n \\to a$ of each kind give $f(x_n) \\to ' + pT.replace('x', 'a') + '$ and $f(x_n) \\to ' + qT.replace(/x/g, 'a') + '$.', 'Continuity at $a$ needs these to agree: $' + pT.replace('x', 'a') + ' = ' + qT.replace(/x/g, 'a') + '$.', 'The solutions are $a = ' + roots.slice().sort(function (x, y) { return x - y; }).join(', ') + '$; at those points both pieces agree, and $f$ is continuous. Everywhere else it is not.'],
        hint: 'Approach $a$ along rationals and along irrationals. When do the limits agree?', data: { k: 'ratirr', kind: kd, roots: roots, pj: pj, qj: qj } }; }
    if (shape === 'thomae') { var den = R.int(2, 12), nu = R.int(1, den - 1); while (gcd(nu, den) > 1) nu = R.int(1, den - 1); var sc = R.pick([0, 0, 1, 2]), num0 = nu + sc * den, ask = R.pick(['value', 'value', 'cont']);
      if (ask === 'value') return { q: 'Thomae\'s function is $f\\left(\\frac{p}{q}\\right) = \\frac{1}{q}$ for a fraction in lowest terms with $q > 0$, and $f(x) = 0$ for irrational $x$. Find $f\\left(' + T.num(Q(num0 * 2, den * 2)).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '\\frac{' + (num0 * 2) + '}{' + (den * 2) + '}') + '\\right)$.', a: num(Q(1, den).toPlain()),
        steps: ['First reduce: $\\frac{' + (num0 * 2) + '}{' + (den * 2) + '} = \\frac{' + num0 + '}{' + den + '}$ in lowest terms.', 'So $f = \\frac{1}{' + den + '}$.', 'Only finitely many fractions near a point have small denominators, which is why $f$ is continuous at every irrational and discontinuous at every rational.'],
        hint: 'Write the fraction in lowest terms first.', data: { k: 'thomae', p: num0, q: den } };
      var atRat = R.coin(); return { q: 'Thomae\'s function is $f(\\frac{p}{q}) = \\frac{1}{q}$ in lowest terms and $0$ at irrationals. Is it continuous at $' + (atRat ? '\\frac{' + nu + '}{' + den + '}' : '\\sqrt{' + R.pick([2, 3, 5, 7]) + '}') + '$?', a: tf(!atRat),
        steps: atRat ? ['$f\\left(\\frac{' + nu + '}{' + den + '}\\right) = \\frac{1}{' + den + '}$, but irrationals $x_n \\to \\frac{' + nu + '}{' + den + '}$ give $f(x_n) = 0$.', 'The limits disagree, so $f$ is not continuous there: false.'] : ['$f = 0$ at an irrational point. Rationals very close to it must have large denominators, so $f$ is small near the point.', 'Every sequence $x_n \\to$ the point has $f(x_n) \\to 0$, so $f$ is continuous there: true.'],
        hint: 'Compare $f$ at the point with $f$ along nearby irrationals.', data: { k: 'tf' } }; }
    if (shape === 'twoside') { var a2 = R.nz(-8, 8), k2 = R.pick([1, 2, 3, 4, 5]);
      return { q: 'Let $f(x) = \\frac{' + (k2 === 1 ? '' : k2) + '(x^{2} - ' + (a2 * a2) + ')}{|x - ' + T.p(a2) + '|}$ for $x \\ne ' + a2 + '$. Find $\\lim f\\left(' + a2 + ' + \\frac{1}{n}\\right)$ and $\\lim f\\left(' + a2 + ' - \\frac{1}{n}\\right)$.', a: multi([part('from the right:', num(2 * k2 * a2)), part('from the left:', num(-2 * k2 * a2))]),
        steps: ['$f(x) = ' + (k2 === 1 ? '' : k2) + '(x + ' + T.p(a2) + ')\\frac{x - ' + T.p(a2) + '}{|x - ' + T.p(a2) + '|}$, and the fraction is $1$ to the right of $' + a2 + '$ and $-1$ to the left.', 'So $f(' + a2 + ' + \\frac{1}{n}) \\to ' + (2 * k2 * a2) + '$ and $f(' + a2 + ' - \\frac{1}{n}) \\to ' + (-2 * k2 * a2) + '$.', 'Two sequences tending to $' + a2 + '$ with different limits of $f$: no value of $f(' + a2 + ')$ makes $f$ continuous there.'],
        hint: 'What is $\\frac{x - a}{|x - a|}$ on each side?', data: { k: 'two', a: a2, k2: k2 } }; }
    return { q: 'For some function $f$, the sequence $x_n = \\frac{1}{n}$ gives $f(x_n) \\to f(0)$. What can you conclude?', a: mc('Nothing yet: continuity at $0$ needs $f(x_n) \\to f(0)$ for every sequence $x_n \\to 0$.', ['$f$ is continuous at $0$.', '$f$ is continuous everywhere.', '$f$ is discontinuous at $0$.']),
      steps: ['One sequence can show a discontinuity (if its limit is wrong) but can never show continuity.', 'For example $f(x) = 0$ at $\\frac{1}{n}$ and at $0$, and $f(x) = 1$ elsewhere: $f(\\frac{1}{n}) \\to f(0)$, yet $f$ is not continuous at $0$.'], hint: 'Could another sequence behave differently?', data: { k: 'mc' } };
  });

  function cubicRoot(R) { // f(x) = x^3 + p x + q, increasing, one real root in (k, k+1)
    for (var t = 0; t < 100; t++) { var p = R.int(1, 4), qq = R.nz(-25, 25), f = function (x) { return x * x * x + p * x + qq; }, k = -6; while (k < 6 && !(f(k) < 0 && f(k + 1) > 0)) k++; if (k < 6 && f(k) !== 0) return { p: p, q: qq, k: k, tex: 'x^{3} + ' + (p === 1 ? '' : p) + 'x ' + (qq < 0 ? '- ' + (-qq) : '+ ' + qq), plain: 'x^3+' + p + '*x+' + qq, fq: function (x) { x = q(x); return x.pow(3).add(x.mul(p)).add(qq); } }; }
    throw new Error('cubicRoot');
  }
  G('ra.ivt', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['locate', 'bisect']), R.pick(['bisect', 'hyp', 'count']), R.pick(['bisect', 'fixed', 'hyp']));
    if (shape === 'locate' || shape === 'bisect') { var C = cubicRoot(R);
      if (shape === 'locate') return { q: 'The function $f(x) = ' + C.tex + '$ is increasing, so it has exactly one real root. Find the integer $k$ such that the root lies in $(k, k + 1)$.', a: num(C.k),
        steps: ['$f(' + C.k + ') = ' + C.fq(C.k).toPlain() + ' < 0$ and $f(' + (C.k + 1) + ') = ' + C.fq(C.k + 1).toPlain() + ' > 0$.', '$f$ is continuous, so by the intermediate value theorem it is $0$ somewhere in $(' + C.k + ', ' + (C.k + 1) + ')$. So $k = ' + C.k + '$.'],
        hint: 'Evaluate $f$ at small integers and look for a sign change.', viz: L === 1 ? { name: 'graph', opts: { f: C.plain, xmin: -5, xmax: 5, ymin: -20, ymax: 20, zoom: false, quiet: true } } : undefined, data: { k: 'locate', f: C.plain, kk: C.k } };
      var st = L === 1 ? 2 : L === 2 ? 3 : 4, lo = q(C.k), hi = q(C.k + 1), log = [], ok = true;
      for (var i = 0; i < st; i++) { var mid = lo.add(hi).div(2), fm = C.fq(mid); if (fm.isZero()) { ok = false; break; } log.push('$m = ' + T.num(mid) + '$: $f(m) ' + (fm.sign() < 0 ? '< 0' : '> 0') + '$, so keep $[' + (fm.sign() < 0 ? T.num(mid) + ', ' + T.num(hi) : T.num(lo) + ', ' + T.num(mid)) + ']$.'); if (fm.sign() < 0) lo = mid; else hi = mid; }
      return { q: 'Bisection for $f(x) = ' + C.tex + '$ starts on $[' + C.k + ', ' + (C.k + 1) + ']$, where $f(' + C.k + ') < 0 < f(' + (C.k + 1) + ')$. Each step evaluates $f$ at the midpoint and keeps the half where the sign changes. Give the interval after ' + st + ' steps.', a: { t: 'interval', v: '[' + lo.toPlain() + ', ' + hi.toPlain() + ']' },
        steps: log.concat(['So the root lies in $[' + T.num(lo) + ', ' + T.num(hi) + ']$, an interval of length $\\frac{1}{' + pow2(st) + '}$. This is the IVT proof in action: the nested intervals close in on a root.']),
        hint: 'Evaluate $f$ at the midpoint; a negative value means the root is to the right.', data: { k: 'bisect', f: C.plain, kk: C.k, st: st, lo: lo.toPlain(), hi: hi.toPlain() } }; }
    if (shape === 'count') { var xs = [-2, -1, 0, 1, 2, 3], signs, chg; do { signs = xs.map(function () { return R.pick([-1, 1]); }); chg = 0; for (var j = 1; j < xs.length; j++) if (signs[j] !== signs[j - 1]) chg++; } while (chg < 2);
      var vals = signs.map(function (s) { return s * R.int(1, 9); });
      return { q: 'A continuous function $f$ has these values: ' + xs.map(function (x, i) { return '$f(' + x + ') = ' + vals[i] + '$'; }).join(', ') + '. What is the least number of roots $f$ must have in $[-2, 3]$?', a: num(chg),
        steps: ['Each change of sign between neighboring points gives a root between them, by the IVT.', 'The signs are ' + signs.map(function (s) { return s > 0 ? '$+$' : '$-$'; }).join(', ') + ': ' + chg + ' changes.', 'So $f$ has at least ' + plural(chg, 'root') + ' (it could have more).'],
        hint: 'Count the sign changes.', data: { k: 'count', vals: vals, chg: chg } }; }
    if (shape === 'hyp') { var it = R.pick([['$f(x) = \\frac{1}{x}$ on $[-1, 1]$, with $f(-1) = -1 < 0 < 1 = f(1)$', false, 'It is not continuous on $[-1, 1]$ (not even defined at $0$), and indeed it has no root.'], ['$f(x) = x^{3} - x - 1$ on $[1, 2]$, with $f(1) = -1 < 0 < 5 = f(2)$', true, 'A polynomial is continuous everywhere, so the IVT gives a root in $(1, 2)$.'], ['$f(x) = \\lfloor x \\rfloor - \\frac{1}{2}$ on $[0, 1]$, with $f(0) < 0 < f(1)$', false, 'It jumps at $1$ and is never $0$: not continuous.'], ['$f(x) = \\cos x - x$ on $[0, \\frac{\\pi}{2}]$, with $f(0) = 1 > 0 > -\\frac{\\pi}{2} = f(\\frac{\\pi}{2})$', true, 'Continuous, with a sign change, so there is a root.'], ['$f(x) = \\tan x$ on $[\\frac{\\pi}{4}, \\frac{3\\pi}{4}]$, with $f(\\frac{\\pi}{4}) = 1 > 0 > -1 = f(\\frac{3\\pi}{4})$', false, '$\\tan x$ is undefined at $\\frac{\\pi}{2}$, inside the interval, and has no root there.']]);
      return { q: 'Does the intermediate value theorem guarantee a root here? ' + it[0] + '.', a: tf(it[1]), steps: [it[2], 'The IVT needs continuity on the whole closed interval.'], hint: 'Is $f$ continuous on the entire closed interval?', data: { k: 'tf' } }; }
    return { q: 'Proof that a continuous $f : [0, 1] \\to [0, 1]$ has a fixed point: “Let $g(x) = f(x) - x$. Then $g(0) = f(0) \\ge 0$ and $g(1) = f(1) - 1 \\le 0$.” What is the next step?', a: mc('$g$ is continuous, so by the IVT $g(c) = 0$ for some $c \\in [0, 1]$, and then $f(c) = c$.', ['So $g$ is decreasing, and $g(c) = 0$ somewhere.', 'So $f(0) = 0$ or $f(1) = 1$.', 'So $f(c) = c$ for $c = \\frac{1}{2}$.']),
      steps: ['$g$ is a difference of continuous functions, so it is continuous.', 'It goes from $\\ge 0$ to $\\le 0$, so the IVT gives $c$ with $g(c) = 0$, that is, $f(c) = c$. (Nothing says $g$ is monotone.)'], hint: 'Which theorem turns a sign change into a zero?', data: { k: 'mc' } };
  });

  G('ra.evt', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['max', 'sup']), R.pick(['sup', 'max', 'hyp']), R.pick(['sup', 'hyp', 'step']));
    if (shape === 'sup') { var h = R.int(-3, 3), k = R.int(-4, 4), up = R.coin(), a = h + R.int(-4, -1), b = h + R.int(1, 4), lc = R.coin(), rc = R.coin();
      var f = function (x) { return up ? k - (x - h) * (x - h) : (x - h) * (x - h) + k; }, ftex = (up ? T.num(k) + ' - ' : '') + '(x ' + (h < 0 ? '+ ' + (-h) : '- ' + h) + ')^{2}' + (up ? '' : T.signed(k));
      ftex = ftex.replace('(x - 0)', 'x').replace(/^0 - /, '-');
      var cands = [{ x: a, v: f(a), inc: lc }, { x: b, v: f(b), inc: rc }]; if (up) cands.push({ x: h, v: k, inc: true });
      var sup = M.max.apply(null, cands.map(function (c) { return c.v; })), att = cands.some(function (c) { return c.v === sup && c.inc; });
      if (!up && f(a) === f(b) && lc !== rc) { /* fine: the closed end attains it */ }
      return { q: 'Let $f(x) = ' + ftex + '$ on the interval $' + (lc ? '[' : '(') + a + ', ' + b + (rc ? ']' : ')') + '$. Find $\\sup f$ on this interval, and decide whether $f$ attains a maximum there.', a: multi([part('$\\sup f =$', num(sup)), part('$f$ attains a maximum:', tf(att))]),
        steps: [up ? 'The graph is a downward parabola with vertex $(' + h + ', ' + k + ')$, inside the interval.' : 'The graph is an upward parabola, so on an interval its largest values are at the ends: $f(' + a + ') = ' + f(a) + '$ and $f(' + b + ') = ' + f(b) + '$.', 'So $\\sup f = ' + sup + '$.', att ? 'A point where $f = ' + sup + '$ belongs to the interval, so the maximum is attained.' : 'The only points where $f$ would equal $' + sup + '$ are missing ends of the interval, so the supremum is not attained: no maximum. (The EVT needs a closed interval.)'],
        hint: 'Sketch the parabola over the interval and check which ends are included.', viz: L === 1 ? { name: 'graph', opts: { f: (up ? k + '-(x-' + h + ')^2' : '(x-' + h + ')^2+' + k), xmin: a - 1, xmax: b + 1, ymin: -12, ymax: 12, zoom: false, quiet: true } } : undefined, data: { k: 'sup', h: h, kk: k, up: up, a: a, b: b, lc: lc, rc: rc, sup: sup, att: att } }; }
    if (shape === 'max') { var p = R.int(1, 3), a2 = R.int(-4, -1), b2 = R.int(1, 4), g = function (x) { return x * x * x - 3 * p * p * x; }, xs = [a2, b2], best = -Infinity, bx = null;
      if (-p > a2 && -p < b2) xs.push(-p); if (p > a2 && p < b2) xs.push(p);
      xs.forEach(function (x) { if (g(x) > best) { best = g(x); bx = x; } });
      return { q: 'Find the maximum value of $f(x) = x^{3} - ' + (3 * p * p) + 'x$ on $[' + a2 + ', ' + b2 + ']$. (The EVT guarantees it exists.)', a: num(best),
        steps: ['$f\'(x) = 3x^{2} - ' + (3 * p * p) + ' = 0$ at $x = \\pm ' + p + '$.', 'Compare the values at the critical points in the interval and at the ends: ' + xs.slice().sort(function (x, y) { return x - y; }).map(function (x) { return '$f(' + x + ') = ' + g(x) + '$'; }).join(', ') + '.', 'The largest is $' + best + '$, at $x = ' + bx + '$.'],
        hint: 'Check critical points inside the interval and both ends.', data: { k: 'max', p: p, a: a2, b: b2, v: best } }; }
    if (shape === 'hyp') { var it = R.pick([['$f(x) = x$ on $(0, 1)$', 'The interval is not closed.', ['$f$ is not continuous.', 'The interval is not bounded.', 'Nothing fails; $f$ has a maximum.']], ['$f(x) = x$ on $[0, \\infty)$', 'The interval is not bounded.', ['The interval is not closed.', '$f$ is not continuous.', 'Nothing fails; $f$ has a maximum.']], ['$f(x) = \\frac{1}{x}$ for $x \\ne 0$, $f(0) = 0$, on $[-1, 1]$', '$f$ is not continuous on the interval.', ['The interval is not closed.', 'The interval is not bounded.', 'Nothing fails; $f$ has a maximum.']], ['$f(x) = x - \\lfloor x \\rfloor$ on $[0, 2]$', '$f$ is not continuous on the interval.', ['The interval is not closed.', 'The interval is not bounded.', 'Nothing fails; $f$ has a maximum.']]]);
      return { q: 'The function ' + it[0] + ' has no maximum. Which hypothesis of the extreme value theorem fails?', a: mc(it[1], it[2]), steps: ['The EVT needs a continuous function on a closed and bounded interval.', it[1]], hint: 'Check continuity, closedness and boundedness.', data: { k: 'mc' } }; }
    return { q: 'Proof of the EVT on $[a, b]$: “Let $s = \\sup f([a, b])$ (first show $f$ is bounded). Choose $x_n \\in [a, b]$ with $f(x_n) > s - \\frac{1}{n}$.” What comes next?', a: mc('By Bolzano–Weierstrass a subsequence $x_{n_k} \\to c$, with $c \\in [a, b]$ because the interval is closed; by continuity $f(c) = \\lim f(x_{n_k}) = s$.', ['Then $x_n \\to b$, so $f(b) = s$.', 'Then $f(x_n) = s$ for some $n$.', 'Then $s$ is not attained, since $f(x_n) < s$.']),
      steps: ['The $x_n$ are bounded, so some subsequence converges, to a point $c$ of the closed interval.', 'Continuity carries the limit inside: $f(x_{n_k}) \\to f(c)$, and also $f(x_{n_k}) \\to s$. So $f(c) = s$.'], hint: 'Which theorem finds a convergent subsequence?', data: { k: 'mc' } };
  });

  G('ra.uniform-continuity', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['lin', 'sqrt']), R.pick(['sq', 'sin', 'which']), R.pick(['sq', 'fail', 'which']));
    if (shape === 'lin') { var m = q(R.pick([2, 3, 4, -2, -5, '1/2', '3/2'])), e = epsPick(R, 1), d = q(e).div(m.abs());
      return { q: 'Find the largest $\\delta$ such that $|f(x) - f(y)| < ' + epsTex(e) + '$ for <b>all</b> $x, y \\in \\mathbb{R}$ with $|x - y| < \\delta$, where $f(x) = ' + T.coef(T.num(m), 'x') + ' + 7$. (Any $\\delta$ up to that value works.)', a: upTo(d.toPlain()),
        steps: ['$|f(x) - f(y)| = ' + T.num(m.abs()) + '|x - y|$, the same everywhere.', 'It is less than $' + epsTex(e) + '$ exactly when $|x - y| < ' + T.num(d) + '$.', 'One $\\delta = ' + T.num(d) + '$ serves every point: $f$ is uniformly continuous.'], hint: 'For a line, $|f(x) - f(y)|$ depends only on $|x - y|$.', data: { k: 'ulin', m: m.toPlain(), e: q(e).toPlain(), d: d.toPlain() } }; }
    if (shape === 'sqrt') { var e2 = q(R.pick(['0.1', '0.2', '0.3', '1/10', '1/5', '0.05'])), d2 = e2.mul(e2);
      return { q: 'For $f(x) = \\sqrt{x}$ on $[0, \\infty)$, find the largest $\\delta$ such that $|\\sqrt{x} - \\sqrt{y}| < ' + T.num(e2) + '$ for all $x, y \\ge 0$ with $|x - y| < \\delta$. (Any $\\delta$ up to that value works.)', a: upTo(d2.toPlain()),
        steps: ['For $0 \\le y \\le x$: $\\sqrt{x} - \\sqrt{y} \\le \\sqrt{x - y}$ (square both sides), with equality when $y = 0$.', 'So the largest difference for $|x - y| < \\delta$ approaches $\\sqrt{\\delta}$, near $0$.', 'We need $\\sqrt{\\delta} \\le ' + T.num(e2) + '$, so $\\delta = ' + T.num(e2) + '^{2} = ' + T.num(d2) + '$. The graph is steepest at $0$, yet one $\\delta$ still works everywhere.'], hint: 'Where is $\\sqrt{x}$ steepest? Test $y = 0$.', data: { k: 'usqrt', e: e2.toPlain(), d: d2.toPlain() } }; }
    if (shape === 'sq') { var b = R.int(1, 5), e3 = q(R.pick(['0.1', '0.01', '1/10', '0.05', '1/2'])); if (e3.ge(b * b)) e3 = q('0.1'); var A = q(b * b).sub(e3), s = surd(A), d3 = surdPlus({ tex: '-' + s.tex, plain: '-' + s.plain, val: -s.val, rational: s.rational ? s.rational.neg() : null }, b);
      d3 = s.rational ? { tex: T.num(q(b).sub(s.rational)), plain: q(b).sub(s.rational).toPlain(), val: b - s.val } : { tex: b + ' - ' + s.tex, plain: b + '-' + s.plain, val: b - s.val };
      return { q: 'For $f(x) = x^{2}$ on $[0, ' + b + ']$, find the largest $\\delta$ such that $|x^{2} - y^{2}| < ' + T.num(e3) + '$ for all $x, y \\in [0, ' + b + ']$ with $|x - y| < \\delta$. (Any $\\delta$ up to that value works.)', a: upTo(d3.plain),
        steps: ['With $y = x + t$ ($0 < t < \\delta$): $y^{2} - x^{2} = t(2x + t)$, largest when $y$ is at the right end $' + b + '$: $t(' + (2 * b) + ' - t)$.', 'As $t \\to \\delta$ this approaches $\\delta(' + (2 * b) + ' - \\delta)$, so we need $\\delta(' + (2 * b) + ' - \\delta) \\le ' + T.num(e3) + '$, that is, $(' + b + ' - \\delta)^{2} \\ge ' + T.num(A) + '$.', 'So the largest $\\delta$ is $' + b + ' - \\sqrt{' + T.num(A) + '} = ' + d3.tex + ' \\approx ' + T.num(U.round(d3.val, 6)) + '$. It is set by the steepest part of the graph, at $x = ' + b + '$.'],
        hint: 'The worst pairs sit where the graph is steepest.', viz: L === 2 ? { name: 'ra-epsdelta', opts: { f: 'x^2', a: b, L: String(b * b), eps: e3.toNumber(), mode: 'uniform', interval: [0, b], quiet: true, edit: false } } : undefined, data: { k: 'usq', b: b, e: e3.toPlain(), d: d3.plain, dval: d3.val } }; }
    if (shape === 'sin') { var it = R.pick([['1', 'pi/3', '\\frac{\\pi}{3}', '\\frac{1}{2}', '\\frac{\\pi}{6}'], ['sqrt(2)', 'pi/2', '\\frac{\\pi}{2}', '\\frac{\\sqrt{2}}{2}', '\\frac{\\pi}{4}'], ['sqrt(3)', '2*pi/3', '\\frac{2\\pi}{3}', '\\frac{\\sqrt{3}}{2}', '\\frac{\\pi}{3}']]), et = tex(it[0]);
      return { q: 'For $f(x) = \\sin x$ on $\\mathbb{R}$, find the largest $\\delta$ such that $|\\sin x - \\sin y| < ' + et + '$ whenever $|x - y| < \\delta$. Use $\\sin x - \\sin y = 2\\cos\\frac{x + y}{2}\\sin\\frac{x - y}{2}$. (Any $\\delta$ up to that value works.)', a: upTo(it[1]),
        steps: ['The largest possible $|\\sin x - \\sin y|$ for $|x - y| < \\delta$ (with $\\delta \\le \\pi$) approaches $2\\sin\\frac{\\delta}{2}$: take $\\cos\\frac{x + y}{2} = 1$.', 'We need $2\\sin\\frac{\\delta}{2} \\le ' + et + '$, so $\\sin\\frac{\\delta}{2} \\le ' + it[3] + '$ and $\\frac{\\delta}{2} \\le ' + it[4] + '$.', 'So $\\delta = ' + it[2] + '$. (The simple bound $|\\sin x - \\sin y| \\le |x - y|$ gives the smaller, safe choice $\\delta = ' + et + '$.)'],
        hint: 'Make $2\\sin\\frac{\\delta}{2}$ equal to $\\varepsilon$.', data: { k: 'usin', e: it[0], d: it[1] } }; }
    if (shape === 'fail') { var dd = q(R.pick(['0.01', '0.001', '1/50', '0.02', '1/200']));
      return { q: '$f(x) = \\frac{1}{x}$ on $(0, 1)$ is not uniformly continuous. For $\\delta = ' + T.num(dd) + '$, take $x = \\frac{\\delta}{2}$ and $y = \\delta$, which are within $\\delta$ of each other. Compute $|f(x) - f(y)|$.', a: num(q(1).div(dd).toPlain()),
        steps: ['$f(x) = \\frac{2}{\\delta}$ and $f(y) = \\frac{1}{\\delta}$.', 'So $|f(x) - f(y)| = \\frac{1}{\\delta} = ' + T.num(q(1).div(dd)) + '$.', 'However small $\\delta$ is, this pair differs by $\\frac{1}{\\delta} > 1$. So for $\\varepsilon = 1$, no $\\delta$ works for all points at once.'], hint: 'Substitute and subtract.', data: { k: 'ufail', d: dd.toPlain() } }; }
    var items = [['$x^{2}$ on $[0, 5]$', 1], ['$x^{2}$ on $\\mathbb{R}$', 0], ['$\\frac{1}{x}$ on $[1, \\infty)$', 1], ['$\\frac{1}{x}$ on $(0, 1)$', 0], ['$\\sin x$ on $\\mathbb{R}$', 1], ['$\\sqrt{x}$ on $[0, \\infty)$', 1], ['$\\sin\\frac{1}{x}$ on $(0, 1)$', 0], ['$3x + 2$ on $\\mathbb{R}$', 1], ['$e^{x}$ on $\\mathbb{R}$', 0]], pick = R.sample(items, 5);
    if (!pick.some(function (x) { return x[1]; })) pick[0] = items[0]; if (pick.every(function (x) { return x[1]; })) pick[4] = items[1];
    var good = []; pick.forEach(function (x, i) { if (x[1]) good.push(i); });
    return { q: 'Which of these functions are uniformly continuous on the given set? Select all that apply.', a: mcAll(pick.map(function (x) { return x[0]; }), good),
      steps: ['Uniformly continuous: continuous functions on a closed bounded interval; functions with a bounded derivative (Lipschitz); $\\sqrt{x}$ (steep only near $0$, but $|\\sqrt{x} - \\sqrt{y}| \\le \\sqrt{|x - y|}$).', 'Not: $x^{2}$ and $e^{x}$ on $\\mathbb{R}$ (they get steeper without bound), $\\frac{1}{x}$ and $\\sin\\frac{1}{x}$ near $0$ (they change by a fixed amount over shorter and shorter distances).'],
      hint: 'Does the function get arbitrarily steep, or wiggle arbitrarily fast, on the set?', data: { k: 'mc' } };
  });

// ---- 05-derivatives.js
  // ================================================================ Unit 5: Derivatives
  G('ra.derivative-definition', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['dq', 'dq', 'osc']), R.pick(['dq', 'osc', 'piece']), R.pick(['dq', 'osc', 'piece', 'which']));
    if (shape === 'dq') { var kd = L === 1 ? 'quad' : R.pick(['quad', 'cube', 'recip']), a = R.nz(-4, 4), f, ans, st;
      if (kd === 'quad') { var c = R.nz(-4, 5), d = R.int(-6, 6); f = T.coef(c, 'x^{2}') + (d ? T.signed(d) .replace(/(\d)$/, '$1') + 'x' : '').replace(/ ([+-]) 1x$/, ' $1 x'); f = T.terms([[c, 'x^{2}'], [d, 'x']]);
        ans = plainOf([[c, 'h'], [2 * c * a + d, '']]); st = ['$f(' + a + ' + h) - f(' + a + ') = ' + (c === 1 ? '' : c === -1 ? '-' : c) + '(' + a + ' + h)^{2}' + (d ? T.coef(d, '(' + a + ' + h)', false) : '') + (c * a * a + d * a ? ' - ' + T.p(c * a * a + d * a) : '') + '$.', 'Expand: the constant terms cancel, leaving $' + T.terms([[2 * c * a + d, 'h'], [c, 'h^{2}']]) + '$.', 'Divide by $h$: $' + T.terms([[c, 'h'], [2 * c * a + d, '']]) + '$. As $h \\to 0$ this tends to $f\'(' + a + ') = ' + (2 * c * a + d) + '$.']; }
      else if (kd === 'cube') { f = 'x^{3}'; ans = plainOf([[1, 'h^2'], [3 * a, 'h'], [3 * a * a, '']]); st = ['$(' + a + ' + h)^{3} - (' + (a * a * a) + ') = ' + T.terms([[3 * a * a, 'h'], [3 * a, 'h^{2}'], [1, 'h^{3}']]) + '$.', 'Divide by $h$: $' + T.terms([[1, 'h^{2}'], [3 * a, 'h'], [3 * a * a, '']]) + '$.', 'As $h \\to 0$: $f\'(' + a + ') = ' + (3 * a * a) + '$.']; }
      else { a = R.int(1, 5); f = '\\frac{1}{x}'; ans = '-1/(' + a + '*(' + a + '+h))'; st = ['$\\frac{1}{' + a + ' + h} - \\frac{1}{' + a + '} = \\frac{-h}{' + a + '(' + a + ' + h)}$.', 'Divide by $h$: $\\frac{-1}{' + a + '(' + a + ' + h)}$.', 'As $h \\to 0$: $f\'(' + a + ') = ' + T.num(Q(-1, a * a)) + '$.']; }
      return { q: 'For $f(x) = ' + f + '$, simplify the difference quotient $\\frac{f(' + a + ' + h) - f(' + a + ')}{h}$ (for $h \\ne 0$) as an expression in $h$.', a: expr(ans, ['h']), steps: st, hint: 'Expand $f(a + h)$, subtract $f(a)$, and cancel a factor of $h$.', data: { k: 'dq', kind: kd, a: a, ans: ans, c: c, d: d } }; }
    if (shape === 'osc') { var it = R.pick([['x^{2}\\sin\\left(\\frac{1}{x}\\right)', '0', '$\\frac{f(h) - f(0)}{h} = h\\sin\\frac{1}{h}$, and $|h\\sin\\frac{1}{h}| \\le |h| \\to 0$ (squeeze).'], ['x\\sin\\left(\\frac{1}{x}\\right)', 'DNE', '$\\frac{f(h) - f(0)}{h} = \\sin\\frac{1}{h}$, which keeps swinging between $-1$ and $1$ as $h \\to 0$: no limit.'], ['x^{3}\\cos\\left(\\frac{1}{x}\\right)', '0', '$\\frac{f(h)}{h} = h^{2}\\cos\\frac{1}{h}$, squeezed between $\\pm h^{2} \\to 0$.'], ['x\\,|x|', '0', '$\\frac{f(h)}{h} = |h| \\to 0$.'], ['|x|', 'DNE', '$\\frac{f(h)}{h} = \\frac{|h|}{h}$ is $1$ for $h > 0$ and $-1$ for $h < 0$: the one-sided limits differ.'], ['\\sqrt[3]{x}', 'DNE', '$\\frac{f(h)}{h} = h^{-2/3} \\to \\infty$: the tangent is vertical, so there is no derivative.'], ['x^{2} \\text{ for rational } x \\text{ and } 0 \\text{ for irrational } x', '0', '$\\left|\\frac{f(h)}{h}\\right| \\le \\frac{h^{2}}{|h|} = |h| \\to 0$, whether $h$ is rational or not.']]);
      var piece = it[0].indexOf('\\text') >= 0;
      return { q: 'Let $f(x) = ' + it[0] + '$' + (piece ? '' : ' for $x \\ne 0$, with $f(0) = 0$') + '. Use the definition to find $f\'(0)$. (Type DNE if it does not exist.)', a: num(it[1]),
        steps: ['$f\'(0) = \\lim_{h \\to 0} \\frac{f(h) - f(0)}{h}$, and $f(0) = 0$.', it[2], it[1] === 'DNE' ? 'So $f\'(0)$ does not exist.' : 'So $f\'(0) = 0$.'], hint: 'Write the difference quotient at $0$ and simplify before taking the limit.', data: { k: 'osc', v: it[1] } }; }
    if (shape === 'piece') { var c3 = R.nz(-3, 3), p = R.pick([2 * c3, 2 * c3, 2 * c3 + R.nz(-3, 3)]), qq = c3 * c3 - p * c3, ok = p === 2 * c3;
      return { q: 'Let $f(x) = x^{2}$ for $x \\le ' + c3 + '$ and $f(x) = ' + T.lin(p, 'x', qq) + '$ for $x > ' + c3 + '$ (the pieces meet at $x = ' + c3 + '$). Find $f\'(' + c3 + ')$ from the definition. (Type DNE if it does not exist.)', a: num(ok ? String(2 * c3) : 'DNE'),
        steps: ['From the left ($h < 0$): $\\frac{(' + c3 + ' + h)^{2} - ' + (c3 * c3) + '}{h} = ' + T.lin(1, 'h', 2 * c3) + ' \\to ' + (2 * c3) + '$.', 'From the right ($h > 0$): $\\frac{' + p + '(' + c3 + ' + h)' + T.signed(qq) + ' - ' + T.p(c3 * c3) + '}{h} = ' + p + '$.', ok ? 'The one-sided limits agree, so $f\'(' + c3 + ') = ' + (2 * c3) + '$.' : 'They differ ($' + (2 * c3) + ' \\ne ' + p + '$): the graph has a corner, and $f\'(' + c3 + ')$ does not exist.'],
        hint: 'Compute the one-sided limits of the difference quotient.', data: { k: 'piece', c: c3, p: p, v: ok ? 2 * c3 : 'DNE' } }; }
    return { q: 'Which limit is the definition of $f\'(a)$?', a: mc('$\\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}$', ['$\\lim_{h \\to 0} \\frac{f(a + h) - f(h)}{a}$', '$\\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{a}$', '$\\lim_{h \\to a} \\frac{f(h) - f(a)}{h}$']),
      steps: ['The slope of the secant from $a$ to $a + h$ is $\\frac{f(a + h) - f(a)}{h}$.', 'The derivative is its limit as $h \\to 0$ (equivalently $\\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}$).'], hint: 'Rise over run between $a$ and $a + h$.', data: { k: 'mc' } };
  });
  function plainOf(ts) { var out = ''; ts.forEach(function (t) { var c = t[0], x = t[1]; if (!c) return; var a = M.abs(c), s = x === '' ? String(a) : (a === 1 ? '' : a + '*') + x; out = out ? out + (c < 0 ? ' - ' : ' + ') + s : (c < 0 ? '-' : '') + s; }); return out || '0'; }

  G('ra.differentiability', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['ab', 'tf']), R.pick(['ab', 'onesided', 'tf']), R.pick(['ab', 'onesided', 'step']));
    if (shape === 'ab') { var c = R.nz(-7, 7), cube = L === 3 && R.coin(), kk = cube ? 1 : R.int(1, 5), a = cube ? 3 * c * c : 2 * kk * c, b = cube ? -2 * c * c * c : -kk * c * c, f = cube ? 'x^{3}' : T.coef(kk, 'x^{2}');
      return { q: 'Find $a$ and $b$ so that $f(x) = ' + f + '$ for $x \\le ' + c + '$, $f(x) = ax + b$ for $x > ' + c + '$ is differentiable at $' + c + '$.', a: multi([part('$a =$', num(a)), part('$b =$', num(b))]),
        steps: ['Differentiable implies continuous, so the pieces meet: $' + (cube ? c * c * c : kk * c * c) + ' = ' + T.coef(c, 'a') + ' + b$.', 'The one-sided derivatives must agree: the left one is $' + (cube ? '3x^{2}' : T.coef(2 * kk, 'x')) + '$ at $' + c + '$, which is $' + a + '$, and the right one is $a$. So $a = ' + a + '$.', 'Then $b = ' + (cube ? c * c * c : kk * c * c) + ' - ' + T.p(c * a) + ' = ' + b + '$. (The line $y = ' + T.lin(a, 'x', b) + '$ is the tangent line at $' + c + '$.)'],
        hint: 'Two conditions: the pieces meet, and their slopes match.', data: { k: 'ab', c: c, cube: cube, kk: kk, a: a, b: b } }; }
    if (shape === 'onesided') { var cc = R.nz(-7, 7), d = R.intNot(-8, 8, cc), r = cc - d;
      return { q: 'Let $f(x) = |' + xm(cc) + '|\\,' + (d === 0 ? 'x' : '(' + xm(d) + ')') + '$. Find the right-hand and left-hand derivatives at $x = ' + cc + '$.', a: multi([part('right-hand:', num(r)), part('left-hand:', num(-r))]),
        steps: ['$\\frac{f(' + cc + ' + h) - f(' + cc + ')}{h} = \\frac{|h|}{h}(' + cc + ' + h' + (d < 0 ? ' + ' + (-d) : d === 0 ? '' : ' - ' + d) + ')$, since $f(' + cc + ') = 0$.', 'For $h > 0$ it tends to $' + r + '$; for $h < 0$ it tends to $' + (-r) + '$.', 'They differ, so $f$ is continuous but not differentiable at $' + cc + '$: a corner.'],
        hint: 'Factor out $|h|/h$, which is $1$ on the right and $-1$ on the left.', data: { k: 'one', c: cc, d: d, r: r } }; }
    if (shape === 'tf') { var it = R.pick([['If $f$ is differentiable at $a$, then $f$ is continuous at $a$.', true, 'True: $f(x) - f(a) = \\frac{f(x) - f(a)}{x - a}(x - a) \\to f\'(a) \\cdot 0 = 0$.'], ['If $f$ is continuous at $a$, then $f$ is differentiable at $a$.', false, 'False: $|x|$ is continuous at $0$ but has a corner there.'], ['If $f$ has a corner at $a$, then $f$ is not continuous at $a$.', false, 'False: $|x|$ has a corner at $0$ and is continuous there.'], ['If $f$ is not continuous at $a$, then $f$ is not differentiable at $a$.', true, 'True: this is the contrapositive of "differentiable implies continuous."']]);
      return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: [it[2]], hint: 'Think of $|x|$ at $0$.', data: { k: 'tf' } }; }
    return { q: 'To prove "differentiable at $a$ implies continuous at $a$," a proof writes $f(x) - f(a)$ as a product. Which one?', a: mc('$f(x) - f(a) = \\frac{f(x) - f(a)}{x - a} \\cdot (x - a)$, which tends to $f\'(a) \\cdot 0 = 0$.', ['$f(x) - f(a) = f\'(a)(x - a)$ exactly, for every $x$.', '$f(x) - f(a) = \\frac{f(x)}{x} - \\frac{f(a)}{a}$.', '$f(x) - f(a) = (f(x) - a)(x - f(a))$.']),
      steps: ['For $x \\ne a$, multiply and divide by $x - a$.', 'The first factor tends to $f\'(a)$ and the second to $0$, so by the product law $f(x) \\to f(a)$.'], hint: 'Make the difference quotient appear.', data: { k: 'mc' } };
  });

  G('ra.mean-value-theorem', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['quad', 'sqrt']), R.pick(['cubic', 'rolle', 'quad']), R.pick(['cubic', 'rolle', 'hyp']));
    if (shape === 'quad') { var p = R.nz(-3, 3), qq = R.int(-5, 5), a = R.int(-5, 2), b = a + R.int(1, 5), c = Q(a + b, 2);
      return { q: 'Find the number $c$ in $(' + a + ', ' + b + ')$ given by the mean value theorem for $f(x) = ' + T.terms([[p, 'x^{2}'], [qq, 'x'], [R.int(-5, 5), '']]) + '$ on $[' + a + ', ' + b + ']$.', a: num(c.toPlain()),
        steps: ['The secant slope is $\\frac{f(' + b + ') - f(' + a + ')}{' + b + ' - ' + T.p(a) + '} = ' + p + '(' + a + ' + ' + T.p(b) + ')' + T.signed(qq) + ' = ' + (p * (a + b) + qq) + '$.', '$f\'(c) = ' + T.lin(2 * p, 'c', qq) + '$. Setting them equal: $' + (2 * p) + 'c = ' + (p * (a + b)) + '$.', 'So $c = ' + T.num(c) + '$, the midpoint. (For any quadratic, the MVT point is the midpoint of the interval.)'],
        hint: 'Compute the secant slope, then solve for $c$ in $f\'(c) = m$, where $m$ is that slope.', data: { k: 'quad', p: p, q: qq, a: a, b: b, c: c.toPlain() } }; }
    if (shape === 'sqrt') { var m = R.int(1, 4), n = m + R.int(1, 5), c2 = Q((m + n) * (m + n), 4);
      return { q: 'Find the number $c$ given by the mean value theorem for $f(x) = \\sqrt{x}$ on $[' + (m * m) + ', ' + (n * n) + ']$.', a: num(c2.toPlain()),
        steps: ['The secant slope is $\\frac{' + n + ' - ' + m + '}{' + (n * n) + ' - ' + (m * m) + '} = \\frac{1}{' + (m + n) + '}$.', 'Set $f\'(c) = \\frac{1}{2\\sqrt{c}} = \\frac{1}{' + (m + n) + '}$, so $\\sqrt{c} = ' + T.num(Q(m + n, 2)) + '$.', 'So $c = ' + T.num(c2) + '$, which is in $(' + (m * m) + ', ' + (n * n) + ')$.'],
        hint: 'Set $\\frac{1}{2\\sqrt{c}}$ equal to the secant slope and solve for $c$.', data: { k: 'sqrt', m: m, n: n, c: c2.toPlain() } }; }
    if (shape === 'cubic') { var a2, b2, val, s, cs = [];
      for (var t = 0; t < 50; t++) { a2 = R.int(-3, 1); b2 = a2 + R.int(2, 4); val = Q(a2 * a2 + a2 * b2 + b2 * b2, 3); s = surd(val); cs = [s, { tex: '-' + s.tex, plain: '-' + s.plain, val: -s.val }].filter(function (z) { return z.val > a2 + 1e-12 && z.val < b2 - 1e-12; }); if (cs.length) break; }
      var k = R.int(1, 6);
      return { q: 'Find every $c$ in $(' + a2 + ', ' + b2 + ')$ that satisfies the mean value theorem for $f(x) = x^{3} - ' + (k === 1 ? '' : k) + 'x$ on $[' + a2 + ', ' + b2 + ']$. Give the set.', a: setA(cs.map(function (z) { return z.plain; })),
        steps: ['Secant slope: $\\frac{f(b) - f(a)}{b - a} = a^{2} + ab + b^{2} - ' + k + '$ with $a = ' + a2 + '$ and $b = ' + b2 + '$, which is $' + (a2 * a2 + a2 * b2 + b2 * b2 - k) + '$.', 'Set $f\'(c) = 3c^{2} - ' + k + '$ equal to it: $c^{2} = ' + T.num(val) + '$, so $c = \\pm ' + s.tex + '$.', 'Keep the values strictly inside $(' + a2 + ', ' + b2 + ')$: $' + cs.map(function (z) { return z.tex; }).join(', ') + '$.'],
        hint: 'Use $\\frac{b^{3} - a^{3}}{b - a} = a^{2} + ab + b^{2}$.', data: { k: 'cubic', a: a2, b: b2, kk: k, cs: cs.map(function (z) { return z.val; }) } }; }
    if (shape === 'rolle') { var it = R.pick([['x^{3} - 3x + ' + R.int(-1, 1), '$f\'(x) = 3x^{2} - 3$ has two real roots, $\\pm 1$', 3], ['x^{5} + x + ' + R.int(-5, 5), '$f\'(x) = 5x^{4} + 1$ is always positive, so it has no real roots', 1], ['x^{4} + 4x + ' + R.int(-5, 5), '$f\'(x) = 4x^{3} + 4$ has one real root, $x = -1$', 2], ['x^{3} + 3x + ' + R.int(-5, 5), '$f\'(x) = 3x^{2} + 3$ is always positive, so it has no real roots', 1], ['x^{4} - 2x^{2} + ' + R.int(-2, 2) + '', '$f\'(x) = 4x^{3} - 4x$ has three real roots, $0$ and $\\pm 1$', 4]]);
      var ft = it[0].replace(/ \+ -/, ' - ').replace(/ \+ 0$/, '');
      return { q: 'Using Rolle\'s theorem, what is the largest number of real roots $f(x) = ' + ft + '$ can have? (Count the roots of $f\'$ first.)', a: num(it[2]),
        steps: [it[1] + '.', 'Between two roots of $f$, Rolle\'s theorem puts a root of $f\'$. So if $f\'$ has $k$ real roots, $f$ has at most $k + 1$.', 'So $f$ has at most ' + it[2] + ' real ' + (it[2] === 1 ? 'root' : 'roots') + '.'],
        hint: 'Roots of $f$ are separated by roots of $f\'$.', data: { k: 'rolle', v: it[2] } }; }
    var h2 = R.pick([['$f(x) = |x|$ on $[-1, 1]$', false, '$f$ is not differentiable at $0$; the secant slope is $0$ but $f\' = \\pm 1$ everywhere else.'], ['$f(x) = x^{2/3}$ on $[-1, 1]$', false, '$f$ is not differentiable at $0$; the secant slope is $0$, but $f\'(x) = \\frac{2}{3}x^{-1/3}$ is never $0$.'], ['$f(x) = \\frac{1}{x}$ on $[-1, 1]$', false, '$f$ is not even defined at $0$, so it is not continuous on $[-1, 1]$.'], ['$f(x) = x^{3}$ on $[-1, 2]$', true, 'A polynomial is continuous and differentiable everywhere, so the MVT applies.'], ['$f(x) = \\sqrt{x}$ on $[0, 4]$', true, 'Continuous on $[0, 4]$ and differentiable on $(0, 4)$; it need not be differentiable at the ends.']]);
    return { q: 'Do the hypotheses of the mean value theorem hold for ' + h2[0] + '?', a: tf(h2[1]), steps: ['The MVT needs $f$ continuous on $[a, b]$ and differentiable on $(a, b)$.', h2[2]], hint: 'Check continuity on the closed interval and differentiability inside it.', data: { k: 'tf' } };
  });

  G('ra.mvt-inequalities', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['K', 'K', 'delta']), R.pick(['K', 'delta', 'est']), R.pick(['K', 'est', 'mc']));
    var kd = R.pick(L === 1 ? ['sq', 'lin3'] : ['sq', 'cube', 'sqrt', 'recip', 'sin']), a, b, Kq, ftex, why;
    if (kd === 'sq') { a = R.int(-4, 1); b = a + R.int(2, 5); Kq = q(2 * M.max(M.abs(a), M.abs(b))); ftex = 'x^{2}'; why = '$|f\'(x)| = 2|x|$ is largest at the end farther from $0$: $' + T.num(Kq) + '$.'; }
    else if (kd === 'lin3') { a = R.int(-4, 1); b = a + R.int(2, 5); var m3 = R.nz(-5, 5); Kq = q(M.abs(m3)); ftex = T.lin(m3, 'x', R.int(-5, 5)); why = '$f\'(x) = ' + m3 + '$, so $K = ' + M.abs(m3) + '$.'; }
    else if (kd === 'cube') { a = R.int(-3, 0); b = a + R.int(2, 4); Kq = q(3 * M.max(a * a, b * b)); ftex = 'x^{3}'; why = '$|f\'(x)| = 3x^{2}$ is largest at the end farther from $0$: $' + T.num(Kq) + '$.'; }
    else if (kd === 'sqrt') { var sa = R.int(1, 4); a = sa * sa; b = a + R.int(2, 9); Kq = Q(1, 2 * sa); ftex = '\\sqrt{x}'; why = '$f\'(x) = \\frac{1}{2\\sqrt{x}}$ decreases, so it is largest at $x = ' + a + '$: $' + T.num(Kq) + '$.'; }
    else if (kd === 'recip') { a = R.int(1, 4); b = a + R.int(1, 5); Kq = Q(1, a * a); ftex = '\\frac{1}{x}'; why = '$|f\'(x)| = \\frac{1}{x^{2}}$ is largest at $x = ' + a + '$: $' + T.num(Kq) + '$.'; }
    else { var kk = R.int(2, 5); a = 0; b = R.int(1, 3); Kq = q(kk); ftex = '\\sin(' + kk + 'x)'; why = '$|f\'(x)| = ' + kk + '|\\cos(' + kk + 'x)| \\le ' + kk + '$, with equality at $x = 0$.'; }
    if (shape === 'K') return { q: 'Find the smallest $K$ such that the mean value theorem gives $|f(x) - f(y)| \\le K|x - y|$ for all $x, y$ in $[' + a + ', ' + b + ']$, where $f(x) = ' + ftex + '$. (That is, $K = \\max |f\'|$ on the interval.)', a: num(Kq.toPlain()),
      steps: ['By the MVT, $f(x) - f(y) = f\'(c)(x - y)$ for some $c$ between $x$ and $y$, so $K = \\max |f\'|$ works.', why, 'So $K = ' + T.num(Kq) + '$.'], hint: 'Where on the interval is $|f\'|$ largest?', data: { k: 'K', kind: kd, a: a, b: b, K: Kq.toPlain() } };
    if (shape === 'delta') { var e = epsPick(R, 1), d = q(e).div(Kq), Kc = Kq.eq(1) ? '' : T.num(Kq);
      return { q: 'On $[' + a + ', ' + b + ']$, $f(x) = ' + ftex + '$ satisfies $|f(x) - f(y)| \\le ' + Kc + '|x - y|$. What $\\delta$ does this bound give for uniform continuity with $\\varepsilon = ' + epsTex(e) + '$ (the largest $\\delta$ the bound justifies)?', a: num(d.toPlain()),
        steps: ['If $|x - y| < \\delta$, then $|f(x) - f(y)| \\le ' + Kc + '|x - y| < ' + Kc + '\\delta$.', 'This is at most $\\varepsilon$ when $\\delta \\le \\frac{\\varepsilon}{' + T.num(Kq) + '}$.', 'So $\\delta = \\frac{\\varepsilon}{K} = ' + T.num(d) + '$, the same for every point: $f$ is uniformly continuous.'], hint: 'Divide $\\varepsilon$ by $K$.', data: { k: 'delta', K: Kq.toPlain(), e: q(e).toPlain(), d: d.toPlain() } }; }
    if (shape === 'est') { var n = R.int(3, 12), k2 = R.int(1, 2 * n - 1), up = Q(k2, 2 * n);
      return { q: 'Use the mean value theorem for $\\sqrt{x}$ on $[' + (n * n) + ', ' + (n * n + k2) + ']$ to bound $\\sqrt{' + (n * n + k2) + '} - ' + n + '$ from above. What is the bound?', a: num(up.toPlain()),
        steps: ['$\\sqrt{' + (n * n + k2) + '} - \\sqrt{' + (n * n) + '} = \\frac{1}{2\\sqrt{c}} \\cdot ' + k2 + '$ for some $c$ in $(' + (n * n) + ', ' + (n * n + k2) + ')$.', 'Since $\\sqrt{c} > ' + n + '$, this is less than $\\frac{' + k2 + '}{2 \\cdot ' + n + '} = ' + T.num(up) + '$.', 'So $\\sqrt{' + (n * n + k2) + '} < ' + n + ' + ' + T.num(up) + ' \\approx ' + T.num(U.round(n + up.toNumber(), 4)) + '$ (the true value is about $' + T.num(U.round(M.sqrt(n * n + k2), 4)) + '$).'],
        hint: 'Bound $\\frac{1}{2\\sqrt{c}}$ using the smallest possible $c$.', data: { k: 'est', n: n, k2: k2, v: up.toPlain() } }; }
    return { q: 'Which inequality follows from the mean value theorem, using $|\\cos c| \\le 1$?', a: mc('$|\\sin x - \\sin y| \\le |x - y|$ for all $x, y$', ['$|\\sin x - \\sin y| \\le |x - y|^{2}$ for all $x, y$', '$|\\sin x| \\le |\\cos x|$ for all $x$', '$\\sin x - \\sin y = \\cos x - \\cos y$ for all $x, y$']),
      steps: ['$\\sin x - \\sin y = \\cos c\\,(x - y)$ for some $c$ between $x$ and $y$.', 'Since $|\\cos c| \\le 1$: $|\\sin x - \\sin y| \\le |x - y|$.'], hint: 'Apply the MVT to $\\sin$ on the interval between $x$ and $y$.', data: { k: 'mc' } };
  });

  G('ra.taylor-remainder', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bound', 'c']), R.pick(['nexp', 'bound', 'c']), R.pick(['nexp', 'nln', 'which']));
    if (shape === 'bound') { var fn = R.pick(['sin', 'cos']), x = q(R.pick(['1/2', '1/3', '1/10', '1/5', '1', '1/4', '2/3', '3/4', '1/6'])), n = R.int(2, 6), bd = x.pow(n + 1).div(fact(n + 1));
      return { q: 'Bound the error when $\\' + fn + ' x$ is approximated by its Maclaurin polynomial $P_{' + n + '}$ at $x = ' + T.num(x) + '$, using $|f^{(' + (n + 1) + ')}(c)| \\le 1$. Give the bound $\\frac{|x|^{' + (n + 1) + '}}{' + (n + 1) + '!}$ as a fraction.', a: num(bd.toPlain()),
        steps: ['Taylor\'s theorem: $R_{' + n + '}(x) = \\frac{f^{(' + (n + 1) + ')}(c)}{' + (n + 1) + '!}x^{' + (n + 1) + '}$ for some $c$ between $0$ and $x$.', 'Every derivative of $\\' + fn + '$ is $\\pm\\sin$ or $\\pm\\cos$, so $|f^{(' + (n + 1) + ')}(c)| \\le 1$.', '$|R_{' + n + '}| \\le \\frac{(' + T.num(x) + ')^{' + (n + 1) + '}}{' + fact(n + 1) + '} = ' + T.num(bd) + '$.'],
        hint: 'Use the $(n + 1)$st power and $(n + 1)!$.', data: { k: 'bound', x: x.toPlain(), n: n, v: bd.toPlain() } }; }
    if (shape === 'c') { var m = R.int(2, 9), xv = R.nz(-9, 9), c = Q(xv, m);
      return { q: 'For $f(x) = x^{' + m + '}$ and its Maclaurin polynomial $P_{' + (m - 2) + '}$ (which is $0$), Taylor\'s theorem says $f(' + xv + ') = P_{' + (m - 2) + '}(' + xv + ') + \\frac{f^{(' + (m - 1) + ')}(c)}{' + (m - 1) + '!}(' + xv + ')^{' + (m - 1) + '}$ for some $c$ between $0$ and $' + xv + '$. Find $c$.', a: num(c.toPlain()),
        steps: ['$f^{(' + (m - 1) + ')}(x) = ' + fact(m) + 'x$, so the remainder is $\\frac{' + fact(m) + 'c}{' + fact(m - 1) + '}x^{' + (m - 1) + '} = ' + m + 'c\\,x^{' + (m - 1) + '}$.', 'Set it equal to $f(' + xv + ') = (' + xv + ')^{' + m + '}$: $' + m + 'c = ' + xv + '$.', 'So $c = ' + T.num(c) + '$, which is indeed between $0$ and $' + xv + '$.'],
        hint: 'Compute the $(n + 1)$st derivative of $x^{' + m + '}$.', data: { k: 'c', m: m, x: xv, c: c.toPlain() } }; }
    if (shape === 'nexp') { var half = R.coin(), xv2 = half ? Q(1, 2) : q(1), Mb = half ? 2 : 3, e = epsPick(R, L), eq = q(e), n0 = firstN(function (n) { return q(Mb).mul(xv2.pow(n + 1)).div(fact(n + 1)).lt(eq); });
      return { q: 'Approximate $e^{' + T.num(xv2) + '}$ by the Maclaurin polynomial $P_n$ of $e^{x}$. Using $e^{c} < ' + Mb + '$ for $0 \\le c \\le ' + T.num(xv2) + '$, the error is less than $\\frac{' + Mb + '\\,(' + T.num(xv2) + ')^{n+1}}{(n + 1)!}$. Find an $n$ that makes this bound less than $' + epsTex(e) + '$. (Any such $n$ is right.)', a: multi([part('$n =$', anyN(n0))]),
        steps: ['The bound shrinks as $n$ grows, since $(n + 1)!$ grows faster than any power.', 'It first drops below $' + epsTex(e) + '$ at $n = ' + n0 + '$: $\\frac{' + Mb + '(' + T.num(xv2) + ')^{' + (n0 + 1) + '}}{' + fact(n0 + 1) + '} = ' + T.num(q(Mb).mul(xv2.pow(n0 + 1)).div(fact(n0 + 1))) + '$.', 'So $n = ' + n0 + '$ works, and any larger $n$ does too.'],
        hint: 'Try $n = 1, 2, 3, \\ldots$ until the bound is small enough.', data: { k: 'nexp', x: xv2.toPlain(), Mb: Mb, e: eq.toPlain(), n0: n0 } }; }
    if (shape === 'nln') { var e2 = epsPick(R, 2), eq2 = q(e2), x3 = q(R.pick(['1/2', '1/3', '1/4', '1/5', '1/10', '2/5'])), n2 = firstN(function (n) { return x3.pow(n + 1).div(n + 1).lt(eq2); });
      return { q: 'For $f(x) = \\ln(1 + x)$, $|f^{(n+1)}(c)| = \\frac{n!}{(1 + c)^{n+1}} \\le n!$ for $c \\ge 0$, so the Maclaurin error at $x = ' + T.num(x3) + '$ is at most $\\frac{(' + T.num(x3) + ')^{n+1}}{n + 1}$. Find an $n$ that makes this less than $' + epsTex(e2) + '$. (Any such $n$ is right.)', a: multi([part('$n =$', anyN(n2))]),
        steps: ['$|R_n| \\le \\frac{n!}{(n + 1)!}x^{n+1} = \\frac{x^{n+1}}{n + 1}$.', 'At $x = ' + T.num(x3) + '$ it first drops below $' + epsTex(e2) + '$ at $n = ' + n2 + '$: $\\frac{(' + T.num(x3) + ')^{' + (n2 + 1) + '}}{' + (n2 + 1) + '} = ' + T.num(x3.pow(n2 + 1).div(n2 + 1)) + '$.', 'So $n = ' + n2 + '$ works, and so does any larger $n$.'],
        hint: 'Evaluate the bound for $n = 1, 2, 3, \\ldots$', data: { k: 'nln', x: x3.toPlain(), e: eq2.toPlain(), n0: n2 } }; }
    return { q: 'In Taylor\'s theorem, the remainder after the degree-$n$ polynomial $P_n$ involves which derivative?', a: mc('$f^{(n+1)}(c)$ for some $c$ between $a$ and $x$', ['$f^{(n)}(c)$ for some $c$ between $a$ and $x$', '$f^{(n+1)}(a)$, at the center', '$f^{(n+1)}(x)$, at the point itself']),
      steps: ['$f(x) = P_n(x) + \\frac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$, with $c$ somewhere between $a$ and $x$.', 'The next derivative, at an unknown point; that is why we bound $|f^{(n+1)}|$ over the whole interval.'], hint: 'The remainder looks like the next term of the series.', data: { k: 'mc' } };
  });

// ---- 06-integral.js
  // ================================================================ Unit 6: The Riemann Integral
  // f(x) = A x^2 + B x + C (exact Q); sup and inf on [lo, hi]
  function quadF(A, B, C) { A = q(A); B = q(B); C = q(C); return function (x) { x = q(x); return A.mul(x).mul(x).add(B.mul(x)).add(C); }; }
  function quadSupInf(A, B, C, lo, hi) {
    var f = quadF(A, B, C), c = [q(lo), q(hi)]; A = q(A); B = q(B);
    if (!A.isZero()) { var v = B.neg().div(A.mul(2)); if (v.gt(lo) && v.lt(hi)) c.push(v); }
    var vals = c.map(f), mx = vals[0], mn = vals[0]; vals.forEach(function (y) { if (y.gt(mx)) mx = y; if (y.lt(mn)) mn = y; });
    return { sup: mx, inf: mn };
  }
  function partTex(P) { return '\\{' + P.map(function (x) { return T.num(x); }).join(', ') + '\\}'; }
  function darboux(A, B, C, P) { var U = Q(0), Lw = Q(0), rowsU = [], rowsL = []; for (var i = 1; i < P.length; i++) { var w = P[i].sub(P[i - 1]), si = quadSupInf(A, B, C, P[i - 1], P[i]); U = U.add(si.sup.mul(w)); Lw = Lw.add(si.inf.mul(w)); rowsU.push(si.sup); rowsL.push(si.inf); } return { U: U, L: Lw, Ms: rowsU, ms: rowsL }; }
  function quadTex(A, B, C) { return T.terms([[T.num(q(A)) === '1' ? 1 : T.num(q(A)) === '-1' ? -1 : q(A).isInt() ? q(A).toNumber() : T.num(q(A)), 'x^{2}'], [q(B).toNumber(), 'x'], [q(C).toNumber(), '']]); }
  function quadPlain(A, B, C) { return '(' + q(A).toPlain() + ')*x^2+(' + q(B).toPlain() + ')*x+(' + q(C).toPlain() + ')'; }
  function randPartition(R, a, b, k, step) { var pts = []; for (var x = q(a).add(step); x.lt(b); x = x.add(step)) pts.push(x); var inner = R.sample(pts, M.min(k - 1, pts.length)).sort(function (x, y) { return x.cmp(y); }); return [q(a)].concat(inner, [q(b)]); }

  G('ra.upper-lower-sums', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['mono', 'mono']), R.pick(['mono', 'nonmono', 'refine']), R.pick(['nonmono', 'refine', 'mc']));
    if (shape === 'mc') return { q: 'For a bounded $f$ on $[a, b]$ and any two partitions $P$ and $Q$, which inequality is always true?', a: mc('$L(f, P) \\le U(f, Q)$', ['$U(f, P) \\le L(f, Q)$', '$L(f, P) \\le L(f, Q)$', '$U(f, P) = U(f, Q)$']),
      steps: ['Use the common refinement $P \\cup Q$: refining raises lower sums and lowers upper sums.', 'So $L(f, P) \\le L(f, P \\cup Q) \\le U(f, P \\cup Q) \\le U(f, Q)$. Every lower sum is at most every upper sum.'], hint: 'Compare both with the common refinement $P \\cup Q$.', data: { k: 'mc' } };
    var A, B, C, a, b, P, tx;
    if (shape === 'mono' || shape === 'refine') { var kd = R.pick(['sq', 'lin', 'dec']); a = 0; b = R.int(2, 3);
      if (kd === 'sq') { A = 1; B = 0; C = R.int(0, 2); } else if (kd === 'lin') { A = 0; B = R.nz(-3, 3); C = R.int(-2, 4); } else { A = -1; B = 0; C = R.int(4, 9); }
      P = randPartition(R, a, b, shape === 'refine' ? 2 : R.int(3, 4), Q(1, 2)); }
    else { var cv = R.pick([Q(1, 2), Q(3, 2), q(1)]); a = 0; b = 2; A = R.pick([1, -1]); B = q(-2).mul(cv).mul(A); C = R.int(0, 3); P = [q(0), q(1), q(2)]; if (cv.isInt()) P = [q(0), Q(1, 2), Q(3, 2), q(2)]; }
    tx = quadTex(A, B, C);
    var D = darboux(A, B, C, P), f = quadF(A, B, C);
    if (shape === 'refine') { var mid = P[0].add(P[P.length - 1]).div(2); if (P.length !== 2) P = [P[0], P[P.length - 1]]; D = darboux(A, B, C, P); var P2 = [P[0], mid, P[1]], D2 = darboux(A, B, C, P2);
      return { q: 'Let $f(x) = ' + tx + '$ on $[' + T.num(P[0]) + ', ' + T.num(P[1]) + ']$. Compute $U(f, P)$ for $P = ' + partTex(P) + '$ and $U(f, P\')$ for the refinement $P\' = ' + partTex(P2) + '$.', a: multi([part('$U(f, P) =$', num(D.U.toPlain())), part('$U(f, P\') =$', num(D2.U.toPlain()))]),
        steps: ['With one piece, $U(f, P) = ' + T.num(D.Ms[0]) + ' \\cdot ' + T.num(P[1].sub(P[0])) + ' = ' + T.num(D.U) + '$ (the supremum of $f$ on the interval times its length).', 'With two pieces the suprema are $' + T.num(D2.Ms[0]) + '$ and $' + T.num(D2.Ms[1]) + '$, so $U(f, P\') = ' + T.num(D2.U) + '$.', 'Adding a point can only lower the upper sum (and raise the lower sum): $U(f, P\') \\le U(f, P)$.'],
        hint: 'On each piece, use the largest value of $f$ there.', data: { k: 'refine', A: q(A).toPlain(), B: q(B).toPlain(), C: q(C).toPlain(), P: P.map(String), U: D.U.toPlain(), U2: D2.U.toPlain() } }; }
    var lines = []; for (var i = 1; i < P.length; i++) lines.push('$[' + T.num(P[i - 1]) + ', ' + T.num(P[i]) + ']$: $M_' + i + ' = ' + T.num(D.Ms[i - 1]) + '$, $m_' + i + ' = ' + T.num(D.ms[i - 1]) + '$');
    return { q: 'Let $f(x) = ' + tx + '$ on $[' + T.num(P[0]) + ', ' + T.num(P[P.length - 1]) + ']$ and $P = ' + partTex(P) + '$. Find the upper sum $U(f, P)$ and the lower sum $L(f, P)$.', a: multi([part('$U(f, P) =$', num(D.U.toPlain())), part('$L(f, P) =$', num(D.L.toPlain()))]),
      steps: [shape === 'nonmono' ? 'The graph is a parabola with its vertex at $x = ' + T.num(q(B).neg().div(q(A).mul(2))) + '$; on the piece containing it, the ' + (q(A).sign() > 0 ? 'infimum' : 'supremum') + ' is at the vertex, not at an end.' : '$f$ is monotone on the interval, so on each piece the sup and inf are at the ends.', 'On each piece, $M_i = \\sup f$ and $m_i = \\inf f$: ' + lines.join('; ') + '.', '$U(f, P) = \\sum M_i \\Delta x_i = ' + T.num(D.U) + '$ and $L(f, P) = \\sum m_i \\Delta x_i = ' + T.num(D.L) + '$.'],
      hint: 'On each piece, find the largest and smallest values of $f$ (check for a turning point inside), then multiply by the width.', viz: L <= 2 ? { name: 'ra-sums', opts: { f: quadPlain(A, B, C), a: T.num(P[0]) === '0' ? 0 : P[0].toNumber(), b: P[P.length - 1].toNumber(), P: P.map(function (x) { return x.toNumber(); }), show: 'both', quiet: true, edit: false } } : undefined,
      data: { k: 'ul', A: q(A).toPlain(), B: q(B).toPlain(), C: q(C).toPlain(), P: P.map(String), U: D.U.toPlain(), L: D.L.toPlain() } };
  });

  var MONO = [['x^{2}', 'x^2', function (x) { return x.mul(x); }, [0, 3]], ['x^{3}', 'x^3', function (x) { return x.pow(3); }, [0, 2]], ['2x + 1', '2x+1', function (x) { return x.mul(2).add(1); }, [0, 4]], ['\\sqrt{x}', 'sqrt(x)', null, [0, 4]], ['\\frac{1}{x}', '1/x', function (x) { return q(1).div(x); }, [1, 3]], ['5 - x^{2}', '5-x^2', function (x) { return q(5).sub(x.mul(x)); }, [0, 2]]];
  G('ra.integrability-criterion', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['gap', 'gap', 'mc']), R.pick(['gap', 'smallN', 'nonmono']), R.pick(['smallN', 'nonmono', 'mc']));
    if (shape === 'gap' || shape === 'smallN') { var it = R.pick(MONO), a = it[3][0], b = it[3][1], fa, fb;
      if (it[2]) { fa = it[2](q(a)); fb = it[2](q(b)); } else { fa = q(M.sqrt(a)); fb = q(M.sqrt(b)); }
      var J = fb.sub(fa).abs().mul(b - a);
      if (shape === 'gap') { var n = R.int(3, 10), gap = J.div(n);
        return { q: '$f(x) = ' + it[0] + '$ is monotone on $[' + a + ', ' + b + ']$. For the partition into $n = ' + n + '$ equal pieces, find $U(f, P) - L(f, P)$.', a: num(gap.toPlain()),
          steps: ['For a monotone $f$, on each piece the sup and inf are the values at the two ends.', 'The differences telescope: $U - L = \\left(\\sum_i |f(x_i) - f(x_{i-1})|\\right)\\Delta x = |f(' + b + ') - f(' + a + ')| \\cdot \\frac{' + (b - a) + '}{' + n + '}$.', '$= ' + T.num(fb.sub(fa).abs()) + ' \\cdot \\frac{' + (b - a) + '}{' + n + '} = ' + T.num(gap) + '$.'],
          hint: 'The gap is a stack of thin rectangles whose heights add up to $|f(b) - f(a)|$.', viz: L === 1 ? { name: 'ra-sums', opts: { f: it[1], a: a, b: b, n: n, show: 'gap', quiet: true, edit: false } } : undefined, data: { k: 'gap', f: it[1], a: a, b: b, n: n, v: gap.toPlain() } }; }
      var e = q(R.pick(['0.1', '0.05', '0.01', '1/20', '1/50'])), n0 = J.div(e).floor().toNumber() + 1;
      return { q: '$f(x) = ' + it[0] + '$ is monotone on $[' + a + ', ' + b + ']$. Find an $n$ such that $n$ equal pieces give $U(f, P) - L(f, P) < ' + T.num(e) + '$. (Any such $n$ is right.)', a: multi([part('$n =$', anyN(n0))]),
        steps: ['For $n$ equal pieces, $U - L = |f(' + b + ') - f(' + a + ')| \\cdot \\frac{' + (b - a) + '}{n} = \\frac{' + T.num(J) + '}{n}$.'.replace('\\frac{' + T.num(J) + '}{n}', J.isInt() ? '\\frac{' + T.num(J) + '}{n}' : '\\frac{' + J.n + '}{' + J.d + 'n}'), 'We need $n > ' + T.num(J.div(e)) + '$, so the smallest is $n = ' + n0 + '$.', 'Any larger $n$ works too. Since this works for every $\\varepsilon$, $f$ is integrable.'],
        hint: 'Write $U - L$ as a formula in $n$.', data: { k: 'smallN', f: it[1], a: a, b: b, e: e.toPlain(), n0: n0 } }; }
    if (shape === 'nonmono') { var n2 = R.int(2, 5), c = R.int(1, 3), P = []; for (var i = 0; i <= n2; i++) P.push(Q(-c * n2 + 2 * c * i, n2)); var D = darboux(1, 0, 0, P);
      return { q: 'Let $f(x) = x^{2}$ on $[' + (-c) + ', ' + c + ']$, split into $n = ' + n2 + '$ equal pieces. Find $U(f, P) - L(f, P)$.', a: num(D.U.sub(D.L).toPlain()),
        steps: ['The points are $' + P.map(function (x) { return T.num(x); }).join(', ') + '$.', '$f$ decreases on $[' + (-c) + ', 0]$ and increases on $[0, ' + c + ']$' + (n2 % 2 ? '; the middle piece contains $0$, where the inf is $0$ and the sup is at an end.' : '; $0$ is a partition point, so each piece is monotone.'), 'Adding up $(M_i - m_i)\\Delta x$ over the pieces gives $U - L = ' + T.num(D.U.sub(D.L)) + '$.'],
        hint: 'On each piece, $M_i - m_i$ is the rise or fall of $f$ across it (watch the piece around $0$).', data: { k: 'nonmono', c: c, n: n2, v: D.U.sub(D.L).toPlain() } }; }
    return { q: 'Which statement is the integrability criterion for a bounded $f$ on $[a, b]$?', a: mc('$f$ is integrable exactly when for every $\\varepsilon > 0$ there is a partition $P$ with $U(f, P) - L(f, P) < \\varepsilon$.', ['$f$ is integrable when some partition $P$ has $U(f, P) - L(f, P) < 1$.', '$f$ is integrable when $U(f, P) = L(f, P)$ for some partition.', '$f$ is integrable when $U(f, P) - L(f, P) \\to 0$ for one sequence of partitions with $\\|P\\| \\to 0$ and $f$ is monotone.']),
      steps: ['The upper integral is the inf of the upper sums and the lower integral the sup of the lower sums; $f$ is integrable when they agree.', 'They agree exactly when the gap $U - L$ can be made smaller than every $\\varepsilon > 0$.'], hint: 'It has to work for every $\\varepsilon$.', data: { k: 'mc' } };
  });

  G('ra.integrable-functions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['dirichlet', 'jump']), R.pick(['jump', 'width', 'changed']), R.pick(['dirichlet', 'width', 'which']));
    if (shape === 'dirichlet') { var p = R.int(-2, 4), qq = R.intNot(-2, 4, p), a = R.int(-2, 1), b = a + R.int(1, 4), U = M.max(p, qq) * (b - a), Lw = M.min(p, qq) * (b - a);
      var parts = [part('every $U(f, P) =$', num(U)), part('every $L(f, P) =$', num(Lw))]; if (L === 3) parts.push(part('$f$ is integrable:', tf(false)));
      return { q: 'Let $f(x) = ' + p + '$ for rational $x$ and $f(x) = ' + qq + '$ for irrational $x$, on $[' + a + ', ' + b + ']$. What are the upper and lower sums for any partition $P$?' + (L === 3 ? ' Is $f$ integrable?' : ''), a: multi(parts),
        steps: ['Every piece of a partition contains both rationals and irrationals, so on each piece $M_i = ' + M.max(p, qq) + '$ and $m_i = ' + M.min(p, qq) + '$.', 'So every $U(f, P) = ' + M.max(p, qq) + ' \\cdot ' + (b - a) + ' = ' + U + '$ and every $L(f, P) = ' + M.min(p, qq) + ' \\cdot ' + (b - a) + ' = ' + Lw + '$.', 'The gap $' + (U - Lw) + '$ never shrinks, so $f$ is not integrable.'],
        hint: 'What are the sup and inf of $f$ on any interval?', data: { k: 'dir', p: p, q: qq, a: a, b: b } }; }
    if (shape === 'jump' || shape === 'width') { var c1 = R.int(-2, 3), c2 = R.intNot(-2, 5, c1), s = R.int(1, 3), Jv = M.abs(c2 - c1);
      if (shape === 'jump') { var w = q(R.pick(['1/2', '1/4', '1/10', '0.2', '1/3'])), P = [q(0), q(s).sub(w.div(2)), q(s).add(w.div(2)), q(4)];
        return { q: 'Let $f(x) = ' + c1 + '$ for $x < ' + s + '$ and $f(x) = ' + c2 + '$ for $x \\ge ' + s + '$, on $[0, 4]$. For $P = ' + partTex(P) + '$, find $U(f, P) - L(f, P)$.', a: num(Jv * w.toNumber() === 0 ? '0' : w.mul(Jv).toPlain()),
          steps: ['On the pieces that do not contain $' + s + '$, $f$ is constant, so $M_i = m_i$ there.', 'The middle piece contains the jump: $M - m = ' + Jv + '$, and its width is $' + T.num(w) + '$.', 'So $U - L = ' + Jv + ' \\cdot ' + T.num(w) + ' = ' + T.num(w.mul(Jv)) + '$. A thinner middle piece makes it as small as you like: $f$ is integrable.'],
          hint: 'Only the piece containing the jump contributes.', viz: L === 1 ? { name: 'ra-sums', opts: { jump: { at: s, left: c1, right: c2 }, a: 0, b: 4, P: P.map(function (x) { return x.toNumber(); }), show: 'gap', quiet: true, edit: false } } : undefined, data: { k: 'jump', c1: c1, c2: c2, s: s, w: w.toPlain() } }; }
      var e = q(R.pick(['0.1', '0.01', '1/20', '0.05'])), wmax = e.div(Jv), v = wmax.div(2);
      return { q: 'Let $f(x) = ' + c1 + '$ for $x < ' + s + '$ and $f(x) = ' + c2 + '$ for $x \\ge ' + s + '$, on $[0, 4]$. A partition puts $' + s + '$ inside one piece of width $w$ and nowhere else. Give a width $w$ that makes $U(f, P) - L(f, P) < ' + T.num(e) + '$. (Any such $w$ is right.)', a: { t: 'num', v: v.toPlain(), satisfies: { min: 0, minOpen: true, max: wmax.toPlain(), maxOpen: true } },
        steps: ['Only the piece containing the jump contributes: $U - L = ' + T.coef(Jv, 'w') + '$.', 'We need $' + T.coef(Jv, 'w') + ' < ' + T.num(e) + '$, so $w < ' + T.num(wmax) + '$ (strictly).', 'Any $w$ with $0 < w < ' + T.num(wmax) + '$ works, for example $' + T.num(v) + '$.'],
        hint: 'Write $U - L$ in terms of $w$.', data: { k: 'width', J: Jv, e: e.toPlain(), wmax: wmax.toPlain() } }; }
    if (shape === 'changed') { var k = R.int(1, 3), a2 = 0, b2 = R.int(1, 3), I = q(b2).pow(k + 1).div(k + 1), pts = R.sample([Q(1, 2), q(1), Q(1, 3), Q(3, 2), q(2)], 2).filter(function (x) { return x.le(b2); });
      return { q: 'Let $g(x) = x^{' + k + '}$ on $[0, ' + b2 + ']$, except that $g$ is changed to $100$ at ' + (pts.length ? pts.map(function (x) { return '$x = ' + T.num(x) + '$'; }).join(' and ') : '$x = ' + b2 + '$') + '. Find $\\int_0^{' + b2 + '} g(x)\\,dx$.', a: num(I.toPlain()),
        steps: ['Changing a function at finitely many points does not change its integral: those points sit in pieces whose total width can be made as small as you like, so they change $U - L$ by as little as you like.', 'So $\\int_0^{' + b2 + '} g = \\int_0^{' + b2 + '} x^{' + k + '}\\,dx = \\frac{' + b2 + '^{' + (k + 1) + '}}{' + (k + 1) + '} = ' + T.num(I) + '$.'],
        hint: 'Do a few changed values matter for the integral?', data: { k: 'changed', kk: k, b: b2, v: I.toPlain() } }; }
    var items = [['$f(x) = x^{2}$ on $[0, 1]$', 1], ['a monotone function on $[0, 1]$', 1], ['a step function with three jumps on $[0, 3]$', 1], ['$f = 1$ on the rationals and $0$ on the irrationals in $[0, 1]$', 0], ['Thomae\'s function on $[0, 1]$', 1], ['$f(x) = \\frac{1}{x}$ on $(0, 1]$, with $f(0) = 0$', 0], ['$f(x) = \\sin\\frac{1}{x}$ on $(0, 1]$, with $f(0) = 0$', 1]], pick = R.sample(items, 5);
    if (!pick.some(function (x) { return !x[1]; })) pick[4] = items[3];
    var good = []; pick.forEach(function (x, i) { if (x[1]) good.push(i); });
    return { q: 'Which of these functions are Riemann integrable on the interval? Select all that apply.', a: mcAll(pick.map(function (x) { return cap(x[0]); }), good),
      steps: ['Integrable: continuous, monotone, and bounded with finitely many discontinuities ($\\sin\\frac{1}{x}$ is bounded with one bad point); Thomae\'s function too (its discontinuities, the rationals, are small enough).', 'Not integrable: Dirichlet\'s function, whose upper sums are all $1$ and lower sums all $0$, and unbounded functions like $\\frac{1}{x}$ near $0$ (Riemann integrability needs boundedness).'],
      hint: 'Is it bounded? How bad are its discontinuities?', data: { k: 'mc' } };
  });

  G('ra.integral-properties', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bounds', 'avg']), R.pick(['bounds', 'mvtc', 'abs']), R.pick(['mvtc', 'abs', 'bounds']));
    if (shape === 'bounds') { var h = R.int(0, 3), k = R.int(1, 5), up = R.coin(), A = up ? -1 : 1, B = -2 * A * h, C = A * h * h + (up ? k + 4 : k), a = h - R.int(1, 2), b = h + R.int(1, 3), si = quadSupInf(A, B, C, a, b), lo = si.inf.mul(b - a), hi = si.sup.mul(b - a);
      return { q: 'Without integrating, use $m(b - a) \\le \\int_a^b f \\le M(b - a)$ (with $m$ and $M$ the minimum and maximum of $f$ on the interval) to bound $\\int_{' + a + '}^{' + b + '} \\left(' + quadTex(A, B, C) + '\\right) dx$.', a: multi([part('lower bound:', num(lo.toPlain())), part('upper bound:', num(hi.toPlain()))]),
        steps: ['The parabola has its vertex at $x = ' + h + '$, inside $[' + a + ', ' + b + ']$.', 'So $m = ' + T.num(si.inf) + '$ and $M = ' + T.num(si.sup) + '$ (compare the vertex with both ends).', 'The bounds are $' + T.num(si.inf) + ' \\cdot ' + (b - a) + ' = ' + T.num(lo) + '$ and $' + T.num(si.sup) + ' \\cdot ' + (b - a) + ' = ' + T.num(hi) + '$.'],
        hint: 'Find the true minimum and maximum on the interval, not just the values at the ends.', data: { k: 'bounds', A: A, B: B, C: C, a: a, b: b, lo: lo.toPlain(), hi: hi.toPlain() } }; }
    if (shape === 'avg') { var p = R.int(1, 3), b2 = R.int(1, 4), av = q(b2).pow(p).div(p + 1);
      return { q: 'Find the average value $\\frac{1}{b - a}\\int_a^b f$ of $f(x) = x^{' + p + '}$ on $[0, ' + b2 + ']$.'.replace('x^{1}', 'x'), a: num(av.toPlain()),
        steps: ['$\\int_0^{' + b2 + '} x^{' + p + '}\\,dx = \\frac{' + b2 + '^{' + (p + 1) + '}}{' + (p + 1) + '}$.'.replace('x^{1}', 'x'), 'Divide by the length $' + b2 + '$: $\\frac{' + b2 + '^{' + p + '}}{' + (p + 1) + '} = ' + T.num(av) + '$.', 'By the mean value theorem for integrals, $f$ takes this value somewhere in $[0, ' + b2 + ']$.'],
        hint: 'Integrate, then divide by the length of the interval.', data: { k: 'avg', p: p, b: b2, v: av.toPlain() } }; }
    if (shape === 'mvtc') { var b3 = R.int(1, 6), quadK = R.coin(), c, ctex, cplain, avg;
      if (quadK) { avg = Q(b3 * b3, 3); var s = surd(avg); ctex = s.tex; cplain = s.plain; c = s.val; }
      else { var a3 = R.int(-3, 2); b3 = a3 + R.int(1, 5); var m = R.nz(-3, 3), d = R.int(-4, 4); avg = q(m * (a3 + b3)).div(2).add(d); var cq = Q(a3 + b3, 2); ctex = T.num(cq); cplain = cq.toPlain(); }
      return quadK ? { q: 'The mean value theorem for integrals gives $c$ in $[0, ' + b3 + ']$ with $f(c) = \\frac{1}{' + b3 + '}\\int_0^{' + b3 + '} f$. Find $c$ for $f(x) = x^{2}$.', a: num(cplain),
        steps: ['The average value is $\\frac{1}{' + b3 + '} \\cdot \\frac{' + b3 + '^{3}}{3} = ' + T.num(avg) + '$.', 'Solve $c^{2} = ' + T.num(avg) + '$ with $c \\ge 0$: $c = ' + ctex + '$.', 'It is in $[0, ' + b3 + ']$, as the theorem promises.'], hint: 'Find the average value, then the point $c$ where $f$ equals it.', data: { k: 'mvtc', b: b3, c: cplain } }
        : { q: 'Find $c$ in $[' + a3 + ', ' + b3 + ']$ with $f(c)$ equal to the average value of $f(x) = ' + T.lin(m, 'x', d) + '$ on $[' + a3 + ', ' + b3 + ']$.', a: num(cplain),
        steps: ['The average value of a linear function is its value at the midpoint: $' + T.num(avg) + '$.', '$' + T.lin(m, 'c', d) + ' = ' + T.num(avg) + '$ gives $c = ' + ctex + '$, the midpoint.'], hint: 'For a line, the average is the value at the midpoint.', data: { k: 'mvtcl', m: m, d: d, a: a3, b: b3, c: cplain } }; }
    var k4 = R.int(1, 3), a4 = -R.int(1, 3), b4 = R.int(1, 4), I = Q(b4 * b4 - a4 * a4, 2).sub(k4 * (b4 - a4)), absI;
    var f2 = function (x) { return q(x).mul(x).div(2).sub(q(k4).mul(x)); }, z = q(k4);
    if (z.gt(a4) && z.lt(b4)) absI = f2(z).sub(f2(a4)).abs().add(f2(b4).sub(f2(z)).abs()); else absI = I.abs();
    return { q: 'For $f(x) = x - ' + k4 + '$ on $[' + a4 + ', ' + b4 + ']$, compute $\\left|\\int f\\right|$ and $\\int |f|$. (The inequality $\\left|\\int f\\right| \\le \\int |f|$ says the first is never bigger.)', a: multi([part('$\\left|\\int f\\right| =$', num(I.abs().toPlain())), part('$\\int |f| =$', num(absI.toPlain()))]),
      steps: ['$\\int_{' + a4 + '}^{' + b4 + '} (x - ' + k4 + ')\\,dx = \\left[\\frac{x^{2}}{2} - ' + T.coef(k4, 'x') + '\\right]_{' + a4 + '}^{' + b4 + '} = ' + T.num(I) + '$, so $\\left|\\int f\\right| = ' + T.num(I.abs()) + '$.', (z.gt(a4) && z.lt(b4)) ? 'For $\\int |f|$, split at $x = ' + k4 + '$, where $f$ changes sign, and add the areas: $' + T.num(f2(z).sub(f2(a4)).abs()) + ' + ' + T.num(f2(b4).sub(f2(z)).abs()) + ' = ' + T.num(absI) + '$.' : '$f$ does not change sign on the interval, so $\\int |f| = ' + T.num(absI) + '$.', 'Positive and negative parts cancel in $\\int f$ but not in $\\int |f|$.'],
      hint: 'For $\\int |f|$, split the interval where $f$ changes sign.', data: { k: 'abs', kk: k4, a: a4, b: b4, I: I.abs().toPlain(), A: absI.toPlain() } };
  });

  G('ra.ftc', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['Fval', 'chain']), R.pick(['Fval', 'onesided', 'chain']), R.pick(['onesided', 'lip', 'mc']));
    if (shape === 'Fval' || shape === 'onesided') { var c1 = R.int(-2, 3), c2 = R.intNot(-2, 4, c1), s = R.int(1, 3), x0 = q(R.pick([s + 1, s + 2, s - 1 > 0 ? s - 1 : s + 1, Q(2 * s + 1, 2)]));
      var F = function (x) { x = q(x); return x.le(s) ? x.mul(c1) : q(s * c1).add(x.sub(s).mul(c2)); };
      if (shape === 'Fval') return { q: 'Let $f(t) = ' + c1 + '$ for $t < ' + s + '$ and $f(t) = ' + c2 + '$ for $t \\ge ' + s + '$, and $F(x) = \\int_0^x f(t)\\,dt$. Find $F(' + T.num(x0) + ')$.', a: num(F(x0).toPlain()),
        steps: [x0.le(s) ? 'For $x \\le ' + s + '$, $F(x) = ' + (c1 ? T.coef(c1, 'x') : '0') + '$.' : 'For $x > ' + s + '$, $F(x) = ' + c1 + ' \\cdot ' + s + T.coef(c2, '(x - ' + s + ')', false) + '$: the area up to $' + s + '$ plus the area after it.', 'So $F(' + T.num(x0) + ') = ' + T.num(F(x0)) + '$.', '$F$ is continuous even though $f$ jumps: a jump in $f$ makes a corner in $F$.'],
        hint: 'Add the signed areas of the rectangles from $0$ to $x$.', viz: L === 1 ? { name: 'ftc', opts: { f: '(' + c1 + ')+(' + (c2 - c1) + ')*(sign(x-' + s + ')+1)/2', a: 0, x: x0.toNumber(), xmin: -0.5, xmax: 5, quiet: true } } : undefined, data: { k: 'Fval', c1: c1, c2: c2, s: s, x0: x0.toPlain(), v: F(x0).toPlain() } };
      return { q: 'Let $f(t) = ' + c1 + '$ for $t < ' + s + '$ and $f(t) = ' + c2 + '$ for $t \\ge ' + s + '$, and $F(x) = \\int_0^x f(t)\\,dt$. Find the left-hand and right-hand derivatives of $F$ at $x = ' + s + '$.', a: multi([part('left-hand:', num(c1)), part('right-hand:', num(c2))]),
        steps: ['For $h < 0$: $\\frac{F(' + s + ' + h) - F(' + s + ')}{h} = \\frac{1}{h}\\int_{' + s + '}^{' + s + ' + h} f = ' + c1 + '$.', 'For $h > 0$: the quotient is $' + c2 + '$.', 'They differ, so $F\'(' + s + ')$ does not exist: the FTC gives $F\' = f$ only where $f$ is continuous.'],
        hint: 'Near $' + s + '$, $F$ is linear on each side.', data: { k: 'Fone', c1: c1, c2: c2, s: s } }; }
    if (shape === 'chain') { var kd = R.pick(['sq', 'cube', 'lin']), p = R.int(1, 5), x0c = R.nz(-2, 2), g, gp, gtex, val;
      if (kd === 'sq') { g = x0c * x0c; gp = 2 * x0c; gtex = 'x^{2}'; } else if (kd === 'cube') { g = x0c * x0c * x0c; gp = 3 * x0c * x0c; gtex = 'x^{3}'; } else { var m = R.nz(-3, 3); g = m * x0c; gp = m; gtex = T.lin(m, 'x', 0); }
      val = (g * g + p) * gp;
      return { q: 'Let $G(x) = \\int_{1}^{' + gtex + '} (t^{2} + ' + p + ')\\,dt$. Find $G\'(' + x0c + ')$.'.replace(' + 0)', ')'), a: num(val),
        steps: ['By the FTC and the chain rule, $G\'(x) = (g(x)^{2} + ' + p + ')\\,g\'(x)$ with $g(x) = ' + gtex + '$.'.replace(' + 0)', ')'), 'At $x = ' + x0c + '$: $g = ' + g + '$ and $g\' = ' + gp + '$.', '$G\'(' + x0c + ') = (' + (g * g) + ' + ' + p + ')(' + gp + ') = ' + val + '$.'.replace(' + 0)', ')')],
        hint: 'Differentiate the upper limit too.', data: { k: 'chain', kind: kd, p: p, x0: x0c, v: val } }; }
    if (shape === 'lip') { var A = R.pick([1, -1]), h = R.int(-2, 2), C = R.int(-3, 3), a = h - R.int(1, 3), b = h + R.int(1, 3), si = quadSupInf(A, -2 * A * h, A * h * h + C, a, b), Mx = qmax(si.sup.abs(), si.inf.abs());
      return { q: 'Let $F(x) = \\int_{' + a + '}^{x} f(t)\\,dt$ with $f(t) = ' + quadTex(A, -2 * A * h, A * h * h + C).replace(/x/g, 't') + '$ on $[' + a + ', ' + b + ']$. The proof of continuity of $F$ gives $|F(x) - F(y)| \\le M|x - y|$ with $M = \\sup |f|$. Find this $M$.', a: num(Mx.toPlain()),
        steps: ['$|F(x) - F(y)| = \\left|\\int_y^x f\\right| \\le \\sup|f| \\cdot |x - y|$.', 'On $[' + a + ', ' + b + ']$, $f$ ranges from $' + T.num(si.inf) + '$ to $' + T.num(si.sup) + '$.', 'So $M = \\max(|' + T.num(si.inf) + '|, |' + T.num(si.sup) + '|) = ' + T.num(Mx) + '$.'],
        hint: 'Find the largest size of $f$ on the interval.', data: { k: 'lip', A: A, h: h, C: C, a: a, b: b, M: Mx.toPlain() } }; }
    return { q: 'In the proof that $F\'(c) = f(c)$ when $f$ is continuous at $c$, which estimate is the key step?', a: mc('$\\left|\\frac{F(c + h) - F(c)}{h} - f(c)\\right| = \\left|\\frac{1}{h}\\int_c^{c+h} (f(t) - f(c))\\,dt\\right| < \\varepsilon$ once $|h| < \\delta$', ['$F(c + h) - F(c) = f(c + h) - f(c)$', '$\\int_c^{c+h} f(t)\\,dt = f(c)$ for every $h$', '$F$ is continuous, so $F\'(c) = f(c)$']),
      steps: ['Write the difference quotient as an average of $f$ over $[c, c + h]$, minus $f(c)$.', 'Continuity at $c$ makes $|f(t) - f(c)| < \\varepsilon$ for $|t - c| < \\delta$, and an average of numbers smaller than $\\varepsilon$ is smaller than $\\varepsilon$.'], hint: 'The difference quotient of $F$ is an average of $f$.', data: { k: 'mc' } };
  });

  var RSUM = [
    ['\\frac{1}{n}\\sum_{k=1}^{n} \\left(\\frac{k}{n}\\right)^{2}', '1/3', '\\int_0^1 x^{2}\\,dx', 'the function is $x^{2}$ on $[0, 1]$'],
    ['\\frac{1}{n}\\sum_{k=1}^{n} \\left(\\frac{k}{n}\\right)^{3}', '1/4', '\\int_0^1 x^{3}\\,dx', 'the function is $x^{3}$ on $[0, 1]$'],
    ['\\sum_{k=1}^{n} \\frac{k}{n^{2}}', '1/2', '\\int_0^1 x\\,dx', '$\\frac{k}{n^{2}} = \\frac{k}{n} \\cdot \\frac{1}{n}$, so the function is $x$ on $[0, 1]$'],
    ['\\sum_{k=1}^{n} \\frac{1}{n + k}', 'ln(2)', '\\int_0^1 \\frac{1}{1 + x}\\,dx', '$\\frac{1}{n + k} = \\frac{1}{1 + k/n} \\cdot \\frac{1}{n}$, so the function is $\\frac{1}{1 + x}$ on $[0, 1]$'],
    ['\\sum_{k=1}^{2n} \\frac{1}{n + k}', 'ln(3)', '\\int_0^2 \\frac{1}{1 + x}\\,dx', 'the function is $\\frac{1}{1 + x}$, and the $2n$ pieces of width $\\frac{1}{n}$ cover $[0, 2]$'],
    ['\\sum_{k=1}^{n} \\frac{n}{n^{2} + k^{2}}', 'pi/4', '\\int_0^1 \\frac{1}{1 + x^{2}}\\,dx', '$\\frac{n}{n^{2} + k^{2}} = \\frac{1}{1 + (k/n)^{2}} \\cdot \\frac{1}{n}$, so the function is $\\frac{1}{1 + x^{2}}$ on $[0, 1]$'],
    ['\\sum_{k=1}^{n} \\frac{k}{n^{2} + k^{2}}', 'ln(2)/2', '\\int_0^1 \\frac{x}{1 + x^{2}}\\,dx', '$\\frac{k}{n^{2} + k^{2}} = \\frac{k/n}{1 + (k/n)^{2}} \\cdot \\frac{1}{n}$, so the function is $\\frac{x}{1 + x^{2}}$ on $[0, 1]$'],
    ['\\frac{1}{n}\\sum_{k=1}^{n} \\sin\\left(\\frac{k\\pi}{n}\\right)', '2/pi', '\\int_0^1 \\sin(\\pi x)\\,dx', 'the function is $\\sin(\\pi x)$ on $[0, 1]$'],
    ['\\frac{1}{n}\\sum_{k=1}^{n} e^{k/n}', 'e-1', '\\int_0^1 e^{x}\\,dx', 'the function is $e^{x}$ on $[0, 1]$'],
    ['\\frac{1}{n}\\sum_{k=1}^{n} \\sqrt{\\frac{k}{n}}', '2/3', '\\int_0^1 \\sqrt{x}\\,dx', 'the function is $\\sqrt{x}$ on $[0, 1]$'],
    ['\\frac{1}{n}\\sum_{k=1}^{n} \\left(\\frac{k}{n}\\right)^{4}', '1/5', '\\int_0^1 x^{4}\\,dx', 'the function is $x^{4}$ on $[0, 1]$'],
    ['\\sum_{k=1}^{n} \\frac{k^{2}}{n^{3}}', '1/3', '\\int_0^1 x^{2}\\,dx', '$\\frac{k^{2}}{n^{3}} = \\left(\\frac{k}{n}\\right)^{2} \\cdot \\frac{1}{n}$, so the function is $x^{2}$ on $[0, 1]$']];
  G('ra.riemann-sum-limits', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['value', 'match']), R.pick(['value', 'value', 'match']), R.pick(['value', 'scaled']));
    var it = R.pick(L === 1 ? [RSUM[0], RSUM[1], RSUM[2], RSUM[9], RSUM[10], RSUM[11]] : RSUM);
    if (shape === 'match') { var others = R.sample(RSUM.filter(function (x) { return x[2] !== it[2]; }), 3).map(function (x) { return '$' + x[2] + '$'; });
      return { q: 'Which integral equals $' + LIMN + ' ' + it[0] + '$?', a: mc('$' + it[2] + '$', others), steps: ['Write the sum as $\\sum f(x_k)\\,\\Delta x$ with $x_k = \\frac{k}{n}$ and $\\Delta x = \\frac{1}{n}$.', 'It is a Riemann sum for $' + it[2] + '$, and Riemann sums of a continuous function converge to its integral.'], hint: 'Spot $\\frac{k}{n}$ (the sample point) and $\\frac{1}{n}$ (the width).', data: { k: 'mc' } }; }
    if (shape === 'scaled') it = R.pick(RSUM.filter(function (x) { return /^[\d\/]+$|^ln\(\d\)$|^e-1$/.test(x[1]); }));
    var c = shape === 'scaled' ? R.int(2, 5) : 1, v = c === 1 ? it[1] : /^[\d\/]+$/.test(it[1]) ? q(it[1]).mul(c).toPlain() : it[1] === 'e-1' ? c + '*(e-1)' : c + '*' + it[1];
    return { q: 'Find $' + LIMN + ' ' + (c === 1 ? '' : c) + it[0] + '$' + (c === 1 ? '' : ' (note the factor $' + c + '$ in front)') + '.', a: num(v),
      steps: ['Write it as a Riemann sum $\\sum f(x_k)\\,\\Delta x$ with $x_k = \\frac{k}{n}$ and $\\Delta x = \\frac{1}{n}$: ' + it[3] + '.', 'The function is continuous, hence integrable, so the sums converge to $' + it[2] + ' = ' + tex(it[1]) + '$.', c === 1 ? 'So the limit is $' + tex(it[1]) + '$.' : 'With the factor $' + c + '$: $' + tex(v) + '$.'],
      hint: 'Factor out $\\frac{1}{n}$ and write the rest as a function of $\\frac{k}{n}$.', data: { k: 'value', sum: it[0], v: v } };
  });

// ---- 07-functions.js
  // ================================================================ Unit 7: Sequences and Series of Functions
  var PW = [
    { tex: 'x^{n}', dom: '[0, 1]', plain: 'x^n', xs: [['\\frac{1}{2}', '0'], ['\\frac{9}{10}', '0'], ['1', '1'], ['0', '0'], ['\\frac{1}{3}', '0'], ['\\frac{3}{4}', '0']], jumps: ['1'], why: 'For $0 \\le x < 1$, $x^{n} \\to 0$; at $x = 1$, every term is $1$.', f: 'f(x) = 0 for $0 \\le x < 1$ and $f(1) = 1$' },
    { tex: '\\frac{x^{n}}{1 + x^{n}}', dom: '[0, \\infty)', plain: 'x^n/(1+x^n)', xs: [['\\frac{1}{2}', '0'], ['1', '1/2'], ['2', '1'], ['3', '1'], ['0', '0'], ['\\frac{9}{10}', '0'], ['5', '1']], jumps: ['1'], why: 'For $x < 1$, $x^{n} \\to 0$, so $f(x) = 0$; at $x = 1$ every term is $\\frac{1}{2}$; for $x > 1$, divide by $x^{n}$: $\\frac{1}{x^{-n} + 1} \\to 1$.', f: 'f = 0, \\frac{1}{2}, 1 on x < 1, x = 1, x > 1' },
    { tex: '\\frac{nx}{1 + nx}', dom: '[0, \\infty)', plain: 'n*x/(1+n*x)', xs: [['0', '0'], ['\\frac{1}{10}', '1'], ['5', '1'], ['\\frac{1}{100}', '1'], ['2', '1']], jumps: ['0'], why: 'At $x = 0$ every term is $0$. For $x > 0$, divide by $nx$: $\\frac{1}{1/(nx) + 1} \\to 1$.' },
    { tex: '\\left(1 + \\frac{x}{n}\\right)^{n}', dom: '\\mathbb{R}', plain: '(1+x/n)^n', xs: [['1', 'e'], ['2', 'e^2'], ['-1', 'e^(-1)'], ['0', '1'], ['3', 'e^3'], ['-2', 'e^(-2)']], jumps: [], why: 'This is the classic limit $\\left(1 + \\frac{x}{n}\\right)^{n} \\to e^{x}$.' },
    { tex: '\\sqrt{x^{2} + \\frac{1}{n}}', dom: '\\mathbb{R}', plain: 'sqrt(x^2+1/n)', xs: [['3', '3'], ['-2', '2'], ['0', '0'], ['-5', '5'], ['4', '4'], ['-1', '1']], jumps: [], why: 'As $\\frac{1}{n} \\to 0$, $\\sqrt{x^{2} + \\frac{1}{n}} \\to \\sqrt{x^{2}} = |x|$.' },
    { tex: 'nxe^{-nx}', dom: '[0, \\infty)', plain: 'n*x*e^(-n*x)', xs: [['1', '0'], ['\\frac{1}{2}', '0'], ['0', '0']], jumps: [], why: 'At $x = 0$ every term is $0$; for $x > 0$, the exponential $e^{-nx}$ beats the factor $n$, so the terms go to $0$.' },
    { tex: '\\arctan(nx)', dom: '\\mathbb{R}', plain: 'atan(n*x)', xs: [['1', 'pi/2'], ['-3', '-pi/2'], ['0', '0'], ['\\frac{1}{100}', 'pi/2'], ['-\\frac{1}{2}', '-pi/2'], ['5', 'pi/2']], jumps: ['0'], why: 'For $x > 0$, $nx \\to \\infty$ and $\\arctan \\to \\frac{\\pi}{2}$; for $x < 0$ it tends to $-\\frac{\\pi}{2}$; at $0$ every term is $0$.' },
    { tex: '(1 - x^{2})^{n}', dom: '[-1, 1]', plain: '(1-x^2)^n', xs: [['0', '1'], ['\\frac{1}{2}', '0'], ['-1', '0'], ['\\frac{9}{10}', '0'], ['-\\frac{1}{3}', '0']], jumps: ['0'], why: 'At $x = 0$ every term is $1$. For $0 < |x| \\le 1$, $0 \\le 1 - x^{2} < 1$, so the powers go to $0$.' }];
  G('ra.pointwise-convergence', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['value', 'value', 'cont']), R.pick(['value', 'jumps', 'cont']), R.pick(['jumps', 'value', 'mc']));
    var it = R.pick(shape === 'jumps' || shape === 'cont' ? PW.filter(function (x, i) { return i !== 5 || shape === 'cont'; }) : PW);
    if (shape === 'value') { var xv = R.pick(it.xs), cm = R.pick([1, 1, 2, 3, 4, 5]), vv = cm === 1 ? xv[1] : xv[1] === '0' ? '0' : cm + '*(' + xv[1] + ')', ftx = cm === 1 ? it.tex : cm + (/^\\\\left|^\(|^x|^n/.test(it.tex) ? '' : '\\,') + it.tex;
      return { q: 'Let $f_n(x) = ' + ftx + '$ on $' + it.dom + '$. Find the pointwise limit $f(' + xv[0] + ') = ' + LIMN + ' f_n(' + xv[0] + ')$.', a: num(vv),
        steps: ['Fix $x = ' + xv[0] + '$ and let $n \\to \\infty$.', it.why + (cm === 1 ? '' : ' The constant factor $' + cm + '$ comes along.'), 'So $f(' + xv[0] + ') = ' + tex(vv) + '$.'], hint: 'Treat $x$ as a fixed number; only $n$ moves.', viz: L === 1 && it.plain.indexOf('atan') < 0 ? { name: 'ra-unifband', opts: { fn: it.plain, f: null, n: 4, nmax: 30, xmin: it.dom === '\\mathbb{R}' ? -3 : it.dom === '[-1, 1]' ? -1 : 0, xmax: it.dom === '[0, 1]' ? 1 : it.dom === '[-1, 1]' ? 1 : 3, quiet: true, edit: false } } : undefined, data: { k: 'value', f: it.plain, x: xv[0], v: vv, c: cm } }; }
    if (shape === 'jumps') { var J = it.jumps;
      return { q: 'Let $f_n(x) = ' + it.tex + '$ on $' + it.dom + '$. Each $f_n$ is continuous. At which points is the pointwise limit $f$ discontinuous? Give the set (type "none" if there are none).', a: setA(J),
        steps: [it.why, J.length ? 'The limit jumps at $x = ' + J.join(', ') + '$: nearby points have a different limit value.' : 'The limit is a continuous function.', J.length ? 'So the set is $\\{' + J.join(', ') + '\\}$: a pointwise limit of continuous functions need not be continuous.' : 'So there are no such points.'],
        hint: 'Find $f(x)$ for each kind of $x$, then look for jumps.', data: { k: 'jumps', f: it.plain, J: J } }; }
    if (shape === 'cont') { var c = it.jumps.length === 0;
      return { q: 'Let $f_n(x) = ' + it.tex + '$ on $' + it.dom + '$. Is the pointwise limit $f$ continuous on $' + it.dom + '$?', a: tf(c),
        steps: [it.why, c ? 'The limit is continuous: true.' : 'The limit jumps at $x = ' + it.jumps.join(', ') + '$: false.'], hint: 'Compute $f(x)$ at the special points and near them.', data: { k: 'cont', f: it.plain, c: c } }; }
    return { q: 'Each $f_n$ is continuous on $[0, 1]$ and $f_n \\to f$ pointwise. What can you say about $f$?', a: mc('Nothing in general: $f$ may be discontinuous, as for $x^{n}$ on $[0, 1]$.', ['$f$ is continuous.', '$f$ is continuous except at finitely many points, always.', '$f$ is differentiable.']),
      steps: ['Pointwise convergence lets each $x$ converge at its own speed; near $x = 1$, $x^{n}$ takes longer and longer to get small.', 'The limit of $x^{n}$ is $0$ on $[0, 1)$ and $1$ at $1$: discontinuous. Uniform convergence is what keeps continuity.'], hint: 'Think of $x^{n}$.', data: { k: 'mc' } };
  });

  // sup norms ‖f_n - f‖, exact; mono: decreasing in n
  function UN(R, lvl) {
    var kd = R.pick(lvl === 1 ? ['lin', 'pow', 'sin'] : ['lin', 'pow', 'bump', 'peak', 'root', 'quad', 'sin', 'spike', 'xn']);
    if (kd === 'lin') { var b = R.int(1, 5); return { kd: kd, tex: '\\frac{x}{n}', dom: '[0, ' + b + ']', f: '0', norm: function (n) { return Q(b, n); }, normTex: '\\frac{' + b + '}{n}', why: '$|f_n(x) - f(x)| = \\frac{x}{n}$ is largest at $x = ' + b + '$.', uni: true, plain: 'x/n', ftex: '0', b: b }; }
    if (kd === 'pow') { var a = q(R.pick(['1/2', '1/3', '2/3', '3/4'])); return { kd: kd, tex: 'x^{n}', dom: '[0, ' + T.num(a) + ']', f: '0', norm: function (n) { return a.pow(n); }, normTex: '\\left(' + T.num(a) + '\\right)^{n}', why: '$x^{n}$ increases, so its largest value on the interval is at $x = ' + T.num(a) + '$.', uni: true, plain: 'x^n', ftex: '0', b: a.toNumber() }; }
    if (kd === 'sin') { var k = R.int(1, 4); return { kd: kd, tex: '\\frac{\\sin(' + (k === 1 ? '' : k) + 'nx)}{n}', dom: '\\mathbb{R}', f: '0', norm: function (n) { return Q(1, n); }, normTex: '\\frac{1}{n}', why: '$|\\sin| \\le 1$, with equality at some $x$, so the largest value of $\\left|\\frac{\\sin(' + (k === 1 ? '' : k) + 'nx)}{n}\\right|$ is $\\frac{1}{n}$.', uni: true, plain: 'sin(' + k + '*n*x)/n', ftex: '0', b: 3 }; }
    if (kd === 'quad') { var b2 = R.int(1, 4); return { kd: kd, tex: 'x + \\frac{x^{2}}{n}', dom: '[0, ' + b2 + ']', f: 'x', norm: function (n) { return Q(b2 * b2, n); }, normTex: '\\frac{' + (b2 * b2) + '}{n}', why: '$|f_n(x) - x| = \\frac{x^{2}}{n}$ is largest at $x = ' + b2 + '$.', uni: true, plain: 'x+x^2/n', ftex: 'x', b: b2 }; }
    if (kd === 'bump') return { kd: kd, tex: '\\frac{x}{1 + nx^{2}}', dom: '\\mathbb{R}', f: '0', normSq: function (n) { return Q(1, 4 * n); }, norm: function (n) { var r = M.round(M.sqrt(n)); return r * r === n ? Q(1, 2 * r) : null; }, normTex: '\\frac{1}{2\\sqrt{n}}', why: 'The derivative $\\frac{1 - nx^{2}}{(1 + nx^{2})^{2}}$ is $0$ at $x = \\frac{1}{\\sqrt{n}}$, where the value is $\\frac{1}{2\\sqrt{n}}$.', uni: true, plain: 'x/(1+n*x^2)', ftex: '0', b: 3, squares: true };
    if (kd === 'root') return { kd: kd, tex: '\\sqrt{x^{2} + \\frac{1}{n}}', dom: '\\mathbb{R}', f: '|x|', normSq: function (n) { return Q(1, n); }, norm: function (n) { var r = M.round(M.sqrt(n)); return r * r === n ? Q(1, r) : null; }, normTex: '\\frac{1}{\\sqrt{n}}', why: '$\\sqrt{x^{2} + \\frac{1}{n}} - |x| = \\frac{1/n}{\\sqrt{x^{2} + 1/n} + |x|}$ is largest at $x = 0$: $\\frac{1}{\\sqrt{n}}$.', uni: true, plain: 'sqrt(x^2+1/n)', ftex: 'abs(x)', b: 2, squares: true };
    if (kd === 'peak') return { kd: kd, tex: 'x^{n}(1 - x)', dom: '[0, 1]', f: '0', norm: function (n) { return Q(1, 1).mul(q(n).pow(n)).div(q(n + 1).pow(n + 1)); }, normTex: '\\frac{n^{n}}{(n + 1)^{n+1}}', why: 'The derivative $x^{n-1}(n - (n + 1)x)$ is $0$ at $x = \\frac{n}{n + 1}$, where the value is $\\frac{n^{n}}{(n + 1)^{n+1}}$.', uni: true, plain: 'x^n*(1-x)', ftex: '0', b: 1, small: true };
    if (kd === 'spike') return { kd: kd, tex: '\\frac{nx}{1 + n^{2}x^{2}}', dom: '[0, 1]', f: '0', norm: function (n) { return Q(1, 2); }, normTex: '\\frac{1}{2}', why: 'The largest value is at $x = \\frac{1}{n}$: $\\frac{1}{1 + 1} = \\frac{1}{2}$, for every $n$.', uni: false, plain: 'n*x/(1+n^2*x^2)', ftex: '0', b: 1 };
    return { kd: 'xn', tex: 'x^{n}', dom: '[0, 1)', f: '0', norm: function (n) { return q(1); }, normTex: '1', why: 'Points close to $1$ have $x^{n}$ close to $1$, so $\\sup_{[0, 1)} x^{n} = 1$ for every $n$.', uni: false, plain: 'x^n', ftex: '0', b: 1 };
  }
  G('ra.uniform-convergence', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['norm', 'norm', 'smallN']), R.pick(['norm', 'uniform', 'smallN']), R.pick(['norm', 'uniform', 'smallN', 'mc']));
    if (shape === 'mc') return { q: 'For $f_n(x) = x^{n}$ on $[0, 1)$, a student says: "for each fixed $x$, $x^{n} \\to 0$, so $f_n \\to 0$ uniformly." What is wrong?', a: mc('That shows pointwise convergence only; $\\sup_{[0, 1)} |x^{n}| = 1$ for every $n$, so the convergence is not uniform.', ['Nothing: pointwise convergence on a bounded interval is uniform.', '$x^{n}$ does not go to $0$ for $x$ in $[0, 1)$.', 'The limit is $1$, not $0$.']),
      steps: ['Uniform convergence needs $\\|f_n - f\\| = \\sup |f_n(x) - f(x)| \\to 0$: one $N$ for all $x$ at once.', 'Here the supremum stays $1$ (take $x$ close to $1$), so for $\\varepsilon = \\frac{1}{2}$ no $N$ works for every $x$.'], hint: 'Look at the sup over all $x$, not one $x$ at a time.', data: { k: 'mc' } };
    var S = UN(R, L), intro = 'Let $f_n(x) = ' + S.tex + '$ on $' + S.dom + '$, which converges pointwise to $f(x) = ' + S.f + '$. ';
    if (shape === 'norm') { var n = S.squares ? R.pick([4, 9, 16, 25, 100]) : S.small ? R.int(2, 4) : R.int(2, 12), v = S.norm(n);
      return { q: intro + 'Find the sup norm $\\|f_{' + n + '} - f\\| = \\sup |f_{' + n + '}(x) - f(x)|$ over the domain.', a: num(v.toPlain()),
        steps: [S.why, 'So $\\|f_n - f\\| = ' + S.normTex + '$, and at $n = ' + n + '$ it is $' + T.num(v) + '$.', S.uni ? 'It goes to $0$ as $n \\to \\infty$: the convergence is uniform.' : 'It does not go to $0$: the convergence is not uniform.'],
        hint: 'Maximize $|f_n(x) - f(x)|$ over $x$ (calculus, or look at an end point).', viz: L <= 2 ? { name: 'ra-unifband', opts: { fn: S.plain, f: S.ftex, n: n, eps: null, xmin: S.dom === '\\mathbb{R}' ? -3 : 0, xmax: S.b, quiet: true, edit: false } } : undefined, data: { k: 'norm', kind: S.kd, f: S.plain, lim: S.ftex, n: n, v: v.toPlain(), b: S.b } }; }
    if (shape === 'uniform') return { q: intro + 'Is the convergence uniform on $' + S.dom + '$?', a: tf(S.uni),
      steps: [S.why, 'So $\\|f_n - f\\| = ' + S.normTex + '$.', S.uni ? 'It goes to $0$, so the convergence is uniform: true.' : 'It does not go to $0$, so the convergence is not uniform: false.'], hint: 'Compute $\\sup |f_n(x) - f(x)|$ and see whether it goes to $0$.', data: { k: 'uni', kind: S.kd, uni: S.uni, b: S.b } };
    for (var t = 0; t < 20 && !S.uni; t++) S = UN(R, L);
    intro = 'Let $f_n(x) = ' + S.tex + '$ on $' + S.dom + '$, which converges uniformly to $f(x) = ' + S.f + '$. ';
    var e = epsPick(R, L), eq = q(e), N0 = S.normSq ? firstNfast(function (n) { return S.normSq(n).lt(eq.mul(eq)); }, 1) : firstNfast(function (n) { return S.norm(n).lt(eq); }, 1);
    return { q: intro + 'For $' + E(e) + '$, find an $N$ such that $|f_n(x) - f(x)| < \\varepsilon$ for <b>every</b> $x$ and every $n \\ge N$. (Any $N$ that works is right.)', a: multi([part('$N =$', anyN(N0))]),
      steps: [S.why, '$\\|f_n - f\\| = ' + S.normTex + '$ decreases, and it first drops below $' + epsTex(e) + '$ at $n = ' + N0 + '$.', 'So $N = ' + N0 + '$ works for all $x$ at once, and so does any larger $N$.'], hint: 'Use the sup norm: it controls every $x$ at once.', data: { k: 'smallN', kind: S.kd, e: eq.toPlain(), N0: N0, b: S.b } };
  });

  var UL = [
    { tex: 'nx(1 - x^{2})^{n}', I: function (n) { return Q(n, 2 * (n + 1)); }, Itex: '\\frac{n}{2(n + 1)}', limI: '1/2', why: 'Substitute $u = 1 - x^{2}$: $\\int_0^1 nx(1 - x^{2})^{n}\\,dx = \\frac{n}{2(n + 1)}$.', pw: 'For $0 < x \\le 1$, $(1 - x^{2})^{n} \\to 0$ faster than $n$ grows, and $f_n(0) = 0$: the limit is $0$.', limF: '0', uni: false, plain: 'n*x*(1-x^2)^n', lim: '0' },
    { tex: '2nxe^{-nx^{2}}', I: null, Itex: '1 - e^{-n}', limI: '1', why: '$\\int_0^1 2nxe^{-nx^{2}}\\,dx = \\left[-e^{-nx^{2}}\\right]_0^1 = 1 - e^{-n}$.', pw: 'For $x > 0$, $e^{-nx^{2}}$ beats the factor $2n$, and $f_n(0) = 0$: the limit is $0$.', limF: '0', uni: false, plain: '2*n*x*e^(-n*x^2)', lim: '0' },
    { tex: 'x^{n}', I: function (n) { return Q(1, n + 1); }, Itex: '\\frac{1}{n + 1}', limI: '0', why: '$\\int_0^1 x^{n}\\,dx = \\frac{1}{n + 1}$.', pw: 'The limit is $0$ on $[0, 1)$ and $1$ at $x = 1$; changing one point does not change the integral, so $\\int_0^1 f = 0$.', limF: '0', uni: false, plain: 'x^n', lim: '0' },
    { tex: 'x + \\frac{x^{2}}{n}', I: function (n) { return Q(1, 2).add(Q(1, 3 * n)); }, Itex: '\\frac{1}{2} + \\frac{1}{3n}', limI: '1/2', why: '$\\int_0^1 \\left(x + \\frac{x^{2}}{n}\\right) dx = \\frac{1}{2} + \\frac{1}{3n}$.', pw: 'The limit is $f(x) = x$ (uniformly, since $\\|f_n - f\\| = \\frac{1}{n}$), and $\\int_0^1 x\\,dx = \\frac{1}{2}$.', limF: '1/2', uni: true, plain: 'x+x^2/n', lim: 'x' },
    { tex: 'n^{2}x(1 - x)^{n}', I: function (n) { return Q(n * n, (n + 1) * (n + 2)); }, Itex: '\\frac{n^{2}}{(n + 1)(n + 2)}', limI: '1', why: '$\\int_0^1 x(1 - x)^{n}\\,dx = \\frac{1}{(n + 1)(n + 2)}$ (substitute $u = 1 - x$), so $\\int_0^1 f_n = \\frac{n^{2}}{(n + 1)(n + 2)}$.', pw: 'For $0 < x \\le 1$, $(1 - x)^{n}$ goes to $0$ much faster than $n^{2}$ grows, and $f_n(0) = 0$: the limit is $0$.', limF: '0', uni: false, plain: 'n^2*x*(1-x)^n', lim: '0' }];
  G('ra.uniform-limits', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['value', 'pair']), R.pick(['pair', 'value', 'swap']), R.pick(['pair', 'swap', 'deriv']));
    if (shape === 'deriv') return { q: '$f_n(x) = \\frac{\\sin(nx)}{n}$ converges uniformly to $0$ on $\\mathbb{R}$. What happens to the derivatives $f_n\'(x) = \\cos(nx)$?', a: mc('They do not converge to $0$ (at $x = 0$ they all equal $1$), so derivatives cannot be swapped with limits just because $f_n$ converges uniformly.', ['They converge uniformly to $0$, as uniform convergence guarantees.', 'They converge to $1$ everywhere.', 'They converge pointwise to $0$ everywhere.']),
      steps: ['$\\|f_n\\| = \\frac{1}{n} \\to 0$: uniform convergence of $f_n$.', 'But $f_n\'(0) = \\cos 0 = 1$ for every $n$, while the limit function $0$ has derivative $0$.', 'Swapping a limit with a derivative needs the derivatives $f_n\'$ to converge uniformly.'], hint: 'Evaluate $f_n\'(0)$.', data: { k: 'mc' } };
    var it = R.pick(shape === 'value' ? UL.filter(function (x) { return x.I; }) : UL);
    if (shape === 'value') { var n = R.int(2, 60), v = it.I(n);
      return { q: 'Let $f_n(x) = ' + it.tex + '$ on $[0, 1]$. Compute $\\int_0^1 f_{' + n + '}(x)\\,dx$.', a: num(v.toPlain()), steps: [it.why, 'At $n = ' + n + '$: $' + T.num(v) + '$.'], hint: 'Find the integral as a formula in $n$ first.', data: { k: 'value', f: it.plain, n: n, v: v.toPlain() } }; }
    if (shape === 'pair') return { q: 'Let $f_n(x) = ' + it.tex + '$ on $[0, 1]$. Find $' + LIMN + ' \\int_0^1 f_n(x)\\,dx$ and $\\int_0^1 \\left(' + LIMN + ' f_n(x)\\right) dx$.', a: multi([part('$\\lim \\int f_n =$', num(it.limI)), part('$\\int \\lim f_n =$', num(it.limF))]),
      steps: [it.why + ' As $n \\to \\infty$ this tends to $' + tex(it.limI) + '$.', it.pw, it.limI === it.limF ? 'Here the two agree.' + (it.uni ? ' Uniform convergence guarantees that.' : ' (They can agree without uniform convergence, but nothing guarantees it.)') : 'They differ: the convergence is not uniform (the graphs have a spike of growing height that slides toward $0$), so the limit and the integral cannot be swapped.'],
      hint: 'Integrate first and then let $n \\to \\infty$; separately, find the pointwise limit and integrate it.', viz: L === 1 ? { name: 'ra-unifband', opts: { fn: it.plain, f: it.lim, n: 3, nmax: 30, xmin: 0, xmax: 1, quiet: true, edit: false } } : undefined, data: { k: 'pair', f: it.plain, limI: it.limI, limF: it.limF } };
    return { q: 'Let $f_n(x) = ' + it.tex + '$ on $[0, 1]$. Does $\\int_0^1 f_n \\to \\int_0^1 \\left(\\lim f_n\\right)$?', a: tf(it.limI === it.limF),
      steps: [it.why + ' Its limit is $' + tex(it.limI) + '$.', it.pw, it.limI === it.limF ? 'Both are $' + tex(it.limI) + '$: true.' : 'They differ ($' + tex(it.limI) + ' \\ne ' + tex(it.limF) + '$): false. Without uniform convergence the swap can fail.'],
      hint: 'Compute both sides.', data: { k: 'swap', f: it.plain, eq: it.limI === it.limF } };
  });

  var MT = [
    { tex: '\\frac{\\sin(kx)}{k^{2}}', dom: '\\mathbb{R}', M: function (k) { return Q(1, k * k); }, Mtex: '\\frac{1}{k^{2}}', why: '$|\\sin(kx)| \\le 1$, with equality at some $x$.', sum: null },
    { tex: '\\frac{\\cos(kx)}{2^{k}}', dom: '\\mathbb{R}', M: function (k) { return Q(1, pow2(k)); }, Mtex: '\\frac{1}{2^{k}}', why: '$|\\cos(kx)| \\le 1$, with equality at $x = 0$.', sum: '1', r: Q(1, 2) },
    { tex: 'x^{k}', dom: '\\left[-\\frac{1}{2}, \\frac{1}{2}\\right]', M: function (k) { return Q(1, pow2(k)); }, Mtex: '\\frac{1}{2^{k}}', why: '$|x^{k}|$ is largest at the ends, $x = \\pm\\frac{1}{2}$.', sum: '1', r: Q(1, 2) },
    { tex: 'x^{k}', dom: '\\left[-\\frac{2}{3}, \\frac{2}{3}\\right]', M: function (k) { return Q(2, 3).pow(k); }, Mtex: '\\left(\\frac{2}{3}\\right)^{k}', why: '$|x^{k}|$ is largest at the ends, $x = \\pm\\frac{2}{3}$.', sum: '2', r: Q(2, 3) },
    { tex: '\\frac{x^{k}}{k!}', dom: '[-2, 2]', M: function (k) { return Q(pow2(k), fact(k)); }, Mtex: '\\frac{2^{k}}{k!}', why: '$\\left|\\frac{x^{k}}{k!}\\right|$ is largest at $x = \\pm 2$.', sum: null },
    { tex: '\\frac{1}{k^{2} + x^{2}}', dom: '\\mathbb{R}', M: function (k) { return Q(1, k * k); }, Mtex: '\\frac{1}{k^{2}}', why: 'The fraction is largest at $x = 0$.', sum: null },
    { tex: '\\frac{x}{3^{k}}', dom: '[0, 1]', M: function (k) { return Q(1, M.pow(3, k)); }, Mtex: '\\frac{1}{3^{k}}', why: '$\\frac{x}{3^{k}}$ is largest at $x = 1$.', sum: '1/2', r: Q(1, 3) }];
  G('ra.weierstrass-m-test', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['Mk', 'Mk', 'sum']), R.pick(['Mk', 'sum', 'tail']), R.pick(['tail', 'sum', 'mc']));
    if (shape === 'mc') return { q: 'Can the M-test show that $\\sum_{k=1}^{\\infty} x^{k}$ converges uniformly on $(-1, 1)$?', a: mc('No: $\\sup_{(-1, 1)} |x^{k}| = 1$, and $\\sum 1$ diverges (the series does not converge uniformly there).', ['Yes, with $M_k = |x|^{k}$.', 'Yes, with $M_k = \\frac{1}{2^{k}}$.', 'Yes, because the series converges at every $x$ in $(-1, 1)$.']),
      steps: ['$M_k$ must be a number (not depending on $x$) with $|f_k(x)| \\le M_k$ for all $x$; the best is $\\sup |x^{k}| = 1$.', '$\\sum 1$ diverges, so the test does not apply; in fact the convergence is not uniform on $(-1, 1)$. On $[-r, r]$ with $r < 1$ it is: take $M_k = r^{k}$.'], hint: 'What is $\\sup |x^{k}|$ on $(-1, 1)$?', data: { k: 'mc' } };
    var it = R.pick(shape === 'Mk' ? MT : MT.filter(function (x) { return x.sum; }));
    if (shape === 'Mk') { var k = R.int(2, 9), v = it.M(k);
      return { q: 'For $\\sum f_k$ with $f_k(x) = ' + it.tex + '$ on $' + it.dom + '$, the best constant for the M-test is $M_k = \\sup |f_k(x)|$. Find $M_{' + k + '}$.', a: num(v.toPlain()),
        steps: [it.why, 'So $M_k = ' + it.Mtex + '$ and $M_{' + k + '} = ' + T.num(v) + '$.', 'Since $\\sum M_k$ converges, $\\sum f_k$ converges uniformly on $' + it.dom + '$.'], hint: 'Find the largest value of $|f_k(x)|$ over the set.', data: { k: 'Mk', idx: MT.indexOf(it), kk: k, v: v.toPlain() } }; }
    if (shape === 'sum') return { q: 'For $f_k(x) = ' + it.tex + '$ on $' + it.dom + '$, the M-test uses $M_k = ' + it.Mtex + '$. Compute $\\sum_{k=1}^{\\infty} M_k$, which bounds $\\sum |f_k(x)|$ for every $x$.', a: num(it.sum),
      steps: ['$\\sum_{k=1}^{\\infty} ' + it.Mtex + '$ is geometric with ratio $' + T.num(it.r) + '$.', 'Its sum is $\\frac{' + T.num(it.r) + '}{1 - ' + T.num(it.r) + '} = ' + tex(it.sum) + '$.', 'So $\\left|\\sum f_k(x)\\right| \\le ' + tex(it.sum) + '$ for every $x$, and the series converges uniformly.'], hint: 'It is a geometric series starting at $k = 1$.', data: { k: 'sum', idx: MT.indexOf(it), v: it.sum } };
    var e = epsPick(R, L), eq = q(e), r = it.r, N0 = firstNfast(function (n) { return r.pow(n + 1).div(q(1).sub(r)).lt(eq); }, 1);
    return { q: 'For $f_k(x) = ' + it.tex + '$ on $' + it.dom + '$, the M-test with $M_k = ' + it.Mtex + '$ bounds the tail: $\\left|\\sum_{k > N} f_k(x)\\right| \\le \\sum_{k > N} M_k$ for every $x$. Find an $N$ that makes this bound less than $' + epsTex(e) + '$. (Any such $N$ is right.)', a: multi([part('$N =$', anyN(N0))]),
      steps: ['$\\sum_{k > N} M_k = \\frac{r^{N+1}}{1 - r}$ with $r = ' + T.num(r) + '$.', 'It first drops below $' + epsTex(e) + '$ at $N = ' + N0 + '$.', 'So $N = ' + N0 + '$ works for every $x$ at once (uniformly), and any larger $N$ too.'], hint: 'The tail of a geometric series is geometric.', data: { k: 'tail', r: r.toPlain(), e: eq.toPlain(), N0: N0 } };
  });

  G('ra.power-series-radius', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['std', 'std', 'mtest']), R.pick(['gaps', 'alt', 'std']), R.pick(['gaps', 'alt', 'interval']));
    if (shape === 'std') { var kd = R.pick(['poly', 'poly', 'fact', 'nfact', 'n']), b = R.int(2, 12), p = R.int(1, 8), tx, v, why;
      if (kd === 'poly') { tx = '\\frac{n^{' + p + '}}{' + b + '^{n}}'; v = String(b); why = '$|c_n|^{1/n} = \\frac{(n^{1/n})^{' + p + '}}{' + b + '} \\to \\frac{1}{' + b + '}$, since $n^{1/n} \\to 1$.'; }
      else if (kd === 'n') { tx = '\\frac{1}{n \\cdot ' + b + '^{n}}'; v = String(b); why = '$|c_n|^{1/n} = \\frac{1}{n^{1/n} \\cdot ' + b + '} \\to \\frac{1}{' + b + '}$.'; }
      else if (kd === 'fact') { tx = '\\frac{1}{n!}'; v = 'inf'; why = 'The ratio $\\frac{|c_{n+1}|}{|c_n|} = \\frac{1}{n + 1} \\to 0$, so $|c_n|^{1/n} \\to 0$ as well; $R = \\infty$.'; }
      else { tx = 'n!'; v = '0'; why = 'The ratio $\\frac{|c_{n+1}|}{|c_n|} = n + 1 \\to \\infty$, so $|c_n|^{1/n} \\to \\infty$; $R = 0$ (it converges only at $x = 0$).'; }
      return { q: 'Find the radius of convergence $R$ of $\\sum_{n=1}^{\\infty} c_n x^{n}$ with $c_n = ' + tx + '$. (Type inf for $\\infty$.)', a: num(v),
        steps: ['$R = \\frac{1}{\\limsup |c_n|^{1/n}}$ (with $\\frac{1}{0} = \\infty$ and $\\frac{1}{\\infty} = 0$).', why, 'So $R = ' + (v === 'inf' ? '\\infty' : v) + '$.'], hint: 'Take the $n$th root of $|c_n|$.', data: { k: 'std', kind: kd, b: b, p: p, v: v } }; }
    if (shape === 'gaps') { var a = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 25, 36]), s = surd(Q(1, a));
      return { q: 'Find the radius of convergence of $\\sum_{n=0}^{\\infty} ' + a + '^{n} x^{2n}$. (The odd powers are missing, so the ratio test on the coefficients does not apply directly.)', a: num(s.plain),
        steps: ['As a series in $x$, $c_k = ' + a + '^{k/2}$ for even $k$ and $c_k = 0$ for odd $k$.', 'So $\\limsup |c_k|^{1/k} = ' + a + '^{1/2} = ' + surd(a).tex + '$, and $R = \\frac{1}{' + surd(a).tex + '} = ' + s.tex + '$.', 'Check: it is geometric in $' + a + 'x^{2}$, which converges when $' + a + 'x^{2} < 1$, that is, $|x| < ' + s.tex + '$.'], hint: 'Treat it as geometric in $' + a + 'x^{2}$, or use the lim sup of the $k$th roots.', data: { k: 'gaps', a: a, v: s.plain } }; }
    if (shape === 'alt') { var pr = R.sample([2, 3, 4, 5, 6, 7, 8, 9, 10], 2), pe = pr[0], po = pr[1], mx = M.max(pe, po);
      return { q: 'Find the radius of convergence of $\\sum c_n x^{n}$ where $c_n = ' + pe + '^{n}$ for even $n$ and $c_n = ' + po + '^{n}$ for odd $n$.', a: num(Q(1, mx).toPlain()),
        steps: ['$|c_n|^{1/n}$ is $' + pe + '$ for even $n$ and $' + po + '$ for odd $n$.', 'So $\\limsup |c_n|^{1/n} = ' + mx + '$ (the ratios $\\frac{c_{n+1}}{c_n}$ jump around and have no limit).', 'So $R = \\frac{1}{' + mx + '}$.'], hint: 'The lim sup takes the larger of the two roots.', data: { k: 'alt', pe: pe, po: po } }; }
    if (shape === 'interval') { var x0 = R.int(-6, 6), b2 = R.int(1, 7), lo = x0 - b2, hi = x0 + b2;
      return { q: 'Find the interval of convergence of $\\sum_{n=1}^{\\infty} \\frac{(' + xm(x0) + ')^{n}}{n \\cdot ' + b2 + '^{n}}$, including the endpoints that belong.'.replace('(x)^{n}', 'x^{n}').replace(' \\cdot 1^{n}', ''), a: { t: 'interval', v: '[' + lo + ', ' + hi + ')' },
        steps: ['$|c_n|^{1/n} = \\frac{1}{n^{1/n} \\cdot ' + b2 + '} \\to \\frac{1}{' + b2 + '}$, so $R = ' + b2 + '$ around the center $' + x0 + '$: it converges on $(' + lo + ', ' + hi + ')$.', 'At $x = ' + hi + '$: $\\sum \\frac{1}{n}$, the harmonic series, diverges.', 'At $x = ' + lo + '$: $\\sum \\frac{(-1)^{n}}{n}$ converges (alternating series test). So the interval is $[' + lo + ', ' + hi + ')$.'], hint: 'Find $R$, then test each endpoint separately.', data: { k: 'interval', x0: x0, b: b2 } }; }
    var r = q(R.pick(['1/2', '1/3', '1/4'])), rr = R.pick([q(1), q('1/2')]).mul(1), bound = rr.mul(r), sum = q(1).div(q(1).sub(bound));
    return { q: 'The power series $\\sum_{n=0}^{\\infty} (' + T.num(r) + 'x)^{n}$ has radius $' + T.num(r.inv()) + '$. On $[-' + T.num(rr) + ', ' + T.num(rr) + ']$, use the M-test with $M_n = (' + T.num(bound) + ')^{n}$: compute $\\sum_{n=0}^{\\infty} M_n$.'.replace('[-1, 1]', '[-1, 1]'), a: num(sum.toPlain()),
      steps: ['On $|x| \\le ' + T.num(rr) + '$: $|(' + T.num(r) + 'x)^{n}| \\le (' + T.num(bound) + ')^{n} = M_n$.', '$\\sum_{n \\ge 0} (' + T.num(bound) + ')^{n} = \\frac{1}{1 - ' + T.num(bound) + '} = ' + T.num(sum) + '$.', 'So the series converges uniformly on $[-' + T.num(rr) + ', ' + T.num(rr) + ']$, inside the radius, and its sum is continuous there.'], hint: 'Bound each term by its value at the end of the interval.', data: { k: 'mtest', r: r.toPlain(), rr: rr.toPlain(), v: sum.toPlain() } };
  });

// ---- 08-metric.js
  // ================================================================ Unit 8: Metric Spaces
  G('ra.metric-spaces', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['dists', 'dists', 'ball']), R.pick(['dists', 'ball', 'tri']), R.pick(['tri', 'which', 'dists']));
    if (shape === 'dists' || shape === 'ball') {
      var p = [R.int(-4, 4), R.int(-4, 4)], qq = [p[0] + R.nz(-5, 5), p[1] + R.nz(-5, 5)], dx = M.abs(qq[0] - p[0]), dy = M.abs(qq[1] - p[1]), d1 = dx + dy, d2 = surd(dx * dx + dy * dy), di = M.max(dx, dy);
      if (shape === 'dists') return { q: 'For $P = (' + p.join(', ') + ')$ and $Q = (' + qq.join(', ') + ')$ in $\\mathbb{R}^{2}$, find the taxicab distance $d_1$, the Euclidean distance $d_2$ and the max distance $d_\\infty$.', a: multi([part('$d_1(P, Q) =$', num(d1)), part('$d_2(P, Q) =$', num(d2.plain)), part('$d_\\infty(P, Q) =$', num(di))]),
        steps: ['The coordinate differences are $|\\Delta x| = ' + dx + '$ and $|\\Delta y| = ' + dy + '$.', '$d_1 = ' + dx + ' + ' + dy + ' = ' + d1 + '$, $d_2 = \\sqrt{' + dx + '^{2} + ' + dy + '^{2}} = ' + d2.tex + '$, $d_\\infty = \\max(' + dx + ', ' + dy + ') = ' + di + '$.', 'Always $d_\\infty \\le d_2 \\le d_1$: the three metrics give different numbers but the same convergent sequences.'],
        hint: 'All three start from $|\\Delta x|$ and $|\\Delta y|$.', viz: L === 1 ? { name: 'ra-balls', opts: { p: p, q: qq, quiet: true, edit: false } } : undefined, data: { k: 'dists', p: p, q: qq, d1: d1, d2: d2.plain, di: di } };
      var r = R.int(M.max(1, di), d1), in1 = d1 < r, in2 = dx * dx + dy * dy < r * r, ini = di < r;
      return { q: 'Is $Q = (' + qq.join(', ') + ')$ in the open ball of radius $' + r + '$ around $P = (' + p.join(', ') + ')$, for each metric?', a: multi([part('in $B_{d_1}(P, ' + r + ')$:', tf(in1)), part('in $B_{d_2}(P, ' + r + ')$:', tf(in2)), part('in $B_{d_\\infty}(P, ' + r + ')$:', tf(ini))]),
        steps: ['$d_1(P, Q) = ' + d1 + '$, $d_2(P, Q) = ' + d2.tex + '$, $d_\\infty(P, Q) = ' + di + '$.', 'A point is in the open ball when its distance is less than $' + r + '$: ' + [['d_1', in1], ['d_2', in2], ['d_\\infty', ini]].map(function (z) { return '$' + z[0] + '$: ' + (z[1] ? 'yes' : 'no'); }).join(', ') + '.', 'The $d_1$ ball is a diamond, the $d_2$ ball a disk and the $d_\\infty$ ball a square; each fits inside the next.'],
        hint: 'Compute the three distances and compare each with the radius.', viz: L <= 2 ? { name: 'ra-balls', opts: { p: p, q: qq, r: r, quiet: true, edit: false } } : undefined, data: { k: 'ball', p: p, q: qq, r: r } };
    }
    if (shape === 'tri') { var c = R.int(1, 5), z = 2 * c;
      return { q: 'Show that $d(x, y) = (x - y)^{2}$ is not a metric on $\\mathbb{R}$: for $x = 0$, $y = ' + c + '$ and $z = ' + z + '$, compute $d(x, z)$ and $d(x, y) + d(y, z)$.', a: multi([part('$d(x, z) =$', num(z * z)), part('$d(x, y) + d(y, z) =$', num(2 * c * c))]),
        steps: ['$d(0, ' + z + ') = ' + z + '^{2} = ' + (z * z) + '$.', '$d(0, ' + c + ') + d(' + c + ', ' + z + ') = ' + (c * c) + ' + ' + (c * c) + ' = ' + (2 * c * c) + '$.', 'Since $' + (z * z) + ' > ' + (2 * c * c) + '$, the triangle inequality $d(x, z) \\le d(x, y) + d(y, z)$ fails. (Positivity and symmetry do hold.)'],
        hint: 'Square the differences.', data: { k: 'tri', c: c } }; }
    var items = [['$d(x, y) = |x - y|$ on $\\mathbb{R}$', 1], ['$d(x, y) = (x - y)^{2}$ on $\\mathbb{R}$', 0], ['$d(x, y) = |x^{2} - y^{2}|$ on $\\mathbb{R}$', 0], ['$d(x, y) = \\min(1, |x - y|)$ on $\\mathbb{R}$', 1], ['$d(x, y) = 0$ if $x = y$ and $1$ otherwise (any set)', 1], ['$d(x, y) = |x - 2y|$ on $\\mathbb{R}$', 0], ['$d(x, y) = 2|x - y|$ on $\\mathbb{R}$', 1]], pick = R.sample(items, 4);
    if (!pick.some(function (x) { return x[1]; })) pick[0] = items[0]; if (pick.every(function (x) { return x[1]; })) pick[3] = items[2];
    var good = []; pick.forEach(function (x, i) { if (x[1]) good.push(i); });
    return { q: 'Which of these are metrics? Select all that apply.', a: mcAll(pick.map(function (x) { return x[0]; }), good),
      steps: ['A metric needs $d(x, y) \\ge 0$ with equality only when $x = y$, symmetry, and the triangle inequality.', '$(x - y)^{2}$ fails the triangle inequality ($d(0, 2) = 4 > 1 + 1$); $|x^{2} - y^{2}|$ gives $d(1, -1) = 0$; $|x - 2y|$ is not symmetric ($d(2, 1) = 0$).', '$|x - y|$, $2|x - y|$, $\\min(1, |x - y|)$ and the discrete metric all pass.'], hint: 'Test each property with small numbers like $0$, $1$, $-1$, $2$.', data: { k: 'mc' } };
  });

  G('ra.open-closed-sets', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['ball1', 'classify']), R.pick(['ball2', 'closure', 'classify']), R.pick(['closure', 'limpts', 'ball2']));
    if (shape === 'ball1') { var a = R.int(-5, 0), b = a + R.int(2, 6), c = b + R.int(1, 3), d = c + R.int(2, 5), inFirst = R.coin(), lo = inFirst ? a : c, hi = inFirst ? b : d, p = q(lo).add(Q(R.int(1, 2 * (hi - lo) - 1), 2)), r = qmin(p.sub(lo), q(hi).sub(p));
      return { q: 'Let $S = (' + a + ', ' + b + ') \\cup (' + c + ', ' + d + ')$, an open set in $\\mathbb{R}$. For the point $p = ' + T.num(p) + '$, find a radius $r > 0$ with $(p - r, p + r) \\subseteq S$. (Any $r$ that works is right.)', a: upTo(r.toPlain()),
        steps: ['$p = ' + T.num(p) + '$ lies in $(' + lo + ', ' + hi + ')$.', 'Its distances to the ends are $' + T.num(p.sub(lo)) + '$ and $' + T.num(q(hi).sub(p)) + '$.', 'So every $r$ with $0 < r \\le ' + T.num(r) + '$ works; the largest is the distance to the nearer end. A positive radius exists for every point of $S$: that is what open means.'],
        hint: 'How far is $p$ from the nearest point outside $S$?', data: { k: 'ball1', lo: lo, hi: hi, p: p.toPlain(), r: r.toPlain() } }; }
    if (shape === 'ball2') { var s = R.int(4, 10), u = R.int(1, s - 1), v = R.int(1, s - 1), met = R.pick(['d_1', 'd_2', 'd_\\infty']), r2 = M.min(u, v, s - u, s - v);
      return { q: 'Let $S = (0, ' + s + ') \\times (0, ' + s + ')$, an open square in $\\mathbb{R}^{2}$, and $p = (' + u + ', ' + v + ')$. Using the metric $' + met + '$, find a radius $r > 0$ with $B_{' + met + '}(p, r) \\subseteq S$. (Any $r$ that works is right.)', a: upTo(String(r2)),
        steps: ['The distances from $p$ to the four sides are $' + [u, v, s - u, s - v].join(', ') + '$; the nearest side is $' + r2 + '$ away.', 'A $' + met + '$ ball of radius $r$ reaches exactly $r$ along the axis directions (it is a ' + (met === 'd_1' ? 'diamond' : met === 'd_2' ? 'disk' : 'square') + '), so it stays inside the square exactly when $r \\le ' + r2 + '$.', 'So any $r$ with $0 < r \\le ' + r2 + '$ works.'],
        hint: 'Find the distance to the nearest side of the square.', viz: L === 2 ? { name: 'ra-balls', opts: { p: [u, v], square: s, metric: met === 'd_1' ? 1 : met === 'd_2' ? 2 : 'inf', r: r2, quiet: true, edit: false } } : undefined, data: { k: 'ball2', s: s, u: u, v: v, r: r2 } }; }
    if (shape === 'classify') { var it = R.pick([['$[0, 1)$', 'neither open nor closed'], ['$(0, 1)$', 'open'], ['$[0, 1]$', 'closed'], ['$\\mathbb{R}$', 'both open and closed'], ['$\\mathbb{Z}$', 'closed'], ['$\\mathbb{Q}$', 'neither open nor closed'], ['$\\left\\{\\frac{1}{n} : n \\ge 1\\right\\} \\cup \\{0\\}$', 'closed'], ['$\\left\\{\\frac{1}{n} : n \\ge 1\\right\\}$', 'neither open nor closed'], ['$(0, \\infty)$', 'open'], ['$\\varnothing$', 'both open and closed']]);
      var why = { 'open': 'Every point has a small interval around it inside the set; and it misses a limit point, so it is not closed.', 'closed': 'It contains all its limit points; and some point has no interval around it inside the set, so it is not open.', 'neither open nor closed': 'Some point of the set has no interval around it inside the set (not open), and some limit point is missing (not closed).', 'both open and closed': 'Every point has an interval inside the set, and there are no missing limit points. In $\\mathbb{R}$, only $\\varnothing$ and $\\mathbb{R}$ are both.' };
      return { q: 'Is the set ' + it[0] + ' (in $\\mathbb{R}$) open, closed, both, or neither?', a: mc(it[1], ['open', 'closed', 'both open and closed', 'neither open nor closed'].filter(function (x) { return x !== it[1]; })),
        steps: [why[it[1]], '"Not open" does not mean "closed": the two properties are separate.'], hint: 'Check each property separately: interval around each point? all limit points included?', data: { k: 'mc' } }; }
    if (shape === 'closure') { var a2 = R.int(-4, 1), b2 = a2 + R.int(1, 4), c2 = b2 + R.int(1, 3), half = R.coin(), ask = R.pick(['closure', 'interior']);
      var S = (half ? '[' : '(') + a2 + ', ' + b2 + ') \\cup \\{' + c2 + '\\}', ans = ask === 'closure' ? '[' + a2 + ', ' + b2 + '] U {' + c2 + '}' : '(' + a2 + ', ' + b2 + ')';
      return { q: 'Let $S = ' + S + '$. Find the ' + ask + ' of $S$. (Write a single point like {5}, and use U for a union.)', a: { t: 'interval', v: ans },
        steps: ask === 'closure' ? ['The closure adds the limit points. Every point of $[' + a2 + ', ' + b2 + ']$ is a limit point of $S$, including the ends.', 'The isolated point $' + c2 + '$ stays (it is in $S$), though it is not a limit point.', 'So the closure is $[' + a2 + ', ' + b2 + '] \\cup \\{' + c2 + '\\}$.'] : ['The interior is the set of points with an open interval around them inside $S$.', 'Points of $(' + a2 + ', ' + b2 + ')$ qualify; $' + a2 + '$ (if it is in $S$) and the isolated point $' + c2 + '$ do not.', 'So the interior is $(' + a2 + ', ' + b2 + ')$.'],
        hint: ask === 'closure' ? 'Add every point that elements of $S$ crowd up against.' : 'Keep only the points with some room around them.', data: { k: 'closure', ask: ask, a: a2, b: b2, c: c2 } }; }
    var k = R.int(2, 5), tx = R.pick([['\\left\\{\\frac{1}{n} : n \\ge 1\\right\\}', '{0}'], ['\\left\\{' + k + ' + \\frac{1}{n} : n \\ge 1\\right\\} \\cup (0, 1)', '[0, 1] U {' + k + '}'], ['\\left\\{\\frac{1}{n} : n \\ge 1\\right\\} \\cup [' + k + ', ' + (k + 1) + ')', '{0} U [' + k + ', ' + (k + 1) + ']']]);
    return { q: 'Find the set of limit points of $' + tx[0] + '$. (Write a single point like {5}, and use U for a union.)', a: { t: 'interval', v: tx[1] },
      steps: ['A limit point has points of the set (other than itself) arbitrarily close to it.', 'The numbers $\\frac{1}{n}$ (or $' + k + ' + \\frac{1}{n}$) crowd up only at their limit; each one by itself is isolated. Every point of an interval, and both of its ends, are limit points.', 'So the set of limit points is $' + tx[1].replace(/ U /g, ' \\cup ').replace(/\{/g, '\\{').replace(/\}/g, '\\}') + '$.'],
      hint: 'Isolated points are not limit points; the points they crowd toward are.', data: { k: 'limpts', v: tx[1] } };
  });

  function minCover(ivs, a, b) { // open intervals [lo, hi] (meaning (lo, hi)) covering [a, b]; greedy minimum count, or 0 if they don't cover
    var p = q(a), count = 0, guard = 0, closedA = true;
    while (guard++ < 50) { var best = null; ivs.forEach(function (I) { if (I[0].lt(p) && I[1].gt(p) && (!best || I[1].gt(best[1]))) best = I; }); if (!best) return 0; count++; if (best[1].gt(b)) return count; p = best[1]; }
    return 0;
  }
  G('ra.compactness', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['cover', 'which']), R.pick(['cover', 'inv', 'which']), R.pick(['cover', 'inv', 'mc']));
    if (shape === 'cover') { var ivs, cnt;
      for (var t = 0; t < 100; t++) { ivs = []; var x = q(-1).div(R.int(2, 5)); while (x.lt(4)) { var len = Q(R.int(4, 12), 4); ivs.push([x, x.add(len)]); x = x.add(len).sub(Q(R.int(1, 3), 4)); } var extra = R.int(1, 3); for (var j = 0; j < extra; j++) { var s0 = Q(R.int(0, 14), 4), l0 = Q(R.int(1, 4), 4); ivs.push([s0, s0.add(l0)]); } cnt = minCover(ivs, 0, 4); if (cnt && ivs.length <= 9 && ivs.length > cnt) break; }
      ivs = R.shuffle(ivs);
      return { q: 'These open intervals cover $[0, 4]$: ' + ivs.map(function (I) { return '$(' + T.num(I[0]) + ', ' + T.num(I[1]) + ')$'; }).join(', ') + '. What is the smallest number of them that still covers $[0, 4]$?', a: num(cnt),
        steps: ['Work left to right. Among the intervals containing $0$, take the one that reaches farthest right.', 'Its right end is not covered by it (the intervals are open), so next take the interval containing that point that reaches farthest, and so on until you pass $4$.', 'This greedy choice uses ' + cnt + ' intervals, and no smaller collection can cover $[0, 4]$. Compactness says some finite subcover always exists; here it is explicit.'],
        hint: 'Start at $0$ and always jump as far right as you can.', viz: L <= 2 ? { name: 'ra-cover', opts: { a: 0, b: 4, intervals: ivs.map(function (I) { return [I[0].toNumber(), I[1].toNumber()]; }), quiet: true, edit: false } } : undefined, data: { k: 'cover', ivs: ivs.map(function (I) { return [I[0].toPlain(), I[1].toPlain()]; }), cnt: cnt } }; }
    if (shape === 'inv') { var aq = q(R.pick(['1/10', '0.03', '1/7', '0.2', '1/25', '0.015'])), n0 = q(1).div(aq).floor().toNumber() + 1;
      return { q: 'The intervals $U_n = \\left(\\frac{1}{n}, 2\\right)$, $n \\ge 1$, cover $(0, 1]$ but no finite collection of them does. What is the smallest $n$ for which $U_n$ contains $[' + T.num(aq) + ', 1]$?', a: num(n0),
        steps: ['$U_n \\supseteq [' + T.num(aq) + ', 1]$ exactly when $\\frac{1}{n} < ' + T.num(aq) + '$, that is, $n > ' + T.num(q(1).div(aq)) + '$.', 'So $n = ' + n0 + '$.', 'Every finite collection has a largest $n$, and then it misses the points of $\\left(0, \\frac{1}{n}\\right]$: so $(0, 1]$ is not compact (it is not closed: $0$ is missing).'],
        hint: 'Solve $\\frac{1}{n} < a$ for $n$.', data: { k: 'inv', a: aq.toPlain(), n0: n0 } }; }
    if (shape === 'which') { var items = [['$[0, 1]$', 1], ['$(0, 1]$', 0], ['$[0, \\infty)$', 0], ['$\\{0\\} \\cup \\left\\{\\frac{1}{n} : n \\ge 1\\right\\}$', 1], ['$\\left\\{\\frac{1}{n} : n \\ge 1\\right\\}$', 0], ['$\\mathbb{Z} \\cap [-5, 5]$', 1], ['$\\mathbb{Q} \\cap [0, 1]$', 0], ['the closed disk $\\{(x, y) : x^{2} + y^{2} \\le 1\\}$', 1], ['$\\mathbb{Z}$', 0]], pick = R.sample(items, 5);
      if (!pick.some(function (x) { return x[1]; })) pick[0] = items[0]; if (pick.every(function (x) { return x[1]; })) pick[4] = items[1];
      var good = []; pick.forEach(function (x, i) { if (x[1]) good.push(i); });
      return { q: 'Which of these subsets of $\\mathbb{R}$ or $\\mathbb{R}^{2}$ are compact? Select all that apply.', a: mcAll(pick.map(function (x) { return cap(x[0]); }), good),
        steps: ['Heine–Borel: in $\\mathbb{R}^{n}$, compact means closed and bounded.', 'Not compact: $(0, 1]$ and $\\left\\{\\frac{1}{n}\\right\\}$ miss the limit point $0$; $\\mathbb{Q} \\cap [0, 1]$ misses irrationals; $[0, \\infty)$ and $\\mathbb{Z}$ are unbounded.', 'Compact: closed bounded intervals and disks, finite sets, and $\\{0\\} \\cup \\left\\{\\frac{1}{n}\\right\\}$.'], hint: 'Check closed and bounded.', data: { k: 'mc' } }; }
    return { q: 'To prove that $K$ is compact from the definition, what must you show?', a: mc('That every open cover of $K$ has a finite subcover.', ['That some open cover of $K$ has a finite subcover.', 'That $K$ can be covered by finitely many open intervals.', 'That every finite cover of $K$ is open.']),
      steps: ['Every set can be covered by one big open interval, so "some cover has a finite subcover" says nothing.', 'Compactness is a statement about all open covers, including the tricky ones like $\\left(\\frac{1}{n}, 2\\right)$.'], hint: 'Is one cover enough?', data: { k: 'mc' } };
  });

  G('ra.contraction-mapping', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['k', 'iter']), R.pick(['k', 'fixed', 'iter']), R.pick(['apriori', 'fixed', 'mc']));
    var kd = R.pick(L === 1 ? ['lin', 'quad'] : ['lin', 'quad', 'recip']), G0 = {};
    if (kd === 'lin') { var r = q(R.pick(['1/2', '1/3', '2/3', '1/4', '3/4'])), b = R.int(1, 6); G0 = { tex: 'g(x) = ' + T.coef(T.num(r), 'x') + ' + ' + b, dom: '\\mathbb{R}', k: r, ktex: T.num(r), kwhy: '$|g(x) - g(y)| = ' + T.num(r) + '|x - y|$.', g: function (x) { return r.mul(x).add(b); }, fp: { tex: T.num(q(b).div(q(1).sub(r))), plain: q(b).div(q(1).sub(r)).toPlain() }, fwhy: 'Solve $x = ' + T.num(r) + 'x + ' + b + '$.', plain: r.toPlain() + '*x+' + b, x0s: [0, 1, 2] }; }
    else if (kd === 'quad') { var d = R.int(3, 6), c = R.int(1, d - 1), disc = d * d - 4 * c, s = surd(disc), fp = { tex: '\\frac{' + d + ' - ' + s.tex + '}{2}', plain: '(' + d + '-' + s.plain + ')/2' }; if (s.rational) { var fq = q(d).sub(s.rational).div(2); fp = { tex: T.num(fq), plain: fq.toPlain() }; }
      G0 = { tex: 'g(x) = \\frac{x^{2} + ' + c + '}{' + d + '}', dom: '[0, 1]', k: Q(2, d), ktex: T.num(Q(2, d)), kwhy: '$g\'(x) = \\frac{2x}{' + d + '}$, so $|g\'| \\le \\frac{2}{' + d + '}$ on $[0, 1]$; by the MVT, $|g(x) - g(y)| \\le \\frac{2}{' + d + '}|x - y|$. Also $g$ maps $[0, 1]$ into $\\left[\\frac{' + c + '}{' + d + '}, \\frac{' + (c + 1) + '}{' + d + '}\\right] \\subseteq [0, 1]$.', g: function (x) { x = q(x); return x.mul(x).add(c).div(d); }, fp: fp, fwhy: 'Solve $x = \\frac{x^{2} + ' + c + '}{' + d + '}$: $x^{2} - ' + d + 'x + ' + c + ' = 0$, and keep the root in $[0, 1]$.', plain: '(x^2+' + c + ')/' + d, x0s: [0, 1] }; }
    else { var a = R.int(2, 3), s2 = surd(a * a + 4); G0 = { tex: 'g(x) = \\frac{1}{x + ' + a + '}', dom: '[0, 1]', k: Q(1, a * a), ktex: T.num(Q(1, a * a)), kwhy: '$|g\'(x)| = \\frac{1}{(x + ' + a + ')^{2}} \\le \\frac{1}{' + (a * a) + '}$ on $[0, 1]$. And $g$ maps $[0, 1]$ into $\\left[\\frac{1}{' + (a + 1) + '}, \\frac{1}{' + a + '}\\right] \\subseteq [0, 1]$.', g: function (x) { return q(1).div(q(x).add(a)); }, fp: { tex: '\\frac{-' + a + ' + ' + s2.tex + '}{2}', plain: '(-' + a + '+' + s2.plain + ')/2' }, fwhy: 'Solve $x = \\frac{1}{x + ' + a + '}$: $x^{2} + ' + a + 'x - 1 = 0$, and keep the positive root.', plain: '1/(x+' + a + ')', x0s: [0, 1] }; }
    if (shape === 'k') return { q: 'Find the smallest contraction constant $k$ for $' + G0.tex + '$ on $' + G0.dom + '$ (the smallest $k$ with $|g(x) - g(y)| \\le k|x - y|$ for all $x, y$ there).', a: num(G0.k.toPlain()),
      steps: [G0.kwhy, 'So $k = ' + G0.ktex + ' < 1$: $g$ is a contraction, and the theorem gives exactly one fixed point.'], hint: 'Bound $|g\'|$ on the set (the mean value theorem turns it into a contraction constant).', data: { k: 'k', kind: kd, g: G0.plain, kv: G0.k.toPlain() } };
    if (shape === 'fixed') return { q: 'The contraction $' + G0.tex + '$ on $' + G0.dom + '$ has exactly one fixed point. Find it.', a: num(G0.fp.plain),
      steps: [G0.fwhy, 'The fixed point is $' + G0.fp.tex + '$.', 'The iterates $x_{n+1} = g(x_n)$ converge to it from any starting point in the set.'], hint: 'Solve $g(x) = x$.', data: { k: 'fixed', kind: kd, g: G0.plain, fp: G0.fp.plain } };
    var x0 = R.pick(G0.x0s), x1 = G0.g(x0), x2 = G0.g(x1);
    if (shape === 'iter') return { q: 'Iterate the contraction $' + G0.tex + '$ starting from $x_0 = ' + x0 + '$. Find $x_1$ and $x_2$.', a: multi([part('$x_1 =$', num(x1.toPlain())), part('$x_2 =$', num(x2.toPlain()))]),
      steps: ['$x_1 = g(' + x0 + ') = ' + T.num(x1) + '$.', '$x_2 = g(x_1) = ' + T.num(x2) + '$.', 'The iterates approach the fixed point $' + G0.fp.tex + '$; each step shrinks the distance to it by at least the factor $' + G0.ktex + '$.'],
      hint: 'Substitute, then substitute again.', viz: L === 1 ? { name: 'ra-cobweb', opts: { g: G0.plain, x0: x0, steps: 2, xmin: kd === 'lin' ? -1 : 0, xmax: kd === 'lin' ? G0.fp.plain : 1, quiet: true, edit: false } } : undefined, data: { k: 'iter', g: G0.plain, x0: x0, x1: x1.toPlain(), x2: x2.toPlain() } };
    if (shape === 'apriori') { var e = epsPick(R, 2), eq = q(e), d1 = x1.sub(x0).abs(), kq = G0.k, n0 = firstN(function (n) { return kq.pow(n).mul(d1).div(q(1).sub(kq)).lt(eq); }, 1, 400);
      return { q: 'For $' + G0.tex + '$ on $' + G0.dom + '$ ($k = ' + G0.ktex + '$) with $x_0 = ' + x0 + '$, so $x_1 = ' + T.num(x1) + '$, the contraction theorem gives $|x_n - x^{*}| \\le \\frac{k^{n}}{1 - k}|x_1 - x_0|$. Find an $n$ that makes this bound less than $' + epsTex(e) + '$. (Any such $n$ is right.)', a: multi([part('$n =$', anyN(n0))]),
        steps: ['$|x_1 - x_0| = ' + T.num(d1) + '$ and $\\frac{1}{1 - k} = ' + T.num(q(1).div(q(1).sub(kq))) + '$.', 'The bound $' + T.num(q(1).div(q(1).sub(kq)).mul(d1)) + ' \\cdot \\left(' + G0.ktex + '\\right)^{n}$ first drops below $' + epsTex(e) + '$ at $n = ' + n0 + '$.', 'So $n = ' + n0 + '$ iterations are enough, and more are fine. The bound is known before computing anything: an a priori estimate.'],
        hint: 'Compute the bound for $n = 1, 2, 3, \\ldots$', data: { k: 'apriori', g: G0.plain, kk: kq.toPlain(), x0: x0, d1: d1.toPlain(), e: eq.toPlain(), n0: n0 } }; }
    return { q: 'On $[1, \\infty)$, $g(x) = x + \\frac{1}{x}$ satisfies $|g(x) - g(y)| < |x - y|$ for $x \\ne y$, yet it has no fixed point. Why doesn\'t the contraction mapping theorem apply?', a: mc('There is no single $k < 1$ with $|g(x) - g(y)| \\le k|x - y|$: $g\'(x) = 1 - \\frac{1}{x^{2}}$ gets arbitrarily close to $1$.', ['$[1, \\infty)$ is not complete.', '$g$ does not map $[1, \\infty)$ into itself.', '$g$ is not continuous.']),
      steps: ['$[1, \\infty)$ is closed in $\\mathbb{R}$, so it is complete, and $g$ maps it into itself.', 'But the ratio $\\frac{|g(x) - g(y)|}{|x - y|}$ can be as close to $1$ as you like, so no fixed $k < 1$ works. Indeed $x + \\frac{1}{x} = x$ has no solution.'], hint: 'The theorem needs one constant $k < 1$ for all pairs.', data: { k: 'mc' } };
  });

// ---- 99-tail.js
})(typeof window !== 'undefined' ? window.MathLadder : this.MathLadder);

/* ---- More forms of the same questions (round 7, "widen", a supplement to the wider numbers above): a topic whose own
   generator still has few different problems at a level sometimes asks the same skill in another form, built only from
   problems that generator made, so every answer is the generator's own:
   - check an answer: the question with a classmate's answer, and "Is that right?" (Yes / No; not in placement). The
     classmate's answer is either the right one or a nearby wrong one, and a wrong one is used only when the answer
     checker rejects it;
   - two at once: two different short questions of the topic, answered together.
   Topics whose generator already varies a lot at a level are left as they are. Placed after the generators and
   registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'ra', VAR = {};
  // how often another form is used: never when the topic's own generator already varies a lot at this level, up to
  // half the time when it has few different questions (counted once per topic and level from 40 fixed seeds)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 37 ? 0 : VAR[key] >= 30 ? 0.3 : VAR[key] >= 20 ? 0.45 : 0.55;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function okAns(a, v) { try { return ML.check(a, v).ok; } catch (e) { return null; } }
  // a nearby wrong answer for a number or an expression, or null
  function wrongFor(R, a) {
    var v = String(ML.answerValue(a)), cands = [], m;
    if (a.t === 'num') {
      if (/^-?\d+$/.test(v)) { var n = +v; cands = [n + 1, n - 1, -n, 2 * n, n + 2, n - 2, n + 10].map(String); }
      else if ((m = /^(-?)(\d+)\/(\d+)$/.exec(v))) { var s = m[1], p = +m[2], q = +m[3]; cands = [s + (p + 1) + '/' + q, s + p + '/' + (q + 1), (s ? '' : '-') + p + '/' + q, s + q + '/' + p, s + (p * 2) + '/' + q]; }
      else if (/^-?\d+\.\d+$/.test(v)) { var x = +v, dp = v.split('.')[1].length, st = Math.pow(10, -Math.min(dp, 2)); cands = [x + st, x - st, -x, x * 10, x / 10].map(function (y) { return ML.util.numStr(ML.util.round(y, dp + 1)); }); }
      else return null;
    } else if (a.t === 'expr') {
      if (v.length > 60) return null;
      if (/ \+ /.test(v)) cands.push(v.replace(' + ', ' - '));
      if (/ - /.test(v)) cands.push(v.replace(' - ', ' + '));
      if ((m = /(^|[^\d.^])(\d+)(?![\d.])/.exec(v)) && !/\^$/.test(v.slice(0, m.index + m[1].length))) cands.push(v.slice(0, m.index) + m[1] + (+m[2] + 1) + v.slice(m.index + m[0].length));
      if (!cands.length) return null;
    } else return null;
    var nv = function (s) { var mm = /^(-?\d+)\/(\d+)$/.exec(s); return mm ? mm[1] / mm[2] : /^-?\d+(\.\d+)?$/.test(s) ? +s : null; }, v0 = nv(v);
    cands = R.shuffle(cands.filter(function (c, i, all) { var x = nv(c); return c !== v && all.indexOf(c) === i && (x === null || v0 === null || (Math.abs(x - v0) >= 0.01 * Math.max(Math.abs(v0), 1e-12) && (v0 <= 0 || x > 0) && (v0 <= 0 || v0 > 1 || x <= 1))); })); // a believable slip: the same sign, and at most 1 when the right answer is
    for (var i = 0; i < cands.length; i++) if (okAns(a, cands[i]) === false) return cands[i];
    return null;
  }
  function checkable(p) {
    var a = p.a;
    if (!a || p.unit || (a.form && a.form !== 'int' && a.form !== 'frac' && a.form !== 'simplest')) return false;
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b|\bclassmate\b/i.test(txt(p.q))) return false;
    if (a.t === 'num' || a.t === 'expr') return okAns(a, ML.answerValue(a)) === true;
    if (a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    return true;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || ['mc', 'tf', 'num'].indexOf(p.a.t) < 0) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= 300 && !/<(table|svg|img|canvas|ol|ul)\b|\$\$|\\begin\{/i.test(p.q);
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), shown, good;
    if (a.t === 'mc') {
      var k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
      shown = a.choices[k]; good = a.choices[a.v];
    } else {
      good = ML.answerShow(a);
      var w = right ? null : wrongFor(R, a);
      if (!right && w === null) return null;
      shown = right ? good : ML.answerShow(Object.assign({}, a, { v: w }));
      if (!shown || /undefined|NaN/.test(shown)) return null;
    }
    var q = p.q + (a.t === 'mc' && listed(p.q) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>A classmate answered: <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is ') + end(good)].concat(p.steps || []) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var out = { q: '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q + '</li><li>' + p2.q + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + (p.steps || [''])[0]].concat((p.steps || []).slice(1), ['Question 2: ' + (p2.steps || [''])[0]], (p2.steps || []).slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), mode = ctx && ctx.mode;
      if (!p || !p.a || !ML.check || !ML.answerShow || !R.chance(share(id, base, ctx))) return p;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check', 'check');
      if (pairable(p, true)) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = null;
      try { out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base); } catch (e) { out = null; }
      return out || p;
    };
    fn._forms = true;
    fn._base = base; // the topic's own generator (for tests)
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
