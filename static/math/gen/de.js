/* Math Ladder: problem generators for Differential Equations (course key "de").
   One generator per topic in data/math/topics/de.json, registered with MathLadder.gen (spec section 3).
   The file is long but flat: shared helpers first, then the generators unit by unit, in the order of the topics file.
   Conventions: the independent variable is t (x for exact, homogeneous, series, Cauchy–Euler and boundary problems);
   answers are exact CAS strings; initial value problems fix every constant, so each answer is unique.
   ML.__deTest (set only by the course's test harness) receives the data of each problem so that a separate test can
   substitute the answer back into the equation. It is never set on the site. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util;
  // Cosmetic clean-up of generated TeX, so that a random 0 or 1 never shows as e^{0t}, x^{1}, \frac{a}{1}, (1)I or 1\ln 2.
  function tidyTex(s) {
    if (typeof s !== 'string') return s;
    s = s.replace(/e\^\{0([a-z])\}(?=\s*[\\a-zA-Z(])/g, '')
      .replace(/([\w}])e\^\{0[a-z]\}/g, '$1').replace(/e\^\{0[a-z]\}/g, '1')
      .replace(/([^_}\d])\^\{1\}/g, '$1')
      .replace(/\(1\)I\b/g, 'I')
      .replace(/\\frac\{1\}\{1\}(?=[\\a-zA-Z(])/g, '')
      .replace(/(.)\\frac\{(-?[^{}+]+?)\}\{1\}/g, function (m, pre, n) { return pre + (/[a-zA-Z]/.test(pre) ? ' ' : '') + n; })
      .replace(/\\cdot 1(?=\\(sin|cos|sinh|cosh)\b)/g, '')
      .replace(/(^|[\s=(+{$-])1(?=\\(ln|sin|cos|sinh|cosh|sqrt)\b)/g, '$1')
      .replace(/(^|[\s=(+{$])(-?)1\\cdot\s?(?=\\frac|\\left)/g, '$1$2')
      .replace(/= ([^=$,;]+?) = \1(?=\s*[$,.;])/g, '= $1');
    return s;
  }
  // Inline math does not wrap, so a long inline formula would run off a phone screen. Split it at top-level relations
  // (and, if still long, before top-level + and -) into neighboring $…$ pieces, which the browser can wrap between.
  var NOW = { left: 1, right: 1, ',': 1, ';': 1, '!': 1, mathbf: 1, mathcal: 1, mathrm: 1, operatorname: 1, text: 1, displaystyle: 1, limits: 1, big: 1, Big: 1 };
  var FN = { sin: 1, cos: 1, tan: 1, sec: 1, csc: 1, cot: 1, ln: 1, log: 1, exp: 1, sinh: 1, cosh: 1, tanh: 1, det: 1 };
  function grp(t, i) { // the group starting at i: [content, next index]
    while (t[i] === ' ') i++;
    if (t[i] === '{') { var d = 0, j = i; for (; j < t.length; j++) { if (t[j] === '\\') { j++; continue; } if (t[j] === '{') d++; else if (t[j] === '}' && --d === 0) break; } return [t.slice(i + 1, j), j + 1]; }
    if (t[i] === '\\') { var m = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)); return [m[0], i + m[0].length]; }
    return [t[i] || '', i + 1];
  }
  function texW(t) { // rough rendered width of TeX, in character widths
    var w = 0, i = 0, n = t.length, g, m;
    while (i < n) {
      var c = t[i];
      if (c === '\\') {
        m = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)); var nm = m[1]; i += m[0].length;
        if (nm === '\\') { w += 1; continue; }
        if (NOW[nm]) continue;
        if (nm === 'frac' || nm === 'dfrac' || nm === 'tfrac') { var A = grp(t, i), Bg = grp(t, A[1]); w += Math.max(texW(A[0]), texW(Bg[0])) + 0.4; i = Bg[1]; continue; }
        if (nm === 'begin') { g = grp(t, i); var end = t.indexOf('\\end{' + g[0] + '}', g[1]); if (end < 0) end = n; var rows = t.slice(g[1], end).split('\\\\'), cols = [];
          rows.forEach(function (r) { r.split('&').forEach(function (cell, k) { cols[k] = Math.max(cols[k] || 0, texW(cell)); }); });
          w += cols.reduce(function (a, b) { return a + b + 1; }, 1); i = end + 6 + g[0].length; continue; }
        if (nm === 'end') { i = grp(t, i)[1]; continue; }
        w += FN[nm] ? nm.length * 0.8 : nm === 'sum' || nm === 'int' ? 1.5 : 1; continue;
      }
      if (c === '^' || c === '_') { g = grp(t, i + 1); w += 0.6 * texW(g[0]); i = g[1]; continue; }
      if (c === '{' || c === '}' || c === ' ') { i++; continue; }
      w += '+-=<>'.indexOf(c) >= 0 ? 1.8 : c === ',' ? 0.6 : 1; i++;
    }
    return w;
  }
  function splitTex(t, lim) { // split points at depth 0: relations first, then binary + and -
    if (texW(t) <= lim) return [t];
    function cuts(re) { var out = [], d = 0, i = 0; for (; i < t.length; i++) { var c = t[i];
        if (c === '\\') { var mm = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)); if (mm[1] === 'left' || mm[1] === 'begin') d++; else if (mm[1] === 'right' || mm[1] === 'end') d--; i += mm[0].length - 1; if (d === 0 && re.test(t.slice(i - mm[0].length + 1))) { /* handled below */ } continue; }
        if (c === '{' || c === '(' || c === '[') d++; else if (c === '}' || c === ')' || c === ']') d--;
        else if (d === 0 && c === ' ' && re.test(t.slice(i + 1))) out.push(i); }
      return out; }
    function chunk(parts) { var res = [], cur = ''; parts.forEach(function (pc) { if (cur && texW(cur + pc) > lim) { res.push(cur); cur = pc.replace(/^ /, ''); } else cur += pc; }); if (cur) res.push(cur); return res; }
    function at(ix) { var parts = [], last = 0; ix.forEach(function (k) { parts.push(t.slice(last, k)); last = k; }); parts.push(t.slice(last)); return parts; }
    var rel = cuts(/^(=|\\approx|<|>|\\le\b|\\ge\b|\\ne\b|\\to\b) /), pieces = rel.length ? chunk(at(rel)) : [t], out = [];
    pieces.forEach(function (pc) {
      if (texW(pc) <= lim) { out.push(pc); return; }
      var sub = splitTex.inner(pc, lim); out.push.apply(out, sub);
    });
    return out;
  }
  splitTex.inner = function (t, lim, loose) { // before top-level " + " / " - " (binary: preceded by a space)
    var ix = [], d = 0;
    for (var i = 0; i < t.length; i++) { var c = t[i];
      if (c === '\\') { var mm = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)); if (mm[1] === 'left' || mm[1] === 'begin') d++; else if (mm[1] === 'right' || mm[1] === 'end') d--; i += mm[0].length - 1; continue; }
      if (c === '{' || (!loose && (c === '(' || c === '['))) d++; else if (c === '}' || (!loose && (c === ')' || c === ']'))) d--;
      else if (d === 0 && c === ' ' && /^[+-] /.test(t.slice(i + 1)) && i > 0) ix.push(i); }
    if (!ix.length) return loose ? [t] : splitTex.inner(t, lim, true); // plain ( ) are only glyphs, so a break inside them is safe
    var parts = [], last = 0; ix.forEach(function (k) { parts.push(t.slice(last, k)); last = k; }); parts.push(t.slice(last));
    var res = [], cur = ''; parts.forEach(function (pc) { if (cur && texW(cur + pc) > lim) { res.push(cur); cur = pc.replace(/^ /, ''); } else cur += pc; }); if (cur) res.push(cur);
    return res;
  };
  function wrapMath(s, lim) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    return s.replace(/\$\$[\s\S]*?\$\$|\\\$|\$([^$]+)\$/g, function (m, tex) {
      if (tex === undefined || texW(tex) <= lim) return m;
      return splitTex(tex, lim).map(function (pc) { return '$' + pc.trim() + '$'; }).join(' ');
    });
  }
  ML.__deWrap = { texW: texW, splitTex: splitTex, wrapMath: wrapMath };
  function tidy(p) {
    if (!p || typeof p !== 'object') return p;
    ['q', 'hint'].forEach(function (k) { if (typeof p[k] === 'string') p[k] = wrapMath(tidyTex(p[k]), 21); });
    if (Array.isArray(p.steps)) p.steps = p.steps.map(function (st) { return wrapMath(tidyTex(st), 19); });
    var tw = function (c) { return wrapMath(tidyTex(c), 21); };
    if (p.a && Array.isArray(p.a.choices)) p.a.choices = p.a.choices.map(tw);
    if (Array.isArray(p.choices)) p.choices = p.choices.map(tw);
    return p;
  }
  function G(id, fn) { ML.gen(id, function (R, ctx) { return tidy(fn(R, ctx)); }); }
  function chk(o) { if (ML.__deTest) ML.__deTest(o); }
  function q(n, d) { return d === undefined ? Q.from(n) : Q(n, d); }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function pickKind(R, ctx, a, b, c) { return R.pick(ML.byLevel(ctx, a, b, c)); }

  // ---------- bases: { tex, pl } pieces of an answer (pl is CAS plain syntax) ----------
  var ONE = { tex: '', pl: '' };
  function kv(k, v) { // k·v as text that works in TeX and plain: "2t", "-t", "t/2", "-3t/2"
    k = q(k); v = v || 't';
    if (k.isInt()) { var n = k.num(); return n === 1 ? v : n === -1 ? '-' + v : n + v; }
    var a = k.abs(); return (k.sign() < 0 ? '-' : '') + (a.n === 1n ? '' : a.n.toString()) + v + '/' + a.d.toString();
  }
  function kvTex(k, v) { // the same, but "\frac{t}{2}" style is avoided in exponents; keep t/2
    return kv(k, v);
  }
  var B = {
    one: ONE,
    e: function (k, v) { k = q(k); if (k.isZero()) return ONE; var s = kv(k, v); return { tex: 'e^{' + s + '}', pl: 'e^(' + s + ')' }; },
    cos: function (w, v) { w = q(w); var s = kv(w, v); return { tex: w.isInt() ? '\\cos ' + s : '\\cos(' + s + ')', pl: 'cos(' + s + ')' }; },
    sin: function (w, v) { w = q(w); var s = kv(w, v); return { tex: w.isInt() ? '\\sin ' + s : '\\sin(' + s + ')', pl: 'sin(' + s + ')' }; },
    cosh: function (w, v) { w = q(w); var s = kv(w, v); return { tex: '\\cosh ' + s, pl: 'cosh(' + s + ')' }; },
    sinh: function (w, v) { w = q(w); var s = kv(w, v); return { tex: '\\sinh ' + s, pl: 'sinh(' + s + ')' }; },
    pow: function (n, v) { v = v || 't'; if (n === 0) return ONE; if (n === 1) return { tex: v, pl: v }; return { tex: v + '^{' + n + '}', pl: v + '^' + (n < 0 ? '(' + n + ')' : n) }; },
    raw: function (tex, pl) { return { tex: tex, pl: pl }; },
    mul: function () {
      var tex = [], pl = [];
      for (var i = 0; i < arguments.length; i++) { var b = arguments[i]; if (b && b.tex) { tex.push(b.tex); pl.push(b.pl); } }
      return tex.length ? { tex: tex.join(' '), pl: pl.join(' ') } : ONE;
    }
  };
  function tm(c, b) { return { c: q(c), b: b || ONE }; }
  // a linear combination of terms -> { tex, pl, zero }
  function lc(terms) {
    var list = terms.filter(function (t) { return !t.c.isZero(); });
    if (!list.length) return { tex: '0', pl: '0', zero: true };
    var dz = function (c) { return !c.isInt() && c.isTerminating() && c.d > 8n; }; // 9/1000 -> 0.009
    var cstr = function (c) { return dz(c) ? c.toDec(12).replace(/0+$/, '') : c; };
    var tex = T.terms(list.map(function (t) { return [cstr(t.c), t.b.tex]; }));
    var pl = '';
    list.forEach(function (t, i) {
      var c = t.c, neg = c.sign() < 0, a = c.abs(), body, as = dz(a) ? a.toDec(12).replace(/0+$/, '') : a.toPlain();
      if (!t.b.pl) body = as;
      else if (a.eq(1)) body = t.b.pl;
      else body = as + (/^[\d.]/.test(t.b.pl) ? '*' : a.isInt() || dz(a) ? '' : ' ') + t.b.pl;
      pl += i === 0 ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body;
    });
    return { tex: tex, pl: pl };
  }
  // b·(sum of terms) printed as a product when that is tidier: e^{-2t}(3cos 4t + sin 4t); one term: 3e^{-2t}sin 4t
  function prodLc(b, terms) {
    var list = terms.filter(function (t) { return !q(t.c).isZero(); });
    if (!b.tex || list.length === 0) return lc(terms);
    if (list.length === 1) return lc([tm(list[0].c, B.mul(b, list[0].b))]);
    var comb = lc(list);
    return { tex: b.tex + '\\left(' + comb.tex + '\\right)', pl: b.pl + '(' + comb.pl + ')' };
  }
  function joinSum(a, b) { // { tex, pl } + { tex, pl } without extra parentheses
    if (a.zero || a.pl === '0') return b; if (b.zero || b.pl === '0') return a;
    var neg = function (z) { return z[0] === '-'; };
    return { tex: a.tex + (neg(b.tex) ? ' - ' + b.tex.slice(1) : ' + ' + b.tex), pl: a.pl + (neg(b.pl) ? ' - ' + b.pl.slice(1) : ' + ' + b.pl) };
  }
  // tidy a plain answer for display: '1x' -> 'x', '-1*cos' -> '-cos' (only a lone 1 not part of a number)
  function cpl(s) { return String(s).replace(/(^|[^\d.\w])1\*?(?=[a-zA-Z(])/g, '$1').replace(/(^|[^\d.\w])1\*?(?=[a-zA-Z(])/g, '$1'); }
  function ex(pl, vars) { return { t: 'expr', v: cpl(pl), vars: vars || ['t'] }; }
  function num(v, o) { var a = { t: 'num', v: String(v) }; if (o) for (var k in o) a[k] = o[k]; return a; }
  function fr(x) { return q(x).toTex(); }            // exact rational as TeX
  function frd(x) { return T.dfrac(q(x).n.toString(), q(x).d.toString()); }
  function pl(x) { return q(x).toPlain(); }
  function pp(x) { return T.p(q(x)); }                  // "(−3)" for substitution steps
  function sg(x) { return T.signed(q(x)); }             // " + 3", " - \frac{1}{2}"
  function D(k, y) { y = y || 'y'; return k === 0 ? y : k === 1 ? y + "'" : k === 2 ? y + "''" : k === 3 ? y + "'''" : y + '^{(' + k + ')}'; }
  // a·y'' + b·y' + c·y (coefficients high to low; numbers or TeX strings)
  function odeLhs(cs, y) { var n = cs.length - 1; return T.terms(cs.map(function (c, i) { return [c, D(n - i, y)]; })); }
  function mc(R, correct, wrongs) { // de-duplicated mc spec, correct first (makeProblem shuffles)
    var out = [correct]; wrongs.forEach(function (w) { if (out.indexOf(w) < 0) out.push(w); });
    return { t: 'mc', choices: out, v: 0 };
  }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function roots2(b, c) { // integer roots of r^2 + b r + c, or null
    var d = b * b - 4 * c; if (d < 0) return null; var s = Math.round(Math.sqrt(d)); if (s * s !== d) return null;
    if ((-b + s) % 2 !== 0) return null; return [(-b - s) / 2, (-b + s) / 2];
  }
  function charTex(cs, r) { r = r || 'r'; var n = cs.length - 1; return T.terms(cs.map(function (c, i) { var k = n - i; return [c, k === 0 ? '' : k === 1 ? r : r + '^{' + k + '}']; })); }
  // solve a 2x2 linear system exactly: [[a,b],[c,d]] [x,y] = [e,f]
  function solve2(a, b, c, d, e, f) { a = q(a); b = q(b); c = q(c); d = q(d); e = q(e); f = q(f); var det = a.mul(d).sub(b.mul(c)); return [e.mul(d).sub(b.mul(f)).div(det), a.mul(f).sub(e.mul(c)).div(det)]; }
  function pmTex(x) { return T.signed(x).replace(/^ \+ /, '+').replace(/^ - /, '-'); }
  function fracT(k, top, den, first) { // (k·top)/den with the sign in front: fracT(-3, 'y', 't') -> "-\frac{3y}{t}"
    k = q(k); if (k.isZero()) return first === false ? '' : '0'; var a = k.abs(), n = a.n.toString(), d = a.d.toString(), s = k.sign() < 0;
    var body = '\\frac{' + (n === '1' && top ? '' : n) + (top || '') + '}{' + (d === '1' ? '' : d) + den + '}';
    return first === false ? (s ? ' - ' : ' + ') + body : (s ? '-' : '') + body;
  }
  function ypw(e) { return e === 1 ? 'y' : 'y^{' + e + '}'; }
  function tpw(n, v) { v = v || 't'; return n === 0 ? '' : n === 1 ? v : v + '^{' + n + '}'; } // t^{n} as TeX ('' for n = 0)

// ---- u1.js
  // =====================================================================================================
  // UNIT 1: First-Order Equations
  // =====================================================================================================

  // ---------- de.classify-des ----------
  var CF = ['t', 't^{2}', 'e^{t}', '(\\sin t)', '(\\cos t)', '3', '2', '5', '(1 + t^{2})', '4t', '(\\ln t)'];
  var RHS = ['0', '\\sin t', 'e^{-t}', 't^{3}', '1', '\\cos 2t', '\\ln t', 't'];
  var NONLIN = [ // [TeX, why, min order]
    ['y^{2}', '$y$ is squared', 1], ['y^{3}', '$y$ is cubed', 1], ['\\sin y', 'the unknown $y$ sits inside a sine', 1],
    ['e^{y}', '$y$ sits in an exponent', 1], ["y\\,y'", "$y$ multiplies its own derivative $y'$", 1], ["(y')^{2}", "the derivative $y'$ is squared", 1],
    ['\\sqrt{y}', '$y$ is under a square root', 1], ['\\frac{1}{y}', '$y$ is in a denominator', 1], ["y\\,y''", "$y$ multiplies $y''$", 2], ["(y'')^{3}", "$y''$ is cubed", 2]
  ];
  function linTerms(R, n) {
    var terms = [];
    for (var k = n; k >= 0; k--) {
      if (k < n && R.chance(0.45)) continue;
      var c = k === n ? R.pick(['', '', 't', 't^{2}', 'e^{t}', '2', '(1 + t^{2})']) : R.pick(CF);
      terms.push((c ? c + ' ' : '') + D(k));
    }
    if (terms.length < 2) terms.push(R.pick(CF) + ' y');
    return terms;
  }
  function joinTerms(R, terms) { return terms.map(function (s, i) { return i === 0 ? s : R.pick([' + ', ' + ', ' - ']) + s; }).join(''); }
  function makeLin(R, n) { return joinTerms(R, linTerms(R, n)) + ' = ' + R.pick(RHS); }
  function makeNonlin(R, n) {
    if (n === 1 && R.chance(0.3)) { var v = R.pick([["y' = y^{2}", 'y^{2}', '$y$ is squared'], ["y' = t + y^{2}", 'y^{2}', '$y$ is squared'], ["y' = 3y^{2} - t", '3y^{2}', '$y$ is squared'], ["y' = ty^{2}", 'ty^{2}', '$y$ is squared']]); return { tex: v[0], piece: v[1], why: v[2] }; }
    var pool = NONLIN.filter(function (p) { return p[2] <= n; }), pc = R.pick(pool), terms = linTerms(R, n);
    var at = R.int(1, terms.length); terms.splice(at, 0, pc[0]);
    return { tex: joinTerms(R, terms) + ' = ' + R.pick(RHS), piece: pc[0], why: pc[1] };
  }
  var LINDEF = 'A linear equation has the form $a_n(t)y^{(n)} + \\dots + a_1(t)y\' + a_0(t)y = g(t)$: $y$ and its derivatives appear only to the first power, each multiplied by a function of $t$ alone.';
  G('de.classify-des', function (R, ctx) {
    var kind = pickKind(R, ctx, ['order', 'lintf'], ['linmc', 'rset', 'ab', 'order'], ['rset', 'ab', 'soltf', 'linmc']);
    if (kind === 'order') {
      var n = R.int(1, 4), leib = R.chance(0.35), m = R.int(0, n - 1);
      var dn = function (k) { return leib ? (k === 0 ? 'y' : k === 1 ? '\\frac{dy}{dt}' : '\\frac{d^{' + k + '}y}{dt^{' + k + '}}') : D(k); };
      var top = dn(n), pTop = R.pick([1, 1, 2, 3]);
      if (pTop > 1) top = (leib ? '\\left(' + top + '\\right)' : '(' + top + ')') + '^{' + pTop + '}';
      var low = dn(m), pLow = R.int(n + 1, n + 4);
      low = m === 0 ? 'y^{' + pLow + '}' : (leib ? '\\left(' + low + '\\right)' : '(' + low + ')') + '^{' + pLow + '}';
      var coef = R.pick(['', 't', 't^{2}', 'e^{t}', '3']);
      var eq = R.coin() ? (coef ? coef + ' ' : '') + top + ' + ' + low + ' = ' + R.pick(RHS) : low + ' + ' + (coef ? coef + ' ' : '') + top + ' = ' + R.pick(RHS);
      return {
        q: 'What is the order of the differential equation $' + eq + '$?',
        a: num(n, { form: 'int' }),
        steps: ['The order is the highest derivative that appears. Powers do not count.',
          'The derivatives here are $' + dn(n) + '$' + (m > 0 ? ' and $' + dn(m) + '$' : '') + '; the highest is derivative number ' + n + '.',
          'The power ' + pLow + ' on $' + (m === 0 ? 'y' : dn(m)) + '$ makes the equation nonlinear, but it does not change the order.',
          'Order: $' + n + '$.'],
        hint: 'Look for the highest derivative, not the highest power.'
      };
    }
    if (kind === 'lintf') {
      var n2 = R.int(1, 3), isLin = R.coin(), e, steps;
      if (isLin) { e = makeLin(R, n2); steps = [LINDEF, 'Every term of $' + e + '$ is a function of $t$ times $y$ or one of its derivatives, or a function of $t$ alone.', 'Functions like $e^{t}$ or $\\sin t$ multiplying $y$ are fine: they involve only $t$. So the equation is linear: true.']; }
      else { var nl = makeNonlin(R, n2); e = nl.tex; steps = [LINDEF, 'Look at the term $' + nl.piece + '$: ' + nl.why + '.', 'That is not allowed in a linear equation, so the equation is nonlinear: false.']; }
      return { q: 'True or false: $' + e + '$ is a linear differential equation.', a: tf(isLin), steps: steps, hint: 'Check every place $y$ appears. Is it ever squared, multiplied by itself or a derivative, or inside a function?' };
    }
    if (kind === 'linmc') {
      var wantLin = R.coin(), n3 = R.int(1, 2), good, bad = [], tries = 0, pieces = [];
      if (wantLin) { good = makeLin(R, n3); while (bad.length < 3 && tries++ < 40) { var b = makeNonlin(R, R.int(1, 2)); if (bad.indexOf('$' + b.tex + '$') < 0 && '$' + b.tex + '$' !== '$' + good + '$') { bad.push('$' + b.tex + '$'); pieces.push(b); } } }
      else { var g0 = makeNonlin(R, n3); good = g0.tex; pieces.push(g0); while (bad.length < 3 && tries++ < 40) { var l = makeLin(R, R.int(1, 3)); if (bad.indexOf('$' + l + '$') < 0 && l !== good) bad.push('$' + l + '$'); } }
      var st = [LINDEF];
      if (wantLin) { st.push('In $' + good + '$, every term is a function of $t$ times $y$ or a derivative of $y$ (or a function of $t$ alone), so it is linear.'); pieces.forEach(function (p) { st.push('In $' + p.tex + '$, the term $' + p.piece + '$ is not allowed: ' + p.why + '.'); }); }
      else st.push('In $' + good + '$, the term $' + pieces[0].piece + '$ breaks linearity: ' + pieces[0].why + '.', 'In each of the others, $y$ and its derivatives appear only to the first power with coefficients that depend on $t$ alone.');
      return { q: 'Which of these differential equations is ' + (wantLin ? '<b>linear</b>' : '<b>nonlinear</b>') + '?', a: mc(R, '$' + good + '$', bad), steps: st, hint: 'A linear equation never squares $y$, never multiplies $y$ by a derivative of $y$, and never puts $y$ inside another function.' };
    }
    if (kind === 'rset') {
      var r1 = R.int(-5, 5), r2 = R.intNot(-5, 5, [r1]); if (r1 === 0 && r2 === 0) r2 = 2;
      var b2 = -(r1 + r2), c2 = r1 * r2;
      chk({ topic: 'de.classify-des', kind: 'expsol', b: b2, c: c2, roots: [r1, r2] });
      return {
        q: 'Find every value of $r$ for which $y = e^{rt}$ is a solution of $' + odeLhs([1, b2, c2]) + ' = 0$.',
        a: { t: 'set', v: [String(r1), String(r2)] },
        steps: ["If $y = e^{rt}$, then $y' = re^{rt}$ and $y'' = r^{2}e^{rt}$.",
          'Substitute: $' + T.terms([[1, 'r^{2}e^{rt}'], [b2, 're^{rt}'], [c2, 'e^{rt}']]) + ' = \\left(' + charTex([1, b2, c2]) + '\\right)e^{rt} = 0$.',
          'Since $e^{rt}$ is never 0, we need $' + charTex([1, b2, c2]) + ' = 0$, that is, $' + [Math.min(r1, r2), Math.max(r1, r2)].map(function (x) { return x === 0 ? 'r' : '(' + T.lin(1, 'r', -x) + ')'; }).join('') + ' = 0$.',
          'So $r = ' + Math.min(r1, r2) + '$ or $r = ' + Math.max(r1, r2) + '$.'],
        hint: "Substitute $y = e^{rt}$, $y' = re^{rt}$ and $y'' = r^2e^{rt}$, then factor out $e^{rt}$."
      };
    }
    if (kind === 'ab') {
      var a = R.nz(-4, 4), A = R.nz(-5, 5), Bc = R.nz(-5, 5), m2 = a * A, n4 = A + a * Bc;
      chk({ topic: 'de.classify-des', kind: 'ab', a: a, m: m2, n: n4, ans: [A, Bc] });
      return {
        q: 'Find the constants $A$ and $B$ so that $y = At + B$ is a solution of $y\'' + T.coef(a, 'y', false) + ' = ' + T.lin(m2, 't', n4) + '$. Enter $(A, B)$.',
        a: { t: 'tuple', v: [String(A), String(Bc)] },
        steps: ["If $y = At + B$, then $y' = A$.",
          'Substitute: $A' + (a === 1 ? ' + ' : a === -1 ? ' - ' : (a < 0 ? ' - ' : ' + ') + Math.abs(a)) + '(At + B) = ' + T.coef(a, 'At', true) + ' + (A' + T.coef(a, 'B', false) + ')$.',
          a === 1 ? 'Match the $t$ terms: $A = ' + m2 + '$.' : 'Match the $t$ terms: $' + T.coef(a, 'A', true) + ' = ' + m2 + '$, so $A = ' + A + '$.',
          a === 1 ? 'Match the constants: $A + B = ' + n4 + '$, so $B = ' + n4 + T.signed(-A) + ' = ' + Bc + '$.' : 'Match the constants: $A' + T.coef(a, 'B', false) + ' = ' + n4 + '$, so $' + T.coef(a, 'B') + ' = ' + (n4 - A) + '$ and $B = ' + Bc + '$.',
          'Check: $y = ' + T.lin(A, 't', Bc) + '$ gives $' + A + T.coef(a, '(' + T.lin(A, 't', Bc) + ')', false) + ' = ' + T.lin(m2, 't', n4) + '$. ✓'],
        hint: 'Substitute $y = At + B$ and match the coefficient of $t$ and the constant term on both sides.'
      };
    }
    // soltf: is a given function a solution?
    var fam = R.int(1, 4), truth = R.coin(), w = R.int(2, 5), c0 = R.pick([1, 2, 3, -2]), ode, cand, candPl, res, st2;
    if (fam === 1) {
      ode = "y'' + " + (w * w) + 'y = 0'; res = 'y2 + ' + (w * w) + '*y';
      if (truth) { var f1 = R.pick(['sin', 'cos']); cand = T.coef(c0, '\\' + f1 + ' ' + w + 't'); candPl = c0 + '*' + f1 + '(' + w + 't)';
        st2 = ["$y' = " + T.coef(f1 === 'sin' ? c0 * w : -c0 * w, (f1 === 'sin' ? '\\cos ' : '\\sin ') + w + 't') + "$ and $y'' = " + T.coef(-c0 * w * w, '\\' + f1 + ' ' + w + 't') + '$.', "Then $y'' + " + (w * w) + 'y = ' + T.coef(-c0 * w * w, '\\' + f1 + ' ' + w + 't') + T.coef(c0 * w * w, '\\' + f1 + ' ' + w + 't', false) + ' = 0$. ✓ True.']; }
      else { cand = '\\sin ' + (w * w) + 't'; candPl = 'sin(' + (w * w) + 't)';
        st2 = ["$y'' = -" + Math.pow(w, 4) + '\\sin ' + (w * w) + 't$.', "Then $y'' + " + (w * w) + 'y = (' + (w * w) + ' - ' + Math.pow(w, 4) + ')\\sin ' + (w * w) + 't = ' + (w * w - Math.pow(w, 4)) + '\\sin ' + (w * w) + 't$, which is not 0 for all $t$. False.', 'The solutions of $y\'\' + ' + (w * w) + 'y = 0$ are $\\sin ' + w + 't$ and $\\cos ' + w + 't$: the frequency is $\\sqrt{' + (w * w) + '} = ' + w + '$.']; }
    } else if (fam === 2) {
      var k = R.nz(-4, 4); ode = "y' = " + T.mono(k, 'y'); res = 'y1 - (' + k + ')*y';
      if (truth) { cand = T.coef(c0, 'e^{' + kv(k) + '}'); candPl = c0 + '*e^(' + kv(k) + ')'; st2 = ["$y' = " + T.coef(c0 * k, 'e^{' + kv(k) + '}') + '$, and $' + T.mono(k, 'y') + ' = ' + T.coef(c0 * k, 'e^{' + kv(k) + '}') + '$. They match. ✓ True.']; }
      else { cand = 'e^{' + kv(k) + '} + 1'; candPl = 'e^(' + kv(k) + ')+1'; st2 = ["$y' = " + T.coef(k, 'e^{' + kv(k) + '}') + '$, but $' + T.mono(k, 'y') + ' = ' + T.coef(k, 'e^{' + kv(k) + '}') + T.signed(k) + '$.', 'They differ by $' + k + '$, so the equation fails. False.']; }
    } else if (fam === 3) {
      var n5 = R.int(2, 4); ode = "ty' = " + n5 + 'y'; res = 't*y1 - ' + n5 + '*y';
      if (truth) { cand = 't^{' + n5 + '}'; candPl = 't^' + n5; st2 = ["$y' = " + n5 + 't^{' + (n5 - 1) + "}$, so $ty' = " + n5 + 't^{' + n5 + '}$.', 'And $' + n5 + 'y = ' + n5 + 't^{' + n5 + '}$. They match. ✓ True.']; }
      else { cand = 't^{' + (n5 + 1) + '}'; candPl = 't^' + (n5 + 1); st2 = ["$y' = " + (n5 + 1) + 't^{' + n5 + "}$, so $ty' = " + (n5 + 1) + 't^{' + (n5 + 1) + '}$.', 'But $' + n5 + 'y = ' + n5 + 't^{' + (n5 + 1) + '}$. They differ, so it is not a solution. False.']; }
    } else {
      var a3 = R.int(1, 3); ode = "y' = " + (2 * a3) + 'ty'; res = 'y1 - ' + (2 * a3) + '*t*y';
      if (truth) { cand = 'e^{' + T.coef(a3, 't^{2}') + '}'; candPl = 'e^(' + a3 + 't^2)'; st2 = ['By the chain rule, $y\' = ' + (2 * a3) + 'te^{' + T.coef(a3, 't^{2}') + '}$.', 'And $' + (2 * a3) + 'ty = ' + (2 * a3) + 'te^{' + T.coef(a3, 't^{2}') + '}$. They match. ✓ True.']; }
      else { cand = 'e^{' + (2 * a3) + 't}'; candPl = 'e^(' + (2 * a3) + 't)'; st2 = ["$y' = " + (2 * a3) + 'e^{' + (2 * a3) + 't}$, but $' + (2 * a3) + 'ty = ' + (2 * a3) + 'te^{' + (2 * a3) + 't}$.', 'These differ (except at $t = 1$), so it is not a solution. False.']; }
    }
    chk({ topic: 'de.classify-des', kind: 'soltf', res: res, ans: candPl, truth: truth });
    return { q: 'True or false: $y = ' + cand + '$ is a solution of $' + ode + '$.', a: tf(truth), steps: ['Differentiate the proposed solution and substitute it into the equation.'].concat(st2), hint: 'Compute the derivatives of the proposed $y$, substitute, and see whether both sides agree for every $t$.' };
  });

  // ---------- de.existence-uniqueness-de ----------
  G('de.existence-uniqueness-de', function (R, ctx) {
    var kind = pickKind(R, ctx, ['nltf'], ['interval', 'interval', 'nltf'], ['interval', 'other']);
    if (kind === 'interval') {
      var lead = R.pick(['lin', 'lin', 'sq', 't']), zeros = [], leadTex, d1, a;
      if (lead === 'lin') { d1 = R.nz(-4, 4); zeros = [d1]; leadTex = '(' + T.lin(1, 't', -d1) + ')'; }
      else if (lead === 'sq') { a = R.int(1, 4); zeros = [-a, a]; leadTex = '(t^{2} - ' + (a * a) + ')'; }
      else { zeros = [0]; leadTex = 't'; }
      var rk = R.pick(['ln', 'ln', 'inv', 'exp', 'cos', 'poly']), d2 = R.intNot(-4, 4, zeros), rhsTex, lower = -Infinity, bad = zeros.slice(), why;
      if (rk === 'ln') { rhsTex = '\\ln(' + T.lin(1, 't', -d2) + ')'; lower = d2; why = '$\\ln(' + T.lin(1, 't', -d2) + ')$ is defined only for $t > ' + d2 + '$'; }
      else if (rk === 'inv') { rhsTex = '\\frac{1}{' + T.lin(1, 't', -d2) + '}'; bad.push(d2); why = '$\\frac{1}{' + T.lin(1, 't', -d2) + '}$ is undefined at $t = ' + d2 + '$'; }
      else { rhsTex = rk === 'exp' ? 'e^{t}' : rk === 'cos' ? '\\cos t' : 't^{2}'; why = '$' + rhsTex + '$ is continuous everywhere'; }
      var cy = R.pick(['c', 'c', 'ty', 'ey']), c = R.nz(-5, 5), midTex = cy === 'c' ? T.coef(c, 'y', false) : cy === 'ty' ? T.coef(c, 'ty', false) : T.coef(c, 'e^{t}y', false);
      // choose t0
      var cands = []; for (var t = -6; t <= 6; t++) if (bad.indexOf(t) < 0 && t > lower) cands.push(t);
      var t0 = R.pick(cands), y0 = R.int(-5, 5);
      var lo = lower, hi = Infinity; bad.forEach(function (b) { if (b < t0 && b > lo) lo = b; if (b > t0 && b < hi) hi = b; });
      var iv = '(' + (lo === -Infinity ? '-inf' : lo) + ', ' + (hi === Infinity ? 'inf' : hi) + ')';
      chk({ topic: 'de.existence-uniqueness-de', kind: 'interval', t0: t0, bad: bad, lower: lower, ans: iv });
      var inner = leadTex.replace(/^\((.*)\)$/, '$1'), ac = Math.abs(c);
      var pTex = (c < 0 ? '-' : '') + '\\frac{' + (cy === 'c' ? ac : cy === 'ty' ? T.mono(ac, 't') : T.mono(ac, 'e^{t}')) + '}{' + inner + '}';
      return {
        q: 'Consider the initial value problem $' + leadTex + "y'" + midTex + ' = ' + rhsTex + '$, $y(' + t0 + ') = ' + y0 + '$. On what largest open interval does the theorem guarantee a unique solution?',
        a: { t: 'interval', v: iv },
        steps: ["Divide by $" + leadTex + "$ to reach standard form $y' + p(t)y = g(t)$ with $p(t) = " + pTex + '$ and $g(t) = ' + (rk === 'inv' ? '\\frac{1}{' + (lead === 't' ? 't' : leadTex) + '(' + T.lin(1, 't', -d2) + ')}' : '\\frac{' + rhsTex + '}{' + inner + '}') + '$.',
          'Both are continuous except where $' + leadTex.replace(/^\((.*)\)$/, '$1') + ' = 0$, that is, at $t = ' + zeros.join('$ and $t = ') + '$; also ' + why + '.',
          'For a linear equation the solution exists and is unique on the largest open interval that contains $t_0 = ' + t0 + '$ and on which $p$ and $g$ are continuous.',
          'Starting at $t = ' + t0 + '$ and moving left and right until we hit a problem point gives $' + T.interval(lo, hi, true, true) + '$.'],
        hint: 'Put the equation in standard form and list every $t$ where $p(t)$ or $g(t)$ breaks down. Which gap contains $t_0$?'
      };
    }
    if (kind === 'nltf' || R.coin()) {
      var fam = R.int(1, 4), a2 = R.int(-3, 3), atA = R.chance(0.5), t02 = R.int(-2, 2), y02 = atA ? a2 : a2 + R.int(1, 3), fTex, dfTex, ok, why2;
      var ya = T.lin(1, 'y', -a2);
      if (fam === 1) { fTex = '\\sqrt[3]{' + ya + '}'; dfTex = '\\frac{1}{3(' + ya + ')^{2/3}}'; ok = !atA; why2 = atA ? '$\\partial f/\\partial y$ is undefined at $y = ' + a2 + '$' : 'both are continuous near $y = ' + y02 + '$'; }
      else if (fam === 2) { fTex = 't\\sqrt{' + ya + '}'; dfTex = '\\frac{t}{2\\sqrt{' + ya + '}}'; ok = !atA; why2 = atA ? '$\\partial f/\\partial y$ is undefined at $y = ' + a2 + '$ (and $f$ is not even defined below it)' : 'both are continuous near $y = ' + y02 + '$, where $' + ya + ' > 0$'; }
      else if (fam === 3) { fTex = '\\frac{t}{' + ya + '}'; dfTex = '-\\frac{t}{(' + ya + ')^{2}}'; ok = !atA; why2 = atA ? '$f$ itself is undefined at $y = ' + a2 + '$' : 'both are continuous near $y = ' + y02 + '$'; }
      else { fTex = R.pick(['t^{2} + y^{2}', 'y^{2}\\sin t', 'e^{t}y^{3}']); dfTex = fTex === 't^{2} + y^{2}' ? '2y' : fTex === 'y^{2}\\sin t' ? '2y\\sin t' : '3e^{t}y^{2}'; ok = true; why2 = 'both are continuous everywhere'; y02 = R.int(-3, 3); }
      chk({ topic: 'de.existence-uniqueness-de', kind: 'nltf', fam: fam, a: a2, y0: y02, truth: ok });
      return {
        q: "True or false: the existence and uniqueness theorem guarantees exactly one solution of $y' = " + fTex + '$ with $y(' + t02 + ') = ' + y02 + '$ on some interval around $t = ' + t02 + '$.',
        a: tf(ok),
        steps: ["The theorem needs $f(t, y)$ and $\\partial f/\\partial y$ to be continuous in a rectangle around $(t_0, y_0) = (" + t02 + ', ' + y02 + ')$.',
          'Here $f = ' + fTex + '$ and $\\dfrac{\\partial f}{\\partial y} = ' + dfTex + '$.',
          'At the starting point, ' + why2 + '.',
          ok ? 'So the theorem applies: exactly one solution. True.' : 'So the theorem gives no guarantee. False.' + (fam === 3 ? ' (The slope $f$ is not even defined on the line $y = ' + a2 + '$.)' : ' (Here uniqueness really fails: $y = ' + a2 + '$ is one solution, and another solution leaves that line.)')],
        hint: 'Compute $\\partial f/\\partial y$ and check whether $f$ and $\\partial f/\\partial y$ are continuous at the starting point.'
      };
    }
    // a second solution through y(0) = 0
    var m = R.pick([2, 3]), j = R.pick([1, 2]), k = m * j, C = Math.pow(j, m);
    var fT = m === 2 ? T.coef(k, '\\sqrt{y}') : T.coef(k, 'y^{2/3}');
    var ans = (C === 1 ? '' : C) + 't^' + m;
    chk({ topic: 'de.existence-uniqueness-de', kind: 'second', res: m === 2 ? 'y1 - ' + k + '*sqrt(y)' : 'y1 - ' + k + '*y^(2/3)', ans: ans, ic: [0, 0] });
    return {
      q: "The equation $y' = " + fT + '$ with $y(0) = 0$ has the solution $y = 0$. Find another solution of the form $y = Ct^{n}$ (with $C \\ne 0$), valid for $t \\ge 0$.',
      a: ex(ans),
      steps: ["Try $y = Ct^{n}$: then $y' = nCt^{n-1}$ and $" + fT + ' = ' + (m === 2 ? k + '\\sqrt{C}\\,t^{n/2}' : k + 'C^{2/3}t^{2n/3}') + '$ (for $t \\ge 0$).',
        'Match the powers of $t$: $n - 1 = ' + (m === 2 ? 'n/2' : '2n/3') + '$, so $n = ' + m + '$.',
        'Match the coefficients: $' + m + 'C = ' + (m === 2 ? k + '\\sqrt{C}' : k + 'C^{2/3}') + '$, so $' + (m === 2 ? '\\sqrt{C}' : 'C^{1/3}') + ' = ' + j + '$ and $C = ' + C + '$.',
        'So $y = ' + (C === 1 ? '' : C) + 't^{' + m + '}$ also solves the problem: two different solutions start at $(0, 0)$. The theorem does not apply there because $\\partial f/\\partial y$ blows up at $y = 0$.'],
      hint: 'Substitute $y = Ct^n$ and make the powers of $t$ match first.'
    };
  });

  // ---------- de.linear-first-order ----------
  G('de.linear-first-order', function (R, ctx) {
    var kind = pickKind(R, ctx, ['mu'], ['ivp', 'ivp', 'mu'], ['ivp', 'ivpt']);
    if (kind === 'mu') {
      var fam = R.int(1, 5), gT = R.pick(['t', 'e^{t}', '\\sin t', '1', 't^{2}']), eqT, stdT, pT, intT, muPl, muT, dom = '';
      if (fam === 1) { var a = R.nz(-5, 5), L = R.pick([1, 1, 2, 3]); eqT = (L === 1 ? '' : L) + "y'" + T.coef(L * a, 'y', false) + ' = ' + (L === 1 ? gT : L + (gT === '1' ? '' : gT)); stdT = "y'" + T.coef(a, 'y', false) + ' = ' + gT; pT = String(a); intT = T.mono(a, 't'); muPl = 'e^(' + kv(a) + ')'; muT = 'e^{' + kv(a) + '}'; }
      else if (fam === 2) { var k = R.nz(-3, 4); eqT = "ty'" + T.coef(k, 'y', false) + ' = ' + gT; stdT = "y'" + fracT(k, 'y', 't', false) + ' = \\frac{' + gT + '}{t}'; pT = fracT(k, '', 't'); intT = T.coef(k, '\\ln t'); muPl = k === 1 ? 't' : 't^' + (k < 0 ? '(' + k + ')' : k); muT = k === 1 ? 't' : 't^{' + k + '}'; dom = ', $t > 0$'; }
      else if (fam === 3) { var a3 = R.nz(-3, 3); eqT = "y'" + T.coef(2 * a3, 'ty', false) + ' = ' + gT; stdT = eqT; pT = T.mono(2 * a3, 't'); intT = T.coef(a3, 't^{2}'); muPl = 'e^(' + a3 + 't^2)'; muT = 'e^{' + T.coef(a3, 't^{2}') + '}'; }
      else if (fam === 4) { var k4 = R.int(2, 4); eqT = "(t + 1)y' + " + k4 + 'y = ' + gT; stdT = "y' + \\frac{" + k4 + '}{t + 1}y = \\frac{' + gT + '}{t + 1}'; pT = '\\frac{' + k4 + '}{t + 1}'; intT = k4 + '\\ln(t + 1)'; muPl = '(t+1)^' + k4; muT = '(t + 1)^{' + k4 + '}'; dom = ', $t > -1$'; }
      else { eqT = "y' + (\\tan t)y = " + gT; stdT = eqT; pT = '\\tan t'; intT = '-\\ln(\\cos t)'; muPl = 'sec(t)'; muT = '\\sec t'; dom = ', $-\\frac{\\pi}{2} < t < \\frac{\\pi}{2}$'; }
      chk({ topic: 'de.linear-first-order', kind: 'mu', fam: fam, ans: muPl });
      return {
        q: 'Find the integrating factor $\\mu(t) = e^{\\int p(t)\\,dt}$ for $' + eqT + '$' + dom + '. (Take the constant of integration to be 0.)',
        a: ex(muPl),
        steps: [stdT === eqT ? "The equation is already in standard form $y' + p(t)y = g(t)$." : 'First reach standard form $y\' + p(t)y = g(t)$: $' + stdT + '$.',
          'So $p(t) = ' + pT + '$ and $\\int p(t)\\,dt = ' + intT + '$.',
          '$\\mu(t) = e^{' + intT + '}' + ('e^{' + intT + '}' === muT ? '' : ' = ' + muT) + '$.'],
        hint: fam === 2 || fam === 4 || (fam === 1 && /^\d/.test(eqT)) ? 'Divide by the coefficient of $y\'$ first: $p(t)$ is read off the standard form.' : 'Read off $p(t)$, the coefficient of $y$ in the standard form, and integrate it.'
      };
    }
    if (kind === 'ivp') {
      var a5 = R.nz(-4, 4), g = R.pick(['const', 'exp', 'lin']), lead = lv(ctx) >= 3 ? R.pick([2, 3]) : 1, y0 = R.int(-5, 6), yp, gT2, intT2, stp;
      if (g === 'const') { var Ac = R.nz(-4, 4); var b = a5 * Ac; yp = lc([tm(Ac)]); gT2 = String(b); intT2 = '\\int ' + b + 'e^{' + kv(a5) + '}\\,dt = ' + T.coef(Ac, 'e^{' + kv(a5) + '}') + ' + C'; stp = function (C) { return lc([tm(Ac), tm(C, B.e(-a5))]); }; }
      else if (g === 'exp') { var c = R.intNot(-3, 3, [0, -a5]), A2 = R.nz(-3, 3), b2 = A2 * (a5 + c); yp = lc([tm(A2, B.e(c))]); gT2 = T.coef(b2, 'e^{' + kv(c) + '}'); intT2 = '\\int ' + T.coef(b2, 'e^{' + kv(a5 + c) + '}') + '\\,dt = ' + T.coef(A2, 'e^{' + kv(a5 + c) + '}') + ' + C'; stp = function (C) { return lc([tm(A2, B.e(c)), tm(C, B.e(-a5))]); }; }
      else { var A3 = R.nz(-3, 3), B3 = R.int(-4, 4), m = a5 * A3, n = A3 + a5 * B3; yp = lc([tm(A3, B.pow(1)), tm(B3)]); gT2 = T.lin(m, 't', n); intT2 = '\\int e^{' + kv(a5) + '}(' + T.lin(m, 't', n) + ')\\,dt = e^{' + kv(a5) + '}(' + T.lin(A3, 't', B3) + ') + C \\text{ (by parts)}'; stp = function (C) { return lc([tm(A3, B.pow(1)), tm(B3), tm(C, B.e(-a5))]); }; }
      var yp0 = g === 'const' ? q(Ac) : g === 'exp' ? q(A2) : q(B3), C0 = q(y0).sub(yp0), sol = stp(C0);
      var gPl = g === 'const' ? String(b) : g === 'exp' ? b2 + '*e^(' + kv(c) + ')' : m + '*t + ' + n;
      chk({ topic: 'de.linear-first-order', kind: 'ivp', ode: [lead, lead * a5], g: lead + '*(' + gPl + ')', ic: [0, y0], ans: sol.pl });
      var eqT2 = (lead === 1 ? '' : lead) + "y'" + T.coef(lead * a5, 'y', false) + ' = ' + (lead === 1 ? gT2 : lead + '(' + gT2 + ')');
      var st = [];
      if (lead !== 1) st.push('Divide by ' + lead + " to get standard form: $y'" + T.coef(a5, 'y', false) + ' = ' + gT2 + '$.');
      st.push('$p(t) = ' + a5 + '$, so $\\mu = e^{' + kv(a5) + '}$.',
        "Multiply both sides by $\\mu$. The left side becomes a product's derivative: $\\left(e^{" + kv(a5) + '}y\\right)\' = ' + (g === 'const' ? T.coef(b, 'e^{' + kv(a5) + '}') : g === 'exp' ? T.coef(b2, 'e^{' + kv(a5 + c) + '}') : 'e^{' + kv(a5) + '}(' + gT2 + ')') + '$.',
        'Integrate: $e^{' + kv(a5) + '}y = ' + intT2.replace(/^\\int [^=]*= /, '') + '$.',
        'Divide by $e^{' + kv(a5) + '}$: $y = ' + yp.tex + ' + Ce^{' + kv(-a5) + '}$.',
        'Use $y(0) = ' + y0 + '$: $' + yp0.toTex() + ' + C = ' + y0 + '$, so $C = ' + C0.toTex() + '$.',
        '$y = ' + sol.tex + '$.');
      return { q: 'Solve the initial value problem $' + eqT2 + '$, $y(0) = ' + y0 + '$.', a: ex(sol.pl), steps: st, hint: 'Find $\\mu = e^{\\int p\\,dt}$, multiply through, and recognize $(\\mu y)\'$ on the left.' };
    }
    // ivpt: t y' + k y = c t^(m+1), y(1) = y0
    var k6 = R.pick([1, 2, 3, -2]), m6 = R.pick([0, 1, 2]), den = m6 + k6 + 1; if (den === 0) { m6 = 2; den = m6 + k6 + 1; }
    var jj = R.nz(-3, 3), cc = jj * den, y06 = R.int(-4, 5), Cc = q(y06).sub(jj), sol6 = lc([tm(jj, B.pow(m6 + 1)), tm(Cc, B.pow(-k6))]);
    chk({ topic: 'de.linear-first-order', kind: 'ivp', ode: ['t', k6], g: cc + '*t^' + (m6 + 1), ic: [1, y06], ans: sol6.pl, dom: [0.2, 3] });
    return {
      q: "Solve $ty'" + T.coef(k6, 'y', false) + ' = ' + T.coef(cc, m6 + 1 === 1 ? 't' : 't^{' + (m6 + 1) + '}') + '$, $y(1) = ' + y06 + '$, for $t > 0$.',
      a: ex(sol6.pl),
      steps: ["Divide by $t$: $y'" + fracT(k6, 'y', 't', false) + ' = ' + T.coef(cc, tpw(m6)) + '$.',
        '$p(t) = ' + fracT(k6, '', 't') + '$, so $\\mu = e^{' + T.coef(k6, '\\ln t') + '} = ' + tpw(k6) + '$.',
        "Multiply: $(" + tpw(k6) + "y)' = " + T.coef(cc, tpw(m6 + k6)) + '$.',
        'Integrate: $' + tpw(k6) + 'y = ' + T.coef(jj, tpw(den)) + ' + C$.',
        'Divide by $' + tpw(k6) + '$: $y = ' + T.coef(jj, tpw(m6 + 1)) + ' + C' + tpw(-k6) + '$.',
        'Use $y(1) = ' + y06 + '$: $' + jj + ' + C = ' + y06 + '$, so $C = ' + Cc.toTex() + '$.',
        '$y = ' + sol6.tex + '$.'],
      hint: "Divide by $t$ first; then $\\mu = e^{\\int p\\,dt}$ is a power of $t$."
    };
  });

  // ---------- de.exact-equations ----------
  // a term c·X(x)·Y(y); X, Y: { k: 'pow', p } | { k: 'exp' } | { k: 'sin' } | { k: 'cos' } (x only)
  function xyTerm(c, X, Y) { return { c: q(c), X: X, Y: Y }; }
  function fPart(F, v) { // TeX and plain of one factor
    if (F.k === 'pow') return F.p === 0 ? { tex: '', pl: '' } : { tex: F.p === 1 ? v : v + '^{' + F.p + '}', pl: F.p === 1 ? v : v + '^' + F.p };
    if (F.k === 'exp') return { tex: 'e^{' + v + '}', pl: 'e^(' + v + ')' };
    if (F.k === 'sin') return { tex: '\\sin ' + v, pl: 'sin(' + v + ')' };
    return { tex: '\\cos ' + v, pl: 'cos(' + v + ')' };
  }
  function xyBasis(t) { // order: powers, then e^x, e^y, sin, cos
    var xp = fPart(t.X, 'x'), yp = fPart(t.Y, 'y'), first = [], last = [];
    (t.X.k === 'pow' ? first : last).push(xp); (t.Y.k === 'pow' ? first : last).push(yp);
    var all = first.concat(last).filter(function (z) { return z.tex; });
    return { tex: all.map(function (z) { return z.tex; }).join(''), pl: all.map(function (z) { return z.pl; }).join(' ') };
  }
  function fDer(F) { // derivative of one factor: [coef, factor] or null if 0
    if (F.k === 'pow') return F.p === 0 ? null : [F.p, { k: 'pow', p: F.p - 1 }];
    if (F.k === 'exp') return [1, F];
    if (F.k === 'sin') return [1, { k: 'cos' }];
    return [-1, { k: 'sin' }];
  }
  function dx(terms) { var out = []; terms.forEach(function (t) { var d = fDer(t.X); if (d) out.push(xyTerm(t.c.mul(d[0]), d[1], t.Y)); }); return combine(out); }
  function dy(terms) { var out = []; terms.forEach(function (t) { var d = fDer(t.Y); if (d) out.push(xyTerm(t.c.mul(d[0]), t.X, d[1])); }); return combine(out); }
  function combine(terms) { var m = {}, order = []; terms.forEach(function (t) { var k = JSON.stringify([t.X, t.Y]); if (!m[k]) { m[k] = xyTerm(0, t.X, t.Y); order.push(k); } m[k] = xyTerm(m[k].c.add(t.c), t.X, t.Y); }); return order.map(function (k) { return m[k]; }).filter(function (t) { return !t.c.isZero(); }); }
  function xyLc(terms) { return lc(terms.map(function (t) { return tm(t.c, xyBasis(t)); })); }
  function pw(p) { return { k: 'pow', p: p }; }
  function fval(F, z) { if (F.k === 'pow') return q(z).pow(F.p); if (z !== 0) return null; return F.k === 'sin' ? q(0) : q(1); }
  G('de.exact-equations', function (R, ctx) {
    var L = lv(ctx), kind = pickKind(R, ctx, ['tf', 'k'], ['F', 'F', 'k'], ['ivp', 'F']);
    var terms = [], mixed = R.pick([[1, 1], [2, 1], [1, 2], [2, 2], [3, 1], [1, 3]]);
    terms.push(xyTerm(R.nz(-3, 3), pw(mixed[0]), pw(mixed[1])));
    var extra = R.pick([[[2, 0], [0, 2]], [[0, 3]], [[3, 0], [0, 2]], [[0, 2]], [[1, 0], [0, 1]], [[2, 0]]]);
    extra.forEach(function (e) { terms.push(xyTerm(R.nz(-4, 4), pw(e[0]), pw(e[1]))); });
    if (L >= 3 || (L === 2 && R.chance(0.4))) terms.push(R.pick([xyTerm(R.nz(-2, 2), { k: 'exp' }, pw(1)), xyTerm(R.nz(-2, 2), { k: 'sin' }, pw(1)), xyTerm(R.nz(-2, 2), pw(1), { k: 'exp' })]));
    terms = combine(terms);
    var M = dx(terms), N = dy(terms), Ms = xyLc(M), Ns = xyLc(N), Fs = xyLc(terms);
    var cross = combine(dy(M)), crossS = xyLc(cross);
    var eqT = function (n) { return '\\left(' + Ms.tex + '\\right)dx + \\left(' + n + '\\right)dy = 0'; };
    var withX = []; N.forEach(function (t, i) { if (!(t.X.k === 'pow' && t.X.p === 0)) withX.push(i); });
    if (kind === 'tf') {
      var exact = R.coin(), Nalt = N;
      if (!exact) { // change the coefficient of a term of N that has an x in it: N_x changes, M_y does not
        var i0 = R.pick(withX), delta = R.pick([1, -1, 2]);
        Nalt = N.map(function (t, i) { if (i !== i0) return t; var nc = t.c.add(delta); return xyTerm(nc.isZero() ? t.c.mul(2) : nc, t.X, t.Y); });
      }
      var NaltS = xyLc(Nalt), Nx = xyLc(combine(dx(Nalt)));
      chk({ topic: 'de.exact-equations', kind: 'tf', M: Ms.pl, N: NaltS.pl, truth: exact });
      return {
        q: 'True or false: $' + eqT(NaltS.tex) + '$ is exact.',
        a: tf(exact),
        steps: ['With $M = ' + Ms.tex + '$ and $N = ' + NaltS.tex + '$, the equation is exact when $M_y = N_x$.',
          '$M_y = ' + crossS.tex + '$.', '$N_x = ' + Nx.tex + '$.',
          exact ? 'They are equal, so the equation is exact: true.' : 'They are not equal, so the equation is not exact: false.'],
        hint: 'Differentiate $M$ with respect to $y$ and $N$ with respect to $x$, then compare.'
      };
    }
    if (kind === 'k') {
      var j = R.pick(withX), tj = N[j];
      var nk = T.terms(N.map(function (t, i) { return i === j ? [1, 'k' + xyBasis(t).tex] : [t.c, xyBasis(t).tex]; }));
      var dj = dx([xyTerm(1, tj.X, tj.Y)])[0], others = combine(dx(N.filter(function (t, i) { return i !== j; })));
      var nxT = T.coef(dj.c, 'k\\,' + xyBasis(dj).tex) + others.map(function (t) { return T.coef(t.c, xyBasis(t).tex, false); }).join('');
      var Nk = N.map(function (t, i) { return i === j ? '(K)*(' + (xyBasis(t).pl || '1') + ')' : '(' + xyLc([t]).pl + ')'; }).join(' + ');
      chk({ topic: 'de.exact-equations', kind: 'k', M: Ms.pl, Nk: Nk, ans: tj.c.toPlain() });
      return {
        q: 'Find the value of $k$ that makes $' + eqT(nk) + '$ exact.',
        a: num(tj.c.toPlain()),
        steps: ['The equation is exact when $M_y = N_x$.', '$M_y = ' + crossS.tex + '$.', '$N_x = ' + nxT + '$.',
          'Match the terms that contain $k$: $' + T.coef(dj.c, 'k\\,' + xyBasis(dj).tex) + '$ must equal $' + T.coef(dj.c.mul(tj.c), xyBasis(dj).tex) + '$, so $k = ' + tj.c.toTex() + '$.'],
        hint: 'Compute $M_y$ and $N_x$ (with $k$ in it) and make them match.'
      };
    }
    var xOnly = terms.filter(function (t) { return !(t.X.k === 'pow' && t.X.p === 0); }), yOnly = terms.filter(function (t) { return t.X.k === 'pow' && t.X.p === 0; });
    var xs = xyLc(xOnly), hS = xyLc(yOnly), hp = xyLc(dy(yOnly)), fyx = xyLc(dy(xOnly));
    var base = ['Check exactness: $M_y = ' + crossS.tex + ' = N_x$. ✓',
      'Integrate $M$ with respect to $x$ (treat $y$ as a constant): $F = ' + xs.tex + ' + h(y)$.',
      'Differentiate with respect to $y$: $F_y = ' + (fyx.zero ? '' : fyx.tex + ' + ') + "h'(y)$. This must equal $N = " + Ns.tex + '$.',
      "So $h'(y) = " + hp.tex + '$ and $h(y) = ' + (hS.zero ? '0' : hS.tex) + '$ (choosing the constant so that $F(0, 0) = 0$).',
      '$F(x, y) = ' + Fs.tex + '$.'];
    if (kind === 'F') {
      chk({ topic: 'de.exact-equations', kind: 'F', M: Ms.pl, N: Ns.pl, ans: Fs.pl });
      return { q: 'The equation $' + eqT(Ns.tex) + '$ is exact. Find the potential function $F(x, y)$ with $F_x = M$, $F_y = N$ and $F(0, 0) = 0$.', a: ex(Fs.pl, ['x', 'y']), steps: base, hint: "Integrate $M$ with respect to $x$, add an unknown $h(y)$, then use $F_y = N$ to find $h$." };
    }
    var x0 = R.int(-2, 2), y0 = R.nz(-2, 2);
    if (terms.some(function (t) { return t.X.k !== 'pow'; })) x0 = 0;
    if (terms.some(function (t) { return t.Y.k !== 'pow'; })) y0 = 0;
    var val = q(0); terms.forEach(function (t) { val = val.add(t.c.mul(fval(t.X, x0)).mul(fval(t.Y, y0))); });
    chk({ topic: 'de.exact-equations', kind: 'ivp', M: Ms.pl, N: Ns.pl, F: Fs.pl, pt: [x0, y0], ans: Fs.pl + ' = ' + val.toPlain() });
    return {
      q: 'Solve $' + eqT(Ns.tex) + '$ with $y(' + x0 + ') = ' + y0 + '$. Give the solution as an equation in $x$ and $y$.',
      a: { t: 'eq', v: Fs.pl + ' = ' + val.toPlain() },
      steps: base.concat(['The solutions are the level curves $F(x, y) = C$. At $(' + x0 + ', ' + y0 + ')$, $F = ' + val.toTex() + '$.', 'Solution: $' + Fs.tex + ' = ' + val.toTex() + '$.']),
      hint: 'Find a potential function $F$ with $F_x = M$ and $F_y = N$; the solution through the point is $F(x, y) = F(x_0, y_0)$.'
    };
  });

  // ---------- de.substitutions ----------
  G('de.substitutions', function (R, ctx) {
    var kind = pickKind(R, ctx, ['coef', 'which'], ['bern2', 'homA', 'coef'], ['bern3', 'homB', 'bern2']);
    if (kind === 'coef' || kind === 'which') {
      var n = R.pick([2, 3, 4, -1]), m = 1 - n, Pk = R.pick(['c', 'ct', 'c/t']), Qk = R.pick(['c', 'ct', 'ce']), a = R.nz(-3, 3), b = R.nz(-3, 3);
      var yn = n === -1 ? 'y^{-1}' : 'y^{' + n + '}';
      var Pb = Pk === 'c' ? ONE : Pk === 'ct' ? B.pow(1) : B.raw('\\frac{1}{t}', '1/t'), Qb = Qk === 'c' ? ONE : Qk === 'ct' ? B.pow(1) : B.e(1);
      var Pterm = Pk === 'c/t' ? (a < 0 ? ' - ' : ' + ') + '\\frac{' + Math.abs(a) + '}{t}y' : T.coef(a, Pk === 'ct' ? 'ty' : 'y', false);
      var eqT = "y'" + Pterm + ' = ' + T.coef(b, (Qk === 'ct' ? 't' : Qk === 'ce' ? 'e^{t}' : '') + yn);
      if (kind === 'which') {
        var vT = 'v = y^{' + m + '}', wr = [n, n + 1, -n, n - 1].filter(function (e) { return e !== m && e !== 0 && e !== 1; }).map(function (e) { return 'v = y^{' + e + '}'; }); wr.splice(2, 0, 'v = \\frac{y}{t}');
        return { q: 'Which substitution turns the Bernoulli equation $' + eqT + '$ into a linear equation?', a: mc(R, '$' + vT + '$', wr.map(function (s) { return '$' + s + '$'; }).slice(0, 3)),
          steps: ["A Bernoulli equation $y' + p(t)y = q(t)y^{n}$ becomes linear with $v = y^{1-n}$.", 'Here $n = ' + n + '$, so $v = y^{1 - (' + n + ')} = y^{' + m + '}$.', "Check: dividing by $" + yn + '$ gives $' + ypw(-n) + "y'" + ' + \\dots$, and $v\' = ' + T.coef(m, ypw(-n) + "y'") + '$, so the $y$ powers line up.'],
          hint: 'Compare with $y\' + p(t)y = q(t)y^n$ and use $v = y^{1-n}$.' };
      }
      var am = a * m, bm = b * m;
      var pS = Pk === 'c/t' ? { tex: (am < 0 ? '-' : '') + '\\frac{' + Math.abs(am) + '}{t}', pl: am + '/t' } : lc([tm(am, Pb)]), qS = lc([tm(bm, Qb)]);
      var Pfn = function (c, inner) { return Pk === 'c' ? T.coef(c, inner, false) : Pk === 'ct' ? T.coef(c, 't' + inner, false) : (c < 0 ? ' - ' : ' + ') + '\\frac{' + (Math.abs(c) === 1 ? '' : Math.abs(c)) + inner + '}{t}'; };
      var vf = m === -1 ? "-v'" : m < 0 ? "-\\frac{v'}{" + (-m) + '}' : "\\frac{v'}{" + m + '}';
      chk({ topic: 'de.substitutions', kind: 'coef', n: n, P: Pk === 'c/t' ? a + '/t' : lc([tm(a, Pb)]).pl, Qf: lc([tm(b, Qb)]).pl, ans: [pS.pl, qS.pl] });
      return {
        q: 'The substitution $v = y^{' + m + '}$ turns $' + eqT + "$ into a linear equation $v' + p(t)v = q(t)$. Find $p(t)$ and $q(t)$.",
        a: { t: 'multi', parts: [{ label: '$p(t) =$', a: ex(pS.pl) }, { label: '$q(t) =$', a: ex(qS.pl) }] },
        steps: ['Divide the equation by $' + yn + "$: $" + ypw(-n) + "y'" + Pfn(a, 'y^{' + m + '}') + ' = ' + T.coef(b, Qb.tex || '') + '$.',
          "With $v = y^{" + m + "}$, the chain rule gives $v' = " + T.coef(m, ypw(-n) + "y'") + "$, so $" + ypw(-n) + "y' = " + vf + '$.',
          'Substitute: $' + vf + Pfn(a, 'v') + ' = ' + T.coef(b, Qb.tex || '') + '$.',
          'Multiply by $' + m + "$: $v'" + Pfn(am, 'v') + ' = ' + qS.tex + '$.',
          '$p(t) = ' + pS.tex + '$ and $q(t) = ' + qS.tex + '$.'],
        hint: "Divide by $y^n$ first. Then $v' = (1 - n)y^{-n}y'$."
      };
    }
    if (kind === 'bern2' || kind === 'bern3') {
      var n2 = kind === 'bern2' ? 2 : 3, a2, b2, y0, v0, Bq, Dq, tries = 0;
      do {
        a2 = R.nz(-3, 3); b2 = R.nz(-4, 4); y0 = n2 === 2 ? R.pick([q(1), q(2), q(-1), q(1, 2)]) : R.pick([q(1), q(1, 2)]);
        v0 = q(1).div(y0.pow(n2 - 1)); Bq = q(b2).div(a2); Dq = v0.sub(Bq);
      } while ((Dq.isZero() || (n2 === 3 && Bq.sign() < 0 && Dq.sign() < 0)) && tries++ < 30);
      var mm = 1 - n2, rate = q(a2).mul(mm).neg(); // v' + (1-n)a v = (1-n) b  ->  v = B + D e^{-(1-n)a t}
      var vS = lc([tm(Bq), tm(Dq, B.e(rate))]);
      var ans = n2 === 2 ? '1/(' + vS.pl + ')' : '1/sqrt(' + vS.pl + ')';
      var ansT = n2 === 2 ? '\\frac{1}{' + vS.tex + '}' : '\\frac{1}{\\sqrt{' + vS.tex + '}}';
      chk({ topic: 'de.substitutions', kind: 'ode', F: 'y1 + (' + a2 + ')*y - (' + b2 + ')*y^' + n2, ic: [0, y0.toNumber()], ans: ans, dom: [-0.3, 0.3] });
      return {
        q: "Solve $y'" + T.coef(a2, 'y', false) + ' = ' + T.coef(b2, 'y^{' + n2 + '}') + '$ with $y(0) = ' + y0.toTex() + '$' + (n2 === 3 ? ' (take the positive root)' : '') + '.',
        a: ex(ans),
        steps: ['This is a Bernoulli equation with $n = ' + n2 + '$. Let $v = y^{' + mm + '}$, so $v\' = ' + T.coef(mm, "y^{" + (-n2) + "}y'") + '$.',
          "Divide the equation by $y^{" + n2 + "}$: $y^{" + (-n2) + "}y'" + T.coef(a2, 'y^{' + mm + '}', false) + ' = ' + b2 + '$, which becomes $' + (mm === -1 ? "-v'" : "-\\frac{v'}{" + (-mm) + '}') + T.coef(a2, 'v', false) + ' = ' + b2 + '$.',
          "Multiply by $" + mm + "$: $v'" + T.coef(q(a2).mul(mm), 'v', false) + ' = ' + (b2 * mm) + '$, a linear equation.',
          'Its solutions are $v = ' + Bq.toTex() + ' + Ce^{' + kv(rate) + '}$ (the constant $' + Bq.toTex() + '$ is the equilibrium; check by substituting).',
          'At $t = 0$: $v(0) = y(0)^{' + mm + '} = ' + v0.toTex() + '$, so $C = ' + Dq.toTex() + '$ and $v = ' + vS.tex + '$.',
          'Undo the substitution: $y = v^{' + (n2 === 2 ? '-1' : '-1/2') + '} = ' + ansT + '$.'],
        hint: 'Use $v = y^{1-n}$ to get a linear equation for $v$, solve it, then convert back to $y$.'
      };
    }
    // homogeneous equations, x > 0, y(1) = y0
    var fam = kind === 'homA' ? R.pick([1, 2]) : R.pick([3, 4, 5]), y1 = R.pick([1, 2, 3, -1, -2]), eqT2, ansPl, ansT2, st, F;
    if (fam === 1) {
      var a1 = R.nz(-3, 3); eqT2 = "xy' = y" + T.coef(a1, 'x', false); F = 'x*y1 - y - (' + a1 + ')*x';
      ansPl = lc([tm(a1, B.raw('x\\ln x', 'x ln(x)')), tm(y1, B.pow(1, 'x'))]).pl; ansT2 = lc([tm(a1, B.raw('x\\ln x', '')), tm(y1, B.raw('x', ''))]).tex;
      st = ["Divide by $x$: $y' = \\frac{y}{x}" + T.signed(a1) + '$, a function of $\\frac{y}{x}$.', "Let $v = \\frac{y}{x}$, so $y = vx$ and $y' = v + xv'$.", "Then $v + xv' = v" + T.signed(a1) + "$, so $xv' = " + a1 + '$ (separable).', 'Integrate: $v = ' + T.coef(a1, '\\ln x') + ' + C$.', 'At $x = 1$: $v = \\frac{y}{x} = ' + y1 + '$, so $C = ' + y1 + '$.', 'So $y = xv = ' + ansT2 + '$.'];
    } else if (fam === 2) {
      var k = R.pick([1, 2, -1]); eqT2 = "x^{2}y' = xy" + T.coef(k, 'y^{2}', false); F = 'x^2*y1 - x*y - (' + k + ')*y^2';
      var den = q(1).div(y1); // y = x/(1/y1 - k ln x)
      var dS = lc([tm(den), tm(-k, B.raw('\\ln x', 'ln(x)'))]); ansPl = 'x/(' + dS.pl + ')'; ansT2 = '\\frac{x}{' + dS.tex + '}';
      st = ["Divide by $x^{2}$: $y' = \\frac{y}{x}" + T.coef(k, '\\left(\\frac{y}{x}\\right)^{2}', false) + '$.', "Let $v = \\frac{y}{x}$: $v + xv' = v" + T.coef(k, 'v^{2}', false) + '$, so $xv\' = ' + T.coef(k, 'v^{2}') + '$.',
        'Separate: $\\frac{dv}{v^{2}} = ' + T.coef(k, '\\frac{dx}{x}') + '$, so $-\\frac{1}{v} = ' + T.coef(k, '\\ln x') + ' + C$.', 'At $x = 1$, $v = ' + y1 + '$: $C = ' + q(-1).div(y1).toTex() + '$. So $\\frac{1}{v} = ' + dS.tex + '$.', 'Then $y = xv = ' + ansT2 + '$.'];
    } else if (fam === 3) {
      y1 = Math.abs(y1); eqT2 = "xy\\,y' = x^{2} + y^{2}"; F = 'x*y*y1 - x^2 - y^2';
      ansPl = 'x*sqrt(2ln(x) + ' + y1 * y1 + ')'; ansT2 = 'x\\sqrt{2\\ln x + ' + y1 * y1 + '}';
      st = ["Divide by $xy$: $y' = \\frac{x}{y} + \\frac{y}{x}$, a function of $\\frac{y}{x}$.", "Let $v = \\frac{y}{x}$: $v + xv' = \\frac{1}{v} + v$, so $xv' = \\frac{1}{v}$.", 'Separate: $v\\,dv = \\frac{dx}{x}$, so $\\frac{v^{2}}{2} = \\ln x + C$.', 'At $x = 1$, $v = ' + y1 + '$: $C = \\frac{' + y1 * y1 + '}{2}$, so $v^{2} = 2\\ln x + ' + y1 * y1 + '$.', 'Since $y(1) > 0$, take the positive root: $y = xv = ' + ansT2 + '$.'];
    } else if (fam === 4) {
      var m4 = R.pick([1, 2]), c4 = m4 + 1; if (y1 === -m4) y1 = 1;
      eqT2 = "x^{2}y' = y^{2} + " + c4 + 'xy'; F = 'x^2*y1 - y^2 - ' + c4 + '*x*y';
      var K = q(y1).div(y1 + m4), num4 = K.mul(m4); // y = m K x^{m+1}/(1 - K x^m)
      var dS4 = lc([tm(1), tm(K.neg(), B.pow(m4, 'x'))]);
      var xm4 = m4 === 1 ? 'Kx' : 'Kx^{' + m4 + '}', sg4 = y1 + m4 < 0 ? -1 : 1, kRaw = '\\frac{' + sg4 * y1 + '}{' + sg4 * (y1 + m4) + '}';
      if (kRaw !== K.toTex()) kRaw += ' = ' + K.toTex();
      ansPl = lc([tm(num4, B.pow(m4 + 1, 'x'))]).pl + '/(' + dS4.pl + ')'; ansT2 = '\\frac{' + lc([tm(num4, B.pow(m4 + 1, 'x'))]).tex + '}{' + dS4.tex + '}';
      st = ["Divide by $x^{2}$: $y' = \\left(\\frac{y}{x}\\right)^{2} + " + c4 + '\\frac{y}{x}$.', "Let $v = \\frac{y}{x}$: $v + xv' = v^{2} + " + c4 + "v$, so $xv' = v^{2}" + T.coef(m4, 'v', false) + ' = v(v + ' + m4 + ')$.',
        'Separate with partial fractions: $' + (m4 === 1 ? '' : '\\frac{1}{' + m4 + '}') + '\\left(\\frac{1}{v} - \\frac{1}{v + ' + m4 + '}\\right)dv = \\frac{dx}{x}$, so $\\frac{v}{v + ' + m4 + '} = ' + xm4 + '$.',
        'At $x = 1$, $v = ' + y1 + '$: $K = ' + kRaw + '$.',
        'Solve for $v$: $v = \\frac{' + (m4 === 1 ? '' : m4) + xm4 + '}{1 - ' + xm4 + '}$, so $y = xv = ' + ansT2 + '$.'];
    } else {
      y1 = Math.abs(y1); eqT2 = "2xy\\,y' = 3y^{2} + x^{2}"; F = '2*x*y*y1 - 3*y^2 - x^2';
      var K5 = y1 * y1 + 1; ansPl = 'sqrt(' + K5 + 'x^3 - x^2)'; ansT2 = '\\sqrt{' + K5 + 'x^{3} - x^{2}}';
      st = ["Divide by $2xy$: $y' = \\frac{3}{2}\\cdot\\frac{y}{x} + \\frac{1}{2}\\cdot\\frac{x}{y}$, a function of $\\frac{y}{x}$.", "Let $v = \\frac{y}{x}$: $v + xv' = \\frac{3v}{2} + \\frac{1}{2v}$, so $xv' = \\frac{v^{2} + 1}{2v}$.", 'Separate: $\\frac{2v\\,dv}{v^{2} + 1} = \\frac{dx}{x}$, so $\\ln(v^{2} + 1) = \\ln x + C$, that is, $v^{2} + 1 = Kx$.', 'At $x = 1$, $v = ' + y1 + '$: $K = ' + K5 + '$. So $\\frac{y^{2}}{x^{2}} = ' + K5 + 'x - 1$.', 'Since $y(1) > 0$: $y = ' + ansT2 + '$.'];
    }
    chk({ topic: 'de.substitutions', kind: 'ode', F: F, v: 'x', ic: [1, y1], ans: ansPl, dom: [0.8, 1.25] });
    return { q: 'Solve $' + eqT2 + '$ with $y(1) = ' + y1 + '$, for $x > 0$ near 1. Use $v = y/x$.', a: ex(ansPl, ['x']), steps: st, hint: "Write $y'$ as a function of $v = y/x$, then use $y = vx$, $y' = v + xv'$." };
  });

  // ---------- de.autonomous-phase-line ----------
  function polyMul(a, b) { var out = []; for (var i = 0; i < a.length + b.length - 1; i++) out.push(q(0)); a.forEach(function (x, i) { b.forEach(function (y, j) { out[i + j] = out[i + j].add(q(x).mul(q(y))); }); }); return out; }
  function polyEval(p, x) { var v = q(0); p.forEach(function (c) { v = v.mul(x).add(c); }); return v; } // high -> low
  G('de.autonomous-phase-line', function (R, ctx) {
    var L = lv(ctx), kind = pickKind(R, ctx, ['eq', 'class'], ['class', 'limit', 'eq'], ['class', 'limit']);
    var fam = L === 1 ? 'quad' : R.pick(['quad', 'cubic', 'semi', 'logistic']), k = R.pick([1, -1, 2, -2]), roots, fT, poly, rts;
    if (fam === 'logistic') {
      var r = R.pick([q(1), q(2), q(1, 2)]), K = R.pick([4, 5, 6, 10]); roots = [0, K]; rts = [0, K];
      poly = [r.neg().div(K), r, q(0)]; fT = (r.eq(1) ? '' : r.toTex()) + 'y\\left(1 - \\frac{y}{' + K + '}\\right)';
    } else {
      if (fam === 'quad') rts = R.ints(2, -4, 4, true); else if (fam === 'cubic') rts = R.ints(3, -3, 4, true); else { var aa = R.int(-3, 3); rts = [aa, aa, R.intNot(-3, 3, aa)]; }
      rts.sort(function (x, y) { return x - y; });
      poly = [q(k)]; rts.forEach(function (x) { poly = polyMul(poly, [1, -x]); });
      roots = U.uniq(rts);
      var fac = rts.map(function (x) { return x === 0 ? 'y' : '(' + T.lin(1, 'y', -x) + ')'; });
      if (fam === 'semi') { var dbl = rts[0] === rts[1] ? rts[0] : rts[1]; var other = rts.filter(function (x) { return x !== dbl; })[0]; fac = [(dbl === 0 ? 'y' : '(' + T.lin(1, 'y', -dbl) + ')') + '^{2}', other === 0 ? 'y' : '(' + T.lin(1, 'y', -other) + ')']; }
      fT = (k === 1 ? '' : k === -1 ? '-' : k) + fac.join('');
      if (L >= 3 && fam !== 'semi' && R.coin()) fT = T.poly(poly.map(function (c) { return c; }), 'y');
    }
    roots = roots.slice().sort(function (x, y) { return x - y; });
    var sgn = function (y) { return polyEval(poly, q(y)).sign(); };
    var probe = function (i) { var lo = i === 0 ? q(roots[0] - 1) : q(roots[i - 1] + roots[i]).div(2); return lo; };
    var signs = []; for (var i = 0; i <= roots.length; i++) { var y = i === 0 ? q(roots[0] - 1) : i === roots.length ? q(roots[roots.length - 1] + 1) : q(roots[i - 1] + roots[i]).div(2); signs.push(polyEval(poly, y).sign()); }
    var cls = roots.map(function (e, i) { var l = signs[i], rr = signs[i + 1]; return l > 0 && rr < 0 ? 'stable' : l < 0 && rr > 0 ? 'unstable' : 'semi-stable'; });
    var arrow = function (s) { return s > 0 ? 'positive, so $y$ increases (↑)' : 'negative, so $y$ decreases (↓)'; };
    var ivName = function (i) { return i === 0 ? '(-\\infty, ' + roots[0] + ')' : i === roots.length ? '(' + roots[roots.length - 1] + ', \\infty)' : '(' + roots[i - 1] + ', ' + roots[i] + ')'; };
    var chart = signs.map(function (s, i) { return 'On $' + ivName(i) + '$, $f(y)$ is ' + arrow(s) + '.'; });
    var eqLine = 'Equilibria: $f(y) = 0$ at $y = ' + roots.join('$, $y = ') + '$.';
    chk({ topic: 'de.autonomous-phase-line', kind: 'pl', poly: poly.map(function (c) { return c.toNumber(); }), roots: roots, cls: cls });
    var eqn = "y' = " + fT;
    if (kind === 'eq') {
      return { q: 'Find all equilibrium solutions of $' + eqn + '$.', a: { t: 'set', v: roots.map(String) }, steps: ['An equilibrium is a constant solution: $y\' = 0$, so $f(y) = 0$.', (fT.indexOf('(') < 0 && fam !== 'logistic' ? 'Factor: $f(y) = ' + (k === 1 ? '' : k === -1 ? '-' : k) + rts.map(function (x) { return x === 0 ? 'y' : '(' + T.lin(1, 'y', -x) + ')'; }).join('') + '$. ' : '') + eqLine], hint: 'Set the right side equal to 0 and solve for $y$.' };
    }
    if (kind === 'class') {
      var idx = R.int(0, roots.length - 1), e = roots[idx], c = cls[idx];
      return {
        q: 'For $' + eqn + '$, classify the equilibrium $y = ' + e + '$.',
        a: mc(R, c, ['stable', 'unstable', 'semi-stable'].filter(function (z) { return z !== c; })),
        steps: [eqLine].concat(chart, ['At $y = ' + e + '$: solutions ' + (signs[idx] > 0 ? 'below rise toward it' : 'below fall away from it') + ', and solutions ' + (signs[idx + 1] < 0 ? 'above fall toward it' : 'above rise away from it') + '.',
          c === 'stable' ? 'Both sides approach, so it is stable.' : c === 'unstable' ? 'Both sides move away, so it is unstable.' : 'One side approaches and the other moves away, so it is semi-stable (not stable).']),
        hint: 'Find the sign of $f(y)$ just below and just above the equilibrium.'
      };
    }
    // limit as t -> infinity from y(0) = y0, only where the limit is an equilibrium
    var opts = []; for (var j = 0; j <= roots.length; j++) { var s = signs[j]; if (s > 0 && j < roots.length) opts.push([j, roots[j]]); if (s < 0 && j > 0) opts.push([j, roots[j - 1]]); }
    var pick = R.pick(opts), jj = pick[0], y0 = jj === 0 ? q(roots[0] - R.int(1, 2)) : jj === roots.length ? q(roots[roots.length - 1] + R.int(1, 2)) : q(roots[jj - 1] + roots[jj]).div(2);
    if (jj > 0 && jj < roots.length && roots[jj] - roots[jj - 1] >= 3 && R.coin()) y0 = q(roots[jj - 1] + 1);
    chk({ topic: 'de.autonomous-phase-line', kind: 'limit', poly: poly.map(function (c) { return c.toNumber(); }), y0: y0.toNumber(), ans: pick[1] });
    return {
      q: 'For $' + eqn + '$ with $y(0) = ' + y0.toTex() + '$, find $\\displaystyle\\lim_{t \\to \\infty} y(t)$.',
      a: num(pick[1]),
      steps: [eqLine].concat(['$y(0) = ' + y0.toTex() + '$ lies in $' + ivName(jj) + '$, where $f(y)$ is ' + arrow(signs[jj]) + '.',
        'A solution can never cross an equilibrium (uniqueness), so it moves ' + (signs[jj] > 0 ? 'up' : 'down') + ' toward $y = ' + pick[1] + '$ and levels off there.', 'So $y(t) \\to ' + pick[1] + '$.']),
      hint: 'Which way does $y$ move at the start? It cannot pass an equilibrium.'
    };
  });

  // ---------- de.numerical-methods ----------
  var FNS = [ // [tex, plain, fn(t, y) on Q]
    ['t + y', 't + y', function (t, y) { return t.add(y); }], ['t - y', 't - y', function (t, y) { return t.sub(y); }],
    ['y - t', 'y - t', function (t, y) { return y.sub(t); }], ['2t + y', '2*t + y', function (t, y) { return t.mul(2).add(y); }],
    ['ty', 't*y', function (t, y) { return t.mul(y); }], ['y - t^{2}', 'y - t^2', function (t, y) { return y.sub(t.mul(t)); }],
    ['1 + y^{2}', '1 + y^2', function (t, y) { return y.mul(y).add(1); }], ['t^{2} + y', 't^2 + y', function (t, y) { return t.mul(t).add(y); }],
    ['2y', '2*y', function (t, y) { return y.mul(2); }], ['3 - y', '3 - y', function (t, y) { return q(3).sub(y); }]
  ];
  function dec(x) { // exact short decimal, or 6 places
    if (x.isTerminating()) { var s = x.toDec(12).replace(/0+$/, '').replace(/\.$/, ''); if (s.replace(/^-?\d*\.?/, '').length <= 6) return s; }
    return x.toDec(6);
  }
  function exactShort(x) { return x.isTerminating() && x.toDec(12).replace(/0+$/, '').replace(/\.$/, '').replace(/^-?\d*\.?/, '').length <= 6; }
  function ed(x) { return (exactShort(x) ? '= ' : '\\approx ') + dec(x); }
  function dp(x) { return x.sign() < 0 ? '(' + dec(x) + ')' : dec(x); }
  G('de.numerical-methods', function (R, ctx) {
    var kind = pickKind(R, ctx, ['ie', 'order'], ['ie', 'ie2', 'k2'], ['rk4', 'ie2', 'rk4']);
    if (kind === 'order') {
      var m = R.pick(['Euler’s method', 'the improved Euler method', 'the fourth-order Runge–Kutta method']), f0 = m === 'Euler’s method' ? 2 : m === 'the improved Euler method' ? 4 : 16;
      return { q: 'With ' + m + ', about how many times smaller does the error at a fixed time $t$ become when the step size $h$ is cut in half?', a: num(f0, { form: 'int' }),
        steps: ['The global error of a method of order $p$ is roughly proportional to $h^{p}$.', 'Euler has order 1, improved Euler order 2, and Runge–Kutta (RK4) order 4.', 'Halving $h$ divides the error by about $2^{p}$, here $' + f0 + '$.'],
        hint: 'Error ≈ $Ch^p$. What is $p$ for this method?' };
    }
    var pool = kind === 'ie2' ? FNS.slice(0, 5).concat([FNS[8], FNS[9]]) : FNS;
    var F = R.pick(pool), t0 = q(R.pick([0, 0, 1])), y0 = q(R.pick([1, 2, -1, 1, '0.5'])), h = q(R.pick(['0.1', '0.2', '0.5']));
    if (F[0] === '1 + y^{2}') { y0 = q(R.pick([0, 1])); h = q('0.1'); }
    if (kind === 'ie2') h = q(R.pick(['0.5', '0.5', '0.1']));
    var f = F[2], st = [], y = y0, t = t0, nsteps = kind === 'ie2' ? 2 : 1;
    var label = "y' = " + F[0];
    if (kind === 'rk4') {
      var k1 = f(t, y), k2 = f(t.add(h.div(2)), y.add(h.div(2).mul(k1))), k3 = f(t.add(h.div(2)), y.add(h.div(2).mul(k2))), k4 = f(t.add(h), y.add(h.mul(k3)));
      var sum = k1.add(k2.mul(2)).add(k3.mul(2)).add(k4), y1 = y.add(h.div(6).mul(sum));
      chk({ topic: 'de.numerical-methods', kind: 'rk4', f: F[1], t0: t0.toNumber(), y0: y0.toNumber(), h: h.toNumber(), n: 1, ans: y1.toNumber() });
      return {
        q: 'Use one step of the fourth-order Runge–Kutta method with $h = ' + dec(h) + '$ to approximate $y(' + dec(t0.add(h)) + ')$ for $' + label + '$, $y(' + dec(t0) + ') = ' + dec(y0) + '$. Round to 4 decimal places.',
        a: num(y1.toDec(4), { tol: 0.00006 }),
        steps: ['$k_1 = f(' + dec(t) + ', ' + dec(y) + ') ' + ed(k1) + '$.',
          '$k_2 = f\\left(t_0 + \\frac{h}{2},\\ y_0 + \\frac{h}{2}k_1\\right) = f(' + dec(t.add(h.div(2))) + ', ' + dec(y.add(h.div(2).mul(k1))) + ') ' + ed(k2) + '$.',
          '$k_3 = f\\left(t_0 + \\frac{h}{2},\\ y_0 + \\frac{h}{2}k_2\\right) ' + ed(k3) + '$ (evaluated at $y = ' + dec(y.add(h.div(2).mul(k2))) + '$).',
          '$k_4 = f(t_0 + h,\\ y_0 + hk_3) ' + ed(k4) + '$ (evaluated at $y = ' + dec(y.add(h.mul(k3))) + '$).',
          '$y_1 = y_0 + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4) = ' + dec(y) + ' + \\frac{' + dec(h) + '}{6}' + (exactShort(sum) ? '(' + dec(sum) + ')' : '\\cdot ' + dp(sum)) + ' ' + ed(y1) + '$.',
          'Rounded: $y(' + dec(t0.add(h)) + ') \\approx ' + y1.toDec(4) + '$.'],
        hint: 'Compute $k_1, k_2, k_3, k_4$ in order; $k_2$ and $k_3$ use half a step.'
      };
    }
    if (kind === 'k2') {
      var a1 = f(t, y), pr = y.add(h.mul(a1)), a2 = f(t.add(h), pr);
      chk({ topic: 'de.numerical-methods', kind: 'k2', f: F[1], t0: t0.toNumber(), y0: y0.toNumber(), h: h.toNumber(), ans: a2.toNumber() });
      return {
        q: 'In the improved Euler method for $' + label + '$, $y(' + dec(t0) + ') = ' + dec(y0) + '$, with $h = ' + dec(h) + '$, find the second slope $k_2 = f(t_0 + h,\\ y_0 + hk_1)$ for the first step.',
        a: num(exactShort(a2) && dec(a2).replace(/^-?\d*\.?/, '').length <= 4 ? dec(a2) : a2.toDec(4), { tol: 0.00006 }),
        steps: ['$k_1 = f(' + dec(t) + ', ' + dec(y) + ') ' + ed(a1) + '$.', 'The Euler prediction is $y_0 + hk_1 = ' + dec(y) + ' + ' + dec(h) + '(' + dec(a1) + ') ' + ed(pr) + '$ at $t = ' + dec(t.add(h)) + '$.', '$k_2 = f(' + dec(t.add(h)) + ', ' + dec(pr) + ') ' + ed(a2) + '$.'],
        hint: 'First take an Euler step to predict $y$ at $t_0 + h$, then evaluate $f$ there.'
      };
    }
    for (var i = 0; i < nsteps; i++) {
      var s1 = f(t, y), pred = y.add(h.mul(s1)), s2 = f(t.add(h), pred), yn = y.add(h.div(2).mul(s1.add(s2)));
      st.push((nsteps > 1 ? 'Step ' + (i + 1) + ': ' : '') + '$k_1 = f(' + dec(t) + ', ' + dec(y) + ') ' + ed(s1) + '$; the Euler prediction is $' + dec(y) + ' + ' + dec(h) + '(' + dec(s1) + ') ' + ed(pred) + '$.',
        '$k_2 = f(' + dec(t.add(h)) + ', ' + dec(pred) + ') ' + ed(s2) + '$.',
        '$y_{' + (i + 1) + '} = ' + dec(y) + ' + \\frac{' + dec(h) + '}{2}(' + dec(s1) + ' + ' + dp(s2) + ') ' + ed(yn) + '$.');
      y = yn; t = t.add(h);
    }
    var short = exactShort(y) && dec(y).replace(/^-?\d*\.?/, '').length <= 4;
    chk({ topic: 'de.numerical-methods', kind: 'ie', f: F[1], t0: t0.toNumber(), y0: y0.toNumber(), h: h.toNumber(), n: nsteps, ans: y.toNumber() });
    return {
      q: 'Use ' + (nsteps === 1 ? 'one step' : 'two steps') + ' of the improved Euler method with $h = ' + dec(h) + '$ to approximate $y(' + dec(t) + ')$ for $' + label + '$, $y(' + dec(t0) + ') = ' + dec(y0) + '$.' + (short ? '' : ' Round to 4 decimal places.'),
      a: num(short ? dec(y) : y.toDec(4), { tol: 0.00006 }),
      steps: st.concat(['So $y(' + dec(t) + ') \\approx ' + (short ? dec(y) : y.toDec(4)) + '$.']),
      hint: 'Average the slope at the start, $k_1$, with the slope $k_2$ at the Euler prediction: $y_1 = y_0 + \\frac{h}{2}(k_1 + k_2)$.'
    };
  });

// ---- u2.js
  // =====================================================================================================
  // UNIT 2: First-Order Models
  // =====================================================================================================

  function qd(x) { return q(x).isInt() ? q(x).toString() : q(x).isTerminating() ? q(x).toDec(10).replace(/0+$/, '').replace(/\.$/, '') : q(x).toTex(); } // short decimal or fraction (TeX)
  function qdt(x) { var s = qd(x); return /\\/.test(s) ? '$' + s + '$' : s; } // qd for running text: a fraction goes inside $…$
  function qpl(x) { return q(x).isTerminating() ? qd(x) : q(x).toPlain(); }

  // ---------- de.mixing-problems ----------
  G('de.mixing-problems', function (R, ctx) {
    var kind = pickKind(R, ctx, ['rate', 'out'], ['solve', 'at', 'rate'], ['time', 'grow', 'solve', 'at']);
    var V = R.pick([50, 100, 200, 400, 500, 1000]), r = R.pick([2, 4, 5, 10]), c = q(R.pick([0, '0.5', 1, 2, 3])), Q0 = q(R.pick([0, 10, 20, 50, 100]) * (V / 50));
    if (c.isZero() && Q0.isZero()) Q0 = q(V / 2);
    if (q(c).mul(V).eq(Q0)) Q0 = Q0.add(V / 5);
    var k = q(r, V), inS = c.mul(r), Qeq = c.mul(V), A = Q0.sub(Qeq), cT = c.isZero() ? 'pure water' : 'brine containing ' + qdt(c) + ' g of salt per liter';
    var setup = 'A tank holds ' + V + ' L of ' + (Q0.isZero() ? 'pure water. ' : 'water with ' + qdt(Q0) + ' g of salt dissolved in it. ') + (c.isZero() ? 'Pure water' : 'Brine containing ' + qdt(c) + ' g of salt per liter') + ' flows in at ' + r + ' L/min, and the well-mixed solution drains at ' + r + ' L/min.';
    var rateS = lc([tm(inS), tm(k.neg(), B.raw('Q', 'Q'))]);
    var expo = B.e(k.neg()), sol = lc([tm(Qeq), tm(A, expo)]);
    var st = ['Salt comes in at (concentration)(flow) $= ' + qd(c) + '\\cdot ' + r + ' = ' + qd(inS) + '$ g/min.',
      '',
      'So $\\dfrac{dQ}{dt} = ' + rateS.tex + '$.'];
    // tidy the "leaves" step: r/V Q as a fraction
    st[1] = 'Salt leaves at (concentration in the tank)(flow) $= \\frac{Q}{' + V + '}\\cdot ' + r + ' = ' + lc([tm(k, B.raw('Q', 'Q'))]).tex + '$ g/min. (The volume stays ' + V + ' L because the flows in and out match.)';
    var solveSt = st.concat(['This is linear: $Q\' + ' + lc([tm(k, B.raw('Q', 'Q'))]).tex + ' = ' + qd(inS) + '$. The equilibrium (constant solution) is $Q = ' + qd(Qeq) + '$, and the rest decays like $e^{' + kv(k.neg()) + '}$.',
      'So $Q(t) = ' + qd(Qeq) + ' + Ce^{' + kv(k.neg()) + '}$; $Q(0) = ' + qd(Q0) + '$ gives $C = ' + qd(A) + '$.',
      '$Q(t) = ' + sol.tex + '$.']);
    chk({ topic: 'de.mixing-problems', kind: 'ode', ode: [1, k.toNumber()], g: inS.toNumber(), ic: [0, Q0.toNumber()], ans: sol.pl, dom: [0, 50] });
    if (kind === 'out') {
      return { q: setup + ' At what rate (in g/min) does salt leave the tank when it holds $Q$ grams of salt?', a: ex(lc([tm(k, B.raw('Q', 'Q'))]).pl, ['Q']),
        steps: ['Each liter leaving carries the tank’s concentration, $\\frac{Q}{' + V + '}$ g/L.', 'Liters leave at ' + r + ' L/min, so salt leaves at $\\frac{Q}{' + V + '}\\cdot ' + r + ' = ' + lc([tm(k, B.raw('Q', 'Q'))]).tex + '$ g/min.', 'Note: ' + r + ' L/min is the flow of water, not of salt.'],
        hint: 'Salt out = (grams per liter in the tank) × (liters per minute leaving).' };
    }
    if (kind === 'rate') return { q: setup + ' Let $Q(t)$ be the grams of salt after $t$ minutes. Find $\\dfrac{dQ}{dt}$ in terms of $Q$.', a: ex(rateS.pl, ['Q']), steps: st, hint: 'Rate of change = rate in − rate out, both in grams of salt per minute.' };
    if (kind === 'solve') return { q: setup + ' Find $Q(t)$, the grams of salt after $t$ minutes.', a: ex(sol.pl), steps: solveSt, hint: 'Set up $Q\'$ = (rate in) − (rate out), then solve the linear equation with $Q(0)$.' };
    if (kind === 'at') {
      var m = R.pick([1, 2, 3]), Tt = q(V, r).mul(m), val = Qeq.toPlain() + (A.sign() < 0 ? ' - ' : ' + ') + A.abs().toPlain() + 'e^(-' + m + ')';
      chk({ topic: 'de.mixing-problems', kind: 'value', expr: sol.pl, at: Tt.toNumber(), ans: +ML.evalPlain(val) });
      return { q: setup + ' How much salt is in the tank after ' + qdt(Tt) + ' minutes? (Exact, or to the nearest 0.1 g.)', a: num(val, { tol: 0.06 }), unit: 'g',
        steps: solveSt.concat(['At $t = ' + qd(Tt) + '$: $' + kv(k.neg()) + ' = -' + m + '$, so $Q = ' + qd(Qeq) + T.coef(A, 'e^{-' + m + '}', false) + ' \\approx ' + T.dec(Qeq.toNumber() + A.toNumber() * Math.exp(-m), 1) + '$ g.']),
        hint: 'Find $Q(t)$ first, then substitute the time.' };
    }
    if (kind === 'time') {
      var f = R.pick([2, 4, 3]), target = Qeq.add(A.div(f)); // Q - Qeq shrinks by the factor f
      var tval = q(V, r).toPlain() + 'ln(' + f + ')';
      chk({ topic: 'de.mixing-problems', kind: 'root', expr: sol.pl, target: target.toNumber(), ans: +ML.evalPlain(tval) });
      return { q: setup + ' After how many minutes will the tank hold ' + qdt(target) + ' g of salt? (Exact, or to the nearest 0.1 min.)', a: num(tval, { tol: 0.06 }), unit: 'min',
        steps: solveSt.concat(['Set $Q(t) = ' + qd(target) + '$: $' + T.coef(A, 'e^{' + kv(k.neg()) + '}') + ' = ' + qd(target.sub(Qeq)) + '$, so $e^{' + kv(k.neg()) + '} = \\frac{1}{' + f + '}$.',
          'Take logarithms: $' + fracT(k, 't', '') .replace('{}', '{1}') + ' = \\ln ' + f + '$, so $t = ' + qd(q(V, r)) + '\\ln ' + f + ' \\approx ' + T.dec(V / r * Math.log(f), 1) + '$ min.']),
        hint: 'Solve for $Q(t)$, set it equal to the target, isolate the exponential and take $\\ln$.' };
    }
    // grow: inflow faster than outflow; amount when the tank is full
    var V0 = R.pick([100, 200, 50]), rout = R.pick([1, 2]), d = R.pick([1, rout === 2 ? 2 : 1]), rin = rout + d, p = rout / d, cc = q(R.pick([1, 2, '0.5'])), Q00 = q(R.pick([0, 10, 20]) * V0 / 50), Vmax = 2 * V0;
    var Tf = (Vmax - V0) / d, Qfull = cc.mul(Vmax).add(Q00.sub(cc.mul(V0)).mul(q(1, 2).pow(p)));
    var Csol = lc([tm(cc.mul(V0)), tm(cc.mul(d), B.pow(1))]).pl + (Q00.sub(cc.mul(V0)).isZero() ? '' : ' + (' + Q00.sub(cc.mul(V0)).toPlain() + ')*(' + V0 + '/(' + V0 + ' + ' + d + 't))^' + p);
    chk({ topic: 'de.mixing-problems', kind: 'ode', ode: [1, '(' + rout + ')/(' + V0 + ' + ' + d + '*t)'], g: cc.mul(rin).toNumber(), ic: [0, Q00.toNumber()], ans: Csol, dom: [0, Tf] });
    chk({ topic: 'de.mixing-problems', kind: 'value', expr: Csol, at: Tf, ans: Qfull.toNumber() });
    return {
      q: 'A ' + Vmax + ' L tank starts with ' + V0 + ' L of water containing ' + qdt(Q00) + ' g of salt. Brine with ' + qdt(cc) + ' g/L flows in at ' + rin + ' L/min and the mixture drains at ' + rout + ' L/min. How much salt is in the tank at the moment it becomes full?',
      a: num(Qfull.toPlain()), unit: 'g',
      steps: ['The volume grows by ' + d + ' L/min: $V(t) = ' + V0 + ' + ' + (d === 1 ? '' : d) + 't$. It is full when $V = ' + Vmax + '$, at $t = ' + Tf + '$ min.',
        "Rate in $= " + qd(cc.mul(rin)) + "$ g/min; rate out $= \\frac{Q}{" + V0 + ' + ' + (d === 1 ? '' : d) + 't}\\cdot ' + rout + '$. So $Q\' + \\frac{' + rout + '}{' + V0 + ' + ' + (d === 1 ? '' : d) + 't}Q = ' + qd(cc.mul(rin)) + '$.',
        'Integrating factor: $\\mu = e^{\\int ' + rout + '/(' + V0 + ' + ' + (d === 1 ? '' : d) + 't)\\,dt} = (' + V0 + ' + ' + (d === 1 ? '' : d) + 't)^{' + p + '}$.',
        '$\\left[(' + V0 + ' + ' + (d === 1 ? '' : d) + 't)^{' + p + '}Q\\right]\' = ' + qd(cc.mul(rin)) + '(' + V0 + ' + ' + (d === 1 ? '' : d) + 't)^{' + p + '}$, which integrates to $' + qd(cc) + '(' + V0 + ' + ' + (d === 1 ? '' : d) + 't)^{' + (p + 1) + '} + C$.',
        'So $Q(t) = ' + qd(cc) + '(' + V0 + ' + ' + (d === 1 ? '' : d) + 't) + C(' + V0 + ' + ' + (d === 1 ? '' : d) + 't)^{-' + p + '}$, and $Q(0) = ' + qd(Q00) + '$ gives $C = ' + Q00.sub(cc.mul(V0)).mul(Math.pow(V0, p)).toTex() + '$.',
        'At $t = ' + Tf + '$: $Q = ' + qd(cc) + '\\cdot ' + Vmax + T.signed(Q00.sub(cc.mul(V0))) + '\\left(\\frac{' + V0 + '}{' + Vmax + '}\\right)^{' + p + '} = ' + Qfull.toTex() + '$ g.'],
      hint: 'The volume is not constant here: use $V(t)$ in the outflow concentration $Q/V(t)$.'
    };
  });

  // ---------- de.growth-cooling ----------
  G('de.growth-cooling', function (R, ctx) {
    var kind = pickKind(R, ctx, ['half', 'model'], ['cool2', 'cool2', 'half', 'formula'], ['time', 'formula', 'cool2', 'kfind']);
    if (kind === 'half') {
      var grow = R.coin(), n = R.int(2, 4), h = R.pick([3, 5, 8, 10, 12, 20]);
      if (grow) { var P0 = R.pick([100, 250, 500, 1000, 40]); return { q: 'A bacteria culture grows at a rate proportional to its size, $P\' = kP$, and doubles every ' + h + ' hours. It starts with ' + P0 + ' cells. How many cells are there after ' + n * h + ' hours?', a: num(P0 * Math.pow(2, n)),
        steps: ['$P\' = kP$ gives $P(t) = P_0e^{kt}$: the population multiplies by the same factor in each equal time step.', 'Doubling every ' + h + ' hours means $P(t) = ' + P0 + '\\cdot 2^{t/' + h + '}$.', 'After ' + n * h + ' hours, $t/' + h + ' = ' + n + '$ doublings: $' + P0 + '\\cdot 2^{' + n + '} = ' + P0 * Math.pow(2, n) + '$.'], hint: 'How many doubling times fit into the time given?' }; }
      var A0 = R.pick([80, 160, 400, 64, 96, 200]);
      return { q: 'A radioactive isotope decays at a rate proportional to the amount present and has a half-life of ' + h + ' years. A sample starts with ' + A0 + ' mg. How much remains after ' + n * h + ' years?', a: num(q(A0, Math.pow(2, n)).toPlain()), unit: 'mg',
        steps: ['$A\' = -kA$ gives $A(t) = A_0e^{-kt}$; every half-life multiplies the amount by $\\frac{1}{2}$.', 'So $A(t) = ' + A0 + '\\left(\\frac{1}{2}\\right)^{t/' + h + '}$.', 'After ' + n * h + ' years: $' + A0 + '\\left(\\frac{1}{2}\\right)^{' + n + '} = ' + q(A0, Math.pow(2, n)).toTex() + '$ mg.'], hint: 'How many half-lives have passed?' };
    }
    var Ta = R.pick([20, 22, 25, 18]), warm = R.chance(0.25), rr = R.pick([q(1, 2), q(3, 4), q(2, 3), q(4, 5)]), dd = Number(rr.d) * Number(rr.d);
    var hot = { 4: [40, 48, 60, 64, 72, 80], 9: [45, 54, 63, 72], 16: [48, 64, 80], 25: [50, 75] }[dd], cold = { 4: [-16, -12], 9: [-18], 16: [-16], 25: [-25] }[dd];
    var T0 = Ta + (warm ? R.pick(cold) : R.pick(hot));
    var D0 = q(T0 - Ta), t1 = R.pick([5, 10, 15, 20]), T1 = q(Ta).add(D0.mul(rr)), obj = warm ? R.pick(['A cold drink', 'A carton of milk', 'A chilled bottle']) : R.pick(['A cup of coffee', 'A bowl of soup', 'A metal rod', 'A pie']);
    var setup = obj + ' at ' + T0 + '°C is placed in a room kept at ' + Ta + '°C. After ' + t1 + ' minutes it is ' + qdt(T1) + '°C.';
    var model = ['Newton\'s law of cooling: $T\' = -k(T - ' + Ta + ')$. The difference $D = T - ' + Ta + '$ satisfies $D\' = -kD$, so $D$ decays exponentially.',
      '$T(t) = ' + Ta + T.signed(D0) + 'e^{-kt}$. From the data, $e^{-' + t1 + 'k} = \\frac{' + qd(T1) + ' - ' + Ta + '}{' + T0 + ' - ' + Ta + '} = ' + rr.toTex() + '$.'];
    var solPl = Ta + (D0.sign() < 0 ? ' - ' : ' + ') + D0.abs() + '*(' + rr.toPlain() + ')^(t/' + t1 + ')';
    chk({ topic: 'de.growth-cooling', kind: 'cool', Ta: Ta, T0: T0, t1: t1, T1: T1.toNumber(), ans: solPl });
    if (kind === 'model') {
      var wrongs = ["$T' = -kT$", "$T' = -k(T + " + Ta + ')$', "$T' = k(" + Ta + ' - T)^{2}$'];
      return { q: obj + ' at ' + T0 + '°C sits in a room at ' + Ta + '°C. Which equation models its temperature $T(t)$ (with $k > 0$)?', a: mc(R, "$T' = -k(T - " + Ta + ')$', wrongs),
        steps: ['Newton\'s law of cooling: the rate of change is proportional to the difference between the object and its surroundings.', 'So $T\' = -k(T - ' + Ta + ')$. When $T > ' + Ta + '$ the object cools; when $T < ' + Ta + '$ it warms; at $T = ' + Ta + '$ it stays put.', '$T\' = -kT$ would drive the temperature to 0°C, ignoring the room.'],
        hint: 'What temperature does the object settle at? The rate should be zero there.' };
    }
    if (kind === 'cool2') {
      var m2 = R.pick([2, 3]), Tm = q(Ta).add(D0.mul(rr.pow(m2)));
      return { q: setup + ' What is its temperature after ' + m2 * t1 + ' minutes?', a: num(Tm.toPlain(), { tol: 0.01 }), unit: '°C',
        steps: model.concat(['After ' + m2 * t1 + ' minutes: $e^{-' + m2 * t1 + 'k} = \\left(' + rr.toTex() + '\\right)^{' + m2 + '} = ' + rr.pow(m2).toTex() + '$.', '$T = ' + Ta + T.signed(D0) + '\\cdot ' + rr.pow(m2).toTex() + ' = ' + Tm.toTex() + '$°C.']),
        hint: 'The difference from room temperature shrinks by the same factor every ' + t1 + ' minutes.' };
    }
    if (kind === 'formula') {
      return { q: setup + ' Find a formula for its temperature $T(t)$ after $t$ minutes.', a: ex(solPl),
        steps: model.concat(['So $e^{-kt} = \\left(e^{-' + t1 + 'k}\\right)^{t/' + t1 + '} = \\left(' + rr.toTex() + '\\right)^{t/' + t1 + '}$.', '$T(t) = ' + Ta + T.signed(D0) + '\\left(' + rr.toTex() + '\\right)^{t/' + t1 + '}$ (the same as $' + Ta + T.signed(D0) + 'e^{-kt}$ with $k = \\frac{1}{' + t1 + '}\\ln ' + rr.inv().toTex() + '$).']),
        hint: 'Write $T = T_{\\text{room}} + (T_0 - T_{\\text{room}})e^{-kt}$ and use the data to find $e^{-' + t1 + 'k}$.' };
    }
    if (kind === 'kfind') {
      return { q: setup + ' Find the constant $k$ in $T\' = -k(T - ' + Ta + ')$ (per minute; exact, or to 4 decimal places).', a: num('ln(' + rr.inv().toPlain() + ')/' + t1, { tol: 0.00006 }),
        steps: model.concat(['Take logarithms: $-' + t1 + 'k = \\ln ' + rr.toTex() + '$, so $k = \\frac{1}{' + t1 + '}\\ln ' + rr.inv().toTex() + ' \\approx ' + (Math.log(rr.inv().toNumber()) / t1).toFixed(4) + '$.']),
        hint: 'Solve $e^{-' + t1 + 'k} = ' + rr.toTex() + '$ for $k$ with a logarithm.' };
    }
    // time to reach a temperature
    var m3 = R.pick([2, 3]), target = q(Ta).add(D0.mul(rr.pow(m3))), exactInt = R.chance(0.6);
    if (!exactInt) { var fr2 = q(1, 3); if (rr.eq(q(1, 2))) fr2 = q(1, 3); else fr2 = q(1, 2); target = q(Ta).add(D0.mul(fr2)); var tv = t1 + '*ln(' + fr2.inv().toPlain() + ')/ln(' + rr.inv().toPlain() + ')';
      chk({ topic: 'de.growth-cooling', kind: 'time', Ta: Ta, T0: T0, t1: t1, T1: T1.toNumber(), target: target.toNumber(), ans: +ML.evalPlain(tv) });
      return { q: setup + ' When will it reach ' + qdt(target) + '°C? (Minutes, exact or to the nearest 0.1.)', a: num(tv, { tol: 0.06 }), unit: 'min',
        steps: model.concat(['We need $' + Ta + T.signed(D0) + 'e^{-kt} = ' + qd(target) + '$, that is, $e^{-kt} = ' + fr2.toTex() + '$.', 'Since $e^{-kt} = \\left(' + rr.toTex() + '\\right)^{t/' + t1 + '}$: $\\frac{t}{' + t1 + '}\\ln ' + rr.toTex() + ' = \\ln ' + fr2.toTex() + '$.', '$t = ' + t1 + '\\cdot\\frac{\\ln ' + fr2.inv().toTex() + '}{\\ln ' + rr.inv().toTex() + '} \\approx ' + (+ML.evalPlain(tv)).toFixed(1) + '$ minutes.']),
        hint: 'Isolate the exponential, then take logarithms.' }; }
    chk({ topic: 'de.growth-cooling', kind: 'time', Ta: Ta, T0: T0, t1: t1, T1: T1.toNumber(), target: target.toNumber(), ans: m3 * t1 });
    return { q: setup + ' When will it reach ' + qdt(target) + '°C?', a: num(m3 * t1, { tol: 0.01 }), unit: 'min',
      steps: model.concat(['We need $e^{-kt} = \\frac{' + qd(target.sub(Ta)) + '}{' + qd(D0) + '} = ' + rr.pow(m3).toTex() + ' = \\left(' + rr.toTex() + '\\right)^{' + m3 + '}$.', 'Each ' + t1 + ' minutes multiplies the difference by $' + rr.toTex() + '$, so it takes ' + m3 + ' of those periods: $t = ' + m3 * t1 + '$ minutes.']),
      hint: 'Compare the needed factor with the factor per ' + t1 + ' minutes.' };
  });

  // ---------- de.population-harvesting ----------
  G('de.population-harvesting', function (R, ctx) {
    var kind = pickKind(R, ctx, ['maxH', 'eq0'], ['eqH', 'stab', 'maxH'], ['fate', 'effort', 'eqH']);
    var K = R.pick([100, 1000, 200, 500]), r = R.pick([q(1, 2), q(1), q(2), q(1, 5)]), sc = K / 100;
    var pair = R.pick([[10, 90], [20, 80], [30, 70], [40, 60], [25, 75]]), p1 = pair[0] * sc, p2 = pair[1] * sc, H = r.mul(p1 * p2).div(K);
    var rT = r.eq(1) ? '' : r.toTex(), eqn = "P' = " + rT + 'P\\left(1 - \\frac{P}{' + K + '}\\right)';
    chk({ topic: 'de.population-harvesting', kind: 'harv', r: r.toNumber(), K: K, H: H.toNumber(), roots: [p1, p2] });
    var eqSteps = ['Equilibria: $' + rT + 'P\\left(1 - \\frac{P}{' + K + '}\\right) - ' + qd(H) + ' = 0$.', 'Multiply by $' + q(-K).div(r).toTex() + '$: $P^{2} - ' + K + 'P + ' + H.mul(K).div(r).toString() + ' = 0$, so $(P - ' + p1 + ')(P - ' + p2 + ') = 0$.', 'Equilibria: $P = ' + p1 + '$ and $P = ' + p2 + '$.'];
    if (kind === 'eq0') return { q: 'Find the equilibrium populations of the logistic model $' + eqn + '$ (no harvesting).', a: { t: 'set', v: ['0', String(K)] }, steps: ["Set $P' = 0$: $" + rT + 'P\\left(1 - \\frac{P}{' + K + '}\\right) = 0$.', 'So $P = 0$ or $P = ' + K + '$ (the carrying capacity).'], hint: 'Set the right side to 0.' };
    if (kind === 'maxH') {
      var Hm = r.mul(K).div(4);
      return { q: 'A fish population follows $' + eqn + ' - H$ (in thousands of fish per year), where $H$ is a constant harvest. What is the largest $H$ for which the population has an equilibrium?', a: num(Hm.toPlain()),
        steps: ['The growth term $f(P) = ' + rT + 'P\\left(1 - \\frac{P}{' + K + '}\\right)$ is a downward parabola with roots $0$ and $' + K + '$.', 'Its peak is halfway, at $P = ' + K / 2 + '$: $f(' + K / 2 + ') = ' + r.toTex() + '\\cdot ' + K / 2 + '\\cdot\\frac{1}{2} = ' + Hm.toTex() + '$.', 'An equilibrium needs $f(P) = H$ for some $P$, so $H \\le ' + Hm.toTex() + '$. The largest sustainable harvest is $' + Hm.toTex() + '$.'],
        hint: 'Equilibria exist when the parabola $f(P)$ reaches the height $H$. Where is its peak?' };
    }
    var eqnH = eqn + ' - ' + qd(H);
    if (kind === 'eqH') return { q: 'Find the equilibria of the harvesting model $' + eqnH + '$.', a: { t: 'set', v: [String(p1), String(p2)] }, steps: eqSteps, hint: 'Set the right side to 0 and clear the fractions to get a quadratic.' };
    if (kind === 'stab') {
      var which = R.coin() ? p2 : p1;
      return { q: 'For $' + eqnH + '$, the equilibria are $P = ' + p1 + '$ and $P = ' + p2 + '$. Is $P = ' + which + '$ stable or unstable?', a: mc(R, which === p2 ? 'stable' : 'unstable', [which === p2 ? 'unstable' : 'stable', 'semi-stable']),
        steps: ['$f(P) = ' + rT + 'P\\left(1 - \\frac{P}{' + K + '}\\right) - ' + qd(H) + ' = -\\frac{' + r.toTex() + '}{' + K + '}(P - ' + p1 + ')(P - ' + p2 + ')$.', 'Below ' + p1 + ': $f < 0$ (↓). Between ' + p1 + ' and ' + p2 + ': $f > 0$ (↑). Above ' + p2 + ': $f < 0$ (↓).', which === p2 ? 'Populations near ' + p2 + ' move toward it from both sides: stable.' : 'Populations near ' + p1 + ' move away from it on both sides: unstable. It is the threshold below which the population collapses.'],
        hint: 'Check the sign of $P\'$ on each side of the equilibrium.' };
    }
    if (kind === 'fate') {
      var zone = R.int(0, 2), P0 = zone === 0 ? p1 / 2 : zone === 1 ? (p1 + p2) / 2 : p2 + p1, ans = zone === 0 ? 'It dies out: $P$ reaches 0' : 'It approaches $P = ' + p2 + '$';
      var choices = ['It dies out: $P$ reaches 0', 'It approaches $P = ' + p2 + '$', 'It approaches $P = ' + p1 + '$', 'It grows without bound'];
      chk({ topic: 'de.population-harvesting', kind: 'fate', r: r.toNumber(), K: K, H: H.toNumber(), P0: P0, ans: zone === 0 ? 0 : p2 });
      return { q: 'For $' + eqnH + '$, what happens to a population that starts at $P(0) = ' + P0 + '$?', a: mc(R, ans, choices.filter(function (c) { return c !== ans; })),
        steps: eqSteps.concat(['$P\' < 0$ below ' + p1 + ', $P\' > 0$ between ' + p1 + ' and ' + p2 + ', and $P\' < 0$ above ' + p2 + '.', zone === 0 ? 'Starting below the threshold ' + p1 + ', the population keeps shrinking, and with the constant harvest it reaches 0 in finite time.' : 'Starting at ' + P0 + ', the population moves ' + (zone === 1 ? 'up' : 'down') + ' toward the stable equilibrium $P = ' + p2 + '$.']),
        hint: 'Find the equilibria and the sign of $P\'$ in the interval that contains $P(0)$.' };
    }
    // constant-effort harvesting: P' = rP(1 - P/K) - E P
    var Eh = r.mul(R.pick([q(1, 4), q(1, 2), q(3, 4)])), Pstar = q(K).mul(q(1).sub(Eh.div(r))), ask = R.pick(['eq', 'yield']);
    var eqE = eqn + T.coef(Eh.neg(), 'P', false);
    chk({ topic: 'de.population-harvesting', kind: 'effort', r: r.toNumber(), K: K, E: Eh.toNumber(), ans: Pstar.toNumber() });
    if (ask === 'eq') return { q: 'With constant-effort harvesting, $' + eqE + '$. Find the positive equilibrium population.', a: num(Pstar.toPlain()),
      steps: ['Factor out $P$: $P\\left[' + rT + '\\left(1 - \\frac{P}{' + K + '}\\right) - ' + Eh.toTex() + '\\right] = 0$.', 'Besides $P = 0$: $1 - \\frac{P}{' + K + '} = ' + (r.eq(1) ? '' : '\\frac{' + Eh.toTex() + '}{' + r.toTex() + '} = ') + Eh.div(r).toTex() + '$.', '$P = ' + K + '\\left(1 - ' + Eh.div(r).toTex() + '\\right) = ' + Pstar.toTex() + '$.'],
      hint: 'Factor out $P$ and set the bracket to 0.' };
    return { q: 'With constant-effort harvesting, $' + eqE + '$. At the positive equilibrium, what is the sustained yield $' + T.mono(Eh, 'P') + '$ (fish harvested per year)?', a: num(Eh.mul(Pstar).toPlain()),
      steps: ['Positive equilibrium: $' + rT + '\\left(1 - \\frac{P}{' + K + '}\\right) = ' + Eh.toTex() + '$, so $P = ' + K + '\\left(1 - ' + Eh.div(r).toTex() + '\\right) = ' + Pstar.toTex() + '$.', 'Yield $= ' + (Eh.eq(1) ? '' : Eh.toTex() + '\\cdot ') + Pstar.toTex() + ' = ' + Eh.mul(Pstar).toTex() + '$.'],
      hint: 'Find the positive equilibrium first; the harvest there is $EP$.' };
  });

  // ---------- de.motion-circuits ----------
  var DRAG = [[2, 4], [5, 7], [10, 2], [1, '0.5'], [4, 8], [70, 14], [60, 12], [80, 16], [5, 14], [10, 7], [2, 7], [3, 6]];
  G('de.motion-circuits', function (R, ctx) {
    var kind = pickKind(R, ctx, ['vT', 'iss'], ['vt', 'qt', 'it'], ['half', 'qt', 'discharge', 'vt']);
    if (kind === 'vT' || kind === 'vt' || kind === 'half') {
      var mk = R.pick(DRAG), m = q(mk[0]), k = q(mk[1]), g = q('9.8'), vT = m.mul(g).div(k), rate = k.div(m), v0 = kind === 'vt' && R.chance(0.4) ? q(R.pick([2, 5, 10])) : q(0);
      var setup = 'An object of mass ' + qd(m) + ' kg falls from rest' + (v0.isZero() ? '' : ' with initial downward speed ' + qd(v0) + ' m/s') + '. Air resistance is $' + qd(k) + 'v$ newtons, where $v$ is its downward velocity in m/s. Use $g = 9.8$ m/s².';
      setup = setup.replace('falls from rest with initial', 'is thrown down with initial');
      var model = ['Newton\'s second law (down positive): $' + T.coef(m, "v'") + ' = ' + (m.eq(1) ? '9.8' : qd(m) + '(9.8)') + ' - ' + qd(k) + 'v$, so $v\' = 9.8 - ' + qd(rate) + 'v$.',
        'Terminal velocity: $v\' = 0$ when $v = \\frac{' + (m.eq(1) ? '9.8' : qd(m) + '(9.8)') + '}{' + qd(k) + '} = ' + qd(vT) + '$ m/s.'];
      var sol = lc([tm(vT), tm(v0.sub(vT), B.e(rate.neg()))]);
      chk({ topic: 'de.motion-circuits', kind: 'ode', ode: [1, rate.toNumber()], g: 9.8, ic: [0, v0.toNumber()], ans: sol.pl, dom: [0, 5] });
      if (kind === 'vT') return { q: setup + ' What is its terminal velocity?', a: num(vT.toPlain()), unit: 'm/s', steps: model.concat(['The velocity approaches ' + qd(vT) + ' m/s, where gravity and drag balance.']), hint: 'Terminal velocity is the equilibrium: set $v\' = 0$.' };
      if (kind === 'vt') return { q: setup + ' Find its velocity $v(t)$.', a: ex(sol.pl), steps: model.concat(['Solve the linear equation: $v = ' + qd(vT) + ' + Ce^{' + kv(rate.neg()) + '}$; $v(0) = ' + qd(v0) + '$ gives $C = ' + qd(v0.sub(vT)) + '$.', '$v(t) = ' + sol.tex + '$.']), hint: 'Write $mv\' = mg - kv$, find the equilibrium, and add a decaying exponential.' };
      var fr = R.pick([2, 10]), tv = qpl(rate.inv()) + 'ln(' + fr + ')';
      return { q: setup + ' How long until it reaches ' + (fr === 2 ? 'half' : '90%') + ' of its terminal velocity? (Seconds, exact or to the nearest 0.01.)', a: num(tv, { tol: 0.006 }), unit: 's',
        steps: model.concat(['From rest, $v(t) = ' + qd(vT) + '\\left(1 - e^{' + kv(rate.neg()) + '}\\right)$.', 'Set $v = ' + (fr === 2 ? '\\frac{1}{2}' : '0.9') + 'v_T$: $e^{' + kv(rate.neg()) + '} = ' + (fr === 2 ? '\\frac{1}{2}' : '0.1') + '$.', '$t = ' + qd(rate.inv()) + '\\ln ' + fr + ' \\approx ' + (rate.inv().toNumber() * Math.log(fr)).toFixed(2) + '$ s.']),
        hint: 'Solve for $v(t)$ from rest, then set it equal to the fraction of $v_T$.' };
    }
    if (kind === 'iss' || kind === 'it') {
      var Rr = R.pick([2, 4, 5, 10, 20]), Lh = R.pick([q(1), q(2), q('0.5'), q('0.1')]), E = R.pick([6, 10, 12, 20, 24]), iss = q(E, Rr), rt = q(Rr).div(Lh);
      var solI = lc([tm(iss), tm(iss.neg(), B.e(rt.neg()))]);
      chk({ topic: 'de.motion-circuits', kind: 'ode', ode: [Lh.toNumber(), Rr], g: E, ic: [0, 0], ans: solI.pl, dom: [0, 1] });
      var stp = ['Kirchhoff\'s voltage law: $' + T.coef(Lh, "i'") + T.coef(Rr, 'i', false) + ' = ' + E + '$ (the inductor drop $Li\'$ plus the resistor drop $Ri$ equals the battery voltage).', 'Steady state: $i\' = 0$ gives $i = \\frac{' + E + '}{' + Rr + '} = ' + qd(iss) + '$ A.'];
      if (kind === 'iss') return { q: 'An RL circuit has a ' + E + ' V battery, a ' + Rr + ' Ω resistor and a ' + qd(Lh) + ' H inductor. What current does it approach after the switch is closed?', a: num(iss.toPlain()), unit: 'A', steps: stp, hint: 'In the long run the current stops changing, so $i\' = 0$.' };
      return { q: 'An RL circuit has a ' + E + ' V battery, a ' + Rr + ' Ω resistor and a ' + qd(Lh) + ' H inductor, with $i(0) = 0$. Find the current $i(t)$ in amperes.', a: ex(solI.pl),
        steps: stp.concat(['Standard form: $i\'' + T.coef(rt, 'i', false) + ' = ' + qd(q(E).div(Lh)) + '$, so $i = ' + qd(iss) + ' + Ce^{' + kv(rt.neg()) + '}$.', '$i(0) = 0$ gives $C = ' + qd(iss.neg()) + '$: $i(t) = ' + solI.tex + '$.']), hint: 'Write $Li\' + Ri = E$, find the steady current, and fit the initial condition.' };
    }
    var RC = R.pick([[10, '0.01'], [100, '0.001'], [20, '0.05'], [5, '0.02'], [50, '0.01'], [1000, '0.0002']]), Rv = RC[0], Cv = q(RC[1]), tau = Cv.mul(Rv), E2 = R.pick([6, 9, 12, 24]);
    if (kind === 'qt') {
      var qss = Cv.mul(E2), solQ = lc([tm(qss), tm(qss.neg(), B.e(tau.inv().neg()))]);
      chk({ topic: 'de.motion-circuits', kind: 'ode', ode: [Rv, Cv.inv().toNumber()], g: E2, ic: [0, 0], ans: solQ.pl, dom: [0, 1] });
      return { q: 'An RC circuit has a ' + E2 + ' V battery, a ' + Rv + ' Ω resistor and a ' + qd(Cv) + ' F capacitor that starts uncharged. Find the charge $q(t)$ in coulombs.', a: ex(solQ.pl),
        steps: ['Kirchhoff: $' + Rv + "q' + \\frac{q}{" + qd(Cv) + '} = ' + E2 + '$ (resistor drop $Rq\'$ plus capacitor drop $q/C$).', 'Divide by ' + Rv + ': $q\'' + T.coef(tau.inv(), 'q', false) + ' = ' + qd(q(E2, Rv)) + '$. Time constant $RC = ' + qd(tau) + '$ s.', 'Steady state $q = CE = ' + qd(qss) + '$ C, so $q = ' + qd(qss) + ' + Ae^{' + kv(tau.inv().neg()) + '}$ for some constant $A$.', '$q(0) = 0$ gives $A = ' + qd(qss.neg()) + '$, so $q(t) = ' + solQ.tex + '$.'],
        hint: 'Use $Rq\' + q/C = E$; the charge approaches $CE$ with time constant $RC$.' };
    }
    var q0 = Cv.mul(E2), half = R.pick([2, 4]);
    chk({ topic: 'de.motion-circuits', kind: 'root', expr: q0.toNumber() + '*e^(-t/' + tau.toNumber() + ')', target: q0.toNumber() / half, ans: tau.toNumber() * Math.log(half) });
    return { q: 'A ' + qd(Cv) + ' F capacitor charged to ' + E2 + ' V discharges through a ' + Rv + ' Ω resistor (no battery). How long until its charge falls to ' + (half === 2 ? 'half' : 'one quarter') + ' of its starting value? (Seconds, exact or to 3 decimal places.)', a: num(qpl(tau) + 'ln(' + half + ')', { tol: 0.0006 }), unit: 's',
      steps: ['With no battery: $' + Rv + "q' + \\frac{q}{" + qd(Cv) + '} = 0$, so $q = q_0e^{-t/(RC)}$ with $RC = ' + qd(tau) + '$ s.', 'Set $e^{-t/' + qd(tau) + '} = \\frac{1}{' + half + '}$: $t = ' + qd(tau) + '\\ln ' + half + ' \\approx ' + (tau.toNumber() * Math.log(half)).toFixed(3) + '$ s.'],
      hint: 'The charge decays like $e^{-t/(RC)}$.' };
  });

// ---- u3.js
  // =====================================================================================================
  // UNIT 3: Second-Order Linear Equations (part 1)
  // =====================================================================================================

  // ---- basis functions with their derivatives at t = 0 (exact): d(j) = (d/dt)^j f at 0 ----
  function cxMul(a, b) { return [a[0].mul(b[0]).sub(a[1].mul(b[1])), a[0].mul(b[1]).add(a[1].mul(b[0]))]; }
  function cxPow(z, j) { var r = [q(1), q(0)]; for (var i = 0; i < j; i++) r = cxMul(r, z); return r; }
  function fall(j, m) { var r = 1; for (var i = 0; i < m; i++) r *= (j - i); return r; } // j(j-1)…(j-m+1)
  var BF = {
    exp: function (r, v) { r = q(r); return { b: B.e(r, v), d: function (j) { return r.pow(j); }, pl0: 'e^(' + kv(r, v || 't') + ')' }; },
    texp: function (r, m, v) { r = q(r); m = m === undefined ? 1 : m; return { b: B.mul(B.pow(m, v || 't'), B.e(r, v)), d: function (j) { return j < m ? q(0) : q(fall(j, m)).mul(r.isZero() ? (j === m ? q(1) : q(0)) : r.pow(j - m)); } }; },
    ecos: function (al, be, v) { al = q(al); be = q(be); return { b: B.mul(B.e(al, v), B.cos(be, v)), d: function (j) { return cxPow([al, be], j)[0]; } }; },
    esin: function (al, be, v) { al = q(al); be = q(be); return { b: B.mul(B.e(al, v), B.sin(be, v)), d: function (j) { return cxPow([al, be], j)[1]; } }; },
    one: function () { return { b: ONE, d: function (j) { return q(j === 0 ? 1 : 0); } }; }
  };
  function icVals(cs, fs, n) { var out = []; for (var j = 0; j < n; j++) { var s = q(0); cs.forEach(function (c, i) { s = s.add(q(c).mul(fs[i].d(j))); }); out.push(s); } return out; }
  // texp with r = 0 is t^m: derivatives at 0 are m! at j = m
  function charFactorTex(lead, roots) { // a(r - r1)(r - r2) with rational roots shown as (2r - 1)
    var L = q(lead), parts = [];
    roots.forEach(function (x) { x = q(x); if (x.isZero()) { parts.push('r'); return; } if (x.isInt()) { parts.push('(' + T.lin(1, 'r', x.neg()) + ')'); return; } var d = Number(x.d); L = L.div(d); parts.push('(' + T.lin(d, 'r', x.mul(d).neg()) + ')'); });
    var out = [], seen = {}; parts.forEach(function (p) { seen[p] = (seen[p] || 0) + 1; });
    Object.keys(seen).forEach(function (p) { out.push(seen[p] > 1 ? (p === 'r' ? 'r' : p) + '^{' + seen[p] + '}' : p); });
    return (L.eq(1) ? '' : L.eq(-1) ? '-' : L.toTex()) + out.join('');
  }
  // a homogeneous constant-coefficient second-order equation built from its roots
  function mkHom(R, type, lead) {
    lead = lead || 1; var o = { type: type, lead: lead };
    if (type === 'real') {
      var r1, r2;
      if (lead === 1) { r1 = R.int(-5, 4); r2 = R.intNot(-5, 4, [r1, 0].concat(r1 === 0 ? [] : [])); if (r1 === 0 && r2 === 0) r2 = -2; }
      else { r1 = R.nz(-3, 3); var pnum = R.pick(lead === 2 ? [1, -1, 3, -3] : [1, -1, 2, -2]); r2 = q(pnum, lead); }
      o.r1 = q(r1); o.r2 = q(r2); var s = o.r1.add(o.r2), p = o.r1.mul(o.r2);
      o.cs = [q(lead), s.mul(lead).neg(), p.mul(lead)];
      o.f = [BF.exp(o.r1), BF.exp(o.r2)];
    } else if (type === 'rep') {
      var r = lead === 1 ? R.nz(-4, 3) : lead === 4 ? q(R.pick([1, -1]), 2) : q(R.pick([1, -1]), 3);
      o.r = q(r); o.cs = [q(lead), o.r.mul(-2 * lead), o.r.mul(o.r).mul(lead)];
      o.f = [BF.exp(o.r), BF.texp(o.r, 1)];
    } else {
      var al = lead === 1 ? R.pick([-3, -2, -1, -1, 0, 1, -2]) : q(R.pick([-1, 1, -1]), 2), be = R.int(1, 4);
      o.al = q(al); o.be = q(be); o.cs = [q(lead), o.al.mul(-2 * lead), o.al.mul(o.al).add(o.be.mul(o.be)).mul(lead)];
      o.f = [BF.ecos(o.al, o.be), BF.esin(o.al, o.be)];
    }
    o.lhs = odeLhs(o.cs.map(function (c) { return c; }));
    o.charT = charTex(o.cs);
    return o;
  }
  function homSol(o, c1, c2) { // { tex, pl } of c1 f1 + c2 f2, tidy
    if (o.type === 'cx') return prodLc(B.e(o.al), [tm(c1, B.cos(o.be)), tm(c2, B.sin(o.be))]);
    if (o.type === 'rep') return prodLc(B.e(o.r), [tm(c1), tm(c2, B.pow(1))]);
    return lc([tm(c1, o.f[0].b), tm(c2, o.f[1].b)]);
  }
  function genTex(o) { // the general solution with c1, c2
    if (o.type === 'cx') return (o.al.isZero() ? '' : 'e^{' + kv(o.al) + '}') + '(c_1\\cos ' + kv(o.be) + ' + c_2\\sin ' + kv(o.be) + ')';
    if (o.type === 'rep') return '(c_1 + c_2t)e^{' + kv(o.r) + '}';
    return 'c_1' + (o.r1.isZero() ? '' : 'e^{' + kv(o.r1) + '}') + ' + c_2' + (o.r2.isZero() ? '' : 'e^{' + kv(o.r2) + '}');
  }
  function rootSteps(o) {
    var st = ['Try $y = e^{rt}$: the characteristic equation is $' + o.charT + ' = 0$.'];
    if (o.type === 'real') st.push('Factor: $' + charFactorTex(o.lead, [o.r1, o.r2]) + ' = 0$, so $r = ' + o.r1.toTex() + '$ and $r = ' + o.r2.toTex() + '$ (two distinct real roots).');
    else if (o.type === 'rep') st.push('Factor: $' + charFactorTex(o.lead, [o.r, o.r]) + ' = 0$, a repeated root $r = ' + o.r.toTex() + '$. The second solution is $te^{' + kv(o.r) + '}$.');
    else { var a = o.cs[0], b = o.cs[1], c = o.cs[2], disc = b.mul(b).sub(a.mul(c).mul(4)); st.push('Quadratic formula: $r = \\frac{' + (b.isZero() ? '' : b.neg().toTex()) + ' \\pm \\sqrt{' + disc.toTex() + '}}{' + a.mul(2).toTex() + '} = ' + (o.al.isZero() ? '' : o.al.toTex() + ' \\pm ') + (o.al.isZero() ? '\\pm ' : '') + (o.be.eq(1) ? '' : o.be.toTex()) + 'i$, so $\\alpha = ' + o.al.toTex() + '$ and $\\beta = ' + o.be.toTex() + '$.'); }
    st.push('General solution: $y = ' + genTex(o) + '$.');
    return st;
  }
  function ivpSteps(o, c1, c2, y0, v0) {
    var st = rootSteps(o);
    if (o.type === 'real') st.push("Initial conditions: $y(0) = c_1 + c_2 = " + y0.toTex() + "$ and $y'(0) = " + T.terms([[o.r1, 'c_1'], [o.r2, 'c_2']]) + ' = ' + v0.toTex() + '$.', 'Solve: $c_1 = ' + q(c1).toTex() + '$, $c_2 = ' + q(c2).toTex() + '$.');
    else if (o.type === 'rep') st.push('$y(0) = c_1 = ' + y0.toTex() + "$. Since $y' = c_2e^{" + kv(o.r) + '}' + T.coef(o.r, '(c_1 + c_2t)e^{' + kv(o.r) + '}', false) + "$, $y'(0) = c_2" + T.coef(o.r, 'c_1', false) + ' = ' + v0.toTex() + '$, so $c_2 = ' + q(c2).toTex() + '$.');
    else st.push('$y(0) = c_1 = ' + y0.toTex() + "$, and $y'(0) = " + T.terms([[o.al, 'c_1'], [o.be, 'c_2']]) + ' = ' + v0.toTex() + '$, so $c_2 = ' + q(c2).toTex() + '$.');
    st.push('$y = ' + homSol(o, c1, c2).tex + '$.');
    return st;
  }
  function pickC(R, o) { // nice constants, then the initial values they need
    var c1 = R.int(-3, 4), c2 = R.nz(-3, 3);
    if (o.type === 'real' && o.lead !== 1) c2 = R.nz(-2, 2) * o.lead;
    if (o.type === 'cx' && !o.al.isInt()) c1 = R.nz(-2, 2) * 2;
    if (o.type === 'rep' && !o.r.isInt()) c1 = R.nz(-2, 2) * Number(o.r.d);
    if (c1 === 0 && c2 === 0) c1 = 1;
    var ic = icVals([c1, c2], o.f, 2);
    return { c1: q(c1), c2: q(c2), y0: ic[0], v0: ic[1] };
  }
  function ivpQ(o, k) { return 'Solve $' + o.lhs + ' = 0$ with $y(0) = ' + k.y0.toTex() + "$ and $y'(0) = " + k.v0.toTex() + '$.'; }
  function recIVP(topic, o, k, ans, g) { chk({ topic: topic, kind: 'ivp', ode: o.cs.map(function (c) { return c.toNumber(); }), g: g || 0, ic: [0, k.y0.toNumber(), k.v0.toNumber()], ans: ans }); }

  // ---------- de.second-order-intro ----------
  G('de.second-order-intro', function (R, ctx) {
    var kind = pickKind(R, ctx, ['tf'], ['ivp', 'ivp', 'tf'], ['nonhom', 'ivp']);
    var r1 = R.nz(-4, 3), r2 = R.intNot(-4, 3, [0, r1]), b = -(r1 + r2), c = r1 * r2, eqT = odeLhs([1, b, c]) + ' = 0';
    var y1 = 'e^{' + kv(r1) + '}', y2 = 'e^{' + kv(r2) + '}', y1p = 'e^(' + kv(r1) + ')', y2p = 'e^(' + kv(r2) + ')';
    var given = 'The functions $y_1 = ' + y1 + '$ and $y_2 = ' + y2 + '$ are solutions of $' + eqT + '$.';
    if (kind === 'tf') {
      var A = R.nz(-5, 5), Bv = R.nz(-5, 5), opt = R.int(0, 3), cand, cpl, truth, why;
      if (opt === 0) { cand = T.terms([[A, y1], [Bv, y2]]); cpl = A + '*' + y1p + ' + (' + Bv + ')*' + y2p; truth = true; why = 'The equation is linear and homogeneous, so any combination $c_1y_1 + c_2y_2$ is a solution (superposition).'; }
      else if (opt === 1) { cand = y1 + ' \\cdot ' + y2 + ' = e^{' + kv(r1 + r2) + '}'; cpl = 'e^(' + kv(r1 + r2) + ')'; truth = false; why = 'Products are not covered by superposition. Here $e^{' + kv(r1 + r2) + '}$ would need $r = ' + (r1 + r2) + '$ to be a root of $' + charTex([1, b, c]) + '$, and it is not.'; }
      else if (opt === 2) { cand = y1 + ' + ' + Math.abs(A); cpl = y1p + ' + ' + Math.abs(A); truth = false; why = 'Adding a constant breaks it: $L[' + Math.abs(A) + '] = ' + (c * Math.abs(A)) + ' \\ne 0$, so $L[y_1 + ' + Math.abs(A) + '] = ' + (c * Math.abs(A)) + '$.'; }
      else { cand = T.coef(A, y1) + ' - ' + y2; cpl = A + '*' + y1p + ' - ' + y2p; truth = true; why = 'It is a linear combination of $y_1$ and $y_2$, so it is a solution by superposition.'; }
      chk({ topic: 'de.second-order-intro', kind: 'tf', res: 'y2 + (' + b + ')*y1 + (' + c + ')*y', ans: cpl, truth: truth });
      return { q: given + ' True or false: $y = ' + cand + '$ is also a solution.', a: tf(truth), steps: ['For a linear homogeneous equation $L[y] = 0$, $L[c_1y_1 + c_2y_2] = c_1L[y_1] + c_2L[y_2] = 0$.', why, truth ? 'True.' : 'False.'], hint: 'Superposition covers sums and constant multiples of solutions, nothing else.' };
    }
    if (kind === 'ivp') {
      var fam = R.int(1, 3), o, gv, k, st, ans, qT;
      if (fam === 1) { o = mkHom(R, 'real'); o.r1 = q(r1); o.r2 = q(r2); o.cs = [q(1), q(b), q(c)]; o.f = [BF.exp(r1), BF.exp(r2)]; o.lhs = odeLhs([1, b, c]); k = pickC(R, o); qT = given; }
      else { var w = R.int(1, 4); o = { type: 'cx', al: q(0), be: q(w), cs: [q(1), q(0), q(w * w)], f: [BF.ecos(0, w), BF.esin(0, w)], lhs: odeLhs([1, 0, w * w]) }; k = pickC(R, o); qT = 'The functions $y_1 = \\cos ' + kv(w) + '$ and $y_2 = \\sin ' + kv(w) + '$ are solutions of $' + o.lhs + ' = 0$.'; }
      ans = homSol(o, k.c1, k.c2);
      recIVP('de.second-order-intro', o, k, ans.pl);
      var f1 = o.type === 'cx' ? '\\cos ' + kv(o.be) : 'e^{' + kv(o.r1) + '}', f2 = o.type === 'cx' ? '\\sin ' + kv(o.be) : 'e^{' + kv(o.r2) + '}';
      var d1 = o.type === 'cx' ? [q(1), q(0)] : [q(1), o.r1], d2 = o.type === 'cx' ? [q(0), o.be] : [q(1), o.r2];
      st = ['By superposition, $y = c_1' + f1 + ' + c_2' + f2 + '$ is a solution for any constants.',
        '$y(0) = ' + T.terms([[d1[0], 'c_1'], [d2[0], 'c_2']]) + ' = ' + k.y0.toTex() + "$ and $y'(0) = " + T.terms([[d1[1], 'c_1'], [d2[1], 'c_2']]) + ' = ' + k.v0.toTex() + '$.',
        'Solve: $c_1 = ' + k.c1.toTex() + '$ and $c_2 = ' + k.c2.toTex() + '$.', '$y = ' + ans.tex + '$.'];
      return { q: qT + ' Find the solution with $y(0) = ' + k.y0.toTex() + "$ and $y'(0) = " + k.v0.toTex() + '$.', a: ex(ans.pl), steps: st, hint: 'Write $y = c_1y_1 + c_2y_2$ and use the two initial conditions to find $c_1$ and $c_2$.' };
    }
    // nonhomogeneous: y = y_p + c1 y1 + c2 y2
    var Kp = R.nz(-3, 3), g = c * Kp, c1 = R.nz(-3, 3), c2 = R.int(-3, 3), y0 = Kp + c1 + c2, v0 = r1 * c1 + r2 * c2;
    var sol = lc([tm(Kp), tm(c1, B.e(r1)), tm(c2, B.e(r2))]);
    chk({ topic: 'de.second-order-intro', kind: 'ivp', ode: [1, b, c], g: g, ic: [0, y0, v0], ans: sol.pl });
    return { q: given.replace(eqT, odeLhs([1, b, c]) + ' = 0') + ' Also, $y_p = ' + Kp + '$ solves $' + odeLhs([1, b, c]) + ' = ' + g + '$. Find the solution of $' + odeLhs([1, b, c]) + ' = ' + g + '$ with $y(0) = ' + y0 + "$ and $y'(0) = " + v0 + '$.',
      a: ex(sol.pl),
      steps: ['Every solution of the nonhomogeneous equation is $y = y_p + c_1y_1 + c_2y_2$, because the difference of two solutions solves the homogeneous equation.', 'So $y = ' + Kp + ' + c_1' + y1 + ' + c_2' + y2 + '$.',
        '$y(0) = ' + Kp + ' + c_1 + c_2 = ' + y0 + "$ and $y'(0) = " + T.terms([[r1, 'c_1'], [r2, 'c_2']]) + ' = ' + v0 + '$.', 'Solve: $c_1 = ' + c1 + '$, $c_2 = ' + c2 + '$.', '$y = ' + sol.tex + '$.'],
      hint: 'General solution = particular solution + combination of $y_1$ and $y_2$. Then use the initial conditions.' };
  });

  // ---------- de.wronskian ----------
  G('de.wronskian', function (R, ctx) {
    var kind = pickKind(R, ctx, ['at', 'indep'], ['W', 'W', 'indep'], ['abel', 'W']);
    if (kind === 'abel') {
      var fam = R.int(1, 3), W0 = R.nz(-4, 5), eqT, pT, intT, ans, t0, pPl;
      if (fam === 1) { var k = R.pick([1, 2, 3, -1]), qq = R.nz(-4, 4); eqT = "t^{2}y''" + T.coef(k, 'ty\'', false) + T.coef(qq, 'y', false) + ' = 0'; pT = fracT(k, '', 't'); intT = T.coef(k, '\\ln t'); ans = lc([tm(W0, B.pow(-k))]); t0 = 1; pPl = k + '/t'; }
      else if (fam === 2) { var bb = R.nz(-4, 4), cc = R.nz(-5, 5); eqT = "y''" + T.coef(bb, "y'", false) + T.coef(cc, 'y', false) + ' = 0'; pT = String(bb); intT = T.mono(bb, 't'); ans = lc([tm(W0, B.e(-bb))]); t0 = 0; pPl = String(bb); }
      else { var a3 = R.nz(-2, 2); eqT = "y''" + T.coef(2 * a3, "ty'", false) + ' + y = 0'; pT = T.mono(2 * a3, 't'); intT = T.coef(a3, 't^{2}'); ans = lc([tm(W0, B.raw('e^{' + T.coef(-a3, 't^{2}') + '}', 'e^(' + (-a3) + 't^2)'))]); t0 = 0; pPl = (2 * a3) + '*t'; }
      chk({ topic: 'de.wronskian', kind: 'abel', p: pPl, W0: W0, t0: t0, ans: ans.pl });
      return { q: 'Two solutions $y_1, y_2$ of $' + eqT + '$' + (fam === 1 ? ' (for $t > 0$)' : '') + ' have Wronskian $W(' + t0 + ') = ' + W0 + '$. Use Abel\'s formula to find $W(t)$.', a: ex(ans.pl),
        steps: ["Abel's formula: for $y'' + p(t)y' + q(t)y = 0$, $W(t) = W(t_0)\\,e^{-\\int_{t_0}^{t} p(s)\\,ds}$.", fam === 1 ? 'Divide by $t^{2}$ to reach standard form: $p(t) = ' + pT + '$.' : 'Here $p(t) = ' + pT + '$.', '$\\int p\\,dt = ' + intT + '$, and it vanishes at $t_0 = ' + t0 + '$.', '$W(t) = ' + T.coef(W0, 'e^{-(' + intT + ')}') + ' = ' + ans.tex + '$.'],
        hint: 'Put the equation in standard form and read off $p(t)$; then $W = Ce^{-\\int p\\,dt}$.' };
    }
    var pairs = [
      function () { var a = R.nz(-3, 3), b = R.intNot(-3, 3, [a, 0]); return { y1: B.e(a), y2: B.e(b), W: lc([tm(b - a, B.e(a + b))]), Wt: '(' + T.lin(1, 'e^{' + kv(a) + '}', 0) + ')(' + T.mono(b, 'e^{' + kv(b) + '}') + ') - (' + T.mono(a, 'e^{' + kv(a) + '}') + ')(e^{' + kv(b) + '})', at0: q(b - a), dep: false }; },
      function () { var w = R.int(1, 4); return { y1: B.cos(w), y2: B.sin(w), W: lc([tm(w)]), Wt: (w === 1 ? '' : w) + '\\cos^{2} ' + kv(w) + ' + ' + (w === 1 ? '' : w) + '\\sin^{2} ' + kv(w), at0: q(w), dep: false }; },
      function () { var r = R.nz(-3, 3); return { y1: B.e(r), y2: B.mul(B.pow(1), B.e(r)), W: lc([tm(1, B.e(2 * r))]), Wt: 'e^{' + kv(r) + '}\\cdot(1' + T.coef(r, 't', false) + ')e^{' + kv(r) + '}' + T.coef(-r, 'e^{' + kv(r) + '}\\cdot te^{' + kv(r) + '}', false), at0: q(1), dep: false }; },
      function () { var m = R.int(1, 3), n = R.intNot(1, 4, [m]); return { y1: B.pow(m), y2: B.pow(n), W: lc([tm(n - m, B.pow(m + n - 1))]), Wt: tpw(m) + '\\cdot ' + T.mono(n, tpw(n - 1) || '1') + ' - ' + T.mono(m, tpw(m - 1) || '1') + '\\cdot ' + tpw(n), at0: null, dep: false }; },
      function () { var al = R.nz(-2, 2), be = R.int(1, 3); return { al: al, be: be, y1: B.mul(B.e(al), B.cos(be)), y2: B.mul(B.e(al), B.sin(be)), W: lc([tm(be, B.e(2 * al))]), Wt: 'e^{' + kv(2 * al) + '}\\left[\\cos ' + kv(be) + '\\left(' + T.coef(al, '\\sin ' + kv(be)) + T.coef(be, '\\cos ' + kv(be), false) + '\\right) - \\sin ' + kv(be) + '\\left(' + T.coef(al, '\\cos ' + kv(be)) + T.coef(-be, '\\sin ' + kv(be), false) + '\\right)\\right] = ' + (be === 1 ? '' : be) + 'e^{' + kv(2 * al) + '}(\\cos^{2} ' + kv(be) + ' + \\sin^{2} ' + kv(be) + ')', long: true, at0: q(be), dep: false }; }
    ];
    var deps = [
      function () { var r = R.nz(-3, 3), k = R.int(2, 5); return { y1: B.e(r), y2: lc([tm(k, B.e(r))]), note: '$y_2 = ' + k + 'y_1$' }; },
      function () { var w = R.pick([1, 2, 3]); return { y1: B.sin(2 * w), y2: B.raw('\\sin ' + kv(w) + '\\cos ' + kv(w), 'sin(' + kv(w) + ')cos(' + kv(w) + ')'), note: '$\\sin ' + kv(w) + '\\cos ' + kv(w) + ' = \\frac{1}{2}\\sin ' + kv(2 * w) + '$, so $y_2 = \\frac{1}{2}y_1$' }; },
      function () { var m = R.int(2, 3); return { y1: B.pow(m), y2: lc([tm(-R.int(2, 4), B.pow(m))]), note: '$y_2$ is a constant multiple of $y_1$' }; }
    ];
    if (kind === 'indep') {
      var dep = R.coin(), P = dep ? R.pick(deps)() : R.pick(pairs)();
      chk({ topic: 'de.wronskian', kind: 'indep', y1: P.y1.pl, y2: P.y2.pl, truth: !dep });
      return { q: 'True or false: $y_1 = ' + P.y1.tex + '$ and $y_2 = ' + P.y2.tex + '$ are linearly independent.', a: tf(!dep),
        steps: dep ? ['$W = y_1y_2\' - y_1\'y_2 = 0$ for every $t$.', P.note + '. One is a constant multiple of the other: dependent. False.'] : ['$W = y_1y_2\' - y_1\'y_2 = ' + P.W.tex + '$.', 'This is not identically zero, so the functions are independent. True.'],
        hint: 'Compute the Wronskian, or ask whether one function is a constant multiple of the other.' };
    }
    var Pq = kind === 'at' ? R.pick([pairs[0], pairs[1], pairs[2], pairs[4]])() : R.pick(pairs)();
    chk({ topic: 'de.wronskian', kind: 'W', y1: Pq.y1.pl, y2: Pq.y2.pl, ans: Pq.W.pl });
    var st = ['$W(y_1, y_2) = \\begin{vmatrix} y_1 & y_2 \\\\ y_1\' & y_2\' \\end{vmatrix} = y_1y_2\' - y_1\'y_2$.', (Pq.long ? 'By the product rule, $y_1\' = e^{' + kv(Pq.al) + '}(' + T.coef(Pq.al, '\\cos ' + kv(Pq.be)) + T.coef(-Pq.be, '\\sin ' + kv(Pq.be), false) + ')$ and $y_2\' = e^{' + kv(Pq.al) + '}(' + T.coef(Pq.al, '\\sin ' + kv(Pq.be)) + T.coef(Pq.be, '\\cos ' + kv(Pq.be), false) + ')$. Then $$W = ' + Pq.Wt + ' = ' + Pq.W.tex + '.$$' : '$W = ' + Pq.Wt + ' = ' + Pq.W.tex + '$.')];
    if (kind === 'at') return { q: 'Find the Wronskian of $y_1 = ' + Pq.y1.tex + '$ and $y_2 = ' + Pq.y2.tex + '$ at $t = 0$.', a: num(Pq.at0.toPlain()), steps: st.concat(['At $t = 0$: $W(0) = ' + Pq.at0.toTex() + '$.']), hint: 'Use $W = y_1y_2\' - y_1\'y_2$.' };
    return { q: 'Find the Wronskian $W(y_1, y_2)(t)$ of $y_1 = ' + Pq.y1.tex + '$ and $y_2 = ' + Pq.y2.tex + '$.', a: ex(Pq.W.pl), steps: st, hint: 'Use $W = y_1y_2\' - y_1\'y_2$ and simplify.' };
  });

  // ---------- de.real-roots ----------
  G('de.real-roots', function (R, ctx) {
    var L = lv(ctx), kind = pickKind(R, ctx, ['roots'], ['ivp', 'ivp', 'roots'], ['ivp', 'limit']);
    var o = mkHom(R, 'real', L >= 3 && kind === 'ivp' ? R.pick([2, 3]) : 1);
    if (kind === 'roots') {
      chk({ topic: 'de.real-roots', kind: 'roots', cs: o.cs.map(function (c) { return c.toNumber(); }), ans: [o.r1.toNumber(), o.r2.toNumber()] });
      return { q: 'Find the roots of the characteristic equation of $' + o.lhs + ' = 0$.', a: { t: 'set', v: [o.r1.toPlain(), o.r2.toPlain()] }, steps: rootSteps(o).slice(0, 2), hint: 'Replace $y\'\'$ by $r^2$, $y\'$ by $r$ and $y$ by 1, then factor.' };
    }
    if (kind === 'limit') { // one root 0, the other negative
      var rn = R.int(-4, -1), c1 = R.nz(-4, 5), c2 = R.nz(-3, 3);
      o = { type: 'real', lead: 1, r1: q(0), r2: q(rn), cs: [q(1), q(-rn), q(0)], f: [BF.one(), BF.exp(rn)] }; o.lhs = odeLhs(o.cs); o.charT = charTex(o.cs);
      var ic = icVals([c1, c2], o.f, 2), k = { c1: q(c1), c2: q(c2), y0: ic[0], v0: ic[1] }, sol = homSol(o, c1, c2);
      recIVP('de.real-roots', o, k, sol.pl);
      return { q: 'Let $y$ solve $' + o.lhs + ' = 0$ with $y(0) = ' + k.y0.toTex() + "$ and $y'(0) = " + k.v0.toTex() + '$. Find $\\displaystyle\\lim_{t \\to \\infty} y(t)$.', a: num(c1),
        steps: ivpSteps(o, c1, c2, k.y0, k.v0).concat(['As $t \\to \\infty$, $e^{' + kv(rn) + '} \\to 0$, so $y \\to ' + c1 + '$.']), hint: 'Solve the initial value problem, then let $t \\to \\infty$: which terms die out?' };
    }
    var k2 = pickC(R, o), sol2 = homSol(o, k2.c1, k2.c2);
    recIVP('de.real-roots', o, k2, sol2.pl);
    return { q: ivpQ(o, k2), a: ex(sol2.pl), steps: ivpSteps(o, k2.c1, k2.c2, k2.y0, k2.v0), hint: 'Find the roots of the characteristic equation, write $y = c_1e^{r_1t} + c_2e^{r_2t}$, then use the initial conditions.' };
  });

  // ---------- de.complex-roots-de ----------
  G('de.complex-roots-de', function (R, ctx) {
    var L = lv(ctx), kind = pickKind(R, ctx, ['ab', 'which'], ['ivp', 'ivp', 'ab'], ['ivp']);
    var o = mkHom(R, 'cx', L >= 3 && R.coin() ? 4 : 1);
    if (o.al.isZero() && kind === 'which') o = mkHom(R, 'cx', 1);
    if (kind === 'ab') {
      chk({ topic: 'de.complex-roots-de', kind: 'ab', cs: o.cs.map(function (c) { return c.toNumber(); }), al: o.al.toNumber(), be: o.be.toNumber() });
      return { q: 'The solutions of $' + o.lhs + ' = 0$ have the form $y = e^{\\alpha t}(c_1\\cos \\beta t + c_2\\sin \\beta t)$ with $\\beta > 0$. Find $\\alpha$ and $\\beta$.',
        a: { t: 'multi', parts: [{ label: '$\\alpha =$', a: num(o.al.toPlain()) }, { label: '$\\beta =$', a: num(o.be.toPlain()) }] }, steps: rootSteps(o), hint: 'Solve the characteristic equation with the quadratic formula; the roots are $\\alpha \\pm \\beta i$.' };
    }
    if (kind === 'which') {
      var a = o.al, b = o.be, ea = 'e^{' + kv(a) + '}', right = '$' + ea + '\\cos ' + kv(b) + '$';
      var wr = ['$\\cos(' + kv(a) + ' + ' + kv(b) + ')$'.replace('+ -', '- '), '$e^{' + kv(b) + '}\\cos ' + kv(a.abs().eq(1) ? 1 : a.abs()) + '$', '$e^{' + kv(a.add(b)) + '}$'];
      if (a.add(b).isZero()) wr[2] = '$' + ea + '\\cos ' + kv(b.mul(2)) + '$';
      return { q: 'The characteristic equation of $' + o.lhs + ' = 0$ has roots $' + a.toTex() + ' \\pm ' + (b.eq(1) ? '' : b.toTex()) + 'i$. Which of these is a real solution?', a: mc(R, right, wr),
        steps: ['A complex root $r = \\alpha + \\beta i$ gives $e^{(\\alpha + \\beta i)t} = e^{\\alpha t}(\\cos \\beta t + i\\sin \\beta t)$ by Euler\'s formula.', 'Its real and imaginary parts, $e^{\\alpha t}\\cos \\beta t$ and $e^{\\alpha t}\\sin \\beta t$, are real solutions.', 'Here $\\alpha = ' + a.toTex() + '$ and $\\beta = ' + b.toTex() + '$: $' + ea + '\\cos ' + kv(b) + '$ works. The real part $\\alpha$ goes in the exponential, and only $\\beta$ goes inside the cosine.'],
        hint: 'Use Euler\'s formula on $e^{(\\alpha + \\beta i)t}$: what multiplies the cosine, and what is inside it?' };
    }
    var k = pickC(R, o), sol = homSol(o, k.c1, k.c2);
    recIVP('de.complex-roots-de', o, k, sol.pl);
    return { q: ivpQ(o, k), a: ex(sol.pl), steps: ivpSteps(o, k.c1, k.c2, k.y0, k.v0), hint: 'Roots $\\alpha \\pm \\beta i$ give $y = e^{\\alpha t}(c_1\\cos \\beta t + c_2\\sin \\beta t)$.' };
  });

  // ---------- de.repeated-roots ----------
  G('de.repeated-roots', function (R, ctx) {
    var L = lv(ctx), kind = pickKind(R, ctx, ['second', 'root'], ['ivp', 'ivp', 'second'], ['ivp']);
    var o = mkHom(R, 'rep', L >= 3 && R.coin() ? R.pick([4, 9]) : 1);
    if (kind === 'root') return { q: 'The characteristic equation of $' + o.lhs + ' = 0$ has a repeated root. Find it.', a: num(o.r.toPlain()), steps: rootSteps(o).slice(0, 2), hint: 'The characteristic polynomial is a perfect square.' };
    if (kind === 'second') {
      var e = 'e^{' + kv(o.r) + '}';
      return { q: 'One solution of $' + o.lhs + ' = 0$ is $y_1 = ' + e + '$. Which function is a second solution, independent of $y_1$?', a: mc(R, '$t' + e + '$', ['$2' + e + '$', '$e^{' + kv(o.r.neg()) + '}$', '$t^{2}' + e + '$']),
        steps: rootSteps(o).slice(0, 2).concat(['$2' + e + '$ is a solution, but it is just a multiple of $y_1$: not independent.', 'Reduction of order (or checking directly) shows $t' + e + '$ is a solution, and $W(' + e + ', t' + e + ') = e^{' + kv(o.r.mul(2)) + '} \\ne 0$.']),
        hint: 'A constant multiple of $y_1$ does not count as a new solution.' };
    }
    var k = pickC(R, o), sol = homSol(o, k.c1, k.c2);
    recIVP('de.repeated-roots', o, k, sol.pl);
    return { q: ivpQ(o, k), a: ex(sol.pl), steps: ivpSteps(o, k.c1, k.c2, k.y0, k.v0), hint: 'A repeated root $r$ gives $y = (c_1 + c_2t)e^{rt}$.' };
  });

  // ---------- de.reduction-of-order ----------
  var ROF = [ // equation, y1 and y2 as [TeX, plain], domain, standard-form p, e^{-∫p}, v', v, residual, values [[y1, y1'], [y2, y2']] at t0 (or null)
    function (R) { var m = R.pick([1, 2, -1, 3]), a = 1 - 2 * m, b = m * m, tp = 't^' + (m < 0 ? '(' + m + ')' : m); return { eq: "t^{2}y''" + T.coef(a, "ty'", false) + T.coef(b, 'y', false) + ' = 0', y1: [tpw(m), m === 1 ? 't' : tp], y2: [tpw(m) + '\\ln t', (m === 1 ? 't' : tp) + ' ln(t)'], dom: 't > 0', t0: 1, p: fracT(a, '', 't'), E: tpw(-a) || '1', vp: '\\frac{' + (tpw(-a) || '1') + '}{' + tpw(2 * m) + '} = \\frac{1}{t}', v: '\\ln t', res: 't^2*y2 + (' + a + ')*t*y1 + (' + b + ')*y', iv: [[q(1), q(m)], [q(0), q(1)]] }; },
    function (R) { var pr = R.pick([[1, -1], [2, -1], [1, 2], [2, 3], [-1, 3], [1, -2]]), m = pr[0], n = pr[1], a = 1 - m - n, b = m * n, d = n - m;
      var pl = function (e) { return e === 1 ? 't' : 't^' + (e < 0 ? '(' + e + ')' : e); };
      return { eq: "t^{2}y''" + T.coef(a, "ty'", false) + T.coef(b, 'y', false) + ' = 0', y1: [tpw(m), pl(m)], y2: [tpw(n), pl(n)], dom: 't > 0', t0: 1, p: fracT(a, '', 't'), E: tpw(-a) || '1', vp: '\\frac{' + (tpw(-a) || '1') + '}{' + tpw(2 * m) + '} = ' + (d - 1 === 0 ? '1' : tpw(d - 1)), v: d === 1 ? 't' : fracT(q(1, d), tpw(d), ''), res: 't^2*y2 + (' + a + ')*t*y1 + (' + b + ')*y', iv: [[q(1), q(m)], [q(1), q(n)]] }; },
    function () { return { eq: "ty'' - (t + 1)y' + y = 0", y1: ['e^{t}', 'e^(t)'], y2: ['t + 1', '(t + 1)'], dom: 't > 0', t0: 1, p: '-1 - \\frac{1}{t}', E: 'te^{t}', vp: '\\frac{te^{t}}{e^{2t}} = te^{-t}', v: '-(t + 1)e^{-t}', res: 't*y2 - (t+1)*y1 + y', iv: null }; },
    function () { return { eq: "(1 - t)y'' + ty' - y = 0", y1: ['t', 't'], y2: ['e^{t}', 'e^(t)'], dom: 't < 1', t0: 0, p: '\\frac{t}{1 - t}', E: '(1 - t)e^{t}', vp: '\\frac{(1 - t)e^{t}}{t^{2}}', v: '-\\frac{e^{t}}{t}', res: '(1-t)*y2 + t*y1 - y', iv: [[q(0), q(1)], [q(1), q(1)]] }; },
    function () { return { eq: "t^{2}y'' - t(t + 2)y' + (t + 2)y = 0", y1: ['t', 't'], y2: ['te^{t}', 't e^(t)'], dom: 't > 0', t0: 1, p: '-1 - \\frac{2}{t}', E: 't^{2}e^{t}', vp: '\\frac{t^{2}e^{t}}{t^{2}} = e^{t}', v: 'e^{t}', res: 't^2*y2 - t*(t+2)*y1 + (t+2)*y', iv: null }; }
  ];
  G('de.reduction-of-order', function (R, ctx) {
    var kind = pickKind(R, ctx, ['k'], ['y2', 'ivp', 'k'], ['ivp', 'y2']);
    if (kind === 'k') {
      var o = mkHom(R, 'real'), tries = 0; while ((o.r1.isZero() || o.r2.isZero()) && tries++ < 20) o = mkHom(R, 'real');
      var b = o.cs[1], r = o.r1, other = b.neg().sub(r), s2 = r.mul(2).add(b);
      chk({ topic: 'de.reduction-of-order', kind: 'k', cs: o.cs.map(function (c) { return c.toNumber(); }), ans: other.toNumber() });
      return { q: '$y_1 = e^{' + kv(r) + '}$ solves $' + o.lhs + ' = 0$. Reduction of order with $y = v(t)e^{' + kv(r) + '}$ gives a second solution $y_2 = e^{kt}$. Find $k$.', a: num(other.toPlain()),
        steps: ["Substitute $y = ve^{" + kv(r) + "}$: $y' = (v'" + T.coef(r, 'v', false) + ")e^{" + kv(r) + "}$ and $y'' = (v''" + T.coef(r.mul(2), "v'", false) + T.coef(r.mul(r), 'v', false) + ')e^{' + kv(r) + '}$.',
          'The $v$ terms cancel because $y_1$ is a solution, leaving $v\'\'' + T.coef(s2, "v'", false) + ' = 0$.',
          "So $v' = e^{" + kv(s2.neg()) + "}$ and $v = " + fracT(s2.neg().inv(), 'e^{' + kv(s2.neg()) + '}', '') + '$ (dropping constants).',
          '$y_2 = vy_1$ is a multiple of $e^{' + kv(s2.neg()) + '}e^{' + kv(r) + '} = e^{' + kv(other) + '}$, so $k = ' + other.toTex() + '$. (It is the other root of the characteristic equation.)'],
        hint: 'After substituting $y = ve^{rt}$, you get a first-order equation for $w = v\'$.' };
    }
    var F = R.pick(kind === 'ivp' ? [ROF[0], ROF[1], ROF[3]] : ROF)(R), formula = 'Reduction of order: with the equation in standard form $y\'\' + p(t)y\' + q(t)y = 0$ and $y = v\\,y_1$, the equation for $v\'$ is first order and gives $y_2 = y_1\\int \\frac{e^{-\\int p\\,dt}}{y_1^{2}}\\,dt$.';
    var red = [formula, 'Standard form: $p(t) = ' + F.p + '$, so $e^{-\\int p\\,dt} = ' + F.E + '$.', "$v' = \\frac{e^{-\\int p\\,dt}}{y_1^{2}} = " + F.vp + '$, so $v = ' + F.v + '$ (constants dropped).', '$y_2 = vy_1$ is a multiple of $' + F.y2[0] + '$, so take $y_2 = ' + F.y2[0] + '$.'];
    if (kind === 'y2') {
      var others = [];
      ROF.forEach(function (f) { var z = f(R).y2[0]; if (z !== F.y2[0] && z !== F.y1[0] && others.indexOf(z) < 0) others.push(z); });
      ['2' + F.y1[0], F.y1[0] + '\\,e^{-t}'].forEach(function (z) { if (others.indexOf(z) < 0) others.unshift(z); });
      chk({ topic: 'de.reduction-of-order', kind: 'y2', res: F.res, ans: F.y2[1], dom: F.dom === 't < 1' ? [-0.8, 0.8] : [0.5, 2.5] });
      return { q: '$y_1 = ' + F.y1[0] + '$ is a solution of $' + F.eq + '$ ($' + F.dom + '$). Which function is a second, independent solution?', a: mc(R, '$' + F.y2[0] + '$', others.slice(0, 3).map(function (z) { return '$' + z + '$'; })), steps: red, hint: 'Use $y = v\\,y_1$; the equation for $w = v\'$ is first order.' };
    }
    var c1 = R.nz(-3, 3), c2 = R.nz(-3, 3), t0 = F.t0, iv = F.iv;
    var y0 = q(c1).mul(iv[0][0]).add(q(c2).mul(iv[1][0])), v0 = q(c1).mul(iv[0][1]).add(q(c2).mul(iv[1][1]));
    var sol = lc([tm(c1, B.raw(F.y1[0], F.y1[1])), tm(c2, B.raw(F.y2[0], F.y2[1]))]);
    chk({ topic: 'de.reduction-of-order', kind: 'ivp', F: F.res, ic: [t0, y0.toNumber(), v0.toNumber()], ans: sol.pl, dom: F.dom === 't < 1' ? [-0.8, 0.8] : [0.5, 2.5] });
    return { q: '$y_1 = ' + F.y1[0] + '$ is a solution of $' + F.eq + '$ ($' + F.dom + '$). Use reduction of order to find a second solution, then solve with $y(' + t0 + ') = ' + y0.toTex() + "$ and $y'(" + t0 + ') = ' + v0.toTex() + '$.',
      a: ex(sol.pl), steps: red.concat(['General solution: $y = c_1' + F.y1[0] + ' + c_2' + F.y2[0] + '$.', 'At $t = ' + t0 + '$: $y = ' + T.terms([[iv[0][0], 'c_1'], [iv[1][0], 'c_2']]) + ' = ' + y0.toTex() + "$ and $y' = " + T.terms([[iv[0][1], 'c_1'], [iv[1][1], 'c_2']]) + ' = ' + v0.toTex() + '$.', 'So $c_1 = ' + c1 + '$ and $c_2 = ' + c2 + '$: $y = ' + sol.tex + '$.']),
      hint: 'Find $y_2$ with $y = v\\,y_1$, write $y = c_1y_1 + c_2y_2$, and fit the initial conditions.' };
  });

// ---- u4.js
  // =====================================================================================================
  // UNIT 3: Second-Order Linear Equations (part 2)
  // =====================================================================================================
  BF.tcos = function (w) { w = q(w); return { b: B.mul(B.pow(1), B.cos(w)), d: function (j) { return j === 0 ? q(0) : q(j).mul(cxPow([q(0), w], j - 1)[0]); } }; };
  BF.tsin = function (w) { w = q(w); return { b: B.mul(B.pow(1), B.sin(w)), d: function (j) { return j === 0 ? q(0) : q(j).mul(cxPow([q(0), w], j - 1)[1]); } }; };
  BF.cos = function (w) { return BF.ecos(0, w); };
  BF.sin = function (w) { return BF.esin(0, w); };
  BF.pw = function (m) { return BF.texp(0, m); };
  function charP(o, x) { x = q(x); return o.cs[0].mul(x).mul(x).add(o.cs[1].mul(x)).add(o.cs[2]); }
  function rootMult(o, k) { k = q(k); if (o.type === 'cx') return 0; if (o.type === 'rep') return o.r.eq(k) ? 2 : 0; return (o.r1.eq(k) ? 1 : 0) + (o.r2.eq(k) ? 1 : 0); }

  // a forcing term and its particular solution for y'' + by' + cy (leading coefficient 1)
  function mkForcing(R, o, type, allowRes) {
    var b = o.cs[1], c = o.cs[2], F = { type: type };
    if (type === 'exp') {
      var roots = o.type === 'real' ? [o.r1, o.r2] : o.type === 'rep' ? [o.r] : [];
      var k = allowRes && roots.length && R.chance(0.6) ? R.pick(roots) : q(R.intNot(-3, 3, [0].concat(roots.map(function (x) { return x.toNumber(); }))));
      var m = rootMult(o, k), A = q(R.nz(-3, 3)), G;
      if (m === 0) G = A.mul(charP(o, k)); else if (m === 1) G = A.mul(k.mul(2).add(b)); else G = A.mul(2);
      F.k = k; F.m = m; F.A = A; F.G = G;
      F.gT = T.coef(G, 'e^{' + kv(k) + '}'); F.gPl = G.toPlain() + '*e^(' + kv(k) + ')';
      F.terms = [[A, BF.texp(k, m)]];
      F.formT = (m === 0 ? '' : m === 1 ? 't' : 't^{2}') + 'e^{' + kv(k) + '}'; F.form = 'A' + F.formT;
      var PkT = charTex([1, b, c]).replace(/r/g, '(' + k.toTex() + ')');
      F.subst = m === 0 ? ['Substitute $y_p = ' + F.form + '$: every derivative is a multiple of $e^{' + kv(k) + '}$, and $y_p\'\' ' + T.coef(b, "y_p'", false) + T.coef(c, 'y_p', false) + ' = A(' + charTex([1, b, c]).replace(/r/g, 'k') + ')e^{kt}$ with $k = ' + k.toTex() + '$.', 'That is $' + T.coef(charP(o, k), 'Ae^{' + kv(k) + '}') + ' = ' + F.gT + '$, so $A = ' + A.toTex() + '$.']
        : m === 1 ? ['$e^{' + kv(k) + '}$ already solves the homogeneous equation ($r = ' + k.toTex() + '$ is a root), so try $y_p = Ate^{' + kv(k) + '}$.', "Then $y_p' = A(1" + T.coef(k, 't', false) + ")e^{" + kv(k) + "}$ and $y_p'' = A(" + T.lin(k.mul(k), 't', k.mul(2)) + ')e^{' + kv(k) + '}$. Substituting, the $t$ terms cancel (because $' + k.toTex() + '$ is a root), leaving $(2k' + T.signed(b) + ')Ae^{kt} = ' + T.coef(k.mul(2).add(b), 'Ae^{' + kv(k) + '}') + '$.', 'So $' + T.coef(k.mul(2).add(b), 'A') + ' = ' + G.toTex() + '$ and $A = ' + A.toTex() + '$.']
        : ['$r = ' + k.toTex() + '$ is a double root, so both $e^{' + kv(k) + '}$ and $te^{' + kv(k) + '}$ solve the homogeneous equation: try $y_p = At^{2}e^{' + kv(k) + '}$.', 'Substituting, everything cancels except $2Ae^{' + kv(k) + '} = ' + F.gT + '$, so $A = ' + A.toTex() + '$.'];
    } else if (type === 'trig') {
      var w, res = allowRes && o.type === 'cx' && o.al.isZero() && R.chance(0.7);
      if (res) w = o.be; else { var tries = 0; do { w = q(R.int(1, 4)); tries++; } while ((o.type === 'cx' && o.al.isZero() && o.be.eq(w)) && tries < 20); if (o.type === 'cx' && o.al.isZero() && o.be.eq(w)) { w = o.be.add(1); } }
      var isCos = R.coin(), fn = isCos ? '\\cos ' : '\\sin ', wt = kv(w);
      F.w = w; F.isCos = isCos;
      if (res) {
        var Gr = q(R.nz(-3, 3)).mul(w.mul(2)), coef = Gr.div(w.mul(2)); // y_p = t(A cos + B sin): cos forcing -> B = G/(2w); sin forcing -> A = -G/(2w)
        F.G = Gr; F.gT = T.coef(Gr, fn + wt); F.gPl = Gr.toPlain() + '*' + (isCos ? 'cos' : 'sin') + '(' + wt + ')';
        F.terms = isCos ? [[coef, BF.tsin(w)]] : [[coef.neg(), BF.tcos(w)]]; F.m = 1;
        F.form = 't(A\\cos ' + wt + ' + B\\sin ' + wt + ')';
        F.subst = ['$\\cos ' + wt + '$ and $\\sin ' + wt + '$ solve the homogeneous equation (roots $\\pm ' + (w.eq(1) ? '' : w.toTex()) + 'i$), so try $y_p = ' + F.form + '$.', "Substituting into $y''" + T.coef(w.mul(w), 'y', false) + '$ leaves $' + w.mul(2).toTex() + '(-A\\sin ' + wt + ' + B\\cos ' + wt + ') = ' + F.gT + '$.', isCos ? 'So $A = 0$ and $B = ' + coef.toTex() + '$.' : 'So $B = 0$ and $A = ' + coef.neg().toTex() + '$.'];
      } else {
        var d1 = c.sub(w.mul(w)), d2 = b.mul(w), D2 = d1.mul(d1).add(d2.mul(d2)), mlt = q(R.nz(-2, 2)), A2, B2, Gc, Gs;
        if (D2.lt(80)) { // pure cos or sin forcing with whole-number A, B
          if (isCos) { A2 = d1.mul(mlt); B2 = d2.mul(mlt); } else { A2 = d2.neg().mul(mlt); B2 = d1.mul(mlt); }
          Gc = d1.mul(A2).add(d2.mul(B2)); Gs = d2.neg().mul(A2).add(d1.mul(B2));
        } else { A2 = q(R.nz(-2, 2)); B2 = q(R.int(-2, 2)); Gc = d1.mul(A2).add(d2.mul(B2)); Gs = d2.neg().mul(A2).add(d1.mul(B2)); }
        F.Gc = Gc; F.Gs = Gs; F.m = 0;
        var g = lc([tm(Gc, B.cos(w)), tm(Gs, B.sin(w))]); F.gT = g.tex; F.gPl = g.pl;
        F.terms = [[A2, BF.cos(w)], [B2, BF.sin(w)]];
        F.form = 'A\\cos ' + wt + ' + B\\sin ' + wt;
        F.subst = ['Try $y_p = ' + F.form + '$ (both cosine and sine: derivatives swap them).',
          'Substituting gives $[' + T.terms([[d1, 'A'], [d2, 'B']]) + ']\\cos ' + wt + ' + [' + T.terms([[d2.neg(), 'A'], [d1, 'B']]) + ']\\sin ' + wt + '$.',
          'Match: $' + T.terms([[d1, 'A'], [d2, 'B']]) + ' = ' + Gc.toTex() + '$ and $' + T.terms([[d2.neg(), 'A'], [d1, 'B']]) + ' = ' + Gs.toTex() + '$, so $A = ' + A2.toTex() + '$, $B = ' + B2.toTex() + '$.'];
      }
    } else if (type === 'poly') {
      var A3 = q(R.nz(-3, 3)), B3 = q(R.int(-3, 3)), mm = c.mul(A3), nn = b.mul(A3).add(c.mul(B3));
      F.terms = [[A3, BF.pw(1)], [B3, BF.one()]]; F.m = 0;
      var gg = lc([tm(mm, B.pow(1)), tm(nn)]); F.gT = gg.tex; F.gPl = gg.pl; F.form = 'At + B';
      F.subst = ["Try $y_p = At + B$: $y_p' = A$, $y_p'' = 0$.", 'Substituting: $' + T.terms([[b, 'A'], [c, '(At + B)']]) + ' = ' + T.coef(c, 'At') + ' + (' + T.terms([[b, 'A'], [c, 'B']]) + ')$.', 'Match: $' + T.coef(c, 'A') + ' = ' + mm.toTex() + '$, so $A = ' + A3.toTex() + '$; $' + T.terms([[b, 'A'], [c, 'B']]) + ' = ' + nn.toTex() + '$, so $B = ' + B3.toTex() + '$.'];
    }
    var yp = lc(F.terms.map(function (t) { return tm(t[0], t[1].b); }));
    F.yp = yp; F.ypT = yp.tex; F.ypPl = yp.pl;
    return F;
  }
  G('de.undetermined-coefficients', function (R, ctx) {
    var kind = pickKind(R, ctx, ['form', 'yp'], ['yp', 'form', 'yp'], ['ivp', 'ivp', 'form']);
    if (kind === 'form') {
      var tp = R.pick(['exp', 'exp', 'trig', 'poly']), o, F, choices, right;
      if (tp === 'exp') { o = mkHom(R, R.pick(['real', 'real', 'rep'])); var roots = o.type === 'real' ? [o.r1, o.r2] : [o.r]; var k = R.chance(0.7) ? R.pick(roots) : q(R.intNot(-3, 3, roots.map(function (x) { return x.toNumber(); }).concat([0]))); var m = rootMult(o, k), e = 'e^{' + kv(k) + '}';
        right = ['A' + e, 'At' + e, 'At^{2}' + e][m]; choices = ['A' + e, 'At' + e, 'At^{2}' + e, 'A' + e + ' + B'];
        F = { gT: T.coef(R.nz(2, 5) * R.sign(), e), why: m === 0 ? '$r = ' + k.toTex() + '$ is not a root, so $A' + e + '$ cannot solve the homogeneous equation; it works as is.' : m === 1 ? '$r = ' + k.toTex() + '$ is a simple root, so $A' + e + '$ solves the homogeneous equation and would give 0. Multiply by $t$: $At' + e + '$.' : '$r = ' + k.toTex() + '$ is a double root: $' + e + '$ and $t' + e + '$ both solve the homogeneous equation. Multiply by $t^{2}$.' };
      } else if (tp === 'trig') { var res = R.coin(); var w = R.int(1, 4); o = res ? { type: 'cx', al: q(0), be: q(w), cs: [q(1), q(0), q(w * w)] } : mkHom(R, R.pick(['real', 'cx'])); if (!res && o.type === 'cx' && o.al.isZero() && o.be.eq(w)) w = w + 1; o.lhs = odeLhs(o.cs); o.charT = charTex(o.cs);
        var wt = kv(w), fnm = R.pick(['\\cos ', '\\sin ']); right = res ? 't(A\\cos ' + wt + ' + B\\sin ' + wt + ')' : 'A\\cos ' + wt + ' + B\\sin ' + wt; choices = ['A\\cos ' + wt + ' + B\\sin ' + wt, 't(A\\cos ' + wt + ' + B\\sin ' + wt + ')', 'A' + fnm + wt, 'At' + fnm + wt];
        F = { gT: T.coef(R.nz(2, 6), fnm + wt), why: res ? 'The roots are $\\pm ' + (w === 1 ? '' : w) + 'i$, so $\\cos ' + wt + '$ and $\\sin ' + wt + '$ already solve the homogeneous equation: multiply the usual guess by $t$.' : 'Use both $\\cos ' + wt + '$ and $\\sin ' + wt + '$, since differentiating turns one into the other. Neither solves the homogeneous equation here, so no extra $t$.' };
      } else { var zero = R.coin(), bb = R.nz(-4, 4), cc = zero ? 0 : R.nz(-5, 5); o = { cs: [q(1), q(bb), q(cc)] }; o.lhs = odeLhs(o.cs); o.charT = charTex(o.cs);
        right = zero ? 'At^{2} + Bt' : 'At + B'; choices = ['At + B', 'At^{2} + Bt', 'At', 'At^{2} + Bt + C'];
        F = { gT: T.lin(R.nz(2, 6), 't', R.nz(-5, 5)), why: zero ? 'Here $r = 0$ is a root (no $y$ term), so constants solve the homogeneous equation. Multiply $At + B$ by $t$: $At^{2} + Bt$.' : 'A degree-1 polynomial needs the full $At + B$, even if the forcing had no constant term. $r = 0$ is not a root, so no extra $t$.' };
      }
      return { q: 'Which form should you try for a particular solution of $' + o.lhs + ' = ' + F.gT + '$?', a: mc(R, '$' + right + '$', choices.filter(function (z) { return z !== right; }).map(function (z) { return '$' + z + '$'; })),
        steps: ['Homogeneous roots: $' + o.charT + ' = 0$.', F.why], hint: 'Start from the shape of the forcing term, then check whether that guess already solves the homogeneous equation.' };
    }
    var types = kind === 'ivp' ? ['exp', 'exp', 'trig', 'poly'] : ['exp', 'trig', 'poly'];
    var tp2 = R.pick(types), o2 = mkHom(R, tp2 === 'trig' && kind === 'ivp' && R.chance(0.5) ? 'cx' : R.pick(['real', 'cx', 'rep']));
    if (tp2 === 'trig' && kind === 'ivp' && o2.type === 'cx' && R.chance(0.6)) { var w2 = R.int(1, 3); o2 = { type: 'cx', lead: 1, al: q(0), be: q(w2), cs: [q(1), q(0), q(w2 * w2)], f: [BF.ecos(0, w2), BF.esin(0, w2)] }; o2.lhs = odeLhs(o2.cs); o2.charT = charTex(o2.cs); }
    if (tp2 === 'poly' && o2.cs[2].isZero()) o2 = mkHom(R, 'cx');
    var F2 = mkForcing(R, o2, tp2, kind === 'ivp');
    var eqT = o2.lhs + ' = ' + F2.gT;
    if (kind === 'yp') {
      chk({ topic: 'de.undetermined-coefficients', kind: 'yp', ode: o2.cs.map(function (c) { return c.toNumber(); }), g: F2.gPl, ans: F2.ypPl });
      return { q: 'Find the particular solution of $' + eqT + '$ that has the form $y_p = ' + F2.form + '$.', a: ex(F2.ypPl), steps: F2.subst.concat(['$y_p = ' + F2.ypT + '$.']), hint: 'Substitute the trial form, collect like terms and match coefficients with the right side.' };
    }
    var c1 = q(R.int(-3, 3)), c2 = q(R.nz(-3, 3)), all = [[c1, o2.f[0]], [c2, o2.f[1]]].concat(F2.terms);
    var ic = icVals(all.map(function (z) { return z[0]; }), all.map(function (z) { return z[1]; }), 2);
    var hom = homSol(o2, c1, c2), sol = lc(all.map(function (z) { return tm(z[0], z[1].b); }));
    if (o2.type === 'cx' && !o2.al.isZero() || o2.type === 'rep') sol = joinSum(hom, F2.yp);
    chk({ topic: 'de.undetermined-coefficients', kind: 'ivp', ode: o2.cs.map(function (c) { return c.toNumber(); }), g: F2.gPl, ic: [0, ic[0].toNumber(), ic[1].toNumber()], ans: sol.pl });
    var ypIc = icVals(F2.terms.map(function (z) { return z[0]; }), F2.terms.map(function (z) { return z[1]; }), 2);
    return { q: 'Solve $' + eqT + '$ with $y(0) = ' + ic[0].toTex() + "$ and $y'(0) = " + ic[1].toTex() + '$.', a: ex(sol.pl),
      steps: rootSteps(o2).slice(0, 2).concat(F2.subst, ['$y_p = ' + F2.ypT + '$, and $y = y_p + ' + genTex(o2).replace(/^\(c_1/, '(c_1') + '$.',
        'At $t = 0$: $y_p(0) = ' + ypIc[0].toTex() + "$ and $y_p'(0) = " + ypIc[1].toTex() + '$, so the homogeneous part needs $y_h(0) = ' + ic[0].sub(ypIc[0]).toTex() + "$ and $y_h'(0) = " + ic[1].sub(ypIc[1]).toTex() + '$, giving $c_1 = ' + c1.toTex() + '$, $c_2 = ' + c2.toTex() + '$.',
        '$y = ' + sol.tex + '$.']),
      hint: 'Find $y_p$ first, add the general homogeneous solution, and only then use the initial conditions.' };
  });

  // ---------- de.variation-of-parameters ----------
  function vopFam(R) {
    var f = R.int(1, 5), G = R.nz(-3, 3), o = {};
    if (f === 1 || f === 2) {
      var w = R.pick([1, 2]), wt = kv(w), Gw = q(G, w), Gw2 = q(G, w * w);
      o = { eq: "y''" + ' + ' + (w === 1 ? '' : w * w) + 'y = ' + T.coef(G, (f === 1 ? '\\sec ' : '\\tan ') + wt), y1: ['\\cos ' + wt, 'cos(' + wt + ')'], y2: ['\\sin ' + wt, 'sin(' + wt + ')'], W: [String(w), String(w)], g: [T.coef(G, (f === 1 ? '\\sec ' : '\\tan ') + wt), G + '*' + (f === 1 ? 'sec' : 'tan') + '(' + wt + ')'], dom: '-\\frac{\\pi}{' + 2 * w + '} < t < \\frac{\\pi}{' + 2 * w + '}', t0: 0, lead: [1, 0, w * w], domN: [-0.6 / w, 0.6 / w] };
      if (f === 1) { o.u1 = lc([tm(Gw.neg(), B.raw('\\tan ' + wt, 'tan(' + wt + ')'))]); o.u2 = lc([tm(Gw)]); o.yp = lc([tm(Gw2, B.raw('\\cos ' + wt + '\\ln(\\cos ' + wt + ')', 'cos(' + wt + ') ln(cos(' + wt + '))')), tm(Gw, B.raw('t\\sin ' + wt, 't sin(' + wt + ')'))]); o.yp0 = [q(0), q(0)];
        o.int = ['$u_1 = ' + lc([tm(Gw2, B.raw('\\ln(\\cos ' + wt + ')', ''))]).tex + '$', '$u_2 = ' + lc([tm(Gw, B.pow(1))]).tex + '$']; }
      else { o.u1 = lc([tm(Gw.neg(), B.raw('\\frac{\\sin^{2} ' + wt + '}{\\cos ' + wt + '}', 'sin(' + wt + ')^2/cos(' + wt + ')'))]); o.u2 = lc([tm(Gw, B.raw('\\sin ' + wt, 'sin(' + wt + ')'))]); o.yp = lc([tm(Gw2.neg(), B.raw('\\cos ' + wt + '\\ln(\\sec ' + wt + ' + \\tan ' + wt + ')', 'cos(' + wt + ') ln(sec(' + wt + ') + tan(' + wt + '))'))]); o.yp0 = [q(0), Gw.neg()];
        o.int = ['$u_1 = ' + lc([tm(Gw2.neg(), B.raw('\\left[\\ln(\\sec ' + wt + ' + \\tan ' + wt + ') - \\sin ' + wt + '\\right]', ''))]).tex + '$ (write $\\sin^{2} = 1 - \\cos^{2}$)', '$u_2 = ' + lc([tm(Gw2.neg(), B.raw('\\cos ' + wt, ''))]).tex + '$', 'the $\\sin ' + wt + '\\cos ' + wt + '$ terms cancel'];
      }
    } else if (f === 3 || f === 4) {
      var r = R.nz(-2, 2), er = 'e^{' + kv(r) + '}', erp = 'e^(' + kv(r) + ')', pw = f === 3 ? 1 : 2;
      o = { eq: odeLhs([1, -2 * r, r * r]) + ' = \\frac{' + T.coef(G, er) + '}{' + tpw(pw) + '}', y1: [er, erp], y2: ['t' + er, 't ' + erp], W: ['e^{' + kv(2 * r) + '}', 'e^(' + kv(2 * r) + ')'], g: ['\\frac{' + T.coef(G, er) + '}{' + tpw(pw) + '}', G + '*' + erp + '/t' + (pw === 2 ? '^2' : '')], dom: 't > 0', t0: null };
      o.u1 = f === 3 ? lc([tm(-G)]) : lc([tm(-G, B.raw('\\frac{1}{t}', '1/t'))]); o.u2 = f === 3 ? lc([tm(G, B.raw('\\frac{1}{t}', '1/t'))]) : lc([tm(G, B.raw('\\frac{1}{t^{2}}', '1/t^2'))]);
    } else {
      var which = R.coin(); // t^2y'' - 2ty' + 2y = G t^3 (y = t, t^2)   or   t^2y'' - 3ty' + 3y = G t^4 (y = t, t^3)
      if (which) o = { eq: "t^{2}y'' - 2ty' + 2y = " + T.coef(G, 't^{3}'), y1: ['t', 't'], y2: ['t^{2}', 't^2'], W: ['t^{2}', 't^2'], g: [T.coef(G, 't'), G + '*t'], std: 'Divide by $t^{2}$: $y\'\' - \\frac{2}{t}y\' + \\frac{2}{t^{2}}y = ' + T.coef(G, 't') + '$, so $g(t) = ' + T.coef(G, 't') + '$ (not $' + T.coef(G, 't^{3}') + '$).', dom: 't > 0', t0: 1, u1: lc([tm(-G, B.pow(1))]), u2: lc([tm(G)]), yp: lc([tm(q(G, 2), B.pow(3))]), ypc: [q(G, 2), 3], int: ['$u_1 = ' + lc([tm(q(-G, 2), B.pow(2))]).tex + '$', '$u_2 = ' + T.mono(G, 't') + '$'], F: 't^2*y2 - 2*t*y1 + 2*y - (' + G + ')*t^3', iv: [[q(1), q(1)], [q(1), q(2)]], ypv: [q(G, 2), q(3 * G, 2)] };
      else o = { eq: "t^{2}y'' - 3ty' + 3y = " + T.coef(G, 't^{4}'), y1: ['t', 't'], y2: ['t^{3}', 't^3'], W: ['2t^{3}', '2t^3'], g: [T.coef(G, 't^{2}'), G + '*t^2'], std: 'Divide by $t^{2}$: $g(t) = ' + T.coef(G, 't^{2}') + '$ (not $' + T.coef(G, 't^{4}') + '$).', dom: 't > 0', t0: 1, u1: lc([tm(q(-G, 2), B.pow(2))]), u2: lc([tm(q(G, 2))]), yp: lc([tm(q(G, 3), B.pow(4))]), ypc: [q(G, 3), 4], int: ['$u_1 = ' + lc([tm(q(-G, 6), B.pow(3))]).tex + '$', '$u_2 = ' + lc([tm(q(G, 2), B.pow(1))]).tex + '$'], F: 't^2*y2 - 3*t*y1 + 3*y - (' + G + ')*t^4', iv: [[q(1), q(1)], [q(1), q(3)]], ypv: [q(G, 3), q(4 * G, 3)] };
    }
    o.f = f; o.G = G; return o;
  }
  G('de.variation-of-parameters', function (R, ctx) {
    var kind = pickKind(R, ctx, ['W', 'u2'], ['uu', 'uu', 'W'], ['ivp', 'uu']);
    var o = vopFam(R); if (kind === 'ivp') { var t = 0; while (!o.yp && t++ < 30) o = vopFam(R); }
    var setup = '$y_1 = ' + o.y1[0] + '$ and $y_2 = ' + o.y2[0] + '$ solve the homogeneous equation for $' + o.eq + '$ ($' + o.dom + '$).';
    var wSt = '$W = y_1y_2\' - y_1\'y_2 = ' + o.W[0] + '$.';
    var std = o.std || 'The equation is in standard form with $g(t) = ' + o.g[0] + '$.';
    var uSt = [std, wSt, "$u_1' = -\\frac{y_2\\,g}{W} = " + o.u1.tex + "$ and $u_2' = \\frac{y_1\\,g}{W} = " + o.u2.tex + '$.'];
    chk({ topic: 'de.variation-of-parameters', kind: 'u', y1: o.y1[1], y2: o.y2[1], g: o.g[1], W: o.W[1], u1: o.u1.pl, u2: o.u2.pl, dom: o.domN || [0.5, 2.5] });
    if (kind === 'W') return { q: 'Find the Wronskian $W(y_1, y_2)$ of $y_1 = ' + o.y1[0] + '$ and $y_2 = ' + o.y2[0] + '$.', a: ex(o.W[1]), steps: [wSt.replace('$.', '$, after simplifying.')], hint: '$W = y_1y_2\' - y_1\'y_2$.' };
    if (kind === 'u2') return { q: setup + " In variation of parameters, $y_p = u_1y_1 + u_2y_2$. Find $u_2'(t)$.", a: ex(o.u2.pl), steps: uSt, hint: "$u_2' = y_1g/W$, where $g$ is the right side in standard form." };
    if (kind === 'uu') return { q: setup + " In variation of parameters, $y_p = u_1y_1 + u_2y_2$. Find $u_1'(t)$ and $u_2'(t)$.", a: { t: 'multi', parts: [{ label: "$u_1'(t) =$", a: ex(o.u1.pl) }, { label: "$u_2'(t) =$", a: ex(o.u2.pl) }] }, steps: uSt.concat(['(These come from solving $u_1\'y_1 + u_2\'y_2 = 0$ and $u_1\'y_1\' + u_2\'y_2\' = g$.)']), hint: "Use $u_1' = -y_2g/W$ and $u_2' = y_1g/W$ with $g$ from the standard form." };
    // IVP
    var c1 = q(R.int(-3, 3)), c2 = q(R.nz(-3, 3)), t0 = o.t0, y0, v0, sol;
    if (o.f <= 2) { var w = q(o.lead[2]).num() === 1 ? 1 : 2; y0 = c1; v0 = c2.mul(w).add(o.yp0[1]); sol = joinSum(lc([tm(c1, B.cos(w)), tm(c2, B.sin(w))]), o.yp);
      chk({ topic: 'de.variation-of-parameters', kind: 'ivp', ode: o.lead, g: o.g[1], ic: [0, y0.toNumber(), v0.toNumber()], ans: sol.pl, dom: o.domN }); }
    else { y0 = c1.mul(o.iv[0][0]).add(c2.mul(o.iv[1][0])).add(o.ypv[0]); v0 = c1.mul(o.iv[0][1]).add(c2.mul(o.iv[1][1])).add(o.ypv[1]);
      sol = lc([tm(c1, B.pow(1)), tm(c2, B.pow(o.y2[1] === 't^2' ? 2 : 3)), tm(o.ypc[0], B.pow(o.ypc[1]))]);
      chk({ topic: 'de.variation-of-parameters', kind: 'ivp', F: o.F, ic: [1, y0.toNumber(), v0.toNumber()], ans: sol.pl, dom: [0.5, 2.5] }); }
    return { q: 'Use variation of parameters to solve $' + o.eq + '$ with $y(' + t0 + ') = ' + y0.toTex() + "$ and $y'(" + t0 + ') = ' + v0.toTex() + '$. (Here $y_1 = ' + o.y1[0] + '$ and $y_2 = ' + o.y2[0] + '$ solve the homogeneous equation.)',
      a: ex(sol.pl),
      steps: uSt.concat(['Integrate: ' + o.int.join(', ') + '.', '$y_p = u_1y_1 + u_2y_2 = ' + o.yp.tex + '$.', '$y = c_1' + o.y1[0] + ' + c_2' + o.y2[0] + ' + y_p$; at $t = ' + t0 + '$, $y_p = ' + (o.yp0 ? o.yp0[0] : o.ypv[0]).toTex() + "$ and $y_p' = " + (o.yp0 ? o.yp0[1] : o.ypv[1]).toTex() + '$.', 'The initial conditions give $c_1 = ' + c1.toTex() + '$ and $c_2 = ' + c2.toTex() + '$.', '$y = ' + sol.tex + '$.']),
      hint: 'Find $u_1\'$ and $u_2\'$, integrate, build $y_p$, then add $c_1y_1 + c_2y_2$ and use the initial conditions.' };
  });

  // ---------- de.free-vibrations ----------
  G('de.free-vibrations', function (R, ctx) {
    var kind = pickKind(R, ctx, ['omega', 'classify', 'period'], ['crit', 'undamped', 'classify'], ['amp', 'damped', 'undamped']);
    var m = q(R.pick([1, 2, 4, '0.5'])), w0 = R.int(2, 6), k = m.mul(w0 * w0);
    var sys = 'A mass of ' + qd(m) + ' kg hangs on a spring with spring constant ' + qd(k) + ' N/m';
    if (kind === 'omega' || kind === 'period') {
      chk({ topic: 'de.free-vibrations', kind: 'w0', m: m.toNumber(), k: k.toNumber(), ans: w0 });
      if (kind === 'omega') return { q: sys + ' (no damping). What is its natural angular frequency $\\omega_0$ in rad/s?', a: num(w0), unit: 'rad/s', steps: ["Newton's law: $" + T.coef(m, "x''") + ' + ' + qd(k) + 'x = 0$, so $x\'\' + ' + w0 * w0 + 'x = 0$.', 'Solutions are $\\cos \\omega_0 t$ and $\\sin \\omega_0 t$ with $\\omega_0 = \\sqrt{k/m} = \\sqrt{' + w0 * w0 + '} = ' + w0 + '$ rad/s.'], hint: '$\\omega_0 = \\sqrt{k/m}$.' };
      return { q: sys + ' (no damping). What is the period of its oscillation, in seconds? (Exact, or to 3 decimal places.)', a: num('2pi/' + w0, { tol: 0.0006 }), unit: 's', steps: ['$\\omega_0 = \\sqrt{k/m} = \\sqrt{' + w0 * w0 + '} = ' + w0 + '$ rad/s.', 'One full cycle takes $T = \\frac{2\\pi}{\\omega_0} = \\frac{2\\pi}{' + w0 + '} = ' + T.coef(q(2, w0), '\\pi') + ' \\approx ' + (2 * Math.PI / w0).toFixed(3) + '$ s.'], hint: 'Period $= 2\\pi/\\omega_0$ with $\\omega_0 = \\sqrt{k/m}$.' };
    }
    if (kind === 'classify' || kind === 'crit') {
      var crit = m.mul(k).mul(4); // c^2 vs 4mk; c_crit = 2 sqrt(mk) = 2 m w0
      var cc = m.mul(2 * w0);
      if (kind === 'crit') { chk({ topic: 'de.free-vibrations', kind: 'crit', m: m.toNumber(), k: k.toNumber(), ans: cc.toNumber() });
        return { q: sys + '. What damping coefficient $c$ (in N·s/m) makes the system critically damped?', a: num(cc.toPlain()), steps: ['The characteristic equation $' + T.coef(m, 'r^{2}') + ' + cr + ' + qd(k) + ' = 0$ has a repeated root when the discriminant is 0: $c^{2} = 4mk$.', '$c = 2\\sqrt{mk} = 2\\sqrt{' + qd(m) + '\\cdot ' + qd(k) + '} = ' + qd(cc) + '$.'], hint: 'Critical damping: $c^2 - 4mk = 0$.' }; }
      var which = R.int(0, 2), c = which === 1 ? cc : which === 0 ? cc.mul(R.pick([q(1, 2), q(1, 4), q(3, 4)])) : cc.mul(R.pick([2, 3, q(5, 4)]));
      var disc = c.mul(c).sub(crit), ans = disc.sign() < 0 ? 'underdamped' : disc.isZero() ? 'critically damped' : 'overdamped';
      chk({ topic: 'de.free-vibrations', kind: 'class', m: m.toNumber(), c: c.toNumber(), k: k.toNumber(), ans: ans });
      return { q: 'A spring system has mass $m = ' + qd(m) + '$ kg, damping $c = ' + qd(c) + '$ N·s/m and stiffness $k = ' + qd(k) + '$ N/m. How does it move?', a: mc(R, ans, ['underdamped', 'critically damped', 'overdamped'].filter(function (z) { return z !== ans; })),
        steps: ['$mx\'\' + cx\' + kx = 0$ has characteristic roots $r = \\frac{-c \\pm \\sqrt{c^{2} - 4mk}}{2m}$.', '$c^{2} - 4mk = ' + qd(c.mul(c)) + ' - ' + qd(crit) + ' = ' + qd(disc) + '$.', disc.sign() < 0 ? 'Negative: complex roots, so it oscillates while the swings shrink (underdamped).' : disc.isZero() ? 'Zero: a repeated root, the fastest return without oscillating (critically damped).' : 'Positive: two negative real roots, so it returns slowly without oscillating (overdamped).'],
        hint: 'Compare $c^2$ with $4mk$.' };
    }
    var x0 = q(R.pick([1, 2, -1, '0.5', '0.2', 3])), v0 = q(R.pick([0, 1, -2, 3, 4, -4]));
    if (kind === 'undamped' || kind === 'amp') {
      if (kind === 'amp') { var pr = R.pick([[3, 4], [4, 3], [5, 12], [6, 8], [1, 1], [1, 2], [2, 1]]); x0 = q(pr[0]); v0 = q(pr[1] * w0).mul(R.sign()); }
      var stretch = R.chance(0.5) && kind === 'undamped', Lst = m.mul('9.8').div(k);
      var sys2 = stretch ? 'A ' + qdt(m) + ' kg mass stretches a spring ' + qdt(Lst) + ' m when it hangs at rest (use $g = 9.8$ m/s²)' : sys;
      var sol = lc([tm(x0, B.cos(w0)), tm(v0.div(w0), B.sin(w0))]);
      chk({ topic: 'de.free-vibrations', kind: 'ivp', ode: [m.toNumber(), 0, k.toNumber()], g: 0, ic: [0, x0.toNumber(), v0.toNumber()], ans: sol.pl });
      var base = (stretch ? ['Hooke\'s law at rest: $k \\cdot ' + qd(Lst) + ' = ' + qd(m) + '(9.8)$, so $k = ' + qd(k) + '$ N/m.'] : []).concat(['$' + T.coef(m, "x''") + ' + ' + qd(k) + 'x = 0$, so $\\omega_0 = \\sqrt{' + qd(k.div(m)) + '} = ' + w0 + '$ and $x = c_1\\cos ' + w0 + 't + c_2\\sin ' + w0 + 't$.', '$x(0) = c_1 = ' + qd(x0) + "$ and $x'(0) = " + w0 + 'c_2 = ' + qd(v0) + '$, so $c_2 = ' + v0.div(w0).toTex() + '$.', '$x(t) = ' + sol.tex + '$.']);
      var setupS = sys2 + '. It is set in motion from $x(0) = ' + qd(x0) + "$ m with velocity $x'(0) = " + qd(v0) + '$ m/s (no damping).';
      if (kind === 'undamped') return { q: setupS + ' Find its position $x(t)$.', a: ex(sol.pl), steps: base, hint: 'Find $\\omega_0 = \\sqrt{k/m}$, then fit $x = c_1\\cos \\omega_0t + c_2\\sin \\omega_0t$ to the initial data.' };
      var A2 = x0.mul(x0).add(v0.div(w0).pow(2));
      return { q: setupS + ' What is the amplitude of the motion, in meters?', a: num('sqrt(' + A2.toPlain() + ')', { tol: 0.001 }), unit: 'm', steps: base.concat(['Writing $x = R\\cos(' + w0 + 't - \\delta)$: $R = \\sqrt{c_1^{2} + c_2^{2}} = \\sqrt{' + qd(x0.mul(x0)) + ' + ' + qd(v0.div(w0).pow(2)) + '} = ' + T.sqrt(A2.isInt() ? A2.num() : A2.toTex()).replace('\\sqrt{' + A2.toTex() + '}', '\\sqrt{' + A2.toTex() + '}') + '$.']), hint: 'The amplitude of $c_1\\cos \\omega t + c_2\\sin \\omega t$ is $\\sqrt{c_1^2 + c_2^2}$.' };
    }
    // damped (underdamped) IVP with m = 1 or scaled
    var o = mkHom(R, 'cx'); while (o.al.sign() >= 0) o = mkHom(R, 'cx');
    var mm = R.pick([1, 2]), cs = o.cs.map(function (c) { return c.mul(mm); }), kk = pickC(R, o), solD = homSol(o, kk.c1, kk.c2);
    chk({ topic: 'de.free-vibrations', kind: 'ivp', ode: cs.map(function (c) { return c.toNumber(); }), g: 0, ic: [0, kk.y0.toNumber(), kk.v0.toNumber()], ans: solD.pl });
    return { q: 'A damped spring obeys $' + odeLhs(cs, 'x') + ' = 0$ (mass ' + mm + ' kg), with $x(0) = ' + kk.y0.toTex() + "$ m and $x'(0) = " + kk.v0.toTex() + '$ m/s. Find $x(t)$.', a: ex(solD.pl),
      steps: (mm === 1 ? [] : ['Divide by ' + mm + ': $' + o.lhs.replace(/y/g, 'x') + ' = 0$.']).concat(ivpSteps(o, kk.c1, kk.c2, kk.y0, kk.v0).map(function (s) { return s.replace(/y\(0\)/g, 'x(0)').replace(/y'\(0\)/g, "x'(0)").replace(/\$y = /g, '$x = '); }), ['Underdamped: it oscillates with angular frequency ' + o.be.toTex() + ' inside the shrinking envelope $e^{' + kv(o.al) + '}$.']),
      hint: 'Solve the characteristic equation; complex roots $\\alpha \\pm \\beta i$ give $e^{\\alpha t}(c_1\\cos \\beta t + c_2\\sin \\beta t)$.' };
  });

  // ---------- de.forced-resonance ----------
  G('de.forced-resonance', function (R, ctx) {
    var kind = pickKind(R, ctx, ['res', 'amp'], ['xp', 'amp', 'beats'], ['pure', 'beats', 'damp']);
    var m = q(R.pick([1, 1, 2, '0.5'])), w0 = R.int(2, 5), k = m.mul(w0 * w0), w = R.intNot(1, 6, [w0]), F0 = R.pick([2, 3, 4, 6, 8, 10, 12]);
    var eq = function (ww) { return T.coef(m, "x''") + ' + ' + qd(k) + 'x = ' + F0 + '\\cos ' + kv(ww); };
    if (kind === 'res') {
      chk({ topic: 'de.forced-resonance', kind: 'res', m: m.toNumber(), k: k.toNumber(), ans: w0 });
      return { q: 'An undamped spring with mass ' + qd(m) + ' kg and spring constant ' + qd(k) + ' N/m is driven by a force $F_0\\cos \\omega t$. For which driving frequency $\\omega$ (in rad/s) does resonance occur?', a: num(w0), unit: 'rad/s',
        steps: ['Resonance happens when the driving frequency matches the natural frequency.', '$\\omega_0 = \\sqrt{k/m} = \\sqrt{' + qd(k.div(m)) + '} = ' + w0 + '$ rad/s.', 'Then the guess $A\\cos \\omega t$ solves the homogeneous equation, the particular solution needs a factor $t$, and the amplitude grows without bound.'], hint: 'Find the natural frequency $\\sqrt{k/m}$.' };
    }
    var Amp = q(F0).div(k.sub(m.mul(w * w)));
    var base = ['Try $x_p = A\\cos ' + kv(w) + '$ (no sine is needed: there is no $x\'$ term).', 'Substitute: $(' + qd(k) + ' - ' + qd(m) + '\\cdot ' + w * w + ')A\\cos ' + kv(w) + ' = ' + F0 + '\\cos ' + kv(w) + '$, so $A = \\frac{' + F0 + '}{' + qd(k.sub(m.mul(w * w))) + '} = ' + Amp.toTex() + '$.'];
    if (kind === 'xp' || kind === 'amp') {
      var xp = lc([tm(Amp, B.cos(w))]);
      chk({ topic: 'de.forced-resonance', kind: 'xp', ode: [m.toNumber(), 0, k.toNumber()], g: F0 + '*cos(' + w + 't)', ans: xp.pl });
      if (kind === 'xp') return { q: 'Find the steady periodic (particular) solution of $' + eq(w) + '$ of the form $x_p = A\\cos ' + kv(w) + '$.', a: ex(xp.pl), steps: base.concat(['$x_p = ' + xp.tex + '$.']), hint: 'Substitute $A\\cos \\omega t$ and solve for $A$.' };
      return { q: 'For $' + eq(w) + '$ (an undamped spring with mass ' + qd(m) + ' kg), what is the amplitude of the steady periodic response $x_p$?', a: num(Amp.abs().toPlain()), unit: 'm', steps: base.concat(['The amplitude is $|A| = ' + Amp.abs().toTex() + '$. ' + (Amp.sign() < 0 ? '(The negative sign means the response is out of phase with the force, since $\\omega > \\omega_0$.)' : '')]), hint: 'Find $A$ in $x_p = A\\cos \\omega t$; the amplitude is $|A|$.' };
    }
    if (kind === 'beats') {
      var solB = lc([tm(Amp, B.cos(w)), tm(Amp.neg(), B.cos(w0))]);
      chk({ topic: 'de.forced-resonance', kind: 'ivp', ode: [m.toNumber(), 0, k.toNumber()], g: F0 + '*cos(' + w + 't)', ic: [0, 0, 0], ans: solB.pl });
      return { q: 'Solve $' + eq(w) + '$ with $x(0) = 0$ and $x\'(0) = 0$ (starting from rest).', a: ex(solB.pl),
        steps: base.concat(['General solution: $x = c_1\\cos ' + kv(w0) + ' + c_2\\sin ' + kv(w0) + T.signed(Amp) + '\\cos ' + kv(w) + '$.', "$x(0) = c_1" + T.signed(Amp) + " = 0$ gives $c_1 = " + Amp.neg().toTex() + "$; $x'(0) = " + w0 + 'c_2 = 0$ gives $c_2 = 0$.', '$x = ' + solB.tex + '$: two nearby frequencies interfere and produce beats when $\\omega$ is close to $\\omega_0$.']),
        hint: 'Find $x_p$, add $c_1\\cos \\omega_0t + c_2\\sin \\omega_0t$, and use $x(0) = x\'(0) = 0$.' };
    }
    if (kind === 'pure') {
      var Ap = q(F0).div(m.mul(2 * w0)), solP = lc([tm(Ap, B.mul(B.pow(1), B.sin(w0)))]);
      chk({ topic: 'de.forced-resonance', kind: 'ivp', ode: [m.toNumber(), 0, k.toNumber()], g: F0 + '*cos(' + w0 + 't)', ic: [0, 0, 0], ans: solP.pl });
      return { q: 'Solve $' + eq(w0) + '$ with $x(0) = 0$ and $x\'(0) = 0$.', a: ex(solP.pl),
        steps: ['$\\omega_0 = \\sqrt{' + qd(k.div(m)) + '} = ' + w0 + '$ equals the driving frequency: resonance. $A\\cos ' + kv(w0) + '$ solves the homogeneous equation, so try $x_p = t(A\\cos ' + kv(w0) + ' + B\\sin ' + kv(w0) + ')$.',
          'Substituting into $' + T.coef(m, "x''") + ' + ' + qd(k) + 'x$ leaves $' + T.coef(m.mul(2 * w0), '(-A\\sin ' + kv(w0) + ' + B\\cos ' + kv(w0) + ')') + ' = ' + F0 + '\\cos ' + kv(w0) + '$, so $A = 0$, $B = ' + Ap.toTex() + '$.',
          '$x = c_1\\cos ' + kv(w0) + ' + c_2\\sin ' + kv(w0) + T.coef(Ap, 't\\sin ' + kv(w0), false) + '$, and $x(0) = x\'(0) = 0$ give $c_1 = c_2 = 0$.', '$x = ' + solP.tex + '$: the amplitude grows like $t$.'],
        hint: 'At resonance the particular solution needs an extra factor of $t$.' };
    }
    var trip = R.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [12, 5, 13], [8, 6, 10]]), sc = 1, wd = R.int(1, 3), cd = trip[1] / wd, md = 1, kd = trip[0] + wd * wd;
    var ampD = q(F0, trip[2]);
    chk({ topic: 'de.forced-resonance', kind: 'damp', m: md, c: cd, k: kd, w: wd, F0: F0, ans: ampD.toNumber() });
    return { q: 'A damped spring obeys $x\'\'' + T.coef(q(trip[1], wd), "x'", false) + ' + ' + kd + 'x = ' + F0 + '\\cos ' + kv(wd) + '$. What is the amplitude of the steady periodic response?', a: num(ampD.toPlain()), unit: 'm',
      steps: ['For $mx\'\' + cx\' + kx = F_0\\cos \\omega t$, the steady response has amplitude $\\dfrac{F_0}{\\sqrt{(k - m\\omega^{2})^{2} + (c\\omega)^{2}}}$.', 'Here $k - m\\omega^{2} = ' + kd + ' - ' + wd * wd + ' = ' + trip[0] + '$ and $c\\omega = ' + q(trip[1], wd).toTex() + '\\cdot ' + wd + ' = ' + trip[1] + '$.', 'Amplitude $= \\frac{' + F0 + '}{\\sqrt{' + trip[0] * trip[0] + ' + ' + trip[1] * trip[1] + '}} = \\frac{' + F0 + '}{' + trip[2] + '} = ' + ampD.toTex() + '$.'],
      hint: 'Use the amplitude formula $F_0/\\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}$ (it comes from solving for $A$ and $B$ in $A\\cos \\omega t + B\\sin \\omega t$).' };
  });

  // ---------- de.rlc-circuits ----------
  G('de.rlc-circuits', function (R, ctx) {
    var kind = pickKind(R, ctx, ['w0', 'classify'], ['Rcrit', 'ivp', 'classify'], ['ivp', 'current']);
    if (kind === 'w0' || kind === 'Rcrit') {
      var L = q(R.pick([1, 2, '0.5', '0.1'])), n = R.pick([2, 4, 5, 10, 20]), C = q(1).div(L.mul(n * n)); // 1/sqrt(LC) = n
      if (kind === 'w0') { chk({ topic: 'de.rlc-circuits', kind: 'w0', L: L.toNumber(), C: C.toNumber(), ans: n });
        return { q: 'An LC circuit has inductance $L = ' + qd(L) + '$ H and capacitance $C = ' + qd(C) + '$ F (no resistance). What is its natural angular frequency in rad/s?', a: num(n), unit: 'rad/s', steps: ["$Lq'' + \\frac{1}{C}q = 0$ is a spring equation with “mass” $L$ and “stiffness” $1/C$.", '$\\omega_0 = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{' + qd(L.mul(C)) + '}} = ' + n + '$ rad/s.'], hint: 'Match $Lq\'\' + q/C = 0$ with $mx\'\' + kx = 0$: $\\omega_0 = 1/\\sqrt{LC}$.' }; }
      var Rc = q(2).mul(n).mul(L); // 2 sqrt(L/C) = 2 L n
      chk({ topic: 'de.rlc-circuits', kind: 'Rcrit', L: L.toNumber(), C: C.toNumber(), ans: Rc.toNumber() });
      return { q: 'An RLC circuit has $L = ' + qd(L) + '$ H and $C = ' + qd(C) + '$ F. What resistance $R$ (in ohms) makes it critically damped?', a: num(Rc.toPlain()), unit: 'Ω', steps: ["$Lq'' + Rq' + \\frac{1}{C}q = 0$ has characteristic equation $Lr^{2} + Rr + \\frac{1}{C} = 0$.", 'Critical damping: $R^{2} = \\frac{4L}{C} = ' + qd(L.mul(4).div(C)) + '$.', '$R = ' + qd(Rc) + '$ Ω.'], hint: 'Set the discriminant $R^2 - 4L/C$ to zero.' };
    }
    if (kind === 'classify') {
      var L2 = q(R.pick([1, 2, '0.5'])), C2 = q(R.pick(['0.01', '0.02', '0.05', '0.1', '0.25'])), crit = L2.mul(4).div(C2), which = R.int(0, 2);
      var Rr = which === 1 ? null : q(which === 0 ? R.pick([1, 2, 4]) : R.pick([40, 60, 100, 200])), disc;
      if (which === 1) { var s = Math.sqrt(crit.toNumber()); if (Math.abs(s - Math.round(s)) < 1e-9) Rr = q(Math.round(s)); else { Rr = q(1); which = 0; } }
      disc = Rr.mul(Rr).sub(crit); var ans = disc.sign() < 0 ? 'underdamped' : disc.isZero() ? 'critically damped' : 'overdamped';
      chk({ topic: 'de.rlc-circuits', kind: 'class', L: L2.toNumber(), R: Rr.toNumber(), C: C2.toNumber(), ans: ans });
      return { q: 'An RLC circuit has $L = ' + qd(L2) + '$ H, $R = ' + qd(Rr) + '$ Ω and $C = ' + qd(C2) + '$ F. After a disturbance, is the charge underdamped, critically damped or overdamped?', a: mc(R, ans, ['underdamped', 'critically damped', 'overdamped'].filter(function (z) { return z !== ans; })),
        steps: ['Compare $R^{2}$ with $\\frac{4L}{C}$ (the discriminant of $Lr^{2} + Rr + \\frac{1}{C} = 0$).', '$R^{2} = ' + qd(Rr.mul(Rr)) + '$ and $\\frac{4L}{C} = ' + qd(crit) + '$.', disc.sign() < 0 ? 'Smaller: complex roots, so the charge oscillates as it decays (underdamped).' : disc.isZero() ? 'Equal: critically damped.' : 'Larger: real roots, no oscillation (overdamped).'], hint: 'Underdamped when $R^2 < 4L/C$.' };
    }
    // IVP: L q'' + R q' + q/C = E, q(0) = 0, i(0) = 0, with L = 1
    var o = mkHom(R, R.pick(['cx', 'cx', 'real'])); var tries = 0;
    while ((o.type === 'real' ? !(o.r1.sign() < 0 && o.r2.sign() < 0) : o.al.sign() >= 0) && tries++ < 40) o = mkHom(R, R.pick(['cx', 'real']));
    var Rv = o.cs[1], invC = o.cs[2], Cv = q(1).div(invC), E = R.pick([1, 2, 5, 10, 12]), qss = Cv.mul(E);
    var cc1 = qss.neg(), cc2;
    if (o.type === 'cx') cc2 = o.al.mul(qss).div(o.be); else { cc2 = null; }
    var hom, solq;
    if (o.type === 'cx') { hom = homSol(o, cc1, cc2); solq = joinSum(lc([tm(qss)]), hom); }
    else { var A = qss.mul(o.r2).div(o.r1.sub(o.r2)), Bc = qss.neg().sub(A); solq = lc([tm(qss), tm(A, B.e(o.r1)), tm(Bc, B.e(o.r2))]); cc1 = A; cc2 = Bc; }
    chk({ topic: 'de.rlc-circuits', kind: 'ivp', ode: [1, Rv.toNumber(), invC.toNumber()], g: E, ic: [0, 0, 0], ans: solq.pl, aux: kind !== 'ivp' });
    var circuit = 'An RLC circuit has $L = 1$ H, $R = ' + qd(Rv) + '$ Ω and $C = ' + Cv.toTex() + '$ F, driven by a constant ' + E + ' V source. The capacitor starts uncharged and no current flows at $t = 0$.';
    var st = ["Kirchhoff: $q'' + " + (Rv.eq(1) ? '' : qd(Rv)) + "q' + " + qd(invC) + 'q = ' + E + '$ (with $i = q\'$).', 'Equilibrium (steady) charge: $q = CE = ' + qss.toTex() + '$ C.', 'Characteristic equation $r^{2} + ' + (Rv.eq(1) ? '' : qd(Rv)) + 'r + ' + qd(invC) + ' = 0$: ' + (o.type === 'cx' ? 'roots $' + o.al.toTex() + ' \\pm ' + (o.be.eq(1) ? '' : o.be.toTex()) + 'i$.' : 'roots $' + o.r1.toTex() + '$ and $' + o.r2.toTex() + '$.'),
      o.type === 'cx' ? 'So $q = ' + qss.toTex() + ' + ' + genTex(o) + '$. $q(0) = 0$ gives $c_1 = ' + cc1.toTex() + '$; $q\'(0) = ' + T.terms([[o.al, 'c_1'], [o.be, 'c_2']]) + ' = 0$ gives $c_2 = ' + cc2.toTex() + '$.'
        : 'So $q = ' + qss.toTex() + ' + ' + genTex(o) + '$. $q(0) = 0$ and $q\'(0) = 0$ give $c_1 + c_2 = ' + qss.neg().toTex() + '$ and $' + T.terms([[o.r1, 'c_1'], [o.r2, 'c_2']]) + ' = 0$, so $c_1 = ' + cc1.toTex() + '$, $c_2 = ' + cc2.toTex() + '$.',
      '$q(t) = ' + solq.tex + '$.'];
    if (kind === 'ivp') return { q: circuit + ' Find the charge $q(t)$.', a: ex(solq.pl), steps: st, hint: 'Solve $Lq\'\' + Rq\' + q/C = E$: a constant particular solution $CE$ plus the homogeneous solution.' };
    var cur = { pl: null };
    // current i = q'
    var dterms = o.type === 'cx' ? [[cc1, BF.ecos(o.al, o.be)], [cc2, BF.esin(o.al, o.be)]] : [[cc1, BF.exp(o.r1)], [cc2, BF.exp(o.r2)]];
    if (o.type === 'cx') { var a1 = cc1.mul(o.al).add(cc2.mul(o.be)), a2 = cc2.mul(o.al).sub(cc1.mul(o.be)); cur = prodLc(B.e(o.al), [tm(a1, B.cos(o.be)), tm(a2, B.sin(o.be))]); }
    else cur = lc([tm(cc1.mul(o.r1), B.e(o.r1)), tm(cc2.mul(o.r2), B.e(o.r2))]);
    chk({ topic: 'de.rlc-circuits', kind: 'current', q: solq.pl, ans: cur.pl });
    return { q: circuit + ' Find the current $i(t) = q\'(t)$.', a: ex(cur.pl), steps: st.concat(['Differentiate: $i(t) = q\'(t) = ' + cur.tex + '$.']), hint: 'Find $q(t)$ first, then differentiate.' };
  });

  // ---------- de.higher-order ----------
  function hoBuild(R, L) {
    var kinds = L === 1 ? ['real3'] : ['real3', 'rep3', 'cx3', 'quart'], kd = R.pick(kinds), roots = [], fs = [], gen = [], desc;
    if (kd === 'real3') { var rs = R.ints(3, -3, 3, true).sort(function (a, b) { return a - b; }); rs.forEach(function (r, i) { roots.push(q(r)); fs.push(BF.exp(r)); gen.push('c_' + (i + 1) + (r === 0 ? '' : 'e^{' + kv(r) + '}')); }); desc = 'three distinct real roots'; }
    else if (kd === 'rep3') { var a = R.int(-2, 2), b = R.intNot(-3, 3, [a]); roots = [q(a), q(a), q(b)]; fs = [BF.exp(a), BF.texp(a, 1), BF.exp(b)]; gen = ['c_1' + (a === 0 ? '' : 'e^{' + kv(a) + '}'), 'c_2t' + (a === 0 ? '' : 'e^{' + kv(a) + '}'), 'c_3' + (b === 0 ? '' : 'e^{' + kv(b) + '}')]; desc = 'a double root $' + a + '$ and a simple root $' + b + '$'; }
    else if (kd === 'cx3') { var r0 = R.int(-2, 2), w = R.int(1, 3); roots = [q(r0), 'cx', w]; fs = [BF.exp(r0), BF.cos(w), BF.sin(w)]; gen = ['c_1' + (r0 === 0 ? '' : 'e^{' + kv(r0) + '}'), 'c_2\\cos ' + kv(w), 'c_3\\sin ' + kv(w)]; desc = 'roots $' + r0 + '$ and $\\pm ' + (w === 1 ? '' : w) + 'i$'; }
    else { var k = R.int(1, 2); roots = ['quart', k]; fs = [BF.exp(k), BF.exp(-k), BF.cos(k), BF.sin(k)]; gen = ['c_1e^{' + kv(k) + '}', 'c_2e^{' + kv(-k) + '}', 'c_3\\cos ' + kv(k), 'c_4\\sin ' + kv(k)]; desc = 'roots $\\pm ' + k + '$ and $\\pm ' + (k === 1 ? '' : k) + 'i$'; }
    var poly;
    if (kd === 'real3' || kd === 'rep3') { poly = [q(1)]; roots.forEach(function (r) { poly = polyMul(poly, [1, r.neg()]); }); }
    else if (kd === 'cx3') { poly = polyMul([1, roots[0].neg()], [1, 0, roots[2] * roots[2]]); }
    else { var k4 = roots[1]; poly = [q(1), q(0), q(0), q(0), q(-Math.pow(k4, 4))]; }
    var facT;
    if (kd === 'real3' || kd === 'rep3') facT = charFactorTex(1, roots);
    else if (kd === 'cx3') facT = (roots[0].isZero() ? 'r' : '(' + T.lin(1, 'r', roots[0].neg()) + ')') + '(r^{2} + ' + roots[2] * roots[2] + ')';
    else facT = '(r^{2} - ' + roots[1] * roots[1] + ')(r^{2} + ' + roots[1] * roots[1] + ')';
    return { kd: kd, poly: poly, fs: fs, gen: gen, desc: desc, facT: facT, lhs: odeLhs(poly), charT: charTex(poly), roots: roots };
  }
  G('de.higher-order', function (R, ctx) {
    var L = lv(ctx), kind = pickKind(R, ctx, ['roots', 'gen'], ['ivp', 'gen'], ['ivp']);
    var h = hoBuild(R, kind === 'roots' ? 1 : L);
    var rootSt = ['Try $y = e^{rt}$: $' + h.charT + ' = 0$.', 'Factor: $' + h.facT + ' = 0$, giving ' + h.desc + '.', 'General solution: $y = ' + h.gen.join(' + ') + '$.'];
    if (kind === 'roots') {
      var rr = U.uniq(h.roots.map(function (r) { return r.toPlain(); }));
      chk({ topic: 'de.higher-order', kind: 'roots', poly: h.poly.map(function (c) { return c.toNumber(); }), ans: rr.map(Number) });
      return { q: 'Find the roots of the characteristic equation of $' + h.lhs + ' = 0$.', a: { t: 'set', v: rr }, steps: rootSt.slice(0, 2), hint: 'Look for a common factor of $r$ or an integer root that divides the constant term, then factor.' };
    }
    if (kind === 'gen') {
      var right = h.gen.join(' + '), wr = [];
      if (h.kd === 'rep3') { wr.push(h.gen[0] + ' + ' + h.gen[1].replace('c_2t', 'c_2') + ' + ' + h.gen[2]); }
      if (h.kd === 'cx3') { wr.push(h.gen[0] + ' + c_2e^{' + kv(h.roots[2]) + '} + c_3e^{' + kv(-h.roots[2]) + '}'.replace('e^{-1t}', 'e^{-t}')); wr.push(h.gen[0] + ' + c_2\\cos ' + kv(h.roots[2] * h.roots[2]) + ' + c_3\\sin ' + kv(h.roots[2] * h.roots[2])); }
      if (h.kd === 'quart') { wr.push('c_1e^{' + kv(h.roots[1]) + '} + c_2e^{' + kv(-h.roots[1]) + '}'); wr.push('c_1e^{' + kv(h.roots[1]) + '} + c_2e^{' + kv(-h.roots[1]) + '} + c_3e^{' + kv(h.roots[1]) + '} + c_4e^{' + kv(-h.roots[1]) + '}'); }
      if (h.kd === 'real3') { wr.push(h.gen.slice(0, 2).join(' + ')); wr.push(h.gen.map(function (g) { return g.replace(/e\^\{(-?)(\d*)t\}/, function (m0, s, d) { return 'e^{' + (s ? '' : '-') + d + 't}'; }); }).join(' + ')); }
      wr.push(h.gen.slice(0, -1).join(' + ') + ' + c_' + h.gen.length + 't');
      var wrU = U.uniq(wr.filter(function (z) { return z !== right; }));
      return { q: 'Which is the general solution of $' + h.lhs + ' = 0$?', a: mc(R, '$y = ' + right + '$', wrU.slice(0, 3).map(function (z) { return '$y = ' + z + '$'; })), steps: rootSt.concat(['An equation of order ' + (h.poly.length - 1) + ' needs ' + (h.poly.length - 1) + ' independent solutions, one for each root counted with multiplicity.']), hint: 'Find all the roots (with multiplicity); each one contributes a solution.' };
    }
    var n = h.fs.length, cs = []; for (var i = 0; i < n; i++) cs.push(q(R.int(-2, 3)));
    if (cs.every(function (c) { return c.isZero(); })) cs[0] = q(1);
    var ic = icVals(cs, h.fs, n), sol = lc(cs.map(function (c, i) { return tm(c, h.fs[i].b); }));
    chk({ topic: 'de.higher-order', kind: 'ivp', ode: h.poly.map(function (c) { return c.toNumber(); }), g: 0, ic: [0].concat(ic.map(function (x) { return x.toNumber(); })), ans: sol.pl });
    var icT = ic.map(function (v, j) { return '$' + D(j) + '(0) = ' + v.toTex() + '$'; });
    return { q: 'Solve $' + h.lhs + ' = 0$ with ' + U.list(icT) + '.', a: ex(sol.pl),
      steps: rootSt.concat(['Differentiate the general solution ' + (n - 1) + ' times and set $t = 0$: ' + ic.map(function (v, j) { return '$' + T.terms(h.fs.map(function (f, i) { return [f.d(j), 'c_' + (i + 1)]; })) + ' = ' + v.toTex() + '$'; }).join(', ') + '.', 'Solving them: ' + cs.map(function (c, i) { return '$c_' + (i + 1) + ' = ' + c.toTex() + '$'; }).join(', ') + '.', '$y = ' + sol.tex + '$.']),
      hint: 'Find all the roots, write the general solution with ' + n + ' constants, and use the ' + n + ' initial conditions.' };
  });

// ---- u5.js
  // =====================================================================================================
  // UNIT 4: Laplace Transforms
  // =====================================================================================================
  // A transform term: numerator polynomial in s (Q coefficients, high -> low) over a denominator { tex, pl }.
  function sDen(kind, a, b, n) { // denominators
    a = q(a || 0); b = q(b || 0);
    var sa = a.isZero() ? 's' : T.lin(1, 's', a.neg()), saP = a.isZero() ? 's' : 's' + (a.sign() > 0 ? ' - ' + a.toPlain() : ' + ' + a.neg().toPlain());
    if (kind === 'lin') return n && n > 1 ? { tex: (a.isZero() ? 's' : '(' + sa + ')') + '^{' + n + '}', pl: (a.isZero() ? 's' : '(' + saP + ')') + '^' + n } : { tex: sa, pl: saP };
    if (kind === 'quad') { var b2 = b.mul(b); return a.isZero() ? { tex: 's^{2} + ' + b2.toTex(), pl: 's^2 + ' + b2.toPlain() } : { tex: '(' + sa + ')^{2} + ' + b2.toTex(), pl: '(' + saP + ')^2 + ' + b2.toPlain() }; }
    if (kind === 'quadm') { var c2 = b.mul(b); return { tex: 's^{2} - ' + c2.toTex(), pl: 's^2 - ' + c2.toPlain() }; }
    if (kind === 'quad2') { var d2 = b.mul(b); return { tex: '(s^{2} + ' + d2.toTex() + ')^{2}', pl: '(s^2 + ' + d2.toPlain() + ')^2' }; }
    if (kind === 'raw') return { tex: a, pl: b };
  }
  function sTerm(num, den, expo) { // { tex, pl, neg } ; expo: optional c for a factor e^{-cs}
    num = num.map(function (c) { return q(c); }); while (num.length > 1 && num[0].isZero()) num.shift();
    var neg = false, single = num.length === 1;
    if (single && num[0].sign() < 0) { neg = true; num = [num[0].neg()]; }
    var ef = expo ? 'e^{-' + kv(expo, 's') + '}' : '', efP = expo ? 'e^(-' + kv(expo, 's') + ')' : '';
    var nT = T.poly(num, 's'), nP = single ? num[0].toPlain() : lc(num.map(function (c, i) { var k = num.length - 1 - i; return tm(c, k === 0 ? ONE : B.pow(k, 's')); })).pl;
    if (ef) { nT = (nT === '1' ? '' : single ? nT : '(' + nT + ')') + ef; nP = (nP === '1' ? '' : single ? nP + '*' : '(' + nP + ')') + efP; }
    if (den === null) return { tex: nT, pl: nP, neg: neg, stex: (neg ? '-' : '') + nT, spl: (neg ? '-' : '') + nP };
    var denP = atomic(den.pl) ? den.pl : '(' + den.pl + ')', numP = atomic(nP) || /^[\w.]+\*?e\^\([^()]*\)$/.test(nP) ? nP : '(' + nP + ')';
    var o = { tex: '\\frac{' + nT + '}{' + den.tex + '}', pl: numP + '/' + denP, neg: neg };
    o.stex = (neg ? '-' : '') + o.tex; o.spl = (neg ? '-' : '') + o.pl; return o;
  }
  function atomic(z) { // a name/number, or one parenthesized group (optionally ^n): safe after "/"
    if (/^[\w.]+$/.test(z)) return true;
    var m = /^\((.*)\)(\^\d+)?$/.exec(z); if (!m) return false;
    var d = 0; for (var i = 0; i < z.length; i++) { if (z[i] === '(') d++; else if (z[i] === ')') { d--; if (d === 0 && i < z.length - 1 - (m[2] ? m[2].length : 0)) return false; } }
    return true;
  }
  function linS(a) { a = q(a); return a.isZero() ? 's' : a.sign() > 0 ? 's - ' + a.toPlain() : 's + ' + a.neg().toPlain(); }
  function sSum(terms) { var tex = '', pl = ''; terms.forEach(function (t, i) { if (!t) return; tex += (tex ? (t.neg ? ' - ' : ' + ') : (t.neg ? '-' : '')) + t.tex; pl += (pl ? (t.neg ? ' - ' : ' + ') : (t.neg ? '-' : '')) + t.pl; }); return { tex: tex || '0', pl: pl || '0' }; }
  var FACT = [1, 1, 2, 6, 24, 120];
  // basic transform pairs: f(t) (TeX, plain) -> F(s) term, scaled by c
  function lap(R, kind, c) {
    c = q(c); var a = R.nz(-4, 4), b = R.int(1, 5), n = R.int(1, 3);
    if (kind === 'const') return { fT: T.mono(c, ''), fP: c.toPlain(), F: sTerm([c], sDen('lin', 0)), rule: '\\mathcal{L}\\{1\\} = \\frac{1}{s}', s0: 0 };
    if (kind === 'exp') return { fT: T.coef(c, 'e^{' + kv(a) + '}'), fP: c.toPlain() + '*e^(' + kv(a) + ')', F: sTerm([c], sDen('lin', a)), rule: '\\mathcal{L}\\{e^{at}\\} = \\frac{1}{s - a}', s0: a };
    if (kind === 'pow') return { fT: T.coef(c, tpw(n)), fP: c.toPlain() + '*t^' + n, F: sTerm([c.mul(FACT[n])], sDen('lin', 0, 0, n + 1)), rule: '\\mathcal{L}\\{t^{n}\\} = \\frac{n!}{s^{n+1}}', s0: 0 };
    if (kind === 'sin') return { fT: T.coef(c, '\\sin ' + kv(b)), fP: c.toPlain() + '*sin(' + b + 't)', F: sTerm([c.mul(b)], sDen('quad', 0, b)), rule: '\\mathcal{L}\\{\\sin bt\\} = \\frac{b}{s^{2} + b^{2}}', s0: 0 };
    if (kind === 'cos') return { fT: T.coef(c, '\\cos ' + kv(b)), fP: c.toPlain() + '*cos(' + b + 't)', F: sTerm([c, 0], sDen('quad', 0, b)), rule: '\\mathcal{L}\\{\\cos bt\\} = \\frac{s}{s^{2} + b^{2}}', s0: 0 };
    if (kind === 'esin') return { fT: T.coef(c, 'e^{' + kv(a) + '}\\sin ' + kv(b)), fP: c.toPlain() + '*e^(' + kv(a) + ')*sin(' + b + 't)', F: sTerm([c.mul(b)], sDen('quad', a, b)), rule: '\\mathcal{L}\\{e^{at}\\sin bt\\} = \\frac{b}{(s - a)^{2} + b^{2}}', s0: a };
    if (kind === 'ecos') return { fT: T.coef(c, 'e^{' + kv(a) + '}\\cos ' + kv(b)), fP: c.toPlain() + '*e^(' + kv(a) + ')*cos(' + b + 't)', F: sTerm([c, c.mul(-a)], sDen('quad', a, b)), rule: '\\mathcal{L}\\{e^{at}\\cos bt\\} = \\frac{s - a}{(s - a)^{2} + b^{2}}', s0: a };
    if (kind === 'tnexp') { var m = R.int(1, 2); return { fT: T.coef(c, tpw(m) + 'e^{' + kv(a) + '}'), fP: c.toPlain() + '*t^' + m + '*e^(' + kv(a) + ')', F: sTerm([c.mul(FACT[m])], sDen('lin', a, 0, m + 1)), rule: '\\mathcal{L}\\{t^{n}e^{at}\\} = \\frac{n!}{(s - a)^{n+1}}', s0: a }; }
    if (kind === 'sinh') return { fT: T.coef(c, '\\sinh ' + kv(b)), fP: c.toPlain() + '*sinh(' + b + 't)', F: sTerm([c.mul(b)], sDen('quadm', 0, b)), rule: '\\mathcal{L}\\{\\sinh bt\\} = \\frac{b}{s^{2} - b^{2}}', s0: b };
    if (kind === 'tsin') return { fT: T.coef(c, 't\\sin ' + kv(b)), fP: c.toPlain() + '*t*sin(' + b + 't)', F: sTerm([c.mul(2 * b), 0], sDen('quad2', 0, b)), rule: '\\mathcal{L}\\{t\\sin bt\\} = -\\frac{d}{ds}\\frac{b}{s^{2} + b^{2}} = \\frac{2bs}{(s^{2} + b^{2})^{2}}', s0: 0 };
    if (kind === 'tcos') return { fT: T.coef(c, 't\\cos ' + kv(b)), fP: c.toPlain() + '*t*cos(' + b + 't)', F: sTerm([c, 0, c.mul(-b * b)], sDen('quad2', 0, b)), rule: '\\mathcal{L}\\{t\\cos bt\\} = -\\frac{d}{ds}\\frac{s}{s^{2} + b^{2}} = \\frac{s^{2} - b^{2}}{(s^{2} + b^{2})^{2}}', s0: 0 };
  }
  function lapRec(topic, f, F, s0, extra) { var o = { topic: topic, kind: 'lap', f: f, ans: F, s0: s0 }; if (extra) for (var k in extra) o[k] = extra[k]; chk(o); }

  // ---------- de.laplace-definition ----------
  G('de.laplace-definition', function (R, ctx) {
    var kind = pickKind(R, ctx, ['one', 'dom'], ['combo', 'combo', 'dom'], ['pulse', 'combo']);
    if (kind === 'dom') {
      var a = R.nz(-5, 5), wh = R.pick(['exp', 'exp', 'cosh']);
      return { q: 'For which values of $s$ does the integral $\\displaystyle\\int_0^{\\infty} e^{-st}' + (wh === 'exp' ? 'e^{' + kv(a) + '}' : '\\cosh ' + kv(Math.abs(a))) + '\\,dt$ converge?', a: { t: 'ineq', v: 's > ' + (wh === 'exp' ? a : Math.abs(a)) },
        steps: wh === 'exp' ? ['The integrand is $e^{(' + a + ' - s)t}$.', 'It decays to 0 (and the integral is finite) exactly when the exponent is negative: $' + a + ' - s < 0$.', 'So $s > ' + a + '$, and then the integral equals $\\frac{1}{s' + T.signed(-a) + '}$.']
          : ['$\\cosh ' + kv(Math.abs(a)) + ' = \\frac{1}{2}(e^{' + kv(Math.abs(a)) + '} + e^{' + kv(-Math.abs(a)) + '})$.', 'Both pieces must decay after multiplying by $e^{-st}$: $s > ' + Math.abs(a) + '$ and $s > ' + (-Math.abs(a)) + '$.', 'So $s > ' + Math.abs(a) + '$.'],
        hint: 'Combine the exponentials. When does $e^{kt}$ go to 0 as $t \\to \\infty$?' };
    }
    if (kind === 'one') {
      var k1 = R.pick(['const', 'exp', 'pow', 'sin', 'cos']), c = R.nz(-5, 5), P = lap(R, k1, c);
      lapRec('de.laplace-definition', P.fP, P.F.spl, P.s0);
      return { q: 'Find $\\mathcal{L}\\{' + P.fT + '\\}$.', a: ex(P.F.spl, ['s']), steps: ['From the definition (or the table): $' + P.rule + '$.', 'Linearity lets the constant come out: $\\mathcal{L}\\{' + P.fT + '\\} = ' + P.F.stex + '$.'], hint: 'Use the table entry and pull the constant out front.' };
    }
    if (kind === 'combo') {
      var kinds = R.sample(['const', 'exp', 'pow', 'sin', 'cos'], R.int(2, 3)), parts = kinds.map(function (k) { return lap(R, k, R.nz(-5, 5)); });
      var fT = parts.map(function (p, i) { return i === 0 ? p.fT : (p.fT[0] === '-' ? ' - ' + p.fT.slice(1) : ' + ' + p.fT); }).join(''), fP = parts.map(function (p) { return '(' + p.fP + ')'; }).join(' + ');
      var F = sSum(parts.map(function (p) { return p.F; }));
      lapRec('de.laplace-definition', fP, F.pl, Math.max.apply(null, parts.map(function (p) { return p.s0; })));
      return { q: 'Find $\\mathcal{L}\\{' + fT + '\\}$.', a: ex(F.pl, ['s']), steps: ['The transform is linear: transform each term and add.'].concat(parts.map(function (p) { return '$\\mathcal{L}\\{' + p.fT + '\\} = ' + (p.F.neg ? '-' : '') + p.F.tex + '$ (from $' + p.rule + '$).'; }), ['Total: $' + F.tex + '$.']), hint: 'Transform term by term using the table.' };
    }
    // pulse / step from the definition
    var Tt = R.int(1, 4), c2 = R.nz(-4, 5), which = R.pick(['pulse', 'late', 'pulse']), F2, fT2, fP2, st;
    if (which === 'pulse') { F2 = sSum([sTerm([c2], sDen('lin', 0)), sTerm([-c2], sDen('lin', 0), Tt)]); fT2 = '\\begin{cases} ' + c2 + ' & 0 \\le t < ' + Tt + ' \\\\ 0 & t \\ge ' + Tt + ' \\end{cases}'; fP2 = c2 + '*(1 - sign(t - ' + Tt + '))/2';
      st = ['$F(s) = \\int_0^{' + Tt + '} ' + T.coef(c2, 'e^{-st}') + '\\,dt$ (the integrand is 0 after $t = ' + Tt + '$).', '$= ' + T.coef(c2, '\\left[-\\frac{e^{-st}}{s}\\right]_0^{' + Tt + '}') + ' = ' + T.coef(c2, '\\frac{1 - e^{-' + kv(Tt, 's') + '}}{s}') + '$.', 'So $F(s) = ' + F2.tex + '$ (valid for every $s \\ne 0$).']; }
    else { F2 = sTerm([c2], sDen('lin', 0), Tt); F2 = { tex: (F2.neg ? '-' : '') + F2.tex, pl: (F2.neg ? '-' : '') + F2.pl }; fT2 = '\\begin{cases} 0 & 0 \\le t < ' + Tt + ' \\\\ ' + c2 + ' & t \\ge ' + Tt + ' \\end{cases}'; fP2 = c2 + '*(1 + sign(t - ' + Tt + '))/2';
      st = ['$F(s) = \\int_{' + Tt + '}^{\\infty} ' + T.coef(c2, 'e^{-st}') + '\\,dt$.', '$= ' + T.coef(c2, '\\left[-\\frac{e^{-st}}{s}\\right]_{' + Tt + '}^{\\infty}') + ' = ' + T.coef(c2, '\\frac{e^{-' + kv(Tt, 's') + '}}{s}') + '$ for $s > 0$.', 'So $F(s) = ' + F2.tex + '$.']; }
    lapRec('de.laplace-definition', fP2, F2.pl, 0);
    return { q: 'Use the definition $F(s) = \\int_0^{\\infty} e^{-st}f(t)\\,dt$ to find the Laplace transform of $f(t) = ' + fT2 + '$.', a: ex(F2.pl, ['s']), steps: st, hint: 'Split the integral where $f$ changes, and integrate $e^{-st}$ on each piece.' };
  });

  // ---------- de.laplace-properties ----------
  G('de.laplace-properties', function (R, ctx) {
    var kind = pickKind(R, ctx, ['shift', 'Lypp'], ['ivpY', 'ivpY', 'shift'], ['ivpY', 'tmul']);
    if (kind === 'shift') {
      var k = R.pick(['esin', 'ecos', 'tnexp']), c = R.nz(-4, 4), P = lap(R, k, c);
      lapRec('de.laplace-properties', P.fP, P.F.spl, P.s0);
      return { q: 'Find $\\mathcal{L}\\{' + P.fT + '\\}$.', a: ex(P.F.spl, ['s']), steps: ['First shift theorem: $\\mathcal{L}\\{e^{at}f(t)\\} = F(s - a)$: transform without the exponential, then replace $s$ by $s - a$.', '$' + P.rule + '$.', 'So the answer is $' + P.F.stex + '$.'], hint: 'Transform the part without $e^{at}$, then shift: $s \\to s - a$.' };
    }
    if (kind === 'Lypp') {
      var y0 = R.int(-4, 4), v0 = R.int(-4, 4), ans = lc([tm(1, B.raw('s^{2}Y', 's^2 Y')), tm(-y0, B.pow(1, 's')), tm(-v0)]);
      chk({ topic: 'de.laplace-properties', kind: 'Lypp', y0: y0, v0: v0, ans: ans.pl });
      return { q: "Let $Y(s) = \\mathcal{L}\\{y(t)\\}$ with $y(0) = " + y0 + "$ and $y'(0) = " + v0 + "$. Write $\\mathcal{L}\\{y''\\}$ in terms of $s$ and $Y$.", a: ex(ans.pl, ['s', 'Y']),
        steps: ["Integration by parts gives $\\mathcal{L}\\{y'\\} = sY - y(0)$.", "Apply it twice: $\\mathcal{L}\\{y''\\} = s\\,\\mathcal{L}\\{y'\\} - y'(0) = s^{2}Y - sy(0) - y'(0)$.", 'With the values: $' + ans.tex + '$.'], hint: 'Use $\\mathcal{L}\\{y\'\'\\} = s^2Y - sy(0) - y\'(0)$. Do not drop the initial values.' };
    }
    if (kind === 'tmul') {
      var k2 = R.pick(['tsin', 'tcos', 'tnexp']), c2 = R.nz(-3, 3), P2 = lap(R, k2, c2);
      lapRec('de.laplace-properties', P2.fP, P2.F.spl, P2.s0);
      return { q: 'Use $\\mathcal{L}\\{tf(t)\\} = -F\'(s)$ to find $\\mathcal{L}\\{' + P2.fT + '\\}$.', a: ex(P2.F.spl, ['s']), steps: ['Multiplying by $t$ corresponds to $-\\frac{d}{ds}$ of the transform.', '$' + P2.rule + '$.', 'With the constant: $' + P2.F.stex + '$.'], hint: 'Transform $f$ without the $t$, differentiate in $s$, and change the sign.' };
    }
    // transform an IVP and solve for Y(s)
    var a = R.pick([1, 1, 2]), b = R.int(-4, 4), cc = R.nz(-5, 6), y0b = R.int(-3, 3), v0b = R.int(-3, 3), forced = R.chance(0.5), G0 = R.nz(-4, 4), kf = R.nz(-3, 3);
    if (y0b === 0 && v0b === 0) y0b = 1;
    var numP = [q(a * y0b), q(a * v0b + b * y0b)], den = { tex: charTex([a, b, cc], 's'), pl: lc([tm(a, B.pow(2, 's')), tm(b, B.pow(1, 's')), tm(cc)]).pl };
    var Y1 = sTerm(numP, den), rhsT = forced ? T.coef(G0, 'e^{' + kv(kf) + '}') : '0', Y = sSum([Y1]);
    if (forced) { var Y2 = sTerm([G0], { tex: '(' + T.lin(1, 's', -kf) + ')(' + den.tex + ')', pl: '(' + linS(kf) + ')*(' + den.pl + ')' }); Y = sSum([Y1, Y2]); }
    chk({ topic: 'de.laplace-properties', kind: 'ivpY', ode: [a, b, cc], g: forced ? G0 + '*e^(' + kv(kf) + ')' : '0', ic: [0, y0b, v0b], ans: Y.pl });
    var eqT = odeLhs([a, b, cc]) + ' = ' + rhsT;
    return { q: 'Let $Y(s) = \\mathcal{L}\\{y\\}$ where $' + eqT + '$, $y(0) = ' + y0b + "$, $y'(0) = " + v0b + '$. Find $Y(s)$.', a: ex(Y.pl, ['s']),
      steps: ["Use $\\mathcal{L}\\{y'\\} = sY - y(0)$ and $\\mathcal{L}\\{y''\\} = s^{2}Y - sy(0) - y'(0)$.",
        'Transform: $' + T.terms([[a, '(s^{2}Y' + T.coef(-y0b, 's', false) + T.signed(-v0b) + ')'], [b, '(sY' + T.signed(-y0b) + ')'], [cc, 'Y']]) + ' = ' + (forced ? fracT(G0, '', T.lin(1, 's', -kf)) : '0') + '$.',
        'Collect $Y$: $(' + den.tex + ')Y = ' + (lc([tm(a * y0b, B.pow(1, 's')), tm(a * v0b + b * y0b)]).tex) + (forced ? fracT(G0, '', T.lin(1, 's', -kf), false) : '') + '$.',
        'Divide: $Y(s) = ' + Y.tex + '$.'],
      hint: 'Transform every term, including the initial values, then solve the algebraic equation for $Y$.' };
  });

  // ---------- de.inverse-laplace ----------
  G('de.inverse-laplace', function (R, ctx) {
    var kind = pickKind(R, ctx, ['basic'], ['pf', 'pf', 'basic'], ['square', 'pf', 'square']);
    if (kind === 'basic') {
      var k = R.pick(['exp', 'pow', 'sin', 'cos', 'tnexp']), c = R.nz(-4, 5), P = lap(R, k, c);
      var Fs = P.F.stex;
      chk({ topic: 'de.inverse-laplace', kind: 'inv', F: P.F.spl, ans: P.fP, s0: P.s0 });
      return { q: 'Find $\\mathcal{L}^{-1}\\left\\{' + Fs + '\\right\\}$.', a: ex(P.fP), steps: ['Match the table entry $' + P.rule + '$, adjusting the constant.', 'So $f(t) = ' + P.fT + '$.'], hint: 'Make the numerator match a table entry, putting any extra constant out front.' };
    }
    if (kind === 'pf') {
      var r1 = R.int(-4, 3), r2 = R.intNot(-4, 3, [r1]), A = R.nz(-4, 4), Bc = R.nz(-4, 4), num = [q(A + Bc), q(-A * r2 - Bc * r1)];
      var den = { tex: '(' + T.lin(1, 's', -r1) + ')(' + T.lin(1, 's', -r2) + ')', pl: '(' + linS(r1) + ')*(' + linS(r2) + ')' };
      if (r1 === 0) den = { tex: 's(' + T.lin(1, 's', -r2) + ')', pl: 's*(' + linS(r2) + ')' }; if (r2 === 0) den = { tex: 's(' + T.lin(1, 's', -r1) + ')', pl: 's*(' + linS(r1) + ')' };
      var expanded = R.coin(), denE = { tex: charTex([1, -(r1 + r2), r1 * r2], 's'), pl: lc([tm(1, B.pow(2, 's')), tm(-(r1 + r2), B.pow(1, 's')), tm(r1 * r2)]).pl }, Ft = sTerm(num, expanded ? denE : den);
      var ans = lc([tm(A, B.e(r1)), tm(Bc, B.e(r2))]);
      chk({ topic: 'de.inverse-laplace', kind: 'inv', F: Ft.spl, ans: ans.pl, s0: Math.max(r1, r2) });
      return { q: 'Find $\\mathcal{L}^{-1}\\left\\{' + Ft.stex + '\\right\\}$.', a: ex(ans.pl),
        steps: (expanded ? ['Factor the denominator: $' + denE.tex + ' = ' + den.tex + '$.'] : []).concat(['Partial fractions: $\\frac{' + T.poly(num, 's') + '}{' + den.tex + '} = \\frac{A}{' + T.lin(1, 's', -r1) + '} + \\frac{B}{' + T.lin(1, 's', -r2) + '}$.',
          'Cover-up: at $s = ' + r1 + '$, $A = \\frac{' + q(num[0]).mul(r1).add(num[1]).toTex() + '}{' + (r1 - r2) + '} = ' + A + '$; at $s = ' + r2 + '$, $B = \\frac{' + q(num[0]).mul(r2).add(num[1]).toTex() + '}{' + (r2 - r1) + '} = ' + Bc + '$.',
          'Invert each piece with $\\mathcal{L}^{-1}\\{\\frac{1}{s - a}\\} = e^{at}$: $f(t) = ' + ans.tex + '$.']),
        hint: 'Split into partial fractions $\\frac{A}{s - r_1} + \\frac{B}{s - r_2}$ and invert each.' };
    }
    // complete the square: (A s + Bn)/(s^2 + 2ps + p^2 + k^2) -> e^{-pt}(A cos kt + C sin kt)
    var p = R.nz(-3, 3), kk = R.int(1, 4), A2 = R.int(-3, 4), C2 = R.nz(-3, 3), Bn = A2 * p + C2 * kk;
    if (A2 === 0 && C2 === 0) A2 = 1;
    var num2 = [q(A2), q(A2 * p + C2 * kk)], denE2 = { tex: charTex([1, 2 * p, p * p + kk * kk], 's'), pl: lc([tm(1, B.pow(2, 's')), tm(2 * p, B.pow(1, 's')), tm(p * p + kk * kk)]).pl }, Ft2 = sTerm(num2, denE2);
    var ans2 = prodLc(B.e(-p), [tm(A2, B.cos(kk)), tm(C2, B.sin(kk))]);
    chk({ topic: 'de.inverse-laplace', kind: 'inv', F: Ft2.spl, ans: ans2.pl, s0: -p });
    var sp = T.lin(1, 's', p);
    return { q: 'Find $\\mathcal{L}^{-1}\\left\\{' + Ft2.stex + '\\right\\}$.', a: ex(ans2.pl),
      steps: ['The denominator does not factor over the reals. Complete the square: $' + denE2.tex + ' = (' + sp + ')^{2} + ' + kk * kk + '$.',
        'Write the numerator in terms of $' + sp + '$: $' + T.poly(num2, 's') + ' = ' + T.terms([[A2, '(' + sp + ')'], [C2 * kk, '']]) + '$.',
        'So $F = ' + T.terms([[A2, '\\frac{' + sp + '}{(' + sp + ')^{2} + ' + kk * kk + '}'], [C2, '\\frac{' + kk + '}{(' + sp + ')^{2} + ' + kk * kk + '}']]) + '$.',
        'By the shift rule, these are $e^{' + kv(-p) + '}\\cos ' + kv(kk) + '$ and $e^{' + kv(-p) + '}\\sin ' + kv(kk) + '$: $f(t) = ' + ans2.tex + '$.'],
      hint: 'Complete the square in the denominator, then match $\\frac{s - a}{(s - a)^2 + b^2}$ and $\\frac{b}{(s - a)^2 + b^2}$.' };
  });

  // ---------- de.laplace-ivps ----------
  G('de.laplace-ivps', function (R, ctx) {
    var kind = pickKind(R, ctx, ['first'], ['hom2', 'first'], ['forced', 'hom2']);
    if (kind === 'first') {
      var a = R.nz(-4, 4), y0 = R.int(-3, 4), forcedC = R.coin(), k = R.intNot(-3, 3, [0, -a]), A = R.nz(-3, 3), G0, gT, gP, Y, sol, st;
      if (forcedC) { // y' + a y = G0 (constant):  y = G0/a + (y0 - G0/a) e^{-at}
        var Kc = R.nz(-3, 3); G0 = Kc * a; gT = String(G0); gP = String(G0);
        sol = lc([tm(Kc), tm(y0 - Kc, B.e(-a))]);
        st = ['Transform: $sY' + T.signed(-y0) + T.coef(a, 'Y', false) + ' = \\frac{' + G0 + '}{s}$.', 'So $Y = \\frac{' + y0 + '}{' + T.lin(1, 's', a) + '} + \\frac{' + G0 + '}{s(' + T.lin(1, 's', a) + ')}$.'.replace('\\frac{0}{' + T.lin(1, 's', a) + '} + ', ''),
          'Partial fractions: $\\frac{' + G0 + '}{s(' + T.lin(1, 's', a) + ')} = \\frac{' + Kc + '}{s} - \\frac{' + Kc + '}{' + T.lin(1, 's', a) + '}$.', 'Invert: $y = ' + sol.tex + '$.'];
      } else { // y' + a y = G0 e^{kt}: particular A e^{kt}, G0 = A (k + a)
        G0 = A * (k + a); gT = T.coef(G0, 'e^{' + kv(k) + '}'); gP = G0 + '*e^(' + kv(k) + ')';
        sol = lc([tm(A, B.e(k)), tm(y0 - A, B.e(-a))]);
        st = ['Transform: $sY' + T.signed(-y0) + T.coef(a, 'Y', false) + ' = \\frac{' + G0 + '}{' + T.lin(1, 's', -k) + '}$.', 'So $Y = \\frac{' + y0 + '}{' + T.lin(1, 's', a) + '} + \\frac{' + G0 + '}{(' + T.lin(1, 's', -k) + ')(' + T.lin(1, 's', a) + ')}$.',
          'Partial fractions: $\\frac{' + G0 + '}{(' + T.lin(1, 's', -k) + ')(' + T.lin(1, 's', a) + ')} = \\frac{' + A + '}{' + T.lin(1, 's', -k) + '} - \\frac{' + A + '}{' + T.lin(1, 's', a) + '}$.', 'Invert: $y = ' + sol.tex + '$.'];
      }
      chk({ topic: 'de.laplace-ivps', kind: 'ivp', ode: [1, a], g: gP, ic: [0, y0], ans: sol.pl });
      return { q: "Use the Laplace transform to solve $y'" + T.coef(a, 'y', false) + ' = ' + gT + '$, $y(0) = ' + y0 + '$.', a: ex(sol.pl), steps: st, hint: "Transform with $\\mathcal{L}\\{y'\\} = sY - y(0)$, solve for $Y$, use partial fractions, invert." };
    }
    // second order with distinct real roots (and optional forcing e^{kt} with k not a root)
    var o = mkHom(R, 'real'), r1 = o.r1, r2 = o.r2, c1 = R.int(-3, 3), c2 = R.nz(-3, 3), forced = kind === 'forced';
    var k2 = forced ? R.intNot(-3, 3, [r1.toNumber(), r2.toNumber()]) : null, A2 = forced ? R.nz(-2, 2) : 0;
    var terms = [[q(c1), BF.exp(r1)], [q(c2), BF.exp(r2)]]; if (forced) terms.push([q(A2), BF.exp(k2)]);
    var ic = icVals(terms.map(function (z) { return z[0]; }), terms.map(function (z) { return z[1]; }), 2), G2 = forced ? charP(o, k2).mul(A2) : q(0);
    var sol2 = lc(terms.map(function (z) { return tm(z[0], z[1].b); }));
    var gT2 = forced ? T.coef(G2, 'e^{' + kv(k2) + '}') : '0';
    chk({ topic: 'de.laplace-ivps', kind: 'ivp', ode: o.cs.map(function (c) { return c.toNumber(); }), g: forced ? G2.toPlain() + '*e^(' + kv(k2) + ')' : 0, ic: [0, ic[0].toNumber(), ic[1].toNumber()], ans: sol2.pl });
    var b = o.cs[1], c = o.cs[2], P = charTex(o.cs, 's'), facT = charFactorTex(1, [r1, r2]).replace(/r/g, 's');
    var pfT = terms.map(function (z) { return T.coef(z[0], '\\frac{1}{' + (z[1] === terms[2] && false ? '' : T.lin(1, 's', z[1].d(1).neg())) + '}'); });
    var pf = T.terms(terms.map(function (z) { return [z[0], '\\frac{1}{' + T.lin(1, 's', z[1].d(1).neg()) + '}']; }));
    return { q: 'Use the Laplace transform to solve $' + o.lhs + ' = ' + gT2 + '$, $y(0) = ' + ic[0].toTex() + "$, $y'(0) = " + ic[1].toTex() + '$.', a: ex(sol2.pl),
      steps: ["Transform: $s^{2}Y - sy(0) - y'(0)" + T.coef(b, '(sY - y(0))', false) + T.coef(c, 'Y', false) + ' = ' + (forced ? fracT(G2, '', T.lin(1, 's', -k2)) : '0') + '$.',
        'Collect: $(' + P + ')Y = ' + lc([tm(ic[0], B.pow(1, 's')), tm(ic[1].add(b.mul(ic[0])))]).tex + (forced ? fracT(G2, '', T.lin(1, 's', -k2), false) : '') + '$, and $' + P + ' = ' + facT + '$.',
        'Divide and split into partial fractions: $Y = ' + pf + '$ (check by recombining).',
        'Invert term by term: $y = ' + sol2.tex + '$.'],
      hint: 'Transform, solve for $Y(s)$, factor the denominator, use partial fractions, then invert.' };
  });

// ---- u6.js
  // ---------- de.step-forcing ----------
  function kvp(k, inner) { k = q(k); return k.eq(1) ? inner : k.eq(-1) ? '-' + inner : k.toPlain() + '*' + inner; } // k·(t - c) in plain syntax
  function shiftT(c, v) { v = v || 't'; return '(' + T.lin(1, v, -c) + ')'; } // (t - c)
  G('de.step-forcing', function (R, ctx) {
    var kind = pickKind(R, ctx, ['shifted', 'piece'], ['unshifted', 'piece', 'shifted'], ['solve1', 'solve2', 'unshifted']);
    var c = R.int(1, 4);
    if (kind === 'shifted') {
      var w = R.pick(['one', 'pow', 'exp', 'sin']), K = R.nz(-3, 4), n = R.int(1, 2), a = R.nz(-3, 3), b = R.int(1, 4), fT, fP, Ft, rule;
      var sh = shiftT(c);
      if (w === 'one') { fT = T.coef(K, 'u(t - ' + c + ')'); fP = K + '*(1+sign(t-' + c + '))/2'; Ft = sTerm([K], sDen('lin', 0), c); rule = '\\mathcal{L}\\{1\\} = \\frac{1}{s}'; }
      else if (w === 'pow') { fT = T.coef(K, 'u(t - ' + c + ')' + sh + (n > 1 ? '^{' + n + '}' : '')); fP = K + '*(1+sign(t-' + c + '))/2*(t-' + c + ')^' + n; Ft = sTerm([K * FACT[n]], sDen('lin', 0, 0, n + 1), c); rule = '\\mathcal{L}\\{t^{' + n + '}\\} = \\frac{' + FACT[n] + '}{s^{' + (n + 1) + '}}'; }
      else if (w === 'exp') { fT = T.coef(K, 'u(t - ' + c + ')e^{' + T.coef(a, sh) + '}'); fP = K + '*(1+sign(t-' + c + '))/2*e^(' + a + '*(t-' + c + '))'; Ft = sTerm([K], sDen('lin', a), c); rule = '\\mathcal{L}\\{e^{' + kv(a) + '}\\} = \\frac{1}{' + T.lin(1, 's', -a) + '}'; }
      else { fT = T.coef(K, 'u(t - ' + c + ')\\sin(' + (b === 1 ? '' : b) + sh + ')'); fP = K + '*(1+sign(t-' + c + '))/2*sin(' + b + '*(t-' + c + '))'; Ft = sTerm([K * b], sDen('quad', 0, b), c); rule = '\\mathcal{L}\\{\\sin ' + kv(b) + '\\} = \\frac{' + b + '}{s^{2} + ' + b * b + '}'; }
      lapRec('de.step-forcing', fP, Ft.spl, Math.max(0, w === 'exp' ? a : 0));
      return { q: 'Find $\\mathcal{L}\\{' + fT + '\\}$.', a: ex(Ft.spl, ['s']), steps: ['Second shift theorem: $\\mathcal{L}\\{u(t - c)f(t - c)\\} = e^{-cs}F(s)$.', 'Here $c = ' + c + '$ and $f$ is already written in $t - ' + c + '$: $' + rule + '$.', 'So the transform is $' + Ft.stex + '$.'], hint: 'Recognize $f(t - c)$, transform $f(t)$, and multiply by $e^{-cs}$.' };
    }
    if (kind === 'unshifted') {
      var g = R.pick(['t', 't2', 'const']), K2 = R.nz(-3, 3), Fu, gT, gP, st;
      if (g === 't') { Fu = sSum([sTerm([K2], sDen('lin', 0, 0, 2), c), sTerm([K2 * c], sDen('lin', 0), c)]); gT = T.coef(K2, 'u(t - ' + c + ')\\,t'); gP = K2 + '*(1+sign(t-' + c + '))/2*t'; st = ['The shift rule needs everything written in $t - ' + c + '$: $t = ' + shiftT(c) + ' + ' + c + '$.', 'So $u(t - ' + c + ')t = u(t - ' + c + ')' + shiftT(c) + T.coef(c, 'u(t - ' + c + ')', false) + '$.', 'Transform each piece: $e^{-' + kv(c, 's') + '}\\left(\\frac{1}{s^{2}} + \\frac{' + c + '}{s}\\right)$' + (K2 === 1 ? '' : ', times $' + K2 + '$') + '.', 'Answer: $' + Fu.tex + '$.']; }
      else if (g === 't2') { Fu = sSum([sTerm([2 * K2], sDen('lin', 0, 0, 3), c), sTerm([2 * c * K2], sDen('lin', 0, 0, 2), c), sTerm([c * c * K2], sDen('lin', 0), c)]); gT = T.coef(K2, 'u(t - ' + c + ')\\,t^{2}'); gP = K2 + '*(1+sign(t-' + c + '))/2*t^2'; st = ['Write $t^{2}$ in powers of $t - ' + c + '$: $t^{2} = ' + shiftT(c) + '^{2} + ' + 2 * c + shiftT(c) + ' + ' + c * c + '$.', 'Each power $(t - ' + c + ')^{n}$ times $u(t - ' + c + ')$ transforms to $e^{-' + kv(c, 's') + '}\\frac{n!}{s^{n+1}}$.', 'So $\\mathcal{L} = e^{-' + kv(c, 's') + '}\\left(\\frac{2}{s^{3}} + \\frac{' + 2 * c + '}{s^{2}} + \\frac{' + c * c + '}{s}\\right)$' + (K2 === 1 ? '' : ', times $' + K2 + '$') + '.', 'Answer: $' + Fu.tex + '$.']; }
      else { var A = R.nz(-4, 4), Bv = R.intNot(-4, 4, [A]); Fu = sSum([sTerm([A], sDen('lin', 0)), sTerm([Bv - A], sDen('lin', 0), c)]); gT = '\\begin{cases} ' + A + ' & 0 \\le t < ' + c + ' \\\\ ' + Bv + ' & t \\ge ' + c + ' \\end{cases}'; gP = A + ' + (' + (Bv - A) + ')*(1+sign(t-' + c + '))/2'; st = ['Write $f$ with a unit step: it starts at ' + A + ' and jumps by $' + (Bv - A) + '$ at $t = ' + c + '$, so $f(t) = ' + A + T.coef(Bv - A, 'u(t - ' + c + ')', false) + '$.', 'Transform: $\\frac{' + A + '}{s}$ and $' + (Bv - A) + '\\cdot\\frac{e^{-' + kv(c, 's') + '}}{s}$.', 'Answer: $' + Fu.tex + '$.']; }
      lapRec('de.step-forcing', gP, Fu.pl, 0);
      return { q: 'Find the Laplace transform of $' + (g === 'const' ? 'f(t) = ' : '') + gT + '$.', a: ex(Fu.pl, ['s']), steps: st, hint: g === 'const' ? 'Write $f$ as its first value plus a jump times $u(t - c)$.' : 'Rewrite the function in terms of $t - c$ before using $\\mathcal{L}\\{u(t - c)f(t - c)\\} = e^{-cs}F(s)$.' };
    }
    if (kind === 'piece') {
      var A3 = R.nz(-4, 4), c3 = c;
      var Fp = sSum([sTerm([1], sDen('lin', 0, 0, 2)), sTerm([-1], sDen('lin', 0, 0, 2), c3)]);
      Fp = A3 === 1 ? Fp : sSum([sTerm([A3], sDen('lin', 0, 0, 2)), sTerm([-A3], sDen('lin', 0, 0, 2), c3)]);
      var fT3 = '\\begin{cases} ' + T.mono(A3, 't') + ' & 0 \\le t < ' + c3 + ' \\\\ ' + A3 * c3 + ' & t \\ge ' + c3 + ' \\end{cases}', fP3 = A3 + '*(t - (1+sign(t-' + c3 + '))/2*(t-' + c3 + '))';
      lapRec('de.step-forcing', fP3, Fp.pl, 0);
      return { q: 'Find the Laplace transform of the ramp that levels off, $f(t) = ' + fT3 + '$.', a: ex(Fp.pl, ['s']),
        steps: ['Write it with a step: $f(t) = ' + T.mono(A3, 't') + T.coef(-A3, 'u(t - ' + c3 + ')' + shiftT(c3), false) + '$ (after $t = ' + c3 + '$ the second term cancels the growth).', 'Transform: $\\mathcal{L}\\{t\\} = \\frac{1}{s^{2}}$ and $\\mathcal{L}\\{u(t - ' + c3 + ')' + shiftT(c3) + '\\} = \\frac{e^{-' + kv(c3, 's') + '}}{s^{2}}$.', 'Answer: $' + Fp.tex + '$.'],
        hint: 'Subtract a shifted ramp $u(t - c)(t - c)$ to stop the growth at $t = c$.' };
    }
    if (kind === 'solve1') { // y' + a y = K u(t - c), y(0) = y0
      var a1 = R.nz(-3, 3), K1 = a1 * R.nz(-3, 3), y0 = R.int(-3, 3), Kq = q(K1, a1);
      var before = lc([tm(y0, B.e(-a1))]), afterS = joinSum(before, lc([tm(Kq), tm(Kq.neg(), B.raw('e^{' + T.coef(-a1, shiftT(c)) + '}', 'e^(' + kvp(-a1, '(t - ' + c + ')') + ')'))]));
      chk({ topic: 'de.step-forcing', kind: 'piece', ode: [1, a1], g: K1 + '*(1+sign(t-' + c + '))/2', ic: [0, y0], c: c, parts: [before.pl, afterS.pl] });
      return { q: "Solve $y'" + T.coef(a1, 'y', false) + ' = ' + T.coef(K1, 'u(t - ' + c + ')') + '$, $y(0) = ' + y0 + '$. Give $y(t)$ on each interval.',
        a: { t: 'multi', parts: [{ label: '$0 \\le t < ' + c + '$: $y =$', a: ex(before.pl) }, { label: '$t \\ge ' + c + '$: $y =$', a: ex(afterS.pl) }] },
        steps: ['Transform: $(s' + T.signed(a1) + ')Y' + T.signed(-y0) + ' = ' + fracT(K1, 'e^{-' + kv(c, 's') + '}', 's') + '$.', 'So $Y = ' + (y0 ? fracT(y0, '', 's' + T.signed(a1)) : '') + fracT(K1, 'e^{-' + kv(c, 's') + '}', 's(s' + T.signed(a1) + ')', y0 ? false : undefined) + '$.',
          'Partial fractions: $' + fracT(K1, '', 's(s' + T.signed(a1) + ')') + ' = ' + T.coef(Kq, '\\left(\\frac{1}{s} - \\frac{1}{s' + T.signed(a1) + '}\\right)') + '$, which inverts to $' + T.coef(Kq, '(1 - e^{' + kv(-a1) + '})') + '$.',
          'The factor $e^{-' + kv(c, 's') + '}$ shifts it: $u(t - ' + c + ')' + (Kq.eq(1) ? '' : Kq.eq(-1) ? '\\cdot(-1)' : '\\cdot ' + Kq.toTex()) + '\\left(1 - e^{' + T.coef(-a1, shiftT(c)) + '}\\right)$.',
          'Before $t = ' + c + '$ the step is off: $y = ' + before.tex + '$. After: $y = ' + afterS.tex + '$.'],
        hint: 'Transform with $\\mathcal{L}\\{u(t - c)\\} = e^{-cs}/s$, invert without the exponential, then shift by $c$.' };
    }
    var w2 = R.int(1, 3), K3 = w2 * w2 * R.nz(-2, 3), Kw = q(K3, w2 * w2);
    var aft = lc([tm(Kw), tm(Kw.neg(), B.raw('\\cos(' + (w2 === 1 ? '' : w2) + shiftT(c) + ')', 'cos(' + kvp(w2, '(t - ' + c + ')') + ')'))]);
    chk({ topic: 'de.step-forcing', kind: 'piece', ode: [1, 0, w2 * w2], g: K3 + '*(1+sign(t-' + c + '))/2', ic: [0, 0, 0], c: c, parts: ['0', aft.pl] });
    return { q: "A spring at rest obeys $y'' + " + (w2 * w2 === 1 ? '' : w2 * w2) + 'y = ' + T.coef(K3, 'u(t - ' + c + ')') + "$, $y(0) = 0$, $y'(0) = 0$: a constant force switches on at $t = " + c + '$. Find $y(t)$ for $t \\ge ' + c + '$.',
      a: ex(aft.pl),
      steps: ['Transform: $(s^{2} + ' + w2 * w2 + ')Y = ' + fracT(K3, 'e^{-' + kv(c, 's') + '}', 's') + '$.', 'Partial fractions: $' + fracT(K3, '', 's(s^{2} + ' + w2 * w2 + ')') + ' = ' + T.coef(Kw, '\\left(\\frac{1}{s} - \\frac{s}{s^{2} + ' + w2 * w2 + '}\\right)') + '$, which inverts to $' + T.coef(Kw, '(1 - \\cos ' + kv(w2) + ')') + '$.',
        'Shift by ' + c + ': $y = u(t - ' + c + ')' + (Kw.eq(1) ? '' : Kw.eq(-1) ? '\\cdot(-1)' : '\\cdot ' + Kw.toTex()) + '\\left(1 - \\cos(' + (w2 === 1 ? '' : w2) + shiftT(c) + ')\\right)$.', 'For $t < ' + c + '$, $y = 0$; for $t \\ge ' + c + '$, $y = ' + aft.tex + '$.'],
      hint: 'Transform, use partial fractions on $\\frac{1}{s(s^2 + \\omega^2)}$, invert, and remember the shift by $c$.' };
  });

  // ---------- de.impulses ----------
  G('de.impulses', function (R, ctx) {
    var kind = pickKind(R, ctx, ['sift', 'Ldelta'], ['first', 'first', 'sift'], ['spring', 'first', 'damped']);
    var c = R.int(1, 3);
    if (kind === 'sift') {
      var p = R.pick(['poly', 'cos', 'exp']), a = R.nz(-3, 3), b = R.int(-4, 4), val, fT;
      if (p === 'poly') { fT = 't^{2}' + T.coef(a, 't', false) + T.signed(b); val = q(c * c + a * c + b); }
      else if (p === 'cos') { fT = '\\cos(\\pi t)'; val = q(c % 2 === 0 ? 1 : -1); }
      else { fT = 't^{3}' + T.signed(b); val = q(c * c * c + b); }
      chk({ topic: 'de.impulses', kind: 'sift', f: p === 'cos' ? 'cos(pi*t)' : p === 'poly' ? 't^2 + (' + a + ')*t + (' + b + ')' : 't^3 + (' + b + ')', c: c, ans: val.toNumber() });
      return { q: 'Evaluate $\\displaystyle\\int_{0}^{\\infty} \\left(' + fT + '\\right)\\delta(t - ' + c + ')\\,dt$.', a: num(val.toPlain()), steps: ['The delta function picks out the value at its spike: $\\int f(t)\\delta(t - c)\\,dt = f(c)$ when $c$ is inside the interval.', 'Here $c = ' + c + '$: $f(' + c + ') = ' + val.toTex() + '$.'], hint: 'The integral of $f(t)\\delta(t - c)$ is $f(c)$.' };
    }
    if (kind === 'Ldelta') {
      var K = R.nz(-5, 5), ans = sTerm([K], null, c);
      chk({ topic: 'de.impulses', kind: 'Ld', K: K, c: c, ans: ans.spl });
      return { q: 'Find $\\mathcal{L}\\{' + T.coef(K, '\\delta(t - ' + c + ')') + '\\}$.', a: ex(ans.spl, ['s']), steps: ['$\\mathcal{L}\\{\\delta(t - c)\\} = \\int_0^{\\infty} e^{-st}\\delta(t - c)\\,dt = e^{-cs}$ (the integral picks out $e^{-st}$ at $t = c$).', 'So $\\mathcal{L}\\{' + T.coef(K, '\\delta(t - ' + c + ')') + '\\} = ' + ans.stex + '$.'], hint: 'Use the sifting property with $f(t) = e^{-st}$.' };
    }
    if (kind === 'first') {
      var a1 = R.nz(-3, 3), K1 = R.nz(-4, 4), y0 = R.int(-3, 3);
      var before = lc([tm(y0, B.e(-a1))]), after = joinSum(before, lc([tm(K1, B.raw('e^{' + T.coef(-a1, shiftT(c)) + '}', 'e^(' + kvp(-a1, '(t - ' + c + ')') + ')'))]));
      chk({ topic: 'de.impulses', kind: 'jump', ode: [1, a1], ic: [0, y0], c: c, K: K1, order: 1, parts: [before.pl, after.pl] });
      return { q: "Solve $y'" + T.coef(a1, 'y', false) + ' = ' + T.coef(K1, '\\delta(t - ' + c + ')') + '$, $y(0) = ' + y0 + '$. Give $y(t)$ on each interval.',
        a: { t: 'multi', parts: [{ label: '$0 \\le t < ' + c + '$: $y =$', a: ex(before.pl) }, { label: '$t > ' + c + '$: $y =$', a: ex(after.pl) }] },
        steps: ['Transform: $(s' + T.signed(a1) + ')Y' + T.signed(-y0) + ' = ' + T.coef(K1, 'e^{-' + kv(c, 's') + '}') + '$.', 'So $Y = ' + (y0 ? fracT(y0, '', 's' + T.signed(a1)) : '') + fracT(K1, 'e^{-' + kv(c, 's') + '}', 's' + T.signed(a1), y0 ? false : undefined) + '$.',
          'Invert: $y = ' + (y0 ? T.coef(y0, 'e^{' + kv(-a1) + '}') : '') + T.coef(K1, 'u(t - ' + c + ')e^{' + T.coef(-a1, shiftT(c)) + '}', y0 ? false : true) + '$.', 'The impulse makes $y$ jump by $' + K1 + '$ at $t = ' + c + '$; after that it decays (or grows) from the new value.'],
        hint: 'Use $\\mathcal{L}\\{\\delta(t - c)\\} = e^{-cs}$, then the shift rule to invert.' };
    }
    if (kind === 'spring') {
      var w = R.int(1, 4), K2 = R.nz(-3, 4), kw = q(K2, w);
      var aft = lc([tm(kw, B.raw('\\sin(' + (w === 1 ? '' : w) + shiftT(c) + ')', 'sin(' + kvp(w, '(t - ' + c + ')') + ')'))]);
      chk({ topic: 'de.impulses', kind: 'jump', ode: [1, 0, w * w], ic: [0, 0, 0], c: c, K: K2, order: 2, parts: ['0', aft.pl] });
      return { q: "A mass on a spring, at rest, gets a sudden blow: $y'' + " + (w * w === 1 ? '' : w * w) + 'y = ' + T.coef(K2, '\\delta(t - ' + c + ')') + "$, $y(0) = 0$, $y'(0) = 0$. Find $y(t)$ for $t > " + c + '$.', a: ex(aft.pl),
        steps: ['Transform: $(s^{2} + ' + w * w + ')Y = ' + T.coef(K2, 'e^{-' + kv(c, 's') + '}') + '$, so $Y = ' + fracT(K2, 'e^{-' + kv(c, 's') + '}', 's^{2} + ' + w * w) + '$.', '$\\mathcal{L}^{-1}\\left\\{\\frac{1}{s^{2} + ' + w * w + '}\\right\\} = \\frac{1}{' + w + '}\\sin ' + kv(w) + '$.',
          'Shift: $y = u(t - ' + c + ')\\cdot ' + kw.toTex() + '\\sin(' + (w === 1 ? '' : w) + shiftT(c) + ')$. Before the blow the mass stays at rest; after it, it oscillates.', 'For $t > ' + c + '$: $y = ' + aft.tex + '$.'],
        hint: 'Transform, invert $\\frac{1}{s^2 + \\omega^2}$, and shift by $c$.' };
    }
    var o = mkHom(R, 'real'), tries = 0; while ((o.r1.isZero() || o.r2.isZero()) && tries++ < 20) o = mkHom(R, 'real');
    var K3 = (o.r1.sub(o.r2)).mul(R.nz(-2, 2)), A = K3.div(o.r1.sub(o.r2));
    var aftD = lc([tm(A, B.raw('e^{' + T.coef(o.r1, shiftT(c)) + '}', 'e^(' + kvp(o.r1, '(t - ' + c + ')') + ')')), tm(A.neg(), B.raw('e^{' + T.coef(o.r2, shiftT(c)) + '}', 'e^(' + kvp(o.r2, '(t - ' + c + ')') + ')'))]);
    chk({ topic: 'de.impulses', kind: 'jump', ode: o.cs.map(function (z) { return z.toNumber(); }), ic: [0, 0, 0], c: c, K: K3.toNumber(), order: 2, parts: ['0', aftD.pl] });
    return { q: 'Solve $' + o.lhs + ' = ' + T.coef(K3, '\\delta(t - ' + c + ')') + "$ with $y(0) = 0$, $y'(0) = 0$. Find $y(t)$ for $t > " + c + '$.', a: ex(aftD.pl),
      steps: ['Transform: $(' + charTex(o.cs, 's') + ')Y = ' + T.coef(K3, 'e^{-' + kv(c, 's') + '}') + '$, and $' + charTex(o.cs, 's') + ' = ' + charFactorTex(1, [o.r1, o.r2]).replace(/r/g, 's') + '$.',
        'Partial fractions: $\\frac{' + K3.toTex() + '}{' + charFactorTex(1, [o.r1, o.r2]).replace(/r/g, 's') + '} = ' + T.terms([[A, '\\frac{1}{' + T.lin(1, 's', o.r1.neg()) + '}'], [A.neg(), '\\frac{1}{' + T.lin(1, 's', o.r2.neg()) + '}']]) + '$.',
        'Invert and shift by ' + c + ': for $t > ' + c + '$, $y = ' + aftD.tex + '$ (and $y = 0$ before).'],
      hint: 'Transform, split into partial fractions, invert, and shift by $c$.' };
  });

  // ---------- de.convolution ----------
  var CONV = [ // f, g (TeX, plain), f*g (TeX, plain), F, G (plain)
    function (R) { var a = R.nz(-3, 3); return { f: ['1', '1'], g: ['e^{' + kv(a) + '}', 'e^(' + kv(a) + ')'], h: lc([tm(q(1, a), B.e(a)), tm(q(-1, a))]), F: '1/s', G: '1/(' + linS(a) + ')', work: '\\int_0^{t} e^{' + kv(a, '(t - \\tau)') + '}\\,d\\tau', s0: a }; },
    function (R) { var b = R.int(1, 4); return { f: ['1', '1'], g: ['\\sin ' + kv(b), 'sin(' + b + 't)'], h: lc([tm(q(1, b)), tm(q(-1, b), B.cos(b))]), F: '1/s', G: b + '/(s^2 + ' + b * b + ')', work: '\\int_0^{t} \\sin ' + (b === 1 ? '' : b) + '(t - \\tau)\\,d\\tau', s0: 0 }; },
    function (R) { var b = R.int(1, 4); return { f: ['1', '1'], g: ['\\cos ' + kv(b), 'cos(' + b + 't)'], h: lc([tm(q(1, b), B.sin(b))]), F: '1/s', G: 's/(s^2 + ' + b * b + ')', work: '\\int_0^{t} \\cos ' + (b === 1 ? '' : b) + '(t - \\tau)\\,d\\tau', s0: 0 }; },
    function () { return { f: ['t', 't'], g: ['t', 't'], h: lc([tm(q(1, 6), B.pow(3))]), F: '1/s^2', G: '1/s^2', work: '\\int_0^{t} \\tau(t - \\tau)\\,d\\tau', s0: 0 }; },
    function () { return { f: ['1', '1'], g: ['t', 't'], h: lc([tm(q(1, 2), B.pow(2))]), F: '1/s', G: '1/s^2', work: '\\int_0^{t} (t - \\tau)\\,d\\tau', s0: 0 }; },
    function (R) { var a = R.nz(-3, 3), b = R.intNot(-3, 3, [a, 0]); return { f: ['e^{' + kv(a) + '}', 'e^(' + kv(a) + ')'], g: [b === 0 ? '1' : 'e^{' + kv(b) + '}', 'e^(' + kv(b) + ')'], h: lc([tm(q(1, a - b), B.e(a)), tm(q(-1, a - b), B.e(b))]), F: '1/(' + linS(a) + ')', G: '1/(' + linS(b) + ')', work: '\\int_0^{t} e^{' + kv(a, '\\tau') + '}e^{' + kv(b, '(t - \\tau)') + '}\\,d\\tau', s0: Math.max(a, b) }; }
  ];
  G('de.convolution', function (R, ctx) {
    var kind = pickKind(R, ctx, ['conv', 'which'], ['inv', 'conv', 'Lconv'], ['volterra', 'inv']);
    if (kind === 'which') {
      return { q: 'Let $F = \\mathcal{L}\\{f\\}$ and $G = \\mathcal{L}\\{g\\}$. Which function has transform $F(s)G(s)$?', a: mc(R, '$\\displaystyle\\int_0^{t} f(\\tau)g(t - \\tau)\\,d\\tau$', ['$f(t)g(t)$', '$\\displaystyle\\int_0^{t} f(\\tau)g(\\tau)\\,d\\tau$', '$f(t) + g(t)$']),
        steps: ['The convolution theorem: $\\mathcal{L}\\{f * g\\} = F(s)G(s)$, where $(f * g)(t) = \\int_0^{t} f(\\tau)g(t - \\tau)\\,d\\tau$.', 'The product $f(t)g(t)$ does not transform to $FG$. For example $f = g = 1$: $\\mathcal{L}\\{1\\cdot 1\\} = \\frac{1}{s}$, but $FG = \\frac{1}{s^{2}}$, the transform of $1 * 1 = t$.'], hint: 'Test with $f = g = 1$.' };
    }
    var P = R.pick(CONV)(R);
    if (kind === 'conv') {
      chk({ topic: 'de.convolution', kind: 'conv', f: P.f[1], g: P.g[1], ans: P.h.pl });
      return { q: 'Compute the convolution $(f * g)(t) = \\int_0^{t} f(\\tau)g(t - \\tau)\\,d\\tau$ for $f(t) = ' + P.f[0] + '$ and $g(t) = ' + P.g[0] + '$.', a: ex(P.h.pl),
        steps: ['$(f * g)(t) = ' + P.work + '$.', 'Integrate in $\\tau$ (treat $t$ as a constant).', 'Result: $' + P.h.tex + '$.', 'Check with transforms: $\\mathcal{L}\\{f\\}\\mathcal{L}\\{g\\} = ' + T.plain(P.F) + '\\cdot ' + T.plain(P.G) + '$, which is the transform of the result.'],
        hint: 'Substitute $f(\\tau)$ and $g(t - \\tau)$, then integrate from 0 to $t$ in $\\tau$.' };
    }
    if (kind === 'inv') {
      var Fp = '(' + P.F + ')*(' + P.G + ')', FT = T.plain(P.F) + '\\cdot ' + T.plain(P.G);
      chk({ topic: 'de.convolution', kind: 'inv', F: Fp, ans: P.h.pl, s0: Math.max(0, P.s0) });
      return { q: 'Use the convolution theorem to find $\\mathcal{L}^{-1}\\left\\{' + FT + '\\right\\}$.', a: ex(P.h.pl),
        steps: ['$' + T.plain(P.F) + ' = \\mathcal{L}\\{' + P.f[0] + '\\}$ and $' + T.plain(P.G) + ' = \\mathcal{L}\\{' + P.g[0] + '\\}$.', 'So the inverse is the convolution $' + P.work + '$.', 'Evaluate: $' + P.h.tex + '$.'],
        hint: 'Recognize each factor as a transform, then convolve the two functions.' };
    }
    if (kind === 'Lconv') {
      var LF = '(' + P.F + ')*(' + P.G + ')';
      chk({ topic: 'de.convolution', kind: 'lap', f: P.h.pl, ans: LF, s0: Math.max(0, P.s0) });
      return { q: 'Find $\\mathcal{L}\\left\\{\\int_0^{t} f(\\tau)g(t - \\tau)\\,d\\tau\\right\\}$ for $f(t) = ' + P.f[0] + '$ and $g(t) = ' + P.g[0] + '$.', a: ex(LF, ['s']),
        steps: ['The integral is the convolution $f * g$, and $\\mathcal{L}\\{f * g\\} = F(s)G(s)$.', '$F = ' + T.plain(P.F) + '$ and $G = ' + T.plain(P.G) + '$.', 'Answer: $' + T.plain(P.F) + '\\cdot ' + T.plain(P.G) + '$.'],
        hint: 'No integration needed: multiply the two transforms.' };
    }
    // Volterra integral equations
    var v = R.int(1, 4), A = R.nz(-3, 4), Bk = R.nz(-3, 3), w = R.int(1, 3), eqT, ans, st;
    if (v === 1) { eqT = 'y(t) = ' + A + T.coef(Bk, '\\int_0^{t} y(\\tau)\\,d\\tau', false); ans = lc([tm(A, B.e(Bk))]); st = ['The integral is $1 * y$, with transform $\\frac{Y}{s}$.', 'Transform: $Y = \\frac{' + A + '}{s}' + T.coef(Bk, '\\frac{Y}{s}', false) + '$, so $Y\\left(1' + T.coef(-Bk, '\\frac{1}{s}', false) + '\\right) = \\frac{' + A + '}{s}$ and $Y = \\frac{' + A + '}{s' + T.signed(-Bk) + '}$.']; }
    else if (v === 2) { eqT = 'y(t) = ' + T.mono(A, 't') + ' - ' + (w * w === 1 ? '' : w * w) + '\\int_0^{t} (t - \\tau)y(\\tau)\\,d\\tau'; ans = lc([tm(q(A, w), B.sin(w))]); st = ['The integral is $t * y$, with transform $\\frac{Y}{s^{2}}$.', 'Transform: $Y = \\frac{' + A + '}{s^{2}} - ' + (w * w === 1 ? '' : w * w) + '\\frac{Y}{s^{2}}$, so $Y(s^{2} + ' + w * w + ') = ' + A + '$ and $Y = \\frac{' + A + '}{s^{2} + ' + w * w + '}$.']; }
    else if (v === 3) { eqT = 'y(t) = ' + A + ' + ' + (w * w === 1 ? '' : w * w) + '\\int_0^{t} (t - \\tau)y(\\tau)\\,d\\tau'; ans = lc([tm(A, B.cosh(w))]); st = ['The integral is $t * y$, with transform $\\frac{Y}{s^{2}}$.', 'Transform: $Y = \\frac{' + A + '}{s} + ' + (w * w === 1 ? '' : w * w) + '\\frac{Y}{s^{2}}$, so $Y = ' + fracT(A, 's', 's^{2} - ' + w * w) + '$.']; }
    else { eqT = 'y(t) = ' + A + ' + \\int_0^{t} \\sin(t - \\tau)\\,y(\\tau)\\,d\\tau'; ans = lc([tm(A), tm(q(A, 2), B.pow(2))]); st = ['The integral is $(\\sin t) * y$, with transform $\\frac{Y}{s^{2} + 1}$.', 'Transform: $Y = \\frac{' + A + '}{s} + \\frac{Y}{s^{2} + 1}$, so $Y\\cdot\\frac{s^{2}}{s^{2} + 1} = \\frac{' + A + '}{s}$ and $Y = ' + A + '\\cdot\\frac{s^{2} + 1}{s^{3}} = \\frac{' + A + '}{s} + \\frac{' + A + '}{s^{3}}$.']; }
    chk({ topic: 'de.convolution', kind: 'volterra', v: v, A: A, B: Bk, w: w, ans: ans.pl });
    return { q: 'Solve the integral equation $' + eqT + '$.', a: ex(ans.pl), steps: st.concat(['Invert: $y(t) = ' + ans.tex + '$.']), hint: 'Recognize the integral as a convolution, transform the whole equation, and solve for $Y$.' };
  });

// ---- u7.js
  // =====================================================================================================
  // UNIT 5: Systems of Differential Equations
  // =====================================================================================================
  var M2 = ML.M;
  var UNI = [[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[1, 1], [1, 2]], [[2, 1], [1, 1]], [[1, 2], [1, 3]], [[1, -1], [1, 0]], [[1, 1], [2, 3]], [[2, 1], [3, 2]], [[1, -1], [0, 1]], [[1, 0], [-1, 1]], [[1, 1], [-1, 0]], [[1, -2], [0, 1]]];
  function qm(A) { return A.map(function (r) { return r.map(function (x) { return q(x); }); }); }
  function matTex(A) { return T.mat(A.map(function (r) { return r.map(function (x) { return q(x).toTex(); }); })); }
  function colTex(v) { return T.col(v.map(function (x) { return q(x).toTex(); })); }
  function mv(A, v) { return [q(A[0][0]).mul(v[0]).add(q(A[0][1]).mul(v[1])), q(A[1][0]).mul(v[0]).add(q(A[1][1]).mul(v[1]))]; }
  function AmL(l) { l = q(l); return l.isZero() ? 'A' : '(A' + T.coef(l.neg(), 'I', false) + ')'; }
  function sysTex(A, f, xs) { xs = xs || ['x', 'y']; return xs.map(function (v, i) { var rhs = T.terms([[A[i][0], xs[0]], [A[i][1], xs[1]]]); if (f) rhs = f[i] ? (rhs === '0' ? f[i] : rhs + (f[i][0] === '-' ? ' - ' + f[i].slice(1) : ' + ' + f[i])) : rhs; return v + "' = " + rhs; }).join(',\\quad '); }
  function realEig(R, opts) { // A = P diag(l1, l2) P^-1 with whole-number entries
    opts = opts || {}; var l1, l2;
    do { l1 = R.int(-4, 4); l2 = R.intNot(-4, 4, [l1]); } while ((opts.noZero && (l1 === 0 || l2 === 0)) || (opts.sign === 'saddle' && l1 * l2 >= 0) || (opts.sign === 'neg' && (l1 >= 0 || l2 >= 0)) || (opts.sign === 'pos' && (l1 <= 0 || l2 <= 0)));
    var P = R.pick(UNI); if (R.coin()) P = [[P[0][1], P[0][0]], [P[1][1], P[1][0]]];
    var A = M2.mul(M2.mul(P, [[l1, 0], [0, l2]]), M2.inv(P)), lam = [l1, l2], v1 = [P[0][0], P[1][0]], v2 = [P[0][1], P[1][1]];
    if (l1 > l2) { lam = [l2, l1]; var t = v1; v1 = v2; v2 = t; }
    return { A: A, lam: lam.map(function (x) { return q(x); }), v: [v1.map(function (x) { return q(x); }), v2.map(function (x) { return q(x); })], tr: A[0][0].add(A[1][1]), det: M2.det(A) };
  }
  function cxEig(R, opts) { // A = alpha I + beta J, J^2 = -I
    opts = opts || {}; var al = opts.al !== undefined ? opts.al : R.pick([-2, -1, -1, 0, 1, 2]), be = R.int(1, 3);
    var P = R.pick(UNI), J = M2.mul(M2.mul(P, [[0, -1], [1, 0]]), M2.inv(P)); if (R.coin()) J = M2.scale(-1, J);
    var A = M2.add(M2.scale(al, [[1, 0], [0, 1]]), M2.scale(be, J));
    return { A: A, J: J, al: q(al), be: q(be), tr: A[0][0].add(A[1][1]), det: M2.det(A) };
  }
  function eigSteps(E) {
    var A = E.A, st = ['Characteristic equation: $\\det(A - \\lambda I) = \\lambda^{2}' + T.coef(E.tr.neg(), '\\lambda', false) + T.signed(E.det) + ' = 0$ (trace $' + E.tr.toTex() + '$, determinant $' + E.det.toTex() + '$).'];
    st.push('Eigenvalues: $\\lambda_1 = ' + E.lam[0].toTex() + '$ and $\\lambda_2 = ' + E.lam[1].toTex() + '$.');
    return st;
  }
  function evecStep(E, i) { var l = E.lam[i], B2 = M2.add(E.A, M2.scale(l.neg(), [[1, 0], [0, 1]])); return 'For $\\lambda = ' + l.toTex() + '$: $A - (' + l.toTex() + ')I = ' + matTex(B2) + '$, so $v_' + (i + 1) + ' = ' + colTex(E.v[i]) + '$.'; }

  // ---------- de.systems-matrix-form ----------
  G('de.systems-matrix-form', function (R, ctx) {
    var kind = pickKind(R, ctx, ['second', 'read'], ['second', 'third', 'read'], ['third', 'vec', 'lead']);
    if (kind === 'second' || kind === 'lead') {
      var m = kind === 'lead' ? R.pick([2, 3, 4]) : 1, b = R.int(-5, 5), c = R.nz(-6, 6), eq = odeLhs([m, m * b, m * c]) + ' = 0';
      var A = [['0', '1'], [String(-c), String(-b)]];
      chk({ topic: 'de.systems-matrix-form', kind: 'comp', cs: [m, m * b, m * c], ans: A });
      return { q: "Write $" + eq + "$ as a system $\\mathbf{x}' = A\\mathbf{x}$ with $x_1 = y$ and $x_2 = y'$. Find $A$.", a: { t: 'matrix', v: A },
        steps: ["$x_1' = y' = x_2$.", (m > 1 ? 'Divide by ' + m + ": $y'' = " + T.terms([[-c, 'y'], [-b, "y'"]]) + '$, so ' : "Solve for $y''$: $y'' = " + T.terms([[-c, 'y'], [-b, "y'"]]) + '$, so ') + "$x_2' = " + T.terms([[-c, 'x_1'], [-b, 'x_2']]) + '$.', 'So $A = ' + matTex(A) + '$.'],
        hint: "The first row says $x_1' = x_2$. Solve the equation for $y''$ to get the second row." };
    }
    if (kind === 'third') {
      var p = R.int(-3, 3), q2 = R.int(-4, 4), r = R.nz(-5, 5), eq3 = odeLhs([1, p, q2, r]) + ' = 0', A3 = [['0', '1', '0'], ['0', '0', '1'], [String(-r), String(-q2), String(-p)]];
      chk({ topic: 'de.systems-matrix-form', kind: 'comp', cs: [1, p, q2, r], ans: A3 });
      return { q: "Write $" + eq3 + "$ as a first-order system with $x_1 = y$, $x_2 = y'$, $x_3 = y''$. Find the matrix $A$.", a: { t: 'matrix', v: A3 },
        steps: ["$x_1' = x_2$ and $x_2' = x_3$.", "$y''' = " + T.terms([[-r, 'y'], [-q2, "y'"], [-p, "y''"]]) + "$, so $x_3' = " + T.terms([[-r, 'x_1'], [-q2, 'x_2'], [-p, 'x_3']]) + '$.', '$A = ' + matTex(A3) + '$.'], hint: 'Each new variable is the derivative of the one before; the last row comes from solving for $y\'\'\'$.' };
    }
    if (kind === 'read') {
      var A4 = [[R.int(-5, 5), R.int(-5, 5)], [R.int(-5, 5), R.int(-5, 5)]]; if (!A4[0][1] && !A4[1][0]) A4[0][1] = 2;
      var t1 = R.coin() ? T.terms([[A4[0][1], 'y'], [A4[0][0], 'x']]) : T.terms([[A4[0][0], 'x'], [A4[0][1], 'y']]), t2 = R.coin() ? T.terms([[A4[1][1], 'y'], [A4[1][0], 'x']]) : T.terms([[A4[1][0], 'x'], [A4[1][1], 'y']]);
      return { q: "Write the system $x' = " + t1 + ",\\ y' = " + t2 + "$ as $\\begin{bmatrix} x \\\\ y \\end{bmatrix}' = A\\begin{bmatrix} x \\\\ y \\end{bmatrix}$. Find $A$.", a: { t: 'matrix', v: A4.map(function (r2) { return r2.map(String); }) },
        steps: ["Row 1 holds the coefficients of $x$ and $y$ in $x'$: $" + A4[0][0] + '$ and $' + A4[0][1] + '$.', "Row 2 holds those in $y'$: $" + A4[1][0] + '$ and $' + A4[1][1] + '$.', '$A = ' + matTex(A4) + '$. Keep the columns in the order $x$, $y$ even when a term is written first or is missing (then the entry is 0).'],
        hint: 'Each row lists the coefficient of $x$, then of $y$.' };
    }
    // vec: x = e^{lt}(1, k) solves x' = Ax ; find k
    var E = realEig(R); var i = R.int(0, 1), v = E.v[i];
    if (v[0].isZero()) { i = 1 - i; v = E.v[i]; }
    var kk = v[1].div(v[0]);
    chk({ topic: 'de.systems-matrix-form', kind: 'vec', A: E.A.map(function (r2) { return r2.map(function (x) { return x.toNumber(); }); }), lam: E.lam[i].toNumber(), ans: kk.toNumber() });
    return { q: '$\\mathbf{x}(t) = e^{' + kv(E.lam[i]) + '}\\begin{bmatrix} 1 \\\\ k \\end{bmatrix}$ is a solution of $\\mathbf{x}\' = ' + matTex(E.A) + '\\mathbf{x}$. Find $k$.', a: num(kk.toPlain()),
      steps: ["Substitute: $\\mathbf{x}' = " + T.coef(E.lam[i], 'e^{' + kv(E.lam[i]) + '}') + "\\begin{bmatrix} 1 \\\\ k \\end{bmatrix}$ must equal $A\\mathbf{x} = e^{" + kv(E.lam[i]) + '}A\\begin{bmatrix} 1 \\\\ k \\end{bmatrix}$.', 'So $\\begin{bmatrix} 1 \\\\ k \\end{bmatrix}$ is an eigenvector for $\\lambda = ' + E.lam[i].toTex() + '$. First row: $' + T.terms([[E.A[0][0], ''], [E.A[0][1], 'k']]) + ' = ' + E.lam[i].toTex() + '$.', 'So $k = ' + kk.toTex() + '$.'],
      hint: 'Substituting $e^{\\lambda t}\\mathbf{v}$ gives $A\\mathbf{v} = \\lambda\\mathbf{v}$. Use the first row.' };
  });

  // ---------- de.eigen-solutions ----------
  G('de.eigen-solutions', function (R, ctx) {
    var kind = pickKind(R, ctx, ['eig'], ['ivp', 'evec', 'eig'], ['ivp']);
    var E = realEig(R, { noZero: kind === 'ivp' && R.chance(0.5) });
    var sysT = "\\mathbf{x}' = " + matTex(E.A) + '\\mathbf{x}';
    if (kind === 'eig') {
      chk({ topic: 'de.eigen-solutions', kind: 'eig', A: E.A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), ans: E.lam.map(function (x) { return x.toNumber(); }) });
      return { q: 'Find the eigenvalues of the coefficient matrix of $' + sysT + '$.', a: { t: 'set', v: E.lam.map(function (x) { return x.toPlain(); }) }, steps: eigSteps(E).concat(['Factor: $(' + T.lin(1, '\\lambda', E.lam[0].neg()) + ')(' + T.lin(1, '\\lambda', E.lam[1].neg()) + ') = 0$.']), hint: 'Solve $\\lambda^2 - (\\text{trace})\\lambda + \\det = 0$.' };
    }
    if (kind === 'evec') {
      var i = R.int(0, 1), v = E.v[i]; if (v[0].isZero()) { i = 1 - i; v = E.v[i]; }
      var k = v[1].div(v[0]);
      chk({ topic: 'de.systems-matrix-form', kind: 'vec', A: E.A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), lam: E.lam[i].toNumber(), ans: k.toNumber() });
      return { q: 'For $' + sysT + '$, one eigenvalue is $\\lambda = ' + E.lam[i].toTex() + '$. Find $k$ so that $\\begin{bmatrix} 1 \\\\ k \\end{bmatrix}$ is an eigenvector for it.', a: num(k.toPlain()),
        steps: ['Solve $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ with $A - (' + E.lam[i].toTex() + ')I = ' + matTex(M2.add(E.A, M2.scale(E.lam[i].neg(), [[1, 0], [0, 1]]))) + '$.', 'The first row gives $' + T.terms([[E.A[0][0].sub(E.lam[i]), '1'], [E.A[0][1], 'k']]).replace(/^1 /, '1 ') + ' = 0$' + (E.A[0][1].isZero() ? ' (no $k$ here; use the second row: $' + T.terms([[E.A[1][0], '1'], [E.A[1][1].sub(E.lam[i]), 'k']]) + ' = 0$)' : '') + '.', 'So $k = ' + k.toTex() + '$.'],
        hint: 'Plug $\\mathbf{v} = (1, k)$ into $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$.' };
    }
    var c1 = q(R.nz(-3, 3)), c2 = q(R.nz(-3, 3)), x0 = [c1.mul(E.v[0][0]).add(c2.mul(E.v[1][0])), c1.mul(E.v[0][1]).add(c2.mul(E.v[1][1]))];
    var comps = [0, 1].map(function (j) { return lc([tm(c1.mul(E.v[0][j]), B.e(E.lam[0])), tm(c2.mul(E.v[1][j]), B.e(E.lam[1]))]); });
    chk({ topic: 'de.eigen-solutions', kind: 'ivp', A: E.A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), x0: x0.map(function (x) { return x.toNumber(); }), ans: comps.map(function (c) { return c.pl; }) });
    return { q: 'Solve $' + sysT + '$ with $\\mathbf{x}(0) = ' + colTex(x0) + '$.', a: { t: 'multi', parts: [{ label: '$x_1(t) =$', a: ex(comps[0].pl) }, { label: '$x_2(t) =$', a: ex(comps[1].pl) }] },
      steps: eigSteps(E).concat([evecStep(E, 0), evecStep(E, 1), 'General solution: $\\mathbf{x} = c_1e^{' + kv(E.lam[0]) + '}' + colTex(E.v[0]) + ' + c_2e^{' + kv(E.lam[1]) + '}' + colTex(E.v[1]) + '$.',
        'At $t = 0$: $c_1' + colTex(E.v[0]) + ' + c_2' + colTex(E.v[1]) + ' = ' + colTex(x0) + '$, so $c_1 = ' + c1.toTex() + '$, $c_2 = ' + c2.toTex() + '$.', '$x_1 = ' + comps[0].tex + '$, $x_2 = ' + comps[1].tex + '$.']),
      hint: 'Find the eigenvalues and eigenvectors, write $c_1e^{\\lambda_1t}\\mathbf{v}_1 + c_2e^{\\lambda_2t}\\mathbf{v}_2$, and fit $\\mathbf{x}(0)$.' };
  });

  // ---------- de.phase-portraits ----------
  var TYPES = ['saddle', 'stable node (sink)', 'unstable node (source)', 'spiral sink', 'spiral source', 'center'];
  function classify(tr, det) { tr = q(tr); det = q(det); var disc = tr.mul(tr).sub(det.mul(4)); if (det.sign() < 0) return 'saddle'; if (disc.sign() >= 0) return tr.sign() < 0 ? 'stable node (sink)' : 'unstable node (source)'; if (tr.isZero()) return 'center'; return tr.sign() < 0 ? 'spiral sink' : 'spiral source'; }
  function typeWhy(t) { return { 'saddle': 'Real eigenvalues of opposite signs: solutions approach along one eigen-direction and leave along the other. Unstable.', 'stable node (sink)': 'Both eigenvalues are negative real numbers: every solution decays to the origin without spiraling.', 'unstable node (source)': 'Both eigenvalues are positive real numbers: every solution moves away from the origin.', 'spiral sink': 'Complex eigenvalues with negative real part: solutions spiral in to the origin.', 'spiral source': 'Complex eigenvalues with positive real part: solutions spiral out.', 'center': 'Purely imaginary eigenvalues: solutions travel on closed loops around the origin.' }[t]; }
  function typeChoices(R, t) { var others = TYPES.filter(function (z) { return z !== t; }); return mc(R, t, R.shuffle(others).slice(0, 3)); }
  G('de.phase-portraits', function (R, ctx) {
    var kind = pickKind(R, ctx, ['fromEig'], ['fromA', 'fromA', 'fromEig'], ['param', 'fromA']);
    var want = R.pick(TYPES);
    if (kind === 'fromEig') {
      var lt;
      if (want === 'saddle') lt = [R.int(-4, -1), R.int(1, 4)]; else if (want === 'stable node (sink)') lt = R.ints(2, -5, -1, true); else if (want === 'unstable node (source)') lt = R.ints(2, 1, 5, true);
      var eigT = lt ? '\\lambda_1 = ' + Math.min(lt[0], lt[1]) + '$ and $\\lambda_2 = ' + Math.max(lt[0], lt[1]) : (function () { var a = want === 'spiral sink' ? R.int(-3, -1) : want === 'spiral source' ? R.int(1, 3) : 0, b = R.int(1, 4); return '\\lambda = ' + (a ? a + ' \\pm ' : '\\pm ') + (b === 1 ? '' : b) + 'i'; })();
      return { q: 'The coefficient matrix of a linear system $\\mathbf{x}\' = A\\mathbf{x}$ has $' + eigT + '$. What kind of equilibrium is the origin?', a: typeChoices(R, want),
        steps: ['The eigenvalues decide the type: their signs (or the sign of the real part) decide stability; complex values mean rotation.', typeWhy(want), 'So the origin is a ' + want + '. (The eigenvectors only set the directions of the straight-line solutions, not the stability.)'], hint: 'Real or complex? Then look at the signs of the eigenvalues (or of the real part).' };
    }
    if (kind === 'fromA') {
      var E;
      if (want === 'saddle') E = realEig(R, { sign: 'saddle' }); else if (want === 'stable node (sink)') E = realEig(R, { sign: 'neg' }); else if (want === 'unstable node (source)') E = realEig(R, { sign: 'pos' });
      else E = cxEig(R, { al: want === 'spiral sink' ? R.int(-2, -1) : want === 'spiral source' ? R.int(1, 2) : 0 });
      var t = classify(E.tr, E.det), disc = E.tr.mul(E.tr).sub(E.det.mul(4));
      chk({ topic: 'de.phase-portraits', kind: 'class', A: E.A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), ans: t });
      return { q: 'Classify the equilibrium at the origin of $\\mathbf{x}\' = ' + matTex(E.A) + '\\mathbf{x}$.', a: typeChoices(R, t),
        steps: ['Trace $\\tau = ' + E.tr.toTex() + '$, determinant $\\Delta = ' + E.det.toTex() + '$, and $\\tau^{2} - 4\\Delta = ' + disc.toTex() + '$.', 'The eigenvalues are $\\lambda = \\frac{\\tau \\pm \\sqrt{\\tau^{2} - 4\\Delta}}{2}$: ' + (E.lam ? '$' + E.lam[0].toTex() + '$ and $' + E.lam[1].toTex() + '$.' : '$' + (E.al.isZero() ? '' : E.al.toTex() + ' ') + '\\pm ' + (E.be.eq(1) ? '' : E.be.toTex()) + 'i$.'), typeWhy(t)],
        hint: 'Compute the trace and determinant, then the eigenvalues.' };
    }
    var ask = R.pick(['spiral sink', 'saddle', 'stable node (sink)']), b2 = R.pick([2, 4]), half = b2 / 2;
    // A = [[0, 1], [-k, -b]]: det = k, tr = -b, disc = b^2 - 4k
    var ans = ask === 'spiral sink' ? 'k > ' + half * half : ask === 'saddle' ? 'k < 0' : '0 < k < ' + half * half;
    chk({ topic: 'de.phase-portraits', kind: 'param', b: b2, ask: ask, ans: ans });
    return { q: 'For $\\mathbf{x}\' = \\begin{bmatrix} 0 & 1 \\\\ -k & -' + b2 + ' \\end{bmatrix}\\mathbf{x}$ (a damped spring with stiffness $k$), for which values of $k$ is the origin a ' + ask + '?', a: { t: 'ineq', v: ans },
      steps: ['Trace $\\tau = -' + b2 + '$ and determinant $\\Delta = k$; $\\tau^{2} - 4\\Delta = ' + b2 * b2 + ' - 4k$.', 'Saddle when $\\Delta < 0$: $k < 0$. With $\\Delta > 0$ and $\\tau < 0$ the origin is stable: a node when $' + b2 * b2 + ' - 4k > 0$ ($0 < k < ' + half * half + '$), a spiral when $' + b2 * b2 + ' - 4k < 0$ ($k > ' + half * half + '$).', 'So: $' + ans + '$.'],
      hint: 'Use the trace–determinant plane: the sign of $\\Delta$, then the sign of $\\tau^2 - 4\\Delta$.' };
  });

  // ---------- de.complex-eigen-systems ----------
  G('de.complex-eigen-systems', function (R, ctx) {
    var kind = pickKind(R, ctx, ['ab', 'rot'], ['rot', 'ivp', 'ab'], ['ivp']);
    var E = cxEig(R, { al: kind === 'rot' ? R.pick([-1, 1, -2, 0]) : undefined }), A = E.A, sysT = "\\mathbf{x}' = " + matTex(A) + '\\mathbf{x}';
    var eigSt = ['$\\lambda^{2}' + T.coef(E.tr.neg(), '\\lambda', false) + T.signed(E.det) + ' = 0$ (trace $' + E.tr.toTex() + '$, determinant $' + E.det.toTex() + '$).', 'Quadratic formula: $\\lambda = ' + (E.al.isZero() ? '' : E.al.toTex() + ' ') + '\\pm ' + (E.be.eq(1) ? '' : E.be.toTex()) + 'i$.'];
    if (kind === 'ab') {
      chk({ topic: 'de.complex-eigen-systems', kind: 'ab', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), al: E.al.toNumber(), be: E.be.toNumber() });
      return { q: 'The eigenvalues of the matrix in $' + sysT + '$ are $\\alpha \\pm \\beta i$ with $\\beta > 0$. Find $\\alpha$ and $\\beta$.', a: { t: 'multi', parts: [{ label: '$\\alpha =$', a: num(E.al.toPlain()) }, { label: '$\\beta =$', a: num(E.be.toPlain()) }] }, steps: eigSt, hint: 'Solve $\\lambda^2 - (\\text{trace})\\lambda + \\det = 0$.' };
    }
    if (kind === 'rot') {
      var ccw = A[1][0].sign() > 0, inward = E.al.sign() < 0, still = E.al.isZero();
      var ans = (still ? 'closed loops' : inward ? 'spirals in' : 'spirals out') + ', ' + (ccw ? 'counterclockwise' : 'clockwise');
      var choices = ['spirals in, counterclockwise', 'spirals in, clockwise', 'spirals out, counterclockwise', 'spirals out, clockwise', 'closed loops, counterclockwise', 'closed loops, clockwise'].filter(function (z) { return z !== ans; });
      chk({ topic: 'de.complex-eigen-systems', kind: 'rot', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), ans: ans });
      return { q: 'Describe the trajectories of $' + sysT + '$.', a: mc(R, ans, R.shuffle(choices).slice(0, 3)),
        steps: eigSt.concat(['The real part $\\alpha = ' + E.al.toTex() + '$ ' + (still ? 'is 0, so the trajectories are closed loops (a center).' : inward ? 'is negative, so they spiral in (spiral sink).' : 'is positive, so they spiral out (spiral source).'),
          'Direction: at the point $(1, 0)$ the velocity is $A\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} = ' + colTex([A[0][0], A[1][0]]) + '$. Its second component is ' + (ccw ? 'positive, so the motion turns upward there: counterclockwise.' : 'negative, so the motion turns downward there: clockwise.')]),
        hint: 'The real part of the eigenvalues decides in or out. For the direction, compute the velocity at $(1, 0)$.' };
    }
    var x0 = [q(R.int(-3, 3)), q(R.nz(-3, 3))], Jx = mv(E.J, x0);
    var comps = [0, 1].map(function (j) { return prodLc(B.e(E.al), [tm(x0[j], B.cos(E.be)), tm(Jx[j], B.sin(E.be))]); });
    chk({ topic: 'de.complex-eigen-systems', kind: 'ivp', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), x0: x0.map(function (x) { return x.toNumber(); }), ans: comps.map(function (c) { return c.pl; }) });
    var lam = E.al.toTex() + ' + ' + (E.be.eq(1) ? '' : E.be.toTex()) + 'i', a12 = A[0][1], re2 = E.al.sub(A[0][0]);
    return { q: 'Solve $' + sysT + '$ with $\\mathbf{x}(0) = ' + colTex(x0) + '$.', a: { t: 'multi', parts: [{ label: '$x_1(t) =$', a: ex(comps[0].pl) }, { label: '$x_2(t) =$', a: ex(comps[1].pl) }] },
      steps: eigSt.concat(['For $\\lambda = ' + T.terms([[E.al, ''], [E.be, 'i']]) + '$, the first row of $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ gives the eigenvector $\\mathbf{v} = \\begin{bmatrix} ' + a12.toTex() + ' \\\\ ' + T.terms([[re2, ''], [E.be, 'i']]) + ' \\end{bmatrix} = \\mathbf{a} + i\\mathbf{b}$ with $\\mathbf{a} = ' + colTex([a12, re2]) + '$, $\\mathbf{b} = ' + colTex([q(0), E.be]) + '$.',
        'The real and imaginary parts of $e^{\\lambda t}\\mathbf{v}$ give two real solutions: $e^{' + kv(E.al) + '}(\\mathbf{a}\\cos ' + kv(E.be) + ' - \\mathbf{b}\\sin ' + kv(E.be) + ')$ and $e^{' + kv(E.al) + '}(\\mathbf{a}\\sin ' + kv(E.be) + ' + \\mathbf{b}\\cos ' + kv(E.be) + ')$.',
        'Fitting $\\mathbf{x}(0)$ and simplifying gives the same result as $\\mathbf{x} = e^{' + kv(E.al) + '}\\left(\\mathbf{x}_0\\cos ' + kv(E.be) + ' + J\\mathbf{x}_0\\sin ' + kv(E.be) + '\\right)$ with $J = ' + (E.be.eq(1) ? '' : '\\frac{1}{' + E.be.toTex() + '}') + (E.al.isZero() ? 'A' : '(A' + T.coef(E.al.neg(), 'I', false) + ')') + ' = ' + matTex(E.J) + '$, so $J\\mathbf{x}_0 = ' + colTex(Jx) + '$.',
        '$x_1 = ' + comps[0].tex + '$ and $x_2 = ' + comps[1].tex + '$.']),
      hint: 'Use a complex eigenvector, split $e^{\\lambda t}\\mathbf{v}$ into real and imaginary parts, then fit $\\mathbf{x}(0)$.' };
  });

  // ---------- de.repeated-eigen-systems ----------
  G('de.repeated-eigen-systems', function (R, ctx) {
    var kind = pickKind(R, ctx, ['lam'], ['w', 'ivp', 'lam'], ['ivp']);
    var lam = R.nz(-3, 3), m = R.nz(-2, 2), k = R.pick([1, -1]), N = [[q(-k * m), q(k)], [q(-k * m * m), q(k * m)]], A = M2.add(M2.scale(lam, [[1, 0], [0, 1]]), N);
    var sysT = "\\mathbf{x}' = " + matTex(A) + '\\mathbf{x}', v = [q(1), q(m)], w = [q(0), q(k)];
    var tr = A[0][0].add(A[1][1]), det = M2.det(A);
    var eigSt = ['$\\lambda^{2}' + T.coef(tr.neg(), '\\lambda', false) + T.signed(det) + ' = (' + T.lin(1, '\\lambda', -lam) + ')^{2} = 0$: a double eigenvalue $\\lambda = ' + lam + '$.', '$A - (' + lam + ')I = ' + matTex(N) + '$ has rank 1, so there is only one eigenvector direction: $\\mathbf{v} = ' + colTex(v) + '$.'];
    if (kind === 'lam') { chk({ topic: 'de.repeated-eigen-systems', kind: 'lam', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), ans: lam }); return { q: 'The matrix of $' + sysT + '$ has a repeated eigenvalue. Find it.', a: num(lam), steps: eigSt.slice(0, 1), hint: 'The characteristic polynomial is a perfect square.' }; }
    if (kind === 'w') {
      chk({ topic: 'de.repeated-eigen-systems', kind: 'w', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), lam: lam, v: [1, m], ans: [0, k] });
      return { q: 'For $' + sysT + '$, $\\lambda = ' + lam + '$ is a double eigenvalue with eigenvector $\\mathbf{v} = ' + colTex(v) + '$. Find the generalized eigenvector $\\mathbf{w}$ with $' + AmL(lam) + '\\mathbf{w} = \\mathbf{v}$ and first component 0. Enter $(w_1, w_2)$.', a: { t: 'tuple', v: ['0', String(k)] },
        steps: ['$(A - (' + lam + ')I)\\mathbf{w} = ' + matTex(N) + '\\begin{bmatrix} 0 \\\\ w_2 \\end{bmatrix} = ' + colTex([q(k), q(k * m)]) + 'w_2$.', 'Set this equal to $' + colTex(v) + '$: $' + T.coef(k, 'w_2') + ' = 1$, so $w_2 = ' + k + '$.', 'Then $e^{' + kv(lam) + '}(t\\mathbf{v} + \\mathbf{w})$ is the second solution.'], hint: 'Solve $(A - \\lambda I)\\mathbf{w} = \\mathbf{v}$ with $w_1 = 0$.' };
    }
    var x0 = [q(R.int(-3, 3)), q(R.nz(-3, 3))], Nx = mv(N, x0);
    var comps = [0, 1].map(function (j) { return prodLc(B.e(lam), [tm(x0[j]), tm(Nx[j], B.pow(1))]); });
    chk({ topic: 'de.repeated-eigen-systems', kind: 'ivp', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), x0: x0.map(function (x) { return x.toNumber(); }), ans: comps.map(function (c) { return c.pl; }) });
    var c1 = x0[0], c2 = x0[1].sub(x0[0].mul(m)).div(k);
    return { q: 'Solve $' + sysT + '$ with $\\mathbf{x}(0) = ' + colTex(x0) + '$.', a: { t: 'multi', parts: [{ label: '$x_1(t) =$', a: ex(comps[0].pl) }, { label: '$x_2(t) =$', a: ex(comps[1].pl) }] },
      steps: eigSt.concat(['Generalized eigenvector: $' + AmL(lam) + '\\mathbf{w} = \\mathbf{v}$ gives $\\mathbf{w} = ' + colTex(w) + '$.', 'General solution: $\\mathbf{x} = c_1e^{' + kv(lam) + '}\\mathbf{v} + c_2e^{' + kv(lam) + '}(t\\mathbf{v} + \\mathbf{w})$.', 'At $t = 0$: $c_1\\mathbf{v} + c_2\\mathbf{w} = ' + colTex(x0) + '$, so $c_1 = ' + c1.toTex() + '$, $c_2 = ' + c2.toTex() + '$.', '$x_1 = ' + comps[0].tex + '$, $x_2 = ' + comps[1].tex + '$.']),
      hint: 'With only one eigenvector, the second solution is $e^{\\lambda t}(t\\mathbf{v} + \\mathbf{w})$ where $(A - \\lambda I)\\mathbf{w} = \\mathbf{v}$.' };
  });

  // ---------- de.matrix-exponential ----------
  function mExpPl(Mx) { return Mx.map(function (r) { return r.map(function (z) { return z.pl; }); }); }
  function mExpTex(Mx) { return '\\begin{bmatrix} ' + Mx.map(function (r) { return r.map(function (z) { return z.tex; }).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}'; }
  G('de.matrix-exponential', function (R, ctx) {
    var kind = pickKind(R, ctx, ['diag', 'nil', 'trap'], ['jordan', 'rot', 'diag'], ['diagz', 'xt']);
    if (kind === 'trap') {
      var a = R.nz(-3, 3), b = R.nz(-3, 3), A0 = [[q(a), q(b)], [q(0), q(a)]];
      return { q: 'True or false: for $A = ' + matTex(A0) + '$, $e^{At} = \\begin{bmatrix} e^{' + kv(a) + '} & e^{' + kv(b) + '} \\\\ 1 & e^{' + kv(a) + '} \\end{bmatrix}$ (exponentiating each entry).', a: tf(false),
        steps: ['$e^{At}$ is defined by the series $I + At + \\frac{(At)^{2}}{2!} + \\dots$, not entry by entry. (At $t = 0$ it must be $I$, but the matrix above has a 1 below the diagonal.)', 'Here $A = ' + T.coef(a, 'I') + ' + N$ with $N = ' + matTex([[0, b], [0, 0]]) + '$, $N^{2} = 0$, so $e^{At} = e^{' + kv(a) + '}(I + Nt) = ' + mExpTex([[B.e(a), lc([tm(b, B.mul(B.pow(1), B.e(a)))])], [{ tex: '0' }, B.e(a)]]) + '$. False.'],
        hint: 'What must $e^{At}$ equal at $t = 0$?' };
    }
    if (kind === 'diag' || kind === 'nil') {
      if (kind === 'diag') { var p = R.nz(-4, 4), r = R.intNot(-4, 4, [p]), D2 = [[p, 0], [0, r]], ans = [[B.e(p), { tex: '0', pl: '0' }], [{ tex: '0', pl: '0' }, B.e(r)]];
        if (r === 0) ans[1][1] = { tex: '1', pl: '1' };
        chk({ topic: 'de.matrix-exponential', kind: 'expm', A: D2, ans: mExpPl(ans) });
        return { q: 'Find $e^{At}$ for $A = ' + matTex(D2) + '$.', a: { t: 'matrix', v: mExpPl(ans) }, steps: ['$A$ is diagonal, so every power $A^{k}$ is diagonal with entries $' + p + '^{k}$ and $' + r + '^{k}$.', 'The series $\\sum \\frac{(At)^{k}}{k!}$ sums each diagonal entry separately: $e^{' + kv(p) + '}$ and $e^{' + kv(r) + '}$.', '$e^{At} = ' + mExpTex(ans) + '$.'], hint: 'For a diagonal matrix, the exponential series works entry by entry on the diagonal.' }; }
      var c = R.nz(-4, 4), Nn = [[0, c], [0, 0]], ansN = [[{ tex: '1', pl: '1' }, lc([tm(c, B.pow(1))])], [{ tex: '0', pl: '0' }, { tex: '1', pl: '1' }]];
      chk({ topic: 'de.matrix-exponential', kind: 'expm', A: Nn, ans: mExpPl(ansN) });
      return { q: 'Find $e^{At}$ for $A = ' + matTex(Nn) + '$.', a: { t: 'matrix', v: mExpPl(ansN) }, steps: ['$A^{2} = ' + matTex([[0, 0], [0, 0]]) + '$, so the series stops: $e^{At} = I + At$.', '$e^{At} = ' + mExpTex(ansN) + '$.'], hint: 'Compute $A^2$. When a power of $A$ is zero, the series is finite.' };
    }
    if (kind === 'jordan') {
      var l = R.nz(-3, 3), b2 = R.nz(-3, 3), J = [[l, b2], [0, l]], el = B.e(l), ansJ = [[el, lc([tm(b2, B.mul(B.pow(1), el))])], [{ tex: '0', pl: '0' }, el]];
      chk({ topic: 'de.matrix-exponential', kind: 'expm', A: J, ans: mExpPl(ansJ) });
      return { q: 'Find $e^{At}$ for $A = ' + matTex(J) + '$.', a: { t: 'matrix', v: mExpPl(ansJ) }, steps: ['Write $A = ' + T.coef(l, 'I') + ' + N$ with $N = ' + matTex([[0, b2], [0, 0]]) + '$; $N^{2} = 0$, and $' + T.coef(l, 'I') + '$ commutes with $N$.', 'So $e^{At} = e^{' + kv(l) + '}e^{Nt} = e^{' + kv(l) + '}(I + Nt)$.', '$e^{At} = ' + mExpTex(ansJ) + '$.'], hint: 'Split $A$ into $\\lambda I$ plus a matrix $N$ with $N^2 = 0$.' };
    }
    if (kind === 'rot') {
      var bb = R.int(1, 4), sg = R.sign(), Ar = [[0, -sg * bb], [sg * bb, 0]], c0 = B.cos(bb), s0 = B.sin(bb), ansR = [[c0, lc([tm(-sg, s0)])], [lc([tm(sg, s0)]), c0]];
      chk({ topic: 'de.matrix-exponential', kind: 'expm', A: Ar, ans: mExpPl(ansR) });
      return { q: 'Find $e^{At}$ for $A = ' + matTex(Ar) + '$.', a: { t: 'matrix', v: mExpPl(ansR) }, steps: ['$A = ' + T.coef(sg * bb, 'J') + '$ with $J = ' + matTex([[0, -1], [1, 0]]) + '$ and $J^{2} = -I$, so the even powers give a cosine series and the odd powers a sine series.', '$e^{At} = I\\cos ' + kv(bb) + T.coef(sg, 'J\\sin ' + kv(bb), false) + '$ (a rotation by angle $' + T.mono(sg * bb, 't') + '$).', '$e^{At} = ' + mExpTex(ansR) + '$.'], hint: 'Sort the series into even and odd powers; $J^2 = -I$ turns them into $\\cos$ and $\\sin$.' };
    }
    var E = realEig(R), P = [[E.v[0][0], E.v[1][0]], [E.v[0][1], E.v[1][1]]], Pi = M2.inv(P);
    var entry = function (i, j) { return lc([tm(P[i][0].mul(Pi[0][j]), B.e(E.lam[0])), tm(P[i][1].mul(Pi[1][j]), B.e(E.lam[1]))]); };
    var ansD = [[entry(0, 0), entry(0, 1)], [entry(1, 0), entry(1, 1)]];
    var base = eigSteps(E).concat(['Eigenvectors $' + colTex(E.v[0]) + '$ and $' + colTex(E.v[1]) + '$ form $P = ' + matTex(P) + '$, and $A = PDP^{-1}$ with $P^{-1} = ' + matTex(Pi) + '$.', '$e^{At} = Pe^{Dt}P^{-1}$, where $e^{Dt} = ' + mExpTex([[B.e(E.lam[0]), { tex: '0' }], [{ tex: '0' }, B.e(E.lam[1])]]).replace(/\{ \}/g, '1') + '$.']);
    if (kind === 'diagz') {
      chk({ topic: 'de.matrix-exponential', kind: 'expm', A: E.A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), ans: mExpPl(ansD) });
      return { q: 'Find $e^{At}$ for $A = ' + matTex(E.A) + '$.', a: { t: 'matrix', v: mExpPl(ansD) }, steps: base.concat(['Multiply out: $e^{At} = ' + mExpTex(ansD) + '$.']), hint: 'Diagonalize: $e^{At} = Pe^{Dt}P^{-1}$.' };
    }
    var x0 = [q(R.int(-3, 3)), q(R.nz(-3, 3))], comps = [0, 1].map(function (i) { return lc([tm(P[i][0].mul(Pi[0][0].mul(x0[0]).add(Pi[0][1].mul(x0[1]))), B.e(E.lam[0])), tm(P[i][1].mul(Pi[1][0].mul(x0[0]).add(Pi[1][1].mul(x0[1]))), B.e(E.lam[1]))]); });
    chk({ topic: 'de.eigen-solutions', kind: 'ivp', A: E.A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), x0: x0.map(function (x) { return x.toNumber(); }), ans: comps.map(function (c) { return c.pl; }) });
    return { q: 'Use $\\mathbf{x}(t) = e^{At}\\mathbf{x}(0)$ to solve $\\mathbf{x}\' = ' + matTex(E.A) + '\\mathbf{x}$, $\\mathbf{x}(0) = ' + colTex(x0) + '$.', a: { t: 'multi', parts: [{ label: '$x_1(t) =$', a: ex(comps[0].pl) }, { label: '$x_2(t) =$', a: ex(comps[1].pl) }] },
      steps: base.concat(['$e^{At} = ' + mExpTex(ansD) + '$.', 'Multiply by $\\mathbf{x}(0)$: $x_1 = ' + comps[0].tex + '$, $x_2 = ' + comps[1].tex + '$.']), hint: 'Find $e^{At} = Pe^{Dt}P^{-1}$ and multiply by the initial vector.' };
  });

  // ---------- de.nonhomogeneous-systems ----------
  G('de.nonhomogeneous-systems', function (R, ctx) {
    var kind = pickKind(R, ctx, ['const'], ['exp', 'const'], ['ivp', 'exp']);
    var E = realEig(R, { noZero: true }), A = E.A, sysA = matTex(A);
    if (kind === 'const' || kind === 'ivp') {
      var xp = [q(R.int(-3, 3)), q(R.nz(-3, 3))], b = mv(A, xp).map(function (z) { return z.neg(); });
      var eqT = "\\mathbf{x}' = " + sysA + '\\mathbf{x} + ' + colTex(b);
      var st = ['A constant forcing has a constant particular solution: $\\mathbf{x}_p\' = \\mathbf{0}$, so $A\\mathbf{x}_p + \\mathbf{b} = \\mathbf{0}$.', 'Solve $' + sysA + '\\mathbf{x}_p = ' + colTex(b.map(function (z) { return z.neg(); })) + '$: $\\mathbf{x}_p = ' + colTex(xp) + '$ (the equilibrium).'];
      if (kind === 'const') { chk({ topic: 'de.nonhomogeneous-systems', kind: 'eq', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), b: b.map(function (x) { return x.toNumber(); }), ans: xp.map(function (x) { return x.toNumber(); }) });
        return { q: 'Find the constant (equilibrium) solution of $' + eqT + '$. Enter it as $(x_1, x_2)$.', a: { t: 'tuple', v: xp.map(function (z) { return z.toPlain(); }) }, steps: st, hint: 'Set $\\mathbf{x}\' = \\mathbf{0}$ and solve $A\\mathbf{x} = -\\mathbf{b}$.' }; }
      var c1 = q(R.nz(-2, 2)), c2 = q(R.int(-2, 2)), x0 = [0, 1].map(function (j) { return xp[j].add(c1.mul(E.v[0][j])).add(c2.mul(E.v[1][j])); });
      var comps = [0, 1].map(function (j) { return lc([tm(xp[j]), tm(c1.mul(E.v[0][j]), B.e(E.lam[0])), tm(c2.mul(E.v[1][j]), B.e(E.lam[1]))]); });
      chk({ topic: 'de.nonhomogeneous-systems', kind: 'ivp', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), f: b.map(function (x) { return x.toPlain(); }), x0: x0.map(function (x) { return x.toNumber(); }), ans: comps.map(function (c) { return c.pl; }) });
      return { q: 'Solve $' + eqT + '$ with $\\mathbf{x}(0) = ' + colTex(x0) + '$.', a: { t: 'multi', parts: [{ label: '$x_1(t) =$', a: ex(comps[0].pl) }, { label: '$x_2(t) =$', a: ex(comps[1].pl) }] },
        steps: st.concat(eigSteps(E), [evecStep(E, 0), evecStep(E, 1), '$\\mathbf{x} = \\mathbf{x}_p + c_1e^{' + kv(E.lam[0]) + '}\\mathbf{v}_1 + c_2e^{' + kv(E.lam[1]) + '}\\mathbf{v}_2$.', 'At $t = 0$: $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 = \\mathbf{x}(0) - \\mathbf{x}_p = ' + colTex([x0[0].sub(xp[0]), x0[1].sub(xp[1])]) + '$, so $c_1 = ' + c1.toTex() + '$, $c_2 = ' + c2.toTex() + '$.', '$x_1 = ' + comps[0].tex + '$, $x_2 = ' + comps[1].tex + '$.']),
        hint: 'Particular (equilibrium) solution plus the homogeneous solution; fit the initial condition last.' };
    }
    var k = R.intNot(-3, 3, [0, E.lam[0].toNumber(), E.lam[1].toNumber()]), a = [q(R.nz(-3, 3)), q(R.int(-3, 3))];
    var g = [q(k).mul(a[0]).sub(mv(A, a)[0]), q(k).mul(a[1]).sub(mv(A, a)[1])];
    chk({ topic: 'de.nonhomogeneous-systems', kind: 'expf', A: A.map(function (r) { return r.map(function (x) { return x.toNumber(); }); }), k: k, g: g.map(function (x) { return x.toNumber(); }), ans: a.map(function (x) { return x.toNumber(); }) });
    return { q: 'Find the particular solution of the form $\\mathbf{x}_p = e^{' + kv(k) + '}\\mathbf{a}$ for $\\mathbf{x}\' = ' + sysA + '\\mathbf{x} + e^{' + kv(k) + '}' + colTex(g) + '$. Enter $\\mathbf{a}$ as $(a_1, a_2)$.', a: { t: 'tuple', v: a.map(function (z) { return z.toPlain(); }) },
      steps: ['Substitute: $' + T.coef(k, 'e^{' + kv(k) + '}') + '\\mathbf{a} = e^{' + kv(k) + '}A\\mathbf{a} + e^{' + kv(k) + '}\\mathbf{g}$, so $(' + T.coef(k, 'I') + ' - A)\\mathbf{a} = \\mathbf{g}$.',
        '$' + T.coef(k, 'I') + ' - A = ' + matTex(M2.add(M2.scale(k, [[1, 0], [0, 1]]), M2.scale(-1, A))) + '$ (invertible, since $' + k + '$ is not an eigenvalue).', 'Solve: $\\mathbf{a} = ' + colTex(a) + '$.'],
      hint: 'Substitute $e^{kt}\\mathbf{a}$ and cancel $e^{kt}$: you get $(kI - A)\\mathbf{a} = \\mathbf{g}$.' };
  });

  // ---------- de.linearization ----------
  function nlSys(R) {
    var f = R.int(1, 3);
    if (f === 1) { // competing species
      var xs = R.int(1, 3), ys = R.int(1, 3), b = R.int(1, 2), c = R.int(1, 2), e = R.int(1, 2), ff = R.int(1, 2); if (b * ff === c * e) ff = ff + 1;
      var a = b * xs + c * ys, d = e * xs + ff * ys;
      return { f: f, P: 'x*(' + a + ' - ' + b + '*x - ' + c + '*y)', Q: 'y*(' + d + ' - ' + e + '*x - ' + ff + '*y)', tex: "x' = x(" + a + T.coef(-b, 'x', false) + T.coef(-c, 'y', false) + "),\\quad y' = y(" + d + T.coef(-e, 'x', false) + T.coef(-ff, 'y', false) + ')', eq: [xs, ys], J: [[-b * xs, -c * xs], [-e * ys, -ff * ys]], where: 'with $x > 0$ and $y > 0$', eqSt: 'Both brackets must vanish: $' + T.terms([[b, 'x'], [c, 'y']]) + ' = ' + a + '$ and $' + T.terms([[e, 'x'], [ff, 'y']]) + ' = ' + d + '$, so $(x, y) = (' + xs + ', ' + ys + ')$.', Jgen: '\\begin{bmatrix} ' + a + T.coef(-2 * b, 'x', false) + T.coef(-c, 'y', false) + ' & ' + T.mono(-c, 'x') + ' \\\\ ' + T.mono(-e, 'y') + ' & ' + d + T.coef(-e, 'x', false) + T.coef(-2 * ff, 'y', false) + ' \\end{bmatrix}' };
    }
    if (f === 2) { var k = R.int(1, 3), sg = R.sign(); return { f: f, P: 'x - y', Q: 'x^2 - ' + k * k, tex: "x' = x - y,\\quad y' = x^{2} - " + k * k, eq: [sg * k, sg * k], J: [[1, -1], [2 * sg * k, 0]], where: 'with $x ' + (sg > 0 ? '>' : '<') + ' 0$', eqSt: "$x' = 0$ gives $y = x$; $y' = 0$ gives $x = \\pm " + k + '$. The one asked for is $(' + sg * k + ', ' + sg * k + ')$.', Jgen: '\\begin{bmatrix} 1 & -1 \\\\ 2x & 0 \\end{bmatrix}' }; }
    var k3 = R.int(1, 3), s3 = R.sign(); return { f: f, P: 'y', Q: '-' + k3 * k3 + '*x + x^3', tex: "x' = y,\\quad y' = -" + (k3 * k3 === 1 ? '' : k3 * k3) + 'x + x^{3}', eq: [s3 * k3, 0], J: [[0, 1], [-k3 * k3 + 3 * k3 * k3, 0]], where: 'with $x ' + (s3 > 0 ? '>' : '<') + ' 0$', eqSt: "$x' = 0$ gives $y = 0$; then $x(x^{2} - " + k3 * k3 + ') = 0$, so $x = 0$ or $x = \\pm ' + k3 + '$. The one asked for is $(' + s3 * k3 + ', 0)$.', Jgen: '\\begin{bmatrix} 0 & 1 \\\\ -' + (k3 * k3 === 1 ? '' : k3 * k3) + ' + 3x^{2} & 0 \\end{bmatrix}' };
  }
  G('de.linearization', function (R, ctx) {
    var kind = pickKind(R, ctx, ['eq'], ['J', 'class', 'eq'], ['class', 'J']);
    var S = nlSys(R), J = S.J.map(function (r) { return r.map(function (x) { return q(x); }); }), tr = J[0][0].add(J[1][1]), det = M2.det(J), t = classify(tr, det);
    chk({ topic: 'de.linearization', kind: 'nl', P: S.P, Q: S.Q, eq: S.eq, J: S.J, cls: t });
    if (kind === 'eq') return { q: 'Find the equilibrium of $' + S.tex + '$ ' + S.where + '. Enter it as $(x, y)$.', a: { t: 'tuple', v: S.eq.map(String) }, steps: ["Equilibria are where $x' = 0$ and $y' = 0$ at the same time.", S.eqSt], hint: "Set both right sides to 0 and solve together." };
    if (kind === 'J') return { q: 'Find the Jacobian matrix of $' + S.tex + '$ at the equilibrium $(' + S.eq.join(', ') + ')$.', a: { t: 'matrix', v: S.J.map(function (r) { return r.map(String); }) },
      steps: ['$J = \\begin{bmatrix} \\partial f/\\partial x & \\partial f/\\partial y \\\\ \\partial g/\\partial x & \\partial g/\\partial y \\end{bmatrix} = ' + S.Jgen + '$.', 'At $(' + S.eq.join(', ') + ')$: $J = ' + matTex(J) + '$.'], hint: 'Take the four partial derivatives of the right sides, then plug in the point.' };
    var note = t === 'center' ? ' For the nonlinear system, a center of the linearization is not decisive: the nonlinear terms decide whether orbits close up or spiral.' : '';
    return { q: 'Use linearization to classify the equilibrium $(' + S.eq.join(', ') + ')$ of $' + S.tex + '$.', a: typeChoices(R, t),
      steps: ['Jacobian: $' + S.Jgen + '$; at the point it is $' + matTex(J) + '$.', 'Trace $' + tr.toTex() + '$, determinant $' + det.toTex() + '$, $\\tau^{2} - 4\\Delta = ' + tr.mul(tr).sub(det.mul(4)).toTex() + '$.', typeWhy(t) + note, 'Near the equilibrium the nonlinear system behaves like this linear one (the type carries over for saddles, nodes and spirals).'],
      hint: 'Compute the Jacobian at the point, then classify it with its trace and determinant.' };
  });

  // ---------- de.predator-prey-pendulum ----------
  G('de.predator-prey-pendulum', function (R, ctx) {
    var kind = pickKind(R, ctx, ['lvEq', 'pend'], ['lvJ', 'lvPeriod', 'lvEq'], ['damped', 'lvPeriod', 'pend']);
    if (kind.indexOf('lv') === 0) {
      var xs = R.int(2, 6), ys = R.int(2, 6), b = R.pick([q(1, 2), q(1), q(1, 4), q(1, 10)]), d = R.pick([q(1, 2), q(1), q(1, 4), q(1, 10)]), a = b.mul(ys), c = d.mul(xs);
      if (kind === 'lvPeriod') { var pr = R.pick([[1, 4], [4, 1], [2, 2], [1, 1], [1, 9], [9, 1], [4, 4]]); a = q(pr[0]); c = q(pr[1]); b = a.div(ys); d = c.div(xs); }
      var tex = "x' = x(" + a.toTex() + T.coef(b.neg(), 'y', false) + "),\\quad y' = y(" + T.coef(c.neg(), '') + T.coef(d, 'x', false) + ')';
      var J = [[q(0), b.neg().mul(xs)], [d.mul(ys), q(0)]];
      chk({ topic: 'de.predator-prey-pendulum', kind: 'lv', a: a.toNumber(), b: b.toNumber(), c: c.toNumber(), d: d.toNumber(), eq: [xs, ys] });
      var intro = 'In the predator–prey model $' + tex + '$ ($x$ = prey, $y$ = predators)';
      if (kind === 'lvEq') return { q: intro + ', find the equilibrium where both species are present. Enter $(x, y)$.', a: { t: 'tuple', v: [String(xs), String(ys)] },
        steps: ["$x' = 0$ with $x \\ne 0$ needs $" + a.toTex() + T.coef(b.neg(), 'y', false) + ' = 0$, so $y = ' + ys + '$.', "$y' = 0$ with $y \\ne 0$ needs $" + T.coef(c.neg(), '') + T.coef(d, 'x', false) + ' = 0$, so $x = ' + xs + '$.', 'Coexistence equilibrium: $(' + xs + ', ' + ys + ')$.'], hint: 'Set each bracket to zero.' };
      if (kind === 'lvJ') return { q: intro + ', find the Jacobian at the coexistence equilibrium $(' + xs + ', ' + ys + ')$.', a: { t: 'matrix', v: J.map(function (r) { return r.map(function (z) { return z.toPlain(); }); }) },
        steps: ['$J = \\begin{bmatrix} ' + a.toTex() + T.coef(b.neg(), 'y', false) + ' & ' + T.mono(b.neg(), 'x') + ' \\\\ ' + T.mono(d, 'y') + ' & ' + T.coef(c.neg(), '') + T.coef(d, 'x', false) + ' \\end{bmatrix}$.', 'At $(' + xs + ', ' + ys + ')$ the diagonal entries vanish: $J = ' + matTex(J) + '$.', 'Its eigenvalues are purely imaginary ($\\pm i\\sqrt{ac}$ with $ac = ' + a.mul(c).toTex() + '$): the linearization is a center, and for this model the orbits really are closed, so the populations cycle.'],
        hint: 'Differentiate each right side with respect to $x$ and $y$, then substitute the equilibrium.' };
      var w = Math.sqrt(a.mul(c).toNumber());
      return { q: intro + ', small oscillations around the coexistence equilibrium have period about $\\frac{2\\pi}{\\sqrt{ac}}$. Find that period (exact, or to 2 decimal places).', a: num('2pi/' + w, { tol: 0.006 }),
        steps: ['The Jacobian at the equilibrium is $\\begin{bmatrix} 0 & -bx^{*} \\\\ dy^{*} & 0 \\end{bmatrix}$ with eigenvalues $\\pm i\\sqrt{ac}$.', 'Here $ac = ' + a.toTex() + '\\cdot ' + c.toTex() + ' = ' + a.mul(c).toTex() + '$, so the angular frequency is $' + w + '$.', 'Period $= \\frac{2\\pi}{' + w + '} \\approx ' + (2 * Math.PI / w).toFixed(2) + '$.'], hint: 'The linearization is a center with angular frequency $\\sqrt{ac}$.' };
    }
    if (kind === 'pend') {
      var Lp = R.pick([['9.8', 1], ['2.45', 2], ['0.6125', 4], ['39.2', 0.5]]);
      return { q: 'A pendulum of length ' + Lp[0] + ' m obeys $\\theta\'\' + \\frac{g}{L}\\sin\\theta = 0$ with $g = 9.8$ m/s². For small swings, what is its period in seconds? (Exact, or to 2 decimal places.)', a: num('2pi/' + Lp[1], { tol: 0.006 }), unit: 's',
        steps: ['For small $\\theta$, $\\sin\\theta \\approx \\theta$ (this is the linearization at $(0, 0)$): $\\theta\'\' + \\frac{g}{L}\\theta = 0$.', '$\\omega = \\sqrt{g/L} = \\sqrt{9.8/' + Lp[0] + '} = ' + Lp[1] + '$ rad/s.', 'Period $= \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{' + Lp[1] + '} \\approx ' + (2 * Math.PI / Lp[1]).toFixed(2) + '$ s.'], hint: 'Replace $\\sin\\theta$ by $\\theta$ and find $\\omega = \\sqrt{g/L}$.' };
    }
    var w2 = R.int(1, 3), cdamp = R.pick([1, 2, 3, 5, 7]), at = R.pick(['0', 'pi']);
    var Jd = at === '0' ? [[0, 1], [-w2 * w2, -cdamp]] : [[0, 1], [w2 * w2, -cdamp]], t = classify(Jd[0][0] + Jd[1][1], M2.det(Jd));
    chk({ topic: 'de.predator-prey-pendulum', kind: 'damped', w2: w2 * w2, c: cdamp, at: at, ans: t });
    return { q: 'A damped pendulum obeys $\\theta\' = \\omega,\\ \\omega\' = -' + (w2 * w2 === 1 ? '' : w2 * w2) + '\\sin\\theta - ' + (cdamp === 1 ? '' : cdamp) + '\\omega$. Classify the equilibrium $(' + (at === '0' ? '0' : '\\pi') + ', 0)$ (pendulum ' + (at === '0' ? 'hanging down' : 'balanced straight up') + ').', a: typeChoices(R, t),
      steps: ['Jacobian: $\\begin{bmatrix} 0 & 1 \\\\ -' + (w2 * w2 === 1 ? '' : w2 * w2) + '\\cos\\theta & -' + cdamp + ' \\end{bmatrix}$.', 'At $\\theta = ' + (at === '0' ? '0' : '\\pi') + '$, $\\cos\\theta = ' + (at === '0' ? '1' : '-1') + '$: $J = ' + matTex(Jd) + '$, with trace $' + (-cdamp) + '$ and determinant $' + M2.det(Jd).toTex() + '$.', typeWhy(t)],
      hint: 'Linearize: the Jacobian uses $\\cos\\theta$ at the equilibrium.' };
  });

// ---- u8.js
  // =====================================================================================================
  // UNIT 6: Series Solutions
  // =====================================================================================================
  // P(x)y'' + Q(x)y' + R(x)y = 0 with polynomial coefficients (low -> high), P(0) != 0: Taylor coefficients a_0..a_N
  function seriesCoef(P, Qp, Rp, a0, a1, N) {
    var a = [q(a0), q(a1)];
    for (var n = 0; a.length <= N; n++) {
      var s = q(0);
      for (var i = 1; i < P.length; i++) { var m = n + 2 - i; if (m >= 0 && m < a.length) s = s.add(q(P[i]).mul((m) * (m - 1)).mul(a[m])); }
      for (var j = 0; j < Qp.length; j++) { var m2 = n + 1 - j; if (m2 >= 0 && m2 < a.length) s = s.add(q(Qp[j]).mul(m2).mul(a[m2])); }
      for (var k = 0; k < Rp.length; k++) { var m3 = n - k; if (m3 >= 0 && m3 < a.length) s = s.add(q(Rp[k]).mul(a[m3])); }
      a.push(s.neg().div(q(P[0]).mul((n + 2) * (n + 1))));
    }
    return a;
  }
  var SER = [ // families: P, Q, R (low -> high), TeX, recurrence (TeX, plain in n) for two-term families
    function (R) { var k = R.nz(-3, 3), kk = k; return { P: [1], Q: [0], R: [k * k], tex: "y'' + " + (k * k === 1 ? '' : k * k) + 'y = 0', rec: ['-\\frac{' + k * k + '}{(n + 2)(n + 1)}', '-' + k * k + '/((n+2)(n+1))'], why: 'The $y\'\'$ sum becomes $\\sum (n + 2)(n + 1)a_{n+2}x^{n}$ and the $' + T.mono(k * k, 'y') + '$ sum is $\\sum ' + T.mono(k * k, 'a_nx^{n}') + '$.' }; },
    function () { return { P: [1], Q: [0, 1], R: [1], tex: "y'' + xy' + y = 0", rec: ['-\\frac{1}{n + 2}', '-1/(n+2)'], why: "$xy' = \\sum na_nx^{n}$, so the $x^{n}$ coefficient is $(n + 2)(n + 1)a_{n+2} + na_n + a_n = 0$, and $(n + 1)$ cancels." }; },
    function () { return { P: [1], Q: [0, -1], R: [-1], tex: "y'' - xy' - y = 0", rec: ['\\frac{1}{n + 2}', '1/(n+2)'], why: "The $x^{n}$ coefficient is $(n + 2)(n + 1)a_{n+2} - na_n - a_n = 0$, and $(n + 1)$ cancels." }; },
    function (R) { var lam = R.pick([2, 4, 6]); return { P: [1], Q: [0, -2], R: [lam], tex: "y'' - 2xy' + " + lam + 'y = 0', rec: ['\\frac{2n - ' + lam + '}{(n + 2)(n + 1)}', '(2n - ' + lam + ')/((n+2)(n+1))'], why: "$-2xy' = \\sum -2na_nx^{n}$, so $(n + 2)(n + 1)a_{n+2} + (" + lam + ' - 2n)a_n = 0$. (This is Hermite\'s equation.)' }; },
    function () { return { P: [1], Q: [0], R: [0, -1], tex: "y'' - xy = 0", rec: null, why: "$xy = \\sum a_nx^{n+1} = \\sum a_{n-1}x^{n}$: shifting gives $(n + 2)(n + 1)a_{n+2} = a_{n-1}$ for $n \\ge 1$ and $a_2 = 0$ (Airy's equation)." }; },
    function () { return { P: [1, 0, -1], Q: [0, -2], R: [6], tex: "(1 - x^{2})y'' - 2xy' + 6y = 0", rec: ['\\frac{n(n + 1) - 6}{(n + 2)(n + 1)}', '(n(n+1) - 6)/((n+2)(n+1))'], why: "$-x^{2}y'' - 2xy' + 6y$ contributes $[-n(n - 1) - 2n + 6]a_n = -[n(n + 1) - 6]a_n$ to the $x^{n}$ coefficient (Legendre's equation)." }; }
  ];
  function seriesTex(a, N) { var terms = []; for (var i = 0; i <= N; i++) if (!a[i].isZero()) terms.push([a[i], i === 0 ? '' : i === 1 ? 'x' : 'x^{' + i + '}']); return T.terms(terms) + ' + \\dots'; }
  G('de.series-solutions', function (R, ctx) {
    var kind = pickKind(R, ctx, ['shift', 'exp'], ['rec', 'coef', 'shift'], ['coef', 'rec']);
    if (kind === 'shift') {
      var which = R.pick(['ypp', 'yp', 'xy']), ansE, st, texS;
      if (which === 'ypp') { texS = '\\sum_{n=2}^{\\infty} n(n - 1)a_nx^{n-2}'; ansE = '(n+2)(n+1)'; st = ['Let $m = n - 2$, so $n = m + 2$ and the sum starts at $m = 0$: $\\sum_{m=0}^{\\infty} (m + 2)(m + 1)a_{m+2}x^{m}$.', 'Rename $m$ as $n$: the factor is $(n + 2)(n + 1)$, multiplying $a_{n+2}$.']; }
      else if (which === 'yp') { texS = '\\sum_{n=1}^{\\infty} na_nx^{n-1}'; ansE = 'n+1'; st = ['Let $m = n - 1$: $\\sum_{m=0}^{\\infty} (m + 1)a_{m+1}x^{m}$.', 'Rename: the factor is $n + 1$, multiplying $a_{n+1}$.']; }
      else { texS = 'x\\sum_{n=2}^{\\infty} n(n - 1)a_nx^{n-2} = \\sum_{n=2}^{\\infty} n(n - 1)a_nx^{n-1}'; ansE = '(n+1)n'; st = ['Let $m = n - 1$, so $n = m + 1$: $\\sum_{m=1}^{\\infty} (m + 1)m\\,a_{m+1}x^{m}$.', 'Rename: the factor is $(n + 1)n$, multiplying $a_{n+1}$ (and the $n = 0$ term is 0 anyway).']; }
      var target = which === 'ypp' ? 'a_{n+2}' : 'a_{n+1}';
      chk({ topic: 'de.series-solutions', kind: 'shift', which: which, ans: ansE });
      return { q: 'Rewrite $' + texS + '$ in the form $\\sum c_n\\,' + target + 'x^{n}$. What is $c_n$ (a polynomial in $n$)?', a: ex(ansE, ['n']), steps: st.concat(['Every sum in the equation must be shifted to the same power $x^{n}$ before coefficients can be matched.']), hint: 'Substitute a new index so the power of $x$ becomes $x^{n}$, and shift every $n$ in the term the same way.' };
    }
    if (kind === 'exp') {
      var k = R.nz(-3, 3), a0 = R.nz(-3, 3), K = R.int(3, 4), a = [q(a0)]; for (var n = 0; n < K; n++) a.push(a[n].mul(k).div(n + 1));
      chk({ topic: 'de.series-solutions', kind: 'coef', P: [0], Q: [1], R: [-k], first: true, a0: a0, n: K, ans: a[K].toNumber() });
      return { q: "Substitute $y = \\sum_{n=0}^{\\infty} a_nx^{n}$ into $y' = " + T.mono(k, 'y') + '$. With $a_0 = ' + a0 + '$, find $a_' + K + '$.', a: num(a[K].toPlain()),
        steps: ["$y' = \\sum_{n=0}^{\\infty} (n + 1)a_{n+1}x^{n}$ (after shifting the index).", 'Match the $x^{n}$ coefficients: $(n + 1)a_{n+1} = ' + T.coef(k, 'a_n') + '$, so $a_{n+1} = ' + fracT(k, 'a_n', 'n + 1') + '$.', a.slice(1).map(function (v, i) { return '$a_' + (i + 1) + ' = ' + v.toTex() + '$'; }).join(', ') + '.', '(These are the Taylor coefficients of $' + T.coef(a0, 'e^{' + kv(k, 'x') + '}') + '$, the exact solution.)'],
        hint: 'Shift the index in $y\'$, match coefficients, and apply the recurrence step by step.' };
    }
    var F = R.pick(kind === 'rec' ? [SER[0], SER[1], SER[2], SER[3], SER[5]] : SER)(R);
    if (kind === 'rec') {
      chk({ topic: 'de.series-solutions', kind: 'rec', P: F.P, Q: F.Q, R: F.R, ans: F.rec[1] });
      return { q: 'Substituting $y = \\sum a_nx^{n}$ into $' + F.tex + '$ gives a recurrence $a_{n+2} = c_n\\,a_n$. Find $c_n$.', a: ex(F.rec[1], ['n']),
        steps: ["$y'' = \\sum_{n=0}^{\\infty} (n + 2)(n + 1)a_{n+2}x^{n}$ after shifting the index by 2.", F.why, 'Solve for $a_{n+2}$: $c_n = ' + F.rec[0] + '$.'], hint: 'Write every sum with $x^n$, then set the total coefficient of $x^n$ to 0 and solve for $a_{n+2}$.' };
    }
    var y0 = R.int(-2, 3), v0 = R.int(-2, 3); if (!y0 && !v0) y0 = 1;
    var N = R.pick([4, 5]), co = seriesCoef(F.P, F.Q, F.R, y0, v0, N);
    chk({ topic: 'de.series-solutions', kind: 'coef', P: F.P, Q: F.Q, R: F.R, a0: y0, a1: v0, n: N, ans: co[N].toNumber() });
    return { q: 'Find the coefficient of $x^{' + N + '}$ in the power series solution of $' + F.tex + '$ with $y(0) = ' + y0 + "$ and $y'(0) = " + v0 + '$.', a: num(co[N].toPlain()),
      steps: ['$a_0 = y(0) = ' + y0 + "$ and $a_1 = y'(0) = " + v0 + '$.', F.rec ? 'The recurrence is $a_{n+2} = ' + F.rec[0] + '\\,a_n$.' : F.why, 'Apply it: ' + co.slice(2, N + 1).map(function (v, i) { return '$a_' + (i + 2) + ' = ' + v.toTex() + '$'; }).join(', ') + '.', 'So $y = ' + seriesTex(co, N) + '$ and the coefficient of $x^{' + N + '}$ is $' + co[N].toTex() + '$.'],
      hint: 'Find the recurrence, then step from $a_0$ and $a_1$ up to the coefficient you need.' };
  });

  // ---------- de.cauchy-euler ----------
  G('de.cauchy-euler', function (R, ctx) {
    var kind = pickKind(R, ctx, ['roots'], ['ivp', 'roots'], ['rep', 'cx', 'ivp']);
    var c1 = R.nz(-3, 3), c2 = R.nz(-3, 3), a, b, eq, sol, y0, v0, st;
    if (kind === 'roots' || kind === 'ivp') {
      var r1 = R.int(-3, 3), r2 = R.intNot(-3, 4, [r1]); a = 1 - r1 - r2; b = r1 * r2;
      eq = "x^{2}y''" + T.coef(a, "xy'", false) + T.coef(b, 'y', false) + ' = 0';
      var ind = 'Try $y = x^{r}$: $x^{2}y\'\' = r(r - 1)x^{r}$ and $xy\' = rx^{r}$, so $r(r - 1)' + T.coef(a, 'r', false) + T.signed(b) + ' = 0$, that is, $' + charTex([1, a - 1, b]) + ' = 0$.';
      if (kind === 'roots') { chk({ topic: 'de.cauchy-euler', kind: 'roots', a: a, b: b, ans: [r1, r2] });
        return { q: 'Find the values of $r$ for which $y = x^{r}$ solves $' + eq + '$ ($x > 0$).', a: { t: 'set', v: [String(r1), String(r2)] }, steps: [ind, 'Factor: $' + charFactorTex(1, [r1, r2]) + ' = 0$, so $r = ' + Math.min(r1, r2) + '$ or $r = ' + Math.max(r1, r2) + '$.'], hint: 'Substitute $y = x^r$; every term becomes a multiple of $x^r$.' }; }
      sol = lc([tm(c1, B.pow(r1, 'x')), tm(c2, B.pow(r2, 'x'))]); y0 = c1 + c2; v0 = r1 * c1 + r2 * c2;
      st = [ind, 'Roots $r = ' + r1 + '$ and $r = ' + r2 + '$: $y = c_1' + tpw(r1, 'x') + ' + c_2' + tpw(r2, 'x') + '$.'.replace('c_1$', 'c_1$').replace('c_1 +', 'c_1 +'), '$y(1) = c_1 + c_2 = ' + y0 + "$ and $y'(1) = " + T.terms([[r1, 'c_1'], [r2, 'c_2']]) + ' = ' + v0 + '$, so $c_1 = ' + c1 + '$, $c_2 = ' + c2 + '$.', '$y = ' + sol.tex + '$.'];
    } else if (kind === 'rep') {
      var r = R.nz(-2, 2); a = 1 - 2 * r; b = r * r; eq = "x^{2}y''" + T.coef(a, "xy'", false) + T.coef(b, 'y', false) + ' = 0';
      sol = prodLc(B.pow(r, 'x'), [tm(c1), tm(c2, B.raw('\\ln x', 'ln(x)'))]); y0 = c1; v0 = r * c1 + c2;
      st = ['Try $y = x^{r}$: $' + charTex([1, a - 1, b]) + ' = (' + T.lin(1, 'r', -r) + ')^{2} = 0$, a repeated root $r = ' + r + '$.', 'The second solution is $' + tpw(r, 'x') + '\\ln x$: $y = ' + tpw(r, 'x') + '(c_1 + c_2\\ln x)$.', '$y(1) = c_1 = ' + y0 + "$; $y'(1) = " + T.coef(r, 'c_1') + ' + c_2 = ' + v0 + '$, so $c_2 = ' + c2 + '$.', '$y = ' + sol.tex + '$.'];
    } else {
      var al = R.int(-2, 2), be = R.int(1, 3); a = 1 - 2 * al; b = al * al + be * be; eq = "x^{2}y''" + T.coef(a, "xy'", false) + T.coef(b, 'y', false) + ' = 0';
      var lnT = function (f) { return { tex: '\\' + f + '(' + (be === 1 ? '' : be) + '\\ln x)', pl: f + '(' + be + ' ln(x))' }; };
      sol = prodLc(B.pow(al, 'x'), [tm(c1, lnT('cos')), tm(c2, lnT('sin'))]); y0 = c1; v0 = al * c1 + be * c2;
      st = ['Try $y = x^{r}$: $' + charTex([1, a - 1, b]) + ' = 0$ gives $r = ' + (al ? al + ' \\pm ' : '\\pm ') + (be === 1 ? '' : be) + 'i$.', 'Since $x^{i\\beta} = e^{i\\beta\\ln x} = \\cos(\\beta\\ln x) + i\\sin(\\beta\\ln x)$: $y = ' + tpw(al, 'x') + '\\left(c_1\\cos(' + (be === 1 ? '' : be) + '\\ln x) + c_2\\sin(' + (be === 1 ? '' : be) + '\\ln x)\\right)$.', '$y(1) = c_1 = ' + y0 + "$; $y'(1) = " + T.terms([[al, 'c_1'], [be, 'c_2']]) + ' = ' + v0 + '$, so $c_2 = ' + c2 + '$.', '$y = ' + sol.tex + '$.'];
    }
    chk({ topic: 'de.cauchy-euler', kind: 'ivp', F: 'x^2*y2 + (' + a + ')*x*y1 + (' + b + ')*y', v: 'x', ic: [1, y0, v0], ans: sol.pl, dom: [0.5, 2.5] });
    return { q: 'Solve $' + eq + '$ for $x > 0$ with $y(1) = ' + y0 + "$ and $y'(1) = " + v0 + '$.', a: ex(sol.pl, ['x']), steps: st, hint: 'Try $y = x^r$ to get a quadratic in $r$, then fit the conditions at $x = 1$.' };
  });

  // ---------- de.frobenius ----------
  G('de.frobenius', function (R, ctx) {
    var kind = pickKind(R, ctx, ['classify'], ['indicial', 'classify'], ['a1', 'indicial']);
    if (kind === 'classify') {
      var pool = [
        ["x^{2}y'' + 3xy' + y = 0", 'regular singular point', '$p = \\frac{3}{x}$ has a simple pole and $q = \\frac{1}{x^{2}}$ a double pole: $xp = 3$ and $x^{2}q = 1$ are analytic.'],
        ["xy'' + y' + xy = 0", 'regular singular point', '$p = \\frac{1}{x}$ and $q = 1$: $xp = 1$ and $x^{2}q = x^{2}$ are analytic.'],
        ["x^{3}y'' + y' + y = 0", 'irregular singular point', '$p = \\frac{1}{x^{3}}$: $xp = \\frac{1}{x^{2}}$ still blows up at 0.'],
        ["x^{2}y'' + y' - y = 0", 'irregular singular point', '$p = \\frac{1}{x^{2}}$: $xp = \\frac{1}{x}$ still blows up at 0.'],
        ["(1 + x^{2})y'' + xy' - y = 0", 'ordinary point', '$p = \\frac{x}{1 + x^{2}}$ and $q = \\frac{-1}{1 + x^{2}}$ are analytic at 0 (the denominator is 1 there).'],
        ["y'' + e^{x}y' + y = 0", 'ordinary point', '$p = e^{x}$ and $q = 1$ are analytic at 0.'],
        ["2x^{2}y'' + xy' - (1 + x)y = 0", 'regular singular point', '$p = \\frac{1}{2x}$ and $q = -\\frac{1 + x}{2x^{2}}$: $xp = \\frac{1}{2}$ and $x^{2}q = -\\frac{1 + x}{2}$ are analytic.'],
        ["x^{2}y'' + \\frac{1}{x}y = 0", 'irregular singular point', '$q = \\frac{1}{x^{3}}$: $x^{2}q = \\frac{1}{x}$ still blows up.'],
        ["x(x - 1)y'' + y' + y = 0", 'regular singular point', '$p = \\frac{1}{x(x - 1)}$ and $q = \\frac{1}{x(x - 1)}$: $xp = \\frac{1}{x - 1}$ and $x^{2}q = \\frac{x}{x - 1}$ are analytic at 0.']
      ];
      var pk = R.pick(pool);
      return { q: 'Classify the point $x = 0$ for $' + pk[0] + '$.', a: mc(R, pk[1], ['ordinary point', 'regular singular point', 'irregular singular point'].filter(function (z) { return z !== pk[1]; })),
        steps: ["Divide by the coefficient of $y''$: $y'' + p(x)y' + q(x)y = 0$.", 'Ordinary if $p$ and $q$ are analytic at 0; regular singular if not, but $xp$ and $x^{2}q$ are; otherwise irregular.', pk[2], 'So $x = 0$ is a ' + pk[1] + '.'],
        hint: 'Write $p$ and $q$ in standard form; check $xp(x)$ and $x^2q(x)$ near 0.' };
    }
    var rs = R.pick([[q(1, 2), q(0)], [q(1), q(-1, 2)], [q(1, 2), q(-1)], [q(3, 2), q(0)], [q(1, 2), q(-1, 2)], [q(1), q(1, 2)], [q(0), q(-1, 2)]]), r1 = rs[0], r2 = rs[1];
    var b0 = q(2).sub(r1.add(r2).mul(2)), g0 = r1.mul(r2).mul(2), b1 = q(R.int(-2, 2)), g1 = q(R.nz(-3, 3));
    var ypT = b1.isZero() ? T.coef(b0, "xy'", false) : b0.isZero() ? T.coef(b1, "x^{2}y'", false) : ' + x(' + T.terms([[b0, ''], [b1, 'x']]) + ")y'";
    var yT = g0.isZero() ? T.coef(g1, 'xy', false) : ' + (' + T.terms([[g0, ''], [g1, 'x']]) + ')y';
    var eq = "2x^{2}y''" + ypT + yT + ' = 0';
    var indT = '2r(r - 1)' + T.coef(b0, 'r', false) + T.signed(g0) + ' = ' + charTex([q(2), b0.sub(2), g0]);
    var P = [0, 0, 2], Qp = [0, b0.toNumber(), b1.toNumber()], Rp = [g0.toNumber(), g1.toNumber()];
    if (kind === 'indicial') {
      chk({ topic: 'de.frobenius', kind: 'ind', b0: b0.toNumber(), g0: g0.toNumber(), ans: [r1.toNumber(), r2.toNumber()] });
      return { q: 'Find the roots of the indicial equation of $' + eq + '$ at $x = 0$.', a: { t: 'set', v: [r1.toPlain(), r2.toPlain()] },
        steps: ['Substitute $y = \\sum a_nx^{n+r}$ and look at the lowest power, $x^{r}$: only the terms with $2x^{2}y\'\'$, the constant part of the $y\'$ coefficient, and the constant part of the $y$ coefficient contribute.', 'Indicial equation: $' + indT + ' = 0$.', 'Factor: $' + charFactorTex(2, [r1, r2]) + ' = 0$, so $r = ' + r1.toTex() + '$ or $r = ' + r2.toTex() + '$.'],
        hint: 'Keep only the lowest power of $x$ after substituting $y = x^r\\sum a_nx^n$.' };
    }
    var Fr = function (s) { s = q(s); return s.mul(s.sub(1)).mul(2).add(b0.mul(s)).add(g0); };
    var a1 = b1.mul(r1).add(g1).neg().div(Fr(r1.add(1)));
    chk({ topic: 'de.frobenius', kind: 'a1', P: P, Q: Qp, R: Rp, r: r1.toNumber(), ans: a1.toNumber() });
    return { q: 'For $' + eq + '$, the indicial roots are $r = ' + r1.toTex() + '$ and $r = ' + r2.toTex() + '$. For the Frobenius solution $y = ' + (r1.eq(1) ? 'x' : 'x^{' + r1.toTex() + '}') + '\\sum_{n=0}^{\\infty} a_nx^{n}$ with $a_0 = 1$, find $a_1$.', a: num(a1.toPlain()),
      steps: ['Substituting $y = \\sum a_nx^{n+r}$, the coefficient of $x^{n+r}$ gives $F(n + r)a_n + [' + T.terms([[b1, '(n + r - 1)'], [g1, '']]) + ']a_{n-1} = 0$, where $F(s) = ' + charTex([q(2), b0.sub(2), g0], 's') + '$.', 'With $r = ' + r1.toTex() + '$ and $n = 1$: $F(' + r1.add(1).toTex() + ') = ' + Fr(r1.add(1)).toTex() + '$ and the bracket is $' + b1.mul(r1).add(g1).toTex() + '$.', '$a_1 = -\\frac{' + b1.mul(r1).add(g1).toTex() + '}{' + Fr(r1.add(1)).toTex() + '}\\cdot a_0 = ' + a1.toTex() + '$.'],
      hint: 'Match the coefficient of $x^{r+1}$: it involves $a_1$ and $a_0$.' };
  });

// ---- u9.js
  // =====================================================================================================
  // UNIT 7: Fourier Series and PDEs
  // =====================================================================================================
  function piVal(c, p) { // c / pi^p as { tex, pl } (c exact rational), p = 0, 1 or 2
    c = q(c); if (c.isZero()) return { tex: '0', pl: '0' };
    if (!p) return { tex: c.toTex(), pl: c.toPlain() };
    var a = c.abs(), s = c.sign() < 0 ? '-' : '', pw = p === 1 ? '\\pi' : '\\pi^{2}', pwp = p === 1 ? 'pi' : 'pi^2';
    return { tex: s + '\\frac{' + a.n + '}{' + (a.d === 1n ? '' : a.d) + pw + '}', pl: s + a.n + '/(' + (a.d === 1n ? '' : a.d) + pwp + ')' };
  }
  function Ltex(L) { return L === 'pi' ? '\\pi' : String(L); }
  function modeArg(n, L) { return L === 'pi' ? kv(n, 'x') : '\\frac{' + (n === 1 ? '' : n) + '\\pi x}{' + L + '}'; }
  function Lnum(L) { return L === 'pi' ? Math.PI : L; }
  function argT(n, L, v) { v = v || 'x'; if (L === 'pi') return (n === 1 ? '' : n) + v; return '\\frac{' + (n === 1 ? '' : n) + '\\pi ' + v + '}{' + L + '}'.replace('{1}', ''); }
  function argP(n, L, v) { v = v || 'x'; if (L === 'pi') return n + v; return n + 'pi*' + v + '/' + L; }
  function argTx(n, L, v) { var s = argT(n, L, v); return L === 1 ? (n === 1 ? '\\pi ' : n + '\\pi ') + (v || 'x') : s; }
  // full-range functions on (-L, L)
  var FF = [
    { name: 'sq', tex: function (c) { return '\\begin{cases} ' + (-c) + ' & -L < x < 0 \\\\ ' + c + ' & 0 < x < L \\end{cases}'; }, pl: function (c) { return c + '*sign(x)'; }, a0: function () { return [q(0), 0]; }, an: function () { return [q(0), 0]; }, bn: function (c, n) { return [n % 2 ? q(4 * c, n) : q(0), 1]; }, odd: true },
    { name: 'x', tex: function () { return 'x'; }, pl: function () { return 'x'; }, a0: function () { return [q(0), 0]; }, an: function () { return [q(0), 0]; }, bn: function (c, n, L) { return [q(2 * L * (n % 2 ? 1 : -1), n), 1]; }, odd: true },
    { name: 'abs', tex: function () { return '|x|'; }, pl: function () { return 'abs(x)'; }, a0: function (c, L) { return [q(L, 2), 0]; }, an: function (c, n, L) { return [n % 2 ? q(-4 * L, n * n) : q(0), 2]; }, bn: function () { return [q(0), 0]; }, even: true },
    { name: 'x2', tex: function () { return 'x^{2}'; }, pl: function () { return 'x^2'; }, a0: function (c, L) { return [q(L * L, 3), 0]; }, an: function (c, n, L) { return [q(4 * L * L * (n % 2 ? -1 : 1), n * n), 2]; }, bn: function () { return [q(0), 0]; }, even: true },
    { name: 'half', tex: function (c) { return '\\begin{cases} 0 & -L < x < 0 \\\\ ' + c + ' & 0 < x < L \\end{cases}'; }, pl: function (c) { return c + '*(1+sign(x))/2'; }, a0: function (c) { return [q(c, 2), 0]; }, an: function () { return [q(0), 0]; }, bn: function (c, n) { return [n % 2 ? q(2 * c, n) : q(0), 1]; } },
    { name: 'ramp', tex: function () { return '\\begin{cases} 0 & -L < x < 0 \\\\ x & 0 < x < L \\end{cases}'; }, pl: function () { return '(x+abs(x))/2'; }, a0: function (c, L) { return [q(L, 4), 0]; }, an: function (c, n, L) { return [n % 2 ? q(-2 * L, n * n) : q(0), 2]; }, bn: function (c, n, L) { return [q(L * (n % 2 ? 1 : -1), n), 1]; } }
  ];
  function scaleL(v, L) { return L === 'pi' ? v : v; }
  // ---------- de.boundary-value-problems ----------
  function omegaArg(m, L, v) { // frequency m*pi/L as an argument "ωx": { tex, pl, w2tex, w2pl }
    m = q(m); v = v || 'x';
    if (L === 'pi') { var s = kv(m, v); return { tex: m.isInt() ? s : '\\frac{' + (m.n === 1n ? '' : m.n.toString()) + v + '}{' + m.d + '}', pl: s, w2tex: m.mul(m).toTex(), w2pl: m.mul(m).toPlain(), w2: m.mul(m).toNumber() }; }
    var c = m.div(L), p = c.n.toString(), d = c.d.toString();
    var tex = d === '1' ? (p === '1' ? '' : p) + '\\pi ' + v : '\\frac{' + (p === '1' ? '' : p) + '\\pi ' + v + '}{' + d + '}';
    var c2 = c.mul(c);
    return { tex: tex, pl: (p === '1' ? '' : p + '*') + 'pi*' + v + (d === '1' ? '' : '/' + d), w2tex: T.coef(c2, '\\pi^{2}'), w2pl: (c2.eq(1) ? '' : c2.toPlain() + '*') + 'pi^2', w2: c2.toNumber() * Math.PI * Math.PI };
  }
  var BVT = { D: ['y(0) = 0', 'y(L) = 0', 'sin', 'full'], N: ["y'(0) = 0", "y'(L) = 0", 'cos', 'full'], M1: ['y(0) = 0', "y'(L) = 0", 'sin', 'half'], M2: ["y'(0) = 0", 'y(L) = 0', 'cos', 'half'] };
  G('de.boundary-value-problems', function (R, ctx) {
    var kind = pickKind(R, ctx, ['eigD'], ['smallest', 'zero', 'efun'], ['efun', 'count', 'smallest']);
    var L = R.pick(['pi', 1, 2, 3]), Lt = Ltex(L), type = kind === 'eigD' ? 'D' : R.pick(['D', 'N', 'M1', 'M2']), bt = BVT[type];
    var bcT = '$' + bt[0] + '$ and $' + bt[1].replace('L', Lt) + '$';
    var setup = "$y'' + \\lambda y = 0$, " + bcT;
    var caseSteps = ['$\\lambda < 0$: solutions are $c_1\\cosh(\\mu x) + c_2\\sinh(\\mu x)$ with $\\mu = \\sqrt{-\\lambda}$; these boundary conditions force $c_1 = c_2 = 0$, so there are no negative eigenvalues.',
      '$\\lambda = 0$: $y = c_1 + c_2x$; ' + (type === 'N' ? 'the conditions only force $c_2 = 0$, so $y = 1$ works: $\\lambda = 0$ IS an eigenvalue.' : 'the conditions force $y = 0$, so 0 is not an eigenvalue.'),
      '$\\lambda > 0$: $y = c_1\\cos\\sqrt{\\lambda}x + c_2\\sin\\sqrt{\\lambda}x$; ' + (bt[2] === 'sin' ? 'the condition at 0 kills the cosine' : 'the condition at 0 kills the sine') + ', and the condition at $x = ' + Lt + '$ needs ' + (bt[3] === 'full' ? '$\\sqrt{\\lambda}\\,' + Lt + ' = n\\pi$' : '$\\sqrt{\\lambda}\\,' + Lt + ' = (n - \\frac{1}{2})\\pi$') + '.'];
    var mOf = function (n) { return bt[3] === 'full' ? q(n) : q(2 * n - 1, 2); };
    if (kind === 'eigD' || kind === 'smallest') {
      var n = kind === 'eigD' ? R.int(1, 4) : (type === 'N' ? 0 : 1), arg = omegaArg(mOf(n), L);
      var val = type === 'N' && n === 0 ? { pl: '0', tex: '0', v: 0 } : { pl: arg.w2pl, tex: arg.w2tex, v: arg.w2 };
      chk({ topic: 'de.boundary-value-problems', kind: 'eig', type: type, L: Lnum(L), n: n, ans: val.v });
      return { q: kind === 'eigD' ? 'Find eigenvalue number ' + n + ' (counting from the smallest) of ' + setup + '.' : 'Find the smallest eigenvalue of ' + setup + '.', a: num(val.pl, { tol: 0.01 }),
        steps: caseSteps.concat([type === 'N' && n === 0 ? 'The smallest is $\\lambda_0 = 0$ (eigenfunction $y = 1$).' : 'So $\\sqrt{\\lambda} = ' + (L === 'pi' ? mOf(n).toTex() : T.coef(mOf(n).div(L), '\\pi')) + '$ and $\\lambda = ' + val.tex + (L === 'pi' ? '' : ' \\approx ' + val.v.toFixed(3)) + '$.']),
        hint: 'Check $\\lambda < 0$, $\\lambda = 0$ and $\\lambda > 0$ separately.' };
    }
    if (kind === 'zero') {
      var truth = type === 'N';
      return { q: 'True or false: $\\lambda = 0$ is an eigenvalue of ' + setup + '.', a: tf(truth), steps: [caseSteps[1], truth ? 'True: the constant function is a nonzero solution.' : 'False: only $y = 0$ works.'], hint: 'With $\\lambda = 0$ the equation is $y\'\' = 0$: try $y = c_1 + c_2x$.' };
    }
    if (kind === 'efun') {
      var n2 = R.int(1, 3), arg2 = omegaArg(mOf(n2), L), ans = bt[2] + '(' + arg2.pl + ')';
      chk({ topic: 'de.boundary-value-problems', kind: 'efun', type: type, L: Lnum(L), ans: ans, lam: arg2.w2 });
      return { q: 'Find the eigenfunction (with leading coefficient 1) for the eigenvalue $\\lambda = ' + arg2.w2tex + '$ of ' + setup + '.', a: ex(ans, ['x']),
        steps: ['$\\sqrt{\\lambda} = ' + (L === 'pi' ? mOf(n2).toTex() : T.coef(mOf(n2).div(L), '\\pi')) + '$, so $y = c_1\\cos\\sqrt{\\lambda}x + c_2\\sin\\sqrt{\\lambda}x$ with that frequency.', (bt[2] === 'sin' ? 'The condition at $x = 0$ gives $c_1 = 0$' : 'The condition at $x = 0$ gives $c_2 = 0$') + '; the condition at $x = ' + Lt + '$ holds because of the value of $\\lambda$.', 'Eigenfunction: $\\' + bt[2] + (/frac/.test(arg2.tex) ? arg2.tex : ' ' + arg2.tex) + '$.'],
        hint: 'Which of $\\cos$ and $\\sin$ survives the condition at $x = 0$?' };
    }
    // number of solutions of a nonhomogeneous BVP: y'' + w^2 y = 0, y(0) = A, y(b) = B
    var w = R.int(1, 3), bb = R.pick(['half', 'full', 'two']), A = R.nz(-3, 3), bx = bb === 'half' ? q(1, 2 * w) : bb === 'full' ? q(1, w) : q(2, w);
    var Bv = bb === 'half' ? R.nz(-3, 3) : R.chance(0.5) ? (bb === 'full' ? -A : A) : R.intNot(-3, 3, [bb === 'full' ? -A : A]);
    var at = bb === 'full' ? -A : A, ans2 = bb === 'half' ? 'exactly one' : Bv === at ? 'infinitely many' : 'none';
    var bT = T.coef(bx, '\\pi');
    chk({ topic: 'de.boundary-value-problems', kind: 'count', w: w, b: bx.toNumber() * Math.PI, A: A, B: Bv, ans: ans2 });
    return { q: "How many solutions does $y'' + " + (w * w === 1 ? '' : w * w) + 'y = 0$, $y(0) = ' + A + '$, $y(' + bT + ') = ' + Bv + '$ have?', a: mc(R, ans2, ['exactly one', 'none', 'infinitely many'].filter(function (z) { return z !== ans2; })),
      steps: ['$y = c_1\\cos ' + kv(w, 'x') + ' + c_2\\sin ' + kv(w, 'x') + '$, and $y(0) = ' + A + '$ gives $c_1 = ' + A + '$.', 'At $x = ' + bT + '$: $\\cos(' + w + '\\cdot ' + bT + ') = ' + (bb === 'half' ? '0' : bb === 'full' ? '-1' : '1') + '$ and $\\sin(' + w + '\\cdot ' + bT + ') = ' + (bb === 'half' ? '1' : '0') + '$.',
        bb === 'half' ? 'So $y(' + bT + ') = c_2 = ' + Bv + '$: one choice of $c_2$, exactly one solution.' : 'So $y(' + bT + ') = ' + at + '$ no matter what $c_2$ is. ' + (Bv === at ? 'That matches, so every $c_2$ works: infinitely many solutions.' : 'It must equal $' + Bv + '$, which is impossible: no solution.')],
      hint: 'Fit $y(0)$ first, then see whether the second condition involves $c_2$ at all.' };
  });

  G('de.fourier-series', function (R, ctx) {
    var kind = pickKind(R, ctx, ['const', 'bsq'], ['coef', 'coef', 'const'], ['coef', 'mixed']);
    var L = R.pick([1, 2, 3, 4]), c = R.nz(-3, 4), F;
    if (kind === 'const') F = R.pick([FF[2], FF[3], FF[4], FF[5]]); else if (kind === 'bsq') F = R.pick([FF[0], FF[4]]); else if (kind === 'mixed') F = R.pick([FF[5], FF[4]]); else F = R.pick(FF);
    var fT = F.tex(c).replace(/L/g, L), fP = F.pl(c), nx = L === 1 ? ' n\\pi x' : '\\frac{n\\pi x}{' + L + '}', setup = 'Let $f(x) = ' + fT + '$ on $(-' + L + ', ' + L + ')$, extended to have period $' + 2 * L + '$, with Fourier series $\\frac{a_0}{2} + \\sum_{n=1}^{\\infty}\\left(a_n\\cos' + nx + ' + b_n\\sin' + nx + '\\right)$.';
    var formulas = 'Here $L = ' + L + '$: $a_n = \\frac{1}{' + L + '}\\int_{-' + L + '}^{' + L + '} f(x)\\cos\\frac{n\\pi x}{' + L + '}\\,dx$ and $b_n = \\frac{1}{' + L + '}\\int_{-' + L + '}^{' + L + '} f(x)\\sin\\frac{n\\pi x}{' + L + '}\\,dx$ (divide by $L$, the half-period).';
    if (kind === 'const') {
      var a0 = F.a0(c, L)[0];
      chk({ topic: 'de.fourier-series', kind: 'coef', f: fP, L: L, which: 'avg', n: 0, ans: a0.toNumber() });
      return { q: setup + ' Find the constant term $\\frac{a_0}{2}$.', a: num(a0.toPlain()),
        steps: ['The constant term is the average value of $f$ over one period: $\\frac{a_0}{2} = \\frac{1}{2L}\\int_{-L}^{L} f(x)\\,dx$ with $L = ' + L + '$.', 'Compute the integral over $(-' + L + ', ' + L + ')$ (the area under one period) and divide by the period $' + 2 * L + '$.', '$\\frac{a_0}{2} = ' + a0.toTex() + '$.'], hint: 'The constant term is the average of $f$ over one period.' };
    }
    var which = kind === 'bsq' ? 'b' : F.even ? 'a' : F.odd ? 'b' : R.pick(['a', 'b']), n = R.int(1, 4);
    if (which === 'a' && F.an(c, n, L)[0].isZero() && R.chance(0.7)) n = 2 * R.int(0, 1) + 1;
    if (which === 'b' && F.bn(c, n, L)[0].isZero() && R.chance(0.7)) n = 2 * R.int(0, 1) + 1;
    var co = which === 'a' ? F.an(c, n, L) : F.bn(c, n, L), val = piVal(co[0], co[1]);
    chk({ topic: 'de.fourier-series', kind: 'coef', f: fP, L: L, which: which, n: n, ans: co[0].toNumber() / Math.pow(Math.PI, co[1]) });
    var sym = F.even && which === 'b' ? ['$f$ is even, so $f(x)\\sin\\frac{n\\pi x}{L}$ is odd and $b_n = 0$.'] : F.odd && which === 'a' ? ['$f$ is odd, so every $a_n = 0$.'] : F.even ? ['$f$ is even, so $a_n = \\frac{2}{L}\\int_0^{L} f(x)\\cos\\frac{n\\pi x}{L}\\,dx$.'] : F.odd ? ['$f$ is odd, so $b_n = \\frac{2}{L}\\int_0^{L} f(x)\\sin\\frac{n\\pi x}{L}\\,dx$.'] : ['$f$ is 0 on $(-' + L + ', 0)$, so only $\\int_0^{' + L + '}$ contributes.'];
    var gen = { sq: 'b_n = \\frac{2C(1 - (-1)^{n})}{n\\pi}', x: 'b_n = \\frac{2L(-1)^{n+1}}{n\\pi}', abs: 'a_n = \\frac{2L((-1)^{n} - 1)}{n^{2}\\pi^{2}}', x2: 'a_n = \\frac{4L^{2}(-1)^{n}}{n^{2}\\pi^{2}}', half: which === 'a' ? 'a_n = 0' : 'b_n = \\frac{C(1 - (-1)^{n})}{n\\pi}', ramp: which === 'a' ? 'a_n = \\frac{L((-1)^{n} - 1)}{n^{2}\\pi^{2}}' : 'b_n = \\frac{L(-1)^{n+1}}{n\\pi}' }[F.name];
    if (F.name === 'sq' || F.name === 'half') gen = gen.replace('2C', c === 1 ? '2' : c === -1 ? '-2' : String(2 * c)).replace('C(', c === 1 ? '(' : c === -1 ? '-(' : c + '(');
    return { q: setup + ' Find $' + which + '_' + n + '$.', a: num(val.pl, { tol: 0.0005 }),
      steps: [formulas].concat(sym, ['Integrating (by parts where there is an $x$) gives ' + (F.name === 'sq' || F.name === 'half' ? '$' + gen + '$' : 'the general formula $' + gen + '$ with $L = ' + L + '$') + '.', 'For $n = ' + n + '$: $' + which + '_' + n + ' = ' + val.tex + (co[1] ? ' \\approx ' + (co[0].toNumber() / Math.pow(Math.PI, co[1])).toFixed(4) : '') + '$.']),
      hint: 'Use $\\frac{1}{L}\\int_{-L}^{L}$ with $L = ' + L + '$ (half the period), and use symmetry when you can.' };
  });

  // ---------- de.sine-cosine-series ----------
  var HR = [ // functions on (0, L): value at x, sine b_n, cosine (a0/2, a_n)
    { tex: function (c) { return String(c); }, pl: function (c) { return String(c); }, at: function (c, x) { return q(c); }, b: function (c, n, L) { return [n % 2 ? q(4 * c, n) : q(0), 1]; }, a0: function (c) { return q(c); }, a: function () { return [q(0), 0]; } },
    { tex: function () { return 'x'; }, pl: function () { return 'x'; }, at: function (c, x) { return q(x); }, b: function (c, n, L) { return [q(2 * L * (n % 2 ? 1 : -1), n), 1]; }, a0: function (c, L) { return q(L, 2); }, a: function (c, n, L) { return [n % 2 ? q(-4 * L, n * n) : q(0), 2]; } },
    { tex: function (c, L) { return L + ' - x'; }, pl: function (c, L) { return L + ' - x'; }, at: function (c, x, L) { return q(L).sub(x); }, b: function (c, n, L) { return [q(2 * L, n), 1]; }, a0: function (c, L) { return q(L, 2); }, a: function (c, n, L) { return [n % 2 ? q(4 * L, n * n) : q(0), 2]; } }
  ];
  G('de.sine-cosine-series', function (R, ctx) {
    var kind = pickKind(R, ctx, ['conv'], ['sine', 'conv', 'cosine'], ['cosine', 'sine', 'conv']);
    var L = R.pick([1, 2, 3, 4]), c = R.nz(-3, 4), F = R.pick(HR), fT = F.tex(c, L), fP = F.pl(c, L);
    if (kind === 'conv') {
      var type = R.pick(['sine', 'cosine']), pt = R.pick(['0', 'L', 'mid', '-mid', '3mid']), x, val, why;
      var half = q(L, 2);
      if (pt === '0') { x = q(0); val = type === 'sine' ? q(0) : F.at(c, 0, L); why = type === 'sine' ? 'The odd extension jumps from $-f(0^{+})$ to $f(0^{+})$ at 0 (or is continuous through 0), and the series gives the average, 0.' : 'The even extension is continuous at 0, so the series gives $f(0^{+}) = ' + F.at(c, 0, L).toTex() + '$.'; }
      else if (pt === 'L') { x = q(L); val = type === 'sine' ? q(0) : F.at(c, L, L); why = type === 'sine' ? 'At $x = L$ the odd extension jumps from $f(L^{-})$ to $-f(L^{-})$; the average is 0.' : 'The even extension is continuous at $x = L$, so the series gives $f(L^{-}) = ' + F.at(c, L, L).toTex() + '$.'; }
      else if (pt === 'mid') { x = half; val = F.at(c, half, L); why = '$f$ is continuous at $x = ' + half.toTex() + '$, so the series equals $f(' + half.toTex() + ') = ' + val.toTex() + '$.'; }
      else if (pt === '-mid') { x = half.neg(); val = type === 'sine' ? F.at(c, half, L).neg() : F.at(c, half, L); why = 'At $x = ' + half.neg().toTex() + '$ the series follows the ' + (type === 'sine' ? 'odd' : 'even') + ' extension: ' + (type === 'sine' ? '$-f(' + half.toTex() + ')$' : '$f(' + half.toTex() + ')$') + ' $= ' + val.toTex() + '$.'; }
      else { x = half.mul(3); var y = half.neg(); val = type === 'sine' ? F.at(c, half, L).neg() : F.at(c, half, L); why = 'The extension has period $' + 2 * L + '$, so $x = ' + x.toTex() + '$ behaves like $x = ' + x.toTex() + ' - ' + 2 * L + ' = ' + y.toTex() + '$, where the ' + (type === 'sine' ? 'odd' : 'even') + ' extension equals $' + val.toTex() + '$.'; }
      chk({ topic: 'de.sine-cosine-series', kind: 'conv', type: type, f: fP, L: L, x: x.toNumber(), ans: val.toNumber() });
      return { q: 'Let $f(x) = ' + fT + '$ on $(0, ' + L + ')$. To what value does its Fourier ' + type + ' series converge at $x = ' + x.toTex() + '$?', a: num(val.toPlain()),
        steps: ['The ' + type + ' series is the full Fourier series of the ' + (type === 'sine' ? 'odd' : 'even') + ' extension of $f$ to $(-' + L + ', ' + L + ')$, repeated with period $' + 2 * L + '$.', 'At a point where that extension is continuous, the series converges to its value; at a jump, to the average of the two one-sided limits.', why, 'Value: $' + val.toTex() + '$.'],
        hint: 'Sketch the ' + (type === 'sine' ? 'odd' : 'even') + ' periodic extension first. At a jump, take the midpoint.' };
    }
    var n = R.int(1, 4);
    if (kind === 'sine') {
      var b = F.b(c, n, L); if (b[0].isZero() && R.chance(0.7)) { n = 1; b = F.b(c, n, L); }
      var vb = piVal(b[0], b[1]);
      chk({ topic: 'de.sine-cosine-series', kind: 'coef', type: 'sine', f: fP, L: L, n: n, ans: b[0].toNumber() / Math.pow(Math.PI, b[1]) });
      return { q: 'Find the coefficient $b_' + n + '$ in the Fourier sine series $\\sum b_n\\sin\\frac{n\\pi x}{' + L + '}$ of $f(x) = ' + fT + '$ on $(0, ' + L + ')$.', a: num(vb.pl, { tol: 0.0005 }),
        steps: ['Half-range sine coefficients: $b_n = \\frac{2}{L}\\int_0^{L} f(x)\\sin\\frac{n\\pi x}{L}\\,dx$ with $L = ' + L + '$.', 'Evaluate the integral (by parts if $f$ has an $x$), using $\\cos n\\pi = (-1)^{n}$.', '$b_' + n + ' = ' + vb.tex + (b[1] ? ' \\approx ' + (b[0].toNumber() / Math.pow(Math.PI, b[1])).toFixed(4) : '') + '$.'],
        hint: 'Use $\\frac{2}{L}\\int_0^L$ for half-range series.' };
    }
    var useA0 = R.chance(0.35), a = F.a(c, n, L);
    if (!useA0 && a[0].isZero()) { if (F === HR[0]) useA0 = true; else { n = 1; a = F.a(c, n, L); } }
    var va = useA0 ? { tex: F.a0(c, L).toTex(), pl: F.a0(c, L).toPlain() } : piVal(a[0], a[1]);
    chk({ topic: 'de.sine-cosine-series', kind: 'coef', type: 'cosine', f: fP, L: L, n: useA0 ? 0 : n, ans: useA0 ? F.a0(c, L).toNumber() : a[0].toNumber() / Math.pow(Math.PI, a[1]) });
    return { q: 'Find ' + (useA0 ? 'the constant term $\\frac{a_0}{2}$' : 'the coefficient $a_' + n + '$') + ' in the Fourier cosine series $\\frac{a_0}{2} + \\sum a_n\\cos\\frac{n\\pi x}{' + L + '}$ of $f(x) = ' + fT + '$ on $(0, ' + L + ')$.', a: num(va.pl, { tol: 0.0005 }),
      steps: useA0 ? ['The constant term is the average of $f$ on $(0, ' + L + ')$: $\\frac{a_0}{2} = \\frac{1}{L}\\int_0^{L} f(x)\\,dx$.', '$\\frac{a_0}{2} = ' + va.tex + '$.'] : ['Half-range cosine coefficients: $a_n = \\frac{2}{L}\\int_0^{L} f(x)\\cos\\frac{n\\pi x}{L}\\,dx$ with $L = ' + L + '$.', 'Evaluate the integral (by parts if $f$ has an $x$), using $\\cos n\\pi = (-1)^{n}$ and $\\sin n\\pi = 0$.', '$a_' + n + ' = ' + va.tex + (a[1] ? ' \\approx ' + (a[0].toNumber() / Math.pow(Math.PI, a[1])).toFixed(4) : '') + '$.'],
      hint: 'Use $\\frac{2}{L}\\int_0^L f(x)\\cos\\frac{n\\pi x}{L}\\,dx$.' };
  });

  // ---------- de.separation-of-variables ----------
  G('de.separation-of-variables', function (R, ctx) {
    var kind = pickKind(R, ctx, ['prod'], ['odes', 'prod', 'rate'], ['rate', 'prodsol', 'odes']);
    if (kind === 'prod') {
      var which = R.pick(['heat', 'wave', 'lap']), b = R.int(1, 4), k = R.pick([1, 2, 3, 5]), c2 = R.pick([1, 2, 3]), ans, qT, st;
      if (which === 'heat') { ans = -k * b * b; qT = 'For which $a$ is $u = e^{at}\\sin ' + kv(b, 'x') + '$ a solution of $u_t = ' + (k === 1 ? '' : k) + 'u_{xx}$?'; st = ['$u_t = ae^{at}\\sin ' + kv(b, 'x') + '$ and $u_{xx} = -' + (b * b === 1 ? '' : b * b) + 'e^{at}\\sin ' + kv(b, 'x') + '$.', 'So $a = ' + (k === 1 ? '' : k + '\\cdot') + '(-' + b * b + ') = ' + ans + '$.']; }
      else if (which === 'wave') { ans = c2 * b; qT = 'For which $\\omega > 0$ is $u = \\sin ' + kv(b, 'x') + '\\cos \\omega t$ a solution of $u_{tt} = ' + (c2 * c2 === 1 ? '' : c2 * c2) + 'u_{xx}$?'; st = ['$u_{tt} = -\\omega^{2}u$ and $u_{xx} = ' + T.mono(-b * b, 'u') + '$.', '$-\\omega^{2} = ' + c2 * c2 + '(-' + b * b + ')$, so $\\omega = ' + ans + '$.']; }
      else { ans = b; qT = 'For which $\\beta > 0$ is $u = \\sin ' + kv(b, 'x') + '\\sinh \\beta y$ a solution of Laplace\'s equation $u_{xx} + u_{yy} = 0$?'; st = ['$u_{xx} = ' + T.mono(-b * b, 'u') + '$ and $u_{yy} = \\beta^{2}u$.', '$-' + b * b + ' + \\beta^{2} = 0$, so $\\beta = ' + b + '$.']; }
      chk({ topic: 'de.separation-of-variables', kind: 'prod', which: which, b: b, k: k, c: c2, ans: ans });
      return { q: qT, a: num(ans), steps: st, hint: 'Differentiate the product and compare both sides; the trig or exponential factors cancel.' };
    }
    if (kind === 'odes') {
      var eqs = [['u_t = ku_{xx}', "X'' + \\lambda X = 0,\\ T' + k\\lambda T = 0", ["X'' + \\lambda X = 0,\\ T' + \\lambda T = 0", "X'' + \\lambda X = 0,\\ T'' + k\\lambda T = 0", "X' + \\lambda X = 0,\\ T' + k\\lambda T = 0"], 'Substitute $u = X(x)T(t)$: $XT\' = kX\'\'T$. Divide by $kXT$: $\\frac{T\'}{kT} = \\frac{X\'\'}{X} = -\\lambda$.'],
        ['u_{tt} = c^{2}u_{xx}', "X'' + \\lambda X = 0,\\ T'' + c^{2}\\lambda T = 0", ["X'' + \\lambda X = 0,\\ T' + c^{2}\\lambda T = 0", "X'' - \\lambda X = 0,\\ T'' + c^{2}\\lambda T = 0", "X'' + \\lambda X = 0,\\ T'' + \\lambda T = 0"], 'Substitute $u = XT$: $XT\'\' = c^{2}X\'\'T$, so $\\frac{T\'\'}{c^{2}T} = \\frac{X\'\'}{X} = -\\lambda$.'],
        ['u_{xx} + u_{yy} = 0', "X'' + \\lambda X = 0,\\ Y'' - \\lambda Y = 0", ["X'' + \\lambda X = 0,\\ Y'' + \\lambda Y = 0", "X'' - \\lambda X = 0,\\ Y'' - \\lambda Y = 0", "X' + \\lambda X = 0,\\ Y' - \\lambda Y = 0"], 'Substitute $u = X(x)Y(y)$: $X\'\'Y + XY\'\' = 0$, so $\\frac{X\'\'}{X} = -\\frac{Y\'\'}{Y} = -\\lambda$.'],
        ['u_t = ku_{xx} - hu', "X'' + \\lambda X = 0,\\ T' + (k\\lambda + h)T = 0", ["X'' + \\lambda X = 0,\\ T' + k\\lambda T = 0", "X'' + (\\lambda + h)X = 0,\\ T' + k\\lambda T = 0", "X'' + \\lambda X = 0,\\ T' + (k\\lambda - h)T = 0"], 'Substitute $u = XT$: $XT\' = kX\'\'T - hXT$. Divide by $kXT$: $\\frac{T\' + hT}{kT} = \\frac{X\'\'}{X} = -\\lambda$.']];
      var e = R.pick(eqs);
      return { q: 'Separating variables in $' + e[0] + '$ with the constant $-\\lambda$ gives which pair of ODEs?', a: mc(R, '$' + e[1] + '$', e[2].map(function (z) { return '$' + z + '$'; })),
        steps: [e[3], 'A function of one variable can equal a function of another only if both are the same constant, called $-\\lambda$.', 'So $' + e[1] + '$.'], hint: 'Substitute the product, divide by it, and put each variable on its own side.' };
    }
    var Lr = R.pick(['pi', 1, 2]), kk = R.pick([1, 2, 3, q(1, 2)]), n = R.int(1, 3);
    var rate = Lr === 'pi' ? q(kk).mul(n * n) : q(kk).mul(n * n).div(Lr * Lr), ratePi = Lr === 'pi' ? 0 : 2;
    if (kind === 'rate') {
      var rv = piVal(rate, 0), rT = ratePi ? T.coef(rate, '\\pi^{2}') : rate.toTex(), rP = ratePi ? rate.toPlain() + '*pi^2' : rate.toPlain();
      chk({ topic: 'de.separation-of-variables', kind: 'rate', k: q(kk).toNumber(), L: Lnum(Lr), n: n, ans: +ML.evalPlain(rP) });
      return { q: 'For $u_t = ' + (q(kk).eq(1) ? '' : q(kk).toTex()) + 'u_{xx}$ on $0 < x < ' + Ltex(Lr) + '$ with $u = 0$ at both ends, the product solution with $X = \\sin ' + modeArg(n, Lr) + '$ has $T(t) = e^{-rt}$. Find $r$.', a: num(rP, { tol: 0.005 }),
        steps: ['$X\'\' + \\lambda X = 0$ with $X(0) = X(' + Ltex(Lr) + ') = 0$ gives $\\lambda_n = \\left(\\frac{n\\pi}{' + Ltex(Lr) + '}\\right)^{2}$; here $n = ' + n + '$, so $\\lambda = ' + (Lr === 'pi' ? n * n : T.coef(q(n * n, Lr * Lr), '\\pi^{2}')) + '$.', '$T\' + k\\lambda T = 0$ gives $T = e^{-k\\lambda t}$, so $r = k\\lambda = ' + rT + (ratePi ? ' \\approx ' + (+ML.evalPlain(rP)).toFixed(3) : '') + '$.'],
        hint: 'Find $\\lambda$ from the boundary conditions, then $r = k\\lambda$.' };
    }
    var Lp = 'pi', ex1 = q(kk).mul(n * n), sol = lc([tm(1, B.raw('e^{' + T.coef(ex1.neg(), 't') + '}\\sin ' + kv(n, 'x'), 'e^(' + ex1.neg().toPlain() + 't) sin(' + n + 'x)'))]);
    chk({ topic: 'de.separation-of-variables', kind: 'pde', pde: 'heat', k: q(kk).toNumber(), L: Math.PI, ans: sol.pl, f: 'sin(' + n + 'x)' });
    return { q: 'Find the product solution $u = X(x)T(t)$ of $u_t = ' + (q(kk).eq(1) ? '' : q(kk).toTex()) + 'u_{xx}$, $0 < x < \\pi$, with $u(0, t) = u(\\pi, t) = 0$ and $u(x, 0) = \\sin ' + kv(n, 'x') + '$.', a: ex(sol.pl, ['x', 't']),
      steps: ['Separation gives $X\'\' + \\lambda X = 0$ and $T\' + ' + (q(kk).eq(1) ? '' : q(kk).toTex()) + '\\lambda T = 0$.', 'The boundary conditions force $X = \\sin nx$ with $\\lambda = n^{2}$; the initial shape picks $n = ' + n + '$.', '$T = e^{' + T.mono(ex1.neg(), 't') + '}$ (with $T(0) = 1$), so $u = ' + sol.tex + '$.'],
      hint: 'The initial shape is already an eigenfunction; attach its decaying time factor.' };
  });

  // ---------- de.heat-equation ----------
  function sinT(n, v) { return '\\sin ' + kv(n, v || 'x'); }
  G('de.heat-equation', function (R, ctx) {
    var kind = pickKind(R, ctx, ['one'], ['two', 'value', 'one'], ['steady', 'insul', 'two']);
    var k = R.pick([1, 2, 3, 4]), kT = k === 1 ? '' : String(k), pde = 'u_t = ' + kT + 'u_{xx}';
    if (kind === 'one' || kind === 'two' || kind === 'value') {
      var ns = kind === 'one' ? [R.int(1, 4)] : R.ints(2, 1, 4, true).sort(), bs = ns.map(function () { return R.nz(-5, 6); });
      var f = lc(ns.map(function (n, i) { return tm(bs[i], B.raw(sinT(n), 'sin(' + n + 'x)')); }));
      var sol = lc(ns.map(function (n, i) { return tm(bs[i], B.raw('e^{' + T.mono(-k * n * n, 't') + '}' + sinT(n), 'e^(' + (-k * n * n) + 't) sin(' + n + 'x)')); }));
      chk({ topic: 'de.heat-equation', kind: 'pde', pde: 'heat', k: k, L: Math.PI, ans: sol.pl, f: f.pl });
      var st = ['Separation of variables gives the product solutions $e^{-' + kT + 'n^{2}t}\\sin nx$, which vanish at $x = 0$ and $x = \\pi$.', 'Superpose: $u = \\sum b_ne^{-' + kT + 'n^{2}t}\\sin nx$, and $u(x, 0) = \\sum b_n\\sin nx$ must match the initial temperature.', 'The initial temperature is already a sine series: ' + ns.map(function (n, i) { return '$b_' + n + ' = ' + bs[i] + '$'; }).join(', ') + ', all other $b_n = 0$.', 'So $u = ' + sol.tex + '$.'];
      var setup = 'Solve $' + pde + '$ for $0 < x < \\pi$, $t > 0$, with $u(0, t) = u(\\pi, t) = 0$ and $u(x, 0) = ' + f.tex + '$.';
      if (kind !== 'value') return { q: setup, a: ex(sol.pl, ['x', 't']), steps: st, hint: 'Each $\\sin nx$ in the initial data decays like $e^{-kn^2t}$.' };
      var val = q(0); ns.forEach(function (n, i) { var s = n % 2 ? (n % 4 === 1 ? 1 : -1) : 0; val = val.add(q(bs[i] * s, Math.pow(2, k * n * n))); });
      if (val.isZero()) { ns = [1]; }
      chk({ topic: 'de.heat-equation', kind: 'value', expr: sol.pl, x: Math.PI / 2, t: Math.log(2), ans: val.toNumber() });
      return { q: 'Let $u$ solve $' + pde + '$, $0 < x < \\pi$, with $u(0, t) = u(\\pi, t) = 0$ and $u(x, 0) = ' + f.tex + '$. Find $u\\left(\\frac{\\pi}{2}, \\ln 2\\right)$.', a: num(val.toPlain()),
        steps: st.concat(['At $x = \\frac{\\pi}{2}$, $\\sin\\frac{n\\pi}{2}$ is $1, 0, -1, 0, \\dots$; at $t = \\ln 2$, $e^{-' + kT + 'n^{2}\\ln 2} = 2^{-' + kT + 'n^{2}}$.', 'So $u = ' + val.toTex() + '$.']), hint: 'Write the solution first, then substitute; $e^{-c\\ln 2} = 2^{-c}$.' };
    }
    if (kind === 'steady') {
      var Lr = R.pick([1, 2, 5, 10]), T1 = R.int(0, 50), T2 = R.intNot(0, 100, [T1]), st2 = lc([tm(T1), tm(q(T2 - T1, Lr), B.pow(1, 'x'))]);
      chk({ topic: 'de.heat-equation', kind: 'steady', L: Lr, T1: T1, T2: T2, ans: st2.pl });
      return { q: 'A rod $0 \\le x \\le ' + Lr + '$ obeys $' + pde + '$ with its ends held at $u(0, t) = ' + T1 + '$ and $u(' + Lr + ', t) = ' + T2 + '$. Find the steady-state temperature $v(x) = \\lim_{t \\to \\infty} u(x, t)$.', a: ex(st2.pl, ['x']),
        steps: ['In the steady state $u_t = 0$, so $v\'\' = 0$ and $v$ is linear: $v = A + Bx$.', '$v(0) = ' + T1 + '$ gives $A = ' + T1 + '$; $v(' + Lr + ') = ' + T2 + '$ gives $B = \\frac{' + (T2 - T1) + '}{' + Lr + '}$.', '$v(x) = ' + st2.tex + '$. (The rest of the solution, $u - v$, has zero boundary values and decays like a sine series.)'],
        hint: 'Set $u_t = 0$: the steady temperature is a straight line between the end temperatures.' };
    }
    // insulated ends: u_x = 0 at 0 and pi; u(x,0) = A + B cos(nx)
    var A = R.int(10, 60), Bc = R.nz(-9, 9), n = R.int(1, 3), askLim = R.coin();
    var solI = lc([tm(A), tm(Bc, B.raw('e^{' + T.mono(-k * n * n, 't') + '}\\cos ' + kv(n, 'x'), 'e^(' + (-k * n * n) + 't) cos(' + n + 'x)'))]);
    chk({ topic: 'de.heat-equation', kind: 'pde', pde: 'heat', k: k, L: Math.PI, ans: solI.pl, f: A + ' + (' + Bc + ')*cos(' + n + 'x)', neumann: true });
    var stI = ['With insulated ends, $X\'(0) = X\'(\\pi) = 0$, so the eigenfunctions are $\\cos nx$ ($n = 0, 1, 2, \\dots$), including the constant $n = 0$.', '$u = a_0/2 + \\sum a_ne^{-' + kT + 'n^{2}t}\\cos nx$; the initial data gives the constant ' + A + ' and $a_' + n + ' = ' + Bc + '$.', '$u = ' + solI.tex + '$.'];
    if (askLim) return { q: 'A rod $0 \\le x \\le \\pi$ with insulated ends ($u_x(0, t) = u_x(\\pi, t) = 0$) obeys $' + pde + '$ with $u(x, 0) = ' + A + T.coef(Bc, '\\cos ' + kv(n, 'x'), false) + '$. What temperature does the whole rod approach as $t \\to \\infty$?', a: num(A),
      steps: stI.concat(['As $t \\to \\infty$ the cosine term dies out and $u \\to ' + A + '$: no heat escapes, so the rod settles at the average of its initial temperature.']), hint: 'Insulated ends keep the total heat. What is the average initial temperature?' };
    return { q: 'Solve $' + pde + '$, $0 < x < \\pi$, with insulated ends $u_x(0, t) = u_x(\\pi, t) = 0$ and $u(x, 0) = ' + A + T.coef(Bc, '\\cos ' + kv(n, 'x'), false) + '$.', a: ex(solI.pl, ['x', 't']), steps: stI, hint: 'Insulated ends give cosine eigenfunctions, including a constant term that never decays.' };
  });

  // ---------- de.wave-equation ----------
  G('de.wave-equation', function (R, ctx) {
    var kind = pickKind(R, ctx, ['period'], ['shape', 'shape', 'period'], ['vel', 'both']);
    var c = R.pick([1, 2, 3]), c2 = c * c, pde = 'u_{tt} = ' + (c2 === 1 ? '' : c2) + 'u_{xx}';
    if (kind === 'period') {
      var Lr = R.pick([1, 2, 'pi']), n = R.int(1, 3), per = Lr === 'pi' ? q(2, n * c) : q(2 * Lr, n * c), perPl = Lr === 'pi' ? per.toPlain() + '*pi' : per.toPlain();
      chk({ topic: 'de.wave-equation', kind: 'period', c: c, L: Lnum(Lr), n: n, ans: +ML.evalPlain(perPl) });
      return { q: 'A string of length ' + (Lr === 'pi' ? '$\\pi$' : Lr) + ' with fixed ends obeys $' + pde + '$. What is the period of its mode $n = ' + n + '$ (shape $\\sin ' + modeArg(n, Lr) + '$)?', a: num(perPl, { tol: 0.001 }),
        steps: ['The mode $\\sin\\frac{n\\pi x}{L}$ oscillates in time like $\\cos\\frac{n\\pi c t}{L}$ (angular frequency $\\frac{n\\pi c}{L}$).', 'Period $= \\frac{2\\pi}{n\\pi c/L} = \\frac{2L}{nc} = \\frac{2\\cdot ' + Ltex(Lr) + '}{' + n + '\\cdot ' + c + '} = ' + (Lr === 'pi' ? T.coef(per, '\\pi') : per.toTex()) + '$.'],
        hint: 'Mode $n$ has angular frequency $n\\pi c/L$.' };
    }
    var n1 = R.int(1, 4), A = R.nz(-4, 5), Bv = R.nz(-4, 4), n2 = R.intNot(1, 4, [n1]);
    var f = kind === 'vel' ? { tex: '0', pl: '0' } : lc([tm(A, B.raw(sinT(n1), 'sin(' + n1 + 'x)'))]), gn = kind === 'both' ? n2 : n1;
    var g = kind === 'shape' ? { tex: '0', pl: '0' } : lc([tm(q(Bv).mul(gn * c), B.raw(sinT(gn), 'sin(' + gn + 'x)'))]);
    var terms = [];
    if (kind !== 'vel') terms.push(tm(A, B.raw(sinT(n1) + '\\cos ' + kv(n1 * c, 't'), 'sin(' + n1 + 'x) cos(' + n1 * c + 't)')));
    if (kind !== 'shape') terms.push(tm(Bv, B.raw(sinT(gn) + '\\sin ' + kv(gn * c, 't'), 'sin(' + gn + 'x) sin(' + gn * c + 't)')));
    var sol = lc(terms);
    chk({ topic: 'de.wave-equation', kind: 'pde', pde: 'wave', c: c, ans: sol.pl, f: f.pl, g: g.pl });
    return { q: 'Solve $' + pde + '$, $0 < x < \\pi$, with fixed ends $u(0, t) = u(\\pi, t) = 0$, initial shape $u(x, 0) = ' + f.tex + '$ and initial velocity $u_t(x, 0) = ' + g.tex + '$.', a: ex(sol.pl, ['x', 't']),
      steps: ['Separation gives $u = \\sum (A_n\\cos ' + (c === 1 ? '' : c) + 'nt + B_n\\sin ' + (c === 1 ? '' : c) + 'nt)\\sin nx$.', '$u(x, 0) = \\sum A_n\\sin nx$ must equal the initial shape: ' + (kind === 'vel' ? 'all $A_n = 0$.' : '$A_' + n1 + ' = ' + A + '$, the rest 0.'),
        '$u_t(x, 0) = \\sum ' + (c === 1 ? '' : c) + 'nB_n\\sin nx$ must equal the initial velocity: ' + (kind === 'shape' ? 'all $B_n = 0$.' : '$' + T.coef(c * gn, 'B_' + gn) + ' = ' + Bv * gn * c + '$, so $B_' + gn + ' = ' + Bv + '$.'), '$u = ' + sol.tex + '$.'],
      hint: 'Match the initial shape with the cosine-in-time terms and the initial velocity with the sine-in-time terms (remember the factor $cn$).' };
  });

  // ---------- de.laplace-equation ----------
  G('de.laplace-equation', function (R, ctx) {
    var kind = pickKind(R, ctx, ['harm', 'max'], ['top', 'top', 'harm'], ['two', 'side']);
    if (kind === 'harm') {
      var pool = [['x^{2} - y^{2}', 'x^2 - y^2', true], ['x^{2} + y^{2}', 'x^2 + y^2', false], ['e^{x}\\cos y', 'e^(x)cos(y)', true], ['xy', 'x*y', true], ['x^{3} - 3xy^{2}', 'x^3 - 3x*y^2', true], ['x^{3} - 3x^{2}y', 'x^3 - 3x^2*y', false], ['e^{x}\\sin x', 'e^(x)sin(x)', false], ['\\sin x\\cosh y', 'sin(x)cosh(y)', true], ['\\sin x\\sinh 2y', 'sin(x)sinh(2y)', false], ['e^{2x}\\sin 2y', 'e^(2x)sin(2y)', true]];
      var pk = R.pick(pool);
      chk({ topic: 'de.laplace-equation', kind: 'harm', u: pk[1], truth: pk[2] });
      return { q: 'True or false: $u = ' + pk[0] + '$ satisfies Laplace\'s equation $u_{xx} + u_{yy} = 0$.', a: tf(pk[2]), steps: ['Compute $u_{xx}$ and $u_{yy}$ and add them.', pk[2] ? 'They cancel for every $(x, y)$: harmonic. True.' : 'Their sum is not identically 0: not harmonic. False.'], hint: 'Differentiate twice in $x$, twice in $y$, and add.' };
    }
    if (kind === 'max') {
      var vals = R.ints(4, -5, 40, true);
      return { q: '$u$ is harmonic in the square $0 < x < 1$, $0 < y < 1$ and continuous up to its edges, where it takes values between ' + Math.min.apply(null, vals) + ' and ' + Math.max.apply(null, vals) + ' (both reached). What is the largest value $u$ can take anywhere in the closed square?', a: num(Math.max.apply(null, vals)),
        steps: ['Maximum principle: a harmonic function on a bounded region takes its maximum and minimum on the boundary.', '(Physically: a steady temperature cannot have a hot spot inside; heat would flow away from it.)', 'So the largest value is the largest boundary value, $' + Math.max.apply(null, vals) + '$.'], hint: 'Where does a harmonic function reach its maximum?' };
    }
    var bH = R.pick([1, 2, 3]), n1 = R.int(1, 3), A = R.nz(-4, 5), n2 = R.intNot(1, 3, [n1]), Bv = R.nz(-4, 4), side = kind === 'side';
    var modes = kind === 'two' ? [[n1, A], [n2, Bv]] : [[n1, A]];
    var fT = lc(modes.map(function (m) { return tm(m[1], B.raw(sinT(m[0], side ? 'y' : 'x'), 'sin(' + m[0] + (side ? 'y' : 'x') + ')')); }));
    var sol = lc(modes.map(function (m) { var nb = m[0] * bH; return tm(m[1], B.raw(side ? '\\frac{\\sinh ' + kv(m[0], 'x') + '\\sin ' + kv(m[0], 'y') + '}{\\sinh ' + nb + '}' : '\\frac{\\sin ' + kv(m[0], 'x') + '\\sinh ' + kv(m[0], 'y') + '}{\\sinh ' + nb + '}', side ? 'sinh(' + m[0] + 'x) sin(' + m[0] + 'y)/sinh(' + nb + ')' : 'sin(' + m[0] + 'x) sinh(' + m[0] + 'y)/sinh(' + nb + ')')); }));
    chk({ topic: 'de.laplace-equation', kind: 'rect', b: bH, side: side, ans: sol.pl, f: fT.pl });
    var dom = side ? '$0 < x < ' + bH + '$, $0 < y < \\pi$' : '$0 < x < \\pi$, $0 < y < ' + bH + '$';
    var bc = side ? '$u = 0$ on $x = 0$, $y = 0$ and $y = \\pi$, and $u(' + bH + ', y) = ' + fT.tex + '$' : '$u = 0$ on $x = 0$, $x = \\pi$ and $y = 0$, and $u(x, ' + bH + ') = ' + fT.tex + '$';
    return { q: 'Solve $u_{xx} + u_{yy} = 0$ in the rectangle ' + dom + ', with ' + bc + '.', a: ex(sol.pl, ['x', 'y']),
      steps: side ? ['Separate $u = X(x)Y(y)$; the zero conditions at $y = 0, \\pi$ give $Y = \\sin ny$, and then $X\'\' - n^{2}X = 0$ with $X(0) = 0$ gives $X = \\sinh nx$.', 'So $u = \\sum c_n\\sinh nx\\sin ny$. At $x = ' + bH + '$: $\\sum c_n\\sinh(' + kv(bH, 'n') + ')\\sin ny$ must equal the given data.', modes.map(function (m) { return '$c_' + m[0] + '\\sinh ' + m[0] * bH + ' = ' + m[1] + '$'; }).join(', ') + '.', '$u = ' + sol.tex + '$.']
        : ['Separate $u = X(x)Y(y)$; the zero conditions at $x = 0, \\pi$ give $X = \\sin nx$, and then $Y\'\' - n^{2}Y = 0$ with $Y(0) = 0$ gives $Y = \\sinh ny$.', 'So $u = \\sum c_n\\sin nx\\sinh ny$. At $y = ' + bH + '$: $\\sum c_n\\sinh(' + kv(bH, 'n') + ')\\sin nx$ must equal the given data.', modes.map(function (m) { return '$c_' + m[0] + '\\sinh ' + m[0] * bH + ' = ' + m[1] + '$'; }).join(', ') + '.', '$u = ' + sol.tex + '$.'],
      hint: 'Use the three zero sides to choose sines in one variable and $\\sinh$ in the other, then match the fourth side.' };
  });

// ---- tail.js
})(window.MathLadder);
