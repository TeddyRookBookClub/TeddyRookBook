/* Math Ladder generators: Numerical Analysis (course key num, /math/numerical-analysis/).
   Built from /tmp/work_ug_num/gen/*.js by build-gen.js. One generator per topic in data/math/topics/num.json.

   Conventions (from the curriculum notes): machine epsilon ε = 2^-52 (the gap between 1 and the next double), unit
   roundoff u = ε/2; errors e_n = |x_n − r|; norms ‖·‖₁, ‖·‖₂, ‖·‖∞; stability always about y′ = λy.
   Hand-sized floating-point work uses a stated toy system ("k significant decimal digits, rounding after every
   operation") and the expected answer is computed exactly in that system with exact rationals (ML.Q).
   Every problem carries p._d (the inputs) so the tests in the work folder can recompute its answer independently. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, Q = ML.Q, U = ML.util, M = U.M;
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function q(x) { return Q.from(x); }
  function isQ(x) { return x instanceof Q; }
  // ---------- exact numbers as text
  function tq(x) { return T.num(q(x)); } // TeX: integer, or \frac
  function plainQ(x) { return q(x).toPlain(); }
  function decStr(x) { // exact decimal string of a terminating rational (no rounding), else null
    x = q(x); if (!x.isTerminating()) return null;
    for (var dp = 0; dp <= 60; dp++) { var s = x.toDec(dp); if (Q.from(s).eq(x)) return s; }
    return null;
  }
  function tiny(x) { x = q(x); return !x.isZero() && (x.abs().lt(Q(1, 10000)) || x.abs().ge(Q(10000000))); }
  function td(x) { // TeX: exact decimal when it terminates (scientific notation when tiny or huge), else a fraction
    var s = decStr(x); if (s === null) return tq(x);
    if (tiny(x)) { var ms = decStr(x.div(pow10(exp10(x)))); return ms && ms.length <= 8 ? sci(x) : tq(x); }
    return s.length > 12 ? tq(x) : s;
  }
  function tdg(x) { // a decimal with thin spaces every 3 digits after the point (keeps long decimals readable)
    var s = typeof x === 'string' ? x : td(x), m = /^(-?\d+)\.(\d+)$/.exec(s); if (!m) return s;
    return m[1] + '.' + m[2].replace(/(\d{3})(?=\d)/g, '$1\\,');
  }
  function pow10(e) { return e >= 0 ? q(10n ** BigInt(e)) : Q(1n, 10n ** BigInt(-e)); }
  function exp10(x) { // e with 10^e <= |x| < 10^(e+1), x a nonzero Q
    x = q(x).abs(); var e = Math.floor(Math.log10(x.toNumber()));
    while (pow10(e).gt(x)) e--; while (!pow10(e + 1).gt(x)) e++; return e;
  }
  // round a rational to k significant decimal digits (round half away from zero): the toy "k-digit arithmetic"
  function fl(x, k) {
    x = q(x); if (x.isZero()) return x;
    var s = x.sign(), a = x.abs(), e = exp10(a), sc = pow10(k - 1 - e), m = a.mul(sc), n = m.floor();
    if (m.sub(n).ge(Q(1, 2))) n = n.add(1);
    return Q(n.n * BigInt(s), 1n).div(sc);
  }
  function rd(x, dp) { return Q.from(q(x).toDec(dp)); } // round to dp decimal places
  // the k significant digits of a rounded number, trailing zeros kept: sig(1, 3) -> "1.00"
  function sig(x, k) {
    x = q(x); if (x.isZero()) return '0';
    var e = exp10(x), dp = Math.max(0, k - 1 - e); return x.toDec(dp);
  }
  // a nonzero rational (or JS number) in scientific notation, TeX: sci(0.0000025) -> "2.5 \times 10^{-6}"
  function sci(x, k) {
    x = q(x); if (x.isZero()) return '0';
    var e = exp10(x), m = x.div(pow10(e)), ms = k ? sig(m, k) : decStr(m) || m.toDec(4);
    if (ms === '10' || /^-?10(\.0*)?$/.test(ms)) { e++; ms = ms.replace('10', '1'); }
    return (ms === '1' ? '' : ms === '-1' ? '-' : ms + ' \\times ') + '10^{' + e + '}';
  }
  function sciPlain(x) { // plain (CAS) form of a rational in scientific notation, for answer specs: "2.5e-6"
    x = q(x); var e = exp10(x), m = decStr(x.div(pow10(e))); return m === null ? x.toPlain() : m + 'e' + e;
  }
  // ---------- answer specs
  function av(x) { x = q(x); var s = decStr(x); if (s === null) return x.toPlain(); if (tiny(x)) { var ms = decStr(x.div(pow10(exp10(x)))); return ms && ms.length <= 8 ? sciPlain(x) : x.toPlain(); } return s.length > 12 ? x.toPlain() : s; } // answer value
  function xf(x) { x = q(x); return x.isZero() ? 'x' : x.sign() < 0 ? '(x + ' + td(x.neg()) + ')' : '(x - ' + td(x) + ')'; } // the factor (x - a)
  function num(x, extra) { var v = isQ(x) ? av(x) : String(x); var o = { t: 'num', v: v }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function tup(arr) { return { t: 'tuple', v: arr.map(function (x) { return isQ(x) ? av(x) : String(x); }) }; }
  function matA(rows) { return { t: 'matrix', v: rows.map(function (r) { return r.map(function (x) { return isQ(x) ? av(x) : String(x); }); }) }; }
  function mc(correct, wrongs) { var w = [], seen = { }; seen[correct] = 1; wrongs.forEach(function (x) { if (!seen[x]) { seen[x] = 1; w.push(x); } }); return { t: 'mc', choices: [correct].concat(w), v: 0 }; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function txt(arr) { return { t: 'text', v: arr }; }
  function multi(parts) { return { t: 'multi', parts: parts }; }
  // ---------- small exact linear algebra on Q
  function qm(A) { return A.map(function (r) { return r.map(q); }); }
  function qv(v) { return v.map(q); }
  function mv(A, x) { return A.map(function (r) { return r.reduce(function (s, a, j) { return s.add(q(a).mul(x[j])); }, q(0)); }); }
  function solve(A, b) { // Gaussian elimination with exact rationals (partial pivoting by first nonzero)
    var n = A.length, X = A.map(function (r, i) { return r.map(q).concat([q(b[i])]); });
    for (var k = 0; k < n; k++) {
      var p = k; while (p < n && X[p][k].isZero()) p++; if (p === n) return null;
      var t = X[k]; X[k] = X[p]; X[p] = t;
      for (var i = k + 1; i < n; i++) { var m = X[i][k].div(X[k][k]); for (var j = k; j <= n; j++) X[i][j] = X[i][j].sub(m.mul(X[k][j])); }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = X[i][n]; for (j = i + 1; j < n; j++) s = s.sub(X[i][j].mul(x[j])); x[i] = s.div(X[i][i]); }
    return x;
  }
  function det2(A) { return q(A[0][0]).mul(A[1][1]).sub(q(A[0][1]).mul(A[1][0])); }
  function inv2(A) { var d = det2(A); return [[q(A[1][1]).div(d), q(A[0][1]).neg().div(d)], [q(A[1][0]).neg().div(d), q(A[0][0]).div(d)]]; }
  function mmul(A, B) { return A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (s, a, k) { return s.add(q(a).mul(B[k][j])); }, q(0)); }); }); }
  function normInfV(v) { return v.reduce(function (m, x) { var a = q(x).abs(); return a.gt(m) ? a : m; }, q(0)); }
  function norm1V(v) { return v.reduce(function (s, x) { return s.add(q(x).abs()); }, q(0)); }
  function normInfM(A) { return A.reduce(function (m, r) { var s = norm1V(r); return s.gt(m) ? s : m; }, q(0)); }
  function norm1M(A) { return normInfM(A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); })); }
  function texM(A) { return T.mat(A.map(function (r) { return r.map(function (x) { return td(x); }); })); }
  function texCol(v) { return T.col(v.map(function (x) { return td(x); })); }
  function texV(v) { return '(' + v.map(function (x) { return td(x); }).join(', ') + ')'; }
  function texVf(v) { return '(' + v.map(function (x) { return tq(x); }).join(', ') + ')'; }
  // ---------- polynomials with rational coefficients, low -> high: P([c0, c1, c2])
  function pev(c, x) { x = q(x); var s = q(0); for (var i = c.length - 1; i >= 0; i--) s = s.mul(x).add(c[i]); return s; }
  function pder(c) { return c.slice(1).map(function (a, i) { return q(a).mul(i + 1); }); }
  function ptex(c, v) { return T.poly(c.slice().reverse().map(function (a) { return tq(a); }), v || 'x'); }
  function pplain(c, v) { v = v || 'x'; var s = []; for (var i = c.length - 1; i >= 0; i--) { var a = q(c[i]); if (a.isZero()) continue; s.push('(' + a.toPlain() + ')' + (i ? '*' + v + (i > 1 ? '^' + i : '') : '')); } return s.join('+') || '0'; }
  function pmul(a, b) { var out = []; for (var i = 0; i < a.length + b.length - 1; i++) out.push(q(0)); a.forEach(function (x, i) { b.forEach(function (y, j) { out[i + j] = out[i + j].add(q(x).mul(y)); }); }); return out; }
  function padd(a, b) { var n = Math.max(a.length, b.length), out = []; for (var i = 0; i < n; i++) out.push(q(a[i] || 0).add(b[i] || 0)); return out; }
  function pscale(a, k) { return a.map(function (x) { return q(x).mul(k); }); }
  function pint(c, a, b) { var s = q(0); c.forEach(function (x, i) { s = s.add(q(x).mul(q(b).pow(i + 1).sub(q(a).pow(i + 1))).div(i + 1)); }); return s; }
  // ---------- text pieces
  var SUBS = '₀₁₂₃₄₅₆₇₈₉';
  function sub(n) { return String(n).split('').map(function (d) { return SUBS[+d]; }).join(''); }
  function sgnTerm(x) { x = q(x); return x.sign() < 0 ? ' - ' + td(x.neg()) : ' + ' + td(x); } // " + 3", " - 0.5"
  function cv(c, v) { c = q(c); return c.eq(1) ? v : c.eq(-1) ? '-' + v : td(c) + v; } // coefficient times a variable
  function cterm(x) { return q(x).isZero() ? '' : sgnTerm(x); } // like sgnTerm, but nothing for 0
  function paren(x) { x = q(x); return x.sign() < 0 ? '(' + td(x) + ')' : td(x); }
  function parenF(x) { x = q(x); return x.sign() < 0 ? '\\left(' + tq(x) + '\\right)' : tq(x); }
  function frac(a, b) { return '\\frac{' + a + '}{' + b + '}'; }
  function ord(n) { return U.ordinal(n); }

  // =====================================================================================================
  // Unit 1: Numbers on a Computer
  // =====================================================================================================
  // √x rounded to k significant digits, exactly (null when x sits on a rounding boundary)
  function flSqrt(x, k) {
    x = q(x); var c0 = Q.from(Number(Math.sqrt(x.toNumber()).toPrecision(k)));
    for (var t = -1; t <= 1; t++) {
      var e = exp10(c0), ulp = pow10(e - k + 1), c = c0.add(ulp.mul(t)), half = pow10(exp10(c) - k + 1).div(2);
      var lo = c.sub(half), hi = c.add(half);
      if (lo.mul(lo).lt(x) && x.lt(hi.mul(hi))) return c;
      if (lo.mul(lo).eq(x) || hi.mul(hi).eq(x)) return null;
    }
    return null;
  }
  function trueSqrtDec(x, dp) { return Math.sqrt(q(x).toNumber()).toFixed(dp); }

  // ---------------------------------------------------------------- num.error-measures
  G('num.error-measures', function (R, ctx) {
    var kind = lv(ctx, R.pick(['abs', 'rel', 'rel']), R.pick(['rel', 'pct', 'which', 'reverse']), R.pick(['sig', 'sig', 'which', 'reverse', 'pct']));
    if (kind === 'abs' || kind === 'rel' || kind === 'pct') {
      // true values whose only prime factors are 2 and 5, so relative errors terminate
      var base = R.pick([[250, 2], [125, 2], [400, 3], [80, 1], [2.5, 3], [0.04, 5], [1600, 1], [50, 2], [0.8, 3], [3.2, 2], [12.5, 2], [0.625, 4]]);
      var x = q(base[0]), dpl = base[1], e = q(R.nz(-9, 9)).div(pow10(dpl)), xa = x.add(e);
      if (xa.sign() <= 0) xa = x.sub(e.abs()), e = xa.sub(x);
      var ab = xa.sub(x).abs(), rel = ab.div(x.abs());
      var ctxs = R.pick([['length of a beam', 'm'], ['mass of a sample', 'g'], ['volume of a tank', 'L'], ['time of a run', 's'], ['', '']]);
      var lead = ctxs[0] ? 'The ' + ctxs[0] + ' is ' : 'A quantity is ';
      var q0 = lead + '$x = ' + td(x) + '$' + (ctxs[1] ? ' ' + ctxs[1] : '') + '. A measurement gives $\\tilde{x} = ' + td(xa) + '$' + (ctxs[1] ? ' ' + ctxs[1] : '') + '. ';
      var st = ['Absolute error: $|\\tilde{x} - x| = |' + td(xa) + ' - ' + td(x) + '| = ' + td(ab) + '$.'];
      if (kind === 'abs') return { q: q0 + 'Find the absolute error.', a: num(ab), steps: st.concat(['The absolute error carries the units of $x$' + (ctxs[1] ? ' (' + ctxs[1] + ')' : '') + '.']), hint: 'Subtract and take the absolute value.', _d: { k: kind, x: x.toPlain(), xa: xa.toPlain() } };
      st.push('Relative error: divide by the size of the <b>true</b> value: $\\dfrac{' + td(ab) + '}{' + td(x.abs()) + '} = ' + td(rel) + '$.');
      if (kind === 'rel') return { q: q0 + 'Find the relative error as a decimal.', a: num(rel), steps: st.concat(['It has no units: the error is $' + td(rel) + '$ of the true value.']), hint: 'Relative error = |approximation − true| ÷ |true|.', _d: { k: kind, x: x.toPlain(), xa: xa.toPlain() } };
      return { q: q0 + 'Find the relative error as a percent.', a: num(rel.mul(100), { pct: true }), steps: st.concat(['As a percent: $' + td(rel) + ' \\times 100\\% = ' + td(rel.mul(100)) + '\\%$.']), hint: 'Divide the absolute error by the true value, then multiply by 100%.', _d: { k: kind, x: x.toPlain(), xa: xa.toPlain() } };
    }
    if (kind === 'which') {
      // two measurements: the one with the larger absolute error is the better one in relative terms
      var pair = R.pick([
        [[q(5000), q(4), 'the distance between two towns', 'm'], [q('0.05'), q('0.002'), 'the thickness of a board', 'm']],
        [[q(80), q('0.4'), 'the length of a hallway', 'm'], [q('0.8'), q('0.02'), 'the length of a pencil', 'm']],
        [[q(2000), q(5), 'the mass of a car', 'kg'], [q(2), q('0.1'), 'the mass of a book', 'kg']],
        [[q(400), q(2), 'the height of a building', 'ft'], [q('0.5'), q('0.01'), 'the width of a phone', 'ft']]]);
      var big = pair[0], small = pair[1];
      var rb = big[1].div(big[0]), rs = small[1].div(small[0]);
      var names = ['A: ' + big[2], 'B: ' + small[2]];
      return {
        q: 'Measurement A of ' + big[2] + ' ($' + td(big[0]) + '$ ' + big[3] + ') is off by $' + td(big[1]) + '$ ' + big[3] + '. Measurement B of ' + small[2] + ' ($' + td(small[0]) + '$ ' + small[3] + ') is off by $' + td(small[1]) + '$ ' + small[3] + '. Which measurement is more accurate relative to its size?',
        a: mc('A, the measurement with the larger absolute error', ['B, because its absolute error is smaller', 'They are equally accurate', 'There is no way to compare them']),
        steps: ['Compare relative errors, not absolute errors, because the two quantities have very different sizes.', 'A: $' + frac(td(big[1]), td(big[0])) + ' = ' + td(rb) + '$.', 'B: $' + frac(td(small[1]), td(small[0])) + ' = ' + td(rs) + '$.', 'A has the smaller relative error, so A is more accurate, even though its absolute error is larger.'],
        hint: 'Divide each error by the size of the thing measured.', _d: { k: kind, rb: rb.toPlain(), rs: rs.toPlain() }
      };
    }
    if (kind === 'reverse') {
      var xv = q(R.pick([40, 250, 1200, 80, 600, 0.5, 2.5, 75])), rp = q(R.pick([1, 2, 4, 5, 0.5, 0.2])).div(100), bound = xv.mul(rp);
      return {
        q: 'A true value is $' + td(xv) + '$, and an approximation of it has relative error at most $' + td(rp.mul(100)) + '\\%$. What is the largest possible absolute error?',
        a: num(bound),
        steps: ['Relative error = absolute error ÷ |true value|, so absolute error = relative error × |true value|.', '$' + td(rp) + ' \\times ' + td(xv) + ' = ' + td(bound) + '$.', 'So the approximation lies between $' + td(xv.sub(bound)) + '$ and $' + td(xv.add(bound)) + '$.'],
        hint: 'Turn the percent into a decimal and multiply by the true value.', _d: { k: kind, x: xv.toPlain(), r: rp.toPlain() }
      };
    }
    // sig: significant digits by the rule |x − x̃|/|x| ≤ 5 × 10^(−t)
    var cs = R.pick([['\\pi', '3.14159265'], ['\\sqrt{2}', '1.41421356'], ['e', '2.71828183'], ['\\sqrt{3}', '1.73205081'], ['\\ln 2', '0.693147181'], ['\\sqrt{5}', '2.23606798'], ['\\varphi', '1.61803399']]);
    var xt = q(cs[1]), places = R.int(2, 5), chop = R.coin(), xs = chop ? Q.from(cs[1].slice(0, cs[1].indexOf('.') + 1 + places)) : rd(xt, places);
    var rr = xs.sub(xt).abs().div(xt), t = 0; if (rr.isZero()) rr = Q(1, 10n ** 12n);
    while (rr.le(pow10(-(t + 1)).mul(5))) t++;
    return {
      q: 'Take $x = ' + cs[1] + '$ as the true value of $' + cs[0] + '$ and the approximation $\\tilde{x} = ' + td(xs) + '$. An approximation is correct to $t$ significant digits when $t$ is the largest whole number with $$\\frac{|\\tilde{x} - x|}{|x|} \\le 5 \\times 10^{-t}.$$ Find $t$.',
      a: num(t, { form: 'int' }),
      steps: ['Absolute error: $|' + td(xs) + ' - ' + cs[1] + '| = ' + tdg(xs.sub(xt).abs()) + '$.', 'Relative error: $' + tdg(xs.sub(xt).abs()) + ' \\div ' + cs[1] + ' \\approx ' + sci(fl(rr, 3), 3) + '$.', 'It is at most $5 \\times 10^{-' + t + '}$' + ' but more than $5 \\times 10^{-' + (t + 1) + '}$, so $t = ' + t + '$.'],
      hint: 'Compute the relative error, then compare it with 5 × 10⁻¹, 5 × 10⁻², 5 × 10⁻³, …', _d: { k: kind, x: xt.toPlain(), xa: xs.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.binary-fractions
  function toBin(x, maxBits) { // x in [0, 1): digits by doubling; returns { bits, steps: [[2x, bit, frac]], terminates }
    x = q(x); var bits = '', steps = [];
    for (var i = 0; i < maxBits; i++) {
      if (x.isZero()) return { bits: bits, steps: steps, terminates: true };
      var d = x.mul(2), b = d.ge(1) ? 1 : 0; x = d.sub(b); bits += b; steps.push([d, b, x]);
    }
    return { bits: bits, steps: steps, terminates: x.isZero() };
  }
  G('num.binary-fractions', function (R, ctx) {
    var kind = lv(ctx, R.pick(['tobin', 'todec']), R.pick(['digits', 'terminates', 'tobin2', 'todec']), R.pick(['repeat', 'period', 'digits', 'terminates']));
    if (kind === 'tobin' || kind === 'tobin2') {
      var k = kind === 'tobin' ? R.int(2, 4) : R.int(4, 5), m = R.int(1, Math.pow(2, k) - 1) | 1, x = Q(m, Math.pow(2, k)), w = kind === 'tobin2' ? R.int(1, 6) : 0;
      var xb = toBin(x, 10), wb = w.toString(2), s = wb + '.' + xb.bits, total = x.add(w);
      return {
        q: 'Write $' + td(total) + '$ in base 2.',
        a: txt([s, s + '₂'].concat(w ? [] : ['.' + xb.bits])),
        steps: (w ? ['Whole part: $' + w + ' = ' + wb + '_2$.'] : []).concat(['Fraction part: double, keep the whole-number part as the next bit, repeat with what is left.']).concat(xb.steps.map(function (r) { return '$2 \\times ' + td(r[0].div(2)) + ' = ' + td(r[0]) + '$: bit $' + r[1] + '$' + (r[2].isZero() ? ', nothing left, so it stops.' : ', keep $' + td(r[2]) + '$.'); })).concat(['So $' + td(total) + ' = ' + s + '_2$. Check: ' + xb.bits.split('').map(function (b, i) { return b === '1' ? '\\frac{1}{' + Math.pow(2, i + 1) + '}' : null; }).filter(Boolean).map(function (t) { return '$' + t + '$'; }).join(' + ') + (w ? ' plus ' + w : '') + ' gives $' + td(total) + '$.']),
        hint: 'Double the fraction part again and again; each whole-number part is the next binary digit.', _d: { k: 'tobin', x: total.toPlain(), s: s }
      };
    }
    if (kind === 'todec') {
      var n = R.int(3, 5), bits = '1'; for (var i = 1; i < n; i++) bits += R.int(0, 1); bits = bits.slice(0, n - 1) + '1'; if (R.coin()) bits = '0' + bits.slice(1);
      var val = q(0); bits.split('').forEach(function (b, i) { if (b === '1') val = val.add(Q(1, Math.pow(2, i + 1))); });
      return {
        q: 'Write the binary number $0.' + bits + '_2$ as a decimal.',
        a: num(val),
        steps: ['The places after the binary point are worth $\\frac{1}{2}, \\frac{1}{4}, \\frac{1}{8}, \\frac{1}{16}, \\dots$', 'Add the places that hold a 1: ' + bits.split('').map(function (b, i) { return b === '1' ? '$' + td(Q(1, Math.pow(2, i + 1))) + '$' : null; }).filter(Boolean).join(' + ') + ' $= ' + td(val) + '$.'],
        hint: 'The first place after the point is worth 1/2, the next 1/4, then 1/8, …', _d: { k: kind, bits: bits, v: val.toPlain() }
      };
    }
    if (kind === 'digits') {
      var d = R.pick(['0.1', '0.2', '0.3', '0.4', '0.6', '0.7', '0.9', '0.35', '0.45', '0.15', '0.85', '0.05']), xd = q(d), nb = 8, r = toBin(xd, nb);
      return {
        q: 'Use repeated doubling to write $' + d + '$ in binary. Give the first ' + nb + ' binary digits after the point (cut off, not rounded), in the form 0.dddddddd.',
        a: txt(['0.' + r.bits, '.' + r.bits]),
        steps: r.steps.map(function (s, i) { return '$2 \\times ' + td(s[0].div(2)) + ' = ' + td(s[0]) + '$, so digit ' + (i + 1) + ' is $' + s[1] + '$' + (i < nb - 1 ? '; keep $' + td(s[2]) + '$.' : '.'); }).concat(['So $' + d + ' = 0.' + r.bits + '\\ldots_2$, and the doubling never reaches 0: the binary form never ends.']),
        hint: 'Double, write down the whole-number part (0 or 1), and keep only the fraction part for the next step.', _d: { k: kind, x: d, bits: r.bits }
      };
    }
    if (kind === 'terminates') {
      var pool = R.shuffle(['0.5', '0.375', '0.75', '0.625', '0.125', '0.1875', '0.1', '0.2', '0.3', '0.6', '0.05', '0.35', '0.45', '0.9']);
      var pick = pool.slice(0, 5), ok = pick.filter(function (s) { return isPow2(q(s).d); });
      if (!ok.length || ok.length === 5) { pick[0] = ok.length ? '0.1' : '0.625'; ok = pick.filter(function (s) { return isPow2(q(s).d); }); }
      var vs = []; pick.forEach(function (s, i) { if (isPow2(q(s).d)) vs.push(i); });
      return {
        q: 'Which of these decimals have a binary form that <b>ends</b>? Select all that apply.',
        a: { t: 'mc', choices: pick.map(function (s) { return '$' + s + '$'; }), v: vs },
        steps: ['A fraction in lowest terms ends in base 2 exactly when its denominator is a power of 2.'].concat(pick.map(function (s) { var f = q(s); return '$' + s + ' = ' + tq(f) + '$: denominator $' + f.d + '$, ' + (isPow2(f.d) ? 'a power of 2, so it ends.' : 'which has a factor of 5, so it repeats forever.'); })),
        hint: 'Write each decimal as a fraction in lowest terms and look at the denominator.', _d: { k: kind, pick: pick, v: vs }
      };
    }
    if (kind === 'repeat') {
      var blk = R.pick(['01', '10', '011', '001', '110', '101', '0011', '0110', '1001', '0111', '1010']), L = blk.length, B = parseInt(blk, 2), fr = Q(B, Math.pow(2, L) - 1);
      return {
        q: 'Write the repeating binary fraction $0.\\overline{' + blk + '}_2 = 0.' + [blk, blk, blk].join('\\,') + '\\ldots_2$ as a fraction in lowest terms.',
        a: num(fr, { form: 'frac' }),
        steps: ['Let $y = 0.\\overline{' + blk + '}_2$. Multiplying by $2^{' + L + '} = ' + Math.pow(2, L) + '$ moves the point ' + L + ' places: $' + Math.pow(2, L) + 'y = ' + blk + '.\\overline{' + blk + '}_2$.', 'Subtract: $' + Math.pow(2, L) + 'y - y = ' + blk + '_2 = ' + B + '$, so $' + (Math.pow(2, L) - 1) + 'y = ' + B + '$.', '$y = ' + frac(B, Math.pow(2, L) - 1) + (fr.d !== BigInt(Math.pow(2, L) - 1) || fr.n !== BigInt(B) ? ' = ' + tq(fr) : '') + '$.'],
        hint: 'Multiply by 2 to the power of the block length, then subtract to cancel the repeating tail.', _d: { k: kind, blk: blk, v: fr.toPlain() }
      };
    }
    // period: length of the repeating block of 1/n in binary = the order of 2 mod the odd part of n
    var nn = R.pick([3, 5, 7, 9, 10, 15, 20, 6, 12, 11, 13, 17]), odd = nn; while (odd % 2 === 0) odd /= 2;
    var per = 1, p2 = 2 % odd; while (p2 !== 1) { p2 = (p2 * 2) % odd; per++; }
    var bin = toBin(Q(1, nn), per + 6).bits.replace(/(\d{4})(?=\d)/g, '$1\\,');
    return {
      q: 'In binary, $\\frac{1}{' + nn + '}$ repeats forever. How many digits long is its repeating block?',
      a: num(per, { form: 'int' }),
      steps: ['Doubling $\\frac{r}{' + nn + '}$ and dropping the whole part only ever leaves fractions $\\frac{r}{' + nn + '}$, so the digits must start repeating once a fraction comes back.', 'Its binary digits begin $0.' + bin + '\\ldots_2$.', (odd === nn ? 'The fraction $\\frac{1}{' + nn + '}$ first comes back after ' + per + ' doublings, since $2^{' + per + '} - 1 = ' + (Math.pow(2, per) - 1) + '$ is the first number of that form divisible by $' + nn + '$.' : 'Factor out the powers of 2: $' + nn + ' = 2^{' + Math.round(Math.log2(nn / odd)) + '} \\times ' + odd + '$. The factor of 2 only shifts the digits, and the block length comes from $' + odd + '$: $2^{' + per + '} - 1 = ' + (Math.pow(2, per) - 1) + '$ is the first such number divisible by $' + odd + '$.'), 'So the repeating block has $' + per + '$ digits.'],
      hint: 'Do the doubling by hand and watch for a remainder you have seen before.', _d: { k: kind, n: nn, per: per }
    };
  });
  function isPow2(b) { b = BigInt(b); return b > 0n && (b & (b - 1n)) === 0n; }

  // ---------------------------------------------------------------- num.floating-point
  G('num.floating-point', function (R, ctx) {
    var kind = lv(ctx, R.pick(['gap', 'eps', 'count']), R.pick(['round', 'round', 'gap', 'tf']), R.pick(['double', 'largest', 'relerr', 'tf']));
    var p = R.int(2, 4), sys = 'a toy binary floating-point system that stores numbers as $\\pm(1.b_1 b_2' + (p > 2 ? ' \\ldots b_{' + p + '}' : '') + ')_2 \\times 2^{e}$ with $' + p + '$ fraction bits';
    if (kind === 'gap') {
      var e = R.int(-2, 3), lo = q(2).pow(e), gap = lo.div(Math.pow(2, p));
      return {
        q: 'In ' + sys + ', what is the gap between neighboring floats in $[' + td(lo) + ', ' + td(lo.mul(2)) + ')$?',
        a: num(gap),
        steps: ['In $[2^{' + e + '}, 2^{' + (e + 1) + '})$ the exponent is $e = ' + e + '$, and the last fraction bit is worth $2^{-' + p + '}$.', 'Changing that last bit moves the number by $2^{-' + p + '} \\times 2^{' + e + '} = 2^{' + (e - p) + '} = ' + td(gap) + '$.', 'The gaps double each time we pass a power of 2, so floats are not evenly spaced.'],
        hint: 'The smallest change is the last fraction bit, 2^(−p), times 2^e.', _d: { k: kind, p: p, e: e, v: gap.toPlain() }
      };
    }
    if (kind === 'eps') {
      var eps = Q(1, Math.pow(2, p));
      return {
        q: 'Machine epsilon is the gap between $1$ and the next float. Find it for ' + sys + '.',
        a: num(eps),
        steps: ['$1 = (1.' + '0'.repeat(p) + ')_2 \\times 2^{0}$.', 'The next float is $(1.' + '0'.repeat(p - 1) + '1)_2 = 1 + 2^{-' + p + '}$.', 'So machine epsilon is $2^{-' + p + '} = ' + td(eps) + '$. (Doubles have 52 fraction bits, so for them it is $2^{-52} \\approx 2.2 \\times 10^{-16}$.)'],
        hint: 'Change only the last fraction bit of 1.', _d: { k: kind, p: p, v: eps.toPlain() }
      };
    }
    if (kind === 'count') {
      var e2 = R.int(-1, 4), c = Math.pow(2, p);
      return {
        q: 'How many floats does ' + sys + ' have in the interval $[' + td(q(2).pow(e2)) + ', ' + td(q(2).pow(e2 + 1)) + ')$?',
        a: num(c, { form: 'int' }),
        steps: ['Every float there has exponent $e = ' + e2 + '$ and some choice of the $' + p + '$ fraction bits.', 'Each bit is 0 or 1, so there are $2^{' + p + '} = ' + c + '$ choices.', 'Every interval $[2^{e}, 2^{e+1})$ holds the same number of floats, so the wider intervals have wider gaps.'],
        hint: 'Count the ways to fill the fraction bits.', _d: { k: kind, p: p, v: c }
      };
    }
    if (kind === 'round' || kind === 'relerr') {
      var e3 = R.int(0, 3), lo3 = q(2).pow(e3), g = lo3.div(Math.pow(2, p)), j = R.int(0, Math.pow(2, p) - 1), f0 = lo3.add(g.mul(j));
      var frac0 = R.pick([q('0.2'), q('0.3'), q('0.7'), q('0.8'), q('0.4'), q('0.6')]), xr = f0.add(g.mul(frac0));
      if (decStr(xr) === null || decStr(xr).length > 7) { frac0 = q('0.25'); xr = f0.add(g.mul(frac0)); }
      var fx = frac0.lt(Q(1, 2)) ? f0 : f0.add(g), er = xr.sub(fx).abs();
      if (kind === 'round') return {
        q: 'In ' + sys + ', which float is nearest to $x = ' + td(xr) + '$?',
        a: num(fx),
        steps: ['$x$ lies in $[' + td(lo3) + ', ' + td(lo3.mul(2)) + ')$, where the gap between floats is $2^{' + e3 + '} \\times 2^{-' + p + '} = ' + td(g) + '$.', 'The floats next to $x$ are $' + td(f0) + '$ and $' + td(f0.add(g)) + '$.', 'The nearer one is $' + td(fx) + '$ (it is $' + td(er) + '$ away).'],
        hint: 'Find the gap between floats in the power-of-2 range that holds x, then list the floats on either side of x.', _d: { k: kind, p: p, x: xr.toPlain(), v: fx.toPlain() }
      };
      var rel = er.div(xr), bound = Q(1, Math.pow(2, p + 1));
      return {
        q: 'In ' + sys + ', $x = ' + td(xr) + '$ is stored as the nearest float, $' + td(fx) + '$. Find the relative rounding error $\\frac{|\\mathrm{fl}(x) - x|}{|x|}$ as a fraction.',
        a: num(rel),
        steps: ['Absolute error: $|' + td(fx) + ' - ' + td(xr) + '| = ' + td(er) + '$.', 'Relative error: $' + frac(td(er), td(xr)) + ' = ' + tq(rel) + '$.', 'It is below the bound $\\varepsilon/2 = 2^{-' + (p + 1) + '} = ' + tq(bound) + '$, as every rounding to nearest must be.'],
        hint: 'Divide the absolute error by x itself.', _d: { k: kind, x: xr.toPlain(), f: fx.toPlain(), v: rel.toPlain() }
      };
    }
    if (kind === 'largest') {
      var em = R.int(2, 5), big = q(2).sub(Q(1, Math.pow(2, p))).mul(q(2).pow(em));
      return {
        q: 'In ' + sys + ' and exponents $e$ from $-2$ to $' + em + '$, what is the largest number it can store?',
        a: num(big),
        steps: ['The largest fraction is all ones: $(1.' + '1'.repeat(p) + ')_2 = 2 - 2^{-' + p + '} = ' + td(q(2).sub(Q(1, Math.pow(2, p)))) + '$.', 'Use the largest exponent: $' + td(q(2).sub(Q(1, Math.pow(2, p)))) + ' \\times 2^{' + em + '} = ' + td(big) + '$.'],
        hint: 'Set every fraction bit to 1 and use the largest exponent.', _d: { k: kind, p: p, em: em, v: big.toPlain() }
      };
    }
    if (kind === 'double') {
      var shape = R.pick(['gap', 'next', 'gapNear']);
      if (shape === 'next') return {
        q: 'Doubles have 52 fraction bits. What is the smallest double larger than $1$? Give it exactly, using a power of 2.',
        a: num('1+2^(-52)'),
        steps: ['$1 = (1.000\\ldots0)_2 \\times 2^{0}$ with 52 zero bits.', 'Turn on the last bit: $1 + 2^{-52}$.', 'So machine epsilon for doubles is $2^{-52} \\approx 2.2 \\times 10^{-16}$.'],
        hint: 'Change only the 52nd fraction bit of 1.', _d: { k: 'next' }
      };
      var kk = R.int(1, 12), lo4 = Math.pow(2, kk);
      if (shape === 'gapNear') { var xn = R.int(lo4 + 1, 2 * lo4 - 1); return {
        q: 'Doubles have 52 fraction bits. What is the gap between $' + xn + '$ and the next larger double? Give it as a power of 2.',
        a: num('2^(' + (kk - 52) + ')'),
        steps: ['$' + xn + '$ lies in $[2^{' + kk + '}, 2^{' + (kk + 1) + '}) = [' + lo4 + ', ' + 2 * lo4 + ')$, so its exponent is $' + kk + '$.', 'The last fraction bit is worth $2^{-52}$, times $2^{' + kk + '}$: the gap is $2^{' + (kk - 52) + '}$.', 'Relative to $' + xn + '$ that is still about $10^{-16}$: the spacing grows with the size of the numbers.'],
        hint: 'Find the power of 2 just below the number; the gap is that power times 2^(−52).', _d: { k: 'gapNear', x: xn, e: kk - 52 }
      }; }
      return {
        q: 'Doubles have 52 fraction bits. What is the gap between neighboring doubles in $[' + lo4 + ', ' + 2 * lo4 + ')$? Give it as a power of 2.',
        a: num('2^(' + (kk - 52) + ')'),
        steps: ['In $[2^{' + kk + '}, 2^{' + (kk + 1) + '})$ the exponent is $' + kk + '$.', 'The last of the 52 fraction bits is worth $2^{-52} \\times 2^{' + kk + '} = 2^{' + (kk - 52) + '}$.'],
        hint: 'The gap is 2^(−52) times the power of 2 at the start of the interval.', _d: { k: 'gap2', e: kk - 52 }
      };
    }
    // tf
    var S = R.pick([
      ['In double precision, $0.1 + 0.2$ is exactly equal to $0.3$.', false, '$0.1$, $0.2$ and $0.3$ all repeat in binary, so each is rounded when stored; the computed sum is $0.300\\,000\\,000\\,000\\,000\\,04$ (to 17 digits), one double above the double nearest $0.3$.'],
      ['Floating-point numbers are evenly spaced along the number line.', false, 'Within $[2^{e}, 2^{e+1})$ they are evenly spaced, but the spacing doubles at every power of 2. Relative spacing stays about the same; absolute spacing grows with size.'],
      ['Every whole number from $0$ to $2^{53}$ is stored exactly as a double.', true, 'A double has 53 significant bits (the leading 1 plus 52 fraction bits), so every whole number that fits in 53 bits is exact. Past $2^{53}$ the gap becomes 2.'],
      ['Rounding a number to the nearest double changes it by a relative amount of at most $2^{-53}$.', true, 'The gap near $x$ is at most $\\varepsilon|x|$ with $\\varepsilon = 2^{-52}$, and rounding to nearest moves at most half a gap: relative error at most $\\varepsilon/2 = 2^{-53}$ (the unit roundoff).'],
      ['The gap between doubles near $10^{6}$ is the same as the gap near $1$.', false, 'The gap is $2^{-52}$ times the power of 2 at the start of the range: near $10^{6}$ (in $[2^{19}, 2^{20})$) it is $2^{-33}$, about half a million ($2^{19}$) times the gap near 1.'],
      ['$0.5$ and $0.25$ are stored exactly as doubles.', true, 'They are $2^{-1}$ and $2^{-2}$: fractions whose denominators are powers of 2 end in binary, so they are stored with no rounding.']
    ]);
    return { q: 'True or false? ' + S[0], a: tf(S[1]), steps: [S[2]], hint: 'Think about which numbers have a short binary form, and how the exponent sets the spacing.', _d: { k: 'tf', v: S[1] } };
  });

  // ---------------------------------------------------------------- num.cancellation
  function sqrtDiffCase(R, k) {
    for (var tries = 0; tries < 30; tries++) {
      var x = R.pick(k === 4 ? [100, 200, 300, 400, 500, 600, 800, 1000, 2000, 3000, 5000] : [1000, 2000, 3000, 5000, 8000, 10000, 20000, 50000]);
      var d = R.pick([1, 1, 2]), a = flSqrt(x + d, k), b = flSqrt(x, k);
      if (!a || !b) continue;
      var direct = fl(a.sub(b), k), sum = fl(a.add(b), k), rw = fl(q(d).div(sum), k);
      if (direct.isZero()) continue;
      return { x: x, d: d, a: a, b: b, direct: direct, sum: sum, rw: rw, tru: Math.sqrt(x + d) - Math.sqrt(x) };
    }
    return null;
  }
  G('num.cancellation', function (R, ctx) {
    var kind = lv(ctx, R.pick(['direct', 'lost']), R.pick(['rewrite', 'lost', 'choose']), R.pick(['both', 'choose', 'lost']));
    if (kind === 'direct' || kind === 'rewrite' || kind === 'both') {
      var k = kind === 'both' ? R.pick([4, 5]) : 4, C = sqrtDiffCase(R, k);
      if (!C) C = { x: 1000, d: 1, a: flSqrt(1001, 4), b: flSqrt(1000, 4) }, C.direct = fl(C.a.sub(C.b), 4), C.sum = fl(C.a.add(C.b), 4), C.rw = fl(Q(1).div(C.sum), 4), C.tru = Math.sqrt(1001) - Math.sqrt(1000), k = 4;
      var expr = '\\sqrt{' + (C.x + C.d) + '} - \\sqrt{' + C.x + '}', rwx = frac(C.d, '\\sqrt{' + (C.x + C.d) + '} + \\sqrt{' + C.x + '}');
      var sys = 'Work in ' + k + '-digit decimal arithmetic: round every result, including each square root, to ' + k + ' significant digits.';
      var s1 = ['$\\sqrt{' + (C.x + C.d) + '} \\approx ' + sig(C.a, k) + '$ and $\\sqrt{' + C.x + '} \\approx ' + sig(C.b, k) + '$ (' + k + ' digits).'];
      var dSteps = s1.concat(['Subtract: $' + sig(C.a, k) + ' - ' + sig(C.b, k) + ' = ' + td(C.direct) + '$.', 'The true value is $' + C.tru.toPrecision(6) + '\\ldots$, so the leading digits cancelled and only ' + (exp10(C.direct) - (exp10(C.a) - k + 1) + 1) + ' significant digit' + (exp10(C.direct) - (exp10(C.a) - k + 1) + 1 === 1 ? ' is' : 's are') + ' left, mostly round-off.']);
      var rSteps = s1.concat(['Multiply by the conjugate over itself: $' + expr + ' = ' + rwx + '$. No subtraction of close numbers remains.', 'Denominator: $' + sig(C.a, k) + ' + ' + sig(C.b, k) + ' = ' + sig(C.sum, k) + '$.', 'Divide: $' + C.d + ' \\div ' + sig(C.sum, k) + ' \\approx ' + sig(C.rw, k) + '$, which agrees with the true value $' + C.tru.toPrecision(6) + '\\ldots$ to about ' + k + ' digits.']);
      if (kind === 'direct') return { q: sys + ' Compute $' + expr + '$ directly, by subtracting the two rounded roots.', a: num(C.direct), steps: dSteps, hint: 'Round each square root to ' + k + ' significant digits first, then subtract.', _d: { k: kind, x: C.x, d: C.d, dig: k, v: C.direct.toPlain() } };
      if (kind === 'rewrite') return { q: sys + ' Compute $' + expr + '$ using the rewritten form $$' + rwx + '.$$', a: num(C.rw), steps: rSteps, hint: 'Round each root, add them (round), then divide (round).', _d: { k: kind, x: C.x, d: C.d, dig: k, v: C.rw.toPlain() } };
      return {
        q: sys + ' Compute $' + expr + '$ two ways: (a) directly, subtracting the rounded roots; (b) as $' + rwx + '$.',
        a: multi([{ label: '(a) direct:', a: num(C.direct) }, { label: '(b) rewritten:', a: num(C.rw) }]),
        steps: dSteps.concat(rSteps.slice(1)),
        hint: 'Round after every operation, including each square root.', _d: { k: kind, x: C.x, d: C.d, dig: k, v: [C.direct.toPlain(), C.rw.toPlain()] }
      };
    }
    if (kind === 'lost') {
      for (var tries = 0; tries < 20; tries++) {
        var n = R.int(6, 8), dgt = R.int(2, n - 2), lead = String(R.int(1, 9)), i;
        for (i = 1; i < dgt; i++) lead += R.int(0, 9);
        var restA = String(R.int(1, 9)), restB; for (i = 1; i < n - dgt; i++) restA += R.int(0, 9);
        restB = String(R.int(0, +restA[0] - 1)); for (i = 1; i < n - dgt; i++) restB += R.int(0, 9);
        var pt = R.int(1, Math.min(3, dgt)), sa = lead + restA, sb = lead + restB, sA = sa.slice(0, pt) + '.' + sa.slice(pt), sB = sb.slice(0, pt) + '.' + sb.slice(pt);
        var A = Q.from(sA), B = Q.from(sB), D = A.sub(B);
        if (D.isZero()) continue;
        var last = pt - n, nd = exp10(D) - last + 1; if (nd < 1) continue;
        return {
          q: 'The numbers $a = ' + sA + '$ and $b = ' + sB + '$ are each correct in all ' + n + ' significant digits shown. Their difference $a - b$, written to the same last decimal place, has how many significant digits?',
          a: num(nd, { form: 'int' }),
          steps: ['$a - b = ' + td(D) + '$.', 'The leading ' + dgt + ' digit' + (dgt === 1 ? '' : 's') + ' of $a$ and $b$ agree, and those digits cancel.', 'Counting from the first nonzero digit of $' + td(D) + '$ to the last place of $a$ and $b$ leaves ' + nd + ' significant digit' + (nd === 1 ? '' : 's') + '.', 'So ' + n + ' good digits went in and only ' + nd + ' came out. If $a$ and $b$ had round-off in their last digit, that error would now sit in the ' + ord(nd) + ' digit of the difference.'],
          hint: 'Subtract, then count significant digits from the first nonzero digit to the last decimal place of a and b.', _d: { k: kind, a: sA, b: sB, n: n, v: nd }
        };
      }
    }
    // choose: a stable rewrite
    var Ch = R.pick([
      ['\\sqrt{x^{2} + 1} - x', 'large $x$', '\\dfrac{1}{\\sqrt{x^{2} + 1} + x}', ['\\sqrt{x^{2} + 1} - \\sqrt{x^{2}}', '\\dfrac{x^{2} + 1 - x^{2}}{1}', '\\dfrac{1}{\\sqrt{x^{2} + 1} - x}'], 'Multiply by the conjugate: $(\\sqrt{x^{2} + 1} - x)\\cdot\\frac{\\sqrt{x^{2} + 1} + x}{\\sqrt{x^{2} + 1} + x} = \\frac{1}{\\sqrt{x^{2} + 1} + x}$, a sum of two positive numbers.'],
      ['1 - \\cos x', 'small $x$', '2\\sin^{2}(x/2)', ['\\cos 0 - \\cos x', '1 - \\sqrt{1 - \\sin^{2} x}', '\\sin^{2} x'], 'Since $\\cos x = 1 - 2\\sin^{2}(x/2)$, we get $1 - \\cos x = 2\\sin^{2}(x/2)$: no subtraction at all.'],
      ['\\ln(x + 1) - \\ln x', 'large $x$', '\\ln\\left(1 + \\frac{1}{x}\\right)', ['\\ln(x + 1) - \\ln(x)', '\\frac{\\ln(x + 1)}{\\ln x}', '\\ln(x + 1 - x)'], '$\\ln(x + 1) - \\ln x = \\ln\\frac{x + 1}{x} = \\ln(1 + 1/x)$, which never subtracts two large, nearly equal logarithms.'],
      ['\\frac{1}{x} - \\frac{1}{x + 1}', 'large $x$', '\\dfrac{1}{x(x + 1)}', ['\\dfrac{x + 1 - x}{1}', '\\dfrac{1}{x} - \\dfrac{1}{x} + \\dfrac{1}{x + 1}', '\\dfrac{1}{x + 1} - \\dfrac{1}{x}'], 'Over a common denominator: $\\frac{(x + 1) - x}{x(x + 1)} = \\frac{1}{x(x + 1)}$, a single product with no cancellation.'],
      ['\\sqrt{x + 1} - \\sqrt{x}', 'large $x$', '\\dfrac{1}{\\sqrt{x + 1} + \\sqrt{x}}', ['\\sqrt{(x + 1) - x}', '\\dfrac{1}{\\sqrt{x + 1} - \\sqrt{x}}', '\\dfrac{\\sqrt{x + 1}}{\\sqrt{x}}'], 'Multiply by the conjugate: $\\frac{(x + 1) - x}{\\sqrt{x + 1} + \\sqrt{x}} = \\frac{1}{\\sqrt{x + 1} + \\sqrt{x}}$.']
    ]);
    return {
      q: 'For ' + Ch[1] + ', computing $' + Ch[0] + '$ as written loses digits to cancellation. Which formula gives the same value and avoids the cancellation?',
      a: mc('$' + Ch[2] + '$', Ch[3].map(function (s) { return '$' + s + '$'; })),
      steps: ['For ' + Ch[1] + ' the two terms are nearly equal, so subtracting them wipes out the leading digits.', Ch[4], 'The other choices either still subtract nearly equal numbers or are not equal to the original expression.'],
      hint: 'Look for an equal expression with no subtraction of nearly equal numbers.', _d: { k: 'choose' }
    };
  });

  // ---------------------------------------------------------------- num.truncation-error
  G('num.truncation-error', function (R, ctx) {
    var kind = lv(ctx, R.pick(['halve', 'order']), R.pick(['taylor', 'order', 'classify', 'halve']), R.pick(['terms', 'hfor', 'taylor', 'classify']));
    if (kind === 'halve') {
      var p = R.pick([1, 2, 4]), E = q(R.pick([8, 16, 32, 48, 64, 80, 96])).div(pow10(R.int(3, 5))), fac = R.pick([2, 2, 10]), En = E.div(q(fac).pow(p));
      return {
        q: 'A method has truncation error of order $h^{' + p + '}$. With $h = 0.1$ its error is $' + td(E) + '$. Estimate the error with $h = ' + td(Q(1, 10 * fac)) + '$.',
        a: num(En),
        steps: ['Error $\\approx Ch^{' + p + '}$, so dividing $h$ by ' + fac + ' divides the error by $' + fac + '^{' + p + '} = ' + Math.pow(fac, p) + '$.', '$' + td(E) + ' \\div ' + Math.pow(fac, p) + ' = ' + td(En) + '$.'],
        hint: 'Divide the error by (the factor h shrank by) to the power p.', _d: { k: kind, p: p, E: E.toPlain(), f: fac, v: En.toPlain() }
      };
    }
    if (kind === 'order') {
      var pp = R.int(1, 4), e1 = R.pick([2.4, 3.6, 5.1, 7.2, 1.8, 6.4]), wig = 1 + R.pick([-0.04, -0.02, 0.02, 0.03, 0]), e2 = Number((e1 / Math.pow(2, pp) * wig).toPrecision(2)), ex = -R.int(2, 4);
      return {
        q: 'Running a method with step $h$ and then $h/2$ gives errors $' + sci(q(e1).mul(pow10(ex))) + '$ and $' + sci(q(e2).mul(pow10(ex))) + '$. What is the order $p$ of the method (to the nearest whole number)?',
        a: num(pp, { form: 'int' }),
        steps: ['If error $\\approx Ch^{p}$, halving $h$ divides the error by $2^{p}$.', 'Ratio: $' + sci(q(e1).mul(pow10(ex))) + ' \\div ' + sci(q(e2).mul(pow10(ex))) + ' \\approx ' + (e1 / e2).toFixed(2) + '$.', 'This is close to $2^{' + pp + '} = ' + Math.pow(2, pp) + '$, so $p = ' + pp + '$ (more exactly, $p \\approx \\log_2 ' + (e1 / e2).toFixed(2) + ' \\approx ' + Math.log2(e1 / e2).toFixed(2) + '$).'],
        hint: 'Divide the first error by the second and ask which power of 2 that is.', _d: { k: kind, r: e1 / e2, v: pp }
      };
    }
    if (kind === 'taylor') {
      var F = R.pick([
        ['\\sin x', 'x - \\frac{x^{3}}{6}', 5, 120, 'x^{5}/120'],
        ['\\cos x', '1 - \\frac{x^{2}}{2}', 4, 24, 'x^{4}/24'],
        ['\\cos x', '1 - \\frac{x^{2}}{2} + \\frac{x^{4}}{24}', 6, 720, 'x^{6}/720'],
        ['\\sin x', 'x', 3, 6, 'x^{3}/6'],
        ['e^{-x}', '1 - x + \\frac{x^{2}}{2}', 3, 6, 'x^{3}/6']
      ]);
      var xv = R.pick([q('0.1'), q('0.2'), Q(1, 2), Q(1, 4), q('0.3')]), bound = xv.pow(F[2]).div(F[3]);
      return {
        q: 'The Taylor series of $' + F[0] + '$ at $0$ alternates, and its terms shrink, at $x = ' + td(xv) + '$. Stopping after $' + F[1] + '$ leaves a truncation error no bigger than the first term left out. Give that bound as an exact fraction.',
        a: num(bound),
        steps: ['The first omitted term is $\\pm ' + F[4].replace('/', '/') + '$, that is, $\\frac{x^{' + F[2] + '}}{' + F[3] + '}$ in size.', 'At $x = ' + td(xv) + '$: $\\frac{(' + td(xv) + ')^{' + F[2] + '}}{' + F[3] + '} = \\frac{' + ((decStr(xv.pow(F[2])) || 'xxxxxxxxxxxx').length > 10 ? tq(xv.pow(F[2])) : td(xv.pow(F[2]))) + '}{' + F[3] + '} = ' + tq(bound) + '$.', 'This error comes from the method (cutting off the series), not from round-off; it would be there even with exact arithmetic.'],
        hint: 'Find the next term of the series and put in the value of x.', _d: { k: kind, x: xv.toPlain(), pw: F[2], den: F[3], v: bound.toPlain() }
      };
    }
    if (kind === 'terms') {
      var m = R.int(3, 9), n = 0; while (q(2).div(U.factorial(n + 1)).ge(pow10(-m))) n++;
      return {
        q: 'Approximate $e = \\sum_{k=0}^{\\infty} \\frac{1}{k!}$ by stopping after the $\\frac{1}{n!}$ term. The truncation error is then less than $\\frac{2}{(n + 1)!}$. What is the smallest $n$ that guarantees an error below $10^{-' + m + '}$?',
        a: num(n, { form: 'int' }),
        steps: ['We need $\\frac{2}{(n + 1)!} < 10^{-' + m + '}$, that is, $(n + 1)! > 2 \\times 10^{' + m + '}$.', '$' + n + '! = ' + T.commas(U.factorial(n)) + '$ is too small' + (n > 0 ? '' : '') + ', and $' + (n + 1) + '! = ' + T.commas(U.factorial(n + 1)) + '$ works.', 'So $n + 1 = ' + (n + 1) + '$, and $n = ' + n + '$.'],
        hint: 'Find the first factorial bigger than 2 × 10^' + m + '.', _d: { k: kind, m: m, v: n }
      };
    }
    if (kind === 'hfor') {
      var p2 = R.pick([1, 2, 4]), fct = R.pick([2, 4, 5, 10]), h0 = q('0.1'), E0 = q(R.pick([2, 3, 4, 5, 8])).div(pow10(R.int(2, 3))), Et = E0.div(q(fct).pow(p2)), hn = h0.div(fct);
      return {
        q: 'A method has error about $Ch^{' + p2 + '}$. With $h = 0.1$ the error is $' + td(E0) + '$. What step size $h$ should bring the error down to $' + td(Et) + '$?',
        a: num(hn),
        steps: ['The error must shrink by a factor of $' + td(E0) + ' \\div ' + td(Et) + ' = ' + Math.pow(fct, p2) + '$.', 'Since error $\\propto h^{' + p2 + '}$, $h$ must shrink by $' + Math.pow(fct, p2) + '^{1/' + p2 + '} = ' + fct + '$.', '$h = 0.1 \\div ' + fct + ' = ' + td(hn) + '$.'],
        hint: 'Find the factor the error must shrink by, then take its p-th root.', _d: { k: kind, p: p2, f: fct, v: hn.toPlain() }
      };
    }
    var S = R.pick([
      ['Approximating $\\sin(0.3)$ by $0.3 - 0.3^{3}/6$.', 0, 'The series was cut off after two terms; the error is there even with exact arithmetic.'],
      ['Storing $1/3$ in a computer as $0.333\\ldots3$ (16 threes).', 1, 'The number had to be rounded to fit a fixed number of digits.'],
      ['Using $\\frac{f(x + h) - f(x)}{h}$ with $h = 0.01$ in place of $f\'(x)$.', 0, 'The limit $h \\to 0$ was replaced by a fixed $h$; the error comes from the formula, not the digits.'],
      ['Computing $(1 + 10^{-17}) - 1$ in double precision and getting $0$.', 1, '$1 + 10^{-17}$ rounds to $1$ because the gap between doubles near 1 is about $2.2 \\times 10^{-16}$.'],
      ['Approximating $\\int_0^1 e^{-x^{2}}\\,dx$ by the trapezoid rule with 10 pieces.', 0, 'The integral (a limit of sums) was replaced by one finite sum.'],
      ['Adding $10^{8}$ copies of $0.1$ one at a time and getting a total a little off from $10^{7}$.', 1, 'Each addition rounds to the nearest double, and the small rounding errors pile up.']
    ]);
    return {
      q: 'Which kind of error is this? ' + S[0],
      a: mcKeep(['Truncation error (from the method)', 'Round-off error (from storing limited digits)'], S[1]),
      steps: [S[2], S[1] === 0 ? 'So it is truncation error: an infinite process (a series, a limit, an integral) was stopped.' : 'So it is round-off error: it comes from storing numbers with a fixed number of digits.'],
      hint: 'Would the error still be there if the computer kept infinitely many digits?', _d: { k: 'classify', v: S[1] }
    };
  });

  // ---------------------------------------------------------------- num.conditioning
  G('num.conditioning', function (R, ctx) {
    var kind = lv(ctx, R.pick(['kappa', 'kappa', 'amplify']), R.pick(['kappa', 'amplify', 'which']), R.pick(['kappa', 'digits', 'which', 'kappa']));
    if (kind === 'kappa') {
      var cases = ctx.level === 1 ? ['pow', 'shift', 'exp'] : ['shift', 'recip', 'log', 'sq1', 'sqrtm1', 'exp'];
      var c = R.pick(cases), fx, x, kap, st, f;
      if (c === 'pow') { var n = R.pick([2, 3, 4, 5]), x0 = R.int(2, 9); f = 'f(x) = x^{' + n + '}'; x = q(x0); kap = q(n); st = ['$f\'(x) = ' + n + 'x^{' + (n - 1) + '}$, so $\\frac{xf\'(x)}{f(x)} = \\frac{' + n + 'x^{' + n + '}}{x^{' + n + '}} = ' + n + '$ for every $x \\ne 0$.']; }
      else if (c === 'shift') { var a0 = R.int(1, 9), dd = R.pick(['0.1', '0.01', '0.02', '0.05', '0.001', '0.5']); x = q(a0).add(dd); f = 'f(x) = x - ' + a0; kap = x.div(x.sub(a0)).abs(); st = ['$f\'(x) = 1$, so $\\kappa = \\left|\\frac{x \\cdot 1}{x - ' + a0 + '}\\right|$.', 'At $x = ' + td(x) + '$: $\\kappa = \\frac{' + td(x) + '}{' + td(x.sub(a0)) + '} = ' + td(kap) + '$.']; }
      else if (c === 'recip') { x = R.pick([q('0.9'), q('0.99'), q('0.95'), q('0.8'), q('1.01'), q('1.1')]); f = 'f(x) = \\frac{1}{1 - x}'; kap = x.div(q(1).sub(x)).abs(); st = ['$f\'(x) = \\frac{1}{(1 - x)^{2}}$, so $\\frac{xf\'(x)}{f(x)} = \\frac{x}{(1 - x)^{2}} \\cdot (1 - x) = \\frac{x}{1 - x}$.', 'At $x = ' + td(x) + '$: $\\kappa = \\left|\\frac{' + td(x) + '}{' + td(q(1).sub(x)) + '}\\right| = ' + td(kap) + '$.']; }
      else if (c === 'log') { var k = R.pick([2, 3, 4, 5, -2, -3]); x = null; f = 'f(x) = \\ln x'; kap = Q(1, Math.abs(k)); st = ['$f\'(x) = \\frac{1}{x}$, so $\\frac{xf\'(x)}{f(x)} = \\frac{1}{\\ln x}$.', 'At $x = e^{' + k + '}$: $\\kappa = \\frac{1}{|' + k + '|} = ' + tq(kap) + '$.', 'Near $x = 1$, where $\\ln x \\approx 0$, the same formula gives a huge $\\kappa$.']; fx = 'e^{' + k + '}'; }
      else if (c === 'sq1') { x = R.pick([q('1.1'), q('1.2'), q('0.9'), q('1.5'), q(2), q(3)]); f = 'f(x) = x^{2} - 1'; kap = q(2).mul(x).mul(x).div(x.mul(x).sub(1)).abs(); st = ['$f\'(x) = 2x$, so $\\kappa = \\left|\\frac{2x^{2}}{x^{2} - 1}\\right|$.', 'At $x = ' + td(x) + '$: $\\frac{2(' + td(x.mul(x)) + ')}{' + td(x.mul(x).sub(1)) + '} = ' + tq(kap) + '$.']; }
      else if (c === 'sqrtm1') { var r0 = R.pick([q('1.1'), q('1.2'), q('1.5'), q(2), q(3), q('1.01')]); x = r0.mul(r0); f = 'f(x) = \\sqrt{x} - 1'; kap = r0.div(q(2).mul(r0.sub(1))).abs(); st = ['$f\'(x) = \\frac{1}{2\\sqrt{x}}$, so $\\kappa = \\left|\\frac{x}{2\\sqrt{x}(\\sqrt{x} - 1)}\\right| = \\left|\\frac{\\sqrt{x}}{2(\\sqrt{x} - 1)}\\right|$.', 'At $x = ' + td(x) + '$, $\\sqrt{x} = ' + td(r0) + '$: $\\kappa = \\frac{' + td(r0) + '}{2(' + td(r0.sub(1)) + ')} = ' + tq(kap) + '$.']; }
      else { var xe = R.pick([2, 3, 5, 10, 20, -4]); x = q(xe); f = 'f(x) = e^{x}'; kap = x.abs(); st = ['$f\'(x) = e^{x}$, so $\\kappa = \\left|\\frac{xe^{x}}{e^{x}}\\right| = |x| = ' + td(kap) + '$.']; }
      return {
        q: 'Find the condition number $\\kappa = \\left|\\frac{xf\'(x)}{f(x)}\\right|$ of $' + f + '$ at $x = ' + (fx || td(x)) + '$.',
        a: num(kap),
        steps: st.concat([kap.gt(50) ? 'A relative error in $x$ is magnified about $' + td(kap) + '$ times: an ill-conditioned problem, whatever method computes $f$.' : 'Relative errors in $x$ are changed by a factor of about $' + td(kap) + '$ in $f(x)$.']),
        hint: 'Differentiate, then simplify x·f′(x)/f(x) before putting in the number.', _d: { k: kind, c: c, x: x ? x.toPlain() : fx, v: kap.toPlain() }
      };
    }
    if (kind === 'amplify') {
      var K = q(R.pick([20, 50, 200, 400, 1000, 5000, 25])), dl = q(R.pick([1, 2, 4, 5])).div(pow10(R.int(5, 9))), out = K.mul(dl);
      return {
        q: 'A problem has condition number $\\kappa = ' + td(K) + '$. The input has relative error $' + sci(dl) + '$. About how large can the relative error in the output be?',
        a: num(sciPlain(out), { rtol: 0.001 }),
        steps: ['Relative output error $\\approx \\kappa \\times$ relative input error.', '$' + td(K) + ' \\times ' + sci(dl) + ' = ' + sci(out) + '$.', 'This holds for any method, even one with no round-off at all: the problem itself magnifies the error.'],
        hint: 'Multiply the input error by κ.', _d: { k: kind, K: K.toPlain(), d: dl.toPlain(), v: out.toPlain() }
      };
    }
    if (kind === 'digits') {
      var m = R.int(3, 12), inD = R.pick([16, 16, 8]);
      return {
        q: 'A problem has condition number $\\kappa \\approx 10^{' + m + '}$, and its input is known to about ' + inD + ' significant digits (relative error about $10^{-' + inD + '}$). About how many significant digits of the answer can we trust, whatever method we use?',
        a: num(Math.max(0, inD - m), { form: 'int' }),
        steps: ['Relative output error $\\approx \\kappa \\times 10^{-' + inD + '} = 10^{' + m + '} \\times 10^{-' + inD + '} = 10^{' + (m - inD) + '}$.', inD - m > 0 ? 'A relative error of $10^{' + (m - inD) + '}$ means about ' + (inD - m) + ' correct digits: we lose about $\\log_{10}\\kappa = ' + m + '$ digits.' : 'The error is as large as the answer itself: no digits can be trusted.'],
        hint: 'Each factor of 10 in κ costs about one digit.', _d: { k: kind, m: m, i: inD }
      };
    }
    var W = R.pick([
      ['$f(x) = x - 1$ at $x = 1.0001$', ['$f(x) = e^{x}$ at $x = 1$', '$f(x) = \\sqrt{x}$ at $x = 1.0001$', '$f(x) = x^{3}$ at $x = 1.0001$'], 'For $x - 1$: $\\kappa = |x/(x - 1)| \\approx 10^{4}$. The others have $\\kappa = 1$, $\\frac{1}{2}$ and $3$.'],
      ['$f(x) = \\ln x$ at $x = 1.001$', ['$f(x) = \\ln x$ at $x = 1000$', '$f(x) = 2x$ at $x = 1.001$', '$f(x) = \\sqrt{x}$ at $x = 1000$'], 'For $\\ln x$: $\\kappa = 1/|\\ln x|$, and $\\ln 1.001 \\approx 0.001$, so $\\kappa \\approx 1000$. At $x = 1000$, $\\kappa = 1/\\ln 1000 \\approx 0.14$.'],
      ['$f(x) = \\frac{1}{1 - x}$ at $x = 0.999$', ['$f(x) = \\frac{1}{1 + x}$ at $x = 0.999$', '$f(x) = \\frac{1}{1 - x}$ at $x = -2$', '$f(x) = x^{2}$ at $x = 0.999$'], 'For $\\frac{1}{1 - x}$: $\\kappa = |x/(1 - x)| = 999$. For $\\frac{1}{1 + x}$ at $0.999$, $\\kappa = |x/(1 + x)| \\approx 0.5$.']
    ]);
    return {
      q: 'Which of these problems is ill-conditioned (a large $\\kappa = |xf\'(x)/f(x)|$)?',
      a: mc(W[0], W[1]),
      steps: [W[2], 'Ill-conditioning belongs to the problem, not the method: it shows up where $f(x)$ is near $0$ but $xf\'(x)$ is not.'],
      hint: 'Look for a point where f(x) is close to 0 while x·f′(x) is not.', _d: { k: 'which' }
    };
  });

  // ---------------------------------------------------------------- num.stability
  G('num.stability', function (R, ctx) {
    var kind = lv(ctx, R.pick(['concept', 'recur']), R.pick(['recur', 'quad', 'concept']), R.pick(['quadboth', 'accuracy', 'recur', 'quad']));
    if (kind === 'recur') {
      var fw = R.coin() || ctx.level === 1, n = R.int(4, ctx.level === 3 ? 9 : 7);
      if (fw) return {
        q: 'The integrals $I_n = \\int_0^1 x^{n}e^{x - 1}\\,dx$ satisfy $I_n = 1 - nI_{n-1}$, with $I_0 = 1 - e^{-1}$. If the stored $I_0$ has a small error $\\delta$, how many times larger is the error in $I_{' + n + '}$ computed by this recurrence?',
        a: num(U.factorial(n), { form: 'int' }),
        steps: ['If $I_{n-1}$ is off by $\\delta_{n-1}$, then $1 - nI_{n-1}$ is off by $n\\delta_{n-1}$ in size: each step multiplies the error by $n$.', 'After ' + n + ' steps: $1 \\cdot 2 \\cdots ' + n + ' = ' + n + '! = ' + T.commas(U.factorial(n)) + '$.', 'The true $I_n$ shrink toward $0$, while the error grows like $n!$: the recurrence is unstable. Running it backward, $I_{n-1} = (1 - I_n)/n$, divides the error by $n$ each step instead.'],
        hint: 'Track how an error in I₀ changes in one step of the formula.', _d: { k: kind, n: n, v: U.factorial(n) }
      };
      var a = R.pick([3, 4, 5, 10]), nn = R.int(4, 8), fac = Math.pow(a, nn);
      return {
        q: 'A sequence is computed with $x_{n} = 1 - ' + a + 'x_{n-1}$. The stored $x_0$ has a rounding error $\\delta$. How many times larger is the resulting error in $x_{' + nn + '}$?',
        a: num(fac, { form: 'int' }),
        steps: ['An error $\\delta$ in $x_{n-1}$ becomes $' + a + '\\delta$ in size in $x_n$, since the $1$ is exact.', 'After ' + nn + ' steps: $' + a + '^{' + nn + '} = ' + T.commas(fac) + '$.', 'Any formula that multiplies errors by more than 1 each step is unstable: the round-off swamps the answer after enough steps.'],
        hint: 'Each step multiplies the error by the size of the coefficient.', _d: { k: 'recur2', a: a, n: nn, v: fac }
      };
    }
    if (kind === 'quad' || kind === 'quadboth') {
      var b = R.pick([50, 60, 70, 80, 90, 100, 120, 150, 200]), k = 4;
      var b2 = fl(q(b * b), k), disc = fl(b2.sub(4), k), sq = flSqrt(disc, k);
      if (!sq) { b = 100; b2 = q(10000); disc = fl(q(9996), k); sq = flSqrt(disc, k); }
      var naive = fl(fl(q(b).sub(sq), k).div(2), k), den = fl(q(b).add(sq), k), stab = fl(q(2).div(den), k);
      var tru = (b - Math.sqrt(b * b - 4)) / 2;
      var qq = 'The equation $x^{2} - ' + b + 'x + 1 = 0$ has a small root near $' + (1 / b).toPrecision(3) + '$. Work in 4-digit decimal arithmetic (round every result to 4 significant digits). ';
      var st = ['$b^{2} - 4 = ' + (b * b) + ' - 4 = ' + (b * b - 4) + '$, which rounds to $' + sig(disc, 4) + '$; its root rounds to $' + sig(sq, 4) + '$.'];
      var nst = ['Naive formula: $\\frac{' + b + ' - ' + sig(sq, 4) + '}{2} = ' + td(naive) + '$: subtracting nearly equal numbers lost the digits.'];
      var sst = ['Stable formula (multiply top and bottom by the conjugate): $x = \\frac{2}{' + b + ' + \\sqrt{b^{2} - 4}} = \\frac{2}{' + sig(den, 4) + '} \\approx ' + sig(stab, 4) + '$.', 'The true root is $' + tru.toPrecision(6) + '\\ldots$; the stable formula has all 4 digits right.'];
      if (kind === 'quad') return {
        q: qq + 'Compute the small root with the stable formula $$x = \\frac{2}{' + b + ' + \\sqrt{' + b + '^{2} - 4}}.$$',
        a: num(stab), steps: st.concat(sst), hint: 'Round after each operation: the square, the subtraction, the root, the sum, the division.', _d: { k: kind, b: b, v: stab.toPlain() }
      };
      return {
        q: qq + 'Compute the small root (a) with the usual formula $\\frac{' + b + ' - \\sqrt{' + b + '^{2} - 4}}{2}$, and (b) with the equivalent formula $\\frac{2}{' + b + ' + \\sqrt{' + b + '^{2} - 4}}$.',
        a: multi([{ label: '(a) usual:', a: num(naive) }, { label: '(b) stable:', a: num(stab) }]),
        steps: st.concat(nst, sst, ['Both formulas are exact in real arithmetic. In floating point, (a) is unstable for this root and (b) is stable.']),
        hint: 'Round after each operation; in (a) look at what is left after subtracting.', _d: { k: kind, b: b, v: [naive.toPlain(), stab.toPlain()] }
      };
    }
    if (kind === 'accuracy') {
      var m = R.int(2, 12);
      return {
        q: 'A backward stable algorithm (unit roundoff about $10^{-16}$) solves a problem whose condition number is about $10^{' + m + '}$. About how many correct significant digits should we expect in the answer?',
        a: num(16 - m, { form: 'int' }),
        steps: ['Backward stable: the computed answer is the exact answer for an input changed by a relative amount near $10^{-16}$.', 'The problem magnifies that change by $\\kappa$: relative error about $10^{' + m + '} \\times 10^{-16} = 10^{' + (m - 16) + '}$.', 'So about ' + (16 - m) + ' correct digits. A stable method is not the same as an accurate answer: the conditioning sets the limit.'],
        hint: 'Relative error ≈ κ × unit roundoff.', _d: { k: kind, m: m }
      };
    }
    var S = R.pick([
      ['What does it mean for an algorithm to be backward stable?', 'Its computed answer is the exact answer to a slightly changed input.', ['It always gives an answer with a small relative error.', 'It never makes any round-off error.', 'It gives the same answer when run twice.']],
      ['A backward stable algorithm is applied to an ill-conditioned problem. What should we expect?', 'The answer may still have a large relative error.', ['The answer will be accurate to about 16 digits.', 'The algorithm will report an error.', 'The answer will be exactly right.']],
      ['Two formulas are equal in exact arithmetic. In floating point, one gives 2 correct digits and the other 15. What explains it?', 'One formula is unstable: it magnifies round-off made along the way.', ['The problem is ill-conditioned.', 'The computer made a mistake in one of them.', 'Floating point cannot compute that quantity.']]
    ]);
    return {
      q: S[0], a: mc(S[1], S[2]),
      steps: ['Conditioning is about the problem: how much the answer moves when the input moves. Stability is about the algorithm: whether it adds more error than the problem\'s conditioning forces.', 'Answer: ' + S[1]],
      hint: 'Separate the problem (conditioning) from the method (stability).', _d: { k: 'concept' }
    };
  });

  // ---------------------------------------------------------------- num.horner
  G('num.horner', function (R, ctx) {
    var kind = lv(ctx, R.pick(['eval', 'eval', 'count']), R.pick(['seq', 'eval']), R.pick(['deriv', 'seq']));
    if (kind === 'count') {
      var n = R.int(4, 12), nv = n * (n + 1) / 2;
      var naive = R.coin();
      return {
        q: naive ? 'Evaluating a degree-' + n + ' polynomial term by term, computing each power $x^{k}$ from scratch as $x \\cdot x \\cdots x$, takes how many multiplications (counting the multiplications by the coefficients too)?' : 'How many multiplications does Horner\'s method use to evaluate a polynomial of degree ' + n + '?',
        a: num(naive ? nv : n, { form: 'int' }),
        steps: naive ? ['The term $a_kx^{k}$ needs $k - 1$ multiplications for $x^{k}$ and 1 more for $a_k$: $k$ in all.', 'Total: $1 + 2 + \\cdots + ' + n + ' = \\frac{' + n + ' \\cdot ' + (n + 1) + '}{2} = ' + nv + '$.', 'Horner\'s method needs only ' + n + '.'] : ['Horner: $b = a_{' + n + '}$, then ' + n + ' times $b \\leftarrow bx + a_k$.', 'Each step is one multiplication and one addition: ' + n + ' multiplications and ' + n + ' additions.'],
        hint: naive ? 'Count the multiplications for each term and add them up.' : 'Count the nesting steps.', _d: { k: kind, n: n, naive: naive }
      };
    }
    var deg = kind === 'eval' && ctx.level === 1 ? 3 : 4, c = [];
    for (var i = 0; i <= deg; i++) c.push(R.int(-6, 6));
    c[deg] = R.nz(-3, 4); if (c[deg] === 1 && R.coin()) c[deg] = 2;
    if (kind !== 'eval' || ctx.level > 1) c[R.int(1, deg - 1)] = 0; // a missing power
    var x = R.pick([-3, -2, 2, 3, 4, -1, 5]);
    var b = [c[deg]]; for (i = deg - 1; i >= 0; i--) b.push(b[b.length - 1] * x + c[i]);
    var val = b[b.length - 1], pt = ptex(c), coefList = c.slice().reverse().join(', ');
    var st = ['Coefficients from the top, with a $0$ for each missing power: $' + coefList + '$.', 'Start with $b = ' + c[deg] + '$.'];
    for (i = 1; i <= deg; i++) st.push('$b = ' + paren(b[i - 1]) + ' \\cdot ' + paren(x) + sgnTerm(c[deg - i]) + ' = ' + b[i] + '$.');
    if (kind === 'eval') return {
      q: 'Use Horner\'s method to evaluate $p(x) = ' + pt + '$ at $x = ' + x + '$.',
      a: num(val, { form: 'int' }), steps: st.concat(['So $p(' + x + ') = ' + val + '$, with ' + deg + ' multiplications and ' + deg + ' additions.']),
      hint: 'Start with the leading coefficient; repeatedly multiply by x and add the next coefficient.', nolint: ['+ 0'], _d: { k: kind, c: c, x: x, v: val }
    };
    if (kind === 'seq') return {
      q: 'Evaluate $p(x) = ' + pt + '$ at $x = ' + x + '$ with Horner\'s method. Give the list of values $b$ takes, starting with the leading coefficient and ending with $p(' + x + ')$.',
      a: tup(b), steps: st,
      hint: 'Write a 0 for each missing power, then b ← b·x + next coefficient.', nolint: ['+ 0'], _d: { k: kind, c: c, x: x, v: b }
    };
    // deriv: Horner on the quotient gives p'(x)
    var qc = b.slice(0, deg), d = [qc[0]]; for (i = 1; i < deg; i++) d.push(d[i - 1] * x + qc[i]);
    var dval = d[d.length - 1], dc = pder(c).map(function (z) { return z.num(); });
    return {
      q: 'Horner\'s method on $p(x) = ' + pt + '$ at $x = ' + x + '$ also produces the quotient $q(x)$ with $p(x) = (' + T.lin(1, 'x', -x) + ')q(x) + p(' + x + ')$, and $p\'(' + x + ') = q(' + x + ')$. Use a second Horner pass to find $p\'(' + x + ')$.',
      a: num(dval, { form: 'int' }),
      steps: ['First pass (values of $b$): $' + b.join(', ') + '$. The last is $p(' + x + ') = ' + val + '$; the others are the coefficients of $q$: $' + qc.join(', ') + '$.', 'Second pass on $q$: ' + d.map(function (v, i) { return '$' + v + '$'; }).join(', ') + '.', 'So $p\'(' + x + ') = ' + dval + '$. Check by differentiating: $p\'(x) = ' + ptex(dc) + '$, and $p\'(' + x + ') = ' + pev(dc, x).toPlain() + '$.'],
      hint: 'Run Horner again on the numbers b (all but the last one).', _d: { k: kind, c: c, x: x, v: dval }
    };
  });

  // =====================================================================================================
  // Unit 2: Solving Equations
  // =====================================================================================================
  // a polynomial with a sign change on [a, b] (integers) and no rational root there worth hitting exactly
  function rootPoly(R) {
    var t = R.pick(['sq', 'cube', 'cubic']);
    if (t === 'sq') { var c = R.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15]), a = Math.floor(Math.sqrt(c)); return { c: [-c, 0, 1], a: a, b: a + 1, root: Math.sqrt(c), tex: 'x^{2} - ' + c }; }
    if (t === 'cube') { var d = R.pick([2, 3, 4, 5, 6, 7, 9, 10, 12, 20]), a2 = Math.floor(Math.cbrt(d)); return { c: [-d, 0, 0, 1], a: a2, b: a2 + 1, root: Math.cbrt(d), tex: 'x^{3} - ' + d }; }
    var e = R.pick([3, 4, 5, 6, 7, 8, 9]), f = function (x) { return x * x * x + x - e; }, a3 = 0; while (f(a3 + 1) < 0) a3++;
    var lo = a3, hi = a3 + 1; for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; } var r = lo; // the root, for the text
    return { c: [-e, 1, 0, 1], a: a3, b: a3 + 1, root: r, tex: 'x^{3} + x - ' + e };
  }
  function bisectRun(c, a, b, n) {
    a = q(a); b = q(b); var fa = pev(c, a), out = [];
    for (var i = 0; i < n; i++) {
      var m = a.add(b).div(2), fm = pev(c, m); out.push({ a: a, b: b, m: m, fm: fm });
      if (fm.isZero()) break;
      if (fm.sign() === fa.sign()) { a = m; fa = fm; } else b = m;
    }
    return { rows: out, a: a, b: b };
  }
  // ---------------------------------------------------------------- num.bisection
  G('num.bisection', function (R, ctx) {
    var kind = lv(ctx, R.pick(['bound', 'steps', 'run']), R.pick(['run', 'steps', 'bracket']), R.pick(['run', 'steps', 'trap', 'bracket']));
    if (kind === 'bound') {
      var a = R.int(-2, 3), w = R.pick([1, 2, 4]), n = R.int(3, 9), bd = Q(w, Math.pow(2, n + 1));
      return {
        q: 'Bisection starts on $[' + a + ', ' + (a + w) + ']$, where $f$ is continuous and changes sign. After ' + n + ' steps we take the midpoint of the current interval as the estimate. How far from a root can it be, at most?',
        a: num(bd),
        steps: ['Each step halves the interval: after ' + n + ' steps its width is $\\frac{' + w + '}{2^{' + n + '}}$.', 'The root is inside, and the midpoint is at most half the width from any point inside.', 'Bound: $\\frac{' + w + '}{2^{' + (n + 1) + '}} = ' + td(bd) + '$.'],
        hint: 'The width after n steps is (b − a)/2ⁿ; the midpoint is within half of that.', _d: { k: kind, w: w, n: n, v: bd.toPlain() }
      };
    }
    if (kind === 'steps') {
      var w2 = R.pick([1, 2, 3, 4, 10]), m = R.int(2, ctx.level === 3 ? 8 : 5), tol = pow10(-m), nn = 0;
      while (Q(w2, 1).div(q(2).pow(nn + 1)).gt(tol)) nn++;
      return {
        q: 'Bisection runs on an interval of width $' + w2 + '$, and we use the final midpoint as the estimate. How many steps $n$ guarantee an error of at most $10^{-' + m + '}$?',
        a: num(nn, { form: 'int' }),
        steps: ['After $n$ steps the midpoint is within $\\frac{' + w2 + '}{2^{n + 1}}$ of a root.', 'We need $\\frac{' + w2 + '}{2^{n + 1}} \\le 10^{-' + m + '}$, that is, $2^{n + 1} \\ge ' + T.commas(w2 * Math.pow(10, m)) + '$.', '$2^{' + nn + '} = ' + T.commas(Math.pow(2, nn)) + '$ is too small and $2^{' + (nn + 1) + '} = ' + T.commas(Math.pow(2, nn + 1)) + '$ is enough, so $n + 1 = ' + (nn + 1) + '$ and $n = ' + nn + '$.', 'Bisection gains one binary digit per step: about 3.3 steps per decimal digit.'],
        hint: 'Solve w/2^(n+1) ≤ tolerance for the smallest whole n.', _d: { k: kind, w: w2, m: m, v: nn }
      };
    }
    if (kind === 'run') {
      var P0 = rootPoly(R), ns = ctx.level === 3 ? 4 : 3, run = bisectRun(P0.c, P0.a, P0.b, ns), last = run.rows[run.rows.length - 1];
      var st = ['$f(' + P0.a + ') = ' + td(pev(P0.c, P0.a)) + ' < 0$ and $f(' + P0.b + ') = ' + td(pev(P0.c, P0.b)) + ' > 0$: a sign change, and $f$ is continuous, so there is a root between.'];
      run.rows.forEach(function (r, i) { st.push('Step ' + (i + 1) + ': $m = ' + td(r.m) + '$, $f(m) ' + (String(decStr(r.fm)).length <= 9 ? '= ' + td(r.fm) : '\\approx ' + sig(r.fm, 4)) + '$, ' + (r.fm.sign() < 0 ? 'negative' : 'positive') + ', so keep $[' + td(r.fm.sign() < 0 ? r.m : r.a) + ', ' + td(r.fm.sign() < 0 ? r.b : r.m) + ']$.'); });
      return {
        q: 'Apply bisection to $f(x) = ' + P0.tex + '$ on $[' + P0.a + ', ' + P0.b + ']$. What is the midpoint computed in step ' + ns + '?',
        a: num(last.m),
        steps: st.concat(['The step-' + ns + ' midpoint is $' + td(last.m) + '$; the root is $' + P0.root.toFixed(5) + '\\ldots$']),
        hint: 'At each step, evaluate f at the midpoint and keep the half where the sign changes.', _d: { k: kind, c: P0.c, a: P0.a, b: P0.b, n: ns, v: last.m.toPlain() }
      };
    }
    if (kind === 'bracket') {
      var B = R.pick([
        ['x^{2} - 2', ['[1, 2]'], ['[-1, 1]', '[2, 3]', '[0, 1]'], 'Only $[1, 2]$ has $f(a)$ and $f(b)$ of opposite signs: $f(1) = -1$, $f(2) = 2$.'],
        ['x^{3} - 4x', ['[1, 3]', '[-3, -1]'], ['[-1, 3]', '[-3, 1]', '[3, 4]'], '$f(1) = -3, f(3) = 15$ and $f(-3) = -15, f(-1) = 3$ change sign. On $[-1, 3]$ the end values $f(-1) = 3$ and $f(3) = 15$ have the same sign, and on $[-3, 1]$ so do $f(-3) = -15$ and $f(1) = -3$, even though roots lie inside both. On $[3, 4]$ there is no root at all.'],
        ['x^{2} - 5x + 4', ['[0, 2]', '[3, 5]'], ['[0, 5]', '[2, 3]', '[5, 6]'], '$f(0) = 4, f(2) = -2$ and $f(3) = -2, f(5) = 4$ change sign. $[0, 5]$ holds both roots, 1 and 4, but $f(0) = f(5) = 4$ have the same sign, so bisection cannot start there.']
      ]);
      var ch = B[1].concat(B[2]), vs = B[1].map(function (_, i) { return i; });
      return {
        q: 'Bisection needs $f(a)$ and $f(b)$ to have opposite signs. For $f(x) = ' + B[0] + '$, on which intervals can bisection start? Select all that apply.',
        a: { t: 'mc', choices: ch.map(function (s) { return '$' + s + '$'; }), v: vs },
        steps: ['Evaluate $f$ at both ends of each interval and look for a sign change.', B[3], 'A sign change at the ends is enough (with continuity) to trap a root. Same signs do not rule out roots; they only mean bisection cannot get started.'],
        hint: 'Check the signs of f at the two ends of each interval.', _d: { k: kind }
      };
    }
    // trap: a sign change across a vertical asymptote
    var T0 = R.pick([['\\tan x', '[1, 2]', '\\frac{\\pi}{2} \\approx 1.5708', 'f(1) \\approx 1.557', 'f(2) \\approx -2.185'], ['\\frac{1}{x - 3}', '[2, 4]', '3', 'f(2) = -1', 'f(4) = 1'], ['\\frac{x}{x^{2} - 4}', '[1, 3]', '2', 'f(1) = -\\frac{1}{3}', 'f(3) = \\frac{3}{5}']]);
    return {
      q: 'Bisection is run on $f(x) = ' + T0[0] + '$ over $' + T0[1] + '$, where $' + T0[3] + '$ and $' + T0[4] + '$ have opposite signs. The midpoints settle down to $x = ' + T0[2] + '$. What is that point?',
      a: mc('A vertical asymptote of $f$, not a root', ['A root of $f$', 'A point where $f$ has a maximum', 'The midpoint of the starting interval']),
      steps: ['Bisection only checks signs. Its guarantee needs $f$ to be <b>continuous</b> on the interval.', '$f$ has a vertical asymptote at $x = ' + T0[2] + '$, where it jumps from one sign to the other without passing through 0.', 'So the method closes in on the asymptote. Check the answer: $|f(x)|$ grows instead of shrinking near it.'],
      hint: 'Is f continuous on the whole interval?', _d: { k: 'trap' }
    };
  });

  // ---------------------------------------------------------------- num.fixed-point-iteration
  G('num.fixed-point-iteration', function (R, ctx) {
    var kind = lv(ctx, R.pick(['iterate', 'iterate', 'cycle']), R.pick(['which', 'iterate', 'gprime']), R.pick(['which', 'steps', 'gprime']));
    if (kind === 'iterate') {
      var t = R.pick(['babylon', 'golden', 'linear']), g, gt, x0, r;
      if (t === 'babylon') { var a = R.pick([2, 3, 5, 6, 7, 10]); x0 = q(Math.round(Math.sqrt(a)) || 1); g = function (x) { return x.add(q(a).div(x)).div(2); }; gt = 'g(x) = \\frac{1}{2}\\left(x + \\frac{' + a + '}{x}\\right)'; r = '\\sqrt{' + a + '} \\approx ' + Math.sqrt(a).toFixed(6); }
      else if (t === 'golden') { x0 = q(R.pick([1, 2])); g = function (x) { return q(1).add(q(1).div(x)); }; gt = 'g(x) = 1 + \\frac{1}{x}'; r = '\\frac{1 + \\sqrt{5}}{2} \\approx 1.618034'; }
      else { var k = R.pick([2, 3, 4]), bb = R.int(2, 9); x0 = q(0); g = function (x) { return x.div(k).add(bb); }; gt = 'g(x) = \\frac{x}{' + k + '} + ' + bb; r = td(Q(bb * k, k - 1)); }
      var n = ctx.level === 1 ? 2 : 3, xs = [x0]; for (var i = 0; i < n; i++) xs.push(g(xs[i]));
      return {
        q: 'Run fixed-point iteration $x_{n+1} = g(x_n)$ with $' + gt + '$, starting from $x_0 = ' + td(x0) + '$. Find $x_{' + n + '}$ exactly.',
        a: num(xs[n]),
        steps: xs.slice(1).map(function (x, i) { return '$x_{' + (i + 1) + '} = g(' + tq(xs[i]) + ') = ' + tq(x) + (x.isInt() ? '' : ' \\approx ' + x.toDec(5)) + '$'; }).concat(['The iterates approach the fixed point $' + r + '$.']),
        hint: 'Put each new value back into g.', _d: { k: kind, t: t, gt: gt, x0: x0.toPlain(), n: n, v: xs[n].toPlain() }
      };
    }
    if (kind === 'cycle') {
      var aa = R.pick([2, 3, 5, 6, 8, 10]), z0 = R.pick([1, 2, 4, 5].filter(function (v) { return v * v !== aa; })), N = R.int(3, 8), xn = N % 2 ? Q(aa, z0) : q(z0);
      return {
        q: 'To solve $x^{2} = ' + aa + '$, someone rewrites it as $x = g(x) = \\frac{' + aa + '}{x}$ and iterates from $x_0 = ' + z0 + '$. What is $x_{' + N + '}$?',
        a: num(xn),
        steps: ['$x_1 = \\frac{' + aa + '}{' + z0 + '}' + (Q(aa, z0).d === BigInt(z0) ? '' : ' = ' + tq(Q(aa, z0))) + '$, and $x_2 = ' + aa + ' \\div ' + tq(Q(aa, z0)) + ' = ' + z0 + '$: back where we started.', 'The iterates bounce between $' + z0 + '$ and $' + tq(Q(aa, z0)) + '$ forever; odd steps give $' + tq(Q(aa, z0)) + '$.', 'So $x_{' + N + '} = ' + tq(xn) + '$. The reason: $g\'(x) = -\\frac{' + aa + '}{x^{2}}$ equals $-1$ at $x = \\sqrt{' + aa + '}$, so errors never shrink.'],
        hint: 'Compute x₁ and x₂ and look for a pattern.', _d: { k: kind, a: aa, x0: z0, n: N, v: xn.toPlain() }
      };
    }
    if (kind === 'which') {
      var rr = R.int(2, 6), c = rr * rr - rr;
      var opts = [['g(x) = \\sqrt{x + ' + c + '}', true, '\\frac{1}{2\\sqrt{x + ' + c + '}}', Q(1, 2 * rr)], ['g(x) = 1 + \\frac{' + c + '}{x}', true, '-\\frac{' + c + '}{x^{2}}', Q(-c, rr * rr)], ['g(x) = x^{2} - ' + c, false, '2x', q(2 * rr)], ['g(x) = \\frac{' + c + '}{x - 1}', false, '-\\frac{' + c + '}{(x - 1)^{2}}', Q(-c, (rr - 1) * (rr - 1))]];
      var vs = []; opts.forEach(function (o, i) { if (o[1]) vs.push(i); });
      return {
        q: 'The equation $x^{2} - x - ' + c + ' = 0$ has the root $r = ' + rr + '$. For which rearrangements $x = g(x)$ does fixed-point iteration converge to $r$ when started close enough to it? Select all that apply.',
        a: { t: 'mc', choices: opts.map(function (o) { return '$' + o[0] + '$'; }), v: vs },
        steps: ['Near $r$ the error is multiplied by about $g\'(r)$ each step, so the iteration converges when $|g\'(r)| < 1$.'].concat(opts.map(function (o) { return '$' + o[0] + '$: $g\'(x) = ' + o[2] + '$, so $g\'(' + rr + ') = ' + tq(o[3]) + '$: ' + (o[1] ? 'converges' : 'diverges') + '.'; })),
        hint: 'Find g′(r) for each one; convergence needs |g′(r)| < 1.', _d: { k: kind, r: rr, v: vs }
      };
    }
    if (kind === 'gprime') {
      if (R.chance(0.3)) { var A = R.pick([2, 3, 5, 7]); return {
        q: 'For $g(x) = \\frac{1}{2}\\left(x + \\frac{' + A + '}{x}\\right)$, the fixed point is $r = \\sqrt{' + A + '}$. Find $g\'(r)$.',
        a: num(0), steps: ['$g\'(x) = \\frac{1}{2}\\left(1 - \\frac{' + A + '}{x^{2}}\\right)$.', 'At $x = \\sqrt{' + A + '}$: $\\frac{1}{2}(1 - 1) = 0$.', 'Since $g\'(r) = 0$, the error shrinks faster than any fixed ratio: this iteration (Newton\'s method for $x^{2} = ' + A + '$) converges quadratically.'],
        hint: 'Differentiate, then put in x² = ' + A + '.', _d: { k: 'gprime', t: 'babylon', a: A, v: 0 } }; }
      var r0 = R.int(2, 5), b0 = R.pick([3, 4, 5, 6, 8].filter(function (v) { return v !== r0; })), c0 = 2 * b0 * r0 - r0 * r0;
      var gp = Q(r0, b0);
      return {
        q: 'Fixed-point iteration uses $g(x) = \\frac{x^{2}' + cterm(c0) + '}{' + 2 * b0 + '}$, which has the fixed point $r = ' + r0 + '$. Find $g\'(r)$, and so decide what happens to the error near $r$.',
        a: num(gp),
        steps: ['$g\'(x) = \\frac{2x}{' + 2 * b0 + '} = \\frac{x}{' + b0 + '}$.', '$g\'(' + r0 + ') = ' + tq(gp) + '$.', gp.lt(1) ? 'Since $|g\'(r)| < 1$, each step multiplies the error by about $' + tq(gp) + '$: linear convergence.' : 'Since $|g\'(r)| > 1$, each step multiplies the error by about $' + tq(gp) + '$: the iterates move away from $r$.'],
        hint: 'Differentiate g and put in x = r.', _d: { k: 'gprime', t: 'quad', r: r0, b: b0, v: gp.toPlain() }
      };
    }
    // steps: error shrinks by about |g'(r)| = 1/K per step; steps to reduce it by 10^m
    var K = R.pick([2, 3, 4, 5, 10]), m = R.int(3, 8), nK = 0; while (q(K).pow(nK).lt(pow10(m))) nK++;
    return {
      q: 'Near its fixed point, an iteration has $|g\'(r)| = ' + tq(Q(1, K)) + '$, so each step multiplies the error by about $' + tq(Q(1, K)) + '$. About how many steps reduce the error by a factor of $10^{' + m + '}$?',
      a: num(nK, { form: 'int' }),
      steps: ['After $n$ steps the error is multiplied by $(' + tq(Q(1, K)) + ')^{n}$; we need $' + K + '^{n} \\ge 10^{' + m + '}$.', 'So $n \\ge \\frac{' + m + '}{\\log_{10} ' + K + '} \\approx ' + (m / Math.log10(K)).toFixed(2) + '$.', 'The smallest whole number is $n = ' + nK + '$. Linear convergence gains the same number of digits, $\\log_{10} ' + K + ' \\approx ' + Math.log10(K).toFixed(2) + '$, each step.'],
      hint: 'Solve Kⁿ ≥ 10^m for the smallest whole n (use logarithms).', _d: { k: 'steps', K: K, m: m, v: nK }
    };
  });

  // ---------------------------------------------------------------- num.convergence-order
  G('num.convergence-order', function (R, ctx) {
    var kind = lv(ctx, R.pick(['estimate', 'kind']), R.pick(['estimate', 'linear', 'quad']), R.pick(['data', 'quad', 'estimate']));
    if (kind === 'estimate') {
      var pat = R.pick([[1, 2, 3], [2, 3, 4], [1, 2, 4], [2, 4, 8], [3, 6, 12], [1, 3, 9], [2, 4, 7], [2, 5, 11], [1, 3, 6]]);
      if (ctx.level === 1) pat = R.pick([[1, 2, 4], [2, 4, 8], [1, 2, 3], [1, 3, 9]]);
      var pp = Q(pat[2] - pat[1], pat[1] - pat[0]);
      return {
        q: 'Three successive errors of an iteration are $e_0 = 10^{-' + pat[0] + '}$, $e_1 = 10^{-' + pat[1] + '}$ and $e_2 = 10^{-' + pat[2] + '}$. Estimate the order $p$ with $$p \\approx \\frac{\\ln(e_2/e_1)}{\\ln(e_1/e_0)}.$$',
        a: num(pp),
        steps: ['If $e_{n+1} \\approx Ce_n^{p}$, then $\\frac{e_2}{e_1} \\approx \\left(\\frac{e_1}{e_0}\\right)^{p}$, so $p \\approx \\frac{\\ln(e_2/e_1)}{\\ln(e_1/e_0)}$.', '$\\frac{e_2}{e_1} = 10^{-' + (pat[2] - pat[1]) + '}$ and $\\frac{e_1}{e_0} = 10^{-' + (pat[1] - pat[0]) + '}$, and $\\ln 10^{-k} = -k\\ln 10$.', 'The factors of $\\ln 10$ cancel: $p \\approx \\frac{-' + (pat[2] - pat[1]) + '}{-' + (pat[1] - pat[0]) + '} = ' + td(pp) + '$.'],
        hint: 'With powers of 10, the logarithms are just the exponents (times ln 10, which cancels).', _d: { k: kind, pat: pat, v: pp.toPlain() }
      };
    }
    if (kind === 'kind') {
      var S = R.pick([
        ['10^{-1}, 10^{-2}, 10^{-4}, 10^{-8}', 'Quadratic: the number of correct digits doubles each step'],
        ['10^{-2}, 10^{-3}, 10^{-4}, 10^{-5}', 'Linear: about one more correct digit each step'],
        ['0.5, 0.25, 0.125, 0.0625', 'Linear: the error is halved each step'],
        ['10^{-1}, 10^{-3}, 10^{-9}, 10^{-27}', 'Cubic: the number of correct digits triples each step']
      ]);
      return {
        q: 'An iteration has errors $' + S[0] + '$. How does it converge?',
        a: mc(S[1], ['Quadratic: the number of correct digits doubles each step', 'Linear: about one more correct digit each step', 'Linear: the error is halved each step', 'Cubic: the number of correct digits triples each step', 'It does not converge'].filter(function (x) { return x !== S[1]; }).slice(0, 3)),
        steps: ['Compare each error with the one before it, in digits (powers of 10) gained per step.', 'The pattern fits: ' + S[1].toLowerCase() + '.'],
        hint: 'Count correct digits (the exponent) at each step and see how that count grows.', _d: { k: kind }
      };
    }
    if (kind === 'linear') {
      var Cn, e0, n, en; for (var tr = 0; tr < 30; tr++) { Cn = R.pick([2, 4, 5, 10]); e0 = q(R.pick(['0.1', '0.5', '1', '0.2'])); n = R.int(3, 6); en = e0.div(q(Cn).pow(n)); if (tiny(en) || decStr(en).length <= 10) break; }
      return {
        q: 'An iteration converges linearly with $e_{n+1} = ' + tq(Q(1, Cn)) + 'e_n$. If $e_0 = ' + td(e0) + '$, what is $e_{' + n + '}$?',
        a: num(en),
        steps: ['Each step multiplies the error by $' + tq(Q(1, Cn)) + '$: $e_n = e_0\\left(' + tq(Q(1, Cn)) + '\\right)^{n}$.', '$e_{' + n + '} = ' + td(e0) + ' \\times \\frac{1}{' + Math.pow(Cn, n) + '} = ' + td(en) + '$.', 'Every step gains the same $\\log_{10} ' + Cn + ' \\approx ' + Math.log10(Cn).toFixed(2) + '$ digits: that is what linear convergence looks like.'],
        hint: 'Multiply by the rate once per step.', _d: { k: kind, C: Cn, e0: e0.toPlain(), n: n, v: en.toPlain() }
      };
    }
    if (kind === 'quad') {
      var Cq = q(R.pick(['0.5', '1', '2', '3', '0.25'])), ee0 = pow10(-R.int(1, 3)), e1 = Cq.mul(ee0).mul(ee0), e2 = Cq.mul(e1).mul(e1);
      return {
        q: 'Near a root, an iteration satisfies $e_{n+1} \\approx ' + (Cq.eq(1) ? '' : td(Cq)) + 'e_n^{2}$. If $e_0 = ' + td(ee0) + '$, estimate $e_2$.',
        a: num(e2, { rtol: 1e-9 }),
        steps: ['$e_1 \\approx ' + td(Cq) + ' \\times (' + td(ee0) + ')^{2} = ' + td(e1) + '$.', '$e_2 \\approx ' + td(Cq) + ' \\times (' + td(e1) + ')^{2} = ' + td(e2) + '$.', 'The exponent roughly doubles each step: quadratic convergence.'],
        hint: 'Square the error, then multiply by the constant; do it twice.', _d: { k: kind, C: Cq.toPlain(), e0: ee0.toPlain(), v: e2.toPlain() }
      };
    }
    // data: order from messy numbers, two decimal places
    var pTrue = R.pick([1, 1.618, 2, 2, 3]), Cd = R.pick([0.3, 0.5, 0.8, 1.2, 2]), d0 = R.pick([0.05, 0.02, 0.1, 0.03]), d1, d2;
    if (pTrue === 1) { Cd = R.pick([0.3, 0.5, 0.2]); }
    d1 = Number((Cd * Math.pow(d0, pTrue)).toPrecision(2)); d2 = Number((Cd * Math.pow(d1, pTrue)).toPrecision(2));
    var pe = Math.log(d2 / d1) / Math.log(d1 / d0);
    return {
      q: 'An iteration has errors $e_0 = ' + sci(q(d0), 2) + '$, $e_1 = ' + sci(q(d1), 2) + '$, $e_2 = ' + sci(q(d2), 2) + '$. Estimate the order $p \\approx \\frac{\\ln(e_2/e_1)}{\\ln(e_1/e_0)}$, rounded to 2 decimal places.',
      a: num(pe.toFixed(6), { dp: 2 }),
      steps: ['$\\ln(e_2/e_1) = \\ln(' + (d2 / d1).toPrecision(4) + ') \\approx ' + Math.log(d2 / d1).toFixed(4) + '$.', '$\\ln(e_1/e_0) = \\ln(' + (d1 / d0).toPrecision(4) + ') \\approx ' + Math.log(d1 / d0).toFixed(4) + '$.', '$p \\approx ' + Math.log(d2 / d1).toFixed(4) + ' \\div ' + Math.log(d1 / d0).toFixed(4) + ' \\approx ' + pe.toFixed(2) + '$.', 'Do not use the ratio $e_2/e_1$ alone: for any order above 1 that ratio heads to 0, so it cannot tell order 2 from order 3.'],
      hint: 'Use logarithms of the two ratios, not the ratios themselves.', _d: { k: 'data', e: [d0, d1, d2], v: pe }
    };
  });

  // ---------------------------------------------------------------- num.newton-convergence
  G('num.newton-convergence', function (R, ctx) {
    var kind = lv(ctx, R.pick(['C', 'flat', 'C']), R.pick(['cycle', 'C', 'mult']), R.pick(['mult', 'cycle', 'mstep', 'C']));
    if (kind === 'C') {
      var t = R.pick(['sq', 'cube']), r = R.int(2, 5), f, C, st;
      if (t === 'sq') { f = 'x^{2} - ' + r * r; C = Q(1, 2 * r); st = ['$f\'(x) = 2x$ and $f\'\'(x) = 2$, so $C = \\frac{2}{2 \\cdot 2(' + r + ')} = ' + tq(C) + '$.']; }
      else { f = 'x^{3} - ' + r * r * r; C = Q(1, r); st = ['$f\'(x) = 3x^{2}$ and $f\'\'(x) = 6x$, so $C = \\frac{6(' + r + ')}{2 \\cdot 3(' + r + ')^{2}} = ' + tq(C) + '$.']; }
      var e = pow10(-R.int(2, 4)), e1 = C.mul(e).mul(e);
      return {
        q: 'Newton\'s method on $f(x) = ' + f + '$ converges to $r = ' + r + '$ with $e_{n+1} \\approx Ce_n^{2}$, where $C = \\left|\\frac{f\'\'(r)}{2f\'(r)}\\right|$. If $e_n = ' + td(e) + '$, estimate $e_{n+1}$.',
        a: num(e1, { rtol: 1e-9 }),
        steps: st.concat(['$e_{n+1} \\approx ' + tq(C) + ' \\times (' + td(e) + ')^{2} = ' + td(e1) + '$.', 'The number of correct digits about doubles: quadratic convergence at a simple root.']),
        hint: 'Find C from f′ and f″ at the root, then multiply C by the error squared.', _d: { k: kind, t: t, r: r, e: e.toPlain(), v: e1.toPlain() }
      };
    }
    if (kind === 'flat') {
      var c = R.pick([1, 2, 3]), x0 = R.pick([c, -c]);
      return {
        q: 'Newton\'s method is started at $x_0 = ' + x0 + '$ for $f(x) = x^{3} - ' + 3 * c * c + 'x + 1$. What goes wrong?',
        a: mc('$f\'(' + x0 + ') = 0$: the tangent line is horizontal and never meets the $x$-axis', ['Nothing: it converges quadratically from there', 'The method converges to a root of $f\'$ instead', '$f(' + x0 + ') = 0$, so it stops at once']),
        steps: ['$f\'(x) = 3x^{2} - ' + 3 * c * c + '$, so $f\'(' + x0 + ') = 3(' + c * c + ') - ' + 3 * c * c + ' = 0$.', 'The Newton step divides by $f\'(x_0) = 0$: the tangent is flat, so there is no next iterate.', 'Starting near such a point is almost as bad: a nearly flat tangent throws $x_1$ far away.'],
        hint: 'Compute f′ at the starting point.', _d: { k: kind }
      };
    }
    if (kind === 'cycle') {
      var cc = R.pick([1, 2, 3, -1, -2]), fc = 'x^{3} - ' + 2 * cc * cc + 'x ' + (cc > 0 ? '+ ' : '- ') + Math.abs(2 * cc * cc * cc);
      return {
        q: 'Run Newton\'s method on $f(x) = ' + fc + '$ from $x_0 = 0$. Find $x_1$ and $x_2$.',
        a: multi([{ label: '$x_1 =$', a: num(cc) }, { label: '$x_2 =$', a: num(0) }]),
        steps: ['$f\'(x) = 3x^{2} - ' + 2 * cc * cc + '$.', '$x_1 = 0 - \\frac{f(0)}{f\'(0)} = -\\frac{' + 2 * cc * cc * cc + '}{-' + 2 * cc * cc + '} = ' + cc + '$.', '$f(' + cc + ') = ' + cc * cc * cc + '$ and $f\'(' + cc + ') = ' + cc * cc + '$, so $x_2 = ' + cc + ' - \\frac{' + cc * cc * cc + '}{' + cc * cc + '} = 0$.', 'Back to the start: the iterates cycle $0, ' + cc + ', 0, ' + cc + ', \\ldots$ forever and never find the root (near $' + (function () { var x = -2 * Math.abs(cc); x = -2 * cc; for (var i = 0; i < 60; i++) x -= (x * x * x - 2 * cc * cc * x + 2 * cc * cc * cc) / (3 * x * x - 2 * cc * cc); return x.toFixed(3); })() + '$). Newton\'s method is only guaranteed to converge from a good enough start.'],
        hint: 'x₁ = x₀ − f(x₀)/f′(x₀); do it twice.', nolint: ['--'], _d: { k: kind, c: cc }
      };
    }
    if (kind === 'mult') {
      var m = R.int(2, 4), ask = R.pick(['ratio', 'fix']);
      if (ask === 'ratio') return {
        q: 'Newton\'s method is used on a function with a root of multiplicity ' + m + ', such as $f(x) = (x - 1)^{' + m + '}$. Near the root, $e_{n+1}/e_n$ approaches what number?',
        a: num(Q(m - 1, m)),
        steps: ['For $f(x) = (x - r)^{' + m + '}$: $\\frac{f(x)}{f\'(x)} = \\frac{(x - r)^{' + m + '}}{' + m + '(x - r)^{' + (m - 1) + '}} = \\frac{x - r}{' + m + '}$.', 'So $x_{n+1} - r = (x_n - r) - \\frac{x_n - r}{' + m + '} = ' + tq(Q(m - 1, m)) + '(x_n - r)$.', 'The ratio is $' + tq(Q(m - 1, m)) + '$: only linear convergence. Using $x - ' + m + '\\frac{f(x)}{f\'(x)}$ (if $m$ is known) restores quadratic convergence.'],
        hint: 'Compute f/f′ for (x − r)^m.', _d: { k: kind, m: m, v: Q(m - 1, m).toPlain() }
      };
      return {
        q: 'Newton\'s method converges slowly to a root of multiplicity ' + m + '. The modified step $x_{n+1} = x_n - k\\frac{f(x_n)}{f\'(x_n)}$ converges quadratically again for which value of $k$?',
        a: num(m, { form: 'int' }),
        steps: ['For $f(x) = (x - r)^{' + m + '}g(x)$, near $r$: $\\frac{f}{f\'} \\approx \\frac{x - r}{' + m + '}$.', 'Taking $k = ' + m + '$ makes the step land on $r$ to first order: $x - ' + m + ' \\cdot \\frac{x - r}{' + m + '} = r$.'],
        hint: 'What does f/f′ look like near a root of multiplicity m?', _d: { k: kind, m: m, v: m }
      };
    }
    // mstep: one Newton step at a double root
    var r2 = R.pick([-3, -2, -1, 1, 2, 3, 4]), d = R.pick([1, 2, Q(1, 2), 4]), x0m = q(r2).add(d), x1m = q(r2).add(q(d).div(2));
    return {
      q: 'Take one step of Newton\'s method on $f(x) = ' + ptex([r2 * r2, -2 * r2, 1]) + '$ from $x_0 = ' + td(x0m) + '$. What is $x_1$?',
      a: num(x1m),
      steps: ['$f(x) = (x ' + (r2 < 0 ? '+ ' + (-r2) : '- ' + r2) + ')^{2}$ has a double root at $' + r2 + '$, and $f\'(x) = 2(x ' + (r2 < 0 ? '+ ' + (-r2) : '- ' + r2) + ')$.', '$\\frac{f(x_0)}{f\'(x_0)} = \\frac{x_0 - ' + paren(r2) + '}{2} = ' + td(q(d).div(2)) + '$.', '$x_1 = ' + td(x0m) + ' - ' + td(q(d).div(2)) + ' = ' + td(x1m) + '$: the error only halved, from $' + td(q(d)) + '$ to $' + td(q(d).div(2)) + '$. At a double root Newton\'s method is linear with ratio $\\frac{1}{2}$.'],
      hint: 'Factor f; f/f′ simplifies.', nolint: ['--', '+ -'], _d: { k: kind, r: r2, x0: x0m.toPlain(), v: x1m.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.secant-method
  function secPoly(R) {
    return R.pick([
      function () { var c = R.pick([2, 3, 5, 6, 7, 10]), a = Math.floor(Math.sqrt(c)); return { c: [-c, 0, 1], x0: a, x1: a + 1, tex: 'x^{2} - ' + c }; },
      function () { var c = R.pick([2, 3, 5, 9, 10]), a = Math.floor(Math.cbrt(c)); return { c: [-c, 0, 0, 1], x0: a, x1: a + 1, tex: 'x^{3} - ' + c }; },
      function () { var c = R.pick([1, 3, 4, 5]); return { c: [-c, -1, 1], x0: 1, x1: 3, tex: 'x^{2} - x - ' + c }; },
      function () { return { c: [-1, 1, 0, 1], x0: 0, x1: 1, tex: 'x^{3} + x - 1' }; }
    ])();
  }
  function secant(c, x0, x1) { var f0 = pev(c, x0), f1 = pev(c, x1); return q(x1).sub(f1.mul(q(x1).sub(x0)).div(f1.sub(f0))); }
  G('num.secant-method', function (R, ctx) {
    var kind = lv(ctx, R.pick(['one', 'one', 'order']), R.pick(['two', 'next', 'one']), R.pick(['two', 'efficiency', 'next']));
    if (kind === 'one' || kind === 'two') {
      var P0 = secPoly(R), x0 = q(P0.x0), x1 = q(P0.x1), x2 = secant(P0.c, x0, x1), x3 = secant(P0.c, x1, x2);
      var f0 = pev(P0.c, x0), f1 = pev(P0.c, x1), f2 = pev(P0.c, x2);
      var st = ['$f(' + td(x0) + ') = ' + td(f0) + '$ and $f(' + td(x1) + ') = ' + td(f1) + '$.', '$x_2 = x_1 - f(x_1)\\frac{x_1 - x_0}{f(x_1) - f(x_0)} = ' + td(x1) + ' - ' + parenF(f1) + '\\cdot\\frac{' + td(x1.sub(x0)) + '}{' + td(f1.sub(f0)) + '} = ' + tq(x2) + '$.'];
      if (kind === 'one') return { q: 'Apply one step of the secant method to $f(x) = ' + P0.tex + '$ with $x_0 = ' + td(x0) + '$ and $x_1 = ' + td(x1) + '$. Find $x_2$ exactly.', a: num(x2), steps: st, hint: 'Replace f′(x₁) in Newton\'s method by the slope through the two points.', _d: { k: kind, c: P0.c.map(Number), x0: P0.x0, x1: P0.x1, v: x2.toPlain() } };
      return {
        q: 'Apply two steps of the secant method to $f(x) = ' + P0.tex + '$ with $x_0 = ' + td(x0) + '$ and $x_1 = ' + td(x1) + '$. Find $x_3$ exactly.',
        a: num(x3),
        steps: st.concat(['$f(x_2) = ' + tq(f2) + '$. The next step uses the two <b>most recent</b> points, $x_1$ and $x_2$ (whether or not they bracket the root).', '$x_3 = x_2 - f(x_2)\\frac{x_2 - x_1}{f(x_2) - f(x_1)} = ' + tq(x3) + ' \\approx ' + x3.toDec(6) + '$.']),
        hint: 'For x₃, use x₁ and x₂, not x₀.', _d: { k: kind, c: P0.c.map(Number), x0: P0.x0, x1: P0.x1, v: x3.toPlain() }
      };
    }
    if (kind === 'order') return {
      q: 'Near a simple root, the secant method has $e_{n+1} \\approx Ce_n^{p}$. What is $p$? Give it to 3 decimal places.',
      a: num('(1+sqrt(5))/2', { dp: 3 }),
      steps: ['The secant error satisfies $e_{n+1} \\approx Ke_ne_{n-1}$.', 'Trying $e_{n+1} \\approx Ce_n^{p}$ in that relation forces $p^{2} = p + 1$.', 'The positive root is $p = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618$, the golden ratio: faster than linear, slower than Newton\'s 2.'],
      hint: 'It is the golden ratio.', _d: { k: kind }
    };
    if (kind === 'next') {
      var P1 = secPoly(R), a0 = q(P1.x0), a1 = q(P1.x1), a2 = secant(P1.c, a0, a1);
      return {
        q: 'The secant method on $f(x) = ' + P1.tex + '$ starts with $x_0 = ' + td(a0) + '$ and $x_1 = ' + td(a1) + '$ and produces $x_2 = ' + tq(a2) + '$. Which two points does it use to compute $x_3$?',
        a: mc('$x_1$ and $x_2$', ['$x_0$ and $x_2$', 'whichever two of $x_0, x_1, x_2$ have $f$ values of opposite sign', '$x_0$ and $x_1$ again']),
        steps: ['The secant method always uses the two most recent iterates, here $x_1 = ' + td(a1) + '$ and $x_2 = ' + tq(a2) + '$.', 'Keeping a pair with opposite signs is a different method (regula falsi). It is safer but can be much slower; the secant method gives up the bracket to get order about 1.618.'],
        hint: 'Which points are the newest?', _d: { k: kind }
      };
    }
    // efficiency: per function evaluation
    return {
      q: 'Each Newton step needs $f(x_n)$ and $f\'(x_n)$; each secant step needs only one new $f$ value. If computing $f\'$ costs the same as computing $f$, Newton\'s method has order 2 per two evaluations, which is order $\\sqrt{2}$ per evaluation. What is that, to 3 decimal places?',
      a: num('sqrt(2)', { dp: 3 }),
      steps: ['Two evaluations give order 2, so one evaluation gives order $p$ with $p^{2} = 2$: $p = \\sqrt{2} \\approx 1.414$.', 'The secant method gets order about $1.618$ from each single evaluation, so it is often faster in practice, and it needs no derivative.'],
      hint: 'p² = 2.', _d: { k: 'efficiency' }
    };
  });

  // ---------------------------------------------------------------- num.newton-systems
  function nsSystem(R) {
    return R.pick([
      function () { var x0 = R.int(1, 3), y0 = R.int(1, 3), r = x0 * x0 + y0 * y0 + R.pick([-1, 1, 2, -2]), s = x0 - y0 + R.pick([-1, 1]);
        return { id: 1, p: [r, s], F: function (x, y) { return [x.mul(x).add(y.mul(y)).sub(r), x.sub(y).sub(s)]; }, J: function (x, y) { return [[x.mul(2), y.mul(2)], [q(1), q(-1)]]; }, tex: ['x^{2} + y^{2}' + cterm(-r), 'x - y' + cterm(-s)], Jtex: ['2x', '2y', '1', '-1'], x0: x0, y0: y0 }; },
      function () { var x0 = R.int(1, 3), y0 = R.int(1, 3), a = x0 * x0 - y0 + R.pick([-1, 1]), b = x0 + y0 * y0 + R.pick([-2, 1, 2]);
        return { id: 2, p: [a, b], F: function (x, y) { return [x.mul(x).sub(y).sub(a), x.add(y.mul(y)).sub(b)]; }, J: function (x, y) { return [[x.mul(2), q(-1)], [q(1), y.mul(2)]]; }, tex: ['x^{2} - y' + cterm(-a), 'x + y^{2}' + cterm(-b)], Jtex: ['2x', '-1', '1', '2y'], x0: x0, y0: y0 }; },
      function () { var x0 = R.int(1, 3), y0 = R.int(1, 3), a = x0 * y0 + R.pick([-1, 1]), b = x0 * x0 - y0 * y0 + R.pick([-1, 1, 2]);
        return { id: 3, p: [a, b], F: function (x, y) { return [x.mul(y).sub(a), x.mul(x).sub(y.mul(y)).sub(b)]; }, J: function (x, y) { return [[y, x], [x.mul(2), y.mul(-2)]]; }, tex: ['xy' + cterm(-a), 'x^{2} - y^{2}' + cterm(-b)], Jtex: ['y', 'x', '2x', '-2y'], x0: x0, y0: y0 }; }
    ])();
  }
  G('num.newton-systems', function (R, ctx) {
    var kind = lv(ctx, R.pick(['jac', 'jac', 'delta']), R.pick(['step', 'delta', 'jac']), R.pick(['step', 'step', 'delta']));
    var S, X, Y, Fv, J, D; for (var t = 0; t < 20; t++) { S = nsSystem(R); X = q(S.x0); Y = q(S.y0); Fv = S.F(X, Y); J = S.J(X, Y); if (!det2(J).isZero() && !(Fv[0].isZero() && Fv[1].isZero())) break; }
    D = solve(J, [Fv[0].neg(), Fv[1].neg()]);
    var sys = '$$F(x, y) = \\begin{bmatrix} ' + S.tex[0] + ' \\\\ ' + S.tex[1] + ' \\end{bmatrix}$$';
    var jt = 'J(x, y) = \\begin{bmatrix} ' + S.Jtex[0] + ' & ' + S.Jtex[1] + ' \\\\ ' + S.Jtex[2] + ' & ' + S.Jtex[3] + ' \\end{bmatrix}';
    var st = ['Row $i$ of the Jacobian holds the partial derivatives of $F_i$: $' + jt + '$.', 'At $(' + S.x0 + ', ' + S.y0 + ')$: $J = ' + texM(J) + '$ and $F = ' + texCol(Fv) + '$.'];
    if (kind === 'jac') return {
      q: 'For the system ' + sys + ' find the Jacobian matrix $J$ at $(x, y) = (' + S.x0 + ', ' + S.y0 + ')$.',
      a: matA(J), steps: st.slice(0, 2),
      hint: 'Row 1: ∂F₁/∂x and ∂F₁/∂y. Row 2: the same for F₂.', _d: { k: kind, id: S.id, p: S.p, x0: S.x0, y0: S.y0, J: J.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }) }
    };
    st.push('Solve $J\\Delta = -F$: $' + texM(J) + '\\Delta = ' + texCol([Fv[0].neg(), Fv[1].neg()]) + '$, giving $\\Delta = ' + texVf(D) + '$.');
    if (kind === 'delta') return {
      q: 'One step of Newton\'s method for the system ' + sys + ' starts at $(' + S.x0 + ', ' + S.y0 + ')$. Find the update $\\Delta$, the solution of $J\\Delta = -F$.',
      a: tup(D), steps: st,
      hint: 'Mind the minus sign: solve JΔ = −F, not JΔ = F.', _d: { k: kind, id: S.id, p: S.p, x0: S.x0, y0: S.y0, v: D.map(function (v) { return v.toPlain(); }) }
    };
    var X1 = [X.add(D[0]), Y.add(D[1])];
    st.push('New point: $(' + S.x0 + ', ' + S.y0 + ') + \\Delta = ' + texVf(X1) + '$.');
    return {
      q: 'Take one step of Newton\'s method for the system ' + sys + ' starting from $(x_0, y_0) = (' + S.x0 + ', ' + S.y0 + ')$. Give $(x_1, y_1)$ exactly.',
      a: tup(X1), steps: st,
      hint: 'Build J, solve JΔ = −F, then add Δ to the starting point.', _d: { k: 'step', id: S.id, p: S.p, x0: S.x0, y0: S.y0, v: X1.map(function (v) { return v.toPlain(); }) }
    };
  });

  // =====================================================================================================
  // Unit 3: Linear Systems on a Computer
  // =====================================================================================================
  // ---------------------------------------------------------------- num.operation-counts
  G('num.operation-counts', function (R, ctx) {
    var kind = lv(ctx, R.pick(['scale', 'flops']), R.pick(['tri', 'scale', 'inverse', 'flops']), R.pick(['manyrhs', 'scale', 'tri']));
    if (kind === 'scale') {
      var pr = ctx.level === 3 ? R.pick([[400, 1000], [200, 500], [600, 1200], [300, 1200], [1000, 3000]]) : R.pick([[500, 1000], [1000, 2000], [200, 800], [300, 900], [1000, 10000]]);
      var t0 = q(R.pick(['0.2', '0.5', '0.8', '1.5', '2', '3'])), ratio = Q(pr[1], pr[0]), t1 = t0.mul(ratio.pow(3));
      return {
        q: 'Gaussian elimination on a dense $' + pr[0] + ' \\times ' + pr[0] + '$ system takes $' + td(t0) + '$ seconds on a computer. About how long should a $' + T.commas(pr[1]) + ' \\times ' + T.commas(pr[1]) + '$ system take?',
        a: num(t1, { rtol: 0.001 }),
        steps: ['The work is about $\\frac{2}{3}n^{3}$, so the time grows like $n^{3}$.', '$n$ grows by a factor of $' + td(ratio) + '$, so the time grows by $' + td(ratio) + '^{3} = ' + td(ratio.pow(3)) + '$.', '$' + td(t0) + ' \\times ' + td(ratio.pow(3)) + ' = ' + td(t1) + '$ seconds.'],
        hint: 'Cube the factor by which n grows.', _d: { k: kind, n0: pr[0], n1: pr[1], t0: t0.toPlain(), v: t1.toPlain() }
      };
    }
    if (kind === 'flops') {
      var n = R.pick([30, 60, 90, 150, 300, 600, 3000]), f = Q(2 * n * n * n, 3);
      return {
        q: 'Gaussian elimination (reducing $A$ to upper triangular form) on an $n \\times n$ matrix takes about $\\frac{2}{3}n^{3}$ floating-point operations. About how many is that for $n = ' + T.commas(n) + '$?',
        a: num(f, { rtol: 0.001 }),
        steps: ['$n^{3} = ' + T.commas(n * n * n) + '$.', '$\\frac{2}{3} \\times ' + T.commas(n * n * n) + ' = ' + T.commas(f.num()) + '$' + (f.num() >= 1e6 ? ', about $' + sci(fl(f, 3), 3) + '$' : '') + '.', 'Where it comes from: step $k$ updates a $(n - k) \\times (n - k)$ block with a multiply and a subtract per entry, and $\\sum 2(n - k)^{2} \\approx \\frac{2}{3}n^{3}$.'],
        hint: 'Cube n, then multiply by 2/3.', _d: { k: kind, n: n, v: f.toPlain() }
      };
    }
    if (kind === 'tri') {
      var m = R.pick([10, 50, 100, 200, 500, 1000]), both = R.coin();
      return {
        q: both ? 'After $PA = LU$ is known, solving $A\\mathbf{x} = \\mathbf{b}$ for a new $\\mathbf{b}$ takes one forward and one back substitution, each about $n^{2}$ operations. About how many operations is that for $n = ' + T.commas(m) + '$?' : 'Back substitution on an $n \\times n$ upper triangular system uses about $n^{2}$ operations. About how many is that for $n = ' + T.commas(m) + '$?',
        a: num((both ? 2 : 1) * m * m, { rtol: 0.001 }),
        steps: ['Row $i$ from the bottom needs $i - 1$ multiplications, $i - 1$ subtractions and 1 division: $2i - 1$ operations.', 'Adding up, $\\sum_{i=1}^{n}(2i - 1) = n^{2}$.', (both ? 'Two triangular solves: $2n^{2} = ' + T.commas(2 * m * m) + '$.' : '$n^{2} = ' + T.commas(m * m) + '$.') + ' Compare $\\frac{2}{3}n^{3} \\approx ' + sci(fl(Q(2 * m * m * m, 3), 3), 3) + '$ for the elimination itself.'],
        hint: 'n² per triangular solve.', _d: { k: kind, n: m, both: both }
      };
    }
    if (kind === 'inverse') return {
      q: 'To solve $A\\mathbf{x} = \\mathbf{b}$, why is it better to use elimination (or $PA = LU$) than to compute $A^{-1}$ and then $A^{-1}\\mathbf{b}$?',
      a: mc('Finding $A^{-1}$ costs about $2n^{3}$ operations, three times as much, and is usually less accurate', ['$A^{-1}$ does not exist for most matrices', 'Multiplying $A^{-1}\\mathbf{b}$ costs about $n^{3}$ operations', 'Elimination gives an exact answer, and $A^{-1}$ does not']),
      steps: ['Computing $A^{-1}$ means solving $n$ systems, one per column of $I$: about $2n^{3}$ operations, versus $\\frac{2}{3}n^{3}$ for one elimination.', 'Rounding errors made while forming $A^{-1}$ also make $A^{-1}\\mathbf{b}$ less accurate than elimination with partial pivoting, which is backward stable in practice.', 'So: factor once, then use two triangular solves for each $\\mathbf{b}$.'],
      hint: 'Compare the operation counts.', _d: { k: kind }
    };
    // manyrhs
    var nn = R.pick([300, 600, 900, 1500, 3000]), k = R.pick([10, 50, 100, 200]), once = Q(2 * nn * nn * nn, 3).add(2 * k * nn * nn), redo = Q(2 * nn * nn * nn, 3).add(2 * nn * nn).mul(k);
    var askRatio = R.coin();
    if (askRatio) { var rt = redo.div(once); return {
      q: 'A program must solve $A\\mathbf{x} = \\mathbf{b}$ for ' + k + ' different right sides, with $n = ' + T.commas(nn) + '$. Approach A redoes elimination for each $\\mathbf{b}$ (about $\\frac{2}{3}n^{3} + 2n^{2}$ each). Approach B factors $PA = LU$ once ($\\frac{2}{3}n^{3}$) and then does two triangular solves ($2n^{2}$) per $\\mathbf{b}$. About how many times faster is B? Round to the nearest whole number.',
      a: num(Math.round(rt.toNumber()), { form: 'int' }),
      steps: ['A: $' + k + '\\left(\\frac{2}{3}n^{3} + 2n^{2}\\right) \\approx ' + sci(fl(redo, 4), 4) + '$.', 'B: $\\frac{2}{3}n^{3} + ' + k + ' \\cdot 2n^{2} \\approx ' + sci(fl(once, 4), 4) + '$.', 'Ratio $\\approx ' + rt.toNumber().toFixed(2) + '$, so about $' + Math.round(rt.toNumber()) + '$ times faster.'],
      hint: 'Compute both totals, then divide.', _d: { k: 'manyrhs', n: nn, r: k, ratio: true }
    }; }
    return {
      q: 'Solve $A\\mathbf{x} = \\mathbf{b}$ for ' + k + ' different right sides with $n = ' + T.commas(nn) + '$, by factoring $PA = LU$ once (about $\\frac{2}{3}n^{3}$ operations) and doing two triangular solves (about $2n^{2}$) for each $\\mathbf{b}$. About how many operations in all?',
      a: num(once, { rtol: 0.001 }),
      steps: ['Factor once: $\\frac{2}{3}(' + T.commas(nn) + ')^{3} = ' + sci(fl(Q(2 * nn * nn * nn, 3), 4), 4) + '$.', 'Solves: $' + k + ' \\times 2(' + T.commas(nn) + ')^{2} = ' + sci(q(2 * k * nn * nn), 4) + '$.', 'Total $\\approx ' + sci(fl(once, 4), 4) + '$.'],
      hint: 'Add the one-time factoring cost to k times the cost of the two triangular solves.', _d: { k: 'manyrhs', n: nn, r: k, ratio: false }
    };
  });

  // ---------------------------------------------------------------- num.partial-pivoting
  function pivotMatrix(R, n) { // integer matrix with a unique largest |entry| in column 1, not in row 1
    for (var t = 0; t < 50; t++) {
      var A = []; for (var i = 0; i < n; i++) { var r = []; for (var j = 0; j < n; j++) r.push(R.nz(-9, 9)); A.push(r); }
      var col = A.map(function (r) { return Math.abs(r[0]); }), mx = Math.max.apply(null, col);
      if (col.filter(function (v) { return v === mx; }).length === 1 && col[0] !== mx) return A;
    }
    return [[2, 1, -1], [-6, 3, 2], [4, -2, 5]];
  }
  G('num.partial-pivoting', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pivotrow', 'pivotrow', 'concept']), R.pick(['mult', 'step2', 'pivotrow']), R.pick(['digits', 'digits', 'step2']));
    if (kind === 'pivotrow') {
      var A = pivotMatrix(R, 3), col = A.map(function (r) { return Math.abs(r[0]); }), pr = col.indexOf(Math.max.apply(null, col)) + 1;
      return {
        q: 'Gaussian elimination with partial pivoting starts on $A = ' + texM(A) + '$. Which row is swapped into row 1 before the first elimination step? Give the row number.',
        a: num(pr, { form: 'int' }),
        steps: ['Partial pivoting compares the sizes of the entries in column 1: $' + A.map(function (r) { return '|' + r[0] + '| = ' + Math.abs(r[0]); }).join(',\\ ') + '$.', 'The largest is in row ' + pr + ', so rows 1 and ' + pr + ' are swapped.', 'Then every multiplier $m_{i1} = a_{i1}/a_{11}$ has $|m_{i1}| \\le 1$, so no row gets multiplied by a huge number.'],
        hint: 'Compare absolute values, not signed values.', _d: { k: kind, A: A, v: pr }
      };
    }
    if (kind === 'mult') {
      var B = pivotMatrix(R, 3), c1 = B.map(function (r) { return Math.abs(r[0]); }), p = c1.indexOf(Math.max.apply(null, c1));
      var S = B.slice(); var tmp = S[0]; S[0] = S[p]; S[p] = tmp;
      var row = R.pick([1, 2]), mlt = Q(S[row][0], S[0][0]);
      return {
        q: 'Use partial pivoting on $A = ' + texM(B) + '$. After the row swap for column 1, what is the multiplier for row ' + (row + 1) + ' (the number $m$ in "row ' + (row + 1) + ' minus $m$ times row 1")?',
        a: num(mlt),
        steps: ['Largest $|a_{i1}|$ is $' + Math.abs(B[p][0]) + '$ in row ' + (p + 1) + '; swap it to the top: $' + texM(S) + '$.', 'Multiplier for row ' + (row + 1) + ': $m = \\frac{' + S[row][0] + '}{' + S[0][0] + '} = ' + tq(mlt) + '$.', 'With partial pivoting, $|m| \\le 1$ always.'],
        hint: 'Swap first, then divide the entry below the pivot by the pivot.', _d: { k: kind, A: B, row: row, v: mlt.toPlain() }
      };
    }
    if (kind === 'step2') {
      var C, Sw, E, p2, ok = false;
      for (var t = 0; t < 60 && !ok; t++) {
        C = pivotMatrix(R, 3); var cc = C.map(function (r) { return Math.abs(r[0]); }), pp = cc.indexOf(Math.max.apply(null, cc));
        Sw = C.slice(); var tm = Sw[0]; Sw[0] = Sw[pp]; Sw[pp] = tm;
        E = qm(Sw); for (var i = 1; i < 3; i++) { var mm = E[i][0].div(E[0][0]); E[i] = E[i].map(function (v, j) { return v.sub(mm.mul(E[0][j])); }); }
        var a = E[1][1].abs(), b = E[2][1].abs(); ok = !a.eq(b) && !(a.isZero() && b.isZero()); p2 = a.gt(b) ? 2 : 3;
        ok = ok && E[1][1].d <= 6n && E[2][1].d <= 6n;
      }
      return {
        q: 'Partial pivoting on $A = ' + texM(C) + '$: after the first swap and elimination step, which row (2 or 3) holds the pivot for column 2?',
        a: num(p2, { form: 'int' }),
        steps: ['Swap the row with the largest $|a_{i1}|$ to the top: $' + texM(Sw) + '$.', 'Eliminate below it: $' + T.mat(E.map(function (r) { return r.map(function (v) { return tq(v); }); })) + '$.', 'Column 2, rows 2 and 3: $|' + tq(E[1][1]) + '|$ and $|' + tq(E[2][1]) + '|$. The larger is in row ' + p2 + (p2 === 3 ? ', so rows 2 and 3 are swapped next.' : ', so no swap is needed.')],
        hint: 'Do the first step completely, then compare the sizes of the two entries left in column 2.', _d: { k: kind, A: C, v: p2 }
      };
    }
    if (kind === 'digits') {
      var m = R.pick([4, 5]), eps = pow10(-m), b1 = R.int(1, 4), b2 = b1 + R.int(1, 3), k = 3;
      // without pivoting
      var mu = fl(q(1).div(eps), k), a22 = fl(q(1).sub(fl(mu, k)), k), bb2 = fl(q(b2).sub(fl(mu.mul(b1), k)), k), y0 = fl(bb2.div(a22), k), x0 = fl(fl(q(b1).sub(y0), k).div(eps), k);
      // with pivoting
      var mu2 = fl(eps, k), a22p = fl(q(1).sub(fl(mu2, k)), k), bb1 = fl(q(b1).sub(fl(mu2.mul(b2), k)), k), y1 = fl(bb1.div(a22p), k), x1 = fl(q(b2).sub(y1), k);
      var xt = q(b2 - b1).div(q(1).sub(eps));
      return {
        q: 'Solve $$\\begin{aligned} ' + sci(eps) + '\\,x + y &= ' + b1 + ' \\\\ x + y &= ' + b2 + ' \\end{aligned}$$ in 3-digit decimal arithmetic (round every result to 3 significant digits). Find $x$ (a) without a row swap, using the tiny pivot, and (b) with partial pivoting.',
        a: multi([{ label: '(a) $x$ without pivoting:', a: num(x0) }, { label: '(b) $x$ with pivoting:', a: num(x1) }]),
        steps: ['(a) Multiplier $1 / ' + sci(eps) + ' = ' + sci(mu) + '$. New row 2: $(1 - ' + sci(mu) + ')y = ' + b2 + ' - ' + sci(mu.mul(b1)) + '$, which rounds to $' + sci(a22, 3) + '\\,y = ' + sci(bb2, 3) + '$.', 'So $y = ' + td(y0) + '$, and $x = \\frac{' + b1 + ' - ' + td(y0) + '}{' + sci(eps) + '} = ' + td(x0) + '$. The 1 and the ' + b2 + ' in row 2 were lost in rounding.', '(b) Swap the rows; the multiplier is $' + sci(eps) + '$. New row 2: $(1 - ' + sci(eps) + ')y = ' + b1 + ' - ' + sci(eps.mul(b2)) + '$, which rounds to $' + (a22p.eq(1) ? '' : td(a22p)) + 'y = ' + td(bb1) + '$. So $y = ' + td(y1) + '$ and $x = ' + b2 + ' - ' + td(y1) + ' = ' + td(x1) + '$.', 'The true solution has $x = ' + xt.toNumber().toFixed(5) + '\\ldots$: pivoting gave it to 3 digits; the tiny pivot gave nonsense.'],
        hint: 'Round after every operation; in (a) look at what happens to 1 − 10^' + m + '.', _d: { k: kind, m: m, b1: b1, b2: b2, v: [x0.toPlain(), x1.toPlain()] }
      };
    }
    var S2 = R.pick([
      ['In floating point, a row swap is only needed when a pivot is exactly $0$.', false, 'A tiny pivot such as $10^{-20}$ gives multipliers near $10^{20}$, which swamp the other entries in rounding. Partial pivoting swaps whenever a larger entry sits below, not only for zeros.'],
      ['With partial pivoting, every multiplier has absolute value at most $1$.', true, 'The pivot is the entry of largest size in its column (at or below the diagonal), so dividing any entry below it by the pivot gives a number of size at most 1.'],
      ['Partial pivoting chooses the pivot by the signed value, so $-9$ loses to $2$.', false, 'It compares absolute values: $|-9| = 9 > 2$, so $-9$ would be the pivot.']
    ]);
    return { q: 'True or false? ' + S2[0], a: tf(S2[1]), steps: [S2[2]], hint: 'Think about what a huge multiplier does to the other entries in a row.', _d: { k: 'concept', v: S2[1] } };
  });

  // ---------------------------------------------------------------- num.lu-solve
  function perm3(R) { return R.pick([[1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1]]); } // row i of P·b is b[perm[i]]
  function permMat(pm) { return pm.map(function (j) { return [0, 1, 2].map(function (c) { return c === j ? 1 : 0; }); }); }
  function luCase(R) {
    for (var t = 0; t < 80; t++) {
      var L = [[q(1), q(0), q(0)], [q(R.pick(['1/2', '-1/2', '1', '-1', '0', '1/2'])), q(1), q(0)], [q(R.pick(['1/2', '-1/2', '1', '-1', '1/4'])), q(R.pick(['1/2', '-1/2', '1', '-1', '0'])), q(1)]];
      var U = [[q(R.pick([2, 4, -4, 6, -2])), q(R.int(-3, 3)), q(R.int(-3, 3))], [q(0), q(R.pick([2, 3, -2, 4, 1])), q(R.int(-3, 3))], [q(0), q(0), q(R.pick([1, 2, -1, 3, -2]))]];
      var x = [q(R.int(-3, 3)), q(R.int(-3, 3)), q(R.nz(-3, 3))], y = mv(U, x), pb = mv(L, y);
      if (pb.every(function (v) { return v.isInt(); }) && y.every(function (v) { return v.isInt(); })) {
        var pm = perm3(R), b = [q(0), q(0), q(0)]; pm.forEach(function (j, i) { b[j] = pb[i]; });
        return { L: L, U: U, x: x, y: y, pb: pb, b: b, pm: pm };
      }
    }
    return null;
  }
  G('num.lu-solve', function (R, ctx) {
    var kind = lv(ctx, R.pick(['Pb', 'forward']), R.pick(['forward', 'full']), R.pick(['full', 'full', 'forward']));
    var C = luCase(R), P = permMat(C.pm);
    var given = '$$P = ' + texM(P) + ',\\ L = ' + texM(C.L) + ',$$ $$U = ' + texM(C.U) + ',\\ \\mathbf{b} = ' + texCol(C.b) + '.$$';
    var s1 = 'First reorder $\\mathbf{b}$: $P\\mathbf{b} = ' + texCol(C.pb) + '$ (row $i$ of $P$ picks out one entry of $\\mathbf{b}$).';
    function lt(l, y) { return l.isZero() ? '' : ' - ' + parenF(l) + '\\cdot ' + paren(y); }
    var s2 = 'Forward substitution, $L\\mathbf{y} = P\\mathbf{b}$, top down: $y_1 = ' + td(C.pb[0]) + '$, $y_2 = ' + td(C.pb[1]) + lt(C.L[1][0], C.y[0]) + (C.L[1][0].isZero() ? '' : ' = ' + td(C.y[1])) + '$, $y_3 = ' + td(C.pb[2]) + lt(C.L[2][0], C.y[0]) + lt(C.L[2][1], C.y[1]) + ' = ' + td(C.y[2]) + '$.';
    var s3 = 'Back substitution, $U\\mathbf{x} = \\mathbf{y}$, bottom up: $x_3 = ' + td(C.x[2]) + '$, then $x_2 = ' + td(C.x[1]) + '$, then $x_1 = ' + td(C.x[0]) + '$.';
    var D = { L: C.L.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), U: C.U.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), b: C.b.map(function (v) { return v.toPlain(); }), pm: C.pm };
    if (kind === 'Pb') return {
      q: 'Partial pivoting gave $PA = LU$ with $P = ' + texM(P) + '$. To solve $A\\mathbf{x} = \\mathbf{b}$ with $\\mathbf{b} = ' + texCol(C.b) + '$, the first step is to form $P\\mathbf{b}$. What is it?',
      a: tup(C.pb), steps: [s1, 'Forgetting this step solves a different system: the rows of $L$ and $U$ belong to the swapped order.'],
      hint: 'Each row of P has a single 1; it says which entry of b goes in that position.', nolint: ['+ -', '--'], _d: { k: kind, D: D, v: C.pb.map(function (v) { return v.toPlain(); }) }
    };
    if (kind === 'forward') return {
      q: 'Partial pivoting gave $PA = LU$ with' + given + 'Find $\\mathbf{y}$ with $L\\mathbf{y} = P\\mathbf{b}$.',
      a: tup(C.y), steps: [s1, s2],
      hint: 'Apply P to b first, then solve from the top row down.', nolint: ['+ -', '--'], _d: { k: kind, D: D, v: C.y.map(function (v) { return v.toPlain(); }) }
    };
    return {
      q: 'Partial pivoting gave $PA = LU$ with' + given + 'Solve $A\\mathbf{x} = \\mathbf{b}$.',
      a: tup(C.x), steps: [s1, s2, s3, 'Check: $A = P^{T}LU$, and $A\\mathbf{x}$ should give back $\\mathbf{b}$.'],
      hint: 'Pb first, then Ly = Pb (top down), then Ux = y (bottom up).', nolint: ['+ -', '--'], _d: { k: 'full', D: D, v: C.x.map(function (v) { return v.toPlain(); }) }
    };
  });

  // ---------------------------------------------------------------- num.norms
  G('num.norms', function (R, ctx) {
    var kind = lv(ctx, R.pick(['vec', 'vec', 'mat']), R.pick(['mat', 'vec', 'mat']), R.pick(['both', 'bound', 'mat']));
    if (kind === 'vec') {
      var base = R.pick([[1, 2, 2, 3], [2, 3, 6, 7], [2, 6, 9, 11], [4, 4, 7, 9], [1, 4, 8, 9], [3, 4, 12, 13], [2, 10, 11, 15]]), x = R.shuffle(base.slice(0, 3)).map(function (v) { return v * R.sign(); });
      var which = R.pick(['1', '2', 'inf']), val = which === '1' ? base[0] + base[1] + base[2] : which === '2' ? base[3] : Math.max(base[0], base[1], base[2]);
      var nm = which === 'inf' ? '\\infty' : which;
      return {
        q: 'Find $\\lVert\\mathbf{x}\\rVert_{' + nm + '}$ for $\\mathbf{x} = (' + x.join(', ') + ')$.',
        a: num(val, { form: 'int' }),
        steps: [which === '1' ? '$\\lVert\\mathbf{x}\\rVert_1$ adds the absolute values: $' + x.map(function (v) { return Math.abs(v); }).join(' + ') + ' = ' + val + '$.' : which === '2' ? '$\\lVert\\mathbf{x}\\rVert_2 = \\sqrt{' + x.map(function (v) { return v < 0 ? '(' + v + ')^{2}' : v + '^{2}'; }).join(' + ') + '} = \\sqrt{' + val * val + '} = ' + val + '$.' : '$\\lVert\\mathbf{x}\\rVert_\\infty$ is the largest absolute value: $\\max(' + x.map(function (v) { return Math.abs(v); }).join(', ') + ') = ' + val + '$.', 'For every vector, $\\lVert\\mathbf{x}\\rVert_\\infty \\le \\lVert\\mathbf{x}\\rVert_2 \\le \\lVert\\mathbf{x}\\rVert_1$; here $' + Math.max(base[0], base[1], base[2]) + ' \\le ' + base[3] + ' \\le ' + (base[0] + base[1] + base[2]) + '$.'],
        hint: which === '1' ? 'Add the absolute values.' : which === '2' ? 'Square, add, take the square root.' : 'Take the largest absolute value.', _d: { k: kind, x: x, w: which, v: val }
      };
    }
    var A = []; for (var i = 0; i < 3; i++) { var r = []; for (var j = 0; j < 3; j++) r.push(R.int(-7, 7)); A.push(r); }
    var rows = A.map(function (r) { return r.reduce(function (s, v) { return s + Math.abs(v); }, 0); }), cols = [0, 1, 2].map(function (j) { return A.reduce(function (s, r) { return s + Math.abs(r[j]); }, 0); });
    var ninf = Math.max.apply(null, rows), n1 = Math.max.apply(null, cols);
    var rs = 'Absolute row sums: $' + rows.join(', ') + '$, so $\\lVert A\\rVert_\\infty = ' + ninf + '$.', cs = 'Absolute column sums: $' + cols.join(', ') + '$, so $\\lVert A\\rVert_1 = ' + n1 + '$.';
    if (kind === 'mat') {
      var w = R.pick(['1', 'inf']);
      return {
        q: 'Find $\\lVert A\\rVert_{' + (w === 'inf' ? '\\infty' : '1') + '}$ for $A = ' + texM(A) + '$.',
        a: num(w === 'inf' ? ninf : n1, { form: 'int' }),
        steps: [w === 'inf' ? '$\\lVert A\\rVert_\\infty$ is the largest absolute <b>row</b> sum (it matches $\\lVert\\cdot\\rVert_\\infty$, which looks at one entry of $A\\mathbf{x}$, that is, one row, at a time).' : '$\\lVert A\\rVert_1$ is the largest absolute <b>column</b> sum (it matches $\\lVert\\cdot\\rVert_1$: $A\\mathbf{e}_j$ is column $j$).', w === 'inf' ? rs : cs, 'Memory aid: $\\infty$ lies flat, like a row; $1$ stands up, like a column.'],
        hint: 'Add absolute values: across rows for ∞, down columns for 1.', _d: { k: kind, A: A, w: w }
      };
    }
    if (kind === 'both') return {
      q: 'For $A = ' + texM(A) + '$, find $\\lVert A\\rVert_1$ and $\\lVert A\\rVert_\\infty$.',
      a: multi([{ label: '$\\lVert A\\rVert_1 =$', a: num(n1, { form: 'int' }) }, { label: '$\\lVert A\\rVert_\\infty =$', a: num(ninf, { form: 'int' }) }]),
      steps: [cs, rs, 'Both add absolute values: a sum like $3 + (-5)$ would undercount.'],
      hint: '1: columns. ∞: rows. Absolute values throughout.', _d: { k: kind, A: A }
    };
    var xv = [R.nz(-4, 4), R.nz(-4, 4), R.nz(-4, 4)], xn = Math.max.apply(null, xv.map(Math.abs));
    return {
      q: 'Let $A = ' + texM(A) + '$ and $\\mathbf{x} = (' + xv.join(', ') + ')$. Without computing $A\\mathbf{x}$, what upper bound does $\\lVert A\\mathbf{x}\\rVert_\\infty \\le \\lVert A\\rVert_\\infty\\lVert\\mathbf{x}\\rVert_\\infty$ give?',
      a: num(ninf * xn, { form: 'int' }),
      steps: [rs, '$\\lVert\\mathbf{x}\\rVert_\\infty = ' + xn + '$.', 'Bound: $' + ninf + ' \\times ' + xn + ' = ' + ninf * xn + '$. (The actual value is $\\lVert A\\mathbf{x}\\rVert_\\infty = ' + normInfV(mv(A, xv)).toPlain() + '$.)'],
      hint: 'Multiply the largest absolute row sum by the largest absolute entry of x.', _d: { k: 'bound', A: A, x: xv }
    };
  });

  // ---------------------------------------------------------------- num.condition-number
  G('num.condition-number', function (R, ctx) {
    var kind = lv(ctx, R.pick(['bound', 'kappa']), R.pick(['kappa', 'residual', 'bound']), R.pick(['residual', 'kappa', 'det']));
    if (kind === 'bound') {
      var K = R.pick([10, 50, 100, 1000, 20000]), rb = q(R.pick([1, 2, 5])).div(pow10(R.int(4, 8))), rx = rb.mul(K);
      return {
        q: 'A matrix has $\\kappa_\\infty(A) = ' + T.commas(K) + '$. The right side $\\mathbf{b}$ of $A\\mathbf{x} = \\mathbf{b}$ has relative error $\\frac{\\lVert\\delta\\mathbf{b}\\rVert_\\infty}{\\lVert\\mathbf{b}\\rVert_\\infty} = ' + sci(rb) + '$. What is the bound on the relative error in $\\mathbf{x}$?',
        a: num(rx, { rtol: 1e-9 }),
        steps: ['$\\frac{\\lVert\\delta\\mathbf{x}\\rVert}{\\lVert\\mathbf{x}\\rVert} \\le \\kappa(A)\\frac{\\lVert\\delta\\mathbf{b}\\rVert}{\\lVert\\mathbf{b}\\rVert}$.', '$' + T.commas(K) + ' \\times ' + sci(rb) + ' = ' + sci(rx) + '$.', 'Roughly, we lose $\\log_{10}\\kappa \\approx ' + Math.log10(K).toFixed(1) + '$ digits.'],
        hint: 'Multiply the relative error in b by κ.', _d: { k: kind, K: K, rb: rb.toPlain() }
      };
    }
    if (kind === 'kappa') {
      var A, Ai, kap;
      for (var t = 0; t < 50; t++) { A = [[R.nz(-6, 6), R.int(-6, 6)], [R.int(-6, 6), R.nz(-6, 6)]]; var d = det2(A); if (!d.isZero() && d.abs().le(ctx.level === 3 ? 2 : 5)) break; }
      Ai = inv2(A); kap = normInfM(qm(A)).mul(normInfM(Ai));
      return {
        q: 'Find the condition number $\\kappa_\\infty(A) = \\lVert A\\rVert_\\infty\\lVert A^{-1}\\rVert_\\infty$ of $A = ' + texM(A) + '$.',
        a: num(kap),
        steps: ['$\\lVert A\\rVert_\\infty$ = largest absolute row sum $= ' + td(normInfM(qm(A))) + '$.', '$\\det A = ' + td(det2(A)) + '$, so $A^{-1} = ' + T.mat(Ai.map(function (r) { return r.map(function (v) { return tq(v); }); })) + '$.', '$\\lVert A^{-1}\\rVert_\\infty = ' + tq(normInfM(Ai)) + '$.', '$\\kappa_\\infty(A) = ' + td(normInfM(qm(A))) + ' \\times ' + tq(normInfM(Ai)) + ' = ' + tq(kap) + '$.'],
        hint: 'Find A⁻¹, then the largest absolute row sum of A and of A⁻¹.', _d: { k: kind, A: A, v: kap.toPlain() }
      };
    }
    if (kind === 'residual') {
      var m = R.int(2, 4), dl = pow10(-m), tt = R.pick([1, 2, 3, 5, 10]) * R.sign(), b2 = q(2).add(dl), xt = [q(1).add(tt), q(1).sub(tt)];
      var res = dl.mul(Math.abs(tt));
      return {
        q: 'The system $$\\begin{aligned} x + y &= 2 \\\\ x + ' + td(q(1).add(dl)) + 'y &= ' + td(b2) + ' \\end{aligned}$$ has the solution $(1, 1)$. Someone offers $\\tilde{\\mathbf{x}} = ' + texV(xt) + '$. Find the size of the residual, $\\lVert\\mathbf{b} - A\\tilde{\\mathbf{x}}\\rVert_\\infty$, and of the error, $\\lVert\\mathbf{x} - \\tilde{\\mathbf{x}}\\rVert_\\infty$.',
        a: multi([{ label: 'residual:', a: num(res) }, { label: 'error:', a: num(Math.abs(tt), { form: 'int' }) }]),
        steps: ['$A\\tilde{\\mathbf{x}} = (' + td(xt[0].add(xt[1])) + ',\\ ' + td(xt[0].add(q(1).add(dl).mul(xt[1]))) + ')$, so $\\mathbf{b} - A\\tilde{\\mathbf{x}} = (0,\\ ' + td(b2.sub(xt[0].add(q(1).add(dl).mul(xt[1])))) + ')$ and the residual is $' + td(res) + '$.', 'The error is $\\mathbf{x} - \\tilde{\\mathbf{x}} = (' + (-tt) + ', ' + tt + ')$, of size $' + Math.abs(tt) + '$.', 'A tiny residual, a large error: the two rows are nearly parallel lines, $\\kappa_\\infty(A) \\approx ' + T.commas(4 * Math.pow(10, m)) + '$, and a point far along the lines still almost satisfies both equations.'],
        hint: 'Compute A x̃ and subtract it from b; then subtract x̃ from (1, 1).', nolint: ['+ -', '--'], _d: { k: kind, m: m, t: tt }
      };
    }
    // det: a small determinant does not mean ill-conditioned
    var s = R.pick([q('0.1'), q('0.01'), q('0.001')]), n = R.pick([3, 5, 10]);
    return {
      q: 'Let $A = ' + td(s) + 'I$, the $' + n + ' \\times ' + n + '$ identity matrix times $' + td(s) + '$. Its determinant is $' + td(s) + '^{' + n + '} = ' + td(s.pow(n)) + '$, which is tiny. What is $\\kappa_\\infty(A)$?',
      a: num(1, { form: 'int' }),
      steps: ['$\\lVert A\\rVert_\\infty = ' + td(s) + '$ and $A^{-1} = ' + td(s.inv()) + 'I$, so $\\lVert A^{-1}\\rVert_\\infty = ' + td(s.inv()) + '$.', '$\\kappa_\\infty(A) = ' + td(s) + ' \\times ' + td(s.inv()) + ' = 1$: perfectly conditioned.', 'A small determinant does not mean ill-conditioned; scaling changes the determinant but not $\\kappa$. Use $\\kappa$, not $\\det$, to judge sensitivity.'],
      hint: 'Compute ‖A‖ and ‖A⁻¹‖ directly.', _d: { k: 'det' }
    };
  });

  // ---------------------------------------------------------------- Jacobi and Gauss–Seidel
  function ddSystem(R, n) { // strictly diagonally dominant integer system with an integer solution
    var A = [], x = [];
    for (var i = 0; i < n; i++) { x.push(R.nz(-3, 3)); var r = []; for (var j = 0; j < n; j++) r.push(i === j ? 0 : R.int(-2, 2)); if (r.every(function (v) { return v === 0; })) r[(i + 1) % n] = R.pick([-1, 1, 2, -2]); var off = r.reduce(function (s, v) { return s + Math.abs(v); }, 0); r[i] = R.pick([off + 1, off + 2, off + 3, 4, 5].filter(function (v) { return v > off; })) * (R.chance(0.15) ? -1 : 1); A.push(r); }
    var b = A.map(function (r) { return r.reduce(function (s, a, j) { return s + a * x[j]; }, 0); });
    return { A: A, b: b, x: x };
  }
  function jacobiStep(A, b, x) { return A.map(function (r, i) { var s = q(b[i]); r.forEach(function (a, j) { if (j !== i) s = s.sub(q(a).mul(x[j])); }); return s.div(r[i]); }); }
  function gsStep(A, b, x) { var y = x.slice(); A.forEach(function (r, i) { var s = q(b[i]); r.forEach(function (a, j) { if (j !== i) s = s.sub(q(a).mul(y[j])); }); y[i] = s.div(r[i]); }); return y; }
  function sysTex(A, b) { var V = ['x', 'y', 'z']; return '$$\\begin{aligned} ' + A.map(function (r, i) { var t = []; r.forEach(function (a, j) { t.push([a, V[j]]); }); return T.terms(t).replace(/ ([+-]) /g, ' $1 ') + ' &= ' + b[i]; }).join(' \\\\ ') + ' \\end{aligned}$$'; }
  function iterStepsText(A, b, from, to, gs) {
    var V = ['x', 'y', 'z'], out = [];
    A.forEach(function (r, i) {
      var num = String(b[i]);
      r.forEach(function (a, j) { if (j === i || a === 0) return; var v = gs && j < i ? to[j] : from[j]; num += (a > 0 ? ' - ' : ' + ') + (Math.abs(a) === 1 ? '' : Math.abs(a) + '\\cdot ') + parenF(v); });
      out.push('$' + V[i] + ' = \\frac{' + num + '}{' + r[i] + '} = ' + tq(to[i]) + '$');
    });
    return out;
  }
  G('num.jacobi', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sweep', 'sweep', 'dd']), R.pick(['two', 'order', 'sweep']), R.pick(['rho', 'two', 'order']));
    if (kind === 'sweep' || kind === 'two') {
      var n = kind === 'two' ? 2 : R.pick([2, 3]), S = ddSystem(R, n), x0 = S.x.map(function () { return q(0); });
      if (kind === 'sweep' && R.coin()) x0 = S.x.map(function () { return q(R.int(-1, 1)); });
      var x1 = jacobiStep(S.A, S.b, x0), x2 = jacobiStep(S.A, S.b, x1), nIt = kind === 'two' ? 2 : 1, ans = nIt === 2 ? x2 : x1;
      var st = ['Solve equation $i$ for variable $i$, using only the old values on the right.', 'Sweep 1 from $' + texVf(x0) + '$: ' + iterStepsText(S.A, S.b, x0, x1, false).join(', ') + '.'];
      if (nIt === 2) st.push('Sweep 2 from $' + texVf(x1) + '$: ' + iterStepsText(S.A, S.b, x1, x2, false).join(', ') + '.');
      st.push('The exact solution is $' + texV(S.x) + '$; the iterates head toward it because the system is strictly diagonally dominant.');
      return {
        q: 'Apply ' + (nIt === 2 ? 'two sweeps' : 'one sweep') + ' of Jacobi iteration to ' + sysTex(S.A, S.b) + ' starting from $' + texVf(x0) + '$. Give the new approximation.',
        a: tup(ans), steps: st,
        hint: 'Every new value uses only values from the previous sweep.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, A: S.A, b: S.b, x0: x0.map(function (v) { return v.toPlain(); }), n: nIt }
      };
    }
    if (kind === 'dd') {
      var S2 = ddSystem(R, 3), i = R.int(0, 2), broke = R.coin();
      var A2 = S2.A.map(function (r) { return r.slice(); });
      if (broke) { var off = A2[i].reduce(function (s, v, j) { return j === i ? s : s + Math.abs(v); }, 0); if (off === 0) { A2[i][(i + 1) % 3] = 2; off = 2; } A2[i][i] = off * (A2[i][i] < 0 ? -1 : 1); }
      var isDD = A2.every(function (r, k) { return Math.abs(r[k]) > r.reduce(function (s, v, j) { return j === k ? s : s + Math.abs(v); }, 0); });
      return {
        q: 'True or false: the matrix $' + texM(A2) + '$ is strictly diagonally dominant by rows.',
        a: tf(isDD),
        steps: ['Strictly diagonally dominant: in every row, $|a_{ii}|$ is bigger than the sum of the other $|a_{ij}|$.'].concat(A2.map(function (r, k) { var off = r.reduce(function (s, v, j) { return j === k ? s : s + Math.abs(v); }, 0); return 'Row ' + (k + 1) + ': $|' + r[k] + '| = ' + Math.abs(r[k]) + '$ vs. $' + off + '$: ' + (Math.abs(r[k]) > off ? 'bigger' : 'not bigger') + '.'; })).concat([isDD ? 'Every row passes, so Jacobi and Gauss–Seidel are guaranteed to converge.' : 'One row fails (a tie is not enough), so the guarantee does not apply.']),
        hint: 'Check every row: |diagonal| > sum of the other |entries|.', _d: { k: kind, A: A2, v: isDD }
      };
    }
    if (kind === 'order') {
      // the equations given in an order that is not diagonally dominant; which reordering is?
      var S3 = ddSystem(R, 3), pm = R.pick([[1, 2, 0], [2, 0, 1], [1, 0, 2], [0, 2, 1], [2, 1, 0]]), Ag = pm.map(function (k) { return S3.A[k]; }), bg = pm.map(function (k) { return S3.b[k]; });
      // the right order: equation pm.indexOf(k) of the given list goes to position k
      var right = [0, 1, 2].map(function (k) { return pm.indexOf(k) + 1; }), lab = function (o) { return 'Equations in the order ' + o.join(', '); };
      var wrongs = [[1, 2, 3], [3, 2, 1], [2, 3, 1], [3, 1, 2], [2, 1, 3], [1, 3, 2]].filter(function (o) { return o.join() !== right.join(); });
      return {
        q: 'Jacobi iteration is to be used on ' + sysTex(Ag, bg) + ' (equations numbered 1, 2, 3 from the top). As given, the system is not diagonally dominant and the iteration may diverge. Which order of the equations makes it strictly diagonally dominant, with $x$, $y$, $z$ solved from equations 1, 2, 3 of the new order?',
        a: mc(lab(right), R.sample(wrongs, 3).map(lab)),
        steps: ['Each equation should go where its biggest coefficient (in size) lands on the diagonal.'].concat(right.map(function (e, k) { return 'Equation ' + e + ' has its largest coefficient on $' + ['x', 'y', 'z'][k] + '$, so it goes in position ' + (k + 1) + '.'; })).concat(['Reordering equations changes nothing about the solution, but it can turn a diverging iteration into a converging one.']),
        hint: 'Find which equation has the dominant x-coefficient, which the dominant y, which the dominant z.', _d: { k: kind, right: right, Ag: Ag }
      };
    }
    // rho: spectral radius of the Jacobi iteration matrix for a 2 x 2 system
    var s = R.pick([2, 3]), t2 = R.pick([2, 3, 4]), u = R.int(1, Math.min(s * s, t2 * t2) - 1), sg = R.sign();
    var A4 = [[s * s, u], [sg * u, t2 * t2]], rr = sg > 0 ? Q(u, s * t2) : Q(u, s * t2);
    return {
      q: 'For the $2 \\times 2$ system with matrix $A = ' + texM(A4) + '$, the Jacobi iteration matrix is $T = -D^{-1}(L + U)$. Find its spectral radius $\\rho(T)$ (the largest $|\\lambda|$).',
      a: num(rr),
      steps: ['$T = ' + T.mat([['0', tq(Q(-u, s * s))], [tq(Q(-sg * u, t2 * t2)), '0']]) + '$.', 'Its eigenvalues satisfy $\\lambda^{2} = ' + tq(Q(sg * u * u, s * s * t2 * t2)) + '$' + (sg < 0 ? ', so $\\lambda = \\pm ' + tq(rr) + 'i$' : ', so $\\lambda = \\pm ' + tq(rr) + '$') + '.', '$\\rho(T) = ' + tq(rr) + ' < 1$: the error shrinks by about that factor per sweep.'],
      hint: 'For a 2 × 2 system, ρ(T)² = |a₁₂a₂₁/(a₁₁a₂₂)|.', _d: { k: 'rho', A: A4, v: rr.toPlain() }
    };
  });
  G('num.gauss-seidel', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sweep', 'sweep', 'spot']), R.pick(['two', 'compare', 'sweep']), R.pick(['rho', 'two', 'compare']));
    if (kind === 'sweep' || kind === 'two') {
      var n = kind === 'two' ? 2 : R.pick([2, 3]), S = ddSystem(R, n), x0 = S.x.map(function () { return q(0); });
      var x1 = gsStep(S.A, S.b, x0), x2 = gsStep(S.A, S.b, x1), nIt = kind === 'two' ? 2 : 1, ans = nIt === 2 ? x2 : x1;
      var st = ['Solve equation $i$ for variable $i$, and use each new value as soon as it is known.', 'Sweep 1 from $' + texVf(x0) + '$: ' + iterStepsText(S.A, S.b, x0, x1, true).join(', ') + '.'];
      if (nIt === 2) st.push('Sweep 2: ' + iterStepsText(S.A, S.b, x1, x2, true).join(', ') + '.');
      st.push('The exact solution is $' + texV(S.x) + '$.');
      return {
        q: 'Apply ' + (nIt === 2 ? 'two sweeps' : 'one sweep') + ' of Gauss–Seidel iteration to ' + sysTex(S.A, S.b) + ' starting from $' + texVf(x0) + '$, updating the variables in order. Give the new approximation.',
        a: tup(ans), steps: st,
        hint: 'Once x is updated, use the new x right away in the next equations.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, A: S.A, b: S.b, n: nIt }
      };
    }
    if (kind === 'compare') {
      var S2 = ddSystem(R, 2), z = [q(0), q(0)], j1 = jacobiStep(S2.A, S2.b, z), g1 = gsStep(S2.A, S2.b, z);
      return {
        q: 'Starting from $(0, 0)$, take one sweep of Jacobi and one sweep of Gauss–Seidel on ' + sysTex(S2.A, S2.b) + ' Give the value of $y$ after one sweep of each.',
        a: multi([{ label: 'Jacobi $y$:', a: num(j1[1]) }, { label: 'Gauss–Seidel $y$:', a: num(g1[1]) }]),
        steps: ['Both methods get $x = ' + tq(j1[0]) + '$ first.', 'Jacobi uses the old $x = 0$ for $y$: ' + iterStepsText(S2.A, S2.b, z, j1, false)[1] + '.', 'Gauss–Seidel uses the new $x = ' + tq(g1[0]) + '$: ' + iterStepsText(S2.A, S2.b, z, g1, true)[1] + '.', 'The exact $y$ is $' + S2.x[1] + '$.'],
        hint: 'The only difference is which x goes into the y equation.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, A: S2.A, b: S2.b }
      };
    }
    if (kind === 'spot') {
      var S3 = ddSystem(R, 2);
      return {
        q: 'Someone runs "Gauss–Seidel" on ' + sysTex(S3.A, S3.b) + ' but computes the new $y$ from the $x$ of the <b>previous</b> sweep. Which method did they actually run?',
        a: mc('Jacobi iteration', ['Gauss–Seidel iteration', 'Newton\'s method', 'Gaussian elimination']),
        steps: ['Using only previous-sweep values for every variable is exactly Jacobi\'s method.', 'Gauss–Seidel uses each new value as soon as it is computed, which usually makes it converge about twice as fast.'],
        hint: 'Which values go into the y update?', _d: { k: kind }
      };
    }
    var s = R.pick([2, 3]), t2 = R.pick([2, 3, 4]), u = R.int(1, Math.min(s * s, t2 * t2) - 1), A4 = [[s * s, u], [u, t2 * t2]], rg = Q(u * u, s * s * t2 * t2);
    return {
      q: 'For $A = ' + texM(A4) + '$, the Gauss–Seidel iteration matrix for a $2 \\times 2$ system has eigenvalues $0$ and $\\frac{a_{12}a_{21}}{a_{11}a_{22}}$. Find its spectral radius.',
      a: num(rg),
      steps: ['$\\rho = \\left|\\frac{' + u + ' \\cdot ' + u + '}{' + s * s + ' \\cdot ' + t2 * t2 + '}\\right| = ' + tq(rg) + '$.', 'Jacobi\'s spectral radius here is $\\sqrt{' + tq(rg) + '} = ' + tq(Q(u, s * t2)) + '$, so one Gauss–Seidel sweep does about as much as two Jacobi sweeps.'],
      hint: 'Multiply the off-diagonal entries and divide by the product of the diagonal entries.', _d: { k: 'rho', A: A4, v: rg.toPlain() }
    };
  });

  // =====================================================================================================
  // Unit 4: Interpolation
  // =====================================================================================================
  function lagBasis(xs, k, t) { var v = q(1); xs.forEach(function (x, j) { if (j !== k) v = v.mul(q(t).sub(x)).div(q(xs[k]).sub(x)); }); return v; }
  function lagEval(xs, ys, t) { var s = q(0); xs.forEach(function (_, k) { s = s.add(q(ys[k]).mul(lagBasis(xs, k, t))); }); return s; }
  function ddTable(xs, ys) { // table[j][i] = f[x_i, ..., x_{i+j}]
    var tb = [ys.map(q)];
    for (var j = 1; j < xs.length; j++) { var row = []; for (var i = 0; i + j < xs.length; i++) row.push(tb[j - 1][i + 1].sub(tb[j - 1][i]).div(q(xs[i + j]).sub(xs[i]))); tb.push(row); }
    return tb;
  }
  function distinctNodes(R, n, lo, hi) { var xs = R.sample(U.range(lo, hi), n); return xs.sort(function (a, b) { return a - b; }); }
  function ptsTex(xs, ys) { return xs.map(function (x, i) { return '(' + x + ', ' + td(q(ys[i])) + ')'; }).join(', '); }
  function basisTex(xs, k) { return '\\frac{' + xs.map(function (x, j) { return j === k ? '' : '(x' + (x < 0 ? ' + ' + (-x) : x === 0 ? '' : ' - ' + x) + ')'; }).join('') + '}{' + xs.map(function (x, j) { return j === k ? '' : '(' + xs[k] + ' - ' + paren(x) + ')'; }).join('') + '}'; }

  // ---------------------------------------------------------------- num.lagrange
  G('num.lagrange', function (R, ctx) {
    var kind = lv(ctx, R.pick(['degree', 'basis', 'value']), R.pick(['value', 'basis', 'value']), R.pick(['poly', 'value4', 'value']));
    if (kind === 'degree') {
      var n = R.int(3, 9);
      return {
        q: 'There are ' + n + ' data points with different $x$-values. Exactly one polynomial of degree at most $d$ passes through all of them. What is the smallest such $d$ that always works?',
        a: num(n - 1, { form: 'int' }),
        steps: ['A polynomial of degree at most $d$ has $d + 1$ coefficients, and each point gives one equation.', '$' + n + '$ points need $' + n + '$ coefficients: degree at most $' + (n - 1) + '$.', 'Uniqueness: if two such polynomials passed through the points, their difference would have degree at most $' + (n - 1) + '$ and ' + n + ' roots, so it would be $0$.'],
        hint: 'Count coefficients: degree d has d + 1 of them.', _d: { k: kind, n: n }
      };
    }
    var xs = distinctNodes(R, kind === 'value4' ? 4 : 3, -2, 4), ys = xs.map(function () { return R.int(-6, 8); });
    if (kind === 'basis') {
      var k = R.int(0, 2), t = R.pick([q(R.int(-3, 5)), Q(R.int(-3, 9), 2)]); while (xs.some(function (x) { return q(x).eq(t); })) t = t.add(Q(1, 2));
      var Lv = lagBasis(xs, k, t);
      return {
        q: 'The nodes are $x_0 = ' + xs[0] + '$, $x_1 = ' + xs[1] + '$, $x_2 = ' + xs[2] + '$. Find the Lagrange basis polynomial $L_' + k + '(x)$ at $x = ' + td(t) + '$.',
        a: num(Lv),
        steps: ['$L_' + k + '$ is $1$ at $x_' + k + '$ and $0$ at the other two nodes: $L_' + k + '(x) = ' + basisTex(xs, k) + '$.', 'At $x = ' + td(t) + '$: $' + tq(Lv) + '$.'],
        hint: 'The numerator has a factor (x − xⱼ) for every OTHER node; the denominator is the same product at x = x_' + k + '.', _d: { k: kind, xs: xs, j: k, t: t.toPlain(), v: Lv.toPlain() }
      };
    }
    var t2 = q(R.int(-3, 5)); while (xs.some(function (x) { return q(x).eq(t2); })) t2 = t2.add(Q(1, 2));
    if (kind === 'value' || kind === 'value4') {
      var pv = lagEval(xs, ys, t2), Ls = xs.map(function (_, j) { return lagBasis(xs, j, t2); });
      return {
        q: 'Find the value at $x = ' + td(t2) + '$ of the polynomial of degree at most ' + (xs.length - 1) + ' that passes through $' + ptsTex(xs, ys) + '$.',
        a: num(pv),
        steps: ['Write $p(x) = \\sum y_jL_j(x)$, where $L_j$ is $1$ at $x_j$ and $0$ at the other nodes.', 'At $x = ' + td(t2) + '$: ' + Ls.map(function (L, j) { return '$L_' + j + ' = ' + tq(L) + '$'; }).join(', ') + '.', '$p(' + td(t2) + ') = ' + ys.map(function (y, j) { return paren(y) + ' \\cdot ' + parenF(Ls[j]); }).join(' + ') + ' = ' + tq(pv) + '$.'],
        hint: 'Compute each L_j at the point, then form Σ y_j L_j.', nolint: ['+ -', '+ 0'], _d: { k: kind, xs: xs, ys: ys, t: t2.toPlain(), v: pv.toPlain() }
      };
    }
    // poly: the interpolating quadratic, expanded
    var tb = ddTable(xs, ys), c2 = tb[2][0], c1 = tb[1][0].sub(c2.mul(xs[0] + xs[1])), c0 = q(ys[0]).sub(tb[1][0].mul(xs[0])).add(c2.mul(xs[0] * xs[1]));
    var plain = pplain([c0, c1, c2]);
    return {
      q: 'Find the polynomial of degree at most 2 through $' + ptsTex(xs, ys) + '$.',
      a: { t: 'expr', v: plain, vars: ['x'] },
      steps: ['Use $p(x) = \\sum y_jL_j(x)$, or build it in Newton form: $p(x) = ' + td(tb[0][0]) + ' + ' + parenF(tb[1][0]) + '(x - ' + paren(xs[0]) + ') + ' + parenF(c2) + '(x - ' + paren(xs[0]) + ')(x - ' + paren(xs[1]) + ')$.', 'Expand: $p(x) = ' + ptex([c0, c1, c2]) + '$.', 'Check: ' + xs.map(function (x, j) { return '$p(' + x + ') = ' + td(q(ys[j])) + '$'; }).join(', ') + '.'],
      hint: 'Any correct method works: Lagrange basis, divided differences, or solving for a, b, c.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, xs: xs, ys: ys }
    };
  });

  // ---------------------------------------------------------------- num.divided-differences
  G('num.divided-differences', function (R, ctx) {
    var kind = lv(ctx, R.pick(['first', 'second']), R.pick(['second', 'second', 'newton']), R.pick(['third', 'newton', 'addpoint']));
    var n = kind === 'first' ? 2 : kind === 'second' ? 3 : 4, xs, tries = 0;
    do { xs = distinctNodes(R, n, -2, 6); tries++; } while (n >= 3 && xs[1] - xs[0] === xs[2] - xs[1] && tries < 20); // uneven spacing shows the denominators
    var ys = xs.map(function () { return R.int(-5, 9); }), tb = ddTable(xs, ys);
    function ddRow(j) { return tb[j].map(function (v, i) { return '$f[' + xs.slice(i, i + j + 1).join(', ') + '] = ' + tq(v) + '$'; }).join(', '); }
    var dataTxt = 'the data $' + ptsTex(xs, ys) + '$';
    if (kind === 'first') return {
      q: 'For ' + dataTxt + ', find the divided difference $f[x_0, x_1]$.',
      a: num(tb[1][0]),
      steps: ['$f[x_0, x_1] = \\frac{f(x_1) - f(x_0)}{x_1 - x_0} = \\frac{' + ys[1] + ' - ' + paren(ys[0]) + '}{' + xs[1] + ' - ' + paren(xs[0]) + '} = ' + tq(tb[1][0]) + '$: the slope of the line through the two points.'],
      hint: 'Rise over run between the two points.', _d: { k: kind, xs: xs, ys: ys }
    };
    if (kind === 'second') return {
      q: 'For ' + dataTxt + ', find the divided difference $f[x_0, x_1, x_2]$.',
      a: num(tb[2][0]),
      steps: ['First differences: ' + ddRow(1) + '.', '$f[x_0, x_1, x_2] = \\frac{f[x_1, x_2] - f[x_0, x_1]}{x_2 - x_0} = \\frac{' + tq(tb[1][1]) + ' - ' + parenF(tb[1][0]) + '}{' + xs[2] + ' - ' + paren(xs[0]) + '} = ' + tq(tb[2][0]) + '$.', 'The denominator uses the two ends of the span, $x_2 - x_0$, not the neighbors.'],
      hint: 'Divide by x₂ − x₀, the distance between the outer nodes.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, xs: xs, ys: ys }
    };
    if (kind === 'third') return {
      q: 'For ' + dataTxt + ', find $f[x_0, x_1, x_2, x_3]$.',
      a: num(tb[3][0]),
      steps: ['First differences: ' + ddRow(1) + '.', 'Second differences: ' + ddRow(2) + '.', '$f[x_0, \\ldots, x_3] = \\frac{' + tq(tb[2][1]) + ' - ' + parenF(tb[2][0]) + '}{' + xs[3] + ' - ' + paren(xs[0]) + '} = ' + tq(tb[3][0]) + '$.'],
      hint: 'Build the table column by column; each entry divides by the gap between the ends of its span.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, xs: xs, ys: ys }
    };
    var t = q(R.int(-2, 6)); while (xs.some(function (x) { return q(x).eq(t); })) t = t.add(Q(1, 2));
    if (kind === 'newton') {
      var m = xs.length, pv = lagEval(xs, ys, t), terms = [], prod = q(1), acc = q(0), parts = [];
      for (var j = 0; j < m; j++) { acc = acc.add(tb[j][0].mul(prod)); parts.push(tq(tb[j][0]) + (j ? ' \\cdot ' + parenF(prod) : '')); prod = prod.mul(t.sub(xs[j])); }
      return {
        q: 'Use divided differences to find the value at $x = ' + td(t) + '$ of the interpolating polynomial for ' + dataTxt + '.',
        a: num(pv),
        steps: ['Top edge of the table: ' + [0, 1, 2, 3].slice(0, m).map(function (j) { return '$f[' + xs.slice(0, j + 1).join(', ') + '] = ' + tq(tb[j][0]) + '$'; }).join(', ') + '.', 'Newton form: $p(x) = f[x_0] + f[x_0, x_1](x - x_0) + f[x_0, x_1, x_2](x - x_0)(x - x_1) + \\cdots$', 'At $x = ' + td(t) + '$: $' + parts.join(' + ') + ' = ' + tq(pv) + '$.'],
        hint: 'Build the table, then use its top edge as the Newton coefficients.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, xs: xs, ys: ys, t: t.toPlain(), v: pv.toPlain() }
      };
    }
    // addpoint: a fourth point adds one term; find its coefficient
    return {
      q: 'The quadratic through $' + ptsTex(xs.slice(0, 3), ys.slice(0, 3)) + '$ is known in Newton form. The point $(' + xs[3] + ', ' + ys[3] + ')$ is added. The new cubic is the old quadratic plus $c' + xf(xs[0]) + xf(xs[1]) + xf(xs[2]) + '$. Find $c$.',
      a: num(tb[3][0]),
      steps: ['The new term vanishes at the old three nodes, so the old fit is kept, and $c = f[x_0, x_1, x_2, x_3]$.', 'Table: ' + ddRow(1) + '; ' + ddRow(2) + '.', '$c = \\frac{' + tq(tb[2][1]) + ' - ' + parenF(tb[2][0]) + '}{' + xs[3] + ' - ' + paren(xs[0]) + '} = ' + tq(tb[3][0]) + '$. No need to start over: that is the advantage of Newton\'s form.'],
      hint: 'c is the next divided difference along the top edge of the table.', nolint: ['+ -', '--', '+ 0'], _d: { k: 'addpoint', xs: xs, ys: ys }
    };
  });

  // ---------------------------------------------------------------- num.interpolation-error
  G('num.interpolation-error', function (R, ctx) {
    var kind = lv(ctx, R.pick(['exact', 'which']), R.pick(['exactp', 'bound', 'exact']), R.pick(['bound', 'linear', 'exactp']));
    if (kind === 'exact' || kind === 'exactp') {
      var c = R.pick([1, 2, -1, 3, 1]), deg = R.pick([2, 3]), xs = distinctNodes(R, deg, -2, 4), t = R.int(-3, 6);
      while (xs.indexOf(t) >= 0) t++;
      var w = xs.reduce(function (s, x) { return s * (t - x); }, 1), fcoef = [R.int(-3, 3), R.int(-3, 3), R.int(-2, 2), 0]; fcoef[deg] = c; fcoef = fcoef.slice(0, deg + 1);
      var ft = pev(fcoef, t), err = q(c * w), pt = ft.sub(err), ftex = ptex(fcoef);
      var st = ['$f$ has degree ' + deg + ', so $f^{(' + deg + ')}(x) = ' + c + ' \\cdot ' + deg + '!$ is constant and the error formula is exact: $$f(x) - p(x) = \\frac{f^{(' + deg + ')}(\\xi)}{' + deg + '!}' + xs.map(function (x) { return '(x' + (x < 0 ? ' + ' + (-x) : x === 0 ? '' : ' - ' + x) + ')'; }).join('') + ' = ' + (c === 1 ? '' : c === -1 ? '-' : c) + xs.map(function (x) { return '(x' + (x < 0 ? ' + ' + (-x) : x === 0 ? '' : ' - ' + x) + ')'; }).join('') + '.$$', 'At $x = ' + t + '$: $' + (c === 1 ? '' : paren(c) + ' \\cdot ') + xs.map(function (x) { return paren(t - x); }).join(' \\cdot ') + ' = ' + c * w + '$.'];
      if (kind === 'exact') return {
        q: 'Let $p$ be the polynomial of degree at most ' + (deg - 1) + ' that interpolates $f(x) = ' + ftex + '$ at $x = ' + xs.join(', ') + '$. Find the error $f(' + t + ') - p(' + t + ')$.',
        a: num(c * w, { form: 'int' }), steps: st,
        hint: 'f^(n+1) is a constant here, so the error is that constant over (n+1)! times the product of (x − xᵢ).', _d: { k: kind, f: fcoef, xs: xs, t: t }
      };
      return {
        q: 'Let $p$ be the polynomial of degree at most ' + (deg - 1) + ' that interpolates $f(x) = ' + ftex + '$ at $x = ' + xs.join(', ') + '$. Use the error formula to find $p(' + t + ')$ without finding $p$.',
        a: num(pt), steps: st.concat(['$f(' + t + ') = ' + td(ft) + '$, so $p(' + t + ') = ' + td(ft) + ' - ' + paren(c * w) + ' = ' + td(pt) + '$.']),
        hint: 'p(t) = f(t) − (error at t), and here the error formula is exact.', nolint: ['+ -', '--'], _d: { k: kind, f: fcoef, xs: xs, t: t }
      };
    }
    if (kind === 'which') return {
      q: 'Interpolating a smooth $f$ at $n + 1$ nodes $x_0, \\ldots, x_n$ by $p$ of degree at most $n$, the error is $f(x) - p(x) = \\frac{f^{(k)}(\\xi)}{k!}(x - x_0)\\cdots(x - x_n)$. What is $k$?',
      a: mc('$k = n + 1$', ['$k = n$', '$k = n - 1$', '$k = 2n$']),
      steps: ['$p$ matches every polynomial of degree $n$ exactly, so the error must involve a derivative that kills those: the $(n + 1)$st.', 'It also matches the count of factors $(x - x_i)$: there are $n + 1$ of them, and the formula is exact for $f(x) = x^{n+1}$.'],
      hint: 'Which derivative is zero for every polynomial of degree n?', _d: { k: kind }
    };
    if (kind === 'bound') {
      var F = R.pick([['\\sin x', 1, 'all derivatives of $\\sin$ are at most 1 in size'], ['\\cos x', 1, 'all derivatives of $\\cos$ are at most 1 in size'], ['\\cos(2x)', 0, '']]);
      var nodes = R.pick([[q(0), Q(1, 2), q(1)], [q(0), q(1)], [q(0), Q(1, 4), Q(1, 2)], [q(-1), q(0), q(1)]]), xq = R.pick([Q(1, 4), Q(1, 8), Q(3, 4), Q(1, 2), Q(1, 3)]);
      while (nodes.some(function (x) { return x.eq(xq); })) xq = xq.add(Q(1, 8));
      var np = nodes.length, Mb = F[1] ? q(1) : q(2).pow(np), om = nodes.reduce(function (s, x) { return s.mul(xq.sub(x)); }, q(1)).abs(), bd = Mb.mul(om).div(U.factorial(np));
      return {
        q: 'The polynomial $p$ interpolates $f(x) = ' + F[0] + '$ at $x = ' + nodes.map(td).join(', ') + '$. Use $|f(x) - p(x)| \\le \\frac{M}{' + np + '!}|\\omega(x)|$, where $M$ bounds $|f^{(' + np + ')}|$ and $\\omega(x) = ' + nodes.map(xf).join('') + '$, to bound the error at $x = ' + td(xq) + '$. Give the bound as an exact fraction.',
        a: num(bd),
        steps: [F[1] ? '$M = 1$: ' + F[2] + '.' : 'Each derivative of $\\cos(2x)$ brings a factor of 2, so $|f^{(' + np + ')}| \\le 2^{' + np + '} = ' + td(Mb) + '$: $M = ' + td(Mb) + '$.', '$|\\omega(' + td(xq) + ')| = ' + nodes.map(function (x) { return '|' + tq(xq.sub(x)) + '|'; }).join(' \\cdot ') + ' = ' + tq(om) + '$.', 'Bound: $\\frac{' + td(Mb) + '}{' + U.factorial(np) + '} \\cdot ' + tq(om) + ' = ' + tq(bd) + '$.'],
        hint: 'Find M, evaluate |ω| at the point, divide by (n + 1)!.', nolint: ['+ -', '--'], _d: { k: kind, M: Mb.toPlain(), nodes: nodes.map(function (x) { return x.toPlain(); }), x: xq.toPlain(), v: bd.toPlain() }
      };
    }
    // linear: the table-spacing question
    var h = R.pick([q('0.1'), q('0.01'), q('0.05'), q('0.2'), q('0.02')]), M = R.pick([1, 2, 4]), bnd = q(M).mul(h).mul(h).div(8);
    return {
      q: 'A table lists a function $f$ with $|f\'\'(x)| \\le ' + M + '$ at equally spaced points $h = ' + td(h) + '$ apart. Linear interpolation between neighboring entries has error at most $\\frac{M}{2}\\max|(x - x_0)(x - x_1)|$. What is that bound?',
      a: num(bnd),
      steps: ['On $[x_0, x_1]$ with $x_1 - x_0 = h$, the product $|(x - x_0)(x - x_1)|$ is largest at the midpoint, where it is $\\frac{h}{2} \\cdot \\frac{h}{2} = \\frac{h^{2}}{4}$.', 'So the error is at most $\\frac{M}{2} \\cdot \\frac{h^{2}}{4} = \\frac{Mh^{2}}{8}$.', '$\\frac{' + M + ' \\times (' + td(h) + ')^{2}}{8} = ' + td(bnd) + '$.'],
      hint: 'The product is largest halfway between the nodes: h²/4.', _d: { k: kind, h: h.toPlain(), M: M, v: bnd.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.runge-chebyshev
  G('num.runge-chebyshev', function (R, ctx) {
    var kind = lv(ctx, R.pick(['nodes', 'concept', 'omega', 'gap']), R.pick(['omega', 'mapped', 'need', 'gap', 'mapped']), R.pick(['omegaab', 'equal', 'mapped', 'omegaab', 'need']));
    if (kind === 'need') {
      var mm = R.int(2, 7), wl = R.pick([1, 2, 2, 3]), nn = 1; while (nn < 200 && q(wl).div(2).pow(nn).div(q(2).pow(nn - 1)).gt(pow10(-mm))) nn++;
      return {
        q: 'With $n$ Chebyshev nodes on ' + (wl === 2 ? '$[-1, 1]$, $\\max|\\omega(x)| = 2^{1-n}$' : 'an interval of length ' + wl + ', $\\max|\\omega(x)| = \\left(' + tq(Q(wl, 2)) + '\\right)^{n}2^{1-n}$') + '. What is the smallest $n$ that makes $\\max|\\omega| \\le 10^{-' + mm + '}$?',
        a: num(nn, { form: 'int' }),
        steps: ['Try $n = ' + (nn - 1) + '$: $' + (wl === 2 ? '' : '\\left(' + tq(Q(wl, 2)) + '\\right)^{' + (nn - 1) + '}') + '2^{' + (2 - nn) + '} \\approx ' + sci(fl(q(wl).div(2).pow(nn - 1).div(q(2).pow(nn - 2)), 3), 3) + '$, too big.', '$n = ' + nn + '$: $\\approx ' + sci(fl(q(wl).div(2).pow(nn).div(q(2).pow(nn - 1)), 3), 3) + ' \\le 10^{-' + mm + '}$.', 'So $n = ' + nn + '$. (This bounds only the node product; the full error also has $\\frac{\\max|f^{(n)}|}{n!}$.)'],
        hint: 'Increase n until the bound drops below the target.', _d: { k: 'need', m: mm, L: wl, v: nn }
      };
    }
    if (kind === 'gap') {
      var mg = R.int(3, 12);
      return {
        q: 'The ' + mg + ' Chebyshev nodes on $[-1, 1]$ are $x_k = \\cos\\theta_k$ with $\\theta_k = \\frac{(2k + 1)\\pi}{' + 2 * mg + '}$, $k = 0, \\ldots, ' + (mg - 1) + '$. What is the spacing $\\theta_{k+1} - \\theta_k$ between neighboring angles? Give it in terms of $\\pi$.',
        a: num('pi/' + mg),
        steps: ['$\\theta_{k+1} - \\theta_k = \\frac{(2k + 3)\\pi - (2k + 1)\\pi}{' + 2 * mg + '} = \\frac{2\\pi}{' + 2 * mg + '} = \\frac{\\pi}{' + mg + '}$.', 'Equal steps in angle around the half circle; their cosines bunch up near $\\pm 1$, where the circle is steep.'],
        hint: 'Subtract two consecutive angles.', _d: { k: 'gap', m: mg }
      };
    }
    if (kind === 'nodes') {
      var m = R.pick([2, 3]);
      return {
        q: 'The Chebyshev nodes for ' + m + ' points on $[-1, 1]$ are $x_k = \\cos\\frac{(2k + 1)\\pi}{' + 2 * m + '}$ for $k = 0, \\ldots, ' + (m - 1) + '$. List them exactly.',
        a: { t: 'set', v: m === 2 ? ['sqrt(2)/2', '-sqrt(2)/2'] : ['sqrt(3)/2', '0', '-sqrt(3)/2'] },
        steps: m === 2 ? ['$k = 0$: $\\cos\\frac{\\pi}{4} = \\frac{\\sqrt{2}}{2}$; $k = 1$: $\\cos\\frac{3\\pi}{4} = -\\frac{\\sqrt{2}}{2}$.', 'They are the $x$-coordinates of points equally spaced in angle on the upper half of the unit circle.'] : ['$k = 0$: $\\cos\\frac{\\pi}{6} = \\frac{\\sqrt{3}}{2}$; $k = 1$: $\\cos\\frac{\\pi}{2} = 0$; $k = 2$: $\\cos\\frac{5\\pi}{6} = -\\frac{\\sqrt{3}}{2}$.', 'Equal steps in angle give nodes that crowd toward the ends of $[-1, 1]$.'],
        hint: 'Use the unit circle values of cosine.', _d: { k: kind, m: m }
      };
    }
    if (kind === 'mapped') {
      var a = R.int(-3, 5), w = R.pick([2, 4, 6, 8, 10, 1, 3]), b = a + w, mid = Q(2 * a + w, 2), half = Q(w, 2), m2 = R.pick([2, 3]);
      var v = m2 === 2 ? [mid.toPlain() + '+' + half.toPlain() + '*sqrt(2)/2', mid.toPlain() + '-' + half.toPlain() + '*sqrt(2)/2'] : [mid.toPlain() + '+' + half.toPlain() + '*sqrt(3)/2', mid.toPlain(), mid.toPlain() + '-' + half.toPlain() + '*sqrt(3)/2'];
      var rt = m2 === 2 ? '\\frac{\\sqrt{2}}{2}' : '\\frac{\\sqrt{3}}{2}';
      return {
        q: 'Move the ' + m2 + ' Chebyshev nodes of $[-1, 1]$ to the interval $[' + a + ', ' + b + ']$ with $x = \\frac{a + b}{2} + \\frac{b - a}{2}t$. List the new nodes exactly.',
        a: { t: 'set', v: v },
        steps: ['On $[-1, 1]$ the nodes are $t = ' + (m2 === 2 ? '\\pm\\frac{\\sqrt{2}}{2}' : '0, \\pm\\frac{\\sqrt{3}}{2}') + '$.', 'Center $\\frac{a + b}{2} = ' + td(mid) + '$, half-width $\\frac{b - a}{2} = ' + td(half) + '$.', 'Nodes: $' + td(mid) + ' \\pm ' + td(half) + rt + (m2 === 3 ? '$ and $' + td(mid) : '') + '$.'],
        hint: 'Center plus half-width times each standard node.', _d: { k: kind, a: a, b: b, m: m2 }
      };
    }
    if (kind === 'omega' || kind === 'omegaab') {
      var np = R.int(3, 10);
      if (kind === 'omega') return {
        q: 'For ' + np + ' Chebyshev nodes on $[-1, 1]$, the node product $\\omega(x) = (x - x_0)\\cdots(x - x_{' + (np - 1) + '})$ equals $\\frac{T_{' + np + '}(x)}{2^{' + (np - 1) + '}}$, where $|T_{' + np + '}(x)| \\le 1$. What is the largest value of $|\\omega(x)|$ on $[-1, 1]$?',
        a: num(Q(1, Math.pow(2, np - 1))),
        steps: ['$T_{' + np + '}(x) = \\cos(' + np + '\\arccos x)$ swings between $-1$ and $1$ on $[-1, 1]$, reaching both.', 'So $\\max|\\omega| = \\frac{1}{2^{' + (np - 1) + '}} = ' + td(Q(1, Math.pow(2, np - 1))) + '$.', 'This is the smallest possible maximum for any choice of ' + np + ' nodes, and the ripples are all the same height, unlike equally spaced nodes, whose $\\omega$ is huge near the ends.'],
        hint: 'The Chebyshev polynomial reaches ±1, so divide 1 by the leading power of 2.', _d: { k: kind, n: np }
      };
      var L = R.pick([1, 2, 3, 4, 6, 8, 10]), ab = Q(L, 2).pow(np).div(Math.pow(2, np - 1));
      return {
        q: 'Chebyshev nodes are used for interpolation with ' + np + ' nodes on an interval of length ' + L + '. On $[-1, 1]$ the node product has $\\max|\\omega| = 2^{-' + (np - 1) + '}$. Stretching the interval by the factor $' + tq(Q(L, 2)) + '$ multiplies each factor $(x - x_i)$ by $' + tq(Q(L, 2)) + '$. What is $\\max|\\omega|$ on the new interval?',
        a: num(ab),
        steps: ['Each of the ' + np + ' factors grows by $' + tq(Q(L, 2)) + '$, so $\\omega$ grows by $\\left(' + tq(Q(L, 2)) + '\\right)^{' + np + '}$.', '$\\max|\\omega| = \\left(' + tq(Q(L, 2)) + '\\right)^{' + np + '} \\cdot 2^{-' + (np - 1) + '} = ' + td(ab) + '$.'],
        hint: 'Multiply 2^(−(n−1)) by (L/2) to the power of the number of nodes.', _d: { k: kind, n: np, L: L, v: ab.toPlain() }
      };
    }
    if (kind === 'equal') {
      var ea = R.pick([1, 2, 3, Q(1, 2)]), eq = q(ea), mx = q(2).mul(eq.pow(3)).div(9), cheb = eq.pow(3).div(4);
      return {
        q: 'With the three equally spaced nodes $' + td(eq.neg()) + ', 0, ' + td(eq) + '$, the node product is $\\omega(x) = x^{3} - ' + (eq.eq(1) ? '' : tq(eq.mul(eq))) + 'x$. Find the largest value of $|\\omega(x)|$ on $[' + td(eq.neg()) + ', ' + td(eq) + ']$ exactly. (With three Chebyshev nodes it would be $' + tq(cheb) + '$.)',
        a: num('(' + mx.toPlain() + ')*sqrt(3)'),
        steps: ['$\\omega\'(x) = 3x^{2} - ' + tq(eq.mul(eq)) + ' = 0$ at $x = \\pm\\frac{' + tq(eq) + '}{\\sqrt{3}}$.', 'There $|\\omega| = \\frac{' + tq(eq) + '}{\\sqrt{3}}\\left(' + tq(eq.mul(eq)) + ' - \\frac{' + tq(eq.mul(eq)) + '}{3}\\right) = \\frac{2(' + tq(eq.pow(3)) + ')}{3\\sqrt{3}} = ' + tq(mx) + '\\sqrt{3} \\approx ' + (mx.toNumber() * Math.sqrt(3)).toFixed(4) + '$; at the ends and at $0$, $\\omega = 0$.', 'Chebyshev nodes give $' + tq(cheb) + ' = ' + cheb.toNumber() + '$: smaller, and the gap widens fast as the number of nodes grows.'],
        hint: 'Set ω′(x) = 0.', _d: { k: kind, a: eq.toPlain() }
      };
    }
    var S = R.pick([
      ['Interpolating $\\frac{1}{1 + 25x^{2}}$ at more and more equally spaced nodes on $[-1, 1]$ makes the maximum error go to $0$.', false, 'This is Runge\'s example: the interpolants swing wildly near $\\pm 1$, and the maximum error grows as the degree goes up.'],
      ['Interpolating $\\frac{1}{1 + 25x^{2}}$ at more and more Chebyshev nodes makes the maximum error go to $0$.', true, 'Chebyshev nodes keep $|\\omega(x)|$ small and even across the interval; for this smooth function the error then goes to $0$.'],
      ['Chebyshev nodes are bunched toward the ends of the interval.', true, 'They are cosines of equally spaced angles, so they crowd near $\\pm 1$, exactly where equally spaced nodes let $\\omega(x)$ grow.'],
      ['Chebyshev nodes are equally spaced on $[-1, 1]$.', false, 'They are cosines of equally spaced angles, so they crowd toward $\\pm 1$ and are sparse near $0$.'],
      ['For equally spaced nodes, $|\\omega(x)|$ is largest near the middle of the interval.', false, 'It is largest in the first and last gaps, near the ends; that is where Runge\'s wiggles appear.'],
      ['Runge\'s phenomenon means a polynomial cannot approximate $\\frac{1}{1 + 25x^{2}}$ well on $[-1, 1]$.', false, 'Good polynomial approximations exist (Chebyshev interpolants converge); the trouble is the choice of equally spaced nodes.']
    ]);
    return { q: 'True or false? ' + S[0], a: tf(S[1]), steps: [S[2]], hint: 'Think about where the node product ω(x) is large.', _d: { k: 'concept', v: S[1] } };
  });

  // ---------------------------------------------------------------- num.cubic-splines
  G('num.cubic-splines', function (R, ctx) {
    var kind = lv(ctx, R.pick(['count', 'match']), R.pick(['M1', 'match', 'count']), R.pick(['mid', 'M2', 'match']));
    if (kind === 'count') {
      var n = R.int(3, 9), ask = R.pick(['unknowns', 'conds', 'missing']);
      var val = ask === 'unknowns' ? 4 * n : ask === 'conds' ? 4 * n - 2 : 2;
      return {
        q: 'A cubic spline through ' + (n + 1) + ' points (' + n + ' intervals) is built from ' + n + ' cubic pieces. ' + (ask === 'unknowns' ? 'How many unknown coefficients are there in all?' : ask === 'conds' ? 'How many conditions come from matching the data and making $s$, $s\'$ and $s\'\'$ continuous at the inside knots?' : 'How many more conditions (end conditions) are needed to pin the spline down?'),
        a: num(val, { form: 'int' }),
        steps: ['Unknowns: 4 coefficients per piece, $4 \\times ' + n + ' = ' + 4 * n + '$.', 'Each piece matches the data at both of its ends: $2 \\times ' + n + ' = ' + 2 * n + '$ conditions.', 'At each of the ' + (n - 1) + ' inside knots, $s\'$ and $s\'\'$ must agree from both sides: $2 \\times ' + (n - 1) + ' = ' + 2 * (n - 1) + '$ conditions. Total: $' + (4 * n - 2) + '$.', 'So 2 more are needed: a natural spline sets $s\'\' = 0$ at both ends.'],
        hint: 'Count 4 per piece, then count interpolation and smoothness conditions.', _d: { k: kind, n: n, ask: ask, v: val }
      };
    }
    if (kind === 'match') {
      var c0 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3), R.nz(-2, 2)], k = R.int(1, 2), S0 = pev(c0, k), S1 = pev(pder(c0), k), S2 = pev(pder(pder(c0)), k);
      var cc = S2.div(2), dd = R.nz(-3, 3);
      var full = ctx.level === 3;
      return {
        q: 'A cubic spline is $s(x) = ' + ptex(c0) + '$ for $x \\le ' + k + '$ and $s(x) = a + b(x - ' + k + ') + c(x - ' + k + ')^{2} ' + (dd < 0 ? '- ' + (-dd === 1 ? '' : -dd) : '+ ' + (dd === 1 ? '' : dd)) + '(x - ' + k + ')^{3}$ for $x \\ge ' + k + '$. ' + (full ? 'Find $a$, $b$ and $c$.' : 'Find $c$.'),
        a: full ? tup([S0, S1, cc]) : num(cc),
        steps: ['At $x = ' + k + '$ the right piece has value $a$, slope $b$ and second derivative $2c$.', 'Left piece: $s(' + k + ') = ' + td(S0) + '$, $s\'(' + k + ') = ' + td(S1) + '$, $s\'\'(' + k + ') = ' + td(S2) + '$ (from $s\'(x) = ' + ptex(pder(c0)) + '$, $s\'\'(x) = ' + ptex(pder(pder(c0))) + '$).', 'Match all three: $a = ' + td(S0) + '$, $b = ' + td(S1) + '$, $2c = ' + td(S2) + '$ so $c = ' + td(cc) + '$. The cubic coefficient is free; it is set by the next knot.'],
        hint: 'A spline matches value, first derivative and second derivative at each inside knot.', _d: { k: kind, c0: c0, kn: k, full: full }
      };
    }
    var h = R.pick([1, 2, Q(1, 2)]), x0 = R.int(-2, 2), ys = [R.int(-4, 6), R.int(-4, 6), R.int(-4, 6)], hq = q(h);
    if (kind === 'M1' || kind === 'mid') {
      while (ys[0] - 2 * ys[1] + ys[2] === 0) ys[1]++;
      var xs = [q(x0), q(x0).add(hq), q(x0).add(hq.mul(2))], M1 = q(3 * (ys[0] - 2 * ys[1] + ys[2])).div(hq.mul(hq).mul(2));
      var stM = ['A natural spline has $M_0 = M_2 = 0$, where $M_i = s\'\'(x_i)$.', 'Continuity of $s\'$ at $x_1$ gives $M_0 + 4M_1 + M_2 = \\frac{6}{h^{2}}(y_0 - 2y_1 + y_2)$.', 'So $4M_1 = \\frac{6}{' + tq(hq.mul(hq)) + '}(' + ys[0] + ' - ' + paren(2 * ys[1]) + ' + ' + paren(ys[2]) + ') = ' + tq(M1.mul(4)) + '$, and $M_1 = ' + tq(M1) + '$.'];
      var pts = '$(' + td(xs[0]) + ', ' + ys[0] + ')$, $(' + td(xs[1]) + ', ' + ys[1] + ')$, $(' + td(xs[2]) + ', ' + ys[2] + ')$';
      if (kind === 'M1') return {
        q: 'Find $M_1 = s\'\'(x_1)$ for the natural cubic spline through ' + pts + ' (equal spacing $h = ' + td(hq) + '$).',
        a: num(M1), steps: stM,
        hint: 'Natural means M₀ = M₂ = 0; use M₀ + 4M₁ + M₂ = 6(y₀ − 2y₁ + y₂)/h².', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, h: hq.toPlain(), ys: ys, v: M1.toPlain() }
      };
      var mid = q(ys[0] + ys[1]).div(2).sub(M1.mul(hq).mul(hq).div(16)), xm = xs[0].add(hq.div(2));
      return {
        q: 'Find $s(' + td(xm) + ')$ for the natural cubic spline through ' + pts + '.',
        a: num(mid),
        steps: stM.concat(['On $[x_0, x_1]$: $s(x) = \\frac{M_1(x - x_0)^{3}}{6h} + \\frac{y_0}{h}(x_1 - x) + \\left(\\frac{y_1}{h} - \\frac{M_1h}{6}\\right)(x - x_0)$ (using $M_0 = 0$).', 'At the midpoint, $x - x_0 = x_1 - x = \\frac{h}{2}$: $s = \\frac{y_0 + y_1}{2} - \\frac{M_1h^{2}}{16} = ' + tq(q(ys[0] + ys[1]).div(2)) + ' - ' + parenF(M1.mul(hq).mul(hq).div(16)) + ' = ' + tq(mid) + '$.']),
        hint: 'Find M₁ first, then use the formula for s on [x₀, x₁].', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, h: hq.toPlain(), ys: ys, x0: x0, v: mid.toPlain() }
      };
    }
    // M2: four knots, two unknown M's
    var y4 = [R.int(-3, 5), R.int(-3, 5), R.int(-3, 5), R.int(-3, 5)], r1 = q(6 * (y4[0] - 2 * y4[1] + y4[2])).div(hq.mul(hq)), r2 = q(6 * (y4[1] - 2 * y4[2] + y4[3])).div(hq.mul(hq));
    var Ms = solve([[4, 1], [1, 4]], [r1, r2]), which = R.int(1, 2);
    return {
      q: 'The natural cubic spline through $(0, ' + y4[0] + ')$, $(' + td(hq) + ', ' + y4[1] + ')$, $(' + td(hq.mul(2)) + ', ' + y4[2] + ')$, $(' + td(hq.mul(3)) + ', ' + y4[3] + ')$ has $M_i = s\'\'(x_i)$ with $M_0 = M_3 = 0$. Find $M_' + which + '$.',
      a: num(Ms[which - 1]),
      steps: ['At each inside knot: $M_{i-1} + 4M_i + M_{i+1} = \\frac{6}{h^{2}}(y_{i-1} - 2y_i + y_{i+1})$.', 'With $M_0 = M_3 = 0$: $4M_1 + M_2 = ' + tq(r1) + '$ and $M_1 + 4M_2 = ' + tq(r2) + '$.', 'Solve the $2 \\times 2$ system: $M_1 = ' + tq(Ms[0]) + '$, $M_2 = ' + tq(Ms[1]) + '$.', 'For more knots the same equations form a tridiagonal system, solved in $O(n)$ operations.'],
      hint: 'Write the two equations for M₁ and M₂, then solve them.', _d: { k: 'M2', h: hq.toPlain(), ys: y4, w: which, v: Ms[which - 1].toPlain() }
    };
  });

  // =====================================================================================================
  // Unit 5: Derivatives and Integrals
  // =====================================================================================================
  function polyF(R, deg) { var c = []; for (var i = 0; i <= deg; i++) c.push(R.int(-3, 3)); c[deg] = R.nz(-2, 3); return c; }
  // ---------------------------------------------------------------- num.finite-differences
  G('num.finite-differences', function (R, ctx) {
    var kind = lv(ctx, R.pick(['forward', 'central', 'spot']), R.pick(['error', 'central', 'second', 'spot']), R.pick(['halve', 'data', 'error']));
    if (kind === 'forward' || kind === 'central' || kind === 'error') {
      var c = kind === 'error' ? polyF(R, R.pick([2, 3])) : polyF(R, R.pick([2, 3])), x = q(R.int(-2, 3)), h = R.pick([q('0.1'), q('0.2'), q('0.5'), q('0.01')]);
      var fx = pev(c, x), fp = pev(c, x.add(h)), fm = pev(c, x.sub(h)), fwd = fp.sub(fx).div(h), cen = fp.sub(fm).div(h.mul(2)), ex = pev(pder(c), x);
      var useC = kind === 'central' || (kind === 'error' && R.coin());
      var D = useC ? cen : fwd, form = useC ? '\\frac{f(x + h) - f(x - h)}{2h}' : '\\frac{f(x + h) - f(x)}{h}';
      var st = [useC ? '$f(' + td(x.add(h)) + ') = ' + td(fp) + '$ and $f(' + td(x.sub(h)) + ') = ' + td(fm) + '$.' : '$f(' + td(x.add(h)) + ') = ' + td(fp) + '$ and $f(' + td(x) + ') = ' + td(fx) + '$.',
        useC ? '$\\frac{' + td(fp) + ' - ' + paren(fm) + '}{2(' + td(h) + ')} = ' + td(D) + '$.' : '$\\frac{' + td(fp) + ' - ' + paren(fx) + '}{' + td(h) + '} = ' + td(D) + '$.'];
      if (kind !== 'error') return {
        q: 'Approximate $f\'(' + td(x) + ')$ for $f(x) = ' + ptex(c) + '$ with the ' + (useC ? 'central' : 'forward') + ' difference $' + form + '$, using $h = ' + td(h) + '$.',
        a: num(D), steps: st.concat(['The exact derivative is $f\'(' + td(x) + ') = ' + td(ex) + '$, so the error is $' + td(D.sub(ex)) + '$' + (useC ? ' (order $h^{2}$).' : ' (order $h$).')]),
        hint: useC ? 'Divide by 2h: the two points are 2h apart.' : 'Rise over run from x to x + h.', nolint: ['+ -', '--'], _d: { k: kind, c: c, x: x.toPlain(), h: h.toPlain(), C: useC }
      };
      return {
        q: 'For $f(x) = ' + ptex(c) + '$ at $x = ' + td(x) + '$ with $h = ' + td(h) + '$, find the error (approximation minus exact value) of the ' + (useC ? 'central' : 'forward') + ' difference $' + form + '$.',
        a: num(D.sub(ex)),
        steps: st.concat(['Exact: $f\'(x) = ' + ptex(pder(c)) + '$, so $f\'(' + td(x) + ') = ' + td(ex) + '$.', 'Error: $' + td(D) + ' - ' + paren(ex) + ' = ' + td(D.sub(ex)) + '$. ' + (useC ? 'From Taylor series the central error is $\\frac{h^{2}}{6}f\'\'\'(x) + \\cdots$, which here is $' + td(D.sub(ex)) + '$.' : 'From Taylor series the forward error is $\\frac{h}{2}f\'\'(x) + \\frac{h^{2}}{6}f\'\'\'(x)$, which here is $' + td(D.sub(ex)) + '$.')]),
        hint: 'Compute the difference quotient and the exact derivative, then subtract.', nolint: ['+ -', '--'], _d: { k: kind, c: c, x: x.toPlain(), h: h.toPlain(), C: useC }
      };
    }
    if (kind === 'spot') {
      var c2 = polyF(R, 3), x2 = q(R.int(-1, 2)), h2 = R.pick([q('0.1'), q('0.01')]), cen2 = pev(c2, x2.add(h2)).sub(pev(c2, x2.sub(h2))).div(h2.mul(2)), wrong = cen2.mul(2);
      return {
        q: 'A student approximates $f\'(' + td(x2) + ')$ with $\\frac{f(x + h) - f(x - h)}{h}$ and gets $' + td(wrong) + '$. That formula has a mistake. What does the correct central difference $\\frac{f(x + h) - f(x - h)}{2h}$ give?',
        a: num(cen2),
        steps: ['The points $x + h$ and $x - h$ are $2h$ apart, so the slope between them divides by $2h$.', 'Dividing by $h$ doubles the answer: the correct value is $' + td(wrong) + ' \\div 2 = ' + td(cen2) + '$.', 'Quick check: a forward difference with the same $h$ should give a value near this one, not near double it.'],
        hint: 'How far apart are x − h and x + h?', _d: { k: kind, v: cen2.toPlain() }
      };
    }
    if (kind === 'second') {
      var c3 = polyF(R, R.pick([3, 4])), x3 = q(R.int(-2, 2)), h3 = R.pick([q('0.1'), q('0.5'), q('0.2')]), f0 = pev(c3, x3), f1 = pev(c3, x3.add(h3)), fm1 = pev(c3, x3.sub(h3)), sd = f1.sub(f0.mul(2)).add(fm1).div(h3.mul(h3)), ex2 = pev(pder(pder(c3)), x3);
      return {
        q: 'Approximate $f\'\'(' + td(x3) + ')$ for $f(x) = ' + ptex(c3) + '$ with $\\frac{f(x + h) - 2f(x) + f(x - h)}{h^{2}}$, $h = ' + td(h3) + '$.',
        a: num(sd),
        steps: ['$f(' + td(x3.add(h3)) + ') = ' + td(f1) + '$, $f(' + td(x3) + ') = ' + td(f0) + '$, $f(' + td(x3.sub(h3)) + ') = ' + td(fm1) + '$.', '$\\frac{' + td(f1) + ' - 2(' + td(f0) + ') + ' + paren(fm1) + '}{' + td(h3.mul(h3)) + '} = ' + td(sd) + '$.', 'Exact: $f\'\'(' + td(x3) + ') = ' + td(ex2) + '$; the error, $' + td(sd.sub(ex2)) + '$, is of order $h^{2}$' + (sd.eq(ex2) ? ' (here exactly 0, since the formula is exact for cubics)' : '') + '.'],
        hint: 'Evaluate f at three points; mind the h² in the denominator.', nolint: ['+ -', '--'], _d: { k: kind, c: c3, x: x3.toPlain(), h: h3.toPlain() }
      };
    }
    if (kind === 'halve') {
      var e = q(R.pick([4, 8, 12, 16, 24])).div(pow10(R.int(2, 4)));
      return {
        q: 'With $h = 0.1$, the forward difference and the central difference for some $f\'(x)$ both have error $' + td(e) + '$. Estimate the error of each with $h = 0.05$.',
        a: multi([{ label: 'forward:', a: num(e.div(2)) }, { label: 'central:', a: num(e.div(4)) }]),
        steps: ['Forward: error $\\approx \\frac{h}{2}f\'\'(x)$, order $h$, so halving $h$ halves it: $' + td(e.div(2)) + '$.', 'Central: error $\\approx \\frac{h^{2}}{6}f\'\'\'(x)$, order $h^{2}$, so halving $h$ quarters it: $' + td(e.div(4)) + '$.'],
        hint: 'Order h: divide by 2. Order h²: divide by 4.', _d: { k: kind, e: e.toPlain() }
      };
    }
    // data: a table of values
    var xs0 = R.pick([q('1.0'), q('2.0'), q('0.5')]), hh = R.pick([q('0.1'), q('0.2')]), base = R.int(2, 9), d1 = q(R.int(-30, 30)).div(10), d2 = q(R.int(-20, 20)).div(100);
    var fv = [q(base).sub(d1).add(d2), q(base), q(base).add(d1).add(d2)], cd = fv[2].sub(fv[0]).div(hh.mul(2)), sdd = fv[2].sub(fv[1].mul(2)).add(fv[0]).div(hh.mul(hh));
    return {
      q: 'A table gives $f(' + td(xs0.sub(hh)) + ') = ' + td(fv[0]) + '$, $f(' + td(xs0) + ') = ' + td(fv[1]) + '$, $f(' + td(xs0.add(hh)) + ') = ' + td(fv[2]) + '$. Use central differences to estimate $f\'(' + td(xs0) + ')$ and $f\'\'(' + td(xs0) + ')$.',
      a: multi([{ label: "$f'(" + td(xs0) + ') \\approx$', a: num(cd) }, { label: "$f''(" + td(xs0) + ') \\approx$', a: num(sdd) }]),
      steps: ['$f\' \\approx \\frac{' + td(fv[2]) + ' - ' + td(fv[0]) + '}{2(' + td(hh) + ')} = ' + td(cd) + '$.', '$f\'\' \\approx \\frac{' + td(fv[2]) + ' - 2(' + td(fv[1]) + ') + ' + td(fv[0]) + '}{(' + td(hh) + ')^{2}} = ' + td(sdd) + '$.'],
      hint: 'First derivative: divide by 2h. Second derivative: divide by h².', _d: { k: 'data', h: hh.toPlain(), f: fv.map(function (v) { return v.toPlain(); }) }
    };
  });

  // ---------------------------------------------------------------- num.step-size-tradeoff
  G('num.step-size-tradeoff', function (R, ctx) {
    var kind = lv(ctx, R.pick(['roundoff', 'which', 'slope']), R.pick(['hopt', 'which', 'slope']), R.pick(['hcentral', 'hopt', 'which']));
    if (kind === 'roundoff') {
      var k = R.int(6, 14), r = q(2).mul(pow10(-16 + k));
      return {
        q: 'In double precision each value of $f$ (about size 1) carries a rounding error up to $\\varepsilon \\approx 10^{-16}$. In the forward difference $\\frac{f(x + h) - f(x)}{h}$, those errors can add up to $\\frac{2\\varepsilon}{h}$. How big is that with $h = 10^{-' + k + '}$?',
        a: num(r, { rtol: 1e-9 }),
        steps: ['The numerator can be off by about $2\\varepsilon = 2 \\times 10^{-16}$.', 'Dividing by $h = 10^{-' + k + '}$ magnifies it: $\\frac{2 \\times 10^{-16}}{10^{-' + k + '}} = ' + td(r) + '$.', k > 8 ? 'That is larger than the truncation error ($\\approx h$): this $h$ is too small.' : 'Still small; the truncation error (about $h$) matters more here.'],
        hint: 'Divide 2 × 10⁻¹⁶ by h.', _d: { k: kind, kk: k }
      };
    }
    if (kind === 'which') {
      var ks = [2, 4, 6, 8, 10, 12], c0 = R.pick([2, 3, 4]), f = function (x) { return Math.pow(x, c0); };
      var errs = ks.map(function (kk) { var h = Math.pow(10, -kk); return Math.abs((f(1 + h) - f(1)) / h - c0); });
      var best = 0; errs.forEach(function (e, i) { if (e < errs[best]) best = i; });
      return {
        q: 'Forward differences for $f\'(1)$ with $f(x) = x^{' + c0 + '}$ were computed in double precision. The errors were: ' + ks.map(function (kk, i) { return '$h = 10^{-' + kk + '}$: $' + sci(fl(q(Number(errs[i].toPrecision(2))), 2), 2) + '$'; }).join('; ') + '. Which $h$ gave the most accurate result?',
        a: mc('$h = 10^{-' + ks[best] + '}$', ks.filter(function (_, i) { return i !== best; }).map(function (kk) { return '$h = 10^{-' + kk + '}$'; }).slice(0, 4)),
        steps: ['For large $h$ the truncation error, about $\\frac{h}{2}f\'\'(1)$, dominates and shrinks with $h$.', 'For small $h$ the round-off error, about $\\frac{2\\varepsilon}{h}$, dominates and grows as $h$ shrinks.', 'The best is in between: $h = 10^{-' + ks[best] + '}$, near $\\sqrt{\\varepsilon} \\approx 10^{-8}$.'],
        hint: 'Find the smallest error in the list.', _d: { k: kind, c: c0, best: ks[best] }
      };
    }
    if (kind === 'slope') {
      var meth = R.pick(['forward', 'central']), side = R.pick(['left', 'right']), sl = side === 'left' ? -1 : meth === 'forward' ? 1 : 2;
      return {
        q: 'On a log–log plot of the error of the ' + meth + ' difference against $h$, the curve looks like a V. What is the slope of the ' + (side === 'left' ? 'left branch (small $h$)' : 'right branch (large $h$)') + '?',
        a: num(sl, { form: 'int' }),
        steps: [side === 'left' ? 'For small $h$, round-off dominates: error $\\approx \\frac{c\\varepsilon}{h} = c\\varepsilon h^{-1}$.' : 'For large $h$, truncation dominates: error $\\approx Ch^{' + (meth === 'forward' ? 1 : 2) + '}$.', 'On log–log axes $\\log(\\text{error}) = \\text{const} + (' + sl + ')\\log h$, a line of slope $' + sl + '$.'],
        hint: 'Which error dominates on that side, and what power of h is it?', _d: { k: kind, v: sl }
      };
    }
    if (kind === 'hopt') {
      var M = R.pick([1, 4, 16, 100]), eps = q(1).div(pow10(16)), h = q(2).mul(Math.sqrt(1 / M)).mul(pow10(-8));
      return {
        q: 'The total error of a forward difference is about $E(h) = \\frac{M}{2}h + \\frac{2\\varepsilon}{h}$, with $M = ' + M + '$ (a bound on $|f\'\'|$) and $\\varepsilon = 10^{-16}$. Which $h$ minimizes $E$?',
        a: num(h, { rtol: 0.001 }),
        steps: ['$E\'(h) = \\frac{M}{2} - \\frac{2\\varepsilon}{h^{2}} = 0$ gives $h^{2} = \\frac{4\\varepsilon}{M}$, so $h = 2\\sqrt{\\frac{\\varepsilon}{M}}$.', '$h = 2\\sqrt{\\frac{10^{-16}}{' + M + '}} = ' + td(h) + '$.', 'At that $h$ the two error parts are equal, and the total is about $2\\sqrt{M\\varepsilon} \\approx ' + sci(fl(q(2).mul(Math.sqrt(M)).mul(pow10(-8)), 2), 2) + '$: only about half the digits survive.'],
        hint: 'Set E′(h) = 0.', _d: { k: kind, M: M, v: h.toPlain() }
      };
    }
    var Mc = R.pick([1, 3, 6, 10]), hc = Math.cbrt(3e-16 / Mc);
    return {
      q: 'For the central difference the total error is about $E(h) = \\frac{M}{6}h^{2} + \\frac{\\varepsilon}{h}$, with $M = ' + Mc + '$ and $\\varepsilon = 10^{-16}$. Find the $h$ that minimizes $E$, to 2 significant digits.',
      a: num(hc.toExponential(5), { rtol: 0.03 }),
      steps: ['$E\'(h) = \\frac{M}{3}h - \\frac{\\varepsilon}{h^{2}} = 0$ gives $h^{3} = \\frac{3\\varepsilon}{M}$.', '$h = \\left(\\frac{3 \\times 10^{-16}}{' + Mc + '}\\right)^{1/3} \\approx ' + sci(fl(q(Number(hc.toPrecision(6))), 2), 2) + '$.', 'This is much larger than the best $h$ for a forward difference (about $10^{-8}$), and the best error, about $\\varepsilon^{2/3} \\approx 10^{-11}$, is smaller.'],
      hint: 'Set E′(h) = 0 and solve for h³.', _d: { k: 'hcentral', M: Mc, v: hc }
    };
  });

  // ---------------------------------------------------------------- num.richardson
  G('num.richardson', function (R, ctx) {
    var kind = lv(ctx, R.pick(['order2', 'order2', 'weights']), R.pick(['order1', 'fd', 'estimate']), R.pick(['general', 'fd', 'order1']));
    if (kind === 'order2' || kind === 'order1' || kind === 'general' || kind === 'estimate') {
      var p = kind === 'order1' ? 1 : kind === 'general' ? R.pick([3, 4]) : 2, k = Math.pow(2, p);
      var exact = q(R.int(1000, 9999)).div(1000), C = q(R.nz(-9, 9)).div(pow10(R.int(1, 2)));
      var Ah = exact.add(C), Ah2 = exact.add(C.div(k));
      var rich = Ah2.mul(k).sub(Ah).div(k - 1);
      var formula = p === 1 ? '2A(h/2) - A(h)' : '\\frac{' + k + 'A(h/2) - A(h)}{' + (k - 1) + '}';
      if (kind === 'estimate') { var est = Ah2.sub(Ah).div(k - 1); return {
        q: 'A method with error of order $h^{2}$ gives $A(h) = ' + td(Ah) + '$ and $A(h/2) = ' + td(Ah2) + '$. Estimate the error in $A(h/2)$, that is, the true value minus $A(h/2)$.',
        a: num(est),
        steps: ['Write $A(h) \\approx I + Ch^{2}$ and $A(h/2) \\approx I + \\frac{C}{4}h^{2}$.', 'Subtract: $A(h/2) - A(h) \\approx -\\frac{3}{4}Ch^{2}$, so the error of $A(h/2)$, $I - A(h/2) \\approx -\\frac{C}{4}h^{2}$, is $\\frac{A(h/2) - A(h)}{3}$.', '$\\frac{' + td(Ah2) + ' - ' + td(Ah) + '}{3} = ' + td(est) + '$.'],
        hint: 'The difference of the two results is 3 times the error of the better one.', _d: { k: kind, A: Ah.toPlain(), A2: Ah2.toPlain(), v: est.toPlain() }
      }; }
      return {
        q: 'A method with error of order $h^{' + p + '}$ gives $A(h) = ' + td(Ah) + '$ and $A(h/2) = ' + td(Ah2) + '$. Use Richardson extrapolation to get a better value.',
        a: num(rich),
        steps: ['$A(h) \\approx I + Ch^{' + p + '}$ and $A(h/2) \\approx I + C\\frac{h^{' + p + '}}{' + k + '}$.', 'Multiply the second by $' + k + '$ and subtract the first: the $Ch^{' + p + '}$ terms cancel, leaving $' + (k - 1 === 1 ? '' : k - 1) + 'I$. So $I \\approx ' + formula + '$.', '$' + (p === 1 ? '2(' + td(Ah2) + ') - ' + td(Ah) : '\\frac{' + k + '(' + td(Ah2) + ') - ' + td(Ah) + '}{' + (k - 1) + '}') + ' = ' + td(rich) + '$.'],
        hint: p === 1 ? 'For order h: 2A(h/2) − A(h).' : 'For order h^p: (2^p·A(h/2) − A(h))/(2^p − 1).', _d: { k: kind, p: p, A: Ah.toPlain(), A2: Ah2.toPlain(), v: rich.toPlain() }
      };
    }
    if (kind === 'weights') return {
      q: 'A method has error of order $h$ (not $h^{2}$). Which combination of $A(h)$ and $A(h/2)$ cancels the leading error term?',
      a: mc('$2A(h/2) - A(h)$', ['$\\frac{4A(h/2) - A(h)}{3}$', '$\\frac{A(h) + A(h/2)}{2}$', '$\\frac{16A(h/2) - A(h)}{15}$']),
      steps: ['$A(h) \\approx I + Ch$ and $A(h/2) \\approx I + \\frac{C}{2}h$.', '$2A(h/2) - A(h) \\approx 2I + Ch - I - Ch = I$.', '$\\frac{4A(h/2) - A(h)}{3}$ is the right combination only for an $h^{2}$ error.'],
      hint: 'Halving h halves an order-h error.', _d: { k: kind }
    };
    // fd: central differences of a quartic, extrapolated: exact
    var c = [R.int(-3, 3), R.int(-3, 3), R.int(-2, 2), R.int(-2, 2), R.nz(-2, 2)], x = q(R.int(-1, 2)), h = q(R.pick(['0.2', '0.4', '0.1', '1']));
    function D(hh) { return pev(c, x.add(hh)).sub(pev(c, x.sub(hh))).div(hh.mul(2)); }
    var D1 = D(h), D2 = D(h.div(2)), ext = D2.mul(4).sub(D1).div(3), ex = pev(pder(c), x);
    return {
      q: 'For $f(x) = ' + ptex(c) + '$, the central differences for $f\'(' + td(x) + ')$ are $D(' + td(h) + ') = ' + td(D1) + '$ and $D(' + td(h.div(2)) + ') = ' + td(D2) + '$. Apply Richardson extrapolation for an $h^{2}$ error.',
      a: num(ext),
      steps: ['$\\frac{4D(h/2) - D(h)}{3} = \\frac{4(' + td(D2) + ') - ' + paren(D1) + '}{3} = ' + td(ext) + '$.', 'The exact derivative is $f\'(' + td(x) + ') = ' + td(ex) + '$. For a quartic the central difference error is exactly $\\frac{h^{2}}{6}f\'\'\'(x)$ (the $h^{4}$ term needs $f^{(5)} = 0$), so extrapolation removes all of it.'],
      hint: '(4·D(h/2) − D(h))/3.', nolint: ['+ -', '--', '+ 0'], _d: { k: 'fd', c: c, x: x.toPlain(), h: h.toPlain(), v: ext.toPlain() }
    };
  });

  // ---------------------------------------------------------------- composite rules
  function trapQ(c, a, b, n) { var h = q(b).sub(a).div(n), s = pev(c, a).add(pev(c, b)).div(2); for (var i = 1; i < n; i++) s = s.add(pev(c, q(a).add(h.mul(i)))); return s.mul(h); }
  function simpQ(c, a, b, n) { var h = q(b).sub(a).div(n), s = pev(c, a).add(pev(c, b)); for (var i = 1; i < n; i++) s = s.add(pev(c, q(a).add(h.mul(i))).mul(i % 2 ? 4 : 2)); return s.mul(h).div(3); }
  G('num.composite-rules', function (R, ctx) {
    var kind = lv(ctx, R.pick(['ratio', 'simpcubic']), R.pick(['traperr', 'order', 'simpcubic']), R.pick(['nneeded', 'traperr', 'order']));
    if (kind === 'ratio') {
      var rule = R.pick(['trapezoid', 'Simpson\'s']), E = q(R.pick([32, 48, 64, 96, 160])).div(pow10(R.int(3, 5))), fac = rule === 'trapezoid' ? 4 : 16;
      return {
        q: 'The composite ' + rule + ' rule with $n = 10$ pieces gives an error of $' + td(E) + '$ for a smooth integrand. Estimate the error with $n = 20$.',
        a: num(E.div(fac)),
        steps: [rule === 'trapezoid' ? 'The trapezoid rule has error of order $h^{2}$.' : 'Simpson\'s rule has error of order $h^{4}$.', 'Doubling $n$ halves $h$, so the error shrinks by $2^{' + (fac === 4 ? 2 : 4) + '} = ' + fac + '$: $' + td(E) + ' \\div ' + fac + ' = ' + td(E.div(fac)) + '$.'],
        hint: 'Trapezoid: divide by 4. Simpson: divide by 16.', _d: { k: kind, E: E.toPlain(), f: fac }
      };
    }
    if (kind === 'simpcubic') {
      var c = polyF(R, 3), a = R.int(-2, 1), b = a + R.pick([2, 4]), S = simpQ(c, a, b, 2), I = pint(c, a, b), m = (a + b) / 2;
      return {
        q: 'Apply Simpson\'s rule with $n = 2$ to $\\int_{' + a + '}^{' + b + '} (' + ptex(c) + ')\\,dx$.',
        a: num(S),
        steps: ['$h = ' + td(q(b - a).div(2)) + '$: $S = \\frac{h}{3}[f(' + a + ') + 4f(' + m + ') + f(' + b + ')] = \\frac{' + td(q(b - a).div(2)) + '}{3}[' + td(pev(c, a)) + ' + 4(' + td(pev(c, m)) + ') + ' + paren(pev(c, b)) + '] = ' + td(S) + '$.', 'The exact integral is $' + td(I) + '$ too: Simpson\'s rule is exact for every cubic, not only for quadratics, because the error depends on $f^{(4)}$, which is $0$ here.'],
        hint: 'S = (h/3)[f(a) + 4f(midpoint) + f(b)].', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, c: c, a: a, b: b, v: S.toPlain() }
      };
    }
    if (kind === 'traperr') {
      var A2 = R.nz(-2, 3), b2 = R.pick([1, 2, 3, 4]), n = R.pick([2, 4, 5]), cq = [R.int(-3, 3), R.int(-3, 3), A2], T = trapQ(cq, 0, b2, n), I2 = pint(cq, 0, b2), err = T.sub(I2);
      return {
        q: 'Use the composite trapezoid rule with $n = ' + n + '$ on $\\int_0^{' + b2 + '} (' + ptex(cq) + ')\\,dx$, and find its error $T_{' + n + '} - I$.',
        a: num(err),
        steps: ['$h = ' + td(q(b2).div(n)) + '$, and $T_{' + n + '} = h\\left[\\frac{f(0) + f(' + b2 + ')}{2} + \\sum f(x_i)\\right] = ' + td(T) + '$.', 'Exact: $I = ' + td(I2) + '$.', 'Error: $' + td(T) + ' - ' + paren(I2) + ' = ' + td(err) + '$. It matches $\\frac{(b - a)h^{2}}{12}f\'\'$ exactly, since $f\'\' = ' + 2 * A2 + '$ is constant; halving $h$ would cut it by 4.'],
        hint: 'Compute T_n and the exact integral, then subtract.', nolint: ['+ -', '--'], _d: { k: kind, c: cq, b: b2, n: n, v: err.toPlain() }
      };
    }
    if (kind === 'order') {
      var p = R.pick([2, 4]), e1 = R.pick([3.2, 4.8, 6.4, 2.4]), e2 = Number((e1 / Math.pow(2, p) * (1 + R.pick([-0.03, 0, 0.02]))).toPrecision(2)), ex = -R.int(3, 5);
      return {
        q: 'A composite rule gives errors $' + sci(q(e1).mul(pow10(ex))) + '$ with $n = 8$ and $' + sci(q(e2).mul(pow10(ex))) + '$ with $n = 16$. What is its order $p$ (error $\\approx Ch^{p}$), to the nearest whole number? Which rule is it likely to be?',
        a: multi([{ label: '$p =$', a: num(p, { form: 'int' }) }, { label: 'rule:', a: mcKeep(['trapezoid (or midpoint)', 'Simpson\'s'], p === 2 ? 0 : 1) }]),
        steps: ['Ratio: $' + e1 + ' \\div ' + e2 + ' \\approx ' + (e1 / e2).toFixed(1) + '$, close to $2^{' + p + '} = ' + Math.pow(2, p) + '$.', 'So $p = ' + p + '$: ' + (p === 2 ? 'the trapezoid or midpoint rule.' : 'Simpson\'s rule.')],
        hint: 'Doubling n halves h; the error ratio is 2^p.', _d: { k: kind, p: p }
      };
    }
    // nneeded
    var simp = R.coin(), K = R.pick([1, 2, 6, 12]), L = R.pick([1, 2]), m = R.int(4, 7), tol = pow10(-m), nn = simp ? 2 : 1;
    while (true) { var bnd = simp ? q(K).mul(q(L).pow(5)).div(q(180).mul(q(nn).pow(4))) : q(K).mul(q(L).pow(3)).div(q(12).mul(q(nn).pow(2))); if (bnd.le(tol)) break; nn += simp ? 2 : 1; }
    return {
      q: 'How many subintervals $n$ does the composite ' + (simp ? 'Simpson\'s rule (with $n$ even)' : 'trapezoid rule') + ' need on an interval of length ' + L + ' to guarantee an error at most $10^{-' + m + '}$, if $|f^{(' + (simp ? 4 : 2) + ')}(x)| \\le ' + K + '$? Use $|E| \\le ' + (simp ? '\\frac{K(b - a)^{5}}{180n^{4}}' : '\\frac{K(b - a)^{3}}{12n^{2}}') + '$.',
      a: num(nn, { form: 'int' }),
      steps: ['We need $' + (simp ? '\\frac{' + K + ' \\cdot ' + L + '^{5}}{180n^{4}}' : '\\frac{' + K + ' \\cdot ' + L + '^{3}}{12n^{2}}') + ' \\le 10^{-' + m + '}$.', 'Solving: $n ' + (simp ? '\\ge \\left(\\frac{' + K * Math.pow(L, 5) + ' \\times 10^{' + m + '}}{180}\\right)^{1/4} \\approx ' + Math.pow(K * Math.pow(L, 5) * Math.pow(10, m) / 180, 0.25).toFixed(2) : '\\ge \\sqrt{\\frac{' + K * Math.pow(L, 3) + ' \\times 10^{' + m + '}}{12}} \\approx ' + Math.sqrt(K * Math.pow(L, 3) * Math.pow(10, m) / 12).toFixed(2)) + '$.', 'The smallest ' + (simp ? 'even ' : '') + 'whole number that works is $n = ' + nn + '$.' + (simp ? ' Simpson\'s rule needs far fewer pieces than the trapezoid rule for the same accuracy.' : '')],
      hint: 'Set the bound ≤ tolerance and solve for n; round up' + (simp ? ' to an even number.' : '.'), _d: { k: 'nneeded', simp: simp, K: K, L: L, m: m, v: nn }
    };
  });

  // ---------------------------------------------------------------- num.romberg
  G('num.romberg', function (R, ctx) {
    var kind = lv(ctx, R.pick(['R11', 'factor']), R.pick(['R22', 'R11', 'factor']), R.pick(['R22', 'R22poly', 'R21']));
    if (kind === 'factor') {
      var m = R.int(1, 4);
      return {
        q: 'In Romberg integration, column $m$ is built from column $m - 1$ by $R(k, m) = \\frac{c \\cdot R(k, m - 1) - R(k - 1, m - 1)}{c - 1}$. What is $c$ for column $m = ' + m + '$?',
        a: num(Math.pow(4, m), { form: 'int' }),
        steps: ['The trapezoid errors are a series in even powers: $c_1h^{2} + c_2h^{4} + c_3h^{6} + \\cdots$', 'Column $m$ cancels the $h^{' + 2 * m + '}$ term; halving $h$ divides it by $2^{' + 2 * m + '} = 4^{' + m + '} = ' + Math.pow(4, m) + '$.', 'So $c = ' + Math.pow(4, m) + '$. Using 4 in every column only cancels the $h^{2}$ term again.'],
        hint: 'Column m removes the h^(2m) error term.', _d: { k: kind, m: m }
      };
    }
    if (kind === 'R22poly') {
      var c = [R.int(-2, 3), R.int(-2, 2), R.int(-2, 2), R.int(-2, 2), R.nz(-2, 2)], b = R.pick([1, 2]);
      var T0 = trapQ(c, 0, b, 1), T1 = trapQ(c, 0, b, 2), T2 = trapQ(c, 0, b, 4), R11 = T1.mul(4).sub(T0).div(3), R21 = T2.mul(4).sub(T1).div(3), R22 = R21.mul(16).sub(R11).div(15), I = pint(c, 0, b);
      return {
        q: 'For $\\int_0^{' + b + '} (' + ptex(c) + ')\\,dx$, the trapezoid rule with 1, 2 and 4 pieces gives $T_1 = ' + td(T0) + '$, $T_2 = ' + td(T1) + '$, $T_4 = ' + td(T2) + '$. Compute the Romberg value $R(2, 2)$.',
        a: num(R22),
        steps: ['Column 1 (factor 4): $R(1, 1) = \\frac{4T_2 - T_1}{3} = ' + td(R11) + '$ and $R(2, 1) = \\frac{4T_4 - T_2}{3} = ' + td(R21) + '$.', 'Column 2 (factor 16): $R(2, 2) = \\frac{16R(2, 1) - R(1, 1)}{15} = ' + td(R22) + '$.', 'The exact integral is $' + td(I) + '$: $R(2, 2)$ is Boole\'s rule, exact for polynomials up to degree 5.'],
        hint: 'Factor 4 for column 1, then 16 for column 2.', _d: { k: kind, c: c, b: b, v: R22.toPlain() }
      };
    }
    // R11, R21, R22 from decimal data: trapezoid values of a smooth integral
    var Iv = q(R.int(100000, 999999)).div(100000), c1 = q(R.nz(-900, 900)).div(10000), c2 = q(R.nz(-500, 500)).div(10000);
    var T = [0, 1, 2].map(function (j) { var hh = Q(1, Math.pow(2, j)); return rd(Iv.add(c1.mul(hh.pow(2))).add(c2.mul(hh.pow(4))), 6); });
    var r11 = T[1].mul(4).sub(T[0]).div(3), r21 = T[2].mul(4).sub(T[1]).div(3), r22 = r21.mul(16).sub(r11).div(15);
    if (kind === 'R11') return {
      q: 'The trapezoid rule gives $T(h) = ' + td(T[0]) + '$ and $T(h/2) = ' + td(T[1]) + '$. Find the first Romberg value $R(1, 1) = \\frac{4T(h/2) - T(h)}{3}$, rounded to 6 decimal places.',
      a: num(r11, { dp: 6 }),
      steps: ['$\\frac{4(' + td(T[1]) + ') - ' + td(T[0]) + '}{3} = ' + r11.toDec(8) + '\\ldots \\approx ' + r11.toDec(6) + '$.', 'This cancels the $h^{2}$ error term; it is the same as Simpson\'s rule with the finer points.'],
      hint: 'Four times the finer value, minus the coarser, over 3.', _d: { k: kind, T: T.map(function (v) { return v.toPlain(); }), v: r11.toPlain() }
    };
    if (kind === 'R21') return {
      q: 'Trapezoid values for an integral are $T(h) = ' + td(T[0]) + '$, $T(h/2) = ' + td(T[1]) + '$, $T(h/4) = ' + td(T[2]) + '$. Find $R(2, 1)$, the column-1 Romberg value from the two finest trapezoid values, rounded to 6 decimal places.',
      a: num(r21, { dp: 6 }),
      steps: ['$R(2, 1) = \\frac{4T(h/4) - T(h/2)}{3} = \\frac{4(' + td(T[2]) + ') - ' + td(T[1]) + '}{3} \\approx ' + r21.toDec(6) + '$.'],
      hint: 'Use T(h/4) and T(h/2) with the factor 4.', _d: { k: kind, T: T.map(function (v) { return v.toPlain(); }), v: r21.toPlain() }
    };
    return {
      q: 'Trapezoid values for an integral are $T(h) = ' + td(T[0]) + '$, $T(h/2) = ' + td(T[1]) + '$, $T(h/4) = ' + td(T[2]) + '$. Fill in the Romberg triangle up to $R(2, 2)$, and give $R(2, 2)$ rounded to 6 decimal places (keep full precision along the way).',
      a: num(r22, { dp: 6 }),
      steps: ['Column 1: $R(1, 1) = \\frac{4(' + td(T[1]) + ') - ' + td(T[0]) + '}{3} \\approx ' + r11.toDec(8) + '$, $R(2, 1) = \\frac{4(' + td(T[2]) + ') - ' + td(T[1]) + '}{3} \\approx ' + r21.toDec(8) + '$.', 'Column 2: $R(2, 2) = \\frac{16R(2, 1) - R(1, 1)}{15} \\approx ' + r22.toDec(6) + '$.', 'Column 2 uses 16, not 4: it cancels the $h^{4}$ term.'],
      hint: 'Column 1 uses factor 4; column 2 uses factor 16.', _d: { k: 'R22', T: T.map(function (v) { return v.toPlain(); }), v: r22.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.gaussian-quadrature
  G('num.gaussian-quadrature', function (R, ctx) {
    var kind = lv(ctx, R.pick(['cubic', 'degree']), R.pick(['mapped', 'quartic', 'cubic']), R.pick(['mapped', 'three', 'nodes']));
    if (kind === 'degree') {
      var n = R.int(2, 6);
      return {
        q: 'An $n$-point Gauss–Legendre rule chooses $n$ nodes and $n$ weights. With $n = ' + n + '$, what is the highest degree of polynomial it integrates exactly?',
        a: num(2 * n - 1, { form: 'int' }),
        steps: ['There are $2n = ' + 2 * n + '$ free numbers (nodes and weights), enough to match $1, x, \\ldots, x^{' + (2 * n - 1) + '}$.', 'So it is exact up to degree $2n - 1 = ' + (2 * n - 1) + '$, almost twice what $n$ equally spaced points give.'],
        hint: 'Count the free parameters: n nodes and n weights.', _d: { k: kind, n: n }
      };
    }
    if (kind === 'cubic' || kind === 'quartic') {
      var c = kind === 'cubic' ? polyF(R, 3) : [R.int(-3, 3), R.int(-3, 3), R.int(-2, 2), R.int(-2, 2), R.nz(-2, 2)];
      // f(±1/√3): odd powers cancel in the sum; x^2 -> 1/3, x^4 -> 1/9
      var Gs = q(c[0]).mul(2).add(q(c[2] || 0).mul(Q(2, 3))).add(q(c[4] || 0).mul(Q(2, 9))), I = pint(c, -1, 1);
      if (kind === 'cubic') return {
        q: 'Apply the 2-point Gauss rule $\\int_{-1}^{1} f(x)\\,dx \\approx f\\left(-\\frac{1}{\\sqrt{3}}\\right) + f\\left(\\frac{1}{\\sqrt{3}}\\right)$ to $f(x) = ' + ptex(c) + '$.',
        a: num(Gs),
        steps: ['In the sum the odd powers cancel, and $\\left(\\pm\\frac{1}{\\sqrt{3}}\\right)^{2} = \\frac{1}{3}$.', 'Sum: $2(' + c[0] + ')' + (c[2] ? ' + ' + parenF(c[2]) + ' \\cdot \\frac{2}{3}' : '') + ' = ' + tq(Gs) + '$.', 'Exact integral: $' + tq(I) + '$. Equal, as promised: two points integrate every cubic exactly.'],
        hint: 'Odd powers cancel between ±1/√3; x² becomes 1/3 at both nodes.', _d: { k: kind, c: c, v: Gs.toPlain() }
      };
      return {
        q: 'The 2-point Gauss rule $f\\left(-\\frac{1}{\\sqrt{3}}\\right) + f\\left(\\frac{1}{\\sqrt{3}}\\right)$ is applied to $\\int_{-1}^{1} (' + ptex(c) + ')\\,dx$. Find its error, rule minus exact value.',
        a: num(Gs.sub(I)),
        steps: ['Rule: odd powers cancel, $x^{2} \\to \\frac{1}{3}$ and $x^{4} \\to \\frac{1}{9}$ at both nodes: $' + tq(Gs) + '$.', 'Exact: $' + tq(I) + '$.', 'Error: $' + tq(Gs.sub(I)) + '$. Only the $x^{4}$ term contributes: $' + (c[4] === 1 ? '' : c[4] === -1 ? '-' : parenF(c[4])) + '\\left(\\frac{2}{9} - \\frac{2}{5}\\right)$. Degree 4 is one beyond what 2 points can do.'],
        hint: 'The rule is exact for the cubic part; only the x⁴ term matters.', _d: { k: kind, c: c, v: Gs.sub(I).toPlain() }
      };
    }
    var a = R.int(-1, 3), w = R.pick([2, 4, 6]), b = a + w, mid = q(a + b).div(2), half = q(w).div(2);
    if (kind === 'nodes') return {
      q: 'Move the 2-point Gauss rule from $[-1, 1]$ to $[' + a + ', ' + b + ']$ with $x = \\frac{a + b}{2} + \\frac{b - a}{2}t$. What are the two nodes?',
      a: { t: 'set', v: [mid.toPlain() + '+' + half.toPlain() + '/sqrt(3)', mid.toPlain() + '-' + half.toPlain() + '/sqrt(3)'] },
      steps: ['Center $' + td(mid) + '$, half-width $' + td(half) + '$.', 'Nodes: $' + td(mid) + ' \\pm \\frac{' + td(half) + '}{\\sqrt{3}}$.', 'The weights become $\\frac{b - a}{2} = ' + td(half) + '$ each; forgetting that factor is the usual mistake.'],
      hint: 'Center plus or minus half-width over √3.', _d: { k: kind, a: a, b: b }
    };
    if (kind === 'three') {
      var c3 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3), R.int(-2, 2), R.nz(-2, 2)], G3 = q(c3[0]).mul(2).add(q(c3[2]).mul(Q(2, 3))).add(q(c3[4]).mul(Q(2, 5))), I3 = pint(c3, -1, 1);
      return {
        q: 'The 3-point Gauss rule on $[-1, 1]$ is $\\frac{5}{9}f\\left(-\\sqrt{\\tfrac{3}{5}}\\right) + \\frac{8}{9}f(0) + \\frac{5}{9}f\\left(\\sqrt{\\tfrac{3}{5}}\\right)$. Apply it to $f(x) = ' + ptex(c3) + '$.',
        a: num(G3),
        steps: ['Odd powers cancel. At $\\pm\\sqrt{3/5}$: $x^{2} = \\frac{3}{5}$ and $x^{4} = \\frac{9}{25}$.', 'Constant: $\\left(\\frac{5}{9} + \\frac{8}{9} + \\frac{5}{9}\\right)' + paren(c3[0]) + ' = 2(' + c3[0] + ')$. $x^{2}$: $\\frac{10}{9} \\cdot \\frac{3}{5} = \\frac{2}{3}$. $x^{4}$: $\\frac{10}{9} \\cdot \\frac{9}{25} = \\frac{2}{5}$.', 'Total: $' + tq(G3) + '$, equal to the exact integral $' + tq(I3) + '$ (3 points are exact up to degree 5).'],
        hint: 'Odd powers cancel; work out x² and x⁴ at ±√(3/5).', _d: { k: kind, c: c3, v: G3.toPlain() }
      };
    }
    var cm = polyF(R, 3), Im = pint(cm, a, b);
    return {
      q: 'Use the 2-point Gauss rule, moved to $[' + a + ', ' + b + ']$, to compute $\\int_{' + a + '}^{' + b + '} (' + ptex(cm) + ')\\,dx$.',
      a: num(Im),
      steps: ['On $[a, b]$: $\\int_a^b f\\,dx \\approx \\frac{b - a}{2}\\left[f(m - d) + f(m + d)\\right]$ with $m = ' + td(mid) + '$ and $d = \\frac{' + td(half) + '}{\\sqrt{3}}$.', 'Because the rule is exact for cubics, the result equals the exact integral: $' + td(Im) + '$.', 'Check by antiderivative: $\\left[' + ptex([0].concat(cm.map(function (v, i) { return Q(v, i + 1); }))) + '\\right]_{' + a + '}^{' + b + '} = ' + td(Im) + '$. Without the factor $\\frac{b - a}{2} = ' + td(half) + '$ the answer would be off by that factor.'],
      hint: 'Exact for cubics: the moved 2-point rule gives the exact integral, including the factor (b − a)/2.', _d: { k: 'mapped', c: cm, a: a, b: b, v: Im.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.adaptive-quadrature
  G('num.adaptive-quadrature', function (R, ctx) {
    var kind = lv(ctx, R.pick(['estimate', 'accept']), R.pick(['improved', 'accept', 'which']), R.pick(['quartic', 'which', 'improved']));
    if (kind === 'quartic') {
      var A4 = R.nz(-2, 3), a = R.int(-1, 1), w = R.pick([2, 4]), b = a + w, c = [0, 0, 0, 0, A4], S1 = simpQ(c, a, b, 2), S2 = simpQ(c, a, b, 4), I = pint(c, a, b), est = S2.sub(S1).div(15);
      return {
        q: 'Adaptive Simpson on $\\int_{' + a + '}^{' + b + '} ' + T.mono(A4, 'x^{4}') + '\\,dx$: Simpson on the whole interval gives $S_1 = ' + td(S1) + '$, and on its two halves (added) $S_2 = ' + td(S2) + '$. Compute the error estimate $\\frac{S_2 - S_1}{15}$ for $S_2$.',
        a: num(est),
        steps: ['$\\frac{' + td(S2) + ' - ' + paren(S1) + '}{15} = ' + td(est) + '$.', 'The true error of $S_2$ is $I - S_2 = ' + td(I) + ' - ' + paren(S2) + ' = ' + td(I.sub(S2)) + '$, the same number: for $x^{4}$ the error is exactly proportional to $h^{4}$, so the estimate is exact.', 'Why 15: halving $h$ cuts Simpson\'s error by 16, so $S_2 - S_1 \\approx 15 \\times$ (error of $S_2$).'],
        hint: 'Subtract and divide by 15.', nolint: ['+ -', '--'], _d: { k: kind, c: c, a: a, b: b, v: est.toPlain() }
      };
    }
    var S1d = q(R.int(10000, 99999)).div(10000), dlt = q(R.int(20, 300) * R.sign()).div(R.pick([100000, 1000000])), S2d = S1d.add(dlt), tolm = R.int(4, 6), tol = pow10(-tolm);
    if (kind === 'estimate') return {
      q: 'On one subinterval, Simpson\'s rule gives $S_1 = ' + td(S1d) + '$, and the two halves together give $S_2 = ' + td(S2d) + '$. Estimate the error of $S_2$ as $\\frac{|S_2 - S_1|}{15}$, to 2 significant digits.',
      a: num(dlt.abs().div(15), { rtol: 0.02 }),
      steps: ['$|S_2 - S_1| = ' + td(dlt.abs()) + '$.', 'Divide by 15: $\\approx ' + sci(fl(dlt.abs().div(15), 2), 2) + '$.'],
      hint: 'Halving h cuts Simpson error by 16, so the difference is 15 times the finer error.', _d: { k: kind, S1: S1d.toPlain(), S2: S2d.toPlain() }
    };
    if (kind === 'improved') { var imp = S2d.add(S2d.sub(S1d).div(15)); return {
      q: 'Simpson on an interval gives $S_1 = ' + td(S1d) + '$; the two halves give $S_2 = ' + td(S2d) + '$. Give the improved value $S_2 + \\frac{S_2 - S_1}{15}$, rounded to 7 decimal places.',
      a: num(imp, { dp: 7 }),
      steps: ['$\\frac{S_2 - S_1}{15} = \\frac{' + td(dlt) + '}{15} \\approx ' + sci(fl(dlt.div(15), 4), 4) + '$.', '$' + td(S2d) + (dlt.sign() < 0 ? ' - ' : ' + ') + sci(fl(dlt.abs().div(15), 4), 4) + ' \\approx ' + imp.toDec(7) + '$. This is one Richardson step on Simpson\'s rule.'],
      hint: 'Add the error estimate (with its sign) to S₂.', _d: { k: kind, S1: S1d.toPlain(), S2: S2d.toPlain(), v: imp.toPlain() }
    }; }
    if (kind === 'accept') { var e = dlt.abs().div(15), ok = e.le(tol); return {
      q: 'An adaptive Simpson routine accepts a subinterval when its error estimate $\\frac{|S_2 - S_1|}{15}$ is at most the tolerance $10^{-' + tolm + '}$ for that subinterval. Here $S_1 = ' + td(S1d) + '$ and $S_2 = ' + td(S2d) + '$. True or false: this subinterval is accepted without splitting.',
      a: tf(ok),
      steps: ['Estimate: $\\frac{' + td(dlt.abs()) + '}{15} \\approx ' + sci(fl(e, 3), 3) + '$.', ok ? 'That is at most $10^{-' + tolm + '}$: accept $S_2$ (or the improved value) and move on.' : 'That is more than $10^{-' + tolm + '}$: split the subinterval in two, each with half the tolerance, and test each half.'],
      hint: 'Compare |S₂ − S₁|/15 with the tolerance.', _d: { k: kind, S1: S1d.toPlain(), S2: S2d.toPlain(), tol: tolm, v: ok }
    }; }
    // which: select the subintervals that must be split
    var names = ['[0, 0.5]', '[0.5, 1]', '[1, 1.5]', '[1.5, 2]'], tl = q(R.pick([1, 2, 5])).div(pow10(R.int(4, 5))), rows = [], vs = [];
    names.forEach(function (nm, i) { var d = tl.mul(15).mul(q(R.pick([1, 3, 6, 12, 25, 40, 80, 150])).div(100)); if (R.coin()) d = d.neg(); rows.push(d); if (d.abs().div(15).gt(tl)) vs.push(i); });
    if (!vs.length) { rows[1] = tl.mul(30); vs = [1]; } if (vs.length === 4) { rows[0] = tl.mul(3); vs = [1, 2, 3]; }
    return {
      q: 'Adaptive Simpson splits $[0, 2]$ into four pieces, each with tolerance $' + sci(tl) + '$. For each piece, $S_2 - S_1$ is: ' + names.map(function (nm, i) { return '$' + nm + '$: $' + sci(fl(rows[i], 3)) + '$'; }).join('; ') + '. Which pieces must be split again? Select all that apply.',
      a: { t: 'mc', choices: names.map(function (nm) { return '$' + nm + '$'; }), v: vs, keep: true },
      steps: ['A piece passes when $\\frac{|S_2 - S_1|}{15} \\le ' + sci(tl) + '$, that is, when $|S_2 - S_1| \\le ' + sci(tl.mul(15)) + '$.'].concat(names.map(function (nm, i) { return '$' + nm + '$: $\\frac{|S_2 - S_1|}{15} \\approx ' + sci(fl(rows[i].abs().div(15), 3), 3) + '$, ' + (vs.indexOf(i) >= 0 ? 'too big: split.' : 'fine: keep.'); })).concat(['Only the failing pieces are split; the work goes where the integrand is hard.']),
      hint: 'Divide each difference by 15 and compare with the tolerance.', _d: { k: kind, tol: tl.toPlain(), rows: rows.map(function (r) { return r.toPlain(); }), v: vs }
    };
  });

  // =====================================================================================================
  // Unit 6: Differential Equations
  // =====================================================================================================
  var HS = [q('0.1'), q('0.2'), q('0.25'), q('0.5')];
  // ---------------------------------------------------------------- num.ode-error
  G('num.ode-error', function (R, ctx) {
    var kind = lv(ctx, R.pick(['global', 'local']), R.pick(['eulerlin', 'global', 'local']), R.pick(['steps', 'eulerlin', 'global']));
    if (kind === 'global') {
      var M = R.pick([['Euler\'s method', 1], ['Heun\'s method', 2], ['the classical Runge–Kutta method (RK4)', 4]]), E = q(R.pick([2, 4, 8, 16, 32, 48])).div(pow10(R.int(2, 4))), fac = R.pick([2, 2, 10]), En = E.div(q(fac).pow(M[1]));
      return {
        q: 'Solving an initial value problem up to $t = 2$ with ' + M[0] + ' and step $h = 0.1$ gives a global error of $' + td(E) + '$ at $t = 2$. Estimate the global error with $h = ' + td(Q(1, 10 * fac)) + '$.',
        a: num(En),
        steps: [M[0].charAt(0).toUpperCase() + M[0].slice(1) + ' has global error of order $' + (M[1] === 1 ? 'h' : 'h^{' + M[1] + '}') + '$ (its local error is of order $h^{' + (M[1] + 1) + '}$).', 'Dividing $h$ by ' + fac + ' divides the global error by ' + (M[1] === 1 ? '$' + fac + '$' : '$' + fac + '^{' + M[1] + '} = ' + Math.pow(fac, M[1]) + '$') + ': $' + td(E) + ' \\div ' + Math.pow(fac, M[1]) + ' = ' + td(En) + '$.'],
        hint: 'Use the global order: 1 for Euler, 2 for Heun, 4 for RK4.', _d: { k: kind, p: M[1], E: E.toPlain(), f: fac }
      };
    }
    if (kind === 'local') {
      var a = R.pick([2, 4, 6, -2, 3]), h = R.pick(HS), tn = R.int(0, 3), loc = q(a).mul(h).mul(h).div(2);
      return {
        q: 'For $y\' = ' + T.mono(a, 't') + '$, take one Euler step of size $h = ' + td(h) + '$ from an exact value $y(' + tn + ')$. What is the local error, $y(' + td(q(tn).add(h)) + ')$ minus the Euler value?',
        a: num(loc),
        steps: ['Exact change over the step: $\\int_{' + tn + '}^{' + td(q(tn).add(h)) + '} ' + T.mono(a, 't') + '\\,dt = ' + td(q(a).mul(q(tn).mul(h).add(h.mul(h).div(2)))) + '$.', 'Euler\'s change: $h \\cdot f(t_n) = ' + td(h) + ' \\cdot ' + paren(a * tn) + ' = ' + td(h.mul(a * tn)) + '$.', 'Local error: $' + td(loc) + '$, which is $\\frac{' + a + '}{2}h^{2}$: order $h^{2}$, whatever $t_n$ is.'],
        hint: 'Compare the exact change ∫f dt with Euler\'s change h·f(tₙ).', nolint: ['+ -', '--'], _d: { k: kind, a: a, h: h.toPlain(), v: loc.toPlain() }
      };
    }
    if (kind === 'eulerlin') {
      var aa = R.pick([2, 4, 6, -2]), bb = R.int(-2, 3), y0 = R.int(-2, 4), TT = R.pick([1, 2]), hh = R.pick([q('0.5'), q('0.25'), q('0.2')]), N = q(TT).div(hh).num();
      var y = q(y0), t = q(0); for (var i = 0; i < N; i++) { y = y.add(hh.mul(q(aa).mul(t).add(bb))); t = t.add(hh); }
      var ex = q(y0).add(q(bb).mul(TT)).add(q(aa).mul(TT * TT).div(2)), err = ex.sub(y), ask = R.pick(['y', 'err']);
      return {
        q: 'Use Euler\'s method with $h = ' + td(hh) + '$ on $y\' = ' + T.lin(aa, 't', bb) + '$, $y(0) = ' + y0 + '$, up to $t = ' + TT + '$. ' + (ask === 'y' ? 'What is the Euler value at $t = ' + TT + '$?' : 'What is the global error, $y(' + TT + ')$ minus the Euler value?'),
        a: num(ask === 'y' ? y : err),
        steps: ['That is ' + N + ' steps of $y_{n+1} = y_n + h(' + T.lin(aa, 't_n', bb) + ')$, ending at $y_{' + N + '} = ' + td(y) + '$.', 'Exact: $y = ' + ptex([y0, bb, Q(aa, 2)], 't') + '$, so $y(' + TT + ') = ' + td(ex) + '$.', 'Global error: $' + td(ex) + ' - ' + paren(y) + ' = ' + td(err) + ' = \\frac{' + aa + '}{2} \\cdot ' + TT + ' \\cdot h$. Each of the ' + N + ' steps adds a local error $\\frac{' + aa + '}{2}h^{2}$, and $' + N + ' \\times \\frac{' + aa + '}{2}h^{2}$ is of order $h$.'],
        hint: 'Take the steps one at a time, then compare with the exact solution.', nolint: ['+ -', '--'], _d: { k: kind, a: aa, b: bb, y0: y0, T: TT, h: hh.toPlain(), ask: ask }
      };
    }
    // steps: how many steps for a target error
    var Mx = R.pick([['Euler\'s method', 1, 10], ['RK4', 4, 10], ['Heun\'s method', 2, 10]]), e0 = q(R.pick([2, 4, 5])).div(pow10(R.int(2, 3))), fct = Mx[1] === 1 ? R.pick([10, 20, 50]) : 10, tgt = e0.div(q(fct).pow(Mx[1])), Nn = 10 * fct;
    return {
      q: 'With ' + Mx[0] + ' and $h = 0.1$ (10 steps to $t = 1$), the error at $t = 1$ is $' + td(e0) + '$. About how many steps are needed for an error of $' + td(tgt) + '$?',
      a: num(Nn, { form: 'int' }),
      steps: ['The global error is of order $h^{' + Mx[1] + '}$; it must shrink by $' + td(e0.div(tgt)) + ' = ' + fct + '^{' + Mx[1] + '}$.', 'So $h$ shrinks by $' + fct + '$: $h = ' + td(Q(1, 10 * fct)) + '$, which takes $' + Nn + '$ steps.', Mx[1] === 1 ? 'A first-order method pays dearly for accuracy; a higher-order method gets there with far fewer steps.' : 'A higher-order method needs far fewer extra steps for the same gain.'],
      hint: 'Find how much h must shrink (take the p-th root), then count steps.', _d: { k: 'steps', p: Mx[1], v: Nn }
    };
  });

  // ---------------------------------------------------------------- num.ode-systems-numerical
  G('num.ode-systems-numerical', function (R, ctx) {
    var kind = lv(ctx, R.pick(['rewrite', 'euler1', 'inits']), R.pick(['euler2', 'euler1', 'rewrite']), R.pick(['heun', 'euler2']));
    var a = R.int(0, 4), b = R.nz(-4, 9), eq = 'y\'\'' + (a ? T.coef(a, 'y\'', false) : '') + T.coef(b, 'y', false) + ' = 0';
    if (kind === 'inits') {
      var n = R.int(2, 5);
      return {
        q: 'A ' + ord(n) + '-order equation $y^{(' + n + ')} = f(t, y, y\', \\ldots)$ is rewritten as a first-order system for Euler\'s method. How many starting values must be given at $t = 0$?',
        a: num(n, { form: 'int' }),
        steps: ['The system has ' + n + ' unknowns: $y, y\', \\ldots, y^{(' + (n - 1) + ')}$.', 'Each one needs its own starting value, so ' + n + ' numbers: $y(0)$ through $y^{(' + (n - 1) + ')}(0)$.'],
        hint: 'One starting value per component of the system.', _d: { k: kind, n: n }
      };
    }
    if (kind === 'rewrite') return {
      q: 'Write $' + eq + '$ as $\\mathbf{u}\' = A\\mathbf{u}$ with $\\mathbf{u} = (y, y\')$. Find $A$.',
      a: matA([[0, 1], [-b, -a]]),
      steps: ['Let $u_1 = y$ and $u_2 = y\'$. Then $u_1\' = u_2$.', 'From the equation, $y\'\' = ' + T.terms([[-b, 'y'], [-a, "y'"]]) + '$, so $u_2\' = ' + T.terms([[-b, 'u_1'], [-a, 'u_2']]) + '$.', '$A = ' + texM([[0, 1], [-b, -a]]) + '$.'],
      hint: 'The first row says y′ = y′; the second comes from solving the equation for y″.', _d: { k: kind, a: a, b: b }
    };
    var y0 = R.int(-2, 3), v0 = R.int(-2, 3); if (y0 === 0 && v0 === 0) v0 = 1;
    var h = R.pick([q('0.1'), q('0.5'), q('0.2')]);
    function F(u) { return [u[1], u[0].mul(-b).sub(u[1].mul(a))]; }
    function eul(u) { var f = F(u); return [u[0].add(h.mul(f[0])), u[1].add(h.mul(f[1]))]; }
    var u0 = [q(y0), q(v0)], u1 = eul(u0), u2 = eul(u1);
    var sys = 'the system $y\' = v$, $v\' = ' + T.terms([[-b, 'y'], [-a, 'v']]) + '$ (from $' + eq + '$), with $y(0) = ' + y0 + '$, $v(0) = y\'(0) = ' + v0 + '$';
    var st1 = 'Step 1: $y_1 = ' + y0 + ' + ' + td(h) + '(' + v0 + ') = ' + td(u1[0]) + '$, $v_1 = ' + v0 + ' + ' + td(h) + '(' + td(F(u0)[1]) + ') = ' + td(u1[1]) + '$ (both from the old values).';
    if (kind === 'euler1') return {
      q: 'Take one Euler step with $h = ' + td(h) + '$ for ' + sys + '. Give $(y_1, v_1)$.',
      a: tup(u1), steps: [st1],
      hint: 'Update both components with the slopes from the old point.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, a: a, b: b, y0: y0, v0: v0, h: h.toPlain(), n: 1 }
    };
    if (kind === 'euler2') return {
      q: 'Take two Euler steps with $h = ' + td(h) + '$ for ' + sys + '. Give $(y_2, v_2)$.',
      a: tup(u2), steps: [st1, 'Step 2: $y_2 = ' + td(u1[0]) + ' + ' + td(h) + '(' + td(u1[1]) + ') = ' + td(u2[0]) + '$, $v_2 = ' + td(u1[1]) + ' + ' + td(h) + '(' + td(F(u1)[1]) + ') = ' + td(u2[1]) + '$.'],
      hint: 'Each step uses only the values from the step before.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, a: a, b: b, y0: y0, v0: v0, h: h.toPlain(), n: 2 }
    };
    var k1 = F(u0), up = [u0[0].add(h.mul(k1[0])), u0[1].add(h.mul(k1[1]))], k2 = F(up), uh = [u0[0].add(h.div(2).mul(k1[0].add(k2[0]))), u0[1].add(h.div(2).mul(k1[1].add(k2[1])))];
    return {
      q: 'Take one step of Heun\'s method (improved Euler) with $h = ' + td(h) + '$ for ' + sys + '. Give $(y_1, v_1)$.',
      a: tup(uh),
      steps: ['$\\mathbf{k}_1 = F(\\mathbf{u}_0) = ' + texV(k1) + '$.', 'Euler predictor: $\\mathbf{u}_0 + h\\mathbf{k}_1 = ' + texV(up) + '$, and $\\mathbf{k}_2 = F$ there $= ' + texV(k2) + '$.', '$\\mathbf{u}_1 = \\mathbf{u}_0 + \\frac{h}{2}(\\mathbf{k}_1 + \\mathbf{k}_2) = ' + texV(uh) + '$.'],
      hint: 'Do Heun with vectors: average the slopes at the start and at the Euler predictor.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, a: a, b: b, y0: y0, v0: v0, h: h.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.absolute-stability
  G('num.absolute-stability', function (R, ctx) {
    var kind = lv(ctx, R.pick(['hmax', 'factor']), R.pick(['blow', 'factor', 'hmax', 'heun']), R.pick(['system', 'complex', 'heun']));
    if (kind === 'hmax') {
      var lam = R.pick([-4, -5, -10, -20, -50, -100, -8, -40]), hm = Q(2, -lam);
      return {
        q: 'Forward Euler is used on $y\' = ' + lam + 'y$. What is the largest step $h$ for which the computed values do not grow?',
        a: num(hm),
        steps: ['Each step multiplies by $1 + h\\lambda = 1 - ' + (-lam) + 'h$.', 'No growth requires $|1 - ' + (-lam) + 'h| \\le 1$, that is, $0 \\le ' + (-lam) + 'h \\le 2$.', 'So $h \\le \\frac{2}{' + (-lam) + '} = ' + td(hm) + '$. Larger steps make the values flip sign and grow, though the true solution decays.'],
        hint: 'Require |1 + hλ| ≤ 1.', _d: { k: kind, lam: lam, v: hm.toPlain() }
      };
    }
    if (kind === 'factor') {
      var l2 = R.pick([-2, -4, -10, -6, -20]), h = R.pick([q('0.1'), q('0.25'), q('0.5'), q('0.3')]), g = q(1).add(h.mul(l2)), n = R.int(2, 4), y0 = R.int(1, 4), yn = g.pow(n).mul(y0);
      return {
        q: 'Forward Euler with $h = ' + td(h) + '$ on $y\' = ' + l2 + 'y$, $y(0) = ' + y0 + '$. Find $y_' + n + '$.',
        a: num(yn),
        steps: ['$y_{n+1} = y_n + h(' + l2 + 'y_n) = (1 + h\\lambda)y_n = ' + cv(g, 'y_n') + '$.', '$y_' + n + ' = (' + td(g) + ')^{' + n + '} \\cdot ' + y0 + ' = ' + td(yn) + '$.', g.abs().gt(1) ? 'Since $|1 + h\\lambda| = ' + td(g.abs()) + ' > 1$, the values grow in size, while the true solution $' + cv(y0, 'e^{' + l2 + 't}') + '$ decays: the step is too large.' : 'Since $|1 + h\\lambda| = ' + td(g.abs()) + ' \\le 1$, the values decay like the true solution.'],
        hint: 'Each step multiplies by 1 + hλ.', _d: { k: kind, lam: l2, h: h.toPlain(), n: n, y0: y0, v: yn.toPlain() }
      };
    }
    if (kind === 'blow') {
      var l3 = R.pick([-10, -20, -50, -100, -30]), h3 = R.pick([q('0.01'), q('0.05'), q('0.02'), q('0.1'), q('0.04'), q('0.001')]), z = h3.mul(l3), ok = q(1).add(z).abs().le(1);
      return {
        q: 'True or false: forward Euler with $h = ' + td(h3) + '$ on $y\' = ' + l3 + 'y$ gives values that stay bounded.',
        a: tf(ok),
        steps: ['$h\\lambda = ' + td(z) + '$, so the factor per step is $1 + h\\lambda = ' + td(q(1).add(z)) + '$.', ok ? '$|' + td(q(1).add(z)) + '| \\le 1$: stable.' : '$|' + td(q(1).add(z)) + '| > 1$: the values grow without bound. The limit here is $h \\le ' + td(Q(2, -l3)) + '$.'],
        hint: 'Compute 1 + hλ and compare its size with 1.', _d: { k: kind, lam: l3, h: h3.toPlain(), v: ok }
      };
    }
    if (kind === 'heun') {
      var l4 = R.pick([-2, -4, -10, -5]), h4 = R.pick([q('0.1'), q('0.25'), q('0.5'), q('0.2'), q('0.4')]), z4 = h4.mul(l4), Rz = q(1).add(z4).add(z4.mul(z4).div(2));
      return {
        q: 'Heun\'s method on $y\' = \\lambda y$ gives $y_{n+1} = R(h\\lambda)y_n$ with $R(z) = 1 + z + \\frac{z^{2}}{2}$. For $\\lambda = ' + l4 + '$ and $h = ' + td(h4) + '$, find $R(h\\lambda)$.',
        a: num(Rz),
        steps: ['$z = h\\lambda = ' + td(z4) + '$.', '$R(z) = 1 + ' + paren(z4) + ' + \\frac{' + paren(z4) + '^{2}}{2} = ' + td(Rz) + '$.', Rz.abs().le(1) ? '$|R| \\le 1$: the step is stable.' : '$|R| > 1$: the step is unstable; on the negative real axis Heun needs $-2 \\le h\\lambda \\le 0$, just like forward Euler.'],
        hint: 'Put z = hλ into 1 + z + z²/2.', nolint: ['+ -', '--'], _d: { k: kind, lam: l4, h: h4.toPlain(), v: Rz.toPlain() }
      };
    }
    if (kind === 'system') {
      var big = R.pick([100, 500, 1000, 2000]), small = R.pick([1, 2, 5]);
      return {
        q: 'A linear system $\\mathbf{y}\' = A\\mathbf{y}$ has eigenvalues $-' + small + '$ and $-' + T.commas(big) + '$. The fast component dies out almost at once. What is the largest step forward Euler can use without blowing up?',
        a: num(Q(2, big)),
        steps: ['Forward Euler is stable when $|1 + h\\lambda| \\le 1$ for <b>every</b> eigenvalue.', '$\\lambda = -' + small + '$ needs $h \\le ' + td(Q(2, small)) + '$; $\\lambda = -' + T.commas(big) + '$ needs $h \\le ' + td(Q(2, big)) + '$.', 'So $h \\le ' + td(Q(2, big)) + '$, even after the fast part has vanished: that is stiffness. An implicit method avoids this limit.'],
        hint: 'Every eigenvalue must satisfy |1 + hλ| ≤ 1; the most negative one decides.', _d: { k: kind, big: big }
      };
    }
    // complex eigenvalue
    var pr = R.pick([[3, 4], [1, 1], [1, 2], [2, 1], [6, 8], [1, 3], [3, 1]]), am = pr[0], bm = pr[1], hc = Q(2 * am, am * am + bm * bm);
    return {
      q: 'Forward Euler is applied to $y\' = \\lambda y$ with $\\lambda = ' + (-am === -1 ? '-1' : -am) + ' + ' + (bm === 1 ? '' : bm) + 'i$ (an oscillation that decays). Stability needs $|1 + h\\lambda| \\le 1$. What is the largest $h$?',
      a: num(hc),
      steps: ['$1 + h\\lambda = (1 - ' + (am === 1 ? '' : am) + 'h) + ' + (bm === 1 ? '' : bm) + 'hi$, so $|1 + h\\lambda|^{2} = (1 - ' + (am === 1 ? '' : am) + 'h)^{2} + ' + cv(bm * bm, 'h^{2}') + '$.', 'Setting it $\\le 1$: $-' + 2 * am + 'h + ' + cv(am * am + bm * bm, 'h^{2}').replace(/^/, '') + ' \\le 0$, so $h \\le \\frac{' + 2 * am + '}{' + (am * am + bm * bm) + '}' + (hc.d === BigInt(am * am + bm * bm) ? '' : ' = ' + tq(hc)) + '$.', 'Geometrically, $h\\lambda$ must lie in the disk of radius 1 centered at $-1$.'],
      hint: 'Write |1 + hλ|² with real and imaginary parts and solve the inequality.', _d: { k: 'complex', a: am, b: bm, v: hc.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.implicit-euler
  G('num.implicit-euler', function (R, ctx) {
    var kind = lv(ctx, R.pick(['linear', 'mistake']), R.pick(['compare', 'forced', 'linear']), R.pick(['nonlinear', 'forced', 'compare']));
    if (kind === 'linear') {
      var lam = R.pick([-1, -2, -4, -10, -9, -3]), h = R.pick([q('0.1'), q('0.5'), q(1), q('0.25')]), y0 = R.pick([1, 2, 4, 6, 10]), n = R.int(1, 2), fac = q(1).div(q(1).sub(h.mul(lam))), yn = q(y0).mul(fac.pow(n));
      return {
        q: 'Use backward Euler with $h = ' + td(h) + '$ on $y\' = ' + cv(lam, 'y') + '$, $y(0) = ' + y0 + '$. Find $y_' + n + '$.',
        a: num(yn),
        steps: ['Backward Euler uses the slope at the <b>new</b> point: $y_{n+1} = y_n + h\\lambda y_{n+1}$.', 'Solve for $y_{n+1}$: $y_{n+1} = \\frac{y_n}{1 - h\\lambda} = \\frac{y_n}{' + td(q(1).sub(h.mul(lam))) + '}$.', '$y_' + n + ' = ' + y0 + ' \\cdot \\left(' + tq(fac) + '\\right)^{' + n + '} = ' + tq(yn) + '$.', 'The factor $\\frac{1}{1 - h\\lambda}$ is less than 1 for every $h > 0$ when $\\lambda < 0$: no step-size limit.'],
        hint: 'Solve y₁ = y₀ + hλy₁ for y₁.', _d: { k: kind, lam: lam, h: h.toPlain(), y0: y0, n: n, v: yn.toPlain() }
      };
    }
    if (kind === 'mistake') {
      var l = R.pick([-5, -10, -20]), hh = q('0.1'), y = R.pick([1, 2, 4]);
      return {
        q: 'For $y\' = ' + l + 'y$, $y_0 = ' + y + '$, $h = 0.1$, a student computes the "backward Euler" step as $y_1 = y_0 + h(' + l + 'y_0)$. What did they actually do?',
        a: mc('Forward Euler: they used the slope at the old point', ['Backward Euler, correctly', 'The trapezoid rule', 'Heun\'s method']),
        steps: ['Using $f(t_0, y_0)$ is forward Euler, whatever it is called.', 'Backward Euler uses $f(t_1, y_1)$: $y_1 = y_0 + h(' + l + 'y_1)$, so $y_1 = \\frac{' + y + '}{1 + ' + td(hh.mul(-l)) + '} = ' + tq(q(y).div(q(1).add(hh.mul(-l)))) + '$.'],
        hint: 'Which point\'s slope did they use?', _d: { k: kind }
      };
    }
    if (kind === 'compare') {
      var l2 = R.pick([-10, -20, -30, -50]), h2 = R.pick([q('0.1'), q('0.2'), q('0.5')]), y2 = R.pick([1, 2]), fwd = q(y2).mul(q(1).add(h2.mul(l2))), bwd = q(y2).div(q(1).sub(h2.mul(l2)));
      return {
        q: 'For $y\' = ' + l2 + 'y$, $y(0) = ' + y2 + '$, take one step of size $h = ' + td(h2) + '$ with (a) forward Euler and (b) backward Euler.',
        a: multi([{ label: '(a) forward:', a: num(fwd) }, { label: '(b) backward:', a: num(bwd) }]),
        steps: ['(a) $y_1 = (1 + h\\lambda)y_0 = (' + td(q(1).add(h2.mul(l2))) + ')(' + y2 + ') = ' + td(fwd) + '$: the wrong sign and too large, a sign of instability.', '(b) $y_1 = \\frac{y_0}{1 - h\\lambda} = \\frac{' + y2 + '}{' + td(q(1).sub(h2.mul(l2))) + '}' + (bwd.d === BigInt(q(1).sub(h2.mul(l2)).toPlain()) && bwd.n === BigInt(y2) ? '' : ' = ' + tq(bwd)) + '$: positive and smaller, like the true $' + cv(y2, 'e^{' + l2 + 't}') + '$.', 'For this stiff decay the implicit method behaves well at a step where the explicit one blows up.'],
        hint: 'Forward: multiply by 1 + hλ. Backward: divide by 1 − hλ.', _d: { k: kind, lam: l2, h: h2.toPlain(), y0: y2 }
      };
    }
    if (kind === 'forced') {
      var aa = R.pick([2, 4, 5, 10]), bb = R.int(1, 9), h3 = R.pick([q('0.1'), q('0.5'), q('0.2'), q(1)]), y3 = R.int(0, 5), y31 = q(y3).add(h3.mul(bb)).div(q(1).add(h3.mul(aa)));
      return {
        q: 'Take one backward Euler step with $h = ' + td(h3) + '$ for $y\' = -' + aa + 'y + ' + bb + '$, $y(0) = ' + y3 + '$.',
        a: num(y31),
        steps: ['Backward Euler: $y_1 = y_0 + h(-' + aa + 'y_1 + ' + bb + ')$.', 'Collect $y_1$: $(1 + ' + td(h3.mul(aa)) + ')y_1 = ' + y3 + ' + ' + td(h3.mul(bb)) + '$.', '$y_1 = \\frac{' + td(q(y3).add(h3.mul(bb))) + '}{' + td(q(1).add(h3.mul(aa))) + '} = ' + tq(y31) + '$. It heads toward the steady state $' + tq(Q(bb, aa)) + '$ without overshooting.'],
        hint: 'Put y₁ on both sides, then solve the linear equation for it.', _d: { k: kind, a: aa, b: bb, h: h3.toPlain(), y0: y3, v: y31.toPlain() }
      };
    }
    // nonlinear: y' = -y^2, a quadratic to solve each step
    var hq = R.pick([Q(1, 2), q(1), Q(1, 4)]), s = R.pick([3, 5, 7]), yq0 = q(s * s - 1).div(hq.mul(4)), yq1 = q(s - 1).div(hq.mul(2));
    return {
      q: 'Take one backward Euler step with $h = ' + td(hq) + '$ for $y\' = -y^{2}$, $y(0) = ' + td(yq0) + '$. (Take the positive root.)',
      a: num(yq1),
      steps: ['$y_1 = y_0 - hy_1^{2}$, so $' + cv(hq, 'y_1^{2}') + ' + y_1 - ' + td(yq0) + ' = 0$.', 'Quadratic formula: $y_1 = \\frac{-1 + \\sqrt{1 + 4(' + td(hq) + ')(' + td(yq0) + ')}}{2(' + td(hq) + ')} = \\frac{-1 + ' + s + '}{' + td(hq.mul(2)) + '} = ' + td(yq1) + '$.', 'Each implicit step means solving an equation (here a quadratic; in general, with Newton\'s method). The exact value is $y(' + td(hq) + ') = ' + tq(yq0.div(q(1).add(yq0.mul(hq)))) + '$.'],
      hint: 'Write the equation for y₁ and solve the quadratic.', _d: { k: kind, h: hq.toPlain(), y0: yq0.toPlain(), v: yq1.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.multistep
  G('num.multistep', function (R, ctx) {
    var kind = lv(ctx, R.pick(['ab2given', 'start']), R.pick(['ab2ode', 'evals', 'ab2given']), R.pick(['ab2two', 'ab2ode', 'exact']));
    if (kind === 'start') {
      var k = R.int(2, 5);
      return {
        q: 'The ' + k + '-step Adams–Bashforth method computes $y_{n+1}$ from $f_n, f_{n-1}, \\ldots, f_{n-' + (k - 1) + '}$. Besides $y_0$, how many starting values must be found by a one-step method (such as RK4) before it can run?',
        a: num(k - 1, { form: 'int' }),
        steps: ['The first use of the formula needs $y_0, \\ldots, y_{' + (k - 1) + '}$ (and their slopes).', '$y_0$ is given, so $' + (k - 1) + '$ more must come from a one-step method of matching accuracy.'],
        hint: 'Count how many earlier slopes the formula reaches back for.', _d: { k: kind, n: k }
      };
    }
    if (kind === 'ab2given') {
      var h = R.pick([q('0.1'), q('0.2'), q('0.5')]), y1 = q(R.int(-20, 40)).div(10), f0 = q(R.int(-20, 20)).div(10), f1 = q(R.int(-20, 20)).div(10), y2 = y1.add(h.div(2).mul(f1.mul(3).sub(f0)));
      return {
        q: 'Two-step Adams–Bashforth: $y_{n+1} = y_n + \\frac{h}{2}(3f_n - f_{n-1})$. With $h = ' + td(h) + '$, $y_1 = ' + td(y1) + '$, $f_0 = ' + td(f0) + '$ and $f_1 = ' + td(f1) + '$, find $y_2$.',
        a: num(y2),
        steps: ['$3f_1 - f_0 = 3(' + td(f1) + ') - ' + paren(f0) + ' = ' + td(f1.mul(3).sub(f0)) + '$.', '$y_2 = ' + td(y1) + ' + \\frac{' + td(h) + '}{2}(' + td(f1.mul(3).sub(f0)) + ') = ' + td(y2) + '$.', 'Only one new evaluation of $f$ is needed per step: $f_1$ is reused next time as the "old" slope.'],
        hint: 'Weights 3 on the newest slope and −1 on the one before, times h/2.', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, h: h.toPlain(), y1: y1.toPlain(), f0: f0.toPlain(), f1: f1.toPlain(), v: y2.toPlain() }
      };
    }
    if (kind === 'evals') {
      var N = R.pick([100, 200, 500, 1000]);
      return {
        q: 'To take ' + N + ' steps, RK4 evaluates $f$ four times per step. AB4 (four-step Adams–Bashforth) evaluates $f$ once per step after starting with 3 RK4 steps. How many evaluations of $f$ does AB4 use in all?',
        a: num(3 * 4 + (N - 3), { form: 'int' }),
        steps: ['Start-up: 3 RK4 steps, $3 \\times 4 = 12$ evaluations (giving $y_1, y_2, y_3$).', 'Then $' + (N - 3) + '$ AB4 steps with one new evaluation each.', 'Total: $12 + ' + (N - 3) + ' = ' + (N + 9) + '$, versus $' + 4 * N + '$ for RK4 alone, with the same order of accuracy, 4.'],
        hint: 'Count the start-up steps and the multistep steps separately.', _d: { k: kind, N: N }
      };
    }
    // ODE-based: y' = f(t, y)
    var ode = R.pick([['t - y', function (t, y) { return t.sub(y); }], ['-2y', function (t, y) { return y.mul(-2); }], ['t + y', function (t, y) { return t.add(y); }], ['2t + 1', function (t) { return t.mul(2).add(1); }]]);
    if (kind === 'exact') ode = R.pick([['2t + 1', function (t) { return t.mul(2).add(1); }, [0, 1, 1]], ['4t - 2', function (t) { return t.mul(4).sub(2); }, [0, -2, 2]], ['3 - 2t', function (t) { return q(3).sub(t.mul(2)); }, [0, 3, -1]]]);
    var hh = R.pick([q('0.1'), q('0.5'), q('0.2')]), Y0 = q(R.int(ode[0] === '-2y' ? 1 : 0, 3));
    var Y1 = kind === 'exact' ? Y0.add(pev(ode[2], hh)) : Y0.add(hh.mul(ode[1](q(0), Y0))).add(R.pick([q(0), q('0.01'), q('-0.02')]));
    var t0 = q(0), t1 = hh, fa = ode[1](t0, Y0), fb = ode[1](t1, Y1), Y2 = Y1.add(hh.div(2).mul(fb.mul(3).sub(fa)));
    var st = ['$f_0 = f(0, ' + td(Y0) + ') = ' + td(fa) + '$ and $f_1 = f(' + td(t1) + ', ' + td(Y1) + ') = ' + td(fb) + '$.', '$y_2 = y_1 + \\frac{h}{2}(3f_1 - f_0) = ' + td(Y1) + ' + \\frac{' + td(hh) + '}{2}(' + td(fb.mul(3).sub(fa)) + ') = ' + td(Y2) + '$.'];
    if (kind === 'ab2ode') return {
      q: 'Use two-step Adams–Bashforth on $y\' = ' + ode[0] + '$ with $h = ' + td(hh) + '$, starting values $y_0 = ' + td(Y0) + '$ and $y_1 = ' + td(Y1) + '$ (at $t_1 = ' + td(t1) + '$). Find $y_2$.',
      a: num(Y2), steps: st,
      hint: 'Compute f₀ and f₁ from the equation, then use (h/2)(3f₁ − f₀).', nolint: ['+ -', '--'], _d: { k: kind, ode: ode[0], h: hh.toPlain(), y0: Y0.toPlain(), y1: Y1.toPlain(), n: 2 }
    };
    if (kind === 'exact') {
      var ex = Y0.add(pev(ode[2], hh.mul(2)));
      return {
        q: 'Use two-step Adams–Bashforth on $y\' = ' + ode[0] + '$, $y(0) = ' + td(Y0) + '$, with $h = ' + td(hh) + '$ and the exact starting value $y_1 = ' + td(Y1) + '$. Find $y_2$, and compare it with the exact $y(' + td(hh.mul(2)) + ')$.',
        a: num(Y2), steps: st.concat(['Exact: $y = ' + td(Y0) + ' + ' + ptex(ode[2], 't').replace(/^-/, '(-') + (ptex(ode[2], 't')[0] === '-' ? ')' : '') + '$ gives $y(' + td(hh.mul(2)) + ') = ' + td(ex) + '$: the same. AB2 integrates the line through the last two slopes, so it is exact when $f$ is linear in $t$ alone.']),
        hint: 'Compute f₀ and f₁, then (h/2)(3f₁ − f₀).', nolint: ['+ -', '--'], _d: { k: kind, ode: ode[0], h: hh.toPlain(), y0: Y0.toPlain(), y1: Y1.toPlain(), n: 2 }
      };
    }
    var t2 = hh.mul(2), fc = ode[1](t2, Y2), Y3 = Y2.add(hh.div(2).mul(fc.mul(3).sub(fb)));
    return {
      q: 'Use two-step Adams–Bashforth on $y\' = ' + ode[0] + '$ with $h = ' + td(hh) + '$, $y_0 = ' + td(Y0) + '$ and $y_1 = ' + td(Y1) + '$. Find $y_3$.',
      a: num(Y3), steps: st.concat(['$f_2 = f(' + td(t2) + ', ' + td(Y2) + ') = ' + td(fc) + '$, so $y_3 = ' + td(Y2) + ' + \\frac{' + td(hh) + '}{2}(3(' + td(fc) + ') - ' + paren(fb) + ') = ' + td(Y3) + '$.']),
      hint: 'After y₂, slide the window: use f₂ and f₁.', nolint: ['+ -', '--'], _d: { k: kind, ode: ode[0], h: hh.toPlain(), y0: Y0.toPlain(), y1: Y1.toPlain(), n: 3 }
    };
  });

  // ---------------------------------------------------------------- num.bvp-finite-differences
  G('num.bvp-finite-differences', function (R, ctx) {
    var kind = lv(ctx, R.pick(['rhs', 'matrix']), R.pick(['solve', 'rhs', 'matrix']), R.pick(['solve', 'solvek']));
    var al = R.int(-3, 4), be = R.int(-3, 5), N = kind === 'solve' || kind === 'solvek' ? 3 : 4, h = Q(1, N), fc = [R.int(-6, 6), R.int(-6, 6)], kk = R.pick([1, 2, 4, 9]);
    var xs = []; for (var i = 1; i < N; i++) xs.push(h.mul(i));
    var fx = xs.map(function (x) { return pev(fc, x); }), withK = kind === 'matrix' || kind === 'solvek';
    var eqTex = 'y\'\'' + (withK ? ' - ' + (kk === 1 ? '' : kk) + 'y' : '') + ' = ' + ptex(fc), bc = 'y(0) = ' + al + ',\\ y(1) = ' + be;
    var dg = q(-2).sub(withK ? h.mul(h).mul(kk) : 0), Am = xs.map(function (_, r) { return xs.map(function (_, c) { return r === c ? dg : Math.abs(r - c) === 1 ? q(1) : q(0); }); });
    var rhs = fx.map(function (f, r) { var v = h.mul(h).mul(f); if (r === 0) v = v.sub(al); if (r === xs.length - 1) v = v.sub(be); return v; });
    var st = ['Grid: $h = ' + tq(h) + '$, inside points $' + xs.map(tq).join(', ') + '$; the unknowns are $y_1, \\ldots, y_{' + (N - 1) + '}$, while $y_0 = ' + al + '$ and $y_' + N + ' = ' + be + '$ are known.', 'At each inside point: $y_{i-1} ' + (withK ? '+ (-2 - ' + tq(h.mul(h).mul(kk)) + ')y_i' : '- 2y_i') + ' + y_{i+1} = h^{2}f(x_i) = ' + tq(h.mul(h)) + 'f(x_i)$.', 'Move the known boundary values to the right side: subtract $' + paren(al) + '$ in the first equation and $' + paren(be) + '$ in the last.'];
    if (kind === 'rhs') return {
      q: 'Solve $y\'\' = ' + ptex(fc) + '$, $' + bc + '$ by finite differences with $h = ' + tq(h) + '$. The system is $A\\mathbf{y} = \\mathbf{r}$ for $(y_1, y_2, y_3)$, where row $i$ comes from $y_{i-1} - 2y_i + y_{i+1} = h^{2}f(x_i)$. Find the right side $\\mathbf{r}$.',
      a: tup(rhs), steps: st.concat(['$\\mathbf{r} = ' + texVf(rhs) + '$.']),
      hint: 'h²f(xᵢ) in each row, minus the known boundary value in the first and last rows.', nolint: ['+ -', '--'], _d: { k: kind, fc: fc, al: al, be: be, N: N }
    };
    if (kind === 'matrix') return {
      q: 'For $' + eqTex + '$, $' + bc + '$, with $h = ' + tq(h) + '$, replace $y\'\'$ by $\\frac{y_{i-1} - 2y_i + y_{i+1}}{h^{2}}$ and multiply through by $h^{2}$. Find the $3 \\times 3$ matrix $A$ of the system for $(y_1, y_2, y_3)$.',
      a: matA(Am), steps: st.slice(0, 2).concat(['Each row has $1$, $' + tq(dg) + '$, $1$ around the diagonal: a tridiagonal matrix $' + T.mat(Am.map(function (r) { return r.map(function (v) { return tq(v); }); })) + '$.']),
      hint: 'The y term moves to the left: −2 − k·h² on the diagonal, 1 beside it.', nolint: ['+ -', '--'], _d: { k: kind, kk: kk, N: N }
    };
    var sol = solve(Am, rhs);
    return {
      q: 'Use finite differences with $h = ' + tq(h) + '$ to solve $' + eqTex + '$, $' + bc + '$. Give $(y_1, y_2)$, the approximations at $x = \\frac{1}{3}$ and $x = \\frac{2}{3}$.',
      a: tup(sol),
      steps: st.concat(['System: $' + T.mat(Am.map(function (r) { return r.map(function (v) { return tq(v); }); })) + '\\begin{bmatrix} y_1 \\\\ y_2 \\end{bmatrix} = ' + T.col(rhs.map(tq)) + '$.', 'Solving: $(y_1, y_2) = ' + texVf(sol) + '$.']),
      hint: 'Two equations, two unknowns; remember the boundary values belong on the right side.', nolint: ['+ -', '--'], _d: { k: kind, fc: fc, al: al, be: be, kk: withK ? kk : 0 }
    };
  });

  // ---------------------------------------------------------------- num.heat-explicit
  G('num.heat-explicit', function (R, ctx) {
    var kind = lv(ctx, R.pick(['r', 'dtmax']), R.pick(['step', 'refine', 'r']), R.pick(['row', 'amp', 'step']));
    if (kind === 'r') {
      var k = R.pick([q(1), q('0.5'), q(2), q('0.1')]), dx = R.pick([q('0.1'), q('0.2'), q('0.05'), q('0.25')]), dt = R.pick([q('0.001'), q('0.002'), q('0.005'), q('0.01'), q('0.004'), q('0.02')]), r = k.mul(dt).div(dx.mul(dx)), ok = r.le(Q(1, 2));
      return {
        q: 'The explicit scheme for $u_t = ' + (k.eq(1) ? '' : td(k)) + 'u_{xx}$ uses $\\Delta x = ' + td(dx) + '$ and $\\Delta t = ' + td(dt) + '$. Find $r = \\frac{k\\Delta t}{\\Delta x^{2}}$, and say whether the scheme is stable.',
        a: multi([{ label: '$r =$', a: num(r) }, { label: 'stable?', a: mcKeep(['stable (r ≤ 1/2)', 'unstable (r > 1/2)'], ok ? 0 : 1) }]),
        steps: ['$r = \\frac{' + td(k) + ' \\times ' + td(dt) + '}{(' + td(dx) + ')^{2}} = ' + td(r) + '$.', ok ? '$r \\le \\frac{1}{2}$: stable.' : '$r > \\frac{1}{2}$: a sawtooth error grows each step; unstable.'],
        hint: 'Compute r and compare it with 1/2.', _d: { k: kind, kk: k.toPlain(), dx: dx.toPlain(), dt: dt.toPlain() }
      };
    }
    if (kind === 'dtmax' || kind === 'refine') {
      var k2 = R.pick([q(1), q('0.5'), q(2), q(4)]), dx2 = R.pick([q('0.1'), q('0.2'), q('0.05')]), dtm = dx2.mul(dx2).div(k2.mul(2));
      if (kind === 'dtmax') return {
        q: 'For $u_t = ' + (k2.eq(1) ? '' : td(k2)) + 'u_{xx}$ with $\\Delta x = ' + td(dx2) + '$, what is the largest $\\Delta t$ the explicit scheme allows ($r \\le \\frac{1}{2}$)?',
        a: num(dtm),
        steps: ['$\\frac{k\\Delta t}{\\Delta x^{2}} \\le \\frac{1}{2}$ gives $\\Delta t \\le \\frac{\\Delta x^{2}}{2k}$.', '$\\frac{(' + td(dx2) + ')^{2}}{2 \\times ' + td(k2) + '} = ' + td(dtm) + '$.'],
        hint: 'Solve kΔt/Δx² ≤ 1/2 for Δt.', _d: { k: kind, kk: k2.toPlain(), dx: dx2.toPlain(), v: dtm.toPlain() }
      };
      var f = R.pick([2, 4]);
      return {
        q: 'A stable explicit heat computation uses $\\Delta x = ' + td(dx2) + '$ and $\\Delta t = ' + td(dtm) + '$ (so $r = \\frac{1}{2}$). To refine the grid to $\\Delta x = ' + td(dx2.div(f)) + '$, what is the largest $\\Delta t$ that keeps it stable?',
        a: num(dtm.div(f * f)),
        steps: ['$r = \\frac{k\\Delta t}{\\Delta x^{2}}$ must stay at most $\\frac{1}{2}$.', 'Dividing $\\Delta x$ by ' + f + ' divides $\\Delta x^{2}$ by ' + f * f + ', so $\\Delta t$ must shrink by ' + f * f + ' too: $' + td(dtm) + ' \\div ' + f * f + ' = ' + td(dtm.div(f * f)) + '$.', 'So refining space by ' + f + ' multiplies the number of time steps by ' + f * f + ' (and the work by ' + f * f * f + ').'],
        hint: 'Δt must scale like Δx².', _d: { k: kind, f: f, dt: dtm.toPlain(), v: dtm.div(f * f).toPlain() }
      };
    }
    if (kind === 'amp') {
      var r2 = R.pick([q('0.25'), q('0.4'), q('0.5'), q('0.6'), q('0.75'), q(1)]), g = q(1).sub(r2.mul(4));
      return {
        q: 'In the explicit heat scheme, the sawtooth pattern $u_i = (-1)^{i}$ is multiplied each step by $1 - 4r$. For $r = ' + td(r2) + '$, what is that factor?',
        a: num(g),
        steps: ['For $u_i = (-1)^{i}$: $u_{i+1} - 2u_i + u_{i-1} = -4u_i$, so $u_i^{n+1} = (1 - 4r)u_i^{n}$.', '$1 - 4(' + td(r2) + ') = ' + td(g) + '$.', g.abs().le(1) ? '$|' + td(g) + '| \\le 1$: the sawtooth does not grow.' : '$|' + td(g) + '| > 1$: the sawtooth grows and flips sign every step; this is why $r \\le \\frac{1}{2}$ is needed.'],
        hint: 'Put u_i = (−1)^i into the update.', _d: { k: kind, r: r2.toPlain(), v: g.toPlain() }
      };
    }
    var r3 = R.pick([q('0.25'), q('0.4'), q('0.5'), q('0.2'), Q(1, 3)]), u = [0, R.int(1, 9), R.int(1, 9), R.int(1, 9), R.int(1, 9), 0].map(q);
    var nu = u.map(function (v, i) { return i === 0 || i === 5 ? q(0) : v.add(r3.mul(u[i + 1].sub(v.mul(2)).add(u[i - 1]))); });
    if (kind === 'step') { var j = R.int(1, 4); return {
      q: 'The explicit scheme $u_i^{n+1} = u_i^{n} + r(u_{i+1}^{n} - 2u_i^{n} + u_{i-1}^{n})$ runs with $r = ' + tq(r3) + '$. The current row is $u = (' + u.map(td).join(', ') + ')$ for $i = 0, \\ldots, 5$ (the ends are held at 0). Find the new $u_' + j + '$.',
      a: num(nu[j]),
      steps: ['$u_' + j + '^{n+1} = ' + td(u[j]) + ' + ' + tq(r3) + '(' + td(u[j + 1]) + ' - 2(' + td(u[j]) + ') + ' + td(u[j - 1]) + ') = ' + tq(nu[j]) + '$.', 'Each new value is a weighted average of three old ones when $r \\le \\frac{1}{2}$ (all weights $r$, $1 - 2r$, $r$ are nonnegative), so the profile smooths out.'],
      hint: 'Use the old values on both neighbors and on the point itself.', nolint: ['+ 0'], _d: { k: kind, r: r3.toPlain(), u: u.map(function (v) { return v.toPlain(); }), j: j }
    }; }
    return {
      q: 'Run one step of $u_i^{n+1} = u_i^{n} + r(u_{i+1}^{n} - 2u_i^{n} + u_{i-1}^{n})$ with $r = ' + tq(r3) + '$ on the row $u = (' + u.map(td).join(', ') + ')$, $i = 0, \\ldots, 5$, with the ends held at 0. Give the new inside values $(u_1, u_2, u_3, u_4)$.',
      a: tup(nu.slice(1, 5)),
      steps: [1, 2, 3, 4].map(function (i) { return '$u_' + i + ' = ' + td(u[i]) + ' + ' + tq(r3) + '(' + td(u[i + 1]) + ' - ' + td(u[i].mul(2)) + ' + ' + td(u[i - 1]) + ') = ' + tq(nu[i]) + '$'; }).concat(['All four use the old row only; that is what makes the scheme explicit.']),
      hint: 'Compute each new value from the old row; do not use new values you have just found.', nolint: ['+ 0'], _d: { k: 'row', r: r3.toPlain(), u: u.map(function (v) { return v.toPlain(); }) }
    };
  });

  // =====================================================================================================
  // Unit 7: Least Squares and Eigenvalues
  // =====================================================================================================
  // ---------------------------------------------------------------- num.least-squares-qr
  function qrCase(R) { // a 4 x 2 matrix A = QR with orthonormal columns of entries ±1/2
    var cols = R.pick([[[1, 1, 1, 1], [1, -1, 1, -1]], [[1, 1, 1, 1], [-1, -1, 1, 1]], [[1, 1, 1, 1], [1, -1, -1, 1]], [[1, -1, 1, -1], [1, 1, -1, -1]]]);
    var Qm = [0, 1, 2, 3].map(function (i) { return [Q(cols[0][i], 2), Q(cols[1][i], 2)]; });
    var Rm = [[q(R.pick([2, 4, 6])), q(R.int(-4, 4) * 2)], [q(0), q(R.pick([2, 4, -2]))]];
    var A = mmul(Qm, Rm), b = [0, 1, 2, 3].map(function () { return q(R.int(-4, 6)); });
    var Qtb = [0, 1].map(function (j) { return Qm.reduce(function (s, r, i) { return s.add(r[j].mul(b[i])); }, q(0)); });
    var x = solve(Rm, Qtb);
    return { Q: Qm, R: Rm, A: A, b: b, Qtb: Qtb, x: x };
  }
  G('num.least-squares-qr', function (R, ctx) {
    var kind = lv(ctx, R.pick(['kappa', 'why']), R.pick(['qtb', 'solve', 'kappa']), R.pick(['solve', 'resid']));
    if (kind === 'kappa') {
      var k = R.int(3, 8);
      return {
        q: 'A least-squares problem has $\\kappa_2(A) = 10^{' + k + '}$. About how many significant digits can be lost to round-off (in double precision) if we solve the normal equations $A^{T}A\\mathbf{x} = A^{T}\\mathbf{b}$ instead of using QR?',
        a: num(2 * k, { form: 'int' }),
        steps: ['$\\kappa_2(A^{T}A) = \\kappa_2(A)^{2} = 10^{' + 2 * k + '}$.', 'Each factor of 10 in the condition number can cost about one digit, so up to about ' + 2 * k + ' of the 16 digits.', 'QR works with $A$ itself: the loss is closer to ' + k + ' digits (for problems with a small residual).'],
        hint: 'Forming AᵀA squares the condition number.', _d: { k: kind, n: k }
      };
    }
    if (kind === 'why') return {
      q: 'Why do numerical libraries solve least-squares problems with $A = QR$ (then $R\\mathbf{x} = Q^{T}\\mathbf{b}$) rather than with the normal equations $A^{T}A\\mathbf{x} = A^{T}\\mathbf{b}$?',
      a: mc('Forming $A^{T}A$ squares the condition number, so digits are lost when $A$ is ill-conditioned', ['The normal equations give a different answer, even in exact arithmetic', '$A^{T}A$ is never invertible', 'QR needs fewer operations in every case']),
      steps: ['In exact arithmetic both give the same least-squares solution.', 'In floating point, $\\kappa(A^{T}A) = \\kappa(A)^{2}$: if $\\kappa(A) = 10^{6}$, the normal equations face $10^{12}$ and can lose 12 digits.', 'Multiplying by an orthogonal $Q^{T}$ does not change lengths, so QR keeps the conditioning of $A$.'],
      hint: 'Compare κ(AᵀA) with κ(A).', _d: { k: kind }
    };
    var C = qrCase(R);
    var given = '$$Q = ' + T.mat(C.Q.map(function (r) { return r.map(tq); })) + ',\\ R = ' + texM(C.R) + ',\\ \\mathbf{b} = ' + texCol(C.b) + '.$$';
    var s1 = '$Q^{T}\\mathbf{b}$: each entry is a column of $Q$ dotted with $\\mathbf{b}$, giving $' + texVf(C.Qtb) + '$.';
    if (kind === 'qtb') return {
      q: 'A $4 \\times 2$ matrix has the factorization $A = QR$ (the columns of $Q$ are orthonormal) with' + given + 'The least-squares solution solves $R\\mathbf{x} = Q^{T}\\mathbf{b}$. First find $Q^{T}\\mathbf{b}$.',
      a: tup(C.Qtb), steps: [s1],
      hint: 'Dot each column of Q with b.', _d: { k: kind, Q: C.Q.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), R: C.R.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), b: C.b.map(function (v) { return v.toPlain(); }) }
    };
    var s2 = 'Back substitution in $R\\mathbf{x} = Q^{T}\\mathbf{b}$: $x_2 = ' + tq(C.x[1]) + '$, then $x_1 = ' + tq(C.x[0]) + '$.';
    if (kind === 'solve') return {
      q: 'A $4 \\times 2$ matrix has $A = QR$ with' + given + 'Find the least-squares solution of $A\\mathbf{x} = \\mathbf{b}$.',
      a: tup(C.x), steps: [s1, s2, 'This is the same $\\mathbf{x}$ the normal equations give, found without ever forming $A^{T}A$.'],
      hint: 'Compute Qᵀb, then solve the triangular system Rx = Qᵀb.', _d: { k: kind, Q: C.Q.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), R: C.R.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), b: C.b.map(function (v) { return v.toPlain(); }) }
    };
    var bb = C.b.reduce(function (s, v) { return s.add(v.mul(v)); }, q(0)), qq = C.Qtb.reduce(function (s, v) { return s.add(v.mul(v)); }, q(0)), res = bb.sub(qq);
    return {
      q: 'A $4 \\times 2$ matrix has $A = QR$ with' + given + 'The squared size of the least-squares residual is $\\lVert\\mathbf{b} - A\\hat{\\mathbf{x}}\\rVert_2^{2} = \\lVert\\mathbf{b}\\rVert_2^{2} - \\lVert Q^{T}\\mathbf{b}\\rVert_2^{2}$. Find it.',
      a: num(res),
      steps: [s1, '$\\lVert\\mathbf{b}\\rVert_2^{2} = ' + td(bb) + '$ and $\\lVert Q^{T}\\mathbf{b}\\rVert_2^{2} = ' + tq(qq) + '$.', 'Residual: $' + td(bb) + ' - ' + tq(qq) + ' = ' + tq(res) + '$. (Pythagoras: $\\mathbf{b}$ splits into its part in the column space, of size $\\lVert Q^{T}\\mathbf{b}\\rVert$, and the residual, perpendicular to it.)'],
      hint: 'Sum of squares of b, minus the sum of squares of Qᵀb.', _d: { k: 'resid', Q: C.Q.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), R: C.R.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), b: C.b.map(function (v) { return v.toPlain(); }) }
    };
  });

  // ---------------------------------------------------------------- num.power-method
  function eig2(R) { // integer 2 x 2 matrix with integer eigenvalues l1 > |l2| > 0: A = P diag P^-1 with det P = ±1
    for (var t = 0; t < 60; t++) {
      var l1 = R.int(3, 7), l2 = R.pick([1, 2, -1, -2, 3]); if (Math.abs(l2) >= l1) continue;
      var P = R.pick([[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[2, 1], [1, 1]], [[1, 1], [1, 2]], [[1, -1], [0, 1]], [[1, 2], [1, 3]]]);
      var Pi = inv2(P), A = mmul(mmul(P, [[l1, 0], [0, l2]]), Pi);
      if (A.every(function (r) { return r.every(function (v) { return v.isInt() && v.abs().le(12); }); })) return { A: A, l1: l1, l2: l2, v1: [P[0][0], P[1][0]] };
    }
    return { A: [[q(4), q(1)], [q(2), q(3)]], l1: 5, l2: 2, v1: [1, 1] };
  }
  function scaleInf(v) { var m = v.reduce(function (b, x) { return x.abs().gt(b.abs()) ? x : b; }, q(0)); return { v: v.map(function (x) { return x.div(m); }), m: m }; }
  G('num.power-method', function (R, ctx) {
    var kind = lv(ctx, R.pick(['step', 'step', 'fail']), R.pick(['two', 'rate', 'step']), R.pick(['rayleigh', 'rate', 'two']));
    if (kind === 'step' || kind === 'two') {
      var E = eig2(R), x0 = [q(1), q(0)]; if (R.coin()) x0 = [q(1), q(1)];
      var Ax0 = mv(E.A, x0); if (Ax0[0].mul(x0[1]).sub(Ax0[1].mul(x0[0])).isZero()) x0 = x0[1].isZero() ? [q(0), q(1)] : [q(1), q(0)]; // not an eigenvector
      var y1 = mv(E.A, x0), s1 = scaleInf(y1), y2 = mv(E.A, s1.v), s2 = scaleInf(y2);
      var st = ['$A\\mathbf{x}_0 = ' + texVf(y1) + '$. Divide by its entry of largest size, $' + tq(s1.m) + '$: $\\mathbf{x}_1 = ' + texVf(s1.v) + '$.'];
      if (kind === 'step') return {
        q: 'Do one step of the power method on $A = ' + texM(E.A) + '$ from $\\mathbf{x}_0 = ' + texVf(x0) + '$, scaling so that the entry of largest size is $1$. Give $\\mathbf{x}_1$ and the scale factor $\\mu_1$ (the entry you divided by).',
        a: multi([{ label: '$\\mathbf{x}_1 =$', a: tup(s1.v) }, { label: '$\\mu_1 =$', a: num(s1.m) }]),
        steps: st.concat(['The scale factors approach the dominant eigenvalue, $' + E.l1 + '$, and the vectors approach its eigenvector direction $' + texVf(E.v1) + '$.']),
        hint: 'Multiply by A, then divide by the largest entry in size (keeping its sign).', _d: { k: kind, A: E.A.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), x0: x0.map(function (v) { return v.toPlain(); }) }
      };
      st.push('$A\\mathbf{x}_1 = ' + texVf(y2) + '$; divide by $' + tq(s2.m) + '$: $\\mathbf{x}_2 = ' + texVf(s2.v) + '$.');
      return {
        q: 'Do two steps of the power method on $A = ' + texM(E.A) + '$ from $\\mathbf{x}_0 = ' + texVf(x0) + '$, scaling each time so that the entry of largest size is $1$. Give $\\mathbf{x}_2$.',
        a: tup(s2.v),
        steps: st.concat(['The scale factors $' + tq(s1.m) + ', ' + tq(s2.m) + ', \\ldots$ approach the dominant eigenvalue $' + E.l1 + '$; the error shrinks by about $|\\lambda_2/\\lambda_1| = ' + tq(Q(Math.abs(E.l2), E.l1)) + '$ per step.']),
        hint: 'Multiply, scale, and repeat.', _d: { k: kind, A: E.A.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), x0: x0.map(function (v) { return v.toPlain(); }) }
      };
    }
    if (kind === 'fail') {
      var lam = R.pick([2, 3, 5]);
      return {
        q: 'A matrix has eigenvalues $' + lam + '$, $-' + lam + '$ and $1$. What happens when the power method is run on it from a typical starting vector?',
        a: mc('The vectors never settle: the two equally large eigenvalues keep trading places', ['It converges to the eigenvector for $' + lam + '$', 'It converges to the eigenvector for $1$', 'It converges, but slowly, at rate $\\frac{1}{' + lam + '}$']),
        steps: ['The power method needs one eigenvalue strictly larger in size than all the others.', 'Here $|' + lam + '| = |-' + lam + '|$: both parts grow at the same rate, and the $-' + lam + '$ part flips sign each step, so the iterates alternate between two directions.'],
        hint: 'Compare |λ₁| and |λ₂|.', _d: { k: kind }
      };
    }
    if (kind === 'rate') {
      var l1 = R.pick([2, 4, 5, 10, 3]), l2 = R.pick([1, 2, -1, 4, 9].filter(function (v) { return Math.abs(v) < l1; })), m = R.int(3, 8), r = Q(Math.abs(l2), l1), n = 0;
      while (r.pow(n).gt(pow10(-m))) n++;
      return {
        q: 'The power method is used on a matrix whose two largest eigenvalues (in size) are $' + l1 + '$ and $' + l2 + '$. The error shrinks by about $|\\lambda_2/\\lambda_1|$ each step. About how many steps reduce it by a factor of $10^{' + m + '}$?',
        a: num(n, { form: 'int' }),
        steps: ['$|\\lambda_2/\\lambda_1| = ' + tq(r) + '$.', 'We need $\\left(' + tq(r) + '\\right)^{n} \\le 10^{-' + m + '}$: $n \\ge \\frac{' + m + '}{\\log_{10}(' + tq(r.inv()) + ')} \\approx ' + (m / Math.log10(r.inv().toNumber())).toFixed(2) + '$.', 'So $n = ' + n + '$. When $|\\lambda_2|$ is close to $|\\lambda_1|$ the method crawls; a shift or inverse iteration helps.'],
        hint: 'Solve (|λ₂/λ₁|)ⁿ ≤ 10^(−m) with logarithms.', _d: { k: kind, l1: l1, l2: l2, m: m, v: n }
      };
    }
    // rayleigh quotient of a symmetric matrix
    var a = R.int(1, 6), b = R.nz(-3, 3), c = R.int(1, 6), x = [q(R.nz(-3, 3)), q(R.nz(-3, 3))], A = [[a, b], [b, c]], Ax = mv(A, x), rq = x[0].mul(Ax[0]).add(x[1].mul(Ax[1])).div(x[0].mul(x[0]).add(x[1].mul(x[1])));
    return {
      q: 'The power method on the symmetric matrix $A = ' + texM(A) + '$ has reached $\\mathbf{x} = ' + texVf(x) + '$. Estimate the eigenvalue with the Rayleigh quotient $\\frac{\\mathbf{x}^{T}A\\mathbf{x}}{\\mathbf{x}^{T}\\mathbf{x}}$.',
      a: num(rq),
      steps: ['$A\\mathbf{x} = ' + texVf(Ax) + '$.', '$\\mathbf{x}^{T}A\\mathbf{x} = ' + tq(x[0].mul(Ax[0]).add(x[1].mul(Ax[1]))) + '$ and $\\mathbf{x}^{T}\\mathbf{x} = ' + tq(x[0].mul(x[0]).add(x[1].mul(x[1]))) + '$.', 'Quotient: $' + tq(rq) + '$. For symmetric matrices its error is about the square of the vector\'s error, so it is a sharper estimate than the scale factor.'],
      hint: 'Compute Ax, then two dot products.', _d: { k: 'rayleigh', A: A, x: x.map(function (v) { return v.toPlain(); }), v: rq.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.inverse-iteration
  G('num.inverse-iteration', function (R, ctx) {
    var kind = lv(ctx, R.pick(['recover', 'which']), R.pick(['recover', 'rate', 'which']), R.pick(['step', 'rate', 'recover']));
    if (kind === 'recover') {
      var s = q(R.int(-3, 8)), mu = R.pick([q(4), q(-2), q(10), q('0.5'), q(-5), q(20), q('2.5')]), lam = s.add(mu.inv());
      return {
        q: 'Shifted inverse iteration with shift $s = ' + td(s) + '$ runs the power method on $(A - sI)^{-1}$, and its estimates settle at $\\mu = ' + td(mu) + '$. Which eigenvalue of $A$ has it found?',
        a: num(lam),
        steps: ['If $A\\mathbf{v} = \\lambda\\mathbf{v}$, then $(A - sI)^{-1}\\mathbf{v} = \\frac{1}{\\lambda - s}\\mathbf{v}$: so $\\mu = \\frac{1}{\\lambda - s}$.', 'Solve: $\\lambda = s + \\frac{1}{\\mu} = ' + td(s) + ' + ' + parenF(mu.inv()) + ' = ' + td(lam) + '$.', 'Reporting $\\mu$ itself would be wrong: it is an eigenvalue of $(A - sI)^{-1}$, not of $A$.'],
        hint: 'μ = 1/(λ − s); solve for λ.', _d: { k: kind, s: s.toPlain(), mu: mu.toPlain(), v: lam.toPlain() }
      };
    }
    var ev = R.sample([-4, -1, 1, 2, 3, 5, 6, 8, 10], 3).sort(function (a, b) { return a - b; });
    var s2, d, order;
    for (var tt = 0; tt < 100; tt++) {
      s2 = q(R.int(-5, 11)).add(R.pick([0, Q(1, 2)]));
      d = ev.map(function (e) { return s2.sub(e).abs(); }); order = ev.map(function (_, i) { return i; }).sort(function (i, j) { return d[i].cmp(d[j]); });
      if (!d[order[0]].isZero() && d[order[0]].lt(d[order[1]])) break;
    }
    var best = ev[order[0]], next = ev[order[1]];
    if (kind === 'which') return {
      q: 'A matrix has eigenvalues $' + ev.join(', ') + '$. Inverse iteration with shift $s = ' + td(s2) + '$ converges to which eigenvalue?',
      a: num(best, { form: 'int' }),
      steps: ['$(A - sI)^{-1}$ has eigenvalues $\\frac{1}{\\lambda - s}$: ' + ev.map(function (e) { return '$\\frac{1}{' + paren(e) + ' - ' + paren(s2) + '} = ' + tq(q(1).div(q(e).sub(s2))) + '$'; }).join(', ') + '.', 'The largest in size comes from the $\\lambda$ closest to $s$: $\\lambda = ' + best + '$.'],
      hint: 'Which eigenvalue is closest to the shift?', nolint: ['+ -', '--', '+ 0'], _d: { k: kind, ev: ev, s: s2.toPlain(), v: best }
    };
    if (kind === 'rate') {
      var rt = s2.sub(best).abs().div(s2.sub(next).abs());
      return {
        q: 'A matrix has eigenvalues $' + ev.join(', ') + '$. Inverse iteration with shift $s = ' + td(s2) + '$ converges to the eigenvalue closest to $s$. By what factor does the error shrink each step?',
        a: num(rt),
        steps: ['The closest eigenvalue is $' + best + '$ (distance $' + td(s2.sub(best).abs()) + '$); the next closest is $' + next + '$ (distance $' + td(s2.sub(next).abs()) + '$).', 'The power method on $(A - sI)^{-1}$ converges at the ratio of its two largest eigenvalues in size, $\\frac{1}{' + td(s2.sub(next).abs()) + '}$ over $\\frac{1}{' + td(s2.sub(best).abs()) + '}$, which is $\\frac{' + td(s2.sub(best).abs()) + '}{' + td(s2.sub(next).abs()) + '} = ' + tq(rt) + '$.', 'A shift close to the target makes this ratio tiny: very fast convergence.'],
        hint: 'Ratio of the distances: closest over next closest.', nolint: ['+ -', '--'], _d: { k: kind, ev: ev, s: s2.toPlain(), v: rt.toPlain() }
      };
    }
    // step: one inverse-iteration step on a 2 x 2 matrix
    var E = eig2(R), sh = q(E.l1).sub(R.pick([Q(1, 2), q(1), Q(-1, 2)])), M2 = [[E.A[0][0].sub(sh), E.A[0][1]], [E.A[1][0], E.A[1][1].sub(sh)]];
    if (det2(M2).isZero()) sh = sh.add(Q(1, 4)), M2 = [[E.A[0][0].sub(sh), E.A[0][1]], [E.A[1][0], E.A[1][1].sub(sh)]];
    var x0 = [q(1), q(1)], y = solve(M2, x0), sc = scaleInf(y);
    return {
      q: 'Take one step of inverse iteration on $A = ' + texM(E.A) + '$ with shift $s = ' + td(sh) + '$ from $\\mathbf{x}_0 = (1, 1)$: solve $(A - sI)\\mathbf{y} = \\mathbf{x}_0$ (do not invert), then scale $\\mathbf{y}$ so its entry of largest size is $1$. Give the scaled vector.',
      a: tup(sc.v),
      steps: ['$A - sI = ' + T.mat(M2.map(function (r) { return r.map(tq); })) + '$.', 'Solving $(A - sI)\\mathbf{y} = (1, 1)$ gives $\\mathbf{y} = ' + texVf(y) + '$.', 'Divide by $' + tq(sc.m) + '$: $' + texVf(sc.v) + '$. It is already close to the eigenvector $' + texVf(E.v1) + '$ for $\\lambda = ' + E.l1 + '$, the eigenvalue nearest the shift.'],
      hint: 'Solve the 2 × 2 system for y, then divide by its entry of largest size.', _d: { k: 'step', A: E.A.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), s: sh.toPlain() }
    };
  });

  // ---------------------------------------------------------------- num.gershgorin
  G('num.gershgorin', function (R, ctx) {
    var kind = lv(ctx, R.pick(['radius', 'disk']), R.pick(['interval', 'nonsing', 'disk']), R.pick(['interval', 'bound', 'nonsing']));
    var n = 3, A = [];
    for (var i = 0; i < n; i++) { var r = []; for (var j = 0; j < n; j++) r.push(i === j ? R.int(-8, 10) : R.int(-3, 3)); A.push(r); }
    if (kind === 'interval') { for (i = 0; i < n; i++) for (j = 0; j < i; j++) A[i][j] = A[j][i]; }
    var rad = A.map(function (r, i) { return r.reduce(function (s, v, j) { return j === i ? s : s + Math.abs(v); }, 0); });
    var diskTxt = A.map(function (r, i) { return 'row ' + (i + 1) + ': center $' + r[i] + '$, radius $' + rad[i] + '$'; }).join('; ');
    if (kind === 'radius' || kind === 'disk') {
      var row = R.int(0, 2);
      if (kind === 'radius') return {
        q: 'Find the radius of the Gershgorin disk for row ' + (row + 1) + ' of $A = ' + texM(A) + '$.',
        a: num(rad[row], { form: 'int' }),
        steps: ['The disk for row ' + (row + 1) + ' is centered at the diagonal entry $a_{' + (row + 1) + (row + 1) + '} = ' + A[row][row] + '$.', 'Its radius adds the sizes of the <b>other</b> entries in that row: $' + A[row].filter(function (_, j) { return j !== row; }).map(function (v) { return '|' + v + '|'; }).join(' + ') + ' = ' + rad[row] + '$. The diagonal entry is not included.'],
        hint: 'Add the absolute values of the off-diagonal entries in that row.', _d: { k: kind, A: A, row: row }
      };
      return {
        q: 'Give the center and radius of the Gershgorin disk for row ' + (row + 1) + ' of $A = ' + texM(A) + '$.',
        a: multi([{ label: 'center:', a: num(A[row][row], { form: 'int' }) }, { label: 'radius:', a: num(rad[row], { form: 'int' }) }]),
        steps: ['Center: the diagonal entry, $' + A[row][row] + '$.', 'Radius: the sum of the other entries\' sizes in row ' + (row + 1) + ', $' + rad[row] + '$.', 'Every eigenvalue of $A$ lies in at least one of the three disks.'],
        hint: 'Center = diagonal entry; radius = sum of |other entries| in the row.', _d: { k: kind, A: A, row: row }
      };
    }
    if (kind === 'interval') {
      var lo = Math.min.apply(null, A.map(function (r, i) { return r[i] - rad[i]; })), hi = Math.max.apply(null, A.map(function (r, i) { return r[i] + rad[i]; }));
      return {
        q: 'The matrix $A = ' + texM(A) + '$ is symmetric, so its eigenvalues are real. Use Gershgorin disks to find the smallest interval $[L, U]$ guaranteed to contain all of them.',
        a: multi([{ label: '$L =$', a: num(lo, { form: 'int' }) }, { label: '$U =$', a: num(hi, { form: 'int' }) }]),
        steps: ['Disks: ' + diskTxt + '.', 'On the real line each disk is an interval $[c - r, c + r]$: ' + A.map(function (r, i) { return '$[' + (r[i] - rad[i]) + ', ' + (r[i] + rad[i]) + ']$'; }).join(', ') + '.', 'All eigenvalues lie in their union, which fits inside $[' + lo + ', ' + hi + ']$.'],
        hint: 'For each row, the interval is (diagonal − radius) to (diagonal + radius).', _d: { k: kind, A: A }
      };
    }
    if (kind === 'nonsing') {
      // make the outcome vary: sometimes strictly diagonally dominant
      if (R.coin()) for (i = 0; i < n; i++) { var off = A[i].reduce(function (s, v, j) { return j === i ? s : s + Math.abs(v); }, 0); A[i][i] = (off + R.int(1, 3)) * (R.coin() ? 1 : -1); }
      rad = A.map(function (r, i) { return r.reduce(function (s, v, j) { return j === i ? s : s + Math.abs(v); }, 0); });
      var excl = A.every(function (r, i) { return Math.abs(r[i]) > rad[i]; });
      return {
        q: 'True or false: Gershgorin\'s theorem by itself proves that $A = ' + texM(A) + '$ is invertible (that is, $0$ is not an eigenvalue).',
        a: tf(excl),
        steps: ['Disks: ' + A.map(function (r, i) { return 'row ' + (i + 1) + ': center $' + r[i] + '$, radius $' + rad[i] + '$'; }).join('; ') + '.', excl ? 'In every row $|a_{ii}|$ is bigger than the radius, so no disk contains $0$: $0$ cannot be an eigenvalue, and $A$ is invertible.' : 'At least one disk contains $0$, so the theorem cannot rule out the eigenvalue $0$. (It does not say $0$ is one, either.)'],
        hint: 'Check whether 0 lies in any disk: |center| ≤ radius?', _d: { k: kind, A: A, v: excl }
      };
    }
    var bd = Math.max.apply(null, A.map(function (r, i) { return Math.abs(r[i]) + rad[i]; }));
    return {
      q: 'Use Gershgorin disks to bound the largest size of any eigenvalue of $A = ' + texM(A) + '$: every $|\\lambda| \\le$ what?',
      a: num(bd, { form: 'int' }),
      steps: ['A point of the disk for row $i$ is at most $|a_{ii}| + r_i$ from $0$.', 'Rows: ' + A.map(function (r, i) { return '$' + Math.abs(r[i]) + ' + ' + rad[i] + ' = ' + (Math.abs(r[i]) + rad[i]) + '$'; }).join(', ') + '.', 'So $|\\lambda| \\le ' + bd + '$, which is the largest absolute row sum, $\\lVert A\\rVert_\\infty$.'],
      hint: 'For each row add |diagonal| and the radius; take the largest.', _d: { k: 'bound', A: A, v: bd }
    };
  });

  // ---------------------------------------------------------------- num.qr-algorithm
  function qrStep(R) { // A0 with first column a multiple of a Pythagorean pair, so Q and R are rational
    var pr = R.pick([[3, 4], [4, 3], [5, 12], [12, 5], [3, -4], [-3, 4], [6, 8], [8, 6]]), m = R.pick([1, 1, 2]), a = pr[0] * m, c = pr[1] * m;
    var r = Math.round(Math.sqrt(a * a + c * c)), b = R.int(-6, 8), d = R.int(-6, 8); if (a * d - b * c === 0) d++;
    var A = [[q(a), q(b)], [q(c), q(d)]], sg = a * d - b * c > 0 ? 1 : -1; // Gram-Schmidt: q2 points so that R has a positive diagonal
    var Qm = [[Q(a, r), Q(-c * sg, r)], [Q(c, r), Q(a * sg, r)]], Rm = mmul([[Qm[0][0], Qm[1][0]], [Qm[0][1], Qm[1][1]]], A);
    return { A: A, Q: Qm, R: Rm, A1: mmul(Rm, Qm) };
  }
  G('num.qr-algorithm', function (R, ctx) {
    var kind = lv(ctx, R.pick(['rq', 'mistake', 'trace']), R.pick(['rq', 'rate', 'trace']), R.pick(['full', 'full', 'rate']));
    if (kind === 'rq' || kind === 'full') {
      var S;
      for (var t = 0; t < 20; t++) { S = qrStep(R); if (S.R[1][1].d <= 25n && !S.R[1][1].isZero()) break; }
      var st = ['Multiply in the <b>reverse</b> order: $A_1 = R_0Q_0 = ' + T.mat(S.A1.map(function (r) { return r.map(tq); })) + '$.', 'Check: the trace is unchanged, $' + tq(S.A[0][0].add(S.A[1][1])) + '$, because $A_1 = Q_0^{T}A_0Q_0$ is similar to $A_0$.'];
      if (kind === 'rq') return {
        q: 'One step of the QR algorithm factors $A_0 = Q_0R_0$ with $$Q_0 = ' + T.mat(S.Q.map(function (r) { return r.map(tq); })) + ',\\quad R_0 = ' + T.mat(S.R.map(function (r) { return r.map(tq); })) + '.$$ Find $A_1$.',
        a: matA(S.A1), steps: st,
        hint: 'A₁ = R₀Q₀, not Q₀R₀.', _d: { k: kind, Q: S.Q.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }), R: S.R.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }) }
      };
      return {
        q: 'Take one step of the QR algorithm on $A_0 = ' + texM(S.A) + '$: factor $A_0 = Q_0R_0$ (Gram–Schmidt on the columns, with $R_0$ having a positive diagonal), then form $A_1 = R_0Q_0$.',
        a: matA(S.A1),
        steps: ['First column $(' + td(S.A[0][0]) + ', ' + td(S.A[1][0]) + ')$ has length $' + td(S.R[0][0]) + '$, so $\\mathbf{q}_1 = ' + texVf([S.Q[0][0], S.Q[1][0]]) + '$; in 2-D, $\\mathbf{q}_2 = ' + texVf([S.Q[0][1], S.Q[1][1]]) + '$.', '$R_0 = Q_0^{T}A_0 = ' + T.mat(S.R.map(function (r) { return r.map(tq); })) + '$.'].concat(st),
        hint: 'Normalize the first column to get q₁, take q₂ perpendicular to it, then R₀ = Q₀ᵀA₀ and A₁ = R₀Q₀.', _d: { k: kind, A: S.A.map(function (r) { return r.map(function (v) { return v.toPlain(); }); }) }
      };
    }
    if (kind === 'trace') {
      var a = R.int(-5, 9), b = R.int(-5, 5), c = R.int(-5, 5), d = R.int(-5, 9), k = R.int(3, 20), ask = R.pick(['trace', 'det']);
      return {
        q: 'The QR algorithm starts from $A_0 = ' + texM([[a, b], [c, d]]) + '$. What is the ' + (ask === 'trace' ? 'trace' : 'determinant') + ' of $A_{' + k + '}$?',
        a: num(ask === 'trace' ? a + d : a * d - b * c, { form: 'int' }),
        steps: ['$A_{k+1} = R_kQ_k = Q_k^{T}(Q_kR_k)Q_k = Q_k^{T}A_kQ_k$: every $A_k$ is similar to $A_0$.', 'Similar matrices have the same eigenvalues, so the same trace (their sum) and determinant (their product).', ask === 'trace' ? 'Trace: $' + a + ' + ' + paren(d) + ' = ' + (a + d) + '$.' : 'Determinant: $' + a + ' \\cdot ' + paren(d) + ' - ' + paren(b) + ' \\cdot ' + paren(c) + ' = ' + (a * d - b * c) + '$.'],
        hint: 'Each step is a similarity transformation.', nolint: ['+ -', '--'], _d: { k: kind, A: [[a, b], [c, d]], ask: ask }
      };
    }
    if (kind === 'mistake') return {
      q: 'In one QR-algorithm step, $A_k = Q_kR_k$ is factored and the factors are multiplied back together. What happens if they are multiplied in the same order, $Q_kR_k$?',
      a: mc('You just get $A_k$ back, so nothing changes', ['You get $A_k^{T}$', 'You get the diagonal matrix of eigenvalues', 'It converges twice as fast']),
      steps: ['$Q_kR_k$ is the factorization itself, equal to $A_k$.', 'The step must be $A_{k+1} = R_kQ_k$, which equals $Q_k^{T}A_kQ_k$: a new matrix with the same eigenvalues, a little closer to triangular.'],
      hint: 'What is Q_k R_k by definition?', _d: { k: kind }
    };
    var l1 = R.pick([6, 8, 10, 9, 4]), l2 = R.pick([2, 3, 1, -2, -3].filter(function (v) { return Math.abs(v) < l1; })), e = q(R.pick(['0.9', '0.6', '1.2', '0.3', '2.4'])), rr = Q(Math.abs(l2), l1);
    return {
      q: 'The QR algorithm runs on a $2 \\times 2$ matrix with eigenvalues $' + l1 + '$ and $' + l2 + '$. The entry below the diagonal shrinks by about $|\\lambda_2/\\lambda_1|$ each step. If it is $' + td(e) + '$ now, estimate it after one more step.',
      a: num(e.mul(rr)),
      steps: ['$|\\lambda_2/\\lambda_1| = ' + tq(rr) + '$.', '$' + td(e) + ' \\times ' + tq(rr) + ' = ' + td(e.mul(rr)) + '$.', 'Meanwhile the diagonal entries approach $' + l1 + '$ and $' + l2 + '$. Practical codes add shifts to make this ratio tiny.'],
      hint: 'Multiply by |λ₂/λ₁|.', _d: { k: 'rate', l1: l1, l2: l2, e: e.toPlain() }
    };
  });

})(window.MathLadder);
