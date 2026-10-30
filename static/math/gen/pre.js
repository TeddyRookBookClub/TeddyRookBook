/* Math Ladder: problem generators for Precalculus and Trigonometry (course key "pre").
   One generator per topic in data/math/topics/pre.json, registered with MathLadder.gen(id, fn(R, ctx)).
   Levels: 1 gentlest (learning), 2 (reviews, checkpoints, placement), 3 (later reviews). Angles are exact
   (multiples of pi or degrees); special values come from the unit circle, and sums such as (sqrt(6)+sqrt(2))/4
   are computed exactly with a small a + b*sqrt(2) + c*sqrt(3) + d*sqrt(6) helper. Built from /tmp/work_mlp12/gen. */
(function (ML) {
  'use strict';
  // ======================= texwidth.js (long inline math becomes display math)
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
  var WLIM = 24; // inline math estimated wider than this (characters) is shown as display math
  var G = function (id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); if (p && typeof p === 'object') { p.q = widenText(p.q, ML, WLIM); if (Array.isArray(p.steps)) p.steps = p.steps.map(function (x) { return widenText(x, ML, WLIM); }); if (p.hint) p.hint = widenText(p.hint, ML, WLIM); } return p; }); };
  var T = ML.T, Q = ML.Q, U = ML.util, by = ML.byLevel;
  var PI = Math.PI;
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function mod(a, m) { return ((a % m) + m) % m; }
  function near(a, b, e) { return Math.abs(a - b) < (e || 1e-9); }
  function sgnWord(x) { return x > 0 ? 'positive' : 'negative'; }

  // ---------- angles as multiples of pi: n*pi/d ----------
  function piRed(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
  function piTex(n, d) {
    var r = piRed(n, d === undefined ? 1 : d); n = r.n; d = r.d;
    if (n === 0) return '0';
    var s = n < 0 ? '-' : '', a = Math.abs(n), top = (a === 1 ? '' : a) + '\\pi';
    return d === 1 ? s + top : s + '\\frac{' + top + '}{' + d + '}';
  }
  function piPlain(n, d) {
    var r = piRed(n, d === undefined ? 1 : d); n = r.n; d = r.d;
    if (n === 0) return '0';
    var s = n < 0 ? '-' : '', a = Math.abs(n), top = a === 1 ? 'pi' : a + '*pi';
    return d === 1 ? s + top : s + top + '/' + d;
  }
  function degPi(deg) { var r = piRed(deg, 180); return r; }           // deg -> {n, d} with angle n*pi/d
  function radTex(deg) { var r = degPi(deg); return piTex(r.n, r.d); }
  function radPlain(deg) { var r = degPi(deg); return piPlain(r.n, r.d); }
  function angTex(deg, mode) { return mode === 'deg' ? T.deg(deg) : radTex(deg); }
  function angPlain(deg, mode) { return mode === 'deg' ? String(deg) : radPlain(deg); }
  function piRatio(x, maxD) { // x ≈ n*pi/d with d <= maxD -> {n, d} or null
    maxD = maxD || 12;
    for (var d = 1; d <= maxD; d++) { var n = Math.round(x * d / PI); if (Math.abs(n * PI / d - x) < 1e-9) return piRed(n, d); }
    return null;
  }
  // a function applied to an angle, as TeX: \sin 30^\circ, \sin\frac{\pi}{6}, \sin\left(-\frac{\pi}{6}\right)
  function fnTex(fn, argTex) {
    var f = '\\' + fn;
    if (/^-/.test(argTex) || /[+ ]-|[+]/.test(argTex.replace(/^-/, ''))) return f + '\\left(' + argTex + '\\right)';
    if (/^\\frac|^\\pi/.test(argTex)) return f + argTex;
    return f + ' ' + argTex;
  }
  function fnAng(fn, deg, mode) { return fnTex(fn, angTex(deg, mode)); }

  // ---------- exact special values ----------
  var R2 = Math.SQRT2, R3 = Math.sqrt(3);
  var EXV = [[0, '0', '0'], [0.5, '1/2', '\\frac{1}{2}'], [R2 / 2, 'sqrt(2)/2', '\\frac{\\sqrt{2}}{2}'], [R3 / 2, 'sqrt(3)/2', '\\frac{\\sqrt{3}}{2}'],
    [1, '1', '1'], [R3 / 3, 'sqrt(3)/3', '\\frac{\\sqrt{3}}{3}'], [R3, 'sqrt(3)', '\\sqrt{3}'], [2 * R3 / 3, '2*sqrt(3)/3', '\\frac{2\\sqrt{3}}{3}'],
    [R2, 'sqrt(2)', '\\sqrt{2}'], [2, '2', '2']];
  function exv(x) { // number -> { p, t, v } for a special value, or null
    if (!isFinite(x) || Math.abs(x) > 1e8) return null;
    for (var i = 0; i < EXV.length; i++) if (near(Math.abs(x), EXV[i][0])) {
      if (EXV[i][0] === 0) return { p: '0', t: '0', v: 0 };
      var neg = x < 0; return { p: (neg ? '-' : '') + EXV[i][1], t: (neg ? '-' : '') + EXV[i][2], v: neg ? -EXV[i][0] : EXV[i][0] };
    }
    return null;
  }
  var UNDEF = { p: 'DNE', t: '\\text{undefined}', v: NaN, undef: true };
  function trigNum(fn, deg) { // float value, or NaN when undefined
    var a = deg * PI / 180, s = Math.sin(a), c = Math.cos(a);
    if (near(s, 0)) s = 0; if (near(c, 0)) c = 0;
    switch (fn) {
      case 'sin': return s; case 'cos': return c;
      case 'tan': return c === 0 ? NaN : s / c; case 'cot': return s === 0 ? NaN : c / s;
      case 'sec': return c === 0 ? NaN : 1 / c; case 'csc': return s === 0 ? NaN : 1 / s;
    }
    throw new Error('trigNum: ' + fn);
  }
  function trigDeg(fn, deg) { var v = trigNum(fn, deg); if (isNaN(v)) return UNDEF; var e = exv(v); if (!e) throw new Error('trigDeg: not special ' + fn + ' ' + deg); return e; }
  function quadOf(deg) { var a = mod(deg, 360); if (a % 90 === 0) return 0; return Math.floor(a / 90) + 1; }
  var QN = ['', 'I', 'II', 'III', 'IV'];
  function refDeg(deg) { var a = mod(deg, 360); if (a <= 90) return a; if (a <= 180) return 180 - a; if (a <= 270) return a - 180; return 360 - a; }
  var SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  var NONAX = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];

  // ---------- exact numbers a + b√2 + c√3 + d√6 (rational coefficients) ----------
  var RADS = [1, 2, 3, 6];
  function Sd(m) { var o = {}; RADS.forEach(function (k) { o[k] = Q.from(m && m[k] !== undefined ? m[k] : 0); }); return o; }
  function sdQ(q) { return Sd({ 1: q }); }
  function sdAdd(a, b) { var o = {}; RADS.forEach(function (k) { o[k] = a[k].add(b[k]); }); return o; }
  function sdNeg(a) { var o = {}; RADS.forEach(function (k) { o[k] = a[k].neg(); }); return o; }
  function sdSub(a, b) { return sdAdd(a, sdNeg(b)); }
  function sdScale(a, q) { var o = {}; RADS.forEach(function (k) { o[k] = a[k].mul(q); }); return o; }
  function radMul(a, b) { var r = a * b, out = 1; [2, 3].forEach(function (p) { while (r % (p * p) === 0) { r /= p * p; out *= p; } }); return [r, out]; }
  function sdMul(a, b) {
    var o = Sd();
    RADS.forEach(function (i) { RADS.forEach(function (j) { if (a[i].isZero() || b[j].isZero()) return; var rm = radMul(i, j); o[rm[0]] = o[rm[0]].add(a[i].mul(b[j]).mul(rm[1])); }); });
    return o;
  }
  function sdTerms(a) { return RADS.filter(function (k) { return !a[k].isZero(); }); }
  function sdIsZero(a) { return !sdTerms(a).length; }
  function sdDiv(a, b) {
    var ts = sdTerms(b);
    if (!ts.length) throw new Error('sdDiv by 0');
    if (ts.length === 1 && ts[0] === 1) return sdScale(a, b[1].inv());
    if (ts.length === 1) { var k = ts[0]; var conj = Sd(); conj[k] = b[k]; var den = b[k].mul(b[k]).mul(k); return sdScale(sdMul(a, conj), den.inv()); }
    if (ts.length === 2) { var cj = Sd(); cj[ts[0]] = b[ts[0]]; cj[ts[1]] = b[ts[1]].neg(); var d2 = sdMul(b, cj); if (sdTerms(d2).length === 1 && sdTerms(d2)[0] === 1) return sdScale(sdMul(a, cj), d2[1].inv()); }
    throw new Error('sdDiv: divisor too complicated');
  }
  function sdVal(a) { return a[1].toNumber() + a[2].toNumber() * R2 + a[3].toNumber() * R3 + a[6].toNumber() * Math.sqrt(6); }
  function sdOrder(a) { // display order: rational first, then radicals from largest radicand; a positive term first if possible
    var ts = sdTerms(a), out = [];
    if (ts.indexOf(1) >= 0) out.push(1);
    [6, 3, 2].forEach(function (k) { if (ts.indexOf(k) >= 0) out.push(k); });
    if (out.length > 1 && a[out[0]].sign() < 0) { for (var i = 1; i < out.length; i++) if (a[out[i]].sign() > 0) { var t = out.splice(i, 1)[0]; out.unshift(t); break; } }
    return out;
  }
  function sdFmt(a, tex) {
    var ts = sdOrder(a);
    if (!ts.length) return '0';
    var L = 1; ts.forEach(function (k) { L = U.lcm(L, a[k].den()); });
    var nums = ts.map(function (k) { return a[k].mul(L).num(); });
    var allNeg = nums.every(function (n) { return n < 0; }), lead = '';
    if (allNeg && (ts.length > 1 || L > 1)) { nums = nums.map(function (n) { return -n; }); lead = '-'; }
    function term(n, k, first) {
      var s = n < 0 ? '-' : (first ? '' : '+'), m = Math.abs(n), body;
      if (k === 1) body = String(m);
      else body = tex ? (m === 1 ? '' : m) + '\\sqrt{' + k + '}' : (m === 1 ? '' : m + '*') + 'sqrt(' + k + ')';
      return tex ? (first ? s : ' ' + s + ' ') + body : s + body;
    }
    var top = ts.map(function (k, i) { return term(nums[i], k, i === 0); }).join('');
    if (L === 1) return lead + (lead && ts.length > 1 ? (tex ? '\\left(' + top + '\\right)' : '(' + top + ')') : top);
    if (tex) {
      if (ts.length === 1 && nums[0] < 0) return '-\\frac{' + top.slice(1) + '}{' + L + '}';
      return lead + '\\frac{' + top + '}{' + L + '}';
    }
    return lead + (ts.length > 1 ? '(' + top + ')' : top) + '/' + L;
  }
  function sdPlain(a) { return sdFmt(a, false); }
  function sdTex(a) { return sdFmt(a, true); }
  // special trig values as exact numbers
  function sdOf(x) { // float special value -> Sd
    var e = exv(x); if (!e) throw new Error('sdOf: ' + x);
    var s = x < 0 ? -1 : 1, ax = Math.abs(x);
    var table = [[0, {}], [0.5, { 1: '1/2' }], [R2 / 2, { 2: '1/2' }], [R3 / 2, { 3: '1/2' }], [1, { 1: 1 }], [R3 / 3, { 3: '1/3' }], [R3, { 3: 1 }], [2 * R3 / 3, { 3: '2/3' }], [R2, { 2: 1 }], [2, { 1: 2 }]];
    for (var i = 0; i < table.length; i++) if (near(ax, table[i][0])) return sdScale(Sd(table[i][1]), s);
    throw new Error('sdOf: ' + x);
  }
  function sdTrig(fn, deg) { var v = trigNum(fn, deg); if (isNaN(v)) return null; return sdOf(v); }

  // ---------- square roots of rationals, simplified: sqrt(p/q) -> k*sqrt(m)/n ----------
  function sqrtQ(q) { // q: ML.Q >= 0 -> { p, t, v }
    q = Q.from(q); var n = q.num(), d = q.den();
    var r = U.simplifyRadical(n * d), out = Q(r[0], d); // sqrt(n/d) = sqrt(n*d)/d
    var m = r[1];
    if (m === 1) return { p: out.toPlain(), t: out.toTex(), v: out.toNumber() };
    var a = out.num(), b = out.den();
    var p = (a === 1 ? '' : a + '*') + 'sqrt(' + m + ')' + (b === 1 ? '' : '/' + b);
    var t = (b === 1 ? '' : '\\frac{') + (a === 1 ? '' : a) + '\\sqrt{' + m + '}' + (b === 1 ? '' : '}{' + b + '}');
    return { p: p, t: t, v: Math.sqrt(q.toNumber()) };
  }
  function negX(x) { // negate a {p, t, v}
    if (x.v === 0) return x;
    var p = x.p[0] === '-' ? x.p.slice(1) : (/[+\-]/.test(x.p.slice(1)) && !/^\(/.test(x.p) ? '-(' + x.p + ')' : '-' + x.p);
    var t = x.t[0] === '-' ? x.t.slice(1) : '-' + x.t;
    return { p: p, t: t, v: -x.v };
  }
  function qx(q) { q = Q.from(q); return { p: q.toPlain(), t: q.toTex(), v: q.toNumber() }; }

  // ---------- Pythagorean triples ----------
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  function triple(R, maxIdx) { var t = TRIPLES[R.int(0, Math.min(maxIdx === undefined ? 3 : maxIdx, TRIPLES.length - 1))]; return R.coin() ? [t[0], t[1], t[2]] : [t[1], t[0], t[2]]; }
  function quadSigns(q) { return [[0, 0], [1, 1], [-1, 1], [-1, -1], [1, -1]][q]; } // signs of (x, y) in quadrant q
  var QTEX = ['', '\\text{I}', '\\text{II}', '\\text{III}', '\\text{IV}'];
  function quadRangeTex(q, mode) { // "π/2 < θ < π"
    var lo = (q - 1) * 90, hi = q * 90;
    return angTex(lo, mode) + ' < \\theta < ' + angTex(hi, mode);
  }

  // ---------- formatting ----------
  function mcq(correct, wrongs, keep) { var a = U.mc(correct, wrongs, 4); if (keep) a.keep = true; return a; }
  function numA(v, form) { var a = { t: 'num', v: String(v) }; if (form) a.form = form; return a; }
  function ord(arr) { return arr.slice().sort(function (a, b) { return a - b; }); }
  function setOfDegs(degs, mode) { return ord(degs).map(function (d) { return angPlain(d, mode); }); }
  function texList(arr) { return arr.join(',\\ '); }
  function pp(x) { var s = typeof x === 'string' ? x : T.num(x); return /\\frac|\\sqrt/.test(s) ? '\\left(' + s + '\\right)' : '(' + s + ')'; }
  function linPl(v, c) { c = Q.from(c); return c.isZero() ? v : '(' + v + (c.sign() > 0 ? '-' + c.toPlain() : '+' + c.neg().toPlain()) + ')'; } // (x - c) as plain text
  function sqPl(v, c) { return linPl(v, c) + '^2'; }
  function addPl(s, c) { c = Q.from(c); return c.isZero() ? s : s + (c.sign() > 0 ? '+' : '') + c.toPlain(); }
  function fmtNum(x, dp) { return T.num(U.round(x, dp === undefined ? 4 : dp)); }

  // ======================= 01-angles.js
  // ===================================================================== Unit 1: Angles and the Unit Circle

  G('pre.standard-position', function (R, ctx) {
    var kind = R.pick(by(ctx, ['cot', 'quad', 'cot', 'turn'], ['cot2', 'quad', 'neg', 'turn', 'same'], ['cot2', 'neg', 'same', 'turn', 'quad']));
    var th, m, k, steps;
    if (kind === 'cot' || kind === 'cot2') {
      do { th = kind === 'cot' ? R.pick([R.int(370, 710), R.int(-350, -10)]) : R.pick([R.int(730, 1440), R.int(-1080, -370)]); } while (th % 90 === 0 || th % 5 !== 0);
      m = mod(th, 360); k = (m - th) / 360;
      steps = [th > 0 ? 'The angle is bigger than a full turn, so take away full turns of $360^\\circ$.' : 'The angle is negative (clockwise), so add full turns of $360^\\circ$ until it lands between $0^\\circ$ and $360^\\circ$.',
        '$' + T.deg(th) + T.signed(k * 360) + '^\\circ = ' + T.deg(m) + '$ (that is ' + U.plural(Math.abs(k), 'full turn') + ').',
        'Adding or removing whole turns ends on the same ray, so $' + T.deg(m) + '$ is coterminal with $' + T.deg(th) + '$.'];
      return { q: 'Find the angle between $0^\\circ$ and $360^\\circ$ that is coterminal with $' + T.deg(th) + '$.', a: numA(m), steps: steps, hint: 'Add or subtract $360^\\circ$ as many times as you need.' };
    }
    if (kind === 'neg') {
      do { th = R.pick([R.int(10, 350), R.int(370, 700)]); } while (th % 5 !== 0 || th % 360 === 0);
      m = mod(th, 360) - 360; k = (m - th) / 360;
      return {
        q: 'Find the <b>negative</b> angle between $-360^\\circ$ and $0^\\circ$ that is coterminal with $' + T.deg(th) + '$.',
        a: numA(m),
        steps: ['A negative angle turns clockwise. Subtract full turns of $360^\\circ$ until the angle is between $-360^\\circ$ and $0^\\circ$.',
          '$' + T.deg(th) + T.signed(k * 360) + '^\\circ = ' + T.deg(m) + '$.',
          'Check: $' + T.deg(m) + ' + 360^\\circ = ' + T.deg(m + 360) + '$, which is on the same ray as $' + T.deg(th) + '$.'],
        hint: 'Subtract $360^\\circ$ until the angle is negative but more than $-360^\\circ$.'
      };
    }
    if (kind === 'quad') {
      do { th = by(ctx, R.int(10, 350), R.pick([R.int(-350, -10), R.int(370, 710)]), R.pick([R.int(-700, -370), R.int(730, 1070)])); } while (th % 90 === 0 || th % 5 !== 0);
      m = mod(th, 360); var qd = quadOf(th);
      var st = ['Quadrant I is $0^\\circ$ to $90^\\circ$, II is $90^\\circ$ to $180^\\circ$, III is $180^\\circ$ to $270^\\circ$, and IV is $270^\\circ$ to $360^\\circ$.'];
      if (m !== th) st.unshift('First find a coterminal angle between $0^\\circ$ and $360^\\circ$: $' + T.deg(th) + T.signed(m - th) + '^\\circ = ' + T.deg(m) + '$.');
      st.push('$' + T.deg(m) + '$ is between $' + T.deg((qd - 1) * 90) + '$ and $' + T.deg(qd * 90) + '$, so the terminal side is in Quadrant ' + QN[qd] + '.');
      return { q: 'An angle of $' + T.deg(th) + '$ is drawn in standard position. In which quadrant does its terminal side lie?', a: { t: 'mc', choices: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], v: qd - 1, keep: true }, steps: st, hint: th < 0 ? 'Negative angles turn clockwise from the positive $x$-axis.' : 'Remove full turns first, then compare with $90^\\circ$, $180^\\circ$ and $270^\\circ$.' };
    }
    if (kind === 'turn') {
      var turns = R.pick([[1, 4], [1, 2], [3, 4], [1, 1], [5, 4], [3, 2], [7, 4], [2, 1], [1, 3], [2, 3], [1, 6], [5, 6], [1, 8], [3, 8]]);
      var cw = R.coin(), deg = 360 * turns[0] / turns[1] * (cw ? -1 : 1);
      var tt = turns[1] === 1 ? U.plural(turns[0], 'full turn') : T.frac(turns[0], turns[1]) + ' of a turn';
      if (turns[1] !== 1) tt = '$' + T.mixed(turns[0], turns[1]) + '$ ' + (turns[0] > turns[1] ? 'turns' : 'of a turn');
      return {
        q: 'A ray starts on the positive $x$-axis and turns ' + tt + ' <b>' + (cw ? 'clockwise' : 'counterclockwise') + '</b>. What angle in degrees describes this rotation?',
        a: numA(deg),
        steps: ['One full turn is $360^\\circ$, so the size is $' + T.mixed(turns[0], turns[1]) + ' \\times 360^\\circ = ' + T.deg(Math.abs(deg)) + '$.',
          cw ? 'Clockwise rotations are negative, so the angle is $' + T.deg(deg) + '$.' : 'Counterclockwise rotations are positive, so the angle is $' + T.deg(deg) + '$.'],
        hint: 'Counterclockwise is positive; clockwise is negative.'
      };
    }
    // same: are two angles coterminal?
    var a = R.int(1, 71) * 5, b, tf = R.coin(), why;
    if (tf) { k = R.pick([-2, -1, 1, 2]); b = a + 360 * k; why = '$' + T.deg(b) + ' - ' + T.p(T.deg(a)) + ' = ' + T.deg(b - a) + '$, which is ' + U.plural(Math.abs(k), 'full turn') + '. So they end on the same ray.'; }
    else {
      var opt = R.pick(['neg', 'half', 'quarter']);
      b = opt === 'neg' ? -a : opt === 'half' ? a + 180 : a - 270;
      if (opt === 'neg' && a === 180) b = a + 90;
      why = '$' + T.deg(b) + ' - ' + T.p(T.deg(a)) + ' = ' + T.deg(b - a) + '$, which is not a whole number of full turns ($' + (b - a) + ' \\div 360$ is not a whole number). So they end on different rays.';
    }
    return {
      q: 'True or false: $' + T.deg(a) + '$ and $' + T.deg(b) + '$ are coterminal angles.',
      a: { t: 'tf', v: tf },
      steps: ['Two angles are coterminal when they differ by a whole number of full turns ($360^\\circ$ each).', why],
      hint: 'Subtract one angle from the other. Is the difference a multiple of $360^\\circ$?'
    };
  });

  G('pre.radian-measure', function (R, ctx) {
    var kind = R.pick(by(ctx, ['sr', 'turn', 'sr', 'arc'], ['sr', 'turn', 'quad', 'arc'], ['quad', 'sr', 'turn', 'circ']));
    if (kind === 'sr') {
      var r = R.int(2, 12), th = by(ctx, Q(R.int(2, 4)), Q(R.int(3, 13), 2), Q(R.int(4, 20), R.pick([3, 4]))), s = th.mul(r);
      if (th.isInt() && ctx.level > 1) th = Q(R.int(3, 13), 2), s = th.mul(r);
      var unit = R.pick(['cm', 'in', 'm', 'ft']);
      return {
        q: 'A circle has radius $' + r + '$ ' + unit + '. A central angle cuts off an arc of length $' + s.toTex() + '$ ' + unit + '. What is the angle in radians?',
        a: numA(th.toPlain()),
        steps: ['A radian measure counts how many radii fit along the arc: $\\theta = \\dfrac{s}{r}$.', '$\\theta = \\dfrac{' + s.toTex() + '}{' + r + '} = ' + th.toTex() + '$.',
          'So the angle is $' + th.toTex() + '$ radians: the arc is ' + (th.isInt() ? th.num() : th.toTex().replace(/^/, '$').replace(/$/, '$')) + ' radii long.'],
        hint: 'How many radii long is the arc? Divide the arc length by the radius.'
      };
    }
    if (kind === 'turn') {
      var f = R.pick(by(ctx, [[1, 2], [1, 4], [3, 4], [1, 1], [2, 1], [3, 2], [1, 3], [2, 3], [3, 1], [5, 4], [1, 6]], [[1, 3], [2, 3], [1, 6], [5, 6], [1, 8], [3, 8], [3, 2], [5, 8], [7, 12], [5, 3], [9, 4], [1, 5], [2, 5]], [[5, 12], [1, 12], [7, 8], [5, 4], [7, 6], [2, 1], [11, 12], [3, 10], [7, 4], [4, 3], [5, 2], [1, 9]]));
      var ang = piRed(2 * f[0], f[1]);
      return {
        q: 'A wheel turns $' + T.mixed(f[0], f[1]) + '$ ' + (f[0] > f[1] || (f[0] === f[1]) ? 'turn' + (f[0] === f[1] ? '' : 's') : 'of a turn') + '. Through what angle, in radians, does a spoke turn? Give an exact answer.',
        a: numA(piPlain(ang.n, ang.d), 'simplest'),
        steps: ['A full turn sweeps an arc equal to the whole circumference, $2\\pi r$. That is $2\\pi r \\div r = 2\\pi$ radii, so a full turn is $2\\pi$ radians.',
          '$' + T.mixed(f[0], f[1]) + ' \\times 2\\pi = ' + piTex(ang.n, ang.d) + '$.'],
        hint: 'A full turn is $2\\pi$ radians.'
      };
    }
    if (kind === 'arc') {
      var th2 = R.pick([Q(2), Q(3), Q(5, 2), Q(3, 2), Q(1, 2), Q(4), Q(1), Q(5), Q(7, 2), Q(6)]), r2 = R.int(2, 12) * (th2.den() === 2 ? 2 : 1), s2 = th2.mul(r2);
      return {
        q: 'An angle of $' + th2.toTex() + '$ radians sits at the center of a circle of radius $' + r2 + '$ m. How long is the arc it cuts off?',
        a: numA(s2.toPlain()),
        steps: ['An angle of $\\theta$ radians cuts off an arc that is $\\theta$ radii long, so $s = r\\theta$.', '$s = ' + r2 + ' \\times ' + th2.toTex() + ' = ' + s2.toTex() + '$ m.'],
        hint: 'Each radian of angle gives one radius of arc.'
      };
    }
    if (kind === 'circ') {
      var mult = R.pick([[1, 2], [1, 4], [3, 2], [1, 3], [1, 6]]), rr = R.int(2, 9);
      var sPi = piTex(mult[0] * rr, mult[1]);
      var thp = piRed(mult[0], mult[1]);
      return {
        q: 'An arc on a circle of radius $' + rr + '$ has length $' + sPi + '$. What is its central angle in radians?',
        a: numA(piPlain(thp.n, thp.d), 'simplest'),
        steps: ['$\\theta = \\dfrac{s}{r} = \\dfrac{' + sPi + '}{' + rr + '}$.', 'Divide: $\\theta = ' + piTex(thp.n, thp.d) + '$.'],
        hint: 'Divide the arc length by the radius; keep the $\\pi$.'
      };
    }
    // quad: which quadrant is an angle of k radians in?
    var kr = R.pick([1, 2, 3, 4, 5, 6, 1.5, 2.5, 3.5, 4.5, 5.5, 0.5, 1.2, 1.8, 2.8, 3.3, 4.1, 4.9, 5.2, 5.9, 0.8, 2.2, 3.9, 6.1]), qd = kr < PI / 2 ? 1 : kr < PI ? 2 : kr < 3 * PI / 2 ? 3 : 4;
    return {
      q: 'An angle of $' + T.num(kr) + '$ radians (no $\\pi$) is drawn in standard position. In which quadrant does it end?',
      a: { t: 'mc', choices: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], v: qd - 1, keep: true },
      steps: ['A number of radians is an angle even without $\\pi$. Compare it with the quadrant boundaries.',
        '$\\frac{\\pi}{2} \\approx 1.57$, $\\pi \\approx 3.14$, $\\frac{3\\pi}{2} \\approx 4.71$ and $2\\pi \\approx 6.28$.',
        '$' + T.num(kr) + '$ is between ' + ['', '$0$ and $1.57$', '$1.57$ and $3.14$', '$3.14$ and $4.71$', '$4.71$ and $6.28$'][qd] + ', so the angle ends in Quadrant ' + QN[qd] + '.'],
      hint: 'Use $\\pi \\approx 3.14$ to find the boundaries $\\frac{\\pi}{2}$, $\\pi$, $\\frac{3\\pi}{2}$.'
    };
  });

  G('pre.degrees-radians', function (R, ctx) {
    var kind = R.pick(by(ctx, ['d2r', 'r2d'], ['d2r', 'r2d', 'd2r'], ['d2r', 'r2d', 'plain']));
    var P1 = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    var P2 = [15, 75, 105, 165, 390, 405, 450, 540, 720, -45, -60, -120, -150, -210, -270, 195, 255, 285];
    var P3 = [20, 40, 36, 72, 100, 200, 10, 18, 160, 252, 50, 80, 140, -40, -100, 25];
    var M15 = [], M5 = [], M5n = []; for (var dd = 15; dd <= 720; dd += 15) M15.push(dd); for (dd = 5; dd < 360; dd += 5) if (dd % 15) M5.push(dd); for (dd = -355; dd < 0; dd += 5) if (dd % 15) M5n.push(dd);
    var L1x = [10, 20, 40, 50, 70, 80, 100, 110, 140, 160, 200, 220, 250, 260, 280, 320, 340, 350, 18, 36, 72, 108, 144, 105, 75, 165, 195, 255, 285, 345];
    var deg = R.pick(by(ctx, P1.concat(L1x), P2.concat(P1.slice(4)).concat(M15.filter(function (x) { return x > 360; })).concat(M15.map(function (x) { return -x; }).filter(function (x) { return x > -360; })), P3.concat(P2).concat(M5).concat(M5n)));
    var r = degPi(deg);
    if (kind === 'd2r') {
      var g = gcd(deg, 180);
      return {
        q: 'Convert $' + T.deg(deg) + '$ to radians. Give an exact answer in terms of $\\pi$.',
        a: numA(piPlain(r.n, r.d), 'simplest'),
        steps: ['Half a turn is both $180^\\circ$ and $\\pi$ radians, so $1^\\circ = \\frac{\\pi}{180}$ radians.',
          'Multiply: $' + T.deg(deg) + ' \\times \\dfrac{\\pi}{180^\\circ} = \\dfrac{' + deg + '\\pi}{180}$ (the degree units cancel).',
          'Simplify by dividing top and bottom by $' + g + '$: $' + piTex(r.n, r.d) + '$.'],
        hint: 'Multiply by $\\frac{\\pi}{180^\\circ}$ so the degrees cancel.'
      };
    }
    if (kind === 'r2d') {
      return {
        q: 'Convert $' + piTex(r.n, r.d) + '$ radians to degrees.',
        a: numA(deg),
        steps: ['$\\pi$ radians is $180^\\circ$, so multiply by $\\dfrac{180^\\circ}{\\pi}$ (the $\\pi$ cancels).',
          '$' + piTex(r.n, r.d) + ' \\times \\dfrac{180^\\circ}{\\pi} = \\dfrac{' + r.n + ' \\times 180^\\circ}{' + r.d + '} = ' + T.deg(deg) + '$.'],
        hint: 'Replace $\\pi$ with $180^\\circ$, then simplify.'
      };
    }
    var k = R.pick([2, 3, 4, 5, 1, 6, 7, 8, 9, 10, 12, 1.5, 2.5, 0.5]);
    var exact = Q.from(String(180 * k));
    return {
      q: 'Convert $' + k + '$ radian' + (k === 1 ? '' : 's') + ' to degrees. Give the exact value (it will contain $\\pi$).',
      a: numA(exact.toPlain() + '/pi'),
      steps: ['There is no $\\pi$ in $' + k + '$, but it is still an angle: ' + (k === 1 ? 'one radius' : k + ' radii') + ' of arc.',
        'Multiply by $\\dfrac{180^\\circ}{\\pi}$: $' + k + ' \\times \\dfrac{180^\\circ}{\\pi} = \\dfrac{' + 180 * k + '}{\\pi}$ degrees.',
        'That is about $' + T.num(U.round(180 * k / PI, 1)) + '^\\circ$.'],
      hint: 'Use the same factor $\\frac{180^\\circ}{\\pi}$; this time the $\\pi$ stays in the denominator.'
    };
  });

  G('pre.arc-sector-radians', function (R, ctx) {
    var kind = R.pick(by(ctx, ['arc', 'sector', 'arc'], ['deg', 'sector', 'theta', 'speed'], ['speed', 'deg', 'theta', 'sector']));
    var ANG = [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [4, 3], [3, 2], [5, 4]];
    var a = R.pick(ANG), r = R.int(2, 12), th = piRed(a[0], a[1]);
    if (kind === 'arc' || kind === 'deg') {
      var s = piRed(r * th.n, th.d), deg = 180 * th.n / th.d;
      var st = ['Arc length is radius times angle, $s = r\\theta$, but only with $\\theta$ in radians.'];
      if (kind === 'deg') st.push('Convert first: $' + T.deg(deg) + ' = ' + T.deg(deg) + ' \\times \\dfrac{\\pi}{180^\\circ} = ' + piTex(th.n, th.d) + '$.');
      st.push('$s = ' + r + ' \\cdot ' + piTex(th.n, th.d) + ' = ' + piTex(s.n, s.d) + '$.');
      return {
        q: 'A circle has radius $' + r + '$ cm. Find the length of the arc cut off by a central angle of $' + (kind === 'deg' ? T.deg(deg) : piTex(th.n, th.d)) + '$. Give an exact answer.',
        a: numA(piPlain(s.n, s.d), 'simplest'), steps: st,
        hint: kind === 'deg' ? 'Change the angle to radians first.' : 'Use $s = r\\theta$.'
      };
    }
    if (kind === 'sector') {
      var A = piRed(r * r * th.n, 2 * th.d);
      return {
        q: 'Find the area of a sector with radius $' + r + '$ in and central angle $' + piTex(th.n, th.d) + '$. Give an exact answer.',
        a: numA(piPlain(A.n, A.d), 'simplest'),
        steps: ['The whole circle is an angle of $2\\pi$ with area $\\pi r^2$. A sector of angle $\\theta$ is the fraction $\\frac{\\theta}{2\\pi}$ of it: $A = \\frac{\\theta}{2\\pi} \\cdot \\pi r^2 = \\frac{1}{2} r^2 \\theta$.',
          '$A = \\frac{1}{2} \\cdot ' + r + '^{2} \\cdot ' + piTex(th.n, th.d) + ' = \\frac{' + r * r + '}{2} \\cdot ' + piTex(th.n, th.d) + ' = ' + piTex(A.n, A.d) + '$ square inches.'],
        hint: 'Use $A = \\frac{1}{2} r^2 \\theta$ with $\\theta$ in radians.'
      };
    }
    if (kind === 'theta') {
      if (R.coin()) {
        var s2 = Q(R.int(3, 30)), r2 = R.int(2, 12), t2 = s2.div(r2);
        if (t2.isInt() && t2.num() === 1) { s2 = s2.add(1); t2 = s2.div(r2); }
        return {
          q: 'An arc of length $' + s2.toTex() + '$ m lies on a circle of radius $' + r2 + '$ m. Find the central angle in radians.',
          a: numA(t2.toPlain()), steps: ['Solve $s = r\\theta$ for $\\theta$: $\\theta = \\dfrac{s}{r}$.', '$\\theta = \\dfrac{' + s2.toTex() + '}{' + r2 + '} = ' + t2.toTex() + '$ radians.'],
          hint: 'Divide the arc length by the radius.'
        };
      }
      var r3 = R.int(2, 8), t3 = Q(R.int(1, 7), R.pick([2, 3, 4])), A3 = t3.mul(r3 * r3).div(2);
      return {
        q: 'A sector of a circle with radius $' + r3 + '$ ft has area $' + A3.toTex() + '$ square feet. Find its central angle in radians.',
        a: numA(t3.toPlain()), steps: ['Solve $A = \\frac{1}{2}r^2\\theta$ for $\\theta$: $\\theta = \\dfrac{2A}{r^2}$.', '$\\theta = \\dfrac{2 \\cdot ' + T.p(A3.toTex()) + '}{' + r3 * r3 + '} = ' + t3.toTex() + '$ radians.'],
        hint: 'Rearrange $A = \\frac{1}{2}r^2\\theta$.'
      };
    }
    // speed
    var rpm = R.pick([10, 12, 15, 20, 30, 45, 60, 100, 120, 200, 300]), rad = R.int(2, 15), om = 2 * rpm, v = om * rad;
    var askLin = R.coin() || ctx.level >= 3;
    var stp = ['Each turn is $2\\pi$ radians, so the angular speed is $\\omega = ' + rpm + ' \\times 2\\pi = ' + piTex(om, 1) + '$ radians per minute.'];
    if (askLin) stp.push('A point on the rim travels $r$ units of arc for each radian: $v = r\\omega = ' + rad + ' \\cdot ' + piTex(om, 1) + ' = ' + piTex(v, 1) + '$ inches per minute.');
    return {
      q: 'A wheel of radius $' + rad + '$ inches turns at $' + rpm + '$ revolutions per minute. ' + (askLin ? 'How fast does a point on the rim move, in inches per minute? Give an exact answer.' : 'What is its angular speed in radians per minute? Give an exact answer.'),
      a: numA(piPlain(askLin ? v : om, 1), 'simplest'), steps: stp,
      hint: askLin ? 'First change revolutions to radians, then use $v = r\\omega$.' : 'One revolution is $2\\pi$ radians.'
    };
  });

  G('pre.unit-circle-sine-cosine', function (R, ctx) {
    var kind = R.pick(by(ctx, ['point', 'axis', 'point', 'scale'], ['point', 'axis', 'scale', 'find'], ['find', 'scale', 'axis', 'point']));
    if (kind === 'point' || kind === 'find') {
      var t = triple(R, by(ctx, 3, 4, 5)), qd = R.int(1, 4), sg = quadSigns(qd);
      var x = Q(sg[0] * t[0], t[2]), y = Q(sg[1] * t[1], t[2]);
      if (kind === 'point') {
        var ask = R.pick(['cos', 'sin', 'both']);
        if (ctx.level === 1 && ask === 'both') ask = 'cos';
        var stp = ['The point at angle $\\theta$ on the unit circle is $(\\cos\\theta, \\sin\\theta)$: cosine is the $x$-coordinate and sine is the $y$-coordinate.'];
        var q = 'The terminal side of angle $\\theta$ meets the unit circle at $P' + T.pt([x, y]) + '$. ';
        if (ask === 'both') {
          stp.push('So $\\cos\\theta = ' + x.toTex() + '$ and $\\sin\\theta = ' + y.toTex() + '$.');
          return { q: q + 'Find $\\cos\\theta$ and $\\sin\\theta$.', a: { t: 'multi', parts: [{ label: '$\\cos\\theta =$', a: numA(x.toPlain()) }, { label: '$\\sin\\theta =$', a: numA(y.toPlain()) }] }, steps: stp, hint: 'Which coordinate goes with cosine?' };
        }
        var val = ask === 'cos' ? x : y;
        stp.push('So $\\' + ask + '\\theta = ' + val.toTex() + '$.');
        return { q: q + 'Find $\\' + ask + '\\theta$.', a: numA(val.toPlain()), steps: stp, hint: 'Cosine goes with $x$, sine goes with $y$ (alphabetical: c before s, x before y).' };
      }
      var giveX = R.coin(), known = giveX ? x : y, unk = giveX ? y : x;
      var side = giveX ? (sg[1] > 0 ? 'above the $x$-axis' : 'below the $x$-axis') : (sg[0] > 0 ? 'to the right of the $y$-axis' : 'to the left of the $y$-axis');
      return {
        q: 'The point $P' + (giveX ? T.pt([x.toTex(), 'y']) : T.pt(['x', y.toTex()])) + '$ is on the unit circle at angle $\\theta$, ' + side + '. Find $' + (giveX ? '\\sin' : '\\cos') + '\\theta$.',
        a: numA(unk.toPlain()),
        steps: ['Every point on the unit circle satisfies $x^2 + y^2 = 1$.', '$' + (giveX ? 'y' : 'x') + '^2 = 1 - ' + T.p(known.toTex()) + '^2 = 1 - ' + known.mul(known).toTex() + ' = ' + unk.mul(unk).toTex() + '$, so the unknown coordinate is $\\pm' + unk.abs().toTex() + '$.',
          'The point is ' + side + ', so the sign is ' + (unk.sign() > 0 ? 'positive' : 'negative') + ': $' + (giveX ? '\\sin' : '\\cos') + '\\theta = ' + unk.toTex() + '$.'],
        hint: 'Use $x^2 + y^2 = 1$, then pick the sign from where the point is.'
      };
    }
    if (kind === 'scale') {
      var t2 = triple(R, by(ctx, 2, 3, 5)), k = R.int(2, 6), q2 = R.int(1, 4), s2 = quadSigns(q2), X = s2[0] * t2[0] * k, Y = s2[1] * t2[1] * k, r = t2[2] * k;
      var ask2 = R.pick(['cos', 'sin']), v2 = Q(ask2 === 'cos' ? X : Y, r);
      return {
        q: 'The point $' + T.pt([X, Y]) + '$ lies on a circle of radius $' + r + '$ centered at the origin, on the terminal side of angle $\\theta$. Find $\\' + ask2 + '\\theta$.',
        a: numA(v2.toPlain()),
        steps: ['Shrink the picture by a factor of $' + r + '$ to land on the unit circle: the point becomes $' + T.pt([Q(X, r), Q(Y, r)]) + '$.',
          'On the unit circle, $(\\cos\\theta, \\sin\\theta)$ is that point, so $\\' + ask2 + '\\theta = \\dfrac{' + (ask2 === 'cos' ? X : Y) + '}{' + r + '} = ' + v2.toTex() + '$.'],
        hint: 'Divide the coordinates by the radius to move the point onto the unit circle.'
      };
    }
    // axis: quadrantal angles
    var degs = by(ctx, [0, 90, 180, 270, 360], [90, 180, 270, -90, 360, 450, -180], [540, -270, 450, 720, -450, 630]);
    var dg = R.pick(degs), fn = R.pick(['sin', 'cos']), mode = R.pick(by(ctx, ['rad', 'deg'], ['rad'], ['rad']));
    var val2 = trigDeg(fn, dg), m = mod(dg, 360), pt = [Math.round(Math.cos(m * PI / 180)), Math.round(Math.sin(m * PI / 180))];
    var st2 = [];
    if (m !== dg) st2.push('Remove full turns: $' + angTex(dg, mode) + '$ ends at the same place as $' + angTex(m, mode) + '$.');
    st2.push('The angle $' + angTex(m, mode) + '$ points along an axis, to the point $' + T.pt(pt) + '$ on the unit circle.');
    st2.push('$\\' + fn + '$ is the ' + (fn === 'cos' ? '$x$' : '$y$') + '-coordinate, so $' + fnAng(fn, dg, mode) + ' = ' + val2.t + '$.');
    return { q: 'Use the unit circle to find $' + fnAng(fn, dg, mode) + '$.', a: numA(val2.p), steps: st2, hint: 'Which point on the unit circle does the angle point to?' };
  });

  G('pre.special-angles', function (R, ctx) {
    var kind = R.pick(by(ctx, ['val', 'pt', 'inv', 'scale', 'expr', 'scale'], ['val', 'expr', 'inv', 'scale'], ['expr', 'inv', 'val', 'scale', 'expr']));
    var mode = R.pick(by(ctx, ['deg', 'rad'], ['rad', 'deg'], ['rad', 'rad', 'deg']));
    if (kind === 'pt' || kind === 'scale') {
      var dP = R.pick([30, 45, 60]), rr = kind === 'pt' ? 1 : R.pick([2, 4, 6, 8, 10, 12, 3, 5, 7, 9, 14, 16, 20]);
      var cx = sdScale(sdTrig('cos', dP), rr), cy = sdScale(sdTrig('sin', dP), rr);
      var stP = [dP === 45 ? 'At $45^\\circ$ the triangle under the radius is a $45^\\circ$-$45^\\circ$-$90^\\circ$ triangle: its legs are equal, each $\\frac{\\sqrt{2}}{2}$ of the hypotenuse.' : 'The triangle under the radius is a $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle: the side opposite $30^\\circ$ is half the hypotenuse, and the other leg is $\\frac{\\sqrt{3}}{2}$ of it.',
        dP === 60 ? 'At $60^\\circ$ the radius is steep, so the longer leg is vertical: $x = ' + (rr === 1 ? '' : rr + ' \\cdot ') + '\\frac{1}{2}$ and $y = ' + (rr === 1 ? '' : rr + ' \\cdot ') + '\\frac{\\sqrt{3}}{2}$.' : dP === 30 ? 'At $30^\\circ$ the radius is shallow, so the longer leg is horizontal: $x = ' + (rr === 1 ? '' : rr + ' \\cdot ') + '\\frac{\\sqrt{3}}{2}$ and $y = ' + (rr === 1 ? '' : rr + ' \\cdot ') + '\\frac{1}{2}$.' : 'So $x = y = ' + (rr === 1 ? '' : rr + ' \\cdot ') + '\\frac{\\sqrt{2}}{2}$.',
        'The point is $\\left(' + sdTex(cx) + ', ' + sdTex(cy) + '\\right)$.'];
      return {
        q: kind === 'pt' ? 'Find the exact coordinates of the point on the unit circle at angle $' + angTex(dP, mode) + '$.' : 'A point is on the circle of radius $' + rr + '$ centered at the origin, at angle $' + angTex(dP, mode) + '$ from the positive $x$-axis. Find its exact coordinates.',
        a: { t: 'tuple', v: [sdPlain(cx), sdPlain(cy)], form: 'simplest' }, steps: stP,
        hint: kind === 'pt' ? 'The point is $(\\cos\\theta, \\sin\\theta)$.' : 'The point is $(r\\cos\\theta, r\\sin\\theta)$.'
      };
    }
    var TRI = { 30: '30^\\circ\\text{-}60^\\circ\\text{-}90^\\circ', 60: '30^\\circ\\text{-}60^\\circ\\text{-}90^\\circ', 45: '45^\\circ\\text{-}45^\\circ\\text{-}90^\\circ' };
    function why(fn, d) {
      if (d === 45) return 'Use the $45^\\circ$-$45^\\circ$-$90^\\circ$ triangle with hypotenuse 1: both legs are $\\frac{\\sqrt{2}}{2}$, so the point on the unit circle is $\\left(\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2}\\right)$.';
      if (d === 30) return 'Use the $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle with hypotenuse 1: the side opposite $30^\\circ$ is the short one, $\\frac{1}{2}$, and the other leg is $\\frac{\\sqrt{3}}{2}$. The point is $\\left(\\frac{\\sqrt{3}}{2}, \\frac{1}{2}\\right)$.';
      return 'Use the $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle with hypotenuse 1: at $60^\\circ$ the triangle stands tall, so the long leg $\\frac{\\sqrt{3}}{2}$ is vertical. The point is $\\left(\\frac{1}{2}, \\frac{\\sqrt{3}}{2}\\right)$.';
    }
    if (kind === 'val') {
      var d = R.pick([30, 45, 60]), fn = R.pick(by(ctx, ['sin', 'cos'], ['sin', 'cos', 'tan'], ['tan', 'sin', 'cos']));
      var v = trigDeg(fn, d), stp = [why(fn, d)];
      if (fn === 'tan') stp.push('$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$, so $' + fnAng('tan', d, mode) + ' = \\dfrac{' + trigDeg('sin', d).t + '}{' + trigDeg('cos', d).t + '} = ' + v.t + '$.');
      else stp.push('$\\' + fn + '$ is the ' + (fn === 'cos' ? '$x$' : '$y$') + '-coordinate: $' + fnAng(fn, d, mode) + ' = ' + v.t + '$.');
      return { q: 'Find the exact value of $' + fnAng(fn, d, mode) + '$.', a: numA(v.p, 'simplest'), steps: stp, hint: d === 45 ? 'Think of the $45^\\circ$-$45^\\circ$-$90^\\circ$ triangle with hypotenuse 1.' : 'In a $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle, the shortest side is opposite the smallest angle.' };
    }
    if (kind === 'inv') {
      var d2 = R.pick([30, 45, 60]), fn2 = R.pick(['sin', 'cos', 'tan']), v2 = trigDeg(fn2, d2);
      var rng = mode === 'deg' ? '0^\\circ \\le \\theta \\le 90^\\circ' : '0 \\le \\theta \\le \\frac{\\pi}{2}';
      return {
        q: 'Find the angle $\\theta$ with $' + rng + '$ and $\\' + fn2 + '\\theta = ' + v2.t + '$.' + (mode === 'deg' ? ' Answer in degrees.' : ' Answer in radians.'),
        a: numA(angPlain(d2, mode), 'simplest'),
        steps: ['List the special values in the first quadrant: $' + fnAng(fn2, 30, mode) + ' = ' + trigDeg(fn2, 30).t + '$, $' + fnAng(fn2, 45, mode) + ' = ' + trigDeg(fn2, 45).t + '$, $' + fnAng(fn2, 60, mode) + ' = ' + trigDeg(fn2, 60).t + '$.',
          'The one that matches is $\\theta = ' + angTex(d2, mode) + '$.'],
        hint: 'Picture the two special triangles. Which angle gives this ratio?'
      };
    }
    // expr: combine two special values
    var forms = [
      ['2\\sin A\\cos A', function (a) { return sdMul(sdQ(2), sdMul(sdTrig('sin', a), sdTrig('cos', a))); }, 1],
      ['\\cos^2 A - \\sin^2 A', function (a) { return sdSub(sdMul(sdTrig('cos', a), sdTrig('cos', a)), sdMul(sdTrig('sin', a), sdTrig('sin', a))); }, 1],
      ['\\sin A + \\cos B', function (a, b) { return sdAdd(sdTrig('sin', a), sdTrig('cos', b)); }, 2],
      ['\\sin A\\cos B', function (a, b) { return sdMul(sdTrig('sin', a), sdTrig('cos', b)); }, 2],
      ['\\tan A\\tan B', function (a, b) { return sdMul(sdTrig('tan', a), sdTrig('tan', b)); }, 2],
      ['\\cos A - \\sin B', function (a, b) { return sdSub(sdTrig('cos', a), sdTrig('sin', b)); }, 2],
      ['\\tan A + \\tan B', function (a, b) { return sdAdd(sdTrig('tan', a), sdTrig('tan', b)); }, 2],
      ['\\sin A\\sin B', function (a, b) { return sdMul(sdTrig('sin', a), sdTrig('sin', b)); }, 2],
      ['\\cos A\\cos B', function (a, b) { return sdMul(sdTrig('cos', a), sdTrig('cos', b)); }, 2],
      ['2\\cos^2 A - 1', function (a) { return sdSub(sdMul(sdQ(2), sdMul(sdTrig('cos', a), sdTrig('cos', a))), sdQ(1)); }, 1],
      ['\\sin A - \\sin B', function (a, b) { return sdSub(sdTrig('sin', a), sdTrig('sin', b)); }, 2]
    ];
    var F = R.pick(forms), A = R.pick([30, 45, 60]), B = F[2] === 1 ? A : R.pick([30, 45, 60]);
    var val = F[1](A, B), expr = F[0].replace(/A/g, angTex(A, mode).replace(/^/, ' ')).replace(/B/g, ' ' + angTex(B, mode));
    expr = expr.replace(/\\(sin|cos|tan)(\^2)? /g, '\\$1$2 ');
    var parts = ['sin', 'cos', 'tan'].map(function (f) { return [A, B].map(function (d) { return F[0].indexOf(f) >= 0 ? '$' + fnAng(f, d, mode) + ' = ' + trigDeg(f, d).t + '$' : null; }); });
    var used = U.uniq([].concat.apply([], parts).filter(Boolean));
    return {
      q: 'Find the exact value of $' + expr + '$.',
      a: numA(sdPlain(val), 'simplest'),
      steps: ['Use the special values: ' + U.list(used) + '.', 'Substitute and simplify: $' + expr + ' = ' + sdTex(val) + '$.'],
      hint: 'Replace each trig value with its exact value first, then do the arithmetic.'
    };
  });

  G('pre.reference-angles', function (R, ctx) {
    var kind = R.pick(by(ctx, ['ref', 'val', 'val', 'ref'], ['val', 'ref', 'sign', 'val'], ['val', 'sign', 'val', 'ref', 'ref']));
    var mode = R.pick(by(ctx, ['deg', 'deg', 'rad'], ['rad', 'deg'], ['rad']));
    if (kind === 'ref') {
      var dAny = 5 * R.int(by(ctx, 19, 19, -71), by(ctx, 71, 71, 143)); if (dAny % 90 === 0) dAny += 5;
      var d = R.coin() ? dAny : R.pick(by(ctx, [120, 135, 150, 210, 225, 240, 300, 315, 330, 100, 200, 290, 160, 250, 340, 110, 170, 190, 260, 280, 310, 350, 95, 185, 265, 275, 125, 205, 325, 145], [120, 135, 150, 210, 225, 240, 300, 315, 330, -30, -150, 390, 480], [-120, -225, 510, 600, -330, 690, -60, -210, 405, 570, 660, -390, 840, -480, 750, -150]));
      if (mode === 'deg' || d % 15) mode = R.pick(['deg', mode]);
      if (mode === 'rad' && degPi(d).d > 12) mode = 'deg';
      var m = mod(d, 360), qd = quadOf(m), rf = refDeg(m);
      var rule = ['', '', '$180^\\circ - \\theta$', '$\\theta - 180^\\circ$', '$360^\\circ - \\theta$'][qd];
      if (mode === 'rad') rule = ['', '', '$\\pi - \\theta$', '$\\theta - \\pi$', '$2\\pi - \\theta$'][qd];
      var st = [];
      if (m !== d) st.push('First find the coterminal angle between $0$ and ' + (mode === 'rad' ? '$2\\pi$' : '$360^\\circ$') + ': $' + angTex(m, mode) + '$.');
      st.push('$' + angTex(m, mode) + '$ is in Quadrant ' + QN[qd] + '. The reference angle is the acute angle to the $x$-axis: ' + rule + '.');
      st.push('Reference angle $= ' + angTex(rf, mode) + '$.');
      return { q: 'Find the reference angle for $\\theta = ' + angTex(d, mode) + '$.', a: numA(angPlain(rf, mode), 'simplest'), steps: st, hint: 'Measure the acute angle between the terminal side and the nearest part of the $x$-axis.' };
    }
    if (kind === 'val') {
      var d2 = R.pick(by(ctx, NONAX.filter(function (a) { return a > 90; }), NONAX.filter(function (a) { return a > 90; }).concat([-30, -45, -60, -120, -135, -150, 390, 420]), [-150, -135, -240, 390, 405, 480, 570, 660, -315, 495, -30, -60, -210, -300, 750, 780, 870, -405, -120, 600]));
      var fn = R.pick(by(ctx, ['sin', 'cos', 'tan'], ['sin', 'cos', 'tan'], ['sin', 'cos', 'tan']));
      var v = trigDeg(fn, d2), m2 = mod(d2, 360), q2 = quadOf(m2), rf2 = refDeg(m2), base = trigDeg(fn, rf2);
      var pos = v.v > 0;
      var st2 = [];
      if (m2 !== d2) st2.push('$' + angTex(d2, mode) + '$ is coterminal with $' + angTex(m2, mode) + '$.');
      st2.push('$' + angTex(m2, mode) + '$ is in Quadrant ' + QN[q2] + ' with reference angle $' + angTex(rf2, mode) + '$, so $|' + fnAng(fn, d2, mode) + '| = ' + fnAng(fn, rf2, mode) + ' = ' + base.t + '$.');
      st2.push('In Quadrant ' + QN[q2] + ', ' + ['', '', 'only sine is positive ($x < 0$, $y > 0$)', 'only tangent is positive ($x < 0$, $y < 0$)', 'only cosine is positive ($x > 0$, $y < 0$)'][q2] + ', so $\\' + fn + '$ is ' + (pos ? 'positive' : 'negative') + ' here.');
      st2.push('$' + fnAng(fn, d2, mode) + ' = ' + v.t + '$.');
      return { q: 'Find the exact value of $' + fnAng(fn, d2, mode) + '$.', a: numA(v.p, 'simplest'), steps: st2, hint: 'Find the reference angle for the size, then use the quadrant for the sign.' };
    }
    // sign: which quadrant?
    var qd3 = R.int(1, 4), sc = quadSigns(qd3);
    var conds = [['\\sin\\theta', sc[1]], ['\\cos\\theta', sc[0]], ['\\tan\\theta', sc[0] * sc[1]]];
    var pick = R.sample([0, 1, 2], 2).sort(), c1 = conds[pick[0]], c2 = conds[pick[1]];
    var st3 = ['In Quadrant I, $x > 0$ and $y > 0$; in II, $x < 0, y > 0$; in III, $x < 0, y < 0$; in IV, $x > 0, y < 0$.',
      'Cosine has the sign of $x$, sine the sign of $y$, and tangent $= y/x$ is positive when they match.',
      '$' + c1[0] + (c1[1] > 0 ? ' > 0' : ' < 0') + '$ and $' + c2[0] + (c2[1] > 0 ? ' > 0' : ' < 0') + '$ happen together only in Quadrant ' + QN[qd3] + '.'];
    return { q: 'If $' + c1[0] + (c1[1] > 0 ? ' > 0' : ' < 0') + '$ and $' + c2[0] + (c2[1] > 0 ? ' > 0' : ' < 0') + '$, in which quadrant does $\\theta$ lie?', a: { t: 'mc', choices: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], v: qd3 - 1, keep: true }, steps: st3, hint: 'Cosine follows the sign of $x$ and sine follows the sign of $y$.' };
  });

  G('pre.symmetry-periodicity', function (R, ctx) {
    var kind = R.pick(by(ctx, ['given', 'eval', 'given'], ['given', 'eval', 'tf'], ['given', 'eval', 'tf']));
    if (kind === 'given') {
      var t = triple(R, 2), qd = R.int(1, 4), sg = quadSigns(qd), c = Q(sg[0] * t[0], t[2]), s = Q(sg[1] * t[1], t[2]), tn = s.div(c);
      var opts = by(ctx, ['sin-neg', 'cos-neg', 'sin-2pi', 'cos-2pi'], ['sin-neg', 'cos-neg', 'sin-pi', 'cos-pi', 'sin-pimin', 'cos-pimin', 'cos-4pi'], ['tan-neg', 'tan-pi', 'sin-pi', 'cos-pimin', 'sin-neg', 'tan-2pi']);
      var o = R.pick(opts), parts = o.split('-'), fn = parts[0], how = parts[1];
      var base = fn === 'sin' ? s : fn === 'cos' ? c : tn, ans, arg, reason;
      if (how === 'neg') { arg = '-\\theta'; ans = fn === 'cos' ? base : base.neg(); reason = fn === 'cos' ? 'Reflecting over the $x$-axis turns $(x, y)$ into $(x, -y)$: the $x$-coordinate stays, so cosine is even: $\\cos(-\\theta) = \\cos\\theta$.' : fn === 'sin' ? 'Reflecting over the $x$-axis turns $(x, y)$ into $(x, -y)$: the $y$-coordinate flips, so sine is odd: $\\sin(-\\theta) = -\\sin\\theta$.' : 'Tangent is $y/x$; only $y$ flips, so $\\tan(-\\theta) = -\\tan\\theta$.'; }
      else if (how === '2pi' || how === '4pi') { arg = '\\theta ' + (how === '2pi' ? '+ 2\\pi' : '- 4\\pi'); ans = base; reason = 'Adding or subtracting full turns lands on the same point, so the value repeats.'; }
      else if (how === 'pi') { arg = '\\theta + \\pi'; ans = fn === 'tan' ? base : base.neg(); reason = fn === 'tan' ? 'A half turn sends $(x, y)$ to $(-x, -y)$. Both signs flip, so $y/x$ is unchanged: tangent repeats every $\\pi$.' : 'A half turn sends $(x, y)$ to $(-x, -y)$, the opposite point, so both sine and cosine change sign.'; }
      else { arg = '\\pi - \\theta'; ans = fn === 'sin' ? base : base.neg(); reason = 'The angle $\\pi - \\theta$ is the mirror image of $\\theta$ across the $y$-axis: $(x, y)$ becomes $(-x, y)$. So $\\sin(\\pi - \\theta) = \\sin\\theta$ and $\\cos(\\pi - \\theta) = -\\cos\\theta$.'; }
      var giv = fn === 'tan' ? '$\\tan\\theta = ' + tn.toTex() + '$' : '$\\' + fn + '\\theta = ' + base.toTex() + '$';
      return { q: 'Given ' + giv + ', find $\\' + fn + '(' + arg + ')$.', a: numA(ans.toPlain()), steps: [reason, 'So $\\' + fn + '(' + arg + ') = ' + ans.toTex() + '$.'], hint: 'Picture the point for $\\theta$ on the unit circle. Where does the point for the new angle land?' };
    }
    if (kind === 'eval') {
      var mode = 'rad', bd = R.pick(NONAX), k = R.pick(by(ctx, [1, -1], [1, 2, -1], [2, 3, -2, -3])), dd = bd + 360 * k;
      if (ctx.level >= 2 && R.chance(0.3)) { dd = -bd; k = 0; }
      var fn2 = R.pick(['sin', 'cos', 'tan']), v = trigDeg(fn2, dd), m = mod(dd, 360);
      var st = [];
      var jj = (dd - m) / 360;
      if (k !== 0) st.push('$' + radTex(dd) + ' = ' + radTex(m) + (jj > 0 ? ' + ' : ' - ') + piTex(2 * Math.abs(jj), 1) + '$, so it is ' + U.plural(Math.abs(jj), 'full turn') + ' away from $' + radTex(m) + '$.');
      else st.push('$' + radTex(dd) + '$ is coterminal with $' + radTex(m) + '$ (add $2\\pi$).');
      st.push((fn2 === 'tan' ? 'Tangent' : fn2 === 'sin' ? 'Sine' : 'Cosine') + ' repeats every ' + (fn2 === 'tan' ? '$\\pi$ (and so every $2\\pi$)' : '$2\\pi$') + ', so $' + fnAng(fn2, dd, mode) + ' = ' + fnAng(fn2, m, mode) + '$.');
      st.push('Reference angle $' + radTex(refDeg(m)) + '$ in Quadrant ' + QN[quadOf(m)] + ': $' + fnAng(fn2, m, mode) + ' = ' + v.t + '$.');
      return { q: 'Use periodicity to find the exact value of $' + fnAng(fn2, dd, mode) + '$.', a: numA(v.p, 'simplest'), steps: st, hint: 'Add or subtract $2\\pi$ until the angle is between $0$ and $2\\pi$.' };
    }
    var facts = [
      ['\\cos(-x) = \\cos x', true, 'Cosine is even: reflecting over the $x$-axis keeps the $x$-coordinate.'],
      ['\\sin(-x) = -\\sin x', true, 'Sine is odd: reflecting over the $x$-axis flips the $y$-coordinate.'],
      ['\\sin(-x) = \\sin x', false, 'Reflecting over the $x$-axis flips the $y$-coordinate, so $\\sin(-x) = -\\sin x$. Try $x = \\frac{\\pi}{2}$: $\\sin(-\\frac{\\pi}{2}) = -1$, not $1$.'],
      ['\\cos(-x) = -\\cos x', false, 'Reflecting over the $x$-axis keeps the $x$-coordinate, so $\\cos(-x) = \\cos x$. Try $x = 0$: $\\cos 0 = 1$, not $-1$.'],
      ['\\tan(x + \\pi) = \\tan x', true, 'A half turn flips both coordinates, and $\\frac{-y}{-x} = \\frac{y}{x}$. Tangent has period $\\pi$.'],
      ['\\cos(x + \\pi) = \\cos x', false, 'A half turn sends $(x, y)$ to $(-x, -y)$, so $\\cos(x + \\pi) = -\\cos x$. Try $x = 0$: $\\cos\\pi = -1$.'],
      ['\\sin(x + 2\\pi) = \\sin x', true, 'A full turn returns to the same point.'],
      ['\\sin(x + \\pi) = \\sin x', false, 'A half turn flips the sign: $\\sin(x + \\pi) = -\\sin x$. Try $x = \\frac{\\pi}{2}$: $\\sin\\frac{3\\pi}{2} = -1$.'],
      ['\\tan(-x) = -\\tan x', true, 'Only $y$ flips, so $\\frac{y}{x}$ changes sign: tangent is odd.'],
      ['\\cos(x - 2\\pi) = \\cos x', true, 'Turning back a full turn returns to the same point.']
    ];
    var f = R.pick(facts);
    return { q: 'True or false: $' + f[0] + '$ for every $x$ where both sides are defined.', a: { t: 'tf', v: f[1] }, steps: [f[2]], hint: 'Picture the point on the unit circle and test a simple angle.' };
  });

  G('pre.six-trig-functions', function (R, ctx) {
    var kind = R.pick(by(ctx, ['point', 'recip', 'special'], ['point', 'special', 'recip', 'radical'], ['radical', 'special', 'point']));
    var FN = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
    function ratio(fn, x, y, r) { return { sin: [y, r], cos: [x, r], tan: [y, x], csc: [r, y], sec: [r, x], cot: [x, y] }[fn]; }
    var DEF1 = { sin: 'y', cos: 'x', tan: '\\dfrac{y}{x}', csc: '\\dfrac{1}{y}', sec: '\\dfrac{1}{x}', cot: '\\dfrac{x}{y}' };
    var DEF = { sin: '\\dfrac{y}{r}', cos: '\\dfrac{x}{r}', tan: '\\dfrac{y}{x}', csc: '\\dfrac{r}{y}', sec: '\\dfrac{r}{x}', cot: '\\dfrac{x}{y}' };
    if (kind === 'point') {
      var t = triple(R, by(ctx, 1, 3, 3)), k = R.int(1, 3), qd = R.int(1, 4), sg = quadSigns(qd), x = sg[0] * t[0] * k, y = sg[1] * t[1] * k, r = t[2] * k;
      var fn = R.pick(by(ctx, ['tan', 'sec', 'csc', 'cot'], FN, ['sec', 'csc', 'cot']));
      var rt = ratio(fn, x, y, r), val = Q(rt[0], rt[1]);
      return {
        q: 'The terminal side of $\\theta$ passes through the point $' + T.pt([x, y]) + '$. Find $\\' + fn + '\\theta$.',
        a: numA(val.toPlain()),
        steps: ['The distance from the origin is $r = \\sqrt{x^2 + y^2} = \\sqrt{' + T.p(x) + '^2 + ' + T.p(y) + '^2} = \\sqrt{' + (r * r) + '} = ' + r + '$.',
          '$\\' + fn + '\\theta = ' + DEF[fn] + ' = \\dfrac{' + rt[0] + '}{' + rt[1] + '} = ' + val.toTex() + '$.'],
        hint: fn === 'sec' ? 'Secant is the reciprocal of cosine: $r/x$.' : fn === 'csc' ? 'Cosecant is the reciprocal of sine: $r/y$.' : fn === 'cot' ? 'Cotangent is $x/y$.' : 'Find $r$ first.'
      };
    }
    if (kind === 'recip') {
      var t2 = triple(R, 3), qd2 = R.int(1, 4), s2 = quadSigns(qd2), giv = R.pick(['sin', 'cos', 'tan']), rec = { sin: 'csc', cos: 'sec', tan: 'cot' }[giv];
      var gv = giv === 'sin' ? Q(s2[1] * t2[1], t2[2]) : giv === 'cos' ? Q(s2[0] * t2[0], t2[2]) : Q(s2[1] * t2[1], s2[0] * t2[0]);
      return {
        q: 'If $\\' + giv + '\\theta = ' + gv.toTex() + '$, find $\\' + rec + '\\theta$.',
        a: numA(gv.inv().toPlain()),
        steps: ['$\\' + rec + '$ is the reciprocal of $\\' + giv + '$: $\\' + rec + '\\theta = \\dfrac{1}{\\' + giv + '\\theta}$. (Pair them by the third letter: <b>c</b>o<b>s</b> with <b>s</b>ec, <b>s</b>in with <b>c</b>sc.)'.replace('(Pair them by the third letter: <b>c</b>o<b>s</b> with <b>s</b>ec, <b>s</b>in with <b>c</b>sc.)', '(Each pair has exactly one "co": sine with cosecant, cosine with secant, tangent with cotangent.)'),
          '$\\' + rec + '\\theta = 1 \\div ' + T.p(gv.toTex()) + ' = ' + gv.inv().toTex() + '$.'],
        hint: giv === 'cos' ? 'Secant goes with cosine, not sine.' : giv === 'sin' ? 'Cosecant goes with sine.' : 'Flip the fraction.'
      };
    }
    if (kind === 'special') {
      var mode = R.pick(['deg', 'rad']), d = R.pick(by(ctx, [30, 45, 60, 0, 90], SPECIAL, SPECIAL.concat([-30, -45, 390]))), fn3 = R.pick(by(ctx, ['sec', 'csc', 'cot', 'tan'], ['sec', 'csc', 'cot', 'tan'], ['sec', 'csc', 'cot']));
      var v = trigDeg(fn3, d), m = mod(d, 360);
      var px = trigDeg('cos', m), py = trigDeg('sin', m);
      var st = ['The point on the unit circle at $' + angTex(d, mode) + '$ is $\\left(' + px.t + ', ' + py.t + '\\right)$, so $x = ' + px.t + '$ and $y = ' + py.t + '$ (with $r = 1$).',
        '$\\' + fn3 + '\\theta = ' + DEF1[fn3] + '$.'];
      if (v.undef) st.push('The denominator is $0$, so $' + fnAng(fn3, d, mode) + '$ is undefined.');
      else {
        var sub = { tan: '\\dfrac{' + py.t + '}{' + px.t + '}', cot: '\\dfrac{' + px.t + '}{' + py.t + '}', sec: '\\dfrac{1}{' + px.t + '}', csc: '\\dfrac{1}{' + py.t + '}' }[fn3];
        st.push('$' + fnAng(fn3, d, mode) + ' = ' + sub + ' = ' + v.t + '$' + (/sqrt/.test(v.p) && !/sqrt/.test(fn3 === 'sec' || fn3 === 'tan' ? px.p : py.p) ? '' : /sqrt/.test(v.p) ? ' (multiply top and bottom by the root to clear it from the denominator).' : '.'));
      }
      return { q: 'Find the exact value of $' + fnAng(fn3, d, mode) + '$, or type "undefined".', a: numA(v.p, v.undef ? undefined : 'simplest'), steps: st, hint: 'Write the ratio with $x = \\cos\\theta$ and $y = \\sin\\theta$; check for division by zero.' };
    }
    // radical r
    var pts = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 1], [2, 2], [1, 4], [4, 1]];
    var p = R.pick(pts), qd4 = R.int(1, 4), s4 = quadSigns(qd4), x4 = s4[0] * p[0], y4 = s4[1] * p[1], r2 = x4 * x4 + y4 * y4;
    var fn4 = R.pick(['sin', 'cos', 'csc', 'sec']);
    var num = fn4 === 'sin' ? y4 : fn4 === 'cos' ? x4 : null, ans, ansT;
    var rr = sqrtQ(r2);
    if (num !== null) { var e = sqrtQ(Q(num * num, r2)); ans = num < 0 ? negX(e) : e; }
    else { var den = fn4 === 'csc' ? y4 : x4; var e2 = sqrtQ(Q(r2, den * den)); ans = den < 0 ? negX(e2) : e2; }
    return {
      q: 'The terminal side of $\\theta$ passes through $' + T.pt([x4, y4]) + '$. Find the exact value of $\\' + fn4 + '\\theta$.',
      a: numA(ans.p, 'simplest'),
      steps: ['$r = \\sqrt{' + T.p(x4) + '^2 + ' + T.p(y4) + '^2} = \\sqrt{' + r2 + '}' + (rr.t !== '\\sqrt{' + r2 + '}' ? ' = ' + rr.t : '') + '$.',
        '$\\' + fn4 + '\\theta = ' + DEF[fn4] + ' = ' + (fn4 === 'sin' ? '\\dfrac{' + y4 + '}{' + rr.t + '}' : fn4 === 'cos' ? '\\dfrac{' + x4 + '}{' + rr.t + '}' : fn4 === 'csc' ? '\\dfrac{' + rr.t + '}{' + y4 + '}' : '\\dfrac{' + rr.t + '}{' + x4 + '}') + '$.',
        num !== null && Math.sqrt(r2) % 1 !== 0 ? 'Rationalize the denominator: $' + ans.t + '$.' : 'Simplify: $' + ans.t + '$.'],
      hint: 'Find $r$ first; if a root ends up in the denominator, rationalize.'
    };
  });

  G('pre.pythagorean-identity', function (R, ctx) {
    var kind = R.pick(by(ctx, ['find', 'find', 'check'], ['find', 'rad', 'check'], ['rad', 'tan', 'find']));
    var mode = R.pick(['rad', 'deg']);
    if (kind === 'find' || kind === 'rad') {
      var qd = R.int(by(ctx, 1, 1, 2), 4), sg = quadSigns(qd), giveSin = R.coin(), known, unk, unkSq;
      if (kind === 'find') {
        var t = triple(R, by(ctx, 1, 3, 3));
        var c = Q(sg[0] * t[0], t[2]), s = Q(sg[1] * t[1], t[2]);
        known = giveSin ? s : c; unk = giveSin ? c : s; unkSq = unk.mul(unk);
        var ans = { p: unk.toPlain(), t: unk.toTex() };
      } else {
        var pr = R.pick([[1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5], [3, 7], [5, 6], [1, 2]]);
        known = Q(pr[0], pr[1]); var ks = giveSin ? sg[1] : sg[0]; known = known.mul(ks);
        unkSq = Q(1).sub(known.mul(known));
        var root = sqrtQ(unkSq), us = giveSin ? sg[0] : sg[1];
        ans = us < 0 ? negX(root) : root;
      }
      var g = giveSin ? 'sin' : 'cos', w = giveSin ? 'cos' : 'sin';
      var mag = sqrtQ(unkSq);
      return {
        q: 'Given $\\' + g + '\\theta = ' + known.toTex() + '$ and $' + quadRangeTex(qd, mode) + '$, find $\\' + w + '\\theta$.',
        a: numA(ans.p, 'simplest'),
        steps: ['The point $(\\cos\\theta, \\sin\\theta)$ is on the unit circle $x^2 + y^2 = 1$, so $\\sin^2\\theta + \\cos^2\\theta = 1$.',
          '$\\' + w + '^2\\theta = 1 - ' + T.p(known.toTex()) + '^2 = 1 - ' + known.mul(known).toTex() + ' = ' + unkSq.toTex() + '$, so $\\' + w + '\\theta = \\pm' + mag.t + '$.',
          '$\\theta$ is in Quadrant ' + QN[qd] + ', where $\\' + w + '\\theta$ is ' + ((giveSin ? sg[0] : sg[1]) > 0 ? 'positive' : 'negative') + '. So $\\' + w + '\\theta = ' + ans.t + '$.'],
        hint: 'Use $\\sin^2\\theta + \\cos^2\\theta = 1$, then choose the sign from the quadrant.'
      };
    }
    if (kind === 'tan') {
      var t3 = triple(R, 3), q3 = R.int(1, 4), s3 = quadSigns(q3), tn = Q(s3[1] * t3[1], s3[0] * t3[0]), sec = Q(s3[0] * t3[2], t3[0]);
      return {
        q: 'Given $\\tan\\theta = ' + tn.toTex() + '$ and $' + quadRangeTex(q3, mode) + '$, find $\\sec\\theta$.',
        a: numA(sec.toPlain()),
        steps: ['Divide $\\sin^2\\theta + \\cos^2\\theta = 1$ by $\\cos^2\\theta$ to get $\\tan^2\\theta + 1 = \\sec^2\\theta$.',
          '$\\sec^2\\theta = ' + T.p(tn.toTex()) + '^2 + 1 = ' + tn.mul(tn).add(1).toTex() + '$, so $\\sec\\theta = \\pm' + sec.abs().toTex() + '$.',
          'In Quadrant ' + QN[q3] + ', cosine is ' + (s3[0] > 0 ? 'positive' : 'negative') + ', and secant has the same sign. So $\\sec\\theta = ' + sec.toTex() + '$.'],
        hint: 'Use $1 + \\tan^2\\theta = \\sec^2\\theta$; secant has the same sign as cosine.'
      };
    }
    // check: can these be the sine and cosine of one angle?
    var t4 = triple(R, 3), ok = R.coin(), a = Q(t4[0], t4[2]).mul(R.sign()), b;
    if (ok) b = Q(t4[1], t4[2]).mul(R.sign());
    else b = R.pick([Q(t4[0], t4[2]), Q(t4[1] + 1, t4[2]), Q(t4[1], t4[2] + 1)]).mul(R.sign());
    var sum = a.mul(a).add(b.mul(b));
    ok = sum.eq(1);
    return {
      q: 'True or false: there is an angle $\\theta$ with $\\sin\\theta = ' + a.toTex() + '$ and $\\cos\\theta = ' + b.toTex() + '$.',
      a: { t: 'tf', v: ok },
      steps: ['For any angle, $\\sin^2\\theta + \\cos^2\\theta = 1$.', '$' + T.p(a.toTex()) + '^2 + ' + T.p(b.toTex()) + '^2 = ' + a.mul(a).toTex() + ' + ' + b.mul(b).toTex() + ' = ' + sum.toTex() + '$.',
        ok ? 'It equals $1$, so the point is on the unit circle and such an angle exists.' : 'It is not $1$, so no angle has both of these values.'],
      hint: 'Square both values and add.'
    };
  });

  // ======================= 02-graphs.js
  // ===================================================================== Unit 2: Graphs of Trig Functions

  function bTex(B) { // a coefficient B of x: {k: Q, pi: bool}
    if (B.pi) { var r = piRed(B.k.num(), B.k.den()); return piTex(r.n, r.d); }
    return B.k.eq(1) ? '' : B.k.toTex();
  }
  function bPlain(B) { var k = B.k.isInt() ? B.k.toPlain() : '(' + B.k.toPlain() + ')'; return B.pi ? k + '*pi' : k; }
  function argTex(B, v) { // "2x", "\frac{1}{2}x", "\pi x", "\frac{\pi}{2} x"
    var b = bTex(B); v = v || 'x';
    if (!b) return v;
    return b + (B.pi ? ' ' : '') + v;
  }
  function periodOf(B, base) { // base: 2 (2pi) or 1 (pi) -> {p, t, v}
    if (B.pi) { var q = Q(base).div(B.k); return qx(q); }
    var r = piRed(base * B.k.den(), B.k.num()); return { p: piPlain(r.n, r.d), t: piTex(r.n, r.d), v: base * PI / B.k.toNumber() };
  }
  function pickB(R, ctx) {
    return R.pick(by(ctx,
      [{ k: Q(2) }, { k: Q(3) }, { k: Q(4) }, { k: Q(1, 2) }],
      [{ k: Q(1, 3) }, { k: Q(2, 3) }, { k: Q(3, 2) }, { k: Q(4) }, { k: Q(6) }, { k: Q(1, 4) }, { k: Q(3) }],
      [{ k: Q(1), pi: true }, { k: Q(1, 2), pi: true }, { k: Q(1, 3), pi: true }, { k: Q(2), pi: true }, { k: Q(1, 4), pi: true }, { k: Q(2, 3) }, { k: Q(5) }]));
  }

  G('pre.sine-cosine-graphs', function (R, ctx) {
    var kind = R.pick(by(ctx, ['ext', 'zeros', 'value', 'value', 'which'], ['ext', 'zeros', 'incr', 'range', 'which', 'value'], ['incr', 'zeros', 'cross', 'ext', 'range', 'value', 'value']));
    var fn = R.pick(['sin', 'cos']), kS = R.pick(by(ctx, [0, 0, -1], [0, 1, -1], [0, 1, -1, 2]));
    var circ = 'The graph is the unit circle unrolled: the height of $y = \\' + fn + ' x$ is the ' + (fn === 'sin' ? '$y$' : '$x$') + '-coordinate of the point at angle $x$.';
    if (kind === 'ext') {
      var isMax = R.coin(), at = fn === 'sin' ? (isMax ? [1, 2] : [3, 2]) : (isMax ? [0, 1] : [1, 1]);
      var dom = fn === 'cos' ? '[0, 2\\pi)' : '[0, 2\\pi]', sh = ctx.level >= 2 && R.coin() ? R.pick([2, -2, 4, -4]) : 0;
      var at0 = at.slice();
      if (sh) { at = [at[0] + sh * at[1], at[1]]; dom = '[' + piTex(sh, 1) + ', ' + piTex(sh + 2, 1) + (fn === 'cos' ? ')' : ']'); }
      return {
        q: 'On the interval $' + dom + '$, at what value of $x$ does $y = \\' + fn + ' x$ reach its ' + (isMax ? 'maximum' : 'minimum') + '?',
        a: numA(piPlain(at[0], at[1]), 'simplest'),
        steps: [circ, 'The ' + (fn === 'sin' ? '$y$' : '$x$') + '-coordinate is ' + (isMax ? 'largest ($1$)' : 'smallest ($-1$)') + ' at the point $' + T.pt(fn === 'sin' ? [0, isMax ? 1 : -1] : [isMax ? 1 : -1, 0]) + '$, which is at angle $' + piTex(at0[0], at0[1]) + '$.',
          'So the ' + (isMax ? 'maximum' : 'minimum') + ' is at $x = ' + piTex(at[0], at[1]) + '$' + (sh ? ' (one full turn, $2\\pi$, ' + (sh > 0 ? 'later' : 'earlier') + ' than in $[0, 2\\pi)$)' : '') + '.'],
        hint: 'Where on the unit circle is the ' + (fn === 'sin' ? 'height' : '$x$-coordinate') + ' ' + (isMax ? 'largest' : 'smallest') + '?'
      };
    }
    if (kind === 'zeros') {
      var big = ctx.level >= 3 && R.coin(), hi = big ? 4 : 2;
      var zs = [];
      for (var k = 0; k <= 2 * hi; k++) { var xx = 360 * kS + k * 90; if (xx > 360 * kS + hi * 180) break; if (Math.abs(trigNum(fn, xx)) < 1e-9) zs.push(xx); }
      var vals = zs.map(function (d) { return radPlain(d); }), zLo = piTex(2 * kS, 1), zHi = piTex(2 * kS + hi, 1);
      return {
        q: 'Find every $x$ in $[' + zLo + ', ' + zHi + ']$ where the graph of $y = \\' + fn + ' x$ crosses the $x$-axis.',
        a: { t: 'set', v: vals, form: 'simplest' },
        steps: [circ, (fn === 'sin' ? 'Sine is $0$ where the point is on the $x$-axis: at $0$, $\\pi$, $2\\pi$, … (every multiple of $\\pi$).' : 'Cosine is $0$ where the point is on the $y$-axis: at $\\frac{\\pi}{2}$, $\\frac{3\\pi}{2}$, … (odd multiples of $\\frac{\\pi}{2}$).'),
          'In $[' + zLo + ', ' + zHi + ']$ that gives $x = ' + texList(zs.map(radTex)) + '$.'],
        hint: 'Where is the point on the unit circle at height ' + (fn === 'sin' ? '$0$' : 'zero $x$-coordinate') + '?'
      };
    }
    if (kind === 'value') {
      var d = R.pick(SPECIAL.concat([360, -30, -90, -150, -60, 390, 420, 450, 540, 600, 630, -210, -270, -330, 480, 510, 570, 660, 690, 720, -45, -135, -225, -315, 405, 495, 585, 675]));
      var v = trigDeg(fn, d);
      return {
        q: 'The graph of $y = \\' + fn + ' x$ passes through a point with $x = ' + radTex(d) + '$. What is its $y$-coordinate? Give an exact value.',
        a: numA(v.p, 'simplest'),
        steps: [circ, '$y = ' + fnAng(fn, d, 'rad') + ' = ' + v.t + '$.'],
        hint: 'Find the point on the unit circle at that angle.'
      };
    }
    if (kind === 'incr') {
      var up = R.coin(), iq = fn === 'sin' ? (up ? [[0, 1], [3, 4]] : [[1, 3]]) : (up ? [[2, 4]] : [[0, 2]]);
      iq = iq.map(function (pr) { return [pr[0] + 4 * kS, pr[1] + 4 * kS]; });
      var iv = [iq.map(function (pr) { return '[' + piPlain(pr[0], 2) + ', ' + piPlain(pr[1], 2) + ']'; }).join(' U '), iq.map(function (pr) { return '\\left[' + piTex(pr[0], 2) + ', ' + piTex(pr[1], 2) + '\\right]'; }).join(' \\cup ')];
      return {
        q: 'On $[' + piTex(2 * kS, 1) + ', ' + piTex(2 * kS + 2, 1) + ']$, where is $y = \\' + fn + ' x$ ' + (up ? 'increasing' : 'decreasing') + '? Answer in interval notation (use U to join two intervals).',
        a: { t: 'interval', v: iv[0] },
        steps: [circ, fn === 'sin' ? 'As the point goes around, its height rises from $0$ up to $1$ (at $\\frac{\\pi}{2}$), falls to $-1$ (at $\\frac{3\\pi}{2}$), then rises back to $0$.' : 'Its $x$-coordinate starts at $1$, falls to $-1$ at $\\pi$, then rises back to $1$ at $2\\pi$.',
          'So it is ' + (up ? 'increasing' : 'decreasing') + ' on $' + iv[1] + '$.'],
        hint: 'Find where the maximum and minimum happen; the graph rises from a minimum to a maximum.'
      };
    }
    if (kind === 'range') {
      var askP = R.coin();
      if (askP) return { q: 'What is the period of $y = \\' + fn + ' x$? Give an exact value.', a: numA('2*pi', 'simplest'), steps: [circ, 'After one full turn, $2\\pi$, the point is back where it started, and the values repeat. No shorter shift works for every $x$.', 'The period is $2\\pi$.'], hint: 'How far around the circle before everything repeats?' };
      return { q: 'What is the range of $y = \\' + fn + ' x$? Answer in interval notation.', a: { t: 'interval', v: '[-1, 1]' }, steps: [circ, 'Coordinates of points on the unit circle are never more than $1$ or less than $-1$, and every value in between is reached.', 'The range is $[-1, 1]$.'], hint: 'How high and how low can a point on the unit circle be?' };
    }
    if (kind === 'which') {
      var Wq = R.pick([
        ['Which graph has a $y$-intercept of $1$?', '$y = \\cos x$', ['$y = \\sin x$', '$y = -\\sin x$', '$y = \\sin x + \\cos x$'], 'At $x = 0$ the point on the unit circle is $(1, 0)$, so $\\cos 0 = 1$ and $\\sin 0 = 0$.'],
        ['Which graph passes through the origin and rises from there?', '$y = \\sin x$', ['$y = \\cos x$', '$y = -\\sin x$', '$y = -\\cos x$'], '$\\sin 0 = 0$, and as $x$ grows past $0$ the point on the circle moves up, so sine rises.'],
        ['Shifting the graph of $y = \\sin x$ to the left by $\\frac{\\pi}{2}$ gives which graph?', '$y = \\cos x$', ['$y = -\\cos x$', '$y = -\\sin x$', '$y = \\sin x$'], 'The cosine graph peaks at $x = 0$, a quarter period, $\\frac{\\pi}{2}$, before sine peaks. So $\\sin\\left(x + \\frac{\\pi}{2}\\right) = \\cos x$.'],
        ['Which graph is symmetric about the $y$-axis?', '$y = \\cos x$', ['$y = \\sin x$', '$y = \\sin x + 1$', '$y = \\tan x$'], 'Cosine is even: $\\cos(-x) = \\cos x$, so its graph is a mirror image across the $y$-axis.']
      ]);
      return { q: Wq[0], a: mcq(Wq[1], Wq[2]), steps: [Wq[3]], hint: 'Think of where the point on the unit circle is at $x = 0$.' };
    }
    // cross: where sin x = cos x
    return {
      q: 'Where do the graphs of $y = \\sin x$ and $y = \\cos x$ cross on $[' + piTex(2 * kS, 1) + ', ' + piTex(2 * kS + 2, 1) + ')$?',
      a: { t: 'set', v: [piPlain(1 + 8 * kS, 4), piPlain(5 + 8 * kS, 4)], form: 'simplest' },
      steps: ['They cross where $\\sin x = \\cos x$: the point on the unit circle has equal coordinates.', 'That happens on the line $y = x$, at $\\frac{\\pi}{4}$ (both $\\frac{\\sqrt{2}}{2}$) and at $\\frac{5\\pi}{4}$ (both $-\\frac{\\sqrt{2}}{2}$).'].concat(kS ? ['Shift by $' + piTex(2 * kS, 1) + '$ to land in the interval: $x = ' + piTex(1 + 8 * kS, 4) + '$ and $x = ' + piTex(5 + 8 * kS, 4) + '$.'] : []),
      hint: 'Where on the unit circle are the two coordinates equal?'
    };
  });

  G('pre.amplitude-period', function (R, ctx) {
    var kind = R.pick(by(ctx, ['ap', 'ap', 'write'], ['ap', 'write', 'max'], ['ap', 'max', 'write']));
    var fn = R.pick(['sin', 'cos']), B = pickB(R, ctx), A = R.pick([2, 3, 4, 5, Q(1, 2), Q(3, 2), 6]);
    A = Q.from(A); if (R.chance(0.35)) A = A.neg();
    var per = periodOf(B, 2);
    var yT = 'y = ' + T.coef(A, '\\' + fn + '\\left(' + argTex(B) + '\\right)');
    var sP = ['In $y = A\\' + fn + '(Bx)$, the graph of $\\' + fn + '$ is stretched vertically by $|A|$, so the amplitude is $|A|$' + (A.sign() < 0 ? ' (the minus sign only flips the graph)' : '') + '.',
      'One cycle of $\\' + fn + '$ needs its input to run through $2\\pi$. $Bx$ goes from $0$ to $2\\pi$ when $x$ goes from $0$ to $\\frac{2\\pi}{B}$, so the period is $\\frac{2\\pi}{B}$.'];
    if (kind === 'ap') {
      return {
        q: 'Find the amplitude and the period of $' + yT + '$.',
        a: { t: 'multi', parts: [{ label: 'Amplitude', a: numA(A.abs().toPlain()) }, { label: 'Period', a: numA(per.p, 'simplest') }] },
        steps: sP.concat(['Amplitude $= |' + A.toTex() + '| = ' + A.abs().toTex() + '$; period $= \\dfrac{2\\pi}{' + (bTex(B) || '1') + '} = ' + per.t + '$.']),
        hint: 'The period is $\\frac{2\\pi}{B}$, not $B$.'
      };
    }
    if (kind === 'write') {
      var Ap = A.abs();
      return {
        q: 'Write an equation of the form $y = A\\' + fn + '(Bx)$ with $A > 0$ and $B > 0$ that has amplitude $' + Ap.toTex() + '$ and period $' + per.t + '$.',
        a: { t: 'expr', v: Ap.toPlain() + '*' + fn + '(' + bPlain(B) + '*x)', vars: ['x'] },
        steps: ['The amplitude gives $A = ' + Ap.toTex() + '$.', 'The period is $\\frac{2\\pi}{B}$, so $B = \\dfrac{2\\pi}{\\text{period}} = \\dfrac{2\\pi}{' + per.t + '} = ' + (bTex(B) || '1') + '$.', 'So $y = ' + T.coef(Ap, '\\' + fn + '\\left(' + argTex(B) + '\\right)') + '$.'],
        hint: 'Solve $\\text{period} = \\frac{2\\pi}{B}$ for $B$.'
      };
    }
    // max: maximum value and first x > 0 where it happens
    var top = fn === 'sin' ? (A.sign() > 0 ? Q(1, 4) : Q(3, 4)) : (A.sign() > 0 ? Q(1) : Q(1, 2)); // fraction of a period
    var xm = B.pi ? qx(top.mul(2).div(B.k)) : (function () { var r = piRed(2 * top.num() * B.k.den(), top.den() * B.k.num()); return { p: piPlain(r.n, r.d), t: piTex(r.n, r.d) }; })();
    return {
      q: 'For $' + yT + '$, find the maximum value of $y$ and the smallest positive $x$ where it happens.',
      a: { t: 'multi', parts: [{ label: 'Maximum $y$', a: numA(A.abs().toPlain()) }, { label: '$x$', a: numA(xm.p, 'simplest') }] },
      steps: sP.concat(['The maximum is the amplitude, $' + A.abs().toTex() + '$.',
        'For $y = ' + (A.sign() > 0 ? '' : '-') + '\\' + fn + ' u$, the first positive maximum is ' + (fn === 'sin' ? (A.sign() > 0 ? 'at $u = \\frac{\\pi}{2}$, a quarter of a cycle' : 'at $u = \\frac{3\\pi}{2}$, three quarters of a cycle (where $\\sin u = -1$)') : (A.sign() > 0 ? 'at $u = 2\\pi$, one full cycle' : 'at $u = \\pi$, half a cycle (where $\\cos u = -1$)')) + '.',
        'That is ' + (top.eq(1) ? 'one period' : '$' + top.toTex() + '$ of a period') + ': $x = ' + (top.eq(1) ? '' : top.toTex() + ' \\cdot ' + per.t + ' = ') + xm.t + '$.']),
      hint: 'Find where the basic ' + fn + ' curve peaks, as a fraction of a cycle, then scale by the period.'
    };
  });

  G('pre.phase-shift-midline', function (R, ctx) {
    var kind = R.pick(by(ctx, ['shift', 'maxmin', 'shift'], ['shift', 'maxmin', 'range', 'shift2'], ['shift2', 'write', 'range']));
    var fn = R.pick(['sin', 'cos']), Bk = R.pick(by(ctx, [1, 2, 3], [2, 3, 4, 1], [2, 3, 4])), B = { k: Q(Bk) };
    var h = piRed(R.pick([1, -1, 1, 2, -2, 3]), R.pick([2, 3, 4, 6, 1])), A = R.pick([1, 2, 3, 4, 5]) * (R.chance(0.3) ? -1 : 1), D = R.int(-5, 6);
    if (h.d === 1 && Math.abs(h.n) > 1) h = piRed(h.n, 2);
    var hT = piTex(h.n, h.d), hP = piPlain(h.n, h.d);
    var C = piRed(h.n * Bk, h.d); // Bx - C
    var inner = kind === 'shift2' || (kind === 'range' && R.coin()) ? T.coef(Bk, 'x') + (C.n > 0 ? ' - ' + piTex(C.n, C.d) : ' + ' + piTex(-C.n, C.d)) : (Bk === 1 ? '' : Bk) + (Bk === 1 ? 'x' : '\\left(x' + (h.n > 0 ? ' - ' + hT : ' + ' + piTex(-h.n, h.d)) + '\\right)');
    if (Bk === 1) inner = 'x' + (h.n > 0 ? ' - ' + hT : ' + ' + piTex(-h.n, h.d));
    var yT = 'y = ' + T.coef(A, '\\' + fn + '\\left(' + inner + '\\right)') + T.signed(D);
    var factorStep = 'Factor $B$ out of the inside: $' + inner + ' = ' + (Bk === 1 ? '' : Bk) + '\\left(x' + (h.n > 0 ? ' - ' + hT : ' + ' + piTex(-h.n, h.d)) + '\\right)$.';
    if (kind === 'shift' || kind === 'shift2') {
      var st = [];
      if (kind === 'shift2' && Bk !== 1) st.push(factorStep);
      st.push('In $y = A\\' + fn + '(B(x - h)) + k$ the graph moves right by $h$ (left if $h < 0$), so the phase shift is $' + hT + '$' + (h.n > 0 ? ' (right)' : ' (left)') + '.');
      st.push('The $+ k$ lifts the whole wave, so the midline is $y = ' + D + '$.');
      return {
        q: 'For $' + yT + '$, find the phase shift (positive for right, negative for left) and the midline $y = k$.',
        a: { t: 'multi', parts: [{ label: 'Phase shift', a: numA(hP, 'simplest') }, { label: 'Midline $y =$', a: numA(D) }] },
        steps: st,
        hint: kind === 'shift2' && Bk !== 1 ? 'Factor the coefficient of $x$ out first; the shift is $\\frac{C}{B}$, not $C$.' : 'Set the inside equal to zero and solve for $x$.'
      };
    }
    if (kind === 'maxmin' || kind === 'range') {
      var mx = D + Math.abs(A), mn = D - Math.abs(A);
      var st2 = ['The wave swings $|A| = ' + Math.abs(A) + '$ above and below its midline $y = ' + D + '$. Shifting left or right does not change the heights.',
        'Maximum $= ' + D + ' + ' + Math.abs(A) + ' = ' + mx + '$; minimum $= ' + D + ' - ' + Math.abs(A) + ' = ' + mn + '$.'];
      if (kind === 'range') return { q: 'Find the range of $' + yT + '$. Answer in interval notation.', a: { t: 'interval', v: '[' + mn + ', ' + mx + ']' }, steps: st2.concat(['Range: $[' + mn + ', ' + mx + ']$.']), hint: 'Start at the midline and go up and down by the amplitude.' };
      return { q: 'Find the maximum and minimum values of $' + yT + '$.', a: { t: 'multi', parts: [{ label: 'Maximum', a: numA(mx) }, { label: 'Minimum', a: numA(mn) }] }, steps: st2, hint: 'Midline plus and minus the amplitude.' };
    }
    // write from features
    var Ap = Math.abs(A), per = periodOf(B, 2);
    return {
      q: 'Write an equation $y = A\\' + fn + '(B(x - h)) + k$ with $A > 0$, $B > 0$ for a ' + (fn === 'sin' ? 'sine' : 'cosine') + ' wave with amplitude $' + Ap + '$, period $' + per.t + '$, phase shift $' + hT + '$ and midline $y = ' + D + '$.',
      a: { t: 'expr', v: Ap + '*' + fn + '(' + Bk + '*(x-(' + hP + ')))+(' + D + ')', vars: ['x'] },
      steps: ['$A = ' + Ap + '$ and $k = ' + D + '$.', '$B = \\dfrac{2\\pi}{' + per.t + '} = ' + Bk + '$.', '$h = ' + hT + '$, so the equation is $y = ' + T.coef(Ap, '\\' + fn + '\\left(' + (Bk === 1 ? '' : Bk) + '\\left(x' + (h.n > 0 ? ' - ' + hT : ' + ' + piTex(-h.n, h.d)) + '\\right)\\right)') + T.signed(D) + '$.'],
      hint: 'Get $B$ from the period: $B = \\frac{2\\pi}{\\text{period}}$.'
    };
  });

  G('pre.sinusoidal-models', function (R, ctx) {
    var kind = R.pick(by(ctx, ['wheel', 'tide'], ['wheel', 'tide', 'temp'], ['wheel', 'tide', 'temp']));
    if (kind === 'wheel') {
      var d = R.pick([20, 30, 40, 50, 60, 80, 100, 120]), r = d / 2, b = R.int(2, 8), c = b + r, Tm = R.pick([2, 4, 6, 8, 10, 12, 20]);
      var ask = R.pick(by(ctx, ['feat', 'height'], ['height', 'feat', 'write'], ['write', 'height']));
      var setup = 'A Ferris wheel is $' + d + '$ m across, and its lowest seat is $' + b + '$ m above the ground. It turns once every $' + Tm + '$ minutes, and you board at the bottom at $t = 0$.';
      var model = 'h(t) = ' + c + ' - ' + r + '\\cos\\left(\\frac{2\\pi}{' + Tm + '}t\\right)';
      var base = ['The center is $' + b + ' + ' + r + ' = ' + c + '$ m up (the midline), and the radius $' + r + '$ m is the amplitude. The period is $' + Tm + '$ minutes.',
        'You start at the bottom, the minimum, so use $-\\cos$: $' + model + '$.'];
      if (ask === 'feat') return { q: setup + ' Find the midline height, the amplitude and the period of your height $h(t)$.', a: { t: 'multi', parts: [{ label: 'Midline (m)', a: numA(c) }, { label: 'Amplitude (m)', a: numA(r) }, { label: 'Period (min)', a: numA(Tm) }] }, steps: base.slice(0, 1), hint: 'The midline is the height of the center of the wheel.' };
      if (ask === 'write') return { q: setup + ' Write your height $h(t)$, in meters, after $t$ minutes.', a: { t: 'expr', v: c + '-' + r + '*cos(2*pi*t/' + Tm + ')', vars: ['t'] }, steps: base.concat(['Check: $h(0) = ' + c + ' - ' + r + ' = ' + b + '$, the bottom.']), hint: 'Midline minus amplitude times cosine, since you start at the lowest point.' };
      var fr = R.pick([[1, 4], [1, 2], [3, 4], [1, 6], [1, 3], [2, 3], [5, 6]]);
      var tt = Q(Tm * fr[0], fr[1]), ang = piRed(2 * fr[0], fr[1]), cv = trigDeg('cos', 360 * fr[0] / fr[1]);
      var hv = Q(c).sub(sdTrig('cos', 360 * fr[0] / fr[1])[1].mul(r));
      return { q: setup + ' How high are you after $' + tt.toTex() + '$ minutes?', a: numA(hv.toPlain()), steps: base.concat(['$\\frac{2\\pi}{' + Tm + '} \\cdot ' + tt.toTex() + ' = ' + piTex(ang.n, ang.d) + '$, and $\\cos' + piTex(ang.n, ang.d) + ' = ' + cv.t + '$.', '$h = ' + c + ' - ' + r + ' \\cdot ' + T.p(cv.t) + ' = ' + hv.toTex() + '$ m.']), hint: 'Find what fraction of a turn you have made.' };
    }
    if (kind === 'tide') {
      var H = R.int(10, 18), L = H - 2 * R.int(2, 4), A = (H - L) / 2, D = (H + L) / 2, t1 = R.int(1, 5);
      var ask2 = R.pick(by(ctx, ['feat', 'depth'], ['feat', 'depth', 'write'], ['write', 'depth']));
      var setup2 = 'At a harbor, high tide is $' + H + '$ ft at ' + t1 + ' a.m. and the next low tide is $' + L + '$ ft at ' + (t1 + 6) + ' a.m. Model the depth with a sinusoid.';
      var st = ['Amplitude $= \\frac{' + H + ' - ' + L + '}{2} = ' + A + '$ ft; midline $= \\frac{' + H + ' + ' + L + '}{2} = ' + D + '$ ft.',
        'High to low is half a cycle, $6$ hours, so the period is $12$ hours and $B = \\frac{2\\pi}{12} = \\frac{\\pi}{6}$.',
        'High tide (a maximum) at $t = ' + t1 + '$ suits cosine shifted right $' + t1 + '$: $d(t) = ' + D + ' + ' + A + '\\cos\\left(\\frac{\\pi}{6}(t - ' + t1 + ')\\right)$, with $t$ in hours after midnight.'];
      if (ask2 === 'feat') return { q: setup2 + ' Find the amplitude, the midline depth and the period.', a: { t: 'multi', parts: [{ label: 'Amplitude (ft)', a: numA(A) }, { label: 'Midline (ft)', a: numA(D) }, { label: 'Period (hours)', a: numA(12) }] }, steps: st.slice(0, 2), hint: 'From high tide to low tide is half a period.' };
      if (ask2 === 'write') return { q: setup2 + ' Write the depth $d(t)$, in feet, $t$ hours after midnight.', a: { t: 'expr', v: D + '+' + A + '*cos(pi/6*(t-' + t1 + '))', vars: ['t'] }, steps: st, hint: 'A cosine starts at a maximum; shift it to the time of high tide.' };
      var dt = R.pick([2, 4, 3, 8, 10]), cvv = trigDeg('cos', 30 * dt), dep = Q(D).add(sdTrig('cos', 30 * dt)[1].mul(A));
      if (!sdTrig('cos', 30 * dt)[2].isZero()) dt = 2;
      cvv = trigDeg('cos', 30 * dt); dep = Q(D).add(sdTrig('cos', 30 * dt)[1].mul(A));
      return { q: setup2 + ' What is the depth ' + dt + ' hours after the high tide?', a: numA(dep.toPlain()), steps: st.concat(['$' + dt + '$ hours after high tide: $d = ' + D + ' + ' + A + '\\cos\\left(\\frac{\\pi}{6} \\cdot ' + dt + '\\right) = ' + D + ' + ' + A + ' \\cdot ' + T.p(cvv.t) + ' = ' + dep.toTex() + '$ ft.']), hint: 'Use the model with $t - ' + t1 + ' = ' + dt + '$.' };
    }
    var Tmax = R.int(70, 90), Tmin = Tmax - 2 * R.int(10, 20), A3 = (Tmax - Tmin) / 2, D3 = (Tmax + Tmin) / 2, m = R.pick([1, 3, 5, 9, 11, 4, 10]);
    var ang3 = 30 * (m - 7), cv3 = trigDeg('cos', ang3), val3 = Q(D3).add(sdTrig('cos', ang3)[1].mul(A3));
    return {
      q: 'In a town, the average high temperature peaks at $' + Tmax + '^\\circ$F in July (month $7$) and is lowest, $' + Tmin + '^\\circ$F, in January (month $1$). Using $T(m) = ' + D3 + ' + ' + A3 + '\\cos\\left(\\frac{\\pi}{6}(m - 7)\\right)$, find the average high in month $' + m + '$.',
      a: numA(val3.toPlain()),
      steps: ['Check the model: midline $\\frac{' + Tmax + ' + ' + Tmin + '}{2} = ' + D3 + '$, amplitude $' + A3 + '$, period $12$ months, maximum at $m = 7$.',
        '$\\frac{\\pi}{6}(' + m + ' - 7) = ' + radTex(ang3) + '$, and $\\cos\\left(' + radTex(ang3) + '\\right) = ' + cv3.t + '$.',
        '$T = ' + D3 + ' + ' + A3 + ' \\cdot ' + T.p(cv3.t) + ' = ' + val3.toTex() + '^\\circ$F.'],
      hint: 'Substitute the month, then use an exact cosine value.'
    };
  });

  G('pre.tangent-reciprocal-graphs', function (R, ctx) {
    var kind = R.pick(by(ctx, ['period', 'asym', 'which', 'asym'], ['period', 'asym', 'range', 'which', 'asym'], ['asym', 'period', 'range', 'asym', 'period']));
    if (kind === 'period') {
      var fn = R.pick(by(ctx, ['tan', 'tan', 'sec', 'csc'], ['tan', 'cot', 'sec', 'csc'], ['tan', 'cot', 'sec', 'csc'])), B = pickB(R, ctx), A = R.pick([1, 2, 3, -2, 4]);
      var base = fn === 'tan' || fn === 'cot' ? 1 : 2, per = periodOf(B, base);
      return {
        q: 'Find the period of $y = ' + T.coef(A, '\\' + fn + '\\left(' + argTex(B) + '\\right)') + '$.',
        a: numA(per.p, 'simplest'),
        steps: [base === 1 ? '$\\' + fn + ' x$ repeats every $\\pi$: a half turn sends $(x, y)$ to $(-x, -y)$, and the ratio does not change.' : '$\\' + fn + ' x$ is the reciprocal of $\\' + (fn === 'sec' ? 'cos' : 'sin') + ' x$, so it repeats when that does: every $2\\pi$.',
          'The coefficient $B$ squeezes the graph: period $= \\dfrac{' + (base === 1 ? '\\pi' : '2\\pi') + '}{' + (bTex(B) || '1') + '} = ' + per.t + '$.'],
        hint: fn === 'tan' || fn === 'cot' ? 'The basic period of tangent is $\\pi$, not $2\\pi$.' : 'Secant and cosecant share the period of cosine and sine.'
      };
    }
    if (kind === 'asym') {
      var fn2 = R.pick(['tan', 'sec', 'csc', 'cot']), Bk = by(ctx, R.pick([1, 1, 2]), R.pick([1, 2, 3]), R.pick([2, 3, 4, 1]));
      var DM = by(ctx, [[0, 360, '0 \\le x < 2\\pi'], [-180, 180, '-\\pi \\le x < \\pi']], [[0, 360, '0 \\le x < 2\\pi'], [-180, 180, '-\\pi \\le x < \\pi'], [0, 180, '0 \\le x < \\pi']], [[0, 360, '0 \\le x < 2\\pi'], [-180, 180, '-\\pi \\le x < \\pi'], [0, 180, '0 \\le x < \\pi'], [-360, 0, '-2\\pi \\le x < 0']]), dm = R.pick(DM);
      var zeroOf = fn2 === 'tan' || fn2 === 'sec' ? 'cos' : 'sin', xs = [];
      for (var dd = dm[0]; dd < dm[1]; dd += 7.5) { if (Math.abs(Math.round(dd * Bk) - dd * Bk) < 1e-9 && Math.abs(trigNum(zeroOf, Math.round(dd * Bk))) < 1e-9) xs.push(dd); }
      var arg = Bk === 1 ? 'x' : Bk + 'x';
      return {
        q: 'Find every vertical asymptote of $y = \\' + fn2 + ' ' + (Bk === 1 ? 'x' : '(' + arg + ')') + '$ with $' + dm[2] + '$. List the $x$-values.',
        a: { t: 'set', v: xs.map(radPlainQ), form: 'simplest' },
        steps: ['$\\' + fn2 + ' u = ' + { tan: '\\frac{\\sin u}{\\cos u}', sec: '\\frac{1}{\\cos u}', csc: '\\frac{1}{\\sin u}', cot: '\\frac{\\cos u}{\\sin u}' }[fn2] + '$ is undefined where $\\' + zeroOf + ' u = 0$: there the graph shoots up or down.',
          '$\\' + zeroOf + ' u = 0$ at $u = ' + (zeroOf === 'cos' ? '\\frac{\\pi}{2} + k\\pi' : 'k\\pi') + '$.' + (Bk === 1 ? '' : ' With $u = ' + arg + '$, divide by $' + Bk + '$: $x = ' + (zeroOf === 'cos' ? piTex(1, 2 * Bk) + ' + ' + (Bk === 1 ? '' : '\\frac{k\\pi}{' + Bk + '}') : '\\frac{k\\pi}{' + Bk + '}') + '$.'),
          'In $[0, 2\\pi)$: $x = ' + texList(xs.map(radTex)) + '$.'],
        hint: 'Find where the denominator, $\\' + zeroOf + '$, is zero.'
      };
    }
    if (kind === 'range') {
      var fn3 = R.pick(['sec', 'csc', 'tan']);
      if (fn3 === 'tan') return { q: 'What is the range of $y = \\tan x$? Answer in interval notation.', a: { t: 'interval', v: '(-inf, inf)' }, steps: ['Near each asymptote, $\\tan x = \\frac{\\sin x}{\\cos x}$ divides by a tiny number, so it takes every large positive and negative value, and every value in between.', 'Range: $(-\\infty, \\infty)$.'], hint: 'Look at what happens near the asymptotes.' };
      return {
        q: 'What is the range of $y = \\' + fn3 + ' x$? Answer in interval notation (use U to join intervals).',
        a: { t: 'interval', v: '(-inf, -1] U [1, inf)' },
        steps: ['$\\' + fn3 + ' x = \\dfrac{1}{\\' + (fn3 === 'sec' ? 'cos' : 'sin') + ' x}$, and $\\' + (fn3 === 'sec' ? 'cos' : 'sin') + ' x$ is between $-1$ and $1$.', 'The reciprocal of a number between $-1$ and $1$ (not $0$) is at least $1$ in size: it is $\\ge 1$ or $\\le -1$.', 'Range: $(-\\infty, -1] \\cup [1, \\infty)$.'],
        hint: 'What is $\\frac{1}{u}$ when $0 < |u| \\le 1$?'
      };
    }
    var Wq = R.pick([
      ['Where does $y = \\sec x$ have vertical asymptotes?', 'Where $\\cos x = 0$', ['Where $\\sin x = 0$', 'Where $\\cos x = 1$', 'Where $\\tan x = 0$'], '$\\sec x = \\frac{1}{\\cos x}$ is undefined exactly where $\\cos x = 0$.'],
      ['Where does $y = \\csc x$ have vertical asymptotes?', 'Where $\\sin x = 0$', ['Where $\\cos x = 0$', 'Where $\\sin x = 1$', 'Where $\\tan x = 1$'], '$\\csc x = \\frac{1}{\\sin x}$ is undefined exactly where $\\sin x = 0$.'],
      ['Where does $y = \\tan x$ cross the $x$-axis?', 'Where $\\sin x = 0$', ['Where $\\cos x = 0$', 'Where $\\sin x = \\cos x$', 'It never does'], '$\\tan x = \\frac{\\sin x}{\\cos x}$ is zero when its numerator, $\\sin x$, is zero.'],
      ['The graph of $y = \\sec x$ touches the graph of $y = \\cos x$ where…', '$\\cos x = 1$ or $\\cos x = -1$', ['$\\cos x = 0$', '$\\sin x = 1$', 'they never touch'], 'A number equals its own reciprocal only when it is $1$ or $-1$.']
    ]);
    return { q: Wq[0], a: mcq(Wq[1], Wq[2]), steps: [Wq[3]], hint: 'Write the function as a fraction in sine and cosine.' };
  });

  G('pre.damped-oscillation', function (R, ctx) {
    var kind = R.pick(by(ctx, ['eval', 'period', 'eval'], ['eval', 'period', 'when', 'write'], ['write', 'when', 'eval']));
    var A = R.pick([8, 16, 32, 12, 24, 40]), half = R.pick([2, 3, 4]), w = R.pick([1, 2, 4]);
    var yT = 'y = ' + A + '\\left(\\frac{1}{' + half + '}\\right)^{t}\\cos(' + (w === 1 ? '' : w) + '\\pi t)';
    if (kind === 'eval') {
      var n = R.int(1, 3), isHalf = w === 1 && R.coin(), t = isHalf ? Q(2 * n + 1, 2) : Q(n);
      if (isHalf) { // cos(pi*(n+1/2)) = 0
        return { q: 'A spring\'s position is $' + yT + '$. Find $y$ at $t = ' + t.toTex() + '$.', a: numA('0'), steps: ['$\\cos\\left(\\pi \\cdot ' + t.toTex() + '\\right) = 0$, since $' + piTex(2 * n + 1, 2) + '$ is an odd multiple of $\\frac{\\pi}{2}$.', 'So $y = 0$: the spring is passing through its rest position.'], hint: 'Evaluate the cosine first.' };
      }
      var cosv = (w * n) % 2 === 0 ? 1 : -1, val = Q(A * cosv, Math.pow(half, n));
      return {
        q: 'A spring\'s position is $' + yT + '$. Find $y$ at $t = ' + n + '$.',
        a: numA(val.toPlain()),
        steps: ['The factor $\\left(\\frac{1}{' + half + '}\\right)^t$ shrinks the swings; the cosine makes the oscillation.',
          '$\\cos(' + (w === 1 ? '' : w) + '\\pi \\cdot ' + n + ') = \\cos(' + piTex(w * n, 1) + ') = ' + cosv + '$, and $\\left(\\frac{1}{' + half + '}\\right)^{' + n + '} = \\frac{1}{' + Math.pow(half, n) + '}$.',
          '$y = ' + A + ' \\cdot \\frac{1}{' + Math.pow(half, n) + '} \\cdot ' + T.p(cosv) + ' = ' + val.toTex() + '$.'],
        hint: 'Work out the decay factor and the cosine separately, then multiply.'
      };
    }
    if (kind === 'period') {
      var om = R.pick([[2, 1], [4, 1], [1, 1], [1, 2], [3, 1], [2, 3]]), k = R.pick(['0.1', '0.2', '0.5', '0.05']), A2 = R.int(2, 20);
      var per = Q(2 * om[1], om[0]);
      var omT = piTex(om[0], om[1]).replace('\\pi', '\\pi');
      return {
        q: 'A guitar string\'s displacement is $y = ' + A2 + 'e^{-' + k + 't}\\sin\\left(' + (om[1] === 1 ? (om[0] === 1 ? '' : om[0]) + '\\pi t' : '\\frac{' + (om[0] === 1 ? '' : om[0]) + '\\pi}{' + om[1] + '}t') + '\\right)$. What is the period of its oscillation?',
        a: numA(per.toPlain()),
        steps: ['The exponential factor only shrinks the size of the swings. The timing comes from the sine: period $= \\frac{2\\pi}{B}$.', 'Here $B = ' + omT + '$, so the period is $\\dfrac{2\\pi}{' + omT + '} = ' + per.toTex() + '$.'],
        hint: 'Ignore the exponential: the period comes from the sine part.'
      };
    }
    if (kind === 'when') {
      var m = R.int(2, 4), target = Q(A, Math.pow(half, m));
      return {
        q: 'For $' + yT + '$, the swings are bounded by $\\pm ' + A + '\\left(\\frac{1}{' + half + '}\\right)^{t}$. At what time $t$ has this bound shrunk to $' + target.toTex() + '$?',
        a: numA(m),
        steps: ['Solve $' + A + '\\left(\\frac{1}{' + half + '}\\right)^{t} = ' + target.toTex() + '$.', 'Divide by $' + A + '$: $\\left(\\frac{1}{' + half + '}\\right)^{t} = \\frac{1}{' + Math.pow(half, m) + '} = \\left(\\frac{1}{' + half + '}\\right)^{' + m + '}$.', 'So $t = ' + m + '$.'],
        hint: 'Write both sides as powers of $\\frac{1}{' + half + '}$.'
      };
    }
    var A4 = R.pick([5, 10, 4, 6, 12]), k4 = R.pick(['0.5', '0.2', '0.1', '0.25', '1']), per4 = R.pick([[2, 1], [1, 1], [4, 1], [1, 2]]), B4 = piRed(2 * per4[1], per4[0]);
    return {
      q: 'Write $y(t) = Ae^{-kt}\\cos(Bt)$ for a mass that starts $' + A4 + '$ cm above rest, with decay constant $k = ' + k4 + '$ and period $' + T.frac(per4[0], per4[1]) + '$ seconds.',
      a: { t: 'expr', v: A4 + '*e^(-' + (k4 === '1' ? '' : k4 + '*') + 't)*cos(' + piPlain(B4.n, B4.d) + '*t)', vars: ['t'] },
      steps: ['At $t = 0$, $y = A$, so $A = ' + A4 + '$.', '$B = \\dfrac{2\\pi}{\\text{period}} = \\dfrac{2\\pi}{' + T.frac(per4[0], per4[1]) + '} = ' + piTex(B4.n, B4.d) + '$.', 'So $y(t) = ' + A4 + 'e^{-' + (k4 === '1' ? '' : k4) + 't}\\cos\\left(' + (B4.d === 1 ? (B4.n === 1 ? '' : B4.n) + '\\pi' : piTex(B4.n, B4.d)) + ' t\\right)$.'],
      hint: 'Find $B$ from the period, as for any sinusoid.'
    };
  });

  var INV = { arcsin: 'sin', arccos: 'cos', arctan: 'tan' };
  var INVRANGE = { arcsin: '\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]', arccos: '[0, \\pi]', arctan: '\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)' };
  function invNum(f, x) { return f === 'arcsin' ? Math.asin(x) : f === 'arccos' ? Math.acos(x) : Math.atan(x); }
  function invTex(f, argT, style) { var s = style === 1 ? '\\' + INV[f] + '^{-1}' : '\\' + f; return s + '\\left(' + argT + '\\right)'; }

  G('pre.inverse-trig', function (R, ctx) {
    var kind = R.pick(by(ctx, ['eval', 'eval', 'deg'], ['eval', 'eval', 'notation', 'range'], ['eval', 'dne', 'notation', 'range']));
    var style = R.int(0, 1);
    if (kind === 'eval' || kind === 'deg') {
      var f = R.pick(['arcsin', 'arccos', 'arctan']);
      var pool = f === 'arctan' ? ['0', '1', 'sqrt(3)', 'sqrt(3)/3'] : ['0', '1/2', 'sqrt(2)/2', 'sqrt(3)/2', '1'];
      var vp = R.pick(pool), neg = vp !== '0' && R.chance(ctx.level >= 2 ? 0.6 : 0.35);
      var x = ML.evalPlain(vp) * (neg ? -1 : 1), e = exv(x), ang = invNum(f, x), pr = piRatio(ang), deg = Math.round(ang * 180 / PI);
      var mode = kind === 'deg' ? 'deg' : 'rad';
      var base = INV[f];
      var st = ['$' + invTex(f, e.t, style) + '$ is the angle in $' + INVRANGE[f] + '$ whose ' + { sin: 'sine', cos: 'cosine', tan: 'tangent' }[base] + ' is $' + e.t + '$.'];
      if (neg && deg === 180) st.push('The range $[0, \\pi]$ includes $\\pi$, where the point on the unit circle is $(-1, 0)$.');
      else if (neg) st.push(f === 'arccos' ? 'The range $[0, \\pi]$ covers Quadrants I and II, and cosine is negative in Quadrant II. The reference angle is $' + angTex(180 - deg, mode) + '$, so the angle is $\\pi - ' + angTex(180 - deg, 'rad') + '$.' : 'For a negative input, the angle is in Quadrant IV, measured clockwise: the negative of the reference angle $' + angTex(-deg, mode) + '$.');
      st.push('$' + fnAng(base, deg, mode) + ' = ' + e.t + '$ and $' + angTex(deg, mode) + '$ is in the range, so the answer is $' + angTex(deg, mode) + '$.');
      return { q: 'Find the exact value of $' + invTex(f, e.t, style) + '$' + (mode === 'deg' ? ' in degrees.' : ' in radians.'), a: numA(mode === 'deg' ? String(deg) : piPlain(pr.n, pr.d), 'simplest'), steps: st, hint: 'Which angle in $' + INVRANGE[f] + '$ has this ' + { sin: 'sine', cos: 'cosine', tan: 'tangent' }[base] + '?' };
    }
    if (kind === 'dne') {
      var f2 = R.pick(['arcsin', 'arccos']), v = R.pick(['2', '3/2', '-2', '5/4', 'sqrt(3)']);
      var vt = T.plain(v);
      return { q: 'Evaluate $' + invTex(f2, vt, style) + '$, or type "undefined" if it does not exist.', a: numA('DNE'), steps: ['$\\' + INV[f2] + '$ only takes values from $-1$ to $1$ (they are coordinates on the unit circle).', '$' + vt + '$ is outside $[-1, 1]$, so no angle works: $' + invTex(f2, vt, style) + '$ is undefined.'], hint: 'What values can ' + (f2 === 'arcsin' ? 'sine' : 'cosine') + ' produce?' };
    }
    if (kind === 'notation') {
      var pairs = [['sin', '\\frac{1}{2}', 30, '2'], ['cos', '\\frac{1}{2}', 60, '2'], ['tan', '1', 45, '1'], ['sin', '\\frac{\\sqrt{2}}{2}', 45, 'sqrt(2)'], ['cos', '\\frac{\\sqrt{3}}{2}', 30, '2*sqrt(3)/3'], ['tan', '\\sqrt{3}', 60, 'sqrt(3)/3'], ['sin', '\\frac{\\sqrt{3}}{2}', 60, '2*sqrt(3)/3']];
      var p = R.pick(pairs), aT = radTex(p[2]), other = { sin: 'csc', cos: 'sec', tan: 'cot' }[p[0]];
      return {
        q: 'The "$-1$" means different things in these two expressions. Find both exactly: (a) $\\' + p[0] + '^{-1}\\left(' + p[1] + '\\right)$, in radians, and (b) $\\left(' + fnTex(p[0], aT) + '\\right)^{-1}$.',
        a: { t: 'multi', parts: [{ label: '(a)', a: numA(radPlain(p[2]), 'simplest') }, { label: '(b)', a: numA(p[3], 'simplest') }] },
        steps: ['(a) $\\' + p[0] + '^{-1}$ is the inverse function: it gives the angle whose ' + { sin: 'sine', cos: 'cosine', tan: 'tangent' }[p[0]] + ' is $' + p[1] + '$. That angle is $' + aT + '$.',
          '(b) An exponent of $-1$ on a number means its reciprocal: $\\left(' + fnTex(p[0], aT) + '\\right)^{-1} = \\dfrac{1}{' + fnTex(p[0], aT) + '} = \\dfrac{1}{' + p[1] + '} = ' + T.plain(p[3]) + '$. This is $' + fnTex(other, aT) + '$.'],
        hint: 'In (a) the input is a number and the answer is an angle. In (b) you take a reciprocal.'
      };
    }
    var f3 = R.pick(['arcsin', 'arccos', 'arctan']);
    var Wq = { arcsin: ['\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]', ['$[0, \\pi]$', '$[0, 2\\pi)$', '$[-1, 1]$']], arccos: ['[0, \\pi]', ['$\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$', '$[0, 2\\pi)$', '$[-1, 1]$']], arctan: ['\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)', ['$[0, \\pi]$', '$\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$', '$(-\\infty, \\infty)$']] }[f3];
    return {
      q: 'What is the range of $y = ' + (style ? '\\' + INV[f3] + '^{-1} x' : '\\' + f3 + ' x') + '$, the set of angles it can give?',
      a: mcq('$' + Wq[0] + '$', Wq[1]),
      steps: ['To have an inverse, $\\' + INV[f3] + '$ is restricted to an interval where it takes each value once.',
        f3 === 'arccos' ? 'Cosine runs from $1$ down to $-1$ exactly once on $[0, \\pi]$, the top half of the circle.' : f3 === 'arcsin' ? 'Sine runs from $-1$ up to $1$ exactly once on $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$, the right half of the circle.' : 'Tangent takes every value once on $\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$; the endpoints are asymptotes, so they are left out.',
        'So the range is $' + Wq[0] + '$.'],
      hint: 'Which half of the circle covers every value exactly once?'
    };
  });

  G('pre.inverse-trig-compositions', function (R, ctx) {
    var kind = R.pick(by(ctx, ['fninv', 'invfn', 'fninv'], ['invfn', 'fninv', 'invfn'], ['invfn', 'alg', 'fninv', 'alg']));
    if (kind === 'invfn') {
      var f = R.pick(['arcsin', 'arccos', 'arctan']), base = INV[f];
      var degs = SPECIAL.filter(function (d) { return !isNaN(trigNum(base, d)); }).concat([-30, -60, -45, -120, -150, -135]);
      var d = R.pick(degs), val = trigNum(base, d), out = invNum(f, val), pr = piRatio(out), outDeg = Math.round(out * 180 / PI);
      var inRange = Math.abs(outDeg - d) < 1e-9;
      if (ctx.level === 1 && inRange && R.chance(0.6)) { d = R.pick([120, 150, 135, 210, 240, 300, 330, 315]); val = trigNum(base, d); out = invNum(f, val); pr = piRatio(out); outDeg = Math.round(out * 180 / PI); inRange = outDeg === d; }
      var ev = exv(val);
      var st = ['First the inside: $' + fnAng(base, d, 'rad') + ' = ' + ev.t + '$.',
        '$' + invTex(f, ev.t, 0) + '$ must be an angle in $' + INVRANGE[f] + '$.'];
      if (inRange) st.push('$' + radTex(d) + '$ is already in that range, so the answer is $' + radTex(d) + '$.');
      else st.push('$' + radTex(d) + '$ is not in that range. The angle in the range with the same ' + { sin: 'sine', cos: 'cosine', tan: 'tangent' }[base] + ' is $' + piTex(pr.n, pr.d) + '$.');
      return { q: 'Find the exact value of $' + invTex(f, fnAng(base, d, 'rad'), 0) + '$.', a: numA(piPlain(pr.n, pr.d), 'simplest'), steps: st, hint: 'Evaluate the inside first, then find the angle in the range of $\\' + f + '$.' };
    }
    if (kind === 'fninv') {
      var t = triple(R, by(ctx, 3, 4, 5)), f2 = R.pick(['arcsin', 'arccos', 'arctan']), out2 = R.pick(['sin', 'cos', 'tan']);
      var sgn = ctx.level >= 2 && R.coin() ? -1 : 1, arg, x, y;
      // angle phi = f2(arg): build its (cos, sin) exactly
      if (f2 === 'arcsin') { arg = Q(sgn * t[1], t[2]); x = Q(t[0], t[2]); y = arg; }
      else if (f2 === 'arccos') { arg = Q(sgn * t[0], t[2]); x = arg; y = Q(t[1], t[2]); }
      else { arg = Q(sgn * t[1], t[0]); x = Q(t[0], t[2]); y = Q(sgn * t[1], t[2]); }
      if (out2 === INV[f2]) out2 = R.pick(['sin', 'cos', 'tan'].filter(function (z) { return z !== INV[f2]; }));
      var ans = out2 === 'sin' ? y : out2 === 'cos' ? x : y.div(x);
      var phiQ = f2 === 'arccos' ? (sgn > 0 ? 'I' : 'II') : (sgn > 0 ? 'I' : 'IV');
      var tri = f2 === 'arcsin' ? 'opposite $' + Math.abs(arg.num()) + '$, hypotenuse $' + t[2] + '$, so the adjacent side is $\\sqrt{' + t[2] + '^2 - ' + t[1] + '^2} = ' + t[0] + '$' : f2 === 'arccos' ? 'adjacent $' + t[0] + '$, hypotenuse $' + t[2] + '$, so the opposite side is $\\sqrt{' + t[2] + '^2 - ' + t[0] + '^2} = ' + t[1] + '$' : 'opposite $' + t[1] + '$, adjacent $' + t[0] + '$, so the hypotenuse is $\\sqrt{' + t[0] + '^2 + ' + t[1] + '^2} = ' + t[2] + '$';
      return {
        q: 'Find the exact value of $\\' + out2 + '\\left(' + invTex(f2, arg.toTex(), 0) + '\\right)$.',
        a: numA(ans.toPlain()),
        steps: ['Let $\\theta = ' + invTex(f2, arg.toTex(), 0) + '$. Then $\\' + INV[f2] + '\\theta = ' + arg.toTex() + '$ and $\\theta$ is in $' + INVRANGE[f2] + '$, so it is in Quadrant ' + phiQ + '.',
          'Draw a right triangle for the reference angle: ' + tri + '.',
          'In Quadrant ' + phiQ + ', $\\cos\\theta = ' + x.toTex() + '$ and $\\sin\\theta = ' + y.toTex() + '$.',
          'So $\\' + out2 + '\\theta = ' + ans.toTex() + '$.'],
        hint: 'Name the angle $\\theta$, draw its triangle, and use the range of $\\' + f2 + '$ to fix the signs.'
      };
    }
    var forms = [
      ['cos', 'arctan', '1/sqrt(1+x^2)', 'adjacent $1$, opposite $x$, hypotenuse $\\sqrt{1 + x^2}$'],
      ['sin', 'arctan', 'x/sqrt(1+x^2)', 'adjacent $1$, opposite $x$, hypotenuse $\\sqrt{1 + x^2}$'],
      ['sin', 'arccos', 'sqrt(1-x^2)', 'adjacent $x$, hypotenuse $1$, opposite $\\sqrt{1 - x^2}$'],
      ['cos', 'arcsin', 'sqrt(1-x^2)', 'opposite $x$, hypotenuse $1$, adjacent $\\sqrt{1 - x^2}$'],
      ['tan', 'arcsin', 'x/sqrt(1-x^2)', 'opposite $x$, hypotenuse $1$, adjacent $\\sqrt{1 - x^2}$'],
      ['sec', 'arctan', 'sqrt(1+x^2)', 'adjacent $1$, opposite $x$, hypotenuse $\\sqrt{1 + x^2}$'],
      ['tan', 'arccos', 'sqrt(1-x^2)/x', 'adjacent $x$, hypotenuse $1$, opposite $\\sqrt{1 - x^2}$']
    ];
    var F = R.pick(forms), ka = R.int(2, 6);
    if (R.chance(0.6)) { // the same idea with x/a inside
      var FA = { 'cos arctan': [ka + '/sqrt(' + ka * ka + '+x^2)', 'adjacent $' + ka + '$, opposite $x$, hypotenuse $\\sqrt{' + ka * ka + ' + x^2}$'], 'sin arctan': ['x/sqrt(' + ka * ka + '+x^2)', 'adjacent $' + ka + '$, opposite $x$, hypotenuse $\\sqrt{' + ka * ka + ' + x^2}$'],
        'sin arccos': ['sqrt(' + ka * ka + '-x^2)/' + ka, 'adjacent $x$, hypotenuse $' + ka + '$, opposite $\\sqrt{' + ka * ka + ' - x^2}$'], 'cos arcsin': ['sqrt(' + ka * ka + '-x^2)/' + ka, 'opposite $x$, hypotenuse $' + ka + '$, adjacent $\\sqrt{' + ka * ka + ' - x^2}$'],
        'tan arcsin': ['x/sqrt(' + ka * ka + '-x^2)', 'opposite $x$, hypotenuse $' + ka + '$, adjacent $\\sqrt{' + ka * ka + ' - x^2}$'], 'sec arctan': ['sqrt(' + ka * ka + '+x^2)/' + ka, 'adjacent $' + ka + '$, opposite $x$, hypotenuse $\\sqrt{' + ka * ka + ' + x^2}$'],
        'tan arccos': ['sqrt(' + ka * ka + '-x^2)/x', 'adjacent $x$, hypotenuse $' + ka + '$, opposite $\\sqrt{' + ka * ka + ' - x^2}$'] }[F[0] + ' ' + F[1]];
      return {
        q: 'Write $\\' + F[0] + '\\left(\\' + F[1] + '\\frac{x}{' + ka + '}\\right)$ as an algebraic expression in $x$ (no trig functions).',
        a: { t: 'expr', v: FA[0], vars: ['x'] },
        steps: ['Let $\\theta = \\' + F[1] + '\\frac{x}{' + ka + '}$, so $\\' + INV[F[1]] + '\\theta = \\frac{x}{' + ka + '}$.',
          'Draw a right triangle with ' + FA[1] + ' (Pythagorean theorem).',
          'Read off $\\' + F[0] + '\\theta = ' + T.plain(FA[0]) + '$. ' + (F[1] === 'arccos' ? 'On $[0, \\pi]$ sine is never negative, so the root is positive.' : 'On the range of $\\' + F[1] + '$, cosine is never negative, so the signs work for negative $x$ too.')],
        hint: 'Call the angle $\\theta$ and build a right triangle from $\\' + INV[F[1]] + '\\theta = \\frac{x}{' + ka + '}$.'
      };
    }
    return {
      q: 'Write $\\' + F[0] + '\\left(\\' + F[1] + ' x\\right)$ as an algebraic expression in $x$ (no trig functions).',
      a: { t: 'expr', v: F[2], vars: ['x'] },
      steps: ['Let $\\theta = \\' + F[1] + ' x$, so $\\' + INV[F[1]] + '\\theta = x' + (F[1] === 'arctan' ? ' = \\frac{x}{1}' : ' = \\frac{x}{1}') + '$.',
        'Draw a right triangle with ' + F[3] + ' (Pythagorean theorem).',
        'Read off $\\' + F[0] + '\\theta = ' + T.plain(F[2]) + '$. ' + (F[1] === 'arccos' ? 'On $[0, \\pi]$ sine is never negative, so the root is positive.' : 'On the range of $\\' + F[1] + '$, cosine is never negative, so the signs work for negative $x$ too.')],
      hint: 'Call the angle $\\theta$ and build a right triangle from $\\' + INV[F[1]] + '\\theta = \\frac{x}{1}$.'
    };
  });

  // ======================= 03-identities.js
  // ===================================================================== Unit 3: Identities and Equations

  function degQ(deg) { return Q.from(deg).div(180); }                     // angle in degrees (may be 22.5) -> multiple of pi
  function radTexQ(deg) { var q = degQ(deg); return piTex(q.num(), q.den()); }
  function radPlainQ(deg) { var q = degQ(deg); return piPlain(q.num(), q.den()); }
  function degTexQ(deg) { return T.num(deg) + '^\\circ'; }
  function angTexQ(deg, mode) { return mode === 'deg' ? degTexQ(deg) : radTexQ(deg); }
  function fnAngQ(fn, deg, mode) { return fnTex(fn, angTexQ(deg, mode)); }
  // all x in [0, 360) (multiples of 2.5 degrees) where f(x in radians) = 0
  function solveScan(f) { var out = []; for (var k = 0; k < 144; k++) { var d = k * 2.5, v = f(d * PI / 180); if (isFinite(v) && Math.abs(v) < 1e-9) out.push(d); } return out; }
  var DOMS = [{ lo: 0, hi: 360, a: true, b: false, tex: '0 \\le x < 2\\pi', iv: '[0, 2\\pi)' }, { lo: 0, hi: 180, a: true, b: true, tex: '0 \\le x \\le \\pi', iv: '[0, \\pi]' }, { lo: -180, hi: 180, a: false, b: true, tex: '-\\pi < x \\le \\pi', iv: '(-\\pi, \\pi]' }];
  function pickDom(R, ctx) { return R.chance(ctx.level >= 2 ? 0.4 : 0.3) ? R.pick(DOMS.slice(1)) : DOMS[0]; }
  function solveD(f, D) { var out = []; for (var k = Math.ceil(D.lo / 2.5); k * 2.5 <= D.hi; k++) { var d = k * 2.5; if ((d === D.lo && !D.a) || (d === D.hi && !D.b)) continue; var v = f(d * PI / 180); if (isFinite(v) && Math.abs(v) < 1e-9) out.push(d); } return out; }
  function solSet(degs) { return ord(degs).map(radPlainQ); }
  function solTex(degs) { return degs.length ? texList(ord(degs).map(radTexQ)) : '\\text{no solution}'; }
  var FNNAME = { sin: 'sine', cos: 'cosine', tan: 'tangent' };

  function varSwap(R, ctx) { // the angle in an identity: x, theta, t, or 2x / 3theta at higher levels
    var v = R.pick(['x', 'x', 'theta', 't']), m = ctx.level >= 2 && R.chance(0.35) ? R.pick([2, 3]) : 1;
    var vt = v === 'theta' ? '\\theta' : v;
    return { v: v, t: m === 1 ? vt : m + vt, p: m === 1 ? v : '(' + m + '*' + v + ')', vt: vt };
  }
  G('pre.fundamental-identities', function (R, ctx) {
    var L1 = [
      ['\\sin x\\cot x', 'cos(x)', '\\cos x', ['Write $\\cot x = \\dfrac{\\cos x}{\\sin x}$.', '$\\sin x \\cdot \\dfrac{\\cos x}{\\sin x} = \\cos x$ (the $\\sin x$ cancels).']],
      ['\\tan x\\cos x', 'sin(x)', '\\sin x', ['Write $\\tan x = \\dfrac{\\sin x}{\\cos x}$.', '$\\dfrac{\\sin x}{\\cos x} \\cdot \\cos x = \\sin x$.']],
      ['\\sec x\\cos x', '1', '1', ['Write $\\sec x = \\dfrac{1}{\\cos x}$.', '$\\dfrac{1}{\\cos x} \\cdot \\cos x = 1$.']],
      ['\\cos x\\csc x', 'cot(x)', '\\cot x', ['Write $\\csc x = \\dfrac{1}{\\sin x}$.', '$\\cos x \\cdot \\dfrac{1}{\\sin x} = \\dfrac{\\cos x}{\\sin x} = \\cot x$.']],
      ['\\dfrac{\\tan x}{\\sec x}', 'sin(x)', '\\sin x', ['Write both in sines and cosines: $\\dfrac{\\sin x / \\cos x}{1 / \\cos x}$.', 'Multiply top and bottom by $\\cos x$: $\\sin x$.']],
      ['\\dfrac{\\sin x}{\\csc x}', 'sin(x)^2', '\\sin^2 x', ['Write $\\csc x = \\dfrac{1}{\\sin x}$.', 'Dividing by $\\frac{1}{\\sin x}$ is multiplying by $\\sin x$: $\\sin x \\cdot \\sin x = \\sin^2 x$.']],
      ['\\cot x\\sec x', 'csc(x)', '\\csc x', ['$\\dfrac{\\cos x}{\\sin x} \\cdot \\dfrac{1}{\\cos x} = \\dfrac{1}{\\sin x}$.', 'That is $\\csc x$.']],
      ['\\dfrac{\\csc x}{\\cot x}', 'sec(x)', '\\sec x', ['$\\dfrac{1/\\sin x}{\\cos x/\\sin x}$; multiply top and bottom by $\\sin x$.', '$\\dfrac{1}{\\cos x} = \\sec x$.']],
      ['\\csc x\\sin x', '1', '1', ['Write $\\csc x = \\dfrac{1}{\\sin x}$.', '$\\dfrac{1}{\\sin x} \\cdot \\sin x = 1$.']],
      ['\\tan x\\cot x', '1', '1', ['$\\cot x = \\dfrac{1}{\\tan x}$, so the product is $1$.']],
      ['\\sin x\\sec x', 'tan(x)', '\\tan x', ['Write $\\sec x = \\dfrac{1}{\\cos x}$.', '$\\sin x \\cdot \\dfrac{1}{\\cos x} = \\dfrac{\\sin x}{\\cos x} = \\tan x$.']],
      ['\\dfrac{\\cos x}{\\cot x}', 'sin(x)', '\\sin x', ['Write $\\cot x = \\dfrac{\\cos x}{\\sin x}$.', 'Dividing by it is multiplying by $\\dfrac{\\sin x}{\\cos x}$: $\\cos x \\cdot \\dfrac{\\sin x}{\\cos x} = \\sin x$.']],
      ['\\dfrac{\\sec x}{\\csc x}', 'tan(x)', '\\tan x', ['$\\dfrac{1/\\cos x}{1/\\sin x} = \\dfrac{\\sin x}{\\cos x}$.', 'That is $\\tan x$.']],
      ['\\dfrac{\\cot x}{\\cos x}', 'csc(x)', '\\csc x', ['$\\dfrac{\\cos x / \\sin x}{\\cos x} = \\dfrac{1}{\\sin x}$.', 'That is $\\csc x$.']]
    ];
    var L2 = [
      ['\\dfrac{1 - \\cos^2 x}{\\sin x}', 'sin(x)', '\\sin x', ['From $\\sin^2 x + \\cos^2 x = 1$: $1 - \\cos^2 x = \\sin^2 x$.', '$\\dfrac{\\sin^2 x}{\\sin x} = \\sin x$.']],
      ['\\dfrac{1 - \\sin^2 x}{\\cos x}', 'cos(x)', '\\cos x', ['$1 - \\sin^2 x = \\cos^2 x$.', '$\\dfrac{\\cos^2 x}{\\cos x} = \\cos x$.']],
      ['\\dfrac{\\sec^2 x - 1}{\\tan x}', 'tan(x)', '\\tan x', ['Divide $\\sin^2 x + \\cos^2 x = 1$ by $\\cos^2 x$: $\\tan^2 x + 1 = \\sec^2 x$, so $\\sec^2 x - 1 = \\tan^2 x$.', '$\\dfrac{\\tan^2 x}{\\tan x} = \\tan x$.']],
      ['(1 + \\tan^2 x)\\cos^2 x', '1', '1', ['$1 + \\tan^2 x = \\sec^2 x = \\dfrac{1}{\\cos^2 x}$.', '$\\dfrac{1}{\\cos^2 x} \\cdot \\cos^2 x = 1$.']],
      ['\\csc x\\tan x', 'sec(x)', '\\sec x', ['$\\dfrac{1}{\\sin x} \\cdot \\dfrac{\\sin x}{\\cos x} = \\dfrac{1}{\\cos x}$.', 'That is $\\sec x$.']],
      ['\\cos^2 x\\,(\\sec^2 x - 1)', 'sin(x)^2', '\\sin^2 x', ['$\\sec^2 x - 1 = \\tan^2 x = \\dfrac{\\sin^2 x}{\\cos^2 x}$.', '$\\cos^2 x \\cdot \\dfrac{\\sin^2 x}{\\cos^2 x} = \\sin^2 x$.']],
      ['\\sin x + \\cos x\\cot x', 'csc(x)', '\\csc x', ['$\\cos x \\cot x = \\dfrac{\\cos^2 x}{\\sin x}$.', 'Common denominator: $\\dfrac{\\sin^2 x + \\cos^2 x}{\\sin x} = \\dfrac{1}{\\sin x} = \\csc x$.']],
      ['\\sec x - \\sin x\\tan x', 'cos(x)', '\\cos x', ['$\\sin x \\tan x = \\dfrac{\\sin^2 x}{\\cos x}$.', '$\\dfrac{1 - \\sin^2 x}{\\cos x} = \\dfrac{\\cos^2 x}{\\cos x} = \\cos x$.']]
    ];
    var L3 = [
      ['(\\sin x + \\cos x)^2 - 2\\sin x\\cos x', '1', '1', ['Expand: $\\sin^2 x + 2\\sin x\\cos x + \\cos^2 x - 2\\sin x\\cos x$.', 'The middle terms cancel, leaving $\\sin^2 x + \\cos^2 x = 1$.']],
      ['\\dfrac{1}{1 - \\cos x} + \\dfrac{1}{1 + \\cos x}', '2*csc(x)^2', '2\\csc^2 x', ['Common denominator $(1 - \\cos x)(1 + \\cos x) = 1 - \\cos^2 x = \\sin^2 x$.', 'Numerator: $(1 + \\cos x) + (1 - \\cos x) = 2$, so the sum is $\\dfrac{2}{\\sin^2 x} = 2\\csc^2 x$.']],
      ['\\tan x + \\cot x', 'sec(x)*csc(x)', '\\sec x\\csc x', ['$\\dfrac{\\sin x}{\\cos x} + \\dfrac{\\cos x}{\\sin x} = \\dfrac{\\sin^2 x + \\cos^2 x}{\\sin x\\cos x}$.', '$= \\dfrac{1}{\\sin x\\cos x} = \\sec x\\csc x$.']],
      ['\\sin^4 x - \\cos^4 x', 'sin(x)^2-cos(x)^2', '\\sin^2 x - \\cos^2 x', ['Difference of squares: $(\\sin^2 x + \\cos^2 x)(\\sin^2 x - \\cos^2 x)$.', 'The first factor is $1$, so the result is $\\sin^2 x - \\cos^2 x$.']],
      ['\\dfrac{\\cos x}{1 - \\sin x} - \\dfrac{\\cos x}{1 + \\sin x}', '2*tan(x)', '2\\tan x', ['Common denominator $1 - \\sin^2 x = \\cos^2 x$.', 'Numerator: $\\cos x(1 + \\sin x) - \\cos x(1 - \\sin x) = 2\\sin x\\cos x$.', '$\\dfrac{2\\sin x\\cos x}{\\cos^2 x} = 2\\tan x$.']],
      ['\\dfrac{\\sin x}{1 + \\cos x} + \\dfrac{1 + \\cos x}{\\sin x}', '2*csc(x)', '2\\csc x', ['Common denominator $\\sin x(1 + \\cos x)$. Numerator: $\\sin^2 x + (1 + \\cos x)^2 = \\sin^2 x + 1 + 2\\cos x + \\cos^2 x = 2 + 2\\cos x$.', '$\\dfrac{2(1 + \\cos x)}{\\sin x(1 + \\cos x)} = \\dfrac{2}{\\sin x} = 2\\csc x$.']],
      ['\\dfrac{1 - \\sin^2 x}{1 - \\cos^2 x}', 'cot(x)^2', '\\cot^2 x', ['$1 - \\sin^2 x = \\cos^2 x$ and $1 - \\cos^2 x = \\sin^2 x$.', '$\\dfrac{\\cos^2 x}{\\sin^2 x} = \\cot^2 x$.']],
      ['\\sec x\\csc x - \\cot x', 'tan(x)', '\\tan x', ['$\\dfrac{1}{\\cos x\\sin x} - \\dfrac{\\cos x}{\\sin x} = \\dfrac{1 - \\cos^2 x}{\\sin x\\cos x}$.', '$= \\dfrac{\\sin^2 x}{\\sin x\\cos x} = \\dfrac{\\sin x}{\\cos x} = \\tan x$.']],
      ['(\\sec x - \\tan x)(\\sec x + \\tan x)', '1', '1', ['Multiply out: $\\sec^2 x - \\tan^2 x$.', 'From $1 + \\tan^2 x = \\sec^2 x$, this is $1$.']]
    ];
    var it = R.pick(by(ctx, L1.concat(L2.slice(0, 2)), L2.concat(L1.slice(4)), L3.concat(L2.slice(2))));
    var V = varSwap(R, ctx), sw = function (s) { return s.replace(/\bx\b/g, V.t); }, kf = ctx.level < 3 && !/^\d/.test(it[2]) || it[2] === '1' ? R.pick([1, 1, 2, 3, 4, 5]) : 1;
    var eT = kf === 1 ? sw(it[0]) : kf + '\\left(' + sw(it[0]) + '\\right)', rT = kf === 1 ? sw(it[2]) : it[2] === '1' ? String(kf) : kf + sw(it[2]);
    return {
      q: 'Simplify $' + eT + '$ to a single trig function, a constant, or a short product.',
      a: { t: 'expr', v: (kf === 1 ? '' : kf + '*') + '(' + it[1].replace(/\bx\b/g, V.p) + ')', vars: [V.v] },
      steps: (kf === 1 ? [] : ['Simplify the part in parentheses; the factor $' + kf + '$ just comes along.']).concat(it[3].map(sw)).concat(['So $' + eT + ' = ' + rT + '$.']),
      hint: 'Rewrite everything in terms of sine and cosine, then look for $\\sin^2 + \\cos^2 = 1$.'
    };
  });

  var IDS = [ // [left TeX, right TeX, is identity, reason]
    ['\\sin x\\tan x + \\cos x', '\\sec x', true, '$\\dfrac{\\sin^2 x}{\\cos x} + \\cos x = \\dfrac{\\sin^2 x + \\cos^2 x}{\\cos x} = \\dfrac{1}{\\cos x}$.'],
    ['(1 - \\sin x)(1 + \\sin x)', '\\cos^2 x', true, 'Multiply out: $1 - \\sin^2 x = \\cos^2 x$.'],
    ['\\sin x + \\cos x', '1', false, 'At $x = \\frac{\\pi}{4}$ the left side is $\\sqrt{2} \\ne 1$. (It is the squares that add to $1$.)'],
    ['\\tan x + \\cot x', '\\sec x\\csc x', true, '$\\dfrac{\\sin^2 x + \\cos^2 x}{\\sin x\\cos x} = \\dfrac{1}{\\sin x\\cos x}$.'],
    ['\\sec x - \\cos x', '\\sin x\\tan x', true, '$\\dfrac{1 - \\cos^2 x}{\\cos x} = \\dfrac{\\sin^2 x}{\\cos x} = \\sin x\\tan x$.'],
    ['\\sin^2 x - \\cos^2 x', '1', false, 'At $x = 0$ the left side is $0 - 1 = -1$.'],
    ['\\csc x - \\sin x', '\\cos x\\cot x', true, '$\\dfrac{1 - \\sin^2 x}{\\sin x} = \\dfrac{\\cos^2 x}{\\sin x} = \\cos x \\cdot \\dfrac{\\cos x}{\\sin x}$.'],
    ['\\tan^2 x - \\sec^2 x', '1', false, 'From $1 + \\tan^2 x = \\sec^2 x$, the left side is $-1$, not $1$.'],
    ['\\dfrac{\\sin x}{1 - \\cos x}', '\\dfrac{1 + \\cos x}{\\sin x}', true, 'Cross-multiplying gives $\\sin^2 x = 1 - \\cos^2 x$, which is true; or multiply the left by $\\frac{1 + \\cos x}{1 + \\cos x}$.'],
    ['\\cos x\\tan x', '\\sin x', true, '$\\cos x \\cdot \\dfrac{\\sin x}{\\cos x} = \\sin x$.'],
    ['\\sec^2 x - \\tan^2 x', '\\sin^2 x', false, 'The left side is always $1$; at $x = 0$ the right side is $0$.'],
    ['(\\sin x + \\cos x)^2', '1 + 2\\sin x\\cos x', true, 'Expand: $\\sin^2 x + 2\\sin x\\cos x + \\cos^2 x = 1 + 2\\sin x\\cos x$.'],
    ['\\dfrac{1}{\\sin x}', '\\sec x', false, '$\\dfrac{1}{\\sin x} = \\csc x$. At $x = \\frac{\\pi}{6}$: $2 \\ne \\frac{2\\sqrt{3}}{3}$.']
  ];
  G('pre.verify-identities', function (R, ctx) {
    var kind = R.pick(by(ctx, ['tf', 'first', 'tf', 'step'], ['tf', 'step', 'first', 'simp'], ['step', 'simp', 'tf']));
    if (kind === 'tf') {
      var I = R.pick(IDS), V = varSwap(R, ctx), sw = function (s) { return s.replace(/\bx\b/g, V.t).replace(/\$x = /g, '$' + V.t + ' = '); };
      return {
        q: 'True or false: $' + sw(I[0]) + ' = ' + sw(I[1]) + '$ is an identity (true for every $' + V.t + '$ where both sides are defined).',
        a: { t: 'tf', v: I[2] },
        steps: [I[2] ? 'Work on one side until it becomes the other:' : 'One value of $' + V.t + '$ where the sides differ is enough to show it is not an identity:', sw(I[3])],
        hint: 'Try a value such as $x = \\frac{\\pi}{4}$ or $x = 0$ first. If the sides agree, rewrite in sines and cosines.'
      };
    }
    if (kind === 'first') {
      var F = R.pick([
        ['\\tan x + \\cot x = \\sec x\\csc x', 'Rewrite the left side as $\\dfrac{\\sin x}{\\cos x} + \\dfrac{\\cos x}{\\sin x}$', ['Multiply both sides by $\\sin x\\cos x$', 'Square both sides', 'Subtract $\\tan x$ from both sides']],
        ['\\dfrac{1 - \\cos^2 x}{\\sin x} = \\sin x', 'Replace $1 - \\cos^2 x$ with $\\sin^2 x$ on the left side', ['Multiply both sides by $\\sin x$', 'Divide both sides by $\\sin x$', 'Add $\\cos^2 x$ to both sides']],
        ['\\sec x - \\cos x = \\sin x\\tan x', 'Write $\\sec x$ as $\\dfrac{1}{\\cos x}$ and combine the left side over $\\cos x$', ['Multiply both sides by $\\cos x$', 'Add $\\cos x$ to both sides', 'Square both sides']],
        ['\\csc x - \\sin x = \\cos x\\cot x', 'Write $\\csc x$ as $\\dfrac{1}{\\sin x}$ and combine the left side over $\\sin x$', ['Multiply both sides by $\\sin x$', 'Add $\\sin x$ to both sides', 'Divide both sides by $\\cot x$']]
      ]);
      return {
        q: 'You want to prove the identity $' + F[0] + '$. Which first step is a valid way to start the proof?',
        a: mcq(F[1], F[2]),
        steps: ['A proof must not assume the statement it is proving. Doing the same thing to both sides treats the identity as an equation that is already known to be true.',
          'Instead, start from one side and rewrite it, step by step, with known identities until it matches the other side.',
          'So the valid start is: ' + F[1].charAt(0).toLowerCase() + F[1].slice(1) + '.'],
        hint: 'Work on one side only.'
      };
    }
    if (kind === 'step') {
      var S = R.pick([
        ['\\dfrac{1 - \\cos^2 x}{\\sin x} = \\sin x', 'the numerator $1 - \\cos^2 x$', 'sin(x)^2', '\\sin^2 x', 'by the Pythagorean identity'],
        ['\\sin x\\tan x + \\cos x = \\sec x', 'the term $\\sin x\\tan x$, written over $\\cos x$', 'sin(x)^2/cos(x)', '\\dfrac{\\sin^2 x}{\\cos x}', 'since $\\tan x = \\frac{\\sin x}{\\cos x}$'],
        ['\\dfrac{\\sec^2 x - 1}{\\sec^2 x} = \\sin^2 x', 'the numerator $\\sec^2 x - 1$', 'tan(x)^2', '\\tan^2 x', 'from $1 + \\tan^2 x = \\sec^2 x$'],
        ['\\tan x + \\cot x = \\sec x\\csc x', 'the left side, as one fraction over $\\sin x\\cos x$', '(sin(x)^2+cos(x)^2)/(sin(x)*cos(x))', '\\dfrac{\\sin^2 x + \\cos^2 x}{\\sin x\\cos x}', 'by finding a common denominator'],
        ['\\cos^2 x - \\sin^2 x = 2\\cos^2 x - 1', 'the term $\\sin^2 x$, written using cosine', '1-cos(x)^2', '1 - \\cos^2 x', 'from the Pythagorean identity']
      ]);
      var VS = varSwap(R, ctx), sws = function (s) { return s.replace(/\bx\b/g, VS.t); };
      return {
        q: 'To prove $' + sws(S[0]) + '$, the first step rewrites ' + sws(S[1]) + '. What does it become?',
        a: { t: 'expr', v: S[2].replace(/\bx\b/g, VS.p), vars: [VS.v] },
        steps: ['It becomes $' + sws(S[3]) + '$, ' + S[4] + '.', 'The proof then continues on the same side until it matches the other side.'],
        hint: 'Use $\\sin^2 x + \\cos^2 x = 1$ or a quotient identity.'
      };
    }
    var Sm = R.pick([
      ['\\dfrac{\\sin^2 x}{1 - \\cos x}', '1+cos(x)', '1 + \\cos x', 'Replace $\\sin^2 x$ with $1 - \\cos^2 x = (1 - \\cos x)(1 + \\cos x)$ and cancel $1 - \\cos x$.'],
      ['\\dfrac{\\cos^2 x}{1 + \\sin x}', '1-sin(x)', '1 - \\sin x', 'Replace $\\cos^2 x$ with $1 - \\sin^2 x = (1 - \\sin x)(1 + \\sin x)$ and cancel $1 + \\sin x$.'],
      ['\\dfrac{\\tan^2 x}{\\sec x + 1}', 'sec(x)-1', '\\sec x - 1', 'Replace $\\tan^2 x$ with $\\sec^2 x - 1 = (\\sec x - 1)(\\sec x + 1)$ and cancel $\\sec x + 1$.'],
      ['\\dfrac{1 - \\sin^2 x}{1 - \\cos^2 x}', 'cot(x)^2', '\\cot^2 x', 'The top is $\\cos^2 x$ and the bottom is $\\sin^2 x$; their quotient is $\\cot^2 x$.'],
      ['\\dfrac{\\sin^2 x}{1 + \\cos x}', '1-cos(x)', '1 - \\cos x', 'Replace $\\sin^2 x$ with $1 - \\cos^2 x = (1 - \\cos x)(1 + \\cos x)$ and cancel $1 + \\cos x$.'],
      ['\\dfrac{\\cos^2 x}{1 - \\sin x}', '1+sin(x)', '1 + \\sin x', 'Replace $\\cos^2 x$ with $1 - \\sin^2 x = (1 - \\sin x)(1 + \\sin x)$ and cancel $1 - \\sin x$.'],
      ['\\dfrac{\\tan^2 x}{\\sec x - 1}', 'sec(x)+1', '\\sec x + 1', 'Replace $\\tan^2 x$ with $\\sec^2 x - 1 = (\\sec x - 1)(\\sec x + 1)$ and cancel $\\sec x - 1$.'],
      ['\\dfrac{\\cot^2 x}{\\csc x + 1}', 'csc(x)-1', '\\csc x - 1', 'Replace $\\cot^2 x$ with $\\csc^2 x - 1 = (\\csc x - 1)(\\csc x + 1)$ and cancel $\\csc x + 1$.'],
      ['\\dfrac{\\cot^2 x}{\\csc x - 1}', 'csc(x)+1', '\\csc x + 1', 'Replace $\\cot^2 x$ with $\\csc^2 x - 1 = (\\csc x - 1)(\\csc x + 1)$ and cancel $\\csc x - 1$.'],
      ['\\dfrac{\\sec^2 x - 1}{\\sec^2 x}', 'sin(x)^2', '\\sin^2 x', 'The top is $\\tan^2 x$, and $\\dfrac{\\tan^2 x}{\\sec^2 x} = \\dfrac{\\sin^2 x}{\\cos^2 x}\\cdot\\cos^2 x = \\sin^2 x$.']
    ]), VM = varSwap(R, ctx), swm = function (s) { return s.replace(/\bx\b/g, VM.t); };
    return {
      q: 'To verify an identity, you rewrite the left side $' + swm(Sm[0]) + '$ until it is as simple as possible. What is the simplest form?',
      a: { t: 'expr', v: Sm[1].replace(/\bx\b/g, VM.p), vars: [VM.v] },
      steps: [swm(Sm[3]), 'So the left side equals $' + swm(Sm[2]) + '$.'],
      hint: 'Factor a difference of squares after using a Pythagorean identity.'
    };
  });

  // a + b decompositions for sums/differences: [angle, A, B, sign]
  var SUMS = [[15, 45, 30, -1], [75, 45, 30, 1], [105, 60, 45, 1], [165, 120, 45, 1], [195, 150, 45, 1], [255, 210, 45, 1], [285, 240, 45, 1], [345, 300, 45, 1], [15, 60, 45, -1], [105, 135, 30, -1], [75, 120, 45, -1], [165, 135, 30, 1], [-15, 30, 45, -1], [-75, -120, 45, 1], [-105, -60, 45, -1], [-165, -120, 45, -1], [375, 330, 45, 1], [435, 390, 45, 1], [225 - 30, 225, 30, -1], [315 - 30, 315, 30, -1]];
  function sumVal(fn, A, B, s) { // exact Sd of fn(A + sB)
    var sA = sdTrig('sin', A), cA = sdTrig('cos', A), sB = sdScale(sdTrig('sin', B), s), cB = sdTrig('cos', B);
    var sn = sdAdd(sdMul(sA, cB), sdMul(cA, sB)), cs = sdSub(sdMul(cA, cB), sdMul(sA, sB));
    return fn === 'sin' ? sn : fn === 'cos' ? cs : sdDiv(sn, cs);
  }
  G('pre.sum-difference-formulas', function (R, ctx) {
    var kind = R.pick(by(ctx, ['exact', 'recog', 'exact'], ['exact', 'given', 'recog'], ['given', 'exact', 'recog', 'tangiv']));
    var FORM = { sin: '\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B', cos: '\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B', tan: '\\tan(A \\pm B) = \\dfrac{\\tan A \\pm \\tan B}{1 \\mp \\tan A\\tan B}' };
    if (kind === 'exact') {
      var S = R.pick(SUMS), fn = R.pick(by(ctx, ['sin', 'cos'], ['sin', 'cos', 'tan'], ['sin', 'cos', 'tan'])), mode = R.pick(by(ctx, ['deg', 'deg', 'rad'], ['deg', 'rad'], ['rad']));
      var v = sumVal(fn, S[1], S[2], S[3]), sg = S[3] > 0 ? '+' : '-';
      var st = ['Write $' + angTex(S[0], mode) + ' = ' + angTex(S[1], mode) + ' ' + sg + ' ' + angTex(S[2], mode) + '$, two angles with known exact values.', 'Use $' + FORM[fn] + '$.'];
      if (fn === 'tan') st.push('$\\tan ' + angTex(S[1], mode) + ' = ' + trigDeg('tan', S[1]).t + '$ and $\\tan ' + angTex(S[2], mode) + ' = ' + trigDeg('tan', S[2]).t + '$, so $' + fnAng('tan', S[0], mode) + ' = \\dfrac{' + trigDeg('tan', S[1]).t + ' ' + sg + ' ' + pp(trigDeg('tan', S[2]).t) + '}{1 ' + (S[3] > 0 ? '-' : '+') + ' ' + pp(trigDeg('tan', S[1]).t) + pp(trigDeg('tan', S[2]).t) + '}$; rationalize to get $' + sdTex(v) + '$.');
      else {
        var p1 = fn === 'sin' ? [['sin', S[1]], ['cos', S[2]], ['cos', S[1]], ['sin', S[2]]] : [['cos', S[1]], ['cos', S[2]], ['sin', S[1]], ['sin', S[2]]];
        var op = fn === 'sin' ? sg : (S[3] > 0 ? '-' : '+');
        st.push('$= ' + pp(trigDeg(p1[0][0], p1[0][1]).t) + pp(trigDeg(p1[1][0], p1[1][1]).t) + ' ' + op + ' ' + pp(trigDeg(p1[2][0], p1[2][1]).t) + pp(trigDeg(p1[3][0], p1[3][1]).t) + ' = ' + sdTex(v) + '$.');
      }
      return { q: 'Find the exact value of $' + fnAng(fn, S[0], mode) + '$.', a: numA(sdPlain(v), 'simplest'), steps: st, hint: 'Write the angle as a sum or difference of $30^\\circ$, $45^\\circ$, $60^\\circ$ or their relatives.' };
    }
    if (kind === 'recog') {
      var tot = R.pick([30, 45, 60, 90, 120, 135, 150]), sgn = R.coin() ? 1 : -1, A, B;
      do { B = R.int(1, 8) * 5; A = sgn > 0 ? tot - B : tot + B; } while (A <= 0 || A === B || A % 15 === 0);
      var fn2 = R.pick(['sin', 'cos']), v2 = trigDeg(fn2, tot), ex;
      if (fn2 === 'sin') ex = '\\sin ' + T.deg(A) + '\\cos ' + T.deg(B) + (sgn > 0 ? ' + ' : ' - ') + '\\cos ' + T.deg(A) + '\\sin ' + T.deg(B);
      else ex = '\\cos ' + T.deg(A) + '\\cos ' + T.deg(B) + (sgn > 0 ? ' - ' : ' + ') + '\\sin ' + T.deg(A) + '\\sin ' + T.deg(B);
      return {
        q: 'Find the exact value of $' + ex + '$.',
        a: numA(v2.p, 'simplest'),
        steps: ['This matches the ' + (fn2 === 'sin' ? 'sine' : 'cosine') + ' ' + (sgn > 0 ? 'sum' : 'difference') + ' formula, read backward: $' + FORM[fn2] + '$.',
          'So it equals $\\' + fn2 + '(' + T.deg(A) + (sgn > 0 ? ' + ' : ' - ') + T.deg(B) + ') = ' + fnAng(fn2, tot, 'deg') + ' = ' + v2.t + '$.'],
        hint: 'Neither angle is special, but their ' + (sgn > 0 ? 'sum' : 'difference') + ' is. Which formula has this pattern?'
      };
    }
    if (kind === 'given') {
      var t1 = triple(R, 2), t2 = triple(R, 2);
      while (t2[2] === t1[2]) t2 = triple(R, 2);
      var qa = R.pick([1, 2]), qb = R.pick([1, 4]), sa = quadSigns(qa), sb = quadSigns(qb);
      var ca = Q(sa[0] * t1[0], t1[2]), sna = Q(sa[1] * t1[1], t1[2]), cb = Q(sb[0] * t2[0], t2[2]), snb = Q(sb[1] * t2[1], t2[2]);
      var fn3 = R.pick(['sin', 'cos']), plus = R.coin();
      var val = fn3 === 'sin' ? (plus ? sna.mul(cb).add(ca.mul(snb)) : sna.mul(cb).sub(ca.mul(snb))) : (plus ? ca.mul(cb).sub(sna.mul(snb)) : ca.mul(cb).add(sna.mul(snb)));
      var nm = fn3 + '(\\alpha ' + (plus ? '+' : '-') + ' \\beta)';
      return {
        q: 'Given $\\sin\\alpha = ' + sna.toTex() + '$ with $\\alpha$ in Quadrant ' + QN[qa] + ', and $\\cos\\beta = ' + cb.toTex() + '$ with $\\beta$ in Quadrant ' + QN[qb] + ', find $\\' + nm + '$.',
        a: numA(val.toPlain()),
        steps: ['Find the missing values with $\\sin^2 + \\cos^2 = 1$ and the quadrant signs: $\\cos\\alpha = ' + ca.toTex() + '$ and $\\sin\\beta = ' + snb.toTex() + '$.',
          fn3 === 'sin' ? '$\\' + nm + ' = \\sin\\alpha\\cos\\beta ' + (plus ? '+' : '-') + ' \\cos\\alpha\\sin\\beta$.' : '$\\' + nm + ' = \\cos\\alpha\\cos\\beta ' + (plus ? '-' : '+') + ' \\sin\\alpha\\sin\\beta$.',
          fn3 === 'sin' ? '$= ' + pp(sna.toTex()) + pp(cb.toTex()) + (plus ? ' + ' : ' - ') + pp(ca.toTex()) + pp(snb.toTex()) + ' = ' + val.toTex() + '$.' : '$= ' + pp(ca.toTex()) + pp(cb.toTex()) + (plus ? ' - ' : ' + ') + pp(sna.toTex()) + pp(snb.toTex()) + ' = ' + val.toTex() + '$.'],
        hint: 'First find $\\cos\\alpha$ and $\\sin\\beta$, minding the signs in each quadrant.'
      };
    }
    var ta = Q(R.pick([1, 2, 3, -1, -2, 1, 2]), R.pick([1, 2, 3])), tb = Q(R.pick([1, 2, 3, -1, 1]), R.pick([1, 2, 3, 4]));
    var plus2 = R.coin(), den = plus2 ? Q(1).sub(ta.mul(tb)) : Q(1).add(ta.mul(tb));
    if (den.isZero()) { tb = tb.add(1); den = plus2 ? Q(1).sub(ta.mul(tb)) : Q(1).add(ta.mul(tb)); }
    var numr = plus2 ? ta.add(tb) : ta.sub(tb), tv = numr.div(den);
    return {
      q: 'Given $\\tan\\alpha = ' + ta.toTex() + '$ and $\\tan\\beta = ' + tb.toTex() + '$, find $\\tan(\\alpha ' + (plus2 ? '+' : '-') + ' \\beta)$.',
      a: numA(tv.toPlain()),
      steps: ['$\\tan(\\alpha ' + (plus2 ? '+' : '-') + ' \\beta) = \\dfrac{\\tan\\alpha ' + (plus2 ? '+' : '-') + ' \\tan\\beta}{1 ' + (plus2 ? '-' : '+') + ' \\tan\\alpha\\tan\\beta}$ (divide the sine formula by the cosine formula).',
        '$= \\dfrac{' + numr.toTex() + '}{' + den.toTex() + '} = ' + tv.toTex() + '$.'],
      hint: 'Use the tangent sum or difference formula; watch the sign in the denominator.'
    };
  });

  G('pre.double-angle', function (R, ctx) {
    var kind = R.pick(by(ctx, ['given', 'recog', 'given'], ['given', 'recog', 'pick'], ['given', 'recog', 'pick', 'cos3']));
    if (kind === 'given') {
      var t = triple(R, by(ctx, 1, 2, 3)), qd = R.int(1, 4), sg = quadSigns(qd), c = Q(sg[0] * t[0], t[2]), s = Q(sg[1] * t[1], t[2]);
      var fn = R.pick(by(ctx, ['sin', 'cos'], ['sin', 'cos', 'tan'], ['tan', 'sin', 'cos'])), giveSin = R.coin(), mode = R.pick(['rad', 'deg']);
      var s2 = s.mul(c).mul(2), c2 = c.mul(c).sub(s.mul(s)), t2 = s2.div(c2), ans = fn === 'sin' ? s2 : fn === 'cos' ? c2 : t2;
      var st = ['First the other value: $' + (giveSin ? '\\cos\\theta = ' + c.toTex() : '\\sin\\theta = ' + s.toTex()) + '$ (from $\\sin^2\\theta + \\cos^2\\theta = 1$, signed for Quadrant ' + QN[qd] + ').'];
      if (fn === 'sin') st.push('$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta = 2' + pp(s.toTex()) + pp(c.toTex()) + ' = ' + s2.toTex() + '$.');
      else if (fn === 'cos') st.push('$\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta = ' + c.mul(c).toTex() + ' - ' + s.mul(s).toTex() + ' = ' + c2.toTex() + '$.');
      else st.push('$\\sin 2\\theta = ' + s2.toTex() + '$ and $\\cos 2\\theta = ' + c2.toTex() + '$, so $\\tan 2\\theta = \\dfrac{\\sin 2\\theta}{\\cos 2\\theta} = ' + t2.toTex() + '$.');
      return {
        q: 'Given $' + (giveSin ? '\\sin\\theta = ' + s.toTex() : '\\cos\\theta = ' + c.toTex()) + '$ and $' + quadRangeTex(qd, mode) + '$, find $\\' + fn + ' 2\\theta$.',
        a: numA(ans.toPlain()), steps: st,
        hint: fn === 'sin' ? 'You need both $\\sin\\theta$ and $\\cos\\theta$: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.' : 'Find the missing value first, with the right sign.'
      };
    }
    if (kind === 'recog') {
      var half = R.pick([15, 22.5, 75, 67.5, 105, 112.5, 165]), dbl = 2 * half, mode2 = R.pick(['deg', 'rad']);
      var F = R.pick([
        ['2\\sin A\\cos A', 'sin', '\\sin 2A = 2\\sin A\\cos A'],
        ['\\cos^2 A - \\sin^2 A', 'cos', '\\cos 2A = \\cos^2 A - \\sin^2 A'],
        ['1 - 2\\sin^2 A', 'cos', '\\cos 2A = 1 - 2\\sin^2 A'],
        ['2\\cos^2 A - 1', 'cos', '\\cos 2A = 2\\cos^2 A - 1']]);
      if (dbl % 90 === 0 && F[1] === 'tan') F[1] = 'sin';
      var v = trigDeg(F[1], dbl), At = angTexQ(half, mode2);
      var ex = F[0].replace(/A/g, ' ' + At).replace(/\\(sin|cos)(\^2)? /g, '\\$1$2 ').replace(/ \\frac/g, '\\frac');
      return {
        q: 'Find the exact value of $' + ex + '$.',
        a: numA(v.p, 'simplest'),
        steps: ['This is a double-angle formula read backward: $' + F[2] + '$.', 'So the expression is $\\' + F[1] + '\\left(2 \\cdot ' + At + '\\right) = ' + fnAng(F[1], dbl, mode2) + ' = ' + v.t + '$.'],
        hint: 'Which double-angle formula has this shape?'
      };
    }
    if (kind === 'pick') {
      var P = R.pick([
        ['\\sin 2x', '$2\\sin x\\cos x$', ['$2\\sin x$', '$\\sin^2 x$', '$\\sin x\\cos x$']],
        ['\\cos 2x', '$1 - 2\\sin^2 x$', ['$2\\cos x$', '$1 - \\sin^2 x$', '$\\cos^2 x + \\sin^2 x$']],
        ['\\cos 2x', '$2\\cos^2 x - 1$', ['$2\\cos x - 1$', '$\\cos^2 x - 1$', '$1 - 2\\cos^2 x$']],
        ['\\tan 2x', '$\\dfrac{2\\tan x}{1 - \\tan^2 x}$', ['$2\\tan x$', '$\\dfrac{2\\tan x}{1 + \\tan^2 x}$', '$\\tan^2 x$']]
      ]);
      return {
        q: 'Which expression is equal to $' + P[0] + '$ for every $x$?',
        a: mcq(P[1], P[2]),
        steps: ['Set $A = B = x$ in the sum formula: ' + (P[0] === '\\sin 2x' ? '$\\sin(x + x) = \\sin x\\cos x + \\cos x\\sin x = 2\\sin x\\cos x$.' : P[0] === '\\tan 2x' ? '$\\tan(x + x) = \\dfrac{\\tan x + \\tan x}{1 - \\tan x\\tan x}$.' : '$\\cos(x + x) = \\cos^2 x - \\sin^2 x$, and replacing one square with the Pythagorean identity gives $1 - 2\\sin^2 x$ or $2\\cos^2 x - 1$.'),
          'Check with $x = \\frac{\\pi}{4}$ or $x = \\frac{\\pi}{6}$: the right choice matches, the others do not.'],
        hint: 'Doubling the angle does not double the value. Test $x = \\frac{\\pi}{6}$.'
      };
    }
    var c0 = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4), Q(-1, 3)]);
    var c3 = c0.pow(3).mul(4).sub(c0.mul(3));
    return {
      q: 'Use $\\cos 3\\theta = \\cos(2\\theta + \\theta)$ to show $\\cos 3\\theta = 4\\cos^3\\theta - 3\\cos\\theta$, then find $\\cos 3\\theta$ when $\\cos\\theta = ' + c0.toTex() + '$.',
      a: numA(c3.toPlain()),
      steps: ['$\\cos(2\\theta + \\theta) = \\cos 2\\theta\\cos\\theta - \\sin 2\\theta\\sin\\theta = (2\\cos^2\\theta - 1)\\cos\\theta - 2\\sin^2\\theta\\cos\\theta$.',
        'Replace $\\sin^2\\theta$ with $1 - \\cos^2\\theta$: $2\\cos^3\\theta - \\cos\\theta - 2\\cos\\theta + 2\\cos^3\\theta = 4\\cos^3\\theta - 3\\cos\\theta$.',
        '$4' + T.p(c0.toTex()) + '^3 - 3' + T.p(c0.toTex()) + ' = ' + c0.pow(3).mul(4).toTex() + T.signed(c0.mul(-3)) + ' = ' + c3.toTex() + '$.'],
      hint: 'Expand with the sum formula, then use double-angle formulas.'
    };
  });

  G('pre.half-angle', function (R, ctx) {
    var kind = R.pick(by(ctx, ['exact', 'given', 'given'], ['exact', 'given', 'power'], ['given', 'exact', 'power', 'tan']));
    if (kind === 'exact' || kind === 'tan') {
      var th = R.pick([30, 45, 135, 150, 210, 225, 315, 330].concat(ctx.level > 1 ? [-30, -45, -135, -150, 390, 405, 510, 570, 675, 690] : [])), h = th / 2, fn = kind === 'tan' ? 'tan' : R.pick(['sin', 'cos']), mode = R.pick(by(ctx, ['deg', 'deg', 'rad'], ['deg', 'rad'], ['rad', 'deg']));
      var c = sdTrig('cos', th), s = sdTrig('sin', th);
      if (fn === 'tan') {
        var tv = sdDiv(sdSub(sdQ(1), c), s);
        return {
          q: 'Find the exact value of $' + fnAngQ('tan', h, mode) + '$.',
          a: numA(sdPlain(tv), 'simplest'),
          steps: ['Use $\\tan\\dfrac{\\theta}{2} = \\dfrac{1 - \\cos\\theta}{\\sin\\theta}$ with $\\theta = ' + angTex(th, mode) + '$ (no sign to choose).',
            '$= \\dfrac{1 - ' + T.p(sdTex(c)) + '}{' + sdTex(s) + '} = ' + sdTex(tv) + '$.'],
          hint: 'Double the angle to get a special angle.'
        };
      }
      var inner = fn === 'sin' ? sdSub(sdQ(1), c) : sdAdd(sdQ(1), c); // (1 -/+ cos)/2 = inner/2 ; value = sqrt(inner/2)
      var in4 = sdScale(inner, 2); // inner*2 = 2 -/+ sqrt(k) ; sqrt(inner/2) = sqrt(in4)/2
      var pos = trigNum(fn, h) > 0;
      var rad = sdPlain(in4), radT = sdTex(in4);
      var p = (pos ? '' : '-') + 'sqrt(' + rad + ')/2', t = (pos ? '' : '-') + '\\frac{\\sqrt{' + radT + '}}{2}';
      var qd = quadOf(h);
      return {
        q: 'Use a half-angle formula to find the exact value of $' + fnAngQ(fn, h, mode) + '$.',
        a: numA(p),
        steps: ['$' + angTexQ(h, mode) + '$ is half of $' + angTex(th, mode) + '$, and $\\cos ' + angTex(th, mode) + ' = ' + sdTex(c) + '$.',
          '$\\' + fn + '\\dfrac{\\theta}{2} = \\pm\\sqrt{\\dfrac{1 ' + (fn === 'sin' ? '-' : '+') + ' \\cos\\theta}{2}} = \\pm\\sqrt{\\dfrac{1 ' + (fn === 'sin' ? '-' : '+') + ' ' + T.p(sdTex(c)) + '}{2}} = \\pm\\dfrac{\\sqrt{' + radT + '}}{2}$.',
          'The sign comes from where the half angle lands: $' + angTexQ(h, mode) + '$ is in Quadrant ' + QN[qd] + ', where ' + FNNAME[fn] + ' is ' + (pos ? 'positive' : 'negative') + '.',
          'So $' + fnAngQ(fn, h, mode) + ' = ' + t + '$.'],
        hint: 'Find the sign from the quadrant of the half angle, not of the full angle.'
      };
    }
    if (kind === 'given') {
      var tr = triple(R, 3), qd2 = R.int(1, 4), sg = quadSigns(qd2), cth = Q(sg[0] * tr[0], tr[2]);
      var fn2 = R.pick(['sin', 'cos']), mode2 = R.pick(['deg', 'rad']);
      var sq = fn2 === 'sin' ? Q(1).sub(cth).div(2) : Q(1).add(cth).div(2), mag = sqrtQ(sq);
      // theta in quadrant qd2 within (0, 2pi): theta/2 in (0, pi): quadrant 1 if qd2 <= 2 else 2
      var hq = qd2 <= 2 ? 1 : 2, pos2 = fn2 === 'sin' ? true : hq === 1;
      var ans = pos2 ? mag : negX(mag);
      var hl = (qd2 - 1) * 45, hh = qd2 * 45;
      return {
        q: 'Given $\\cos\\theta = ' + cth.toTex() + '$ and $' + quadRangeTex(qd2, mode2) + '$, find $\\' + fn2 + '\\dfrac{\\theta}{2}$.',
        a: numA(ans.p, 'simplest'),
        steps: ['$\\' + fn2 + '\\dfrac{\\theta}{2} = \\pm\\sqrt{\\dfrac{1 ' + (fn2 === 'sin' ? '-' : '+') + ' \\cos\\theta}{2}} = \\pm\\sqrt{\\dfrac{1 ' + (fn2 === 'sin' ? '-' : '+') + ' ' + T.p(cth.toTex()) + '}{2}} = \\pm\\sqrt{' + sq.toTex() + '} = \\pm' + mag.t + '$.',
          'Halve the range: $' + angTex(hl, mode2) + ' < \\dfrac{\\theta}{2} < ' + angTex(hh, mode2) + '$, which is Quadrant ' + QN[hq] + '.',
          'There ' + FNNAME[fn2] + ' is ' + (pos2 ? 'positive' : 'negative') + ', so $\\' + fn2 + '\\dfrac{\\theta}{2} = ' + ans.t + '$.'],
        hint: 'Halve the inequality for $\\theta$ to find the quadrant of $\\frac{\\theta}{2}$.'
      };
    }
    var k = R.pick([2, 3, 4, 5]), fn3 = R.pick(['sin', 'cos']);
    var right = fn3 === 'sin' ? '\\dfrac{1 - \\cos ' + 2 * k + 'x}{2}' : '\\dfrac{1 + \\cos ' + 2 * k + 'x}{2}';
    var wr = fn3 === 'sin' ? ['\\dfrac{1 - \\cos ' + k + 'x}{2}', '\\dfrac{1 + \\cos ' + 2 * k + 'x}{2}', '\\dfrac{1 - \\cos ' + k * k + 'x}{2}'] : ['\\dfrac{1 + \\cos ' + k + 'x}{2}', '\\dfrac{1 - \\cos ' + 2 * k + 'x}{2}', '\\dfrac{1 + \\cos ' + k * k + 'x}{2}'];
    return {
      q: 'Which expression equals $\\' + fn3 + '^2(' + k + 'x)$ for every $x$?',
      a: mcq('$' + right + '$', wr.map(function (w) { return '$' + w + '$'; })),
      steps: ['Solve $\\cos 2u = ' + (fn3 === 'sin' ? '1 - 2\\sin^2 u' : '2\\cos^2 u - 1') + '$ for $\\' + fn3 + '^2 u$: $\\' + fn3 + '^2 u = \\dfrac{1 ' + (fn3 === 'sin' ? '-' : '+') + ' \\cos 2u}{2}$.',
        'With $u = ' + k + 'x$, the angle inside doubles to $' + 2 * k + 'x$: $\\' + fn3 + '^2(' + k + 'x) = ' + right + '$.'],
      hint: 'The angle on the right is double the angle on the left.'
    };
  });

  // equations a*f(x) + b = 0 with a special value
  function linTrig(R, fn, v) { // v: float special value -> { tex, val } of an equation equivalent to fn(x) = v
    var e = exv(v), F = '\\' + fn + ' x';
    var s = Math.abs(v), sgn = v < 0 ? -1 : 1;
    if (near(s, 0)) return R.coin() ? F + ' = 0' : '2' + F + ' = 0';
    if (near(s, 1)) return R.coin() ? F + (sgn > 0 ? ' - 1' : ' + 1') + ' = 0' : '3' + F + ' = ' + (sgn > 0 ? '' : '-') + '3';
    if (near(s, 0.5)) return '2' + F + (sgn > 0 ? ' - 1' : ' + 1') + ' = 0';
    if (near(s, R2 / 2)) return R.coin() ? '2' + F + (sgn > 0 ? ' - ' : ' + ') + '\\sqrt{2} = 0' : '\\sqrt{2}' + F + (sgn > 0 ? ' - 1' : ' + 1') + ' = 0';
    if (near(s, R3 / 2)) return '2' + F + (sgn > 0 ? ' - ' : ' + ') + '\\sqrt{3} = 0';
    if (near(s, R3 / 3)) return R.coin() ? '\\sqrt{3}' + F + (sgn > 0 ? ' - 1' : ' + 1') + ' = 0' : '3' + F + (sgn > 0 ? ' - ' : ' + ') + '\\sqrt{3} = 0';
    if (near(s, R3)) return F + (sgn > 0 ? ' - ' : ' + ') + '\\sqrt{3} = 0';
    throw new Error('linTrig ' + v);
  }
  G('pre.solve-trig-basic', function (R, ctx) {
    var kind = R.pick(by(ctx, ['solve', 'solve', 'plain'], ['solve', 'solve', 'count', 'none', 'sq'], ['solve', 'sq', 'general', 'count']));
    var fn = R.pick(['sin', 'cos', 'tan']), DB = R.chance(0.35) ? R.pick(DOMS.slice(1)) : DOMS[0];
    var vals = fn === 'tan' ? [1, -1, R3, -R3, R3 / 3, -R3 / 3, 0] : [0.5, -0.5, R2 / 2, -R2 / 2, R3 / 2, -R3 / 2, 1, -1, 0];
    var v = R.pick(vals), ev = exv(v);
    var sols = solveScan(function (x) { var y = fn === 'sin' ? Math.sin(x) : fn === 'cos' ? Math.cos(x) : Math.tan(x); return y - v; });
    var ref = refDeg(sols[0]);
    var why = ['$\\' + fn + ' x = ' + ev.t + '$.'];
    function explain() {
      var st = [];
      if (near(Math.abs(v), 1) && fn !== 'tan' || near(v, 0)) st.push('This value happens on an axis of the unit circle, at $x = ' + solTex(sols) + '$ in $[0, 2\\pi)$.');
      else {
        st.push('The reference angle with $\\' + fn + ' = ' + exv(Math.abs(v)).t + '$ is $' + radTex(ref) + '$.');
        st.push('$\\' + fn + '$ is ' + (v > 0 ? 'positive' : 'negative') + ' in Quadrants ' + (fn === 'sin' ? (v > 0 ? 'I and II' : 'III and IV') : fn === 'cos' ? (v > 0 ? 'I and IV' : 'II and III') : (v > 0 ? 'I and III' : 'II and IV')) + ', so there are two solutions in $[0, 2\\pi)$: $x = ' + solTex(sols) + '$.');
      }
      return st;
    }
    if (kind === 'plain' || kind === 'solve') {
      var eq = kind === 'plain' ? '\\' + fn + ' x = ' + ev.t : linTrig(R, fn, v);
      var st = kind === 'plain' ? [] : ['Isolate the trig function: $\\' + fn + ' x = ' + ev.t + '$.'];
      var solsB = DB === DOMS[0] ? sols : solveD(function (x) { var y = fn === 'sin' ? Math.sin(x) : fn === 'cos' ? Math.cos(x) : Math.tan(x); return y - v; }, DB);
      var stB = DB === DOMS[0] ? [] : ['Keep only the angles in $' + DB.iv + '$ (add or subtract $2\\pi$' + (fn === 'tan' ? ' or $\\pi$' : '') + ' to move a solution into the interval): $x = ' + solTex(solsB) + '$.'];
      return { q: 'Solve $' + eq + '$ for $' + DB.tex + '$. List every solution.', a: { t: 'set', v: solSet(solsB), form: 'simplest' }, steps: st.concat(explain()).concat(stB), hint: 'Find the reference angle, then every quadrant where ' + FNNAME[fn] + ' has the right sign.' };
    }
    if (kind === 'none') {
      var bad = R.pick(['2', '-3', '\\frac{3}{2}', '-\\frac{5}{4}']), fnb = R.pick(['sin', 'cos']);
      return { q: 'Solve $\\' + fnb + ' x = ' + bad + '$ for $0 \\le x < 2\\pi$.', a: { t: 'set', v: [] }, steps: ['$\\' + fnb + ' x$ is a coordinate of a point on the unit circle, so it is always between $-1$ and $1$.', '$' + bad + '$ is outside that range, so there is no solution.'], hint: 'What values can ' + FNNAME[fnb] + ' take?' };
    }
    if (kind === 'count') {
      var turns = R.pick([2, 3]);
      var n = sols.length * turns;
      return { q: 'How many solutions does $\\' + fn + ' x = ' + ev.t + '$ have for $0 \\le x < ' + piTex(2 * turns, 1) + '$?', a: numA(n), steps: explain().concat([(fn === 'tan' ? 'Tangent repeats every $\\pi$, and $[0, ' + piTex(2 * turns, 1) + ')$ holds $' + 2 * turns + '$ periods of length $\\pi$.' : '$\\' + fn + '$ repeats every $2\\pi$, and $[0, ' + piTex(2 * turns, 1) + ')$ is ' + turns + ' full turns.'), 'Each full turn gives the same ' + sols.length + ' solution' + (sols.length === 1 ? '' : 's') + ', so there are $' + sols.length + ' \\times ' + turns + ' = ' + n + '$.']), hint: 'Count the solutions in one turn, then multiply by the number of turns.' };
    }
    if (kind === 'sq') {
      var fs = R.pick(['sin', 'cos', 'tan']), sv = fs === 'tan' ? R.pick([1, 3, Q(1, 3)]) : R.pick([Q(1, 4), Q(3, 4), Q(1, 2)]);
      sv = Q.from(sv); var r = Math.sqrt(sv.toNumber());
      var ss = solveScan(function (x) { var y = fs === 'sin' ? Math.sin(x) : fs === 'cos' ? Math.cos(x) : Math.tan(x); return y * y - sv.toNumber(); });
      var lhs = sv.den() === 1 ? '\\' + fs + '^2 x = ' + sv.num() : sv.den() + '\\' + fs + '^2 x = ' + sv.num();
      return { q: 'Solve $' + lhs + '$ for $0 \\le x < 2\\pi$.', a: { t: 'set', v: solSet(ss), form: 'simplest' }, steps: ['$\\' + fs + '^2 x = ' + sv.toTex() + '$, so $\\' + fs + ' x = \\pm' + exv(r).t + '$: both signs count.', 'The reference angle is $' + radTex(refDeg(ss[0])) + '$, and with both signs there is a solution in every quadrant.', '$x = ' + solTex(ss) + '$.'], hint: 'Take the square root: remember the $\\pm$.' };
    }
    var e2 = R.pick([['sin', 0.5], ['cos', 0.5], ['sin', R3 / 2], ['cos', -R2 / 2], ['tan', 1], ['tan', R3]]), f2 = e2[0], v2 = e2[1], s2 = solveScan(function (x) { var y = f2 === 'sin' ? Math.sin(x) : f2 === 'cos' ? Math.cos(x) : Math.tan(x); return y - v2; });
    var A = radTex(s2[0]), B = s2[1] !== undefined ? radTex(s2[1]) : null;
    var right = f2 === 'tan' ? '$x = ' + A + ' + k\\pi$' : '$x = ' + A + ' + 2k\\pi$ or $x = ' + B + ' + 2k\\pi$';
    var wrongs = f2 === 'tan' ? ['$x = ' + A + ' + 2k\\pi$', '$x = ' + A + '$ only', '$x = \\pm' + A + ' + k\\pi$'] : ['$x = ' + A + ' + 2k\\pi$', '$x = ' + A + ' + k\\pi$', '$x = ' + A + '$ or $x = ' + B + '$ only'];
    return {
      q: 'Which describes <b>all</b> solutions of $\\' + f2 + ' x = ' + exv(v2).t + '$? ($k$ is any integer.)',
      a: mcq(right, wrongs),
      steps: ['In one period the solutions are $' + solTex(s2) + '$' + (f2 === 'tan' ? ' (tangent has period $\\pi$, so $' + A + '$ and $' + A + ' + \\pi$).' : '.'), f2 === 'tan' ? 'Adding any multiple of $\\pi$ gives another solution.' : 'Adding any multiple of $2\\pi$ to each gives another solution, so both families are needed.'],
      hint: 'Find every solution in one period, then add whole periods.'
    };
  });

  G('pre.solve-trig-advanced', function (R, ctx) {
    var kind = R.pick(by(ctx, ['factor', 'common', 'multi', 'factor'], ['factor', 'common', 'multi', 'ident', 'factor'], ['ident', 'multi', 'factor', 'factor']));
    if (kind === 'factor') {
      var fn = R.pick(['sin', 'cos']), roots = [Q(1), Q(-1), Q(1, 2), Q(-1, 2), Q(0)], bad = [Q(2), Q(-2), Q(3, 2)];
      var r1 = R.pick(roots), r2 = R.chance(by(ctx, 0, 0.25, 0.4)) ? R.pick(bad) : R.pick(roots.filter(function (z) { return !z.eq(r1); }));
      // (d1 u - n1)(d2 u - n2)
      var a = r1.den() * r2.den(), b = -(r1.num() * r2.den() + r2.num() * r1.den()), c = r1.num() * r2.num();
      if (a < 0) { a = -a; b = -b; c = -c; }
      var F = '\\' + fn + ' x', eq = T.terms([[a, '\\' + fn + '^2 x'], [b, F], [c, '']]) + ' = 0';
      var D = pickDom(R, ctx), sols = solveD(function (x) { var u = fn === 'sin' ? Math.sin(x) : Math.cos(x); return a * u * u + b * u + c; }, D);
      var f1 = r1.den() + 'u' + T.signed(-r1.num()), f2 = r2.den() + 'u' + T.signed(-r2.num());
      function fac(r) { return r.isZero() ? F : '(' + T.lin(r.den(), F, -r.num()) + ')'; }
      if (r2.isZero()) { var tmp = r1; r1 = r2; r2 = tmp; }
      return {
        q: 'Solve $' + eq + '$ for $' + D.tex + '$.',
        a: { t: 'set', v: solSet(sols), form: 'simplest' },
        steps: ['Treat it as a quadratic in $u = ' + F + '$: $' + T.terms([[a, 'u^2'], [b, 'u'], [c, '']]) + ' = 0$.',
          'Factor: $' + fac(r1) + fac(r2) + ' = 0$, so $' + F + ' = ' + r1.toTex() + '$ or $' + F + ' = ' + r2.toTex() + '$.',
          [r1, r2].map(function (r) { var ss = solveD(function (x) { return (fn === 'sin' ? Math.sin(x) : Math.cos(x)) - r.toNumber(); }, D); return '$' + F + ' = ' + r.toTex() + '$: ' + (ss.length ? '$x = ' + solTex(ss) + '$' : Math.abs(r.toNumber()) > 1 ? 'no solution (outside $[-1, 1]$)' : 'no solution in $' + D.iv + '$'); }).join('; ') + '.',
          'All solutions in $' + D.iv + '$: $' + solTex(sols) + '$.'],
        hint: 'Factor like $au^2 + bu + c$ with $u = ' + F + '$.'
      };
    }
    if (kind === 'common') {
      var C = R.pick([
        ['2\\sin x\\cos x = \\sin x', '\\sin x\\,(2\\cos x - 1) = 0', '\\sin x = 0 \\text{ or } \\cos x = \\frac{1}{2}', function (x) { return 2 * Math.sin(x) * Math.cos(x) - Math.sin(x); }],
        ['2\\sin x\\cos x = -\\cos x', '\\cos x\\,(2\\sin x + 1) = 0', '\\cos x = 0 \\text{ or } \\sin x = -\\frac{1}{2}', function (x) { return 2 * Math.sin(x) * Math.cos(x) + Math.cos(x); }],
        ['2\\cos^2 x = \\cos x', '\\cos x\\,(2\\cos x - 1) = 0', '\\cos x = 0 \\text{ or } \\cos x = \\frac{1}{2}', function (x) { return 2 * Math.cos(x) * Math.cos(x) - Math.cos(x); }],
        ['\\tan x\\sin x = \\sin x', '\\sin x\\,(\\tan x - 1) = 0', '\\sin x = 0 \\text{ or } \\tan x = 1', function (x) { return Math.tan(x) * Math.sin(x) - Math.sin(x); }],
        ['2\\sin^2 x = -\\sqrt{3}\\sin x', '\\sin x\\,(2\\sin x + \\sqrt{3}) = 0', '\\sin x = 0 \\text{ or } \\sin x = -\\frac{\\sqrt{3}}{2}', function (x) { return 2 * Math.sin(x) * Math.sin(x) + R3 * Math.sin(x); }],
        ['\\sqrt{2}\\sin x\\cos x = \\cos x', '\\cos x\\,(\\sqrt{2}\\sin x - 1) = 0', '\\cos x = 0 \\text{ or } \\sin x = \\frac{\\sqrt{2}}{2}', function (x) { return R2 * Math.sin(x) * Math.cos(x) - Math.cos(x); }]
      ]);
      var D2 = pickDom(R, ctx), s2 = solveD(C[3], D2);
      return {
        q: 'Solve $' + C[0] + '$ for $' + D2.tex + '$.',
        a: { t: 'set', v: solSet(s2), form: 'simplest' },
        steps: ['Do not divide by a trig function: you would lose the solutions where it is $0$. Move everything to one side and factor.', '$' + C[1] + '$, so $' + C[2] + '$.', 'Solve each piece in $' + D2.iv + '$: $x = ' + solTex(s2) + '$.'],
        hint: 'Bring everything to one side and factor out the common trig function.'
      };
    }
    if (kind === 'multi') {
      var fnm = R.pick(['sin', 'cos', 'tan']), k = R.pick(by(ctx, [2], [2, 3], [2, 3])), vm = fnm === 'tan' ? R.pick([1, -1, R3, R3 / 3]) : R.pick([0.5, -0.5, R3 / 2, -R2 / 2, R2 / 2, 1, 0]);
      if (k === 3 && Math.abs(Math.abs(vm) - R2 / 2) < 1e-9) vm = 0.5;
      var sm = solveScan(function (x) { var u = k * x; var y = fnm === 'sin' ? Math.sin(u) : fnm === 'cos' ? Math.cos(u) : Math.tan(u); return y - vm; });
      var base = solveScan(function (u) { var y = fnm === 'sin' ? Math.sin(u) : fnm === 'cos' ? Math.cos(u) : Math.tan(u); return y - vm; });
      var per = fnm === 'tan' ? '\\pi' : '2\\pi';
      return {
        q: 'Solve $\\' + fnm + '(' + k + 'x) = ' + exv(vm).t + '$ for $0 \\le x < 2\\pi$.',
        a: { t: 'set', v: solSet(sm), form: 'simplest' },
        steps: ['Let $u = ' + k + 'x$. As $x$ runs over $[0, 2\\pi)$, $u$ runs over $[0, ' + piTex(2 * k, 1) + ')$: ' + k + ' full turns.',
          'In one turn, $\\' + fnm + ' u = ' + exv(vm).t + '$ at $u = ' + solTex(base) + '$' + (fnm === 'tan' ? '' : '') + '. Add $' + per + '$ repeatedly to list every $u$ in $[0, ' + piTex(2 * k, 1) + ')$.',
          'Divide each $u$ by $' + k + '$: $x = ' + solTex(sm) + '$ (' + sm.length + ' solutions).'],
        hint: 'Solve for $' + k + 'x$ first over ' + k + ' full turns, then divide by $' + k + '$.'
      };
    }
    var Id = R.pick([
      ['\\cos 2x = \\cos x', '2\\cos^2 x - 1 = \\cos x', '2\\cos^2 x - \\cos x - 1 = 0 \\Rightarrow (2\\cos x + 1)(\\cos x - 1) = 0', function (x) { return Math.cos(2 * x) - Math.cos(x); }],
      ['\\sin 2x = \\cos x', '2\\sin x\\cos x = \\cos x', '\\cos x\\,(2\\sin x - 1) = 0', function (x) { return Math.sin(2 * x) - Math.cos(x); }],
      ['\\cos 2x + \\sin x = 0', '1 - 2\\sin^2 x + \\sin x = 0', '2\\sin^2 x - \\sin x - 1 = 0 \\Rightarrow (2\\sin x + 1)(\\sin x - 1) = 0', function (x) { return Math.cos(2 * x) + Math.sin(x); }],
      ['2\\cos^2 x + 3\\sin x - 3 = 0', '2(1 - \\sin^2 x) + 3\\sin x - 3 = 0', '2\\sin^2 x - 3\\sin x + 1 = 0 \\Rightarrow (2\\sin x - 1)(\\sin x - 1) = 0', function (x) { return 2 * Math.cos(x) * Math.cos(x) + 3 * Math.sin(x) - 3; }],
      ['\\sin^2 x = \\cos^2 x', '\\cos^2 x - \\sin^2 x = 0', '\\cos 2x = 0', function (x) { return Math.sin(x) * Math.sin(x) - Math.cos(x) * Math.cos(x); }],
      ['2\\sin^2 x = 1 + \\cos x', '2(1 - \\cos^2 x) = 1 + \\cos x', '2\\cos^2 x + \\cos x - 1 = 0 \\Rightarrow (2\\cos x - 1)(\\cos x + 1) = 0', function (x) { return 2 * Math.sin(x) * Math.sin(x) - 1 - Math.cos(x); }]
    ]);
    var D3 = pickDom(R, ctx), si = solveD(Id[3], D3);
    return {
      q: 'Solve $' + Id[0] + '$ for $' + D3.tex + '$.',
      a: { t: 'set', v: solSet(si), form: 'simplest' },
      steps: ['Use an identity so that only one trig function of one angle is left: $' + Id[1] + '$.', 'Rearrange and factor: $' + Id[2] + '$.', 'Solve each factor in $' + D3.iv + '$: $x = ' + solTex(si) + '$.'],
      hint: 'Rewrite with a double-angle or Pythagorean identity so one function remains.'
    };
  });

  // ======================= 04-triangles.js
  // ===================================================================== Unit 4: Oblique Triangles and Vectors

  function sinSd(d) { return sdTrig('sin', d); }
  function sdNum(x) { return { p: sdPlain(x), t: sdTex(x), v: sdVal(x) }; }
  function sqrtInt(n) { var r = U.simplifyRadical(n); var c = r[0], m = r[1]; return { p: m === 1 ? String(c) : (c === 1 ? '' : c + '*') + 'sqrt(' + m + ')', t: m === 1 ? String(c) : (c === 1 ? '' : c) + '\\sqrt{' + m + '}', v: Math.sqrt(n) }; }

  G('pre.ambiguous-case', function (R, ctx) {
    var kind = R.pick(by(ctx, ['count', 'angles', 'count'], ['angles', 'count', 'one'], ['angles', 'one', 'third', 'count']));
    if (kind === 'count') {
      var A = R.pick([30, 30, 45, 60, 120, 150]), b = 2 * R.int(3, 10), h = b * Math.sin(A * PI / 180), a, n;
      var hT = A === 30 ? String(b / 2) : sdTex(sdScale(sinSd(A), b));
      if (A > 90) { a = R.coin() ? R.int(Math.max(2, b - 6), b) : R.int(b + 1, b + 6); n = a > b ? 1 : 0; }
      else {
        var cs = R.pick(A === 30 ? ['zero', 'one', 'two', 'big'] : ['zero', 'two', 'big']);
        if (cs === 'zero') a = Math.max(1, Math.floor(h - 0.01) - R.int(0, 1));
        else if (cs === 'one') a = b / 2;
        else if (cs === 'two') { a = R.int(Math.floor(h) + 1, b - 1); if (a <= h || a >= b) { a = b; cs = 'big'; } }
        else a = R.int(b, b + 5);
        if (a <= 0) a = 1;
        n = a < h - 1e-9 ? 0 : near(a, h) ? 1 : a < b ? 2 : 1;
      }
      var st = A > 90 ? ['Angle $A$ is obtuse, so it must be the largest angle, and $a$ must be the longest side.', 'Here $a = ' + a + '$ and $b = ' + b + '$: ' + (a > b ? '$a > b$, so exactly one triangle.' : '$a \\le b$, so no triangle.')]
        : ['Swing side $a$ from $C$ toward the ray from $A$. The shortest it can be and still reach is the height $h = b\\sin A = ' + b + '\\sin ' + T.deg(A) + ' = ' + hT + (A === 30 ? '' : ' \\approx ' + T.num(U.round(h, 2))) + '$.',
          n === 0 ? 'Since $a = ' + a + ' < h$, side $a$ cannot reach the ray: no triangle.' : n === 2 ? 'Since $h < a = ' + a + ' < b = ' + b + '$, side $a$ can swing to two places on the ray: two triangles.' : near(a, h) ? 'Since $a = h$, side $a$ just touches the ray: one right triangle.' : 'Since $a = ' + a + ' \\ge b = ' + b + '$, side $a$ reaches the ray on only one side of $A$: one triangle.'];
      return { q: 'In $\\triangle ABC$, $A = ' + T.deg(A) + '$, $a = ' + a + '$ and $b = ' + b + '$. How many different triangles fit these measurements?', a: numA(n), steps: st, hint: A > 90 ? 'With an obtuse angle, the side across from it must be the longest.' : 'Compare $a$ with the height $h = b\\sin A$ and with $b$.' };
    }
    // build a triangle from A and B with circumdiameter 2m: a = 2m sin A, b = 2m sin B
    var pairs = kind === 'one' ? [[60, 45], [120, 30], [135, 30], [90, 30], [60, 30], [45, 30], [90, 45], [120, 45]] : [[30, 45], [30, 60], [45, 60], [30, 45], [30, 60]];
    var pr = R.pick(pairs), A2 = pr[0], B2 = pr[1], m = R.int(2, 8);
    var aS = sdScale(sinSd(A2), 2 * m), bS = sdScale(sinSd(B2), 2 * m);
    var Bs = [B2]; if (A2 + (180 - B2) < 180 && B2 !== 90) Bs.push(180 - B2);
    var sinB = sdDiv(sdMul(bS, sinSd(A2)), aS);
    var steps = ['Law of sines: $\\dfrac{\\sin B}{b} = \\dfrac{\\sin A}{a}$, so $\\sin B = \\dfrac{b\\sin A}{a} = \\dfrac{' + sdTex(bS) + ' \\cdot ' + trigDeg('sin', A2).t + '}{' + sdTex(aS) + '} = ' + sdTex(sinB) + '$.',
      'Two angles between $0^\\circ$ and $180^\\circ$ have this sine: $' + T.deg(B2) + '$ and $180^\\circ - ' + T.deg(B2) + ' = ' + T.deg(180 - B2) + '$.'];
    if (Bs.length === 2) steps.push('Check each with $A = ' + T.deg(A2) + '$: $' + T.deg(A2) + ' + ' + T.deg(B2) + ' < 180^\\circ$ and $' + T.deg(A2) + ' + ' + T.deg(180 - B2) + ' = ' + T.deg(A2 + 180 - B2) + ' < 180^\\circ$. Both work: two triangles.');
    else steps.push('Check: $' + T.deg(A2) + ' + ' + T.deg(180 - B2) + ' = ' + T.deg(A2 + 180 - B2) + '$, which leaves no room for $C$. Only $B = ' + T.deg(B2) + '$ works.');
    var q0 = 'In $\\triangle ABC$, $A = ' + T.deg(A2) + '$, $a = ' + sdTex(aS) + '$ and $b = ' + sdTex(bS) + '$. ';
    if (kind === 'third') {
      var Cs = Bs.map(function (x) { return 180 - A2 - x; });
      return { q: q0 + 'Find every possible measure of angle $C$, in degrees. (Type the numbers, separated by commas.)', a: { t: 'set', v: Cs.map(String) }, steps: steps.concat(['$C = 180^\\circ - A - B$: ' + Cs.map(function (c, i) { return '$' + T.deg(c) + '$ (with $B = ' + T.deg(Bs[i]) + '$)'; }).join(' and ') + '.']), hint: 'First find every possible $B$, including the supplementary angle.' };
    }
    return { q: q0 + 'Find every possible measure of angle $B$, in degrees. (Type the numbers, separated by commas.)', a: { t: 'set', v: Bs.map(String) }, steps: steps, hint: 'Sine is positive in Quadrants I and II, so $\\sin B$ gives two candidate angles. Check both.' };
  });

  function compassParts(b) { return b < 90 ? ['N', b, 'E'] : b < 180 ? ['S', 180 - b, 'E'] : b < 270 ? ['S', b - 180, 'W'] : ['N', 360 - b, 'W']; }
  function COMPASS(b) { var c = compassParts(b); return '\\text{' + c[0] + ' }' + c[1] + '^\\circ\\text{ ' + c[2] + '}'; }
  function compassTxt(b) { var c = compassParts(b); return c[0] + ' ' + c[1] + '° ' + c[2]; }
  // integer triangles with a 60 or 120 degree angle between sides p and q: [p, q, angle, opposite side]
  var COSTRI = [[3, 8, 60, 7], [5, 8, 60, 7], [5, 3, 120, 7], [7, 8, 120, 13], [3, 5, 120, 7], [8, 15, 60, 13], [7, 15, 60, 13], [5, 16, 120, 19], [16, 10, 60, 14], [6, 10, 120, 14], [10, 6, 120, 14], [6, 16, 60, 14]];
  G('pre.triangle-applications', function (R, ctx) {
    var kind = R.pick(by(ctx, ['compass', 'bear2std', 'ships'], ['ships', 'survey', 'bear2std', 'compass'], ['ships', 'survey', 'ships2']));
    if (kind === 'compass') {
      var b = R.int(1, 35) * 10; while (b % 90 === 0) b = R.int(1, 35) * 10;
      return {
        q: 'A course is given as $' + COMPASS(b) + '$. Write it as a bearing: degrees measured clockwise from north.',
        a: numA(b),
        steps: ['"' + compassTxt(b) + '" means: face ' + (b < 90 || b > 270 ? 'north' : 'south') + ', then turn ' + (b < 90 ? b : b < 180 ? 180 - b : b < 270 ? b - 180 : 360 - b) + '° toward the ' + (b < 180 ? 'east' : 'west') + '.',
          'Measured clockwise from north, that is ' + (b < 90 ? '$' + b + '^\\circ$.' : b < 180 ? '$180^\\circ - ' + (180 - b) + '^\\circ = ' + b + '^\\circ$.' : b < 270 ? '$180^\\circ + ' + (b - 180) + '^\\circ = ' + b + '^\\circ$.' : '$360^\\circ - ' + (360 - b) + '^\\circ = ' + b + '^\\circ$.')],
        hint: 'Start at north and turn clockwise: east is $90^\\circ$, south $180^\\circ$, west $270^\\circ$.'
      };
    }
    if (kind === 'bear2std') {
      var bb = R.int(1, 35) * 10, std = mod(90 - bb, 360);
      return {
        q: 'A boat travels on a bearing of $' + T.deg(bb) + '$ (clockwise from north). What angle does its path make in standard position, measured counterclockwise from the positive $x$-axis (east)? Give an angle from $0^\\circ$ to $360^\\circ$.',
        a: numA(std),
        steps: ['Bearings start at north and turn clockwise; standard angles start at east and turn counterclockwise.', 'North is $90^\\circ$ in standard position, and turning clockwise subtracts: $90^\\circ - ' + T.deg(bb) + ' = ' + T.deg(90 - bb) + '$.', (90 - bb < 0 ? 'Add $360^\\circ$: ' : 'So ') + '$' + T.deg(std) + '$.'],
        hint: 'Standard angle $= 90^\\circ - \\text{bearing}$, then adjust by $360^\\circ$.'
      };
    }
    if (kind === 'ships' || kind === 'ships2') {
      var c = R.pick(COSTRI), b1 = R.int(0, 17) * 10, ang = c[2], b2 = mod(b1 + ang * R.pick([1, -1]), 360);
      if (kind === 'ships2') { var t = R.pick([2, 3]); var sp = [c[0] * 10, c[1] * 10]; var d = c[3] * 10 * t;
        return {
          q: 'Two ships leave a port at noon. One sails at $' + sp[0] + '$ km/h on a bearing of $' + T.deg(b1) + '$; the other sails at $' + sp[1] + '$ km/h on a bearing of $' + T.deg(b2) + '$. How far apart are they after ' + t + ' hours?',
          a: numA(d),
          steps: ['After ' + t + ' hours the ships are $' + sp[0] * t + '$ km and $' + sp[1] * t + '$ km from port.', 'The angle at the port is the difference of the bearings: $' + T.deg(ang) + '$.',
            'Law of cosines: $d^2 = ' + sp[0] * t + '^2 + ' + sp[1] * t + '^2 - 2(' + sp[0] * t + ')(' + sp[1] * t + ')\\cos ' + T.deg(ang) + ' = ' + (sp[0] * sp[0] * t * t + sp[1] * sp[1] * t * t) + (ang === 60 ? ' - ' : ' + ') + (sp[0] * sp[1] * t * t) + ' = ' + d * d + '$.', '$d = ' + d + '$ km.'],
          hint: 'Find each distance, then the angle between the paths, then use the law of cosines.'
        };
      }
      var p = c[0], q = c[1];
      return {
        q: 'A hiker walks $' + p + '$ km from camp on a bearing of $' + T.deg(b1) + '$. A friend walks $' + q + '$ km from the same camp on a bearing of $' + T.deg(b2) + '$. How far apart are they?',
        a: numA(c[3]),
        steps: ['The two paths meet at camp with an angle equal to the difference of the bearings: $' + T.deg(ang) + '$.',
          'Law of cosines: $d^2 = ' + p + '^2 + ' + q + '^2 - 2(' + p + ')(' + q + ')\\cos ' + T.deg(ang) + '$.',
          '$\\cos ' + T.deg(ang) + ' = ' + (ang === 60 ? '\\frac{1}{2}' : '-\\frac{1}{2}') + '$, so $d^2 = ' + (p * p + q * q) + (ang === 60 ? ' - ' : ' + ') + p * q + ' = ' + c[3] * c[3] + '$ and $d = ' + c[3] + '$ km.'],
        hint: 'The angle at camp is the difference between the two bearings.'
      };
    }
    // survey: baseline AB = c, angles at A and B; find BC = a
    var opts = [[45, 30], [30, 45], [60, 45], [45, 60], [30, 60], [60, 30], [45, 45], [30, 120], [120, 30], [135, 30], [30, 30], [60, 60], [45, 90]];
    var o = R.pick(opts), A = o[0], C = o[1], B = 180 - A - C, cc = R.pick([10, 20, 50, 100, 40, 60, 80]);
    var aS = sdDiv(sdScale(sinSd(A), cc), sinSd(C));
    return {
      q: 'Surveyors mark points $A$ and $B$, $' + cc + '$ m apart, on one side of a river, and sight a tree at $C$ across it. They measure $\\angle A = ' + T.deg(A) + '$ and $\\angle B = ' + T.deg(B) + '$. Find the exact distance $BC$.',
      a: numA(sdPlain(aS), 'simplest'),
      steps: ['The angles of a triangle add to $180^\\circ$: $\\angle C = 180^\\circ - ' + T.deg(A) + ' - ' + T.deg(B) + ' = ' + T.deg(C) + '$.',
        'Side $BC$ is across from $\\angle A$, and the known side $AB$ is across from $\\angle C$. Law of sines: $\\dfrac{BC}{\\sin A} = \\dfrac{AB}{\\sin C}$.',
        '$BC = \\dfrac{' + cc + '\\sin ' + T.deg(A) + '}{\\sin ' + T.deg(C) + '} = \\dfrac{' + cc + ' \\cdot ' + trigDeg('sin', A).t + '}{' + trigDeg('sin', C).t + '} = ' + sdTex(aS) + '$ m.'],
      hint: 'Find the third angle first. Then pair each side with the angle across from it.'
    };
  });

  var HERON = [[5, 5, 6], [5, 5, 8], [13, 14, 15], [3, 4, 5], [5, 12, 13], [6, 8, 10], [9, 10, 17], [10, 13, 13], [13, 20, 21], [7, 15, 20], [10, 17, 21], [11, 13, 20], [12, 17, 25], [4, 13, 15], [8, 15, 17], [7, 24, 25], [13, 13, 24], [16, 17, 17], [5, 29, 30], [9, 12, 15], [6, 25, 29]];
  var HERON3 = [[4, 5, 6], [3, 5, 6], [2, 3, 4], [4, 6, 8], [5, 6, 7], [3, 4, 6], [6, 7, 9], [2, 4, 5], [5, 7, 8], [7, 8, 9]];
  G('pre.herons-formula', function (R, ctx) {
    var kind = R.pick(by(ctx, ['s', 'area'], ['area', 'area', 'height'], ['area', 'rad', 'height']));
    var t = R.shuffle(kind === 'rad' ? R.pick(HERON3) : R.pick(HERON)), a = t[0], b = t[1], c = t[2], P = a + b + c;
    var s = Q(P, 2), P16 = P * (-a + b + c) * (a - b + c) * (a + b - c); // 16 * area^2
    var area = sqrtQ(Q(P16, 16));
    var sT = s.toTex(), fac = [s, s.sub(a), s.sub(b), s.sub(c)];
    var st = ['Half the perimeter: $s = \\dfrac{' + a + ' + ' + b + ' + ' + c + '}{2} = ' + sT + '$.',
      'Heron: $A = \\sqrt{s(s - a)(s - b)(s - c)} = \\sqrt{' + fac.map(function (f) { return T.p(f.toTex()); }).join(' \\cdot ') + '} = \\sqrt{' + Q(P16, 16).toTex() + '}' + '$.',
      '$A = ' + area.t + '$' + (/sqrt/.test(area.p) ? '' : '') + ' square units.'];
    if (kind === 's') return { q: 'A triangle has sides $' + a + '$, $' + b + '$ and $' + c + '$. Find its semiperimeter $s$ and its area.', a: { t: 'multi', parts: [{ label: '$s =$', a: numA(s.toPlain()) }, { label: 'Area', a: numA(area.p, 'simplest') }] }, steps: st, hint: '$s$ is half the perimeter, not the whole perimeter.' };
    if (kind === 'height') {
      var h = Q(2).mul(Q.from(area.p)).div(c);
      if (/sqrt/.test(area.p)) h = null;
      if (h) return { q: 'A triangle has sides $' + a + '$, $' + b + '$ and $' + c + '$. Find the height to the side of length $' + c + '$.', a: numA(h.toPlain()), steps: st.concat(['Area is also $\\frac{1}{2} \\cdot \\text{base} \\cdot \\text{height}$, so $h = \\dfrac{2A}{' + c + '} = \\dfrac{' + 2 * Q.from(area.p).toNumber() + '}{' + c + '} = ' + h.toTex() + '$.']), hint: 'Find the area with Heron\'s formula, then use $A = \\frac{1}{2}bh$.' };
    }
    return { q: 'Use Heron\'s formula to find the exact area of a triangle with sides $' + a + '$, $' + b + '$ and $' + c + '$.', a: numA(area.p, 'simplest'), steps: st, hint: 'Start with $s$, half the perimeter.' };
  });

  G('pre.vectors-intro', function (R, ctx) {
    var kind = R.pick(by(ctx, ['comp', 'term', 'comp'], ['comp', 'term', 'init', 'equal'], ['init', 'equal', 'comp']));
    var P = [R.int(-6, 6), R.int(-6, 6)], v = [R.nz(-7, 7), R.nz(-7, 7)], Qp = [P[0] + v[0], P[1] + v[1]];
    if (kind === 'comp') return { q: 'Find the component form of the vector from $P' + T.pt(P) + '$ to $Q' + T.pt(Qp) + '$.', a: { t: 'tuple', v: v.map(String) }, steps: ['A vector records the move from start to finish: how far right and how far up.', '$\\overrightarrow{PQ} = \\langle ' + Qp[0] + ' - ' + T.p(P[0]) + ', ' + Qp[1] + ' - ' + T.p(P[1]) + ' \\rangle = ' + T.vec(v) + '$.'], hint: 'Subtract: terminal point minus initial point.', nolint: ['+ 0'] };
    if (kind === 'term') return { q: 'The vector $\\mathbf{v} = ' + T.vec(v) + '$ starts at $' + T.pt(P) + '$. Where does it end?', a: { t: 'tuple', v: Qp.map(String) }, steps: ['A vector is a move. Start at $' + T.pt(P) + '$, move $' + v[0] + '$ in $x$ and $' + v[1] + '$ in $y$.', 'End point: $' + T.pt([P[0] + ' + ' + T.p(v[0]), P[1] + ' + ' + T.p(v[1])]).replace(/\$/g, '') + ' = ' + T.pt(Qp) + '$.'], hint: 'Add the components to the starting point.', nolint: ['+ 0'] };
    if (kind === 'init') return { q: 'The vector $\\mathbf{v} = ' + T.vec(v) + '$ ends at $' + T.pt(Qp) + '$. Where does it start?', a: { t: 'tuple', v: P.map(String) }, steps: ['Undo the move: subtract the components from the end point.', 'Start: $' + T.pt([Qp[0] + ' - ' + T.p(v[0]), Qp[1] + ' - ' + T.p(v[1])]) + ' = ' + T.pt(P) + '$.'], hint: 'Initial point = terminal point minus the vector.', nolint: ['+ 0'] };
    var P2 = [R.int(-6, 6), R.int(-6, 6)], same = R.coin(), v2 = same ? v.slice() : R.pick([[v[1], v[0]], [-v[0], -v[1]], [v[0], -v[1]], [v[0] + 1, v[1]]]);
    if (!same && v2[0] === v[0] && v2[1] === v[1]) v2 = [v[0] + 1, v[1]];
    var Q2 = [P2[0] + v2[0], P2[1] + v2[1]];
    return {
      q: 'True or false: the arrow from $' + T.pt(P) + '$ to $' + T.pt(Qp) + '$ and the arrow from $' + T.pt(P2) + '$ to $' + T.pt(Q2) + '$ represent the same vector.',
      a: { t: 'tf', v: same },
      steps: ['Two arrows are the same vector when they make the same move, no matter where they start.', 'First: $' + T.vec(v) + '$. Second: $' + T.vec(v2) + '$.', same ? 'Same components, so the same vector.' : 'Different components, so different vectors' + (v2[0] === -v[0] && v2[1] === -v[1] ? ' (same length, opposite direction).' : '.')],
      hint: 'Compare the component forms.'
    };
  });

  // direction vectors with exact components (unscaled): deg -> [x Sd, y Sd]
  function dirVec(d) {
    var a = mod(d, 360), sx = Math.cos(a * PI / 180), sy = Math.sin(a * PI / 180);
    function sg(x) { return Math.abs(x) < 1e-9 ? 0 : x > 0 ? 1 : -1; }
    if (a % 90 === 0) return [sdQ(sg(sx)), sdQ(sg(sy))];
    if (a % 45 === 0) return [sdQ(sg(sx)), sdQ(sg(sy))];
    var big = Sd({ 3: 1 }), one = sdQ(1);
    if (a % 60 === 30) return [sdScale(big, sg(sx)), sdScale(one, sg(sy))];
    return [sdScale(one, sg(sx)), sdScale(big, sg(sy))];
  }
  function dirLen(d) { var a = mod(d, 360); return a % 90 === 0 ? 1 : a % 45 === 0 ? null : 2; } // null: sqrt(2)

  G('pre.vector-components', function (R, ctx) {
    var kind = R.pick(by(ctx, ['mag', 'comps', 'dir'], ['comps', 'dir', 'mag', 'unit'], ['dir', 'unit', 'comps']));
    if (kind === 'mag') {
      var a = R.nz(-9, 9), b = R.nz(-9, 9), m = sqrtInt(a * a + b * b);
      return { q: 'Find the magnitude of $\\mathbf{v} = ' + T.vec([a, b]) + '$.', a: numA(m.p, 'simplest'), steps: ['The vector is the hypotenuse of a right triangle with legs $|' + a + '|$ and $|' + b + '|$.', '$|\\mathbf{v}| = \\sqrt{' + T.p(a) + '^2 + ' + T.p(b) + '^2} = \\sqrt{' + (a * a + b * b) + '}' + (m.t !== '\\sqrt{' + (a * a + b * b) + '}' ? ' = ' + m.t : '') + '$.'], hint: 'Use the Pythagorean theorem on the components.' };
    }
    if (kind === 'comps') {
      var d = R.pick(by(ctx, [30, 45, 60, 120, 135, 150], NONAX, NONAX.concat([90, 180, 270]))), M = R.pick([2, 4, 6, 8, 10, 12, 20]);
      var cx = sdScale(sdTrig('cos', d), M), cy = sdScale(sdTrig('sin', d), M);
      return {
        q: 'A vector has magnitude $' + M + '$ and direction angle $' + T.deg(d) + '$. Find its component form.',
        a: { t: 'tuple', v: [sdPlain(cx), sdPlain(cy)], form: 'simplest' },
        steps: ['A vector of length $|\\mathbf{v}|$ at angle $\\theta$ points to $(|\\mathbf{v}|\\cos\\theta, |\\mathbf{v}|\\sin\\theta)$: the unit-circle point, scaled.',
          '$\\cos ' + T.deg(d) + ' = ' + trigDeg('cos', d).t + '$ and $\\sin ' + T.deg(d) + ' = ' + trigDeg('sin', d).t + '$.',
          '$\\mathbf{v} = \\langle ' + M + ' \\cdot ' + T.p(trigDeg('cos', d).t) + ', ' + M + ' \\cdot ' + T.p(trigDeg('sin', d).t) + ' \\rangle = \\langle ' + sdTex(cx) + ', ' + sdTex(cy) + ' \\rangle$.'],
        hint: 'Components: $|\\mathbf{v}|\\cos\\theta$ and $|\\mathbf{v}|\\sin\\theta$.'
      };
    }
    if (kind === 'dir') {
      var d2 = R.pick(by(ctx, [45, 135, 225, 315, 120, 150, 210, 240, 300, 330], NONAX, NONAX.concat([90, 180, 270]))), k = R.int(1, 5);
      var dv = dirVec(d2), vx = sdScale(dv[0], k), vy = sdScale(dv[1], k), qd = quadOf(d2), rf = refDeg(d2);
      var st = ['Draw it: $x$ is ' + (sdVal(vx) > 0 ? 'positive' : sdVal(vx) < 0 ? 'negative' : 'zero') + ' and $y$ is ' + (sdVal(vy) > 0 ? 'positive' : sdVal(vy) < 0 ? 'negative' : 'zero') + (qd ? ', so the vector points into Quadrant ' + QN[qd] + '.' : ', so it points along an axis.')];
      if (qd) st.push('The reference angle has $\\tan\\alpha = \\left|\\dfrac{y}{x}\\right| = ' + trigDeg('tan', rf).t + '$, so $\\alpha = ' + T.deg(rf) + '$.', 'In Quadrant ' + QN[qd] + ', $\\theta = ' + ['', '\\alpha', '180^\\circ - \\alpha', '180^\\circ + \\alpha', '360^\\circ - \\alpha'][qd] + ' = ' + T.deg(d2) + '$. (A calculator\'s $\\tan^{-1}$ alone would give an angle in Quadrant I or IV.)');
      else st.push('The direction angle is $' + T.deg(d2) + '$.');
      return { q: 'Find the direction angle $\\theta$ of $\\mathbf{v} = \\langle ' + sdTex(vx) + ', ' + sdTex(vy) + ' \\rangle$, with $0^\\circ \\le \\theta < 360^\\circ$.', a: numA(d2), steps: st, hint: 'Find the reference angle from $|y/x|$, then place it in the right quadrant.' };
    }
    var t = triple(R, 3), sx = R.sign(), sy = R.sign(), useRad = ctx.level >= 3 && R.coin();
    if (useRad) { var a2 = R.nz(-4, 4), b2 = R.nz(-4, 4); if (Math.abs(a2) === Math.abs(b2)) b2 += b2 > 0 ? 1 : -1; var n2 = a2 * a2 + b2 * b2, ux = sqrtQ(Q(a2 * a2, n2)), uy = sqrtQ(Q(b2 * b2, n2)); if (a2 < 0) ux = negX(ux); if (b2 < 0) uy = negX(uy);
      return { q: 'Find the unit vector in the direction of $' + T.vec([a2, b2]) + '$.', a: { t: 'tuple', v: [ux.p, uy.p], form: 'simplest' }, steps: ['$|\\mathbf{v}| = \\sqrt{' + (a2 * a2) + ' + ' + (b2 * b2) + '} = ' + sqrtInt(n2).t + '$.', 'Divide each component by the length: $\\left\\langle \\dfrac{' + a2 + '}{' + sqrtInt(n2).t + '}, \\dfrac{' + b2 + '}{' + sqrtInt(n2).t + '} \\right\\rangle = \\langle ' + ux.t + ', ' + uy.t + ' \\rangle$ (rationalized).'], hint: 'Divide the vector by its magnitude.' };
    }
    var vx2 = sx * t[0], vy2 = sy * t[1];
    return { q: 'Find the unit vector in the direction of $' + T.vec([vx2, vy2]) + '$.', a: { t: 'tuple', v: [Q(vx2, t[2]).toPlain(), Q(vy2, t[2]).toPlain()] }, steps: ['$|\\mathbf{v}| = \\sqrt{' + T.p(vx2) + '^2 + ' + T.p(vy2) + '^2} = ' + t[2] + '$.', 'A unit vector has length $1$: divide each component by $' + t[2] + '$ to get $\\left\\langle ' + Q(vx2, t[2]).toTex() + ', ' + Q(vy2, t[2]).toTex() + ' \\right\\rangle$.'], hint: 'Divide the vector by its magnitude.' };
  });

  G('pre.vector-operations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['lin', 'lin', 'mag'], ['lin', 'mag', 'solve'], ['solve', 'lin', 'mag']));
    var u = [R.nz(-6, 6), R.nz(-6, 6)], v = [R.nz(-6, 6), R.nz(-6, 6)];
    if (kind === 'lin') {
      var a = by(ctx, R.pick([1, 1, 2]), R.pick([2, 3, -1, 3]), R.pick([2, 3, -2, 4])), b = by(ctx, R.pick([1, -1]), R.pick([-2, 3, -3, 2]), R.pick([-3, 2, -4, 5]));
      var w = [a * u[0] + b * v[0], a * u[1] + b * v[1]], ex = T.coef(a, '\\mathbf{u}') + T.coef(b, '\\mathbf{v}', false);
      return {
        q: 'Let $\\mathbf{u} = ' + T.vec(u) + '$ and $\\mathbf{v} = ' + T.vec(v) + '$. Find $' + ex + '$.',
        a: { t: 'tuple', v: w.map(String) },
        steps: [(a !== 1 || b !== 1 && b !== -1 ? 'Scale first: ' + (a !== 1 ? '$' + T.coef(a, '\\mathbf{u}') + ' = ' + T.vec([a * u[0], a * u[1]]) + '$' : '') + (a !== 1 && Math.abs(b) !== 1 ? ' and ' : '') + (Math.abs(b) !== 1 ? '$' + T.coef(Math.abs(b), '\\mathbf{v}') + ' = ' + T.vec([Math.abs(b) * v[0], Math.abs(b) * v[1]]) + '$' : '') + '. ' : '') + 'Scaling multiplies each component; a negative number also flips the direction.',
          'Then ' + (b > 0 ? 'add' : 'subtract') + ' component by component: $\\langle ' + (a * u[0]) + T.signed(b * v[0]) + ', ' + (a * u[1]) + T.signed(b * v[1]) + ' \\rangle = ' + T.vec(w) + '$.'],
        hint: 'Work on the $x$-components and the $y$-components separately.'
      };
    }
    if (kind === 'mag') {
      var s = [u[0] + v[0], u[1] + v[1]]; if (!s[0] && !s[1]) s = [u[0] + v[0] + 1, u[1]];
      var m = sqrtInt(s[0] * s[0] + s[1] * s[1]);
      return { q: 'Let $\\mathbf{u} = ' + T.vec(u) + '$ and $\\mathbf{v} = ' + T.vec([s[0] - u[0], s[1] - u[1]]) + '$. Find $|\\mathbf{u} + \\mathbf{v}|$.', a: numA(m.p, 'simplest'), steps: ['Add tip to tail: $\\mathbf{u} + \\mathbf{v} = ' + T.vec(s) + '$.', '$|\\mathbf{u} + \\mathbf{v}| = \\sqrt{' + T.p(s[0]) + '^2 + ' + T.p(s[1]) + '^2} = ' + m.t + '$. (In general this is not $|\\mathbf{u}| + |\\mathbf{v}|$.)'], hint: 'Add the vectors first, then find the length.' };
    }
    var k = R.pick([2, 3, -2]), wv = [R.int(-5, 5), R.int(-5, 5)], rhs = [k * wv[0] + u[0], k * wv[1] + u[1]];
    return {
      q: 'Find the vector $\\mathbf{w}$ with $' + k + '\\mathbf{w} + ' + T.vec(u) + ' = ' + T.vec(rhs) + '$.',
      a: { t: 'tuple', v: wv.map(String) },
      steps: ['Vectors follow the same algebra as numbers, one component at a time. Subtract $' + T.vec(u) + '$: $' + k + '\\mathbf{w} = ' + T.vec([rhs[0] - u[0], rhs[1] - u[1]]) + '$.', 'Divide by $' + k + '$: $\\mathbf{w} = ' + T.vec(wv) + '$.'],
      hint: 'Solve it like $' + k + 'w + a = b$, in each component.'
    };
  });

  var FORCE60 = [[3, 5, 7], [5, 3, 7], [7, 8, 13], [5, 16, 19], [6, 10, 14], [16, 5, 19], [8, 7, 13]]; // |F1+F2| at 60 degrees
  var FORCE120 = [[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 3, 7], [15, 7, 13], [16, 6, 14], [10, 16, 14]]; // at 120 degrees
  G('pre.vector-applications', function (R, ctx) {
    var kind = R.pick(by(ctx, ['perp', 'river', 'forces'], ['forces', 'river', 'equil', 'perp'], ['forces', 'equil', 'river']));
    if (kind === 'perp') {
      var t = triple(R, 4), k = R.pick([2, 3, 4, 5, 10, 20]), air = t[1] * k, wind = t[0] * k, gs = t[2] * k;
      if (air < wind) { var tmp = air; air = wind; wind = tmp; }
      var dir = R.pick([['north', 'east', 'west'], ['east', 'south', 'north'], ['south', 'west', 'east'], ['west', 'north', 'south']]);
      return {
        q: 'A plane heads due ' + dir[0] + ' at an airspeed of $' + air + '$ mph. A wind blows toward the ' + dir[1] + ' at $' + wind + '$ mph. What is the plane\'s speed over the ground?',
        a: numA(gs),
        steps: ['Velocities are vectors: the ground velocity is the plane\'s velocity plus the wind\'s, tip to tail. (Adding the speeds, $' + air + ' + ' + wind + '$, would only work if they pointed the same way.)',
          'These two vectors are at a right angle, so the ground speed is the hypotenuse: $\\sqrt{' + air + '^2 + ' + wind + '^2} = \\sqrt{' + (gs * gs) + '} = ' + gs + '$ mph.'],
        hint: 'Draw the two velocity vectors tip to tail. What shape do you get?'
      };
    }
    if (kind === 'river') {
      var tr = triple(R, 3), boat = tr[1], cur = tr[0], W = boat * R.pick([1, 2, 3]) * 0.1 * 10, tm = Q(W, boat), drift = tm.mul(cur);
      W = boat * R.pick([1, 2, 3, 4, 5]) / R.pick([1, 1, 2]); tm = Q.from(String(W)).div(boat); drift = tm.mul(cur);
      return {
        q: 'A boat crosses a river $' + W + '$ km wide. It points straight across at $' + boat + '$ km/h while the current flows downstream at $' + cur + '$ km/h. How long does the crossing take (in hours), and how far downstream does the boat land (in km)?',
        a: { t: 'multi', parts: [{ label: 'Time (h)', a: numA(tm.toPlain()) }, { label: 'Downstream (km)', a: numA(drift.toPlain()) }] },
        steps: ['Split the motion into components. Across: $' + boat + '$ km/h. Downstream: $' + cur + '$ km/h. The current does not slow the crossing.',
          'Time $= \\dfrac{' + W + '}{' + boat + '} = ' + tm.toTex() + '$ h.', 'Drift $= ' + cur + ' \\times ' + tm.toTex() + ' = ' + drift.toTex() + '$ km. (The actual speed is $\\sqrt{' + boat + '^2 + ' + cur + '^2} = ' + tr[2] + '$ km/h.)'],
        hint: 'Treat the across and downstream motions separately.'
      };
    }
    if (kind === 'forces') {
      var use60 = R.coin(), f = R.pick(use60 ? FORCE60 : FORCE120), ang = use60 ? 60 : 120;
      return {
        q: 'Two ropes pull on a crate with forces of $' + f[0] + '$ N and $' + f[1] + '$ N. The angle between the ropes is $' + T.deg(ang) + '$. Find the magnitude of the resultant force.',
        a: numA(f[2]),
        steps: ['Put the force vectors tip to tail. The resultant closes the triangle, and the angle inside the triangle is $180^\\circ - ' + T.deg(ang) + ' = ' + T.deg(180 - ang) + '$.',
          'Law of cosines: $|\\mathbf{F}|^2 = ' + f[0] + '^2 + ' + f[1] + '^2 - 2(' + f[0] + ')(' + f[1] + ')\\cos ' + T.deg(180 - ang) + ' = ' + (f[0] * f[0] + f[1] * f[1]) + (ang === 60 ? ' + ' : ' - ') + f[0] * f[1] + ' = ' + f[2] * f[2] + '$.',
          '$|\\mathbf{F}| = ' + f[2] + '$ N.'],
        hint: 'The angle in the tip-to-tail triangle is the supplement of the angle between the ropes.'
      };
    }
    var F1 = [R.int(-8, 8), R.int(-8, 8)], F2 = [R.int(-8, 8), R.int(-8, 8)], F3 = [-(F1[0] + F2[0]), -(F1[1] + F2[1])];
    if (!F3[0] && !F3[1]) F2[0] += 3, F3[0] -= 3;
    return {
      q: 'Forces $\\mathbf{F}_1 = ' + T.vec(F1) + '$ and $\\mathbf{F}_2 = ' + T.vec(F2) + '$ (in newtons) act on an object. What third force $\\mathbf{F}_3$ keeps the object in equilibrium (net force zero)?',
      a: { t: 'tuple', v: F3.map(String) },
      steps: ['Equilibrium means $\\mathbf{F}_1 + \\mathbf{F}_2 + \\mathbf{F}_3 = \\mathbf{0}$.', '$\\mathbf{F}_1 + \\mathbf{F}_2 = ' + T.vec([F1[0] + F2[0], F1[1] + F2[1]]) + '$, so $\\mathbf{F}_3$ is its opposite: $' + T.vec(F3) + '$.'],
      hint: 'The third force must cancel the sum of the first two.'
    };
  });

  G('pre.dot-product', function (R, ctx) {
    var kind = R.pick(by(ctx, ['calc', 'calc', 'perp'], ['angle', 'perp', 'given', 'calc'], ['angle', 'given', 'perp']));
    if (kind === 'calc') {
      var u = [R.int(-7, 7), R.int(-7, 7)], v = [R.int(-7, 7), R.int(-7, 7)], d = u[0] * v[0] + u[1] * v[1];
      return { q: 'Find $\\mathbf{u} \\cdot \\mathbf{v}$ for $\\mathbf{u} = ' + T.vec(u) + '$ and $\\mathbf{v} = ' + T.vec(v) + '$.', a: numA(d), steps: ['Multiply matching components and add: the dot product is a number, not a vector.', '$' + pp(u[0]) + pp(v[0]) + ' + ' + pp(u[1]) + pp(v[1]) + ' = ' + (u[0] * v[0]) + T.signed(u[1] * v[1]) + ' = ' + d + '$.'], hint: '$\\langle a, b \\rangle \\cdot \\langle c, d \\rangle = ac + bd$.' };
    }
    if (kind === 'perp') {
      var b = R.nz(-6, 6), c = R.nz(-6, 6), a = R.nz(-6, 6), k;
      // <k, a> . <b, c> = 0  ->  k = -a c / b ; make b divide a c
      a = b * R.nz(-3, 3); k = -a * c / b;
      return { q: 'Find $k$ so that $\\langle k, ' + a + ' \\rangle$ is perpendicular to $' + T.vec([b, c]) + '$.', a: numA(k), steps: ['Perpendicular vectors have dot product $0$ (since $\\cos 90^\\circ = 0$).', '$' + T.coef(b, 'k') + ' + ' + pp(a) + pp(c) + ' = 0$, so $' + T.coef(b, 'k') + ' = ' + (-a * c) + '$ and $k = ' + k + '$.'], hint: 'Set the dot product equal to zero.' };
    }
    if (kind === 'given') {
      var m1 = R.int(2, 9), m2 = R.int(2, 9), th = R.pick([30, 45, 60, 90, 120, 135, 150]), val = sdScale(sdTrig('cos', th), m1 * m2);
      return { q: 'Vectors $\\mathbf{u}$ and $\\mathbf{v}$ have $|\\mathbf{u}| = ' + m1 + '$, $|\\mathbf{v}| = ' + m2 + '$, and the angle between them is $' + T.deg(th) + '$. Find $\\mathbf{u} \\cdot \\mathbf{v}$ exactly.', a: numA(sdPlain(val), 'simplest'), steps: ['$\\mathbf{u} \\cdot \\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$ (from the law of cosines).', '$= ' + m1 + ' \\cdot ' + m2 + ' \\cdot ' + T.p(trigDeg('cos', th).t) + ' = ' + sdTex(val) + '$.'], hint: 'Use $|\\mathbf{u}||\\mathbf{v}|\\cos\\theta$.' };
    }
    var al = R.pick(SPECIAL), del = R.pick([45, 60, 90, 120, 135, 150, 30]), be = al + del;
    if (dirLen(al) === null && dirLen(be) !== null || dirLen(al) !== null && dirLen(be) === null) { if (del % 45 !== 0) del = R.pick([45, 90, 135]); be = al + del; }
    if ((dirLen(al) === null) !== (dirLen(be) === null)) { del = 90; be = al + 90; }
    var k1 = R.int(1, 3), k2 = R.int(1, 3), du = dirVec(al), dv = dirVec(be);
    var ux = sdScale(du[0], k1), uy = sdScale(du[1], k1), vx = sdScale(dv[0], k2), vy = sdScale(dv[1], k2);
    var dot = sdAdd(sdMul(ux, vx), sdMul(uy, vy)), nu = Math.sqrt(sdVal(sdAdd(sdMul(ux, ux), sdMul(uy, uy)))), nv = Math.sqrt(sdVal(sdAdd(sdMul(vx, vx), sdMul(vy, vy))));
    var ang = Math.round(Math.acos(Math.max(-1, Math.min(1, sdVal(dot) / (nu * nv)))) * 180 / PI);
    var nuT = sqrtInt(Math.round(nu * nu)).t, nvT = sqrtInt(Math.round(nv * nv)).t;
    return {
      q: 'Find the angle between $\\mathbf{u} = \\langle ' + sdTex(ux) + ', ' + sdTex(uy) + ' \\rangle$ and $\\mathbf{v} = \\langle ' + sdTex(vx) + ', ' + sdTex(vy) + ' \\rangle$, in degrees.',
      a: numA(ang),
      steps: ['$\\cos\\theta = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{u}||\\mathbf{v}|}$.', '$\\mathbf{u} \\cdot \\mathbf{v} = ' + sdTex(dot) + '$, $|\\mathbf{u}| = ' + nuT + '$, $|\\mathbf{v}| = ' + nvT + '$.',
        '$\\cos\\theta = \\dfrac{' + sdTex(dot) + '}{' + nuT + ' \\cdot ' + nvT + '} = ' + trigDeg('cos', ang).t + '$, so $\\theta = ' + T.deg(ang) + '$.'],
      hint: 'Divide the dot product by the product of the lengths.'
    };
  });

  G('pre.vector-projection', function (R, ctx) {
    var kind = R.pick(by(ctx, ['work', 'comp', 'proj'], ['proj', 'comp', 'work', 'perp'], ['proj', 'perp', 'work2']));
    if (kind === 'work') {
      var F = R.pick([10, 20, 25, 30, 40, 50, 60]), dist = R.pick([4, 5, 10, 12, 20, 50, 100]), th = R.pick([0, 30, 45, 60]);
      var W = sdScale(sdTrig('cos', th), F * dist);
      return { q: 'You pull a sled with a force of $' + F + '$ lb along a rope at $' + T.deg(th) + '$ above the ground, moving it $' + dist + '$ ft along level ground. How much work is done, in foot-pounds? Give an exact answer.', a: numA(sdPlain(W), 'simplest'), steps: ['Only the part of the force along the motion does work: $W = |\\mathbf{F}||\\mathbf{d}|\\cos\\theta = \\mathbf{F} \\cdot \\mathbf{d}$.', '$W = ' + F + ' \\cdot ' + dist + ' \\cdot ' + T.p(trigDeg('cos', th).t) + ' = ' + sdTex(W) + '$ ft-lb.'], hint: 'Work uses the component of the force in the direction of motion.' };
    }
    if (kind === 'work2') {
      var Fv = [R.int(-5, 8), R.int(-5, 8)], P1 = [R.int(-4, 4), R.int(-4, 4)], P2 = [P1[0] + R.int(1, 8), P1[1] + R.int(-5, 5)], d = [P2[0] - P1[0], P2[1] - P1[1]], Wv = Fv[0] * d[0] + Fv[1] * d[1];
      return { q: 'A constant force $\\mathbf{F} = ' + T.vec(Fv) + '$ (newtons) moves an object from $' + T.pt(P1) + '$ to $' + T.pt(P2) + '$ (meters). Find the work done, in joules.', a: numA(Wv), steps: ['Displacement: $\\mathbf{d} = ' + T.vec(d) + '$.', '$W = \\mathbf{F} \\cdot \\mathbf{d} = ' + pp(Fv[0]) + pp(d[0]) + ' + ' + pp(Fv[1]) + pp(d[1]) + ' = ' + Wv + '$ J.'], hint: 'Find the displacement vector, then take the dot product.' };
    }
    var t = triple(R, 2), v = [t[0] * R.sign(), t[1] * R.sign()], u = [R.int(-8, 8), R.int(-8, 8)];
    if (R.coin()) v = [v[1], v[0]];
    var dot = u[0] * v[0] + u[1] * v[1], vv = t[2] * t[2];
    if (dot === 0) { u[0] += 1; dot = u[0] * v[0] + u[1] * v[1]; }
    if (kind === 'comp') {
      var cmp = Q(dot, t[2]);
      return { q: 'Find the scalar projection (component) of $\\mathbf{u} = ' + T.vec(u) + '$ onto $\\mathbf{v} = ' + T.vec(v) + '$.', a: numA(cmp.toPlain()), steps: ['The component of $\\mathbf{u}$ along $\\mathbf{v}$ is $|\\mathbf{u}|\\cos\\theta = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|}$.', '$\\mathbf{u} \\cdot \\mathbf{v} = ' + dot + '$ and $|\\mathbf{v}| = ' + t[2] + '$, so the component is $' + cmp.toTex() + '$.' + (dot < 0 ? ' It is negative because the angle between them is obtuse.' : '')], hint: 'Divide the dot product by the length of $\\mathbf{v}$.' };
    }
    var c = Q(dot, vv), pj = [c.mul(v[0]), c.mul(v[1])];
    if (kind === 'proj') return { q: 'Find $\\operatorname{proj}_{\\mathbf{v}}\\mathbf{u}$ for $\\mathbf{u} = ' + T.vec(u) + '$ and $\\mathbf{v} = ' + T.vec(v) + '$.', a: { t: 'tuple', v: pj.map(function (x) { return x.toPlain(); }) }, steps: ['The projection is the shadow of $\\mathbf{u}$ on the line of $\\mathbf{v}$: $\\operatorname{proj}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|^2}\\,\\mathbf{v}$.', '$\\mathbf{u} \\cdot \\mathbf{v} = ' + dot + '$ and $|\\mathbf{v}|^2 = ' + vv + '$, so the scale factor is $' + c.toTex() + '$.', '$' + c.toTex() + T.vec(v) + ' = ' + T.vec(pj) + '$.'], hint: 'Scale $\\mathbf{v}$ by $\\frac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|^2}$.' };
    var perp = [Q(u[0]).sub(pj[0]), Q(u[1]).sub(pj[1])];
    return { q: 'Write $\\mathbf{u} = ' + T.vec(u) + '$ as a vector parallel to $\\mathbf{v} = ' + T.vec(v) + '$ plus a vector perpendicular to it. Find the <b>perpendicular</b> part.', a: { t: 'tuple', v: perp.map(function (x) { return x.toPlain(); }) }, steps: ['The parallel part is $\\operatorname{proj}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{' + dot + '}{' + vv + '}' + T.vec(v) + ' = ' + T.vec(pj) + '$.', 'The perpendicular part is what is left: $\\mathbf{u} - \\operatorname{proj}_{\\mathbf{v}}\\mathbf{u} = ' + T.vec(perp) + '$.', 'Check: its dot product with $\\mathbf{v}$ is $0$.'], hint: 'Subtract the projection from $\\mathbf{u}$.' };
  });

  // ======================= 05-polar.js
  // ===================================================================== Unit 5: Polar Coordinates and Complex Numbers

  function cxPlain(x, y) { // exact complex number x + y i (Sd parts) as plain text
    var xs = sdIsZero(x) ? '' : sdPlain(x), ys = sdIsZero(y) ? '' : sdPlain(y);
    if (!xs && !ys) return '0';
    if (!ys) return xs;
    var yi = ys === '1' ? 'i' : ys === '-1' ? '-i' : (sdTerms(y).length > 1 ? '(' + ys + ')' : ys) + '*i';
    return xs ? xs + (yi[0] === '-' ? '' : '+') + yi : yi;
  }
  function cisRect(rT, cT, sT) { // r(cos + i sin) written out with exact values
    var neg = sT[0] === '-', mag = neg ? sT.slice(1) : sT, term = (mag === '1' ? '' : mag + '\\,') + 'i', body;
    if (sT === '0') body = cT; else if (cT === '0') body = (neg ? '-' : '') + term; else body = cT + (neg ? ' - ' : ' + ') + term;
    return (rT === '1' ? '' : rT) + '\\left(' + body + '\\right)';
  }
  function cxTex(x, y) {
    var xs = sdIsZero(x) ? '' : sdTex(x);
    if (sdIsZero(y)) return xs || '0';
    var neg = sdVal(y) < 0, ay = neg ? sdNeg(y) : y, yt = sdTex(ay);
    var term = yt === '1' ? 'i' : (sdTerms(ay).length > 1 ? '\\left(' + yt + '\\right)' : yt) + (/sqrt/.test(yt) ? '\\,' : '') + 'i';
    return xs ? xs + (neg ? ' - ' : ' + ') + term : (neg ? '-' : '') + term;
  }
  function cisTex(rT, ang) { return (rT === '1' ? '' : rT) + '\\left(\\cos ' + ang + ' + i\\sin ' + ang + '\\right)'; }

  G('pre.polar-coordinates', function (R, ctx) {
    var kind = R.pick(by(ctx, ['reduce', 'negr', 'quad'], ['negr', 'toneg', 'quad', 'same'], ['toneg', 'negr', 'same', 'reduce']));
    var mode = R.pick(by(ctx, ['deg', 'rad'], ['rad', 'deg'], ['rad']));
    var r = R.int(1, 6), th = R.pick(NONAX.concat([0, 90, 180, 270]));
    function tup(rr, t) { return [String(rr), angPlain(t, mode)]; }
    var full = mode === 'deg' ? '360^\\circ' : '2\\pi', half = mode === 'deg' ? '180^\\circ' : '\\pi', rng = mode === 'deg' ? '0^\\circ \\le \\theta < 360^\\circ' : '0 \\le \\theta < 2\\pi';
    if (kind === 'reduce') {
      var k = R.pick([1, 2, -1]), big = th + 360 * k;
      return { q: 'Give another polar name for the point $\\left(' + r + ', ' + angTex(big, mode) + '\\right)$ with $r > 0$ and $' + rng + '$.', a: { t: 'tuple', v: tup(r, th), form: 'simplest' }, steps: ['Turning a full turn ($' + full + '$) more or less lands on the same ray, so the point does not change.', '$' + angTex(big, mode) + (k > 0 ? ' - ' : ' + ') + (Math.abs(k) === 1 ? '' : Math.abs(k) + ' \\cdot ') + full + ' = ' + angTex(th, mode) + '$, so the point is $\\left(' + r + ', ' + angTex(th, mode) + '\\right)$.'], hint: 'Add or subtract full turns.' };
    }
    if (kind === 'negr') {
      var t2 = mod(th + 180, 360);
      return { q: 'The point $\\left(-' + r + ', ' + angTex(th, mode) + '\\right)$ has a negative $r$. Rename it with $r > 0$ and $' + rng + '$.', a: { t: 'tuple', v: tup(r, t2), form: 'simplest' }, steps: ['A negative $r$ means: face the direction $\\theta$, then step backward $|r|$ units. That lands on the opposite ray, at angle $\\theta + ' + half + '$.', '$' + angTex(th, mode) + ' + ' + half + (th + 180 >= 360 ? ' - ' + full : '') + ' = ' + angTex(t2, mode) + '$, so the point is $\\left(' + r + ', ' + angTex(t2, mode) + '\\right)$.'], hint: 'Flip the sign of $r$ and turn half a turn.' };
    }
    if (kind === 'toneg') {
      var t3 = mod(th + 180, 360);
      return { q: 'Give a name for the point $\\left(' + r + ', ' + angTex(th, mode) + '\\right)$ that uses a <b>negative</b> $r$ and $' + rng + '$.', a: { t: 'tuple', v: tup(-r, t3), form: 'simplest' }, steps: ['To use $r = -' + r + '$, face the opposite direction and step backward.', 'The opposite direction is $' + angTex(th, mode) + ' + ' + half + (th + 180 >= 360 ? ' - ' + full : '') + ' = ' + angTex(t3, mode) + '$, so the point is $\\left(-' + r + ', ' + angTex(t3, mode) + '\\right)$.'], hint: 'A negative $r$ points backward, so the angle must point the opposite way.' };
    }
    if (kind === 'quad') {
      var t4 = R.pick(NONAX), neg = R.coin(), dirA = neg ? mod(t4 + 180, 360) : t4, qd = quadOf(dirA);
      return { q: 'In which quadrant is the point $\\left(' + (neg ? -r : r) + ', ' + angTex(t4, mode) + '\\right)$?', a: { t: 'mc', choices: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], v: qd - 1, keep: true }, steps: neg ? ['$r$ is negative, so the point is on the ray opposite to $' + angTex(t4, mode) + '$, which points along $' + angTex(dirA, mode) + '$.', 'That ray is in Quadrant ' + QN[qd] + '.'] : ['The ray at $' + angTex(t4, mode) + '$ is in Quadrant ' + QN[qd] + ', and $r > 0$ puts the point on that ray.'], hint: neg ? 'A negative $r$ sends the point to the opposite side of the pole.' : 'Find the quadrant of the angle.' };
    }
    var same = R.coin(), t5 = R.pick(NONAX), rr = R.int(1, 6), other;
    other = same ? R.pick([[-rr, mod(t5 + 180, 360)], [rr, t5 + 360], [rr, t5 - 360]]) : R.pick([[-rr, t5], [rr, mod(t5 + 180, 360)], [rr, mod(360 - t5, 360)]]);
    return {
      q: 'True or false: $\\left(' + rr + ', ' + angTex(t5, mode) + '\\right)$ and $\\left(' + other[0] + ', ' + angTex(other[1], mode) + '\\right)$ are the same point.',
      a: { t: 'tf', v: same },
      steps: ['Put both on the same footing: rename the second with $r > 0$ and an angle in one turn.', 'The second is $\\left(' + rr + ', ' + angTex(mod(other[0] < 0 ? other[1] + 180 : other[1], 360), mode) + '\\right)$; the first is $\\left(' + rr + ', ' + angTex(t5, mode) + '\\right)$.', same ? 'They match: the same point.' : 'The angles differ, so they are different points.'],
      hint: 'Rewrite both with positive $r$ and an angle between $0$ and one full turn.'
    };
  });

  G('pre.polar-rectangular', function (R, ctx) {
    var kind = R.pick(by(ctx, ['p2r', 'r2p', 'p2r'], ['r2p', 'p2r', 'eq2rect', 'rect2pol'], ['r2p', 'eq2rect', 'rect2pol']));
    if (kind === 'p2r') {
      var r = R.int(2, 8), th = R.pick(NONAX.concat(ctx.level > 1 ? [90, 180, 270] : [])), mode = R.pick(by(ctx, ['deg', 'rad'], ['rad'], ['rad'])), neg = ctx.level >= 2 && R.chance(0.3);
      var rr = neg ? -r : r, x = sdScale(sdTrig('cos', th), rr), y = sdScale(sdTrig('sin', th), rr);
      return {
        q: 'Convert the polar point $\\left(' + rr + ', ' + angTex(th, mode) + '\\right)$ to rectangular coordinates.',
        a: { t: 'tuple', v: [sdPlain(x), sdPlain(y)], form: 'simplest' },
        steps: ['Walk $r$ units along the ray at angle $\\theta$: $x = r\\cos\\theta$, $y = r\\sin\\theta$ (the unit-circle point, scaled by $r$).',
          '$x = ' + rr + ' \\cdot ' + pp(trigDeg('cos', th).t) + ' = ' + sdTex(x) + '$ and $y = ' + rr + ' \\cdot ' + pp(trigDeg('sin', th).t) + ' = ' + sdTex(y) + '$.',
          'The point is $\\left(' + sdTex(x) + ', ' + sdTex(y) + '\\right)$.'],
        hint: 'Use $x = r\\cos\\theta$ and $y = r\\sin\\theta$.'
      };
    }
    if (kind === 'r2p') {
      var d = R.pick(by(ctx, [45, 135, 225, 315, 120, 150, 210, 240, 300, 330, 30, 60], NONAX.concat([90, 180, 270]), NONAX)), k = R.int(1, 4), dv = dirVec(d), x2 = sdScale(dv[0], k), y2 = sdScale(dv[1], k);
      var len = dirLen(d), rS = len === null ? sdScale(Sd({ 2: 1 }), k) : sdQ(len * k), qd = quadOf(d), rf = refDeg(d);
      var st = ['$r = \\sqrt{x^2 + y^2} = \\sqrt{' + pp(sdTex(x2)) + '^2 + ' + pp(sdTex(y2)) + '^2} = ' + sdTex(rS) + '$.'];
      if (qd) st.push('$\\tan\\theta = \\dfrac{y}{x}$ gives a reference angle of $' + radTex(rf) + '$. The point is in Quadrant ' + QN[qd] + ', so $\\theta = ' + radTex(d) + '$. (Using $\\tan^{-1}(y/x)$ alone would give an angle in Quadrant I or IV.)');
      else st.push('The point is on an axis, at angle $' + radTex(d) + '$.');
      return { q: 'Convert $\\left(' + sdTex(x2) + ', ' + sdTex(y2) + '\\right)$ to polar coordinates with $r > 0$ and $0 \\le \\theta < 2\\pi$.', a: { t: 'tuple', v: [sdPlain(rS), radPlain(d)], form: 'simplest' }, steps: st, hint: 'Find $r$ with the Pythagorean theorem, then place $\\theta$ in the right quadrant.' };
    }
    var a = R.int(2, 9);
    if (kind === 'eq2rect') {
      var E = R.pick([
        ['r = ' + a, 'x^2 + y^2 = ' + a * a, 'x^2+y^2=' + a * a, 'Square both sides: $r^2 = ' + a * a + '$, and $r^2 = x^2 + y^2$.'],
        ['r = ' + a + '\\cos\\theta', 'x^2 + y^2 = ' + a + 'x', 'x^2+y^2=' + a + 'x', 'Multiply both sides by $r$: $r^2 = ' + a + 'r\\cos\\theta$, so $x^2 + y^2 = ' + a + 'x$. (A circle through the pole.)'],
        ['r = ' + a + '\\sin\\theta', 'x^2 + y^2 = ' + a + 'y', 'x^2+y^2=' + a + 'y', 'Multiply both sides by $r$: $r^2 = ' + a + 'r\\sin\\theta$, so $x^2 + y^2 = ' + a + 'y$.'],
        ['r\\cos\\theta = ' + a, 'x = ' + a, 'x=' + a, '$r\\cos\\theta$ is $x$, so this is the vertical line $x = ' + a + '$.'],
        ['r\\sin\\theta = -' + a, 'y = -' + a, 'y=-' + a, '$r\\sin\\theta$ is $y$, so this is the horizontal line $y = -' + a + '$.'],
        ['r = ' + a + '\\sec\\theta', 'x = ' + a, 'x=' + a, '$r = \\dfrac{' + a + '}{\\cos\\theta}$, so $r\\cos\\theta = ' + a + '$, which is $x = ' + a + '$.'],
        ['r = \\dfrac{' + a + '}{\\cos\\theta + \\sin\\theta}', 'x + y = ' + a, 'x+y=' + a, 'Multiply out: $r\\cos\\theta + r\\sin\\theta = ' + a + '$, which is $x + y = ' + a + '$.']
      ]);
      return { q: 'Write the polar equation $' + E[0] + '$ in rectangular form (using $x$ and $y$).', a: { t: 'eq', v: E[2] }, steps: [E[3], 'Rectangular form: $' + E[1] + '$.'], hint: 'Use $x = r\\cos\\theta$, $y = r\\sin\\theta$ and $r^2 = x^2 + y^2$.' };
    }
    var F = R.pick([
      ['x = ' + a, a + '/cos(theta)', '\\dfrac{' + a + '}{\\cos\\theta} = ' + a + '\\sec\\theta', 'Replace $x$ with $r\\cos\\theta$: $r\\cos\\theta = ' + a + '$.'],
      ['y = ' + a, a + '/sin(theta)', '\\dfrac{' + a + '}{\\sin\\theta} = ' + a + '\\csc\\theta', 'Replace $y$ with $r\\sin\\theta$: $r\\sin\\theta = ' + a + '$.'],
      ['x^2 + y^2 = ' + 2 * a + 'x', 2 * a + '*cos(theta)', 2 * a + '\\cos\\theta', '$r^2 = ' + 2 * a + 'r\\cos\\theta$; divide by $r$ (the pole, $r = 0$, is already on the curve).'],
      ['x^2 + y^2 = ' + 2 * a + 'y', 2 * a + '*sin(theta)', 2 * a + '\\sin\\theta', '$r^2 = ' + 2 * a + 'r\\sin\\theta$; divide by $r$.'],
      ['x^2 + y^2 = ' + a * a, String(a), String(a), '$r^2 = ' + a * a + '$, so $r = ' + a + '$ (a circle).']
    ]);
    return { q: 'Write $' + F[0] + '$ as a polar equation, solved for $r$. Type the right side, $r = \\ldots$', a: { t: 'expr', v: F[1], vars: ['theta'] }, steps: [F[3], 'So $r = ' + F[2] + '$.'], hint: 'Substitute $x = r\\cos\\theta$, $y = r\\sin\\theta$, $x^2 + y^2 = r^2$, then solve for $r$.' };
  });

  var SHAPES = ['Circle', 'Cardioid', 'Limaçon with an inner loop', 'Limaçon without an inner loop', 'Rose'];
  G('pre.polar-graphs', function (R, ctx) {
    function c1(k) { return k === 1 ? '' : k === -1 ? '-' : k; } // a coefficient of 1 is not written
    var kind = R.pick(by(ctx, ['name', 'petals', 'value'], ['name', 'petals', 'pole', 'max'], ['pole', 'name', 'max', 'sym']));
    var a = R.int(1, 5), fn = R.pick(['cos', 'sin']), sg = R.pick(['+', '-']);
    if (kind === 'name') {
      var typ = R.int(0, 4), eq, why;
      if (typ === 0) { eq = 'r = ' + 2 * a + '\\' + fn + '\\theta'; why = 'Multiplying by $r$ gives $x^2 + y^2 = ' + 2 * a + (fn === 'cos' ? 'x' : 'y') + '$: a circle through the pole.'; }
      else if (typ === 1) { eq = 'r = ' + a + ' ' + sg + ' ' + c1(a) + '\\' + fn + '\\theta'; why = 'In $r = a \\pm b\\' + fn + '\\theta$ with $a = b$, $r$ just reaches $0$ once: a heart-shaped cardioid.'; }
      else if (typ === 2) { var b = a + R.int(1, 3); eq = 'r = ' + a + ' ' + sg + ' ' + c1(b) + '\\' + fn + '\\theta'; why = 'In $r = a \\pm b\\' + fn + '\\theta$ with $a < b$ (here $' + a + ' < ' + b + '$), $r$ turns negative for part of the sweep, which draws an inner loop.'; }
      else if (typ === 3) { var b2 = R.int(1, a + 1); var a2 = b2 + R.int(1, 3); eq = 'r = ' + a2 + ' ' + sg + ' ' + c1(b2) + '\\' + fn + '\\theta'; why = 'In $r = a \\pm b\\' + fn + '\\theta$ with $a > b$ (here $' + a2 + ' > ' + b2 + '$), $r$ never reaches $0$: a limaçon with no inner loop.'; }
      else { var n = R.int(2, 5); eq = 'r = ' + c1(a) + '\\' + fn + '(' + n + '\\theta)'; why = '$r = a\\' + fn + '(n\\theta)$ with $n \\ge 2$ is a rose: $r$ swings between $' + a + '$ and $-' + a + '$ many times, drawing petals.'; }
      return { q: 'What shape is the graph of $' + eq + '$?', a: { t: 'mc', choices: SHAPES.slice(), v: typ, keep: true }, steps: [why], hint: 'Compare the constant term with the coefficient of the trig function.' };
    }
    if (kind === 'petals') {
      var n2 = R.int(2, 7), pet = n2 % 2 ? n2 : 2 * n2;
      return { q: 'How many petals does the rose $r = ' + c1(a) + '\\' + fn + '(' + n2 + '\\theta)$ have?', a: numA(pet), steps: ['As $\\theta$ goes once around, $' + fn + '(' + n2 + '\\theta)$ goes through $' + n2 + '$ full cycles, giving $' + 2 * n2 + '$ bumps of $r$ (half positive, half negative).', n2 % 2 ? 'For odd $n$, each negative bump retraces a positive petal on the opposite side, so there are only $n = ' + n2 + '$ petals.' : 'For even $n$, the negative bumps land on new places, so there are $2n = ' + pet + '$ petals.'], hint: 'Odd $n$: $n$ petals. Even $n$: $2n$ petals.' };
    }
    if (kind === 'value') {
      var b3 = R.int(1, 4), th = R.pick([30, 60, 90, 120, 150, 180, 210, 270, 300, 0]), mode = 'rad';
      var rv = sdAdd(sdQ(a), sdScale(sdTrig(fn, th), (sg === '+' ? 1 : -1) * b3));
      return { q: 'For the curve $r = ' + a + ' ' + sg + ' ' + c1(b3) + '\\' + fn + '\\theta$, find $r$ when $\\theta = ' + radTex(th) + '$.', a: numA(sdPlain(rv), 'simplest'), steps: ['$\\' + fn + ' ' + radTex(th) + ' = ' + trigDeg(fn, th).t + '$.', '$r = ' + a + ' ' + sg + ' ' + b3 + ' \\cdot ' + pp(trigDeg(fn, th).t) + ' = ' + sdTex(rv) + '$.' + (sdVal(rv) < 0 ? ' A negative $r$: the point is plotted on the opposite side of the pole.' : '')], hint: 'Substitute the angle and use the exact trig value.' };
    }
    if (kind === 'max') {
      var useRose = R.coin();
      if (useRose) { var n3 = R.int(2, 5); return { q: 'How far from the pole does the rose $r = ' + c1(a) + '\\' + fn + '(' + n3 + '\\theta)$ reach? (Give the petal length.)', a: numA(a), steps: ['$\\' + fn + '(' + n3 + '\\theta)$ ranges from $-1$ to $1$, so $|r|$ is at most $' + a + '$.', 'Each petal reaches $' + a + '$ units from the pole.'], hint: 'What is the largest value of $|\\' + fn + '(\\cdot)|$?' }; }
      var b4 = R.int(1, 5);
      return { q: 'What is the greatest distance from the pole to the curve $r = ' + a + ' ' + sg + ' ' + c1(b4) + '\\' + fn + '\\theta$?', a: numA(a + b4), steps: ['$\\' + fn + '\\theta$ ranges over $[-1, 1]$, so $r$ ranges from $' + (a - b4) + '$ to $' + (a + b4) + '$.', 'The distance is $|r|$, which is largest at $' + (a + b4) + '$.'], hint: 'Make the trig term help the constant as much as possible.' };
    }
    if (kind === 'pole') {
      var P = R.pick([
        ['r = ' + a + ' - ' + c1(a) + '\\sin\\theta', function (x) { return 1 - Math.sin(x); }, '1 - \\sin\\theta = 0'],
        ['r = ' + a + ' + ' + c1(a) + '\\cos\\theta', function (x) { return 1 + Math.cos(x); }, '1 + \\cos\\theta = 0'],
        ['r = ' + a + ' + ' + 2 * a + '\\cos\\theta', function (x) { return 1 + 2 * Math.cos(x); }, '\\cos\\theta = -\\frac{1}{2}'],
        ['r = ' + a + ' - ' + 2 * a + '\\sin\\theta', function (x) { return 1 - 2 * Math.sin(x); }, '\\sin\\theta = \\frac{1}{2}'],
        ['r = ' + c1(a) + '\\cos(2\\theta)', function (x) { return Math.cos(2 * x); }, '\\cos 2\\theta = 0'],
        ['r = ' + c1(a) + '\\sin(3\\theta)', function (x) { return Math.sin(3 * x); }, '\\sin 3\\theta = 0'],
        ['r = ' + 2 * a + '\\cos\\theta', function (x) { return Math.cos(x); }, '\\cos\\theta = 0']
      ]);
      var ss = solveScan(P[1]);
      return { q: 'Find every $\\theta$ in $[0, 2\\pi)$ where the curve $' + P[0] + '$ passes through the pole.', a: { t: 'set', v: solSet(ss), form: 'simplest' }, steps: ['The curve is at the pole when $r = 0$.', 'Solve $' + P[2] + '$ for $0 \\le \\theta < 2\\pi$: $\\theta = ' + solTex(ss) + '$.'], hint: 'Set $r = 0$ and solve.' };
    }
    var useCos = R.coin(), eq2 = 'r = ' + a + ' ' + sg + ' ' + c1(R.int(1, 5)) + (useCos ? '\\cos\\theta' : '\\sin\\theta');
    return {
      q: 'The graph of $' + eq2 + '$ must be symmetric about which line?',
      a: mcq(useCos ? 'The polar axis (the $x$-axis)' : 'The line $\\theta = \\frac{\\pi}{2}$ (the $y$-axis)', [useCos ? 'The line $\\theta = \\frac{\\pi}{2}$ (the $y$-axis)' : 'The polar axis (the $x$-axis)', 'The line $\\theta = \\frac{\\pi}{4}$', 'The line $\\theta = \\frac{3\\pi}{4}$']),
      steps: [useCos ? 'Replacing $\\theta$ with $-\\theta$ leaves $\\cos\\theta$ unchanged, so the point at $-\\theta$ has the same $r$: the mirror image across the polar axis is on the curve.' : 'Replacing $\\theta$ with $\\pi - \\theta$ leaves $\\sin\\theta$ unchanged, so the mirror image across the line $\\theta = \\frac{\\pi}{2}$ is on the curve.'],
      hint: useCos ? 'What does $\\cos(-\\theta)$ equal?' : 'What does $\\sin(\\pi - \\theta)$ equal?'
    };
  });

  G('pre.complex-plane', function (R, ctx) {
    var kind = R.pick(by(ctx, ['mod', 'quad', 'conj'], ['mod', 'dist', 'conj', 'sum'], ['dist', 'mid', 'mod']));
    var a = R.nz(-8, 8), b = R.nz(-8, 8);
    function z(x, y) { return T.terms([[x, ''], [y, 'i']]); }
    if (kind === 'mod') {
      if (R.coin()) { var t = triple(R, 2); a = t[0] * R.sign(); b = t[1] * R.sign(); }
      var m = sqrtInt(a * a + b * b);
      return { q: 'Find the modulus $|' + z(a, b) + '|$.', a: numA(m.p, 'simplest'), steps: ['Plot $' + z(a, b) + '$ at the point $' + T.pt([a, b]) + '$. The modulus is its distance from $0$.', '$|' + z(a, b) + '| = \\sqrt{' + pp(a) + '^2 + ' + pp(b) + '^2} = \\sqrt{' + (a * a + b * b) + '}' + (m.t !== '\\sqrt{' + (a * a + b * b) + '}' ? ' = ' + m.t : '') + '$.'], hint: 'Use the distance formula from the origin to $(a, b)$.' };
    }
    if (kind === 'quad') {
      var qd = a > 0 ? (b > 0 ? 1 : 4) : (b > 0 ? 2 : 3);
      return { q: 'In which quadrant of the complex plane is $' + z(a, b) + '$?', a: { t: 'mc', choices: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], v: qd - 1, keep: true }, steps: ['The real part goes on the horizontal axis and the imaginary part on the vertical axis: plot $' + T.pt([a, b]) + '$.', 'Real part ' + sgnWord(a) + ', imaginary part ' + sgnWord(b) + ': Quadrant ' + QN[qd] + '.'], hint: 'Real part across, imaginary part up.' };
    }
    if (kind === 'conj') {
      return { q: 'Write the complex conjugate of $z = ' + z(a, b) + '$. How is it placed relative to $z$ in the complex plane?', a: numA(a + (b > 0 ? '-' : '+') + Math.abs(b) + 'i'), steps: ['The conjugate keeps the real part and flips the sign of the imaginary part: $\\bar{z} = ' + z(a, -b) + '$.', 'In the plane, $' + T.pt([a, b]) + '$ moves to $' + T.pt([a, -b]) + '$: the reflection across the real axis.'], hint: 'Change the sign of the imaginary part.' };
    }
    var c = R.nz(-8, 8), d = R.nz(-8, 8);
    if (kind === 'sum') {
      var sub = R.coin(), sx = sub ? a - c : a + c, sy = sub ? b - d : b + d;
      return { q: 'Let $z = ' + z(a, b) + '$ and $w = ' + z(c, d) + '$. Find $z ' + (sub ? '-' : '+') + ' w$.', a: numA(sx + (sy >= 0 ? '+' : '-') + Math.abs(sy) + 'i'), steps: ['Complex numbers add like vectors: real parts with real parts, imaginary with imaginary. (Geometrically, ' + (sub ? 'add $-w$' : 'put $w$ tip to tail after $z$') + '.)', '$(' + a + T.signed(sub ? -c : c) + ') + (' + b + T.signed(sub ? -d : d) + ')i = ' + z(sx, sy) + '$.'], hint: 'Combine the real parts and the imaginary parts separately.', nolint: ['+ 0'] };
    }
    if (kind === 'mid') {
      if ((a + c) % 2) c += 1; if ((b + d) % 2) d += 1;
      return { q: 'Find the midpoint of $z = ' + z(a, b) + '$ and $w = ' + z(c, d) + '$ in the complex plane, as a complex number.', a: numA(((a + c) / 2) + '+(' + ((b + d) / 2) + ')*i'), steps: ['The midpoint averages the two points: $\\dfrac{z + w}{2}$.', '$\\dfrac{' + (a + c) + T.signed(b + d) + 'i}{2} = ' + z((a + c) / 2, (b + d) / 2) + '$.'], hint: 'Average the real parts and the imaginary parts.', nolint: ['+ 0'] };
    }
    var dx = a - c, dy = b - d; if (!dx && !dy) { c += 3; dx = a - c; }
    var dm = sqrtInt(dx * dx + dy * dy);
    return { q: 'Find the distance between $z = ' + z(a, b) + '$ and $w = ' + z(c, d) + '$ in the complex plane.', a: numA(dm.p, 'simplest'), steps: ['The distance is $|z - w|$.', '$z - w = ' + z(dx, dy) + '$, so $|z - w| = \\sqrt{' + pp(dx) + '^2 + ' + pp(dy) + '^2} = ' + dm.t + '$.'], hint: 'Subtract, then take the modulus.', nolint: ['+ 0'] };
  });

  function cxDir(R, ctx, pool) { // a complex number k * dirVec(d): { x, y, r (Sd), d }
    var d = R.pick(pool), k = R.int(1, by(ctx, 3, 4, 4)), dv = dirVec(d), len = dirLen(d);
    return { x: sdScale(dv[0], k), y: sdScale(dv[1], k), r: len === null ? Sd({ 2: k }) : sdQ(len * k), d: d };
  }
  G('pre.complex-polar-form', function (R, ctx) {
    var kind = R.pick(by(ctx, ['topolar', 'torect', 'topolar'], ['topolar', 'torect', 'arg'], ['topolar', 'arg', 'torect']));
    if (kind === 'topolar' || kind === 'arg') {
      var w = cxDir(R, ctx, NONAX.concat(ctx.level > 1 ? [90, 180, 270] : [])), qd = quadOf(w.d);
      var st = ['Plot $' + cxTex(w.x, w.y) + '$ at $\\left(' + sdTex(w.x) + ', ' + sdTex(w.y) + '\\right)$.', 'Modulus: $r = \\sqrt{' + pp(sdTex(w.x)) + '^2 + ' + pp(sdTex(w.y)) + '^2} = ' + sdTex(w.r) + '$.',
        qd ? 'Argument: the reference angle has $\\tan = \\left|\\frac{b}{a}\\right| = ' + trigDeg('tan', refDeg(w.d)).t + '$, so it is $' + radTex(refDeg(w.d)) + '$; in Quadrant ' + QN[qd] + ' that gives $\\theta = ' + radTex(w.d) + '$.' : 'Argument: the point is on an axis, at $\\theta = ' + radTex(w.d) + '$.'];
      if (kind === 'arg') return { q: 'Find the argument $\\theta$ of $' + cxTex(w.x, w.y) + '$, with $0 \\le \\theta < 2\\pi$.', a: numA(radPlain(w.d), 'simplest'), steps: [st[0], st[2]], hint: 'Find the reference angle, then use the quadrant.' };
      return { q: 'Write $z = ' + cxTex(w.x, w.y) + '$ in polar form $r(\\cos\\theta + i\\sin\\theta)$ with $r > 0$ and $0 \\le \\theta < 2\\pi$.', a: { t: 'multi', parts: [{ label: '$r =$', a: numA(sdPlain(w.r), 'simplest') }, { label: '$\\theta =$', a: numA(radPlain(w.d), 'simplest') }] }, steps: st.concat(['$z = ' + cisTex(sdTex(w.r), radTex(w.d)) + '$.']), hint: 'Find the distance from $0$ and the angle from the positive real axis.' };
    }
    var r = R.int(2, 8), d = R.pick(NONAX.concat([90, 180, 270])), x = sdScale(sdTrig('cos', d), r), y = sdScale(sdTrig('sin', d), r);
    return { q: 'Write $' + cisTex(String(r), radTex(d)) + '$ in the form $a + bi$.', a: numA(cxPlain(x, y)), steps: ['$\\cos ' + radTex(d) + ' = ' + trigDeg('cos', d).t + '$ and $\\sin ' + radTex(d) + ' = ' + trigDeg('sin', d).t + '$.', 'Multiply by $' + r + '$: $a = ' + sdTex(x) + '$, $b = ' + sdTex(y) + '$, so the number is $' + cxTex(x, y) + '$.'], hint: 'Evaluate the cosine and sine exactly, then distribute.' };
  });

  G('pre.de-moivre', function (R, ctx) {
    var kind = R.pick(by(ctx, ['mul', 'pow1', 'div'], ['mul', 'div', 'pow1', 'powrect'], ['powrect', 'mul', 'pow1']));
    var ANG = [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 300, 315, 330, 15, 75, 105];
    if (kind === 'mul' || kind === 'div') {
      var r1 = R.int(2, 9), r2 = R.int(2, 5), t1 = R.pick(ANG), t2 = R.pick(ANG);
      if (kind === 'div') { r1 = r2 * R.int(1, 5); if (r1 === r2) r1 *= 2; }
      var r = kind === 'mul' ? Q(r1 * r2) : Q(r1, r2), t = mod(kind === 'mul' ? t1 + t2 : t1 - t2, 360);
      var raw = kind === 'mul' ? t1 + t2 : t1 - t2;
      return {
        q: 'Let $z = ' + cisTex(String(r1), radTex(t1)) + '$ and $w = ' + cisTex(String(r2), radTex(t2)) + '$. Write $' + (kind === 'mul' ? 'zw' : '\\dfrac{z}{w}') + '$ in polar form, with $0 \\le \\theta < 2\\pi$.',
        a: { t: 'multi', parts: [{ label: '$r =$', a: numA(r.toPlain()) }, { label: '$\\theta =$', a: numA(radPlain(t), 'simplest') }] },
        steps: [kind === 'mul' ? 'Multiplying complex numbers multiplies their moduli and <b>adds</b> their angles (this comes from the sum formulas for sine and cosine).' : 'Dividing divides the moduli and <b>subtracts</b> the angles.',
          '$r = ' + r1 + (kind === 'mul' ? ' \\cdot ' : ' \\div ') + r2 + ' = ' + r.toTex() + '$; $\\theta = ' + radTex(t1) + (kind === 'mul' ? ' + ' : ' - ') + radTex(t2) + ' = ' + radTex(raw) + '$' + (raw !== t ? ', which is $' + radTex(t) + '$ after ' + (raw < t ? 'adding' : 'subtracting') + ' $2\\pi$' : '') + '.'],
        hint: kind === 'mul' ? 'Multiply the moduli, add the angles.' : 'Divide the moduli, subtract the angles.'
      };
    }
    if (kind === 'pow1') {
      var r0 = R.int(1, 3), n = R.int(2, 6), t0 = R.pick([15, 30, 45, 60, 90, 120, 135, 150, 75]);
      if (n * t0 % 15 !== 0 || mod(n * t0, 360) % 15) t0 = 30;
      var tn = mod(n * t0, 360);
      if (tn % 30 !== 0 && tn % 45 !== 0) { t0 = 30; tn = mod(n * 30, 360); }
      var rn = Math.pow(r0, n), x = sdScale(sdTrig('cos', tn), rn), y = sdScale(sdTrig('sin', tn), rn);
      return {
        q: 'Use De Moivre\'s theorem to write $\\left[' + cisTex(String(r0), radTex(t0)) + '\\right]^{' + n + '}$ in the form $a + bi$.',
        a: numA(cxPlain(x, y)),
        steps: ['De Moivre: $[r(\\cos\\theta + i\\sin\\theta)]^n = r^n(\\cos n\\theta + i\\sin n\\theta)$: multiplying $n$ times multiplies the modulus $n$ times and adds the angle $n$ times.',
          '$r^n = ' + r0 + '^{' + n + '} = ' + rn + '$ and $n\\theta = ' + n + ' \\cdot ' + radTex(t0) + ' = ' + radTex(n * t0) + '$' + (n * t0 !== tn ? ', the same direction as $' + radTex(tn) + '$' : '') + '.',
          '$' + cisRect(String(rn), trigDeg('cos', tn).t, trigDeg('sin', tn).t) + ' = ' + cxTex(x, y) + '$.'],
        hint: 'Raise the modulus to the power; multiply the angle by the power.'
      };
    }
    // (a + bi)^n from a rectangular base
    var bases = [[45, 1], [135, 1], [315, 1], [60, 2], [30, 2], [120, 2], [330, 2], [300, 2], [150, 2]];
    var B = R.pick(bases), n2 = R.int(3, 8), dv = dirVec(B[0]), d = B[0], tn2 = mod(n2 * d, 360);
    var rS = B[1] === 1 ? Sd({ 2: 1 }) : sdQ(2), rn2 = sdQ(1);
    for (var i = 0; i < n2; i++) rn2 = sdMul(rn2, rS);
    var X = sdMul(rn2, sdTrig('cos', tn2)), Y = sdMul(rn2, sdTrig('sin', tn2));
    return {
      q: 'Find $\\left(' + cxTex(dv[0], dv[1]) + '\\right)^{' + n2 + '}$ in the form $a + bi$.',
      a: numA(cxPlain(X, Y)),
      steps: ['Polar form first: $' + cxTex(dv[0], dv[1]) + '$ has modulus $' + sdTex(rS) + '$ and argument $' + radTex(d) + '$.',
        'De Moivre: modulus $' + (sdTerms(rS)[0] === 1 ? sdTex(rS) : pp(sdTex(rS))) + '^{' + n2 + '} = ' + sdTex(rn2) + '$, angle $' + n2 + ' \\cdot ' + radTex(d) + ' = ' + radTex(n2 * d) + '$' + (n2 * d !== tn2 ? ', coterminal with $' + radTex(tn2) + '$' : '') + '.',
        '$' + cisRect(sdTex(rn2), trigDeg('cos', tn2).t, trigDeg('sin', tn2).t) + ' = ' + cxTex(X, Y) + '$.'],
      hint: 'Change to polar form, use De Moivre, then change back.'
    };
  });

  G('pre.complex-roots', function (R, ctx) {
    var kind = R.pick(by(ctx, ['roots', 'args', 'roots'], ['roots', 'args', 'spacing'], ['roots', 'args', 'roots']));
    var combos = [[0, 2], [0, 3], [0, 4], [0, 6], [180, 2], [180, 3], [180, 4], [180, 6], [90, 2], [90, 3], [270, 2], [270, 3], [120, 2], [60, 2], [240, 2], [300, 2], [0, 8]];
    var c = R.pick(by(ctx, combos.filter(function (x) { return x[1] <= 3; }), combos, combos.filter(function (x) { return x[1] >= 3 || x[0] % 90; }))), phi = c[0], n = c[1];
    var m = R.pick(n === 2 ? [1, 2, 3, 4, 5] : n === 3 ? [1, 2, 3, 4] : n === 4 ? [1, 2, 3] : n === 8 ? [1] : [1, 2]), Rm = Math.pow(m, n);
    var wx = sdScale(sdTrig('cos', phi), Rm), wy = sdScale(sdTrig('sin', phi), Rm);
    var angs = []; for (var k = 0; k < n; k++) angs.push((phi + 360 * k) / n);
    var wT = cxTex(wx, wy);
    var name = { 2: 'square', 3: 'cube', 4: 'fourth', 6: 'sixth', 8: 'eighth' }[n];
    var base = ['Polar form: $' + wT + ' = ' + cisTex(String(Rm), radTex(phi)) + '$.',
      'An $n$th root has modulus $\\sqrt[' + n + ']{' + Rm + '} = ' + m + '$ and angle $\\dfrac{' + radTex(phi) + ' + 2\\pi k}{' + n + '}$ for $k = 0, 1' + (n > 2 ? ', \\ldots, ' + (n - 1) : '') + '$: adding full turns before dividing gives new angles.',
      'The angles are $' + texList(angs.map(radTex)) + '$, spaced $\\frac{2\\pi}{' + n + '}$ apart around a circle of radius $' + m + '$.'];
    if (kind === 'spacing') return { q: 'The ' + name + ' roots of $' + wT + '$ sit evenly around a circle. What is the angle between neighboring roots, in radians, and how many roots are there?', a: { t: 'multi', parts: [{ label: 'Angle', a: numA(piPlain(2, n), 'simplest') }, { label: 'Number of roots', a: numA(n) }] }, steps: base, hint: 'A nonzero number has exactly $n$ different $n$th roots.' };
    if (kind === 'args') return { q: 'Find the arguments $\\theta$ (with $0 \\le \\theta < 2\\pi$) of all the ' + name + ' roots of $' + wT + '$.', a: { t: 'set', v: angs.map(radPlain), form: 'simplest' }, steps: base, hint: 'Divide $\\theta + 2\\pi k$ by $' + n + '$ for each $k$.' };
    var roots = angs.map(function (a) { return [sdScale(sdTrig('cos', a), m), sdScale(sdTrig('sin', a), m)]; });
    return { q: 'Find all the ' + name + ' roots of $' + wT + '$, in the form $a + bi$.', a: { t: 'set', v: roots.map(function (z) { return cxPlain(z[0], z[1]); }) }, steps: base.concat(['In rectangular form: $' + texList(roots.map(function (z) { return cxTex(z[0], z[1]); })) + '$.']), hint: 'Write the number in polar form; there are ' + n + ' roots, $\\frac{2\\pi}{' + n + '}$ apart.' };
  });

  // ======================= 06-parametric.js
  // ===================================================================== Unit 6: Parametric Equations

  G('pre.parametric-equations', function (R, ctx) {
    function c1(k) { return k === 1 ? '' : k === -1 ? '-' : k; } // a coefficient of 1 is not written
    var kind = R.pick(by(ctx, ['point', 'findt', 'dir'], ['point', 'findt', 'dir', 'cross'], ['cross', 'speed', 'dir', 'findt']));
    var a = R.nz(-4, 4), b = R.int(-5, 5), c = R.nz(-3, 3), d = R.int(-6, 6);
    if (kind === 'point') {
      var t0 = R.nz(-3, 3), useQ = R.coin();
      var xT = 'x = ' + T.lin(a, 't', b), yT = useQ ? 'y = ' + T.poly([c, 0, d], 't') : 'y = ' + T.lin(c, 't', d);
      var X = a * t0 + b, Y = useQ ? c * t0 * t0 + d : c * t0 + d;
      return { q: 'A particle moves along $' + xT + '$, $' + yT + '$. Where is it when $t = ' + t0 + '$?', a: { t: 'tuple', v: [String(X), String(Y)] }, steps: ['Put $t = ' + t0 + '$ into both equations.', '$x = ' + T.lin(a, pp(t0), b).replace(/(\d)\(/, '$1 \\cdot (') + ' = ' + X + '$ and $y = ' + Y + '$.', 'The particle is at $' + T.pt([X, Y]) + '$.'], hint: 'Each coordinate has its own formula in $t$.' };
    }
    if (kind === 'findt') {
      var t1 = R.int(-4, 5), X1 = a * t1 + b, Y1 = c * t1 * t1 + d;
      return { q: 'The curve $x = ' + T.lin(a, 't', b) + '$, $y = ' + T.poly([c, 0, d], 't') + '$ passes through $' + T.pt([X1, Y1]) + '$. For which value of $t$?', a: numA(t1), steps: ['Use the simpler equation: $' + T.lin(a, 't', b) + ' = ' + X1 + '$, so $t = \\dfrac{' + X1 + T.signed(-b) + '}{' + a + '} = ' + t1 + '$.', 'Check in the other: $y = ' + Y1 + '$. ✓'], hint: 'Solve the linear equation for $t$, then check it in the other one.', nolint: ['+ 0'] };
    }
    if (kind === 'dir') {
      var r = R.int(1, 5), D = R.pick([
        ['x = ' + c1(r) + '\\cos t,\\ y = ' + c1(r) + '\\sin t', 'Counterclockwise', 'At $t = 0$ the point is $(' + r + ', 0)$; at $t = \\frac{\\pi}{2}$ it is $(0, ' + r + ')$. It moves from the positive $x$-axis up to the positive $y$-axis: counterclockwise.'],
        ['x = ' + c1(r) + '\\sin t,\\ y = ' + c1(r) + '\\cos t', 'Clockwise', 'At $t = 0$ the point is $(0, ' + r + ')$; at $t = \\frac{\\pi}{2}$ it is $(' + r + ', 0)$. It moves from the top to the right side: clockwise.'],
        ['x = ' + c1(r) + '\\cos t,\\ y = -' + c1(r) + '\\sin t', 'Clockwise', 'At $t = 0$ the point is $(' + r + ', 0)$; at $t = \\frac{\\pi}{2}$ it is $(0, -' + r + ')$. It moves from the right side down: clockwise.'],
        ['x = -' + c1(r) + '\\cos t,\\ y = ' + c1(r) + '\\sin t', 'Clockwise', 'At $t = 0$ the point is $(-' + r + ', 0)$; at $t = \\frac{\\pi}{2}$ it is $(0, ' + r + ')$. It moves from the left side up to the top: clockwise.'],
        ['x = ' + c1(r) + '\\cos 2t,\\ y = ' + c1(r) + '\\sin 2t', 'Counterclockwise', 'At $t = 0$ the point is $(' + r + ', 0)$; at $t = \\frac{\\pi}{4}$ it is $(0, ' + r + ')$: counterclockwise (twice as fast).']
      ]);
      return { q: 'For $0 \\le t \\le 2\\pi$, the equations $' + D[0] + '$ trace a circle. Which way does the point move?', a: { t: 'mc', choices: ['Counterclockwise', 'Clockwise'], v: D[1] === 'Clockwise' ? 1 : 0, keep: true }, steps: ['The equation $x^2 + y^2 = ' + r * r + '$ only gives the path. To see the direction, plot points for increasing $t$.', D[2]], hint: 'Find the point at $t = 0$ and a little later.' };
    }
    if (kind === 'cross') {
      var k = R.int(1, 4), m = R.nz(-3, 3), q = R.int(-4, 4);
      return { q: 'A particle moves along $x = ' + T.lin(m, 't', q) + '$, $y = t^2 - ' + k * k + '$. At what times $t$ does it cross the $x$-axis?', a: { t: 'set', v: [String(k), String(-k)] }, steps: ['On the $x$-axis, $y = 0$.', '$t^2 - ' + k * k + ' = 0$, so $t = \\pm ' + k + '$.', 'It crosses at $' + T.pt([m * -k + q, 0]) + '$ when $t = -' + k + '$ and at $' + T.pt([m * k + q, 0]) + '$ when $t = ' + k + '$.'], hint: 'Set $y = 0$ and solve for $t$.' };
    }
    var t = triple(R, 1), sx = R.sign() * t[0], sy = R.sign() * t[1];
    return { q: 'A drone moves along $x = ' + T.lin(sx, 't', b) + '$, $y = ' + T.lin(sy, 't', d) + '$, with $x, y$ in meters and $t$ in seconds. How far does it travel each second?', a: numA(t[2]), steps: ['Each second, $x$ changes by $' + sx + '$ and $y$ changes by $' + sy + '$: the velocity vector is $' + T.vec([sx, sy]) + '$.', 'Distance per second $= \\sqrt{' + pp(sx) + '^2 + ' + pp(sy) + '^2} = ' + t[2] + '$ m.'], hint: 'Find the change in $x$ and in $y$ over one second.' };
  });

  G('pre.eliminate-parameter', function (R, ctx) {
    var kind = R.pick(by(ctx, ['lin', 'quad', 'circle'], ['quad', 'circle', 'ellipse', 'lin', 'exp'], ['ellipse', 'hyper', 'circle', 'exp']));
    if (kind === 'lin') {
      var a = R.pick([1, 2, 3, -2]), b = R.int(-5, 5), c = R.nz(-4, 4), d = R.int(-5, 5);
      var m = Q(c, a), k = Q(d).sub(m.mul(b));
      return { q: 'Eliminate the parameter: $x = ' + T.lin(a, 't', b) + '$, $y = ' + T.lin(c, 't', d) + '$. Write an equation in $x$ and $y$.', a: { t: 'eq', v: addPl('y=' + m.toPlain() + '*x', k) }, steps: ['Solve the $x$ equation for $t$: $t = ' + (a === 1 ? T.lin(1, 'x', -b) : '\\dfrac{' + T.lin(1, 'x', -b) + '}{' + a + '}') + '$.', 'Substitute into $y$: $y = ' + T.coef(c, '\\left(' + (a === 1 ? T.lin(1, 'x', -b) : '\\dfrac{' + T.lin(1, 'x', -b) + '}{' + a + '}') + '\\right)') + T.signed(d) + '$.', 'Simplify: $y = ' + T.lin(m, 'x', k) + '$, a line.'], hint: 'Solve one equation for $t$ and substitute into the other.' };
    }
    if (kind === 'quad') {
      var h = R.int(-4, 4), k2 = R.int(-5, 5), sw = R.coin();
      if (sw) return { q: 'Eliminate the parameter: $x = t^2' + T.signed(k2) + '$, $y = ' + T.lin(1, 't', h) + '$.', a: { t: 'eq', v: addPl('x=' + sqPl('y', h), k2) }, steps: ['From $y$: $t = ' + T.lin(1, 'y', -h) + '$.', 'Substitute: $x = ' + (h ? '(' + T.lin(1, 'y', -h) + ')^2' : 'y^2') + T.signed(k2) + '$, a parabola opening right.'], hint: 'Solve the linear equation for $t$.' };
      return { q: 'Eliminate the parameter: $x = ' + T.lin(1, 't', h) + '$, $y = t^2' + T.signed(k2) + '$.', a: { t: 'eq', v: addPl('y=' + sqPl('x', h), k2) }, steps: ['From $x$: $t = ' + T.lin(1, 'x', -h) + '$.', 'Substitute: $y = ' + (h ? '(' + T.lin(1, 'x', -h) + ')^2' : 'x^2') + T.signed(k2) + '$, a parabola opening up.'], hint: 'Solve the linear equation for $t$.' };
    }
    if (kind === 'circle') {
      var h2 = R.int(-4, 4), k3 = R.int(-4, 4), r = R.int(1, 6);
      var xs = h2 ? T.lin(1, 'x', -h2) : 'x', ys = k3 ? T.lin(1, 'y', -k3) : 'y';
      return { q: 'Eliminate the parameter: $x = ' + (h2 ? h2 + ' + ' : '') + T.coef(r, '\\cos t') + '$, $y = ' + (k3 ? k3 + ' + ' : '') + T.coef(r, '\\sin t') + '$.', a: { t: 'eq', v: sqPl('x', h2) + '+' + sqPl('y', k3) + '=' + r * r }, steps: ['Isolate the trig parts: $\\cos t = \\dfrac{' + xs + '}{' + r + '}$ and $\\sin t = \\dfrac{' + ys + '}{' + r + '}$.', 'Use $\\cos^2 t + \\sin^2 t = 1$: $\\dfrac{(' + xs + ')^2}{' + r * r + '} + \\dfrac{(' + ys + ')^2}{' + r * r + '} = 1$.', 'Multiply by $' + r * r + '$: $(' + xs + ')^2 + (' + ys + ')^2 = ' + r * r + '$, a circle.'], hint: 'Solve for $\\cos t$ and $\\sin t$, then use the Pythagorean identity.' };
    }
    if (kind === 'ellipse' || kind === 'hyper') {
      var A = R.int(2, 7), B = R.int(2, 7); if (A === B) B++;
      if (kind === 'ellipse') return { q: 'Eliminate the parameter: $x = ' + A + '\\cos t$, $y = ' + B + '\\sin t$.', a: { t: 'eq', v: 'x^2/' + A * A + '+y^2/' + B * B + '=1' }, steps: ['$\\cos t = \\dfrac{x}{' + A + '}$ and $\\sin t = \\dfrac{y}{' + B + '}$.', '$\\cos^2 t + \\sin^2 t = 1$ gives $\\dfrac{x^2}{' + A * A + '} + \\dfrac{y^2}{' + B * B + '} = 1$, an ellipse.'], hint: 'Use $\\cos^2 t + \\sin^2 t = 1$.' };
      return { q: 'Eliminate the parameter: $x = ' + A + '\\sec t$, $y = ' + B + '\\tan t$.', a: { t: 'eq', v: 'x^2/' + A * A + '-y^2/' + B * B + '=1' }, steps: ['$\\sec t = \\dfrac{x}{' + A + '}$ and $\\tan t = \\dfrac{y}{' + B + '}$.', 'Use $\\sec^2 t - \\tan^2 t = 1$ (from $1 + \\tan^2 t = \\sec^2 t$): $\\dfrac{x^2}{' + A * A + '} - \\dfrac{y^2}{' + B * B + '} = 1$, a hyperbola.'], hint: 'Which identity connects $\\sec t$ and $\\tan t$?' };
    }
    var E = R.pick([['x = e^{t}', 'y = e^{3t}', 'y=x^3', '$e^{3t} = (e^t)^3$, so $y = x^3$ (only $x > 0$, since $e^t > 0$).'], ['x = 2e^{t}', 'y = e^{2t}', 'y=x^2/4', '$e^{t} = \\frac{x}{2}$, so $y = (e^t)^2 = \\frac{x^2}{4}$ (only $x > 0$).'], ['x = e^{t}', 'y = 5e^{-t}', 'x*y=5', '$e^{-t} = \\frac{1}{e^t} = \\frac{1}{x}$, so $y = \\frac{5}{x}$, or $xy = 5$ (with $x > 0$).'], ['x = e^{2t}', 'y = e^{t}', 'x=y^2', '$e^{2t} = (e^t)^2$, so $x = y^2$ (only $y > 0$).'], ['x = e^{t}', 'y = e^{2t} + 1', 'y=x^2+1', '$e^{2t} = (e^t)^2 = x^2$, so $y = x^2 + 1$ (only $x > 0$).'],
      ['x = e^{t}', 'y = e^{2t}', 'y=x^2', '$e^{2t} = (e^t)^2$, so $y = x^2$ (only $x > 0$, since $e^t > 0$).'], ['x = e^{t}', 'y = 3e^{-t}', 'x*y=3', '$e^{-t} = \\frac{1}{e^t} = \\frac{1}{x}$, so $y = \\frac{3}{x}$, or $xy = 3$ (with $x > 0$).'], ['x = \\sqrt{t}', 'y = t + 2', 'y=x^2+2', '$t = x^2$ (with $x \\ge 0$), so $y = x^2 + 2$.'], ['x = 2^{t}', 'y = 2^{t+1}', 'y=2*x', '$2^{t + 1} = 2 \\cdot 2^t$, so $y = 2x$ (with $x > 0$).']]);
    return { q: 'Eliminate the parameter: $' + E[0] + '$, $' + E[1] + '$.', a: { t: 'eq', v: E[2] }, steps: [E[3]], hint: 'Write $y$ using the same power that appears in $x$.' };
  });

  G('pre.projectile-motion', function (R, ctx) {
    var kind = R.pick(by(ctx, ['comps', 'tmax', 'hmax'], ['tmax', 'hmax', 'land', 'eqs', 'height'], ['land', 'range', 'hmax', 'eqs']));
    var th = R.pick(by(ctx, [30, 60], [30, 45, 60], [30, 45, 60])), k = R.pick([1, 2, 3, 4, 5, 6]), v0, vx, vy, v0T;
    if (th === 30) { v0 = 32 * k; vy = sdQ(16 * k); vx = Sd({ 3: 16 * k }); v0T = String(v0); }
    else if (th === 45) { vy = sdQ(16 * k); vx = sdQ(16 * k); v0 = null; v0T = 16 * k + '\\sqrt{2}'; }
    else { v0 = 32 * k; vx = sdQ(16 * k); vy = Sd({ 3: 16 * k }); v0T = String(v0); }
    var h = kind === 'land' || kind === 'range' ? 0 : R.pick([0, 3, 4, 5, 6]);
    var setup = 'A ball is launched from ' + (h ? 'a height of $' + h + '$ ft' : 'the ground') + ' at $' + v0T + '$ ft/s, at an angle of $' + T.deg(th) + '$ above the horizontal. Its position after $t$ seconds is $x = (' + v0T + '\\cos ' + T.deg(th) + ')t$, $y = ' + (h ? h + ' + ' : '') + '(' + v0T + '\\sin ' + T.deg(th) + ')t - 16t^2$ (in feet).';
    var cst = 'Split the launch velocity into parts: horizontal $' + v0T + '\\cos ' + T.deg(th) + ' = ' + sdTex(vx) + '$ ft/s and vertical $' + v0T + '\\sin ' + T.deg(th) + ' = ' + sdTex(vy) + '$ ft/s.';
    if (kind === 'comps') return { q: setup + ' Find the horizontal and vertical parts of the launch velocity.', a: { t: 'multi', parts: [{ label: 'Horizontal (ft/s)', a: numA(sdPlain(vx), 'simplest') }, { label: 'Vertical (ft/s)', a: numA(sdPlain(vy), 'simplest') }] }, steps: [cst, 'Each part uses the full speed times $\\cos$ or $\\sin$ of the angle; neither part is the whole speed.'], hint: 'Horizontal: $v_0\\cos\\theta$. Vertical: $v_0\\sin\\theta$.' };
    if (kind === 'eqs') return { q: 'A ball is launched from ' + (h ? 'a height of $' + h + '$ ft' : 'the ground') + ' at $' + v0T + '$ ft/s, at $' + T.deg(th) + '$ above the horizontal. Write its position $x(t)$ and $y(t)$ in feet, using $-16t^2$ for gravity.', a: { t: 'multi', parts: [{ label: '$x(t) =$', a: { t: 'expr', v: sdPlain(vx) + '*t', vars: ['t'] } }, { label: '$y(t) =$', a: { t: 'expr', v: (h ? h + '+' : '') + (sdTerms(vy).length > 1 ? '(' + sdPlain(vy) + ')' : sdPlain(vy)) + '*t-16*t^2', vars: ['t'] } }] }, steps: [cst, 'Horizontal motion has no acceleration: $x = ' + sdTex(vx) + 't$.', 'Vertical motion starts at $' + h + '$, rises at $' + sdTex(vy) + '$ ft/s and is pulled down by gravity: $y = ' + (h ? h + ' + ' : '') + sdTex(vy) + 't - 16t^2$.'], hint: 'Use $v_0\\cos\\theta$ for $x$ and $v_0\\sin\\theta$ for $y$.' };
    var vyN = sdVal(vy);
    var tTop = sdScale(vy, Q(1, 32)), hTop = sdAdd(sdQ(h), sdScale(sdMul(vy, vy), Q(1, 64)));
    if (kind === 'tmax') return { q: setup + ' When does it reach its highest point?', a: numA(sdPlain(tTop), 'simplest'), steps: [cst, 'The height $y = ' + (h ? h + ' + ' : '') + sdTex(vy) + 't - 16t^2$ is a downward parabola. Its vertex is at $t = -\\dfrac{b}{2a} = \\dfrac{' + sdTex(vy) + '}{32} = ' + sdTex(tTop) + '$ s.'], hint: 'The top of the parabola $y(t)$ is at $t = -\\frac{b}{2a}$.' };
    if (kind === 'hmax') return { q: setup + ' What is its greatest height?', a: numA(sdPlain(hTop), 'simplest'), steps: [cst, 'The top is at $t = \\dfrac{' + sdTex(vy) + '}{32} = ' + sdTex(tTop) + '$ s.', 'Height there: $y = ' + (h ? h + ' + ' : '') + sdTex(vy) + ' \\cdot ' + pp(sdTex(tTop)) + ' - 16' + pp(sdTex(tTop)) + '^2 = ' + sdTex(hTop) + '$ ft.'], hint: 'Find the time of the vertex first, then the height.' };
    if (kind === 'height') { var t1 = Q(R.pick([1, 2, 1]), R.pick([1, 2, 4])); var yv = sdAdd(sdQ(h), sdSub(sdScale(vy, t1), sdQ(t1.mul(t1).mul(16)))); return { q: setup + ' How high is it at $t = ' + t1.toTex() + '$ s?', a: numA(sdPlain(yv), 'simplest'), steps: [cst, '$y = ' + (h ? h + ' + ' : '') + sdTex(vy) + ' \\cdot ' + pp(t1.toTex()) + ' - 16' + pp(t1.toTex()) + '^2 = ' + sdTex(yv) + '$ ft.'], hint: 'Substitute $t$ into $y(t)$.' }; }
    var tLand = sdScale(vy, Q(1, 16)), xLand = sdMul(vx, tLand);
    if (kind === 'land') return { q: setup + ' When does it land?', a: numA(sdPlain(tLand), 'simplest'), steps: [cst, 'It lands when $y = 0$: $' + sdTex(vy) + 't - 16t^2 = t(' + sdTex(vy) + ' - 16t) = 0$.', '$t = 0$ is the launch, so it lands at $t = \\dfrac{' + sdTex(vy) + '}{16} = ' + sdTex(tLand) + '$ s.'], hint: 'Set $y = 0$ and factor out $t$.' };
    return { q: setup + ' How far away does it land (its horizontal distance)?', a: numA(sdPlain(xLand), 'simplest'), steps: [cst, 'It lands when $y = 0$: $t = \\dfrac{' + sdTex(vy) + '}{16} = ' + sdTex(tLand) + '$ s.', 'Horizontal distance: $x = ' + sdTex(vx) + ' \\cdot ' + pp(sdTex(tLand)) + ' = ' + sdTex(xLand) + '$ ft.'], hint: 'Find the landing time from $y = 0$, then put it in $x(t)$.' };
  });

  // ======================= 07-conics.js
  // ===================================================================== Unit 7: Conic Sections

  function sqT(v, c) { return c === 0 ? v + '^2' : '(' + T.lin(1, v, -c) + ')^2'; }       // (x - h)^2
  function linT(v, c) { return c === 0 ? v : '(' + T.lin(1, v, -c) + ')'; }               // (x - h)
  function genTex(A, C, D, E, F) { return T.terms([[A, 'x^2'], [C, 'y^2'], [D, 'x'], [E, 'y'], [F, '']]) + ' = 0'; }

  G('pre.parabolas-conics', function (R, ctx) {
    var kind = R.pick(by(ctx, ['focus', 'directrix', 'opens'], ['focus', 'directrix', 'write', 'shifted'], ['write', 'complete', 'shifted']));
    var p = R.pick(by(ctx, [1, 2, 3, -1, -2, -3, 4, -4, 5, -5, Q(1, 2), Q(-1, 2), 6, -6], [1, 2, 3, 4, -1, -2, -3, 5, -5, Q(1, 2), Q(-3, 2)], [Q(1, 2), 1, 2, 3, Q(-1, 2), -2, Q(3, 2)])); p = Q.from(p);
    var hor = R.coin(), h = by(ctx, 0, R.int(-4, 4), R.int(-5, 5)), k = by(ctx, 0, R.int(-4, 4), R.int(-5, 5));
    if (kind === 'focus' || kind === 'directrix' || kind === 'opens') { h = 0; k = 0; }
    var fp = Q(4).mul(p);
    var eqT = hor ? sqT('y', k) + ' = ' + T.coef(fp, linT('x', h)) : sqT('x', h) + ' = ' + T.coef(fp, linT('y', k));
    var focus = hor ? [p.add(h), Q(k)] : [Q(h), p.add(k)], dirx = hor ? 'x = ' + Q(h).sub(p).toTex() : 'y = ' + Q(k).sub(p).toTex(), dirP = hor ? 'x=' + Q(h).sub(p).toPlain() : 'y=' + Q(k).sub(p).toPlain();
    var opens = hor ? (p.sign() > 0 ? 'right' : 'left') : (p.sign() > 0 ? 'up' : 'down');
    var base = ['Match $' + (hor ? '(y - k)^2 = 4p(x - h)' : '(x - h)^2 = 4p(y - k)') + '$: the vertex is $' + T.pt([h, k]) + '$ and $4p = ' + fp.toTex() + '$, so $p = ' + p.toTex() + '$.',
      '$p$ is the directed distance from the vertex to the focus (and from the directrix to the vertex). The parabola opens ' + opens + ', toward the focus.'];
    if (kind === 'opens') return { q: 'Which way does the parabola $' + eqT + '$ open?', a: { t: 'mc', choices: ['Up', 'Down', 'Left', 'Right'], v: ['up', 'down', 'left', 'right'].indexOf(opens), keep: true }, steps: [hor ? 'The $y$ is squared, so the parabola opens sideways, left or right.' : 'The $x$ is squared, so the parabola opens up or down.', 'The other side has coefficient $' + fp.toTex() + '$, which is ' + (p.sign() > 0 ? 'positive' : 'negative') + ', so it opens ' + opens + '.'], hint: 'Which variable is squared? Then look at the sign.' };
    if (kind === 'focus' || kind === 'shifted') return { q: 'Find the focus of the parabola $' + eqT + '$.', a: { t: 'tuple', v: focus.map(function (z) { return z.toPlain(); }) }, steps: base.concat(['Move $p$ from the vertex toward the opening: the focus is $' + T.pt(focus) + '$.']), hint: 'Find the vertex and $p$; the focus is $p$ units from the vertex, inside the curve.' };
    if (kind === 'directrix') return { q: 'Find the directrix of the parabola $' + eqT + '$. Write it as an equation.', a: { t: 'eq', v: dirP }, steps: base.concat(['The directrix is $p$ units behind the vertex, on the side away from the opening: $' + dirx + '$.']), hint: 'The directrix is on the opposite side of the vertex from the focus.' };
    if (kind === 'write') {
      var vx = h, vy = k;
      return { q: 'Write the equation of the parabola with focus $' + T.pt(focus) + '$ and directrix $' + dirx + '$.', a: { t: 'eq', v: hor ? sqPl('y', k) + '=' + fp.toPlain() + '*' + linPl('x', h) : sqPl('x', h) + '=' + fp.toPlain() + '*' + linPl('y', k) }, steps: ['The vertex is halfway between the focus and the directrix: $' + T.pt([vx, vy]) + '$.', 'The directed distance from the vertex to the focus is $p = ' + p.toTex() + '$, so $4p = ' + fp.toTex() + '$.', 'The directrix is ' + (hor ? 'vertical, so the parabola opens sideways' : 'horizontal, so the parabola opens up or down') + ': $' + eqT + '$.'], hint: 'Find the vertex as the midpoint between focus and directrix, then $p$.' };
    }
    // complete the square from expanded form
    var D = hor ? fp.neg() : Q(-2 * h), E = hor ? Q(-2 * k) : fp.neg(), F = hor ? Q(k * k).add(fp.mul(h)) : Q(h * h).add(fp.mul(k));
    var genT = hor ? T.terms([[1, 'y^2'], [E, 'y'], [D, 'x'], [F, '']]) + ' = 0' : T.terms([[1, 'x^2'], [D, 'x'], [E, 'y'], [F, '']]) + ' = 0';
    return { q: 'Find the vertex of the parabola $' + genT + '$.', a: { t: 'tuple', v: [String(h), String(k)] }, steps: ['Keep the squared variable on one side and complete the square: $' + eqT + '$.', 'The vertex is $' + T.pt([h, k]) + '$.'], hint: 'Move the non-squared terms to the right, then complete the square.' };
  });

  var ELL = [[5, 4, 3], [5, 3, 4], [13, 12, 5], [13, 5, 12], [10, 8, 6], [10, 6, 8], [17, 15, 8], [17, 8, 15], [25, 24, 7], [25, 7, 24], [15, 12, 9], [15, 9, 12], [20, 16, 12], [20, 12, 16], [26, 24, 10], [26, 10, 24], [29, 21, 20], [29, 20, 21]];
  var ELLR = [[3, 2], [4, 2], [4, 3], [6, 3], [5, 2], [3, 1], [6, 4], [7, 3], [4, 1], [5, 1], [6, 2], [7, 2], [8, 3], [6, 5], [7, 4], [9, 4]];
  G('pre.ellipses', function (R, ctx) {
    var kind = R.pick(by(ctx, ['foci', 'axes', 'major'], ['foci', 'write', 'axes', 'rad'], ['shift', 'write', 'rad', 'foci']));
    var e = R.pick(ELL), a = e[0], b = e[1], c = { p: String(e[2]), t: String(e[2]) }, vert = R.coin();
    if (kind === 'rad') { var er = R.pick(ELLR); a = er[0]; b = er[1]; c = sqrtInt(a * a - b * b); }
    var h = kind === 'shift' ? R.nz(-5, 5) : 0, k = kind === 'shift' ? R.int(-5, 5) : 0;
    var xD = vert ? b * b : a * a, yD = vert ? a * a : b * b;
    var eqT = '\\dfrac{' + sqT('x', h) + '}{' + xD + '} + \\dfrac{' + sqT('y', k) + '}{' + yD + '} = 1';
    var cS = 'c^2 = a^2 - b^2 = ' + a * a + ' - ' + b * b + ' = ' + (a * a - b * b) + '$, so $c = ' + c.t;
    var base = ['The larger denominator, $' + a * a + '$, is under $' + (vert ? 'y' : 'x') + '$, so the major axis is ' + (vert ? 'vertical' : 'horizontal') + ': $a = ' + a + '$, $b = ' + b + '$.',
      'Each focus is $c$ from the center, where $' + cS + '$. (For an ellipse the foci are inside, so $c < a$: subtract.)'];
    if (kind === 'major') return { q: 'Is the major axis of $' + eqT + '$ horizontal or vertical?', a: { t: 'mc', choices: ['Horizontal', 'Vertical'], v: vert ? 1 : 0, keep: true }, steps: [base[0]], hint: 'The major axis goes with the larger denominator.' };
    if (kind === 'axes') return { q: 'Find the lengths of the major and minor axes of $' + eqT + '$.', a: { t: 'multi', parts: [{ label: 'Major axis', a: numA(2 * a) }, { label: 'Minor axis', a: numA(2 * b) }] }, steps: [base[0], 'The major axis runs from vertex to vertex: $2a = ' + 2 * a + '$. The minor axis is $2b = ' + 2 * b + '$.'], hint: 'Take square roots of the denominators, then double.' };
    if (kind === 'foci' || kind === 'rad') {
      var fT = vert ? '(0, ' + c.t + ')' : '(' + c.t + ', 0)';
      return { q: 'Find the focus of $' + eqT + '$ that has a positive ' + (vert ? '$y$' : '$x$') + '-coordinate.', a: { t: 'tuple', v: vert ? ['0', c.p] : [c.p, '0'], form: 'simplest' }, steps: base.concat(['The foci lie on the major axis: $(' + (vert ? '0, \\pm' + c.t : '\\pm' + c.t + ', 0') + ')$. The one asked for is $' + fT + '$.']), hint: 'For an ellipse, $c^2 = a^2 - b^2$.' };
    }
    if (kind === 'write') {
      return { q: 'Write the equation of the ellipse centered at the origin with vertices $' + (vert ? '(0, \\pm' + a + ')' : '(\\pm' + a + ', 0)') + '$ and foci $' + (vert ? '(0, \\pm' + c.t + ')' : '(\\pm' + c.t + ', 0)') + '$.', a: { t: 'eq', v: 'x^2/' + xD + '+y^2/' + yD + '=1' }, steps: ['The vertices give $a = ' + a + '$ and the foci give $c = ' + c.t + '$.', '$b^2 = a^2 - c^2 = ' + a * a + ' - ' + (a * a - b * b) + ' = ' + b * b + '$.', 'The major axis is ' + (vert ? 'vertical, so $a^2$ goes under $y^2$' : 'horizontal, so $a^2$ goes under $x^2$') + ': $' + eqT + '$.'], hint: 'Use $b^2 = a^2 - c^2$.' };
    }
    return { q: 'Find the center of the ellipse $' + eqT + '$ and the distance $c$ from the center to each focus.', a: { t: 'multi', parts: [{ label: 'Center', a: { t: 'tuple', v: [String(h), String(k)] } }, { label: '$c =$', a: numA(c.p) }] }, steps: ['Read the center from the shifts: $' + T.pt([h, k]) + '$.'].concat(base), hint: 'The center is $(h, k)$; then $c^2 = a^2 - b^2$.' };
  });

  var HYP = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17], [7, 24, 25], [9, 12, 15], [12, 9, 15], [10, 24, 26], [24, 10, 26], [20, 21, 29], [21, 20, 29], [12, 16, 20], [16, 12, 20], [24, 7, 25]];
  G('pre.hyperbolas', function (R, ctx) {
    var kind = R.pick(by(ctx, ['opens', 'vertex', 'foci'], ['foci', 'asym', 'write', 'opens'], ['asym', 'write', 'foci', 'shift']));
    var e = R.pick(HYP), a = e[0], b = e[1], c = e[2], vert = R.coin();
    var h = kind === 'shift' ? R.nz(-5, 5) : 0, k = kind === 'shift' ? R.int(-5, 5) : 0;
    var eqT = vert ? '\\dfrac{' + sqT('y', k) + '}{' + a * a + '} - \\dfrac{' + sqT('x', h) + '}{' + b * b + '} = 1' : '\\dfrac{' + sqT('x', h) + '}{' + a * a + '} - \\dfrac{' + sqT('y', k) + '}{' + b * b + '} = 1';
    var base = ['The positive term is the $' + (vert ? 'y' : 'x') + '$ term, so the hyperbola opens ' + (vert ? 'up and down' : 'left and right') + '. $a^2 = ' + a * a + '$ sits under it: $a = ' + a + '$, $b = ' + b + '$.'];
    var cst = 'For a hyperbola the foci are beyond the vertices, so $c > a$: $c^2 = a^2 + b^2 = ' + a * a + ' + ' + b * b + ' = ' + c * c + '$, so $c = ' + c + '$.';
    if (kind === 'opens') return { q: 'Which way does the hyperbola $' + eqT + '$ open?', a: { t: 'mc', choices: ['Left and right', 'Up and down'], v: vert ? 1 : 0, keep: true }, steps: base.concat(['(Setting $' + (vert ? 'x' : 'y') + ' = 0$ gives real points; setting $' + (vert ? 'y' : 'x') + ' = 0$ would need a negative square.)']), hint: 'The branches open along the axis of the positive term.' };
    if (kind === 'vertex') return { q: 'Find the vertex of $' + eqT + '$ with a positive ' + (vert ? '$y$' : '$x$') + '-coordinate.', a: { t: 'tuple', v: vert ? ['0', String(a)] : [String(a), '0'] }, steps: base.concat(['The vertices are $' + (vert ? '(0, \\pm' + a + ')' : '(\\pm' + a + ', 0)') + '$.']), hint: 'The vertices are $a$ units from the center along the opening direction.' };
    if (kind === 'foci') return { q: 'Find the focus of $' + eqT + '$ with a positive ' + (vert ? '$y$' : '$x$') + '-coordinate.', a: { t: 'tuple', v: vert ? ['0', String(c)] : [String(c), '0'] }, steps: base.concat([cst, 'The foci are $' + (vert ? '(0, \\pm' + c + ')' : '(\\pm' + c + ', 0)') + '$.']), hint: 'For a hyperbola, $c^2 = a^2 + b^2$.' };
    if (kind === 'asym') { var m = vert ? Q(a, b) : Q(b, a); return { q: 'Find the slope of the asymptote of $' + eqT + '$ that rises from left to right.', a: numA(m.toPlain()), steps: base.concat(['Far from the center the $1$ hardly matters, so the curve hugs $' + (vert ? '\\frac{y^2}{' + a * a + '} = \\frac{x^2}{' + b * b + '}' : '\\frac{x^2}{' + a * a + '} = \\frac{y^2}{' + b * b + '}') + '$, that is $y = \\pm' + m.toTex() + 'x$.', 'The rising asymptote has slope $' + m.toTex() + '$.']), hint: vert ? 'For $\\frac{y^2}{a^2} - \\frac{x^2}{b^2} = 1$ the asymptotes are $y = \\pm\\frac{a}{b}x$.' : 'For $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ the asymptotes are $y = \\pm\\frac{b}{a}x$.' }; }
    if (kind === 'write') return { q: 'Write the equation of the hyperbola centered at the origin with vertices $' + (vert ? '(0, \\pm' + a + ')' : '(\\pm' + a + ', 0)') + '$ and foci $' + (vert ? '(0, \\pm' + c + ')' : '(\\pm' + c + ', 0)') + '$.', a: { t: 'eq', v: vert ? 'y^2/' + a * a + '-x^2/' + b * b + '=1' : 'x^2/' + a * a + '-y^2/' + b * b + '=1' }, steps: ['$a = ' + a + '$ and $c = ' + c + '$, so $b^2 = c^2 - a^2 = ' + c * c + ' - ' + a * a + ' = ' + b * b + '$.', 'The vertices are on the ' + (vert ? '$y$' : '$x$') + '-axis, so the ' + (vert ? '$y^2$' : '$x^2$') + ' term is positive: $' + eqT + '$.'], hint: 'For a hyperbola, $b^2 = c^2 - a^2$.' };
    return { q: 'Find the center of $' + eqT + '$ and the distance $c$ from the center to each focus.', a: { t: 'multi', parts: [{ label: 'Center', a: { t: 'tuple', v: [String(h), String(k)] } }, { label: '$c =$', a: numA(c) }] }, steps: ['The center is $' + T.pt([h, k]) + '$.'].concat(base, [cst]), hint: 'The center is $(h, k)$; then $c^2 = a^2 + b^2$.' };
  });

  G('pre.classify-conics', function (R, ctx) {
    var kind = R.pick(by(ctx, ['type', 'type', 'center'], ['type', 'center', 'radius', 'vertex'], ['center', 'type', 'disc', 'vertex']));
    var h = R.int(-4, 4), k = R.int(-4, 4), typ = R.int(0, 3), A, C, D, E, F, info;
    if (kind === 'radius') typ = 0; if (kind === 'vertex') typ = 2; if (kind === 'center' && typ === 2) typ = R.pick([0, 1, 3]);
    if (typ === 0) { var r = R.int(1, 6), m = R.pick([1, 1, 2]); A = m; C = m; D = -2 * h * m; E = -2 * k * m; F = m * (h * h + k * k - r * r); info = { std: sqT('x', h) + ' + ' + sqT('y', k) + ' = ' + r * r, r: r }; }
    else if (typ === 1) { var p = R.pick([[2, 3], [3, 2], [1, 2], [2, 1], [1, 3]]), a2 = p[0] * p[0], b2 = p[1] * p[1]; A = b2; C = a2; D = -2 * h * b2; E = -2 * k * a2; F = b2 * h * h + a2 * k * k - a2 * b2; info = { std: '\\dfrac{' + sqT('x', h) + '}{' + a2 + '} + \\dfrac{' + sqT('y', k) + '}{' + b2 + '} = 1' }; }
    else if (typ === 3) { var q = R.pick([[2, 3], [3, 2], [1, 2], [2, 1], [1, 1]]), a3 = q[0] * q[0], b3 = q[1] * q[1], sg = R.sign(); A = sg * b3; C = -sg * a3; D = -2 * h * A; E = -2 * k * C; F = A * h * h + C * k * k - a3 * b3; info = { std: sg > 0 ? '\\dfrac{' + sqT('x', h) + '}{' + a3 + '} - \\dfrac{' + sqT('y', k) + '}{' + b3 + '} = 1' : '\\dfrac{' + sqT('y', k) + '}{' + b3 + '} - \\dfrac{' + sqT('x', h) + '}{' + a3 + '} = 1' }; }
    else { var pp4 = R.pick([2, 4, -4, 8, -2, -8]), hor = R.coin(); if (hor) { A = 0; C = 1; D = -pp4; E = -2 * k; F = k * k + pp4 * h; info = { std: sqT('y', k) + ' = ' + T.coef(pp4, linT('x', h)) }; } else { A = 1; C = 0; D = -2 * h; E = -pp4; F = h * h + pp4 * k; info = { std: sqT('x', h) + ' = ' + T.coef(pp4, linT('y', k)) }; } }
    var gT = genTex(A, C, D, E, F);
    var NAMES = ['Circle', 'Ellipse', 'Parabola', 'Hyperbola'];
    var why = A === 0 || C === 0 ? 'Only one variable is squared, so it is a parabola.' : A === C ? 'Both squares have the same coefficient ($' + A + '$), so it is a circle.' : A * C > 0 ? 'Both squares have the same sign but different coefficients, so it is an ellipse.' : 'The squares have opposite signs, so it is a hyperbola.';
    if (kind === 'type') return { q: 'Identify the conic $' + gT + '$.', a: { t: 'mc', choices: NAMES.slice(), v: typ === 0 ? 0 : typ === 1 ? 1 : typ === 2 ? 2 : 3, keep: true }, steps: ['Look at the $x^2$ and $y^2$ terms: $A = ' + A + '$ and $C = ' + C + '$.', why, 'Completing the square confirms it: $' + info.std + '$.'], hint: 'Compare the coefficients of $x^2$ and $y^2$.' };
    if (kind === 'disc') {
      var Bq = R.pick([[1, 4, 1], [2, 1, 2], [1, 2, 1], [3, 2, 1], [1, 1, 1], [2, 4, 2], [1, -2, 3]]), dsc = Bq[1] * Bq[1] - 4 * Bq[0] * Bq[2];
      var nm = dsc < 0 ? 1 : dsc === 0 ? 2 : 3;
      return { q: 'Classify the conic $' + T.terms([[Bq[0], 'x^2'], [Bq[1], 'xy'], [Bq[2], 'y^2']]) + ' = ' + R.int(1, 9) + '$ (the $xy$ term rotates it).', a: { t: 'mc', choices: ['Ellipse (or circle)', 'Parabola', 'Hyperbola'], v: nm - 1, keep: true }, steps: ['For $Ax^2 + Bxy + Cy^2 + \\ldots = 0$, the discriminant $B^2 - 4AC$ decides the type, whatever the rotation.', '$B^2 - 4AC = ' + Bq[1] * Bq[1] + ' - ' + 4 * Bq[0] * Bq[2] + ' = ' + dsc + '$, which is ' + (dsc < 0 ? 'negative: an ellipse.' : dsc === 0 ? 'zero: a parabola.' : 'positive: a hyperbola.')], hint: 'Compute $B^2 - 4AC$.' };
    }
    var mm = U.gcd(A, C, D, E, F), cs = (mm > 1 ? ['Divide every term by $' + mm + '$.'] : []).concat(['Group the $x$ terms and the $y$ terms and complete the square in each: $' + gT + '$ becomes $' + info.std + '$.']);
    if (kind === 'radius') return { q: 'Find the radius of the circle $' + gT + '$.', a: numA(info.r), steps: cs.concat(['The radius is $\\sqrt{' + info.r * info.r + '} = ' + info.r + '$.']), hint: 'Complete the square in $x$ and in $y$.' };
    return { q: 'Find the ' + (typ === 2 ? 'vertex' : 'center') + ' of the conic $' + gT + '$.', a: { t: 'tuple', v: [String(h), String(k)] }, steps: cs.concat(['So the ' + (typ === 2 ? 'vertex' : 'center') + ' is $' + T.pt([h, k]) + '$.']), hint: 'Complete the square for each variable.' };
  });

  // ======================= 08-matrices.js
  // ===================================================================== Unit 8: Matrices

  var M = ML.M;
  function rmat(R, r, c, lo, hi) { var A = []; for (var i = 0; i < r; i++) { A.push([]); for (var j = 0; j < c; j++) A[i].push(R.int(lo, hi)); } return A; }
  function mPlain(A) { return A.map(function (r) { return r.map(function (x) { return Q.from(x).toPlain(); }); }); }
  function mTex(A, env) { return T.mat(A.map(function (r) { return r.map(function (x) { return Q.from(x).toTex(); }); }), env); }
  function qn(x) { return Q.from(x); }
  function invertible(R, n, lo, hi, needDet) {
    for (var t = 0; t < 200; t++) { var A = rmat(R, n, n, lo, hi), d = M.det(A); if (!d.isZero() && (!needDet || needDet(d))) return A; }
    return n === 2 ? [[2, 1], [1, 1]] : [[1, 2, 0], [0, 1, 1], [1, 0, 1]];
  }
  // Gauss-Jordan with a record of the row operations (exact)
  function gaussSteps(Aug) {
    var A = Aug.map(function (r) { return r.map(qn); }), n = A.length, cols = A[0].length, ops = [];
    function rowTex(i) { return 'R_' + (i + 1); }
    for (var c = 0, r = 0; c < cols - 1 && r < n; c++) {
      var p = r; while (p < n && A[p][c].isZero()) p++;
      if (p === n) continue;
      for (var pq = r; pq < n; pq++) if (A[pq][c].abs().eq(1)) { p = pq; break; }
      if (p !== r) { var tmp = A[p]; A[p] = A[r]; A[r] = tmp; ops.push(['Swap $' + rowTex(r) + '$ and $' + rowTex(p) + '$', A.map(function (x) { return x.slice(); })]); }
      var pv = A[r][c];
      if (!pv.eq(1)) { A[r] = A[r].map(function (x) { return x.div(pv); }); ops.push(['$' + rowTex(r) + ' \\to ' + (pv.eq(-1) ? '-' + rowTex(r) : pv.inv().toTex() + rowTex(r)) + '$', A.map(function (x) { return x.slice(); })]); }
      for (var i = 0; i < n; i++) if (i !== r && !A[i][c].isZero()) {
        var f = A[i][c]; A[i] = A[i].map(function (x, j) { return x.sub(f.mul(A[r][j])); });
        ops.push(['$' + rowTex(i) + ' \\to ' + rowTex(i) + (f.sign() > 0 ? ' - ' : ' + ') + (f.abs().eq(1) ? '' : f.abs().toTex()) + rowTex(r) + '$', A.map(function (x) { return x.slice(); })]);
      }
      r++;
    }
    return { ops: ops, R: A };
  }
  function sysTex(A, b, vars) { return '\\begin{aligned} ' + A.map(function (row, i) { return T.terms(row.map(function (c, j) { return [c, vars[j]]; })) + ' &= ' + b[i]; }).join(' \\\\ ') + ' \\end{aligned}'; }

  G('pre.matrix-basics', function (R, ctx) {
    var kind = R.pick(by(ctx, ['add', 'scal', 'entry'], ['combo', 'add', 'entry', 'solve'], ['combo', 'solve']));
    var r = R.pick([2, 2, 3]), c = R.pick([2, 3]), A = rmat(R, r, c, -6, 9), B = rmat(R, r, c, -6, 9);
    if (kind === 'entry') {
      var i = R.int(1, r), j = R.int(1, c);
      return { q: 'For $A = ' + mTex(A) + '$, what is the entry $a_{' + i + j + '}$?', a: numA(A[i - 1][j - 1]), steps: ['$a_{ij}$ is the entry in row $i$ and column $j$ (row first, like "down, then across").', 'Row ' + i + ', column ' + j + ': $a_{' + i + j + '} = ' + A[i - 1][j - 1] + '$.'], hint: 'The first index is the row.' };
    }
    if (kind === 'add') {
      var sub = R.coin(), S = A.map(function (row, i) { return row.map(function (x, j) { return sub ? x - B[i][j] : x + B[i][j]; }); });
      return { q: 'Find $A ' + (sub ? '-' : '+') + ' B$ for $A = ' + mTex(A) + '$ and $B = ' + mTex(B) + '$.', a: { t: 'matrix', v: mPlain(S) }, steps: ['Matrices of the same size ' + (sub ? 'subtract' : 'add') + ' entry by entry, in matching positions.', 'For example, the top-left entry is $' + A[0][0] + (sub ? ' - ' : ' + ') + pp(B[0][0]) + ' = ' + S[0][0] + '$.', '$A ' + (sub ? '-' : '+') + ' B = ' + mTex(S) + '$.'], hint: 'Combine the entries in the same position.' };
    }
    if (kind === 'scal') {
      var k = R.pick([2, 3, -2, 5, 4, -3]), S2 = A.map(function (row) { return row.map(function (x) { return k * x; }); });
      return { q: 'Find $' + k + 'A$ for $A = ' + mTex(A) + '$.', a: { t: 'matrix', v: mPlain(S2) }, steps: ['A scalar multiplies every entry.', '$' + k + 'A = ' + mTex(S2) + '$.'], hint: 'Multiply each entry by $' + k + '$.' };
    }
    if (kind === 'combo') {
      var p = R.pick([2, 3, -1]), q = R.pick([-1, -2, 3, 2]), S3 = A.map(function (row, i) { return row.map(function (x, j) { return p * x + q * B[i][j]; }); });
      var ex = T.coef(p, 'A') + T.coef(q, 'B', false);
      return { q: 'Find $' + ex + '$ for $A = ' + mTex(A) + '$ and $B = ' + mTex(B) + '$.', a: { t: 'matrix', v: mPlain(S3) }, steps: ['Scale each matrix, then combine entry by entry.', 'Top-left: $' + p + pp(A[0][0]) + T.signed(q) + pp(B[0][0]) + ' = ' + S3[0][0] + '$.', '$' + ex + ' = ' + mTex(S3) + '$.'], hint: 'Do the scalar multiplications first.' };
    }
    var X = A.map(function (row, i) { return row.map(function (x, j) { return B[i][j] - x; }); });
    return { q: 'Solve for the matrix $X$: $X + ' + mTex(A) + ' = ' + mTex(B) + '$.', a: { t: 'matrix', v: mPlain(X) }, steps: ['Subtract the known matrix from both sides, just as with numbers: $X = B - A$.', '$X = ' + mTex(X) + '$.'], hint: 'Undo the addition entry by entry.' };
  });

  G('pre.matrix-multiplication', function (R, ctx) {
    var kind = R.pick(by(ctx, ['prod', 'entry', 'size'], ['prod', 'entry', 'size', 'prod'], ['prod', 'commute', 'entry']));
    var shapes = by(ctx, [[2, 2, 2], [2, 2, 1]], [[2, 3, 2], [2, 2, 2], [3, 2, 2], [1, 3, 2], [2, 2, 3]], [[2, 3, 2], [3, 2, 3], [2, 2, 2]]);
    var s = R.pick(shapes), A = rmat(R, s[0], s[1], -4, 5), B = rmat(R, s[1], s[2], -4, 5), P = M.mul(A, B);
    if (kind === 'size') {
      var bad = R.coin(), m = R.int(1, 4), n = R.int(1, 4), n2 = bad ? R.intNot(1, 4, n) : n, p = R.int(1, 4);
      return { q: '$A$ is $' + m + ' \\times ' + n + '$ and $B$ is $' + n2 + ' \\times ' + p + '$. Is the product $AB$ defined?', a: { t: 'tf', v: !bad }, steps: ['Each entry of $AB$ pairs a row of $A$ (length ' + n + ') with a column of $B$ (length ' + n2 + '). They must be the same length.', bad ? '$' + n + ' \\ne ' + n2 + '$, so $AB$ is not defined.' : 'They match, so $AB$ is defined, and it is $' + m + ' \\times ' + p + '$ (the outside numbers).'], hint: 'Compare the inner dimensions.' };
    }
    if (kind === 'entry') {
      var i = R.int(1, s[0]), j = R.int(1, s[2]), row = A[i - 1], col = B.map(function (r) { return r[j - 1]; });
      return { q: 'For $A = ' + mTex(A) + '$ and $B = ' + mTex(B) + '$, find the entry in row ' + i + ', column ' + j + ' of $AB$.', a: numA(P[i - 1][j - 1].toPlain()), steps: ['Entry $(' + i + ', ' + j + ')$ is row ' + i + ' of $A$ times column ' + j + ' of $B$: multiply matching entries and add.', '$' + row.map(function (x, k) { return pp(x) + pp(col[k]); }).join(' + ') + ' = ' + P[i - 1][j - 1].toTex() + '$.'], hint: 'Row of the first matrix, column of the second.' };
    }
    if (kind === 'commute') {
      var A2 = rmat(R, 2, 2, -3, 4), B2 = rmat(R, 2, 2, -3, 4), BA = M.mul(B2, A2), AB = M.mul(A2, B2);
      return { q: 'Let $A = ' + mTex(A2) + '$ and $B = ' + mTex(B2) + '$. Find $BA$. (Compare it with $AB = ' + mTex(AB) + '$.)', a: { t: 'matrix', v: mPlain(BA) }, steps: ['$BA$ uses the rows of $B$ and the columns of $A$, which are different pairings from $AB$.', '$BA = ' + mTex(BA) + '$.', 'In general $AB \\ne BA$: order matters for matrix products.'], hint: 'Rows of $B$ times columns of $A$.' };
    }
    var st = ['$A$ is $' + s[0] + ' \\times ' + s[1] + '$ and $B$ is $' + s[1] + ' \\times ' + s[2] + '$, so $AB$ is $' + s[0] + ' \\times ' + s[2] + '$.',
      'Each entry is a row of $A$ times a column of $B$. Top-left: $' + A[0].map(function (x, k) { return pp(x) + pp(B[k][0]); }).join(' + ') + ' = ' + P[0][0].toTex() + '$.',
      '$AB = ' + mTex(P) + '$.'];
    return { q: 'Find $AB$ for $A = ' + mTex(A) + '$ and $B = ' + mTex(B) + '$.', a: { t: 'matrix', v: mPlain(P) }, steps: st, hint: 'Row times column for every entry, not entry times entry.' };
  });

  G('pre.gaussian-elimination', function (R, ctx) {
    var kind = R.pick(by(ctx, ['rowop', 'solve2', 'rowop'], ['solve2', 'rowop', 'solve3', 'type'], ['solve3', 'type', 'solve3']));
    if (kind === 'rowop') {
      var n = R.pick([2, 3]), Aug = rmat(R, n, n + 1, -5, 6), i = R.int(2, n), j = R.int(1, i - 1), k = R.nz(-3, 3);
      var out = Aug.map(function (r) { return r.slice(); }); out[i - 1] = out[i - 1].map(function (x, c) { return x + k * Aug[j - 1][c]; });
      var opT = 'R_' + i + ' \\to R_' + i + (k > 0 ? ' + ' : ' - ') + (Math.abs(k) === 1 ? '' : Math.abs(k)) + 'R_' + j;
      return { q: 'Apply the row operation $' + opT + '$ to $' + T.aug(Aug) + '$. Write the new augmented matrix.', a: { t: 'matrix', v: mPlain(out) }, steps: ['Only row ' + i + ' changes. Add $' + k + '$ times row ' + j + ' to it, entry by entry, including the constants column.', 'New row ' + i + ': $' + Aug[i - 1].map(function (x, c) { return x + T.signed(k * Aug[j - 1][c]) + ' = ' + out[i - 1][c]; }).join(',\\ ') + '$.', 'Result: $' + T.aug(out) + '$.'], hint: 'Change row ' + i + ' only, and remember the last column.', nolint: ['+ 0'] };
    }
    if (kind === 'type') {
      var t = R.int(0, 2), a = R.int(-5, 5), b = R.int(-5, 5), c = R.nz(-5, 5);
      var rows = t === 0 ? [[1, 0, a], [0, 1, b]] : t === 1 ? [[1, R.nz(-3, 3), a], [0, 0, c]] : [[1, R.nz(-3, 3), a], [0, 0, 0]];
      return { q: 'A system in $x$ and $y$ row-reduces to $' + T.aug(rows) + '$. How many solutions does it have?', a: { t: 'mc', choices: ['Exactly one', 'None', 'Infinitely many'], v: t, keep: true }, steps: [t === 0 ? 'Each variable has a leading 1, and the rows read $x = ' + a + '$, $y = ' + b + '$: exactly one solution.' : t === 1 ? 'The last row says $0x + 0y = ' + c + '$, which is impossible: no solution.' : 'The last row says $0 = 0$, which is always true. Only one equation is left for two unknowns, so $y$ is free: infinitely many solutions.'], hint: 'Read the last row as an equation.', nolint: ['+ 0'] };
    }
    var n3 = kind === 'solve2' ? 2 : 3, vars = n3 === 2 ? ['x', 'y'] : ['x', 'y', 'z'];
    var A = invertible(R, n3, -3, 4, function (d) { return Math.abs(d.num()) <= 6; }), sol = vars.map(function () { return R.int(-4, 5); });
    var bvec = A.map(function (row) { return row.reduce(function (s, x, j) { return s + x * sol[j]; }, 0); });
    var aug = A.map(function (row, i) { return row.concat([bvec[i]]); });
    var g = gaussSteps(aug), st = ['Write the augmented matrix: $' + T.aug(aug) + '$.'];
    g.ops.forEach(function (o) { st.push(o[0] + ': $' + T.aug(o[1].map(function (r) { return r.map(function (x) { return x.toTex(); }); })) + '$'); });
    st.push('Read off the solution: $' + vars.map(function (v, i) { return v + ' = ' + sol[i]; }).join(',\\ ') + '$.');
    return { q: 'Solve by row-reducing the augmented matrix: $' + sysTex(A, bvec, vars) + '$ Give the answer as $' + T.pt(vars) + '$.', a: { t: 'tuple', v: sol.map(String), vars: vars }, steps: st, hint: 'Get a 1 in the top-left, then zeros below it, column by column. Every operation applies to the whole row.' };
  });

  G('pre.determinants', function (R, ctx) {
    var kind = R.pick(by(ctx, ['d2', 'd2', 'solvek'], ['d2', 'd3', 'solvek'], ['d3', 'd3', 'solvek']));
    if (kind === 'd2') {
      var A = rmat(R, 2, 2, -7, 9), d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      return { q: 'Find $\\det' + mTex(A) + '$.', a: numA(d), steps: ['$\\det\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc$: the main diagonal product minus the other diagonal product.', '$' + pp(A[0][0]) + pp(A[1][1]) + ' - ' + pp(A[0][1]) + pp(A[1][0]) + ' = ' + A[0][0] * A[1][1] + ' - ' + pp(A[0][1] * A[1][0]) + ' = ' + d + '$.'], hint: 'Subtract the products of the diagonals: $ad - bc$.' };
    }
    if (kind === 'solvek') {
      var b = R.nz(-6, 6), c = R.nz(-6, 6), dd = R.nz(-6, 6), kv = R.nz(-6, 6);
      // det [[k, b],[c, dd]] = k*dd - b*c = 0 -> k = b c / dd ; choose b*c divisible by dd
      b = dd * R.nz(-3, 3); kv = b * c / dd;
      return { q: 'For what value of $k$ is $\\det\\begin{bmatrix} k & ' + b + ' \\\\ ' + c + ' & ' + dd + ' \\end{bmatrix} = 0$?', a: numA(kv), steps: ['$\\det = ' + T.coef(dd, 'k') + ' - ' + pp(b) + pp(c) + ' = ' + T.lin(dd, 'k', -b * c) + '$.', 'Set it to $0$: $' + T.coef(dd, 'k') + ' = ' + b * c + '$, so $k = ' + kv + '$. (Then the rows are proportional and the matrix has no inverse.)'], hint: 'Write $ad - bc$ with $k$ in it and solve.' };
    }
    var A3 = rmat(R, 3, 3, -4, 5), d3 = M.det(A3).num();
    var minors = [0, 1, 2].map(function (j) { var sub = [1, 2].map(function (i) { return [0, 1, 2].filter(function (c) { return c !== j; }).map(function (c) { return A3[i][c]; }); }); return sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0]; });
    return {
      q: 'Find $\\det' + mTex(A3) + '$.', a: numA(d3),
      steps: ['Expand along the first row with signs $+, -, +$: $a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}$, where each $M$ is the $2 \\times 2$ determinant left after crossing out that entry\'s row and column.',
        'Minors: $M_{11} = ' + minors[0] + '$, $M_{12} = ' + minors[1] + '$, $M_{13} = ' + minors[2] + '$.',
        '$' + pp(A3[0][0]) + pp(minors[0]) + ' - ' + pp(A3[0][1]) + pp(minors[1]) + ' + ' + pp(A3[0][2]) + pp(minors[2]) + ' = ' + d3 + '$.'],
      hint: 'Use cofactor expansion along the first row, and watch the alternating signs.'
    };
  });

  G('pre.matrix-inverse', function (R, ctx) {
    var kind = R.pick(by(ctx, ['inv2', 'inv2', 'exists'], ['inv2', 'exists', 'inv2int'], ['inv2', 'inv3', 'inv3']));
    if (kind === 'exists') {
      var sing = R.coin(), A = sing ? (function () { var a = R.nz(-5, 5), b = R.nz(-5, 5), k = R.nz(-3, 3); return [[a, b], [k * a, k * b]]; })() : invertible(R, 2, -6, 7);
      var d = M.det(A).num();
      return { q: 'True or false: $' + mTex(A) + '$ has an inverse.', a: { t: 'tf', v: d !== 0 }, steps: ['A square matrix has an inverse exactly when its determinant is not $0$.', '$\\det = ' + pp(A[0][0]) + pp(A[1][1]) + ' - ' + pp(A[0][1]) + pp(A[1][0]) + ' = ' + d + '$' + (d === 0 ? ', so there is no inverse (the matrix squashes the plane onto a line, and that cannot be undone).' : ', not $0$, so the inverse exists.')], hint: 'Compute the determinant.' };
    }
    if (kind === 'inv3') {
      var B = invertible(R, 3, -2, 3, function (dd) { return Math.abs(dd.num()) === 1; }), I = M.inv(B), d3 = M.det(B);
      var g = gaussSteps(B.map(function (r, i) { return r.concat([0, 1, 2].map(function (j) { return i === j ? 1 : 0; })); }));
      var st = ['Write $[A \\mid I]$ and row-reduce until the left side is $I$; the right side is then $A^{-1}$.', '$\\det A = ' + d3.toTex() + ' \\ne 0$, so the inverse exists.'];
      g.ops.forEach(function (o) { st.push(o[0] + ': $' + T.aug(o[1].map(function (r) { return r.map(function (x) { return x.toTex(); }); }), 3) + '$'); });
      st.push('$A^{-1} = ' + mTex(I) + '$. Check: $AA^{-1} = I$.');
      return { q: 'Find the inverse of $A = ' + mTex(B) + '$.', a: { t: 'matrix', v: mPlain(I) }, steps: st, hint: 'Row-reduce $[A \\mid I]$.' };
    }
    var A2 = invertible(R, 2, -6, 7, kind === 'inv2int' ? function (dd) { return Math.abs(dd.num()) === 1; } : null), dt = M.det(A2), I2 = M.inv(A2);
    var a = A2[0][0], b = A2[0][1], c = A2[1][0], d2 = A2[1][1];
    return {
      q: 'Find the inverse of $A = ' + mTex(A2) + '$.', a: { t: 'matrix', v: mPlain(I2) },
      steps: ['For $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, swap $a$ and $d$, negate $b$ and $c$, and divide by $ad - bc$. (Multiplying back gives $(ad - bc)I$, which is why we divide.)',
        '$\\det A = ' + pp(a) + pp(d2) + ' - ' + pp(b) + pp(c) + ' = ' + dt.toTex() + '$.',
        '$A^{-1} = \\dfrac{1}{' + dt.toTex() + '}' + mTex([[d2, -b], [-c, a]]) + ' = ' + mTex(I2) + '$.'],
      hint: 'Inverting each entry does not work. Use $\\frac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$.'
    };
  });

  G('pre.matrix-equations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['sys2', 'sys2', 'order'], ['sys2', 'giv3', 'order', 'matX'], ['giv3', 'matX', 'sys2']));
    if (kind === 'order') {
      return { q: 'If $A$ is invertible and $AX = B$, which product gives $X$?', a: mcq('$X = A^{-1}B$', ['$X = BA^{-1}$', '$X = \\dfrac{B}{A}$', '$X = B - A$']), steps: ['Multiply both sides on the <b>left</b> by $A^{-1}$: $A^{-1}AX = A^{-1}B$.', '$A^{-1}A = I$ and $IX = X$, so $X = A^{-1}B$.', 'Multiplying on the right would give $AXA^{-1}$ on the left side, which does not simplify, and $BA^{-1}$ is usually different from $A^{-1}B$. There is no matrix division.'], hint: 'Matrix products depend on order. Which side is $A$ on?' };
    }
    if (kind === 'sys2') {
      var A = invertible(R, 2, -5, 6, function (d) { return Math.abs(d.num()) <= 3; }), sol = [R.int(-5, 5), R.int(-5, 5)], b = A.map(function (r) { return r[0] * sol[0] + r[1] * sol[1]; });
      var I = M.inv(A), dt = M.det(A);
      return { q: 'Write the system $' + sysTex(A, b, ['x', 'y']) + '$ as $AX = B$ and solve it using $A^{-1}$. Give $(x, y)$.', a: { t: 'tuple', v: sol.map(String), vars: ['x', 'y'] }, steps: ['$A = ' + mTex(A) + '$, $X = \\begin{bmatrix} x \\\\ y \\end{bmatrix}$, $B = ' + T.col(b) + '$.', '$\\det A = ' + dt.toTex() + '$, so $A^{-1} = \\dfrac{1}{' + dt.toTex() + '}' + mTex([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]]) + ' = ' + mTex(I) + '$.', '$X = A^{-1}B = ' + mTex(I) + T.col(b) + ' = ' + T.col(sol) + '$.'], hint: 'Find $A^{-1}$, then multiply it on the left of $B$.' };
    }
    if (kind === 'giv3') {
      var B3 = invertible(R, 3, -2, 3, function (d) { return Math.abs(d.num()) === 1; }), I3 = M.inv(B3), s3 = [R.int(-4, 4), R.int(-4, 4), R.int(-4, 4)], b3 = B3.map(function (r) { return r[0] * s3[0] + r[1] * s3[1] + r[2] * s3[2]; });
      return { q: 'The system $' + sysTex(B3, b3, ['x', 'y', 'z']) + '$ has coefficient matrix $A$ with $A^{-1} = ' + mTex(I3) + '$. Use it to find $(x, y, z)$.', a: { t: 'tuple', v: s3.map(String), vars: ['x', 'y', 'z'] }, steps: ['$X = A^{-1}B$ with $B = ' + T.col(b3) + '$.', 'Each entry of $X$ is a row of $A^{-1}$ times $B$. First: $' + I3[0].map(function (x, k) { return pp(x.toTex()) + pp(b3[k]); }).join(' + ') + ' = ' + s3[0] + '$.', '$X = ' + T.col(s3) + '$.'], hint: 'Multiply $A^{-1}$ by the column of constants.' };
    }
    var A4 = invertible(R, 2, -4, 5, function (d) { return Math.abs(d.num()) === 1; }), X = rmat(R, 2, 2, -3, 4), B4 = M.mul(A4, X), I4 = M.inv(A4);
    return { q: 'Solve for the $2 \\times 2$ matrix $X$: $' + mTex(A4) + 'X = ' + mTex(B4) + '$.', a: { t: 'matrix', v: mPlain(X) }, steps: ['$X = A^{-1}B$ (multiply on the left).', '$A^{-1} = ' + mTex(I4) + '$.', '$X = ' + mTex(I4) + mTex(B4) + ' = ' + mTex(X) + '$.'], hint: 'Find $A^{-1}$ and put it on the left of $B$.' };
  });

  var XFORMS = [
    ['rotation by $90^\\circ$ counterclockwise', [[0, -1], [1, 0]], 'The point $(1, 0)$ goes to $(0, 1)$ and $(0, 1)$ goes to $(-1, 0)$.'],
    ['rotation by $180^\\circ$', [[-1, 0], [0, -1]], 'Every point goes to its opposite: $(x, y) \\to (-x, -y)$.'],
    ['rotation by $90^\\circ$ clockwise', [[0, 1], [-1, 0]], '$(1, 0)$ goes to $(0, -1)$ and $(0, 1)$ goes to $(1, 0)$.'],
    ['reflection across the $x$-axis', [[1, 0], [0, -1]], '$(x, y) \\to (x, -y)$.'],
    ['reflection across the $y$-axis', [[-1, 0], [0, 1]], '$(x, y) \\to (-x, y)$.'],
    ['reflection across the line $y = x$', [[0, 1], [1, 0]], '$(x, y) \\to (y, x)$.'],
    ['reflection across the line $y = -x$', [[0, -1], [-1, 0]], '$(x, y) \\to (-y, -x)$.']
  ];
  G('pre.matrix-transformations', function (R, ctx) {
    var kind = R.pick(by(ctx, ['image', 'matrixof', 'area'], ['matrixof', 'area', 'rot', 'compose'], ['compose', 'rot', 'area']));
    if (kind === 'image') {
      var A = rmat(R, 2, 2, -3, 4), p = [R.int(-4, 4), R.int(-4, 4)], im = [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]];
      return { q: 'The matrix $' + mTex(A) + '$ transforms the plane. Where does the point $' + T.pt(p) + '$ go?', a: { t: 'tuple', v: im.map(String) }, steps: ['Write the point as a column and multiply: $' + mTex(A) + T.col(p) + '$.', '$x$: $' + pp(A[0][0]) + pp(p[0]) + ' + ' + pp(A[0][1]) + pp(p[1]) + ' = ' + im[0] + '$; $y$: $' + pp(A[1][0]) + pp(p[0]) + ' + ' + pp(A[1][1]) + pp(p[1]) + ' = ' + im[1] + '$.', 'The image is $' + T.pt(im) + '$.'], hint: 'Multiply the matrix by the column $\\begin{bmatrix} x \\\\ y \\end{bmatrix}$.' };
    }
    if (kind === 'matrixof') {
      var X = R.pick(XFORMS);
      return { q: 'Find the $2 \\times 2$ matrix for the ' + X[0] + '.', a: { t: 'matrix', v: mPlain(X[1]) }, steps: ['The columns of the matrix are where $(1, 0)$ and $(0, 1)$ land.', X[2], 'So the matrix is $' + mTex(X[1]) + '$.'], hint: 'Where do $(1, 0)$ and $(0, 1)$ go? Those images are the columns.' };
    }
    if (kind === 'rot') {
      var th = R.pick([30, 45, 60, 120, 135, 150, -30, -45, -60]), c = sdTrig('cos', th), s = sdTrig('sin', th);
      return { q: 'Find the matrix that rotates the plane by $' + T.deg(th) + '$' + (th < 0 ? ' (clockwise)' : ' counterclockwise') + '. Give exact entries.', a: { t: 'matrix', v: [[sdPlain(c), sdPlain(sdNeg(s))], [sdPlain(s), sdPlain(c)]], form: 'simplest' }, steps: ['Rotating $(1, 0)$ by $\\theta$ gives $(\\cos\\theta, \\sin\\theta)$; rotating $(0, 1)$ gives $(-\\sin\\theta, \\cos\\theta)$. These are the columns.', '$\\cos(' + T.deg(th) + ') = ' + trigDeg('cos', th).t + '$ and $\\sin(' + T.deg(th) + ') = ' + trigDeg('sin', th).t + '$.', 'The matrix is $\\begin{bmatrix} ' + sdTex(c) + ' & ' + sdTex(sdNeg(s)) + ' \\\\ ' + sdTex(s) + ' & ' + sdTex(c) + ' \\end{bmatrix}$.'], hint: 'The rotation matrix is $\\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}$.' };
    }
    if (kind === 'area') {
      var B = invertible(R, 2, -4, 5), d = M.det(B).num(), S = R.pick([2, 3, 4, 5, 6, 10, 12]);
      return { q: 'A shape with area $' + S + '$ square units is transformed by $' + mTex(B) + '$. What is the area of the image?', a: numA(Math.abs(d) * S), steps: ['The unit square goes to a parallelogram with area $|\\det|$, and every area is scaled by the same factor.', '$\\det = ' + pp(B[0][0]) + pp(B[1][1]) + ' - ' + pp(B[0][1]) + pp(B[1][0]) + ' = ' + d + '$, so areas are multiplied by $|' + d + '| = ' + Math.abs(d) + '$' + (d < 0 ? ' (the negative sign means the shape is flipped over)' : '') + '.', 'New area: $' + Math.abs(d) + ' \\times ' + S + ' = ' + Math.abs(d) * S + '$.'], hint: 'Areas scale by the absolute value of the determinant.' };
    }
    var p2 = R.sample(XFORMS, 2), first = p2[0], second = p2[1], C = M.mul(second[1], first[1]);
    return { q: 'First apply the ' + first[0] + ', then the ' + second[0] + '. Find the single matrix for the combined transformation.', a: { t: 'matrix', v: mPlain(C) }, steps: ['First: $' + mTex(first[1]) + '$. Second: $' + mTex(second[1]) + '$.', 'A point $\\mathbf{v}$ becomes $S(F\\mathbf{v}) = (SF)\\mathbf{v}$: the matrix applied first goes on the <b>right</b>.', '$SF = ' + mTex(second[1]) + mTex(first[1]) + ' = ' + mTex(C) + '$.'], hint: 'Multiply second times first.' };
  });

  // ======================= 09-analysis.js
  // ===================================================================== Unit 9: Toward Calculus

  function plainTerms(list) { var out = ''; list.forEach(function (t) { var c = Q.from(t[0]); if (c.isZero()) return; var body = t[1] ? (c.abs().eq(1) ? '' : c.abs().toPlain() + '*') + t[1] : c.abs().toPlain(); out += (c.sign() < 0 ? '-' : (out ? '+' : '')) + body; }); return out || '0'; }
  function polyPlain(cs, v) { // [a, b, c] high -> low, as CAS text
    var n = cs.length - 1, out = '';
    cs.forEach(function (c, i) { var k = n - i; c = Q.from(c); if (c.isZero()) return; var t = k === 0 ? c.abs().toPlain() : (c.abs().eq(1) ? '' : c.abs().toPlain() + '*') + v + (k === 1 ? '' : '^' + k); out += (c.sign() < 0 ? '-' : (out ? '+' : '')) + t; });
    return out || '0';
  }

  G('pre.partial-fractions', function (R, ctx) {
    var kind = R.pick(by(ctx, ['distinct', 'distinct', 'form'], ['distinct', 'repeated', 'form', 'quad'], ['quad', 'repeated', 'distinct']));
    if (kind === 'form') {
      var r = R.nz(-5, 5), c = R.pick([1, 4, 9, 2, 3]), F = R.pick([
        ['\\dfrac{5x + 1}{(x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + ')(x^2 + ' + c + ')}', '$\\dfrac{A}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '} + \\dfrac{Bx + C}{x^2 + ' + c + '}$', ['$\\dfrac{A}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '} + \\dfrac{B}{x^2 + ' + c + '}$', '$\\dfrac{Ax + B}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '} + \\dfrac{C}{x^2 + ' + c + '}$', '$\\dfrac{A}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '} + \\dfrac{B}{x^2} + \\dfrac{C}{' + c + '}$'], 'The factor $x^2 + ' + c + '$ cannot be factored over the reals, so its numerator may need an $x$ term: $Bx + C$.'],
        ['\\dfrac{3x - 2}{(x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + ')^2}', '$\\dfrac{A}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '} + \\dfrac{B}{(x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + ')^2}$', ['$\\dfrac{A}{(x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + ')^2}$ only', '$\\dfrac{A}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '} + \\dfrac{B}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '}$', '$\\dfrac{Ax + B}{x ' + (r > 0 ? '- ' + r : '+ ' + (-r)) + '}$'], 'A repeated linear factor needs one fraction for each power: $(x - a)$ and $(x - a)^2$.']
      ]);
      return { q: 'Which is the correct form for the partial fraction decomposition of $' + F[0] + '$?', a: mcq(F[1], F[2]), steps: [F[3], 'So the form is ' + F[1] + '.'], hint: 'Each irreducible quadratic factor gets a linear numerator; each power of a repeated factor gets its own fraction.' };
    }
    if (kind === 'distinct') {
      var r1 = R.int(-5, 5), r2 = R.intNot(-5, 5, r1), A = R.nz(-5, 5), B = R.nz(-5, 5);
      var p = A + B, q = -(A * r2 + B * r1), den = [1, -(r1 + r2), r1 * r2];
      var num = T.lin(p, 'x', q), fx1 = T.lin(1, 'x', -r1), fx2 = T.lin(1, 'x', -r2);
      var showF = ctx.level === 1;
      return {
        q: 'Find $A$ and $B$: $\\dfrac{' + num + '}{' + (showF ? '(' + fx1 + ')(' + fx2 + ')' : T.poly(den, 'x')) + '} = \\dfrac{A}{' + fx1 + '} + \\dfrac{B}{' + fx2 + '}$.',
        a: { t: 'multi', parts: [{ label: '$A =$', a: numA(A) }, { label: '$B =$', a: numA(B) }] },
        steps: (showF ? [] : ['Factor the denominator: $' + T.poly(den, 'x') + ' = (' + fx1 + ')(' + fx2 + ')$.']).concat([
          'Multiply both sides by $(' + fx1 + ')(' + fx2 + ')$: $' + num + ' = A(' + fx2 + ') + B(' + fx1 + ')$.',
          'Put $x = ' + r1 + '$: $' + (p * r1 + q) + ' = A(' + (r1 - r2) + ')$, so $A = ' + A + '$.',
          'Put $x = ' + r2 + '$: $' + (p * r2 + q) + ' = B(' + (r2 - r1) + ')$, so $B = ' + B + '$.']),
        hint: 'Clear the denominators, then choose values of $x$ that make one term vanish.', nolint: ['+ 0']
      };
    }
    if (kind === 'repeated') {
      var r = R.nz(-4, 4), A2 = R.nz(-5, 5), B2 = R.nz(-6, 6), q2 = B2 - A2 * r, fx = T.lin(1, 'x', -r);
      return {
        q: 'Find $A$ and $B$: $\\dfrac{' + T.lin(A2, 'x', q2) + '}{(' + fx + ')^2} = \\dfrac{A}{' + fx + '} + \\dfrac{B}{(' + fx + ')^2}$.',
        a: { t: 'multi', parts: [{ label: '$A =$', a: numA(A2) }, { label: '$B =$', a: numA(B2) }] },
        steps: ['Multiply by $(' + fx + ')^2$: $' + T.lin(A2, 'x', q2) + ' = A(' + fx + ') + B$.', 'Match the $x$ terms: $A = ' + A2 + '$.', 'Put $x = ' + r + '$: $' + (A2 * r + q2) + ' = B$.'],
        hint: 'After clearing denominators, compare coefficients or substitute $x = ' + r + '$.', nolint: ['+ 0']
      };
    }
    var r3 = R.nz(-3, 3), c3 = R.pick([1, 4, 9, 2]), A3 = R.nz(-4, 4), B3 = R.nz(-4, 4), C3 = R.int(-5, 5);
    var n2 = A3 + B3, n1 = C3 - B3 * r3, n0 = A3 * c3 - C3 * r3, fx3 = T.lin(1, 'x', -r3);
    return {
      q: 'Find $A$, $B$ and $C$: $\\dfrac{' + T.poly([n2, n1, n0], 'x') + '}{(' + fx3 + ')(x^2 + ' + c3 + ')} = \\dfrac{A}{' + fx3 + '} + \\dfrac{Bx + C}{x^2 + ' + c3 + '}$.',
      a: { t: 'multi', parts: [{ label: '$A =$', a: numA(A3) }, { label: '$B =$', a: numA(B3) }, { label: '$C =$', a: numA(C3) }] },
      steps: ['Multiply through: $' + T.poly([n2, n1, n0], 'x') + ' = A(x^2 + ' + c3 + ') + (Bx + C)(' + fx3 + ')$.',
        'Put $x = ' + r3 + '$: $' + (n2 * r3 * r3 + n1 * r3 + n0) + ' = A(' + (r3 * r3 + c3) + ')$, so $A = ' + A3 + '$.',
        'Match $x^2$ terms: $' + n2 + ' = A + B$, so $B = ' + B3 + '$.',
        'Match constant terms: $' + n0 + ' = ' + T.coef(c3, 'A') + ' - ' + pp(r3) + 'C$, so $C = ' + C3 + '$.'],
      hint: 'Substitute the root of the linear factor first, then match coefficients.', nolint: ['+ 0']
    };
  });

  var INDS = [ // [term TeX in i, closed TeX in n, term plain in k, closed plain in n, name]
    ['i', '\\dfrac{n(n + 1)}{2}', 'k', 'n*(n+1)/2', '1 + 2 + 3 + \\cdots + n'],
    ['2i - 1', 'n^2', '2*k-1', 'n^2', '1 + 3 + 5 + \\cdots + (2n - 1)'],
    ['i^2', '\\dfrac{n(n + 1)(2n + 1)}{6}', 'k^2', 'n*(n+1)*(2*n+1)/6', '1^2 + 2^2 + \\cdots + n^2'],
    ['2^{i - 1}', '2^n - 1', '2^(k-1)', '2^n-1', '1 + 2 + 4 + \\cdots + 2^{n - 1}'],
    ['\\dfrac{1}{i(i + 1)}', '\\dfrac{n}{n + 1}', '1/(k*(k+1))', 'n/(n+1)', '\\dfrac{1}{1 \\cdot 2} + \\dfrac{1}{2 \\cdot 3} + \\cdots + \\dfrac{1}{n(n + 1)}'],
    ['4i - 3', 'n(2n - 1)', '4*k-3', 'n*(2*n-1)', '1 + 5 + 9 + \\cdots + (4n - 3)'],
    ['3i - 1', '\\dfrac{n(3n + 1)}{2}', '3*k-1', 'n*(3*n+1)/2', '2 + 5 + 8 + \\cdots + (3n - 1)'],
    ['i^3', '\\left(\\dfrac{n(n + 1)}{2}\\right)^2', 'k^3', '(n*(n+1)/2)^2', '1^3 + 2^3 + \\cdots + n^3'],
    ['2i', 'n(n + 1)', '2*k', 'n*(n+1)', '2 + 4 + 6 + \\cdots + 2n'],
    ['3^{i - 1}', '\\dfrac{3^n - 1}{2}', '3^(k-1)', '(3^n-1)/2', '1 + 3 + 9 + \\cdots + 3^{n - 1}'],
    ['5i - 4', '\\dfrac{n(5n - 3)}{2}', '5*k-4', 'n*(5*n-3)/2', '1 + 6 + 11 + \\cdots + (5n - 4)'],
    ['i(i + 1)', '\\dfrac{n(n + 1)(n + 2)}{3}', 'k*(k+1)', 'n*(n+1)*(n+2)/3', '1 \\cdot 2 + 2 \\cdot 3 + \\cdots + n(n + 1)'],
    ['3i', '\\dfrac{3n(n + 1)}{2}', '3*k', '3*n*(n+1)/2', '3 + 6 + 9 + \\cdots + 3n']
  ];
  function subN(plain, v) { return plain.replace(/\bn\b/g, v); }
  G('pre.induction', function (R, ctx) {
    var kind = R.pick(by(ctx, ['base', 'next', 'value', 'logic'], ['next', 'target', 'value', 'logic', 'divis'], ['target', 'combine', 'divis', 'next', 'value']));
    var I = R.pick(INDS), stmt = I[4] + ' = ' + I[1];
    var term = function (i) { return ML.evalPlain(I[2].replace(/k/g, '(' + i + ')')); };
    if (kind === 'base') {
      var lv = Q.from(I[2] === '1/(k*(k+1))' ? '1/2' : String(term(1))), rv = lv;
      return { q: 'To prove $' + stmt + '$ for every positive integer $n$ by induction, first check the base case $n = 1$. What do the left side and the right side equal?', a: { t: 'multi', parts: [{ label: 'Left side', a: numA(lv.toPlain()) }, { label: 'Right side', a: numA(rv.toPlain()) }] }, steps: ['For $n = 1$ the left side has just one term: $' + I[0].replace(/i/g, '1') + ' = ' + lv.toTex() + '$.', 'The right side: $' + I[1].replace(/n/g, '(1)') + ' = ' + rv.toTex() + '$.', 'They match, so the statement is true for $n = 1$. This is the first domino.'], hint: 'Substitute $n = 1$ on each side.' };
    }
    if (kind === 'next') {
      var nt = subN(I[2].replace(/k/g, 'n'), '(k+1)');
      return { q: 'Proving $' + stmt + '$ by induction, you assume it holds for $n = k$. To get the left side for $n = k + 1$, which term do you add? Write it in terms of $k$.', a: { t: 'expr', v: nt, vars: ['k'] }, steps: ['The sum for $n = k + 1$ is the sum for $n = k$ plus one more term: the term with $i = k + 1$.', 'The general term is $' + I[0] + '$, so the new term is $' + T.plain(nt) + '$.'], hint: 'Replace $i$ with $k + 1$ in the general term.' };
    }
    if (kind === 'target' || kind === 'combine') {
      var tgt = subN(I[3], '(k+1)');
      var qq = kind === 'target' ? 'In the inductive step of proving $' + stmt + '$, what must the right side become when $n = k + 1$? Write it in terms of $k$.' : 'In the inductive step for $' + stmt + '$, you add the next term to the formula for $n = k$. Simplify $' + T.plain(subN(I[3], 'k')) + ' + ' + T.plain(subN(I[2].replace(/k/g, 'n'), '(k+1)')) + '$.';
      return { q: qq, a: { t: 'expr', v: tgt, vars: ['k'] }, steps: kind === 'target' ? ['The goal is the same formula with $n$ replaced by $k + 1$: $' + T.plain(tgt) + '$.', 'The proof must show that the assumed sum plus the next term equals this.'] : ['Combine over a common denominator and factor; the result should be the formula with $n = k + 1$.', 'It equals $' + T.plain(tgt) + '$, which is exactly the statement for $n = k + 1$.'], hint: 'Put $k + 1$ in place of $n$ in the closed form.' };
    }
    if (kind === 'value') {
      var N = R.int(5, 20), tot = 0; for (var i = 1; i <= N; i++) tot = Q.from(tot).add(Q.from(I[2] === '1/(k*(k+1))' ? Q(1, i * (i + 1)) : term(i)));
      return { q: 'Use the formula $' + stmt + '$ to find the sum with $n = ' + N + '$ terms.', a: numA(Q.from(tot).toPlain()), steps: ['Substitute $n = ' + N + '$ into the right side: $' + I[1].replace(/n/g, '(' + N + ')') + ' = ' + Q.from(tot).toTex() + '$.', 'Adding the ' + N + ' terms one by one gives the same total, which the induction proof guarantees for every $n$.'], hint: 'Put $n = ' + N + '$ into the formula.' };
    }
    if (kind === 'divis') {
      var a = R.int(2, 12), jj = R.pick([1, 1, 2, 3]), b = a * jj + 1, bm = b - 1;
      return { q: 'To prove $' + a + '$ divides $' + b + '^n - 1$ for all $n \\ge 1$, assume $' + b + '^k - 1$ is a multiple of $' + a + '$. Fill in the number $m$: $' + b + '^{k+1} - 1 = ' + b + '(' + b + '^k - 1) + m$.', a: numA(bm), steps: ['$' + b + '(' + b + '^k - 1) = ' + b + '^{k+1} - ' + b + '$.', 'To get $' + b + '^{k+1} - 1$ we must add back $' + b + ' - 1 = ' + bm + '$, so $m = ' + bm + '$.', 'Both $' + b + '(' + b + '^k - 1)$ (by the assumption) and $' + bm + (jj === 1 ? '' : ' = ' + jj + ' \\cdot ' + a) + '$ are multiples of $' + a + '$, so their sum is too. With the base case $' + b + '^1 - 1 = ' + bm + '$, which is a multiple of $' + a + '$, the proof is complete.'], hint: 'Expand $' + b + '(' + b + '^k - 1)$ and compare.' };
    }
    var L = R.pick([
      ['A student checks $n = 1, 2, 3, 4$ and finds the formula works each time, then concludes it is true for all $n$.', 'It is not a proof: checking examples never covers every $n$.', ['It is a complete proof by induction.', 'It is a proof, but only for even $n$.', 'It would be a proof if one more case were checked.']],
      ['A student proves "if the statement holds for $k$, it holds for $k + 1$" but never checks $n = 1$.', 'The proof is incomplete: without a base case, the chain of dominoes never starts.', ['The proof is complete; the base case is optional.', 'The proof works for all $n \\ge 2$.', 'The proof only fails for $n = 1$.']],
      ['In the inductive step, a student writes the statement for $n = k + 1$, then simplifies both sides until they get $0 = 0$.', 'This assumes what it is trying to prove, so it is not valid.', ['This is a valid inductive step.', 'This is valid if the base case is checked.', 'This proves the base case.']]
    ]);
    return { q: L[0] + ' What is wrong, if anything?', a: mcq(L[1], L[2]), steps: ['Induction needs two parts: the base case (the first domino falls) and the inductive step (each domino knocks over the next), where the step starts from the case $n = k$ and builds the case $n = k + 1$.', L[1]], hint: 'An induction proof needs a base case and an inductive step that starts from $n = k$.' };
  });

  G('pre.logistic-models', function (R, ctx) {
    var kind = R.pick(by(ctx, ['cap', 'init', 'fast'], ['init', 'Afind', 'half', 'fast'], ['half', 'write', 'Afind']));
    var K = R.pick([500, 1000, 2000, 5000, 800, 1200, 10000]), A = R.pick([3, 4, 7, 9, 19, 24, 49, 99, 15]), r = R.pick(['0.2', '0.5', '0.1', '0.4', '0.25', '0.3']);
    while (K % (A + 1)) A = R.pick([3, 4, 9, 19, 24, 49, 99]);
    var P0 = K / (A + 1), mT = 'P(t) = \\dfrac{' + K + '}{1 + ' + A + 'e^{-' + r + 't}}';
    var ctxT = R.pick(['fish in a lake', 'people who have heard a rumor', 'rabbits on an island', 'trees in a new forest']);
    if (kind === 'cap') return { q: 'The number of ' + ctxT + ' after $t$ years is modeled by $' + mT + '$. What is the carrying capacity (the long-run value)?', a: numA(K), steps: ['As $t$ grows, $e^{-' + r + 't}$ shrinks toward $0$.', 'Then the denominator approaches $1$, so $P(t)$ approaches $' + K + '$. It never passes it: growth slows near this ceiling.'], hint: 'What happens to $e^{-' + r + 't}$ when $t$ is very large?' };
    if (kind === 'init') return { q: 'The number of ' + ctxT + ' after $t$ years is modeled by $' + mT + '$. How many were there at $t = 0$?', a: numA(P0), steps: ['At $t = 0$, $e^0 = 1$.', '$P(0) = \\dfrac{' + K + '}{1 + ' + A + '} = ' + P0 + '$.'], hint: 'Substitute $t = 0$.' };
    if (kind === 'fast') return { q: 'The number of ' + ctxT + ' after $t$ years is modeled by $' + mT + '$. At what size is the population growing fastest?', a: numA(K / 2), steps: ['A logistic curve rises slowly, then steeply, then levels off. It is steepest exactly halfway to the carrying capacity.', 'Halfway to $' + K + '$ is $' + K / 2 + '$.'], hint: 'The steepest point of the S-curve is at half the carrying capacity.' };
    if (kind === 'Afind') return { q: 'A population follows $P(t) = \\dfrac{' + K + '}{1 + Ae^{-' + r + 't}}$ and starts at $P(0) = ' + P0 + '$. Find $A$.', a: numA(A), steps: ['$P(0) = \\dfrac{' + K + '}{1 + A} = ' + P0 + '$.', '$1 + A = \\dfrac{' + K + '}{' + P0 + '} = ' + (A + 1) + '$, so $A = ' + A + '$.'], hint: 'Set $t = 0$ and solve for $A$.' };
    if (kind === 'half') {
      if (A === 1) A = 9;
      var Kh = (A + 1) * R.pick([10, 20, 50, 100]);
      return { q: 'A population follows $P(t) = \\dfrac{' + Kh + '}{1 + ' + A + 'e^{-' + r + 't}}$. When does it reach half the carrying capacity? Give the exact time.', a: numA('ln(' + A + ')/' + r), steps: ['Half of $' + Kh + '$ is $' + Kh / 2 + '$, which happens when the denominator equals $2$: $1 + ' + A + 'e^{-' + r + 't} = 2$.', '$e^{-' + r + 't} = \\frac{1}{' + A + '}$, so $-' + r + 't = \\ln\\frac{1}{' + A + '} = -\\ln ' + A + '$.', '$t = \\dfrac{\\ln ' + A + '}{' + r + '}$ (about $' + T.num(U.round(Math.log(A) / Number(r), 2)) + '$ years).'], hint: 'Set the denominator equal to $2$ and take natural logs.' };
    }
    return { q: 'Write a logistic model $P(t) = \\dfrac{K}{1 + Ae^{-rt}}$ for a population with carrying capacity $' + K + '$, initial size $' + P0 + '$ and $r = ' + r + '$.', a: { t: 'expr', v: K + '/(1+' + A + '*e^(-' + r + '*t))', vars: ['t'] }, steps: ['$K = ' + K + '$ and $r = ' + r + '$.', 'From $P(0) = \\dfrac{K}{1 + A}$: $1 + A = \\dfrac{' + K + '}{' + P0 + '} = ' + (A + 1) + '$, so $A = ' + A + '$.', '$' + mT + '$.'], hint: 'Use $P(0) = \\frac{K}{1 + A}$ to find $A$.' };
  });

  G('pre.difference-quotient', function (R, ctx) {
    var kind = R.pick(by(ctx, ['fxh', 'lin', 'numq'], ['dq', 'fxh', 'numq', 'recip'], ['dq', 'cubic', 'recip', 'sqrt', 'dq', 'dq']));
    var a = R.nz(-4, 4), b = R.int(-6, 6), c = R.int(-6, 6), fT = T.poly([a, b, c], 'x');
    if (kind === 'fxh') {
      var ex = polyPlain([a, 0, 0], 'x') ;
      var plain = plainTerms([[a, 'x^2'], [2 * a, 'x*h'], [a, 'h^2'], [b, 'x'], [b, 'h'], [c, '']]);
      return { q: 'For $f(x) = ' + fT + '$, find $f(x + h)$ and expand it.', a: { t: 'expr', v: plain, vars: ['x', 'h'], form: 'expanded' }, steps: ['Replace every $x$ with $(x + h)$. (It is not $f(x) + h$.)', '$f(x + h) = ' + T.coef(a, '(x + h)^2') + T.coef(b, '(x + h)', false) + T.signed(c) + '$.', '$= ' + T.terms([[a, 'x^2'], [2 * a, 'xh'], [a, 'h^2'], [b, 'x'], [b, 'h'], [c, '']]) + '$.'], hint: 'Substitute $x + h$ for $x$ everywhere, then expand $(x + h)^2$.' };
    }
    if (kind === 'lin') {
      var m = R.nz(-9, 9);
      return { q: 'For $f(x) = ' + T.lin(m, 'x', b) + '$, simplify the difference quotient $\\dfrac{f(x + h) - f(x)}{h}$.', a: { t: 'expr', v: String(m), vars: ['x', 'h'] }, steps: ['$f(x + h) - f(x) = ' + T.lin(m, '(x + h)', b) + ' - (' + T.lin(m, 'x', b) + ') = ' + T.mono(m, 'h') + '$.', 'Divide by $h$: $' + m + '$. Every secant of a line has the line\'s slope.'], hint: 'Subtract first; most terms cancel.' };
    }
    if (kind === 'numq') {
      var x0 = R.int(-3, 4), h = R.pick(['1', '0.5', '0.1', '2']), hv = Number(h), sl = Q.from(2 * a * x0 + b).add(Q.from(h).mul(a));
      return { q: 'For $f(x) = ' + fT + '$, find the slope of the secant line from $x = ' + x0 + '$ to $x = ' + T.num(x0 + hv) + '$.', a: numA(sl.toPlain()), steps: ['Slope $= \\dfrac{f(' + T.num(x0 + hv) + ') - f(' + x0 + ')}{' + h + '}$.', '$f(' + T.num(x0 + hv) + ') = ' + T.num(U.fix(a * (x0 + hv) * (x0 + hv) + b * (x0 + hv) + c)) + '$ and $f(' + x0 + ') = ' + (a * x0 * x0 + b * x0 + c) + '$.', 'Slope $= ' + sl.toTex() + '$. (The general formula $2ax + ah + b$ gives the same.)'], hint: 'Rise over run between the two points on the graph.' };
    }
    if (kind === 'dq') {
      var dq = plainTerms([[2 * a, 'x'], [a, 'h'], [b, '']]);
      return { q: 'For $f(x) = ' + fT + '$, simplify $\\dfrac{f(x + h) - f(x)}{h}$ (for $h \\ne 0$).', a: { t: 'expr', v: dq, vars: ['x', 'h'], form: 'expanded' }, steps: ['$f(x + h) = ' + T.terms([[a, 'x^2'], [2 * a, 'xh'], [a, 'h^2'], [b, 'x'], [b, 'h'], [c, '']]) + '$.', '$f(x + h) - f(x) = ' + T.terms([[2 * a, 'xh'], [a, 'h^2'], [b, 'h']]) + '$ (the terms of $f(x)$ cancel).', 'Factor out $h$ and cancel: $' + T.terms([[2 * a, 'x'], [a, 'h'], [b, '']]) + '$.'], hint: 'Expand, subtract, then every remaining term has a factor of $h$.' };
    }
    if (kind === 'cubic') {
      var kc = R.pick([1, 1, 2, 3, -1, -2, 4]), kcT = kc === 1 ? '' : kc === -1 ? '-' : String(kc);
      return { q: 'For $f(x) = ' + kcT + 'x^3$, simplify $\\dfrac{f(x + h) - f(x)}{h}$ (for $h \\ne 0$).', a: { t: 'expr', v: plainTerms([[3 * kc, 'x^2'], [3 * kc, 'x*h'], [kc, 'h^2']]), vars: ['x', 'h'], form: 'expanded' }, steps: ['$(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$.', 'Subtract $x^3$: $3x^2h + 3xh^2 + h^3$.', 'Divide by $h$: $3x^2 + 3xh + h^2$.'].concat(kc === 1 ? [] : ['Multiply by $' + kc + '$: $' + T.terms([[3 * kc, 'x^2'], [3 * kc, 'xh'], [kc, 'h^2']]) + '$.']), hint: 'Expand $(x + h)^3$ first.' };
    }
    if (kind === 'recip') {
      var k = R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      return { q: 'For $f(x) = \\dfrac{' + k + '}{x}$, simplify $\\dfrac{f(x + h) - f(x)}{h}$ (for $h \\ne 0$).', a: { t: 'expr', v: '-' + k + '/(x*(x+h))', vars: ['x', 'h'] }, steps: ['$f(x + h) - f(x) = \\dfrac{' + k + '}{x + h} - \\dfrac{' + k + '}{x} = \\dfrac{' + (k === 1 ? 'x - (x + h)' : k + 'x - ' + k + '(x + h)') + '}{x(x + h)} = \\dfrac{-' + (k === 1 ? '' : k) + 'h}{x(x + h)}$.', 'Divide by $h$: $-\\dfrac{' + k + '}{x(x + h)}$.'], hint: 'Combine the two fractions over $x(x + h)$ first.' };
    }
    var cs = R.pick([0, 0, 1, 2, 3, 5, -1, -2]), inA = cs ? 'x' + T.signed(cs) : 'x', inB = cs ? 'x + h' + T.signed(cs) : 'x + h', pA = cs ? 'x' + (cs > 0 ? '+' : '') + cs : 'x', pB = cs ? 'x+h' + (cs > 0 ? '+' : '') + cs : 'x+h';
    return { q: 'For $f(x) = \\sqrt{' + inA + '}$, simplify $\\dfrac{f(x + h) - f(x)}{h}$ so that $h$ is no longer in a denominator by itself.', a: { t: 'expr', v: '1/(sqrt(' + pB + ')+sqrt(' + pA + '))', vars: ['x', 'h'] }, steps: ['Multiply top and bottom by the conjugate $\\sqrt{' + inB + '} + \\sqrt{' + inA + '}$.', 'The top becomes $(' + inB + ') - (' + inA + ') = h$.', 'Cancel $h$: $\\dfrac{1}{\\sqrt{' + inB + '} + \\sqrt{' + inA + '}}$.'], hint: 'Multiply by the conjugate of the numerator.' };
  });

  G('pre.limits-intro', function (R, ctx) {
    var kind = R.pick(by(ctx, ['hole', 'cont', 'tf'], ['hole', 'piece', 'vs', 'hole'], ['hole3', 'piece', 'vs', 'hole']));
    if (kind === 'cont') {
      var a = R.int(-3, 4), cs = [R.nz(-3, 3), R.int(-5, 5), R.int(-6, 6)], v = cs[0] * a * a + cs[1] * a + cs[2];
      return { q: 'Find $\\displaystyle\\lim_{x \\to ' + a + '} \\left(' + T.poly(cs, 'x') + '\\right)$.', a: numA(v), steps: ['A polynomial has no breaks, so as $x$ gets close to $' + a + '$ its values get close to its value at $' + a + '$.', 'Substitute: $' + v + '$.'], hint: 'For a polynomial, the limit is the value.' };
    }
    if (kind === 'hole' || kind === 'hole3') {
      var r = R.int(-5, 5), s = R.intNot(-6, 6, r), cub = kind === 'hole3' && R.coin();
      if (cub) { var r3 = R.nz(-3, 3); return { q: 'Find $\\displaystyle\\lim_{x \\to ' + r3 + '} \\dfrac{x^3 ' + (r3 > 0 ? '- ' + r3 * r3 * r3 : '+ ' + (-r3 * r3 * r3)) + '}{' + T.lin(1, 'x', -r3) + '}$.', a: numA(3 * r3 * r3), steps: ['At $x = ' + r3 + '$ both top and bottom are $0$: the function is undefined there, but the limit can still exist.', 'Factor: $x^3 - ' + pp(r3) + '^3 = (' + T.lin(1, 'x', -r3) + ')(' + T.poly([1, r3, r3 * r3], 'x') + ')$.', 'For $x \\ne ' + r3 + '$ the quotient equals $' + T.poly([1, r3, r3 * r3], 'x') + '$, which approaches $' + 3 * r3 * r3 + '$.'], hint: 'Factor the difference (or sum) of cubes.' }; }
      var num = [1, -(r + s), r * s];
      return { q: 'Find $\\displaystyle\\lim_{x \\to ' + r + '} \\dfrac{' + T.poly(num, 'x') + '}{' + T.lin(1, 'x', -r) + '}$.', a: numA(r - s), steps: ['Substituting $x = ' + r + '$ gives $\\frac{0}{0}$: the function has a hole there, not a value. The limit asks about nearby $x$.', 'Factor: $\\dfrac{(' + T.lin(1, 'x', -r) + ')(' + T.lin(1, 'x', -s) + ')}{' + T.lin(1, 'x', -r) + '} = ' + T.lin(1, 'x', -s) + '$ for $x \\ne ' + r + '$.', 'As $x \\to ' + r + '$, this approaches $' + r + T.signed(-s) + ' = ' + (r - s) + '$.'], hint: 'Factor the numerator and cancel the common factor.', nolint: ['+ 0'] };
    }
    if (kind === 'piece' || kind === 'vs') {
      var a2 = R.int(-2, 3), m1 = R.nz(-3, 3), b1 = R.int(-4, 4), L1 = m1 * a2 + b1, same = kind === 'vs' || R.coin(), m2 = R.nz(-3, 3), b2 = same ? L1 - m2 * a2 : L1 - m2 * a2 + R.nz(-3, 3), L2 = m2 * a2 + b2;
      if (kind === 'vs') {
        var fa = L1 + R.nz(-4, 4);
        return { q: 'Let $f(x) = ' + T.lin(m1, 'x', b1) + '$ for $x \\ne ' + a2 + '$, and $f(' + a2 + ') = ' + fa + '$. Find $\\displaystyle\\lim_{x \\to ' + a2 + '} f(x)$ and $f(' + a2 + ')$.', a: { t: 'multi', parts: [{ label: 'Limit', a: numA(L1) }, { label: '$f(' + a2 + ')$', a: numA(fa) }] }, steps: ['The limit only looks at $x$ near $' + a2 + '$, not at $' + a2 + '$ itself. Nearby, $f(x) = ' + T.lin(m1, 'x', b1) + '$, which approaches $' + L1 + '$.', 'The value at the point is defined separately: $f(' + a2 + ') = ' + fa + '$.', 'So the limit is $' + L1 + '$ even though $f(' + a2 + ') = ' + fa + '$: the graph has a hole at height $' + L1 + '$ and a lone dot at height $' + fa + '$.'], hint: 'The limit ignores what happens exactly at $x = ' + a2 + '$.' };
      }
      return { q: 'Let $f(x) = ' + T.lin(m1, 'x', b1) + '$ for $x < ' + a2 + '$ and $f(x) = ' + T.lin(m2, 'x', b2) + '$ for $x \\ge ' + a2 + '$. Find $\\displaystyle\\lim_{x \\to ' + a2 + '} f(x)$, or type DNE if it does not exist.', a: numA(L1 === L2 ? L1 : 'DNE'), steps: ['From the left, $f(x) = ' + T.lin(m1, 'x', b1) + ' \\to ' + L1 + '$.', 'From the right, $f(x) = ' + T.lin(m2, 'x', b2) + ' \\to ' + L2 + '$.', L1 === L2 ? 'Both sides approach $' + L1 + '$, so the limit is $' + L1 + '$.' : 'The two sides approach different values ($' + L1 + '$ and $' + L2 + '$), so the limit does not exist.'], hint: 'Find where each piece is heading as $x \\to ' + a2 + '$.' };
    }
    var S = R.pick([
      ['If $f(a)$ is undefined, then $\\displaystyle\\lim_{x \\to a} f(x)$ cannot exist.', false, 'False. For example $\\dfrac{x^2 - 1}{x - 1}$ is undefined at $1$, but its values approach $2$, so the limit is $2$.'],
      ['$\\displaystyle\\lim_{x \\to a} f(x)$ is always equal to $f(a)$.', false, 'False. The limit describes nearby values. If $f$ has a hole or a jump, or $f(a)$ is defined differently, they can differ.'],
      ['If $\\displaystyle\\lim_{x \\to 2} f(x) = 5$, then $f(x)$ is close to $5$ whenever $x$ is close enough to $2$ (but not equal to $2$).', true, 'True. That is what the limit means.'],
      ['A limit can exist at a point where the graph has a hole.', true, 'True. The hole is where the value is missing; the nearby values can still approach one height.'],
      ['If the values from the left approach $3$ and the values from the right approach $4$, the limit is $3.5$.', false, 'False. The two sides must approach the same number; here the limit does not exist.']
    ]);
    return { q: 'True or false: ' + S[0], a: { t: 'tf', v: S[1] }, steps: [S[2]], hint: 'A limit is about the values near $a$, not the value at $a$.' };
  });

  G('pre.limits-graphs-tables', function (R, ctx) {
    var kind = R.pick(by(ctx, ['table', 'side', 'table', 'side'], ['table', 'side', 'jump'], ['table', 'jump', 'side']));
    if (kind === 'table') {
      var Fs = [
        function () { var a = R.int(-3, 4), s = R.intNot(-4, 4, a); return { tex: '\\dfrac{' + T.poly([1, -(a + s), a * s], 'x') + '}{' + T.lin(1, 'x', -a) + '}', f: function (x) { return x - s; }, a: a, L: String(a - s), why: 'Factoring shows $f(x) = ' + T.lin(1, 'x', -s) + '$ for $x \\ne ' + a + '$, which confirms the limit $' + (a - s) + '$.' }; },
        function () { var k = R.int(2, 5); return { tex: '\\dfrac{\\sin ' + k + 'x}{x}', f: function (x) { return Math.sin(k * x) / x; }, a: 0, L: String(k), why: 'For small angles (in radians) $\\sin u \\approx u$, so $\\frac{\\sin ' + k + 'x}{x} \\approx \\frac{' + k + 'x}{x} = ' + k + '$.' }; },
        function () { return { tex: '\\dfrac{e^x - 1}{x}', f: function (x) { return (Math.exp(x) - 1) / x; }, a: 0, L: '1', why: 'The values close in on $1$ from both sides.' }; },
        function () { var c = R.pick([4, 9, 16, 25]), r = Math.sqrt(c); return { tex: '\\dfrac{\\sqrt{x + ' + c + '} - ' + r + '}{x}', f: function (x) { return (Math.sqrt(x + c) - r) / x; }, a: 0, L: '1/' + 2 * r, why: 'Multiplying by the conjugate gives $\\frac{1}{\\sqrt{x + ' + c + '} + ' + r + '} \\to \\frac{1}{' + 2 * r + '}$.' }; },
        function () { return { tex: '\\dfrac{1 - \\cos x}{x}', f: function (x) { return (1 - Math.cos(x)) / x; }, a: 0, L: '0', why: 'The values shrink toward $0$ from both sides (negative on the left, positive on the right).' }; },
        function () { var k = R.int(2, 5); return { tex: '\\dfrac{\\tan ' + k + 'x}{x}', f: function (x) { return Math.tan(k * x) / x; }, a: 0, L: String(k), why: 'For small angles (in radians) $\\tan u \\approx u$, so the values close in on $' + k + '$.' }; },
        function () { return { tex: '\\dfrac{1 - \\cos x}{x^2}', f: function (x) { return (1 - Math.cos(x)) / (x * x); }, a: 0, L: '1/2', why: 'The values close in on $0.5$ from both sides.' }; },
        function () { var k = R.int(2, 4); return { tex: '\\dfrac{e^{' + k + 'x} - 1}{x}', f: function (x) { return (Math.exp(k * x) - 1) / x; }, a: 0, L: String(k), why: 'The values close in on $' + k + '$ from both sides.' }; }
      ];
      var F = R.pick(Fs)(), hs = [-0.1, -0.01, -0.001, 0.001, 0.01, 0.1];
      var rows = hs.map(function (h) { var x = U.fix(F.a + h); return T.num(x) + ' & ' + T.num(U.round(F.f(x), 5)); });
      var tab = '$$\\begin{array}{c|c} x & f(x) \\\\ \\hline ' + rows.join(' \\\\ ') + ' \\end{array}$$';
      return { q: 'Use the table to estimate $\\displaystyle\\lim_{x \\to ' + F.a + '} f(x)$ for $f(x) = ' + F.tex + '$.' + tab, a: numA(F.L), steps: ['$f(' + F.a + ')$ is undefined ($\\frac{0}{0}$), but the table shows the values near $x = ' + F.a + '$.', 'From the left and from the right, $f(x)$ gets closer and closer to $' + T.plain(F.L) + '$.', F.why], hint: 'Read down toward the middle of the table from both sides.' };
    }
    var a = R.int(-2, 3), m1 = R.nz(-2, 2), b1 = R.int(-3, 4), L1 = m1 * a + b1, jump = kind === 'jump', m2 = R.nz(-2, 2), b2 = jump ? L1 - m2 * a + R.nz(-3, 3) : L1 - m2 * a, L2 = m2 * a + b2, fa = R.pick([L1, L2, L1 + 2, 'none']);
    var faT = fa === 'none' ? 'undefined' : '$' + fa + '$';
    return {
      q: 'The picture shows $f(x) = ' + T.lin(m1, 'x', b1) + '$ for $x < ' + a + '$ and $f(x) = ' + T.lin(m2, 'x', b2) + '$ for $x > ' + a + '$, with $f(' + a + ')$ ' + faT + '. Find the left-hand limit, the right-hand limit and the limit as $x \\to ' + a + '$ (type DNE if it does not exist).',
      a: { t: 'multi', parts: [{ label: '$\\displaystyle\\lim_{x \\to ' + a + '^-} f(x)$', a: numA(L1) }, { label: '$\\displaystyle\\lim_{x \\to ' + a + '^+} f(x)$', a: numA(L2) }, { label: '$\\displaystyle\\lim_{x \\to ' + a + '} f(x)$', a: numA(L1 === L2 ? L1 : 'DNE') }] },
      viz: { name: 'limit', opts: { quiet: true, left: polyPlain([m1, b1], 'x'), right: polyPlain([m2, b2], 'x'), a: a, fa: fa === 'none' ? 'none' : fa, table: false, h: 1 } },
      steps: ['From the left, the values follow $' + T.lin(m1, 'x', b1) + '$ and approach $' + L1 + '$.', 'From the right, they follow $' + T.lin(m2, 'x', b2) + '$ and approach $' + L2 + '$.', L1 === L2 ? 'Both sides agree, so the limit is $' + L1 + '$' + (fa !== L1 ? ', whatever $f(' + a + ')$ is.' : '.') : 'The sides disagree, so the two-sided limit does not exist.'],
      hint: 'Slide toward $x = ' + a + '$ from each side separately.'
    };
  });

})(window.MathLadder);
