/* Math Ladder problem generators: Grade 7 (course key g7). One generator per topic in data/math/topics/g7.json.
   Built from /tmp/work_mlp7/gen/*.js by /tmp/work_mlp7/catgen.sh (edit the sources, not this file); tested by test-gen.js there.
   Every answer is computed from the numbers generated (exact rationals via ML.Q where fractions or decimals appear).
   Problems may carry p.chk: the raw givens, used only by the course's independent answer tests.
   Pictures inside problems use the course visuals in static/math/viz/g7.js (g7-plot, g7-angles, g7-figure). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, BL = ML.byLevel;
  /* register a generator; the test record p.chk is kept only when ML.__g7test is set (node tests in the work dir) */
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); if (p && !ML.__g7test) delete p.chk; return p; }); }

  /* ------------------------------------------------------------ shared helpers */
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function q(x) { return Q.from(typeof x === 'number' ? U.fix(x) : x); }
  function plain(v) { if (v instanceof Q) return v.toPlain(); if (typeof v === 'number') return U.numStr(U.fix(v)); return String(v); }
  function N(v, o) { var a = { t: 'num', v: plain(v) }; if (o) for (var k in o) a[k] = o[k]; return a; }
  /* a number answer whose canonical form is a decimal (money, measurements): 36.38 rather than 1819/50 */
  function ND(v, o) { var z = q(v); return N(z.isTerminating() ? dd(z) : z.toPlain(), o); }
  /* the answer in the same style as the problem: decimals or fractions */
  function NS(v, dec, o) { return dec ? ND(v, o) : N(v, o); }
  function X(expr, o) { var a = { t: 'expr', v: expr }; if (o) for (var k in o) a[k] = o[k]; return a; }
  /* a number for reading: mixed numbers for fractions bigger than 1, decimals stay decimals */
  function mx(v) { var z = q(v); if (z.isInt()) return z.toString(); return z.abs().gt(1) ? z.toMixedTex() : z.toTex(); }
  function im(v) { return q(v).toTex(); }                       // improper fraction TeX
  function dc(v) { return T.num(U.fix(v)); }                     // a decimal as TeX
  function pd(s) { return /^-/.test(s) ? (/\\frac/.test(s) ? '\\left(' + s + '\\right)' : '(' + s + ')') : s; } // wrap a negative TeX string
  function ftex(z) { return q(z).toTex(); }
  function money(x) { return T.money(U.fix(x)); }
  function moneyPlain(x) { var z = q(x); return z.isInt() ? z.toString() : z.toDec(2); }
  function fixed2(x) { var z = q(x); return z.isInt() ? z.toString() : z.toDec(2); }   // money amounts: 36 or 13.50
  function pct(x) { return T.num(U.fix(x)) + '\\%'; }
  function cmpWord(a, b) { return a > b ? '>' : a < b ? '<' : '='; }
  function ucfirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mcq(correct, wrongs, keep) { var a = U.mc(correct, wrongs, 4); if (keep) a.keep = true; return a; }
  /* choices in a fixed order, with the right one at index i */
  function mcFixed(choices, i) { return { t: 'mc', choices: choices, v: i, keep: true }; }
  function amt(z, one, many) { var v = q(z); return '$' + mx(v) + '$ ' + (v.le(1) ? one : many); }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  /* signed integers in TeX: "(-3)" when negative, for use after an operation sign */
  function sp(n) { return T.p(n); }
  /* a horizontal two-row table (labels are TeX) */
  function rowTable(l1, xs, l2, ys, f) {
    f = f || mx;
    return '$$\\begin{array}{l|' + xs.map(function () { return 'c'; }).join('') + '} ' + l1 + ' & ' + xs.map(function (v) { return f(v); }).join(' & ') +
      ' \\\\ \\hline ' + l2 + ' & ' + ys.map(function (v) { return f(v); }).join(' & ') + ' \\end{array}$$';
  }
  /* a terminating value as a decimal string ("2.5"); whole numbers stay whole */
  function dd(v) { var z = q(v); if (z.isInt()) return z.toString(); return z.toDec(8).replace(/0+$/, '').replace(/\.$/, ''); }
  /* '= 0.35' for terminating values, '\\approx 0.233' otherwise (for steps) */
  function eqDec(v) { var z = q(v); return z.isTerminating() ? ' = ' + dd(z) : ' \\approx ' + z.toDec(3); }
  function isDec(r) { return typeof r === 'string' && r.indexOf('.') >= 0; }
  /* show a value the way its source was written: decimals as decimals, fractions as (mixed) fractions */
  function shower(dec) { return dec ? dd : mx; }
  var NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Elena', 'Femi', 'Grace', 'Hiro', 'Isla', 'Jamal', 'Kai', 'Lena', 'Mateo', 'Nadia', 'Omar',
    'Priya', 'Quinn', 'Rosa', 'Sam', 'Tariq', 'Uma', 'Victor', 'Wen', 'Yara', 'Zoe', 'Luis', 'Maya', 'Noah', 'Aisha', 'Leo'];
  function nm(R) { return R.pick(NAMES); }
  function nms(R, k) { return R.sample(NAMES, k); }
  /* steps for dividing two positive rationals a ÷ b, ending in the value */
  function divSteps(a, b) {
    a = q(a); b = q(b);
    var out = [], res = a.div(b), A = a.isInt() ? a.toString() : a.toTex(), B = b.inv();
    if ((!a.isInt() && a.abs().gt(1)) || (!b.isInt() && b.abs().gt(1))) out.push('Write the mixed numbers as fractions: $' + mx(a) + ' \\div ' + mx(b) + ' = ' + im(a) + ' \\div ' + im(b) + '$.');
    var num = a.n * B.n, den = a.d * B.d;
    var raw = den === 1n ? num.toString() : '\\frac{' + num + '}{' + den + '}';
    out.push('Dividing by $' + im(b) + '$ is the same as multiplying by its reciprocal, $' + im(B) + '$: $' + A + ' \\times ' + im(B) + ' = ' + raw + (raw === im(res) ? '' : ' = ' + im(res)) + (res.isInt() || !res.abs().gt(1) ? '' : ' = ' + mx(res)) + '$.');
    return out;
  }
  /* the decimal expansion of a positive fraction n/d: { int, pre: 'digits', rep: 'digits' } */
  function expand(n, d) {
    n = Number(n); d = Number(d);
    var ip = Math.floor(n / d), r = n % d, digits = '', seen = {}, pos = 0;
    while (r !== 0 && seen[r] === undefined) { seen[r] = pos; r *= 10; digits += Math.floor(r / d); r = r % d; pos++; }
    if (r === 0) return { int: ip, pre: digits, rep: '' };
    return { int: ip, pre: digits.slice(0, seen[r]), rep: digits.slice(seen[r]) };
  }
  function decTex(e) { return e.int + (e.pre || e.rep ? '.' : '') + e.pre + (e.rep ? '\\overline{' + e.rep + '}' : ''); }
  /* the exact value of a decimal written int.pre(rep repeating) */
  function decVal(i, pre, rep) {
    var v = Q.from(String(i) + (pre ? '.' + pre : ''));
    if (rep) { var nine = Q.from('9'.repeat(rep.length)), scale = Q.from(10).pow(pre.length); v = v.add(Q.from(rep).div(nine).div(scale)); }
    return v;
  }
  /* ============================================================ Unit 1: Proportional relationships */

  /* contexts for a rate "A per B" */
  var RATE_CTX = [
    { a: ['mile', 'miles'], b: ['hour', 'hours'], say: function (n, A, B) { return n + ' walks ' + A + ' in ' + B + '.'; }, ask: 'How many miles per hour is that?', per: 'miles per hour', back: 'How many hours does it take to walk 1 mile?', backPer: 'hours per mile' },
    { a: ['mile', 'miles'], b: ['hour', 'hours'], say: function (n, A, B) { return n + ' bikes ' + A + ' in ' + B + ' on a slow, hilly trail.'; }, ask: 'What is the speed in miles per hour?', per: 'miles per hour', back: 'How many hours does each mile take?', backPer: 'hours per mile' },
    { a: ['gallon', 'gallons'], b: ['minute', 'minutes'], say: function (n, A, B) { return 'A hose pours ' + A + ' of water in ' + B + '.'; }, ask: 'How many gallons per minute is that?', per: 'gallons per minute', back: 'How many minutes does it take to pour 1 gallon?', backPer: 'minutes per gallon' },
    { a: ['cup of sugar', 'cups of sugar'], b: ['cup of flour', 'cups of flour'], say: function (n, A, B) { return 'A recipe uses ' + A + ' for every ' + B + '.'; }, ask: 'How many cups of sugar is that for each cup of flour?', per: 'cups of sugar per cup of flour', back: 'How many cups of flour go with each cup of sugar?', backPer: 'cups of flour per cup of sugar' },
    { a: ['square yard', 'square yards'], b: ['hour', 'hours'], say: function (n, A, B) { return n + ' paints ' + A + ' of fence in ' + B + '.'; }, ask: 'How many square yards per hour is that?', per: 'square yards per hour', back: 'How many hours does each square yard take?', backPer: 'hours per square yard' },
    { a: ['foot', 'feet'], b: ['minute', 'minutes'], say: function (n, A, B) { return 'A snail crawls ' + A + ' in ' + B + '.'; }, ask: 'How many feet per minute is that?', per: 'feet per minute', back: 'How many minutes does the snail need for 1 foot?', backPer: 'minutes per foot' }
  ];
  G('g7.unit-rates-fractions', function (R, ctx) {
    var L = lv(ctx);
    var tPool = BL(ctx, ['1/2', '1/3', '1/4'], ['1/2', '1/3', '1/4', '2/3', '3/4', '1/6'], ['2/3', '3/4', '5/6', '3/2', '5/4', '3/8']);
    var rPool = BL(ctx, [2, 3, 4, 6, 8], [2, 3, 4, 5, 6, '3/2', '5/2', '4/3'], ['3/2', '5/2', '4/3', '7/2', '9/4', '5/3', 3, 6]);
    function pickPair() {
      var t, r, d, k = 0;
      do { t = q(R.pick(tPool)); r = q(R.pick(rPool)); d = r.mul(t); k++; } while (k < 30 && (d.isInt() || d.eq(t)));
      return { t: t, r: r, d: d };
    }
    var C = R.pick(RATE_CTX), who = nm(R), P = pickPair();
    if (L === 3 && R.chance(0.35)) {
      // compare two rates: who is faster, and by how much per unit
      var C2 = RATE_CTX[0], ab = nms(R, 2), P2;
      var k2 = 0; do { P2 = pickPair(); k2++; } while (k2 < 30 && P2.r.eq(P.r));
      if (P2.r.eq(P.r)) P2 = { t: q('1/2'), r: P.r.add(1), d: P.r.add(1).mul('1/2') };
      var fast = P.r.gt(P2.r) ? 0 : 1, diff = P.r.sub(P2.r).abs();
      return {
        q: ab[0] + '\'s model boat travels ' + amt(P.d, 'mile', 'miles') + ' in ' + amt(P.t, 'hour', 'hours') + '. ' + ab[1] + '\'s model boat travels ' + amt(P2.d, 'mile', 'miles') + ' in ' + amt(P2.t, 'hour', 'hours') + '. Whose boat is faster, and by how many miles per hour?',
        a: { t: 'multi', parts: [{ label: 'Whose boat is faster?', a: { t: 'mc', choices: [ab[fast], ab[1 - fast]], v: 0 } }, { label: 'How many more miles per hour', a: N(diff) }] },
        steps: [ab[0] + ': ' + 'miles ÷ hours $= ' + mx(P.d) + ' \\div ' + mx(P.t) + ' = ' + mx(P.r) + '$ miles per hour.',
          ab[1] + ': $' + mx(P2.d) + ' \\div ' + mx(P2.t) + ' = ' + mx(P2.r) + '$ miles per hour.',
          ab[fast] + ' is faster by $' + mx(fast === 0 ? P.r : P2.r) + ' - ' + mx(fast === 0 ? P2.r : P.r) + ' = ' + mx(diff) + '$ miles per hour.'],
        hint: 'Find each unit rate (miles for 1 hour) first, then compare.',
        chk: { kind: 'cmp', d1: P.d.toPlain(), t1: P.t.toPlain(), d2: P2.d.toPlain(), t2: P2.t.toPlain() }
      };
    }
    var back = L >= 2 && R.chance(0.3);
    var A = amt(P.d, C.a[0], C.a[1]), B = amt(P.t, C.b[0], C.b[1]);
    var stem = C.say(who, A, B) + ' ';
    if (back) {
      var ans = P.t.div(P.d);
      return {
        q: stem + C.back,
        a: N(ans),
        steps: ['This asks for the amount of ' + C.b[1] + ' for <b>1</b> ' + C.a[0] + ', so divide ' + C.b[1] + ' by ' + C.a[1] + ': $' + mx(P.t) + ' \\div ' + mx(P.d) + '$.'].concat(divSteps(P.t, P.d)).concat(['So it is $' + mx(ans) + '$ ' + C.backPer + '.']),
        hint: 'You want ' + C.b[1] + ' for one ' + C.a[0] + ', so the ' + C.a[1] + ' go in the divisor.',
        chk: { kind: 'rate', top: P.t.toPlain(), bot: P.d.toPlain() }
      };
    }
    return {
      q: stem + C.ask,
      a: N(P.r),
      steps: ['A unit rate is the amount for <b>1</b> ' + C.b[0] + '. Divide ' + C.a[1] + ' by ' + C.b[1] + ': $' + mx(P.d) + ' \\div ' + mx(P.t) + '$.'].concat(divSteps(P.d, P.t)).concat(['So it is $' + mx(P.r) + '$ ' + C.per + '.']),
      hint: 'Divide the ' + C.a[1] + ' by the ' + C.b[1] + ', so the answer is "per 1 ' + C.b[0] + '".',
      chk: { kind: 'rate', top: P.d.toPlain(), bot: P.t.toPlain() }
    };
  });

  /* a proportional (or not) table */
  function propTable(R, ctx) {
    var L = lv(ctx);
    var kr = R.pick(BL(ctx, [2, 3, 4, 5, 6], [2, 3, 4, 5, '1.5', '2.5', '0.5'], ['3/4', '2/3', '1.5', '2.5', '5/2', '0.4', '1.25'])), k = q(kr);
    var n = L === 1 ? 3 : 4, d = Number(k.d);
    var ms = R.sample(range(1, L === 1 ? 6 : 9), n).sort(function (x, y) { return x - y; });
    var xs = ms.map(function (m) { return m * d; });
    var ys = xs.map(function (x) { return k.mul(x); });
    var yes = R.coin(), how = 'prop';
    if (!yes) {
      how = R.pick(L === 1 ? ['add', 'linear', 'off'] : ['add', 'linear', 'off', 'off']);
      if (how === 'add') { var c = R.int(1, 6); ys = xs.map(function (x) { return q(x).add(c); }); }
      else if (how === 'linear') { var c2 = R.int(1, 5); ys = xs.map(function (x) { return k.mul(x).add(c2); }); }
      else { var j = R.int(1, n - 1), off = R.pick([1, 2, -1]); ys = ys.slice(); ys[j] = ys[j].add(off); if (ys[j].le(0)) ys[j] = ys[j].add(3); }
    }
    var ratios = xs.map(function (x, i) { return q(ys[i]).div(x); });
    var same = ratios.every(function (r) { return r.eq(ratios[0]); });
    return { xs: xs, ys: ys, k: k, yes: same, how: how, ratios: ratios, f: shower(isDec(kr)) };
  }
  G('g7.proportional-tables', function (R, ctx) {
    var L = lv(ctx);
    if (L >= 2 && R.chance(0.4)) {
      // which list of pairs is proportional?
      var good, bad = [], tries = 0;
      do { good = propTable(R, ctx); tries++; } while (!good.yes && tries < 50);
      if (!good.yes) { good = { xs: [2, 4, 6], ys: [q(5), q(10), q(15)], k: q('2.5'), yes: true, f: dd }; }
      var kinds = ['add', 'off', 'linear'];
      kinds.forEach(function (kind) {
        var ys = good.xs.map(function (x) { return good.k.mul(x); });
        if (kind === 'add') ys = good.xs.map(function (x) { return q(x).add(good.k.isInt() ? Number(good.k.n) + 1 : 2); });
        else if (kind === 'linear') ys = good.xs.map(function (x) { return good.k.mul(x).add(1); });
        else { ys = ys.slice(); ys[ys.length - 1] = ys[ys.length - 1].add(1); }
        bad.push(ys);
      });
      function pairs(ys) { return good.xs.map(function (x, i) { return '$' + T.pt([x, good.f(ys[i])]) + '$'; }).join(', '); }
      var choices = [pairs(good.ys)].concat(bad.map(pairs));
      return {
        q: 'Each list gives pairs $(x, y)$ from a table. Which list shows $y$ proportional to $x$?',
        a: mcq(choices[0], choices.slice(1)),
        steps: ['In a proportional relationship, $\\frac{y}{x}$ is the same for every pair.',
          'For ' + choices[0] + ': ' + good.xs.map(function (x, i) { return '$\\frac{' + good.f(good.ys[i]) + '}{' + x + '} = ' + good.f(good.k) + '$'; }).join(', ') + '. Always $' + good.f(good.k) + '$.',
          'In each other list, $\\frac{y}{x}$ changes from pair to pair, so those are not proportional.'],
        hint: 'Divide $y$ by $x$ in each pair. Which list gives the same quotient every time?',
        chk: { kind: 'mcprop', xs: good.xs, ys: good.ys.map(function (y) { return y.toPlain(); }) }
      };
    }
    var t = propTable(R, ctx);
    var ctxs = [['x', 'y'], ['x', 'y'], ['\\text{Hours}', '\\text{Pay (dollars)}'], ['\\text{Tickets}', '\\text{Cost (dollars)}'], ['\\text{Cups of flour}', '\\text{Muffins}'], ['\\text{Minutes}', '\\text{Pages read}']];
    var cx = L === 1 ? ctxs[0] : R.pick(ctxs);
    var ratioList = t.xs.map(function (x, i) { var r = t.ratios[i]; return '$\\frac{' + t.f(t.ys[i]) + '}{' + x + '} = ' + (r.isTerminating() ? t.f(r) : mx(r)) + '$'; }).join(', ');
    var steps = ['Divide each $y$-value by its $x$-value: ' + ratioList + '.'];
    if (t.yes) steps.push('Every quotient is $' + t.f(t.k) + '$, so the table is proportional: $y = ' + t.f(t.k) + 'x$ in every column.');
    else {
      steps.push('The quotients are not all equal, so the table is <b>not</b> proportional.');
      if (t.how === 'add') steps.push('Here each $y$ is $x$ plus the same number. Adding a fixed amount is not the same as multiplying by a fixed amount.');
      if (t.how === 'linear') steps.push('The values go up steadily, but steady growth is not enough: the line would not pass through $(0, 0)$.');
    }
    return {
      q: 'True or false: this table shows a proportional relationship.' + rowTable(cx[0], t.xs, cx[1], t.ys, t.f),
      a: { t: 'tf', v: t.yes },
      steps: steps,
      hint: 'Find $\\frac{y}{x}$ for every column. Proportional means the quotient never changes.',
      chk: { kind: 'tf', xs: t.xs, ys: t.ys.map(function (y) { return q(y).toPlain(); }) }
    };
  });

  var GRAPH_CHOICES = ['Yes: it is a straight line through the origin, $(0, 0)$.', 'No: it does not pass through the origin.', 'No: it is not a straight line.'];
  G('g7.proportional-graphs', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['viz', 'text', 'origin'], BL(ctx, [6, 2, 1], [6, 3, 1], [6, 3, 0]));
    var labs = R.pick([['hours', 'miles'], ['tickets', 'cost (\\$)'], ['minutes', 'pages'], ['pounds', 'cost (\\$)'], ['x', 'y']]);
    if (shape === 'origin') {
      var ch = ['$(0, 0)$', '$(1, 1)$', '$(0, 1)$', '$(1, 0)$'];
      return {
        q: 'Every graph of a proportional relationship $y = kx$ passes through which point?',
        a: mcq(ch[0], ch.slice(1)),
        steps: ['Put $x = 0$ into $y = kx$: $y = k \\cdot 0 = 0$.', 'So $(0, 0)$ is always on the graph: zero of one quantity goes with zero of the other.'],
        hint: 'What is $y$ when $x = 0$ in $y = kx$?',
        chk: { kind: 'none' }
      };
    }
    var kind = R.pick(['prop', 'prop', 'offset', 'curve', 'dots', 'dotsOff']);
    var k = q(R.pick([1, 2, 3, '1/2', '3/2', '5/2', 4])), b = R.pick([1, 2, 3, 4, 5]);
    var xm = 8, ym, opts, desc;
    function f(x) { return kind === 'offset' || kind === 'dotsOff' ? k.mul(x).add(b).toNumber() : kind === 'curve' ? x * x / 4 : k.mul(x).toNumber(); }
    ym = Math.max(8, Math.ceil(f(xm) / 4) * 4);
    var ystep = ym <= 12 ? 1 : ym <= 24 ? 2 : ym <= 40 ? 4 : 5;
    opts = { xmax: xm, ymax: ym, xstep: 1, ystep: ystep, xlabel: labs[0], ylabel: labs[1].replace('\\$', '$') };
    if (kind === 'dots' || kind === 'dotsOff') opts.dots = range(1, 6).map(function (x) { return [x, U.fix(f(x))]; });
    else if (kind === 'curve') { opts.curve = []; for (var x = 0; x <= xm + 1e-9; x += 0.25) opts.curve.push([x, U.fix(x * x / 4)]); }
    else opts.lines = [[0, U.fix(f(0)), xm, U.fix(f(xm))]];
    var right = kind === 'prop' || kind === 'dots' ? 0 : kind === 'curve' ? 2 : 1;
    var why = right === 0 ? (kind === 'dots' ? 'The points line up on a straight line, and that line runs back to $(0, 0)$.' : 'The graph is a straight line and it starts at $(0, 0)$.')
      : right === 1 ? 'The graph is straight, but at $x = 0$ it is at $y = ' + b + '$, not $0$. It misses the origin.'
        : 'The graph starts at $(0, 0)$, but it curves: $y$ grows faster and faster, so $\\frac{y}{x}$ keeps changing.';
    if (shape === 'text') {
      var p1, p2;
      if (right === 0) { p1 = [0, 0]; p2 = [2, k.mul(2)]; desc = 'A straight-line graph passes through $(0, 0)$ and $' + T.pt([2, mx(k.mul(2))]) + '$.'; }
      else if (right === 1) { desc = 'A straight-line graph passes through $' + T.pt([0, b]) + '$ and $' + T.pt([2, mx(k.mul(2).add(b))]) + '$.'; }
      else { desc = 'A graph passes through $(0, 0)$, $(2, 1)$, $(4, 4)$ and $(6, 9)$.'; }
      return {
        q: desc + ' Does it show a proportional relationship?',
        a: mcFixed(GRAPH_CHOICES, right),
        steps: [right === 2 ? 'Check $\\frac{y}{x}$: $\\frac{1}{2}$, $\\frac{4}{4} = 1$, $\\frac{9}{6} = 1.5$. The ratio changes, so the points are not on one straight line through the origin.' : why,
          right === 0 ? 'A straight line through the origin means $y = kx$: proportional.' : 'A proportional graph must be a straight line <b>and</b> pass through $(0, 0)$, so this one is not proportional.'],
        hint: 'Check two things: is it straight, and does it go through $(0, 0)$?',
        chk: { kind: 'graph', right: right }
      };
    }
    return {
      q: nm(R) + ' graphed ' + labs[1].replace(' (\\$)', '').replace(/^y$/, '$y$') + ' against ' + labs[0].replace(/^x$/, '$x$') + '. Does this graph show a proportional relationship?',
      viz: { name: 'g7-plot', opts: opts, label: 'A graph with ' + labs[0] + ' across and ' + labs[1].replace('\\$', 'dollars') + ' up.' },
      a: mcFixed(GRAPH_CHOICES, right),
      steps: [why, right === 0 ? 'Straight and through the origin: the graph is proportional.' : 'A proportional graph must be a straight line <b>and</b> pass through $(0, 0)$, so this one is not proportional.'],
      hint: 'Check two things: is it straight, and does it go through $(0, 0)$?',
      chk: { kind: 'graph', right: right }
    };
  });

  G('g7.constant-of-proportionality', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['table', 'story', 'point', 'eq'], BL(ctx, [3, 3, 2, 1], [3, 4, 2, 0], [3, 4, 2, 0]));
    var kr = R.pick(BL(ctx, [2, 3, 4, 5, 6, 7, 8], ['1.5', '2.5', '0.5', '4.5', 3, 6, '0.75'], ['3/4', '2/3', '5/4', '1.2', '3.5', '0.4', '2.25'])), k = q(kr), f = shower(isDec(kr));
    var d = Number(k.d);
    if (shape === 'table') {
      var ms = R.sample(range(1, 7), 3).sort(function (a, b) { return a - b; }), xs = ms.map(function (m) { return m * d; }), ys = xs.map(function (x) { return k.mul(x); });
      return {
        q: '$y$ is proportional to $x$. Find the constant of proportionality $k$.' + rowTable('x', xs, 'y', ys, f),
        a: NS(k, f === dd),
        steps: ['The constant of proportionality is $k = \\frac{y}{x}$, the same in every column.', 'Use the first column: $\\frac{' + f(ys[0]) + '}{' + xs[0] + '} = ' + f(k) + '$.', 'Check another column: $\\frac{' + f(ys[2]) + '}{' + xs[2] + '} = ' + f(k) + '$. So $k = ' + f(k) + '$.'],
        hint: 'Divide a $y$-value by its $x$-value.',
        chk: { kind: 'ratio', y: ys[0].toPlain(), x: xs[0] }
      };
    }
    if (shape === 'point') {
      var x0 = d * R.int(2, 6), y0 = k.mul(x0);
      return {
        q: 'The graph of a proportional relationship is a line through the origin and the point $' + T.pt([x0, f(y0)]) + '$. What is the constant of proportionality?',
        a: NS(k, f === dd),
        steps: ['On the graph of $y = kx$, every point has $\\frac{y}{x} = k$.', '$k = \\frac{' + f(y0) + '}{' + x0 + '} = ' + f(k) + '$.'],
        hint: 'Use $k = \\frac{y}{x}$ with the point you know.',
        chk: { kind: 'ratio', y: y0.toPlain(), x: x0 }
      };
    }
    if (shape === 'eq') {
      return {
        q: 'Shirts cost $c = ' + f(k) + 'n$ dollars for $n$ shirts. What is the constant of proportionality?',
        a: NS(k, f === dd),
        steps: ['An equation $y = kx$ shows $k$ as the number multiplying $x$.', 'Here $c = ' + f(k) + 'n$, so $k = ' + f(k) + '$: each shirt costs ' + money(k) + '.'],
        hint: 'Look at the number multiplying $n$.',
        chk: { kind: 'val', v: k.toPlain() }
      };
    }
    var S = R.pick([
      { u: 'dollars per pound', make: function (n, x, y) { return n + ' pays ' + money(y) + ' for $' + mx(x) + '$ pounds of apples.'; }, x: 'pounds', y: 'dollars', money: true },
      { u: 'miles per gallon', make: function (n, x, y) { return 'A car goes $' + mx(y) + '$ miles on $' + mx(x) + '$ gallons of gas.'; }, x: 'gallons', y: 'miles', whole: true },
      { u: 'pages per minute', make: function (n, x, y) { return n + ' reads $' + mx(y) + '$ pages in $' + mx(x) + '$ minutes.'; }, x: 'minutes', y: 'pages', whole: true },
      { u: 'cups of water per cup of rice', make: function (n, x, y) { return 'A rice recipe uses $' + mx(y) + '$ cups of water for $' + mx(x) + '$ cups of rice.'; }, x: 'cups of rice', y: 'cups of water' },
      { u: 'dollars per hour', make: function (n, x, y) { return n + ' earns ' + money(y) + ' for $' + mx(x) + '$ hours of work.'; }, x: 'hours', y: 'dollars', money: true }
    ]);
    if (S.money && !k.mul(100).isInt()) { kr = R.pick(['1.25', '2.5', '0.75', '3.5']); k = q(kr); d = Number(k.d); f = dd; }
    if (S.u === 'miles per gallon') { kr = R.pick([24, 28, 30, 32, 35, '22.5']); k = q(kr); d = Number(k.d); f = shower(isDec(kr)); }
    if (S.u === 'pages per minute' && !k.mul(4).isInt()) { kr = R.pick(['1.5', '2.5', '0.75', 2]); k = q(kr); d = Number(k.d); f = shower(isDec(kr)); }
    if (S.money) f = dd;
    var xx = L === 3 && !S.money && !S.whole ? q(R.pick(['1/2', '3/4', '3/2', '5/2'])) : q(d * R.int(2, 6)), yy = k.mul(xx);
    if (S.money && S.u === 'dollars per hour') { k = q(R.pick([12, 15, '12.5', 14, 16, '15.5', 18])); f = dd; xx = q(2 * R.int(2, 8)); yy = k.mul(xx); }
    return {
      q: S.make(nm(R), xx, yy) + ' Find the constant of proportionality in ' + S.u + '.',
      a: NS(k, S.money || f === dd),
      steps: ['The constant of proportionality is the unit rate: ' + S.y + ' for 1 of the ' + S.x + '.', '$k = ' + (S.money ? '\\frac{' + fixed2(yy) + '}{' + mx(xx) + '}' : '\\frac{' + im(yy) + '}{' + im(xx) + '}') + ' = ' + (S.money ? dd(k) : f(k)) + '$ ' + S.u + '.'],
      hint: 'Divide ' + S.y + ' by ' + S.x + '.',
      chk: { kind: 'ratio', y: yy.toPlain(), x: xx.toPlain() }
    };
  });

  G('g7.proportional-equations', function (R, ctx) {
    var L = lv(ctx);
    var kr = R.pick(BL(ctx, [2, 3, 4, 5, 6, 8, 12], ['1.5', '2.5', '0.5', 7, 9, '0.25', 15], ['3/4', '2/3', '5/2', '1.25', '0.8', '4/3'])), k = q(kr), f = shower(isDec(kr));
    var d = Number(k.d), kp = isDec(kr) ? kr : k.isInt() ? k.toString() : '(' + k.toPlain() + ')';
    if (R.chance(0.45)) {
      var ms = R.sample(range(1, 6), 3).sort(function (a, b) { return a - b; }), xs = ms.map(function (m) { return m * d; }), ys = xs.map(function (x) { return k.mul(x); });
      return {
        q: '$y$ is proportional to $x$. Write an equation $y = kx$ for this table.' + rowTable('x', xs, 'y', ys, f),
        a: { t: 'eq', v: 'y = ' + kp + '*x', form: 'solved' },
        steps: ['Find $k = \\frac{y}{x}$, the $y$-value divided by the $x$-value: $\\frac{' + f(ys[0]) + '}{' + xs[0] + '} = ' + f(k) + '$.', 'Check another column: $' + f(k) + ' \\times ' + xs[1] + ' = ' + f(ys[1]) + '$ ✓.', 'The equation is $y = ' + f(k) + 'x$.'],
        hint: 'Divide $y$ by $x$ (not $x$ by $y$) to find $k$.',
        chk: { kind: 'eq', xs: xs, ys: ys.map(function (y) { return y.toPlain(); }) }
      };
    }
    var S = R.pick([
      { v: ['c', 'n'], t: function (x, y) { return '$' + mx(x) + '$ movie tickets cost ' + money(y) + '.'; }, l: 'the cost in dollars and $n$ the number of tickets', money: true, what: 'tickets', ks: [8, 9, 11, '7.5', '8.5', '12.5'] },
      { v: ['d', 't'], t: function (x, y) { return 'A train travels $' + f(y) + '$ miles in $' + mx(x) + '$ hours at a steady speed.'; }, l: 'the distance in miles and $t$ the time in hours', what: 'hours', ks: [45, 55, 60, 75, '62.5', '52.5'] },
      { v: ['w', 'h'], t: function (x, y) { return 'A worker earns ' + money(y) + ' for $' + mx(x) + '$ hours.'; }, l: 'the pay in dollars and $h$ the hours worked', money: true, what: 'hours', ks: [12, 14, 15, 16, 18, '12.5', '15.5'] },
      { v: ['m', 'g'], t: function (x, y) { return 'A recipe uses $' + mx(y) + '$ cups of milk for $' + mx(x) + '$ cups of grits.'; }, l: 'the cups of milk and $g$ the cups of grits', what: 'cups of grits', frac: true }
    ]);
    if (S.ks) { kr = R.pick(S.ks); k = q(kr); kp = String(kr); f = dd; d = Number(k.d); }
    var x0 = q(L === 3 && S.frac ? R.pick(['1/2', '3/2', '3/4', '5/2']) : d * R.int(2, 5)), y0 = k.mul(x0);
    var yShow = S.money ? fixed2(y0) : S.frac ? mx(y0) : f(y0);
    return {
      q: S.t(x0, y0) + ' Let $' + S.v[0] + '$ be ' + S.l + '. Write an equation for $' + S.v[0] + '$ in terms of $' + S.v[1] + '$.',
      a: { t: 'eq', v: S.v[0] + ' = ' + kp + '*' + S.v[1], form: 'solved' },
      steps: ['The constant of proportionality is the amount for 1: $k = \\frac{' + yShow + '}{' + mx(x0) + '} = ' + (S.frac ? mx(k) : f(k)) + '$.', 'Multiply the number of ' + S.what + ' by $k$: $' + S.v[0] + ' = ' + (S.frac ? mx(k) : f(k)) + S.v[1] + '$.', 'Check with the story: $' + (S.frac ? mx(k) : f(k)) + ' \\times ' + mx(x0) + ' = ' + yShow + '$ ✓.'],
      hint: 'Find $k$ by dividing $' + S.v[0] + '$ by $' + S.v[1] + '$ for the numbers in the story.',
      chk: { kind: 'eq2', x: x0.toPlain(), y: y0.toPlain(), vars: S.v }
    };
  });

  var POINT_CTX = [
    { xs: 'hours', ys: 'dollars', sent: function (n, a, b) { return n + ' earns ' + money(b) + ' for ' + dd(a) + ' ' + (q(a).eq(1) ? 'hour' : 'hours') + ' of work'; }, money: true, rate: function (k) { return money(k) + ' per hour'; }, ks: ['12', '15', '12.5', '14', '16', '17.5', '20'] },
    { xs: 'gallons', ys: 'miles', sent: function (n, a, b) { return 'the car goes ' + dd(b) + ' miles on ' + dd(a) + ' ' + (q(a).eq(1) ? 'gallon' : 'gallons') + ' of gas'; }, rate: function (k) { return dd(k) + ' miles per gallon'; }, ks: [20, 25, 30, 35, 40] },
    { xs: 'minutes', ys: 'pages', sent: function (n, a, b) { return n + ' reads ' + dd(b) + ' pages in ' + dd(a) + ' ' + (q(a).eq(1) ? 'minute' : 'minutes'); }, rate: function (k) { return dd(k) + ' pages per minute'; }, ks: [2, 3, 4, '1.5', '2.5'] },
    { xs: 'pounds', ys: 'dollars', sent: function (n, a, b) { return dd(a) + ' ' + (q(a).eq(1) ? 'pound' : 'pounds') + ' of grapes cost ' + money(b); }, money: true, rate: function (k) { return money(k) + ' per pound'; }, ks: ['2.5', '3', '4', '1.5', '6', '3.5'] }
  ];
  G('g7.proportional-points', function (R, ctx) {
    var C = R.pick(POINT_CTX), who = nm(R), k = q(R.pick(C.ks));
    var x0 = R.int(2, 6), y0 = k.mul(x0), Y0 = U.fix(y0.toNumber());
    var ym = k.mul(8).toNumber(), step = ym <= 16 ? 2 : ym <= 40 ? 5 : ym <= 80 ? 10 : ym <= 200 ? 25 : 50;
    ym = Math.ceil(ym / step) * step;
    var viz = { name: 'g7-plot', opts: { xmax: 8, ymax: ym, xstep: 1, ystep: step, xlabel: C.xs, ylabel: C.ys, lines: [[0, 0, 8, U.fix(k.mul(8).toNumber())]], dots: [[x0, Y0]], labels: [{ x: x0, y: Y0, text: '(' + x0 + ', ' + U.numStr(Y0) + ')' }] }, label: 'A line through the origin with ' + C.xs + ' across and ' + C.ys + ' up, through the point (' + x0 + ', ' + U.numStr(Y0) + ').' };
    var shape = R.pickW(['meaning', 'unit', 'origin', 'predict'], BL(ctx, [4, 3, 2, 0], [3, 3, 1, 3], [2, 3, 1, 4]));
    var ptTex = '$' + T.pt([x0, dd(y0)]) + '$';
    if (shape === 'meaning') {
      var ch = [ucfirst(C.sent(who, x0, y0)) + '.', ucfirst(C.sent(who, y0, x0)) + '.', 'The rate is ' + C.rate(q(x0)) + '.', 'The rate is ' + C.rate(y0) + '.'];
      return {
        q: 'The graph shows ' + C.ys + ' (up) against ' + C.xs + ' (across) for a proportional relationship. What does the point ' + ptTex + ' mean?', viz: viz,
        a: mcq(ch[0], ch.slice(1)),
        steps: ['A point $(x, y)$ pairs an $x$-value with its $y$-value. Here $x$ is ' + C.xs + ' and $y$ is ' + C.ys + '.', 'So ' + ptTex + ' means ' + C.sent(who, x0, y0) + '.', 'It is not the unit rate. The unit rate is the $y$-value when $x = 1$: ' + C.rate(k) + '.'],
        hint: 'Read the first number as ' + C.xs + ' and the second as ' + C.ys + '.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'origin') {
      var ch2 = ['0 ' + C.xs + ' go with 0 ' + C.ys + '.', 'The rate is 0 ' + C.ys + ' per ' + C.xs.replace(/s$/, '') + '.', 'The relationship has not started yet, so the point has no meaning.', 'It is the unit rate.'];
      return {
        q: 'The graph shows ' + C.ys + ' against ' + C.xs + ' for a proportional relationship. What does the point $(0, 0)$ mean in this situation?', viz: viz,
        a: mcq(ch2[0], ch2.slice(1)),
        steps: ['$(0, 0)$ pairs $x = 0$ with $y = 0$.', 'In words: 0 ' + C.xs + ' go with 0 ' + C.ys + '. Every proportional graph includes this point.'],
        hint: 'Read $(0, 0)$ the same way as any point: $x$ first, then $y$.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'unit') {
      return {
        q: 'The graph of a proportional relationship goes through the origin and ' + ptTex + ', with ' + C.xs + ' across and ' + C.ys + ' up. The point $(1, r)$ is also on the line. What is $r$, the unit rate?', viz: viz,
        a: ND(k),
        steps: ['Proportional means $\\frac{y}{x}$ is the same for every point.', '$\\frac{' + dd(y0) + '}{' + x0 + '} = ' + dd(k) + '$, so at $x = 1$ the $y$-value is $' + dd(k) + '$.', 'The point $' + T.pt([1, dd(k)]) + '$ shows the unit rate: ' + C.rate(k) + '.'],
        hint: 'Divide the $y$-value of the point by its $x$-value.',
        chk: { kind: 'ratio', y: y0.toPlain(), x: x0 }
      };
    }
    var x1 = R.intNot(2, 12, [x0]);
    return {
      q: 'A proportional graph, with ' + C.xs + ' across and ' + C.ys + ' up, passes through ' + ptTex + '. What $y$-value goes with $x = ' + x1 + '$?', viz: viz,
      a: ND(k.mul(x1)),
      steps: ['Find the unit rate from the point: $k = \\frac{' + dd(y0) + '}{' + x0 + '} = ' + dd(k) + '$.', 'Use $y = kx$: $y = ' + dd(k) + ' \\times ' + x1 + ' = ' + dd(k.mul(x1)) + '$.'],
      hint: 'First find the $y$-value for $x = 1$.',
      chk: { kind: 'scale', y: y0.toPlain(), x: x0, x1: x1 }
    };
  });

  G('g7.solve-proportions', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['pure', 'word', 'setup'], BL(ctx, [4, 4, 0], [3, 5, 2], [2, 5, 2]));
    if (shape === 'pure') {
      var mr = R.pick(BL(ctx, [2, 3, 4, 5], [2, 3, 4, '1.5', '2.5', 6], ['1.5', '2.5', '0.5', '4/3', '3/4'])), m = q(mr), f = shower(isDec(mr));
      var b = R.int(2, 9), a = R.intNot(1, 3 * b, b), dv = m.mul(b), ans = m.mul(a);
      var t2 = 0; while (!dv.isInt() && t2++ < 4) { b = b * 2; a = a * 2; dv = m.mul(b); ans = m.mul(a); }
      var g = U.gcd(a, b); if (g > 1 && R.coin()) { /* keep the ratio unsimplified sometimes; that is fine */ }
      var top = R.coin();
      var eqTex = top ? '\\frac{' + a + '}{' + b + '} = \\frac{x}{' + mx(dv) + '}' : '\\frac{' + b + '}{' + a + '} = \\frac{' + mx(dv) + '}{x}';
      return {
        q: 'Solve the proportion: $' + eqTex + '$',
        a: NS(ans, f === dd),
        steps: top ? ['Multiply both sides by $' + mx(dv) + '$ to get $x$ alone: $x = \\frac{' + a + '}{' + b + '} \\times ' + mx(dv) + '$.', '$x = \\frac{' + a + ' \\times ' + mx(dv) + '}{' + b + '} = \\frac{' + mx(q(a).mul(dv)) + '}{' + b + '} = ' + f(ans) + '$.', 'Check: $\\frac{' + f(ans) + '}{' + mx(dv) + '}$ is the same ratio as $\\frac{' + a + '}{' + b + '}$ ✓.']
          : ['Cross products of equal ratios are equal: $' + b + 'x = ' + a + ' \\times ' + mx(dv) + ' = ' + mx(q(a).mul(dv)) + '$.', 'Divide both sides by $' + b + '$: $x = ' + f(ans) + '$.', 'Check: $\\frac{' + b + '}{' + a + '}$ and $\\frac{' + mx(dv) + '}{' + f(ans) + '}$ are the same ratio ✓.'],
        hint: 'Find what the known denominator was multiplied by, or use cross products.',
        chk: { kind: 'prop', a: a, b: b, d: dv.toPlain(), top: top }
      };
    }
    var W = R.pick([
      { u1: 'pens', one: 'pen', u2: 'dollars', make: function (a, b, c) { return '$' + a + '$ pens cost ' + money(b) + '. At the same price, how much do $' + c + '$ pens cost, in dollars?'; }, money: true, units: ['0.75', '1.25', '1.5', '2.5', '0.6', '3'] },
      { u1: 'gallons', one: 'gallon', u2: 'miles', make: function (a, b, c) { return 'A car goes $' + dd(b) + '$ miles on $' + a + '$ gallons of gas. How far can it go on $' + c + '$ gallons, in miles?'; } },
      { u1: 'cups of flour', one: 'cup of flour', u2: 'cookies', make: function (a, b, c) { return 'A recipe makes $' + dd(b) + '$ cookies with $' + a + '$ cups of flour. How many cookies can you make with $' + c + '$ cups of flour?'; } },
      { u1: 'hours', one: 'hour', u2: 'dollars', make: function (a, b, c) { return 'A babysitter earns ' + money(b) + ' for $' + a + '$ hours. At the same rate, how much is earned in $' + c + '$ hours, in dollars?'; }, money: true, units: ['12', '12.5', '14', '15', '9.5', '16'] },
      { u1: 'laps', one: 'lap', u2: 'minutes', make: function (a, b, c) { return 'A swimmer swims $' + a + '$ laps in $' + dd(b) + '$ minutes at a steady pace. How many minutes do $' + c + '$ laps take?'; } }
    ]);
    var a1 = R.int(2, 8), unit = q(W.units ? R.pick(W.units) : R.pick([3, 4, 5, 6, 8, 12, 15, 24, '1.5', '2.5'])), b1, c1, ans2;
    b1 = unit.mul(a1); if (!W.money && !b1.isInt()) { a1 = a1 * 2; b1 = unit.mul(a1); }
    c1 = R.intNot(2, 15, a1); ans2 = unit.mul(c1);
    if (!W.money && !ans2.isInt()) { c1 = c1 + 1 === a1 ? c1 + 3 : c1 + 1; ans2 = unit.mul(c1); }
    var bS = W.money ? fixed2(b1) : dd(b1), aS = W.money ? fixed2(ans2) : dd(ans2);
    if (shape === 'setup') {
      var good = '$\\frac{' + a1 + '}{' + bS + '} = \\frac{' + c1 + '}{x}$', bad1 = '$\\frac{' + a1 + '}{' + bS + '} = \\frac{x}{' + c1 + '}$', bad2 = '$\\frac{' + bS + '}{' + a1 + '} = \\frac{' + c1 + '}{x}$', alt = '$\\frac{' + a1 + '}{' + c1 + '} = \\frac{x}{' + bS + '}$';
      return {
        q: W.make(a1, b1, c1).replace(/\s+(How|At the same)[\s\S]*$/, '') + ' Let $x$ be the number of ' + W.u2 + ' for $' + c1 + '$ ' + W.u1 + '. Which proportion is set up correctly?',
        a: mcq(good, [bad1, bad2, alt]),
        steps: ['Keep the units in the same places on both sides: ' + W.u1 + ' over ' + W.u2 + ' equals ' + W.u1 + ' over ' + W.u2 + '.', 'That gives ' + good + '.', 'The other choices mix up the units: they compare ' + W.u1 + ' to ' + W.u2 + ' on one side but not in the same order on the other.'],
        hint: 'Write the units next to each number. Both ratios must compare the same units in the same order.',
        chk: { kind: 'setup', a: a1, b: b1.toPlain(), c: c1 }
      };
    }
    return {
      q: W.make(a1, b1, c1),
      a: ND(ans2),
      steps: ['Find the unit rate: $' + bS + ' \\div ' + a1 + ' = ' + dd(unit) + '$ ' + W.u2 + ' per ' + W.one + '.', 'Multiply by the new amount: $' + dd(unit) + ' \\times ' + c1 + ' = ' + aS + '$.', 'Or set up equal ratios, $\\frac{' + a1 + '}{' + bS + '} = \\frac{' + c1 + '}{x}$, and get the same answer: $' + aS + '$.'],
      hint: 'Find the amount for 1 first, then scale up.',
      chk: { kind: 'unitprice', a: a1, b: b1.toPlain(), c: c1 }
    };
  });
  /* ============================================================ Unit 2: Percent problems */

  /* a whole-number original o and a percent p so that p% of o is a whole number */
  function pctPair(R, ps, lo, hi) {
    for (var t = 0; t < 60; t++) {
      var p = R.pick(ps), step = 100 / U.gcd(p, 100), o = step * R.int(Math.max(1, Math.ceil(lo / step)), Math.max(1, Math.floor(hi / step)));
      if (o >= lo && o <= hi) return { p: p, o: o };
    }
    return { p: 25, o: 80 };
  }
  var CHANGE_CTX = [
    { s: function (o, n) { return 'The price of a jacket changed from ' + money(o) + ' to ' + money(n) + '.'; }, inc: true, dec: true, money: true },
    { s: function (o, n) { return 'A chess club had $' + o + '$ members last year and has $' + n + '$ members this year.'; }, inc: true, dec: true },
    { s: function (o, n) { return 'A sunflower grew from $' + o + '$ cm to $' + n + '$ cm tall.'; }, inc: true },
    { s: function (o, n) { return 'A school sold $' + o + '$ raffle tickets last year and $' + n + '$ this year.'; }, inc: true, dec: true },
    { s: function (o, n) { return 'A phone\'s battery charge went from $' + o + '$ minutes of talk time to $' + n + '$ minutes.'; }, dec: true },
    { s: function (o, n) { return 'A town\'s population changed from $' + T.commas(o) + '$ to $' + T.commas(n) + '$.'; }, inc: true, dec: true, big: true }
  ];
  G('g7.percent-change', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['find', 'both', 'new', 'orig'], BL(ctx, [1, 0, 0, 0], [3, 2, 2, 0], [2, 2, 2, 2]));
    var inc = R.coin(), C;
    do { C = R.pick(CHANGE_CTX); } while (!(inc ? C.inc : C.dec) || (C.big && (shape === 'new' || shape === 'orig')));
    var plist = BL(ctx, [10, 20, 25, 50, 30, 40], [5, 10, 15, 20, 25, 30, 40, 60, 75], [5, 12, 15, 35, 45, 60, 80, 125]).filter(function (v) { return inc || v < 100; });
    var pp = pctPair(R, plist, C.big ? 1000 : 20, C.big ? 9000 : BL(ctx, 200, 400, 600));
    var p = pp.p, o = pp.o, ch = o * p / 100, n = inc ? o + ch : o - ch;
    if (C.big) { o = o * 10; ch = ch * 10; n = n * 10; }
    var word = inc ? 'increase' : 'decrease';
    var why = 'Percent change compares the change with the <b>original</b> amount (the amount before the change), so divide by $' + T.commas(o) + '$, not by $' + T.commas(n) + '$.';
    if (shape === 'new') {
      var thing = C.money ? 'The price of a jacket was ' + money(o) + '. It ' + (inc ? 'went up' : 'went down') + ' by $' + p + '\\%$. What is the new price, in dollars?'
        : 'A club had $' + o + '$ members. Membership ' + (inc ? 'grew' : 'fell') + ' by $' + p + '\\%$. How many members does it have now?';
      return {
        q: thing,
        a: ND(n),
        steps: ['Find the change: $' + p + '\\%$ of $' + o + '$ is $' + dd(q(p).div(100)) + ' \\times ' + o + ' = ' + dd(ch) + '$.', (inc ? 'Add' : 'Subtract') + ' it: $' + o + (inc ? ' + ' : ' - ') + dd(ch) + ' = ' + dd(n) + '$.', 'In one step: $' + o + ' \\times ' + dd(q(100 + (inc ? p : -p)).div(100)) + ' = ' + dd(n) + '$, because the new amount is $' + (inc ? 100 + p : 100 - p) + '\\%$ of the original.'],
        hint: 'Find ' + p + '% of the original, then ' + (inc ? 'add it on.' : 'take it away.'),
        chk: { kind: 'newamt', o: o, p: p, inc: inc }
      };
    }
    if (shape === 'orig') {
      var item = R.pick(['a bike', 'a skateboard', 'a pair of shoes', 'a tablet']);
      return {
        q: 'After a $' + p + '\\%$ ' + word + ', the price of ' + item + ' is ' + money(n) + '. What was the price before the ' + word + ', in dollars?',
        a: N(o),
        steps: ['The new price is $' + (inc ? 100 + p : 100 - p) + '\\%$ of the original price $x$: $' + dd(q(100 + (inc ? p : -p)).div(100)) + 'x = ' + dd(n) + '$.', 'Divide both sides by $' + dd(q(100 + (inc ? p : -p)).div(100)) + '$: $x = ' + dd(n) + ' \\div ' + dd(q(100 + (inc ? p : -p)).div(100)) + ' = ' + o + '$.', 'Check: $' + p + '\\%$ of $' + o + '$ is $' + dd(ch) + '$, and $' + o + (inc ? ' + ' : ' - ') + dd(ch) + ' = ' + dd(n) + '$ ✓.'],
        hint: 'The new price is ' + (inc ? 100 + p : 100 - p) + '% of the original. Write an equation for the original.',
        chk: { kind: 'orig', n: n, p: p, inc: inc }
      };
    }
    var stem = C.s(o, n);
    var steps = ['The change is $' + T.commas(n) + ' - ' + T.commas(o) + ' = ' + (inc ? '' : '-') + T.commas(ch) + '$, ' + (inc ? 'an increase' : 'a decrease') + ' of $' + T.commas(ch) + '$.', why, '$\\frac{' + T.commas(ch) + '}{' + T.commas(o) + '} = ' + dd(q(p).div(100)) + ' = ' + p + '\\%$.'];
    if (shape === 'both') {
      return {
        q: stem + ' Is this an increase or a decrease, and by what percent?',
        a: { t: 'multi', parts: [{ label: 'Increase or decrease?', a: { t: 'mc', choices: ['increase', 'decrease'], v: inc ? 0 : 1, keep: true } }, { label: 'Percent change', a: N(p, { pct: true }) }] },
        steps: steps,
        hint: 'Find the change first, then divide it by the original amount.',
        chk: { kind: 'pchange', o: o, n: n }
      };
    }
    return {
      q: stem + ' Find the percent ' + word + '.',
      a: N(p, { pct: true }),
      steps: steps,
      hint: 'Divide the change by the original amount (the "before" number).',
      chk: { kind: 'pchange', o: o, n: n }
    };
  });

  G('g7.markup-discount-tax', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['discount', 'tax', 'tip', 'markup', 'two', 'single', 'disctax', 'reverse'], BL(ctx, [3, 3, 2, 2, 0, 0, 0, 0], [2, 2, 2, 2, 3, 0, 1, 0], [1, 1, 1, 1, 2, 2, 2, 2]));
    var item = R.pick(['a backpack', 'a pair of headphones', 'a jacket', 'a board game', 'a lamp', 'a pair of sneakers', 'a guitar strap']);
    var price, a, b, ans, steps, qs, hint, chk;
    if (shape === 'discount') {
      a = R.pick([10, 15, 20, 25, 30, 40, 50]); price = 5 * R.int(4, 24); ans = q(price).mul(100 - a).div(100);
      qs = item.charAt(0).toUpperCase() + item.slice(1) + ' costs ' + money(price) + '. It is on sale for $' + a + '\\%$ off. What is the sale price, in dollars?';
      steps = ['The discount is $' + a + '\\%$ of ' + money(price) + ': $' + dd(q(a).div(100)) + ' \\times ' + price + ' = ' + fixed2(q(price).mul(a).div(100)) + '$.', 'Subtract: $' + price + ' - ' + fixed2(q(price).mul(a).div(100)) + ' = ' + fixed2(ans) + '$.', 'Shortcut: you pay $100\\% - ' + a + '\\% = ' + (100 - a) + '\\%$, and $' + dd(q(100 - a).div(100)) + ' \\times ' + price + ' = ' + fixed2(ans) + '$.'];
      hint = 'Find ' + a + '% of the price, then subtract it.'; chk = { kind: 'chain', p: price, f: [-a] };
    } else if (shape === 'tax') {
      a = R.pick([4, 5, 6, 7, 8, 9]); price = R.int(12, 95); ans = q(price).mul(100 + a).div(100);
      qs = item.charAt(0).toUpperCase() + item.slice(1) + ' costs ' + money(price) + ' before tax. The sales tax is $' + a + '\\%$. What is the total cost with tax, in dollars?';
      steps = ['The tax is $' + a + '\\%$ of ' + money(price) + ': $' + dd(q(a).div(100)) + ' \\times ' + price + ' = ' + fixed2(q(price).mul(a).div(100)) + '$.', 'Add it to the price: $' + price + ' + ' + fixed2(q(price).mul(a).div(100)) + ' = ' + fixed2(ans) + '$.', 'Shortcut: the total is $' + (100 + a) + '\\%$ of the price: $' + dd(q(100 + a).div(100)) + ' \\times ' + price + ' = ' + fixed2(ans) + '$.'];
      hint = 'Find ' + a + '% of the price, then add it on.'; chk = { kind: 'chain', p: price, f: [a] };
    } else if (shape === 'tip') {
      a = R.pick([15, 18, 20, 25]); price = 2 * R.int(10, 45); var askTip = R.coin(); var tip = q(price).mul(a).div(100); ans = askTip ? tip : q(price).add(tip);
      qs = 'A meal costs ' + money(price) + '. The family leaves a $' + a + '\\%$ tip. ' + (askTip ? 'How much is the tip, in dollars?' : 'What is the total with the tip, in dollars?');
      steps = ['The tip is $' + a + '\\%$ of ' + money(price) + ': $' + dd(q(a).div(100)) + ' \\times ' + price + ' = ' + fixed2(tip) + '$.'].concat(askTip ? ['So the tip is ' + money(tip) + '.'] : ['Add it to the bill: $' + price + ' + ' + fixed2(tip) + ' = ' + fixed2(ans) + '$.']);
      hint = 'Find ' + a + '% of the bill.'; chk = { kind: askTip ? 'part' : 'chain', p: price, f: [a] };
    } else if (shape === 'markup') {
      a = R.pick([20, 25, 40, 50, 60, 75, 100]); price = 4 * R.int(3, 20); ans = q(price).mul(100 + a).div(100);
      qs = 'A store buys ' + item + ' for ' + money(price) + ' and marks the price up by $' + a + '\\%$. What is the store\'s selling price, in dollars?';
      steps = ['The markup is $' + a + '\\%$ of what the store paid: $' + dd(q(a).div(100)) + ' \\times ' + price + ' = ' + fixed2(q(price).mul(a).div(100)) + '$.', 'Add it: $' + price + ' + ' + fixed2(q(price).mul(a).div(100)) + ' = ' + fixed2(ans) + '$.'];
      hint = 'A markup is added to the store\'s cost.'; chk = { kind: 'chain', p: price, f: [a] };
    } else if (shape === 'two' || shape === 'single') {
      a = R.pick([10, 20, 25, 30, 40, 50]); b = R.pick([10, 15, 20, 25]); price = 4 * R.int(5, 30);
      var after1 = q(price).mul(100 - a).div(100), fin = after1.mul(100 - b).div(100);
      if (shape === 'two') {
        ans = fin;
        qs = item.charAt(0).toUpperCase() + item.slice(1) + ' costs ' + money(price) + '. It is marked $' + a + '\\%$ off, and then a coupon takes another $' + b + '\\%$ off the sale price. What is the final price, in dollars?';
        steps = ['First discount: you pay $' + (100 - a) + '\\%$ of ' + money(price) + ': $' + dd(q(100 - a).div(100)) + ' \\times ' + price + ' = ' + fixed2(after1) + '$.', 'The coupon takes $' + b + '\\%$ off the <b>new</b> price: $' + dd(q(100 - b).div(100)) + ' \\times ' + fixed2(after1) + ' = ' + fixed2(fin) + '$.', 'This is not the same as $' + (a + b) + '\\%$ off, which would give ' + money(q(price).mul(100 - a - b).div(100)) + ': the second discount is taken from a smaller price.'];
        hint = 'Take the second discount from the sale price, not from the original price.'; chk = { kind: 'chain', p: price, f: [-a, -b] };
      } else {
        ans = q(100).sub(fin.div(price).mul(100));
        qs = 'A store takes $' + a + '\\%$ off a price, and then takes $' + b + '\\%$ off the sale price. What single percent discount gives the same final price?';
        steps = ['After both discounts you pay $' + dd(q(100 - a).div(100)) + ' \\times ' + dd(q(100 - b).div(100)) + ' = ' + dd(q(100 - a).mul(100 - b).div(10000)) + '$ of the original price.', 'That is $' + dd(q(100 - a).mul(100 - b).div(100)) + '\\%$ of the price, so the total discount is $100\\% - ' + dd(q(100 - a).mul(100 - b).div(100)) + '\\% = ' + dd(ans) + '\\%$.', 'It is less than $' + a + '\\% + ' + b + '\\% = ' + (a + b) + '\\%$, because the second discount comes off a smaller price.'];
        hint = 'Multiply the two "percent you pay" decimals.'; chk = { kind: 'single', a: a, b: b };
        return { q: qs, a: ND(ans, { pct: true }), steps: steps, hint: hint, chk: chk };
      }
    } else if (shape === 'disctax') {
      for (var t = 0; t < 40; t++) { a = R.pick([10, 15, 20, 25, 30]); b = R.pick([5, 6, 7, 8]); price = 2 * R.int(10, 50); ans = q(price).mul(100 - a).mul(100 + b).div(10000); if (ans.mul(100).isInt()) break; }
      if (!ans.mul(100).isInt()) { a = 20; b = 5; price = 40; ans = q(price).mul(80).mul(105).div(10000); }
      var sale = q(price).mul(100 - a).div(100);
      qs = item.charAt(0).toUpperCase() + item.slice(1) + ' costs ' + money(price) + '. It is $' + a + '\\%$ off, and then $' + b + '\\%$ sales tax is added to the sale price. What is the total, in dollars?';
      steps = ['Sale price: $' + dd(q(100 - a).div(100)) + ' \\times ' + price + ' = ' + fixed2(sale) + '$.', 'Tax is added to the sale price: $' + dd(q(100 + b).div(100)) + ' \\times ' + fixed2(sale) + ' = ' + fixed2(ans) + '$.', 'Estimate to check: about $' + (100 - a) + '\\%$ of ' + money(price) + ' plus a little tax, so a bit over ' + money(sale) + ' ✓.'];
      hint = 'Find the sale price first, then add tax to that price.'; chk = { kind: 'chain', p: price, f: [-a, b] };
    } else {
      a = R.pick([10, 20, 25, 30, 40, 50]); price = 4 * R.int(5, 30); var paid = q(price).mul(100 - a).div(100); ans = q(price);
      qs = 'After a $' + a + '\\%$ discount, ' + item + ' costs ' + money(paid) + '. What was the price before the discount, in dollars?';
      steps = ['With $' + a + '\\%$ off you pay $' + (100 - a) + '\\%$, so $' + dd(q(100 - a).div(100)) + 'p = ' + fixed2(paid) + '$.', 'Divide: $p = ' + fixed2(paid) + ' \\div ' + dd(q(100 - a).div(100)) + ' = ' + price + '$.', 'Check: $' + a + '\\%$ of ' + money(price) + ' is ' + money(q(price).mul(a).div(100)) + ', and ' + money(price) + ' minus that is ' + money(paid) + ' ✓.'];
      hint = 'The sale price is ' + (100 - a) + '% of the original price.'; chk = { kind: 'revdisc', paid: paid.toPlain(), a: a };
    }
    return { q: qs, a: ND(ans), steps: steps, hint: hint, chk: chk };
  });

  G('g7.simple-interest', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['interest', 'total', 'rate', 'time', 'months'], BL(ctx, [4, 3, 0, 0, 0], [3, 3, 2, 1, 0], [2, 2, 2, 2, 2]));
    var P, r, t, I, ok = false;
    for (var k = 0; k < 80 && !ok; k++) {
      P = R.pick(BL(ctx, [200, 300, 400, 500, 600, 800, 1000], [500, 800, 1200, 1500, 2000, 2500], [250, 750, 1200, 1800, 2400, 3000, 4500]));
      r = q(R.pick(BL(ctx, [2, 3, 4, 5, 6], [2, 3, 4, 5, '2.5', '3.5', '1.5'], ['2.5', '3.5', '4.5', '1.5', 3, 6])));
      t = shape === 'months' ? q(R.pick([6, 9, 18, 3, 30])).div(12) : q(R.int(BL(ctx, 1, 2, 2), BL(ctx, 4, 6, 8)));
      I = q(P).mul(r).div(100).mul(t);
      ok = I.mul(100).isInt();
    }
    var rD = dd(r.div(100)), tS = shape === 'months' ? dd(t.mul(12)) + ' months' : dd(t) + (t.eq(1) ? ' year' : ' years');
    var base = 'You put ' + money(P) + ' in a savings account that pays $' + dd(r) + '\\%$ simple interest per year.';
    if (shape === 'interest' || shape === 'months') {
      return {
        q: base + ' How much interest do you earn in ' + tS + ', in dollars?',
        a: ND(I),
        steps: (shape === 'months' ? ['Time must be in years: $' + dd(t.mul(12)) + '$ months $= \\frac{' + dd(t.mul(12)) + '}{12} = ' + dd(t) + '$ year' + (t.gt(1) ? 's' : '') + '.'] : [])
          .concat(['Use $I = Prt$ with $P = ' + P + '$, $r = ' + dd(r) + '\\% = ' + rD + '$ and $t = ' + dd(t) + '$.', '$I = ' + P + ' \\times ' + rD + ' \\times ' + dd(t) + ' = ' + fixed2(I) + '$.', 'You earn ' + money(I) + ' in interest.']),
        hint: 'Interest = principal × rate × time, with the rate as a decimal and the time in years.',
        chk: { kind: 'I', P: P, r: r.toPlain(), t: t.toPlain() }
      };
    }
    if (shape === 'total') {
      return {
        q: base + ' What is the balance after ' + tS + ', in dollars?',
        a: ND(q(P).add(I)),
        steps: ['Interest: $I = Prt = ' + P + ' \\times ' + rD + ' \\times ' + dd(t) + ' = ' + fixed2(I) + '$.', 'Balance = principal + interest $= ' + P + ' + ' + fixed2(I) + ' = ' + fixed2(q(P).add(I)) + '$.'],
        hint: 'Find the interest first, then add the money you put in.',
        chk: { kind: 'IT', P: P, r: r.toPlain(), t: t.toPlain() }
      };
    }
    if (shape === 'rate') {
      return {
        q: 'A ' + money(P) + ' deposit earns ' + money(I) + ' of simple interest in ' + tS + '. What is the yearly interest rate, as a percent?',
        a: ND(r, { pct: true }),
        steps: ['Use $I = Prt$: $' + fixed2(I) + ' = ' + P + ' \\times r \\times ' + dd(t) + '$.', 'So $' + fixed2(I) + ' = ' + dd(q(P).mul(t)) + 'r$, and $r = ' + fixed2(I) + ' \\div ' + dd(q(P).mul(t)) + ' = ' + rD + '$.', 'As a percent, $r = ' + dd(r) + '\\%$.'],
        hint: 'Put the numbers into I = Prt and solve for r.',
        chk: { kind: 'irate', P: P, I: I.toPlain(), t: t.toPlain() }
      };
    }
    return {
      q: 'A ' + money(P) + ' deposit earns $' + dd(r) + '\\%$ simple interest per year. How many years will it take to earn ' + money(I) + ' in interest?',
      a: ND(t),
      steps: ['One year of interest is $' + P + ' \\times ' + rD + ' = ' + fixed2(q(P).mul(r).div(100)) + '$.', 'Years needed: $' + fixed2(I) + ' \\div ' + fixed2(q(P).mul(r).div(100)) + ' = ' + dd(t) + '$.'],
      hint: 'Find one year of interest, then see how many years make the total.',
      chk: { kind: 'time', P: P, I: I.toPlain(), r: r.toPlain() }
    };
  });

  var ERR_CTX = [
    { s: function (e, a) { return 'Jo guesses there are $' + e + '$ marbles in a jar. There are $' + a + '$.'; }, eg: 'guess' },
    { s: function (e, a) { return 'A student measures a table as $' + e + '$ cm long. It is $' + a + '$ cm long.'; }, eg: 'measurement' },
    { s: function (e, a) { return 'A reporter estimates a crowd of $' + T.commas(e) + '$ people. The actual count was $' + T.commas(a) + '$.'; }, eg: 'estimate', big: true },
    { s: function (e, a) { return 'Before shopping, a family estimates the bill at ' + money(e) + '. The real bill is ' + money(a) + '.'; }, eg: 'estimate' }
  ];
  G('g7.percent-error', function (R, ctx) {
    var L = lv(ctx), C = R.pick(ERR_CTX), a, e, perr, round = false;
    if (L === 3 && R.chance(0.5)) {
      do { a = R.int(30, 90); e = a + R.pick([-1, 1]) * R.int(2, 9); perr = q(Math.abs(e - a)).mul(100).div(a); } while (perr.mul(10).isInt());
      round = true;
    } else {
      var pr = pctPair(R, BL(ctx, [5, 10, 20, 25], [2, 4, 5, 8, 10, 12, 15, 20], [2, 4, 6, 8, 12, 15, 30]), 20, C.eg === 'measurement' ? 200 : 500);
      a = pr.o; e = a + R.pick([-1, 1]) * a * pr.p / 100; perr = q(pr.p);
    }
    if (C.big) { a *= 10; e *= 10; }
    var err = Math.abs(e - a);
    var steps = ['The error is the distance between the ' + C.eg + ' and the actual value: $|' + T.commas(e) + ' - ' + T.commas(a) + '| = ' + T.commas(err) + '$.', 'Divide by the <b>actual</b> value: $\\frac{' + T.commas(err) + '}{' + T.commas(a) + '}' + (round ? ' \\approx ' + perr.div(100).toDec(4) : ' = ' + dd(perr.div(100))) + '$.', (round ? 'As a percent that is about $' + perr.toDec(3) + '\\%$, which rounds to $' + perr.toDec(1) + '\\%$.' : 'As a percent: $' + dd(perr) + '\\%$.')];
    return {
      q: C.s(e, a) + ' What is the percent error' + (round ? ', to the nearest tenth of a percent?' : '?'),
      a: round ? N(perr.toDec(1), { pct: true, dp: 1 }) : ND(perr, { pct: true }),
      steps: steps,
      hint: 'Percent error = |estimate − actual| ÷ actual, written as a percent.',
      chk: { kind: 'perr', e: e, a: a, round: round }
    };
  });

  G('g7.scale-drawings', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['toActual', 'toDrawing', 'area', 'model', 'redraw', 'areaFactor'], BL(ctx, [4, 3, 0, 1, 0, 0], [3, 2, 3, 1, 1, 1], [2, 2, 3, 1, 2, 2]));
    var metric = R.coin(), s = R.pick(metric ? [2, 4, 5, 10, 20, 25] : [2, 3, 4, 5, 8, 10]);
    var du = metric ? 'cm' : 'in.', au = metric ? 'm' : 'ft', duw = metric ? 'centimeter' : 'inch', auw = metric ? 'meters' : 'feet';
    var scale = '1 ' + du + ' represents ' + s + ' ' + au;
    var thing = R.pick(['a park', 'a house', 'a garden', 'a classroom', 'a soccer field', 'a playground']);
    if (shape === 'toActual') {
      var Ld = q(R.pick(BL(ctx, [2, 3, 4, 5, 6, 7, 8], ['1.5', '2.5', 3, '4.5', 6, '7.5'], ['2.5', '3.5', '4.25', '6.5', '1.75'])));
      return {
        q: 'A map of ' + thing + ' uses the scale ' + scale + '. A path on the map is $' + dd(Ld) + '$ ' + du + ' long. How long is the real path, in ' + auw + '?',
        a: ND(Ld.mul(s)),
        steps: ['Each ' + duw + ' on the map stands for $' + s + '$ ' + auw + '.', 'Multiply: $' + dd(Ld) + ' \\times ' + s + ' = ' + dd(Ld.mul(s)) + '$ ' + auw + '.'],
        hint: 'Every 1 ' + du + ' on the map is ' + s + ' ' + au + ' in real life.',
        chk: { kind: 'mul', a: Ld.toPlain(), b: s }
      };
    }
    if (shape === 'toDrawing') {
      var A = q(s).mul(R.pick(BL(ctx, [2, 3, 4, 5, 6, 8], ['1.5', '2.5', 3, '3.5', 7, 9], ['1.5', '2.5', '4.5', '0.5', '5.25'])));
      return {
        q: 'An architect draws ' + thing + ' with the scale ' + scale + '. A wall is $' + dd(A) + '$ ' + auw + ' long. How long should it be in the drawing, in ' + (metric ? 'centimeters' : 'inches') + '?',
        a: ND(A.div(s)),
        steps: ['Every $' + s + '$ ' + auw + ' of wall needs 1 ' + duw + ' of drawing.', 'Divide: $' + dd(A) + ' \\div ' + s + ' = ' + dd(A.div(s)) + '$ ' + du],
        hint: 'How many groups of ' + s + ' ' + au + ' are in the real length?',
        chk: { kind: 'div', a: A.toPlain(), b: s }
      };
    }
    if (shape === 'area') {
      var w = R.int(2, 6), h = R.intNot(2, 8, w);
      return {
        q: 'A floor plan uses the scale ' + scale + '. A rectangular room is $' + w + '$ ' + du + ' by $' + h + '$ ' + du + ' on the plan. What is the actual area of the room, in square ' + auw + '?',
        a: N(w * s * h * s),
        steps: ['Change each length first: $' + w + ' \\times ' + s + ' = ' + w * s + '$ ' + au + ' and $' + h + ' \\times ' + s + ' = ' + h * s + '$ ' + au + '.', 'Area $= ' + w * s + ' \\times ' + h * s + ' = ' + T.commas(w * s * h * s) + '$ square ' + auw + '.', 'Note: the plan\'s area is $' + w * h + '$ square ' + du + ', and the real area is $' + s + '^2 = ' + s * s + '$ times as big, not $' + s + '$ times.'],
        hint: 'Scale each side to real size first, then multiply.',
        chk: { kind: 'area', w: w, h: h, s: s }
      };
    }
    if (shape === 'model') {
      var k, ml, tr = 0;
      do { k = R.pick([12, 16, 18, 24, 32, 48]); ml = q(R.pick(['2.5', 3, '3.5', 4, '4.5', 5, 6, '7.5'])); tr++; } while (tr < 50 && !ml.mul(k).div(12).mul(100).isInt());
      var obj = R.pick(['car', 'airplane', 'sailboat', 'bus']);
      return {
        q: 'A model ' + obj + ' is built at a scale of $1 : ' + k + '$, so every length on the real ' + obj + ' is $' + k + '$ times the length on the model. The model is $' + dd(ml) + '$ inches long. How long is the real ' + obj + ', in feet?',
        a: ND(ml.mul(k).div(12)),
        steps: ['Real length in inches: $' + dd(ml) + ' \\times ' + k + ' = ' + dd(ml.mul(k)) + '$ inches.', 'There are 12 inches in a foot: $' + dd(ml.mul(k)) + ' \\div 12 = ' + dd(ml.mul(k).div(12)) + '$ feet.'],
        hint: 'Multiply by ' + k + ', then change inches to feet.',
        chk: { kind: 'model', m: ml.toPlain(), k: k }
      };
    }
    if (shape === 'redraw') {
      var mult = R.pick([2, 4, 5]), s2 = s * mult, dl = R.int(2, 9), real = dl * s2;
      // the old drawing uses 1 : s2, the new one 1 : s, so the new drawing is mult times as big
      return {
        q: 'A drawing of ' + thing + ' uses the scale 1 ' + du + ' represents ' + s2 + ' ' + au + '. A fence in the drawing is $' + dl + '$ ' + du + ' long. You redraw it with the scale ' + scale + '. How long is the fence in the new drawing, in ' + du + '?',
        a: ND(q(real).div(s)),
        steps: ['Find the real length first: $' + dl + ' \\times ' + s2 + ' = ' + real + '$ ' + au + '.', 'In the new drawing, each ' + duw + ' is ' + s + ' ' + au + ': $' + real + ' \\div ' + s + ' = ' + dd(q(real).div(s)) + '$ ' + du + '.', 'Check: each new ' + duw + ' covers $\\frac{1}{' + mult + '}$ as much ground as before, so the fence is $' + mult + '$ times as long on paper: $' + dl + ' \\times ' + mult + ' = ' + dl * mult + '$ ✓.'],
        hint: 'Go through the real length: drawing → real → new drawing.',
        chk: { kind: 'redraw', d: dl, s1: s2, s2: s }
      };
    }
    var f = R.pick([2, 3, 4, 5, 10]), pa = R.int(3, 15);
    return {
      q: 'A photo is enlarged so that every length is $' + f + '$ times as long. The original photo has an area of $' + pa + '$ square inches. What is the area of the enlarged photo, in square inches?',
      a: N(pa * f * f),
      steps: ['Both the length and the width are multiplied by $' + f + '$.', 'So the area is multiplied by $' + f + ' \\times ' + f + ' = ' + f * f + '$.', 'New area: $' + pa + ' \\times ' + f * f + ' = ' + pa * f * f + '$ square inches.'],
      hint: 'Area uses two lengths, and both of them grow.',
      chk: { kind: 'af', f: f, a: pa }
    };
  });
  /* ============================================================ Unit 3: Adding and subtracting signed numbers */

  /* sign-rule words for a + b (integers or rationals as Q) */
  function addWords(a, b) {
    a = q(a); b = q(b);
    var s = a.add(b), A = a.abs(), B = b.abs();
    if (a.isZero() || b.isZero()) return ['Adding $0$ changes nothing: the sum is $' + mx(s) + '$.'];
    if (a.sign() === b.sign()) return ['Both numbers are ' + (a.sign() > 0 ? 'positive' : 'negative') + ', so the moves go the same way. Add the absolute values: $' + mx(A) + ' + ' + mx(B) + ' = ' + mx(A.add(B)) + '$.', 'Keep the common sign: $' + mx(s) + '$.'];
    var big = A.gt(B) ? a : b;
    if (A.eq(B)) return ['The numbers are opposites, so they make a zero pair: the sum is $0$.'];
    return ['The signs are different, so the moves go opposite ways and partly cancel. Subtract the absolute values: $' + mx(Q.max(A, B)) + ' - ' + mx(Q.min(A, B)) + ' = ' + mx(Q.max(A, B).sub(Q.min(A, B))) + '$.',
      'The sum has the sign of $' + mx(big) + '$, the number farther from $0$: $' + mx(s) + '$.'];
  }
  function moveWords(a, b) { // number-line reading of a + b
    a = q(a); b = q(b);
    if (b.isZero()) return 'Start at $' + mx(a) + '$ and stay put.';
    return 'On a number line: start at $' + mx(a) + '$ and move $' + mx(b.abs()) + '$ to the ' + (b.sign() > 0 ? 'right' : 'left') + '. You land on $' + mx(a.add(b)) + '$.';
  }

  G('g7.opposites-make-zero', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['opp', 'chain', 'counters', 'context', 'which'], BL(ctx, [3, 3, 3, 2, 0], [2, 4, 2, 2, 2], [2, 4, 1, 2, 2]));
    if (shape === 'opp') {
      var dec0 = R.coin(), v = L === 1 ? q(R.nz(-25, 25)) : q(R.pick(dec0 ? ['-3.5', '4.25', '-12.6', '0.75', '-0.4'] : ['-7/8', '2/3', '-3/2', '5/6', '-4/9'])), f0 = shower(dec0);
      return {
        q: 'What number can you add to $' + f0(v) + '$ to get $0$?',
        a: NS(v.neg(), dec0 && L > 1),
        steps: ['A number and its opposite are the same distance from $0$ on opposite sides, so together they make $0$.', 'The opposite of $' + f0(v) + '$ is $' + f0(v.neg()) + '$: $' + f0(v) + ' + ' + pd(f0(v.neg())) + ' = 0$.'],
        hint: 'Which number is the same distance from 0, on the other side?',
        chk: { kind: 'sum', terms: [v.toPlain()], plus: v.neg().toPlain(), target: '0' }
      };
    }
    if (shape === 'chain') {
      var terms, dec1 = R.coin(), f1 = L === 3 ? shower(dec1) : mx;
      if (L === 1) { var a = R.nz(-15, 15), b = R.intNot(-12, 12, [0, a, -a]); terms = R.shuffle([q(a), q(b), q(-a)]); }
      else if (L === 2) { var a2 = R.nz(-20, 20), b2 = R.intNot(-20, 20, [0, a2, -a2]), c2 = R.intNot(-9, 9, [0, a2, -a2, b2, -b2]); terms = R.shuffle([q(a2), q(b2), q(-a2), q(-b2), q(c2)]); }
      else { var f = q(R.pick(dec1 ? ['1.5', '-2.75', '0.25', '-3.4'] : ['3/4', '-2/5', '5/6', '-7/3'])), g = q(R.pick(dec1 ? ['2', '-0.5', '1.25', '-3'] : ['2', '-1/2', '1/3', '-3'])); if (g.eq(f.neg()) || g.eq(f)) g = q(7); terms = R.shuffle([f, g, f.neg()]); }
      var total = terms.reduce(function (s, x) { return s.add(x); }, q(0));
      var tex = terms.map(function (x, i) { return i === 0 ? f1(x) : ' + ' + pd(f1(x)); }).join('');
      var pairs = [];
      terms.forEach(function (x, i) { terms.forEach(function (y, j) { if (j > i && x.add(y).isZero() && !x.isZero()) pairs.push('$' + f1(x) + '$ and $' + f1(y) + '$'); }); });
      return {
        q: 'Find the sum: $' + tex + '$',
        a: NS(total, L === 3 && dec1),
        steps: ['Look for opposites first: ' + U.list(U.uniq(pairs)) + (pairs.length > 1 ? ' make zero pairs.' : ' make a zero pair.'), 'Zero pairs add nothing, so the sum is what is left: $' + f1(total) + '$.'],
        hint: 'Find a number and its opposite. Together they are 0.',
        chk: { kind: 'sum', terms: terms.map(function (x) { return x.toPlain(); }) }
      };
    }
    if (shape === 'counters') {
      var pos = R.int(2, 12), neg = R.intNot(2, 12, pos);
      return {
        q: 'A bag holds $' + pos + '$ positive counters (each worth $+1$) and $' + neg + '$ negative counters (each worth $-1$). What number does the bag show?',
        a: N(pos - neg),
        steps: ['Pair each positive counter with a negative one. Each pair is a zero pair: $1 + (-1) = 0$.', 'You can make $' + Math.min(pos, neg) + '$ zero pairs. They are worth nothing.', 'Left over: $' + Math.abs(pos - neg) + '$ ' + (pos > neg ? 'positive' : 'negative') + ' counters, so the bag shows $' + (pos - neg) + '$.'],
        hint: 'Match positives with negatives. What is left over?',
        chk: { kind: 'sum', terms: [String(pos), String(-neg)] }
      };
    }
    if (shape === 'which') {
      var wr = R.pick(['3.5', '-4.5', '2/3', '-7', '1.25', '-5/4']), w = q(wr), W = shower(isDec(wr))(w), Wn = shower(isDec(wr))(w.neg());
      var good = '$' + W + ' + ' + pd(Wn) + '$', bads = ['$' + W + ' + ' + pd(W) + '$', '$' + W + ' - ' + pd(Wn) + '$', '$' + Wn + ' + ' + pd(Wn) + '$'];
      return {
        q: 'Which sum is equal to $0$?',
        a: mcq(good, bads),
        steps: ['A sum is $0$ when the two numbers are opposites: the same distance from $0$ on different sides.', good + ' adds a number and its opposite, so it equals $0$.', 'The others move twice in the same direction, so they cannot land on $0$.'],
        hint: 'Which pair of numbers are opposites?',
        chk: { kind: 'none' }
      };
    }
    var C = R.pick([
      function (n) { return { t: 'A diver swims down $' + n + '$ feet, then swims straight back up $' + n + '$ feet. What is the diver\'s total change in depth, in feet?', v: 0 }; },
      function (n) { return { t: 'A store\'s bank account gains \\$' + n + ' on Monday and loses \\$' + n + ' on Tuesday. What is the total change, in dollars?', v: 0 }; },
      function (n, m) { return { t: 'An elevator goes up $' + n + '$ floors, then down $' + n + '$ floors, then up $' + m + '$ floors. How many floors above where it started is it?', v: m }; },
      function (n, m) { return { t: 'The temperature rises $' + n + '$ degrees, falls $' + n + '$ degrees, then falls $' + m + '$ more degrees. What is the total change, in degrees?', v: -m }; }
    ]);
    var n1 = R.int(4, 40), m1 = R.int(2, 9), cc = C(n1, m1);
    return {
      q: cc.t,
      a: N(cc.v),
      steps: ['Write each change as a signed number. Going up is positive; going down is negative.', 'The changes $+' + n1 + '$ and $-' + n1 + '$ are opposites, so they make $0$.', cc.v === 0 ? 'Nothing is left, so the total change is $0$.' : 'Only the last change is left: $' + cc.v + '$.'],
      hint: 'Which two changes cancel each other out?',
      chk: { kind: 'val', v: String(cc.v) }
    };
  });

  G('g7.add-integers', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['two', 'three', 'word'], BL(ctx, [1, 0, 0], [6, 2, 2], [3, 3, 4]));
    var M = BL(ctx, 12, 40, 80);
    if (shape === 'two') {
      var a = R.nz(-M, M), b = R.nz(-M, M), t = 0;
      while (a > 0 && b > 0 && t++ < 10) { a = R.nz(-M, M); b = R.nz(-M, M); }
      return {
        q: 'Find the sum: $' + a + ' + ' + sp(b) + '$',
        a: N(a + b),
        steps: [moveWords(a, b)].concat(addWords(a, b)),
        hint: a * b < 0 ? 'The signs are different: subtract the absolute values and keep the sign of the number farther from 0.' : 'Both are negative: add the absolute values and keep the negative sign.',
        chk: { kind: 'sum', terms: [String(a), String(b)] }
      };
    }
    if (shape === 'three') {
      var xs = [R.nz(-M, M), R.nz(-M, M), R.nz(-M, M)], s1 = xs[0] + xs[1];
      return {
        q: 'Find the sum: $' + xs[0] + ' + ' + sp(xs[1]) + ' + ' + sp(xs[2]) + '$',
        a: N(s1 + xs[2]),
        steps: ['Add from left to right. $' + xs[0] + ' + ' + sp(xs[1]) + ' = ' + s1 + '$.', '$' + s1 + ' + ' + sp(xs[2]) + ' = ' + (s1 + xs[2]) + '$.', 'Another way: add the positives ($' + sum(xs.filter(function (x) { return x > 0; })) + '$) and the negatives ($' + sum(xs.filter(function (x) { return x < 0; })) + '$), then combine.'],
        hint: 'Add two numbers at a time, or group the positives and the negatives.',
        chk: { kind: 'sum', terms: xs.map(String) }
      };
    }
    var W = R.pick([
      function () { var a = -R.int(3, 15), b = R.int(5, 25); return { t: 'At 6 a.m. the temperature was $' + a + '^\\circ$F. By noon it had risen $' + b + '$ degrees. What was the temperature at noon, in degrees Fahrenheit?', terms: [a, b] }; },
      function () { var a = -R.int(20, 60), b = R.int(5, 30); return { t: 'A diver is $' + (-a) + '$ feet below the surface ($' + a + '$ feet). She rises $' + b + '$ feet. What is her new position, in feet? (Use a negative number for below the surface.)', terms: [a, b] }; },
      function () { var a = -R.int(5, 40), b = R.int(10, 80); return { t: 'A bank account is overdrawn: its balance is $-\\$' + (-a) + '$. Then a deposit of \\$' + b + ' is made. What is the new balance, in dollars?', terms: [a, b] }; },
      function () { var a = -R.int(2, 9), b = R.int(1, 12), c = -R.int(1, 8); return { t: 'A football team loses $' + (-a) + '$ yards, gains $' + b + '$ yards, then loses $' + (-c) + '$ yards. What is the total change in yards?', terms: [a, b, c] }; },
      function () { var a = R.int(10, 40), b = -R.int(15, 60); return { t: 'A hiker climbs $' + a + '$ meters up a hill and then walks $' + (-b) + '$ meters down. What is the total change in height, in meters?', terms: [a, b] }; }
    ])();
    var tot = sum(W.terms);
    return {
      q: W.t,
      a: N(tot),
      steps: ['Write each change as a signed number: $' + W.terms.map(function (x, i) { return i ? sp(x) : String(x); }).join(' + ') + '$.'].concat(W.terms.length === 2 ? addWords(W.terms[0], W.terms[1]) : ['Add: $' + W.terms[0] + ' + ' + sp(W.terms[1]) + ' = ' + (W.terms[0] + W.terms[1]) + '$, then $' + (W.terms[0] + W.terms[1]) + ' + ' + sp(W.terms[2]) + ' = ' + tot + '$.']),
      hint: 'Write gains or rises as positive numbers and losses or drops as negative numbers, then add.',
      chk: { kind: 'sum', terms: W.terms.map(String) }
    };
  });

  function subWords(a, b) {
    a = q(a); b = q(b);
    return ['Subtracting a number is the same as adding its opposite: $' + mx(a) + ' - ' + pd(mx(b)) + ' = ' + mx(a) + ' + ' + pd(mx(b.neg())) + '$.', moveWords(a, b.neg())];
  }
  G('g7.subtract-integers', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['two', 'chain', 'word'], BL(ctx, [1, 0, 0], [6, 2, 2], [3, 2, 5]));
    var M = BL(ctx, 12, 40, 80);
    if (shape === 'two') {
      var a = R.int(-M, M), b = R.nz(-M, M), t = 0;
      while ((a >= 0 && b > 0 && a >= b) && t++ < 10) { a = R.int(-M, M); b = R.nz(-M, M); }
      if (L === 1 && R.chance(0.5) && b > 0) b = -b;
      return {
        q: 'Find the difference: $' + a + ' - ' + sp(b) + '$',
        a: N(a - b),
        steps: subWords(a, b).concat(['So $' + a + ' - ' + sp(b) + ' = ' + (a - b) + '$.']),
        hint: 'Rewrite it as adding the opposite: change "− ' + sp(b) + '" to "+ ' + sp(-b) + '".',
        chk: { kind: 'diff', a: a, b: b }
      };
    }
    if (shape === 'chain') {
      var x = R.int(-M, M), y = R.nz(-M, M), z = R.nz(-M, M);
      return {
        q: 'Find the value: $' + x + ' - ' + sp(y) + ' - ' + sp(z) + '$',
        a: N(x - y - z),
        steps: ['Change each subtraction into adding the opposite: $' + x + ' + ' + sp(-y) + ' + ' + sp(-z) + '$.', 'Add from left to right: $' + x + ' + ' + sp(-y) + ' = ' + (x - y) + '$, then $' + (x - y) + ' + ' + sp(-z) + ' = ' + (x - y - z) + '$.'],
        hint: 'Rewrite every subtraction as adding the opposite.',
        chk: { kind: 'expr', v: x + '-(' + y + ')-(' + z + ')' }
      };
    }
    var W = R.pick([
      function () { var hi = R.int(-5, 15), lo = hi - R.int(6, 25); return { t: 'One winter day the high temperature was $' + hi + '^\\circ$F and the low was $' + lo + '^\\circ$F. How many degrees warmer was the high than the low?', a: hi, b: lo }; },
      function () { var top = R.int(100, 900), bot = -R.int(20, 300); return { t: 'A cliff rises to $' + top + '$ feet above sea level. The bottom of a nearby lake is at $' + bot + '$ feet. How many feet higher is the top of the cliff than the lake bottom?', a: top, b: bot }; },
      function () { var now = -R.int(3, 20), then = R.int(-10, 12); return { t: 'At midnight the temperature was $' + then + '^\\circ$C. By 6 a.m. it was $' + now + '^\\circ$C. What was the change in temperature, in degrees? (A drop is negative.)', a: now, b: then }; },
      function () { var bal = R.int(-30, 40), w = R.int(20, 70); return { t: 'A bank account has a balance of $' + (bal < 0 ? '-\\$' + (-bal) : '\\$' + bal) + '$. Then \\$' + w + ' is taken out. What is the new balance, in dollars?', a: bal, b: w }; }
    ])();
    return {
      q: W.t,
      a: N(W.a - W.b),
      steps: ['Write a subtraction: $' + W.a + ' - ' + sp(W.b) + '$.'].concat(subWords(W.a, W.b)).concat(['The answer is $' + (W.a - W.b) + '$.']),
      hint: 'A difference or a change is "end minus start" (or "higher minus lower").',
      chk: { kind: 'diff', a: W.a, b: W.b }
    };
  });

  var mxAll = mx;
  G('g7.number-line-distance', function (R, ctx) {
    var L = lv(ctx);
    var a, b;
    if (L === 1) { a = q(-R.int(1, 15)); b = q(R.int(1, 15)); if (R.coin()) { var t = a; a = b; b = t; } }
    else if (L === 2) { a = q(R.nz(-30, 30)); b = q(R.intNot(-30, 30, [0, a.num()])); }
    var dec3 = R.coin(), mx = L === 3 ? shower(dec3) : mxAll;
    if (L === 3) { // one negative and one other number: quarters as decimals, or thirds, halves and quarters as fractions
      if (dec3) { a = q(-R.int(1, 40)).div(4); b = q(R.intNot(-12, 40, [0])).div(4); }
      else { var dn3 = R.pick([2, 3, 4, 6]), dn4 = R.pick([2, 3, 4]); a = q(-R.int(1, 3 * dn3)).div(dn3); b = q(R.intNot(-2 * dn4, 3 * dn4, [0])).div(dn4); if (a.isInt()) a = a.sub(q(1).div(dn3 === 2 ? 2 : 3)); }
      if (R.coin()) { var t3 = a; a = b; b = t3; }
      if (a.eq(b)) b = b.add(3); }
    var dist = a.sub(b).abs();
    var shape = R.pickW(['points', 'temp', 'elev'], BL(ctx, [3, 1, 1], [2, 1, 1], [3, 1, 1]));
    var qs;
    if (shape === 'temp' && a.isInt() && b.isInt()) qs = 'The temperature in one town is $' + mx(a) + '^\\circ$F, and in another it is $' + mx(b) + '^\\circ$F. How many degrees apart are the two temperatures?';
    else if (shape === 'elev' && a.isInt() && b.isInt()) qs = 'A bird flies at $' + mx(Q.max(a, b)) + '$ m and a fish swims at $' + mx(Q.min(a, b)) + '$ m, measured from sea level (negative means below). How far apart are they, in meters?';
    else qs = 'Point $A$ is at $' + mx(a) + '$ and point $B$ is at $' + mx(b) + '$ on a number line. What is the distance between them?';
    var steps = ['The distance between two numbers is the absolute value of their difference: $|' + mx(a) + ' - ' + pd(mx(b)) + '|$.', '$' + mx(a) + ' - ' + pd(mx(b)) + ' = ' + mx(a.sub(b)) + '$, and $|' + mx(a.sub(b)) + '| = ' + mx(dist) + '$.'];
    if (a.sign() * b.sign() < 0) steps.push('Check: from $' + mx(a) + '$ to $0$ is $' + mx(a.abs()) + '$, and from $0$ to $' + mx(b) + '$ is $' + mx(b.abs()) + '$. Together: $' + mx(a.abs()) + ' + ' + mx(b.abs()) + ' = ' + mx(dist) + '$ ✓.');
    else steps.push('Subtracting in the other order gives $' + mx(b.sub(a)) + '$, with the same absolute value: a distance is never negative.');
    return {
      q: qs,
      a: NS(dist, L === 3 && dec3),
      steps: steps,
      hint: 'Subtract the two numbers and take the absolute value.',
      chk: { kind: 'dist', a: a.toPlain(), b: b.toPlain() }
    };
  });

  function fracTex(n, D) { return D === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + D + '}'; }
  function fracAddSteps(a, b, op) { // a op b for Q values, written with fractions
    var steps = [], bb = op === '-' ? b.neg() : b;
    if (op === '-') steps.push('Subtracting is adding the opposite: $' + mx(a) + ' - ' + pd(mx(b)) + ' = ' + mx(a) + ' + ' + pd(mx(bb)) + '$.');
    var hasMixed = (!a.isInt() && a.abs().gt(1)) || (!bb.isInt() && bb.abs().gt(1));
    if (hasMixed) steps.push('Write the mixed numbers as fractions: $' + im(a) + ' + ' + pd(im(bb)) + '$.');
    var D = U.lcm(Number(a.d), Number(bb.d)), na = a.mul(D).num(), nb = bb.mul(D).num(), s = a.add(bb);
    if (D > 1 && !(Number(a.d) === D && Number(bb.d) === D)) steps.push('Use the common denominator $' + D + '$: $' + fracTex(na, D) + ' + ' + pd(fracTex(nb, D)) + '$.');
    var raw = fracTex(na + nb, D), done = mx(s);
    steps.push('Add the numerators with the sign rules: $' + na + ' + ' + sp(nb) + ' = ' + (na + nb) + '$, so the result is $' + raw + (raw === done ? '' : ' = ' + done) + '$.');
    return steps;
  }
  function decAddSteps(a, b, op) {
    var bb = op === '-' ? b.neg() : b, steps = [];
    if (op === '-') steps.push('Subtracting is adding the opposite: $' + dd(a) + ' - ' + pd(dd(b)) + ' = ' + dd(a) + ' + ' + pd(dd(bb)) + '$.');
    var s = a.add(bb), A = a.abs(), B = bb.abs();
    if (a.sign() === bb.sign() || a.isZero() || bb.isZero()) steps.push('Same signs: add the absolute values, $' + dd(A) + ' + ' + dd(B) + ' = ' + dd(A.add(B)) + '$, and keep the sign: $' + dd(s) + '$.');
    else steps.push('Different signs: subtract the absolute values, $' + dd(Q.max(A, B)) + ' - ' + dd(Q.min(A, B)) + ' = ' + dd(Q.max(A, B).sub(Q.min(A, B))) + '$. The sign follows the number farther from 0: $' + dd(s) + '$.');
    return steps;
  }
  G('g7.add-subtract-rationals', function (R, ctx) {
    var L = lv(ctx);
    var useDec = R.coin(), op = R.coin() ? '+' : '-', a, b, steps;
    if (useDec) {
      var dp = BL(ctx, 1, 2, 2);
      a = q(R.real(-12, 12, dp)); b = q(R.real(-12, 12, dp));
      if (a.isZero()) a = q('-2.5'); if (b.isZero()) b = q('3.75');
      if (a.sign() > 0 && b.sign() > 0) a = a.neg();
    } else {
      var den1, den2;
      if (L === 1) { den1 = den2 = R.pick([4, 5, 6, 8, 10]); }
      else { den1 = R.pick([2, 3, 4, 5, 6]); den2 = R.intNot(2, 12, den1); }
      a = q(R.nz(-2 * den1 + 1, 2 * den1 - 1)).div(den1); b = q(R.nz(-2 * den2 + 1, 2 * den2 - 1)).div(den2);
      if (L === 3) { a = a.add(a.sign() < 0 ? -R.int(1, 3) : R.int(1, 3)); b = b.add(b.sign() < 0 ? -R.int(1, 2) : R.int(1, 2)); }
      if (a.isInt()) a = a.add(q(1).div(den1)); if (b.isInt()) b = b.add(q(-1).div(den2));
      if (a.sign() > 0 && b.sign() > 0) a = a.neg();
    }
    var res = op === '+' ? a.add(b) : a.sub(b), f = useDec ? dd : mx;
    var ctxW = L === 3 && useDec && R.chance(0.4);
    var qs = ctxW ? 'The temperature was $' + dd(a) + '^\\circ$C. It then ' + (op === '+' ? (b.sign() > 0 ? 'rose' : 'changed by') : 'dropped') + ' $' + (op === '+' && b.sign() < 0 ? dd(b) : dd(b.abs())) + '$ degrees. What is the temperature now, in degrees Celsius?' : 'Find the value: $' + f(a) + (op === '+' ? ' + ' : ' - ') + pd(f(b)) + '$';
    if (ctxW && op === '-' && b.sign() < 0) { b = b.neg(); res = a.sub(b); qs = 'The temperature was $' + dd(a) + '^\\circ$C. It then dropped $' + dd(b) + '$ degrees. What is the temperature now, in degrees Celsius?'; }
    steps = useDec ? decAddSteps(a, b, op) : fracAddSteps(a, b, op);
    if (ctxW) steps.unshift('Write the change as a signed number and combine: $' + dd(a) + (op === '+' ? ' + ' : ' - ') + pd(dd(b)) + '$.');
    return {
      q: qs,
      a: NS(res, useDec),
      steps: steps,
      hint: op === '-' ? 'Change subtracting into adding the opposite, then use the sign rules for adding.' : 'Use the same sign rules as for integers.' + (useDec ? '' : ' Find a common denominator first.'),
      chk: { kind: 'expr', v: '(' + a.toPlain() + ')' + op + '(' + b.toPlain() + ')' }
    };
  });
  /* ============================================================ Unit 4: Multiplying and dividing signed numbers */

  function signWord(neg) { return neg ? 'negative' : 'positive'; }
  G('g7.multiply-integers', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['two', 'three', 'pattern', 'contrast', 'word', 'power'], BL(ctx, [6, 0, 2, 1, 0, 0], [4, 2, 1, 2, 2, 0], [2, 2, 1, 2, 3, 2]));
    var M = BL(ctx, 9, 12, 15);
    if (shape === 'two') {
      var a = R.nz(-M, M), b = R.nz(-M, M), t = 0;
      while ((a > 0 && b > 0) || Math.abs(a) === 1 || Math.abs(b) === 1) { a = R.nz(-M, M); b = R.nz(-M, M); if (++t > 20) { a = -6; b = -7; break; } }
      var neg = (a < 0) !== (b < 0);
      return {
        q: 'Find the product: $' + sp(a) + ' \\times ' + sp(b) + '$',
        a: N(a * b),
        steps: ['Multiply the absolute values: $' + Math.abs(a) + ' \\times ' + Math.abs(b) + ' = ' + Math.abs(a * b) + '$.', (neg ? 'The signs are different, so the product is negative' : 'The signs are the same (both negative), so the product is positive') + ': $' + (a * b) + '$.'],
        hint: 'Same signs give a positive product; different signs give a negative product.',
        chk: { kind: 'expr', v: '(' + a + ')*(' + b + ')' }
      };
    }
    if (shape === 'three') {
      var xs = [R.nz(-9, 9), R.nz(-6, 6), R.nz(-5, 5)].map(function (x) { return Math.abs(x) === 1 ? x * 2 : x; });
      if (xs.every(function (x) { return x > 0; })) xs[1] = -xs[1];
      var p = xs[0] * xs[1] * xs[2], nneg = xs.filter(function (x) { return x < 0; }).length;
      return {
        q: 'Find the product: $' + xs.map(sp).join(' \\times ') + '$',
        a: N(p),
        steps: ['Multiply the absolute values: $' + xs.map(Math.abs).join(' \\times ') + ' = ' + Math.abs(p) + '$.', 'Count the negative factors: there ' + (nneg === 1 ? 'is 1' : 'are ' + nneg) + '. ' + (nneg % 2 ? 'An odd number of negatives leaves one sign change unpaired, so the product is negative' : 'Each pair of negatives makes a positive, so the product is positive') + ': $' + p + '$.'],
        hint: 'Count the negative signs. An even number gives a positive product.',
        chk: { kind: 'expr', v: xs.map(function (x) { return '(' + x + ')'; }).join('*') }
      };
    }
    if (shape === 'pattern') {
      var b2 = -R.int(2, 9), rows = [3, 2, 1, 0, -1, -2];
      var shown = rows.slice(0, 5).map(function (r) { return '$' + sp(r) + ' \\times ' + sp(b2) + (r >= 0 ? ' = ' + r * b2 : ' = \\ ?') + '$'; });
      return {
        q: 'Look for the pattern: ' + shown.slice(0, 4).join(', ') + '. Each time the first factor goes down by $1$, how does the product change? Use the pattern to find $(-1) \\times ' + sp(b2) + '$.',
        a: N(-1 * b2),
        steps: ['Each time the first factor goes down by $1$, the product goes <b>up</b> by $' + (-b2) + '$ (we take away one ' + sp(b2) + ', and taking away a negative is like adding).', 'From $0 \\times ' + sp(b2) + ' = 0$, go up $' + (-b2) + '$ more: $(-1) \\times ' + sp(b2) + ' = ' + (-b2) + '$.', 'So a negative times a negative is positive.'],
        hint: 'Find how much the product changes from one line to the next, and keep going.',
        chk: { kind: 'expr', v: '(-1)*(' + b2 + ')' }
      };
    }
    if (shape === 'contrast') {
      var c1 = -R.int(2, 9), c2 = -R.int(2, 9);
      return {
        q: 'Find both: the sum $' + c1 + ' + ' + sp(c2) + '$ and the product $' + sp(c1) + ' \\times ' + sp(c2) + '$.',
        a: { t: 'multi', parts: [{ label: 'Sum', a: N(c1 + c2) }, { label: 'Product', a: N(c1 * c2) }] },
        steps: ['Sum: two negatives are two moves to the left, so $' + c1 + ' + ' + sp(c2) + ' = ' + (c1 + c2) + '$. Adding never turns two negatives into a positive.', 'Product: same signs, so $' + sp(c1) + ' \\times ' + sp(c2) + ' = ' + (c1 * c2) + '$.', '"Two negatives make a positive" is a rule for multiplying (and dividing), not for adding.'],
        hint: 'Use the adding rules for the sum and the multiplying rules for the product.',
        chk: { kind: 'multi', v: [String(c1 + c2), String(c1 * c2)] }
      };
    }
    if (shape === 'power') {
      var base = -R.int(2, 5), e = R.int(2, BL(ctx, 3, 3, 4)), val = Math.pow(base, e);
      return {
        q: 'Find the value: $' + T.pow(base, e) + '$',
        a: N(val),
        steps: ['$' + T.pow(base, e) + '$ means $' + range(1, e).map(function () { return sp(base); }).join(' \\times ') + '$.', 'There are ' + e + ' negative factors, an ' + (e % 2 ? 'odd' : 'even') + ' number, so the result is ' + signWord(e % 2 === 1) + ': $' + val + '$.'],
        hint: 'Write out the factors and count the negative signs.',
        chk: { kind: 'expr', v: '(' + base + ')^' + e }
      };
    }
    var W = R.pick([
      function () { var r = R.int(2, 6), h = R.int(3, 8); return { t: 'The temperature drops $' + r + '$ degrees every hour. What is the total change in temperature after $' + h + '$ hours, in degrees?', a: -r, b: h, why: 'A drop of ' + r + ' degrees each hour is $-' + r + '$ per hour. ' + h + ' hours later: $' + h + ' \\times (-' + r + ')$.' }; },
      function () { var r = R.int(2, 9), m = R.int(3, 10); return { t: 'A submarine dives $' + r + '$ meters per minute. What is its change in depth after $' + m + '$ minutes, in meters? (Down is negative.)', a: -r, b: m, why: 'Diving is $-' + r + '$ meters each minute, for ' + m + ' minutes: $' + m + ' \\times (-' + r + ')$.' }; },
      function () { var r = R.int(2, 6), h = R.int(2, 5); return { t: 'The temperature has been dropping $' + r + '$ degrees every hour at a steady rate. How did the temperature $' + h + '$ hours ago compare with now? Give the change from now to then, in degrees (warmer is positive).', a: -r, b: -h, why: 'The rate is $-' + r + '$ degrees per hour, and ' + h + ' hours ago is time $-' + h + '$: $(-' + h + ') \\times (-' + r + ')$. Going back in time undoes the drops.' }; },
      function () { var r = R.int(5, 25), m = R.int(3, 8); return { t: 'A phone plan takes \\$' + r + ' out of an account each month. What is the change in the account after $' + m + '$ months, in dollars?', a: -r, b: m, why: 'Each month is a change of $-' + r + '$: $' + m + ' \\times (-' + r + ')$.' }; }
    ])();
    var pr = W.a * W.b;
    return {
      q: W.t,
      a: N(pr),
      steps: [W.why, '$' + sp(W.b) + ' \\times ' + sp(W.a) + ' = ' + pr + '$.', pr > 0 ? 'The answer is positive: ' + pr + ' degrees warmer then than now.' : 'The answer is negative because the amount goes down.'],
      hint: 'Write the rate as a signed number and multiply by the number of steps.',
      chk: { kind: 'expr', v: '(' + W.a + ')*(' + W.b + ')' }
    };
  });

  G('g7.divide-integers', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['div', 'frac', 'word', 'same'], BL(ctx, [6, 1, 1, 0], [3, 3, 2, 1], [2, 2, 3, 2]));
    var M = BL(ctx, 9, 12, 15);
    if (shape === 'same') {
      var n = R.int(2, 9), d = R.intNot(2, 9, n), g = U.gcd(n, d); n /= g; d /= g; if (d === 1) d = n + 1;
      var good = ['$\\frac{-' + n + '}{' + d + '}$', '$\\frac{' + n + '}{-' + d + '}$', '$-\\frac{' + n + '}{' + d + '}$'], bad = '$\\frac{-' + n + '}{-' + d + '}$';
      var ch = good.concat([bad]);
      return {
        q: 'Which of these is <b>not</b> equal to the other three?',
        a: { t: 'mc', choices: ch, v: 3 },
        steps: ['A fraction is a division. A negative divided by a positive is negative, and a positive divided by a negative is negative.', 'So $\\frac{-' + n + '}{' + d + '}$, $\\frac{' + n + '}{-' + d + '}$ and $-\\frac{' + n + '}{' + d + '}$ are all the same negative number.', '$\\frac{-' + n + '}{-' + d + '}$ has two negatives, so it is positive: $\\frac{' + n + '}{' + d + '}$.'],
        hint: 'Decide the sign of each one.',
        chk: { kind: 'none' }
      };
    }
    var a, b;
    do { b = R.nz(-M, M); a = b * R.nz(-M, M); } while (Math.abs(b) === 1 || (a > 0 && b > 0));
    var qt = a / b;
    if (shape === 'word') {
      var W = R.pick([
        function () { var r = R.int(2, 9), t = R.int(3, 8); return { t: 'A diver goes from the surface to $-' + r * t + '$ feet in $' + t + '$ minutes at a steady speed. What is the change in depth per minute, in feet?', a: -r * t, b: t }; },
        function () { var r = R.int(2, 6), t = R.int(3, 7); return { t: 'Over $' + t + '$ days, the price of a stock changed by $-\\$' + r * t + '$. It fell by the same amount each day. What was the change each day, in dollars?', a: -r * t, b: t }; },
        function () { var r = R.int(2, 5), t = R.int(4, 8); return { t: 'The temperature fell $' + r * t + '$ degrees in $' + t + '$ hours at a steady rate. What was the change per hour, in degrees?', a: -r * t, b: t }; }
      ])();
      return {
        q: W.t,
        a: N(W.a / W.b),
        steps: ['Write the total change as a signed number: $' + W.a + '$. Split it into $' + W.b + '$ equal parts.', '$' + W.a + ' \\div ' + W.b + ' = ' + (W.a / W.b) + '$: a negative divided by a positive is negative.', 'Check: $' + W.b + ' \\times ' + sp(W.a / W.b) + ' = ' + W.a + '$ ✓.'],
        hint: 'Divide the total change by the number of equal steps.',
        chk: { kind: 'expr', v: '(' + W.a + ')/(' + W.b + ')' }
      };
    }
    var tex = shape === 'frac' ? '\\frac{' + a + '}{' + b + '}' : a + ' \\div ' + sp(b);
    return {
      q: 'Find the value: $' + tex + '$',
      a: N(qt),
      steps: ['Divide the absolute values: $' + Math.abs(a) + ' \\div ' + Math.abs(b) + ' = ' + Math.abs(qt) + '$.', ((a < 0) === (b < 0) ? 'The signs are the same, so the quotient is positive' : 'The signs are different, so the quotient is negative') + ': $' + qt + '$.', 'Check with multiplication: $' + sp(b) + ' \\times ' + sp(qt) + ' = ' + a + '$ ✓.'],
      hint: 'Division uses the same sign rules as multiplication.',
      chk: { kind: 'expr', v: '(' + a + ')/(' + b + ')' }
    };
  });

  G('g7.multiply-divide-rationals', function (R, ctx) {
    var L = lv(ctx);
    var dec = R.chance(0.4), op = R.coin() ? '*' : '/', a, b;
    function sgn(x) { return R.coin() ? x.neg() : x; }
    if (dec) {
      a = q(R.pick(BL(ctx, ['0.5', '1.5', '2.5', '0.2', '1.2', '3.5'], ['0.5', '1.5', '2.5', '0.4', '1.2', '3.5', '0.25'], ['1.25', '0.75', '2.4', '0.06', '3.5', '4.8'])));
      b = q(R.pick(BL(ctx, [2, 3, 4, 6, 8], ['0.5', '0.2', 4, 6, '1.5', 8], ['0.5', '0.4', '1.5', '0.25', 12, '0.8'])));
      if (op === '/') { a = a.mul(b); } // keep quotients friendly
    } else {
      var d1 = R.int(2, 9), d2 = R.int(2, 9);
      a = q(R.int(1, d1 * (L === 3 ? 3 : 1))).div(d1); b = q(R.int(1, d2 * (L === 3 ? 2 : 1))).div(d2);
      if (L === 1) { if (R.coin()) a = q(R.pick([2, 3, 4, 6, 8, 9, 10, 12])); else b = q(R.pick([2, 3, 4, 5, 6])); }
      if (a.isInt() && b.isInt()) b = q(2).div(3);
    }
    a = sgn(a); b = sgn(b);
    if (a.sign() > 0 && b.sign() > 0) (R.coin() ? (a = a.neg()) : (b = b.neg()));
    var res = op === '*' ? a.mul(b) : a.div(b), f = dec ? dd : mx;
    var sym = op === '*' ? ' \\times ' : ' \\div ';
    var negRes = res.sign() < 0;
    var steps = ['Decide the sign first: ' + (a.sign() === b.sign() ? 'the signs are the same, so the answer is positive.' : 'the signs are different, so the answer is negative.')];
    if (dec) steps.push((op === '*' ? 'Multiply' : 'Divide') + ' the absolute values: $' + dd(a.abs()) + sym + dd(b.abs()) + ' = ' + dd(res.abs()) + '$.');
    else {
      var A = a.abs(), B = b.abs();
      if ((!A.isInt() && A.gt(1)) || (!B.isInt() && B.gt(1))) steps.push('Write mixed numbers as fractions: $' + im(A) + sym + im(B) + '$.');
      if (op === '/') steps.push('Dividing by $' + im(B) + '$ is multiplying by its reciprocal: $' + im(A) + ' \\times ' + im(B.inv()) + '$.');
      var B2 = op === '/' ? B.inv() : B;
      steps.push('Multiply the numerators and the denominators: $\\frac{' + A.n * B2.n + '}{' + A.d * B2.d + '} = ' + mx(res.abs()) + '$.');
    }
    steps.push('With the sign: $' + f(res) + '$.');
    return {
      q: 'Find the value: $' + f(a) + sym + pd(f(b)) + '$',
      a: NS(res, dec),
      steps: steps,
      hint: 'Use the same sign rules as for integers, then work with the absolute values.',
      chk: { kind: 'expr', v: '(' + a.toPlain() + ')' + op + '(' + b.toPlain() + ')' }
    };
  });

  G('g7.fractions-to-decimals', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['term', 'rep', 'round', 'which', 'neg'], BL(ctx, [5, 4, 0, 0, 2], [3, 3, 2, 2, 1], [2, 3, 2, 2, 2]));
    if (shape === 'term' || shape === 'neg') {
      var d = R.pick(BL(ctx, [2, 4, 5, 8, 10, 20, 25, 50], [8, 16, 20, 25, 40, 50], [8, 16, 32, 40, 80, 125])), n;
      do { n = R.int(1, d * (shape === 'neg' ? 3 : 1) - 1); } while (U.gcd(n, d) !== 1 && d > 2);
      if (U.gcd(n, d) !== 1) n = 1;
      var v = q(n).div(d), neg = shape === 'neg';
      var e = expand(v.n, v.d);
      return {
        q: R.pick(['Write $' + (neg ? '-' : '') + '\\frac{' + n + '}{' + d + '}$ as a decimal.', nm(R) + ' wants to type $' + (neg ? '-' : '') + '\\frac{' + n + '}{' + d + '}$ into a calculator as a decimal. What decimal is it?']),
        a: { t: 'num', v: (neg ? '-' : '') + dd(v), form: 'dec' },
        steps: ['A fraction is a division: $' + n + ' \\div ' + d + '$.', 'Divide until the remainder is $0$: $' + n + ' \\div ' + d + ' = ' + dd(v) + '$.', (neg ? 'Keep the negative sign: $-' + dd(v) + '$. ' : '') + 'The division ends, so this is a terminating decimal. (After simplifying, the denominator ' + d + ' has only 2s and 5s as prime factors.)'],
        hint: 'Divide the numerator by the denominator. Add zeros after the decimal point as you go.',
        chk: { kind: 'dec', n: (neg ? -n : n), d: d }
      };
    }
    if (shape === 'which') {
      var d2 = R.pick([6, 12, 15, 24, 30, 35, 18, 40, 25, 20, 9, 11]), n2 = R.int(1, d2 - 1), v2 = q(n2).div(d2);
      var ends = v2.isTerminating();
      return {
        q: 'Does $\\frac{' + n2 + '}{' + d2 + '}$ make a decimal that ends (terminates) or one that repeats forever?',
        a: mcFixed(['It terminates.', 'It repeats.'], ends ? 0 : 1),
        steps: [(v2.d !== BigInt(d2) ? 'Simplify first: $\\frac{' + n2 + '}{' + d2 + '} = ' + v2.toTex() + '$. ' : 'The fraction is already in lowest terms. ') + 'Look at the denominator, $' + v2.d + '$.',
          ends ? 'Its only prime factors are 2s and 5s, the factors of 10. So $' + v2.toTex() + '$ can be written over a power of 10, and the division ends: $' + dd(v2) + '$.' : 'It has a prime factor other than 2 or 5, so the remainders in long division can never reach 0. They must start repeating: $' + v2.toTex() + ' = ' + decTex(expand(v2.n, v2.d)) + '$.'],
        hint: 'Simplify the fraction, then look at the prime factors of the denominator.',
        chk: { kind: 'ends', n: n2, d: d2, v: ends }
      };
    }
    var dpool = BL(ctx, [3, 9, 11, 6], [3, 6, 9, 11, 12, 15], [7, 11, 12, 13, 27, 37, 6]), d3, n3;
    do { d3 = R.pick(dpool); n3 = R.int(1, d3 - 1); } while (U.gcd(n3, d3) !== 1 || q(n3).div(d3).isTerminating());
    var v3 = q(n3).div(d3), e3 = expand(n3, d3), good = decTex(e3);
    if (shape === 'round') {
      return {
        q: 'Write $\\frac{' + n3 + '}{' + d3 + '}$ as a decimal rounded to the nearest thousandth.',
        a: { t: 'num', v: v3.toDec(3), dp: 3 },
        steps: ['Divide: $' + n3 + ' \\div ' + d3 + ' = ' + good + '$, a repeating decimal.', 'Look at four places: $' + v3.toDec(6).slice(0, v3.toDec(6).indexOf('.') + 5) + '\\ldots$', 'Round to three places: $' + v3.toDec(3) + '$.'],
        hint: 'Divide to at least four decimal places, then round.',
        chk: { kind: 'round', n: n3, d: d3 }
      };
    }
    // repeating: choose the bar notation
    var digits = (e3.pre + e3.rep + e3.rep + e3.rep).slice(0, 4);
    var cands = [];
    cands.push(e3.int + '.' + (e3.pre + e3.rep + e3.rep).slice(0, Math.max(2, e3.pre.length + e3.rep.length)));           // stopped early
    cands.push(e3.int + '.' + (e3.pre + e3.rep + e3.rep).slice(0, 1));                                                     // one digit only
    if (e3.pre) cands.push(e3.int + '.\\overline{' + e3.pre + e3.rep + '}');                                               // bar too long
    else if (e3.rep.length > 1) cands.push(e3.int + '.' + e3.rep.charAt(0) + '\\overline{' + e3.rep.slice(1) + '}');       // bar too short
    if (e3.rep.length === 1 && !e3.pre) cands.push(e3.int + '.' + e3.rep + '\\overline{' + (+e3.rep + 1) % 10 + '}');
    cands.push(e3.int + '.\\overline{' + e3.rep.split('').reverse().join('') + (e3.rep.length === 1 ? (+e3.rep + 3) % 10 : '') + '}');
    // keep only values different from the right one and from each other
    function val(tex) { var m = /^(\d+)\.(\d*)(?:\\overline\{(\d+)\})?$/.exec(tex); return m ? decVal(m[1], m[2], m[3] || '') : null; }
    var seen = [v3], wrongs = [];
    cands.forEach(function (c) { var w = val(c); if (w && !seen.some(function (s) { return s.eq(w); })) { seen.push(w); wrongs.push('$' + c + '$'); } });
    return {
      q: 'Which decimal is equal to $\\frac{' + n3 + '}{' + d3 + '}$?',
      a: mcq('$' + good + '$', wrongs),
      steps: ['Divide $' + n3 + ' \\div ' + d3 + '$ with long division and watch the remainders.', 'The digits ' + (e3.pre ? 'start with ' + e3.pre + ', then ' : '') + 'repeat ' + e3.rep + ', ' + e3.rep + ', … because a remainder comes back, and from then on the division repeats.', 'A bar goes over the digits that repeat: $\\frac{' + n3 + '}{' + d3 + '} = ' + good + '$.', 'A decimal that stops, such as $' + e3.int + '.' + digits.slice(0, 2) + '$, is only an approximation.'],
      hint: 'Divide until a remainder repeats. The digits after that point repeat too.',
      chk: { kind: 'rep', n: n3, d: d3 }
    };
  });

  /* evaluate small expression trees with exact rationals and explain each step */
  G('g7.integer-operations', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['expr', 'word'], BL(ctx, [5, 1], [3, 2], [3, 2]));
    function z(lo, hi) { return R.nz(lo, hi); }
    if (shape === 'word') {
      var W = R.pick([
        function () { var s = -R.int(5, 20), r = R.int(2, 4), m = R.int(3, 6), up = R.int(3, 12); var fin = s - r * m + up; return { t: 'A diver starts at $' + s + '$ feet. She swims down $' + r + '$ feet per minute for $' + m + '$ minutes, then up $' + up + '$ feet. Where does she end, in feet?', v: fin, steps: ['Write it as one expression: $' + s + ' + ' + m + ' \\times (-' + r + ') + ' + up + '$.', 'Multiply first: $' + m + ' \\times (-' + r + ') = ' + (-r * m) + '$.', 'Then add from left to right: $' + s + ' + ' + sp(-r * m) + ' = ' + (s - r * m) + '$, and $' + (s - r * m) + ' + ' + up + ' = ' + fin + '$.'], chk: '(' + s + ')+' + m + '*(' + (-r) + ')+' + up }; },
        function () { var xs, t2 = 0; do { xs = [R.nz(-12, 6), R.nz(-12, 6), R.nz(-12, 6), R.nz(-12, 6)]; t2++; } while ((sum(xs) % 4 !== 0 || sum(xs) === 0) && t2 < 100); if (sum(xs) % 4 !== 0) xs = [-8, 2, -5, -1]; var m = sum(xs) / 4; return { t: 'The low temperatures for four days were $' + xs.join('^\\circ$, $') + '^\\circ$F. What was the mean (average) low temperature, in degrees?', v: m, steps: ['Add the four temperatures: $' + xs.map(function (x, i) { return i ? sp(x) : String(x); }).join(' + ') + ' = ' + sum(xs) + '$.', 'Divide by $4$: $' + sum(xs) + ' \\div 4 = ' + m + '$.'], chk: '(' + xs.join('+') + ')/4' }; },
        function () { var bal = R.int(20, 60), cost = R.int(6, 15), k = R.int(4, 9), dep = R.int(10, 40), who = nm(R); var fin = bal - k * cost + dep; return { t: who + '\'s account has \\$' + bal + '. ' + who + ' buys $' + k + '$ games at \\$' + cost + ' each, then deposits \\$' + dep + '. What is the balance now, in dollars? (It may be negative.)', v: fin, steps: ['Write one expression: $' + bal + ' - ' + k + ' \\times ' + cost + ' + ' + dep + '$.', 'Multiply first: $' + k + ' \\times ' + cost + ' = ' + k * cost + '$.', 'Then $' + bal + ' - ' + k * cost + ' = ' + (bal - k * cost) + '$, and $' + (bal - k * cost) + ' + ' + dep + ' = ' + fin + '$.'], chk: bal + '-' + k + '*' + cost + '+' + dep }; }
      ])();
      return { q: W.t, a: N(W.v), steps: W.steps, hint: 'Write the whole story as one expression, then multiply before you add.', chk: { kind: 'expr', v: W.chk } };
    }
    var tpl = R.pick(BL(ctx, ['a+b*c', 'a-b*c', '(a+b)*c', '(a-b)/c', 'a*b+c'], ['a-b*c', '(a-b)/c', 'a*b-c*d', 'a/b+c', '(a+b)*(c-d)', 'a-(b-c)'], ['a*(b-c)/d', '(a-b)*(c+d)', 'a*b-c*d', 'frac', 'dec']));
    var a = z(-12, 12), b = z(-9, 9), c = z(-9, 9), d = z(-6, 6), tex, steps = [], v, plainS;
    function Pn(x) { return sp(x); }
    if (tpl === 'a+b*c' || tpl === 'a-b*c') {
      var sg = tpl === 'a+b*c' ? 1 : -1, pr = b * c; v = a + sg * pr;
      tex = a + (sg > 0 ? ' + ' : ' - ') + Pn(b) + ' \\times ' + Pn(c);
      steps = ['Multiply before adding or subtracting: $' + Pn(b) + ' \\times ' + Pn(c) + ' = ' + pr + '$.', 'Now $' + a + (sg > 0 ? ' + ' : ' - ') + Pn(pr) + ' = ' + v + '$.'];
      plainS = '(' + a + ')' + (sg > 0 ? '+' : '-') + '(' + b + ')*(' + c + ')';
    } else if (tpl === '(a+b)*c') {
      v = (a + b) * c; tex = '(' + a + ' + ' + Pn(b) + ') \\times ' + Pn(c);
      steps = ['Parentheses first: $' + a + ' + ' + Pn(b) + ' = ' + (a + b) + '$.', 'Then multiply: $' + Pn(a + b) + ' \\times ' + Pn(c) + ' = ' + v + '$.'];
      plainS = '((' + a + ')+(' + b + '))*(' + c + ')';
    } else if (tpl === '(a-b)/c') {
      c = z(-6, 6); if (Math.abs(c) === 1) c = -2; var k = z(-8, 8); b = z(-12, 12); a = b + c * k; v = k;
      tex = '\\frac{' + a + ' - ' + Pn(b) + '}{' + c + '}';
      steps = ['The fraction bar groups the top: $' + a + ' - ' + Pn(b) + ' = ' + (a - b) + '$.', 'Divide: $' + (a - b) + ' \\div ' + Pn(c) + ' = ' + v + '$.'];
      plainS = '((' + a + ')-(' + b + '))/(' + c + ')';
    } else if (tpl === 'a*b+c') {
      v = a * b + c; tex = Pn(a) + ' \\times ' + Pn(b) + ' + ' + Pn(c);
      steps = ['Multiply first: $' + Pn(a) + ' \\times ' + Pn(b) + ' = ' + a * b + '$.', 'Then add: $' + a * b + ' + ' + Pn(c) + ' = ' + v + '$.'];
      plainS = '(' + a + ')*(' + b + ')+(' + c + ')';
    } else if (tpl === 'a*b-c*d') {
      v = a * b - c * d; tex = Pn(a) + ' \\times ' + Pn(b) + ' - ' + Pn(c) + ' \\times ' + Pn(d);
      steps = ['Do both products first: $' + Pn(a) + ' \\times ' + Pn(b) + ' = ' + a * b + '$ and $' + Pn(c) + ' \\times ' + Pn(d) + ' = ' + c * d + '$.', 'Subtract: $' + a * b + ' - ' + Pn(c * d) + ' = ' + v + '$.'];
      plainS = '(' + a + ')*(' + b + ')-(' + c + ')*(' + d + ')';
    } else if (tpl === 'a/b+c') {
      b = z(-6, 6); if (Math.abs(b) === 1) b = 3; a = b * z(-8, 8); v = a / b + c; tex = a + ' \\div ' + Pn(b) + ' + ' + Pn(c);
      steps = ['Divide first: $' + a + ' \\div ' + Pn(b) + ' = ' + a / b + '$.', 'Then add: $' + a / b + ' + ' + Pn(c) + ' = ' + v + '$.'];
      plainS = '(' + a + ')/(' + b + ')+(' + c + ')';
    } else if (tpl === '(a+b)*(c-d)') {
      v = (a + b) * (c - d); tex = '(' + a + ' + ' + Pn(b) + ')(' + c + ' - ' + Pn(d) + ')';
      steps = ['Work inside each set of parentheses: $' + a + ' + ' + Pn(b) + ' = ' + (a + b) + '$ and $' + c + ' - ' + Pn(d) + ' = ' + (c - d) + '$.', 'Multiply: $' + Pn(a + b) + ' \\times ' + Pn(c - d) + ' = ' + v + '$.'];
      plainS = '((' + a + ')+(' + b + '))*((' + c + ')-(' + d + '))';
    } else if (tpl === 'a-(b-c)') {
      v = a - (b - c); tex = a + ' - (' + b + ' - ' + Pn(c) + ')';
      steps = ['Parentheses first: $' + b + ' - ' + Pn(c) + ' = ' + (b - c) + '$.', 'Then $' + a + ' - ' + Pn(b - c) + ' = ' + a + ' + ' + Pn(-(b - c)) + ' = ' + v + '$.'];
      plainS = '(' + a + ')-((' + b + ')-(' + c + '))';
    } else if (tpl === 'a*(b-c)/d') {
      d = z(-6, 6); if (Math.abs(d) === 1) d = -2; var kk = z(-6, 6); a = z(-5, 5); b = c + d * kk; if (a === 0) a = 2;
      v = a * (b - c) / d; tex = '\\frac{' + Pn(a) + '(' + b + ' - ' + Pn(c) + ')}{' + d + '}';
      steps = ['Parentheses first: $' + b + ' - ' + Pn(c) + ' = ' + (b - c) + '$.', 'Multiply on top: $' + Pn(a) + ' \\times ' + Pn(b - c) + ' = ' + a * (b - c) + '$.', 'Divide: $' + a * (b - c) + ' \\div ' + Pn(d) + ' = ' + v + '$.'];
      plainS = '(' + a + ')*((' + b + ')-(' + c + '))/(' + d + ')';
    } else if (tpl === '(a-b)*(c+d)') {
      v = (a - b) * (c + d); tex = '(' + a + ' - ' + Pn(b) + ')(' + c + ' + ' + Pn(d) + ')';
      steps = ['Inside each set of parentheses: $' + a + ' - ' + Pn(b) + ' = ' + (a - b) + '$ and $' + c + ' + ' + Pn(d) + ' = ' + (c + d) + '$.', 'Multiply: $' + Pn(a - b) + ' \\times ' + Pn(c + d) + ' = ' + v + '$.'];
      plainS = '((' + a + ')-(' + b + '))*((' + c + ')+(' + d + '))';
    } else if (tpl === 'frac') {
      var f1 = q(R.pick([1, -1])).div(R.pick([2, 3, 4])), m1 = R.int(-10, 10), m2 = R.intNot(-10, 10, m1);
      if (!q(m1 - m2).mul(f1).isInt()) m2 = m1 - Number(f1.d) * R.nz(-3, 3);
      var r1 = f1.mul(m1 - m2); v = r1;
      tex = mx(f1) + '(' + m1 + ' - ' + Pn(m2) + ')';
      steps = ['Parentheses first: $' + m1 + ' - ' + Pn(m2) + ' = ' + (m1 - m2) + '$.', 'Multiply: $' + mx(f1) + ' \\times ' + Pn(m1 - m2) + ' = ' + mx(r1) + '$.'];
      plainS = '(' + f1.toPlain() + ')*((' + m1 + ')-(' + m2 + '))';
    } else {
      var x1 = q(R.pick(['-1.5', '2.5', '-0.5', '-2.4', '1.2'])), x2 = R.nz(-8, 8), x3 = q(R.pick(['3.25', '-1.75', '0.5', '-4.5']));
      v = x1.mul(x2).add(x3); tex = dd(x1) + ' \\times ' + Pn(x2) + ' + ' + pd(dd(x3));
      steps = ['Multiply first: $' + dd(x1) + ' \\times ' + Pn(x2) + ' = ' + dd(x1.mul(x2)) + '$.', 'Then add: $' + dd(x1.mul(x2)) + ' + ' + pd(dd(x3)) + ' = ' + dd(v) + '$.'];
      plainS = '(' + x1.toPlain() + ')*(' + x2 + ')+(' + x3.toPlain() + ')';
      return { q: 'Find the value: $' + tex + '$', a: ND(v), steps: steps, hint: 'Multiply before you add, and watch the signs.', chk: { kind: 'expr', v: plainS } };
    }
    return {
      q: 'Find the value: $' + tex + '$',
      a: N(v),
      steps: steps,
      hint: 'Use the order of operations: parentheses, then multiply and divide, then add and subtract. Apply the sign rule that fits each operation.',
      chk: { kind: 'expr', v: plainS }
    };
  });
  /* ============================================================ Unit 5: Expressions */

  /* plain (CAS) syntax for a sum of terms [[coef (Q or number), 'x'], [c, '']] */
  function pterms(list, dec) {
    var s = '';
    list.forEach(function (t) {
      var c = q(t[0]), v = t[1] || ''; if (c.isZero()) return;
      var neg = c.sign() < 0, a = c.abs(), mag = a.isInt() ? a.toString() : (dec && a.isTerminating() ? dd(a) : '(' + a.toPlain() + ')');
      var term = v ? (a.eq(1) ? v : mag + '*' + v) : mag;
      s += s ? (neg ? '-' : '+') + term : (neg ? '-' : '') + term;
    });
    return s || '0';
  }
  /* TeX for a sum of terms with coefficients shown as decimals (dec) or fractions */
  function tterms(list, dec) {
    return T.terms(list.map(function (t) { var c = q(t[0]); return [dec && c.isTerminating() ? Number(dd(c)) : c, t[1]]; }));
  }
  function coefTex(c, dec) { c = q(c); return dec && c.isTerminating() ? dd(c) : mx(c); }

  G('g7.combine-like-terms', function (R, ctx) {
    var L = lv(ctx);
    var dec = L === 3 && R.coin(), frac = L === 3 && !dec, vars = L >= 2 && R.chance(0.4) ? ['x', 'y'] : ['x'];
    function coef() {
      if (dec) return q(R.pick(['0.5', '1.5', '2.5', '0.4', '1.2', '3', '0.75', '2'])).mul(R.sign());
      if (frac) return q(R.pick([1, 2, 3, 5])).div(R.pick([2, 3, 4, 6])).mul(R.sign());
      return q(R.nz(-9, 9));
    }
    var terms, totals, tries = 0, nx = L === 1 ? 2 : 3;
    do {
      terms = [];
      for (var i = 0; i < nx; i++) terms.push([coef(), 'x']);
      if (vars.length > 1) { terms.push([coef(), 'y']); terms.push([coef(), 'y']); }
      terms.push([q(R.nz(-12, 12)), '']); if (L >= 2) terms.push([q(R.nz(-9, 9)), '']);
      if (frac) terms[terms.length - 1][0] = q(R.nz(-5, 5)).div(R.pick([2, 3, 4]));
      terms = R.shuffle(terms);
      totals = {};
      terms.forEach(function (t) { totals[t[1]] = (totals[t[1]] || q(0)).add(t[0]); });
      tries++;
    } while (tries < 30 && (totals.x.isZero() || (totals.y && totals.y.isZero())));
    var order = vars.concat(['']), res = order.map(function (v) { return [totals[v] || q(0), v]; });
    var steps = ['Like terms have the same variable part. Group them: ' + order.map(function (v) {
      var grp = terms.filter(function (t) { return t[1] === v; });
      if (!grp.length) return '';
      return (v ? 'the $' + v + '$-terms ' : 'the constants ') + '$' + grp.map(function (t, i) { return i ? T.coef(dec ? Number(dd(t[0])) : t[0], v, false) : T.coef(dec ? Number(dd(t[0])) : t[0], v, true); }).join('') + '$';
    }).filter(Boolean).join(', and ') + '.'];
    order.forEach(function (v) {
      var grp = terms.filter(function (t) { return t[1] === v; }); if (grp.length < 2) return;
      steps.push('Add the coefficients of the ' + (v ? '$' + v + '$-terms' : 'constants') + ': $' + grp.map(function (t, i) { return i ? ' + ' + pd(coefTex(t[0], dec)) : coefTex(t[0], dec); }).join('') + ' = ' + coefTex(totals[v], dec) + '$' + (v ? ', so they make $' + T.mono(dec ? Number(dd(totals[v])) : totals[v], v) + '$.' : '.'));
    });
    steps.push('Result: $' + tterms(res, dec) + '$. The $x$-terms and the constants stay separate: they are unlike terms.');
    return {
      q: 'Simplify by combining like terms:' + (terms.length > 4 ? ' $$' + tterms(terms, dec) + '$$' : ' $' + tterms(terms, dec) + '$'),
      a: X(pterms(res, dec), { form: 'simplified', vars: vars }),
      steps: steps,
      hint: 'Add the coefficients of the x-terms' + (vars.length > 1 ? ', then of the y-terms,' : '') + ' and add the constants separately.',
      chk: { kind: 'equiv', a: pterms(terms), vars: vars }
    };
  });

  G('g7.expand-factor-linear', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['expand', 'negate', 'factor'], BL(ctx, [5, 2, 3], [4, 2, 4], [4, 1, 5]));
    var dec = false, a, b, c;
    if (shape === 'expand') {
      if (L === 3 && R.coin()) { var fr = q(R.pick(['1/2', '3/4', '2/3', '-1/2', '-3/4', '-2/5'])), dn = Number(fr.d); a = fr; b = q(dn * R.int(1, 3)); c = q(dn * R.nz(-4, 4)); }
      else if (L === 3) { dec = true; a = q(R.pick(['0.5', '1.5', '-0.5', '2.5', '-1.5'])); b = q(R.int(2, 6) * 2); c = q(R.nz(-8, 8) * 2); }
      else { a = q(L === 1 ? R.int(2, 9) * (R.chance(0.3) ? -1 : 1) : R.nz(-9, 9)); if (a.abs().eq(1)) a = q(-4); b = q(R.int(1, 6)); c = q(R.nz(-9, 9)); }
      var inner = tterms([[b, 'x'], [c, '']], dec), ab = a.mul(b), ac = a.mul(c);
      return {
        q: 'Expand (use the distributive property): $' + coefTex(a, dec) + '(' + inner + ')$',
        a: X(pterms([[ab, 'x'], [ac, '']], dec), { form: 'expanded' }),
        steps: ['Multiply each term inside by $' + coefTex(a, dec) + '$: $' + coefTex(a, dec) + ' \\times ' + T.mono(dec ? Number(dd(b)) : b, 'x') + ' = ' + T.mono(dec ? Number(dd(ab)) : ab, 'x') + '$ and $' + coefTex(a, dec) + ' \\times ' + pd(coefTex(c, dec)) + ' = ' + coefTex(ac, dec) + '$.', 'Put them together: $' + tterms([[ab, 'x'], [ac, '']], dec) + '$.'].concat(a.sign() < 0 ? ['A negative number outside changes the sign of <b>every</b> term inside.'] : []),
        hint: 'Multiply the number outside by both terms inside, keeping track of signs.',
        chk: { kind: 'equiv', a: '(' + a.toPlain() + ')*(' + pterms([[b, 'x'], [c, '']]) + ')', vars: ['x'] }
      };
    }
    if (shape === 'negate') {
      b = q(R.int(1, 5)); c = q(R.nz(-9, 9));
      return {
        q: 'Expand: $-(' + tterms([[b, 'x'], [c, '']]) + ')$',
        a: X(pterms([[b.neg(), 'x'], [c.neg(), '']]), { form: 'expanded' }),
        steps: ['The minus sign in front means $-1$ times the whole group: $-1(' + tterms([[b, 'x'], [c, '']]) + ')$.', 'Multiply each term by $-1$: $' + T.mono(b.neg(), 'x') + '$ and $' + mx(c.neg()) + '$.', 'Result: $' + tterms([[b.neg(), 'x'], [c.neg(), '']]) + '$. Both signs change, not just the first one.'],
        hint: 'Change the sign of every term inside the parentheses.',
        chk: { kind: 'equiv', a: '-(' + pterms([[b, 'x'], [c, '']]) + ')', vars: ['x'] }
      };
    }
    // factor: fill in the parentheses
    var g, bb, cc;
    if (L === 3 && R.coin()) {
      g = q(1).div(R.pick([2, 3, 4])); bb = q(1); cc = q(R.nz(-9, 9));
      var lhs = [[g, 'x'], [g.mul(cc), '']];
      return {
        q: 'Fill in the box so the two sides are equal: $' + tterms(lhs) + ' = ' + mx(g) + '(\\square)$',
        a: X(pterms([[bb, 'x'], [cc, '']]), { form: 'expanded' }),
        steps: ['Divide each term by $' + mx(g) + '$ (multiply by $' + mx(g.inv()) + '$): $' + T.mono(g, 'x') + ' \\div ' + mx(g) + ' = x$ and $' + mx(g.mul(cc)) + ' \\div ' + mx(g) + ' = ' + mx(cc) + '$.', 'So $' + tterms(lhs) + ' = ' + mx(g) + '(' + tterms([[bb, 'x'], [cc, '']]) + ')$.', 'Check by expanding: $' + mx(g) + ' \\times x + ' + mx(g) + ' \\times ' + pd(mx(cc)) + '$ gives back the left side ✓.'],
        hint: 'Ask: what times ' + g.toPlain() + ' gives each term?',
        chk: { kind: 'fill', lhs: pterms(lhs), g: g.toPlain() }
      };
    }
    do { bb = R.int(1, 7); cc = R.nz(-9, 9); } while (U.gcd(bb, Math.abs(cc)) !== 1);
    g = R.int(2, 8) * (L >= 2 && R.chance(0.4) ? -1 : 1);
    var L1 = [[g * bb, 'x'], [g * cc, '']];
    return {
      q: 'Factor: fill in the box so the two sides are equal. $' + tterms(L1) + ' = ' + g + '(\\square)$',
      a: X(pterms([[bb, 'x'], [cc, '']]), { form: 'expanded' }),
      steps: ['Divide each term by $' + g + '$: $' + T.mono(g * bb, 'x') + ' \\div ' + sp(g) + ' = ' + T.mono(bb, 'x') + '$ and $' + (g * cc) + ' \\div ' + sp(g) + ' = ' + cc + '$.', 'So $' + tterms(L1) + ' = ' + g + '(' + tterms([[bb, 'x'], [cc, '']]) + ')$.', 'Check by expanding: $' + g + ' \\times ' + T.mono(bb, 'x') + ' = ' + T.mono(g * bb, 'x') + '$ and $' + g + ' \\times ' + sp(cc) + ' = ' + g * cc + '$ ✓.' + (g < 0 ? ' Factoring out a negative flips the sign of every term inside.' : '')],
      hint: 'Divide each term on the left by ' + g + '.',
      chk: { kind: 'fill', lhs: pterms(L1), g: String(g) }
    };
  });

  G('g7.add-subtract-expressions', function (R, ctx) {
    var L = lv(ctx);
    var dec = L === 3 && R.coin(), frac = L === 3 && !dec;
    function cf() { if (dec) return q(R.pick(['0.5', '1.5', '2.5', '1.2', '3.4', '0.8'])).mul(R.sign()); if (frac) return q(R.int(1, 5)).div(R.pick([2, 3, 4])).mul(R.sign()); return q(R.nz(-9, 9)); }
    var A = [cf(), q(R.nz(-12, 12))], B = [cf(), q(R.nz(-12, 12))];
    var op = L === 1 ? (R.chance(0.4) ? '+' : '-') : '-';
    if (L >= 2 && R.chance(0.25)) op = '+';
    var res = [op === '+' ? A[0].add(B[0]) : A[0].sub(B[0]), op === '+' ? A[1].add(B[1]) : A[1].sub(B[1])];
    if (res[0].isZero()) { B[0] = B[0].add(1); res[0] = op === '+' ? A[0].add(B[0]) : A[0].sub(B[0]); }
    var tA = tterms([[A[0], 'x'], [A[1], '']], dec), tB = tterms([[B[0], 'x'], [B[1], '']], dec);
    var phr = L === 3 && op === '-' && R.coin();
    var qs = phr ? 'Subtract $(' + tB + ')$ from $(' + tA + ')$. Simplify.' : 'Simplify: $(' + tA + ')' + (op === '+' ? ' + ' : ' - ') + '(' + tB + ')$';
    var negB = [[B[0].neg(), 'x'], [B[1].neg(), '']];
    var steps = op === '+' ? ['Adding a group adds each term: $' + tA + T.coef(dec ? Number(dd(B[0])) : B[0], 'x', false) + T.coef(dec ? Number(dd(B[1])) : B[1], '', false) + '$.']
      : (phr ? ['"Subtract $B$ from $A$" means $A - B$: $(' + tA + ') - (' + tB + ')$.'] : []).concat(['Subtracting a group subtracts <b>every</b> term in it, so change both signs: $-(' + tB + ') = ' + tterms(negB, dec) + '$.', 'Now add: $' + tA + T.coef(dec ? Number(dd(B[0].neg())) : B[0].neg(), 'x', false) + T.coef(dec ? Number(dd(B[1].neg())) : B[1].neg(), '', false) + '$.']);
    steps.push('Combine like terms: $' + tterms([[res[0], 'x'], [res[1], '']], dec) + '$.');
    return {
      q: qs,
      a: X(pterms([[res[0], 'x'], [res[1], '']], dec), { form: 'expanded' }),
      steps: steps,
      hint: op === '-' ? 'The minus sign applies to both terms in the second group.' : 'Drop the parentheses and combine like terms.',
      chk: { kind: 'equiv', a: '(' + pterms([[A[0], 'x'], [A[1], '']]) + ')' + op + '(' + pterms([[B[0], 'x'], [B[1], '']]) + ')', vars: ['x'] }
    };
  });

  G('g7.rewrite-to-see-meaning', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['combine', 'choose', 'percent', 'group'], BL(ctx, [3, 3, 2, 0], [3, 3, 3, 2], [2, 3, 3, 3]));
    var up = R.coin(), p = R.pick(up ? [3, 5, 6, 8, 10, 15, 20, 25, 40] : [5, 10, 15, 20, 25, 30, 40]), v = R.pick(['a', 'p', 'c', 'x']);
    var m = q(100 + (up ? p : -p)).div(100), pd2 = dd(q(p).div(100));
    if (shape === 'combine') {
      return {
        q: 'Write $' + v + (up ? ' + ' : ' - ') + pd2 + v + '$ as a single term.',
        a: X(dd(m) + '*' + v, { form: 'simplified', vars: [v] }),
        steps: ['$' + v + '$ is the same as $1' + v + '$.', '$1' + v + (up ? ' + ' : ' - ') + pd2 + v + ' = (1' + (up ? ' + ' : ' - ') + pd2 + ')' + v + ' = ' + dd(m) + v + '$.', 'Meaning: ' + (up ? 'adding $' + p + '\\%$ of an amount is the same as taking $' + (100 + p) + '\\%$ of it.' : 'taking away $' + p + '\\%$ of an amount leaves $' + (100 - p) + '\\%$ of it.')],
        hint: 'Write ' + v + ' as 1' + v + ' and combine like terms.', nolint: ['1x'],
        chk: { kind: 'equiv', a: v + (up ? '+' : '-') + pd2 + '*' + v, vars: [v] }
      };
    }
    if (shape === 'choose') {
      var good = '$' + dd(m) + 'p$', bads = ['$p ' + (up ? '+' : '-') + ' ' + p + '$', '$' + pd2 + 'p$', '$' + dd(q(100 + (up ? -p : p)).div(100)) + 'p$'];
      if (p === 10 && up) bads[1] = '$0.1p$';
      return {
        q: 'An item costs $p$ dollars. Its price ' + (up ? 'goes up' : 'goes down') + ' by $' + p + '\\%$. Which expression gives the new price?',
        a: mcq(good, bads),
        steps: ['The change is $' + p + '\\%$ of $p$, which is $' + pd2 + 'p$.', 'New price: $p ' + (up ? '+' : '-') + ' ' + pd2 + 'p = ' + dd(m) + 'p$.', '$p ' + (up ? '+' : '-') + ' ' + p + '$ would change the price by $' + p + '$ dollars, not by $' + p + '\\%$.'],
        hint: 'Write the change as a decimal times p, then combine with p.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'percent') {
      return {
        q: 'A store writes the new price of every item as $' + dd(m) + 'p$, where $p$ is the old price. By what percent did the prices ' + (up ? 'increase' : 'decrease') + '?',
        a: N(p, { pct: true }),
        steps: ['$' + dd(m) + 'p$ means the new price is $' + dd(m.mul(100)) + '\\%$ of the old price.', 'Compare with $100\\%$: ' + (up ? '$' + dd(m.mul(100)) + '\\% - 100\\% = ' + p + '\\%$ more.' : '$100\\% - ' + dd(m.mul(100)) + '\\% = ' + p + '\\%$ less.'), 'Rewritten: $' + dd(m) + 'p = p ' + (up ? '+' : '-') + ' ' + pd2 + 'p$, a ' + p + '% ' + (up ? 'increase' : 'decrease') + '.'],
        hint: 'Compare the multiplier with 1 (100%).',
        chk: { kind: 'val', v: String(p) }
      };
    }
    var k = R.int(3, 6), s = R.pick([2, 3, 4, 5]), who = nm(R);
    var goodG = '$' + k + 'x + ' + k * s + '$', badG = ['$' + k + 'x + ' + s + '$', '$x + ' + k * s + '$', '$' + (k + s) + 'x$'];
    return {
      q: who + ' and ' + (k - 1) + ' friends each buy a ticket for $x$ dollars and a snack for \\$' + s + '. The total is $' + k + '(x + ' + s + ')$. Which expression is equal to it?',
      a: mcq(goodG, badG),
      steps: ['Distribute: $' + k + '(x + ' + s + ') = ' + k + 'x + ' + k * s + '$.', 'Both forms tell a story: $' + k + '(x + ' + s + ')$ says "' + k + ' people each pay $x + ' + s + '$", and $' + k + 'x + ' + k * s + '$ says "all the tickets cost $' + k + 'x$ and all the snacks cost $' + k * s + '$".'],
      hint: 'Multiply ' + k + ' by both terms in the parentheses.',
      chk: { kind: 'none' }
    };
  });
  /* ============================================================ Unit 6: Equations and inequalities */

  G('g7.one-step-rational', function (R, ctx) {
    var L = lv(ctx);
    var kind = R.pick(['add', 'sub', 'mul', 'div']), dec = L === 2, frac = L === 3 && (kind === 'mul' || R.chance(0.3));
    var x, a, tex, steps, f = dec ? dd : mx;
    if (frac && kind === 'mul') {
      var c = q(R.pick([1, 2, 3, 4, 5])).div(R.pick([2, 3, 4, 5, 6])).mul(R.sign()); if (c.abs().eq(1)) c = q(-2).div(3);
      x = q(Number(c.d) * R.nz(-6, 6)); var r = c.mul(x);
      tex = T.coef(c, 'x') + ' = ' + mx(r);
      steps = ['$x$ is multiplied by $' + mx(c) + '$. Undo it by multiplying both sides by the reciprocal, $' + mx(c.inv()) + '$ (keep the sign).', '$x = ' + mx(r) + ' \\times ' + pd(mx(c.inv())) + ' = ' + mx(x) + '$.', 'Check: $' + mx(c) + ' \\times ' + pd(mx(x)) + ' = ' + mx(r) + '$ ✓.'];
      return { q: 'Solve for $x$: $' + tex + '$', a: N(x), steps: steps, hint: 'Multiply both sides by the reciprocal of ' + c.toPlain() + '.', chk: { kind: 'solve', eq: '(' + c.toPlain() + ')*x=' + r.toPlain() } };
    }
    if (dec) { x = q(R.real(-9, 9, 1)); a = q(R.pick(['1.5', '2.5', '4.5', '0.5', '3.2', '6.4', '2', '4']).replace(/^/, R.coin() ? '-' : '')); }
    else if (frac) { x = q(R.nz(-12, 12)).div(R.pick([2, 3, 4])); a = q(R.nz(-9, 9)).div(R.pick([2, 3, 4, 6])); }
    else { x = q(R.nz(-15, 15)); a = q(R.nz(-12, 12)); }
    if (x.isZero()) x = q(-3);
    if (kind === 'add' || kind === 'sub') {
      var rhs = kind === 'add' ? x.add(a) : x.sub(a);
      tex = 'x ' + (kind === 'add' ? '+' : '-') + ' ' + pd(f(a)) + ' = ' + f(rhs);
      steps = [kind === 'add' ? 'Undo adding $' + f(a) + '$ by subtracting $' + f(a) + '$ from both sides.' : 'Undo subtracting $' + f(a) + '$ by adding $' + f(a) + '$ to both sides.',
        '$x = ' + f(rhs) + (kind === 'add' ? ' - ' : ' + ') + pd(f(a)) + ' = ' + f(x) + '$.', 'Check: $' + f(x) + (kind === 'add' ? ' + ' : ' - ') + pd(f(a)) + ' = ' + f(rhs) + '$ ✓.'];
      return { q: 'Solve for $x$: $' + tex + '$', a: NS(x, dec), steps: steps, hint: 'Do the opposite operation to both sides.', chk: { kind: 'solve', eq: 'x' + (kind === 'add' ? '+' : '-') + '(' + a.toPlain() + ')=' + rhs.toPlain() } };
    }
    // multiply or divide by an integer or decimal
    var m = q(dec ? R.pick(['-2', '-4', '0.5', '-0.5', '1.5', '-2.5', '4']) : R.nz(-9, 9)); if (m.abs().eq(1)) m = q(-3);
    if (kind === 'mul') {
      var pr = m.mul(x);
      tex = T.coef(dec ? Number(dd(m)) : m, 'x') + ' = ' + f(pr);
      steps = ['$x$ is multiplied by $' + f(m) + '$. Undo it by dividing both sides by $' + f(m) + '$, sign and all.', '$x = ' + f(pr) + ' \\div ' + pd(f(m)) + ' = ' + f(x) + '$.', 'Check: $' + f(m) + ' \\times ' + pd(f(x)) + ' = ' + f(pr) + '$ ✓.'];
      return { q: 'Solve for $x$: $' + tex + '$', a: NS(x, dec), steps: steps, hint: 'Divide both sides by ' + m.toPlain().replace(/^(-?\d+)$/, '$1') + ', including its sign.', chk: { kind: 'solve', eq: '(' + m.toPlain() + ')*x=' + pr.toPlain() } };
    }
    if (dec) m = q(R.pick([-2, -4, 5, -5, 3, -10]));
    if (!dec && !frac) x = m.mul(R.nz(-9, 9));
    var quo = x.div(m);
    tex = '\\frac{x}{' + f(m) + '} = ' + f(quo);
    if (dec && !quo.isTerminating()) { quo = q(R.real(-5, 5, 1)); if (quo.isZero()) quo = q('-1.5'); x = quo.mul(m); tex = '\\frac{x}{' + f(m) + '} = ' + f(quo); }
    steps = ['$x$ is divided by $' + f(m) + '$. Undo it by multiplying both sides by $' + f(m) + '$.', '$x = ' + f(quo) + ' \\times ' + pd(f(m)) + ' = ' + f(x) + '$.', 'Check: $' + f(x) + ' \\div ' + pd(f(m)) + ' = ' + f(quo) + '$ ✓.'];
    return { q: 'Solve for $x$: $' + tex + '$', a: NS(x, dec), steps: steps, hint: 'Multiply both sides by ' + m.toPlain() + '.', chk: { kind: 'solve', eq: 'x/(' + m.toPlain() + ')=' + quo.toPlain() } };
  });

  /* px + q = r */
  function twoStep(R, ctx) {
    var L = lv(ctx), p, x, qq, f = mx, dec = false, form = 'lin';
    if (L === 1) { p = q(R.int(2, 9)); x = q(R.int(-6, 12)); qq = q(R.nz(-15, 15)); }
    else if (L === 2) { p = q(R.nz(-9, 9)); x = q(R.nz(-10, 10)); qq = q(R.nz(-20, 20)); if (R.chance(0.35)) { form = 'div'; p = q(R.pick([2, 3, 4, 5, -2, -3])); x = p.mul(R.nz(-6, 6)); } }
    else if (R.coin()) { dec = true; f = dd; p = q(R.pick(['0.5', '1.5', '2.5', '-0.5', '0.2', '-1.5'])); x = q(R.nz(-8, 12)); qq = q(R.pick(['1.2', '-3.5', '4.25', '-2.6', '6'])); }
    else { p = q(R.pick(['2/3', '3/4', '-1/2', '3/5', '-2/3'])); x = q(Number(p.d) * R.nz(-5, 6)); qq = q(R.nz(-12, 12)); }
    if (p.abs().eq(1)) p = q(4);
    if (form !== 'div' && qq === undefined) qq = q(R.nz(-10, 10));
    if (form === 'div') qq = q(R.nz(-12, 12));
    var lhsX = form === 'div' ? p.inv().mul(x) : p.mul(x), r = lhsX.add(qq);
    var lhs = form === 'div' ? '\\frac{x}{' + mx(p) + '}' + T.signed(qq) : T.coef(dec ? Number(dd(p)) : p, 'x') + T.signed(dec ? Number(dd(qq)) : qq);
    var steps = ['Undo the ' + (qq.sign() > 0 ? 'addition' : 'subtraction') + ' first: ' + (qq.sign() > 0 ? 'subtract $' + f(qq) + '$ from' : 'add $' + f(qq.abs()) + '$ to') + ' both sides. ' + (form === 'div' ? '$\\frac{x}{' + mx(p) + '}' : '$' + T.coef(dec ? Number(dd(p)) : p, 'x')) + ' = ' + f(r) + (qq.sign() > 0 ? ' - ' + f(qq) : ' + ' + f(qq.abs())) + ' = ' + f(lhsX) + '$.'];
    if (form === 'div') steps.push('Undo dividing by $' + mx(p) + '$: multiply both sides by $' + mx(p) + '$. $x = ' + f(lhsX) + ' \\times ' + pd(mx(p)) + ' = ' + mx(x) + '$.');
    else if (!p.isInt() && !dec) steps.push('Undo multiplying by $' + mx(p) + '$: multiply both sides by the reciprocal, $' + mx(p.inv()) + '$. $x = ' + mx(lhsX) + ' \\times ' + pd(mx(p.inv())) + ' = ' + mx(x) + '$.');
    else steps.push('Undo multiplying by $' + f(p) + '$: divide both sides by $' + f(p) + '$. $x = ' + f(lhsX) + ' \\div ' + pd(f(p)) + ' = ' + f(x) + '$.');
    steps.push('Check: put $x = ' + f(x) + '$ back in. ' + (form === 'div' ? '$' + pd(f(x)) + ' \\div ' + pd(mx(p)) : '$' + f(p) + ' \\times ' + pd(f(x))) + T.signed(dec ? Number(dd(qq)) : qq) + ' = ' + f(r) + '$ ✓.');
    return { p: p, x: x, qq: qq, r: r, lhs: lhs, f: f, dec: dec, form: form, steps: steps };
  }
  G('g7.two-step-equations', function (R, ctx) {
    var E = twoStep(R, ctx);
    return {
      q: 'Solve for $x$: $' + E.lhs + ' = ' + E.f(E.r) + '$',
      a: NS(E.x, E.dec),
      steps: E.steps,
      hint: 'Undo the adding or subtracting first, then undo the multiplying or dividing.',
      chk: { kind: 'solve', eq: (E.form === 'div' ? 'x/(' + E.p.toPlain() + ')' : '(' + E.p.toPlain() + ')*x') + '+(' + E.qq.toPlain() + ')=' + E.r.toPlain() }
    };
  });

  G('g7.equations-with-parentheses', function (R, ctx) {
    var L = lv(ctx), p, x, c, frac = false, dec = false;
    if (L === 1) { p = q(R.int(2, 9)); x = q(R.int(-5, 12)); c = q(R.nz(-9, 9)); }
    else if (L === 2) { p = q(R.nz(-9, 9)); if (p.abs().eq(1)) p = q(-4); x = q(R.nz(-12, 12)); c = q(R.nz(-12, 12)); }
    else if (R.coin()) { frac = true; p = q(R.pick(['1/2', '3/4', '2/3', '-1/2', '2/5', '-3/4'])); c = q(R.nz(-9, 9)); x = q(Number(p.d) * R.nz(-4, 6)).sub(c); }
    else { dec = true; p = q(R.pick(['0.5', '1.5', '2.5', '-0.5', '1.2'])); x = q(R.nz(-8, 10)); c = q(R.nz(-6, 6)); }
    if (x.add(c).isZero()) x = x.add(Number(p.d) * 2);
    var r = p.mul(x.add(c)), f = dec ? dd : mx;
    var ptex = dec ? dd(p) : mx(p);
    var tex = ptex + '(' + T.lin(1, 'x', c) + ') = ' + f(r);
    var steps, div = (p.isInt() && r.div(p).isInt()) || frac;
    if (frac) steps = ['Undo multiplying by $' + ptex + '$ first: multiply both sides by the reciprocal $' + mx(p.inv()) + '$. $x' + T.signed(c) + ' = ' + mx(r) + ' \\times ' + pd(mx(p.inv())) + ' = ' + mx(x.add(c)) + '$.', 'Undo the ' + (c.sign() > 0 ? 'adding' : 'subtracting') + ': $x = ' + mx(x.add(c)) + (c.sign() > 0 ? ' - ' + mx(c) : ' + ' + mx(c.abs())) + ' = ' + mx(x) + '$.'];
    else if (div) steps = ['The whole group $(' + T.lin(1, 'x', c) + ')$ is multiplied by $' + ptex + '$. Divide both sides by $' + ptex + '$ first: $x' + T.signed(c) + ' = ' + f(r) + ' \\div ' + pd(ptex) + ' = ' + f(x.add(c)) + '$.', 'Undo the ' + (c.sign() > 0 ? 'adding' : 'subtracting') + ': $x = ' + f(x.add(c)) + (c.sign() > 0 ? ' - ' + f(c) : ' + ' + f(c.abs())) + ' = ' + f(x) + '$.', 'Or distribute first: $' + T.coef(dec ? Number(dd(p)) : p, 'x') + T.signed(dec ? Number(dd(p.mul(c))) : p.mul(c)) + ' = ' + f(r) + '$, and solve as a two-step equation. Same answer.'];
    else steps = ['Distribute first: $' + ptex + ' \\times x' + ' + ' + pd(ptex) + ' \\times ' + pd(f(c)) + ' = ' + T.coef(dec ? Number(dd(p)) : p, 'x') + T.signed(dec ? Number(dd(p.mul(c))) : p.mul(c)) + '$, so $' + T.coef(dec ? Number(dd(p)) : p, 'x') + T.signed(dec ? Number(dd(p.mul(c))) : p.mul(c)) + ' = ' + f(r) + '$.', (p.mul(c).sign() > 0 ? 'Subtract $' + f(p.mul(c)) + '$ from' : 'Add $' + f(p.mul(c).abs()) + '$ to') + ' both sides: $' + T.coef(dec ? Number(dd(p)) : p, 'x') + ' = ' + f(r.sub(p.mul(c))) + '$.', 'Divide by $' + ptex + '$: $x = ' + f(x) + '$.'];
    steps.push('Check: $' + ptex + '(' + f(x) + T.signed(c) + ') = ' + ptex + ' \\times ' + pd(f(x.add(c))) + ' = ' + f(r) + '$ ✓.');
    return {
      q: 'Solve for $x$: $' + tex + '$',
      a: NS(x, dec),
      steps: steps,
      hint: 'Either divide both sides by ' + p.toPlain() + ' first, or distribute ' + p.toPlain() + ' to both terms first.',
      chk: { kind: 'solve', eq: '(' + p.toPlain() + ')*(x+(' + c.toPlain() + '))=' + r.toPlain() }
    };
  });

  G('g7.equation-word-problems', function (R, ctx) {
    var L = lv(ctx);
    var who = nm(R);
    var W = R.pick([
      function () { var fee = R.pick([10, 15, 20, 25]), per = R.pick([6, 8, 9, 12]), n = R.int(3, 12), tot = fee + per * n; return { t: who + ' joins a climbing gym. There is a one-time fee of \\$' + fee + ', and each visit costs \\$' + per + '. ' + who + ' has paid \\$' + tot + ' in all. How many visits is that?', eq: per + 'x + ' + fee + ' = ' + tot, eqp: per + '*x+' + fee + '=' + tot, x: n, wrong: [per + '(x + ' + fee + ') = ' + tot, fee + 'x + ' + per + ' = ' + tot, per + 'x - ' + fee + ' = ' + tot], arith: 'Arithmetic: take away the fee, $' + tot + ' - ' + fee + ' = ' + (tot - fee) + '$, then share by the visit price, $' + (tot - fee) + ' \\div ' + per + ' = ' + n + '$.' }; },
      function () { var k = R.int(3, 6), s = R.pick([2, 3, 4, 5]), x = R.int(6, 15), tot = k * (x + s); return { t: who + ' and ' + (k - 1) + ' friends go to a concert. Each person buys a ticket and a \\$' + s + ' drink. Together they spend \\$' + tot + '. How much is one ticket, in dollars?', eq: k + '(x + ' + s + ') = ' + tot, eqp: k + '*(x+' + s + ')=' + tot, x: x, wrong: [k + 'x + ' + s + ' = ' + tot, 'x + ' + k * s + ' = ' + (tot + k), k + 'x - ' + s + ' = ' + tot], arith: 'Arithmetic: each person spends $' + tot + ' \\div ' + k + ' = ' + (x + s) + '$, and the ticket is $' + (x + s) + ' - ' + s + ' = ' + x + '$.' }; },
      function () { var Lg = R.int(12, 40), w = R.int(5, Lg - 2), P = 2 * Lg + 2 * w; return { t: 'A rectangular garden is $' + Lg + '$ feet long. Its perimeter is $' + P + '$ feet. How wide is it, in feet?', eq: '2(' + Lg + ') + 2x = ' + P, eqp: '2*' + Lg + '+2*x=' + P, x: w, wrong: [Lg + ' + 2x = ' + P, '2(' + Lg + ') \\cdot x = ' + P, Lg + 'x = ' + P], arith: 'Arithmetic: the two lengths use $2 \\times ' + Lg + ' = ' + 2 * Lg + '$ feet, leaving $' + (P - 2 * Lg) + '$ feet for two widths, so one width is $' + w + '$ feet.' }; },
      function () { var k = R.int(3, 6), off = R.pick([2, 3, 4, 5]), x = R.int(12, 30), tot = k * (x - off); return { t: 'A store takes \\$' + off + ' off the price of each shirt. ' + who + ' buys ' + k + ' shirts and pays \\$' + tot + '. What was the original price of one shirt, in dollars?', eq: k + '(x - ' + off + ') = ' + tot, eqp: k + '*(x-' + off + ')=' + tot, x: x, wrong: [k + 'x - ' + off + ' = ' + tot, k + '(x + ' + off + ') = ' + tot, 'x - ' + off + ' = ' + tot], arith: 'Arithmetic: each shirt cost $' + tot + ' \\div ' + k + ' = ' + (x - off) + '$ on sale, so the original price was $' + (x - off) + ' + ' + off + ' = ' + x + '$.' }; },
      function () { var have = R.int(20, 80), per = R.pick([5, 8, 10, 12, 15]), wks = R.int(3, 12), goal = have + per * wks; return { t: who + ' has \\$' + have + ' and saves \\$' + per + ' each week. How many weeks until ' + who + ' has \\$' + goal + '?', eq: have + ' + ' + per + 'x = ' + goal, eqp: have + '+' + per + '*x=' + goal, x: wks, wrong: [per + '(x + ' + have + ') = ' + goal, have + 'x + ' + per + ' = ' + goal, per + 'x = ' + goal], arith: 'Arithmetic: ' + who + ' still needs $' + goal + ' - ' + have + ' = ' + (goal - have) + '$, and $' + (goal - have) + ' \\div ' + per + ' = ' + wks + '$ weeks.' }; },
      function () { var base = R.pick([15, 20, 25]), per = R.pick(['0.1', '0.05', '0.25']), n = R.int(4, 30) * (per === '0.05' ? 2 : 1) * 2, tot = q(base).add(q(per).mul(n)); return { t: 'A phone plan costs \\$' + base + ' a month plus ' + money(per) + ' for each text over the limit. One month the bill was ' + money(tot) + '. How many extra texts were sent?', eq: dd(per) + 'x + ' + base + ' = ' + dd(tot), eqp: per + '*x+' + base + '=' + tot.toPlain(), x: n, wrong: [dd(per) + '(x + ' + base + ') = ' + dd(tot), base + 'x + ' + dd(per) + ' = ' + dd(tot), dd(per) + 'x = ' + dd(tot)], arith: 'Arithmetic: the texts cost $' + dd(tot) + ' - ' + base + ' = ' + dd(tot.sub(base)) + '$, and $' + dd(tot.sub(base)) + ' \\div ' + dd(per) + ' = ' + n + '$ texts.' }; }
    ])();
    if (L >= 2 && R.chance(0.3)) {
      return {
        q: W.t + ' Let $x$ be the unknown. Which equation models the story?',
        a: mcq('$' + W.eq + '$', W.wrong.map(function (w) { return '$' + w + '$'; })),
        steps: ['Write what the story says, piece by piece, as an expression equal to the total.', 'That gives $' + W.eq + '$.', 'Solving it gives $x = ' + W.x + '$. ' + W.arith],
        hint: 'Which amounts happen once, and which happen for each one?',
        chk: { kind: 'solveEq', eq: W.eqp, x: W.x }
      };
    }
    return {
      q: W.t,
      a: N(W.x),
      steps: ['Let $x$ be the unknown. The story gives the equation $' + W.eq + '$.', 'Solve it: undo the steps in reverse order. $x = ' + W.x + '$.', W.arith + ' The equation and the arithmetic do the same steps.'],
      hint: 'Write an equation: (amount for each) × (how many) and (one-time amounts) make the total.',
      chk: { kind: 'solveEq', eq: W.eqp, x: W.x }
    };
  });

  function flip(op) { return { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[op]; }
  function opTex(op) { return { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' }[op]; }
  G('g7.two-step-inequalities', function (R, ctx) {
    var L = lv(ctx);
    if (L === 3 && R.chance(0.45)) {
      var W = R.pick([
        function () { var have = R.pick([30, 40, 50, 60]), tk = R.pick([8, 10, 12, 15]), per = R.pick([2, 3, 4, '2.5', '3.5']), maxN = Math.floor(q(have - tk).div(per).toNumber()); return { t: 'You have \\$' + have + '. A fair ticket costs \\$' + tk + ', and each ride costs ' + money(per) + '. What is the greatest number of rides you can take?', ans: maxN, ineq: dd(per) + 'r + ' + tk + ' \\le ' + have, sol: 'r \\le ' + (q(have - tk).div(per).isTerminating() ? dd(q(have - tk).div(per)) : mx(q(have - tk).div(per))), plain: per + '*r+' + tk + '<=' + have, v: 'r' }; },
        function () { var t0 = R.int(8, 20), drop = R.pick([2, 3, 4]), lim = -R.int(1, 10); while ((t0 - lim) % drop) lim--; var h = (t0 - lim) / drop; return { t: 'The temperature is $' + t0 + '^\\circ$F and falls $' + drop + '$ degrees each hour. After how many hours $h$ will it be below $' + lim + '^\\circ$F? Write an inequality for $h$.', ansIneq: 'h > ' + h, ineq: t0 + ' - ' + drop + 'h < ' + lim, sol: 'h > ' + h, plain: t0 + '-' + drop + '*h<' + lim, v: 'h', flip: true, drop: drop, t0: t0, lim: lim }; }
      ])();
      if (W.ansIneq) {
        return {
          q: W.t,
          a: { t: 'ineq', v: W.ansIneq },
          steps: ['Write the inequality: $' + W.ineq + '$.', 'Subtract $' + W.t0 + '$ from both sides: $-' + W.drop + 'h < ' + (W.lim - W.t0) + '$.', 'Divide both sides by $-' + W.drop + '$ and <b>reverse</b> the sign, because dividing by a negative flips the order: $h > ' + (W.lim - W.t0) / -W.drop + '$.', 'Check: at $h = ' + ((W.lim - W.t0) / -W.drop + 1) + '$, the temperature is $' + (W.t0 - W.drop * ((W.lim - W.t0) / -W.drop + 1)) + '$, which is below $' + W.lim + '$ ✓.'],
          hint: 'Write temperature after h hours as start − drop × h.',
          chk: { kind: 'ineq', plain: W.plain, v: 'h', ans: W.ansIneq }
        };
      }
      return {
        q: W.t,
        a: N(W.ans),
        steps: ['Let $r$ be the number of rides. The total cost must be at most the money you have: $' + W.ineq + '$.', 'Subtract the ticket price, then divide by the cost per ride: $' + W.sol + '$.', 'Rides come in whole numbers, so the greatest number is $' + W.ans + '$.'],
        hint: '"At most" means ≤. Solve, then think about whole numbers.',
        chk: { kind: 'maxint', plain: W.plain, v: 'r', ans: W.ans }
      };
    }
    var neg = L === 1 ? false : R.chance(0.55), p = q(R.int(2, 9) * (neg ? -1 : 1)), b = q(R.int(-8, 10)), c = q(R.nz(-15, 15));
    if (L === 3) { p = q(R.pick(['1/2', '3/4', '2/3'])).mul(neg ? -1 : 1); b = q(Number(p.d) * R.int(-4, 5)); }
    var op = R.pick(['<', '>', '<=', '>=']), r = p.mul(b).add(c), sol = neg ? flip(op) : op;
    var lhs = T.coef(p, 'x') + T.signed(c);
    var steps = [(c.sign() > 0 ? 'Subtract $' + mx(c) + '$ from' : 'Add $' + mx(c.abs()) + '$ to') + ' both sides, just like an equation: $' + T.coef(p, 'x') + ' ' + opTex(op) + ' ' + mx(r.sub(c)) + '$.'];
    if (neg) steps.push((p.isInt() ? 'Divide both sides by $' + mx(p) + '$' : 'Multiply both sides by $' + mx(p.inv()) + '$') + '. This is a negative number, so <b>reverse the inequality sign</b>: $x ' + opTex(sol) + ' ' + mx(b) + '$.', 'Why: multiplying or dividing by a negative swaps which side is bigger. For example, $2 < 3$, but $-2 > -3$.');
    else steps.push((p.isInt() ? 'Divide both sides by $' + mx(p) + '$' : 'Multiply both sides by $' + mx(p.inv()) + '$') + '. It is positive, so the sign stays: $x ' + opTex(sol) + ' ' + mx(b) + '$.');
    var test = (sol === '<' || sol === '<=') ? b.sub(1) : b.add(1);
    steps.push('Check with a number in the answer, $x = ' + mx(test) + '$: $' + mx(p) + ' \\times ' + pd(mx(test)) + T.signed(c) + ' = ' + mx(p.mul(test).add(c)) + '$, and $' + mx(p.mul(test).add(c)) + ' ' + opTex(op) + ' ' + mx(r) + '$ ✓.');
    return {
      q: 'Solve the inequality: $' + lhs + ' ' + opTex(op) + ' ' + mx(r) + '$',
      a: { t: 'ineq', v: 'x ' + sol + ' ' + b.toPlain() },
      steps: steps,
      hint: neg ? 'Solve it like an equation. When you divide by a negative number, flip the inequality sign.' : 'Solve it like an equation: undo the adding, then undo the multiplying.',
      chk: { kind: 'ineq', plain: '(' + p.toPlain() + ')*x+(' + c.toPlain() + ')' + op + r.toPlain(), v: 'x', ans: 'x ' + sol + ' ' + b.toPlain() }
    };
  });

  G('g7.multistep-problems', function (R, ctx) {
    var L = lv(ctx), who = nm(R);
    var W = R.pick(BL(ctx, ['disctax', 'raise', 'recipe', 'trip'], ['disctax', 'raise', 'recipe', 'trip', 'save', 'commission'], ['disctax', 'raise', 'recipe', 'trip', 'save', 'commission', 'board']));
    var ans, steps, qs, chk;
    if (W === 'disctax') {
      var price, d, t, tot;
      for (var k = 0; k < 40; k++) { price = R.pick([24, 32, 36, 40, 45, 48, 60, 64, 75, 80]); d = R.pick([10, 15, 20, 25, 30]); t = R.pick([5, 6, 8]); tot = q(price).mul(100 - d).mul(100 + t).div(10000); if (tot.mul(100).isInt()) break; }
      if (!tot.mul(100).isInt()) { price = 40; d = 20; t = 5; tot = q(price).mul(80).mul(105).div(10000); }
      var sale = q(price).mul(100 - d).div(100);
      qs = who + ' buys a jacket marked ' + money(price) + '. It is $' + d + '\\%$ off, and then $' + t + '\\%$ sales tax is added. How much does ' + who + ' pay, in dollars?';
      steps = ['Estimate first: $' + d + '\\%$ off ' + money(price) + ' is about ' + money(Math.round(price * (100 - d) / 100)) + ', plus a little tax.', 'Sale price: $' + dd(q(100 - d).div(100)) + ' \\times ' + price + ' = ' + fixed2(sale) + '$.', 'With tax: $' + dd(q(100 + t).div(100)) + ' \\times ' + fixed2(sale) + ' = ' + fixed2(tot) + '$.', 'The answer ' + money(tot) + ' is close to the estimate ✓.'];
      ans = tot; chk = { kind: 'chain', p: price, f: [-d, t] };
    } else if (W === 'raise') {
      var wage = R.pick([12, 14, 15, 16, 18, 20]), p = R.pick([5, 10, 20, 25]), h = R.int(6, 30), nw = q(wage).mul(100 + p).div(100);
      qs = who + ' earns \\$' + wage + ' an hour and gets a $' + p + '\\%$ raise. How much does ' + who + ' earn for ' + h + ' hours of work at the new wage, in dollars?';
      steps = ['New hourly wage: $' + wage + ' \\times ' + dd(q(100 + p).div(100)) + ' = ' + fixed2(nw) + '$ dollars.', 'Pay for ' + h + ' hours: $' + fixed2(nw) + ' \\times ' + h + ' = ' + fixed2(nw.mul(h)) + '$.', 'Estimate: about $' + wage + ' \\times ' + h + ' = ' + wage * h + '$, plus a bit more ✓.'];
      ans = nw.mul(h); chk = { kind: 'expr', v: wage + '*(1+' + p + '/100)*' + h };
    } else if (W === 'recipe') {
      var flour = q(R.pick(['3/4', '1 1/4', '2 1/2', '1 1/2', '2 1/4'].map(function (s) { var m = /^(\d) (\d)\/(\d)$/.exec(s); return m ? String(+m[1] * +m[3] + +m[2]) + '/' + m[3] : s; }))), base = R.pick([12, 16, 18, 24]), want = base * R.pick([2, 3]) / R.pick([1, 2, 4]);
      if (!Number.isInteger(want) || want === base) want = base * 2 + base / 2;
      var need = flour.mul(want).div(base);
      qs = 'A recipe uses $' + mx(flour) + '$ cups of flour to make ' + base + ' muffins. How many cups of flour are needed for ' + want + ' muffins?';
      steps = ['Scale factor: $' + want + ' \\div ' + base + ' = ' + mx(q(want).div(base)) + '$.', 'Flour: $' + mx(flour) + ' \\times ' + mx(q(want).div(base)) + ' = ' + im(flour) + ' \\times ' + im(q(want).div(base)) + ' = ' + mx(need) + '$ cups.', 'Estimate: ' + (want > base ? 'more muffins need more flour' : 'fewer muffins need less flour') + ', and $' + mx(need) + '$ is about ' + dd(q(want).div(base).toDec(1)) + ' times $' + mx(flour) + '$ ✓.'];
      ans = need; chk = { kind: 'expr', v: '(' + flour.toPlain() + ')*' + want + '/' + base };
    } else if (W === 'trip') {
      var t1 = q(R.pick(['1/2', '3/2', '5/2', '3/4', '5/4', '2'])), s1 = R.pick([40, 48, 52, 60, 64]), t2 = q(R.pick(['1/4', '3/4', '1/2', '1'])), s2 = R.pick([24, 30, 36, 44]);
      var dist = t1.mul(s1).add(t2.mul(s2));
      qs = 'A family drives for $' + mx(t1) + '$ hours at $' + s1 + '$ miles per hour, then for $' + mx(t2) + '$ hour' + (t2.gt(1) ? 's' : '') + ' at $' + s2 + '$ miles per hour. How far do they drive in all, in miles?';
      steps = ['First part: distance = rate × time = $' + s1 + ' \\times ' + mx(t1) + ' = ' + mx(t1.mul(s1)) + '$ miles.', 'Second part: $' + s2 + ' \\times ' + mx(t2) + ' = ' + mx(t2.mul(s2)) + '$ miles.', 'Total: $' + mx(t1.mul(s1)) + ' + ' + mx(t2.mul(s2)) + ' = ' + mx(dist) + '$ miles.'];
      ans = dist; chk = { kind: 'expr', v: '(' + t1.toPlain() + ')*' + s1 + '+(' + t2.toPlain() + ')*' + s2 };
      if (!dist.isInt()) { qs = qs.replace('in miles?', 'in miles? (Your answer may be a fraction or a decimal.)'); }
    } else if (W === 'save') {
      var cost = R.pick([60, 80, 90, 120, 150]), tax = R.pick([5, 8, 10]), have = R.int(10, 40), per = R.pick([12, 15, 20, 25]);
      var total = q(cost).mul(100 + tax).div(100), needS = total.sub(have), wks = Math.ceil(needS.div(per).toNumber());
      if (needS.sign() <= 0) { have = 5; needS = total.sub(have); wks = Math.ceil(needS.div(per).toNumber()); }
      qs = who + ' wants a bike that costs ' + money(cost) + ' plus $' + tax + '\\%$ tax. ' + who + ' has \\$' + have + ' and saves \\$' + per + ' each week. How many weeks until ' + who + ' can buy the bike?';
      steps = ['Total cost: $' + cost + ' \\times ' + dd(q(100 + tax).div(100)) + ' = ' + fixed2(total) + '$.', 'Still needed: $' + fixed2(total) + ' - ' + have + ' = ' + fixed2(needS) + '$.', 'Weeks: $' + fixed2(needS) + ' \\div ' + per + ' \\approx ' + needS.div(per).toDec(2) + '$. ' + (needS.div(per).isInt() ? 'That is exactly ' + wks + ' weeks.' : 'After ' + (wks - 1) + ' weeks there is not quite enough, so it takes $' + wks + '$ weeks (round up).')];
      ans = q(wks); chk = { kind: 'ceil', v: '(' + cost + '*(1+' + tax + '/100)-' + have + ')/' + per };
    } else if (W === 'commission') {
      var bse = R.pick([300, 400, 500]), rate = R.pick([4, 5, 6, 8, 10]), sales = R.pick([2500, 3200, 4000, 4500, 6000]);
      ans = q(bse).add(q(sales).mul(rate).div(100));
      qs = 'A salesperson earns \\$' + bse + ' a week plus a $' + rate + '\\%$ commission on sales. One week the sales were $\\$' + T.commas(sales) + '$. What were the total earnings that week, in dollars?';
      steps = ['Commission: $' + rate + '\\%$ of $' + T.commas(sales) + '$ is $' + dd(q(rate).div(100)) + ' \\times ' + T.commas(sales) + ' = ' + fixed2(q(sales).mul(rate).div(100)) + '$.', 'Add the base pay: $' + bse + ' + ' + fixed2(q(sales).mul(rate).div(100)) + ' = ' + fixed2(ans) + '$.'];
      chk = { kind: 'expr', v: bse + '+' + sales + '*' + rate + '/100' };
    } else {
      var board = R.pick([8, 10, 12]), piece = q(R.pick(['3/2', '7/4', '5/4', '9/4', '5/2'])), n = Math.floor(q(board).div(piece).toNumber()), left = q(board).sub(piece.mul(n));
      qs = 'A board is $' + board + '$ feet long. ' + who + ' cuts as many pieces as possible that are each $' + mx(piece) + '$ feet long. How many feet of board are left over?';
      steps = ['How many pieces fit: $' + board + ' \\div ' + mx(piece) + ' = ' + board + ' \\times ' + im(piece.inv()) + ' = ' + mx(q(board).div(piece)) + '$, so $' + n + '$ whole pieces.', 'They use $' + n + ' \\times ' + mx(piece) + ' = ' + mx(piece.mul(n)) + '$ feet.', 'Left over: $' + board + ' - ' + mx(piece.mul(n)) + ' = ' + mx(left) + '$ feet.'];
      ans = left; chk = { kind: 'expr', v: board + '-(' + piece.toPlain() + ')*' + n };
    }
    var dec = W === 'disctax' || W === 'raise' || W === 'commission';
    return { q: qs, a: NS(ans, dec), steps: steps, hint: 'Break it into steps. Estimate first so you can check your answer.', chk: chk };
  });
  /* ============================================================ Unit 7: Angles, circles and solids */

  function lin(p, c) { // a plain-text label like (2x + 10)° for pictures (canvas text, not TeX)
    var s = (p === 1 ? '' : p === -1 ? '−' : String(p)) + 'x';
    if (c) s = '(' + s + (c > 0 ? ' + ' + c : ' − ' + (-c)) + ')';
    return s + '°';
  }
  function linTex(p, c) { return '(' + T.lin(p, 'x', c) + ')^\\circ'; }

  G('g7.angle-relationships', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['comp', 'supp', 'vert', 'line', 'which', 'point'], BL(ctx, [3, 3, 2, 2, 2, 0], [2, 2, 3, 3, 2, 1], [2, 2, 2, 3, 2, 2]));
    if (shape === 'comp') {
      var a = R.int(8, 82);
      return {
        q: 'Two angles are complementary. One of them measures $' + a + '^\\circ$. What is the measure of the other angle, in degrees?',
        a: N(90 - a),
        steps: ['Complementary angles add up to $90^\\circ$ (they fill a right angle, like the corner of a page).', '$90 - ' + a + ' = ' + (90 - a) + '$, so the other angle is $' + (90 - a) + '^\\circ$.'],
        hint: 'Complementary angles fill a right angle: they add to 90°.',
        chk: { kind: 'angsum', total: 90, known: [a] }
      };
    }
    if (shape === 'supp') {
      var b = R.int(15, 165);
      return {
        q: 'Two angles are supplementary. One of them measures $' + b + '^\\circ$. What is the measure of the other angle, in degrees?',
        a: N(180 - b),
        steps: ['Supplementary angles add up to $180^\\circ$ (together they make a straight line).', '$180 - ' + b + ' = ' + (180 - b) + '$, so the other angle is $' + (180 - b) + '^\\circ$.'],
        hint: 'Supplementary angles make a straight line: they add to 180°.',
        chk: { kind: 'angsum', total: 180, known: [b] }
      };
    }
    if (shape === 'vert') {
      var d = R.int(25, 75), askOpp = R.coin(), labels = [d + '°', '', askOpp ? 'x°' : '', askOpp ? '' : 'x°'];
      var ans = askOpp ? d : 180 - d;
      return {
        q: 'Two straight lines cross. One angle measures $' + d + '^\\circ$. Find $x$.',
        viz: { name: 'g7-angles', opts: { mode: 'vertical', deg: d, labels: labels }, label: 'Two crossing lines. One angle is ' + d + ' degrees and the angle marked x is ' + (askOpp ? 'across from it' : 'next to it') + '.' },
        a: N(ans),
        steps: askOpp ? ['The angle marked $x$ is across from the $' + d + '^\\circ$ angle. They are vertical angles.', 'Vertical angles are equal, so $x = ' + d + '$.', 'Why: each of them is supplementary to the same angle between them, $180^\\circ - ' + d + '^\\circ$.'] : ['The angle marked $x$ is next to the $' + d + '^\\circ$ angle, and together they make a straight line.', 'So they are supplementary: $x = 180 - ' + d + ' = ' + (180 - d) + '$.'],
        hint: askOpp ? 'Angles across from each other where two lines cross are equal.' : 'Angles side by side on a straight line add to 180°.',
        chk: askOpp ? { kind: 'val', v: String(d) } : { kind: 'angsum', total: 180, known: [d] }
      };
    }
    if (shape === 'line') {
      var three = L >= 2 && R.coin(), p1 = R.int(20, 80), p2 = three ? R.int(20, 160 - p1 - 20) : 180 - p1, p3 = three ? 180 - p1 - p2 : 0;
      var parts = three ? [p1, p2, p3] : [p1, p2], miss = R.int(0, parts.length - 1), labs = parts.map(function (v, i) { return i === miss ? 'x°' : v + '°'; });
      var known = parts.filter(function (v, i) { return i !== miss; });
      return {
        q: 'The angles shown make a straight line. Find $x$.',
        viz: { name: 'g7-angles', opts: { mode: 'line', parts: parts, labels: labs }, label: 'Angles on a straight line: ' + labs.join(', ') + '.' },
        a: N(parts[miss]),
        steps: ['Angles that together make a straight line add up to $180^\\circ$.', '$x = 180 - ' + known.join(' - ') + ' = ' + parts[miss] + '$.'],
        hint: 'All the angles along a straight line add to 180°.',
        chk: { kind: 'angsum', total: 180, known: known }
      };
    }
    if (shape === 'point') {
      var ps = [R.int(60, 120), R.int(50, 110), R.int(40, 100)]; ps.push(360 - sum(ps));
      var mi = R.int(0, 3), lb = ps.map(function (v, i) { return i === mi ? 'x°' : v + '°'; });
      return {
        q: 'Four angles fit together around a point. Find $x$.',
        viz: { name: 'g7-angles', opts: { mode: 'point', parts: ps, labels: lb }, label: 'Four angles around a point: ' + lb.join(', ') + '.' },
        a: N(ps[mi]),
        steps: ['Angles all the way around a point make a full turn: $360^\\circ$.', '$x = 360 - ' + ps.filter(function (v, i) { return i !== mi; }).join(' - ') + ' = ' + ps[mi] + '$.'],
        hint: 'A full turn is 360°.',
        chk: { kind: 'angsum', total: 360, known: ps.filter(function (v, i) { return i !== mi; }) }
      };
    }
    var kind = R.pick(['comp', 'supp', 'neither']), x1 = R.int(15, 70), x2 = kind === 'comp' ? 90 - x1 : kind === 'supp' ? 180 - x1 : 90 - x1 + R.pick([-10, 10, 20, 100]);
    var choices = ['complementary', 'supplementary', 'neither'];
    return {
      q: 'Two angles measure $' + x1 + '^\\circ$ and $' + x2 + '^\\circ$. Are they complementary, supplementary, or neither?',
      a: mcFixed(choices, kind === 'comp' ? 0 : kind === 'supp' ? 1 : 2),
      steps: ['Add them: $' + x1 + ' + ' + x2 + ' = ' + (x1 + x2) + '$.', 'Complementary means a sum of $90^\\circ$; supplementary means a sum of $180^\\circ$.', 'So these angles are <b>' + choices[kind === 'comp' ? 0 : kind === 'supp' ? 1 : 2] + '</b>.' + (kind === 'neither' ? '' : ' A way to remember: "C" comes before "S" in the alphabet, and 90 comes before 180.')],
      hint: 'Add the two angles. Is the sum 90° or 180°?',
      chk: { kind: 'val', v: String(x1 + x2) }
    };
  });

  G('g7.angle-equations', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['line', 'right', 'vertical', 'point'], BL(ctx, [4, 3, 2, 0], [3, 3, 2, 1], [3, 2, 2, 2]));
    var askAngle = L >= 2 && R.chance(0.4), x, A, B, eqTex, total, steps, viz, labA, labB, qs, chkEq;
    if (shape === 'vertical') {
      var pv = R.int(2, 5), cv = R.nz(-20, 30); x = R.int(10, 30); var m = pv * x + cv; if (m <= 20 || m >= 160) { cv = 10; m = pv * x + cv; }
      eqTex = T.lin(pv, 'x', cv) + ' = ' + m;
      viz = { name: 'g7-angles', opts: { mode: 'vertical', deg: Math.min(m, 180 - m) === m ? m : m, labels: [lin(pv, cv), '', m + '°', ''] }, label: 'Two crossing lines. Vertical angles marked ' + lin(pv, cv) + ' and ' + m + '°.' };
      return {
        q: 'Two lines cross. Vertical angles measure $' + linTex(pv, cv) + '$ and $' + m + '^\\circ$. ' + (askAngle ? 'What is the value of $x$?' : 'Find $x$.'),
        viz: viz,
        a: N(x),
        steps: ['Vertical angles are equal, so write $' + eqTex + '$.', (cv > 0 ? 'Subtract $' + cv + '$' : 'Add $' + (-cv) + '$') + ' on both sides: $' + pv + 'x = ' + (m - cv) + '$.', 'Divide by $' + pv + '$: $x = ' + x + '$.', 'Check: $' + pv + ' \\times ' + x + T.signed(cv) + ' = ' + m + '$ ✓.'],
        hint: 'Vertical angles are equal. Set the two expressions equal.',
        chk: { kind: 'solveEq', eq: pv + '*x+(' + cv + ')=' + m, x: x }
      };
    }
    if (shape === 'right' || shape === 'line') {
      total = shape === 'right' ? 90 : 180;
      for (var t = 0; t < 60; t++) {
        var p1 = R.int(1, 4), c1 = R.int(-10, 25), p2 = R.int(1, 5), c2 = R.int(-10, 30);
        if ((total - c1 - c2) % (p1 + p2)) continue;
        x = (total - c1 - c2) / (p1 + p2); A = p1 * x + c1; B = p2 * x + c2;
        if (x > 2 && A >= 10 && B >= 10 && (p1 !== 1 || c1 !== 0 || p2 !== 1 || c2 !== 0)) break;
      }
      if (!(A >= 10 && B >= 10) || (total - c1 - c2) % (p1 + p2)) { p1 = 2; c1 = 10; p2 = 3; c2 = total === 90 ? -5 : 20; x = (total - c1 - c2) / (p1 + p2); A = p1 * x + c1; B = p2 * x + c2; }
      labA = lin(p1, c1); labB = lin(p2, c2);
      viz = { name: 'g7-angles', opts: { mode: shape, parts: [A, B], labels: [labA, labB] }, label: (shape === 'right' ? 'A right angle split into two angles, ' : 'Two angles on a straight line, ') + labA + ' and ' + labB + '.' };
      var sumP = p1 + p2, sumC = c1 + c2;
      steps = ['The two angles ' + (shape === 'right' ? 'fill a right angle' : 'make a straight line') + ', so they add to $' + total + '^\\circ$: $' + T.lin(p1, 'x', c1) + ' + ' + (c2 === 0 ? T.mono(p2, 'x') : '(' + T.lin(p2, 'x', c2) + ')') + ' = ' + total + '$.',
        'Combine like terms: $' + T.lin(sumP, 'x', sumC) + ' = ' + total + '$.',
        (sumC === 0 ? '' : (sumC > 0 ? 'Subtract $' + sumC + '$' : 'Add $' + (-sumC) + '$') + ' on both sides: $' + sumP + 'x = ' + (total - sumC) + '$. ') + 'Divide by $' + sumP + '$: $x = ' + x + '$.'];
      chkEq = '(' + p1 + '*x+(' + c1 + '))+(' + p2 + '*x+(' + c2 + '))=' + total;
      qs = 'The two angles shown ' + (shape === 'right' ? 'together form a right angle' : 'together form a straight angle') + ': $' + (c1 ? linTex(p1, c1) : T.mono(p1, 'x') + '^\\circ') + '$ and $' + (c2 ? linTex(p2, c2) : T.mono(p2, 'x') + '^\\circ') + '$. ';
      if (askAngle) {
        steps.push('The angle marked $' + labA.replace('°', '').replace('−', '-') + '$ measures $' + p1 + ' \\times ' + x + T.signed(c1) + ' = ' + A + '^\\circ$.', 'Check: $' + A + ' + ' + B + ' = ' + total + '$ ✓.');
        return { q: qs + 'What is the measure of the angle marked $' + (c1 ? linTex(p1, c1) : T.mono(p1, 'x') + '^\\circ') + '$, in degrees?', viz: viz, a: N(A), steps: steps, hint: 'Find x first, then substitute.', chk: { kind: 'angleOf', eq: chkEq, p: p1, c: c1, ans: A } };
      }
      steps.push('Check: the angles are $' + A + '^\\circ$ and $' + B + '^\\circ$, and $' + A + ' + ' + B + ' = ' + total + '$ ✓.');
      return { q: qs + 'Find $x$.', viz: viz, a: N(x), steps: steps, hint: 'Add the two expressions and set the sum equal to ' + total + '.', chk: { kind: 'solveEq', eq: chkEq, x: x } };
    }
    // around a point: x, 2x, and (kx + c)
    for (var u = 0; u < 60; u++) { var k3 = R.int(1, 3), c3 = R.int(0, 6) * 10; if ((360 - c3) % (3 + k3) === 0) { x = (360 - c3) / (3 + k3); if (x > 20 && x < 100) break; } }
    if (!(x > 20 && x < 100) || (360 - c3) % (3 + k3)) { k3 = 2; c3 = 60; x = 60; }
    var parts3 = [x, 2 * x, k3 * x + c3], labs3 = ['x°', '2x°', lin(k3, c3)];
    return {
      q: 'Three angles fill the space around a point: $x^\\circ$, $2x^\\circ$ and $' + (c3 ? linTex(k3, c3) : T.mono(k3, 'x') + '^\\circ') + '$. Find $x$.',
      viz: { name: 'g7-angles', opts: { mode: 'point', parts: parts3, labels: labs3 }, label: 'Three angles around a point: ' + labs3.join(', ') + '.' },
      a: N(x),
      steps: ['Angles around a point add to $360^\\circ$: $x + 2x + ' + (c3 ? '(' + T.lin(k3, 'x', c3) + ')' : T.mono(k3, 'x')) + ' = 360$.', 'Combine like terms: $' + T.lin(3 + k3, 'x', c3) + ' = 360$.', (c3 ? 'Subtract $' + c3 + '$: $' + (3 + k3) + 'x = ' + (360 - c3) + '$. ' : '') + 'Divide by $' + (3 + k3) + '$: $x = ' + x + '$.', 'Check: $' + parts3.join(' + ') + ' = 360$ ✓.'],
      hint: 'A full turn around a point is 360°.',
      chk: { kind: 'solveEq', eq: 'x+2*x+(' + k3 + '*x+' + c3 + ')=360', x: x }
    };
  });

  var TRI_CHOICES = ['No triangle', 'Exactly one triangle', 'More than one triangle'];
  G('g7.which-triangles-exist', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['sides', 'angles', 'range', 'pick'], BL(ctx, [6, 2, 0, 0], [4, 2, 2, 1], [3, 2, 2, 2]));
    if (shape === 'sides') {
      var s, kind = R.pick(['ok', 'ok', 'short', 'flat']);
      var a = R.int(2, 12), b = R.int(2, 12), lo = Math.abs(a - b), hi = a + b, c;
      if (kind === 'ok') c = R.int(lo + 1, hi - 1); else if (kind === 'flat') c = R.coin() && lo > 0 ? lo : hi; else c = hi + R.int(1, 6);
      if (c <= 0) c = hi;
      s = R.shuffle([a, b, c]);
      var srt = s.slice().sort(function (x, y) { return x - y; }), ok = srt[0] + srt[1] > srt[2];
      return {
        q: 'How many different triangles can you make with sides of length $' + s[0] + '$, $' + s[1] + '$ and $' + s[2] + '$ cm?',
        a: mcFixed(TRI_CHOICES, ok ? 1 : 0),
        steps: ['Check the two shortest sides against the longest: $' + srt[0] + ' + ' + srt[1] + ' = ' + (srt[0] + srt[1]) + '$, and the longest is $' + srt[2] + '$.',
          ok ? 'The two shorter sides add to more than the longest, so they can reach each other and meet above it. A triangle exists.' : (srt[0] + srt[1] === srt[2] ? 'The two shorter sides add to exactly the longest, so they lie flat along it. There is no room for a corner: no triangle.' : 'The two shorter sides add to less than the longest, so they cannot reach each other: no triangle.'),
          ok ? 'Three side lengths fix the shape completely, so there is exactly one triangle (copies of it can be turned or flipped, but they are all the same triangle).' : 'Rule: each pair of sides must add to more than the third side.'],
        hint: 'Add the two shortest lengths and compare with the longest.',
        chk: { kind: 'tri', s: s, right: ok ? 1 : 0 }
      };
    }
    if (shape === 'angles') {
      var x1 = R.int(20, 100), x2 = R.int(20, 150 - x1), good = R.coin(), x3 = good ? 180 - x1 - x2 : 180 - x1 - x2 + R.pick([-15, 10, 20, 30]);
      if (x3 <= 0) x3 = 180 - x1 - x2 + 10, good = false;
      return {
        q: 'How many different triangles have angles of $' + x1 + '^\\circ$, $' + x2 + '^\\circ$ and $' + x3 + '^\\circ$?',
        a: mcFixed(TRI_CHOICES, good ? 2 : 0),
        steps: ['The angles of any triangle add to $180^\\circ$. Here $' + x1 + ' + ' + x2 + ' + ' + x3 + ' = ' + (x1 + x2 + x3) + '$.',
          good ? 'They add to $180^\\circ$, so the triangle exists. But angles fix only the <b>shape</b>, not the size: a small copy and a big copy have the same angles. So there are many different triangles.' : 'They do not add to $180^\\circ$, so no triangle has these angles.'],
        hint: 'Do the angles add to 180°? If so, can the triangle come in different sizes?',
        chk: { kind: 'triAng', a: [x1, x2, x3], right: good ? 2 : 0 }
      };
    }
    if (shape === 'range') {
      var p = R.int(3, 12), r = R.intNot(3, 15, p), mn = Math.abs(p - r) + 1, mxv = p + r - 1;
      return {
        q: 'Two sides of a triangle are $' + p + '$ cm and $' + r + '$ cm. The third side is a whole number of centimeters. What are the shortest and the longest it can be?',
        a: { t: 'multi', parts: [{ label: 'Shortest (cm)', a: N(mn) }, { label: 'Longest (cm)', a: N(mxv) }] },
        steps: ['The third side must be less than $' + p + ' + ' + r + ' = ' + (p + r) + '$, or the other two could not reach around it.', 'It must be more than $' + Math.max(p, r) + ' - ' + Math.min(p, r) + ' = ' + Math.abs(p - r) + '$, or it could not reach across the gap left by the other two.', 'So it is between $' + Math.abs(p - r) + '$ and $' + (p + r) + '$, not equal to either: the shortest whole number is $' + mn + '$ and the longest is $' + mxv + '$.'],
        hint: 'The third side must be less than the sum of the other two and more than their difference.',
        chk: { kind: 'triRange', p: p, r: r }
      };
    }
    var sets = [], goodSet;
    do { var A2 = R.int(3, 10), B2 = R.int(3, 10); goodSet = [A2, B2, R.int(Math.abs(A2 - B2) + 1, A2 + B2 - 1)]; } while (goodSet[2] < 2);
    for (var k = 0; k < 3; k++) { var A3 = R.int(2, 8), B3 = R.int(2, 8); sets.push([A3, B3, A3 + B3 + (k === 0 ? 0 : R.int(1, 5))]); }
    function fmt(st) { return '$' + R.shuffle(st).join(',\\ ') + '$'; }
    var gs = fmt(goodSet);
    return {
      q: 'Which set of side lengths can form a triangle?',
      a: mcq(gs, sets.map(fmt)),
      steps: ['For each set, add the two shorter lengths and compare with the longest.', 'Only ' + gs + ' passes: the two shorter sides add to more than the longest.', 'In the other sets the two shorter sides add to the longest or less, so they cannot meet to make a corner.'],
      hint: 'In a triangle, the two shorter sides must add to more than the longest side.',
      chk: { kind: 'triPick', good: goodSet }
    };
  });

  /* answers that use 3.14 accept the exact value of pi too (and 22/7), but not real mistakes */
  function piTol(v) { return U.fix(Math.round((0.003 * Math.abs(v) + 0.01) * 1000) / 1000); }
  G('g7.circumference', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['fromD', 'fromR', 'exact', 'back', 'wheel', 'exactBack'], BL(ctx, [4, 3, 2, 0, 1, 0], [2, 3, 2, 2, 1, 1], [1, 2, 1, 2, 2, 2]));
    var d = R.int(2, BL(ctx, 20, 30, 50)), r = d / 2, unit = R.pick(['centimeters', 'inches', 'meters', 'feet']);
    if (shape === 'fromD' || shape === 'fromR') {
      var useR = shape === 'fromR', rr = R.int(2, 15), dd2 = useR ? 2 * rr : d, C = q('3.14').mul(dd2);
      return {
        q: 'A circle has a ' + (useR ? 'radius of $' + rr : 'diameter of $' + dd2) + '$ ' + unit + '. Find its circumference. Use $3.14$ for $\\pi$.',
        a: { t: 'num', v: dd(C), tol: piTol(C.toNumber()) },
        steps: (useR ? ['The diameter is twice the radius: $d = 2 \\times ' + rr + ' = ' + dd2 + '$ ' + unit + '.'] : []).concat(['The circumference is $\\pi$ times the diameter: $C = \\pi d$.', '$C \\approx 3.14 \\times ' + dd2 + ' = ' + dd(C) + '$ ' + unit]),
        hint: useR ? 'Use C = 2πr: double the radius first, or multiply by 2 and by π.' : 'Multiply the diameter by π.',
        chk: { kind: 'circ', d: dd2, approx: true }
      };
    }
    if (shape === 'exact') {
      var useR2 = R.coin(), r2 = R.int(2, 15), d2 = useR2 ? 2 * r2 : R.int(3, 25);
      return {
        q: 'A circle has a ' + (useR2 ? 'radius of $' + r2 : 'diameter of $' + d2) + '$ ' + unit + '. Find its exact circumference, in terms of $\\pi$.',
        a: N(d2 + '*pi'),
        steps: ['$C = \\pi d' + (useR2 ? ' = 2\\pi r' : '') + '$.', (useR2 ? '$C = 2 \\times \\pi \\times ' + r2 : '$C = \\pi \\times ' + d2) + ' = ' + d2 + '\\pi$ ' + unit + '.', 'Leaving the answer as $' + d2 + '\\pi$ keeps it exact. (It is about $' + dd(q('3.14').mul(d2)) + '$.)'],
        hint: 'Write the answer as a number times π.',
        chk: { kind: 'circ', d: d2, approx: false }
      };
    }
    if (shape === 'back') {
      var dB = R.int(3, 30), CB = q('3.14').mul(dB), askR = R.coin();
      return {
        q: 'The circumference of a circle is $' + dd(CB) + '$ ' + unit + '. Find its ' + (askR ? 'radius' : 'diameter') + '. Use $3.14$ for $\\pi$.',
        a: { t: 'num', v: askR ? dd(q(dB).div(2)) : String(dB), tol: U.fix(piTol(dB) / 4 + 0.01) },
        steps: ['$C = \\pi d$, so $d = C \\div \\pi$.', '$d \\approx ' + dd(CB) + ' \\div 3.14 = ' + dB + '$ ' + unit + '.'].concat(askR ? ['The radius is half the diameter: $r = ' + dd(q(dB).div(2)) + '$ ' + unit + '.'] : []),
        hint: 'Undo multiplying by π: divide the circumference by π.',
        chk: { kind: 'circBack', C: CB.toPlain(), r: askR }
      };
    }
    if (shape === 'exactBack') {
      var dE = R.int(3, 30), askR2 = dE % 2 === 0 && R.coin();
      return {
        q: 'A circle has a circumference of $' + dE + '\\pi$ ' + unit + '. What is its ' + (askR2 ? 'radius' : 'diameter') + '?',
        a: N(askR2 ? dE / 2 : dE),
        steps: ['$C = \\pi d$, and here $C = ' + dE + '\\pi$.', 'So $d = ' + dE + '$ ' + unit + '.'].concat(askR2 ? ['The radius is half of that: $r = ' + dE / 2 + '$ ' + unit + '.'] : []),
        hint: 'Compare ' + dE + 'π with C = πd.',
        chk: { kind: 'val', v: String(askR2 ? dE / 2 : dE) }
      };
    }
    var dw = R.pick([20, 24, 26, 28]), turns = BL(ctx, 1, R.int(2, 10), R.int(10, 50)), dist = q('3.14').mul(dw).mul(turns);
    return {
      q: 'A bike wheel has a diameter of $' + dw + '$ inches. How far does the bike roll when the wheel turns ' + (turns === 1 ? 'once' : '$' + turns + '$ times') + ', in inches? Use $3.14$ for $\\pi$.',
      a: { t: 'num', v: dd(dist), tol: piTol(dist.toNumber()) },
      steps: ['In one turn, the wheel rolls out its whole circumference: $C = \\pi d \\approx 3.14 \\times ' + dw + ' = ' + dd(q('3.14').mul(dw)) + '$ inches.'].concat(turns > 1 ? ['For $' + turns + '$ turns: $' + dd(q('3.14').mul(dw)) + ' \\times ' + turns + ' = ' + dd(dist) + '$ inches.'] : []),
      hint: 'One turn rolls the circumference along the ground.',
      chk: { kind: 'wheel', d: dw, n: turns }
    };
  });

  G('g7.circle-area', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['fromR', 'fromD', 'exact', 'half', 'back', 'fromC'], BL(ctx, [4, 2, 3, 0, 0, 0], [3, 3, 2, 2, 1, 0], [2, 2, 2, 2, 2, 2]));
    var unit = R.pick(['centimeters', 'inches', 'meters', 'feet']);
    if (shape === 'fromR' || shape === 'fromD') {
      var r = R.int(2, 15), useD = shape === 'fromD', A = q('3.14').mul(r * r);
      return {
        q: 'A circle has a ' + (useD ? 'diameter of $' + 2 * r : 'radius of $' + r) + '$ ' + unit + '. Find its area. Use $3.14$ for $\\pi$.',
        a: { t: 'num', v: dd(A), tol: piTol(A.toNumber()) },
        steps: (useD ? ['The area formula uses the radius, half the diameter: $r = ' + 2 * r + ' \\div 2 = ' + r + '$.'] : []).concat(['$A = \\pi r^2 \\approx 3.14 \\times ' + r + '^2$ $= 3.14 \\times ' + r * r + ' = ' + dd(A) + '$ square ' + unit + '.']),
        hint: useD ? 'Halve the diameter to get the radius, then use A = πr².' : 'Square the radius, then multiply by π.',
        chk: { kind: 'carea', r: r, approx: true }
      };
    }
    if (shape === 'exact') {
      var r2 = R.int(2, 15), useD2 = R.coin();
      return {
        q: 'A circle has a ' + (useD2 ? 'diameter of $' + 2 * r2 : 'radius of $' + r2) + '$ ' + unit + '. Find its exact area, in terms of $\\pi$.',
        a: N(r2 * r2 + '*pi'),
        steps: (useD2 ? ['Radius: $' + 2 * r2 + ' \\div 2 = ' + r2 + '$.'] : []).concat(['$A = \\pi r^2 = \\pi \\times ' + r2 + '^2 = ' + r2 * r2 + '\\pi$ square ' + unit + '.']),
        hint: 'A = πr². Square the radius and keep π as π.',
        chk: { kind: 'carea', r: r2, approx: false }
      };
    }
    if (shape === 'half') {
      var r3 = R.int(2, 12) * 2, exact = R.coin();
      return {
        q: 'A semicircle (half a circle) has a diameter of $' + 2 * r3 + '$ ' + unit + '. Find its area' + (exact ? ', in terms of $\\pi$.' : '. Use $3.14$ for $\\pi$.'),
        a: exact ? N(r3 * r3 / 2 + '*pi') : { t: 'num', v: dd(q('3.14').mul(r3 * r3).div(2)), tol: piTol(3.14 * r3 * r3 / 2) },
        steps: ['The radius is $' + 2 * r3 + ' \\div 2 = ' + r3 + '$.', 'A whole circle would have area $\\pi \\times ' + r3 + '^2 = ' + r3 * r3 + '\\pi$.', 'Half of it: $' + r3 * r3 + '\\pi \\div 2 = ' + r3 * r3 / 2 + '\\pi' + (exact ? '' : ' \\approx ' + dd(q('3.14').mul(r3 * r3).div(2))) + '$ square ' + unit + '.'],
        hint: 'Find the area of the whole circle, then take half.',
        chk: { kind: 'semi', r: r3, approx: !exact }
      };
    }
    if (shape === 'back') {
      var r4 = R.int(2, 12);
      return {
        q: 'A circle has an area of $' + r4 * r4 + '\\pi$ square ' + unit + '. What is its radius?',
        a: N(r4),
        steps: ['$A = \\pi r^2$, so $\\pi r^2 = ' + r4 * r4 + '\\pi$ and $r^2 = ' + r4 * r4 + '$.', 'Which number times itself is $' + r4 * r4 + '$? $r = ' + r4 + '$ ' + unit + '.'],
        hint: 'Compare with A = πr²: what is r²?',
        chk: { kind: 'val', v: String(r4) }
      };
    }
    var r5 = R.int(2, 12);
    return {
      q: 'A circle has a circumference of $' + 2 * r5 + '\\pi$ ' + unit + '. Find its exact area, in terms of $\\pi$.',
      a: N(r5 * r5 + '*pi'),
      steps: ['$C = 2\\pi r = ' + 2 * r5 + '\\pi$, so $r = ' + r5 + '$.', '$A = \\pi r^2 = \\pi \\times ' + r5 + '^2 = ' + r5 * r5 + '\\pi$ square ' + unit + '.'],
      hint: 'Use the circumference to find the radius first.',
      chk: { kind: 'carea', r: r5, approx: false }
    };
  });

  var SLICES = [
    { q: 'A box shaped like a right rectangular prism (not a cube) is sliced by a plane parallel to its base. What shape is the cross-section?', good: 'A rectangle the same size and shape as the base', bad: ['A triangle', 'A smaller rectangle', 'A trapezoid'], why: 'Every slice parallel to the base cuts all four side faces at the same height, and each side face is a rectangle with straight vertical edges. So the slice is an exact copy of the base.' },
    { q: 'A right rectangular prism is sliced by a plane perpendicular to the base and parallel to the front face. What shape is the cross-section?', good: 'A rectangle the same size as the front face', bad: ['A triangle', 'A square, always', 'A trapezoid'], why: 'The slice runs straight up and down, parallel to the front face, so it is a copy of the front face: a rectangle.' },
    { q: 'A right pyramid with a square base is sliced by a plane parallel to its base, partway up. What shape is the cross-section?', good: 'A square smaller than the base', bad: ['A square the same size as the base', 'A triangle', 'A rectangle that is not a square'], why: 'The slice has the same shape as the base, a square, but the faces lean in toward the top point, so the square is smaller the higher you cut.' },
    { q: 'A right pyramid with a square base is sliced straight down through its top point, parallel to one edge of the base. What shape is the cross-section?', good: 'A triangle', bad: ['A square', 'A trapezoid', 'A rectangle'], why: 'The slice goes through the top point and across the base, so it has a corner at the top and a flat bottom: a triangle.' },
    { q: 'A right pyramid with a square base is sliced straight up and down, parallel to one edge of the base, but not through the top point. What shape is the cross-section?', good: 'A trapezoid', bad: ['A triangle', 'A square', 'A rectangle'], why: 'The bottom edge of the slice is as wide as the base, but the slanted sides get closer together as you go up, and the slice stops before the top point. That leaves a flat top that is shorter than the bottom: a trapezoid.' },
    { q: 'A corner is sliced off a cube by a plane that cuts the three edges meeting at that corner. What shape is the cross-section?', good: 'A triangle', bad: ['A square', 'A rectangle', 'A hexagon'], why: 'The plane cuts three faces near the corner, one straight cut on each face, so the cross-section has three sides: a triangle.' },
    { q: 'A cube is sliced by a plane parallel to one of its faces. What shape is the cross-section?', good: 'A square the same size as a face', bad: ['A rectangle that is not a square', 'A triangle', 'A smaller square'], why: 'A slice parallel to a face is an exact copy of that face, and every face of a cube is a square.' }
  ];
  G('g7.cross-sections', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['name', 'area', 'pyr'], BL(ctx, [5, 2, 0], [3, 3, 0], [3, 3, 2]));
    if (shape === 'name') {
      var S = R.pick(SLICES);
      return {
        q: S.q,
        a: mcq(S.good, S.bad),
        steps: [S.why, 'So the cross-section is: ' + S.good.charAt(0).toLowerCase() + S.good.slice(1) + '.'],
        hint: 'Picture where the plane cuts each face. Each cut is one side of the cross-section.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'area') {
      var l = R.int(3, 12), w = R.intNot(2, 10, l), h = R.intNot(2, 15, [l, w]), par = R.pick(['base', 'front', 'side']);
      var dims = par === 'base' ? [l, w] : par === 'front' ? [l, h] : [w, h];
      return {
        q: 'A right rectangular prism is $' + l + '$ in. long, $' + w + '$ in. wide and $' + h + '$ in. tall. It is sliced by a plane parallel to its ' + (par === 'base' ? 'base (the bottom face)' : par === 'front' ? 'front face (the face that is ' + l + ' in. long and ' + h + ' in. tall)' : 'side face (the face that is ' + w + ' in. wide and ' + h + ' in. tall)') + '. What is the area of the cross-section, in square inches?',
        a: N(dims[0] * dims[1]),
        steps: ['A slice parallel to a face of a prism is a copy of that face.', 'That face is a $' + dims[0] + '$ in. by $' + dims[1] + '$ in. rectangle.', 'Area $= ' + dims[0] + ' \\times ' + dims[1] + ' = ' + dims[0] * dims[1] + '$ square inches.'],
        hint: 'Which face is the slice a copy of?',
        chk: { kind: 'val', v: String(dims[0] * dims[1]) }
      };
    }
    var s = R.int(2, 8) * 2, frac = R.pick([2, 2, 4]), side = s / frac * (frac === 4 ? 1 : 1);
    var up = frac === 2 ? 'halfway up' : 'three-quarters of the way up';
    var sd = frac === 2 ? s / 2 : s / 4;
    return {
      q: 'A right pyramid has a square base with sides of $' + s + '$ cm. It is sliced parallel to the base, ' + up + ' from the base to the top point. What is the area of the cross-section, in square centimeters?',
      a: N(sd * sd),
      steps: ['The sides of the pyramid shrink evenly from the full base (at the bottom) to a point (at the top).', (frac === 2 ? 'Halfway up, the square is half as wide: ' : 'Three-quarters of the way up, only a quarter of the width is left: ') + '$' + s + ' \\times ' + (frac === 2 ? '\\frac{1}{2}' : '\\frac{1}{4}') + ' = ' + sd + '$ cm on each side.', 'Area $= ' + sd + ' \\times ' + sd + ' = ' + sd * sd + '$ square centimeters.'],
      hint: 'How wide is the pyramid at that height?',
      chk: { kind: 'val', v: String(sd * sd) }
    };
  });

  G('g7.surface-area-problems', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['Lshape', 'house', 'frame', 'box', 'cube', 'tri', 'open'], BL(ctx, [3, 2, 0, 3, 1, 0, 0], [2, 2, 2, 2, 1, 2, 0], [1, 1, 1, 2, 0, 3, 2]));
    var UP = R.pick([['cm', 'centimeters'], ['in.', 'inches'], ['ft', 'feet'], ['m', 'meters']]), u = UP[0], uw = UP[1], uu = uw;
    if (shape === 'Lshape') {
      var W = R.int(8, 16), H = R.int(7, 14), w = R.int(2, W - 4), h = R.int(2, H - 3);
      var opts = { kind: '2d', shapes: [{ pts: [[0, 0], [W, 0], [W, H - h], [W - w, H - h], [W - w, H], [0, H]] }], dims: [{ a: [0, 0], b: [W, 0], text: W + ' ' + u }, { a: [0, H], b: [0, 0], text: H + ' ' + u }, { a: [W - w, H], b: [W - w, H - h], text: h + ' ' + u, side: -1 }, { a: [W - w, H - h], b: [W, H - h], text: w + ' ' + u, side: -1 }] };
      return {
        q: 'Find the area of this L-shaped figure, in square ' + uw + '. All corners are right angles.',
        viz: { name: 'g7-figure', opts: opts, label: 'An L-shaped figure: a ' + W + ' by ' + H + ' rectangle with a ' + w + ' by ' + h + ' corner cut out.' },
        a: N(W * H - w * h),
        steps: ['Think of a full $' + W + ' \\times ' + H + '$ rectangle with a $' + w + ' \\times ' + h + '$ corner removed.', 'Full rectangle: $' + W + ' \\times ' + H + ' = ' + W * H + '$. Missing corner: $' + w + ' \\times ' + h + ' = ' + w * h + '$.', 'Area $= ' + W * H + ' - ' + w * h + ' = ' + (W * H - w * h) + '$ square ' + uu + '.', 'Check another way: cut it into two rectangles, $' + (W - w) + ' \\times ' + H + ' = ' + (W - w) * H + '$ and $' + w + ' \\times ' + (H - h) + ' = ' + w * (H - h) + '$, which add to $' + ((W - w) * H + w * (H - h)) + '$ ✓.'],
        hint: 'Split it into rectangles, or subtract the missing corner from a big rectangle.',
        chk: { kind: 'fig2d' }
      };
    }
    if (shape === 'house') {
      var bw = R.int(3, 8) * 2, bh = R.int(4, 10), th = R.int(2, 7);
      var o2 = { kind: '2d', shapes: [{ pts: [[0, 0], [bw, 0], [bw, bh], [bw / 2, bh + th], [0, bh]] }], lines: [[[0, bh], [bw, bh]], [[bw / 2, bh], [bw / 2, bh + th]]], dims: [{ a: [0, 0], b: [bw, 0], text: bw + ' ' + u }, { a: [bw, 0], b: [bw, bh], text: bh + ' ' + u, side: -1 }, { a: [bw / 2, bh + th], b: [bw / 2, bh], text: th + ' ' + u, side: -1, inside: true }] };
      return {
        q: 'The figure is a rectangle with a triangle on top. Find its total area, in square ' + uu + '.',
        viz: { name: 'g7-figure', opts: o2, label: 'A ' + bw + ' by ' + bh + ' rectangle with a triangle of height ' + th + ' on top.' },
        a: N(bw * bh + bw * th / 2),
        steps: ['Rectangle: $' + bw + ' \\times ' + bh + ' = ' + bw * bh + '$.', 'Triangle: base $' + bw + '$, height $' + th + '$, so $\\frac{1}{2} \\times ' + bw + ' \\times ' + th + ' = ' + bw * th / 2 + '$.', 'Total: $' + bw * bh + ' + ' + bw * th / 2 + ' = ' + (bw * bh + bw * th / 2) + '$ square ' + uu + '.'],
        hint: 'Find the rectangle and the triangle separately, then add.',
        chk: { kind: 'fig2d' }
      };
    }
    if (shape === 'frame') {
      var FW = R.int(8, 14), FH = R.int(6, 12), bd = R.int(1, 2), iw = FW - 2 * bd, ih = FH - 2 * bd;
      return {
        q: 'A picture frame is a $' + FW + '$ ' + uw + ' by $' + FH + '$ ' + uw + ' rectangle with a $' + iw + '$ ' + uw + ' by $' + ih + '$ ' + uw + ' rectangle cut out of the middle. What is the area of the frame itself, in square ' + uu + '?',
        viz: { name: 'g7-figure', opts: { kind: '2d', shapes: [{ pts: [[0, 0], [FW, 0], [FW, FH], [0, FH]] }, { pts: [[bd, bd], [FW - bd, bd], [FW - bd, FH - bd], [bd, FH - bd]], hole: true }], dims: [{ a: [0, 0], b: [FW, 0], text: FW + ' ' + u }, { a: [FW, 0], b: [FW, FH], text: FH + ' ' + u, side: -1 }, { a: [bd, FH - bd], b: [FW - bd, FH - bd], text: iw + ' ' + u, side: 1, inside: true }, { a: [bd, bd], b: [bd, FH - bd], text: ih + ' ' + u, side: 1, inside: true }] }, label: 'A rectangular frame.' },
        a: N(FW * FH - iw * ih),
        steps: ['Outer rectangle: $' + FW + ' \\times ' + FH + ' = ' + FW * FH + '$.', 'Hole: $' + iw + ' \\times ' + ih + ' = ' + iw * ih + '$.', 'Frame: $' + FW * FH + ' - ' + iw * ih + ' = ' + (FW * FH - iw * ih) + '$ square ' + uu + '.'],
        hint: 'Subtract the area of the hole from the area of the whole rectangle.',
        chk: { kind: 'fig2d' }
      };
    }
    if (shape === 'box' || shape === 'open') {
      var l = R.int(3, 12), w2 = R.intNot(2, 10, l), h2 = R.intNot(2, 10, [l, w2]);
      var full = 2 * (l * w2 + l * h2 + w2 * h2), ans = shape === 'open' ? full - l * w2 : full;
      return {
        q: shape === 'open' ? 'An open box (no top) is $' + l + '$ ' + uw + ' long, $' + w2 + '$ ' + uw + ' wide and $' + h2 + '$ ' + uw + ' tall. How much cardboard is needed to make it, in square ' + uu + '?' : 'Find the surface area of a rectangular prism that is $' + l + '$ ' + uw + ' long, $' + w2 + '$ ' + uw + ' wide and $' + h2 + '$ ' + uw + ' tall, in square ' + uu + '.',
        viz: { name: 'g7-figure', opts: { kind: 'prism', base: [[0, 0], [l, 0], [l, h2], [0, h2]], depth: w2, dims: [{ a: [0, 0, 0], b: [l, 0, 0], text: l + ' ' + u }, { a: [l, 0, 0], b: [l, h2, 0], text: h2 + ' ' + u, side: -1 }, { a: [l, 0, 0], b: [l, 0, 1], text: w2 + ' ' + u, side: -1 }], open: shape === 'open' }, label: 'A rectangular prism ' + l + ' by ' + w2 + ' by ' + h2 + '.' },
        a: N(ans),
        steps: ['The faces come in pairs: top and bottom ($' + l + ' \\times ' + w2 + ' = ' + l * w2 + '$ each), front and back ($' + l + ' \\times ' + h2 + ' = ' + l * h2 + '$ each), left and right ($' + w2 + ' \\times ' + h2 + ' = ' + w2 * h2 + '$ each).', 'All six: $2(' + l * w2 + ' + ' + l * h2 + ' + ' + w2 * h2 + ') = ' + full + '$.'].concat(shape === 'open' ? ['With no top, take away one $' + l * w2 + '$ face: $' + full + ' - ' + l * w2 + ' = ' + ans + '$ square ' + uu + '.'] : ['The surface area is $' + full + '$ square ' + uu + '.']),
        hint: 'Add the areas of all the faces. Opposite faces match.',
        chk: { kind: 'box', l: l, w: w2, h: h2, open: shape === 'open' }
      };
    }
    if (shape === 'cube') {
      var s = R.int(2, 12);
      return {
        q: 'A cube has edges that are $' + s + '$ ' + uw + ' long. What is its surface area, in square ' + uu + '?',
        a: N(6 * s * s),
        steps: ['A cube has 6 faces, and each is a $' + s + ' \\times ' + s + '$ square: $' + s * s + '$.', 'Surface area $= 6 \\times ' + s * s + ' = ' + 6 * s * s + '$ square ' + uu + '.'],
        hint: 'A cube has 6 identical square faces.',
        chk: { kind: 'val', v: String(6 * s * s) }
      };
    }
    var trip = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]), Lp = R.int(4, 15);
    var tA = trip[0] * trip[1] / 2, SA = 2 * tA + (trip[0] + trip[1] + trip[2]) * Lp;
    return {
      q: 'A triangular prism has bases that are right triangles with sides $' + trip.join('$, $') + '$ ' + uw + ' (the legs are ' + trip[0] + ' and ' + trip[1] + '). The prism is $' + Lp + '$ ' + uw + ' long. Find its surface area, in square ' + uu + '.',
      viz: { name: 'g7-figure', opts: { kind: 'prism', base: [[0, 0], [trip[1], 0], [0, trip[0]]], depth: Lp, dscale: 0.5, dims: [{ a: [0, 0, 0], b: [trip[1], 0, 0], text: trip[1] + ' ' + u }, { a: [0, trip[0], 0], b: [0, 0, 0], text: trip[0] + ' ' + u }, { a: [trip[1], 0, 0], b: [0, trip[0], 0], text: trip[2] + ' ' + u, side: -1 }, { a: [trip[1], 0, 0], b: [trip[1], 0, 1], text: Lp + ' ' + u, side: -1 }] }, label: 'A triangular prism.' },
      a: N(SA),
      steps: ['Two triangle bases: each is $\\frac{1}{2} \\times ' + trip[0] + ' \\times ' + trip[1] + ' = ' + tA + '$, so $' + 2 * tA + '$ together.', 'Three rectangles, one for each side of the triangle, all $' + Lp + '$ long: $(' + trip.join(' + ') + ') \\times ' + Lp + ' = ' + (trip[0] + trip[1] + trip[2]) * Lp + '$.', 'Surface area $= ' + 2 * tA + ' + ' + (trip[0] + trip[1] + trip[2]) * Lp + ' = ' + SA + '$ square ' + uu + '.'],
      hint: 'Two triangles plus three rectangles. Unfold it in your head into a net.',
      chk: { kind: 'triPrism', a: trip[0], b: trip[1], c: trip[2], L: Lp }
    };
  });

  G('g7.volume-prisms', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['box', 'tri', 'B', 'trap', 'comp', 'missing'], BL(ctx, [4, 3, 2, 0, 0, 0], [3, 3, 1, 1, 1, 1], [2, 3, 1, 2, 2, 2]));
    var UP = R.pick([['cm', 'centimeters'], ['in.', 'inches'], ['ft', 'feet'], ['m', 'meters']]), u = UP[0], uw = UP[1], uu = uw;
    if (shape === 'box') {
      var l = q(R.pick(BL(ctx, [3, 4, 5, 6, 8], ['5/2', 3, '3/2', 4, '7/2', 6], ['5/2', '9/4', '3/2', '4/3', '7/2']))), w = q(R.int(2, 6)), h = q(R.pick(BL(ctx, [2, 3, 4, 5], ['1/2', 2, '5/2', 3], ['3/4', '1/2', '5/2', 4])));
      var V = l.mul(w).mul(h);
      return {
        q: 'A box shaped like a rectangular prism is $' + mx(l) + '$ ' + uw + ' long, $' + mx(w) + '$ ' + uw + ' wide and $' + mx(h) + '$ ' + uw + ' tall. What is its volume, in cubic ' + uu + '?',
        a: N(V),
        steps: ['The base is the bottom rectangle: $B = ' + mx(l) + ' \\times ' + mx(w) + ' = ' + mx(l.mul(w)) + '$ square ' + uu + '.', 'Volume = base area × height: $V = Bh = ' + mx(l.mul(w)) + ' \\times ' + mx(h) + ' = ' + mx(V) + '$ cubic ' + uu + '.'],
        hint: 'V = Bh: the area of the base times the height.',
        chk: { kind: 'prod', f: [l.toPlain(), w.toPlain(), h.toPlain()] }
      };
    }
    if (shape === 'tri') {
      var b = R.int(2, 10) * 2, ht = R.int(3, 10), Lp = R.int(4, 15), Bt = b * ht / 2, slant = R.int(Math.max(ht, b / 2) + 1, ht + b);
      return {
        q: 'A triangular prism has triangle bases with a base of $' + b + '$ ' + uw + ' and a height of $' + ht + '$ ' + uw + '. The prism is $' + Lp + '$ ' + uw + ' long. What is its volume, in cubic ' + uu + '?',
        viz: { name: 'g7-figure', opts: { kind: 'prism', base: [[0, 0], [b, 0], [b * 0.35, ht]], depth: Lp, dscale: 0.5, heightLine: [[b * 0.35, ht], [b * 0.35, 0]], dims: [{ a: [0, 0, 0], b: [b, 0, 0], text: b + ' ' + u }, { a: [b * 0.35, ht, 0], b: [b * 0.35, 0, 0], text: ht + ' ' + u, side: -1, inside: true }, { a: [b, 0, 0], b: [b, 0, 1], text: Lp + ' ' + u, side: -1 }] }, label: 'A triangular prism with triangle base ' + b + ', triangle height ' + ht + ', and length ' + Lp + '.' },
        a: N(Bt * Lp),
        steps: ['The base $B$ is the triangle (the face that is the same all the way through the prism), not a rectangle side.', '$B = \\frac{1}{2} \\times ' + b + ' \\times ' + ht + ' = ' + Bt + '$ square ' + uu + '.', 'The "height" of the prism is its length, $' + Lp + '$, the distance between the two triangles: $V = Bh = ' + Bt + ' \\times ' + Lp + ' = ' + Bt * Lp + '$ cubic ' + uu + '.'],
        hint: 'Find the area of the triangle first. Then multiply by the length of the prism.',
        chk: { kind: 'prod', f: ['1/2', b, ht, Lp] }
      };
    }
    if (shape === 'B') {
      var B = R.int(6, 60), hh = R.int(2, 12), poly = R.pick(['hexagon', 'pentagon', 'trapezoid', 'octagon']);
      return {
        q: 'A prism has a base shaped like a ' + poly + ' with an area of $' + B + '$ square ' + uu + '. The prism is $' + hh + '$ ' + uw + ' tall. What is its volume, in cubic ' + uu + '?',
        a: N(B * hh),
        steps: ['For every prism, $V = Bh$: each layer has the same shape as the base, and there are $h$ layers of thickness 1.', '$V = ' + B + ' \\times ' + hh + ' = ' + B * hh + '$ cubic ' + uu + '.'],
        hint: 'V = Bh works for any prism, whatever the shape of the base.',
        chk: { kind: 'prod', f: [B, hh] }
      };
    }
    if (shape === 'trap') {
      var b1 = R.int(3, 10), b2 = b1 + R.int(2, 8), th = R.int(2, 8) * 2, Lt = R.int(3, 12), Bz = (b1 + b2) * th / 2;
      return {
        q: 'A prism has bases shaped like a trapezoid with parallel sides $' + b1 + '$ ' + uw + ' and $' + b2 + '$ ' + uw + ' and height $' + th + '$ ' + uw + '. The prism is $' + Lt + '$ ' + uw + ' long. Find its volume, in cubic ' + uu + '.',
        a: N(Bz * Lt),
        steps: ['Base area (trapezoid): $\\frac{1}{2}(' + b1 + ' + ' + b2 + ') \\times ' + th + ' = ' + Bz + '$.', '$V = Bh = ' + Bz + ' \\times ' + Lt + ' = ' + Bz * Lt + '$ cubic ' + uu + '.'],
        hint: 'Trapezoid area is half the sum of the parallel sides times the height.',
        chk: { kind: 'prod', f: ['1/2', b1 + b2, th, Lt] }
      };
    }
    if (shape === 'comp') {
      var A1 = [R.int(4, 9), R.int(3, 6), R.int(2, 5)], A2 = [R.int(2, A1[0] - 1), A1[1], R.int(2, 6)];
      var V1 = A1[0] * A1[1] * A1[2], V2 = A2[0] * A2[1] * A2[2];
      return {
        q: 'A solid is made of two boxes. The bottom box is $' + A1.join(' \\times ') + '$ ' + uw + ' (length × width × height). A smaller box, $' + A2.join(' \\times ') + '$ ' + uw + ', sits on top. What is the total volume, in cubic ' + uu + '?',
        a: N(V1 + V2),
        steps: ['Bottom box: $' + A1.join(' \\times ') + ' = ' + V1 + '$.', 'Top box: $' + A2.join(' \\times ') + ' = ' + V2 + '$.', 'Volumes of pieces that do not overlap add: $' + V1 + ' + ' + V2 + ' = ' + (V1 + V2) + '$ cubic ' + uu + '.'],
        hint: 'Find each box\'s volume, then add.',
        chk: { kind: 'sum2', a: A1, b: A2 }
      };
    }
    var l2 = R.int(3, 10), w2 = R.int(2, 8), h2 = R.int(2, 9);
    return {
      q: 'A fish tank shaped like a rectangular prism holds $' + l2 * w2 * h2 + '$ cubic ' + uu + '. Its base is $' + l2 + '$ ' + uw + ' by $' + w2 + '$ ' + uw + '. How tall is it, in ' + uu + '?',
      a: N(h2),
      steps: ['$V = Bh$, and the base area is $B = ' + l2 + ' \\times ' + w2 + ' = ' + l2 * w2 + '$.', 'So $' + l2 * w2 + 'h = ' + l2 * w2 * h2 + '$, and $h = ' + l2 * w2 * h2 + ' \\div ' + l2 * w2 + ' = ' + h2 + '$ ' + uu + '.'],
      hint: 'Divide the volume by the area of the base.',
      chk: { kind: 'val', v: String(h2) }
    };
  });
  /* ============================================================ Unit 8: Sampling and comparing data */

  var SAMPLE_SCEN = [
    { pop: 'the 800 students at a middle school', ask: 'how many hours of sleep the students get on school nights', who: 'A student council member',
      random: ['Number the students from 1 to 800 and use a random number generator to choose 60 numbers.', 'Put every student\'s name into a computer list and let it choose 60 names at random.'],
      biased: ['Ask the 60 students who get to school earliest.', 'Ask 60 students in the after-school study club.', 'Ask the first 60 students who answer a poll on the school website.', 'Ask 60 of her friends.'] },
    { pop: 'the registered voters in a town', ask: 'whether the town\'s voters want a new skate park', who: 'A reporter',
      random: ['Choose 200 names at random from the full list of registered voters.', 'Give every voter on the town list a number and draw 200 numbers at random.'],
      biased: ['Ask 200 people at the skate shop.', 'Ask 200 people leaving the senior center.', 'Use the first 200 answers to a poll on the skate park\'s web page.', 'Ask 200 people who live next to the park site.'] },
    { pop: 'the 5,000 light bulbs a factory makes in one day', ask: 'what share of the day\'s bulbs are defective', who: 'A quality inspector',
      random: ['Test 50 bulbs chosen at random times across the whole day.', 'Number the day\'s bulbs and test the 50 whose numbers a random number generator picks.'],
      biased: ['Test the first 50 bulbs made in the morning.', 'Test 50 bulbs from the box on top of the pile.', 'Test 50 bulbs that a worker thinks look fine.', 'Test the last 50 bulbs, made just before closing.'] },
    { pop: 'the members of a large gym', ask: 'how many days a week the members exercise', who: 'The gym manager',
      random: ['Pick 40 member ID numbers at random from the full member list.', 'Have a computer choose 40 members at random from everyone signed up.'],
      biased: ['Ask the 40 people working out at 6 a.m. on Monday.', 'Ask 40 members who signed up for a marathon.', 'Ask the 40 members who reply first to an email.', 'Ask 40 members in the weight room.'] },
    { pop: 'the 7th graders in a school district', ask: 'which school lunch the students like best', who: 'A cafeteria worker',
      random: ['Use a random number generator to pick 100 students from a list of every 7th grader in the district.', 'Draw 100 names from a box that holds every 7th grader\'s name.'],
      biased: ['Ask the 100 students in the pizza line.', 'Ask every 7th grader in one school.', 'Ask the 100 students who stay latest at lunch.', 'Ask students who volunteer to answer.'] }
  ];
  G('g7.random-samples', function (R, ctx) {
    var L = lv(ctx), S = R.pick(SAMPLE_SCEN);
    var shape = R.pickW(['pick', 'tf', 'why', 'big'], BL(ctx, [4, 3, 0, 0], [3, 2, 2, 1], [3, 2, 2, 2]));
    var intro = S.who + ' wants to know ' + S.ask + '. The population is ' + S.pop + '.';
    if (shape === 'pick') {
      var good = R.pick(S.random), bad = R.sample(S.biased, 3);
      return {
        q: intro + ' Which plan gives a random sample?',
        a: mcq(good, bad),
        steps: ['In a random sample, every member of the population has the same chance to be chosen.', 'The plan "' + good + '" gives everyone the same chance, so it is random.', 'Each other plan leans toward one kind of person or thing, so its results may not match the whole population.'],
        hint: 'Which plan gives every member of the population the same chance to be picked?',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'tf' || shape === 'why') {
      var isRand = shape === 'tf' && R.coin(), plan = isRand ? R.pick(S.random) : R.pick(S.biased);
      if (shape === 'why') {
        var ch = ['Some members of the population were more likely to be chosen than others.', 'The sample is too small to tell us anything.', 'A sample can never tell us about a population.', 'Every member had the same chance to be chosen.'];
        return {
          q: intro + ' The plan is: "' + plan + '" Why might this sample be biased?',
          a: mcq(ch[0], ch.slice(1)),
          steps: ['A sample is biased when the way it is chosen favors some members of the population.', 'Here, the people or things chosen this way are likely to be different from the rest, so the results could be off in one direction.', 'A random sample avoids this: everyone has the same chance.'],
          hint: 'Did every member of the population have the same chance to be chosen?',
          chk: { kind: 'none' }
        };
      }
      return {
        q: intro + ' The plan is: "' + plan + '" True or false: this gives a random sample.',
        a: { t: 'tf', v: isRand },
        steps: isRand ? ['Every member of the population has the same chance to be chosen, so the sample is random.', 'A random sample is likely to represent the whole population.'] : ['Not every member has the same chance to be chosen. This plan favors some of them.', 'So the sample is not random, and it may be biased.'],
        hint: 'Random means every member had the same chance to be chosen.',
        chk: { kind: 'none' }
      };
    }
    var n = R.pick([2000, 5000, 8000]);
    return {
      q: 'A website asks visitors, "Do you like video games?" It gets $' + T.commas(n) + '$ answers, and $85\\%$ say yes. True or false: because the sample is so large, it shows that about $85\\%$ of all people in the country like video games.',
      a: { t: 'tf', v: false },
      steps: ['The people who answered chose themselves: they visited that website and decided to reply.', 'People who like video games are more likely to do that, so the sample is biased.', 'A large biased sample is still biased. A smaller random sample would be more trustworthy.'],
      hint: 'Who chose to answer? Did everyone have the same chance to be in the sample?',
      chk: { kind: 'none' }
    };
  });

  G('g7.sample-predictions', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['prop', 'mean', 'several', 'vary'], BL(ctx, [5, 1, 0, 1], [3, 2, 2, 1], [3, 2, 3, 1]));
    if (shape === 'prop') {
      var n = R.pick([20, 25, 40, 50, 60, 80, 100]), k = R.int(Math.ceil(n * 0.1), Math.floor(n * 0.8)), step = n / U.gcd(k, n), Np = step * R.int(Math.ceil(200 / step), Math.floor(3000 / step));
      var thing = R.pick([['students', 'prefer recess before lunch'], ['shoppers', 'brought their own bags'], ['fans', 'want a new team logo'], ['families', 'have a dog'], ['seventh graders', 'walk to school']]);
      return {
        q: 'In a random sample of $' + n + '$ ' + thing[0] + ', $' + k + '$ ' + thing[1] + '. There are $' + T.commas(Np) + '$ ' + thing[0] + ' in all. About how many of them ' + thing[1] + '?',
        a: N(Np * k / n),
        steps: ['The sample is random, so its proportion is a fair estimate for the whole group: $\\frac{' + k + '}{' + n + '}$.', 'Use the same proportion for the population: $\\frac{' + k + '}{' + n + '} \\times ' + T.commas(Np) + ' = ' + T.commas(Np * k / n) + '$.', 'This is an estimate: another random sample would give a slightly different number.'],
        hint: 'Set up equal ratios: sample part over sample size equals population part over population size.',
        chk: { kind: 'est', k: k, n: n, N: Np }
      };
    }
    if (shape === 'mean') {
      var m = q(R.pick(['1.5', '2.5', '1.2', '3.4', '0.8', '2.25'])), fam = R.pick([200, 300, 400, 500, 800, 1200]);
      var what = R.pick([['families', 'pets per family', 'pets'], ['students', 'books read last month', 'books'], ['households', 'bikes per household', 'bikes']]);
      return {
        q: 'A random sample of ' + what[0] + ' in a town has a mean of $' + dd(m) + '$ ' + what[1] + '. There are $' + T.commas(fam) + '$ ' + what[0] + ' in the town. Estimate the total number of ' + what[2] + '.',
        a: ND(m.mul(fam)),
        steps: ['The sample mean estimates the population mean: about $' + dd(m) + '$ for each of the ' + what[0] + '.', 'Total: $' + dd(m) + ' \\times ' + T.commas(fam) + ' = ' + T.commas(dd(m.mul(fam))) + '$ ' + what[2] + '.'],
        hint: 'Multiply the mean per ' + what[0].replace(/s$/, '') + ' by the number of ' + what[0] + '.',
        chk: { kind: 'mulq', a: m.toPlain(), b: fam }
      };
    }
    if (shape === 'several') {
      var nn = R.pick([20, 25, 50]), base = R.int(Math.round(nn * 0.2), Math.round(nn * 0.6)), xs = [base + R.int(-3, 3), base + R.int(-3, 3), base + R.int(-3, 3)];
      var tot = sum(xs); if (tot % 3) xs[2] += 3 - tot % 3; tot = sum(xs);
      var pctv = q(tot).div(3 * nn).mul(100);
      return {
        q: 'Three random samples of $' + nn + '$ students each were asked if they play an instrument. The numbers who said yes were $' + xs.join('$, $') + '$. Use all three samples to estimate the percent of all the students who play an instrument.',
        a: ND(pctv, { pct: true }),
        steps: ['The samples differ a little, as random samples do. Combining them gives a better estimate.', 'In all, $' + xs.join(' + ') + ' = ' + tot + '$ out of $3 \\times ' + nn + ' = ' + 3 * nn + '$ said yes.', '$\\frac{' + tot + '}{' + 3 * nn + '} = ' + dd(pctv.div(100)) + ' = ' + dd(pctv) + '\\%$.'],
        hint: 'Combine the samples: total yes over total asked.',
        chk: { kind: 'pool', xs: xs, n: nn }
      };
    }
    return {
      q: 'True or false: two random samples of the same size, taken from the same population, will always give exactly the same results.',
      a: { t: 'tf', v: false },
      steps: ['Each random sample picks different members, so the results vary from sample to sample.', 'That is normal. Larger samples tend to vary less, and many samples together show how much the estimates spread out.'],
      hint: 'Think about flipping a coin 20 times, twice. Do you always get the same number of heads?',
      chk: { kind: 'none' }
    };
  });

  G('g7.compare-populations', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['mad', 'judge', 'means', 'medians'], BL(ctx, [4, 2, 1, 0], [3, 2, 2, 1], [2, 2, 3, 2]));
    var topic = R.pick([['plant heights', 'cm', 'Fertilizer A', 'Fertilizer B'], ['quiz scores', 'points', 'Class 1', 'Class 2'], ['jump distances', 'inches', 'Team Red', 'Team Blue'], ['reaction times', 'hundredths of a second', 'Group 1', 'Group 2']]);
    if (shape === 'mad' || shape === 'judge') {
      var k = shape === 'judge' ? R.pick([0.5, 1, 3, 4]) : R.pick([1, 2, 3, 4, 0.5, 1.5]), mad = Number.isInteger(k) ? R.int(2, 8) : 2 * R.int(1, 4), m1 = R.int(30, 80), diff = U.fix(mad * k), m2 = U.fix(m1 + diff * R.sign());
      var ratio = q(Math.abs(m2 - m1)).div(mad);
      var stem = 'Two groups are compared on ' + topic[0] + ' (in ' + topic[1] + '). ' + topic[2] + ' has a mean of $' + m1 + '$ and ' + topic[3] + ' has a mean of $' + m2 + '$. Both groups have a mean absolute deviation (MAD) of $' + mad + '$.';
      if (shape === 'mad') {
        return {
          q: stem + ' How many MADs apart are the two means?',
          a: ND(ratio),
          steps: ['Difference of the means: $|' + m1 + ' - ' + m2 + '| = ' + Math.abs(m2 - m1) + '$.', 'Divide by the MAD to compare the gap with the spread: $' + Math.abs(m2 - m1) + ' \\div ' + mad + ' = ' + dd(ratio) + '$.', ratio.ge(2) ? 'A gap of 2 or more MADs means the groups overlap only a little: the difference is likely real.' : 'A gap this small compared with the spread means the groups overlap a lot.'],
          hint: 'Find the difference of the means, then divide by the MAD.',
          chk: { kind: 'ratio2', a: m1, b: m2, m: mad }
        };
      }
      var big = ratio.ge(2);
      return {
        q: stem + ' Which statement fits best?',
        a: mcFixed(['The groups overlap a lot. The difference in means is small compared with the spread.', 'The groups are clearly different. The means are far apart compared with the spread.'], big ? 1 : 0),
        steps: ['Compare the gap between the means with the MAD: $|' + m1 + ' - ' + m2 + '| \\div ' + mad + ' = ' + dd(ratio) + '$.', big ? 'The means are ' + dd(ratio) + ' MADs apart. The groups overlap only a little: a clear difference.' : 'The means are only ' + dd(ratio) + ' MAD' + (ratio.eq(1) ? '' : 's') + ' apart. The data overlap a lot, so the difference could easily come from ordinary variation.'],
        hint: 'Divide the difference in means by the MAD. About 2 or more means a clear difference.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'means') {
      var A = [], B = [], ma = R.int(10, 30), shift = R.int(2, 8);
      for (var i = 0; i < 5; i++) { A.push(ma + R.int(-4, 4)); B.push(ma + shift + R.int(-4, 4)); }
      var fixSum = function (arr) { var s = sum(arr); arr[4] += (5 - s % 5) % 5; return arr; };
      fixSum(A); fixSum(B);
      var mA = sum(A) / 5, mB = sum(B) / 5;
      if (mA === mB) { B = B.map(function (v) { return v + 1; }); mB += 1; }
      return {
        q: topic[2] + ': $' + A.join(', ') + '$. ' + topic[3] + ': $' + B.join(', ') + '$. These are ' + topic[0] + ' in ' + topic[1] + '. How much greater is the larger mean than the smaller mean?',
        a: N(Math.abs(mB - mA)),
        steps: ['Mean of ' + topic[2] + ': $(' + A.join(' + ') + ') \\div 5 = ' + sum(A) + ' \\div 5 = ' + mA + '$.', 'Mean of ' + topic[3] + ': $(' + B.join(' + ') + ') \\div 5 = ' + sum(B) + ' \\div 5 = ' + mB + '$.', 'Difference: $' + Math.max(mA, mB) + ' - ' + Math.min(mA, mB) + ' = ' + Math.abs(mB - mA) + '$.'],
        hint: 'Find each mean (add the values, divide by how many), then subtract.',
        chk: { kind: 'meandiff', A: A, B: B }
      };
    }
    var mult = R.pick([0.5, 1, 2, 3]), iqr = mult === 0.5 ? 2 * R.int(2, 6) : R.int(4, 12), md1 = R.int(20, 60), md2 = md1 + iqr * mult;
    var rr = q(md2 - md1).div(iqr);
    return {
      q: 'Box plots of ' + topic[0] + ' for two groups have medians of $' + md1 + '$ and $' + md2 + '$. Both have an interquartile range (IQR) of $' + iqr + '$. How many IQRs apart are the medians?',
      a: ND(rr),
      steps: ['Difference of the medians: $' + md2 + ' - ' + md1 + ' = ' + (md2 - md1) + '$.', 'Compare with the spread: $' + (md2 - md1) + ' \\div ' + iqr + ' = ' + dd(rr) + '$ IQRs.', rr.ge(1) ? 'The middle halves of the two groups barely overlap or do not overlap at all.' : 'The middle halves of the two groups overlap a lot.'],
      hint: 'Divide the difference of the medians by the IQR.',
      chk: { kind: 'ratio2', a: md1, b: md2, m: iqr }
    };
  });
  /* ============================================================ Unit 9: Probability */

  var LIKELY = ['impossible', 'unlikely', 'as likely as not', 'likely', 'certain'];
  G('g7.probability-scale', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['num2word', 'word2num', 'notprob', 'event'], BL(ctx, [3, 3, 1, 2], [2, 2, 2, 3], [2, 2, 2, 3]));
    if (shape === 'num2word') {
      var opts = [['0', 0], ['0.1', 1], ['\\frac{1}{8}', 1], ['0.2', 1], ['\\frac{1}{2}', 2], ['0.5', 2], ['50\\%', 2], ['0.85', 3], ['\\frac{9}{10}', 3], ['0.75', 3], ['1', 4], ['100\\%', 4], ['0.05', 1], ['95\\%', 3]];
      var o = R.pick(opts);
      if (R.chance(0.6)) { // a fresh value: a decimal, a percent or a fraction, with its word from where it sits on the scale
        var pv = R.pick([0, 1, 2, 2, 3, 3, 4]), num0, den0, form = R.pick(['dec', 'pct', 'frac']);
        if (pv === 0) { num0 = 0; den0 = 1; } else if (pv === 4) { num0 = 1; den0 = 1; } else if (pv === 2 && R.chance(0.3)) { num0 = 1; den0 = 2; }
        else { den0 = form === 'frac' ? R.pick([5, 6, 7, 8, 9, 10, 12]) : 20; num0 = pv === 1 ? R.int(1, Math.floor(den0 * 0.3)) : R.int(Math.ceil(den0 * 0.7), den0 - 1); }
        var val0 = num0 / den0, txt0 = num0 === 0 ? '0' : num0 === den0 ? '1' : form === 'frac' ? '\\frac{' + num0 + '}{' + den0 + '}' : form === 'pct' ? Math.round(val0 * 100) + '\\%' : String(+val0.toFixed(2));
        o = [txt0, num0 === 0 ? 0 : num0 === den0 ? 4 : 2 * num0 === den0 ? 2 : val0 < 0.5 ? 1 : 3];
      }
      return {
        q: 'An event has a probability of $' + o[0] + '$. Which word describes it best?',
        a: mcFixed(LIKELY, o[1]),
        steps: ['Probabilities run from $0$ (impossible) to $1$ (certain). Halfway, $\\frac{1}{2}$, means as likely as not.', 'Values near $0$ are unlikely; values near $1$ are likely.', '$' + o[0] + '$ is ' + ['exactly 0', 'close to 0', 'exactly one half', 'close to 1', 'exactly 1'][o[1]] + ', so the event is <b>' + LIKELY[o[1]] + '</b>.'],
        hint: 'Place the number on a line from 0 to 1.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'word2num') {
      var w = R.int(0, 4), right = ['0', R.pick(['0.1', '0.15', '0.2']), '0.5', R.pick(['0.8', '0.85', '0.9']), '1'][w];
      var pool = ['0', '0.15', '0.5', '0.85', '1'].filter(function (x, i) { return i !== w; }), wrong = R.sample(pool, 3);
      return {
        q: 'Which probability best describes an event that is <b>' + LIKELY[w] + '</b>?',
        a: mcq('$' + right + '$', wrong.map(function (x) { return '$' + x + '$'; })),
        steps: ['On the probability scale, $0$ is impossible, $0.5$ is as likely as not, and $1$ is certain.', LIKELY[w].charAt(0).toUpperCase() + LIKELY[w].slice(1) + ' matches $' + right + '$.'],
        hint: 'Picture a line from 0 (impossible) to 1 (certain).',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'notprob') {
      var bad = R.pick(['1.2', '-0.3', '\\frac{5}{4}', '110\\%', '-\\frac{1}{2}', '2']), goods = R.sample(['0', '0.99', '\\frac{3}{7}', '1', '45\\%', '0.01', '\\frac{1}{2}'], 3);
      return {
        q: 'Which number can <b>not</b> be a probability?',
        a: mcq('$' + bad + '$', goods.map(function (x) { return '$' + x + '$'; })),
        steps: ['A probability is a number from $0$ to $1$ (from $0\\%$ to $100\\%$): you cannot have less than no chance or more than a sure thing.', '$' + bad + '$ is ' + (/-/.test(bad) ? 'less than 0' : 'greater than 1') + ', so it cannot be a probability.'],
        hint: 'Probabilities are never below 0 or above 1.',
        chk: { kind: 'none' }
      };
    }
    var EV = [['You roll a standard number cube and get a 7.', 0], ['You roll a standard number cube and get a number less than 7.', 4], ['A coin lands heads up.', 2], ['You pick a red marble from a bag with 9 red marbles and 1 blue marble.', 3], ['You pick a blue marble from a bag with 9 red marbles and 1 blue marble.', 1], ['You roll a standard number cube and get an even number.', 2], ['You spin a spinner with 8 equal parts, 1 of them green, and land on green.', 1], ['Tomorrow comes right after today.', 4], ['You pick a vowel from the letters A, E, I, O, U.', 4], ['You roll a standard number cube and get a number less than 6.', 3]];
    var e = R.pick(EV);
    return {
      q: 'How likely is this event? ' + e[0],
      a: mcFixed(LIKELY, e[1]),
      steps: ['Compare the outcomes that make the event happen with all the outcomes.', 'This event is <b>' + LIKELY[e[1]] + '</b>' + (e[1] === 0 ? ': no outcome makes it happen, so its probability is $0$.' : e[1] === 4 ? ': every outcome makes it happen, so its probability is $1$.' : e[1] === 2 ? ': half the outcomes make it happen, so its probability is $\\frac{1}{2}$.' : '.')],
      hint: 'How many of the possible outcomes make it happen?',
      chk: { kind: 'none' }
    };
  });

  G('g7.theoretical-probability', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['spinner', 'bag', 'die', 'cards', 'word', 'not', 'myth'], BL(ctx, [3, 3, 2, 1, 0, 0, 1], [2, 3, 2, 2, 1, 2, 1], [1, 2, 1, 3, 2, 2, 1]));
    var num, den, qs, steps, hint;
    if (shape === 'spinner') {
      den = R.pick([4, 5, 6, 8, 10, 12]); num = R.int(1, den - 1); var col = R.pick(['blue', 'red', 'yellow', 'green']);
      qs = 'A spinner has $' + den + '$ equal sections. $' + num + '$ of them are ' + col + '. What is the probability of landing on ' + col + '?';
      steps = ['The ' + den + ' sections are equal, so each outcome is equally likely.', 'Favorable outcomes: $' + num + '$. Total outcomes: $' + den + '$.', '$P(\\text{' + col + '}) = \\frac{' + num + '}{' + den + '}' + (U.gcd(num, den) > 1 ? ' = ' + T.frac(num, den) : '') + '$.'];
      hint = 'Probability = favorable outcomes ÷ total outcomes.';
    } else if (shape === 'bag' || shape === 'not') {
      var r = R.int(1, 9), b = R.int(1, 9), g = R.int(1, 9), tot = r + b + g, pick = R.pick([['red', r], ['blue', b], ['green', g]]);
      den = tot; num = shape === 'not' ? tot - pick[1] : pick[1];
      qs = 'A bag holds $' + r + '$ red, $' + b + '$ blue and $' + g + '$ green marbles. You pick one without looking. What is the probability that it is ' + (shape === 'not' ? '<b>not</b> ' : '') + pick[0] + '?';
      steps = ['There are $' + r + ' + ' + b + ' + ' + g + ' = ' + tot + '$ marbles, each equally likely to be picked.', shape === 'not' ? 'Not ' + pick[0] + ': $' + tot + ' - ' + pick[1] + ' = ' + num + '$ marbles.' : 'There are $' + num + '$ ' + pick[0] + ' marbles.', '$P = \\frac{' + num + '}{' + tot + '}' + (U.gcd(num, tot) > 1 ? ' = ' + T.frac(num, tot) : '') + '$.' + (shape === 'not' ? ' (Also: $1 - \\frac{' + pick[1] + '}{' + tot + '}$ gives the same answer.)' : '')];
      hint = shape === 'not' ? 'Count the marbles that are not ' + pick[0] + ', or subtract P(' + pick[0] + ') from 1.' : 'Count the ' + pick[0] + ' marbles and all the marbles.';
    } else if (shape === 'die') {
      var ev = R.pick([['an even number', [2, 4, 6]], ['a number greater than 4', [5, 6]], ['a prime number', [2, 3, 5]], ['a multiple of 3', [3, 6]], ['a number less than 3', [1, 2]], ['a 6', [6]], ['a number greater than 1', [2, 3, 4, 5, 6]]]);
      num = ev[1].length; den = 6;
      qs = 'You roll a fair number cube with faces $1$ to $6$. What is the probability of rolling ' + ev[0] + '?';
      steps = ['The 6 faces are equally likely.', 'Favorable outcomes: ' + ev[1].join(', ') + ' (' + num + ' of them).', '$P = \\frac{' + num + '}{6}' + (U.gcd(num, 6) > 1 ? ' = ' + T.frac(num, 6) : '') + '$.'];
      hint = 'List the faces that work.';
    } else if (shape === 'cards') {
      var Nc = R.pick([10, 12, 15, 20, 25, 30]), kind = R.pick(['mult3', 'mult5', 'prime', 'even', 'gt']), list = [];
      for (var i = 1; i <= Nc; i++) if ((kind === 'mult3' && i % 3 === 0) || (kind === 'mult5' && i % 5 === 0) || (kind === 'prime' && U.isPrime(i)) || (kind === 'even' && i % 2 === 0) || (kind === 'gt' && i > Nc - 4)) list.push(i);
      var desc = { mult3: 'a multiple of 3', mult5: 'a multiple of 5', prime: 'a prime number', even: 'an even number', gt: 'a number greater than ' + (Nc - 4) }[kind];
      num = list.length; den = Nc;
      qs = 'Cards numbered $1$ to $' + Nc + '$ are shuffled, and you draw one. What is the probability that it shows ' + desc + '?';
      steps = ['Each of the $' + Nc + '$ cards is equally likely.', 'Favorable cards: ' + list.join(', ') + ' (' + num + ' cards).', '$P = \\frac{' + num + '}{' + Nc + '}' + (U.gcd(num, Nc) > 1 ? ' = ' + T.frac(num, Nc) : '') + '$.'];
      hint = 'List the cards that work, then divide by the number of cards.';
    } else if (shape === 'word') {
      var wd = R.pick(['MISSISSIPPI', 'BANANA', 'TENNESSEE', 'COMMITTEE', 'BOOKKEEPER', 'PROBABILITY']), letters = wd.split(''), counts = {};
      letters.forEach(function (c) { counts[c] = (counts[c] || 0) + 1; });
      var lt = R.pick(Object.keys(counts).filter(function (c) { return counts[c] > 1; }));
      num = counts[lt]; den = letters.length;
      qs = 'Each letter of the word ' + wd + ' is written on its own tile, and the tiles go in a bag. You pick one tile. What is the probability that it is the letter ' + lt + '?';
      steps = ['There are $' + den + '$ tiles, one for each letter, so $' + den + '$ equally likely outcomes.', 'The letter ' + lt + ' appears $' + num + '$ times.', '$P(' + lt + ') = \\frac{' + num + '}{' + den + '}' + (U.gcd(num, den) > 1 ? ' = ' + T.frac(num, den) : '') + '$.'];
      hint = 'Count every tile, including repeated letters.';
    } else {
      return {
        q: 'Sam says: "A lottery ticket either wins or loses. That is two outcomes, so the chance of winning is $\\frac{1}{2}$." True or false: Sam is right.',
        a: { t: 'tf', v: false },
        steps: ['"Favorable over total" only works when the outcomes are <b>equally likely</b>.', 'Winning and losing are not equally likely: a lottery has a huge number of tickets and only a few winners.', 'So the chance of winning is far less than $\\frac{1}{2}$.'],
        hint: 'Are winning and losing equally likely?',
        chk: { kind: 'none' }
      };
    }
    return { q: qs, a: N(q(num).div(den)), steps: steps, hint: hint, chk: { kind: 'frac', n: num, d: den } };
  });

  G('g7.experimental-probability', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['relfreq', 'predict', 'expect', 'myth', 'more'], BL(ctx, [4, 2, 2, 1, 0], [3, 3, 2, 1, 1], [2, 3, 2, 1, 2]));
    if (shape === 'relfreq') {
      var n = R.pick([20, 25, 40, 50, 60, 80, 100]), k = R.int(Math.ceil(n * 0.1), Math.floor(n * 0.7));
      var E = R.pick([['flipped a paper cup', 'it landed on its side'], ['tossed a bottle cap', 'it landed top side up'], ['shot free throws', 'the ball went in'], ['spun a homemade spinner', 'it landed on red']]);
      return {
        q: 'A student ' + E[0] + ' $' + n + '$ times, and ' + E[1] + ' $' + k + '$ times. What is the experimental probability that ' + E[1] + '?',
        a: N(q(k).div(n)),
        steps: ['Experimental probability = (times it happened) ÷ (number of trials), the relative frequency.', '$\\frac{' + k + '}{' + n + '}' + (U.gcd(k, n) > 1 ? ' = ' + T.frac(k, n) : '') + eqDec(q(k).div(n)) + '$.'],
        hint: 'Divide the number of times it happened by the number of trials.',
        chk: { kind: 'frac', n: k, d: n }
      };
    }
    if (shape === 'predict') {
      var n2 = R.pick([20, 25, 40, 50]), k2 = R.int(Math.ceil(n2 * 0.15), Math.floor(n2 * 0.75)), M = R.pick([100, 200, 300, 400, 500]);
      if ((M * k2) % n2) M = n2 * R.int(3, 10);
      return {
        q: 'A basketball player made $' + k2 + '$ of her last $' + n2 + '$ free throws. Based on this, about how many would you expect her to make in her next $' + M + '$ free throws?',
        a: N(M * k2 / n2),
        steps: ['Experimental probability of a make: $\\frac{' + k2 + '}{' + n2 + '}$.', 'Expected makes: $\\frac{' + k2 + '}{' + n2 + '} \\times ' + M + ' = ' + M * k2 / n2 + '$.', 'This is a prediction, not a promise: the real number will probably be close but not exact.'],
        hint: 'Find the fraction made so far, then take that fraction of the new number of shots.',
        chk: { kind: 'est', k: k2, n: n2, N: M }
      };
    }
    if (shape === 'expect') {
      var sides = R.pick([6, 6, 4, 8, 10]), rolls = sides * R.int(5, 30), what = R.int(1, sides);
      return {
        q: 'A fair number cube with faces numbered $1$ to $' + sides + '$ is rolled $' + rolls + '$ times. About how many times would you expect to roll a $' + what + '$?',
        a: N(rolls / sides),
        steps: ['The theoretical probability of a $' + what + '$ is $\\frac{1}{' + sides + '}$.', 'Expected count: $\\frac{1}{' + sides + '} \\times ' + rolls + ' = ' + rolls / sides + '$.', 'In a real experiment the count would vary around this number.'],
        hint: 'Multiply the probability by the number of rolls.',
        chk: { kind: 'est', k: 1, n: sides, N: rolls }
      };
    }
    if (shape === 'myth') {
      var r = R.pick([60, 120, 300]);
      return {
        q: 'True or false: if you roll a fair number cube $' + r + '$ times, you will get exactly $' + r / 6 + '$ sixes.',
        a: { t: 'tf', v: false },
        steps: ['$' + r / 6 + '$ is the <b>expected</b> number: $\\frac{1}{6} \\times ' + r + '$.', 'Real results vary. You might get ' + (r / 6 - 3) + ' or ' + (r / 6 + 4) + ' sixes. As the number of rolls grows, the <b>fraction</b> of sixes tends to get closer to $\\frac{1}{6}$, but an exact count is not guaranteed.'],
        hint: 'Is chance ever guaranteed to come out exactly even?',
        chk: { kind: 'none' }
      };
    }
    var a = R.pick([10, 20]), b = R.pick([500, 1000]), ka = R.int(2, a - 2), kb = Math.round(b * R.pick([0.3, 0.35, 0.4, 0.45]));
    return {
      q: 'Two students tested a spinner. Ana spun it $' + a + '$ times and got red $' + ka + '$ times. Ben spun it $' + b + '$ times and got red $' + kb + '$ times. Whose experimental probability is likely to be closer to the true probability of red?',
      a: mcFixed(['Ana\'s, because her numbers are smaller and easier to work with', 'Ben\'s, because he did many more trials', 'They are equally good, because they used the same spinner'], 1),
      steps: ['Experimental probabilities jump around a lot with few trials.', 'With many trials they tend to settle near the true probability. So Ben\'s estimate, $\\frac{' + kb + '}{' + b + '}$, is more trustworthy than Ana\'s, $\\frac{' + ka + '}{' + a + '}$.'],
      hint: 'Which estimate is based on more information?',
      chk: { kind: 'none' }
    };
  });

  G('g7.probability-models', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['fit', 'estimate', 'expected', 'table'], BL(ctx, [3, 3, 2, 0], [3, 2, 2, 2], [2, 2, 2, 3]));
    if (shape === 'fit') {
      var parts = R.pick([2, 4, 5]), n = R.pick([100, 200, 400]), expv = n / parts, good = R.coin();
      var obs = good ? Math.round(expv * (1 + R.pick([-0.08, -0.04, 0.03, 0.06]))) : Math.round(expv * R.pick([1.8, 2.1, 0.35, 0.4]));
      return {
        q: 'A spinner is supposed to have $' + parts + '$ equal sections, one of them red. A class spins it $' + n + '$ times and gets red $' + obs + '$ times. Does this result fit the model of equal sections?',
        a: mcFixed(['Yes: the result is close to what the model predicts.', 'No: the result is far from what the model predicts, so the spinner may not be fair.'], good ? 0 : 1),
        steps: ['The model says $P(\\text{red}) = \\frac{1}{' + parts + '}$, so we expect about $\\frac{1}{' + parts + '} \\times ' + n + ' = ' + expv + '$ reds.', 'The class got $' + obs + '$, which is ' + (good ? 'close to ' + expv + '. Small differences like this are normal with chance.' : 'far from ' + expv + ' for this many spins. A gap this big is very unlikely if the model is right.'), good ? 'The data fit the model.' : 'The data do not fit the model. Maybe the sections are not really equal.'],
        hint: 'Find the expected number of reds, then compare.',
        chk: { kind: 'none' }
      };
    }
    if (shape === 'estimate') {
      var n2 = R.pick([50, 100, 200]), k2 = Math.round(n2 * R.pick([0.62, 0.38, 0.55, 0.7, 0.24])), M = R.pick([500, 1000, 300]);
      while ((M * k2) % n2) M += 100;
      return {
        q: 'A thumbtack is dropped $' + n2 + '$ times. It lands point up $' + k2 + '$ times. Based on this experiment, about how many times would it land point up in $' + T.commas(M) + '$ drops?',
        a: N(M * k2 / n2),
        steps: ['A thumbtack\'s two landings are not equally likely, so we use the data as the model: $P(\\text{point up}) \\approx \\frac{' + k2 + '}{' + n2 + '}$.', 'Prediction: $\\frac{' + k2 + '}{' + n2 + '} \\times ' + T.commas(M) + ' = ' + T.commas(M * k2 / n2) + '$.'],
        hint: 'Use the experiment\'s relative frequency as the probability.',
        chk: { kind: 'est', k: k2, n: n2, N: M }
      };
    }
    if (shape === 'expected') {
      var c = R.pick([3, 4, 5, 8]), spins = c * R.int(10, 50);
      return {
        q: 'A fair spinner has $' + c + '$ equal sections, each a different color. If it is spun $' + spins + '$ times, how many times would you expect it to land on purple, one of the colors?',
        a: N(spins / c),
        steps: ['In this uniform model, each color has probability $\\frac{1}{' + c + '}$.', 'Expected: $\\frac{1}{' + c + '} \\times ' + spins + ' = ' + spins / c + '$.'],
        hint: 'Equal sections give every color the same probability.',
        chk: { kind: 'est', k: 1, n: c, N: spins }
      };
    }
    var outs = ['red', 'blue', 'green', 'yellow'], cnt = [R.int(5, 30), R.int(5, 30), R.int(5, 30), R.int(5, 30)], tot = sum(cnt), pickI = R.int(0, 3);
    return {
      q: 'A bag of colored blocks is shaken and one is drawn, then put back, ' + tot + ' times. Results: ' + outs.map(function (o, i) { return o + ' ' + cnt[i]; }).join(', ') + '. Based on these results, what is the probability of drawing ' + outs[pickI] + '?',
      a: N(q(cnt[pickI]).div(tot)),
      steps: ['There were $' + cnt.join(' + ') + ' = ' + tot + '$ draws.', 'The probability model from the data: $P(\\text{' + outs[pickI] + '}) \\approx \\frac{' + cnt[pickI] + '}{' + tot + '}' + (U.gcd(cnt[pickI], tot) > 1 ? ' = ' + T.frac(cnt[pickI], tot) : '') + '$.', 'The colors are not equally likely, so this model is not uniform.'],
      hint: 'Divide the count for that color by the total number of draws.',
      chk: { kind: 'frac', n: cnt[pickI], d: tot }
    };
  });

  G('g7.sample-spaces', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['count', 'outfit', 'event', 'tree'], BL(ctx, [3, 3, 2, 2], [2, 2, 3, 3], [2, 2, 4, 2]));
    if (shape === 'count') {
      var C = R.pick([['a coin is flipped and a number cube is rolled', 2, 6], ['two number cubes are rolled', 6, 6], ['a spinner with 4 equal sections is spun and a coin is flipped', 4, 2], ['three coins are flipped', 2, 2, 2], ['a number cube is rolled and a spinner with 3 equal sections is spun', 6, 3]]);
      var tot = C.slice(1).reduce(function (a, b) { return a * b; }, 1);
      return {
        q: nm(R) + ' is playing a game in which ' + C[0] + '. How many outcomes are in the sample space?',
        a: N(tot),
        steps: ['List the outcomes as a table or a tree. Each stage multiplies the number of branches.', 'Outcomes: $' + C.slice(1).join(' \\times ') + ' = ' + tot + '$.'],
        hint: 'Multiply the number of outcomes at each stage.',
        chk: { kind: 'val', v: String(tot) }
      };
    }
    if (shape === 'outfit') {
      var s = R.int(2, 6), p = R.int(2, 5), hh = L >= 2 && R.coin() ? R.int(2, 4) : 0;
      return {
        q: nm(R) + ' has ' + s + ' shirts and ' + p + ' pairs of pants' + (hh ? ' and ' + hh + ' hats' : '') + '. An outfit is one shirt, one pair of pants' + (hh ? ' and one hat' : '') + '. How many different outfits are possible?',
        a: N(s * p * (hh || 1)),
        steps: ['Each shirt can go with each pair of pants: a tree with ' + s + ' branches, each splitting into ' + p + '.', (hh ? 'Each of those splits again into ' + hh + ' hats. ' : '') + 'Outfits: $' + s + ' \\times ' + p + (hh ? ' \\times ' + hh : '') + ' = ' + s * p * (hh || 1) + '$.'],
        hint: 'Draw a tree: one branch per choice at each step.',
        chk: { kind: 'val', v: String(s * p * (hh || 1)) }
      };
    }
    if (shape === 'event') {
      var E = R.pick([
        ['Two coins are flipped. How many outcomes have exactly one head?', 2, ['HT', 'TH'], 4, 'HH, HT, TH, TT'],
        ['Three coins are flipped. How many outcomes have exactly two heads?', 3, ['HHT', 'HTH', 'THH'], 8, 'HHH, HHT, HTH, HTT, THH, THT, TTH, TTT'],
        ['Three coins are flipped. How many outcomes have at least one tail?', 7, ['HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'], 8, 'HHH, HHT, HTH, HTT, THH, THT, TTH, TTT'],
        ['Two number cubes are rolled. How many outcomes have a sum of 7?', 6, ['1+6', '2+5', '3+4', '4+3', '5+2', '6+1'], 36, ''],
        ['Two number cubes are rolled. How many outcomes have a sum of 4?', 3, ['1+3', '2+2', '3+1'], 36, ''],
        ['Two number cubes are rolled. How many outcomes are doubles (both cubes the same)?', 6, ['1+1', '2+2', '3+3', '4+4', '5+5', '6+6'], 36, ''],
        ['A coin is flipped and a number cube is rolled. How many outcomes have heads and an even number?', 3, ['H2', 'H4', 'H6'], 12, '']
      ]);
      return {
        q: nm(R) + ' is listing outcomes. ' + E[0],
        a: N(E[1]),
        steps: [(E[4] ? 'The whole sample space: ' + E[4] + ' (' + E[3] + ' outcomes).' : 'The sample space has ' + E[3] + ' outcomes (make a table to see them all).'), 'The outcomes that fit: ' + E[2].join(', ') + '.', 'Order matters: ' + (E[2].length > 1 ? E[2][0] + ' and ' + E[2][E[2].length - 1] + ' are different outcomes, ' : '') + 'so there are $' + E[1] + '$.'],
        hint: 'List every outcome in an organized way. Count HT and TH separately.',
        chk: { kind: 'val', v: String(E[1]) }
      };
    }
    var lv1 = R.pick([['H', 'T'], ['R', 'B', 'G']]), lv2 = R.pick([['H', 'T'], ['1', '2', '3'], ['A', 'B']]);
    var outsT = []; lv1.forEach(function (a) { lv2.forEach(function (b) { outsT.push(a + b); }); });
    var target = lv1[0], cnt = outsT.filter(function (o) { return o.charAt(0) === target || o.slice(1) === lv2[0]; }).length;
    var n1 = lv1.length === 2 ? 'a coin (H or T)' : 'a spinner with three equal colors (R, B, G)', n2 = lv2.length === 2 ? (lv2[0] === 'H' ? 'a coin (H or T)' : 'a spinner with two equal parts (A, B)') : 'a spinner with three equal parts (1, 2, 3)';
    return {
      q: 'The tree shows the outcomes of using ' + n1 + ' and then ' + n2 + '. How many outcomes have ' + target + ' first <b>or</b> ' + lv2[0] + ' second (or both)?',
      viz: { name: 'tree', opts: { levels: [lv1, lv2] }, label: 'A probability tree with ' + outsT.length + ' outcomes.' },
      a: N(cnt),
      steps: ['The tree has $' + lv1.length + ' \\times ' + lv2.length + ' = ' + outsT.length + '$ outcomes: ' + outsT.join(', ') + '.', 'Outcomes with ' + target + ' first or ' + lv2[0] + ' second: ' + outsT.filter(function (o) { return o.charAt(0) === target || o.slice(1) === lv2[0]; }).join(', ') + '.', 'Count each one once, even if it fits both: $' + cnt + '$.'],
      hint: 'Follow each path of the tree and check it.',
      chk: { kind: 'val', v: String(cnt) }
    };
  });

  G('g7.compound-probability', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['coindie', 'dice', 'coins', 'spin', 'bag'], BL(ctx, [3, 2, 2, 2, 0], [2, 3, 2, 2, 1], [2, 3, 2, 1, 2]));
    var num, den, qs, steps, hint;
    if (shape === 'coindie') {
      var face = R.pick(['heads', 'tails']), ev = R.pick([['a 6', 1], ['an even number', 3], ['a number greater than 2', 4], ['a 1 or a 2', 2]]);
      num = ev[1]; den = 12;
      qs = nm(R) + ' flips a fair coin and rolls a fair number cube. What is the probability of getting ' + face + ' and ' + ev[0] + '?';
      steps = ['The sample space has $2 \\times 6 = 12$ equally likely outcomes.', 'Outcomes that fit: ' + face + ' with ' + ev[1] + ' of the 6 faces, so $' + ev[1] + '$ outcomes.', '$P = \\frac{' + ev[1] + '}{12}' + (U.gcd(ev[1], 12) > 1 ? ' = ' + T.frac(ev[1], 12) : '') + '$. Same as multiplying: $\\frac{1}{2} \\times \\frac{' + ev[1] + '}{6}$.'];
      hint = 'Count the outcomes that fit out of all 12, or multiply the two probabilities.';
    } else if (shape === 'dice') {
      var sums = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 }, sm = R.int(2, 12), dbl = R.chance(0.2);
      num = dbl ? 6 : sums[sm]; den = 36;
      var list = []; for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) if (dbl ? a === b : a + b === sm) list.push('(' + a + ', ' + b + ')');
      qs = nm(R) + ' rolls two fair number cubes. What is the probability ' + (dbl ? 'of rolling doubles (the same number on both)?' : 'that the sum is $' + sm + '$?');
      steps = ['The sample space is a 6-by-6 table: $36$ equally likely outcomes.', 'Outcomes that fit: ' + list.join(', ') + ' (' + num + ').', '$P = \\frac{' + num + '}{36}' + (U.gcd(num, 36) > 1 ? ' = ' + T.frac(num, 36) : '') + '$.'];
      hint = 'Make the 6-by-6 table of the two cubes and count.';
    } else if (shape === 'coins') {
      var E = R.pick([['all heads', 1], ['exactly two heads', 3], ['at least one head', 7], ['no heads', 1], ['exactly one tail', 3]]);
      num = E[1]; den = 8;
      qs = nm(R) + ' flips three fair coins. What is the probability of ' + E[0] + '?';
      steps = ['The sample space has $2 \\times 2 \\times 2 = 8$ outcomes: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT.', 'Outcomes that fit ' + E[0] + ': $' + E[1] + '$.' + (E[0] === 'at least one head' ? ' (Every outcome except TTT, so $1 - \\frac{1}{8}$.)' : ''), '$P = \\frac{' + E[1] + '}{8}$.'];
      hint = 'List all 8 outcomes.';
    } else if (shape === 'spin') {
      var s1 = R.pick([3, 4, 5]), s2 = R.pick([2, 3, 4, 6]);
      num = 1; den = s1 * s2;
      qs = 'Spinner A has $' + s1 + '$ equal sections, one of them red. Spinner B has $' + s2 + '$ equal sections, one of them blue. ' + nm(R) + ' spins both. What is the probability of red on A and blue on B?';
      steps = ['The spinners do not affect each other, so the sample space has $' + s1 + ' \\times ' + s2 + ' = ' + den + '$ equally likely outcomes.', 'Only one of them is red-and-blue.', '$P = \\frac{1}{' + den + '}$, the same as $\\frac{1}{' + s1 + '} \\times \\frac{1}{' + s2 + '}$. (Adding $\\frac{1}{' + s1 + '} + \\frac{1}{' + s2 + '}$ would give a bigger number than either chance alone, which cannot be right for "both".)'];
      hint = 'For "this and that" with independent events, multiply.';
    } else if (L === 3 && R.coin()) {
      var r0 = R.int(2, 6), b0 = R.int(1, 5), t0 = r0 + b0;
      num = r0 * (r0 - 1); den = t0 * (t0 - 1);
      qs = 'A bag has $' + r0 + '$ red and $' + b0 + '$ blue marbles. ' + nm(R) + ' draws one marble, keeps it out, then draws another. What is the probability that both are red?';
      steps = ['First draw: $P(\\text{red}) = \\frac{' + r0 + '}{' + t0 + '}$.', 'The red marble stays out, so the bag now has $' + (r0 - 1) + '$ red out of $' + (t0 - 1) + '$: $P(\\text{red again}) = \\frac{' + (r0 - 1) + '}{' + (t0 - 1) + '}$.', 'Both: $\\frac{' + r0 + '}{' + t0 + '} \\times \\frac{' + (r0 - 1) + '}{' + (t0 - 1) + '} = \\frac{' + num + '}{' + den + '}' + (U.gcd(num, den) > 1 ? ' = ' + T.frac(num, den) : '') + '$.'];
      hint = 'The second draw has one fewer marble in the bag.';
    } else {
      var r = R.int(1, 5), bl = R.int(1, 5), tt = r + bl;
      num = r * r; den = tt * tt;
      qs = 'A bag has $' + r + '$ red and $' + bl + '$ blue marbles. ' + nm(R) + ' draws one, puts it back, then draws again. What is the probability that both are red?';
      steps = ['Putting the marble back makes the draws independent: each draw is red with probability $\\frac{' + r + '}{' + tt + '}$.', 'Both red: $\\frac{' + r + '}{' + tt + '} \\times \\frac{' + r + '}{' + tt + '} = \\frac{' + r * r + '}{' + tt * tt + '}' + (U.gcd(r * r, tt * tt) > 1 ? ' = ' + T.frac(r * r, tt * tt) : '') + '$.', 'Check with counting: there are $' + tt + ' \\times ' + tt + ' = ' + tt * tt + '$ equally likely pairs of draws, and $' + r + ' \\times ' + r + ' = ' + r * r + '$ of them are red-red.'];
      hint = 'Multiply the probability of red on each draw.';
    }
    return { q: qs, a: N(q(num).div(den)), steps: steps, hint: hint, chk: { kind: 'frac', n: num, d: den } };
  });

  G('g7.simulations', function (R, ctx) {
    var L = lv(ctx);
    var shape = R.pickW(['estimate', 'design', 'read'], BL(ctx, [4, 3, 1], [3, 3, 3], [2, 3, 4]));
    if (shape === 'estimate') {
      var n = R.pick([20, 25, 40, 50, 100]), k = R.int(Math.ceil(n * 0.1), Math.floor(n * 0.8));
      var S = R.pick(['a simulation of a basketball player taking two free throws', 'a simulation of a family with three children', 'a simulation of a quiz where you guess on four true-false questions', 'a simulation of buying cereal boxes until you get all three prizes']);
      var ev = { 'a simulation of a basketball player taking two free throws': 'the player made both shots', 'a simulation of a family with three children': 'there were at least two girls', 'a simulation of a quiz where you guess on four true-false questions': 'at least three answers were right', 'a simulation of buying cereal boxes until you get all three prizes': 'it took 5 or fewer boxes' }[S];
      return {
        q: 'In ' + S + ', the class ran $' + n + '$ trials. In $' + k + '$ of them, ' + ev + '. Estimate the probability that ' + ev + '.',
        a: N(q(k).div(n)),
        steps: ['A simulation estimates a probability with the relative frequency of the event in the trials.', '$P \\approx \\frac{' + k + '}{' + n + '}' + (U.gcd(k, n) > 1 ? ' = ' + T.frac(k, n) : '') + eqDec(q(k).div(n)) + '$.', 'More trials would give a more reliable estimate.'],
        hint: 'Divide the number of trials where it happened by the number of trials.',
        chk: { kind: 'frac', n: k, d: n }
      };
    }
    if (shape === 'design') {
      var P = R.pick([
        { p: '\\frac{1}{3}', good: 'Roll a number cube: 1 or 2 means it happens.', bad: ['Flip a coin: heads means it happens.', 'Roll a number cube: 1 means it happens.', 'Spin a spinner with 4 equal parts: 1 part means it happens.'] },
        { p: '30\\%', good: 'Pick a random digit from 0 to 9: 0, 1 or 2 means it happens.', bad: ['Pick a random digit from 0 to 9: 0, 1, 2 or 3 means it happens.', 'Flip a coin: heads means it happens.', 'Roll a number cube: 1 or 2 means it happens.'] },
        { p: '\\frac{1}{2}', good: 'Flip a coin: heads means it happens.', bad: ['Roll a number cube: 6 means it happens.', 'Pick a random digit from 0 to 9: 0 means it happens.', 'Spin a spinner with 3 equal parts: 1 part means it happens.'] },
        { p: '\\frac{1}{4}', good: 'Spin a spinner with 4 equal parts: 1 part means it happens.', bad: ['Flip a coin: heads means it happens.', 'Roll a number cube: 1 means it happens.', 'Pick a random digit from 0 to 9: 0, 1 or 2 means it happens.'] },
        { p: '\\frac{1}{6}', good: 'Roll a number cube: 6 means it happens.', bad: ['Flip a coin: heads means it happens.', 'Roll a number cube: 5 or 6 means it happens.', 'Spin a spinner with 4 equal parts: 1 part means it happens.'] },
        { p: '70\\%', good: 'Pick a random digit from 0 to 9: 0 through 6 means it happens.', bad: ['Pick a random digit from 0 to 9: 0 through 7 means it happens.', 'Roll a number cube: 1 through 4 means it happens.', 'Flip a coin: heads means it happens.'] }
      ]);
      return {
        q: 'An event happens with probability $' + P.p + '$. Which tool could be used to simulate it?',
        a: mcq(P.good, P.bad),
        steps: ['A good simulation gives the event the same probability as the real situation.', '"' + P.good + '" happens with probability $' + P.p + '$.', 'Check each other choice: its chance is different (for example, a coin gives $\\frac{1}{2}$ and one face of a number cube gives $\\frac{1}{6}$).'],
        hint: 'Find the probability each tool gives, and match it.',
        chk: { kind: 'none' }
      };
    }
    // a run of simulated trials: number of boxes needed to collect 3 prizes
    var trials = [], T20 = 20;
    for (var t = 0; t < T20; t++) { var got = {}, c = 0; while (Object.keys(got).length < 3 && c < 30) { got[R.int(1, 3)] = 1; c++; } trials.push(c); }
    var lim = R.pick([4, 5, 6]), kk = trials.filter(function (x) { return x <= lim; }).length;
    if (kk === 0 || kk === T20) { lim = 5; kk = trials.filter(function (x) { return x <= lim; }).length; }
    return {
      q: 'Each cereal box holds one of 3 prizes, all equally likely. A class simulated buying boxes until they had all 3 prizes, using a number cube (1–2, 3–4 and 5–6 stand for the three prizes). Each number below is how many boxes one trial needed: ' + trials.join(', ') + '. Estimate the probability of getting all 3 prizes with ' + lim + ' boxes or fewer.',
      a: N(q(kk).div(T20)),
      steps: ['There are $' + T20 + '$ trials.', 'Trials that needed ' + lim + ' boxes or fewer: $' + kk + '$.', '$P \\approx \\frac{' + kk + '}{' + T20 + '}' + (U.gcd(kk, T20) > 1 ? ' = ' + T.frac(kk, T20) : '') + eqDec(q(kk).div(T20)) + '$.'],
      hint: 'Count the trials that are ' + lim + ' or less, out of all the trials.',
      chk: { kind: 'count', xs: trials, lim: lim }
    };
  });
})(typeof window !== 'undefined' ? window.MathLadder : (typeof globalThis !== 'undefined' ? globalThis.MathLadder : undefined));
