/* Math Ladder problem generators: Complex Analysis (cplx). One generator per topic in data/math/topics/cplx.json.
   Built from parts by the course builder (/tmp/work_ug_cplx/gen). Every answer is computed from the generated numbers
   with exact arithmetic: Gaussian rationals a + bi with a, b exact fractions (ML.Q), polynomials with Gaussian-rational
   coefficients, exact residues of rational functions by Taylor division, and special angles with exact radicals. Each
   problem carries p.chk, the raw data that the node tests in the work folder use to check the answer independently
   (numerical contour integrals, numerical real integrals, root finding and finite differences).
   Answer notes: complex answers are { t: 'num', v: '3-2*i' } (the checker compares complex values); expressions in z
   are asked only when they are polynomials (the checker proves those equal symbolically); parametrizations with e^(it)
   and quotients with complex coefficients are asked as values or as multiple choice. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, Q = ML.Q, U = ML.util;
  function L(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }

  // ===================================================================== wide inline math becomes display math
  // (the same width estimate as the Calculus 4 generators: inline math wider than about 270 px, a phone-width card,
  // becomes display math, which scrolls in its own box instead of widening the page)
  var WIDE_EM = 15.5;
  var TW_OP = { '+': 1.2, '-': 1.2, '=': 1.3, '<': 1.3, '>': 1.3, '/': 0.5, '*': 0.6, '!': 0.3, "'": 0.3, ':': 0.6, ';': 0.45, '.': 0.28, ',': 0.45, '(': 0.39, ')': 0.39, '[': 0.28, ']': 0.28, '|': 0.28, '&': 0, '~': 0.33 };
  var TW_CMD = { ',': 0.17, ':': 0.22, ';': 0.28, '!': -0.17, ' ': 0.33, quad: 1, qquad: 2, cdot: 0.72, times: 1.2, div: 1.2, pm: 1.2, mp: 1.2, le: 1.3, ge: 1.3, leq: 1.3, geq: 1.3, ne: 1.3, neq: 1.3, approx: 1.3, equiv: 1.3, to: 1.5, rightarrow: 1.5, Rightarrow: 1.5, implies: 2, iff: 2, mapsto: 1.5, langle: 0.39, rangle: 0.39, lvert: 0.28, rvert: 0.28, '|': 0.5, '{': 0.5, '}': 0.5, infty: 1.0, partial: 0.57, circ: 0.5, ldots: 1.2, cdots: 1.2, dots: 1.2, in: 1.2, prime: 0.3, int: 0.75, oint: 0.75, sum: 1.05, prod: 1.05, lim: 1.2, max: 1.6, min: 1.5, '$': 0.5, '%': 0.8 };
  var TW_FN = /^(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|sinh|cosh|tanh|ln|log|exp|det|arg|Re|Im)$/;
  var TW_IGN = /^(left|right|middle|displaystyle|textstyle|big|Big|bigg|Bigg|limits|nolimits|color|textcolor)$/;
  function texWidth(src) {
    var i = 0, s = String(src), disp = false;
    function skipSp() { while (s[i] === ' ') i++; }
    function group(k) { skipSp(); if (s[i] === '{') { i++; var w = seq(k, '}'); i++; return w; } return atom(k); }
    function name() { var m = /^\\([A-Za-z]+|.)/.exec(s.slice(i)); i += m ? m[0].length : 1; return m ? m[1] : ''; }
    function atom(k) {
      var c = s[i];
      if (c === undefined) return 0;
      if (c === '\\') {
        var n = name();
        if (n === 'displaystyle') { disp = true; return 0; }
        if (n === 'color') { group(k); return 0; }
        if (TW_IGN.test(n)) { if (/^(left|right|middle)$/.test(n)) { skipSp(); if (s[i] === '\\') { var n2 = name(); return n2 === '.' ? 0 : (TW_CMD[n2] || 0.4) * k; } var ch = s[i++]; return ch === '.' ? 0 : (TW_OP[ch] || 0.4) * k; } return 0; }
        if (n === 'frac' || n === 'dfrac' || n === 'tfrac') { var big = n === 'dfrac' || (disp && n !== 'tfrac'), kk = big ? k : k * 0.9; var a = group(kk), b = group(kk); return Math.max(a, b) + 0.24 * k; }
        if (n === 'binom') { var a2 = group(k * 0.71), b2 = group(k * 0.71); return Math.max(a2, b2) + 0.9 * k; }
        if (n === 'sqrt') { skipSp(); var idx = 0; if (s[i] === '[') { var j = s.indexOf(']', i); idx = 0.4 * k; i = j + 1; } return group(k) + 0.85 * k + idx; }
        if (/^(mathbf|boldsymbol|bm)$/.test(n)) return group(k * 1.12);
        if (/^(mathrm|mathit|mathsf|mathcal|mathbb|operatorname|vec|hat|bar|tilde|dot|overline|underline|widehat|boxed|phantom)$/.test(n)) return group(k) + (n === 'operatorname' ? 0.17 * k : 0);
        if (/^(text|textbf|textit|mbox)$/.test(n)) { skipSp(); if (s[i] === '{') { var e = i + 1, d = 1; while (e < s.length && d) { if (s[e] === '{') d++; else if (s[e] === '}') d--; e++; } var t = s.slice(i + 1, e - 1); i = e; return t.length * 0.47 * k; } return 0.5 * k; }
        if (n === 'begin') { var end = s.indexOf('\\end', i); var body = s.slice(i, end < 0 ? s.length : end); i = end < 0 ? s.length : s.indexOf('}', end) + 1; var rows = body.replace(/^\{[^}]*\}/, '').split('\\\\'); return Math.max.apply(null, rows.map(function (r) { return texWidth(r.replace(/&/g, ' \\quad ')); })) * k + 1 * k; }
        if (TW_FN.test(n)) return (n.length * 0.5 + 0.17) * k;
        if (n in TW_CMD) { var w0 = TW_CMD[n]; if (disp && /^(int|oint|sum|prod)$/.test(n)) w0 *= 1.4; return w0 * k; }
        if (/^[A-Za-z]+$/.test(n)) return 0.6 * k;
        return 0.5 * k;
      }
      i++;
      if (c === '{') { var w1 = seq(k, '}'); i++; return w1; }
      if (c === '^' || c === '_') { var w2 = group(k * 0.71); skipSp(); if ((s[i] === '^' || s[i] === '_') && s[i] !== c) { i++; w2 = Math.max(w2, group(k * 0.71)); } return w2 + 0.05 * k; }
      if (/[A-Za-z]/.test(c)) return 0.55 * k;
      if (/[0-9]/.test(c)) return 0.5 * k;
      if (c in TW_OP) return TW_OP[c] * k;
      if (c === ' ') return 0;
      return 0.6 * k;
    }
    function seq(k, stop) { var w = 0; while (i < s.length && s[i] !== stop) w += atom(k); return w; }
    var w = 0; while (i < s.length) { w += seq(1, '}'); if (s[i] === '}') i++; }
    return disp ? w * 1.12 : w;
  }
  function fixMath(s, wide) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\') { out += s.substr(i, 2); i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var e2 = s.indexOf('$$', i + 2); if (e2 < 0) { out += s.slice(i); break; } out += s.slice(i, e2 + 2); i = e2 + 2; continue; }
      if (c === '$') { var j = i + 1; while (j < n && s[j] !== '$') { if (s[j] === '\\') j++; j++; } if (j >= n) { out += s.slice(i); break; } var inner = s.slice(i + 1, j);
        if (wide && texWidth(inner) > wide) { var pm = /^[.,;:]/.exec(s.slice(j + 1)); out = out.replace(/ $/, '') + ' $$' + inner + (pm ? (pm[0] === ':' || pm[0] === ';' ? '\\text{' + pm[0] + '}' : pm[0]) : '') + '$$ '; i = j + 1 + (pm ? 1 : 0); while (s[i] === ' ') i++; continue; }
        out += '$' + (/^\d/.test(inner) ? '{}' : '') + inner + '$'; i = j + 1; continue; }
      out += c; i++;
    }
    return out;
  }
  function fixProblem(p) {
    if (!p) return p;
    p.q = fixMath(p.q, WIDE_EM - 1).trim(); if (p.hint) p.hint = fixMath(p.hint, WIDE_EM).trim(); if (p.steps) p.steps = p.steps.map(function (x) { return fixMath(x, WIDE_EM).trim(); });
    (function walk(a) { if (!a) return; if (a.t === 'mc' && a.choices) a.choices = a.choices.map(function (c) { return fixMath(c); }); if (a.t === 'multi') a.parts.forEach(function (pt) { if (pt.label) pt.label = fixMath(pt.label); walk(pt.a); }); })(p.a);
    return p;
  }
  var G0 = G; G = function (id, fn) { G0(id, function (R, ctx) { return fixProblem(fn(R, ctx)); }); };

  // ===================================================================== exact numbers
  function q(x) { return x instanceof Q ? x : Q.from(x); }
  function qt(x) { return q(x).toTex(); }
  function qp(x) { return q(x).toPlain(); }
  function qn(x) { return q(x).toNumber(); }
  // ---- Gaussian rationals { re: Q, im: Q }
  function Z(re, im) { return { re: q(re || 0), im: q(im || 0) }; }
  function zz(x) { return x && x.re !== undefined ? x : Z(x, 0); }
  function zadd(a, b) { a = zz(a); b = zz(b); return Z(a.re.add(b.re), a.im.add(b.im)); }
  function zsub(a, b) { a = zz(a); b = zz(b); return Z(a.re.sub(b.re), a.im.sub(b.im)); }
  function zmul(a, b) { a = zz(a); b = zz(b); return Z(a.re.mul(b.re).sub(a.im.mul(b.im)), a.re.mul(b.im).add(a.im.mul(b.re))); }
  function zconj(a) { a = zz(a); return Z(a.re, a.im.neg()); }
  function znorm(a) { a = zz(a); return a.re.mul(a.re).add(a.im.mul(a.im)); }
  function zdiv(a, b) { var n = zmul(a, zconj(b)), d = znorm(b); return Z(n.re.div(d), n.im.div(d)); }
  function zneg(a) { a = zz(a); return Z(a.re.neg(), a.im.neg()); }
  function zscale(k, a) { a = zz(a); k = q(k); return Z(a.re.mul(k), a.im.mul(k)); }
  function zpow(a, n) { var r = Z(1), i; if (n < 0) return zdiv(Z(1), zpow(a, -n)); for (i = 0; i < n; i++) r = zmul(r, a); return r; }
  function zeq(a, b) { a = zz(a); b = zz(b); return a.re.eq(b.re) && a.im.eq(b.im); }
  function zisz(a) { a = zz(a); return a.re.isZero() && a.im.isZero(); }
  function zisReal(a) { return zz(a).im.isZero(); }
  function zn(a) { a = zz(a); return [qn(a.re), qn(a.im)]; }
  var ZI = Z(0, 1), Z0 = Z(0), Z1 = Z(1);
  function imPlain(b, unit) { // b·unit for a nonzero Q b, as plain text with the sign in front: "i", "-3*i", "-(3/4)*i"
    var a = b.abs(), s = b.sign() < 0 ? '-' : ''; if (a.eq(1)) return s + unit; return s + (a.isInt() ? a.toPlain() : '(' + a.toPlain() + ')') + '*' + unit;
  }
  function zplain(z) { // "3-2*i", "-i", "1/2+(3/4)*i" (CAS syntax)
    z = zz(z); var s = z.re.isZero() ? '' : z.re.toPlain();
    if (!z.im.isZero()) { var t = imPlain(z.im, 'i'); s += s && t[0] !== '-' ? '+' + t : t; }
    return s || '0';
  }
  function ztex(z) { // "3 - 2i", "\frac{1}{2} + \frac{3}{4}i", "-i"
    z = zz(z); var s = z.re.isZero() ? '' : z.re.toTex();
    if (!z.im.isZero()) { var a = z.im.abs(), body = a.eq(1) ? 'i' : a.toTex() + 'i'; s += z.im.sign() < 0 ? (s ? ' - ' : '-') + body : (s ? ' + ' : '') + body; }
    return s || '0';
  }
  function zpar(z) { var s = ztex(z); return (/[+\-]/.test(s.replace(/^-/, '')) || /^-/.test(s)) ? '(' + s + ')' : s; }   // ready to multiply
  function zcoef(z, v, first) { // coefficient z times v ("(1 + 2i)z^2", "-3iz", " + 2z"); first defaults to true
    z = zz(z); if (first === undefined) first = true; if (zisz(z)) return '';
    var both = !z.re.isZero() && !z.im.isZero(), s;
    if (both) { s = '(' + ztex(z) + ')' + v; return first ? s : ' + ' + s; }
    var real = !z.re.isZero(), c = real ? z.re : z.im, neg = c.sign() < 0, a = c.abs(), body = (a.eq(1) ? (real ? '' : 'i') : a.toTex() + (real ? '' : 'i')) + v;
    if (body === '') body = '1';
    return first ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body;
  }
  function zshift(z) { // "z - 2", "z + 1 - i", "z - (1 + 2i)" written as z - a
    z = zz(z); if (zisz(z)) return 'z';
    var both = !z.re.isZero() && !z.im.isZero(); if (both) return 'z - (' + ztex(z) + ')';
    var c = z.re.isZero() ? z.im : z.re, unit = z.re.isZero() ? 'i' : '', a = c.abs(), body = (a.eq(1) && unit ? '' : a.toTex()) + unit;
    return 'z ' + (c.sign() < 0 ? '+ ' : '- ') + body;
  }
  function zm(c, v) { // "z - 2 + 3i" for z − (2 − 3i): the sum written out (v defaults to z)
    c = zz(c); v = v || 'z'; return v + (c.re.isZero() ? '' : (c.re.sign() < 0 ? ' + ' + qt(c.re.abs()) : ' - ' + qt(c.re))) + (c.im.isZero() ? '' : (c.im.sign() < 0 ? ' + ' : ' - ') + (c.im.abs().eq(1) ? '' : qt(c.im.abs())) + 'i');
  }
  function zshiftPlain(z) { return '(z-(' + zplain(z) + '))'; }
  function zrand(R, lo, hi, nz) { var a, b; do { a = R.int(lo, hi); b = R.int(lo, hi); } while (nz ? (a === 0 || b === 0) : (a === 0 && b === 0)); return Z(a, b); }
  // ---- k·π, k·πi
  function piPlain(k) { k = q(k); if (k.isZero()) return '0'; var a = k.abs(), s = k.sign() < 0 ? '-' : ''; return s + (a.n === 1n ? '' : a.n + '*') + 'pi' + (a.d === 1n ? '' : '/' + a.d); }
  function piTex(k) { k = q(k); if (k.isZero()) return '0'; var a = k.abs(), s = k.sign() < 0 ? '-' : '', top = (a.n === 1n ? '' : a.n.toString()) + '\\pi'; return s + (a.d === 1n ? top : '\\frac{' + top + '}{' + a.d + '}'); }
  function zpiPlain(z) { // (a + bi)·π as plain text: "2*pi", "pi/2*i", "-pi+3*pi/2*i"
    z = zz(z); var s = z.re.isZero() ? '' : piPlain(z.re);
    if (!z.im.isZero()) { var t = piPlain(z.im) + '*i'; s += s && t[0] !== '-' ? '+' + t : t; }
    return s || '0';
  }
  function sqv(v, a) { a = q(a); return a.isZero() ? v + '^2' : '(' + v + (a.sign() < 0 ? ' + ' + qt(a.abs()) : ' - ' + qt(a)) + ')^2'; } // (x − a)², tidy
  function eiTex(r, k) { k = q(k); var e = k.isZero() ? '' : 'e^{' + piTex(k) + ' i}'; var rr = String(r); return e ? (rr === '1' ? '' : rr) + e : rr; } // r e^{kπ i}
  function zpiTex(z) { // "2\pi i", "\frac{\pi}{2}i", "-\pi + \frac{3\pi}{2}i"
    z = zz(z); var s = z.re.isZero() ? '' : piTex(z.re);
    if (!z.im.isZero()) { var a = z.im.abs(), t = piTex(a) + ' i'; s += z.im.sign() < 0 ? (s ? ' - ' : '-') + t : (s ? ' + ' : '') + t; }
    return s || '0';
  }
  function twoPiI(z) { return zmul(Z(0, 2), z); } // 2πi·z = (2i z)·π
  // ---- k·√n (n squarefree after simplifying)
  function radNorm(k, n) { k = q(k); if (n === 0 || k.isZero()) return { k: Q(0), n: 1 }; var s = U.simplifyRadical(n); return { k: k.mul(s[0]), n: s[1] }; }
  function radPlain(k, n) { var r = radNorm(k, n); if (r.n === 1) return r.k.toPlain(); var a = r.k.abs(), num = a.n === 1n ? 'sqrt(' + r.n + ')' : a.n + '*sqrt(' + r.n + ')'; return (r.k.sign() < 0 ? '-' : '') + (a.d === 1n ? num : '(' + num + ')/' + a.d); }
  function radTex(k, n) { var r = radNorm(k, n); if (r.n === 1) return r.k.toTex(); var a = r.k.abs(), num = (a.n === 1n ? '' : a.n.toString()) + '\\sqrt{' + r.n + '}'; return (r.k.sign() < 0 ? '-' : '') + (a.d === 1n ? num : '\\frac{' + num + '}{' + a.d + '}'); }
  function radNum(k, n) { return qn(k) * Math.sqrt(n); }
  // a complex number with radical parts: x = kx·√nx, y = ky·√ny
  function rcPlain(x, y) { var xs = radPlain(x.k, x.n), ys = radPlain(y.k, y.n); if (ys === '0') return xs; var yi = ys === '1' ? 'i' : ys === '-1' ? '-i' : /[\/*]/.test(ys.replace(/^-/, '')) ? (ys[0] === '-' ? '-(' + ys.slice(1) + ')*i' : '(' + ys + ')*i') : ys + '*i'; return xs === '0' ? yi : xs + (yi[0] === '-' ? '' : '+') + yi; }
  function rcTex(x, y) { var xs = radTex(x.k, x.n), ys = radTex(y.k, y.n); if (ys === '0') return xs; var neg = ys[0] === '-', a = neg ? ys.slice(1) : ys, yi = a === '1' ? 'i' : a + (/\\sqrt/.test(a) && !/\\frac/.test(a) ? '\\,i' : 'i'); if (xs === '0') return (neg ? '-' : '') + yi; return xs + (neg ? ' - ' : ' + ') + yi; }
  function rcNum(x, y) { return [radNum(x.k, x.n), radNum(y.k, y.n)]; }
  function rad(k, n) { return { k: q(k), n: n || 1 }; }
  function radMul(a, b) { return radNorm(q(a.k).mul(b.k), a.n * b.n); }
  // ---- special angles θ = (p/12)·π: exact cos and sin as k·√n (only multiples of π/6 and π/4 are used)
  var TRIG = {};
  [[0, [1, 1], [0, 1]], [Q(1, 6), [Q(1, 2), 3], [Q(1, 2), 1]], [Q(1, 4), [Q(1, 2), 2], [Q(1, 2), 2]], [Q(1, 3), [Q(1, 2), 1], [Q(1, 2), 3]], [Q(1, 2), [0, 1], [1, 1]]].forEach(function (r) {
    var a = q(r[0]);
    [[a, 1, 1], [Q(1).sub(a), -1, 1], [Q(1).add(a), -1, -1], [Q(2).sub(a), 1, -1], [a.neg(), 1, -1], [a.sub(1), -1, -1], [a.neg().sub(1), -1, 1]].forEach(function (w) { var key = w[0].toString(); if (!TRIG[key]) TRIG[key] = { c: rad(q(r[1][0]).mul(w[1]), r[1][1]), s: rad(q(r[2][0]).mul(w[2]), r[2][1]) }; });
  });
  function trigOf(k) { // k = θ/π as Q, reduced into (−1, 1]
    k = q(k); while (k.gt(1)) k = k.sub(2); while (k.le(-1)) k = k.add(2); var t = TRIG[k.toString()]; if (!t) throw new Error('no exact trig for ' + k); return t;
  }
  function princ(k) { k = q(k); while (k.gt(1)) k = k.sub(2); while (k.le(-1)) k = k.add(2); return k; } // an angle/π into (−1, 1]
  var ANG6 = [Q(1, 6), Q(1, 3), Q(2, 3), Q(5, 6), Q(-1, 6), Q(-1, 3), Q(-2, 3), Q(-5, 6)], ANG4 = [Q(1, 4), Q(3, 4), Q(-1, 4), Q(-3, 4)], ANGAX = [Q(0), Q(1, 2), Q(1), Q(-1, 2)];
  // a point r·e^{iθ} with exact rectangular parts (r a positive integer)
  function polarPt(r, k) { var t = trigOf(k); return { x: radMul(rad(r), t.c), y: radMul(rad(r), t.s), r: r, k: princ(k) }; }
  // ---- natural logs of positive rationals, as plain and TeX
  function lnPlain(x) { x = q(x); if (x.eq(1)) return '0'; return 'ln(' + x.toPlain() + ')'; }
  function lnTex(x) { x = q(x); if (x.eq(1)) return '0'; return '\\ln ' + (x.isInt() ? x.toPlain() : '\\left(' + x.toTex() + '\\right)'); }

  // ===================================================================== polynomials with Gaussian-rational coefficients (low -> high)
  function P(arr) { return arr.map(zz); }
  function ptrim(p) { p = p.slice(); while (p.length > 1 && zisz(p[p.length - 1])) p.pop(); return p; }
  function padd(a, b) { var r = []; for (var i = 0; i < Math.max(a.length, b.length); i++) r.push(zadd(a[i] || Z0, b[i] || Z0)); return ptrim(r); }
  function pmul(a, b) { var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(Z0); a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] = zadd(r[i + j], zmul(x, y)); }); }); return ptrim(r); }
  function pscale(k, a) { return a.map(function (c) { return zmul(k, c); }); }
  function pev(p, z) { var r = Z0; for (var i = p.length - 1; i >= 0; i--) r = zadd(zmul(r, z), p[i]); return r; }
  function pder(p) { var r = []; for (var i = 1; i < p.length; i++) r.push(zscale(i, p[i])); return r.length ? r : [Z0]; }
  function plin(a) { return P([zneg(a), 1]); } // z − a
  function pfromRoots(rs, lead) { var p = P([lead || 1]); rs.forEach(function (r) { p = pmul(p, plin(r)); }); return p; }
  function ppow(p, n) { var r = P([1]); for (var i = 0; i < n; i++) r = pmul(r, p); return r; }
  function pshift(p, a) { // the coefficients of p(a + u) in powers of u
    var r = [Z0], i; for (i = p.length - 1; i >= 0; i--) { r = pmul(r, P([a, 1])); r[0] = zadd(r[0], p[i]); } return r;
  }
  function ptex(p, v) { // highest power first: "z^{3} - 2iz + (1 + i)"
    v = v || 'z'; var s = '', first = true;
    for (var i = p.length - 1; i >= 0; i--) { var c = p[i]; if (zisz(c)) continue; var pw = i === 0 ? '' : i === 1 ? v : v + '^{' + i + '}', t;
      if (i === 0) { var ct = ztex(c), both = !c.re.isZero() && !c.im.isZero(); t = first ? ct : both ? ' + (' + ct + ')' : (ct[0] === '-' ? ' - ' + ct.slice(1) : ' + ' + ct); }
      else t = zcoef(c, pw, first);
      s += t; first = false; }
    return s || '0';
  }
  function pplain(p, v) { v = v || 'z'; var s = []; for (var i = p.length - 1; i >= 0; i--) { if (zisz(p[i])) continue; s.push('(' + zplain(p[i]) + ')' + (i ? '*' + v + (i > 1 ? '^' + i : '') : '')); } return s.join('+') || '0'; }
  function pint(p) { var r = [Z0]; p.forEach(function (c, i) { r.push(zscale(Q(1, i + 1), c)); }); return r; } // antiderivative with constant 0
  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  // series division: the first n coefficients of A/B for power series A, B (B[0] ≠ 0)
  function sdiv(A, B, n) { var C = []; for (var k = 0; k < n; k++) { var s = A[k] || Z0; for (var j = 1; j <= k; j++) s = zsub(s, zmul(B[j] || Z0, C[k - j])); C.push(zdiv(s, B[0])); } return C; }
  /* exact residue of N(z)/(lead·Π(z − r_j)^{m_j}) at the pole a = r_i (the numerator polynomial N, the roots with
     multiplicities). Returns { res, order } (order 0 when N cancels the whole pole). */
  function resRat(N, roots, a, lead) {
    var m = 0, D = P([lead || 1]); roots.forEach(function (r) { if (zeq(r.z, a)) m += r.m; else D = pmul(D, ppow(plin(r.z), r.m)); });
    if (!m) return { res: Z0, order: 0 };
    var A = pshift(N, a), B = pshift(D, a);
    var C = sdiv(A, B, m);
    return { res: C[m - 1], order: m };
  }
  // ---- a CAS-plain rational function from numerator and roots
  function ratPlain(N, roots, lead) { var den = roots.map(function (r) { return zshiftPlain(r.z) + (r.m > 1 ? '^' + r.m : ''); }).join('*'); return '(' + pplain(N) + ')/(' + (lead && !zeq(lead, 1) ? '(' + zplain(lead) + ')*' : '') + den + ')'; }
  function denTex(roots) { return roots.map(function (r) { var s = zm(r.z); return (s !== 'z' && (roots.length > 1 || r.m > 1) ? '(' + s + ')' : s) + (r.m > 1 ? '^{' + r.m + '}' : ''); }).join(''); }
  function inDisk(z, c, R) { var d = znorm(zsub(z, c)); return d.lt(q(R).mul(q(R))); } // |z − c| < R
  function dist2(z, c) { return znorm(zsub(z, c)); }
  function absTex(z) { var n = znorm(z); return n.isInt() ? radTex(1, n.num()) : radTex(Q(1, n.den()), n.num() * n.den()); } // |z| exact
  function absPlain(z) { var n = znorm(z); return n.isInt() ? radPlain(1, n.num()) : radPlain(Q(1, n.den()), n.num() * n.den()); }
  function words(n) { return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n); }
  function choose(R, arr) { return R.pick(arr); }
  function distTex(z, c) { return zisz(c) ? '|' + ztex(z) + '|' : '|' + ztex(z) + ' - ' + zpar(c) + '|'; }
  function co(r) { var s = String(r); return s === '1' ? '' : s === '-1' ? '-' : s; } // a coefficient in front of a letter
  function mcSpec(correct, wrongs) { return U.mc(correct, wrongs, 4); }

  // ===================================================================== Unit 1: Complex Numbers and the Plane
  var TRIPLES = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17]];
  function tripleZ(R) { var t = R.pick(TRIPLES); return { z: Z(R.sign() * t[0], R.sign() * t[1]), r: t[2] }; }

  G('cplx.modulus-conjugate', function (R, ctx) {
    var kind = R.pick(L(ctx, ['modsq', 'zzbar', 'modsq'], ['sqvs', 'recip', 'prodmod'], ['quot', 'tri', 'solve', 'recip']));
    var z = zrand(R, -6, 6, true), a = z.re, b = z.im;
    if (kind === 'modsq' || kind === 'zzbar') {
      var n2 = znorm(z);
      return { q: kind === 'modsq' ? 'Let $z = ' + ztex(z) + '$. Find $|z|^2$.' : 'Let $z = ' + ztex(z) + '$. Compute $z\\overline{z}$.',
        a: { t: 'num', v: qp(n2) },
        steps: ['The conjugate is $\\overline{z} = ' + ztex(zconj(z)) + '$.', '$z\\overline{z} = (a + bi)(a - bi) = a^2 + b^2$, because the $i$ terms cancel and $-b^2i^2 = b^2$.', '$' + T.p(qt(a)) + '^2 + ' + T.p(qt(b)) + '^2 = ' + qt(a.mul(a)) + ' + ' + qt(b.mul(b)) + ' = ' + qt(n2) + '$' + (kind === 'modsq' ? ', and that is $|z|^2$.' : ', a real number.')],
        hint: 'Multiply $z$ by its conjugate: the imaginary parts cancel.', chk: { kind: kind, z: zplain(z) } };
    }
    if (kind === 'sqvs') {
      var sq = zmul(z, z), n = znorm(z);
      return { q: 'Let $z = ' + ztex(z) + '$. Find $z^2$ and $|z|^2$. (They are not the same number.)',
        a: { t: 'multi', parts: [{ label: '$z^2 =$', a: { t: 'num', v: zplain(sq) } }, { label: '$|z|^2 =$', a: { t: 'num', v: qp(n) } }] },
        steps: ['$z^2 = (' + ztex(z) + ')^2 = ' + qt(a.mul(a)) + T.signed(a.mul(b).mul(2)) + 'i + ' + T.p(qt(b)) + '^2 i^2 = ' + ztex(sq) + '$.', '$|z|^2 = z\\overline{z} = a^2 + b^2 = ' + qt(a.mul(a)) + ' + ' + qt(b.mul(b)) + ' = ' + qt(n) + '$.', '$z^2$ squares the angle as well as the length, so it is usually not real; $|z|^2$ is always a nonnegative real number.'],
        hint: 'For $|z|^2$, multiply by the conjugate, not by $z$ itself.', chk: { kind: kind, z: zplain(z) } };
    }
    if (kind === 'recip') {
      var r = zdiv(Z1, z), nn = znorm(z);
      return { q: 'Write $\\dfrac{1}{' + ztex(z) + '}$ in the form $a + bi$.',
        a: { t: 'num', v: zplain(r) },
        steps: ['Use $\\dfrac{1}{z} = \\dfrac{\\overline{z}}{z\\overline{z}} = \\dfrac{\\overline{z}}{|z|^2}$.', '$\\overline{z} = ' + ztex(zconj(z)) + '$ and $|z|^2 = ' + qt(a.mul(a)) + ' + ' + qt(b.mul(b)) + ' = ' + qt(nn) + '$.', '$\\dfrac{1}{z} = \\dfrac{' + ztex(zconj(z)) + '}{' + qt(nn) + '} = ' + ztex(r) + '$.'],
        hint: 'Multiply the top and bottom by the conjugate.', chk: { kind: kind, z: zplain(z) } };
    }
    if (kind === 'prodmod' || kind === 'quot') {
      var A = tripleZ(R), B = kind === 'quot' ? tripleZ(R) : { z: zrand(R, -4, 4, true) }, nb = znorm(B.z);
      if (kind === 'prodmod') {
        var ans = radPlain(A.r, nb.num()), at = radTex(A.r, nb.num());
        return { q: 'Find $|zw|$ for $z = ' + ztex(A.z) + '$ and $w = ' + ztex(B.z) + '$, without multiplying $z$ and $w$ out.',
          a: { t: 'num', v: ans },
          steps: ['$|zw| = |z|\\,|w|$: the modulus of a product is the product of the moduli.', '$|z| = \\sqrt{' + qt(znorm(A.z)) + '} = ' + A.r + '$ and $|w| = ' + radTex(1, nb.num()) + '$.', '$|zw| = ' + A.r + ' \\cdot ' + radTex(1, nb.num()) + ' = ' + at + '$.'],
          hint: 'Find each modulus separately, then multiply.', chk: { kind: kind, z: zplain(A.z), w: zplain(B.z) } };
      }
      var qv = Q(A.r, B.r);
      return { q: 'Find $\\left|\\dfrac{' + ztex(A.z) + '}{' + ztex(B.z) + '}\\right|$.',
        a: { t: 'num', v: qp(qv) },
        steps: ['$\\left|\\dfrac{z}{w}\\right| = \\dfrac{|z|}{|w|}$, so there is no need to divide first.', '$|' + ztex(A.z) + '| = ' + A.r + '$ and $|' + ztex(B.z) + '| = ' + B.r + '$.', 'The answer is $\\dfrac{' + A.r + '}{' + B.r + '}' + (qv.d !== BigInt(B.r) ? ' = ' + qt(qv) : '') + '$.'],
        hint: 'Divide the moduli.', chk: { kind: kind, z: zplain(A.z), w: zplain(B.z) } };
    }
    if (kind === 'tri') {
      var r1 = R.int(2, 9), r2 = R.intNot(1, 9, r1);
      return { q: 'Suppose $|z| = ' + r1 + '$ and $|w| = ' + r2 + '$. Find the largest and the smallest possible values of $|z + w|$.',
        a: { t: 'multi', parts: [{ label: 'largest:', a: { t: 'num', v: String(r1 + r2) } }, { label: 'smallest:', a: { t: 'num', v: String(Math.abs(r1 - r2)) } }] },
        steps: ['The triangle inequality: $|z + w| \\le |z| + |w| = ' + (r1 + r2) + '$, with equality when $w$ points the same way as $z$.', 'The reverse triangle inequality: $|z + w| \\ge \\big||z| - |w|\\big| = ' + Math.abs(r1 - r2) + '$, with equality when $w$ points the opposite way.', 'So $' + Math.abs(r1 - r2) + ' \\le |z + w| \\le ' + (r1 + r2) + '$, and both ends happen.'],
        hint: 'Think of $z$ and $w$ as arrows placed head to tail.', chk: { kind: kind } };
    }
    // solve z + k·conj(z) = c
    var k = R.pick([2, 3, -2, -3]), x = R.nz(-5, 5), y = R.nz(-5, 5), sol = Z(x, y), c = zadd(sol, zscale(k, zconj(sol)));
    return { q: 'Find the complex number $z$ with $z ' + (k > 0 ? '+ ' + k : '- ' + (-k)) + '\\overline{z} = ' + ztex(c) + '$.',
      a: { t: 'num', v: zplain(sol) },
      steps: ['Write $z = x + iy$, so $\\overline{z} = x - iy$.', '$z ' + (k > 0 ? '+' : '-') + ' ' + Math.abs(k) + '\\overline{z} = ' + T.terms([[1 + k, 'x'], [1 - k, 'iy']]) + '$.', 'Match real parts: $' + T.mono(1 + k, 'x') + ' = ' + qt(c.re) + '$, so $x = ' + x + '$. Match imaginary parts: $' + T.mono(1 - k, 'y') + ' = ' + qt(c.im) + '$, so $y = ' + y + '$.', '$z = ' + ztex(sol) + '$.'],
      hint: 'Write $z = x + iy$ and match the real parts and the imaginary parts.', chk: { kind: kind, k: k, c: zplain(c), z: zplain(sol) } };
  });

  // ---- exponential form
  function angTex(k) { return piTex(k); }
  G('cplx.exponential-form', function (R, ctx) {
    var kind = R.pick(L(ctx, ['toexp', 'torect', 'toexp'], ['toexp', 'torect', 'mul', 'quot'], ['pow', 'pow', 'mul', 'toexp']));
    if (kind === 'toexp') {
      var fam = lvl(ctx) === 1 ? R.pick(['ax', 'four', 'six']) : R.pick(['four', 'six', 'six']);
      var k = fam === 'ax' ? R.pick(ANGAX) : fam === 'four' ? R.pick(lvl(ctx) === 1 ? [Q(1, 4), Q(3, 4)] : ANG4) : R.pick(lvl(ctx) === 1 ? [Q(1, 6), Q(1, 3)] : ANG6);
      var m = R.int(1, 4), t = trigOf(k), x, y, rP, rT, ref;
      if (fam === 'four') { x = rad(m * Math.sign(qn(t.c.k))); y = rad(m * Math.sign(qn(t.s.k))); rP = radPlain(m, 2); rT = radTex(m, 2); ref = Q(1, 4); }
      else if (fam === 'six') { x = radMul(rad(2 * m), t.c); y = radMul(rad(2 * m), t.s); rP = String(2 * m); rT = rP; ref = t.s.n === 1 ? Q(1, 6) : Q(1, 3); }
      else { x = radMul(rad(m), t.c); y = radMul(rad(m), t.s); rP = String(m); rT = rP; ref = null; }
      var quad = qn(k) > 0.5 ? 'II' : qn(k) > 0 ? 'I' : qn(k) < -0.5 ? 'III' : 'IV', st = ['$r = |z| = \\sqrt{a^2 + b^2} = ' + rT + '$.'];
      if (fam === 'ax') st.push('The point lies on an axis, so the angle is $' + angTex(k) + '$.');
      else { st.push('The point is in quadrant ' + quad + '. The reference angle, from $\\tan^{-1}\\left|\\frac{b}{a}\\right|$, is $' + angTex(ref) + '$.'); st.push('In quadrant ' + quad + ' that gives $\\theta = ' + angTex(k) + '$' + (quad === 'II' || quad === 'III' ? ' (the calculator value of $\\tan^{-1}(b/a)$ alone would point into the opposite quadrant)' : '') + '.'); }
      st.push('$z = ' + eiTex(rT, k) + '$.');
      return { q: 'Write $z = ' + rcTex(x, y) + '$ in exponential form $re^{i\\theta}$ with $-\\pi < \\theta \\le \\pi$.',
        a: { t: 'multi', parts: [{ label: '$r =$', a: { t: 'num', v: rP } }, { label: '$\\theta =$', a: { t: 'num', v: piPlain(k) } }] },
        steps: st, hint: 'Find the quadrant first, then the angle.', chk: { kind: kind, z: rcPlain(x, y), r: rP, k: qp(k) } };
    }
    if (kind === 'torect') {
      var k2 = R.pick(ANG6.concat(ANG4)), r2 = R.pick([2, 4, 6, 3]), p2 = polarPt(r2, k2), t2 = trigOf(k2);
      return { q: 'Write $' + eiTex(r2, k2) + '$ in the form $a + bi$.',
        a: { t: 'num', v: rcPlain(p2.x, p2.y) },
        steps: ['Euler\'s formula: $re^{i\\theta} = r\\cos\\theta + ir\\sin\\theta$.', '$\\cos\\left(' + angTex(k2) + '\\right) = ' + radTex(t2.c.k, t2.c.n) + '$ and $\\sin\\left(' + angTex(k2) + '\\right) = ' + radTex(t2.s.k, t2.s.n) + '$.', 'Multiply by $' + r2 + '$: $' + rcTex(p2.x, p2.y) + '$.'],
        hint: 'Use $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$.', chk: { kind: kind, r: r2, k: qp(k2), v: rcPlain(p2.x, p2.y) } };
    }
    if (kind === 'mul' || kind === 'quot') {
      var famA = R.pick([ANG6, ANG4]).concat([Q(1, 2), Q(1)]), a1 = R.pick(famA), a2 = R.pick(famA), m1 = R.int(2, 6), m2 = R.int(2, 4);
      var ks = kind === 'mul' ? princ(a1.add(a2)) : princ(a1.sub(a2)), rr = kind === 'mul' ? Q(m1 * m2) : Q(m1, m2);
      var res = { x: radMul(rad(rr), trigOf(ks).c), y: radMul(rad(rr), trigOf(ks).s) };
      var raw = kind === 'mul' ? a1.add(a2) : a1.sub(a2);
      return { q: (kind === 'mul' ? 'Multiply' : 'Divide') + ' and write the answer as $a + bi$: $' + (kind === 'mul' ? '\\left(' + eiTex(m1, a1) + '\\right)\\left(' + eiTex(m2, a2) + '\\right)' : '\\dfrac{' + eiTex(m1, a1) + '}{' + eiTex(m2, a2) + '}') + '$',
        a: { t: 'num', v: rcPlain(res.x, res.y) },
        steps: [kind === 'mul' ? 'Multiply the moduli and add the angles: $e^{i\\alpha}e^{i\\beta} = e^{i(\\alpha + \\beta)}$.' : 'Divide the moduli and subtract the angles.', 'Modulus $' + qt(rr) + '$, angle $' + angTex(raw) + (raw.eq(ks) ? '' : ' \\equiv ' + angTex(ks)) + '$.', 'So the result is $' + eiTex(qt(rr), ks) + ' = ' + rcTex(res.x, res.y) + '$.'],
        hint: kind === 'mul' ? 'Lengths multiply; angles add.' : 'Lengths divide; angles subtract.', chk: { kind: kind, v: rcPlain(res.x, res.y), expr: kind === 'mul' ? m1 + '*e^(' + piPlain(a1) + '*i)*' + m2 + '*e^(' + piPlain(a2) + '*i)' : m1 + '*e^(' + piPlain(a1) + '*i)/(' + m2 + '*e^(' + piPlain(a2) + '*i))' } };
    }
    // powers by De Moivre: (1 ± i)^n, (±√3 ± i)^n, (1 ± √3 i)^n
    var base = R.pick(['1+i', '1-i', 's3+i', 's3-i', '1+s3i', '-1+i']), n = R.int(4, lvl(ctx) === 3 ? 10 : 7);
    var info = { '1+i': [2, Q(1, 4), '1 + i'], '1-i': [2, Q(-1, 4), '1 - i'], '-1+i': [2, Q(3, 4), '-1 + i'], 's3+i': [4, Q(1, 6), '\\sqrt{3} + i'], 's3-i': [4, Q(-1, 6), '\\sqrt{3} - i'], '1+s3i': [4, Q(1, 3), '1 + \\sqrt{3}\\,i'] }[base];
    var mod2 = info[0], th = info[1], kk = princ(th.mul(n)), mod = Q(1); // |base|^n = (√mod2)^n
    var rn = mod2 === 4 ? rad(Math.pow(2, n), 1) : (n % 2 === 0 ? rad(Math.pow(2, n / 2), 1) : rad(Math.pow(2, (n - 1) / 2), 2));
    var res2 = { x: radMul(rn, trigOf(kk).c), y: radMul(rn, trigOf(kk).s) };
    return { q: 'Use exponential form to compute $(' + info[2] + ')^{' + n + '}$. Write the answer as $a + bi$.',
      a: { t: 'num', v: rcPlain(res2.x, res2.y) },
      steps: ['$' + info[2] + ' = ' + eiTex(radTex(1, mod2), th) + '$.', 'Raise to the power $' + n + '$: the modulus becomes $(' + radTex(1, mod2) + ')^{' + n + '} = ' + radTex(rn.k, rn.n) + '$ and the angle becomes $' + n + ' \\cdot ' + angTex(th) + ' = ' + angTex(th.mul(n)) + (th.mul(n).eq(kk) ? '' : ' \\equiv ' + angTex(kk)) + '$.', '$' + radTex(rn.k, rn.n) + '\\left(\\cos\\left(' + angTex(kk) + '\\right) + i\\sin\\left(' + angTex(kk) + '\\right)\\right) = ' + rcTex(res2.x, res2.y) + '$.'],
      hint: 'Write the base as $re^{i\\theta}$; then $(re^{i\\theta})^n = r^ne^{in\\theta}$.', chk: { kind: 'pow', expr: '(' + { '1+i': '1+i', '1-i': '1-i', '-1+i': '-1+i', 's3+i': 'sqrt(3)+i', 's3-i': 'sqrt(3)-i', '1+s3i': '1+sqrt(3)*i' }[base] + ')^' + n, v: rcPlain(res2.x, res2.y) } };
  });

  // ---- principal argument
  function latticeAt(R, k) { // a lattice-like point at angle kπ with an exact description: [x, y] radicals and TeX
    var t = trigOf(k), m = R.int(1, 4), s3 = t.c.n === 3 || t.s.n === 3;
    if (t.c.n === 2) return { x: rad(m * Math.sign(qn(t.c.k))), y: rad(m * Math.sign(qn(t.s.k))) };
    if (s3) return { x: radMul(rad(2 * m), t.c), y: radMul(rad(2 * m), t.s) };
    return { x: radMul(rad(m), t.c), y: radMul(rad(m), t.s) };
  }
  G('cplx.principal-argument', function (R, ctx) {
    var kind = R.pick(L(ctx, ['Arg', 'Arg', 'shift'], ['shift', 'prod', 'conj', 'Arg'], ['prod', 'prod', 'pow', 'conj']));
    var pool = ANG6.concat(ANG4, ANGAX);
    if (kind === 'Arg' || kind === 'shift') {
      var k = lvl(ctx) === 1 ? R.pick([Q(1), Q(-1, 2), Q(3, 4), Q(-3, 4), Q(2, 3), Q(-1, 6), Q(1, 2)]) : R.pick(pool), p = latticeAt(R, k), zT = rcTex(p.x, p.y);
      if (kind === 'Arg') return { q: 'Find the principal argument $\\operatorname{Arg} z$ of $z = ' + zT + '$.', a: { t: 'num', v: piPlain(k) },
        steps: ['$\\operatorname{Arg} z$ is the one argument in $(-\\pi, \\pi]$.', 'Plot $z$: ' + (k.eq(1) ? 'it lies on the negative real axis, so the angle is $\\pi$ (not $-\\pi$, which is left out of the interval).' : k.eq(Q(-1, 2)) ? 'it lies on the negative imaginary axis, so the angle is $-\\frac{\\pi}{2}$.' : k.eq(Q(1, 2)) ? 'it lies on the positive imaginary axis: $\\frac{\\pi}{2}$.' : k.isZero() ? 'it lies on the positive real axis: $0$.' : 'its quadrant and reference angle give $' + piTex(k) + '$.'), '$\\operatorname{Arg} z = ' + piTex(k) + '$.'],
        hint: 'Measure from the positive real axis; below the axis, use negative angles.', chk: { kind: kind, z: rcPlain(p.x, p.y), k: qp(k) } };
      var up = R.coin(), lo = up ? Q(1) : Q(-3), hi = lo.add(2), val = k.add(up ? 2 : -2);
      return { q: 'Let $z = ' + zT + '$. Which value of $\\arg z$ lies in the interval $(' + piTex(lo) + ', ' + piTex(hi) + ']$?', a: { t: 'num', v: piPlain(val) },
        steps: ['$\\arg z$ is the whole family $\\operatorname{Arg} z + 2\\pi k$.', '$\\operatorname{Arg} z = ' + piTex(k) + '$.', (up ? 'Add' : 'Subtract') + ' $2\\pi$: $' + piTex(val) + '$, which lies in $(' + piTex(lo) + ', ' + piTex(hi) + ']$.'],
        hint: 'Start from $\\operatorname{Arg} z$ and add or subtract $2\\pi$.', chk: { kind: kind, z: rcPlain(p.x, p.y), lo: qp(lo), v: qp(val) } };
    }
    if (kind === 'prod') {
      var k1, k2, tries = 0;
      do { k1 = R.pick(pool.filter(function (x) { return !x.isZero(); })); k2 = R.pick(pool.filter(function (x) { return !x.isZero(); })); tries++; } while (tries < 50 && (lvl(ctx) >= 2 && Math.abs(qn(k1.add(k2))) <= 1 && R.chance(0.75)));
      var sum = k1.add(k2), ka = princ(sum), d = sum.sub(ka), p1 = latticeAt(R, k1), p2 = latticeAt(R, k2);
      return { q: 'Let $z = ' + rcTex(p1.x, p1.y) + '$ and $w = ' + rcTex(p2.x, p2.y) + '$. Find $\\operatorname{Arg} z + \\operatorname{Arg} w$ and $\\operatorname{Arg}(zw)$.',
        a: { t: 'multi', parts: [{ label: '$\\operatorname{Arg} z + \\operatorname{Arg} w =$', a: { t: 'num', v: piPlain(sum) } }, { label: '$\\operatorname{Arg}(zw) =$', a: { t: 'num', v: piPlain(ka) } }] },
        steps: ['$\\operatorname{Arg} z = ' + piTex(k1) + '$ and $\\operatorname{Arg} w = ' + piTex(k2) + '$, so the sum is $' + piTex(sum) + '$.', 'Multiplying adds angles, so $' + piTex(sum) + '$ is an argument of $zw$.', d.isZero() ? 'It already lies in $(-\\pi, \\pi]$, so $\\operatorname{Arg}(zw) = ' + piTex(ka) + '$.' : 'It is outside $(-\\pi, \\pi]$, so ' + (d.sign() > 0 ? 'subtract' : 'add') + ' $2\\pi$: $\\operatorname{Arg}(zw) = ' + piTex(ka) + '$. Here $\\operatorname{Arg}(zw) \\ne \\operatorname{Arg} z + \\operatorname{Arg} w$.'],
        hint: 'Add the two principal arguments, then bring the sum into $(-\\pi, \\pi]$.', chk: { kind: kind, z: rcPlain(p1.x, p1.y), w: rcPlain(p2.x, p2.y), sum: qp(sum), v: qp(ka) } };
    }
    if (kind === 'conj') {
      var k3 = R.pick(pool.concat([Q(1), Q(1)])), p3 = latticeAt(R, k3), inv = R.coin(), ans = k3.eq(1) ? Q(1) : k3.neg();
      return { q: 'Let $z = ' + rcTex(p3.x, p3.y) + '$. Find $\\operatorname{Arg}\\left(' + (inv ? '\\dfrac{1}{z}' : '\\overline{z}') + '\\right)$.', a: { t: 'num', v: piPlain(ans) },
        steps: ['$\\operatorname{Arg} z = ' + piTex(k3) + '$.', (inv ? '$\\frac{1}{z} = \\frac{\\overline{z}}{|z|^2}$ points the same way as $\\overline{z}$, ' : '') + 'The conjugate reflects $z$ across the real axis, which changes the sign of the angle.', k3.eq(1) ? 'But $z$ is on the negative real axis, so the reflection leaves the direction alone: the angle stays $\\pi$ (since $-\\pi$ is not allowed).' : 'So the answer is $' + piTex(ans) + '$.'],
        hint: 'Reflect across the real axis. Watch the negative real axis.', chk: { kind: kind, z: rcPlain(p3.x, p3.y), inv: inv, v: qp(ans) } };
    }
    // Arg of a power
    var k4 = R.pick([Q(3, 4), Q(2, 3), Q(5, 6), Q(-3, 4), Q(-2, 3), Q(1, 3), Q(-5, 6)]), n = R.int(2, 5), p4 = latticeAt(R, k4), raw = k4.mul(n), ka2 = princ(raw);
    return { q: 'Let $z = ' + rcTex(p4.x, p4.y) + '$. Find $\\operatorname{Arg}\\left(z^{' + n + '}\\right)$.', a: { t: 'num', v: piPlain(ka2) },
      steps: ['$\\operatorname{Arg} z = ' + piTex(k4) + '$.', 'Powers multiply the angle: $' + n + ' \\cdot ' + piTex(k4) + ' = ' + piTex(raw) + '$ is an argument of $z^{' + n + '}$.', raw.eq(ka2) ? 'It lies in $(-\\pi, \\pi]$ already.' : 'Shift by a multiple of $2\\pi$ into $(-\\pi, \\pi]$: $' + piTex(ka2) + '$.'],
      hint: 'Multiply the angle by the power, then reduce.', chk: { kind: 'pow', z: rcPlain(p4.x, p4.y), n: n, v: qp(ka2) } };
  });

  // ---- regions
  G('cplx.regions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['disk', 'member', 'disk'], ['bisector', 'member', 'type', 'disk'], ['apollo', 'bisector', 'type', 'member']));
    if (kind === 'disk') {
      var c = zrand(R, -5, 5), r = R.int(1, 6), rel = R.pick(['<', '\\le', '=']), inner = zm(c);
      var what = rel === '=' ? 'circle' : rel === '<' ? 'open disk' : 'closed disk';
      return { q: 'The set $|' + inner + '| ' + rel + ' ' + r + '$ is a ' + what + '. Find its center (as a complex number) and its radius.',
        a: { t: 'multi', parts: [{ label: 'center:', a: { t: 'num', v: zplain(c) } }, { label: 'radius:', a: { t: 'num', v: String(r) } }] },
        steps: ['$|z - a|$ is the distance from $z$ to $a$.', 'Rewrite: $' + inner + ' = z - (' + ztex(c) + ')$.', 'So the set is the points at distance ' + (rel === '=' ? 'exactly' : rel === '<' ? 'less than' : 'at most') + ' $' + r + '$ from $' + ztex(c) + '$: center $' + ztex(c) + '$, radius $' + r + '$.'],
        hint: 'Write the inside as $z - a$; then $a$ is the center.', chk: { kind: kind } };
    }
    if (kind === 'member') {
      var c2 = zrand(R, -3, 3), r0 = R.int(1, 3), r1 = r0 + R.int(1, 3), w = zadd(c2, zrand(R, -4, 4)), d2 = dist2(w, c2), inside = d2.gt(r0 * r0) && d2.le(r1 * r1);
      return { q: 'Is $z_0 = ' + ztex(w) + '$ in the set $\\{z : ' + r0 + ' < |' + zm(c2) + '| \\le ' + r1 + '\\}$?', a: { t: 'tf', v: inside },
        steps: ['$z_0 - (' + ztex(c2) + ') = ' + ztex(zsub(w, c2)) + '$, so $|z_0 - (' + ztex(c2) + ')|^2 = ' + qt(d2) + '$.', 'The set needs $' + (r0 * r0) + ' < |z - (' + ztex(c2) + ')|^2 \\le ' + (r1 * r1) + '$ (square the bounds to avoid roots).', inside ? '$' + (r0 * r0) + ' < ' + qt(d2) + ' \\le ' + (r1 * r1) + '$: yes, $z_0$ is in the annulus.' : '$' + qt(d2) + '$ is not in that range: no.'],
        hint: 'Compute the distance from $z_0$ to the center and compare it with both radii.', chk: { kind: kind } };
    }
    if (kind === 'bisector') {
      var a = zrand(R, -4, 4), b; do { b = zrand(R, -4, 4); } while (zeq(a, b));
      var A = b.re.sub(a.re).mul(2), B = b.im.sub(a.im).mul(2), C = znorm(b).sub(znorm(a));
      var eqv = T.terms([[A, 'x'], [B, 'y']]) + ' = ' + qt(C), plainEq = (A.isZero() ? '' : qp(A) + '*x') + (B.isZero() ? '' : (A.isZero() ? '' : '+') + '(' + qp(B) + ')*y') + ' = ' + qp(C);
      return { q: 'The set $|' + zm(a) + '| = |' + zm(b) + '|$ is a line. Give its equation in terms of $x$ and $y$, where $z = x + iy$.',
        a: { t: 'eq', v: plainEq },
        steps: ['The points equally far from $' + ztex(a) + '$ and $' + ztex(b) + '$ form the perpendicular bisector of the segment between them.', 'Square both sides: $$' + sqv('x', a.re) + ' + ' + sqv('y', a.im) + ' = ' + sqv('x', b.re) + ' + ' + sqv('y', b.im) + '.$$', 'The $x^2$ and $y^2$ cancel, leaving $' + eqv + '$.'],
        hint: 'Square both sides; the squares of $x$ and $y$ cancel.', chk: { kind: kind, a: zplain(a), b: zplain(b), eq: plainEq } };
    }
    if (kind === 'apollo') {
      var bb = zrand(R, -3, 3), m = R.pick([Z(1), Z(-1), Z(0, 1), Z(0, -1), Z(2), Z(0, 2), Z(-2)]), aa = zadd(bb, zscale(3, m)), cen = zsub(bb, m), rad2 = 2 * Math.sqrt(qn(znorm(m)));
      return { q: 'The set $|' + zm(aa) + '| = 2\\,|' + zm(bb) + '|$ is a circle. Find its center and radius.',
        a: { t: 'multi', parts: [{ label: 'center:', a: { t: 'num', v: zplain(cen) } }, { label: 'radius:', a: { t: 'num', v: String(rad2) } }] },
        steps: ['Square: $|z - a|^2 = 4|z - b|^2$ with $a = ' + ztex(aa) + '$, $b = ' + ztex(bb) + '$. Expanding $|z - c|^2 = |z|^2 - 2\\operatorname{Re}(z\\overline{c}) + |c|^2$ on both sides gives $3|z|^2 - 2\\operatorname{Re}\\big(z\\,\\overline{(4b - a)}\\big) + 4|b|^2 - |a|^2 = 0$.', 'Divide by 3 and complete the square: $\\left|z - \\frac{4b - a}{3}\\right|^2 = \\left|\\frac{4b - a}{3}\\right|^2 - \\frac{4|b|^2 - |a|^2}{3}$.', 'Center $\\frac{4b - a}{3} = ' + ztex(cen) + '$; the right side works out to $' + rad2 * rad2 + '$, so the radius is $' + rad2 + '$.'],
        hint: 'Square both sides, collect $|z|^2$, and complete the square.', chk: { kind: kind, a: zplain(aa), b: zplain(bb), c: zplain(cen), r: rad2 } };
    }
    // classify a set
    var sets = [
      ['$\\{z : |z - 1| < 2\\}$', 'open, bounded and connected'], ['$\\{z : 1 \\le |z| \\le 2\\}$', 'closed, bounded and connected'], ['$\\{z : \\operatorname{Re} z > 1\\}$', 'open, not bounded, connected'],
      ['$\\{z : |z| < 1\\} \\cup \\{z : |z - 3| < 1\\}$', 'open and bounded, but not connected'], ['$\\{z : \\operatorname{Im} z \\ge 0\\}$', 'closed, not bounded, connected'], ['$\\{z : |z + 2i| \\le 3\\}$', 'closed, bounded and connected']];
    var pickS = R.pick(sets), wrongs = ['open, bounded and connected', 'closed, bounded and connected', 'open, not bounded, connected', 'open and bounded, but not connected', 'closed, not bounded, connected', 'neither open nor closed'].filter(function (x) { return x !== pickS[1]; });
    return { q: 'Which description fits the set ' + pickS[0] + '?', a: mcSpec(pickS[1], R.sample(wrongs, 3)),
      steps: ['Open: every point has a small disk around it inside the set (strict inequalities $<$, $>$ give open sets). Closed: the set contains its boundary ($\\le$, $\\ge$).', 'Bounded: it fits inside some large disk. Connected: any two points can be joined by a path inside the set.', 'This set is ' + pickS[1] + '.'],
      hint: 'Look at the inequalities ($<$ or $\\le$), then ask whether the set fits in a disk and whether it comes in one piece.', chk: { kind: 'type' } };
  });

  // ===================================================================== Unit 2: Complex Functions
  // u and v of a polynomial f(z) = Σ c_k z^k, as polynomials in x and y with rational coefficients
  function xyParts(p) { // -> { u: {"i,j": Q}, v: {...} } for x^i y^j
    var u = {}, v = {};
    function add(o, i, j, c) { var k = i + ',' + j; o[k] = (o[k] || Q(0)).add(c); }
    p.forEach(function (c, n) { // z^n = Σ C(n,k) x^(n−k) (iy)^k
      for (var k = 0; k <= n; k++) { var bin = Q(U.nCr(n, k)), ik = [Z(1), Z(0, 1), Z(-1), Z(0, -1)][k % 4], t = zmul(zscale(bin, ik), c); if (!t.re.isZero()) add(u, n - k, k, t.re); if (!t.im.isZero()) add(v, n - k, k, t.im); }
    });
    return { u: u, v: v };
  }
  function xyMono(i, j) { return (i ? 'x' + (i > 1 ? '^{' + i + '}' : '') : '') + (j ? 'y' + (j > 1 ? '^{' + j + '}' : '') : ''); }
  function xyTex(o) { var ks = Object.keys(o).filter(function (k) { return !o[k].isZero(); }).sort(function (a, b) { var A = a.split(',').map(Number), B = b.split(',').map(Number); return (B[0] + B[1]) - (A[0] + A[1]) || B[0] - A[0]; }); if (!ks.length) return '0'; return T.terms(ks.map(function (k) { var ij = k.split(',').map(Number); return [o[k], xyMono(ij[0], ij[1])]; })); }
  function xyPlain(o) { var s = []; Object.keys(o).forEach(function (k) { if (o[k].isZero()) return; var ij = k.split(',').map(Number); s.push('(' + o[k].toPlain() + ')' + (ij[0] ? '*x^' + ij[0] : '') + (ij[1] ? '*y^' + ij[1] : '')); }); return s.join('+') || '0'; }

  G('cplx.complex-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['uv', 'eval', 'uv'], ['uv', 'conjmix', 'iz', 'eval'], ['cubic', 'recip', 'back', 'uv']));
    if (kind === 'eval') {
      var p = P([zrand(R, -3, 3), zrand(R, -3, 3), Z(R.nz(-2, 2))]), z0 = zrand(R, -3, 3, true), w = pev(p, z0);
      return { q: 'Let $f(z) = ' + ptex(p) + '$. Find $f(' + ztex(z0) + ')$.', a: { t: 'num', v: zplain(w) },
        steps: ['$z^2 = (' + ztex(z0) + ')^2 = ' + ztex(zmul(z0, z0)) + '$.', 'The terms: $' + zcoef(p[2], 'z^2') + ' = ' + ztex(zmul(p[2], zmul(z0, z0))) + '$' + (zisz(p[1]) ? '' : ', $' + zcoef(p[1], 'z') + ' = ' + ztex(zmul(p[1], z0)) + '$') + (zisz(p[0]) ? '' : ' and the constant $' + ztex(p[0]) + '$') + '.', 'Add the real parts and the imaginary parts: $f(' + ztex(z0) + ') = ' + ztex(w) + '$.'],
        hint: 'Square $z$ first, then substitute and collect the $i$ terms.', chk: { kind: kind, f: pplain(p), z: zplain(z0), v: zplain(w) } };
    }
    if (kind === 'uv' || kind === 'iz' || kind === 'cubic' || kind === 'back') {
      var pp = kind === 'iz' ? P([0, 0, Z(0, R.pick([1, -1, 2]))]) : kind === 'cubic' ? P([0, Z(R.int(-3, 3)), 0, Z(R.pick([1, -1]))]) : P([zrand(R, -3, 3), zrand(R, -4, 4), Z(R.pick([1, 1, -1, 2]))]);
      if (kind === 'uv' && lvl(ctx) === 1) pp = P([0, Z(R.nz(-4, 4), R.nz(-4, 4)), 1]);
      var uv = xyParts(pp), which = kind === 'back' ? 'f' : R.pick(['u', 'v']);
      if (kind === 'back') return { q: 'An analytic polynomial $f(z)$ has real part $u = ' + xyTex(uv.u) + '$ and imaginary part $v = ' + xyTex(uv.v) + '$. Write $f$ as a polynomial in $z$.',
        a: { t: 'expr', v: pplain(pp), vars: ['z'] },
        steps: ['Put $y = 0$, so $z = x$: then $f(x) = u(x, 0) + iv(x, 0)$.', '$u(x, 0) = ' + xyTex(Object.keys(uv.u).filter(function (k) { return /,0$/.test(k); }).reduce(function (o, k) { o[k] = uv.u[k]; return o; }, {})) + '$ and $v(x, 0) = ' + xyTex(Object.keys(uv.v).filter(function (k) { return /,0$/.test(k); }).reduce(function (o, k) { o[k] = uv.v[k]; return o; }, {})) + '$.', 'Replace $x$ by $z$: $f(z) = ' + ptex(pp) + '$. (Expanding confirms it gives the $u$ and $v$ above.)'],
        hint: 'Set $y = 0$ to see $f$ on the real axis, then write $z$ for $x$.', chk: { kind: kind, f: pplain(pp), ans: pplain(pp) } };
      var ans = which === 'u' ? uv.u : uv.v;
      return { q: 'Write $f(z) = ' + ptex(pp) + '$ as $u + iv$ with $z = x + iy$. Find $' + which + '(x, y)$.', a: { t: 'expr', v: xyPlain(ans), vars: ['x', 'y'] },
        steps: [kind === 'cubic' ? '$z^3 = (x + iy)^3 = x^3 + 3x^2(iy) + 3x(iy)^2 + (iy)^3 = (x^3 - 3xy^2) + i(3x^2y - y^3)$.' : '$z^2 = (x + iy)^2 = x^2 - y^2 + 2ixy$.', 'Multiply out each term and collect: the real part is $u = ' + xyTex(uv.u) + '$.', 'The imaginary part is the real coefficient of $i$: $v = ' + xyTex(uv.v) + '$.'],
        hint: 'Expand with $z = x + iy$ and $i^2 = -1$; $v$ is what multiplies $i$, without the $i$.', chk: { kind: kind, f: pplain(pp), which: which, ans: xyPlain(ans) } };
    }
    if (kind === 'conjmix') {
      var a = R.nz(-4, 4), b = R.intNot(-4, 4, [0, a, -a]), wh = R.pick(['u', 'v']), u = {}, v = {}; u['1,0'] = Q(a + b); v['0,1'] = Q(a - b);
      return { q: 'Let $f(z) = ' + T.coef(a, 'z') + T.coef(b, '\\overline{z}', false) + '$. With $z = x + iy$, find $' + wh + '(x, y)$.', a: { t: 'expr', v: xyPlain(wh === 'u' ? u : v), vars: ['x', 'y'] },
        steps: ['$z = x + iy$ and $\\overline{z} = x - iy$.', '$' + T.coef(a, '(x + iy)') + T.coef(b, '(x - iy)', false) + ' = ' + T.mono(a + b, 'x') + ' + ' + T.p(T.mono(a - b, 'y')) + 'i$.', '$u = ' + T.mono(a + b, 'x') + '$ and $v = ' + T.mono(a - b, 'y') + '$.'],
        hint: 'Replace $\\overline{z}$ by $x - iy$.', chk: { kind: kind, a: a, b: b, which: wh, ans: xyPlain(wh === 'u' ? u : v) } };
    }
    // 1/z or 1/(z − c) with c real
    var cc = R.pick([0, 0, 1, -1, 2]), wv = R.pick(['u', 'v']), xs = cc === 0 ? 'x' : '(x' + (cc > 0 ? ' - ' + cc : ' + ' + (-cc)) + ')', xp = cc === 0 ? 'x' : '(x-(' + cc + '))';
    var ansP = wv === 'u' ? xp + '/(' + xp + '^2+y^2)' : '-y/(' + xp + '^2+y^2)';
    return { q: 'Let $f(z) = \\dfrac{1}{' + (cc === 0 ? 'z' : 'z ' + (cc > 0 ? '- ' + cc : '+ ' + (-cc))) + '}$. With $z = x + iy$, find $' + wv + '(x, y)$.', a: { t: 'expr', v: ansP, vars: ['x', 'y'] },
      steps: ['$' + (cc === 0 ? 'z' : 'z ' + (cc > 0 ? '- ' + cc : '+ ' + (-cc))) + ' = ' + xs + ' + iy$. Multiply the top and bottom by its conjugate $' + xs + ' - iy$.', '$f = \\dfrac{' + xs + ' - iy}{' + xs + '^2 + y^2}$.', '$u = \\dfrac{' + xs + '}{' + xs + '^2 + y^2}$ and $v = \\dfrac{-y}{' + xs + '^2 + y^2}$.'],
      hint: 'Multiply by the conjugate of the denominator.', chk: { kind: kind, c: cc, which: wv, ans: ansP } };
  });

  G('cplx.mappings', function (R, ctx) {
    var kind = R.pick(L(ctx, ['linpt', 'rotscale', 'linpt'], ['lindisk', 'sqray', 'inv', 'rotscale'], ['lindisk', 'sqsector', 'preimage', 'sqray']));
    if (kind === 'linpt') {
      var a = zrand(R, -3, 3, true), b = zrand(R, -4, 4), z0 = zrand(R, -3, 3), w = zadd(zmul(a, z0), b);
      return { q: 'Where does $w = ' + zcoef(a, 'z') + (zisz(b) ? '' : ' + ' + zpar(b)) + '$ send $z = ' + ztex(z0) + '$?', a: { t: 'num', v: zplain(w) },
        steps: ['$' + zpar(a) + zpar(z0) + ' = ' + ztex(zmul(a, z0)) + '$.', 'Add $' + ztex(b) + '$: $w = ' + ztex(w) + '$.'],
        hint: 'Multiply first, then add.', chk: { kind: kind, f: '(' + zplain(a) + ')*z+(' + zplain(b) + ')', z: zplain(z0), v: zplain(w) } };
    }
    if (kind === 'rotscale') {
      var opts = [[Z(0, 2), 2, Q(1, 2)], [Z(0, -3), 3, Q(-1, 2)], [Z(1, 1), 'sqrt(2)', Q(1, 4)], [Z(-1, 1), 'sqrt(2)', Q(3, 4)], [Z(-2), 2, Q(1)], [Z(2, -2), '2*sqrt(2)', Q(-1, 4)], [Z(0, 1), 1, Q(1, 2)], [Z(-3, -3), '3*sqrt(2)', Q(-3, 4)]], o = R.pick(opts), b2 = zrand(R, -3, 3);
      return { q: 'The map $w = ' + zcoef(o[0], 'z') + (zisz(b2) ? '' : ' + ' + zpar(b2)) + '$ turns the plane by an angle $\\theta$ (in $(-\\pi, \\pi]$), stretches it by a factor $k$ and shifts it. Find $\\theta$ and $k$.',
        a: { t: 'multi', parts: [{ label: '$\\theta =$', a: { t: 'num', v: piPlain(o[2]) } }, { label: '$k =$', a: { t: 'num', v: String(o[1]) } }] },
        steps: ['Multiplying by $a = ' + ztex(o[0]) + '$ multiplies every length by $|a|$ and adds $\\operatorname{Arg} a$ to every angle; adding a constant only shifts.', '$|a| = ' + T.plain(String(o[1])) + '$ and $\\operatorname{Arg} a = ' + piTex(o[2]) + '$.'],
        hint: 'Look only at the number that multiplies $z$.', chk: { kind: kind, a: zplain(o[0]), k: String(o[1]), th: qp(o[2]) } };
    }
    if (kind === 'lindisk') {
      var a3 = R.pick([Z(0, 2), Z(1, 1), Z(-3), Z(0, -1), Z(3, 4), Z(2)]), b3 = zrand(R, -3, 3), c3 = zrand(R, -2, 2), r3 = R.int(1, 3), cen = zadd(zmul(a3, c3), b3), rr = radNorm(r3, qn(znorm(a3)));
      return { q: 'Find the image of the disk $|' + zm(c3) + '| < ' + r3 + '$ under $w = ' + zcoef(a3, 'z') + (zisz(b3) ? '' : ' + ' + zpar(b3)) + '$: give the center and the radius of the image disk.',
        a: { t: 'multi', parts: [{ label: 'center:', a: { t: 'num', v: zplain(cen) } }, { label: 'radius:', a: { t: 'num', v: radPlain(rr.k, rr.n) } }] },
        steps: ['A map $w = az + b$ turns, stretches by $|a|$ and shifts, so disks go to disks: the center goes to the center.', 'Center: $' + zpar(a3) + zpar(c3) + (zisz(b3) ? '' : ' + ' + zpar(b3)) + ' = ' + ztex(cen) + '$.', 'Radius: $|a| \\cdot ' + r3 + ' = ' + absTex(a3) + ' \\cdot ' + r3 + ' = ' + radTex(rr.k, rr.n) + '$.'],
        hint: 'Send the center through the map; multiply the radius by $|a|$.', chk: { kind: kind, a: zplain(a3), b: zplain(b3), c: zplain(c3), r: r3, cen: zplain(cen), rad: radPlain(rr.k, rr.n) } };
    }
    if (kind === 'sqray') {
      var k = R.pick([Q(1, 6), Q(1, 3), Q(1, 4), Q(2, 3), Q(-1, 3), Q(-1, 4), Q(3, 4), Q(-5, 6)]), rr2 = R.int(2, 4), ray = R.coin(), dbl = princ(k.mul(2));
      if (ray) return { q: 'Under $w = z^2$, the ray $\\arg z = ' + piTex(k) + '$ (from $0$ outward) goes to the ray $\\arg w = \\theta$. Find $\\theta$ in $(-\\pi, \\pi]$.', a: { t: 'num', v: piPlain(dbl) },
        steps: ['With $z = re^{i\\varphi}$, $z^2 = r^2e^{2i\\varphi}$: lengths are squared and angles doubled.', '$2 \\cdot ' + piTex(k) + ' = ' + piTex(k.mul(2)) + (k.mul(2).eq(dbl) ? '' : ' \\equiv ' + piTex(dbl)) + '$.'],
        hint: 'Squaring doubles the angle.', chk: { kind: kind, k: qp(k), v: qp(dbl) } };
      return { q: 'Under $w = z^2$, the circle $|z| = ' + rr2 + '$ goes to a circle $|w| = R$. Find $R$, and say how many times the image circle is traced as $z$ goes once around.',
        a: { t: 'multi', parts: [{ label: '$R =$', a: { t: 'num', v: String(rr2 * rr2) } }, { label: 'times traced:', a: { t: 'num', v: '2' } }] },
        steps: ['$|z^2| = |z|^2 = ' + (rr2 * rr2) + '$.', 'The angle doubles, so as $\\arg z$ runs from $0$ to $2\\pi$, $\\arg w$ runs from $0$ to $4\\pi$: twice around.'],
        hint: 'Square the length; double the angle.', chk: { kind: 'sqcircle', r: rr2 } };
    }
    if (kind === 'sqsector') {
      var al = R.pick([Q(1, 2), Q(1, 4), Q(1, 3), Q(1, 6)]), n = R.pick([2, 2, 3]), img = al.mul(n);
      if (img.gt(2)) { n = 2; img = al.mul(2); }
      var secText = function (g) { return g.eq(1) ? 'the upper half-plane' : g.eq(Q(1, 2)) ? 'the first quadrant' : 'the sector $0 < \\arg w < ' + piTex(g) + '$'; }, correct = secText(img);
      var wrong = [al, al.mul(n + 1), al.mul(2 * n), al.div(n), Q(1, 2), Q(1)].filter(function (g) { return !g.eq(img) && g.le(Q(3, 2)); }).map(secText).filter(function (x, i, A) { return A.indexOf(x) === i; }).concat(['the right half-plane']);
      return { q: 'What is the image of the open sector $0 < \\arg z < ' + piTex(al) + '$ under $w = z^{' + n + '}$?', a: mcSpec(correct, R.sample(wrong, 3)),
        steps: ['$z^{' + n + '}$ multiplies every angle by $' + n + '$ and raises every length to the power $' + n + '$ (all lengths $r > 0$ are still reached).', 'The angles $0$ to $' + piTex(al) + '$ become $0$ to $' + piTex(img) + '$.', 'So the image is ' + correct + '.'],
        hint: 'Multiply the angle bounds by the power.', chk: { kind: kind } };
    }
    if (kind === 'inv') {
      var r4 = R.int(2, 5), z4 = zrand(R, -3, 3, true), circ = R.coin();
      if (circ) return { q: 'Under $w = \\dfrac{1}{z}$, the circle $|z| = ' + r4 + '$ goes to a circle $|w| = R$. Find $R$.', a: { t: 'num', v: '1/' + r4 },
        steps: ['$|1/z| = 1/|z|$.', 'So $|w| = \\frac{1}{' + r4 + '}$: points far out come close in, and the inside of the circle goes to the outside.'],
        hint: '$|1/z| = 1/|z|$.', chk: { kind: 'invcircle', r: r4 } };
      var w4 = zdiv(Z1, z4);
      return { q: 'Where does $w = \\dfrac{1}{z}$ send $z = ' + ztex(z4) + '$?', a: { t: 'num', v: zplain(w4) },
        steps: ['$\\dfrac{1}{z} = \\dfrac{\\overline{z}}{|z|^2}$.', '$\\overline{z} = ' + ztex(zconj(z4)) + '$ and $|z|^2 = ' + qt(znorm(z4)) + '$, so $w = ' + ztex(w4) + '$.', 'Its length is $1/|z|$ and its angle is $-\\arg z$: inversion in the unit circle followed by a reflection in the real axis.'],
        hint: 'Multiply the top and bottom by the conjugate.', chk: { kind: kind, z: zplain(z4), v: zplain(w4) } };
    }
    // preimage under z^2
    var z5 = zrand(R, -3, 3, true), w5 = zmul(z5, z5);
    return { q: 'Find all $z$ with $z^2 = ' + ztex(w5) + '$. (Both answers are of the form $a + bi$ with whole numbers $a$ and $b$.)', a: { t: 'set', v: [zplain(z5), zplain(zneg(z5))] },
      steps: ['Write $z = a + bi$: $z^2 = (a^2 - b^2) + 2abi$.', 'Match parts: $a^2 - b^2 = ' + qt(w5.re) + '$ and $2ab = ' + qt(w5.im) + '$. Also $|z|^2 = |w|$: $a^2 + b^2 = \\sqrt{' + qt(znorm(w5)) + '} = ' + qt(znorm(z5)) + '$.', 'Adding and subtracting: $a^2 = ' + qt(z5.re.mul(z5.re)) + '$, $b^2 = ' + qt(z5.im.mul(z5.im)) + '$, with $ab$ ' + (w5.im.sign() > 0 ? 'positive' : 'negative') + '.', '$z = \\pm(' + ztex(z5) + ')$: $z^2$ is two-to-one, so every nonzero $w$ has two square roots.'],
      hint: 'Use $a^2 - b^2$, $2ab$ and $a^2 + b^2 = |w|$.', chk: { kind: kind, w: zplain(w5) } };
  });

  G('cplx.complex-limits', function (R, ctx) {
    var kind = R.pick(L(ctx, ['poly', 'removable', 'poly'], ['removable', 'path', 'path'], ['dne', 'contin', 'path', 'dne']));
    if (kind === 'poly') {
      var p = P([zrand(R, -3, 3), zrand(R, -3, 3), Z(R.nz(-2, 2))]), z0 = zrand(R, -2, 2, true), w = pev(p, z0);
      return { q: 'Find $\\displaystyle\\lim_{z \\to ' + ztex(z0) + '} \\left(' + ptex(p) + '\\right)$.', a: { t: 'num', v: zplain(w) },
        steps: ['Polynomials are continuous, so the limit is the value at $' + ztex(z0) + '$.', '$(' + ztex(z0) + ')^2 = ' + ztex(zmul(z0, z0)) + '$; substituting gives $' + ztex(w) + '$.'],
        hint: 'Substitute: polynomials are continuous.', chk: { kind: kind, f: pplain(p), z: zplain(z0), v: zplain(w) } };
    }
    if (kind === 'removable' || kind === 'contin') {
      var a = zrand(R, -3, 3, true), b = zrand(R, -3, 3), num = pmul(plin(a), plin(b)), val = zsub(a, b), shape = R.coin();
      if (kind === 'contin') return { q: 'Let $f(z) = \\dfrac{' + ptex(num) + '}{' + zm(a) + '}$ for $z \\ne ' + ztex(a) + '$. What value should $f(' + ztex(a) + ')$ have to make $f$ continuous at $' + ztex(a) + '$?', a: { t: 'num', v: zplain(val) },
        steps: ['Factor the top: $' + ptex(num) + ' = (' + zm(a) + ')(' + zm(b) + ')$.', 'For $z \\ne ' + ztex(a) + '$, $f(z) = ' + zm(b) + '$, which tends to $' + ztex(a) + (zisz(b) ? '' : ' - ' + zpar(b)) + ' = ' + ztex(val) + '$.', 'Define $f(' + ztex(a) + ') = ' + ztex(val) + '$.'],
        hint: 'Factor and cancel, then take the limit.', chk: { kind: kind, f: '(' + pplain(num) + ')/(z-(' + zplain(a) + '))', a: zplain(a), v: zplain(val) } };
      return { q: 'Find $\\displaystyle\\lim_{z \\to ' + ztex(a) + '} \\frac{' + ptex(num) + '}{' + zm(a) + '}$.', a: { t: 'num', v: zplain(val) },
        steps: ['Substituting gives $\\frac{0}{0}$, so $z = ' + ztex(a) + '$ is a root of the top: factor it out.', '$' + ptex(num) + ' = (' + zm(a) + ')(' + zm(b) + ')$.', 'Cancel (allowed, since $z \\ne ' + ztex(a) + '$ in the limit): the limit is $' + ztex(a) + (zisz(b) ? '' : ' - ' + zpar(b)) + ' = ' + ztex(val) + '$.'],
        hint: 'The top has the factor $' + zm(a) + '$.', chk: { kind: kind, f: '(' + pplain(num) + ')/(z-(' + zplain(a) + '))', a: zplain(a), v: zplain(val) } };
    }
    if (kind === 'path') {
      var m = R.pick([1, 2, 3, -1, -2, Q(1, 2), Q(-1, 3)]), fq = R.pick(['zbar/z', 'z/zbar']); m = q(m);
      var one = Z(1, m), r = fq === 'zbar/z' ? zdiv(zconj(one), one) : zdiv(one, zconj(one));
      return { q: 'Let $f(z) = ' + (fq === 'zbar/z' ? '\\dfrac{\\overline{z}}{z}' : '\\dfrac{z}{\\overline{z}}') + '$. As $z \\to 0$ along the line $y = ' + T.mono(m, 'x') + '$, what value does $f(z)$ approach?', a: { t: 'num', v: zplain(r) },
        steps: ['On the line, $z = x + iy$ with $y = ' + T.mono(m, 'x') + '$, so $z = x(' + ztex(one) + ')$.', '$\\overline{z} = x(' + ztex(zconj(one)) + ')$; the $x$ cancels: $f = ' + (fq === 'zbar/z' ? '\\dfrac{' + ztex(zconj(one)) + '}{' + ztex(one) + '}' : '\\dfrac{' + ztex(one) + '}{' + ztex(zconj(one)) + '}') + ' = ' + ztex(r) + '$.', 'The value depends on the line ($1$ along the real axis), so $\\lim_{z \\to 0} f(z)$ does not exist.'],
        hint: 'Put $z = x(1 + mi)$ and cancel $x$.', chk: { kind: kind, which: fq, m: qp(m), v: zplain(r) } };
    }
    // does the limit exist? (type the value or DNE)
    var cases = [['\\dfrac{\\overline{z}^{2}}{z}', '0', 'Use the modulus: $|f(z)| = \\frac{|z|^2}{|z|} = |z| \\to 0$, so $f(z) \\to 0$ along every path.'],
      ['\\dfrac{\\overline{z}}{z}', 'DNE', 'Along the real axis $f = 1$; along the imaginary axis $f = \\frac{-iy}{iy} = -1$. Two paths, two values: the limit does not exist.'],
      ['\\dfrac{\\operatorname{Re} z}{z}', 'DNE', 'Along the real axis $f = \\frac{x}{x} = 1$; along the imaginary axis $f = \\frac{0}{iy} = 0$: no limit.'],
      ['\\dfrac{z\\operatorname{Re} z}{|z|}', '0', '$|f(z)| = \\frac{|z|\\,|x|}{|z|} = |x| \\le |z| \\to 0$, so the limit is $0$.'],
      ['\\dfrac{z^{2}}{|z|^{2}}', 'DNE', 'Along the real axis $f = 1$; along $y = x$, $z^2 = 2ix^2$ and $|z|^2 = 2x^2$, so $f = i$. No limit.'],
      ['\\dfrac{|z|^{2}}{z}', '0', '$|f(z)| = \\frac{|z|^2}{|z|} = |z| \\to 0$.']], cs = R.pick(cases);
    return { q: 'Find $\\displaystyle\\lim_{z \\to 0} ' + cs[0] + '$, or type DNE if the limit does not exist.', a: { t: 'num', v: cs[1] },
      steps: ['A complex limit must give the same value along every path to $0$, from every direction.', cs[2]],
      hint: 'Try the real axis and the imaginary axis; if they agree, bound $|f(z)|$.', chk: { kind: 'dne', v: cs[1] } };
  });

  // ===================================================================== Unit 3: Analytic Functions
  G('cplx.complex-derivative', function (R, ctx) {
    var kind = R.pick(L(ctx, ['limdef', 'poly', 'poly'], ['quot', 'diffq', 'which', 'poly'], ['chain', 'diffq', 'quot', 'which']));
    if (kind === 'limdef') {
      var z0 = zrand(R, -3, 3, true), c = Z(R.pick([1, 2, 3, -1])), d = zscale(2, zmul(c, z0));
      return { q: 'For $f(z) = ' + zcoef(c, 'z^2') + '$, the difference quotient at $z_0 = ' + ztex(z0) + '$ simplifies to $\\dfrac{f(z_0 + h) - f(z_0)}{h} = ' + T.coef(c.re.mul(2), 'z_0') + T.coef(c.re, 'h', false) + '$. Find $f\'(z_0)$.', a: { t: 'num', v: zplain(d) },
        steps: ['$f(z_0 + h) - f(z_0) = ' + (c.re.eq(1) ? '' : c.re.eq(-1) ? '-' : qt(c.re)) + (c.re.eq(1) ? '' : '\\big(') + '2z_0h + h^2' + (c.re.eq(1) ? '' : '\\big)') + '$; dividing by $h$ leaves $' + T.coef(c.re.mul(2), 'z_0') + T.coef(c.re, 'h', false) + '$.', 'As $h \\to 0$ from any direction, the $h$ term vanishes: $f\'(z_0) = ' + T.coef(c.re.mul(2), 'z_0') + ' = ' + ztex(d) + '$.'],
        hint: 'Let $h \\to 0$; nothing depends on the direction.', chk: { kind: kind, f: zplain(c) + '*z^2', z: zplain(z0), v: zplain(d) } };
    }
    if (kind === 'poly') {
      var p = P([0, zrand(R, -3, 3), Z(R.int(-3, 3)), Z(R.nz(-2, 2))]), z1 = zrand(R, -2, 2, true), dp = pder(p), v = pev(dp, z1);
      return { q: 'Let $f(z) = ' + ptex(p) + '$. Find $f\'(' + ztex(z1) + ')$.', a: { t: 'num', v: zplain(v) },
        steps: ['The power rule holds for complex derivatives (the same limit computation as in real calculus): $f\'(z) = ' + ptex(dp) + '$.', '$(' + ztex(z1) + ')^2 = ' + ztex(zmul(z1, z1)) + '$.', 'Substitute: $f\'(' + ztex(z1) + ') = ' + ztex(v) + '$.'],
        hint: 'Differentiate term by term, then substitute.', chk: { kind: kind, f: pplain(p), z: zplain(z1), v: zplain(v) } };
    }
    if (kind === 'quot') {
      var a = zrand(R, -3, 3), b = zrand(R, -3, 3), z2; do { z2 = zrand(R, -3, 3); } while (zeq(z2, b));
      if (zeq(a, zneg(b))) a = zadd(a, Z1); // keep f nonconstant: f = (z + a)/(z − b)
      var dv = zdiv(zneg(zadd(a, b)), zmul(zsub(z2, b), zsub(z2, b))), top = zm(zneg(a)), bot = zm(b);
      return { q: 'Let $f(z) = \\dfrac{' + top + '}{' + bot + '}$. Find $f\'(' + ztex(z2) + ')$.', a: { t: 'num', v: zplain(dv) },
        steps: ['Quotient rule: $f\'(z) = \\dfrac{(' + bot + ') - (' + top + ')}{(' + bot + ')^2} = \\dfrac{' + ztex(zneg(zadd(a, b))) + '}{(' + bot + ')^2}$.', 'At $z = ' + ztex(z2) + '$: $' + bot.replace('z', '(' + ztex(z2) + ')') + ' = ' + ztex(zsub(z2, b)) + '$, squared: $' + ztex(zmul(zsub(z2, b), zsub(z2, b))) + '$.', '$f\'(' + ztex(z2) + ') = ' + ztex(dv) + '$.'],
        hint: 'Use the quotient rule; the numerator simplifies to a constant.', chk: { kind: kind, f: '(' + 'z+(' + zplain(a) + '))/(z-(' + zplain(b) + '))', z: zplain(z2), v: zplain(dv) } };
    }
    if (kind === 'diffq') {
      var which = R.pick(['conj', 'abs2']), x0 = R.nz(-3, 3), y0 = R.nz(-3, 3), z3 = Z(x0, y0);
      if (which === 'conj') return { q: 'For $f(z) = \\overline{z}$, compute the difference quotient $\\dfrac{f(z_0 + h) - f(z_0)}{h}$ when $h$ is real, and when $h = it$ is purely imaginary.',
        a: { t: 'multi', parts: [{ label: '$h$ real:', a: { t: 'num', v: '1' } }, { label: '$h = it$:', a: { t: 'num', v: '-1' } }] },
        steps: ['$f(z_0 + h) - f(z_0) = \\overline{h}$, so the quotient is $\\dfrac{\\overline{h}}{h}$.', 'Real $h$: $\\overline{h} = h$, quotient $1$. Imaginary $h = it$: $\\overline{h} = -it$, quotient $-1$.', 'The two directions disagree, so $\\overline{z}$ has no complex derivative anywhere, even though it is as smooth as can be in $x$ and $y$.'],
        hint: 'The quotient is $\\overline{h}/h$.', chk: { kind: 'conj' } };
      return { q: 'For $f(z) = |z|^2$ at $z_0 = ' + ztex(z3) + '$, the difference quotient tends to one value as $h \\to 0$ along the real axis and another along the imaginary axis ($h = it$). Find both.',
        a: { t: 'multi', parts: [{ label: 'real $h$:', a: { t: 'num', v: String(2 * x0) } }, { label: '$h = it$:', a: { t: 'num', v: zplain(Z(0, -2 * y0)) } }] },
        steps: ['$|z_0 + h|^2 - |z_0|^2 = z_0\\overline{h} + \\overline{z_0}h + |h|^2$, so the quotient is $z_0\\dfrac{\\overline{h}}{h} + \\overline{z_0} + \\dfrac{|h|^2}{h}$.', 'Real $h$: $z_0 + \\overline{z_0} = 2x_0 = ' + (2 * x0) + '$ in the limit.', 'Imaginary $h$: $-z_0 + \\overline{z_0} = -2iy_0 = ' + ztex(Z(0, -2 * y0)) + '$. They differ (unless $z_0 = 0$), so $|z|^2$ is not complex differentiable at $z_0$.'],
        hint: 'Expand $|z_0 + h|^2 = (z_0 + h)(\\overline{z_0} + \\overline{h})$.', chk: { kind: 'abs2', z: zplain(z3), a: String(2 * x0), b: zplain(Z(0, -2 * y0)) } };
    }
    if (kind === 'which') {
      var good = R.pick(['$z^{3} - 2iz$', '$e^{z}$', '$(1 + i)z^{2} + 5$', '$z^{4} + \\overline{1 + i}\\,z$']), bad = ['$\\overline{z}$', '$|z|^{2}$', '$\\operatorname{Re} z$', '$x + 2iy$', '$z\\overline{z} + z$', '$\\operatorname{Im} z + iz$'];
      return { q: 'Which function is complex differentiable at every point of the plane?', a: mcSpec(good, R.sample(bad, 3)),
        steps: ['Polynomials in $z$ (and $e^z$) are differentiable everywhere, by the same rules as in real calculus.', 'Anything that needs $\\overline{z}$, or treats $x$ and $y$ differently, fails the test: its difference quotient depends on the direction of $h$.', 'The answer is ' + good + '.' + (good.indexOf('overline') >= 0 ? ' Here $\\overline{1 + i} = 1 - i$ is just a constant.' : '')],
        hint: 'Look for a formula that uses only $z$, not $\\overline{z}$, $x$ or $y$ separately.', chk: { kind: kind } };
    }
    // chain rule
    var c2 = Z(R.pick([1, 2, -1])), d2 = zrand(R, -2, 2), n = R.int(2, 4), z4 = zrand(R, -1, 1, true), inner = zadd(zmul(c2, zmul(z4, z4)), d2), outer = zpow(inner, n - 1), dv2 = zmul(zmul(Z(n), outer), zmul(zscale(2, c2), z4));
    var inP = P([d2, 0, c2]);
    return { q: 'Let $f(z) = \\left(' + ptex(inP) + '\\right)^{' + n + '}$. Find $f\'(' + ztex(z4) + ')$.', a: { t: 'num', v: zplain(dv2) },
      steps: ['Chain rule: $f\'(z) = ' + n + '\\left(' + ptex(inP) + '\\right)^{' + (n - 1) + '} \\cdot ' + zcoef(zscale(2, c2), 'z') + '$.', 'At $z = ' + ztex(z4) + '$: the inside is $' + ztex(inner) + '$, and $(' + ztex(inner) + ')^{' + (n - 1) + '} = ' + ztex(outer) + '$.', '$f\'(' + ztex(z4) + ') = ' + n + ' \\cdot ' + zpar(outer) + ' \\cdot ' + zpar(zmul(zscale(2, c2), z4)) + ' = ' + ztex(dv2) + '$.'],
      hint: 'Outside derivative times inside derivative.', chk: { kind: kind, f: '((' + zplain(c2) + ')*z^2+(' + zplain(d2) + '))^' + n, z: zplain(z4), v: zplain(dv2) } };
  });

  G('cplx.cauchy-riemann', function (R, ctx) {
    var kind = R.pick(L(ctx, ['coef', 'check', 'coef'], ['coef3', 'deriv', 'check'], ['where', 'deriv', 'coef3', 'where']));
    if (kind === 'coef') {
      var a = R.nz(-4, 4), b = R.nz(-3, 3);
      return { q: 'For which constants $p$ and $q$ is $f = (x^2 - y^2' + T.coef(a, 'x', false) + ') + i(pxy + qy' + T.coef(b, '', false) + ')$ complex differentiable everywhere?',
        a: { t: 'multi', parts: [{ label: '$p =$', a: { t: 'num', v: '2' } }, { label: '$q =$', a: { t: 'num', v: String(a) } }] },
        steps: ['$u_x = 2x ' + (a < 0 ? '- ' + (-a) : '+ ' + a) + '$ and $v_y = px + q$: the first equation $u_x = v_y$ needs $p = 2$ and $q = ' + a + '$.', '$u_y = -2y$ and $v_x = py$: the second equation $u_y = -v_x$ needs $-2y = -py$, so $p = 2$ again.', 'With $p = 2$, $q = ' + a + '$ both equations hold everywhere (the partials are continuous): $f = z^2' + T.coef(a, 'z', false) + zcoef(Z(0, b), '', false) + '$.'],
        hint: 'Match $u_x$ with $v_y$, and $u_y$ with $-v_x$.', chk: { kind: kind, a: a } };
    }
    if (kind === 'coef3') {
      return { q: 'For which constants $p$ and $q$ do $u = x^3 + pxy^2$ and $v = qx^2y - y^3$ satisfy the Cauchy–Riemann equations everywhere?',
        a: { t: 'multi', parts: [{ label: '$p =$', a: { t: 'num', v: '-3' } }, { label: '$q =$', a: { t: 'num', v: '3' } }] },
        steps: ['$u_x = 3x^2 + py^2$ and $v_y = qx^2 - 3y^2$. Equal for all $x, y$: $q = 3$ and $p = -3$.', '$u_y = 2pxy$ and $v_x = 2qxy$. The second equation $u_y = -v_x$ needs $p = -q$, which $p = -3$, $q = 3$ satisfy.', 'Then $u + iv = z^3$.'],
        hint: 'Compare the coefficients of $x^2$ and of $y^2$ in $u_x = v_y$.', chk: { kind: kind } };
    }
    if (kind === 'deriv') {
      var p = P([zrand(R, -3, 3), zrand(R, -3, 3), Z(R.pick([1, -1, 2]))]), uv = xyParts(p), z0 = zrand(R, -2, 2, true), d = pev(pder(p), z0);
      var ux = {}, vx = {}; Object.keys(uv.u).forEach(function (k) { var ij = k.split(',').map(Number); if (ij[0]) ux[(ij[0] - 1) + ',' + ij[1]] = uv.u[k].mul(ij[0]); }); Object.keys(uv.v).forEach(function (k) { var ij = k.split(',').map(Number); if (ij[0]) vx[(ij[0] - 1) + ',' + ij[1]] = uv.v[k].mul(ij[0]); });
      return { q: 'The function $f = u + iv$ with $u = ' + xyTex(uv.u) + '$ and $v = ' + xyTex(uv.v) + '$ is analytic. Use $f\' = u_x + iv_x$ to find $f\'(' + ztex(z0) + ')$.', a: { t: 'num', v: zplain(d) },
        steps: ['$u_x = ' + xyTex(ux) + '$ and $v_x = ' + xyTex(vx) + '$.', 'At $x = ' + qt(z0.re) + '$, $y = ' + qt(z0.im) + '$: $u_x = ' + qt(d.re) + '$ and $v_x = ' + qt(d.im) + '$.', '$f\'(' + ztex(z0) + ') = ' + ztex(d) + '$.'],
        hint: 'Differentiate $u$ and $v$ with respect to $x$ only.', chk: { kind: kind, f: pplain(p), z: zplain(z0), v: zplain(d) } };
    }
    if (kind === 'check') {
      var cs = [['$e^{x}(\\cos y + i\\sin y)$', true, '$u_x = e^x\\cos y = v_y$ and $u_y = -e^x\\sin y = -v_x$. Both hold: this is $e^z$.'],
        ['$e^{x}(\\cos y - i\\sin y)$', false, '$u_x = e^x\\cos y$ but $v_y = -e^x\\cos y$. They differ wherever $\\cos y \\ne 0$; in fact this is $e^{\\overline{z}}$.'],
        ['$x^2 - y^2 - 2ixy$', false, '$u_x = 2x$ but $v_y = -2x$: equal only when $x = 0$; and $u_y = -2y$, $-v_x = 2y$: equal only when $y = 0$. Only at $0$, so not analytic: this is $\\overline{z}^2$.'],
        ['$x^3 - 3xy^2 + i(3x^2y - y^3)$', true, '$u_x = 3x^2 - 3y^2 = v_y$ and $u_y = -6xy = -v_x$: this is $z^3$.'],
        ['$x^2 + y^2$', false, '$u_x = 2x$, $v_y = 0$; $u_y = 2y$, $v_x = 0$. Both hold only at $x = y = 0$: differentiable at one point, analytic nowhere.'],
        ['$2x + 3iy$', false, '$u_x = 2$ but $v_y = 3$.'],
        ['$\\cos x\\cosh y - i\\sin x\\sinh y$', true, '$u_x = -\\sin x\\cosh y = v_y$ and $u_y = \\cos x\\sinh y = -v_x$: this is $\\cos z$.']], c = R.pick(cs);
      return { q: 'Is $f = ' + c[0].slice(1) + ' analytic on the whole plane (that is, do the Cauchy–Riemann equations $u_x = v_y$, $u_y = -v_x$ hold everywhere)?', a: { t: 'tf', v: c[1] },
        steps: [c[2]], hint: 'Compute the four partial derivatives and compare.', chk: { kind: kind } };
    }
    // where: f = a x^2 + i b y^2 is differentiable exactly on the line a x = b y
    var a2 = R.nz(-3, 3), b2 = R.intNot(-3, 3, [0, a2]), plainEq = a2 + '*x = ' + b2 + '*y';
    return { q: 'Let $f = u + iv$ with $u = ' + T.mono(a2, 'x^2') + '$ and $v = ' + T.mono(b2, 'y^2') + '$. The Cauchy–Riemann equations hold only on a line. Give its equation.', a: { t: 'eq', v: plainEq },
      steps: ['$u = ' + T.mono(a2, 'x^2') + '$, $v = ' + T.mono(b2, 'y^2') + '$: $u_x = ' + T.mono(2 * a2, 'x') + '$, $v_y = ' + T.mono(2 * b2, 'y') + '$, and $u_y = 0 = -v_x$.', 'So the equations hold exactly where $' + T.mono(2 * a2, 'x') + ' = ' + T.mono(2 * b2, 'y') + '$, the line $' + T.mono(a2, 'x') + ' = ' + T.mono(b2, 'y') + '$.', '$f$ is complex differentiable at each point of that line, but analytic nowhere: a line contains no open disk.'],
      hint: 'Set $u_x = v_y$ and $u_y = -v_x$ and see what is left.', chk: { kind: kind, a: a2, b: b2, eq: plainEq } };
  });

  G('cplx.analytic-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['exclude', 'entire', 'exclude'], ['exclude2', 'quot', 'entire'], ['expzeros', 'exclude2', 'quot']));
    if (kind === 'exclude' || kind === 'exclude2') {
      var rs; if (kind === 'exclude') { var b = R.int(1, 4); rs = [Z(0, b), Z(0, -b)]; } else if (R.coin()) { var p = R.nz(-3, 3), qq = R.int(1, 3); rs = [Z(p, qq), Z(p, -qq)]; } else { var n = R.int(1, 3); rs = [Z0, Z(n), Z(-n)]; }
      var den = pfromRoots(rs), top = R.pick(['z + 1', 'e^{z}', 'z^{2} - 3', '\\sin z', '5']);
      return { q: 'At which points is $f(z) = \\dfrac{' + top + '}{' + ptex(den) + '}$ not analytic? List them.', a: { t: 'set', v: rs.map(zplain) },
        steps: ['The top is entire, and a quotient of analytic functions is analytic wherever the bottom is not zero.', 'Solve $' + ptex(den) + ' = 0$: ' + (rs.length === 2 ? 'the quadratic formula (or completing the square) gives' : 'factor out $z$:') + ' $z = ' + rs.map(ztex).join(',\\ ') + '$.', 'So $f$ fails to be analytic exactly at $' + rs.map(ztex).join(',\\ ') + '$.'],
        hint: 'Find the zeros of the denominator, including complex ones.', chk: { kind: kind, den: pplain(den), roots: rs.map(zplain) } };
    }
    if (kind === 'entire') {
      var good = R.pick(['$z^{5} - iz + 2$', '$e^{z}\\cos z$', '$e^{z^{2}}$', '$\\sin(3z) + z$']), bad = ['$\\dfrac{1}{z^{2} + 1}$', '$\\overline{z}$', '$\\operatorname{Log} z$', '$\\dfrac{z}{e^{z} - 1}$', '$|z|$', '$\\tan z$'];
      return { q: 'A function is <b>entire</b> when it is analytic on the whole plane. Which of these is entire?', a: mcSpec(good, R.sample(bad, 3)),
        steps: ['Polynomials, $e^z$, $\\sin z$ and $\\cos z$ are entire, and so are their sums, products and compositions.', 'Quotients fail at the zeros of the bottom ($\\tan z = \\frac{\\sin z}{\\cos z}$ at the zeros of $\\cos z$), $\\operatorname{Log} z$ fails on its cut, and $\\overline{z}$, $|z|$ are not differentiable at all.', 'The entire one is ' + good + '.'],
        hint: 'Look for a quotient, a conjugate or a logarithm.', chk: { kind: kind } };
    }
    if (kind === 'quot') {
      var a = Z(R.nz(-3, 3)), c = zrand(R, -2, 2), z0; do { z0 = zrand(R, -2, 2, true); } while (zeq(z0, c));
      var num = P([a, 0, 1]), den = plin(c), N0 = pev(num, z0), D0 = zsub(z0, c), dv = zdiv(zsub(zmul(pev(pder(num), z0), D0), N0), zmul(D0, D0));
      return { q: 'Let $f(z) = \\dfrac{' + ptex(num) + '}{' + zm(c) + '}$, analytic for $z \\ne ' + ztex(c) + '$. Find $f\'(' + ztex(z0) + ')$.', a: { t: 'num', v: zplain(dv) },
        steps: ['Quotient rule: $f\' = \\dfrac{2z(' + zm(c) + ') - (' + ptex(num) + ')}{(' + zm(c) + ')^2}$.', 'At $z = ' + ztex(z0) + '$: $2z = ' + ztex(zscale(2, z0)) + '$, $' + zm(c).replace('z', '(z)') + ' = ' + ztex(D0) + '$, and the top of $f$ is $' + ztex(N0) + '$.', 'Numerator: $' + zpar(zscale(2, z0)) + zpar(D0) + ' - ' + zpar(N0) + ' = ' + ztex(zsub(zmul(zscale(2, z0), D0), N0)) + '$; denominator: $' + zpar(D0) + '^2 = ' + ztex(zmul(D0, D0)) + '$.', '$f\'(' + ztex(z0) + ') = ' + ztex(dv) + '$.'],
        hint: 'The quotient rule is the same as for real functions.', chk: { kind: kind, f: '(' + pplain(num) + ')/(z-(' + zplain(c) + '))', z: zplain(z0), v: zplain(dv) } };
    }
    // zeros of e^z − 1 or e^z + 1 in a strip
    var plus = R.coin(), lo = R.pick([-1, 0, 1]), hi = lo + R.int(2, 3), vals = [];
    for (var k = -6; k <= 6; k++) { var y = plus ? 2 * k + 1 : 2 * k; if (y > 2 * lo && y <= 2 * hi) vals.push(y); }
    return { q: 'Where in the strip $' + piTex(2 * lo) + ' < \\operatorname{Im} z \\le ' + piTex(2 * hi) + '$ is $f(z) = \\dfrac{1}{e^{z} ' + (plus ? '+' : '-') + ' 1}$ not analytic? List the points.', a: { t: 'set', v: vals.map(function (y) { return y === 0 ? '0' : piPlain(y) + '*i'; }) },
      steps: ['$f$ fails exactly where $e^z = ' + (plus ? '-1' : '1') + '$.', '$|e^z| = e^x = 1$ forces $x = 0$; then $e^{iy} = ' + (plus ? '-1' : '1') + '$ forces $y = ' + (plus ? '\\pi + 2\\pi k' : '2\\pi k') + '$.', 'In the strip: $z = ' + vals.map(function (y) { return y === 0 ? '0' : piTex(y) + ' i'; }).join(',\\ ') + '$.'],
      hint: 'Solve $e^z = ' + (plus ? '-1' : '1') + '$: the modulus gives $x$, the angle gives $y$.', chk: { kind: kind, plus: plus, vals: vals } };
  });

  G('cplx.harmonic-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['lap', 'k', 'lap'], ['conj', 'k', 'conj'], ['conj3', 'fz', 'exp', 'conj']));
    if (kind === 'lap') {
      var a = R.nz(-3, 3), b = R.int(-4, 4), c = R.nz(-3, 3), u = {}; u['3,0'] = Q(1); u['1,2'] = Q(a); u['0,2'] = Q(b); u['1,1'] = Q(c);
      var lapT = T.terms([[6 + 2 * a, 'x'], [2 * b, '']]), lapP = '(' + (6 + 2 * a) + ')*x+(' + 2 * b + ')';
      return { q: 'Compute $u_{xx} + u_{yy}$ for $u = ' + xyTex(u) + '$.', a: { t: 'expr', v: lapP, vars: ['x', 'y'] },
        steps: ['$u_{xx} = 6x$: only the $x^3$ term survives two derivatives in $x$.', '$u_{yy} = ' + T.terms([[2 * a, 'x'], [2 * b, '']]) + '$.', '$\\Delta u = ' + (lapT === '0' ? '0' : lapT) + '$' + (6 + 2 * a === 0 && b === 0 ? ': $u$ is harmonic.' : ': $u$ is not harmonic, so it is not the real part of any analytic function.')],
        hint: 'Differentiate twice in $x$, twice in $y$, and add.', chk: { kind: kind, u: xyPlain(u), ans: lapP } };
    }
    if (kind === 'k') {
      var fam = R.pick(['cubic', 'quad', 'quartic']);
      if (fam === 'quad') { var a2 = R.nz(-5, 5), m = R.nz(-3, 3), u2 = {}; u2['2,0'] = Q(a2); u2['1,1'] = Q(m);
        return { q: 'Find the constant $k$ that makes $u = ' + T.mono(a2, 'x^2') + T.coef(m, 'xy', false) + ' + ky^2$ harmonic.', a: { t: 'num', v: String(-a2) },
          steps: ['$u_{xx} = ' + 2 * a2 + '$ and $u_{yy} = 2k$.', '$' + 2 * a2 + ' + 2k = 0$ gives $k = ' + (-a2) + '$.'], hint: 'Set $u_{xx} + u_{yy} = 0$.', chk: { kind: kind, fam: fam, a: a2, ans: -a2 } }; }
      if (fam === 'cubic') { var s = R.pick([1, -1]), mm = R.int(1, 3);
        return { q: 'Find the constant $k$ that makes $u = ' + T.mono(s * mm, 'x^3') + ' + kxy^2$ harmonic.', a: { t: 'num', v: String(-3 * s * mm) },
          steps: ['$u_{xx} = ' + T.mono(6 * s * mm, 'x') + '$ and $u_{yy} = 2kx$.', '$' + T.mono(6 * s * mm, 'x') + ' + 2kx = 0$ for all $x$ gives $k = ' + (-3 * s * mm) + '$.'], hint: 'Set $u_{xx} + u_{yy} = 0$.', chk: { kind: kind, fam: fam, ans: -3 * s * mm } }; }
      return { q: 'Find the constant $k$ that makes $u = x^4 + kx^2y^2 + y^4$ harmonic.', a: { t: 'num', v: '-6' },
        steps: ['$u_{xx} = 12x^2 + 2ky^2$ and $u_{yy} = 2kx^2 + 12y^2$.', 'The sum is $(12 + 2k)(x^2 + y^2)$, which is $0$ for all $x, y$ only when $k = -6$.'], hint: 'Collect the $x^2$ and $y^2$ terms of $u_{xx} + u_{yy}$.', chk: { kind: kind, fam: fam, ans: -6 } };
    }
    if (kind === 'conj' || kind === 'conj3' || kind === 'fz') {
      var p = kind === 'conj3' ? P([0, Z(R.int(-2, 2), R.int(-2, 2)), 0, Z(R.pick([1, -1, 2]), R.pick([0, 0, 1]))]) : P([0, zrand(R, -3, 3), Z(R.nz(-2, 2), lvl(ctx) >= 2 ? R.int(-2, 2) : 0)]), uv = xyParts(p);
      if (kind === 'fz') return { q: 'Find the analytic function $f(z)$, written in terms of $z$, with real part $u = ' + xyTex(uv.u) + '$ and $f(0) = 0$.', a: { t: 'expr', v: pplain(p), vars: ['z'] },
        steps: ['$u$ is a polynomial of degree 2, so try $f(z) = \\alpha z^2 + \\beta z$ with complex $\\alpha, \\beta$.', 'Its real part: $\\operatorname{Re}(\\alpha z^2) = \\operatorname{Re}\\alpha\\,(x^2 - y^2) - 2\\operatorname{Im}\\alpha\\,xy$ and $\\operatorname{Re}(\\beta z) = \\operatorname{Re}\\beta\\,x - \\operatorname{Im}\\beta\\,y$.', 'Match with $u$: $\\alpha = ' + ztex(p[2]) + '$, $\\beta = ' + ztex(p[1]) + '$. So $f(z) = ' + ptex(p) + '$.'],
        hint: 'Match the $x^2 - y^2$, $xy$, $x$ and $y$ terms with $\\operatorname{Re}(\\alpha z^2 + \\beta z)$.', chk: { kind: kind, f: pplain(p), ans: pplain(p) } };
      return { q: 'Find the harmonic conjugate $v$ of $u = ' + xyTex(uv.u) + '$ with $v(0, 0) = 0$.', a: { t: 'expr', v: xyPlain(uv.v), vars: ['x', 'y'] },
        steps: ['From $v_y = u_x$: integrate $u_x$ with respect to $y$, adding a function $g(x)$ (not just a constant).', 'From $v_x = -u_y$: comparing decides $g(x)$; here $g$ turns out to be a polynomial in $x$ whose constant is fixed by $v(0, 0) = 0$.', '$v = ' + xyTex(uv.v) + '$. Check: $u + iv = ' + ptex(p) + '$, an analytic polynomial.'],
        hint: 'Integrate $v_y = u_x$ in $y$, then use $v_x = -u_y$ to find the leftover function of $x$.', chk: { kind: kind, f: pplain(p), ans: xyPlain(uv.v) } };
    }
    // u = e^{ax} cos(ay) or e^{ax} sin(ay)
    var a3 = R.pick([1, 2, 3, -1, -2]), sinu = R.coin(), ex = a3 === 1 ? 'e^{x}' : 'e^{' + T.mono(a3, 'x') + '}', ay = T.mono(a3, 'y');
    return { q: 'Find the harmonic conjugate $v$ of $u = ' + ex + '\\' + (sinu ? 'sin' : 'cos') + '(' + ay + ')$ with $v(0, 0) = ' + (sinu ? '-1' : '0') + '$.', a: { t: 'expr', v: sinu ? '-e^(' + a3 + '*x)*cos(' + a3 + '*y)' : 'e^(' + a3 + '*x)*sin(' + a3 + '*y)', vars: ['x', 'y'] },
      steps: ['$u$ is the real part of ' + (sinu ? '$-ie^{' + T.mono(a3, 'z') + '}$' : '$e^{' + T.mono(a3, 'z') + '}$') + ', since $e^{' + T.mono(a3, 'z') + '} = ' + ex + '(\\cos(' + ay + ') + i\\sin(' + ay + '))$.', sinu ? 'Then $-ie^{' + T.mono(a3, 'z') + '} = ' + ex + '\\sin(' + ay + ') - i' + ex + '\\cos(' + ay + ')$, so $v = -' + ex + '\\cos(' + ay + ')$, and $v(0, 0) = -1$ as required.' : 'So $v = ' + ex + '\\sin(' + ay + ')$, and $v(0, 0) = 0$.', 'Check with Cauchy–Riemann: $u_x = v_y$ and $u_y = -v_x$.'],
      hint: 'Which analytic function has this real part?', chk: { kind: kind, a: a3, sinu: sinu } };
  });

  // ===================================================================== Unit 4: Exponentials, Logarithms and Powers
  // a lattice point at a special angle with modulus written exactly: { x, y (radicals), mod2 (|z|² as Q), k (Arg/π) }
  function specialZ(R, pool, maxm) {
    var k = R.pick(pool), t = trigOf(k), m = R.int(1, maxm || 3), x, y, mod2;
    if (t.c.n === 2) { x = rad(m * Math.sign(qn(t.c.k))); y = rad(m * Math.sign(qn(t.s.k))); mod2 = Q(2 * m * m); }
    else if (t.c.n === 3 || t.s.n === 3) { x = radMul(rad(2 * m), t.c); y = radMul(rad(2 * m), t.s); mod2 = Q(4 * m * m); }
    else { x = radMul(rad(m), t.c); y = radMul(rad(m), t.s); mod2 = Q(m * m); }
    return { x: x, y: y, mod2: mod2, k: k, tex: rcTex(x, y), plain: rcPlain(x, y) };
  }
  // ln|z| = (1/2) ln(mod2), written simply: ln 3, (1/2)ln 2, ln 2 + (1/2)ln 3 is avoided by the choices above
  function lnAbs(mod2) { // -> { plain, tex } for ln √mod2
    var n = mod2.num(), s = U.isSquare(n);
    if (s) { var r = Math.round(Math.sqrt(n)); return r === 1 ? { plain: '0', tex: '0', zero: true } : { plain: 'ln(' + r + ')', tex: '\\ln ' + r }; }
    return { plain: 'ln(' + n + ')/2', tex: '\\tfrac{1}{2}\\ln ' + n };
  }
  function logPlain(L, kpi) { // ln part + i·(kπ)
    var im = q(kpi); if (im.isZero()) return L.plain; var t = piPlain(im) + '*i'; return L.zero ? t : L.plain + (t[0] === '-' ? '' : '+') + t;
  }
  function logTex(L, kpi) { var im = q(kpi); if (im.isZero()) return L.tex; var a = im.abs(), t = piTex(a) + ' i'; return L.zero ? (im.sign() < 0 ? '-' : '') + t : L.tex + (im.sign() < 0 ? ' - ' : ' + ') + t; }

  G('cplx.complex-exponential', function (R, ctx) {
    var kind = R.pick(L(ctx, ['eval', 'mod', 'eval'], ['solve', 'eval', 'strip', 'mod'], ['solveK', 'strip', 'solve', 'negreal']));
    if (kind === 'eval') {
      var a = R.pick(lvl(ctx) === 1 ? [1, 2, 3] : [2, 3, 4, 5]), k = R.pick(lvl(ctx) === 1 ? [Q(1), Q(1, 2), Q(-1, 2)] : ANG6.concat(ANG4, [Q(1)])), t = trigOf(k);
      var x = radMul(rad(a), t.c), y = radMul(rad(a), t.s);
      return { q: 'Write $e^{\\ln ' + a + (k.sign() < 0 ? ' - ' + piTex(k.neg()) : ' + ' + piTex(k)) + ' i}$ in the form $a + bi$.', a: { t: 'num', v: rcPlain(x, y) },
        steps: ['$e^{x + iy} = e^x(\\cos y + i\\sin y)$.', '$e^{\\ln ' + a + '} = ' + a + '$, and $\\cos\\left(' + piTex(k) + '\\right) = ' + radTex(t.c.k, t.c.n) + '$, $\\sin\\left(' + piTex(k) + '\\right) = ' + radTex(t.s.k, t.s.n) + '$.', 'So the value is $' + a + '\\left(' + rcTex(t.c, t.s) + '\\right) = ' + rcTex(x, y) + '$.'],
        hint: 'Split $e^{x + iy} = e^x e^{iy}$.', chk: { kind: kind, z: 'ln(' + a + ')+' + piPlain(k) + '*i', v: rcPlain(x, y) } };
    }
    if (kind === 'mod') {
      var x0 = R.nz(-4, 4), y0 = R.nz(-6, 6);
      return { q: 'Find $|e^{z}|$ and one value of $\\arg e^{z}$ for $z = ' + ztex(Z(x0, y0)) + '$.', a: { t: 'multi', parts: [{ label: '$|e^z| =$', a: { t: 'num', v: 'e^(' + x0 + ')' } }, { label: '$\\arg e^z =$', a: { t: 'num', v: String(y0) } }] },
        steps: ['$e^{x + iy} = e^x \\cdot e^{iy}$, and $|e^{iy}| = 1$.', 'So $|e^z| = e^x = e^{' + x0 + '}$ and an argument is $y = ' + y0 + '$ (radians; any $' + y0 + ' + 2\\pi k$ works too).'],
        hint: 'The real part sets the size; the imaginary part sets the angle.', chk: { kind: kind, x: x0, y: y0 } };
    }
    if (kind === 'solve' || kind === 'solveK') {
      var w = specialZ(R, ANG6.concat(ANG4, ANGAX, [Q(1)]), 3), L1 = lnAbs(w.mod2), kk = lvl(ctx) === 3 ? R.pick([1, 2, -1]) : 0, im = w.k.add(2 * kk), lo = w.k.add(2 * kk);
      var askLo = kk === 0 ? '-\\pi < \\operatorname{Im} z \\le \\pi' : piTex(Q(2 * kk - 1)) + ' < \\operatorname{Im} z \\le ' + piTex(Q(2 * kk + 1));
      return { q: 'Solve $e^{z} = ' + w.tex + '$. Give the solution with $' + askLo + '$.', a: { t: 'num', v: logPlain(L1, im) },
        steps: ['Write $z = x + iy$: $e^x e^{iy} = ' + w.tex + '$.', 'Moduli: $e^x = |' + w.tex + '| = ' + radTex(1, w.mod2.num()) + '$, so $x = \\ln ' + radTex(1, w.mod2.num()) + (L1.zero ? ' = 0' : L1.plain.indexOf('/2') > 0 ? ' = ' + L1.tex : '') + '$.', 'Angles: $y = ' + piTex(w.k) + ' + 2\\pi k$ for every integer $k$ (all of them are solutions: $e^z$ has period $2\\pi i$).', 'In the required strip: $z = ' + logTex(L1, im) + '$.'],
        hint: 'Match the modulus ($e^x$) and the angle ($y$, up to $2\\pi k$).', chk: { kind: kind, w: w.plain, lo: kk } };
    }
    if (kind === 'strip') {
      var c = R.pick([1, -1]), top = R.int(2, 4), vals = [];
      for (var j = -1; j <= 2 * top; j++) { var yy = c === 1 ? 2 * j : 2 * j + 1; if (yy >= 0 && yy < 2 * top) vals.push(yy); }
      return { q: 'Find all solutions of $e^{z} = ' + c + '$ with $0 \\le \\operatorname{Im} z < ' + piTex(2 * top) + '$.', a: { t: 'set', v: vals.map(function (y) { return y === 0 ? '0' : piPlain(y) + '*i'; }) },
        steps: ['$|e^z| = e^x = 1$, so $x = 0$.', '$e^{iy} = ' + c + '$ means $y = ' + (c === 1 ? '2\\pi k' : '\\pi + 2\\pi k') + '$.', 'In the strip: $z = ' + vals.map(function (y) { return y === 0 ? '0' : piTex(y) + ' i'; }).join(',\\ ') + '$.'],
        hint: 'The solutions repeat every $2\\pi i$.', chk: { kind: kind, c: c, vals: vals } };
    }
    // e^z = −e^a: z = a + iπ(2k + 1)
    var a2 = R.int(1, 3), vs = [1, 3];
    return { q: 'Find all solutions of $e^{z} = -e^{' + a2 + '}$ with $0 \\le \\operatorname{Im} z < 4\\pi$.', a: { t: 'set', v: vs.map(function (y) { return a2 + '+' + piPlain(y) + '*i'; }) },
      steps: ['$|e^z| = e^x = e^{' + a2 + '}$, so $x = ' + a2 + '$.', '$e^{iy} = -1$, so $y = \\pi + 2\\pi k$.', 'With $0 \\le y < 4\\pi$: $y = \\pi$ or $3\\pi$. So $z = ' + a2 + ' + \\pi i$ and $z = ' + a2 + ' + 3\\pi i$.'],
      hint: 'Match the modulus and the angle separately.', chk: { kind: kind, a: a2 } };
  });

  // cosh(ln a) = (a + 1/a)/2, sinh(ln a) = (a − 1/a)/2
  function chq(a) { a = q(a); return a.add(a.inv()).div(2); }
  function shq(a) { a = q(a); return a.sub(a.inv()).div(2); }
  G('cplx.trig-hyperbolic', function (R, ctx) {
    var kind = R.pick(L(ctx, ['cosi', 'cosi', 'tf'], ['sinxy', 'cosxy', 'mod'], ['solve', 'sinxy', 'solve', 'mod']));
    var a = R.pick([2, 3, 4, 5, Q(3, 2)]), aT = lnTex(a), aP = lnPlain(a);
    if (kind === 'cosi') {
      var sinq = R.coin(), v = sinq ? shq(a) : chq(a);
      return { q: 'Compute $\\' + (sinq ? 'sin' : 'cos') + '(i' + aT + ')$.', a: { t: 'num', v: sinq ? '(' + qp(v) + ')*i' : qp(v) },
        steps: [sinq ? '$\\sin(iy) = \\dfrac{e^{-y} - e^{y}}{2i} = i\\sinh y$.' : '$\\cos(iy) = \\dfrac{e^{-y} + e^{y}}{2} = \\cosh y$.', 'With $y = ' + aT + '$: $e^{y} = ' + qt(a) + '$ and $e^{-y} = ' + qt(q(a).inv()) + '$.', sinq ? '$\\sinh y = \\frac{1}{2}\\left(' + qt(a) + ' - ' + qt(q(a).inv()) + '\\right) = ' + qt(v) + '$, so the answer is $' + qt(v) + 'i$.' : '$\\cosh y = \\frac{1}{2}\\left(' + qt(a) + ' + ' + qt(q(a).inv()) + '\\right) = ' + qt(v) + '$.'],
        hint: 'Use the exponential definitions with $z = iy$.', chk: { kind: kind, f: sinq ? 'sin' : 'cos', z: '0+i*' + aP, v: sinq ? '(' + qp(v) + ')*i' : qp(v) } };
    }
    if (kind === 'tf') {
      var y = R.pick([2, 3, 4]), sv = shq(y);
      return { q: 'True or false: $|\\sin z| \\le 1$ for every complex number $z$. Then find $|\\sin(i' + lnTex(y) + ')|$.',
        a: { t: 'multi', parts: [{ label: 'true or false:', a: { t: 'tf', v: false } }, { label: '$|\\sin(i' + lnTex(y) + ')| =$', a: { t: 'num', v: qp(sv) } }] },
        steps: ['$\\sin(iy) = i\\sinh y$, so $|\\sin(iy)| = |\\sinh y|$, which grows without bound.', 'With $y = ' + lnTex(y) + '$: $\\sinh y = \\frac{1}{2}\\left(' + y + ' - \\frac{1}{' + y + '}\\right) = ' + qt(sv) + '$' + (sv.gt(1) ? ', already more than 1.' : '.'), 'So the statement is false: the bound $|\\sin x| \\le 1$ holds only on the real line.'],
        hint: 'Try $z = iy$ with $y$ large.', chk: { kind: kind, y: y, v: qp(sv) } };
    }
    if (kind === 'sinxy' || kind === 'cosxy') {
      var k = R.pick([Q(1, 6), Q(1, 3), Q(1, 2), Q(2, 3), Q(1), Q(1, 4), Q(3, 4), Q(-1, 3)]), t = trigOf(k), ch = chq(a), sh = shq(a);
      var re = kind === 'sinxy' ? radMul(t.s, rad(ch)) : radMul(t.c, rad(ch)), im = kind === 'sinxy' ? radMul(t.c, rad(sh)) : radMul(t.s, rad(sh.neg()));
      return { q: 'Write $\\' + (kind === 'sinxy' ? 'sin' : 'cos') + '\\left(' + piTex(k) + ' + i' + aT + '\\right)$ in the form $a + bi$.', a: { t: 'num', v: rcPlain(re, im) },
        steps: [kind === 'sinxy' ? '$\\sin(x + iy) = \\sin x\\cosh y + i\\cos x\\sinh y$ (the sum formula with $\\cos(iy) = \\cosh y$, $\\sin(iy) = i\\sinh y$).' : '$\\cos(x + iy) = \\cos x\\cosh y - i\\sin x\\sinh y$.', '$\\cosh(' + aT + ') = ' + qt(ch) + '$ and $\\sinh(' + aT + ') = ' + qt(sh) + '$; $\\cos\\left(' + piTex(k) + '\\right) = ' + radTex(t.c.k, t.c.n) + '$, $\\sin\\left(' + piTex(k) + '\\right) = ' + radTex(t.s.k, t.s.n) + '$.', 'Result: $' + rcTex(re, im) + '$.'],
        hint: 'Expand with the sum formula, then use $\\cosh(\\ln a) = \\frac{a + 1/a}{2}$ and $\\sinh(\\ln a) = \\frac{a - 1/a}{2}$.', chk: { kind: kind, f: kind === 'sinxy' ? 'sin' : 'cos', z: piPlain(k) + '+i*' + aP, v: rcPlain(re, im) } };
    }
    if (kind === 'mod') {
      var x0 = R.pick([Q(0), Q(1, 2), Q(1, 6), Q(1, 4)]), tt = trigOf(x0), sh2 = shq(a), m2 = radMul(tt.s, tt.s).k.add(sh2.mul(sh2));
      return { q: 'Use $|\\sin(x + iy)|^2 = \\sin^2 x + \\sinh^2 y$ to find $|\\sin z|^2$ for $z = ' + (x0.isZero() ? '' : piTex(x0) + ' + ') + 'i' + aT + '$.', a: { t: 'num', v: qp(m2) },
        steps: ['$\\sin^2\\left(' + piTex(x0) + '\\right) = ' + qt(radMul(tt.s, tt.s).k) + '$.', '$\\sinh(' + aT + ') = ' + qt(sh2) + '$, so $\\sinh^2 = ' + qt(sh2.mul(sh2)) + '$.', '$|\\sin z|^2 = ' + qt(m2) + '$.'],
        hint: 'Add the two squares.', chk: { kind: kind, z: piPlain(x0) + '+i*' + aP, v: qp(m2) } };
    }
    // solve sin z = c or cos z = c with c = cosh(ln a) > 1
    var useSin = R.coin(), cc = chq(a), sol = useSin ? 'pi/2+i*' + aP : 'i*' + aP;
    return { q: 'Solve $\\' + (useSin ? 'sin' : 'cos') + ' z = ' + qt(cc) + '$. Give the solution with real part $' + (useSin ? '\\frac{\\pi}{2}' : '0') + '$ and positive imaginary part.', a: { t: 'num', v: sol },
      steps: ['On the line $\\operatorname{Re} z = ' + (useSin ? '\\frac{\\pi}{2}' : '0') + '$: $\\' + (useSin ? 'sin\\left(\\frac{\\pi}{2} + iy\\right)' : 'cos(iy)') + ' = \\cosh y$, which takes every value $\\ge 1$.', 'Solve $\\cosh y = \\frac{e^y + e^{-y}}{2} = ' + qt(cc) + '$: with $t = e^y$, $t^2 - ' + qt(cc.mul(2)) + 't + 1 = 0$, so $t = ' + qt(a) + '$ or $t = ' + qt(q(a).inv()) + '$.', 'Positive $y$: $y = ' + aT + '$, so $z = ' + (useSin ? '\\frac{\\pi}{2} + ' : '') + 'i' + aT + '$. (Adding $2\\pi k$, or flipping the sign of $y$, gives the others.)'],
      hint: 'Look for a solution with the given real part and solve $\\cosh y = c$.', chk: { kind: kind, f: useSin ? 'sin' : 'cos', c: qp(cc), v: sol } };
  });

  G('cplx.complex-logarithm', function (R, ctx) {
    var kind = R.pick(L(ctx, ['Log', 'Log', 'exp'], ['branchk', 'Log', 'sum'], ['sum', 'all', 'branchk', 'exp']));
    var pool = ANG6.concat(ANG4, ANGAX, [Q(1), Q(1)]);
    if (kind === 'Log') {
      var w = specialZ(R, lvl(ctx) === 1 ? [Q(1), Q(1, 2), Q(-1, 2), Q(1, 4), Q(-3, 4)] : pool, 3), L1 = lnAbs(w.mod2);
      return { q: 'Find the principal logarithm $\\operatorname{Log}\\left(' + w.tex + '\\right)$.', a: { t: 'num', v: logPlain(L1, w.k) },
        steps: ['$\\operatorname{Log} z = \\ln|z| + i\\operatorname{Arg} z$.', '$|z| = ' + radTex(1, w.mod2.num()) + '$, so $\\ln|z| = ' + L1.tex + '$.', '$\\operatorname{Arg} z = ' + piTex(w.k) + '$.', '$\\operatorname{Log} z = ' + logTex(L1, w.k) + '$.'],
        hint: 'Real part $\\ln|z|$, imaginary part the principal angle.', chk: { kind: kind, z: w.plain, v: logPlain(L1, w.k) } };
    }
    if (kind === 'branchk') {
      var w2 = specialZ(R, pool, 3), L2 = lnAbs(w2.mod2), up = R.coin(), im = w2.k.add(up ? 2 : -2);
      return { q: 'Find the value of $\\log\\left(' + w2.tex + '\\right)$ whose imaginary part lies in $(' + (up ? '\\pi, 3\\pi' : '-3\\pi, -\\pi') + ']$.', a: { t: 'num', v: logPlain(L2, im) },
        steps: ['$\\log z = \\ln|z| + i(\\operatorname{Arg} z + 2\\pi k)$: one value for each integer $k$.', '$\\ln|z| = ' + L2.tex + '$ and $\\operatorname{Arg} z = ' + piTex(w2.k) + '$.', 'Take $k = ' + (up ? 1 : -1) + '$: imaginary part $' + piTex(im) + '$. So the value is $' + logTex(L2, im) + '$.'],
        hint: 'Shift the principal value by $2\\pi i$.', chk: { kind: kind, z: w2.plain, v: logPlain(L2, im) } };
    }
    if (kind === 'sum') {
      var pz = pool.filter(function (x) { return !x.isZero(); }), A = specialZ(R, pz, 2), B = specialZ(R, pz, 2), s = A.k.add(B.k), pk = princ(s), diff = s.sub(pk);
      if (lvl(ctx) === 3 && diff.isZero()) { A = specialZ(R, [Q(3, 4), Q(2, 3), Q(5, 6), Q(1)], 2); B = specialZ(R, [Q(3, 4), Q(1, 2), Q(2, 3), Q(1)], 2); s = A.k.add(B.k); pk = princ(s); diff = s.sub(pk); }
      return { q: 'Let $z = ' + A.tex + '$ and $w = ' + B.tex + '$. Compute $\\operatorname{Log}(zw) - \\operatorname{Log} z - \\operatorname{Log} w$.', a: { t: 'num', v: diff.isZero() ? '0' : piPlain(diff.neg()) + '*i' },
        steps: ['The real parts cancel: $\\ln|zw| = \\ln|z| + \\ln|w|$.', 'The imaginary parts: $\\operatorname{Arg}(zw) - \\operatorname{Arg} z - \\operatorname{Arg} w$, with $\\operatorname{Arg} z + \\operatorname{Arg} w = ' + piTex(A.k) + ' + ' + (B.k.sign() < 0 ? '\\left(' + piTex(B.k) + '\\right)' : piTex(B.k)) + ' = ' + piTex(s) + '$.', diff.isZero() ? 'That sum lies in $(-\\pi, \\pi]$, so it is $\\operatorname{Arg}(zw)$ and the difference is $0$.' : 'That sum is outside $(-\\pi, \\pi]$; $\\operatorname{Arg}(zw) = ' + piTex(pk) + '$, so the difference is $' + piTex(diff.neg()) + ' i$: the rule $\\operatorname{Log}(zw) = \\operatorname{Log} z + \\operatorname{Log} w$ fails here.'],
        hint: 'Only the arguments matter; check whether $\\operatorname{Arg} z + \\operatorname{Arg} w$ leaves $(-\\pi, \\pi]$.', chk: { kind: kind, z: A.plain, w: B.plain } };
    }
    if (kind === 'exp') {
      var r = R.pick([1, 2, 3, 4]), k = R.pick(ANG6.concat(ANG4, [Q(1, 2), Q(-1, 2)])), t = trigOf(k), x = radMul(rad(r), t.c), y = radMul(rad(r), t.s);
      return { q: 'Solve $\\operatorname{Log} z = ' + (r === 1 ? '' : '\\ln ' + r + ' ') + (k.sign() < 0 ? '- ' + piTex(k.neg()) : (r === 1 ? '' : '+ ') + piTex(k)) + ' i$.', a: { t: 'num', v: rcPlain(x, y) },
        steps: ['$\\operatorname{Log} z = w$ means $z = e^{w}$ (the imaginary part $' + piTex(k) + '$ lies in $(-\\pi, \\pi]$, so it is a principal value).', '$z = ' + (r === 1 ? '' : 'e^{\\ln ' + r + '}') + 'e^{' + piTex(k) + ' i} = ' + (r === 1 ? '' : r) + '\\left(\\cos\\left(' + piTex(k) + '\\right) + i\\sin\\left(' + piTex(k) + '\\right)\\right)$.', '$z = ' + rcTex(x, y) + '$.'],
        hint: 'Exponentiate both sides.', chk: { kind: kind, w: (r === 1 ? '' : 'ln(' + r + ')+') + piPlain(k) + '*i', v: rcPlain(x, y) } };
    }
    // all values of log(−a) or log(±ai) in a range
    var tgt = R.pick([[Q(1), '-1'], [Q(1, 2), 'i'], [Q(-1, 2), '-i']]), vals = [];
    for (var j = -3; j <= 3; j++) { var v = tgt[0].add(2 * j); if (v.gt(-4) && v.lt(4)) vals.push(v); }
    return { q: 'List all values of $\\log(' + tgt[1] + ')$ with imaginary part between $-4\\pi$ and $4\\pi$.', a: { t: 'set', v: vals.map(function (v) { return piPlain(v) + '*i'; }) },
      steps: ['$|' + tgt[1] + '| = 1$, so $\\ln|' + tgt[1] + '| = 0$ and every value is purely imaginary.', 'The arguments of $' + tgt[1] + '$ are $' + piTex(tgt[0]) + ' + 2\\pi k$.', 'Between $-4\\pi$ and $4\\pi$: $' + vals.map(function (v) { return piTex(v) + ' i'; }).join(',\\ ') + '$.'],
      hint: 'Write down the arguments $\\theta + 2\\pi k$ that fit the range.', chk: { kind: kind, z: tgt[1], vals: vals.map(qp) } };
  });

  G('cplx.branch-cuts', function (R, ctx) {
    var kind = R.pick(L(ctx, ['jump', 'where', 'jump'], ['otherbranch', 'where', 'sqrtjump'], ['otherbranch', 'otherbranch', 'sqrtjump', 'jump']));
    if (kind === 'jump') {
      var a = R.pick([2, 3, 4, 5, 6]);
      return { q: 'Find the limits of $\\operatorname{Log} z$ as $z \\to -' + a + '$ from above (through $\\operatorname{Im} z > 0$) and from below.', a: { t: 'multi', parts: [{ label: 'from above:', a: { t: 'num', v: 'ln(' + a + ')+pi*i' } }, { label: 'from below:', a: { t: 'num', v: 'ln(' + a + ')-pi*i' } }] },
        steps: ['$\\operatorname{Log} z = \\ln|z| + i\\operatorname{Arg} z$, and $\\ln|z| \\to \\ln ' + a + '$ either way.', 'From above, $\\operatorname{Arg} z \\to \\pi$; from below, $\\operatorname{Arg} z \\to -\\pi$.', 'The limits are $\\ln ' + a + ' + \\pi i$ and $\\ln ' + a + ' - \\pi i$: a jump of $2\\pi i$ across the cut, so $\\operatorname{Log}$ is not continuous (let alone analytic) on the negative real axis.'],
        hint: 'Follow $\\operatorname{Arg} z$ on each side of the negative real axis.', chk: { kind: kind, a: a } };
    }
    if (kind === 'where') {
      var c = R.nz(-4, 4), m = R.pick([1, 2, 3]), shiftc = c * m; // Log(m z + c): cut where m z + c ≤ 0, i.e. z ≤ −c/m
      var e = Q(-c, m), correct = '$(-\\infty, ' + qt(e) + ']$ on the real axis', wrong = ['$[' + qt(e) + ', \\infty)$ on the real axis', '$(-\\infty, ' + qt(e.neg()) + ']$ on the real axis', 'the line $\\operatorname{Re} z = ' + qt(e) + '$', '$(-\\infty, 0]$ on the real axis'];
      return { q: 'Where is $\\operatorname{Log}(' + T.mono(m, 'z') + T.coef(c, '', false) + ')$ not analytic?', a: mcSpec(correct, wrong.filter(function (w) { return w !== correct; }).slice(0, 3)),
        steps: ['$\\operatorname{Log} w$ is analytic except where $w$ is a real number $\\le 0$ (its cut and $0$).', 'Here $w = ' + T.mono(m, 'z') + T.coef(c, '', false) + '$ is real and $\\le 0$ exactly when $z$ is real and $z \\le ' + qt(e) + '$.', 'So the bad set is the ray $(-\\infty, ' + qt(e) + ']$.'],
        hint: 'Find where the inside is a negative real number or zero.', chk: { kind: kind } };
    }
    if (kind === 'otherbranch') {
      var br = R.pick([[Q(0), Q(2), 'positive real axis'], [Q(-1, 2), Q(3, 2), 'negative imaginary axis'], [Q(-3, 2), Q(1, 2), 'positive imaginary axis']]), w = specialZ(R, ANG4.concat(ANGAX, [Q(1), Q(2, 3), Q(-1, 3)]), 2), L1 = lnAbs(w.mod2);
      var th = w.k; while (th.le(br[0])) th = th.add(2); while (th.gt(br[1])) th = th.sub(2);
      return { q: 'A branch of $\\log z$ takes arguments in $(' + piTex(br[0]) + ', ' + piTex(br[1]) + ']$, so its cut is the ' + br[2] + '. Find its value at $z = ' + w.tex + '$.', a: { t: 'num', v: logPlain(L1, th) },
        steps: ['The value is $\\ln|z| + i\\theta$ with $\\theta$ the argument of $z$ that lies in $(' + piTex(br[0]) + ', ' + piTex(br[1]) + ']$.', '$\\ln|z| = ' + L1.tex + '$; the principal argument is $' + piTex(w.k) + '$' + (th.eq(w.k) ? ', which already lies in the interval.' : ', and adding a multiple of $2\\pi$ gives $\\theta = ' + piTex(th) + '$ in the interval.'), 'Value: $' + logTex(L1, th) + '$.'],
        hint: 'Choose the argument that lies in the stated interval.', chk: { kind: kind, z: w.plain, lo: qp(br[0]), v: logPlain(L1, th) } };
    }
    var a2 = R.pick([2, 3, 4, 5]);
    return { q: 'Find the limits of the principal square root $\\sqrt{z} = e^{\\frac{1}{2}\\operatorname{Log} z}$ as $z \\to -' + (a2 * a2) + '$ from above and from below.', a: { t: 'multi', parts: [{ label: 'from above:', a: { t: 'num', v: a2 + '*i' } }, { label: 'from below:', a: { t: 'num', v: '-' + a2 + '*i' } }] },
      steps: ['$\\sqrt{z} = \\sqrt{|z|}\\,e^{i\\operatorname{Arg}(z)/2}$.', 'From above, $\\operatorname{Arg} z \\to \\pi$: $' + a2 + 'e^{i\\pi/2} = ' + a2 + 'i$. From below, $\\operatorname{Arg} z \\to -\\pi$: $' + a2 + 'e^{-i\\pi/2} = -' + a2 + 'i$.', 'The principal square root jumps across the same cut as $\\operatorname{Log}$.'],
      hint: 'Halve the argument on each side of the cut.', chk: { kind: kind, a: a2 } };
  });

  G('cplx.complex-powers', function (R, ctx) {
    var kind = R.pick(L(ctx, ['ii', 'count', 'root'], ['root', 'allk', 'ii'], ['ratpow', 'rule', 'allk', 'root']));
    if (kind === 'ii') {
      var b = R.pick(['i', '-1', '-i']), n = R.pick([1, 2, 3, -1, -2]), arg = b === 'i' ? Q(1, 2) : b === '-1' ? Q(1) : Q(-1, 2), ex = arg.mul(-n);
      var expT = n === 1 ? 'i' : n === -1 ? '-i' : n + 'i', baseT = b === 'i' ? 'i' : '(' + b + ')';
      return { q: 'Find the principal value of $' + baseT + '^{' + expT + '}$.', a: { t: 'num', v: 'e^(' + piPlain(ex) + ')' },
        steps: ['$z^c = e^{c\\operatorname{Log} z}$ for the principal value.', '$\\operatorname{Log}(' + b + ') = ' + piTex(arg) + ' i$, because $|' + b + '| = 1$.', '$c\\operatorname{Log} z = ' + expT + ' \\cdot ' + piTex(arg) + ' i = ' + piTex(ex) + '$ (using $i \\cdot i = -1$): a real number.', 'So the principal value is $e^{' + piTex(ex) + '}$, a positive real number.'],
        hint: 'Use $z^c = e^{c\\operatorname{Log} z}$.', chk: { kind: kind, expr: baseT + '^(' + n + '*i)', v: 'e^(' + piPlain(ex) + ')' } };
    }
    if (kind === 'count') {
      var p = R.int(1, 7), qd = R.int(2, 9); while (U.gcd(p, qd) !== 1) p++;
      return { q: 'How many different values does $z^{' + p + '/' + qd + '}$ have for a fixed $z \\ne 0$?', a: { t: 'num', v: String(qd) },
        steps: ['$z^{' + p + '/' + qd + '} = e^{\\frac{' + p + '}{' + qd + '}(\\ln|z| + i\\operatorname{Arg} z + 2\\pi ik)}$.', 'Changing $k$ turns the value by $\\frac{' + (2 * p) + '\\pi}{' + qd + '}k$. Since $\\frac{' + p + '}{' + qd + '}$ is in lowest terms, the values repeat only when $k$ grows by $' + qd + '$.', 'So there are exactly $' + qd + '$ values.'],
        hint: 'A rational power $p/q$ in lowest terms has $q$ values.', chk: { kind: kind } };
    }
    if (kind === 'root' || kind === 'ratpow') {
      // base = m^q · e^{iφ} with φ = Arg (π or ±π/2), exponent p/q: value m^p e^{i p φ / q}
      var shape = R.pick(kind === 'root' ? [[1, 3, Q(1)], [1, 2, Q(1)], [1, 4, Q(1)], [1, 2, Q(1, 2)], [1, 2, Q(-1, 2)], [1, 3, Q(1, 2)], [1, 3, Q(-1, 2)]] : [[2, 3, Q(1)], [3, 2, Q(1)], [3, 2, Q(1, 2)], [3, 2, Q(-1, 2)], [2, 3, Q(1, 2)]]);
      var pp = shape[0], qq2 = shape[1], phi = shape[2], m = R.int(1, qq2 === 4 ? 2 : qq2 === 2 ? 5 : 3), mod = Math.pow(m, qq2), ang = phi.mul(pp).div(qq2), t = trigOf(ang), vm = Math.pow(m, pp);
      var x = radMul(rad(vm), t.c), y = radMul(rad(vm), t.s), baseT = phi.eq(1) ? '(-' + mod + ')' : (mod === 1 ? '' : mod) + (phi.sign() < 0 ? '(-' + (mod === 1 ? '' : '') + 'i)' : 'i'), baseP = phi.eq(1) ? '(-' + mod + ')' : '(' + (phi.sign() < 0 ? '-' : '') + mod + '*i)';
      if (!phi.eq(1)) baseT = '(' + (phi.sign() < 0 ? '-' : '') + (mod === 1 ? '' : mod) + 'i)';
      return { q: 'Find the principal value of $' + baseT + '^{' + pp + '/' + qq2 + '}$' + (kind === 'ratpow' ? ' in the form $a + bi$.' : '.'), a: { t: 'num', v: rcPlain(x, y) },
        steps: ['The principal value is $e^{c\\operatorname{Log} z} = |z|^c e^{ic\\operatorname{Arg} z}$: raise the modulus to the power and multiply the principal argument by it.', '$|z| = ' + mod + '$, so $|z|^{' + pp + '/' + qq2 + '} = ' + vm + '$. $\\operatorname{Arg} z = ' + piTex(phi) + '$, times $\\frac{' + pp + '}{' + qq2 + '}$: $' + piTex(ang) + '$.', 'Value: $' + eiTex(vm, ang) + ' = ' + rcTex(x, y) + '$.' + (phi.eq(1) && qq2 % 2 === 1 ? ' It is not the real root $-' + vm + '$: the principal value uses the principal argument $\\pi$.' : '')],
        hint: 'Use $\\operatorname{Arg} z$, not the real-number root.', chk: { kind: kind, z: baseP + '^(' + pp + '/' + qq2 + ')', v: rcPlain(x, y) } };
    }
    if (kind === 'allk') {
      var k = R.pick([1, -1, 2, -2, 3]), base = R.pick(['i', '-1', '-i']), th = base === 'i' ? Q(1, 2) : base === '-1' ? Q(1) : Q(-1, 2), ex2 = th.add(2 * k).neg(), bT = base === 'i' ? 'i' : '(' + base + ')';
      return { q: 'Every value of $' + bT + '^{i}$ is a real number. Find the value obtained with the argument $\\theta = ' + piTex(th.add(2 * k)) + '$ of $' + base + '$.', a: { t: 'num', v: 'e^(' + piPlain(ex2) + ')' },
        steps: ['$' + bT + '^{i} = e^{i\\log(' + base + ')}$ with $\\log(' + base + ') = i\\theta$ (since $|' + base + '| = 1$).', 'So $' + bT + '^{i} = e^{i \\cdot i\\theta} = e^{-\\theta}$.', 'With $\\theta = ' + piTex(th.add(2 * k)) + '$: $e^{' + piTex(ex2) + '}$.'],
        hint: 'Each choice of argument gives $e^{-\\theta}$.', chk: { kind: kind, v: 'e^(' + piPlain(ex2) + ')', th: qp(th.add(2 * k)) } };
    }
    // (zw)^c vs z^c w^c with z = w = −1, c = 1/2; or (z^a)^b vs z^{ab}
    if (R.coin()) return { q: 'With principal values, compute $\\big((-1)(-1)\\big)^{1/2}$ and $(-1)^{1/2}(-1)^{1/2}$.', a: { t: 'multi', parts: [{ label: '$\\big((-1)(-1)\\big)^{1/2} =$', a: { t: 'num', v: '1' } }, { label: '$(-1)^{1/2}(-1)^{1/2} =$', a: { t: 'num', v: '-1' } }] },
      steps: ['$(-1)(-1) = 1$ and $1^{1/2} = e^{\\frac{1}{2}\\operatorname{Log} 1} = 1$.', '$(-1)^{1/2} = e^{\\frac{1}{2}\\pi i} = i$, so the product is $i \\cdot i = -1$.', 'They differ: the rule $(zw)^c = z^c w^c$ is not safe for principal values.'],
      hint: 'Use $\\operatorname{Log}(-1) = \\pi i$.', chk: { kind: 'rule1' } };
    var m2 = R.pick([1, 4, 9]);
    return { q: 'With principal values, compute $\\big((-' + (m2 === 1 ? '1' : m2) + ')^{2}\\big)^{1/2}$ and $(-' + (m2 === 1 ? '1' : m2) + ')^{2 \\cdot \\frac{1}{2}}$.', a: { t: 'multi', parts: [{ label: 'first:', a: { t: 'num', v: String(m2) } }, { label: 'second:', a: { t: 'num', v: String(-m2) } }] },
      steps: ['$(-' + m2 + ')^2 = ' + (m2 * m2) + '$, and the principal square root of $' + (m2 * m2) + '$ is $' + m2 + '$.', '$(-' + m2 + ')^{2 \\cdot \\frac{1}{2}} = (-' + m2 + ')^1 = -' + m2 + '$.', 'So $(z^a)^b = z^{ab}$ can fail too.'],
      hint: 'Work out the inside first in the first expression.', chk: { kind: 'rule2' } };
  });

  // ===================================================================== Unit 5: Contour Integrals and Cauchy's Theorem
  function circTex(c, r) { return '|' + zm(c) + '| = ' + qt(r); }
  function addRad(a, b) { // a + b for radicals with the same n (or one of them zero), else null
    if (q(a.k).isZero()) return b; if (q(b.k).isZero()) return a; if (a.n === b.n) return radNorm(q(a.k).add(b.k), a.n); return null;
  }
  G('cplx.contours', function (R, ctx) {
    var kind = R.pick(L(ctx, ['point', 'seg', 'deriv'], ['len', 'cw', 'seg', 'point'], ['len', 'cw', 'segrev', 'deriv']));
    if (kind === 'point' || kind === 'deriv') {
      var c = zrand(R, -3, 3), r = R.int(2, 4), k = R.pick([Q(1, 2), Q(1), Q(3, 2), Q(1, 3), Q(1, 4), Q(2, 3), Q(1, 6)]), t = trigOf(k);
      if (kind === 'point') {
        var x = addRad(rad(c.re), radMul(rad(r), t.c)), y = addRad(rad(c.im), radMul(rad(r), t.s));
        if (!x || !y) { k = Q(1, 2); t = trigOf(k); x = addRad(rad(c.re), radMul(rad(r), t.c)); y = addRad(rad(c.im), radMul(rad(r), t.s)); }
        return { q: 'The circle $' + circTex(c, r) + '$ is traced by $z(t) = ' + (zisz(c) ? '' : ztex(c) + ' + ') + co(r) + 'e^{it}$, $0 \\le t \\le 2\\pi$. Find $z\\left(' + piTex(k) + '\\right)$.', a: { t: 'num', v: rcPlain(x, y) },
          steps: ['$e^{i' + piTex(k) + '} = \\cos\\left(' + piTex(k) + '\\right) + i\\sin\\left(' + piTex(k) + '\\right) = ' + rcTex(t.c, t.s) + '$.', '$z\\left(' + piTex(k) + '\\right) = ' + (zisz(c) ? '' : ztex(c) + ' + ') + r + '\\left(' + rcTex(t.c, t.s) + '\\right) = ' + rcTex(x, y) + '$.', 'Starting at $z(0) = ' + ztex(zadd(c, Z(r))) + '$ (the rightmost point), the point has turned through the angle $' + piTex(k) + '$ counterclockwise.'],
          hint: 'Use $e^{it} = \\cos t + i\\sin t$.', chk: { kind: kind, c: zplain(c), r: r, k: qp(k), v: rcPlain(x, y) } };
      }
      var dx = radMul(rad(-r), t.s), dy = radMul(rad(r), t.c);
      return { q: 'For $z(t) = ' + (zisz(c) ? '' : ztex(c) + ' + ') + co(r) + 'e^{it}$, find $z\'\\left(' + piTex(k) + '\\right)$.', a: { t: 'num', v: rcPlain(dx, dy) },
        steps: ['$z\'(t) = ' + co(r) + 'ie^{it}$ (the center is a constant).', '$z\'\\left(' + piTex(k) + '\\right) = ' + r + 'i\\left(' + rcTex(t.c, t.s) + '\\right) = ' + rcTex(dx, dy) + '$.', 'It is tangent to the circle, a quarter turn ahead of the radius: counterclockwise.'],
        hint: 'Differentiate $e^{it}$ to get $ie^{it}$.', chk: { kind: kind, c: zplain(c), r: r, k: qp(k), v: rcPlain(dx, dy) } };
    }
    if (kind === 'seg' || kind === 'segrev') {
      var z1 = zrand(R, -3, 3), z2; do { z2 = zrand(R, -3, 3); } while (zeq(z1, z2));
      var A = kind === 'seg' ? z1 : z2, B = kind === 'seg' ? z2 : z1, d = zsub(B, A), pz = P([A, d]);
      return { q: 'Parametrize the segment from $' + ztex(A) + '$ to $' + ztex(B) + '$ as $z(t)$ with $0 \\le t \\le 1$, starting at $' + ztex(A) + '$. Give $z(t)$.', a: { t: 'expr', v: pplain(pz, 't'), vars: ['t'] },
        steps: ['Start at the first point and move by $t$ times the difference: $z(t) = z_{\\text{start}} + t\\,(z_{\\text{end}} - z_{\\text{start}})$.', '$z_{\\text{end}} - z_{\\text{start}} = ' + ztex(d) + '$.', '$z(t) = ' + ztex(A) + zcoef(d, 't', false) + '$, so $z(0) = ' + ztex(A) + '$ and $z(1) = ' + ztex(B) + '$.'],
        hint: 'Start plus $t$ times (end minus start).', chk: { kind: kind, a: zplain(A), b: zplain(B), ans: pplain(pz, 't') } };
    }
    if (kind === 'cw') {
      var c2 = zrand(R, -3, 3), r2 = R.int(2, 4), cT = zisz(c2) ? '' : ztex(c2) + ' + ', right = '$z(t) = ' + cT + r2 + 'e^{-it}$', wr = ['$z(t) = ' + cT + co(r2) + 'e^{it}$', '$z(t) = ' + cT + r2 + 'e^{2it}$', '$z(t) = ' + r2 + zcoef(c2, 'e^{-it}', false) + '$'];
      if (zisz(c2)) wr[2] = '$z(t) = -' + co(r2) + 'e^{it}$';
      return { q: 'Which parametrization ($0 \\le t \\le 2\\pi$) traces the circle $' + circTex(c2, r2) + '$ once <b>clockwise</b>?', a: mcSpec(right, wr),
        steps: ['$e^{it}$ moves counterclockwise as $t$ grows; $e^{-it} = \\cos t - i\\sin t$ moves clockwise.', 'The center $' + ztex(c2) + '$ is added, and the radius $' + r2 + '$ multiplies the exponential.', 'So ' + right + '. Reversing direction flips the sign of every contour integral.'],
        hint: 'Check which way $e^{\\pm it}$ turns.', chk: { kind: kind } };
    }
    // lengths
    var shape = R.pick(['seg', 'circ', 'arc', 'combo']), L1, Lt, st;
    if (shape === 'seg') { var a = zrand(R, -3, 3), b; do { b = zrand(R, -3, 3); } while (zeq(a, b)); L1 = absPlain(zsub(b, a)); Lt = 'the segment from $' + ztex(a) + '$ to $' + ztex(b) + '$'; st = ['The length of a segment is the distance between its ends: $|' + ztex(b) + ' - ' + zpar(a) + '| = |' + ztex(zsub(b, a)) + '| = ' + absTex(zsub(b, a)) + '$.']; }
    else if (shape === 'circ') { var rr = R.int(1, 5); L1 = piPlain(2 * rr); Lt = 'the circle $|z| = ' + rr + '$ traced once'; st = ['$|z\'(t)| = |' + co(rr) + 'ie^{it}| = ' + rr + '$, so the length is $\\int_0^{2\\pi} ' + rr + '\\,dt = ' + piTex(2 * rr) + '$.']; }
    else if (shape === 'arc') { var r3 = R.int(1, 6), fr = R.pick([Q(1, 2), Q(1, 3), Q(1, 4), Q(2, 3)]); L1 = piPlain(fr.mul(r3)); Lt = 'the arc $z(t) = ' + co(r3) + 'e^{it}$, $0 \\le t \\le ' + piTex(fr) + '$'; st = ['$|z\'(t)| = ' + r3 + '$, so the length is $' + r3 + ' \\cdot ' + piTex(fr) + ' = ' + piTex(fr.mul(r3)) + '$.']; }
    else { var r4 = R.int(1, 4); L1 = 2 * r4 + '+' + piPlain(r4); Lt = 'the closed path made of the segment from $-' + r4 + '$ to $' + r4 + '$ and the upper half of $|z| = ' + r4 + '$'; st = ['The segment has length $' + 2 * r4 + '$.', 'The half circle has length $' + piTex(r4) + '$ (half of $' + piTex(2 * r4) + '$).', 'Total: $' + 2 * r4 + ' + ' + piTex(r4) + '$.']; }
    return { q: 'Find the length of ' + Lt + '.', a: { t: 'num', v: L1 }, steps: st.concat(['Lengths will matter for the ML bound: $\\left|\\int_C f\\,dz\\right| \\le M \\cdot L$.']), hint: 'Length $= \\int |z\'(t)|\\,dt$.', chk: { kind: 'len', shape: shape } };
  });

  G('cplx.contour-integrals', function (R, ctx) {
    var kind = R.pick(L(ctx, ['zSeg', 'zbarSeg', 'inv'], ['zbarSeg', 'zbarArc', 'inv', 'power'], ['zbarArc', 'Rez', 'power', 'zbarSeg']));
    if (kind === 'zSeg' || kind === 'zbarSeg') {
      var z1 = lvl(ctx) === 1 ? Z0 : zrand(R, -2, 2), z2; do { z2 = zrand(R, -3, 3, lvl(ctx) > 1); } while (zeq(z1, z2));
      var d = zsub(z2, z1), val = kind === 'zSeg' ? zdiv(zsub(zmul(z2, z2), zmul(z1, z1)), Z(2)) : zadd(zmul(zconj(z1), d), Z(znorm(d).div(2)));
      var zt = zisz(z1) ? zcoef(d, 't') : ztex(z1) + zcoef(d, 't', false);
      var st = ['Parametrize: $z(t) = ' + zt + '$, $0 \\le t \\le 1$, so $z\'(t) = ' + ztex(d) + '$.'];
      if (kind === 'zSeg') st.push('$\\int_0^1 (' + zt + ')(' + ztex(d) + ')\\,dt = ' + (zisz(z1) ? '' : zpar(z1) + zpar(d) + ' + ') + zpar(zmul(d, d)) + '\\cdot\\frac{1}{2}$.', 'That is $' + ztex(val) + '$ (the same as $\\frac{z_2^2 - z_1^2}{2}$).');
      else st.push('$\\overline{z(t)} = ' + (zisz(z1) ? zcoef(zconj(d), 't') : ztex(zconj(z1)) + zcoef(zconj(d), 't', false)) + '$, and $\\overline{d}\\,d = |d|^2 = ' + qt(znorm(d)) + '$.', '$\\int_0^1 \\left(' + (zisz(z1) ? '' : zpar(zconj(z1)) + zpar(d) + ' + ') + co(qt(znorm(d))) + 't\\right)dt = ' + ztex(val) + '$.');
      return { q: 'Compute $\\displaystyle\\int_C ' + (kind === 'zSeg' ? 'z' : '\\overline{z}') + '\\,dz$, where $C$ is the segment from $' + ztex(z1) + '$ to $' + ztex(z2) + '$.', a: { t: 'num', v: zplain(val) }, steps: st,
        hint: 'Parametrize, then integrate $f(z(t))\\,z\'(t)$ from $0$ to $1$.', chk: { kind: kind, a: zplain(z1), b: zplain(z2), f: kind === 'zSeg' ? 'z' : 'conj(z)', v: zplain(val) } };
    }
    if (kind === 'zbarArc') {
      var r = R.int(2, 4), part = lvl(ctx) === 3 ? R.pick(['full', 'half', 'quarter']) : R.pick(['half', 'quarter']), fr = part === 'full' ? Q(2) : part === 'half' ? Q(1) : Q(1, 2), c = part === 'full' && lvl(ctx) === 3 ? zrand(R, -2, 2) : Z0;
      var val2 = Z(0, fr.mul(r * r)); // ∫ z̄ dz = c̄(z(β) − z(α)) + i r² (β − α); c = 0 unless full circle (then the first term is 0)
      var desc = part === 'full' ? 'the circle $' + circTex(c, r) + '$, once counterclockwise' : part === 'half' ? 'the upper half of $|z| = ' + r + '$, from $' + r + '$ to $-' + r + '$' : 'the quarter circle $|z| = ' + r + '$ from $' + r + '$ to $' + r + 'i$';
      return { q: 'Compute $\\displaystyle\\int_C \\overline{z}\\,dz$, where $C$ is ' + desc + '.', a: { t: 'num', v: zpiPlain(val2) },
        steps: ['$z = ' + (zisz(c) ? '' : ztex(c) + ' + ') + co(r) + 'e^{i\\theta}$, so $\\overline{z} = ' + (zisz(c) ? '' : ztex(zconj(c)) + ' + ') + r + 'e^{-i\\theta}$ and $dz = ' + co(r) + 'ie^{i\\theta}\\,d\\theta$, for $0 \\le \\theta \\le ' + piTex(fr) + '$.', (zisz(c) ? '' : 'The $' + ztex(zconj(c)) + '$ part integrates $' + co(r) + 'ie^{i\\theta}$ over a full turn, giving $0$. ') + 'The rest is $' + r + 'e^{-i\\theta} \\cdot ' + co(r) + 'ie^{i\\theta} = ' + (r * r) + 'i$, a constant.', '$\\int_0^{' + piTex(fr) + '} ' + (r * r) + 'i\\,d\\theta = ' + zpiTex(val2) + '$.' + (part === 'full' ? ' Not $0$: $\\overline{z}$ is not analytic, so Cauchy\'s theorem does not apply.' : '')],
        hint: 'On $|z - c| = r$, $\\overline{z}\\,dz$ simplifies a lot: $e^{-i\\theta}e^{i\\theta} = 1$.', chk: { kind: kind, c: zplain(c), r: r, fr: qp(fr), v: zpiPlain(val2) } };
    }
    if (kind === 'inv') {
      var form = R.pick(['full', 'upper', 'lower']), a = zrand(R, -3, 3), r2 = R.int(1, 3);
      if (form === 'full') return { q: 'Compute $\\displaystyle\\oint_C \\frac{dz}{' + zm(a) + '}$ around the circle $C$: $' + circTex(a, r2) + '$, once counterclockwise.', a: { t: 'num', v: '2*pi*i' },
        steps: ['$z = ' + (zisz(a) ? '' : ztex(a) + ' + ') + co(r2) + 'e^{it}$, $dz = ' + co(r2) + 'ie^{it}\\,dt$, and $' + zm(a) + ' = ' + co(r2) + 'e^{it}$.', 'The integrand becomes $\\frac{' + co(r2) + 'ie^{it}}{' + co(r2) + 'e^{it}} = i$.', '$\\int_0^{2\\pi} i\\,dt = 2\\pi i$, whatever the radius.'],
        hint: 'Parametrize around the center $' + ztex(a) + '$.', chk: { kind: 'invfull', a: zplain(a), r: r2 } };
      var up = form === 'upper';
      return { q: 'Compute $\\displaystyle\\int_C \\frac{dz}{z}$, where $C$ is the ' + (up ? 'upper' : 'lower') + ' half of $|z| = ' + r2 + '$ from $' + r2 + '$ to $-' + r2 + '$.', a: { t: 'num', v: up ? 'pi*i' : '-pi*i' },
        steps: ['$z = ' + co(r2) + 'e^{it}$ with $t$ from $0$ to $' + (up ? '\\pi' : '-\\pi') + '$' + (up ? '' : ' (clockwise along the bottom)') + '.', 'The integrand $\\frac{z\'(t)}{z(t)} = i$.', '$\\int_0^{' + (up ? '\\pi' : '-\\pi') + '} i\\,dt = ' + (up ? '' : '-') + '\\pi i$. The two halves differ by $2\\pi i$: the integral depends on the path.'],
        hint: 'The integrand simplifies to $i$; watch the limits of $t$.', chk: { kind: 'invhalf', up: up, r: r2 } };
    }
    if (kind === 'power') {
      var a2 = zrand(R, -2, 2), r5 = R.int(1, 3), n = R.pick([-3, -2, -1, 2, 3, 1, -1]), cc = Z(R.nz(-4, 4)), val3 = n === -1 ? zmul(Z(0, 2), cc) : Z0;
      return { q: 'Compute $\\displaystyle\\oint_C ' + (cc.re.eq(1) ? '' : cc.re.eq(-1) ? '-' : qt(cc.re)) + '(' + zm(a2) + ')^{' + n + '}\\,dz$, where $C$ is $' + circTex(a2, r5) + '$, once counterclockwise.', a: { t: 'num', v: zpiPlain(val3) },
        steps: ['$z - ' + zpar(a2) + ' = ' + co(r5) + 'e^{it}$, $dz = ' + co(r5) + 'ie^{it}\\,dt$.', 'The integrand becomes $' + qt(cc.re) + ' \\cdot ' + r5 + '^{' + (n + 1) + '}\\, i\\,e^{i(' + (n + 1) + ')t}$.', n === -1 ? 'With $n = -1$ the exponent is $0$: the integrand is the constant $' + zcoef(Z(0, cc.re), '') + '$, giving $' + zpiTex(val3) + '$.' : 'Over a full turn, $\\int_0^{2\\pi} e^{i(' + (n + 1) + ')t}\\,dt = 0$ because $' + (n + 1) + ' \\ne 0$. So the integral is $0$.'],
        hint: 'Every power except $(z - a)^{-1}$ integrates to $0$ around a circle centered at $a$.', chk: { kind: kind, a: zplain(a2), r: r5, n: n, c: qp(cc.re), v: zpiPlain(val3) } };
    }
    // ∫ Re z dz along two different paths
    var p = R.nz(-3, 3), qq = R.nz(-3, 3), path = R.coin(), end = Z(p, qq), v4 = path ? Z(Q(p * p, 2), p * qq) : zdiv(zmul(Z(p), end), Z(2));
    return { q: 'Compute $\\displaystyle\\int_C \\operatorname{Re}(z)\\,dz$ where $C$ goes from $0$ to $' + ztex(end) + '$ ' + (path ? 'along the real axis to $' + p + '$, then straight ' + (qq > 0 ? 'up' : 'down') + ' to $' + ztex(end) + '$.' : 'along the straight segment.'), a: { t: 'num', v: zplain(v4) },
      steps: path ? ['First leg: $z = t$ from $0$ to $' + p + '$, $\\operatorname{Re} z = t$, $dz = dt$: $\\int_0^{' + p + '} t\\,dt = ' + qt(Q(p * p, 2)) + '$.', 'Second leg: $z = ' + p + ' + it$ from $t = 0$ to $' + qq + '$, $\\operatorname{Re} z = ' + p + '$, $dz = i\\,dt$: $\\int_0^{' + qq + '} ' + co(p) + 'i\\,dt = ' + ztex(Z(0, p * qq)) + '$.', 'Total: $' + ztex(v4) + '$. The straight segment gives a different answer: $\\operatorname{Re} z$ is not analytic, so the path matters.'] : ['$z = (' + ztex(end) + ')t$, $0 \\le t \\le 1$: $\\operatorname{Re} z = ' + T.mono(p, 't') + '$ and $dz = (' + ztex(end) + ')\\,dt$.', '$\\int_0^1 ' + T.mono(p, 't') + '(' + ztex(end) + ')\\,dt = \\frac{' + p + '(' + ztex(end) + ')}{2} = ' + ztex(v4) + '$.'],
      hint: 'Parametrize each piece and add.', chk: { kind: kind, p: p, q: qq, path: path, v: zplain(v4) } };
  });

  G('cplx.ml-inequality', function (R, ctx) {
    var kind = R.pick(L(ctx, ['M', 'circle', 'seg'], ['circle', 'semi', 'seg'], ['semi', 'semi2', 'arcgrow', 'circle']));
    var a = R.int(1, 4), Rr = a + R.int(1, 6);
    if (kind === 'M') {
      return { q: 'On the circle $|z| = ' + Rr + '$, find the upper bound $M$ for $\\left|\\dfrac{1}{z^2 + ' + a * a + '}\\right|$ that comes from $|z^2 + ' + a * a + '| \\ge |z|^2 - ' + a * a + '$.', a: { t: 'num', v: '1/' + (Rr * Rr - a * a) },
        steps: ['Reverse triangle inequality: $|z^2 + ' + a * a + '| \\ge |z^2| - ' + a * a + ' = ' + Rr * Rr + ' - ' + a * a + ' = ' + (Rr * Rr - a * a) + '$.', 'A bigger denominator means a smaller fraction, so $\\left|\\frac{1}{z^2 + ' + a * a + '}\\right| \\le \\frac{1}{' + (Rr * Rr - a * a) + '} = M$.', 'Using $|z^2 + ' + a * a + '| \\le ' + (Rr * Rr + a * a) + '$ instead would give a lower bound for the fraction, not an upper one.'],
        hint: 'Bound the denominator from below.', chk: { kind: kind, a: a, R: Rr, v: 1 / (Rr * Rr - a * a) } };
    }
    if (kind === 'circle' || kind === 'semi' || kind === 'semi2') {
      var semi = kind !== 'circle', sq = kind === 'semi2', Lk = semi ? Q(Rr) : Q(2 * Rr), Mden = sq ? (Rr * Rr - a * a) * (Rr * Rr - a * a) : Rr * Rr - a * a, bound = Lk.div(Mden);
      return { q: 'Use the ML inequality to bound $\\left|\\displaystyle\\int_C \\frac{dz}{' + (sq ? '(z^2 + ' + a * a + ')^2' : 'z^2 + ' + a * a) + '}\\right|$, where $C$ is ' + (semi ? 'the upper half of $|z| = ' + Rr + '$' : 'the circle $|z| = ' + Rr + '$') + '. Give $M \\cdot L$.', a: { t: 'num', v: piPlain(bound) },
        steps: ['$L = ' + (semi ? '\\pi R = ' + piTex(Rr) : '2\\pi R = ' + piTex(2 * Rr)) + '$.', 'On $|z| = ' + Rr + '$: $|z^2 + ' + a * a + '| \\ge ' + Rr * Rr + ' - ' + a * a + ' = ' + (Rr * Rr - a * a) + '$, so $M = \\frac{1}{' + (sq ? (Rr * Rr - a * a) + '^2' : Rr * Rr - a * a) + '}' + (sq ? ' = \\frac{1}{' + Mden + '}' : '') + '$.', '$M \\cdot L = ' + piTex(bound) + '$.'],
        hint: '$L$ is the length of $C$; for $M$, bound the denominator from below.', chk: { kind: kind, a: a, R: Rr, v: piPlain(bound), f: sq ? '1/(z^2+' + a * a + ')^2' : '1/(z^2+' + a * a + ')' } };
    }
    if (kind === 'seg') {
      var z1 = Z0, z2 = R.pick([Z(3, 4), Z(4, 3), Z(0, 2), Z(2), Z(-3, 4), Z(1, 1), Z(2, -2)]), m = znorm(z2), Ls = absPlain(z2), n = R.pick([2, 3]);
      var bound = n === 2 ? radPlain(m, m.num()) : qp(m.mul(m));
      return { q: 'Bound $\\left|\\displaystyle\\int_C z^{' + n + '}\\,dz\\right|$ with the ML inequality, where $C$ is the segment from $0$ to $' + ztex(z2) + '$. Give $M \\cdot L$.', a: { t: 'num', v: bound },
        steps: ['$L = |' + ztex(z2) + '| = ' + absTex(z2) + '$.', 'On the segment, $|z| \\le ' + absTex(z2) + '$, so $|z^{' + n + '}| \\le M = (' + absTex(z2) + ')^{' + n + '}$.', '$M \\cdot L = (' + absTex(z2) + ')^{' + (n + 1) + '} = ' + T.plain(bound) + '$. (The exact value is $\\left|\\frac{(' + ztex(z2) + ')^{' + (n + 1) + '}}{' + (n + 1) + '}\\right|$, smaller, as a bound should be.)'],
        hint: 'The largest $|z|$ on the segment is at its far end.', chk: { kind: kind, z: zplain(z2), n: n, v: bound } };
    }
    // the arc of ∫ dz/(z + a) does not vanish: bound πR/(R − a) → π
    var Rb = R.pick([10, 20, 100]), ab = R.int(1, 3), bnd = Q(Rb, Rb - ab);
    return { q: 'For the upper half-circle $C_R$ of radius $R = ' + Rb + '$, the ML bound for $\\left|\\displaystyle\\int_{C_R} \\frac{dz}{z + ' + ab + '}\\right|$ is $\\frac{\\pi R}{R - ' + ab + '}$. Compute it for $R = ' + Rb + '$, and decide whether this bound tends to $0$ as $R \\to \\infty$.',
      a: { t: 'multi', parts: [{ label: 'bound:', a: { t: 'num', v: piPlain(bnd) } }, { label: 'tends to $0$?', a: { t: 'tf', v: false } }] },
      steps: ['$\\frac{\\pi \\cdot ' + Rb + '}{' + Rb + ' - ' + ab + '} = ' + piTex(bnd) + '$.', 'As $R \\to \\infty$, $\\frac{\\pi R}{R - ' + ab + '} \\to \\pi$, not $0$: the integrand only decays like $\\frac{1}{R}$, while the length grows like $R$.', 'That is why the residue method for $\\int_{-\\infty}^{\\infty}$ needs the denominator to be at least two degrees higher than the numerator.'],
      hint: 'Compare how fast $M$ shrinks with how fast $L$ grows.', chk: { kind: kind } };
  });

  G('cplx.path-independence', function (R, ctx) {
    var kind = R.pick(L(ctx, ['poly', 'poly', 'inv2'], ['exp', 'inv2', 'loop', 'poly'], ['trig', 'loop', 'exp', 'halves']));
    if (kind === 'poly') {
      var p = P([zrand(R, -2, 2), Z(R.int(-3, 3)), Z(R.pick([3, 6, -3]))]), Fp = pint(p), z1 = zrand(R, -2, 2), z2; do { z2 = zrand(R, -2, 2); } while (zeq(z1, z2));
      var val = zsub(pev(Fp, z2), pev(Fp, z1));
      return { q: 'Compute $\\displaystyle\\int_C \\left(' + ptex(p) + '\\right)dz$ along any path $C$ from $' + ztex(z1) + '$ to $' + ztex(z2) + '$.', a: { t: 'num', v: zplain(val) },
        steps: ['A polynomial has an antiderivative on the whole plane: $F(z) = ' + ptex(Fp) + '$.', 'So the integral is $F(' + ztex(z2) + ') - F(' + ztex(z1) + ')$, the same for every path.', '$F(' + ztex(z2) + ') = ' + ztex(pev(Fp, z2)) + '$ and $F(' + ztex(z1) + ') = ' + ztex(pev(Fp, z1)) + '$; the difference is $' + ztex(val) + '$.'],
        hint: 'Find an antiderivative and subtract.', chk: { kind: kind, f: pplain(p), a: zplain(z1), b: zplain(z2), v: zplain(val) } };
    }
    if (kind === 'inv2') {
      var z3 = zrand(R, -2, 2, true), z4; do { z4 = zrand(R, -2, 2); } while (zisz(z4) || zeq(z3, z4));
      var v2 = zadd(zneg(zdiv(Z1, z4)), zdiv(Z1, z3));
      return { q: 'Compute $\\displaystyle\\int_C \\frac{dz}{z^2}$ along a path $C$ from $' + ztex(z3) + '$ to $' + ztex(z4) + '$ that avoids $0$.', a: { t: 'num', v: zplain(v2) },
        steps: ['$-\\frac{1}{z}$ is an antiderivative of $\\frac{1}{z^2}$ on the plane without $0$, so any path that avoids $0$ gives the same answer.', '$\\left[-\\frac{1}{z}\\right]$ from $' + ztex(z3) + '$ to $' + ztex(z4) + '$: $-\\frac{1}{' + ztex(z4) + '} + \\frac{1}{' + ztex(z3) + '}$.', '$= ' + ztex(zneg(zdiv(Z1, z4))) + ' + ' + zpar(zdiv(Z1, z3)) + ' = ' + ztex(v2) + '$.'],
        hint: 'An antiderivative of $z^{-2}$ is $-z^{-1}$.', chk: { kind: kind, a: zplain(z3), b: zplain(z4), v: zplain(v2) } };
    }
    if (kind === 'exp') {
      var k = R.pick([1, 2, -1]), m = R.pick([Q(1, 2), Q(1), Q(3, 2)]), ang = m.mul(k), t = trigOf(ang), cv0 = qn(t.c.k), sv0 = qn(t.s.k), N = Z(cv0 - 1, sv0);
      var kT = k === 1 ? '' : k === -1 ? '-' : String(k), outP = zisz(N) ? '0' : '(' + zplain(N) + ')/(' + k + '*pi)';
      return { q: 'Compute $\\displaystyle\\int_C e^{' + kT + '\\pi z}\\,dz$ along any path from $0$ to $' + ztex(Z(0, m)) + '$.', a: { t: 'num', v: outP },
        steps: ['An antiderivative is $F(z) = \\frac{1}{' + kT + '\\pi}e^{' + kT + '\\pi z}$, defined on the whole plane, so the path does not matter.', '$F(' + ztex(Z(0, m)) + ') - F(0) = \\frac{1}{' + kT + '\\pi}\\left(e^{' + piTex(ang) + ' i} - 1\\right)$.', '$e^{' + piTex(ang) + ' i} = ' + rcTex(t.c, t.s) + '$, so the answer is ' + (zisz(N) ? '$0$.' : '$\\dfrac{' + ztex(N) + '}{' + kT + '\\pi}$.')],
        hint: 'An antiderivative of $e^{az}$ is $\\frac{1}{a}e^{az}$.', chk: { kind: kind, f: 'e^(' + k + '*pi*z)', a: '0', b: zplain(Z(0, m)), v: outP } };
    }
    if (kind === 'trig') {
      var a = R.pick([2, 3, 4]), useCos = R.coin(), ch = Q(a).add(Q(1, a)).div(2), sh = Q(a).sub(Q(1, a)).div(2), v3 = useCos ? Z(0, sh) : Z(Q(1).sub(ch));
      return { q: 'Compute $\\displaystyle\\int_C ' + (useCos ? '\\cos z' : '\\sin z') + '\\,dz$ along any path from $0$ to $i\\ln ' + a + '$.', a: { t: 'num', v: zplain(v3) },
        steps: ['Antiderivative: $' + (useCos ? '\\sin z' : '-\\cos z') + '$, entire.', useCos ? '$\\sin(i\\ln ' + a + ') - \\sin 0 = i\\sinh(\\ln ' + a + ') = i\\cdot\\frac{' + a + ' - 1/' + a + '}{2}$.' : '$-\\cos(i\\ln ' + a + ') + \\cos 0 = 1 - \\cosh(\\ln ' + a + ') = 1 - \\frac{' + a + ' + 1/' + a + '}{2}$.', 'The value is $' + ztex(v3) + '$.'],
        hint: 'Use $\\cos(iy) = \\cosh y$ and $\\sin(iy) = i\\sinh y$.', chk: { kind: kind, f: useCos ? 'cos(z)' : 'sin(z)', b: '0+i*ln(' + a + ')', v: zplain(v3) } };
    }
    if (kind === 'loop') {
      var c = zrand(R, -1, 1), r = R.int(2, 3), inside = R.coin(), pt = inside ? c : zadd(c, Z(r + 2));
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{dz}{' + zm(pt) + '}$ where $C$ is the circle $' + circTex(c, r) + '$, once counterclockwise.', a: { t: 'num', v: inside ? '2*pi*i' : '0' },
        steps: inside ? ['$\\frac{1}{' + zm(pt) + '}$ has no antiderivative on any region containing a loop around $' + ztex(pt) + '$: $\\log(' + zm(pt) + ')$ changes by $2\\pi i$ each time around.', 'Here $' + ztex(pt) + '$ is inside $C$, and the direct computation ($z - ' + zpar(pt) + ' = ' + co(r) + 'e^{it}$) gives $\\int_0^{2\\pi} i\\,dt = 2\\pi i$.'] : ['$' + ztex(pt) + '$ lies outside $C$ (its distance from $' + ztex(c) + '$ is more than $' + r + '$).', 'On a disk containing $C$ but not $' + ztex(pt) + '$, a branch of $\\log(' + zm(pt) + ')$ is an antiderivative, so the closed integral is $0$.'],
        hint: 'Is the point $' + ztex(pt) + '$ inside the loop?', chk: { kind: kind, c: zplain(c), r: r, a: zplain(pt), v: inside ? '2*pi*i' : '0' } };
    }
    // the two halves of a circle for 1/z (with Log as the wrong antiderivative)
    var r6 = R.int(1, 4);
    return { q: 'Compute $\\displaystyle\\oint_{|z| = ' + r6 + '} \\frac{dz}{z}$, once counterclockwise. (Someone claims the answer is $\\operatorname{Log}(' + r6 + ') - \\operatorname{Log}(' + r6 + ') = 0$.)', a: { t: 'num', v: '2*pi*i' },
      steps: ['$\\operatorname{Log} z$ is not an antiderivative along the whole circle: it jumps by $2\\pi i$ where the circle crosses the cut at $-' + r6 + '$.', 'Direct computation: $z = ' + co(r6) + 'e^{it}$, $\\frac{dz}{z} = i\\,dt$, so the integral is $\\int_0^{2\\pi} i\\,dt = 2\\pi i$.', 'The claim of $0$ is wrong; the jump of $\\operatorname{Log}$ across the cut is exactly the missing $2\\pi i$.'],
      hint: 'Parametrize; do not use $\\operatorname{Log}$ across its cut.', chk: { kind: kind, r: r6 } };
  });

  // ---- Cauchy's theorem and its consequences
  function pickCircle(R, pts, wantIn, margin) { // a circle |z − c| = r (c a small Gaussian integer, r a whole number or half) with the wanted points inside
    for (var tries = 0; tries < 200; tries++) {
      var c = zrand(R, -1, 1), r = Q(R.int(2, 9), 2), ok = true;
      for (var i = 0; i < pts.length && ok; i++) { var d = Math.sqrt(qn(dist2(pts[i], c))), inn = d < qn(r); if (Math.abs(d - qn(r)) < (margin || 0.4)) ok = false; if (wantIn[i] !== null && wantIn[i] !== inn) ok = false; }
      if (ok) return { c: c, r: r };
    }
    return null;
  }
  function insideC(z, C) { return dist2(z, C.c).lt(C.r.mul(C.r)); }

  G('cplx.cauchy-theorem', function (R, ctx) {
    var kind = R.pick(L(ctx, ['zero', 'which', 'count'], ['outside', 'which', 'count', 'zero'], ['zbar', 'outside', 'which', 'count']));
    if (kind === 'zero') {
      var fs = ['e^{z^{2}}', 'z^{3}\\cos z', '\\sin(z^{2}) + 4z', 'e^{z}(z^{2} - 5i)', '\\cos(2z) - z^{7}'], f = R.pick(fs), C = { c: zrand(R, -2, 2), r: Q(R.int(1, 5)) };
      return { q: 'Compute $\\displaystyle\\oint_C ' + f + '\\,dz$, where $C$ is the circle $' + circTex(C.c, C.r) + '$.', a: { t: 'num', v: '0' },
        steps: ['The integrand is entire (built from polynomials, $e^z$, $\\sin$ and $\\cos$), so it is analytic on and inside $C$.', 'By Cauchy\'s theorem, the integral is $0$.'],
        hint: 'Is there any point where the integrand fails to be analytic?', chk: { kind: kind } };
    }
    if (kind === 'which') {
      var Rr = R.int(1, 3), aOut = Rr + R.int(1, 3), aIn = R.int(0, Rr - 1);
      var good = '$\\displaystyle\\oint_{|z| = ' + Rr + '} \\frac{dz}{z - ' + aOut + '}$', bad = ['$\\displaystyle\\oint_{|z| = ' + Rr + '} \\frac{dz}{z' + (aIn ? ' - ' + aIn : '') + '}$', '$\\displaystyle\\oint_{|z| = ' + Rr + '} \\overline{z}\\,dz$', '$\\displaystyle\\oint_{|z| = ' + (aOut + 1) + '} \\frac{dz}{z - ' + aOut + '}$', '$\\displaystyle\\oint_{|z| = ' + Rr + '} \\frac{dz}{z^{2}}$'.replace('z^{2}}', 'z^{2}}')];
      bad = bad.slice(0, 3); // the last one is 0 too (by deformation), so it is left out of the choices
      return { q: 'Which integral is $0$ by Cauchy\'s theorem (the integrand is analytic on and inside the contour)?', a: mcSpec(good, bad),
        steps: ['Cauchy\'s theorem needs the integrand analytic at every point on and inside the contour.', '$\\frac{1}{z - ' + aOut + '}$ fails only at $' + aOut + '$, outside $|z| = ' + Rr + '$: the theorem applies, so that integral is $0$.', 'The others: a singular point inside the contour, or $\\overline{z}$, which is not analytic anywhere.'],
        hint: 'Find the bad points of each integrand and check whether they are inside.', chk: { kind: kind } };
    }
    if (kind === 'count') {
      var b = R.int(1, 3), rs = [Z(0, b), Z(0, -b), Z(R.pick([-3, 3]))], want = [R.coin(), R.coin(), R.coin()]; if (!want.some(Boolean)) want[0] = true;
      var C2 = pickCircle(R, rs, want), n = 0;
      if (!C2) { C2 = { c: Z0, r: Q(b).add(Q(1, 2)) }; } rs.forEach(function (z) { if (insideC(z, C2)) n++; });
      return { q: 'How many points where $f(z) = \\dfrac{1}{(z^2 + ' + b * b + ')(' + zm(rs[2]) + ')}$ is not analytic lie inside the circle $' + circTex(C2.c, C2.r) + '$?', a: { t: 'num', v: String(n) },
        steps: ['$f$ fails to be analytic at $' + rs.map(ztex).join(',\\ ') + '$.', 'Distances from the center $' + ztex(C2.c) + '$: ' + rs.map(function (z) { return '$' + distTex(z, C2.c) + ' = ' + absTex(zsub(z, C2.c)) + '$'; }).join(', ') + '; the radius is $' + qt(C2.r) + '$.', n + ' of them ' + (n === 1 ? 'is' : 'are') + ' inside. ' + (n ? 'So Cauchy\'s theorem does not apply to $f$ on this circle.' : 'So the integral of $f$ around it is $0$.')],
        hint: 'Compare each distance to the center with the radius.', chk: { kind: kind, pts: rs.map(zplain), c: zplain(C2.c), r: qp(C2.r), n: n } };
    }
    if (kind === 'outside') {
      var a = zrand(R, -4, 4), C3 = pickCircle(R, [a], [false]) || { c: Z0, r: Q(1, 2) }, g = R.pick(['e^{z}', 'z^{2} + 1', '\\cos z', 'z^{3}']);
      if (insideC(a, C3)) C3 = { c: zadd(a, Z(3)), r: Q(1) };
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + g + '}{' + zm(a) + '}\\,dz$, where $C$ is $' + circTex(C3.c, C3.r) + '$.', a: { t: 'num', v: '0' },
        steps: ['The only bad point is $z = ' + ztex(a) + '$.', '$' + distTex(a, C3.c) + ' = ' + absTex(zsub(a, C3.c)) + ' > ' + qt(C3.r) + '$: it lies outside $C$.', 'The integrand is analytic on and inside $C$, so the integral is $0$.'],
        hint: 'Where is $' + zm(a) + ' = 0$, and is that inside $C$?', chk: { kind: kind, a: zplain(a), c: zplain(C3.c), r: qp(C3.r) } };
    }
    var r = R.int(2, 3), c4 = zrand(R, -2, 2);
    return { q: 'Compute $\\displaystyle\\oint_C \\overline{z}\\,dz$ around $C$: $' + circTex(c4, r) + '$. (Does Cauchy\'s theorem apply?)', a: { t: 'num', v: zpiPlain(Z(0, 2 * r * r)) },
      steps: ['$\\overline{z}$ is not analytic, so Cauchy\'s theorem says nothing here.', 'Parametrize: $z = ' + (zisz(c4) ? '' : ztex(c4) + ' + ') + r + 'e^{it}$: the $\\overline{c}$ part integrates to $0$, and $' + r + 'e^{-it} \\cdot ' + r + 'ie^{it} = ' + (r * r) + 'i$.', 'Total: $2\\pi \\cdot ' + (r * r) + 'i = ' + zpiTex(Z(0, 2 * r * r)) + '$, not $0$. (It is $2i$ times the area inside, as Green\'s theorem predicts.)'],
      hint: 'Check the hypothesis first: is $\\overline{z}$ analytic?', chk: { kind: kind, c: zplain(c4), r: r } };
  });

  G('cplx.deformation', function (R, ctx) {
    var kind = R.pick(L(ctx, ['pow', 'pow', 'square'], ['sum', 'square', 'pf'], ['pf', 'sum', 'pf']));
    if (kind === 'pow' || kind === 'square') {
      var a = zrand(R, -2, 2), n = R.pick([1, 2, 3, 1, 4]), k = Z(R.nz(-4, 4)), val = n === 1 ? zmul(Z(0, 2), k) : Z0;
      var cont = kind === 'square' ? 'the square with corners $' + ztex(zadd(a, Z(-3, -3))) + '$ and $' + ztex(zadd(a, Z(3, 3))) + '$ (sides parallel to the axes), counterclockwise' : 'the ellipse $\\frac{' + sqv('x', a.re) + '}{9} + \\frac{' + sqv('y', a.im) + '}{4} = 1$, counterclockwise';
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + qt(k.re) + '}{' + (n === 1 ? zm(a) : '(' + zm(a) + ')^{' + n + '}') + '}\\,dz$, where $C$ is ' + cont + '.', a: { t: 'num', v: zpiPlain(val) },
        steps: ['The integrand is analytic except at $' + ztex(a) + '$, which is inside $C$. So $C$ can be shrunk to a small circle $|' + zm(a) + '| = \\varepsilon$ without changing the integral.', 'On that circle, $\\oint (z - a)^{-' + n + '}\\,dz = ' + (n === 1 ? '2\\pi i' : '0') + '$' + (n === 1 ? '' : ' because $(z - a)^{-' + n + '}$ has the antiderivative $\\frac{(z - a)^{' + (1 - n) + '}}{' + (1 - n) + '}$') + '.', 'Times $' + qt(k.re) + '$: $' + zpiTex(val) + '$.'],
        hint: 'Shrink the contour to a small circle around $' + ztex(a) + '$.', chk: { kind: kind, a: zplain(a), n: n, k: qp(k.re), v: zpiPlain(val) } };
    }
    if (kind === 'sum') {
      var pts = [zrand(R, -3, 3), zrand(R, -3, 3), zrand(R, -3, 3)]; while (zeq(pts[0], pts[1]) || zeq(pts[1], pts[2]) || zeq(pts[0], pts[2])) pts = [zrand(R, -3, 3), zrand(R, -3, 3), zrand(R, -3, 3)];
      var co3 = [R.nz(-5, 5), R.nz(-5, 5), R.nz(-5, 5)], pw = [1, R.pick([1, 2]), 1], want = [true, R.coin(), false];
      var C = pickCircle(R, pts, want) || pickCircle(R, pts, [null, null, null]) || { c: Z0, r: Q(9, 2) };
      var tot = Z0; pts.forEach(function (z, i) { if (insideC(z, C) && pw[i] === 1) tot = zadd(tot, Z(co3[i])); });
      var val2 = zmul(Z(0, 2), tot), terms = pts.map(function (z, i) { return '\\frac{' + co3[i] + '}{' + (pw[i] === 1 ? zm(z) : '(' + zm(z) + ')^{2}') + '}'; }).join(' + ').replace(/\+ \\frac\{-/g, '- \\frac{');
      return { q: 'Compute $\\displaystyle\\oint_C \\left(' + terms + '\\right)dz$, where $C$ is $' + circTex(C.c, C.r) + '$.', a: { t: 'num', v: zpiPlain(val2) },
        steps: ['Split into three integrals. A term whose point is outside $C$ gives $0$ (Cauchy). A term $\\frac{A}{z - a}$ with $a$ inside gives $2\\pi i A$; a term $\\frac{A}{(z - a)^2}$ gives $0$ wherever $a$ is.', 'Inside $C$: ' + (pts.filter(function (z) { return insideC(z, C); }).map(ztex).join(', ') || 'none') + '.', 'Total: $2\\pi i \\cdot ' + zpar(tot) + ' = ' + zpiTex(val2) + '$.'],
        hint: 'Treat each term separately.', chk: { kind: kind, pts: pts.map(zplain), co: co3, pw: pw, c: zplain(C.c), r: qp(C.r), v: zpiPlain(val2) } };
    }
    // partial fractions: 1/((z − a)(z − b))
    var a2 = Z(R.nz(-3, 3)), b2; do { b2 = R.pick([Z(R.nz(-3, 3)), Z(0, R.nz(-3, 3))]); } while (zeq(a2, b2));
    var which = R.pick(['a', 'b', 'both']), want2 = which === 'a' ? [true, false] : which === 'b' ? [false, true] : [true, true], C5 = pickCircle(R, [a2, b2], want2, 0.35);
    if (!C5) { C5 = pickCircle(R, [a2, b2], [true, true], 0.35) || { c: Z0, r: Q(9, 2) }; }
    var ia = insideC(a2, C5), ib = insideC(b2, C5), A = zdiv(Z1, zsub(a2, b2)), tot2 = zadd(ia ? A : Z0, ib ? zneg(A) : Z0), val3 = zmul(Z(0, 2), tot2);
    return { q: 'Compute $\\displaystyle\\oint_C \\frac{dz}{(' + zm(a2) + ')(' + zm(b2) + ')}$, where $C$ is $' + circTex(C5.c, C5.r) + '$.', a: { t: 'num', v: zpiPlain(val3) },
      steps: ['Partial fractions: $\\frac{1}{(z - a)(z - b)} = \\frac{1}{a - b}\\left(\\frac{1}{z - a} - \\frac{1}{z - b}\\right)$ with $a = ' + ztex(a2) + '$, $b = ' + ztex(b2) + '$, and $\\frac{1}{a - b} = ' + ztex(A) + '$.', '$' + ztex(a2) + '$ is ' + (ia ? 'inside' : 'outside') + ' $C$ and $' + ztex(b2) + '$ is ' + (ib ? 'inside' : 'outside') + '.', 'Each inside point contributes $\\pm 2\\pi i \\cdot ' + zpar(A) + '$: total $' + zpiTex(val3) + '$.' + (ia && ib ? ' Both inside: the two contributions cancel.' : '')],
      hint: 'Split with partial fractions, then use $\\oint \\frac{dz}{z - a} = 2\\pi i$ or $0$.', chk: { kind: kind, a: zplain(a2), b: zplain(b2), c: zplain(C5.c), r: qp(C5.r), v: zpiPlain(val3) } };
  });

  G('cplx.cauchy-integral-formula', function (R, ctx) {
    var kind = R.pick(L(ctx, ['poly', 'poly', 'exp'], ['exp', 'outside', 'quad', 'poly'], ['quad', 'trig', 'exp', 'quad']));
    if (kind === 'poly' || kind === 'outside') {
      var p = P([Z(R.int(-4, 4)), Z(R.int(-3, 3)), Z(R.nz(-2, 2))]), a = zrand(R, -2, 2), out = kind === 'outside' && R.chance(0.7), C = pickCircle(R, [a], [!out]) || { c: a, r: Q(1) };
      var val = insideC(a, C) ? zmul(Z(0, 2), pev(p, a)) : Z0;
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + ptex(p) + '}{' + zm(a) + '}\\,dz$, where $C$ is $' + circTex(C.c, C.r) + '$.', a: { t: 'num', v: zpiPlain(val) },
        steps: insideC(a, C) ? ['$f(z) = ' + ptex(p) + '$ is entire and $a = ' + ztex(a) + '$ is inside $C$ (distance $' + absTex(zsub(a, C.c)) + ' < ' + qt(C.r) + '$ from the center).', 'Cauchy\'s formula: $\\oint_C \\frac{f(z)}{z - a}\\,dz = 2\\pi i f(a)$.', '$f(' + ztex(a) + ') = ' + ztex(pev(p, a)) + '$, so the integral is $' + zpiTex(val) + '$.'] : ['$a = ' + ztex(a) + '$ is outside $C$ (distance $' + absTex(zsub(a, C.c)) + ' > ' + qt(C.r) + '$).', 'Then the whole integrand is analytic on and inside $C$, and Cauchy\'s theorem gives $0$, not $2\\pi i f(a)$.'],
        hint: 'Check that $a$ is inside, then use $2\\pi i f(a)$.', chk: { kind: kind, f: '(' + pplain(p) + ')/(z-(' + zplain(a) + '))', c: zplain(C.c), r: qp(C.r), v: zpiPlain(val) } };
    }
    if (kind === 'exp') {
      var opt = R.pick([['ln', 2, 1], ['ln', 3, 1], ['ln', 2, 2], ['ln', 3, 2], ['pi', Q(1, 2), 1], ['pi', Q(1, 2), 2], ['pi', Q(1), 1], ['pi', Q(1, 2), 3]]), kk = opt[2], aT, aP, fa, Rr;
      if (opt[0] === 'ln') { aT = '\\ln ' + opt[1]; aP = 'ln(' + opt[1] + ')'; fa = Z(Math.pow(opt[1], kk)); Rr = 2; }
      else { aT = piTex(opt[1]) + ' i'; aP = piPlain(opt[1]) + '*i'; var t = trigOf(q(opt[1]).mul(kk)); fa = Z(t.c.k, t.s.k); Rr = opt[1].eq(1) ? 4 : 2; }
      var val2 = zmul(Z(0, 2), fa);
      return { q: 'Compute $\\displaystyle\\oint_{|z| = ' + Rr + '} \\frac{e^{' + (kk === 1 ? '' : kk) + 'z}}{z - ' + aT + '}\\,dz$.', a: { t: 'num', v: zpiPlain(val2) },
        steps: ['$a = ' + aT + '$ has $|a| < ' + Rr + '$, so it is inside the circle, and $f(z) = e^{' + (kk === 1 ? '' : kk) + 'z}$ is entire.', '$\\oint \\frac{f(z)}{z - a}\\,dz = 2\\pi i f(a)$, with $f(a) = e^{' + (kk === 1 ? '' : kk) + '(' + aT + ')} = ' + ztex(fa) + '$.', 'The integral is $' + zpiTex(val2) + '$.'],
        hint: 'Evaluate $e^{' + (kk === 1 ? '' : kk) + 'z}$ at the point.', chk: { kind: kind, f: 'e^(' + kk + '*z)/(z-(' + aP + '))', c: '0', r: String(Rr), v: zpiPlain(val2) } };
    }
    if (kind === 'quad') {
      var b = R.int(1, 3), p2 = P([Z(R.int(-3, 3)), Z(R.int(-3, 3)), Z(R.nz(-2, 2))]), up = R.coin(), a2 = Z(0, up ? b : -b), fa2 = pev(p2, a2), v3 = zmul(Z(0, 2), zdiv(fa2, zscale(2, a2))); // 2πi f(a)/(2a)
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + ptex(p2) + '}{z^2 + ' + b * b + '}\\,dz$, where $C$ is $' + circTex(a2, Q(b)) + '$.', a: { t: 'num', v: zpiPlain(v3) },
        steps: ['$z^2 + ' + b * b + ' = (' + zm(Z(0, b)) + ')(' + zm(Z(0, -b)) + ')$. Only $' + ztex(a2) + '$ is inside $C$ (the other point is $' + 2 * b + '$ away from the center).', 'Write the integrand as $\\frac{g(z)}{' + zm(a2) + '}$ with $g(z) = \\frac{' + ptex(p2) + '}{' + zm(zneg(a2)) + '}$, analytic inside $C$.', '$g(' + ztex(a2) + ') = \\frac{' + ztex(fa2) + '}{' + ztex(zscale(2, a2)) + '} = ' + ztex(zdiv(fa2, zscale(2, a2))) + '$, so the integral is $2\\pi i\\,g(' + ztex(a2) + ') = ' + zpiTex(v3) + '$.'],
        hint: 'Factor the denominator and keep the factor that vanishes inside $C$.', chk: { kind: kind, f: '(' + pplain(p2) + ')/(z^2+' + b * b + ')', c: zplain(a2), r: String(b), v: zpiPlain(v3) } };
    }
    var a3 = R.pick([2, 3, 4, 5]), ch = Q(a3).add(Q(1, a3)).div(2), v4 = zmul(Z(0, 2), Z(ch));
    return { q: 'Compute $\\displaystyle\\oint_{|z| = 2} \\frac{\\cos z}{z - i\\ln ' + a3 + '}\\,dz$.', a: { t: 'num', v: zpiPlain(v4) },
      steps: ['$|i\\ln ' + a3 + '| = \\ln ' + a3 + ' < 2$, so the point is inside the circle, and $\\cos z$ is entire.', '$2\\pi i\\cos(i\\ln ' + a3 + ') = 2\\pi i\\cosh(\\ln ' + a3 + ') = 2\\pi i \\cdot \\frac{' + a3 + ' + 1/' + a3 + '}{2}$.', 'That is $' + zpiTex(v4) + '$.'],
      hint: 'Use $\\cos(iy) = \\cosh y$.', chk: { kind: kind, f: 'cos(z)/(z-i*ln(' + a3 + '))', c: '0', r: '2', v: zpiPlain(v4) } };
  });

  G('cplx.cauchy-derivatives', function (R, ctx) {
    var kind = R.pick(L(ctx, ['exp0', 'poly', 'exp0'], ['poly', 'sin', 'order'], ['twopole', 'poly', 'sin', 'twopole']));
    if (kind === 'exp0') {
      var k = R.pick([1, 2, 3, -1, -2]), n = R.int(1, 3), val = zmul(Z(0, 2), Z(Q(Math.pow(k, n), fact(n)))), Rr = R.int(1, 3);
      return { q: 'Compute $\\displaystyle\\oint_{|z| = ' + Rr + '} \\frac{e^{' + (k === 1 ? '' : k === -1 ? '-' : k) + 'z}}{z^{' + (n + 1) + '}}\\,dz$.', a: { t: 'num', v: zpiPlain(val) },
        steps: ['Cauchy\'s formula for derivatives: $\\oint \\frac{f(z)}{(z - a)^{n + 1}}\\,dz = \\frac{2\\pi i}{n!}f^{(n)}(a)$. Here $a = 0$ and $n + 1 = ' + (n + 1) + '$, so $n = ' + n + '$.', '$f(z) = e^{' + (k === 1 ? '' : k === -1 ? '-' : k) + 'z}$ has $f^{(' + n + ')}(0) = ' + (k === 1 ? '' : T.p(k) + '^{' + n + '} = ') + Math.pow(k, n) + '$.', '$\\frac{2\\pi i}{' + fact(n) + '} \\cdot ' + T.p(Math.pow(k, n)) + ' = ' + zpiTex(val) + '$.'],
        hint: 'The power $n + 1$ in the denominator means the $n$th derivative.', chk: { kind: kind, f: 'e^(' + k + '*z)/z^' + (n + 1), c: '0', r: String(Rr), v: zpiPlain(val) } };
    }
    if (kind === 'poly') {
      var p = P([Z(R.int(-3, 3)), Z(R.int(-3, 3)), Z(R.int(-3, 3)), Z(R.nz(-2, 2)), lvl(ctx) === 3 ? Z(R.int(-1, 1)) : Z0]), a = zrand(R, -1, 1), n2 = R.int(1, 3), sh = pshift(p, a), coef = sh[n2] || Z0, v2 = zmul(Z(0, 2), coef), C = { c: a, r: Q(R.int(1, 2)) };
      var deriv = p; for (var j = 0; j < n2; j++) deriv = pder(deriv);
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + ptex(p) + '}{(' + zm(a) + ')^{' + (n2 + 1) + '}}\\,dz$, where $C$ is $' + circTex(C.c, C.r) + '$.', a: { t: 'num', v: zpiPlain(v2) },
        steps: ['$n + 1 = ' + (n2 + 1) + '$, so this is $\\frac{2\\pi i}{' + n2 + '!}f^{(' + n2 + ')}(' + ztex(a) + ')$ with $f(z) = ' + ptex(p) + '$.', '$f^{(' + n2 + ')}(z) = ' + ptex(deriv) + '$, so $f^{(' + n2 + ')}(' + ztex(a) + ') = ' + ztex(pev(deriv, a)) + '$.', '$\\frac{2\\pi i}{' + fact(n2) + '} \\cdot ' + zpar(pev(deriv, a)) + ' = ' + zpiTex(v2) + '$.'],
        hint: 'Differentiate $n$ times, evaluate at the center, divide by $n!$.', chk: { kind: kind, f: '(' + pplain(p) + ')/(z-(' + zplain(a) + '))^' + (n2 + 1), c: zplain(a), r: qp(C.r), v: zpiPlain(v2) } };
    }
    if (kind === 'sin') {
      var useSin = R.coin(), n3 = R.int(1, 5), d = useSin ? [0, 1, 0, -1][n3 % 4] : [1, 0, -1, 0][n3 % 4], v3 = zmul(Z(0, 2), Z(Q(d, fact(n3))));
      return { q: 'Compute $\\displaystyle\\oint_{|z| = 1} \\frac{\\' + (useSin ? 'sin' : 'cos') + ' z}{z^{' + (n3 + 1) + '}}\\,dz$.', a: { t: 'num', v: zpiPlain(v3) },
        steps: ['This is $\\frac{2\\pi i}{' + n3 + '!}f^{(' + n3 + ')}(0)$ with $f = \\' + (useSin ? 'sin' : 'cos') + '$.', 'The derivatives of $\\' + (useSin ? 'sin' : 'cos') + '$ at $0$ cycle through $' + (useSin ? '0, 1, 0, -1' : '1, 0, -1, 0') + '$ (starting with the function itself): $f^{(' + n3 + ')}(0) = ' + d + '$.', 'Result: $' + zpiTex(v3) + '$.'],
        hint: 'Find the $n$th derivative at $0$ from the cycle.', chk: { kind: kind, f: (useSin ? 'sin' : 'cos') + '(z)/z^' + (n3 + 1), c: '0', r: '1', v: zpiPlain(v3) } };
    }
    if (kind === 'order') {
      var m = R.int(2, 5);
      return { q: 'Cauchy\'s formula writes $\\displaystyle\\oint_C \\frac{f(z)}{(z - a)^{' + m + '}}\\,dz$ as $\\frac{2\\pi i}{k!}f^{(k)}(a)$. Find $k$ and $k!$.', a: { t: 'multi', parts: [{ label: '$k =$', a: { t: 'num', v: String(m - 1) } }, { label: '$k! =$', a: { t: 'num', v: String(fact(m - 1)) } }] },
        steps: ['The power in the denominator is $k + 1$.', 'So $k = ' + (m - 1) + '$ (not $' + m + '$), and $k! = ' + fact(m - 1) + '$.'],
        hint: 'The power is one more than the order of the derivative.', chk: { kind: kind } };
    }
    // f/((z − a)²(z − b)) around a only: the residue at a
    var a4 = zrand(R, -1, 1), b4; do { b4 = zrand(R, -3, 3); } while (dist2(a4, b4).lt(5));
    var f4 = P([Z(R.int(-3, 3)), Z(R.nz(-3, 3))]), roots = [{ z: a4, m: 2 }, { z: b4, m: 1 }], res = resRat(f4, roots, a4).res, v5 = zmul(Z(0, 2), res);
    var g1 = zdiv(pev(pder(f4), a4), zsub(a4, b4)), g2 = zdiv(pev(f4, a4), zmul(zsub(a4, b4), zsub(a4, b4)));
    return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + ptex(f4) + '}{(' + zm(a4) + ')^{2}(' + zm(b4) + ')}\\,dz$, where $C$ is $' + circTex(a4, Q(1)) + '$.', a: { t: 'num', v: zpiPlain(v5) },
      steps: ['Only $' + ztex(a4) + '$ is inside $C$. Write the integrand as $\\frac{g(z)}{(z - a)^2}$ with $g(z) = \\frac{' + ptex(f4) + '}{' + zm(b4) + '}$.', 'Cauchy\'s formula with $n = 1$: the integral is $2\\pi i\\,g\'(a)$, and $g\'(z) = \\frac{f\'(z)}{z - b} - \\frac{f(z)}{(z - b)^2}$.', 'At $a = ' + ztex(a4) + '$: $g\'(a) = ' + ztex(g1) + (zisz(g2) ? '' : ' - ' + zpar(g2)) + ' = ' + ztex(res) + '$.', 'The integral is $' + zpiTex(v5) + '$.'],
      hint: 'Put the factor that does not vanish inside $C$ into $g$, then use the first-derivative formula.', chk: { kind: kind, f: '(' + pplain(f4) + ')/((z-(' + zplain(a4) + '))^2*(z-(' + zplain(b4) + ')))', c: zplain(a4), r: '1', v: zpiPlain(v5) } };
  });

  G('cplx.liouville', function (R, ctx) {
    var kind = R.pick(L(ctx, ['const', 'tf', 'fta'], ['estimate', 'const', 'tf'], ['grow', 'estimate', 'reale']));
    if (kind === 'const') {
      var M0 = R.int(3, 12), w0 = zrand(R, -2, 2), z0 = zrand(R, -3, 3), z1 = zrand(R, -5, 5); while (znorm(w0).gt(M0 * M0)) w0 = Z(1);
      return { q: 'An entire function $f$ satisfies $|f(z)| \\le ' + M0 + '$ for every $z$, and $f(' + ztex(z0) + ') = ' + ztex(w0) + '$. Find $f(' + ztex(z1) + ')$.', a: { t: 'num', v: zplain(w0) },
        steps: ['$f$ is entire and bounded, so by Liouville\'s theorem it is constant.', 'The constant is $f(' + ztex(z0) + ') = ' + ztex(w0) + '$, so $f(' + ztex(z1) + ') = ' + ztex(w0) + '$ too.'],
        hint: 'What does Liouville\'s theorem say about a bounded entire function?', chk: { kind: kind } };
    }
    if (kind === 'tf') {
      var cs = [['$\\sin z$ is bounded on the whole complex plane.', false, '$|\\sin(iy)| = |\\sinh y|$ grows without bound. (If it were bounded, Liouville would force it to be constant.)'],
        ['$e^{iz}$ is bounded on the whole complex plane.', false, '$|e^{iz}| = e^{-y}$, which is huge for large negative $y$.'],
        ['Every bounded entire function is constant.', true, 'That is Liouville\'s theorem.'],
        ['A nonconstant polynomial can be bounded on the whole complex plane.', false, '$|p(z)| \\to \\infty$ as $|z| \\to \\infty$ for a nonconstant polynomial; by Liouville, a bounded one would be constant anyway.'],
        ['$\\dfrac{1}{1 + z^2}$ is a bounded entire function.', false, 'It is not entire: it has poles at $\\pm i$, where it is not even bounded.'],
        ['If $f$ is entire and never $0$, then $1/f$ is entire.', true, '$1/f$ is a quotient of entire functions whose bottom never vanishes.']], c = R.pick(cs);
      return { q: 'True or false: ' + c[0], a: { t: 'tf', v: c[1] }, steps: [c[2]], hint: 'Test the statement on the imaginary axis, or recall Liouville\'s theorem.', chk: { kind: kind } };
    }
    if (kind === 'fta') {
      var rs = [R.nz(-3, 3), R.nz(-3, 3)], m = R.int(1, 3), b = R.int(1, 3), deg = 2 + m + 2;
      return { q: 'How many complex zeros, counted with multiplicity, does $p(z) = (z ' + (rs[0] < 0 ? '+ ' + -rs[0] : '- ' + rs[0]) + ')(z ' + (rs[1] < 0 ? '+ ' + -rs[1] : '- ' + rs[1]) + ')^{' + m + '}(z^2 + ' + b * b + ')$ have?', a: { t: 'num', v: String(1 + m + 2) },
        steps: ['The fundamental theorem of algebra (proved with Liouville: if $p$ had no zero, $1/p$ would be bounded and entire, hence constant) says a polynomial of degree $n$ has exactly $n$ zeros counted with multiplicity.', 'The degree is $1 + ' + m + ' + 2 = ' + (3 + m) + '$: the zeros are $' + rs[0] + '$, $' + rs[1] + '$ (' + m + ' time' + (m > 1 ? 's' : '') + ') and $\\pm ' + (b === 1 ? '' : b) + 'i$.'],
        hint: 'Add up the degrees of the factors.', chk: { kind: kind } };
    }
    if (kind === 'estimate') {
      var Mv = R.int(2, 20), Rr = R.int(2, 5), n = R.int(1, 3), bnd = Q(fact(n) * Mv, Math.pow(Rr, n));
      return { q: 'Suppose $f$ is analytic on and inside $|z| = ' + Rr + '$ and $|f(z)| \\le ' + Mv + '$ on that circle. Use Cauchy\'s estimate to bound $|f^{(' + n + ')}(0)|$.', a: { t: 'num', v: qp(bnd) },
        steps: ['$f^{(n)}(0) = \\frac{n!}{2\\pi i}\\oint \\frac{f(z)}{z^{n + 1}}\\,dz$, and the ML inequality gives $|f^{(n)}(0)| \\le \\frac{n!}{2\\pi} \\cdot \\frac{M}{R^{n + 1}} \\cdot 2\\pi R = \\frac{n!\\,M}{R^n}$.', '$\\frac{' + fact(n) + ' \\cdot ' + Mv + '}{' + Rr + '^{' + n + '}} = ' + qt(bnd) + '$.'],
        hint: 'Cauchy\'s estimate: $|f^{(n)}(a)| \\le n!\\,M/R^n$.', chk: { kind: kind, M: Mv, R: Rr, n: n, v: qp(bnd) } };
    }
    if (kind === 'grow') {
      var mm = R.int(1, 4), A = R.int(2, 9), B = R.int(1, 9);
      return { q: 'An entire function satisfies $|f(z)| \\le ' + A + '|z|^{' + mm + '} + ' + B + '$ for all $z$. Cauchy\'s estimate on $|z| = R$, with $R \\to \\infty$, shows that $f^{(k)}(0) = 0$ for every $k \\ge k_0$. Find the smallest such $k_0$.', a: { t: 'num', v: String(mm + 1) },
        steps: ['$|f^{(k)}(0)| \\le \\frac{k!\\,(' + A + 'R^{' + mm + '} + ' + B + ')}{R^k}$ for every $R$.', 'If $k > ' + mm + '$, the right side tends to $0$ as $R \\to \\infty$, so $f^{(k)}(0) = 0$. For $k \\le ' + mm + '$ it does not.', 'So $k_0 = ' + (mm + 1) + '$: $f$ is a polynomial of degree at most $' + mm + '$ (Liouville is the case $' + mm + ' = 0$).'],
        hint: 'Compare the powers of $R$ in the estimate.', chk: { kind: kind } };
    }
    var c3 = R.int(1, 5), w3 = Z(R.int(-c3 - 3, c3), R.int(-3, 3)); while (w3.re.gt(c3)) w3 = Z(c3, w3.im);
    var zA = zrand(R, -3, 3), zB = zrand(R, -6, 6);
    return { q: 'An entire function has $\\operatorname{Re} f(z) \\le ' + c3 + '$ for every $z$, and $f(' + ztex(zA) + ') = ' + ztex(w3) + '$. Find $f(' + ztex(zB) + ')$.', a: { t: 'num', v: zplain(w3) },
      steps: ['$g = e^{f}$ is entire with $|g| = e^{\\operatorname{Re} f} \\le e^{' + c3 + '}$: bounded.', 'By Liouville, $g$ is constant; then $g\' = f\'e^{f} = 0$ forces $f\' = 0$, so $f$ is constant.', '$f(' + ztex(zB) + ') = f(' + ztex(zA) + ') = ' + ztex(w3) + '$.'],
      hint: 'Exponentiate: $|e^{f}| = e^{\\operatorname{Re} f}$.', chk: { kind: kind } };
  });

  G('cplx.maximum-modulus', function (R, ctx) {
    var kind = R.pick(L(ctx, ['linear', 'where', 'linear'], ['exp', 'poly', 'linear'], ['min', 'exp', 'poly', 'min']));
    if (kind === 'linear') {
      var t = R.pick([[3, 4, 5], [4, 3, 5], [0, 2, 2], [2, 0, 2], [0, 3, 3], [6, 8, 10], [5, 12, 13], [1, 0, 1]]), s1 = R.sign(), s2 = R.sign(), a = Z(s1 * t[0], s2 * t[1]), Rr = R.int(1, 4), pt = zscale(Q(Rr, t[2]), a);
      return { q: 'Find the maximum of $|' + zm(zneg(a)) + '|$ on the closed disk $|z| \\le ' + Rr + '$, and the point where it happens.',
        a: { t: 'multi', parts: [{ label: 'maximum:', a: { t: 'num', v: String(Rr + t[2]) } }, { label: 'at $z =$', a: { t: 'num', v: zplain(pt) } }] },
        steps: ['$f(z) = z + ' + zpar(a) + '$ is analytic and nonconstant, so its largest modulus on the closed disk is on the circle $|z| = ' + Rr + '$.', '$|z + a| \\le |z| + |a| = ' + Rr + ' + ' + t[2] + '$, with equality when $z$ points the same way as $a$: $z = ' + Rr + '\\frac{a}{|a|} = ' + ztex(pt) + '$.', 'Maximum $' + (Rr + t[2]) + '$ at $z = ' + ztex(pt) + '$, on the boundary.'],
        hint: 'Make $z$ point the same way as $' + ztex(a) + '$.', chk: { kind: kind, a: zplain(a), R: Rr } };
    }
    if (kind === 'where') {
      return { q: 'Let $f$ be analytic and nonconstant on the open disk $|z| < 2$ and continuous on the closed disk. Where does $|f|$ reach its maximum over the closed disk?', a: mcSpec('somewhere on the circle $|z| = 2$', ['at a point where $f\'(z) = 0$', 'at the center $z = 0$', 'at an interior point where $|f|$ has a local maximum']),
        steps: ['The maximum modulus principle: a nonconstant analytic function has no local maximum of $|f|$ inside its domain.', 'Since $|f|$ is continuous on the closed disk, it has a maximum somewhere; it cannot be inside, so it is on the boundary circle.'],
        hint: 'Interior points are ruled out.', chk: { kind: kind } };
    }
    if (kind === 'exp') {
      var k = R.pick([Z(1), Z(-1), Z(0, 1), Z(0, -1), Z(2), Z(0, 2), Z(0, -3)]), Rr2 = R.int(1, 3), kab = Math.sqrt(qn(znorm(k))), pt2 = zscale(Q(Rr2, kab), zconj(k));
      return { q: 'Find the maximum of $|e^{' + zcoef(k, 'z') + '}|$ on the closed disk $|z| \\le ' + Rr2 + '$, and the point where it happens.', a: { t: 'multi', parts: [{ label: 'maximum:', a: { t: 'num', v: 'e^(' + kab * Rr2 + ')' } }, { label: 'at $z =$', a: { t: 'num', v: zplain(pt2) } }] },
        steps: ['$|e^{w}| = e^{\\operatorname{Re} w}$, so maximize $\\operatorname{Re}(' + zcoef(k, 'z') + ')$.', 'On the boundary $|z| = ' + Rr2 + '$ (where the maximum must be), $\\operatorname{Re}(' + zcoef(k, 'z') + ')$ is largest when $' + zcoef(k, 'z') + '$ points along the positive real axis: $z = ' + ztex(pt2) + '$, giving $' + kab * Rr2 + '$.', 'Maximum $e^{' + kab * Rr2 + '}$ at $z = ' + ztex(pt2) + '$.'],
        hint: 'Make $\\operatorname{Re}$ of the exponent as large as possible on the circle.', chk: { kind: kind, k: zplain(k), R: Rr2 } };
    }
    if (kind === 'poly') {
      var t2 = R.pick([[3, 4, 5], [0, 2, 2], [2, 0, 2], [0, 3, 3], [4, 3, 5], [5, 12, 13]]), c = Z(R.sign() * t2[0], R.sign() * t2[1]), n = R.pick([2, 3]);
      return { q: 'Find the maximum of $|' + zm(zneg(c), 'z^{' + n + '}') + '|$ on the closed disk $|z| \\le 1$.', a: { t: 'num', v: String(1 + t2[2]) },
        steps: ['The maximum is on $|z| = 1$, where $|z^{' + n + '} + c| \\le 1 + |c| = 1 + ' + t2[2] + '$.', 'Equality needs $z^{' + n + '}$ to point the same way as $c$, which some $z$ with $|z| = 1$ does ($z^{' + n + '}$ covers the whole unit circle).', 'Maximum: $' + (1 + t2[2]) + '$.'],
        hint: 'Use the triangle inequality and check that equality can happen.', chk: { kind: kind, c: zplain(c), n: n } };
    }
    var t3 = R.pick([[3, 4, 5], [0, 4, 4], [4, 0, 4], [0, 3, 3], [6, 8, 10]]), a3 = Z(R.sign() * t3[0], R.sign() * t3[1]), R3 = R.int(1, t3[2] + 1), mn = Math.max(0, t3[2] - R3);
    return { q: 'Find the minimum of $|' + zm(zneg(a3)) + '|$ on the closed disk $|z| \\le ' + R3 + '$.', a: { t: 'num', v: String(mn) },
      steps: mn > 0 ? ['$z + ' + zpar(a3) + '$ has its only zero at $' + ztex(zneg(a3)) + '$, at distance $' + t3[2] + ' > ' + R3 + '$: outside the disk.', 'A nonvanishing analytic function also takes its minimum modulus on the boundary (apply the maximum principle to $1/f$).', 'On $|z| = ' + R3 + '$: $|z + a| \\ge |a| - |z| = ' + t3[2] + ' - ' + R3 + ' = ' + mn + '$, reached at $z = -' + co(R3) + '\\frac{a}{|a|}$.'] : ['The zero $z = ' + ztex(zneg(a3)) + '$ has $|z| = ' + t3[2] + ' \\le ' + R3 + '$: it is in the disk.', 'So the minimum is $0$, reached at that point (inside, or on the edge). The minimum principle needs $f \\ne 0$.'],
      hint: 'Does $z + ' + zpar(a3) + '$ vanish in the disk?', chk: { kind: kind, a: zplain(a3), R: R3, v: mn } };
  });

  // ===================================================================== Unit 6: Power Series and Laurent Series
  var MODZ = [[Z(2), 2], [Z(3), 3], [Z(0, 2), 2], [Z(3, 4), 5], [Z(-4, 3), 5], [Z(0, -5), 5], [Z(-2), 2], [Z(4), 4], [Z(6, 8), 10]];
  function powTex(base, n) { return n === 'n' ? (/[+\-]/.test(base.replace(/^-/, '')) || /^-/.test(base) ? '(' + base + ')^{n}' : base + '^{n}') : base; }
  G('cplx.complex-power-series', function (R, ctx) {
    var kind = R.pick(L(ctx, ['geo', 'geo', 'ratio'], ['ratio', 'center', 'geo'], ['rational', 'conv', 'center', 'ratio']));
    if (kind === 'geo') {
      var b = R.pick(MODZ), form = R.coin();
      return { q: 'Find the radius of convergence of $\\displaystyle\\sum_{n=0}^{\\infty} ' + (form ? '\\frac{z^{n}}{' + powTex(ztex(b[0]), 'n') + '}' : '\\left(\\frac{z}{' + ztex(b[0]) + '}\\right)^{n}') + '$.', a: { t: 'num', v: String(b[1]) },
        steps: ['This is a geometric series with ratio $w = \\frac{z}{' + ztex(b[0]) + '}$; it converges exactly when $|w| < 1$.', '$|w| < 1 \\iff |z| < |' + ztex(b[0]) + '| = ' + b[1] + '$.', 'The radius is $' + b[1] + '$: the series converges on the open disk $|z| < ' + b[1] + '$ and diverges outside it.'],
        hint: 'A geometric series converges when its ratio has modulus less than 1.', chk: { kind: kind, b: zplain(b[0]), v: b[1] } };
    }
    if (kind === 'ratio') {
      var cs = [[function (c, k) { return 'n^{' + k + '}\\frac{z^{n}}{' + c + '^{n}}'; }, function (c) { return String(c); }, 'the ratio $\\frac{(n + 1)^k}{n^k} \\to 1$, so only $' ], [function () { return '\\frac{z^{n}}{n!}'; }, function () { return 'inf'; }], [function () { return 'n!\\,z^{n}'; }, function () { return '0'; }], [function (c) { return '\\frac{z^{n}}{n^{2}\\,' + c + '^{n}}'; }, function (c) { return String(c); }], [function (c) { return c * c + '^{n} z^{2n}'; }, function (c) { return '1/' + c; }]];
      var which = R.int(0, cs.length - 1), c = R.int(2, 5), k = R.int(1, 3), term = cs[which][0](c, k), ans = cs[which][1](c);
      var st = which === 1 ? ['Ratio test: $\\left|\\frac{a_{n + 1}}{a_n}\\right| = \\frac{|z|}{n + 1} \\to 0 < 1$ for every $z$.', 'So the series converges everywhere: the radius is $\\infty$.'] : which === 2 ? ['Ratio test: $\\left|\\frac{a_{n + 1}}{a_n}\\right| = (n + 1)|z| \\to \\infty$ for every $z \\ne 0$.', 'So it converges only at $z = 0$: the radius is $0$.'] : which === 4 ? ['Write it as $\\sum (' + c * c + 'z^2)^n$, a geometric series in $' + c * c + 'z^2$.', 'It converges when $' + c * c + '|z|^2 < 1$, that is $|z| < \\frac{1}{' + c + '}$.'] : ['Ratio test: $\\left|\\frac{a_{n + 1}}{a_n}\\right| = ' + (which === 0 ? '\\left(\\frac{n + 1}{n}\\right)^{' + k + '}' : '\\left(\\frac{n}{n + 1}\\right)^{2}') + '\\frac{|z|}{' + c + '} \\to \\frac{|z|}{' + c + '}$.', 'It is less than 1 exactly when $|z| < ' + c + '$: the polynomial factor does not change the radius.'];
      return { q: 'Find the radius of convergence of $\\displaystyle\\sum_{n=' + (which === 0 || which === 3 ? 1 : 0) + '}^{\\infty} ' + term + '$. (Type inf for $\\infty$.)', a: { t: 'num', v: ans }, steps: st,
        hint: 'Use the ratio test on $|a_{n + 1}/a_n|$.', chk: { kind: kind, which: which, c: c, v: ans } };
    }
    if (kind === 'center') {
      var a = zrand(R, -3, 3), b2 = R.pick(MODZ);
      return { q: 'Find the center and the radius of the disk of convergence of $\\displaystyle\\sum_{n=1}^{\\infty} \\frac{(' + zm(a) + ')^{n}}{n\\,' + powTex(ztex(b2[0]), 'n') + '}$.', a: { t: 'multi', parts: [{ label: 'center:', a: { t: 'num', v: zplain(a) } }, { label: 'radius:', a: { t: 'num', v: String(b2[1]) } }] },
        steps: ['The series is in powers of $z - ' + zpar(a) + '$, so the center is $' + ztex(a) + '$.', 'Ratio test: $\\frac{n}{n + 1}\\cdot\\frac{|z - a|}{|' + ztex(b2[0]) + '|} \\to \\frac{|z - a|}{' + b2[1] + '}$, less than 1 when $|z - a| < ' + b2[1] + '$.', 'Radius $' + b2[1] + '$.'],
        hint: 'Read the center from $(z - a)^n$; the ratio test gives the radius.', chk: { kind: kind, a: zplain(a), r: b2[1] } };
    }
    if (kind === 'rational') {
      var opts = R.pick(['sq', 'two', 'quad']), rts, ftex;
      if (opts === 'sq') { var b3 = R.int(1, 4); rts = [Z(0, b3), Z(0, -b3)]; ftex = '\\frac{1}{z^2 + ' + b3 * b3 + '}'; }
      else if (opts === 'two') { var p1 = zrand(R, -3, 3, true), p2 = zrand(R, -3, 3); if (zisz(p2)) p2 = Z(3); rts = [p1, p2]; ftex = '\\frac{1}{(' + zm(p1) + ')(' + zm(p2) + ')}'; }
      else { var pp = R.nz(-3, 3), qq = R.int(1, 3); rts = [Z(pp, qq), Z(pp, -qq)]; ftex = '\\frac{1}{' + ptex(pfromRoots(rts)) + '}'; }
      var best = rts.reduce(function (m, z) { return znorm(z).lt(m) ? znorm(z) : m; }, znorm(rts[0]));
      return { q: 'Find the radius of convergence of the Maclaurin series (the power series about $0$) of $f(z) = ' + ftex + '$.', a: { t: 'num', v: radPlain(1, best.num()) },
        steps: ['The series about $0$ converges on the largest disk $|z| < R$ that avoids the singular points of $f$.', '$f$ is singular at $' + rts.map(ztex).join(',\\ ') + '$, at distances $' + rts.map(absTex).join(',\\ ') + '$ from $0$.', 'The nearest is at distance $' + radTex(1, best.num()) + '$, so $R = ' + radTex(1, best.num()) + '$' + (opts === 'sq' ? ', even though $f$ is perfectly smooth on the real line.' : '.')],
        hint: 'Find the singular points, including complex ones, and take the nearest.', chk: { kind: kind, roots: rts.map(zplain), v: radPlain(1, best.num()) } };
    }
    var b4 = R.pick(MODZ), z0, d2; do { z0 = zrand(R, -6, 6); d2 = znorm(z0); } while (d2.eq(b4[1] * b4[1]));
    var conv = d2.lt(b4[1] * b4[1]);
    return { q: 'Does $\\displaystyle\\sum_{n=0}^{\\infty} \\frac{z^{n}}{' + powTex(ztex(b4[0]), 'n') + '}$ converge at $z = ' + ztex(z0) + '$?', a: { t: 'tf', v: conv },
      steps: ['The radius of convergence is $|' + ztex(b4[0]) + '| = ' + b4[1] + '$.', '$|' + ztex(z0) + '| = ' + absTex(z0) + '$, which is ' + (conv ? 'less' : 'more') + ' than $' + b4[1] + '$.', conv ? 'Inside the disk: it converges.' : 'Outside the disk: the terms do not even tend to $0$, so it diverges.'],
      hint: 'Compare $|z|$ with the radius.', chk: { kind: kind } };
  });

  G('cplx.complex-taylor', function (R, ctx) {
    var kind = R.pick(L(ctx, ['radius', 'radius', 'coef'], ['coef', 'exp', 'radius'], ['subst', 'shifted', 'coef', 'exp']));
    if (kind === 'radius' || kind === 'shifted') {
      var rts = kind === 'shifted' ? [Z(1)] : [zrand(R, -3, 3), zrand(R, -3, 3)], a = zrand(R, -2, 2);
      while (rts.some(function (z) { return zeq(z, a); })) a = zadd(a, Z(0, 1));
      var top = R.pick(['e^{z}', '1', '\\sin z', 'z + 2']), ftex = kind === 'shifted' ? '\\frac{1}{1 - z}' : '\\frac{' + top + '}{(' + zm(rts[0]) + ')(' + zm(rts[1]) + ')}';
      if (!(kind === 'shifted') && zeq(rts[0], rts[1])) ftex = '\\frac{' + top + '}{(' + zm(rts[0]) + ')^{2}}';
      var best = rts.reduce(function (m, z) { var d = dist2(z, a); return d.lt(m) ? d : m; }, dist2(rts[0], a));
      return { q: 'Find the radius of convergence of the Taylor series of $f(z) = ' + ftex + '$ about $a = ' + ztex(a) + '$.', a: { t: 'num', v: radPlain(1, best.num()) },
        steps: ['An analytic function equals its Taylor series on the largest open disk around $a$ that avoids its singular points.', 'Singular points: $' + rts.map(ztex).filter(function (x, i, A) { return A.indexOf(x) === i; }).join(',\\ ') + '$. Distances from $a$: ' + rts.map(function (z) { return '$' + distTex(z, a) + ' = ' + absTex(zsub(z, a)) + '$'; }).join(', ') + '.', 'The radius is the smallest distance: $' + radTex(1, best.num()) + '$.' + (kind === 'shifted' ? ' The familiar radius 1 belongs to the series about $0$, not about $' + ztex(a) + '$.' : '')],
        hint: 'Measure from $a$ to the nearest singular point.', chk: { kind: kind, roots: rts.map(zplain), a: zplain(a), v: radPlain(1, best.num()) } };
    }
    if (kind === 'coef') {
      var b = zrand(R, -2, 2), a2; do { a2 = zrand(R, -2, 2); } while (zeq(a2, b));
      var n = R.int(1, 3), c = zdiv(Z1, zpow(zsub(b, a2), n + 1));
      return { q: 'Find the coefficient of $(' + zm(a2) + ')^{' + n + '}$ in the Taylor series of $f(z) = \\dfrac{1}{' + (zisz(b) ? '-z' : ztex(b) + ' - z') + '}$ about $a = ' + ztex(a2) + '$.', a: { t: 'num', v: zplain(c) },
        steps: ['Write $' + (zisz(b) ? '-z' : ztex(b) + ' - z') + ' = (b - a) - (z - a)$ with $b - a = ' + ztex(zsub(b, a2)) + '$.', '$\\frac{1}{(b - a) - (z - a)} = \\frac{1}{b - a}\\cdot\\frac{1}{1 - \\frac{z - a}{b - a}} = \\sum_{n \\ge 0} \\frac{(z - a)^n}{(b - a)^{n + 1}}$.', 'The coefficient of $(z - a)^{' + n + '}$ is $\\frac{1}{(' + ztex(zsub(b, a2)) + ')^{' + (n + 1) + '}} = \\frac{1}{' + ztex(zpow(zsub(b, a2), n + 1)) + '} = ' + ztex(c) + '$.'],
        hint: 'Factor out $b - a$ and use a geometric series in $\\frac{z - a}{b - a}$.', chk: { kind: kind, f: '1/((' + zplain(b) + ')-z)', a: zplain(a2), n: n, v: zplain(c) } };
    }
    if (kind === 'exp') {
      var k = R.pick([Z(1, 1), Z(0, 2), Z(-1), Z(2), Z(1, -1), Z(0, 1), Z(-2)]), n2 = R.int(2, 4), c2 = zdiv(zpow(k, n2), Z(fact(n2)));
      return { q: 'Find the coefficient of $z^{' + n2 + '}$ in the Maclaurin series of $e^{' + zcoef(k, 'z') + '}$.', a: { t: 'num', v: zplain(c2) },
        steps: ['$e^{w} = \\sum \\frac{w^n}{n!}$ for every complex $w$; put $w = ' + zcoef(k, 'z') + '$.', 'The $z^{' + n2 + '}$ term is $\\frac{(' + zcoef(k, 'z') + ')^{' + n2 + '}}{' + n2 + '!} = \\frac{' + zpar(zpow(k, n2)) + '}{' + fact(n2) + '}z^{' + n2 + '}$, since $(' + ztex(k) + ')^{' + n2 + '} = ' + ztex(zpow(k, n2)) + '$.', 'Coefficient: $' + ztex(c2) + '$.'],
        hint: 'Substitute into the series for $e^w$.', chk: { kind: kind, f: 'e^((' + zplain(k) + ')*z)', a: '0', n: n2, v: zplain(c2) } };
    }
    var form = R.pick(['geo', 'expsq', 'cos']), m = R.int(1, 3), cc, ans, ftex2, st;
    if (form === 'geo') { cc = R.pick([1, 4, 9, -4, 2]); ans = Q(-cc).pow(m); ftex2 = '\\frac{1}{1 ' + (cc < 0 ? '- ' + (-cc === 1 ? '' : -cc) : '+ ' + (cc === 1 ? '' : cc)) + 'z^{2}}'; st = ['$\\frac{1}{1 - w} = \\sum w^n$ with $w = ' + T.mono(-cc, 'z^2') + '$.', 'The $z^{' + 2 * m + '}$ term is $w^{' + m + '} = ' + T.p(-cc) + '^{' + m + '}z^{' + 2 * m + '}$.', 'Coefficient: $' + qt(ans) + '$.']; }
    else if (form === 'expsq') { cc = R.pick([1, 2, -1, 3]); ans = Q(cc).pow(m).div(fact(m)); ftex2 = 'e^{' + T.mono(cc, 'z^{2}') + '}'; st = ['$e^{w} = \\sum \\frac{w^n}{n!}$ with $w = ' + T.mono(cc, 'z^2') + '$.', 'The $z^{' + 2 * m + '}$ term comes from $n = ' + m + '$: $\\frac{' + T.p(cc) + '^{' + m + '}}{' + m + '!}z^{' + 2 * m + '}$.', 'Coefficient: $' + qt(ans) + '$.']; }
    else { cc = R.pick([1, 2, 3]); ans = Q(m % 2 ? -1 : 1).mul(Q(Math.pow(cc, 2 * m), fact(2 * m))); ftex2 = '\\cos(' + T.mono(cc, 'z') + ')'; st = ['$\\cos w = \\sum \\frac{(-1)^n w^{2n}}{(2n)!}$ with $w = ' + T.mono(cc, 'z') + '$.', 'The $z^{' + 2 * m + '}$ term: $\\frac{(-1)^{' + m + '}' + (cc === 1 ? '' : cc + '^{' + 2 * m + '}') + '}{' + (2 * m) + '!}z^{' + 2 * m + '}$.', 'Coefficient: $' + qt(ans) + '$.']; }
    return { q: 'Find the coefficient of $z^{' + 2 * m + '}$ in the Maclaurin series of $' + ftex2 + '$.', a: { t: 'num', v: qp(ans) }, steps: st,
      hint: 'Substitute into a series you know.', chk: { kind: 'subst', form: form, c: cc, m: m, v: qp(ans), f: form === 'geo' ? '1/(1+(' + cc + ')*z^2)' : form === 'expsq' ? 'e^((' + cc + ')*z^2)' : 'cos(' + cc + '*z)', n: 2 * m, a: '0' } };
  });

  // Laurent coefficients of 1/((z − a)(z − b)) on an annulus around 0 (|a| < |b|): region 0: |z| < |a|, 1: |a| < |z| < |b|, 2: |z| > |b|
  function laurent2(a, b, region, k) {
    var A = zdiv(Z1, zsub(a, b)), B = zneg(A), c = Z0;
    function term(Cf, p, outside) { // Cf/(z − p): outside (|z| > |p|): Σ_{n≥0} p^n z^{−n−1}; inside: −Σ z^n / p^{n+1}
      if (outside) return k <= -1 ? zmul(Cf, zpow(p, -k - 1)) : Z0;
      return k >= 0 ? zneg(zdiv(Cf, zpow(p, k + 1))) : Z0;
    }
    c = zadd(term(A, a, region >= 1), term(B, b, region >= 2));
    return c;
  }
  var LPAIRS = [[Z(1), Z(2)], [Z(1), Z(-2)], [Z(-1), Z(3)], [Z(0, 1), Z(2)], [Z(1), Z(0, 2)], [Z(2), Z(3)], [Z(0, 1), Z(-3)], [Z(-1), Z(0, -2)], [Z(2), Z(-3)], [Z(1), Z(3)]];
  G('cplx.laurent-series', function (R, ctx) {
    var kind = R.pick(L(ctx, ['one', 'two', 'pole0'], ['two', 'exp', 'pole0', 'two'], ['two', 'two', 'sin', 'which']));
    if (kind === 'one') {
      var a = R.pick([Z(2), Z(-3), Z(0, 2), Z(1, 1), Z(-1), Z(0, -1)]), k = R.int(1, 4), c = zpow(a, k - 1);
      return { q: 'In the region $|z| > ' + absTex(a) + '$, find the coefficient of $z^{-' + k + '}$ in the Laurent series of $\\dfrac{1}{' + zm(a) + '}$.', a: { t: 'num', v: zplain(c) },
        steps: ['For $|z| > |a|$, factor out $z$: $\\frac{1}{z - a} = \\frac{1}{z}\\cdot\\frac{1}{1 - a/z}$, and $|a/z| < 1$.', '$= \\frac{1}{z}\\sum_{n \\ge 0} \\frac{a^n}{z^n} = \\sum_{n \\ge 0} a^n z^{-n - 1}$.', 'The $z^{-' + k + '}$ term has $n = ' + (k - 1) + '$: coefficient $a^{' + (k - 1) + '} = (' + ztex(a) + ')^{' + (k - 1) + '} = ' + ztex(c) + '$.'],
        hint: 'For $|z| > |a|$ the geometric series must be in powers of $a/z$.', chk: { kind: kind, f: '1/(z-(' + zplain(a) + '))', region: [qn(znorm(a)) ** 0.5 + 0.5], k: -k, v: zplain(c) } };
    }
    if (kind === 'two') {
      var pr = R.pick(LPAIRS), a2 = pr[0], b2 = pr[1], ra = absTex(a2), rb = absTex(b2), region = lvl(ctx) === 1 ? R.pick([0, 1]) : R.pick([1, 1, 2, 0]);
      var k2 = region === 0 ? R.int(0, 2) : region === 2 ? -R.int(2, 4) : R.pick([-2, -1, 0, 1, 2]), c2 = laurent2(a2, b2, region, k2);
      var regT = region === 0 ? '|z| < ' + ra : region === 1 ? ra + ' < |z| < ' + rb : '|z| > ' + rb, A = zdiv(Z1, zsub(a2, b2));
      var rad0 = Math.sqrt(qn(znorm(a2))), rad1 = Math.sqrt(qn(znorm(b2))), rmid = region === 0 ? rad0 / 2 : region === 1 ? (rad0 + rad1) / 2 : rad1 + 1;
      return { q: 'Find the coefficient of $z^{' + k2 + '}$ in the Laurent series of $f(z) = \\dfrac{1}{(' + zm(a2) + ')(' + zm(b2) + ')}$ valid in $' + regT + '$.', a: { t: 'num', v: zplain(c2) },
        steps: ['Partial fractions: $f = \\frac{A}{' + zm(a2) + '} - \\frac{A}{' + zm(b2) + '}$ with $A = \\frac{1}{' + ztex(a2) + ' - ' + zpar(b2) + '} = ' + ztex(A) + '$.', 'In $' + regT + '$: ' + (region >= 1 ? '$|z| > ' + ra + '$, so expand $\\frac{1}{' + zm(a2) + '} = \\sum_{n \\ge 0} \\frac{' + zpar(a2) + '^n}{z^{n + 1}}$ (negative powers)' : '$|z| < ' + ra + '$, so expand $\\frac{1}{' + zm(a2) + '} = -\\sum_{n \\ge 0} \\frac{z^n}{' + zpar(a2) + '^{n + 1}}$') + '; ' + (region >= 2 ? '$|z| > ' + rb + '$, so $\\frac{1}{' + zm(b2) + '} = \\sum_{n \\ge 0} \\frac{' + zpar(b2) + '^n}{z^{n + 1}}$.' : '$|z| < ' + rb + '$, so $\\frac{1}{' + zm(b2) + '} = -\\sum_{n \\ge 0} \\frac{z^n}{' + zpar(b2) + '^{n + 1}}$.'), 'Collect the $z^{' + k2 + '}$ terms from both pieces: the coefficient is $' + ztex(c2) + '$.'],
        hint: 'Use powers of $z/c$ where $|z| < |c|$, and powers of $c/z$ where $|z| > |c|$.', chk: { kind: kind, f: '1/((z-(' + zplain(a2) + '))*(z-(' + zplain(b2) + ')))', region: [rmid], k: k2, v: zplain(c2) } };
    }
    if (kind === 'pole0') {
      var kk = R.pick([1, 2, -1, 3, -2]), m = R.int(2, 4), j = R.int(-1, 1), nn = j + m, c3 = Q(Math.pow(kk, nn), fact(nn));
      return { q: 'Find the coefficient of $z^{' + j + '}$ in the Laurent series of $\\dfrac{e^{' + T.mono(kk, 'z') + '}}{z^{' + m + '}}$ about $0$.', a: { t: 'num', v: qp(c3) },
        steps: ['$e^{' + T.mono(kk, 'z') + '} = \\sum_{n \\ge 0} \\frac{' + (kk === 1 ? '' : T.p(kk) + '^n') + 'z^n}{n!}$' + (kk === 1 ? '' : '') + '; dividing by $z^{' + m + '}$ lowers every power by $' + m + '$.', 'The $z^{' + j + '}$ term comes from $n = ' + nn + '$: $\\frac{' + T.p(kk) + '^{' + nn + '}}{' + nn + '!}$.', 'Coefficient: $' + qt(c3) + '$.'],
        hint: 'Shift the exponential series by $z^{-' + m + '}$.', chk: { kind: kind, f: 'e^(' + kk + '*z)/z^' + m, region: [1], k: j, v: qp(c3) } };
    }
    if (kind === 'exp') {
      var cc = R.pick([1, 2, -1, 3]), mm = R.int(0, 3), c4 = Q(Math.pow(cc, mm + 1), fact(mm + 1));
      return { q: 'Find the coefficient of $z^{-1}$ in the Laurent series of $' + (mm ? 'z^{' + mm + '}' : '') + 'e^{' + (cc === 1 ? '' : cc === -1 ? '-' : cc) + '/z}$ about $0$.', a: { t: 'num', v: qp(c4) },
        steps: ['$e^{' + (cc === 1 ? '' : cc === -1 ? '-' : cc) + '/z} = \\sum_{n \\ge 0} \\frac{' + (cc === 1 ? '1' : T.p(cc) + '^n') + '}{n!\\,z^n}$, valid for all $z \\ne 0$.', (mm ? 'Multiply by $z^{' + mm + '}$: the powers become $z^{' + mm + ' - n}$. ' : '') + 'The $z^{-1}$ term has $n = ' + (mm + 1) + '$.', 'Coefficient: $\\frac{' + T.p(cc) + '^{' + (mm + 1) + '}}{' + (mm + 1) + '!} = ' + qt(c4) + '$.'],
        hint: 'Expand $e^{w}$ with $w = c/z$.', chk: { kind: kind, f: (mm ? 'z^' + mm + '*' : '') + 'e^(' + cc + '/z)', region: [1], k: -1, v: qp(c4) } };
    }
    if (kind === 'sin') {
      var m2 = R.pick([0, 2, 4, 1, 3]), c5 = m2 % 2 ? Q(0) : Q(m2 / 2 % 2 ? -1 : 1, fact(m2 + 1));
      return { q: 'Find the coefficient of $z^{-1}$ in the Laurent series of $' + (m2 ? 'z^{' + m2 + '}' : '') + '\\sin\\left(\\frac{1}{z}\\right)$ about $0$.', a: { t: 'num', v: qp(c5) },
        steps: ['$\\sin\\frac{1}{z} = \\frac{1}{z} - \\frac{1}{3!\\,z^3} + \\frac{1}{5!\\,z^5} - \\cdots$, only odd negative powers.', (m2 ? 'Multiplying by $z^{' + m2 + '}$ gives powers $z^{' + m2 + ' - (2n + 1)}$. ' : '') + (m2 % 2 ? 'Those exponents are all even, so $z^{-1}$ never appears.' : 'The $z^{-1}$ term needs $2n + 1 = ' + (m2 + 1) + '$.'), 'Coefficient: $' + qt(c5) + '$.'],
        hint: 'Write out the series for $\\sin w$ with $w = 1/z$.', chk: { kind: kind, f: (m2 ? 'z^' + m2 + '*' : '') + 'sin(1/z)', region: [1], k: -1, v: qp(c5) } };
    }
    var cz = R.pick([2, 3, 4, 5]), good = '$\\displaystyle\\sum_{n=0}^{\\infty} \\frac{' + cz + '^{n}}{z^{n + 1}}$', bad = ['$\\displaystyle -\\sum_{n=0}^{\\infty} \\frac{z^{n}}{' + cz + '^{n + 1}}$', '$\\displaystyle\\sum_{n=0}^{\\infty} \\frac{z^{n}}{' + cz + '^{n + 1}}$', '$\\displaystyle\\sum_{n=0}^{\\infty} \\frac{z^{n + 1}}{' + cz + '^{n}}$'];
    return { q: 'Which series equals $\\dfrac{1}{z - ' + cz + '}$ in the region $|z| > ' + cz + '$?', a: mcSpec(good, bad),
      steps: ['For $|z| > ' + cz + '$ the small quantity is $\\frac{' + cz + '}{z}$, not $\\frac{z}{' + cz + '}$.', '$\\frac{1}{z - ' + cz + '} = \\frac{1}{z}\\cdot\\frac{1}{1 - ' + cz + '/z} = \\sum_{n \\ge 0} \\frac{' + cz + '^n}{z^{n + 1}}$.', 'The series $-\\sum \\frac{z^n}{' + cz + '^{n + 1}}$ is the right one only for $|z| < ' + cz + '$.'],
      hint: 'Which ratio has modulus less than 1 in this region?', chk: { kind: kind } };
  });

  G('cplx.singularities', function (R, ctx) {
    var kind = R.pick(L(ctx, ['order', 'zero', 'order'], ['trig', 'zero', 'cancel'], ['class', 'trig', 'cancel', 'class']));
    if (kind === 'order') {
      var a = zrand(R, -2, 2), m = R.int(1, 4), b = zadd(a, Z(R.nz(-3, 3))), c = zadd(a, Z(0, R.nz(-3, 3)));
      return { q: 'What is the order of the pole of $f(z) = \\dfrac{' + zm(b) + '}{(' + zm(a) + ')^{' + m + '}(' + zm(c) + ')}$ at $z = ' + ztex(a) + '$?', a: { t: 'num', v: String(m) },
        steps: ['Write $f = \\frac{g(z)}{(z - a)^{' + m + '}}$ with $g(z) = \\frac{' + zm(b) + '}{' + zm(c) + '}$, analytic near $a = ' + ztex(a) + '$.', '$g(' + ztex(a) + ') = \\frac{' + ztex(zsub(a, b)) + '}{' + ztex(zsub(a, c)) + '} \\ne 0$.', 'So $a$ is a pole of order $' + m + '$.'],
        hint: 'Check that the rest of the function is analytic and nonzero at the point.', chk: { kind: kind } };
    }
    if (kind === 'zero') {
      var cs = [['z^{3}\\sin z', '0', 4, 'z^3 has a zero of order 3 and $\\sin z = z - \\cdots$ one of order 1.'], ['1 - \\cos z', '0', 2, '$1 - \\cos z = \\frac{z^2}{2} - \\frac{z^4}{24} + \\cdots$ starts at $z^2$.'], ['\\sin z - z', '0', 3, '$\\sin z - z = -\\frac{z^3}{6} + \\cdots$.'], ['e^{z} - 1 - z', '0', 2, '$e^z - 1 - z = \\frac{z^2}{2} + \\cdots$.'], ['\\sin(z^{2})', '0', 2, '$\\sin(z^2) = z^2 - \\frac{z^6}{6} + \\cdots$.'], ['z^{2}(e^{z} - 1)', '0', 3, '$z^2$ has order 2 and $e^z - 1 = z + \\cdots$ order 1.'], ['(z - 1)^{3}e^{z}', '1', 3, '$e^z \\ne 0$, so only $(z - 1)^3$ counts.'], ['z\\,(1 - \\cos z)', '0', 3, '$z$ gives 1 and $1 - \\cos z$ gives 2.']], c2 = R.pick(cs);
      return { q: 'What is the order of the zero of $' + c2[0] + '$ at $z = ' + c2[1] + '$?', a: { t: 'num', v: String(c2[2]) },
        steps: ['The order is the first power that appears in the Taylor series about the point (the number of derivatives that vanish there).', c2[3], 'Order: $' + c2[2] + '$.'],
        hint: 'Expand in a Taylor series around the point.', chk: { kind: kind } };
    }
    if (kind === 'trig') {
      var forms = [['\\sin z', 1], ['1 - \\cos z', 2], ['e^{z} - 1', 1], ['e^{z} - 1 - z', 2], ['\\sin z - z', 3]], f = R.pick(forms), m2 = f[1] + R.int(1, 3);
      return { q: 'What is the order of the pole of $\\dfrac{' + f[0] + '}{z^{' + m2 + '}}$ at $0$?', a: { t: 'num', v: String(m2 - f[1]) },
        steps: ['The top has a zero of order $' + f[1] + '$ at $0$: its series starts at $z^{' + f[1] + '}$.', 'So $\\frac{' + f[0] + '}{z^{' + m2 + '}} = \\frac{h(z)}{z^{' + (m2 - f[1]) + '}}$ with $h(0) \\ne 0$.', 'Pole of order $' + m2 + ' - ' + f[1] + ' = ' + (m2 - f[1]) + '$.'],
        hint: 'Subtract the order of the zero on top from the power below.', chk: { kind: kind } };
    }
    if (kind === 'cancel') {
      var a3 = zrand(R, -2, 2), mm = R.int(1, 3), kk = R.int(1, 4), ord = mm - kk, b3 = zadd(a3, Z(R.nz(-2, 2), 1));
      var correct = ord <= 0 ? 'removable' : 'a pole of order ' + ord, ch = ['removable', 'a pole of order 1', 'a pole of order 2', 'a pole of order 3', 'essential'].filter(function (x) { return x !== correct; });
      return { q: 'Classify the singularity of $f(z) = \\dfrac{(' + zm(a3) + ')^{' + kk + '}}{(' + zm(a3) + ')^{' + mm + '}(' + zm(b3) + ')}$ at $z = ' + ztex(a3) + '$.', a: mcSpec(correct, R.sample(ch, 3)),
        steps: ['Cancel the common factor (allowed for $z \\ne a$): $(z - a)^{' + kk + ' - ' + mm + '} = (z - a)^{' + (kk - mm) + '}$.', ord <= 0 ? 'No negative power is left, so $f$ extends to an analytic function at $a$: removable.' : 'That leaves $(z - a)^{-' + ord + '}$ times a function that is analytic and nonzero at $a$.', 'So the singularity is ' + correct + '.'],
        hint: 'Cancel, then see what power of $z - a$ is left.', chk: { kind: kind } };
    }
    var list = [['e^{1/z}', 'essential'], ['\\frac{\\sin z}{z}', 'removable'], ['\\frac{1}{\\sin z}', 'a pole of order 1'], ['\\frac{e^{z} - 1}{z^{2}}', 'a pole of order 1'], ['\\cos\\frac{1}{z}', 'essential'], ['z^{2}\\sin\\frac{1}{z}', 'essential'], ['\\frac{\\sin z - z}{z^{3}}', 'removable'], ['\\frac{1 - \\cos z}{z^{4}}', 'a pole of order 2'], ['\\frac{z}{e^{z} - 1}', 'removable'], ['\\frac{1}{z^{2}\\sin z}', 'a pole of order 3']], pick = R.pick(list);
    var why = { essential: 'Its Laurent series has infinitely many negative powers (and, by Casorati–Weierstrass, $f$ takes values near every number close to $0$).', removable: 'The limit at $0$ exists, so there are no negative powers in the Laurent series.' };
    return { q: 'Classify the isolated singularity of $' + pick[0] + '$ at $z = 0$.', a: mcSpec(pick[1], ['removable', 'a pole of order 1', 'a pole of order 2', 'a pole of order 3', 'essential'].filter(function (x) { return x !== pick[1]; }).slice(0, 3)),
      steps: ['Removable: no negative powers. Pole of order $m$: the negative powers stop at $(z - a)^{-m}$. Essential: infinitely many negative powers.', why[pick[1]] || 'Expand the top and the bottom in series: the lowest power left in the quotient is $z^{-' + pick[1].slice(-1) + '}$.', 'So the singularity is ' + pick[1] + '.'],
      hint: 'Expand in a Laurent series and look at the negative powers.', chk: { kind: kind } };
  });

  // ===================================================================== Unit 7: Residues
  G('cplx.residues', function (R, ctx) {
    var kind = R.pick(L(ctx, ['simple2', 'pz', 'simple2'], ['gh', 'unity', 'exp', 'simple2'], ['trig', 'gh', 'unity', 'exp']));
    if (kind === 'simple2') {
      var a = zrand(R, -2, 2), b; do { b = zrand(R, -2, 2); } while (zeq(a, b));
      var c = Z(R.nz(-5, 5)), res = zdiv(c, zsub(a, b));
      return { q: 'Find $\\operatorname{Res}(f, ' + ztex(a) + ')$ for $f(z) = \\dfrac{' + qt(c.re) + '}{(' + zm(a) + ')(' + zm(b) + ')}$.', a: { t: 'num', v: zplain(res) },
        steps: ['$z = ' + ztex(a) + '$ is a simple pole (the other factor is not zero there).', 'At a simple pole, $\\operatorname{Res}(f, a) = \\lim_{z \\to a}(z - a)f(z) = \\frac{' + qt(c.re) + '}{' + ztex(a) + ' - ' + zpar(b) + '}$.', '$= \\frac{' + qt(c.re) + '}{' + ztex(zsub(a, b)) + '} = ' + ztex(res) + '$.'],
        hint: 'Cover up the factor $(' + zm(a) + ')$ and evaluate the rest at $' + ztex(a) + '$.', chk: { kind: kind, f: qp(c.re) + '/((z-(' + zplain(a) + '))*(z-(' + zplain(b) + ')))', a: zplain(a), v: zplain(res) } };
    }
    if (kind === 'pz') {
      var p = P([Z(R.int(-3, 3)), Z(R.int(-3, 3)), Z(R.nz(-2, 2))]), a2 = zrand(R, -2, 2, true), r2 = pev(p, a2);
      return { q: 'Find the residue of $f(z) = \\dfrac{' + ptex(p) + '}{' + zm(a2) + '}$ at $z = ' + ztex(a2) + '$.', a: { t: 'num', v: zplain(r2) },
        steps: ['The top is a polynomial, so near $a = ' + ztex(a2) + '$ we have $f(z) = \\frac{p(a)}{z - a} + (\\text{a polynomial})$.', 'The residue is $p(' + ztex(a2) + ') = ' + ztex(r2) + '$.'],
        hint: 'Evaluate the numerator at the pole.', chk: { kind: kind, f: '(' + pplain(p) + ')/(z-(' + zplain(a2) + '))', a: zplain(a2), v: zplain(r2) } };
    }
    if (kind === 'gh') {
      var bb = R.int(1, 3), cc = Z(R.int(-4, 4), R.int(-2, 2)), up = R.coin(), pole = Z(0, up ? bb : -bb), res2 = zdiv(zadd(pole, cc), zscale(2, pole));
      return { q: 'Find the residue of $f(z) = \\dfrac{z' + (zisz(cc) ? '' : ' + ' + zpar(cc)) + '}{z^2 + ' + bb * bb + '}$ at $z = ' + ztex(pole) + '$.', a: { t: 'num', v: zplain(res2) },
        steps: ['With $f = \\frac{g}{h}$, $g(z) = z' + (zisz(cc) ? '' : ' + ' + zpar(cc)) + '$ and $h(z) = z^2 + ' + bb * bb + '$: $h(' + ztex(pole) + ') = 0$ and $h\'(z) = 2z \\ne 0$ there, so the pole is simple.', '$\\operatorname{Res} = \\frac{g(a)}{h\'(a)} = \\frac{' + ztex(zadd(pole, cc)) + '}{' + ztex(zscale(2, pole)) + '}$.', '$= ' + ztex(res2) + '$.'],
        hint: 'Use $g(a)/h\'(a)$ for a simple zero of the denominator.', chk: { kind: kind, f: '(z+(' + zplain(cc) + '))/(z^2+' + bb * bb + ')', a: zplain(pole), v: zplain(res2) } };
    }
    if (kind === 'unity') {
      var r = R.pick([Z(1), Z(0, 1), Z(-1), Z(0, -1)]), k = R.int(0, 3), res3 = zdiv(zpow(r, k), zscale(4, zpow(r, 3)));
      return { q: 'Find the residue of $f(z) = \\dfrac{' + (k === 0 ? '1' : k === 1 ? 'z' : 'z^{' + k + '}') + '}{z^4 - 1}$ at $z = ' + ztex(r) + '$.', a: { t: 'num', v: zplain(res3) },
        steps: ['$z^4 - 1$ has simple zeros at $\\pm 1, \\pm i$; its derivative is $4z^3$.', '$\\operatorname{Res} = \\frac{' + (k === 0 ? '1' : '(' + ztex(r) + ')^{' + k + '}') + '}{4(' + ztex(r) + ')^3} = \\frac{' + ztex(zpow(r, k)) + '}{' + ztex(zscale(4, zpow(r, 3))) + '}$.', '$= ' + ztex(res3) + '$.'],
        hint: 'Use $g(a)/h\'(a)$ with $h\'(z) = 4z^3$.', chk: { kind: kind, f: 'z^' + k + '/(z^4-1)', a: zplain(r), v: zplain(res3) } };
    }
    if (kind === 'exp') {
      var cs = [['e^{z}', 'z^2 + \\pi^2', 'pi*i', '\\pi i', 'i/(2*pi)', '\\frac{e^{\\pi i}}{2\\pi i} = \\frac{-1}{2\\pi i} = \\frac{i}{2\\pi}', 'e^(z)/(z^2+pi^2)'],
        ['e^{z}', 'z^2 + \\pi^2', '-pi*i', '-\\pi i', '-i/(2*pi)', '\\frac{e^{-\\pi i}}{-2\\pi i} = \\frac{-1}{-2\\pi i} = -\\frac{i}{2\\pi}', 'e^(z)/(z^2+pi^2)'],
        ['e^{2z}', 'z^2 + \\pi^2', 'pi*i', '\\pi i', '-i/(2*pi)', '\\frac{e^{2\\pi i}}{2\\pi i} = \\frac{1}{2\\pi i} = -\\frac{i}{2\\pi}', 'e^(2*z)/(z^2+pi^2)'],
        ['e^{z}', 'z^2 + \\frac{\\pi^2}{4}', 'pi/2*i', '\\frac{\\pi}{2} i', '1/pi', '\\frac{e^{\\pi i/2}}{\\pi i} = \\frac{i}{\\pi i} = \\frac{1}{\\pi}', 'e^(z)/(z^2+pi^2/4)'],
        ['e^{iz}', 'z^2 + 1', 'i', 'i', '-i/(2*e)', '\\frac{e^{i \\cdot i}}{2i} = \\frac{e^{-1}}{2i} = -\\frac{i}{2e}', 'e^(i*z)/(z^2+1)'],
        ['e^{iz}', 'z^2 + 4', '2*i', '2i', '-i/(4*e^2)', '\\frac{e^{i \\cdot 2i}}{4i} = \\frac{e^{-2}}{4i} = -\\frac{i}{4e^2}', 'e^(i*z)/(z^2+4)']], c = R.pick(cs);
      return { q: 'Find the residue of $f(z) = \\dfrac{' + c[0] + '}{' + c[1] + '}$ at $z = ' + c[3] + '$.', a: { t: 'num', v: c[4] },
        steps: ['The denominator has a simple zero at $' + c[3] + '$, with derivative $2z$.', '$\\operatorname{Res} = \\frac{g(a)}{h\'(a)} = ' + c[5] + '$.'],
        hint: 'Use $g(a)/h\'(a)$.', chk: { kind: kind, f: c[6], a: c[2], v: c[4] } };
    }
    var k2 = R.pick([1, 2, -1]), tab = [['\\cot z', k2 + '*pi', piTex(k2), '1', 'cos(z)/sin(z)', '$\\cot z = \\frac{\\cos z}{\\sin z}$, and $\\sin$ has a simple zero there with $\\sin\' = \\cos$: $\\frac{\\cos a}{\\cos a} = 1$.'],
      ['\\frac{1}{\\sin z}', k2 + '*pi', piTex(k2), String(k2 % 2 ? -1 : 1), '1/sin(z)', '$\\frac{1}{\\cos(' + piTex(k2) + ')} = ' + (k2 % 2 ? -1 : 1) + '$.'],
      ['\\tan z', 'pi/2', '\\frac{\\pi}{2}', '-1', 'sin(z)/cos(z)', '$\\tan z = \\frac{\\sin z}{\\cos z}$, and $\\cos\' = -\\sin$: $\\frac{\\sin(\\pi/2)}{-\\sin(\\pi/2)} = -1$.'],
      ['\\frac{1}{e^{z} - 1}', 2 * k2 + '*pi*i', piTex(2 * k2) + ' i', '1', '1/(e^z-1)', 'The derivative of $e^z - 1$ is $e^z$, which equals $1$ at $' + piTex(2 * k2) + ' i$: residue $\\frac{1}{1} = 1$.'],
      ['\\frac{z}{\\sin z}', k2 + '*pi', piTex(k2), piPlain(Q(k2 * (k2 % 2 ? -1 : 1))), 'z/sin(z)', '$\\frac{' + piTex(k2) + '}{\\cos(' + piTex(k2) + ')} = ' + piTex(Q(k2 * (k2 % 2 ? -1 : 1))) + '$.']], t = R.pick(tab);
    return { q: 'Find the residue of $' + t[0] + '$ at $z = ' + t[2] + '$.', a: { t: 'num', v: t[3] },
      steps: ['The denominator has a simple zero at $a = ' + t[2] + '$, so $\\operatorname{Res} = \\frac{g(a)}{h\'(a)}$.', t[5]],
      hint: 'Write it as $g/h$ and use $g(a)/h\'(a)$.', chk: { kind: kind, f: t[4], a: t[1], v: t[3] } };
  });

  G('cplx.higher-order-residues', function (R, ctx) {
    var kind = R.pick(L(ctx, ['zm', 'zm', 'polym'], ['double', 'polym', 'trigm'], ['square', 'double', 'trigm', 'square']));
    if (kind === 'zm') {
      var k = R.pick([1, 2, 3, -1, -2]), m = R.int(2, 4), res = Q(Math.pow(k, m - 1), fact(m - 1));
      return { q: 'Find the residue of $f(z) = \\dfrac{e^{' + T.mono(k, 'z') + '}}{z^{' + m + '}}$ at $0$.', a: { t: 'num', v: qp(res) },
        steps: ['$0$ is a pole of order $m = ' + m + '$, and $z^{' + m + '}f(z) = e^{' + T.mono(k, 'z') + '}$.', '$\\operatorname{Res} = \\frac{1}{(m - 1)!}\\frac{d^{m - 1}}{dz^{m - 1}}e^{' + T.mono(k, 'z') + '}\\Big|_{z = 0} = \\frac{' + T.p(k) + '^{' + (m - 1) + '}}{' + (m - 1) + '!}$.', '$= ' + qt(res) + '$. (Or read the coefficient of $z^{' + (m - 1) + '}$ in the series of $e^{' + T.mono(k, 'z') + '}$.)'],
        hint: 'Differentiate $m - 1$ times and divide by $(m - 1)!$.', chk: { kind: kind, f: 'e^(' + k + '*z)/z^' + m, a: '0', v: qp(res) } };
    }
    if (kind === 'polym') {
      var p = P([Z(R.int(-3, 3)), Z(R.int(-3, 3)), Z(R.int(-3, 3)), Z(R.nz(-2, 2))]), a = zrand(R, -1, 1), m2 = R.int(2, 3), sh = pshift(p, a), res2 = sh[m2 - 1] || Z0;
      return { q: 'Find the residue of $f(z) = \\dfrac{' + ptex(p) + '}{(' + zm(a) + ')^{' + m2 + '}}$ at $z = ' + ztex(a) + '$.', a: { t: 'num', v: zplain(res2) },
        steps: ['The residue is the coefficient of $(z - a)^{-1}$, which is the coefficient of $(z - a)^{' + (m2 - 1) + '}$ in the numerator expanded about $a = ' + ztex(a) + '$.', 'Equivalently $\\frac{p^{(' + (m2 - 1) + ')}(a)}{' + (m2 - 1) + '!}$ with $p(z) = ' + ptex(p) + '$.', 'That gives $' + ztex(res2) + '$.'],
        hint: 'Use $\\frac{1}{(m - 1)!}p^{(m - 1)}(a)$.', chk: { kind: kind, f: '(' + pplain(p) + ')/(z-(' + zplain(a) + '))^' + m2, a: zplain(a), v: zplain(res2) } };
    }
    if (kind === 'double') {
      var a2 = zrand(R, -2, 2), b2; do { b2 = zrand(R, -2, 2); } while (zeq(a2, b2));
      var at = R.coin() ? 'a' : 'b', roots = [{ z: a2, m: 2 }, { z: b2, m: 1 }], pt = at === 'a' ? a2 : b2, res3 = resRat(P([1]), roots, pt).res;
      return { q: 'Find the residue of $f(z) = \\dfrac{1}{(' + zm(a2) + ')^{2}(' + zm(b2) + ')}$ at $z = ' + ztex(pt) + '$.', a: { t: 'num', v: zplain(res3) },
        steps: at === 'a' ? ['$' + ztex(a2) + '$ is a double pole. $(z - a)^2 f(z) = \\frac{1}{' + zm(b2) + '}$.', 'Differentiate once: $-\\frac{1}{(' + zm(b2) + ')^2}$, and evaluate at $' + ztex(a2) + '$ (then divide by $1! = 1$).', '$-\\frac{1}{(' + ztex(zsub(a2, b2)) + ')^2} = ' + ztex(res3) + '$.'] : ['$' + ztex(b2) + '$ is a simple pole: cover up $(' + zm(b2) + ')$.', '$\\frac{1}{(' + ztex(b2) + ' - ' + zpar(a2) + ')^2} = \\frac{1}{(' + ztex(zsub(b2, a2)) + ')^2} = ' + ztex(res3) + '$.'],
        hint: at === 'a' ? 'At a pole of order 2, differentiate $(z - a)^2 f(z)$ once.' : 'This one is a simple pole.', chk: { kind: kind, f: '1/((z-(' + zplain(a2) + '))^2*(z-(' + zplain(b2) + ')))', a: zplain(pt), v: zplain(res3) } };
    }
    if (kind === 'square') {
      var b = R.int(1, 2), up = R.coin(), pole = Z(0, up ? b : -b), N = P([Z(R.int(-2, 2)), Z(R.int(-2, 2)), Z(R.int(0, 1))]); if (N.every(zisz)) N = P([1]); N = ptrim(N);
      var roots2 = [{ z: Z(0, b), m: 2 }, { z: Z(0, -b), m: 2 }], res4 = resRat(N, roots2, pole).res;
      return { q: 'Find the residue of $f(z) = \\dfrac{' + ptex(N) + '}{(z^2 + ' + b * b + ')^{2}}$ at $z = ' + ztex(pole) + '$.', a: { t: 'num', v: zplain(res4) },
        steps: ['$(z^2 + ' + b * b + ')^2 = (' + zm(Z(0, b)) + ')^2(' + zm(Z(0, -b)) + ')^2$, so $' + ztex(pole) + '$ is a pole of order 2.', 'Let $g(z) = (' + zm(pole) + ')^2 f(z) = \\frac{' + ptex(N) + '}{(' + zm(zneg(pole)) + ')^2}$. The residue is $g\'(' + ztex(pole) + ')$.', '$g\'(z) = \\frac{p\'(z)}{(' + zm(zneg(pole)) + ')^2} - \\frac{2p(z)}{(' + zm(zneg(pole)) + ')^3}$; at $z = ' + ztex(pole) + '$ this is $' + ztex(res4) + '$.'],
        hint: 'Multiply by $(z - a)^2$, cancel, differentiate once.', chk: { kind: kind, f: '(' + pplain(N) + ')/(z^2+' + b * b + ')^2', a: zplain(pole), v: zplain(res4) } };
    }
    var tab = [['\\frac{\\sin z}{z^{4}}', '-1/6', 'sin(z)/z^4', '$\\sin z = z - \\frac{z^3}{6} + \\cdots$, so $\\frac{\\sin z}{z^4} = z^{-3} - \\frac{1}{6}z^{-1} + \\cdots$.'],
      ['\\frac{\\cos z}{z^{3}}', '-1/2', 'cos(z)/z^3', '$\\cos z = 1 - \\frac{z^2}{2} + \\cdots$, so the $z^{-1}$ coefficient is $-\\frac{1}{2}$.'],
      ['\\frac{1}{z^{2}\\sin z}', '1/6', '1/(z^2*sin(z))', '$\\frac{1}{\\sin z} = \\frac{1}{z}\\left(1 + \\frac{z^2}{6} + \\cdots\\right)$, so $\\frac{1}{z^2\\sin z} = z^{-3} + \\frac{1}{6}z^{-1} + \\cdots$.'],
      ['\\frac{\\sin z}{z^{6}}', '1/120', 'sin(z)/z^6', 'The $z^5$ term of $\\sin z$ is $\\frac{z^5}{120}$.'],
      ['\\frac{\\cos z}{z^{5}}', '1/24', 'cos(z)/z^5', 'The $z^4$ term of $\\cos z$ is $\\frac{z^4}{24}$.'],
      ['\\frac{e^{z} - 1}{z^{3}}', '1/2', '(e^z-1)/z^3', '$e^z - 1 = z + \\frac{z^2}{2} + \\cdots$; the $z^2$ term gives $\\frac{1}{2}z^{-1}$.']], t = R.pick(tab);
    return { q: 'Find the residue of $' + t[0] + '$ at $z = 0$.', a: { t: 'num', v: t[1] },
      steps: ['For a high-order pole, a Laurent expansion is often faster than the derivative formula.', t[3], 'The residue is the coefficient of $z^{-1}$: $' + T.plain(t[1]) + '$.'],
      hint: 'Expand the top in its Maclaurin series.', chk: { kind: kind, f: t[2], a: '0', v: t[1] } };
  });

  // ---- a rational function with chosen poles and a circle around some of them
  function poleSet(R, n, dbl) { var pts = []; while (pts.length < n) { var z = zrand(R, -3, 3); if (!pts.some(function (w) { return zeq(w, z); })) pts.push(z); } return pts.map(function (z, i) { return { z: z, m: dbl && i === 0 ? 2 : 1 }; }); }
  G('cplx.residue-theorem', function (R, ctx) {
    var kind = R.pick(L(ctx, ['rat2', 'rat2', 'rat3'], ['rat3', 'expo', 'rat3'], ['dbl', 'rat3', 'expo', 'dbl']));
    if (kind === 'expo') {
      var a = R.int(-2, 2), b = R.intNot(-2, 2, a), C = pickCircle(R, [Z(a), Z(b)], [true, R.coin()], 0.35) || { c: Z(a), r: Q(1, 2) };
      var ia = insideC(Z(a), C), ib = insideC(Z(b), C), d = a - b, termsP = [], termsT = [];
      var eT = function (v) { return v === 0 ? '1' : 'e^{' + v + '}'; };
      if (ia) { termsP.push('e^(' + a + ')/(' + d + ')'); termsT.push(d < 0 ? '-\\frac{' + eT(a) + '}{' + (-d) + '}' : '\\frac{' + eT(a) + '}{' + d + '}'); }
      if (ib) { termsP.push('e^(' + b + ')/(' + (-d) + ')'); termsT.push(-d < 0 ? '-\\frac{' + eT(b) + '}{' + d + '}' : '\\frac{' + eT(b) + '}{' + (-d) + '}'); }
      var ansT = []; [[ia, a, d], [ib, b, -d]].forEach(function (u) { if (!u[0]) return; var kq = Q(2, u[2]), base = (kq.eq(1) ? '' : kq.eq(-1) ? '-' : kq.toPlain() + '*') + 'pi*i' + (u[1] === 0 ? '' : '*e^(' + u[1] + ')'); ansT.push(base); });
      var ans = ansT.join('+').replace(/\+-/g, '-');
      return { q: 'Compute $\\displaystyle\\oint_C \\frac{e^{z}}{' + denTex([{ z: Z(a), m: 1 }, { z: Z(b), m: 1 }]) + '}\\,dz$, where $C$ is $' + circTex(C.c, C.r) + '$.', a: { t: 'num', v: ans },
        steps: ['Simple poles at $' + a + '$ and $' + b + '$. Inside $C$: ' + [ia ? '$' + a + '$' : '', ib ? '$' + b + '$' : ''].filter(Boolean).join(' and ') + '.', 'Residues: at $' + a + '$, $\\frac{' + eT(a) + '}{' + a + ' - ' + T.p(b) + '}$; at $' + b + '$, $\\frac{' + eT(b) + '}{' + b + ' - ' + T.p(a) + '}$.', 'The integral is $2\\pi i\\left(' + termsT.join(' + ').replace(/\+ -/g, '- ') + '\\right)$, using only the residues inside.'],
        hint: 'Find which poles are inside, then add their residues.', chk: { kind: kind, f: 'e^z/((z-(' + a + '))*(z-(' + b + ')))', c: zplain(C.c), r: qp(C.r), v: ans } };
    }
    var n = kind === 'rat2' ? 2 : 3, ps = poleSet(R, n, kind === 'dbl'), want = ps.map(function (_, i) { return i === 0 ? true : R.coin(); }); if (kind !== 'rat2' && want.every(Boolean)) want[n - 1] = false;
    var C2 = pickCircle(R, ps.map(function (p) { return p.z; }), want, 0.35) || pickCircle(R, ps.map(function (p) { return p.z; }), ps.map(function () { return null; }), 0.35) || { c: ps[0].z, r: Q(1, 2) };
    var Np = P([Z(R.int(-3, 3)), Z(R.int(-2, 2))]); if (Np.every(zisz)) Np = P([1]); Np = ptrim(Np);
    var tot = Z0, lines = [];
    ps.forEach(function (p) { var inn = insideC(p.z, C2); var rr = resRat(Np, ps, p.z).res; if (inn) { tot = zadd(tot, rr); lines.push('$\\operatorname{Res}(f, ' + ztex(p.z) + ') = ' + ztex(rr) + '$'); } });
    var val = zmul(Z(0, 2), tot);
    return { q: 'Compute $\\displaystyle\\oint_C \\frac{' + ptex(Np) + '}{' + denTex(ps) + '}\\,dz$, where $C$ is $' + circTex(C2.c, C2.r) + '$.', a: { t: 'num', v: zpiPlain(val) },
      steps: ['Poles: ' + ps.map(function (p) { return '$' + ztex(p.z) + '$' + (p.m > 1 ? ' (order 2)' : ''); }).join(', ') + '. Inside $C$ (distance from $' + ztex(C2.c) + '$ less than $' + qt(C2.r) + '$): ' + (ps.filter(function (p) { return insideC(p.z, C2); }).map(function (p) { return '$' + ztex(p.z) + '$'; }).join(', ') || 'none') + '.', lines.length ? 'Residues inside: ' + lines.join(', ') + '. (Poles outside $C$ do not count.)' : 'No pole inside, so the integral is $0$ by Cauchy\'s theorem.', '$2\\pi i \\cdot ' + zpar(tot) + ' = ' + zpiTex(val) + '$.'],
      hint: 'Only the residues of poles inside $C$ count.', chk: { kind: kind, f: ratPlain(Np, ps), c: zplain(C2.c), r: qp(C2.r), v: zpiPlain(val) } };
  });

  var TRIGAB = [[5, 3, 4], [5, 4, 3], [13, 5, 12], [13, 12, 5], [10, 6, 8], [10, 8, 6], [17, 8, 15], [17, 15, 8], [25, 7, 24], [25, 24, 7], [5, 3, 4]], TRIGNS = [[2, 1, 3], [3, 1, 8], [3, 2, 5], [4, 1, 15], [4, 3, 7]];
  G('cplx.trig-integrals-residues', function (R, ctx) {
    var kind = R.pick(L(ctx, ['basic', 'basic', 'pole'], ['basic', 'pole', 'res', 'basic'], ['square', 'cosnum', 'basic', 'square']));
    var useNS = kind === 'basic' && lvl(ctx) >= 2 && R.chance(0.4), t = useNS ? R.pick(TRIGNS) : R.pick(TRIGAB), a = t[0], b = t[1], s2 = useNS ? t[2] : t[2] * t[2], sP = useNS ? 'sqrt(' + s2 + ')' : String(t[2]), sT = useNS ? '\\sqrt{' + s2 + '}' : String(t[2]);
    var trig = R.pick(['\\cos', '\\cos', '\\sin']), sign = R.pick(['+', '+', '-']);
    var den = a + ' ' + sign + ' ' + co(b) + trig + '\\theta', cn = R.pick([1, 1, 2, 3]), cnT = cn === 1 ? 'd\\theta' : cn + '\\,d\\theta';
    if (kind === 'basic') {
      var ans = useNS ? 2 * cn + '*pi/sqrt(' + s2 + ')' : piPlain(Q(2 * cn, t[2]));
      return { q: 'Evaluate $\\displaystyle\\int_0^{2\\pi} \\frac{' + cnT + '}{' + den + '}$.', a: { t: 'num', v: ans },
        steps: ['Put $z = e^{i\\theta}$: $' + (trig === '\\cos' ? '\\cos\\theta = \\frac{z + z^{-1}}{2}' : '\\sin\\theta = \\frac{z - z^{-1}}{2i}') + '$ and $d\\theta = \\frac{dz}{iz}$; $\\theta$ from $0$ to $2\\pi$ becomes once around $|z| = 1$.', 'The integrand becomes a rational function of $z$ with two simple poles whose moduli multiply to $1$, so exactly one is inside the unit circle. Its residue works out to $\\frac{1}{i\\sqrt{a^2 - b^2}}$ (in absolute value) with $a = ' + a + '$, $b = ' + b + '$.', '$2\\pi i \\cdot \\frac{1}{i\\sqrt{' + a * a + ' - ' + b * b + '}} = \\frac{2\\pi}{' + sT + '}' + (useNS ? '' : ' = ' + piTex(Q(2, t[2]))) + '$' + (cn === 1 ? '.' : ', and the constant ' + cn + ' on top multiplies this: $\\frac{' + 2 * cn + '\\pi}{' + sT + '}$' + (useNS ? '' : ' $= ' + piTex(Q(2 * cn, t[2])) + '$') + '.')],
        hint: 'Substitute $z = e^{i\\theta}$ and find the pole inside $|z| = 1$.', chk: { kind: kind, a: a, b: b, trig: trig, sign: sign, cn: cn, v: ans } };
    }
    if (kind === 'pole' || kind === 'res') {
      var pin = Q(-a + t[2], b), polyT = b + 'z^2 + ' + 2 * a + 'z + ' + b;
      if (kind === 'pole') return { q: 'In $\\displaystyle\\int_0^{2\\pi} \\frac{d\\theta}{' + a + ' + ' + b + '\\cos\\theta}$, put $z = e^{i\\theta}$. The integral becomes $\\displaystyle\\oint_{|z| = 1} \\frac{2\\,dz}{i(' + polyT + ')}$. Which zero of $' + polyT + '$ lies inside the unit circle?', a: { t: 'num', v: qp(pin) },
        steps: ['$' + a + ' + ' + b + '\\cdot\\frac{z + z^{-1}}{2} = \\frac{' + polyT + '}{2z}$, and $\\frac{d\\theta}{\\ldots} = \\frac{dz}{iz}\\cdot\\frac{2z}{' + polyT + '}$.', 'Quadratic formula: $z = \\frac{-' + a + ' \\pm \\sqrt{' + a * a + ' - ' + b * b + '}}{' + b + '} = \\frac{-' + a + ' \\pm ' + t[2] + '}{' + b + '}$, that is $' + qt(pin) + '$ and $' + qt(Q(-a - t[2], b)) + '$.', 'Their product is $1$; the one inside $|z| = 1$ is $' + qt(pin) + '$.'],
        hint: 'Solve the quadratic; keep the root with modulus less than 1.', chk: { kind: kind, a: a, b: b, v: qp(pin) } };
      var resv = Z(0, Q(-1, t[2])); // 2/(i·b·(z1 − z2)) with z1 − z2 = 2√(a²−b²)/b
      return { q: 'With $z = e^{i\\theta}$, $\\displaystyle\\int_0^{2\\pi} \\frac{d\\theta}{' + a + ' + ' + b + '\\cos\\theta} = \\oint_{|z| = 1} \\frac{2\\,dz}{i(' + polyT + ')}$. Find the residue of $\\frac{2}{i(' + polyT + ')}$ at its pole $z_1 = ' + qt(pin) + '$ inside the circle.', a: { t: 'num', v: zplain(resv) },
        steps: ['$' + polyT + ' = ' + b + '(z - z_1)(z - z_2)$ with $z_2 = ' + qt(Q(-a - t[2], b)) + '$.', 'Residue at the simple pole $z_1$: $\\frac{2}{i \\cdot ' + b + '(z_1 - z_2)} = \\frac{2}{i \\cdot ' + b + ' \\cdot ' + qt(Q(2 * t[2], b)) + '} = \\frac{1}{' + t[2] + 'i}$.', '$= ' + ztex(resv) + '$. (Then the integral is $2\\pi i$ times this, $\\frac{2\\pi}{' + t[2] + '}$.)'],
        hint: 'Use $g(a)/h\'(a)$ or cover up $z - z_1$.', chk: { kind: kind, a: a, b: b, v: zplain(resv) } };
    }
    if (kind === 'square') {
      var ans2 = piPlain(Q(2 * a, s2 * t[2]));
      return { q: 'Evaluate $\\displaystyle\\int_0^{2\\pi} \\frac{d\\theta}{(' + a + ' + ' + b + '\\cos\\theta)^2}$.', a: { t: 'num', v: ans2 },
        steps: ['With $z = e^{i\\theta}$, the integrand becomes $\\frac{4z}{i(' + b + 'z^2 + ' + 2 * a + 'z + ' + b + ')^2}$, with a double pole at $z_1 = ' + qt(Q(-a + t[2], b)) + '$ inside the unit circle.', 'The residue there (derivative formula for a double pole) works out to $\\frac{a}{i(a^2 - b^2)^{3/2}}$ with $a = ' + a + '$, $b = ' + b + '$.', '$2\\pi i$ times it: $\\frac{2\\pi \\cdot ' + a + '}{' + t[2] + '^3} = ' + piTex(Q(2 * a, s2 * t[2])) + '$.'],
        hint: 'The pole inside is now a double pole.', chk: { kind: kind, a: a, b: b, v: ans2 } };
    }
    var ans3 = piPlain(Q(2, b).mul(Q(1).sub(Q(a, t[2]))));
    return { q: 'Evaluate $\\displaystyle\\int_0^{2\\pi} \\frac{\\cos\\theta\\,d\\theta}{' + a + ' + ' + b + '\\cos\\theta}$.', a: { t: 'num', v: ans3 },
      steps: ['Write $\\frac{\\cos\\theta}{a + b\\cos\\theta} = \\frac{1}{b}\\left(1 - \\frac{a}{a + b\\cos\\theta}\\right)$.', 'Integrate: $\\frac{1}{b}\\left(2\\pi - a\\cdot\\frac{2\\pi}{\\sqrt{a^2 - b^2}}\\right)$, using the basic result $\\int_0^{2\\pi}\\frac{d\\theta}{a + b\\cos\\theta} = \\frac{2\\pi}{\\sqrt{a^2 - b^2}}$ (residues).', 'With $a = ' + a + '$, $b = ' + b + '$, $\\sqrt{a^2 - b^2} = ' + t[2] + '$: $\\frac{2\\pi}{' + b + '}\\left(1 - \\frac{' + a + '}{' + t[2] + '}\\right) = ' + piTex(Q(2, b).mul(Q(1).sub(Q(a, t[2])))) + '$.'],
      hint: 'Divide first so you can reuse the basic integral.', chk: { kind: kind, a: a, b: b, v: ans3 } };
  });

  G('cplx.real-integrals-residues', function (R, ctx) {
    var kind = R.pick(L(ctx, ['one', 'shift', 'one'], ['two', 'poles', 'shift', 'res'], ['sq', 'two', 'x2sq', 'quart']));
    var a = R.int(1, 4), b = R.intNot(1, 4, a), cn = R.pick([1, 1, 2, 3, 5]);
    if (kind === 'one') return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{' + (cn === 1 ? 'dx' : cn + '\\,dx') + '}{x^2 + ' + a * a + '}$ with residues.', a: { t: 'num', v: piPlain(Q(cn, a)) },
      steps: ['Close the real line with a big upper half-circle; the arc contributes nothing as $R \\to \\infty$ (the degree of the bottom is 2 more than the top).', 'The only pole in the upper half-plane is $' + (a === 1 ? '' : a) + 'i$, with residue $\\frac{' + cn + '}{2 \\cdot ' + (a === 1 ? '' : a) + 'i}$.', '$2\\pi i \\cdot \\frac{' + cn + '}{' + 2 * a + 'i} = ' + piTex(Q(cn, a)) + '$.'],
      hint: 'Use only the pole in the upper half-plane.', chk: { kind: kind, f: cn + '/(x^2+' + a * a + ')', v: piPlain(Q(cn, a)) } };
    if (kind === 'shift') {
      var p = R.nz(-3, 3), q2 = R.int(1, 3), c = p * p + q2 * q2;
      return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{' + (cn === 1 ? 'dx' : cn + '\\,dx') + '}{x^2 ' + (p > 0 ? '+ ' + 2 * p : '- ' + -2 * p) + 'x + ' + c + '}$.', a: { t: 'num', v: piPlain(Q(cn, q2)) },
        steps: ['The zeros of $x^2 ' + (p > 0 ? '+ ' : '- ') + Math.abs(2 * p) + 'x + ' + c + '$ are $' + ztex(Z(-p, q2)) + '$ and $' + ztex(Z(-p, -q2)) + '$; only $' + ztex(Z(-p, q2)) + '$ is in the upper half-plane.', 'Residue there: $\\frac{1}{2z + ' + T.p(2 * p) + '}\\Big|_{z = ' + ztex(Z(-p, q2)) + '} = \\frac{1}{' + (q2 * 2) + 'i}$.', '$2\\pi i \\cdot \\frac{1}{' + 2 * q2 + 'i} = ' + piTex(Q(1, q2)) + '$' + (cn === 1 ? '.' : ', times the constant ' + cn + ' on top: $' + piTex(Q(cn, q2)) + '$.')],
        hint: 'Find the root with positive imaginary part.', chk: { kind: kind, f: cn + '/(x^2+(' + 2 * p + ')*x+' + c + ')', v: piPlain(Q(cn, q2)) } };
    }
    if (kind === 'two') {
      var v = Q(cn, a * b * (a + b));
      return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{' + (cn === 1 ? 'dx' : cn + '\\,dx') + '}{(x^2 + ' + a * a + ')(x^2 + ' + b * b + ')}$.', a: { t: 'num', v: piPlain(v) },
        steps: ['Upper half-plane poles: $' + (a === 1 ? '' : a) + 'i$ and $' + (b === 1 ? '' : b) + 'i$, both simple.', 'Residues: $\\frac{1}{2 \\cdot ' + (a === 1 ? '' : a) + 'i\\,(' + b * b + ' - ' + a * a + ')}$ and $\\frac{1}{2 \\cdot ' + (b === 1 ? '' : b) + 'i\\,(' + a * a + ' - ' + b * b + ')}$.', 'Add and multiply by $2\\pi i$: $\\frac{\\pi}{' + (b * b - a * a) + '}\\left(\\frac{1}{' + a + '} - \\frac{1}{' + b + '}\\right) = ' + piTex(Q(1, a * b * (a + b))) + '$ (in general $\\frac{\\pi}{ab(a + b)}$)' + (cn === 1 ? '.' : '; times ' + cn + ': $' + piTex(v) + '$.')],
        hint: 'Two poles in the upper half-plane: add both residues.', chk: { kind: kind, f: cn + '/((x^2+' + a * a + ')*(x^2+' + b * b + '))', v: piPlain(v) } };
    }
    if (kind === 'poles') return { q: 'To evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{dx}{(x^2 + ' + a * a + ')(x^2 + ' + b * b + ')}$ by closing in the upper half-plane, which poles do you use? List them.', a: { t: 'set', v: [a === 1 ? 'i' : a + '*i', b === 1 ? 'i' : b + '*i'] },
      steps: ['The poles are $\\pm ' + (a === 1 ? '' : a) + 'i$ and $\\pm ' + (b === 1 ? '' : b) + 'i$.', 'The contour (segment plus upper half-circle) encloses only those with positive imaginary part: $' + (a === 1 ? '' : a) + 'i$ and $' + (b === 1 ? '' : b) + 'i$. The lower ones are outside and do not count.'],
      hint: 'Keep the poles with positive imaginary part.', chk: { kind: kind } };
    if (kind === 'res') return { q: 'Find the residue of $\\dfrac{1}{z^2 + ' + a * a + '}$ at its pole in the upper half-plane.', a: { t: 'num', v: zplain(Z(0, Q(-1, 2 * a))) },
      steps: ['The upper pole is $' + (a === 1 ? '' : a) + 'i$, a simple zero of $z^2 + ' + a * a + '$ with derivative $2z$.', '$\\frac{1}{2 \\cdot ' + (a === 1 ? '' : a) + 'i} = \\frac{1}{' + 2 * a + 'i} = ' + ztex(Z(0, Q(-1, 2 * a))) + '$.'],
      hint: 'Use $\\frac{1}{h\'(a)}$.', chk: { kind: kind, f: '1/(z^2+' + a * a + ')', a: a + '*i', v: zplain(Z(0, Q(-1, 2 * a))) } };
    if (kind === 'sq') return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{dx}{(x^2 + ' + a * a + ')^2}$.', a: { t: 'num', v: piPlain(Q(1, 2 * a * a * a)) },
      steps: ['The pole $' + (a === 1 ? '' : a) + 'i$ is double. Its residue is $\\frac{d}{dz}\\frac{1}{(z + ' + (a === 1 ? '' : a) + 'i)^2}\\Big|_{' + (a === 1 ? '' : a) + 'i} = \\frac{-2}{(' + 2 * a + 'i)^3} = \\frac{1}{' + 4 * a * a * a + 'i}$.', '$2\\pi i \\cdot \\frac{1}{' + 4 * a * a * a + 'i} = ' + piTex(Q(1, 2 * a * a * a)) + '$.'],
      hint: 'Use the derivative formula for the double pole.', chk: { kind: kind, f: '1/(x^2+' + a * a + ')^2', v: piPlain(Q(1, 2 * a * a * a)) } };
    if (kind === 'x2sq') return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{x^2\\,dx}{(x^2 + ' + a * a + ')^2}$.', a: { t: 'num', v: piPlain(Q(1, 2 * a)) },
      steps: ['Degrees: top 2, bottom 4, so the arc vanishes. The pole $' + (a === 1 ? '' : a) + 'i$ is double.', 'Residue: $\\frac{d}{dz}\\frac{z^2}{(z + ' + (a === 1 ? '' : a) + 'i)^2}\\Big|_{' + (a === 1 ? '' : a) + 'i} = \\frac{2z \\cdot ' + (a === 1 ? '' : a) + 'i}{(z + ' + (a === 1 ? '' : a) + 'i)^3}\\Big|_{' + (a === 1 ? '' : a) + 'i} = \\frac{1}{' + 4 * a + 'i}$.', '$2\\pi i \\cdot \\frac{1}{' + 4 * a + 'i} = ' + piTex(Q(1, 2 * a)) + '$.'],
      hint: 'A double pole: differentiate $(z - ai)^2 f(z)$ once.', chk: { kind: kind, f: 'x^2/(x^2+' + a * a + ')^2', v: piPlain(Q(1, 2 * a)) } };
    return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{dx}{x^4 + 1}$.', a: { t: 'num', v: 'pi/sqrt(2)' },
      steps: ['The zeros of $z^4 + 1$ are $e^{i\\pi/4}, e^{3i\\pi/4}, e^{5i\\pi/4}, e^{7i\\pi/4}$; the first two are in the upper half-plane.', 'At each simple zero $a$, the residue is $\\frac{1}{4a^3} = -\\frac{a}{4}$ (since $a^4 = -1$). Sum: $-\\frac{1}{4}\\left(e^{i\\pi/4} + e^{3i\\pi/4}\\right) = -\\frac{1}{4} \\cdot i\\sqrt{2}$.', '$2\\pi i \\cdot \\left(-\\frac{i\\sqrt{2}}{4}\\right) = \\frac{\\pi\\sqrt{2}}{2} = \\frac{\\pi}{\\sqrt{2}}$.'],
      hint: 'Use $\\frac{1}{h\'(a)} = \\frac{1}{4a^3}$ and $a^4 = -1$.', chk: { kind: kind, f: '1/(x^4+1)', v: 'pi/sqrt(2)' } };
  });

  G('cplx.fourier-type-integrals', function (R, ctx) {
    var kind = R.pick(L(ctx, ['cos', 'cos', 'which'], ['xsin', 'res', 'cos', 'which'], ['shift', 'two', 'xsin', 'shift']));
    var a = R.int(1, 3), k = R.int(1, 3);
    if (kind === 'cos') { var v = 'pi*e^(-' + k * a + ')/' + a;
      return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{\\cos(' + T.mono(k, 'x') + ')}{x^2 + ' + a * a + '}\\,dx$.', a: { t: 'num', v: v },
        steps: ['Integrate $f(z) = \\frac{e^{' + T.mono(k, 'iz') + '}}{z^2 + ' + a * a + '}$ over the upper half-disk: $|e^{' + T.mono(k, 'iz') + '}| = e^{-' + (k === 1 ? '' : k) + 'y} \\le 1$ there, so the arc vanishes as $R \\to \\infty$.', 'The pole $' + (a === 1 ? '' : a) + 'i$ has residue $\\frac{e^{' + T.mono(k, 'i') + ' \\cdot ' + (a === 1 ? '' : a) + 'i}}{' + 2 * a + 'i} = \\frac{e^{-' + k * a + '}}{' + 2 * a + 'i}$.', '$2\\pi i \\cdot \\frac{e^{-' + k * a + '}}{' + 2 * a + 'i} = \\frac{\\pi e^{-' + k * a + '}}{' + a + '}$. It is real, and it equals the cosine integral (the real part); the sine part is $0$ by symmetry.'],
        hint: 'Use $e^{ikz}$, not $\\cos(kz)$.', chk: { kind: kind, f: 'cos(' + k + '*x)/(x^2+' + a * a + ')', v: v } }; }
    if (kind === 'xsin') { var v2 = 'pi*e^(-' + k * a + ')';
      return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{x\\sin(' + T.mono(k, 'x') + ')}{x^2 + ' + a * a + '}\\,dx$.', a: { t: 'num', v: v2 },
        steps: ['Use $f(z) = \\frac{z\\,e^{' + T.mono(k, 'iz') + '}}{z^2 + ' + a * a + '}$; the sine integral is the imaginary part of $\\int f$. (Here the top has degree only one less than the bottom, but Jordan\'s lemma still makes the arc vanish because of $e^{' + T.mono(k, 'iz') + '}$.)', 'Residue at $' + (a === 1 ? '' : a) + 'i$: $\\frac{' + (a === 1 ? '' : a) + 'i\\,e^{-' + k * a + '}}{' + 2 * a + 'i} = \\frac{e^{-' + k * a + '}}{2}$.', '$2\\pi i \\cdot \\frac{e^{-' + k * a + '}}{2} = \\pi i\\,e^{-' + k * a + '}$, whose imaginary part is $\\pi e^{-' + k * a + '}$.'],
        hint: 'Take the imaginary part at the end.', chk: { kind: kind, f: 'x*sin(' + k + '*x)/(x^2+' + a * a + ')', v: v2 } }; }
    if (kind === 'res') return { q: 'Find the residue of $\\dfrac{e^{' + T.mono(k, 'iz') + '}}{z^2 + ' + a * a + '}$ at $z = ' + (a === 1 ? '' : a) + 'i$.', a: { t: 'num', v: '-i*e^(-' + k * a + ')/' + 2 * a },
      steps: ['A simple pole: $\\frac{g(a)}{h\'(a)}$ with $h\' = 2z$.', '$\\frac{e^{' + T.mono(k, 'i') + '(' + (a === 1 ? '' : a) + 'i)}}{' + 2 * a + 'i} = \\frac{e^{-' + k * a + '}}{' + 2 * a + 'i} = -\\frac{i\\,e^{-' + k * a + '}}{' + 2 * a + '}$.'],
      hint: 'Note $i \\cdot i = -1$ in the exponent.', chk: { kind: kind, f: 'e^(' + k + '*i*z)/(z^2+' + a * a + ')', a: a + '*i', v: '-i*e^(-' + k * a + ')/' + 2 * a } };
    if (kind === 'which') {
      var good = '$\\dfrac{e^{' + T.mono(k, 'iz') + '}}{z^2 + ' + a * a + '}$, then take the real part', bad = ['$\\dfrac{\\cos(' + T.mono(k, 'z') + ')}{z^2 + ' + a * a + '}$ directly', '$\\dfrac{e^{-' + (k === 1 ? '' : k) + 'iz}}{z^2 + ' + a * a + '}$, then take the real part', '$\\dfrac{\\sin(' + T.mono(k, 'z') + ')}{z^2 + ' + a * a + '}$, then take the imaginary part'];
      return { q: 'To evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{\\cos(' + T.mono(k, 'x') + ')}{x^2 + ' + a * a + '}\\,dx$ by closing in the upper half-plane, which function should you integrate around the contour?', a: mcSpec(good, bad),
        steps: ['On the upper arc, $z = x + iy$ with $y > 0$: $|e^{' + T.mono(k, 'iz') + '}| = e^{-' + (k === 1 ? '' : k) + 'y} \\le 1$, so the arc vanishes.', '$\\cos(' + T.mono(k, 'z') + ') = \\frac{e^{' + T.mono(k, 'iz') + '} + e^{-' + (k === 1 ? '' : k) + 'iz}}{2}$ contains $e^{-' + (k === 1 ? '' : k) + 'iz}$, which grows like $e^{' + (k === 1 ? '' : k) + 'y}$ up there: the arc does not vanish.', 'So use $e^{' + T.mono(k, 'iz') + '}$ and take the real part.'],
        hint: 'Which exponential stays small when $y > 0$?', chk: { kind: kind } };
    }
    if (kind === 'shift') {
      var p = R.nz(-2, 2), q2 = R.int(1, 2), c = p * p + q2 * q2, useCos = R.coin(), ans = useCos ? 'pi/' + q2 + '*e^(-' + k * q2 + ')*cos(' + k * p + ')' : '-pi/' + q2 + '*e^(-' + k * q2 + ')*sin(' + k * p + ')';
      return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{\\' + (useCos ? 'cos' : 'sin') + '(' + T.mono(k, 'x') + ')}{x^2 ' + (p > 0 ? '+ ' + 2 * p : '- ' + -2 * p) + 'x + ' + c + '}\\,dx$.', a: { t: 'num', v: ans },
        steps: ['The upper pole is $z_0 = ' + ztex(Z(-p, q2)) + '$. With $f = \\frac{e^{' + T.mono(k, 'iz') + '}}{z^2 ' + (p > 0 ? '+ ' : '- ') + Math.abs(2 * p) + 'z + ' + c + '}$: residue $\\frac{e^{' + T.mono(k, 'i') + 'z_0}}{2z_0 + ' + T.p(2 * p) + '} = \\frac{e^{' + T.mono(k, 'i') + '(' + ztex(Z(-p, q2)) + ')}}{' + 2 * q2 + 'i}$.', '$e^{' + T.mono(k, 'i') + '(' + ztex(Z(-p, q2)) + ')} = e^{-' + k * q2 + '}e^{' + T.mono(-k * p, 'i') + '}$, so $2\\pi i \\cdot \\text{Res} = \\frac{\\pi}{' + q2 + '}e^{-' + k * q2 + '}\\left(\\cos ' + k * p + ' ' + (k * p > 0 ? '-' : '+') + ' i\\sin ' + Math.abs(k * p) + '\\right)$.', 'The ' + (useCos ? 'real' : 'imaginary') + ' part: $' + (useCos ? '\\frac{\\pi}{' + q2 + '}e^{-' + k * q2 + '}\\cos ' + (k * p) : '-\\frac{\\pi}{' + q2 + '}e^{-' + k * q2 + '}\\sin ' + (k * p)) + '$' + (k * p < 0 ? ' (with $\\cos(-u) = \\cos u$, $\\sin(-u) = -\\sin u$).' : '.')],
        hint: 'Find the residue of $e^{ikz}/Q(z)$ at the upper pole, then take the real or imaginary part.', chk: { kind: kind, f: (useCos ? 'cos' : 'sin') + '(' + k + '*x)/(x^2+(' + 2 * p + ')*x+' + c + ')', v: ans } };
    }
    var a2 = 1, b2 = 2, v3 = 'pi/3*(e^(-' + k + ')-e^(-' + 2 * k + ')/2)';
    return { q: 'Evaluate $\\displaystyle\\int_{-\\infty}^{\\infty} \\frac{\\cos(' + T.mono(k, 'x') + ')}{(x^2 + 1)(x^2 + 4)}\\,dx$.', a: { t: 'num', v: v3 },
      steps: ['Use $\\frac{e^{' + T.mono(k, 'iz') + '}}{(z^2 + 1)(z^2 + 4)}$; upper poles $i$ and $2i$.', 'Residues: at $i$, $\\frac{e^{-' + k + '}}{2i \\cdot 3}$; at $2i$, $\\frac{e^{-' + 2 * k + '}}{4i \\cdot (-3)}$.', '$2\\pi i$ times the sum: $\\frac{\\pi}{3}\\left(e^{-' + k + '} - \\frac{e^{-' + 2 * k + '}}{2}\\right)$, which is real, so it is the cosine integral.'],
      hint: 'Two poles in the upper half-plane.', chk: { kind: kind, f: 'cos(' + k + '*x)/((x^2+1)*(x^2+4))', v: v3 } };
  });

  G('cplx.argument-principle', function (R, ctx) {
    var kind = R.pick(L(ctx, ['zn', 'count', 'count'], ['count', 'integral', 'count'], ['factor', 'integral', 'count']));
    if (kind === 'zn') {
      var n = R.int(2, 6), neg = R.coin(), a = zrand(R, -1, 1), Rr = R.int(2, 3);
      return { q: 'As $z$ goes once counterclockwise around $' + circTex(Z0, Rr) + '$, how many times does $f(z) = ' + (neg ? '\\dfrac{1}{(' + zm(a) + ')^{' + n + '}}' : '(' + zm(a) + ')^{' + n + '}') + '$ wind around $0$? (Counterclockwise counts as positive.)', a: { t: 'num', v: String(neg ? -n : n) },
        steps: ['$' + ztex(a) + '$ is inside the circle. ' + (neg ? '$f$ has a pole of order $' + n + '$ there and no zeros.' : '$f$ has a zero of order $' + n + '$ there and no poles.'), 'Argument principle: winding number $=$ zeros $-$ poles inside, with multiplicity $= ' + (neg ? '0 - ' + n : n + ' - 0') + '$.', 'So $f(C)$ winds ' + (neg ? n + ' times clockwise: $' + (-n) + '$.' : n + ' times counterclockwise.')],
        hint: 'Count zeros minus poles inside, with multiplicity.', chk: { kind: kind } };
    }
    if (kind === 'count' || kind === 'integral') {
      var zs = [], ps = [], Rr2 = R.int(2, 3), tries = 0;
      function addPt(list) { for (var t = 0; t < 30; t++) { var z = zrand(R, -3, 3); var d = Math.sqrt(qn(znorm(z))); if (Math.abs(d - Rr2) < 0.4) continue; if (zs.concat(ps).some(function (w) { return zeq(w.z, z); })) continue; list.push({ z: z, m: R.pick([1, 1, 2, 3]) }); return; } }
      var nz0 = R.int(2, 3), np0 = R.int(1, 2); for (var i = 0; i < nz0; i++) addPt(zs); for (i = 0; i < np0; i++) addPt(ps);
      var Zc = zs.reduce(function (s, p) { return s + (inDisk(p.z, Z0, Rr2) ? p.m : 0); }, 0), Pc = ps.reduce(function (s, p) { return s + (inDisk(p.z, Z0, Rr2) ? p.m : 0); }, 0);
      var top = denTex(zs), bot = denTex(ps), fT = '\\dfrac{' + top + '}{' + bot + '}', diff = Zc - Pc;
      var desc = zs.map(function (p) { return '$' + ztex(p.z) + '$' + (p.m > 1 ? ' (order ' + p.m + ')' : '') + (inDisk(p.z, Z0, Rr2) ? ' inside' : ' outside'); }).join(', '), descP = ps.map(function (p) { return '$' + ztex(p.z) + '$' + (p.m > 1 ? ' (order ' + p.m + ')' : '') + (inDisk(p.z, Z0, Rr2) ? ' inside' : ' outside'); }).join(', ');
      var ans = kind === 'count' ? String(diff) : zpiPlain(Z(0, 2 * diff));
      return { q: kind === 'count' ? 'For $f(z) = ' + fT + '$, find $\\displaystyle\\frac{1}{2\\pi i}\\oint_{|z| = ' + Rr2 + '} \\frac{f\'(z)}{f(z)}\\,dz$.' : 'For $f(z) = ' + fT + '$, compute $\\displaystyle\\oint_{|z| = ' + Rr2 + '} \\frac{f\'(z)}{f(z)}\\,dz$.', a: { t: 'num', v: ans },
        steps: ['The argument principle: $\\frac{1}{2\\pi i}\\oint \\frac{f\'}{f}\\,dz = Z - P$, zeros minus poles inside, each counted with its multiplicity.', 'Zeros: ' + desc + '. Poles: ' + descP + '. (Inside means $|z| < ' + Rr2 + '$.)', '$Z = ' + Zc + '$, $P = ' + Pc + '$, so $Z - P = ' + diff + '$' + (kind === 'integral' ? ', and the integral is $2\\pi i(' + diff + ') = ' + zpiTex(Z(0, 2 * diff)) + '$.' : '.')],
        hint: 'Count zeros and poles inside with multiplicity, and subtract.', chk: { kind: kind, f: ratPlain(pfromRoots([].concat.apply([], zs.map(function (p) { var o = []; for (var j = 0; j < p.m; j++) o.push(p.z); return o; }))), ps), R: Rr2, v: ans, diff: diff } };
    }
    var r1 = R.pick([1, 2]), roots = [Z(r1), Z(-r1), Z(0, R.pick([2, 3]))], Rr3 = R.pick([Q(3, 2), Q(5, 2)]), poly = pfromRoots(roots), n3 = roots.filter(function (z) { return inDisk(z, Z0, Rr3); }).length;
    return { q: 'Compute $\\displaystyle\\frac{1}{2\\pi i}\\oint_{|z| = ' + qt(Rr3) + '} \\frac{f\'(z)}{f(z)}\\,dz$ for $f(z) = ' + ptex(poly) + '$.', a: { t: 'num', v: String(n3) },
      steps: ['$f$ is a polynomial (no poles), so the integral counts its zeros inside $|z| = ' + qt(Rr3) + '$.', 'Factor: $f(z) = ' + roots.map(function (z) { return '(' + zm(z) + ')'; }).join('') + '$, with zeros $' + roots.map(ztex).join(',\\ ') + '$ and moduli $' + roots.map(absTex).join(',\\ ') + '$.', n3 + ' of them lie inside, so the answer is $' + n3 + '$.'],
      hint: 'Factor $f$ (try $z^2 - ' + r1 * r1 + '$ as a factor) and count the zeros inside.', chk: { kind: kind, f: pplain(poly), R: qp(Rr3), v: String(n3) } };
  });

  G('cplx.rouche', function (R, ctx) {
    var kind = R.pick(L(ctx, ['count', 'bound', 'count'], ['count', 'which', 'count'], ['annulus', 'count', 'which']));
    function build(dom) { // z^n + a z^k + b with the dominant term chosen; returns {n, k, a, b, Rr, zeros}
      var n = R.int(4, 7), k = R.int(1, Math.min(3, n - 1)), a, b, Rr;
      if (dom === 'mid') { Rr = 1; b = R.nz(-3, 3); a = R.sign() * R.int(Math.abs(b) + 2, Math.abs(b) + 6); return { n: n, k: k, a: a, b: b, Rr: Rr, cnt: k }; }
      if (dom === 'const') { Rr = 1; a = R.nz(-3, 3); b = R.sign() * R.int(Math.abs(a) + 2, Math.abs(a) + 6); return { n: n, k: k, a: a, b: b, Rr: Rr, cnt: 0 }; }
      Rr = 2; a = R.nz(-3, 3); b = R.nz(-5, 5); while (Math.abs(a) * Math.pow(2, k) + Math.abs(b) >= Math.pow(2, n)) { a = R.nz(-1, 1); b = R.nz(-1, 1); }
      return { n: n, k: k, a: a, b: b, Rr: Rr, cnt: n };
    }
    function tz(c, k, r) { return (c === 1 ? '' : c) + (r ? r : '|z|') + (k === 1 ? '' : '^{' + k + '}'); } // |c|·|z|^k written tidily
    function ptexOf(o) { return 'z^{' + o.n + '}' + T.coef(o.a, o.k === 1 ? 'z' : 'z^{' + o.k + '}', false) + T.signed(o.b); }
    function plainOf(o) { return 'z^' + o.n + '+(' + o.a + ')*z^' + o.k + '+(' + o.b + ')'; }
    if (kind === 'count' || kind === 'which' || kind === 'bound') {
      var dom = R.pick(['mid', 'top', 'mid', 'const']), o = build(dom), ft = dom === 'mid' ? T.coef(o.a, o.k === 1 ? 'z' : 'z^{' + o.k + '}') : dom === 'top' ? 'z^{' + o.n + '}' : String(o.b);
      var big = dom === 'mid' ? Math.abs(o.a) : dom === 'top' ? Math.pow(2, o.n) : Math.abs(o.b), small = dom === 'mid' ? 1 + Math.abs(o.b) : dom === 'top' ? Math.abs(o.a) * Math.pow(2, o.k) + Math.abs(o.b) : 1 + Math.abs(o.a);
      var st = ['On $|z| = ' + o.Rr + '$, take $f = ' + ft + '$ and $g$ = the other terms.', '$|f| = ' + big + '$ on the circle, while $|g| \\le ' + (dom === 'mid' ? '|z|^{' + o.n + '} + ' + Math.abs(o.b) : dom === 'top' ? (Math.abs(o.a) === 1 ? '' : Math.abs(o.a) + ' \\cdot ') + o.Rr + (o.k === 1 ? '' : '^{' + o.k + '}') + ' + ' + Math.abs(o.b) : '|z|^{' + o.n + '} + ' + tz(Math.abs(o.a), o.k)) + ' = ' + small + '$.', '$' + small + ' < ' + big + '$ at every point of the circle, so by Rouché the polynomial has as many zeros inside as $f$: $' + o.cnt + '$.'];
      if (kind === 'bound') return { q: 'On the circle $|z| = ' + o.Rr + '$, find the bound $M$ in $|g(z)| \\le M$ for $g(z) = ' + (dom === 'mid' ? 'z^{' + o.n + '}' + T.signed(o.b) : dom === 'top' ? T.coef(o.a, o.k === 1 ? 'z' : 'z^{' + o.k + '}') + T.signed(o.b) : 'z^{' + o.n + '}' + T.coef(o.a, o.k === 1 ? 'z' : 'z^{' + o.k + '}', false)) + '$ that the triangle inequality gives.', a: { t: 'num', v: String(small) },
        steps: ['Bound each term by its modulus on $|z| = ' + o.Rr + '$ and add (triangle inequality).', '$|g| \\le ' + (dom === 'mid' ? '|z|^{' + o.n + '} + ' + Math.abs(o.b) : dom === 'top' ? (Math.abs(o.a) === 1 ? '' : Math.abs(o.a) + ' \\cdot ') + o.Rr + (o.k === 1 ? '' : '^{' + o.k + '}') + ' + ' + Math.abs(o.b) : '|z|^{' + o.n + '} + ' + tz(Math.abs(o.a), o.k)) + ' = ' + small + '$.', 'Compare with $|f| = |' + ft + '| = ' + big + '$: since $' + small + ' < ' + big + '$, Rouché\'s theorem applies.'],
        hint: 'Replace $|z|$ by the radius in each term.', chk: { kind: kind } };
      if (kind === 'which') return { q: 'To count the zeros of $p(z) = ' + ptexOf(o) + '$ inside $|z| = ' + o.Rr + '$ with Rouché\'s theorem, which term should play the role of $f$ (the big one)?', a: mcSpec('$' + ft + '$', ['$z^{' + o.n + '}$', '$' + T.coef(o.a, o.k === 1 ? 'z' : 'z^{' + o.k + '}') + '$', '$' + o.b + '$', 'none of them works'].filter(function (x) { return x !== '$' + ft + '$'; }).slice(0, 3)),
        steps: st, hint: 'Compare the size of each term on the circle.', chk: { kind: kind, p: plainOf(o), R: o.Rr } };
      return { q: 'How many zeros (with multiplicity) does $p(z) = ' + ptexOf(o) + '$ have inside $|z| = ' + o.Rr + '$?', a: { t: 'num', v: String(o.cnt) }, steps: st,
        hint: 'Find the term that is bigger than all the others together on the circle.', chk: { kind: kind, p: plainOf(o), R: o.Rr, v: o.cnt } };
    }
    // annulus 1 < |z| < 2: both dominations at once
    var n = R.int(5, 7), k = R.int(1, 2), b = R.nz(-1, 1), a = R.sign() * R.int(Math.abs(b) + 2, Math.min(Math.abs(b) + 6, Math.floor((Math.pow(2, n) - Math.abs(b) - 1) / Math.pow(2, k)))), o2 = { n: n, k: k, a: a, b: b };
    return { q: 'How many zeros of $p(z) = ' + ptexOf(o2) + '$ lie in the annulus $1 < |z| < 2$?', a: { t: 'num', v: String(n - k) },
      steps: ['On $|z| = 1$: $|' + T.coef(a, k === 1 ? 'z' : 'z^{' + k + '}') + '| = ' + Math.abs(a) + ' > 1 + ' + Math.abs(b) + '$, so $p$ has $' + k + '$ zero' + (k > 1 ? 's' : '') + ' in $|z| < 1$.', 'On $|z| = 2$: $|z^{' + n + '}| = ' + Math.pow(2, n) + ' > ' + Math.abs(a) + ' \\cdot 2^{' + k + '} + ' + Math.abs(b) + ' = ' + (Math.abs(a) * Math.pow(2, k) + Math.abs(b)) + '$, so $p$ has $' + n + '$ zeros in $|z| < 2$.', 'No zero lies on $|z| = 1$ (there $|p| > 0$ by the same inequality), so the annulus holds $' + n + ' - ' + k + ' = ' + (n - k) + '$.'],
      hint: 'Count inside $|z| < 2$ and inside $|z| < 1$, then subtract.', chk: { kind: kind, p: 'z^' + n + '+(' + a + ')*z^' + k + '+(' + b + ')', v: n - k } };
  });

  // ===================================================================== Unit 8: Conformal Maps
  G('cplx.conformal-maps', function (R, ctx) {
    var kind = R.pick(L(ctx, ['deriv', 'keep', 'deriv'], ['crit', 'angle', 'deriv', 'area'], ['crit', 'angle', 'area', 'deriv']));
    if (kind === 'deriv') {
      var n = R.pick([2, 2, 3]), k = R.pick([Q(1, 4), Q(1, 6), Q(1, 3), Q(1, 2), Q(3, 4), Q(-1, 4), Q(2, 3), Q(0)]), m = R.int(1, 2), p = latticeAt(R, k);
      var mod2 = qn(radMul(p.x, p.x).k) + qn(radMul(p.y, p.y).k), argF = princ(k.mul(n - 1)), scale = n === 2 ? radNorm(2, mod2) : radNorm(3 * mod2, 1);
      var zT = rcTex(p.x, p.y);
      return { q: 'At $z_0 = ' + zT + '$, the map $f(z) = z^{' + n + '}$ turns tiny shapes by the angle $\\arg f\'(z_0)$ and scales them by $|f\'(z_0)|$. Find both (angle in $(-\\pi, \\pi]$).', a: { t: 'multi', parts: [{ label: 'angle:', a: { t: 'num', v: piPlain(argF) } }, { label: 'scale:', a: { t: 'num', v: radPlain(scale.k, scale.n) } }] },
        steps: ['$f\'(z) = ' + n + 'z' + (n === 3 ? '^2' : '') + '$, so $f\'(z_0) = ' + n + (n === 3 ? '(' + zT + ')^2' : '(' + zT + ')') + '$.', '$|z_0| = ' + radTex(1, mod2) + '$ and $\\arg z_0 = ' + piTex(k) + '$, so $|f\'(z_0)| = ' + n + (n === 3 ? ' \\cdot ' + mod2 : ' \\cdot ' + radTex(1, mod2)) + ' = ' + radTex(scale.k, scale.n) + '$.', '$\\arg f\'(z_0) = ' + (n === 3 ? '2 \\cdot ' + piTex(k) : piTex(k)) + (n === 3 && !k.mul(2).eq(argF) ? ' \\equiv ' + piTex(argF) : '') + (n === 3 && k.mul(2).eq(argF) ? ' = ' + piTex(argF) : '') + '$.'],
        hint: 'Compute $f\'(z_0)$ and write it in polar form.', chk: { kind: kind, n: n, z: rcPlain(p.x, p.y) } };
    }
    if (kind === 'keep') {
      var al = R.pick([Q(1, 6), Q(1, 4), Q(1, 3), Q(1, 2), Q(2, 3)]), f = R.pick(['e^{z}', 'z^{2} + 3z', '\\sin z', '\\frac{1}{z}']);
      return { q: 'Two smooth curves meet at $z_0$ at the angle $' + piTex(al) + '$. The map $f(z) = ' + f + '$ is analytic near $z_0$ with $f\'(z_0) \\ne 0$. At what angle do the image curves meet at $f(z_0)$?', a: { t: 'num', v: piPlain(al) },
        steps: ['Near $z_0$, $f(z) \\approx f(z_0) + f\'(z_0)(z - z_0)$: every direction is turned by the same angle $\\arg f\'(z_0)$.', 'Turning both tangent directions by the same amount keeps the angle between them (and its orientation).', 'So the image curves still meet at $' + piTex(al) + '$.'],
        hint: 'A conformal map turns all directions at a point by the same angle.', chk: { kind: kind } };
    }
    if (kind === 'crit') {
      var w = zrand(R, -2, 2, R.coin()), w2 = zmul(w, w), cubic = R.coin();
      if (cubic) return { q: 'Where does $f(z) = z^3 - ' + (zisReal(zscale(3, w2)) && zscale(3, w2).re.sign() > 0 ? qt(zscale(3, w2).re) : '(' + ztex(zscale(3, w2)) + ')') + 'z$ fail to be conformal? List the points.', a: { t: 'set', v: [zplain(w), zplain(zneg(w))] },
        steps: ['A nonconstant analytic map is conformal exactly where $f\'(z) \\ne 0$.', '$f\'(z) = 3z^2 - ' + zpar(zscale(3, w2)) + ' = 3(z^2 - ' + zpar(w2) + ')$.', '$z^2 = ' + ztex(w2) + '$ gives $z = \\pm(' + ztex(w) + ')$.'],
        hint: 'Solve $f\'(z) = 0$.', chk: { kind: kind, f: 'z^3-3*(' + zplain(w2) + ')*z', pts: [zplain(w), zplain(zneg(w))] } };
      var c = zrand(R, -3, 3);
      return { q: 'Where does $f(z) = ' + ptex(P([5, zscale(2, c), 1])) + '$ fail to be conformal?', a: { t: 'num', v: zplain(zneg(c)) },
        steps: ['$f\'(z) = 2z' + (zisz(c) ? '' : ' + ' + zpar(zscale(2, c))) + '$.', '$f\'(z) = 0$ at $z = ' + ztex(zneg(c)) + '$: there $f$ doubles angles instead of keeping them.'],
        hint: 'Find where $f\' = 0$.', chk: { kind: 'crit2', f: 'z^2+(' + zplain(zscale(2, c)) + ')*z+5', pt: zplain(zneg(c)) } };
    }
    if (kind === 'angle') {
      var n2 = R.pick([2, 3, 4]), al2 = R.pick([Q(1, 6), Q(1, 4), Q(1, 8), Q(1, 12), Q(1, 3)]); while (al2.mul(n2).gt(1)) al2 = al2.div(2);
      return { q: 'Two rays leave $0$ at the angle $' + piTex(al2) + '$ between them. At what angle do their images under $f(z) = z^{' + n2 + '}$ leave $0$?', a: { t: 'num', v: piPlain(al2.mul(n2)) },
        steps: ['$f\'(0) = 0$, so $f$ is not conformal at $0$.', 'A ray $\\arg z = \\theta$ goes to the ray $\\arg w = ' + n2 + '\\theta$: every angle at $0$ is multiplied by $' + n2 + '$.', 'So the angle becomes $' + n2 + ' \\cdot ' + piTex(al2) + ' = ' + piTex(al2.mul(n2)) + '$.'],
        hint: 'Powers multiply arguments.', chk: { kind: kind } };
    }
    var x0 = R.int(-2, 2), y0 = R.pick([1, 2, -1, 3]), useExp = R.coin();
    if (useExp) return { q: 'Near $z_0 = ' + ztex(Z(x0, y0)) + '$, by what factor does $f(z) = e^{z}$ multiply small areas? (The factor is $|f\'(z_0)|^2$.)', a: { t: 'num', v: 'e^(' + 2 * x0 + ')' },
      steps: ['Lengths are scaled by $|f\'(z_0)| = |e^{z_0}| = e^{' + x0 + '}$ in every direction.', 'Areas are scaled by the square: $e^{' + 2 * x0 + '}$.'],
      hint: 'A conformal map scales lengths by $|f\'|$, areas by $|f\'|^2$.', chk: { kind: kind, x: x0 } };
    var z1 = zrand(R, -2, 2, true);
    return { q: 'Near $z_0 = ' + ztex(z1) + '$, by what factor does $f(z) = z^2$ multiply small areas?', a: { t: 'num', v: qp(znorm(z1).mul(4)) },
      steps: ['$f\'(z_0) = 2z_0$, so lengths scale by $|2z_0| = 2|z_0|$.', 'Areas scale by $|2z_0|^2 = 4|z_0|^2 = 4 \\cdot ' + qt(znorm(z1)) + ' = ' + qt(znorm(z1).mul(4)) + '$.'],
      hint: 'Square $|f\'(z_0)|$.', chk: { kind: kind, z: zplain(z1) } };
  });

  // Möbius maps as 2×2 matrices of Gaussian rationals
  function mapp(M, z) { var d = zadd(zmul(M[1][0], z), M[1][1]); return zisz(d) ? null : zdiv(zadd(zmul(M[0][0], z), M[0][1]), d); }
  function mtex(M) { // (az + b)/(cz + d)
    var top = ptex(P([M[0][1], M[0][0]])), bot = ptex(P([M[1][1], M[1][0]]));
    return bot === '1' ? top : '\\dfrac{' + top + '}{' + bot + '}';
  }
  function mplain(M) { return '((' + zplain(M[0][0]) + ')*z+(' + zplain(M[0][1]) + '))/((' + zplain(M[1][0]) + ')*z+(' + zplain(M[1][1]) + '))'; }
  function mdet(M) { return zsub(zmul(M[0][0], M[1][1]), zmul(M[0][1], M[1][0])); }
  function randMob(R) { var M; do { M = [[zrand(R, -2, 2), zrand(R, -2, 2)], [Z(R.pick([1, 1, 2, -1]), R.pick([0, 0, 1])), zrand(R, -2, 2)]]; } while (zisz(mdet(M)) || zisz(M[0][0])); return M; }
  G('cplx.mobius', function (R, ctx) {
    var kind = R.pick(L(ctx, ['image', 'pole', 'image'], ['inverse', 'line', 'pole', 'image'], ['fixed', 'line', 'inverse', 'fixed']));
    var M = randMob(R), a = M[0][0], b = M[0][1], c = M[1][0], d = M[1][1];
    if (kind === 'image') {
      var z0, w0; do { z0 = zrand(R, -2, 2); w0 = mapp(M, z0); } while (!w0);
      return { q: 'Let $T(z) = ' + mtex(M) + '$. Find $T(' + ztex(z0) + ')$.', a: { t: 'num', v: zplain(w0) },
        steps: ['Top: $' + zpar(a) + zpar(z0) + ' + ' + zpar(b) + ' = ' + ztex(zadd(zmul(a, z0), b)) + '$.', 'Bottom: $' + zpar(c) + zpar(z0) + ' + ' + zpar(d) + ' = ' + ztex(zadd(zmul(c, z0), d)) + '$.', 'Divide (multiply by the conjugate of the bottom): $T(' + ztex(z0) + ') = ' + ztex(w0) + '$.'],
        hint: 'Substitute, then divide complex numbers.', chk: { kind: kind, T: mplain(M), z: zplain(z0), v: zplain(w0) } };
    }
    if (kind === 'pole') {
      var zp = zdiv(zneg(d), c), wi = zdiv(a, c);
      return { q: 'Let $T(z) = ' + mtex(M) + '$. Which point does $T$ send to $\\infty$, and what is $T(\\infty)$?', a: { t: 'multi', parts: [{ label: 'sent to $\\infty$:', a: { t: 'num', v: zplain(zp) } }, { label: '$T(\\infty) =$', a: { t: 'num', v: zplain(wi) } }] },
        steps: ['The bottom $' + ptex(P([d, c])) + '$ is $0$ at $z = -\\frac{d}{c} = ' + ztex(zp) + '$: that point goes to $\\infty$.', 'For large $|z|$, $T(z) \\approx \\frac{az}{cz} = \\frac{a}{c}$, so $T(\\infty) = \\frac{' + ztex(a) + '}{' + ztex(c) + '} = ' + ztex(wi) + '$.'],
        hint: 'Set the denominator to $0$; for $T(\\infty)$, compare the $z$ terms.', chk: { kind: kind, T: mplain(M), zp: zplain(zp), wi: zplain(wi) } };
    }
    if (kind === 'inverse') {
      var w1, z1; do { z1 = zrand(R, -2, 2); w1 = mapp(M, z1); } while (!w1);
      return { q: 'Let $T(z) = ' + mtex(M) + '$. Find the point $z$ with $T(z) = ' + ztex(w1) + '$.', a: { t: 'num', v: zplain(z1) },
        steps: ['Solve $w = \\frac{az + b}{cz + d}$ for $z$: $z = T^{-1}(w) = \\frac{dw - b}{-cw + a}$.', 'With $w = ' + ztex(w1) + '$: top $' + zpar(d) + zpar(w1) + ' - ' + zpar(b) + ' = ' + ztex(zsub(zmul(d, w1), b)) + '$, bottom $-' + zpar(c) + zpar(w1) + ' + ' + zpar(a) + ' = ' + ztex(zadd(zneg(zmul(c, w1)), a)) + '$.', '$z = ' + ztex(z1) + '$. Check: $T(' + ztex(z1) + ') = ' + ztex(w1) + '$.'],
        hint: 'Invert the matrix $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$: swap $a$ and $d$, negate $b$ and $c$.', chk: { kind: kind, T: mplain(M), w: zplain(w1), v: zplain(z1) } };
    }
    if (kind === 'line') {
      var zp2 = zdiv(zneg(d), c), r = R.int(1, 3), onC = R.coin(), cen, dir = R.pick([Z(1), Z(0, 1), Z(-1), Z(0, -1)]);
      cen = onC ? zsub(zp2, zscale(r, dir)) : zsub(zp2, zscale(r + 1, dir));
      return { q: 'Let $T(z) = ' + mtex(M) + '$. Is the image of the circle $' + circTex(cen, r) + '$ under $T$ a straight line?', a: { t: 'tf', v: onC },
        steps: ['A Möbius map sends circles and lines to circles and lines. The image is a line exactly when the circle passes through the point sent to $\\infty$.', 'That point is $-\\frac{d}{c} = ' + ztex(zp2) + '$, at distance $' + absTex(zsub(zp2, cen)) + '$ from the center $' + ztex(cen) + '$.', onC ? 'The distance equals the radius $' + r + '$: the circle passes through it, so the image is a line.' : 'The distance is not the radius $' + r + '$: the image is a circle.'],
        hint: 'Does the circle pass through $-d/c$?', chk: { kind: kind, T: mplain(M), c: zplain(cen), r: r, v: onC } };
    }
    // fixed points: T = S^{-1} diag(k, 1) S with S(z) = (z − p)/(z − q)
    var p, q2, k; do { p = zrand(R, -2, 2); q2 = zrand(R, -2, 2); } while (zeq(p, q2)); k = Z(R.pick([2, 3, -1, -2, 4]));
    var Mf = [[zsub(p, zmul(q2, k)), zmul(zmul(p, q2), zsub(k, Z1))], [zsub(Z1, k), zsub(zmul(k, p), q2)]];
    return { q: 'Find the fixed points of $T(z) = ' + mtex(Mf) + '$ (the points with $T(z) = z$).', a: { t: 'set', v: [zplain(p), zplain(q2)] },
      steps: ['$T(z) = z$ means $az + b = z(cz + d)$, that is $cz^2 + (d - a)z - b = 0$.', 'Here: $' + ptex(P([zneg(Mf[0][1]), zsub(Mf[1][1], Mf[0][0]), Mf[1][0]])) + ' = 0$.', 'Its roots are $' + ztex(p) + '$ and $' + ztex(q2) + '$ (check by substituting).'],
      hint: 'Clear the denominator in $T(z) = z$ and solve the quadratic.', chk: { kind: kind, T: mplain(Mf), pts: [zplain(p), zplain(q2)] } };
  });

  function cross01(z1, z2, z3) { return [[zsub(z2, z3), zneg(zmul(z1, zsub(z2, z3)))], [zsub(z2, z1), zneg(zmul(z3, zsub(z2, z1)))]]; } // z1 → 0, z2 → 1, z3 → ∞
  function minv2(M) { return [[M[1][1], zneg(M[0][1])], [zneg(M[1][0]), M[0][0]]]; }
  function mmul2(A, B) { return [[zadd(zmul(A[0][0], B[0][0]), zmul(A[0][1], B[1][0])), zadd(zmul(A[0][0], B[0][1]), zmul(A[0][1], B[1][1]))], [zadd(zmul(A[1][0], B[0][0]), zmul(A[1][1], B[1][0])), zadd(zmul(A[1][0], B[0][1]), zmul(A[1][1], B[1][1]))]]; }
  function distinct3(R, lo, hi) { var a, b, c; do { a = zrand(R, lo, hi); b = zrand(R, lo, hi); c = zrand(R, lo, hi); } while (zeq(a, b) || zeq(b, c) || zeq(a, c)); return [a, b, c]; }
  G('cplx.mobius-three-points', function (R, ctx) {
    var kind = R.pick(L(ctx, ['to01inf', 'formula', 'to01inf'], ['to01inf', 'formula', 'general'], ['general', 'general', 'to01inf']));
    if (kind === 'formula') {
      var z1 = zrand(R, -3, 3), z2; do { z2 = zrand(R, -3, 3); } while (zeq(z1, z2));
      var d = zsub(z2, z1), lin = P([zdiv(zneg(z1), d), zdiv(Z1, d)]);
      return { q: 'Find the Möbius map with $T(' + ztex(z1) + ') = 0$, $T(' + ztex(z2) + ') = 1$ and $T(\\infty) = \\infty$. Write $T(z)$.', a: { t: 'expr', v: pplain(lin), vars: ['z'] },
        steps: ['$T(\\infty) = \\infty$ means no denominator: $T(z) = Az + B$.', '$T(' + ztex(z1) + ') = 0$ gives $T(z) = A(' + zm(z1) + ')$; $T(' + ztex(z2) + ') = 1$ gives $A = \\frac{1}{' + ztex(d) + '} = ' + ztex(zdiv(Z1, d)) + '$.', '$T(z) = ' + ptex(lin) + '$.'],
        hint: 'With $\\infty \\mapsto \\infty$, $T$ is linear: $T(z) = \\frac{z - z_1}{z_2 - z_1}$.', chk: { kind: kind, z1: zplain(z1), z2: zplain(z2), ans: pplain(lin) } };
    }
    if (kind === 'to01inf') {
      var zs = distinct3(R, -2, 2), S = cross01(zs[0], zs[1], zs[2]), z0, w0; do { z0 = zrand(R, -3, 3); w0 = mapp(S, z0); } while (!w0 || zs.some(function (z) { return zeq(z, z0); }));
      return { q: 'Let $T$ be the Möbius map with $T(' + ztex(zs[0]) + ') = 0$, $T(' + ztex(zs[1]) + ') = 1$, $T(' + ztex(zs[2]) + ') = \\infty$. Find $T(' + ztex(z0) + ')$.', a: { t: 'num', v: zplain(w0) },
        steps: ['$T(z) = \\frac{(z - z_1)(z_2 - z_3)}{(z - z_3)(z_2 - z_1)}$: the factor $z - z_1$ makes $z_1 \\mapsto 0$, $z - z_3$ below makes $z_3 \\mapsto \\infty$, and the constant makes $z_2 \\mapsto 1$.', '$z_2 - z_3 = ' + ztex(zsub(zs[1], zs[2])) + '$ and $z_2 - z_1 = ' + ztex(zsub(zs[1], zs[0])) + '$.', 'At $z = ' + ztex(z0) + '$: $\\frac{(' + ztex(zsub(z0, zs[0])) + ')(' + ztex(zsub(zs[1], zs[2])) + ')}{(' + ztex(zsub(z0, zs[2])) + ')(' + ztex(zsub(zs[1], zs[0])) + ')} = ' + ztex(w0) + '$.'],
        hint: 'Use $T(z) = \\frac{(z - z_1)(z_2 - z_3)}{(z - z_3)(z_2 - z_1)}$, keeping the points in their order.', chk: { kind: kind, zs: zs.map(zplain), z: zplain(z0), v: zplain(w0) } };
    }
    var zs2 = distinct3(R, -2, 2), ws = distinct3(R, -2, 2), Tm = mmul2(minv2(cross01(ws[0], ws[1], ws[2])), cross01(zs2[0], zs2[1], zs2[2])), z5, w5, guard = 0;
    do { z5 = zrand(R, -3, 3); w5 = mapp(Tm, z5); guard++; } while ((!w5 || zs2.some(function (z) { return zeq(z, z5); })) && guard < 50);
    if (!w5) { z5 = zs2[0]; w5 = ws[0]; }
    var Sz = mapp(cross01(zs2[0], zs2[1], zs2[2]), z5);
    return { q: 'A Möbius map $T$ sends $' + ztex(zs2[0]) + ' \\mapsto ' + ztex(ws[0]) + '$, $' + ztex(zs2[1]) + ' \\mapsto ' + ztex(ws[1]) + '$ and $' + ztex(zs2[2]) + ' \\mapsto ' + ztex(ws[2]) + '$. Find $T(' + ztex(z5) + ')$.', a: { t: 'num', v: zplain(w5) },
      steps: ['Let $S_z$ send $z_1, z_2, z_3$ to $0, 1, \\infty$ and $S_w$ send $w_1, w_2, w_3$ to $0, 1, \\infty$. Then $T = S_w^{-1} \\circ S_z$ (the cross-ratio is preserved).', '$S_z(' + ztex(z5) + ') = ' + (Sz ? ztex(Sz) : '\\infty') + '$.', 'Solve $S_w(w) = ' + (Sz ? ztex(Sz) : '\\infty') + '$ for $w$: $w = ' + ztex(w5) + '$.'],
      hint: 'Match cross-ratios: $S_w(T(z)) = S_z(z)$.', chk: { kind: kind, zs: zs2.map(zplain), ws: ws.map(zplain), z: zplain(z5), v: zplain(w5) } };
  });

  G('cplx.standard-maps', function (R, ctx) {
    var kind = R.pick(L(ctx, ['power', 'cayley', 'power', 'inside'], ['strip', 'cayley', 'inside', 'invcayley'], ['chain', 'invcayley', 'strip', 'chain']));
    if (kind === 'power') {
      var n = R.int(2, 6);
      return { q: 'Which power $w = z^n$ maps the open sector $0 < \\arg z < ' + piTex(Q(1, n)) + '$ onto the upper half-plane?', a: { t: 'num', v: String(n) },
        steps: ['$z^n$ multiplies arguments by $n$ (and lengths go from $(0, \\infty)$ onto $(0, \\infty)$).', 'The sector\'s angles $0$ to $' + piTex(Q(1, n)) + '$ become $0$ to $\\pi$ exactly when $n = ' + n + '$.'],
        hint: 'Multiply the opening angle by $n$ to get $\\pi$.', chk: { kind: kind } };
    }
    if (kind === 'strip') {
      var opts = [[Q(1, 2), '\\frac{\\pi}{2}', '2', 'pi/(pi/2)'], [Q(1, 3), '\\frac{\\pi}{3}', '3', '3'], [Q(1), '\\pi', '1', '1'], [null, '2', 'pi/2', 'pi/2'], [null, '1', 'pi', 'pi'], [null, '4', 'pi/4', 'pi/4'], [Q(2), '2\\pi', '1/2', '1/2']], o = R.pick(opts);
      return { q: 'Find the constant $k > 0$ such that $w = e^{kz}$ maps the horizontal strip $0 < \\operatorname{Im} z < ' + o[1] + '$ onto the upper half-plane.', a: { t: 'num', v: o[2] },
        steps: ['$e^{x + iy} = e^x e^{iy}$: the line $\\operatorname{Im} z = y$ goes to the ray at angle $y$, and $e^x$ covers $(0, \\infty)$.', 'So $e^{\\zeta}$ maps the strip $0 < \\operatorname{Im}\\zeta < \\pi$ onto the upper half-plane. We need $\\zeta = kz$ to stretch the height $' + o[1] + '$ to $\\pi$.', '$k = \\frac{\\pi}{' + o[1] + '} = ' + T.plain(o[2]) + '$.'],
        hint: 'Stretch the strip so its height becomes $\\pi$, then use $e^{\\zeta}$.', chk: { kind: kind, h: o[1], v: o[2] } };
    }
    if (kind === 'cayley' || kind === 'inside') {
      var z0; do { z0 = zrand(R, -3, 3); } while (zeq(z0, Z(0, -1)));
      var w0 = zdiv(zsub(z0, ZI), zadd(z0, ZI)), inn = znorm(w0).lt(1), on = znorm(w0).eq(1);
      if (kind === 'inside') return { q: 'Under $w = \\dfrac{z - i}{z + i}$, does $z = ' + ztex(z0) + '$ land inside the unit disk $|w| < 1$?', a: { t: 'tf', v: inn },
        steps: ['$|w| = \\frac{|z - i|}{|z + i|}$ compares the distances from $z$ to $i$ and to $-i$.', 'Points of the upper half-plane are closer to $i$ than to $-i$, so they land inside the disk; the real axis lands on the circle; the lower half-plane lands outside.', '$\\operatorname{Im}(' + ztex(z0) + ') = ' + qt(z0.im) + '$: ' + (inn ? 'inside.' : on ? 'on the circle, not inside.' : 'outside.')],
        hint: 'Look at the sign of $\\operatorname{Im} z$.', chk: { kind: kind, z: zplain(z0), v: inn } };
      return { q: 'Find the image of $z = ' + ztex(z0) + '$ under $w = \\dfrac{z - i}{z + i}$.', a: { t: 'num', v: zplain(w0) },
        steps: ['Top: $' + ztex(zsub(z0, ZI)) + '$; bottom: $' + ztex(zadd(z0, ZI)) + '$.', 'Divide: $w = ' + ztex(w0) + '$, with $|w|^2 = ' + qt(znorm(w0)) + '$' + (z0.im.sign() > 0 ? ' (less than 1, as it should be for a point of the upper half-plane).' : z0.im.isZero() ? ' (a real $z$ lands on the unit circle).' : ' (more than 1: $z$ is in the lower half-plane).')],
        hint: 'Substitute and divide.', chk: { kind: kind, z: zplain(z0), v: zplain(w0) } };
    }
    if (kind === 'invcayley') {
      var w1; do { w1 = Z(Q(R.int(-3, 3), 4), Q(R.int(-3, 3), 4)); } while (!znorm(w1).lt(1) || zeq(w1, Z1));
      var z1 = zmul(ZI, zdiv(zadd(Z1, w1), zsub(Z1, w1)));
      return { q: 'The map $z = i\\dfrac{1 + w}{1 - w}$ sends the unit disk onto the upper half-plane. Find the image of $w = ' + ztex(w1) + '$.', a: { t: 'num', v: zplain(z1) },
        steps: ['$1 + w = ' + ztex(zadd(Z1, w1)) + '$ and $1 - w = ' + ztex(zsub(Z1, w1)) + '$; their quotient is $' + ztex(zdiv(zadd(Z1, w1), zsub(Z1, w1))) + '$.', 'Multiply by $i$: $z = ' + ztex(z1) + '$, with positive imaginary part, as expected.'],
        hint: 'Divide first, then multiply by $i$.', chk: { kind: kind, w: zplain(w1), v: zplain(z1) } };
    }
    var a = R.int(1, 3), b = R.int(1, 3), zq = Z(a, b), sq = zmul(zq, zq), w2 = zdiv(zsub(sq, ZI), zadd(sq, ZI));
    return { q: 'The first quadrant is mapped onto the unit disk by first $\\zeta = z^2$ (onto the upper half-plane) and then $w = \\dfrac{\\zeta - i}{\\zeta + i}$. Where does $z = ' + ztex(zq) + '$ go?', a: { t: 'num', v: zplain(w2) },
      steps: ['$\\zeta = (' + ztex(zq) + ')^2 = ' + ztex(sq) + '$, in the upper half-plane.', '$w = \\frac{' + ztex(zsub(sq, ZI)) + '}{' + ztex(zadd(sq, ZI)) + '} = ' + ztex(w2) + '$.', 'Check: $|w|^2 = ' + qt(znorm(w2)) + ' < 1$.'],
      hint: 'Apply the two maps in order.', chk: { kind: kind, z: zplain(zq), v: zplain(w2) } };
  });
})(window.MathLadder);
