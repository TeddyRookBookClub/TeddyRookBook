/* Math Ladder: problem generators for Grade 5 (static/math/gen/g5.js). Spec: /tmp/briefs/mathladder_spec.md, section 3.
   One generator per topic in data/math/topics/g5.json. Every answer is computed from the numbers drawn (exact rationals
   with ML.Q for fractions and decimals), and each generator is checked by an independent test in the builder's work dir.
   Levels: 1 is gentlest (learning), 2 for reviews, checkpoints and placement, 3 for later reviews.
   Visuals inside problems: g5-prisms, g5-lineplot, g5-grid and g5-fracarea come from static/math/viz/g5.js. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, Q = ML.Q, U = ML.util, by = ML.byLevel;
  var X = ' \\times ', DV = ' \\div ';
  function L(ctx) { return (ctx && ctx.level) || 1; }
  function num(v, form) { var a = { t: 'num', v: String(v) }; if (form) a.form = form; return a; }
  function q(n, d) { return d === undefined ? Q.from(n) : Q(n, d); }
  /* an exact decimal as a plain string: "4.75", "0.06", "1200" */
  function ds(x) {
    var r = Q.from(x); if (!r.isTerminating()) throw new Error('g5: not a terminating decimal: ' + r);
    var s = r.toDec(14); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  }
  function dt(x) { return T.commas(ds(x)); }          // decimal TeX with thousands commas
  function ft(x) { return Q.from(x).toTex(); }       // fraction TeX (improper allowed)
  function mt(x) { return Q.from(x).toMixedTex(); }  // mixed-number TeX
  function nc(n) { return T.commas(n); }
  function cash(x) { return T.money(ds(x)); }
  function pl(n, w, ws) { return n + ' ' + (n === 1 ? w : (ws || w + 's')); }
  var NAMES = ['Ava', 'Ben', 'Carla', 'Dev', 'Emi', 'Felix', 'Gia', 'Hugo', 'Isla', 'Jamal', 'Kai', 'Lena', 'Mateo', 'Nora', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sam', 'Tara', 'Uma', 'Victor', 'Wen', 'Yusuf', 'Zoe'];
  function who(R) { return R.pick(NAMES); }
  function two(R) { var s = R.sample(NAMES, 2); return s; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function keep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  /* "x" in lowest terms and as a mixed number when bigger than 1: "\frac{17}{12} = 1\frac{5}{12}" */
  function fm(x) { var r = Q.from(x); return r.d > 1n && r.abs().gt(1) ? r.toTex() + ' = ' + r.toMixedTex() : r.toTex(); }
  /* a fraction a/b written as given (not reduced) */
  function fr(a, b) { return '\\frac{' + a + '}{' + b + '}'; }
  /* a fraction in simplest form, with the simplifying step shown when needed */
  function simp(n, d) { var g = U.gcd(n, d); if (g === 1) return fr(n, d); var r = Q(n, d); return fr(n, d) + ' = ' + (r.d === 1n ? r.toString() : r.toTex()); }

  /* ---------------------------------------------------------------- whole-number expressions, step by step */
  var OPN = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
  var OPEN = { '(': ')', '[': ']', '{': '}' }, CLOSE = { ')': 1, ']': 1, '}': 1 };
  var GRP = { '(': 'parentheses', '[': 'brackets', '{': 'braces' };
  var TK = { '+': '+', '-': '-', '*': '\\times', '/': '\\div', '(': '(', ')': ')', '[': '[', ']': ']', '{': '\\{', '}': '\\}' };
  function etex(tk) {
    var s = '';
    tk.forEach(function (t, i) {
      var p = i ? tk[i - 1] : null, tight = i === 0 || OPEN[p] || CLOSE[t];
      s += (tight ? '' : ' ') + (typeof t === 'number' ? nc(t) : TK[t]);
    });
    return s;
  }
  function opStep(tk) {
    var c = -1, o = -1, i;
    for (i = 0; i < tk.length; i++) if (CLOSE[tk[i]]) { c = i; break; }
    if (c >= 0) for (i = c - 1; i >= 0; i--) if (OPEN[tk[i]]) { o = i; break; }
    var lo = c >= 0 ? o + 1 : 0, hi = c >= 0 ? c : tk.length, at = -1, more = false;
    for (i = lo; i < hi; i++) if (tk[i] === '*' || tk[i] === '/') { at = i; break; }
    for (i = lo; i < hi; i++) if (tk[i] === '+' || tk[i] === '-') more = true;
    if (at < 0) for (i = lo; i < hi; i++) if (tk[i] === '+' || tk[i] === '-') { at = i; break; }
    var a = tk[at - 1], b = tk[at + 1], op = tk[at], r = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
    var nt = tk.slice(0, at - 1).concat([r], tk.slice(at + 2)), ch = true;
    while (ch) { ch = false; for (i = 0; i + 2 < nt.length; i++) if (OPEN[nt[i]] && typeof nt[i + 1] === 'number' && nt[i + 2] === OPEN[nt[i]]) { nt.splice(i, 3, nt[i + 1]); ch = true; break; } }
    return { tk: nt, a: a, op: op, b: b, r: r, grp: c >= 0 ? tk[o] : null, mixed: more && (op === '*' || op === '/') };
  }
  function evalTk(tk) {
    var steps = [], ok = true;
    while (tk.length > 1) { var s = opStep(tk); if (!Number.isInteger(s.r) || s.r < 0) ok = false; steps.push(s); tk = s.tk; }
    return { v: tk[0], steps: steps, ok: ok };
  }
  function stepsOf(ev) {
    return ev.steps.map(function (s, i) {
      var last = i === ev.steps.length - 1, w = OPN[s.op], W = w[0].toUpperCase() + w.slice(1);
      var lead = s.grp ? 'Inside the ' + GRP[s.grp] + ', ' + w + ': ' :
        s.op === '*' || s.op === '/' ? (s.mixed ? W + ' before adding or subtracting: ' : W + ', working from left to right: ') :
          last ? 'Last, ' + w + ': ' : W + ', working from left to right: ';
      return lead + '$' + nc(s.a) + ' ' + TK[s.op] + ' ' + nc(s.b) + ' = ' + nc(s.r) + '$' + (last ? '.' : '. Now the expression is $' + etex(s.tk) + '$.');
    });
  }
  /* the first operation to do, as TeX "6 \div 3" */
  function firstOp(tk) { var s = opStep(tk); return nc(s.a) + ' ' + TK[s.op] + ' ' + nc(s.b); }
  /* left to right, ignoring the rules (the common mistake) */
  function leftToRight(tk) { var v = tk[0]; for (var i = 1; i < tk.length; i += 2) { var b = tk[i + 1], op = tk[i]; v = op === '+' ? v + b : op === '-' ? v - b : op === '*' ? v * b : v / b; } return v; }
  /* make expressions until one is valid (whole numbers, no negatives) */
  function make(R, fns, test) {
    for (var t = 0; t < 200; t++) { var tk = R.pick(fns)(R), ev = evalTk(tk.slice()); if (ev.ok && ev.v <= 999 && (!test || test(tk, ev))) return { tk: tk, ev: ev }; }
    throw new Error('g5: could not make an expression');
  }


  /* ================================================================ unit: expressions and patterns */

  // ---------------------------------------------------------------- g5.order-of-operations
  var OO1 = [
    function (R) { return [R.int(2, 20), '+', R.int(2, 9), '*', R.int(2, 9)]; },
    function (R) { return [R.int(2, 9), '*', R.int(2, 9), '+', R.int(2, 20)]; },
    function (R) { var b = R.int(2, 9), c = R.int(2, 9); return [b * c + R.int(2, 20), '-', b, '*', c]; },
    function (R) { var c = R.int(2, 9); return [R.int(2, 20), '+', c * R.int(2, 9), '/', c]; },
    function (R) { var c = R.int(2, 9), m = R.int(2, 9); return [m + R.int(2, 20), '-', c * m, '/', c]; },
    function (R) { var c = R.int(2, 9); return [c * R.int(2, 9), '/', c, '+', R.int(2, 20)]; }
  ];
  var OO2 = [
    function (R) { return [R.int(2, 20), '+', R.int(2, 9), '*', R.int(2, 9), '-', R.int(1, 15)]; },
    function (R) { return [R.int(3, 9), '*', R.int(3, 9), '-', R.int(2, 5), '*', R.int(2, 5)]; },
    function (R) { var c = R.int(2, 6), m = R.int(2, 5), d = R.int(2, 5); return [m * d + R.int(1, 20), '-', c * m, '/', c, '*', d]; },
    function (R) { var b = R.int(2, 9); return [b * R.int(2, 9), '/', b, '*', R.int(2, 9)]; },
    function (R) { var d = R.int(2, 6); return [R.int(2, 20), '+', R.int(2, 9), '*', d * R.int(1, 3), '/', d]; },
    function (R) { var a = R.int(10, 40); return [a, '-', R.int(2, a - 2), '+', R.int(2, 9), '*', R.int(2, 9)]; },
    function (R) { var c = R.int(2, 9), a = R.int(2, 9); return [a, '*', c * R.int(2, 6), '/', c, '+', R.int(2, 20)]; }
  ];
  var OO3 = [
    function (R) { return ['(', R.int(2, 12), '+', R.int(2, 12), ')', '*', R.int(2, 6), '-', R.int(1, 20)]; },
    function (R) { var e = R.int(2, 6), b = R.int(6, 12); return [R.int(2, 6), '*', '(', b, '-', R.int(1, b - 2), ')', '+', e * R.int(2, 9), '/', e]; },
    function (R) { var e = R.int(2, 6); return [R.int(20, 60), '+', R.int(2, 9), '*', R.int(2, 9), '-', e * R.int(2, 9), '/', e]; },
    function (R) { var b = R.int(2, 6); return [b * R.int(2, 9), '/', b, '*', R.int(2, 6), '-', R.int(1, 10), '+', R.int(2, 9)]; },
    function (R) { return [R.int(30, 90), '-', R.int(2, 6), '*', R.int(2, 6), '-', R.int(2, 6), '*', R.int(2, 5)]; }
  ];
  G('g5.order-of-operations', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['calc', 'spot', 'first'], [6, 2, lv === 3 ? 1 : 2]);
    if (shape === 'spot') {
      var m = make(R, OO1, function (tk) { var w = leftToRight(tk); return Number.isInteger(w) && w >= 0 && w !== evalTk(tk.slice()).v; });
      var wrong = leftToRight(m.tk), nm = who(R);
      return {
        q: nm + ' worked out $' + etex(m.tk) + '$ from left to right and got $' + nc(wrong) + '$. What is the correct value?',
        a: num(m.ev.v, 'int'),
        steps: ['Multiplying and dividing come before adding and subtracting, so ' + nm + '\'s way does not follow the order of operations.'].concat(stepsOf(m.ev)),
        hint: 'Find the multiplication or division and do it first.'
      };
    }
    if (shape === 'first') {
      var mm = make(R, lv === 1 ? OO1 : OO2, function (tk) { var ops = tk.filter(function (t) { return typeof t === 'string'; }); return ops.some(function (o) { return o === '+' || o === '-'; }) && ops.some(function (o) { return o === '*' || o === '/'; }); });
      var tk = mm.tk, right = firstOp(tk), wrongs = [];
      for (var i = 1; i < tk.length; i += 2) { var c = nc(tk[i - 1]) + ' ' + TK[tk[i]] + ' ' + nc(tk[i + 1]); if (c !== right) wrongs.push(c); }
      return {
        q: 'Which part of $' + etex(tk) + '$ do you work out first?',
        a: mc('$' + right + '$', wrongs.map(function (w) { return '$' + w + '$'; })),
        steps: ['Multiply and divide before you add or subtract. When there are several, go from left to right.', 'So the first step is $' + right + '$.'].concat(stepsOf(mm.ev)),
        hint: 'Look for $\\times$ or $\\div$, the leftmost one.'
      };
    }
    var e = make(R, by(ctx, OO1, OO2, OO3));
    return {
      q: 'Find the value of $' + etex(e.tk) + '$.',
      a: num(e.ev.v, 'int'),
      steps: stepsOf(e.ev),
      hint: e.tk.indexOf('(') >= 0 ? 'Parentheses first, then multiply and divide, then add and subtract.' : 'Multiply and divide first, from left to right. Then add and subtract.'
    };
  });

  // ---------------------------------------------------------------- g5.grouping-symbols
  var GS1 = [
    function (R) { return [R.int(2, 9), '*', '(', R.int(2, 12), '+', R.int(2, 12), ')']; },
    function (R) { return ['(', R.int(2, 12), '+', R.int(2, 12), ')', '*', R.int(2, 6), '-', R.int(1, 20)]; },
    function (R) { var b = R.int(8, 20); return [R.int(20, 40), '-', '(', b, '-', R.int(2, b - 2), ')']; },
    function (R) { var c = R.int(2, 6), d = c * R.int(2, 9), b = R.int(1, 15); return ['(', d + b, '-', b, ')', '/', c]; },
    function (R) { var b = R.int(6, 15); return [R.int(2, 6), '*', '(', b, '-', R.int(1, b - 2), ')', '+', R.int(2, 20)]; }
  ];
  var GS2 = [
    function (R) { var c = R.int(5, 12); return [R.int(2, 6), '*', '[', R.int(2, 12), '+', '(', c, '-', R.int(1, c - 1), ')', ']']; },
    function (R) { var d = R.int(2, 5); return ['[', R.int(1, 20), '+', '(', R.int(2, 6), '*', R.int(2, 6), ')', ']', '/', d]; },
    function (R) { var c = R.int(5, 12); return [R.int(2, 20), '+', '[', R.int(2, 6), '*', '(', c, '-', R.int(1, c - 1), ')', ']']; },
    function (R) { return ['[', '(', R.int(2, 9), '+', R.int(2, 9), ')', '*', R.int(2, 5), ']', '-', R.int(1, 20)]; },
    function (R) { var b = R.int(3, 8); return [R.int(40, 90), '-', '[', R.int(2, 5), '*', '(', b, '+', R.int(2, 8), ')', ']']; }
  ];
  var GS3 = [
    function (R) { var e = R.int(2, 5), c = R.int(4, 9); return ['{'.length ? '{' : '{', R.int(40, 90), '-', '[', R.int(2, 5), '*', '(', c, '-', R.int(1, c - 1), ')', ']', '}', '/', e]; },
    function (R) { return [R.int(2, 4), '*', '{', R.int(2, 9), '+', '[', R.int(2, 4), '*', '(', R.int(1, 6), '+', R.int(1, 6), ')', ']', '}']; },
    function (R) { var c = R.int(6, 12); return ['[', R.int(2, 9), '+', R.int(2, 9), ']', '*', '(', c, '-', R.int(1, c - 1), ')']; },
    function (R) { return [R.int(50, 99), '-', '{', R.int(2, 5), '*', '[', R.int(2, 9), '+', '(', R.int(2, 9), '-', R.int(1, 2), ')', ']', '}']; }
  ];
  /* four numbers, three operations: the ways to place one pair of parentheses */
  function placements(n, o) {
    return [
      [ '(', n[0], o[0], n[1], ')', o[1], n[2], o[2], n[3]],
      [n[0], o[0], '(', n[1], o[1], n[2], ')', o[2], n[3]],
      [n[0], o[0], n[1], o[1], '(', n[2], o[2], n[3], ')'],
      ['(', n[0], o[0], n[1], ')', o[1], '(', n[2], o[2], n[3], ')'],
      ['(', n[0], o[0], n[1], o[1], n[2], ')', o[2], n[3]],
      [n[0], o[0], '(', n[1], o[1], n[2], o[2], n[3], ')']
    ];
  }
  G('g5.grouping-symbols', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['calc', 'place', 'compare'], [6, lv === 1 ? 0 : 2, lv === 1 ? 1 : 2]);
    if (shape === 'place') {
      for (var t = 0; t < 300; t++) {
        var n = [R.int(2, 9), R.int(2, 9), R.int(2, 9), R.int(2, 9)];
        if (U.uniq(n).length < 3) continue;
        var o = R.pick([['+', '*', '-'], ['*', '+', '-'], ['-', '*', '+'], ['+', '*', '+'], ['*', '-', '+'], ['+', '-', '*']]);
        var ps = placements(n, o).map(function (tk) { var ev = evalTk(tk.slice()); return { tk: tk, ev: ev }; }).filter(function (p) { return p.ev.ok; });
        var plain = evalTk([n[0], o[0], n[1], o[1], n[2], o[2], n[3]]);
        var vals = {}; ps.forEach(function (p) { vals[p.ev.v] = (vals[p.ev.v] || 0) + 1; });
        var good = ps.filter(function (p) { return vals[p.ev.v] === 1 && p.ev.v !== plain.v; });
        if (!good.length || ps.length < 4) continue;
        var pick = R.pick(good), others = ps.filter(function (p) { return p !== pick && p.ev.v !== pick.ev.v; });
        if (others.length < 3) continue;
        others = R.sample(others, 3);
        return {
          q: 'Where do the parentheses go so that the value is $' + pick.ev.v + '$?',
          a: mc('$' + etex(pick.tk) + ' = ' + pick.ev.v + '$', others.map(function (p) { return '$' + etex(p.tk) + ' = ' + pick.ev.v + '$'; })),
          steps: ['Work out each choice, starting inside the parentheses.'].concat(stepsOf(pick.ev), others.map(function (p) { return 'The choice $' + etex(p.tk) + '$ has the value $' + p.ev.v + '$, not $' + pick.ev.v + '$.'; })),
          hint: 'Try each choice: do the part in parentheses first.'
        };
      }
    }
    if (shape === 'compare') {
      for (var u = 0; u < 200; u++) {
        var a = R.int(2, 9), b = R.int(3, 15), c = R.int(2, 9), op = R.pick(['+', '-']);
        if (op === '-' && c >= b) continue;
        var withP = [a, '*', '(', b, op, c, ')'], noP = [a, '*', b, op, c];
        var e1 = evalTk(withP.slice()), e2 = evalTk(noP.slice());
        if (!e1.ok || !e2.ok || e1.v === e2.v) continue;
        var big = e1.v > e2.v ? withP : noP, small = big === withP ? noP : withP, eb = big === withP ? e1 : e2, es = big === withP ? e2 : e1;
        return {
          q: 'How much greater is $' + etex(big) + '$ than $' + etex(small) + '$?',
          a: num(eb.v - es.v, 'int'),
          steps: ['Find each value. With parentheses, the sum or difference inside comes first.'].concat(stepsOf(eb), stepsOf(es), ['The difference is $' + eb.v + ' - ' + es.v + ' = ' + (eb.v - es.v) + '$.']),
          hint: 'Work out both expressions, then subtract.'
        };
      }
    }
    var e = make(R, by(ctx, GS1, GS2, GS3));
    return {
      q: 'Find the value of $' + etex(e.tk) + '$.',
      a: num(e.ev.v, 'int'),
      steps: stepsOf(e.ev),
      hint: 'Start with the innermost grouping symbols and work outward.'
    };
  });

  // ---------------------------------------------------------------- g5.write-numerical-expressions
  /* each phrase: words, the right expression (tokens) and expressions that people write by mistake */
  var PHR = [
    function (R) { var a = R.int(2, 9), b = R.int(2, 20), c = R.int(2, 20); return { w: a + ' times the sum of ' + b + ' and ' + c, tk: [a, '*', '(', b, '+', c, ')'], bad: [[a, '*', b, '+', c], [a, '+', b, '*', c], [a, '*', b, '*', c]] }; },
    function (R) { var a = R.int(2, 20), b = R.int(2, 20), c = R.int(2, 9); return { w: 'add ' + a + ' and ' + b + ', then multiply by ' + c, tk: ['(', a, '+', b, ')', '*', c], bad: [[a, '+', b, '*', c], [a, '*', b, '+', c], [a, '+', b, '+', c]] }; },
    function (R) { var a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 20); return { w: 'multiply ' + a + ' by ' + b + ', then add ' + c, tk: [a, '*', b, '+', c], bad: [[a, '*', '(', b, '+', c, ')'], [a, '+', b, '*', c], [a, '*', b, '-', c]] }; },
    function (R) { var c = R.int(2, 6), b = R.int(2, 15), a = b + c * R.int(2, 9); return { w: 'subtract ' + b + ' from ' + a + ', then divide by ' + c, tk: ['(', a, '-', b, ')', '/', c], bad: [[a, '-', b, '/', c], ['(', b, '-', a, ')', '/', c], ['(', a, '-', b, ')', '*', c]] }; },
    function (R) { var b = R.int(10, 30), c = R.int(2, b - 2); return { w: 'twice the difference of ' + b + ' and ' + c, tk: [2, '*', '(', b, '-', c, ')'], bad: [[2, '*', b, '-', c], [2, '+', '(', b, '-', c, ')'], [2, '*', '(', b, '+', c, ')']] }; },
    function (R) { var a = R.int(2, 9), b = R.int(2, 9), c = R.int(1, 20); return { w: 'the product of ' + a + ' and ' + b + ', minus ' + c, tk: [a, '*', b, '-', c], bad: [[a, '*', '(', b, '-', c, ')'], [a, '+', b, '-', c], [c, '-', a, '*', b]] }; },
    function (R) { var b = 2 * R.int(3, 15), a = 2 * R.int(1, 10); if (a === b) a += 2; return { w: 'half of the sum of ' + a + ' and ' + b, tk: ['(', a, '+', b, ')', '/', 2], bad: [[a, '+', b, '/', 2], ['(', a, '+', b, ')', '*', 2], [2, '/', '(', a, '+', b, ')']] }; },
    function (R) { var a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 20); return { w: c + ' more than the product of ' + a + ' and ' + b, tk: [a, '*', b, '+', c], bad: [[a, '*', '(', b, '+', c, ')'], [c, '+', a, '+', b], [a, '*', b, '-', c]] }; },
    function (R) { var b = R.int(2, 9), a = b * R.int(2, 9), c = R.int(2, 15); return { w: 'the quotient of ' + a + ' and ' + b + ', plus ' + c, tk: [a, '/', b, '+', c], bad: [[a, '/', '(', b, '+', c, ')'], [b, '/', a, '+', c], [a, '*', b, '+', c]] }; },
    function (R) { var a = R.int(2, 9), b = R.int(3, 9), c = R.int(1, Math.min(9, a * b - 1)); return { w: c + ' less than ' + a + ' times ' + b, tk: [a, '*', b, '-', c], bad: [[c, '-', a, '*', b], [a, '*', '(', b, '-', c, ')'], [a, '-', c, '*', b]] }; },
    function (R) { var c = R.int(2, 6), sm = c * R.int(4, 12), a = R.int(2, sm - 2), b = sm - a; return { w: 'divide the sum of ' + a + ' and ' + b + ' by ' + c, tk: ['(', a, '+', b, ')', '/', c], bad: [[a, '+', b, '/', c], [c, '/', '(', a, '+', b, ')'], ['(', a, '+', b, ')', '*', c]] }; },
    function (R) { var a = R.int(2, 6), b = R.int(8, 16), c = R.int(2, b - 3), d = R.int(1, 9); return { w: a + ' times the difference of ' + b + ' and ' + c + ', plus ' + d, tk: [a, '*', '(', b, '-', c, ')', '+', d], bad: [[a, '*', b, '-', c, '+', d], [a, '*', '(', b, '-', c, '+', d, ')'], [a, '+', '(', b, '-', c, ')', '*', d]] }; }
  ];
  /* words for an expression in the same style (for the reverse question) */
  G('g5.write-numerical-expressions', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['pick', 'value', 'times'], [5, lv === 1 ? 3 : 2, lv === 1 ? 1 : 2]);
    if (shape === 'times') {
      var a = R.int(1000, 9000) + R.int(0, 99), b = R.int(100, 999), k = R.int(2, 9), kind = lv === 3 ? R.pick(['times', 'half', 'tenth']) : 'times';
      var inner = nc(a) + ' + ' + nc(b);
      if (kind === 'times') return {
        q: 'Without calculating, how many times as large is $' + k + X + '(' + inner + ')$ as $' + inner + '$?',
        a: num(k, 'int'),
        steps: ['The parentheses make $' + inner + '$ one amount.', '$' + k + X + '(' + inner + ')$ is ' + k + ' groups of that amount.', 'So it is ' + k + ' times as large.'],
        hint: 'Think of the sum in parentheses as one number.'
      };
      var dd = kind === 'half' ? 2 : 10;
      return {
        q: 'Without calculating: $(' + inner + ')' + DV + dd + '$ is what fraction of $' + inner + '$?',
        a: num('1/' + dd),
        steps: ['The parentheses make $' + inner + '$ one amount.', 'Dividing that amount by ' + dd + ' makes ' + dd + ' equal parts and keeps one.', 'So it is $\\frac{1}{' + dd + '}$ of the sum.'],
        hint: 'Dividing by ' + dd + ' splits an amount into ' + dd + ' equal parts.'
      };
    }
    var ph = null;
    for (var t = 0; t < 100 && !ph; t++) {
      var c = R.pick(lv === 1 ? PHR.slice(0, 10) : PHR)(R), ev = evalTk(c.tk.slice());
      if (ev.ok) ph = c;
    }
    var ev2 = evalTk(ph.tk.slice()), right = etex(ph.tk);
    if (shape === 'value') return {
      q: 'Write an expression for "' + ph.w + '." Then find its value.',
      a: num(ev2.v, 'int'),
      steps: ['The words describe $' + right + '$.' + (ph.tk.indexOf('(') >= 0 ? ' The parentheses show which part is done first.' : '')].concat(stepsOf(ev2)),
      hint: 'Decide which operation the words ask for first. If it would not be done first on its own, it needs parentheses.'
    };
    return {
      q: 'Which expression matches the words "' + ph.w + '"?',
      a: mc('$' + right + '$', ph.bad.map(function (bk) { return '$' + etex(bk) + '$'; })),
      steps: ['Find the action the words do first and the action they do last.', 'The expression is $' + right + '$.' + (ph.tk.indexOf('(') >= 0 ? ' Without the parentheses, the multiplying or dividing would happen first, which is not what the words say.' : ' Multiplying and dividing come first anyway, so no parentheses are needed.')],
      hint: '"The sum of" or "the difference of" names one amount: it often needs parentheses.'
    };
  });

  // ---------------------------------------------------------------- g5.prime-factorization
  function primeSet(R, lv) {
    for (var t = 0; t < 400; t++) {
      var k = lv === 1 ? 3 : lv === 2 ? R.int(3, 4) : R.int(4, 5), pool = lv === 1 ? [2, 2, 3, 3, 5, 7] : lv === 2 ? [2, 2, 2, 3, 3, 5, 5, 7, 11] : [2, 2, 2, 3, 3, 3, 5, 5, 7, 11, 13];
      var ps = []; for (var i = 0; i < k; i++) ps.push(R.pick(pool));
      ps.sort(function (a, b) { return a - b; });
      var n = ps.reduce(function (a, b) { return a * b; }, 1), lim = lv === 1 ? 70 : lv === 2 ? 200 : 600;
      if (n <= lim && n >= 12 && U.uniq(ps).length >= 2) return { ps: ps, n: n };
    }
    return { ps: [2, 2, 3, 5], n: 60 };
  }
  function prodTex(ps) { return ps.join(X); }
  function treeSteps(n, ps) {
    var s = [], cur = n, i = 0, rest = ps.slice();
    var p = rest[0], other = n / p;
    s.push('Split $' + n + '$ into two factors, for example $' + n + ' = ' + p + X + other + '$. $' + p + '$ is prime, so circle it.');
    rest.shift(); cur = other;
    while (rest.length > 1) { p = rest.shift(); var o2 = cur / p; s.push('$' + cur + '$ is not prime: $' + cur + ' = ' + p + X + o2 + '$. Circle $' + p + '$.'); cur = o2; i++; }
    s.push('$' + cur + '$ is prime, so every branch now ends in a prime.');
    s.push('$' + n + ' = ' + prodTex(ps) + '$.');
    return s;
  }
  G('g5.prime-factorization', function (R, ctx) {
    var lv = L(ctx), P = primeSet(R, lv), ps = P.ps, n = P.n, shape = R.pickW(['pick', 'missing', 'build', 'greatest', 'count'], [4, 2, 2, 1, lv === 1 ? 0 : 1]);
    if (shape === 'pick') {
      var right = prodTex(ps), wr = [];
      // stopped too early: two primes left joined as a composite
      var j = R.int(0, ps.length - 2), early = ps.slice(0, j).concat([ps[j] * ps[j + 1]], ps.slice(j + 2)); wr.push(prodTex(early));
      var j2 = ps.length - 2, early2 = ps.slice(0, j2).concat([ps[j2] * ps[j2 + 1]]); wr.push(prodTex(early2));
      var drop = ps.slice(); drop.splice(R.int(0, ps.length - 1), 1); wr.push(prodTex(drop));
      var add = ps.concat([R.pick([2, 3])]).sort(function (a, b) { return a - b; }); wr.push(prodTex(add));
      wr = U.uniq(wr).filter(function (w) { return w !== right; });
      return {
        q: 'Which is the prime factorization of $' + n + '$?',
        a: mc('$' + right + '$', wr.map(function (w) { return '$' + w + '$'; })),
        steps: treeSteps(n, ps).concat(['Check: every factor is prime and the product is $' + n + '$. A list with a number like ' + (early[j]) + ' in it is not finished, because ' + early[j] + ' is not prime.']),
        hint: 'Every factor must be prime, and they must multiply to ' + n + '.'
      };
    }
    if (shape === 'missing') {
      var k = R.int(0, ps.length - 1), shown = ps.map(function (p, i) { return i === k ? '\\square' : String(p); }).join(X), known = ps.reduce(function (a, p, i) { return i === k ? a : a * p; }, 1);
      return {
        q: '$' + n + ' = ' + shown + '$, and every factor is prime. What number goes in the box?',
        a: num(ps[k], 'int'),
        steps: ['Multiply the factors you know: ' + ps.filter(function (p, i) { return i !== k; }).join(' × ') + ' = ' + known + '.', 'The missing factor is $' + n + DV + known + ' = ' + ps[k] + '$, which is prime.'],
        hint: 'Multiply the known factors, then divide.'
      };
    }
    if (shape === 'build') return {
      q: 'Which number has the prime factorization $' + prodTex(ps) + '$?',
      a: num(n, 'int'),
      steps: ['Multiply the primes in any order.', '$' + prodTex(ps) + ' = ' + n + '$.'],
      hint: 'Just multiply.'
    };
    if (shape === 'greatest') return {
      q: 'What is the greatest prime factor of $' + n + '$?',
      a: num(ps[ps.length - 1], 'int'),
      steps: treeSteps(n, ps).concat(['The greatest prime in the list is $' + ps[ps.length - 1] + '$.']),
      hint: 'Make a factor tree until every branch ends in a prime.'
    };
    return {
      q: 'Write $' + n + '$ as a product of primes. How many prime factors are there, counting repeats? (For example, $12 = 2 \\times 2 \\times 3$ has 3.)',
      a: num(ps.length, 'int'),
      steps: treeSteps(n, ps).concat(['Count them: ' + ps.length + ' prime factors.']),
      hint: 'Make a factor tree. Count the circled primes at the ends of the branches.'
    };
  });


  /* ================================================================ unit: place value and decimals */
  var PLACE = { 4: 'ten-thousands', 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones', '-1': 'tenths', '-2': 'hundredths', '-3': 'thousandths' };
  var PLACE1 = { 4: 'ten-thousand', 3: 'thousand', 2: 'hundred', 1: 'ten', 0: 'one', '-1': 'tenth', '-2': 'hundredth', '-3': 'thousandth' };
  function p10(e) { return e >= 0 ? q(Math.pow(10, e)) : q(1, Math.pow(10, -e)); }
  function p10t(e) { return e >= 0 ? nc(Math.pow(10, e)) : fr(1, nc(Math.pow(10, -e))); }
  /* a number from digits by place: {3: 4, 2: 0, ...} -> Q */
  function fromPlaces(dg) { var v = q(0); Object.keys(dg).forEach(function (e) { v = v.add(p10(+e).mul(dg[e])); }); return v; }
  /* the words for a decimal string: "2.045" -> "two and forty-five thousandths" */
  function decWords(s) {
    var m = /^(\d+)(?:\.(\d+))?$/.exec(s), w = +m[1], f = m[2] || '', out = '';
    if (!f) return U.words(w);
    var fn = +f, pn = { 1: 'tenth', 2: 'hundredth', 3: 'thousandth' }[f.length];
    out = (w ? U.words(w) + ' and ' : '') + U.words(fn) + ' ' + pn + (fn === 1 ? '' : 's');
    return out;
  }

  // ---------------------------------------------------------------- g5.tenths-relationship
  G('g5.tenths-relationship', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['times', 'part', 'value', 'scale'], [3, 2, 2, 2]);
    if (shape === 'times' || shape === 'part') {
      var gap = by(ctx, 1, R.int(1, 2), R.int(1, 3)), lo = by(ctx, 0, -2, -3), hi = by(ctx, 3, 3, 4), e2 = R.int(lo, hi - gap), e1 = e2 + gap, d = R.int(1, 9);
      var top = Math.max(e1, lv === 1 ? 3 : 2), bot = Math.min(e2, 0), dg = {};
      if (lv > 1 && bot === 0 && R.coin()) bot = -R.int(1, 2);
      for (var e = top; e >= bot; e--) dg[e] = e === e1 || e === e2 ? d : R.intNot(e === top || (e === bot && e < 0) ? 1 : 0, 9, d);
      var n = fromPlaces(dg), v1 = p10(e1).mul(d), v2 = p10(e2).mul(d), k = Math.pow(10, gap);
      var base = ['In $' + dt(n) + '$, the ' + d + ' in the ' + PLACE[e1] + ' place is worth $' + dt(v1) + '$.', 'The ' + d + ' in the ' + PLACE[e2] + ' place is worth $' + dt(v2) + '$.'];
      if (shape === 'times') return {
        q: 'In $' + dt(n) + '$, the value of the ' + d + ' in the ' + PLACE[e1] + ' place is how many times the value of the ' + d + ' in the ' + PLACE[e2] + ' place?',
        a: num(k, 'int'),
        steps: base.concat(['Each place to the left is worth 10 times as much, and the places are ' + pl(gap, 'step') + ' apart' + (gap > 1 ? ': $' + Array(gap + 1).join('10' + X).slice(0, -X.length) + ' = ' + nc(k) + '$' : '') + '.', 'Check: $' + dt(v2) + X + nc(k) + ' = ' + dt(v1) + '$.']),
        hint: 'Write the value of each ' + d + ', or count how many places apart they are.'
      };
      var right = '$\\frac{1}{' + nc(k) + '}$ of', wr = ['$' + nc(k) + '$ times', '$\\frac{1}{' + nc(k * 10) + '}$ of', '$' + nc(k * 10) + '$ times', '$\\frac{1}{' + (k === 10 ? 100 : 10) + '}$ of'];
      return {
        q: 'In $' + dt(n) + '$, the value of the ' + d + ' in the ' + PLACE[e2] + ' place is ______ the value of the ' + d + ' in the ' + PLACE[e1] + ' place.',
        a: mc(right, wr),
        steps: base.concat(['Moving one place to the right makes a digit worth $\\frac{1}{10}$ as much. These places are ' + pl(gap, 'step') + ' apart.', 'So the value is $\\frac{1}{' + nc(k) + '}$ of the other: $' + dt(v1) + DV + nc(k) + ' = ' + dt(v2) + '$.']),
        hint: 'Is the ' + PLACE[e2] + ' place to the left or to the right of the ' + PLACE[e1] + ' place?'
      };
    }
    if (shape === 'value') {
      var lo2 = by(ctx, -2, -3, -3), dg2 = {}, top2 = R.int(1, 2), ch = R.int(lo2, top2), dd = R.int(1, 9);
      for (var e3 = top2; e3 >= lo2; e3--) dg2[e3] = e3 === ch ? dd : R.intNot(e3 === top2 || e3 === lo2 ? 1 : 0, 9, dd);
      var n2 = fromPlaces(dg2), val = p10(ch).mul(dd);
      return {
        q: 'What is the value of the digit ' + dd + ' in $' + dt(n2) + '$?',
        a: num(ds(val)),
        steps: ['The ' + dd + ' is in the ' + PLACE[ch] + ' place.', 'Its value is $' + dd + X + (ch >= 0 ? nc(Math.pow(10, ch)) : '\\frac{1}{' + nc(Math.pow(10, -ch)) + '}') + ' = ' + dt(val) + '$.'],
        hint: 'Find the ' + dd + ' and name its place.'
      };
    }
    var up = R.coin(), kk = by(ctx, 10, R.pick([10, 100]), R.pick([10, 100, 1000])), sz = R.int(1, 9), ex = R.int(-2, 2), start = p10(ex).mul(sz);
    if (start.mul(kk).gt(99999) || (!up && start.div(kk).lt(q(1, 1000)))) { ex = 0; start = q(sz); }
    var res = up ? start.mul(kk) : start.div(kk);
    return {
      q: up ? 'What number is ' + nc(kk) + ' times as much as $' + dt(start) + '$?' : 'What number is $\\frac{1}{' + nc(kk) + '}$ of $' + dt(start) + '$?',
      a: num(ds(res)),
      steps: [(up ? 'Ten times as much moves each digit one place to the left.' : 'One tenth as much moves each digit one place to the right.') + (kk > 10 ? ' ' + (up ? nc(kk) + ' times as much' : '$\\frac{1}{' + nc(kk) + '}$ of a number') + ' moves each digit ' + (String(kk).length - 1) + ' places.' : ''),
        '$' + dt(start) + (up ? X : DV) + nc(kk) + ' = ' + dt(res) + '$.'],
      hint: up ? 'Each digit moves to a place worth more.' : 'Each digit moves to a place worth less.'
    };
  });

  // ---------------------------------------------------------------- g5.powers-of-ten
  G('g5.powers-of-ten', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['value', 'exp', 'times', 'pick', 'zeros', 'expanded', 'ratio', 'split'], [3, 2, lv === 1 ? 1 : 3, 2, 1, lv === 3 ? 3 : 0, lv === 1 ? 0 : 2, 2]);
    var k = by(ctx, R.int(2, 4), R.int(2, 6), R.int(3, 7)), big = Math.pow(10, k);
    var rep = Array(k + 1).join('10' + X).slice(0, -X.length);
    if (shape === 'value') return {
      q: 'What is the value of $10^{' + k + '}$?',
      a: num(big, 'int'),
      steps: ['The exponent ' + k + ' says how many 10s to multiply: $10^{' + k + '} = ' + rep + '$.', 'Each factor of 10 adds a zero: $' + nc(big) + '$.'],
      hint: 'The exponent is the number of 10s multiplied together.'
    };
    if (shape === 'exp') return {
      q: 'Write $' + nc(big) + '$ as a power of 10: $' + nc(big) + ' = 10^{\\square}$. What is the exponent?',
      a: num(k, 'int'),
      steps: ['$' + nc(big) + '$ has ' + k + ' zeros after the 1.', 'So it is ' + k + ' tens multiplied together: $' + nc(big) + ' = 10^{' + k + '}$.'],
      hint: 'Count the zeros.'
    };
    if (shape === 'times') {
      var kk = by(ctx, R.int(1, 3), R.int(2, 4), R.int(2, 5)), a = by(ctx, R.int(2, 9), R.pick([R.int(2, 9), R.int(11, 99)]), R.pick([R.int(11, 99), q(R.int(11, 99), 10)])), av = q(a), res = av.mul(Math.pow(10, kk));
      return {
        q: 'What is $' + dt(av) + X + '10^{' + kk + '}$?',
        a: num(ds(res)),
        steps: ['$10^{' + kk + '} = ' + nc(Math.pow(10, kk)) + '$.', 'Multiplying by $' + nc(Math.pow(10, kk)) + '$ moves each digit ' + pl(kk, 'place') + ' to the left: $' + dt(av) + X + nc(Math.pow(10, kk)) + ' = ' + dt(res) + '$.'],
        hint: 'First write $10^{' + kk + '}$ as a whole number.'
      };
    }
    if (shape === 'pick') {
      var kp = R.int(2, 4);
      return {
        q: 'Which number is equal to $10^{' + kp + '}$?',
        a: mc('$' + nc(Math.pow(10, kp)) + '$', ['$' + (10 * kp) + '$', '$' + nc(Math.pow(10, kp + 1)) + '$', '$' + nc(Math.pow(10, kp - 1)) + '$', '$' + (10 + kp) + '$']),
        steps: ['$10^{' + kp + '}$ means ' + kp + ' tens multiplied together, not $10' + X + kp + '$.', '$10^{' + kp + '} = ' + Array(kp + 1).join('10' + X).slice(0, -X.length) + ' = ' + nc(Math.pow(10, kp)) + '$.'],
        hint: 'The small number tells how many 10s are multiplied.'
      };
    }
    if (shape === 'zeros') return {
      q: 'When you write $10^{' + k + '}$ as a whole number, how many zeros does it have?',
      a: num(k, 'int'),
      steps: ['Each factor of 10 moves the 1 one place to the left, leaving a zero behind.', '$10^{' + k + '} = ' + nc(big) + '$, with ' + k + ' zeros.'],
      hint: 'Write out a smaller one, like $10^{2} = 100$, and look at the pattern.'
    };
    if (shape === 'ratio') { var hi = R.int(3, 7), lo = R.int(1, hi - 1), kr = Math.pow(10, hi - lo);
      return { q: 'How many times as large is $10^{' + hi + '}$ as $10^{' + lo + '}$?', a: num(kr, 'int'),
        steps: ['$10^{' + hi + '}$ has ' + (hi - lo) + ' more factors of 10 than $10^{' + lo + '}$.', 'So it is $' + Array(hi - lo + 1).join('10' + X).slice(0, -X.length) + ' = ' + nc(kr) + '$ times as large. Check: $' + nc(Math.pow(10, hi)) + DV + nc(Math.pow(10, lo)) + ' = ' + nc(kr) + '$.'],
        hint: 'Count the extra factors of 10.' }; }
    if (shape === 'split') { var dg = R.int(2, 9), ks = R.int(2, by(ctx, 4, 6, 7)), big2 = dg * Math.pow(10, ks);
      return { q: 'Write $' + nc(big2) + '$ as $' + dg + X + '10^{\\square}$. What is the exponent?', a: num(ks, 'int'),
        steps: ['$' + nc(big2) + ' = ' + dg + X + nc(Math.pow(10, ks)) + '$.', '$' + nc(Math.pow(10, ks)) + '$ has ' + ks + ' zeros, so it is $10^{' + ks + '}$.'],
        hint: 'How many zeros follow the ' + dg + '?' }; }
    var e1 = R.int(3, 5), e2 = R.int(0, e1 - 2), d1 = R.int(1, 9), d2 = R.int(1, 9), tot = d1 * Math.pow(10, e1) + d2 * Math.pow(10, e2);
    return {
      q: 'Write as a whole number: $' + d1 + X + '10^{' + e1 + '} + ' + d2 + X + '10^{' + e2 + '}$.',
      a: num(tot, 'int'),
      steps: ['$' + d1 + X + '10^{' + e1 + '} = ' + d1 + X + nc(Math.pow(10, e1)) + ' = ' + nc(d1 * Math.pow(10, e1)) + '$.', '$' + d2 + X + '10^{' + e2 + '} = ' + nc(d2 * Math.pow(10, e2)) + '$' + (e2 === 0 ? ' (because $10^{0} = 1$)' : '') + '.', 'Add: $' + nc(tot) + '$.'],
      hint: 'Find each part, then add.'
    };
  });

  // ---------------------------------------------------------------- g5.multiply-divide-powers-of-ten
  function mdPow(R, lv) {
    for (var t = 0; t < 200; t++) {
      var dp = by({ level: lv }, R.int(0, 1), R.int(1, 2), R.int(1, 3)), digits = R.int(2, 3), n = R.int(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
      if (n % 10 === 0) continue;
      var x = q(n, Math.pow(10, dp)), k = by({ level: lv }, R.int(1, 2), R.int(1, 3), R.int(1, 3)), mul = R.coin(), f = Math.pow(10, k), r = mul ? x.mul(f) : x.div(f);
      var rdp = ds(r).split('.')[1]; if (rdp && rdp.length > 4) continue;
      return { x: x, k: k, f: f, mul: mul, r: r, pow: lv > 1 && k > 1 && R.chance(0.5) };
    }
  }
  G('g5.multiply-divide-powers-of-ten', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['calc', 'missing', 'spot'], [6, lv === 1 ? 1 : 2, 2]);
    if (shape === 'spot') {
      var a = q(R.int(11, 99), 10), nm = who(R), r1 = a.mul(10);
      return {
        q: nm + ' says $' + dt(a) + X + '10 = ' + ds(a) + '0$ because "you add a zero when you multiply by 10." What is $' + dt(a) + X + '10$?',
        a: num(ds(r1), 'dec'),
        steps: ['$' + ds(a) + '0$ is the same number as $' + dt(a) + '$: a zero at the end of the decimal part changes nothing.', 'Multiplying by 10 makes each digit worth 10 times as much, so each digit moves one place to the left.', '$' + dt(a) + X + '10 = ' + dt(r1) + '$.'],
        hint: 'Should the answer be bigger than $' + dt(a) + '$?'
      };
    }
    var m = mdPow(R, lv), ftex = m.pow ? '10^{' + m.k + '}' : nc(m.f), move = m.mul ? 'left' : 'right';
    var why = (m.mul ? 'Multiplying' : 'Dividing') + ' by ' + (m.pow ? '$10^{' + m.k + '} = ' + nc(m.f) + '$' : '$' + nc(m.f) + '$') + ' moves each digit ' + pl(m.k, 'place') + ' to the ' + move + '.';
    if (shape === 'missing') return {
      q: m.mul ? '$' + dt(m.x) + X + '\\square = ' + dt(m.r) + '$. What number goes in the box?' : '$' + dt(m.x) + DV + '\\square = ' + dt(m.r) + '$. What number goes in the box?',
      a: num(m.f, 'int'),
      steps: ['Compare the digits: they moved ' + pl(m.k, 'place') + ' to the ' + move + '.', 'That is ' + (m.mul ? 'multiplying' : 'dividing') + ' by $' + nc(m.f) + '$' + (m.k > 1 ? ' $(10^{' + m.k + '})$' : '') + '.'],
      hint: 'How many places did the digits move?'
    };
    return {
      q: 'What is $' + dt(m.x) + (m.mul ? X : DV) + ftex + '$?',
      a: num(ds(m.r), 'dec'),
      steps: [why, '$' + dt(m.x) + (m.mul ? X : DV) + nc(m.f) + ' = ' + dt(m.r) + '$.', 'Check: ' + (m.mul ? 'multiplying by more than 1 should make the number bigger.' : 'dividing by ' + nc(m.f) + ' should make the number smaller.')],
      hint: (m.mul ? 'Each digit becomes worth more: it moves left.' : 'Each digit becomes worth less: it moves right.') + ' Write zeros to fill empty places.'
    };
  });

  // ---------------------------------------------------------------- g5.thousandths
  function randDec(R, wmax, dp) { var w = R.int(0, wmax), f = R.int(1, Math.pow(10, dp) - 1); if (f % 10 === 0) f += R.int(1, 9); var s = String(f); while (s.length < dp) s = '0' + s; return { s: w + '.' + s, w: w, f: s }; }
  G('g5.thousandths', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['fromWords', 'expanded', 'digit', 'words', 'howmany'], [3, 3, 2, 2, lv === 1 ? 0 : 2]);
    var dp = by(ctx, R.int(2, 3), 3, 3), D = randDec(R, by(ctx, 20, 99, 999), dp), v = q(D.s);
    if (shape === 'fromWords') {
      if (lv > 1 && R.chance(0.5)) { D = randDec(R, by(ctx, 20, 99, 999), 3); D.f = '0' + R.int(1, 9) + R.int(1, 9); D.s = D.w + '.' + D.f; v = q(D.s); }
      return {
        q: 'Write in digits: ' + decWords(D.s) + '.',
        a: num(ds(v), 'dec'),
        steps: [D.w ? 'The words before "and" give the whole number: ' + D.w + '.' : 'There is no "and," so the whole-number part is 0.', 'The last word, "' + decWords(D.s).split(' ').pop() + '," names the last place, so the decimal part has ' + D.f.length + ' digits: ' + D.f + '.' + (D.f[0] === '0' ? ' A zero holds the empty place.' : ''), 'The number is $' + dt(v) + '$.'],
        hint: 'The last word tells you which place the last digit is in.'
      };
    }
    if (shape === 'expanded') {
      var parts = [], s = D.s.split('.'), ws = s[0], fs = s[1];
      for (var i = 0; i < ws.length; i++) { var d = +ws[i], e = ws.length - 1 - i; if (d) parts.push(d + X + nc(Math.pow(10, e))); }
      for (i = 0; i < fs.length; i++) if (+fs[i]) parts.push(fs[i] + X + fr(1, nc(Math.pow(10, i + 1))));
      return {
        q: 'Write as a decimal: $' + parts.join(' + ') + '$.',
        a: num(ds(v), 'dec'),
        steps: ['Each part puts one digit in its place: $' + fr(1, 10) + '$ is tenths, $' + fr(1, 100) + '$ hundredths and $' + fr(1, '1{,}000') + '$ thousandths.', /0/.test(fs) || (D.w > 0 && /0/.test(ws)) ? 'A place with no part gets a 0.' : 'Every place gets one digit.', 'The number is $' + dt(v) + '$.'],
        hint: 'Put each digit in the place its part names. Fill missing places with 0.'
      };
    }
    if (shape === 'digit') {
      var places = D.f.length, pe = R.int(1, places), dig = +D.f[pe - 1];
      if (R.chance(0.3) && D.w > 9) { var wsx = String(D.w); return { q: 'What digit is in the tens place of $' + dt(v) + '$?', a: num(+wsx[wsx.length - 2], 'int'), steps: ['The tens place is two places to the left of the decimal point.', 'In $' + dt(v) + '$ that digit is ' + wsx[wsx.length - 2] + '.'], hint: 'Ones are just left of the point, tens are next.' }; }
      return {
        q: 'What digit is in the ' + PLACE[-pe] + ' place of $' + dt(v) + '$?',
        a: num(dig, 'int'),
        steps: ['After the decimal point the places are tenths, hundredths, thousandths.', 'The ' + PLACE[-pe] + ' digit is the ' + U.ordinal(pe) + ' digit after the point: ' + dig + '.'],
        hint: 'Count places to the right of the decimal point.'
      };
    }
    if (shape === 'howmany') {
      var f2 = randDec(R, 0, by(ctx, 2, 3, 3)), kind = f2.f.length, unit = PLACE[-kind];
      if (lv === 3 && R.coin()) { var w2 = R.int(1, 9), t2 = R.int(1, 9); return { q: 'How many tenths are in $' + w2 + '.' + t2 + '$?', a: num(w2 * 10 + t2, 'int'), steps: ['Each one is 10 tenths, so ' + w2 + ' ones are ' + (w2 * 10) + ' tenths.', 'Add the ' + t2 + ' tenths: ' + (w2 * 10 + t2) + ' tenths.'], hint: 'How many tenths make 1?' }; }
      return {
        q: '$' + f2.s + '$ is how many ' + unit + '?',
        a: num(+f2.f, 'int'),
        steps: ['$' + f2.s + ' = ' + fr(+f2.f, nc(Math.pow(10, kind))) + '$.', 'So it is ' + (+f2.f) + ' ' + unit + '.'],
        hint: 'Read the digits after the point as one number, then name the last place.'
      };
    }
    var right = decWords(D.s), wr = [], fparts = D.f, head = D.w ? U.words(D.w) + ' and ' : '';
    function pw(n, plc) { return U.words(n) + ' ' + PLACE1[plc] + (n === 1 ? '' : 's'); }
    wr.push(head + pw(+fparts, fparts.length === 3 ? -2 : -3));
    wr.push(U.words(+(String(D.w) + fparts)));
    if (/[1-9]0/.test(fparts)) wr.push(head + pw(+fparts.replace(/0/g, ''), -fparts.length));
    wr.push(head + pw(+fparts, -1));
    wr = wr.filter(function (w) { return w && w !== right; });
    return {
      q: 'Which words name $' + dt(v) + '$?',
      a: mc(right, wr),
      steps: ['Read the whole number, say "and" for the decimal point, then read the digits after the point as one number.', 'Finish with the name of the last place: ' + PLACE[-D.f.length] + '.', '$' + dt(v) + '$ is "' + right + '."'],
      hint: 'The last digit is in the ' + PLACE[-D.f.length] + ' place.'
    };
  });

  // ---------------------------------------------------------------- g5.compare-decimals-thousandths
  function cmpPair(R, lv) {
    var kind = R.pick(lv === 1 ? ['len', 'zeros', 'near', 'len'] : ['len', 'zeros', 'place', 'near', 'whole', 'len']), a, b;
    if (kind === 'len') { var t = R.int(2, 8); a = q(t, 10); b = q((t - 1) * 100 + R.int(11, 99), 1000); if (R.coin()) b = q(t * 100 + R.int(11, 99), 1000); }
    else if (kind === 'zeros') { var t2 = R.int(1, 9), w = R.int(0, 9); a = q(w * 10 + t2, 10); b = a; if (R.coin()) b = a.add(q(R.int(1, 9), 1000)); }
    else if (kind === 'place') { var d1 = R.int(1, 9), d2 = R.int(1, 9); a = q(d1 * 100 + d2, 1000); b = q(d1 * 10 + d2, 100); }
    else if (kind === 'near') { var base = R.int(1000, 9999); a = q(base, 1000); b = q(base + R.pick([1, 10, 9, 100, -10, -1, -100]), 1000); }
    else { var ww = R.int(2, 9); a = q(ww * 100 + R.int(1, 9), 100); b = q((ww - 1) * 1000 + R.int(900, 999), 1000); }
    if (R.coin()) { var tt = a; a = b; b = tt; }
    var sa = ds(a), sb = ds(b);
    if (kind === 'zeros' && a.eq(b)) { if (R.coin()) sa = sa + '0'; else sb = sb + (R.coin() ? '0' : '00'); }
    return { a: a, b: b, sa: sa, sb: sb };
  }
  function padTo(s, n) { var p = s.split('.'), f = p[1] || ''; while (f.length < n) f += '0'; return p[0] + '.' + f; }
  G('g5.compare-decimals-thousandths', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['cmp', 'greatest', 'order'], [5, 3, lv === 3 ? 2 : 0]);
    if (shape === 'cmp') {
      var P = cmpPair(R, lv), c = P.a.cmp(P.b), sym = c < 0 ? '<' : c > 0 ? '>' : '=', n = Math.max((P.sa.split('.')[1] || '').length, (P.sb.split('.')[1] || '').length);
      return {
        q: 'Compare: $' + P.sa + ' \\;\\square\\; ' + P.sb + '$. Choose $<$, $>$ or $=$.',
        a: keep(['$<$', '$>$', '$=$'], c < 0 ? 0 : c > 0 ? 1 : 2),
        steps: ['Write both with the same number of decimal places: $' + padTo(P.sa, n) + '$ and $' + padTo(P.sb, n) + '$.', 'Compare place by place from the left. ' + (c === 0 ? 'Every place matches.' : 'The first place that differs decides.'), '$' + P.sa + ' ' + sym + ' ' + P.sb + '$.'],
        hint: 'Line up the decimal points and compare from the left, or give both the same number of digits.'
      };
    }
    if (shape === 'greatest') {
      var a = R.int(1, 9), b = R.intNot(1, 9, a), cand = ['0.' + a, '0.' + a + b, '0.' + a + '0' + b, '0.0' + a + b, '0.' + b + a, '0.' + b, '0.' + b + '0' + a, '0.00' + a];
      var pickd = R.sample(U.uniq(cand), 4), vals = pickd.map(function (s) { return q(s); }), least = lv > 1 && R.coin();
      var bi = 0; vals.forEach(function (v, i) { if (least ? v.lt(vals[bi]) : v.gt(vals[bi])) bi = i; });
      var wide = pickd.map(function (s) { return padTo(s, 3); });
      return {
        q: 'Which number is ' + (least ? 'least' : 'greatest') + '?',
        a: mc('$' + pickd[bi] + '$', pickd.filter(function (s, i) { return i !== bi; }).map(function (s) { return '$' + s + '$'; })),
        steps: ['Write each with three decimal places: $' + wide.join(',\\; ') + '$.', 'Now compare them like whole numbers of thousandths: ' + wide.map(function (s) { return +s.split('.')[1]; }).join(', ') + '.', 'The ' + (least ? 'least' : 'greatest') + ' is $' + pickd[bi] + '$.'],
        hint: 'More digits does not mean bigger. Compare the tenths first.'
      };
    }
    var w = R.int(0, 3), tt = R.int(1, 8), set = U.uniq([w + '.' + tt, w + '.' + tt + R.int(1, 9), w + '.0' + R.int(1, 9) + R.int(1, 9), w + '.' + (tt + 1) + '0' + R.int(1, 9), w + '.' + tt + '0' + R.int(1, 9)]);
    var three = R.sample(set, 3), sorted = three.slice().sort(function (x, y) { return q(x).cmp(q(y)); });
    var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(function (p) { return p.map(function (i) { return sorted[i]; }); });
    var txt = function (arr) { return '$' + arr.join(',\\; ') + '$'; };
    return {
      q: 'Which list is in order from least to greatest?',
      a: mc(txt(perms[0]), R.sample(perms.slice(1), 3).map(txt)),
      steps: ['Give each number three decimal places: $' + three.map(function (s) { return padTo(s, 3); }).join(',\\; ') + '$.', 'Compare from the tenths place.', 'Least to greatest: ' + txt(sorted) + '.'],
      hint: 'Fill in zeros so they all have the same number of digits after the point.'
    };
  });

  // ---------------------------------------------------------------- g5.round-decimals
  var RNAME = { 0: 'whole number', 1: 'tenth', 2: 'hundredth' };
  function roundQ(x, p) { return q(x.toDec(p)); }
  G('g5.round-decimals', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['round', 'which', 'money'], [6, 2, lv === 1 ? 0 : 2]);
    if (shape === 'which') {
      var tgt = q(R.int(11, 99), 10), opts = [], right = null;
      var cands = [-5, -4, -3, -2, -1, 1, 2, 3, 4].map(function (h) { return tgt.add(q(h, 100)); });
      right = R.pick(cands);
      [5, 6, 7, -6, -7, 9, -9].forEach(function (h) { opts.push(tgt.add(q(h, 100))); });
      var wrongs = R.sample(opts.filter(function (x) { return !roundQ(x, 1).eq(tgt); }), 3);
      return {
        q: 'Which number rounds to $' + dt(tgt) + '$ when you round to the nearest tenth?',
        a: mc('$' + dt(right) + '$', wrongs.map(function (w) { return '$' + dt(w) + '$'; })),
        steps: ['Numbers that round to $' + dt(tgt) + '$ are from $' + tgt.sub(q(5, 100)).toDec(2) + '$ up to (but not including) $' + tgt.add(q(5, 100)).toDec(2) + '$.', '$' + dt(right) + '$ is in that range: its hundredths digit tells it to round to $' + dt(tgt) + '$.'].concat(wrongs.map(function (w) { return '$' + dt(w) + '$ rounds to $' + roundQ(w, 1).toDec(1) + '$.'; })),
        hint: 'Round each choice to the nearest tenth.'
      };
    }
    if (shape === 'money') {
      var cents = R.int(100, 9999) * 10 + R.intNot(1, 9, 5), x = q(cents, 1000), r = roundQ(x, 2);
      return {
        q: 'A store figures a price of $\\$' + T.commas(x.toDec(3)) + '$. Round it to the nearest cent.',
        a: num(ds(r), 'dec'),
        steps: ['A cent is a hundredth of a dollar, so round to the hundredths place.', 'The thousandths digit is ' + (cents % 10) + ', which is ' + (cents % 10 >= 5 ? '5 or more: round up.' : 'less than 5: keep the hundredths digit.'), 'The price is $' + T.money(r.toDec(2)) + '$.'],
        hint: 'Look at the digit just right of the hundredths place.'
      };
    }
    var p = by(ctx, R.pick([0, 1, 1]), R.pick([0, 1, 2]), R.pick([0, 1, 2])), extra = by(ctx, 1, R.int(1, 2), R.int(1, 2)), dpn = Math.min(3, p + extra);
    var w = R.int(1, 49), f = [], i, roll = lv === 3 && R.coin();
    for (i = 0; i < dpn; i++) f.push(R.int(0, 9));
    f[dpn - 1] = R.int(1, 9);
    if (roll) { if (p === 0) w = 10 * R.int(0, 4) + 9; else for (i = 0; i < p; i++) f[i] = 9; f[p] = R.int(5, 9); }
    var xx = q(w + '.' + f.join('')), next = f[p], rr = roundQ(xx, p), shown = rr.toDec(p), keepName = p === 0 ? 'ones' : PLACE[-p];
    var kept = p === 0 ? w % 10 : f[p - 1];
    return {
      q: 'Round $' + dt(xx) + '$ to the nearest ' + RNAME[p] + '.',
      a: num(ds(rr), 'dec'),
      steps: ['Round to the ' + keepName + ' place. The digit just to its right is ' + next + '.', next >= 5 ? '5 or more: round up. Add 1 to the ' + keepName + ' digit' + (kept === 9 ? ' (9 + 1 = 10, so write 0 and carry 1 to the next place)' : '') + ' and drop the digits after it.' : 'Less than 5: keep the ' + keepName + ' digit as it is and drop the digits after it.', '$' + dt(xx) + '$ rounds to $' + T.commas(shown) + '$' + (shown !== ds(rr) ? ' (the same as $' + ds(rr) + '$)' : '') + '.'],
      hint: 'Find the ' + keepName + ' digit, then look one place to its right.'
    };
  });


  /* ================================================================ unit: multiplying and dividing whole numbers */

  // ---------------------------------------------------------------- g5.multiply-algorithm
  function noTens(R, lo, hi) { for (;;) { var n = R.int(lo, hi); if (n % 10) return n; } }
  function partials(a, b) { // one row per nonzero digit of b, from the ones up
    var ds2 = String(b).split('').reverse(), rows = [];
    ds2.forEach(function (d, i) { d = +d; if (!d) return; var pv = d * Math.pow(10, i); rows.push({ d: d, pv: pv, i: i, v: a * pv }); });
    return rows;
  }
  function multSteps(a, b) {
    var rows = partials(a, b), tot = a * b, PN = ['ones', 'tens', 'hundreds'];
    var s = rows.map(function (r) {
      return 'Multiply by the ' + PN[r.i] + ' digit, ' + r.d + (r.i ? ', which is worth ' + nc(r.pv) : '') + ': $' + nc(a) + X + nc(r.pv) + ' = ' + nc(r.v) + '$.' + (r.i === 1 ? ' This row ends in a 0 because you are multiplying by tens.' : r.i === 2 ? ' This row ends in two 0s because you are multiplying by hundreds.' : '');
    });
    s.push('Add the rows: $' + rows.map(function (r) { return nc(r.v); }).join(' + ') + ' = ' + nc(tot) + '$.');
    s.push('Check with an estimate: about $' + nc(roundLead(a)) + X + nc(roundLead(b)) + ' = ' + nc(roundLead(a) * roundLead(b)) + '$.');
    return s;
  }
  function roundLead(n) { var p = Math.pow(10, String(n).length - 1); return Math.round(n / p) * p; }
  G('g5.multiply-algorithm', function (R, ctx) {
    var lv = L(ctx), a, b;
    if (lv === 1) { a = noTens(R, 12, 99); b = noTens(R, 12, 99); }
    else if (lv === 2) { a = noTens(R, 102, 999); b = noTens(R, 12, 99); }
    else if (R.coin()) { a = noTens(R, 1002, 4999); b = noTens(R, 12, 99); } else { a = noTens(R, 102, 999); b = noTens(R, 102, 499); }
    var shape = R.pickW(['calc', 'partial', 'story'], [5, lv === 1 ? 1 : 2, 2]), tot = a * b;
    if (shape === 'partial') {
      var rows = partials(a, b).filter(function (x) { return x.i >= 1; }), r = R.pick(rows), pn = ['ones', 'tens', 'hundreds'][r.i];
      return {
        q: 'When you multiply $' + nc(a) + X + nc(b) + '$ with the standard algorithm, what is the partial product for the ' + pn + ' digit of $' + nc(b) + '$?',
        a: num(r.v, 'int'),
        steps: ['The ' + pn + ' digit of $' + nc(b) + '$ is ' + r.d + ', and it is worth ' + nc(r.pv) + '.', '$' + nc(a) + X + nc(r.pv) + ' = ' + nc(r.v) + '$. ' + (r.i === 1 ? 'The 0 at the end holds the ones place, because multiplying by tens makes tens.' : 'The two 0s at the end hold the ones and tens places, because multiplying by hundreds makes hundreds.')],
        hint: 'The ' + pn + ' digit is worth ' + (r.i === 1 ? 'ten' : 'a hundred') + ' times its face value.'
      };
    }
    if (shape === 'story') {
      var t = R.pick([
        function () { return { q: 'A theater has ' + nc(b) + ' rows with ' + nc(a) + ' seats in each row. How many seats does it have?', u: 'seats' }; },
        function () { return { q: 'A farm packs ' + nc(a) + ' boxes of apples. Each box holds ' + nc(b) + ' apples. How many apples is that?', u: 'apples' }; },
        function () { return { q: 'A printer prints ' + nc(a) + ' pages every hour. How many pages does it print in ' + nc(b) + ' hours?', u: 'pages' }; },
        function () { return { q: 'A school buys ' + nc(b) + ' packs of pencils with ' + nc(a) + ' pencils in each pack. How many pencils is that?', u: 'pencils' }; }
      ])();
      return { q: t.q, a: num(tot, 'int'), steps: ['Equal groups: multiply $' + nc(a) + X + nc(b) + '$.'].concat(multSteps(a, b)), hint: 'How many groups, and how many in each group?' };
    }
    return {
      q: 'Multiply: $' + nc(a) + X + nc(b) + '$.',
      a: num(tot, 'int'),
      steps: multSteps(a, b),
      hint: 'Multiply by the ones digit, then by the tens digit (start that row with a 0), then add.'
    };
  });

  // ---------------------------------------------------------------- g5.divide-two-digit-divisors
  function longDiv(n, d) { // steps of long division with estimates
    var s = [], digits = String(n).split('').map(Number), cur = 0, qd = [], started = false, dr = Math.round(d / 10) * 10;
    s.push('Round the divisor to estimate: $' + d + '$ is about $' + dr + '$.');
    for (var i = 0; i < digits.length; i++) {
      cur = cur * 10 + digits[i];
      if (!started && cur < d && i < digits.length - 1) continue;
      started = true;
      var est = Math.min(9, Math.floor(cur / dr)), line = 'How many $' + d + '$s are in $' + nc(cur) + '$? ';
      if (cur < d) { line += 'None, so write 0 in the quotient' + (i < digits.length - 1 ? ' and bring down the next digit.' : '.'); s.push(line); qd.push(0); continue; }
      line += 'Estimate $' + nc(cur) + DV + dr + '$: about ' + est + '.';
      var tries = 0;
      while (est * d > cur && tries < 9) { line += ' But $' + est + X + d + ' = ' + nc(est * d) + '$ is more than $' + nc(cur) + '$, so try ' + (est - 1) + '.'; est--; tries++; }
      while (cur - est * d >= d && tries < 9) { line += ' But $' + nc(cur) + ' - ' + nc(est * d) + ' = ' + nc(cur - est * d) + '$ is ' + d + ' or more, so ' + est + ' is too small: try ' + (est + 1) + '.'; est++; tries++; }
      line += ' Write ' + est + ': $' + est + X + d + ' = ' + nc(est * d) + '$, and $' + nc(cur) + ' - ' + nc(est * d) + ' = ' + nc(cur - est * d) + '$.';
      s.push(line); qd.push(est); cur = cur - est * d;
    }
    return { steps: s, q: +qd.join(''), r: cur };
  }
  G('g5.divide-two-digit-divisors', function (R, ctx) {
    var lv = L(ctx), d, qt, r, n;
    for (var t = 0; t < 100; t++) {
      d = by(ctx, R.int(11, 49), R.int(12, 89), R.int(13, 99)); if (d % 10 === 0) continue;
      qt = by(ctx, R.int(11, 29), R.int(21, 99), R.int(41, 299)); r = by(ctx, 0, R.coin() ? 0 : R.int(1, d - 1), R.int(1, d - 1)); n = d * qt + r;
      if (n >= 100 && n <= 9999) break;
    }
    var shape = R.pickW(['calc', 'story'], [4, lv === 1 ? 1 : 2]), LD = longDiv(n, d);
    var check = 'Check: $' + nc(LD.q) + X + d + (LD.r ? ' + ' + LD.r : '') + ' = ' + nc(n) + '$.';
    if (shape === 'story' && r) {
      var up = R.coin(), item = R.pick([['students', 'buses', 'bus', 'seats on each bus'], ['eggs', 'cartons', 'carton', 'eggs in each carton'], ['books', 'shelves', 'shelf', 'books on each shelf'], ['photos', 'album pages', 'page', 'photos on each page']]);
      return {
        q: 'There are ' + nc(n) + ' ' + item[0] + ' and ' + d + ' ' + item[3] + '. ' + (up ? 'How many ' + item[1] + ' are needed so that every one fits?' : 'How many ' + item[1] + ' can be filled completely?'),
        a: num(up ? LD.q + 1 : LD.q, 'int'),
        steps: ['Divide $' + nc(n) + DV + d + '$.'].concat(LD.steps, ['So $' + nc(n) + DV + d + ' = ' + nc(LD.q) + '$ R ' + LD.r + '.', up ? 'The ' + LD.r + ' left over still need a ' + item[2] + ', so ' + nc(LD.q + 1) + ' ' + item[1] + ' are needed.' : 'Only ' + nc(LD.q) + ' ' + item[1] + ' are full; the ' + LD.r + ' left over do not fill another one.']),
        hint: 'Divide, then decide what the remainder means in the story.'
      };
    }
    if (!r) return {
      q: 'Divide: $' + nc(n) + DV + d + '$.',
      a: num(LD.q, 'int'),
      steps: LD.steps.concat(['The quotient is $' + nc(LD.q) + '$.', check]),
      hint: 'Round ' + d + ' to the nearest ten to estimate each digit of the quotient.'
    };
    return {
      q: 'Divide: $' + nc(n) + DV + d + '$. Give the quotient and the remainder.',
      a: { t: 'multi', parts: [{ label: 'Quotient', a: num(LD.q, 'int') }, { label: 'Remainder', a: num(LD.r, 'int') }] },
      steps: LD.steps.concat(['The quotient is $' + nc(LD.q) + '$ and the remainder is $' + LD.r + '$, which is less than $' + d + '$.', check]),
      hint: 'Estimate each digit with a rounded divisor. The remainder must be less than ' + d + '.'
    };
  });


  /* ================================================================ unit: operations with decimals */
  function dpOf(x) { var s = ds(x), i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function padDp(x, n) { var s = Q.from(x).toDec(n); return T.commas(s); }
  function rdec(R, lo, hi, dp) { for (;;) { var n = R.int(Math.round(lo * Math.pow(10, dp)), Math.round(hi * Math.pow(10, dp))); if (dp === 0 || n % 10) return q(n, Math.pow(10, dp)); } }
  function intDigits(x) { return ds(x).replace('.', '').replace(/^0+(?=\d)/, ''); }

  // ---------------------------------------------------------------- g5.add-subtract-decimals
  function addSubSteps(a, b, plus) {
    var n = Math.max(dpOf(a), dpOf(b)), r = plus ? a.add(b) : a.sub(b);
    var s = ['Line up the decimal points. Give both numbers the same number of decimal places: $' + padDp(a, n) + '$ and $' + padDp(b, n) + '$.'];
    s.push((plus ? 'Add' : 'Subtract') + ' place by place from the right, ' + (plus ? 'carrying' : 'regrouping') + ' as with whole numbers' + (n ? ', and keep the point in line' : '') + ': $' + padDp(a, n) + (plus ? ' + ' : ' - ') + padDp(b, n) + ' = ' + padDp(r, n) + '$.');
    if (padDp(r, n) !== dt(r)) s.push('That is $' + dt(r) + '$.');
    s.push('Check with an estimate: $' + roundW(a) + (plus ? ' + ' : ' - ') + roundW(b) + ' = ' + (plus ? roundW(a) + roundW(b) : roundW(a) - roundW(b)) + '$, close to $' + dt(r) + '$.');
    return s;
  }
  function roundW(x) { return Math.round(Q.from(x).toNumber()); }
  G('g5.add-subtract-decimals', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['calc', 'spot', 'story'], [6, 2, lv === 1 ? 1 : 2]), a, b, plus;
    if (shape === 'spot') {
      var w1 = R.int(2, 9), t1 = R.int(1, 9), w2 = R.int(1, 9), h2 = R.int(11, 99); if (h2 % 10 === 0) h2++;
      a = q(w1 * 10 + t1, 10); b = q(w2 * 100 + h2, 100);
      var wrong = q(w1 * 10 + t1 + w2 * 100 + h2, 100), nm = who(R);
      return {
        q: nm + ' lined up the last digits, like this: $' + dt(a) + ' + ' + dt(b) + ' = ' + dt(wrong) + '$. What is the correct sum?',
        a: num(ds(a.add(b)), 'dec'),
        steps: ['Lining up the last digits adds tenths to hundredths, so the places get mixed up. Line up the decimal points instead.'].concat(addSubSteps(a, b, true)),
        hint: 'Write $' + dt(a) + '$ as $' + padDp(a, 2) + '$ first.'
      };
    }
    if (shape === 'story') {
      var t = R.int(0, 3), nm2 = who(R);
      if (t === 0) { a = rdec(R, 2, 9, 2); b = rdec(R, 1, 6, 1); return { q: nm2 + ' buys a book for $' + cash(a) + '$ and a pen for $' + cash(b) + '$. How much is that in all, in dollars?', a: num(ds(a.add(b)), 'dec'), unit: 'dollars', steps: addSubSteps(a, b, true), hint: 'Add the two prices. Line up the decimal points.' }; }
      if (t === 1) { a = rdec(R, 3, 9, 2); b = rdec(R, 1, 2.9, 1); if (b.ge(a)) b = q(15, 10); return { q: nm2 + ' ran $' + dt(a) + '$ km on Monday and $' + dt(b) + '$ km on Tuesday. How much farther did ' + nm2 + ' run on Monday?', a: num(ds(a.sub(b)), 'dec'), unit: 'km', steps: addSubSteps(a, b, false), hint: 'Subtract the shorter distance from the longer one.' }; }
      if (t === 2) { a = q(R.int(10, 20)); b = rdec(R, 2, 9, 2); return { q: nm2 + ' pays for a $' + cash(b) + '$ lunch with a $' + cash(a) + '$ bill. How much change, in dollars?', a: num(ds(a.sub(b)), 'dec'), unit: 'dollars', steps: ['Write $' + nc(a.num()) + '$ as $' + padDp(a, 2) + '$ so both have hundredths.'].concat(addSubSteps(a, b, false)), hint: 'Subtract the price from the money paid.' }; }
      a = rdec(R, 1, 3, 2); b = rdec(R, 0.2, 0.9, 3); return { q: 'A jug holds $' + dt(a) + '$ liters of water. ' + nm2 + ' pours out $' + dt(b) + '$ liters. How many liters are left?', a: num(ds(a.sub(b)), 'dec'), unit: 'liters', steps: addSubSteps(a, b, false), hint: 'Give both numbers three decimal places, then subtract.' };
    }
    plus = R.coin();
    if (lv === 1) { a = rdec(R, 1, 20, R.int(1, 2)); b = rdec(R, 1, 9, R.int(1, 2)); }
    else if (lv === 2) { var kind = R.int(0, 2); if (kind === 0) { a = q(R.int(3, 20)); b = rdec(R, 1, 2.99, 2); plus = false; } else { a = rdec(R, 5, 40, 1); b = rdec(R, 1, 9, 2); } }
    else { a = rdec(R, 2, 50, R.int(1, 3)); b = rdec(R, 0.1, 9, 3); }
    if (!plus && b.gt(a)) { var tt = a; a = b; b = tt; }
    if (!plus && a.eq(b)) plus = true;
    return {
      q: (plus ? 'Add' : 'Subtract') + ': $' + dt(a) + (plus ? ' + ' : ' - ') + dt(b) + '$.',
      a: num(ds(plus ? a.add(b) : a.sub(b)), 'dec'),
      steps: addSubSteps(a, b, plus),
      hint: 'Line up the decimal points, not the last digits. Fill empty places with 0.'
    };
  });

  // ---------------------------------------------------------------- g5.multiply-decimal-by-whole
  function unitName(dp) { return { 1: 'tenths', 2: 'hundredths', 3: 'thousandths' }[dp]; }
  function mulWholeSteps(n, x) {
    var dp = dpOf(x), k = Math.pow(10, dp), xi = Q.from(x).mul(k).num(), pr = n * xi, r = Q.from(x).mul(n);
    return ['Think of $' + dt(x) + '$ as ' + nc(xi) + ' ' + unitName(dp) + '.', '$' + n + X + nc(xi) + ' = ' + nc(pr) + '$, so the product is ' + nc(pr) + ' ' + unitName(dp) + '.',
      nc(pr) + ' ' + unitName(dp) + ' $= ' + padDp(r, dp) + (padDp(r, dp) !== dt(r) ? ' = ' + dt(r) : '') + '$.',
      'Check: $' + n + X + roundW(x) + ' = ' + n * roundW(x) + '$, close to $' + dt(r) + '$.'];
  }
  G('g5.multiply-decimal-by-whole', function (R, ctx) {
    var lv = L(ctx), n, x;
    if (lv === 1) { n = R.int(2, 9); x = R.coin() ? q(R.int(1, 9), 10) : rdec(R, 1, 9, 1); }
    else if (lv === 2) { n = R.int(3, 9); x = rdec(R, 0.11, 9.99, 2); }
    else { n = R.int(12, 36); x = R.coin() ? rdec(R, 1, 9, 1) : rdec(R, 0.11, 4.99, 2); }
    var r = x.mul(n), story = R.chance(lv === 1 ? 0.15 : 0.3);
    if (story) {
      var t = R.int(0, 2), nm = who(R);
      var qs = [nm + ' buys ' + n + ' notebooks that cost $' + cash(x) + '$ each. How much do they cost in all, in dollars?', 'A small bag of rice weighs $' + dt(x) + '$ kg. How many kilograms do ' + n + ' bags weigh?', nm + ' walks $' + dt(x) + '$ miles to school and back each day. How many miles is that in ' + n + ' days?'];
      return { q: qs[t], a: num(ds(r), 'dec'), unit: ['dollars', 'kg', 'miles'][t], steps: ['Equal groups: multiply $' + n + X + dt(x) + '$.'].concat(mulWholeSteps(n, x)), hint: 'Multiply as if there were no decimal point, then name the unit (tenths or hundredths).' };
    }
    return {
      q: 'Multiply: $' + n + X + dt(x) + '$.',
      a: num(ds(r), 'dec'),
      steps: mulWholeSteps(n, x),
      hint: 'How many ' + unitName(dpOf(x)) + ' is $' + dt(x) + '$? Multiply that by ' + n + '.'
    };
  });

  // ---------------------------------------------------------------- g5.multiply-decimals
  function mulDecSteps(a, b) {
    var da = dpOf(a), db = dpOf(b), ai = +intDigits(a), bi = +intDigits(b), pi = ai * bi, r = a.mul(b), n = da + db;
    var s = ['Multiply as whole numbers: $' + nc(ai) + X + nc(bi) + ' = ' + nc(pi) + '$.',
      '$' + dt(a) + '$ has ' + pl(da, 'decimal place') + ' and $' + dt(b) + '$ has ' + pl(db, 'decimal place') + ', so the product has ' + n + ' (' + unitName(da) + ' times ' + unitName(db) + ' make ' + (unitName(n) || 'ten-thousandths') + ').',
      'Count ' + n + ' places from the right' + (String(pi).length <= n ? ', writing zeros in front where needed' : '') + ': $' + padDp(r, n) + (padDp(r, n) !== dt(r) ? ' = ' + dt(r) : '') + '$.'];
    var ea = Math.max(roundW(a), 0), eb = Math.max(roundW(b), 0);
    if (a.lt(1) && b.lt(1)) s.push('Check: both factors are less than 1, so the product must be less than each of them.');
    else s.push('Check: $' + ea + X + eb + ' = ' + ea * eb + '$, close to $' + dt(r) + '$.');
    return s;
  }
  G('g5.multiply-decimals', function (R, ctx) {
    var lv = L(ctx), a, b, shape = R.pickW(['calc', 'spot', 'story'], [6, lv === 1 ? 2 : 1, lv === 1 ? 0 : 2]);
    if (shape === 'spot') {
      var x1 = R.int(2, 9), x2 = R.int(2, 9), nm = who(R); a = q(x1, 10); b = q(x2, 10);
      var wrong = q(x1 * x2, 10);
      return {
        q: nm + ' says $' + dt(a) + X + dt(b) + ' = ' + dt(wrong) + '$, lining up the decimal points as if adding. What is the correct product?',
        a: num(ds(a.mul(b)), 'dec'),
        steps: ['Tenths times tenths make hundredths: $' + fr(x1, 10) + X + fr(x2, 10) + ' = ' + fr(x1 * x2, 100) + '$.'].concat(mulDecSteps(a, b)),
        hint: 'What is a tenth of a tenth?'
      };
    }
    if (lv === 1) { if (R.coin()) { a = q(R.int(2, 9), 10); b = q(R.int(2, 9), 10); } else { a = rdec(R, 1.1, 4.9, 1); b = q(R.int(2, 9), 10); } }
    else if (lv === 2) { a = rdec(R, 1.1, 9.9, 1); b = rdec(R, 1.1, 5.9, 1); if (R.chance(0.3)) b = q(R.int(2, 9), 100); }
    else { a = rdec(R, 1.01, 9.99, 2); b = rdec(R, 1.1, 4.9, 1); if (R.chance(0.3)) { a = q(R.pick([25, 75, 45, 15, 35]), 100); b = q(R.pick([2, 4, 6, 8]), 10); } }
    if (R.coin()) { var tt = a; a = b; b = tt; }
    var r = a.mul(b);
    if (shape === 'story') {
      var nm2 = who(R), w = rdec(R, 1.5, 4.5, 1), pr = q(R.int(12, 49), 10);
      if (R.coin()) return { q: 'Grapes cost $' + cash(pr) + '$ per pound. ' + nm2 + ' buys $' + dt(w) + '$ pounds. How much does that cost, in dollars?', a: num(ds(pr.mul(w)), 'dec'), unit: 'dollars', steps: ['Multiply the price per pound by the number of pounds: $' + dt(w) + X + dt(pr) + '$.'].concat(mulDecSteps(w, pr)), hint: 'Multiply pounds by dollars per pound.' };
      var len = rdec(R, 2.1, 6.9, 1), wid = rdec(R, 1.1, 3.9, 1);
      return { q: 'A garden bed is $' + dt(len) + '$ m long and $' + dt(wid) + '$ m wide. What is its area in square meters?', a: num(ds(len.mul(wid)), 'dec'), unit: 'square meters', steps: ['Area = length × width: $' + dt(len) + X + dt(wid) + '$.'].concat(mulDecSteps(len, wid)), hint: 'Multiply the length by the width.' };
    }
    return {
      q: 'Multiply: $' + dt(a) + X + dt(b) + '$.',
      a: num(ds(r), 'dec'),
      steps: mulDecSteps(a, b),
      hint: 'Multiply without the points, then count the decimal places in both factors.'
    };
  });

  // ---------------------------------------------------------------- g5.divide-decimal-by-whole
  function divWholeSteps(x, n) {
    var r = x.div(n), dpr = dpOf(r), dpx = dpOf(x), use = Math.max(dpr, dpx), k = Math.pow(10, use), xi = x.mul(k).num(), qi = xi / n;
    var s = [];
    if (dpr > dpx) s.push('Write $' + dt(x) + '$ as $' + padDp(x, use) + '$ so it can be shared as ' + unitName(use) + ' (a zero at the end does not change the value).');
    s.push('$' + padDp(x, use) + '$ is ' + nc(xi) + ' ' + unitName(use) + '. Share them: $' + nc(xi) + DV + n + ' = ' + nc(qi) + '$, so each share is ' + nc(qi) + ' ' + unitName(use) + '.');
    s.push(nc(qi) + ' ' + unitName(use) + ' $= ' + dt(r) + '$.');
    s.push('Check: $' + dt(r) + X + n + ' = ' + dt(x) + '$.');
    return s;
  }
  G('g5.divide-decimal-by-whole', function (R, ctx) {
    var lv = L(ctx), n, r, x;
    for (var t = 0; t < 100; t++) {
      if (lv === 1) { n = R.int(2, 6); r = rdec(R, 0.2, 3.9, 1); }
      else if (lv === 2) { n = R.int(3, 9); r = rdec(R, 0.11, 4.99, 2); }
      else { if (R.coin()) { n = R.int(11, 25); r = rdec(R, 0.2, 3.9, 1); } else { n = R.pick([4, 5, 8]); r = rdec(R, 0.11, 2.99, 2); } }
      x = r.mul(n); if (dpOf(x) >= 1) break;
    }
    var story = R.chance(lv === 1 ? 0.15 : 0.35);
    if (story) {
      var nm = who(R), k = R.int(0, 2);
      var qs = [n + ' friends share $' + cash(x) + '$ equally. How much does each friend get, in dollars?', 'A ribbon $' + dt(x) + '$ m long is cut into ' + n + ' equal pieces. How long is each piece, in meters?', nm + ' pours $' + dt(x) + '$ liters of juice equally into ' + n + ' bottles. How many liters go in each bottle?'];
      return { q: qs[k], a: num(ds(r), 'dec'), unit: ['dollars', 'meters', 'liters'][k], steps: ['Share equally: divide $' + dt(x) + DV + n + '$.'].concat(divWholeSteps(x, n)), hint: 'Divide as if sharing whole things, then name the unit.' };
    }
    return {
      q: 'Divide: $' + dt(x) + DV + n + '$.',
      a: num(ds(r), 'dec'),
      steps: divWholeSteps(x, n),
      hint: 'Share the tenths and hundredths the same way you share ones. Estimate first: about $' + roundW(x) + DV + n + '$.'
    };
  });

  // ---------------------------------------------------------------- g5.divide-by-decimal
  function byDecSteps(x, d) {
    var k = Math.pow(10, dpOf(d)), x2 = x.mul(k), d2 = d.mul(k), r = x.div(d);
    var s = ['Make the divisor a whole number: multiply both numbers by ' + nc(k) + '. Scaling both numbers the same way does not change the quotient.', '$' + dt(x) + DV + dt(d) + ' = ' + dt(x2) + DV + dt(d2) + '$' + (dpOf(x) < dpOf(d) ? ' (write zeros to fill the places)' : '') + '.'];
    s.push('$' + dt(x2) + DV + dt(d2) + ' = ' + dt(r) + '$.');
    s.push('Check: $' + dt(r) + X + dt(d) + ' = ' + dt(x) + '$.');
    return s;
  }
  G('g5.divide-by-decimal', function (R, ctx) {
    var lv = L(ctx), d, r, x;
    for (var t = 0; t < 100; t++) {
      if (lv === 1) { d = q(R.int(2, 9), 10); r = q(R.int(2, 12)); }
      else if (lv === 2) { if (R.coin()) { d = q(R.pick([2, 4, 5, 25, 15, 12, 8, 6]), 100); r = q(R.int(2, 15)); } else { d = rdec(R, 0.2, 2.5, 1); r = rdec(R, 1.1, 9.9, 1); } }
      else { if (R.coin()) { d = q(R.pick([25, 5, 2, 4, 75, 125]), R.pick([100, 1000])); r = q(R.int(4, 60)); } else { d = rdec(R, 0.11, 1.9, 2); r = rdec(R, 1.1, 9.9, 1); } }
      x = r.mul(d); if (dpOf(x) <= 3 && x.gt(0)) break;
    }
    var shape = R.pickW(['calc', 'same', 'story'], [5, 2, lv === 1 ? 1 : 2]);
    if (shape === 'same') {
      var k = Math.pow(10, dpOf(d)), right = '$' + dt(x.mul(k)) + DV + dt(d.mul(k)) + '$';
      return {
        q: 'Which division has the same quotient as $' + dt(x) + DV + dt(d) + '$?',
        a: mc(right, ['$' + dt(x) + DV + dt(d.mul(k)) + '$', '$' + dt(x.mul(k)) + DV + dt(d) + '$', '$' + dt(x.div(k)) + DV + dt(d.mul(k)) + '$']),
        steps: ['Multiplying both numbers by the same number keeps the quotient the same, like $6 \\div 2 = 60 \\div 20$.', 'Multiply both by ' + nc(k) + ': ' + right + '.', 'Moving the point in only one number changes the answer.'],
        hint: 'Both numbers must be multiplied by the same power of 10.'
      };
    }
    if (shape === 'story') {
      var nm = who(R), t2 = R.int(0, 2), each = q(R.pick([['0.2', '0.4', '0.5', '0.25', '0.75', '1.5', '1.2'], ['0.25', '0.5', '0.75', '0.4', '0.6', '0.35'], ['0.2', '0.25', '0.3', '0.4', '0.5', '0.15']][t2])), cnt = R.int(4, 16), tot = each.mul(cnt);
      var qs = ['A $' + dt(tot) + '$-meter rope is cut into pieces that are each $' + dt(each) + '$ m long. How many pieces?', nm + ' has $' + cash(tot) + '$. Stickers cost $' + cash(each) + '$ each. How many stickers can ' + nm + ' buy with all of it?', 'A pitcher holds $' + dt(tot) + '$ liters. Each glass holds $' + dt(each) + '$ liters. How many glasses can be filled?'];
      return { q: qs[t2], a: num(cnt, 'int'), steps: ['How many groups of $' + dt(each) + '$ fit in $' + dt(tot) + '$? Divide.'].concat(byDecSteps(tot, each)), hint: 'Divide the total by the size of one piece.' };
    }
    return {
      q: 'Divide: $' + dt(x) + DV + dt(d) + '$.',
      a: num(ds(r), 'dec'),
      steps: byDecSteps(x, d),
      hint: 'Multiply both numbers by 10 (or 100) until the divisor is a whole number.'
    };
  });

  // ---------------------------------------------------------------- g5.estimate-decimal-products
  G('g5.estimate-decimal-products', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['place', 'est', 'pick', 'tf'], [3, 3, 2, 2]);
    var a = rdec(R, 1.1, 9.9, 1), b = rdec(R, 1.1, 9.9, 1);
    if (lv > 1 && R.coin()) a = rdec(R, 1.01, 9.99, 2);
    if (lv === 3 && R.chance(0.3)) a = rdec(R, 11, 49, 1);
    var r = a.mul(b), ea = roundW(a), eb = roundW(b), est = ea * eb, digits = intDigits(r);
    if (shape === 'place') return {
      q: 'Without the decimal point, the product $' + dt(a) + X + dt(b) + '$ has the digits ' + digits + '. Use an estimate to place the decimal point. What is the product?',
      a: num(ds(r), 'dec'),
      steps: ['Estimate: $' + dt(a) + '$ is about ' + ea + ' and $' + dt(b) + '$ is about ' + eb + ', so the product is about $' + ea + X + eb + ' = ' + est + '$.', 'The only way to place the point in ' + digits + ' that is close to ' + est + ' is $' + dt(r) + '$.'],
      hint: 'Round each factor to a whole number and multiply.'
    };
    if (shape === 'est') return {
      q: 'Estimate $' + dt(a) + X + dt(b) + '$ by rounding each factor to the nearest whole number. What is your estimate?',
      a: num(est, 'int'),
      steps: ['$' + dt(a) + '$ rounds to ' + ea + ' and $' + dt(b) + '$ rounds to ' + eb + '.', 'The estimate is $' + ea + X + eb + ' = ' + est + '$. (The exact product is $' + dt(r) + '$.)'],
      hint: 'Round each number first, then multiply.'
    };
    var k = R.pick([10, 100]);
    if (shape === 'pick') return {
      q: 'Which is the exact value of $' + dt(a) + X + dt(b) + '$?',
      a: mc('$' + dt(r) + '$', ['$' + dt(r.mul(10)) + '$', '$' + dt(r.div(10)) + '$', '$' + dt(r.mul(100)) + '$', '$' + dt(r.div(100)) + '$']),
      steps: ['All the choices have the same digits, so use an estimate: about $' + ea + X + eb + ' = ' + est + '$.', 'The choice closest to ' + est + ' is $' + dt(r) + '$.'],
      hint: 'Round each factor to a whole number to see about how big the product is.'
    };
    var ok = R.coin(), claim = ok ? r : (R.coin() ? r.mul(k) : r.div(k)), nm = who(R);
    return {
      q: nm + ' says $' + dt(a) + X + dt(b) + ' = ' + dt(claim) + '$. Use an estimate: is that reasonable?',
      a: keep(['Yes, it is reasonable', 'No, it is not reasonable'], ok ? 0 : 1),
      steps: ['Estimate: $' + ea + X + eb + ' = ' + est + '$.', ok ? '$' + dt(claim) + '$ is close to ' + est + ', so it is reasonable. (It is the exact product.)' : '$' + dt(claim) + '$ is far from ' + est + ', so the decimal point is in the wrong place. The product is $' + dt(r) + '$.'],
      hint: 'Round both factors to whole numbers and compare.'
    };
  });

  // ---------------------------------------------------------------- g5.decimal-word-problems
  G('g5.decimal-word-problems', function (R, ctx) {
    var lv = L(ctx), nm = who(R), t = R.int(0, lv === 1 ? 4 : 6);
    if (t === 0) {
      var n = R.int(2, 4), p = rdec(R, 1.25, 4.95, 2), p2 = rdec(R, 0.5, 2.5, 2), tot = p.mul(n).add(p2), pay = q(Math.floor(tot.toNumber() / 5) * 5 + 5 + (lv > 1 ? 5 : 0));
      return { q: nm + ' buys ' + n + ' notebooks at $' + cash(p) + '$ each and one pen for $' + cash(p2) + '$, and pays with $' + cash(pay) + '$. How much change, in dollars?', a: num(ds(pay.sub(tot)), 'dec'), unit: 'dollars',
        steps: ['Notebooks: $' + n + X + dt(p) + ' = ' + dt(p.mul(n)) + '$.', 'Add the pen: $' + dt(p.mul(n)) + ' + ' + dt(p2) + ' = ' + dt(tot) + '$.', 'Change: $' + dt(pay) + ' - ' + dt(tot) + ' = ' + dt(pay.sub(tot)) + '$, which is $' + cash(pay.sub(tot)) + '$.'], hint: 'First find the total cost, then subtract it from the money paid.' };
    }
    if (t === 1) {
      var each = q(R.pick(['0.25', '0.5', '0.75', '0.4', '0.6', '0.8', '1.5', '1.2'])), cnt = R.int(4, 16), len = each.mul(cnt);
      return { q: 'A ribbon is $' + dt(len) + '$ meters long. ' + nm + ' cuts it into pieces that are $' + dt(each) + '$ m long. How many pieces?', a: num(cnt, 'int'),
        steps: ['How many groups of $' + dt(each) + '$ fit in $' + dt(len) + '$? Divide.'].concat(byDecSteps(len, each)), hint: 'Divide the length by the size of one piece.' };
    }
    if (t === 2) {
      var d = rdec(R, 1.5, 4.5, 2), days = R.int(4, 7), goal = q(Math.round(d.toNumber() * days) + R.int(-2, 2));
      var run = d.mul(days), diff = goal.sub(run), over = diff.lt(0);
      if (diff.isZero()) { goal = goal.add(1); diff = goal.sub(run); over = false; }
      return { q: nm + ' runs $' + dt(d) + '$ km every day for ' + days + ' days. The goal was $' + dt(goal) + '$ km. ' + (over ? 'By how many kilometers did ' + nm + ' beat the goal?' : 'How many more kilometers are needed to reach the goal?'), a: num(ds(diff.abs()), 'dec'), unit: 'km',
        steps: ['Total run: $' + days + X + dt(d) + ' = ' + dt(run) + '$ km.', over ? 'Beat the goal by $' + dt(run) + ' - ' + dt(goal) + ' = ' + dt(diff.abs()) + '$ km.' : 'Still needed: $' + dt(goal) + ' - ' + dt(run) + ' = ' + dt(diff.abs()) + '$ km.'], hint: 'Find the total distance first, then compare it with the goal.' };
    }
    if (t === 3) {
      var cost = rdec(R, 3, 9, 2), people = R.int(2, 5), bill = cost.mul(people);
      return { q: 'A lunch bill of $' + cash(bill) + '$ is split equally among ' + people + ' friends. How much does each friend pay, in dollars?', a: num(ds(cost), 'dec'), unit: 'dollars', steps: ['Share equally: $' + dt(bill) + DV + people + '$.'].concat(divWholeSteps(bill, people)), hint: 'Divide the bill by the number of friends.' };
    }
    if (t === 4) {
      var cap = rdec(R, 1, 2, 1), drank = rdec(R, 0.15, 0.95, 2);
      return { q: 'A water bottle holds $' + dt(cap) + '$ liters. ' + nm + ' drinks $' + dt(drank) + '$ liters. How many liters are left?', a: num(ds(cap.sub(drank)), 'dec'), unit: 'liters', steps: addSubSteps(cap, drank, false), hint: 'Subtract what was drunk from what the bottle holds.' };
    }
    if (t === 5) {
      var lb = rdec(R, 1.5, 3.5, 1), per = q(R.int(12, 59), 10), c2 = lb.mul(per), pay2 = q(Math.floor(c2.toNumber() / 10) * 10 + 10);
      return { q: 'Cheese costs $' + cash(per) + '$ per pound. ' + nm + ' buys $' + dt(lb) + '$ pounds and pays with $' + cash(pay2) + '$. How much change, in dollars?', a: num(ds(pay2.sub(c2)), 'dec'), unit: 'dollars',
        steps: ['Cost: $' + dt(lb) + X + dt(per) + '$.'].concat(mulDecSteps(lb, per).slice(0, 3), ['Change: $' + dt(pay2) + ' - ' + dt(c2) + ' = ' + dt(pay2.sub(c2)) + '$.']), hint: 'Two steps: find the cost, then the change.' };
    }
    var w = rdec(R, 2.1, 6.9, 1), l2 = rdec(R, 3.1, 8.9, 1), area = w.mul(l2);
    return { q: 'A rectangular patio is $' + dt(l2) + '$ m by $' + dt(w) + '$ m. What is its area in square meters?', a: num(ds(area), 'dec'), unit: 'square meters', steps: ['Area = length × width: $' + dt(l2) + X + dt(w) + '$.'].concat(mulDecSteps(l2, w)), hint: 'Multiply the length by the width.' };
  });


  /* ================================================================ unit: adding and subtracting fractions */
  var DEN1 = [[2, 4], [2, 6], [2, 8], [3, 6], [3, 9], [4, 8], [2, 10], [5, 10], [3, 12], [4, 12], [6, 12]];
  var DEN2 = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 8], [2, 9], [3, 10], [4, 9]];
  var DEN3 = [[4, 6], [6, 8], [6, 9], [8, 12], [10, 12], [6, 10], [4, 10], [9, 12], [8, 10]];
  function dens(R, lv) { var p = R.pick(lv === 1 ? DEN1 : lv === 2 ? R.pick([DEN1, DEN2, DEN2]) : R.pick([DEN2, DEN3, DEN3])); return R.coin() ? p : [p[1], p[0]]; }
  function coNum(R, d, lo, hi) { var ok = []; for (var n = lo || 1; n <= (hi || d - 1); n++) if (U.gcd(n, d) === 1) ok.push(n); return R.pick(ok); }
  function F(n, d) { return { n: n, d: d, q: Q(n, d) }; }
  function ftx(f) { return fr(f.n, f.d); }
  /* rename two fractions to the least common denominator */
  function renameSteps(f1, f2) {
    var m = U.lcm(f1.d, f2.d), k1 = m / f1.d, k2 = m / f2.d, s = [];
    if (f1.d === f2.d) return { m: m, n1: f1.n, n2: f2.n, s: ['The denominators already match.'] };
    s.push('Find a common denominator: the least common multiple of ' + f1.d + ' and ' + f2.d + ' is ' + m + '.');
    var r1 = k1 === 1 ? '$' + ftx(f1) + '$ already has denominator ' + m : '$' + ftx(f1) + ' = ' + fr(f1.n + ' \\times ' + k1, f1.d + ' \\times ' + k1) + ' = ' + fr(f1.n * k1, m) + '$';
    var r2 = k2 === 1 ? '$' + ftx(f2) + '$ already has denominator ' + m : '$' + ftx(f2) + ' = ' + fr(f2.n + ' \\times ' + k2, f2.d + ' \\times ' + k2) + ' = ' + fr(f2.n * k2, m) + '$';
    s.push('Rename: ' + r1 + ' and ' + r2 + '.');
    return { m: m, n1: f1.n * k1, n2: f2.n * k2, s: s };
  }
  function addSubFrac(f1, f2, plus) {
    var rn = renameSteps(f1, f2), rn2 = plus ? rn.n1 + rn.n2 : rn.n1 - rn.n2, r = Q(rn2, rn.m), s = rn.s.slice();
    s.push((plus ? 'Add' : 'Subtract') + ' the numerators; the size of the pieces stays the same: $' + fr(rn.n1, rn.m) + (plus ? ' + ' : ' - ') + fr(rn.n2, rn.m) + ' = ' + fr(rn2, rn.m) + '$.');
    if (U.gcd(rn2, rn.m) > 1 || r.gt(1)) s.push('Simplify: $' + fr(rn2, rn.m) + ' = ' + fm(r) + '$.');
    return { r: r, s: s };
  }
  function randF(R, d, lv) { return F(coNum(R, d), d); }

  // ---------------------------------------------------------------- g5.common-denominators
  G('g5.common-denominators', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['rename', 'lcd', 'pick', 'one'], [4, 2, lv === 1 ? 1 : 2, lv === 1 ? 2 : 1]);
    var dd = dens(R, lv), f1 = randF(R, dd[0]), f2 = randF(R, dd[1]), m = U.lcm(f1.d, f2.d), rn = renameSteps(f1, f2);
    if (shape === 'one') {
      var d = R.pick([2, 3, 4, 5, 6]), f = randF(R, d), k = R.int(2, lv === 1 ? 5 : 8), m1 = d * k;
      return {
        q: 'Fill in the box: $' + ftx(f) + ' = ' + fr('\\square', m1) + '$.',
        a: num(f.n * k, 'int'),
        steps: ['To get from ' + d + ' to ' + m1 + ', multiply by ' + k + '.', 'Multiply the numerator by ' + k + ' too: $' + ftx(f) + ' = ' + fr(f.n * k, m1) + '$. Each piece is cut into ' + k + ' smaller pieces, so there are ' + k + ' times as many.'],
        hint: 'What did the denominator get multiplied by?'
      };
    }
    if (shape === 'lcd') return {
      q: 'What is the least common denominator of $' + ftx(f1) + '$ and $' + ftx(f2) + '$?',
      a: num(m, 'int'),
      steps: ['List multiples of ' + Math.max(f1.d, f2.d) + ': ' + [1, 2, 3, 4, 5, 6].map(function (i) { return i * Math.max(f1.d, f2.d); }).filter(function (v) { return v <= m; }).join(', ') + '.', 'The first one that ' + Math.min(f1.d, f2.d) + ' also divides into is ' + m + '.'],
      hint: 'Count by the larger denominator until you reach a number the smaller one divides into.'
    };
    if (shape === 'pick') {
      var right = '$' + fr(rn.n1, m) + '$ and $' + fr(rn.n2, m) + '$';
      var wr = ['$' + fr(f1.n, m) + '$ and $' + fr(f2.n, m) + '$', '$' + fr(rn.n1, m) + '$ and $' + fr(f2.n, m) + '$', '$' + fr(f1.n, m) + '$ and $' + fr(rn.n2, m) + '$', '$' + fr(f1.n + (m - f1.d), m) + '$ and $' + fr(f2.n + (m - f2.d), m) + '$'];
      wr = wr.filter(function (w) { return w !== right; });
      return {
        q: 'Which pair shows $' + ftx(f1) + '$ and $' + ftx(f2) + '$ renamed with a common denominator?',
        a: mc(right, wr),
        steps: rn.s.concat(['Whatever you multiply the denominator by, multiply the numerator by the same number. Changing only the bottom changes the amount.']),
        hint: 'Multiply the top and the bottom of each fraction by the same number.'
      };
    }
    return {
      q: 'Rename $' + ftx(f1) + '$ and $' + ftx(f2) + '$ with the common denominator ' + m + '.',
      a: { t: 'multi', parts: [{ label: '$' + ftx(f1) + ' = ' + fr('\\square', m) + '$', a: num(rn.n1, 'int') }, { label: '$' + ftx(f2) + ' = ' + fr('\\square', m) + '$', a: num(rn.n2, 'int') }] },
      steps: rn.s.length > 1 ? rn.s.slice(1) : rn.s,
      hint: 'For each fraction: what times the denominator makes ' + m + '? Multiply the numerator by that too.'
    };
  });

  // ---------------------------------------------------------------- g5.add-unlike-fractions
  G('g5.add-unlike-fractions', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['calc', 'spot', 'three', 'story'], [6, 2, lv === 3 ? 2 : 0, lv === 1 ? 0 : 2]);
    if (shape === 'three') {
      var trio = R.pick([[2, 3, 6], [2, 4, 8], [3, 4, 6], [2, 5, 10], [3, 6, 4], [2, 3, 4]]), fs = trio.map(function (d) { return randF(R, d); });
      var m = U.lcm(trio[0], trio[1], trio[2]), ns = fs.map(function (f) { return f.n * m / f.d; }), tot = Q(ns[0] + ns[1] + ns[2], m);
      return {
        q: 'Add: $' + fs.map(ftx).join(' + ') + '$.',
        a: num(tot.toString()),
        steps: ['A common denominator for ' + trio.join(', ') + ' is ' + m + '.', 'Rename: $' + fs.map(function (f, i) { return ftx(f) + ' = ' + fr(ns[i], m); }).join(',\\; ') + '$.', 'Add the numerators: $' + fr(ns.join(' + '), m) + ' = ' + fr(ns[0] + ns[1] + ns[2], m) + '$.', 'Simplify: $' + fm(tot) + '$.'],
        hint: 'Find one denominator that all three denominators divide into.'
      };
    }
    var dd = dens(R, lv), f1 = randF(R, dd[0]), f2 = randF(R, dd[1]), res = addSubFrac(f1, f2, true);
    if (shape === 'spot') {
      var b1 = R.pick([2, 3, 4, 5]), b2 = R.intNot(2, 6, b1); f1 = randF(R, b1); f2 = F(1, b2);
      res = addSubFrac(f1, f2, true); var nm = who(R), wrong = fr(f1.n + f2.n, f1.d + f2.d);
      return {
        q: nm + ' added the tops and the bottoms: $' + ftx(f1) + ' + ' + ftx(f2) + ' = ' + wrong + '$. What is the correct sum?',
        a: num(res.r.toString()),
        steps: ['$' + wrong + '$ cannot be right: it is less than $' + ftx(Q.max(f1.q, f2.q).eq(f1.q) ? f1 : f2) + '$, but a sum must be more than each part.', 'The pieces are different sizes, so rename them to same-size pieces first.'].concat(res.s),
        hint: 'You can only add pieces of the same size.'
      };
    }
    if (shape === 'story') {
      var nm2 = who(R), t = R.int(0, 2);
      var qs = [nm2 + ' walks $' + ftx(f1) + '$ mile to the park and then $' + ftx(f2) + '$ mile to a friend\'s house. How far does ' + nm2 + ' walk in all, in miles?', 'A recipe uses $' + ftx(f1) + '$ cup of milk and $' + ftx(f2) + '$ cup of water. How many cups of liquid is that?', nm2 + ' paints $' + ftx(f1) + '$ of a fence in the morning and $' + ftx(f2) + '$ of it in the afternoon. What fraction of the fence is painted?'];
      if (t === 2 && res.r.gt(1)) t = 1;
      return { q: qs[t], a: num(res.r.toString()), steps: ['Put the two amounts together: add $' + ftx(f1) + ' + ' + ftx(f2) + '$.'].concat(res.s), hint: 'Add the two fractions. Rename them with a common denominator first.' };
    }
    return {
      q: 'Add: $' + ftx(f1) + ' + ' + ftx(f2) + '$.',
      a: num(res.r.toString()),
      steps: res.s,
      hint: 'Rename both fractions with a common denominator, then add the numerators.'
    };
  });

  // ---------------------------------------------------------------- g5.subtract-unlike-fractions
  G('g5.subtract-unlike-fractions', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['calc', 'missing', 'story'], [6, lv === 1 ? 0 : 2, lv === 1 ? 1 : 2]), f1, f2;
    for (var t = 0; t < 100; t++) { var dd = dens(R, lv); f1 = randF(R, dd[0]); f2 = randF(R, dd[1]); if (!f1.q.eq(f2.q)) break; }
    if (f1.q.lt(f2.q)) { var tt = f1; f1 = f2; f2 = tt; }
    var res = addSubFrac(f1, f2, false);
    if (shape === 'missing') return {
      q: 'What fraction goes in the box? $\\square + ' + ftx(f2) + ' = ' + ftx(f1) + '$',
      a: num(res.r.toString()),
      steps: ['The missing part is the whole minus the known part: $' + ftx(f1) + ' - ' + ftx(f2) + '$.'].concat(res.s, ['Check: $' + res.r.toTex() + ' + ' + ftx(f2) + ' = ' + ftx(f1) + '$.']),
      hint: 'Subtract to find a missing addend.'
    };
    if (shape === 'story') {
      var nm = who(R), k = R.int(0, 2);
      var qs = ['There was $' + ftx(f1) + '$ of a pizza left. ' + nm + ' ate $' + ftx(f2) + '$ of the whole pizza. What fraction of the pizza is left now?', 'A board is $' + ftx(f1) + '$ yard long. ' + nm + ' cuts off $' + ftx(f2) + '$ yard. How long is the piece that is left, in yards?', nm + ' had $' + ftx(f1) + '$ cup of flour and used $' + ftx(f2) + '$ cup. How much flour is left, in cups?'];
      return { q: qs[k], a: num(res.r.toString()), steps: ['Take away: $' + ftx(f1) + ' - ' + ftx(f2) + '$.'].concat(res.s), hint: 'Subtract. Rename with a common denominator first.' };
    }
    return {
      q: 'Subtract: $' + ftx(f1) + ' - ' + ftx(f2) + '$.',
      a: num(res.r.toString()),
      steps: res.s.concat(['Check by adding: $' + res.r.toTex() + ' + ' + ftx(f2) + ' = ' + ftx(f1) + '$.']),
      hint: 'Rename both fractions with a common denominator, then subtract the numerators.'
    };
  });

  // ---------------------------------------------------------------- g5.unlike-mixed-numbers
  function mixT(w, f) { return (w ? w : '') + ftx(f); }
  function mixedOp(w1, f1, w2, f2, plus) {
    var rn = renameSteps(f1, f2), m = rn.m, a = rn.n1, b = rn.n2, s = rn.s.slice(), W = plus ? w1 + w2 : w1 - w2, n;
    s[s.length - 1] = s[s.length - 1].replace('Rename:', 'Rename the fraction parts:');
    if (plus) {
      n = a + b; s.push('Add the wholes and the fractions: $' + (w1 + w2) + '$ and $' + fr(a, m) + ' + ' + fr(b, m) + ' = ' + fr(n, m) + '$.');
      if (n >= m) { s.push('$' + fr(n, m) + '$ is more than 1: $' + fr(n, m) + ' = 1' + fr(n - m, m) + '$, so carry 1 whole: $' + (W + 1) + (n - m ? fr(n - m, m) : '') + '$.'); W += 1; n -= m; }
    } else {
      if (a < b) { s.push('$' + fr(a, m) + '$ is less than $' + fr(b, m) + '$, so regroup one whole: $' + w1 + fr(a, m) + ' = ' + (w1 - 1) + fr(a + m, m) + '$.'); a += m; W -= 1; }
      n = a - b; s.push('Subtract the wholes and the fractions: $' + W + '$ and $' + fr(a, m) + ' - ' + fr(b, m) + ' = ' + fr(n, m) + '$.');
    }
    var r = Q(W * m + n, m);
    if (n && U.gcd(n, m) > 1) s.push('Simplify the fraction: $' + fr(n, m) + ' = ' + Q(n, m).toTex() + '$.');
    s.push('The answer is $' + mt(r) + '$.');
    return { r: r, s: s };
  }
  G('g5.unlike-mixed-numbers', function (R, ctx) {
    var lv = L(ctx), plus, need, w1, w2, f1, f2, res;
    plus = lv === 1 ? true : lv === 2 ? R.coin() : R.chance(0.35);
    need = lv === 1 ? R.chance(0.3) : R.chance(0.7);
    for (var t = 0; t < 300; t++) {
      var dd = dens(R, lv); f1 = randF(R, dd[0]); f2 = randF(R, dd[1]);
      w1 = R.int(2, 9); w2 = R.int(1, plus ? 9 : w1 - 1);
      var m = U.lcm(f1.d, f2.d), a = f1.n * m / f1.d, b = f2.n * m / f2.d;
      var regroup = plus ? a + b >= m : a < b;
      if (regroup === need && (plus || w1 > w2 || (w1 === w2 && a > b))) break;
    }
    if (!plus && w1 <= w2) { w1 = w2 + R.int(1, 3); }
    res = mixedOp(w1, f1, w2, f2, plus);
    var qtex = mixT(w1, f1) + (plus ? ' + ' : ' - ') + mixT(w2, f2);
    if (!plus && lv === 3 && R.chance(0.35)) {
      var m2 = U.lcm(f1.d, f2.d), a2 = f1.n * m2 / f1.d, b2 = f2.n * m2 / f2.d;
      if (a2 < b2) {
        var wrong = Q((w1 - w2) * m2 + (b2 - a2), m2), nm = who(R);
        return {
          q: nm + ' wrote $' + qtex + ' = ' + mt(wrong) + '$ by subtracting the smaller fraction from the larger one. What is the correct difference?',
          a: num(res.r.toString()),
          steps: ['The fraction $' + ftx(f2) + '$ is the one being taken away, even though it is the larger fraction. You cannot swap them.'].concat(res.s, ['Check: $' + mt(res.r) + ' + ' + mixT(w2, f2) + ' = ' + mixT(w1, f1) + '$.']),
          hint: 'Regroup one whole from ' + w1 + ' so there are enough pieces to take away.'
        };
      }
    }
    return {
      q: (plus ? 'Add' : 'Subtract') + ': $' + qtex + '$.',
      a: num(res.r.toString()),
      steps: res.s,
      hint: plus ? 'Rename the fractions with a common denominator, add, and carry a whole if the fraction part is 1 or more.' : 'Rename the fractions with a common denominator. If the first fraction is smaller, regroup one whole.'
    };
  });

  // ---------------------------------------------------------------- g5.fraction-estimates
  function bench(qv) { var v = qv.toNumber(); return v < 0.25 ? Q(0) : v < 0.75 ? Q(1, 2) : Q(1); }
  function nearBench(R) { // a fraction within 1/8 of 0, 1/2 or 1 (and not a benchmark itself)
    for (;;) { var d = R.pick([5, 6, 7, 8, 9, 10, 11, 12]), n = R.int(1, d - 1); if (U.gcd(n, d) !== 1) continue; var v = n / d, b = v < 0.25 ? 0 : v < 0.75 ? 0.5 : 1; if (Math.abs(v - b) <= 0.125 && n * 2 !== d) return F(n, d); }
  }
  function bt(x) { return x.isZero() ? '0' : x.toMixedTex(); }
  G('g5.fraction-estimates', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['near', 'est', 'tf', 'story', 'more'], [lv === 1 ? 3 : 1, 3, 2, 2, 2]);
    if (shape === 'near') {
      var f = nearBench(R), b = bench(f.q);
      return {
        q: 'Is $' + ftx(f) + '$ closest to $0$, $\\frac{1}{2}$ or $1$?',
        a: keep(['$0$', '$\\frac{1}{2}$', '$1$'], b.isZero() ? 0 : b.eq(1) ? 2 : 1),
        steps: ['Half of ' + f.d + ' is ' + (f.d % 2 ? (f.d - 1) / 2 + ' and a half' : f.d / 2) + '. ' + (f.d % 2 ? 'So $\\frac{1}{2}$ is between $' + fr((f.d - 1) / 2, f.d) + '$ and $' + fr((f.d + 1) / 2, f.d) + '$.' : 'So $\\frac{1}{2} = ' + fr(f.d / 2, f.d) + '$.'), 'The numerator ' + f.n + ' is ' + (b.isZero() ? 'close to 0' : b.eq(1) ? 'close to the denominator ' + f.d : 'close to half of ' + f.d) + '.', 'So $' + ftx(f) + '$ is closest to $' + bt(b) + '$.'],
        hint: 'Compare the numerator with the denominator and with half the denominator.'
      };
    }
    var f1, f2, e1, e2, est, sum;
    for (var tr = 0; tr < 50; tr++) { f1 = nearBench(R); f2 = nearBench(R); e1 = bench(f1.q); e2 = bench(f2.q); est = e1.add(e2); sum = f1.q.add(f2.q); if (f1.d !== f2.d && est.gt(0)) break; }
    if (shape === 'est') {
      var opts = [Q(0), Q(1, 2), Q(1), Q(3, 2), Q(2)], wr = opts.filter(function (o) { return !o.eq(est); });
      var wro = wr.sort(function (x, y) { return Math.abs(x.toNumber() - est.toNumber()) - Math.abs(y.toNumber() - est.toNumber()); }).slice(0, 3);
      return {
        q: 'Use benchmarks ($0$, $\\frac{1}{2}$ and $1$) to estimate $' + ftx(f1) + ' + ' + ftx(f2) + '$.',
        a: mc('about $' + bt(est) + '$', wro.map(function (o) { return 'about $' + bt(o) + '$'; })),
        steps: ['$' + ftx(f1) + '$ is close to $' + bt(e1) + '$ and $' + ftx(f2) + '$ is close to $' + bt(e2) + '$.', 'So the sum is about $' + bt(e1) + ' + ' + bt(e2) + ' = ' + bt(est) + '$. (The exact sum is $' + fm(sum) + '$.)'],
        hint: 'Round each fraction to the nearest of 0, one half and 1.',
        nolint: ['+ 0']
      };
    }
    if (shape === 'more') {
      var f3, f4, s2;
      for (var t = 0; t < 100; t++) { f3 = randF(R, R.pick([3, 4, 5, 6, 8, 10])); f4 = randF(R, R.pick([3, 4, 5, 6, 8, 10, 12])); s2 = f3.q.add(f4.q); if (!s2.eq(1) && f3.d !== f4.d) break; }
      var gt = s2.gt(1);
      return {
        q: 'Without finding the exact sum, is $' + ftx(f3) + ' + ' + ftx(f4) + '$ greater than $1$ or less than $1$?',
        a: keep(['greater than $1$', 'less than $1$'], gt ? 0 : 1),
        steps: ['Compare each fraction with $\\frac{1}{2}$: $' + ftx(f3) + '$ is ' + (f3.q.gt(Q(1, 2)) ? 'more than' : f3.q.eq(Q(1, 2)) ? 'equal to' : 'less than') + ' $\\frac{1}{2}$ and $' + ftx(f4) + '$ is ' + (f4.q.gt(Q(1, 2)) ? 'more than' : f4.q.eq(Q(1, 2)) ? 'equal to' : 'less than') + ' $\\frac{1}{2}$.', 'The exact sum is $' + fm(s2) + '$, which is ' + (gt ? 'greater' : 'less') + ' than 1.'],
        hint: 'Is each fraction more or less than one half?'
      };
    }
    if (shape === 'tf') {
      var ok = R.chance(0.35), g1 = randF(R, R.pick([2, 3, 4, 5])), g2 = randF(R, R.pick([2, 3, 4, 5, 6])), nm = who(R);
      if (g1.d === g2.d) g2 = randF(R, g1.d === 6 ? 5 : 6);
      var right = g1.q.add(g2.q), claim = ok ? fm(right) : fr(g1.n + g2.n, g1.d + g2.d);
      return {
        q: nm + ' says $' + ftx(g1) + ' + ' + ftx(g2) + ' = ' + claim + '$. Is that reasonable?',
        a: keep(['Yes, it is reasonable', 'No, it is not reasonable'], ok ? 0 : 1),
        steps: ok ? ['Each fraction is less than 1, and the sum must be more than each of them.', '$' + claim + '$ is more than both, and it is the exact sum, so it is reasonable.'] : ['A sum must be more than each of its parts.', '$' + claim + '$ is less than $' + ftx(Q.max(g1.q, g2.q).eq(g1.q) ? g1 : g2) + '$, so it cannot be right. (Adding the tops and the bottoms does not work.)', 'The sum is $' + fm(right) + '$.'],
        hint: 'Compare the answer with each fraction being added.'
      };
    }
    var dd = dens(R, Math.max(2, lv)), h1 = randF(R, dd[0]), h2 = randF(R, dd[1]), plus = R.coin(), nm3 = who(R);
    if (!plus && h1.q.lt(h2.q)) { var tt = h1; h1 = h2; h2 = tt; }
    if (!plus && h1.q.eq(h2.q)) plus = true;
    var res = addSubFrac(h1, h2, plus);
    return {
      q: plus ? nm3 + ' hikes $' + ftx(h1) + '$ mile before lunch and $' + ftx(h2) + '$ mile after lunch. How many miles in all?' : 'A jar holds $' + ftx(h1) + '$ cup of beads. ' + nm3 + ' uses $' + ftx(h2) + '$ cup. How many cups are left?',
      a: num(res.r.toString()),
      steps: ['Estimate first: about $' + bt(bench(h1.q)) + (plus ? ' + ' : ' - ') + bt(bench(h2.q)) + '$.'].concat(res.s, ['$' + fm(res.r) + '$ is near the estimate, so the answer is reasonable.']),
      hint: plus ? 'Add, renaming with a common denominator first.' : 'Subtract, renaming with a common denominator first.',
      nolint: ['+ 0']
    };
  });


  /* ================================================================ unit: multiplying and dividing fractions */
  function qt(x) { return Q.from(x).toTex(); }

  // ---------------------------------------------------------------- g5.fraction-as-division
  G('g5.fraction-as-division', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['write', 'share', 'which', 'between'], [3, 3, 2, lv === 1 ? 0 : 2]);
    if (shape === 'write') {
      if (lv === 1 || R.coin()) {
        var b = R.int(3, 12), a = coNum(R, b);
        return { q: 'Write $' + a + DV + b + '$ as a fraction.', a: num(a + '/' + b, 'frac'),
          steps: ['A fraction is a division: the numerator is divided by the denominator.', '$' + a + DV + b + ' = ' + fr(a, b) + '$.', 'Think of sharing: ' + a + ' wholes shared equally by ' + b + ' gives each share $' + fr(a, b) + '$ of a whole.'], hint: 'The number being divided goes on top.' };
      }
      var d = R.int(2, 9), n = d * R.int(1, 6) + coNum(R, d);
      return { q: 'Write $' + n + DV + d + '$ as a mixed number.', a: num(Q(n, d).toString(), 'mixed'),
        steps: ['$' + n + DV + d + ' = ' + fr(n, d) + '$.', '$' + d + '$ goes into $' + n + '$ ' + Math.floor(n / d) + ' times with ' + (n % d) + ' left over, and the ' + (n % d) + ' left over are shared too: $' + fr(n % d, d) + '$.', 'So $' + n + DV + d + ' = ' + mt(Q(n, d)) + '$.'], hint: 'Divide to get the whole number. The remainder over the divisor is the fraction part.' };
    }
    if (shape === 'share') {
      var k = R.int(0, 3), p = R.int(2, 12), w = by(ctx, R.int(1, p - 1), R.int(1, 3 * p), R.int(2, 3 * p)), nm = who(R);
      if (w % p === 0) w += 1;
      var stuff = [['pizzas', 'pizza'], ['pounds of clay', 'pound of clay'], ['feet of ribbon', 'foot of ribbon'], ['cups of trail mix', 'cup of trail mix']][k];
      var r = Q(w, p);
      return { q: w + ' ' + (w === 1 ? stuff[1] : stuff[0]) + ' are shared equally by ' + p + ' people. How much does each person get?'.replace(/^1 (.*?) are/, '1 $1 is'), a: num(r.toString()),
        steps: ['Sharing equally is dividing: $' + w + DV + p + '$.', 'A division can be written as a fraction: $' + w + DV + p + ' = ' + fr(w, p) + (r.d !== BigInt(p) || r.gt(1) ? ' = ' + fm(r).replace(/^.*= /, '') : '') + '$.', 'Each person gets $' + fm(r).replace(/^.*= /, '') + '$ ' + (r.gt(1) ? stuff[0] : stuff[1]) + '.'],
        hint: 'Divide the amount by the number of people. You can write the answer as a fraction.' };
    }
    if (shape === 'which') {
      var dd2 = R.int(3, 12), nn = coNum(R, dd2) + (lv > 1 && R.coin() ? dd2 : 0);
      return { q: 'Which division does $' + fr(nn, dd2) + '$ stand for?', a: mc('$' + nn + DV + dd2 + '$', ['$' + dd2 + DV + nn + '$', '$' + nn + X + dd2 + '$', '$' + dd2 + ' - ' + nn + '$', '$' + nn + ' - ' + dd2 + '$']),
        steps: ['The fraction bar means "divided by."', '$' + fr(nn, dd2) + ' = ' + nn + DV + dd2 + '$: the numerator divided by the denominator.'], hint: 'Read the fraction bar as "divided by."' };
    }
    var d3 = R.int(2, 9), n3 = d3 * R.int(1, 8) + coNum(R, d3), lo = Math.floor(n3 / d3);
    return { q: 'Between which two whole numbers is $' + fr(n3, d3) + '$?', a: mc(lo + ' and ' + (lo + 1), [(lo - 1) + ' and ' + lo, (lo + 1) + ' and ' + (lo + 2), n3 + ' and ' + d3, (lo + 2) + ' and ' + (lo + 3)].filter(function (x) { return !/^-|^0 and 0/.test(x); })),
      steps: ['$' + fr(n3, d3) + ' = ' + n3 + DV + d3 + '$.', '$' + d3 + X + lo + ' = ' + d3 * lo + '$ and $' + d3 + X + (lo + 1) + ' = ' + d3 * (lo + 1) + '$, and ' + n3 + ' is between them.', 'So $' + fr(n3, d3) + ' = ' + mt(Q(n3, d3)) + '$ is between ' + lo + ' and ' + (lo + 1) + '.'],
      hint: 'Divide ' + n3 + ' by ' + d3 + '. What whole number do you get, and what is left over?' };
  });

  // ---------------------------------------------------------------- g5.fractions-and-decimals
  var TERM1 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [7, 20], [1, 25], [6, 25], [11, 50], [17, 100]];
  var TERM2 = [[1, 8], [3, 8], [5, 8], [7, 8], [3, 40], [7, 40], [9, 20], [13, 25], [21, 50], [123, 1000], [3, 200]];
  function toDecSteps(n, d) {
    var r = Q(n, d), k = [10, 100, 1000].filter(function (m) { return m % d === 0; })[0], s = [];
    if (k) { s.push('Make the denominator ' + nc(k) + ': multiply the top and the bottom by ' + (k / d) + '. $' + fr(n, d) + ' = ' + fr(n * k / d, nc(k)) + '$.'); s.push('$' + fr(n * k / d, nc(k)) + '$ is ' + (n * k / d) + ' ' + unitName(String(k).length - 1) + ', which is $' + dt(r) + '$.'); }
    else { s.push('A fraction is a division: $' + fr(n, d) + ' = ' + n + DV + d + '$.'); s.push('Divide, writing zeros after the decimal point: $' + n + DV + d + ' = ' + dt(r) + '$.'); }
    return s;
  }
  G('g5.fractions-and-decimals', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['toDec', 'toFrac', 'pick', 'cmp'], [4, 3, 2, lv === 1 ? 0 : 2]);
    var f = R.pick(lv === 1 ? TERM1 : R.pick([TERM1, TERM2])), n = f[0], d = f[1], r = Q(n, d);
    if (shape === 'toDec') {
      if (lv === 3 && R.coin()) { var w = R.int(1, 9), mixq = r.add(w); return { q: 'Write $' + w + fr(n, d) + '$ as a decimal.', a: num(ds(mixq), 'dec'), steps: ['The whole number ' + w + ' goes before the decimal point.'].concat(toDecSteps(n, d), ['So $' + w + fr(n, d) + ' = ' + dt(mixq) + '$.']), hint: 'Change the fraction part to a decimal, then put the whole number in front.' }; }
      return { q: 'Write $' + fr(n, d) + '$ as a decimal.', a: num(ds(r), 'dec'), steps: toDecSteps(n, d), hint: 'Rename the fraction with a denominator of 10, 100 or 1,000.' };
    }
    if (shape === 'toFrac') {
      var s = ds(r), k = Math.pow(10, dpOf(r)), top = Math.round(r.toNumber() * k);
      return { q: 'Write $' + s + '$ as a fraction in simplest form.', a: num(r.toString(), 'frac'),
        steps: ['$' + s + '$ is ' + top + ' ' + unitName(dpOf(r)) + ': $' + fr(top, nc(k)) + '$.', U.gcd(top, k) > 1 ? 'Simplify: divide the top and the bottom by ' + U.gcd(top, k) + '. $' + fr(top, nc(k)) + ' = ' + r.toTex() + '$.' : 'That is already in simplest form.'], hint: 'Read the decimal: how many tenths, hundredths or thousandths?' };
    }
    if (shape === 'pick') {
      var cands = [Q.from(n + '.' + d), Q.from('0.' + n), Q.from('0.' + n + d)], inv = Q(d, n); if (inv.isTerminating() && inv.lt(100)) cands.push(inv);
      var wr = U.uniq(cands.filter(function (c2) { return !c2.eq(r); }).map(function (c2) { return '$' + dt(c2) + '$'; }));
      return { q: 'Which decimal is equal to $' + fr(n, d) + '$?', a: mc('$' + dt(r) + '$', wr),
        steps: toDecSteps(n, d).concat(['Writing the digits of the numerator and denominator side by side does not make an equal decimal.']), hint: 'Rename the fraction as tenths, hundredths or thousandths.' };
    }
    var dec = r.add(Q(R.pick([-3, -2, -1, 1, 2, 3]), 100)), c = r.cmp(dec);
    return { q: 'Compare: $' + fr(n, d) + ' \\;\\square\\; ' + dt(dec) + '$. Choose $<$, $>$ or $=$.', a: keep(['$<$', '$>$', '$=$'], c < 0 ? 0 : c > 0 ? 1 : 2),
      steps: toDecSteps(n, d).concat(['Compare $' + dt(r) + '$ with $' + dt(dec) + '$: $' + fr(n, d) + (c < 0 ? ' < ' : ' > ') + dt(dec) + '$.']), hint: 'Write the fraction as a decimal first.' };
  });

  // ---------------------------------------------------------------- g5.fraction-of-a-number
  G('g5.fraction-of-a-number', function (R, ctx) {
    var lv = L(ctx), d = R.int(2, 10), n = coNum(R, d), W, story = R.chance(lv === 1 ? 0.25 : 0.4);
    if (lv < 3) W = d * by(ctx, R.int(2, 6), R.int(3, 12)); else W = R.coin() ? d * R.int(5, 15) : R.int(5, 30);
    var r = Q(n * W, d), unit = Q(W, d);
    var steps = ['$' + fr(1, d) + '$ of ' + W + ' is $' + W + DV + d + ' = ' + fm(unit).replace(/^.*= /, '') + '$.', 'So $' + fr(n, d) + '$ of ' + W + ' is ' + n + ' of those: $' + n + X + qt(unit) + ' = ' + fm(r) + '$.'];
    if (n === 1) steps = ['$' + fr(1, d) + '$ of ' + W + ' means ' + W + ' split into ' + d + ' equal parts: $' + W + DV + d + ' = ' + fm(r) + '$.'];
    if (story) {
      var nm = who(R), k = R.int(0, 2);
      var qs = [nm + ' has ' + W + ' stickers and gives away $' + fr(n, d) + '$ of them. How many stickers does ' + nm + ' give away?', 'A class has ' + W + ' students. $' + fr(n, d) + '$ of them walk to school. How many students walk?', nm + ' reads for ' + W + ' minutes. $' + fr(n, d) + '$ of that time is spent on a comic. How many minutes is that?'];
      if (!r.isInt()) k = 2;
      return { q: qs[k], a: num(r.toString()), steps: ['Find $' + fr(n, d) + '$ of ' + W + '.'].concat(steps), hint: 'First find $' + fr(1, d) + '$ of ' + W + '.' };
    }
    return { q: 'What is $' + fr(n, d) + '$ of ' + W + '?', a: num(r.toString()), steps: steps.concat(['Another way: $' + fr(n, d) + X + W + ' = ' + fr(n * W, d) + (r.isInt() || U.gcd(n * W, d) > 1 ? ' = ' + fm(r) : '') + '$.']), hint: 'Divide ' + W + ' into ' + d + ' equal parts, then take ' + n + ' of them.' };
  });

  // ---------------------------------------------------------------- g5.multiply-fractions
  function mulFracSteps(a, b) {
    var p = Q.from(a).mul(b), A = Q.from(a), B = Q.from(b), tn = A.n * B.n, td = A.d * B.d;
    var s = B.d === 1n ? ['Write the whole number as a fraction: $' + B + ' = ' + fr(B.n, 1) + '$.'] : [];
    s.push('Multiply the numerators and multiply the denominators: $' + qt(A) + X + qt(B) + ' = ' + fr(A.n + ' \\times ' + B.n, A.d + ' \\times ' + B.d) + ' = ' + fr(tn, td) + '$.');
    if (tn % td === 0n || Q(Number(tn), Number(td)).d !== td) s.push('Simplify: $' + fr(tn, td) + ' = ' + fm(p) + '$.');
    else if (p.gt(1)) s.push('As a mixed number: $' + fm(p) + '$.');
    return { p: p, s: s };
  }
  G('g5.multiply-fractions', function (R, ctx) {
    var lv = L(ctx), a, b, shape = R.pickW(['calc', 'story', 'area'], [6, lv === 1 ? 1 : 2, lv === 1 ? 2 : 1]);
    if (lv === 1) { var d1 = R.int(2, 6), d2 = R.int(2, 6); a = Q(R.coin() ? 1 : coNum(R, d1), d1); b = Q(coNum(R, d2), d2); }
    else if (lv === 2) { var e1 = R.int(2, 9), e2 = R.int(2, 10); a = Q(coNum(R, e1), e1); b = Q(coNum(R, e2), e2); }
    else { var g1 = R.int(2, 9), g2 = R.int(2, 9); a = Q(coNum(R, g1) + (R.coin() ? g1 : 0), g1); b = Q(coNum(R, g2), g2); if (R.chance(0.3)) b = Q(R.int(2, 12)); }
    var M = mulFracSteps(a, b);
    if (shape === 'area' && a.lt(1) && b.lt(1) && b.d <= 6n && a.d <= 6n) {
      return { q: 'The picture shows $' + qt(a) + X + qt(b) + '$: $' + qt(b) + '$ of the square is shaded one way, then $' + qt(a) + '$ of that part the other way. What fraction of the whole square is shaded twice?',
        viz: { name: 'g5-fracarea', opts: { a: a.toString(), b: b.toString(), steps: false, controls: false, quiet: true }, label: 'A unit square cut into ' + b.d + ' columns and ' + a.d + ' rows, with ' + b.n + ' columns and ' + a.n + ' rows shaded.' },
        a: num(M.p.toString()),
        steps: ['The square is cut into $' + b.d + X + a.d + ' = ' + (b.d * a.d) + '$ equal pieces.', 'The overlap is $' + b.n + X + a.n + ' = ' + (b.n * a.n) + '$ pieces.'].concat(M.s), hint: 'Count all the small pieces, then count the double-shaded ones.' };
    }
    if (shape === 'story') {
      var nm = who(R), k = R.int(0, 2);
      if (a.gt(1)) a = Q(1, 2);
      M = mulFracSteps(a, b);
      var qs = ['There is $' + qt(b) + '$ of a pan of brownies left. ' + nm + ' eats $' + qt(a) + '$ of what is left. What fraction of the whole pan does ' + nm + ' eat?', 'A garden is $' + qt(b) + '$ acre. $' + qt(a) + '$ of the garden is planted with beans. What part of an acre has beans?', nm + ' has $' + qt(b) + '$ of a yard of ribbon and uses $' + qt(a) + '$ of it. How many yards of ribbon does ' + nm + ' use?'];
      if (b.gt(1)) { qs = [nm + ' runs ' + b + ' miles. $' + qt(a) + '$ of the run is uphill. How many miles are uphill?']; k = 0; }
      return { q: qs[k], a: num(M.p.toString()), steps: ['"$' + qt(a) + '$ of" an amount means multiply: $' + qt(a) + X + qt(b) + '$.'].concat(M.s), hint: 'Find a fraction of a fraction: multiply.' };
    }
    return { q: 'Multiply: $' + qt(a) + X + qt(b) + '$.', a: num(M.p.toString()), steps: M.s, hint: 'Multiply the tops, multiply the bottoms. No common denominator is needed.' };
  });

  // ---------------------------------------------------------------- g5.fraction-side-area
  G('g5.fraction-side-area', function (R, ctx) {
    var lv = L(ctx), da = R.int(2, 6), db = R.int(2, 6), a, b, shape = R.pickW(['area', 'tiles', 'tile'], [4, lv === 1 ? 3 : 2, lv === 1 ? 1 : 2]);
    a = Q(coNum(R, da) + (lv > 1 && R.coin() ? da : 0), da); b = Q(coNum(R, db) + (lv === 3 && R.coin() ? db : 0), db);
    var P = a.mul(b), u = R.pick(['ft', 'm', 'yd', 'in']), uName = { ft: 'feet', m: 'meters', yd: 'yards', in: 'inches' }[u];
    var na = Number(a.n), nb = Number(b.n), N = Number(a.d) * Number(b.d);
    var vz = { name: 'g5-fracarea', opts: { a: a.toString(), b: b.toString(), tiles: true, controls: false, quiet: true }, label: 'A rectangle ' + a + ' by ' + b + ' units drawn on unit squares, tiled with small rectangles.' };
    var uw = function (x) { return x.gt(1) ? 'units' : 'unit'; }, one = { ft: 'foot', m: 'meter', yd: 'yard', in: 'inch' }[u], lw = function (x) { return x.gt(1) ? uName : one; };
    if (shape === 'tiles') return {
      q: 'A rectangle is $' + qt(b) + '$ ' + uw(b) + ' long and $' + qt(a) + '$ ' + uw(a) + ' wide. It is covered with tiles that are $' + fr(1, b.d) + '$ unit by $' + fr(1, a.d) + '$ unit. How many tiles does it take?',
      viz: vz, a: num(na * nb, 'int'),
      steps: ['Along the length, $' + qt(b) + '$ is ' + nb + ' pieces of $' + fr(1, b.d) + '$, so there are ' + nb + ' tiles in each row.', 'Along the width, $' + qt(a) + '$ is ' + na + ' pieces of $' + fr(1, a.d) + '$, so there are ' + na + ' rows.', 'Tiles: $' + nb + X + na + ' = ' + (na * nb) + '$.'],
      hint: 'How many tiles fit along each side?'
    };
    if (shape === 'tile') return {
      q: 'A unit square is cut into tiles that are $' + fr(1, b.d) + '$ unit by $' + fr(1, a.d) + '$ unit. What is the area of one tile, in square units?',
      a: num('1/' + N),
      steps: ['The tiles make ' + b.d + ' columns and ' + a.d + ' rows in the unit square: $' + b.d + X + a.d + ' = ' + N + '$ tiles.', 'They share 1 square unit equally, so each has area $' + fr(1, N) + '$.', 'This matches $' + fr(1, b.d) + X + fr(1, a.d) + ' = ' + fr(1, N) + '$.'],
      hint: 'How many of these tiles fill one unit square?'
    };
    return {
      q: 'A rectangle is $' + qt(b) + '$ ' + lw(b) + ' long and $' + qt(a) + '$ ' + lw(a) + ' wide. What is its area in square ' + uName + '?',
      viz: lv === 1 ? vz : undefined, a: num(P.toString()), unit: 'sq ' + u,
      steps: ['Area = length × width: $' + qt(b) + X + qt(a) + '$.', 'Tiles of $' + fr(1, b.d) + '$ by $' + fr(1, a.d) + '$ each have area $' + fr(1, N) + '$, and ' + nb + ' × ' + na + ' = ' + (na * nb) + ' of them cover the rectangle.', 'Area $= ' + fr(na * nb, N) + (P.d !== BigInt(N) || P.gt(1) ? ' = ' + fm(P).replace(/^.*= /, '') : '') + '$ square ' + uName + '.'],
      hint: 'Multiply the side lengths, just as with whole numbers.'
    };
  });

  // ---------------------------------------------------------------- g5.multiplication-as-scaling
  function scaleF(R, kind) {
    for (;;) { var d = R.int(2, 9); if (kind === 0) return { n: d, d: d }; var n = kind < 0 ? R.int(1, d - 1) : R.int(d + 1, 2 * d + 3); if (U.gcd(n, d) === 1) return { n: n, d: d }; }
  }
  function fTex(f) { return fr(f.n, f.d); }
  G('g5.multiplication-as-scaling', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['one', 'most', 'cmp'], [5, 2, lv === 1 ? 0 : 2]), N = R.int(8, 60);
    var why = ['Multiplying by a number less than 1 takes only part of the amount, so the product is smaller.', 'Multiplying by a number greater than 1 takes the whole amount and more, so the product is bigger.', 'Multiplying by 1 keeps the amount the same.'];
    if (shape === 'one') {
      var kind = R.pick([-1, 1, -1, 1, lv === 1 ? -1 : 0]), f = scaleF(R, kind), v = Q(f.n, f.d), mixedOk = lv > 1 && kind > 0 && R.coin();
      var ftx2 = mixedOk ? v.toMixedTex() : fTex(f);
      return {
        q: 'Without multiplying: is $' + ftx2 + X + N + '$ greater than, less than, or equal to ' + N + '?',
        a: keep(['greater than ' + N, 'less than ' + N, 'equal to ' + N], kind > 0 ? 0 : kind < 0 ? 1 : 2),
        steps: ['$' + ftx2 + '$ is ' + (kind > 0 ? 'greater than 1' : kind < 0 ? 'less than 1' : 'equal to 1') + '.', why[kind < 0 ? 0 : kind > 0 ? 1 : 2], 'Indeed, $' + ftx2 + X + N + ' = ' + fm(v.mul(N)) + '$.'],
        hint: 'Compare $' + ftx2 + '$ with 1.'
      };
    }
    if (shape === 'most') {
      var big = R.coin(), fs = [scaleF(R, -1), scaleF(R, 1), { n: R.pick([3, 4, 5, 6]), d: 0 }];
      fs[2].d = fs[2].n; var fs3 = scaleF(R, big ? -1 : 1); fs.push(fs3);
      var vals = fs.map(function (f) { return Q(f.n, f.d); });
      var bi = 0; vals.forEach(function (v, i) { if (big ? v.gt(vals[bi]) : v.lt(vals[bi])) bi = i; });
      var tex = fs.map(function (f) { return '$' + fTex(f) + X + N + '$'; });
      return {
        q: 'Which product is ' + (big ? 'greatest' : 'least') + '? Try to decide without multiplying.',
        a: mc(tex[bi], tex.filter(function (t, i) { return i !== bi; })),
        steps: ['Every product starts from ' + N + ', so compare the other factors.', 'The ' + (big ? 'greatest' : 'least') + ' factor is $' + fTex(fs[bi]) + '$, so $' + fTex(fs[bi]) + X + N + '$ is the ' + (big ? 'greatest' : 'least') + ' product.'],
        hint: 'Which factor is ' + (big ? 'greatest' : 'least') + '?'
      };
    }
    var f1 = scaleF(R, -1), f2 = scaleF(R, 1), v1 = Q(f1.n, f1.d), v2 = Q(f2.n, f2.d), sw = R.coin();
    var A = sw ? f2 : f1, B = sw ? f1 : f2, c = Q(A.n, A.d).cmp(Q(B.n, B.d));
    return {
      q: 'Compare without multiplying: $' + fTex(A) + X + N + ' \\;\\square\\; ' + fTex(B) + X + N + '$.',
      a: keep(['$<$', '$>$', '$=$'], c < 0 ? 0 : c > 0 ? 1 : 2),
      steps: ['Both products start from ' + N + '.', '$' + fTex(f1) + '$ is less than 1, so $' + fTex(f1) + X + N + '$ is less than ' + N + '. $' + fTex(f2) + '$ is greater than 1, so $' + fTex(f2) + X + N + '$ is greater than ' + N + '.', 'So $' + fTex(A) + X + N + (c < 0 ? ' < ' : ' > ') + fTex(B) + X + N + '$.'],
      hint: 'Compare each fraction with 1.'
    };
  });

  // ---------------------------------------------------------------- g5.multiply-mixed-numbers
  function mixedQ(R, lo, hi) { var d = R.int(2, 6); return Q(R.int(lo, hi) * d + coNum(R, d), d); }
  G('g5.multiply-mixed-numbers', function (R, ctx) {
    var lv = L(ctx), a, b;
    if (lv === 1) { a = Q(R.int(2, 6)); b = mixedQ(R, 1, 4); }
    else if (lv === 2) { a = mixedQ(R, 1, 4); var dd = R.int(2, 6); b = Q(coNum(R, dd), dd); }
    else { a = mixedQ(R, 1, 3); b = mixedQ(R, 1, 3); }
    if (R.coin()) { var tt = a; a = b; b = tt; }
    var p = a.mul(b), story = R.chance(0.3);
    var steps = ['Rename each mixed number as a fraction: ' + [a, b].filter(function (x) { return !x.isInt() && x.gt(1); }).map(function (x) { return '$' + x.toMixedTex() + ' = ' + x.toTex() + '$'; }).join(' and ') + '.', 'Multiply: $' + qt(a) + X + qt(b) + ' = ' + fr(a.n * b.n, a.d * b.d) + '$.', 'Simplify: $' + fr(a.n * b.n, a.d * b.d) + ' = ' + fm(p).replace(/^.*= /, '') + '$.'];
    if (fr(a.n * b.n, a.d * b.d) === fm(p).replace(/^.*= /, '')) steps.pop();
    if (lv === 3 && R.chance(0.3)) {
      var wa = a.floor(), wb = b.floor(), fa = a.sub(wa), fb = b.sub(wb), wrong = wa.mul(wb).add(fa.mul(fb)), nm = who(R);
      if (!wrong.eq(p)) return {
        q: nm + ' multiplied the whole numbers and the fractions separately: $' + a.toMixedTex() + X + b.toMixedTex() + ' = ' + wrong.toMixedTex() + '$. What is the correct product?',
        a: num(p.toString()),
        steps: ['Each part of one number must be multiplied by each part of the other. An area model shows four parts: $' + wa + X + wb + '$, $' + wa + X + qt(fb) + '$, $' + qt(fa) + X + wb + '$ and $' + qt(fa) + X + qt(fb) + '$. ' + nm + ' left out the middle two.'].concat(steps),
        hint: 'Rename both as fractions greater than 1, then multiply.'
      };
    }
    if (story) {
      var nm2 = who(R);
      var cupsQ = mixedQ(R, 1, 3), bat = Q.from(R.pick(['2', '3', '4', '3/2', '5/2'])), pr = cupsQ.mul(bat);
      var st2 = ['Rename the mixed number as a fraction: $' + cupsQ.toMixedTex() + ' = ' + cupsQ.toTex() + '$' + (bat.isInt() ? '' : ' and $' + bat.toMixedTex() + ' = ' + bat.toTex() + '$') + '.', 'Multiply: $' + qt(cupsQ) + X + qt(bat) + ' = ' + fr(cupsQ.n * bat.n, cupsQ.d * bat.d) + '$.'];
      if (fr(cupsQ.n * bat.n, cupsQ.d * bat.d) !== fm(pr).replace(/^.*= /, '')) st2.push('Simplify: $' + fr(cupsQ.n * bat.n, cupsQ.d * bat.d) + ' = ' + fm(pr).replace(/^.*= /, '') + '$.');
      return { q: 'A recipe uses $' + cupsQ.toMixedTex() + '$ cups of flour for one batch. ' + nm2 + ' makes $' + bat.toMixedTex() + '$ batches. How many cups of flour is that?', a: num(pr.toString()), steps: ['Multiply the cups in one batch by the number of batches.'].concat(st2), hint: 'Multiply. Rename mixed numbers as fractions first.' };
    }
    return { q: 'Multiply: $' + (a.isInt() ? a : a.toMixedTex()) + X + (b.isInt() ? b : b.toMixedTex()) + '$.', a: num(p.toString()), steps: steps, hint: 'Rename each mixed number as a fraction, then multiply.' };
  });

  // ---------------------------------------------------------------- g5.unit-fraction-divided-by-whole
  G('g5.unit-fraction-divided-by-whole', function (R, ctx) {
    var lv = L(ctx), a = R.int(2, by(ctx, 5, 8, 10)), b = R.int(2, by(ctx, 5, 8, 10)), r = Q(1, a * b), shape = R.pickW(['calc', 'story', 'check', 'missing'], [4, 3, 2, lv === 1 ? 0 : 2]);
    var steps = ['Split $' + fr(1, a) + '$ into ' + b + ' equal parts.', 'Cutting each $' + fr(1, a) + '$ into ' + b + ' parts cuts the whole into $' + a + X + b + ' = ' + (a * b) + '$ parts, so each part is $' + fr(1, a * b) + '$.', '$' + fr(1, a) + DV + b + ' = ' + fr(1, a * b) + '$. Check: $' + fr(1, a * b) + X + b + ' = ' + fr(b, a * b) + ' = ' + fr(1, a) + '$.'];
    if (shape === 'story') {
      var nm = who(R), k = R.int(0, 2), qs = ['There is $' + fr(1, a) + '$ of a pan of cornbread left. ' + b + ' friends share it equally. What fraction of the whole pan does each friend get?', nm + ' has $' + fr(1, a) + '$ pound of nuts to put equally into ' + b + ' bags. How many pounds go in each bag?', 'A $' + fr(1, a) + '$-mile path is split into ' + b + ' equal parts for a relay. How long is each part, in miles?'];
      return { q: qs[k], a: num(r.toString()), steps: ['Sharing $' + fr(1, a) + '$ among ' + b + ' is $' + fr(1, a) + DV + b + '$.'].concat(steps), hint: 'Picture $' + fr(1, a) + '$ cut into ' + b + ' equal pieces. How big is each piece compared with the whole?' };
    }
    if (shape === 'check') return {
      q: 'Which multiplication checks that $' + fr(1, a) + DV + b + ' = ' + fr(1, a * b) + '$?',
      a: mc('$' + fr(1, a * b) + X + b + ' = ' + fr(1, a) + '$', ['$' + fr(1, a * b) + X + a + ' = ' + fr(1, b) + '$', '$' + fr(1, a) + X + b + ' = ' + fr(b, a) + '$', '$' + a + X + b + ' = ' + (a * b) + '$']),
      steps: ['Division and multiplication undo each other: if $' + fr(1, a) + DV + b + ' = ' + fr(1, a * b) + '$, then ' + b + ' groups of $' + fr(1, a * b) + '$ make $' + fr(1, a) + '$.', '$' + fr(1, a * b) + X + b + ' = ' + fr(b, a * b) + ' = ' + fr(1, a) + '$.'],
      hint: 'Multiply the answer by the number you divided by.'
    };
    if (shape === 'missing') return {
      q: 'What whole number goes in the box? $' + fr(1, a) + DV + '\\square = ' + fr(1, a * b) + '$',
      a: num(b, 'int'),
      steps: ['$' + fr(1, a) + '$ was split into equal parts of size $' + fr(1, a * b) + '$.', 'How many $' + fr(1, a * b) + '$s are in $' + fr(1, a) + '$? $' + fr(1, a) + ' = ' + fr(b, a * b) + '$, so ' + b + '.'],
      hint: 'Rename $' + fr(1, a) + '$ with the denominator ' + (a * b) + '.'
    };
    return { q: 'Divide: $' + fr(1, a) + DV + b + '$.', a: num(r.toString()), steps: steps, hint: 'Splitting into ' + b + ' parts makes each part ' + b + ' times smaller.' };
  });

  // ---------------------------------------------------------------- g5.whole-divided-by-unit-fraction
  G('g5.whole-divided-by-unit-fraction', function (R, ctx) {
    var lv = L(ctx), n = R.int(2, by(ctx, 6, 9, 12)), d = R.int(2, by(ctx, 5, 8, 10)), r = n * d, shape = R.pickW(['calc', 'story', 'check', 'spot'], [4, 3, 1, 2]);
    var steps = ['$' + n + DV + fr(1, d) + '$ asks: how many $' + fr(1, d) + '$s fit in ' + n + '?', 'Each whole holds ' + d + ' pieces of size $' + fr(1, d) + '$, so ' + n + ' wholes hold $' + n + X + d + ' = ' + r + '$.', 'Check: $' + r + X + fr(1, d) + ' = ' + fr(r, d) + ' = ' + n + '$.'];
    if (shape === 'spot') {
      var nm = who(R), wrong = n % d === 0 ? n / d : null;
      return { q: nm + ' says "Dividing makes numbers smaller, so $' + n + DV + fr(1, d) + '$ must be less than ' + n + '." What is $' + n + DV + fr(1, d) + '$?', a: num(r, 'int'),
        steps: ['Dividing by a number less than 1 asks how many small pieces fit, and many small pieces fit in ' + n + '. So the quotient is bigger than ' + n + '.'].concat(steps), hint: 'How many $' + fr(1, d) + '$s are in one whole?' };
    }
    if (shape === 'story') {
      var k = R.int(0, 2), nm2 = who(R), qs = [nm2 + ' has ' + n + ' cups of rice. Each serving is $' + fr(1, d) + '$ cup. How many servings is that?', 'A ' + n + '-foot board is cut into pieces that are each $' + fr(1, d) + '$ foot long. How many pieces?', nm2 + ' runs laps that are each $' + fr(1, d) + '$ mile. How many laps make ' + n + ' miles?'];
      return { q: qs[k], a: num(r, 'int'), steps: ['How many $' + fr(1, d) + '$s are in ' + n + '? Divide: $' + n + DV + fr(1, d) + '$.'].concat(steps), hint: 'How many pieces of size $' + fr(1, d) + '$ fit in one whole?' };
    }
    if (shape === 'check') return {
      q: 'Which multiplication checks that $' + n + DV + fr(1, d) + ' = ' + r + '$?',
      a: mc('$' + r + X + fr(1, d) + ' = ' + n + '$', ['$' + n + X + fr(1, d) + ' = ' + fr(n, d) + '$', '$' + r + X + n + ' = ' + (r * n) + '$', '$' + d + X + fr(1, n) + ' = ' + fr(d, n) + '$']),
      steps: ['If ' + r + ' pieces of size $' + fr(1, d) + '$ fit in ' + n + ', then $' + r + X + fr(1, d) + '$ must equal ' + n + '.', '$' + r + X + fr(1, d) + ' = ' + fr(r, d) + ' = ' + n + '$.'],
      hint: 'Multiply the quotient by the divisor.'
    };
    return { q: 'Divide: $' + n + DV + fr(1, d) + '$.', a: num(r, 'int'), steps: steps, hint: 'How many $' + fr(1, d) + '$s are in 1? In ' + n + '?' };
  });

  // ---------------------------------------------------------------- g5.fraction-division-stories
  G('g5.fraction-division-stories', function (R, ctx) {
    var lv = L(ctx), share = R.coin(), a = R.int(2, 8), b = R.int(2, 8), nm = who(R), shape = R.pickW(['solve', 'expr'], [3, 2]), q1, ex, val, wr, steps;
    if (share) {
      var k = R.int(0, 2), items = [['$' + fr(1, a) + '$ of a pizza', b + ' friends share it equally', 'What fraction of the whole pizza does each friend get?'], ['$' + fr(1, a) + '$ gallon of paint', 'it is poured equally into ' + b + ' cans', 'How many gallons go in each can?'], ['$' + fr(1, a) + '$ of a garden', b + ' kinds of flowers get equal parts of it', 'What fraction of the whole garden does each kind get?']][k];
      q1 = nm + ' has ' + items[0] + ', and ' + items[1] + '. ' + items[2];
      ex = fr(1, a) + DV + b; val = Q(1, a * b);
      wr = [b + DV + fr(1, a), b + X + fr(1, a), fr(1, a) + ' + ' + b];
      steps = ['This story shares a fraction into equal parts, so divide the fraction by the number of parts: $' + ex + '$.', 'Cutting $' + fr(1, a) + '$ into ' + b + ' equal parts makes parts of size $' + fr(1, a * b) + '$.', 'Check: $' + fr(1, a * b) + X + b + ' = ' + fr(1, a) + '$.'];
    } else {
      var k2 = R.int(0, 2), items2 = [[b + ' cups of yogurt', 'Each smoothie uses $' + fr(1, a) + '$ cup', 'How many smoothies can ' + nm + ' make?'], [b + ' yards of fabric', 'Each bandana takes $' + fr(1, a) + '$ yard', 'How many bandanas can ' + nm + ' make?'], [b + ' hours', 'Each practice song takes $' + fr(1, a) + '$ hour', 'How many songs can ' + nm + ' play?']][k2];
      q1 = nm + ' has ' + items2[0] + '. ' + items2[1] + '. ' + items2[2];
      ex = b + DV + fr(1, a); val = Q(a * b);
      wr = [fr(1, a) + DV + b, b + X + fr(1, a), fr(1, a) + ' + ' + b];
      steps = ['This story asks how many pieces of size $' + fr(1, a) + '$ fit in ' + b + ', so divide: $' + ex + '$.', 'Each whole holds ' + a + ' pieces of $' + fr(1, a) + '$, so ' + b + ' wholes hold $' + b + X + a + ' = ' + (a * b) + '$.', 'Check: $' + (a * b) + X + fr(1, a) + ' = ' + b + '$.'];
    }
    if (shape === 'expr') return {
      q: q1 + ' Which expression solves this problem?',
      a: mc('$' + ex + '$', wr.map(function (w) { return '$' + w + '$'; })),
      steps: steps, hint: share ? 'Is a fraction being shared into equal parts, or are you counting how many parts fit?' : 'Are you counting how many pieces of one size fit into a whole amount?'
    };
    return { q: q1, a: num(val.toString()), steps: steps, hint: share ? 'Sharing a fraction among people: divide the fraction by the number of people.' : 'How many pieces of size $' + fr(1, a) + '$ fit in one whole?' };
  });


  /* ================================================================ unit: conversions and line plots */
  var CONV_M = [['km', 'm', 1000, 'kilometers', 'meters'], ['m', 'cm', 100, 'meters', 'centimeters'], ['cm', 'mm', 10, 'centimeters', 'millimeters'], ['m', 'mm', 1000, 'meters', 'millimeters'], ['kg', 'g', 1000, 'kilograms', 'grams'], ['L', 'mL', 1000, 'liters', 'milliliters']];
  var CONV_C = [['ft', 'in', 12, 'feet', 'inches', 'foot'], ['yd', 'ft', 3, 'yards', 'feet', 'yard'], ['yd', 'in', 36, 'yards', 'inches', 'yard'], ['lb', 'oz', 16, 'pounds', 'ounces', 'pound'], ['gal', 'qt', 4, 'gallons', 'quarts', 'gallon'], ['qt', 'pt', 2, 'quarts', 'pints', 'quart'], ['pt', 'c', 2, 'pints', 'cups', 'pint'], ['hr', 'min', 60, 'hours', 'minutes', 'hour'], ['min', 's', 60, 'minutes', 'seconds', 'minute'], ['day', 'hr', 24, 'days', 'hours', 'day']];
  function fact(c) { return '1 ' + (c[5] || c[3].replace(/s$/, '')) + ' = ' + c[2] + ' ' + c[4]; }
  G('g5.convert-units-multistep', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['down', 'up', 'mixed', 'story'], [3, 3, lv === 1 ? 1 : 2, lv === 1 ? 2 : 4]);
    if (shape === 'down' || shape === 'up') {
      var metric = R.coin(), c = R.pick(metric ? CONV_M : CONV_C), big;
      if (metric) big = lv === 1 ? q(R.int(2, 9)) : q(R.int(11, 99), 10); else big = lv === 1 ? q(R.int(2, 9)) : Q(R.int(2, 9) * 2 + 1, 2);
      if (metric && lv === 3) big = q(R.int(101, 999), 100);
      var small = big.mul(c[2]);
      if (shape === 'down') return {
        q: 'How many ' + c[4] + ' are in $' + (metric ? dt(big) : big.toMixedTex()) + '$ ' + c[3] + '?' + (metric ? '' : ' (' + fact(c) + ')'),
        a: num(ds(small)), unit: c[1],
        steps: ['Each ' + (c[5] || c[3].replace(/s$/, '')) + ' is ' + nc(c[2]) + ' ' + c[4] + ', so multiply by ' + nc(c[2]) + '.', '$' + (metric ? dt(big) : big.toMixedTex()) + X + nc(c[2]) + ' = ' + dt(small) + '$ ' + c[4] + '.'].concat(metric ? ['Multiplying by ' + nc(c[2]) + ' moves each digit ' + (String(c[2]).length - 1) + ' places to the left.'] : []),
        hint: 'Bigger units to smaller units: there will be more of them, so multiply.'
      };
      var sm = metric ? small : q(R.int(2, 12) * c[2] + (lv > 1 ? c[2] / 2 * R.int(0, 1) : 0)), bg = sm.div(c[2]);
      if (!metric && !Number.isInteger(c[2] / 2)) { sm = q(R.int(2, 12) * c[2]); bg = sm.div(c[2]); }
      return {
        q: 'How many ' + c[3] + ' is ' + nc(Number(ds(sm))) + ' ' + c[4] + '?' + (metric ? '' : ' (' + fact(c) + ')'),
        a: num(metric ? ds(bg) : bg.toString()), unit: c[0],
        steps: ['It takes ' + nc(c[2]) + ' ' + c[4] + ' to make 1 ' + (c[5] || c[3].replace(/s$/, '')) + ', so divide by ' + nc(c[2]) + '.', '$' + nc(Number(ds(sm))) + DV + nc(c[2]) + ' = ' + (metric ? dt(bg) : fm(bg)) + '$ ' + c[3] + '.'],
        hint: 'Smaller units to bigger units: there will be fewer of them, so divide.'
      };
    }
    if (shape === 'mixed') {
      var cm = R.pick([CONV_C[0], CONV_C[3], CONV_C[7], CONV_C[1]]), w = R.int(2, 9), r = R.int(1, cm[2] - 1), tot = w * cm[2] + r;
      return {
        q: 'Write ' + w + ' ' + cm[3] + ' ' + r + ' ' + (r === 1 ? { inches: 'inch', ounces: 'ounce', minutes: 'minute', feet: 'foot' }[cm[4]] : cm[4]) + ' in ' + cm[4] + '. (' + fact(cm) + ')',
        a: num(tot, 'int'), unit: cm[1],
        steps: ['$' + w + X + cm[2] + ' = ' + (w * cm[2]) + '$ ' + cm[4] + '.', 'Add the extra ' + r + ': $' + (w * cm[2]) + ' + ' + r + ' = ' + tot + '$ ' + cm[4] + '.'],
        hint: 'Change the ' + cm[3] + ' to ' + cm[4] + ' first, then add.'
      };
    }
    var t = R.int(0, 5), nm = who(R);
    if (t === 0) { var piece = R.pick([20, 25, 50, 40, 75]), m = R.int(2, 6), cnt = m * 100 / piece; if (cnt !== Math.floor(cnt)) { piece = 25; cnt = m * 4; }
      return { q: nm + ' cuts a ' + m + '-meter ribbon into pieces that are ' + piece + ' cm long. How many pieces?', a: num(cnt, 'int'), steps: ['Use the same unit: $' + m + '$ m $= ' + m + X + '100 = ' + (m * 100) + '$ cm.', 'Divide: $' + (m * 100) + DV + piece + ' = ' + cnt + '$ pieces.'], hint: 'Change meters to centimeters first.' }; }
    if (t === 1) { var cup = R.pick([200, 250, 500]), L2 = R.int(2, 5), n2 = L2 * 1000 / cup;
      return { q: 'A ' + L2 + '-liter jug of juice is poured into cups that each hold ' + cup + ' mL. How many cups can be filled?', a: num(n2, 'int'), steps: ['$' + L2 + '$ L $= ' + nc(L2 * 1000) + '$ mL.', 'Divide: $' + nc(L2 * 1000) + DV + cup + ' = ' + n2 + '$ cups.'], hint: 'Change liters to milliliters first.' }; }
    if (t === 2) { var oz = R.pick([4, 6, 8, 10, 12]), k = R.int(3, 8), lb = Q(oz * k, 16);
      return { q: nm + ' mails ' + k + ' packages that each weigh ' + oz + ' ounces. How many pounds is that in all? (1 pound = 16 ounces)', a: num(lb.toString()), unit: 'lb', steps: ['Total: $' + k + X + oz + ' = ' + (k * oz) + '$ ounces.', 'Change to pounds: $' + (k * oz) + DV + '16 = ' + fm(lb).replace(/^.*= /, '') + '$ pounds.'], hint: 'Find the total ounces, then divide by 16.' }; }
    if (t === 3) { var lap = R.pick([200, 250, 400, 500, 800]), laps = R.int(2, 10), km = Q(lap * laps, 1000);
      return { q: nm + ' runs ' + laps + ' laps of ' + lap + ' meters. How many kilometers is that?', a: num(ds(km)), unit: 'km', steps: ['Total: $' + laps + X + lap + ' = ' + nc(lap * laps) + '$ meters.', 'Change to kilometers: $' + nc(lap * laps) + DV + '1{,}000 = ' + dt(km) + '$ km.'], hint: 'Find the total meters, then divide by 1,000.' }; }
    if (t === 4) { var per = R.int(2, 4), batches = R.int(2, 6), cups = per * batches, qts = Q(cups, 4);
      return { q: 'A recipe uses ' + per + ' cups of milk per batch. ' + nm + ' makes ' + batches + ' batches. How many quarts of milk is that? (2 cups = 1 pint and 2 pints = 1 quart)', a: num(qts.toString()), unit: 'qt', steps: ['Total: $' + per + X + batches + ' = ' + cups + '$ cups.', 'One quart is 2 pints, and each pint is 2 cups, so 1 quart = 4 cups.', 'Quarts: $' + cups + DV + '4 = ' + fm(qts).replace(/^.*= /, '') + '$.'], hint: 'How many cups make 1 quart?' }; }
    var h = R.int(1, 2), mn = R.pick([10, 15, 20, 25, 35, 40, 45, 50]), times = R.int(2, 3), tot2 = (h * 60 + mn) * times;
    return { q: 'A movie lasts ' + h + ' hour' + (h > 1 ? 's' : '') + ' ' + mn + ' minutes. ' + nm + ' watches it ' + times + ' times. How many minutes is that?', a: num(tot2, 'int'), unit: 'min', steps: ['One showing: $' + h + X + '60 + ' + mn + ' = ' + (h * 60 + mn) + '$ minutes.', 'Times ' + times + ': $' + (h * 60 + mn) + X + times + ' = ' + tot2 + '$ minutes.'], hint: 'Change the hours to minutes first.' };
  });

  // ---------------------------------------------------------------- g5.line-plots-fraction-operations
  function lpData(R, lv, needShare) {
    var den = lv === 1 ? 4 : 8, lo = lv === 3 ? den : 1, hi = lv === 3 ? 2 * den + den / 2 : den, n = R.int(lv === 1 ? 6 : 7, lv === 1 ? 8 : 10);
    for (var t = 0; t < 400; t++) {
      var vals = []; for (var i = 0; i < n; i++) vals.push(R.int(lo, hi));
      if (U.uniq(vals).length < 4) continue;
      var S = U.sum(vals);
      if (needShare && S % n !== 0) { var last = vals[n - 1] - (S % n); if (last < lo) last += n; if (last > hi) continue; vals[n - 1] = last; S = U.sum(vals); if (S % n) continue; }
      vals.sort(function (a, b) { return a - b; });
      return { den: den, lo: lo, hi: hi, n: n, vals: vals };
    }
    return null;
  }
  /* [things, unit, axis label, intro, "how many … exactly v", can share] */
  var LPCTX = [
    ['beakers', 'liter', 'Water in each beaker (liters)', function (n) { return 'The line plot shows how much water is in each of ' + n + ' beakers.'; }, function (v) { return 'How many beakers hold exactly ' + v + ' liter?'; }, 'If all the water were poured together and then shared equally among the ' + 0 + ' beakers, how much would each beaker hold, in liters?'],
    ['ribbons', 'yard', 'Length of each ribbon (yards)', function (n) { return 'The line plot shows the length of each of ' + n + ' ribbons.'; }, function (v) { return 'How many ribbons are exactly ' + v + ' yard long?'; }, null],
    ['rain gauges', 'inch', 'Rain in each gauge (inches)', function (n) { return 'The line plot shows how much rain fell into each of ' + n + ' rain gauges.'; }, function (v) { return 'How many gauges caught exactly ' + v + ' inch of rain?'; }, null],
    ['bags', 'pound', 'Flour in each bag (pounds)', function (n) { return 'The line plot shows how much flour is in each of ' + n + ' bags.'; }, function (v) { return 'How many bags hold exactly ' + v + ' pound of flour?'; }, 'If all the flour were put together and then shared equally among the ' + 0 + ' bags, how much would each bag hold, in pounds?']
  ];
  G('g5.line-plots-fraction-operations', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['count', 'total', 'diff', 'share', 'over'], [lv === 1 ? 2 : 0, 3, 2, lv === 1 ? 1 : 3, lv === 1 ? 0 : 2]);
    var D = lpData(R, lv, shape === 'share'); if (!D) { D = lpData(R, lv, false); if (shape === 'share') shape = 'total'; }
    var cx = R.pick(shape === 'share' ? [LPCTX[0], LPCTX[3]] : LPCTX), den = D.den, mixed = lv === 3;
    var strs = D.vals.map(function (v) { return Q(v, den).toString(); }), tex = function (v) { return mixed ? Q(v, den).toMixedTex() : Q(v, den).toTex(); };
    var counts = {}; D.vals.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
    var keys = Object.keys(counts).map(Number).sort(function (a, b) { return a - b; });
    var label = 'Line plot. ' + keys.map(function (v) { return counts[v] + ' at ' + Q(v, den).toString().replace('/', ' over '); }).join(', ') + '.';
    var vz = { name: 'g5-lineplot', opts: { data: strs, min: Q(D.lo === den ? den : 0, den).toString(), max: Q(D.hi, den).toString().replace(/^(\d+)$/, '$1'), step: '1/' + den, label: cx[2], controls: false, quiet: true }, label: label };
    if (lv !== 3) vz.opts.min = '0';
    var head = cx[3](D.n) + ' ';
    var S = U.sum(D.vals), tot = Q(S, den), byCol = keys.map(function (v) { return (counts[v] > 1 ? counts[v] + X : '') + tex(v); }).join(' + ');
    var sumSteps = ['Add each column: ' + keys.map(function (v) { return counts[v] + ' at $' + tex(v) + '$'; }).join(', ') + '.', 'Total $= ' + byCol + ' = ' + fr(S, den) + (fm(tot) !== fr(S, den) ? ' = ' + fm(tot).replace(/^.*= /, '') : '') + '$.'];
    if (shape === 'count') { var v0 = R.pick(keys); return { q: head + cx[4]('$' + tex(v0) + '$'), viz: vz, a: num(counts[v0], 'int'), steps: ['Find $' + tex(v0) + '$ on the line and count the X marks above it: ' + counts[v0] + '.'], hint: 'Each X is one measurement.' }; }
    if (shape === 'total') return { q: head + 'What is the total of all the measurements, in ' + cx[1] + 's?', viz: vz, a: num(tot.toString()), steps: sumSteps, hint: 'Multiply each value by the number of X marks above it, then add.' };
    if (shape === 'diff') { var mx = D.vals[D.n - 1], mn = D.vals[0], df = Q(mx - mn, den);
      return { q: head + 'What is the difference between the greatest and the least measurement, in ' + cx[1] + 's?', viz: vz, a: num(df.toString()), steps: ['The greatest is $' + tex(mx) + '$ and the least is $' + tex(mn) + '$.', 'Difference: $' + tex(mx) + ' - ' + tex(mn) + ' = ' + fr(mx - mn, den) + (fm(df) !== fr(mx - mn, den) ? ' = ' + fm(df).replace(/^.*= /, '') : '') + '$.'], hint: 'Find the X farthest right and the X farthest left.' }; }
    if (shape === 'share') { var each = Q(S, den * D.n);
      return { q: head + cx[5].replace(' 0 ', ' ' + D.n + ' '), viz: vz, a: num(each.toString()), steps: sumSteps.concat(['Share equally: $' + fr(S, den) + DV + D.n + ' = ' + fr(S / D.n, den) + (fm(each) !== fr(S / D.n, den) ? ' = ' + fm(each).replace(/^.*= /, '') : '') + '$ for each.']), hint: 'Find the total first, then divide it by ' + D.n + '.' }; }
    var cut = keys[Math.floor(keys.length / 2)], big = D.vals.filter(function (v) { return v > cut; }), sb = U.sum(big), tb = Q(sb, den);
    return { q: head + 'What is the total of the measurements that are greater than $' + tex(cut) + '$ ' + cx[1] + '?', viz: vz, a: num(tb.toString()),
      steps: ['The measurements greater than $' + tex(cut) + '$ are: $' + big.map(tex).join(',\\; ') + '$.', 'Add them: $' + fr(sb, den) + (fm(tb) !== fr(sb, den) ? ' = ' + fm(tb).replace(/^.*= /, '') : '') + '$.'], hint: 'Use only the X marks to the right of $' + tex(cut) + '$.' };
  });

  /* ================================================================ unit: volume */
  var UNITS3 = [['cm', 'centimeters'], ['in', 'inches'], ['ft', 'feet'], ['m', 'meters']];
  function box(l, w, h, show, unit) { return { name: 'g5-prisms', opts: { boxes: [{ at: [0, 0, 0], size: [l, w, h], show: show || '' }], unit: unit || '', controls: false, quiet: true }, label: 'A box made of unit cubes, ' + l + ' long, ' + w + ' wide and ' + h + ' high.' }; }

  // ---------------------------------------------------------------- g5.volume-unit-cubes
  G('g5.volume-unit-cubes', function (R, ctx) {
    var lv = L(ctx), l = R.int(2, by(ctx, 5, 6, 7)), w = R.int(2, by(ctx, 4, 5, 5)), h = R.int(1, by(ctx, 3, 4, 5)), V = l * w * h, shape = R.pickW(['count', 'layers', 'seen', 'text', 'perlayer', 'more'], [4, 2, 2, 2, 2, 1]);
    if (shape === 'perlayer') { var nl = R.int(2, 6), per = R.int(4, 24);
      return { q: 'A box is packed with ' + (nl * per) + ' unit cubes in ' + nl + ' equal layers. How many cubes are in each layer?', a: num(per, 'int'), steps: ['Every layer holds the same number of cubes.', '$' + (nl * per) + DV + nl + ' = ' + per + '$ cubes in each layer.'], hint: 'Share the cubes equally among the layers.' }; }
    if (shape === 'more') return { q: 'A box is ' + l + ' cubes long, ' + w + ' cubes wide and ' + h + ' ' + (h === 1 ? 'cube' : 'cubes') + ' high. How many unit cubes would one more layer on top add?', a: num(l * w, 'int'), steps: ['A new layer on top is the same size as the bottom layer.', 'It holds $' + l + X + w + ' = ' + (l * w) + '$ cubes.'], hint: 'How many cubes are in one layer?' };
    var steps = ['Count one layer: the bottom layer is ' + l + ' cubes by ' + w + ' cubes, so it has $' + l + X + w + ' = ' + (l * w) + '$ cubes.', 'There are ' + h + ' layers: $' + (l * w) + X + h + ' = ' + V + '$ cubes.', 'The volume is ' + V + ' cubic units.'];
    if (shape === 'layers') return { q: 'This box is filled with unit cubes, with no gaps. How many cubes are in the bottom layer, how many layers are there, and what is the volume?', viz: box(l, w, h),
      a: { t: 'multi', parts: [{ label: 'Cubes in one layer', a: num(l * w, 'int') }, { label: 'Layers', a: num(h, 'int') }, { label: 'Volume (cubic units)', a: num(V, 'int') }] }, steps: steps, hint: 'Count the cubes along the front and along the side of the top layer.' };
    if (shape === 'seen') { var seen = V - (l - 1) * (w - 1) * (h - 1), nm = who(R);
      return { q: nm + ' counted only the cubes that can be seen in the picture and got ' + seen + '. The box is filled with unit cubes all the way through. What is its volume in cubic units?', viz: box(l, w, h), a: num(V, 'int'), steps: ['Some cubes are hidden inside and at the back, so counting what you can see misses them.'].concat(steps), hint: 'Count by layers instead: cubes in one layer times the number of layers.' }; }
    if (shape === 'text') return { q: 'A box is packed with unit cubes: ' + l + ' cubes long, ' + w + ' cubes wide and ' + h + ' cubes high, with no gaps. What is its volume in cubic units?', a: num(V, 'int'), unit: 'cubic units', steps: steps, hint: 'Find the cubes in one layer, then multiply by the number of layers.' };
    return { q: 'This box is filled with unit cubes, with no gaps or overlaps. What is its volume in cubic units?', viz: box(l, w, h), a: num(V, 'int'), unit: 'cubic units', steps: steps, hint: 'Count the cubes in one layer, then count the layers.' };
  });

  // ---------------------------------------------------------------- g5.volume-of-prism
  G('g5.volume-of-prism', function (R, ctx) {
    var lv = L(ctx), u = R.pick(UNITS3), l = R.int(2, by(ctx, 6, 9, 15)), w = R.int(2, by(ctx, 5, 8, 10)), h = R.int(2, by(ctx, 5, 8, 12)), V = l * w * h, shape = R.pickW(['calc', 'unit', 'cube'], [5, 2, lv === 1 ? 0 : 1]);
    var steps = ['Volume = length × width × height.', '$' + l + X + w + X + h + ' = ' + (l * w) + X + h + ' = ' + nc(V) + '$.', 'The volume is ' + nc(V) + ' cubic ' + u[1] + ' (cubes ' + u[0] + ' on a side fill it).'];
    if (shape === 'unit') { var nm = who(R);
      return { q: nm + ' says a box that is ' + l + ' ' + u[0] + ' long, ' + w + ' ' + u[0] + ' wide and ' + h + ' ' + u[0] + ' high has a volume of ' + (l + w + h) + ' cubic ' + u[1] + ', because $' + l + ' + ' + w + ' + ' + h + ' = ' + (l + w + h) + '$. What is the correct volume?',
        a: mc(nc(V) + ' cubic ' + u[1], [(l + w + h) + ' cubic ' + u[1], nc(V) + ' square ' + u[1], (l * w) + ' cubic ' + u[1], nc(2 * (l * w + l * h + w * h)) + ' cubic ' + u[1]]),
        steps: ['Adding the edges does not count cubes. Volume counts the unit cubes that fill the box.'].concat(steps, ['It is measured in cubic units, not square units: each unit is a cube.']), hint: 'Multiply length, width and height. Volume is measured in cubic units.' }; }
    if (shape === 'cube') { var s = R.int(2, by(ctx, 5, 9, 12)), Vc = s * s * s;
      return { q: 'A cube has edges that are ' + s + ' ' + u[1] + ' long. What is its volume in cubic ' + u[1] + '?', a: num(Vc, 'int'), unit: 'cubic ' + u[0], steps: ['All three edges of a cube are equal.', '$' + s + X + s + X + s + ' = ' + (s * s) + X + s + ' = ' + nc(Vc) + '$ cubic ' + u[1] + '.'], hint: 'Length, width and height are all ' + s + '.' }; }
    var pic = lv === 1 || (lv === 2 && l <= 7 && w <= 5 && h <= 5);
    return { q: (pic ? 'Find the volume of this rectangular prism.' : 'A box is ' + l + ' ' + u[1] + ' long, ' + w + ' ' + u[1] + ' wide and ' + h + ' ' + u[1] + ' high. What is its volume?') + ' Give the answer in cubic ' + u[1] + '.', viz: pic ? box(l, w, h, 'lwh', u[0]) : undefined,
      a: num(V, 'int'), unit: 'cubic ' + u[0], steps: steps, hint: 'Multiply the three edge lengths.' };
  });

  // ---------------------------------------------------------------- g5.volume-base-times-height
  G('g5.volume-base-times-height', function (R, ctx) {
    var lv = L(ctx), u = R.pick(UNITS3), l = R.int(2, 9), w = R.int(2, 8), h = R.int(2, by(ctx, 6, 9, 12)), B = l * w, V = B * h, shape = R.pickW(['Bh', 'dims', 'which', 'findh', 'findB'], [3, 2, 2, lv === 1 ? 0 : 2, lv === 3 ? 2 : 0]);
    if (shape === 'Bh') return { q: 'The base of a rectangular prism has an area of ' + B + ' square ' + u[1] + '. The prism is ' + h + ' ' + u[1] + ' tall. What is its volume?', a: num(V, 'int'), unit: 'cubic ' + u[0],
      steps: ['The base is one layer of ' + B + ' unit cubes, and the height says there are ' + h + ' layers.', '$V = B' + X + 'h = ' + B + X + h + ' = ' + nc(V) + '$ cubic ' + u[1] + '.'], hint: 'Volume = base area × height.' };
    if (shape === 'dims') return { q: 'A rectangular prism has a base that is ' + l + ' ' + u[0] + ' by ' + w + ' ' + u[0] + ', and a height of ' + h + ' ' + u[0] + '. Find the area of the base, then the volume.', viz: lv === 1 && l <= 7 && w <= 5 && h <= 6 ? box(l, w, h, 'lwh', u[0]) : undefined,
      a: { t: 'multi', parts: [{ label: 'Base area (square ' + u[0] + ')', a: num(B, 'int') }, { label: 'Volume (cubic ' + u[0] + ')', a: num(V, 'int') }] },
      steps: ['Base area: $B = ' + l + X + w + ' = ' + B + '$ square ' + u[1] + '.', 'Volume: $V = B' + X + 'h = ' + B + X + h + ' = ' + nc(V) + '$ cubic ' + u[1] + '.'], hint: 'The base is a rectangle: length × width. Then multiply by the height.' };
    if (shape === 'which') return { q: 'A prism has a base that is ' + l + ' by ' + w + ' and a height of ' + h + '. Which expression gives its volume?',
      a: mc('$(' + l + X + w + ')' + X + h + '$', ['$' + l + X + w + ' + ' + h + '$', '$(' + l + ' + ' + w + ')' + X + h + '$', '$' + l + ' + ' + w + ' + ' + h + '$', '$2' + X + '(' + l + ' + ' + w + ')' + X + h + '$']),
      steps: ['$' + l + X + w + '$ is the area of the base: the number of cubes in one layer.', 'Multiplying by the height ' + h + ' counts the layers: $(' + l + X + w + ')' + X + h + ' = ' + V + '$.'], hint: 'First find the cubes in one layer, then multiply by the number of layers.' };
    if (shape === 'findh') return { q: 'A rectangular prism has a volume of ' + nc(V) + ' cubic ' + u[1] + ' and a base area of ' + B + ' square ' + u[1] + '. How tall is it?', a: num(h, 'int'), unit: u[0],
      steps: ['$V = B' + X + 'h$, so $' + nc(V) + ' = ' + B + X + 'h$.', 'Divide: $h = ' + nc(V) + DV + B + ' = ' + h + '$ ' + u[1] + '.'], hint: 'Volume = base × height. Which number times ' + B + ' gives ' + nc(V) + '?' };
    return { q: 'A rectangular prism is ' + h + ' ' + u[1] + ' tall and has a volume of ' + nc(V) + ' cubic ' + u[1] + '. What is the area of its base?', a: num(B, 'int'), unit: 'sq ' + u[0],
      steps: ['$V = B' + X + 'h$, so $' + nc(V) + ' = B' + X + h + '$.', 'Divide: $B = ' + nc(V) + DV + h + ' = ' + B + '$ square ' + u[1] + '.'], hint: 'Divide the volume by the height.' };
  });

  // ---------------------------------------------------------------- g5.composite-volume
  G('g5.composite-volume', function (R, ctx) {
    var lv = L(ctx), u = R.pick([['cm', 'centimeters'], ['m', 'meters'], ['ft', 'feet'], ['in', 'inches']]), kind = R.pick(['step', 'ell']), total = lv === 3 && kind === 'step' && R.coin();
    var A, B, Bat, vz, txt, a1, a2, w, h1, h2, w1, w2, hh;
    if (kind === 'step') {
      a1 = R.int(4, 7); a2 = R.int(2, a1 - 2); w = R.int(2, 4); h1 = R.int(1, 3); h2 = R.int(2, 4);
      A = [a1, w, h1]; B = [a2, w, h2]; Bat = [0, 0, h1];
      vz = { name: 'g5-prisms', opts: { boxes: [{ at: [0, 0, 0], size: A, show: total ? 'lw' : 'lwh' }, { at: Bat, size: B, show: total ? 'LH' : 'Lh' }], unit: u[0], controls: false, quiet: true }, label: 'Two rectangular prisms of unit cubes, one on top of the other.' };
      if (total) vz.opts.labels = [{ at: [0, w, (h1 + h2) / 2], text: (h1 + h2) + ' ' + u[0], al: 'right' }];
      txt = 'This solid is made of two rectangular prisms, one on top of the other. Both are ' + w + ' ' + u[0] + ' wide.' + (total ? ' The whole solid is ' + (h1 + h2) + ' ' + u[0] + ' tall.' : '');
    } else {
      a1 = R.int(2, 4); a2 = R.int(2, 4); w1 = R.int(3, 5); w2 = R.int(1, w1 - 1); hh = R.int(2, 4);
      A = [a1, w1, hh]; B = [a2, w2, hh]; Bat = [a1, 0, 0];
      vz = { name: 'g5-prisms', opts: { boxes: [{ at: [0, 0, 0], size: A, show: 'lWh' }, { at: Bat, size: B, show: 'lw' }], unit: u[0], controls: false, quiet: true }, label: 'Two rectangular prisms of unit cubes side by side, making an L shape.' };
      txt = 'This solid is made of two rectangular prisms side by side. Both are ' + hh + ' ' + u[0] + ' tall.';
    }
    var vA = A[0] * A[1] * A[2], vB = B[0] * B[1] * B[2], V = vA + vB;
    var steps = ['Split the solid into the two prisms. They do not overlap, so each cube is counted once.'];
    if (total) steps.push('The bottom prism\'s height is the whole height minus the top prism\'s height: $' + (h1 + h2) + ' - ' + h2 + ' = ' + h1 + '$ ' + u[0] + '.');
    steps.push((kind === 'step' ? 'Bottom' : 'Left') + ' prism: $' + A.join(X) + ' = ' + vA + '$ cubic ' + u[1] + '.');
    steps.push((kind === 'step' ? 'Top' : 'Right') + ' prism: $' + B.join(X) + ' = ' + vB + '$ cubic ' + u[1] + '.');
    steps.push('Add: $' + vA + ' + ' + vB + ' = ' + V + '$ cubic ' + u[1] + '.');
    if (lv === 1 && R.chance(0.3)) return { q: txt + ' What is the volume of the ' + (kind === 'step' ? 'top' : 'right') + ' prism, in cubic ' + u[1] + '?', viz: vz, a: num(vB, 'int'), unit: 'cubic ' + u[0], steps: steps.slice(steps.length - 2, steps.length - 1), hint: 'Use only the measurements of that prism: length × width × height.' };
    return { q: txt + ' What is the total volume, in cubic ' + u[1] + '?', viz: vz, a: num(V, 'int'), unit: 'cubic ' + u[0], steps: steps, hint: 'Find the volume of each prism, then add.' };
  });

  // ---------------------------------------------------------------- g5.volume-word-problems
  G('g5.volume-word-problems', function (R, ctx) {
    var lv = L(ctx), nm = who(R), t = R.pickW(['missing', 'compare', 'cubes2', 'unit', 'fill'], [3, 2, lv === 1 ? 0 : 2, 2, 2]);
    if (t === 'missing') { var l = R.int(3, 10), w = R.int(2, 8), h = R.int(2, 9), V = l * w * h, u = R.pick(UNITS3);
      return { q: 'A box has a volume of ' + nc(V) + ' cubic ' + u[1] + '. It is ' + l + ' ' + u[1] + ' long and ' + w + ' ' + u[1] + ' wide. How tall is it?', a: num(h, 'int'), unit: u[0],
        steps: ['The base is $' + l + X + w + ' = ' + (l * w) + '$ square ' + u[1] + ', so each layer holds ' + (l * w) + ' unit cubes.', 'Layers needed: $' + nc(V) + DV + (l * w) + ' = ' + h + '$.', 'The box is ' + h + ' ' + u[1] + ' tall. Check: $' + l + X + w + X + h + ' = ' + nc(V) + '$.'], hint: 'Find the base area, then divide the volume by it.' }; }
    if (t === 'compare') { for (;;) { var A = [R.int(3, 8), R.int(2, 6), R.int(2, 6)], B2 = [R.int(3, 8), R.int(2, 6), R.int(2, 6)], va = A[0] * A[1] * A[2], vb = B2[0] * B2[1] * B2[2]; if (va !== vb) break; }
      var big = va > vb ? 'A' : 'B';
      return { q: 'Box A is ' + A.join(' in by ') + ' in. Box B is ' + B2.join(' in by ') + ' in. Which box holds more, and how many more cubic inches does it hold? Type the difference.', a: num(Math.abs(va - vb), 'int'), unit: 'cubic in',
        steps: ['Box A: $' + A.join(X) + ' = ' + va + '$ cubic inches.', 'Box B: $' + B2.join(X) + ' = ' + vb + '$ cubic inches.', 'Box ' + big + ' holds more: $' + Math.max(va, vb) + ' - ' + Math.min(va, vb) + ' = ' + Math.abs(va - vb) + '$ cubic inches more.'], hint: 'Find each volume, then subtract.' }; }
    if (t === 'cubes2') { var s = R.pick([2, 3]), d = [s * R.int(2, 4), s * R.int(1, 3), s * R.int(1, 3)], n = d[0] * d[1] * d[2] / (s * s * s);
      return { q: 'How many cubes with ' + s + '-cm edges fit exactly inside a box that is ' + d.join(' cm by ') + ' cm?', a: num(n, 'int'),
        steps: ['Along each edge: $' + d[0] + DV + s + ' = ' + d[0] / s + '$, $' + d[1] + DV + s + ' = ' + d[1] / s + '$, $' + d[2] + DV + s + ' = ' + d[2] / s + '$ cubes.', 'Cubes: $' + d[0] / s + X + d[1] / s + X + d[2] / s + ' = ' + n + '$.', 'Check: the box is $' + (d[0] * d[1] * d[2]) + '$ cubic cm and each cube is $' + (s * s * s) + '$ cubic cm: $' + (d[0] * d[1] * d[2]) + DV + (s * s * s) + ' = ' + n + '$.'], hint: 'How many big cubes fit along each edge?' }; }
    if (t === 'unit') { var a = 10 * R.int(3, 6), b = 10 * R.int(2, 4), c = 10 * R.int(2, 4), Vv = a * b * c;
      return { q: 'A fish tank is ' + a + ' cm long, ' + b + ' cm wide and ' + c + ' cm tall. Which is its volume?', a: mc(nc(Vv) + ' cubic centimeters', [nc(Vv) + ' square centimeters', (a + b + c) + ' cubic centimeters', nc(a * b) + ' cubic centimeters', nc(Vv / 10) + ' cubic centimeters']),
        steps: ['$' + a + X + b + X + c + ' = ' + nc(Vv) + '$.', 'Volume counts cubes, so the unit is cubic centimeters. Square centimeters measure area, not space inside a box.'], hint: 'Multiply all three edges. Which unit measures space?' }; }
    var L2 = R.int(4, 10), W2 = R.int(2, 6), dep = R.int(1, 3), Vf = L2 * W2 * dep, kind = R.int(0, 1);
    return { q: kind ? nm + ' fills a sandbox that is ' + L2 + ' ft long and ' + W2 + ' ft wide with sand ' + dep + ' ft deep. How many cubic feet of sand is that?' : 'A garden bed is ' + L2 + ' ft long and ' + W2 + ' ft wide. ' + nm + ' fills it with soil ' + dep + ' ft deep. How many cubic feet of soil are needed?', a: num(Vf, 'int'), unit: 'cubic ft',
      steps: ['The soil or sand makes a rectangular prism ' + L2 + ' by ' + W2 + ' by ' + dep + ' feet.', '$' + L2 + X + W2 + X + dep + ' = ' + Vf + '$ cubic feet.'], hint: 'Length × width × depth.' };
  });


  /* ================================================================ unit: the coordinate plane */
  function tup(x, y) { return { t: 'tuple', v: [String(x), String(y)] }; }
  function ptsWithSwap(R, n, max) {
    for (var t = 0; t < 200; t++) {
      var x = R.int(1, max), y = R.intNot(1, max, x), pts = [[x, y], [y, x]];
      while (pts.length < n) { var p = [R.int(0, max), R.int(0, max)]; if (!pts.some(function (q2) { return q2[0] === p[0] && q2[1] === p[1]; }) && !(p[0] === 0 && p[1] === 0)) pts.push(p); }
      return R.shuffle(pts);
    }
  }
  var LET = ['A', 'B', 'C', 'D', 'E'];
  function gridViz(pts, o) { o = o || {}; return { name: 'g5-grid', opts: Object.assign({ xmax: o.xmax || 10, ymax: o.ymax || 10, points: pts.map(function (p, i) { return { x: p[0], y: p[1], label: LET[i] }; }), controls: false, quiet: true }, o), label: 'A coordinate grid with points ' + pts.map(function (p, i) { return LET[i] + ' at (' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '.' }; }

  // ---------------------------------------------------------------- g5.coordinate-plane
  G('g5.coordinate-plane', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['read', 'which', 'across', 'move'], [4, 3, 2, lv === 1 ? 0 : 3]), max = by(ctx, 8, 10, 10);
    if (shape === 'read' || shape === 'which') {
      var pts = ptsWithSwap(R, 4, max), k = pts.findIndex(function (p) { return pts.some(function (q2) { return q2[0] === p[1] && q2[1] === p[0] && q2 !== p; }); }), P = pts[k];
      var vz = gridViz(pts, { xmax: max, ymax: max });
      if (shape === 'read') return { q: 'What are the coordinates of point ' + LET[k] + '?', viz: vz, a: tup(P[0], P[1]),
        steps: ['Start at the origin, $(0, 0)$.', 'Go across the x-axis until you are under ' + LET[k] + ': that is ' + P[0] + '.', 'Then go up to ' + LET[k] + ': that is ' + P[1] + '.', 'Across first, then up: $(' + P[0] + ', ' + P[1] + ')$.'], hint: 'The first number tells how far across; the second tells how far up.' };
      var tw2 = pts.findIndex(function (q2) { return q2[0] === P[1] && q2[1] === P[0]; });
      return { q: 'Which point is at $(' + P[0] + ', ' + P[1] + ')$?', viz: vz, a: keep(pts.map(function (p, i) { return LET[i]; }), k),
        steps: ['Start at $(0, 0)$. Go ' + P[0] + ' across, then ' + P[1] + ' up. You land on point ' + LET[k] + '.', 'Point ' + LET[tw2] + ' is at $(' + P[1] + ', ' + P[0] + ')$: the same numbers in the other order, which is a different point.'], hint: 'Across first, then up.' };
    }
    if (shape === 'across') { var x = R.int(1, 9), y = R.intNot(1, 9, x), up = R.coin();
      return { q: 'To plot the point $(' + x + ', ' + y + ')$, you start at the origin. How many units do you move ' + (up ? 'up' : 'across, to the right') + '?', a: num(up ? y : x, 'int'),
        steps: ['In an ordered pair, the first number is the distance across (along the x-axis) and the second is the distance up (along the y-axis).', 'For $(' + x + ', ' + y + ')$: ' + x + ' across and ' + y + ' up.'], hint: 'Which number comes first in the pair?' }; }
    var sx = R.int(0, 5), sy = R.int(0, 5), dx = R.int(1, 4), dy = R.int(1, 4), rev = lv === 3 && R.coin();
    if (rev) { sx += dx; return { q: 'Start at $(' + sx + ', ' + sy + ')$. Move ' + dx + ' units left and ' + dy + ' units up. Where are you now?', a: tup(sx - dx, sy + dy), steps: ['Left changes the first number: $' + sx + ' - ' + dx + ' = ' + (sx - dx) + '$.', 'Up changes the second number: $' + sy + ' + ' + dy + ' = ' + (sy + dy) + '$.', 'You are at $(' + (sx - dx) + ', ' + (sy + dy) + ')$.'], hint: 'Left and right change the first number; up and down change the second.' }; }
    return { q: 'Start at $(' + sx + ', ' + sy + ')$. Move ' + dx + ' units right and ' + dy + ' units up. Where are you now?', a: tup(sx + dx, sy + dy),
      steps: ['Right changes the first number: $' + sx + ' + ' + dx + ' = ' + (sx + dx) + '$.', 'Up changes the second number: $' + sy + ' + ' + dy + ' = ' + (sy + dy) + '$.', 'You are at $(' + (sx + dx) + ', ' + (sy + dy) + ')$.'], hint: 'Right and left change the first number; up and down change the second.' };
  });

  // ---------------------------------------------------------------- g5.graph-real-world-points
  var RW = [
    function (R) { var r = R.pick([5, 6, 8, 10, 12]); return { ask: function (x) { return 'How many dollars are earned in ' + x + ' hours?'; }, back: function (y) { return 'How many hours of work earn \\$' + y + '?'; }, x: 'Hours worked', y: 'Dollars earned', xs: 'hours', ys: 'dollars', f: function (x) { return r * x; }, ystep: r, who: 'earns', unitY: function (v) { return '\\$' + v; }, mean: function (a, b) { return 'Working ' + a + ' hours earns \\$' + b + '.'; }, wrongMean: function (a, b) { return 'Working ' + b + ' hours earns \\$' + a + '.'; } }; },
    function (R) { var s = R.int(2, 5), g = R.int(1, 3); return { ask: function (x) { return 'How tall is the plant after ' + x + ' days, in centimeters?'; }, back: function (y) { return 'After how many days is the plant ' + y + ' cm tall?'; }, x: 'Days', y: 'Plant height (cm)', xs: 'days', ys: 'cm', f: function (x) { return s + g * x; }, ystep: g > 1 ? 2 : 1, who: 'grows', unitY: function (v) { return v + '\\text{ cm}'; }, mean: function (a, b) { return 'After ' + a + ' days the plant is ' + b + ' cm tall.'; }, wrongMean: function (a, b) { return 'After ' + b + ' days the plant is ' + a + ' cm tall.'; } }; },
    function (R) { var c = R.pick([10, 12, 15]); return { ask: function (x) { return 'How many cookies do ' + x + ' cups of flour make?'; }, back: function (y) { return 'How many cups of flour make ' + y + ' cookies?'; }, x: 'Cups of flour', y: 'Cookies', xs: 'cups', ys: 'cookies', f: function (x) { return c * x; }, ystep: c, who: 'bakes', unitY: function (v) { return v; }, mean: function (a, b) { return a + ' cups of flour make ' + b + ' cookies.'; }, wrongMean: function (a, b) { return b + ' cups of flour make ' + a + ' cookies.'; } }; },
    function (R) { var st = R.pick([5, 10, 15]), w = R.pick([5, 10]); return { ask: function (x) { return 'How many dollars have been saved after ' + x + ' weeks?'; }, back: function (y) { return 'After how many weeks have \\$' + y + ' been saved?'; }, x: 'Weeks', y: 'Dollars saved', xs: 'weeks', ys: 'dollars', f: function (x) { return st + w * x; }, ystep: 5, who: 'saves', unitY: function (v) { return '\\$' + v; }, mean: function (a, b) { return 'After ' + a + ' weeks, \\$' + b + ' has been saved.'; }, wrongMean: function (a, b) { return 'After ' + b + ' weeks, \\$' + a + ' has been saved.'; } }; }
  ];
  G('g5.graph-real-world-points', function (R, ctx) {
    var lv = L(ctx), C2 = R.pick(RW)(R), nm = R.pick(['Ana', 'Rosa', 'Priya', 'Emi', 'Zoe', 'Nora', 'Lena']), xs = [1, 2, 3, 4, 5], pts = xs.map(function (x) { return [x, C2.f(x)]; });
    var ymax = Math.ceil(C2.f(8) / C2.ystep) * C2.ystep, shape = R.pickW(['read', 'pair', 'mean', 'extend', 'back'], [3, 2, 2, lv === 1 ? 0 : 2, lv === 1 ? 1 : 2]);
    var vz = { name: 'g5-grid', opts: { xmax: 8, ymax: ymax, ystep: C2.ystep, xlabel: C2.x, ylabel: C2.y, points: pts.map(function (p) { return { x: p[0], y: p[1] }; }), controls: false, quiet: true }, label: 'A graph of ' + C2.y + ' against ' + C2.x + ', with points ' + pts.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '.' };
    var intro = 'The graph shows ' + C2.y.toLowerCase().replace(/ \(cm\)/, ' in centimeters') + ' (up) for each number of ' + C2.xs + ' (across). ';
    var i = R.int(1, 4), P = pts[i];
    if (shape === 'read') return { q: intro + C2.ask(P[0]), viz: vz, a: num(P[1], 'int'),
      steps: ['Find ' + P[0] + ' on the across axis (' + C2.x.toLowerCase() + ').', 'Go up to the point above it, then look left to the up axis: $' + P[1] + '$.', 'The point is $(' + P[0] + ', ' + P[1] + ')$.'], hint: 'Find the point above ' + P[0] + ' and read across to the left.' };
    if (shape === 'pair') return { q: intro + 'Which ordered pair shows ' + P[0] + ' ' + C2.xs + ' and ' + P[1] + ' ' + C2.ys + '?', viz: vz, a: tup(P[0], P[1]),
      steps: ['The across number comes first: ' + C2.x.toLowerCase() + ' = ' + P[0] + '.', 'The up number comes second: ' + C2.y.toLowerCase().replace(/ \(cm\)/, '') + ' = ' + P[1] + '.', 'The pair is $(' + P[0] + ', ' + P[1] + ')$.'], hint: 'First the number on the across axis, then the number on the up axis.' };
    if (shape === 'mean') return { q: intro + 'What does the point $(' + P[0] + ', ' + P[1] + ')$ mean?', viz: vz, a: mc(C2.mean(P[0], P[1]), [C2.wrongMean(P[0], P[1]), C2.mean(P[0], P[1] + C2.ystep), C2.mean(P[0] + 1, P[1])]),
      steps: ['The first number is on the across axis: ' + P[0] + ' ' + C2.xs + '.', 'The second number is on the up axis: ' + P[1] + ' ' + C2.ys + '.', C2.mean(P[0], P[1])], hint: 'Which axis does each number belong to?' };
    if (shape === 'extend') { var x6 = R.int(6, 8), y6 = C2.f(x6), step = C2.f(2) - C2.f(1);
      return { q: intro + 'The pattern continues. ' + C2.ask(x6), viz: vz, a: num(y6, 'int'),
        steps: ['Each step of 1 across goes up by $' + step + '$: the points are $' + pts.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(',\\; ') + '$.', 'From $(5, ' + C2.f(5) + ')$, add $' + step + '$ for each step: $' + C2.f(5) + ' + ' + (x6 - 5) + X + step + ' = ' + y6 + '$.'], hint: 'How much does the height of the points change for each step across?' }; }
    return { q: intro + C2.back(P[1]), viz: vz, a: num(P[0], 'int'),
      steps: ['Find ' + P[1] + ' on the up axis and go right to the point at that height.', 'Go down to the across axis: ' + P[0] + '.', 'The point is $(' + P[0] + ', ' + P[1] + ')$.'], hint: 'Start on the up axis this time.' };
  });

  // ---------------------------------------------------------------- g5.two-patterns
  G('g5.two-patterns', function (R, ctx) {
    var lv = L(ctx), a, b;
    if (lv === 3 && R.coin()) { var pr = R.pick([[2, 3], [4, 6], [2, 5], [4, 10], [6, 9]]); a = pr[0]; b = pr[1]; } else { a = R.int(1, 6); b = a * R.int(2, 4); }
    var swap = R.coin(), A = { r: a, n: 'A' }, B = { r: b, n: 'B' };
    var ta = [0, 1, 2, 3, 4].map(function (i) { return i * a; }), tb = [0, 1, 2, 3, 4].map(function (i) { return i * b; }), ratio = Q(b, a);
    var intro = 'Pattern A starts at 0 and adds ' + a + ' each time: ' + ta.join(', ') + ', … Pattern B starts at 0 and adds ' + b + ' each time: ' + tb.join(', ') + ', … ';
    var shape = R.pickW(['rel', 'next', 'pair', 'match', 'point'], [3, lv === 1 ? 2 : 1, 2, lv === 1 ? 0 : 2, lv === 1 ? 0 : 2]);
    var relStep = 'Compare matching terms: ' + [1, 2, 3, 4].map(function (i) { return '$' + tb[i] + DV + ta[i] + ' = ' + qt(ratio) + '$'; }).join(', ') + '. Each term of B is $' + qt(ratio) + '$ times the matching term of A, because B adds $' + qt(ratio) + '$ times as much each step.';
    if (shape === 'rel') return { q: intro + 'Each term of pattern B is how many times the matching term of pattern A?', a: num(ratio.toString()), steps: [relStep], hint: 'Divide a term of B by the matching term of A. Try a few pairs.' };
    if (shape === 'next') { var who2 = R.coin() ? 'A' : 'B';
      return { q: intro + 'What is the next term of pattern ' + who2 + '?', a: num(who2 === 'A' ? 5 * a : 5 * b, 'int'), steps: ['Pattern ' + who2 + ' adds ' + (who2 === 'A' ? a : b) + ' each time.', 'After ' + (who2 === 'A' ? ta[4] : tb[4]) + ' comes $' + (who2 === 'A' ? ta[4] : tb[4]) + ' + ' + (who2 === 'A' ? a : b) + ' = ' + (who2 === 'A' ? 5 * a : 5 * b) + '$.'], hint: 'Add the rule once more.' }; }
    if (shape === 'pair') { var k = R.int(2, 5);
      return { q: intro + 'Make ordered pairs (term of A, term of B) from matching terms. What is the pair made from the ' + U.ordinal(k + 1) + ' terms?', a: tup(k * a, k * b),
        steps: ['The first terms are both 0, so the ' + U.ordinal(k + 1) + ' terms come after ' + k + ' steps.', 'Pattern A: $' + k + X + a + ' = ' + (k * a) + '$. Pattern B: $' + k + X + b + ' = ' + (k * b) + '$.', 'The pair is $(' + (k * a) + ', ' + (k * b) + ')$: the term of A first.'], hint: 'Count the terms from 0. Keep A first in the pair.' }; }
    if (shape === 'match') { var m = R.int(6, 12), va = m * a, vb = m * b;
      return { q: intro + 'When pattern A reaches ' + va + ', what is the matching term of pattern B?', a: num(vb, 'int'), steps: [relStep, 'So the matching term is $' + qt(ratio) + X + va + ' = ' + vb + '$.'], hint: 'How do the terms of B compare with the terms of A?' }; }
    var mm = R.int(2, 6), right = '(' + mm * a + ', ' + mm * b + ')';
    return { q: intro + 'The pairs (term of A, term of B) are graphed. Which point is on the graph?', a: mc('$' + right + '$', ['$(' + mm * b + ', ' + mm * a + ')$', '$(' + mm * a + ', ' + (mm + 1) * b + ')$', '$(' + mm * a + ', ' + (mm * a + b) + ')$']),
      steps: ['Points on the graph have a term of A first and the matching term of B second.', 'After ' + mm + ' steps, A is $' + mm * a + '$ and B is $' + mm * b + '$, so $' + right + '$ is on the graph.', 'Every point on the graph has a second number that is $' + qt(ratio) + '$ times the first.'], hint: 'Check each choice: is the second number ' + qt(ratio).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') + ' times the first?' };
  });

  /* ================================================================ unit: classifying shapes */
  var TFQ = [
    ['Every square is a rectangle.', true, 'A rectangle has 4 right angles. Every square has 4 right angles, so every square is a rectangle.'],
    ['Every rectangle is a square.', false, 'A square needs 4 equal sides. A rectangle can have two long sides and two short sides, so not every rectangle is a square.'],
    ['Every square is a rhombus.', true, 'A rhombus has 4 equal sides. Every square has 4 equal sides, so every square is a rhombus.'],
    ['Every rhombus is a square.', false, 'A square also needs 4 right angles. A rhombus can be slanted, with no right angles.'],
    ['Every rhombus is a parallelogram.', true, 'A rhombus has two pairs of parallel sides, so it is a parallelogram.'],
    ['Every rectangle is a parallelogram.', true, 'A rectangle has two pairs of parallel sides, so it is a parallelogram.'],
    ['Every parallelogram is a rectangle.', false, 'A parallelogram can be slanted, with no right angles, so it is not always a rectangle.'],
    ['Some parallelograms are rectangles.', true, 'A parallelogram with 4 right angles is a rectangle, so some parallelograms are rectangles.'],
    ['Every square is a parallelogram.', true, 'A square has two pairs of parallel sides, so it is a parallelogram.'],
    ['Every quadrilateral is a parallelogram.', false, 'Many quadrilaterals, like kites, do not have two pairs of parallel sides.'],
    ['Every rectangle is a quadrilateral.', true, 'A rectangle has 4 straight sides, so it is a quadrilateral.'],
    ['Every equilateral triangle is isosceles.', true, 'Isosceles means at least two equal sides. An equilateral triangle has three, so it is isosceles too.'],
    ['Every isosceles triangle is equilateral.', false, 'An isosceles triangle may have only two equal sides.'],
    ['A right triangle can also be isosceles.', true, 'A right triangle can have two equal legs, so it can be isosceles.'],
    ['Every kite is a rhombus.', false, 'A kite only needs two pairs of equal sides next to each other; a rhombus needs all 4 sides equal.']
  ];
  var DESC = [
    ['4 equal sides and 4 right angles', 'square'],
    ['4 right angles, but its sides are not all equal', 'rectangle'],
    ['4 equal sides, but no right angles', 'rhombus'],
    ['two pairs of parallel sides, no right angles, and sides that are not all equal', 'parallelogram'],
    ['exactly one pair of parallel sides', 'trapezoid'],
    ['two pairs of equal sides that are next to each other, and no parallel sides', 'kite']
  ];
  var QN = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'kite'];
  G('g5.shape-hierarchy', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['tf', 'name', 'both', 'all'], [3, 3, 2, lv === 1 ? 0 : 2]);
    if (shape === 'tf') { var t = R.pick(TFQ); return { q: 'True or false: ' + t[0], a: { t: 'tf', v: t[1] }, steps: [t[2]], hint: 'Think about which properties each shape must have.' }; }
    if (shape === 'name') { var d = R.pick(DESC); return { q: 'A quadrilateral has ' + d[0] + '. What is the most specific name for it?', a: mc(d[1], QN.filter(function (n) { return n !== d[1]; })), steps: ['Match the properties with the family tree of quadrilaterals.', 'Those properties describe a ' + d[1] + '.'], hint: 'Start with the most special shapes (square) and work toward the general ones.' }; }
    if (shape === 'both') { var b = R.pick([['a rectangle and a rhombus', 'square', 'A square has the 4 right angles of a rectangle and the 4 equal sides of a rhombus.'], ['a rhombus and a rectangle', 'square', 'Only a square has both 4 equal sides and 4 right angles.'], ['a parallelogram and a kite', 'rhombus', 'A rhombus has two pairs of parallel sides and two pairs of equal sides next to each other.']]);
      return { q: 'Which shape is always both ' + b[0] + '?', a: mc(b[1], ['parallelogram', 'trapezoid', 'kite', 'rectangle', 'rhombus'].filter(function (n) { return n !== b[1]; })), steps: [b[2]], hint: 'Find where the two families overlap.' }; }
    var s2 = R.pick([['square', [0, 1, 2, 3]], ['rectangle', [0, 1]], ['rhombus', [0, 2]]]), names = ['parallelogram', 'rectangle', 'rhombus', 'quadrilateral', 'triangle'];
    var isA = { square: ['parallelogram', 'rectangle', 'rhombus', 'quadrilateral'], rectangle: ['parallelogram', 'quadrilateral'], rhombus: ['parallelogram', 'quadrilateral'] }[s2[0]];
    var ch = ['parallelogram', 'rectangle', 'rhombus', 'quadrilateral', 'triangle'].filter(function (n) { return n !== s2[0]; }), v = []; ch.forEach(function (n, i) { if (isA.indexOf(n) >= 0) v.push(i); });
    void names;
    return { q: 'Select every name that always fits a ' + s2[0] + '.', a: { t: 'mc', choices: ch, v: v },
      steps: ['A ' + s2[0] + ' is also ' + isA.map(function (n) { return (/^[aeiou]/.test(n) ? 'an ' : 'a ') + n; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.', 'It has 4 sides, so it is never a triangle' + (s2[0] === 'rectangle' ? ', and its sides are not always equal, so it is not always a rhombus' : s2[0] === 'rhombus' ? ', and it does not always have right angles, so it is not always a rectangle' : '') + '.'],
      hint: 'Follow the family tree up from the ' + s2[0] + '.' };
  });

  // ---------------------------------------------------------------- g5.inherited-properties
  var INH = [
    ['Squares are rectangles. Which property must every square have because it is a rectangle?', '4 right angles', ['4 equal sides', 'exactly one pair of parallel sides', 'no right angles'], 'Rectangles have 4 right angles, so squares do too. (Squares also have 4 equal sides, but that comes from being a rhombus.)'],
    ['Squares are rhombuses. Which property must every square have because it is a rhombus?', '4 equal sides', ['4 right angles', 'exactly one pair of parallel sides', 'two long sides and two short sides'], 'Every rhombus has 4 equal sides, so every square does too. (The right angles come from being a rectangle.)'],
    ['Rectangles are parallelograms. Which property must every rectangle have because it is a parallelogram?', 'opposite sides that are parallel', ['4 equal sides', 'exactly one pair of parallel sides', 'no right angles'], 'Every parallelogram has two pairs of parallel sides, so every rectangle does too.'],
    ['Rhombuses are parallelograms. Which must be true of every rhombus?', 'Its opposite angles are equal.', ['It has 4 right angles.', 'It has exactly one pair of parallel sides.', 'Its sides are all different lengths.'], 'Opposite angles of a parallelogram are equal, and a rhombus is a parallelogram, so its opposite angles are equal too.'],
    ['A quadrilateral has 4 right angles. Which must also be true?', 'Its opposite sides are parallel.', ['All its sides are equal.', 'It is a square.', 'It has exactly one pair of parallel sides.'], 'With 4 right angles it is a rectangle, and every rectangle is a parallelogram, so its opposite sides are parallel. Its sides need not all be equal.'],
    ['A quadrilateral has 4 equal sides. Which must also be true?', 'It is a parallelogram.', ['It is a square.', 'It has 4 right angles.', 'It is a rectangle.'], 'With 4 equal sides it is a rhombus, and every rhombus is a parallelogram. It is a square only if it also has right angles.'],
    ['An equilateral triangle is a special isosceles triangle. Which must be true of every equilateral triangle?', 'It has at least two equal sides.', ['It has a right angle.', 'It has no equal sides.', 'It has exactly two equal sides.'], 'Isosceles triangles have at least two equal sides, so equilateral triangles do too (they have three).']
  ];
  var TF2 = [
    ['A square has two pairs of parallel sides because it is a parallelogram.', true, 'Every parallelogram has two pairs of parallel sides, and a square is a parallelogram.'],
    ['A rectangle must have two long sides and two short sides.', false, 'A square is a rectangle with 4 equal sides, so a rectangle does not need long and short sides.'],
    ['Because a rhombus is a parallelogram, its opposite sides are parallel.', true, 'Every property of parallelograms passes down to rhombuses.'],
    ['A square cannot be a rectangle because its sides are all equal.', false, 'A rectangle only needs 4 right angles. A square has them, so it is a rectangle.'],
    ['Every property of a rectangle is also true of a square.', true, 'Every square is a rectangle, so it has all of a rectangle\'s properties.'],
    ['Every property of a square is also true of a rectangle.', false, 'Squares have 4 equal sides, but many rectangles do not.'],
    ['If a shape is a rhombus, it has 4 equal sides.', true, 'Having 4 equal sides is what makes a quadrilateral a rhombus.'],
    ['If a parallelogram has one right angle, it has 4 right angles.', true, 'Opposite angles of a parallelogram are equal, and angles next to each other add to 180°, so one right angle forces all four to be right angles.']
  ];
  G('g5.inherited-properties', function (R, ctx) {
    var lv = L(ctx), shape = R.pickW(['mc', 'tf', 'num'], [3, 2, 3]);
    if (shape === 'num') {
      var k = R.int(0, 3), sd = R.int(3, 15), sd2 = R.intNot(3, 15, sd), ang = 5 * R.int(9, 33);
      if (ang === 90) ang = 95;
      if (k === 0) return { q: 'A rhombus has one side that is ' + sd + ' cm long. What is its perimeter, in centimeters?', a: num(4 * sd, 'int'), unit: 'cm', steps: ['Every rhombus has 4 equal sides, so all four sides are ' + sd + ' cm.', 'Perimeter: $4' + X + sd + ' = ' + (4 * sd) + '$ cm.'], hint: 'What is true of the sides of every rhombus?' };
      if (k === 1) return { q: 'A rectangle has two sides that meet at a corner: one is ' + sd + ' cm and the other is ' + sd2 + ' cm. What is its perimeter, in centimeters?', a: num(2 * (sd + sd2), 'int'), unit: 'cm', steps: ['A rectangle is a parallelogram, so its opposite sides are equal: two sides of ' + sd + ' cm and two of ' + sd2 + ' cm.', 'Perimeter: $' + sd + ' + ' + sd2 + ' + ' + sd + ' + ' + sd2 + ' = ' + (2 * (sd + sd2)) + '$ cm.'], hint: 'Rectangles inherit equal opposite sides from parallelograms.' };
      if (k === 2) return { q: 'A rhombus has an angle of $' + ang + '^\\circ$. In a parallelogram, opposite angles are equal. What is the angle opposite it, in degrees?', a: num(ang, 'int'), steps: ['Every rhombus is a parallelogram, so its opposite angles are equal.', 'The opposite angle is also $' + ang + '^\\circ$.'], hint: 'A rhombus is a parallelogram.' };
      return { q: 'A square has a perimeter of ' + (4 * sd) + ' inches. How long is each side, in inches?', a: num(sd, 'int'), unit: 'in', steps: ['Every square is a rhombus, so its 4 sides are equal.', 'Each side: $' + (4 * sd) + DV + '4 = ' + sd + '$ inches.'], hint: 'A square has 4 equal sides.' };
    }
    if (shape === 'tf') { var t = R.pick(lv === 1 ? TF2.slice(0, 6) : TF2); return { q: 'True or false: ' + t[0], a: { t: 'tf', v: t[1] }, steps: [t[2]], hint: 'If a shape belongs to a family, it has every property of that family.' }; }
    var m = R.pick(INH);
    return { q: m[0], a: mc(m[1], m[2]), steps: [m[3]], hint: 'A property passes down from a family to every shape in it.' };
  });

})(window.MathLadder);
