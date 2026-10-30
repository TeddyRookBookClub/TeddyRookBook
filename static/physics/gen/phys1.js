/* Generators for phys1, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Physics Ladder: generators for Physics 1 (phys1), part A: units kinematics, motion-2d, forces, energy (46 topics).
   One generator per topic, registered with MathLadder.gen(id, fn(R, ctx)). Levels: 1 gentlest (learning), 2 (reviews,
   checkpoints, placement), 3 (later reviews). g = 9.8 m/s^2; answers with units use unit and rtol. Built from
   /tmp/work_phys1_A/gen by build.js; verified by /tmp/work_phys1_A/verify.js. */
(function (ML) {
  'use strict';
  // Rough rendered width of a TeX math string, measured in "characters" (about 9 px each at body size).
  // Used to turn long inline math into display math (which scrolls sideways on narrow screens instead of widening the page).
  function texWidth(t) {
    function grp(s, k) { var d = 0; for (var q = k; q < s.length; q++) { if (s[q] === '{') d++; else if (s[q] === '}') { d--; if (!d) return [s.slice(k + 1, q), q]; } } return ['', s.length]; }
    t = String(t);
    // matrices, arrays and aligned blocks: as wide as their widest row
    var env = /\\begin\{(bmatrix|pmatrix|vmatrix|matrix|array|aligned|cases)\}(\{[^}]*\})?([\s\S]*?)\\end\{\1\}/;
    var guard = 0, m;
    while ((m = env.exec(t)) && guard++ < 30) {
      var rows = m[3].split('\\\\'), w = 0;
      rows.forEach(function (r) { var cells = r.split('&'), rw = 0; cells.forEach(function (c) { rw += texWidth(c) + 2.2; }); w = Math.max(w, rw); });
      t = t.slice(0, m.index) + 'x'.repeat(Math.ceil(w + 3)) + t.slice(m.index + m[0].length);
    }
    t = t.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle|bigl|bigr|Big|big)/g, '');
    t = t.replace(/\\[,;!:]|\\quad|\\qquad|\\ /g, ' ');
    guard = 0;
    while (/\\[dt]?frac\{/.test(t) && guard++ < 60) {
      var i = t.search(/\\[dt]?frac\{/), j = t.indexOf('{', i), a = grp(t, j), b = grp(t, a[1] + 1);
      t = t.slice(0, i) + 'x'.repeat(Math.ceil(Math.max(texWidth(a[0]), texWidth(b[0])))) + t.slice(b[1] + 1);
    }
    t = t.replace(/\\sqrt\{/g, 'xx{').replace(/\\pm/g, 'xx');
    t = t.replace(/\^\{[^{}]*\}|_\{[^{}]*\}/g, function (s) { return 'x'.repeat(Math.ceil((s.length - 3) * 0.6)); });
    t = t.replace(/\\(operatorname\{[a-z]+\})/g, 'xxxx');
    t = t.replace(/\\(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|ln|log|det|lim|proj)/g, 'xxx');
    t = t.replace(/\\[a-zA-Z]+/g, 'x');
    t = t.replace(/[{}^_]/g, '');
    var n = 0; for (var k = 0; k < t.length; k++) n += /[=+<>\-]/.test(t[k]) ? 1.8 : t[k] === ' ' ? 0 : t[k] === ',' ? 0.6 : 1;
    return n;
  }
  // Rewrite a text: inline math wider than lim becomes display math.
  function widenText(s, ML, lim) {
    if (typeof s !== 'string' || !ML || !ML.mathSegments) return s;
    var segs = ML.mathSegments(s), out = '';
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i];
      if (!sg.math) { out += sg.s; continue; }
      if (sg.display || texWidth(sg.tex) <= lim) { out += sg.raw; continue; }
      var nx = segs[i + 1], pun = '';
      if (nx && !nx.math) { var m = /^[.,;:]/.exec(nx.s); if (m) { pun = m[0]; nx.s = nx.s.slice(1); } }
      out += '$$' + sg.tex + pun + '$$';
    }
    return out;
  }
  
  
  // ======================= 00-helpers.js
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  var g = 9.8, GRAV = 6.674e-11, ME = 5.972e24, RE = 6.371e6;
  var abs = Math.abs, sqrt = Math.sqrt, PI = Math.PI, DEG = PI / 180;
  function sinD(a) { return Math.sin(a * DEG); }
  function cosD(a) { return Math.cos(a * DEG); }
  function tanD(a) { return Math.tan(a * DEG); }
  /* fx(x): no float noise (0.30000000000000004 -> 0.3) */
  function fx(x) { return +(+x).toPrecision(12); }
  /* sg(x, n): x rounded to n significant figures, as a number */
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  /* sv(x, n): the answer string for a spec: n significant figures (default 3), e-notation for very large or small values */
  function sv(x, n) {
    var y = sg(x, n || 3); if (y === 0) return '0';
    var e = Math.floor(Math.log10(abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fx(y / Math.pow(10, e)); return String(m) + 'e' + e; }
    return String(fx(y));
  }
  /* tn(x, n): a number for TeX with n significant figures (default 3; trailing zeros dropped), x 10^k when large or tiny,
     thousands commas from 10,000 */
  function tn(x, n) {
    var y = sg(x, n || 3); if (y === 0) return '0';
    var e = Math.floor(Math.log10(abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fx(y / Math.pow(10, e)); return (m < 0 ? '-' : '') + String(abs(m)) + ' \\times 10^{' + e + '}'; }
    if (abs(y) >= 1000) return T.commas(y);
    return String(fx(y));
  }
  /* exact-looking TeX for a given value (no rounding beyond float noise) */
  function tv(x) { x = fx(x); if (abs(x) >= 1000 && abs(x) < 1e6) return T.commas(x); return String(x); }
  var UT = { 'm/s2': '\\text{m/s}^2', 'm/s²': '\\text{m/s}^2', 'kg·m/s': '\\text{kg}\\cdot\\text{m/s}', 'N·m²/kg²': '\\text{N}\\cdot\\text{m}^2/\\text{kg}^2', '°': '^\\circ', 'm2': '\\text{m}^2', 's2': '\\text{s}^2' };
  /* ut(unit): the unit as TeX */
  function ut(u) { return UT[u] || '\\text{' + u + '}'; }
  /* qu(x, unit, n): a quantity, rounded (n sig figs) with its unit, as TeX (no $) */
  function qu(x, u, n) { return u === '°' ? tn(x, n) + '^\\circ' : tn(x, n) + '\\ ' + ut(u); }
  /* gv(x, unit): a given quantity exactly as generated, with its unit */
  function gv(x, u) { return u === '°' ? tv(x) + '^\\circ' : tv(x) + '\\ ' + ut(u); }
  /* answer specs */
  function A(x, n, rtol) { return { t: 'num', v: sv(x, n || 3), rtol: rtol || 0.02 }; }
  function AX(x) { return { t: 'num', v: String(fx(x)), rtol: 0.005 }; }   // an exact value (integers, tenths)
  function MC(correct, wrongs) { return U.mc(correct, wrongs.filter(function (w) { return w !== correct; }), 4); }
  function MCK(choices, i) { return { t: 'mc', choices: choices, v: i, keep: true }; }
  /* W(fn): wraps a generator so long inline math in q, steps and hint becomes display math (narrow screens) */
  function W(fn) {
    return function (R, ctx) {
      var p = fn(R, ctx);
      p.q = widenText(p.q, ML, 26);
      p.steps = p.steps.map(function (s) { return widenText(s, ML, 26); });
      if (p.hint) p.hint = widenText(p.hint, ML, 26);
      return p;
    };
  }
  /* eqa(x): '= x' when x is exact to 4 significant figures, otherwise '\\approx x' (3 figures) */
  function eqa(x, n) { return abs(sg(x, 4) - x) < 1e-9 * Math.max(1, abs(x)) ? '= ' + tv(sg(x, 4)) : '\\approx ' + tn(x, n || 3); }
  /* art(x, 'a'|'A'): the article before a number: "an 8 kg box", "an 18 m ladder", "a 7 kg box" */
  function art(x, a) { var s = String(x).replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, ''), d = s.split('.')[0], an = /^8/.test(s) || (/^1[18]/.test(d) && d.length % 3 === 2); return an ? a + 'n' : a; }
  function signed(x) { return x > 0 ? '+' + tv(x) : tv(x); }
  function pick2(R, arr) { var s = R.sample(arr, 2); return s; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function plural(n, w) { return n === 1 ? w : w + 's'; }

  // ======================= 01-kinematics.js
  // ============================================================ Unit 1: Motion in One Dimension

  // ---------- phys1.dimensional-analysis
  var DIM_UNITS = ['m', 's', 'm/s', 'm/s²', 's²', 'kg·m/s', 'kg·m/s² (newtons)', 'kg·m²/s² (joules)'];
  var DIM_EXPR = [
    ['v\\,t', 'm', ['m/s', 'm/s²', 's']],
    ['a\\,t', 'm/s', ['m/s²', 'm', 's']],
    ['\\dfrac{v}{t}', 'm/s²', ['m/s', 'm', 's']],
    ['\\dfrac{v^2}{a}', 'm', ['m/s', 's', 'm/s²']],
    ['\\dfrac{v^2}{r}', 'm/s²', ['m/s', 'm', 's']],
    ['\\dfrac{x}{v}', 's', ['m/s', 'm', 's²']],
    ['\\dfrac{2h}{g}', 's²', ['s', 'm', 'm/s']],
    ['\\sqrt{\\dfrac{2h}{g}}', 's', ['s²', 'm', 'm/s']],
    ['\\sqrt{2gh}', 'm/s', ['m', 'm/s²', 's']],
    ['\\tfrac12 a t^2', 'm', ['m/s', 'm/s²', 's']],
    ['m\\,a', 'kg·m/s² (newtons)', ['kg·m/s', 'kg·m²/s² (joules)', 'm/s²']],
    ['m\\,v', 'kg·m/s', ['kg·m/s² (newtons)', 'kg·m²/s² (joules)', 'm/s']],
    ['\\tfrac12 m v^2', 'kg·m²/s² (joules)', ['kg·m/s', 'kg·m/s² (newtons)', 'm/s']],
    ['F\\,d', 'kg·m²/s² (joules)', ['kg·m/s² (newtons)', 'kg·m/s', 'm']],
    ['\\dfrac{F}{m}', 'm/s²', ['kg·m/s² (newtons)', 'm/s', 'kg·m/s']],
    ['\\dfrac{x}{t^2}', 'm/s²', ['m/s', 'm', 's²']]
  ];
  var DIM_GOOD = ['x = v_0 t + \\tfrac12 a t^2', 'v = v_0 + a t', 'v^2 = v_0^2 + 2 a \\Delta x', 't = \\dfrac{v}{a}', 'h = \\dfrac{v^2}{2g}', 'a = \\dfrac{v^2}{r}', 'x = \\dfrac{v + v_0}{2}\\,t', 't = \\sqrt{\\dfrac{2h}{g}}'];
  var DIM_BAD = [
    ['x = v_0 + a t', 'the right side is a speed (m/s), not a length'],
    ['v = v_0 t + \\tfrac12 a t^2', 'the right side is a length (m), not a speed'],
    ['v^2 = v_0^2 + 2 a t', '$2at$ is in m/s, but $v^2$ is in m²/s²'],
    ['x = a\\,t', '$at$ is a speed (m/s), not a length'],
    ['t = \\dfrac{2h}{g}', '$2h/g$ is in s², not s'],
    ['h = \\dfrac{v}{2g}', '$v/2g$ is in seconds, not meters'],
    ['a = \\dfrac{v}{r}', '$v/r$ is in 1/s, not m/s²'],
    ['v = \\sqrt{2 g t}', '$\\sqrt{2gt}$ has units $\\sqrt{\\text{m}}/\\text{s}^{1/2}$, which is not m/s']
  ];
  var DIM_EXP = [
    { s: 'A drag force grows with speed as $F = b\\,v^n$, where $b$ is measured in kg/s.', n: 1, steps: ['$b\\,v^n$ has units $\\dfrac{\\text{kg}}{\\text{s}}\\cdot\\dfrac{\\text{m}^n}{\\text{s}^n}$.', 'A force is in newtons: $\\text{kg}\\cdot\\text{m}/\\text{s}^2$, which has one meter.', 'One meter needs $n = 1$; then the seconds match too: $\\text{kg}\\cdot\\text{m}/\\text{s}^2$.'] },
    { s: 'Air drag on a fast car is $F = c\\,v^n$, where $c$ is measured in kg/m.', n: 2, steps: ['$c\\,v^n$ has units $\\dfrac{\\text{kg}}{\\text{m}}\\cdot\\dfrac{\\text{m}^n}{\\text{s}^n} = \\text{kg}\\cdot\\text{m}^{n-1}/\\text{s}^n$.', 'A newton is $\\text{kg}\\cdot\\text{m}^1/\\text{s}^2$.', 'Match the seconds: $n = 2$. Check the meters: $n - 1 = 1$. Both agree.'] },
    { s: 'The power needed to push a car through the air is $P = c\\,v^n$, where $c$ is measured in kg/m and power in watts (kg·m²/s³).', n: 3, steps: ['$c\\,v^n$ has units $\\text{kg}\\cdot\\text{m}^{n-1}/\\text{s}^n$.', 'A watt is $\\text{kg}\\cdot\\text{m}^2/\\text{s}^3$.', 'Match the seconds: $n = 3$. Check the meters: $n - 1 = 2$. Both agree, so the power grows as $v^3$.'] },
    { s: 'A position grows with time as $x = k\\,t^n$, where $k$ is measured in m/s².', n: 2, steps: ['$k\\,t^n$ has units $\\dfrac{\\text{m}}{\\text{s}^2}\\cdot\\text{s}^n = \\text{m}\\cdot\\text{s}^{n-2}$.', 'A position is in meters, with no seconds left over.', 'So $n - 2 = 0$ and $n = 2$, just like $\\tfrac12 a t^2$.'] },
    { s: 'A position grows with time as $x = j\\,t^n$, where $j$ is measured in m/s³.', n: 3, steps: ['$j\\,t^n$ has units $\\text{m}\\cdot\\text{s}^{n-3}$.', 'A position is in meters, with no seconds left over.', 'So $n - 3 = 0$ and $n = 3$.'] },
    { s: 'The energy stored in a spring is $E = \\tfrac12 k\\,x^n$, where $k$ is measured in N/m and energy in joules (N·m).', n: 2, steps: ['$k\\,x^n$ has units $\\dfrac{\\text{N}}{\\text{m}}\\cdot\\text{m}^n = \\text{N}\\cdot\\text{m}^{n-1}$.', 'A joule is $\\text{N}\\cdot\\text{m}^1$.', 'So $n - 1 = 1$ and $n = 2$.'] }
  ];
  G('phys1.dimensional-analysis', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['unit', 'unit', 'good']), R.pick(['unit', 'good', 'bad']), R.pick(['good', 'bad', 'exp', 'exp']));
    if (shape === 'unit') {
      var e = R.pick(DIM_EXPR);
      return {
        q: 'Speeds $v$ are in m/s, accelerations $a$ and $g$ in m/s², times $t$ in s, lengths $x$, $h$, $r$, $d$ in m, masses $m$ in kg and forces $F$ in newtons (kg·m/s²). What are the units of $' + e[0] + '$?',
        a: MC(e[1], e[2]),
        steps: ['Replace each letter by its units and simplify, treating units like algebra.', 'Plain numbers such as $\\tfrac12$ and $2$ have no units.', 'The result is ' + e[1] + '.'],
        hint: 'Write the units of each letter, then cancel what appears on both top and bottom.',
        d: { k: 'unit', expr: e[0], ans: e[1] }
      };
    }
    if (shape === 'good') {
      var good = R.pick(DIM_GOOD), bads = R.sample(DIM_BAD, 3);
      return {
        q: 'Only one of these equations has the same units on both sides. Which one could be right? ($x$, $h$, $r$ in m; $v$ in m/s; $a$, $g$ in m/s²; $t$ in s.)',
        a: MC('$' + good + '$', bads.map(function (b) { return '$' + b[0] + '$'; })),
        steps: bads.map(function (b) { return '$' + b[0] + '$ cannot be right: ' + b[1] + '.'; }).concat(['$' + good + '$ has the same units on both sides, so it passes the test. (Matching units do not prove an equation right, but mismatched units prove it wrong.)']),
        hint: 'Find the units of each side. Every term in a sum must have the same units too.',
        d: { k: 'good', ans: good }
      };
    }
    if (shape === 'bad') {
      var bad = R.pick(DIM_BAD), goods = R.sample(DIM_GOOD, 3);
      return {
        q: 'A student wrote four equations from memory. Which one must be wrong, because its units do not match? ($x$, $h$, $r$ in m; $v$ in m/s; $a$, $g$ in m/s²; $t$ in s.)',
        a: MC('$' + bad[0] + '$', goods.map(function (b) { return '$' + b + '$'; })),
        steps: ['Check each side of each equation.', '$' + bad[0] + '$: ' + bad[1] + '.', 'The other three have the same units on both sides.'],
        hint: 'A length can only equal a length, and a speed can only equal a speed.',
        d: { k: 'bad', ans: bad[0] }
      };
    }
    var x = R.pick(DIM_EXP);
    return {
      q: x.s + ' What must the exponent $n$ be for the units to match?',
      a: { t: 'num', v: String(x.n), form: 'int' },
      steps: x.steps,
      hint: 'Write the units of both sides and match the power of meters and of seconds.',
      d: { k: 'exp', n: x.n }
    };
  }));

  // ---------- phys1.position-displacement
  var WALKERS = [['A runner', 'along a straight track'], ['A dog', 'along a hallway'], ['A cart', 'on a straight track'], ['A robot vacuum', 'along a wall'], ['A cyclist', 'along a straight bike path']];
  G('phys1.position-displacement', W(function (R, ctx) {
    var who = R.pick(WALKERS), n = by(ctx, 1, 2, 3), xs = [R.int(-10, 25) * by(ctx, 1, 1, 2)];
    for (var i = 0; i < n; i++) {
      var prev = xs[xs.length - 1], dir = i === 0 ? R.sign() : -Math.sign(prev - xs[xs.length - 2]), step = R.int(6, 30);
      xs.push(prev + dir * step);
    }
    var disp = xs[n] - xs[0], dist = 0; for (i = 1; i <= n; i++) dist += abs(xs[i] - xs[i - 1]);
    var ask = n === 1 ? 'disp' : R.pick(['disp', 'dist']);
    if (ctx.level === 3 && R.chance(0.35)) ask = 'start';
    var path = xs.map(function (x) { return '$x = ' + x + '\\ \\text{m}$'; });
    var trip = 'starts at ' + path[0] + (n === 1 ? ' and stops at ' + path[1] : ', moves to ' + path.slice(1, n).join(', then to ') + ', and ends at ' + path[n]);
    var legs = []; for (i = 1; i <= n; i++) legs.push(String(xs[i] - xs[i - 1]));
    if (ask === 'start') {
      return {
        q: who[0] + ' moves ' + who[1] + '. It ends at $x = ' + xs[n] + '\\ \\text{m}$ after a displacement of $\\Delta x = ' + disp + '\\ \\text{m}$. Where did it start?',
        a: AX(xs[0]), unit: 'm',
        steps: ['$\\Delta x = x_f - x_i$, so $x_i = x_f - \\Delta x$.', '$x_i = ' + xs[n] + ' - ' + T.p(disp) + ' = ' + xs[0] + '\\ \\text{m}$.'],
        hint: 'Displacement is final position minus initial position.',
        d: { k: 'start', xs: xs }
      };
    }
    if (ask === 'disp') {
      return {
        q: who[0] + ' ' + trip + '. What is its displacement $\\Delta x$? (Positive is the $+x$ direction.)',
        a: AX(disp), unit: 'm',
        steps: ['Displacement uses only the start and the end: $\\Delta x = x_f - x_i$.', '$\\Delta x = ' + xs[n] + ' - ' + T.p(xs[0]) + ' = ' + disp + '\\ \\text{m}$.'].concat(n > 1 ? ['The turn in the middle does not matter for displacement' + (disp < 0 ? '; the minus sign says it ended up on the $-x$ side of where it started.' : '.')] : disp < 0 ? ['The minus sign says it moved in the $-x$ direction.'] : []),
        hint: 'Final position minus initial position. Keep the sign.',
        d: { k: 'disp', xs: xs }
      };
    }
    return {
      q: who[0] + ' ' + trip + '. What total distance does it travel?',
      a: AX(dist), unit: 'm',
      steps: legs.map(function (l, j) { return 'Leg ' + (j + 1) + ': it moves $' + abs(xs[j + 1] - xs[j]) + '\\ \\text{m}$ (a change of $' + l + '\\ \\text{m}$).'; }).concat(['Distance adds the lengths of all legs, with no signs: $' + legs.map(function (l, j) { return abs(xs[j + 1] - xs[j]); }).join(' + ') + ' = ' + dist + '\\ \\text{m}$.', 'Compare: the displacement is only $' + disp + '\\ \\text{m}$.']),
      hint: 'Add up how far it moves on each leg, ignoring direction.',
      d: { k: 'dist', xs: xs }
    };
  }));

  // ---------- phys1.average-velocity
  G('phys1.average-velocity', W(function (R, ctx) {
    var shape = by(ctx, 'one', R.pick(['two-vel', 'two-speed']), R.pick(['two-vel', 'harm', 'round']));
    if (shape === 'one') {
      var v = R.nz(-6, 6) * R.pick([1, 0.5]), t = R.int(2, 8), x0 = R.int(-10, 20), x1 = x0 + v * t;
      if (!Number.isInteger(x1)) { t = t % 2 ? t + 1 : t; x1 = x0 + v * t; }
      return {
        q: 'A toy car moves from $x = ' + x0 + '\\ \\text{m}$ to $x = ' + x1 + '\\ \\text{m}$ in $' + t + '\\ \\text{s}$. What is its average velocity?',
        a: AX(v), unit: 'm/s',
        steps: ['$\\Delta x = x_f - x_i = ' + x1 + ' - ' + T.p(x0) + ' = ' + (x1 - x0) + '\\ \\text{m}$.', '$v_{avg} = \\dfrac{\\Delta x}{\\Delta t} = \\dfrac{' + (x1 - x0) + '\\ \\text{m}}{' + t + '\\ \\text{s}} = ' + tv(v) + '\\ \\text{m/s}$.'].concat(v < 0 ? ['The minus sign means the car moved in the $-x$ direction.'] : []),
        hint: 'Average velocity is displacement divided by time. Keep the sign.',
        d: { k: 'one', x0: x0, x1: x1, t: t }
      };
    }
    if (shape === 'two-vel' || shape === 'two-speed') {
      var d1 = R.int(3, 12) * 10, d2 = R.int(1, Math.floor(d1 / 10) - 1 || 1) * 10, t1 = R.int(2, 6) * 5, t2 = R.int(1, 4) * 5;
      if (d2 >= d1) d2 = d1 - 10;
      var ttot = t1 + t2, disp = d1 - d2, dist = d1 + d2, east = R.coin();
      var dir1 = east ? 'east' : 'west', dir2 = east ? 'west' : 'east', sgn = east ? 1 : -1;
      var vel = sgn * disp / ttot, spd = dist / ttot, isVel = shape === 'two-vel';
      return {
        q: 'A student walks $' + d1 + '\\ \\text{m}$ ' + dir1 + ' in $' + t1 + '\\ \\text{s}$, then turns and walks $' + d2 + '\\ \\text{m}$ ' + dir2 + ' in $' + t2 + '\\ \\text{s}$. Take east as $+x$. What is the student\'s average ' + (isVel ? 'velocity' : 'speed') + ' for the whole walk?',
        a: A(isVel ? vel : spd, 3, 0.02), unit: 'm/s',
        steps: ['Total time: $\\Delta t = ' + t1 + ' + ' + t2 + ' = ' + ttot + '\\ \\text{s}$.'].concat(isVel ?
          ['Displacement: $\\Delta x = ' + T.p(sgn * d1) + ' + ' + T.p(-sgn * d2) + ' = ' + (sgn * disp) + '\\ \\text{m}$.', '$v_{avg} = \\dfrac{\\Delta x}{\\Delta t} = \\dfrac{' + (sgn * disp) + '}{' + ttot + '} ' + eqa(vel) + '\\ \\text{m/s}$.'] :
          ['Distance: $' + d1 + ' + ' + d2 + ' = ' + dist + '\\ \\text{m}$ (no signs).', 'Average speed $= \\dfrac{\\text{distance}}{\\Delta t} = \\dfrac{' + dist + '}{' + ttot + '} ' + eqa(spd) + '\\ \\text{m/s}$.']),
        hint: isVel ? 'Use displacement (with signs), not the total distance.' : 'Average speed uses the total distance, with no signs.',
        d: { k: shape, d1: d1 * sgn, d2: -d2 * sgn, t1: t1, t2: t2 }
      };
    }
    var pair = R.pick([[30, 60], [40, 60], [20, 30], [60, 90], [45, 90], [36, 60]]), D = R.pick([30, 60, 90, 120, 180]);
    if (R.coin()) pair = [pair[1], pair[0]];
    var tA = D / pair[0], tB = D / pair[1], vavg = 2 * D / (tA + tB);
    if (shape === 'round') {
      return {
        q: 'You drive $' + D + '\\ \\text{km}$ to a lake at $' + pair[0] + '\\ \\text{km/h}$ and drive back home along the same road at $' + pair[1] + '\\ \\text{km/h}$. What is your average <b>velocity</b> for the round trip?',
        a: { t: 'num', v: '0' }, unit: 'km/h',
        steps: ['You end where you started, so the displacement is $\\Delta x = 0$.', '$v_{avg} = \\dfrac{\\Delta x}{\\Delta t} = \\dfrac{0}{\\Delta t} = 0\\ \\text{km/h}$.', 'Your average <i>speed</i> is not zero: it is $\\dfrac{' + 2 * D + '\\ \\text{km}}{' + tn(tA + tB, 4) + '\\ \\text{h}} ' + eqa(vavg) + '\\ \\text{km/h}$.'],
        hint: 'Where do you end up compared with where you started?',
        d: { k: 'round' }
      };
    }
    return {
      q: 'You drive $' + D + '\\ \\text{km}$ to a lake at a steady $' + pair[0] + '\\ \\text{km/h}$ and drive back home along the same road at $' + pair[1] + '\\ \\text{km/h}$. What is your average <b>speed</b> for the round trip?',
      a: A(vavg, 3, 0.01), unit: 'km/h',
      steps: ['Time out: $\\dfrac{' + D + '}{' + pair[0] + '} ' + eqa(tA) + '\\ \\text{h}$. Time back: $\\dfrac{' + D + '}{' + pair[1] + '} ' + eqa(tB) + '\\ \\text{h}$.', 'Total distance $' + 2 * D + '\\ \\text{km}$ in $' + tn(tA + tB, 4) + '\\ \\text{h}$.', 'Average speed $= \\dfrac{' + 2 * D + '\\ \\text{km}}{' + tn(tA + tB, 4) + '\\ \\text{h}} ' + eqa(vavg) + '\\ \\text{km/h}$, not $' + tv((pair[0] + pair[1]) / 2) + '$: you spend more time at the lower speed.'],
      hint: 'Find the time for each half. Average speed is total distance over total time.',
      d: { k: 'harm', D: D, v1: pair[0], v2: pair[1] }
    };
  }));

  // ---------- phys1.position-time-graphs
  function ptGraph(R, ctx) { // three or four straight segments; integer knots
    var n = by(ctx, 3, 3, 4), ts = [0], xs = [R.int(-4, 6)], rest = R.int(0, n - 1), vs = [];
    for (var i = 0; i < n; i++) {
      var dt = R.pick([1, 2, 2, 3]), v = i === rest ? 0 : R.nz(-4, 5) * (dt === 2 && R.chance(0.3) ? 0.5 : 1);
      if (i && v === vs[i - 1]) v = v === 0 ? 2 : -v;
      vs.push(v); ts.push(ts[i] + dt); xs.push(fx(xs[i] + v * dt));
    }
    return { ts: ts, xs: xs, vs: vs, n: n };
  }
  function ivl(G0, i) { return 't = ' + G0.ts[i] + '\\text{ s} \\text{ to } ' + G0.ts[i + 1] + '\\text{ s}'; }
  function ivlTxt(G0, i) { return G0.ts[i] + ' s to ' + G0.ts[i + 1] + ' s'; }
  G('phys1.position-time-graphs', W(function (R, ctx) {
    var G0 = ptGraph(R, ctx), pts = G0.ts.map(function (t, i) { return [t, G0.xs[i]]; });
    var viz = { name: 'ph-graph', opts: { pts: pts, xlab: 't', xunit: 's', ylab: 'x', yunit: 'm', tool: 'none', interactive: false, quiet: true } };
    var shape = by(ctx, 'slope', R.pick(['slope', 'rest', 'fast']), R.pick(['slope', 'fast', 'neg']));
    if (shape === 'slope') {
      var i = R.int(0, G0.n - 1); while (G0.vs[i] === 0 && G0.n > 1) i = (i + 1) % G0.n;
      var rise = fx(G0.xs[i + 1] - G0.xs[i]), run = G0.ts[i + 1] - G0.ts[i];
      return {
        q: 'The graph shows a cart\'s position $x$ against time $t$. What is the cart\'s velocity from $' + ivl(G0, i) + '$?',
        a: AX(G0.vs[i]), unit: 'm/s', viz: viz,
        steps: ['On an $x$–$t$ graph the slope is the velocity: $v = \\dfrac{\\Delta x}{\\Delta t}$.', 'From the graph: $x$ goes from $' + G0.xs[i] + '\\ \\text{m}$ to $' + G0.xs[i + 1] + '\\ \\text{m}$, so $\\Delta x = ' + rise + '\\ \\text{m}$, while $\\Delta t = ' + run + '\\ \\text{s}$.', '$v = \\dfrac{' + rise + '}{' + run + '} = ' + tv(G0.vs[i]) + '\\ \\text{m/s}$.'],
        hint: 'Read the rise (change in x) and the run (change in t) for that piece of the graph.',
        d: { k: 'slope', pts: pts, i: i }
      };
    }
    var choices = G0.ts.slice(0, G0.n).map(function (t, j) { return ivlTxt(G0, j); }), want = -1, vs = G0.vs;
    function only(pred) { var idx = []; vs.forEach(function (v, j) { if (pred(v)) idx.push(j); }); return idx.length === 1 ? idx[0] : -1; }
    var vmax = Math.max.apply(null, vs.map(abs));
    if (shape === 'fast') want = only(function (v) { return abs(v) === vmax; });
    else if (shape === 'neg') want = only(function (v) { return v < 0; });
    if (want < 0) { shape = 'rest'; want = only(function (v) { return v === 0; }); }
    var Q = { rest: 'During which interval is the cart standing still?', fast: 'During which interval is the cart moving fastest?', neg: 'During which interval is the cart moving in the $-x$ direction?' }[shape];
    var why = { rest: 'Standing still means the position does not change: the graph is flat (slope zero).', fast: 'Fastest means the steepest piece: the largest slope, up or down. The height of the graph is the position, not the speed.', neg: 'Moving in the $-x$ direction means the position is decreasing: the graph slopes down.' }[shape];
    return {
      q: 'The graph shows a cart\'s position $x$ against time $t$. ' + Q,
      a: MCK(choices, want), viz: viz,
      steps: [why].concat(G0.vs.map(function (v, j) { return 'From ' + choices[j] + ': slope $= ' + tv(v) + '\\ \\text{m/s}$.'; })).concat(['So the answer is ' + choices[want] + '.']),
      hint: 'Find the slope of each piece. The slope is the velocity.',
      d: { k: shape, pts: pts, ans: want }
    };
  }));

  // ---------- phys1.instantaneous-velocity
  G('phys1.instantaneous-velocity', W(function (R, ctx) {
    var shape = by(ctx, 'tangent', R.pick(['tangent', 'table', 'tags']), R.pick(['table', 'tags', 'tags']));
    var ha = R.pick([-2, -1, 1, 2]), a = 2 * ha, tv0 = R.int(1, 4), v0 = -a * tv0 + R.pick([0, 0, R.nz(-2, 2)]), x0 = R.int(-2, 6), tm = 6;
    function X(t) { return x0 + v0 * t + ha * t * t; }
    function V(t) { return v0 + a * t; }
    if (shape === 'tangent') {
      var t1 = R.int(1, 5), p1 = [t1 - 1, X(t1) - V(t1)], p2 = [t1 + 1, X(t1) + V(t1)];
      return {
        q: 'The curve shows a ball\'s position $x$ (in meters) against time $t$. The dashed line is tangent to the curve at $t = ' + t1 + '\\ \\text{s}$, and it passes through the points $(' + p1[0] + '\\ \\text{s},\\ ' + p1[1] + '\\ \\text{m})$ and $(' + p2[0] + '\\ \\text{s},\\ ' + p2[1] + '\\ \\text{m})$. What is the ball\'s velocity at $t = ' + t1 + '\\ \\text{s}$?',
        a: AX(V(t1)), unit: 'm/s',
        viz: { name: 'ph-graph', opts: { fn: x0 + ' + ' + T.p(v0) + '*x + ' + T.p(ha) + '*x^2', domain: [0, tm], xlab: 't', xunit: 's', ylab: 'x', yunit: 'm', tool: 'slope', at: t1, interactive: false, quiet: true, show: ['triangle'] } },
        steps: ['The velocity at an instant is the slope of the tangent line there.', 'Slope $= \\dfrac{' + p2[1] + ' - ' + T.p(p1[1]) + '}{' + p2[0] + ' - ' + p1[0] + '} = \\dfrac{' + (p2[1] - p1[1]) + '}{2} = ' + tv(V(t1)) + '\\ \\text{m/s}$.'],
        hint: 'Find the slope of the dashed line from its two points.',
        d: { k: 'tangent', x0: x0, v0: v0, a: a, t1: t1 }
      };
    }
    if (shape === 'table') {
      var t2 = R.int(1, 5), h = R.pick([0.1, 0.2]), xa = fx(X(t2 - h)), xb = fx(X(t2 + h));
      return {
        q: 'A motion sensor records a cart\'s position: at $t = ' + fx(t2 - h) + '\\ \\text{s}$ it is at $x = ' + xa + '\\ \\text{m}$, and at $t = ' + fx(t2 + h) + '\\ \\text{s}$ it is at $x = ' + xb + '\\ \\text{m}$. Estimate the cart\'s velocity at $t = ' + t2 + '\\ \\text{s}$ from the average velocity over this short interval.',
        a: A(V(t2), 3, 0.02), unit: 'm/s',
        steps: ['Over a very short interval centered on $t = ' + t2 + '\\ \\text{s}$, the average velocity is close to the velocity at that instant.', '$v \\approx \\dfrac{' + xb + ' - ' + T.p(xa) + '}{' + fx(2 * h) + '} = ' + tv(V(t2)) + '\\ \\text{m/s}$.'],
        hint: 'Divide the change in position by the change in time.',
        d: { k: 'table', x0: x0, v0: v0, a: a, t2: t2, h: h }
      };
    }
    // tags: four points on the x-t curve; which one has zero / greatest / negative velocity
    var segs = []; for (var i = 0; i < tm; i++) segs.push({ dur: 1, a: a });
    var cand = [0, 1, 2, 3, 4, 5, 6], tv0ok = tv0; v0 = -a * tv0ok; // vertex at a knot
    var others = R.sample(cand.filter(function (t) { return t !== tv0ok; }), 3), knots = others.concat([tv0ok]).sort(function (p, q) { return p - q; });
    var letters = ['A', 'B', 'C', 'D'], tags = {}; knots.forEach(function (t, j) { tags['p' + t] = letters[j]; });
    var want = R.pick(['zero', 'max']), vals = knots.map(V), ans;
    if (want === 'zero') ans = knots.indexOf(tv0ok);
    else { ans = 0; vals.forEach(function (v, j) { if (v > vals[ans]) ans = j; }); if (vals.filter(function (v) { return v === vals[ans]; }).length > 1 || vals[ans] <= 0) { want = 'zero'; ans = knots.indexOf(tv0ok); } }
    x0 = R.int(0, 4);
    return {
      q: 'The graph shows a cart\'s position against time, with four points marked. At which point is the cart\'s velocity ' + (want === 'zero' ? 'zero' : 'greatest (most positive)') + '?',
      a: MCK(letters, ans),
      viz: { name: 'ph-motion', opts: { x0: x0, v0: v0, segments: segs, graphs: ['x'], hide: ['track'], interactive: false, quiet: true, tags: tags } },
      steps: ['The velocity at a point is the slope of the curve there, not the height of the curve.'].concat(knots.map(function (t, j) { return 'Point ' + letters[j] + ' ($t = ' + t + '\\ \\text{s}$): the slope is ' + (V(t) === 0 ? 'zero (the curve is flat at its turning point)' : V(t) > 0 ? 'positive' : 'negative') + ', $v = ' + V(t) + '\\ \\text{m/s}$.'; })).concat(['So the answer is ' + letters[ans] + '.']),
      hint: want === 'zero' ? 'Where is the curve momentarily flat?' : 'Where does the curve climb most steeply?',
      d: { k: 'tags', v0: v0, a: a, knots: knots, want: want, ans: ans }
    };
  }));

  // ---------- phys1.acceleration
  var MOVERS = ['A car', 'A cyclist', 'A train', 'A skateboarder', 'A runner', 'A bus'];
  G('phys1.acceleration', W(function (R, ctx) {
    var shape = by(ctx, 'calc', R.pick(['calc', 'calc', 'sense']), R.pick(['calc', 'sense', 'turn']));
    if (shape === 'sense') {
      var v = R.nz(-9, 9), a = R.nz(-4, 4);
      var right = v * a > 0 ? 'speeding up' : 'slowing down';
      return {
        q: 'At one instant an object has velocity $v = ' + v + '\\ \\text{m/s}$ and acceleration $a = ' + a + '\\ \\text{m/s}^2$. At that instant, the object is…',
        a: MC(right, [v * a > 0 ? 'slowing down' : 'speeding up', 'moving at a steady speed', 'at rest']),
        steps: ['Compare the directions (signs) of $v$ and $a$, not the sign of $a$ alone.', 'Here $v$ is ' + (v > 0 ? 'positive' : 'negative') + ' and $a$ is ' + (a > 0 ? 'positive' : 'negative') + ': they point ' + (v * a > 0 ? 'the same way' : 'opposite ways') + '.', 'Same direction means speeding up; opposite directions mean slowing down. So it is ' + right + '.'],
        hint: 'Do v and a point the same way or opposite ways?',
        d: { k: 'sense', v: v, a: a, ans: right }
      };
    }
    var t = R.int(2, 6), acc, vi, vf, who = R.pick(MOVERS);
    if (shape === 'turn') {
      acc = R.nz(-3, 3); vi = -acc * R.int(1, t - 1); vf = vi + acc * t;
      return {
        q: 'A ball rolls ' + (vi > 0 ? 'up' : 'down') + ' a long ramp. Take $+x$ ' + (vi > 0 ? 'up' : 'down') + ' the ramp. At first its velocity is $' + vi + '\\ \\text{m/s}$; $' + t + '\\ \\text{s}$ later it is $' + vf + '\\ \\text{m/s}$. What is its acceleration?',
        a: AX(acc), unit: 'm/s²',
        steps: ['$a = \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{v_f - v_i}{\\Delta t}$.', '$a = \\dfrac{' + vf + ' - ' + T.p(vi) + '}{' + t + '} = \\dfrac{' + (vf - vi) + '}{' + t + '} = ' + acc + '\\ \\text{m/s}^2$.', 'The ball slowed, stopped and came back, yet the acceleration was the same the whole time.'],
        hint: 'Final velocity minus initial velocity, divided by the time. Keep both signs.',
        d: { k: 'calc', vi: vi, vf: vf, t: t }
      };
    }
    var dirNeg = R.coin(), speedUp = R.coin(), s1 = R.int(2, 12), dv = R.int(1, 4) * t;
    var s2 = speedUp ? s1 + dv : Math.max(0, s1 + R.int(2, 6) - dv);
    if (!speedUp) { s1 = s2 + dv; }
    vi = dirNeg ? -s1 : s1; vf = dirNeg ? -s2 : s2; acc = (vf - vi) / t;
    var dir = dirNeg ? 'west' : 'east';
    return {
      q: who + ' heading ' + dir + ' ' + (speedUp ? 'speeds up' : 'slows down') + ' from $' + s1 + '\\ \\text{m/s}$ to $' + s2 + '\\ \\text{m/s}$ in $' + t + '\\ \\text{s}$. Take east as $+x$. What is its acceleration?',
      a: AX(acc), unit: 'm/s²',
      steps: ['Heading ' + dir + ' means the velocities are ' + (dirNeg ? 'negative' : 'positive') + ': $v_i = ' + vi + '\\ \\text{m/s}$, $v_f = ' + vf + '\\ \\text{m/s}$.', '$a = \\dfrac{v_f - v_i}{\\Delta t} = \\dfrac{' + vf + ' - ' + T.p(vi) + '}{' + t + '} = ' + tv(acc) + '\\ \\text{m/s}^2$.', (acc < 0 ? 'The acceleration is negative' : 'The acceleration is positive') + ' and the object is ' + (speedUp ? 'speeding up' : 'slowing down') + ', because $a$ points ' + (speedUp ? 'the same way as' : 'opposite to') + ' $v$.'],
      hint: 'Write both velocities with signs first, then use a = Δv/Δt.',
      d: { k: 'calc', vi: vi, vf: vf, t: t }
    };
  }));

  // ---------- phys1.velocity-time-graphs
  /* vtGraph: straight pieces with integer knots; each piece has a whole or half-whole acceleration. mode 'pos' keeps
     v >= 0; 'neg' ends below the axis; 'any' lets it cross. */
  function vtGraph(R, ctx, mode) {
    for (var tries = 0; tries < 60; tries++) {
      var n = by(ctx, 3, 3, 4), ts = [0], vs = [R.int(0, 4)], ok = true;
      for (var i = 0; i < n; i++) {
        var dt = R.pick([1, 2, 2, 3, 4]), acc = R.pick([0, 1, 2, 3, -1, -2, -3, 0.5, -0.5]);
        if (!Number.isInteger(acc * dt)) acc = Math.round(acc * 2) || 1;
        var nv = vs[i] + acc * dt;
        ts.push(ts[i] + dt); vs.push(nv);
      }
      var mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs);
      if (mx > 10 || mn < -6 || mx === mn) ok = false;
      if (mode === 'pos' && mn < 0) ok = false;
      if (mode === 'neg') { var nn = 0; for (i = 0; i < n; i++) if (vs[i] + vs[i + 1] < 0) nn++; if (nn !== 1 || mx <= 0) ok = false; }
      if (mode === 'any' && !(mn < 0 && mx > 0)) ok = false;
      for (i = 0; i < n && ok; i++) if (vs[i] * vs[i + 1] < 0) ok = false; // cross zero only at a knot
      if (ok) return { ts: ts, vs: vs, n: n };
    }
    return { ts: [0, 2, 4, 6, 8], vs: [0, 4, 4, 0, -2], n: 4 };
  }
  function trapArea(ts, vs, lo, hi) { // exact signed area under straight segments between knots lo..hi
    var s = 0; for (var i = lo; i < hi; i++) s += (vs[i] + vs[i + 1]) / 2 * (ts[i + 1] - ts[i]); return fx(s);
  }
  G('phys1.velocity-time-graphs', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['slope', 'area']), R.pick(['slope', 'area', 'back']), R.pick(['area-neg', 'back', 'slope']));
    var Gv = vtGraph(R, ctx, shape === 'area-neg' ? 'any' : shape === 'back' ? 'neg' : 'pos'), i;
    var pts = Gv.ts.map(function (t, j) { return [t, Gv.vs[j]]; });
    var viz = { name: 'ph-graph', opts: { pts: pts, xlab: 't', xunit: 's', ylab: 'v', yunit: 'm/s', tool: 'none', interactive: false, quiet: true } };
    if (shape === 'slope') {
      i = R.int(0, Gv.n - 1); for (var k = 0; k < Gv.n && Gv.vs[i] === Gv.vs[i + 1]; k++) i = (i + 1) % Gv.n;
      var dv = Gv.vs[i + 1] - Gv.vs[i], dt = Gv.ts[i + 1] - Gv.ts[i], acc = fx(dv / dt);
      return {
        q: 'The graph shows a cart\'s velocity $v$ against time $t$. What is the cart\'s acceleration from $' + ivl(Gv, i) + '$?',
        a: AX(acc), unit: 'm/s²', viz: viz,
        steps: ['On a $v$–$t$ graph the slope is the acceleration: $a = \\dfrac{\\Delta v}{\\Delta t}$.', 'From the graph: $v$ goes from $' + Gv.vs[i] + '$ to $' + Gv.vs[i + 1] + '\\ \\text{m/s}$, so $\\Delta v = ' + dv + '\\ \\text{m/s}$, over $\\Delta t = ' + dt + '\\ \\text{s}$.', '$a = \\dfrac{' + dv + '}{' + dt + '} = ' + tv(acc) + '\\ \\text{m/s}^2$.'],
        hint: 'The slope of a v–t graph is the acceleration.',
        d: { k: 'slope', pts: pts, i: i }
      };
    }
    if (shape === 'area' || shape === 'area-neg') {
      var ar = trapArea(Gv.ts, Gv.vs, 0, Gv.n), pieces = [];
      for (i = 0; i < Gv.n; i++) pieces.push(fx((Gv.vs[i] + Gv.vs[i + 1]) / 2 * (Gv.ts[i + 1] - Gv.ts[i])));
      return {
        q: 'The graph shows a cart\'s velocity $v$ against time $t$. What is the cart\'s displacement from $t = 0$ to $t = ' + Gv.ts[Gv.n] + '\\ \\text{s}$?',
        a: AX(ar), unit: 'm', viz: viz,
        steps: ['The displacement is the area between the $v$–$t$ graph and the time axis, counted negative below the axis.'].concat(pieces.map(function (p, j) { return 'From ' + ivlTxt(Gv, j) + ': $\\tfrac12(' + Gv.vs[j] + ' + ' + T.p(Gv.vs[j + 1]) + ')(' + (Gv.ts[j + 1] - Gv.ts[j]) + ') = ' + p + '\\ \\text{m}$.'; })).concat(['Total: $\\Delta x = ' + pieces.map(T.p).join(' + ') + ' = ' + ar + '\\ \\text{m}$.']),
        hint: 'Split the area into trapezoids (or rectangles and triangles), one per straight piece.',
        d: { k: 'area', pts: pts }
      };
    }
    // back: when is the cart moving in the -x direction? (v < 0, not slope < 0)
    var ch = Gv.ts.slice(0, Gv.n).map(function (t, j) { return ivlTxt(Gv, j); }), ans = -1;
    for (i = 0; i < Gv.n; i++) if (Gv.vs[i] + Gv.vs[i + 1] < 0) { ans = i; break; }
    return {
      q: 'The graph shows a cart\'s velocity $v$ against time $t$. During which interval is the cart moving in the $-x$ direction (backward)?',
      a: MCK(ch, ans), viz: viz,
      steps: ['On a $v$–$t$ graph the direction of motion is the sign of $v$: below the axis means moving in the $-x$ direction.', 'A downward slope only means the velocity is decreasing, which is not the same as moving backward.', 'The graph is below the axis from ' + ch[ans] + '.'],
      hint: 'Look at whether v is above or below the axis, not at the slope.',
      d: { k: 'back', pts: pts, ans: ans }
    };
  }));

  // ======================= 02-kinematics2.js
  // ---------- phys1.motion-graph-translation
  function stepPts(ts, vals) { var p = []; for (var i = 0; i < vals.length; i++) { if (i) p.push(null); p.push([ts[i], vals[i]], [ts[i + 1], vals[i]]); } return p; }
  function linePts(ts, ys) { return ts.map(function (t, i) { return [t, ys[i]]; }); }
  function quadPts(ts, x0, v0, accs) { // x(t) for piecewise-constant acceleration, sampled
    var p = [[0, x0]], x = x0, v = v0;
    for (var i = 0; i < accs.length; i++) { var dt = ts[i + 1] - ts[i]; for (var k = 1; k <= 8; k++) { var s = dt * k / 8; p.push([fx(ts[i] + s), fx(x + v * s + 0.5 * accs[i] * s * s)]); } x = x + v * dt + 0.5 * accs[i] * dt * dt; v = v + accs[i] * dt; }
    return p;
  }
  function negPts(p) { return p.map(function (q) { return q ? [q[0], fx(-q[1])] : null; }); }
  function knotsFromSlopes(ts, y0, slopes) { var ys = [y0]; for (var i = 0; i < slopes.length; i++) ys.push(fx(ys[i] + slopes[i] * (ts[i + 1] - ts[i]))); return ys; }
  function slopesRand(R, n, zero) { // n small whole-number slopes, one of them zero (when asked), neighbors different
    for (var tries = 0; tries < 50; tries++) {
      var s = [], z = zero ? R.int(0, n - 1) : -1;
      for (var i = 0; i < n; i++) s.push(i === z ? 0 : R.nz(-3, 3));
      var ok = true; for (i = 1; i < n; i++) if (s[i] === s[i - 1]) ok = false;
      if (ok && s.some(function (v) { return v > 0; }) && s.some(function (v) { return v < 0; })) return s;
    }
    return [2, 0, -1].slice(0, n);
  }
  G('phys1.motion-graph-translation', W(function (R, ctx) {
    var kind = by(ctx, 'x2v', R.pick(['x2v', 'v2a', 'v2x']), R.pick(['v2a', 'v2x', 'a2v', 'v2xq']));
    for (var attempt = 0; attempt < 30; attempt++) {
      var n = 3, ts = [0], i; for (i = 0; i < n; i++) ts.push(ts[i] + R.pick([1, 2, 2, 3]));
      var sl = slopesRand(R, n, kind !== 'v2xq'), given, right, wrongs, gq, cq, steps, y0 = R.int(-2, 4);
      if (kind === 'x2v') {
        var xs = knotsFromSlopes(ts, y0, sl); gq = 'x'; cq = 'v';
        given = linePts(ts, xs); right = stepPts(ts, sl);
        wrongs = [linePts(ts, xs), negPts(right), stepPts(ts, xs.slice(1))];
        steps = ['The velocity is the slope of the $x$–$t$ graph, so each straight piece of $x$ becomes a flat piece of $v$.'].concat(sl.map(function (v, j) { return 'From $t = ' + ts[j] + '$ to $' + ts[j + 1] + '\\ \\text{s}$: slope $= \\dfrac{' + fx(xs[j + 1] - xs[j]) + '\\ \\text{m}}{' + (ts[j + 1] - ts[j]) + '\\ \\text{s}} = ' + v + '\\ \\text{m/s}$.'; }));
      } else if (kind === 'v2a') {
        var vs = knotsFromSlopes(ts, y0, sl); gq = 'v'; cq = 'a';
        given = linePts(ts, vs); right = stepPts(ts, sl);
        wrongs = [linePts(ts, vs), negPts(right), stepPts(ts, vs.slice(1))];
        steps = ['The acceleration is the slope of the $v$–$t$ graph, so each straight piece of $v$ becomes a flat piece of $a$.'].concat(sl.map(function (a, j) { return 'From $t = ' + ts[j] + '$ to $' + ts[j + 1] + '\\ \\text{s}$: slope $= \\dfrac{' + fx(vs[j + 1] - vs[j]) + '\\ \\text{m/s}}{' + (ts[j + 1] - ts[j]) + '\\ \\text{s}} = ' + a + '\\ \\text{m/s}^2$.'; }));
      } else if (kind === 'v2x') {
        gq = 'v'; cq = 'x';
        given = stepPts(ts, sl); var xk = knotsFromSlopes(ts, 0, sl); right = linePts(ts, xk);
        wrongs = [stepPts(ts, sl), negPts(right), linePts(ts, knotsFromSlopes(ts, 0, sl.slice().reverse()))];
        steps = ['Start at $x = 0$. A constant velocity means a straight piece of $x$ whose slope is that velocity.'].concat(sl.map(function (v, j) { return 'From $t = ' + ts[j] + '$ to $' + ts[j + 1] + '\\ \\text{s}$: $v = ' + v + '\\ \\text{m/s}$, so $x$ changes by $' + v + ' \\times ' + (ts[j + 1] - ts[j]) + ' = ' + fx(v * (ts[j + 1] - ts[j])) + '\\ \\text{m}$' + (v === 0 ? ' (flat).' : '.'); }));
      } else if (kind === 'a2v') {
        gq = 'a'; cq = 'v';
        given = stepPts(ts, sl); var vk = knotsFromSlopes(ts, 0, sl); right = linePts(ts, vk);
        wrongs = [stepPts(ts, sl), negPts(right), linePts(ts, knotsFromSlopes(ts, 0, sl.slice().reverse()))];
        steps = ['The cart starts from rest, $v = 0$. A constant acceleration means a straight piece of $v$ whose slope is that acceleration.'].concat(sl.map(function (a, j) { return 'From $t = ' + ts[j] + '$ to $' + ts[j + 1] + '\\ \\text{s}$: $a = ' + a + '\\ \\text{m/s}^2$, so $v$ changes by $' + fx(a * (ts[j + 1] - ts[j])) + '\\ \\text{m/s}$, reaching $' + vk[j + 1] + '\\ \\text{m/s}$.'; }));
      } else { // v2xq: v made of sloped pieces -> x made of curves
        gq = 'v'; cq = 'x';
        var acc = slopesRand(R, n, true), v0q = R.int(-1, 2), vq = knotsFromSlopes(ts, v0q, acc);
        given = linePts(ts, vq); right = quadPts(ts, 0, v0q, acc);
        var xkn = [0]; for (i = 0; i < n; i++) xkn.push(fx(xkn[i] + (vq[i] + vq[i + 1]) / 2 * (ts[i + 1] - ts[i])));
        wrongs = [linePts(ts, vq), negPts(right), linePts(ts, xkn)];
        steps = ['Start at $x = 0$. The slope of $x$ at each moment equals $v$ at that moment.', 'Where $v$ changes steadily, the slope of $x$ changes steadily too, so $x$ is a curve: bending up where $a > 0$, bending down where $a < 0$, straight where $a = 0$.', 'The change in $x$ on each piece is the area under $v$: ' + acc.map(function (a, j) { return '$' + fx(xkn[j + 1] - xkn[j]) + '\\ \\text{m}$'; }).join(', ') + '.', 'The graph with straight pieces joining the same points has the right heights but the wrong shape: its slope would jump instead of changing smoothly.'];
      }
      var all = [right].concat(wrongs), keys = all.map(function (p) { return JSON.stringify(p); });
      var distinct = keys.every(function (kk, j) { return keys.indexOf(kk) === j; });
      if (!distinct) continue;
      var order = R.shuffle([0, 1, 2, 3]), choices = order.map(function (j) { return { q: cq, pts: all[j] }; }), ans = order.indexOf(0);
      var NAME = { x: 'x–t', v: 'v–t', a: 'a–t' };
      return {
        q: 'A cart moves along a straight track. Its ' + NAME[gq] + ' graph is shown at the top' + (kind === 'a2v' ? ', and it starts from rest' : kind.indexOf('v2x') === 0 ? ', and it starts at $x = 0$' : '') + '. Which ' + NAME[cq] + ' graph matches the same motion?',
        a: MCK(['A', 'B', 'C', 'D'], ans),
        viz: { name: 'phys1-graphmatch', opts: { given: { q: gq, pts: given }, choices: choices } },
        steps: steps.concat(['That is graph ' + 'ABCD'[ans] + '. A graph with the same shape as the given one is a common trap: the shapes of $x$, $v$ and $a$ graphs differ.']),
        hint: gq === 'x' || (gq === 'v' && cq === 'a') ? 'Find the slope of each straight piece of the given graph.' : 'Each piece of the given graph is the slope of the graph you want.',
        d: { k: kind, given: given, gq: gq, cq: cq, choices: choices.map(function (c) { return c.pts; }), ans: ans, ts: ts }
      };
    }
    throw new Error('motion-graph-translation: no distinct set');
  }));

  // ---------- phys1.kinematic-equations
  var KIN_WHO = [['A car', 'merges onto a highway'], ['A cyclist', 'rides down a gentle slope'], ['A train', 'pulls out of a station'], ['A sprinter', 'drives out of the blocks'], ['A rocket sled', 'runs along a test track'], ['A skateboarder', 'rolls down a long ramp']];
  G('phys1.kinematic-equations', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['v', 'x']), R.pick(['v', 'x', 't', 'a', 'stop']), R.pick(['a', 'stop', 'phases', 'phases', 't']));
    var who = R.pick(KIN_WHO), v0 = R.pick([0, R.int(2, 15)]), a = R.pick([0.5, 1.5, 2, 2.5, 3, 4, 1.2, 0.8]), t = R.int(3, 10);
    var v = fx(v0 + a * t), dx = fx(v0 * t + 0.5 * a * t * t);
    if (shape === 'v') return {
      q: who[0] + ' moving at $' + v0 + '\\ \\text{m/s}$ speeds up with a constant acceleration of $' + gv(a, 'm/s2') + '$ for $' + t + '\\ \\text{s}$. What is its final velocity?',
      a: A(v), unit: 'm/s',
      steps: ['Constant acceleration, and we know $v_0$, $a$ and $t$: use $v = v_0 + at$.', '$v = ' + v0 + ' + (' + tv(a) + ')(' + t + ') = ' + qu(v, 'm/s') + '$.'],
      hint: 'v = v₀ + at.', d: { k: 'v', v0: v0, a: a, t: t }
    };
    if (shape === 'x') return {
      q: who[0] + ' ' + who[1] + ', starting at $' + v0 + '\\ \\text{m/s}$ with a constant acceleration of $' + gv(a, 'm/s2') + '$. How far does it travel in $' + t + '\\ \\text{s}$?',
      a: A(dx), unit: 'm',
      steps: ['Use $\\Delta x = v_0 t + \\tfrac12 a t^2$.', '$v_0 t = ' + v0 + ' \\times ' + t + ' = ' + v0 * t + '\\ \\text{m}$; $\\tfrac12 a t^2 = \\tfrac12(' + tv(a) + ')(' + t + ')^2 = ' + tv(0.5 * a * t * t) + '\\ \\text{m}$.', '$\\Delta x = ' + qu(dx, 'm') + '$.'],
      hint: 'Δx = v₀t + ½at².', d: { k: 'x', v0: v0, a: a, t: t }
    };
    if (shape === 't') return {
      q: who[0] + ' speeds up from $' + v0 + '\\ \\text{m/s}$ to $' + tv(v) + '\\ \\text{m/s}$ with a constant acceleration of $' + gv(a, 'm/s2') + '$. How long does this take?',
      a: A(t), unit: 's',
      steps: ['From $v = v_0 + at$, solve for $t$: $t = \\dfrac{v - v_0}{a}$.', '$t = \\dfrac{' + tv(v) + ' - ' + v0 + '}{' + tv(a) + '} = ' + t + '\\ \\text{s}$.'],
      hint: 'Rearrange v = v₀ + at for t.', d: { k: 't', v0: v0, a: a, v: v }
    };
    if (shape === 'a') {
      return {
        q: who[0] + ' starts at $' + v0 + '\\ \\text{m/s}$ and covers $' + tv(dx) + '\\ \\text{m}$ in $' + t + '\\ \\text{s}$ with a constant acceleration. What is the acceleration?',
        a: A(a), unit: 'm/s²',
        steps: ['Use $\\Delta x = v_0 t + \\tfrac12 a t^2$ and solve for $a$: $a = \\dfrac{2(\\Delta x - v_0 t)}{t^2}$.', '$a = \\dfrac{2(' + tv(dx) + ' - ' + v0 * t + ')}{' + t * t + '} = ' + qu(a, 'm/s2') + '$.'],
        hint: 'Put the numbers into Δx = v₀t + ½at², then solve for a.', d: { k: 'a', v0: v0, dx: dx, t: t }
      };
    }
    if (shape === 'stop') {
      var u = R.int(12, 30), b = R.pick([2, 2.5, 4, 5, 6, 8]), ts = u / b, d = u * ts - 0.5 * b * ts * ts, askT = R.coin();
      return {
        q: 'A car moving at $' + u + '\\ \\text{m/s}$ brakes with a constant acceleration of $' + gv(-b, 'm/s2') + '$ (taking the direction of motion as positive). ' + (askT ? 'How long does it take to stop?' : 'How far does it travel before it stops?'),
        a: A(askT ? ts : d), unit: askT ? 's' : 'm',
        steps: ['Stopping means $v = 0$. From $v = v_0 + at$: $t = \\dfrac{0 - ' + u + '}{' + T.p(-b) + '} = ' + qu(ts, 's') + '$.'].concat(askT ? [] : ['Then $\\Delta x = v_0 t + \\tfrac12 a t^2 = (' + u + ')(' + tn(ts, 4) + ') + \\tfrac12(' + T.p(-b) + ')(' + tn(ts, 4) + ')^2 = ' + qu(d, 'm') + '$.', 'The equations only hold until the car stops; after that the acceleration is zero, not $' + tv(-b) + '\\ \\text{m/s}^2$.']),
        hint: askT ? 'At the end v = 0. Use v = v₀ + at.' : 'Find the stopping time first, then use Δx = v₀t + ½at².', d: { k: askT ? 'stopT' : 'stopX', u: u, b: b }
      };
    }
    // phases: accelerate from rest, then cruise. One set of equations per phase.
    var a1 = R.pick([1.5, 2, 2.5, 3, 4]), t1 = R.int(3, 8), t2 = R.int(4, 15), vtop = a1 * t1, d1 = 0.5 * a1 * t1 * t1, d2 = vtop * t2;
    if (ctx.level >= 3 && R.chance(0.6)) return {
      q: 'A train starts from rest and speeds up at $' + gv(a1, 'm/s2') + '$ for $' + t1 + '\\ \\text{s}$, then runs at a steady speed for another $' + t2 + '\\ \\text{s}$. How far does it go in all?',
      a: A(d1 + d2), unit: 'm',
      steps: ['The acceleration changes after $' + t1 + '\\ \\text{s}$, so the constant-acceleration equations hold only within each phase.', 'Phase 1: $\\Delta x_1 = \\tfrac12(' + tv(a1) + ')(' + t1 + ')^2 = ' + tv(d1) + '\\ \\text{m}$, and it reaches $v = ' + tv(a1) + ' \\times ' + t1 + ' = ' + tv(vtop) + '\\ \\text{m/s}$.', 'Phase 2 (a = 0): $\\Delta x_2 = ' + tv(vtop) + ' \\times ' + t2 + ' = ' + tv(d2) + '\\ \\text{m}$.', 'Total: $' + tv(d1) + ' + ' + tv(d2) + ' = ' + qu(d1 + d2, 'm') + '$.'],
      hint: 'Split the trip where the acceleration changes.', d: { k: 'phases', a1: a1, t1: t1, t2: t2 }
    };
    var wrong = 0.5 * a1 * (t1 + t2) * (t1 + t2);
    return {
      q: 'A train starts from rest and speeds up at $' + gv(a1, 'm/s2') + '$ for $' + t1 + '\\ \\text{s}$, then runs at a steady speed for another $' + t2 + '\\ \\text{s}$. A student finds the total distance with $\\Delta x = \\tfrac12 a t^2$, using $a = ' + gv(a1, 'm/s2') + '$ and $t = ' + (t1 + t2) + '\\ \\text{s}$. What is wrong?',
      a: MC('The acceleration is not constant for the whole trip, so the trip must be split into two phases.', ['Nothing: the formula works for any motion that starts from rest.', 'The student should have used $v = v_0 + at$ instead.', 'The student should have used the average of the two times.']),
      steps: ['$\\Delta x = v_0 t + \\tfrac12 a t^2$ assumes one constant acceleration for the whole time.', 'Here the acceleration is $' + gv(a1, 'm/s2') + '$ for $' + t1 + '\\ \\text{s}$, then $0$.', 'The student\'s answer, $' + tn(wrong) + '\\ \\text{m}$, is too big. Phase by phase: $' + tn(d1) + ' + ' + tn(d2) + ' = ' + tn(d1 + d2) + '\\ \\text{m}$.'],
      hint: 'When do the constant-acceleration equations hold?', d: { k: 'phases-mc' }
    };
  }));

  // ---------- phys1.kinematics-without-time
  G('phys1.kinematics-without-time', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['stop', 'vf']), R.pick(['stop', 'vf', 'acc', 'skid']), R.pick(['acc', 'skid', 'ratio', 'vf']));
    if (shape === 'stop') {
      var u = R.int(10, 30), b = R.pick([3, 4, 5, 6, 7, 8]);
      return {
        q: 'A car moving at $' + u + '\\ \\text{m/s}$ brakes to a stop with a constant deceleration of magnitude $' + b + '\\ \\text{m/s}^2$. How far does it travel while braking?',
        a: A(u * u / (2 * b)), unit: 'm',
        steps: ['No time is given or asked for, so use $v^2 = v_0^2 + 2a\\Delta x$.', 'Take the motion as positive: $v_0 = ' + u + '\\ \\text{m/s}$, $v = 0$, $a = ' + (-b) + '\\ \\text{m/s}^2$.', '$0 = ' + u + '^2 + 2(' + (-b) + ')\\Delta x$, so $\\Delta x = \\dfrac{' + u * u + '}{' + 2 * b + '} = ' + qu(u * u / (2 * b), 'm') + '$.'],
        hint: 'v² = v₀² + 2aΔx with v = 0 at the end. The acceleration is negative.', d: { k: 'stop', u: u, b: b }
      };
    }
    if (shape === 'vf') {
      var v0 = R.int(0, 12), a = R.pick([1.5, 2, 2.5, 3, 4, 5]), dx = R.int(5, 40) * 2, vf = sqrt(v0 * v0 + 2 * a * dx);
      return {
        q: 'A skateboarder rolling at $' + v0 + '\\ \\text{m/s}$ speeds up at $' + gv(a, 'm/s2') + '$ down a slope $' + dx + '\\ \\text{m}$ long. How fast is the skateboarder going at the bottom?',
        a: A(vf), unit: 'm/s',
        steps: ['Use $v^2 = v_0^2 + 2a\\Delta x$ (the time is not needed).', '$v^2 = ' + v0 + '^2 + 2(' + tv(a) + ')(' + dx + ') = ' + tv(v0 * v0 + 2 * a * dx) + '\\ \\text{m}^2/\\text{s}^2$.', '$v = \\sqrt{' + tv(v0 * v0 + 2 * a * dx) + '} = ' + qu(vf, 'm/s') + '$. (Remember the factor 2, and take the square root at the end.)'],
        hint: 'v² = v₀² + 2aΔx, then take the square root.', d: { k: 'vf', v0: v0, a: a, dx: dx }
      };
    }
    if (shape === 'acc') {
      var vt = R.int(55, 85), L = R.int(8, 20) * 100, acc = vt * vt / (2 * L);
      return {
        q: 'A jet starts from rest and must reach a takeoff speed of $' + vt + '\\ \\text{m/s}$ within a runway $' + T.commas(L) + '\\ \\text{m}$ long. What constant acceleration does it need?',
        a: A(acc), unit: 'm/s²',
        steps: ['Use $v^2 = v_0^2 + 2a\\Delta x$ with $v_0 = 0$.', '$a = \\dfrac{v^2}{2\\Delta x} = \\dfrac{' + vt + '^2}{2(' + L + ')} = \\dfrac{' + vt * vt + '}{' + 2 * L + '} = ' + qu(acc, 'm/s2') + '$.'],
        hint: 'Solve v² = v₀² + 2aΔx for a.', d: { k: 'acc', v: vt, L: L }
      };
    }
    if (shape === 'skid') {
      var bb = R.pick([6, 7, 7.5, 8]), dd = R.int(15, 60), uu = sqrt(2 * bb * dd);
      return {
        q: 'A car leaves skid marks $' + dd + '\\ \\text{m}$ long while stopping. On that road, its deceleration while skidding is $' + gv(bb, 'm/s2') + '$. How fast was it going when the skid began?',
        a: A(uu), unit: 'm/s',
        steps: ['Use $v^2 = v_0^2 + 2a\\Delta x$ with $v = 0$ and $a = ' + tv(-bb) + '\\ \\text{m/s}^2$.', '$0 = v_0^2 - 2(' + tv(bb) + ')(' + dd + ')$, so $v_0^2 = ' + tv(2 * bb * dd) + '$.', '$v_0 = \\sqrt{' + tv(2 * bb * dd) + '} = ' + qu(uu, 'm/s') + '$.'],
        hint: 'At the end of the skid v = 0. Solve for v₀.', d: { k: 'skid', b: bb, d: dd }
      };
    }
    var kf = R.pick([2, 3, 1.5, 4]);
    return {
      q: 'A car\'s braking distance at a given speed is $d$. If the car goes $' + tv(kf) + '$ times as fast and brakes with the same deceleration, its braking distance is how many times $d$?',
      a: AX(kf * kf),
      steps: ['From $0 = v_0^2 - 2a\\Delta x$: $\\Delta x = \\dfrac{v_0^2}{2a}$, so the braking distance grows with the <b>square</b> of the speed.', 'Multiplying $v_0$ by $' + tv(kf) + '$ multiplies $\\Delta x$ by $' + tv(kf) + '^2 = ' + tv(kf * kf) + '$.'],
      hint: 'Write the braking distance in terms of v₀ and a.', d: { k: 'ratio', f: kf }
    };
  }));

  // ---------- phys1.free-fall
  var DROPS = ['a stone', 'a set of keys', 'an apple', 'a ball', 'a pine cone', 'a wrench'];
  G('phys1.free-fall', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['after', 'time']), R.pick(['time', 'speed', 'vsign', 'mass']), R.pick(['nth', 'speed', 'moon', 'mass']));
    var what = R.pick(DROPS);
    if (shape === 'after') {
      var t = R.pick([1, 1.5, 2, 2.5, 3, 4, 1.2, 3.5]), askV = R.coin();
      return {
        q: 'You drop ' + what + ' from rest. Ignoring air resistance, ' + (askV ? 'how fast is it falling' : 'how far has it fallen') + ' after $' + tv(t) + '\\ \\text{s}$?',
        a: A(askV ? g * t : 0.5 * g * t * t), unit: askV ? 'm/s' : 'm',
        steps: askV ? ['It starts at rest and gains $9.8\\ \\text{m/s}$ of speed every second.', 'Speed $= g t = (9.8)(' + tv(t) + ') = ' + qu(g * t, 'm/s') + '$.'] :
          ['From rest with constant acceleration $g$: distance $= \\tfrac12 g t^2$.', '$\\tfrac12(9.8)(' + tv(t) + ')^2 = ' + qu(0.5 * g * t * t, 'm') + '$.'],
        hint: askV ? 'Speed = gt when it starts from rest.' : 'Distance = ½gt² when it starts from rest.', d: { k: askV ? 'afterV' : 'afterX', t: t }
      };
    }
    if (shape === 'time' || shape === 'speed') {
      var h = R.pick([R.int(2, 9) * 5, R.int(3, 40), R.pick([4.9, 19.6, 44.1, 78.4])]), tt = sqrt(2 * h / g), vv = sqrt(2 * g * h), place = R.pick(['a bridge', 'the top of a building', 'a cliff', 'a balcony']);
      if (shape === 'time') return {
        q: 'You drop ' + what + ' from ' + place + ', $' + tv(h) + '\\ \\text{m}$ above the ground. Ignoring air resistance, how long does it take to hit the ground?',
        a: A(tt), unit: 's',
        steps: ['From rest: $h = \\tfrac12 g t^2$, so $t = \\sqrt{\\dfrac{2h}{g}}$.', '$t = \\sqrt{\\dfrac{2(' + tv(h) + ')}{9.8}} = ' + qu(tt, 's') + '$.'],
        hint: 'h = ½gt². Solve for t.', d: { k: 'time', h: h }
      };
      return {
        q: 'You drop ' + what + ' from ' + place + ', $' + tv(h) + '\\ \\text{m}$ above the ground. Ignoring air resistance, how fast is it moving just before it lands?',
        a: A(vv), unit: 'm/s',
        steps: ['Use $v^2 = v_0^2 + 2g h$ with $v_0 = 0$ (speeds, taking down as positive).', '$v = \\sqrt{2(9.8)(' + tv(h) + ')} = ' + qu(vv, 'm/s') + '$.'],
        hint: 'v² = 2gh for a drop from rest.', d: { k: 'speed', h: h }
      };
    }
    if (shape === 'vsign') {
      var t2 = R.int(1, 5), askY = R.coin();
      return {
        q: 'Take up as the $+y$ direction. A ball is dropped from rest. ' + (askY ? 'What is its displacement $\\Delta y$' : 'What is its velocity $v_y$') + ' after $' + t2 + '\\ \\text{s}$ (with its sign)?',
        a: A(askY ? -0.5 * g * t2 * t2 : -g * t2), unit: askY ? 'm' : 'm/s',
        steps: ['With up positive, the acceleration is $a = -9.8\\ \\text{m/s}^2$.'].concat(askY ? ['$\\Delta y = v_0 t + \\tfrac12 a t^2 = 0 + \\tfrac12(-9.8)(' + t2 + ')^2 = ' + qu(-0.5 * g * t2 * t2, 'm') + '$.', 'The minus sign says the ball ended up below where it started.'] : ['$v_y = v_0 + at = 0 + (-9.8)(' + t2 + ') = ' + qu(-g * t2, 'm/s') + '$.', 'The minus sign says the ball is moving down.']),
        hint: 'With up positive, a = −9.8 m/s².', d: { k: askY ? 'dy' : 'vy', t: t2 }
      };
    }
    if (shape === 'mass') {
      var m1 = R.pick([1, 2, 5, 3, 4]), m2 = m1 * R.pick([5, 10]);
      return {
        q: 'In a vacuum chamber, ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ steel ball and ' + art(m1, 'a') + ' $' + m1 + '\\ \\text{kg}$ steel ball are dropped together from the same height. Which lands first?',
        a: MC('They land at the same time.', ['The ' + m2 + ' kg ball lands first.', 'The ' + m1 + ' kg ball lands first.', 'It depends on how high they are dropped from.']),
        steps: ['The heavier ball feels a bigger gravitational force, $F = mg$, but it also has more mass to speed up.', 'Its acceleration is $a = \\dfrac{F}{m} = \\dfrac{mg}{m} = g$, the same $9.8\\ \\text{m/s}^2$ for both.', 'Same start, same acceleration: they fall together and land at the same time.'],
        hint: 'Find each ball\'s acceleration: force divided by mass.', d: { k: 'mass' }
      };
    }
    if (shape === 'moon') {
      var hm = R.int(2, 12), gm = 1.62, tm = sqrt(2 * hm / gm);
      return {
        q: 'An astronaut on the Moon drops a hammer from $' + hm + '\\ \\text{m}$ up. The Moon\'s $g$ is $1.62\\ \\text{m/s}^2$, and there is no air. How long does the hammer take to land?',
        a: A(tm), unit: 's',
        steps: ['Free fall works the same way on the Moon with $g = 1.62\\ \\text{m/s}^2$.', '$t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2(' + hm + ')}{1.62}} = ' + qu(tm, 's') + '$.'],
        hint: 'h = ½gt² with the Moon\'s g.', d: { k: 'moon', h: hm }
      };
    }
    var nn = R.int(2, 5), dn = 0.5 * g * (nn * nn - (nn - 1) * (nn - 1));
    return {
      q: 'A stone is dropped from rest from a high cliff. Ignoring air resistance, how far does it fall during the ' + U.ordinal(nn) + ' second (from $t = ' + (nn - 1) + '\\ \\text{s}$ to $t = ' + nn + '\\ \\text{s}$)?',
      a: A(dn), unit: 'm',
      steps: ['Distance fallen after $t$ seconds: $\\tfrac12 g t^2$.', 'After $' + nn + '\\ \\text{s}$: $' + tv(0.5 * g * nn * nn) + '\\ \\text{m}$. After $' + (nn - 1) + '\\ \\text{s}$: $' + tv(0.5 * g * (nn - 1) * (nn - 1)) + '\\ \\text{m}$.', 'During that second: $' + tv(0.5 * g * nn * nn) + ' - ' + tv(0.5 * g * (nn - 1) * (nn - 1)) + ' = ' + qu(dn, 'm') + '$. Each second it falls farther than the one before.'],
      hint: 'Subtract the distance fallen after n − 1 seconds from the distance after n seconds.', d: { k: 'nth', n: nn }
    };
  }));

  // ---------- phys1.vertical-launch
  G('phys1.vertical-launch', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['ttop', 'hmax', 'v0', 'tback']), R.pick(['hmax', 'vel', 'tback', 'top', 'v0']), R.pick(['cliff', 'vel', 'cliff', 'top']));
    var v0 = by(ctx, R.coin() ? R.pick([4.9, 9.8, 14.7, 19.6, 24.5, 29.4, 34.3, 39.2]) : R.int(5, 30), R.int(6, 30), R.int(6, 30)), THING = R.pick(['A ball', 'A tennis ball', 'A small stone', 'A beanbag', 'A baseball', 'An apple', 'A set of keys', 'A rubber ball']);
    if (shape === 'ttop' || shape === 'tback') {
      var tt = v0 / g * (shape === 'tback' ? 2 : 1);
      return {
        q: THING + ' is thrown straight up at $' + tv(v0) + '\\ \\text{m/s}$. Ignoring air resistance, how long does it take ' + (shape === 'tback' ? 'to come back down to the height it was thrown from?' : 'to reach the top of its path?'),
        a: A(tt), unit: 's',
        steps: ['Take up as positive: $a = -9.8\\ \\text{m/s}^2$ the whole time.', 'At the top $v = 0$: $0 = ' + tv(v0) + ' + (-9.8)t$, so $t_{top} = \\dfrac{' + tv(v0) + '}{9.8} = ' + qu(v0 / g, 's') + '$.'].concat(shape === 'tback' ? ['The way down takes as long as the way up (same acceleration, same distance), so the total time is $t = 2t_{top} = ' + qu(tt, 's') + '$.'] : []),
        hint: 'At the top the velocity is zero for an instant.', d: { k: shape, v0: v0 }
      };
    }
    if (shape === 'hmax') return {
      q: THING + ' is thrown straight up at $' + tv(v0) + '\\ \\text{m/s}$. Ignoring air resistance, how high does it rise above the point where it was released?',
      a: A(v0 * v0 / (2 * g)), unit: 'm',
      steps: ['At the top $v = 0$. Use $v^2 = v_0^2 + 2a\\Delta y$ with $a = -9.8\\ \\text{m/s}^2$.', '$0 = ' + tv(v0) + '^2 - 2(9.8)\\Delta y$, so $\\Delta y = \\dfrac{' + tv(v0 * v0) + '}{19.6} = ' + qu(v0 * v0 / (2 * g), 'm') + '$.'],
      hint: 'v² = v₀² + 2aΔy with v = 0 at the top.', d: { k: 'hmax', v0: v0 }
    };
    if (shape === 'v0') {
      var h = R.int(2, 40);
      return {
        q: 'How fast must you throw ' + THING.toLowerCase() + ' straight up for it to rise $' + h + '\\ \\text{m}$ above your hand? (Ignore air resistance.)',
        a: A(sqrt(2 * g * h)), unit: 'm/s',
        steps: ['At the top $v = 0$: $0 = v_0^2 - 2g h$.', '$v_0 = \\sqrt{2gh} = \\sqrt{2(9.8)(' + h + ')} = ' + qu(sqrt(2 * g * h), 'm/s') + '$.'],
        hint: 'Use v² = v₀² + 2aΔy with v = 0 at the top.', d: { k: 'v0', h: h }
      };
    }
    if (shape === 'vel') {
      var t = R.pick([0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.5, 3, 3.5, 4]), vy = v0 - g * t;
      if (abs(vy) < 0.5) t += 1, vy = v0 - g * t;
      return {
        q: 'Take up as positive. ' + THING + ' is thrown straight up at $' + tv(v0) + '\\ \\text{m/s}$. What is its velocity $' + tv(t) + '\\ \\text{s}$ later (with its sign)? Ignore air resistance.',
        a: A(vy), unit: 'm/s',
        steps: ['$v = v_0 + at$ with $a = -9.8\\ \\text{m/s}^2$ on the way up, at the top and on the way down.', '$v = ' + tv(v0) + ' + (-9.8)(' + tv(t) + ') = ' + qu(vy, 'm/s') + '$.', vy > 0 ? 'It is positive: the ball is still rising.' : 'It is negative: the ball has passed the top and is falling.'],
        hint: 'One equation covers the whole flight: v = v₀ − gt.', d: { k: 'vel', v0: v0, t: t }
      };
    }
    if (shape === 'top') return {
      q: 'A ball is thrown straight up. At the very top of its path, what are its velocity and acceleration? (Ignore air resistance.)',
      a: MC('$v = 0$, and $a = 9.8\\ \\text{m/s}^2$ downward', ['$v = 0$ and $a = 0$', '$v = 9.8\\ \\text{m/s}$ downward, and $a = 0$', '$v = 0$, and $a = 9.8\\ \\text{m/s}^2$ upward']),
      steps: ['At the top the ball stops rising for an instant: $v = 0$.', 'Gravity still pulls it down there, so its acceleration is still $9.8\\ \\text{m/s}^2$ downward. If $a$ were zero, the ball would stay at the top forever.', 'The velocity is changing from up to down at that instant, which is exactly what a downward acceleration does.'],
      hint: 'Is gravity switched off at the top?', d: { k: 'top' }
    };
    // cliff: thrown up from height h above the ground; time to land. -h = v0 t - 4.9 t^2
    var hh = R.int(8, 80), tl = (v0 + sqrt(v0 * v0 + 2 * g * hh)) / g;
    return {
      q: 'From the edge of a cliff $' + hh + '\\ \\text{m}$ high, you throw a stone straight up at $' + tv(v0) + '\\ \\text{m/s}$. It rises, then falls past the edge to the ground below. How long after the throw does it land? (Ignore air resistance.)',
      a: A(tl), unit: 's',
      steps: ['Up is positive and the origin is your hand at the edge, so the ground is at $\\Delta y = -' + hh + '\\ \\text{m}$.', '$\\Delta y = v_0 t + \\tfrac12 a t^2$: $-' + hh + ' = ' + tv(v0) + 't - 4.9t^2$, or $4.9t^2 - ' + tv(v0) + 't - ' + hh + ' = 0$.', 'Quadratic formula: $t = \\dfrac{' + tv(v0) + ' \\pm \\sqrt{' + tv(v0) + '^2 + 4(4.9)(' + hh + ')}}{2(4.9)}$.', 'Keep the positive root: $t = ' + qu(tl, 's') + '$. (The negative root is a time before the throw.)'],
      hint: 'Use Δy = v₀t + ½at² with Δy negative, then the quadratic formula.', d: { k: 'cliff', v0: v0, h: hh }
    };
  }));

  // ======================= 03-motion2d.js
  // ============================================================ Unit 2: Vectors and Motion in Two Dimensions

  // ---------- phys1.vector-components
  var VEC_CTX = [
    { name: 'force', sym: 'F', u: 'N', what: 'A rope pulls a sled with a force', lo: 20, hi: 90 },
    { name: 'velocity', sym: 'v', u: 'm/s', what: 'A soccer ball is kicked with a velocity', lo: 8, hi: 30 },
    { name: 'displacement', sym: 'd', u: 'm', what: 'A hiker\'s displacement is', lo: 50, hi: 900 },
    { name: 'force', sym: 'T', u: 'N', what: 'A cable pulls on a crate with a tension', lo: 100, hi: 800 }
  ];
  function compassDir(R) { // [text, angle from +x counterclockwise] for "θ north of east" style directions
    var th = R.int(15, 75), opts = [
      [th + '° north of east', th], [th + '° east of north', 90 - th], [th + '° north of west', 180 - th], [th + '° west of north', 90 + th],
      [th + '° south of west', 180 + th], [th + '° west of south', 270 - th], [th + '° south of east', 360 - th], [th + '° east of south', 270 + th]];
    var o = R.pick(opts); return { txt: o[0], ang: o[1], th: th };
  }
  G('phys1.vector-components', W(function (R, ctx) {
    var c = R.pick(VEC_CTX), mag = R.int(c.lo, c.hi), shape = by(ctx, 'std', R.pick(['std', 'vert', 'mag']), R.pick(['compass', 'compass', 'vert', 'mag'])), axis = R.pick(['x', 'y']);
    if (c.sym === 'd') mag = Math.round(mag / 10) * 10;
    var th = R.int(15, 75); if (th === 45) th = 40;
    var S = c.sym, fullv;
    if (shape === 'std' || shape === 'vert') {
      var fromV = shape === 'vert', ang = fromV ? 90 - th : th, comp = axis === 'x' ? mag * cosD(ang) : mag * sinD(ang);
      var useCos = (axis === 'x') !== fromV, trig = useCos ? '\\cos' : '\\sin';
      return {
        q: c.what + ' of $' + mag + '\\ \\text{' + c.u + '}$ at $' + th + '^\\circ$ ' + (fromV ? 'from the vertical ($+y$ axis), leaning toward $+x$' : 'above the horizontal ($+x$ axis)') + '. What is its ' + axis + '-component $' + S + '_' + axis + '$?',
        a: A(comp), unit: c.u,
        viz: { name: 'ph-vectors', opts: { mode: 'components', vecs: [{ mag: mag, ang: ang, label: S }], units: c.u, interactive: false, quiet: true, hide: ['angles'] } },
        steps: ['The angle is measured from the ' + (fromV ? '$y$' : '$x$') + ' axis, so the side next to the angle (adjacent) lies along ' + (fromV ? '$y$' : '$x$') + ' and the side across from it (opposite) lies along ' + (fromV ? '$x$' : '$y$') + '.', 'Adjacent uses cosine, opposite uses sine. The ' + axis + '-component is the ' + (useCos ? 'adjacent' : 'opposite') + ' side: $' + S + '_' + axis + ' = ' + S + trig + '\\theta$.', '$' + S + '_' + axis + ' = ' + mag + trig + ' ' + th + '^\\circ = ' + qu(comp, c.u) + '$.'],
        hint: 'Which axis is the angle measured from? The component along that axis uses cosine.',
        d: { k: 'comp', mag: mag, ang: ang, axis: axis }
      };
    }
    if (shape === 'mag') {
      var cx = R.int(3, 40) * (R.coin() ? 1 : -1), cy = R.int(3, 40), M0 = sqrt(cx * cx + cy * cy);
      return {
        q: 'A ' + c.name + ' vector has components $' + S + '_x = ' + cx + '\\ \\text{' + c.u + '}$ and $' + S + '_y = ' + cy + '\\ \\text{' + c.u + '}$. What is its magnitude?',
        a: A(M0), unit: c.u,
        viz: { name: 'ph-vectors', opts: { mode: 'components', vecs: [{ x: cx, y: cy, label: S }], units: c.u, interactive: false, quiet: true } },
        steps: ['The components are the legs of a right triangle and the vector is the hypotenuse.', '$' + S + ' = \\sqrt{' + S + '_x^2 + ' + S + '_y^2} = \\sqrt{' + T.p(cx) + '^2 + ' + cy + '^2} = ' + qu(M0, c.u) + '$.'],
        hint: 'Use the Pythagorean theorem.',
        d: { k: 'mag', cx: cx, cy: cy }
      };
    }
    var dir = compassDir(R), val = axis === 'x' ? mag * cosD(dir.ang) : mag * sinD(dir.ang);
    var ref = /of (east|west)/.test(dir.txt) ? 'x' : 'y', adj = axis === ref;
    return {
      q: c.what + ' of $' + mag + '\\ \\text{' + c.u + '}$ directed ' + dir.txt + '. Take east as $+x$ and north as $+y$. What is its ' + axis + '-component, with its sign?',
      a: A(val), unit: c.u,
      viz: { name: 'ph-vectors', opts: { mode: 'components', vecs: [{ mag: mag, ang: dir.ang, label: S }], units: c.u, interactive: false, quiet: true, hide: ['angles'] } },
      steps: ['"' + dir.txt + '" means start pointing ' + dir.txt.split(' of ')[1] + ' and turn ' + dir.th + '° toward ' + dir.txt.split(' ')[1] + '.', 'The angle is measured from the ' + ref + ' axis, so the ' + axis + '-component is the ' + (adj ? 'adjacent side: size $' + mag + '\\cos ' + dir.th + '^\\circ$' : 'opposite side: size $' + mag + '\\sin ' + dir.th + '^\\circ$') + ' $= ' + qu(abs(val), c.u) + '$.', 'Its sign: the vector points ' + (axis === 'x' ? (val > 0 ? 'east (+)' : 'west (−)') : (val > 0 ? 'north (+)' : 'south (−)')) + ', so $' + S + '_' + axis + ' = ' + qu(val, c.u) + '$.'],
      hint: 'Find the size with sine or cosine first, then decide the sign from the direction.',
      d: { k: 'comp', mag: mag, ang: dir.ang, axis: axis }
    };
  }));

  // ---------- phys1.vector-addition
  function dirOf(x, y) { var a = Math.atan2(y, x) / DEG; return a < 0 ? a + 360 : a; }
  G('phys1.vector-addition', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['perp', 'perp', 'mc']), R.pick(['perp-dir', 'gen', 'gen']), R.pick(['gen', 'gen-dir', 'three']));
    if (shape === 'mc') {
      var tri = R.pick([[3, 4], [6, 8], [5, 12], [8, 15], [9, 12]]), mm = sqrt(tri[0] * tri[0] + tri[1] * tri[1]);
      return {
        q: 'Two people pull on a box: one with $' + tri[0] + '\\ \\text{N}$ due east and one with $' + tri[1] + '\\ \\text{N}$ due north. What is the size of their combined pull?',
        a: MC('$' + mm + '\\ \\text{N}$', ['$' + (tri[0] + tri[1]) + '\\ \\text{N}$', '$' + (tri[1] - tri[0]) + '\\ \\text{N}$', '$' + tri[0] * tri[1] + '\\ \\text{N}$']),
        viz: { name: 'ph-vectors', opts: { mode: 'add', vecs: [{ x: tri[0], y: 0, label: 'A' }, { x: 0, y: tri[1], label: 'B' }], units: 'N', interactive: false, quiet: true } },
        steps: ['The pulls are at right angles, so they do not simply add: part of each one does not help the other.', 'Placed head to tail they form a right triangle. The combined pull is the hypotenuse.', '$\\sqrt{' + tri[0] + '^2 + ' + tri[1] + '^2} = \\sqrt{' + (tri[0] * tri[0] + tri[1] * tri[1]) + '} = ' + mm + '\\ \\text{N}$, not $' + (tri[0] + tri[1]) + '\\ \\text{N}$.'],
        hint: 'Draw the two pulls head to tail. What shape do they make?',
        d: { k: 'mc', ans: mm }
      };
    }
    if (shape === 'perp' || shape === 'perp-dir') {
      var e = R.int(2, 15) * (R.coin() ? 1 : -1), n = R.int(2, 15) * (R.coin() ? 1 : -1), Mg = sqrt(e * e + n * n), ad = dirOf(e, n), isDir = shape === 'perp-dir';
      var ew = (e > 0 ? 'east' : 'west'), ns = (n > 0 ? 'north' : 'south');
      return {
        q: 'A drone flies $' + abs(e) + '\\ \\text{m}$ ' + ew + ', then $' + abs(n) + '\\ \\text{m}$ ' + ns + '. ' + (isDir ? 'In what direction is its total displacement, measured counterclockwise from east ($+x$)? Give an angle between $0^\\circ$ and $360^\\circ$.' : 'What is the size of its total displacement?'),
        a: isDir ? { t: 'num', v: sv(ad, 3), tol: 1 } : A(Mg), unit: isDir ? '°' : 'm',
        viz: { name: 'ph-vectors', opts: { mode: 'add', vecs: [{ x: e, y: 0, label: 'A' }, { x: 0, y: n, label: 'B' }], units: 'm', interactive: false, quiet: true } },
        steps: ['Components of the total: $R_x = ' + e + '\\ \\text{m}$, $R_y = ' + n + '\\ \\text{m}$.'].concat(isDir ?
          ['Angle with the $x$ axis: $\\tan^{-1}\\left(\\dfrac{' + abs(n) + '}{' + abs(e) + '}\\right) = ' + tn(Math.atan(abs(n) / abs(e)) / DEG) + '^\\circ$.', 'The total points ' + ns + '-' + ew + ' (quadrant ' + (e > 0 ? (n > 0 ? 'I' : 'IV') : (n > 0 ? 'II' : 'III')) + '), so measured counterclockwise from east the direction is $' + tn(ad) + '^\\circ$.'] :
          ['Size: $R = \\sqrt{R_x^2 + R_y^2} = \\sqrt{' + T.p(e) + '^2 + ' + T.p(n) + '^2} = ' + qu(Mg, 'm') + '$.']),
        hint: isDir ? 'Use inverse tangent for the angle, then check which quadrant the vector is in.' : 'The two legs are at right angles: use the Pythagorean theorem.',
        d: { k: isDir ? 'dir' : 'mag', vx: [e, 0], vy: [0, n] }
      };
    }
    var nv = shape === 'three' ? 3 : 2, vecs = [], rx = 0, ry = 0, i;
    for (i = 0; i < nv; i++) { var mg = R.int(2, 12) * 5, an = R.int(0, 35) * 10; vecs.push({ mag: mg, ang: an }); rx += mg * cosD(an); ry += mg * sinD(an); }
    var RM = sqrt(rx * rx + ry * ry), RD = dirOf(rx, ry), askDir = shape === 'gen-dir' || (shape === 'three' && R.coin());
    if (RM < 5) { vecs[0].ang = (vecs[0].ang + 180) % 360; rx = 0; ry = 0; vecs.forEach(function (v) { rx += v.mag * cosD(v.ang); ry += v.mag * sinD(v.ang); }); RM = sqrt(rx * rx + ry * ry); RD = dirOf(rx, ry); }
    var L = ['A', 'B', 'C'];
    return {
      q: 'Add the force vectors ' + vecs.map(function (v, j) { return '$\\vec{' + L[j] + '}$: $' + v.mag + '\\ \\text{N}$ at $' + v.ang + '^\\circ$'; }).join(', ') + ' (angles counterclockwise from $+x$). What is the ' + (askDir ? 'direction of the resultant, counterclockwise from $+x$ (between $0^\\circ$ and $360^\\circ$)?' : 'magnitude of the resultant?'),
      a: askDir ? { t: 'num', v: sv(RD, 3), tol: 1 } : A(RM), unit: askDir ? '°' : 'N',
      viz: { name: 'ph-vectors', opts: { mode: 'add', vecs: vecs.map(function (v, j) { return { mag: v.mag, ang: v.ang, label: L[j] }; }), units: 'N', interactive: false, quiet: true } },
      steps: vecs.map(function (v, j) { return '$\\vec{' + L[j] + '}$: $x = ' + v.mag + '\\cos ' + v.ang + '^\\circ = ' + tn(v.mag * cosD(v.ang)) + '$, $y = ' + v.mag + '\\sin ' + v.ang + '^\\circ = ' + tn(v.mag * sinD(v.ang)) + '$.'; }).concat([
        'Add the parts: $R_x = ' + tn(rx) + '\\ \\text{N}$, $R_y = ' + tn(ry) + '\\ \\text{N}$.',
        askDir ? '$\\tan^{-1}\\left|\\dfrac{R_y}{R_x}\\right| = ' + tn(Math.atan(abs(ry / rx)) / DEG) + '^\\circ$; the resultant is in quadrant ' + (rx >= 0 ? (ry >= 0 ? 'I' : 'IV') : (ry >= 0 ? 'II' : 'III')) + ', so its direction is $' + tn(RD) + '^\\circ$.' : '$R = \\sqrt{R_x^2 + R_y^2} = ' + qu(RM, 'N') + '$. Adding the magnitudes would give $' + vecs.reduce(function (s, v) { return s + v.mag; }, 0) + '\\ \\text{N}$, which is wrong unless the vectors point the same way.']),
      hint: 'Split every vector into x- and y-parts, add the parts, then rebuild the resultant.',
      d: { k: askDir ? 'dirgen' : 'maggen', vecs: vecs }
    };
  }));

  // ---------- phys1.relative-velocity
  G('phys1.relative-velocity', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['line', 'across']), R.pick(['line', 'across', 'across', 'mc']), R.pick(['upstream', 'upstream', 'across', 'wind']));
    if (shape === 'line') {
      var w = R.pick([1, 1.2, 1.5, 2]), m = R.pick([0.5, 0.8, 1, 1.5]), same = R.coin();
      if (!same && m >= w) m = fx(w / 2);
      var vg = same ? w + m : w - m;
      return {
        q: 'At an airport you walk at $' + tv(w) + '\\ \\text{m/s}$ relative to a moving walkway, which moves at $' + tv(m) + '\\ \\text{m/s}$ relative to the floor. You walk ' + (same ? 'in the same direction as' : 'against') + ' the walkway. How fast do you move relative to the floor?',
        a: A(vg), unit: 'm/s',
        steps: ['Velocities add: $\\vec{v}_{\\text{you, floor}} = \\vec{v}_{\\text{you, walkway}} + \\vec{v}_{\\text{walkway, floor}}$.', 'Along one line, with your walking direction as $+$: $' + tv(w) + ' + ' + T.p(same ? m : -m) + ' = ' + qu(vg, 'm/s') + '$.'],
        hint: 'Add the two velocities, giving the walkway\'s a minus sign if it moves against you.',
        d: { k: 'line', vg: vg, w: w, m: same ? m : -m }
      };
    }
    if (shape === 'wind') {
      var va = R.int(18, 26) * 10, vw = R.int(2, 8) * 10, head = R.coin(), D = R.int(4, 12) * 100, gs = head ? va - vw : va + vw;
      return {
        q: 'A plane flies at $' + va + '\\ \\text{km/h}$ relative to the air, straight into a ' + (head ? 'head' : 'tail') + 'wind of $' + vw + '\\ \\text{km/h}$. How long does it take to fly $' + D + '\\ \\text{km}$ over the ground?',
        a: A(D / gs), unit: 'h',
        steps: ['Ground speed $= ' + va + (head ? ' - ' : ' + ') + vw + ' = ' + gs + '\\ \\text{km/h}$ (a ' + (head ? 'headwind slows' : 'tailwind speeds up') + ' the plane over the ground).', 'Time $= \\dfrac{' + tv(D) + '\\ \\text{km}}{' + gs + '\\ \\text{km/h}} ' + eqa(D / gs) + '\\ \\text{h}$.'],
        hint: 'Find the speed relative to the ground first.',
        d: { k: 'wind', va: va, vw: head ? -vw : vw, D: D }
      };
    }
    var vb = R.pick([2, 2.5, 3, 4, 5]), vr = R.pick([1, 1.5, 2, 2.5, 3]), wd = R.int(4, 12) * 10;
    if (shape !== 'upstream' && vr >= vb) vr = vb - 1;
    if (shape === 'upstream' && vr >= vb) vr = fx(vb / 2);
    var vizR = { name: 'ph-vectors', opts: { mode: 'relative', relative: { vMedium: vr, vObject: vb, heading: 0, width: wd }, interactive: false, quiet: true } };
    if (shape === 'mc') return {
      q: 'A boat crosses a river, always pointing straight across. If the current gets faster, how does the time to cross change?',
      a: MC('It stays the same.', ['It gets longer.', 'It gets shorter.', 'The boat can no longer cross.']),
      viz: vizR,
      steps: ['The crossing time depends only on the part of the boat\'s velocity that points across the river.', 'Pointing straight across, that part is the boat\'s own speed relative to the water. The current is at right angles to it.', 'A faster current carries the boat farther downstream, but the crossing time stays the same.'],
      hint: 'Which part of the boat\'s velocity gets it to the other bank?', d: { k: 'mc' }
    };
    if (shape === 'across') {
      var ask = R.pick(['time', 'drift', 'speed']), tc = wd / vb, dr = vr * tc, sp = sqrt(vb * vb + vr * vr);
      return {
        q: 'A river is $' + wd + '\\ \\text{m}$ wide and flows at $' + tv(vr) + '\\ \\text{m/s}$. A boat that moves at $' + tv(vb) + '\\ \\text{m/s}$ relative to the water points straight across. ' + { time: 'How long does it take to cross?', drift: 'How far downstream does it land?', speed: 'How fast does it move relative to the shore?' }[ask],
        a: A({ time: tc, drift: dr, speed: sp }[ask]), unit: { time: 's', drift: 'm', speed: 'm/s' }[ask],
        viz: vizR,
        steps: ['Across: only the boat\'s own $' + tv(vb) + '\\ \\text{m/s}$ moves it across, so $t = \\dfrac{' + wd + '}{' + tv(vb) + '} ' + eqa(tc) + '\\ \\text{s}$. The current does not change this.'].concat(ask === 'drift' ? ['Downstream: the current carries it $' + tv(vr) + ' \\times ' + tn(tc, 4) + ' = ' + qu(dr, 'm') + '$.'] : ask === 'speed' ? ['Relative to the shore the two velocities are at right angles: $\\sqrt{' + tv(vb) + '^2 + ' + tv(vr) + '^2} = ' + qu(sp, 'm/s') + '$, not $' + tv(vb + vr) + '\\ \\text{m/s}$.'] : []),
        hint: ask === 'speed' ? 'The two velocities are at right angles: add them as vectors.' : 'Treat the across motion and the downstream motion separately; they share the same time.',
        d: { k: 'across', vb: vb, vr: vr, w: wd, ask: ask }
      };
    }
    var th = Math.asin(vr / vb) / DEG, askA = R.coin(), tcr = wd / (vb * cosD(th));
    return {
      q: 'A river is $' + wd + '\\ \\text{m}$ wide and flows at $' + tv(vr) + '\\ \\text{m/s}$. A boat moves at $' + tv(vb) + '\\ \\text{m/s}$ relative to the water. To land directly across from where it starts, the boat must point partly upstream. ' + (askA ? 'At what angle from straight across must it point?' : 'How long does the crossing take?'),
      a: askA ? { t: 'num', v: sv(th, 3), tol: 0.5, rtol: 0.02 } : A(tcr), unit: askA ? '°' : 's',
      viz: { name: 'ph-vectors', opts: { mode: 'relative', relative: { vMedium: vr, vObject: vb, heading: sg(th, 3), width: wd }, interactive: false, quiet: true } },
      steps: ['To go straight across, the upstream part of the boat\'s velocity must cancel the current: $v_b \\sin\\theta = v_r$.', '$\\sin\\theta = \\dfrac{' + tv(vr) + '}{' + tv(vb) + '}$, so $\\theta = ' + tn(th) + '^\\circ$ from straight across.'].concat(askA ? [] : ['The part that crosses is $v_b\\cos\\theta = ' + tn(vb * cosD(th)) + '\\ \\text{m/s}$, so $t = \\dfrac{' + wd + '}{' + tn(vb * cosD(th), 4) + '} = ' + qu(tcr, 's') + '$, longer than pointing straight across.']),
      hint: 'The upstream part of the boat\'s velocity must equal the current.',
      d: { k: 'upstream', vb: vb, vr: vr, w: wd, ask: askA ? 'angle' : 'time' }
    };
  }));

  // ---------- phys1.projectile-horizontal
  G('phys1.projectile-horizontal', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['time', 'range']), R.pick(['range', 'speed0', 'mc', 'time']), R.pick(['impact', 'speed0', 'range']));
    var h = by(ctx, R.pick([1.225, 4.9, 11.025, 19.6, 44.1]), R.pick([R.int(1, 30), R.pick([0.8, 1.2, 1.5, 2.5])]), R.int(2, 60)), v = R.int(2, 25), t = sqrt(2 * h / g);
    var what = h <= 2.5 ? R.pick([['A ball rolls off a table', 'table'], ['A marble rolls off a shelf', 'shelf'], ['A toy car rolls off a desk', 'desk']]) : R.pick([['A stone is thrown horizontally from a cliff', 'cliff'], ['A package slides off a flat roof', 'building'], ['A ball is thrown horizontally from a bridge', 'bridge']]);
    var viz = { name: 'ph-projectile', opts: { v0: v, angle: 0, h: h, interactive: false, quiet: true } };
    if (shape === 'time') return {
      q: what[0] + ' at $' + v + '\\ \\text{m/s}$ from a height of $' + tv(h) + '\\ \\text{m}$. How long is it in the air? (Ignore air resistance.)',
      a: A(t), unit: 's', viz: viz,
      steps: ['Vertically it starts with zero velocity, exactly like a dropped ball. The horizontal speed does not matter for the time.', '$h = \\tfrac12 g t^2$, so $t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2(' + tv(h) + ')}{9.8}} = ' + qu(t, 's') + '$.'],
      hint: 'The time to fall depends only on the height.', d: { k: 'time', h: h, v: v }
    };
    if (shape === 'range') return {
      q: what[0] + ' at $' + v + '\\ \\text{m/s}$ from a height of $' + tv(h) + '\\ \\text{m}$. How far from the base of the ' + what[1] + ' does it land? (Ignore air resistance.)',
      a: A(v * t), unit: 'm', viz: viz,
      steps: ['Time from the vertical motion: $t = \\sqrt{\\dfrac{2h}{g}} = ' + qu(t, 's', 4) + '$.', 'Horizontally nothing pushes it, so $v_x$ stays $' + v + '\\ \\text{m/s}$: $x = v_x t = ' + v + ' \\times ' + tn(t, 4) + ' = ' + qu(v * t, 'm') + '$.'],
      hint: 'Find the fall time from the height, then multiply by the horizontal speed.', d: { k: 'range', h: h, v: v }
    };
    if (shape === 'speed0') {
      var x = fx(sg(v * t, 2)), need = x / t;
      return {
        q: 'A ball is launched horizontally from a height of $' + tv(h) + '\\ \\text{m}$ and must land $' + tv(x) + '\\ \\text{m}$ away (measured along the ground). What launch speed does it need? (Ignore air resistance.)',
        a: A(need), unit: 'm/s', viz: { name: 'ph-projectile', opts: { v0: sg(need, 3), angle: 0, h: h, targetX: x, interactive: false, quiet: true } },
        steps: ['Fall time: $t = \\sqrt{\\dfrac{2(' + tv(h) + ')}{9.8}} = ' + qu(t, 's', 4) + '$.', 'It must cover $' + tv(x) + '\\ \\text{m}$ in that time: $v_x = \\dfrac{' + tv(x) + '}{' + tn(t, 4) + '} = ' + qu(need, 'm/s') + '$.'],
        hint: 'The fall time is fixed by the height. What speed covers the distance in that time?', d: { k: 'speed0', h: h, x: x }
      };
    }
    if (shape === 'mc') return {
      q: 'From the same height, ball A is dropped from rest at the same moment ball B is launched horizontally at $' + v + '\\ \\text{m/s}$. Ignoring air resistance, which reaches the level ground first?',
      a: MC('They land at the same time.', ['Ball A (dropped) lands first.', 'Ball B (launched) lands first.', 'It depends on the masses of the balls.']),
      viz: { name: 'ph-projectile', opts: { v0: v, angle: 0, h: h, interactive: false, quiet: true, show: ['ghost', 'strobe'] } },
      steps: ['Both balls start with zero vertical velocity, and both have the same downward acceleration $g$.', 'Horizontal motion does not change vertical motion: ball B moves sideways while falling exactly like ball A.', 'Same height, same vertical start, same acceleration: they land together.'],
      hint: 'Compare only the vertical motions.', d: { k: 'mc' }
    };
    var vy = g * t, vi = sqrt(v * v + vy * vy);
    return {
      q: what[0] + ' at $' + v + '\\ \\text{m/s}$ from a height of $' + tv(h) + '\\ \\text{m}$. How fast is it moving just before it lands? (Ignore air resistance.)',
      a: A(vi), unit: 'm/s', viz: viz,
      steps: ['Horizontal part stays $v_x = ' + v + '\\ \\text{m/s}$.', 'Vertical part at landing: $v_y = \\sqrt{2gh} = \\sqrt{2(9.8)(' + tv(h) + ')} = ' + tn(vy, 4) + '\\ \\text{m/s}$ downward.', 'Speed: $\\sqrt{v_x^2 + v_y^2} = \\sqrt{' + v + '^2 + ' + tn(vy, 4) + '^2} = ' + qu(vi, 'm/s') + '$.'],
      hint: 'Find the horizontal and vertical parts of the final velocity, then combine them.', d: { k: 'impact', h: h, v: v }
    };
  }));

  // ---------- phys1.projectile-angled
  G('phys1.projectile-angled', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['comp-t', 'comp-h', 'comp-r']), R.pick(['flight', 'hmax', 'range', 'top', 'vtop']), R.pick(['height', 'height', 'twin', 'range', 'vtop']));
    if (shape.indexOf('comp') === 0) {
      var vx = R.int(4, 20), vy = R.pick([4.9, 9.8, 14.7, 19.6]), tf = 2 * vy / g, H = vy * vy / (2 * g), Rg = vx * tf, ask = shape.slice(5);
      return {
        q: 'A ball leaves level ground with velocity components $v_{0x} = ' + vx + '\\ \\text{m/s}$ and $v_{0y} = ' + tv(vy) + '\\ \\text{m/s}$ (up). Ignoring air resistance, ' + { t: 'how long is it in the air?', h: 'how high does it rise?', r: 'how far away does it land?' }[ask],
        a: A({ t: tf, h: H, r: Rg }[ask]), unit: ask === 't' ? 's' : 'm',
        viz: { name: 'ph-projectile', opts: { v0: sg(sqrt(vx * vx + vy * vy), 4), angle: sg(Math.atan2(vy, vx) / DEG, 4), interactive: false, quiet: true } },
        steps: ['Vertical motion alone: $v_y$ drops by $9.8\\ \\text{m/s}$ each second, reaching zero at the top after $t_{top} = \\dfrac{' + tv(vy) + '}{9.8} = ' + tv(vy / g) + '\\ \\text{s}$.'].concat(
          ask === 't' ? ['Up and back down to the same level takes twice as long: $t = ' + qu(tf, 's') + '$.'] :
          ask === 'h' ? ['Height: $H = \\dfrac{v_{0y}^2}{2g} = \\dfrac{' + tv(vy) + '^2}{19.6} = ' + qu(H, 'm') + '$.'] :
          ['Flight time $= 2t_{top} = ' + tv(tf) + '\\ \\text{s}$.', 'Horizontally the speed stays $' + vx + '\\ \\text{m/s}$: range $= ' + vx + ' \\times ' + tv(tf) + ' = ' + qu(Rg, 'm') + '$.']),
        hint: 'Treat the vertical motion like a ball thrown straight up; the horizontal speed never changes.',
        d: { k: ask, vx: vx, vy: vy }
      };
    }
    var v0 = R.int(10, 30), th = R.pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]), vx0 = v0 * cosD(th), vy0 = v0 * sinD(th);
    var compSteps = ['Components: $v_{0x} = ' + v0 + '\\cos ' + th + '^\\circ = ' + tn(vx0, 4) + '\\ \\text{m/s}$ and $v_{0y} = ' + v0 + '\\sin ' + th + '^\\circ = ' + tn(vy0, 4) + '\\ \\text{m/s}$.'];
    var viz = { name: 'ph-projectile', opts: { v0: v0, angle: th, interactive: false, quiet: true } };
    if (shape === 'top') return {
      q: 'A ball is kicked at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. Ignoring air resistance, what is its velocity at the highest point of its path?',
      a: MC('$' + tn(vx0) + '\\ \\text{m/s}$, horizontal', ['zero', '$' + tn(vy0) + '\\ \\text{m/s}$, horizontal', '$' + v0 + '\\ \\text{m/s}$, horizontal']),
      viz: viz,
      steps: compSteps.concat(['At the top the vertical part is zero for an instant, but the horizontal part never changed.', 'So the velocity at the top is $v_{0x} = ' + tn(vx0) + '\\ \\text{m/s}$, pointing horizontally. It is not zero.']),
      hint: 'Which part of the velocity becomes zero at the top, and which part stays the same?', d: { k: 'top', v0: v0, th: th }
    };
    var tf2 = 2 * vy0 / g;
    if (shape === 'vtop') return {
      q: 'A ball is kicked at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. Ignoring air resistance, what is its speed at the top of its path?',
      a: A(vx0), unit: 'm/s', viz: viz,
      steps: compSteps.concat(['At the top $v_y = 0$, and $v_x$ is unchanged, so the speed is $v_{0x} = ' + qu(vx0, 'm/s') + '$.']),
      hint: 'At the top only the vertical part of the velocity is zero.', d: { k: 'vtop', v0: v0, th: th }
    };
    if (shape === 'flight') return {
      q: 'A ball is kicked at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. Ignoring air resistance, how long is it in the air?',
      a: A(tf2), unit: 's', viz: viz,
      steps: compSteps.concat(['Up to the top: $t_{top} = \\dfrac{v_{0y}}{g} = ' + tn(vy0 / g, 4) + '\\ \\text{s}$. Back down to the same level takes as long.', '$t = 2t_{top} = ' + qu(tf2, 's') + '$.']),
      hint: 'Only the vertical part decides the time in the air.', d: { k: 'flight', v0: v0, th: th }
    };
    if (shape === 'hmax') return {
      q: 'A ball is kicked at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. Ignoring air resistance, what is its maximum height?',
      a: A(vy0 * vy0 / (2 * g)), unit: 'm', viz: viz,
      steps: compSteps.concat(['At the top $v_y = 0$: $H = \\dfrac{v_{0y}^2}{2g} = \\dfrac{' + tn(vy0, 4) + '^2}{19.6} = ' + qu(vy0 * vy0 / (2 * g), 'm') + '$.']),
      hint: 'Use only the vertical part of the launch velocity.', d: { k: 'hmax', v0: v0, th: th }
    };
    if (shape === 'range') return {
      q: 'A ball is kicked at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. Ignoring air resistance, how far away does it land?',
      a: A(vx0 * tf2), unit: 'm', viz: viz,
      steps: compSteps.concat(['Time in the air: $t = \\dfrac{2v_{0y}}{g} = ' + tn(tf2, 4) + '\\ \\text{s}$.', 'Range: $v_{0x}t = ' + tn(vx0, 4) + ' \\times ' + tn(tf2, 4) + ' = ' + qu(vx0 * tf2, 'm') + '$.']),
      hint: 'Find the time in the air from the vertical motion, then use the horizontal speed.', d: { k: 'range', v0: v0, th: th }
    };
    if (shape === 'twin') return {
      q: 'On level ground with no air resistance, a ball launched at $' + v0 + '\\ \\text{m/s}$ and $' + th + '^\\circ$ lands a certain distance away. At what other launch angle (same speed) would it land at the same distance?',
      a: { t: 'num', v: String(90 - th), tol: 0.5 }, unit: '°',
      viz: { name: 'ph-projectile', opts: { v0: v0, angle: th, interactive: false, quiet: true, show: ['twin'] } },
      steps: ['Range $= v_{0x} \\cdot t = (v_0\\cos\\theta)\\left(\\dfrac{2v_0\\sin\\theta}{g}\\right) = \\dfrac{2v_0^2\\sin\\theta\\cos\\theta}{g}$.', 'Swapping $\\theta$ for $90^\\circ - \\theta$ swaps $\\sin$ and $\\cos$, and their product stays the same.', 'So $90^\\circ - ' + th + '^\\circ = ' + (90 - th) + '^\\circ$ gives the same range: a higher, slower-moving path that stays up longer.'],
      hint: 'Write the range using sin θ and cos θ. What angle swaps them?', d: { k: 'twin', th: th }
    };
    // height: launched from h above the landing ground
    var hh = R.int(5, 30), ttot = (vy0 + sqrt(vy0 * vy0 + 2 * g * hh)) / g, askX = R.coin();
    return {
      q: 'From the top of a wall $' + hh + '\\ \\text{m}$ high, a ball is thrown at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above the horizontal. It lands on the level ground below. ' + (askX ? 'How far from the base of the wall does it land?' : 'How long is it in the air?') + ' (Ignore air resistance.)',
      a: A(askX ? vx0 * ttot : ttot), unit: askX ? 'm' : 's',
      viz: { name: 'ph-projectile', opts: { v0: v0, angle: th, h: hh, interactive: false, quiet: true } },
      steps: compSteps.concat(['Up is positive with the origin at the launch point, so the ground is at $\\Delta y = -' + hh + '\\ \\text{m}$: $-' + hh + ' = ' + tn(vy0, 4) + 't - 4.9t^2$.', 'Quadratic formula, positive root: $t = \\dfrac{' + tn(vy0, 4) + ' + \\sqrt{' + tn(vy0, 4) + '^2 + 4(4.9)(' + hh + ')}}{9.8} = ' + qu(ttot, 's') + '$.']).concat(askX ? ['Horizontal distance: $' + tn(vx0, 4) + ' \\times ' + tn(ttot, 4) + ' = ' + qu(vx0 * ttot, 'm') + '$.'] : []),
      hint: 'The time comes from the vertical motion: Δy = v₀ᵧt − ½gt² with Δy negative.', d: { k: askX ? 'hx' : 'ht', v0: v0, th: th, h: hh }
    };
  }));

  // ======================= 04-forces.js
  // ============================================================ Unit 3: Forces and Newton's Laws

  // ---------- phys1.systems-center-of-mass
  G('phys1.systems-center-of-mass', W(function (R, ctx) {
    var shape = by(ctx, 'two', R.pick(['two', 'three', 'place', 'sys']), R.pick(['three', 'place', 'sys']));
    if (shape === 'sys') {
      var S = R.pick([
        { q: 'Two carts are joined by a spring. You choose the system to be both carts and the spring. Which force is <b>external</b> to this system?', a: 'Earth\'s gravitational pull on cart A', w: ['The spring\'s push on cart A', 'Cart B\'s pull on the spring', 'The spring\'s push on cart B'] },
        { q: 'A parent pushes a stroller holding a baby. You choose the system to be the stroller and the baby. Which force is <b>external</b> to this system?', a: 'The parent\'s push on the stroller', w: ['The seat\'s push on the baby', 'The baby\'s push on the seat', 'The stroller frame\'s pull on its wheels'] },
        { q: 'A tow truck pulls a car with a chain. You choose the system to be the truck, the chain and the car. Which force is <b>internal</b> to this system?', a: 'The chain\'s pull on the car', w: ['The road\'s friction on the truck\'s tires', 'Earth\'s gravitational pull on the car', 'Air drag on the truck'] },
        { q: 'Two skaters hold hands and spin. You choose the system to be both skaters. Which forces can change the motion of the system\'s center of mass?', a: 'Only forces from outside the system, such as the ice and gravity', w: ['Only the skaters\' pulls on each other', 'Any force at all, inside or outside', 'No force can change it'] }
      ]);
      return {
        q: S.q, a: MC(S.a, S.w),
        steps: ['An internal force is exerted by one part of the system on another part. An external force comes from something outside the system.', 'Internal forces come in third-law pairs inside the system, so they cancel when you add up the forces on the whole system. Only external forces can change the motion of its center of mass.', 'Here the answer is: ' + S.a.charAt(0).toLowerCase() + S.a.slice(1) + '.'],
        hint: 'Ask of each force: is the object exerting it inside or outside the system?', d: { k: 'sys' }
      };
    }
    var n = shape === 'three' ? 3 : 2, ms = [], xs = [], i;
    for (i = 0; i < n; i++) { ms.push(R.int(1, 12)); xs.push(i === 0 ? 0 : xs[i - 1] + R.int(1, 6) * (n === 2 ? 1 : 0.5)); }
    if (n === 2 && ms[0] === ms[1]) ms[1] += R.int(1, 4);
    var M = ms.reduce(function (a, b) { return a + b; }, 0), num = 0; for (i = 0; i < n; i++) num += ms[i] * xs[i];
    var xc = num / M;
    if (shape === 'place') {
      var m1 = R.int(2, 10), m2 = R.int(2, 10), xcm = R.int(2, 12) * 0.25, x2 = xcm * (m1 + m2) / m2;
      return {
        q: art(m1, 'A') + ' $' + m1 + '\\ \\text{kg}$ block sits at $x = 0$. Where must you place ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ block so that the center of mass of the pair is at $x = ' + tn(xcm, 3) + '\\ \\text{m}$?',
        a: A(x2), unit: 'm',
        steps: ['$x_{cm} = \\dfrac{m_1x_1 + m_2x_2}{m_1 + m_2}$ with $x_1 = 0$.', '$' + tn(xcm, 4) + ' = \\dfrac{' + m2 + 'x_2}{' + (m1 + m2) + '}$, so $x_2 = \\dfrac{' + tn(xcm, 4) + ' \\times ' + (m1 + m2) + '}{' + m2 + '} = ' + qu(x2, 'm') + '$.'],
        hint: 'Write the center-of-mass formula and solve for the unknown position.', d: { k: 'place', m1: m1, m2: m2, xcm: xcm }
      };
    }
    var objs = n === 2 ? R.pick([['A child', 'a parent', 'sit on a seesaw plank'], ['A small cart', 'a big cart', 'sit on a track'], ['A bowling ball', 'a tennis ball', 'rest on a shelf']]) : null;
    return {
      q: (n === 2 ? 'Two objects lie along the $x$ axis: ' : 'Three blocks lie along the $x$ axis: ') + ms.map(function (m, j) { return '$' + m + '\\ \\text{kg}$ at $x = ' + tv(xs[j]) + '\\ \\text{m}$'; }).join(', ') + '. Where is their center of mass?',
      a: A(xc), unit: 'm',
      steps: ['The center of mass is the mass-weighted average position: $x_{cm} = \\dfrac{\\sum m x}{\\sum m}$.', 'Top: $' + ms.map(function (m, j) { return '(' + m + ')(' + tv(xs[j]) + ')'; }).join(' + ') + ' = ' + tv(num) + '\\ \\text{kg}\\cdot\\text{m}$. Bottom: $' + M + '\\ \\text{kg}$.', '$x_{cm} = \\dfrac{' + tv(num) + '}{' + M + '} = ' + qu(xc, 'm') + '$. It sits closer to the heavier mass' + (n === 2 ? ', not halfway at $' + tv(xs[1] / 2) + '\\ \\text{m}$.' : '.')],
      hint: 'Multiply each mass by its position, add, and divide by the total mass.', d: { k: 'cm', ms: ms, xs: xs }
    };
  }));

  // ---------- phys1.free-body-diagrams
  var FBD_CASES = [
    { s: 'A box sits at rest on a level floor.', scene: 'block', right: [['gravity', 50], ['normal', 50]], wrong: [[['gravity', 50]], [['gravity', 50], ['normal', 50], ['motion', 25]], [['normal', 50], ['applied', 25]]], n: 2, why: 'Earth pulls it down and the floor pushes up. Nothing else touches it.' },
    { s: 'You push a box across a rough floor at a steady speed.', scene: 'block', right: [['gravity', 50], ['normal', 50], ['applied', 30], ['friction', 30]], wrong: [[['gravity', 50], ['normal', 50], ['applied', 30], ['motion', 30]], [['gravity', 50], ['normal', 50], ['applied', 30], ['friction', 30, 0]], [['gravity', 50], ['normal', 50], ['applied', 30]]], n: 4, why: 'Gravity (by Earth), the normal force and friction (by the floor) and your push. Friction points against the sliding, and at steady speed it balances the push.' },
    { s: 'A box slides to the right across a rough floor after you let go of it.', scene: 'block', right: [['gravity', 50], ['normal', 50], ['friction', 20]], wrong: [[['gravity', 50], ['normal', 50], ['motion', 20]], [['gravity', 50], ['normal', 50], ['friction', 20], ['applied', 20]], [['gravity', 50], ['normal', 50], ['friction', 20, 0]]], n: 3, why: 'Gravity, the normal force and friction pointing left, against the sliding. Your hand no longer touches it, so there is no push.' },
    { s: 'A lamp hangs at rest from a cord.', scene: 'hanging', right: [['gravity', 40], ['tension', 40]], wrong: [[['gravity', 40]], [['gravity', 40], ['tension', 40], ['normal', 20]], [['tension', 40]]], n: 2, why: 'Earth pulls it down and the cord pulls it up. Nothing else touches it.' },
    { s: 'A ball flies through the air after being thrown up and to the right (ignore air resistance).', scene: 'ball-air', right: [['gravity', 30]], wrong: [[['gravity', 30], ['motion', 30, 60]], [['gravity', 30], ['applied', 30, 60]], [['gravity', 30], ['applied', 20, 0]]], n: 1, why: 'Only gravity. The throw ended when the ball left your hand; nothing pushes it forward in flight.' },
    { s: 'A car drives along a level road at a steady speed, with air drag acting on it.', scene: 'car', right: [['gravity', 60], ['normal', 60], ['friction', 25, 0], ['drag', 25]], wrong: [[['gravity', 60], ['normal', 60], ['motion', 25, 0], ['drag', 25]], [['gravity', 60], ['normal', 60], ['friction', 25, 0]], [['gravity', 60], ['normal', 60], ['friction', 25, 180], ['drag', 25]]], n: 4, why: 'Gravity, the normal force, air drag backward and the road\'s friction on the drive tires pointing forward. At steady speed the forward and backward forces balance.' }
  ];
  FBD_CASES.push(
    { s: 'A crate is pulled at a steady speed across a rough floor by a horizontal rope.', scene: 'block', right: [['gravity', 50], ['normal', 50], ['tension', 30, 0], ['friction', 30]], wrong: [[['gravity', 50], ['normal', 50], ['tension', 30, 0]], [['gravity', 50], ['normal', 50], ['tension', 30, 0], ['friction', 30, 0]], [['gravity', 50], ['normal', 50], ['tension', 30, 0], ['friction', 30], ['motion', 30]]], n: 4, why: 'Gravity (by Earth), the normal force and friction (by the floor), and the rope\'s pull. Friction points against the sliding and balances the pull at steady speed.' },
    { s: 'You push gently on a heavy box resting on the floor, but it does not move.', scene: 'block', right: [['gravity', 50], ['normal', 50], ['applied', 20], ['friction', 20]], wrong: [[['gravity', 50], ['normal', 50], ['applied', 20]], [['gravity', 50], ['normal', 50]], [['gravity', 50], ['normal', 50], ['applied', 20], ['friction', 20, 0]]], n: 4, why: 'Gravity, the normal force, your push, and static friction from the floor, which points against your push and balances it.' },
    { s: 'A box rests on a ramp without sliding.', scene: 'incline', right: [['gravity', 50], ['normal', 43], ['friction', 25]], wrong: [[['gravity', 50], ['normal', 43]], [['gravity', 50], ['friction', 25]], [['gravity', 50], ['normal', 43], ['friction', 25], ['motion', 25]]], n: 3, why: 'Gravity, the ramp\'s normal force (perpendicular to its surface) and static friction up the slope, which keeps the box from sliding.' },
    { s: 'A person stands still on a level floor.', scene: 'person', right: [['gravity', 50], ['normal', 50]], wrong: [[['gravity', 50]], [['normal', 50]], [['gravity', 50], ['normal', 50], ['applied', 25]]], n: 2, why: 'Earth pulls the person down and the floor pushes up. Nothing else touches the person.' }
  );
  function fbdForces(list) { return list.map(function (f) { var o = { type: f[0], mag: f[1] }; if (f[2] !== undefined) o.angle = f[2]; return o; }); }
  G('phys1.free-body-diagrams', W(function (R, ctx) {
    var C = R.pick(FBD_CASES), shape = by(ctx, R.pick(['pick', 'count']), R.pick(['pick', 'count', 'not']), R.pick(['pick', 'not']));
    if (shape === 'count') return {
      q: C.s + ' How many forces act on it?',
      a: { t: 'num', v: String(C.n), form: 'int' },
      viz: { name: 'ph-fbd', opts: { scene: C.scene, forces: [], interactive: false, quiet: true } },
      steps: ['List only forces exerted <i>on</i> the object, each by something you can name.', C.why, 'That makes ' + C.n + '.'],
      hint: 'For each force, name the object that exerts it. Things touching it, plus Earth\'s gravity.', d: { k: 'count', n: C.n }
    };
    if (shape === 'not') {
      var NOT = R.pick([
        { q: 'A ball flies through the air after leaving a pitcher\'s hand. Which of these is <b>not</b> a force on the ball?', a: 'The force of the throw, carrying it forward', w: ['Earth\'s gravitational pull', 'Air drag', 'All three of the others are forces on the ball'] },
        { q: 'A crate is pulled across a floor by a rope. Which of these is <b>not</b> a force on the crate?', a: 'The crate\'s pull back on the rope', w: ['The rope\'s pull on the crate', 'Friction from the floor', 'Earth\'s gravitational pull'] },
        { q: 'A lamp hangs at rest from a cord. Which of these is <b>not</b> a force on the lamp?', a: 'The lamp\'s pull down on the cord', w: ['Earth\'s gravitational pull on the lamp', 'The cord\'s pull up on the lamp', 'None of these: all of them act on the lamp'] },
        { q: 'A soccer ball rolls across the grass and slows down. Which of these is <b>not</b> a force on the ball?', a: 'A forward force of motion left over from the kick', w: ['Earth\'s gravitational pull', 'The ground\'s push up on the ball', 'Friction and drag slowing it'] },
        { q: 'A book rests on a table. Which of these is <b>not</b> a force on the book?', a: 'The book\'s push down on the table', w: ['Earth\'s gravitational pull on the book', 'The table\'s push up on the book', 'None: all of them act on the book'] },
        { q: 'A hockey puck glides across smooth ice after being hit. Which of these is <b>not</b> a force on the puck?', a: 'A forward force from the hit that keeps it going', w: ['Earth\'s gravitational pull', 'The ice\'s upward normal force', 'A small friction force from the ice'] }
      ]);
      return {
        q: NOT.q, a: MC(NOT.a, NOT.w),
        steps: ['A force on an object is a push or pull <i>by</i> another object <i>on</i> it, happening now.', 'Moving objects keep moving on their own (the first law), so there is no "force of motion".', 'Forces the object exerts on other things belong on those things\' diagrams, not this one. The answer: ' + NOT.a.charAt(0).toLowerCase() + NOT.a.slice(1) + '.'],
        hint: 'Name who exerts each force and on whom.', d: { k: 'not' }
      };
    }
    var all = [C.right].concat(C.wrong), order = R.shuffle([0, 1, 2, 3]), ans = order.indexOf(0);
    return {
      q: C.s + ' Which free-body diagram shows the forces on it?',
      a: MCK(['A', 'B', 'C', 'D'], ans),
      viz: { name: 'ph-fbd', opts: { scene: C.scene, interactive: false, quiet: true, panel: order.map(function (j) { return { forces: fbdForces(all[j]) }; }) } },
      steps: [C.why, 'A "force of motion" never belongs on a diagram, and neither does a force the object exerts on something else.', 'The right diagram is ' + 'ABCD'[ans] + '.'],
      hint: 'Every arrow needs an object that exerts it. Which diagram has exactly those?', d: { k: 'pick', ans: ans }
    };
  }));

  // ---------- phys1.newtons-third-law
  var PAIRS3 = [
    { f: 'Earth pulls a book down (gravity).', a: 'The book pulls Earth up (gravity).', w: ['The table pushes the book up (normal force).', 'The book pushes the table down (contact).', 'The table pulls Earth up (gravity).'] },
    { f: 'A table pushes up on a book resting on it (normal force).', a: 'The book pushes down on the table.', w: ['Earth pulls the book down (gravity).', 'The book pulls Earth up (gravity).', 'The floor pushes up on the table.'] },
    { f: 'A swimmer\'s hands push the water backward.', a: 'The water pushes the swimmer\'s hands forward.', w: ['The swimmer\'s legs push the water backward.', 'Earth pulls the swimmer down.', 'The water pushes the swimmer up (buoyancy).'] },
    { f: 'A rope pulls up on a bucket.', a: 'The bucket pulls down on the rope.', w: ['Earth pulls the bucket down (gravity).', 'The pulley pulls up on the rope.', 'The bucket pulls Earth up (gravity).'] },
    { f: 'A rocket engine pushes hot gas downward out of the nozzle.', a: 'The hot gas pushes the rocket upward.', w: ['Earth pulls the rocket down (gravity).', 'The air pushes the rocket down (drag).', 'The ground pushes the gas up.'] },
    { f: 'A car\'s tire pushes backward on the road (friction).', a: 'The road pushes forward on the tire (friction).', w: ['The road pushes up on the tire (normal force).', 'The air pushes backward on the car (drag).', 'Earth pulls the car down (gravity).'] }
  ];
  G('phys1.newtons-third-law', W(function (R, ctx) {
    var shape = by(ctx, 'pair', R.pick(['pair', 'crash', 'skate']), R.pick(['crash', 'skate', 'pair']));
    if (shape === 'pair') {
      var P = R.pick(PAIRS3);
      return {
        q: 'Force: ' + P.f + ' Which force is its Newton\'s third-law partner?',
        a: MC(P.a, P.w),
        steps: ['A third-law pair is one interaction seen from both sides: if A pushes B, then B pushes A.', 'The two forces act on <b>different</b> objects, are the same type of force, have equal size and point opposite ways.', 'Swap the two objects in the description: ' + P.a],
        hint: 'Swap "who pushes" and "who is pushed".', d: { k: 'pair' }
      };
    }
    if (shape === 'crash') {
      var mt = R.int(3, 8) * 1000, mc = R.int(8, 15) * 100, F = R.int(2, 9) * 10000, ask = R.pick(['force', 'aCar', 'aTruck']);
      var val = ask === 'force' ? F : ask === 'aCar' ? F / mc : F / mt;
      return {
        q: art(T.commas(mt), 'A') + ' $' + T.commas(mt) + '\\ \\text{kg}$ truck bumps into ' + art(T.commas(mc), 'a') + ' $' + T.commas(mc) + '\\ \\text{kg}$ car. During the collision the truck pushes on the car with a force of $' + T.commas(F) + '\\ \\text{N}$. ' + { force: 'How big is the force the car exerts on the truck?', aCar: 'What is the size of the car\'s acceleration?', aTruck: 'What is the size of the truck\'s acceleration?' }[ask],
        a: ask === 'force' ? AX(F) : A(val), unit: ask === 'force' ? 'N' : 'm/s²',
        steps: ['Third law: the car pushes back on the truck with a force of the same size, $' + T.commas(F) + '\\ \\text{N}$, even though the truck is heavier.'].concat(ask === 'force' ? [] : ['Same force, different masses: $a = \\dfrac{F}{m} = \\dfrac{' + T.commas(F) + '}{' + T.commas(ask === 'aCar' ? mc : mt) + '} = ' + qu(val, 'm/s2') + '$.', 'The ' + (ask === 'aCar' ? 'car, with less mass, gets the larger acceleration.' : 'truck, with more mass, gets the smaller acceleration.')]),
        hint: ask === 'force' ? 'Third-law forces are always equal in size.' : 'Both feel the same size force. Use a = F/m.', d: { k: 'crash', F: F, mc: mc, mt: mt, ask: ask }
      };
    }
    var mA = R.int(40, 90), mB = R.int(25, 70), Fp = R.int(4, 15) * 10;
    return {
      q: 'Two skaters stand face to face on smooth ice. Skater A ($' + mA + '\\ \\text{kg}$) pushes skater B ($' + mB + '\\ \\text{kg}$) with a force of $' + Fp + '\\ \\text{N}$. What is the size of skater A\'s acceleration while they push?',
      a: A(Fp / mA), unit: 'm/s²',
      steps: ['Third law: B pushes back on A with $' + Fp + '\\ \\text{N}$, so both move apart, even though only A "did the pushing".', '$a_A = \\dfrac{' + Fp + '}{' + mA + '} = ' + qu(Fp / mA, 'm/s2') + '$.'],
      hint: 'What force does B exert on A?', d: { k: 'skate', F: Fp, m: mA }
    };
  }));

  // ---------- phys1.equilibrium-first-law
  G('phys1.equilibrium-first-law', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['push', 'elev', 'sky']), R.pick(['push', 'elev', 'mc', 'sky', 'two']), R.pick(['two', 'sky', 'mc', 'push']));
    if (shape === 'push') {
      var Fp = R.int(4, 40) * 5, m = R.int(8, 90), who = R.pick(['You push ', 'A worker pushes ', 'A student pushes ', 'A mover pushes ']), what = R.pick(['crate', 'box', 'cabinet', 'trunk', 'desk']);
      return {
        q: who + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ ' + what + ' across a floor at a <b>constant velocity</b> with a horizontal force of $' + Fp + '\\ \\text{N}$. How big is the friction force on the crate?',
        a: AX(Fp), unit: 'N',
        viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: m * g }, { type: 'applied', mag: Fp }, { type: 'friction', mag: Fp }], interactive: false, quiet: true } },
        steps: ['Constant velocity means zero acceleration, so the net force is zero (the first law).', 'Horizontally: push $-$ friction $= 0$, so friction $= ' + Fp + '\\ \\text{N}$. The mass is not needed.'],
        hint: 'Constant velocity: what must the net force be?', d: { k: 'push', F: Fp }
      };
    }
    if (shape === 'elev' || shape === 'sky') {
      var mm = shape === 'sky' ? R.int(50, 110) : R.int(6, 30) * 50, up = R.coin(), W0 = mm * g;
      return {
        q: shape === 'sky' ? art(mm, 'A') + ' $' + mm + '\\ \\text{kg}$ skydiver falls at a steady terminal speed. How big is the air drag force on the skydiver?' : 'An elevator car of mass $' + tv(mm) + '\\ \\text{kg}$ moves ' + (up ? 'up' : 'down') + ' at a constant $2\\ \\text{m/s}$. What is the tension in its cable?',
        a: A(W0), unit: 'N',
        steps: [(shape === 'sky' ? 'Steady speed in a straight line' : 'Constant velocity, ' + (up ? 'upward' : 'downward') + ',') + ' means $\\Sigma F = 0$, whatever the direction of motion.', 'So the upward force equals the weight: $mg = (' + mm + ')(9.8) = ' + qu(W0, 'N') + '$.'],
        hint: 'Constant velocity means the forces balance.', d: { k: 'weight', m: mm }
      };
    }
    if (shape === 'two') {
      var ml = R.int(3, 60), Wl = ml * g;
      return {
        q: art(ml, 'A') + ' $' + ml + '\\ \\text{kg}$ sign hangs at rest from two vertical ropes that share the load equally. What is the tension in each rope?',
        a: A(Wl / 2), unit: 'N',
        steps: ['At rest: $\\Sigma F_y = 0$, so $2T - mg = 0$.', '$T = \\dfrac{mg}{2} = \\dfrac{(' + ml + ')(9.8)}{2} = ' + qu(Wl / 2, 'N') + '$.'],
        hint: 'The two tensions together hold up the weight.', d: { k: 'two', m: ml }
      };
    }
    var MCQ = R.pick([
      { q: 'A hockey puck slides across frictionless ice at a constant $5\\ \\text{m/s}$. What is the net force on it?', a: 'Zero', w: ['A forward force that keeps it moving', 'A force equal to its weight, pointing forward', 'A backward force that will stop it'] },
      { q: 'A space probe far from any star or planet coasts with its engines off. What happens to its motion?', a: 'It keeps moving in a straight line at the same speed.', w: ['It slowly comes to a stop.', 'It speeds up.', 'It curves into a circle.'] },
      { q: 'A car drives along a straight highway at a steady $25\\ \\text{m/s}$. Which statement about the forces on it is true?', a: 'The forward force from the road balances the backward drag and friction.', w: ['The forward force is bigger than the backward forces.', 'There is no force on the car at all.', 'The backward forces are bigger than the forward force.'] }
    ]);
    return {
      q: MCQ.q, a: MC(MCQ.a, MCQ.w),
      steps: ['Newton\'s first law: with zero net force, an object keeps the velocity it has, at rest or moving.', 'A steady velocity needs no net force in its direction; a net force would change the velocity.', 'So: ' + MCQ.a.charAt(0).toLowerCase() + MCQ.a.slice(1)],
      hint: 'Is the velocity changing?', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.second-law-systems
  G('phys1.second-law-systems', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['two', 'two']), R.pick(['three', 'rocket', 'two']), R.pick(['find', 'rocket', 'three']));
    var m = R.int(2, 25), right = R.coin();
    if (shape === 'two' || shape === 'three') {
      var F1 = R.int(4, 20) * 5, F2 = R.int(1, 15) * 5, f = shape === 'three' ? R.int(1, 6) * 5 : 0;
      if (F1 === F2 + f) F1 += 5;
      var net = F1 - F2 - f, acc = net / m;
      return {
        q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ cart is pulled to the right with $' + F1 + '\\ \\text{N}$ and to the left with $' + F2 + '\\ \\text{N}$' + (f ? ', and while it rolls right, friction of $' + f + '\\ \\text{N}$ acts on it' : '') + '. Take right as positive. What is the cart\'s acceleration (with its sign)?',
        a: A(acc), unit: 'm/s²',
        viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: m * g }, { type: 'applied', mag: F1, angle: 0, label: 'F_1' }, { type: 'applied', mag: F2, angle: 180, label: 'F_2' }].concat(f ? [{ type: 'friction', mag: f }] : []), interactive: false, quiet: true } },
        steps: ['Vertically the forces balance. Horizontally, add the forces with signs: $\\Sigma F_x = ' + F1 + ' - ' + F2 + (f ? ' - ' + f : '') + ' = ' + net + '\\ \\text{N}$.', '$a = \\dfrac{\\Sigma F_x}{m} = \\dfrac{' + net + '}{' + m + '} = ' + qu(acc, 'm/s2') + '$.', 'Use the net force, not just the biggest pull.'],
        hint: 'Find the net force first, with signs.', d: { k: 'net', F: [F1, -F2, -f], m: m }
      };
    }
    if (shape === 'rocket') {
      var mr = R.int(2, 12) * 10, Th = Math.round(mr * g * R.pick([1.3, 1.5, 1.8, 2.2]) / 10) * 10, ar = (Th - mr * g) / mr;
      return {
        q: art(mr, 'A') + ' $' + mr + '\\ \\text{kg}$ model rocket\'s engine pushes it up with a thrust of $' + Th + '\\ \\text{N}$. Ignoring air resistance, what is its acceleration?',
        a: A(ar), unit: 'm/s²',
        steps: ['Two forces: thrust up and weight down, $mg = (' + mr + ')(9.8) = ' + tv(mr * g) + '\\ \\text{N}$.', 'Up positive: $\\Sigma F = ' + Th + ' - ' + tv(mr * g) + ' = ' + tv(Th - mr * g) + '\\ \\text{N}$.', '$a = \\dfrac{' + tv(Th - mr * g) + '}{' + mr + '} = ' + qu(ar, 'm/s2') + '$ upward.'],
        hint: 'Don\'t forget the weight: the net force is thrust minus weight.', d: { k: 'rocket', T: Th, m: mr }
      };
    }
    var aa = R.pick([0.5, 1, 1.5, 2, 2.5, 3]), fr = R.int(2, 12) * 5, Fneed = m * aa + fr;
    return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box slides to the right across a floor with $' + fr + '\\ \\text{N}$ of friction. What horizontal pull to the right gives it an acceleration of $' + gv(aa, 'm/s2') + '$ to the right?',
      a: A(Fneed), unit: 'N',
      steps: ['$\\Sigma F_x = ma$: $F - ' + fr + ' = (' + m + ')(' + tv(aa) + ')$.', '$F = ' + tv(m * aa) + ' + ' + fr + ' = ' + qu(Fneed, 'N') + '$. Part of the pull cancels friction; the rest accelerates the box.'],
      hint: 'Write ΣF = ma with the unknown pull in the sum.', d: { k: 'find', m: m, a: aa, f: fr }
    };
  }));

  // ---------- phys1.normal-force
  G('phys1.normal-force', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['press', 'lift']), R.pick(['elev', 'elev', 'press', 'mc']), R.pick(['elev', 'elev', 'lift', 'mc']));
    var m = R.int(40, 90);
    if (shape === 'elev') {
      var a = R.pick([0.8, 1.2, 1.5, 2, 2.5]), C = R.pick([['moving up and speeding up', 1], ['moving up and slowing down', -1], ['moving down and speeding up', -1], ['moving down and slowing down', 1]]), ay = C[1] * a, N = m * (g + ay);
      return {
        q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ person stands on a bathroom scale in an elevator that is ' + C[0] + ' at $' + gv(a, 'm/s2') + '$. What does the scale read (the normal force, in newtons)?',
        a: A(N), unit: 'N',
        viz: { name: 'ph-fbd', opts: { scene: 'elevator', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: N }], motion: { a: ay }, interactive: false, quiet: true } },
        steps: ['Direction of the acceleration: ' + C[0] + ' means $a$ points ' + (C[1] > 0 ? 'up' : 'down') + ', so with up positive $a = ' + tv(ay) + '\\ \\text{m/s}^2$.', '$\\Sigma F = N - mg = ma$, so $N = m(g + a) = ' + m + '(9.8 + ' + T.p(ay) + ')$.', '$N = ' + qu(N, 'N') + '$, ' + (N > m * g ? 'more' : 'less') + ' than the weight $' + tn(m * g) + '\\ \\text{N}$.'],
        hint: 'Find the direction of the acceleration first: speeding up means a points along v; slowing down means opposite.', d: { k: 'elev', m: m, a: ay }
      };
    }
    if (shape === 'press' || shape === 'lift') {
      var mb = R.int(5, 30), F = R.int(2, Math.floor(mb * 9.8 / 5) - 1) * 5, Nn = shape === 'press' ? mb * g + F : mb * g - F;
      return {
        q: art(mb, 'A') + ' $' + mb + '\\ \\text{kg}$ box rests on the floor. You ' + (shape === 'press' ? 'press down on its top' : 'pull up on it with a rope, not hard enough to lift it,') + ' with a force of $' + F + '\\ \\text{N}$. What is the normal force from the floor?',
        a: A(Nn), unit: 'N',
        steps: ['The box stays at rest, so the vertical forces balance: $\\Sigma F_y = 0$.', shape === 'press' ? 'Up: $N$. Down: $mg$ and your push. $N = mg + F = ' + tv(mb * g) + ' + ' + F + ' = ' + qu(Nn, 'N') + '$.' : 'Up: $N$ and the rope. Down: $mg$. $N = mg - F = ' + tv(mb * g) + ' - ' + F + ' = ' + qu(Nn, 'N') + '$.', 'The floor pushes just as hard as it must; the normal force is not always $mg$.'],
        hint: 'Balance the vertical forces. The normal force is whatever is needed.', d: { k: shape, m: mb, F: F }
      };
    }
    var MQ = R.pick([
      { q: 'You stand on a scale in an elevator. When does the scale read <b>less</b> than your weight?', a: 'When the elevator accelerates downward, for example as it starts moving down.', w: ['Whenever the elevator is moving down, even at a steady speed.', 'Whenever the elevator is moving up.', 'Never: a scale always reads your weight.'] },
      { q: 'An elevator moves upward at a <b>constant</b> speed. How does the normal force on a passenger compare with the passenger\'s weight?', a: 'It equals the weight.', w: ['It is greater than the weight.', 'It is less than the weight.', 'It is zero.'] }
    ]);
    return {
      q: MQ.q, a: MC(MQ.a, MQ.w),
      steps: ['The scale reads the normal force $N$. From $N - mg = ma$ (up positive): $N = m(g + a)$.', 'Only the acceleration matters, not the direction of motion: $a$ up gives $N > mg$, $a$ down gives $N < mg$, and $a = 0$ (steady speed) gives $N = mg$.', 'Answer: ' + MQ.a.charAt(0).toLowerCase() + MQ.a.slice(1)],
      hint: 'Which way does the acceleration point?', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.forces-at-angles
  G('phys1.forces-at-angles', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['ax', 'normal']), R.pick(['normal', 'fric', 'push']), R.pick(['fric', 'fric', 'push']));
    var m = R.int(8, 40), F = R.int(4, 16) * 5, th = R.pick([20, 25, 30, 35, 40]), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    var Fx = F * cosD(th), Fy = F * sinD(th);
    if (shape === 'push') {
      var Np = m * g + Fy, asked = R.coin() ? 'N' : 'f', fk = mu * Np;
      return {
        q: 'You push ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ lawn mower along level grass with a force of $' + F + '\\ \\text{N}$ directed along the handle, $' + th + '^\\circ$ <b>below</b> the horizontal. ' + (asked === 'N' ? 'What is the normal force from the ground?' : 'The coefficient of kinetic friction is $' + mu + '$. What is the friction force?'),
        a: A(asked === 'N' ? Np : fk), unit: 'N',
        viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: Np }, { type: 'applied', mag: F, angle: -th }].concat(asked === 'f' ? [{ type: 'friction', mag: fk }] : []), interactive: false, quiet: true } },
        steps: ['Split the push: horizontal $F\\cos' + th + '^\\circ = ' + tn(Fx) + '\\ \\text{N}$, downward $F\\sin' + th + '^\\circ = ' + tn(Fy, 4) + '\\ \\text{N}$.', 'Vertically nothing accelerates: $N = mg + F\\sin\\theta = ' + tv(m * g) + ' + ' + tn(Fy, 4) + ' = ' + qu(Np, 'N') + '$. Pushing down presses the mower into the ground.'].concat(asked === 'f' ? ['$f_k = \\mu_k N = ' + mu + ' \\times ' + tn(Np, 4) + ' = ' + qu(fk, 'N') + '$.'] : []),
        hint: 'The downward part of your push adds to the normal force.', d: { k: 'push', m: m, F: F, th: th, mu: mu, ask: asked }
      };
    }
    if (shape === 'ax') return {
      q: 'A rope pulls ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ sled across frictionless ice with a force of $' + F + '\\ \\text{N}$ at $' + th + '^\\circ$ above the horizontal. What is the sled\'s acceleration?',
      a: A(Fx / m), unit: 'm/s²',
      viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: m * g - Fy }, { type: 'tension', mag: F, angle: th }], interactive: false, quiet: true } },
      steps: ['Only the horizontal part of the pull speeds the sled along the ice: $F_x = F\\cos\\theta = ' + F + '\\cos ' + th + '^\\circ = ' + tn(Fx, 4) + '\\ \\text{N}$.', '$a = \\dfrac{F_x}{m} = \\dfrac{' + tn(Fx, 4) + '}{' + m + '} = ' + qu(Fx / m, 'm/s2') + '$.'],
      hint: 'Use the component of the pull along the motion.', d: { k: 'ax', m: m, F: F, th: th }
    };
    var Nr = m * g - Fy;
    if (shape === 'normal') return {
      q: 'A rope pulls ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ box along a level floor with a force of $' + F + '\\ \\text{N}$ at $' + th + '^\\circ$ above the horizontal. What is the normal force from the floor on the box?',
      a: A(Nr), unit: 'N',
      viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: Nr }, { type: 'tension', mag: F, angle: th }], interactive: false, quiet: true } },
      steps: ['The upward part of the pull is $F\\sin\\theta = ' + F + '\\sin ' + th + '^\\circ = ' + tn(Fy, 4) + '\\ \\text{N}$.', 'Vertically nothing accelerates: $N + F\\sin\\theta - mg = 0$.', '$N = ' + tv(m * g) + ' - ' + tn(Fy, 4) + ' = ' + qu(Nr, 'N') + '$, less than $mg$: the rope lifts part of the weight.'],
      hint: 'Balance the vertical forces, including the upward part of the pull.', d: { k: 'normal', m: m, F: F, th: th }
    };
    var fk2 = mu * Nr, ac = (Fx - fk2) / m;
    if (ac <= 0.05) { F = F + 40; Fx = F * cosD(th); Fy = F * sinD(th); Nr = m * g - Fy; fk2 = mu * Nr; ac = (Fx - fk2) / m; }
    return {
      q: 'A rope pulls ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ box along a level floor with a force of $' + F + '\\ \\text{N}$ at $' + th + '^\\circ$ above the horizontal. The coefficient of kinetic friction is $' + mu + '$. What is the box\'s acceleration?',
      a: A(ac), unit: 'm/s²',
      viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: Nr }, { type: 'tension', mag: F, angle: th }, { type: 'friction', mag: fk2 }], interactive: false, quiet: true } },
      steps: ['Components of the pull: $F_x = ' + tn(Fx, 4) + '\\ \\text{N}$, $F_y = ' + tn(Fy, 4) + '\\ \\text{N}$.', 'Vertical balance: $N = mg - F_y = ' + tv(m * g) + ' - ' + tn(Fy, 4) + ' = ' + tn(Nr, 4) + '\\ \\text{N}$.', 'Friction: $f_k = \\mu_k N = ' + mu + ' \\times ' + tn(Nr, 4) + ' = ' + tn(fk2, 4) + '\\ \\text{N}$ (not $\\mu_k mg$).', 'Horizontal: $a = \\dfrac{F_x - f_k}{m} = \\dfrac{' + tn(Fx, 4) + ' - ' + tn(fk2, 4) + '}{' + m + '} = ' + qu(ac, 'm/s2') + '$.'],
      hint: 'Find N from the vertical forces first; the rope\'s upward pull lowers it.', d: { k: 'fric', m: m, F: F, th: th, mu: mu }
    };
  }));

  // ---------- phys1.inclined-planes
  G('phys1.inclined-planes', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['acc', 'par']), R.pick(['acc', 'normal', 'hold', 'mc']), R.pick(['speed', 'up', 'normal', 'mc']));
    var m = R.int(2, 30), th = R.pick([15, 20, 25, 30, 35, 40, 50]);
    var viz = { name: 'ph-fbd', opts: { scene: 'incline', angle: th, forces: [{ type: 'gravity', mag: m * g }, { type: 'normal', mag: m * g * cosD(th) }], interactive: false, quiet: true } };
    if (shape === 'acc') return {
      q: 'A block slides down a frictionless ramp tilted at $' + th + '^\\circ$. What is the size of its acceleration?',
      a: A(g * sinD(th)), unit: 'm/s²', viz: viz,
      steps: ['Tilt the axes: $x$ along the slope, $y$ perpendicular to it.', 'Along the slope only the weight\'s component $mg\\sin\\theta$ acts (the normal force is perpendicular).', '$a = \\dfrac{mg\\sin\\theta}{m} = g\\sin\\theta = 9.8\\sin ' + th + '^\\circ = ' + qu(g * sinD(th), 'm/s2') + '$, whatever the mass.'],
      hint: 'Only the part of gravity along the slope accelerates the block.', d: { k: 'acc', th: th }
    };
    if (shape === 'par' || shape === 'hold') return {
      q: shape === 'par' ? art(m, 'A') + ' $' + m + '\\ \\text{kg}$ crate sits on a ramp tilted at $' + th + '^\\circ$. What is the component of its weight along the slope?' : 'You hold ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ cart at rest on a frictionless ramp tilted at $' + th + '^\\circ$, pushing parallel to the slope. How hard must you push?',
      a: A(m * g * sinD(th)), unit: 'N', viz: viz,
      steps: ['The weight is $mg = ' + tv(m * g) + '\\ \\text{N}$, straight down.', 'Its part along the slope is $mg\\sin\\theta$: the angle between the weight and the perpendicular to the slope equals the ramp angle $\\theta$, so the slope part is the side opposite it.', '$mg\\sin\\theta = ' + tv(m * g) + '\\sin ' + th + '^\\circ = ' + qu(m * g * sinD(th), 'N') + '$.'].concat(shape === 'hold' ? ['At rest the forces along the slope balance, so you push with that much force.'] : []),
      hint: 'Along the slope: mg sin θ. Into the slope: mg cos θ.', d: { k: 'par', m: m, th: th }
    };
    if (shape === 'normal') return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box rests on a ramp tilted at $' + th + '^\\circ$. What is the normal force from the ramp on the box?',
      a: A(m * g * cosD(th)), unit: 'N', viz: viz,
      steps: ['Perpendicular to the slope nothing accelerates, so $N$ balances the weight\'s part into the slope.', 'That part is $mg\\cos\\theta$ (adjacent to the ramp angle).', '$N = ' + tv(m * g) + '\\cos ' + th + '^\\circ = ' + qu(m * g * cosD(th), 'N') + '$, less than $mg$.'],
      hint: 'Balance the forces perpendicular to the slope.', d: { k: 'normal', m: m, th: th }
    };
    if (shape === 'mc') {
      var ask = R.coin();
      return {
        q: 'A block of mass $m$ rests on a ramp at angle $\\theta$. Which expression gives the ' + (ask ? 'size of the normal force' : 'component of the weight along the slope') + '?',
        a: MC(ask ? '$mg\\cos\\theta$' : '$mg\\sin\\theta$', [ask ? '$mg\\sin\\theta$' : '$mg\\cos\\theta$', '$mg$', '$mg\\tan\\theta$']),
        viz: { name: 'ph-fbd', opts: { scene: 'incline', angle: th, forces: [{ type: 'gravity', mag: 50 }, { type: 'normal', mag: 50 * cosD(th) }], interactive: false, quiet: true, show: ['components'] } },
        steps: ['Check the extremes. On a flat floor ($\\theta = 0$) the normal force is $mg$ and nothing pulls along the floor.', '$\\cos 0^\\circ = 1$ and $\\sin 0^\\circ = 0$, so the normal force is $mg\\cos\\theta$ and the along-slope part is $mg\\sin\\theta$.', 'On a vertical wall ($\\theta = 90^\\circ$) it flips: all of the weight is along the "slope".'],
        hint: 'Try θ = 0 (a flat floor): which expression gives the right answer?', d: { k: 'mc' }
      };
    }
    if (shape === 'speed') {
      var L = R.int(2, 15), v = sqrt(2 * g * sinD(th) * L);
      return {
        q: 'A cart starts from rest at the top of a frictionless ramp $' + L + '\\ \\text{m}$ long, tilted at $' + th + '^\\circ$. How fast is it going at the bottom?',
        a: A(v), unit: 'm/s', viz: viz,
        steps: ['Acceleration along the slope: $a = g\\sin\\theta = ' + tn(g * sinD(th), 4) + '\\ \\text{m/s}^2$.', '$v^2 = 2aL = 2(' + tn(g * sinD(th), 4) + ')(' + L + ')$, so $v = ' + qu(v, 'm/s') + '$.'],
        hint: 'Find a = g sin θ, then use v² = v₀² + 2aΔx.', d: { k: 'speed', th: th, L: L }
      };
    }
    var Fu = Math.ceil(m * g * sinD(th) / 10 + R.int(1, 5)) * 10, au = (Fu - m * g * sinD(th)) / m;
    return {
      q: 'You push ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ box up a frictionless ramp tilted at $' + th + '^\\circ$ with a force of $' + Fu + '\\ \\text{N}$ parallel to the slope. What is the box\'s acceleration up the slope?',
      a: A(au), unit: 'm/s²', viz: viz,
      steps: ['Along the slope (up positive): your push $+' + Fu + '\\ \\text{N}$ and the weight\'s part $-mg\\sin\\theta = -' + tn(m * g * sinD(th), 4) + '\\ \\text{N}$.', '$a = \\dfrac{' + Fu + ' - ' + tn(m * g * sinD(th), 4) + '}{' + m + '} = ' + qu(au, 'm/s2') + '$.'],
      hint: 'Along the slope: push minus mg sin θ.', d: { k: 'up', m: m, th: th, F: Fu }
    };
  }));

  // ---------- phys1.kinetic-friction
  G('phys1.kinetic-friction', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['f', 'mu']), R.pick(['decel', 'stop', 'mu', 'f']), R.pick(['press', 'stop', 'decel']));
    var m = R.int(3, 40), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]);
    var viz = { name: 'ph-dynamics', opts: { scene: 'cart', m1: m, muk: mu, F: 0, push: false, interactive: false, quiet: true } };
    if (shape === 'f') return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box slides across a level floor. The coefficient of kinetic friction is $' + mu + '$. How big is the friction force?',
      a: A(mu * m * g), unit: 'N',
      steps: ['On a level floor with no other vertical forces, $N = mg = ' + tv(m * g) + '\\ \\text{N}$.', '$f_k = \\mu_k N = ' + mu + ' \\times ' + tv(m * g) + ' = ' + qu(mu * m * g, 'N') + '$, pointing against the sliding.'],
      hint: 'f_k = μ_k N. Find N first.', d: { k: 'f', m: m, mu: mu }
    };
    if (shape === 'mu') {
      var Fp = Math.round(mu * m * g);
      return {
        q: 'It takes a horizontal push of $' + Fp + '\\ \\text{N}$ to keep ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ trunk sliding across a level floor at a constant speed. What is the coefficient of kinetic friction?',
        a: A(Fp / (m * g)),
        steps: ['Constant speed: the push balances friction, so $f_k = ' + Fp + '\\ \\text{N}$.', '$N = mg = ' + tv(m * g) + '\\ \\text{N}$.', '$\\mu_k = \\dfrac{f_k}{N} = \\dfrac{' + Fp + '}{' + tv(m * g) + '} = ' + tn(Fp / (m * g)) + '$ (no units).'],
        hint: 'At constant speed the push equals the friction force.', d: { k: 'mu', F: Fp, m: m }
      };
    }
    var v0 = R.int(3, 15);
    if (shape === 'decel') return {
      q: 'A hockey puck slides across rough ice with $\\mu_k = ' + mu + '$. What is the size of its deceleration?',
      a: A(mu * g), unit: 'm/s²',
      steps: ['The only horizontal force is friction, $f_k = \\mu_k mg$.', '$a = \\dfrac{\\mu_k mg}{m} = \\mu_k g = ' + mu + ' \\times 9.8 = ' + qu(mu * g, 'm/s2') + '$. The mass cancels.'],
      hint: 'Friction is the net force. Divide by the mass.', d: { k: 'decel', mu: mu }
    };
    if (shape === 'stop') return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box is sliding at $' + v0 + '\\ \\text{m/s}$ across a level floor with $\\mu_k = ' + mu + '$. How far does it slide before stopping?',
      a: A(v0 * v0 / (2 * mu * g)), unit: 'm',
      steps: ['Deceleration: $a = \\mu_k g = ' + tv(mu * g) + '\\ \\text{m/s}^2$.', 'From $0 = v_0^2 - 2a\\,d$: $d = \\dfrac{' + v0 + '^2}{2(' + tv(mu * g) + ')} = ' + qu(v0 * v0 / (2 * mu * g), 'm') + '$.'],
      hint: 'Find the deceleration μ_k g, then use v² = v₀² + 2aΔx.', d: { k: 'stop', v0: v0, mu: mu }
    };
    var P = R.int(2, 10) * 10, Np = m * g + P;
    return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box slides across a level floor while you press straight down on its top with $' + P + '\\ \\text{N}$. The coefficient of kinetic friction is $' + mu + '$. How big is the friction force?',
      a: A(mu * Np), unit: 'N',
      steps: ['The normal force is not $mg$ here: vertically, $N = mg + ' + P + ' = ' + tv(m * g) + ' + ' + P + ' = ' + tv(Np) + '\\ \\text{N}$.', '$f_k = \\mu_k N = ' + mu + ' \\times ' + tv(Np) + ' = ' + qu(mu * Np, 'N') + '$.'],
      hint: 'Pressing down increases the normal force.', d: { k: 'press', m: m, P: P, mu: mu }
    };
  }));

  // ---------- phys1.static-friction
  G('phys1.static-friction', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['under', 'start']), R.pick(['under', 'start', 'moves', 'under']), R.pick(['moves', 'after', 'under']));
    var m = R.int(10, 60), mus = R.pick([0.3, 0.4, 0.5, 0.6, 0.7]), muk = fx(mus - R.pick([0.1, 0.15, 0.2])), max = mus * m * g;
    var viz = function (F) { return { name: 'ph-dynamics', opts: { scene: 'cart', m1: m, F: F, mus: mus, muk: muk, interactive: false, quiet: true } }; };
    if (shape === 'under') {
      var F = Math.max(10, Math.floor(max * R.pick([0.3, 0.5, 0.7]) / 10) * 10);
      return {
        q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ crate rests on a level floor with $\\mu_s = ' + mus + '$. You push it horizontally with $' + F + '\\ \\text{N}$, and it does not move. How big is the static friction force on it?',
        a: AX(F), unit: 'N',
        steps: ['The crate stays at rest, so the forces balance: static friction exactly matches your push, $f_s = ' + F + '\\ \\text{N}$.', 'The limit $\\mu_s N = ' + mus + ' \\times ' + tv(m * g) + ' = ' + tn(max) + '\\ \\text{N}$ is only the most static friction can do. It does not reach that until the crate is about to slip.'],
        hint: 'Static friction is only as big as it needs to be.', d: { k: 'under', F: F }
      };
    }
    if (shape === 'start') return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ dresser sits on a level floor with $\\mu_s = ' + mus + '$. What is the smallest horizontal push that will start it sliding?',
      a: A(max), unit: 'N',
      steps: ['Static friction can grow up to $f_{s,max} = \\mu_s N$.', '$N = mg = ' + tv(m * g) + '\\ \\text{N}$, so $f_{s,max} = ' + mus + ' \\times ' + tv(m * g) + ' = ' + qu(max, 'N') + '$.', 'A push bigger than that starts it sliding.'],
      hint: 'The push must just beat the largest possible static friction.', d: { k: 'start', m: m, mu: mus }
    };
    if (shape === 'moves') {
      var F2 = Math.round(max * R.pick([0.6, 0.8, 1.2, 1.4]) / 10) * 10, moves = F2 > max;
      if (abs(F2 - max) < 5) F2 += 20, moves = true;
      return {
        q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box rests on a level floor with $\\mu_s = ' + mus + '$. You push it horizontally with $' + F2 + '\\ \\text{N}$. What happens?',
        a: MC(moves ? 'It starts to slide.' : 'It stays put, with static friction equal to the push.', [moves ? 'It stays put, with static friction equal to the push.' : 'It starts to slide.', 'It stays put, with static friction equal to $\\mu_s N$.', 'It slides at a constant speed right away.']),
        viz: viz(F2),
        steps: ['The most static friction can do is $\\mu_s N = ' + mus + ' \\times ' + tv(m * g) + ' = ' + tn(max) + '\\ \\text{N}$.', moves ? 'The push, $' + F2 + '\\ \\text{N}$, is more than that, so friction cannot hold the box: it starts to slide.' : 'The push, $' + F2 + '\\ \\text{N}$, is less than that, so static friction matches it and the box stays put.'],
        hint: 'Compare the push with μ_s N.', d: { k: 'moves', F: F2, max: max, ans: moves }
      };
    }
    var F3 = Math.ceil(max / 10 + 1) * 10, a = (F3 - muk * m * g) / m;
    return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ crate rests on a floor with $\\mu_s = ' + mus + '$ and $\\mu_k = ' + muk + '$. You push it with a steady $' + F3 + '\\ \\text{N}$, just enough to break it loose. Once it slides, what is its acceleration?',
      a: A(a), unit: 'm/s²', viz: viz(F3),
      steps: ['It breaks loose because $' + F3 + ' > \\mu_s N = ' + tn(max) + '\\ \\text{N}$.', 'Once sliding, friction is kinetic: $f_k = \\mu_k N = ' + muk + ' \\times ' + tv(m * g) + ' = ' + tn(muk * m * g, 4) + '\\ \\text{N}$, smaller than the static limit.', '$a = \\dfrac{' + F3 + ' - ' + tn(muk * m * g, 4) + '}{' + m + '} = ' + qu(a, 'm/s2') + '$. That is why a stuck object lurches once it breaks free.'],
      hint: 'After it starts sliding, use kinetic friction.', d: { k: 'after', m: m, F: F3, muk: muk }
    };
  }));

  // ---------- phys1.friction-on-inclines
  G('phys1.friction-on-inclines', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['slip', 'down']), R.pick(['down', 'slip', 'dir', 'const']), R.pick(['upslide', 'down', 'dir', 'slides']));
    var th = R.pick([25, 30, 35, 40, 45, 26, 31, 36, 39, 44]), muk = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.12]), mus = R.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.35]);
    if (shape === 'down' && tanD(th) <= muk + 0.05) th = 40;
    var viz = { name: 'ph-dynamics', opts: { scene: 'incline', angle: th, mus: mus, muk: muk, m1: 2, interactive: false, quiet: true } };
    if (shape === 'slip') return {
      q: 'You slowly tilt a board with a block on it. The coefficient of static friction is $' + mus + '$. At what angle does the block start to slip?',
      a: { t: 'num', v: sv(Math.atan(mus) / DEG, 3), tol: 0.5, rtol: 0.02 }, unit: '°',
      viz: { name: 'ph-dynamics', opts: { scene: 'incline', angle: 20, mus: mus, muk: fx(mus * 0.7), m1: 2, interactive: false, quiet: true } },
      steps: ['Just before slipping, static friction is at its limit and balances the slope part of the weight: $mg\\sin\\theta = \\mu_s mg\\cos\\theta$.', 'Divide by $mg\\cos\\theta$: $\\tan\\theta = \\mu_s = ' + mus + '$.', '$\\theta = \\tan^{-1}(' + mus + ') = ' + tn(Math.atan(mus) / DEG) + '^\\circ$, whatever the mass.'],
      hint: 'At the slipping point, mg sin θ = μ_s mg cos θ.', d: { k: 'slip', mu: mus }
    };
    if (shape === 'down') { var a = g * (sinD(th) - muk * cosD(th)); return {
      q: 'A block slides down a ramp tilted at $' + th + '^\\circ$ with $\\mu_k = ' + muk + '$. What is the size of its acceleration?',
      a: A(a), unit: 'm/s²', viz: viz,
      steps: ['Along the slope (down positive): gravity\'s part $mg\\sin\\theta$ down the slope, kinetic friction $\\mu_k N$ <b>up</b> the slope (against the sliding).', 'Perpendicular: $N = mg\\cos\\theta$.', '$a = g(\\sin\\theta - \\mu_k\\cos\\theta) = 9.8(\\sin ' + th + '^\\circ - ' + muk + '\\cos ' + th + '^\\circ) = ' + qu(a, 'm/s2') + '$.'],
      hint: 'Friction points up the slope when the block slides down.', d: { k: 'down', th: th, mu: muk }
    }; }
    if (shape === 'upslide') { var au = g * (sinD(th) + muk * cosD(th)), v0 = R.int(3, 10), dd = v0 * v0 / (2 * au), askD = R.coin(); return {
      q: 'A block is shoved up a ramp tilted at $' + th + '^\\circ$ with $\\mu_k = ' + muk + '$, starting at $' + v0 + '\\ \\text{m/s}$. ' + (askD ? 'How far up the slope does it slide before stopping?' : 'While it slides up, what is the size of its deceleration?'),
      a: A(askD ? dd : au), unit: askD ? 'm' : 'm/s²', viz: viz,
      steps: ['Sliding up, both gravity\'s part $mg\\sin\\theta$ and friction $\\mu_k mg\\cos\\theta$ point <b>down</b> the slope.', 'Deceleration: $a = g(\\sin\\theta + \\mu_k\\cos\\theta) = ' + qu(au, 'm/s2') + '$.'].concat(askD ? ['Distance: $d = \\dfrac{v_0^2}{2a} = \\dfrac{' + v0 + '^2}{2(' + tn(au, 4) + ')} = ' + qu(dd, 'm') + '$.'] : []),
      hint: 'Friction always opposes the sliding. Sliding up, which way does it point?', d: { k: askD ? 'upd' : 'upa', th: th, mu: muk, v0: v0 }
    }; }
    if (shape === 'const') return {
      q: 'A block slides down a ramp tilted at $' + th + '^\\circ$ at a constant speed. What is the coefficient of kinetic friction?',
      a: A(tanD(th)), viz: viz,
      steps: ['Constant speed: the forces along the slope balance, $mg\\sin\\theta = \\mu_k mg\\cos\\theta$.', '$\\mu_k = \\tan\\theta = \\tan ' + th + '^\\circ = ' + tn(tanD(th)) + '$.'],
      hint: 'Balance the forces along the slope.', d: { k: 'const', th: th }
    };
    if (shape === 'slides') { var th2 = R.int(15, 40), mus2 = R.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.35]); if (abs(tanD(th2) - mus2) < 0.03) th2 += 5; var sl = tanD(th2) > mus2; return {
      q: 'A box is placed at rest on a ramp tilted at $' + th2 + '^\\circ$. The coefficient of static friction is $' + mus2 + '$. What happens?',
      a: MC(sl ? 'It starts to slide down.' : 'It stays at rest.', [sl ? 'It stays at rest.' : 'It starts to slide down.', 'It slides up the ramp.', 'It depends on the box\'s mass.']),
      steps: ['It stays put only if static friction can supply $mg\\sin\\theta$, that is, if $\\tan\\theta \\le \\mu_s$.', '$\\tan ' + th2 + '^\\circ = ' + tn(tanD(th2)) + '$, which is ' + (sl ? 'more' : 'less') + ' than $\\mu_s = ' + mus2 + '$.', sl ? 'So friction cannot hold it: it slides.' : 'So friction holds it: it stays at rest. The mass cancels out of the comparison.'],
      hint: 'Compare tan θ with μ_s.', d: { k: 'slides', th: th2, mu: mus2, ans: sl }
    }; }
    var C = R.pick([['slides down a ramp', 'up the slope'], ['is shoved up a ramp and is still sliding up', 'down the slope'], ['sits at rest on a ramp', 'up the slope']]);
    return {
      q: 'A block ' + C[0] + '. Which way does the friction force on it point?',
      a: MC(C[1], [C[1] === 'up the slope' ? 'down the slope' : 'up the slope', 'into the ramp', 'straight down']),
      steps: ['Friction acts along the surface, against the sliding (or, at rest, against the sliding that would happen without it).', C[0].indexOf('rest') >= 0 ? 'At rest, gravity\'s part pulls it down the slope, so static friction points up the slope to hold it.' : 'The block ' + C[0] + ', so friction points ' + C[1] + '.'],
      hint: 'Which way is it sliding, or which way would it slide?', d: { k: 'dir' }
    };
  }));

  // ======================= 05-forces2.js
  // ---------- phys1.connected-objects
  G('phys1.connected-objects', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['push-a', 'train-a']), R.pick(['push-c', 'train-t', 'table', 'mc']), R.pick(['three', 'table', 'push-c']));
    var m1 = R.int(2, 12), m2 = R.int(2, 12), F = R.int(2, 12) * 5;
    if (shape === 'push-a' || shape === 'push-c') {
      var a = F / (m1 + m2), c = m2 * a;
      return {
        q: 'Two blocks touch on a frictionless floor: block A ($' + m1 + '\\ \\text{kg}$) on the left and block B ($' + m2 + '\\ \\text{kg}$) on the right. You push A to the right with $' + F + '\\ \\text{N}$. ' + (shape === 'push-a' ? 'What is their acceleration?' : 'How hard does A push on B?'),
        a: A(shape === 'push-a' ? a : c), unit: shape === 'push-a' ? 'm/s²' : 'N',
        viz: { name: 'ph-dynamics', opts: { scene: 'push-two', m1: m1, m2: m2, F: F, interactive: false, quiet: true } },
        steps: ['System = both blocks: the push between them is internal, so $a = \\dfrac{F}{m_A + m_B} = \\dfrac{' + F + '}{' + (m1 + m2) + '} = ' + qu(a, 'm/s2', 4) + '$.'].concat(shape === 'push-c' ? ['System = block B alone: the only horizontal force on it is A\'s push, which must give B that acceleration.', '$F_{AB} = m_B a = ' + m2 + ' \\times ' + tn(a, 4) + ' = ' + qu(c, 'N') + '$, less than your $' + F + '\\ \\text{N}$.'] : []),
        hint: shape === 'push-a' ? 'Treat both blocks as one system.' : 'Find a for the pair, then look at block B alone.', d: { k: shape, m1: m1, m2: m2, F: F }
      };
    }
    if (shape === 'train-a' || shape === 'train-t') {
      var a2 = F / (m1 + m2), T0 = m2 * a2;
      return {
        q: 'On a frictionless track, you pull cart 1 ($' + m1 + '\\ \\text{kg}$) forward with $' + F + '\\ \\text{N}$. A light rope connects it to cart 2 ($' + m2 + '\\ \\text{kg}$) behind it. ' + (shape === 'train-a' ? 'What is the acceleration of the carts?' : 'What is the tension in the rope between the carts?'),
        a: A(shape === 'train-a' ? a2 : T0), unit: shape === 'train-a' ? 'm/s²' : 'N',
        viz: { name: 'ph-dynamics', opts: { scene: 'train', m1: m1, m2: m2, F: F, interactive: false, quiet: true } },
        steps: ['Whole system (both carts): $a = \\dfrac{F}{m_1 + m_2} = \\dfrac{' + F + '}{' + (m1 + m2) + '} = ' + qu(a2, 'm/s2', 4) + '$.'].concat(shape === 'train-t' ? ['Cart 2 alone: the only horizontal force on it is the rope, so $T = m_2 a = ' + m2 + ' \\times ' + tn(a2, 4) + ' = ' + qu(T0, 'N') + '$.', 'The tension is less than your pull: the rope only has to accelerate cart 2.'] : []),
        hint: 'Treat both carts as one system first.', d: { k: shape, m1: m1, m2: m2, F: F }
      };
    }
    if (shape === 'three') {
      var m3 = R.int(2, 10), a3 = F * 2 / (m1 + m2 + m3), T12 = (m2 + m3) * a3, F2 = F * 2;
      return {
        q: 'Three carts are linked by light ropes on a frictionless track: $' + m1 + '\\ \\text{kg}$ in front, then $' + m2 + '\\ \\text{kg}$, then $' + m3 + '\\ \\text{kg}$. You pull the front cart with $' + F2 + '\\ \\text{N}$. What is the tension in the rope between the first and second carts?',
        a: A(T12), unit: 'N',
        viz: { name: 'ph-dynamics', opts: { scene: 'train', m1: m1, m2: m2, m3: m3, F: F2, interactive: false, quiet: true } },
        steps: ['Whole train: $a = \\dfrac{' + F2 + '}{' + (m1 + m2 + m3) + '} = ' + tn(a3, 4) + '\\ \\text{m/s}^2$.', 'That rope pulls the last two carts together: system = carts 2 and 3, mass $' + (m2 + m3) + '\\ \\text{kg}$.', '$T = ' + (m2 + m3) + ' \\times ' + tn(a3, 4) + ' = ' + qu(T12, 'N') + '$.'],
        hint: 'Choose the system so the rope you want is the only horizontal force on it.', d: { k: 'three', ms: [m1, m2, m3], F: F2 }
      };
    }
    if (shape === 'table') {
      var mt = R.int(2, 10), mh = R.int(1, 6), at = mh * g / (mt + mh), Tt = mt * at, askT = R.coin();
      return {
        q: art(mt, 'A') + ' $' + mt + '\\ \\text{kg}$ block on a frictionless table is tied by a light string over a light pulley to ' + art(mh, 'a') + ' $' + mh + '\\ \\text{kg}$ block hanging over the edge. ' + (askT ? 'What is the tension in the string?' : 'What is the acceleration of the blocks?'),
        a: A(askT ? Tt : at), unit: askT ? 'N' : 'm/s²',
        viz: { name: 'ph-dynamics', opts: { scene: 'table', m1: mt, m2: mh, muk: 0, mus: 0, interactive: false, quiet: true } },
        steps: ['System = both blocks, measured along the string: the only unbalanced force is the hanging block\'s weight, $' + mh + ' \\times 9.8 = ' + tv(mh * g) + '\\ \\text{N}$.', '$a = \\dfrac{' + tv(mh * g) + '}{' + (mt + mh) + '} = ' + qu(at, 'm/s2', 4) + '$.'].concat(askT ? ['The table block alone: the string is its only horizontal force, so $T = ' + mt + ' \\times ' + tn(at, 4) + ' = ' + qu(Tt, 'N') + '$, less than the hanging weight.'] : []),
        hint: 'The whole system is pulled by the hanging weight and has the mass of both blocks.', d: { k: askT ? 'tableT' : 'tableA', m1: mt, m2: mh }
      };
    }
    return {
      q: 'You pull a wagon with $' + F + '\\ \\text{N}$; a rope from the wagon pulls a sled behind it, and the ground is frictionless. How does the tension in that rope compare with $' + F + '\\ \\text{N}$?',
      a: MC('It is less than ' + F + ' N.', ['It equals ' + F + ' N.', 'It is more than ' + F + ' N.', 'It is zero.']),
      viz: { name: 'ph-dynamics', opts: { scene: 'train', m1: 3, m2: 2, F: F, interactive: false, quiet: true } },
      steps: ['Your pull accelerates both the wagon and the sled.', 'The rope only has to accelerate the sled, which is part of the total mass: $T = m_{sled}\\,a = \\dfrac{m_{sled}}{m_{total}}F$.', 'So the tension is less than your pull.'],
      hint: 'What does the rope have to accelerate?', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.pulley-systems
  G('phys1.pulley-systems', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['atw-a', 'atw-a']), R.pick(['atw-a', 'atw-t', 'mc', 'fric-a']), R.pick(['atw-t', 'fric-a', 'fric-t', 'speed']));
    var m1 = R.int(1, 8), m2 = m1 + R.int(1, 6);
    if (shape.indexOf('atw') === 0 || shape === 'speed' || shape === 'mc') {
      var a = (m2 - m1) * g / (m1 + m2), T0 = 2 * m1 * m2 * g / (m1 + m2), viz = { name: 'ph-dynamics', opts: { scene: 'atwood', m1: m1, m2: m2, interactive: false, quiet: true } };
      var base = ['System = both blocks. Along the string, the heavier block\'s weight pulls one way and the lighter one\'s the other: net $= (' + m2 + ' - ' + m1 + ')(9.8) = ' + tv((m2 - m1) * g) + '\\ \\text{N}$.', '$a = \\dfrac{(m_2 - m_1)g}{m_1 + m_2} = \\dfrac{' + tv((m2 - m1) * g) + '}{' + (m1 + m2) + '} = ' + qu(a, 'm/s2', 4) + '$.'];
      if (shape === 'mc') return {
        q: 'An Atwood machine: ' + art(m1, 'a') + ' $' + m1 + '\\ \\text{kg}$ block and ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ block hang from a light string over a light, frictionless pulley. While they move, how does the tension compare with the two weights?',
        a: MC('Between the two weights: more than ' + tv(m1 * g) + ' N, less than ' + tv(m2 * g) + ' N', ['Equal to the heavier weight, ' + tv(m2 * g) + ' N', 'Equal to the lighter weight, ' + tv(m1 * g) + ' N', 'Equal to the sum of the weights, ' + tv((m1 + m2) * g) + ' N']),
        viz: viz,
        steps: ['The heavy block accelerates downward, so the string must pull up on it with less than its weight.', 'The light block accelerates upward, so the string must pull up on it with more than its weight.', 'One string, one tension: it lies between the two weights. (Here $T = ' + qu(T0, 'N') + '$.)'],
        hint: 'Which way does each block accelerate? Compare T with each block\'s weight.', d: { k: 'mc', m1: m1, m2: m2 }
      };
      if (shape === 'atw-a') return { q: 'An Atwood machine: ' + art(m1, 'a') + ' $' + m1 + '\\ \\text{kg}$ block and ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ block hang from a light string over a light, frictionless pulley. Released from rest, what is the size of their acceleration?', a: A(a), unit: 'm/s²', viz: viz, steps: base, hint: 'Net force along the string divided by the total mass.', d: { k: 'atwA', m1: m1, m2: m2 } };
      if (shape === 'atw-t') return { q: 'An Atwood machine: ' + art(m1, 'a') + ' $' + m1 + '\\ \\text{kg}$ block and ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ block hang from a light string over a light, frictionless pulley. While they move, what is the tension in the string?', a: A(T0), unit: 'N', viz: viz, steps: base.concat(['Lighter block alone (accelerating up): $T - m_1g = m_1a$, so $T = ' + m1 + '(9.8 + ' + tn(a, 4) + ') = ' + qu(T0, 'N') + '$.', 'Check with the heavier block: $m_2g - T = ' + tv(m2 * g) + ' - ' + tn(T0, 4) + ' = ' + tn(m2 * a, 4) + ' = m_2a$. ✓']), hint: 'Find a first, then write Newton\'s second law for one block.', d: { k: 'atwT', m1: m1, m2: m2 } };
      var h = R.int(1, 4) * 0.5, v = sqrt(2 * a * h);
      return { q: 'An Atwood machine: ' + art(m1, 'a') + ' $' + m1 + '\\ \\text{kg}$ block and ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ block hang from a light string over a light, frictionless pulley. Released from rest, how fast is the heavier block moving after it has fallen $' + tv(h) + '\\ \\text{m}$?', a: A(v), unit: 'm/s', viz: viz, steps: base.concat(['From rest with constant $a$: $v = \\sqrt{2ah} = \\sqrt{2(' + tn(a, 4) + ')(' + tv(h) + ')} = ' + qu(v, 'm/s') + '$.']), hint: 'Find the acceleration, then use v² = 2ah.', d: { k: 'atwV', m1: m1, m2: m2, h: h } };
    }
    var mt = R.int(3, 12), mh = R.int(2, 8), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.12]);
    if (mh <= mu * mt + 0.5) mh = Math.ceil(mu * mt) + 2;
    var af = (mh - mu * mt) * g / (mt + mh), Tf = mh * (g - af);
    return {
      q: art(mt, 'A') + ' $' + mt + '\\ \\text{kg}$ block on a table ($\\mu_k = ' + mu + '$) is tied by a light string over a light pulley to ' + art(mh, 'a') + ' $' + mh + '\\ \\text{kg}$ hanging block, and the system is moving. ' + (shape === 'fric-a' ? 'What is the acceleration?' : 'What is the tension in the string?'),
      a: A(shape === 'fric-a' ? af : Tf), unit: shape === 'fric-a' ? 'm/s²' : 'N',
      viz: { name: 'ph-dynamics', opts: { scene: 'table', m1: mt, m2: mh, muk: mu, mus: mu, interactive: false, quiet: true } },
      steps: ['Along the string: the hanging weight $' + tv(mh * g) + '\\ \\text{N}$ pulls forward, friction on the table block $\\mu_k m_1 g = ' + tv(mu * mt * g) + '\\ \\text{N}$ holds back.', '$a = \\dfrac{' + tv(mh * g) + ' - ' + tv(mu * mt * g) + '}{' + (mt + mh) + '} = ' + qu(af, 'm/s2', 4) + '$.'].concat(shape === 'fric-t' ? ['Hanging block alone: $m_2g - T = m_2a$, so $T = ' + mh + '(9.8 - ' + tn(af, 4) + ') = ' + qu(Tf, 'N') + '$, less than its weight because it accelerates downward.'] : []),
      hint: 'Net force along the string: the hanging weight minus friction.', d: { k: shape === 'fric-a' ? 'fricA' : 'fricT', m1: mt, m2: mh, mu: mu }
    };
  }));

  // ---------- phys1.spring-force
  G('phys1.spring-force', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['F', 'k']), R.pick(['len', 'hang', 'F', 'k']), R.pick(['len', 'two', 'hang']));
    var k = R.int(4, 60) * 10, xc = R.int(2, 15), x = xc / 100;
    if (shape === 'F') return {
      q: 'A spring with spring constant $k = ' + k + '\\ \\text{N/m}$ is stretched $' + xc + '\\ \\text{cm}$ from its natural length. How hard does it pull back?',
      a: A(k * x), unit: 'N',
      viz: { name: 'ph-graph', opts: { fn: k + '*x', domain: [0, sg(x * 1.6, 2)], xlab: 'x', xunit: 'm', ylab: 'F', yunit: 'N', tool: 'none', interactive: false, quiet: true } },
      steps: ['Convert the stretch to meters: $' + xc + '\\ \\text{cm} = ' + tv(x) + '\\ \\text{m}$.', 'Hooke\'s law: $F = kx = ' + k + ' \\times ' + tv(x) + ' = ' + qu(k * x, 'N') + '$.'],
      hint: 'F = kx with x in meters.', d: { k: 'F', kk: k, x: x }
    };
    if (shape === 'k') { var F = R.int(2, 30); return {
      q: 'Hanging spring scales use Hooke\'s law. A force of $' + F + '\\ \\text{N}$ stretches a spring by $' + xc + '\\ \\text{cm}$. What is its spring constant?',
      a: A(F / x), unit: 'N/m',
      steps: ['$x = ' + xc + '\\ \\text{cm} = ' + tv(x) + '\\ \\text{m}$.', '$k = \\dfrac{F}{x} = \\dfrac{' + F + '}{' + tv(x) + '} = ' + qu(F / x, 'N/m') + '$.'],
      hint: 'k = F/x, with x in meters.', d: { k: 'k', F: F, x: x }
    }; }
    if (shape === 'len') { var L0 = R.int(10, 30), L = L0 + xc; return {
      q: 'A spring is $' + L0 + '\\ \\text{cm}$ long when relaxed and has $k = ' + k + '\\ \\text{N/m}$. You stretch it until it is $' + L + '\\ \\text{cm}$ long. How hard does it pull on your hand?',
      a: A(k * x), unit: 'N',
      steps: ['Hooke\'s law uses the stretch, not the total length: $x = ' + L + ' - ' + L0 + ' = ' + xc + '\\ \\text{cm} = ' + tv(x) + '\\ \\text{m}$.', '$F = kx = ' + k + ' \\times ' + tv(x) + ' = ' + qu(k * x, 'N') + '$.'],
      hint: 'How far is it stretched from its relaxed length?', d: { k: 'len', kk: k, L0: L0, L: L }
    }; }
    if (shape === 'hang') { var m = R.int(1, 20) * 0.1 * (k > 200 ? 5 : 1); m = fx(m); var xs = m * g / k; return {
      q: 'You hang ' + art(tv(m), 'a') + ' $' + tv(m) + '\\ \\text{kg}$ mass from a spring with $k = ' + k + '\\ \\text{N/m}$ and let it settle at rest. How far does the spring stretch? Give your answer in centimeters.',
      a: A(xs * 100), unit: 'cm',
      viz: { name: 'ph-oscillator', opts: { type: 'vertical-spring', m: m, k: k, A: 0, interactive: false, quiet: true } },
      steps: ['At rest the spring force balances the weight: $kx = mg$.', '$x = \\dfrac{mg}{k} = \\dfrac{(' + tv(m) + ')(9.8)}{' + k + '} = ' + tn(xs, 3) + '\\ \\text{m} = ' + qu(xs * 100, 'cm') + '$.'],
      hint: 'At rest, kx = mg.', d: { k: 'hang', m: m, kk: k }
    }; }
    var F1 = R.int(1, 5) * 2, dF = R.int(2, 8) * 2, L1 = R.int(12, 25), dL = R.pick([2, 4, 5, 8, 10]), kk = dF / (dL / 100);
    return {
      q: 'A spring is $' + L1 + '\\ \\text{cm}$ long when it holds up ' + art(F1, 'a') + ' $' + F1 + '\\ \\text{N}$ weight, and $' + (L1 + dL) + '\\ \\text{cm}$ long when it holds up $' + (F1 + dF) + '\\ \\text{N}$. What is its spring constant?',
      a: A(kk), unit: 'N/m',
      steps: ['The extra force stretches it the extra length: $\\Delta F = ' + dF + '\\ \\text{N}$, $\\Delta x = ' + dL + '\\ \\text{cm} = ' + tv(dL / 100) + '\\ \\text{m}$.', '$k = \\dfrac{\\Delta F}{\\Delta x} = \\dfrac{' + dF + '}{' + tv(dL / 100) + '} = ' + qu(kk, 'N/m') + '$.', 'Neither length is the stretch from the relaxed length, so $k = F/L$ would be wrong.'],
      hint: 'Use the change in force and the change in length.', d: { k: 'two', dF: dF, dL: dL / 100 }
    };
  }));

  // ---------- phys1.gravitational-force
  G('phys1.gravitational-force', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['ratio', 'sat', 'pair']), R.pick(['sat', 'pair', 'moon', 'ratio', 'ratio2']), R.pick(['sat', 'findr', 'ratio2']));
    if (shape === 'ratio' || shape === 'ratio2') {
      var kd = R.pick([2, 3, 4, 5, 10, 0.5]), km = shape === 'ratio2' ? R.pick([2, 3, 4, 6, 8, 9]) : 1, fac = km / (kd * kd);
      var txt = (km > 1 ? 'one of the masses is made ' + km + ' times as large and ' : '') + 'the distance between the centers is ' + (kd === 0.5 ? 'cut in half' : 'made ' + kd + ' times as large');
      return {
        q: 'Two objects attract each other with a gravitational force $F$. If ' + txt + ', the force becomes how many times $F$?',
        a: { t: 'num', v: ML.Q(km * 4, Math.round(kd * kd * 4)).toPlain(), rtol: 0.01 },
        steps: ['$F = \\dfrac{Gm_1m_2}{r^2}$: the force is proportional to each mass and to $1/r^2$.', (km > 1 ? 'Mass factor: $\\times ' + km + '$. ' : '') + 'Distance factor: $r \\to ' + tv(kd) + 'r$ multiplies $F$ by $\\dfrac{1}{' + tv(kd) + '^2} = ' + (kd === 0.5 ? '4' : '\\dfrac{1}{' + kd * kd + '}') + '$.', 'Together: $' + (Number.isInteger(fac) ? fac : T.frac(km, kd * kd)) + '$ times $F$.'],
        hint: 'Square the distance factor and put it in the denominator.', d: { k: 'ratio', km: km, kd: kd }
      };
    }
    if (shape === 'pair') {
      var m1 = R.int(30, 100), m2 = R.int(30, 100), r = R.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), F = GRAV * m1 * m2 / (r * r);
      return {
        q: 'Two students, $' + m1 + '\\ \\text{kg}$ and $' + m2 + '\\ \\text{kg}$, stand $' + tv(r) + '\\ \\text{m}$ apart (center to center). What is the gravitational force between them? ($G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)',
        a: A(F), unit: 'N',
        steps: ['$F = \\dfrac{Gm_1m_2}{r^2} = \\dfrac{(6.674 \\times 10^{-11})(' + m1 + ')(' + m2 + ')}{' + tv(r) + '^2}$.', '$F = ' + qu(F, 'N') + '$: far too small to notice, because $G$ is tiny. Gravity is only strong when one mass is huge, like a planet.'],
        hint: 'F = Gm₁m₂/r².', d: { k: 'F', m1: m1, m2: m2, r: r }
      };
    }
    if (shape === 'moon') {
      var Fm = GRAV * ME * 7.35e22 / Math.pow(3.84e8, 2);
      return {
        q: 'Earth ($5.972 \\times 10^{24}\\ \\text{kg}$) and the Moon ($7.35 \\times 10^{22}\\ \\text{kg}$) are $3.84 \\times 10^{8}\\ \\text{m}$ apart, center to center. What is the gravitational force between them? ($G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)',
        a: A(Fm), unit: 'N',
        steps: ['$F = \\dfrac{GM_Em_M}{r^2} = \\dfrac{(6.674 \\times 10^{-11})(5.972 \\times 10^{24})(7.35 \\times 10^{22})}{(3.84 \\times 10^{8})^2}$.', 'Top: $' + tn(GRAV * ME * 7.35e22) + '$. Bottom: $' + tn(3.84e8 * 3.84e8) + '$.', '$F = ' + qu(Fm, 'N') + '$. The Moon pulls on Earth with exactly the same size force.'],
        hint: 'Multiply the top in scientific notation, square the distance, then divide.', d: { k: 'F', m1: ME, m2: 7.35e22, r: 3.84e8 }
      };
    }
    if (shape === 'sat') {
      var ms = R.int(2, 60) * 50, hk = R.int(3, 400) * 100, rr = RE + hk * 1000, Fs = GRAV * ME * ms / (rr * rr);
      return {
        q: art(T.commas(ms), 'A') + ' $' + T.commas(ms) + '\\ \\text{kg}$ satellite orbits $' + T.commas(hk) + '\\ \\text{km}$ above Earth\'s surface. What gravitational force does Earth exert on it? (Earth: $M = 5.972 \\times 10^{24}\\ \\text{kg}$, $R = 6.371 \\times 10^{6}\\ \\text{m}$; $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)',
        a: A(Fs), unit: 'N',
        viz: { name: 'ph-orbit', opts: { mode: 'field', interactive: false, quiet: true } },
        steps: ['$r$ is measured from Earth\'s <b>center</b>: $r = R + h = 6.371 \\times 10^{6} + ' + tn(hk * 1000, 4) + ' = ' + tn(rr, 4) + '\\ \\text{m}$.', '$F = \\dfrac{GMm}{r^2} = \\dfrac{(6.674 \\times 10^{-11})(5.972 \\times 10^{24})(' + ms + ')}{(' + tn(rr, 4) + ')^2} = ' + qu(Fs, 'N') + '$.', 'For comparison, its weight on the ground would be $mg = ' + tn(ms * g) + '\\ \\text{N}$.'],
        hint: 'Add Earth\'s radius to the altitude before you square.', d: { k: 'F', m1: ME, m2: ms, r: rr }
      };
    }
    var ma = R.int(1, 20) * 50, mb = R.int(1, 20) * 50, Ft = R.pick([0.5, 1, 1.5, 2, 3, 5]) * 1e-7, rf = sqrt(GRAV * ma * mb / Ft);
    return {
      q: 'Two lead spheres of mass $' + ma + '\\ \\text{kg}$ and $' + mb + '\\ \\text{kg}$ attract each other with a force of $' + tn(Ft) + '\\ \\text{N}$. How far apart are their centers? ($G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)',
      a: A(rf), unit: 'm',
      steps: ['Solve $F = \\dfrac{Gm_1m_2}{r^2}$ for $r$: $r = \\sqrt{\\dfrac{Gm_1m_2}{F}}$.', '$r = \\sqrt{\\dfrac{(6.674 \\times 10^{-11})(' + ma + ')(' + mb + ')}{' + tn(Ft) + '}} = ' + qu(rf, 'm') + '$.'],
      hint: 'Rearrange for r², then take the square root.', d: { k: 'r', m1: ma, m2: mb, F: Ft }
    };
  }));

  // ---------- phys1.gravitational-field
  var PLANETS = [['Mars', 6.42e23, 3.39e6], ['Venus', 4.87e24, 6.05e6], ['Mercury', 3.30e23, 2.44e6], ['the Moon', 7.35e22, 1.737e6], ['Jupiter', 1.898e27, 6.99e7], ['Saturn', 5.683e26, 5.823e7], ['Uranus', 8.681e25, 2.536e7], ['Neptune', 1.024e26, 2.462e7], ['Ganymede', 1.482e23, 2.634e6], ['Titan', 1.345e23, 2.575e6], ['Europa', 4.80e22, 1.561e6], ['Io', 8.93e22, 1.822e6], ['Callisto', 1.076e23, 2.410e6]];
  G('phys1.gravitational-field', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['alt', 'scale', 'planet']), R.pick(['alt', 'planet', 'scale', 'weight', 'mc']), R.pick(['weight', 'scale', 'alt', 'planet']));
    if (shape === 'alt' || shape === 'weight') {
      var hk = R.pick([400, 6371, 20200, 35786, R.int(2, 99) * 100, R.int(2, 99) * 100, R.int(10, 400) * 100, R.int(10, 400) * 100]), r = RE + hk * 1000, gg = GRAV * ME / (r * r), m = R.int(50, 900);
      return {
        q: (shape === 'weight' ? 'What is the gravitational force on ' + art(m, 'a') + ' $' + m + '\\ \\text{kg}$ probe' : 'What is the gravitational field strength $g$') + ' at $' + T.commas(hk) + '\\ \\text{km}$ above Earth\'s surface? (Earth: $M = 5.972 \\times 10^{24}\\ \\text{kg}$, $R = 6.371 \\times 10^{6}\\ \\text{m}$; $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)',
        a: A(shape === 'weight' ? m * gg : gg), unit: shape === 'weight' ? 'N' : 'm/s²',
        viz: { name: 'ph-orbit', opts: { mode: 'field', interactive: false, quiet: true } },
        steps: ['Distance from Earth\'s center: $r = R + h = ' + tn(r, 4) + '\\ \\text{m}$.', '$g = \\dfrac{GM}{r^2} = \\dfrac{(6.674 \\times 10^{-11})(5.972 \\times 10^{24})}{(' + tn(r, 4) + ')^2} = ' + qu(gg, 'm/s2') + '$' + (shape === 'weight' ? '.' : ', not zero: gravity reaches far out into space.')].concat(shape === 'weight' ? ['Force: $mg = ' + m + ' \\times ' + tn(gg, 4) + ' = ' + qu(m * gg, 'N') + '$.'] : []),
        hint: 'g = GM/r², with r measured from Earth\'s center.', d: { k: shape, h: hk * 1000, m: m }
      };
    }
    if (shape === 'scale') {
      var fm = R.pick([2, 3, 4, 5, 6, 8, 10, 0.5, 0.25, 0.1, 1.5]), fr = R.pick([2, 0.5, 3, 1.5, 4, 2.5, 0.8, 1.2]), gp = g * fm / (fr * fr);
      if (fm === fr) fr = fr === 2 ? 3 : 2, gp = g * fm / (fr * fr);
      return {
        q: 'A planet has ' + tv(fm) + ' times Earth\'s mass and ' + tv(fr) + ' times Earth\'s radius. What is $g$ at its surface? (On Earth, $g = 9.8\\ \\text{m/s}^2$.)',
        a: A(gp), unit: 'm/s²',
        steps: ['$g = \\dfrac{GM}{R^2}$: proportional to the mass, and to $1/R^2$.', '$g_{planet} = 9.8 \\times \\dfrac{' + tv(fm) + '}{' + tv(fr) + '^2} = 9.8 \\times ' + tn(fm / (fr * fr), 4) + ' = ' + qu(gp, 'm/s2') + '$.'],
        hint: 'Multiply 9.8 by the mass factor, divide by the radius factor squared.', d: { k: 'scale', fm: fm, fr: fr }
      };
    }
    if (shape === 'planet') {
      var P = R.pick(PLANETS), gpl = GRAV * P[1] / (P[2] * P[2]), wl = R.coin() ? R.int(4, 180) * 5 : 0;
      if (wl) return {
        q: 'What is the gravitational force (the weight) on ' + art(wl, 'a') + ' $' + wl + '\\ \\text{kg}$ lander resting on ' + P[0] + '? (Mass of ' + P[0] + ': $' + tn(P[1], 4) + '\\ \\text{kg}$; radius: $' + tn(P[2], 4) + '\\ \\text{m}$.) Use $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$.',
        a: A(wl * gpl), unit: 'N',
        steps: ['$g = \\dfrac{GM}{R^2} = \\dfrac{(6.674 \\times 10^{-11})(' + tn(P[1], 4) + ')}{(' + tn(P[2], 4) + ')^2} = ' + qu(gpl, 'm/s2') + '$.', '$F = mg = (' + wl + ')(' + tn(gpl, 3) + ') = ' + qu(wl * gpl, 'N') + '$.'],
        hint: 'Find g = GM/R² there, then multiply by the mass.', d: { k: 'planetW', M: P[1], R: P[2], m: wl }
      };
      return {
        q: 'Find the gravitational field strength at the surface of ' + P[0] + ' (mass $' + tn(P[1], 4) + '\\ \\text{kg}$, radius $' + tn(P[2], 4) + '\\ \\text{m}$). Use $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$.',
        a: A(gpl), unit: 'm/s²',
        steps: ['$g = \\dfrac{GM}{R^2} = \\dfrac{(6.674 \\times 10^{-11})(' + tn(P[1], 4) + ')}{(' + tn(P[2], 4) + ')^2}$.', '$g = ' + qu(gpl, 'm/s2') + '$, which is the force in newtons on each kilogram there.'],
        hint: 'g = GM/R².', d: { k: 'planet', M: P[1], R: P[2] }
      };
    }
    var g400 = GRAV * ME / Math.pow(RE + 4e5, 2);
    return {
      q: 'Astronauts on the International Space Station, about $400\\ \\text{km}$ up, float around the cabin. Why?',
      a: MC('Gravity there is still about ' + Math.round(g400 / g * 100) + '% as strong as on the ground; they and the station are falling together around Earth.', ['There is no gravity in space.', 'Gravity there is too weak to notice.', 'The air inside the station holds them up.']),
      viz: { name: 'ph-orbit', opts: { mode: 'cannon', v0: 7.7, interactive: false, quiet: true } },
      steps: ['At $400\\ \\text{km}$, $r = 6.771 \\times 10^{6}\\ \\text{m}$, so $g = \\dfrac{GM}{r^2} \\approx ' + tn(g400) + '\\ \\text{m/s}^2$, about ' + Math.round(g400 / g * 100) + '% of $9.8$.', 'The station and everyone inside are in free fall, moving sideways fast enough that they keep falling around Earth instead of into it.', 'Falling together, nothing presses them against the floor, so they float.'],
      hint: 'Work out g at 400 km. Is it close to zero?', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.centripetal-acceleration
  G('phys1.centripetal-acceleration', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['a', 'a']), R.pick(['a', 'v', 'period', 'dir']), R.pick(['period', 'ratio', 'v']));
    var v = R.int(3, 30), r = R.pick([2, 5, 8, 10, 20, 25, 40, 50, 80, 100]);
    var C = R.pick([['A car drives around a circular track', 'track'], ['A runner jogs around a curve', 'curve'], ['A cyclist rounds a circular bend', 'bend'], ['A toy train runs around a circular loop of track', 'loop']]);
    var viz = { name: 'ph-circular', opts: { mode: 'uniform', v: Math.min(v, 20), r: Math.min(r, 10), interactive: false, quiet: true } };
    if (shape === 'a') return {
      q: C[0] + ' of radius $' + r + '\\ \\text{m}$ at a steady $' + v + '\\ \\text{m/s}$. What is the size of its acceleration?',
      a: A(v * v / r), unit: 'm/s²', viz: viz,
      steps: ['Steady speed on a circle still means accelerating: the direction of the velocity keeps turning, toward the center.', '$a_c = \\dfrac{v^2}{r} = \\dfrac{' + v + '^2}{' + r + '} = ' + qu(v * v / r, 'm/s2') + '$, pointing toward the center.'],
      hint: 'a = v²/r.', d: { k: 'a', v: v, r: r }
    };
    if (shape === 'v') { var ac = R.pick([2, 3, 4, 5, 6, 8, 10]); return {
      q: 'A car rounds a curve of radius $' + r + '\\ \\text{m}$ with a centripetal acceleration of $' + ac + '\\ \\text{m/s}^2$. How fast is it going?',
      a: A(sqrt(ac * r)), unit: 'm/s',
      steps: ['$a_c = \\dfrac{v^2}{r}$, so $v = \\sqrt{a_c r}$.', '$v = \\sqrt{' + ac + ' \\times ' + r + '} = ' + qu(sqrt(ac * r), 'm/s') + '$.'],
      hint: 'Solve a = v²/r for v.', d: { k: 'v', a: ac, r: r }
    }; }
    if (shape === 'period') { var Tp = R.pick([2, 4, 5, 8, 10, 20, 30, 60]), rp = R.pick([0.5, 1, 2, 5, 10, 25]), vp = 2 * PI * rp / Tp; return {
      q: 'A carousel horse $' + tv(rp) + '\\ \\text{m}$ from the center goes around once every $' + Tp + '\\ \\text{s}$. What is its centripetal acceleration?',
      a: A(vp * vp / rp), unit: 'm/s²',
      steps: ['Speed: one circumference per period, $v = \\dfrac{2\\pi r}{T} = \\dfrac{2\\pi(' + tv(rp) + ')}{' + Tp + '} = ' + tn(vp, 4) + '\\ \\text{m/s}$.', '$a_c = \\dfrac{v^2}{r} = \\dfrac{' + tn(vp, 4) + '^2}{' + tv(rp) + '} = ' + qu(vp * vp / rp, 'm/s2') + '$.'],
      hint: 'Find the speed from the circumference and the period first.', d: { k: 'period', T: Tp, r: rp }
    }; }
    if (shape === 'ratio') { var kv = R.pick([2, 3, 0.5]), kr = R.pick([1, 2, 0.5]), f = kv * kv / kr; return {
      q: 'A car takes a circular curve at steady speed. If it ' + (kv === 0.5 ? 'goes half as fast' : 'goes ' + kv + ' times as fast') + (kr === 1 ? ' on the same curve' : ' on a curve with ' + (kr === 2 ? 'twice' : 'half') + ' the radius') + ', its centripetal acceleration becomes how many times as large?',
      a: { t: 'num', v: sv(f, 4), rtol: 0.01 },
      steps: ['$a_c = \\dfrac{v^2}{r}$: speed counts squared, radius counts once, in the denominator.', 'Factor: $\\dfrac{' + tv(kv) + '^2}{' + tv(kr) + '} = ' + tv(f) + '$.'],
      hint: 'Square the speed factor, then divide by the radius factor.', d: { k: 'ratio', kv: kv, kr: kr }
    }; }
    return {
      q: 'A ball on a string moves in a horizontal circle at a steady speed. Which way does its acceleration point?',
      a: MC('Toward the center of the circle', ['Along the direction of motion (tangent)', 'Outward, away from the center', 'There is no acceleration at steady speed']),
      viz: { name: 'ph-circular', opts: { mode: 'uniform', v: 4, r: 2, interactive: false, quiet: true, tags: { v: 'v' } } },
      steps: ['Acceleration is the change in velocity per time. At steady speed the size of $\\vec{v}$ stays the same, but its direction keeps turning.', 'Subtract two nearby velocity arrows: the change points toward the center.', 'So the acceleration points toward the center, with size $v^2/r$.'],
      hint: 'How is the velocity changing: its size or its direction?', d: { k: 'dir' }
    };
  }));

  // ---------- phys1.centripetal-force
  G('phys1.centripetal-force', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['tension', 'force']), R.pick(['flat', 'mu', 'cut', 'source', 'tension']), R.pick(['flat', 'mu', 'cut', 'source']));
    if (shape === 'tension' || shape === 'force') {
      var m = R.pick([0.2, 0.25, 0.5, 1, 1.5, 2]), v = R.int(2, 9), r = R.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), F = m * v * v / r;
      var isT = shape === 'tension';
      return {
        q: isT ? art(tv(m), 'A') + ' $' + tv(m) + '\\ \\text{kg}$ puck on frictionless ice is tied to a post by a string $' + tv(r) + '\\ \\text{m}$ long and slides in a circle at $' + v + '\\ \\text{m/s}$. What is the tension in the string?' : 'What net inward force is needed to keep ' + art(tv(m), 'a') + ' $' + tv(m) + '\\ \\text{kg}$ ball moving at $' + v + '\\ \\text{m/s}$ in a horizontal circle of radius $' + tv(r) + '\\ \\text{m}$?',
        a: A(F), unit: 'N',
        viz: { name: 'ph-circular', opts: { mode: 'uniform', v: v, r: Math.max(1, r), m: m, interactive: false, quiet: true } },
        steps: ['Moving in a circle needs a net force toward the center of $F = \\dfrac{mv^2}{r}$.' + (isT ? ' On level ice, the string\'s tension is the only horizontal force, so it supplies all of it.' : ''), '$F = \\dfrac{(' + tv(m) + ')(' + v + ')^2}{' + tv(r) + '} = ' + qu(F, 'N') + '$.'],
        hint: 'F = mv²/r.', d: { k: 'F', m: m, v: v, r: r }
      };
    }
    var r2 = R.pick([20, 30, 40, 50, 60, 80, 100, 150]), mu = R.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
    if (shape === 'flat') return {
      q: 'A car rounds a flat (unbanked) curve of radius $' + r2 + '\\ \\text{m}$. The coefficient of static friction between the tires and the road is $' + mu + '$. What is the highest speed at which it can take the curve without skidding?',
      a: A(sqrt(mu * g * r2)), unit: 'm/s',
      viz: { name: 'ph-circular', opts: { mode: 'flat-curve', r: r2, v: sg(sqrt(mu * g * r2) * 0.8, 2), mu: mu, interactive: false, quiet: true } },
      steps: ['On a flat curve, static friction from the road is the only inward force.', 'At the top speed it is at its limit: $\\mu_s mg = \\dfrac{mv^2}{r}$. The mass cancels.', '$v = \\sqrt{\\mu_s g r} = \\sqrt{' + mu + ' \\times 9.8 \\times ' + r2 + '} = ' + qu(sqrt(mu * g * r2), 'm/s') + '$.'],
      hint: 'Set the largest static friction equal to mv²/r.', d: { k: 'flat', mu: mu, r: r2 }
    };
    if (shape === 'mu') { var vv = R.int(8, 25), need = vv * vv / (g * r2); if (need > 1.2) { vv = Math.floor(sqrt(0.9 * g * r2)); need = vv * vv / (g * r2); } return {
      q: 'A car takes a flat curve of radius $' + r2 + '\\ \\text{m}$ at $' + vv + '\\ \\text{m/s}$. What is the smallest coefficient of static friction that keeps it from skidding?',
      a: A(need),
      steps: ['Friction must supply $\\dfrac{mv^2}{r}$, and it can supply at most $\\mu_s mg$.', '$\\mu_s \\ge \\dfrac{v^2}{gr} = \\dfrac{' + vv + '^2}{9.8 \\times ' + r2 + '} = ' + tn(need) + '$.'],
      hint: 'Set μ_s mg = mv²/r and solve for μ_s.', d: { k: 'mu', v: vv, r: r2 }
    }; }
    if (shape === 'cut') return {
      q: 'You whirl a ball on a string in a horizontal circle over your head. At the instant the ball is at the point shown, the string breaks. Seen from above, what path does the ball follow?',
      a: MC('A straight line along the tangent, the direction it was moving', ['Straight outward, away from the center', 'It keeps curving around the circle for a while', 'A spiral outward']),
      viz: { name: 'ph-circular', opts: { mode: 'cut', v: 4, r: 2, interactive: false, quiet: true, hide: ['a'] } },
      steps: ['Once the string breaks, no horizontal force acts on the ball.', 'With no net force, it keeps the velocity it had at that instant (the first law), and that velocity was along the tangent.', 'There is no outward "centrifugal" force pushing it away; it simply stops being pulled inward. (Gravity also pulls it down as it flies.)'],
      hint: 'Which way was it moving at that instant?', d: { k: 'cut' }
    };
    var S = R.pick([['a car rounding a flat curve', 'static friction from the road on the tires', ['an outward centrifugal force', 'the car\'s engine', 'the normal force from the road']], ['the Moon orbiting Earth', 'Earth\'s gravitational pull on the Moon', ['the Moon\'s speed', 'an outward centrifugal force', 'the Sun\'s pull on Earth']], ['a puck on a string circling on frictionless ice', 'the tension in the string', ['the puck\'s weight', 'an outward centrifugal force', 'friction from the ice']], ['a rider in a spinning rotor ride, pressed against the wall', 'the normal force from the wall', ['static friction from the wall', 'an outward centrifugal force', 'the rider\'s weight']]]);
    return {
      q: 'What force supplies the centripetal (center-directed) force for ' + S[0] + '?',
      a: MC(cap(S[1]), S[2].map(cap)),
      steps: ['"Centripetal force" is not a new kind of force. It is the job some real force does: pointing toward the center with size $mv^2/r$.', 'Ask what real object pushes or pulls toward the center. For ' + S[0] + ', it is ' + S[1] + '.', 'No outward force belongs on the free-body diagram.'],
      hint: 'Which real force points toward the center?', d: { k: 'source' }
    };
  }));

  // ---------- phys1.vertical-circles
  G('phys1.vertical-circles', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['dip', 'hill']), R.pick(['dip', 'hill', 'vmin', 'mc']), R.pick(['loop', 'bucket', 'vmin', 'hill']));
    var m = R.int(40, 90), r = R.pick([10, 15, 20, 25, 30, 40, 50]);
    if (shape === 'dip') { var v = R.int(6, 20), N = m * (g + v * v / r); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ rider on a roller coaster passes through the bottom of a dip with radius $' + r + '\\ \\text{m}$ at $' + v + '\\ \\text{m/s}$. What normal force does the seat exert on the rider?',
      a: A(N), unit: 'N',
      viz: { name: 'ph-circular', opts: { mode: 'vertical', v: v, r: r, m: m, at: 'bottom', dip: true, interactive: false, quiet: true } },
      steps: ['At the bottom the center of the circle is <b>above</b> the rider, so the net force must point up: $N - mg = \\dfrac{mv^2}{r}$.', '$N = m\\left(g + \\dfrac{v^2}{r}\\right) = ' + m + '\\left(9.8 + \\dfrac{' + v * v + '}{' + r + '}\\right) = ' + qu(N, 'N') + '$.', 'That is more than the weight, $' + tv(m * g) + '\\ \\text{N}$: the rider feels heavier.'],
      hint: 'At the bottom, which way is the center? The net force points there.', d: { k: 'dip', m: m, v: v, r: r }
    }; }
    if (shape === 'hill') { var vh = Math.max(3, Math.floor(sqrt(g * r) * R.pick([0.4, 0.6, 0.8]))), Nh = m * (g - vh * vh / r); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ person in a car goes over the top of a rounded hill of radius $' + r + '\\ \\text{m}$ at $' + vh + '\\ \\text{m/s}$. What normal force does the seat exert on the person?',
      a: A(Nh), unit: 'N',
      viz: { name: 'ph-circular', opts: { mode: 'vertical', v: vh, r: r, m: m, at: 'top', dip: false, interactive: false, quiet: true } },
      steps: ['At the top of the hill the center is <b>below</b>, so the net force points down: $mg - N = \\dfrac{mv^2}{r}$.', '$N = m\\left(g - \\dfrac{v^2}{r}\\right) = ' + m + '\\left(9.8 - \\dfrac{' + vh * vh + '}{' + r + '}\\right) = ' + qu(Nh, 'N') + '$, less than $mg$: the person feels lighter.'],
      hint: 'At the top of a hill, the center is below. The net force points down.', d: { k: 'hill', m: m, v: vh, r: r }
    }; }
    if (shape === 'vmin') { var rl = R.pick([5, 8, 10, 12, 15, 20]); return {
      q: 'A roller coaster car goes around the inside of a vertical loop of radius $' + rl + '\\ \\text{m}$. What is the smallest speed it can have at the top and still keep contact with the track?',
      a: A(sqrt(g * rl)), unit: 'm/s',
      viz: { name: 'ph-circular', opts: { mode: 'vertical', v: sg(sqrt(g * rl), 2), r: rl, at: 'top', interactive: false, quiet: true } },
      steps: ['At the top both gravity and the track\'s normal force point down, toward the center: $mg + N = \\dfrac{mv^2}{r}$.', 'The slowest possible speed is when the track barely touches: $N = 0$, so $mg = \\dfrac{mv^2}{r}$.', '$v = \\sqrt{gr} = \\sqrt{9.8 \\times ' + rl + '} = ' + qu(sqrt(g * rl), 'm/s') + '$.'],
      hint: 'At the minimum speed, gravity alone supplies the centripetal force.', d: { k: 'vmin', r: rl }
    }; }
    if (shape === 'loop') { var rl2 = R.pick([6, 8, 10, 12]), vl = Math.ceil(sqrt(g * rl2)) + R.int(2, 6), Nl = m * (vl * vl / rl2 - g); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ rider goes around the inside of a vertical loop of radius $' + rl2 + '\\ \\text{m}$, upside down at the top, at $' + vl + '\\ \\text{m/s}$. What normal force does the seat exert on the rider at the top?',
      a: A(Nl), unit: 'N',
      viz: { name: 'ph-circular', opts: { mode: 'vertical', v: vl, r: rl2, m: m, at: 'top', interactive: false, quiet: true } },
      steps: ['At the top the center is below the rider, and both $mg$ and $N$ point down, toward it: $N + mg = \\dfrac{mv^2}{r}$.', '$N = m\\left(\\dfrac{v^2}{r} - g\\right) = ' + m + '\\left(\\dfrac{' + vl * vl + '}{' + rl2 + '} - 9.8\\right) = ' + qu(Nl, 'N') + '$.'],
      hint: 'Upside down at the top, the seat pushes the rider downward, toward the center.', d: { k: 'loop', m: m, v: vl, r: rl2 }
    }; }
    if (shape === 'bucket') { var mb = R.pick([1.5, 2, 2.5, 3, 4]), L = R.pick([0.8, 1, 1.2]), vb = R.int(4, 7), Tb = mb * (g + vb * vb / L); return {
      q: 'You swing ' + art(tv(mb), 'a') + ' $' + tv(mb) + '\\ \\text{kg}$ bucket of water in a vertical circle of radius $' + tv(L) + '\\ \\text{m}$. At the bottom of the circle it moves at $' + vb + '\\ \\text{m/s}$. What is the tension in your arm (the rope) there?',
      a: A(Tb), unit: 'N',
      steps: ['At the bottom the center is above: $T - mg = \\dfrac{mv^2}{r}$.', '$T = m\\left(g + \\dfrac{v^2}{r}\\right) = ' + tv(mb) + '\\left(9.8 + \\dfrac{' + vb * vb + '}{' + tv(L) + '}\\right) = ' + qu(Tb, 'N') + '$.'],
      hint: 'At the bottom, the rope must hold up the weight and also supply mv²/r.', d: { k: 'bucket', m: mb, v: vb, r: L }
    }; }
    return {
      q: 'A car drives through the bottom of a dip in the road at a steady speed. How does the normal force from the road compare with the car\'s weight there?',
      a: MC('It is greater than the weight.', ['It equals the weight.', 'It is less than the weight.', 'It is zero.']),
      viz: { name: 'ph-circular', opts: { mode: 'vertical', v: 12, r: 20, at: 'bottom', dip: true, interactive: false, quiet: true } },
      steps: ['At the bottom of the dip the car moves on a circle whose center is above it.', 'So the net force must point up: $N - mg = \\dfrac{mv^2}{r} > 0$.', 'The road pushes up harder than the car\'s weight: $N > mg$.'],
      hint: 'Where is the center of the circle at the bottom of a dip?', d: { k: 'mc' }
    };
  }));

  // ======================= 06-energy.js
  // ============================================================ Unit 4: Work, Energy and Power

  // ---------- phys1.work
  G('phys1.work', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['par', 'angle']), R.pick(['angle', 'fric', 'grav', 'zero']), R.pick(['total', 'angle', 'grav', 'zero']));
    var F = R.int(4, 30) * 5, d = R.int(2, 25), th = R.pick([20, 25, 30, 35, 40, 50, 60]);
    if (shape === 'par') return {
      q: 'You push a shopping cart $' + d + '\\ \\text{m}$ along a level aisle with a steady horizontal force of $' + F + '\\ \\text{N}$ in the direction it moves. How much work does your push do?',
      a: A(F * d), unit: 'J',
      steps: ['The force points along the motion, so $\\theta = 0^\\circ$ and $\\cos 0^\\circ = 1$.', '$W = Fd = ' + F + ' \\times ' + d + ' = ' + qu(F * d, 'J') + '$.'],
      hint: 'W = Fd cos θ, with θ the angle between the force and the motion.', d: { k: 'W', F: F, d: d, th: 0 }
    };
    if (shape === 'angle') return {
      q: 'A rope pulls a sled $' + d + '\\ \\text{m}$ across level snow with a force of $' + F + '\\ \\text{N}$ at $' + th + '^\\circ$ above the horizontal. How much work does the rope do on the sled?',
      a: A(F * d * cosD(th)), unit: 'J',
      viz: { name: 'ph-fbd', opts: { scene: 'block', forces: [{ type: 'tension', mag: F, angle: th }], interactive: false, quiet: true, show: ['components'] } },
      steps: ['Only the part of the force along the motion does work: $F\\cos\\theta$.', '$W = Fd\\cos\\theta = ' + F + ' \\times ' + d + ' \\times \\cos ' + th + '^\\circ = ' + qu(F * d * cosD(th), 'J') + '$.', 'The upward part of the pull does no work, because the sled does not move up.'],
      hint: 'Use the angle between the force and the direction of motion.', d: { k: 'W', F: F, d: d, th: th }
    };
    if (shape === 'fric') { var f = R.int(2, 12) * 5; return {
      q: 'A box slides $' + d + '\\ \\text{m}$ across a floor while kinetic friction of $' + f + '\\ \\text{N}$ acts on it. How much work does friction do on the box (with its sign)?',
      a: A(-f * d), unit: 'J',
      steps: ['Friction points opposite to the motion: $\\theta = 180^\\circ$, and $\\cos 180^\\circ = -1$.', '$W = fd\\cos 180^\\circ = -' + f + ' \\times ' + d + ' = ' + qu(-f * d, 'J') + '$.', 'Negative work takes energy away from the box\'s motion.'],
      hint: 'What is the angle between friction and the motion?', d: { k: 'W', F: f, d: d, th: 180 }
    }; }
    if (shape === 'grav') { var m = R.int(2, 40), h = R.int(1, 12), up = R.coin(); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box is ' + (up ? 'lifted' : 'lowered') + ' straight ' + (up ? 'up' : 'down') + ' a distance of $' + h + '\\ \\text{m}$. How much work does gravity do on it (with its sign)?',
      a: A((up ? -1 : 1) * m * g * h), unit: 'J',
      steps: ['Gravity is $mg = ' + tv(m * g) + '\\ \\text{N}$ downward.', up ? 'The box moves up, opposite to gravity: $\\theta = 180^\\circ$, so the work is negative.' : 'The box moves down, the same way as gravity: $\\theta = 0^\\circ$, so the work is positive.', '$W_g = ' + (up ? '-' : '') + 'mgh = ' + (up ? '-' : '') + tv(m * g) + ' \\times ' + h + ' = ' + qu((up ? -1 : 1) * m * g * h, 'J') + '$.'],
      hint: 'Is the motion with gravity or against it?', d: { k: 'W', F: m * g, d: h, th: up ? 180 : 0 }
    }; }
    if (shape === 'zero') { var Z = R.pick([
      { q: 'A car drives along a level road. Which force on it does <b>zero</b> work?', a: 'The normal force from the road', w: ['Air drag', 'The road\'s forward friction on the drive wheels', 'All of these do work'] },
      { q: 'A ball on a string moves in a horizontal circle at a steady speed. Which force does <b>zero</b> work on it?', a: 'The tension in the string', w: ['There is no such force: tension always does work', 'The force of its motion', 'All forces on a moving object do work'] },
      { q: 'You carry a box across a level room at a steady speed. How much work does your upward holding force do on the box?', a: 'Zero', w: ['Its weight times the distance walked', 'Positive, because you get tired', 'Negative, because the box pushes down'] }
    ]); return {
      q: Z.q, a: MC(Z.a, Z.w),
      steps: ['$W = Fd\\cos\\theta$. A force at right angles to the motion has $\\cos 90^\\circ = 0$, so it does no work.', 'The force in the answer is perpendicular to the motion the whole time. Answer: ' + Z.a.charAt(0).toLowerCase() + Z.a.slice(1) + '.'],
      hint: 'Which force is at right angles to the motion?', d: { k: 'zero' }
    }; }
    var mu = R.pick([0.1, 0.15, 0.2]), m2 = R.int(10, 40);
    F = Math.max(F, Math.ceil(1.3 * mu * m2 * g / (cosD(th) + mu * sinD(th)) / 5) * 5); // the pull wins, so the crate speeds up
    var N = m2 * g - F * sinD(th), fk = mu * N, Wa = F * d * cosD(th), Wf = -fk * d;
    if (N <= 0) { F = 20; N = m2 * g - F * sinD(th); fk = mu * N; Wa = F * d * cosD(th); Wf = -fk * d; }
    return {
      q: 'A rope pulls ' + art(m2, 'a') + ' $' + m2 + '\\ \\text{kg}$ crate $' + d + '\\ \\text{m}$ across a level floor with a force of $' + F + '\\ \\text{N}$ at $' + th + '^\\circ$ above the horizontal. The coefficient of kinetic friction is $' + mu + '$. What is the total (net) work done on the crate?',
      a: A(Wa + Wf), unit: 'J',
      steps: ['Rope: $W_T = Fd\\cos\\theta = ' + F + ' \\times ' + d + ' \\times \\cos ' + th + '^\\circ = ' + tn(Wa, 4) + '\\ \\text{J}$.', 'Friction: $N = mg - F\\sin\\theta = ' + tn(N, 4) + '\\ \\text{N}$, $f_k = \\mu_k N = ' + tn(fk, 4) + '\\ \\text{N}$, $W_f = -f_k d = ' + tn(Wf, 4) + '\\ \\text{J}$.', 'Gravity and the normal force are perpendicular to the motion: zero work.', 'Total: $' + tn(Wa, 4) + ' + ' + T.p(tn(Wf, 4)) + ' = ' + qu(Wa + Wf, 'J') + '$.'],
      hint: 'Find the work of each force, then add them with signs.', d: { k: 'total', F: F, d: d, th: th, mu: mu, m: m2 }
    };
  }));

  // ---------- phys1.work-from-graphs
  G('phys1.work-from-graphs', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['area', 'spring']), R.pick(['area', 'partial', 'spring']), R.pick(['neg', 'partial', 'area']));
    if (shape === 'spring') {
      var xm = R.pick([0.1, 0.2, 0.3, 0.4, 0.5]), Fm = R.int(2, 20) * 5, Wsp = 0.5 * Fm * xm;
      return {
        q: 'The graph shows the force needed to stretch a spring by $x$. How much work does it take to stretch it from $x = 0$ to $x = ' + tv(xm) + '\\ \\text{m}$, where the force reaches $' + Fm + '\\ \\text{N}$?',
        a: A(Wsp), unit: 'J',
        viz: { name: 'ph-graph', opts: { pts: [[0, 0], [xm, Fm]], xlab: 'x', xunit: 'm', ylab: 'F', yunit: 'N', tool: 'none', interactive: false, quiet: true } },
        steps: ['The force grows from $0$ to $' + Fm + '\\ \\text{N}$, so $F \\times d$ with the final force would be too big.', 'The work is the area under the line: a triangle, $\\tfrac12 \\times ' + tv(xm) + ' \\times ' + Fm + ' = ' + qu(Wsp, 'J') + '$.'],
        hint: 'Work is the area under the F–x graph. What shape is it?', d: { k: 'area', pts: [[0, 0], [xm, Fm]], a: 0, b: xm }
      };
    }
    var n = 3, xs = [0], Fs = [R.int(0, 6) * 5], i;
    for (i = 0; i < n; i++) { xs.push(xs[i] + R.pick([1, 2, 2, 3, 4])); Fs.push(shape === 'neg' && i === n - 1 ? -R.int(1, 4) * 5 : R.int(1, 8) * 5); }
    if (shape === 'neg') { Fs[n - 1] = 0; }
    var pts = xs.map(function (x, j) { return [x, Fs[j]]; }), lo = 0, hi = n;
    if (shape === 'partial') { lo = 1; hi = n; }
    var Wt = trapArea(xs, Fs, lo, hi), pieces = []; for (i = lo; i < hi; i++) pieces.push(fx((Fs[i] + Fs[i + 1]) / 2 * (xs[i + 1] - xs[i])));
    return {
      q: 'The graph shows the force on a cart along its path. How much work does the force do from $x = ' + xs[lo] + '\\ \\text{m}$ to $x = ' + xs[hi] + '\\ \\text{m}$?',
      a: AX(Wt), unit: 'J',
      viz: { name: 'ph-graph', opts: { pts: pts, xlab: 'x', xunit: 'm', ylab: 'F', yunit: 'N', tool: 'none', interactive: false, quiet: true } },
      steps: ['Work is the area under the $F$–$x$ graph, counted negative where the force is below the axis.'].concat(pieces.map(function (p, j) { var k2 = j + lo; return 'From $x = ' + xs[k2] + '$ to $' + xs[k2 + 1] + '\\ \\text{m}$: $\\tfrac12(' + Fs[k2] + ' + ' + T.p(Fs[k2 + 1]) + ')(' + (xs[k2 + 1] - xs[k2]) + ') = ' + p + '\\ \\text{J}$.'; })).concat(['Total: $' + pieces.map(T.p).join(' + ') + ' = ' + Wt + '\\ \\text{J}$.']),
      hint: 'Split the area into trapezoids, one per straight piece.', d: { k: 'area', pts: pts, a: xs[lo], b: xs[hi] }
    };
  }));

  // ---------- phys1.work-energy-theorem
  G('phys1.work-energy-theorem', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['speed', 'work']), R.pick(['speed', 'work', 'brake', 'mc']), R.pick(['net', 'net', 'brake', 'work']));
    var m = R.int(8, 25) * 100;
    if (shape === 'speed') { var mm = R.pick([2, 5, 10, 20, 50]), Wn = R.int(2, 40) * 50; return {
      q: art(mm, 'A') + ' $' + mm + '\\ \\text{kg}$ cart starts from rest on a level track. The net work done on it is $' + Wn + '\\ \\text{J}$. How fast is it moving afterward?',
      a: A(sqrt(2 * Wn / mm)), unit: 'm/s',
      steps: ['Work-energy theorem: $W_{net} = \\Delta K = \\tfrac12 mv^2 - 0$.', '$v = \\sqrt{\\dfrac{2W_{net}}{m}} = \\sqrt{\\dfrac{2(' + Wn + ')}{' + mm + '}} = ' + qu(sqrt(2 * Wn / mm), 'm/s') + '$.'],
      hint: 'Set the net work equal to ½mv².', d: { k: 'speed', m: mm, W: Wn }
    }; }
    if (shape === 'work') { var v1 = R.int(0, 20), v2 = R.int(0, 30); if (v1 === v2) v2 += 5; var Wk = 0.5 * m * (v2 * v2 - v1 * v1); return {
      q: art(T.commas(m), 'A') + ' $' + T.commas(m) + '\\ \\text{kg}$ car goes from $' + v1 + '\\ \\text{m/s}$ to $' + v2 + '\\ \\text{m/s}$. What net work was done on it (with its sign)?',
      a: A(Wk), unit: 'J',
      steps: ['$W_{net} = \\Delta K = \\tfrac12 mv_f^2 - \\tfrac12 mv_i^2$.', '$= \\tfrac12(' + m + ')(' + v2 + '^2 - ' + v1 + '^2) = ' + qu(Wk, 'J') + '$.', Wk < 0 ? 'Negative: the net force pointed against the motion and took kinetic energy away.' : 'Positive: the net force pointed along the motion.'],
      hint: 'Net work equals the change in kinetic energy.', d: { k: 'work', m: m, v1: v1, v2: v2 }
    }; }
    if (shape === 'brake') { var v0 = R.int(10, 30), dd = R.int(20, 80); return {
      q: art(T.commas(m), 'A') + ' $' + T.commas(m) + '\\ \\text{kg}$ car moving at $' + v0 + '\\ \\text{m/s}$ brakes to a stop in $' + dd + '\\ \\text{m}$. What is the average braking force (its size)?',
      a: A(0.5 * m * v0 * v0 / dd), unit: 'N',
      steps: ['$W_{net} = \\Delta K = 0 - \\tfrac12 mv_0^2 = -\\tfrac12(' + m + ')(' + v0 + ')^2 = ' + tn(-0.5 * m * v0 * v0, 4) + '\\ \\text{J}$.', 'The braking force does that work: $-Fd = \\Delta K$, so $F = \\dfrac{' + tn(0.5 * m * v0 * v0, 4) + '}{' + dd + '} = ' + qu(0.5 * m * v0 * v0 / dd, 'N') + '$.'],
      hint: 'The braking force times the distance equals the kinetic energy lost.', d: { k: 'brake', m: m, v0: v0, d: dd }
    }; }
    if (shape === 'mc') return {
      q: 'You push a box across a rough floor. To find the box\'s change in kinetic energy, whose work should you use?',
      a: MC('The work done by the net force (the sum of the works of all forces)', ['The work done by your push alone', 'The work done by friction alone', 'The work done by gravity alone']),
      steps: ['The work-energy theorem says $W_{net} = \\Delta K$, where $W_{net}$ is the work of the net force, equal to the sum of the works done by every force.', 'Your push adds energy, but friction takes some away, so your push alone overestimates $\\Delta K$.'],
      hint: 'The theorem is about the net force.', d: { k: 'mc' }
    };
    var mb = R.int(5, 30), F = R.int(6, 20) * 5, f = R.int(1, 5) * 5, d2 = R.int(2, 10), u = R.int(0, 5), vf = sqrt(u * u + 2 * (F - f) * d2 / mb);
    return {
      q: art(mb, 'A') + ' $' + mb + '\\ \\text{kg}$ box ' + (u ? 'moving at $' + u + '\\ \\text{m/s}$' : 'at rest') + ' is pushed $' + d2 + '\\ \\text{m}$ across a level floor by a horizontal force of $' + F + '\\ \\text{N}$, while kinetic friction of $' + f + '\\ \\text{N}$ acts on it. How fast is it moving at the end?',
      a: A(vf), unit: 'm/s',
      steps: ['Work by the push: $' + F + ' \\times ' + d2 + ' = ' + F * d2 + '\\ \\text{J}$. Work by friction: $-' + f + ' \\times ' + d2 + ' = -' + f * d2 + '\\ \\text{J}$. Gravity and the normal force do none.', '$W_{net} = ' + (F - f) * d2 + '\\ \\text{J} = \\tfrac12 mv_f^2 - \\tfrac12 mv_i^2$.', '$v_f = \\sqrt{' + u + '^2 + \\dfrac{2(' + (F - f) * d2 + ')}{' + mb + '}} = ' + qu(vf, 'm/s') + '$.'],
      hint: 'Add up the work of every force, then set it equal to ΔK.', d: { k: 'net', m: mb, F: F, f: f, d: d2, u: u }
    };
  }));

  // ---------- phys1.potential-energy-systems
  G('phys1.potential-energy-systems', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['lift', 'down']), R.pick(['path', 'down', 'ref', 'lift']), R.pick(['path', 'ref', 'mc']));
    var m = R.int(2, 80), h = R.int(1, 15);
    if (shape === 'lift' || shape === 'down') { var up = shape === 'lift', dU = (up ? 1 : -1) * m * g * h; return {
      q: up ? art(m, 'A') + ' $' + m + '\\ \\text{kg}$ suitcase is carried up from the ground floor to a landing $' + h + '\\ \\text{m}$ higher. What is the change in the gravitational potential energy of the suitcase–Earth system?' : art(m, 'A') + ' $' + m + '\\ \\text{kg}$ rock rolls down a hill, ending $' + h + '\\ \\text{m}$ lower than it started. What is the change in the gravitational potential energy of the rock–Earth system (with its sign)?',
      a: A(dU), unit: 'J',
      steps: ['$\\Delta U = mg\\Delta h$, with $\\Delta h$ the change in height (final minus initial).', '$\\Delta h = ' + (up ? '+' : '-') + h + '\\ \\text{m}$, so $\\Delta U = (' + m + ')(9.8)(' + (up ? '' : '-') + h + ') = ' + qu(dU, 'J') + '$.'],
      hint: 'ΔU = mgΔh. Going down makes Δh negative.', d: { k: 'dU', m: m, dh: up ? h : -h }
    }; }
    if (shape === 'path') { var L = h * R.int(2, 4) + R.int(1, 5); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ cart is pushed up a winding ramp $' + L + '\\ \\text{m}$ long to a platform $' + h + '\\ \\text{m}$ above where it started. What is the change in gravitational potential energy?',
      a: A(m * g * h), unit: 'J',
      steps: ['The potential energy of the Earth–object system depends only on height, not on the path taken.', 'The ramp\'s length does not matter: $\\Delta U = mg\\Delta h = (' + m + ')(9.8)(' + h + ') = ' + qu(m * g * h, 'J') + '$.'],
      hint: 'Does ΔU depend on the path or only on the height change?', d: { k: 'dU', m: m, dh: h }
    }; }
    if (shape === 'ref') { var ht = fx(R.int(6, 12) / 10), hs = fx(ht + R.int(5, 15) / 10), refT = R.coin(), U = refT ? m * g * (hs - ht) : m * g * hs; return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box sits on a shelf $' + tv(hs) + '\\ \\text{m}$ above the floor, next to a table $' + tv(ht) + '\\ \\text{m}$ high. Taking $U = 0$ at the ' + (refT ? 'tabletop' : 'floor') + ', what is the box\'s gravitational potential energy?',
      a: A(U), unit: 'J',
      steps: ['$U = mgh$, where $h$ is measured from the level you chose for $U = 0$.', 'Height above the ' + (refT ? 'tabletop: $' + tv(hs) + ' - ' + tv(ht) + ' = ' + tv(fx(hs - ht)) + '\\ \\text{m}$.' : 'floor: $' + tv(hs) + '\\ \\text{m}$.'), '$U = (' + m + ')(9.8)(' + tv(refT ? fx(hs - ht) : hs) + ') = ' + qu(U, 'J') + '$. A different zero level changes $U$ but never changes $\\Delta U$.'],
      hint: 'Measure the height from the level where U = 0.', d: { k: 'ref', m: m, h: refT ? hs - ht : hs }
    }; }
    return {
      q: 'Two identical boxes are raised from the floor to the same shelf: one straight up, the other along a long zigzag ramp. Compare the changes in gravitational potential energy.',
      a: MC('They are equal.', ['The ramp box gains more, because its path is longer.', 'The straight-up box gains more, because it is lifted more steeply.', 'You can\'t tell without the ramp\'s angle.']),
      steps: ['$\\Delta U = mg\\Delta h$ depends only on the change in height.', 'Both boxes have the same mass and the same $\\Delta h$, so $\\Delta U$ is the same. Gravity is a conservative force: the path does not matter.'],
      hint: 'What does ΔU depend on?', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.spring-potential-energy
  G('phys1.spring-potential-energy', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['U', 'U']), R.pick(['U', 'x', 'k', 'ratio']), R.pick(['delta', 'x', 'ratio']));
    var k = R.int(5, 60) * 10, xc = R.int(2, 20), x = xc / 100;
    if (shape === 'U') return {
      q: 'A spring with $k = ' + k + '\\ \\text{N/m}$ is compressed $' + xc + '\\ \\text{cm}$. How much elastic potential energy does it store?',
      a: A(0.5 * k * x * x), unit: 'J',
      viz: { name: 'ph-graph', opts: { fn: k + '*x', domain: [0, sg(x * 1.4, 2)], xlab: 'x', xunit: 'm', ylab: 'F', yunit: 'N', tool: 'area', a: 0, b: x, interactive: false, quiet: true } },
      steps: ['$x = ' + xc + '\\ \\text{cm} = ' + tv(x) + '\\ \\text{m}$.', '$U_s = \\tfrac12 kx^2 = \\tfrac12(' + k + ')(' + tv(x) + ')^2 = ' + qu(0.5 * k * x * x, 'J') + '$. (The $\\tfrac12$ is the triangle under the $F$–$x$ line.)'],
      hint: 'U = ½kx² with x in meters.', d: { k: 'U', kk: k, x: x }
    };
    if (shape === 'x') { var U = R.int(1, 20) * 0.5; return {
      q: 'A spring with $k = ' + k + '\\ \\text{N/m}$ stores $' + tv(U) + '\\ \\text{J}$. How far is it stretched? Give your answer in centimeters.',
      a: A(100 * sqrt(2 * U / k)), unit: 'cm',
      steps: ['$U = \\tfrac12 kx^2$, so $x = \\sqrt{\\dfrac{2U}{k}} = \\sqrt{\\dfrac{2(' + tv(U) + ')}{' + k + '}} = ' + tn(sqrt(2 * U / k), 3) + '\\ \\text{m}$.', 'That is $' + qu(100 * sqrt(2 * U / k), 'cm') + '$.'],
      hint: 'Solve U = ½kx² for x.', d: { k: 'x', U: U, kk: k }
    }; }
    if (shape === 'k') { var U2 = R.int(1, 20) * 0.5; return {
      q: 'Compressing a spring by $' + xc + '\\ \\text{cm}$ stores $' + tv(U2) + '\\ \\text{J}$ in it. What is its spring constant?',
      a: A(2 * U2 / (x * x)), unit: 'N/m',
      steps: ['$U = \\tfrac12 kx^2$, so $k = \\dfrac{2U}{x^2}$.', '$k = \\dfrac{2(' + tv(U2) + ')}{(' + tv(x) + ')^2} = ' + qu(2 * U2 / (x * x), 'N/m') + '$.'],
      hint: 'Solve U = ½kx² for k. Convert cm to m first.', d: { k: 'k', U: U2, x: x }
    }; }
    if (shape === 'ratio') { var f = R.pick([2, 3, 0.5]); return {
      q: 'A spring stores energy $U$ when stretched by $x$. How many times $U$ does it store when stretched by ' + (f === 0.5 ? 'half as much' : f + ' times as much') + '?',
      a: { t: 'num', v: String(f * f), rtol: 0.01 },
      steps: ['$U = \\tfrac12 kx^2$ grows with the square of the stretch.', 'Factor: $' + tv(f) + '^2 = ' + tv(f * f) + '$. (The force grows only by $' + tv(f) + '$, but the energy by $' + tv(f * f) + '$.)'],
      hint: 'Square the stretch factor.', d: { k: 'ratio', f: f }
    }; }
    var x1 = R.int(2, 8) / 100, x2 = x1 + R.int(2, 8) / 100, dU = 0.5 * k * (x2 * x2 - x1 * x1);
    return {
      q: 'A spring with $k = ' + k + '\\ \\text{N/m}$ is already stretched $' + tv(x1 * 100) + '\\ \\text{cm}$. How much more energy does it store when you stretch it to $' + tv(fx(x2 * 100)) + '\\ \\text{cm}$?',
      a: A(dU), unit: 'J',
      steps: ['$\\Delta U = \\tfrac12 kx_2^2 - \\tfrac12 kx_1^2$, not $\\tfrac12 k(x_2 - x_1)^2$.', '$= \\tfrac12(' + k + ')(' + tv(x2) + '^2 - ' + tv(x1) + '^2) = ' + qu(dU, 'J') + '$.'],
      hint: 'Find the energy stored at each stretch and subtract.', d: { k: 'delta', kk: k, x1: x1, x2: x2 }
    };
  }));

  // ---------- phys1.energy-conservation
  G('phys1.energy-conservation', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['slide', 'slide']), R.pick(['slide', 'mid', 'spring', 'pend', 'mc']), R.pick(['mid', 'height', 'spring', 'pend']));
    var h = R.int(2, 30);
    if (shape === 'slide') { var m = R.int(20, 90); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ child starts from rest at the top of a frictionless water slide $' + h + '\\ \\text{m}$ high. How fast is the child going at the bottom?',
      a: A(sqrt(2 * g * h)), unit: 'm/s',
      viz: { name: 'ph-energy', opts: { scene: 'ramp', m: m, h0: Math.min(h, 8), interactive: false, quiet: true } },
      steps: ['Only gravity does work (the slide\'s normal force is perpendicular to the motion), so $K + U$ stays the same.', '$mgh = \\tfrac12 mv^2$; the mass cancels: $v = \\sqrt{2gh} = \\sqrt{2(9.8)(' + h + ')} = ' + qu(sqrt(2 * g * h), 'm/s') + '$.', 'The shape of the slide does not matter, only the drop in height.'],
      hint: 'Potential energy at the top becomes kinetic energy at the bottom.', d: { k: 'slide', h: h }
    }; }
    if (shape === 'mid') { var v0 = R.int(0, 8), h1 = R.int(10, 40), h2 = R.int(1, h1 - 3), vm = sqrt(v0 * v0 + 2 * g * (h1 - h2)); return {
      q: 'A roller coaster car moves at $' + v0 + '\\ \\text{m/s}$ at the top of a hill $' + h1 + '\\ \\text{m}$ high. Ignoring friction, how fast is it moving at the top of the next hill, $' + h2 + '\\ \\text{m}$ high?',
      a: A(vm), unit: 'm/s',
      viz: { name: 'ph-energy', opts: { scene: 'track', track: [[0, h1], [4, h1 * 0.5], [8, 0.4], [12, h2], [16, h2 * 0.4]], m: 500, v0: v0, interactive: false, quiet: true } },
      steps: ['$K_1 + U_1 = K_2 + U_2$: $\\tfrac12 mv_1^2 + mgh_1 = \\tfrac12 mv_2^2 + mgh_2$.', 'Cancel $m$: $v_2 = \\sqrt{v_1^2 + 2g(h_1 - h_2)} = \\sqrt{' + v0 + '^2 + 2(9.8)(' + (h1 - h2) + ')} = ' + qu(vm, 'm/s') + '$.'],
      hint: 'Only the drop in height between the two points matters.', d: { k: 'mid', v0: v0, h1: h1, h2: h2 }
    }; }
    if (shape === 'spring' || shape === 'height') { var k = R.int(5, 40) * 100, xc = R.int(5, 25), x = xc / 100, mm = R.pick([0.05, 0.1, 0.2, 0.25, 0.5, 1]), vs = x * sqrt(k / mm), hs = k * x * x / (2 * mm * g); return {
      q: 'A spring launcher with $k = ' + k + '\\ \\text{N/m}$ is compressed $' + xc + '\\ \\text{cm}$ and fires ' + art(tv(mm), 'a') + ' $' + tv(mm) + '\\ \\text{kg}$ ball ' + (shape === 'spring' ? 'horizontally along a frictionless track. How fast does the ball leave the spring?' : 'straight up. Ignoring air resistance, how high above its starting point does the ball rise?'),
      a: A(shape === 'spring' ? vs : hs), unit: shape === 'spring' ? 'm/s' : 'm',
      viz: { name: 'ph-energy', opts: { scene: 'spring', k: Math.min(k, 800), m: 2, x0: 0.4, interactive: false, quiet: true } },
      steps: ['Stored energy: $U_s = \\tfrac12 kx^2 = \\tfrac12(' + k + ')(' + tv(x) + ')^2 = ' + tn(0.5 * k * x * x, 4) + '\\ \\text{J}$.', shape === 'spring' ? 'All of it becomes kinetic energy: $\\tfrac12 mv^2 = ' + tn(0.5 * k * x * x, 4) + '$, so $v = \\sqrt{\\dfrac{2(' + tn(0.5 * k * x * x, 4) + ')}{' + tv(mm) + '}} = ' + qu(vs, 'm/s') + '$.' : 'At the top all of it is gravitational energy: $mgh = ' + tn(0.5 * k * x * x, 4) + '$, so $h = \\dfrac{' + tn(0.5 * k * x * x, 4) + '}{(' + tv(mm) + ')(9.8)} = ' + qu(hs, 'm') + '$.'],
      hint: 'Spring energy ½kx² turns into ' + (shape === 'spring' ? 'kinetic energy.' : 'gravitational energy at the top.'), d: { k: shape, kk: k, x: x, m: mm }
    }; }
    if (shape === 'pend') { var L = R.pick([0.5, 0.8, 1, 1.5, 2, 2.5]), th = R.pick([20, 30, 40, 45, 50, 60]), hp = L * (1 - cosD(th)), vp = sqrt(2 * g * hp); return {
      q: 'A pendulum $' + tv(L) + '\\ \\text{m}$ long is pulled back to $' + th + '^\\circ$ from vertical and released. How fast is the bob moving at the bottom of the swing?',
      a: A(vp), unit: 'm/s',
      viz: { name: 'ph-energy', opts: { scene: 'pendulum', L: L, theta0: th, interactive: false, quiet: true } },
      steps: ['Height drop: the bob starts $L\\cos\\theta$ below the pivot and ends $L$ below it, so $h = L(1 - \\cos\\theta) = ' + tv(L) + '(1 - \\cos ' + th + '^\\circ) = ' + tn(hp, 4) + '\\ \\text{m}$.', 'The string\'s tension is always perpendicular to the motion and does no work, so $mgh = \\tfrac12 mv^2$.', '$v = \\sqrt{2gh} = ' + qu(vp, 'm/s') + '$.'],
      hint: 'Find how much lower the bob is at the bottom, then use mgh = ½mv².', d: { k: 'pend', L: L, th: th }
    }; }
    return {
      q: 'A bowling ball and a tennis ball are released from rest at the same height at the top of the same frictionless ramp. Which is faster at the bottom?',
      a: MC('Both have the same speed.', ['The bowling ball, because it is heavier.', 'The tennis ball, because it is lighter.', 'It depends on the length of the ramp.']),
      viz: { name: 'ph-energy', opts: { scene: 'ramp', m: 7, h0: 4, interactive: false, quiet: true } },
      steps: ['$mgh = \\tfrac12 mv^2$ for each ball.', 'The mass appears on both sides and cancels: $v = \\sqrt{2gh}$.', 'The heavier ball has more energy, but it also needs more energy for each m/s of speed. Their speeds are equal.'],
      hint: 'Write mgh = ½mv² and see what happens to m.', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.energy-bar-charts
  var BAR_SC = [
    { s: 'A ball is dropped from rest. Partway down, how much kinetic energy does it have?', sys: 'ball and Earth', mk: function (R) { var a = R.int(4, 12) * 5, b = R.int(1, a / 5 - 1) * 5; return { before: { K: 0, Ug: a }, W: 0, after: { K: '?', Ug: b }, ans: a - b, unk: 'K', eq: '0 + ' + a + ' = K + ' + b }; } },
    { s: 'A cart on a frictionless level track is pushed by a hand. How much kinetic energy does it have at the end?', sys: 'cart', mk: function (R) { var a = R.int(1, 8) * 5, w = R.int(1, 8) * 5; return { before: { K: a }, W: w, after: { K: '?' }, ans: a + w, unk: 'K', eq: a + ' + ' + w + ' = K' }; } },
    { s: 'A box slides across a rough floor and stops. How much thermal energy is produced?', sys: 'box and floor', mk: function (R) { var a = R.int(2, 12) * 5; return { before: { K: a, Eth: 0 }, W: 0, after: { K: 0, Eth: '?' }, ans: a, unk: 'E_{th}', eq: a + ' + 0 = 0 + E_{th}' }; } },
    { s: 'A compressed spring launches a cart up a frictionless ramp. At a point partway up, how much gravitational energy does the system have?', sys: 'cart, spring and Earth', mk: function (R) { var a = R.int(6, 16) * 5, b = R.int(1, a / 5 - 2) * 5; return { before: { K: 0, Ug: 0, Us: a }, W: 0, after: { K: b, Ug: '?', Us: 0 }, ans: a - b, unk: 'U_g', eq: a + ' = ' + b + ' + U_g' }; } },
    { s: 'A sled slides down a rough hill, starting from rest. How much kinetic energy does it have at the bottom?', sys: 'sled, hill and Earth', mk: function (R) { var a = R.int(8, 20) * 5, e = R.int(1, a / 5 - 2) * 5; return { before: { K: 0, Ug: a, Eth: 0 }, W: 0, after: { K: '?', Ug: 0, Eth: e }, ans: a - e, unk: 'K', eq: a + ' = K + ' + e }; } },
    { s: 'A crane lifts a crate at a steady speed. How much work does the crane\'s cable do on the system?', sys: 'crate and Earth', mk: function (R) { var k = R.int(1, 4) * 5, u = R.int(2, 12) * 5; return { before: { K: k, Ug: 0 }, W: '?', after: { K: k, Ug: u }, ans: u, unk: 'W', eq: k + ' + 0 + W = ' + k + ' + ' + u }; } },
    { s: 'A skydiver falls at a steady speed. Air drag acts from outside the system. How much work does drag do (with its sign)?', sys: 'skydiver and Earth', mk: function (R) { var k = R.int(4, 10) * 5, u = R.int(4, 16) * 5; return { before: { K: k, Ug: u }, W: '?', after: { K: k, Ug: 0 }, ans: -u, unk: 'W', eq: k + ' + ' + u + ' + W = ' + k + ' + 0' }; } }
  ];
  G('phys1.energy-bar-charts', W(function (R, ctx) {
    var pool = by(ctx, [0, 1, 2], [0, 1, 2, 3, 4], [3, 4, 5, 6]), S = BAR_SC[R.pick(pool)], c = S.mk(R);
    var scale = R.pick([1, 10, 100]), sc = function (o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k] === '?' ? '?' : o[k] * scale; }); return r; };
    var before = sc(c.before), after = sc(c.after), Wv = c.W === '?' ? '?' : c.W * scale, ans = c.ans * scale;
    var eq = c.eq.replace(/-?\d+/g, function (n) { return String(+n * scale); });
    return {
      q: S.s + ' The system is the ' + S.sys + '. The bar chart shows the energies in joules (the unknown is marked "?").',
      a: AX(ans), unit: 'J',
      viz: { name: 'ph-energy', opts: { mode: 'chart', chart: { before: before, W: Wv, after: after }, unit: 'J', interactive: false } },
      steps: ['Energy is conserved: energy before + work from outside = energy after.', 'With the numbers: $' + eq + '$.', 'So $' + c.unk + ' = ' + ans + '\\ \\text{J}$.' + (ans < 0 ? ' Negative work: the outside force took energy out of the system.' : '')],
      hint: 'Add the bars before and any work in; the bars after must add up to the same total.', d: { k: 'bars', before: before, W: Wv, after: after, ans: ans }
    };
  }));

  // ---------- phys1.friction-energy
  G('phys1.friction-energy', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['eth', 'speeds']), R.pick(['eth', 'stop', 'speeds', 'mc']), R.pick(['ramp', 'stop', 'ramp']));
    var m = R.int(2, 40), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4]), d = R.int(2, 20);
    if (shape === 'eth') return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ box is dragged $' + d + '\\ \\text{m}$ across a level floor with $\\mu_k = ' + mu + '$. How much thermal energy does friction produce?',
      a: A(mu * m * g * d), unit: 'J',
      steps: ['$f_k = \\mu_k mg = ' + mu + ' \\times ' + tv(m * g) + ' = ' + tv(mu * m * g) + '\\ \\text{N}$.', '$\\Delta E_{th} = f_k d = ' + tv(mu * m * g) + ' \\times ' + d + ' = ' + qu(mu * m * g * d, 'J') + '$, shared between the box and the floor.'],
      hint: 'Thermal energy = friction force × sliding distance.', d: { k: 'eth', m: m, mu: mu, d: d }
    };
    if (shape === 'speeds') { var v1 = R.int(4, 15), v2 = R.int(0, v1 - 2); return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ sled slows from $' + v1 + '\\ \\text{m/s}$ to $' + v2 + '\\ \\text{m/s}$ while sliding across level snow. How much thermal energy did friction produce?',
      a: A(0.5 * m * (v1 * v1 - v2 * v2)), unit: 'J',
      steps: ['Level ground, so $U_g$ does not change. The lost kinetic energy became thermal energy; none disappeared.', '$\\Delta E_{th} = \\tfrac12 m(v_1^2 - v_2^2) = \\tfrac12(' + m + ')(' + v1 + '^2 - ' + v2 + '^2) = ' + qu(0.5 * m * (v1 * v1 - v2 * v2), 'J') + '$.'],
      hint: 'Where did the lost kinetic energy go?', d: { k: 'speeds', m: m, v1: v1, v2: v2 }
    }; }
    if (shape === 'stop') { var v = R.int(3, 12); return {
      q: 'A hockey puck slides at $' + v + '\\ \\text{m/s}$ onto a rough patch of ice with $\\mu_k = ' + mu + '$. Using energy, find how far it slides before stopping.',
      a: A(v * v / (2 * mu * g)), unit: 'm',
      steps: ['All the kinetic energy becomes thermal energy: $\\tfrac12 mv^2 = \\mu_k mg\\,d$.', 'The mass cancels: $d = \\dfrac{v^2}{2\\mu_k g} = \\dfrac{' + v + '^2}{2(' + mu + ')(9.8)} = ' + qu(v * v / (2 * mu * g), 'm') + '$.'],
      hint: 'Set the starting kinetic energy equal to f_k d.', d: { k: 'stop', v: v, mu: mu }
    }; }
    if (shape === 'mc') return {
      q: 'A box slides across a rough floor and comes to a stop. What happened to its kinetic energy?',
      a: MC('It became thermal energy in the box and the floor.', ['It was destroyed by friction.', 'It became gravitational potential energy.', 'It is still in the box as stored motion.']),
      viz: { name: 'ph-energy', opts: { scene: 'slide', m: 2, v0: 6, mu: 0.3, interactive: false, quiet: true } },
      steps: ['Energy is never destroyed. Friction turns the ordered motion of the box into the random jiggling of atoms in both surfaces.', 'So the kinetic energy became thermal energy: the box and floor warm up slightly. $\\Delta E_{th} = f_k d$.'],
      hint: 'Energy is conserved. Feel a surface after rubbing it.', d: { k: 'mc' }
    };
    var h = R.int(3, 15), L = Math.round(h * R.pick([1.5, 2, 2.5, 3])), f = R.int(2, 10) * 5, mm = R.int(10, 50), Kb = mm * g * h - f * L;
    if (Kb <= 0) { f = 5; Kb = mm * g * h - f * L; }
    return {
      q: art(mm, 'A') + ' $' + mm + '\\ \\text{kg}$ sled starts from rest at the top of a snowy slope $' + h + '\\ \\text{m}$ high and slides $' + L + '\\ \\text{m}$ down it. Friction of $' + f + '\\ \\text{N}$ acts along the way. How fast is it moving at the bottom?',
      a: A(sqrt(2 * Kb / mm)), unit: 'm/s',
      steps: ['Energy at the top: $U_g = mgh = (' + mm + ')(9.8)(' + h + ') = ' + tv(mm * g * h) + '\\ \\text{J}$.', 'Thermal energy made on the way down: $f d = ' + f + ' \\times ' + L + ' = ' + f * L + '\\ \\text{J}$.', 'Kinetic energy at the bottom: $' + tv(mm * g * h) + ' - ' + f * L + ' = ' + tv(Kb) + '\\ \\text{J}$.', '$v = \\sqrt{\\dfrac{2K}{m}} = \\sqrt{\\dfrac{2(' + tv(Kb) + ')}{' + mm + '}} = ' + qu(sqrt(2 * Kb / mm), 'm/s') + '$.'],
      hint: 'U at the top = K at the bottom + thermal energy.', d: { k: 'ramp', m: mm, h: h, L: L, f: f }
    };
  }));

  // ---------- phys1.power
  G('phys1.power', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['lift', 'energy']), R.pick(['lift', 'Fv', 'time', 'mc']), R.pick(['speed', 'Fv', 'lift', 'time']));
    var m = R.int(40, 90), h = R.int(3, 15), t = R.int(4, 20);
    if (shape === 'lift') return {
      q: art(m, 'A') + ' $' + m + '\\ \\text{kg}$ hiker climbs a staircase $' + h + '\\ \\text{m}$ high in $' + t + '\\ \\text{s}$. What average power does the hiker deliver to raise their body?',
      a: A(m * g * h / t), unit: 'W',
      steps: ['Work against gravity: $W = mgh = (' + m + ')(9.8)(' + h + ') = ' + tv(m * g * h) + '\\ \\text{J}$.', '$P = \\dfrac{W}{\\Delta t} = \\dfrac{' + tv(m * g * h) + '}{' + t + '} = ' + qu(m * g * h / t, 'W') + '$.'],
      hint: 'Power is work divided by time.', d: { k: 'lift', m: m, h: h, t: t }
    };
    if (shape === 'energy') { var P = R.pick([5, 10, 40, 60, 100, 1200, 1500]), mins = R.pick([2, 5, 10, 30, 60]); return {
      q: 'A ' + (P >= 1000 ? 'hair dryer' : 'light bulb') + ' uses $' + T.commas(P) + '\\ \\text{W}$ for $' + mins + '$ minutes. How much energy does it use, in joules?',
      a: A(P * mins * 60), unit: 'J',
      steps: ['A watt is a joule per second, so energy $= P\\,\\Delta t$ with the time in seconds.', '$' + mins + '\\ \\text{min} = ' + mins * 60 + '\\ \\text{s}$.', '$E = ' + P + ' \\times ' + mins * 60 + ' = ' + qu(P * mins * 60, 'J') + '$.'],
      hint: 'Energy = power × time (in seconds).', d: { k: 'energy', P: P, t: mins * 60 }
    }; }
    if (shape === 'Fv') { var F = R.int(2, 12) * 100, v = R.int(10, 35); return {
      q: 'A car cruises at a steady $' + v + '\\ \\text{m/s}$ while air drag and rolling friction together push back on it with $' + T.commas(F) + '\\ \\text{N}$. What power must the engine deliver to the wheels?',
      a: A(F * v), unit: 'W',
      steps: ['Steady speed: the forward force from the road equals the backward forces, $' + T.commas(F) + '\\ \\text{N}$.', 'That force points along the velocity, so $P = Fv = ' + T.commas(F) + ' \\times ' + v + ' = ' + qu(F * v, 'W') + '$.'],
      hint: 'P = Fv when the force points along the velocity.', d: { k: 'Fv', F: F, v: v }
    }; }
    if (shape === 'time') { var P2 = R.pick([500, 750, 1000, 1500, 2000]), mm = R.int(2, 10) * 50, hh = R.int(2, 20); return {
      q: art(P2, 'A') + ' $' + P2 + '\\ \\text{W}$ motor lifts ' + art(mm, 'a') + ' $' + mm + '\\ \\text{kg}$ load $' + hh + '\\ \\text{m}$ straight up. If all of its power goes into lifting, how long does it take?',
      a: A(mm * g * hh / P2), unit: 's',
      steps: ['Work needed: $mgh = (' + mm + ')(9.8)(' + hh + ') = ' + tv(mm * g * hh) + '\\ \\text{J}$.', '$\\Delta t = \\dfrac{W}{P} = \\dfrac{' + tv(mm * g * hh) + '}{' + P2 + '} = ' + qu(mm * g * hh / P2, 's') + '$.'],
      hint: 'Time = work ÷ power.', d: { k: 'time', m: mm, h: hh, P: P2 }
    }; }
    if (shape === 'speed') { var P3 = R.pick([2, 5, 8, 10, 15]) * 1000, m3 = R.int(2, 12) * 100; return {
      q: 'An elevator motor delivers $' + T.commas(P3) + '\\ \\text{W}$ while lifting ' + art(T.commas(m3), 'a') + ' $' + T.commas(m3) + '\\ \\text{kg}$ car at a constant speed. How fast does the car rise?',
      a: A(P3 / (m3 * g)), unit: 'm/s',
      steps: ['At constant speed the cable pulls up with $F = mg = ' + tv(m3 * g) + '\\ \\text{N}$.', '$P = Fv$, so $v = \\dfrac{P}{mg} = \\dfrac{' + P3 + '}{' + tv(m3 * g) + '} = ' + qu(P3 / (m3 * g), 'm/s') + '$.'],
      hint: 'P = Fv with F = mg.', d: { k: 'speed', P: P3, m: m3 }
    }; }
    return {
      q: 'Two students of equal mass climb the same flight of stairs. One walks up in $20\\ \\text{s}$; the other runs up in $10\\ \\text{s}$. Which statement is true?',
      a: MC('They do the same work, but the runner\'s power is twice as large.', ['The runner does twice as much work.', 'They have the same power because they do the same work.', 'The walker\'s power is larger because they work for longer.']),
      steps: ['Work against gravity is $mgh$: same mass, same height, same work.', 'Power is how fast the work is done: $P = W/\\Delta t$. Half the time means twice the power.', 'Energy is measured in joules; power in watts (joules per second).'],
      hint: 'Work depends on force and distance; power also depends on time.', d: { k: 'mc' }
    };
  }));

  // ---------- phys1.gravitational-pe-universal
  G('phys1.gravitational-pe-universal', W(function (R, ctx) {
    var shape = by(ctx, R.pick(['U', 'escape', 'U']), R.pick(['U', 'dU', 'escape', 'mc', 'dU']), R.pick(['dU', 'compare', 'escape', 'U']));
    var m = R.int(1, 40) * 50, hk = R.coin() ? R.pick([300, 400, 1000, 2000, 6371, 20200, 35786]) : R.int(2, 400) * 100, r = RE + hk * 1000;
    var GMm = GRAV * ME * m, given = '(Earth: $M = 5.972 \\times 10^{24}\\ \\text{kg}$, $R = 6.371 \\times 10^{6}\\ \\text{m}$; $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$)';
    var viz = { name: 'ph-energy', opts: { mode: 'ucurve', U: '-62.6/x', domain: [1, 8], range: [-70, 10], xunit: 'Earth radii', unit: 'GJ', interactive: false, quiet: true } };
    if (shape === 'U') return {
      q: art(T.commas(m), 'A') + ' $' + T.commas(m) + '\\ \\text{kg}$ satellite orbits $' + T.commas(hk) + '\\ \\text{km}$ above Earth\'s surface. Taking $U = 0$ at infinite separation, what is the gravitational potential energy of the satellite–Earth system? ' + given,
      a: A(-GMm / r), unit: 'J',
      steps: ['$U = -\\dfrac{GMm}{r}$, with $r$ from Earth\'s center: $r = ' + tn(r, 4) + '\\ \\text{m}$.', '$U = -\\dfrac{(6.674 \\times 10^{-11})(5.972 \\times 10^{24})(' + m + ')}{' + tn(r, 4) + '} = ' + qu(-GMm / r, 'J') + '$.', 'It is negative because $U$ is zero when the two are infinitely far apart, and you would have to add energy to pull them that far apart.'],
      hint: 'U = −GMm/r with r measured from Earth\'s center.', d: { k: 'U', m: m, r: r }
    };
    if (shape === 'dU' || shape === 'compare') { var dU = GMm * (1 / RE - 1 / r); return {
      q: 'How much does the gravitational potential energy of the Earth–payload system increase when ' + art(T.commas(m), 'a') + ' $' + T.commas(m) + '\\ \\text{kg}$ payload is raised from Earth\'s surface to $' + T.commas(hk) + '\\ \\text{km}$ up? ' + given + (shape === 'compare' ? ' (At this height, $mgh$ is not accurate.)' : ''),
      a: A(dU), unit: 'J', viz: viz,
      steps: ['$\\Delta U = U_f - U_i = -\\dfrac{GMm}{r} - \\left(-\\dfrac{GMm}{R}\\right) = GMm\\left(\\dfrac{1}{R} - \\dfrac{1}{r}\\right)$.', '$GMm = ' + tn(GMm, 4) + '\\ \\text{N}\\cdot\\text{m}^2$; $\\dfrac{1}{R} - \\dfrac{1}{r} = ' + tn(1 / RE - 1 / r, 4) + '\\ \\text{m}^{-1}$.', '$\\Delta U = ' + qu(dU, 'J') + '$.', 'For comparison, $mgh = ' + tn(m * g * hk * 1000) + '\\ \\text{J}$, ' + (m * g * hk * 1000 / dU > 1.05 ? 'too big because $g$ weakens with height.' : 'close, because the height is small next to Earth\'s radius.')],
      hint: 'Find U at both distances from Earth\'s center and subtract.', d: { k: 'dU', m: m, r: r }
    }; }
    if (shape === 'escape') { var mm = R.int(1, 40) * 50, craft = R.pick(['probe', 'space probe', 'spacecraft', 'science capsule', 'deep-space probe']); return {
      q: 'How much energy must be added to ' + art(mm, 'a') + ' $' + mm + '\\ \\text{kg}$ ' + craft + ', starting at rest on Earth\'s surface, to move it infinitely far from Earth (ignoring air and Earth\'s spin)? ' + given,
      a: A(GRAV * ME * mm / RE), unit: 'J',
      steps: ['At the surface $U = -\\dfrac{GMm}{R}$; far away $U = 0$.', 'The energy needed is the difference: $\\dfrac{GMm}{R} = \\dfrac{(6.674 \\times 10^{-11})(5.972 \\times 10^{24})(' + mm + ')}{6.371 \\times 10^{6}} = ' + qu(GRAV * ME * mm / RE, 'J') + '$.', 'That is about $' + tn(GRAV * ME / RE / 1e6, 3) + '\\ \\text{MJ}$ for every kilogram.'],
      hint: 'U goes from −GMm/R to 0.', d: { k: 'escape', m: mm }
    }; }
    return {
      q: 'The gravitational potential energy of a satellite–Earth system is $U = -GMm/r$. What does the minus sign mean?',
      a: MC('U is zero when they are infinitely far apart, so at any finite distance it is less than zero: energy must be added to separate them.', ['The satellite is moving toward Earth.', 'Gravity is repulsive at large distances.', 'The satellite has negative mass.']),
      viz: viz,
      steps: ['We chose $U = 0$ at $r = \\infty$. Moving the objects apart takes positive work, which raises $U$ toward zero.', 'So at every finite distance $U$ is below zero. Only changes in $U$ have physical meaning, and $U$ still increases with height, as $mgh$ says near the surface.'],
      hint: 'Where did we put U = 0?', d: { k: 'mc' }
    };
  }));

})(window.MathLadder);

/* ---- part B ---- */
/* Physics 1, part B: units 5–8 (Momentum; Torque and Rotational Dynamics; Energy and Momentum of Rotating Systems;
   Oscillations), 25 topics. Source files: /tmp/work_phys1_B/gen/*.js, joined by build-gen.js.
   Conventions (Physics Ladder overview): SI units, g = 9.8 m/s², answers with `unit` and `rtol` (0.01 for one step,
   0.02 for several steps or rounded constants), signs on an axis the problem names, counterclockwise torques and
   rotations positive unless the problem says otherwise. Every answer is computed from the generated numbers. */
(function (ML) {
  'use strict';
  var G = ML.gen, U = ML.util, M = Math, PI = M.PI, g = 9.8;

  // ---------- numbers ----------
  function sig(x, s) { if (!isFinite(x) || x === 0) return x; return parseFloat(x.toPrecision(s || 3)); }
  function clean(x) { return parseFloat(x.toPrecision(12)); }
  function grp(str) { // thousands groups ({,} in TeX) for the whole-number part
    var neg = str.charAt(0) === '-'; if (neg) str = str.slice(1);
    var p = str.split('.'), i = p[0];
    if (i.length >= 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
    return (neg ? '-' : '') + i + (p.length > 1 ? '.' + p[1] : '');
  }
  function plain(x) { var s = String(clean(x)); if (/e/.test(s)) { var m = /^(-?[\d.]+)e([-+]\d+)$/.exec(s); return m ? m[1] + ' \\times 10^{' + (+m[2]) + '}' : s; } return s; }
  /* F(x, s): x as TeX to s significant figures (default 3); a value that is already exact at s figures keeps its own
     digits (2.5 stays 2.5), others are padded (2.4999 -> 2.50); very large or small values in scientific notation. */
  function F(x, s) {
    s = s || 3; if (!isFinite(x)) return '?'; if (M.abs(x) < 1e-12) return '0';
    var r = sig(x, s), exact = M.abs(r - x) <= 1e-9 * M.abs(x), a = M.abs(r), e = M.floor(M.log10(a) + 1e-9);
    if (e >= 6 || e <= -4) {
      var m = r / M.pow(10, e), ms = exact ? String(clean(m)) : m.toFixed(s - 1);
      return ms + ' \\times 10^{' + e + '}';
    }
    var str = exact ? String(clean(r)) : r.toFixed(M.max(0, s - 1 - e));
    if (str === '-0') str = '0';
    return grp(str);
  }
  function D(x, dp) { return grp((M.abs(x) < 1e-12 ? 0 : x).toFixed(dp)); } // a given value with dp decimals
  function P(s) { return String(s).charAt(0) === '-' ? '(' + s + ')' : s; } // parenthesize a negative TeX number
  var UTX = { 'm/s²': '\\text{m/s}^{2}', 'rad/s²': '\\text{rad/s}^{2}', 'kg·m²': '\\text{kg·m}^{2}', 'kg·m²/s': '\\text{kg·m}^{2}\\text{/s}', 'N·m²/kg²': '\\text{N·m}^{2}\\text{/kg}^{2}', '°': '^\\circ' };
  function ut(u) { return UTX[u] || '\\text{' + u + '}'; }
  function un(x, u, s) { return F(x, s) + (u === '°' ? '' : '\\ ') + ut(u); } // computed value with unit
  function ud(x, dp, u) { return D(x, dp) + (u === '°' ? '' : '\\ ') + ut(u); }  // given value with unit
  function uq(s, u) { return s + (u === '°' ? '' : '\\ ') + ut(u); }            // a TeX number (string) with unit
  function V1(v) { return M.abs(v * 10 - M.round(v * 10)) < 1e-9 ? D(v, 1) : F(v); } // a given speed: one decimal when exact
  /* A(x, rtol): a number answer; the canonical value has 3 significant figures (exact values keep theirs) */
  function A(x, rtol, s) {
    var v = M.abs(x) < 1e-12 ? 0 : sig(x, s || 3), str = String(clean(v)).replace('e+', 'e');
    if (M.abs(clean(v) - x) <= 1e-9 * M.abs(x)) str = String(clean(x)).replace('e+', 'e');
    return { t: 'num', v: str, rtol: rtol || 0.01 };
  }
  function mc(right, wrongs) { return U.mc(right, wrongs); }
  function out(p, vd) { if (ML.__vd) p.vd = vd; return p; } // verification data, only when the test harness asks
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function pickT(R, ctx, l1, l2, l3) { var L = lv(ctx); return R.pick(L === 1 ? l1 : L === 2 ? l2 : (l3 || l2)); }
  function pm(R) { return R.coin() ? 1 : -1; }
  var DEG = PI / 180;
  function sind(d) { return M.sin(d * DEG); }
  function cosd(d) { return M.cos(d * DEG); }
  var AX = [['right', 'left'], ['east', 'west'], ['north', 'south']];
  function axis(R, which) { var a = which != null ? AX[which] : R.pick(AX); return { pos: a[0], neg: a[1], say: 'Take ' + a[0] + ' as the positive direction.' }; }
  function dw(ax, v) { return v >= 0 ? ax.pos : ax.neg; }
  function sq(x) { return x * x; }


  // ============================== Unit 5: Momentum ==============================
  function an(tex) { var s = String(tex).replace(/^-/, ''), g1 = s.split('{,}')[0].split('.')[0]; return (/^8/.test(g1) || g1 === '11' || g1 === '18') ? 'an' : 'a'; }
  function An(tex) { var a = an(tex); return a.charAt(0).toUpperCase() + a.slice(1); }
  var MOVERS = [
    { n: 'baseball', m: [0.145], md: 3, v: [25, 30, 35, 40], vd: 0 },
    { n: 'bowling ball', m: [5, 6, 7], md: 1, v: [2.5, 3, 4, 5.5], vd: 1 },
    { n: 'car', m: [1100, 1200, 1400, 1500, 1800], md: 0, v: [12, 15, 18, 22, 25], vd: 0 },
    { n: 'lab cart', m: [0.5, 0.75, 1.5, 2], md: 2, v: [0.4, 0.6, 0.8, 1.2, 1.5], vd: 2 },
    { n: 'runner', m: [55, 60, 65, 70, 80], md: 0, v: [4, 5, 6, 7.5, 8], vd: 1 },
    { n: 'hockey puck', m: [0.17], md: 2, v: [12, 15, 20, 25, 30], vd: 0 },
    { n: 'delivery truck', m: [6000, 8000, 9000], md: 0, v: [10, 12, 15, 20], vd: 0 }
  ];
  var PU = 'kg·m/s';

  G('phys1.momentum', function (R, ctx) {
    var L = lv(ctx), kind = pickT(R, ctx, ['p', 'p', 'rev'], ['p', 'two', 'two', 'cmp'], ['three', 'twoD', 'zero', 'two']);
    if (kind === 'p' || kind === 'rev') {
      var o = R.pick(MOVERS), m = R.pick(o.m), sp = R.pick(o.v), ax = axis(R), s = L === 1 && kind === 'p' && R.chance(0.5) ? 1 : pm(R), v = s * sp, p = m * v;
      var ms = D(m, o.md), vs = D(sp, o.vd);
      if (kind === 'rev') {
        var askM = R.coin(), pv = M.abs(p);
        return out({
          q: askM ? 'A ' + o.n + ' moving at $' + ud(sp, o.vd, 'm/s') + '$ has a momentum of magnitude $' + un(pv, PU, 4) + '$. What is its mass?'
            : 'A ' + o.n + ' with a mass of $' + ud(m, o.md, 'kg') + '$ has a momentum of magnitude $' + un(pv, PU, 4) + '$. How fast is the ' + o.n + ' moving?',
          a: A(askM ? m : sp, 0.01), unit: askM ? 'kg' : 'm/s',
          steps: ['Start from $p = mv$ and solve for the unknown: ' + (askM ? '$m = \\dfrac{p}{v}$.' : '$v = \\dfrac{p}{m}$.'),
            askM ? '$m = \\dfrac{' + un(pv, PU, 4) + '}{' + ud(sp, o.vd, 'm/s') + '} = ' + un(m, 'kg') + '$.' : '$v = \\dfrac{' + un(pv, PU, 4) + '}{' + ud(m, o.md, 'kg') + '} = ' + un(sp, 'm/s') + '$.',
            'Check the units: ' + (askM ? '$\\text{kg·m/s} \\div \\text{m/s} = \\text{kg}$.' : '$\\text{kg·m/s} \\div \\text{kg} = \\text{m/s}$.')],
          hint: 'Momentum is mass times velocity, so divide the momentum by the quantity you know.'
        }, { k: 'mom-rev', m: m, v: sp, p: pv, ask: askM ? 'm' : 'v' });
      }
      return out({
        q: 'A ' + o.n + ' with a mass of $' + ud(m, o.md, 'kg') + '$ moves ' + dw(ax, v) + ' at $' + ud(sp, o.vd, 'm/s') + '$. ' + ax.say + ' What is its momentum?',
        a: A(p, 0.01), unit: PU,
        steps: ['Momentum is mass times velocity, $p = mv$, and the velocity carries a sign.',
          'Moving ' + dw(ax, v) + ' with ' + ax.pos + ' positive means $v = ' + ud(v, o.vd, 'm/s') + '$.',
          '$p = (' + ud(m, o.md, 'kg') + ')(' + ud(v, o.vd, 'm/s') + ') = ' + un(p, PU) + '$.',
          v < 0 ? 'The minus sign says the momentum points ' + ax.neg + ', the same way the ' + o.n + ' moves.' : 'The momentum is positive: it points ' + ax.pos + ', the way the ' + o.n + ' moves.'],
        hint: 'Multiply mass by velocity, and give the velocity a sign from its direction.'
      }, { k: 'mom-p', m: m, v: v });
    }
    if (kind === 'cmp') { // which has the larger momentum (size)?
      var light = R.pick([{ n: 'baseball', m: 0.15, v: [20, 30, 40] }, { n: 'tennis ball', m: 0.06, v: [25, 50] }, { n: 'hockey puck', m: 0.17, v: [20, 30] }]);
      var heavy = R.pick([{ n: 'bowling ball', m: 6 }, { n: 'medicine ball', m: 4 }, { n: 'shot put', m: 4 }]);
      var vl = R.pick(light.v), pl = light.m * vl, rel = R.pick([1, 1.5, 0.5, 1]), vh = clean(pl * rel / heavy.m), ph = heavy.m * vh;
      var same = M.abs(pl - ph) < 1e-9, right = same ? 'They have the same size of momentum' : (pl > ph ? 'The ' + light.n : 'The ' + heavy.n);
      var choices = ['The ' + light.n, 'The ' + heavy.n, 'They have the same size of momentum'];
      return out({
        q: 'A ' + light.n + ' ($' + ud(light.m, 2, 'kg') + '$) flies at $' + ud(vl, 0, 'm/s') + '$. A ' + heavy.n + ' ($' + ud(heavy.m, 1, 'kg') + '$) rolls at $' + un(vh, 'm/s') + '$. Which has the larger momentum (in size)?',
        a: mc(right, choices.filter(function (c) { return c !== right; })),
        steps: ['Compare $p = mv$ for each, not the speeds alone.',
          light.n.charAt(0).toUpperCase() + light.n.slice(1) + ': $p = (' + ud(light.m, 2, 'kg') + ')(' + ud(vl, 0, 'm/s') + ') = ' + un(pl, PU) + '$.',
          heavy.n.charAt(0).toUpperCase() + heavy.n.slice(1) + ': $p = (' + ud(heavy.m, 1, 'kg') + ')(' + un(vh, 'm/s') + ') = ' + un(ph, PU) + '$.',
          same ? 'They are equal: a small fast object can carry as much momentum as a big slow one.' : right + ' has more momentum.'],
        hint: 'Momentum depends on mass and speed together: work out mv for both.'
      }, { k: 'mom-cmp', pl: pl, ph: ph });
    }
    if (kind === 'two' || kind === 'zero' || kind === 'three') {
      var ax2 = axis(R, R.pick([0, 1])), n = kind === 'three' ? 3 : 2, ms2 = R.sample([0.5, 1, 1.5, 2, 2.5, 3, 4], n), vs2 = [];
      for (var i = 0; i < n; i++) vs2.push(R.pick([0.5, 1, 1.5, 2, 2.5, 3]) * (i === 0 ? 1 : pm(R)));
      if (n === 2 && vs2[1] > 0 && R.chance(0.7)) vs2[1] = -vs2[1];
      if (kind === 'zero') {
        var okM = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5].filter(function (mm) { var vv = ms2[0] * vs2[0] / mm; return mm !== ms2[0] && M.abs(vv * 10 - M.round(vv * 10)) < 1e-9 && vv <= 6; });
        if (okM.length) ms2[1] = R.pick(okM); else ms2[1] = ms2[0];
        vs2[1] = -clean(ms2[0] * vs2[0] / ms2[1]);
      }
      var tot = 0; for (i = 0; i < n; i++) tot += ms2[i] * vs2[i]; tot = clean(tot); if (M.abs(tot) < 1e-9) tot = 0;
      var obj = R.pick(['cart', 'glider']), desc = [];
      for (i = 0; i < n; i++) desc.push(an(D(ms2[i], 1)) + ' $' + ud(ms2[i], 1, 'kg') + '$ ' + obj + ' moves ' + dw(ax2, vs2[i]) + ' at $' + uq(V1(M.abs(vs2[i])), 'm/s') + '$');
      var terms = ms2.map(function (mm, j) { return '(' + ud(mm, 1, 'kg') + ')(' + uq(V1(vs2[j]), 'm/s') + ')'; });
      var parts = ms2.map(function (mm, j) { return F(clean(mm * vs2[j])); });
      return out({
        q: 'On a straight, level track, ' + U.list(desc) + '. ' + ax2.say + ' What is the total momentum of the ' + (n === 2 ? 'two' : 'three') + ' ' + obj + 's?',
        a: A(tot, 0.01), unit: PU,
        steps: ['The total momentum is the sum of the momenta, each with its sign: $p_{\\text{tot}} = ' + ms2.map(function (_, j) { return 'm_' + (j + 1) + 'v_' + (j + 1); }).join(' + ') + '$.',
          '$p_{\\text{tot}} = ' + terms.join(' + ') + '$',
          '$p_{\\text{tot}} = ' + parts.map(function (s, j) { return j ? (s.charAt(0) === '-' ? ' - ' + s.slice(1) : ' + ' + s) : s; }).join('') + ' = ' + un(tot, PU) + '$.',
          M.abs(tot) < 1e-9 ? 'The momenta cancel exactly: the system has zero total momentum even though every ' + obj + ' is moving.' : 'Momenta in opposite directions partly cancel; the total points ' + dw(ax2, tot) + '.'],
        hint: 'Give each velocity a sign from its direction before you add the momenta.'
      }, { k: 'mom-tot', m: ms2, v: vs2 });
    }
    // twoD: two pucks moving at right angles
    var m1 = R.pick([0.17, 0.2, 0.25, 0.5]), m2 = R.pick([0.17, 0.2, 0.25, 0.5]), v1 = R.pick([3, 4, 5, 6, 8]), v2 = R.pick([3, 4, 5, 6, 8]);
    var p1 = m1 * v1, p2 = m2 * v2, pt = M.hypot(p1, p2), ang = M.atan2(p2, p1) / DEG, askAng = R.chance(0.35);
    return out({
      q: 'On frictionless ice, puck A ($' + ud(m1, 2, 'kg') + '$) slides east at $' + ud(v1, 1, 'm/s') + '$ and puck B ($' + ud(m2, 2, 'kg') + '$) slides north at $' + ud(v2, 1, 'm/s') + '$. ' + (askAng ? 'At what angle north of east does the total momentum of the two pucks point?' : 'What is the size of the total momentum of the two pucks?'),
      a: A(askAng ? ang : pt, 0.01), unit: askAng ? '°' : PU,
      steps: ['Momentum is a vector, so add components. East: $p_x = (' + ud(m1, 2, 'kg') + ')(' + ud(v1, 1, 'm/s') + ') = ' + un(p1, PU) + '$.',
        'North: $p_y = (' + ud(m2, 2, 'kg') + ')(' + ud(v2, 1, 'm/s') + ') = ' + un(p2, PU) + '$.',
        askAng ? '$\\theta = \\tan^{-1}\\!\\left(\\dfrac{p_y}{p_x}\\right) = \\tan^{-1}\\!\\left(\\dfrac{' + F(p2) + '}{' + F(p1) + '}\\right) = ' + F(ang) + '^\\circ$ north of east.'
          : '$|\\vec{p}_{\\text{tot}}| = \\sqrt{p_x^2 + p_y^2} = \\sqrt{' + P(F(p1)) + '^2 + ' + P(F(p2)) + '^2} = ' + un(pt, PU) + '$.',
        'Adding the two sizes, $' + F(p1 + p2) + '$, would be wrong: the momenta point in different directions.'],
      hint: 'Find the east and north parts of the total momentum, then combine them like the sides of a right triangle.'
    }, { k: 'mom-2d', m1: m1, v1: v1, m2: m2, v2: v2, ask: askAng ? 'ang' : 'mag' });
  });

  // ---------- impulse ----------
  G('phys1.impulse', function (R, ctx) {
    var kind = pickT(R, ctx, ['fdt', 'fdt', 'favg'], ['bounce', 'graph', 'favg', 'concept'], ['bounce', 'graph3', 'bounceF', 'concept']);
    if (kind === 'fdt' || kind === 'favg') {
      var C = R.pick([{ n: 'tennis ball', m: 0.058, md: 3, verb: 'A racket' }, { n: 'soccer ball', m: 0.43, md: 2, verb: 'A player\'s foot' }, { n: 'golf ball', m: 0.046, md: 3, verb: 'A club' }, { n: 'hockey puck', m: 0.17, md: 2, verb: 'A stick' }]);
      if (kind === 'fdt') {
        var Fv = R.pick([120, 150, 200, 240, 300, 360, 400]), dt = R.pick([0.004, 0.005, 0.006, 0.008, 0.01]), J = Fv * dt, askV = lv(ctx) > 1 || R.chance(0.4), vv = J / C.m;
        return out({
          q: C.verb + ' pushes a ' + C.n + ' that is at rest with an average force of $' + ud(Fv, 0, 'N') + '$ for $' + ud(dt, 3, 's') + '$. ' + (askV ? 'The ' + C.n + ' has a mass of $' + ud(C.m, C.md, 'kg') + '$. How fast is it moving when it leaves?' : 'What impulse does the ' + C.n + ' receive?'),
          a: A(askV ? vv : J, 0.01), unit: askV ? 'm/s' : 'N·s',
          steps: ['Impulse is average force times time: $J = F_{\\text{avg}}\\Delta t = (' + ud(Fv, 0, 'N') + ')(' + ud(dt, 3, 's') + ') = ' + un(J, 'N·s') + '$.'].concat(askV ? [
            'The impulse equals the change in momentum: $J = \\Delta p = m v_f - m v_i$, with $v_i = 0$.',
            '$v_f = \\dfrac{J}{m} = \\dfrac{' + un(J, 'N·s') + '}{' + ud(C.m, C.md, 'kg') + '} = ' + un(vv, 'm/s') + '$.'] : ['A newton-second is the same as a kilogram meter per second, the unit of momentum.']),
          hint: askV ? 'Find the impulse $F\\Delta t$ first; it equals the change in momentum.' : 'Multiply the average force by the time it acts.'
        }, { k: 'imp-fdt', F: Fv, dt: dt, m: C.m, ask: askV ? 'v' : 'J' });
      }
      var v2 = R.pick([10, 12, 15, 18, 20, 25]), dt2 = R.pick([0.005, 0.008, 0.01, 0.012, 0.02]), Fa = C.m * v2 / dt2;
      return out({
        q: 'A ' + C.n + ' ($' + ud(C.m, C.md, 'kg') + '$) at rest is struck and leaves at $' + ud(v2, 0, 'm/s') + '$. The contact lasts $' + ud(dt2, 3, 's') + '$. What average force acts on the ' + C.n + '?',
        a: A(Fa, 0.01), unit: 'N',
        steps: ['Change in momentum (it starts at rest, $v_i = 0$): $\\Delta p = m v_f - m v_i = (' + ud(C.m, C.md, 'kg') + ')(' + ud(v2, 0, 'm/s') + ') = ' + un(C.m * v2, PU) + '$.',
          'Impulse equals the change in momentum, $F_{\\text{avg}}\\Delta t = \\Delta p$, so $F_{\\text{avg}} = \\dfrac{\\Delta p}{\\Delta t}$.',
          '$F_{\\text{avg}} = \\dfrac{' + un(C.m * v2, PU) + '}{' + ud(dt2, 3, 's') + '} = ' + un(Fa, 'N') + '$.'],
        hint: 'Find the change in momentum, then divide by the contact time.'
      }, { k: 'imp-favg', m: C.m, v: v2, dt: dt2 });
    }
    if (kind === 'bounce' || kind === 'bounceF') {
      var mb = R.pick([0.2, 0.25, 0.4, 0.5, 0.6]), vi = R.pick([4, 5, 6, 8, 10]), stops = kind === 'bounce' && R.chance(0.3), vfb = stops ? 0 : R.pick([2, 3, 4, 5, 6].filter(function (x) { return x <= vi; })), towardPos = R.coin();
      var s = towardPos ? 1 : -1, vI = s * vi, vF = -s * vfb, dp = mb * (vF - vI), dtb = R.pick([0.01, 0.02, 0.025, 0.04, 0.05]), Fb = M.abs(dp) / dtb;
      var posWord = towardPos ? 'toward the wall' : 'away from the wall';
      var askF = kind === 'bounceF';
      return out({
        q: 'A ball ($' + ud(mb, 2, 'kg') + '$) moving at $' + ud(vi, 1, 'm/s') + '$ hits a wall head-on and ' + (stops ? 'stops dead (it sticks).' : 'bounces straight back at $' + ud(vfb, 1, 'm/s') + '$.') + (askF ? ' The contact lasts $' + ud(dtb, 3, 's') + '$. What is the size of the average force the wall exerts on the ball?' : ' Take the direction ' + posWord + ' as positive. What impulse does the wall give the ball?'),
        a: A(askF ? Fb : dp, 0.01), unit: askF ? 'N' : 'N·s',
        steps: [(askF ? 'Take the direction toward the wall as positive. ' : '') + 'Before: $v_i = ' + uq(V1(askF ? vi : vI), 'm/s') + '$. After: $v_f = ' + uq(V1(askF ? -vfb : vF), 'm/s') + '$' + (stops ? '' : ' (the ball now moves the other way, so the sign flips)') + '.',
          'Impulse equals the change in momentum: $J = m(v_f - v_i) = (' + ud(mb, 2, 'kg') + ')(' + F(askF ? -vfb : vF) + ' - ' + P(F(askF ? vi : vI)) + ')\\ \\text{m/s} = ' + un(askF ? -mb * (vfb + vi) : dp, 'N·s') + '$.'].concat(askF ? [
            'Average force: $|F_{\\text{avg}}| = \\dfrac{|J|}{\\Delta t} = \\dfrac{' + un(M.abs(dp), 'N·s') + '}{' + ud(dtb, 3, 's') + '} = ' + un(Fb, 'N') + '$.'] : [
            stops ? 'The impulse points away from the wall: the wall pushes the ball back while it stops it.' : 'The size, $' + un(M.abs(dp), 'N·s') + '$, is bigger than for a ball that just stops ($' + un(mb * vi, 'N·s') + '$): the wall must stop the ball and then send it back.']),
        hint: stops ? 'The final velocity is zero; keep the sign of the initial velocity.' : 'The ball reverses direction, so its final velocity has the opposite sign from its initial velocity.'
      }, { k: 'imp-bounce', m: mb, vi: vI, vf: vF, dt: dtb, ask: askF ? 'F' : 'J', s: s });
    }
    if (kind === 'graph' || kind === 'graph3') {
      var tri = R.coin(), Fm = R.pick([10, 12, 15, 20, 24, 30]), t1 = R.pick([0.1, 0.2]), t2 = t1 + R.pick([0.1, 0.2, 0.3]), t3 = t2 + t1;
      if (tri) t2 = t1;
      var pts = tri ? [[0, 0], [t1, Fm], [clean(2 * t1), 0]] : [[0, 0], [t1, Fm], [clean(t2), Fm], [clean(t3), 0]], tEnd = pts[pts.length - 1][0];
      var Jg = tri ? 0.5 * Fm * 2 * t1 : 0.5 * Fm * t1 * 2 + Fm * (t2 - t1); Jg = clean(Jg);
      var mg = R.pick([0.5, 1, 1.5, 2, 2.5, 3]), v0 = kind === 'graph3' ? -R.pick([0.5, 1, 1.5, 2]) : 0, vf = clean(v0 + Jg / mg);
      var ask = kind === 'graph' ? R.pick(['J', 'v']) : 'v';
      var area = tri ? '$J = \\tfrac{1}{2}(\\text{base})(\\text{height}) = \\tfrac{1}{2}(' + ud(2 * t1, 1, 's') + ')(' + ud(Fm, 0, 'N') + ') = ' + un(Jg, 'N·s') + '$.'
        : 'The area is two triangles and a rectangle: $J = \\tfrac{1}{2}(' + ud(t1, 1, 's') + ')(' + ud(Fm, 0, 'N') + ') \\times 2 + (' + ud(t2 - t1, 1, 's') + ')(' + ud(Fm, 0, 'N') + ') = ' + un(Jg, 'N·s') + '$.';
      return out({
        q: 'The graph shows the net force on a cart ($' + ud(mg, 1, 'kg') + '$) along a level track, with the push in the positive direction. ' + (v0 < 0 ? 'Before the push the cart rolls in the negative direction at $' + ud(-v0, 1, 'm/s') + '$. What is its velocity after the push?' : ask === 'J' ? 'What impulse does the push give the cart?' : 'The cart starts at rest. How fast is it moving after the push?'),
        a: A(ask === 'J' ? Jg : vf, 0.01), unit: ask === 'J' ? 'N·s' : 'm/s',
        viz: { name: 'ph-graph', opts: { pts: pts, xlab: 't', xunit: 's', ylab: 'F', yunit: 'N', tool: 'area', a: 0, b: tEnd, quiet: true, interactive: false, drag: false, range: [0, Fm * 1.25] } },
        steps: ['The impulse is the area under the force–time graph. ' + area].concat(ask === 'J' ? ['The unit of area is newtons times seconds: $\\text{N·s}$.'] : [
          'Impulse equals the change in momentum: $J = m v_f - m v_i$, so $v_f = v_i + \\dfrac{J}{m}$.',
          '$v_f = ' + uq(V1(v0), 'm/s') + ' + \\dfrac{' + un(Jg, 'N·s') + '}{' + ud(mg, 1, 'kg') + '} = ' + uq(V1(vf), 'm/s') + '$.' + (v0 < 0 ? (vf > 0 ? ' The push reversed the cart.' : vf < 0 ? ' The cart still rolls the negative way, more slowly.' : ' The push stopped the cart.') : '')]),
        hint: 'Find the area under the graph; that area is the impulse, and the impulse is the change in momentum.'
      }, { k: 'imp-graph', pts: pts, m: mg, v0: v0, ask: ask });
    }
    // concept
    var item = R.int(0, 2);
    if (item === 0) return out({
      q: 'Two balls of equal mass hit a wall at the same speed. Ball A is clay and sticks to the wall. Ball B is rubber and bounces straight back at almost the same speed. Which statement is true?',
      a: mc('Ball B has the larger change in momentum.', ['Ball A has the larger change in momentum, because it loses all of its speed.', 'Both have the same change in momentum, because they hit at the same speed.', 'Neither changes its momentum, because momentum is conserved.']),
      steps: ['Take the direction toward the wall as positive, and call the speed $v$.', 'Ball A: $\\Delta p = m(0 - v) = -mv$.', 'Ball B: $\\Delta p = m(-v - v) = -2mv$.', 'Ball B\'s change is about twice as big: the wall has to stop it and then push it back. The wall gives B the larger impulse.'],
      hint: 'Write each ball\'s final velocity with a sign. Bouncing back means the velocity changes sign.'
    }, { k: 'concept' });
    if (item === 1) return out({
      q: 'Two identical eggs are dropped from the same height. One lands on a pillow, the other on a hard floor, and both stop. Compared with the floor, the pillow…',
      a: mc('gives the same impulse over a longer time, so the force is smaller.', ['gives a smaller impulse, so the egg survives.', 'gives a larger impulse over a longer time.', 'gives the same force for a longer time.']),
      steps: ['Both eggs hit at the same speed and end at rest, so each has the same change in momentum, $\\Delta p = m(0 - v)$.', 'So the impulse $F_{\\text{avg}}\\Delta t$ is the same for both.', 'The pillow squashes, which stretches the stopping time $\\Delta t$, so the average force $F_{\\text{avg}} = \\Delta p / \\Delta t$ is smaller.'],
      hint: 'Do the two eggs have the same change in momentum? Then think about how long each stop lasts.'
    }, { k: 'concept' });
    return out({
      q: 'A force–time graph for a collision is a tall, narrow spike. A second collision gives the same object the same change in momentum, but its force–time graph is low and wide. What is the same for the two graphs?',
      a: mc('The area under the graph', ['The peak force', 'The time the force acts', 'The slope of the rising side']),
      steps: ['The area under a force–time graph is the impulse, $J = \\Delta p$.', 'The two collisions give the same $\\Delta p$, so the areas are equal.', 'A short collision needs a tall spike to make that area; a long one makes the same area with a smaller force.'],
      hint: 'Which feature of a force–time graph equals the change in momentum?'
    }, { k: 'concept' });
  });

  // ---------- conservation of momentum: shared collision maker ----------
  /* collide(R, opts): masses in tenths of a kilogram and velocities in tenths of a m/s (integers), so every value is exact.
     Object 1 starts on the left moving right (+) faster than object 2, so they meet. After: v1' <= v2' (they separate or
     move together) and the kinetic energy does not grow. Returns {m1, m2, v1, v2, u1, u2} in SI. */
  function collide(R, o) {
    o = o || {};
    for (var tries = 0; tries < 600; tries++) {
      var m1 = R.pick(o.m || [2, 3, 4, 5, 6, 8, 10, 15, 20]), m2 = R.pick(o.m || [2, 3, 4, 5, 6, 8, 10, 15, 20]);
      var v1 = R.int(o.v1lo || 5, o.v1hi || 30), v2 = o.rest ? 0 : R.int(o.v2lo != null ? o.v2lo : -20, o.v2hi != null ? o.v2hi : 10);
      if (v2 >= v1 || (o.v2neg && v2 >= 0)) continue;
      var Pt = m1 * v1 + m2 * v2, u1, u2;
      if (o.elastic) { u1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2); u2 = (2 * m1 * v1 + (m2 - m1) * v2) / (m1 + m2); if (u1 % 1 || u2 % 1) continue; }
      else if (o.stick === true) { u1 = u2 = Pt / (m1 + m2); if (u1 % 1) continue; }
      else { u1 = R.int(-25, 25); if ((Pt - m1 * u1) % m2 !== 0) continue; u2 = (Pt - m1 * u1) / m2; }
      if (u2 < u1 || u1 === v1 || u2 === v2) continue;
      if (o.stick === false && u1 === u2) continue;
      var K0 = m1 * v1 * v1 + m2 * v2 * v2, K1 = m1 * u1 * u1 + m2 * u2 * u2;
      if (K1 > K0) continue;
      if (o.lossy && K1 === K0) continue;
      if (M.abs(u2) > 40) continue;
      return { m1: m1 / 10, m2: m2 / 10, v1: v1 / 10, v2: v2 / 10, u1: u1 / 10, u2: u2 / 10 };
    }
    return o.stick === true ? { m1: 0.4, m2: 0.6, v1: 1.5, v2: 0, u1: 0.6, u2: 0.6 } : o.elastic ? { m1: 1, m2: 1, v1: 2, v2: 0, u1: 0, u2: 2 } : { m1: 0.4, m2: 0.6, v1: 1.5, v2: 0, u1: 0.3, u2: 0.8 };
  }
  function vtxt(ax, v) { return Math.abs(v) < 1e-9 ? 'is at rest' : 'moves ' + dw(ax, v) + ' at $' + uq(V1(M.abs(v)), 'm/s') + '$'; }

  G('phys1.momentum-conservation', function (R, ctx) {
    var kind = pickT(R, ctx, ['v2', 'v2'], ['v2', 'v1', 'concept'], ['v1', 'mass', 'concept']);
    var ax = axis(R, 0), obj = R.pick(['glider', 'cart']), where = obj === 'glider' ? 'On a frictionless air track' : 'On a level track with negligible friction';
    if (kind === 'v2' || kind === 'v1' || kind === 'mass') {
      var c = collide(R, kind === 'v2' ? { rest: lv(ctx) === 1 } : kind === 'v1' ? { v2neg: R.chance(0.6) } : {});
      var Pt = clean(c.m1 * c.v1 + c.m2 * c.v2);
      var before = '$m_1 v_1 + m_2 v_2 = (' + ud(c.m1, 1, 'kg') + ')(' + uq(V1(c.v1), 'm/s') + ') + (' + ud(c.m2, 1, 'kg') + ')(' + uq(V1(c.v2), 'm/s') + ') = ' + un(Pt, PU) + '$.';
      if (kind === 'mass') {
        return out({
          q: where + ', ' + obj + ' 1 ($' + ud(c.m1, 1, 'kg') + '$) ' + vtxt(ax, c.v1) + ' toward ' + obj + ' 2, which ' + vtxt(ax, c.v2) + '. After they collide, ' + obj + ' 1 ' + vtxt(ax, c.u1) + ' and ' + obj + ' 2 ' + vtxt(ax, c.u2) + '. ' + ax.say + ' What is the mass of ' + obj + ' 2?',
          a: A(c.m2, 0.01), unit: 'kg',
          steps: ['No net outside force acts along the track, so $m_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'$.',
            'Collect the $m_2$ terms: $m_2 (v_2\' - v_2) = m_1 (v_1 - v_1\')$.',
            '$m_2 = \\dfrac{m_1 (v_1 - v_1\')}{v_2\' - v_2} = \\dfrac{(' + ud(c.m1, 1, 'kg') + ')(' + F(c.v1) + ' - ' + P(F(c.u1)) + ')\\ \\text{m/s}}{(' + F(c.u2) + ' - ' + P(F(c.v2)) + ')\\ \\text{m/s}} = ' + un(c.m2, 'kg') + '$.',
            'Check: momentum before $= ' + un(Pt, PU) + '$; after $= (' + ud(c.m1, 1, 'kg') + ')(' + uq(V1(c.u1), 'm/s') + ') + (' + un(c.m2, 'kg') + ')(' + uq(V1(c.u2), 'm/s') + ') = ' + un(c.m1 * c.u1 + c.m2 * c.u2, PU) + '$.'],
          hint: 'Write momentum before = momentum after, then solve for the one unknown mass.'
        }, { k: 'mc-mass', c: c });
      }
      var ask2 = kind === 'v2', ans = ask2 ? c.u2 : c.u1;
      return out({
        q: where + ', ' + obj + ' 1 ($' + ud(c.m1, 1, 'kg') + '$) ' + vtxt(ax, c.v1) + ' and ' + obj + ' 2 ($' + ud(c.m2, 1, 'kg') + '$) ' + vtxt(ax, c.v2) + '. They collide. Afterward, ' + obj + ' ' + (ask2 ? '1 ' + vtxt(ax, c.u1) : '2 ' + vtxt(ax, c.u2)) + '. ' + ax.say + ' What is the velocity of ' + obj + ' ' + (ask2 ? 2 : 1) + ' after the collision?',
        a: A(ans, 0.01), unit: 'm/s',
        steps: ['The track has no friction, and gravity and the normal force cancel, so the total momentum of the two ' + obj + 's is the same before and after.',
          'Before: ' + before,
          'After: $' + (ask2 ? '(' + ud(c.m1, 1, 'kg') + ')(' + uq(V1(c.u1), 'm/s') + ') + (' + ud(c.m2, 1, 'kg') + ')v_2\'' : '(' + ud(c.m1, 1, 'kg') + ')v_1\' + (' + ud(c.m2, 1, 'kg') + ')(' + uq(V1(c.u2), 'm/s') + ')') + ' = ' + un(Pt, PU) + '$.',
          ask2 ? '$v_2\' = \\dfrac{' + F(Pt) + (c.u1 ? ' - ' + P(F(clean(c.m1 * c.u1))) : '') + '}{' + F(c.m2) + '}\\ \\text{m/s} = ' + uq(V1(ans), 'm/s') + '$.' : '$v_1\' = \\dfrac{' + F(Pt) + (c.u2 ? ' - ' + P(F(clean(c.m2 * c.u2))) : '') + '}{' + F(c.m1) + '}\\ \\text{m/s} = ' + uq(V1(ans), 'm/s') + '$.',
          ans < 0 ? 'The minus sign means it moves ' + ax.neg + ' after the collision.' : M.abs(ans) < 1e-9 ? 'It ends at rest.' : 'It moves ' + ax.pos + ' after the collision.'],
        hint: 'Total momentum before equals total momentum after. Keep the signs of the velocities.'
      }, { k: 'mc-v', c: c, ask: ask2 ? 'u2' : 'u1' });
    }
    var item = R.int(0, 3);
    var C = [
      { q: 'Two carts collide on a level, frictionless track. In which case is the total momentum of the two carts the same just before and just after the collision?', r: 'Whether they bounce apart or stick together', w: ['Only when they bounce apart elastically', 'Only when they stick together', 'Only when one of them starts at rest'],
        s: ['During the collision the carts push on each other with equal and opposite forces (Newton\'s third law) for the same time.', 'So their momentum changes are equal and opposite, and the total does not change.', 'That argument never asks whether they bounce or stick. Kinetic energy may be lost; momentum is not.'] },
      { q: 'A ball falls toward the ground (ignore air resistance). Which momentum stays constant while it falls?', r: 'The momentum of the ball and Earth together', w: ['The momentum of the ball alone', 'Neither, because gravity acts', 'The momentum of Earth alone'],
        s: ['Gravity from Earth is an outside force on the ball alone, so the ball\'s momentum grows as it falls.', 'If the system is the ball and Earth, gravity is an internal pair of forces: the ball pulls Earth up as hard as Earth pulls the ball down.', 'So the ball–Earth system\'s total momentum stays constant. Earth\'s tiny upward speed carries momentum equal and opposite to the ball\'s.'] },
      { q: 'During a collision, cart A (2 kg) pushes on cart B (1 kg). Compared with A\'s push on B, B\'s push on A is…', r: 'equal in size and opposite in direction', w: ['half as big, because B has half the mass', 'twice as big, because B speeds up more', 'zero, if B was at rest'],
        s: ['Newton\'s third law: the two forces of an interaction are equal in size and opposite in direction.', 'They act for the same time, so the impulses on A and B are equal and opposite.', 'That is why the total momentum stays the same. B\'s velocity changes more only because its mass is smaller.'] },
      { q: 'A skater stands at rest on frictionless ice and throws a heavy ball forward. Afterward, what is the total momentum of the skater and the ball?', r: 'Zero', w: ['Forward, equal to the ball\'s momentum', 'Backward, equal to the skater\'s momentum', 'It depends on how hard she throws'],
        s: ['Before the throw nothing moves, so the total momentum is zero.', 'The forces between skater and ball are internal, and the ice gives no sideways force.', 'So the total stays zero: the ball\'s forward momentum and the skater\'s backward momentum cancel.'] }
    ][item];
    return out({ q: C.q, a: mc(C.r, C.w), steps: C.s, hint: 'Ask which forces are inside the system and which come from outside it.' }, { k: 'concept' });
  });

  // ---------- sticking collisions ----------
  G('phys1.inelastic-collisions', function (R, ctx) {
    var kind = pickT(R, ctx, ['rest', 'rest', 'moving'], ['moving', 'rest', 'Klost'], ['dart', 'Klost', 'frac', 'moving']);
    if (kind === 'dart') {
      var md = R.pick([0.02, 0.025, 0.05, 0.1]), Mb = R.pick([1, 1.5, 2, 2.5, 4]), V = R.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), vd_ = (md + Mb) * V / md;
      return out({
        q: 'A $' + ud(md, 3, 'kg') + '$ dart is fired into a $' + ud(Mb, 1, 'kg') + '$ block of wood resting on frictionless ice. The dart sticks, and the block and dart slide off together at $' + ud(V, 1, 'm/s') + '$. How fast was the dart moving just before it hit?',
        a: A(vd_, 0.01), unit: 'm/s',
        steps: ['The dart and block stick, so they share one final velocity. Momentum is conserved: $m v = (m + M) V$.',
          'Solve for the dart\'s speed: $v = \\dfrac{(m + M)V}{m}$.',
          '$v = \\dfrac{(' + ud(md, 3, 'kg') + ' + ' + ud(Mb, 1, 'kg') + ')(' + ud(V, 1, 'm/s') + ')}{' + ud(md, 3, 'kg') + '} = ' + un(vd_, 'm/s') + '$.',
          'The block moves much more slowly than the dart did because the same momentum is shared by much more mass.'],
        hint: 'Momentum before (dart only) equals momentum after (dart and block moving together).'
      }, { k: 'in-dart', m: md, M: Mb, V: V });
    }
    var ax = axis(R, R.pick([0, 1])), C = R.pick([
      { n1: 'railroad car', n2: 'railroad car', m: [[20000, 25000, 30000, 40000], [15000, 20000, 30000, 35000]], v: [1, 1.5, 2, 2.5, 3], md: 0, verb: 'couple together' },
      { n1: 'cart with Velcro', n2: 'cart with Velcro', m: [[0.5, 1, 1.5, 2], [0.5, 1, 1.5, 2, 3]], v: [0.6, 0.8, 1, 1.2, 1.5, 2], md: 1, verb: 'stick together' },
      { n1: 'football player', n2: 'football player', m: [[90, 100, 110], [75, 80, 85, 95]], v: [3, 4, 5, 6], md: 0, verb: 'hold on to each other' }]);
    var m1 = R.pick(C.m[0]), m2 = R.pick(C.m[1]), v1 = R.pick(C.v), v2 = 0;
    if (kind === 'moving' || (kind === 'Klost' && R.coin())) { v2 = R.pick(C.v.filter(function (x) { return x !== v1; })); if (R.chance(0.65)) v2 = -v2; else if (v2 > v1) { var t = v1; v1 = v2; v2 = t; } }
    var Mt = m1 + m2, Pt = clean(m1 * v1 + m2 * v2), V2 = Pt / Mt, K0 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2, K1 = 0.5 * Mt * V2 * V2;
    var mdp = C.md, vdp = C.v[0] % 1 ? 1 : 0;
    var setup = 'A ' + C.n1 + ' ($' + ud(m1, mdp, 'kg') + '$) ' + vtxt(ax, v1).replace('$' + un(M.abs(v1), 'm/s') + '$', '$' + ud(M.abs(v1), 1, 'm/s') + '$') + ' and ' + (v2 === 0 ? 'runs into a ' + C.n2 + ' ($' + ud(m2, mdp, 'kg') + '$) at rest.' : 'meets a ' + C.n2 + ' ($' + ud(m2, mdp, 'kg') + '$) that moves ' + dw(ax, v2) + ' at $' + ud(M.abs(v2), 1, 'm/s') + '$.') + ' They ' + C.verb + '.';
    var stepsV = ['They stick, so they move off with one shared velocity $v$. Momentum is conserved: $m_1 v_1 + m_2 v_2 = (m_1 + m_2) v$.',
      'Before: $(' + ud(m1, mdp, 'kg') + ')(' + uq(V1(v1), 'm/s') + ') + (' + ud(m2, mdp, 'kg') + ')(' + uq(V1(v2), 'm/s') + ') = ' + un(Pt, PU) + '$.',
      '$v = \\dfrac{' + un(Pt, PU) + '}{' + ud(Mt, mdp, 'kg') + '} = ' + uq(V1(V2), 'm/s') + '$.'];
    if (kind === 'Klost' || kind === 'frac') {
      var lost = K0 - K1;
      if (kind === 'frac') {
        var fr = 100 * lost / K0;
        return out({
          q: setup + ' What percent of the kinetic energy is changed into other forms (thermal energy, sound and so on) in the collision?',
          a: Object.assign(A(fr, 0.01), { pct: true }),
          steps: stepsV.concat(['Kinetic energy before: $K_i = ' + (v2 === 0 ? '\\tfrac{1}{2}m_1 v_1^2' : '\\tfrac{1}{2}m_1 v_1^2 + \\tfrac{1}{2}m_2 v_2^2') + ' = ' + un(K0, 'J') + '$.', 'After: $K_f = \\tfrac{1}{2}(m_1 + m_2)v^2 = ' + un(K1, 'J') + '$.', 'Fraction lost: $\\dfrac{K_i - K_f}{K_i} = \\dfrac{' + un(lost, 'J') + '}{' + un(K0, 'J') + '} = ' + F(fr) + '\\%$.']),
          hint: 'Find the shared velocity with momentum, then compare the kinetic energy before and after.'
        }, { k: 'in-frac', m1: m1, m2: m2, v1: v1, v2: v2 });
      }
      return out({
        q: setup + ' How much kinetic energy is lost in the collision?',
        a: A(lost, 0.02), unit: 'J',
        steps: stepsV.concat(['Kinetic energy before: $K_i = ' + (v2 === 0 ? '\\tfrac{1}{2}m_1 v_1^2' : '\\tfrac{1}{2}m_1 v_1^2 + \\tfrac{1}{2}m_2 v_2^2') + ' = ' + un(K0, 'J') + '$.', 'After: $K_f = \\tfrac{1}{2}(m_1 + m_2)v^2 = \\tfrac{1}{2}(' + ud(Mt, mdp, 'kg') + ')(' + uq(V1(V2), 'm/s') + ')^2 = ' + un(K1, 'J') + '$.', 'Lost: $K_i - K_f = ' + un(lost, 'J') + '$. Momentum is conserved, but this energy becomes thermal energy, sound and bent material.']),
        hint: 'Momentum gives the shared final velocity; then compare ½mv² before and after.'
      }, { k: 'in-K', m1: m1, m2: m2, v1: v1, v2: v2 });
    }
    return out({
      q: setup + ' ' + ax.say + ' What is their velocity just after the collision?',
      a: A(V2, 0.01), unit: 'm/s',
      steps: stepsV.concat([M.abs(V2) < 1e-9 ? 'The momenta cancel, so the pair stops dead.' : 'The sign says they move ' + dw(ax, V2) + ' together.']),
      hint: 'After sticking they move as one object of mass m₁ + m₂. Use momentum before = momentum after.'
    }, { k: 'in-v', m1: m1, m2: m2, v1: v1, v2: v2 });
  });

  // ---------- elastic and inelastic ----------
  G('phys1.elastic-collisions', function (R, ctx) {
    var kind = pickT(R, ctx, ['classify', 'classify', 'formula'], ['classify', 'Klost', 'formula', 'concept'], ['general', 'Klost', 'formula', 'classify']);
    var ax = axis(R, 0), obj = 'cart';
    if (kind === 'classify' || kind === 'Klost') {
      var typ = kind === 'Klost' ? 'lossy' : R.pick(['elastic', 'elastic', 'lossy', 'stick']);
      var c = collide(R, typ === 'elastic' ? { elastic: true, m: [5, 10, 15, 20, 30, 40] } : typ === 'stick' ? { stick: true, m: [5, 10, 15, 20, 30, 40] } : { lossy: true, stick: false, m: [5, 10, 15, 20, 30, 40] });
      var K0 = 0.5 * c.m1 * c.v1 * c.v1 + 0.5 * c.m2 * c.v2 * c.v2, K1 = 0.5 * c.m1 * c.u1 * c.u1 + 0.5 * c.m2 * c.u2 * c.u2;
      var el = M.abs(K1 - K0) < 1e-9, stick = M.abs(c.u1 - c.u2) < 1e-9;
      var q0 = 'On a frictionless track, cart 1 ($' + ud(c.m1, 1, 'kg') + '$) ' + vtxt(ax, c.v1) + ' and cart 2 ($' + ud(c.m2, 1, 'kg') + '$) ' + vtxt(ax, c.v2) + '. After they collide, ' + (stick ? 'they move together at $' + uq(V1(M.abs(c.u1)), 'm/s') + '$ ' + dw(ax, c.u1) + '.' : 'cart 1 ' + vtxt(ax, c.u1) + ' and cart 2 ' + vtxt(ax, c.u2) + '.');
      var kS = ['Kinetic energy before: $K_i = \\tfrac{1}{2}(' + ud(c.m1, 1, 'kg') + ')(' + uq(V1(c.v1), 'm/s') + ')^2 + \\tfrac{1}{2}(' + ud(c.m2, 1, 'kg') + ')(' + uq(V1(c.v2), 'm/s') + ')^2 = ' + un(K0, 'J') + '$.',
        'After: $K_f = \\tfrac{1}{2}(' + ud(c.m1, 1, 'kg') + ')(' + uq(V1(c.u1), 'm/s') + ')^2 + \\tfrac{1}{2}(' + ud(c.m2, 1, 'kg') + ')(' + uq(V1(c.u2), 'm/s') + ')^2 = ' + un(K1, 'J') + '$.'];
      var momS = 'Momentum checks out: $' + un(c.m1 * c.v1 + c.m2 * c.v2, PU) + '$ before and $' + un(c.m1 * c.u1 + c.m2 * c.u2, PU) + '$ after, as in every collision on a frictionless track.';
      if (kind === 'Klost') return out({
        q: q0 + ' How much kinetic energy was changed into other forms?', a: A(K0 - K1, 0.01), unit: 'J',
        steps: kS.concat(['Lost: $K_i - K_f = ' + un(K0 - K1, 'J') + '$, which becomes thermal energy and sound. The collision is inelastic, yet ' + momS.charAt(0).toLowerCase() + momS.slice(1)]),
        hint: 'Work out ½mv² for each cart before and after, then subtract.'
      }, { k: 'el-K', c: c });
      var right = el ? 'Elastic: the total kinetic energy is the same' : stick ? 'Perfectly inelastic: they stick, and the most kinetic energy is lost' : 'Inelastic: some kinetic energy is lost, and they move apart';
      var all = ['Elastic: the total kinetic energy is the same', 'Inelastic: some kinetic energy is lost, and they move apart', 'Perfectly inelastic: they stick, and the most kinetic energy is lost', 'Impossible: momentum is not conserved'];
      return out({
        q: q0 + ' What kind of collision is this?', a: mc(right, all.filter(function (x) { return x !== right; })),
        steps: kS.concat([el ? 'The kinetic energy is the same before and after, so the collision is elastic.' : 'Kinetic energy went down by $' + un(K0 - K1, 'J') + '$, so the collision is ' + (stick ? 'perfectly inelastic (they stick together).' : 'inelastic.'), momS]),
        hint: 'Compare the total kinetic energy before and after. Momentum is conserved either way.'
      }, { k: 'el-class', c: c });
    }
    if (kind === 'formula' || kind === 'general') {
      var tries = 0, m1, m2, v1, v2 = 0, u1, u2;
      do { // elastic: v1' = ((m1 − m2) v1 + 2 m2 v2)/(m1 + m2), v2' = (2 m1 v1 + (m2 − m1) v2)/(m1 + m2)
        m1 = R.pick([1, 2, 3, 4, 5, 6]); m2 = R.pick([1, 2, 3, 4, 5, 6]); v1 = R.pick([2, 3, 4, 5, 6, 8]);
        v2 = kind === 'general' ? -R.pick([1, 2, 3, 4]) : 0; tries++;
        u1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2); u2 = (2 * m1 * v1 + (m2 - m1) * v2) / (m1 + m2);
      } while (tries < 200 && (m1 === m2 && kind === 'formula' && R.chance(0.7) || M.abs(u1 * 100 - M.round(u1 * 100)) > 1e-6 || M.abs(u2 * 100 - M.round(u2 * 100)) > 1e-6));
      u1 = clean(u1); u2 = clean(u2);
      var askOne = R.coin(), ans = askOne ? u1 : u2;
      var st = kind === 'general' ? [
        'Elastic means two rules hold: momentum is conserved, and the carts separate as fast as they approached: $v_2\' - v_1\' = v_1 - v_2 = ' + F(v1) + ' - ' + P(F(v2)) + ' = ' + un(v1 - v2, 'm/s') + '$.',
        'Momentum: $(' + ud(m1, 1, 'kg') + ')v_1\' + (' + ud(m2, 1, 'kg') + ')v_2\' = (' + ud(m1, 1, 'kg') + ')(' + ud(v1, 1, 'm/s') + ') + (' + ud(m2, 1, 'kg') + ')(' + uq(D(v2, 1), 'm/s') + ') = ' + un(m1 * v1 + m2 * v2, PU) + '$.',
        'Put $v_2\' = v_1\' + ' + F(v1 - v2) + '$ into the momentum equation: $' + F(m1 + m2) + 'v_1\' + ' + P(F(m2 * (v1 - v2))) + ' = ' + F(m1 * v1 + m2 * v2) + '$, so $v_1\' = ' + uq(V1(u1), 'm/s') + '$.',
        'Then $v_2\' = ' + F(u1) + ' + ' + F(v1 - v2) + ' = ' + uq(V1(u2), 'm/s') + '$. The question asks for cart ' + (askOne ? 1 : 2) + ': $' + uq(V1(ans), 'm/s') + '$.']
        : [m1 === m2 ? 'Equal masses in an elastic collision swap velocities: the moving cart stops and the other takes its velocity.' : 'For an elastic collision with cart 2 at rest, momentum and kinetic energy together give $v_1\' = \\dfrac{m_1 - m_2}{m_1 + m_2}v_1$ and $v_2\' = \\dfrac{2m_1}{m_1 + m_2}v_1$.',
          askOne ? '$v_1\' = \\dfrac{' + F(m1) + ' - ' + F(m2) + '}{' + F(m1) + ' + ' + F(m2) + '}(' + ud(v1, 1, 'm/s') + ') = ' + uq(V1(u1), 'm/s') + '$.' : '$v_2\' = \\dfrac{2(' + F(m1) + ')}{' + F(m1) + ' + ' + F(m2) + '}(' + ud(v1, 1, 'm/s') + ') = ' + uq(V1(u2), 'm/s') + '$.',
          'Check momentum: $(' + ud(m1, 1, 'kg') + ')(' + uq(V1(u1), 'm/s') + ') + (' + ud(m2, 1, 'kg') + ')(' + uq(V1(u2), 'm/s') + ') = ' + un(m1 * u1 + m2 * u2, PU) + '$, the same as before.',
          askOne ? (u1 < 0 ? 'The lighter cart bounces back (negative velocity).' : M.abs(u1) < 1e-9 ? 'Cart 1 stops.' : 'The heavier cart keeps going, more slowly.') : 'Cart 2 moves off ' + ax.pos + '.'];
      return out({
        q: 'On a frictionless track, cart 1 ($' + ud(m1, 1, 'kg') + '$) moves ' + ax.pos + ' at $' + ud(v1, 1, 'm/s') + '$ toward cart 2 ($' + ud(m2, 1, 'kg') + '$), which ' + (v2 === 0 ? 'is at rest' : 'moves ' + ax.neg + ' at $' + ud(-v2, 1, 'm/s') + '$') + '. The collision is elastic. ' + ax.say + ' What is the velocity of cart ' + (askOne ? 1 : 2) + ' after the collision?',
        a: A(ans, 0.01), unit: 'm/s', steps: st,
        hint: kind === 'general' ? 'Use momentum conservation together with "separation speed = approach speed".' : 'Use the elastic-collision results for a target at rest, and keep the sign.'
      }, { k: 'el-v', m1: m1, m2: m2, v1: v1, v2: v2, ask: askOne ? 'u1' : 'u2' });
    }
    return out({
      q: 'Two carts collide on a level, frictionless track. Which statement is always true?',
      a: mc('Momentum is conserved, but kinetic energy is conserved only if the collision is elastic.', ['Both momentum and kinetic energy are always conserved.', 'Kinetic energy is always conserved, but momentum is conserved only if they bounce.', 'Neither is conserved if the carts stick together.']),
      steps: ['The carts exert equal and opposite forces on each other for the same time, so the total momentum never changes, bouncy or sticky.', 'Kinetic energy is a different story: crumpling, heating and sound can take some of it.', 'Only in an elastic collision does the total kinetic energy come back unchanged.'],
      hint: 'One of the two quantities can turn into thermal energy and sound. Which one?'
    }, { k: 'concept' });
  });

  // ---------- explosions and recoil ----------
  G('phys1.explosions-recoil', function (R, ctx) {
    var kind = pickT(R, ctx, ['rest', 'rest'], ['rest', 'split', 'concept'], ['Krel', 'split', 'concept', 'rest']);
    var C = R.pick([
      { a: 'skater', b: 'skater', ma: [40, 45, 50, 55], mb: [60, 70, 75, 80, 90], va: [1.2, 1.5, 1.8, 2, 2.4], dp: 0, intro: 'Two skaters stand at rest on smooth ice and push off each other.', sa: 'The first skater', sb: 'the second skater' },
      { a: 'cannonball', b: 'cannon', ma: [5, 8, 10], mb: [500, 800, 1000, 1200], va: [100, 120, 150, 200], dp: 0, intro: 'A cannon on frictionless wheels, at rest, fires a cannonball horizontally.', sa: 'The cannonball', sb: 'the cannon' },
      { a: 'tool', b: 'astronaut', ma: [2, 3, 4, 5], mb: [80, 90, 100, 120], va: [3, 4, 5, 6], dp: 0, intro: 'An astronaut floating at rest outside a space station throws a tool.', sa: 'The tool', sb: 'the astronaut' },
      { a: 'cart', b: 'cart', ma: [0.5, 0.75, 1, 1.5], mb: [1, 1.5, 2, 3], va: [0.6, 0.8, 1.2, 1.5, 2], dp: 2, intro: 'Two carts at rest on a track are held together with a compressed spring between them, then released.', sa: 'The first cart', sb: 'the second cart' }]);
    var ma = R.pick(C.ma), mb = R.pick(C.mb), va = R.pick(C.va), ax = axis(R, 0), dirA = R.coin() ? 1 : -1, vA = dirA * va, vB = -ma * vA / mb;
    var mdp = C.dp;
    if (kind === 'rest') {
      return out({
        q: C.intro + ' ' + C.sa + ' (' + '$' + ud(ma, mdp, 'kg') + '$) moves off ' + dw(ax, vA) + ' at $' + ud(va, va % 1 ? 1 : 0, 'm/s') + '$. ' + C.sb.charAt(0).toUpperCase() + C.sb.slice(1) + ' has a mass of $' + ud(mb, mdp, 'kg') + '$. ' + ax.say + ' What is the velocity of ' + C.sb + '?',
        a: A(vB, 0.01), unit: 'm/s',
        steps: ['Everything starts at rest, so the total momentum is zero before, and (no outside push along the line) it stays zero: $m_A v_A + m_B v_B = 0$.',
          '$v_B = -\\dfrac{m_A v_A}{m_B} = -\\dfrac{(' + ud(ma, mdp, 'kg') + ')(' + uq(V1(vA), 'm/s') + ')}{' + ud(mb, mdp, 'kg') + '} = ' + uq(V1(vB), 'm/s') + '$.',
          'The sign is opposite to $v_A$: ' + C.sb + ' moves ' + dw(ax, vB) + '. Check the momenta: $' + un(ma * vA, PU) + '$ and $' + un(mb * vB, PU) + '$, equal in size and opposite in sign.'],
        hint: 'Total momentum starts at zero and stays zero, so the two momenta must cancel.'
      }, { k: 'ex-rest', ma: ma, mb: mb, vA: vA });
    }
    if (kind === 'Krel') {
      var KA = 0.5 * ma * va * va, KB = 0.5 * mb * vB * vB, askRatio = R.chance(0.3);
      return out({
        q: C.intro + ' ' + C.sa + ' ($' + ud(ma, mdp, 'kg') + '$) moves off at $' + ud(va, va % 1 ? 1 : 0, 'm/s') + '$, and ' + C.sb + ' has a mass of $' + ud(mb, mdp, 'kg') + '$. ' + (askRatio ? 'What is the ratio of the kinetic energy of ' + C.sa.toLowerCase().replace(/^the /, 'the ') + ' to that of ' + C.sb + '?' : 'How much kinetic energy do the two have in total after the push? (It came from stored energy: muscles, a spring or chemical energy.)'),
        a: A(askRatio ? KA / KB : KA + KB, 0.01), unit: askRatio ? undefined : 'J',
        steps: ['Momentum: $0 = m_A v_A + m_B v_B$, so $|v_B| = \\dfrac{m_A |v_A|}{m_B} = \\dfrac{(' + ud(ma, mdp, 'kg') + ')(' + ud(va, va % 1 ? 1 : 0, 'm/s') + ')}{' + ud(mb, mdp, 'kg') + '} = ' + un(-vB * dirA, 'm/s') + '$.',
          '$K_A = \\tfrac{1}{2}m_A v_A^2 = ' + un(KA, 'J') + '$ and $K_B = \\tfrac{1}{2}m_B v_B^2 = ' + un(KB, 'J') + '$.',
          askRatio ? '$\\dfrac{K_A}{K_B} = \\dfrac{' + F(KA) + '}{' + F(KB) + '} = ' + F(KA / KB) + '$, which equals $\\dfrac{m_B}{m_A}$: with equal momenta, $K = \\dfrac{p^2}{2m}$, so the lighter piece gets more kinetic energy.' : 'Total: $' + un(KA, 'J') + ' + ' + un(KB, 'J') + ' = ' + un(KA + KB, 'J') + '$. Momentum stays zero, but kinetic energy goes from zero to this value.'],
        hint: askRatio ? 'Use momentum to find the second speed, then compare ½mv² for the two pieces.' : 'Use momentum to find the second speed, then add up ½mv² for both pieces.'
      }, { k: 'ex-K', ma: ma, mb: mb, va: va, ask: askRatio ? 'ratio' : 'tot' });
    }
    if (kind === 'split') {
      var S = R.pick([{ n: 'A space probe', M: [1200, 1500, 2000], V: [300, 400, 500], m1: [300, 400, 500], d: 'separates into two parts. The rear stage', o: 'the front part', u: [100, 150, 200, 250] },
        { n: 'A model rocket', M: [0.6, 0.8, 1.2], V: [20, 25, 30], m1: [0.2, 0.3], d: 'splits into two pieces when a small charge pops. The tail piece', o: 'the nose piece', u: [5, 10, 15] }]);
      var Mt = R.pick(S.M), V = R.pick(S.V), m1 = R.pick(S.m1), u1 = R.pick(S.u), m2 = Mt - m1, u2 = (Mt * V - m1 * u1) / m2, dpp = Mt < 10 ? 1 : 0;
      return out({
        q: S.n + ' with a total mass of $' + ud(Mt, dpp, 'kg') + '$ moves forward at $' + ud(V, 0, 'm/s') + '$ in a straight line and ' + S.d + ' ($' + ud(m1, dpp, 'kg') + '$) keeps moving forward at $' + ud(u1, 0, 'm/s') + '$. Ignoring outside forces during the split, what is the velocity of ' + S.o + '? Take forward as positive.',
        a: A(u2, 0.01), unit: 'm/s',
        steps: ['The forces that push the parts apart are internal, so the total momentum is unchanged: $MV = m_1 v_1 + m_2 v_2$.',
          'Before: $MV = (' + ud(Mt, dpp, 'kg') + ')(' + ud(V, 0, 'm/s') + ') = ' + un(Mt * V, PU) + '$. The other part has $m_2 = ' + ud(Mt, dpp, 'kg') + ' - ' + ud(m1, dpp, 'kg') + ' = ' + un(m2, 'kg') + '$.',
          '$v_2 = \\dfrac{MV - m_1 v_1}{m_2} = \\dfrac{' + F(Mt * V) + ' - ' + F(m1 * u1) + '}{' + F(m2) + '}\\ \\text{m/s} = ' + un(u2, 'm/s') + '$.',
          'The rear part slowed down, so the front part had to speed up to keep the total momentum the same.'],
        hint: 'Momentum before the split (all of it moving at V) equals the sum of the two parts\' momenta after.'
      }, { k: 'ex-split', M: Mt, V: V, m1: m1, u1: u1 });
    }
    var light = M.min(ma, mb) === ma ? C.sa.replace(/^The /, 'the ') : C.sb, heavyName = light === C.sb ? C.sa.replace(/^The /, 'the ') : C.sb;
    var askK = R.coin();
    if (askK) return out({
      q: C.intro + ' ' + C.sa + ' has a mass of $' + ud(ma, mdp, 'kg') + '$ and ' + C.sb + ' has a mass of $' + ud(mb, mdp, 'kg') + '$. Afterward, which has more kinetic energy?',
      a: mc('The lighter one, ' + light, ['The heavier one, ' + heavyName, 'They have equal kinetic energies', 'Neither: kinetic energy is conserved, so it stays zero']),
      steps: ['Momentum starts at zero and stays zero, so the two momenta are equal in size: $m_A |v_A| = m_B |v_B| = p$.', 'Kinetic energy can be written $K = \\tfrac{1}{2}mv^2 = \\dfrac{p^2}{2m}$.', 'With the same $p$, the smaller mass has the larger $K$. The energy came from stored energy (muscles, a spring or the gunpowder), so kinetic energy is not conserved here.'],
      hint: 'Their momenta are equal in size. Write K in terms of p and m.'
    }, { k: 'concept' });
    return out({
      q: C.intro + ' ' + C.sa + ' has a mass of $' + ud(ma, mdp, 'kg') + '$ and ' + C.sb + ' has a mass of $' + ud(mb, mdp, 'kg') + '$. Which statement about their momenta afterward is true?',
      a: mc('They are equal in size and opposite in direction.', ['The lighter one has more momentum, because it moves faster.', 'The heavier one has more momentum, because it has more mass.', 'They are equal in size and in the same direction.']),
      steps: ['Before: everything is at rest, so the total momentum is zero.', 'The push is internal, so the total stays zero: $m_A v_A + m_B v_B = 0$.', 'So $m_A v_A = -m_B v_B$: equal sizes, opposite directions. The lighter one moves faster, exactly enough to make up for its smaller mass.'],
      hint: 'What is the total momentum before the push, and can an internal push change it?'
    }, { k: 'concept' });
  });

  // ---------- motion of the center of mass ----------
  G('phys1.center-of-mass-motion', function (R, ctx) {
    var kind = pickT(R, ctx, ['vcm', 'vcm'], ['xcm', 'raft', 'concept', 'vcm'], ['shell', 'raft', 'xcm']);
    if (kind === 'vcm') {
      var ax = axis(R, 0), m1 = R.pick([0.5, 1, 1.5, 2, 3]), m2 = R.pick([0.5, 1, 1.5, 2, 3, 4]), v1 = R.pick([1, 1.5, 2, 2.5, 3]), v2 = R.pick([0, 0.5, 1, 2]) * (R.chance(0.6) ? -1 : 1);
      var vc = (m1 * v1 + m2 * v2) / (m1 + m2);
      return out({
        q: 'Glider A ($' + ud(m1, 1, 'kg') + '$) moves ' + dw(ax, v1) + ' at $' + ud(v1, 1, 'm/s') + '$ and glider B ($' + ud(m2, 1, 'kg') + '$) ' + (v2 === 0 ? 'is at rest' : 'moves ' + dw(ax, v2) + ' at $' + ud(M.abs(v2), 1, 'm/s') + '$') + ' on an air track. ' + ax.say + ' What is the velocity of their center of mass?',
        a: A(vc, 0.01), unit: 'm/s',
        steps: ['The center of mass moves with the mass-weighted average velocity: $v_{\\text{cm}} = \\dfrac{m_A v_A + m_B v_B}{m_A + m_B} = \\dfrac{p_{\\text{tot}}}{M}$.',
          '$v_{\\text{cm}} = \\dfrac{(' + ud(m1, 1, 'kg') + ')(' + ud(v1, 1, 'm/s') + ') + (' + ud(m2, 1, 'kg') + ')(' + uq(D(v2, 1), 'm/s') + ')}{' + ud(m1 + m2, 1, 'kg') + '} = ' + uq(V1(vc), 'm/s') + '$.',
          'If the gliders collide, this value does not change: the total momentum, and so $v_{\\text{cm}}$, is the same before and after.'],
        hint: 'Total momentum divided by total mass.'
      }, { k: 'cm-v', m1: m1, m2: m2, v1: v1, v2: v2 });
    }
    if (kind === 'xcm') {
      var mA = R.pick([0.2, 0.3, 0.4, 0.5]), mB = R.pick([0.2, 0.3, 0.4, 0.6]), xA = R.pick([0.1, 0.2, 0.3]), xB = R.pick([1.0, 1.2, 1.5]), t = R.pick([3, 4, 5]);
      var vA = R.pick([0.3, 0.4, 0.5, 0.6].filter(function (v) { return (xB - xA) / v < 0.8 * t; }).concat([0.6]));
      var x0 = (mA * xA + mB * xB) / (mA + mB), vc2 = mA * vA / (mA + mB), xt = x0 + vc2 * t;
      return out({
        q: 'On an air track, glider A ($' + ud(mA, 1, 'kg') + '$) starts at $x = ' + ud(xA, 1, 'm') + '$ moving in the $+x$ direction at $' + ud(vA, 2, 'm/s') + '$. Glider B ($' + ud(mB, 1, 'kg') + '$) sits at rest at $x = ' + ud(xB, 1, 'm') + '$. The gliders collide and bounce partway through. Where is the center of mass of the two gliders at $t = ' + ud(t, 1, 's') + '$?',
        a: A(xt, 0.01), unit: 'm',
        steps: ['Starting position: $x_{\\text{cm}} = \\dfrac{m_A x_A + m_B x_B}{m_A + m_B} = \\dfrac{(' + F(mA) + ')(' + F(xA) + ') + (' + F(mB) + ')(' + F(xB) + ')}{' + F(mA + mB) + '}\\ \\text{m} = ' + un(x0, 'm') + '$.',
          'Velocity: $v_{\\text{cm}} = \\dfrac{p_{\\text{tot}}}{M} = \\dfrac{(' + ud(mA, 1, 'kg') + ')(' + ud(vA, 2, 'm/s') + ')}{' + ud(mA + mB, 1, 'kg') + '} = ' + un(vc2, 'm/s') + '$.',
          'No outside horizontal force acts, so the collision cannot change $v_{\\text{cm}}$. The center of mass moves steadily the whole time.',
          '$x_{\\text{cm}} = ' + un(x0, 'm') + ' + (' + un(vc2, 'm/s') + ')(' + ud(t, 1, 's') + ') = ' + un(xt, 'm') + '$.'],
        hint: 'You don\'t need the details of the collision: find where the center of mass starts and how fast it moves.'
      }, { k: 'cm-x', mA: mA, mB: mB, xA: xA, xB: xB, vA: vA, t: t });
    }
    if (kind === 'raft') {
      var mp = R.pick([50, 60, 70, 80]), Mr = R.pick([100, 120, 150, 200, 240]), d = R.pick([2, 3, 4, 5]), dr = mp * d / (mp + Mr), askP = R.chance(0.35);
      return out({
        q: 'A person ($' + ud(mp, 0, 'kg') + '$) stands at one end of a raft ($' + ud(Mr, 0, 'kg') + '$) floating at rest on a calm pond. She walks $' + ud(d, 1, 'm') + '$ along the raft toward the other end. Ignoring the water\'s drag, ' + (askP ? 'how far does she move relative to the water?' : 'how far does the raft move relative to the water?'),
        a: A(askP ? d - dr : dr, 0.01), unit: 'm',
        steps: ['No outside horizontal force acts on person + raft, and they start at rest, so their center of mass stays put: $m\\,\\Delta x_{\\text{person}} + M\\,\\Delta x_{\\text{raft}} = 0$.',
          'She moves $' + ud(d, 1, 'm') + '$ relative to the raft, so $\\Delta x_{\\text{person}} = \\Delta x_{\\text{raft}} + ' + ud(d, 1, 'm') + '$.',
          'Substitute: $m(\\Delta x_{\\text{raft}} + d) + M\\Delta x_{\\text{raft}} = 0$, so $\\Delta x_{\\text{raft}} = -\\dfrac{m d}{m + M} = -\\dfrac{(' + F(mp) + ')(' + F(d) + ')}{' + F(mp + Mr) + '}\\ \\text{m} = ' + un(-dr, 'm') + '$.',
          askP ? 'She moves $' + ud(d, 1, 'm') + ' - ' + un(dr, 'm') + ' = ' + un(d - dr, 'm') + '$ relative to the water, while the raft slides $' + un(dr, 'm') + '$ the other way.' : 'The raft slides $' + un(dr, 'm') + '$ backward, opposite to her walk.'],
        hint: 'The center of mass of person plus raft can\'t move. Her motion relative to the water is her walk plus the raft\'s motion.'
      }, { k: 'cm-raft', m: mp, M: Mr, d: d, ask: askP ? 'person' : 'raft' });
    }
    if (kind === 'shell') {
      var Rg = R.pick([60, 80, 100, 120, 150, 200]), m1s = R.pick([1, 2, 3, 4]), m2s = R.pick([1, 2, 3, 4]), x2 = ((m1s + m2s) * Rg - m1s * Rg / 2) / m2s;
      return out({
        q: 'A firework shell is launched from level ground and would land $' + ud(Rg, 0, 'm') + '$ away. At the top of its path it bursts into two pieces. A $' + ud(m1s, 1, 'kg') + '$ piece is left at rest and falls straight down. The other piece has a mass of $' + ud(m2s, 1, 'kg') + '$. Ignoring air resistance, how far from the launch point does the second piece land?',
        a: A(x2, 0.01), unit: 'm',
        steps: ['The burst is internal, so the center of mass keeps following the original path and lands $' + ud(Rg, 0, 'm') + '$ away.',
          'The top of the path is halfway: the first piece lands at $x_1 = ' + un(Rg / 2, 'm') + '$. Both pieces start the fall with no vertical velocity, from the same height, so they land at the same time.',
          'At that moment: $(m_1 + m_2)x_{\\text{cm}} = m_1 x_1 + m_2 x_2$, so $x_2 = \\dfrac{(m_1 + m_2)x_{\\text{cm}} - m_1 x_1}{m_2}$.',
          '$x_2 = \\dfrac{(' + F(m1s + m2s) + ')(' + F(Rg) + ') - (' + F(m1s) + ')(' + F(Rg / 2) + ')}{' + F(m2s) + '}\\ \\text{m} = ' + un(x2, 'm') + '$.'],
        hint: 'The center of mass lands where the whole shell would have. Where does the piece that falls straight down land?'
      }, { k: 'cm-shell', R: Rg, m1: m1s, m2: m2s });
    }
    return out({
      q: 'A firework shell bursts into many pieces at the top of its flight. Ignoring air resistance, what does the center of mass of all the pieces do until the first piece lands?',
      a: mc('It keeps following the same parabola the shell was on.', ['It stops and falls straight down.', 'It moves straight up, pushed by the burst.', 'It speeds up, because the burst adds energy.']),
      steps: ['The burst pushes the pieces apart with internal forces, which come in equal and opposite pairs.', 'The only outside force is gravity on all the pieces, $Mg$, the same as before the burst.', 'So the center of mass keeps accelerating at $g$ downward from the same position and velocity: it stays on the original parabola. The burst adds kinetic energy, but that energy goes into the pieces\' motion relative to the center of mass.'],
      hint: 'Which forces can change how the center of mass moves: internal or outside ones?'
    }, { k: 'concept' });
  });


  // ============================== Unit 6: Torque and Rotational Dynamics ==============================
  var TWOPI = 2 * PI;
  function rpm2w(n) { return n * TWOPI / 60; }
  var ROT = [ // things that turn: name, verb
    { n: 'ceiling fan', r: [0.5, 0.6, 0.7] }, { n: 'bicycle wheel', r: [0.33, 0.35] }, { n: 'merry-go-round', r: [1.5, 2, 2.5] },
    { n: 'potter\'s wheel', r: [0.15, 0.2, 0.25] }, { n: 'washing-machine drum', r: [0.25, 0.3] }, { n: 'turntable', r: [0.15] }];

  G('phys1.angular-quantities', function (R, ctx) {
    var kind = pickT(R, ctx, ['conv', 'omega', 'conv', 'arc'], ['alpha', 'arc', 'conv', 'units', 'omega'], ['alpha', 'period', 'arc', 'revs', 'conv']);
    if (kind === 'conv') {
      var sub = R.pick(['rev', 'deg', 'rpm']);
      if (sub === 'rev') {
        var N = R.pick([0.25, 0.75, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7.5, 8, 10, 12, 15, 20]), th = N * TWOPI;
        return out({ q: 'A wheel turns through $' + D(N, N % 1 ? 1 : 0) + '$ revolutions. Through what angle has it turned, in radians?', a: A(th, 0.01), unit: 'rad',
          steps: ['One revolution is a full circle: the arc is the whole circumference $2\\pi r$, so the angle is $\\dfrac{2\\pi r}{r} = 2\\pi$ rad.', '$\\theta = ' + D(N, N % 1 ? 1 : 0) + '\\ \\text{rev} \\times \\dfrac{2\\pi\\ \\text{rad}}{1\\ \\text{rev}} = ' + F(2 * N) + '\\pi\\ \\text{rad} \\approx ' + un(th, 'rad') + '$.'],
          hint: 'Each revolution is 2π radians.' }, { k: 'aq-rev', N: N });
      }
      if (sub === 'deg') {
        var d = R.pick([15, 20, 30, 36, 40, 45, 60, 72, 75, 90, 100, 105, 120, 135, 144, 150, 210, 225, 240, 270, 300, 315, 330, 450, 540, 720]), r = d * PI / 180, fr = U.reduce(d, 180);
        return out({ q: 'Convert an angle of $' + d + '^\\circ$ to radians.', a: A(r, 0.01), unit: 'rad',
          steps: ['A half turn is $180^\\circ$ and also $\\pi$ rad, so multiply by $\\dfrac{\\pi\\ \\text{rad}}{180^\\circ}$.', '$' + d + '^\\circ \\times \\dfrac{\\pi}{180^\\circ} = ' + (fr[1] === 1 ? (fr[0] === 1 ? '' : fr[0]) + '\\pi' : '\\dfrac{' + (fr[0] === 1 ? '' : fr[0]) + '\\pi}{' + fr[1] + '}') + '\\ \\text{rad} \\approx ' + un(r, 'rad') + '$.'],
          hint: 'π radians is the same angle as 180°.' }, { k: 'aq-deg', d: d });
      }
      var n = R.pick([10, 15, 20, 30, 33, 45, 60, 78, 90, 100, 120, 150, 180, 240, 300, 360, 450, 600, 900, 1000, 1200, 1500, 1800, 2400, 3000, 3600]), w = rpm2w(n);
      return out({ q: 'A motor turns at $' + D(n, 0) + '$ revolutions per minute (rpm). What is its angular velocity in rad/s?', a: A(w, 0.01), unit: 'rad/s',
        steps: ['Change revolutions to radians ($1\\ \\text{rev} = 2\\pi\\ \\text{rad}$) and minutes to seconds ($1\\ \\text{min} = 60\\ \\text{s}$).', '$\\omega = ' + D(n, 0) + '\\ \\dfrac{\\text{rev}}{\\text{min}} \\times \\dfrac{2\\pi\\ \\text{rad}}{1\\ \\text{rev}} \\times \\dfrac{1\\ \\text{min}}{60\\ \\text{s}} = ' + un(w, 'rad/s') + '$.'],
        hint: 'Multiply by 2π to get radians, and divide by 60 to get seconds.' }, { k: 'aq-rpm', n: n });
    }
    if (kind === 'omega' || kind === 'revs') {
      var o = R.pick([{ n: 'A Ferris wheel', N: [1, 2, 3], t: [60, 90, 120] }, { n: 'A ceiling fan', N: [30, 40, 45, 60], t: [10, 15, 20, 30] }, { n: 'A merry-go-round', N: [3, 4, 5], t: [24, 30, 36] }, { n: 'A record on a turntable', N: [45, 66.67], t: [60, 120] }]);
      if (kind === 'revs') {
        var w2 = R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12]), t2 = R.pick([5, 10, 12, 15, 20, 25, 30, 45, 60]), N2 = w2 * t2 / TWOPI;
        return out({ q: 'A wheel spins at a steady $' + ud(w2, 1, 'rad/s') + '$. How many revolutions does it make in $' + ud(t2, 0, 's') + '$?', a: A(N2, 0.01), unit: 'rev',
          steps: ['Angle turned: $\\theta = \\omega t = (' + ud(w2, 1, 'rad/s') + ')(' + ud(t2, 0, 's') + ') = ' + un(w2 * t2, 'rad') + '$.', 'Each revolution is $2\\pi$ rad: $N = \\dfrac{' + un(w2 * t2, 'rad') + '}{2\\pi\\ \\text{rad/rev}} = ' + un(N2, 'rev') + '$.'],
          hint: 'Find the angle in radians first, then divide by 2π.' }, { k: 'aq-revs', w: w2, t: t2 });
      }
      var Nn = R.pick(o.N), tt = R.pick(o.t), ww = Nn * TWOPI / tt;
      return out({ q: o.n + ' turns at a steady rate, making $' + F(Nn) + '$ revolution' + (Nn === 1 ? '' : 's') + ' in $' + ud(tt, 0, 's') + '$. What is its angular velocity in rad/s?', a: A(ww, 0.01), unit: 'rad/s',
        steps: ['Angle turned: $\\Delta\\theta = ' + F(Nn) + ' \\times 2\\pi\\ \\text{rad} = ' + un(Nn * TWOPI, 'rad') + '$.', '$\\omega = \\dfrac{\\Delta\\theta}{\\Delta t} = \\dfrac{' + un(Nn * TWOPI, 'rad') + '}{' + ud(tt, 0, 's') + '} = ' + un(ww, 'rad/s') + '$.'],
        hint: 'Change the revolutions to radians, then divide by the time.' }, { k: 'aq-omega', N: Nn, t: tt });
    }
    if (kind === 'alpha') {
      var sc = R.pick([{ n: 'A drill', a: 0, b: [1200, 1800, 2400], t: [0.5, 0.8, 1.2] }, { n: 'A ceiling fan', a: [120, 180, 240], b: 0, t: [6, 8, 12, 15] }, { n: 'A washing-machine drum', a: [300, 400], b: [800, 1000, 1200], t: [5, 8, 10] }, { n: 'A grinding wheel', a: [1800, 2400, 3000], b: 0, t: [10, 15, 20, 30] }]);
      var n0 = sc.a ? R.pick(sc.a) : 0, n1 = sc.b ? R.pick(sc.b) : 0, td = R.pick(sc.t), w0 = rpm2w(n0), w1 = rpm2w(n1), al = (w1 - w0) / td;
      var from = n0 ? 'from $' + D(n0, 0) + '$ rpm' : 'from rest', to = n1 ? 'to $' + D(n1, 0) + '$ rpm' : 'to a stop';
      return out({ q: sc.n + ' changes its rotation rate ' + from + ' ' + to + ' in $' + ud(td, td % 1 ? 1 : 0, 's') + '$, turning the same way the whole time. Take that direction of turning as positive. What is its average angular acceleration?', a: A(al, 0.01), unit: 'rad/s²',
        steps: ['Convert to rad/s: $\\omega_0 = ' + (n0 ? D(n0, 0) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w0, 'rad/s') : '0') + '$ and $\\omega = ' + (n1 ? D(n1, 0) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w1, 'rad/s') : '0') + '$.',
          '$\\alpha = \\dfrac{\\Delta\\omega}{\\Delta t} = \\dfrac{' + F(w1) + ' - ' + F(w0) + '}{' + D(td, td % 1 ? 1 : 0) + '}\\ \\text{rad/s}^{2} = ' + un(al, 'rad/s²') + '$.',
          al < 0 ? 'The minus sign means the angular acceleration points against the turning: it is slowing down.' : 'Positive: it speeds up in its direction of turning.'],
        hint: 'Change rpm to rad/s first (× 2π ÷ 60), then divide the change in ω by the time.' }, { k: 'aq-alpha', n0: n0, n1: n1, t: td });
    }
    if (kind === 'arc') {
      var ra = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.75, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), dg = R.pick([20, 30, 40, 45, 60, 72, 90, 120, 135, 150, 180, 240, 270, 300]), byRev = R.chance(0.3), Nr = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
      var thr = byRev ? Nr * TWOPI : dg * PI / 180, s = ra * thr;
      return out({ q: 'A point sits $' + ud(ra, 2, 'm') + '$ from the center of a turning wheel. The wheel turns through ' + (byRev ? '$' + D(Nr, 1) + '$ revolutions' : 'an angle of $' + dg + '^\\circ$') + '. How far does the point travel along its circular path?', a: A(s, 0.01), unit: 'm',
        steps: ['The formula $s = r\\theta$ comes from the definition of the radian, so $\\theta$ must be in radians.', byRev ? '$\\theta = ' + D(Nr, 1) + ' \\times 2\\pi = ' + un(thr, 'rad') + '$.' : '$\\theta = ' + dg + '^\\circ \\times \\dfrac{\\pi}{180^\\circ} = ' + un(thr, 'rad') + '$.', '$s = r\\theta = (' + ud(ra, 2, 'm') + ')(' + F(thr) + ') = ' + un(s, 'm') + '$.'],
        hint: 'Convert the angle to radians before you use s = rθ.' }, { k: 'aq-arc', r: ra, th: thr });
    }
    if (kind === 'period') {
      var wp = R.pick([0.2, 0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 3.14, 4, 5, 6.28, 8, 10, 12, 15, 25, 50]), Tp = TWOPI / wp;
      return out({ q: 'A carousel turns at a steady $' + ud(wp, 2, 'rad/s') + '$. How long does one full revolution take?', a: A(Tp, 0.01), unit: 's',
        steps: ['One revolution is $2\\pi$ rad, and $\\omega$ is radians per second.', '$T = \\dfrac{2\\pi\\ \\text{rad}}{\\omega} = \\dfrac{2\\pi}{' + ud(wp, 2, 'rad/s') + '} = ' + un(Tp, 's') + '$.'],
        hint: 'Divide the angle of one turn, 2π rad, by ω.' }, { k: 'aq-T', w: wp });
    }
    return out({ q: 'A wheel of radius $r$ turns through a quarter turn ($90^\\circ$). Which number should you put in for $\\theta$ in $s = r\\theta$?',
      a: mc('$\\pi/2$', ['$90$', '$0.25$', '$2\\pi$']),
      steps: ['$s = r\\theta$ works only with $\\theta$ in radians, because the radian is defined as arc length over radius.', 'A quarter turn is $\\tfrac{1}{4} \\times 2\\pi = \\pi/2$ rad $\\approx 1.57$.', 'Using 90 (degrees) would make the arc 90 times the radius, far longer than the whole circle; 0.25 (revolutions) is too small.'],
      hint: 'The formula comes from the definition of the radian.' }, { k: 'concept' });
  });

  G('phys1.rotational-kinematics', function (R, ctx) {
    var kind = pickT(R, ctx, ['omega', 'omega', 'theta'], ['theta', 'stop', 'w2', 'alpha'], ['revstop', 'alphaRev', 'thetaRev', 'w2']);
    var obj = R.pick(['wheel', 'flywheel', 'turbine rotor', 'potter\'s wheel', 'grinding wheel', 'fan']);
    var sp = { name: obj, The: 'The ' + obj };
    if (kind === 'omega' || kind === 'theta' || kind === 'thetaRev') {
      var up = R.chance(0.65), w0 = up ? R.pick([0, 2, 3, 4, 5, 6]) : R.pick([20, 24, 30, 36, 40]), al = up ? R.pick([0.5, 1.5, 2, 2.5, 3, 4]) : -R.pick([2, 3, 4, 5]), t = R.pick([2, 3, 4, 5, 6, 8]);
      if (!up) { while (w0 + al * t < 0) t--; if (t < 2) { t = 2; w0 = -al * t + 4; } }
      var w = w0 + al * t, th = w0 * t + 0.5 * al * t * t, revs = th / TWOPI;
      var desc = 'A ' + obj + ' ' + (w0 ? 'turning at $' + ud(w0, 1, 'rad/s') + '$' : 'starting from rest') + ' has a constant angular acceleration of $' + ud(al, 1, 'rad/s²') + '$ (positive is its direction of turning) for $' + ud(t, 1, 's') + '$.';
      if (kind === 'omega') return out({ q: desc + ' What is its angular velocity at the end?', a: A(w, 0.01), unit: 'rad/s',
        steps: ['This is the rotational twin of $v = v_0 + at$: $\\omega = \\omega_0 + \\alpha t$.', '$\\omega = ' + ud(w0, 1, 'rad/s') + ' + (' + ud(al, 1, 'rad/s²') + ')(' + ud(t, 1, 's') + ') = ' + un(w, 'rad/s') + '$.'],
        hint: 'Swap v, a and x for ω, α and θ in the constant-acceleration equations.' }, { k: 'rk-w', w0: w0, al: al, t: t });
      var askRev = kind === 'thetaRev';
      return out({ q: desc + ' Through what angle does it turn in that time' + (askRev ? ', in revolutions?' : ', in radians?'), a: A(askRev ? revs : th, 0.01), unit: askRev ? 'rev' : 'rad',
        steps: ['Use $\\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2$, the twin of $x = v_0 t + \\tfrac{1}{2}at^2$.', '$\\theta = (' + ud(w0, 1, 'rad/s') + ')(' + ud(t, 1, 's') + ') + \\tfrac{1}{2}(' + ud(al, 1, 'rad/s²') + ')(' + ud(t, 1, 's') + ')^2 = ' + un(th, 'rad') + '$.'].concat(askRev ? ['Divide by $2\\pi$ rad per revolution: $' + un(th, 'rad') + ' \\div 2\\pi = ' + un(revs, 'rev') + '$.'] : []),
        hint: askRev ? 'Find the angle in radians with θ = ω₀t + ½αt², then divide by 2π.' : 'Use θ = ω₀t + ½αt² with α carrying its sign.' }, { k: 'rk-th', w0: w0, al: al, t: t, ask: askRev ? 'rev' : 'rad' });
    }
    if (kind === 'stop' || kind === 'alpha') {
      var w0s = R.pick([12, 15, 18, 20, 24, 30, 36]), als = -R.pick([1.5, 2, 2.5, 3, 4, 6]), ts = -w0s / als;
      if (kind === 'stop') return out({ q: 'A ' + obj + ' spinning at $' + ud(w0s, 0, 'rad/s') + '$ slows down with a constant angular acceleration of $' + ud(als, 1, 'rad/s²') + '$. How long does it take to stop?', a: A(ts, 0.01), unit: 's',
        steps: ['Stopping means $\\omega = 0$. From $\\omega = \\omega_0 + \\alpha t$: $t = \\dfrac{\\omega - \\omega_0}{\\alpha}$.', '$t = \\dfrac{0 - ' + D(w0s, 0) + '}{' + D(als, 1) + '}\\ \\text{s} = ' + un(ts, 's') + '$.', 'The negative $\\alpha$ (against the turning) is what makes the time come out positive.'],
        hint: 'Set the final angular velocity to zero in ω = ω₀ + αt.' }, { k: 'rk-stop', w0: w0s, al: als });
      var wa = R.pick([0, 4, 6, 8]), wb = R.pick([10, 14, 16, 20, 30]), ta = R.pick([2, 4, 5, 8, 10]);
      if (R.coin()) { var tmp = wa; wa = wb; wb = tmp; }
      var aa = (wb - wa) / ta;
      return out({ q: 'A ' + obj + '\'s angular velocity changes steadily from $' + ud(wa, 0, 'rad/s') + '$ to $' + ud(wb, 0, 'rad/s') + '$ in $' + ud(ta, 0, 's') + '$, always turning the same way (positive). What is its angular acceleration?', a: A(aa, 0.01), unit: 'rad/s²',
        steps: ['$\\alpha = \\dfrac{\\omega - \\omega_0}{t} = \\dfrac{' + D(wb, 0) + ' - ' + D(wa, 0) + '}{' + D(ta, 0) + '}\\ \\text{rad/s}^{2} = ' + un(aa, 'rad/s²') + '$.', aa < 0 ? 'Negative: the ' + obj + ' is slowing down.' : 'Positive: the ' + obj + ' is speeding up.'],
        hint: 'Change in angular velocity divided by the time.' }, { k: 'rk-al', wa: wa, wb: wb, t: ta });
    }
    if (kind === 'w2') {
      var w0w = R.pick([0, 2, 4, 5, 6]), alw = R.pick([1, 2, 3, 4, 5]), thw = R.pick([10, 12, 16, 20, 25, 30]), ww = M.sqrt(w0w * w0w + 2 * alw * thw);
      return out({ q: 'A ' + obj + ' ' + (w0w ? 'turning at $' + ud(w0w, 0, 'rad/s') + '$' : 'starting from rest') + ' speeds up at $' + ud(alw, 1, 'rad/s²') + '$ while it turns through $' + ud(thw, 0, 'rad') + '$. What is its angular velocity then?', a: A(ww, 0.01), unit: 'rad/s',
        steps: ['No time is given, so use the twin of $v^2 = v_0^2 + 2a\\Delta x$: $\\omega^2 = \\omega_0^2 + 2\\alpha\\Delta\\theta$.', '$\\omega^2 = ' + P(D(w0w, 0)) + '^2 + 2(' + D(alw, 1) + ')(' + D(thw, 0) + ') = ' + F(w0w * w0w + 2 * alw * thw) + '\\ \\text{rad}^2/\\text{s}^2$.', '$\\omega = ' + un(ww, 'rad/s') + '$.'],
        hint: 'Without the time, use ω² = ω₀² + 2αΔθ.' }, { k: 'rk-w2', w0: w0w, al: alw, th: thw });
    }
    var n0 = R.pick([300, 450, 600, 900, 1200, 1800]), w0r = rpm2w(n0);
    if (kind === 'revstop') {
      var alr = -R.pick([2, 4, 5, 8, 10, 15]), th2 = -w0r * w0r / (2 * alr), Nr = th2 / TWOPI;
      return out({ q: 'A ' + obj + ' turning at $' + D(n0, 0) + '$ rpm is switched off and slows at a steady $' + ud(-alr, 0, 'rad/s²') + '$. How many revolutions does it make before it stops?', a: A(Nr, 0.02), unit: 'rev',
        steps: ['Convert: $\\omega_0 = ' + D(n0, 0) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w0r, 'rad/s') + '$. Slowing means $\\alpha = ' + ud(alr, 0, 'rad/s²') + '$.', 'With $\\omega = 0$: $0 = \\omega_0^2 + 2\\alpha\\Delta\\theta$, so $\\Delta\\theta = -\\dfrac{\\omega_0^2}{2\\alpha} = -\\dfrac{' + P(F(w0r)) + '^2}{2(' + D(alr, 0) + ')} = ' + un(th2, 'rad') + '$.', 'Revolutions: $' + un(th2, 'rad') + ' \\div 2\\pi = ' + un(Nr, 'rev') + '$.'],
        hint: 'Convert rpm to rad/s, use ω² = ω₀² + 2αΔθ with ω = 0, then turn radians into revolutions.' }, { k: 'rk-revstop', n0: n0, al: alr });
    }
    var Nst = R.pick([10, 20, 25, 30, 40, 50]), ala = -w0r * w0r / (2 * Nst * TWOPI);
    return out({ q: 'A ' + obj + ' turning at $' + D(n0, 0) + '$ rpm coasts to a stop in exactly $' + D(Nst, 0) + '$ revolutions. Taking its direction of turning as positive, what is its (constant) angular acceleration?', a: A(ala, 0.02), unit: 'rad/s²',
      steps: ['Convert both quantities to radians: $\\omega_0 = ' + D(n0, 0) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w0r, 'rad/s') + '$ and $\\Delta\\theta = ' + D(Nst, 0) + ' \\times 2\\pi = ' + un(Nst * TWOPI, 'rad') + '$.', 'From $0 = \\omega_0^2 + 2\\alpha\\Delta\\theta$: $\\alpha = -\\dfrac{\\omega_0^2}{2\\Delta\\theta} = -\\dfrac{' + P(F(w0r)) + '^2}{2(' + F(Nst * TWOPI) + ')} = ' + un(ala, 'rad/s²') + '$.', 'The answer is negative because the ' + obj + ' slows down.'],
      hint: 'Put ω₀ in rad/s and the angle in radians before using ω² = ω₀² + 2αΔθ.' }, { k: 'rk-alrev', n0: n0, N: Nst });
  });

  G('phys1.linear-angular', function (R, ctx) {
    var kind = pickT(R, ctx, ['v', 'v', 'ratio'], ['vrpm', 'at', 'ac', 'concept', 'w'], ['belt', 'total', 'vrpm', 'ac']);
    if (kind === 'v' || kind === 'w' || kind === 'vrpm') {
      var o = R.pick(ROT), r = R.pick(o.r), rpm = kind === 'vrpm', w = rpm ? null : R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8]), n = rpm ? R.pick([20, 30, 33.3, 45, 60, 90, 120]) : null;
      if (o.n === 'merry-go-round') { w = rpm ? null : R.pick([0.5, 0.8, 1, 1.2, 1.5]); n = rpm ? R.pick([6, 8, 10, 12, 15]) : null; }
      if (rpm) w = rpm2w(n);
      var v = r * w, where = o.n === 'merry-go-round' ? 'A child stands on the edge of a merry-go-round, $' + ud(r, 1, 'm') + '$ from its center.' : 'A point on the rim of a ' + o.n + ' is $' + ud(r, 2, 'm') + '$ from the axle.';
      if (kind === 'w') return out({ q: where + ' The point moves at $' + un(v, 'm/s') + '$. What is the angular velocity of the ' + o.n + '?', a: A(w, 0.01), unit: 'rad/s',
        steps: ['A point at radius $r$ moves $s = r\\theta$ along its circle, so its speed is $v = r\\omega$ (with $\\omega$ in rad/s).', '$\\omega = \\dfrac{v}{r} = \\dfrac{' + un(v, 'm/s') + '}{' + ud(r, 2, 'm') + '} = ' + un(w, 'rad/s') + '$.'],
        hint: 'Use v = rω and solve for ω.' }, { k: 'la-w', r: r, w: w });
      return out({ q: where + ' The ' + o.n + ' turns at ' + (rpm ? '$' + F(n) + '$ revolutions per minute.' : '$' + ud(w, 1, 'rad/s') + '$.') + ' How fast is that point moving?', a: A(v, 0.01), unit: 'm/s',
        steps: (rpm ? ['First get $\\omega$ in rad/s: $' + F(n) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w, 'rad/s') + '$.'] : []).concat(['A point at radius $r$ moves $s = r\\theta$ along its circle, so $v = r\\omega$.', '$v = (' + ud(r, 2, 'm') + ')(' + (rpm ? un(w, 'rad/s') : ud(w, 1, 'rad/s')) + ') = ' + un(v, 'm/s') + '$. (A radian is a ratio of lengths, so rad·m/s is just m/s.)']),
        hint: rpm ? 'Change rpm to rad/s first; v = rω only works with radians.' : 'Multiply the radius by the angular velocity.' }, { k: 'la-v', r: r, w: w });
    }
    if (kind === 'ratio') {
      var R1 = R.pick([0.5, 1, 1.5]), R2 = R.pick([2, 2.5, 3]), v1 = R.pick([0.8, 1, 1.2, 1.5, 2]), v2 = v1 * R2 / R1;
      return out({ q: 'Two children ride a turning merry-go-round. Ana stands $' + ud(R1, 1, 'm') + '$ from the center and moves at $' + ud(v1, 1, 'm/s') + '$. Ben stands $' + ud(R2, 1, 'm') + '$ from the center. How fast does Ben move?', a: A(v2, 0.01), unit: 'm/s',
        steps: ['Every point on the merry-go-round turns through the same angle in the same time: they share one $\\omega$.', '$\\omega = \\dfrac{v}{r} = \\dfrac{' + ud(v1, 1, 'm/s') + '}{' + ud(R1, 1, 'm') + '} = ' + un(v1 / R1, 'rad/s') + '$.', 'Ben: $v = r\\omega = (' + ud(R2, 1, 'm') + ')(' + un(v1 / R1, 'rad/s') + ') = ' + un(v2, 'm/s') + '$. He is farther out, so he moves faster.'],
        hint: 'Both children have the same angular velocity. Speed grows in proportion to radius.' }, { k: 'la-ratio', r1: R1, r2: R2, v1: v1 });
    }
    if (kind === 'at') {
      var ra = R.pick([0.15, 0.2, 0.25, 0.3, 0.4, 0.5]), al = R.pick([2, 4, 5, 6, 8, 10, 12]), at = ra * al;
      return out({ q: 'A grinding wheel of radius $' + ud(ra, 2, 'm') + '$ speeds up with an angular acceleration of $' + ud(al, 0, 'rad/s²') + '$. What is the tangential acceleration of a point on its rim?', a: A(at, 0.01), unit: 'm/s²',
        steps: ['Speed along the circle is $v = r\\omega$; if $\\omega$ changes at the rate $\\alpha$, then $v$ changes at the rate $a_t = r\\alpha$.', '$a_t = (' + ud(ra, 2, 'm') + ')(' + ud(al, 0, 'rad/s²') + ') = ' + un(at, 'm/s²') + '$.'],
        hint: 'The tangential acceleration is r times α.' }, { k: 'la-at', r: ra, al: al });
    }
    if (kind === 'ac' || kind === 'total') {
      var rc = R.pick([0.2, 0.25, 0.3, 0.5, 1.5, 2]), wc = R.pick([1, 2, 3, 4, 5]), ac = rc * wc * wc;
      if (kind === 'total') {
        var alt = R.pick([2, 3, 4, 5, 6, 8]), att = rc * alt, tot = M.hypot(ac, att);
        return out({ q: 'A disk of radius $' + ud(rc, 2, 'm') + '$ turns at $' + ud(wc, 1, 'rad/s') + '$ and is speeding up at $' + ud(alt, 1, 'rad/s²') + '$. What is the size of the total acceleration of a point on its rim at this moment?', a: A(tot, 0.01), unit: 'm/s²',
          steps: ['Toward the center (the turning of the velocity): $a_c = \\dfrac{v^2}{r} = r\\omega^2 = (' + ud(rc, 2, 'm') + ')(' + ud(wc, 1, 'rad/s') + ')^2 = ' + un(ac, 'm/s²') + '$.', 'Along the path (the change of speed): $a_t = r\\alpha = (' + ud(rc, 2, 'm') + ')(' + ud(alt, 1, 'rad/s²') + ') = ' + un(att, 'm/s²') + '$.', 'The two parts are at right angles: $a = \\sqrt{a_c^2 + a_t^2} = ' + un(tot, 'm/s²') + '$.'],
          hint: 'Find the centripetal part rω² and the tangential part rα, then add them like perpendicular vectors.' }, { k: 'la-tot', r: rc, w: wc, al: alt });
      }
      return out({ q: 'A point sits $' + ud(rc, 2, 'm') + '$ from the axis of a wheel that turns at a steady $' + ud(wc, 1, 'rad/s') + '$. What is the point\'s centripetal acceleration?', a: A(ac, 0.01), unit: 'm/s²',
        steps: ['Its speed is $v = r\\omega = ' + un(rc * wc, 'm/s') + '$.', 'Centripetal acceleration: $a_c = \\dfrac{v^2}{r} = r\\omega^2 = (' + ud(rc, 2, 'm') + ')(' + ud(wc, 1, 'rad/s') + ')^2 = ' + un(ac, 'm/s²') + '$.'],
        hint: 'Use a = v²/r with v = rω, which is the same as rω².' }, { k: 'la-ac', r: rc, w: wc });
    }
    if (kind === 'belt') {
      var r1 = R.pick([4, 5, 6, 8, 10]), r2 = R.pick([12, 15, 16, 20, 24, 30]), n1 = R.pick([600, 900, 1200, 1500, 1800]), n2 = n1 * r1 / r2;
      return out({ q: 'A belt that does not slip runs around a motor pulley of radius $' + ud(r1, 0, 'cm') + '$ and a larger pulley of radius $' + ud(r2, 0, 'cm') + '$. The motor pulley turns at $' + D(n1, 0) + '$ rpm. How fast does the larger pulley turn, in rpm?', a: A(n2, 0.01), unit: 'rpm',
        steps: ['The belt moves at one speed, and it doesn\'t slip, so both rims move at the belt\'s speed: $r_1\\omega_1 = r_2\\omega_2$.', '$\\omega_2 = \\omega_1 \\dfrac{r_1}{r_2} = (' + D(n1, 0) + '\\ \\text{rpm})\\dfrac{' + D(r1, 0) + '\\ \\text{cm}}{' + D(r2, 0) + '\\ \\text{cm}} = ' + un(n2, 'rpm') + '$.', 'Units cancel in the ratio, so rpm can stay rpm here. The bigger pulley turns more slowly.'],
        hint: 'The rims of both pulleys move at the same linear speed as the belt.' }, { k: 'la-belt', r1: r1, r2: r2, n1: n1 });
    }
    return out({ q: 'On a turning merry-go-round, Kim sits at the edge and Lee sits halfway between the center and the edge. Compared with Lee, Kim has…',
      a: mc('the same angular velocity and twice the speed', ['the same speed and the same angular velocity', 'twice the angular velocity and twice the speed', 'the same speed and half the angular velocity']),
      steps: ['The whole merry-go-round turns as one piece, so both turn through the same angle each second: same $\\omega$.', 'Speed is $v = r\\omega$. Kim\'s radius is twice Lee\'s, so Kim covers twice the distance around her bigger circle in the same time.', 'So Kim moves twice as fast with the same angular velocity.'],
      hint: 'Do they turn through the same angle in the same time? Then use v = rω.' }, { k: 'concept' });
  });

  // ---------- torque ----------
  G('phys1.torque', function (R, ctx) {
    var kind = pickT(R, ctx, ['perp', 'perp', 'angle'], ['angle', 'net', 'net', 'which'], ['net3', 'force', 'which', 'angle']);
    if (kind === 'perp') {
      var r = R.pick([0.2, 0.25, 0.3, 0.35, 0.4, 0.45]), Fv = R.pick([40, 50, 60, 80, 90, 120, 150]), tau = r * Fv;
      return out({ q: 'You pull on the end of a wrench $' + ud(r, 2, 'm') + '$ long with a force of $' + ud(Fv, 0, 'N') + '$, at right angles to the handle. What torque do you apply to the bolt?', a: A(tau, 0.01), unit: 'N·m',
        steps: ['Torque is the turning effect of a force: $\\tau = r F \\sin\\theta$, with $r$ the distance from the axis to where the force acts and $\\theta$ the angle between $\\vec{r}$ and $\\vec{F}$.', 'At right angles, $\\sin 90^\\circ = 1$: $\\tau = (' + ud(r, 2, 'm') + ')(' + ud(Fv, 0, 'N') + ') = ' + un(tau, 'N·m') + '$.'],
        hint: 'Multiply the force by its distance from the bolt.' }, { k: 'tq-perp', r: r, F: Fv });
    }
    if (kind === 'angle' || kind === 'force') {
      var rd = R.pick([0.6, 0.7, 0.8, 0.9]), ang = R.pick([30, 45, 60, 120, 150]), Fd = R.pick([20, 25, 30, 40, 50, 60]), td = rd * Fd * sind(ang);
      if (kind === 'force') {
        var need = R.pick([40, 50, 60, 75, 90]), rw = R.pick([0.25, 0.3, 0.4, 0.5]), aw = R.pick([30, 45, 60, 70]), Fw = need / (rw * sind(aw));
        return out({ q: 'A stuck bolt needs a torque of $' + ud(need, 0, 'N·m') + '$ to start turning. You pull on a wrench $' + ud(rw, 2, 'm') + '$ from the bolt, at an angle of $' + aw + '^\\circ$ to the handle. What force do you need?', a: A(Fw, 0.01), unit: 'N',
          steps: ['$\\tau = rF\\sin\\theta$, so $F = \\dfrac{\\tau}{r\\sin\\theta}$.', '$F = \\dfrac{' + ud(need, 0, 'N·m') + '}{(' + ud(rw, 2, 'm') + ')\\sin ' + aw + '^\\circ} = \\dfrac{' + ud(need, 0, 'N·m') + '}{' + un(rw * sind(aw), 'm') + '} = ' + un(Fw, 'N') + '$.', 'Pulling at right angles would need only $' + un(need / rw, 'N') + '$: a slanted pull wastes part of the force.'],
          hint: 'Solve τ = rF sin θ for F.' }, { k: 'tq-F', tau: need, r: rw, ang: aw });
      }
      return out({ q: 'You push on a door $' + ud(rd, 1, 'm') + '$ from its hinges with a force of $' + ud(Fd, 0, 'N') + '$. Your push makes an angle of $' + ang + '^\\circ$ with the surface of the door. What torque does your push exert about the hinges?', a: A(td, 0.01), unit: 'N·m',
        viz: { name: 'ph-torque', opts: { scene: 'door', beamLength: 1, forces: [{ x: rd, mag: Fd, angle: ang, label: 'F' }], quiet: true, interactive: false, show: ['leverArm'] } },
        steps: ['The door lies along $\\vec{r}$ (from the hinge to your hand), so the angle between $\\vec{r}$ and $\\vec{F}$ is $' + ang + '^\\circ$.', 'Only the part of the force at right angles to the door turns it: $F_\\perp = F\\sin\\theta = (' + ud(Fd, 0, 'N') + ')\\sin ' + ang + '^\\circ = ' + un(Fd * sind(ang), 'N') + '$.', '$\\tau = rF\\sin\\theta = (' + ud(rd, 1, 'm') + ')(' + un(Fd * sind(ang), 'N') + ') = ' + un(td, 'N·m') + '$.'],
        hint: 'Use τ = rF sin θ with the angle between the door and the force.' }, { k: 'tq-ang', r: rd, F: Fd, ang: ang });
    }
    if (kind === 'net' || kind === 'net3') {
      var n = kind === 'net3' ? 3 : 2, xs = R.sample([0, 0.5, 1, 1.5, 2.5, 3, 3.5, 4], n), fs = [];
      if (n === 2 && (xs[0] - 2) * (xs[1] - 2) > 0) xs[1] = 4 - xs[1];
      for (var i = 0; i < n; i++) fs.push({ x: xs[i], mag: R.pick([10, 15, 20, 25, 30, 40, 50, 60]), angle: i === 2 && R.coin() ? 90 : -90, label: 'F' + (i + 1) });
      var taus = fs.map(function (f) { return clean((f.x - 2) * f.mag * (f.angle > 0 ? 1 : -1)); }), net = clean(taus.reduce(function (a, b) { return a + b; }, 0));
      if (M.abs(net) < 1e-9) { fs[0].mag += 10; taus[0] = clean((fs[0].x - 2) * fs[0].mag * (fs[0].angle > 0 ? 1 : -1)); net = clean(taus.reduce(function (a, b) { return a + b; }, 0)); }
      var dsc = fs.map(function (f, j) { var d = f.x - 2; return '$F_' + (j + 1) + ' = ' + ud(f.mag, 0, 'N') + '$ ' + (f.angle > 0 ? 'up' : 'down') + ', $' + ud(M.abs(d), 1, 'm') + '$ ' + (d < 0 ? 'left' : 'right') + ' of the pivot'; });
      return out({ q: 'A light beam $4.0\\ \\text{m}$ long rests on a pivot at its middle. Forces act on it as shown: ' + U.list(dsc) + '. Counting counterclockwise as positive, what is the net torque about the pivot?', a: A(net, 0.01), unit: 'N·m',
        viz: { name: 'ph-torque', opts: { scene: 'beam', beamLength: 4, pivot: 2, forces: fs, quiet: true, interactive: false } },
        steps: fs.map(function (f, j) { var d = f.x - 2, ccw = taus[j] > 0; return '$F_' + (j + 1) + '$: lever arm $' + ud(M.abs(d), 1, 'm') + '$; ' + (f.angle > 0 ? 'up' : 'down') + ' on the ' + (d < 0 ? 'left' : 'right') + ' turns the beam ' + (ccw ? 'counterclockwise' : 'clockwise') + ': $\\tau_' + (j + 1) + ' = ' + (ccw ? '+' : '-') + '(' + ud(M.abs(d), 1, 'm') + ')(' + ud(f.mag, 0, 'N') + ') = ' + un(taus[j], 'N·m') + '$.'; })
          .concat(['$\\Sigma\\tau = ' + taus.map(function (t, j) { var s = F(t); return j ? (s.charAt(0) === '-' ? ' - ' + s.slice(1) : ' + ' + s) : s; }).join('') + ' = ' + un(net, 'N·m') + '$: the beam starts to turn ' + (net > 0 ? 'counterclockwise.' : 'clockwise.')]),
        hint: 'For each force, multiply by its distance from the pivot, and give it a sign from the way it would turn the beam.' }, { k: 'tq-net', fs: fs });
    }
    // which push makes the biggest torque?
    for (var tries = 0; tries < 50; tries++) {
      var W = R.pick([0.8, 0.9, 1]), opts = [
        { F: R.pick([30, 40, 50]), r: W, a: 90, t: 'at the outer edge, at right angles to the door' },
        { F: R.pick([60, 70, 80]), r: W / 2, a: 90, t: 'halfway to the hinges, at right angles to the door' },
        { F: R.pick([70, 80, 90]), r: W, a: 30, t: 'at the outer edge, at $30^\\circ$ to the door' },
        { F: R.pick([100, 120, 150]), r: W, a: 0, t: 'at the outer edge, straight along the door toward the hinges' }];
      opts.forEach(function (o) { o.tau = o.r * o.F * (o.a === 0 ? 0 : sind(o.a)); });
      var mx = M.max.apply(null, opts.map(function (o) { return o.tau; }));
      var winners = opts.filter(function (o) { return M.abs(o.tau - mx) < 0.5; });
      if (winners.length === 1 && winners[0] !== opts[3]) break;
    }
    var lab = function (o) { return '$' + ud(o.F, 0, 'N') + '$ ' + o.t; }, best = winners[0];
    return out({ q: 'A door is $' + ud(W, 1, 'm') + '$ wide. Which push makes the largest torque about its hinges?', a: mc(lab(best), opts.filter(function (o) { return o !== best; }).map(lab)),
      steps: opts.map(function (o) { return '$\\tau = (' + ud(o.r, 2, 'm') + ')(' + ud(o.F, 0, 'N') + ')\\sin ' + o.a + '^\\circ = ' + un(o.tau, 'N·m') + '$ for ' + lab(o) + '.'; })
        .concat(['The biggest force is not the winner: torque depends on the force, where it acts and its direction. A push along the door toward the hinges makes no torque at all.']),
      hint: 'Work out τ = rF sin θ for each push. Where the force acts and its direction matter as much as its size.' }, { k: 'tq-which', opts: opts });
  });

  // ---------- rotational equilibrium ----------
  G('phys1.rotational-equilibrium', function (R, ctx) {
    var kind = pickT(R, ctx, ['seesaw', 'seesaw', 'pivot'], ['plank', 'pivot', 'seesaw'], ['sign', 'plank', 'tip']);
    if (kind === 'seesaw' || kind === 'pivot') {
      var names = R.sample(['Ava', 'Ben', 'Cal', 'Dee', 'Eli', 'Fay'], 2), m1 = R.pick([20, 24, 25, 30, 32, 35, 40]), m2 = R.pick([20, 25, 28, 30, 36, 40, 45].filter(function (x) { return x !== m1; })), d1 = R.pick([1, 1.2, 1.5, 1.6, 2]);
      var d2 = m1 * d1 / m2;
      if (d2 > 2.4) { d1 = 1; d2 = m1 / m2; }
      var Mb = R.pick([10, 15, 20]);
      if (kind === 'pivot') {
        var Np = (m1 + m2 + Mb) * g;
        return out({ q: 'A uniform seesaw board ($' + ud(Mb, 0, 'kg') + '$) is balanced on a pivot at its middle. ' + names[0] + ' ($' + ud(m1, 0, 'kg') + '$) sits $' + ud(d1, 1, 'm') + '$ to the left of the pivot and ' + names[1] + ' ($' + ud(m2, 0, 'kg') + '$) sits on the right, where the board balances. How large is the upward force the pivot exerts on the board?', a: A(Np, 0.01), unit: 'N',
          steps: ['Balanced means no rotation and no translation: $\\Sigma\\tau = 0$ and $\\Sigma F = 0$. The torque condition tells us where ' + names[1] + ' sits, but this question needs the force condition.', 'The upward pivot force must cancel every weight: $F_{\\text{pivot}} = (m_1 + m_2 + M)g$.', '$F_{\\text{pivot}} = (' + D(m1, 0) + ' + ' + D(m2, 0) + ' + ' + D(Mb, 0) + ')\\ \\text{kg} \\times 9.8\\ \\text{m/s}^{2} = ' + un(Np, 'N') + '$.', 'The pivot carries everything. Leaving out this force, or the board\'s weight, is a common slip.'],
          hint: 'The board isn\'t moving up or down, so the pivot\'s push equals the total weight.' }, { k: 'eq-pivot', m1: m1, m2: m2, M: Mb });
      }
      var askM = lv(ctx) > 1 && R.coin();
      return out({ q: names[0] + ' ($' + ud(m1, 0, 'kg') + '$) sits $' + ud(d1, 1, 'm') + '$ to the left of the pivot of a uniform seesaw that pivots at its middle. ' + (askM ? names[1] + ' sits $' + un(d2, 'm') + '$ to the right of the pivot, and the seesaw balances. What is ' + names[1] + '\'s mass?' : names[1] + ' ($' + ud(m2, 0, 'kg') + '$) sits on the right. How far from the pivot must ' + names[1] + ' sit for the seesaw to balance?'),
        a: A(askM ? m2 : d2, 0.01), unit: askM ? 'kg' : 'm',
        steps: ['Take torques about the pivot. The board\'s own weight acts at the pivot, so it makes no torque there.', 'Balance: counterclockwise torque = clockwise torque, $m_1 g\\, d_1 = m_2 g\\, d_2$. The $g$ cancels.',
          askM ? '$m_2 = \\dfrac{m_1 d_1}{d_2} = \\dfrac{(' + ud(m1, 0, 'kg') + ')(' + ud(d1, 1, 'm') + ')}{' + un(d2, 'm') + '} = ' + un(m2, 'kg') + '$.' : '$d_2 = \\dfrac{m_1 d_1}{m_2} = \\dfrac{(' + ud(m1, 0, 'kg') + ')(' + ud(d1, 1, 'm') + ')}{' + ud(m2, 0, 'kg') + '} = ' + un(d2, 'm') + '$.',
          (askM ? m2 > m1 : m2 > m1) ? 'The heavier child sits closer to the pivot.' : 'The lighter child sits farther from the pivot.'],
        hint: 'Set the torque of each child (weight × distance) equal.' }, { k: 'eq-seesaw', m1: m1, d1: d1, m2: m2, ask: askM ? 'm' : 'd' });
    }
    if (kind === 'plank' || kind === 'tip') {
      var L = R.pick([3, 4, 5, 6]), Mp = R.pick([10, 15, 20, 25, 30]), mp = R.pick([50, 60, 65, 70, 80]), x = R.pick([0.5, 1, 1.5, 2, 2.5].filter(function (q) { return q < L; }));
      if (kind === 'tip') {
        var s, over; // supports at 0 and L − s; the plank tips about the right support when the painter is d = M(L/2 − s)/m past it
        for (var tt = 0; tt < 60; tt++) { L = R.pick([3, 4, 5, 6]); s = R.pick([1, 1.5, 2].filter(function (q) { return q < L / 2; })); Mp = R.pick([10, 15, 20, 25, 30]); mp = R.pick([50, 60, 65, 70, 80]); over = Mp * (L / 2 - s) / mp; if (over < 0.85 * s && over >= 0.1) break; }
        if (!(over < 0.85 * s && over >= 0.1)) { L = 4; s = 1; Mp = 20; mp = 50; over = 0.4; }
        return out({ q: 'A uniform plank ($' + ud(Mp, 0, 'kg') + '$, $' + ud(L, 1, 'm') + '$ long) rests on two supports: one at its left end and one $' + ud(s, 1, 'm') + '$ in from its right end. A painter ($' + ud(mp, 0, 'kg') + '$) walks out along the overhang. How far past the right support can the painter stand before the plank starts to tip?', a: A(over, 0.01), unit: 'm',
          steps: ['Just before it tips, the left support pushes with zero force, so the plank pivots on the right support.', 'Torques about the right support: the plank\'s weight acts at its middle, $' + un(L / 2 - s, 'm') + '$ to the left of the support; the painter stands a distance $d$ to the right.', 'Balance: $M g (' + F(L / 2 - s) + '\\ \\text{m}) = m g\\, d$, so $d = \\dfrac{M(' + F(L / 2 - s) + '\\ \\text{m})}{m} = \\dfrac{(' + D(Mp, 0) + ')(' + F(L / 2 - s) + ')}{' + D(mp, 0) + '}\\ \\text{m} = ' + un(over, 'm') + '$.', 'Beyond that point the painter\'s torque wins and the plank tips.'],
          hint: 'At the tipping point the far support pushes with zero force. Take torques about the support under the overhang.' }, { k: 'eq-tip', L: L, M: Mp, m: mp, s: s });
      }
      var FR = (Mp * g * L / 2 + mp * g * x) / L, FL = (Mp + mp) * g - FR, askR = R.coin();
      return out({ q: 'A uniform plank ($' + ud(Mp, 0, 'kg') + '$, $' + ud(L, 1, 'm') + '$ long) rests on two supports, one under each end. A person ($' + ud(mp, 0, 'kg') + '$) stands $' + ud(x, 1, 'm') + '$ from the left end. What force does the ' + (askR ? 'right' : 'left') + ' support exert on the plank?', a: A(askR ? FR : FL, 0.01), unit: 'N',
        viz: { name: 'ph-torque', opts: { scene: 'beam', beamLength: L, pivot: 0, beamMass: Mp, masses: [{ x: x, m: mp }], forces: [{ x: L, mag: clean(sig(FR, 4)), angle: 90, label: 'right support' }], quiet: true, interactive: false, hide: ['net'] } },
        steps: ['Choose the pivot at the ' + (askR ? 'left' : 'right') + ' support: that support\'s unknown force then has no lever arm and drops out.',
          askR ? 'Torques about the left end: $F_R(' + ud(L, 1, 'm') + ') = M g (' + un(L / 2, 'm') + ') + m g (' + ud(x, 1, 'm') + ')$.' : 'Torques about the right end: $F_L(' + ud(L, 1, 'm') + ') = M g (' + un(L / 2, 'm') + ') + m g (' + un(L - x, 'm') + ')$.',
          askR ? '$F_R = \\dfrac{(' + D(Mp, 0) + ')(9.8)(' + F(L / 2) + ') + (' + D(mp, 0) + ')(9.8)(' + D(x, 1) + ')}{' + D(L, 1) + '}\\ \\text{N} = ' + un(FR, 'N') + '$.' : '$F_L = \\dfrac{(' + D(Mp, 0) + ')(9.8)(' + F(L / 2) + ') + (' + D(mp, 0) + ')(9.8)(' + F(L - x) + ')}{' + D(L, 1) + '}\\ \\text{N} = ' + un(FL, 'N') + '$.',
          'Check with $\\Sigma F = 0$: $F_L + F_R = ' + un(FL, 'N') + ' + ' + un(FR, 'N') + ' = ' + un(FL + FR, 'N') + '$, the total weight $(' + D(Mp + mp, 0) + '\\ \\text{kg})(9.8\\ \\text{m/s}^2)$.'],
        hint: 'Take torques about the other support so its force drops out. The plank\'s weight acts at its middle.' }, { k: 'eq-plank', L: L, M: Mp, m: mp, x: x, ask: askR ? 'R' : 'L' });
    }
    // hinged beam with a cable (a hanging sign)
    var Lb = R.pick([1.5, 2, 2.5, 3]), Mbm = R.pick([5, 8, 10, 12]), ms = R.pick([10, 15, 20, 25]), xs = clean(Lb * R.pick([0.5, 0.75, 1])), th = R.pick([30, 35, 40, 45, 50, 60]);
    var T = (Mbm * g * Lb / 2 + ms * g * xs) / (Lb * sind(th));
    return out({ q: 'A uniform horizontal beam ($' + ud(Mbm, 0, 'kg') + '$, $' + ud(Lb, 1, 'm') + '$ long) is hinged to a wall at one end. A cable from the far end to the wall above makes an angle of $' + th + '^\\circ$ with the beam. A $' + ud(ms, 0, 'kg') + '$ sign hangs from the beam $' + un(xs, 'm') + '$ from the wall. What is the tension in the cable?', a: A(T, 0.02), unit: 'N',
      viz: { name: 'ph-torque', opts: { scene: 'sign', beamLength: Lb, beamMass: Mbm, masses: [{ x: xs, m: ms }], cableAngle: th, quiet: true, interactive: false } },
      steps: ['Take torques about the hinge: the hinge force, whatever its direction, then has no lever arm.', 'The cable pulls at the end ($r = ' + ud(Lb, 1, 'm') + '$) at $' + th + '^\\circ$ to the beam, so its torque is $T(' + ud(Lb, 1, 'm') + ')\\sin ' + th + '^\\circ$ (counterclockwise).', 'The weights pull down: the beam\'s at its middle and the sign\'s at $' + un(xs, 'm') + '$ (clockwise).', '$T = \\dfrac{M g (L/2) + m g x}{L \\sin\\theta} = \\dfrac{(' + D(Mbm, 0) + ')(9.8)(' + F(Lb / 2) + ') + (' + D(ms, 0) + ')(9.8)(' + F(xs) + ')}{(' + D(Lb, 1) + ')\\sin ' + th + '^\\circ}\\ \\text{N} = ' + un(T, 'N') + '$.'],
      hint: 'Put the pivot at the hinge, where the unknown hinge force acts. Only the part of the tension at right angles to the beam makes torque.' }, { k: 'eq-sign', L: Lb, M: Mbm, m: ms, x: xs, th: th });
  });

  // ---------- rotational inertia ----------
  var SH = { hoop: { n: 'thin hoop (ring)', c: 1, f: 'MR^2' }, disk: { n: 'solid disk', c: 0.5, f: '\\tfrac{1}{2}MR^2' }, sphere: { n: 'solid sphere', c: 0.4, f: '\\tfrac{2}{5}MR^2' }, shell: { n: 'thin hollow sphere', c: 2 / 3, f: '\\tfrac{2}{3}MR^2' }, cyl: { n: 'solid cylinder', c: 0.5, f: '\\tfrac{1}{2}MR^2' } };
  G('phys1.rotational-inertia', function (R, ctx) {
    var kind = pickT(R, ctx, ['points', 'points', 'shape'], ['shape', 'composite', 'points3', 'rod'], ['axis', 'scale', 'composite', 'rank']);
    if (kind === 'points' || kind === 'points3') {
      var n = kind === 'points3' ? 3 : 2, ms = [], rs = [];
      for (var i = 0; i < n; i++) { ms.push(R.pick([0.2, 0.5, 1, 1.5, 2, 3])); rs.push(R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5])); }
      var I = clean(ms.reduce(function (s, m, j) { return s + m * rs[j] * rs[j]; }, 0));
      return out({ q: 'Small beads are fixed to a light rod that spins about an axis through its middle: ' + U.list(ms.map(function (m, j) { return '$' + ud(m, 1, 'kg') + '$ at $' + ud(rs[j], 2, 'm') + '$ from the axis'; })) + '. What is the rotational inertia of the beads about the axis?', a: A(I, 0.01), unit: 'kg·m²',
        viz: lv(ctx) === 1 ? { name: 'ph-rotation', opts: { mode: 'inertia', masses: ms.slice(0, 2), radii: rs.slice(0, 2), L: 1.2, quiet: true, interactive: false } } : undefined,
        steps: ['Each bead adds $mr^2$, with $r$ its distance from the axis: $I = \\Sigma m r^2$.', '$I = ' + ms.map(function (m, j) { return '(' + D(m, 1) + ')(' + D(rs[j], 2) + ')^2'; }).join(' + ') + '\\ \\text{kg·m}^{2}$', '$I = ' + ms.map(function (m, j) { return F(clean(m * rs[j] * rs[j])); }).join(' + ') + ' = ' + un(I, 'kg·m²') + '$.', 'The distance is squared: a bead twice as far out counts four times as much.'],
        hint: 'Add up m r² for every bead.' }, { k: 'ri-pts', m: ms, r: rs });
    }
    if (kind === 'shape' || kind === 'rod') {
      if (kind === 'rod') {
        var Mr = R.pick([0.5, 1, 1.5, 2, 3, 4]), Lr = R.pick([0.6, 1, 1.2, 1.5, 2]), end = R.coin(), Ir = end ? Mr * Lr * Lr / 3 : Mr * Lr * Lr / 12;
        return out({ q: 'A thin uniform rod ($' + ud(Mr, 1, 'kg') + '$, $' + ud(Lr, 1, 'm') + '$ long) spins about an axis at right angles to it through ' + (end ? 'one end' : 'its center') + '. What is its rotational inertia?', a: A(Ir, 0.01), unit: 'kg·m²',
          steps: ['For a thin rod, $I = \\tfrac{1}{12}ML^2$ about the center and $I = \\tfrac{1}{3}ML^2$ about one end (more mass is far from an axis at the end).', '$I = ' + (end ? '\\tfrac{1}{3}' : '\\tfrac{1}{12}') + '(' + ud(Mr, 1, 'kg') + ')(' + ud(Lr, 1, 'm') + ')^2 = ' + un(Ir, 'kg·m²') + '$.'],
          hint: end ? 'Use I = ⅓ML² for an axis at the end.' : 'Use I = (1/12)ML² for an axis through the center.' }, { k: 'ri-rod', M: Mr, L: Lr, end: end });
      }
      var key = R.pick(['hoop', 'disk', 'sphere', 'shell', 'cyl']), S = SH[key], Ms = R.pick([0.5, 1, 1.5, 2, 4, 5, 8]), Rs = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4]), Is = S.c * Ms * Rs * Rs;
      return out({ q: 'A ' + S.n + ' has a mass of $' + ud(Ms, 1, 'kg') + '$ and a radius of $' + ud(Rs, 2, 'm') + '$. What is its rotational inertia about ' + (key === 'sphere' || key === 'shell' ? 'an axis through its center' : 'its central axis (at right angles to its flat face)') + '?', a: A(Is, 0.01), unit: 'kg·m²',
        steps: ['For a ' + S.n + ', $I = ' + S.f + '$. ' + (key === 'hoop' ? 'All the mass is at the rim, the most it can be for this mass and radius.' : 'Some of the mass is close to the axis, so the number in front is less than 1.'), '$I = ' + S.f.replace('MR^2', '(' + ud(Ms, 1, 'kg') + ')(' + ud(Rs, 2, 'm') + ')^2') + ' = ' + un(Is, 'kg·m²') + '$.'],
        hint: 'Use the formula for this shape, with the radius squared.' }, { k: 'ri-shape', c: S.c, M: Ms, R: Rs });
    }
    if (kind === 'composite') {
      var Md = R.pick([2, 3, 4, 5, 6]), Rd = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), mc_ = R.pick([0.5, 1, 1.5, 2]), Ic = 0.5 * Md * Rd * Rd + mc_ * Rd * Rd;
      return out({ q: 'A solid disk ($' + ud(Md, 1, 'kg') + '$, radius $' + ud(Rd, 2, 'm') + '$) spins about its central axis. A small $' + ud(mc_, 1, 'kg') + '$ lump of clay is stuck to its rim. What is the rotational inertia of disk and clay together?', a: A(Ic, 0.01), unit: 'kg·m²',
        steps: ['Rotational inertias about the same axis add.', 'Disk: $\\tfrac{1}{2}MR^2 = \\tfrac{1}{2}(' + ud(Md, 1, 'kg') + ')(' + ud(Rd, 2, 'm') + ')^2 = ' + un(0.5 * Md * Rd * Rd, 'kg·m²') + '$.', 'Clay (a point at the rim): $mR^2 = (' + ud(mc_, 1, 'kg') + ')(' + ud(Rd, 2, 'm') + ')^2 = ' + un(mc_ * Rd * Rd, 'kg·m²') + '$.', 'Total: $I = ' + un(Ic, 'kg·m²') + '$.'],
        hint: 'Add the disk\'s ½MR² and the clay\'s mR².' }, { k: 'ri-comp', M: Md, R: Rd, m: mc_ });
    }
    if (kind === 'axis') {
      var m1 = R.pick([1, 2, 3]), m2 = R.pick([1, 2, 3]), Lx = R.pick([0.4, 0.6, 0.8, 1]), Ic2 = (m1 + m2) * sq(Lx / 2), Ie = m2 * Lx * Lx;
      return out({ q: 'A light rod $' + ud(Lx, 1, 'm') + '$ long has a $' + ud(m1, 1, 'kg') + '$ ball on one end and a $' + ud(m2, 1, 'kg') + '$ ball on the other. What is its rotational inertia about an axis through the end with the $' + ud(m1, 1, 'kg') + '$ ball? (Treat the balls as points.)', a: A(Ie, 0.01), unit: 'kg·m²',
        steps: ['The $' + ud(m1, 1, 'kg') + '$ ball sits on the axis: $r = 0$, so it adds nothing.', 'The other ball is $' + ud(Lx, 1, 'm') + '$ away: $I = (' + ud(m2, 1, 'kg') + ')(' + ud(Lx, 1, 'm') + ')^2 = ' + un(Ie, 'kg·m²') + '$.', 'About the middle, the same object has $I = ' + un(Ic2, 'kg·m²') + '$: rotational inertia depends on where the axis is, not only on the mass.'],
        hint: 'Measure each distance from the new axis. A mass on the axis adds nothing.' }, { k: 'ri-axis', m1: m1, m2: m2, L: Lx });
    }
    if (kind === 'scale') {
      var k = R.pick([2, 3, 1.5, 0.5]), Iold = R.pick([0.02, 0.04, 0.05, 0.08, 0.1]);
      return out({ q: 'A spinning toy has a rotational inertia of $' + ud(Iold, 2, 'kg·m²') + '$, almost all of it from small weights on its arms. The weights slide out until each is ' + (k === 0.5 ? 'half as far' : k + ' times as far') + ' from the axis. What is the new rotational inertia?', a: A(Iold * k * k, 0.01), unit: 'kg·m²',
        steps: ['Each weight contributes $mr^2$. Multiplying $r$ by $' + F(k) + '$ multiplies $r^2$ by $' + F(k * k) + '$.', '$I_{\\text{new}} = ' + F(k * k) + ' \\times ' + ud(Iold, 2, 'kg·m²') + ' = ' + un(Iold * k * k, 'kg·m²') + '$.', 'The mass did not change, yet $I$ did: where the mass sits matters.'],
        hint: 'I depends on r², so think about what happens to r² when r changes.' }, { k: 'ri-scale', fac: k, I: Iold });
    }
    return out({ q: 'A hoop, a solid disk and a solid sphere all have the same mass and the same radius. Which has the largest rotational inertia about an axis through its center?',
      a: mc('The hoop', ['The solid sphere', 'The solid disk', 'All three are the same, because they have the same mass']),
      steps: ['$I = \\Sigma mr^2$ depends on how far the mass is from the axis.', 'The hoop has all its mass at distance $R$: $I = MR^2$.', 'The disk ($\\tfrac{1}{2}MR^2$) and sphere ($\\tfrac{2}{5}MR^2$) have much of their mass nearer the axis, so the hoop has the largest $I$.'],
      hint: 'Which shape keeps all its mass farthest from the axis?' }, { k: 'concept' });
  });

  G('phys1.rotational-second-law', function (R, ctx) {
    var kind = pickT(R, ctx, ['basic', 'basic', 'disk'], ['disk', 'brake', 'basic'], ['net', 'findI', 'brake']);
    if (kind === 'basic') {
      var tau = R.pick([2, 3, 4, 5, 6, 8, 12]), I = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8]), al = tau / I;
      return out({ q: 'A net torque of $' + ud(tau, 1, 'N·m') + '$ acts on a wheel whose rotational inertia is $' + ud(I, 2, 'kg·m²') + '$. What is its angular acceleration?', a: A(al, 0.01), unit: 'rad/s²',
        steps: ['Newton\'s second law for rotation: $\\Sigma\\tau = I\\alpha$ (torque plays the role of force, rotational inertia the role of mass).', '$\\alpha = \\dfrac{\\Sigma\\tau}{I} = \\dfrac{' + ud(tau, 1, 'N·m') + '}{' + ud(I, 2, 'kg·m²') + '} = ' + un(al, 'rad/s²') + '$.'],
        hint: 'Divide the net torque by the rotational inertia.' }, { k: 'r2-basic', tau: tau, I: I });
    }
    if (kind === 'disk') {
      var Fv = R.pick([5, 8, 10, 12, 15, 20]), M2 = R.pick([2, 4, 5, 6, 8, 10]), Rr = R.pick([0.1, 0.15, 0.2, 0.25, 0.3]), Id = 0.5 * M2 * Rr * Rr, ald = Fv * Rr / Id;
      return out({ q: 'A string wrapped around a solid disk ($' + ud(M2, 1, 'kg') + '$, radius $' + ud(Rr, 2, 'm') + '$) is pulled with a steady $' + ud(Fv, 0, 'N') + '$. The disk turns freely on a fixed axle through its center. What is its angular acceleration?', a: A(ald, 0.01), unit: 'rad/s²',
        steps: ['The string pulls along the rim, at right angles to the radius: $\\tau = RF = (' + ud(Rr, 2, 'm') + ')(' + ud(Fv, 0, 'N') + ') = ' + un(Fv * Rr, 'N·m') + '$.', 'Rotational inertia: $I = \\tfrac{1}{2}MR^2 = \\tfrac{1}{2}(' + ud(M2, 1, 'kg') + ')(' + ud(Rr, 2, 'm') + ')^2 = ' + un(Id, 'kg·m²') + '$.', '$\\alpha = \\dfrac{\\tau}{I} = \\dfrac{' + un(Fv * Rr, 'N·m') + '}{' + un(Id, 'kg·m²') + '} = ' + un(ald, 'rad/s²') + '$.', 'Using $F/m$ here would give an acceleration in m/s², not a rotation: rotation needs torque and rotational inertia.'],
        hint: 'Find the torque (R × F) and the disk\'s I = ½MR², then divide.' }, { k: 'r2-disk', F: Fv, M: M2, R: Rr });
    }
    if (kind === 'brake') {
      var Ib = R.pick([0.5, 0.8, 1.2, 2, 2.5]), n0 = R.pick([60, 120, 180, 240, 300]), tb = R.pick([4, 5, 6, 8, 10, 12]), w0 = rpm2w(n0), tq = Ib * w0 / tb;
      return out({ q: 'A spinning wheel with rotational inertia $' + ud(Ib, 1, 'kg·m²') + '$ turns at $' + D(n0, 0) + '$ rpm. A brake brings it to a stop in $' + ud(tb, 0, 's') + '$ with a steady torque. How large is the braking torque?', a: A(tq, 0.01), unit: 'N·m',
        steps: ['Convert: $\\omega_0 = ' + D(n0, 0) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w0, 'rad/s') + '$.', 'Angular acceleration: $\\alpha = \\dfrac{0 - \\omega_0}{t} = -\\dfrac{' + F(w0) + '}{' + D(tb, 0) + '}\\ \\text{rad/s}^{2} = ' + un(-w0 / tb, 'rad/s²') + '$.', '$|\\tau| = I|\\alpha| = (' + ud(Ib, 1, 'kg·m²') + ')(' + un(w0 / tb, 'rad/s²') + ') = ' + un(tq, 'N·m') + '$.'],
        hint: 'Find α from the change in ω (in rad/s) over the time, then use τ = Iα.' }, { k: 'r2-brake', I: Ib, n0: n0, t: tb });
    }
    if (kind === 'net') {
      var In = R.pick([0.05, 0.08, 0.1, 0.2]), r1 = R.pick([0.1, 0.2, 0.3]), r2 = R.pick([0.1, 0.15, 0.25]), F1 = R.pick([10, 12, 15, 20]), F2 = R.pick([8, 10, 16, 24]);
      var net = r1 * F1 - r2 * F2; if (M.abs(net) < 1e-9) { F1 += 5; net = r1 * F1 - r2 * F2; } var aln = net / In;
      return out({ q: 'A wheel ($I = ' + ud(In, 2, 'kg·m²') + '$) turns on a frictionless axle. A rope on a hub at radius $' + ud(r1, 2, 'm') + '$ pulls with $' + ud(F1, 0, 'N') + '$, trying to turn it counterclockwise. A second rope at radius $' + ud(r2, 2, 'm') + '$ pulls with $' + ud(F2, 0, 'N') + '$, trying to turn it clockwise. Both ropes pull along the edges, at right angles to the radius. Taking counterclockwise as positive, what is the wheel\'s angular acceleration?', a: A(aln, 0.01), unit: 'rad/s²',
        steps: ['Counterclockwise torque: $(' + ud(r1, 2, 'm') + ')(' + ud(F1, 0, 'N') + ') = ' + un(r1 * F1, 'N·m') + '$. Clockwise torque: $(' + ud(r2, 2, 'm') + ')(' + ud(F2, 0, 'N') + ') = ' + un(r2 * F2, 'N·m') + '$.', '$\\Sigma\\tau = ' + F(r1 * F1) + ' - ' + F(r2 * F2) + ' = ' + un(net, 'N·m') + '$.', '$\\alpha = \\dfrac{\\Sigma\\tau}{I} = \\dfrac{' + un(net, 'N·m') + '}{' + ud(In, 2, 'kg·m²') + '} = ' + un(aln, 'rad/s²') + '$' + (net < 0 ? ': clockwise, even though the counterclockwise rope ' + (F1 > F2 ? 'pulls harder.' : 'pulls too.') : '.')],
        hint: 'Compare torques, not forces: each is r × F. Then use α = Στ/I.' }, { k: 'r2-net', I: In, r1: r1, F1: F1, r2: r2, F2: F2 });
    }
    var Fi = R.pick([4, 5, 6, 8, 10]), Ri = R.pick([0.1, 0.2, 0.25, 0.3]), ali = R.pick([5, 8, 10, 12, 16, 20]), Ii = Fi * Ri / ali;
    return out({ q: 'To measure a flywheel\'s rotational inertia, a student pulls a cord wrapped around its rim (radius $' + ud(Ri, 2, 'm') + '$) with a steady $' + ud(Fi, 1, 'N') + '$, at right angles to the radius. The flywheel\'s angular acceleration is $' + ud(ali, 1, 'rad/s²') + '$. Friction is negligible. What is its rotational inertia?', a: A(Ii, 0.01), unit: 'kg·m²',
      steps: ['Torque from the cord: $\\tau = RF = (' + ud(Ri, 2, 'm') + ')(' + ud(Fi, 1, 'N') + ') = ' + un(Fi * Ri, 'N·m') + '$.', 'From $\\tau = I\\alpha$: $I = \\dfrac{\\tau}{\\alpha} = \\dfrac{' + un(Fi * Ri, 'N·m') + '}{' + ud(ali, 1, 'rad/s²') + '} = ' + un(Ii, 'kg·m²') + '$.'],
      hint: 'Find the torque, then solve τ = Iα for I.' }, { k: 'r2-I', F: Fi, R: Ri, al: ali });
  });

  G('phys1.rotation-translation', function (R, ctx) {
    var kind = pickT(R, ctx, ['a', 'a', 'T'], ['T', 'atwood', 'a', 'concept'], ['tensions', 'mass', 'atwood']);
    var Mp = R.pick([1, 2, 3, 4, 5, 6]), Rp = R.pick([0.1, 0.15, 0.2, 0.25]);
    if (kind === 'a' || kind === 'T' || kind === 'mass') {
      var m = R.pick([0.5, 1, 1.5, 2, 3]), a = m * g / (m + Mp / 2), T = m * (g - a), what = R.pick(['bucket', 'block', 'weight']);
      var setup = 'A $' + ud(m, 1, 'kg') + '$ ' + what + ' hangs from a light cord wrapped around a pulley that is a uniform solid disk ($' + ud(Mp, 1, 'kg') + '$, radius $' + ud(Rp, 2, 'm') + '$). The pulley turns without friction on a fixed axle. The ' + what + ' is released from rest.';
      var core = ['The hanging ' + what + ' (down positive): $mg - T = ma$.', 'Pulley: the cord pulls at the rim, so $TR = I\\alpha$ with $I = \\tfrac{1}{2}MR^2$. The cord doesn\'t slip, so $a = R\\alpha$, which gives $T = \\dfrac{I a}{R^2} = \\tfrac{1}{2}Ma$.', 'Add the two equations: $mg = \\left(m + \\tfrac{1}{2}M\\right)a$, so $a = \\dfrac{mg}{m + M/2} = \\dfrac{(' + ud(m, 1, 'kg') + ')(9.8\\ \\text{m/s}^2)}{' + ud(m, 1, 'kg') + ' + ' + un(Mp / 2, 'kg') + '} = ' + un(a, 'm/s²') + '$.'];
      if (kind === 'mass') {
        var aM = clean(sig(a, 3)), MM = 2 * m * (g / aM - 1);
        return out({ q: 'A $' + ud(m, 1, 'kg') + '$ weight hangs from a light cord wrapped around a pulley that is a uniform solid disk of radius $' + ud(Rp, 2, 'm') + '$, turning without friction. Released from rest, the weight falls with an acceleration of $' + ud(aM, 2, 'm/s²') + '$. What is the mass of the pulley?', a: A(MM, 0.02), unit: 'kg',
          steps: ['For the weight: $mg - T = ma$. For the disk pulley: $T = \\tfrac{1}{2}Ma$ (from $TR = \\tfrac{1}{2}MR^2 \\cdot \\tfrac{a}{R}$).', 'So $mg = \\left(m + \\tfrac{1}{2}M\\right)a$, which gives $M = 2m\\left(\\dfrac{g}{a} - 1\\right)$.', '$M = 2(' + ud(m, 1, 'kg') + ')\\left(\\dfrac{9.8}{' + D(aM, 2) + '} - 1\\right) = ' + un(MM, 'kg') + '$.', 'The radius cancels: a bigger disk of the same mass gives the same acceleration.'],
          hint: 'Write Newton\'s law for the weight and τ = Iα for the pulley, then solve for M.' }, { k: 'rt-M', m: m, a: aM });
      }
      return out({ q: setup + (kind === 'a' ? ' What is the ' + what + '\'s acceleration?' : ' What is the tension in the cord while the ' + what + ' falls?'), a: A(kind === 'a' ? a : T, 0.01), unit: kind === 'a' ? 'm/s²' : 'N',
        viz: lv(ctx) === 1 ? { name: 'ph-rotation', opts: { mode: 'pulley', m: m, M: Mp, R: Rp, quiet: true, interactive: false } } : undefined,
        steps: core.concat(kind === 'T' ? ['Tension: $T = \\tfrac{1}{2}Ma = \\tfrac{1}{2}(' + ud(Mp, 1, 'kg') + ')(' + un(a, 'm/s²') + ') = ' + un(T, 'N') + '$, less than the weight $mg = ' + un(m * g, 'N') + '$, so the ' + what + ' speeds up downward.'] : ['A light pulley would give $a = g$ (free fall); the disk\'s rotational inertia slows the fall.']),
        hint: 'Use F = ma for the hanging mass and τ = Iα for the pulley, linked by a = Rα.' }, { k: 'rt-single', m: m, M: Mp, R: Rp, ask: kind });
    }
    var m1 = R.pick([1, 1.5, 2, 2.5, 3]), m2 = m1 + R.pick([0.5, 1, 1.5, 2]), aa = (m2 - m1) * g / (m1 + m2 + Mp / 2), T1 = m1 * (g + aa), T2 = m2 * (g - aa);
    var setupA = 'An Atwood machine hangs $' + ud(m1, 1, 'kg') + '$ and $' + ud(m2, 1, 'kg') + '$ blocks from a light cord over a pulley that is a uniform solid disk ($' + ud(Mp, 1, 'kg') + '$, radius $' + ud(Rp, 2, 'm') + '$). The cord does not slip, and the axle has no friction.';
    var coreA = ['Heavier block (down positive): $m_2 g - T_2 = m_2 a$. Lighter block (up positive): $T_1 - m_1 g = m_1 a$.', 'Pulley: $(T_2 - T_1)R = I\\alpha = \\tfrac{1}{2}MR^2 \\cdot \\dfrac{a}{R}$, so $T_2 - T_1 = \\tfrac{1}{2}Ma$. The tensions must differ, or the pulley could not speed up.', 'Add all three: $(m_2 - m_1)g = \\left(m_1 + m_2 + \\tfrac{1}{2}M\\right)a$, so $a = \\dfrac{(' + F(m2) + ' - ' + F(m1) + ')(9.8)}{' + F(m1) + ' + ' + F(m2) + ' + ' + F(Mp / 2) + '}\\ \\text{m/s}^{2} = ' + un(aa, 'm/s²') + '$.'];
    if (kind === 'atwood') return out({ q: setupA + ' What is the acceleration of the blocks?', a: A(aa, 0.01), unit: 'm/s²',
      viz: { name: 'ph-dynamics', opts: { scene: 'heavy-pulley', m1: m1, m2: m2, pulleyM: Mp, pulleyR: Rp, quiet: true, interactive: false, play: false } },
      steps: coreA.concat(['With a light pulley it would be $' + un((m2 - m1) * g / (m1 + m2), 'm/s²') + '$; the heavy pulley acts like extra mass $\\tfrac{1}{2}M$ that must be sped up.']),
      hint: 'Write one equation per block and τ = Iα for the pulley; the tensions on the two sides are different.' }, { k: 'rt-atwood', m1: m1, m2: m2, M: Mp });
    if (kind === 'tensions') return out({ q: setupA + ' Find the tension in the cord on each side.', a: { t: 'multi', parts: [{ label: '$T_1$ (on the $' + ud(m1, 1, 'kg') + '$ side) $=$', a: A(T1, 0.01), unit: 'N' }, { label: '$T_2$ (on the $' + ud(m2, 1, 'kg') + '$ side) $=$', a: A(T2, 0.01), unit: 'N' }] },
      steps: coreA.concat(['$T_1 = m_1(g + a) = (' + ud(m1, 1, 'kg') + ')(9.8 + ' + F(aa) + ')\\ \\text{m/s}^{2} = ' + un(T1, 'N') + '$.', '$T_2 = m_2(g - a) = (' + ud(m2, 1, 'kg') + ')(9.8 - ' + F(aa) + ')\\ \\text{m/s}^{2} = ' + un(T2, 'N') + '$.', 'Check: $T_2 - T_1 = ' + un(T2 - T1, 'N') + ' = \\tfrac{1}{2}Ma = ' + un(Mp * aa / 2, 'N') + '$.']),
      hint: 'Find a first; then each block\'s own equation gives its tension.' }, { k: 'rt-tens', m1: m1, m2: m2, M: Mp });
    return out({ q: setupA + ' While the blocks speed up, how do the tensions compare?', a: mc('The tension on the heavier block\'s side is larger.', ['The two tensions are equal, because it is one cord.', 'The tension on the lighter block\'s side is larger.', 'Both tensions equal the heavier block\'s weight.']),
      steps: ['The pulley speeds up its turning, so it needs a net torque: $(T_2 - T_1)R = I\\alpha > 0$.', 'So $T_2 > T_1$: the cord pulls harder on the side of the heavier, falling block.', 'Only a massless pulley (or a frictionless peg that the cord slides over) has the same tension on both sides.'],
      hint: 'What would happen to a heavy pulley if the two tensions were equal?' }, { k: 'concept' });
  });


  // ============================== Unit 7: Energy and Momentum of Rotating Systems ==============================
  G('phys1.rotational-kinetic-energy', function (R, ctx) {
    var kind = pickT(R, ctx, ['K', 'K', 'shape'], ['shape', 'work', 'W', 'concept'], ['dK', 'power', 'work']);
    if (kind === 'K') {
      var I = R.pick([0.02, 0.05, 0.1, 0.2, 0.4, 0.5, 1.2]), w = R.pick([4, 5, 8, 10, 12, 15, 20]), K = 0.5 * I * w * w;
      return out({ q: 'A wheel with rotational inertia $' + ud(I, 2, 'kg·m²') + '$ spins at $' + ud(w, 0, 'rad/s') + '$ about a fixed axle. How much kinetic energy does it have?', a: A(K, 0.01), unit: 'J',
        steps: ['Every bit of the wheel moves at $v = r\\omega$, so its kinetic energy adds up to $K = \\Sigma \\tfrac{1}{2}m(r\\omega)^2 = \\tfrac{1}{2}I\\omega^2$.', '$K = \\tfrac{1}{2}(' + ud(I, 2, 'kg·m²') + ')(' + ud(w, 0, 'rad/s') + ')^2 = ' + un(K, 'J') + '$.'],
        hint: 'Use K = ½Iω², the spinning twin of ½mv².' }, { k: 'rke-K', I: I, w: w });
    }
    if (kind === 'shape') {
      var key = R.pick(['disk', 'hoop', 'sphere', 'cyl']), S = SH[key], M2 = R.pick([2, 5, 8, 10, 20, 50]), R2 = R.pick([0.1, 0.2, 0.25, 0.3, 0.5]), n = R.pick([60, 120, 300, 600, 900, 1200]), w2 = rpm2w(n), I2 = S.c * M2 * R2 * R2, K2 = 0.5 * I2 * w2 * w2;
      return out({ q: 'A ' + S.n + ' ($' + ud(M2, 0, 'kg') + '$, radius $' + ud(R2, 2, 'm') + '$) spins about its central axis at $' + D(n, 0) + '$ rpm. What is its kinetic energy?', a: A(K2, 0.02), unit: 'J',
        steps: ['Rotational inertia: $I = ' + S.f + ' = ' + un(I2, 'kg·m²') + '$.', 'Convert: $\\omega = ' + D(n, 0) + ' \\times \\dfrac{2\\pi}{60} = ' + un(w2, 'rad/s') + '$.', '$K = \\tfrac{1}{2}I\\omega^2 = \\tfrac{1}{2}(' + un(I2, 'kg·m²') + ')(' + un(w2, 'rad/s') + ')^2 = ' + un(K2, 'J') + '$.'],
        hint: 'Find I for the shape, convert rpm to rad/s, then use ½Iω².' }, { k: 'rke-shape', c: S.c, M: M2, R: R2, n: n });
    }
    if (kind === 'work' || kind === 'W') {
      var tau = R.pick([2, 3, 4, 5, 6, 8, 10]), N = R.pick([2, 3, 4, 5, 6, 10]), I3 = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8]), th = N * TWOPI, W = tau * th, w3 = M.sqrt(2 * W / I3);
      if (kind === 'W') return out({ q: 'A motor applies a steady torque of $' + ud(tau, 1, 'N·m') + '$ to a shaft while the shaft turns $' + D(N, 0) + '$ revolutions. How much work does the motor do?', a: A(W, 0.01), unit: 'J',
        steps: ['A force $F$ at radius $r$ moving along an arc $s = r\\Delta\\theta$ does work $Fs = (rF)\\Delta\\theta = \\tau\\Delta\\theta$, with $\\Delta\\theta$ in radians.', '$\\Delta\\theta = ' + D(N, 0) + ' \\times 2\\pi = ' + un(th, 'rad') + '$.', '$W = \\tau\\Delta\\theta = (' + ud(tau, 1, 'N·m') + ')(' + un(th, 'rad') + ') = ' + un(W, 'J') + '$.'],
        hint: 'Work by a torque is τΔθ, with the angle in radians.' }, { k: 'rke-W', tau: tau, N: N });
      return out({ q: 'A steady net torque of $' + ud(tau, 1, 'N·m') + '$ spins up a flywheel ($I = ' + ud(I3, 2, 'kg·m²') + '$) from rest while it turns $' + D(N, 0) + '$ revolutions. How fast is it spinning then?', a: A(w3, 0.01), unit: 'rad/s',
        steps: ['Work by the torque: $W = \\tau\\Delta\\theta = (' + ud(tau, 1, 'N·m') + ')(' + D(N, 0) + ' \\times 2\\pi\\ \\text{rad}) = ' + un(W, 'J') + '$.', 'Work-energy theorem for rotation: $W = \\tfrac{1}{2}I\\omega^2 - 0$.', '$\\omega = \\sqrt{\\dfrac{2W}{I}} = \\sqrt{\\dfrac{2(' + un(W, 'J') + ')}{' + ud(I3, 2, 'kg·m²') + '}} = ' + un(w3, 'rad/s') + '$.'],
        hint: 'The work done by the torque becomes the flywheel\'s ½Iω².' }, { k: 'rke-w', tau: tau, N: N, I: I3 });
    }
    if (kind === 'dK' || kind === 'power') {
      var Mf = R.pick([20, 40, 50, 80, 100]), Rf = R.pick([0.2, 0.25, 0.3, 0.4]), n1 = R.pick([600, 900, 1200]), n2 = n1 + R.pick([600, 900, 1200, 1800]), If = 0.5 * Mf * Rf * Rf, dK = 0.5 * If * (sq(rpm2w(n2)) - sq(rpm2w(n1))), tp = R.pick([10, 20, 30, 60]);
      return out({ q: 'A flywheel is a uniform solid disk ($' + ud(Mf, 0, 'kg') + '$, radius $' + ud(Rf, 2, 'm') + '$). It speeds up from $' + D(n1, 0) + '$ rpm to $' + D(n2, 0) + '$ rpm' + (kind === 'power' ? ' in $' + ud(tp, 0, 's') + '$. What average power does the motor deliver (ignore friction)?' : '. How much energy must be added?'), a: A(kind === 'power' ? dK / tp : dK, 0.02), unit: kind === 'power' ? 'W' : 'J',
        steps: ['$I = \\tfrac{1}{2}MR^2 = \\tfrac{1}{2}(' + ud(Mf, 0, 'kg') + ')(' + ud(Rf, 2, 'm') + ')^2 = ' + un(If, 'kg·m²') + '$.', '$\\omega_1 = ' + un(rpm2w(n1), 'rad/s') + '$ and $\\omega_2 = ' + un(rpm2w(n2), 'rad/s') + '$ (multiply rpm by $2\\pi/60$).', '$\\Delta K = \\tfrac{1}{2}I(\\omega_2^2 - \\omega_1^2) = ' + un(dK, 'J') + '$.'].concat(kind === 'power' ? ['$P = \\dfrac{\\Delta K}{\\Delta t} = \\dfrac{' + un(dK, 'J') + '}{' + ud(tp, 0, 's') + '} = ' + un(dK / tp, 'W') + '$.'] : ['Note: $\\tfrac{1}{2}I(\\omega_2 - \\omega_1)^2$ would be wrong; subtract the energies, not the speeds.']),
        hint: 'Find the kinetic energy at each speed and subtract.' }, { k: 'rke-dK', M: Mf, R: Rf, n1: n1, n2: n2, t: kind === 'power' ? tp : null });
    }
    return out({ q: 'A uniform solid disk of mass $M$ spins in place about its central axis, and a point on its rim moves at speed $v$. Which expression gives its kinetic energy?',
      a: mc('$\\tfrac{1}{4}Mv^2$', ['$\\tfrac{1}{2}Mv^2$', '$Mv^2$', '$0$, because its center does not move']),
      steps: ['Only the rim moves at $v$; mass nearer the axis moves more slowly, so $\\tfrac{1}{2}Mv^2$ overcounts.', 'Use $K = \\tfrac{1}{2}I\\omega^2$ with $I = \\tfrac{1}{2}MR^2$ and $\\omega = v/R$.', '$K = \\tfrac{1}{2}\\left(\\tfrac{1}{2}MR^2\\right)\\left(\\dfrac{v}{R}\\right)^2 = \\tfrac{1}{4}Mv^2$.'],
      hint: 'Not every part of the disk moves at the rim speed. Use ½Iω².' }, { k: 'concept' });
  });

  var ROLL = [['hoop', 'hoop', 1], ['disk', 'solid cylinder', 0.5], ['sphere', 'solid ball', 0.4], ['shell', 'hollow ball (thin shell)', 2 / 3]];
  function cfrac(c) { return c === 1 ? '1' : c === 0.5 ? '\\tfrac{1}{2}' : c === 0.4 ? '\\tfrac{2}{5}' : '\\tfrac{2}{3}'; }
  G('phys1.rolling', function (R, ctx) {
    var kind = pickT(R, ctx, ['K', 'K', 'v'], ['v', 'pct', 'race', 'K'], ['up', 'acc', 'v', 'race']);
    var o = R.pick(ROLL), c = o[2], nm = o[1];
    if (kind === 'K') {
      var m = R.int(1, 20) * 0.5, v = R.int(2, 12) * 0.5, Kt = 0.5 * m * v * v, Kr = c * Kt;
      return out({ q: 'A ' + nm + ' ($' + ud(m, 1, 'kg') + '$) rolls without slipping across the floor at $' + ud(v, 1, 'm/s') + '$. What is its total kinetic energy?', a: A(Kt + Kr, 0.01), unit: 'J',
        steps: ['Rolling is moving plus spinning: $K = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}I\\omega^2$.', 'For a ' + nm + ', $I = ' + (c === 1 ? '' : cfrac(c)) + 'mR^2$, and rolling without slipping means $\\omega = v/R$, so $\\tfrac{1}{2}I\\omega^2 = ' + (c === 1 ? '' : cfrac(c) + ' \\cdot ') + '\\tfrac{1}{2}mv^2$.', 'Moving: $\\tfrac{1}{2}(' + ud(m, 1, 'kg') + ')(' + ud(v, 1, 'm/s') + ')^2 = ' + un(Kt, 'J') + '$. Spinning: $' + un(Kr, 'J') + '$.', 'Total: $K = ' + un(Kt + Kr, 'J') + '$. The radius never mattered.'],
        hint: 'Add the kinetic energy of moving (½mv²) and of spinning (½Iω² with ω = v/R).' }, { k: 'roll-K', c: c, m: m, v: v });
    }
    if (kind === 'v' || kind === 'up') {
      var h = R.int(1, 30) / 10, vb = M.sqrt(2 * g * h / (1 + c));
      if (kind === 'up') {
        var vu = R.int(3, 14) * 0.5, hu = (1 + c) * vu * vu / (2 * g);
        return out({ q: 'A ' + nm + ' rolls without slipping at $' + ud(vu, 1, 'm/s') + '$ toward a ramp and rolls up it. Ignoring rolling friction and air drag, how high above the floor does its center rise before it stops?', a: A(hu, 0.01), unit: 'm',
          steps: ['All of its kinetic energy, moving and spinning, turns into gravitational potential energy: $\\tfrac{1}{2}mv^2(1 + ' + cfrac(c) + ') = mgh$.', '$h = \\dfrac{(1 + ' + cfrac(c) + ')v^2}{2g} = \\dfrac{(' + F(1 + c) + ')(' + ud(vu, 1, 'm/s') + ')^2}{2(9.8\\ \\text{m/s}^2)} = ' + un(hu, 'm') + '$.', 'A sliding block with the same speed would rise only $' + un(vu * vu / (2 * g), 'm') + '$: the spinning energy lifts the ' + nm + ' higher.'],
          hint: 'Count both kinds of kinetic energy at the start; at the top it is all potential energy.' }, { k: 'roll-up', c: c, v: vu });
      }
      return out({ q: 'A ' + nm + ' starts from rest and rolls without slipping down a ramp, dropping a height of $' + ud(h, 1, 'm') + '$. How fast is it moving at the bottom?', a: A(vb, 0.01), unit: 'm/s',
        steps: ['Static friction at the contact point does no work (that point is momentarily at rest), so mechanical energy is conserved: $mgh = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}I\\omega^2$.', 'With $I = ' + (c === 1 ? '' : cfrac(c)) + 'mR^2$ and $\\omega = v/R$: $mgh = \\tfrac{1}{2}mv^2(1 + ' + cfrac(c) + ')$. Mass and radius cancel.', '$v = \\sqrt{\\dfrac{2gh}{1 + ' + cfrac(c) + '}} = \\sqrt{\\dfrac{2(9.8)(' + D(h, 1) + ')}{' + F(1 + c) + '}}\\ \\text{m/s} = ' + un(vb, 'm/s') + '$.', 'A frictionless sliding block would reach $\\sqrt{2gh} = ' + un(M.sqrt(2 * g * h), 'm/s') + '$; the ' + nm + ' is slower because part of the energy goes into spinning.'],
        hint: 'Energy at the top, mgh, becomes ½mv² + ½Iω² at the bottom. Use ω = v/R.' }, { k: 'roll-v', c: c, h: h });
    }
    if (kind === 'pct') {
      var pc = 100 * c / (1 + c);
      return out({ q: 'A ' + nm + ' rolls without slipping. What percent of its total kinetic energy is rotational (spinning) energy?', a: Object.assign(A(pc, 0.01), { pct: true }),
        steps: ['Moving: $\\tfrac{1}{2}mv^2$. Spinning: $\\tfrac{1}{2}I\\omega^2 = \\tfrac{1}{2}(' + cfrac(c) + 'mR^2)(v/R)^2 = ' + cfrac(c) + ' \\cdot \\tfrac{1}{2}mv^2$.', 'Fraction spinning: $\\dfrac{' + cfrac(c) + '}{1 + ' + cfrac(c) + '} = ' + F(c / (1 + c)) + '$, which is $' + F(pc) + '\\%$.', 'It doesn\'t depend on mass, size or speed, only on the shape.'],
        hint: 'Write both energies in terms of ½mv², then find what share the spinning part is.' }, { k: 'roll-pct', c: c });
    }
    if (kind === 'acc') {
      var ang = R.int(5, 40), a = g * sind(ang) / (1 + c);
      return out({ q: 'A ' + nm + ' rolls without slipping down a ramp tilted at $' + ang + '^\\circ$. What is the acceleration of its center?', a: A(a, 0.01), unit: 'm/s²',
        steps: ['A block sliding without friction would have $a = g\\sin\\theta$. Rolling shares the energy with spinning, which divides that by $1 + ' + cfrac(c) + '$.', 'From energy: $v^2 = \\dfrac{2g\\,\\Delta h}{1 + c}$ with $\\Delta h = d\\sin\\theta$, and $v^2 = 2ad$ for constant acceleration, so $a = \\dfrac{g\\sin\\theta}{1 + c}$.', '$a = \\dfrac{(9.8\\ \\text{m/s}^2)\\sin ' + ang + '^\\circ}{' + F(1 + c) + '} = ' + un(a, 'm/s²') + '$.'],
        hint: 'Divide g sin θ by (1 + I/mR²).' }, { k: 'roll-acc', c: c, ang: ang });
    }
    var item = R.coin();
    if (item) return out({ q: 'A hoop, a solid cylinder and a solid ball are released together from rest at the top of the same ramp and roll without slipping. Which reaches the bottom first?',
      a: mc('The solid ball', ['The hoop', 'The solid cylinder', 'The heaviest one, whichever it is']),
      steps: ['At the bottom, $v = \\sqrt{\\dfrac{2gh}{1 + c}}$ with $c = I/mR^2$: hoop $1$, cylinder $\\tfrac{1}{2}$, ball $\\tfrac{2}{5}$.', 'The smallest $c$ puts the least energy into spinning and the most into moving: the solid ball.', 'Mass and radius cancel, so "heaviest" doesn\'t decide the race; shape does.'],
      hint: 'Which shape keeps the most of its mass near its center?' }, { k: 'concept' });
    return out({ q: 'Two solid steel balls roll from rest down the same ramp. One is large and heavy; the other is small and light. Both roll without slipping. Which reaches the bottom first?',
      a: mc('They tie', ['The large, heavy ball', 'The small, light ball', 'It depends on how much heavier the large one is']),
      steps: ['For any solid ball, $I = \\tfrac{2}{5}mR^2$, so $v = \\sqrt{\\dfrac{2gh}{1 + 2/5}}$ at every height.', 'Neither $m$ nor $R$ appears: both balls have the same speed at every point and arrive together.', 'Only the shape (how the mass is spread) changes a rolling race.'],
      hint: 'Write v at the bottom for a solid ball. Do m or R survive?' }, { k: 'concept' });
  });

  G('phys1.angular-momentum', function (R, ctx) {
    var kind = pickT(R, ctx, ['L', 'L', 'Lshape'], ['point', 'impulse', 'Lshape', 'concept'], ['pointAng', 'torque', 'impulse']);
    if (kind === 'L' || kind === 'Lshape') {
      var I, w = R.pick([2, 3, 4, 5, 6, 8, 10]), txt, st = [];
      if (kind === 'L') { I = R.pick([0.05, 0.1, 0.2, 0.25, 0.5, 1.5, 3]); txt = 'A wheel with rotational inertia $' + ud(I, 2, 'kg·m²') + '$'; }
      else { var key = R.pick(['disk', 'hoop', 'sphere']), S = SH[key], Ms = R.pick([1, 2, 4, 5, 8]), Rs = R.pick([0.1, 0.2, 0.25, 0.3, 0.5]); I = S.c * Ms * Rs * Rs; txt = 'A ' + S.n + ' ($' + ud(Ms, 1, 'kg') + '$, radius $' + ud(Rs, 2, 'm') + '$)'; st.push('$I = ' + S.f + ' = ' + un(I, 'kg·m²') + '$.'); }
      var Lv = I * w;
      return out({ q: txt + ' spins at $' + ud(w, 0, 'rad/s') + '$ about its central axis. What is the size of its angular momentum?', a: A(Lv, 0.01), unit: 'kg·m²/s',
        steps: st.concat(['Angular momentum is the rotational twin of $p = mv$: $L = I\\omega$.', '$L = (' + un(I, 'kg·m²') + ')(' + ud(w, 0, 'rad/s') + ') = ' + un(Lv, 'kg·m²/s') + '$.']),
        hint: 'Multiply the rotational inertia by the angular velocity.' }, { k: 'am-L', I: I, w: w });
    }
    if (kind === 'point' || kind === 'pointAng') {
      var m = R.pick([0.17, 0.5, 2, 5, 60, 70]), v = m > 10 ? R.pick([3, 4, 5, 6]) : R.pick([5, 8, 10, 12, 20]), d = R.pick([0.5, 1, 1.5, 2, 3, 4]);
      if (kind === 'pointAng') {
        var r = R.pick([2, 3, 4, 5, 6]), ang = R.pick([30, 45, 60, 120, 150]), Lp = m * v * r * sind(ang);
        return out({ q: 'An object ($' + ud(m, m < 1 ? 2 : 0, 'kg') + '$) slides in a straight line at $' + ud(v, 0, 'm/s') + '$. At one moment it is $' + ud(r, 1, 'm') + '$ from a point P, and its velocity makes an angle of $' + ang + '^\\circ$ with the line from P to the object. What is the size of its angular momentum about P?', a: A(Lp, 0.01), unit: 'kg·m²/s',
          steps: ['For a point mass, $L = mvr_\\perp$, where $r_\\perp = r\\sin\\theta$ is the perpendicular distance from P to the line of motion.', '$r_\\perp = (' + ud(r, 1, 'm') + ')\\sin ' + ang + '^\\circ = ' + un(r * sind(ang), 'm') + '$.', '$L = (' + ud(m, m < 1 ? 2 : 0, 'kg') + ')(' + ud(v, 0, 'm/s') + ')(' + un(r * sind(ang), 'm') + ') = ' + un(Lp, 'kg·m²/s') + '$.', 'As it slides on, $r$ and $\\theta$ change but $r\\sin\\theta$ does not, so $L$ stays the same.'],
          hint: 'Use L = mv r sin θ: only the perpendicular distance to the line of motion counts.' }, { k: 'am-pang', m: m, v: v, r: r, ang: ang });
      }
      var Lq = m * v * d, sk = m > 10, who = sk ? 'A skater ($' + ud(m, 0, 'kg') + '$) glides' : 'A puck ($' + ud(m, m < 1 ? 2 : 1, 'kg') + '$) slides';
      return out({ q: who + ' in a straight line at $' + ud(v, 0, 'm/s') + '$. The line passes $' + ud(d, 1, 'm') + '$ from a post P at its closest. What is the size of ' + (sk ? 'her' : 'its') + ' angular momentum about P?', a: A(Lq, 0.01), unit: 'kg·m²/s',
        steps: ['Something moving in a straight line still has angular momentum about a point off its line: $L = mvr_\\perp$, with $r_\\perp$ the perpendicular distance from the point to the line.', '$L = (' + ud(m, m < 1 ? 2 : (m > 10 ? 0 : 1), 'kg') + ')(' + ud(v, 0, 'm/s') + ')(' + ud(d, 1, 'm') + ') = ' + un(Lq, 'kg·m²/s') + '$.', 'With no torque about P, this value stays the same all along the line. If ' + (sk ? 'she' : 'it') + ' grabbed a rope tied to the post, ' + (sk ? 'she' : 'it') + ' would swing around P with this angular momentum.'],
        hint: 'Multiply m, v and the closest distance from P to the line of motion.' }, { k: 'am-pt', m: m, v: v, d: d });
    }
    if (kind === 'impulse' || kind === 'torque') {
      var tq = R.pick([0.5, 1, 1.5, 2, 3, 4]), dt = R.pick([2, 3, 4, 5, 6, 8]), Ii = R.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5]);
      if (kind === 'torque') {
        var w0 = R.pick([10, 12, 20, 25, 30, 40]), tt = R.pick([4, 5, 8, 10]), tn = Ii * w0 / tt;
        return out({ q: 'A spinning top ($I = ' + ud(Ii, 2, 'kg·m²') + '$) turning at $' + ud(w0, 0, 'rad/s') + '$ is brought to a stop by a steady frictional torque in $' + ud(tt, 0, 's') + '$. How large is that torque?', a: A(tn, 0.01), unit: 'N·m',
          steps: ['Angular impulse equals the change in angular momentum: $\\tau\\Delta t = \\Delta L$.', '$\\Delta L = 0 - I\\omega_0 = -(' + ud(Ii, 2, 'kg·m²') + ')(' + ud(w0, 0, 'rad/s') + ') = ' + un(-Ii * w0, 'kg·m²/s') + '$.', '$|\\tau| = \\dfrac{|\\Delta L|}{\\Delta t} = \\dfrac{' + un(Ii * w0, 'kg·m²/s') + '}{' + ud(tt, 0, 's') + '} = ' + un(tn, 'N·m') + '$.'],
          hint: 'The torque times the time equals the change in L = Iω.' }, { k: 'am-tq', I: Ii, w0: w0, t: tt });
      }
      var wf = tq * dt / Ii;
      return out({ q: 'A steady torque of $' + ud(tq, 1, 'N·m') + '$ acts for $' + ud(dt, 0, 's') + '$ on a wheel ($I = ' + ud(Ii, 2, 'kg·m²') + '$) that starts at rest. What is its angular velocity at the end?', a: A(wf, 0.01), unit: 'rad/s',
        steps: ['Angular impulse: $\\tau\\Delta t = (' + ud(tq, 1, 'N·m') + ')(' + ud(dt, 0, 's') + ') = ' + un(tq * dt, 'kg·m²/s') + '$ (a N·m·s is a kg·m²/s).', 'It equals the change in angular momentum, and the wheel starts with $L = 0$: $\\tau\\Delta t = I\\omega$.', '$\\omega = \\dfrac{\\tau\\Delta t}{I} = \\dfrac{' + un(tq * dt, 'kg·m²/s') + '}{' + ud(Ii, 2, 'kg·m²') + '} = ' + un(wf, 'rad/s') + '$.'],
        hint: 'Torque × time = change in angular momentum, and L = Iω.' }, { k: 'am-imp', tau: tq, t: dt, I: Ii });
    }
    return out({ q: 'A hockey puck slides in a straight line across frictionless ice, passing to one side of a post. What is true of its angular momentum about the post?',
      a: mc('It is not zero, and it stays constant.', ['It is zero, because the puck isn\'t turning.', 'It grows as the puck gets closer to the post.', 'It is largest when the puck is far away.']),
      steps: ['About a point not on its path, the puck has $L = mvr_\\perp$, where $r_\\perp$ is the perpendicular distance from the post to the puck\'s line.', 'Along a straight line, $m$, $v$ and $r_\\perp$ never change, so $L$ is constant and not zero.', 'No torque acts about the post, so a constant $L$ is just what conservation of angular momentum says.'],
      hint: 'Angular momentum about a point depends on the perpendicular distance to the line of motion, not on spinning.' }, { k: 'concept' });
  });

  G('phys1.angular-momentum-conservation', function (R, ctx) {
    var kind = pickT(R, ctx, ['skater', 'skater'], ['drop', 'K', 'skater', 'concept'], ['jump', 'walk', 'drop', 'K']);
    if (kind === 'skater' || kind === 'K') {
      var I1 = R.pick([3, 3.5, 4, 4.5, 5, 6]), I2 = R.pick([1, 1.2, 1.5, 2, 2.4]), w1 = R.pick([1, 1.5, 2, 2.5, 3]), w2 = I1 * w1 / I2;
      var setup = 'A skater spins at $' + ud(w1, 1, 'rev/s') + '$ with her arms out and a rotational inertia of $' + ud(I1, 1, 'kg·m²') + '$. She pulls her arms in, lowering her rotational inertia to $' + ud(I2, 1, 'kg·m²') + '$. Friction from the ice is negligible.';
      if (kind === 'K') {
        var wr1 = w1 * TWOPI, wr2 = w2 * TWOPI, K1 = 0.5 * I1 * wr1 * wr1, K2 = 0.5 * I2 * wr2 * wr2;
        return out({ q: setup + ' By how much does her kinetic energy increase?', a: A(K2 - K1, 0.02), unit: 'J',
          steps: ['Conservation: $I_1\\omega_1 = I_2\\omega_2$, so $\\omega_2 = \\dfrac{I_1}{I_2}\\omega_1 = ' + un(w2, 'rev/s') + '$.', 'For energy use rad/s: $\\omega_1 = ' + un(wr1, 'rad/s') + '$ and $\\omega_2 = ' + un(wr2, 'rad/s') + '$.', '$K_1 = \\tfrac{1}{2}I_1\\omega_1^2 = ' + un(K1, 'J') + '$ and $K_2 = \\tfrac{1}{2}I_2\\omega_2^2 = ' + un(K2, 'J') + '$.', 'Increase: $' + un(K2 - K1, 'J') + '$ ($K$ grew by the factor $I_1/I_2 = ' + F(I1 / I2) + '$). Her muscles did that work pulling her arms inward.'],
          hint: 'Find ω₂ from Iω = constant, then compare ½Iω² before and after (in rad/s).' }, { k: 'amc-K', I1: I1, I2: I2, w1: w1 });
      }
      return out({ q: setup + ' How fast does she spin now?', a: A(w2, 0.01), unit: 'rev/s',
        steps: ['The ice exerts (almost) no torque about her spin axis, so her angular momentum is conserved: $I_1\\omega_1 = I_2\\omega_2$.', '$\\omega_2 = \\dfrac{I_1\\omega_1}{I_2} = \\dfrac{(' + ud(I1, 1, 'kg·m²') + ')(' + ud(w1, 1, 'rev/s') + ')}{' + ud(I2, 1, 'kg·m²') + '} = ' + un(w2, 'rev/s') + '$.', 'Revolutions per second work here because the same unit is on both sides. Smaller $I$, faster spin.'],
        hint: 'With no outside torque, Iω stays the same.' }, { k: 'amc-w', I1: I1, I2: I2, w1: w1 });
    }
    if (kind === 'drop') {
      var Mt = R.pick([2, 3, 4, 5]), Md = R.pick([1, 2, 3]), Rt = R.pick([0.15, 0.2, 0.25]), w = R.pick([20, 24, 30, 33, 45, 60]), It = 0.5 * Mt * Rt * Rt, Id = 0.5 * Md * Rt * Rt, wf = It * w / (It + Id);
      return out({ q: 'A turntable (a uniform disk, $' + ud(Mt, 1, 'kg') + '$, radius $' + ud(Rt, 2, 'm') + '$) spins freely at $' + D(w, 0) + '$ rpm. A second uniform disk ($' + ud(Md, 1, 'kg') + '$, same radius), not spinning, is dropped onto it, centered, and the two soon turn together. What is their final rotation rate?', a: A(wf, 0.01), unit: 'rpm',
        steps: ['The friction between the disks is internal; no outside torque acts about the axle, so $I_1\\omega_1 = (I_1 + I_2)\\omega_f$.', '$I_1 = \\tfrac{1}{2}(' + ud(Mt, 1, 'kg') + ')(' + ud(Rt, 2, 'm') + ')^2 = ' + un(It, 'kg·m²') + '$ and $I_2 = \\tfrac{1}{2}(' + ud(Md, 1, 'kg') + ')(' + ud(Rt, 2, 'm') + ')^2 = ' + un(Id, 'kg·m²') + '$.', '$\\omega_f = \\dfrac{I_1}{I_1 + I_2}\\omega_1 = \\dfrac{' + F(It) + '}{' + F(It + Id) + '}(' + D(w, 0) + '\\ \\text{rpm}) = ' + un(wf, 'rpm') + '$.', 'This is the rotational version of a sticking collision: angular momentum is kept, kinetic energy is not.'],
        hint: 'Angular momentum before (one disk spinning) equals angular momentum after (both disks together).' }, { k: 'amc-drop', Mt: Mt, Md: Md, R: Rt, w: w });
    }
    if (kind === 'jump') {
      var Mm = R.pick([100, 120, 150, 200]), Rm = R.pick([1.5, 2, 2.5]), mc_ = R.pick([25, 30, 35, 40]), vc = R.pick([2, 2.5, 3, 4]), Im = 0.5 * Mm * Rm * Rm, wj = mc_ * vc * Rm / (Im + mc_ * Rm * Rm);
      return out({ q: 'A merry-go-round (a uniform disk, $' + ud(Mm, 0, 'kg') + '$, radius $' + ud(Rm, 1, 'm') + '$) is at rest. A child ($' + ud(mc_, 0, 'kg') + '$) runs at $' + ud(vc, 1, 'm/s') + '$ along a line tangent to its edge and jumps on at the rim. Ignoring friction at the axle, what is the angular velocity of the merry-go-round and child just afterward?', a: A(wj, 0.01), unit: 'rad/s',
        steps: ['Before: only the child has angular momentum about the axle. Her line of motion passes $R$ from the axle, so $L = mvR = (' + ud(mc_, 0, 'kg') + ')(' + ud(vc, 1, 'm/s') + ')(' + ud(Rm, 1, 'm') + ') = ' + un(mc_ * vc * Rm, 'kg·m²/s') + '$.', 'After: $I = \\tfrac{1}{2}MR^2 + mR^2 = ' + un(Im, 'kg·m²') + ' + ' + un(mc_ * Rm * Rm, 'kg·m²') + ' = ' + un(Im + mc_ * Rm * Rm, 'kg·m²') + '$.', 'No outside torque about the axle: $\\omega = \\dfrac{L}{I} = \\dfrac{' + un(mc_ * vc * Rm, 'kg·m²/s') + '}{' + un(Im + mc_ * Rm * Rm, 'kg·m²') + '} = ' + un(wj, 'rad/s') + '$.'],
        hint: 'A child running in a straight line has L = mvR about the axle. After she lands, add her mR² to the disk\'s ½MR².' }, { k: 'amc-jump', M: Mm, R: Rm, m: mc_, v: vc });
    }
    if (kind === 'walk') {
      var Mw = R.pick([120, 150, 200, 240]), Rw = R.pick([1.5, 2]), mw = R.pick([30, 40, 50]), w1w = R.pick([0.5, 0.6, 0.8, 1]), Iw = 0.5 * Mw * Rw * Rw, w2w = (Iw + mw * Rw * Rw) * w1w / Iw;
      return out({ q: 'A merry-go-round (a uniform disk, $' + ud(Mw, 0, 'kg') + '$, radius $' + ud(Rw, 1, 'm') + '$) turns freely at $' + ud(w1w, 1, 'rad/s') + '$ with a child ($' + ud(mw, 0, 'kg') + '$) standing at its rim. The child walks to the center. What is the new angular velocity?', a: A(w2w, 0.01), unit: 'rad/s',
        steps: ['No outside torque about the axle, so $I_1\\omega_1 = I_2\\omega_2$.', 'At the rim: $I_1 = \\tfrac{1}{2}MR^2 + mR^2 = ' + un(Iw, 'kg·m²') + ' + ' + un(mw * Rw * Rw, 'kg·m²') + ' = ' + un(Iw + mw * Rw * Rw, 'kg·m²') + '$. At the center the child adds about nothing: $I_2 = ' + un(Iw, 'kg·m²') + '$.', '$\\omega_2 = \\dfrac{I_1}{I_2}\\omega_1 = \\dfrac{' + F(Iw + mw * Rw * Rw) + '}{' + F(Iw) + '}(' + ud(w1w, 1, 'rad/s') + ') = ' + un(w2w, 'rad/s') + '$.'],
        hint: 'Find the total rotational inertia with the child at the rim and at the center; Iω stays the same.' }, { k: 'amc-walk', M: Mw, R: Rw, m: mw, w1: w1w });
    }
    return out({ q: 'A spinning skater on frictionless ice pulls her arms in and spins faster. What happens to her rotational kinetic energy?',
      a: mc('It increases, because she does work pulling her arms in.', ['It stays the same, because energy is conserved.', 'It decreases, because her rotational inertia decreases.', 'It stays the same, because angular momentum is conserved.']),
      steps: ['Angular momentum is conserved: $L = I\\omega$ stays the same, so $\\omega$ rises as $I$ falls.', 'Write the energy with $L$: $K = \\tfrac{1}{2}I\\omega^2 = \\dfrac{L^2}{2I}$. Same $L$, smaller $I$: bigger $K$.', 'The extra energy comes from her muscles, which pull the arms inward against their tendency to keep going straight.'],
      hint: 'Write K in terms of L and I.' }, { k: 'concept' });
  });

  // ---------- satellites ----------
  var GN = 6.67e-11, BODIES = { Earth: { M: 5.97e24, R: 6.37e6 }, Mars: { M: 6.42e23, R: 3.39e6 } };
  function givens(b) { return 'Use $G = 6.67 \\times 10^{-11}\\ ' + ut('N·m²/kg²') + '$, $M = ' + un(BODIES[b].M, 'kg') + '$ and $R = ' + un(BODIES[b].R, 'm') + '$ for ' + b + '.'; }
  G('phys1.orbiting-satellites', function (R, ctx) {
    var kind = pickT(R, ctx, ['v', 'v', 'T', 'concept'], ['T', 'g', 'v', 'concept'], ['mass', 'ellipse', 'T', 'g']);
    if (kind === 'v' || kind === 'T' || kind === 'g') {
      var b = kind === 'v' ? 'Earth' : R.pick(['Earth', 'Earth', 'Mars']), B = BODIES[b], hk = b === 'Earth' ? R.int(30, 400) * 5 : R.int(20, 200) * 5, h = hk * 1000, r = B.R + h;
      var v = M.sqrt(GN * B.M / r), T = TWOPI * r / v, gg = GN * B.M / (r * r), Tmin = T / 60;
      var core = ['Gravity is the only force, and it supplies the centripetal force: $\\dfrac{GMm}{r^2} = \\dfrac{mv^2}{r}$, so $v = \\sqrt{\\dfrac{GM}{r}}$.', 'Measure $r$ from the planet\'s center: $r = R + h = ' + un(B.R, 'm') + ' + ' + un(h, 'm') + ' = ' + un(r, 'm') + '$.', '$v = \\sqrt{\\dfrac{(6.67 \\times 10^{-11})(' + F(B.M) + ')}{' + F(r) + '}}\\ \\text{m/s} = ' + un(v, 'm/s') + '$.'];
      if (kind === 'g') return out({ q: 'A space station orbits ' + b + ' at an altitude of $' + D(hk, 0) + '\\ \\text{km}$. What is the gravitational field strength $g$ at that height? ' + givens(b), a: A(gg, 0.02), unit: 'm/s²',
        steps: ['$g = \\dfrac{GM}{r^2}$, with $r$ measured from the center: $r = R + h = ' + un(r, 'm') + '$.', '$g = \\dfrac{(6.67 \\times 10^{-11})(' + F(B.M) + ')}{(' + F(r) + ')^2}\\ \\text{m/s}^{2} = ' + un(gg, 'm/s²') + '$.', 'That is $' + F(100 * gg / (GN * B.M / (B.R * B.R)), 2) + '\\%$ of the surface value: gravity is still strong up there. The crew feel weightless because they and the station fall together.'],
        hint: 'Use g = GM/r² with r = R + altitude, in meters.' }, { k: 'sat-g', b: b, h: h });
      if (kind === 'T') return out({ q: 'A satellite is in a circular orbit $' + D(hk, 0) + '\\ \\text{km}$ above the surface of ' + b + '. How long does one orbit take, in minutes? ' + givens(b), a: A(Tmin, 0.02), unit: 'min',
        steps: core.concat(['One orbit is the circumference: $T = \\dfrac{2\\pi r}{v} = \\dfrac{2\\pi(' + F(r) + '\\ \\text{m})}{' + un(v, 'm/s') + '} = ' + un(T, 's') + '$.', 'In minutes: $' + un(T, 's') + ' \\div 60 = ' + un(Tmin, 'min') + '$.']),
        hint: 'Find the orbital speed from GM/r = v², then divide the circumference 2πr by it.' }, { k: 'sat-T', b: b, h: h });
      return out({ q: 'A satellite moves in a circular orbit $' + D(hk, 0) + '\\ \\text{km}$ above Earth\'s surface. How fast does it move? ' + givens(b), a: A(v, 0.02), unit: 'm/s',
        steps: core.concat(['A lower orbit would be faster: smaller $r$, larger $v$.']), hint: 'Set the gravitational force equal to mv²/r, and remember r = R + altitude.' }, { k: 'sat-v', b: b, h: h });
    }
    if (kind === 'mass') {
      var moon = R.pick([{ m: 'Phobos', p: 'Mars', r: 9.38e6, T: 7.65, u: 'h', s: 3600 }, { m: 'the Moon', p: 'Earth', r: 3.84e8, T: 27.3, u: 'days', s: 86400 }, { m: 'Io', p: 'Jupiter', r: 4.22e8, T: 1.77, u: 'days', s: 86400 }, { m: 'Titan', p: 'Saturn', r: 1.22e9, T: 15.9, u: 'days', s: 86400 }, { m: 'Deimos', p: 'Mars', r: 2.35e7, T: 30.3, u: 'h', s: 3600 }, { m: 'Europa', p: 'Jupiter', r: 6.71e8, T: 3.55, u: 'days', s: 86400 }, { m: 'Ganymede', p: 'Jupiter', r: 1.07e9, T: 7.15, u: 'days', s: 86400 }, { m: 'Callisto', p: 'Jupiter', r: 1.88e9, T: 16.7, u: 'days', s: 86400 }, { m: 'Triton', p: 'Neptune', r: 3.55e8, T: 5.88, u: 'days', s: 86400 }, { m: 'Rhea', p: 'Saturn', r: 5.27e8, T: 4.52, u: 'days', s: 86400 }]);
      var Ts = moon.T * moon.s, Mp = 4 * PI * PI * moon.r * moon.r * moon.r / (GN * Ts * Ts);
      return out({ q: moon.m.charAt(0).toUpperCase() + moon.m.slice(1) + ' orbits ' + moon.p + ' in a nearly circular orbit of radius $' + un(moon.r, 'm') + '$ with a period of $' + D(moon.T, moon.T < 10 ? 2 : 1) + '$ ' + moon.u + '. Use these numbers to find the mass of ' + moon.p + '. ($G = 6.67 \\times 10^{-11}\\ ' + ut('N·m²/kg²') + '$)', a: A(Mp, 0.02), unit: 'kg',
        steps: ['Gravity supplies the centripetal force: $\\dfrac{GMm}{r^2} = \\dfrac{mv^2}{r}$, and $v = \\dfrac{2\\pi r}{T}$.', 'Solve for $M$: $M = \\dfrac{4\\pi^2 r^3}{GT^2}$. The moon\'s own mass cancels.', '$T = ' + D(moon.T, moon.T < 10 ? 2 : 1) + ' \\times ' + D(moon.s, 0) + '\\ \\text{s} = ' + un(Ts, 's') + '$.', '$M = \\dfrac{4\\pi^2(' + F(moon.r) + ')^3}{(6.67 \\times 10^{-11})(' + F(Ts) + ')^2}\\ \\text{kg} = ' + un(Mp, 'kg') + '$.'],
        hint: 'Combine GMm/r² = mv²/r with v = 2πr/T, then solve for M. Put T in seconds.' }, { k: 'sat-M', r: moon.r, T: Ts });
    }
    if (kind === 'ellipse') {
      // a consistent ellipse: pick perigee and apogee, get the perigee speed from energy (vis-viva), round it, and
      // recompute the apogee for the rounded speed so the three given numbers describe one real orbit
      var GMe = GN * BODIES.Earth.M, rp = R.pick([6.6, 6.7, 6.8, 6.9, 7, 7.2, 7.5, 8]) * 1e6, raT = R.pick([1.2, 1.5, 1.8, 2, 2.5, 3, 3.5, 4.2]) * 1e7, vp = sig(M.sqrt(2 * GMe * raT / (rp * (rp + raT))), 3);
      var ra = sig(2 / (2 / rp - vp * vp / GMe) - rp, 3), va = vp * rp / ra;
      return out({ q: 'A satellite follows an elliptical orbit around Earth. At its closest point it is $' + un(rp, 'm') + '$ from Earth\'s center and moves at $' + un(vp, 'm/s') + '$. Its farthest point is $' + un(ra, 'm') + '$ from Earth\'s center. How fast does it move there?', a: A(va, 0.01), unit: 'm/s',
        steps: ['Gravity pulls toward Earth\'s center, so it exerts no torque about that point: the satellite\'s angular momentum is conserved.', 'At the closest and farthest points the velocity is at right angles to the radius, so $L = mvr$ there: $m v_p r_p = m v_a r_a$.', '$v_a = v_p \\dfrac{r_p}{r_a} = (' + un(vp, 'm/s') + ')\\dfrac{' + F(rp) + '}{' + F(ra) + '} = ' + un(va, 'm/s') + '$.', 'It moves slowest when it is farthest away, which is Kepler\'s second law.'],
        hint: 'Gravity makes no torque about Earth\'s center, so mvr is the same at the two ends of the ellipse.' }, { k: 'sat-ell', rp: rp, ra: ra, vp: vp });
    }
    var ci = R.int(0, 3);
    if (ci === 1) return out({ q: 'Two satellites circle Earth, one at an altitude of 400 km and one at 20,000 km. Which moves faster?',
      a: mc('The one at 400 km', ['The one at 20,000 km', 'They move at the same speed', 'It depends on their masses']),
      steps: ['For a circular orbit, $\\dfrac{GMm}{r^2} = \\dfrac{mv^2}{r}$, so $v = \\sqrt{\\dfrac{GM}{r}}$.', 'A smaller orbit radius $r$ gives a larger speed: gravity is stronger close in, so the satellite must move faster to keep missing Earth.', 'The satellite\'s own mass cancels, so it does not matter.'],
      hint: 'Write the orbital speed from GMm/r² = mv²/r. How does v depend on r?' }, { k: 'concept' });
    if (ci === 2) return out({ q: 'A satellite moves in a circular orbit. If it were moved to an orbit with 4 times the radius, how would its orbital speed change?',
      a: mc('It would be half as fast.', ['It would be 4 times as fast.', 'It would be a quarter as fast.', 'It would be twice as fast.']),
      steps: ['$v = \\sqrt{\\dfrac{GM}{r}}$, so $v \\propto \\dfrac{1}{\\sqrt{r}}$.', 'Multiplying $r$ by 4 divides $v$ by $\\sqrt{4} = 2$.', 'So the speed is halved. (Its period grows a lot more: the path is 4 times longer and the speed is half, so $T$ is 8 times longer.)'],
      hint: 'v depends on 1/√r.' }, { k: 'concept' });
    if (ci === 3) return out({ q: 'What force keeps the Moon moving in its nearly circular orbit around Earth?',
      a: mc('Earth\'s gravity, pulling the Moon toward Earth\'s center', ['A centrifugal force pushing the Moon outward, balanced by gravity', 'The Moon\'s momentum pushing it along its path', 'No force: in space objects move in circles on their own']),
      steps: ['Moving in a circle means accelerating toward the center, so a net force toward the center is needed.', 'The force Earth exerts on the Moon is gravity, which points toward Earth\'s center: it supplies the centripetal force.', 'There is no outward force. If Earth\'s gravity vanished, the Moon would move off along a straight line tangent to its path.'],
      hint: 'Circular motion needs a net force toward the center. What real force points that way?' }, { k: 'concept' });
    return out({ q: 'Astronauts on a space station 400 km above Earth float around the cabin. Why?',
      a: mc('They and the station are falling around Earth together.', ['There is no gravity in space.', 'At that height gravity is too weak to notice.', 'The air in the station holds them up.']),
      steps: ['At 400 km, $g$ is still about 89% of its value at the surface; gravity is far from gone.', 'That gravity is what keeps the station in orbit: it is falling toward Earth all the time while moving sideways fast enough to keep missing it.', 'The astronauts fall with exactly the same acceleration, so nothing has to hold them up: they feel weightless, like riders at the top of a drop.'],
      hint: 'What would keep the station on its curved path if there were no gravity?' }, { k: 'concept' });
  });


  // ============================== Unit 8: Oscillations ==============================
  G('phys1.shm-intro', function (R, ctx) {
    var kind = pickT(R, ctx, ['TF', 'conv'], ['acc', 'where', 'TF', 'acc'], ['amax', 'dist', 'acc', 'where']);
    if (kind === 'TF' || kind === 'conv') {
      if (kind === 'conv') {
        var toT = R.coin(), f = R.pick([0.25, 0.5, 2, 2.5, 4, 5, 8, 10, 20, 0.3, 0.4, 0.7, 0.9, 1.2, 3, 6, 9, 15]), T = 1 / f;
        return out({ q: toT ? 'A mass bouncing on a spring oscillates at a frequency of $' + F(f) + '\\ \\text{Hz}$. What is its period?' : 'A mass on a spring has a period of $' + F(T) + '\\ \\text{s}$. What is its frequency?', a: A(toT ? T : f, 0.01), unit: toT ? 's' : 'Hz',
          steps: ['Frequency counts cycles per second; the period is seconds per cycle. They are reciprocals: $f = \\dfrac{1}{T}$ and $T = \\dfrac{1}{f}$.', toT ? '$T = \\dfrac{1}{' + F(f) + '\\ \\text{Hz}} = ' + un(T, 's') + '$.' : '$f = \\dfrac{1}{' + F(T) + '\\ \\text{s}} = ' + un(f, 'Hz') + '$.', 'A hertz is one cycle per second ($\\text{s}^{-1}$).'],
          hint: 'Period and frequency are reciprocals of each other.' }, { k: 'shm-conv', f: f, ask: toT ? 'T' : 'f' });
      }
      var o = R.pick([{ n: 'A mass on a spring', N: [10, 12, 15, 20, 24], t: [6, 8, 10, 12, 15] }, { n: 'A playground swing', N: [5, 6, 8, 10], t: [15, 18, 20, 25, 30] }, { n: 'A tuning-fork prong', N: [880, 1320, 2640], t: [2, 3, 4] }, { n: 'A buoy bobbing on waves', N: [4, 5, 6], t: [20, 24, 30] }]);
      var N = R.pick(o.N), t = R.pick(o.t), askT = R.coin(), TT = t / N, ff = N / t;
      return out({ q: o.n + ' completes $' + D(N, 0) + '$ full cycles in $' + ud(t, 0, 's') + '$. What is its ' + (askT ? 'period' : 'frequency') + '?', a: A(askT ? TT : ff, 0.01), unit: askT ? 's' : 'Hz',
        steps: askT ? ['The period is the time for one full cycle: $T = \\dfrac{\\text{time}}{\\text{cycles}} = \\dfrac{' + ud(t, 0, 's') + '}{' + D(N, 0) + '} = ' + un(TT, 's') + '$.', 'One full cycle means out, back through the middle, to the other side and back to the start.'] : ['The frequency is the number of cycles each second: $f = \\dfrac{\\text{cycles}}{\\text{time}} = \\dfrac{' + D(N, 0) + '}{' + ud(t, 0, 's') + '} = ' + un(ff, 'Hz') + '$.', 'Check: $f = 1/T$, and $T = ' + un(TT, 's') + '$.'],
        hint: askT ? 'Divide the time by the number of cycles.' : 'Divide the number of cycles by the time.' }, { k: 'shm-TF', N: N, t: t, ask: askT ? 'T' : 'f' });
    }
    if (kind === 'acc' || kind === 'amax') {
      var k = R.pick([20, 40, 50, 80, 100, 120, 200, 25, 30, 35, 60, 70, 90, 150]), m = R.pick([0.2, 0.25, 0.4, 0.5, 1, 2, 0.3, 0.35, 0.7, 0.8, 1.2, 1.5]), A0 = R.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.06, 0.07, 0.09]);
      if (kind === 'amax') return out({ q: 'A $' + ud(m, 2, 'kg') + '$ block on a frictionless table is attached to a spring ($k = ' + ud(k, 0, 'N/m') + '$) and oscillates with an amplitude of $' + ud(A0, 2, 'm') + '$. What is the largest acceleration the block has?', a: A(k * A0 / m, 0.01), unit: 'm/s²',
        steps: ['The spring force is $F = -kx$, so $a = -\\dfrac{k}{m}x$: the farther from the middle, the bigger the acceleration.', 'It is greatest at the turning points, $x = \\pm A$: $a_{\\max} = \\dfrac{kA}{m} = \\dfrac{(' + ud(k, 0, 'N/m') + ')(' + ud(A0, 2, 'm') + ')}{' + ud(m, 2, 'kg') + '} = ' + un(k * A0 / m, 'm/s²') + '$.', 'There the block is momentarily at rest, yet its acceleration is largest. At the middle the speed is greatest and the acceleration is zero.'],
        hint: 'The acceleration is largest where the spring is stretched or squeezed the most.' }, { k: 'shm-amax', k2: k, m: m, A: A0 });
      var x = R.pick([0.02, 0.04, 0.05, 0.06, 0.08, 0.1, 0.025, 0.03, 0.035, 0.07, 0.09]) * (R.coin() ? 1 : -1), a = -k * x / m;
      return out({ q: 'A $' + ud(m, 2, 'kg') + '$ block on a frictionless table is attached to a spring with $k = ' + ud(k, 0, 'N/m') + '$. At one moment the block is ' + (x > 0 ? 'right' : 'left') + ' of its equilibrium position by $' + ud(M.abs(x), 2, 'm') + '$. Taking right as positive, what is its acceleration at that moment?', a: A(a, 0.01), unit: 'm/s²',
        steps: ['Displacement: $x = ' + ud(x, 2, 'm') + '$ (right is positive).', 'The spring pulls back toward equilibrium: $F = -kx$, so $a = \\dfrac{F}{m} = -\\dfrac{k}{m}x$.', '$a = -\\dfrac{' + ud(k, 0, 'N/m') + '}{' + ud(m, 2, 'kg') + '}(' + ud(x, 2, 'm') + ') = ' + un(a, 'm/s²') + '$.', 'The acceleration points ' + (a > 0 ? 'right' : 'left') + ', back toward the middle. Its size depends on where the block is, not on how fast it moves.'],
        hint: 'a = −(k/m)x: the acceleration always points back toward equilibrium.' }, { k: 'shm-acc', k2: k, m: m, x: x });
    }
    if (kind === 'dist') {
      var A1 = R.pick([0.03, 0.05, 0.08, 0.1, 0.12, 0.035, 0.04, 0.06, 0.07, 0.09]), T1 = R.pick([0.4, 0.5, 0.8, 1, 1.2, 2, 0.6, 0.7, 0.9, 1.5]), halves = R.pick([3, 4, 5, 6, 8, 10, 7, 9]), tt = halves * T1 / 2, d = halves * 2 * A1;
      return out({ q: 'A mass on a spring oscillates with an amplitude of $' + ud(A1, 2, 'm') + '$ and a period of $' + ud(T1, 1, 's') + '$, starting from one turning point. What total distance does it travel in $' + un(tt, 's') + '$?', a: A(d, 0.01), unit: 'm',
        steps: ['In one full period the mass goes from one end to the other and back: $4A$. In half a period: $2A$.', '$' + un(tt, 's') + '$ is $\\dfrac{' + F(tt) + '}{' + F(T1 / 2) + '} = ' + halves + '$ half periods.', 'Distance $= ' + halves + ' \\times 2A = ' + halves + ' \\times 2(' + ud(A1, 2, 'm') + ') = ' + un(d, 'm') + '$.', 'Its displacement is a different story: after a whole number of periods it is back where it started.'],
        hint: 'Each half period carries the mass from one turning point to the other, a distance of 2A.' }, { k: 'shm-dist', A: A1, T: T1, n: halves });
    }
    var item = R.int(0, 2), Q = [
      { q: 'A block oscillates on a spring between two turning points, passing through equilibrium in the middle. Where is the size of its acceleration greatest?', r: 'At the two turning points', w: ['At equilibrium, where it moves fastest', 'Halfway between equilibrium and a turning point', 'It is the same everywhere'],
        s: ['$a = -\\dfrac{k}{m}x$: the acceleration grows with the distance from equilibrium.', 'The spring is stretched or squeezed most at the turning points, so the force and the acceleration are largest there.', 'At equilibrium, $x = 0$, so the force and the acceleration are zero even though the speed is greatest.'] },
      { q: 'A block oscillates on a spring. At the instant it passes through equilibrium, which is true?', r: 'Its speed is greatest and its acceleration is zero.', w: ['Its speed is zero and its acceleration is greatest.', 'Its speed and its acceleration are both greatest.', 'Its speed and its acceleration are both zero.'],
        s: ['At equilibrium the spring is neither stretched nor squeezed, so $F = -kx = 0$ and $a = 0$.', 'The block has been speeding up all the way in from the turning point, so this is where it moves fastest.', 'Right after, the spring starts to slow it.'] },
      { q: 'A block on a spring is at its right-hand turning point. Which is true at that instant?', r: 'It is at rest, and its acceleration points left.', w: ['It is at rest, and its acceleration is zero.', 'It moves fastest, and its acceleration points left.', 'It is at rest, and its acceleration points right.'],
        s: ['At a turning point the block stops for an instant before coming back: $v = 0$.', 'The spring is stretched most, pulling back toward equilibrium: the acceleration is to the left and has its largest size.', 'Zero velocity does not mean zero acceleration: the velocity is about to become leftward.'] }][item];
    return out({ q: Q.q, a: mc(Q.r, Q.w), steps: Q.s, hint: 'Use a = −(k/m)x: the acceleration depends on the position, not on the speed.' }, { k: 'concept' });
  });

  G('phys1.spring-oscillator-period', function (R, ctx) {
    var kind = pickT(R, ctx, ['T', 'T', 'f'], ['k', 'm', 'scale', 'concept'], ['vert', 'scale', 'k']);
    var m = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8, 1, 2]), k = R.pick([10, 16, 20, 25, 40, 50, 80, 100, 200]), T = TWOPI * M.sqrt(m / k);
    if (kind === 'T' || kind === 'f') return out({ q: 'A $' + ud(m, 2, 'kg') + '$ mass oscillates on a spring with spring constant $' + ud(k, 0, 'N/m') + '$. What is ' + (kind === 'T' ? 'its period?' : 'its frequency?'), a: A(kind === 'T' ? T : 1 / T, 0.01), unit: kind === 'T' ? 's' : 'Hz',
      viz: lv(ctx) === 1 ? { name: 'ph-oscillator', opts: { type: 'spring', m: m, k: k, A: 0.15, traces: [], quiet: true, interactive: false, hide: ['energy'] } } : undefined,
      steps: ['For a mass on a spring, $T = 2\\pi\\sqrt{\\dfrac{m}{k}}$: more mass responds more slowly, a stiffer spring pulls back harder.', '$T = 2\\pi\\sqrt{\\dfrac{' + ud(m, 2, 'kg') + '}{' + ud(k, 0, 'N/m') + '}} = ' + un(T, 's') + '$.'].concat(kind === 'f' ? ['$f = \\dfrac{1}{T} = ' + un(1 / T, 'Hz') + '$.'] : []),
      hint: kind === 'T' ? 'Use T = 2π√(m/k).' : 'Find T = 2π√(m/k), then f = 1/T.' }, { k: 'sp-T', m: m, k2: k, ask: kind });
    if (kind === 'k' || kind === 'm') {
      var Tm = clean(sig(T, 2)), askK = kind === 'k', kk = 4 * PI * PI * m / (Tm * Tm), mm = Tm * Tm * k / (4 * PI * PI);
      return out({ q: askK ? 'A $' + ud(m, 2, 'kg') + '$ mass on a spring oscillates with a measured period of $' + D(Tm, Tm < 1 ? 2 : 1) + '\\ \\text{s}$. What is the spring constant?' : 'A spring with $k = ' + ud(k, 0, 'N/m') + '$ is to oscillate with a period of $' + D(Tm, Tm < 1 ? 2 : 1) + '\\ \\text{s}$. What mass should hang on it?', a: A(askK ? kk : mm, 0.01), unit: askK ? 'N/m' : 'kg',
        steps: ['Start from $T = 2\\pi\\sqrt{\\dfrac{m}{k}}$ and square both sides: $T^2 = 4\\pi^2\\dfrac{m}{k}$.', askK ? '$k = \\dfrac{4\\pi^2 m}{T^2} = \\dfrac{4\\pi^2(' + ud(m, 2, 'kg') + ')}{(' + D(Tm, Tm < 1 ? 2 : 1) + '\\ \\text{s})^2} = ' + un(kk, 'N/m') + '$.' : '$m = \\dfrac{kT^2}{4\\pi^2} = \\dfrac{(' + ud(k, 0, 'N/m') + ')(' + D(Tm, Tm < 1 ? 2 : 1) + '\\ \\text{s})^2}{4\\pi^2} = ' + un(mm, 'kg') + '$.'],
        hint: 'Square T = 2π√(m/k) to get rid of the root, then solve.' }, { k: 'sp-inv', m: m, k2: k, T: Tm, ask: askK ? 'k' : 'm' });
    }
    if (kind === 'scale') {
      var T0 = R.pick([0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5]), ampl = R.chance(0.35), n = R.pick([2, 3, 4, 9, 0.25]), Tn = ampl ? T0 : T0 * M.sqrt(n);
      var change = ampl ? 'Next it is pulled ' + (n < 1 ? 'only a quarter as far' : n + ' times as far') + ' from equilibrium before release (a ' + (n < 1 ? 'smaller' : 'bigger') + ' amplitude).' : 'The mass is replaced by one ' + (n < 1 ? 'a quarter as heavy' : n + ' times as heavy') + ', on the same spring.';
      return out({ q: 'A mass on a spring oscillates with a period of $' + ud(T0, 1, 's') + '$. ' + change + ' What is the new period?', a: A(Tn, 0.01), unit: 's',
        steps: ampl ? ['$T = 2\\pi\\sqrt{m/k}$ has no amplitude in it.', 'A bigger stretch means a bigger force, so the mass moves faster and covers the longer path in the same time (the reverse for a smaller stretch).', 'The period stays $' + ud(T0, 1, 's') + '$.'] : ['$T = 2\\pi\\sqrt{m/k}$, so $T$ grows as the square root of the mass.', 'Multiplying $m$ by $' + F(n) + '$ multiplies $T$ by $\\sqrt{' + F(n) + '} = ' + F(M.sqrt(n)) + '$.', '$T_{\\text{new}} = ' + F(M.sqrt(n)) + ' \\times ' + ud(T0, 1, 's') + ' = ' + un(Tn, 's') + '$.'],
        hint: ampl ? 'Look at T = 2π√(m/k). Is the amplitude in it?' : 'T depends on √m.' }, { k: 'sp-scale', T0: T0, n: n, ampl: ampl });
    }
    if (kind === 'vert') {
      var dx = R.pick([0.02, 0.025, 0.04, 0.05, 0.08, 0.1, 0.2]), mv = R.pick([0.2, 0.5, 1, 2]), Tv = TWOPI * M.sqrt(dx / g);
      return out({ q: 'When a $' + ud(mv, 1, 'kg') + '$ mass hangs at rest from a vertical spring, the spring stretches $' + un(dx * 100, 'cm') + '$. The mass is then pulled down a little and released. What is the period of its oscillation?', a: A(Tv, 0.01), unit: 's',
        steps: ['At rest the spring holds up the weight: $k\\Delta x = mg$, so $k = \\dfrac{mg}{\\Delta x} = \\dfrac{(' + ud(mv, 1, 'kg') + ')(9.8\\ \\text{m/s}^2)}{' + un(dx, 'm') + '} = ' + un(mv * g / dx, 'N/m') + '$.', 'Gravity only shifts the middle of the motion; the period is still $T = 2\\pi\\sqrt{m/k}$.', '$T = 2\\pi\\sqrt{\\dfrac{' + ud(mv, 1, 'kg') + '}{' + un(mv * g / dx, 'N/m') + '}} = 2\\pi\\sqrt{\\dfrac{\\Delta x}{g}} = ' + un(Tv, 's') + '$.'],
        hint: 'Find k from the stretch at rest (kΔx = mg), then use T = 2π√(m/k).' }, { k: 'sp-vert', dx: dx, m: mv });
    }
    return out({ q: 'A block on a spring is pulled $5\\ \\text{cm}$ from equilibrium and released. Then it is pulled $10\\ \\text{cm}$ and released. How do the periods compare?',
      a: mc('They are the same.', ['The 10 cm period is twice as long.', 'The 10 cm period is half as long.', 'The 10 cm period is $\\sqrt{2}$ times as long.']),
      steps: ['$T = 2\\pi\\sqrt{m/k}$ depends only on the mass and the spring.', 'Twice the stretch gives twice the force, so the block moves twice as fast on average over a path twice as long.', 'The two effects cancel: the period is the same. This is what makes simple harmonic motion good for keeping time.'],
      hint: 'Does the amplitude appear in T = 2π√(m/k)?' }, { k: 'concept' });
  });

  G('phys1.pendulum-period', function (R, ctx) {
    var kind = pickT(R, ctx, ['T', 'T', 'L', 'world'], ['L', 'g', 'world', 'concept', 'T'], ['scale', 'g', 'L', 'world']);
    var L = R.chance(0.1) ? R.pick([5, 8, 10, 12, 15, 20]) : R.int(20, 300) / 100, T = TWOPI * M.sqrt(L / g);
    if (kind === 'T') return out({ q: 'A simple pendulum has a length of $' + ud(L, L >= 10 ? 0 : 2, 'm') + '$. What is its period for small swings?', a: A(T, 0.01), unit: 's',
      viz: lv(ctx) === 1 ? { name: 'ph-oscillator', opts: { type: 'pendulum', L: L, theta0: 10, traces: [], quiet: true, interactive: false, hide: ['energy'] } } : undefined,
      steps: ['For small swings, $T = 2\\pi\\sqrt{\\dfrac{L}{g}}$, with $L$ measured from the pivot to the center of the bob.', '$T = 2\\pi\\sqrt{\\dfrac{' + ud(L, L >= 10 ? 0 : 2, 'm') + '}{9.8\\ \\text{m/s}^2}} = ' + un(T, 's') + '$.', 'The bob\'s mass doesn\'t appear: a heavier bob feels a bigger pull, but it also has more inertia.'],
      hint: 'Use T = 2π√(L/g).' }, { k: 'pd-T', L: L });
    if (kind === 'L') {
      var Tg = R.int(5, 50) / 10, Lg = g * Tg * Tg / (4 * PI * PI);
      return out({ q: R.pick(['A clockmaker', 'A museum designer', 'A science teacher', 'A student building a metronome', 'A sculptor making a swinging artwork']) + ' wants a pendulum with a period of $' + ud(Tg, 1, 's') + '$. How long should it be?', a: A(Lg, 0.01), unit: 'm',
        steps: ['Square $T = 2\\pi\\sqrt{L/g}$: $T^2 = 4\\pi^2\\dfrac{L}{g}$.', '$L = \\dfrac{gT^2}{4\\pi^2} = \\dfrac{(9.8\\ \\text{m/s}^2)(' + ud(Tg, 1, 's') + ')^2}{4\\pi^2} = ' + un(Lg, 'm') + '$.'],
        hint: 'Square both sides of T = 2π√(L/g) and solve for L.' }, { k: 'pd-L', T: Tg });
    }
    if (kind === 'g') {
      var Lx = R.int(25, 200) / 100, gx = R.pick([1.62, 3.7, 8.9, 24.8, 10.4, 11.2, 1.35, 1.43]), Tx = clean(sig(TWOPI * M.sqrt(Lx / gx), 3)), gm = 4 * PI * PI * Lx / (Tx * Tx);
      return out({ q: 'On another world, an astronaut times a $' + ud(Lx, 2, 'm') + '$ pendulum swinging through small angles. Its period is $' + F(Tx) + '\\ \\text{s}$. What is the gravitational field strength there?', a: A(gm, 0.01), unit: 'm/s²',
        steps: ['Square $T = 2\\pi\\sqrt{L/g}$ and solve for $g$: $g = \\dfrac{4\\pi^2 L}{T^2}$.', '$g = \\dfrac{4\\pi^2(' + ud(Lx, 2, 'm') + ')}{(' + F(Tx) + '\\ \\text{s})^2} = ' + un(gm, 'm/s²') + '$.', 'Timing a pendulum is a classic way to measure $g$.'],
        hint: 'Rearrange T = 2π√(L/g) for g.' }, { k: 'pd-g', L: Lx, T: Tx });
    }
    if (kind === 'world') {
      var W = R.pick([['the Moon', 1.62], ['Mars', 3.71], ['Jupiter (at the cloud tops)', 24.8], ['Venus', 8.87], ['Mercury', 3.7], ['Saturn (at the cloud tops)', 10.4], ['Titan, Saturn\'s largest moon', 1.35], ['Europa, a moon of Jupiter', 1.31]]), Lw = R.int(3, 30) / 10, Tw = TWOPI * M.sqrt(Lw / W[1]);
      return out({ q: 'A $' + ud(Lw, 1, 'm') + '$ pendulum is taken to ' + W[0] + ', where $g = ' + D(W[1], W[1] < 10 ? 2 : 1) + '\\ \\text{m/s}^2$. What is its period for small swings there?', a: A(Tw, 0.01), unit: 's',
        steps: ['$T = 2\\pi\\sqrt{\\dfrac{L}{g}} = 2\\pi\\sqrt{\\dfrac{' + ud(Lw, 1, 'm') + '}{' + D(W[1], W[1] < 10 ? 2 : 1) + '\\ \\text{m/s}^2}} = ' + un(Tw, 's') + '$.', W[1] < 9.8 ? 'Weaker gravity pulls the bob back more gently, so it swings more slowly than on Earth ($' + un(TWOPI * M.sqrt(Lw / g), 's') + '$).' : 'Stronger gravity pulls the bob back harder, so it swings faster than on Earth ($' + un(TWOPI * M.sqrt(Lw / g), 's') + '$).'],
        hint: 'Use T = 2π√(L/g) with the other world\'s g.' }, { k: 'pd-world', L: Lw, g: W[1] });
    }
    if (kind === 'scale') {
      var T0 = R.pick([0.6, 0.8, 1, 1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.4, 2.5, 3]), byMass = R.chance(0.3), n = byMass ? R.pick([2, 3, 4, 5, 10]) : R.pick([4, 9, 2, 0.25, 16, 3]), Tn = byMass ? T0 : T0 * M.sqrt(n);
      return out({ q: 'A pendulum has a period of $' + ud(T0, 1, 's') + '$ for small swings. ' + (byMass ? 'Its bob is replaced by one ' + n + ' times as heavy, keeping the length the same.' : 'Its string is changed to ' + (n < 1 ? 'a quarter of' : n + ' times') + ' the length.') + ' What is the new period?', a: A(Tn, 0.01), unit: 's',
        steps: byMass ? ['$T = 2\\pi\\sqrt{L/g}$ has no mass in it.', 'A heavier bob gets a bigger pull from gravity but has more inertia in the same proportion, so it swings at the same rate.', 'The period stays $' + ud(T0, 1, 's') + '$.'] : ['$T \\propto \\sqrt{L}$: multiplying $L$ by $' + F(n) + '$ multiplies $T$ by $\\sqrt{' + F(n) + '} = ' + F(M.sqrt(n)) + '$.', '$T_{\\text{new}} = ' + F(M.sqrt(n)) + ' \\times ' + ud(T0, 1, 's') + ' = ' + un(Tn, 's') + '$.'],
        hint: byMass ? 'Is the mass in T = 2π√(L/g)?' : 'T depends on √L.' }, { k: 'pd-scale', T0: T0, n: n, byMass: byMass });
    }
    return out({ q: 'Two pendulums have the same length. One has a 1 kg iron bob and the other a 0.1 kg wooden bob, and both swing through small angles (ignore air drag). How do their periods compare?',
      a: mc('They are the same.', ['The iron one swings more slowly, because it is heavier.', 'The iron one swings faster, because gravity pulls it harder.', 'The wooden one\'s period is 10 times as long.']),
      steps: ['The pull back toward the middle is a share of the weight, $mg\\sin\\theta$, so it is 10 times bigger for the iron bob.', 'But the iron bob has 10 times the mass to speed up, so its acceleration is the same: $a = -g\\sin\\theta$.', 'Same acceleration at every angle means the same motion: $T = 2\\pi\\sqrt{L/g}$ has no mass in it.'],
      hint: 'Find the acceleration of the bob. Does the mass cancel?' }, { k: 'concept' });
  });

  G('phys1.shm-energy', function (R, ctx) {
    var kind = pickT(R, ctx, ['E', 'E', 'vmax'], ['vmax', 'vx', 'concept', 'Kx'], ['xKU', 'Afrom', 'vx', 'pend']);
    var k = R.pick([20, 40, 50, 80, 100, 200]), m = R.pick([0.2, 0.25, 0.5, 0.8, 1, 2]), A0 = R.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2]), E = 0.5 * k * A0 * A0, vmax = A0 * M.sqrt(k / m);
    var setup = 'A $' + ud(m, 2, 'kg') + '$ block on a frictionless table oscillates on a spring ($k = ' + ud(k, 0, 'N/m') + '$) with an amplitude of $' + ud(A0, 2, 'm') + '$.';
    if (kind === 'E') return out({ q: setup + ' What is the total mechanical energy of the oscillator?', a: A(E, 0.01), unit: 'J',
      steps: ['At a turning point the block is momentarily at rest, so all the energy is stored in the spring.', '$E = \\tfrac{1}{2}kA^2 = \\tfrac{1}{2}(' + ud(k, 0, 'N/m') + ')(' + ud(A0, 2, 'm') + ')^2 = ' + un(E, 'J') + '$.', 'This total stays the same at every point of the motion; only the split between $K$ and $U$ changes.'],
      hint: 'At the turning points all the energy is ½kx² with x = A.' }, { k: 'se-E', k2: k, A: A0 });
    if (kind === 'vmax') return out({ q: setup + ' What is its greatest speed?', a: A(vmax, 0.01), unit: 'm/s',
      steps: ['The speed is greatest at equilibrium, where the spring stores nothing: all $\\tfrac{1}{2}kA^2$ is kinetic energy.', '$\\tfrac{1}{2}mv_{\\max}^2 = \\tfrac{1}{2}kA^2$, so $v_{\\max} = A\\sqrt{\\dfrac{k}{m}}$.', '$v_{\\max} = (' + ud(A0, 2, 'm') + ')\\sqrt{\\dfrac{' + ud(k, 0, 'N/m') + '}{' + ud(m, 2, 'kg') + '}} = ' + un(vmax, 'm/s') + '$.'],
      hint: 'At equilibrium all the energy ½kA² is kinetic.' }, { k: 'se-vmax', k2: k, m: m, A: A0 });
    if (kind === 'vx' || kind === 'Kx') {
      var x = clean(A0 * R.pick([0.25, 0.4, 0.5, 0.6, 0.75, 0.8])), vx = M.sqrt(k / m * (A0 * A0 - x * x)), Kx = 0.5 * k * (A0 * A0 - x * x);
      return out({ q: setup + ' ' + (kind === 'vx' ? 'How fast is it moving when it is $' + un(x, 'm') + '$ from equilibrium?' : 'What is its kinetic energy when it is $' + un(x, 'm') + '$ from equilibrium?'), a: A(kind === 'vx' ? vx : Kx, 0.01), unit: kind === 'vx' ? 'm/s' : 'J',
        steps: ['Total energy: $E = \\tfrac{1}{2}kA^2 = ' + un(E, 'J') + '$.', 'At $x = ' + un(x, 'm') + '$ the spring stores $U = \\tfrac{1}{2}kx^2 = ' + un(0.5 * k * x * x, 'J') + '$.', 'The rest is kinetic: $K = E - U = ' + un(Kx, 'J') + '$.'].concat(kind === 'vx' ? ['$v = \\sqrt{\\dfrac{2K}{m}} = \\sqrt{\\dfrac{2(' + un(Kx, 'J') + ')}{' + ud(m, 2, 'kg') + '}} = ' + un(vx, 'm/s') + '$.'] : []),
        hint: 'Subtract the spring energy ½kx² from the total ½kA²; what is left is kinetic.' }, { k: 'se-vx', k2: k, m: m, A: A0, x: x, ask: kind });
    }
    if (kind === 'xKU') {
      var xKU = A0 / M.SQRT2;
      return out({ q: setup + ' How far from equilibrium is the block when its kinetic energy equals the energy stored in the spring?', a: A(xKU, 0.01), unit: 'm',
        steps: ['If $K = U$, each is half of the total: $\\tfrac{1}{2}kx^2 = \\tfrac{1}{2}\\left(\\tfrac{1}{2}kA^2\\right)$.', 'So $x^2 = \\dfrac{A^2}{2}$ and $x = \\dfrac{A}{\\sqrt{2}}$.', '$x = \\dfrac{' + ud(A0, 2, 'm') + '}{\\sqrt{2}} = ' + un(xKU, 'm') + '$. Not halfway: because $U$ grows as $x^2$, the energy splits evenly at about 71% of the amplitude.'],
        hint: 'K = U means U is half the total energy.' }, { k: 'se-xKU', A: A0 });
    }
    if (kind === 'Afrom') {
      var xa = R.pick([0.03, 0.04, 0.05, 0.06]), va = R.pick([0.5, 0.8, 1, 1.2, 1.5]), Aa = M.sqrt(xa * xa + m * va * va / k);
      return out({ q: 'A $' + ud(m, 2, 'kg') + '$ block on a spring ($k = ' + ud(k, 0, 'N/m') + '$) slides on a frictionless table. At the moment it is $' + ud(xa, 2, 'm') + '$ from equilibrium it moves at $' + ud(va, 1, 'm/s') + '$. What is the amplitude of the motion?', a: A(Aa, 0.01), unit: 'm',
        steps: ['Energy now: $E = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}kx^2 = ' + un(0.5 * m * va * va, 'J') + ' + ' + un(0.5 * k * xa * xa, 'J') + ' = ' + un(0.5 * m * va * va + 0.5 * k * xa * xa, 'J') + '$.', 'At the turning point all of it is in the spring: $\\tfrac{1}{2}kA^2 = E$.', '$A = \\sqrt{\\dfrac{2E}{k}} = \\sqrt{\\dfrac{2(' + un(0.5 * m * va * va + 0.5 * k * xa * xa, 'J') + ')}{' + ud(k, 0, 'N/m') + '}} = ' + un(Aa, 'm') + '$.'],
        hint: 'Find the total energy from this moment, then set it equal to ½kA².' }, { k: 'se-A', k2: k, m: m, x: xa, v: va });
    }
    if (kind === 'pend') {
      var h = R.pick([0.05, 0.1, 0.15, 0.2, 0.3]), vp = M.sqrt(2 * g * h);
      return out({ q: 'A pendulum bob is pulled aside until it is $' + un(h * 100, 'cm') + '$ higher than its lowest point, then released. Ignoring air drag, how fast is it moving as it passes through the lowest point?', a: A(vp, 0.01), unit: 'm/s',
        steps: ['The string pulls at right angles to the bob\'s motion, so it does no work: only gravity changes the energy.', 'All the gravitational potential energy at release becomes kinetic energy at the bottom: $mgh = \\tfrac{1}{2}mv^2$.', '$v = \\sqrt{2gh} = \\sqrt{2(9.8\\ \\text{m/s}^2)(' + un(h, 'm') + ')} = ' + un(vp, 'm/s') + '$.'],
        hint: 'Height becomes speed: mgh = ½mv².' }, { k: 'se-pend', h: h });
    }
    return out({ q: 'A block on a spring oscillates on a frictionless table. Where is its speed greatest?',
      a: mc('At equilibrium', ['At the two turning points', 'Halfway between equilibrium and a turning point', 'The speed is the same everywhere']),
      steps: ['The total energy $\\tfrac{1}{2}mv^2 + \\tfrac{1}{2}kx^2$ stays constant.', 'At equilibrium $x = 0$, so the spring stores nothing and the kinetic energy (and speed) is greatest.', 'At the turning points all the energy is in the spring and the block stops for an instant. The acceleration is greatest there, not the speed.'],
      hint: 'Where is the spring\'s stored energy smallest?' }, { k: 'concept' });
  });

  G('phys1.shm-graphs', function (R, ctx) {
    var kind = pickT(R, ctx, ['readT', 'readA', 'vmax'], ['vmax', 'amax', 'phase', 'readT'], ['xt', 'vt', 'phase', 'when']);
    var A0 = R.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25]), T = R.pick([0.4, 0.5, 0.8, 1, 1.2, 1.6, 2, 2.5, 4]), w = TWOPI / T;
    var Acm = clean(A0 * 100), gviz = { name: 'ph-graph', opts: { fn: Acm + '*cos(2*pi*x/' + clean(T) + ')', domain: [0, clean(2 * T)], range: [-M.ceil(Acm * 1.25 / 5) * 5, M.ceil(Acm * 1.25 / 5) * 5], xlab: 't', xunit: 's', ylab: 'x', yunit: 'cm', tool: 'none', quiet: true, interactive: false, drag: false } }; // centimeters keep the tick labels whole numbers
    if (kind === 'readT' || kind === 'readA') {
      var askT = kind === 'readT';
      return out({ q: 'The graph shows the position of a mass on a spring against time. What is ' + (askT ? 'the period' : 'the amplitude, in centimeters,') + ' of the motion?', a: A(askT ? T : Acm, 0.03), unit: askT ? 's' : 'cm', viz: gviz,
        steps: askT ? ['The period is the time for one full cycle: from one peak to the next.', 'The first peak is at $t = 0$ and the next at $t = ' + un(T, 's') + '$, so $T = ' + un(T, 's') + '$.', 'Any repeating point works, such as one downward crossing of $x = 0$ to the next.'] : ['The amplitude is the largest distance from equilibrium ($x = 0$), read from the middle line to a peak.', 'The peaks reach $x = ' + un(Acm, 'cm') + '$, so $A = ' + un(Acm, 'cm') + '$ $(' + un(A0, 'm') + ')$.', 'Not the peak-to-trough height, which is $2A = ' + un(2 * Acm, 'cm') + '$.'],
        hint: askT ? 'Find the time from one peak to the next.' : 'Measure from the middle line (x = 0) to a peak.' }, { k: 'sg-read', A: A0, T: T, ask: askT ? 'T' : 'A' });
    }
    if (kind === 'vmax' || kind === 'amax') {
      var isV = kind === 'vmax', val = isV ? w * A0 : w * w * A0;
      return out({ q: 'A mass on a spring moves with $x(t) = (' + ud(A0, 2, 'm') + ')\\cos\\!\\left(\\dfrac{2\\pi t}{' + ud(T, 1, 's') + '}\\right)$. What is its ' + (isV ? 'greatest speed' : 'greatest acceleration (in size)') + '?', a: A(val, 0.01), unit: isV ? 'm/s' : 'm/s²',
        steps: ['Here $A = ' + ud(A0, 2, 'm') + '$ and $T = ' + ud(T, 1, 's') + '$. In one period the motion goes once around a reference circle of radius $A$, so $\\omega = \\dfrac{2\\pi}{T} = ' + un(w, 'rad/s') + '$.'].concat(isV ? ['The greatest speed is the speed around that circle: $v_{\\max} = A\\omega = \\dfrac{2\\pi A}{T} = (' + ud(A0, 2, 'm') + ')(' + un(w, 'rad/s') + ') = ' + un(val, 'm/s') + '$.', 'It happens as the mass crosses $x = 0$, where the $x$–$t$ graph is steepest.'] : ['The greatest acceleration is the centripetal acceleration of that circle: $a_{\\max} = A\\omega^2 = (' + ud(A0, 2, 'm') + ')(' + un(w, 'rad/s') + ')^2 = ' + un(val, 'm/s²') + '$.', 'It happens at the turning points, where $x = \\pm A$.']),
        hint: isV ? 'v_max = 2πA/T.' : 'a_max = A(2π/T)².' }, { k: 'sg-max', A: A0, T: T, ask: kind });
    }
    if (kind === 'xt' || kind === 'vt') {
      var t = clean(R.pick([0.1, 0.15, 0.2, 0.3, 0.35, 0.4, 0.6, 0.7]) * T), ph = TWOPI * t / T, isX = kind === 'xt', vv = isX ? A0 * M.cos(ph) : -A0 * w * M.sin(ph);
      if (M.abs(vv) < 1e-6) vv = 0;
      return out({ q: 'A mass on a spring moves with $x(t) = (' + ud(A0, 2, 'm') + ')\\cos\\!\\left(\\dfrac{2\\pi t}{' + ud(T, 1, 's') + '}\\right)$' + (isX ? '' : ', so its velocity is $v(t) = -\\dfrac{2\\pi A}{T}\\sin\\!\\left(\\dfrac{2\\pi t}{T}\\right)$') + '. What is its ' + (isX ? 'position' : 'velocity') + ' at $t = ' + un(t, 's') + '$? (Set your calculator to radians.)', a: A(vv, 0.02), unit: isX ? 'm' : 'm/s',
        steps: ['The angle inside is in radians: $\\dfrac{2\\pi t}{T} = \\dfrac{2\\pi(' + un(t, 's') + ')}{' + ud(T, 1, 's') + '} = ' + F(ph) + '\\ \\text{rad}$ (that is $' + F(t / T) + '$ of a cycle).'].concat(isX ? ['$x = (' + ud(A0, 2, 'm') + ')\\cos(' + F(ph) + ') = ' + un(vv, 'm') + '$.'] : ['$v = -\\dfrac{2\\pi(' + ud(A0, 2, 'm') + ')}{' + ud(T, 1, 's') + '}\\sin(' + F(ph) + ') = -(' + un(A0 * w, 'm/s') + ')(' + F(M.sin(ph)) + ') = ' + un(vv, 'm/s') + '$.'])
          .concat([vv < 0 ? 'Negative: ' + (isX ? 'the mass is on the negative side of equilibrium.' : 'it moves in the negative direction.') : vv > 0 ? 'Positive: ' + (isX ? 'the mass is on the positive side of equilibrium.' : 'it moves in the positive direction.') : 'Zero at this moment.']),
        hint: 'Work out 2πt/T in radians first, then take the cosine (or sine).' }, { k: 'sg-xt', A: A0, T: T, t: t, ask: kind });
    }
    if (kind === 'phase') {
      var q4 = R.pick([0, 1, 2, 3]), tq = clean(q4 * T / 4), lab = ['$t = 0$', '$t = T/4$', '$t = T/2$', '$t = 3T/4$'][q4];
      var truth = [['at $x = +A$', 'zero', 'its largest size, pointing in the negative direction'], ['at $x = 0$', 'its largest size, in the negative direction', 'zero'], ['at $x = -A$', 'zero', 'its largest size, pointing in the positive direction'], ['at $x = 0$', 'its largest size, in the positive direction', 'zero']];
      var right = 'The mass is ' + truth[q4][0] + ', its velocity is ' + truth[q4][1] + ', and its acceleration is ' + truth[q4][2] + '.';
      var desc4 = function (j) { return 'The mass is ' + truth[j][0] + ', its velocity is ' + truth[j][1] + ', and its acceleration is ' + truth[j][2] + '.'; };
      var swapped = 'The mass is ' + truth[q4][0] + ', its velocity is ' + (truth[q4][1] === 'zero' ? 'its largest size' : 'zero') + ', and its acceleration is ' + (truth[q4][2] === 'zero' ? 'its largest size' : 'zero') + '.';
      var wr = [swapped].concat(R.sample([0, 1, 2, 3].filter(function (j) { return j !== q4; }), 2).map(desc4));
      return out({ q: 'A mass on a spring moves with $x(t) = A\\cos(2\\pi t/T)$, shown in the graph (here $T = ' + ud(T, 1, 's') + '$). Which describes the motion at ' + lab + (q4 ? ' ($t = ' + un(tq, 's') + '$)' : '') + '?', a: mc(right, wr), viz: gviz,
        steps: ['Read $x$ from the graph. The velocity is the slope of the $x$–$t$ graph, and the acceleration is $a = -\\dfrac{k}{m}x$, opposite to $x$.', 'At ' + lab + ' the mass is ' + truth[q4][0] + '.', 'Slope: ' + (truth[q4][1] === 'zero' ? 'the graph is at a peak or trough, so it is flat: $v = 0$.' : 'the graph crosses the axis at its steepest, so $|v|$ is largest; it is going ' + (q4 === 1 ? 'down (negative).' : 'up (positive).')), 'Acceleration: ' + (truth[q4][2] === 'zero' ? '$x = 0$, so $a = 0$.' : '$|x|$ is largest, so $|a|$ is largest, pointing back toward equilibrium.'), 'Position and velocity peak a quarter cycle apart.'],
        hint: 'Velocity is the slope of the x–t graph; acceleration is opposite to x and largest where |x| is largest.' }, { k: 'sg-phase', q4: q4 });
    }
    return out({ q: 'A mass on a spring follows the graph of $x$ against $t$ shown, starting at its highest point at $t = 0$, with period $T = ' + ud(T, 1, 's') + '$. When, during the first cycle, does it first have its greatest speed in the negative direction?', a: A(T / 4, 0.02), unit: 's', viz: gviz,
      steps: ['The velocity is the slope of the $x$–$t$ graph.', 'The slope is steepest where the graph crosses $x = 0$. The first crossing, going downward, comes a quarter cycle after the peak.', '$t = \\dfrac{T}{4} = \\dfrac{' + ud(T, 1, 's') + '}{4} = ' + un(T / 4, 's') + '$. At the peak itself the speed is zero, not largest.'],
      hint: 'Look for where the x–t graph is steepest going down, not where x is largest.' }, { k: 'sg-when', T: T });
  });

})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen"; Physics and Earth ladders): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - check a number: the question and a classmate's numeric answer, either the generator's own answer or that answer
     off by a common slip (a factor of 2, 4 or 10), and "Is that right?" (Yes / No; not in placement);
   - two at once: two different questions of the topic, answered together (short questions only, multiple-choice or
     numeric, each keeping its own unit; at most one of them with a picture, which then comes first).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'phys1', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
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
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function numable(p) { // a single numeric answer with a plain decimal value (not a fraction or an expression)
    var a = p.a;
    return !!a && a.t === 'num' && /^-?\d+(\.\d+)?(e-?\d+)?$/.test(String(a.v)) && +a.v !== 0 && isFinite(+a.v) &&
      !(a.tol && a.tol >= Math.abs(+a.v) / 3) && !((a.rtol || 0) > 0.3); // a slip by a factor of 2 must fall outside the tolerance
  }
  function sig(v) { var m = String(v).replace(/e.*$/, '').replace(/^-?0*\.?0*/, '').replace('.', ''); return Math.min(6, Math.max(3, m.length)); }
  function show(x, n) { // a number as the classmate would write it: 3 significant figures, scientific notation when large or small
    var ax = Math.abs(x);
    if (ax >= 1e5 || ax < 1e-3) { var e = Math.floor(Math.log10(ax)), m = Number((x / Math.pow(10, e)).toPrecision(n || 3)); if (Math.abs(m) >= 10) { m = m / 10; e++; } return '$' + m + ' \\times 10^{' + e + '}$'; }
    var s = String(Number(x.toPrecision(n || 3)));
    return '$' + (ax >= 1e4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') : s) + '$';
  }
  function numCheckForm(R, p) {
    var a = p.a, v = +a.v, n = sig(a.v), right = R.coin(), f = R.pick([2, 0.5, 10, 0.1, 4, 0.25]), shown = right ? v : v * f;
    var who = 'A classmate worked it out and got', u = p.unit ? ' ' + p.unit : '';
    var q = p.q + '<p>' + who + ': <b>' + show(shown, n) + u + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right.' : 'No. The answer is ' + show(v, n) + u + '; ' + (f > 1 ? 'the classmate\'s answer is ' + f + ' times too big.' : 'the classmate\'s answer is ' + Math.round(1 / f) + ' times too small.'))].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf' && !numable(p))) return false;
    if (p.a.t !== 'num' && p.unit) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function part(l, x) { var o = { label: l, a: x.a }; if (x.unit) o.unit = x.unit; return o; }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [part('1.', p), part('2.', p2)] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
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
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (mode !== 'place' && numable(p)) forms.push('ncheck');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : f === 'ncheck' ? numCheckForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
