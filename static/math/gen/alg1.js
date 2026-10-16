/* Math Ladder problem generators: Algebra 1 (course key alg1).
   Built by /tmp/work_mlp9/build_gen.js from the unit sources in /tmp/work_mlp9/gen/ (one file per unit).
   Every topic has a generator that works at levels 1-3. Answers are computed from the generated numbers, and a
   node test (work dir) checks them independently: problems carry a hidden `chk` record only when ML.__alg1test is set. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, by = ML.byLevel;
  // Inline math never wraps, so a long inline formula would widen a phone screen. Every generator is registered through G,
  // which turns long inline math in the question, hint and steps into display math (display math scrolls on its own).
  function visLen(tex) {
    var t = tex.replace(/\\(left|right|,|;|quad|qquad|!)/g, '').replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, function (m, a, b) { return a.length > b.length ? a : b; })
      .replace(/\\text\{([^}]*)\}/g, '$1'), ops = (t.match(/[-+=<>]|\\(le|ge|cdot|times|pm|ne|approx)(?![a-z])/g) || []).length;
    return t.replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length + 0.7 * ops;
  }
  function displayLong(s, lim) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    var out = '', i = 0;
    while (i < s.length) {
      if (s[i] === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (s[i] === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (s[i] === '$') {
        var k = i + 1; while (k < s.length && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= s.length) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        out += visLen(tex) > lim && !/\\begin\{/.test(tex) ? '$$' + tex + '$$' : '$' + tex + '$';
        i = k + 1; continue;
      }
      out += s[i]; i++;
    }
    return out;
  }
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var p = fn(R, ctx);
      if (p && typeof p === 'object') { p.q = displayLong(p.q, 30); if (p.hint) p.hint = displayLong(p.hint, 30); if (Array.isArray(p.steps)) p.steps = p.steps.map(function (x) { return displayLong(x, 27); }); }
      return p;
    });
  }

  // ---------------------------------------------------------------- small helpers
  function out(p, chk) { if (ML.__alg1test && chk) p.chk = chk; return p; }
  function q(x) { return Q.from(x); }
  function fr(n, d) { return Q(n, d); }
  function pq(x) { return Q.from(x).toPlain(); }                 // plain: "-3/4"
  function pp(x) { var s = pq(x); return s[0] === '-' ? '(' + s + ')' : s; }   // plain, parenthesized when negative
  function tn(x) { return T.num(x); }                             // TeX number
  function tp(x) { return T.p(x); }                               // TeX number in parentheses when negative
  function abs(x) { return Math.abs(x); }
  function gcd(a, b) { return U.gcd(a, b); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function nf(x) { return U.numStr(U.fix(x)); }                  // a JS number as a clean string
  function money(x) { return T.money(x); }

  // plain-syntax sums of terms: [[coef, 'x^2'], [coef, 'x'], [coef, '']] -> "2x^2-3x+1"
  function pterms(list) {
    var s = '';
    list.forEach(function (t) {
      var c = Q.from(t[0]), v = t[1] || ''; if (c.isZero()) return;
      var neg = c.sign() < 0, a = c.abs(), mag;
      if (v) mag = a.eq(1) ? '' : (a.isInt() || /^[a-z]/i.test(v) ? a.toString() : '(' + a.toString() + ')');
      else mag = a.toString();
      if (v && mag && /^[\d(]/.test(v)) mag += '*';
      s += (s === '' ? (neg ? '-' : '') : (neg ? '-' : '+')) + mag + v;
    });
    return s || '0';
  }
  function ppoly(cs, v) { v = v || 'x'; var n = cs.length - 1; return pterms(cs.map(function (c, i) { var k = n - i; return [c, k === 0 ? '' : k === 1 ? v : v + '^' + k]; })); }
  function plin(a, b, v) { return pterms([[a, v || 'x'], [b, '']]); }
  function tlin(a, b, v) { return T.lin(a, v || 'x', b); }
  function tpoly(cs, v) { return T.poly(cs, v || 'x'); }
  // polynomial arithmetic on coefficient arrays, highest power first (numbers)
  function trim(p) { var i = 0; while (i < p.length - 1 && p[i] === 0) i++; return p.slice(i); }
  function padd(a, b) { var n = Math.max(a.length, b.length), r = []; for (var i = 0; i < n; i++) { var x = a[a.length - n + i] || 0, y = b[b.length - n + i] || 0; r.push(x + y); } return trim(r); }
  function pneg(a) { return a.map(function (x) { return -x; }); }
  function pmul(a, b) { var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(0); a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] += x * y; }); }); return trim(r); }
  // a binomial factor (ax + b): TeX "(2x - 3)", plain "(2x-3)"
  function tfac(a, b, v) { return '(' + tlin(a, b, v) + ')'; }
  function pfac(a, b, v) { return '(' + plin(a, b, v) + ')'; }
  // adding/subtracting both sides in words: undoing "+ b"
  function undo(b, tex) { // b: the number added on a side (Q or number); tex: optional TeX of the term
    var bq = q(b), t = tex || tn(bq.abs());
    return bq.sign() > 0 ? 'Subtract $' + t + '$ from both sides' : 'Add $' + t + '$ to both sides';
  }
  // solve a x + b = c x + d step by step (a != c). Returns {x: Q, steps: [..], eqs: [..]}
  function linSteps(a, b, c, d, v) {
    v = v || 'x'; a = q(a); b = q(b); c = q(c); d = q(d);
    var steps = [], k = a.sub(c);
    if (!c.isZero()) {
      steps.push((c.sign() > 0 ? 'Subtract $' + T.mono(c, v) + '$ from both sides' : 'Add $' + T.mono(c.neg(), v) + '$ to both sides') + ' to collect the $' + v + '$ terms on the left: $' + T.lin(k, v, b) + ' = ' + tn(d) + '$.');
    }
    if (!b.isZero()) steps.push(undo(b) + ': $' + T.mono(k, v) + ' = ' + tn(d.sub(b)) + '$.');
    var x = d.sub(b).div(k);
    if (!k.eq(1)) steps.push((k.eq(-1) ? 'Multiply both sides by $-1$' : 'Divide both sides by $' + tn(k) + '$') + ': $' + v + ' = ' + tn(x) + '$.');
    return { x: x, steps: steps };
  }
  // the same for an inequality a x + b REL c x + d; returns {x: Q, rel, steps}
  var FLIP = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }, TREL = { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' };
  function ineqSteps(a, b, rel, c, d, v) {
    v = v || 'x'; a = q(a); b = q(b); c = q(c); d = q(d);
    var steps = [], k = a.sub(c);
    if (!c.isZero()) steps.push((c.sign() > 0 ? 'Subtract $' + T.mono(c, v) + '$ from both sides' : 'Add $' + T.mono(c.neg(), v) + '$ to both sides') + ': $' + T.lin(k, v, b) + ' ' + TREL[rel] + ' ' + tn(d) + '$. Adding or subtracting never changes the direction.');
    if (!b.isZero()) steps.push(undo(b) + ': $' + T.mono(k, v) + ' ' + TREL[rel] + ' ' + tn(d.sub(b)) + '$.');
    var x = d.sub(b).div(k), r2 = rel;
    if (k.sign() < 0) { r2 = FLIP[rel]; steps.push('Divide both sides by $' + tn(k) + '$. Dividing by a negative number reverses the order, so the sign flips: $' + v + ' ' + TREL[r2] + ' ' + tn(x) + '$.'); }
    else if (!k.eq(1)) steps.push('Divide both sides by $' + tn(k) + '$ (a positive number, so the sign stays): $' + v + ' ' + TREL[r2] + ' ' + tn(x) + '$.');
    return { x: x, rel: r2, steps: steps };
  }
  // TeX of a*x0 + b with the value substituted: tsub(3, -2, 5) -> "3 \\cdot (-2) + 5"
  function tsub(a, x0, b) { a = q(a); var t = a.eq(1) ? tp(x0) : a.eq(-1) ? '-' + tp(x0) : tn(a) + ' \\cdot ' + tp(x0); return t + (b === undefined ? '' : T.signed(b)); }
  function ineqStr(v, rel, x) { return v + ' ' + rel + ' ' + pq(x); }
  function ineqTex(v, rel, x) { return v + ' ' + TREL[rel] + ' ' + tn(x); }

  // answer specs
  function num(v, o) {
    var s;
    if (typeof v === 'string') s = v;
    else if (typeof v === 'number' && !Number.isInteger(v)) { s = nf(v); if (s.replace('-', '').length > 10) throw new Error('alg1: inexact decimal answer ' + s); }
    else s = pq(v);
    var a = { t: 'num', v: s }; if (o) for (var k in o) a[k] = o[k]; return a;
  }
  // plain "x-3" / "x+2" for x - h, and "abs(x-3)+4" style helpers for answers that read well
  function pshift(h, v) { return plin(1, -h, v); }
  function pabs(a, h, k) { return pterms([[a, 'abs(' + pshift(h) + ')'], [k, '']]); }
  function psq(a, h, k, v) { return pterms([[a, '(' + pshift(h, v) + ')^2'], [k, '']]); }
  function setA(arr) { return { t: 'set', v: arr.map(function (x) { return typeof x === 'string' ? x : pq(x); }) }; }
  function tup(arr, vars) { var a = { t: 'tuple', v: arr.map(function (x) { return typeof x === 'string' ? x : pq(x); }) }; if (vars) a.vars = vars; return a; }
  function mc(correct, wrongs, keep) { var a = U.mc(correct, wrongs, 4); if (a.choices.length < 2) throw new Error('mc needs a wrong choice: ' + correct); if (keep) a.keep = true; return a; }
  function mcAll(choices, rightIdx) { return { t: 'mc', choices: choices, v: rightIdx.slice().sort(function (x, y) { return x - y; }), keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  // TeX for a list of solutions
  function tset(arr) { return arr.map(function (x) { return typeof x === 'string' ? x : tn(x); }).join(',\\ '); }
  // pick a value of an array different from a set of excluded values
  function pickNot(R, arr, not) { var ok = arr.filter(function (x) { return not.indexOf(x) < 0; }); return R.pick(ok); }
  // retry a builder until it returns a value (avoids rare dead ends)
  function retry(fn, n) { for (var i = 0; i < (n || 60); i++) { var r = fn(i); if (r) return r; } throw new Error('alg1: no problem found'); }

  // ================================================================ Unit 1: Expressions and Real Numbers

  // ---- alg1.real-number-system
  var SETS = ['Natural numbers', 'Whole numbers', 'Integers', 'Rational numbers', 'Irrational numbers', 'Real numbers'];
  function rnItem(R, lv) {
    // each: { tex, mem: [N, W, Z, Q, I], why }
    var kinds = by({ level: lv }, ['pos', 'zero', 'neg', 'frac', 'dec', 'root', 'pi'],
      ['pos', 'neg', 'frac', 'root', 'sqsq', 'negsq', 'rep', 'sqfrac', 'pi'],
      ['sqsq', 'negsq', 'rep', 'sqfrac', 'nonrep', 'approx', 'sqdec', 'quot', 'sum', 'root']);
    var k = R.pick(kinds), n, a, b, p;
    var NONSQ = [2, 3, 5, 6, 7, 10, 11, 13, 15, 17];
    switch (k) {
      case 'pos': n = R.int(2, 40); return { tex: tn(n), mem: [1, 1, 1, 1, 0], why: '$' + n + '$ is a counting number, so it is natural, whole, an integer, and rational ($' + n + ' = \\frac{' + n + '}{1}$).' };
      case 'zero': return { tex: '0', mem: [0, 1, 1, 1, 0], why: '$0$ is a whole number and an integer, and it is rational ($0 = \\frac{0}{1}$). It is not a natural (counting) number.' };
      case 'neg': n = -R.int(2, 30); return { tex: tn(n), mem: [0, 0, 1, 1, 0], why: '$' + n + '$ is the opposite of a whole number, so it is an integer. Every integer is rational: $' + n + ' = \\frac{' + n + '}{1}$. It is not natural or whole, because it is negative.' };
      case 'frac': b = R.pick([3, 4, 5, 7, 8, 9]); a = R.intNot(1, 2 * b, [b, 2 * b]); if (gcd(a, b) !== 1) a = 1; p = R.sign(); return { tex: (p < 0 ? '-' : '') + '\\frac{' + a + '}{' + b + '}', mem: [0, 0, 0, 1, 0], why: 'It is a ratio of two integers, so it is rational. It is not an integer, because $' + b + '$ does not divide $' + a + '$ evenly.' };
      case 'dec': n = R.pick([-2.5, 0.75, 3.2, -0.6, 1.25, -4.8]); return { tex: tn(n), mem: [0, 0, 0, 1, 0], why: 'A decimal that ends is a fraction over a power of 10 (here $' + tn(n) + ' = ' + T.frac(q(n).n.toString(), q(n).d.toString()) + '$), so it is rational, but not an integer.' };
      case 'root': p = R.pick(NONSQ); return { tex: '\\sqrt{' + p + '}', mem: [0, 0, 0, 0, 1], why: '$' + p + '$ is not a perfect square, so $\\sqrt{' + p + '}$ is irrational: its decimal never ends and never repeats.' };
      case 'pi': return { tex: '\\pi', mem: [0, 0, 0, 0, 1], why: '$\\pi$ is irrational: its decimal $3.14159\\ldots$ never ends and never repeats.' };
      case 'sqsq': n = R.int(2, 12); return { tex: '\\sqrt{' + n * n + '}', mem: [1, 1, 1, 1, 0], why: '$\\sqrt{' + n * n + '} = ' + n + '$ because $' + n + '^2 = ' + n * n + '$. So it is a natural number, and also whole, an integer and rational.' };
      case 'negsq': n = R.int(2, 10); return { tex: '-\\sqrt{' + n * n + '}', mem: [0, 0, 1, 1, 0], why: '$\\sqrt{' + n * n + '} = ' + n + '$, so $-\\sqrt{' + n * n + '} = -' + n + '$: an integer, and rational, but not natural or whole.' };
      case 'rep': a = R.pick([[1, 3, '0.\\overline{3}'], [2, 3, '0.\\overline{6}'], [1, 9, '0.\\overline{1}'], [5, 11, '0.\\overline{45}'], [7, 9, '0.\\overline{7}'], [1, 6, '0.1\\overline{6}']]); return { tex: a[2], mem: [0, 0, 0, 1, 0], why: 'A decimal that repeats forever is rational: $' + a[2] + ' = \\frac{' + a[0] + '}{' + a[1] + '}$.' };
      case 'sqfrac': a = R.pick([[4, 9], [1, 4], [9, 16], [16, 25], [1, 9], [25, 36]]); return { tex: '\\sqrt{\\frac{' + a[0] + '}{' + a[1] + '}}', mem: [0, 0, 0, 1, 0], why: '$\\sqrt{\\frac{' + a[0] + '}{' + a[1] + '}} = \\frac{' + Math.sqrt(a[0]) + '}{' + Math.sqrt(a[1]) + '}$, a ratio of integers, so it is rational.' };
      case 'nonrep': return { tex: '0.1010010001\\ldots', mem: [0, 0, 0, 0, 1], why: 'The pattern adds one more 0 each time, so no block of digits repeats forever. A decimal that never ends and never repeats is irrational.' };
      case 'approx': return { tex: '\\frac{22}{7}', mem: [0, 0, 0, 1, 0], why: '$\\frac{22}{7}$ is a ratio of integers, so it is rational. It is close to $\\pi$, but it is not equal to $\\pi$.' };
      case 'sqdec': a = R.pick([['0.25', '0.5'], ['0.09', '0.3'], ['1.44', '1.2'], ['0.49', '0.7']]); return { tex: '\\sqrt{' + a[0] + '}', mem: [0, 0, 0, 1, 0], why: '$\\sqrt{' + a[0] + '} = ' + a[1] + '$ because $' + a[1] + '^2 = ' + a[0] + '$. A decimal that ends is rational.' };
      case 'quot': a = R.pick([[8, 2, 2], [18, 2, 3], [50, 2, 5], [12, 3, 2], [27, 3, 3]]); return { tex: '\\frac{\\sqrt{' + a[0] + '}}{\\sqrt{' + a[1] + '}}', mem: [1, 1, 1, 1, 0], why: '$\\frac{\\sqrt{' + a[0] + '}}{\\sqrt{' + a[1] + '}} = \\sqrt{\\frac{' + a[0] + '}{' + a[1] + '}} = \\sqrt{' + a[2] * a[2] + '} = ' + a[2] + '$, a natural number.' };
      default: n = R.int(1, 9); p = R.pick(NONSQ); return { tex: n + ' + \\sqrt{' + p + '}', mem: [0, 0, 0, 0, 1], why: 'A rational number plus an irrational number is irrational, so $' + n + ' + \\sqrt{' + p + '}$ is irrational.' };
    }
  }
  var RN_TF = [
    ['Every integer is a rational number.', true, 'Any integer $n$ can be written as $\\frac{n}{1}$.'],
    ['Every square root is irrational.', false, '$\\sqrt{9} = 3$ is rational. Only square roots of numbers that are not perfect squares (like $\\sqrt{2}$) are irrational.'],
    ['Zero is a whole number.', true, 'The whole numbers are $0, 1, 2, 3, \\ldots$'],
    ['Every whole number is a natural number.', false, '$0$ is whole but not natural; the natural numbers start at $1$.'],
    ['A decimal that repeats forever is irrational.', false, 'A repeating decimal is rational, for example $0.\\overline{3} = \\frac{1}{3}$.'],
    ['Every real number is either rational or irrational, but not both.', true, 'Irrational means "real but not rational," so the two groups split the real numbers.'],
    ['$-7$ is a rational number.', true, '$-7 = \\frac{-7}{1}$, a ratio of integers.'],
    ['$\\pi$ is rational because it equals $\\frac{22}{7}$.', false, '$\\frac{22}{7} = 3.142857\\ldots$ is only close to $\\pi = 3.141592\\ldots$; $\\pi$ is irrational.'],
    ['Every natural number is an integer.', true, 'The natural numbers $1, 2, 3, \\ldots$ are all integers.'],
    ['Some fractions are integers.', true, 'For example $\\frac{12}{4} = 3$.']
  ];
  G('alg1.real-number-system', function (R, ctx) {
    var shape = R.pick(by(ctx, ['all', 'all', 'irr'], ['all', 'irr', 'tf'], ['all', 'tf', 'irr']));
    if (shape === 'tf') {
      var s = R.pick(RN_TF);
      return { q: 'True or false: ' + s[0], a: tf(s[1]), steps: [(s[1] ? 'True. ' : 'False. ') + s[2]], hint: 'Picture the nested groups: natural inside whole, whole inside integers, integers inside rationals.' };
    }
    if (shape === 'irr') {
      var irr = retry(function () { var it = rnItem(R, ctx.level); return it.mem[4] ? it : null; });
      var others = [], seen = {}; seen[irr.tex] = 1;
      retry(function () { var it = rnItem(R, ctx.level); if (!it.mem[4] && !seen[it.tex]) { seen[it.tex] = 1; others.push(it); } return others.length >= 3; }, 200);
      return {
        q: 'Which of these numbers is irrational?',
        a: mc('$' + irr.tex + '$', others.map(function (o) { return '$' + o.tex + '$'; })),
        steps: [irr.why].concat(others.map(function (o) { return o.why; })),
        hint: 'Irrational numbers cannot be written as a fraction of integers. Simplify any square root first.'
      };
    }
    var it = rnItem(R, ctx.level), idx = [];
    it.mem.forEach(function (m, i) { if (m) idx.push(i); }); idx.push(5);
    return {
      q: 'Which groups does $' + it.tex + '$ belong to? Select all that apply.',
      a: mcAll(SETS, idx),
      steps: [it.why, 'Every rational and every irrational number is a real number.', 'So $' + it.tex + '$ belongs to: ' + U.list(idx.map(function (i) { return SETS[i].toLowerCase(); })) + '.'],
      hint: 'Simplify it first if you can, then work from the smallest group (natural numbers) outward.'
    };
  });

  // ---- alg1.rational-irrational-operations
  G('alg1.rational-irrational-operations', function (R, ctx) {
    var NS = [2, 3, 5, 6, 7, 10, 11];
    var kinds = by(ctx, ['r+i', 'r*i', 'r+r', 'r*r', 'r+i'], ['r+i', 'r*i', 'cancel', 'sqprod', 'prod', 'double'], ['cancel', 'sqprod', 'prod', 'zero', 'square', 'quot', 'tf', 'tf']);
    var k = R.pick(kinds), p = R.pick(NS), a, b, c, tex, rat, why;
    switch (k) {
      case 'r+i': a = R.pick([fr(1, 2), fr(2, 3), q(3), q(-4), fr(3, 4), q(0.5)]); tex = tn(a) + ' + \\sqrt{' + p + '}'; rat = false; why = ['$' + tn(a) + '$ is rational and $\\sqrt{' + p + '}$ is irrational.', 'If the sum were a rational number $r$, then $\\sqrt{' + p + '} = r - ' + tp(a) + '$ would be a difference of two rationals, which is rational. That is impossible.', 'So rational + irrational is irrational.']; break;
      case 'r*i': a = R.pick([2, 3, -4, 5, fr(1, 2), fr(-2, 3)]); tex = (R.coin() ? T.coef(a, '\\sqrt{' + p + '}') : T.coef(a, '\\pi')); rat = false; why = ['A nonzero rational number times an irrational number is irrational.', 'If the product were a rational $r$, dividing by the nonzero rational $' + tn(a) + '$ would make the irrational factor equal to $r \\div ' + tp(a) + '$, a rational number. That is impossible.']; break;
      case 'r+r': a = R.pick([fr(1, 3), fr(3, 4), q(0.2), q(-2.5)]); b = R.pick([fr(1, 6), q(0.25), fr(-1, 2), q(7)]); tex = tn(a) + ' + ' + tp(b); rat = true; why = ['Both numbers are rational, and the sum of two fractions is a fraction: $' + tn(a) + ' + ' + tp(b) + ' = ' + tn(q(a).add(b)) + '$.']; break;
      case 'r*r': a = R.pick([fr(2, 3), q(-4), q(1.5)]); b = R.pick([fr(3, 5), q(0.2), fr(-1, 4)]); tex = tn(a) + ' \\cdot ' + tp(b); rat = true; why = ['A product of two fractions is a fraction: $' + tn(a) + ' \\cdot ' + tp(b) + ' = ' + tn(q(a).mul(b)) + '$, so it is rational.']; break;
      case 'cancel': a = R.int(1, 9); b = R.int(1, 9); tex = '(' + a + ' + \\sqrt{' + p + '}) + (' + b + ' - \\sqrt{' + p + '})'; rat = true; why = ['The irrational parts cancel: $\\sqrt{' + p + '} - \\sqrt{' + p + '} = 0$.', 'The sum is $' + a + ' + ' + b + ' = ' + (a + b) + '$, which is rational. Two irrational numbers can add up to a rational number.']; break;
      case 'sqprod': c = R.pick([[2, 8, 4], [2, 18, 6], [3, 12, 6], [5, 20, 10], [3, 27, 9], [2, 32, 8], [6, 24, 12]]); tex = '\\sqrt{' + c[0] + '} \\cdot \\sqrt{' + c[1] + '}'; rat = true; why = ['Multiply under one root: $\\sqrt{' + c[0] + '} \\cdot \\sqrt{' + c[1] + '} = \\sqrt{' + c[0] * c[1] + '}$.', '$' + c[0] * c[1] + '$ is a perfect square, so the product is $' + c[2] + '$, a rational number.']; break;
      case 'prod': c = R.pick([[2, 3], [2, 5], [3, 5], [2, 7], [3, 7], [5, 6]]); tex = '\\sqrt{' + c[0] + '} \\cdot \\sqrt{' + c[1] + '}'; rat = false; why = ['$\\sqrt{' + c[0] + '} \\cdot \\sqrt{' + c[1] + '} = \\sqrt{' + c[0] * c[1] + '}$.', '$' + c[0] * c[1] + '$ is not a perfect square, so $\\sqrt{' + c[0] * c[1] + '}$ is irrational.']; break;
      case 'double': tex = '\\sqrt{' + p + '} + \\sqrt{' + p + '}'; rat = false; why = ['$\\sqrt{' + p + '} + \\sqrt{' + p + '} = 2\\sqrt{' + p + '}$.', 'That is a nonzero rational ($2$) times an irrational number, so it is irrational.']; break;
      case 'zero': tex = '0 \\cdot \\sqrt{' + p + '}'; rat = true; why = ['Zero times any number is $0$, and $0 = \\frac{0}{1}$ is rational.', 'This is why the rule says a <em>nonzero</em> rational times an irrational is irrational.']; break;
      case 'square': tex = '\\left(\\sqrt{' + p + '}\\right)^2'; rat = true; why = ['Squaring undoes the square root: $\\left(\\sqrt{' + p + '}\\right)^2 = ' + p + '$, which is rational.']; break;
      case 'quot': c = R.pick([[50, 2, 5], [12, 3, 2], [45, 5, 3], [72, 2, 6]]); tex = '\\frac{\\sqrt{' + c[0] + '}}{\\sqrt{' + c[1] + '}}'; rat = true; why = ['$\\frac{\\sqrt{' + c[0] + '}}{\\sqrt{' + c[1] + '}} = \\sqrt{\\frac{' + c[0] + '}{' + c[1] + '}} = \\sqrt{' + c[2] * c[2] + '} = ' + c[2] + '$, which is rational.']; break;
      default: {
        var S = R.pick([
          ['The sum of two irrational numbers is always irrational.', false, 'No: $\\sqrt{2} + (-\\sqrt{2}) = 0$, which is rational.'],
          ['The product of two irrational numbers is always irrational.', false, 'No: $\\sqrt{2} \\cdot \\sqrt{8} = \\sqrt{16} = 4$, which is rational.'],
          ['The sum of a rational number and an irrational number is always irrational.', true, 'Yes: if it were rational, subtracting the rational number would leave a rational number, but that is the irrational one.'],
          ['The product of a nonzero rational number and an irrational number is always irrational.', true, 'Yes: if it were rational, dividing by the nonzero rational would leave a rational number, but that is the irrational one.'],
          ['The product of two rational numbers is always rational.', true, 'Yes: $\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}$ is again a ratio of integers.']
        ]);
        return { q: 'True or false: ' + S[0], a: tf(S[1]), steps: [S[2]], hint: 'Try to find one example that breaks the statement.' };
      }
    }
    return {
      q: 'Is $' + tex + '$ rational or irrational?',
      a: { t: 'mc', choices: ['Rational', 'Irrational'], v: rat ? 0 : 1, keep: true },
      steps: why.concat(['So the number is <b>' + (rat ? 'rational' : 'irrational') + '</b>.']),
      hint: 'Simplify first if you can. Then use the facts: rational ± irrational and (nonzero rational) × irrational are irrational.'
    };
  });

  // ---- alg1.evaluate-expressions
  G('alg1.evaluate-expressions', function (R, ctx) {
    var shape = R.pick(by(ctx, ['quad', 'quad', 'negsq'], ['quad', 'negsq', 'two', 'frac'], ['two', 'frac', 'sqdiff', 'negsq']));
    var x, y, a, b, c, val, tex, plain, env, steps;
    if (shape === 'quad') {
      a = R.pick([1, 2, 3, -1, -2]); b = R.nz(-6, 6); c = R.int(-9, 9); x = -R.int(2, 5);
      tex = T.poly([a, b, c]); plain = ppoly([a, b, c]); env = { x: x };
      var sq = x * x;
      steps = ['Replace each $x$ with $(' + x + ')$, in parentheses: $' + T.coef(a, '(' + x + ')^2') + T.coef(b, '(' + x + ')', false) + T.signed(c) + '$.',
        'Powers first: $(' + x + ')^2 = ' + sq + '$ (a negative times a negative is positive).',
        'Multiply: ' + (a === 1 ? '' : '$' + tp(a) + ' \\cdot ' + sq + ' = ' + a * sq + '$ and ') + '$' + tp(b) + ' \\cdot (' + x + ') = ' + b * x + '$.',
        'Add from left to right: $' + tn(a * sq) + T.signed(b * x) + T.signed(c) + ' = ' + (a * sq + b * x + c) + '$.'];
      val = a * sq + b * x + c;
    } else if (shape === 'negsq') {
      c = R.int(1, 20); x = -R.int(2, 6);
      var form = R.coin();
      tex = form ? '-x^2 + ' + c : c + ' - x^2'; plain = form ? '-x^2+' + c : c + '-x^2'; env = { x: x };
      val = c - x * x;
      steps = ['Replace $x$ with $(' + x + ')$: $' + (form ? '-(' + x + ')^2 + ' + c : c + ' - (' + x + ')^2') + '$.',
        'The exponent belongs to $x$ only. Square first: $(' + x + ')^2 = ' + x * x + '$. The minus sign in front is applied after squaring.',
        (form ? '$-' + x * x + ' + ' + c : '$' + c + ' - ' + x * x) + ' = ' + val + '$.'];
    } else if (shape === 'two') {
      x = R.nz(-5, 5); y = -R.int(2, 5); a = R.pick([2, 3, 4, 5]); b = R.pick([1, 2, 3]);
      tex = a + 'a - ' + (b === 1 ? '' : b) + 'b^2'; plain = a + '*a-' + (b === 1 ? '' : b + '*') + 'b^2'; env = { a: x, b: y };
      val = a * x - b * y * y;
      steps = ['Replace $a$ with $' + tp(x) + '$ and $b$ with $(' + y + ')$: $' + a + tp(x) + ' - ' + (b === 1 ? '' : b) + '(' + y + ')^2$.',
        'Powers first: $(' + y + ')^2 = ' + y * y + '$.',
        'Multiply: $' + a + ' \\cdot ' + tp(x) + ' = ' + a * x + '$ and $' + b + ' \\cdot ' + y * y + ' = ' + b * y * y + '$.',
        'Subtract: $' + (a * x) + ' - ' + b * y * y + ' = ' + val + '$.'];
    } else if (shape === 'frac') {
      var r = retry(function () { var X = R.nz(-6, 6), Y = R.nz(-9, 9), N = X * X + Y, D = X - Y; return D !== 0 && N % D === 0 && N !== 0 && abs(D) > 1 ? [X, Y, N, D] : null; });
      x = r[0]; y = r[1];
      tex = '\\frac{x^2 + y}{x - y}'; plain = '(x^2+y)/(x-y)'; env = { x: x, y: y }; val = r[2] / r[3];
      steps = ['Replace $x$ with $' + tp(x) + '$ and $y$ with $' + tp(y) + '$: $\\frac{' + tp(x) + '^2 + ' + tp(y) + '}{' + tp(x) + ' - ' + tp(y) + '}$.',
        'The fraction bar groups the top and the bottom. Top: $' + x * x + ' + ' + tp(y) + ' = ' + r[2] + '$. Bottom: $' + tp(x) + ' - ' + tp(y) + ' = ' + r[3] + '$.',
        'Divide: $\\frac{' + r[2] + '}{' + r[3] + '} = ' + val + '$.'];
    } else {
      x = R.nz(-4, 4); y = R.nz(-5, 5);
      tex = '(2x - y)^2 - xy'; plain = '(2x-y)^2-x*y'; env = { x: x, y: y };
      var inner = 2 * x - y; val = inner * inner - x * y;
      steps = ['Replace $x$ with $' + tp(x) + '$ and $y$ with $' + tp(y) + '$: $(2' + tp(x) + ' - ' + tp(y) + ')^2 - ' + tp(x) + tp(y) + '$.',
        'Parentheses first: $2' + tp(x) + ' - ' + tp(y) + ' = ' + inner + '$.',
        'Then the power: $' + tp(inner) + '^2 = ' + inner * inner + '$. And the product: $' + tp(x) + tp(y) + ' = ' + x * y + '$.',
        'Subtract: $' + inner * inner + ' - ' + tp(x * y) + ' = ' + val + '$.'];
    }
    var vars = Object.keys(env).map(function (k) { return '$' + k + ' = ' + env[k] + '$'; });
    return out({
      q: 'Evaluate $' + tex + '$ when ' + U.list(vars) + '.',
      a: num(val),
      steps: steps,
      hint: 'Put each value in parentheses before you do any arithmetic, then follow the order of operations.'
    }, { k: 'val', expr: plain, env: env });
  });

  // ---- alg1.expression-structure
  G('alg1.expression-structure', function (R, ctx) {
    if (ctx.level >= 3 && R.chance(0.6)) {
      var u = R.pick(['x + 2', 'x - 1', 'x + 5', 'x - 3']), A = R.nz(-5, 6), B = R.nz(-7, 7), C = R.nz(-9, 9);
      var tex = T.coef(A, '(' + u + ')^2') + T.coef(B, '(' + u + ')', false) + T.signed(C);
      var ask = R.pick(['terms', 'c2', 'c1']);
      var ans = ask === 'terms' ? 3 : ask === 'c2' ? A : B;
      return {
        q: 'Think of $(' + u + ')$ as a single block in $' + tex + '$. ' + (ask === 'terms' ? 'How many terms does the expression have?' : 'What is the coefficient of $(' + u + ')' + (ask === 'c2' ? '^2' : '') + '$?'),
        a: num(ans),
        steps: ['Terms are the pieces joined by $+$ and $-$ at the top level. The block $(' + u + ')$ stays together.',
          'The terms are $' + T.mono(A, '(' + u + ')^2') + '$, $' + T.mono(B, '(' + u + ')') + '$ and $' + tn(C) + '$' + (ask === 'terms' ? ': three terms.' : '.'),
          ask === 'terms' ? 'So the expression has $3$ terms.' : 'The coefficient is the number multiplying the block, with its sign: $' + ans + '$.'],
        hint: 'Treat the parentheses as one object, like a single letter.'
      };
    }
    // a polynomial written in a shuffled order
    var pows = R.sample([3, 2, 1, 0], by(ctx, 3, 3, 4));
    var terms = pows.map(function (k) { var c = k === 0 ? R.nz(-9, 9) : R.pick([1, -1, R.nz(-8, 8), R.nz(-8, 8)]); return [c, k]; });
    if (!terms.some(function (t) { return abs(t[0]) === 1 && t[1] > 0; }) && R.chance(0.6)) { var j = R.int(0, terms.length - 1); if (terms[j][1] > 0) terms[j][0] = R.pick([1, -1]); }
    var vname = function (k) { return k === 0 ? '' : k === 1 ? 'x' : 'x^' + k; };
    var texT = function (k) { return k === 0 ? '' : k === 1 ? 'x' : 'x^{' + k + '}'; };
    var expr = T.terms(terms.map(function (t) { return [t[0], texT(t[1])]; }));
    var choicesAsk = ['coef', 'coef', 'const', 'count'];
    if (terms.some(function (t) { return t[0] < 0 && t[1] > 0; })) choicesAsk.push('term');
    var ask = R.pick(choicesAsk);
    if (ask === 'const' && !terms.some(function (t) { return t[1] === 0; })) ask = 'count';
    if (ask === 'coef') {
      var tt = R.pick(terms.filter(function (t) { return t[1] > 0; }));
      return {
        q: 'What is the coefficient of $' + texT(tt[1]) + '$ in $' + expr + '$?',
        a: num(tt[0]),
        steps: ['Find the term with $' + texT(tt[1]) + '$, together with the sign in front of it: $' + T.mono(tt[0], texT(tt[1])) + '$.',
          abs(tt[0]) === 1 ? 'There is no number written, but $' + T.mono(tt[0], texT(tt[1])) + ' = ' + tt[0] + ' \\cdot ' + texT(tt[1]) + '$. The coefficient is $' + tt[0] + '$.' : 'The coefficient is the number multiplying $' + texT(tt[1]) + '$, sign included: $' + tt[0] + '$.'],
        hint: 'The sign in front of a term belongs to the term.'
      };
    }
    if (ask === 'const') {
      var ct = terms.filter(function (t) { return t[1] === 0; })[0];
      return { q: 'What is the constant term of $' + expr + '$?', a: num(ct[0]), steps: ['The constant term is the term with no variable, with its sign: $' + ct[0] + '$.'], hint: 'Look for the term that has no $x$.' };
    }
    if (ask === 'count') {
      return { q: 'How many terms does $' + expr + '$ have?', a: num(terms.length), steps: ['Terms are separated by $+$ and $-$ signs: ' + terms.map(function (t) { return '$' + T.mono(t[0], texT(t[1])) + '$'; }).join(', ') + '.', 'That is $' + terms.length + '$ terms.'], hint: 'Count the pieces between the plus and minus signs.' };
    }
    var neg = R.pick(terms.filter(function (t) { return t[0] < 0 && t[1] > 0; }));
    var right = '$' + T.mono(neg[0], texT(neg[1])) + '$';
    var wrongs = ['$' + T.mono(-neg[0], texT(neg[1])) + '$', '$' + texT(neg[1]) + (abs(neg[0]) === 1 ? '^{2}' : '') + '$', '$' + tn(abs(neg[0]) === 1 ? 1 - neg[0] : neg[0]) + '$'];
    return {
      q: 'Which of these is a term of $' + expr + '$?',
      a: mc(right, wrongs),
      steps: ['A term includes the sign in front of it. Reading $' + expr + '$ term by term: ' + terms.map(function (t) { return '$' + T.mono(t[0], texT(t[1])) + '$'; }).join(', ') + '.', 'So ' + right + ' is a term.'],
      hint: 'Subtraction is adding a negative, so the minus sign stays with its term.'
    };
  });

  // ---- alg1.units-quantities
  var CONV = [
    { from: 'miles per hour', to: 'feet per second', vals: [15, 30, 45, 60, 75], f: [22, 15], chain: function (v) { return v + '\\,\\frac{\\text{mi}}{\\text{h}} \\cdot \\frac{5280\\text{ ft}}{1\\text{ mi}} \\cdot \\frac{1\\text{ h}}{3600\\text{ s}}'; }, cancel: 'Miles cancel with miles, and hours cancel with hours, leaving feet per second.', calc: function (v) { return '\\frac{' + v + ' \\cdot 5280}{3600}'; }, unit: 'ft/s' },
    { from: 'meters per second', to: 'kilometers per hour', vals: [5, 10, 15, 20, 25, 30], f: [18, 5], chain: function (v) { return v + '\\,\\frac{\\text{m}}{\\text{s}} \\cdot \\frac{1\\text{ km}}{1000\\text{ m}} \\cdot \\frac{3600\\text{ s}}{1\\text{ h}}'; }, cancel: 'Meters cancel with meters, and seconds cancel with seconds, leaving kilometers per hour.', calc: function (v) { return '\\frac{' + v + ' \\cdot 3600}{1000}'; }, unit: 'km/h' },
    { from: 'kilometers per hour', to: 'meters per second', vals: [18, 36, 54, 72, 90], f: [5, 18], chain: function (v) { return v + '\\,\\frac{\\text{km}}{\\text{h}} \\cdot \\frac{1000\\text{ m}}{1\\text{ km}} \\cdot \\frac{1\\text{ h}}{3600\\text{ s}}'; }, cancel: 'Kilometers cancel and hours cancel, leaving meters per second.', calc: function (v) { return '\\frac{' + v + ' \\cdot 1000}{3600}'; }, unit: 'm/s' },
    { from: 'liters per hour', to: 'milliliters per minute', vals: [3, 6, 9, 12, 15], f: [50, 3], chain: function (v) { return v + '\\,\\frac{\\text{L}}{\\text{h}} \\cdot \\frac{1000\\text{ mL}}{1\\text{ L}} \\cdot \\frac{1\\text{ h}}{60\\text{ min}}'; }, cancel: 'Liters cancel and hours cancel, leaving milliliters per minute.', calc: function (v) { return '\\frac{' + v + ' \\cdot 1000}{60}'; }, unit: 'mL/min' },
    { from: 'inches per minute', to: 'feet per hour', vals: [2, 3, 4, 6, 12], f: [5, 1], chain: function (v) { return v + '\\,\\frac{\\text{in}}{\\text{min}} \\cdot \\frac{1\\text{ ft}}{12\\text{ in}} \\cdot \\frac{60\\text{ min}}{1\\text{ h}}'; }, cancel: 'Inches cancel and minutes cancel, leaving feet per hour.', calc: function (v) { return '\\frac{' + v + ' \\cdot 60}{12}'; }, unit: 'ft/h' },
    { from: 'feet per second', to: 'miles per hour', vals: [22, 44, 66, 88], f: [15, 22], chain: function (v) { return v + '\\,\\frac{\\text{ft}}{\\text{s}} \\cdot \\frac{1\\text{ mi}}{5280\\text{ ft}} \\cdot \\frac{3600\\text{ s}}{1\\text{ h}}'; }, cancel: 'Feet cancel and seconds cancel, leaving miles per hour.', calc: function (v) { return '\\frac{' + v + ' \\cdot 3600}{5280}'; }, unit: 'mph' }
  ];
  G('alg1.units-quantities', function (R, ctx) {
    var shape = R.pick(by(ctx, ['single', 'single', 'pick'], ['rate', 'rate', 'pick', 'money'], ['rate', 'area', 'money']));
    if (shape === 'single') {
      var S = R.pick([['feet', 'inches', 12, '12 in', '1 ft', [2.5, 4, 7.5, 9, 3.25]], ['hours', 'minutes', 60, '60 min', '1 h', [1.5, 2.25, 3.5, 0.75]], ['yards', 'feet', 3, '3 ft', '1 yd', [4, 12, 2.5, 30]], ['kilograms', 'grams', 1000, '1000 g', '1 kg', [2.5, 0.75, 1.2, 4]], ['minutes', 'seconds', 60, '60 s', '1 min', [2.5, 4.5, 12, 0.25]]]);
      var v = R.pick(S[5]), ans = U.fix(v * S[2]);
      return out({
        q: 'Convert $' + tn(v) + '$ ' + S[0] + ' to ' + S[1] + '.',
        a: num(ans), unit: S[1],
        steps: ['Multiply by a unit fraction equal to 1, with ' + S[0] + ' on the bottom so they cancel: $\\frac{' + S[3].replace(' ', '\\text{ ') + '}}{' + S[4].replace(' ', '\\text{ ') + '}}$.', '$' + tn(v) + ' \\cdot ' + S[2] + ' = ' + tn(ans) + '$ ' + S[1] + '.', 'Check: ' + S[1] + ' are smaller units, so the number should get bigger. It did.'],
        hint: 'Put the unit you want to get rid of in the denominator of the conversion fraction.'
      }, { k: 'num', v: ans });
    }
    if (shape === 'pick') {
      var P = R.pick([['hours', 'minutes', '\\frac{60\\text{ min}}{1\\text{ h}}', '\\frac{1\\text{ h}}{60\\text{ min}}', '\\frac{60\\text{ h}}{1\\text{ min}}', '\\frac{1\\text{ min}}{60\\text{ h}}'], ['feet', 'inches', '\\frac{12\\text{ in}}{1\\text{ ft}}', '\\frac{1\\text{ ft}}{12\\text{ in}}', '\\frac{12\\text{ ft}}{1\\text{ in}}', '\\frac{1\\text{ in}}{12\\text{ ft}}'], ['meters', 'centimeters', '\\frac{100\\text{ cm}}{1\\text{ m}}', '\\frac{1\\text{ m}}{100\\text{ cm}}', '\\frac{100\\text{ m}}{1\\text{ cm}}', '\\frac{1\\text{ cm}}{100\\text{ m}}'], ['miles', 'feet', '\\frac{5280\\text{ ft}}{1\\text{ mi}}', '\\frac{1\\text{ mi}}{5280\\text{ ft}}', '\\frac{5280\\text{ mi}}{1\\text{ ft}}', '\\frac{1\\text{ ft}}{5280\\text{ mi}}']]);
      return {
        q: 'You want to change a measurement in ' + P[0] + ' into ' + P[1] + '. Which fraction should you multiply by?',
        a: mc('$' + P[2] + '$', ['$' + P[3] + '$', '$' + P[4] + '$', '$' + P[5] + '$']),
        steps: ['A conversion fraction must equal $1$: its top and bottom name the same amount (so $' + P[4] + '$ and $' + P[5] + '$ are not equal to 1).', 'The ' + P[0] + ' must cancel, so ' + P[0] + ' go on the bottom: $' + P[2] + '$.'],
        hint: 'The unit you start with must end up in the denominator.'
      };
    }
    if (shape === 'money') {
      var price = R.pick([1.6, 2.4, 3.2, 4, 4.8, 5.6]), cents = U.fix(price * 100 / 16);
      return out({
        q: 'Apples cost $' + money(price) + '$ per pound. What is the price in cents per ounce? ($1$ pound $= 16$ ounces.)',
        a: num(cents), unit: 'cents per ounce',
        steps: ['$' + money(price).replace('\\$', '\\$') + '\\,\\frac{1}{\\text{lb}} \\cdot \\frac{100\\text{ cents}}{\\$1} \\cdot \\frac{1\\text{ lb}}{16\\text{ oz}}$.', 'Dollars cancel and pounds cancel, leaving cents per ounce.', '$\\frac{' + tn(price) + ' \\cdot 100}{16} = \\frac{' + U.fix(price * 100) + '}{16} = ' + tn(cents) + '$ cents per ounce.'],
        hint: 'Change dollars to cents, and pounds (on the bottom) to ounces.'
      }, { k: 'num', v: cents });
    }
    if (shape === 'area') {
      var A = R.pick([['square feet', 'square inches', 12, 'ft', 'in', 'square foot', [2, 3, 5, 1.5]], ['square yards', 'square feet', 3, 'yd', 'ft', 'square yard', [4, 10, 2.5, 20]], ['square meters', 'square centimeters', 100, 'm', 'cm', 'square meter', [2, 0.5, 3, 1.2]], ['cubic yards', 'cubic feet', 3, 'yd', 'ft', 'cubic yard', [2, 4, 5, 10]]]);
      var cube = /cubic/.test(A[0]), pw = cube ? 3 : 2, v2 = R.pick(A[6]), f = Math.pow(A[2], pw), ans2 = U.fix(v2 * f);
      return out({
        q: 'Convert $' + tn(v2) + '$ ' + A[0] + ' to ' + A[1] + '.',
        a: num(ans2), unit: A[1],
        steps: ['One ' + A[5] + ' is ' + (cube ? 'a cube' : 'a square') + ' that measures $' + A[2] + '$ ' + A[4] + ' on each side, so it holds $' + A[2] + '^' + pw + ' = ' + f + '$ ' + A[1] + ', not just $' + A[2] + '$.',
          'Use the length factor ' + (cube ? 'three times' : 'twice') + ': $' + tn(v2) + '\\,\\text{' + A[3] + '}^' + pw + ' \\cdot \\left(\\frac{' + A[2] + '\\text{ ' + A[4] + '}}{1\\text{ ' + A[3] + '}}\\right)^' + pw + ' = ' + tn(v2) + ' \\cdot ' + f + '$.',
          '$' + tn(v2) + ' \\cdot ' + f + ' = ' + tn(ans2) + '$ ' + A[1] + '.'],
        hint: (cube ? 'A cubic unit has three dimensions' : 'A square unit has two dimensions') + ', so the length factor is used ' + (cube ? 'three times' : 'twice') + '.'
      }, { k: 'num', v: ans2 });
    }
    var C = R.pick(CONV), v3 = R.pick(C.vals), ans3 = U.fix(v3 * C.f[0] / C.f[1]);
    return out({
      q: 'Convert $' + v3 + '$ ' + C.from + ' to ' + C.to + '.',
      a: num(ans3), unit: C.unit,
      steps: ['Multiply by unit fractions (each equal to $1$) arranged so the old units cancel: $' + C.chain(v3) + '$.', C.cancel, '$' + C.calc(v3) + ' = ' + tn(ans3) + '$ ' + C.to + '.'],
      hint: 'Write the rate as a fraction, then multiply by conversion fractions so each old unit appears once on top and once on the bottom.'
    }, { k: 'num', v: ans3 });
  });


  // ================================================================ Unit 2: Solving Equations

  // ---- alg1.justify-solution-steps
  function arrowEq(a, b) { return '$$' + a + ' \\quad\\longrightarrow\\quad ' + b + '$$'; }
  G('alg1.justify-solution-steps', function (R, ctx) {
    var shape = R.pick(by(ctx, ['op', 'op', 'solve'], ['solve', 'op', 'error'], ['error', 'solve', 'error']));
    var x0 = R.nz(-8, 9), a, b, c, d, k;
    if (shape === 'op') {
      var kind = R.pick(['sub', 'div', 'mul', 'var', 'dist']), from, to, right, wrongs;
      if (kind === 'sub') {
        a = R.pick([2, 3, 4, 5, -2, -3]); b = R.nz(-9, 9); c = a * x0 + b;
        from = tlin(a, b) + ' = ' + c; to = T.mono(a, 'x') + ' = ' + (c - b);
        right = b > 0 ? 'Subtracted $' + b + '$ from both sides' : 'Added $' + (-b) + '$ to both sides';
        wrongs = [b > 0 ? 'Added $' + b + '$ to both sides' : 'Subtracted $' + (-b) + '$ from both sides', 'Divided both sides by $' + tn(a) + '$', (b > 0 ? 'Subtracted $' + b + '$ from the left side only' : 'Added $' + (-b) + '$ to the left side only')];
      } else if (kind === 'div') {
        a = R.pick([2, 3, 4, 5, 6, -2, -3, -4]); c = a * x0;
        from = T.mono(a, 'x') + ' = ' + c; to = 'x = ' + x0;
        right = 'Divided both sides by $' + tn(a) + '$';
        wrongs = ['Subtracted $' + tn(a) + '$ from both sides', 'Multiplied both sides by $' + tn(a) + '$', 'Divided the left side only by $' + tn(a) + '$'];
      } else if (kind === 'mul') {
        a = R.pick([2, 3, 4, 5]); c = R.nz(-9, 9);
        from = '\\frac{x}{' + a + '} = ' + c; to = 'x = ' + a * c;
        right = 'Multiplied both sides by $' + a + '$';
        wrongs = ['Divided both sides by $' + a + '$', 'Added $' + a + '$ to both sides', 'Multiplied the left side only by $' + a + '$'];
      } else if (kind === 'var') {
        a = R.pick([5, 6, 7, 8]); c = R.pick([2, 3, 4, -2, -3]); b = R.nz(-9, 9); d = (a - c) * x0 + b;
        from = tlin(a, b) + ' = ' + tlin(c, d); to = tlin(a - c, b) + ' = ' + d;
        right = c > 0 ? 'Subtracted $' + T.mono(c, 'x') + '$ from both sides' : 'Added $' + T.mono(-c, 'x') + '$ to both sides';
        wrongs = [c > 0 ? 'Added $' + T.mono(c, 'x') + '$ to both sides' : 'Subtracted $' + T.mono(-c, 'x') + '$ from both sides', 'Divided both sides by $' + tn(c) + '$', c > 0 ? 'Subtracted $' + c + '$ from both sides' : 'Added $' + (-c) + '$ to both sides'];
      } else {
        k = R.pick([2, 3, 4, 5, -2, -3]); b = R.nz(-7, 7); c = k * (x0 + b);
        from = tn(k) + tfac(1, b) + ' = ' + c; to = tlin(1, b) + ' = ' + (c / k);
        right = 'Divided both sides by $' + tn(k) + '$';
        wrongs = ['Subtracted $' + tn(k) + '$ from both sides', 'Multiplied both sides by $' + tn(k) + '$', 'Divided only the $x$ term by $' + tn(k) + '$'];
      }
      return {
        q: 'What was done to get from the first equation to the second?' + arrowEq(from, to),
        a: mc(right, wrongs),
        steps: ['Compare the two equations side by side. Both sides changed in the same way, so the balance is kept.', right + ': that turns $' + from + '$ into $' + to + '$.', 'Doing the same thing to both sides keeps every solution, so both equations have the same solution.'],
        hint: 'Look at how the left side changed, then check that the right side changed the same way.'
      };
    }
    if (shape === 'solve') {
      a = R.pick([3, 4, 5, 6, 7, -2, -3]); c = R.intNot(-5, 5, [0, a]);
      b = R.nz(-12, 12); d = (a - c) * x0 + b;
      var S = linSteps(a, b, c, d);
      return out({
        q: 'Solve for $x$ and keep the balance at every step: $' + tlin(a, b) + ' = ' + tlin(c, d) + '$',
        a: num(S.x),
        steps: S.steps.concat(['Check: $' + tsub(a, x0, b) + ' = ' + (a * x0 + b) + '$ and $' + tsub(c, x0, d) + ' = ' + (c * x0 + d) + '$. Both sides match.']),
        hint: 'First collect the $x$ terms on one side by doing the same thing to both sides.'
      }, { k: 'roots', eq: plin(a, b) + '=' + plin(c, d) });
    }
    // spot the error in a(x + p) = c x + d
    var r = retry(function () {
      var A = R.pick([2, 3, 4, 5, -2, -3]), P = R.nz(-6, 6), C = R.nz(-4, 4), X = R.nz(-6, 6), e = R.int(1, 4);
      if (C === A || A + C === 0 || A - C === 1) return null;
      var D = A * (X + P) - C * X;
      var E = [tn(A) + tfac(1, P) + ' = ' + tlin(C, D), tlin(A, A * P) + ' = ' + tlin(C, D), tlin(A - C, A * P) + ' = ' + D, T.mono(A - C, 'x') + ' = ' + (D - A * P), 'x = ' + X];
      var W = E.slice(), fix;
      if (e === 1) { W[1] = tlin(A, P) + ' = ' + tlin(C, D); W[2] = tlin(A - C, P) + ' = ' + D; W[3] = T.mono(A - C, 'x') + ' = ' + (D - P); W[4] = 'x = ' + tn(fr(D - P, A - C)); fix = 'Step 1 multiplied only the $x$ by $' + tn(A) + '$. The distributive property multiplies <em>every</em> term inside: $' + tn(A) + tfac(1, P) + ' = ' + tlin(A, A * P) + '$, not $' + tlin(A, P) + '$.'; }
      else if (e === 2) { W[2] = tlin(A + C, A * P) + ' = ' + D; W[3] = T.mono(A + C, 'x') + ' = ' + (D - A * P); W[4] = 'x = ' + tn(fr(D - A * P, A + C)); fix = 'Step 2 should remove $' + T.mono(C, 'x') + '$ from both sides, which gives $' + T.mono(A - C, 'x') + '$ on the left. Writing $' + T.mono(A + C, 'x') + '$ added it to one side while taking it from the other.'; }
      else if (e === 3) { W[3] = T.mono(A - C, 'x') + ' = ' + (D + A * P); W[4] = 'x = ' + tn(fr(D + A * P, A - C)); fix = 'Step 3 should ' + (A * P > 0 ? 'subtract $' + A * P + '$ from' : 'add $' + (-A * P) + '$ to') + ' both sides, giving $' + (D - A * P) + '$ on the right. The sign of the constant was not changed.'; }
      else { W[4] = 'x = ' + (D - A * P - (A - C)); fix = 'Step 4 should divide both sides by $' + tn(A - C) + '$, because $' + T.mono(A - C, 'x') + '$ means $' + tn(A - C) + '$ times $x$. Subtracting $' + tn(A - C) + '$ does not undo multiplication.'; }
      if (W[4] === E[4]) return null;
      return { E: E, W: W, e: e, fix: fix, X: X };
    });
    var rows = r.W.map(function (s, i) { return (i ? '\\text{Step ' + i + ':}' : '\\text{Start:}') + ' & ' + s; }).join(' \\\\ ');
    return {
      q: 'One step in this solution has a mistake. Which step is it?$$\\begin{array}{ll} ' + rows + ' \\end{array}$$',
      a: { t: 'mc', choices: ['Step 1', 'Step 2', 'Step 3', 'Step 4'], v: r.e - 1, keep: true },
      steps: [r.fix, 'A correct solution: $' + r.E.slice(1).join('$, then $') + '$.', 'Check: with $x = ' + r.X + '$, both sides of $' + r.E[0] + '$ are equal.'],
      hint: 'Check each step: was the same thing done to both whole sides?'
    };
  });

  // ---- alg1.equations-fractions-decimals
  function fx(c, v) { // a coefficient times v written as \frac{3x}{4}; sign in front; c: Q
    c = q(c); v = v || 'x';
    if (c.isInt()) return T.mono(c, v);
    var n = c.n < 0n ? -c.n : c.n;
    return (c.sign() < 0 ? '-' : '') + '\\frac{' + (n === 1n ? '' : n.toString()) + v + '}{' + c.d + '}';
  }
  function fxs(c, v, first) { var s = fx(c, v); if (first) return s; return s[0] === '-' ? ' - ' + s.slice(1) : ' + ' + s; }
  G('alg1.equations-fractions-decimals', function (R, ctx) {
    var shape = R.pick(by(ctx, ['frac1', 'frac1', 'frac2'], ['frac2', 'binom', 'dec'], ['binom', 'dec', 'frac2']));
    var x0 = R.nz(-9, 12), Ls, a, b, c, d, eqTex, plainEq, Lcd, ints;
    if (shape === 'frac1' || shape === 'frac2') {
      var r = retry(function () {
        var Lc = R.pick([4, 6, 8, 10, 12]), divs = U.factors(Lc).filter(function (m) { return m > 1; });
        var A = fr(R.pick([1, 1, 2, 3, 5]), R.pick(divs)), B = fr(R.nz(-7, 7), R.pick(divs)), C = shape === 'frac2' ? fr(R.nz(-3, 3), R.pick(divs)) : q(0);
        if (A.eq(C) || A.isInt() || (shape === 'frac2' && C.isZero())) return null;
        var D = A.sub(C).mul(x0).add(B);
        var lcd = U.lcm(A.den(), B.den(), C.den(), D.den());
        if (lcd < 3 || lcd > 24) return null;
        return [A, B, C, D, lcd];
      }, 400);
      a = r[0]; b = r[1]; c = r[2]; d = r[3]; Lcd = r[4];
      var lhs = fx(a) + (b.sign() < 0 ? ' - ' + tn(b.abs()) : ' + ' + tn(b)), rhs = c.isZero() ? tn(d) : fx(c) + (d.isZero() ? '' : d.sign() < 0 ? ' - ' + tn(d.abs()) : ' + ' + tn(d));
      eqTex = lhs + ' = ' + rhs;
      plainEq = pterms([[a, 'x'], [b, '']]) + '=' + pterms([[c, 'x'], [d, '']]);
      var A2 = a.mul(Lcd), B2 = b.mul(Lcd), C2 = c.mul(Lcd), D2 = d.mul(Lcd);
      var dens = U.uniq([a.den(), b.den(), c.den(), d.den()].filter(function (m) { return m > 1; }));
      var S = linSteps(A2, B2, C2, D2);
      return out({
        q: 'Solve for $x$: $' + eqTex + '$',
        a: num(S.x),
        steps: ['The denominators are ' + U.list(dens.map(function (m) { return '$' + m + '$'; })) + '. Their least common denominator is $' + Lcd + '$.',
          'Multiply <em>every</em> term on both sides by $' + Lcd + '$: $' + T.lin(A2, 'x', B2) + ' = ' + T.lin(C2, 'x', D2) + '$. Now there are no fractions.'].concat(S.steps),
        hint: 'Multiply every term, on both sides, by the least common denominator.'
      }, { k: 'roots', eq: plainEq });
    }
    if (shape === 'binom') {
      var r2 = retry(function () {
        var m = R.pick([2, 3, 4, 5]), n = R.pick([2, 3, 4, 6]), ca = R.pick([1, 2, 3]), cb = R.pick([1, 2]);
        if (m === n) return null;
        var p = (((-ca * x0) % m) + m) % m + m * R.int(-1, 1), s = (((-cb * x0) % n) + n) % n + n * R.int(-1, 1);
        if (!p || !s) return null;
        // (ca x + p)/m = (cb x + s)/n + k  with integer k
        var top = ca * x0 + p; if (top % m) return null;
        var rgt = cb * x0 + s; if (rgt % n) return null;
        var k = top / m - rgt / n;
        if (ca * n === cb * m) return null;
        return [m, n, p, s, ca, cb, k];
      });
      var m = r2[0], n = r2[1], p = r2[2], s = r2[3], ca = r2[4], cb = r2[5], k = r2[6], L2 = U.lcm(m, n);
      eqTex = '\\frac{' + tlin(ca, p) + '}{' + m + '} = \\frac{' + tlin(cb, s) + '}{' + n + '}' + T.signed(k);
      plainEq = '(' + plin(ca, p) + ')/' + m + '=(' + plin(cb, s) + ')/' + n + '+(' + k + ')';
      var f1 = L2 / m, f2 = L2 / n;
      var A3 = ca * f1, B3 = p * f1, C3 = cb * f2, D3 = s * f2 + k * L2;
      var S2 = linSteps(A3, B3, C3, D3);
      return out({
        q: 'Solve for $x$: $' + eqTex + '$',
        a: num(S2.x),
        steps: ['The least common denominator of $' + m + '$ and $' + n + '$ is $' + L2 + '$. Multiply every term on both sides by $' + L2 + '$.',
          '$' + L2 + ' \\cdot \\frac{' + tlin(ca, p) + '}{' + m + '} = ' + f1 + tfac(ca, p) + '$ and $' + L2 + ' \\cdot \\frac{' + tlin(cb, s) + '}{' + n + '} = ' + f2 + tfac(cb, s) + '$' + (k ? ', and the lone number becomes $' + L2 + ' \\cdot ' + tp(k) + ' = ' + L2 * k + '$' : '') + '.',
          'Distribute: $' + T.lin(A3, 'x', B3) + ' = ' + T.lin(C3, 'x', D3) + '$.'].concat(S2.steps),
        hint: 'Keep each numerator in parentheses when you multiply by the common denominator.'
      }, { k: 'roots', eq: plainEq });
    }
    // decimals
    var r3 = retry(function () {
      var A = R.pick([0.2, 0.4, 0.5, 0.6, 1.5, 0.25, 0.75, 1.2]), C = R.pick([0.1, 0.3, 0.05, 0.15, 0.8, 2]), B = R.pick([1.2, 2.5, 0.8, 3, 4.5, -1.5, -0.6]);
      if (A === C) return null;
      var D = U.fix(Number(q(A).sub(C).mul(x0).add(B).toDec(8)));
      return [A, B, C, D];
    });
    a = r3[0]; b = r3[1]; c = r3[2]; d = r3[3];
    var dp = Math.max.apply(null, [a, b, c, d].map(function (v) { var s = nf(v); return s.indexOf('.') < 0 ? 0 : s.split('.')[1].length; })), M = Math.pow(10, dp);
    eqTex = T.lin(a, 'x', b) + ' = ' + T.lin(c, 'x', d);
    var S3 = linSteps(U.fix(a * M), U.fix(b * M), U.fix(c * M), U.fix(d * M));
    return out({
      q: 'Solve for $x$: $' + eqTex + '$',
      a: num(S3.x),
      steps: ['The most decimal places in any term is ' + dp + ', so multiply every term on both sides by $' + M + '$.',
        '$' + T.lin(U.fix(a * M), 'x', U.fix(b * M)) + ' = ' + T.lin(U.fix(c * M), 'x', U.fix(d * M)) + '$.'].concat(S3.steps),
      hint: 'Multiply every term by a power of 10 that clears all the decimals.'
    }, { k: 'roots', eq: plin(a, b) + '=' + plin(c, d) });
  });

  // ---- alg1.write-equations-words
  G('alg1.write-equations-words', function (R, ctx) {
    var t = R.pick(by(ctx, ['less', 'times', 'fee', 'less'], ['times', 'consec', 'perim', 'fee', 'plans'], ['consec', 'perim', 'ages', 'plans', 'equal']));
    var n = R.int(3, 15), m, k, r, text, eqTex, a, b, c, d, ask = 'the number', varName = 'n', define = 'Let $n$ be the number.', prep = [], wrongEq = null, unitW = '';
    if (t === 'less') {
      m = R.int(2, 6); k = R.int(2, 12); r = m * n - k;
      text = U.words(k).replace(/^./, cap) + ' less than ' + U.words(m) + ' times a number is ' + r + '. Find the number.';
      eqTex = m + 'n - ' + k + ' = ' + r; a = m; b = -k; c = 0; d = r;
      wrongEq = [k + ' - ' + m + 'n = ' + r, m + '(n - ' + k + ') = ' + r, m + 'n + ' + k + ' = ' + r];
      prep = ['"' + cap(U.words(k)) + ' less than" something means start with that something and take away ' + k + ': $' + m + 'n - ' + k + '$, not $' + k + ' - ' + m + 'n$.'];
    } else if (t === 'times') {
      m = R.int(2, 5); k = R.int(2, 9); r = m * (n + k);
      text = U.words(m).replace(/^./, cap) + ' times the sum of a number and ' + k + ' is ' + r + '. Find the number.';
      eqTex = m + '(n + ' + k + ') = ' + r; a = m; b = m * k; c = 0; d = r;
      wrongEq = [m + 'n + ' + k + ' = ' + r, 'n + ' + m * k + ' = ' + r, m + 'n = ' + r + ' + ' + k];
      prep = ['"The sum of a number and ' + k + '" is $n + ' + k + '$; ' + U.words(m) + ' times it needs parentheses: $' + m + '(n + ' + k + ')$.', 'Distribute: $' + m + 'n + ' + m * k + ' = ' + r + '$.'];
    } else if (t === 'consec') {
      var even = R.coin(), st = even ? 2 : 1; n = even ? 2 * R.int(5, 40) : R.int(10, 80);
      var S = 3 * n + 3 * st; ask = R.pick(['smallest', 'largest']);
      text = 'The sum of three consecutive ' + (even ? 'even ' : '') + 'integers is ' + S + '. What is the ' + ask + ' of the three?';
      define = 'Let $n$ be the smallest integer. The next two are $n + ' + st + '$ and $n + ' + 2 * st + '$.';
      eqTex = 'n + (n + ' + st + ') + (n + ' + 2 * st + ') = ' + S; a = 3; b = 3 * st; c = 0; d = S;
      prep = ['Combine like terms: $3n + ' + 3 * st + ' = ' + S + '$.'];
      if (ask === 'largest') { var sol = linSteps(a, b, c, d); return out({ q: text, a: num(n + 2 * st), steps: [define, 'Write the equation: $' + eqTex + '$.'].concat(prep, sol.steps, ['The smallest is $' + n + '$, so the largest is $n + ' + 2 * st + ' = ' + (n + 2 * st) + '$.', 'Check: $' + n + ' + ' + (n + st) + ' + ' + (n + 2 * st) + ' = ' + S + '$.']), hint: 'Call the smallest integer $n$. Consecutive ' + (even ? 'even ' : '') + 'integers go up by ' + st + '.' }, { k: 'num', v: n + 2 * st }); }
    } else if (t === 'perim') {
      m = R.int(2, 3); k = R.nz(-3, 6); n = R.int(3, 12); var Pm = 2 * n + 2 * (m * n + k);
      text = 'The length of a rectangle is ' + (k > 0 ? k + ' meters more than ' : k < 0 ? -k + ' meters less than ' : '') + U.words(m) + ' times its width. The perimeter is ' + Pm + ' meters. Find the width.';
      varName = 'w'; define = 'Let $w$ be the width. Then the length is $' + tlin(m, k, 'w') + '$.'; ask = 'the width'; unitW = ' meters';
      eqTex = '2w + 2(' + tlin(m, k, 'w') + ') = ' + Pm; a = 2 + 2 * m; b = 2 * k; c = 0; d = Pm;
      prep = ['Distribute and combine: $' + tlin(a, b, 'w') + ' = ' + Pm + '$.'];
    } else if (t === 'fee') {
      var fee = R.pick([15, 20, 25, 30, 40]), rate = R.pick([8, 12, 15, 18, 25]); n = R.int(3, 12); var tot = fee + rate * n;
      text = 'A gym charges a one-time fee of $' + money(fee) + '$ plus $' + money(rate) + '$ per month. Jordan has paid $' + money(tot) + '$ in all. How many months has Jordan been a member?';
      varName = 'm'; define = 'Let $m$ be the number of months.'; ask = 'the number of months'; unitW = ' months';
      eqTex = fee + ' + ' + rate + 'm = ' + tot; a = rate; b = fee; c = 0; d = tot;
      wrongEq = [rate + ' + ' + fee + 'm = ' + tot, '(' + fee + ' + ' + rate + ')m = ' + tot, fee + 'm + ' + rate + 'm = ' + tot];
    } else if (t === 'plans') {
      var f1 = R.pick([10, 15, 20, 25]), r1 = R.pick([6, 7, 8, 9]), r2 = R.pick([2, 3, 4]); n = R.int(3, 10); var f2 = f1 + (r1 - r2) * n;
      text = 'Plan A costs $' + money(f1) + '$ plus $' + money(r1) + '$ per month. Plan B costs $' + money(f2) + '$ plus $' + money(r2) + '$ per month. After how many months do the plans cost the same?';
      varName = 'm'; define = 'Let $m$ be the number of months.'; ask = 'the number of months'; unitW = ' months';
      eqTex = f1 + ' + ' + r1 + 'm = ' + f2 + ' + ' + r2 + 'm'; a = r1; b = f1; c = r2; d = f2;
      wrongEq = [f1 + 'm + ' + r1 + ' = ' + f2 + 'm + ' + r2, f1 + ' + ' + r1 + 'm + ' + f2 + ' + ' + r2 + 'm = 0', f1 + ' + ' + r2 + 'm = ' + f2 + ' + ' + r1 + 'm'];
    } else if (t === 'ages') {
      m = R.int(2, 3); k = R.nz(-4, 6); n = R.int(4, 14); var sum = n + m * n + k;
      text = 'Maya is ' + (k > 0 ? k + ' years older than ' : k < 0 ? -k + ' years younger than ' : '') + U.words(m) + ' times her brother\'s age. The sum of their ages is ' + sum + '. How old is her brother?';
      varName = 'b'; define = 'Let $b$ be the brother\'s age. Then Maya is $' + tlin(m, k, 'b') + '$.'; ask = 'the brother\'s age'; unitW = ' years';
      eqTex = 'b + ' + tlin(m, k, 'b') + ' = ' + sum; a = 1 + m; b = k; c = 0; d = sum;
      prep = ['Combine like terms: $' + tlin(1 + m, k, 'b') + ' = ' + sum + '$.'];
    } else {
      var rq = retry(function () { var M = R.pick([2, 3, 4]), K = R.int(2, 9), Rr = R.int(1, 9); return (Rr + K) % (M - 1) === 0 ? [M, K, Rr] : null; });
      m = rq[0]; k = rq[1]; r = rq[2]; n = m * (r + k) / (m - 1);
      text = 'When ' + k + ' is subtracted from a number, the result is ' + r + ' more than ' + (m === 2 ? 'half' : 'one ' + (m === 3 ? 'third' : 'fourth')) + ' of the number. Find the number.';
      eqTex = 'n - ' + k + ' = \\frac{n}{' + m + '} + ' + r;
      var Sx = linSteps(m, -k * m, 1, r * m);
      return out({ q: text, a: num(n), steps: [define, 'Write the equation: $' + eqTex + '$.', 'Multiply every term by $' + m + '$: $' + m + 'n - ' + k * m + ' = n + ' + r * m + '$.'].concat(Sx.steps, ['Check: $' + n + ' - ' + k + ' = ' + (n - k) + '$ and $\\frac{' + n + '}{' + m + '} + ' + r + ' = ' + (n / m + r) + '$.']), hint: 'Translate piece by piece: "is" becomes $=$.' }, { k: 'roots', eq: 'n-' + k + '=n/' + m + '+' + r, v: 'n' });
    }
    var S2 = linSteps(a, b, c, d, varName);
    if (wrongEq && ctx.level === 1 && R.chance(0.5)) {
      return {
        q: text.replace(/ (Find|How many|After how many)[^.?]*[.?]$/, '') + ' Which equation describes this?',
        a: mc('$' + eqTex + '$', wrongEq.map(function (w) { return '$' + w + '$'; })),
        steps: [define].concat(prep.length ? [prep[0]] : [], ['So the equation is $' + eqTex + '$.', 'Solving it gives $' + varName + ' = ' + tn(S2.x) + '$.']),
        hint: 'Name the unknown, then translate each phrase in order.'
      };
    }
    return out({
      q: text,
      a: num(S2.x), unit: unitW.trim() || undefined,
      steps: [define, 'Write the equation: $' + eqTex + '$.'].concat(prep, S2.steps, ['So ' + ask + ' is $' + tn(S2.x) + '$' + unitW + '. Check it in the story, not just in the equation.']),
      hint: 'Name the unknown with a letter, then turn each phrase into symbols: "is" becomes $=$.'
    }, { k: 'roots', eq: plin(a, b, varName) + '=' + plin(c, d, varName), v: varName });
  });

  // ---- alg1.distance-rate-time
  function drtTable(rows) { return '$$\\begin{array}{l|c|c|c} & \\text{rate} & \\text{time} & \\text{distance} \\\\ \\hline ' + rows.map(function (r) { return r.join(' & '); }).join(' \\\\ ') + ' \\end{array}$$'; }
  G('alg1.distance-rate-time', function (R, ctx) {
    var t = R.pick(by(ctx, ['minutes', 'apart', 'apart'], ['apart', 'meet', 'faster', 'catch'], ['catch', 'round', 'faster', 'round']));
    var r1, r2, T1, D, h, ans, steps, text, unit = 'hours';
    if (t === 'minutes') {
      var mins = R.pick([20, 30, 40, 45, 15, 50]); r1 = R.pick([6, 12, 18, 24, 30, 36, 48, 60]);
      ans = U.fix(r1 * mins / 60); if (!Number.isInteger(ans * 2)) { mins = 30; ans = r1 / 2; }
      text = 'A cyclist rides at a steady $' + r1 + '$ miles per hour for $' + mins + '$ minutes. How many miles does she ride?'; unit = 'miles';
      steps = ['The rate is in miles per <em>hour</em>, so write the time in hours: $' + mins + '\\text{ min} = \\frac{' + mins + '}{60}\\text{ h} = ' + tn(fr(mins, 60)) + '\\text{ h}$.', 'Use $d = rt$: $d = ' + r1 + ' \\cdot ' + tn(fr(mins, 60)) + ' = ' + tn(ans) + '$.'];
      return out({ q: text, a: num(ans), unit: 'miles', steps: steps.concat(['She rides $' + tn(ans) + '$ miles.']), hint: 'Change minutes to hours before you multiply.' }, { k: 'num', v: ans });
    }
    if (t === 'apart' || t === 'meet') {
      r1 = 5 * R.int(6, 14); r2 = 5 * R.int(6, 14); T1 = R.pick([2, 3, 4, 1.5, 2.5]); D = U.fix((r1 + r2) * T1);
      text = t === 'apart' ? 'Two cars leave the same town at the same time and drive in opposite directions, one at $' + r1 + '$ mph and the other at $' + r2 + '$ mph. After how many hours are they $' + D + '$ miles apart?'
        : 'Two towns are $' + D + '$ miles apart. A bus leaves one town at $' + r1 + '$ mph, and at the same time a truck leaves the other town at $' + r2 + '$ mph, driving toward the bus. After how many hours do they meet?';
      steps = ['Let $t$ be the time in hours. Both travel for the same time.' + drtTable([['\\text{first}', r1, 't', r1 + 't'], ['\\text{second}', r2, 't', r2 + 't']]),
        'Moving ' + (t === 'apart' ? 'apart' : 'toward each other') + ', the distances add up to the total: $' + r1 + 't + ' + r2 + 't = ' + D + '$.',
        'Combine: $' + (r1 + r2) + 't = ' + D + '$, so $t = \\frac{' + D + '}{' + (r1 + r2) + '} = ' + tn(T1) + '$.'];
      return out({ q: text, a: num(T1), unit: 'hours', steps: steps.concat(['Check: $' + r1 + ' \\cdot ' + tn(T1) + ' + ' + r2 + ' \\cdot ' + tn(T1) + ' = ' + D + '$.']), hint: 'Make a table with rate, time and distance for each one. How do the two distances combine?' }, { k: 'roots', eq: r1 + '*t+' + r2 + '*t=' + D, v: 't' });
    }
    if (t === 'faster') {
      var diff = R.pick([5, 10, 15, 20]); r1 = 5 * R.int(6, 12); T1 = R.pick([2, 3, 4]); D = (2 * r1 + diff) * T1;
      text = 'Two trains leave a station at the same time, going in opposite directions. One train is $' + diff + '$ mph faster than the other. After $' + T1 + '$ hours they are $' + D + '$ miles apart. How fast is the slower train?'; unit = 'mph';
      steps = ['Let $r$ be the slower speed; the faster train goes $r + ' + diff + '$.' + drtTable([['\\text{slower}', 'r', T1, T1 + 'r'], ['\\text{faster}', 'r + ' + diff, T1, T1 + '(r + ' + diff + ')']]),
        'Opposite directions, so the distances add: $' + T1 + 'r + ' + T1 + '(r + ' + diff + ') = ' + D + '$.',
        'Distribute and combine: $' + 2 * T1 + 'r + ' + T1 * diff + ' = ' + D + '$.',
        'Subtract $' + T1 * diff + '$: $' + 2 * T1 + 'r = ' + (D - T1 * diff) + '$. Divide by $' + 2 * T1 + '$: $r = ' + r1 + '$.'];
      return out({ q: text, a: num(r1), unit: 'mph', steps: steps.concat(['The slower train goes $' + r1 + '$ mph and the faster one $' + (r1 + diff) + '$ mph.']), hint: 'Call the slower speed $r$. Then the faster speed is $r + ' + diff + '$.' }, { k: 'roots', eq: T1 + '*r+' + T1 + '*(r+' + diff + ')=' + D, v: 'r' });
    }
    if (t === 'catch') {
      var rr = retry(function () { var tt = R.pick([1, 2, 3, 4]), hh = R.pick([1, 2, 0.5]), ra = 5 * R.int(6, 12), rb = ra * (tt + hh) / tt; return Number.isInteger(rb) && rb !== ra && rb <= 120 ? [tt, hh, ra, rb] : null; });
      T1 = rr[0]; h = rr[1]; r1 = rr[2]; r2 = rr[3];
      text = 'A truck leaves a depot at $' + r1 + '$ mph. ' + (h === 0.5 ? 'Half an hour' : U.words(h).replace(/^./, cap) + ' hour' + (h > 1 ? 's' : '')) + ' later, a car leaves the same depot on the same road at $' + r2 + '$ mph. How many hours after the car leaves does it catch up with the truck?';
      steps = ['Let $t$ be the car\'s driving time. The truck has driven $' + tn(h) + '$ hour' + (h === 1 ? '' : 's') + ' longer: $t + ' + tn(h) + '$.' + drtTable([['\\text{truck}', r1, 't + ' + tn(h), r1 + '(t + ' + tn(h) + ')'], ['\\text{car}', r2, 't', r2 + 't']]),
        'When the car catches up, both have gone the same distance: $' + r2 + 't = ' + r1 + '(t + ' + tn(h) + ')$.',
        'Distribute: $' + r2 + 't = ' + r1 + 't + ' + tn(U.fix(r1 * h)) + '$. Subtract $' + r1 + 't$: $' + (r2 - r1) + 't = ' + tn(U.fix(r1 * h)) + '$.',
        '$t = \\frac{' + tn(U.fix(r1 * h)) + '}{' + (r2 - r1) + '} = ' + T1 + '$.'];
      return out({ q: text, a: num(T1), unit: 'hours', steps: steps.concat(['Check: car $' + r2 + ' \\cdot ' + T1 + ' = ' + r2 * T1 + '$ miles, truck $' + r1 + ' \\cdot ' + tn(T1 + h) + ' = ' + tn(U.fix(r1 * (T1 + h))) + '$ miles.']), hint: 'Same direction: the distances are equal at the moment the car catches up.' }, { k: 'roots', eq: r2 + '*t=' + r1 + '*(t+' + h + ')', v: 't' });
    }
    // round trip
    var rr2 = retry(function () { var a1 = R.pick([10, 12, 15, 20, 30, 40, 45, 60]), a2 = R.pick([12, 15, 20, 24, 30, 36, 40, 60]); if (a1 === a2) return null; var dd = U.lcm(a1, a2) * R.pick([1, 2]); if (dd > 180) return null; return [a1, a2, dd]; });
    r1 = rr2[0]; r2 = rr2[1]; D = rr2[2]; var Tt = U.fix(D / r1 + D / r2);
    text = 'Sam drives to his grandmother\'s house at $' + r1 + '$ mph and comes home along the same road at $' + r2 + '$ mph. The two trips take $' + tn(Tt) + '$ hours in all. How far away does his grandmother live?'; unit = 'miles';
    var L2 = U.lcm(r1, r2);
    steps = ['Let $d$ be the one-way distance. Time is distance divided by rate.' + drtTable([['\\text{there}', r1, '\\frac{d}{' + r1 + '}', 'd'], ['\\text{back}', r2, '\\frac{d}{' + r2 + '}', 'd']]),
      'The times add up: $\\frac{d}{' + r1 + '} + \\frac{d}{' + r2 + '} = ' + tn(Tt) + '$.',
      'Multiply every term by $' + L2 + '$: $' + T.mono(L2 / r1, 'd') + T.coef(L2 / r2, 'd', false) + ' = ' + tn(U.fix(Tt * L2)) + '$.',
      'Combine: $' + (L2 / r1 + L2 / r2) + 'd = ' + tn(U.fix(Tt * L2)) + '$, so $d = ' + D + '$.'];
    return out({ q: text, a: num(D), unit: 'miles', steps: steps.concat(['Check: $\\frac{' + D + '}{' + r1 + '} + \\frac{' + D + '}{' + r2 + '} = ' + tn(U.fix(D / r1)) + ' + ' + tn(U.fix(D / r2)) + ' = ' + tn(Tt) + '$ hours.']), hint: 'Write each time as $\\frac{d}{r}$ and add the two times.' }, { k: 'roots', eq: 'd/' + r1 + '+d/' + r2 + '=' + nf(Tt), v: 'd' });
  });

  // ---- alg1.literal-equations
  var LIT = [
    { lv: 1, eq: 'A = lw', p: 'A=l*w', v: 'w', ans: 'A/l', tex: '\\frac{A}{l}', vars: ['A', 'l'], st: ['$w$ is multiplied by $l$. Undo that: divide both sides by $l$.', '$\\frac{A}{l} = w$.'] },
    { lv: 1, eq: 'd = rt', p: 'd=r*t', v: 't', ans: 'd/r', tex: '\\frac{d}{r}', vars: ['d', 'r'], st: ['$t$ is multiplied by $r$, so divide both sides by $r$.', '$\\frac{d}{r} = t$.'] },
    { lv: 1, eq: 'P = 2(l + w)', p: 'P=2*(l+w)', v: 'w', ans: 'P/2-l', tex: '\\frac{P}{2} - l', vars: ['P', 'l'], st: ['Divide both sides by $2$: $\\frac{P}{2} = l + w$.', 'Subtract $l$ from both sides: $\\frac{P}{2} - l = w$.'] },
    { lv: 1, eq: 'A = \\frac{1}{2}bh', p: 'A=b*h/2', v: 'h', ans: '2A/b', tex: '\\frac{2A}{b}', vars: ['A', 'b'], st: ['Multiply both sides by $2$: $2A = bh$.', 'Divide both sides by $b$: $\\frac{2A}{b} = h$.'] },
    { lv: 2, eq: 'P = 2l + 2w', p: 'P=2*l+2*w', v: 'l', ans: '(P-2w)/2', tex: '\\frac{P - 2w}{2}', vars: ['P', 'w'], st: ['Subtract $2w$ from both sides: $P - 2w = 2l$.', 'Divide <em>both sides</em> by $2$ (the whole left side): $\\frac{P - 2w}{2} = l$.'] },
    { lv: 2, eq: 'y = mx + b', p: 'y=m*x+b', v: 'x', ans: '(y-b)/m', tex: '\\frac{y - b}{m}', vars: ['y', 'm', 'b'], st: ['Subtract $b$ from both sides: $y - b = mx$.', 'Divide both sides by $m$. The whole side $y - b$ is divided: $\\frac{y - b}{m} = x$.'] },
    { lv: 2, eq: 'I = Prt', p: 'I=P*r*t', v: 'r', ans: 'I/(P*t)', tex: '\\frac{I}{Pt}', vars: ['I', 'P', 't'], st: ['$r$ is multiplied by $P$ and by $t$. Divide both sides by $Pt$.', '$\\frac{I}{Pt} = r$.'] },
    { lv: 2, eq: 'V = \\pi r^2 h', p: 'V=pi*r^2*h', v: 'h', ans: 'V/(pi*r^2)', tex: '\\frac{V}{\\pi r^2}', vars: ['V', 'r'], st: ['$h$ is multiplied by $\\pi r^2$. Divide both sides by $\\pi r^2$.', '$\\frac{V}{\\pi r^2} = h$.'] },
    { lv: 2, eq: 'v = u + at', p: 'v=u+a*t', v: 't', ans: '(v-u)/a', tex: '\\frac{v - u}{a}', vars: ['v', 'u', 'a'], st: ['Subtract $u$ from both sides: $v - u = at$.', 'Divide both sides by $a$: $\\frac{v - u}{a} = t$.'] },
    { lv: 2, eq: 'S = 2\\pi r h', p: 'S=2*pi*r*h', v: 'h', ans: 'S/(2*pi*r)', tex: '\\frac{S}{2\\pi r}', vars: ['S', 'r'], st: ['$h$ is multiplied by $2\\pi r$. Divide both sides by $2\\pi r$.', '$\\frac{S}{2\\pi r} = h$.'] },
    { lv: 3, eq: 'C = \\frac{5}{9}(F - 32)', p: 'C=5/9*(F-32)', v: 'F', ans: '9C/5+32', tex: '\\frac{9}{5}C + 32', vars: ['C'], st: ['Multiply both sides by $\\frac{9}{5}$, the reciprocal of $\\frac{5}{9}$: $\\frac{9}{5}C = F - 32$.', 'Add $32$ to both sides: $\\frac{9}{5}C + 32 = F$.'] },
    { lv: 3, eq: 'ax + by = c', p: 'a*x+b*y=c', v: 'y', ans: '(c-a*x)/b', tex: '\\frac{c - ax}{b}', vars: ['a', 'b', 'c', 'x'], st: ['Subtract $ax$ from both sides: $by = c - ax$.', 'Divide both sides by $b$: $y = \\frac{c - ax}{b}$.'] },
    { lv: 3, eq: 'A = P + Prt', p: 'A=P+P*r*t', v: 'P', ans: 'A/(1+r*t)', tex: '\\frac{A}{1 + rt}', vars: ['A', 'r', 't'], st: ['$P$ appears in two terms. Factor it out: $A = P(1 + rt)$.', 'Divide both sides by $1 + rt$: $\\frac{A}{1 + rt} = P$.'] },
    { lv: 3, eq: 'm = \\frac{a + b + c}{3}', p: 'm=(a+b+c)/3', v: 'c', ans: '3m-a-b', tex: '3m - a - b', vars: ['m', 'a', 'b'], st: ['Multiply both sides by $3$: $3m = a + b + c$.', 'Subtract $a$ and $b$ from both sides: $3m - a - b = c$.'] }
  ];
  G('alg1.literal-equations', function (R, ctx) {
    if (R.chance(by(ctx, 0.45, 0.4, 0.3))) { // numeric coefficients: solve Ax + By = C for y
      var A = R.nz(-6, 6), B = R.pick([2, 3, 4, 5, -2, -3]), C = R.nz(-12, 12);
      var sg = B < 0 ? -1 : 1, ansP = '(' + pterms([[-A * sg, 'x'], [C * sg, '']]) + ')/' + (B * sg);
      var top = T.lin(-A, 'x', C).replace(/^/, '');
      return out({
        q: 'Solve $' + T.lin(A, 'x', 0) + T.coef(B, 'y', false) + ' = ' + C + '$ for $y$.',
        a: { t: 'expr', v: ansP, vars: ['x'] },
        steps: [(A > 0 ? 'Subtract $' + T.mono(A, 'x') + '$ from' : 'Add $' + T.mono(-A, 'x') + '$ to') + ' both sides: $' + T.mono(B, 'y') + ' = ' + top + '$.',
          'Divide both sides by $' + B + '$, the whole right side included: $y = \\frac{' + top + '}{' + B + '}$' + (B < 0 ? ' $= \\frac{' + T.lin(A, 'x', -C) + '}{' + (-B) + '}$' : '') + '.',
          'You may also write it as $y = ' + T.lin(fr(-A, B), 'x', fr(C, B)) + '$.'],
        hint: 'Get the $y$ term alone first, then divide every term by its coefficient.'
      }, { k: 'formula', eq: A + '*x+' + pp(B) + '*y=' + C, v: 'y', vars: ['x'] });
    }
    var pool = LIT.filter(function (f) { return f.lv <= ctx.level && f.lv >= ctx.level - 1; });
    var F = R.pick(pool);
    return out({
      q: 'Solve $' + F.eq + '$ for $' + F.v + '$.',
      a: { t: 'expr', v: F.ans, vars: F.vars },
      steps: F.st.concat(['So $' + F.v + ' = ' + F.tex + '$.']),
      hint: 'Treat every other letter as a number. Undo what is being done to $' + F.v + '$, in reverse order.'
    }, { k: 'formula', eq: F.p, v: F.v, vars: F.vars });
  });

  // ---- alg1.absolute-value-equations
  G('alg1.absolute-value-equations', function (R, ctx) {
    var shape = R.pick(by(ctx, ['basic', 'basic', 'outer'], ['outer', 'coef', 'basic'], ['outer', 'coef', 'special', 'special']));
    var p = R.nz(-8, 8), k, m = 1, A = 1, B = 0, C, sols, steps = [], inner, eqTex, plainEq;
    if (shape === 'coef') m = R.pick([2, 3, 4]);
    inner = tlin(m, p);
    if (shape === 'basic' || shape === 'coef') {
      k = R.int(1, 12); C = k;
      eqTex = T.abs(inner) + ' = ' + k;
    } else {
      A = R.pick([2, 3, 4, -2, -3]); B = R.nz(-9, 9);
      k = shape === 'special' ? R.pick([0, -R.int(1, 5)]) : R.int(1, 8);
      C = A * k + B;
      eqTex = (A === -1 ? '-' : A) + T.abs(inner) + T.signed(B) + ' = ' + C;
      steps.push((B > 0 ? 'Subtract $' + B + '$ from' : 'Add $' + (-B) + '$ to') + ' both sides: $' + tn(A) + T.abs(inner) + ' = ' + (C - B) + '$.');
      steps.push('Divide both sides by $' + tn(A) + '$: $' + T.abs(inner) + ' = ' + k + '$.');
    }
    plainEq = (A === 1 ? '' : A + '*') + 'abs(' + plin(m, p) + ')+(' + B + ')=' + C;
    if (k < 0) {
      sols = [];
      steps.push('An absolute value is a distance, and a distance is never negative. No number makes $' + T.abs(inner) + ' = ' + k + '$.');
    } else if (k === 0) {
      sols = [fr(-p, m)];
      steps.push('Only $0$ is at distance $0$ from $0$, so $' + inner + ' = 0$.');
      steps.push((m === 1 ? '' : 'Solve: ') + '$x = ' + tn(fr(-p, m)) + '$. There is just one solution.');
    } else {
      sols = [fr(k - p, m), fr(-k - p, m)];
      steps.push('Two numbers are at distance $' + k + '$ from $0$: $' + k + '$ and $-' + k + '$. So $' + inner + ' = ' + k + '$ or $' + inner + ' = -' + k + '$.');
      steps.push('First case: $' + T.mono(m, 'x') + ' = ' + (k - p) + '$' + (m > 1 ? ', so $x = ' + tn(sols[0]) + '$' : '') + '. Second case: $' + T.mono(m, 'x') + ' = ' + (-k - p) + '$' + (m > 1 ? ', so $x = ' + tn(sols[1]) + '$' : '') + '.');
      steps.push('Check one: $' + T.abs(tsub(m, sols[0], p)) + ' = ' + T.abs(k) + ' = ' + k + '$.');
    }
    return out({
      q: 'Solve: $' + eqTex + '$',
      a: setA(sols),
      steps: steps.concat([sols.length ? 'Solution' + (sols.length > 1 ? 's' : '') + ': $x = ' + tset(sols) + '$.' : 'There is no solution.']),
      hint: shape === 'basic' || shape === 'coef' ? 'The expression inside the bars is either ' + k + ' or its opposite.' : 'Get the absolute value alone on one side first.'
    }, { k: 'roots', eq: plainEq });
  });


  // ================================================================ Unit 3: Inequalities
  var RELW = { '<': 'less than', '<=': 'less than or equal to', '>': 'greater than', '>=': 'greater than or equal to' };
  function relOf(R) { return R.pick(['<', '<=', '>', '>=']); }

  // ---- alg1.multi-step-inequalities
  G('alg1.multi-step-inequalities', function (R, ctx) {
    var shape = R.pick(by(ctx, ['neg', 'both', 'test'], ['both', 'dist', 'neg'], ['dist', 'both', 'frac']));
    var rel = relOf(R), x0 = R.nz(-7, 7), a, b, c, d, k, p, S, steps = [], qTex, parts, lf, rf, lt;
    if (shape === 'test') {
      a = R.pick([-2, -3, -4, 2, 3]); b = R.nz(-9, 9); c = a * x0 + b + R.pick([-2, -1, 1, 2]) * (a > 0 ? 1 : -1);
      var tx = R.pick([x0 - 1, x0, x0 + 1, x0 + 2]), val = a * tx + b, ok = { '<': val < c, '<=': val <= c, '>': val > c, '>=': val >= c }[rel];
      return {
        q: 'True or false: $x = ' + tx + '$ is a solution of $' + tlin(a, b) + ' ' + TREL[rel] + ' ' + c + '$.',
        a: tf(ok),
        steps: ['Substitute $' + tx + '$ for $x$: $' + tsub(a, tx, b) + ' = ' + val + '$.', 'Is $' + val + ' ' + TREL[rel] + ' ' + c + '$? ' + (ok ? 'Yes' : 'No') + ', so $x = ' + tx + '$ ' + (ok ? 'is' : 'is not') + ' a solution.'],
        hint: 'Substitute the number and see whether the inequality is true.'
      };
    }
    if (shape === 'neg') {
      a = -R.int(2, 6); b = R.nz(-12, 12); c = a * x0 + b;
      qTex = tlin(a, b) + ' ' + TREL[rel] + ' ' + c; parts = [{ l: plin(a, b), op: rel, r: String(c) }];
      S = ineqSteps(a, b, rel, 0, c);
      lf = function (x) { return q(x).mul(a).add(b); }; rf = function () { return q(c); }; lt = function (x) { return tsub(a, x, b); };
    } else if (shape === 'both') {
      a = R.nz(-6, 6); c = R.intNot(-6, 6, [a]); b = R.nz(-12, 12); d = (a - c) * x0 + b;
      if (a - c > 0 && R.chance(0.5)) { var t = a; a = c; c = t; d = (a - c) * x0 + b; }
      qTex = tlin(a, b) + ' ' + TREL[rel] + ' ' + tlin(c, d); parts = [{ l: plin(a, b), op: rel, r: plin(c, d) }];
      S = ineqSteps(a, b, rel, c, d);
      lf = function (x) { return q(x).mul(a).add(b); }; rf = function (x) { return q(x).mul(c).add(d); }; lt = function (x) { return tsub(a, x, b); };
    } else if (shape === 'dist') {
      k = R.pick([2, 3, 4, -2, -3]); p = R.nz(-5, 5); c = R.intNot(-5, 5, [k]); d = (k - c) * x0 + k * p;
      qTex = tn(k) + tfac(1, p) + ' ' + TREL[rel] + ' ' + tlin(c, d); parts = [{ l: k + '*(' + plin(1, p) + ')', op: rel, r: plin(c, d) }];
      steps.push('Distribute $' + tn(k) + '$: $' + tlin(k, k * p) + ' ' + TREL[rel] + ' ' + tlin(c, d) + '$.');
      S = ineqSteps(k, k * p, rel, c, d);
      lf = function (x) { return q(x).add(p).mul(k); }; rf = function (x) { return q(x).mul(c).add(d); }; lt = function (x) { return tn(k) + '(' + tn(x) + T.signed(p) + ')'; };
    } else { // fractions: x/m + b REL c x... -> keep simple: (a/m) x + b REL c
      var m = R.pick([2, 3, 4, 5]); a = R.pick([1, -1, 2, -2, 3, -3]); if (gcd(abs(a), m) !== 1) a = a > 0 ? 1 : -1;
      b = R.nz(-6, 6); c = R.nz(-8, 8);
      var co = fr(a, m);
      qTex = fx(co) + T.signed(b) + ' ' + TREL[rel] + ' ' + c; parts = [{ l: '(' + a + ')/' + m + '*x+(' + b + ')', op: rel, r: String(c) }];
      steps.push('Multiply both sides by $' + m + '$ (positive, so the sign stays): $' + tlin(a, b * m) + ' ' + TREL[rel] + ' ' + c * m + '$.');
      S = ineqSteps(a, b * m, rel, 0, c * m);
      lf = function (x) { return co.mul(x).add(b); }; rf = function () { return q(c); }; lt = function (x) { return tn(co) + ' \\cdot ' + tp(x) + T.signed(b); };
    }
    steps = steps.concat(S.steps);
    var ans = ineqStr('x', S.rel, S.x);
    return out({
      q: 'Solve: $' + qTex + '$',
      a: { t: 'ineq', v: ans },
      steps: steps.concat([(function () { var xt = S.x.isInt() ? S.x.add(S.rel[0] === '<' ? -1 : 1) : (S.rel[0] === '<' ? S.x.floor() : S.x.floor().add(1)); var L = lf(xt), Rr = rf(xt); return 'Check a number on the solution side, $x = ' + tn(xt) + '$: $' + lt(xt) + ' = ' + tn(L) + '$' + (shape === 'neg' || shape === 'frac' ? '' : ' and the right side is $' + tn(Rr) + '$') + '. Is $' + tn(L) + ' ' + TREL[rel] + ' ' + tn(Rr) + '$? Yes.'; })()]),
      hint: 'Solve it like an equation. If you multiply or divide both sides by a negative number, reverse the inequality sign.'
    }, { k: 'ineq', parts: parts, join: 'and', pts: [S.x.toNumber()] });
  });

  // ---- alg1.inequality-word-problems
  G('alg1.inequality-word-problems', function (R, ctx) {
    var t = R.pick(by(ctx, ['words', 'budget', 'elevator', 'words'], ['budget', 'raise', 'elevator', 'plans'], ['raise', 'average', 'plans', 'budget']));
    if (t === 'words') {
      var W = R.pick([['at least', '>='], ['at most', '<='], ['no more than', '<='], ['no less than', '>='], ['more than', '>'], ['fewer than', '<']]), n = R.int(5, 60), v = R.pick(['x', 'n', 'p', 'h']);
      var opts = ['>=', '<=', '>', '<'].map(function (r) { return '$' + v + ' ' + TREL[r] + ' ' + n + '$'; });
      var right = '$' + v + ' ' + TREL[W[1]] + ' ' + n + '$';
      return {
        q: 'Which inequality says "$' + v + '$ is ' + W[0] + ' $' + n + '$"?',
        a: mc(right, opts.filter(function (o) { return o !== right; })),
        steps: ['"' + cap(W[0]) + ' ' + n + '" means ' + { '>=': n + ' or more, so ' + n + ' itself is allowed', '<=': n + ' or less, so ' + n + ' itself is allowed', '>': 'bigger than ' + n + ', not ' + n + ' itself', '<': 'smaller than ' + n + ', not ' + n + ' itself' }[W[1]] + '.', 'So the inequality is ' + right + '.'],
        hint: 'Ask: is ' + n + ' itself allowed? If yes, the sign includes "or equal to".'
      };
    }
    var a, b, c, rel, story, varDef, ineqTex, roundUp, unitW, solveTxt, parts;
    if (t === 'budget') {
      var cash = R.pick([40, 50, 60, 75, 100]), shirt = R.pick([12, 15, 18, 20, 9]), tk = R.pick([6, 7, 8, 9, 11]);
      if ((cash - shirt) % tk === 0) cash += 1;
      story = 'You have $' + money(cash) + '$ to spend at a fair. You buy a T-shirt for $' + money(shirt) + '$, and ride tickets cost $' + money(tk) + '$ each. What is the greatest number of ride tickets you can buy?';
      varDef = 'Let $t$ be the number of tickets. The total spent must be <em>at most</em> $' + money(cash) + '$.';
      a = tk; b = shirt; c = cash; rel = '<='; ineqTex = shirt + ' + ' + tk + 't \\le ' + cash; roundUp = false; unitW = 'tickets';
    } else if (t === 'raise') {
      var goal = R.pick([300, 400, 500, 650]), have = R.pick([45, 85, 120, 60]), price = R.pick([6, 8, 12, 15]);
      if ((goal - have) % price === 0) have += 5;
      story = 'A club needs to raise at least $' + money(goal) + '$. It already has $' + money(have) + '$ and sells candles for $' + money(price) + '$ each. What is the fewest candles it must sell?';
      varDef = 'Let $c$ be the number of candles. The money raised must be <em>at least</em> $' + money(goal) + '$.';
      a = price; b = have; c = goal; rel = '>='; ineqTex = have + ' + ' + price + 'c \\ge ' + goal; roundUp = true; unitW = 'candles';
    } else if (t === 'elevator') {
      var cap0 = R.pick([1000, 1200, 1500, 900]), wk = R.pick([70, 80, 90, 75]), bx = R.pick([30, 35, 40, 45, 25]);
      if ((cap0 - wk) % bx === 0) wk += 5;
      story = 'An elevator can safely carry at most $' + cap0 + '$ kg. A worker who weighs $' + wk + '$ kg is moving boxes that weigh $' + bx + '$ kg each. What is the greatest number of boxes she can take in one trip?';
      varDef = 'Let $b$ be the number of boxes. The total weight must be <em>at most</em> $' + cap0 + '$ kg.';
      a = bx; b = wk; c = cap0; rel = '<='; ineqTex = wk + ' + ' + bx + 'b \\le ' + cap0; roundUp = false; unitW = 'boxes';
    } else if (t === 'plans') {
      var base = R.pick([20, 25, 30]), per = R.pick([0.1, 0.05, 0.25, 0.2]), flat = base + R.pick([10, 15, 20, 12]);
      var lim = U.fix((flat - base) / per); if (Number.isInteger(lim)) { /* strict: the most is lim - 1 */ }
      story = 'Plan A costs $' + money(base) + '$ a month plus $' + money(per) + '$ per text. Plan B costs $' + money(flat) + '$ a month with unlimited texts. What is the greatest number of texts in a month for which Plan A costs <em>less</em> than Plan B?';
      varDef = 'Let $n$ be the number of texts. Plan A must cost <em>less than</em> Plan B.';
      a = per; b = base; c = flat; rel = '<'; ineqTex = base + ' + ' + tn(per) + 'n < ' + flat; roundUp = false; unitW = 'texts';
    } else {
      var rr = retry(function () { var s0 = R.int(68, 95), s1 = R.int(68, 95), tg = R.pick([80, 82, 85, 88, 90]), nd = R.int(72, 99), s2 = 4 * tg - nd - s0 - s1; return s2 >= 62 && s2 <= 100 ? [[s0, s1, s2], tg, nd] : null; }, 200);
      var sc = rr[0], target = rr[1], need = rr[2], sum = sc[0] + sc[1] + sc[2];
      story = 'Ari scored $' + sc.join('$, $') + '$ on three tests. What is the lowest score on the fourth test that makes the average of all four at least $' + target + '$?';
      varDef = 'Let $s$ be the fourth score. The average is $\\frac{' + sc.join(' + ') + ' + s}{4}$, and it must be at least $' + target + '$.';
      var stepsA = [varDef, 'Write the inequality: $\\frac{' + sum + ' + s}{4} \\ge ' + target + '$.', 'Multiply both sides by $4$: $' + sum + ' + s \\ge ' + 4 * target + '$.', 'Subtract $' + sum + '$: $s \\ge ' + need + '$.', 'The lowest score that works is $' + need + '$.'];
      return out({ q: story, a: num(need), steps: stepsA, hint: 'The average is the sum divided by 4. Set it at least ' + target + '.' }, { k: 'num', v: need });
    }
    var bound = q(c).sub(b).div(a), ans;
    if (rel === '<') ans = bound.isInt() ? bound.toNumber() - 1 : Math.floor(bound.toNumber());
    else if (rel === '<=') ans = Math.floor(bound.toNumber());
    else ans = Math.ceil(bound.toNumber());
    var vn = { budget: 't', raise: 'c', elevator: 'b', plans: 'n' }[t];
    var steps = [varDef, 'Write the inequality: $' + ineqTex + '$.',
      'Subtract $' + tn(b) + '$ from both sides: $' + T.mono(a, vn) + ' ' + TREL[rel] + ' ' + tn(q(c).sub(b)) + '$.',
      'Divide by $' + tn(a) + '$ (positive, so the sign stays): $' + vn + ' ' + TREL[rel] + ' ' + (bound.isInt() ? tn(bound) : tn(bound) + ' \\approx ' + T.num(U.round(bound.toNumber(), 2))) + '$.',
      roundUp ? 'The number of ' + unitW + ' must be a whole number, and it must be at least ' + (bound.isInt() ? tn(bound) : 'this much') + ', so round <em>up</em>: $' + ans + '$.' : (rel === '<' && bound.isInt() ? 'It must be a whole number <em>less than</em> $' + tn(bound) + '$, so the greatest is $' + ans + '$.' : 'The number of ' + unitW + ' must be a whole number no more than this, so round <em>down</em>: $' + ans + '$.')];
    return out({
      q: story,
      a: num(ans), unit: unitW,
      steps: steps.concat(['Check: with ' + ans + ' ' + unitW + ', $' + tn(b) + ' + ' + tn(a) + ' \\cdot ' + ans + ' = ' + tn(q(a).mul(ans).add(b)) + '$, which ' + (rel[0] === '<' ? 'stays within' : 'reaches') + ' $' + tn(c) + '$.']),
      hint: 'Write an inequality for the total, solve it, then decide whether to round up or down for a whole number.'
    }, { k: 'num', v: ans });
  });

  // ---- alg1.compound-inequalities
  function mid3(lo, loRel, hi, hiRel, v) { return tn(lo) + ' ' + TREL[loRel] + ' ' + (v || 'x') + ' ' + TREL[hiRel] + ' ' + tn(hi); }
  G('alg1.compound-inequalities', function (R, ctx) {
    var shape = R.pick(by(ctx, ['and', 'and', 'or'], ['and', 'or', 'andneg', 'andword'], ['andneg', 'or', 'special', 'andword']));
    var m, b, lo, hi, r1, r2, x1, x2, steps = [], ans, qTex, parts, join = 'and';
    if (shape === 'and' || shape === 'andneg') {
      m = shape === 'andneg' ? -R.int(2, 4) : R.int(2, 5); b = R.nz(-7, 7);
      x1 = R.int(-6, 2); x2 = x1 + R.int(2, 7);
      r1 = R.pick(['<', '<=']); r2 = R.pick(['<', '<=']);
      // m > 0: L r1 m x + b r2 H with L = m x1 + b, H = m x2 + b. m < 0: L = m x2 + b, H = m x1 + b
      var L = m > 0 ? m * x1 + b : m * x2 + b, H = m > 0 ? m * x2 + b : m * x1 + b;
      qTex = L + ' ' + TREL[r1] + ' ' + tlin(m, b) + ' ' + TREL[r2] + ' ' + H;
      parts = [{ l: String(L), op: r1, r: plin(m, b) }, { l: plin(m, b), op: r2, r: String(H) }];
      steps.push('A compound inequality like this means both parts are true at once. Do the same thing to all three parts.');
      steps.push(undo(b).replace('both sides', 'all three parts') + ': $' + (L - b) + ' ' + TREL[r1] + ' ' + T.mono(m, 'x') + ' ' + TREL[r2] + ' ' + (H - b) + '$.');
      if (m > 0) { steps.push('Divide all three parts by $' + m + '$: $' + mid3(x1, r1, x2, r2) + '$.'); ans = pq(x1) + ' ' + r1 + ' x ' + r2 + ' ' + pq(x2); }
      else {
        steps.push('Divide all three parts by $' + m + '$. Dividing by a negative reverses both signs: $' + tn(fr(L - b, m)) + ' ' + TREL[FLIP[r1]] + ' x ' + TREL[FLIP[r2]] + ' ' + tn(fr(H - b, m)) + '$.');
        steps.push('Rewrite it from smallest to largest: $' + mid3(x1, r2, x2, r1) + '$.');
        ans = pq(x1) + ' ' + r2 + ' x ' + r1 + ' ' + pq(x2);
      }
    } else if (shape === 'andword') {
      var a1 = R.pick([2, 3]), b1 = R.nz(-6, 6); x1 = R.int(-5, 1); r1 = R.pick(['>', '>=']);
      var c1 = a1 * x1 + b1, b2 = R.nz(-6, 6); x2 = x1 + R.int(2, 6); r2 = R.pick(['<', '<=']); var c2 = x2 + b2;
      qTex = tlin(a1, b1) + ' ' + TREL[r1] + ' ' + c1 + ' \\text{ and } ' + tlin(1, b2) + ' ' + TREL[r2] + ' ' + c2;
      parts = [{ l: plin(a1, b1), op: r1, r: String(c1) }, { l: plin(1, b2), op: r2, r: String(c2) }];
      steps.push('Solve each part. First: ' + undo(b1).toLowerCase() + ', then divide by $' + a1 + '$: $x ' + TREL[r1] + ' ' + x1 + '$.');
      steps.push('Second: ' + undo(b2).toLowerCase() + ': $x ' + TREL[r2] + ' ' + x2 + '$.');
      steps.push('"And" means both must be true: the numbers between, where the two graphs overlap. $' + mid3(x1, r1 === '>' ? '<' : '<=', x2, r2) + '$.');
      ans = pq(x1) + ' ' + (r1 === '>' ? '<' : '<=') + ' x ' + r2 + ' ' + pq(x2);
    } else if (shape === 'or') {
      join = 'or';
      var a1o = R.pick([1, 2, 3]), b1o = R.nz(-6, 6); x1 = R.int(-6, 0); var c1o = a1o * x1 + b1o;
      var a2o = R.pick([1, 2, -2, -1]), b2o = R.nz(-6, 6); x2 = x1 + R.int(2, 6); var c2o = a2o * x2 + b2o;
      r1 = R.pick(['<', '<=']); r2 = R.pick(['>', '>=']); var r2s = a2o < 0 ? FLIP[r2] : r2;
      qTex = tlin(a1o, b1o) + ' ' + TREL[r1] + ' ' + c1o + ' \\text{ or } ' + tlin(a2o, b2o) + ' ' + TREL[r2s] + ' ' + c2o;
      parts = [{ l: plin(a1o, b1o), op: r1, r: String(c1o) }, { l: plin(a2o, b2o), op: r2s, r: String(c2o) }];
      var S1 = ineqSteps(a1o, b1o, r1, 0, c1o), S2 = ineqSteps(a2o, b2o, r2s, 0, c2o);
      steps.push('Solve each part on its own. First part: $x ' + TREL[S1.rel] + ' ' + tn(S1.x) + '$.');
      steps.push('Second part' + (a2o < 0 ? ' (dividing by a negative flips the sign)' : '') + ': $x ' + TREL[S2.rel] + ' ' + tn(S2.x) + '$.');
      steps.push('"Or" means at least one is true: every number in either piece. The answer stays as two pieces: $x ' + TREL[S1.rel] + ' ' + tn(S1.x) + '$ or $x ' + TREL[S2.rel] + ' ' + tn(S2.x) + '$.');
      ans = 'x ' + S1.rel + ' ' + pq(S1.x) + ' or x ' + S2.rel + ' ' + pq(S2.x);
    } else { // special: an "or" that covers everything, or an "and" with no overlap
      var kind = R.coin() ? 'all' : 'none'; x1 = R.int(-4, 3); x2 = x1 + R.int(2, 5);
      if (kind === 'all') {
        join = 'or';
        qTex = 'x + ' + 3 + ' > ' + (x1 + 3) + ' \\text{ or } x - 2 < ' + (x2 - 2);
        parts = [{ l: 'x+3', op: '>', r: String(x1 + 3) }, { l: 'x-2', op: '<', r: String(x2 - 2) }];
        steps.push('First part: $x > ' + x1 + '$. Second part: $x < ' + x2 + '$.');
        steps.push('"Or" takes every number in either piece. Since $' + x1 + ' < ' + x2 + '$, every number is greater than $' + x1 + '$ or less than $' + x2 + '$ (the pieces overlap and together cover the line).');
        ans = 'all';
      } else {
        qTex = '2x - 1 < ' + (2 * x1 - 1) + ' \\text{ and } x + 4 > ' + (x2 + 4);
        parts = [{ l: '2x-1', op: '<', r: String(2 * x1 - 1) }, { l: 'x+4', op: '>', r: String(x2 + 4) }];
        steps.push('First part: $2x < ' + 2 * x1 + '$, so $x < ' + x1 + '$. Second part: $x > ' + x2 + '$.');
        steps.push('"And" needs both at once: a number less than $' + x1 + '$ and greater than $' + x2 + '$. Since $' + x1 + ' < ' + x2 + '$, no number does both.');
        ans = 'none';
      }
    }
    return out({
      q: 'Solve: $' + qTex + '$',
      a: { t: 'ineq', v: ans },
      steps: steps.concat([ans === 'all' ? 'Answer: all real numbers.' : ans === 'none' ? 'Answer: no solution.' : 'Graph it to check: ' + (join === 'or' ? 'two rays pointing away from each other.' : 'one segment between the endpoints.')]),
      hint: shape === 'or' || join === 'or' ? 'Solve each part separately, then keep every number that works in at least one part.' : 'Do the same operation to every part; flip the signs if you divide by a negative.'
    }, { k: 'ineq', parts: parts, join: join, pts: [x1, x2] });
  });

  // ---- alg1.absolute-value-inequalities
  G('alg1.absolute-value-inequalities', function (R, ctx) {
    var shape = R.pick(by(ctx, ['lt', 'gt', 'lt'], ['lt', 'gt', 'outer'], ['outer', 'coef', 'special', 'gt']));
    var m = shape === 'coef' ? R.pick([2, 3, 4]) : 1, p = R.nz(-6, 6), k = R.int(1, 8), A = 1, B = 0, rel, steps = [], qTex, ans, Cc;
    rel = shape === 'lt' ? R.pick(['<', '<=']) : shape === 'gt' ? R.pick(['>', '>=']) : relOf(R);
    var inner = tlin(m, p);
    if (shape === 'outer' || shape === 'special') {
      A = R.pick([2, 3, -2]); B = R.nz(-8, 8);
      if (shape === 'special') k = -R.int(1, 4);
      Cc = A * k + B;
      var r0 = A < 0 ? FLIP[rel] : rel;
      qTex = tn(A) + T.abs(inner) + T.signed(B) + ' ' + TREL[r0] + ' ' + Cc;
      steps.push(undo(B) + ': $' + tn(A) + T.abs(inner) + ' ' + TREL[r0] + ' ' + (Cc - B) + '$.');
      steps.push('Divide both sides by $' + tn(A) + '$' + (A < 0 ? ', a negative number, so the sign flips' : '') + ': $' + T.abs(inner) + ' ' + TREL[rel] + ' ' + k + '$.');
      var parts0 = [{ l: A + '*abs(' + plin(m, p) + ')+(' + B + ')', op: r0, r: String(Cc) }];
    } else {
      qTex = T.abs(inner) + ' ' + TREL[rel] + ' ' + k;
    }
    var parts = parts0 || [{ l: 'abs(' + plin(m, p) + ')', op: rel, r: String(k) }];
    var lo = fr(-k - p, m), hi = fr(k - p, m);
    if (k < 0) {
      ans = rel[0] === '<' ? 'none' : 'all';
      steps.push('An absolute value is a distance, so it is never negative. ' + (rel[0] === '<' ? 'It can never be less than $' + k + '$: no solution.' : 'It is always greater than $' + k + '$: every real number works.'));
    } else if (rel[0] === '<') {
      steps.push('"Distance ' + (rel === '<' ? 'less than ' : 'at most ') + k + '" means the inside is between $-' + k + '$ and $' + k + '$: $-' + k + ' ' + TREL[rel] + ' ' + inner + ' ' + TREL[rel] + ' ' + k + '$.');
      steps.push(undo(p).replace('both sides', 'all three parts') + (m > 1 ? ', then divide by $' + m + '$' : '') + ': $' + mid3(lo, rel, hi, rel) + '$.');
      ans = pq(lo) + ' ' + rel + ' x ' + rel + ' ' + pq(hi);
    } else {
      var lr = FLIP[rel];
      steps.push('"Distance ' + (rel === '>' ? 'greater than ' : 'at least ') + k + '" means the inside is beyond $' + k + '$ on either side: $' + inner + ' ' + TREL[lr] + ' -' + k + '$ or $' + inner + ' ' + TREL[rel] + ' ' + k + '$.');
      steps.push('Solve each part: $x ' + TREL[lr] + ' ' + tn(lo) + '$ or $x ' + TREL[rel] + ' ' + tn(hi) + '$.');
      ans = 'x ' + lr + ' ' + pq(lo) + ' or x ' + rel + ' ' + pq(hi);
    }
    return out({
      q: 'Solve: $' + qTex + '$',
      a: { t: 'ineq', v: ans },
      steps: steps.concat([ans === 'none' ? 'Answer: no solution.' : ans === 'all' ? 'Answer: all real numbers.' : rel[0] === '<' ? 'One segment, centered at $' + tn(fr(-p, m)) + '$. Check: the center works, and so does any number just inside the ends.' : 'Two rays pointing away from $' + tn(fr(-p, m)) + '$. Check: the center does not work, but numbers far away do.']),
      hint: 'Get the absolute value alone. "Less than" becomes one "and" (a segment); "greater than" becomes an "or" (two rays).'
    }, { k: 'ineq', parts: parts, join: 'and', pts: [lo.toNumber(), hi.toNumber()] });
  });


  // ================================================================ Unit 4: Functions
  function quadF(R, lv) { // a friendly f(x): linear or quadratic, as [coeffs]
    return R.pick(by({ level: lv }, [[R.nz(-5, 5), R.int(-9, 9)]], [[R.pick([1, -1, 2]), R.nz(-5, 5), R.int(-8, 8)], [R.nz(-5, 5), R.int(-9, 9)]], [[R.pick([1, -1, 2, -2, 3]), R.nz(-6, 6), R.int(-9, 9)]]));
  }
  function pevalQ(cs, x) { var v = q(0); cs.forEach(function (c) { v = v.mul(x).add(c); }); return v; }
  function substTex(cs, x) { // "2(-3)^{2} - 4(-3) + 1", "3 \\cdot 2^{2} + 1"; at x = 0 just the constant term
    x = q(x); var n = cs.length - 1;
    if (x.isZero()) return tn(cs[n]);
    var s = '';
    cs.forEach(function (c, i) {
      c = q(c); var k = n - i; if (c.isZero()) return;
      var mag = c.abs(), base = k === 0 ? '' : k === 1 ? tp(x) : tp(x) + '^{' + k + '}', piece;
      if (k === 0) piece = tn(mag); else if (mag.eq(1)) piece = base; else piece = tn(mag) + (x.sign() < 0 ? '' : ' \\cdot ') + base;
      s += s === '' ? (c.sign() < 0 ? '-' : '') + piece : (c.sign() < 0 ? ' - ' : ' + ') + piece;
    });
    return s || '0';
  }

  // ---- alg1.function-notation
  G('alg1.function-notation', function (R, ctx) {
    var shape = R.pick(by(ctx, ['eval', 'eval', 'meaning'], ['eval', 'combo', 'table', 'meaning'], ['combo', 'shift', 'table', 'eval']));
    var name = R.pick(['f', 'g', 'h']);
    if (shape === 'meaning') {
      var m = R.int(2, 6), b = R.nz(-6, 6), k = R.int(2, 6);
      return {
        q: 'If $' + name + '(x) = ' + tlin(m, b) + '$, what does $' + name + '(' + k + ')$ mean?',
        a: mc('The output of ' + name + ' when the input is ' + k, [name + ' times ' + k, 'The input that gives an output of ' + k, k + ' times x']),
        steps: ['The parentheses in $' + name + '(' + k + ')$ hold the <em>input</em>. They do not mean multiplication.', '$' + name + '(' + k + ')$ is the output when $x = ' + k + '$: $' + name + '(' + k + ') = ' + tsub(m, k, b) + ' = ' + (m * k + b) + '$.'],
        hint: 'Read $' + name + '(' + k + ')$ as "' + name + ' of ' + k + '".'
      };
    }
    if (shape === 'table') {
      var xs = [-2, -1, 0, 1, 2, 3, 4].slice(R.int(0, 2), R.int(5, 7)), ys = xs.map(function () { return R.int(-9, 9); });
      var i1 = R.int(0, xs.length - 1), i2 = R.intNot(0, xs.length - 1, i1), c1 = R.pick([1, 2, 3]);
      var tab = '$$\\begin{array}{c|' + xs.map(function () { return 'c'; }).join('') + '} x & ' + xs.join(' & ') + ' \\\\ \\hline ' + name + '(x) & ' + ys.join(' & ') + ' \\end{array}$$';
      var ans = c1 * ys[i1] - ys[i2];
      return out({
        q: 'Use the table to find $' + (c1 === 1 ? '' : c1) + name + '(' + xs[i1] + ') - ' + name + '(' + xs[i2] + ')$.' + tab,
        a: num(ans),
        steps: ['Find each input in the top row and read the output under it: $' + name + '(' + xs[i1] + ') = ' + ys[i1] + '$ and $' + name + '(' + xs[i2] + ') = ' + ys[i2] + '$.', (c1 === 1 ? '' : 'Multiply first: $' + c1 + ' \\cdot ' + tp(ys[i1]) + ' = ' + c1 * ys[i1] + '$. ') + 'Then subtract: $' + (c1 * ys[i1]) + ' - ' + tp(ys[i2]) + ' = ' + ans + '$.'],
        hint: 'Each $' + name + '(\\ldots)$ is a number from the table. Look up both, then do the arithmetic.'
      }, { k: 'num', v: ans });
    }
    if (shape === 'shift') {
      var A = R.pick([1, 2, -1]), B = R.nz(-5, 5), C = R.int(-6, 6), sh = R.nz(-3, 3);
      // f(a + sh) = A(a+sh)^2 + B(a+sh) + C
      var ex = [A, 2 * A * sh + B, A * sh * sh + B * sh + C];
      return out({
        q: 'If $' + name + '(x) = ' + tpoly([A, B, C]) + '$, find $' + name + '(a ' + (sh > 0 ? '+ ' + sh : '- ' + (-sh)) + ')$. Write it without parentheses.',
        a: { t: 'expr', v: ppoly(ex, 'a'), vars: ['a'], form: 'expanded' },
        steps: ['Replace every $x$ with the whole input $(' + tlin(1, sh, 'a') + ')$: $' + name + '(' + tlin(1, sh, 'a') + ') = ' + T.coef(A, '(' + tlin(1, sh, 'a') + ')^2') + T.coef(B, '(' + tlin(1, sh, 'a') + ')', false) + T.signed(C) + '$.',
          'Expand: $(' + tlin(1, sh, 'a') + ')^2 = ' + tpoly([1, 2 * sh, sh * sh], 'a') + '$ and $' + tp(B) + '(' + tlin(1, sh, 'a') + ') = ' + tpoly([B, B * sh], 'a') + '$.',
          'Combine like terms: $' + tpoly(ex, 'a') + '$.'],
        hint: 'The input is the whole expression; put it in parentheses everywhere you see $x$.'
      }, { k: 'equiv', expr: A + '*(a+(' + sh + '))^2+(' + B + ')*(a+(' + sh + '))+(' + C + ')', vars: ['a'] });
    }
    var cs = quadF(R, ctx.level), x = R.nz(-5, 5);
    if (shape === 'combo') {
      var x2 = R.intNot(-4, 4, [x]), v1 = pevalQ(cs, x), v2 = pevalQ(cs, x2), ans2 = v1.add(v2);
      return out({
        q: 'If $' + name + '(x) = ' + tpoly(cs) + '$, find $' + name + '(' + x + ') + ' + name + '(' + x2 + ')$.',
        a: num(ans2),
        steps: ['$' + name + '(' + x + ') = ' + substTex(cs, x) + ' = ' + tn(v1) + '$.', '$' + name + '(' + x2 + ') = ' + substTex(cs, x2) + ' = ' + tn(v2) + '$.', 'Add the two outputs: $' + tn(v1) + ' + ' + tp(v2) + ' = ' + tn(ans2) + '$.'],
        hint: 'Find each output on its own, then add.'
      }, { k: 'val', expr: '(' + ppoly(cs).replace(/x/g, '(' + x + ')') + ')+(' + ppoly(cs).replace(/x/g, '(' + x2 + ')') + ')', env: {} });
    }
    var val = pevalQ(cs, x);
    return out({
      q: 'If $' + name + '(x) = ' + tpoly(cs) + '$, find $' + name + '(' + x + ')$.',
      a: num(val),
      steps: ['Replace every $x$ with $' + tp(x) + '$: $' + name + '(' + x + ') = ' + substTex(cs, x) + '$.', 'Follow the order of operations: $' + name + '(' + x + ') = ' + tn(val) + '$.'],
      hint: 'Put the input in parentheses in place of each $x$.'
    }, { k: 'val', expr: ppoly(cs), env: { x: x } });
  });

  // ---- alg1.solve-function-equations
  G('alg1.solve-function-equations', function (R, ctx) {
    var shape = R.pick(by(ctx, ['lin', 'lin', 'table'], ['lin', 'square', 'table', 'trap'], ['square', 'abs', 'trap', 'lin']));
    var name = R.pick(['f', 'g']);
    if (shape === 'trap') {
      var m = R.int(2, 5), b = R.nz(-6, 6), k = R.int(1, 4);
      var outK = m * k + b, inK = fr(k - b, m);
      var askOut = R.coin();
      return out({
        q: 'Let $' + name + '(x) = ' + tlin(m, b) + '$. ' + (askOut ? 'Find $' + name + '(' + k + ')$.' : 'Solve $' + name + '(x) = ' + k + '$.'),
        a: num(askOut ? outK : inK),
        steps: askOut ? ['$' + name + '(' + k + ')$ asks for the <em>output</em> when the input is $' + k + '$.', '$' + name + '(' + k + ') = ' + tsub(m, k, b) + ' = ' + outK + '$.'] : ['$' + name + '(x) = ' + k + '$ asks for the <em>input</em> that gives an output of $' + k + '$.', 'Set the rule equal to $' + k + '$: $' + tlin(m, b) + ' = ' + k + '$.', undo(b) + ': $' + m + 'x = ' + (k - b) + '$, so $x = ' + tn(inK) + '$.'],
        hint: askOut ? 'The number inside the parentheses is the input.' : 'The output is ' + k + '. Which input gives it?'
      }, { k: 'num', v: (askOut ? q(outK) : inK).toNumber() });
    }
    if (shape === 'table') {
      var xs = [-3, -2, -1, 0, 1, 2, 3, 4], ys = xs.map(function () { return R.int(-6, 8); }), t = R.pick(ys), sols = xs.filter(function (x, i) { return ys[i] === t; });
      var tab = '$$\\begin{array}{c|' + xs.map(function () { return 'c'; }).join('') + '} x & ' + xs.join(' & ') + ' \\\\ \\hline ' + name + '(x) & ' + ys.join(' & ') + ' \\end{array}$$';
      return out({
        q: 'Use the table to solve $' + name + '(x) = ' + t + '$. Give every solution.' + tab,
        a: setA(sols),
        steps: ['$' + name + '(x) = ' + t + '$ asks which inputs have output $' + t + '$. Look for $' + t + '$ in the <em>bottom</em> row.', 'It appears under $x = ' + sols.join('$ and $x = ') + '$.', sols.length > 1 ? 'A function can give the same output for different inputs, so there are ' + sols.length + ' solutions.' : 'So the solution is $x = ' + sols[0] + '$.'],
        hint: 'Search the output row, then read the input above it.'
      }, null);
    }
    if (shape === 'lin') {
      var m2 = R.nz(-6, 6), b2 = R.nz(-9, 9), x0 = R.nz(-8, 8), kk = m2 * x0 + b2;
      if (ctx.level === 1 && m2 < 0) { m2 = -m2; kk = m2 * x0 + b2; }
      var S = linSteps(m2, b2, 0, kk);
      return out({
        q: 'Let $' + name + '(x) = ' + tlin(m2, b2) + '$. For which input $x$ is $' + name + '(x) = ' + kk + '$?',
        a: num(S.x),
        steps: ['Set the rule equal to the output: $' + tlin(m2, b2) + ' = ' + kk + '$.'].concat(S.steps, ['Check: $' + name + '(' + x0 + ') = ' + tsub(m2, x0, b2) + ' = ' + kk + '$.']),
        hint: 'Write the equation rule $=$ output, then solve for $x$.'
      }, { k: 'roots', eq: plin(m2, b2) + '=' + kk });
    }
    if (shape === 'square') {
      var c = R.int(-6, 6), r = R.int(1, 7), kq = r * r + c;
      return out({
        q: 'Let $' + name + '(x) = x^2' + T.signed(c) + '$. Solve $' + name + '(x) = ' + kq + '$.',
        a: setA([r, -r]),
        steps: ['Set the rule equal to the output: $x^2' + T.signed(c) + ' = ' + kq + '$.', (c ? undo(c) + ': ' : '') + '$x^2 = ' + r * r + '$.', 'Both $' + r + '$ and $-' + r + '$ square to $' + r * r + '$, so $x = ' + r + '$ or $x = -' + r + '$.'],
        hint: 'Two different inputs can give the same output here.'
      }, { k: 'roots', eq: 'x^2+(' + c + ')=' + kq });
    }
    var h = R.nz(-5, 5), ka = R.int(1, 6), k2 = R.int(-3, 4), outA = ka + k2;
    return out({
      q: 'Let $' + name + '(x) = ' + T.abs(tlin(1, -h)) + T.signed(k2) + '$. Solve $' + name + '(x) = ' + outA + '$.',
      a: setA([h + ka, h - ka]),
      steps: ['Set the rule equal to the output: $' + T.abs(tlin(1, -h)) + T.signed(k2) + ' = ' + outA + '$.'].concat(k2 ? [undo(k2) + ': $' + T.abs(tlin(1, -h)) + ' = ' + ka + '$.'] : [], ['So $' + tlin(1, -h) + ' = ' + ka + '$ or $' + tlin(1, -h) + ' = -' + ka + '$: $x = ' + (h + ka) + '$ or $x = ' + (h - ka) + '$.']),
      hint: 'Isolate the absolute value, then use both distances.'
    }, { k: 'roots', eq: 'abs(x-(' + h + '))+(' + k2 + ')=' + outA });
  });

  // ---- alg1.domain-range
  G('alg1.domain-range', function (R, ctx) {
    var shape = R.pick(by(ctx, ['seg', 'seg', 'parab'], ['seg', 'parab', 'sqrt', 'context'], ['parab', 'sqrt', 'recip', 'seg']));
    if (shape === 'seg') {
      var x1 = R.int(-7, -1), x2 = R.int(1, 7), y1 = R.int(-6, 6), y2 = R.intNot(-6, 6, [y1]), ask = R.coin() ? 'domain' : 'range';
      var m = fr(y2 - y1, x2 - x1), b = q(y1).sub(m.mul(x1));
      var fstr = pterms([[m, 'x'], [b, '']]);
      var lo = Math.min(y1, y2), hi = Math.max(y1, y2);
      var ans = ask === 'domain' ? '[' + x1 + ', ' + x2 + ']' : '[' + lo + ', ' + hi + ']';
      return out({
        q: 'The graph of $f$ is the segment shown, from $(' + x1 + ', ' + y1 + ')$ to $(' + x2 + ', ' + y2 + ')$, including both endpoints. What is the ' + ask + ' of $f$? Use interval notation.',
        viz: { name: 'graph', opts: { fns: [{ f: fstr, from: x1, to: x2 }], points: [[x1, y1], [x2, y2]], xmin: -8, xmax: 8, ymin: -8, ymax: 8, zoom: false } },
        a: { t: 'interval', v: ans },
        steps: ask === 'domain' ? ['The domain is every input used: read the graph from left to right along the $x$-axis.', 'The $x$-values run from $' + x1 + '$ to $' + x2 + '$, both included.', 'Domain: $[' + x1 + ', ' + x2 + ']$.'] : ['The range is every output: read the graph from bottom to top along the $y$-axis.', 'The lowest point has $y = ' + lo + '$ and the highest has $y = ' + hi + '$, both included.', 'Range: $[' + lo + ', ' + hi + ']$.'],
        hint: ask === 'domain' ? 'Domain is about $x$: how far left and right does the graph go?' : 'Range is about $y$: how low and how high does the graph go?'
      }, null);
    }
    if (shape === 'parab') {
      var h = R.int(-3, 3), k = R.int(-4, 4), a = R.pick([1, -1, 2, -2]), askR = R.chance(0.75);
      var fs = a + '*(x-(' + h + '))^2+(' + k + ')';
      var ftex = T.coef(a, '(' + tlin(1, -h) + ')^2').replace('(x)^2', 'x^2') + T.signed(k);
      if (h === 0) ftex = T.coef(a, 'x^2') + T.signed(k);
      return out({
        q: 'Find the ' + (askR ? 'range' : 'domain') + ' of $f(x) = ' + ftex + '$. Use interval notation.',
        viz: { name: 'graph', opts: { f: fs, xmin: -8, xmax: 8, ymin: -8, ymax: 8, zoom: false } },
        a: { t: 'interval', v: askR ? (a > 0 ? '[' + k + ', inf)' : '(-inf, ' + k + ']') : '(-inf, inf)' },
        steps: askR ? ['A square is never negative, so $' + T.coef(a > 0 ? 1 : -1, '(' + tlin(1, -h) + ')^2').replace('(x)^2', 'x^2') + '$ is ' + (a > 0 ? 'at least' : 'at most') + ' $0$, and it equals $0$ at $x = ' + h + '$.', 'So $f(x)$ is ' + (a > 0 ? 'at least' : 'at most') + ' $' + k + '$, and it reaches every value ' + (a > 0 ? 'above' : 'below') + ' that. The graph\'s vertex is at height $' + k + '$.', 'Range: $' + (a > 0 ? '[' + k + ', \\infty)' : '(-\\infty, ' + k + ']') + '$.'] : ['You can square any real number, so every input works.', 'Domain: all real numbers, $(-\\infty, \\infty)$.'],
        hint: askR ? 'What is the smallest (or largest) output? Look at the vertex.' : 'Is there any $x$ you cannot put into the rule?'
      }, null);
    }
    if (shape === 'sqrt') {
      var c = R.nz(-6, 6), coef = R.pick([1, 2]);
      var inside = tlin(1, -c), sh = R.int(-3, 3);
      return out({
        q: 'Find the domain of $f(x) = ' + (coef === 1 ? '' : coef) + '\\sqrt{' + inside + '}' + T.signed(sh) + '$. Use interval notation.',
        a: { t: 'interval', v: '[' + c + ', inf)' },
        steps: ['A square root of a negative number is not a real number, so the inside must be at least $0$: $' + inside + ' \\ge 0$.', 'Solve: $x \\ge ' + c + '$.', 'Domain: $[' + c + ', \\infty)$. The bracket shows that $' + c + '$ is included, since $\\sqrt{0} = 0$.'],
        hint: 'What has to be true about the number under a square root?'
      }, null);
    }
    if (shape === 'recip') {
      var c2 = R.nz(-6, 6);
      return out({
        q: 'Find the domain of $f(x) = \\dfrac{3}{' + tlin(1, -c2) + '}$. Use interval notation.',
        a: { t: 'interval', v: '(-inf, ' + c2 + ') U (' + c2 + ', inf)' },
        steps: ['Division by $0$ is not defined, so the bottom cannot be $0$: $' + tlin(1, -c2) + ' \\ne 0$, so $x \\ne ' + c2 + '$.', 'Every other real number works.', 'Domain: $(-\\infty, ' + c2 + ') \\cup (' + c2 + ', \\infty)$.'],
        hint: 'Which input would make you divide by zero?'
      }, null);
    }
    var price = R.pick([2, 3, 4, 5]), base = R.pick([3, 5, 10]), maxH = R.pick([4, 6, 8, 10]);
    return out({
      q: 'A bike rental costs $C(h) = ' + base + ' + ' + price + 'h$ dollars for $h$ hours. Bikes can be rented for any time from $0$ up to $' + maxH + '$ hours. What is the range of $C$ in this situation? Use interval notation.',
      a: { t: 'interval', v: '[' + base + ', ' + (base + price * maxH) + ']' },
      steps: ['The domain (the allowed inputs) is $0 \\le h \\le ' + maxH + '$, set by the situation, not by the formula.', 'The function increases, so the outputs run from $C(0) = ' + base + '$ to $C(' + maxH + ') = ' + base + ' + ' + price + ' \\cdot ' + maxH + ' = ' + (base + price * maxH) + '$.', 'Range: $[' + base + ', ' + (base + price * maxH) + ']$.'],
      hint: 'Find the outputs at the smallest and largest allowed inputs.'
    }, null);
  });

  // ---- alg1.key-features-graphs
  G('alg1.key-features-graphs', function (R, ctx) {
    var p = R.int(-6, 2), qq = p + 2 * R.int(1, 4), a = R.pick(by(ctx, [1, -1], [1, -1, 0.5, -0.5], [1, -1, 0.5, -0.5])), h = (p + qq) / 2;
    var k = U.fix(a * (h - p) * (h - qq)), f0 = U.fix(a * p * qq);
    if (Math.abs(k) > 8 || Math.abs(f0) > 9) { a = a > 0 ? 0.5 : -0.5; k = U.fix(a * (h - p) * (h - qq)); f0 = U.fix(a * p * qq); }
    if (Math.abs(k) > 9 || Math.abs(f0) > 9) { p = -2; qq = 2; h = 0; k = U.fix(-4 * a); f0 = k; }
    var fs = nf(a) + '*(x-(' + p + '))*(x-(' + qq + '))', up = a > 0;
    var ask = R.pick(by(ctx, ['zeros', 'yint', 'inc'], ['zeros', 'inc', 'ext', 'yint'], ['inc', 'ext', 'zeros', 'dec']));
    var viz = { name: 'graph', opts: { f: fs, xmin: -9, xmax: 9, ymin: -9, ymax: 9, zoom: false } };
    var base = 'The graph of $y = f(x)$ is shown. ';
    if (ask === 'zeros') return out({ q: base + 'What are the $x$-intercepts (zeros) of $f$?', viz: viz, a: setA([p, qq]), steps: ['The $x$-intercepts are where the graph crosses the $x$-axis, where $y = 0$.', 'The graph crosses at $x = ' + p + '$ and $x = ' + qq + '$.'], hint: 'Look where the curve meets the horizontal axis.' }, { k: 'roots', eq: fs + '=0' });
    if (ask === 'yint') return out({ q: base + 'What is the $y$-intercept? Give the $y$-value.', viz: viz, a: num(nf(f0)), steps: ['The $y$-intercept is where the graph crosses the $y$-axis, where $x = 0$.', 'There the height is $y = ' + tn(f0) + '$, so the $y$-intercept is $(0, ' + tn(f0) + ')$.'], hint: 'Look where the curve meets the vertical axis.' }, { k: 'val', expr: fs, env: { x: 0 } });
    if (ask === 'ext') return out({ q: base + 'What is the ' + (up ? 'minimum' : 'maximum') + ' value of $f$?', viz: viz, a: num(nf(k)), steps: ['The graph ' + (up ? 'opens up, so its lowest point' : 'opens down, so its highest point') + ' is the turning point (the vertex), at $(' + tn(h) + ', ' + tn(k) + ')$.', 'The ' + (up ? 'minimum' : 'maximum') + ' <em>value</em> is the $y$-coordinate: $' + tn(k) + '$.'], hint: 'A value of $f$ is an output, a $y$-coordinate.' }, { k: 'val', expr: fs, env: { x: h } });
    var inc = ask === 'inc', interval = (inc === up) ? '(' + pq(h) + ', inf)' : '(-inf, ' + pq(h) + ')';
    return out({
      q: base + 'On what interval is $f$ ' + (inc ? 'increasing' : 'decreasing') + '? Use an open interval.',
      viz: viz,
      a: { t: 'interval', v: interval },
      steps: ['Read the graph from <em>left to right</em>. It ' + (inc ? 'rises' : 'falls') + ' while ' + (inc === up ? 'to the right of' : 'to the left of') + ' the turning point at $x = ' + tn(h) + '$.', 'An interval of $x$-values is the answer, not a point: $' + ((inc === up) ? '(' + tn(h) + ', \\infty)' : '(-\\infty, ' + tn(h) + ')') + '$.'],
      hint: 'Move your finger from left to right along the curve. Where is it going up?'
    }, null);
  });

  // ---- alg1.average-rate-of-change
  G('alg1.average-rate-of-change', function (R, ctx) {
    var shape = R.pick(by(ctx, ['formula', 'table', 'story'], ['formula', 'table', 'story'], ['formula', 'story', 'formula']));
    if (shape === 'story') {
      var S = R.pick([['a plant', 'height', 'cm', 'day', 'cm per day'], ['a tank', 'water level', 'liters', 'minute', 'liters per minute'], ['a hiker', 'elevation', 'meters', 'hour', 'meters per hour']]);
      var t1 = R.int(1, 5), t2 = t1 + R.int(2, 6), r = R.nz(-6, 9), v1 = R.int(10, 60), v2 = v1 + r * (t2 - t1);
      if (v2 < 0) { r = -r; v2 = v1 + r * (t2 - t1); }
      return out({
        q: 'The ' + S[1] + ' of ' + S[0] + ' is $' + v1 + '$ ' + S[2] + ' at ' + S[3] + ' $' + t1 + '$ and $' + v2 + '$ ' + S[2] + ' at ' + S[3] + ' $' + t2 + '$. What is the average rate of change, in ' + S[4] + '?',
        a: num(r), unit: S[4],
        steps: ['Average rate of change $= \\dfrac{\\text{change in output}}{\\text{change in input}}$.', '$\\dfrac{' + v2 + ' - ' + v1 + '}{' + t2 + ' - ' + t1 + '} = \\dfrac{' + (v2 - v1) + '}{' + (t2 - t1) + '} = ' + r + '$.', 'So the ' + S[1] + ' changed by $' + r + '$ ' + S[4] + ' on average' + (r < 0 ? ' (it went down)' : '') + '.'],
        hint: 'Divide the change in ' + S[1] + ' by the change in time.'
      }, { k: 'num', v: r });
    }
    var cs = by(ctx, [[1, R.int(-4, 4), R.int(-5, 5)]], [[R.pick([1, -1, 2]), R.int(-4, 4), R.int(-5, 5)]], [[R.pick([1, -1]), 0, R.int(-3, 3), R.int(-5, 5)], [R.pick([2, -1]), R.int(-4, 4), R.int(-5, 5)]]);
    cs = R.pick(Array.isArray(cs[0]) ? cs : [cs]);
    var a = R.int(-3, 2), b = a + R.int(1, 4), fa = pevalQ(cs, a), fb = pevalQ(cs, b), rate = fb.sub(fa).div(b - a);
    if (shape === 'table') {
      var xs = [], x; for (x = a - 1; x <= b + 1; x++) xs.push(x);
      var tab = '$$\\begin{array}{c|' + xs.map(function () { return 'c'; }).join('') + '} x & ' + xs.join(' & ') + ' \\\\ \\hline f(x) & ' + xs.map(function (z) { return tn(pevalQ(cs, z)); }).join(' & ') + ' \\end{array}$$';
      return out({
        q: 'Use the table to find the average rate of change of $f$ from $x = ' + a + '$ to $x = ' + b + '$.' + tab,
        a: num(rate),
        steps: ['Read the outputs: $f(' + a + ') = ' + tn(fa) + '$ and $f(' + b + ') = ' + tn(fb) + '$.', 'Average rate of change $= \\dfrac{f(' + b + ') - f(' + a + ')}{' + b + ' - ' + tp(a) + '} = \\dfrac{' + tn(fb) + ' - ' + tp(fa) + '}{' + (b - a) + '} = ' + tn(rate) + '$.'],
        hint: 'Change in the $f(x)$ row divided by change in the $x$ row.'
      }, { k: 'num', v: rate.toNumber() });
    }
    return out({
      q: 'Find the average rate of change of $f(x) = ' + tpoly(cs) + '$ from $x = ' + a + '$ to $x = ' + b + '$.',
      a: num(rate),
      steps: ['Find the outputs: $f(' + a + ') = ' + substTex(cs, a) + ' = ' + tn(fa) + '$ and $f(' + b + ') = ' + substTex(cs, b) + ' = ' + tn(fb) + '$.', 'Divide the change in output by the change in input: $\\dfrac{' + tn(fb) + ' - ' + tp(fa) + '}{' + b + ' - ' + tp(a) + '} = \\dfrac{' + tn(fb.sub(fa)) + '}{' + (b - a) + '} = ' + tn(rate) + '$.', 'This is the slope of the line through $(' + a + ', ' + tn(fa) + ')$ and $(' + b + ', ' + tn(fb) + ')$.'],
      hint: 'Compute $\\frac{f(b) - f(a)}{b - a}$: outputs on top, inputs on the bottom.'
    }, { k: 'num', v: rate.toNumber() });
  });

  // ---- alg1.sequences-functions
  G('alg1.sequences-functions', function (R, ctx) {
    var shape = R.pick(by(ctx, ['explicit', 'list', 'explicit'], ['explicit', 'recursive', 'which'], ['recursive', 'which', 'square']));
    if (shape === 'list') {
      var a1 = R.int(-5, 12), d = R.nz(-6, 7), n = R.int(6, 9), terms = [0, 1, 2, 3].map(function (i) { return a1 + i * d; });
      return out({ q: 'The sequence $' + terms.join(', ') + ', \\ldots$ keeps the same pattern. What is the ' + U.ordinal(n) + ' term?', a: num(a1 + (n - 1) * d), steps: ['Each term is ' + (d > 0 ? d + ' more' : -d + ' less') + ' than the one before.', 'Keep going: ' + U.range(0, n - 1).map(function (i) { return '$' + (a1 + i * d) + '$'; }).join(', ') + '.', 'The ' + U.ordinal(n) + ' term is $' + (a1 + (n - 1) * d) + '$.'], hint: 'Find what happens from one term to the next, then keep going.' }, { k: 'num', v: a1 + (n - 1) * d });
    }
    if (shape === 'explicit') {
      var m = R.nz(-5, 6), b = R.int(-9, 9), n2 = R.int(4, 15);
      return out({ q: 'A sequence is given by $a_n = ' + tlin(m, b, 'n') + '$. Find $a_{' + n2 + '}$.', a: num(m * n2 + b), steps: ['$a_{' + n2 + '}$ is the term when the input $n$ is $' + n2 + '$. A sequence is a function whose inputs are the positions $1, 2, 3, \\ldots$', '$a_{' + n2 + '} = ' + tsub(m, n2, b) + ' = ' + (m * n2 + b) + '$.'], hint: 'Substitute ' + n2 + ' for $n$.' }, { k: 'num', v: m * n2 + b });
    }
    if (shape === 'square') {
      var c = R.int(-5, 5), n3 = R.int(3, 9);
      return out({ q: 'A sequence is given by $a_n = n^2' + T.signed(c) + '$. Find $a_{' + n3 + '} - a_{' + (n3 - 1) + '}$.', a: num(2 * n3 - 1), steps: ['$a_{' + n3 + '} = ' + n3 + '^2' + T.signed(c) + ' = ' + (n3 * n3 + c) + '$.', '$a_{' + (n3 - 1) + '} = ' + (n3 - 1) + '^2' + T.signed(c) + ' = ' + ((n3 - 1) * (n3 - 1) + c) + '$.', 'Subtract: $' + (n3 * n3 + c) + ' - ' + tp((n3 - 1) * (n3 - 1) + c) + ' = ' + (2 * n3 - 1) + '$.'], hint: 'Find each term separately, then subtract.' }, { k: 'num', v: 2 * n3 - 1 });
    }
    if (shape === 'recursive') {
      var s1 = R.int(-4, 6), mul = R.pick([2, 3, -1, 2]), add = R.nz(-5, 5), seq = [s1];
      for (var i = 1; i < 5; i++) seq.push(mul * seq[i - 1] + add);
      var nn = R.int(3, 5);
      return out({ q: 'A sequence starts with $a_1 = ' + s1 + '$, and each term after that is $a_n = ' + T.coef(mul, 'a_{n-1}') + T.signed(add) + '$. Find $a_{' + nn + '}$.', a: num(seq[nn - 1]), steps: ['This rule is recursive: each term is built from the one before it.'].concat(U.range(2, nn).map(function (k) { return '$a_{' + k + '} = ' + (mul === 1 ? '' : mul === -1 ? '-' : mul + ' \\cdot ') + tp(seq[k - 2]) + T.signed(add) + ' = ' + seq[k - 1] + '$.'; })), hint: 'Start from $a_1$ and apply the rule one step at a time.' }, { k: 'num', v: seq[nn - 1] });
    }
    var m4 = R.int(2, 7), b4 = R.int(-6, 9), n4 = R.int(8, 30), val = m4 * n4 + b4;
    return out({ q: 'A sequence is given by $a_n = ' + tlin(m4, b4, 'n') + '$. Which term of the sequence equals $' + val + '$? (Give $n$.)', a: num(n4), steps: ['Set the rule equal to $' + val + '$: $' + tlin(m4, b4, 'n') + ' = ' + val + '$.', undo(b4) + ': $' + m4 + 'n = ' + (val - b4) + '$.', 'Divide by $' + m4 + '$: $n = ' + n4 + '$. It is the ' + U.ordinal(n4) + ' term.'], hint: 'You know the output; solve for the input $n$.' }, { k: 'num', v: n4 });
  });

  // ---- alg1.arithmetic-sequences
  G('alg1.arithmetic-sequences', function (R, ctx) {
    var shape = R.pick(by(ctx, ['nth', 'formula', 'nth'], ['formula', 'twoterms', 'nth'], ['twoterms', 'formula', 'which']));
    var a1 = R.int(-9, 15), d = R.nz(-7, 8), terms = [0, 1, 2, 3].map(function (i) { return a1 + i * d; });
    var simp = [d, a1 - d];
    if (shape === 'nth') {
      var n = R.int(12, 60), an = a1 + (n - 1) * d;
      return out({ q: 'Find the ' + U.ordinal(n) + ' term of the arithmetic sequence $' + terms.join(', ') + ', \\ldots$', a: num(an), steps: ['The common difference is $d = ' + terms[1] + ' - ' + tp(terms[0]) + ' = ' + d + '$.', 'To reach term $' + n + '$ from term $1$ takes $' + n + ' - 1 = ' + (n - 1) + '$ steps of $' + d + '$: $a_{' + n + '} = a_1 + (n - 1)d$.', '$a_{' + n + '} = ' + a1 + ' + ' + (n - 1) + ' \\cdot ' + tp(d) + ' = ' + an + '$.'], hint: 'How many steps of $d$ does it take to get from the 1st term to the ' + U.ordinal(n) + '?' }, { k: 'num', v: an });
    }
    if (shape === 'formula') {
      return out({ q: 'Write a formula for the $n$th term of the arithmetic sequence $' + terms.join(', ') + ', \\ldots$', a: { t: 'expr', v: ppoly(simp, 'n'), vars: ['n'] }, steps: ['First term $a_1 = ' + a1 + '$; common difference $d = ' + d + '$.', 'Use $a_n = a_1 + (n - 1)d$: $a_n = ' + a1 + ' + ' + tp(d) + '(n - 1)$.', 'Simplify: $a_n = ' + tpoly(simp, 'n') + '$.', 'Check: $n = 1$ gives $' + tsub(d, 1, a1 - d) + ' = ' + a1 + '$.'], hint: 'Start from $a_1$ and add $d$ once for each step after the first.' }, { k: 'equiv', expr: a1 + '+(' + d + ')*(n-1)', vars: ['n'] });
    }
    if (shape === 'twoterms') {
      var i = R.int(2, 5), j = i + R.int(3, 7), ai = a1 + (i - 1) * d, aj = a1 + (j - 1) * d, ask = R.coin() ? 'd' : 'a1';
      return out({ q: 'In an arithmetic sequence, $a_{' + i + '} = ' + ai + '$ and $a_{' + j + '} = ' + aj + '$. Find ' + (ask === 'd' ? 'the common difference $d$.' : 'the first term $a_1$.'), a: num(ask === 'd' ? d : a1), steps: ['From term $' + i + '$ to term $' + j + '$ there are $' + (j - i) + '$ steps of $d$: $' + (j - i) + 'd = ' + aj + ' - ' + tp(ai) + ' = ' + (aj - ai) + '$.', 'So $d = ' + d + '$.'].concat(ask === 'a1' ? ['Go back from term $' + i + '$ to term $1$: $a_1 = ' + ai + ' - ' + (i - 1) + ' \\cdot ' + tp(d) + ' = ' + a1 + '$.'] : []), hint: 'Count the steps between the two terms you know.' }, { k: 'num', v: ask === 'd' ? d : a1 });
    }
    var n2 = R.int(10, 40), target = a1 + (n2 - 1) * d;
    return out({ q: 'Which term of the arithmetic sequence $' + terms.join(', ') + ', \\ldots$ is $' + target + '$? (Give $n$.)', a: num(n2), steps: ['$a_n = ' + a1 + ' + ' + tp(d) + '(n - 1)$. Set it equal to $' + target + '$.', 'Subtract $' + a1 + '$: $' + tp(d) + '(n - 1) = ' + (target - a1) + '$, so $n - 1 = ' + (n2 - 1) + '$.', '$n = ' + n2 + '$.'], hint: 'Write the formula for $a_n$ and set it equal to ' + target + '.' }, { k: 'num', v: n2 });
  });

  // ---- alg1.piecewise-functions
  G('alg1.piecewise-functions', function (R, ctx) {
    var c = R.int(-2, 3), m1 = R.nz(-3, 3), b1 = R.int(-4, 4), m2 = R.nz(-3, 3), b2 = R.int(-5, 5), inc = R.coin();
    var cases = '\\begin{cases} ' + tlin(m1, b1) + ' & \\text{if } x ' + (inc ? '<' : '\\le') + ' ' + c + ' \\\\ ' + tlin(m2, b2) + ' & \\text{if } x ' + (inc ? '\\ge' : '>') + ' ' + c + ' \\end{cases}';
    var three = ctx.level >= 2 && R.chance(0.45), c2 = c + R.int(2, 4), k3 = R.int(-4, 6);
    if (three) cases = '\\begin{cases} ' + tlin(m1, b1) + ' & \\text{if } x < ' + c + ' \\\\ ' + tlin(m2, b2) + ' & \\text{if } ' + c + ' \\le x < ' + c2 + ' \\\\ ' + k3 + ' & \\text{if } x \\ge ' + c2 + ' \\end{cases}';
    function f(x) { if (three) { if (x < c) return [m1 * x + b1, 0]; if (x < c2) return [m2 * x + b2, 1]; return [k3, 2]; } if (inc ? x < c : x <= c) return [m1 * x + b1, 0]; return [m2 * x + b2, 1]; }
    var rules = [[m1, b1], [m2, b2], [0, k3]];
    var conds = three ? ['x < ' + c, c + ' \\le x < ' + c2, 'x \\ge ' + c2] : [inc ? 'x < ' + c : 'x \\le ' + c, inc ? 'x \\ge ' + c : 'x > ' + c];
    function evalStep(x) { var r = f(x), rl = rules[r[1]]; return '$x = ' + x + '$ fits $' + conds[r[1]] + '$, so use $' + tlin(rl[0], rl[1]) + '$: $f(' + x + ') = ' + (rl[0] === 0 ? '' : tsub(rl[0], x, rl[1]) + ' = ') + r[0] + '$.'; }
    var xs = ctx.level === 1 ? [R.pick([c, c - 2, c + 2, c - 1])] : R.coin() ? [c] : [R.int(c - 3, c - 1), three ? c2 : c];
    if (xs.length === 1) return out({ q: 'Let $$f(x) = ' + cases + '$$ Find $f(' + xs[0] + ')$.', a: num(f(xs[0])[0]), steps: ['Find which condition $x = ' + xs[0] + '$ satisfies. Watch the boundary: is $' + c + '$ included with $<$ or with $\\le$?', evalStep(xs[0])], hint: 'First decide which piece the input belongs to, then use only that rule.' }, { k: 'num', v: f(xs[0])[0] });
    var tot = f(xs[0])[0] + f(xs[1])[0];
    return out({ q: 'Let $$f(x) = ' + cases + '$$ Find $f(' + xs[0] + ') + f(' + xs[1] + ')$.', a: num(tot), steps: [evalStep(xs[0]), evalStep(xs[1]), 'Add: $' + f(xs[0])[0] + ' + ' + tp(f(xs[1])[0]) + ' = ' + tot + '$.'], hint: 'Each input uses only the rule whose condition it satisfies, including at a boundary.' }, { k: 'num', v: tot });
  });

  // ---- alg1.absolute-value-functions
  G('alg1.absolute-value-functions', function (R, ctx) {
    var a = R.pick(by(ctx, [1, -1, 2], [1, -1, 2, -2, 3], [2, -2, 3, -3, 0.5])), h = R.nz(-5, 5), k = R.int(-6, 6);
    var ftex = (a === 1 ? '' : a === -1 ? '-' : tn(a)) + T.abs(tlin(1, -h)) + T.signed(k), fplain = nf(a) + '*abs(x-(' + h + '))+(' + k + ')';
    var shape = R.pick(by(ctx, ['vertex', 'eval', 'vertex'], ['vertex', 'eval', 'write', 'ext'], ['write', 'piece', 'ext', 'eval']));
    if (shape === 'vertex') return out({ q: 'What is the vertex of the graph of $f(x) = ' + ftex + '$?', a: tup([h, k]), steps: ['$|x ' + (h > 0 ? '- ' + h : '+ ' + (-h)) + '|$ is smallest (zero) when $x = ' + h + '$. That is where the V turns.', 'At $x = ' + h + '$: $f(' + h + ') = ' + (a === 1 ? '' : tn(a) + ' \\cdot ') + '0' + T.signed(k) + ' = ' + k + '$.', 'Vertex: $(' + h + ', ' + k + ')$. The sign inside the bars is the opposite of the shift.'], hint: 'Which $x$ makes the inside of the absolute value zero?' }, { k: 'tuple', v: [h, k], f: fplain });
    if (shape === 'eval') { var x0 = R.int(h - 4, h + 4), v = U.fix(a * Math.abs(x0 - h) + k); return out({ q: 'Let $f(x) = ' + ftex + '$. Find $f(' + x0 + ')$.', a: num(v), steps: ['$f(' + x0 + ') = ' + (a === 1 ? '' : a === -1 ? '-' : tn(a)) + T.abs(x0 + ' ' + (h > 0 ? '- ' + h : '+ ' + (-h))) + T.signed(k) + '$.', 'Inside first: $' + T.abs(x0 - h) + ' = ' + Math.abs(x0 - h) + '$.', 'Then: $' + (a === 1 ? '' : tn(a) + ' \\cdot ') + Math.abs(x0 - h) + T.signed(k) + ' = ' + tn(v) + '$.'], hint: 'Do the inside of the bars first, then the absolute value, then the rest.' }, { k: 'val', expr: fplain, env: { x: x0 } }); }
    if (shape === 'ext') return out({ q: 'Does $f(x) = ' + ftex + '$ have a maximum or a minimum value, and what is it?', a: { t: 'multi', parts: [{ label: 'It has a', a: { t: 'mc', choices: ['maximum', 'minimum'], v: a > 0 ? 1 : 0, keep: true } }, { label: 'The value is', a: num(k) }] }, steps: [a > 0 ? 'The coefficient $' + tn(a) + '$ is positive, so the V opens upward and the vertex is the lowest point.' : 'The coefficient $' + tn(a) + '$ is negative, so the V opens downward and the vertex is the highest point.', 'The vertex is $(' + h + ', ' + k + ')$, so the ' + (a > 0 ? 'minimum' : 'maximum') + ' value is $' + k + '$.'], hint: 'Find the vertex and decide whether the V opens up or down.' }, null);
    if (shape === 'piece') {
      var right = R.coin();
      return out({ q: 'Write $f(x) = ' + ftex + '$ without absolute value bars for ' + (right ? '$x \\ge ' + h + '$' : '$x < ' + h + '$') + '.', a: { t: 'expr', v: right ? pterms([[a, 'x'], [k - a * h, '']]) : pterms([[-a, 'x'], [k + a * h, '']]) }, steps: [right ? 'When $x \\ge ' + h + '$, the inside $' + tlin(1, -h) + '$ is not negative, so $' + T.abs(tlin(1, -h)) + ' = ' + tlin(1, -h) + '$.' : 'When $x < ' + h + '$, the inside $' + tlin(1, -h) + '$ is negative, so $' + T.abs(tlin(1, -h)) + ' = -(' + tlin(1, -h) + ') = ' + tlin(-1, h) + '$.', 'So $f(x) = ' + tn(a) + '(' + (right ? tlin(1, -h) : tlin(-1, h)) + ')' + T.signed(k) + ' = ' + (right ? tlin(a, k - a * h) : tlin(-a, k + a * h)) + '$.', 'Each side of the V is a straight line: slope $' + tn(right ? a : -a) + '$ on this side.'], hint: 'Is the inside of the bars positive or negative on that side?' }, { k: 'equiv', expr: right ? nf(a) + '*(x-(' + h + '))+(' + k + ')' : nf(a) + '*((' + h + ')-x)+(' + k + ')' });
    }
    var ai = R.pick([1, -1, 2, -2]);
    return out({ q: 'Write an equation for the graph of $y = |x|$ after it is ' + (ai < 0 ? 'reflected across the $x$-axis, ' : '') + (Math.abs(ai) === 2 ? 'stretched vertically by a factor of $2$, ' : '') + 'shifted ' + (h > 0 ? 'right $' + h + '$' : 'left $' + (-h) + '$') + ' and ' + (k >= 0 ? 'up $' + k + '$' : 'down $' + (-k) + '$') + '.', a: { t: 'expr', v: pabs(ai, h, k) }, steps: ['A shift ' + (h > 0 ? 'right' : 'left') + ' by $' + Math.abs(h) + '$ replaces $x$ with $' + tlin(1, -h) + '$: $|' + tlin(1, -h) + '|$.', (ai !== 1 ? 'Multiply by $' + ai + '$ for the ' + (ai < 0 ? 'reflection' : '') + (ai < 0 && Math.abs(ai) === 2 ? ' and ' : '') + (Math.abs(ai) === 2 ? 'stretch' : '') + '. ' : '') + 'Add $' + k + '$ for the vertical shift.', '$y = ' + (ai === 1 ? '' : ai === -1 ? '-' : ai) + T.abs(tlin(1, -h)) + T.signed(k) + '$, with vertex $(' + h + ', ' + k + ')$.'], hint: 'Inside the bars: horizontal shift (opposite sign). Outside: stretch, reflection and vertical shift.' }, { k: 'equiv', expr: ai + '*abs(x-(' + h + '))+(' + k + ')' });
  });

  // ---- alg1.step-functions
  G('alg1.step-functions', function (R, ctx) {
    var shape = R.pick(by(ctx, ['floor', 'floor', 'park'], ['floor', 'park', 'ship'], ['negfloor', 'park', 'ship', 'ceilneg']));
    if (shape === 'floor' || shape === 'negfloor') {
      var x = shape === 'negfloor' || R.chance(0.4) ? -R.real(0.2, 6.8, 1) : R.real(0.2, 9.8, 1);
      if (Number.isInteger(x)) x = U.fix(x + 0.5);
      var fl = Math.floor(x), k = R.pick([0, 0, 2, -3]);
      return out({ q: 'The floor function $\\lfloor x \\rfloor$ gives the greatest integer less than or equal to $x$. Find $\\lfloor ' + tn(x) + ' \\rfloor' + (k ? T.signed(k) : '') + '$.', a: num(fl + k), steps: ['Find the integers on either side of $' + tn(x) + '$: $' + fl + ' \\le ' + tn(x) + ' < ' + (fl + 1) + '$.', 'The floor is the one at or below it' + (x < 0 ? ', which for a negative number is farther from zero' : '') + ': $\\lfloor ' + tn(x) + ' \\rfloor = ' + fl + '$.'].concat(k ? ['Then $' + fl + T.signed(k) + ' = ' + (fl + k) + '$.'] : []), hint: x < 0 ? 'On the number line, move left from $' + tn(x) + '$ to the first integer.' : 'Round down to the integer at or below.' }, { k: 'num', v: fl + k });
    }
    if (shape === 'ceilneg') {
      var y = -R.real(0.2, 5.8, 1); if (Number.isInteger(y)) y = U.fix(y - 0.5); var ce = Math.ceil(y);
      return out({ q: 'The ceiling function $\\lceil x \\rceil$ gives the least integer greater than or equal to $x$. Find $\\lceil ' + tn(y) + ' \\rceil$.', a: num(ce), steps: ['The integers on either side: $' + (ce - 1) + ' < ' + tn(y) + ' \\le ' + ce + '$.', 'The ceiling is the one at or above it (to the right on the number line): $' + ce + '$.'], hint: 'Move right on the number line to the first integer.' }, { k: 'num', v: ce });
    }
    if (shape === 'park') {
      var rate = R.pick([2, 3, 4, 5]), first = R.pick([0, 0, 5]), hrs = R.real(0.3, 6.7, 2); if (Number.isInteger(hrs)) hrs = U.fix(hrs + 0.25);
      var hh = Math.floor(hrs), mm = Math.round((hrs - hh) * 60); if (mm === 0) mm = 20; if (mm === 60) { mm = 45; }
      var tot = hh + mm / 60, blocks = Math.ceil(tot), cost = first + rate * blocks;
      return out({ q: 'A parking garage charges ' + (first ? '$' + money(first) + '$ to enter plus ' : '') + '$' + money(rate) + '$ for each hour or part of an hour. How much does it cost to park for ' + (hh ? hh + ' hour' + (hh > 1 ? 's' : '') + ' and ' : '') + mm + ' minutes?', a: num(cost), unit: 'dollars', steps: ['"Each hour or part of an hour" means any started hour is charged in full: the number of charged hours is the time rounded <em>up</em>.', 'The time is between $' + Math.floor(tot) + '$ and $' + blocks + '$ hours, so you pay for $' + blocks + '$ hours.', 'Cost: ' + (first ? '$' + first + ' + ' : '$') + rate + ' \\cdot ' + blocks + ' = ' + cost + '$ dollars.', 'The graph of cost against time is a staircase: flat for each hour, then a jump.'], hint: 'Count every started hour as a full hour.' }, { k: 'num', v: cost });
    }
    var tiers = [[1, 4.5], [2, 6], [3, 7.5], [5, 10]], w = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 4.5]);
    var price = tiers.filter(function (t) { return w <= t[0]; })[0][1];
    return out({ q: 'A shipping company charges by weight: up to $1$ lb costs $\\$4.50$; over $1$ lb up to $2$ lb costs $\\$6$; over $2$ lb up to $3$ lb costs $\\$7.50$; over $3$ lb up to $5$ lb costs $\\$10$. What does a $' + tn(w) + '$ lb package cost to ship?', a: num(price), unit: 'dollars', steps: ['Find the weight band that contains $' + tn(w) + '$ lb. A weight exactly on a boundary belongs to the band that says "up to" it.', '$' + tn(w) + '$ lb is in the band ' + (w <= 1 ? 'up to $1$ lb' : 'over $' + tiers.filter(function (t) { return t[0] < w; }).pop()[0] + '$ lb up to $' + tiers.filter(function (t) { return w <= t[0]; })[0][0] + '$ lb') + ', so the cost is $' + money(price) + '$.'], hint: 'Each weight belongs to exactly one band. Check the boundary words carefully.' }, { k: 'num', v: price });
  });

  // ---- alg1.function-transformations
  G('alg1.function-transformations', function (R, ctx) {
    var shape = R.pick(by(ctx, ['describe', 'point', 'describe'], ['point', 'write', 'describe'], ['point2', 'write', 'point', 'describe']));
    var h = R.nz(-5, 5), k = R.nz(-5, 5);
    if (shape === 'describe') {
      var which = R.pick(['h', 'k', 'neg', 'stretch']), right, wrongs, gtex;
      if (which === 'h') { gtex = 'f(x ' + (h > 0 ? '- ' + h : '+ ' + (-h)) + ')'; right = 'Shift ' + (h > 0 ? 'right' : 'left') + ' ' + Math.abs(h); wrongs = ['Shift ' + (h > 0 ? 'left' : 'right') + ' ' + Math.abs(h), 'Shift up ' + Math.abs(h), 'Shift down ' + Math.abs(h)]; }
      else if (which === 'k') { gtex = 'f(x)' + T.signed(k); right = 'Shift ' + (k > 0 ? 'up' : 'down') + ' ' + Math.abs(k); wrongs = ['Shift ' + (k > 0 ? 'down' : 'up') + ' ' + Math.abs(k), 'Shift right ' + Math.abs(k), 'Shift left ' + Math.abs(k)]; }
      else if (which === 'neg') { gtex = R.coin() ? '-f(x)' : 'f(-x)'; var outer = gtex === '-f(x)'; right = outer ? 'Reflect across the x-axis' : 'Reflect across the y-axis'; wrongs = [outer ? 'Reflect across the y-axis' : 'Reflect across the x-axis', 'Shift down 1', 'Shift left 1']; }
      else { var a = R.pick([2, 3, 4]); gtex = a + 'f(x)'; right = 'Stretch vertically by a factor of ' + a; wrongs = ['Shrink vertically by a factor of ' + a, 'Shift up ' + a, 'Stretch horizontally by a factor of ' + a]; }
      var why = { h: 'Inside the parentheses, $g$ uses $f$ at $x ' + (h > 0 ? '- ' + h : '+ ' + (-h)) + '$. To get the same output as $f$ at an input, $g$ needs an input $' + Math.abs(h) + '$ ' + (h > 0 ? 'larger' : 'smaller') + ', so the graph moves ' + (h > 0 ? 'right' : 'left') + '.', k: 'Adding $' + k + '$ outside changes every output by $' + k + '$, so every point moves ' + (k > 0 ? 'up' : 'down') + '.', neg: 'A minus sign ' + (gtex === '-f(x)' ? 'outside changes the sign of every output: $(x, y)$ goes to $(x, -y)$.' : 'inside changes the sign of every input: $(x, y)$ goes to $(-x, y)$.'), stretch: 'Multiplying the output multiplies every $y$-value, so every point moves away from the $x$-axis: $(x, y)$ goes to $(x, ' + (which === 'stretch' ? gtex[0] : '') + 'y)$.' }[which];
      return { q: 'How does the graph of $g(x) = ' + gtex + '$ compare with the graph of $f$?', a: mc(right, wrongs), steps: [why, 'So: ' + right.toLowerCase() + '.'], hint: 'Changes inside the parentheses act on $x$ (often opposite to how they look); changes outside act on $y$.' };
    }
    var p = R.int(-4, 4), qv = R.int(-5, 5);
    if (shape === 'point' || shape === 'point2') {
      var a2 = shape === 'point2' ? R.pick([2, -1, 3, -2]) : 1;
      var gtex2 = (a2 === 1 ? '' : a2 === -1 ? '-' : a2) + 'f(x ' + (h > 0 ? '- ' + h : '+ ' + (-h)) + ')' + T.signed(k);
      var nx = p + h, ny = a2 * qv + k;
      return out({ q: 'The point $(' + p + ', ' + qv + ')$ is on the graph of $f$. What point must be on the graph of $g(x) = ' + gtex2 + '$?', a: tup([nx, ny]), steps: ['Horizontal: $x ' + (h > 0 ? '- ' + h : '+ ' + (-h)) + '$ inside means shift ' + (h > 0 ? 'right' : 'left') + ' $' + Math.abs(h) + '$: the new $x$ is $' + p + T.signed(h) + ' = ' + nx + '$ (then $x ' + (h > 0 ? '- ' + h : '+ ' + (-h)) + ' = ' + p + '$, the input $f$ needs).'].concat(a2 !== 1 ? ['Multiply the output by $' + a2 + '$: $' + a2 + ' \\cdot ' + tp(qv) + ' = ' + a2 * qv + '$.'] : [], ['Then shift ' + (k > 0 ? 'up' : 'down') + ' $' + Math.abs(k) + '$: $' + (a2 * qv) + T.signed(k) + ' = ' + ny + '$.', 'Check: $g(' + nx + ') = ' + (a2 === 1 ? '' : a2 === -1 ? '-' : a2) + 'f(' + p + ')' + T.signed(k) + ' = ' + ny + '$.']), hint: 'Find the $x$ that makes the inside equal $' + p + '$; then apply the outside changes to $' + qv + '$.' }, { k: 'tuple', v: [p + h, a2 * qv + k] });
    }
    var par = R.pick([['x^2', 'x^2', '(x', ')^2'], ['|x|', 'abs(x', '|x', '|']]);
    var isAbs = par[0] === '|x|';
    var gt = (isAbs ? '\\left|' + tlin(1, -h) + '\\right|' : '(' + tlin(1, -h) + ')^2') + T.signed(k);
    var gp = isAbs ? pabs(1, h, k) : psq(1, h, k);
    return out({ q: 'The graph of $y = ' + par[0] + '$ is shifted ' + (h > 0 ? 'right $' + h + '$' : 'left $' + (-h) + '$') + ' and ' + (k > 0 ? 'up $' + k + '$' : 'down $' + (-k) + '$') + '. Write its equation.', a: { t: 'expr', v: gp }, steps: ['A horizontal shift changes the input: replace $x$ with $' + tlin(1, -h) + '$ (moving ' + (h > 0 ? 'right' : 'left') + ' means ' + (h > 0 ? 'subtracting' : 'adding') + ' inside).', 'A vertical shift changes the output: add $' + k + '$ outside.', '$y = ' + gt + '$.'], hint: 'Right means $x - h$ inside; up means $+ k$ outside.' }, { k: 'equiv', expr: gp });
  });


  // ================================================================ Unit 5: Linear Functions
  function slopeOf(R, lv) { return by({ level: lv }, q(R.nz(-4, 4)), R.chance(0.6) ? q(R.nz(-5, 5)) : fr(R.nz(-4, 4), R.pick([2, 3])), R.chance(0.5) ? q(R.nz(-6, 6)) : fr(R.nz(-5, 5), R.pick([2, 3, 4]))); }
  function yeq(m, b) { return 'y = ' + T.lin(m, 'x', b); }                 // TeX
  function pyeq(m, b) { return 'y = ' + pterms([[m, 'x'], [b, '']]); }      // plain
  function ptform(m, x1, y1) { // TeX point-slope y - y1 = m(x - x1)
    var rhs = q(x1).isZero() ? T.mono(m, 'x') : q(m).eq(1) ? 'x' + T.signed(q(x1).neg()) : (q(m).eq(-1) ? '-' : tn(m)) + '(x' + T.signed(q(x1).neg()) + ')';
    return 'y' + (q(y1).isZero() ? '' : T.signed(q(y1).neg())) + ' = ' + rhs;
  }

  // ---- alg1.graphs-as-solutions
  G('alg1.graphs-as-solutions', function (R, ctx) {
    var shape = R.pick(by(ctx, ['tf', 'tf', 'k'], ['tf', 'k', 'which'], ['k', 'which', 'tf']));
    var A = R.nz(-5, 5), B = R.nz(-4, 4), x0 = R.int(-5, 5), y0 = R.int(-5, 5), C = A * x0 + B * y0;
    var eqTex = T.lin(A, 'x', 0) + T.coef(B, 'y', false) + ' = ' + C, eqP = A + '*x+(' + B + ')*y=' + C;
    if (shape === 'tf') {
      var on = R.coin(), px = x0, py = on ? y0 : y0 + R.pick([-1, 1]);
      var lhs = A * px + B * py;
      return { q: 'True or false: the point $(' + px + ', ' + py + ')$ is on the graph of $' + eqTex + '$.', a: tf(on), steps: ['A point is on the graph exactly when its coordinates make the equation true. Substitute $x = ' + px + '$ and $y = ' + py + '$.', '$' + tsub(A, px) + ' ' + (B < 0 ? '-' : '+') + ' ' + (Math.abs(B) === 1 ? '' : Math.abs(B) + ' \\cdot ') + tp(py) + ' = ' + lhs + '$.', lhs === C ? '$' + lhs + ' = ' + C + '$: true, so the point is on the graph.' : '$' + lhs + ' \\ne ' + C + '$: false, so the point is not on the graph (even if it looks close in a picture).'], hint: 'Substitute both coordinates and see whether the equation is true.' };
    }
    if (shape === 'k') {
      var m = R.nz(-4, 5), b = R.int(-8, 8), a0 = R.int(-5, 6), useStd = R.coin() && (C % B === 0);
      if (useStd) {
        return out({ q: 'The point $(' + x0 + ', k)$ is on the graph of $' + eqTex + '$. Find $k$.', a: num(y0), steps: ['Every point on the graph makes the equation true, so substitute $x = ' + x0 + '$ and $y = k$: $' + tsub(A, x0) + T.coef(B, 'k', false) + ' = ' + C + '$.', 'Simplify: $' + A * x0 + T.coef(B, 'k', false) + ' = ' + C + '$, so $' + T.mono(B, 'k') + ' = ' + (C - A * x0) + '$.', '$k = ' + y0 + '$.'], hint: 'Put the known coordinate into the equation and solve for the other.' }, { k: 'roots', eq: (A * x0) + '+(' + B + ')*x=' + C });
      }
      return out({ q: 'The point $(' + a0 + ', k)$ is on the line $' + yeq(m, b) + '$. Find $k$.', a: num(m * a0 + b), steps: ['A point on the line makes the equation true. Substitute $x = ' + a0 + '$.', '$k = ' + tsub(m, a0, b) + ' = ' + (m * a0 + b) + '$.'], hint: 'The $y$-coordinate of a point on the line is what the equation gives for its $x$.' }, { k: 'val', expr: plin(m, b), env: { x: a0 } });
    }
    var m2 = R.nz(-3, 4), b2 = R.int(-6, 6), xs = R.sample([-3, -2, -1, 1, 2, 3, 4], 4);
    var right = '$(' + xs[0] + ', ' + (m2 * xs[0] + b2) + ')$', wr = [];
    wr.push('$(' + xs[1] + ', ' + (m2 * xs[1] + b2 + R.pick([-2, -1, 1, 2])) + ')$');
    wr.push('$(' + (m2 * xs[2] + b2) + ', ' + xs[2] + ')$');
    wr.push('$(' + xs[3] + ', ' + (m2 * xs[3] - b2 + (b2 === 0 ? 1 : 0)) + ')$');
    return { q: 'Which point is on the graph of $' + yeq(m2, b2) + '$?', a: mc(right, wr), steps: ['Test each point by substituting its $x$ and checking the $y$.', 'For ' + right + ': $' + tsub(m2, xs[0], b2) + ' = ' + (m2 * xs[0] + b2) + '$. It matches, so it is on the line.', 'The others give a different $y$ than the one listed (one even has its coordinates swapped).'], hint: 'For each point, compute $' + T.lin(m2, 'x', b2) + '$ and compare with its $y$.' };
  });

  // ---- alg1.point-slope-form
  G('alg1.point-slope-form', function (R, ctx) {
    var shape = R.pick(by(ctx, ['write', 'read', 'write'], ['write', 'read', 'slopeint'], ['write', 'slopeint', 'read']));
    var m = slopeOf(R, ctx.level), x1 = R.nz(-6, 6), y1 = R.int(-6, 6);
    if (shape === 'read') {
      if (!y1) y1 = R.pick([-3, 2, 4]);
      var askPt = R.chance(0.7);
      return out({ q: 'The line $' + ptform(m, x1, y1) + '$ is in point-slope form. ' + (askPt ? 'Which point does it pass through, as written?' : 'What is its slope?'), a: askPt ? tup([x1, y1]) : num(m), steps: ['Point-slope form is $y - y_1 = m(x - x_1)$, built around the point $(x_1, y_1)$.', askPt ? 'Match the signs: $' + ptform(m, x1, y1).split(' = ')[0] + '$ means $y - ' + tp(y1) + '$, and $' + (x1 < 0 ? 'x + ' + (-x1) : 'x - ' + x1) + '$ means $x - ' + tp(x1) + '$. So $(x_1, y_1) = (' + x1 + ', ' + y1 + ')$.' : 'The number multiplying $(x - x_1)$ is the slope: $m = ' + tn(m) + '$.', askPt ? 'Check: $x = ' + x1 + '$, $y = ' + y1 + '$ makes both sides $0$.' : 'Every point-slope form shows the slope in that spot.'], hint: askPt ? 'The form subtracts the coordinates. What number makes each parenthesis zero?' : 'The slope multiplies the $x$ part.' }, { k: askPt ? 'tuple' : 'num', v: askPt ? [x1, y1] : m.toNumber() });
    }
    var b = q(y1).sub(q(m).mul(x1));
    if (shape === 'slopeint') {
      return out({ q: 'Write the equation of the line through $(' + x1 + ', ' + y1 + ')$ with slope $' + tn(m) + '$ in slope-intercept form, $y = mx + b$.', a: { t: 'eq', v: pyeq(m, b), form: 'solved' }, steps: ['Start with point-slope form: $' + ptform(m, x1, y1) + '$.', 'Distribute: $y' + (y1 ? T.signed(-y1) : '') + ' = ' + T.lin(m, 'x', q(m).mul(-x1)) + '$.', (y1 ? undo(-y1) + ': ' : '') + '$' + yeq(m, b) + '$.'], hint: 'Write $y - y_1 = m(x - x_1)$, then solve it for $y$.' }, { k: 'eqline', m: m.toNumber(), pts: [[x1, y1]] });
    }
    return out({ q: 'Write an equation of the line through $(' + x1 + ', ' + y1 + ')$ with slope $' + tn(m) + '$.', a: { t: 'eq', v: pyeq(m, b) }, steps: ['Slope means: from any point on the line, $\\frac{y - y_1}{x - x_1} = m$. Multiply both sides by $x - x_1$: $y - y_1 = m(x - x_1)$.', 'Put in $m = ' + tn(m) + '$ and $(x_1, y_1) = (' + x1 + ', ' + y1 + ')$: $' + ptform(m, x1, y1) + '$.', 'That is a correct answer. In slope-intercept form it is $' + yeq(m, b) + '$.'], hint: 'Use $y - y_1 = m(x - x_1)$ with the given point and slope.' }, { k: 'eqline', m: m.toNumber(), pts: [[x1, y1]] });
  });

  // ---- alg1.line-through-two-points
  G('alg1.line-through-two-points', function (R, ctx) {
    var r = retry(function () { var x1 = R.int(-6, 5), x2 = R.intNot(-6, 6, [x1]), m = slopeOf(R, ctx.level); var y1 = R.int(-6, 6), y2 = q(y1).add(q(m).mul(x2 - x1)); if (!y2.isInt() || Math.abs(y2.toNumber()) > 12) return null; return [x1, y1, x2, y2.toNumber(), m]; });
    var x1 = r[0], y1 = r[1], x2 = r[2], y2 = r[3], m = r[4], b = q(y1).sub(m.mul(x1));
    var slopeStep = 'Slope: $m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{' + y2 + ' - ' + tp(y1) + '}{' + x2 + ' - ' + tp(x1) + '} = \\dfrac{' + (y2 - y1) + '}{' + (x2 - x1) + '} = ' + tn(m) + '$.';
    if (ctx.level === 1 && R.chance(0.4)) return out({ q: 'Find the slope of the line through $(' + x1 + ', ' + y1 + ')$ and $(' + x2 + ', ' + y2 + ')$.', a: num(m), steps: [slopeStep, 'Subtract in the same order on top and bottom: second point minus first point.'], hint: 'Change in $y$ over change in $x$, same order both times.' }, { k: 'num', v: m.toNumber() });
    return out({
      q: 'Write the equation of the line through $(' + x1 + ', ' + y1 + ')$ and $(' + x2 + ', ' + y2 + ')$ in slope-intercept form.',
      a: { t: 'eq', v: pyeq(m, b), form: 'solved' },
      steps: [slopeStep, 'Point-slope form with the first point: $' + ptform(m, x1, y1) + '$.', 'Solve for $y$: $' + yeq(m, b) + '$.', 'Check with the second point: $' + tsub(m, x2, b) + ' = ' + y2 + '$.'],
      hint: 'Find the slope first, then use either point in $y - y_1 = m(x - x_1)$.'
    }, { k: 'eqline', pts: [[x1, y1], [x2, y2]] });
  });

  // ---- alg1.standard-form
  G('alg1.standard-form', function (R, ctx) {
    var shape = R.pick(by(ctx, ['intercepts', 'intercepts', 'toSlope'], ['intercepts', 'toStd', 'toSlope'], ['toStd', 'intercepts', 'toStd']));
    if (shape === 'intercepts') {
      var r = retry(function () { var A = R.nz(-6, 6), B = R.nz(-6, 6), C = R.nz(-30, 30); return C % A === 0 && C % B === 0 && U.gcd(A, B, C) === 1 && A > 0 ? [A, B, C] : null; }, 300);
      var A = r[0], B = r[1], C = r[2];
      return out({ q: 'Find the intercepts of $' + T.lin(A, 'x', 0) + T.coef(B, 'y', false) + ' = ' + C + '$.', a: { t: 'multi', parts: [{ label: '$x$-intercept: $x =$', a: num(C / A) }, { label: '$y$-intercept: $y =$', a: num(C / B) }] }, steps: ['$x$-intercept: on the $x$-axis $y = 0$, so $' + T.mono(A, 'x') + ' = ' + C + '$' + (A === 1 ? '' : ' and $x = ' + C / A + '$') + '. The point is $(' + C / A + ', 0)$.', '$y$-intercept: on the $y$-axis $x = 0$, so $' + T.mono(B, 'y') + ' = ' + C + '$' + (B === 1 ? '' : ' and $y = ' + C / B + '$') + '. The point is $(0, ' + C / B + ')$.', 'Plot the two intercepts and draw the line through them.'], hint: 'For the $x$-intercept, set $y = 0$; for the $y$-intercept, set $x = 0$.' }, { k: 'multi', parts: [{ k: 'num', v: C / A }, { k: 'num', v: C / B }] });
    }
    if (shape === 'toSlope') {
      var r2 = retry(function () { var A = R.nz(-6, 6), B = R.nz(-6, 6), C = R.int(-20, 20); return U.gcd(A, B, C || 1) === 1 && A > 0 && Math.abs(B) > 1 ? [A, B, C] : null; }, 300);
      var m = fr(-r2[0], r2[1]), b = fr(r2[2], r2[1]);
      return out({ q: 'Write $' + T.lin(r2[0], 'x', 0) + T.coef(r2[1], 'y', false) + ' = ' + r2[2] + '$ in slope-intercept form.', a: { t: 'eq', v: pyeq(m, b), form: 'solved' }, steps: [(r2[0] > 0 ? 'Subtract $' + T.mono(r2[0], 'x') + '$ from' : 'Add to') + ' both sides: $' + T.mono(r2[1], 'y') + ' = ' + T.lin(-r2[0], 'x', r2[2]) + '$.', 'Divide every term by $' + r2[1] + '$: $' + yeq(m, b) + '$.', 'So the slope is $' + tn(m) + '$ and the $y$-intercept is $' + tn(b) + '$.'], hint: 'Get $y$ alone: move the $x$ term, then divide every term by the coefficient of $y$.' }, { k: 'eqline', std: [r2[0], r2[1], r2[2]] });
    }
    var dd = R.pick([2, 3, 4, 5]), nn = R.nz(-5, 5); if (gcd(nn, dd) !== 1) nn = nn > 0 ? 1 : -1;
    var m2 = fr(nn, dd), b2 = fr(R.int(-9, 9), R.pick([1, 2, 3]));
    var L = U.lcm(m2.den(), b2.den()), A2 = -m2.mul(L).toNumber(), B2 = L, C2 = b2.mul(L).toNumber();
    if (A2 < 0) { A2 = -A2; B2 = -B2; C2 = -C2; }
    var g = U.gcd(A2, B2, C2 || 1); A2 /= g; B2 /= g; C2 /= g;
    return out({ q: 'Write $' + yeq(m2, b2) + '$ in standard form $Ax + By = C$, with whole numbers and $A > 0$.', a: { t: 'eq', v: A2 + 'x' + (B2 < 0 ? '-' : '+') + Math.abs(B2) + 'y=' + C2, form: 'standard' }, steps: ['Clear the fractions: multiply every term by $' + L + '$: $' + T.mono(L, 'y') + ' = ' + T.lin(m2.mul(L), 'x', b2.mul(L)) + '$.', 'Move the $x$ term to the left: $' + T.lin(m2.mul(L).neg(), 'x', 0) + T.coef(L, 'y', false) + ' = ' + tn(b2.mul(L)) + '$.', 'Make sure $A$ is positive and the three numbers share no common factor: $' + T.lin(A2, 'x', 0) + T.coef(B2, 'y', false) + ' = ' + C2 + '$.'], hint: 'Multiply by the common denominator, then gather $x$ and $y$ on the left.' }, { k: 'eqline', m: m2.toNumber(), pts: [[0, b2.toNumber()]] });
  });

  // ---- alg1.horizontal-vertical-lines
  G('alg1.horizontal-vertical-lines', function (R, ctx) {
    var shape = R.pick(by(ctx, ['eq', 'slope', 'eq'], ['eq', 'two', 'slope'], ['two', 'perp', 'eq']));
    var a = R.nz(-7, 7), b = R.nz(-7, 7), vert = R.coin();
    if (shape === 'slope') {
      var s = vert ? 'x = ' + a : 'y = ' + b;
      return { q: 'What is the slope of the line $' + s + '$?', a: mc(vert ? 'Undefined (no slope)' : '$0$', vert ? ['$0$', '$' + a + '$', '$1$'] : ['Undefined (no slope)', '$' + b + '$', '$1$']), steps: vert ? ['Every point on $x = ' + a + '$ has the same $x$, so the run between any two points is $0$.', 'Slope would be $\\frac{\\text{rise}}{0}$, and division by zero is undefined. A vertical line has no slope.'] : ['Every point on $y = ' + b + '$ has the same $y$, so the rise is $0$.', 'Slope $= \\frac{0}{\\text{run}} = 0$. A horizontal line is flat: slope $0$.'], hint: 'Pick two points on the line and compute rise over run.' };
    }
    if (shape === 'two') {
      var same = R.coin(), p1 = same ? [a, R.int(-6, 6)] : [R.int(-6, 6), b], p2 = same ? [a, R.intNot(-6, 6, [p1[1]])] : [R.intNot(-6, 6, [p1[0]]), b];
      return out({ q: 'Write the equation of the line through $(' + p1.join(', ') + ')$ and $(' + p2.join(', ') + ')$.', a: { t: 'eq', v: same ? 'x = ' + a : 'y = ' + b }, steps: [same ? 'Both points have $x = ' + a + '$, so the line is vertical.' : 'Both points have $y = ' + b + '$, so the line is horizontal.', same ? 'Every point on it has $x = ' + a + '$, whatever its $y$: the equation is $x = ' + a + '$.' : 'Every point on it has $y = ' + b + '$: the equation is $y = ' + b + '$.'], hint: 'Which coordinate stays the same?' }, null);
    }
    if (shape === 'perp') {
      var m = R.nz(-4, 4);
      var perpL = R.coin(), givenH = perpL ? vert : !vert; // the given line is horizontal when givenH
      var given = givenH ? 'y = ' + R.intNot(-6, 6, [b]) : 'x = ' + R.intNot(-6, 6, [a]);
      return out({ q: 'Write the equation of the line through $(' + a + ', ' + b + ')$ that is ' + (perpL ? 'perpendicular' : 'parallel') + ' to the line $' + given + '$.', a: { t: 'eq', v: vert ? 'x = ' + a : 'y = ' + b }, steps: ['$' + given + '$ is a ' + (givenH ? 'horizontal' : 'vertical') + ' line. A line ' + (perpL ? 'perpendicular' : 'parallel') + ' to it is ' + (vert ? 'vertical' : 'horizontal') + '.', 'The ' + (vert ? 'vertical' : 'horizontal') + ' line through $(' + a + ', ' + b + ')$ is $' + (vert ? 'x = ' + a : 'y = ' + b) + '$.'], hint: 'Decide first: is the new line horizontal or vertical?' }, null);
    }
    return out({ q: 'Write the equation of the ' + (vert ? 'vertical' : 'horizontal') + ' line through $(' + a + ', ' + b + ')$.', a: { t: 'eq', v: vert ? 'x = ' + a : 'y = ' + b }, steps: [vert ? 'On a vertical line, every point has the same $x$-coordinate as the given point: $' + a + '$.' : 'On a horizontal line, every point has the same $y$-coordinate as the given point: $' + b + '$.', 'So the equation is $' + (vert ? 'x = ' + a : 'y = ' + b) + '$. The other coordinate can be anything.'], hint: vert ? 'A vertical line goes straight up and down. Which coordinate never changes?' : 'A horizontal line is flat. Which coordinate never changes?' }, null);
  });

  // ---- alg1.parallel-perpendicular-lines
  G('alg1.parallel-perpendicular-lines', function (R, ctx) {
    var shape = R.pick(by(ctx, ['slope', 'classify', 'slope'], ['line', 'classify', 'slope'], ['line', 'line', 'classify']));
    var m = R.chance(0.5) ? q(R.nz(-5, 5)) : fr(R.nz(-4, 4), R.pick([2, 3, 5])), perp = R.coin(), b0 = R.int(-6, 6);
    var mp = perp ? q(-1).div(m) : m;
    if (shape === 'slope') {
      return out({ q: 'A line has equation $' + yeq(m, b0) + '$. What is the slope of a line ' + (perp ? 'perpendicular' : 'parallel') + ' to it?', a: num(mp), steps: perp ? ['Perpendicular slopes are negative reciprocals: flip the fraction and change the sign.', 'The reciprocal of $' + tn(m) + '$ is $' + tn(q(1).div(m)) + '$; change the sign: $' + tn(mp) + '$.', 'Check: $' + tp(m) + ' \\cdot ' + tp(mp) + ' = -1$.'] : ['Parallel lines rise at the same rate, so they have the same slope: $' + tn(m) + '$.'], hint: perp ? 'Negative reciprocal: flip it and change its sign.' : 'Parallel lines never meet, so they must be equally steep.' }, { k: 'num', v: mp.toNumber() });
    }
    if (shape === 'classify') {
      var kind = R.pick(['par', 'perp', 'neither']), m2 = kind === 'par' ? m : kind === 'perp' ? q(-1).div(m) : (function () { var c = m.neg(); if (c.eq(q(-1).div(m))) c = m.add(1); return c; })();
      var b1 = R.int(-6, 6), b2 = R.intNot(-6, 6, [b1]);
      var line2 = R.coin() ? yeq(m2, b2) : T.lin(-m2.num(), 'x', 0) + T.coef(m2.den(), 'y', false) + ' = ' + m2.den() * b2;
      var right = { par: 'Parallel', perp: 'Perpendicular', neither: 'Neither' }[kind];
      return { q: 'Are these lines parallel, perpendicular, or neither? $$' + yeq(m, b1) + ' \\qquad ' + line2 + '$$', a: { t: 'mc', choices: ['Parallel', 'Perpendicular', 'Neither'], v: ['Parallel', 'Perpendicular', 'Neither'].indexOf(right), keep: true }, steps: ['Find each slope (solve for $y$ if needed): $' + tn(m) + '$ and $' + tn(m2) + '$.', kind === 'par' ? 'The slopes are equal (and the intercepts differ), so the lines are parallel.' : kind === 'perp' ? 'Their product is $' + tp(m) + ' \\cdot ' + tp(m2) + ' = -1$, so the lines are perpendicular.' : 'The slopes are not equal, and their product is $' + tn(m.mul(m2)) + '$, not $-1$. Neither.'], hint: 'Compare the slopes: equal means parallel; a product of $-1$ means perpendicular.' };
    }
    var x1 = R.int(-5, 5), y1 = R.int(-6, 6), b = q(y1).sub(mp.mul(x1));
    return out({ q: 'Write the equation of the line through $(' + x1 + ', ' + y1 + ')$ that is ' + (perp ? 'perpendicular' : 'parallel') + ' to $' + yeq(m, b0) + '$. Use slope-intercept form.', a: { t: 'eq', v: pyeq(mp, b), form: 'solved' }, steps: [perp ? 'The given slope is $' + tn(m) + '$; the perpendicular slope is its negative reciprocal, $' + tn(mp) + '$.' : 'A parallel line has the same slope, $' + tn(m) + '$.', 'Point-slope form: $' + ptform(mp, x1, y1) + '$.', 'Solve for $y$: $' + yeq(mp, b) + '$.'], hint: 'Find the new slope first, then use the point.' }, { k: 'eqline', pts: [[x1, y1]], rel: perp ? 'perp' : 'par', orig: m.toNumber() });
  });

  // ---- alg1.linear-models-context
  G('alg1.linear-models-context', function (R, ctx) {
    var S = R.pick([
      { who: 'A plumber', start: R.pick([45, 60, 75]), rate: R.pick([35, 40, 50]), x: 'hours of work', xu: 'hour', y: 'total charge', yu: 'dollars', money: true, fee: 'a visit fee' },
      { who: 'A taxi', start: R.pick([3, 4, 5]), rate: R.pick([2, 3]), x: 'miles driven', xu: 'mile', y: 'fare', yu: 'dollars', money: true, fee: 'a starting charge' },
      { who: 'A pool', start: R.pick([500, 800, 1200]), rate: R.pick([150, 200, 250]), x: 'hours of filling', xu: 'hour', y: 'amount of water', yu: 'gallons', money: false, fee: 'water already in it' },
      { who: 'A candle', start: R.pick([24, 30, 36]), rate: -R.pick([2, 3]), x: 'hours of burning', xu: 'hour', y: 'height', yu: 'centimeters', money: false, fee: 'its starting height' }
    ]);
    var shape = R.pick(by(ctx, ['predict', 'slope', 'intercept'], ['predict', 'solve', 'slope', 'twopts'], ['twopts', 'solve', 'intercept']));
    var b = S.start, m = S.rate, eq = 'y = ' + T.lin(m, 'x', b);
    var desc = S.who + (S.money ? ' charges $' + money(b) + '$ plus $' + money(m) + '$ per ' + S.xu + '.' : S.rate > 0 ? ' starts with $' + b + '$ ' + S.yu + ' and gains $' + m + '$ ' + S.yu + ' per ' + S.xu + '.' : ' is $' + b + '$ ' + S.yu + ' tall and burns down $' + (-m) + '$ ' + S.yu + ' per ' + S.xu + '.');
    if (shape === 'slope' || shape === 'intercept') {
      var isS = shape === 'slope';
      var right = isS ? 'The ' + S.y + ' changes by ' + m + ' ' + S.yu + ' for each ' + S.xu : 'The ' + S.y + ' when there are 0 ' + S.x;
      var wrongs = isS ? ['The ' + S.y + ' when there are 0 ' + S.x, 'The total ' + S.y + ' after ' + Math.abs(m) + ' ' + S.xu + 's', 'The number of ' + S.x + ' needed to reach ' + b + ' ' + S.yu] : ['The ' + S.y + ' changes by ' + b + ' ' + S.yu + ' for each ' + S.xu, 'The greatest possible ' + S.y, 'The number of ' + S.x + ' it takes to reach 0'];
      return { q: desc + ' The model is $' + eq + '$, where $x$ is the number of ' + S.x + ' and $y$ is the ' + S.y + ' in ' + S.yu + '. What does the ' + (isS ? 'slope, $' + m + '$,' : '$y$-intercept, $' + b + '$,') + ' mean?', a: mc(right, wrongs), steps: isS ? ['The slope is a rate: change in $y$ per $1$ change in $x$.', 'Here it is $' + m + '$ ' + S.yu + ' per ' + S.xu + ': ' + right.toLowerCase() + '.'] : ['The $y$-intercept is the value of $y$ when $x = 0$: the starting value.', 'Here it is ' + S.fee + ', $' + b + '$ ' + S.yu + '.'], hint: isS ? 'Slope = change in output per one unit of input, with units.' : 'What is $y$ when $x = 0$?' };
    }
    if (shape === 'predict') {
      var x0 = R.int(2, 9), y0 = b + m * x0;
      if (y0 < 0) x0 = Math.floor(b / -m / 2), y0 = b + m * x0;
      return out({ q: desc + ' Write a model and use it to find the ' + S.y + ' after $' + x0 + '$ ' + S.xu + 's.', a: num(y0), unit: S.yu, steps: ['Starting value $b = ' + b + '$, rate $m = ' + m + '$: $' + eq + '$.', 'Substitute $x = ' + x0 + '$: $y = ' + tsub(m, x0, b) + ' = ' + y0 + '$.', 'The ' + S.y + ' is ' + (S.money ? '$' + money(y0) + '$' : '$' + y0 + '$ ' + S.yu) + '.'], hint: 'Model: starting value plus rate times input.' }, { k: 'num', v: y0 });
    }
    if (shape === 'solve') {
      var x1 = R.int(2, 9), y1 = b + m * x1;
      if (y1 < 0) { x1 = 2; y1 = b + m * 2; }
      return out({ q: desc + ' After how many ' + S.xu + 's is the ' + S.y + ' ' + (S.money ? '$' + money(y1) + '$' : '$' + y1 + '$ ' + S.yu) + '?', a: num(x1), unit: S.xu + 's', steps: ['Model: $' + eq + '$. Set $y = ' + y1 + '$: $' + y1 + ' = ' + T.lin(m, 'x', b) + '$.', undo(b) + ': $' + (y1 - b) + ' = ' + T.mono(m, 'x') + '$.', 'Divide by $' + m + '$: $x = ' + x1 + '$.'], hint: 'This time you know $y$. Solve for $x$.' }, { k: 'roots', eq: y1 + '=' + plin(m, b) });
    }
    var t1 = R.int(1, 3), t2 = t1 + R.int(2, 4), v1 = b + m * t1, v2 = b + m * t2;
    return out({ q: S.who + ' has a ' + S.y + ' of $' + v1 + '$ ' + S.yu + ' after $' + t1 + '$ ' + S.xu + (t1 > 1 ? 's' : '') + ' and $' + v2 + '$ ' + S.yu + ' after $' + t2 + '$ ' + S.xu + 's. The ' + S.y + ' changes at a constant rate. What was it at the start (after $0$ ' + S.xu + 's)?', a: num(b), unit: S.yu, steps: ['Rate (slope): $\\frac{' + v2 + ' - ' + v1 + '}{' + t2 + ' - ' + t1 + '} = ' + m + '$ ' + S.yu + ' per ' + S.xu + '.', 'Go back ' + t1 + ' ' + S.xu + (t1 > 1 ? 's' : '') + ' from the first data point: $' + v1 + ' - ' + tp(m) + ' \\cdot ' + t1 + ' = ' + b + '$.', 'The starting value (the $y$-intercept) is $' + b + '$ ' + S.yu + ', and the model is $' + eq + '$.'], hint: 'Find the rate from the two points, then work back to $x = 0$.' }, { k: 'num', v: b });
  });

  // ---- alg1.inverse-linear-functions
  G('alg1.inverse-linear-functions', function (R, ctx) {
    var shape = R.pick(by(ctx, ['find', 'eval', 'find'], ['find', 'eval', 'frac'], ['frac', 'find', 'context']));
    var m = R.pick([2, 3, 4, 5, -2, -3]), b = R.nz(-9, 9);
    if (shape === 'context') {
      return out({ q: 'The formula $F = \\frac{9}{5}C + 32$ turns a Celsius temperature into Fahrenheit. Write the inverse function, giving $C$ in terms of $F$.', a: { t: 'expr', v: '5/9*(F-32)', vars: ['F'] }, steps: ['The inverse undoes the steps in reverse order. $F$ was made by multiplying $C$ by $\\frac{9}{5}$, then adding $32$.', 'Undo the adding: $F - 32 = \\frac{9}{5}C$.', 'Undo the multiplying (multiply by $\\frac{5}{9}$): $C = \\frac{5}{9}(F - 32)$.', 'Check: $C = 100$ gives $F = 212$, and $\\frac{5}{9}(212 - 32) = 100$.'], hint: 'Solve $F = \\frac{9}{5}C + 32$ for $C$.' }, { k: 'formula', eq: 'F=9/5*C+32', v: 'C', vars: ['F'] });
    }
    if (shape === 'frac') {
      var d = R.pick([2, 3, 4]), c = R.nz(-6, 6);
      // f(x) = (x + c)/d ; inverse d x - c
      return out({ q: 'Find the inverse of $f(x) = \\dfrac{' + tlin(1, c) + '}{' + d + '}$.', a: { t: 'expr', v: plin(d, -c) }, steps: ['Write $y = \\dfrac{' + tlin(1, c) + '}{' + d + '}$ and swap $x$ and $y$: $x = \\dfrac{' + tlin(1, c, 'y') + '}{' + d + '}$.', 'Multiply both sides by $' + d + '$: $' + d + 'x = ' + tlin(1, c, 'y') + '$.', undo(c) + ': $y = ' + tlin(d, -c) + '$.', 'So $f^{-1}(x) = ' + tlin(d, -c) + '$. Check: $f(f^{-1}(x)) = \\frac{' + d + 'x' + T.signed(-c) + T.signed(c) + '}{' + d + '} = x$.'], hint: 'Swap $x$ and $y$, then solve for $y$.' }, { k: 'fn', expr: d + '*x-(' + c + ')' });
    }
    var inv = pterms([[fr(1, m), 'x'], [fr(-b, m), '']]);
    if (shape === 'eval') {
      var k = R.int(-6, 6), out1 = m * k + b;
      return out({ q: 'Let $f(x) = ' + tlin(m, b) + '$. Find $f^{-1}(' + out1 + ')$.', a: num(k), steps: ['$f^{-1}(' + out1 + ')$ is the input that $f$ sends to $' + out1 + '$: solve $' + tlin(m, b) + ' = ' + out1 + '$.', undo(b) + ': $' + m + 'x = ' + (out1 - b) + '$, so $x = ' + k + '$.', 'Check: $f(' + k + ') = ' + tsub(m, k, b) + ' = ' + out1 + '$.'], hint: 'An inverse swaps inputs and outputs. Which input gives ' + out1 + '?' }, { k: 'num', v: k });
    }
    return out({ q: 'Find the inverse function of $f(x) = ' + tlin(m, b) + '$.', a: { t: 'expr', v: inv }, steps: ['Write $y = ' + tlin(m, b) + '$. An inverse swaps inputs and outputs, so swap $x$ and $y$: $x = ' + tlin(m, b, 'y') + '$.', undo(b) + ': $' + T.lin(1, 'x', -b) + ' = ' + T.mono(m, 'y') + '$.', 'Divide by $' + m + '$: $y = \\dfrac{' + T.lin(1, 'x', -b) + '}{' + m + '}$.', 'So $f^{-1}(x) = \\dfrac{' + T.lin(1, 'x', -b) + '}{' + m + '}$. It undoes $f$ in reverse order: $f$ multiplies by $' + m + '$ and then ' + (b > 0 ? 'adds $' + b + '$' : 'subtracts $' + (-b) + '$') + ', so $f^{-1}$ first ' + (b > 0 ? 'subtracts $' + b + '$' : 'adds $' + (-b) + '$') + ' and then divides by $' + m + '$.'], hint: 'Swap $x$ and $y$, then solve for $y$. Undo the operations in reverse order.' }, { k: 'fn', expr: '(x-(' + b + '))/(' + m + ')' });
  });

  // ---- alg1.linear-inequalities-2var
  G('alg1.linear-inequalities-2var', function (R, ctx) {
    var shape = R.pick(by(ctx, ['test', 'test', 'graph'], ['test', 'graph', 'which'], ['graph', 'graph', 'which']));
    var A = R.nz(-4, 4), B = R.pick([1, 2, 3, -1, -2, -3]), C = R.int(-8, 8), rel = relOf(R);
    var tex = T.lin(A, 'x', 0) + T.coef(B, 'y', false) + ' ' + TREL[rel] + ' ' + C;
    function holds(x, y) { var v = A * x + B * y; return { '<': v < C, '<=': v <= C, '>': v > C, '>=': v >= C }[rel]; }
    if (shape === 'test') {
      var px = R.nz(-4, 4), py = R.nz(-4, 4), lhs = A * px + B * py, ok = holds(px, py);
      return { q: 'True or false: $(' + px + ', ' + py + ')$ is a solution of $' + tex + '$.', a: tf(ok), steps: ['Substitute $x = ' + px + '$ and $y = ' + py + '$: $' + tsub(A, px) + ' ' + (B < 0 ? '-' : '+') + ' ' + (Math.abs(B) === 1 ? '' : Math.abs(B) + ' \\cdot ') + tp(py) + ' = ' + lhs + '$.', 'Is $' + lhs + ' ' + TREL[rel] + ' ' + C + '$? ' + (ok ? 'Yes, so the point is a solution.' : 'No, so the point is not a solution.')], hint: 'Substitute the point and check whether the inequality is true.' };
    }
    // solved for y: B y REL C - A x -> y REL' (C - A x)/B
    var r2 = B < 0 ? FLIP[rel] : rel, m = fr(-A, B), b = fr(C, B);
    if (shape === 'graph') {
      var line = r2 === '<' || r2 === '>' ? 'Dashed' : 'Solid', side = r2[0] === '>' ? 'above' : 'below';
      var choices = ['Dashed line, shade above', 'Dashed line, shade below', 'Solid line, shade above', 'Solid line, shade below'];
      var right = line + ' line, shade ' + side;
      var tt = r2 === rel ? '' : ' Dividing by the negative number $' + B + '$ flips the sign.';
      return { q: 'How should the graph of $' + tex + '$ look?', a: { t: 'mc', choices: choices, v: choices.indexOf(right), keep: true }, steps: ['Solve for $y$: $' + T.mono(B, 'y') + ' ' + TREL[rel] + ' ' + T.lin(-A, 'x', C) + '$, so $y ' + TREL[r2] + ' ' + T.lin(m, 'x', b) + '$.' + tt, (line === 'Dashed' ? 'The sign is strict (' + (r2 === '<' ? '$<$' : '$>$') + '), so points on the line are not solutions: draw it dashed.' : 'The sign includes equality (' + (r2 === '<=' ? '$\\le$' : '$\\ge$') + '), so the line is part of the solution: draw it solid.'), '$y$ ' + (side === 'above' ? 'greater' : 'less') + ' than the line\'s value means the points ' + side + ' it: shade ' + side + '.', 'Check with $(0, 0)$' + (C === 0 ? ' (it is on the line here, so test $(0, 1)$ instead)' : '') + ': ' + (C === 0 ? (holds(0, 1) ? '$(0, 1)$ works, and it is above the line.' : '$(0, 1)$ does not work, and it is above the line.') : '$0 ' + TREL[rel] + ' ' + C + '$ is ' + (holds(0, 0) ? 'true, so the side with the origin is shaded.' : 'false, so the side without the origin is shaded.'))], hint: 'Solve for $y$ first (flip the sign if you divide by a negative). Strict signs give a dashed line; $>$ shades above.' };
    }
    var goodL = [], badL = [];
    for (var gx = -4; gx <= 4; gx++) for (var gy = -4; gy <= 4; gy++) { if (A * gx + B * gy === C || !gx || !gy) continue; (holds(gx, gy) ? goodL : badL).push([gx, gy]); }
    if (!(goodL.length >= 1 && badL.length >= 3) && !(badL.length >= 1 && goodL.length >= 3)) { C = 0; rel = '<'; goodL = []; badL = []; for (gx = -4; gx <= 4; gx++) for (gy = -4; gy <= 4; gy++) { if (A * gx + B * gy === C || !gx || !gy) continue; (holds(gx, gy) ? goodL : badL).push([gx, gy]); } tex = T.lin(A, 'x', 0) + T.coef(B, 'y', false) + ' < 0'; }
    var notQ = !(goodL.length >= 1 && badL.length >= 3), oneL = notQ ? R.sample(badL, 1) : R.sample(goodL, 1), threeL = notQ ? R.sample(goodL, 3) : R.sample(badL, 3);
    var ptx = function (p) { return '$(' + p[0] + ', ' + p[1] + ')$'; }, vals = function (p) { return '$' + ptx(p).slice(1, -1) + '$: $' + (A * p[0] + B * p[1]) + ' ' + TREL[rel] + ' ' + C + '$ is ' + (holds(p[0], p[1]) ? 'true' : 'false') + '.'; };
    return { q: 'Which point is ' + (notQ ? '<b>not</b> ' : '') + 'a solution of $' + tex + '$?', a: mc(ptx(oneL[0]), threeL.map(ptx)), steps: ['Substitute each point into $' + T.lin(A, 'x', 0) + T.coef(B, 'y', false) + '$ and compare with $' + C + '$.', vals(oneL[0])].concat(threeL.map(vals)), hint: 'Test each point in the inequality.' };
  });


  // ================================================================ Unit 6: Systems of Equations
  function stdTex(a, b, c) { return T.lin(a, 'x', 0) + T.coef(b, 'y', false) + ' = ' + tn(c); }
  function stdPlain(a, b, c) { return pterms([[a, 'x'], [b, 'y']]) + '=' + pq(c); }
  function sysTex(e1, e2) { return '$$\\begin{aligned} ' + stdTex(e1[0], e1[1], e1[2]).replace(' = ', ' &= ') + ' \\\\ ' + stdTex(e2[0], e2[1], e2[2]).replace(' = ', ' &= ') + ' \\end{aligned}$$'; }
  function sysChk(e1, e2) { return { k: 'sys', eqs: [stdPlain(e1[0], e1[1], e1[2]), stdPlain(e2[0], e2[1], e2[2])] }; }
  function eqRow(e) { return stdTex(e[0], e[1], e[2]); }
  function backSub(e, v, val, other) { // substitute v = val into e = [a, b, c] and solve for the other variable; returns [steps, value]
    var a = e[0], b = e[1], c = e[2], known = v === 'x' ? a : b, unk = v === 'x' ? b : a, rest = q(c).sub(q(known).mul(val)), ans = rest.div(unk);
    return [['Substitute $' + v + ' = ' + tn(val) + '$ into $' + eqRow(e) + '$: $' + (v === 'x' ? tsub(a, val) + T.coef(b, 'y', false) : T.mono(a, 'x') + (q(b).sign() < 0 ? ' - ' : ' + ') + (q(b).abs().eq(1) ? '' : tn(q(b).abs()) + ' \\cdot ') + tp(val)) + ' = ' + tn(c) + '$.',
      'So $' + T.mono(unk, other) + ' = ' + tn(rest) + '$, which gives $' + other + ' = ' + tn(ans) + '$.'], ans];
  }

  // ---- alg1.systems-elimination
  G('alg1.systems-elimination', function (R, ctx) {
    var x0 = R.nz(-6, 6), y0 = R.nz(-6, 6), elimY = R.coin(), b = R.pick([1, 2, 3, 4, 5]), a1 = R.nz(-5, 5), a2 = R.intNot(-5, 5, [0, a1, -a1]);
    var subtract = ctx.level >= 2 && R.chance(0.5);
    // the eliminated variable has coefficients b and -b (add) or b and b (subtract)
    var e1, e2, kept = elimY ? 'x' : 'y', gone = elimY ? 'y' : 'x';
    var c2 = subtract ? b : -b;
    if (elimY) { e1 = [a1, b, a1 * x0 + b * y0]; e2 = [a2, c2, a2 * x0 + c2 * y0]; }
    else { e1 = [b, a1, b * x0 + a1 * y0]; e2 = [c2, a2, c2 * x0 + a2 * y0]; }
    var sum = subtract ? [e1[0] - e2[0], e1[1] - e2[1], e1[2] - e2[2]] : [e1[0] + e2[0], e1[1] + e2[1], e1[2] + e2[2]];
    var kc = elimY ? sum[0] : sum[1], kv = q(sum[2]).div(kc);
    var bs = backSub(e1, kept, kv, gone);
    var steps = ['The $' + gone + '$ terms are $' + T.mono(elimY ? e1[1] : e1[0], gone) + '$ and $' + T.mono(elimY ? e2[1] : e2[0], gone) + '$. ' + (subtract ? 'They are equal, so <b>subtracting</b> the equations makes them cancel.' : 'They are opposites, so <b>adding</b> the equations makes them cancel.'),
      (subtract ? 'Subtract the second equation from the first, every term, including the right side: ' : 'Add the left sides and add the right sides: ') + '$' + T.mono(kc, kept) + ' = ' + sum[2] + '$.',
      'So $' + kept + ' = ' + tn(kv) + '$.'].concat(bs[0], ['Solution: $(' + x0 + ', ' + y0 + ')$. Check it in the second equation: $' + tsub(e2[0], x0) + T.signed(e2[1] * y0) + ' = ' + e2[2] + '$.']);
    if (ctx.level === 3 && R.chance(0.5)) { // rearranged first equation: a1 x = c - b y form
      var shown1 = elimY ? T.mono(e1[0], 'x') + ' = ' + T.lin(-e1[1], 'y', e1[2]) : T.mono(e1[1], 'y') + ' = ' + T.lin(-e1[0], 'x', e1[2]);
      steps.unshift('First line up the terms: $' + shown1 + '$ is the same as $' + eqRow(e1) + '$.');
      return out({ q: 'Solve the system by elimination: $$\\begin{aligned} ' + shown1.replace(' = ', ' &= ') + ' \\\\ ' + eqRow(e2).replace(' = ', ' &= ') + ' \\end{aligned}$$ Give the solution as $(x, y)$.', a: tup([x0, y0], ['x', 'y']), steps: steps, hint: 'Rewrite the first equation with $x$ and $y$ on the left, then add or subtract.' }, sysChk(e1, e2));
    }
    return out({ q: 'Solve the system by elimination:' + sysTex(e1, e2) + 'Give the solution as $(x, y)$.', a: tup([x0, y0], ['x', 'y']), steps: steps, hint: 'Which variable has matching or opposite coefficients? Add or subtract to cancel it.' }, sysChk(e1, e2));
  });

  // ---- alg1.systems-elimination-multiply
  G('alg1.systems-elimination-multiply', function (R, ctx) {
    var special = ctx.level === 3 && R.chance(0.3);
    if (special) {
      var a = R.nz(-4, 4), b = R.pick([2, 3, 5, -2, -3]), c = R.int(-9, 9), k = R.pick([2, 3, -2]), same = R.coin(), c2 = same ? k * c : k * c + R.pick([-3, 2, 5]);
      var right = same ? 'Infinitely many' : 'None';
      return { q: 'How many solutions does this system have?' + sysTex([a, b, c], [k * a, k * b, c2]), a: { t: 'mc', choices: ['Exactly one', 'None', 'Infinitely many'], v: same ? 2 : 1, keep: true }, steps: ['Multiply the first equation by $' + k + '$: $' + eqRow([k * a, k * b, k * c]) + '$.', 'Subtract it from the second equation: both variables cancel and you get $0 = ' + (c2 - k * c) + '$.', same ? '$0 = 0$ is always true: the equations describe the same line, so there are infinitely many solutions.' : '$0 = ' + (c2 - k * c) + '$ is false: the lines are parallel and never meet, so there is no solution.'], hint: 'Try to eliminate a variable. What is left when both variables cancel?' };
    }
    var r = retry(function () {
      var x0 = R.nz(-5, 5), y0 = R.nz(-5, 5), a1 = R.nz(-5, 5), b1 = R.nz(-5, 5), a2 = R.nz(-5, 5), b2 = R.nz(-5, 5);
      if (a1 * b2 - a2 * b1 === 0) return null;
      if (Math.abs(a1) === Math.abs(a2) || Math.abs(b1) === Math.abs(b2)) return null;
      var one = ctx.level === 1 || (ctx.level === 2 && R.coin());
      if (one && !(a2 % a1 === 0 || b2 % b1 === 0 || a1 % a2 === 0 || b1 % b2 === 0)) return null;
      if (!one && (a2 % a1 === 0 || b2 % b1 === 0 || a1 % a2 === 0 || b1 % b2 === 0)) return null;
      return [x0, y0, a1, b1, a2, b2];
    }, 400);
    var x0 = r[0], y0 = r[1], e1 = [r[2], r[3], r[2] * x0 + r[3] * y0], e2 = [r[4], r[5], r[4] * x0 + r[5] * y0];
    // choose the variable to eliminate: prefer one where one coefficient divides the other
    var gone = (e2[1] % e1[1] === 0 || e1[1] % e2[1] === 0) ? 'y' : (e2[0] % e1[0] === 0 || e1[0] % e2[0] === 0) ? 'x' : (Math.abs(e1[1]) + Math.abs(e2[1]) <= Math.abs(e1[0]) + Math.abs(e2[0]) ? 'y' : 'x');
    var i = gone === 'x' ? 0 : 1, L = U.lcm(e1[i], e2[i]), sg1 = e1[i] < 0 ? -1 : 1, sg2 = e2[i] < 0 ? -1 : 1;
    var m1 = L / Math.abs(e1[i]), m2 = -sg1 * sg2 * L / Math.abs(e2[i]); // first multiplier positive; the second makes the coefficients opposite
    var s1 = e1.map(function (v) { return v * m1; }), s2 = e2.map(function (v) { return v * m2; }), sum = [s1[0] + s2[0], s1[1] + s2[1], s1[2] + s2[2]];
    var kept = gone === 'x' ? 'y' : 'x', kc = gone === 'x' ? sum[1] : sum[0], kv = q(sum[2]).div(kc), bs = backSub(e1, kept, kv, gone);
    var steps = ['To cancel $' + gone + '$, make its coefficients opposites: $' + T.mono(e1[i], gone) + '$ and $' + T.mono(e2[i], gone) + '$ can both become $\\pm' + L + gone + '$.'];
    if (m1 !== 1) steps.push('Multiply <em>every</em> term of the first equation by $' + m1 + '$: $' + eqRow(s1) + '$.');
    if (m2 !== 1) steps.push('Multiply <em>every</em> term of the second equation by $' + m2 + '$: $' + eqRow(s2) + '$.');
    steps.push('Add the equations: $' + T.mono(kc, kept) + ' = ' + sum[2] + '$, so $' + kept + ' = ' + tn(kv) + '$.');
    steps = steps.concat(bs[0], ['Solution: $(' + x0 + ', ' + y0 + ')$. Check it in both original equations.']);
    return out({ q: 'Solve the system:' + sysTex(e1, e2) + 'Give the solution as $(x, y)$.', a: tup([x0, y0], ['x', 'y']), steps: steps, hint: 'Multiply one or both equations (both sides!) so that one variable has opposite coefficients.' }, sysChk(e1, e2));
  });

  // ---- alg1.systems-word-problems
  G('alg1.systems-word-problems', function (R, ctx) {
    var t = R.pick(by(ctx, ['numbers', 'tickets', 'tickets'], ['tickets', 'coins', 'mixture', 'numbers'], ['mixture', 'coins', 'tickets', 'boat']));
    var A, B, pa, pb, n, total, labels, eqs, define, ans, unitA, unitB, stepsExtra = [];
    if (t === 'numbers') {
      A = R.int(8, 40); B = R.int(2, A - 1);
      var S = A + B, D = A - B;
      return out({ q: 'The sum of two numbers is $' + S + '$ and their difference is $' + D + '$. Find the two numbers.', a: { t: 'multi', parts: [{ label: 'The larger number:', a: num(A) }, { label: 'The smaller number:', a: num(B) }] }, steps: ['Let $x$ be the larger number and $y$ the smaller. Then $x + y = ' + S + '$ and $x - y = ' + D + '$.', 'Add the equations: the $y$ terms cancel, leaving $2x = ' + (S + D) + '$, so $x = ' + A + '$.', 'Then $y = ' + S + ' - ' + A + ' = ' + B + '$.', 'Check: $' + A + ' + ' + B + ' = ' + S + '$ and $' + A + ' - ' + B + ' = ' + D + '$.'], hint: 'Write one equation for the sum and one for the difference, then add them.' }, { k: 'multi', parts: [{ k: 'num', v: A }, { k: 'num', v: B }] });
    }
    if (t === 'tickets') {
      pa = R.pick([8, 10, 12, 15]); pb = R.pick([4, 5, 6, 7]); A = R.int(20, 120); B = R.int(20, 150); n = A + B; total = pa * A + pb * B;
      define = 'Let $a$ be the number of adult tickets and $s$ the number of student tickets.';
      eqs = ['a + s = ' + n, pa + 'a + ' + pb + 's = ' + total];
      var step2 = 'Multiply the first equation by $' + pb + '$: $' + pb + 'a + ' + pb + 's = ' + pb * n + '$. Subtract it from the second: $' + T.mono(pa - pb, 'a') + ' = ' + (total - pb * n) + '$, so $a = ' + A + '$.';
      return out({ q: 'A school play sold $' + n + '$ tickets and collected $' + money(total) + '$. Adult tickets cost $' + money(pa) + '$ and student tickets cost $' + money(pb) + '$. How many of each were sold?', a: { t: 'multi', parts: [{ label: 'Adult tickets:', a: num(A) }, { label: 'Student tickets:', a: num(B) }] }, steps: [define, 'Count equation: $' + eqs[0] + '$. Money equation: $' + eqs[1] + '$.', step2, 'Then $s = ' + n + ' - ' + A + ' = ' + B + '$.', 'Check: $' + pa + ' \\cdot ' + A + ' + ' + pb + ' \\cdot ' + B + ' = ' + total + '$.'], hint: 'One equation counts the tickets; the other counts the money.' }, { k: 'multi', parts: [{ k: 'num', v: A }, { k: 'num', v: B }] });
    }
    if (t === 'coins') {
      A = R.int(5, 30); B = R.int(5, 30); n = A + B; total = 25 * A + 10 * B;
      return out({ q: 'A jar holds $' + n + '$ coins, all quarters and dimes, worth $' + money(total / 100) + '$ in all. How many of each coin are there?', a: { t: 'multi', parts: [{ label: 'Quarters:', a: num(A) }, { label: 'Dimes:', a: num(B) }] }, steps: ['Let $q$ be the number of quarters and $d$ the number of dimes. Work in cents.', 'Count: $q + d = ' + n + '$. Value: $25q + 10d = ' + total + '$.', 'Multiply the count equation by $10$: $10q + 10d = ' + 10 * n + '$. Subtract it from the value equation: $15q = ' + (total - 10 * n) + '$, so $q = ' + A + '$.', 'Then $d = ' + n + ' - ' + A + ' = ' + B + '$.', 'Check: $25 \\cdot ' + A + ' + 10 \\cdot ' + B + ' = ' + total + '$ cents $= ' + money(total / 100) + '$.'], hint: 'Write a count equation and a value equation (in cents).' }, { k: 'multi', parts: [{ k: 'num', v: A }, { k: 'num', v: B }] });
    }
    if (t === 'mixture') {
      pa = R.pick([6, 8, 9, 10]); pb = R.pick([3, 4, 5]); A = R.int(2, 12); B = R.int(2, 12); n = A + B; total = pa * A + pb * B;
      return out({ q: 'A store mixes cashews at $' + money(pa) + '$ per pound with peanuts at $' + money(pb) + '$ per pound to make $' + n + '$ pounds of a mix worth $' + money(total) + '$ in all. How many pounds of each nut are used?', a: { t: 'multi', parts: [{ label: 'Pounds of cashews:', a: num(A) }, { label: 'Pounds of peanuts:', a: num(B) }] }, steps: ['Let $c$ be pounds of cashews and $p$ pounds of peanuts.', 'Weight: $c + p = ' + n + '$. Value: $' + pa + 'c + ' + pb + 'p = ' + total + '$.', 'Multiply the weight equation by $' + pb + '$ and subtract it from the value equation: $' + T.mono(pa - pb, 'c') + ' = ' + (total - pb * n) + '$, so $c = ' + A + '$.', 'Then $p = ' + n + ' - ' + A + ' = ' + B + '$.', 'Check: $' + pa + ' \\cdot ' + A + ' + ' + pb + ' \\cdot ' + B + ' = ' + total + '$.'], hint: 'One equation for the total weight, one for the total value.' }, { k: 'multi', parts: [{ k: 'num', v: A }, { k: 'num', v: B }] });
    }
    // boat with and against a current
    var rb = R.int(8, 20), rc = R.int(1, 5), tt = R.pick([2, 3, 4]), dd = (rb + rc) * tt, tu = R.pick([3, 4, 5, 6]), du = (rb - rc) * tu;
    if (du <= 0) { rc = 2; du = (rb - rc) * tu; }
    return out({ q: 'A boat travels $' + dd + '$ miles downstream in $' + tt + '$ hours and $' + du + '$ miles upstream in $' + tu + '$ hours. Find the speed of the boat in still water and the speed of the current.', a: { t: 'multi', parts: [{ label: 'Boat speed (mph):', a: num(rb) }, { label: 'Current speed (mph):', a: num(rc) }] }, steps: ['Let $b$ be the boat speed and $c$ the current speed. Downstream the current helps: $b + c$. Upstream it slows the boat: $b - c$.', 'Downstream: $' + tt + '(b + c) = ' + dd + '$, so $b + c = ' + (rb + rc) + '$. Upstream: $' + tu + '(b - c) = ' + du + '$, so $b - c = ' + (rb - rc) + '$.', 'Add: $2b = ' + 2 * rb + '$, so $b = ' + rb + '$. Then $c = ' + (rb + rc) + ' - ' + rb + ' = ' + rc + '$.'], hint: 'Downstream speed is $b + c$; upstream speed is $b - c$.' }, { k: 'multi', parts: [{ k: 'num', v: rb }, { k: 'num', v: rc }] });
  });

  // ---- alg1.systems-inequalities
  G('alg1.systems-inequalities', function (R, ctx) {
    var r = retry(function () {
      var m1 = R.nz(-3, 3), b1 = R.int(-4, 4), m2 = R.intNot(-3, 3, [m1]), b2 = R.int(-4, 4);
      var s1 = R.pick(['>', '>=', '<', '<=']), s2 = R.pick(['>', '>=', '<', '<=']);
      function ok(x, y) { var v1 = y - (m1 * x + b1), v2 = y - (m2 * x + b2); var t1 = { '<': v1 < 0, '<=': v1 <= 0, '>': v1 > 0, '>=': v1 >= 0 }[s1], t2 = { '<': v2 < 0, '<=': v2 <= 0, '>': v2 > 0, '>=': v2 >= 0 }[s2]; return [t1, t2]; }
      var good = [], half = [], none = [];
      for (var x = -5; x <= 5; x++) for (var y = -6; y <= 6; y++) { if (y === m1 * x + b1 || y === m2 * x + b2) continue; var o = ok(x, y); if (o[0] && o[1]) good.push([x, y, o]); else if (o[0] || o[1]) half.push([x, y, o]); else none.push([x, y, o]); }
      if (!good.length || half.length < 2 || !none.length) return null;
      return { m1: m1, b1: b1, m2: m2, b2: b2, s1: s1, s2: s2, good: R.pick(good), half: R.sample(half, 2), none: R.pick(none), ok: ok };
    }, 200);
    var e1 = 'y ' + TREL[r.s1] + ' ' + T.lin(r.m1, 'x', r.b1), e2 = 'y ' + TREL[r.s2] + ' ' + T.lin(r.m2, 'x', r.b2);
    var pt = function (p) { return '$(' + p[0] + ', ' + p[1] + ')$'; };
    var check = function (p) { return pt(p) + ': first ' + (p[2][0] ? 'true' : 'false') + ', second ' + (p[2][1] ? 'true' : 'false') + '.'; };
    var showViz = ctx.level === 1 || R.coin();
    var p = { q: 'Which point is a solution of the system? $$\\begin{aligned} ' + e1 + ' \\\\ ' + e2 + ' \\end{aligned}$$', a: mc(pt(r.good), r.half.concat([r.none]).map(pt)), steps: ['A solution of the system must make <b>both</b> inequalities true: it lies where the two shaded regions overlap.', check(r.good)].concat(r.half.map(check), [check(r.none)], ['Only ' + pt(r.good) + ' satisfies both.']), hint: 'Test each point in both inequalities. It must pass both.' };
    if (showViz) p.viz = { name: 'linesystem', opts: { lines: [plin(r.m1, r.b1), plin(r.m2, r.b2)], shade: [r.s1[0] === '>' ? 'above' : 'below', r.s2[0] === '>' ? 'above' : 'below'], strict: [r.s1.length === 1, r.s2.length === 1], probe: null, xmin: -7, xmax: 7, ymin: -7, ymax: 7 } };
    return p;
  });


  // ================================================================ Unit 7: Exponents and Radicals
  function fexp(e) { return tn(e); } // exponent as TeX (fractions as \frac)
  function powTex(base, e) { e = q(e); return base + '^{' + (e.isInt() ? e.toString() : (e.sign() < 0 ? '-' : '') + e.abs().n + '/' + e.d) + '}'; }

  // ---- alg1.rational-exponents
  var RATPOW = [[4, 2], [9, 2], [16, 2], [25, 2], [36, 2], [49, 2], [64, 2], [81, 2], [100, 2], [8, 3], [27, 3], [64, 3], [125, 3], [16, 4], [81, 4], [32, 5]]; // [value, root index] where value is a perfect power
  G('alg1.rational-exponents', function (R, ctx) {
    var shape = R.pick(by(ctx, ['unit', 'unit', 'meaning'], ['frac', 'frac', 'meaning', 'unit'], ['frac', 'neg', 'fracbase', 'meaning']));
    if (shape === 'meaning') {
      var m = R.pick([2, 3, 4, 5]), n = R.pick([2, 3, 4, 5, 7]); if (m === n) n = m + 1; if (gcd(m, n) !== 1) { m = 2; n = 3; }
      var right = '$' + (n === 2 ? '\\sqrt{x^{' + m + '}}' : '\\sqrt[' + n + ']{x^{' + m + '}}') + '$';
      return { q: 'Which expression is equal to $x^{' + m + '/' + n + '}$ (for $x > 0$)?', a: mc(right, ['$' + (m === 2 ? '\\sqrt{x^{' + n + '}}' : '\\sqrt[' + m + ']{x^{' + n + '}}') + '$', '$\\frac{x^{' + m + '}}{' + n + '}$', '$\\left(\\frac{x}{' + n + '}\\right)^{' + m + '}$']), steps: ['The denominator of the exponent is the root, and the numerator is the power: $x^{m/n} = \\sqrt[n]{x^m} = \\left(\\sqrt[n]{x}\\right)^m$.', 'So $x^{' + m + '/' + n + '} = ' + right.slice(1, -1) + '$.'], hint: 'In $x^{m/n}$, which number is the root?' };
    }
    var pick = R.pick(RATPOW), v = pick[0], k = pick[1], root = Math.round(Math.pow(v, 1 / k)), mexp = 1, neg = false, base = q(v);
    if (shape === 'frac' || shape === 'neg' || shape === 'fracbase') mexp = R.pick([2, 3]);
    if (gcd(mexp, k) !== 1) mexp = 1;
    if (shape === 'neg') neg = true;
    if (shape === 'fracbase') base = fr(1, v);
    var e = fr(neg ? -mexp : mexp, k), rootQ = shape === 'fracbase' ? fr(1, root) : q(root);
    var val = rootQ.pow(mexp); if (neg) val = q(1).div(val);
    var bt = shape === 'fracbase' ? '\\left(\\frac{1}{' + v + '}\\right)' : String(v);
    var steps = ['The denominator of the exponent, $' + k + '$, means a ' + (k === 2 ? 'square' : k === 3 ? 'cube' : U.ordinal(k)) + ' root: $' + (k === 2 ? '\\sqrt{' + (shape === 'fracbase' ? '\\frac{1}{' + v + '}' : v) + '}' : '\\sqrt[' + k + ']{' + (shape === 'fracbase' ? '\\frac{1}{' + v + '}' : v) + '}') + ' = ' + tn(rootQ) + '$, because $' + tp(rootQ) + '^{' + k + '} = ' + tn(base) + '$.'];
    if (mexp > 1) steps.push('The numerator, $' + mexp + '$, is a power: $' + T.pow(rootQ, mexp) + ' = ' + tn(rootQ.pow(mexp)) + '$.');
    if (neg) steps.push('The negative sign means a reciprocal: $' + bt + '^{-' + mexp + '/' + k + '} = \\frac{1}{' + tn(rootQ.pow(mexp)) + '} = ' + tn(val) + '$.');
    return out({ q: 'Evaluate $' + bt + '^{' + (neg ? '-' : '') + (mexp === 1 && !neg ? '1/' + k : mexp + '/' + k) + '}$.', a: num(val, { form: 'simplest' }), steps: steps.concat(['So the value is $' + tn(val) + '$.']), hint: 'Take the root first (the denominator), then the power (the numerator).' }, { k: 'num', v: Math.pow(base.toNumber(), e.toNumber()) });
  });

  // ---- alg1.rational-exponent-rules
  G('alg1.rational-exponent-rules', function (R, ctx) {
    var shape = R.pick(by(ctx, ['prod', 'prod', 'quot'], ['prod', 'pow', 'quot', 'roots'], ['pow', 'coef', 'roots', 'quot']));
    var dens = by(ctx, [2, 3, 4, 5], [2, 3, 4, 6], [2, 3, 4, 5, 6]), d1 = R.pick(dens), d2 = ctx.level === 1 ? d1 : R.pick(dens);
    var a = fr(R.int(1, 5), d1), b = fr(R.int(1, 5), d2), n, txt, steps;
    if (a.isInt() && b.isInt()) a = fr(1, d1 === 1 ? 2 : d1);
    if (shape === 'coef') {
      var pk = R.pick([[8, 3, 2], [27, 3, 3], [16, 4, 2], [64, 3, 4], [16, 2, 4], [81, 4, 3], [32, 5, 2], [25, 2, 5]]); // value, root, root value
      var mm = R.pick([1, 1, 2]), xe = pk[1] * R.int(1, 3), c = Math.pow(pk[2], mm), en = fr(xe * mm, pk[1]);
      var et = mm === 1 ? '1/' + pk[1] : mm + '/' + pk[1];
      return out({ q: 'Write $\\left(' + pk[0] + 'x^{' + xe + '}\\right)^{' + et + '}$ in the form $a x^n$ (with $x > 0$). Find $a$ and $n$.', a: { t: 'multi', parts: [{ label: '$a =$', a: num(c) }, { label: '$n =$', a: num(en) }] }, steps: ['A power of a product is the product of the powers: $' + pk[0] + '^{' + et + '} \\cdot \\left(x^{' + xe + '}\\right)^{' + et + '}$.', '$' + pk[0] + '^{' + et + '} = ' + (mm === 1 ? '' : '\\left(') + (pk[1] === 2 ? '\\sqrt{' + pk[0] + '}' : '\\sqrt[' + pk[1] + ']{' + pk[0] + '}') + (mm === 1 ? '' : '\\right)^{' + mm + '}') + ' = ' + c + '$.', 'Power of a power: multiply the exponents: $' + xe + ' \\cdot ' + tn(fr(mm, pk[1])) + ' = ' + tn(en) + '$.', 'So $a = ' + c + '$ and $n = ' + tn(en) + '$: the result is $' + c + 'x^{' + (en.isInt() ? en : en.n + '/' + en.d) + '}$.'], hint: 'Apply the outside exponent to the number and to the power of $x$ separately.' }, { k: 'multi', parts: [{ k: 'num', v: c }, { k: 'num', v: en.toNumber() }] });
    }
    if (shape === 'prod') { n = a.add(b); txt = powTex('x', a) + ' \\cdot ' + powTex('x', b); steps = ['Multiplying powers of the same base adds the exponents, because you are counting factors of $x$: $' + tn(a) + ' + ' + tn(b) + '$.', 'Common denominator: $' + tn(a) + ' + ' + tn(b) + ' = ' + tn(n) + '$.']; }
    else if (shape === 'quot') { if (a.eq(b)) a = a.add(1); n = a.sub(b); txt = '\\dfrac{' + powTex('x', a) + '}{' + powTex('x', b) + '}'; steps = ['Dividing powers of the same base subtracts the exponents: $' + tn(a) + ' - ' + tp(b) + '$.', 'With a common denominator: $' + tn(n) + '$.']; }
    else if (shape === 'pow') { var pw = R.pick([2, 3, 4, 6, fr(1, 2), fr(3, 2), fr(2, 3)]); n = a.mul(pw); txt = '\\left(' + powTex('x', a) + '\\right)^{' + (q(pw).isInt() ? pw : q(pw).n + '/' + q(pw).d) + '}'; steps = ['A power of a power multiplies the exponents (it is repeated multiplication of the same power): $' + tn(a) + ' \\cdot ' + tn(pw) + '$.', '$' + tn(a) + ' \\cdot ' + tn(pw) + ' = ' + tn(n) + '$.']; }
    else { var r1 = R.pick([2, 3, 4]), r2 = R.intNot(2, 5, [r1]), p1 = R.pick([1, 1, 2]); if (gcd(p1, r1) !== 1) p1 = 1; a = fr(p1, r1); b = fr(1, r2); n = a.add(b); txt = (r1 === 2 ? '\\sqrt{x' + (p1 > 1 ? '^{' + p1 + '}' : '') + '}' : '\\sqrt[' + r1 + ']{x' + (p1 > 1 ? '^{' + p1 + '}' : '') + '}') + ' \\cdot ' + (r2 === 2 ? '\\sqrt{x}' : '\\sqrt[' + r2 + ']{x}'); steps = ['Write each root as a power: $' + powTex('x', a) + ' \\cdot ' + powTex('x', b) + '$.', 'Add the exponents: $' + tn(a) + ' + ' + tn(b) + ' = ' + tn(n) + '$.']; }
    return out({ q: 'Write $' + txt + '$ as a single power $x^n$ (with $x > 0$). What is $n$?', a: num(n, { form: 'simplest' }), steps: steps.concat(['So the expression equals $' + powTex('x', n) + '$, and $n = ' + tn(n) + '$.']), hint: shape === 'pow' ? 'Power of a power: multiply the exponents.' : shape === 'quot' ? 'Same base, dividing: subtract the exponents.' : 'Same base, multiplying: add the exponents.' }, { k: 'num', v: n.toNumber() });
  });

  // ---- alg1.simplify-square-roots
  G('alg1.simplify-square-roots', function (R, ctx) {
    var shape = R.pick(by(ctx, ['basic', 'basic', 'basic'], ['basic', 'coef', 'error'], ['coef', 'big', 'error']));
    if (shape === 'error') {
      var p = R.pick([[9, 16], [36, 64], [25, 144], [16, 9], [64, 36], [144, 25]]), s = p[0] + p[1], rs = Math.sqrt(s), wrong = Math.sqrt(p[0]) + Math.sqrt(p[1]);
      return { q: 'What is $\\sqrt{' + p[0] + ' + ' + p[1] + '}$?', a: mc('$' + T.sqrt(s) + '$', ['$' + wrong + '$', '$' + T.sqrt(p[0] * p[1]) + '$', '$' + (p[0] + p[1]) / 2 + '$']), steps: ['Add first, because the root covers the whole sum: $' + p[0] + ' + ' + p[1] + ' = ' + s + '$.', '$\\sqrt{' + s + '} = ' + T.sqrt(s) + '$.', 'A square root does not split over a sum: $\\sqrt{' + p[0] + '} + \\sqrt{' + p[1] + '} = ' + wrong + '$ is a different number.'], hint: 'Do what is under the root first.' };
    }
    var sq = by(ctx, [2, 3, 4, 5], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 8, 9, 10]), b = R.pick([2, 3, 5, 6, 7, 10, 11]), a = R.pick(sq), n = a * a * b, k = shape === 'coef' ? R.pick([2, 3, 4, 5]) : 1;
    if (shape === 'big') { a = R.pick([6, 8, 9, 10, 12]); n = a * a * b; }
    var steps = ['Find the largest perfect square that divides $' + n + '$: $' + n + ' = ' + a * a + ' \\cdot ' + b + '$.', 'Split the root over the product: $\\sqrt{' + n + '} = \\sqrt{' + a * a + '} \\cdot \\sqrt{' + b + '} = ' + a + '\\sqrt{' + b + '}$.'];
    if (k > 1) steps.push('Multiply by the $' + k + '$ in front: $' + k + ' \\cdot ' + a + '\\sqrt{' + b + '} = ' + k * a + '\\sqrt{' + b + '}$.');
    steps.push('$' + b + '$ has no perfect-square factor except $1$, so this is fully simplified.');
    return out({ q: 'Simplify $' + (k > 1 ? k : '') + '\\sqrt{' + n + '}$.', a: num(k * a + '*sqrt(' + b + ')', { form: 'simplest' }), steps: steps, hint: 'Look for a perfect square factor: 4, 9, 16, 25, 36, 49, 64, 81, 100, …' }, { k: 'num', v: k * Math.sqrt(n) });
  });

  // ---- alg1.radical-operations
  G('alg1.radical-operations', function (R, ctx) {
    var shape = R.pick(by(ctx, ['addlike', 'mult', 'addlike'], ['addsimp', 'mult', 'coefmult', 'dist'], ['addsimp', 'conj', 'square', 'dist']));
    var b = R.pick([2, 3, 5, 6, 7]), plain, steps, qt, val, sb = Math.sqrt(b);
    if (shape === 'addlike') {
      var c1 = R.nz(-6, 9), c2 = R.nz(-6, 9); if (c1 + c2 === 0) c2 += 1;
      val = c1 * sb + c2 * sb; qt = T.coef(c1, '\\sqrt{' + b + '}') + T.coef(c2, '\\sqrt{' + b + '}', false); plain = (c1 + c2) + '*sqrt(' + b + ')';
      steps = ['Both terms are multiples of $\\sqrt{' + b + '}$: they are like terms, just as $' + T.lin(c1, 'u', 0) + T.coef(c2, 'u', false) + ' = ' + T.mono(c1 + c2, 'u') + '$.', 'Add the coefficients: $' + T.mono(c1 + c2, '\\sqrt{' + b + '}') + '$.'];
    } else if (shape === 'addsimp') {
      var k1 = R.pick([2, 3, 4, 5]), c3 = R.nz(-4, 5), c4 = R.nz(-3, 4), tot = c3 + c4 * k1; if (tot === 0) { c3 += 1; tot = c3 + c4 * k1; }
      val = c3 * sb + c4 * Math.sqrt(k1 * k1 * b); qt = T.coef(c3, '\\sqrt{' + b + '}') + T.coef(c4, '\\sqrt{' + k1 * k1 * b + '}', false); plain = tot + '*sqrt(' + b + ')';
      steps = ['They do not look alike yet. Simplify $\\sqrt{' + k1 * k1 * b + '} = \\sqrt{' + k1 * k1 + '}\\sqrt{' + b + '} = ' + k1 + '\\sqrt{' + b + '}$.', 'So the sum is $' + T.coef(c3, '\\sqrt{' + b + '}') + T.coef(c4 * k1, '\\sqrt{' + b + '}', false) + '$: like terms.', 'Combine: $' + T.mono(tot, '\\sqrt{' + b + '}') + '$.'];
    } else if (shape === 'mult' || shape === 'coefmult') {
      var pr = R.pick([[2, 6], [3, 6], [2, 10], [5, 10], [3, 15], [6, 15], [2, 14], [7, 14], [3, 12], [2, 18], [6, 10], [10, 15], [6, 21]]), x1 = pr[0], x2 = pr[1], P = x1 * x2, sr = U.simplifyRadical(P);
      var k1b = shape === 'coefmult' ? R.pick([2, 3, 4]) : 1, k2 = shape === 'coefmult' ? R.pick([2, 3, 5]) : 1, out1 = k1b * k2 * sr[0];
      val = k1b * Math.sqrt(x1) * k2 * Math.sqrt(x2); qt = (k1b > 1 ? k1b : '') + '\\sqrt{' + x1 + '} \\cdot ' + (k2 > 1 ? k2 : '') + '\\sqrt{' + x2 + '}'; plain = sr[1] === 1 ? String(out1) : out1 + '*sqrt(' + sr[1] + ')';
      steps = [(k1b > 1 ? 'Multiply the numbers outside: $' + k1b + ' \\cdot ' + k2 + ' = ' + k1b * k2 + '$. ' : '') + 'Multiply under one root: $\\sqrt{' + x1 + '} \\cdot \\sqrt{' + x2 + '} = \\sqrt{' + P + '}$.', 'Simplify: $\\sqrt{' + P + '} = ' + T.sqrt(P) + '$.', 'Result: $' + T.sqrt(P, k1b * k2) + '$.'];
    } else if (shape === 'dist') {
      var k3 = R.pick([2, 3, 5]), a1 = R.nz(-4, 5), m = R.pick([2, 3, 4]), inside = k3 * m * m; // sqrt(k3)(a1 + sqrt(k3 * m^2)) = a1 sqrt(k3) + k3 m
      val = Math.sqrt(k3) * (a1 + Math.sqrt(inside)); qt = '\\sqrt{' + k3 + '}\\left(' + a1 + ' + \\sqrt{' + inside + '}\\right)'; plain = a1 + '*sqrt(' + k3 + ')+' + (k3 * m);
      steps = ['Distribute: $' + T.mono(a1, '\\sqrt{' + k3 + '}') + ' + \\sqrt{' + k3 + '} \\cdot \\sqrt{' + inside + '}$.', '$\\sqrt{' + k3 + '} \\cdot \\sqrt{' + inside + '} = \\sqrt{' + k3 * inside + '} = ' + k3 * m + '$, a whole number, because $' + k3 * inside + ' = ' + (k3 * m) + '^2$.', 'Result: $' + T.mono(a1, '\\sqrt{' + k3 + '}') + ' + ' + k3 * m + '$. These are not like terms, so this is the final form.'];
    } else if (shape === 'conj') {
      var a2 = R.int(2, 7), sgn = R.coin();
      val = (a2 + sb) * (a2 - sb); qt = '\\left(' + a2 + ' + \\sqrt{' + b + '}\\right)\\left(' + a2 + ' - \\sqrt{' + b + '}\\right)'; plain = String(a2 * a2 - b);
      steps = ['This is $(p + q)(p - q) = p^2 - q^2$ with $p = ' + a2 + '$ and $q = \\sqrt{' + b + '}$.', 'The middle terms cancel: $' + a2 + '^2 - \\left(\\sqrt{' + b + '}\\right)^2 = ' + a2 * a2 + ' - ' + b + ' = ' + (a2 * a2 - b) + '$.', 'The answer is a whole number: the radicals are gone.'];
    } else {
      var a3 = R.int(1, 5);
      val = (a3 + sb) * (a3 + sb); qt = '\\left(' + a3 + ' + \\sqrt{' + b + '}\\right)^2'; plain = (a3 * a3 + b) + '+' + (2 * a3) + '*sqrt(' + b + ')';
      steps = ['Square a sum with $(p + q)^2 = p^2 + 2pq + q^2$, not just $p^2 + q^2$.', '$p^2 = ' + a3 * a3 + '$, $2pq = 2 \\cdot ' + a3 + ' \\cdot \\sqrt{' + b + '} = ' + 2 * a3 + '\\sqrt{' + b + '}$, $q^2 = ' + b + '$.', 'Add: $' + (a3 * a3 + b) + ' + ' + 2 * a3 + '\\sqrt{' + b + '}$.'];
    }
    return out({ q: 'Simplify: $' + qt + '$', a: num(plain, { form: 'simplest' }), steps: steps, hint: shape === 'addlike' || shape === 'addsimp' ? 'Only like radicals (the same number under the root) can be added. Simplify each root first.' : 'Multiply under one root, $\\sqrt{a}\\sqrt{b} = \\sqrt{ab}$, then simplify.' }, { k: 'num', v: val });
  });


  // ================================================================ Unit 8: Exponential Functions
  function tabTex(xs, ys, xn, yn) { return '$$\\begin{array}{c|' + xs.map(function () { return 'c'; }).join('') + '} ' + (xn || 'x') + ' & ' + xs.map(tn).join(' & ') + ' \\\\ \\hline ' + (yn || 'y') + ' & ' + ys.map(tn).join(' & ') + ' \\end{array}$$'; }
  function expTex(a, b, v) { v = v || 'x'; return (q(a).eq(1) ? '' : tn(a) + ' \\cdot ') + T.pow(b, v); }
  function mlist(arr) { return arr.map(function (v) { return '$' + tn(v) + '$'; }).join(', '); }
  function expPlain(a, b, v) { return pq(a) + '*(' + pq(b) + ')^' + (v || 'x'); }

  // ---- alg1.exponential-functions
  G('alg1.exponential-functions', function (R, ctx) {
    var shape = R.pick(by(ctx, ['eval', 'eval', 'parts'], ['eval', 'neg', 'trap', 'parts'], ['neg', 'table', 'trap', 'eval']));
    var a = R.pick([1, 2, 3, 4, 5, 10]), b = R.pick(by(ctx, [2, 3], [2, 3, 4, fr(1, 2)], [2, 3, 5, fr(1, 2), fr(1, 3), fr(3, 2)]));
    b = q(b);
    if (shape === 'parts') {
      var grow = b.gt(1);
      return out({ q: 'For $f(x) = ' + expTex(a, b) + '$, what is the starting value $f(0)$, and does $f$ show growth or decay?', a: { t: 'multi', parts: [{ label: '$f(0) =$', a: num(a) }, { label: 'It shows', a: { t: 'mc', choices: ['growth', 'decay'], v: grow ? 0 : 1, keep: true } }] }, steps: ['$f(0) = ' + (a === 1 ? '' : a + ' \\cdot ') + T.pow(b, 0).replace(/\^\{0\}$/, '^0') + ' = ' + (a === 1 ? '1' : a + ' \\cdot 1 = ' + a) + '$, since any nonzero number to the power $0$ is $1$.', 'Each time $x$ increases by $1$, the output is multiplied by $' + tn(b) + '$. ' + (grow ? 'That factor is greater than $1$, so the outputs grow.' : 'That factor is between $0$ and $1$, so the outputs shrink: decay.')], hint: 'Put $x = 0$. Then look at the base: bigger than $1$ or smaller?' }, { k: 'multi', parts: [{ k: 'num', v: a }, null] });
    }
    if (shape === 'trap') {
      var c = R.pick([2, 3, 4]), base = R.pick([2, 3]), xx = R.pick([2, 3]), right = c * Math.pow(base, xx), wrong = Math.pow(c * base, xx);
      return out({ q: 'Let $f(x) = ' + c + ' \\cdot ' + base + '^x$. Find $f(' + xx + ')$.', a: num(right), steps: ['The exponent belongs to the base $' + base + '$ only. Order of operations: power first, then multiply.', '$' + base + '^{' + xx + '} = ' + Math.pow(base, xx) + '$, so $f(' + xx + ') = ' + c + ' \\cdot ' + Math.pow(base, xx) + ' = ' + right + '$.', 'Multiplying first, $' + (c * base) + '^{' + xx + '} = ' + wrong + '$, would be a different function.'], hint: 'Do the power before the multiplication.' }, { k: 'num', v: right });
    }
    if (shape === 'table') {
      var xs = [0, 1, 2, 3], ys = xs.map(function (x) { return q(a).mul(b.pow(x)); });
      return out({ q: 'The table shows an exponential function $f(x) = a \\cdot b^x$. Write its rule.' + tabTex(xs, ys, 'x', 'f(x)'), a: { t: 'expr', v: expPlain(a, b) }, steps: ['$f(0) = a$, so the starting value is $a = ' + a + '$.', 'Each step multiplies by the same factor: $\\frac{' + tn(ys[1]) + '}{' + tn(ys[0]) + '} = ' + tn(b) + '$, so $b = ' + tn(b) + '$.', '$f(x) = ' + expTex(a, b) + '$.'], hint: 'The value at $x = 0$ is $a$. Divide neighboring outputs to find $b$.' }, { k: 'fn', expr: expPlain(a, b) });
    }
    var x = shape === 'neg' ? -R.int(1, 3) : R.int(by(ctx, 1, 0, 0), 4), val = q(a).mul(b.pow(x));
    return out({ q: 'Let $f(x) = ' + expTex(a, b) + '$. Find $f(' + x + ')$.', a: num(val), steps: ['Substitute: $f(' + x + ') = ' + (a === 1 ? '' : a + ' \\cdot ') + T.pow(b, x) + '$.', x < 0 ? 'A negative exponent means a reciprocal: $' + T.pow(b, x) + ' = \\frac{1}{' + T.pow(b, -x) + '} = ' + tn(b.pow(x)) + '$.' : 'Power first: $' + T.pow(b, x) + ' = ' + tn(b.pow(x)) + '$.', a === 1 ? 'So $f(' + x + ') = ' + tn(val) + '$.' : 'Then multiply: $' + a + ' \\cdot ' + tp(b.pow(x)) + ' = ' + tn(val) + '$.'], hint: 'Raise the base to the power first, then multiply by ' + a + '.' }, { k: 'num', v: a * Math.pow(b.toNumber(), x) });
  });

  // ---- alg1.linear-vs-exponential
  G('alg1.linear-vs-exponential', function (R, ctx) {
    var shape = R.pick(by(ctx, ['classify', 'classify', 'which'], ['classify', 'pass', 'which'], ['pass', 'classify', 'pass']));
    if (shape === 'classify') {
      var kind = R.pick(['lin', 'exp', 'exp', 'neither']), xs = [0, 1, 2, 3, 4], ys, st = R.int(2, 8);
      if (kind === 'lin') { var d = R.nz(-6, 9); if (d < 0) st = R.int(25, 40); ys = xs.map(function (x) { return st + d * x; }); }
      else if (kind === 'exp') { var r = q(R.pick([2, 3, fr(1, 2)])), s0 = r.lt(1) ? 16 * R.pick([1, 2, 3]) : st; ys = xs.map(function (x) { return r.pow(x).mul(s0); }); }
      else { ys = xs.map(function (x) { return x * x + st; }); }
      var ch = ['Linear', 'Exponential', 'Neither'], right = kind === 'lin' ? 0 : kind === 'exp' ? 1 : 2;
      var diffs = ys.slice(1).map(function (y, i) { return q(y).sub(ys[i]); }), rats = ys.slice(1).map(function (y, i) { return q(y).div(ys[i]); });
      return { q: 'Is the relationship in the table linear, exponential, or neither?' + tabTex(xs, ys), a: { t: 'mc', choices: ch, v: right, keep: true }, steps: ['Differences of neighboring $y$-values: ' + mlist(diffs) + '.', 'Ratios of neighboring $y$-values: ' + mlist(rats) + '.', kind === 'lin' ? 'The differences are all equal: equal steps in $x$ add the same amount. Linear.' : kind === 'exp' ? 'The ratios are all equal: equal steps in $x$ multiply by the same factor. Exponential.' : 'Neither the differences nor the ratios are constant, so it is neither.'], hint: 'Check the differences and the ratios of neighboring outputs.' };
    }
    if (shape === 'which') {
      var m = R.pick([20, 30, 50, 100]), c0 = R.pick([1, 2, 5]);
      return { q: 'Function $f$ starts at $' + c0 + '$ and doubles every year. Function $g$ starts at $' + 1000 + '$ and grows by $' + m + '$ every year. Which statement is true?', a: mc('$f$ will eventually be larger than $g$ and stay larger', ['$g$ will always be larger, because it starts much higher', '$f$ and $g$ will grow at the same rate after a while', '$g$ will eventually be larger again, because it adds more at first']), steps: ['$g$ is linear: it adds $' + m + '$ each year, the same amount forever.', '$f$ is exponential: each year it adds as much as it already has, so its yearly increase keeps growing.', 'Once $f$\'s yearly increase passes $' + m + '$, it gains on $g$ every year and soon passes it. An exponential growth function eventually exceeds any linear one.'], hint: 'Compare how much each one adds in a year, later on.' };
    }
    var a = R.pick([1, 2, 3]), b = 2, m2 = R.pick([10, 15, 20, 25]), c = R.pick([0, 5, 10, 20]);
    var x = 0; while (a * Math.pow(b, x) <= m2 * x + c) x++;
    var rows = [], k; for (k = Math.max(0, x - 3); k <= x; k++) rows.push('$x = ' + k + '$: $' + (a === 1 ? '' : a + ' \\cdot ') + '2^{' + k + '} = ' + a * Math.pow(2, k) + '$ and $' + m2 + ' \\cdot ' + k + T.signed(c) + ' = ' + (m2 * k + c) + '$.');
    return out({ q: 'Let $f(x) = ' + (a === 1 ? '' : a + ' \\cdot ') + '2^x$ and $g(x) = ' + T.lin(m2, 'x', c) + '$. What is the smallest whole number $x$ with $f(x) > g(x)$?', a: num(x), steps: ['$g$ starts ahead, but $f$ doubles each step. Make a table.'].concat(rows, ['The first $x$ where $f(x) > g(x)$ is $' + x + '$, and $f$ stays ahead after that.']), hint: 'Make a table of both functions for $x = 0, 1, 2, \\ldots$' }, { k: 'num', v: x });
  });

  // ---- alg1.geometric-sequences
  G('alg1.geometric-sequences', function (R, ctx) {
    var shape = R.pick(by(ctx, ['next', 'nth', 'ratio'], ['nth', 'formula', 'ratio'], ['formula', 'nth', 'twoterms']));
    var a1 = R.pick([1, 2, 3, 4, 5, -2, -3]), r = q(R.pick(by(ctx, [2, 3], [2, 3, -2, fr(1, 2)], [2, 3, -2, -3, fr(1, 2), fr(1, 3)])));
    if (r.lt(1) && r.gt(0)) a1 = R.pick([64, 81, 128, 243].filter(function (v) { return q(v).mul(r.pow(4)).isInt(); }));
    var terms = [0, 1, 2, 3].map(function (i) { return r.pow(i).mul(a1); });
    if (shape === 'next') return out({ q: 'What is the next term of the geometric sequence $' + terms.slice(0, 3).map(tn).join(', ') + ', \\ldots$?', a: num(terms[3]), steps: ['Each term is the one before times the common ratio $r = \\frac{' + tn(terms[1]) + '}{' + tn(terms[0]) + '} = ' + tn(r) + '$.', 'Next: $' + tn(terms[2]) + ' \\cdot ' + tp(r) + ' = ' + tn(terms[3]) + '$.'], hint: 'Divide a term by the one before it to find the ratio.' }, { k: 'num', v: terms[3].toNumber() });
    if (shape === 'ratio') return out({ q: 'What is the common ratio of the geometric sequence $' + terms.map(tn).join(', ') + ', \\ldots$?', a: num(r), steps: ['Divide any term by the one before it: $\\frac{' + tn(terms[1]) + '}{' + tn(terms[0]) + '} = ' + tn(r) + '$.', 'Check with another pair: $\\frac{' + tn(terms[2]) + '}{' + tn(terms[1]) + '} = ' + tn(r) + '$.'], hint: 'In a geometric sequence, each term is multiplied by the same number.' }, { k: 'num', v: r.toNumber() });
    var n = R.int(5, r.abs().gt(2) ? 6 : 8), an = r.pow(n - 1).mul(a1);
    if (shape === 'nth') return out({ q: 'Find the ' + U.ordinal(n) + ' term of the geometric sequence $' + terms.slice(0, 3).map(tn).join(', ') + ', \\ldots$', a: num(an), steps: ['First term $a_1 = ' + a1 + '$; ratio $r = ' + tn(r) + '$.', 'From term $1$ to term $' + n + '$ is $' + (n - 1) + '$ multiplications by $r$: $a_{' + n + '} = a_1 r^{' + (n - 1) + '}$.', '$a_{' + n + '} = ' + tp(a1) + ' \\cdot ' + T.pow(r, n - 1) + ' = ' + tp(a1) + ' \\cdot ' + tp(r.pow(n - 1)) + ' = ' + tn(an) + '$.'], hint: 'How many times do you multiply by $r$ to get from the 1st term to the ' + U.ordinal(n) + '?' }, { k: 'num', v: an.toNumber() });
    if (shape === 'formula') return out({ q: 'Write a formula for the $n$th term of the geometric sequence $' + terms.slice(0, 3).map(tn).join(', ') + ', \\ldots$', a: { t: 'expr', v: pq(a1) + '*(' + pq(r) + ')^(n-1)', vars: ['n'] }, steps: ['$a_1 = ' + a1 + '$ and $r = ' + tn(r) + '$.', '$a_n = a_1 \\cdot r^{n-1} = ' + tn(a1) + ' \\cdot ' + tp(r) + '^{n-1}$.', 'Check: $n = 1$ gives $' + tn(a1) + ' \\cdot ' + tp(r) + '^0 = ' + tn(a1) + '$.'], hint: 'Use $a_n = a_1 r^{n-1}$: the exponent is one less than the position.' }, { k: 'equiv', expr: pq(a1) + '*(' + pq(r) + ')^(n-1)', vars: ['n'] });
    // two terms: a_2 and a_4 with positive r
    var rr = R.pick([2, 3, 4]), b1 = R.pick([1, 2, 3, 5]), t2 = b1 * rr, t4 = b1 * rr * rr * rr;
    return out({ q: 'A geometric sequence with positive terms has $a_2 = ' + t2 + '$ and $a_4 = ' + t4 + '$. Find the common ratio $r$.', a: num(rr), steps: ['From term $2$ to term $4$ you multiply by $r$ twice: $a_4 = a_2 \\cdot r^2$.', '$r^2 = \\frac{' + t4 + '}{' + t2 + '} = ' + rr * rr + '$, so $r = ' + rr + '$ (positive, since the terms are positive).', 'Then $a_1 = \\frac{' + t2 + '}{' + rr + '} = ' + b1 + '$.'], hint: 'Two steps apart means two factors of $r$.' }, { k: 'num', v: rr });
  });

  // ---- alg1.exponential-growth-decay
  G('alg1.exponential-growth-decay', function (R, ctx) {
    var shape = R.pick(by(ctx, ['factor', 'factor', 'rate'], ['factor', 'value', 'rate', 'model'], ['value', 'model', 'rate', 'value']));
    var up = R.coin(), p = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]);
    var f = q(100 + (up ? p : -p)).div(100);
    if (shape === 'factor') return out({ q: 'A quantity ' + (up ? 'grows' : 'decreases') + ' by $' + p + '\\%$ each year. By what number is it multiplied each year?', a: num(f.toDec(2).replace(/0+$/, '').replace(/\.$/, '')), steps: ['After a year you have the whole amount, $100\\%$, ' + (up ? 'plus' : 'minus') + ' $' + p + '\\%$ of it: $100\\% ' + (up ? '+' : '-') + ' ' + p + '\\% = ' + (100 + (up ? p : -p)) + '\\%$.', 'As a decimal, $' + (100 + (up ? p : -p)) + '\\% = ' + tn(Number(f.toDec(2))) + '$. That is the ' + (up ? 'growth' : 'decay') + ' factor.'], hint: 'Start from 100% and ' + (up ? 'add' : 'subtract') + ' the percent change.' }, { k: 'num', v: f.toNumber() });
    if (shape === 'rate') {
      var b = q(R.pick([1.03, 1.07, 1.15, 0.85, 0.94, 0.7, 1.25, 0.98])), g = b.gt(1);
      var pct = b.sub(1).abs().mul(100);
      return out({ q: 'The function $A(t) = ' + R.pick([200, 500, 1000, 80]) + ' \\cdot (' + tn(Number(b.toDec(2))) + ')^t$ models a quantity after $t$ years. By what percent does it ' + (g ? 'grow' : 'decrease') + ' each year?', a: num(pct.toNumber(), { pct: true }), steps: ['Each year the amount is multiplied by $' + tn(Number(b.toDec(2))) + '$, which is $' + tn(b.mul(100).toNumber()) + '\\%$ of the previous amount.', g ? 'That is $' + tn(pct.toNumber()) + '\\%$ more than $100\\%$: a growth rate of $' + tn(pct.toNumber()) + '\\%$.' : 'That is $' + tn(pct.toNumber()) + '\\%$ less than $100\\%$: a decay rate of $' + tn(pct.toNumber()) + '\\%$.'], hint: 'Compare the factor with $1$ (which is $100\\%$).' }, { k: 'num', v: pct.toNumber() });
    }
    if (shape === 'model') {
      var a0 = R.pick([500, 800, 1200, 2000, 5000]);
      return out({ q: 'A town of $' + T.commas(a0) + '$ people ' + (up ? 'grows' : 'shrinks') + ' by $' + p + '\\%$ per year. Write a function $P(t)$ for the population after $t$ years.', a: { t: 'expr', v: a0 + '*' + nf(f.toNumber()) + '^t', vars: ['t'] }, steps: ['Start value: $' + T.commas(a0) + '$.', 'Each year the population is $' + (100 + (up ? p : -p)) + '\\%$ of the year before, so the factor is $' + tn(f.toNumber()) + '$.', '$P(t) = ' + a0 + ' \\cdot ' + tn(f.toNumber()) + '^t$.'], hint: 'Starting value times (factor) to the power $t$.' }, { k: 'equiv', expr: a0 + '*(' + (100 + (up ? p : -p)) + '/100)^t', vars: ['t'] });
    }
    // value after t years, exact
    var opts = [[1000, 1.1, 2], [1000, 1.1, 3], [5000, 0.8, 2], [2000, 0.9, 2], [800, 1.5, 2], [10000, 0.9, 3], [400, 1.25, 2], [625, 0.8, 3], [1000, 0.95, 2], [2500, 1.2, 2]];
    var o = R.pick(opts), val = q(o[0]).mul(q(o[1]).pow(o[2]));
    var pc = Math.round(Math.abs(o[1] - 1) * 100);
    return out({ q: 'A ' + (o[1] > 1 ? 'collection worth' : 'car worth') + ' $' + money(o[0]) + '$ ' + (o[1] > 1 ? 'gains' : 'loses') + ' $' + pc + '\\%$ of its value each year. What is it worth after $' + o[2] + '$ years?', a: num(val.toNumber()), unit: 'dollars', steps: ['Factor per year: $1 ' + (o[1] > 1 ? '+' : '-') + ' ' + tn(Math.abs(U.fix(o[1] - 1))) + ' = ' + tn(o[1]) + '$.', 'Value: $' + o[0] + ' \\cdot ' + tn(o[1]) + '^{' + o[2] + '}$.', '$' + tn(o[1]) + '^{' + o[2] + '} = ' + tn(q(o[1]).pow(o[2]).toNumber()) + '$, so the value is $' + o[0] + ' \\cdot ' + tn(q(o[1]).pow(o[2]).toNumber()) + ' = ' + tn(val.toNumber()) + '$ dollars.', 'Notice this is not $' + o[0] + ' ' + (o[1] > 1 ? '+' : '-') + ' ' + o[2] + ' \\cdot ' + U.fix(o[0] * Math.abs(o[1] - 1)) + '$: each year\'s change is a percent of the <em>new</em> amount.'], hint: 'Multiply by the yearly factor once for each year.' }, { k: 'num', v: o[0] * Math.pow(o[1], o[2]) });
  });

  // ---- alg1.exponential-models
  G('alg1.exponential-models', function (R, ctx) {
    var shape = R.pick(by(ctx, ['twopt1', 'story', 'twopt1'], ['twopt2', 'story', 'choose'], ['twopt2', 'choose', 'story', 'half']));
    if (shape === 'twopt1' || shape === 'twopt2') {
      var a = R.pick([2, 3, 4, 5, 10, 50, 100]), b = q(R.pick([2, 3, 4, fr(1, 2), fr(3, 2)])), t1 = shape === 'twopt1' ? 1 : 2;
      if (b.lt(1)) a = R.pick([64, 128, 256]);
      if (!b.isInt() && b.gt(1)) a = R.pick([4, 8, 16]);
      var y1 = q(a).mul(b.pow(t1));
      return out({ q: 'An exponential function $y = a \\cdot b^x$ passes through $(0, ' + a + ')$ and $(' + t1 + ', ' + tn(y1) + ')$. Write its equation.', a: { t: 'expr', v: expPlain(a, b), vars: ['x'] }, steps: ['At $x = 0$: $y = a \\cdot b^0 = a$, so $a = ' + a + '$.', 'At $x = ' + t1 + '$: $' + a + ' \\cdot b^{' + t1 + '} = ' + tn(y1) + '$, so $b^{' + t1 + '} = ' + tn(y1.div(a)) + '$' + (t1 === 2 ? ' and $b = ' + tn(b) + '$ (taking the positive root, since $b > 0$)' : '') + '.', 'So $y = ' + expTex(a, b) + '$.'], hint: 'The point with $x = 0$ gives $a$ directly. Use the other point to find $b$.' }, { k: 'fn', expr: expPlain(a, b) });
    }
    if (shape === 'half') {
      var A0 = R.pick([80, 120, 200, 400, 640]), h = R.pick([3, 5, 8, 10]);
      return out({ q: 'A medicine starts at $' + A0 + '$ mg in the body and its amount halves every $' + h + '$ hours. Write a function for the amount after $t$ hours.', a: { t: 'expr', v: A0 + '*(1/2)^(t/' + h + ')', vars: ['t'] }, steps: ['Every $' + h + '$ hours the amount is multiplied by $\\frac{1}{2}$.', 'After $t$ hours there have been $\\frac{t}{' + h + '}$ halvings.', 'So $A(t) = ' + A0 + '\\left(\\frac{1}{2}\\right)^{t/' + h + '}$.'], hint: 'Count how many halving periods fit into $t$ hours.' }, { k: 'equiv', expr: A0 + '*0.5^(t/' + h + ')', vars: ['t'] });
    }
    if (shape === 'choose') {
      var isExp = R.coin(), xs = [0, 1, 2, 3], s0 = R.pick([3, 4, 5, 6]), rr = R.pick([2, 3]), d = R.pick([3, 4, 6]);
      var ys = xs.map(function (x) { return isExp ? s0 * Math.pow(rr, x) : s0 + d * x; });
      var right = isExp ? '$y = ' + s0 + ' \\cdot ' + rr + '^x$' : '$y = ' + d + 'x + ' + s0 + '$';
      var wrongs = isExp ? ['$y = ' + (ys[1] - ys[0]) + 'x + ' + s0 + '$', '$y = ' + rr + ' \\cdot ' + s0 + '^x$', '$y = ' + s0 + 'x^' + rr + '$'] : ['$y = ' + s0 + ' \\cdot ' + d + '^x$', '$y = ' + d + ' \\cdot ' + s0 + '^x$', '$y = ' + s0 + 'x + ' + d + '$'];
      return { q: 'Which model fits the data?' + tabTex(xs, ys), a: mc(right, wrongs), steps: ['Differences: ' + mlist(ys.slice(1).map(function (y, i) { return y - ys[i]; })) + '. Ratios: ' + mlist(ys.slice(1).map(function (y, i) { return fr(y, ys[i]); })) + '.', isExp ? 'The ratios are constant ($' + rr + '$), so the data is exponential with starting value $' + s0 + '$: ' + right + '.' : 'The differences are constant ($' + d + '$), so the data is linear with starting value $' + s0 + '$: ' + right + '.'], hint: 'Constant differences mean linear; constant ratios mean exponential.' };
    }
    var S = R.pick([['A town has', 'people and grows by', 'per year', 't', 'years'], ['A savings account starts with \\$', 'and earns', 'interest per year, compounded yearly', 't', 'years'], ['A colony starts with', 'bacteria and grows by', 'per hour', 't', 'hours']]);
    var a2 = R.pick([1200, 2500, 4000, 800]), pc = R.pick([2, 3, 4, 5, 6, 8]), f = q(100 + pc).div(100);
    var lead = S[0].indexOf('\\$') >= 0 ? S[0].replace('\\$', '$\\$' + T.commas(a2) + '$') : S[0] + ' $' + T.commas(a2) + '$';
    return out({ q: lead + ' ' + S[1] + ' $' + pc + '\\%$ ' + S[2] + '. Write a model for the amount after $' + S[3] + '$ ' + S[4] + '.', a: { t: 'expr', v: a2 + '*' + nf(f.toNumber()) + '^t', vars: ['t'] }, steps: ['Starting amount: $' + a2 + '$. Growth of $' + pc + '\\%$ means each period ends with $' + (100 + pc) + '\\%$ of what it started with: factor $' + tn(f.toNumber()) + '$.', 'Model: $A(t) = ' + a2 + ' \\cdot ' + tn(f.toNumber()) + '^t$.'], hint: 'Starting value times (1 + rate) to the power $t$.' }, { k: 'equiv', expr: a2 + '*((100+' + pc + ')/100)^t', vars: ['t'] });
  });

  // ---- alg1.exponential-equivalent-forms
  G('alg1.exponential-equivalent-forms', function (R, ctx) {
    var shape = R.pick(by(ctx, ['half', 'base', 'half'], ['half', 'month', 'base', 'year'], ['month', 'year', 'quarter', 'base']));
    if (shape === 'half') {
      var hb = R.pick([1.1, 1.2, 1.3, 0.9, 0.8, 1.5, 0.7, 0.6, 1.4]), yb = U.fix(hb * hb), a = R.pick([50, 80, 100, 120, 250, 300, 400, 600, 1000]);
      return out({ q: 'A quantity is modeled by $A = ' + a + ' \\cdot (' + tn(yb) + ')^t$, with $t$ in years. Rewrite it as $A = ' + a + ' \\cdot b^{2t}$. What is $b$, the factor for each half year?', a: num(hb), steps: ['Exponent rule: $b^{2t} = \\left(b^2\\right)^t$. So we need $b^2 = ' + tn(yb) + '$.', '$b = \\sqrt{' + tn(yb) + '} = ' + tn(hb) + '$, because $' + tn(hb) + '^2 = ' + tn(yb) + '$.', 'So $A = ' + a + ' \\cdot ' + tn(hb) + '^{2t}$: the amount is multiplied by $' + tn(hb) + '$ every half year, which is a ' + (hb > 1 ? 'growth' : 'decay') + ' rate of $' + Math.round(Math.abs(hb - 1) * 100) + '\\%$ per half year.'], hint: 'Use $\\left(b^2\\right)^t = b^{2t}$.' }, { k: 'num', v: hb });
    }
    if (shape === 'base') {
      var o = R.pick([[8, 3, 2], [27, 3, 3], [16, 4, 2], [9, 2, 3], [25, 2, 5], [64, 3, 4], [81, 4, 3], [4, 2, 2], [36, 2, 6], [125, 3, 5], [49, 2, 7], [32, 5, 2]]), cc = R.pick([2, 3, 5, 10, 20, 40]);
      return out({ q: 'Rewrite $y = ' + cc + ' \\cdot ' + o[0] + '^{t/' + o[1] + '}$ in the form $y = ' + cc + ' \\cdot b^t$. What is $b$?', a: num(o[2]), steps: ['$' + o[0] + '^{t/' + o[1] + '} = \\left(' + o[0] + '^{1/' + o[1] + '}\\right)^t$ by the power-of-a-power rule.', '$' + o[0] + '^{1/' + o[1] + '} = ' + (o[1] === 2 ? '\\sqrt{' + o[0] + '}' : '\\sqrt[' + o[1] + ']{' + o[0] + '}') + ' = ' + o[2] + '$.', 'So $y = ' + cc + ' \\cdot ' + o[2] + '^t$.'], hint: 'Write $' + o[0] + '^{t/' + o[1] + '}$ as $\\left(' + o[0] + '^{1/' + o[1] + '}\\right)^t$.' }, { k: 'num', v: Math.pow(o[0], 1 / o[1]) });
    }
    if (shape === 'month' || shape === 'quarter') {
      var r = R.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), n = shape === 'month' ? 12 : 4, yb2 = U.fix(1 + r / 100), per = Math.pow(yb2, 1 / n), P0 = R.pick([500, 1000, 2000, 5000]);
      return out({ q: 'An investment grows by $' + r + '\\%$ per year: $V = ' + P0 + ' \\cdot ' + tn(yb2) + '^t$. Rewrite it as $V = ' + P0 + ' \\cdot b^{' + n + 't}$, with a factor $b$ for each ' + (n === 12 ? 'month' : 'quarter') + '. Find $b$ to four decimal places.', a: num(per.toFixed(4), { dp: 4 }), steps: ['$' + tn(yb2) + '^t = \\left(' + tn(yb2) + '^{1/' + n + '}\\right)^{' + n + 't}$.', '$b = ' + tn(yb2) + '^{1/' + n + '} \\approx ' + per.toFixed(4) + '$ (use a calculator).', 'That is about $' + ((per - 1) * 100).toFixed(2) + '\\%$ per ' + (n === 12 ? 'month' : 'quarter') + ', which is <em>less</em> than $\\frac{' + r + '\\%}{' + n + '} = ' + nf(U.round(r / n, 3)) + '\\%$, because growth compounds: each ' + (n === 12 ? 'month' : 'quarter') + ' earns on the earlier growth too.'], hint: 'Take the ' + (n === 12 ? '12th' : '4th') + ' root of the yearly factor: raise it to the power $\\frac{1}{' + n + '}$.' }, { k: 'num', v: per, tol: 0.00006 });
    }
    var mr = R.pick([0.5, 1, 1.5, 2]), mb = 1 + mr / 100, yr = Math.pow(mb, 12);
    return out({ q: 'A balance grows by $' + tn(mr) + '\\%$ per month: $B = 500 \\cdot ' + tn(mb) + '^{m}$, where $m$ is in months. Rewrite it as $B = 500 \\cdot b^{t}$ with $t$ in years. Find the yearly factor $b$ to four decimal places.', a: num(yr.toFixed(4), { dp: 4 }), steps: ['$t$ years is $m = 12t$ months, so $B = 500 \\cdot ' + tn(mb) + '^{12t} = 500 \\cdot \\left(' + tn(mb) + '^{12}\\right)^t$.', '$b = ' + tn(mb) + '^{12} \\approx ' + yr.toFixed(4) + '$.', 'So the yearly growth rate is about $' + ((yr - 1) * 100).toFixed(2) + '\\%$, more than $12 \\cdot ' + tn(mr) + '\\% = ' + nf(U.fix(12 * mr)) + '\\%$, because of compounding.'], hint: 'There are 12 months in a year, so $m = 12t$.' }, { k: 'num', v: yr, tol: 0.00006 });
  });


  // ================================================================ Unit 9: Polynomials
  function ptex(cs, v) { return tpoly(cs, v || 'x'); }
  function polyStepsMul(A, B) { // distribution table text for A*B (coefficient arrays)
    var n = A.length - 1, m = B.length - 1, parts = [];
    A.forEach(function (a, i) { if (!a) return; B.forEach(function (b, j) { if (!b) return; var k = n - i + m - j; parts.push(T.mono(a * b, k === 0 ? '' : k === 1 ? 'x' : 'x^{' + k + '}') || String(a * b)); }); });
    return parts;
  }
  function tm(x, y) { return x + ' \\cdot ' + (y[0] === '-' ? '(' + y + ')' : y); }
  function termTex(c, k) { return k === 0 ? tn(c) : T.mono(c, k === 1 ? 'x' : 'x^{' + k + '}'); }
  function sumTex(list) { var s = ''; list.forEach(function (t) { s += s === '' ? t : (t[0] === '-' ? ' - ' + t.slice(1) : ' + ' + t); }); return s; }

  // ---- alg1.polynomial-basics
  G('alg1.polynomial-basics', function (R, ctx) {
    var deg = R.int(2, by(ctx, 3, 4, 5)), pows = U.range(0, deg).filter(function (k) { return k === deg || k === 0 || R.chance(0.55); });
    var terms = pows.map(function (k) { return [k === deg ? R.nz(-7, 7) : R.nz(-9, 9), k]; });
    var shown = R.shuffle(terms);
    if (shown[0][1] === deg && shown.length > 1) shown.push(shown.shift()); // the leading term is not written first
    var tex = sumTex(shown.map(function (t) { return termTex(t[0], t[1]); }));
    var lead = terms.filter(function (t) { return t[1] === deg; })[0][0];
    var ask = R.pick(by(ctx, ['degree', 'lead', 'degree'], ['degree', 'lead', 'std', 'name'], ['std', 'lead', 'name', 'degree']));
    var stdTerms = terms.slice().sort(function (a, b) { return b[1] - a[1]; }), stdTex = sumTex(stdTerms.map(function (t) { return termTex(t[0], t[1]); }));
    if (ask === 'degree') return out({ q: 'What is the degree of $' + tex + '$?', a: num(deg), steps: ['The degree of a term is its exponent; the degree of the polynomial is the <em>largest</em> exponent of any term.', 'The exponents here are ' + U.list(shown.map(function (t) { return '$' + t[1] + '$'; })) + '. The largest is $' + deg + '$.', 'So the degree is $' + deg + '$. (It is not the number of terms, and not the exponent of the first term written.)'], hint: 'Look for the highest power of $x$, wherever it is written.' }, { k: 'num', v: deg });
    if (ask === 'lead') return out({ q: 'What is the leading coefficient of $' + tex + '$?', a: num(lead), steps: ['Write it in standard form, highest power first: $' + stdTex + '$.', 'The leading term is $' + termTex(lead, deg) + '$, so the leading coefficient is $' + lead + '$.'], hint: 'The leading term has the highest power, even if it is not written first.' }, { k: 'num', v: lead });
    if (ask === 'std') {
      var wrong1 = sumTex(shown.map(function (t) { return termTex(t[0], t[1]); })), wrong2 = sumTex(stdTerms.slice().reverse().map(function (t) { return termTex(t[0], t[1]); }));
      var wrong3 = sumTex(stdTerms.map(function (t, i) { return termTex(i === 0 ? t[0] : -t[0], t[1]); }));
      return { q: 'Which is $' + tex + '$ written in standard form?', a: mc('$' + stdTex + '$', ['$' + wrong2 + '$', '$' + wrong3 + '$', '$' + wrong1 + '$'].filter(function (w) { return w !== '$' + stdTex + '$'; })), steps: ['Standard form lists the terms from the highest degree to the lowest, each keeping its own sign.', '$' + stdTex + '$.'], hint: 'Order by exponent, largest first. Move each term with its sign.' };
    }
    var nterm = terms.length, degName = { 2: 'quadratic', 3: 'cubic', 4: 'quartic', 5: 'quintic' }[deg], termName = { 1: 'monomial', 2: 'binomial', 3: 'trinomial' }[nterm] || 'polynomial with ' + nterm + ' terms';
    var right = cap(degName) + ' ' + termName;
    var wrongs = [cap({ 2: 'cubic', 3: 'quadratic', 4: 'cubic', 5: 'quartic' }[deg]) + ' ' + termName, cap(degName) + ' ' + ({ 1: 'binomial', 2: 'trinomial', 3: 'binomial' }[nterm] || 'trinomial'), cap({ 2: 'cubic', 3: 'quartic', 4: 'quintic', 5: 'quadratic' }[deg]) + ' ' + ({ 1: 'binomial', 2: 'monomial', 3: 'monomial' }[nterm] || 'binomial')];
    return { q: 'Name $' + tex + '$ by its degree and its number of terms.', a: mc(right, wrongs), steps: ['Degree: the highest exponent is $' + deg + '$, so it is ' + degName + '.', 'Number of terms: $' + nterm + '$, so it is a ' + termName + '.', 'Together: ' + right.toLowerCase() + '.'], hint: 'Degree 2 is quadratic, 3 is cubic, 4 is quartic. One term is a monomial, two a binomial, three a trinomial.' };
  });

  // ---- alg1.add-subtract-polynomials
  G('alg1.add-subtract-polynomials', function (R, ctx) {
    var deg = by(ctx, 2, 2, 3), sub = ctx.level === 1 ? R.chance(0.4) : R.chance(0.7);
    var A = [], B = [], k;
    for (k = 0; k <= deg; k++) { A.push(k === 0 ? R.nz(-6, 6) : R.int(-8, 8)); B.push(k === 0 ? R.nz(-6, 6) : R.int(-8, 8)); }
    if (!A[deg]) A[deg] = R.nz(-5, 5); if (!B[deg]) B[deg] = R.nz(-5, 5);
    var res = sub ? padd(A, pneg(B)) : padd(A, B);
    var q1 = '(' + ptex(A) + ') ' + (sub ? '-' : '+') + ' (' + ptex(B) + ')';
    var steps = sub ? ['Subtracting a polynomial subtracts <em>every</em> term: change the sign of each term of the second polynomial, $-(' + ptex(B) + ') = ' + ptex(pneg(B)) + '$, and add.'] : ['Remove the parentheses: adding does not change any signs.'];
    steps.push('Combine like terms, power by power: ' + U.range(0, deg).reverse().map(function (pw) { var i = deg - pw, c = sub ? A[i] - B[i] : A[i] + B[i]; return (pw === 0 ? 'constants' : '$' + (pw === 1 ? 'x' : 'x^{' + pw + '}') + '$ terms') + ': $' + A[i] + (sub ? ' - ' : ' + ') + tp(B[i]) + ' = ' + c + '$'; }).join('; ') + '.');
    steps.push('Result: $' + ptex(res) + '$.');
    return out({ q: 'Simplify: $' + q1 + '$', a: { t: 'expr', v: ppoly(res), form: 'expanded' }, steps: steps, hint: sub ? 'Distribute the minus sign to every term of the second polynomial first.' : 'Add the coefficients of like terms.' }, { k: 'equiv', expr: '(' + ppoly(A) + ')' + (sub ? '-' : '+') + '(' + ppoly(B) + ')' });
  });

  // ---- alg1.multiply-monomial-polynomial
  G('alg1.multiply-monomial-polynomial', function (R, ctx) {
    var mc0 = R.nz(-5, 6), mk = R.int(by(ctx, 0, 1, 1), by(ctx, 1, 2, 3)), deg = R.int(1, by(ctx, 2, 2, 3)), P = [];
    for (var k = 0; k <= deg; k++) P.push(R.nz(-7, 7));
    var mono = [mc0].concat(U.range(1, mk).map(function () { return 0; }));
    if (mk === 0 && Math.abs(mc0) === 1) mono = [R.pick([2, 3, -2, -4])];
    var res = pmul(mono, P), monoTex = termTex(mono[0], mk);
    var parts = polyStepsMul(mono, P);
    return out({ q: 'Multiply: $' + monoTex + '(' + ptex(P) + ')$', a: { t: 'expr', v: ppoly(res), form: 'expanded' }, steps: ['Distribute: multiply $' + monoTex + '$ by <em>each</em> term inside the parentheses.', 'Multiply coefficients and add exponents (same base): ' + parts.map(function (p) { return '$' + p + '$'; }).join(', ') + '.', 'Result: $' + ptex(res) + '$.'], hint: 'Every term inside gets multiplied. Remember $x^a \\cdot x^b = x^{a+b}$.' }, { k: 'equiv', expr: '(' + ppoly(mono) + ')*(' + ppoly(P) + ')' });
  });

  // ---- alg1.multiply-binomials
  G('alg1.multiply-binomials', function (R, ctx) {
    var a = by(ctx, 1, R.pick([1, 2, 3]), R.pick([2, 3, -1, 4])), b = R.nz(-9, 9), c = by(ctx, 1, R.pick([1, 1, 2]), R.pick([1, 2, 3, -2])), d = R.nz(-9, 9);
    var res = pmul([a, b], [c, d]);
    var F = a * c, O = a * d, I = b * c, L2 = b * d;
    var viz = ctx.level === 1 && b > 0 && d > 0 ? { name: 'areamodel', opts: { quiet: true, a: plin(a, b), b: plin(c, d), x: 4, controls: false } } : undefined;
    var p = { q: 'Multiply: $' + tfac(a, b) + tfac(c, d) + '$', a: { t: 'expr', v: ppoly(res), form: 'expanded' }, steps: ['Each term of the first binomial multiplies each term of the second: four products, like the four rectangles of an area model.', 'First: $' + tm(T.mono(a, 'x'), T.mono(c, 'x')) + ' = ' + T.mono(F, 'x^2') + '$. Outer: $' + tm(T.mono(a, 'x'), tn(d)) + ' = ' + T.mono(O, 'x') + '$. Inner: $' + tm(tn(b), T.mono(c, 'x')) + ' = ' + T.mono(I, 'x') + '$. Last: $' + tm(tn(b), tn(d)) + ' = ' + L2 + '$.', 'Add them and combine the two middle terms: $' + T.mono(F, 'x^2') + T.coef(O, 'x', false) + T.coef(I, 'x', false) + T.signed(L2) + ' = ' + ptex(res) + '$.'], hint: 'Four products: first, outer, inner, last. Then combine like terms.' };
    if (viz) p.viz = viz;
    return out(p, { k: 'equiv', expr: '(' + plin(a, b) + ')*(' + plin(c, d) + ')' });
  });

  // ---- alg1.special-products
  G('alg1.special-products', function (R, ctx) {
    var shape = R.pick(by(ctx, ['sq', 'diff', 'sq'], ['sq', 'diff', 'fill', 'sqminus'], ['sqminus', 'diff', 'fill', 'sq']));
    var a = by(ctx, 1, R.pick([1, 2, 3]), R.pick([2, 3, 4, 5])), b = R.int(1, 9);
    if (shape === 'fill') {
      var sg = R.sign(), mid = 2 * a * b * sg;
      return out({ q: 'Fill in the missing middle coefficient: $' + tfac(a, sg * b) + '^2 = ' + T.mono(a * a, 'x^2') + ' + \\square x + ' + b * b + '$.', a: num(mid), steps: ['$(p + q)^2 = p^2 + 2pq + q^2$, so the middle term is $2pq$.', 'Here $p = ' + T.mono(a, 'x') + '$ and $q = ' + sg * b + '$: $2 \\cdot ' + T.mono(a, 'x') + ' \\cdot ' + tp(sg * b) + ' = ' + T.mono(mid, 'x') + '$.', 'The missing coefficient is $' + mid + '$.'], hint: 'The middle term of a squared binomial is twice the product of its two terms.' }, { k: 'num', v: mid });
    }
    var A, B, res, steps, src;
    if (shape === 'sq' || shape === 'sqminus') {
      var s = shape === 'sqminus' ? -1 : 1; A = [a, s * b];
      res = pmul(A, A); src = '(' + plin(a, s * b) + ')^2';
      steps = ['$(p ' + (s < 0 ? '-' : '+') + ' q)^2 = p^2 ' + (s < 0 ? '-' : '+') + ' 2pq + q^2$, with $p = ' + T.mono(a, 'x') + '$ and $q = ' + b + '$.', '$p^2 = ' + T.mono(a * a, 'x^2') + '$, $2pq = ' + T.mono(2 * a * b, 'x') + '$, $q^2 = ' + b * b + '$.', 'So $' + tfac(a, s * b) + '^2 = ' + ptex(res) + '$. The middle term comes from the two equal rectangles in the area model.'];
      return out({ q: 'Expand: $' + tfac(a, s * b) + '^2$', a: { t: 'expr', v: ppoly(res), form: 'expanded' }, steps: steps, hint: 'Write it as $' + tfac(a, s * b) + tfac(a, s * b) + '$, or use $(p + q)^2 = p^2 + 2pq + q^2$.' }, { k: 'equiv', expr: src });
    }
    res = pmul([a, b], [a, -b]);
    return out({ q: 'Multiply: $' + tfac(a, b) + tfac(a, -b) + '$', a: { t: 'expr', v: ppoly(res), form: 'expanded' }, steps: ['This is a sum times a difference: $(p + q)(p - q) = p^2 - q^2$.', 'The middle terms cancel: $+' + T.mono(a * b, 'x') + '$ and $-' + T.mono(a * b, 'x') + '$.', '$' + T.mono(a * a, 'x^2') + ' - ' + b * b + '$.'], hint: 'Sum times difference: the outer and inner products cancel.' }, { k: 'equiv', expr: '(' + plin(a, b) + ')*(' + plin(a, -b) + ')' });
  });

  // ---- alg1.multiply-polynomials
  G('alg1.multiply-polynomials', function (R, ctx) {
    var A = by(ctx, [1, R.nz(-5, 5)], [R.pick([1, 2]), R.nz(-5, 5)], [R.pick([1, 2]), R.int(-4, 4), R.nz(-5, 5)]);
    var B = [R.pick([1, 1, 2, -1]), R.int(-5, 5), R.nz(-6, 6)];
    if (ctx.level === 3 && A.length === 3 && !A[1]) A[1] = 1;
    var res = pmul(A, B), parts = polyStepsMul(A, B);
    var nA = A.filter(Boolean).length, nB = B.filter(Boolean).length;
    return out({ q: 'Multiply: $(' + ptex(A) + ')(' + ptex(B) + ')$', a: { t: 'expr', v: ppoly(res), form: 'expanded' }, steps: ['Every term of the first polynomial multiplies every term of the second: $' + nA + ' \\times ' + nB + ' = ' + nA * nB + '$ products. A grid (area model) keeps track of them.', 'The products: ' + parts.map(function (p) { return '$' + p + '$'; }).join(', ') + '.', 'Combine like terms: $' + ptex(res) + '$.', 'Check by substituting $x = 1$: $(' + U.sum(A) + ')(' + U.sum(B) + ') = ' + U.sum(A) * U.sum(B) + '$ and the answer gives $' + U.sum(res) + '$.'], hint: 'Multiply each term of the first by each term of the second, then combine like terms.' }, { k: 'equiv', expr: '(' + ppoly(A) + ')*(' + ppoly(B) + ')' });
  });


  // ================================================================ Unit 10: Factoring
  function monoPlain(c, k, v) { v = v || 'x'; return pterms([[c, k === 0 ? '' : k === 1 ? v : v + '^' + k]]); }
  function monoTex(c, k, v) { v = v || 'x'; return k === 0 ? tn(c) : T.mono(c, k === 1 ? v : v + '^{' + k + '}'); }
  function facPair(a, b) { return { tex: tfac(a, b), plain: pfac(a, b) }; }
  function fx2(p, q2) { return p === q2 ? { tex: tfac(1, p) + '^2', plain: pfac(1, p) + '^2' } : { tex: tfac(1, p) + tfac(1, q2), plain: pfac(1, p) + pfac(1, q2) }; }

  // ---- alg1.factor-gcf
  G('alg1.factor-gcf', function (R, ctx) {
    if (ctx.level === 3 && R.chance(0.4)) { // two variables: g a^m b^n (p a - q b) style
      var g2 = R.pick([2, 3, 4, 5, 6]), p2 = R.nz(-5, 5), q2 = R.nz(-5, 5); if (gcd(p2, q2) !== 1) q2 = q2 > 0 ? 1 : -1;
      // g a b (p a + q b) = g p a^2 b + g q a b^2
      var tex2 = T.terms([[g2 * p2, 'a^{2}b'], [g2 * q2, 'ab^{2}']]), ans2 = g2 + 'a*b*(' + pterms([[p2, 'a'], [q2, 'b']]) + ')';
      return out({ q: 'Factor out the greatest common factor: $' + tex2 + '$', a: { t: 'expr', v: ans2, vars: ['a', 'b'], form: 'factored' }, steps: ['Numbers: the GCF of $' + Math.abs(g2 * p2) + '$ and $' + Math.abs(g2 * q2) + '$ is $' + g2 + '$.', 'Variables: both terms have at least one $a$ and at least one $b$, so $ab$ is common.', 'GCF: $' + g2 + 'ab$. Divide each term by it: $' + T.mono(g2 * p2, 'a^{2}b') + ' \\div ' + g2 + 'ab = ' + T.mono(p2, 'a') + '$ and $' + T.mono(g2 * q2, 'ab^{2}') + ' \\div ' + g2 + 'ab = ' + T.mono(q2, 'b') + '$.', 'Result: $' + g2 + 'ab(' + T.terms([[p2, 'a'], [q2, 'b']]) + ')$.'], hint: 'Find the largest number and the most of each variable that divides every term.' }, { k: 'equiv', expr: ans2, vars: ['a', 'b'] });
    }
    var g = R.pick(by(ctx, [2, 3, 4, 5], [2, 3, 4, 5, 6, 8], [3, 4, 6, 7, 8, 9])), k = R.int(1, by(ctx, 1, 2, 3)), n = R.int(1, by(ctx, 1, 2, 2));
    var inner = [];
    for (var i = 0; i <= n; i++) inner.push(R.nz(-6, 6));
    if (U.gcd.apply(null, inner) !== 1) inner[n] = inner[n] > 0 ? 1 : -1;
    if (ctx.level === 1 && R.chance(0.35)) inner[n] = 1; // the "leave a 1 behind" case
    if (inner[0] < 0 && R.chance(0.7)) inner[0] = -inner[0];
    var full = pmul([g].concat(U.range(1, k).map(function () { return 0; })), inner), gTex = monoTex(g, k), gPlain = monoPlain(g, k);
    var ans = gPlain + '*(' + ppoly(inner) + ')';
    var terms = full.map(function (c, j) { return [c, full.length - 1 - j]; }).filter(function (t) { return t[0]; });
    return out({
      q: 'Factor out the greatest common factor: $' + ptex(full) + '$',
      a: { t: 'expr', v: ans, form: 'factored' },
      steps: ['Numbers: the greatest common factor of ' + U.list(terms.map(function (t) { return '$' + Math.abs(t[0]) + '$'; })) + ' is $' + g + '$.', 'Variables: every term has at least $' + (k === 1 ? 'x' : 'x^{' + k + '}') + '$ (the smallest power present), so the GCF is $' + gTex + '$.', 'Divide each term by $' + gTex + '$: ' + terms.map(function (t, j) { return '$' + termTex(t[0], t[1]) + ' \\div ' + gTex + ' = ' + termTex(t[0] / g, t[1] - k) + '$'; }).join(', ') + '.', 'Result: $' + gTex + '(' + ptex(inner) + ')$. Check by distributing: you get back $' + ptex(full) + '$.'],
      hint: 'Find the largest number and the highest power of $x$ that divide every term.'
    }, { k: 'equiv', expr: ppoly(full) });
  });

  // ---- alg1.factor-x2-bx-c
  G('alg1.factor-x2-bx-c', function (R, ctx) {
    var p = R.nz(-9, 9), q2 = R.nz(-9, 9);
    if (ctx.level === 1) { p = R.int(1, 8); q2 = R.int(1, 8); }
    if (p + q2 === 0) q2 = q2 + 1 || 2;
    var b = p + q2, c = p * q2, two = ctx.level === 3 && R.chance(0.35);
    var v = two ? 'xy' : 'x';
    var tex = two ? T.terms([[1, 'x^{2}'], [b, 'xy'], [c, 'y^{2}']]) : ptex([1, b, c]);
    var ans = two ? '(' + pterms([[1, 'x'], [p, 'y']]) + ')(' + pterms([[1, 'x'], [q2, 'y']]) + ')' : (p === q2 ? pfac(1, p) + '^2' : pfac(1, p) + pfac(1, q2));
    return out({
      q: 'Factor: $' + tex + '$',
      a: { t: 'expr', v: ans, vars: two ? ['x', 'y'] : ['x'], form: 'factored' },
      steps: ['We want $(x + p)(x + q)$, which multiplies out to $x^2 + (p + q)x + pq$. So we need two numbers with product $' + c + '$ and sum $' + b + '$.',
        c > 0 ? 'The product is positive, so both numbers have the same sign, the sign of the sum: ' + (b > 0 ? 'both positive.' : 'both negative.') : 'The product is negative, so the numbers have opposite signs; the one with the larger size has the sign of the sum.',
        'Try factor pairs of $' + Math.abs(c) + '$: $' + p + '$ and $' + q2 + '$ work, since $' + tp(p) + ' \\cdot ' + tp(q2) + ' = ' + c + '$ and $' + tp(p) + ' + ' + tp(q2) + ' = ' + b + '$.',
        'So $' + tex + ' = ' + (two ? '(' + T.terms([[1, 'x'], [p, 'y']]) + ')(' + T.terms([[1, 'x'], [q2, 'y']]) + ')' : fx2(p, q2).tex) + '$. Check by multiplying back.'],
      hint: 'Find two numbers that multiply to $' + c + '$ and add to $' + b + '$. Watch the signs.'
    }, { k: 'equiv', expr: two ? ans : ppoly([1, b, c]), vars: two ? ['x', 'y'] : ['x'] });
  });

  // ---- alg1.factor-ax2-bx-c
  G('alg1.factor-ax2-bx-c', function (R, ctx) {
    var r = retry(function () {
      var a = R.pick(by(ctx, [2, 3, 5], [2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 8])), c = R.pick([1, 1, 2, 3]), b = R.nz(-7, 7), d = R.nz(-7, 7);
      if (gcd(a, b) !== 1 || gcd(c, d) !== 1) return null;
      var A = a * c, B = a * d + b * c, C = b * d;
      if (A === 1 || B === 0 || U.gcd(A, B, C) !== 1) return null;
      return [a, b, c, d, A, B, C];
    }, 400);
    var a = r[0], b = r[1], c = r[2], d = r[3], A = r[4], B = r[5], C = r[6], ac = A * C;
    var m1 = a * d, m2 = b * c; // split B = m1 + m2, with m1 * m2 = ac
    var ans = pfac(a, b) + pfac(c, d);
    return out({
      q: 'Factor: $' + ptex([A, B, C]) + '$',
      a: { t: 'expr', v: ans, form: 'factored' },
      steps: ['Multiply $a \\cdot c = ' + A + ' \\cdot ' + tp(C) + ' = ' + ac + '$. Find two numbers with product $' + ac + '$ and sum $' + B + '$: $' + m1 + '$ and $' + m2 + '$.',
        'Split the middle term: $' + T.terms([[A, 'x^{2}'], [m1, 'x'], [m2, 'x'], [C, '']]) + '$.',
        'Group in pairs and factor each: $' + T.mono(a, 'x') + tfac(c, d) + (b < 0 ? ' - ' + Math.abs(b) : ' + ' + b) + tfac(c, d) + '$.',
        'Factor out the common binomial: $' + tfac(a, b) + tfac(c, d) + '$.',
        'Check: $' + tfac(a, b) + tfac(c, d) + ' = ' + ptex([A, B, C]) + '$.'],
      hint: 'Use $a \\cdot c = ' + ac + '$: find two numbers that multiply to it and add to $' + B + '$, then split the middle term and group.'
    }, { k: 'equiv', expr: ppoly([A, B, C]) });
  });

  // ---- alg1.factor-special-products
  G('alg1.factor-special-products', function (R, ctx) {
    var shape = R.pick(by(ctx, ['diff', 'diff', 'square'], ['diff', 'square', 'which'], ['square', 'diff2', 'which', 'square']));
    var a = by(ctx, 1, R.pick([1, 2, 3]), R.pick([2, 3, 4, 5])), b = R.int(1, 9);
    if (shape === 'which') {
      var sq = [[1, 4], [1, 9], [4, 25], [1, 16], [9, 1], [1, 36]], pk = R.pick(sq);
      var sumSq = (pk[0] === 1 ? '' : pk[0]) + 'x^2 + ' + pk[1];
      return { q: 'Which of these does <b>not</b> factor using real numbers?', a: mc('$' + sumSq + '$', ['$' + (pk[0] === 1 ? '' : pk[0]) + 'x^2 - ' + pk[1] + '$', '$x^2 + ' + 2 * Math.sqrt(pk[1]) + 'x + ' + pk[1] + '$', '$x^2 - ' + 2 * Math.sqrt(pk[1]) + 'x + ' + pk[1] + '$']), steps: ['$' + (pk[0] === 1 ? '' : pk[0]) + 'x^2 - ' + pk[1] + '$ is a difference of squares; the two trinomials are perfect squares.', 'A <em>sum</em> of squares does not factor over the real numbers: $(px + q)(px - q)$ gives a minus sign, and $(px + q)^2$ adds a middle term.', 'Also, $' + sumSq + '$ is always positive, so it is never $0$ and cannot have a real factor like $(x - r)$.'], hint: 'Difference of squares factors; sum of squares does not.' };
    }
    if (shape === 'diff' || shape === 'diff2') {
      var A = a * a, B = b * b, ans = pfac(a, b) + pfac(a, -b), tex = shape === 'diff2' ? T.terms([[A, 'x^{2}'], [-B, 'y^{2}']]) : ptex([A, 0, -B]);
      if (shape === 'diff2') ans = '(' + pterms([[a, 'x'], [b, 'y']]) + ')(' + pterms([[a, 'x'], [-b, 'y']]) + ')';
      return out({ q: 'Factor: $' + tex + '$', a: { t: 'expr', v: ans, vars: shape === 'diff2' ? ['x', 'y'] : ['x'], form: 'factored' }, steps: ['Both terms are perfect squares, and they are subtracted: $' + T.mono(A, 'x^2') + (a === 1 ? '' : ' = (' + T.mono(a, 'x') + ')^2') + '$ and $' + (shape === 'diff2' ? T.mono(B, 'y^2') + (b === 1 ? '' : ' = (' + T.mono(b, 'y') + ')^2') : B + ' = ' + b + '^2') + '$.', 'A difference of squares factors as $p^2 - q^2 = (p + q)(p - q)$.', '$' + tex + ' = (' + T.mono(a, 'x') + ' + ' + (shape === 'diff2' ? T.mono(b, 'y') : b) + ')(' + T.mono(a, 'x') + ' - ' + (shape === 'diff2' ? T.mono(b, 'y') : b) + ')$.'], hint: 'Is it one square minus another square?' }, { k: 'equiv', expr: ans, vars: shape === 'diff2' ? ['x', 'y'] : ['x'] });
    }
    var s = R.sign(), cs = [a * a, 2 * a * b * s, b * b], ans2 = pfac(a, s * b) + '^2';
    return out({ q: 'Factor: $' + ptex(cs) + '$', a: { t: 'expr', v: ans2, form: 'factored' }, steps: ['First and last terms are squares: $' + T.mono(a * a, 'x^2') + ' = (' + T.mono(a, 'x') + ')^2$ and $' + b * b + ' = ' + b + '^2$.', 'Check the middle: $2 \\cdot ' + T.mono(a, 'x') + ' \\cdot ' + b + ' = ' + T.mono(2 * a * b, 'x') + '$. It matches (with a ' + (s > 0 ? 'plus' : 'minus') + ' sign), so this is a perfect square trinomial.', '$' + ptex(cs) + ' = ' + tfac(a, s * b) + '^2$.'], hint: 'Are the first and last terms perfect squares, and is the middle term twice their product?' }, { k: 'equiv', expr: ppoly(cs) });
  });

  // ---- alg1.factor-grouping
  G('alg1.factor-grouping', function (R, ctx) {
    var shape = R.pick(by(ctx, ['cubic', 'cubic'], ['cubic', 'twovar'], ['cubic', 'twovar', 'cubic']));
    if (shape === 'twovar') {
      var p = R.nz(-6, 6), q2 = R.nz(-6, 6);
      // (x + q)(y + p) = xy + px + qy + pq
      var tex = T.terms([[1, 'xy'], [p, 'x'], [q2, 'y'], [p * q2, '']]), ans = pfac(1, q2) + '(' + plin(1, p, 'y') + ')';
      return out({ q: 'Factor by grouping: $' + tex + '$', a: { t: 'expr', v: ans, vars: ['x', 'y'], form: 'factored' }, steps: ['Group the first two terms and the last two: $(' + T.terms([[1, 'xy'], [p, 'x']]) + ') + (' + T.terms([[q2, 'y'], [p * q2, '']]) + ')$.', 'Factor each group: $x(' + tlin(1, p, 'y') + ')' + (q2 < 0 ? ' - ' + Math.abs(q2) : ' + ' + q2) + '(' + tlin(1, p, 'y') + ')$.', 'The binomial $(' + tlin(1, p, 'y') + ')$ is common: $' + tfac(1, q2) + '(' + tlin(1, p, 'y') + ')$.'], hint: 'Factor something out of each pair so that the same binomial appears twice.' }, { k: 'equiv', expr: ans, vars: ['x', 'y'] });
    }
    var a = R.pick(by(ctx, [1], [1, 2], [1, 2, 3])), b = R.nz(-6, 6), c = R.nz(-6, 6), d = R.nz(-6, 6);
    if (gcd(c, d) !== 1) d = d > 0 ? 1 : -1;
    if (gcd(a, b) !== 1) b = b > 0 ? 1 : -1;
    // (c x^2 + d)(a x + b) = ac x^3 + bc x^2 + ad x + bd
    var cs = [a * c, b * c, a * d, b * d], ans2 = '(' + ppoly([c, 0, d]) + ')' + pfac(a, b);
    var g1 = c, g2 = d;
    return out({ q: 'Factor by grouping: $' + ptex(cs) + '$', a: { t: 'expr', v: ans2, form: 'factored' }, steps: ['Group in pairs: $(' + ptex([a * c, b * c, 0, 0]).replace(/ \+ 0$/, '') + ') + (' + T.lin(a * d, 'x', b * d) + ')$.', 'Factor each pair: $' + T.mono(c, 'x^2') + tfac(a, b) + (d < 0 ? ' - ' + Math.abs(d) : ' + ' + d) + tfac(a, b) + '$. ' + (d < 0 ? 'Taking out $' + d + '$ (negative) keeps the binomial the same.' : ''), 'The binomial $' + tfac(a, b) + '$ is common: $(' + ptex([c, 0, d]) + ')' + tfac(a, b) + '$.', 'Check by multiplying back: $' + ptex(cs) + '$.'], hint: 'Factor the GCF out of each pair. The two binomials must match.' }, { k: 'equiv', expr: ppoly(cs) });
  });

  // ---- alg1.factor-completely
  G('alg1.factor-completely', function (R, ctx) {
    var shape = R.pick(by(ctx, ['gcfdiff', 'gcftri'], ['gcfdiff', 'gcftri', 'xgcf', 'gcfsq'], ['xgcf', 'fourth', 'gcfsq', 'gcftri']));
    var k = R.pick([2, 3, 4, 5]), p = R.nz(-6, 6), q2 = R.nz(-6, 6), b = R.int(1, 7), cs, ans, steps;
    if (shape === 'gcfdiff') { cs = [k, 0, -k * b * b]; ans = k + pfac(1, b) + pfac(1, -b); steps = ['Take out the GCF $' + k + '$: $' + k + '(x^2 - ' + b * b + ')$.', '$x^2 - ' + b * b + '$ is a difference of squares: $(x + ' + b + ')(x - ' + b + ')$.', 'Fully factored: $' + k + '(x + ' + b + ')(x - ' + b + ')$.']; }
    else if (shape === 'gcftri') { if (p + q2 === 0) q2 += 1; if (!q2) q2 = 2; cs = [k, k * (p + q2), k * p * q2]; ans = k + fx2(p, q2).plain; steps = ['Take out the GCF $' + k + '$: $' + k + '(' + ptex([1, p + q2, p * q2]) + ')$.', 'Factor the trinomial: two numbers with product $' + p * q2 + '$ and sum $' + (p + q2) + '$ are $' + p + '$ and $' + q2 + '$.', 'Fully factored: $' + k + fx2(p, q2).tex + '$.']; }
    else if (shape === 'xgcf') { if (p + q2 === 0) q2 += 1; if (!q2) q2 = 3; var kk = R.pick([1, 2, 3]); cs = [kk, kk * (p + q2), kk * p * q2, 0]; ans = monoPlain(kk, 1) + fx2(p, q2).plain; steps = ['Every term has a factor of $' + monoTex(kk, 1) + '$: $' + monoTex(kk, 1) + '(' + ptex([1, p + q2, p * q2]) + ')$.', 'Factor the trinomial: $' + p + '$ and $' + q2 + '$ multiply to $' + p * q2 + '$ and add to $' + (p + q2) + '$.', 'Fully factored: $' + monoTex(kk, 1) + fx2(p, q2).tex + '$.']; }
    else if (shape === 'gcfsq') { var s = R.sign(); cs = [k, 2 * k * b * s, k * b * b]; ans = k + pfac(1, s * b) + '^2'; steps = ['Take out the GCF $' + k + '$: $' + k + '(' + ptex([1, 2 * b * s, b * b]) + ')$.', 'The trinomial is a perfect square: $x^2' + (s > 0 ? ' + ' : ' - ') + 2 * b + 'x + ' + b * b + ' = ' + tfac(1, s * b) + '^2$.', 'Fully factored: $' + k + tfac(1, s * b) + '^2$.']; }
    else { var m = R.pick([1, 2, 3]), mm = m * m; cs = [1, 0, 0, 0, -mm * mm]; ans = '(x^2+' + mm + ')' + pfac(1, m) + pfac(1, -m); steps = ['$x^4 - ' + mm * mm + ' = (x^2)^2 - ' + mm + '^2$ is a difference of squares: $(x^2 + ' + mm + ')(x^2 - ' + mm + ')$.', '$x^2 - ' + mm + '$ is again a difference of squares: $(x + ' + m + ')(x - ' + m + ')$.', '$x^2 + ' + mm + '$ is a sum of squares and does not factor over the reals.', 'Fully factored: $(x^2 + ' + mm + ')(x + ' + m + ')(x - ' + m + ')$.']; }
    return out({ q: 'Factor completely: $' + ptex(cs) + '$', a: { t: 'expr', v: ans, form: 'factored' }, steps: steps.concat(['Check: no factor can be factored further, and multiplying back gives $' + ptex(cs) + '$.']), hint: 'Take out the greatest common factor first. Then look at what is left: a trinomial, or a difference of squares?' }, { k: 'equiv', expr: ppoly(cs) });
  });


  // ================================================================ Unit 11: Quadratic Functions and Equations
  // exact roots of a x^2 + b x + c = 0 (integers a, b, c): { n: number of real roots, plain: [...], tex: [...], num: [...] }
  function quadRoots(a, b, c) {
    var D = b * b - 4 * a * c;
    if (D < 0) return { n: 0, D: D, plain: [], tex: [], num: [] };
    if (D === 0) { var r0 = fr(-b, 2 * a); return { n: 1, D: D, plain: [pq(r0)], tex: [tn(r0)], num: [r0.toNumber()] }; }
    var sr = U.simplifyRadical(D), s = sr[0], r = sr[1];
    if (r === 1) { var x1 = fr(-b - s, 2 * a), x2 = fr(-b + s, 2 * a); var lo = x1.lt(x2) ? x1 : x2, hi = x1.lt(x2) ? x2 : x1; return { n: 2, D: D, plain: [pq(lo), pq(hi)], tex: [tn(lo), tn(hi)], num: [lo.toNumber(), hi.toNumber()], rational: true }; }
    var den = 2 * a, nb = -b; if (den < 0) { den = -den; nb = -nb; }
    var g = U.gcd(nb, s, den) || 1; nb /= g; s /= g; den /= g;
    var sq = (s === 1 ? '' : s + '*') + 'sqrt(' + r + ')', sqT = (s === 1 ? '' : s) + '\\sqrt{' + r + '}';
    function pl(sign) { var top = nb === 0 ? (sign < 0 ? '-' : '') + sq : nb + (sign < 0 ? '-' : '+') + sq; return den === 1 ? top : '(' + top + ')/' + den; }
    function tx(sign) { var top = nb === 0 ? (sign < 0 ? '-' : '') + sqT : nb + (sign < 0 ? ' - ' : ' + ') + sqT; return den === 1 ? top : '\\frac{' + top + '}{' + den + '}'; }
    var v1 = (nb - s * Math.sqrt(r)) / den, v2 = (nb + s * Math.sqrt(r)) / den;
    return { n: 2, D: D, plain: [pl(-1), pl(1)], tex: [tx(-1), tx(1)], num: [v1, v2], pm: den === 1 ? (nb === 0 ? '\\pm ' + sqT : nb + ' \\pm ' + sqT) : '\\frac{' + (nb === 0 ? '\\pm ' + sqT : nb + ' \\pm ' + sqT) + '}{' + den + '}' };
  }
  function surdPlain(k, n) { // k * sqrt(n), simplified, n >= 0
    var sr = U.simplifyRadical(n), o = k * sr[0];
    return sr[1] === 1 ? String(o) : (o === 1 ? '' : o === -1 ? '-' : o + '*') + 'sqrt(' + sr[1] + ')';
  }
  function vtex(a, h, k) { // a(x - h)^2 + k
    var inner = h === 0 ? 'x^2' : '(' + tlin(1, -h) + ')^2';
    return T.coef(a, inner) + T.signed(k);
  }
  function vplain(a, h, k) { return pterms([[a, h === 0 ? 'x^2' : '(' + pshift(h) + ')^2'], [k, '']]); }
  function parabViz(a, h, k, extra) { var o = { f: nf(a) + '*(x-(' + h + '))^2+(' + k + ')', xmin: -9, xmax: 9, ymin: -9, ymax: 9, zoom: false }; if (extra) for (var e in extra) o[e] = extra[e]; return { name: 'graph', opts: o }; }

  // ---- alg1.quadratic-graphs
  G('alg1.quadratic-graphs', function (R, ctx) {
    var shape = R.pick(by(ctx, ['opens', 'yint', 'vertex'], ['axis', 'vertex', 'narrow', 'opens'], ['axis', 'narrow', 'vertex', 'axis']));
    var a = R.pick(by(ctx, [1, -1, 2, -2], [1, -1, 2, -2, 0.5], [1, -1, 3, -3, 0.5, -0.5])), h = R.int(-4, 4), k = R.int(-5, 5);
    if (shape === 'opens') {
      var A = R.nz(-5, 5), B = R.int(-6, 6), C = R.int(-9, 9);
      return { q: 'Does the parabola $y = ' + ptex([A, B, C]) + '$ open up or down?', a: { t: 'mc', choices: ['Up', 'Down'], v: A > 0 ? 0 : 1, keep: true }, steps: ['For large $|x|$, the $x^2$ term is the biggest, so its coefficient decides the shape.', 'The coefficient of $x^2$ is $' + A + '$, which is ' + (A > 0 ? 'positive: the outputs grow large and positive on both sides, so it opens up.' : 'negative: the outputs become very negative on both sides, so it opens down.')], hint: 'Look at the sign of the $x^2$ coefficient.' };
    }
    if (shape === 'yint') {
      var A2 = R.nz(-4, 4), B2 = R.int(-6, 6), C2 = R.nz(-9, 9);
      return out({ q: 'What is the $y$-intercept of $y = ' + ptex([A2, B2, C2]) + '$? Give the $y$-value.', a: num(C2), steps: ['The $y$-intercept is where $x = 0$.', 'Substitute $x = 0$: every term containing $x$ becomes $0$, leaving $y = ' + C2 + '$.', 'For $y = ax^2 + bx + c$ the $y$-intercept is always $c$, the point $(0, c)$.'], hint: 'Set $x = 0$.' }, { k: 'num', v: C2 });
    }
    if (shape === 'vertex') {
      return out({ q: 'The graph of a quadratic function is shown. What is its vertex?', viz: parabViz(a, h, k), a: tup([h, k]), steps: ['The vertex is the turning point: the ' + (a > 0 ? 'lowest' : 'highest') + ' point, since the parabola opens ' + (a > 0 ? 'up' : 'down') + '.', 'Reading the grid, it is at $(' + h + ', ' + k + ')$.', 'The axis of symmetry is the vertical line through it, $x = ' + h + '$.'], hint: 'Find the turning point of the curve.' }, { k: 'tuple', v: [h, k] });
    }
    if (shape === 'axis') {
      var d = R.int(1, 5), yv = R.int(-6, 9), x1 = h - d, x2 = h + d;
      if (ctx.level === 3 && R.coin()) { var hh = fr(2 * h + 1, 2); x1 = h - d; x2 = h + d + 1; return out({ q: 'A parabola passes through $(' + x1 + ', ' + yv + ')$ and $(' + x2 + ', ' + yv + ')$. What is its axis of symmetry? Give the $x$-value.', a: num(hh), steps: ['Points at the same height are mirror images across the axis of symmetry.', 'So the axis is halfway between them: $x = \\frac{' + x1 + ' + ' + tp(x2) + '}{2} = ' + tn(hh) + '$.'], hint: 'Find the midpoint of the two $x$-values.' }, { k: 'num', v: hh.toNumber() }); }
      return out({ q: 'A parabola passes through $(' + x1 + ', ' + yv + ')$ and $(' + x2 + ', ' + yv + ')$. What is its axis of symmetry? Give the $x$-value.', a: num(h), steps: ['Points at the same height are mirror images across the axis of symmetry.', 'So the axis is halfway between them: $x = \\frac{' + x1 + ' + ' + tp(x2) + '}{2} = ' + h + '$.'], hint: 'Find the midpoint of the two $x$-values.' }, { k: 'num', v: h });
    }
    var mags = R.sample([0.25, 0.5, 1, 2, 3, 4], 4), as = mags.map(function (v) { return R.coin() ? v : -v; }), mx = as.reduce(function (m, v) { return Math.abs(v) > Math.abs(m) ? v : m; }, 0);
    var lab = function (v) { return '$y = ' + T.coef(v, 'x^2') + '$'; };
    return { q: 'Which parabola is the narrowest?', a: mc(lab(mx), as.filter(function (v) { return v !== mx; }).map(lab)), steps: ['A larger $|a|$ multiplies every output by more, so the graph climbs (or falls) faster and looks narrower.', 'The largest $|a|$ here is $' + Math.abs(mx) + '$, from ' + lab(mx) + '. The sign only decides up or down.'], hint: 'Compare $|a|$, ignoring the sign. Bigger $|a|$ means narrower.' };
  });

  // ---- alg1.vertex-form
  G('alg1.vertex-form', function (R, ctx) {
    var shape = R.pick(by(ctx, ['vertex', 'vertex', 'axis'], ['vertex', 'ext', 'write'], ['write', 'ext', 'vertex']));
    var a = R.pick(by(ctx, [1, -1, 2], [1, -1, 2, -2, 3], [2, -2, 3, -3, 0.5, -1])), h = R.nz(-6, 6), k = R.int(-7, 7);
    var f = vtex(a, h, k);
    if (shape === 'vertex' || shape === 'axis') {
      var isAxis = shape === 'axis';
      return out({ q: 'For $y = ' + f + '$, what is ' + (isAxis ? 'the axis of symmetry? Give the $x$-value.' : 'the vertex?'), a: isAxis ? num(h) : tup([h, k]), steps: ['Compare with $y = a(x - h)^2 + k$, whose vertex is $(h, k)$.', '$' + tlin(1, -h) + ' = x - ' + tp(h) + '$, so $h = ' + h + '$. And $k = ' + k + '$.', isAxis ? 'The axis of symmetry is the vertical line through the vertex: $x = ' + h + '$.' : 'Vertex: $(' + h + ', ' + k + ')$. Check: at $x = ' + h + '$ the square is $0$ and $y = ' + k + '$.'], hint: 'In $a(x - h)^2 + k$, the vertex is $(h, k)$. Watch the sign of $h$.' }, isAxis ? { k: 'num', v: h } : { k: 'tuple', v: [h, k] });
    }
    if (shape === 'ext') {
      return out({ q: 'Does $y = ' + f + '$ have a maximum or a minimum value, and what is it?', a: { t: 'multi', parts: [{ label: 'It has a', a: { t: 'mc', choices: ['maximum', 'minimum'], v: a > 0 ? 1 : 0, keep: true } }, { label: 'The value is', a: num(k) }] }, steps: ['A square is never negative, so $(' + tlin(1, -h) + ')^2 \\ge 0$, with $0$ at $x = ' + h + '$.', a > 0 ? 'Multiplying by $' + tn(a) + ' > 0$ keeps it $\\ge 0$, so $y \\ge ' + k + '$: a minimum of $' + k + '$.' : 'Multiplying by $' + tn(a) + ' < 0$ makes it $\\le 0$, so $y \\le ' + k + '$: a maximum of $' + k + '$.'], hint: 'The sign of $a$ decides whether the vertex is the lowest or the highest point.' }, null);
    }
    // write from vertex and another point
    var r = retry(function () { var A = R.pick([1, -1, 2, -2, 3, -3]), dx = R.nz(-3, 3); return [A, dx]; });
    var A = r[0], dx = r[1], px = h + dx, py = k + A * dx * dx;
    return out({ q: 'A parabola has vertex $(' + h + ', ' + k + ')$ and passes through $(' + px + ', ' + py + ')$. Write its equation in vertex form.', a: { t: 'expr', v: vplain(A, h, k) }, steps: ['Vertex form: $y = a(x - ' + tp(h) + ')^2 + ' + tp(k) + '$, that is, $y = a' + (h ? '(' + tlin(1, -h) + ')^2' : 'x^2') + T.signed(k) + '$.', 'Substitute the point: $' + py + ' = a(' + px + ' - ' + tp(h) + ')^2' + T.signed(k) + ' = ' + T.mono(dx * dx, 'a') + T.signed(k) + '$.', 'So $' + T.mono(dx * dx, 'a') + ' = ' + (py - k) + '$ and $a = ' + A + '$.', '$y = ' + vtex(A, h, k) + '$.'], hint: 'Use the vertex for $h$ and $k$, then the other point to find $a$.' }, { k: 'fn', expr: A + '*(x-(' + h + '))^2+(' + k + ')' });
  });

  // ---- alg1.zero-product-property
  G('alg1.zero-product-property', function (R, ctx) {
    var shape = R.pick(by(ctx, ['product', 'product', 'trinomial'], ['trinomial', 'linear2', 'gcf'], ['trap', 'trinomial', 'linear2', 'gcf']));
    if (shape === 'product') {
      var p = R.nz(-9, 9), q2 = R.intNot(-9, 9, [p, 0]), x0 = R.coin();
      var tex = x0 ? 'x' + tfac(1, -q2) : tfac(1, -p) + tfac(1, -q2), sols = x0 ? [0, q2] : [p, q2];
      return out({ q: 'Solve: $' + tex + ' = 0$', a: setA(sols), steps: ['If a product is $0$, at least one factor must be $0$, since nonzero numbers never multiply to $0$.', (x0 ? '$x = 0$' : '$' + tlin(1, -p) + ' = 0$ gives $x = ' + p + '$') + ', or $' + tlin(1, -q2) + ' = 0$ gives $x = ' + q2 + '$.', 'Solutions: $x = ' + tset(sols) + '$.'], hint: 'Set each factor equal to $0$.' }, { k: 'roots', eq: (x0 ? 'x' : pfac(1, -p)) + '*' + pfac(1, -q2) + '=0' });
    }
    if (shape === 'linear2') {
      var a = R.pick([2, 3, 4, 5]), b = R.nz(-7, 7), c = R.pick([1, 2, 3]), d = R.nz(-7, 7); if (gcd(a, b) !== 1) b = b > 0 ? 1 : -1; if (gcd(c, d) !== 1) d = d > 0 ? 1 : -1;
      var s1 = fr(-b, a), s2 = fr(-d, c);
      return out({ q: 'Solve: $' + tfac(a, b) + tfac(c, d) + ' = 0$', a: setA(s1.eq(s2) ? [s1] : [s1, s2]), steps: ['One of the factors must be $0$.', '$' + tlin(a, b) + ' = 0$ gives $x = ' + tn(s1) + '$.', '$' + tlin(c, d) + ' = 0$ gives $x = ' + tn(s2) + '$.'], hint: 'Set each factor equal to $0$ and solve the two small equations.' }, { k: 'roots', eq: pfac(a, b) + '*' + pfac(c, d) + '=0' });
    }
    if (shape === 'gcf') {
      var k = R.nz(-9, 9), m = R.pick([1, 2, 3]), lhsCoef = m;
      var form = R.coin();
      var tex2 = form ? T.mono(m, 'x^2') + ' = ' + T.mono(m * k, 'x') : T.mono(m, 'x^2') + T.coef(-m * k, 'x', false) + ' = 0';
      return out({ q: 'Solve: $' + tex2 + '$', a: setA([0, k]), steps: (form ? ['Do not divide by $x$: that would lose the solution $x = 0$. Instead move everything to one side: $' + T.mono(m, 'x^2') + T.coef(-m * k, 'x', false) + ' = 0$.'] : []).concat(['Factor out the GCF: $' + T.mono(m, 'x') + '(' + tlin(1, -k) + ') = 0$.', 'So $' + T.mono(m, 'x') + ' = 0$ or $' + tlin(1, -k) + ' = 0$: $x = 0$ or $x = ' + k + '$.']), hint: 'Get $0$ on one side, then factor.' }, { k: 'roots', eq: m + '*x^2-(' + m * k + ')*x=0' });
    }
    if (shape === 'trap') {
      var rr = retry(function () { var r1 = R.int(-5, 6), r2 = R.int(-5, 6), p0 = R.int(-6, 6), sum = r1 + r2, q0 = sum - p0, K = p0 * q0 - r1 * r2; return K !== 0 && r1 !== r2 && p0 !== q0 && [r1, r2].indexOf(p0) < 0 && Math.abs(K) <= 30 ? [r1, r2, p0, q0, K] : null; });
      var r1 = rr[0], r2 = rr[1], P = rr[2], Q2 = rr[3], K = rr[4], sum2 = r1 + r2, prod = r1 * r2;
      var sols2 = r1 === r2 ? [r1] : [r1, r2];
      return out({ q: 'Solve: $' + tfac(1, -P) + tfac(1, -Q2) + ' = ' + K + '$', a: setA(sols2), steps: ['The zero product property only works when the product equals $0$, so you cannot set each factor equal to $' + K + '$.', 'Multiply out: $' + ptex([1, -(P + Q2), P * Q2]) + ' = ' + K + '$.', 'Move $' + K + '$ to the left: $' + ptex([1, -sum2, prod]) + ' = 0$.', 'Factor: $' + (prod === 0 ? 'x' + tfac(1, -(r1 || r2)) : r1 === r2 ? tfac(1, -r1) + '^2' : tfac(1, -r1) + tfac(1, -r2)) + ' = 0$, so $x = ' + tset(sols2) + '$.'], hint: 'First make one side $0$.' }, { k: 'roots', eq: pfac(1, -P) + '*' + pfac(1, -Q2) + '=' + K });
    }
    var p3 = R.nz(-8, 8), q3 = R.nz(-8, 8), b3 = -(p3 + q3), c3 = p3 * q3, sols3 = p3 === q3 ? [p3] : [p3, q3];
    var move = ctx.level >= 2 && R.chance(0.4) && c3 !== 0, rhs = move ? -c3 : 0;
    var tex3 = move ? ptex([1, b3, 0]) + ' = ' + rhs : ptex([1, b3, c3]) + ' = 0';
    return out({ q: 'Solve by factoring: $' + tex3 + '$', a: setA(sols3), steps: (move ? ['First get $0$ on one side: $' + ptex([1, b3, c3]) + ' = 0$.'] : []).concat(['Factor: two numbers with product $' + c3 + '$ and sum $' + b3 + '$ are $' + (-p3) + '$ and $' + (-q3) + '$: $' + (p3 === q3 ? tfac(1, -p3) + '^2' : tfac(1, -p3) + tfac(1, -q3)) + ' = 0$.', 'Zero product property: $x = ' + tset(sols3) + '$.']), hint: 'Make one side $0$, factor, then set each factor to $0$.' }, { k: 'roots', eq: ppoly([1, b3, c3]) + '=0' });
  });

  // ---- alg1.factored-form-zeros
  G('alg1.factored-form-zeros', function (R, ctx) {
    var shape = R.pick(by(ctx, ['zeros', 'zeros', 'trap'], ['zeros', 'write', 'axis', 'trap'], ['write', 'axis', 'zeros']));
    var a = R.pick(by(ctx, [1, -1, 2], [1, -1, 2, -2, 3], [1, -1, 2, -2, 0.5])), p = R.int(-7, 6), q2 = R.intNot(-7, 7, [p]);
    var ftex = (a === 1 ? '' : a === -1 ? '-' : tn(a)) + (p === 0 ? 'x' : tfac(1, -p)) + tfac(1, -q2);
    if (shape === 'zeros') return out({ q: 'What are the zeros of $f(x) = ' + ftex + '$?', viz: ctx.level === 1 ? { name: 'graph', opts: { f: nf(a) + '*(x-(' + p + '))*(x-(' + q2 + '))', xmin: -9, xmax: 9, ymin: -12, ymax: 12, zoom: false } } : undefined, a: setA([p, q2]), steps: ['A zero is an input where $f(x) = 0$: the graph crosses the $x$-axis there.', 'By the zero product property, $' + (p === 0 ? 'x' : tlin(1, -p)) + ' = 0$ or $' + tlin(1, -q2) + ' = 0$.', 'Zeros: $x = ' + p + '$ and $x = ' + q2 + '$. The factor $(x - r)$ goes with the zero $r$.'], hint: 'Which $x$ makes each factor $0$?' }, { k: 'roots', eq: nf(a) + '*(x-(' + p + '))*(x-(' + q2 + '))=0' });
    if (shape === 'trap') {
      var pp1 = R.int(1, 7), qq1 = -R.int(1, 7);
      var right = '$' + (-pp1) + '$ and $' + (-qq1) + '$', t2 = tfac(1, pp1) + tfac(1, qq1);
      return { q: 'What are the zeros of $y = ' + t2 + '$?', a: mc(right, ['$' + pp1 + '$ and $' + qq1 + '$', '$' + pp1 + '$ and $' + (-qq1) + '$', '$' + (-pp1) + '$ and $' + qq1 + '$']), steps: ['$x + ' + pp1 + ' = 0$ when $x = ' + (-pp1) + '$, and $x - ' + (-qq1) + ' = 0$ when $x = ' + (-qq1) + '$.', 'The zero has the opposite sign of the number in the factor: $(x - r)$ goes with $r$.'], hint: 'Solve each factor $= 0$.' };
    }
    if (shape === 'axis') {
      var hx = fr(p + q2, 2), kx = q(a).mul(hx.sub(p)).mul(hx.sub(q2));
      return out({ q: 'Find the vertex of $y = ' + ftex + '$.', a: tup([hx, kx]), steps: ['The zeros are $' + p + '$ and $' + q2 + '$. By symmetry, the axis of symmetry is halfway between them: $x = \\frac{' + p + ' + ' + tp(q2) + '}{2} = ' + tn(hx) + '$.', 'Substitute to find the height: $y = ' + (a === 1 ? '' : a === -1 ? '-' : tn(a)) + (p === 0 ? tp(hx) : '(' + tn(hx) + ' - ' + tp(p) + ')') + (q2 === 0 ? tp(hx) : '(' + tn(hx) + ' - ' + tp(q2) + ')') + ' = ' + tn(kx) + '$.', 'Vertex: $(' + tn(hx) + ', ' + tn(kx) + ')$.'], hint: 'The vertex is on the axis of symmetry, halfway between the zeros.' }, { k: 'tuple', v: [hx.toNumber(), kx.toNumber()], f: nf(a) + '*(x-(' + p + '))*(x-(' + q2 + '))' });
    }
    // write: zeros p, q and a point (or y-intercept)
    var A = R.pick([1, -1, 2, -2, 3]), x3 = R.intNot(-4, 4, [p, q2]), y3 = A * (x3 - p) * (x3 - q2);
    return out({ q: 'A parabola has zeros $' + p + '$ and $' + q2 + '$ and passes through $(' + x3 + ', ' + y3 + ')$. Write its equation in factored form.', a: { t: 'expr', v: (A === 1 ? '' : A === -1 ? '-' : A + '*') + (p === 0 ? 'x' : pfac(1, -p)) + pfac(1, -q2) }, steps: ['Zeros $' + p + '$ and $' + q2 + '$ mean factors $' + (p === 0 ? 'x' : tfac(1, -p)) + '$ and $' + tfac(1, -q2) + '$: $y = a' + (p === 0 ? 'x' : tfac(1, -p)) + tfac(1, -q2) + '$.', 'Use the point: $' + y3 + ' = a(' + x3 + ' - ' + tp(p) + ')(' + x3 + ' - ' + tp(q2) + ') = ' + (x3 - p) * (x3 - q2) + 'a$, so $a = ' + A + '$.', '$y = ' + (A === 1 ? '' : A === -1 ? '-' : A) + (p === 0 ? 'x' : tfac(1, -p)) + tfac(1, -q2) + '$.'], hint: 'Each zero $r$ gives a factor $(x - r)$. Use the extra point to find $a$.' }, { k: 'fn', expr: A + '*(x-(' + p + '))*(x-(' + q2 + '))' });
  });

  // ---- alg1.solve-square-roots
  G('alg1.solve-square-roots', function (R, ctx) {
    var shape = R.pick(by(ctx, ['plain', 'plain', 'shift'], ['shift', 'coef', 'surd'], ['surd', 'coef', 'none', 'shift']));
    var h = R.nz(-6, 6), r = R.int(1, 9), k, sols, steps, tex, eq;
    if (shape === 'plain') { k = r * r; tex = 'x^2 = ' + k; eq = 'x^2=' + k; sols = [String(r), String(-r)]; steps = ['Both $' + r + '$ and $-' + r + '$ square to $' + k + '$.', 'Take the square root of both sides, with $\\pm$: $x = \\pm\\sqrt{' + k + '} = \\pm ' + r + '$.']; }
    else if (shape === 'shift') { k = r * r; tex = '(' + tlin(1, -h) + ')^2 = ' + k; eq = '(x-(' + h + '))^2=' + k; sols = [String(h + r), String(h - r)]; steps = ['The square is already alone. Take square roots of both sides, with $\\pm$: $' + tlin(1, -h) + ' = \\pm ' + r + '$.', 'Two equations: $' + tlin(1, -h) + ' = ' + r + '$ gives $x = ' + (h + r) + '$; $' + tlin(1, -h) + ' = -' + r + '$ gives $x = ' + (h - r) + '$.']; }
    else if (shape === 'coef') { var a = R.pick([2, 3, 4, 5]), c = R.int(-9, 9); k = r * r; var rhs = a * k + c; tex = T.coef(a, '(' + tlin(1, -h) + ')^2') + T.signed(c) + ' = ' + rhs; eq = a + '*(x-(' + h + '))^2+(' + c + ')=' + rhs; sols = [String(h + r), String(h - r)]; steps = ['Isolate the square first. ' + (c ? undo(c) + ': $' + a + '(' + tlin(1, -h) + ')^2 = ' + a * k + '$. ' : '') + 'Divide by $' + a + '$: $(' + tlin(1, -h) + ')^2 = ' + k + '$.', 'Square roots with $\\pm$: $' + tlin(1, -h) + ' = \\pm ' + r + '$, so $x = ' + h + ' \\pm ' + r + '$.', 'Solutions: $x = ' + (h + r) + '$ and $x = ' + (h - r) + '$.']; }
    else if (shape === 'surd') { var n = R.pick([2, 3, 5, 6, 7, 8, 12, 18, 20, 27, 50]); tex = '(' + tlin(1, -h) + ')^2 = ' + n; eq = '(x-(' + h + '))^2=' + n; var sp = surdPlain(1, n), stex = T.sqrt(n); sols = [h + '+' + sp, h + '-' + sp]; steps = ['Square roots of both sides, with $\\pm$: $' + tlin(1, -h) + ' = \\pm\\sqrt{' + n + '}' + (stex !== '\\sqrt{' + n + '}' ? ' = \\pm ' + stex : '') + '$.', (h > 0 ? 'Add $' + h + '$' : 'Subtract $' + (-h) + '$') + ': $x = ' + h + ' \\pm ' + stex + '$.', 'These are two exact solutions; as decimals they are about $' + nf(U.round(h + Math.sqrt(n), 2)) + '$ and $' + nf(U.round(h - Math.sqrt(n), 2)) + '$.']; }
    else { var c2 = R.int(1, 9), rhs2 = R.int(-5, c2 - 1); tex = '(' + tlin(1, -h) + ')^2 + ' + c2 + ' = ' + rhs2; eq = '(x-(' + h + '))^2+' + c2 + '=' + rhs2; sols = []; steps = ['Isolate the square: $(' + tlin(1, -h) + ')^2 = ' + (rhs2 - c2) + '$.', 'A square of a real number is never negative, so it cannot equal $' + (rhs2 - c2) + '$. There is no real solution.']; }
    return out({ q: 'Solve: $' + tex + '$', a: setA(sols), steps: steps, hint: 'Get the square alone, then take the square root of both sides. Remember $\\pm$.' }, { k: 'roots', eq: eq });
  });

  // ---- alg1.completing-the-square
  G('alg1.completing-the-square', function (R, ctx) {
    var shape = R.pick(by(ctx, ['number', 'solve', 'number'], ['solve', 'vertex', 'number'], ['solve', 'solvea', 'vertex', 'odd']));
    if (shape === 'number' || shape === 'odd') {
      var b = shape === 'odd' ? R.pick([1, 3, 5, 7, -3, -5]) : 2 * R.nz(-7, 7), sq = fr(b * b, 4);
      return out({ q: 'What number must be added to $' + ptex([1, b, 0]).replace(/ \+ 0$/, '') + '$ to make a perfect square trinomial?', a: num(sq), steps: ['Half of the $x$ coefficient: $\\frac{' + b + '}{2} = ' + tn(fr(b, 2)) + '$.', 'Square it: $\\left(' + tn(fr(b, 2)) + '\\right)^2 = ' + tn(sq) + '$. That is the missing corner of the square in the area picture.', 'Check: $x^2 ' + (b < 0 ? '-' : '+') + ' ' + tn(Math.abs(b)).replace(/^1$/, '') + 'x + ' + tn(sq) + ' = \\left(x ' + (b < 0 ? '-' : '+') + ' ' + tn(fr(Math.abs(b), 2)) + '\\right)^2$.'], hint: 'Take half of the coefficient of $x$, then square it.' }, { k: 'num', v: b * b / 4 });
    }
    if (shape === 'vertex') {
      var h2 = R.nz(-6, 6), k2 = R.int(-9, 9), bb = -2 * h2, cc = h2 * h2 + k2;
      return out({ q: 'Write $y = ' + ptex([1, bb, cc]) + '$ in vertex form by completing the square.', a: { t: 'expr', v: vplain(1, h2, k2) }, steps: ['Half of $' + bb + '$ is $' + (-h2) + '$, and $(' + (-h2) + ')^2 = ' + h2 * h2 + '$.', 'Add and subtract $' + h2 * h2 + '$: $y = (' + ptex([1, bb, h2 * h2]) + ')' + T.signed(cc - h2 * h2) + '$. Adding and subtracting the same number changes nothing.', 'The group is a perfect square: $y = (' + tlin(1, -h2) + ')^2' + T.signed(k2) + '$.', 'So the vertex is $(' + h2 + ', ' + k2 + ')$.'], hint: 'Add and subtract $\\left(\\frac{b}{2}\\right)^2$ to build a perfect square.' }, { k: 'fn', expr: ppoly([1, bb, cc]) });
    }
    var a = shape === 'solvea' ? R.pick([2, 3]) : 1, h = R.nz(-5, 5), m = R.pick(by(ctx, [1, 4, 9, 16], [2, 3, 5, 6, 7, 9, 10, 12], [2, 3, 5, 7, 8, 11, 13, 18]));
    // (x - h)^2 = m  ->  x^2 - 2h x + h^2 - m = 0 ; multiplied by a
    var B = -2 * h, C = h * h - m, cs = [a * 1, a * B, a * C];
    var sp = surdPlain(1, m), st = T.sqrt(m), isInt = U.isSquare(m), sols = isInt ? [h + Math.sqrt(m), h - Math.sqrt(m)] : [h + '+' + sp, h + '-' + sp];
    var steps = [];
    if (a > 1) steps.push('Divide every term by $' + a + '$ so the $x^2$ coefficient is $1$: $' + ptex([1, B, C]) + ' = 0$.');
    steps.push('Move the constant to the right: $' + ptex([1, B, 0]).replace(/ \+ 0$/, '') + ' = ' + (-C) + '$.');
    steps.push('Half of $' + B + '$ is $' + (-h) + '$; its square is $' + h * h + '$. Add $' + h * h + '$ to <em>both</em> sides: $' + ptex([1, B, h * h]) + ' = ' + (-C + h * h) + '$.');
    steps.push('The left side is a perfect square: $(' + tlin(1, -h) + ')^2 = ' + m + '$.');
    steps.push('Square roots: $' + tlin(1, -h) + ' = \\pm ' + st + '$, so $x = ' + h + ' \\pm ' + st + '$' + (isInt ? ': $x = ' + (h + Math.sqrt(m)) + '$ or $x = ' + (h - Math.sqrt(m)) + '$.' : '.'));
    return out({ q: 'Solve by completing the square: $' + ptex(cs) + ' = 0$', a: setA(sols), steps: steps, hint: (a > 1 ? 'Divide by ' + a + ' first. ' : '') + 'Move the constant, then add $\\left(\\frac{b}{2}\\right)^2$ to both sides.' }, { k: 'roots', eq: ppoly(cs) + '=0' });
  });

  // ---- alg1.quadratic-formula
  G('alg1.quadratic-formula', function (R, ctx) {
    var r = retry(function () {
      var a = R.pick(by(ctx, [1, 1, 2], [1, 2, 3, -1], [2, 3, 4, -2, 5])), b = R.int(-9, 9), c = R.nz(-9, 9);
      var qr = quadRoots(a, b, c);
      if (qr.n < 2) return null;
      if (ctx.level === 1 && !qr.rational && R.chance(0.5)) return null;
      return [a, b, c, qr];
    }, 400);
    var a = r[0], b = r[1], c = r[2], qr = r[3], D = qr.D;
    var steps = ['Read the coefficients: $a = ' + a + '$, $b = ' + b + '$, $c = ' + c + '$.',
      'Discriminant: $b^2 - 4ac = ' + tp(b) + '^2 - 4 \\cdot ' + tp(a) + ' \\cdot ' + tp(c) + ' = ' + b * b + T.signed(-4 * a * c) + ' = ' + D + '$.',
      'Formula: $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\dfrac{' + (-b) + ' \\pm \\sqrt{' + D + '}}{' + 2 * a + '}$.'];
    if (qr.rational) steps.push('$\\sqrt{' + D + '} = ' + Math.sqrt(D) + '$, so $x = \\frac{' + (-b) + ' + ' + Math.sqrt(D) + '}{' + 2 * a + '} = ' + qr.tex[1] + '$ or $x = \\frac{' + (-b) + ' - ' + Math.sqrt(D) + '}{' + 2 * a + '} = ' + qr.tex[0] + '$.');
    else steps.push((T.sqrt(D) === '\\sqrt{' + D + '}' ? '$\\sqrt{' + D + '}$ does not simplify' : 'Simplify: $\\sqrt{' + D + '} = ' + T.sqrt(D) + '$') + (qr.pm.indexOf(String(2 * a)) >= 0 || (a === 1 && qr.pm.indexOf('frac') < 0) ? '' : ', then divide out the common factor') + ': $x = ' + qr.pm + '$.');
    var moved = ctx.level === 3 && R.chance(0.4) && b !== 0;
    if (moved) steps.unshift('First write it in standard form, with $0$ on one side: $' + ptex([a, b, c]) + ' = 0$.');
    return out({ q: 'Solve with the quadratic formula: $' + (moved ? T.mono(a, 'x^2') + ' = ' + T.lin(-b, 'x', -c) : ptex([a, b, c]) + ' = 0') + '$', a: setA(qr.plain), steps: steps, hint: 'Identify $a$, $b$ and $c$ (with their signs), compute $b^2 - 4ac$ first, then use $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.' }, { k: 'roots', eq: ppoly([a, b, c]) + '=0' });
  });

  // ---- alg1.discriminant
  G('alg1.discriminant', function (R, ctx) {
    var shape = R.pick(by(ctx, ['value', 'count', 'value'], ['count', 'value', 'graph'], ['count', 'graph', 'param']));
    var a = R.nz(-4, 5), b = R.int(-8, 8), c = R.int(-8, 8);
    if (R.chance(0.3)) { var t = R.nz(-4, 4); a = 1; b = 2 * t; c = t * t; } // a repeated root sometimes
    var D = b * b - 4 * a * c, n = D > 0 ? 2 : D === 0 ? 1 : 0;
    var dstep = '$b^2 - 4ac = ' + tp(b) + '^2 - 4 \\cdot ' + tp(a) + ' \\cdot ' + tp(c) + ' = ' + D + '$.';
    if (shape === 'value') return out({ q: 'Find the discriminant of $' + ptex([a, b, c]) + ' = 0$.', a: num(D), steps: ['$a = ' + a + '$, $b = ' + b + '$, $c = ' + c + '$.', dstep], hint: 'Discriminant $= b^2 - 4ac$. Square $b$ first (the square of a negative is positive).' }, { k: 'num', v: D });
    if (shape === 'count' || shape === 'graph') {
      var g = shape === 'graph';
      return out({ q: g ? 'How many times does the graph of $y = ' + ptex([a, b, c]) + '$ cross or touch the $x$-axis?' : 'How many real solutions does $' + ptex([a, b, c]) + ' = 0$ have?', a: num(n), steps: [dstep, D > 0 ? 'Positive: $\\pm\\sqrt{' + D + '}$ gives two different values, so two real solutions.' : D === 0 ? 'Zero: $\\pm\\sqrt{0}$ is just $0$, so the two solutions are the same: one real solution (the vertex touches the axis).' : 'Negative: the square root of a negative number is not real, so there are no real solutions. The parabola never meets the $x$-axis.'], hint: 'Compute $b^2 - 4ac$ and look at its sign.' }, { k: 'num', v: n });
    }
    // param: for which c does x^2 + bx + c = 0 have exactly one solution?
    var bb = 2 * R.nz(-6, 6);
    return out({ q: 'For what value of $c$ does $' + ptex([1, bb, 0]).replace(/ \+ 0$/, '') + ' + c = 0$ have exactly one real solution?', a: num(bb * bb / 4), steps: ['Exactly one solution means the discriminant is $0$: $' + tp(bb) + '^2 - 4(1)c = 0$.', '$' + bb * bb + ' - 4c = 0$, so $c = ' + bb * bb / 4 + '$.', 'Check: $' + ptex([1, bb, bb * bb / 4]) + ' = (' + tlin(1, bb / 2) + ')^2$, a perfect square with one root.'], hint: 'Set $b^2 - 4ac = 0$ and solve for $c$.' }, { k: 'num', v: bb * bb / 4 });
  });

  // ---- alg1.quadratic-models
  G('alg1.quadratic-models', function (R, ctx) {
    var shape = R.pick(by(ctx, ['land', 'max', 'land', 'revenue'], ['land', 'max', 'area', 'height', 'revenue'], ['area', 'height', 'land', 'max', 'revenue']));
    if (shape === 'revenue') {
      var kk = R.pick([2, 4, 5, 10]), ps = R.int(5, 30), N = 2 * kk * ps, Rmax = kk * ps * ps, item = R.pick(['T-shirts', 'concert tickets', 'phone cases', 'pizzas', 'plants']);
      return out({ q: 'A shop finds that at a price of $p$ dollars it sells $' + N + ' - ' + kk + 'p$ ' + item + ' a day. What price gives the greatest daily revenue, and what is that revenue?', a: { t: 'multi', parts: [{ label: 'Price (dollars):', a: num(ps) }, { label: 'Revenue (dollars):', a: num(Rmax) }] }, steps: ['Revenue is price times number sold: $R(p) = p(' + N + ' - ' + kk + 'p) = -' + kk + 'p^2 + ' + N + 'p$, a parabola opening down.', 'Its zeros are $p = 0$ and $p = ' + N / kk + '$ (no sales). The vertex is halfway: $p = ' + ps + '$.', '$R(' + ps + ') = ' + ps + '(' + N + ' - ' + kk * ps + ') = ' + ps + ' \\cdot ' + (N - kk * ps) + ' = ' + Rmax + '$ dollars.'], hint: 'Write revenue = price $\\times$ quantity, then find the vertex.' }, { k: 'multi', parts: [{ k: 'num', v: ps }, { k: 'num', v: Rmax }] });
    }
    if (shape === 'area') {
      var L = 4 * R.int(8, 60), w = L / 4, A = w * (L - 2 * w);
      return out({ q: 'A farmer has $' + L + '$ meters of fence to make a rectangular pen against a long wall, so only three sides need fence. What is the largest area the pen can have, in square meters?', a: num(A), unit: 'square meters', steps: ['Let $x$ be the length of each side touching the wall. The side parallel to the wall is $' + L + ' - 2x$.', 'Area: $A(x) = x(' + L + ' - 2x) = -2x^2 + ' + L + 'x$, a parabola that opens down, so its vertex is the maximum.', 'The zeros are $x = 0$ and $x = ' + L / 2 + '$; the vertex is halfway: $x = ' + w + '$.', '$A(' + w + ') = ' + w + '(' + L + ' - ' + 2 * w + ') = ' + w + ' \\cdot ' + (L - 2 * w) + ' = ' + A + '$ square meters.'], hint: 'Write the area as a function of one side, then find the vertex.' }, { k: 'num', v: A });
    }
    var ft = R.coin(), g = ft ? 16 : 5, r1 = -R.int(1, ft ? 2 : 3), r2 = R.int(2, ft ? 5 : 6);
    if (shape === 'max') r1 = 0;
    if (shape === 'height') { r1 = R.pick([-1, 0]); r2 = r1 === 0 ? R.int(3, 5) : R.int(4, 5); }
    // h(t) = -g (t - r1)(t - r2) = -g t^2 + g(r1 + r2) t - g r1 r2
    var v = g * (r1 + r2), h0 = -g * r1 * r2, tv = fr(r1 + r2, 2), hmax = q(-g).mul(tv.sub(r1)).mul(tv.sub(r2));
    var hTex = T.lin(-g, 't^2', 0) + T.coef(v, 't', false) + T.signed(h0), un = ft ? 'feet' : 'meters';
    var obj = R.pick(['ball', 'stone', 'water balloon', 'toy rocket', 'beanbag']);
    var desc = 'A ' + obj + ' is ' + (h0 ? 'launched upward from a height of $' + h0 + '$ ' + un : 'launched straight up from the ground') + '. Its height after $t$ seconds is $h(t) = ' + hTex + '$ ' + un + '.';
    if (shape === 'land') return out({ q: desc + ' After how many seconds does it land on the ground?', a: num(r2), unit: 'seconds', steps: ['The ' + obj + ' reaches the ground when $h(t) = 0$: $' + hTex + ' = 0$.', 'Divide by $' + (-g) + '$: $' + ptex([1, -(r1 + r2), r1 * r2], 't') + ' = 0$, which factors as $' + (r1 === 0 ? 't' : '(' + tlin(1, -r1, 't') + ')') + '(' + tlin(1, -r2, 't') + ') = 0$.', 'So $t = ' + r1 + '$ or $t = ' + r2 + '$. ' + (r1 < 0 ? 'A negative time is before the throw, so it does not fit the story.' : '$t = 0$ is the moment it is kicked.'), 'It lands after $' + r2 + '$ seconds.'], hint: 'Set the height equal to $0$ and solve. Keep only the answer that makes sense.' }, { k: 'num', v: r2 });
    if (shape === 'max') return out({ q: desc + ' What is its maximum height, in ' + un + '?', a: num(hmax), unit: un, steps: ['The graph is a parabola opening down, so the maximum is at the vertex.', 'It is on the ground at $t = ' + r1 + '$ and $t = ' + r2 + '$, so by symmetry the vertex is halfway: $t = ' + tn(tv) + '$.', '$h(' + tn(tv) + ') = ' + tn(hmax) + '$ ' + un + '.'], hint: 'Find the time halfway between the zeros, then the height at that time.' }, { k: 'num', v: hmax.toNumber() });
    var Hq = q(-g).mul(1 - r1).mul(1 - r2), t1 = 1, t2 = r1 + r2 - 1;
    return out({ q: desc + ' At what times is the ' + obj + ' at a height of $' + tn(Hq) + '$ ' + un + '? Give every time that fits the story.', a: setA(t1 === t2 ? [t1] : [t1, t2]), steps: ['Set $h(t) = ' + tn(Hq) + '$: $' + hTex + ' = ' + tn(Hq) + '$.', 'Move everything to one side and divide by $' + (-g) + '$: $' + ptex([1, -(r1 + r2), r1 * r2 + Hq.toNumber() / g], 't') + ' = 0$.', 'Factor: $(' + tlin(1, -t1, 't') + ')(' + tlin(1, -t2, 't') + ') = 0$, so $t = ' + t1 + '$ or $t = ' + t2 + '$.', 'Both are positive: once on the way up and once on the way down.'], hint: 'Set the height equal to the value, make one side zero, and factor.' }, { k: 'roots', eq: ppoly([-g, v, h0], 't') + '=' + pq(Hq), v: 't', lo: 0, hi: 20 });
  });

  // ---- alg1.linear-quadratic-systems
  G('alg1.linear-quadratic-systems', function (R, ctx) {
    var r = (function () { var x1 = R.int(-5, 3), x2 = x1 + R.int(1, 6), c = R.int(-6, 6), m = R.int(-4, 4), b = m - (x1 + x2), k = c - x1 * x2; return [x1, x2, b, c, m, k]; })();
    var x1 = r[0], x2 = r[1], b = r[2], c = r[3], m = r[4], k = r[5];
    var y1 = m * x1 + k, y2 = m * x2 + k;
    var qTex = ptex([1, b, c]), lTex = T.lin(m, 'x', k);
    return out({ q: 'Find the points where the parabola $y = ' + qTex + '$ and the line $y = ' + lTex + '$ meet.', a: { t: 'multi', parts: [{ label: 'The point with the smaller $x$:', a: tup([x1, y1]) }, { label: 'The point with the larger $x$:', a: tup([x2, y2]) }] }, steps: ['At a meeting point both equations give the same $y$, so set them equal: $' + qTex + ' = ' + lTex + '$.', 'Move everything to the left: $' + ptex([1, b - m, c - k]) + ' = 0$.', 'Factor: $(' + tlin(1, -x1) + ')(' + tlin(1, -x2) + ') = 0$, so $x = ' + x1 + '$ or $x = ' + x2 + '$.', 'Find each $y$ from the line (it is simpler): $y = ' + tsub(m, x1, k) + ' = ' + y1 + '$ and $y = ' + tsub(m, x2, k) + ' = ' + y2 + '$.', 'Check in the parabola too. The points are $(' + x1 + ', ' + y1 + ')$ and $(' + x2 + ', ' + y2 + ')$.'], hint: 'Set the two expressions for $y$ equal, solve for $x$, then find each $y$.' }, { k: 'multi', parts: [{ k: 'sys', eqs: ['y=' + ppoly([1, b, c]), 'y=' + plin(m, k)] }, { k: 'sys', eqs: ['y=' + ppoly([1, b, c]), 'y=' + plin(m, k)] }] });
  });

  // ---- alg1.graph-intersections
  G('alg1.graph-intersections', function (R, ctx) {
    var shape = R.pick(by(ctx, ['quad', 'abs'], ['quad', 'abs', 'table', 'exp'], ['exp', 'quad', 'table']));
    if (shape === 'table') {
      var xs = [-2, -1, 0, 1, 2, 3, 4], m = R.nz(-3, 3), b = R.int(-3, 3), x0 = R.pick(xs.slice(1, -1));
      var fv = xs.map(function (x) { return m * x + b; }), gv = xs.map(function (x, i) { return x === x0 ? fv[i] : fv[i] + (x < x0 ? -1 : 1) * R.int(1, 3) * (m > 0 ? -1 : 1); });
      var tab = '$$\\begin{array}{c|' + xs.map(function () { return 'c'; }).join('') + '} x & ' + xs.join(' & ') + ' \\\\ \\hline f(x) & ' + fv.join(' & ') + ' \\\\ g(x) & ' + gv.join(' & ') + ' \\end{array}$$';
      var sols = xs.filter(function (x, i) { return fv[i] === gv[i]; });
      return out({ q: 'Use the table to solve $f(x) = g(x)$.' + tab, a: setA(sols), steps: ['$f(x) = g(x)$ asks for inputs where the two outputs are equal. Compare the two rows column by column.', 'They match at $x = ' + sols.join('$ and $x = ') + '$' + (sols.length === 1 ? ', where both equal $' + fv[xs.indexOf(sols[0])] + '$.' : '.'), 'The answer is the $x$-value, not the shared output.'], hint: 'Find the column where both rows show the same number.' }, null);
    }
    var f, g, sols2, fstr, gstr, ftex, gtex;
    if (shape === 'quad') {
      var p = R.int(-4, 1), q2 = p + R.int(1, 5), mm = R.int(-2, 2), kk = R.int(-3, 3);
      // x^2 + bx + c - (m x + k) = (x - p)(x - q)  ->  b = m - (p+q), c = k + pq
      var bq = mm - (p + q2), cq = kk + p * q2;
      fstr = ppoly([1, bq, cq]); gstr = plin(mm, kk); ftex = ptex([1, bq, cq]); gtex = T.lin(mm, 'x', kk); sols2 = [p, q2];
    } else if (shape === 'abs') {
      var h = R.int(-3, 3), kv = R.int(-4, 1), d = R.int(1, 4), lev = kv + d;
      fstr = pabs(1, h, kv); gstr = String(lev); ftex = T.abs(tlin(1, -h)) + T.signed(kv); gtex = String(lev); sols2 = [h - d, h + d];
    } else {
      fstr = '2^x'; gstr = 'x+1'; ftex = '2^x'; gtex = 'x + 1'; sols2 = [0, 1];
      if (R.coin()) { gstr = '2x'; gtex = '2x'; sols2 = [1, 2]; }
    }
    return out({ q: 'The graphs of $f(x) = ' + ftex + '$ and $g(x) = ' + gtex + '$ are shown. Use them to solve $f(x) = g(x)$.', viz: { name: 'graph', opts: { fns: [fstr, gstr], xmin: -7, xmax: 7, ymin: -6, ymax: 10, zoom: false } }, a: setA(sols2), steps: ['The solutions of $f(x) = g(x)$ are the $x$-coordinates of the points where the graphs cross.', 'The graphs cross at $x = ' + sols2[0] + '$ and $x = ' + sols2[1] + '$.', 'Check: $f(' + sols2[0] + ')$ and $g(' + sols2[0] + ')$ are equal, and so are $f(' + sols2[1] + ')$ and $g(' + sols2[1] + ')$.'], hint: 'Find where the curves meet and read the $x$-coordinates.' }, { k: 'roots', eq: fstr + '=' + gstr, lo: -8, hi: 8 });
  });

  // ---- alg1.compare-function-families
  G('alg1.compare-function-families', function (R, ctx) {
    var shape = R.pick(by(ctx, ['table', 'table', 'story'], ['table', 'eventually', 'story'], ['table', 'eventually', 'story']));
    if (shape === 'table') {
      var kind = R.pick(['lin', 'quad', 'exp']), xs = [0, 1, 2, 3, 4], ys;
      var s0 = R.int(1, 6);
      if (kind === 'lin') { var d = R.nz(-5, 7); ys = xs.map(function (x) { return s0 + d * x; }); }
      else if (kind === 'quad') { var a = R.pick([1, 2, -1, 3]), b = R.int(-3, 3); ys = xs.map(function (x) { return a * x * x + b * x + s0; }); }
      else { var r = R.pick([2, 3]); ys = xs.map(function (x) { return s0 * Math.pow(r, x); }); }
      var d1 = ys.slice(1).map(function (y, i) { return y - ys[i]; }), d2 = d1.slice(1).map(function (y, i) { return y - d1[i]; });
      var nonzero = ys.every(function (y) { return y !== 0; });
      var rat = nonzero ? ys.slice(1).map(function (y, i) { return fr(y, ys[i]); }) : null;
      var ch = ['Linear', 'Quadratic', 'Exponential'], v = { lin: 0, quad: 1, exp: 2 }[kind];
      return { q: 'Which kind of function fits the table: linear, quadratic or exponential?' + tabTex(xs, ys), a: { t: 'mc', choices: ch, v: v, keep: true }, steps: ['First differences: ' + mlist(d1) + '.', 'Second differences (differences of the differences): ' + mlist(d2) + '.'].concat(rat ? ['Ratios: ' + mlist(rat) + '.'] : []).concat([kind === 'lin' ? 'The first differences are constant: linear.' : kind === 'quad' ? 'The first differences change, but the second differences are constant: quadratic.' : 'The ratios are constant: exponential (the differences themselves grow by the same factor).']), hint: 'Constant first differences: linear. Constant second differences: quadratic. Constant ratios: exponential.' };
    }
    if (shape === 'eventually') {
      return { q: 'For large values of $x$, which of these is greatest: $f(x) = 100x^2$, $g(x) = 1000x$, or $h(x) = 1.1^x$?', a: mc('$h(x) = 1.1^x$', ['$f(x) = 100x^2$', '$g(x) = 1000x$', 'They stay about equal']), steps: ['For small $x$, $g$ and $f$ are much bigger than $h$: at $x = 10$, $h(10) \\approx 2.6$.', 'But an exponential function with base greater than $1$ multiplies by the same factor every step, and that eventually beats any polynomial.', 'Around $x = 100$, $1.1^{100} \\approx 13{,}781$ is still smaller than $100 \\cdot 100^2 = 1{,}000{,}000$, but at $x = 200$, $1.1^{200} \\approx 190{,}000{,}000$ passes $100 \\cdot 200^2 = 4{,}000{,}000$, and the gap keeps growing.'], hint: 'Think about the long run: equal steps add (linear), add a growing amount (quadratic), or multiply (exponential).' };
    }
    var S = R.pick([
      ['A savings account grows by $4\\%$ each year.', 2, 'The amount is multiplied by $1.04$ each year: equal ratios.'],
      ['A gym charges $\\$40$ to join and $\\$25$ per month.', 0, 'The total adds $\\$25$ each month: equal differences.'],
      ['The height of a ball thrown upward, as a function of time.', 1, 'Gravity makes the height rise, peak, and fall: a parabola.'],
      ['The area of a square, as a function of its side length.', 1, 'Area is the side squared: $A = s^2$.'],
      ['A colony of bacteria that doubles every hour.', 2, 'Doubling is multiplying by $2$ each hour: exponential.'],
      ['A candle that burns $2$ cm per hour.', 0, 'The height drops by the same $2$ cm each hour: linear.'],
      ['The value of a car that loses $15\\%$ of its value each year.', 2, 'It keeps $85\\%$ each year: multiplying by $0.85$.']
    ]);
    return { q: 'Which kind of model fits best? ' + S[0], a: { t: 'mc', choices: ['Linear', 'Quadratic', 'Exponential'], v: S[1], keep: true }, steps: [S[2]], hint: 'Does the quantity add the same amount, multiply by the same factor, or rise and fall like a parabola?' };
  });


  // ================================================================ Unit 12: Data and Statistics
  function twoWayTex(rows, cols, data) {
    var tot = data.map(function (r) { return r.reduce(function (s, v) { return s + v; }, 0); });
    var colT = cols.map(function (_, j) { return data.reduce(function (s, r) { return s + r[j]; }, 0); }), G = tot.reduce(function (s, v) { return s + v; }, 0);
    return '$$\\begin{array}{l|' + cols.map(function () { return 'c'; }).join('') + '|c} & ' + cols.map(function (c) { return '\\text{' + c + '}'; }).join(' & ') + ' & \\text{Total} \\\\ \\hline ' +
      rows.map(function (r, i) { return '\\text{' + r + '} & ' + data[i].join(' & ') + ' & ' + tot[i]; }).join(' \\\\ ') + ' \\\\ \\hline \\text{Total} & ' + colT.join(' & ') + ' & ' + G + ' \\end{array}$$';
  }

  // ---- alg1.two-way-relative-frequency
  G('alg1.two-way-relative-frequency', function (R, ctx) {
    var S = R.pick([
      { rows: ['9th grade', '10th grade'], rn: ['9th graders', '10th graders'], cols: ['Soccer', 'Basketball'], pred: ['prefer soccer', 'prefer basketball'], who: 'students' },
      { rows: ['Adults', 'Teens'], rn: ['adults', 'teens'], cols: ['Morning', 'Evening'], pred: ['exercise in the morning', 'exercise in the evening'], who: 'people surveyed' },
      { rows: ['Dog owners', 'Cat owners'], rn: ['dog owners', 'cat owners'], cols: ['City', 'Country'], pred: ['live in the city', 'live in the country'], who: 'pet owners' },
      { rows: ['Juniors', 'Seniors'], rn: ['juniors', 'seniors'], cols: ['Bus', 'Car'], pred: ['ride the bus to school', 'come to school by car'], who: 'students' }
    ]);
    var tots = R.pick([[40, 60], [20, 80], [60, 40], [80, 120], [100, 100], [60, 140], [120, 80]]), p1 = 5 * R.int(3, 17), p2 = 5 * R.int(3, 17);
    var d = [[tots[0] * p1 / 100, tots[0] - tots[0] * p1 / 100], [tots[1] * p2 / 100, tots[1] - tots[1] * p2 / 100]];
    var G2 = tots[0] + tots[1], tab = twoWayTex(S.rows, S.cols, d);
    var shape = R.pick(by(ctx, ['row', 'row', 'joint'], ['row', 'col', 'joint', 'assoc'], ['col', 'assoc', 'row', 'joint']));
    var i = R.int(0, 1), j = R.int(0, 1), k = d[i][j];
    if (shape === 'row') {
      var pr = U.fix(k / tots[i] * 100);
      return out({ q: 'Use the table.' + tab + 'What percent of ' + S.rn[i] + ' ' + S.pred[j] + '?', a: num(pr, { pct: true }), steps: ['The question is only about ' + S.rn[i] + ', so the whole is that row\'s total, $' + tots[i] + '$, not the grand total.', 'Part: $' + k + '$. Percent: $\\frac{' + k + '}{' + tots[i] + '} = ' + tn(U.fix(k / tots[i])) + ' = ' + tn(pr) + '\\%$.'], hint: 'Divide by the total of the row the question is about.' }, { k: 'num', v: pr });
    }
    if (shape === 'joint') {
      var pj = U.fix(k / G2 * 100);
      return out({ q: 'Use the table.' + tab + 'What percent of <em>all</em> the ' + S.who + ' are ' + S.rn[i] + ' who ' + S.pred[j] + '?', a: num(pj, { pct: true }), steps: ['"Of all" means the whole is the grand total, $' + G2 + '$.', 'Part: the cell for ' + S.rn[i] + ' who ' + S.pred[j] + ', $' + k + '$.', '$\\frac{' + k + '}{' + G2 + '} = ' + tn(U.fix(k / G2)) + ' = ' + tn(pj) + '\\%$. This is a joint relative frequency.'], hint: 'For "of all", divide by the grand total.' }, { k: 'num', v: pj });
    }
    if (shape === 'col') {
      var ct = d[0][j] + d[1][j], pc = Math.round(k / ct * 100);
      return out({ q: 'Use the table.' + tab + 'Of the ' + S.who + ' who ' + S.pred[j] + ', what percent are ' + S.rn[i] + '? Round to the nearest whole percent.', a: num(pc, { pct: true, tol: 0.5 }), steps: ['Now the group is a <em>column</em>: all the ' + S.who + ' who ' + S.pred[j] + '. Its total is $' + d[0][j] + ' + ' + d[1][j] + ' = ' + ct + '$.', 'Part: $' + k + '$. $\\frac{' + k + '}{' + ct + '} \\approx ' + nf(U.round(k / ct, 4)) + '$, about $' + pc + '\\%$.', 'Notice this differs from the row percent: the whole you divide by depends on the wording "of the …".'], hint: 'The phrase after "of the" names the whole: here it is a column.' }, { k: 'num', v: pc, tol: 0.5 });
    }
    var q1 = U.fix(d[0][0] / tots[0] * 100), q2 = U.fix(d[1][0] / tots[1] * 100), assoc = Math.abs(q1 - q2) >= 20;
    var right = assoc ? 'Yes: ' + (q1 > q2 ? S.rn[0] : S.rn[1]) + ' are more likely to ' + S.pred[0] : 'No clear association: the percents are about the same';
    var wr = assoc ? ['No clear association: the percents are about the same', 'Yes: ' + (q1 > q2 ? S.rn[1] : S.rn[0]) + ' are more likely to ' + S.pred[0], 'You cannot tell, because the rows have different totals'] : ['Yes: ' + S.rn[0] + ' are more likely to ' + S.pred[0], 'Yes: ' + S.rn[1] + ' are more likely to ' + S.pred[0], 'You cannot tell, because the rows have different totals'];
    return { q: 'Use the table.' + tab + 'Is there an association between being in a group (' + S.rn[0] + ' or ' + S.rn[1] + ') and whether people ' + S.pred[0] + '?', a: mc(right, wr), steps: ['Compare row percents, because the rows have different totals and raw counts would mislead.', S.rows[0] + ': $\\frac{' + d[0][0] + '}{' + tots[0] + '} = ' + tn(q1) + '\\%$. ' + S.rows[1] + ': $\\frac{' + d[1][0] + '}{' + tots[1] + '} = ' + tn(q2) + '\\%$.', assoc ? 'A difference of $' + tn(Math.abs(q1 - q2)) + '$ percentage points is large, which suggests an association.' : 'The percents differ by only $' + tn(Math.abs(q1 - q2)) + '$ percentage points, so there is little sign of an association.'], hint: 'Turn each row into percents, then compare.' };
  });

  // ---- alg1.lines-of-fit-residuals
  G('alg1.lines-of-fit-residuals', function (R, ctx) {
    var shape = R.pick(by(ctx, ['resid', 'predict', 'resid'], ['resid', 'meaning', 'predict', 'pattern'], ['pattern', 'meaning', 'resid', 'better']));
    var m = R.pick([1.5, 2, 2.5, 3, 4, 0.5, -1.5, -2]), x = R.int(2, 12), b = m < 0 ? R.int(30, 60) : R.int(5, 40), yhat = U.fix(m * x + b), res = R.nz(-6, 6), y = U.fix(yhat + res);
    var ctxs = R.pick([['hours studied', 'test score'], ['temperature (°F)', 'drinks sold'], ['age of a tree (years)', 'height (ft)'], ['minutes of practice', 'free throws made']]);
    var line = '\\hat{y} = ' + T.lin(m, 'x', b);
    if (shape === 'resid') return out({ q: 'A line of fit for ' + ctxs[1] + ' ($y$) against ' + ctxs[0] + ' ($x$) is $' + line + '$. One data point is $(' + x + ', ' + tn(y) + ')$. What is its residual?', a: num(res), steps: ['Predicted value: $\\hat{y} = ' + tsub(m, x, b) + ' = ' + tn(yhat) + '$.', 'Residual $=$ actual $-$ predicted $= ' + tn(y) + ' - ' + tp(yhat) + ' = ' + res + '$.', res > 0 ? 'Positive: the point lies above the line; the line underestimates it.' : 'Negative: the point lies below the line; the line overestimates it.'], hint: 'Residual = actual − predicted.' }, { k: 'num', v: res });
    if (shape === 'predict') { var xp = R.int(2, 15); return out({ q: 'A line of fit for ' + ctxs[1] + ' against ' + ctxs[0] + ' is $' + line + '$. Predict $y$ when $x = ' + xp + '$.', a: num(U.fix(m * xp + b)), steps: ['Substitute: $\\hat{y} = ' + tsub(m, xp, b) + ' = ' + tn(U.fix(m * xp + b)) + '$.', 'This is a prediction from the model; real data points scatter around it.'], hint: 'Put the $x$-value into the equation of the line.' }, { k: 'num', v: m * xp + b }); }
    if (shape === 'meaning') {
      var pos = res > 0;
      return { q: 'A data point has residual $' + res + '$ from a line of fit. What does that mean?', a: mc(pos ? 'The point is ' + res + ' units above the line' : 'The point is ' + (-res) + ' units below the line', [pos ? 'The point is ' + res + ' units below the line' : 'The point is ' + (-res) + ' units above the line', 'The line is a poor fit for all the data', 'The slope of the line is ' + res]), steps: ['Residual $=$ actual $-$ predicted.', pos ? 'Positive means the actual value is bigger than predicted: the point sits above the line by $' + res + '$.' : 'Negative means the actual value is smaller than predicted: the point sits below the line by $' + (-res) + '$.'], hint: 'Actual minus predicted: is the actual value bigger or smaller?' };
    }
    if (shape === 'pattern') {
      var curved = R.coin(), rs = curved ? [-4, -1, 2, 3, 2, -1, -4].map(function (v) { return v * R.pick([1, 2]); }) : R.shuffle([-2, 1, 3, -1, 0, -3, 2]);
      return { q: 'The residuals of a line of fit, in order of $x$, are $' + rs.join(', ') + '$. What do they suggest?', a: mc(curved ? 'The data curve, so a nonlinear model may fit better' : 'The line is a reasonable fit; the residuals have no pattern', curved ? ['The line is a reasonable fit; the residuals have no pattern', 'The line fits perfectly', 'The slope should be steeper'] : ['The data curve, so a nonlinear model may fit better', 'The line fits perfectly', 'Every prediction is too high']), steps: ['A good linear fit leaves residuals scattered randomly above and below $0$, with no pattern.', curved ? 'These go negative, then positive, then negative again: a curved pattern. The line misses a bend in the data.' : 'These jump between positive and negative with no clear shape, so the line captures the trend.'], hint: 'Look for a pattern in the signs of the residuals.' };
    }
    var ra = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], rb = ra.map(function (v) { return v + R.pick([-3, 3, -4, 4]); });
    var sa = ra.reduce(function (s, v) { return s + v * v; }, 0), sb = rb.reduce(function (s, v) { return s + v * v; }, 0);
    if (sa === sb) rb[0] += 1, sb = rb.reduce(function (s, v) { return s + v * v; }, 0);
    var better = sa < sb ? 'A' : 'B';
    return out({ q: 'Two lines are fit to the same four points. Line A has residuals $' + ra.join(', ') + '$; line B has residuals $' + rb.join(', ') + '$. Find the sum of squared residuals for the better line (the smaller sum).', a: num(Math.min(sa, sb)), steps: ['Square each residual and add (squaring makes all of them positive and weighs big misses more).', 'Line A: $' + ra.map(function (v) { return tp(v) + '^2'; }).join(' + ') + ' = ' + sa + '$.', 'Line B: $' + rb.map(function (v) { return tp(v) + '^2'; }).join(' + ') + ' = ' + sb + '$.', 'Line ' + better + ' has the smaller sum, $' + Math.min(sa, sb) + '$, so it fits better. The least-squares line is the one that makes this sum as small as possible.'], hint: 'Square each residual, add them up for each line, and compare.' }, { k: 'num', v: Math.min(sa, sb) });
  });

  // ---- alg1.correlation-causation
  G('alg1.correlation-causation', function (R, ctx) {
    var shape = R.pick(by(ctx, ['estimate', 'cause', 'estimate'], ['estimate', 'cause', 'tf'], ['cause', 'estimate', 'tf']));
    if (shape === 'estimate') {
      var targets = [-0.9, -0.5, 0, 0.5, 0.9], tg = R.pick(targets), pts, r = 0;
      retry(function () {
        pts = []; var s = tg === 0 ? 0 : tg > 0 ? 1 : -1, noise = Math.abs(tg) > 0.8 ? 1.2 : Math.abs(tg) > 0.3 ? 4 : 6;
        for (var i = 0; i < 12; i++) { var x = U.fix(1 + i * 0.75 + R.real(-0.2, 0.2, 1)); pts.push([x, U.fix(10 + s * 1.2 * x + R.real(-noise, noise, 1))]); }
        var n = pts.length, mx = U.mean(pts.map(function (p) { return p[0]; })), my = U.mean(pts.map(function (p) { return p[1]; })), sxy = 0, sxx = 0, syy = 0;
        pts.forEach(function (p) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) * (p[0] - mx); syy += (p[1] - my) * (p[1] - my); });
        r = sxy / Math.sqrt(sxx * syy);
        return Math.abs(r - tg) < 0.12;
      }, 400);
      var lab = function (v) { return '$r = ' + tn(v) + '$'; };
      return { q: 'Which correlation coefficient best matches this scatter plot?', viz: { name: 'alg1-dots', opts: { points: pts, xlabel: 'x', ylabel: 'y' } }, a: mc(lab(tg), targets.filter(function (v) { return v !== tg; }).sort(function (a, b) { return Math.abs(a - tg) - Math.abs(b - tg); }).slice(0, 3).map(lab)), steps: ['The sign of $r$ is the direction: ' + (tg > 0 ? 'the points rise from left to right, so $r > 0$.' : tg < 0 ? 'the points fall from left to right, so $r < 0$.' : 'there is no upward or downward trend, so $r$ is near $0$.'), 'The size of $r$ is how tightly the points hug a line: near $\\pm 1$ is tight, near $\\pm 0.5$ is a loose cloud with a trend, near $0$ is no linear trend.', 'This plot fits $' + lab(tg).slice(1, -1) + '$ (computed from the data: $r \\approx ' + nf(U.round(r, 2)) + '$).'], hint: 'First the sign (up or down), then the strength (how close to a line).' };
    }
    if (shape === 'cause') {
      var C = R.pick([
        ['Ice cream sales and swimming accidents rise and fall together over a year.', 'Hot weather leads to both more ice cream and more swimming', ['Eating ice cream causes swimming accidents', 'Swimming accidents cause people to buy ice cream', 'The correlation must be a calculation error']],
        ['Towns with more firefighters at a fire tend to have more damage from that fire.', 'Bigger fires bring more firefighters and also cause more damage', ['Firefighters cause fire damage', 'Fire damage causes firefighters to arrive late', 'Sending fewer firefighters would reduce damage']],
        ['Students with bigger shoe sizes score higher on reading tests, across grades 1 to 8.', 'Older students have bigger feet and also read better', ['Bigger feet improve reading', 'Reading makes feet grow', 'Shoe size and reading are not related at all']],
        ['Cities with more libraries have more crime.', 'Larger cities have both more libraries and more crime', ['Libraries cause crime', 'Crime causes cities to build libraries', 'Closing libraries would reduce crime']]
      ]);
      return { q: C[0] + ' What is the best explanation?', a: mc(C[1], C[2]), steps: ['Correlation means the two variables move together. It does not show that one causes the other.', 'Here a third, lurking variable drives both: ' + C[1].charAt(0).toLowerCase() + C[1].slice(1) + '.', 'Only a controlled experiment, changing one variable on purpose, can show cause and effect.'], hint: 'Is there a third variable that could push both up at once?' };
    }
    var T2 = R.pick([
      ['A correlation coefficient of $r = -0.95$ shows a weak relationship.', false, 'No: $-0.95$ is close to $-1$, a strong negative linear relationship. The sign is the direction, not the strength.'],
      ['If $r = 0.9$ for two variables, then one must cause the other.', false, 'No: a strong correlation can come from a lurking variable or coincidence. Causation needs an experiment.'],
      ['A correlation coefficient is always between $-1$ and $1$.', true, 'Yes: $r = 1$ and $r = -1$ mean all points lie exactly on a line.'],
      ['$r = 0$ means there is no relationship of any kind between the variables.', false, 'No: $r$ measures only <em>linear</em> association. Points on a U-shaped curve can have $r$ near $0$.'],
      ['A strong correlation means the data fit a line closely.', true, 'Yes: $r$ near $\\pm 1$ means the points lie close to a line.']
    ]);
    return { q: 'True or false: ' + T2[0], a: tf(T2[1]), steps: [T2[2]], hint: 'Remember what $r$ measures: the direction and strength of a linear trend, and nothing about cause.' };
  });
})(window.MathLadder);
