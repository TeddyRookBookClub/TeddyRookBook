/* Math Ladder generators: Linear Algebra (la). One generator per topic in data/math/topics/la.json.
   Built from /tmp/work_mlp17/gen/*.js (concatenated by build-gen.js); edit the parts there, not this file.
   Every answer is computed from the numbers generated here with exact rationals (ML.Q, ML.M) and checked
   independently in the work dir's tests (multiplying back, A·v = λv, orthogonality, normal equations). */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, Q = ML.Q, M = ML.M, U = ML.util, by = ML.byLevel;

  // ---------------------------------------------------------------- small exact helpers
  function q(x) { return Q.from(x); }
  function qm(A) { return A.map(function (r) { return r.map(q); }); }
  function cp(A) { return A.map(function (r) { return r.slice(); }); }
  function zeros(r, c) { var A = []; for (var i = 0; i < r; i++) { A.push([]); for (var j = 0; j < c; j++) A[i].push(q(0)); } return A; }
  function eye(n) { var A = zeros(n, n); for (var i = 0; i < n; i++) A[i][i] = q(1); return A; }
  function col(A, j) { return A.map(function (r) { return r[j]; }); }
  function cols(vs) { return vs[0].map(function (_, i) { return vs.map(function (v) { return v[i]; }); }); } // vectors -> matrix with them as columns
  function mv(A, v) { return M.mul(A, v.map(function (x) { return [x]; })).map(function (r) { return r[0]; }); }
  function mm(A, B) { return M.mul(A, B); }
  function tr(A) { return M.T(A); }
  function det(A) { return M.det(A); }
  function inv(A) { return M.inv(A); }
  function rref(A) { return M.rref(A); }
  function add(A, B) { return M.add(A, B); }
  function sc(k, A) { return M.scale(k, A); }
  function vadd(u, v) { return u.map(function (x, i) { return q(x).add(v[i]); }); }
  function vsub(u, v) { return u.map(function (x, i) { return q(x).sub(v[i]); }); }
  function vsc(k, v) { return v.map(function (x) { return q(x).mul(k); }); }
  function dot(u, v) { return u.reduce(function (s, x, i) { return s.add(q(x).mul(v[i])); }, q(0)); }
  function isZeroV(v) { return v.every(function (x) { return q(x).isZero(); }); }
  function eqV(u, v) { return u.length === v.length && u.every(function (x, i) { return q(x).eq(v[i]); }); }
  function eqM(A, B) { return A.length === B.length && A.every(function (r, i) { return eqV(r, B[i]); }); }
  function pl(x) { return q(x).toPlain(); }
  function plV(v) { return v.map(pl); }
  function plM(A) { return M.plain(A); }
  function maxAbs(A) { var m = 0; A.forEach(function (r) { (Array.isArray(r) ? r : [r]).forEach(function (x) { m = Math.max(m, Math.abs(q(x).toNumber())); }); }); return m; }
  function allInt(A) { return A.every(function (r) { return (Array.isArray(r) ? r : [r]).every(function (x) { return q(x).isInt(); }); }); }
  function rank(A) { return pivotsOf(rref(A)).length; }
  function pivotsOf(R, ncols) { // pivot columns of a matrix in RREF (only the first ncols columns count)
    var out = [], n = ncols === undefined ? R[0].length : ncols;
    R.forEach(function (r) { for (var j = 0; j < n; j++) if (!r[j].isZero()) { out.push(j); return; } });
    return out;
  }
  function tex(A) { return T.mat(A); }
  function texv(v) { return T.col(v); }
  function texr(v) { return T.pt(v); }  // (a, b, c)
  function N(x) { return T.num(q(x)); }
  function P(x) { return T.p(q(x)); }
  function pp(a, b) { return '(' + N(a) + ')(' + N(b) + ')'; }           // a product of two numbers: (2)(-3)
  function prods(u, v) { return u.map(function (a, i) { return pp(a, v[i]); }).join(' + '); } // (1)(2) + (0)(-3) + …
  function sub(i) { return '_{' + i + '}'; }
  function vname(s, i) { return '\\mathbf{' + s + '}' + (i === undefined ? '' : sub(i)); }
  function lst(a) { return U.list(a); }
  function sumTex(coefs, names) { // c1 v1 + c2 v2 ... with clean signs
    return T.terms(coefs.map(function (c, i) { return [q(c), names[i]]; }));
  }
  function pick(R, a) { return R.pick(a); }
  // long inline math chains "a = b = c" are split into "$a$ $= b$ $= c$" so narrow screens can wrap them
  // splitWide(s): in text with $…$ inline math, break long inline chains "a = b = c" into "$a$ $= b$ $= c$" so lines can wrap.
  // Only splits at top-level "=" (outside braces, \left…\right and environments). Display math ($$…$$) is left alone.
  function splitTex(tex, force) {
    var parts = [], depth = 0, env = 0, lr = 0, last = 0, i, n = tex.length;
    for (i = 0; i < n; i++) {
      var c = tex[i];
      if (c === '\\') {
        var m = /^\\([a-zA-Z]+)/.exec(tex.slice(i));
        if (m) { var nm = m[1]; if (nm === 'begin') env++; else if (nm === 'end') env--; else if (nm === 'left') lr++; else if (nm === 'right') lr--; i += m[0].length - 1; }
        else i++;
        continue;
      }
      if (c === '{') depth++; else if (c === '}') depth--;
      else if (c === '=' && depth === 0 && env === 0 && lr === 0 && i > 0) { parts.push(tex.slice(last, i).trim()); last = i; }
    }
    parts.push(tex.slice(last).trim());
    return parts;
  }
  function visLen(tex) {
    var t = tex.replace(/\\begin\{(?:[a-z]*matrix|array)\}(?:\{[^}]*\})?([^]*?)\\end\{(?:[a-z]*matrix|array)\}/g, function (m, b) {
      var w = Math.max.apply(null, b.split('\\\\').map(function (r) { var cells = r.split('&'); return cells.reduce(function (s2, c) { return s2 + visLen(c) + 2; }, 0); }));
      return 'x'.repeat(w + 2);
    });
    return t.replace(/\\(cos|sin|tan|det|operatorname|ldots|cdots|lVert|rVert|mathbb|text)/g, 'xx').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_ ]/g, '').length;
  }
  function splitWide(s, limit, big) { // big: inline pieces wider than this become display math
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    limit = limit || 26;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var e = s.indexOf('$$', i + 2); if (e < 0) { out += s.slice(i); break; } out += s.slice(i, e + 2); i = e + 2; continue; }
      if (c === '$') {
        var j = i + 1; while (j < n && !(s[j] === '$' && s[j - 1] !== '\\')) j++;
        if (j >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, j), parts = splitTex(tex);
        if (!(parts.length > 1 && visLen(tex) > limit && parts.every(function (p) { return p.length; }))) parts = [tex];
        out += parts.map(function (p) { return big && visLen(p) > big ? '$$' + p + '$$' : '$' + p + '$'; }).join(' ');
        i = j + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  function test(p, data) {
    p.q = splitWide(p.q, 22, 36); p.steps = p.steps.map(function (st) { return splitWide(st, 22, 36); }); if (p.hint) p.hint = splitWide(p.hint, 22, 36);
    if (ML._laTest) p._t = data; return p;
  }

  // ---------------------------------------------------------------- random matrices with nice arithmetic
  function rint(R, lo, hi, nz) { return nz ? R.nz(lo, hi) : R.int(lo, hi); }
  function randM(R, r, c, lo, hi, nz) { var A = []; for (var i = 0; i < r; i++) { A.push([]); for (var j = 0; j < c; j++) A[i].push(q(rint(R, lo, hi, nz))); } return A; }
  function randV(R, n, lo, hi, nz) { var v = []; for (var i = 0; i < n; i++) v.push(q(rint(R, lo, hi, nz))); return v; }
  function unitLower(R, n, lo, hi) { var L = eye(n); for (var i = 1; i < n; i++) for (var j = 0; j < i; j++) L[i][j] = q(R.int(lo, hi)); return L; }
  function unitUpper(R, n, lo, hi) { var Uu = eye(n); for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) Uu[i][j] = q(R.int(lo, hi)); return Uu; }
  function diag(d) { var A = zeros(d.length, d.length); d.forEach(function (x, i) { A[i][i] = q(x); }); return A; }
  // an integer matrix with determinant ±1 (so its inverse is an integer matrix); entries kept small
  function unimod(R, n, maxEntry) {
    maxEntry = maxEntry || 9;
    for (var t = 0; t < 60; t++) {
      var A = mm(unitLower(R, n, -2, 2), unitUpper(R, n, -2, 2));
      if (R.coin()) { var i = R.int(0, n - 1); A[i] = A[i].map(function (x) { return x.neg(); }); }
      if (n > 1 && R.chance(0.3)) { var a = R.int(0, n - 1), b = (a + 1) % n, tmp = A[a]; A[a] = A[b]; A[b] = tmp; }
      if (maxAbs(A) <= maxEntry && maxAbs(inv(A)) <= maxEntry && !isTrivialM(A)) return A;
    }
    return n === 2 ? qm([[2, 1], [1, 1]]) : qm([[1, 2, 0], [0, 1, 1], [1, 2, 1]].slice(0, n).map(function (r) { return r.slice(0, n); }));
  }
  function isTrivialM(A) { var z = 0; A.forEach(function (r) { r.forEach(function (x) { if (x.isZero()) z++; }); }); return z > A.length * A[0].length / 2; }
  // a matrix whose Gauss-Jordan elimination stays in whole numbers: A = L * Dg * Uu * Rr (Rr in RREF)
  function niceFromRref(R, Rr, opts) {
    opts = opts || {}; var m = Rr.length;
    for (var t = 0; t < 60; t++) {
      var L = unitLower(R, m, -3, 3), Uu = unitUpper(R, m, -2, 2), d = [];
      for (var i = 0; i < m; i++) d.push(opts.scale && R.chance(0.4) ? R.pick([-1, 2, -2, 3]) : 1);
      var A = mm(mm(mm(L, diag(d)), Uu), Rr);
      if (opts.swap) { var tmp = A[0]; A[0] = A[1]; A[1] = tmp; }
      var lim = opts.max || 12;
      if (maxAbs(A) <= lim && !A.some(function (r) { return isZeroV(r.slice(0, opts.ncoef || r.length)) && !isZeroV(r); }) && (opts.allowZeroRow || !A.some(isZeroV))) return A;
    }
    return null;
  }
  // a random RREF matrix with the given pivot columns (entries in non-pivot columns small whole numbers)
  function randRref(R, m, n, piv, lo, hi) {
    var A = zeros(m, n);
    piv.forEach(function (pc, i) {
      A[i][pc] = q(1);
      for (var j = pc + 1; j < n; j++) if (piv.indexOf(j) < 0) A[i][j] = q(R.int(lo === undefined ? -4 : lo, hi === undefined ? 4 : hi));
    });
    return A;
  }

  // ---------------------------------------------------------------- row reduction with a record of the steps
  function Rn(i) { return 'R_{' + (i + 1) + '}'; }
  function opAdd(k, f, r) { return Rn(k) + ' \\to ' + Rn(k) + T.coef(f, Rn(r), false); }  // R_k -> R_k + f R_r
  function opScale(r, f) { return Rn(r) + ' \\to ' + T.coef(f, Rn(r)); }
  function opSwap(a, b) { return Rn(a) + ' \\leftrightarrow ' + Rn(b); }
  /* elim(A, o): Gaussian (o.mode 'echelon') or Gauss-Jordan ('rref') elimination with exact numbers.
     o.ncoef: number of coefficient columns (pivots are only taken there; default all columns).
     o.aug: 1 to print matrices as augmented (bar before the last column).
     Returns { M: the final matrix, steps: [{ ops: [TeX], M }], pivots: [columns] }. Each step groups the work on one column. */
  function elim(A, o) {
    o = o || {}; var X = qm(A), m = X.length, n = X[0].length, nc = o.ncoef === undefined ? n : o.ncoef, steps = [], piv = [], r = 0;
    function snap(ops) { if (ops.length) steps.push({ ops: ops, M: cp(X) }); }
    for (var c = 0; c < nc && r < m; c++) {
      var i = -1, k;
      // keep the current row when it has a nonzero entry here; otherwise swap in a lower row (preferring an entry ±1)
      if (!X[r][c].isZero()) i = r;
      else for (k = r + 1; k < m; k++) if (!X[k][c].isZero() && (i < 0 || (X[k][c].abs().eq(1) && !X[i][c].abs().eq(1)))) i = k;
      if (i < 0) continue;
      var ops = [];
      if (i !== r) { var t = X[i]; X[i] = X[r]; X[r] = t; ops.push(opSwap(r, i)); snap(ops); ops = []; }
      if (o.mode === 'rref' && !X[r][c].eq(1)) { var s = X[r][c].inv(); X[r] = X[r].map(function (x) { return x.mul(s); }); ops.push(opScale(r, s)); snap(ops); ops = []; }
      for (k = 0; k < m; k++) {
        if (k === r || (o.mode !== 'rref' && k < r)) continue;
        if (X[k][c].isZero()) continue;
        var f = X[k][c].div(X[r][c]).neg();
        X[k] = X[k].map(function (x, j) { return x.add(f.mul(X[r][j])); });
        ops.push(opAdd(k, f, r));
      }
      snap(ops);
      piv.push(c); r++;
    }
    return { M: X, steps: steps, pivots: piv, mode: o.mode };
  }
  function texA(A, aug) { return aug ? T.aug(A, aug) : T.mat(A); }
  function stepTexts(E, aug, intro) { // the steps of elim() as text lines
    if (!E.steps.length) return ['No row operations are needed: the matrix is already in ' + (E.mode === 'rref' ? 'reduced ' : '') + 'echelon form.'];
    return E.steps.map(function (s) { return (intro || '') + '$' + s.ops.join(',\\; ') + '$: $' + texA(s.M, aug) + '$'; });
  }
  function backSub(Ux, nvars) { // solve an echelon augmented system with a unique solution (square, pivots on the diagonal)
    var n = nvars, x = new Array(n), lines = [];
    for (var i = n - 1; i >= 0; i--) {
      var s = Ux[i][n];
      for (var j = i + 1; j < n; j++) s = s.sub(Ux[i][j].mul(x[j]));
      x[i] = s.div(Ux[i][i]);
    }
    return x;
  }
  function eqnTex(row, names, rhs) { // "2x_1 - x_2 + 3x_3 = 4"
    var lhs = T.terms(row.map(function (c, j) { return [q(c), names[j]]; }));
    return lhs + ' = ' + N(rhs);
  }
  function systemTex(A, b, names) { // a system as aligned equations (cases-free: an aligned block)
    return '\\begin{aligned} ' + A.map(function (r, i) { return eqnTex(r, names, b[i]).replace(' = ', ' &= '); }).join(' \\\\ ') + ' \\end{aligned}';
  }
  function xs(n, s) { var a = []; for (var i = 1; i <= n; i++) a.push((s || 'x') + '_{' + i + '}'); return a; }
  function xyz(n) { return ['x', 'y', 'z', 'w'].slice(0, n); }

  // ---------------------------------------------------------------- answer specs
  function aM(A) { return { t: 'matrix', v: plM(A) }; }
  function aV(v, labels) { var s = { t: 'tuple', v: plV(v) }; if (labels) s.labels = labels; return s; }
  function aN(x, form) { var s = { t: 'num', v: typeof x === 'string' ? x : pl(x) }; if (form) s.form = form; return s; }
  function aTF(b) { return { t: 'tf', v: !!b }; }
  function aMC(correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function aSet(vals) { return { t: 'set', v: vals.map(function (x) { return typeof x === 'string' ? x : pl(x); }) }; }
  function uniqStr(arr) { return U.uniq(arr.map(String)); }

  // ---------------------------------------------------------------- square roots, kept exact
  // sqrtQ(x): for a rational x >= 0, { tex, plain } of its square root, simplified (sqrt(8/9) -> 2√2/3)
  function sqrtQ(x) {
    x = q(x); if (x.isZero()) return { tex: '0', plain: '0', exact: true, val: 0 };
    var n = x.num(), d = x.den(), nd = n * d; // sqrt(n/d) = sqrt(n d)/d
    var r = U.simplifyRadical(nd), out = q(r[0]).div(d);
    if (r[1] === 1) return { tex: out.toTex(), plain: out.toPlain(), exact: true, val: out.toNumber() };
    var coefT = out.eq(1) ? '' : out.n === 1n ? '' : String(out.n), texS;
    if (out.d === 1n) texS = (out.eq(1) ? '' : String(out.n)) + '\\sqrt{' + r[1] + '}';
    else texS = '\\frac{' + (out.n === 1n ? '' : String(out.n)) + '\\sqrt{' + r[1] + '}}{' + out.d + '}';
    var plainS = (out.n === 1n ? '' : out.n + '*') + 'sqrt(' + r[1] + ')' + (out.d === 1n ? '' : '/' + out.d);
    return { tex: texS, plain: plainS, exact: false, val: out.toNumber() * Math.sqrt(r[1]) };
  }
  // a rational times sqrt(k): k*1 entries for unit vectors like (1, 2)/√5
  function rtTex(c, s) { // c * sqrt(s) as TeX, c rational, s positive integer (not a square)
    c = q(c); if (c.isZero()) return '0';
    var r = U.simplifyRadical(s); c = c.mul(r[0]); s = r[1];
    if (s === 1) return c.toTex();
    var a = c.abs(), sg = c.sign() < 0 ? '-' : '';
    var num = (a.n === 1n ? '' : String(a.n)) + '\\sqrt{' + s + '}';
    return sg + (a.d === 1n ? num : '\\frac{' + num + '}{' + a.d + '}');
  }
  function rtPlain(c, s) {
    c = q(c); if (c.isZero()) return '0';
    var r = U.simplifyRadical(s); c = c.mul(r[0]); s = r[1];
    if (s === 1) return c.toPlain();
    return '(' + c.toPlain() + ')*sqrt(' + s + ')';
  }


  // ================================================================ Unit 1: Linear Systems

  var COUNT3 = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];
  function countMC(kind) { // kind 0 one, 1 none, 2 infinite
    return { t: 'mc', choices: COUNT3.slice(), v: kind, keep: true };
  }
  function subsTex(row, x) { // "2(1) - (2) + 3(-3)"
    var s = '';
    row.forEach(function (c, j) {
      c = q(c); if (c.isZero()) return;
      var a = c.abs(), body = (a.eq(1) ? '' : a.toTex()) + '(' + N(x[j]) + ')';
      s += s === '' ? (c.sign() < 0 ? '-' : '') + body : (c.sign() < 0 ? ' - ' : ' + ') + body;
    });
    return s || '0';
  }
  function checkLine(A, b, x, names, i) {
    i = i || 0;
    return 'Check in equation ' + (i + 1) + ': $' + subsTex(A[i], x) + ' = ' + N(dot(A[i], x)) + '$, which matches $' + N(b[i]) + '$.';
  }

  // ---------------------------------------------------------------- la.systems-pictures
  G('la.systems-pictures', function (R, ctx) {
    var kind = by(ctx, R.pick(['count', 'count', 'column']), R.pick(['count', 'column', 'vecform']), R.pick(['column', 'vecform', 'count']));
    var names = ['x', 'y'];
    if (kind === 'count') {
      var which = R.int(0, 2), a = R.nz(-5, 5), b = R.nz(-5, 5), c = R.int(-9, 9), A, rhs, k = R.pick([2, 3, -2, -1, -3]);
      if (which === 0) {
        var a2, b2; do { a2 = R.nz(-5, 5); b2 = R.nz(-5, 5); } while (a * b2 === a2 * b);
        A = [[a, b], [a2, b2]]; rhs = [c, R.int(-9, 9)];
      } else {
        A = [[a, b], [k * a, k * b]];
        rhs = [c, which === 2 ? k * c : k * c + R.nz(-4, 4)];
      }
      var sys = systemTex(qm(A), rhs.map(q), names), steps;
      if (which === 0) steps = [
        'Each equation is a line in the $xy$-plane. Compare the coefficients: is the second row a multiple of the first?',
        'Cross-multiply the coefficients: $' + pp(A[0][0], A[1][1]) + ' = ' + N(A[0][0] * A[1][1]) + '$ and $' + pp(A[0][1], A[1][0]) + ' = ' + N(A[0][1] * A[1][0]) + '$. They differ, so the coefficients are not proportional.',
        'So the lines have different slopes and cross at exactly one point: <b>exactly one solution</b>.'];
      else steps = [
        'Each equation is a line. Compare the second equation with the first.',
        'The coefficients of the second equation are $' + N(k) + '$ times those of the first: $' + N(k) + T.cdot() + P(A[0][0]) + ' = ' + N(A[1][0]) + '$ and $' + N(k) + T.cdot() + P(A[0][1]) + ' = ' + N(A[1][1]) + '$. So the lines have the same slope.',
        'Now the right sides: $' + N(k) + T.cdot() + P(rhs[0]) + ' = ' + N(k * rhs[0]) + '$' + (which === 2 ? ', which matches $' + N(rhs[1]) + '$. The two equations describe the same line: <b>infinitely many solutions</b>.' : ', but the second right side is $' + N(rhs[1]) + '$. Same slope, different line: the lines are parallel and never meet, so there is <b>no solution</b>.')];
      return test({
        q: 'How many solutions does this system have? Think of each equation as a line. $$' + sys + '$$',
        a: countMC(which), steps: steps,
        hint: 'Check whether the second equation\'s coefficients are a multiple of the first equation\'s.'
      }, { kind: 'count', A: A, b: rhs, which: which });
    }
    if (kind === 'column') {
      var n3 = by(ctx, false, R.chance(0.3), R.chance(0.5)), A2, x, bb;
      if (!n3) { A2 = unimod(R, 2, 6); x = randV(R, 2, -5, 5, true); }
      else { A2 = mm(unimod(R, 2, 5), qm([[1, 0], [0, 1]])); var extra = [R.int(-3, 3), R.int(-3, 3)]; A2 = A2.concat([[q(extra[0]), q(extra[1])]]); x = randV(R, 2, -4, 4, true); }
      bb = mv(A2, x);
      var c1 = col(A2, 0), c2 = col(A2, 1);
      var E = elim(A2.map(function (r, i) { return r.concat([bb[i]]); }), { mode: 'rref', ncoef: 2 });
      var steps2 = ['Match entries: each row of the vector equation is one ordinary equation: $$' + systemTex(A2, bb, names) + '$$'];
      steps2 = steps2.concat(stepTexts(E, 1, 'Row reduce the augmented matrix. '));
      steps2.push('So $x = ' + N(x[0]) + '$ and $y = ' + N(x[1]) + '$. Check: $' + T.coef(x[0], texv(c1)) + T.coef(x[1], texv(c2), false) + ' = ' + texv(bb) + '$.');
      return test({
        q: 'Find $x$ and $y$ so that $$x' + texv(c1) + ' + y' + texv(c2) + ' = ' + texv(bb) + '.$$ Give your answer as $(x, y)$.',
        a: aV(x, ['x', 'y']), steps: steps2,
        hint: 'Each row of the vector equation is an ordinary equation in $x$ and $y$. Solve that system.'
      }, { kind: 'column', A: A2, b: bb, x: x });
    }
    // which vector equation matches a system (column picture vs a row mix-up)
    var m = by(ctx, 2, R.pick([2, 3]), 3), n = m === 3 ? R.pick([2, 3]) : 2, nm = n === 3 ? ['x', 'y', 'z'] : ['x', 'y'];
    var A3 = randM(R, m, n, -5, 6, true), b3 = randV(R, m, -9, 9);
    function vecEq(C, rhs) { return C[0].map(function (_, j) { return (j ? ' + ' : '') + nm[j] + texv(col(C, j)); }).join('') + ' = ' + texv(rhs); }
    var good = vecEq(A3, b3), wrongs = [];
    if (m === n) wrongs.push(vecEq(tr(A3), b3));
    var swapped = cp(A3); swapped.forEach(function (r) { var t = r[0]; r[0] = r[1]; r[1] = t; }); wrongs.push(vecEq(swapped, b3));
    var negb = b3.map(function (v) { return v.neg(); }); if (!isZeroV(b3)) wrongs.push(vecEq(A3, negb));
    var altA = cp(A3); altA[0] = altA[0].map(function (v, j) { return j === 0 ? v.add(1) : v; }); wrongs.push(vecEq(altA, b3));
    var choices = uniqStr(['$' + good + '$'].concat(wrongs.map(function (w) { return '$' + w + '$'; }))).slice(0, 4);
    return test({
      q: 'Which vector equation has exactly the same solutions as this system? $$' + systemTex(A3, b3, nm) + '$$',
      a: { t: 'mc', choices: choices, v: 0 },
      steps: ['The column picture: collect the coefficients of each unknown into a column vector.',
        nm.map(function (v, j) { return 'The coefficients of $' + v + '$ form $' + texv(col(A3, j)) + '$.'; }).join(' '),
        'The right sides form $' + texv(b3) + '$, so the system is $' + good + '$.'],
      hint: 'Read the coefficients of one unknown down the equations. That column multiplies that unknown.'
    }, { kind: 'vecform' });
  });

  // ---------------------------------------------------------------- la.augmented-matrices
  G('la.augmented-matrices', function (R, ctx) {
    var kind = by(ctx, R.pick(['write', 'op', 'op', 'legal']), R.pick(['write', 'op', 'legal', 'read']), R.pick(['write', 'op', 'legal', 'op2']));
    if (kind === 'write' || kind === 'read') {
      var n = by(ctx, 2, 3, 3), names = n === 2 ? ['x', 'y'] : ['x', 'y', 'z'], A = randM(R, n, n, -6, 7), b = randV(R, n, -9, 9);
      // make sure no equation is empty and leave a gap at higher levels
      A.forEach(function (r) { if (isZeroV(r)) r[0] = q(R.nz(-4, 4)); });
      if (n === 3 && ctx.level >= 2) { var gi = R.int(0, 2), gj = R.int(0, 2); A[gi][gj] = q(0); if (isZeroV(A[gi])) A[gi][(gj + 1) % 3] = q(R.nz(-3, 3)); }
      A.forEach(function (r) { r.forEach(function (x, j) { if (x.isZero() && R.chance(0.2) && ctx.level === 1) r[j] = q(R.nz(-3, 3)); }); });
      var Aug = A.map(function (r, i) { return r.concat([b[i]]); });
      if (kind === 'read') {
        var good = systemTex(A, b, names), wr = [];
        wr.push(systemTex(tr(A), b, names));
        wr.push(systemTex(A.map(function (r, i) { return r.slice(1).concat([b[i]]); }), A.map(function (r) { return r[0]; }), names));
        wr.push(systemTex(A, b.map(function (x) { return x.neg(); }), names));
        var ch = uniqStr(['$' + good + '$'].concat(wr.map(function (w) { return '$' + w + '$'; }))).slice(0, 4);
        return test({
          q: 'Which system does this augmented matrix stand for? (Columns are $' + names.join(', ') + '$, then the constants.) $$' + T.aug(Aug) + '$$',
          a: { t: 'mc', choices: ch, v: 0 },
          steps: ['Each row is one equation. The entries left of the bar are the coefficients of $' + names.join(', ') + '$ in order; the entry right of the bar is the constant.',
            'Row 1 reads $' + eqnTex(A[0], names, b[0]) + '$.', 'The whole system is $$' + good + '$$'],
          hint: 'Read across a row: coefficient of $x$, of $y$, …, then the constant after the bar.'
        }, { kind: 'read' });
      }
      // a scrambled presentation at level 3: terms out of order
      var shown;
      if (ctx.level >= 3) {
        var scr = R.int(0, n - 1);
        shown = '\\begin{aligned} ' + A.map(function (r, i) {
          if (i !== scr) return eqnTex(r, names, b[i]).replace(' = ', ' &= ');
          var order = R.shuffle(names.map(function (_, j) { return j; })); if (order[0] === 0) order.push(order.shift());
          return T.terms(order.map(function (j) { return [r[j], names[j]]; })).replace(/^0$/, '0') + ' &= ' + N(b[i]);
        }).join(' \\\\ ') + ' \\end{aligned}';
      } else shown = systemTex(A, b, names);
      var stepsW = ['Line up the variables in the order $' + names.join(', ') + '$. A missing variable has coefficient $0$.'];
      A.forEach(function (r, i) { stepsW.push('Equation ' + (i + 1) + ' gives the row $' + T.aug([r.concat([b[i]])]) + '$.'); });
      stepsW.push('Augmented matrix: $' + T.aug(Aug) + '$');
      return test({
        q: 'Write the augmented matrix of the system, with columns in the order $' + names.join(', ') + '$ and the constants last. $$' + shown + '$$',
        a: aM(Aug), steps: stepsW,
        hint: 'Put the coefficients of $' + names[0] + '$ in the first column. If a variable is missing from an equation, its coefficient is $0$.'
      }, { kind: 'write', A: A, b: b });
    }
    if (kind === 'op' || kind === 'op2') {
      var m = by(ctx, 2, 3, 3), Aug2 = randM(R, m, m + 1, -6, 7), ops = [], X = cp(Aug2);
      function doOp(t) {
        var i = R.int(0, m - 1), j = R.intNot(0, m - 1, i), f = R.nz(-4, 4), d;
        if (t === 'swap') { var tmp = X[i]; X[i] = X[j]; X[j] = tmp; d = opSwap(i, j); }
        else if (t === 'scale') { var s = R.pick([2, 3, -1, -2, 4]); X[i] = X[i].map(function (x) { return x.mul(s); }); d = opScale(i, q(s)); }
        else { X[i] = X[i].map(function (x, c) { return x.add(X[j][c].mul(f)); }); d = opAdd(i, q(f), j); }
        return d;
      }
      var types = kind === 'op2' ? [R.pick(['swap', 'scale']), 'add'] : [R.pick(['add', 'add', 'scale', 'swap'])];
      var descs = types.map(doOp);
      var stepsO = descs.map(function (d, k) { return (k ? 'Then ' : '') + '$' + d + '$' + (/leftrightarrow/.test(d) ? ': the two rows trade places.' : /to R_\{(\d)\} [+-]/.test(d) ? ': each entry of the target row gets the multiple of the other row added; the other row does not change.' : ': every entry of that row, including the constant, is multiplied.'); });
      stepsO.push('Result: $' + T.aug(X) + '$');
      return test({
        q: 'Apply ' + (descs.length > 1 ? 'these row operations, in order: $' + descs.join('$, then $') + '$' : 'the row operation $' + descs[0] + '$') + ' to $$' + T.aug(Aug2) + '$$ What is the new matrix?',
        a: aM(X), steps: stepsO,
        hint: 'Only the row on the left of the arrow changes. Work entry by entry, including the entry after the bar.'
      }, { kind: 'op', before: Aug2, after: X });
    }
    // which operation can change the solution set
    var r1 = R.int(1, 3), r2 = (r1 % 3) + 1, k = R.pick([2, 3, -2, 5]);
    var badList = [
      ['Multiply $R_{' + r1 + '}$ by $0$', 'Multiplying by $0$ turns that row into all zeros'],
      ['Replace $R_{' + r1 + '}$ with $R_{' + r1 + '} - R_{' + r1 + '}$', 'Subtracting a row from itself turns it into all zeros'],
      ['Replace $R_{' + r1 + '}$ with $R_{' + r2 + '}$', 'Copying another row over $R_{' + r1 + '}$ erases the equation that was there']
    ], bp = R.pick(badList), bad = bp[0];
    var fine = R.shuffle([
      'Swap $R_{' + r1 + '}$ and $R_{' + r2 + '}$',
      'Multiply $R_{' + r2 + '}$ by $' + T.frac(-1, R.pick([2, 3, 5])) + '$',
      'Replace $R_{' + r2 + '}$ with $R_{' + r2 + '}' + T.coef(k, 'R_{' + r1 + '}', false) + '$',
      'Replace $R_{' + r1 + '}$ with $R_{' + r1 + '} + R_{' + r1 + '}$',
      'Multiply $R_{' + r1 + '}$ by $' + k + '$'
    ]).slice(0, 3);
    return test({
      q: 'A system has an augmented matrix with three rows. Which operation could <b>change the solution set</b>?',
      a: { t: 'mc', choices: [bad].concat(fine), v: 0 },
      steps: ['The three legal row operations are: swap two rows, multiply a row by a <b>nonzero</b> number, and add a multiple of one row to a <b>different</b> row. Each can be undone, so no solution is gained or lost.',
        bp[1] + '. That throws away one equation, and it cannot be undone, so new solutions can appear.',
        'Adding a row to itself is just multiplying it by $2$, which is allowed.'],
      hint: 'A safe operation can always be undone. Which one destroys information?'
    }, { kind: 'legal' });
  });

  // ---------------------------------------------------------------- la.echelon-form
  function isEchelon(A) {
    var last = -1, zeroSeen = false;
    for (var i = 0; i < A.length; i++) {
      var lead = -1; for (var j = 0; j < A[i].length; j++) if (!q(A[i][j]).isZero()) { lead = j; break; }
      if (lead < 0) { zeroSeen = true; continue; }
      if (zeroSeen || lead <= last) return false;
      last = lead;
    }
    return true;
  }
  G('la.echelon-form', function (R, ctx) {
    var kind = by(ctx, R.pick(['solve2', 'solve2', 'is']), R.pick(['solve3', 'solve3', 'is']), R.pick(['solve3', 'solve3swap', 'is']));
    if (kind === 'is') {
      var m = 3, n = 4, piv = R.pick([[0, 1, 2], [0, 1, 3], [0, 2, 3], [0, 1], [1, 2]]), E = zeros(m, n);
      piv.forEach(function (pc, i) { E[i][pc] = q(R.nz(-5, 5)); for (var j = pc + 1; j < n; j++) E[i][j] = q(R.int(-5, 5)); });
      var good = R.coin(), why;
      if (!good) {
        var flaw = R.int(0, 2);
        if (flaw === 0) { var i0 = R.int(1, piv.length - 1); var cpiv = piv[i0 - 1]; E[i0][cpiv] = q(R.nz(-4, 4)); why = 'Row ' + (i0 + 1) + ' has a nonzero entry directly below the pivot of row ' + i0 + '.'; }
        else if (flaw === 1 && piv.length < 3) { E.unshift(E.pop()); why = 'A row of zeros sits above a nonzero row.'; }
        else { var t2 = E[0]; E[0] = E[1]; E[1] = t2; why = 'The pivot of row 2 is not to the right of the pivot of row 1.'; }
        if (isEchelon(E)) good = true;
      }
      var steps = ['Echelon form needs: (1) any zero rows at the bottom, and (2) each pivot (first nonzero entry of a row) strictly to the right of the pivot in the row above, so everything below a pivot is $0$.'];
      steps.push(good ? 'Here every pivot is to the right of the one above it and zero rows (if any) are at the bottom, so <b>yes</b>, it is in echelon form.' : why + ' So it is <b>not</b> in echelon form.');
      return test({
        q: 'True or false: this matrix is in echelon form. $$' + tex(E) + '$$',
        a: aTF(good), steps: steps,
        hint: 'Find the first nonzero entry in each row. Do they step down and to the right?'
      }, { kind: 'is', M: E, good: good });
    }
    var n2 = kind === 'solve2' ? 2 : 3, names = n2 === 2 ? ['x', 'y'] : ['x', 'y', 'z'], A, x, b, tries = 0;
    do {
      var L = unitLower(R, n2, -3, 3), Uu = zeros(n2, n2);
      for (var i = 0; i < n2; i++) { Uu[i][i] = q(ctx.level >= 2 && R.chance(0.35) ? R.pick([2, -2, 3]) : R.pick([1, -1, 1])); for (var j = i + 1; j < n2; j++) Uu[i][j] = q(R.int(-3, 3)); }
      if (kind === 'solve3swap') L[1][0] = q(0);
      A = mm(L, Uu);
      if (kind === 'solve3swap') { var tt = A[0]; A[0] = A[1]; A[1] = tt; }
      x = randV(R, n2, -4, 5); b = mv(A, x);
    } while ((maxAbs(A) > 9 || maxAbs(b) > 30 || isTrivialM(A) || A.some(isZeroV) || (L[1][0].isZero() && kind !== 'solve3swap') || isZeroV(x)) && ++tries < 50);
    var Aug = A.map(function (r, k) { return r.concat([b[k]]); });
    var E2 = elim(Aug, { mode: 'echelon', ncoef: n2 });
    var steps2 = ['Write the augmented matrix: $' + T.aug(Aug) + '$'].concat(stepTexts(E2, 1, 'Clear below the pivot. '));
    var X = E2.M, xv = backSub(X, n2);
    for (var k = n2 - 1; k >= 0; k--) {
      var known = []; for (var jj = k + 1; jj < n2; jj++) if (!X[k][jj].isZero()) known.push('$' + names[jj] + ' = ' + N(xv[jj]) + '$');
      steps2.push('Back-substitute in row ' + (k + 1) + ': $' + eqnTex(X[k].slice(0, n2), names, X[k][n2]) + '$' + (known.length ? ' with ' + lst(known) : '') + ' gives $' + names[k] + ' = ' + N(xv[k]) + '$.');
    }
    steps2.push(checkLine(A, b, xv, names, n2 - 1));
    return test({
      q: 'Solve by reducing the augmented matrix to echelon form and back-substituting. $$' + systemTex(A, b, names) + '$$ Give $(' + names.join(', ') + ')$.',
      a: aV(xv, names), steps: steps2,
      hint: 'Use row 1 to clear the first column below it' + (kind === 'solve3swap' ? ' (swap rows first if the top-left entry is $0$)' : '') + ', then row 2 to clear below its pivot. Back-substitute from the bottom.'
    }, { kind: 'solve', A: A, b: b, x: xv });
  });

  // ---------------------------------------------------------------- la.rref
  function isRref(A) {
    if (!isEchelon(A)) return false;
    for (var i = 0; i < A.length; i++) {
      var lead = -1; for (var j = 0; j < A[i].length; j++) if (!q(A[i][j]).isZero()) { lead = j; break; }
      if (lead < 0) continue;
      if (!q(A[i][lead]).eq(1)) return false;
      for (var k = 0; k < A.length; k++) if (k !== i && !q(A[k][lead]).isZero()) return false;
    }
    return true;
  }
  G('la.rref', function (R, ctx) {
    var kind = by(ctx, R.pick(['find', 'find', 'is']), R.pick(['find', 'find', 'is']), 'find');
    if (kind === 'is') {
      var piv = R.pick([[0, 1, 2], [0, 1, 3], [0, 2, 3], [0, 1], [0, 2]]), E = randRref(R, 3, 4, piv, -5, 5), good = R.coin(), why = '';
      if (!good) {
        var f = R.int(0, 1);
        if (f === 0) { var i0 = R.int(0, piv.length - 1); var fk = R.pick([2, -1, 3]); E[i0] = E[i0].map(function (x) { return x.mul(fk); }); why = 'The pivot in row ' + (i0 + 1) + ' is not $1$.'; }
        else { var i1 = R.int(1, piv.length - 1); E[0][piv[i1]] = q(R.nz(-4, 4)); why = 'Column ' + (piv[i1] + 1) + ' has a pivot in row ' + (i1 + 1) + ', but the entry above it is not $0$.'; }
      }
      return test({
        q: 'True or false: this matrix is in <b>reduced</b> row echelon form. $$' + tex(E) + '$$',
        a: aTF(good),
        steps: ['Reduced echelon form needs echelon form, every pivot equal to $1$, and every other entry in a pivot column equal to $0$ (above as well as below).',
          good ? 'All of these hold, so <b>true</b>.' : why + ' So <b>false</b>.'],
        hint: 'Look at each pivot column: a single $1$ and zeros everywhere else?'
      }, { kind: 'is', M: E, good: good });
    }
    var m = by(ctx, 2, 3, 3), n = by(ctx, 3, R.pick([3, 4]), R.pick([4, 5])), piv2;
    if (m === 2) piv2 = R.pick([[0, 1], [0, 1], [0, 2]]);
    else if (n === 3) piv2 = [0, 1, 2];
    else if (n === 4) piv2 = R.pick(ctx.level >= 3 ? [[0, 1, 3], [0, 2, 3], [0, 1, 2]] : [[0, 1, 2], [0, 1, 3]]);
    else piv2 = R.pick([[0, 1, 3], [0, 2, 4], [0, 1, 4], [0, 2, 3]]);
    var Rr = randRref(R, m, n, piv2, -4, 4), A = null, t = 0;
    while (!A && t++ < 5) A = niceFromRref(R, Rr, { scale: ctx.level >= 2, max: by(ctx, 9, 12, 14) });
    if (!A) { Rr = randRref(R, 2, 3, [0, 1], -3, 3); A = mm(qm([[1, 0], [2, 1]]), Rr); }
    var E2 = elim(A, { mode: 'rref' });
    var steps = stepTexts(E2, 0);
    steps.push('Every pivot is $1$ with zeros above and below it, so this is the reduced echelon form' + (E2.pivots.length < A[0].length ? ' (pivot columns: ' + lst(E2.pivots.map(function (c) { return String(c + 1); })) + ')' : '') + '.');
    return test({
      q: 'Find the reduced row echelon form of $$' + tex(A) + '$$',
      a: aM(E2.M), steps: steps,
      hint: 'Work column by column: make the pivot $1$, then clear every other entry in that column, above and below.'
    }, { kind: 'find', A: A, R: E2.M });
  });

  // ---------------------------------------------------------------- la.parametric-solutions
  function linPlain(terms) { // [[Q, 'name' or '']] -> "-5-5*t", "t", "3/2*s+4"
    var out = '';
    terms.forEach(function (t) {
      var c = q(t[0]); if (c.isZero()) return;
      var a = c.abs(), body = t[1] ? (a.eq(1) ? t[1] : a.toPlain() + '*' + t[1]) : a.toPlain();
      out += (c.sign() < 0 ? '-' : out ? '+' : '') + body;
    });
    return out || '0';
  }
  function paramSolution(Rm, nv, freeNames) { // Rm: RREF augmented (consistent). returns {exprs (plain), tex, p, dirs}
    var piv = pivotsOf(Rm, nv), free = []; for (var j = 0; j < nv; j++) if (piv.indexOf(j) < 0) free.push(j);
    var p = new Array(nv).fill(q(0)), dirs = free.map(function () { return new Array(nv).fill(q(0)); });
    free.forEach(function (fj, k) { dirs[k][fj] = q(1); });
    piv.forEach(function (pc, i) {
      p[pc] = Rm[i][nv];
      free.forEach(function (fj, k) { dirs[k][pc] = Rm[i][fj].neg(); });
    });
    var exprs = [], texs = [];
    for (j = 0; j < nv; j++) {
      var terms = [[p[j], '']]; free.forEach(function (fj, k) { terms.push([dirs[k][j], freeNames[k]]); });
      var nonzero = terms.filter(function (t) { return !t[0].isZero(); });
      texs.push(nonzero.length ? T.terms(nonzero.map(function (t) { return [t[0], t[1]]; })) : '0');
      exprs.push(linPlain(nonzero));
    }
    return { exprs: exprs, texs: texs, p: p, dirs: dirs, free: free, piv: piv };
  }
  G('la.parametric-solutions', function (R, ctx) {
    var kind = by(ctx, R.pick(['general', 'general', 'which']), R.pick(['general', 'direction', 'which']), R.pick(['general2', 'fromsys', 'direction']));
    var nv = kind === 'general2' || (kind === 'fromsys' && R.coin()) ? 4 : 3, m = nv === 4 ? (kind === 'general2' ? 2 : 3) : 2, piv;
    if (nv === 3) piv = R.pick([[0, 1], [0, 2], [0, 1], [1, 2]]);
    else piv = m === 2 ? R.pick([[0, 1], [0, 2], [0, 3]]) : R.pick([[0, 1, 3], [0, 2, 3], [0, 1, 2]]);
    var Rc = randRref(R, m, nv, piv, -5, 5), rhs = randV(R, m, -6, 8);
    var Raug = Rc.map(function (r, i) { return r.concat([rhs[i]]); });
    var free = []; for (var j = 0; j < nv; j++) if (piv.indexOf(j) < 0) free.push(j);
    var fN = free.length === 1 ? ['t'] : ['s', 't'], names = xs(nv);
    var S = paramSolution(Raug, nv, fN);
    var sys = null, Ashow = Raug;
    if (kind === 'fromsys') { var A0 = null, tt = 0; while (!A0 && tt++ < 6) A0 = niceFromRref(R, Raug, { ncoef: nv, max: 12 }); if (A0) { Ashow = A0; sys = true; } }
    var stepsP = [];
    if (sys) { var E = elim(Ashow, { mode: 'rref', ncoef: nv }); stepsP.push('Row reduce first.'); stepsP = stepsP.concat(stepTexts(E, 1)); }
    stepsP.push('Pivot columns: ' + lst(S.piv.map(function (c) { return '$' + names[c] + '$'; })) + ' are basic variables. Free: ' + lst(free.map(function (c, k) { return '$' + names[c] + ' = ' + fN[k] + '$'; })) + ' (any value at all).');
    S.piv.forEach(function (pc, i) {
      var row = Raug[i];
      var hasFree = free.some(function (fj) { return !row[fj].isZero(); });
      stepsP.push('Row ' + (i + 1) + ': $' + eqnTex(row.slice(0, nv), names, row[nv]) + '$' + (hasFree ? ', so $' + names[pc] + ' = ' + S.texs[pc] + '$.' : '. This value is fixed.'));
    });
    stepsP.push('All solutions: $(' + names.join(', ') + ') = (' + S.texs.join(', ') + ')$.');
    var qtxt = sys ? 'Solve the system with augmented matrix $$' + T.aug(Ashow) + '$$ ' : 'This augmented matrix is in reduced echelon form: $$' + T.aug(Raug) + '$$ ';
    var lab = names.map(function (n) { return n; });
    if (kind === 'which') {
      var good = '$' + texr(S.texs.map(function (s) { return s; })) + '$ for every real $' + fN[0] + '$';
      var zeroSol = '$' + texr(S.p) + '$ only (set the free variable to $0$)';
      var wrongDir = S.dirs[0].map(function (x, i) { return i === free[0] ? x : x.neg(); });
      var wrongTex = S.p.map(function (pp, i) { var tl = [[pp, ''], [wrongDir[i], fN[0]]].filter(function (t) { return !t[0].isZero(); }); return tl.length ? T.terms(tl) : '0'; });
      var wrong2 = '$' + texr(wrongTex) + '$ for every real $' + fN[0] + '$';
      var ch = uniqStr([good, zeroSol, wrong2, 'No solution, because there is a free variable']);
      return test({
        q: qtxt + 'The variables are $' + names.join(', ') + '$. Which describes <b>all</b> the solutions?',
        a: { t: 'mc', choices: ch, v: 0 }, steps: stepsP.concat(['Setting $' + fN[0] + ' = 0$ gives just one of the infinitely many solutions.']),
        hint: 'Solve each pivot row for its basic variable, keeping the free variable as a letter.'
      }, { kind: 'which', Raug: Raug, S: S });
    }
    if (kind === 'direction') {
      return test({
        q: qtxt + 'Writing the solutions as $\\mathbf{x} = \\mathbf{p} + t\\mathbf{v}$ with $' + names[free[0]] + ' = t$, find $\\mathbf{v}$. Give it as $(' + names.join(', ') + ')$.',
        a: aV(S.dirs[0], names), steps: stepsP.concat(['Collect the coefficients of $t$: $\\mathbf{v} = ' + texr(S.dirs[0]) + '$, and $\\mathbf{p} = ' + texr(S.p) + '$.']),
        hint: 'Write each variable as a constant plus a multiple of $t$. The multiples of $t$ make up $\\mathbf{v}$.'
      }, { kind: 'direction', Raug: Raug, v: S.dirs[0], p: S.p, free: free });
    }
    var spec = { t: 'tuple', v: S.exprs, labels: lab };
    return test({
      q: qtxt + 'The variables are $' + names.join(', ') + '$. Let ' + lst(free.map(function (c, k) { return '$' + names[c] + ' = ' + fN[k] + '$'; })) + ' and write every solution in terms of $' + fN.join('$ and $') + '$.',
      a: spec, steps: stepsP,
      hint: 'Each nonzero row has one basic variable. Move the free-variable terms to the right side.'
    }, { kind: 'general', Raug: Raug, S: S, A: Ashow, nv: nv, fN: fN, free: free });
  });

  // ---------------------------------------------------------------- la.existence-uniqueness
  G('la.existence-uniqueness', function (R, ctx) {
    var kind = by(ctx, R.pick(['classify', 'classify', 'h']), R.pick(['classify', 'h', 'shape']), R.pick(['h', 'shape', 'classify']));
    if (kind === 'classify') {
      var which = R.int(0, 2), nv = R.pick([3, 3, 4]), m = 3, piv, E;
      if (which === 0) { piv = [0, 1, 2]; nv = 3; }
      else piv = nv === 3 ? R.pick([[0, 1], [0, 2]]) : R.pick([[0, 1, 2], [0, 1, 3], [0, 2, 3]]);
      E = zeros(m, nv + 1);
      piv.forEach(function (pc, i) { E[i][pc] = q(R.nz(-4, 4)); for (var j = pc + 1; j <= nv; j++) E[i][j] = q(R.int(-5, 5)); });
      if (which === 1) { var r = piv.length < m ? piv.length : m - 1; E[r] = zeros(1, nv + 1)[0]; E[r][nv] = q(R.nz(-6, 6)); }
      var zeroRow = piv.length < m && which !== 1;
      var steps = ['Look for a row $\\left[\\,0\\ \\cdots\\ 0 \\mid c\\,\\right]$ with $c \\neq 0$. It would say $0 = c$, which is impossible.'];
      if (which === 1) steps.push('Row ' + (piv.length < m ? piv.length + 1 : m) + ' says $0 = ' + N(E[piv.length < m ? piv.length : m - 1][nv]) + '$. So the system is inconsistent: <b>no solution</b>.');
      else {
        steps.push('No such row' + (zeroRow ? ' (a row of all zeros, including the constant, just says $0 = 0$: it is harmless)' : '') + ', so the system is consistent.');
        steps.push('Pivots are in column' + (piv.length > 1 ? 's ' : ' ') + lst(piv.map(function (c) { return String(c + 1); })) + ' of the ' + nv + ' variable columns. ' + (which === 0 ? 'Every variable column has a pivot, so there are no free variables: <b>exactly one solution</b>.' : 'At least one variable is free, so there are <b>infinitely many solutions</b>.'));
      }
      return test({
        q: 'An augmented matrix has been reduced to echelon form: $$' + T.aug(E) + '$$ How many solutions does the system have?',
        a: countMC(which), steps: steps,
        hint: 'First ask whether any row says $0 = c$ with $c \\neq 0$. Then count free variables.'
      }, { kind: 'classify', E: E, which: which, nv: nv });
    }
    if (kind === 'h') {
      var a = R.nz(-4, 4), b = R.int(-6, 6), c = R.nz(-3, 3), mode = R.int(0, 1);
      if (mode === 0) { // h on the right: consistent iff h = c b
        var d = R.nz(-5, 5);
        var Aug = [[q(1), q(a), q(b)], [q(c), q(c * a), 'h']];
        return test({
          q: 'For what value of $h$ is this system <b>consistent</b> (has at least one solution)? $$' + T.aug([[1, a, b], [c, c * a, 'h']]) + '$$',
          a: aN(q(c * b)),
          steps: ['Clear below the first pivot: $' + opAdd(1, q(-c), 0) + '$.',
            'Row 2 becomes $\\left[\\,0 \\quad 0 \\mid h' + T.signed(-c * b) + '\\,\\right]$, which says $0 = h' + T.signed(-c * b) + '$.',
            'That is possible only when $h = ' + N(c * b) + '$. Then row 2 is all zeros and the system has (infinitely many) solutions.'],
          hint: 'Eliminate the first column, then read what row 2 says.'
        }, { kind: 'hcons', a: a, b: b, c: c, h: c * b });
      }
      // h in the coefficient: no solution iff h = c a (with constants not matching)
      var d2 = R.intNot(-9, 9, c * b);
      return test({
        q: 'For what value of $h$ does this system have <b>no solution</b>? $$' + T.aug([[1, a, b], [c, 'h', d2]]) + '$$',
        a: aN(q(c * a)),
        steps: ['Clear below the first pivot: $' + opAdd(1, q(-c), 0) + '$.',
          'Row 2 becomes $\\left[\\,0 \\quad h' + T.signed(-c * a) + ' \\mid ' + N(d2 - c * b) + '\\,\\right]$.',
          'If $h' + T.signed(-c * a) + ' \\neq 0$ there is a pivot in column 2 and exactly one solution. If $h = ' + N(c * a) + '$, row 2 says $0 = ' + N(d2 - c * b) + '$, which is false.',
          'So there is no solution exactly when $h = ' + N(c * a) + '$.'],
        hint: 'After eliminating, the second row reads $(h - \\text{something})\\,y = \\text{number}$. When does that fail?'
      }, { kind: 'hnone', a: a, b: b, c: c, d: d2, h: c * a });
    }
    // shape reasoning from pivot counts
    var mm2 = R.pick([3, 4, 5]), nn = R.pick([3, 4, 5, 6]), rk = R.int(1, Math.min(mm2, nn));
    var everyB = rk === mm2, unique = rk === nn;
    var claims = [
      ['$A\\mathbf{x} = \\mathbf{b}$ has a solution for every $\\mathbf{b}$ in $\\mathbb{R}^{' + mm2 + '}$', everyB],
      ['Every consistent system $A\\mathbf{x} = \\mathbf{b}$ has exactly one solution', unique],
      ['Some system $A\\mathbf{x} = \\mathbf{b}$ has no solution', !everyB],
      ['Every consistent system $A\\mathbf{x} = \\mathbf{b}$ has infinitely many solutions', !unique]
    ];
    var c0 = R.int(0, 3), cl = claims[c0];
    return test({
      q: 'A coefficient matrix $A$ is $' + mm2 + ' \\times ' + nn + '$ and its echelon form has ' + U.words(rk) + ' pivot' + (rk > 1 ? 's' : '') + '. True or false: ' + cl[0] + '.',
      a: aTF(cl[1]),
      steps: ['There are ' + mm2 + ' rows and ' + nn + ' columns (variables), with ' + rk + ' pivot' + (rk > 1 ? 's' : '') + '.',
        everyB ? 'Every row has a pivot, so no row of the coefficient part is zero and a $0 = c$ row can never appear: every $\\mathbf{b}$ works.' : 'Only ' + rk + ' of the ' + mm2 + ' rows ' + (rk === 1 ? 'has a pivot' : 'have pivots') + ', so the echelon form has a zero row on the left; for some $\\mathbf{b}$ that row says $0 = c \\neq 0$.',
        unique ? 'Every column has a pivot, so there are no free variables: a consistent system has exactly one solution.' : (nn - rk) + ' column' + (nn - rk > 1 ? 's have' : ' has') + ' no pivot, so ' + (nn - rk > 1 ? 'there are free variables' : 'there is a free variable') + ': a consistent system has infinitely many solutions.',
        'So the statement is <b>' + (cl[1] ? 'true' : 'false') + '</b>.'],
      hint: 'Pivots in every row means a solution for every $\\mathbf{b}$; pivots in every column means no free variables.'
    }, { kind: 'shape' });
  });


  // ================================================================ Unit 2: Vectors and Matrix Equations

  function vecNames(k, s) { var a = []; for (var i = 1; i <= k; i++) a.push('\\mathbf{' + (s || 'v') + '}_{' + i + '}'); return a; }
  function combTex(cs, vs) { // 2\begin{bmatrix}..\end{bmatrix} - \begin{bmatrix}..
    var out = '';
    cs.forEach(function (c, i) { c = q(c); if (c.isZero()) return; out += T.coef(c, texv(vs[i]), out === ''); });
    return out || '\\mathbf{0}';
  }
  function augOf(vs, b) { var A = cols(vs); return A.map(function (r, i) { return r.concat([b[i]]); }); }
  function indepSet(R, k, n, lo, hi) { // k independent integer vectors in R^n (k <= n)
    for (var t = 0; t < 80; t++) {
      var vs = []; for (var i = 0; i < k; i++) vs.push(randV(R, n, lo, hi));
      if (vs.some(isZeroV)) continue;
      if (rank(cols(vs)) === k) return vs;
    }
    var I = eye(n); return I.slice(0, k);
  }

  // ---------------------------------------------------------------- la.linear-combinations
  G('la.linear-combinations', function (R, ctx) {
    var kind = by(ctx, R.pick(['compute', 'compute', 'weights']), R.pick(['compute', 'weights', 'isin']), R.pick(['weights', 'isin', 'compute']));
    if (kind === 'compute') {
      var n = by(ctx, 2, R.pick([2, 3]), 3), k = by(ctx, 2, 2, 3), vs = [], cs = [];
      for (var i = 0; i < k; i++) { vs.push(randV(R, n, -5, 6)); cs.push(R.nz(-4, 4)); }
      if (vs.some(isZeroV)) vs[0][0] = q(R.nz(1, 4));
      var w = vs.reduce(function (s, v, i) { return vadd(s, vsc(cs[i], v)); }, zeros(1, n)[0]);
      var names = vecNames(k, 'v');
      var steps = ['Scale each vector: ' + cs.map(function (c, i) { return '$' + T.coef(c, names[i]) + ' = ' + texv(vsc(c, vs[i])) + '$'; }).join(', ') + '.',
        'Add entry by entry: $' + vs.map(function (v, i) { return texv(vsc(cs[i], v)); }).join(' + ') + ' = ' + texv(w) + '$.'];
      return test({
        q: 'Let ' + vs.map(function (v, i) { return '$' + names[i] + ' = ' + texv(v) + '$'; }).join(', ') + '. Compute $' + sumTex(cs, names) + '$.',
        a: aV(w), steps: steps,
        hint: 'Multiply each vector by its number, then add the matching entries.'
      }, { kind: 'compute', vs: vs, cs: cs });
    }
    var n2 = kind === 'isin' ? 3 : by(ctx, 2, R.pick([2, 3]), 3), vs2 = indepSet(R, 2, n2, -4, 5), c = [R.nz(-4, 4), R.nz(-4, 4)];
    var b = vadd(vsc(c[0], vs2[0]), vsc(c[1], vs2[1])), inside = true;
    if (kind === 'isin' && R.coin()) { var j = R.int(0, 2); b = b.slice(); b[j] = b[j].add(R.nz(-3, 3)); inside = rank(augOf(vs2, b)) === 2; }
    var E = elim(augOf(vs2, b), { mode: 'rref', ncoef: 2 }), nm = vecNames(2, 'a');
    var steps2 = ['The vector equation $x_{1}' + nm[0] + ' + x_{2}' + nm[1] + ' = \\mathbf{b}$ has augmented matrix $' + T.aug(augOf(vs2, b)) + '$.'].concat(stepTexts(E, 1));
    var intro = 'Let $' + nm[0] + ' = ' + texv(vs2[0]) + '$, $' + nm[1] + ' = ' + texv(vs2[1]) + '$ and $\\mathbf{b} = ' + texv(b) + '$.';
    if (kind === 'isin') {
      steps2.push(inside ? 'No row says $0 = c$ with $c \\neq 0$, so the system is consistent: $\\mathbf{b} = ' + T.coef(E.M[0][2], nm[0]) + T.coef(E.M[1][2], nm[1], false) + '$. <b>True</b>.' : 'The last row says $0 = ' + N(E.M[2][2]) + '$, so there are no weights: $\\mathbf{b}$ is <b>not</b> a linear combination. <b>False</b>.');
      return test({ q: intro + ' True or false: $\\mathbf{b}$ is a linear combination of $' + nm[0] + '$ and $' + nm[1] + '$.', a: aTF(inside), steps: steps2, hint: 'Row reduce $[\\,' + nm[0] + '\\ ' + nm[1] + ' \\mid \\mathbf{b}\\,]$ and look for a row $0 = c$.' }, { kind: 'isin', vs: vs2, b: b, inside: inside });
    }
    steps2.push('So $x_{1} = ' + N(c[0]) + '$ and $x_{2} = ' + N(c[1]) + '$: $\\mathbf{b} = ' + T.coef(c[0], nm[0]) + T.coef(c[1], nm[1], false) + '$.');
    return test({
      q: intro + ' Find weights $x_{1}$ and $x_{2}$ with $x_{1}' + nm[0] + ' + x_{2}' + nm[1] + ' = \\mathbf{b}$. Give $(x_{1}, x_{2})$.',
      a: aV(c, ['x_{1}', 'x_{2}']), steps: steps2,
      hint: 'Put $' + nm[0] + '$, $' + nm[1] + '$ and $\\mathbf{b}$ side by side as an augmented matrix and row reduce.'
    }, { kind: 'weights', vs: vs2, b: b, c: c });
  });

  // ---------------------------------------------------------------- la.span
  G('la.span', function (R, ctx) {
    var kind = by(ctx, R.pick(['inspan', 'describe', 'spanRn']), R.pick(['inspan', 'h', 'spanRn', 'describe']), R.pick(['h', 'spanRn', 'inspan']));
    if (kind === 'describe') {
      var t = R.int(0, 3), u = randV(R, 3, -4, 4), v, ans, why;
      if (isZeroV(u)) u[0] = q(2);
      if (t === 0) { v = vsc(R.pick([2, -1, 3, -2]), u); ans = 1; why = '$\\mathbf{v} = ' + N(v[0].div(u[0].isZero() ? 1 : u[0])) + '\\mathbf{u}$'; }
      var choices = ['A line through the origin', 'A plane through the origin', 'All of $\\mathbb{R}^{3}$', 'Just the origin'];
      if (t === 0) {
        var kf = null; for (var i = 0; i < 3; i++) if (!u[i].isZero()) { kf = v[i].div(u[i]); break; }
        return test({ q: 'Describe $\\operatorname{Span}\\{\\mathbf{u}, \\mathbf{v}\\}$ for $\\mathbf{u} = ' + texv(u) + '$ and $\\mathbf{v} = ' + texv(v) + '$.', a: { t: 'mc', choices: choices, v: 0, keep: true },
          steps: ['Compare the vectors: $\\mathbf{v} = ' + T.coef(kf, '\\mathbf{u}') + '$, so $\\mathbf{v}$ adds no new direction.', 'Every combination $c_{1}\\mathbf{u} + c_{2}\\mathbf{v} = (c_{1}' + T.coef(kf, 'c_{2}', false) + ')\\mathbf{u}$ is a multiple of $\\mathbf{u}$: a <b>line through the origin</b>.'],
          hint: 'Is one vector a multiple of the other?' }, { kind: 'describe', u: u, v: v, ans: 0 });
      }
      if (t === 3) {
        return test({ q: 'Describe $\\operatorname{Span}\\{\\mathbf{u}\\}$ for $\\mathbf{u} = ' + texv(u) + '$.', a: { t: 'mc', choices: choices, v: 0, keep: true },
          steps: ['The span of one vector is every multiple $c\\mathbf{u}$.', 'Since $\\mathbf{u} \\neq \\mathbf{0}$, the multiples fill a <b>line through the origin</b>.'], hint: 'What do all the multiples of one nonzero vector look like?' }, { kind: 'describe', u: u, ans: 0 });
      }
      var vs = indepSet(R, 2, 3, -4, 4);
      return test({ q: 'Describe $\\operatorname{Span}\\{\\mathbf{u}, \\mathbf{v}\\}$ for $\\mathbf{u} = ' + texv(vs[0]) + '$ and $\\mathbf{v} = ' + texv(vs[1]) + '$.', a: { t: 'mc', choices: choices, v: 1, keep: true },
        steps: ['Neither vector is a multiple of the other, so they point in two different directions.', 'All combinations $c_{1}\\mathbf{u} + c_{2}\\mathbf{v}$ fill a <b>plane through the origin</b>. Two vectors can never fill all of $\\mathbb{R}^{3}$: the matrix $[\\,\\mathbf{u}\\ \\mathbf{v}\\,]$ has at most 2 pivots, but $\\mathbb{R}^{3}$ would need 3.'],
        hint: 'Two vectors that are not multiples of each other span a flat surface through $\\mathbf{0}$.' }, { kind: 'describe', vs: vs, ans: 1 });
    }
    if (kind === 'inspan') {
      var vs2 = indepSet(R, 2, 3, -4, 5), c = [R.nz(-3, 3), R.nz(-3, 3)], b = vadd(vsc(c[0], vs2[0]), vsc(c[1], vs2[1])), inside = true;
      if (R.coin()) { b = b.slice(); b[R.int(0, 2)] = b[R.int(0, 2)].add(R.nz(-3, 3)); inside = rank(augOf(vs2, b)) === 2; }
      var E = elim(augOf(vs2, b), { mode: 'rref', ncoef: 2 });
      var st = ['$\\mathbf{b}$ is in the span exactly when $x_{1}\\mathbf{a}_{1} + x_{2}\\mathbf{a}_{2} = \\mathbf{b}$ has a solution. Row reduce $' + T.aug(augOf(vs2, b)) + '$.'].concat(stepTexts(E, 1));
      st.push(inside ? 'Consistent, so $\\mathbf{b}$ <b>is</b> in the span.' : 'The last row says $0 = ' + N(E.M[2][2]) + '$: inconsistent, so $\\mathbf{b}$ is <b>not</b> in the span.');
      return test({ q: 'Let $\\mathbf{a}_{1} = ' + texv(vs2[0]) + '$, $\\mathbf{a}_{2} = ' + texv(vs2[1]) + '$ and $\\mathbf{b} = ' + texv(b) + '$. True or false: $\\mathbf{b}$ is in $\\operatorname{Span}\\{\\mathbf{a}_{1}, \\mathbf{a}_{2}\\}$.',
        a: aTF(inside), steps: st, hint: 'Being in the span means some weights work. Row reduce the augmented matrix.' }, { kind: 'inspan', vs: vs2, b: b, inside: inside });
    }
    if (kind === 'h') {
      var vs3, top;
      do { vs3 = indepSet(R, 2, 3, -4, 5); top = vs3[0][0].mul(vs3[1][1]).sub(vs3[0][1].mul(vs3[1][0])); } while (!top.abs().eq(1) && !top.abs().eq(2) || top.isZero());
      var c3 = [R.nz(-3, 3), R.nz(-3, 3)], full = vadd(vsc(c3[0], vs3[0]), vsc(c3[1], vs3[1])), h = full[2];
      var bshow = [full[0], full[1], 'h'];
      return test({
        q: 'For what value of $h$ is $\\mathbf{b} = ' + texv(bshow) + '$ in $\\operatorname{Span}\\{\\mathbf{a}_{1}, \\mathbf{a}_{2}\\}$, where $\\mathbf{a}_{1} = ' + texv(vs3[0]) + '$ and $\\mathbf{a}_{2} = ' + texv(vs3[1]) + '$?',
        a: aN(h),
        steps: ['We need $x_{1}\\mathbf{a}_{1} + x_{2}\\mathbf{a}_{2} = \\mathbf{b}$. The first two rows do not involve $h$: $$' + systemTex([[vs3[0][0], vs3[1][0]], [vs3[0][1], vs3[1][1]]], [full[0], full[1]], ['x_{1}', 'x_{2}']) + '$$',
          'Solving them gives $x_{1} = ' + N(c3[0]) + '$ and $x_{2} = ' + N(c3[1]) + '$ (check: they satisfy both rows).',
          'The third row must hold too: $h = ' + pp(c3[0], vs3[0][2]) + ' + ' + pp(c3[1], vs3[1][2]) + ' = ' + N(h) + '$.'],
        hint: 'Solve the two equations without $h$ first, then see what the third equation forces $h$ to be.'
      }, { kind: 'h', vs: vs3, b2: [full[0], full[1]], h: h });
    }
    // do the vectors span R^n?
    var n = R.pick([2, 3, 3]), k = n === 2 ? R.pick([1, 2, 3]) : R.pick([2, 3, 3, 4]), vs4 = [];
    var full4 = R.coin();
    if (k < n) { for (var i4 = 0; i4 < k; i4++) vs4.push(randV(R, n, -4, 5)); }
    else if (full4) { vs4 = indepSet(R, n, n, -3, 4); while (vs4.length < k) vs4.push(randV(R, n, -3, 4)); }
    else { var base = indepSet(R, n - 1, n, -3, 4); vs4 = base.slice(); while (vs4.length < k) vs4.push(vadd(vsc(R.nz(-2, 2), base[0]), vsc(R.int(-2, 2), base[base.length - 1]))); vs4 = R.shuffle(vs4); }
    if (vs4.some(isZeroV)) vs4 = vs4.map(function (v) { return isZeroV(v) ? vadd(v, eye(n)[0]) : v; });
    var rk = rank(cols(vs4)), spans = rk === n;
    var st4;
    if (k < n) st4 = ['The matrix with these ' + k + ' vectors as columns is $' + n + ' \\times ' + k + '$, so it has at most ' + k + ' pivot' + (k > 1 ? 's' : '') + '.', 'Spanning $\\mathbb{R}^{' + n + '}$ needs a pivot in every one of the ' + n + ' rows. Not enough vectors: <b>false</b>.'];
    else { var E4 = elim(cols(vs4), { mode: 'echelon' }); st4 = ['Put the vectors in the columns of a matrix and row reduce.'].concat(stepTexts(E4, 0)); st4.push('There ' + (rk === 1 ? 'is 1 pivot' : 'are ' + rk + ' pivots') + ' for ' + n + ' rows. ' + (spans ? 'Every row has a pivot, so the columns span $\\mathbb{R}^{' + n + '}$: <b>true</b>.' : 'Some row has no pivot, so for some $\\mathbf{b}$ the system is inconsistent: <b>false</b>.')); }
    return test({
      q: 'True or false: the vectors ' + vs4.map(function (v) { return '$' + texv(v) + '$'; }).join(', ') + ' span $\\mathbb{R}^{' + n + '}$.',
      a: aTF(spans), steps: st4,
      hint: 'Row reduce the matrix whose columns are the vectors. Is there a pivot in every row?'
    }, { kind: 'spanRn', vs: vs4, n: n, spans: spans });
  });

  // ---------------------------------------------------------------- la.matrix-equation
  G('la.matrix-equation', function (R, ctx) {
    var kind = by(ctx, R.pick(['compute', 'compute', 'size']), R.pick(['compute', 'size', 'weights']), R.pick(['compute', 'weights', 'size']));
    if (kind === 'compute') {
      var m = R.pick([2, 3]), n = by(ctx, R.pick([2, 3]), R.pick([2, 3]), 3), A = randM(R, m, n, -4, 5), x = randV(R, n, -3, 4, true);
      var Ax = mv(A, x), cl = [];
      for (var j = 0; j < n; j++) cl.push(col(A, j));
      var steps = ['$A\\mathbf{x}$ is the combination of the columns of $A$ with the entries of $\\mathbf{x}$ as weights: $$A\\mathbf{x} = ' + combTex(x, cl) + '$$',
        'Scale and add: $' + cl.map(function (c, i) { return texv(vsc(x[i], c)); }).join(' + ') + ' = ' + texv(Ax) + '$.',
        'Row check: entry 1 is row 1 of $A$ dotted with $\\mathbf{x}$: $' + prods(A[0], x) + ' = ' + N(Ax[0]) + '$.'];
      return test({ q: 'Compute $A\\mathbf{x}$ for $A = ' + tex(A) + '$ and $\\mathbf{x} = ' + texv(x) + '$.', a: aV(Ax), steps: steps,
        hint: 'Use the entries of $\\mathbf{x}$ as weights on the columns of $A$.' }, { kind: 'compute', A: A, x: x });
    }
    if (kind === 'size') {
      var m2 = R.int(2, 5), n2 = R.intNot(2, 6, m2);
      return test({
        q: '$A$ is a $' + m2 + ' \\times ' + n2 + '$ matrix. For $A\\mathbf{x}$ to be defined, how many entries must $\\mathbf{x}$ have? How many entries does $A\\mathbf{x}$ have?',
        a: { t: 'multi', parts: [{ label: 'Entries of $\\mathbf{x}$', a: aN(q(n2)) }, { label: 'Entries of $A\\mathbf{x}$', a: aN(q(m2)) }] },
        steps: ['$A\\mathbf{x}$ uses one weight per <b>column</b> of $A$. $A$ has ' + n2 + ' columns, so $\\mathbf{x}$ needs ' + n2 + ' entries.',
          'The result is a combination of columns, and each column has ' + m2 + ' entries (one per row), so $A\\mathbf{x}$ is in $\\mathbb{R}^{' + m2 + '}$.'],
        hint: 'Weights go with columns; the answer lives where the columns live.'
      }, { kind: 'size', m: m2, n: n2 });
    }
    var n3 = R.pick([2, 3, 3]), m3 = R.pick([2, 3]), w = randV(R, n3, -4, 4, true), names = vecNames(n3, 'a');
    return test({
      q: 'The columns of $A$ are $' + names.join(', ') + '$. Find $\\mathbf{x}$ so that $A\\mathbf{x} = ' + sumTex(w, names) + '$.',
      a: aV(w), steps: ['$A\\mathbf{x} = x_{1}' + names[0] + ' + \\cdots$: the entries of $\\mathbf{x}$ are the weights on the columns, in order.', 'Read off the weights: $\\mathbf{x} = ' + texv(w) + '$.'],
      hint: 'Entry $i$ of $\\mathbf{x}$ multiplies column $i$ of $A$.'
    }, { kind: 'weights', w: w });
  });

  // ---------------------------------------------------------------- la.homogeneous-systems
  G('la.homogeneous-systems', function (R, ctx) {
    var kind = by(ctx, R.pick(['solve', 'solve', 'nontrivial']), R.pick(['solve', 'nontrivial', 'shift']), R.pick(['solve2', 'solve', 'shift']));
    if (kind === 'nontrivial') {
      var t = R.int(0, 2), A, ans, st;
      if (t === 0) { var m = R.int(2, 3), n = m + R.int(1, 2); A = randM(R, m, n, -5, 5); ans = true; st = ['$A$ has ' + n + ' columns but only ' + m + ' rows, so at most ' + m + ' pivots.', 'At least one column has no pivot, so there is a free variable and a nontrivial solution: <b>true</b>.']; }
      else { var nn = 3; A = t === 1 ? unimod(R, 3, 7) : (function () { var B = randM(R, 2, 3, -4, 5), cc = [R.nz(-2, 2), R.nz(-2, 2)]; while (rank(B) < 2) B = randM(R, 2, 3, -4, 5); return B.concat([vadd(vsc(cc[0], B[0]), vsc(cc[1], B[1]))]); })(); ans = t === 2;
        var E = elim(A, { mode: 'echelon' }); st = ['Row reduce $A$.'].concat(stepTexts(E, 0)); st.push(ans ? 'Only ' + E.pivots.length + ' pivots for 3 columns: there is a free variable, so a <b>nontrivial</b> solution exists: <b>true</b>.' : 'A pivot in every column: no free variables, so only $\\mathbf{x} = \\mathbf{0}$: <b>false</b>.'); }
      return test({ q: 'True or false: $A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution (one other than $\\mathbf{x} = \\mathbf{0}$), where $A = ' + tex(A) + '$.', a: aTF(ans), steps: st,
        hint: 'A nontrivial solution exists exactly when there is a free variable.' }, { kind: 'nontrivial', A: A, ans: ans });
    }
    var nv = kind === 'solve2' ? 4 : 3, m4 = kind === 'solve2' ? 2 : R.pick([2, 3]);
    var piv = nv === 4 ? R.pick([[0, 1], [0, 2]]) : R.pick([[0, 1], [0, 2], [0, 1]]);
    var Rr = randRref(R, m4, nv, piv, -4, 4), A2 = null, tries = 0;
    while (!A2 && tries++ < 6) A2 = niceFromRref(R, Rr, { max: 10, allowZeroRow: false });
    if (!A2) A2 = Rr;
    var names = xs(nv), free = []; for (var j = 0; j < nv; j++) if (piv.indexOf(j) < 0) free.push(j);
    var fN = free.length === 1 ? ['t'] : ['s', 't'], Raug = Rr.map(function (r) { return r.concat([q(0)]); }), S = paramSolution(Raug, nv, fN);
    var E2 = elim(A2, { mode: 'rref' }), steps = ['Row reduce $A$ (the zero column of the augmented matrix never changes, so leave it off).'].concat(stepTexts(E2, 0));
    steps.push('Free: ' + lst(free.map(function (c, k) { return '$' + names[c] + ' = ' + fN[k] + '$'; })) + '. ' + S.piv.map(function (pc) { return '$' + names[pc] + ' = ' + S.texs[pc] + '$'; }).join(', ') + '.');
    if (kind === 'shift') {
      var p0 = randV(R, nv, -3, 3), tp = 0;
      while ((isZeroV(p0) || rank(cols([p0, S.dirs[0]])) < 2) && tp++ < 30) p0 = randV(R, nv, -3, 3);
      var bb = mv(A2, p0);
      var good = '$' + texv(p0) + ' + t' + texv(S.dirs[0]) + '$ for all real $t$', wr = ['$t' + texv(S.dirs[0]) + '$ for all real $t$', '$' + texv(p0) + '$ only', '$' + texv(S.dirs[0]) + ' + t' + texv(p0) + '$ for all real $t$'];
      return test({ q: 'The solutions of $A\\mathbf{x} = \\mathbf{0}$ are all multiples $t\\mathbf{v}$ with $\\mathbf{v} = ' + texv(S.dirs[0]) + '$, and $\\mathbf{p} = ' + texv(p0) + '$ is one solution of $A\\mathbf{x} = \\mathbf{b}$. Which describes <b>all</b> solutions of $A\\mathbf{x} = \\mathbf{b}$?',
        a: { t: 'mc', choices: [good].concat(wr), v: 0 },
        steps: ['If $A\\mathbf{p} = \\mathbf{b}$ and $A\\mathbf{v} = \\mathbf{0}$, then $A(\\mathbf{p} + t\\mathbf{v}) = \\mathbf{b} + t\\mathbf{0} = \\mathbf{b}$, so every $\\mathbf{p} + t\\mathbf{v}$ is a solution.', 'Conversely, if $A\\mathbf{y} = \\mathbf{b}$, then $A(\\mathbf{y} - \\mathbf{p}) = \\mathbf{0}$, so $\\mathbf{y} - \\mathbf{p} = t\\mathbf{v}$ for some $t$.', 'So the solution set is the line $\\mathbf{p} + t\\mathbf{v}$: the homogeneous solutions shifted by $\\mathbf{p}$.'],
        hint: 'What is $A(\\mathbf{p} + t\\mathbf{v})$?' }, { kind: 'shift', A: A2, p: p0, v: S.dirs[0], b: bb });
    }
    if (free.length === 1) {
      steps.push('So $\\mathbf{x} = t' + texv(S.dirs[0]) + '$.');
      return test({ q: 'Solve $A\\mathbf{x} = \\mathbf{0}$ for $A = ' + tex(A2) + '$. The solutions are $\\mathbf{x} = t\\mathbf{v}$ with $' + names[free[0]] + ' = t$. Find $\\mathbf{v}$.',
        a: aV(S.dirs[0]), steps: steps, hint: 'Row reduce, set the free variable to $t$, and solve for the others. $\\mathbf{v}$ is the vector of coefficients of $t$.' }, { kind: 'solve', A: A2, v: S.dirs[0], free: free });
    }
    steps.push('So $\\mathbf{x} = s' + texv(S.dirs[0]) + ' + t' + texv(S.dirs[1]) + '$.');
    return test({ q: 'Solve $A\\mathbf{x} = \\mathbf{0}$ for $A = ' + tex(A2) + '$. With $' + names[free[0]] + ' = s$ and $' + names[free[1]] + ' = t$ the solutions are $\\mathbf{x} = s\\mathbf{u} + t\\mathbf{v}$. Find $\\mathbf{u}$ and $\\mathbf{v}$.',
      a: { t: 'multi', parts: [{ label: '$\\mathbf{u} =$', a: aV(S.dirs[0]) }, { label: '$\\mathbf{v} =$', a: aV(S.dirs[1]) }] }, steps: steps,
      hint: 'Write every variable in terms of $s$ and $t$, then split the vector into an $s$ part and a $t$ part.' }, { kind: 'solve2', A: A2, us: S.dirs, free: free });
  });

  // ---------------------------------------------------------------- la.linear-independence
  G('la.linear-independence', function (R, ctx) {
    var kind = by(ctx, R.pick(['tf', 'tf', 'relation']), R.pick(['tf', 'h', 'relation']), R.pick(['tf', 'h', 'relation']));
    if (kind === 'tf') {
      var t = by(ctx, R.int(0, 2), R.int(0, 3), R.int(0, 3)), vs, ans, n = 3, st;
      if (t === 3) { // more vectors than entries
        n = R.pick([2, 3]); vs = []; for (var i = 0; i < n + 1; i++) vs.push(randV(R, n, -4, 5)); ans = false;
        st = ['There are ' + (n + 1) + ' vectors in $\\mathbb{R}^{' + n + '}$. The matrix with them as columns is $' + n + ' \\times ' + (n + 1) + '$: at most ' + n + ' pivots for ' + (n + 1) + ' columns.', 'So some column has no pivot, and the set is <b>dependent</b>: false. (More vectors than entries always means dependent.)'];
      } else {
        if (t === 0) { vs = indepSet(R, 3, 3, -3, 4); ans = true; }
        else { var b2 = indepSet(R, 2, 3, -3, 4), cc = [R.nz(-2, 2), R.nz(-2, 2)]; vs = R.shuffle([b2[0], b2[1], vadd(vsc(cc[0], b2[0]), vsc(cc[1], b2[1]))]); ans = rank(cols(vs)) === 3; }
        var E = elim(cols(vs), { mode: 'echelon' });
        st = ['Put the vectors in the columns of $A$ and look for free variables in $A\\mathbf{c} = \\mathbf{0}$.'].concat(stepTexts(E, 0));
        st.push(ans ? 'A pivot in every column: only the trivial combination gives $\\mathbf{0}$, so the set is <b>independent</b>: true.' : 'Only ' + E.pivots.length + ' pivots for 3 columns, so a free variable gives a nontrivial combination equal to $\\mathbf{0}$: <b>dependent</b>, false.' + (t >= 1 ? ' Notice that no two of these vectors are multiples of each other; checking pairs is not enough.' : ''));
      }
      return test({ q: 'True or false: the vectors ' + vs.map(function (v) { return '$' + texv(v) + '$'; }).join(', ') + ' are linearly independent.', a: aTF(ans), steps: st,
        hint: 'Make them the columns of a matrix and row reduce. Independent means a pivot in every column.' }, { kind: 'tf', vs: vs, ans: ans });
    }
    var top, b3;
    do { b3 = indepSet(R, 2, 3, -3, 4); top = b3[0][0].mul(b3[1][1]).sub(b3[0][1].mul(b3[1][0])); } while (!(top.abs().eq(1) || top.abs().eq(2)));
    var c3 = [R.nz(-3, 3), R.nz(-3, 3)], v3 = vadd(vsc(c3[0], b3[0]), vsc(c3[1], b3[1]));
    if (kind === 'h') {
      var v3s = [v3[0], v3[1], 'h'];
      return test({
        q: 'For what value of $h$ are $\\mathbf{v}_{1} = ' + texv(b3[0]) + '$, $\\mathbf{v}_{2} = ' + texv(b3[1]) + '$, $\\mathbf{v}_{3} = ' + texv(v3s) + '$ linearly <b>dependent</b>?',
        a: aN(v3[2]),
        steps: ['$\\mathbf{v}_{1}$ and $\\mathbf{v}_{2}$ are not multiples of each other, so the set is dependent exactly when $\\mathbf{v}_{3}$ is a combination $x_{1}\\mathbf{v}_{1} + x_{2}\\mathbf{v}_{2}$.',
          'The first two entries give $$' + systemTex([[b3[0][0], b3[1][0]], [b3[0][1], b3[1][1]]], [v3[0], v3[1]], ['x_{1}', 'x_{2}']) + '$$ so $x_{1} = ' + N(c3[0]) + '$ and $x_{2} = ' + N(c3[1]) + '$.',
          'The third entry must match: $h = ' + pp(c3[0], b3[0][2]) + ' + ' + pp(c3[1], b3[1][2]) + ' = ' + N(v3[2]) + '$.'],
        hint: 'Dependent here means $\\mathbf{v}_{3}$ is in the span of $\\mathbf{v}_{1}$ and $\\mathbf{v}_{2}$.'
      }, { kind: 'h', vs: b3, h: v3[2], v3: v3 });
    }
    // relation: c1 v1 + c2 v2 + v3 = 0  =>  c = -c3
    var E3 = elim(cols([b3[0], b3[1], v3]), { mode: 'rref' });
    return test({
      q: 'The vectors $\\mathbf{v}_{1} = ' + texv(b3[0]) + '$, $\\mathbf{v}_{2} = ' + texv(b3[1]) + '$, $\\mathbf{v}_{3} = ' + texv(v3) + '$ are dependent. Find $c_{1}$ and $c_{2}$ with $c_{1}\\mathbf{v}_{1} + c_{2}\\mathbf{v}_{2} + \\mathbf{v}_{3} = \\mathbf{0}$. Give $(c_{1}, c_{2})$.',
      a: aV([q(-c3[0]), q(-c3[1])], ['c_{1}', 'c_{2}']),
      steps: ['Row reduce $[\\,\\mathbf{v}_{1}\\ \\mathbf{v}_{2}\\ \\mathbf{v}_{3}\\,]$ to solve $A\\mathbf{c} = \\mathbf{0}$.'].concat(stepTexts(E3, 0)).concat([
        '$c_{3}$ is free; set $c_{3} = 1$. Row 1: $c_{1} = ' + N(E3.M[0][2].neg()) + '$; row 2: $c_{2} = ' + N(E3.M[1][2].neg()) + '$.',
        'Check: $' + T.coef(-c3[0], texv(b3[0])) + T.coef(-c3[1], texv(b3[1]), false) + ' + ' + texv(v3) + ' = \\mathbf{0}$.']),
      hint: 'Solve the homogeneous system with $c_{3} = 1$.'
    }, { kind: 'relation', vs: [b3[0], b3[1], v3] });
  });

  // ---------------------------------------------------------------- la.matrix-algebra
  G('la.matrix-algebra', function (R, ctx) {
    var kind = by(ctx, R.pick(['product', 'product', 'entry']), R.pick(['product', 'transpose', 'commute', 'size']), R.pick(['transpose', 'commute', 'product', 'size']));
    var shapes = by(ctx, [[2, 2, 2]], [[2, 2, 2], [2, 3, 2], [3, 2, 2]], [[2, 3, 2], [3, 2, 3], [2, 3, 3], [3, 3, 2]]), sh = R.pick(shapes);
    var A = randM(R, sh[0], sh[1], -4, 5), B = randM(R, sh[1], sh[2], -4, 5), AB = mm(A, B);
    function entryLine(i, j) { return '$(AB)_{' + (i + 1) + (j + 1) + '} = ' + prods(A[i], col(B, j)) + ' = ' + N(AB[i][j]) + '$'; }
    if (kind === 'product') {
      var steps = ['$A$ is $' + sh[0] + ' \\times ' + sh[1] + '$ and $B$ is $' + sh[1] + ' \\times ' + sh[2] + '$; the inside sizes match, so $AB$ is $' + sh[0] + ' \\times ' + sh[2] + '$.',
        'Entry $(i, j)$ of $AB$ is row $i$ of $A$ dotted with column $j$ of $B$. For example ' + entryLine(0, 0) + '.',
        'Column by column: column $j$ of $AB$ is $A$ times column $j$ of $B$. ' + entryLine(sh[0] - 1, sh[2] - 1) + '.',
        'All together: $AB = ' + tex(AB) + '$.'];
      return test({ q: 'Compute $AB$ for $A = ' + tex(A) + '$ and $B = ' + tex(B) + '$.', a: aM(AB), steps: steps, hint: 'Row of $A$ times column of $B$, entry by entry.' }, { kind: 'product', A: A, B: B });
    }
    if (kind === 'entry') {
      var i = R.int(0, sh[0] - 1), j = R.int(0, sh[2] - 1);
      return test({ q: 'For $A = ' + tex(A) + '$ and $B = ' + tex(B) + '$, find the entry of $AB$ in row ' + (i + 1) + ', column ' + (j + 1) + '.', a: aN(AB[i][j]),
        steps: ['Take row ' + (i + 1) + ' of $A$ and column ' + (j + 1) + ' of $B$, multiply matching entries and add.', entryLine(i, j) + '.'], hint: 'Row ' + (i + 1) + ' of $A$ dotted with column ' + (j + 1) + ' of $B$.' }, { kind: 'entry', A: A, B: B, i: i, j: j });
    }
    if (kind === 'transpose') {
      var BtAt = tr(AB);
      return test({ q: 'For $A = ' + tex(A) + '$ and $B = ' + tex(B) + '$, compute $(AB)^{T}$.', a: aM(BtAt),
        steps: ['First $AB = ' + tex(AB) + '$.', 'Transposing turns rows into columns: $(AB)^{T} = ' + tex(BtAt) + '$.', 'Check with the rule $(AB)^{T} = B^{T}A^{T}$ (the order reverses): $' + tex(tr(B)) + tex(tr(A)) + ' = ' + tex(mm(tr(B), tr(A))) + '$. ' + (sh[0] === sh[2] && sh[1] === sh[0] ? 'In general $A^{T}B^{T}$ gives something else.' : 'Here $A^{T}B^{T}$ would not even have the right size.')],
        hint: 'Multiply first, then swap rows and columns. Or use $(AB)^{T} = B^{T}A^{T}$.' }, { kind: 'transpose', A: A, B: B });
    }
    if (kind === 'commute') {
      var A2 = randM(R, 2, 2, -3, 4), B2, mode = R.int(0, 2);
      if (mode === 0) B2 = add(sc(R.nz(-2, 2), A2), sc(R.int(-3, 3), eye(2)));
      else B2 = randM(R, 2, 2, -3, 4);
      var AB2 = mm(A2, B2), BA2 = mm(B2, A2), same = eqM(AB2, BA2);
      return test({ q: 'True or false: $AB = BA$ for $A = ' + tex(A2) + '$ and $B = ' + tex(B2) + '$.', a: aTF(same),
        steps: ['$AB = ' + tex(AB2) + '$.', '$BA = ' + tex(BA2) + '$.', same ? 'They are equal, so <b>true</b>. ' + (mode === 0 ? '(Here $B$ is built from $A$ and $I$, and such matrices always commute.)' : 'This is the exception, not the rule.') : 'They differ, so <b>false</b>. Matrix multiplication is usually not commutative.'],
        hint: 'Compute both products. Order matters for matrices.' }, { kind: 'commute', A: A2, B: B2, same: same });
    }
    var m = R.int(2, 5), n = R.int(2, 5), p = R.int(2, 5), pp = R.coin() ? n : R.intNot(2, 5, n);
    var defined = pp === n;
    return test({ q: '$A$ is $' + m + ' \\times ' + n + '$ and $B$ is $' + pp + ' \\times ' + p + '$. Is $AB$ defined? If it is, what size is it?',
      a: aMC(defined ? '$' + m + ' \\times ' + p + '$' : 'Not defined', defined ? ['$' + p + ' \\times ' + m + '$', '$' + n + ' \\times ' + pp + '$', 'Not defined'] : ['$' + m + ' \\times ' + p + '$', '$' + pp + ' \\times ' + n + '$', '$' + m + ' \\times ' + pp + '$']),
      steps: ['$AB$ needs the number of columns of $A$ (' + n + ') to equal the number of rows of $B$ (' + pp + ').', defined ? 'They match, and $AB$ takes its rows from $A$ and its columns from $B$: $' + m + ' \\times ' + p + '$.' : 'They do not match, so $AB$ is <b>not defined</b>.'],
      hint: 'Inside sizes must match; outside sizes give the answer.' }, { kind: 'size' });
  });

  // ---------------------------------------------------------------- la.matrix-inverse
  function gaussJordanInv(A) { var n = A.length; var aug = qm(A).map(function (r, i) { return r.concat(eye(n)[i]); }); return elim(aug, { mode: 'rref', ncoef: n }); }
  function augN(M, n) { return '\\left[\\begin{array}{' + 'c'.repeat(n) + '|' + 'c'.repeat(M[0].length - n) + '} ' + M.map(function (r) { return r.map(N).join(' & '); }).join(' \\\\ ') + ' \\end{array}\\right]'; }
  G('la.matrix-inverse', function (R, ctx) {
    var kind = by(ctx, R.pick(['inv2', 'inv2', 'solve']), R.pick(['inv2', 'inv3', 'product', 'solve']), R.pick(['inv3', 'inv2f', 'product']));
    if (kind === 'inv2' || kind === 'inv2f') {
      var A = kind === 'inv2f' ? (function () { var M2; do { M2 = randM(R, 2, 2, -5, 6); } while (det(M2).isZero() || det(M2).abs().eq(1) || det(M2).abs().gt(12)); return M2; })() : unimod(R, 2, 7);
      var d = det(A), Ai = inv(A);
      var steps = ['For $A = ' + T.mat([['a', 'b'], ['c', 'd']]) + '$, $A^{-1} = \\dfrac{1}{ad - bc}' + T.mat([['d', '-b'], ['-c', 'a']]) + '$ when $ad - bc \\neq 0$.',
        '$ad - bc = ' + pp(A[0][0], A[1][1]) + ' - ' + pp(A[0][1], A[1][0]) + ' = ' + N(d) + '$.',
        'Swap the diagonal, negate the off-diagonal, divide by $' + N(d) + '$: $A^{-1} = ' + (d.eq(1) ? '' : d.eq(-1) ? '-' : T.frac(1, d)) + tex([[A[1][1], A[0][1].neg()], [A[1][0].neg(), A[0][0]]]) + ' = ' + tex(Ai) + '$.',
        'Check: $AA^{-1} = ' + tex(mm(A, Ai)) + '$.'];
      return test({ q: 'Find $A^{-1}$ for $A = ' + tex(A) + '$.', a: aM(Ai), steps: steps, hint: 'Find $ad - bc$ first. Then swap, negate and divide.' }, { kind: 'inv', A: A });
    }
    if (kind === 'inv3') {
      var A3 = unimod(R, 3, 6), E = gaussJordanInv(A3), Ai3 = E.M.map(function (r) { return r.slice(3); });
      var st = ['Row reduce $[\\,A \\mid I\\,]$ until the left half is $I$.'].concat(E.steps.map(function (s) { return '$' + s.ops.join(',\\; ') + '$: $' + augN(s.M, 3) + '$'; }));
      st.push('The right half is $A^{-1} = ' + tex(Ai3) + '$. Check: $AA^{-1} = I$.');
      return test({ q: 'Find $A^{-1}$ for $A = ' + tex(A3) + '$ by row reducing $[\\,A \\mid I\\,]$.', a: aM(Ai3), steps: st, hint: 'Use row operations on $[\\,A \\mid I\\,]$; whatever turns $A$ into $I$ turns $I$ into $A^{-1}$.' }, { kind: 'inv', A: A3 });
    }
    if (kind === 'solve') {
      var A4 = unimod(R, 2, 7), Ai4 = inv(A4), x = randV(R, 2, -6, 6), b = mv(A4, x);
      return test({ q: 'Given $A = ' + tex(A4) + '$ and $A^{-1} = ' + tex(Ai4) + '$, solve $A\\mathbf{x} = ' + texv(b) + '$. Give $(x_{1}, x_{2})$.', a: aV(x),
        steps: ['Multiply both sides on the left by $A^{-1}$: $\\mathbf{x} = A^{-1}\\mathbf{b}$.', '$A^{-1}\\mathbf{b} = ' + tex(Ai4) + texv(b) + ' = ' + texv(x) + '$.', 'Check: $A' + texv(x) + ' = ' + texv(mv(A4, x)) + '$.'],
        hint: '$\\mathbf{x} = A^{-1}\\mathbf{b}$.' }, { kind: 'solve', A: A4, b: b });
    }
    var Ai5 = unimod(R, 2, 6), Bi5 = unimod(R, 2, 6), ABi = mm(Bi5, Ai5), wrongP = mm(Ai5, Bi5);
    return test({ q: 'You know $A^{-1} = ' + tex(Ai5) + '$ and $B^{-1} = ' + tex(Bi5) + '$. Find $(AB)^{-1}$.', a: aM(ABi),
      steps: ['$(AB)^{-1} = B^{-1}A^{-1}$: to undo "do $B$, then $A$", undo $A$ first, then $B$. Check: $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AA^{-1} = I$.',
        '$B^{-1}A^{-1} = ' + tex(Bi5) + tex(Ai5) + ' = ' + tex(ABi) + '$.'].concat(eqM(ABi, wrongP) ? [] : ['Note that $A^{-1}B^{-1} = ' + tex(wrongP) + '$ is different.']),
      hint: 'Reverse the order: socks then shoes, shoes off then socks off.' }, { kind: 'product', Ai: Ai5, Bi: Bi5 });
  });

  // ---------------------------------------------------------------- la.invertible-matrix-theorem
  var IMT_YES = [
    '$A$ is invertible', 'the columns of $A$ are linearly independent', 'the columns of $A$ span $\\mathbb{R}^{n}$', '$A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution',
    '$A\\mathbf{x} = \\mathbf{b}$ has a solution for every $\\mathbf{b}$ in $\\mathbb{R}^{n}$', '$A$ has $n$ pivot positions', '$A$ is row equivalent to $I_{n}$', '$A^{T}$ is invertible',
    '$A$ has a pivot in every row', 'the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ is one-to-one', 'the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ is onto $\\mathbb{R}^{n}$', 'there is a matrix $C$ with $CA = I$'];
  var IMT_NO = [
    '$A$ is not invertible', 'the columns of $A$ are linearly dependent', 'the columns of $A$ do not span $\\mathbb{R}^{n}$', '$A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution',
    '$A\\mathbf{x} = \\mathbf{b}$ has no solution for some $\\mathbf{b}$', '$A$ has fewer than $n$ pivot positions', 'the echelon form of $A$ has a row of zeros', '$A^{T}$ is not invertible',
    '$A\\mathbf{x} = \\mathbf{b}$ has infinitely many solutions for some $\\mathbf{b}$', 'two different vectors have the same image under $\\mathbf{x} \\mapsto A\\mathbf{x}$', 'some column of $A$ is a combination of the others'];
  G('la.invertible-matrix-theorem', function (R, ctx) {
    var kind = by(ctx, R.pick(['imply', 'imply', 'specific']), R.pick(['imply', 'specific', 'imply']), R.pick(['imply', 'specific', 'nonsquare']));
    if (kind === 'imply') {
      var pYes = R.coin(), cYes = R.coin(), pl2 = pYes ? IMT_YES : IMT_NO, cl = cYes ? IMT_YES : IMT_NO;
      var pi = R.int(1, pl2.length - 1), ci = R.intNot(0, cl.length - 1, pi);
      var prem = pl2[pi], conc = cl[ci], ans = pYes === cYes;
      var n = R.int(3, 6);
      return test({ q: '$A$ is an $n \\times n$ matrix (square). Suppose ' + prem + '. True or false: then ' + conc + '.', a: aTF(ans),
        steps: ['For a <b>square</b> matrix, the statements of the Invertible Matrix Theorem are all true together (when $A$ is invertible) or all false together (when it is not).',
          '"' + prem.replace(/^the /, 'The ') + '" says $A$ is ' + (pYes ? '' : '<b>not</b> ') + 'invertible. "' + conc.replace(/^the /, 'The ') + '" holds exactly when $A$ is ' + (cYes ? '' : '<b>not</b> ') + 'invertible.',
          ans ? 'Both describe the same case, so the conclusion follows: <b>true</b>.' : 'They describe opposite cases, so the conclusion is impossible: <b>false</b>.'],
        hint: 'Decide whether each statement means "invertible" or "not invertible".' }, { kind: 'imply', ans: ans });
    }
    if (kind === 'specific') {
      var inv0 = R.coin(), A;
      if (inv0) { do { A = randM(R, 3, 3, -4, 5); } while (det(A).isZero() || isTrivialM(A)); }
      else { var B = randM(R, 2, 3, -4, 5), cc = [R.nz(-2, 2), R.int(-2, 2)]; A = R.shuffle([B[0], B[1], vadd(vsc(cc[0], B[0]), vsc(cc[1], B[1]))]); }
      var dA = det(A), isInv = !dA.isZero(), E = elim(A, { mode: 'echelon' });
      var cyes = R.coin(), clist = cyes ? IMT_YES : IMT_NO, ci2 = R.int(1, clist.length - 1), conc2 = clist[ci2].replace(/\\mathbb\{R\}\^\{n\}/g, '\\mathbb{R}^{3}').replace(/\$n\$/g, '$3$').replace(/I_\{n\}/g, 'I_{3}');
      var ans2 = cyes === isInv;
      return test({ q: 'Let $A = ' + tex(A) + '$. True or false: ' + conc2 + '.', a: aTF(ans2),
        steps: ['Row reduce to count pivots.'].concat(stepTexts(E, 0)).concat([E.pivots.length + ' pivots, so $A$ is ' + (isInv ? '' : '<b>not</b> ') + 'invertible (by the Invertible Matrix Theorem).', 'The statement "' + conc2 + '" ' + (cyes ? 'is equivalent to invertibility' : 'is equivalent to <b>not</b> being invertible') + ', so it is <b>' + (ans2 ? 'true' : 'false') + '</b>.']),
        hint: 'Find out whether $A$ is invertible (count pivots), then use the theorem.' }, { kind: 'specific', A: A, ans: ans2, inv: isInv });
    }
    var m = R.int(2, 4), nn = m + R.int(1, 2), stmts = [['the columns of $A$ are linearly independent', false, 'There are ' + nn + ' columns in $\\mathbb{R}^{' + m + '}$: more vectors than entries, so they are always dependent.'],
      ['$A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution', true, 'At most ' + m + ' pivots for ' + nn + ' columns, so there is a free variable.'],
      ['$A$ is invertible', false, 'Only square matrices can be invertible.']];
    var s = R.pick(stmts);
    return test({ q: '$A$ is a $' + m + ' \\times ' + nn + '$ matrix with ' + m + ' pivots. True or false: ' + s[0] + '.', a: aTF(s[1]),
      steps: ['$A$ is not square, so the Invertible Matrix Theorem does not apply directly. Reason from pivots.', s[2], 'So the statement is <b>' + (s[1] ? 'true' : 'false') + '</b>.'],
      hint: 'Count columns versus pivots.' }, { kind: 'nonsquare' });
  });

  // ---------------------------------------------------------------- la.lu-factorization
  function fwd(bi, ls, ys) { // "b - l1 y1 - l2 y2" with zero terms dropped
    var out = N(bi);
    ls.forEach(function (l, k) { l = q(l); if (l.isZero()) return; out += (l.sign() > 0 ? ' - ' : ' + ') + (l.abs().eq(1) ? '' : l.abs().toTex()) + '(' + N(ys[k]) + ')'; });
    return out;
  }
  G('la.lu-factorization', function (R, ctx) {
    var kind = by(ctx, R.pick(['elem', 'L']), R.pick(['L', 'U', 'solveLU', 'elem']), R.pick(['solveLU', 'L', 'U']));
    if (kind === 'elem') {
      var n = 3, i = R.int(0, 2), j = R.intNot(0, 2, i), f = R.nz(-4, 4), wantInv = ctx.level >= 2 && R.coin(), E = eye(n);
      E[i][j] = q(f); var Ei = eye(n); Ei[i][j] = q(-f);
      return test({ q: 'Find the $3 \\times 3$ elementary matrix $E' + (wantInv ? '^{-1}' : '') + '$, where $E$ performs the row operation $' + opAdd(i, q(f), j) + '$ (so $EA$ is the result of that operation on $A$).', a: aM(wantInv ? Ei : E),
        steps: ['An elementary matrix is the identity with the row operation done to it.', 'Doing $' + opAdd(i, q(f), j) + '$ to $I$ puts $' + N(f) + '$ in row ' + (i + 1) + ', column ' + (j + 1) + ': $E = ' + tex(E) + '$.'].concat(wantInv ? ['To undo it, subtract instead: $' + opAdd(i, q(-f), j) + '$. So $E^{-1} = ' + tex(Ei) + '$.'] : []),
        hint: 'Apply the operation to the identity matrix.' }, { kind: 'elem', E: E, Ei: Ei, inv: wantInv });
    }
    var Lm, Um, A, tries = 0;
    do {
      Lm = unitLower(R, 3, -3, 3); Um = zeros(3, 3);
      for (var r = 0; r < 3; r++) { Um[r][r] = q(R.pick([1, 2, -1, 3, -2])); for (var c = r + 1; c < 3; c++) Um[r][c] = q(R.int(-3, 4)); }
      A = mm(Lm, Um);
    } while ((maxAbs(A) > 12 || Lm[1][0].isZero() || Lm[2][0].isZero() && Lm[2][1].isZero()) && ++tries < 50);
    var E2 = elim(A, { mode: 'echelon' });
    var stepsL = ['Eliminate below the diagonal without swapping, and record each multiplier.'].concat(stepTexts(E2, 0));
    stepsL.push('$U$ is the echelon form: $U = ' + tex(Um) + '$.');
    stepsL.push('$L$ has $1$s on the diagonal and, below it, the multipliers that were <b>subtracted</b>: $\\ell_{21} = ' + N(Lm[1][0]) + '$, $\\ell_{31} = ' + N(Lm[2][0]) + '$, $\\ell_{32} = ' + N(Lm[2][1]) + '$. So $L = ' + tex(Lm) + '$.');
    stepsL.push('Check: $LU = ' + tex(mm(Lm, Um)) + ' = A$.');
    if (kind === 'L' || kind === 'U') {
      return test({ q: 'Find ' + (kind === 'L' ? 'the unit lower triangular matrix $L$' : 'the upper triangular matrix $U$') + ' in the factorization $A = LU$ for $$A = ' + tex(A) + '$$', a: aM(kind === 'L' ? Lm : Um), steps: stepsL,
        hint: kind === 'L' ? 'Row reduce with only "row minus multiple of a row above" steps. The multipliers go into $L$.' : 'Eliminate below each pivot (no swaps, no scaling). What is left is $U$.' }, { kind: kind, A: A, L: Lm, U: Um });
    }
    var x = randV(R, 3, -4, 4), b = mv(A, x), y = mv(Um, x);
    return test({ q: 'Use $A = LU$ with $L = ' + tex(Lm) + '$ and $U = ' + tex(Um) + '$ to solve $A\\mathbf{x} = ' + texv(b) + '$. Give $(x_{1}, x_{2}, x_{3})$.', a: aV(x),
      steps: ['Solve $L\\mathbf{y} = \\mathbf{b}$ by forward substitution: $y_{1} = ' + N(y[0]) + '$, $y_{2} = ' + fwd(b[1], [Lm[1][0]], [y[0]]) + ' = ' + N(y[1]) + '$, $y_{3} = ' + fwd(b[2], [Lm[2][0], Lm[2][1]], [y[0], y[1]]) + ' = ' + N(y[2]) + '$.',
        'Solve $U\\mathbf{x} = \\mathbf{y}$ by back substitution, from the bottom: $x_{3} = ' + N(x[2]) + '$, then $x_{2} = ' + N(x[1]) + '$, then $x_{1} = ' + N(x[0]) + '$.',
        'Check: $A\\mathbf{x} = ' + texv(mv(A, x)) + '$.'],
      hint: 'Two triangular solves: first $L\\mathbf{y} = \\mathbf{b}$ (top down), then $U\\mathbf{x} = \\mathbf{y}$ (bottom up).' }, { kind: 'solveLU', A: A, L: Lm, U: Um, b: b });
  });


  // ================================================================ Unit 3: Linear Transformations

  function fmtMap(A, names) { // "T(x, y) = (2x - y, x + 3y)"
    return '(' + A.map(function (r) { var tl = r.map(function (c, j) { return [c, names[j]]; }).filter(function (t) { return !q(t[0]).isZero(); }); return tl.length ? T.terms(tl) : '0'; }).join(', ') + ')';
  }
  var YESNO = ['Yes', 'No'];
  function yn(b) { return { t: 'mc', choices: YESNO.slice(), v: b ? 0 : 1, keep: true }; }

  // ---------------------------------------------------------------- la.linear-transformations
  G('la.linear-transformations', function (R, ctx) {
    var kind = by(ctx, R.pick(['islinear', 'use']), R.pick(['islinear', 'use', 'use']), R.pick(['islinear', 'use', 'use3']));
    if (kind === 'islinear') {
      var a = R.nz(-4, 4), b = R.int(-4, 4), c = R.int(-4, 4), d = R.nz(-4, 4), k = R.nz(-5, 5), t = R.int(0, 4), f, lin, st;
      var first = T.terms([[a, 'x'], [b, 'y']]), second = T.terms([[c, 'x'], [d, 'y']]);
      if (t === 0) { f = '(' + first + ', ' + second + ')'; lin = true; st = ['Each output entry is a fixed combination $ax + by$ with no constant term. Such a formula is $A\\mathbf{x}$ for $A = ' + tex([[a, b], [c, d]]) + '$, and every matrix map is linear.', 'Directly: $T(\\mathbf{u} + \\mathbf{v}) = A(\\mathbf{u} + \\mathbf{v}) = A\\mathbf{u} + A\\mathbf{v}$ and $T(c\\mathbf{u}) = cA\\mathbf{u}$. So <b>true</b>.']; }
      else if (t === 1) { f = '(' + first + T.signed(k) + ', ' + second + ')'; lin = false; st = ['Test the zero vector first: a linear map must send $\\mathbf{0}$ to $\\mathbf{0}$, because $T(\\mathbf{0}) = T(0\\cdot\\mathbf{0}) = 0\\,T(\\mathbf{0}) = \\mathbf{0}$.', '$T(0, 0) = (' + N(k) + ', 0) \\neq (0, 0)$. The constant shifts everything (a translation), so <b>false</b>.']; }
      else if (t === 2) { f = '(' + T.coef(a, 'xy') + ', ' + second + ')'; lin = false; var u2 = [1, 1]; st = ['$T(0, 0) = (0, 0)$, so that test does not settle it. Try scaling: linear maps satisfy $T(2\\mathbf{u}) = 2T(\\mathbf{u})$.', 'With $\\mathbf{u} = (1, 1)$: $T(2, 2)$ has first entry $' + N(a) + '\\cdot 2\\cdot 2 = ' + N(4 * a) + '$, but $2T(1, 1)$ has first entry $2\\cdot ' + P(a) + ' = ' + N(2 * a) + '$.', 'They differ, so $T$ is <b>not</b> linear: the product $xy$ is not a linear term.']; }
      else if (t === 3) { f = '(' + first + ', ' + T.coef(d, 'y^{2}') + ')'; lin = false; st = ['$T(0, 0) = (0, 0)$, so check scaling: $T(2\\mathbf{u})$ versus $2T(\\mathbf{u})$.', 'With $\\mathbf{u} = (0, 1)$: second entry of $T(0, 2)$ is $' + N(d) + '\\cdot 4 = ' + N(4 * d) + '$; second entry of $2T(0, 1)$ is $2\\cdot ' + P(d) + ' = ' + N(2 * d) + '$.', 'Different, so <b>not</b> linear: squares are not linear.']; }
      else { f = '(' + first + ', \\left|' + T.coef(d, 'y') + '\\right|)'; lin = false; st = ['$T(0, 0) = (0, 0)$, so check scaling by $-1$: a linear map has $T(-\\mathbf{u}) = -T(\\mathbf{u})$.', 'With $\\mathbf{u} = (0, 1)$: the second entry of $T(0, -1)$ is $' + N(Math.abs(d)) + '$, but the second entry of $-T(0, 1)$ is $' + N(-Math.abs(d)) + '$.', 'Different, so <b>not</b> linear.']; }
      return test({ q: 'True or false: $T(x, y) = ' + f + '$ is a linear transformation.', a: aTF(lin), steps: st,
        hint: 'First check $T(0, 0)$. If that is $(0, 0)$, test $T(c\\mathbf{u}) = cT(\\mathbf{u})$ with a simple vector.' }, { kind: 'islinear', t: t, lin: lin });
    }
    var m = R.pick([2, 3]), Tu = randV(R, m, -5, 5), Tv = randV(R, m, -5, 5), c1 = R.nz(-3, 3), c2 = R.nz(-3, 3);
    if (kind === 'use3') {
      var Tw = randV(R, m, -4, 4), c3 = R.nz(-2, 2), ans3 = vadd(vadd(vsc(c1, Tu), vsc(c2, Tv)), vsc(c3, Tw));
      return test({ q: '$T$ is linear, with $T(\\mathbf{u}) = ' + texv(Tu) + '$, $T(\\mathbf{v}) = ' + texv(Tv) + '$ and $T(\\mathbf{w}) = ' + texv(Tw) + '$. Find $T(' + sumTex([c1, c2, c3], ['\\mathbf{u}', '\\mathbf{v}', '\\mathbf{w}']) + ')$.', a: aV(ans3),
        steps: ['Linearity lets us split sums and pull out constants: $T(' + sumTex([c1, c2, c3], ['\\mathbf{u}', '\\mathbf{v}', '\\mathbf{w}']) + ') = ' + sumTex([c1, c2, c3], ['T(\\mathbf{u})', 'T(\\mathbf{v})', 'T(\\mathbf{w})']) + '$.', '$= ' + combTex([c1, c2, c3], [Tu, Tv, Tw]) + ' = ' + texv(ans3) + '$.'],
        hint: 'Use $T(a\\mathbf{u} + b\\mathbf{v}) = aT(\\mathbf{u}) + bT(\\mathbf{v})$.' }, { kind: 'use', vals: [Tu, Tv, Tw], cs: [c1, c2, c3] });
    }
    var ans = vadd(vsc(c1, Tu), vsc(c2, Tv));
    return test({ q: '$T$ is a linear transformation with $T(\\mathbf{u}) = ' + texv(Tu) + '$ and $T(\\mathbf{v}) = ' + texv(Tv) + '$. Find $T(' + sumTex([c1, c2], ['\\mathbf{u}', '\\mathbf{v}']) + ')$.', a: aV(ans),
      steps: ['Because $T$ is linear, $T(' + sumTex([c1, c2], ['\\mathbf{u}', '\\mathbf{v}']) + ') = ' + sumTex([c1, c2], ['T(\\mathbf{u})', 'T(\\mathbf{v})']) + '$.', '$= ' + combTex([c1, c2], [Tu, Tv]) + ' = ' + texv(ans) + '$.'],
      hint: 'A linear map respects sums and multiples, so apply it to each piece.' }, { kind: 'use', vals: [Tu, Tv], cs: [c1, c2] });
  });

  // ---------------------------------------------------------------- la.standard-matrix
  G('la.standard-matrix', function (R, ctx) {
    var kind = by(ctx, R.pick(['formula', 'images']), R.pick(['formula', 'images', 'formula']), R.pick(['nonstd', 'formula', 'images']));
    if (kind === 'formula') {
      var n = R.pick([2, 3]), m = R.pick([2, 3]), A = randM(R, m, n, -5, 5), names = n === 2 ? ['x_{1}', 'x_{2}'] : ['x_{1}', 'x_{2}', 'x_{3}'];
      A.forEach(function (r) { if (isZeroV(r)) r[R.int(0, n - 1)] = q(R.nz(-3, 3)); });
      var E = eye(n), st = ['The columns of the standard matrix are $T(\\mathbf{e}_{1}), \\ldots$: plug in each standard basis vector.'];
      for (var j = 0; j < n; j++) st.push('$T(\\mathbf{e}_{' + (j + 1) + '}) = T' + texr(E[j]) + ' = ' + texv(col(A, j)) + '$ (the coefficients of $' + names[j] + '$).');
      st.push('So $A = ' + tex(A) + '$. Check: $A' + texv(names) + '$ reproduces the formula.');
      return test({ q: 'Find the standard matrix of $$T(' + names.join(', ') + ') = ' + fmtMap(A, names) + '.$$', a: aM(A), steps: st,
        hint: 'Column $j$ holds the coefficients of $x_{' + 1 + '}$, then $x_{2}$, … down the output entries. Read down, not across.' }, { kind: 'formula', A: A });
    }
    if (kind === 'images') {
      var n2 = R.pick([2, 3]), m2 = R.pick([2, 3]), A2 = randM(R, m2, n2, -5, 6);
      var imgs = []; for (var k = 0; k < n2; k++) imgs.push('$T(\\mathbf{e}_{' + (k + 1) + '}) = ' + texv(col(A2, k)) + '$');
      return test({ q: '$T: \\mathbb{R}^{' + n2 + '} \\to \\mathbb{R}^{' + m2 + '}$ is linear with ' + lst(imgs) + '. Find the standard matrix $A$ of $T$.', a: aM(A2),
        steps: ['$T(\\mathbf{x}) = T(x_{1}\\mathbf{e}_{1} + \\cdots) = x_{1}T(\\mathbf{e}_{1}) + \\cdots$, which is the matrix with columns $T(\\mathbf{e}_{j})$ times $\\mathbf{x}$.', 'Place the images as <b>columns</b>, in order: $A = ' + tex(A2) + '$ (a $' + m2 + ' \\times ' + n2 + '$ matrix).'],
        hint: 'The images go in as columns, not rows.' }, { kind: 'images', A: A2 });
    }
    var P0 = unimod(R, 2, 4), u = col(P0, 0), v = col(P0, 1), A3 = randM(R, 2, 2, -4, 5), Tu = mv(A3, u), Tv = mv(A3, v);
    var Pi = inv(P0), e1 = col(Pi, 0), e2 = col(Pi, 1);
    return test({ q: '$T: \\mathbb{R}^{2} \\to \\mathbb{R}^{2}$ is linear with $T' + texv(u) + ' = ' + texv(Tu) + '$ and $T' + texv(v) + ' = ' + texv(Tv) + '$. Find the standard matrix of $T$.', a: aM(A3),
      steps: ['We need $T(\\mathbf{e}_{1})$ and $T(\\mathbf{e}_{2})$. Write each $\\mathbf{e}_{j}$ as a combination of $\\mathbf{u} = ' + texv(u) + '$ and $\\mathbf{v} = ' + texv(v) + '$.',
        '$\\mathbf{e}_{1} = ' + sumTex(e1, ['\\mathbf{u}', '\\mathbf{v}']) + '$ and $\\mathbf{e}_{2} = ' + sumTex(e2, ['\\mathbf{u}', '\\mathbf{v}']) + '$ (solve, or invert $[\\,\\mathbf{u}\\ \\mathbf{v}\\,] = ' + tex(P0) + '$: its inverse is $' + tex(Pi) + '$).',
        'By linearity $T(\\mathbf{e}_{1}) = ' + combTex(e1, [Tu, Tv]) + ' = ' + texv(col(A3, 0)) + '$ and $T(\\mathbf{e}_{2}) = ' + combTex(e2, [Tu, Tv]) + ' = ' + texv(col(A3, 1)) + '$.',
        'So $A = ' + tex(A3) + '$. Check: $A' + texv(u) + ' = ' + texv(mv(A3, u)) + '$.'],
      hint: 'Express $\\mathbf{e}_{1}$ and $\\mathbf{e}_{2}$ in terms of the two given vectors, then use linearity.' }, { kind: 'nonstd', A: A3, u: u, v: v, Tu: Tu, Tv: Tv });
  });

  // ---------------------------------------------------------------- la.geometric-maps
  var R2 = Math.SQRT2;
  function rotEntries(deg) { // exact cos and sin of special angles as [tex, plain]
    var tbl = { 0: ['1', '0'], 30: ['sqrt(3)/2', '1/2'], 45: ['sqrt(2)/2', 'sqrt(2)/2'], 60: ['1/2', 'sqrt(3)/2'], 90: ['0', '1'], 120: ['-1/2', 'sqrt(3)/2'], 135: ['-sqrt(2)/2', 'sqrt(2)/2'], 150: ['-sqrt(3)/2', '1/2'], 180: ['-1', '0'], 210: ['-sqrt(3)/2', '-1/2'], 225: ['-sqrt(2)/2', '-sqrt(2)/2'], 240: ['-1/2', '-sqrt(3)/2'], 270: ['0', '-1'], 300: ['1/2', '-sqrt(3)/2'], 315: ['sqrt(2)/2', '-sqrt(2)/2'], 330: ['sqrt(3)/2', '-1/2'] };
    var d = ((deg % 360) + 360) % 360; return tbl[d];
  }
  function negP(s) { return s === '0' ? '0' : s[0] === '-' ? s.slice(1) : '-' + s; }
  function rotMatrix(deg) { var cs = rotEntries(deg); return [[cs[0], negP(cs[1])], [cs[1], cs[0]]]; }
  function plainMatTex(Mx) { return '\\begin{bmatrix} ' + Mx.map(function (r) { return r.map(function (x) { return T.plain(x); }).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}'; }
  var GEO = {
    rot: function (R) { var d = R.pick([90, 180, 270, -90, 45, 30, 60, 120, 135, 150]); var Mx = rotMatrix(d); return { name: 'rotation by $' + T.deg(Math.abs(d)) + '$ ' + (d < 0 ? 'clockwise' : 'counterclockwise'), M: Mx, why: 'A rotation by $\\theta$ (counterclockwise) has matrix $' + T.mat([['\\cos\\theta', '-\\sin\\theta'], ['\\sin\\theta', '\\cos\\theta']]) + '$: $\\mathbf{e}_{1}$ goes to $(\\cos\\theta, \\sin\\theta)$ and $\\mathbf{e}_{2}$ to $(-\\sin\\theta, \\cos\\theta)$.' + (d < 0 ? ' Clockwise means $\\theta = ' + T.deg(d) + '$.' : '') }; },
    refl: function (R) { var w = R.pick([['the $x$-axis', [['1', '0'], ['0', '-1']]], ['the $y$-axis', [['-1', '0'], ['0', '1']]], ['the line $y = x$', [['0', '1'], ['1', '0']]], ['the line $y = -x$', [['0', '-1'], ['-1', '0']]]]); return { name: 'reflection across ' + w[0], M: w[1], why: 'Reflect $\\mathbf{e}_{1} = (1, 0)$ and $\\mathbf{e}_{2} = (0, 1)$ across ' + w[0] + ': they land at $' + texr([w[1][0][0], w[1][1][0]]) + '$ and $' + texr([w[1][0][1], w[1][1][1]]) + '$.' }; },
    shear: function (R) { var k = R.nz(-3, 3), h = R.coin(); return { name: (h ? 'horizontal' : 'vertical') + ' shear by $' + k + '$ (' + (h ? '$x \\mapsto x' + T.coef(k, 'y', false) + '$' : '$y \\mapsto y' + T.coef(k, 'x', false) + '$') + ')', M: h ? [['1', String(k)], ['0', '1']] : [['1', '0'], [String(k), '1']], why: 'A ' + (h ? 'horizontal' : 'vertical') + ' shear keeps $' + (h ? '\\mathbf{e}_{1}' : '\\mathbf{e}_{2}') + '$ fixed and slides $' + (h ? '\\mathbf{e}_{2}' : '\\mathbf{e}_{1}') + '$ to $' + (h ? texr([k, 1]) : texr([1, k])) + '$.' }; },
    proj: function (R) { var m = R.pick([1, 2, -1, -2, 3, 'x', 'y']); if (m === 'x') return { name: 'projection onto the $x$-axis', M: [['1', '0'], ['0', '0']], why: 'Projecting onto the $x$-axis keeps the $x$-coordinate and drops $y$: $\\mathbf{e}_{1} \\mapsto \\mathbf{e}_{1}$, $\\mathbf{e}_{2} \\mapsto \\mathbf{0}$.' }; if (m === 'y') return { name: 'projection onto the $y$-axis', M: [['0', '0'], ['0', '1']], why: 'Projecting onto the $y$-axis drops $x$: $\\mathbf{e}_{1} \\mapsto \\mathbf{0}$, $\\mathbf{e}_{2} \\mapsto \\mathbf{e}_{2}$.' };
      var d = 1 + m * m, Mx = [[q(1).div(d), q(m).div(d)], [q(m).div(d), q(m * m).div(d)]];
      return { name: 'projection onto the line $y = ' + T.coef(m, 'x') + '$', M: plM(Mx), why: 'The line has direction $\\mathbf{u} = ' + texr([1, m]) + '$. Projection onto it is $\\mathbf{x} \\mapsto \\dfrac{\\mathbf{x}\\cdot\\mathbf{u}}{\\mathbf{u}\\cdot\\mathbf{u}}\\mathbf{u}$, so $\\mathbf{e}_{1} \\mapsto \\frac{1}{' + d + '}' + texr([1, m]) + '$ and $\\mathbf{e}_{2} \\mapsto \\frac{' + m + '}{' + d + '}' + texr([1, m]) + '$.' }; },
    scale: function (R) { var a = R.pick([2, 3, -2]), b = R.pick([2, 3, 1, -1]); return { name: 'stretch by $' + a + '$ in the $x$-direction and by $' + b + '$ in the $y$-direction', M: [[String(a), '0'], ['0', String(b)]], why: '$\\mathbf{e}_{1} \\mapsto ' + texr([a, 0]) + '$ and $\\mathbf{e}_{2} \\mapsto ' + texr([0, b]) + '$.' }; }
  };
  function geoPick(R, kinds) { return GEO[R.pick(kinds)](R); }
  G('la.geometric-maps', function (R, ctx) {
    var kind = by(ctx, R.pick(['build', 'image', 'identify']), R.pick(['build', 'build', 'identify', 'image']), R.pick(['build', 'image', 'identify']));
    var pool = by(ctx, ['refl', 'shear', 'scale', 'rot90'], ['rot', 'refl', 'shear', 'proj'], ['rot', 'proj', 'refl', 'shear']);
    var g = R.pick(pool) === 'rot90' ? (function () { var d = R.pick([90, 180, 270]); return { name: 'rotation by $' + T.deg(d) + '$ counterclockwise', M: rotMatrix(d), why: 'A rotation by $' + T.deg(d) + '$ sends $\\mathbf{e}_{1}$ to $' + texr(rotEntries(d).map(function (s) { return q(s); })) + '$ and $\\mathbf{e}_{2}$ to $' + texr([q(negP(rotEntries(d)[1])), q(rotEntries(d)[0])]) + '$.' }; })() : geoPick(R, pool.filter(function (k) { return k !== 'rot90'; }));
    if (kind === 'build') {
      return test({ q: 'Find the standard matrix of the ' + g.name + ' of the plane.', a: { t: 'matrix', v: g.M },
        steps: [g.why, 'Those images are the columns: $' + plainMatTex(g.M) + '$.'],
        hint: 'Where do $\\mathbf{e}_{1}$ and $\\mathbf{e}_{2}$ go? Their images are the columns.' }, { kind: 'build', name: g.name, M: g.M });
    }
    if (kind === 'image') {
      var simple = GEO[R.pick(['refl', 'shear', 'scale'])](R);
      if (ctx.level >= 2 && R.coin()) { var d = R.pick([90, 180, 270]); simple = { name: 'rotation by $' + T.deg(d) + '$ counterclockwise', M: rotMatrix(d) }; }
      var Mq = simple.M.map(function (r) { return r.map(q); }), x = randV(R, 2, -5, 5, true), y = mv(Mq, x);
      return test({ q: 'Apply the ' + simple.name + ' to the point $' + texr(x) + '$. Where does it land?', a: aV(y),
        steps: ['The matrix is $' + tex(Mq) + '$.', 'Multiply: $' + tex(Mq) + texv(x) + ' = ' + texv(y) + '$.'],
        hint: 'Write the matrix of the map, then multiply it by the point as a column vector.' }, { kind: 'image', M: Mq, x: x });
    }
    var opts = ['refl', 'shear', 'scale', 'proj'], picks = [], seen = {};
    var rot = (function () { var d = R.pick([90, 180, 270]); return { name: 'rotation by $' + T.deg(d) + '$ counterclockwise', M: rotMatrix(d) }; })();
    picks.push(rot); seen[JSON.stringify(rot.M)] = 1;
    for (var t = 0; t < 40 && picks.length < 4; t++) { var gg = GEO[R.pick(opts)](R); var key = JSON.stringify(gg.M); if (!seen[key]) { seen[key] = 1; picks.push(gg); } }
    var target = R.pick(picks), Mt = target.M;
    return test({ q: 'Which map of the plane has standard matrix $' + plainMatTex(Mt) + '$?', a: { t: 'mc', choices: picks.map(function (p) { return 'A ' + p.name; }), v: picks.indexOf(target) },
      steps: ['Read the columns: $\\mathbf{e}_{1} \\mapsto ' + texr([q(Mt[0][0]), q(Mt[1][0])]) + '$ and $\\mathbf{e}_{2} \\mapsto ' + texr([q(Mt[0][1]), q(Mt[1][1])]) + '$.', 'That is what the ' + target.name + ' does.'],
      hint: 'Look at where $\\mathbf{e}_{1}$ and $\\mathbf{e}_{2}$ go (the columns), and picture it.' }, { kind: 'identify', M: Mt });
  });

  // ---------------------------------------------------------------- la.composition-products
  G('la.composition-products', function (R, ctx) {
    var kind = by(ctx, R.pick(['geom', 'general']), R.pick(['geom', 'general', 'order']), R.pick(['geom', 'general3', 'commute']));
    if (kind === 'geom' || kind === 'commute') {
      var maps = [
        { name: 'rotate $' + T.deg(90) + '$ counterclockwise', M: qm([[0, -1], [1, 0]]) }, { name: 'rotate $' + T.deg(180) + '$', M: qm([[-1, 0], [0, -1]]) },
        { name: 'reflect across the $x$-axis', M: qm([[1, 0], [0, -1]]) }, { name: 'reflect across the $y$-axis', M: qm([[-1, 0], [0, 1]]) },
        { name: 'reflect across the line $y = x$', M: qm([[0, 1], [1, 0]]) }, { name: 'project onto the $x$-axis', M: qm([[1, 0], [0, 0]]) },
        { name: 'stretch horizontally by $2$', M: qm([[2, 0], [0, 1]]) }, { name: 'shear horizontally ($x \\mapsto x + y$)', M: qm([[1, 1], [0, 1]]) }
      ];
      var pair, prod, other;
      for (var t = 0; t < 40; t++) { pair = R.sample(maps, 2); prod = mm(pair[1].M, pair[0].M); other = mm(pair[0].M, pair[1].M); if (!eqM(prod, other) || kind === 'commute') break; }
      if (kind === 'commute') {
        var same = eqM(prod, other);
        return test({ q: 'True or false: "' + pair[0].name + ', then ' + pair[1].name + '" has the same effect as "' + pair[1].name + ', then ' + pair[0].name + '".', a: aTF(same),
          steps: ['Let $A = ' + tex(pair[0].M) + '$ (' + pair[0].name + ') and $B = ' + tex(pair[1].M) + '$ (' + pair[1].name + ').', '"$A$ then $B$" is $BA = ' + tex(prod) + '$; "$B$ then $A$" is $AB = ' + tex(other) + '$.', same ? 'They are equal, so <b>true</b>.' : 'They differ, so <b>false</b>: the order matters.'],
          hint: 'Compute both products $BA$ and $AB$.' }, { kind: 'commute', A: pair[0].M, B: pair[1].M, same: same });
      }
      return test({ q: 'Find the standard matrix of the map that first does "' + pair[0].name + '" and then "' + pair[1].name + '".', a: aM(prod),
        steps: ['First map: $A = ' + tex(pair[0].M) + '$. Second map: $B = ' + tex(pair[1].M) + '$.', 'Doing $A$ first and then $B$ sends $\\mathbf{x}$ to $B(A\\mathbf{x}) = (BA)\\mathbf{x}$: the first map is written on the <b>right</b>.', '$BA = ' + tex(pair[1].M) + tex(pair[0].M) + ' = ' + tex(prod) + '$.', 'Check with $\\mathbf{e}_{1}$: $A\\mathbf{e}_{1} = ' + texv(col(pair[0].M, 0)) + '$, then $B$ of that is $' + texv(mv(pair[1].M, col(pair[0].M, 0))) + '$, the first column of $BA$.'],
        hint: 'The map applied first goes on the right of the product.' }, { kind: 'geom', A: pair[0].M, B: pair[1].M });
    }
    if (kind === 'order') {
      return test({ q: '$T(\\mathbf{x}) = A\\mathbf{x}$ and $S(\\mathbf{x}) = B\\mathbf{x}$. Which matrix represents "apply $T$, then apply $S$"?', a: aMC('$BA$', ['$AB$', '$A + B$', '$A^{T}B^{T}$']),
        steps: ['"$T$, then $S$" sends $\\mathbf{x}$ to $S(T(\\mathbf{x})) = B(A\\mathbf{x})$.', 'By associativity $B(A\\mathbf{x}) = (BA)\\mathbf{x}$, so the matrix is $BA$: read right to left.'],
        hint: 'Write $S(T(\\mathbf{x}))$ with matrices.' }, { kind: 'order' });
    }
    var n = kind === 'general3' ? 3 : 2, m = kind === 'general3' ? 2 : 2, p = 2;
    var A = randM(R, m, n, -3, 4), B = randM(R, p, m, -3, 4), BA = mm(B, A);
    return test({ q: '$T: \\mathbb{R}^{' + n + '} \\to \\mathbb{R}^{' + m + '}$ has matrix $A = ' + tex(A) + '$ and $S: \\mathbb{R}^{' + m + '} \\to \\mathbb{R}^{' + p + '}$ has matrix $B = ' + tex(B) + '$. Find the standard matrix of $S \\circ T$ (first $T$, then $S$).', a: aM(BA),
      steps: ['$(S \\circ T)(\\mathbf{x}) = S(T(\\mathbf{x})) = B(A\\mathbf{x}) = (BA)\\mathbf{x}$.', '$BA = ' + tex(BA) + '$ (a $' + p + ' \\times ' + n + '$ matrix, from $\\mathbb{R}^{' + n + '}$ to $\\mathbb{R}^{' + p + '}$).'].concat(n === m ? ['Note $AB = ' + tex(mm(A, B)) + '$ is a different map.'] : ['Note $AB$ ' + (n === p ? 'is a different map.' : 'is not even defined here.')]),
      hint: 'First map on the right: the product is $BA$.' }, { kind: 'general', A: A, B: B });
  });

  // ---------------------------------------------------------------- la.one-to-one-onto
  G('la.one-to-one-onto', function (R, ctx) {
    var kind = by(ctx, R.pick(['matrix', 'shape']), R.pick(['matrix', 'matrix', 'shape']), R.pick(['matrix', 'formula', 'shape']));
    if (kind === 'shape') {
      var n = R.int(2, 5), m = R.intNot(2, 5, n), ask = R.coin() ? 'one' : 'onto';
      var possible = ask === 'one' ? n <= m : n >= m;
      return test({ q: '$T: \\mathbb{R}^{' + n + '} \\to \\mathbb{R}^{' + m + '}$ is linear. Is it <b>possible</b> for $T$ to be ' + (ask === 'one' ? 'one-to-one' : 'onto') + '?', a: yn(possible),
        steps: ['The standard matrix $A$ is $' + m + ' \\times ' + n + '$, so it has at most ' + Math.min(m, n) + ' pivots.',
          ask === 'one' ? 'One-to-one needs a pivot in every column (' + n + ' pivots). ' + (possible ? 'That is possible, for example with $A$ having independent columns: <b>yes</b>.' : 'With only ' + m + ' rows that is impossible: <b>no</b>.') :
            'Onto needs a pivot in every row (' + m + ' pivots). ' + (possible ? 'That is possible: <b>yes</b>.' : 'With only ' + n + ' columns that is impossible: <b>no</b>.')],
        hint: 'One-to-one: a pivot in every column. Onto: a pivot in every row. How many pivots can an $' + m + ' \\times ' + n + '$ matrix have?' }, { kind: 'shape', n: n, m: m, ask: ask, possible: possible });
    }
    var sh = R.pick([[2, 3], [3, 2], [3, 3], [2, 2]]), A, full = R.coin();
    if (sh[0] === sh[1]) { if (full) { do { A = randM(R, sh[0], sh[1], -4, 5); } while (det(A).isZero()); } else { var B = randM(R, sh[0] - 1, sh[1], -4, 5); A = B.concat([vsc(R.nz(-2, 2), B[0])]); if (sh[0] === 3) A[2] = vadd(A[2], vsc(R.int(-2, 2), B[1])); A = R.shuffle(A); } }
    else { do { A = randM(R, sh[0], sh[1], -4, 5); } while (full ? rank(A) < Math.min(sh[0], sh[1]) : false); if (!full) { if (sh[0] < sh[1]) A[1] = vsc(R.nz(-2, 2), A[0]); else { var c0 = col(A, 0); A.forEach(function (r, i) { r[1] = c0[i].mul(-2); }); } } }
    var rk = rank(A), one = rk === sh[1], onto = rk === sh[0], E = elim(A, { mode: 'echelon' }), names = xs(sh[1]);
    var intro = kind === 'formula' ? 'Let $$T(' + names.join(', ') + ') = ' + fmtMap(A, names) + '.$$' : 'Let $T(\\mathbf{x}) = A\\mathbf{x}$ with $A = ' + tex(A) + '$.';
    var st = (kind === 'formula' ? ['The standard matrix is $A = ' + tex(A) + '$.'] : []).concat(['Row reduce $A$ and count pivots.']).concat(stepTexts(E, 0));
    st.push(rk + ' pivot' + (rk > 1 ? 's' : '') + '. One-to-one needs a pivot in each of the ' + sh[1] + ' columns: <b>' + (one ? 'yes' : 'no') + '</b>. Onto $\\mathbb{R}^{' + sh[0] + '}$ needs a pivot in each of the ' + sh[0] + ' rows: <b>' + (onto ? 'yes' : 'no') + '</b>.');
    return test({ q: intro + ' Is $T$ one-to-one? Is $T$ onto $\\mathbb{R}^{' + sh[0] + '}$?', a: { t: 'multi', parts: [{ label: 'One-to-one?', a: yn(one) }, { label: 'Onto?', a: yn(onto) }] }, steps: st,
      hint: 'Row reduce. Pivot in every column means one-to-one; pivot in every row means onto.' }, { kind: 'matrix', A: A, one: one, onto: onto });
  });


  // ================================================================ Unit 4: Determinants

  function minor(A, i, j) { return A.filter(function (_, r) { return r !== i; }).map(function (r) { return r.filter(function (_, c) { return c !== j; }); }); }
  function det2Line(Mx) { return pp(Mx[0][0], Mx[1][1]) + ' - ' + pp(Mx[0][1], Mx[1][0]); }
  function signTex(i, j) { return (i + j) % 2 ? '-' : '+'; }
  /* cofactor expansion of a 3x3 (or 4x4 with a sparse line) along row/column `line` ('r', k) or ('c', k), as steps */
  function expandSteps(A, along, k) {
    var n = A.length, terms = [], lines = [], total = q(0);
    for (var t = 0; t < n; t++) {
      var i = along === 'r' ? k : t, j = along === 'r' ? t : k, a = A[i][j];
      if (a.isZero()) continue;
      var Mn = minor(A, i, j), dm = det(Mn), sgn = (i + j) % 2 ? -1 : 1, contrib = a.mul(dm).mul(sgn);
      total = total.add(contrib);
      terms.push({ i: i, j: j, a: a, Mn: Mn, dm: dm, sgn: sgn, c: contrib });
    }
    var head = 'Expand along ' + (along === 'r' ? 'row ' : 'column ') + (k + 1) + '. The signs follow the checkerboard $' + T.mat(n === 3 ? [['+', '-', '+'], ['-', '+', '-'], ['+', '-', '+']] : [['+', '-', '+', '-'], ['-', '+', '-', '+'], ['+', '-', '+', '-'], ['-', '+', '-', '+']]) + '$, so entry $(i, j)$ gets the sign $(-1)^{i+j}$.';
    lines.push(head + (terms.length < n ? ' Zero entries contribute nothing, so skip them.' : ''));
    terms.forEach(function (t) {
      var dl = t.Mn.length === 2 ? det2Line(t.Mn) + ' = ' + N(t.dm) : N(t.dm), note = t.Mn.length === 2 ? '' : ' (expanding this $3 \\times 3$ minor the same way)';
      lines.push('Entry $a_{' + (t.i + 1) + (t.j + 1) + '} = ' + N(t.a) + '$ with sign $' + signTex(t.i, t.j) + '$: its minor is $' + T.mat(t.Mn, 'vmatrix') + ' = ' + dl + '$' + note + ', so it contributes $' + (t.sgn < 0 ? '-' : '+') + pp(t.a, t.dm) + ' = ' + N(t.c) + '$.');
    });
    lines.push('Add: $\\det A = ' + (terms.length ? terms.map(function (t, x) { return x === 0 ? N(t.c) : T.signed(t.c).trim(); }).join(' ').replace(/^\s+/, '') : '0') + ' = ' + N(total) + '$.');
    return { lines: lines, total: total };
  }
  function bestLine(A) { // the row or column with the most zeros
    var n = A.length, best = ['r', 0, -1];
    for (var k = 0; k < n; k++) {
      var zr = A[k].filter(function (x) { return x.isZero(); }).length, zc = A.filter(function (r) { return r[k].isZero(); }).length;
      if (zr > best[2]) best = ['r', k, zr]; if (zc > best[2]) best = ['c', k, zc];
    }
    return best;
  }

  // ---------------------------------------------------------------- la.cofactor-expansion
  G('la.cofactor-expansion', function (R, ctx) {
    var kind = by(ctx, R.pick(['det3', 'det3', 'cofactor']), R.pick(['det3', 'cofactor', 'det3z']), R.pick(['det4', 'det3z', 'cofactor']));
    if (kind === 'cofactor') {
      var A = randM(R, 3, 3, -5, 6), i = R.int(0, 2), j = R.int(0, 2), Mn = minor(A, i, j), dm = det(Mn), sg = (i + j) % 2 ? -1 : 1;
      if (sg > 0 && ctx.level === 1) { j = (j + 1) % 3; Mn = minor(A, i, j); dm = det(Mn); sg = (i + j) % 2 ? -1 : 1; }
      return test({ q: 'For $A = ' + tex(A) + '$, find the cofactor $C_{' + (i + 1) + (j + 1) + '}$.', a: aN(dm.mul(sg)),
        steps: ['$C_{ij} = (-1)^{i+j}M_{ij}$, where $M_{ij}$ is the determinant left after deleting row $i$ and column $j$.', 'Delete row ' + (i + 1) + ' and column ' + (j + 1) + ': $M_{' + (i + 1) + (j + 1) + '} = ' + T.mat(Mn, 'vmatrix') + ' = ' + det2Line(Mn) + ' = ' + N(dm) + '$.', 'The sign is $(-1)^{' + (i + 1) + '+' + (j + 1) + '} = ' + sg + '$, so $C_{' + (i + 1) + (j + 1) + '} = ' + N(dm.mul(sg)) + '$.'],
        hint: 'Find the minor, then attach the checkerboard sign $(-1)^{i+j}$.' }, { kind: 'cofactor', A: A, i: i, j: j });
    }
    var n = kind === 'det4' ? 4 : 3, A2 = randM(R, n, n, -4, 5);
    if (kind === 'det3z' || kind === 'det4') { // put zeros in a line
      var asRow = R.coin(), k = R.int(0, n - 1), keep = R.int(0, n - 1);
      for (var t = 0; t < n; t++) if (t !== keep) { if (asRow) A2[k][t] = q(0); else A2[t][k] = q(0); }
      if (n === 4) { var k2 = (k + 1) % n; for (var t2 = 0; t2 < n; t2++) if (t2 !== keep && R.chance(0.5)) { if (asRow) A2[k2][t2] = q(0); else A2[t2][k2] = q(0); } }
    }
    var bl = bestLine(A2), ex = expandSteps(A2, bl[0], bl[1]);
    var st = ex.lines.slice();
    st.push('Check another way: row reducing (keeping track of swaps and scalings) gives the same $\\det A = ' + N(det(A2)) + '$.');
    return test({ q: 'Find $\\det A$ for $$A = ' + tex(A2) + '$$', a: aN(ex.total), steps: st,
      hint: 'Expand along the row or column with the most zeros, and use the checkerboard of signs.' }, { kind: 'det', A: A2 });
  });

  // ---------------------------------------------------------------- la.determinant-properties
  G('la.determinant-properties', function (R, ctx) {
    var kind = by(ctx, R.pick(['rule', 'rowop']), R.pick(['rule', 'rowop', 'rule2']), R.pick(['rule2', 'rowop', 'sumtrap']));
    var n = R.pick([2, 3, 4]), d = R.nz(-5, 5);
    if (kind === 'rule' || kind === 'rule2') {
      var e = R.nz(-4, 4), k = R.pick([2, 3, -1, -2]), opts = kind === 'rule' ? ['kA', 'AT', 'Ainv', 'A2', 'AB'] : ['kA', 'Ainv', 'ABinv', 'sim', 'kAinv', 'ATB'], w = R.pick(opts), v, ex, st;
      if (w === 'kA') { v = q(k).pow(n).mul(d); ex = 'det(' + k + 'A)'; st = ['Multiplying $A$ by $' + k + '$ multiplies <b>every one</b> of its ' + n + ' rows by $' + k + '$, and each row scaling multiplies the determinant by $' + k + '$.', '$\\det(' + T.coef(k, 'A') + ') = ' + T.pow(k, n) + '\\det A = ' + N(q(k).pow(n)) + T.cdot() + P(d) + ' = ' + N(v) + '$.']; }
      else if (w === 'AT') { v = q(d); st = ['A matrix and its transpose have the same determinant: $\\det A^{T} = \\det A = ' + N(d) + '$.']; }
      else if (w === 'Ainv') { v = q(1).div(d); st = ['$AA^{-1} = I$, so $\\det A \\cdot \\det A^{-1} = \\det I = 1$.', '$\\det A^{-1} = \\dfrac{1}{' + N(d) + '} = ' + N(v) + '$.']; }
      else if (w === 'A2') { v = q(d * d); st = ['$\\det(A^{2}) = \\det(AA) = \\det A\\cdot\\det A = ' + pp(d, d) + ' = ' + N(v) + '$.']; }
      else if (w === 'AB') { v = q(d * e); st = ['The determinant is multiplicative: $\\det(AB) = \\det A\\cdot\\det B = ' + pp(d, e) + ' = ' + N(v) + '$.']; }
      else if (w === 'ABinv') { v = q(d).div(e); st = ['$\\det(AB^{-1}) = \\det A\\cdot\\det B^{-1} = \\det A\\cdot\\dfrac{1}{\\det B} = \\dfrac{' + N(d) + '}{' + N(e) + '} = ' + N(v) + '$.']; }
      else if (w === 'sim') { v = q(d); st = ['$\\det(B^{-1}AB) = \\det B^{-1}\\cdot\\det A\\cdot\\det B = \\dfrac{1}{\\det B}\\cdot\\det A\\cdot\\det B = \\det A = ' + N(d) + '$.']; }
      else if (w === 'kAinv') { v = q(1).div(q(k).pow(n).mul(d)); st = ['$\\det(' + T.coef(k, 'A') + ') = ' + T.pow(k, n) + '\\det A = ' + N(q(k).pow(n).mul(d)) + '$.', 'The inverse has the reciprocal determinant: $' + N(v) + '$.']; }
      else { v = q(d * e); st = ['$\\det(A^{T}B) = \\det A^{T}\\cdot\\det B = \\det A\\cdot\\det B = ' + pp(d, e) + ' = ' + N(v) + '$.']; }
      var exprs = { kA: '\\det(' + T.coef(k, 'A') + ')', AT: '\\det(A^{T})', Ainv: '\\det(A^{-1})', A2: '\\det(A^{2})', AB: '\\det(AB)', ABinv: '\\det(AB^{-1})', sim: '\\det(B^{-1}AB)', kAinv: '\\det\\left((' + T.coef(k, 'A') + ')^{-1}\\right)', ATB: '\\det(A^{T}B)' };
      var needsB = /B/.test(exprs[w]);
      return test({ q: '$A' + (needsB ? '$ and $B$ are' : '$ is') + ' $' + n + ' \\times ' + n + '$ with $\\det A = ' + N(d) + '$' + (needsB ? ' and $\\det B = ' + N(e) + '$' : '') + '. Find $' + exprs[w] + '$.', a: aN(v), steps: st,
        hint: w === 'kA' || w === 'kAinv' ? 'Scaling the whole matrix scales each of the ' + n + ' rows.' : 'Use $\\det(AB) = \\det A\\,\\det B$ and $\\det A^{T} = \\det A$.' }, { kind: 'rule', w: w, n: n, d: d, e: e, k: k, v: v });
    }
    if (kind === 'rowop') {
      var ops = [], f = q(1), descs = [];
      var nops = by(ctx, 1, 2, 3), nn = 3;
      for (var t = 0; t < nops; t++) {
        var ty = R.pick(['swap', 'scale', 'add']), i = R.int(0, 2), j = R.intNot(0, 2, i), c = R.pick([2, 3, -2, 5, -1]);
        if (ty === 'swap') { f = f.neg(); descs.push(['swap rows ' + (i + 1) + ' and ' + (j + 1), 'a swap multiplies the determinant by $-1$']); }
        else if (ty === 'scale') { f = f.mul(c); descs.push(['multiply row ' + (i + 1) + ' by $' + c + '$', 'scaling a row multiplies the determinant by $' + c + '$']); }
        else { descs.push(['add $' + c + '$ times row ' + (j + 1) + ' to row ' + (i + 1), 'adding a multiple of one row to another leaves the determinant unchanged']); }
      }
      var v2 = f.mul(d);
      return test({ q: '$A$ is $3 \\times 3$ with $\\det A = ' + N(d) + '$. $B$ is obtained from $A$ by these row operations: ' + lst(descs.map(function (x) { return x[0]; })) + '. Find $\\det B$.', a: aN(v2),
        steps: descs.map(function (x) { return 'To ' + x[0] + ': ' + x[1] + '.'; }).concat(['Total factor $' + N(f) + '$, so $\\det B = ' + pp(f, d) + ' = ' + N(v2) + '$.']),
        hint: 'Swap: times $-1$. Scale a row by $c$: times $c$. Add a multiple of a row: no change.' }, { kind: 'rowop', d: d, f: f });
    }
    var A = randM(R, 2, 2, -4, 5), B = randM(R, 2, 2, -4, 5), dA = det(A), dB = det(B), dS = det(add(A, B)), eq = dS.eq(dA.add(dB));
    return test({ q: 'True or false: $\\det(A + B) = \\det A + \\det B$ for $A = ' + tex(A) + '$ and $B = ' + tex(B) + '$.', a: aTF(eq),
      steps: ['$\\det A = ' + N(dA) + '$ and $\\det B = ' + N(dB) + '$, so $\\det A + \\det B = ' + N(dA.add(dB)) + '$.', '$A + B = ' + tex(add(A, B)) + '$, so $\\det(A + B) = ' + N(dS) + '$.', eq ? 'They happen to agree here: <b>true</b> for these matrices, but it fails in general.' : 'They differ: <b>false</b>. The determinant respects products, not sums.'],
      hint: 'Compute both sides.' }, { kind: 'sumtrap', A: A, B: B, eq: eq });
  });

  // ---------------------------------------------------------------- la.determinant-geometry
  G('la.determinant-geometry', function (R, ctx) {
    var kind = by(ctx, R.pick(['area', 'image']), R.pick(['area', 'triangle', 'image', 'volume']), R.pick(['triangle', 'volume', 'image', 'orient']));
    if (kind === 'area') {
      var u = randV(R, 2, -5, 6), v = randV(R, 2, -5, 6);
      while (det(cols([u, v])).isZero()) { if (u.every(function (x) { return x.isZero(); })) u = randV(R, 2, -5, 6); v = randV(R, 2, -5, 6); } // a zero u would never do
      var d = det(cols([u, v]));
      return test({ q: 'Find the area of the parallelogram with sides $\\mathbf{u} = ' + texv(u) + '$ and $\\mathbf{v} = ' + texv(v) + '$ (corners at $\\mathbf{0}$, $\\mathbf{u}$, $\\mathbf{v}$, $\\mathbf{u} + \\mathbf{v}$).', a: aN(d.abs()),
        steps: ['The area is $|\\det[\\,\\mathbf{u}\\ \\mathbf{v}\\,]|$.', '$\\det' + tex(cols([u, v])) + ' = ' + pp(u[0], v[1]) + ' - ' + pp(v[0], u[1]) + ' = ' + N(d) + '$.', 'Area $= |' + N(d) + '| = ' + N(d.abs()) + '$.' + (d.sign() < 0 ? ' (The negative sign only means $\\mathbf{v}$ is clockwise from $\\mathbf{u}$.)' : '')],
        hint: 'Put the two vectors in the columns of a matrix and take the absolute value of its determinant.' }, { kind: 'area', u: u, v: v });
    }
    if (kind === 'triangle') {
      var P0 = randV(R, 2, -4, 4), P1 = randV(R, 2, -4, 5), P2 = randV(R, 2, -4, 5), a = vsub(P1, P0), b = vsub(P2, P0);
      while (det(cols([a, b])).isZero()) { if (a.every(function (x) { return x.isZero(); })) { P1 = randV(R, 2, -4, 5); a = vsub(P1, P0); } P2 = randV(R, 2, -4, 5); b = vsub(P2, P0); } // nor a zero edge a
      var d2 = det(cols([a, b])), area = d2.abs().div(2);
      return test({ q: 'Find the area of the triangle with vertices $' + texr(P0) + '$, $' + texr(P1) + '$ and $' + texr(P2) + '$.', a: aN(area),
        steps: ['Use two edge vectors from the first vertex: $\\mathbf{a} = ' + texr(a) + '$ and $\\mathbf{b} = ' + texr(b) + '$.', 'They span a parallelogram of area $|\\det[\\,\\mathbf{a}\\ \\mathbf{b}\\,]| = |' + pp(a[0], b[1]) + ' - ' + pp(b[0], a[1]) + '| = ' + N(d2.abs()) + '$.', 'The triangle is half of it: $' + N(area) + '$.'],
        hint: 'Subtract one vertex from the other two to get edge vectors. The triangle is half the parallelogram.' }, { kind: 'triangle', P: [P0, P1, P2] });
    }
    if (kind === 'image') {
      var A; do { A = randM(R, 2, 2, -4, 5); } while (det(A).isZero());
      var shape = R.pick([['the unit square', 1], ['a rectangle of area ' + 6, 6], ['a disk of radius 1', 'pi'], ['a triangle of area ' + 5, 5]]), dA = det(A);
      var ansV2 = shape[1] === 'pi' ? (dA.abs().eq(1) ? 'pi' : dA.abs().toPlain() + '*pi') : dA.abs().mul(shape[1]).toPlain();
      var areaTex = shape[1] === 'pi' ? '\\pi' : N(shape[1]);
      return test({ q: 'The map $\\mathbf{x} \\mapsto A\\mathbf{x}$ with $A = ' + tex(A) + '$ is applied to ' + shape[0] + '. What is the area of the image?', a: { t: 'num', v: ansV2 },
        steps: ['A linear map multiplies every area by $|\\det A|$.', '$\\det A = ' + det2Line(A) + ' = ' + N(dA) + '$.', 'New area $= |' + N(dA) + '|' + T.cdot() + areaTex + ' = ' + (shape[1] === 'pi' ? T.coef(dA.abs(), '\\pi') : N(dA.abs().mul(shape[1]))) + '$.'],
        hint: 'Area scales by the absolute value of the determinant.' }, { kind: 'image', A: A, base: shape[1] });
    }
    if (kind === 'orient') {
      var A2; do { A2 = randM(R, 2, 2, -4, 5); } while (det(A2).isZero());
      var neg = det(A2).sign() < 0;
      return test({ q: 'Does the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ with $A = ' + tex(A2) + '$ preserve or reverse orientation (the clockwise or counterclockwise order of shapes)?', a: { t: 'mc', choices: ['Preserves orientation', 'Reverses orientation', 'Neither; it squashes the plane flat'], v: neg ? 1 : 0, keep: true },
        steps: ['$\\det A = ' + det2Line(A2) + ' = ' + N(det(A2)) + '$.', neg ? 'Negative determinant: the map flips the plane, like a mirror, so it <b>reverses</b> orientation.' : 'Positive determinant: no flip, so it <b>preserves</b> orientation.'],
        hint: 'Look at the sign of $\\det A$.' }, { kind: 'orient', A: A2, neg: neg });
    }
    var Vm; do { Vm = randM(R, 3, 3, -3, 4); } while (det(Vm).isZero());
    var vs = [col(Vm, 0), col(Vm, 1), col(Vm, 2)], dv = det(Vm), bl = bestLine(Vm), ex = expandSteps(Vm, bl[0], bl[1]);
    return test({ q: 'Find the volume of the parallelepiped with edges $' + texv(vs[0]) + '$, $' + texv(vs[1]) + '$ and $' + texv(vs[2]) + '$ from the origin.', a: aN(dv.abs()),
      steps: ['The volume is $|\\det A|$, where $A = ' + tex(Vm) + '$ has the edges as columns.'].concat(ex.lines).concat(['Volume $= |' + N(dv) + '| = ' + N(dv.abs()) + '$.']),
      hint: 'Put the three edge vectors in the columns of a $3 \\times 3$ matrix and take $|\\det|$.' }, { kind: 'volume', A: Vm });
  });

  // ---------------------------------------------------------------- la.cramers-rule
  G('la.cramers-rule', function (R, ctx) {
    var kind = by(ctx, R.pick(['cramer2', 'adj2']), R.pick(['cramer2', 'adj2', 'invEntry']), R.pick(['cramer3', 'invEntry', 'cramer2']));
    if (kind === 'cramer2') {
      var A; do { A = randM(R, 2, 2, -5, 6); } while (det(A).isZero() || det(A).abs().gt(15));
      var b = randV(R, 2, -8, 8), dA = det(A), A1 = [[b[0], A[0][1]], [b[1], A[1][1]]], A2 = [[A[0][0], b[0]], [A[1][0], b[1]]], x = det(A1).div(dA), y = det(A2).div(dA);
      return test({ q: 'Use Cramer\'s rule to solve $$' + systemTex(A, b, ['x', 'y']) + '$$ Give $(x, y)$.', a: aV([x, y], ['x', 'y']),
        steps: ['$\\det A = ' + det2Line(A) + ' = ' + N(dA) + '$.', 'Replace column 1 with $\\mathbf{b}$: $\\det A_{1} = ' + T.mat(A1, 'vmatrix') + ' = ' + det2Line(A1) + ' = ' + N(det(A1)) + '$.', 'Replace column 2 with $\\mathbf{b}$: $\\det A_{2} = ' + T.mat(A2, 'vmatrix') + ' = ' + det2Line(A2) + ' = ' + N(det(A2)) + '$.',
          '$x = \\dfrac{\\det A_{1}}{\\det A} = ' + T.dfrac(det(A1), dA) + '$ and $y = \\dfrac{\\det A_{2}}{\\det A} = ' + T.dfrac(det(A2), dA) + '$.', 'Check in equation 1: $' + subsTex(A[0], [x, y]) + ' = ' + N(dot(A[0], [x, y])) + '$.'],
        hint: 'For $x$, swap the $x$-column of $A$ for $\\mathbf{b}$ and divide that determinant by $\\det A$.' }, { kind: 'cramer', A: A, b: b });
    }
    if (kind === 'cramer3') {
      var B; do { B = randM(R, 3, 3, -3, 4); } while (det(B).isZero() || det(B).abs().gt(30));
      var xv = randV(R, 3, -3, 3), bb = mv(B, xv), j = R.int(0, 2), Bj = B.map(function (r, i) { return r.map(function (v, c) { return c === j ? bb[i] : v; }); });
      var dB = det(B), dBj = det(Bj), names = ['x_{1}', 'x_{2}', 'x_{3}'];
      return test({ q: 'Use Cramer\'s rule to find only $' + names[j] + '$ in the system $$' + systemTex(B, bb, names) + '$$', a: aN(dBj.div(dB)),
        steps: ['$' + names[j] + ' = \\dfrac{\\det A_{' + (j + 1) + '}}{\\det A}$, where $A_{' + (j + 1) + '}$ is $A$ with column ' + (j + 1) + ' replaced by $\\mathbf{b}$.', '$\\det A = ' + N(dB) + '$ (cofactor expansion).', '$A_{' + (j + 1) + '} = ' + tex(Bj) + '$ has $\\det A_{' + (j + 1) + '} = ' + N(dBj) + '$.', '$' + names[j] + ' = ' + T.dfrac(dBj, dB) + '$.'],
        hint: 'Replace only column ' + (j + 1) + ' with the right-hand side.' }, { kind: 'cramer3', A: B, b: bb, j: j });
    }
    if (kind === 'adj2') {
      var C; do { C = randM(R, 2, 2, -6, 7); } while (det(C).isZero());
      var adj = [[C[1][1], C[0][1].neg()], [C[1][0].neg(), C[0][0]]];
      return test({ q: 'Find the adjugate $\\operatorname{adj} A$ of $A = ' + tex(C) + '$.', a: aM(adj),
        steps: ['The cofactors are $C_{11} = ' + N(C[1][1]) + '$, $C_{12} = ' + N(C[1][0].neg()) + '$, $C_{21} = ' + N(C[0][1].neg()) + '$, $C_{22} = ' + N(C[0][0]) + '$.', 'The adjugate is the <b>transpose</b> of the cofactor matrix: $\\operatorname{adj} A = ' + tex(adj) + '$.', 'Check: $A\\,\\operatorname{adj} A = ' + tex(mm(C, adj)) + ' = (\\det A) I$ with $\\det A = ' + N(det(C)) + '$.'],
        hint: 'For a $2 \\times 2$ matrix: swap the diagonal entries and negate the other two.' }, { kind: 'adj', A: C, adj: adj });
    }
    var D3; do { D3 = randM(R, 3, 3, -3, 4); } while (det(D3).isZero() || det(D3).abs().gt(20));
    var i2 = R.int(0, 2), j2 = R.int(0, 2), Cji = det(minor(D3, j2, i2)).mul((i2 + j2) % 2 ? -1 : 1), dD = det(D3), entry = Cji.div(dD);
    return test({ q: 'For $A = ' + tex(D3) + '$ (with $\\det A = ' + N(dD) + '$), find the entry of $A^{-1}$ in row ' + (i2 + 1) + ', column ' + (j2 + 1) + '.', a: aN(entry),
      steps: ['$A^{-1} = \\dfrac{1}{\\det A}\\operatorname{adj} A$, and $\\operatorname{adj} A$ is the transpose of the cofactor matrix, so $(A^{-1})_{' + (i2 + 1) + (j2 + 1) + '} = \\dfrac{C_{' + (j2 + 1) + (i2 + 1) + '}}{\\det A}$ (note the swapped indices).',
        '$C_{' + (j2 + 1) + (i2 + 1) + '} = (-1)^{' + (j2 + 1) + '+' + (i2 + 1) + '}' + T.mat(minor(D3, j2, i2), 'vmatrix') + ' = ' + N(Cji) + '$.', 'So the entry is $' + T.dfrac(Cji, dD) + '$.'],
      hint: 'Use the cofactor $C_{ji}$ (indices swapped), divided by $\\det A$.' }, { kind: 'invEntry', A: D3, i: i2, j: j2 });
  });


  // ================================================================ Unit 5: Vector Spaces

  // ---------------------------------------------------------------- la.light-proofs
  function nonzeroM(A) { return A.some(function (r) { return !isZeroV(r); }); }
  G('la.light-proofs', function (R, ctx) {
    var kind = by(ctx, R.pick(['example', 'counter', 'reason']), R.pick(['counter', 'reason', 'logic']), R.pick(['reason', 'counter', 'logic']));
    if (kind === 'example') {
      var items = [
        ['A student checks that $(AB)^{T} = B^{T}A^{T}$ for one pair of $2 \\times 2$ matrices. This proves the rule for all $2 \\times 2$ matrices.', false, 'One example can never prove a statement about <b>all</b> matrices; there are infinitely many other pairs. A proof must work for arbitrary entries (or use definitions and earlier results).'],
        ['To show that "$AB = BA$ for all square matrices" is false, one pair of matrices with $AB \\neq BA$ is enough.', true, 'A "for all" claim is false as soon as one case fails. A single counterexample disproves it.'],
        ['A student finds three vectors $\\mathbf{u}$ in a set $H$ with $2\\mathbf{u}$ also in $H$. This proves $H$ is closed under scalar multiplication.', false, 'Closure must hold for <b>every</b> vector in $H$ and <b>every</b> scalar, not just a few. Checking cases is evidence, not proof.'],
        ['Proving "if $\\mathbf{u}$ and $\\mathbf{v}$ are in $\\operatorname{Nul} A$, then $\\mathbf{u} + \\mathbf{v}$ is in $\\operatorname{Nul} A$" can start with "Let $\\mathbf{u}$ and $\\mathbf{v}$ be any vectors with $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$."', true, 'That is the right start: name arbitrary objects that satisfy the hypothesis, then use only what the hypothesis and the definitions give you.'],
        ['If a statement is true for $\\mathbf{x} = \\mathbf{e}_{1}$, $\\mathbf{e}_{2}$ and $\\mathbf{e}_{3}$, it must be true for every $\\mathbf{x}$ in $\\mathbb{R}^{3}$.', false, 'Only properties that respect sums and multiples (like linearity) carry over from a basis. In general, three checks prove nothing about the others. For example, "$x_{1}x_{2} = 0$" holds for $\\mathbf{e}_{1}, \\mathbf{e}_{2}, \\mathbf{e}_{3}$ but not for $(1, 1, 0)$.']
      ];
      var it = R.pick(items);
      return test({ q: 'True or false: ' + it[0], a: aTF(it[1]), steps: [it[2], 'So the statement is <b>' + (it[1] ? 'true' : 'false') + '</b>.'], hint: 'Is the claim about one case or about all cases?' }, { kind: 'example' });
    }
    if (kind === 'counter') {
      var claim = R.int(0, 2), good, bads = [], text, why;
      function pair(A, B) { return '$A = ' + tex(A) + '$, $B = ' + tex(B) + '$'; }
      if (claim === 0) { // AB = 0 implies A = 0 or B = 0
        var a = R.nz(-3, 3), b = R.nz(-3, 3), A0 = qm([[a, 0], [b, 0]]), B0 = qm([[0, 0], [R.nz(-3, 3), R.nz(-3, 3)]]);
        good = pair(A0, B0); text = 'If $AB = 0$, then $A = 0$ or $B = 0$.';
        var A1 = qm([[R.nz(1, 3), 0], [0, R.nz(1, 3)]]), B1 = qm([[R.nz(1, 3), R.int(0, 2)], [0, R.nz(1, 3)]]); bads.push(pair(A1, B1));
        bads.push(pair(qm([[0, 0], [0, 0]]), qm([[R.nz(-3, 3), 1], [2, R.nz(-3, 3)]])));
        var A3 = qm([[1, R.nz(-2, 2)], [0, 1]]), B3 = qm([[R.nz(-2, 2), 0], [1, 1]]); if (!nonzeroM(mm(A3, B3))) A3 = eye(2); bads.push(pair(A3, B3));
        why = 'For the first pair, $AB = ' + tex(mm(A0, B0)) + '$ although neither matrix is $0$. The other pairs either have $AB \\neq 0$ or have one matrix equal to $0$, so they agree with the claim.';
      } else if (claim === 1) { // AB = BA
        var C; do { C = randM(R, 2, 2, -3, 3); } while (isTrivialM(C) || eqM(mm(C, C.map(function (r) { return r.slice().reverse(); })), mm(C.map(function (r) { return r.slice().reverse(); }), C)));
        var D = C.map(function (r) { return r.slice().reverse(); }); if (eqM(mm(C, D), mm(D, C))) D = qm([[1, 1], [0, 1]]);
        if (eqM(mm(C, D), mm(D, C))) { C = qm([[1, 2], [0, 1]]); D = qm([[1, 0], [3, 1]]); }
        good = pair(C, D); text = '$AB = BA$ for all $2 \\times 2$ matrices $A$ and $B$.';
        bads.push(pair(C, eye(2))); bads.push(pair(C, mm(C, C))); bads.push(pair(diag([R.nz(-3, 3), R.nz(-3, 3)]), diag([R.nz(-3, 3), R.nz(-3, 3)])));
        why = 'For the first pair, $AB = ' + tex(mm(C, D)) + '$ but $BA = ' + tex(mm(D, C)) + '$. The other pairs commute: $I$ commutes with everything, $A$ commutes with $A^{2}$, and diagonal matrices commute with each other.';
      } else { // det(A + B) = det A + det B
        var E1, F1; do { E1 = randM(R, 2, 2, -3, 3); F1 = randM(R, 2, 2, -3, 3); } while (det(add(E1, F1)).eq(det(E1).add(det(F1))));
        good = pair(E1, F1); text = '$\\det(A + B) = \\det A + \\det B$ for all $2 \\times 2$ matrices.';
        var Z = zeros(2, 2), G1 = randM(R, 2, 2, -3, 3); bads.push(pair(G1, Z));
        var H1 = qm([[R.nz(1, 3), 0], [0, 0]]), H2 = qm([[0, 0], [0, R.nz(1, 3)]]);
        var H3 = qm([[R.nz(1, 3), 0], [0, 0]]), H4 = qm([[R.nz(1, 3), 0], [0, 0]]); // both singular, sum singular
        bads.push(pair(H3, H4));
        var K1 = randM(R, 2, 2, -2, 3); bads.push(pair(K1, sc(-1, K1).map(function (r) { return r; })));
        if (det(add(K1, sc(-1, K1))).eq(det(K1).add(det(sc(-1, K1))))) { } else bads.pop();
        if (bads.length < 3) bads.push(pair(Z, randM(R, 2, 2, -3, 3)));
        why = 'For the first pair, $\\det A + \\det B = ' + N(det(E1).add(det(F1))) + '$ but $\\det(A + B) = ' + N(det(add(E1, F1))) + '$. The other pairs happen to satisfy the equation, so they do not disprove it.';
      }
      var ch = uniqStr([good].concat(bads)).slice(0, 4);
      return test({ q: 'Claim: ' + text + ' Which pair is a <b>counterexample</b> to the claim?', a: { t: 'mc', choices: ch, v: 0 }, steps: ['A counterexample must satisfy the "if" part (or be any case, for a "for all" claim) and make the conclusion fail.', why],
        hint: 'Test each pair: does the claim fail for it?' }, { kind: 'counter', claim: claim });
    }
    if (kind === 'reason') {
      var proofs = [
        { stmt: 'If $\\mathbf{u}$ and $\\mathbf{v}$ are solutions of $A\\mathbf{x} = \\mathbf{0}$, then so is $\\mathbf{u} + \\mathbf{v}$.',
          lines: [['$A(\\mathbf{u} + \\mathbf{v}) = A\\mathbf{u} + A\\mathbf{v}$', 'Matrix-vector multiplication is linear: $A(\\mathbf{x} + c\\mathbf{y}) = A\\mathbf{x} + cA\\mathbf{y}$'], ['$A\\mathbf{u} + A\\mathbf{v} = \\mathbf{0} + \\mathbf{0}$', '$\\mathbf{u}$ and $\\mathbf{v}$ are solutions (the hypothesis)'], ['$\\mathbf{0} + \\mathbf{0} = \\mathbf{0}$', 'Adding the zero vector changes nothing']] },
        { stmt: 'If $\\mathbf{p}$ and $\\mathbf{q}$ both solve $A\\mathbf{x} = \\mathbf{b}$, then $\\mathbf{p} - \\mathbf{q}$ solves $A\\mathbf{x} = \\mathbf{0}$.',
          lines: [['$A(\\mathbf{p} - \\mathbf{q}) = A\\mathbf{p} - A\\mathbf{q}$', 'Matrix-vector multiplication is linear: $A(\\mathbf{x} + c\\mathbf{y}) = A\\mathbf{x} + cA\\mathbf{y}$'], ['$A\\mathbf{p} - A\\mathbf{q} = \\mathbf{b} - \\mathbf{b}$', '$\\mathbf{p}$ and $\\mathbf{q}$ are solutions (the hypothesis)'], ['$\\mathbf{b} - \\mathbf{b} = \\mathbf{0}$', 'A vector minus itself is the zero vector']] },
        { stmt: 'If $A$ is invertible, then $A\\mathbf{x} = \\mathbf{0}$ has only the solution $\\mathbf{x} = \\mathbf{0}$.',
          lines: [['Suppose $A\\mathbf{x} = \\mathbf{0}$. Then $A^{-1}(A\\mathbf{x}) = A^{-1}\\mathbf{0}$', 'Multiply both sides of an equation by the same matrix'], ['$(A^{-1}A)\\mathbf{x} = A^{-1}\\mathbf{0}$', 'Matrix multiplication is associative'], ['$I\\mathbf{x} = \\mathbf{0}$, so $\\mathbf{x} = \\mathbf{0}$', 'The definition of the inverse ($A^{-1}A = I$) and $M\\mathbf{0} = \\mathbf{0}$']] },
        { stmt: 'If $T$ is linear, then $T(\\mathbf{0}) = \\mathbf{0}$.',
          lines: [['$T(\\mathbf{0}) = T(0\\cdot\\mathbf{0})$', 'Zero times any vector is the zero vector'], ['$T(0\\cdot\\mathbf{0}) = 0\\cdot T(\\mathbf{0})$', 'Linearity: $T(c\\mathbf{u}) = cT(\\mathbf{u})$'], ['$0\\cdot T(\\mathbf{0}) = \\mathbf{0}$', 'Zero times any vector is the zero vector']] },
        { stmt: 'If $A$ and $B$ are invertible $n \\times n$ matrices, then $AB$ is invertible with $(AB)^{-1} = B^{-1}A^{-1}$.',
          lines: [['$(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1}$', 'Matrix multiplication is associative'], ['$A(BB^{-1})A^{-1} = AIA^{-1}$', 'The definition of the inverse of $B$'], ['$AIA^{-1} = AA^{-1} = I$', '$I$ is the identity, then the definition of the inverse of $A$']] }
      ];
      var pf = R.pick(proofs), k = R.int(0, pf.lines.length - 1), reasons = uniqStr(proofs.reduce(function (acc, p) { return acc.concat(p.lines.map(function (l) { return l[1]; })); }, []));
      var correct = pf.lines[k][1], wrongs = R.shuffle(reasons.filter(function (r) { return r !== correct && pf.lines.every(function (l) { return l[1] !== r; }); })).slice(0, 2);
      var other = pf.lines.filter(function (_, i) { return i !== k; })[0][1]; if (other !== correct) wrongs.push(other);
      return test({ q: 'Proof that ' + pf.stmt.charAt(0).toLowerCase() + pf.stmt.slice(1) + '<br>' + pf.lines.map(function (l, i) { return '(' + (i + 1) + ') ' + l[0] + '. ' + (i === k ? '<b>Why?</b>' : '<i>' + l[1] + '.</i>'); }).join('<br>') + '<br>Which reason justifies step ' + (k + 1) + '?',
        a: aMC(correct, wrongs), steps: ['Step ' + (k + 1) + ' is: ' + pf.lines[k][0] + '.', 'It holds because: ' + correct.charAt(0).toLowerCase() + correct.slice(1) + '.', 'Each step of a proof should follow from a definition, the hypothesis, or a rule proved earlier.'],
        hint: 'What changed between the previous line and this one?' }, { kind: 'reason' });
    }
    var stmts = [
      ['If $A$ is invertible, then $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution.', 'If $A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution, then $A$ is not invertible.', 'If $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution, then $A$ is invertible.', 'If $A$ is not invertible, then $A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution.'],
      ['If the columns of $A$ are independent, then $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution.', 'If $A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution, then the columns of $A$ are dependent.', 'If $A\\mathbf{x} = \\mathbf{0}$ has only the trivial solution, then the columns of $A$ are independent.', 'If the columns of $A$ are dependent, then $A\\mathbf{x} = \\mathbf{0}$ has a nontrivial solution.'],
      ['If $T$ is linear, then $T(\\mathbf{0}) = \\mathbf{0}$.', 'If $T(\\mathbf{0}) \\neq \\mathbf{0}$, then $T$ is not linear.', 'If $T(\\mathbf{0}) = \\mathbf{0}$, then $T$ is linear.', 'If $T$ is not linear, then $T(\\mathbf{0}) \\neq \\mathbf{0}$.'],
      ['If $H$ is a subspace, then $H$ contains $\\mathbf{0}$.', 'If $H$ does not contain $\\mathbf{0}$, then $H$ is not a subspace.', 'If $H$ contains $\\mathbf{0}$, then $H$ is a subspace.', 'If $H$ is not a subspace, then $H$ does not contain $\\mathbf{0}$.']
    ];
    var s = R.pick(stmts), want = R.pick(['contrapositive', 'converse']), idx = want === 'contrapositive' ? 1 : 2;
    return test({ q: 'Statement: ' + s[0] + ' Which is its <b>' + want + '</b>?', a: { t: 'mc', choices: [s[idx], s[idx === 1 ? 2 : 1], s[3], s[0]], v: 0 },
      steps: ['For "if $P$, then $Q$": the converse is "if $Q$, then $P$"; the contrapositive is "if not $Q$, then not $P$".', 'The contrapositive always has the same truth value as the statement, so proving it proves the statement. The converse may be false.', 'Here the ' + want + ' is: ' + s[idx]],
      hint: 'Converse: swap. Contrapositive: swap and negate both parts.' }, { kind: 'logic' });
  });

  // ---------------------------------------------------------------- la.vector-spaces
  G('la.vector-spaces', function (R, ctx) {
    var a = R.nz(-4, 4), b = R.nz(-4, 4), c = R.nz(-4, 4), d = R.nz(-6, 6), k = R.nz(2, 4), t = by(ctx, R.int(0, 5), R.int(0, 8), R.int(0, 10)), set, yes, st;
    var plane = T.terms([[a, 'x'], [b, 'y'], [c, 'z']]);
    switch (t) {
      case 0: set = '\\{(x, y, z) : ' + plane + ' = 0\\}'; yes = true; st = ['Zero: $' + a + '(0) + ' + P(b) + '(0) + ' + P(c) + '(0) = 0$, so $\\mathbf{0}$ is in the set.', 'If $\\mathbf{u}$ and $\\mathbf{v}$ satisfy the equation, then so does $\\mathbf{u} + \\mathbf{v}$: its left side is the sum of two zeros. And $c\\mathbf{u}$ gives $c\\cdot 0 = 0$.', 'It is the null space of $\\left[\\,' + [a, b, c].join('\\ \\ ') + '\\,\\right]$, a plane through the origin: <b>a subspace</b>.']; break;
      case 1: set = '\\{(x, y, z) : ' + plane + ' = ' + d + '\\}'; yes = false; st = ['Zero test: plugging in $(0, 0, 0)$ gives $0 \\neq ' + d + '$.', 'The set does not contain $\\mathbf{0}$, so it is <b>not</b> a subspace (it is a plane that misses the origin).']; break;
      case 2: set = '\\{(x, y) : y = ' + T.coef(k, 'x^{2}') + '\\}'; yes = false; st = ['It does contain $(0, 0)$, so the zero test passes. Check addition.', '$(1, ' + k + ')$ is in the set, but $(1, ' + k + ') + (1, ' + k + ') = (2, ' + (2 * k) + ')$ and $' + k + T.cdot() + '2^{2} = ' + (4 * k) + ' \\neq ' + (2 * k) + '$.', 'Not closed under addition: <b>not</b> a subspace (a parabola is curved).']; break;
      case 3: set = '\\{(x, y) : x \\geq 0\\}'; yes = false; st = ['Contains $(0, 0)$ and is closed under addition (sums of nonnegative numbers are nonnegative).', 'But scaling fails: $(1, 0)$ is in it, while $-1\\cdot(1, 0) = (-1, 0)$ is not.', 'So it is <b>not</b> a subspace.']; break;
      case 4: set = '\\{(s' + T.coef(a, 't', false) + ',\\ ' + T.coef(b, 's') + ',\\ t) : s, t \\in \\mathbb{R}\\}'; yes = true; st = ['Every element is $s' + texr([1, b, 0]) + ' + t' + texr([a, 0, 1]) + '$.', 'So the set is $\\operatorname{Span}\\{' + texr([1, b, 0]) + ', ' + texr([a, 0, 1]) + '\\}$, and every span is a subspace: <b>yes</b>.']; break;
      case 5: set = '\\{(x, y, z) : x = ' + T.coef(a, 'y') + ' + ' + Math.abs(d) + '\\}'; yes = false; st = ['Zero test: $0 = ' + a + '(0) + ' + Math.abs(d) + '$ is false.', 'No zero vector, so <b>not</b> a subspace.']; break;
      case 6: set = '\\{(x, y) : xy \\geq 0\\}'; yes = false; st = ['Contains $(0, 0)$, and scaling keeps the sign of $xy$ (it multiplies $xy$ by $c^{2} \\geq 0$).', 'Addition fails: $(1, 2)$ and $(-2, -1)$ are in the set, but their sum $(-1, 1)$ has $xy = -1 < 0$.', 'So <b>not</b> a subspace.']; break;
      case 7: set = '\\text{the } 2 \\times 2 \\text{ matrices } A \\text{ with } A^{T} = A'; yes = true; st = ['$0^{T} = 0$, so the zero matrix is in it.', 'If $A^{T} = A$ and $B^{T} = B$, then $(A + B)^{T} = A^{T} + B^{T} = A + B$ and $(cA)^{T} = cA^{T} = cA$.', 'All three tests pass: <b>a subspace</b> (of the space of $2 \\times 2$ matrices).']; break;
      case 8: set = '\\text{the } 2 \\times 2 \\text{ matrices } A \\text{ with } \\det A = 0'; yes = false; st = ['The zero matrix is in it, and scaling keeps $\\det = 0$.', 'Addition fails: $' + tex(qm([[1, 0], [0, 0]])) + '$ and $' + tex(qm([[0, 0], [0, 1]])) + '$ both have determinant $0$, but their sum $I$ has determinant $1$.', 'So <b>not</b> a subspace.']; break;
      case 9: set = '\\text{the polynomials } p \\text{ of degree at most } 2 \\text{ with } p(' + k + ') = 0'; yes = true; st = ['The zero polynomial has $p(' + k + ') = 0$.', 'If $p(' + k + ') = 0$ and $q(' + k + ') = 0$, then $(p + q)(' + k + ') = 0$ and $(cp)(' + k + ') = 0$.', 'So it is <b>a subspace</b> of $\\mathbb{P}_{2}$.']; break;
      default: set = '\\text{the polynomials of degree exactly } 2'; yes = false; st = ['The zero polynomial does not have degree 2, so $\\mathbf{0}$ is missing.', 'Also $(x^{2} + x) + (-x^{2}) = x$ has degree 1. So <b>not</b> a subspace.'];
    }
    return test({ q: 'True or false: $' + set + '$ is a subspace' + (t >= 7 ? '' : ' of $\\mathbb{R}^{' + (t === 2 || t === 3 || t === 6 ? 2 : 3) + '}$') + '.', a: aTF(yes), steps: st,
      hint: 'Check three things: contains $\\mathbf{0}$, closed under addition, closed under scalar multiplication. One failure is enough to say no.' }, { kind: 'subspace', t: t, yes: yes });
  });

  // ---------------------------------------------------------------- la.null-column-spaces
  function randRankMatrix(R, m, n, piv, max) { var Rr = randRref(R, m, n, piv, -3, 3), A = null, t = 0; while (!A && t++ < 8) A = niceFromRref(R, Rr, { max: max || 9 }); return A || Rr; }
  G('la.null-column-spaces', function (R, ctx) {
    var kind = by(ctx, R.pick(['innul', 'incol', 'nulbasis']), R.pick(['nulbasis', 'colbasis', 'innul', 'dims']), R.pick(['nulbasis', 'colbasis', 'incol']));
    if (kind === 'innul') {
      var A = randRankMatrix(R, 3, 4, R.pick([[0, 1], [0, 1, 2], [0, 2]])), Rr = rref(A), piv = pivotsOf(Rr), free = [0, 1, 2, 3].filter(function (j) { return piv.indexOf(j) < 0; });
      var v = zeros(1, 4)[0]; free.forEach(function (fj) { v[fj] = q(R.nz(-2, 2)); }); piv.forEach(function (pc, i) { var s = q(0); free.forEach(function (fj) { s = s.sub(Rr[i][fj].mul(v[fj])); }); v[pc] = s; });
      var inside = R.coin(); if (!inside) { v = v.slice(); v[R.int(0, 3)] = v[R.int(0, 3)].add(R.nz(-2, 2)); }
      var Av = mv(A, v); inside = isZeroV(Av);
      return test({ q: 'Let $A = ' + tex(A) + '$ and $\\mathbf{v} = ' + texv(v) + '$. True or false: $\\mathbf{v}$ is in $\\operatorname{Nul} A$.', a: aTF(inside),
        steps: ['$\\mathbf{v}$ is in $\\operatorname{Nul} A$ exactly when $A\\mathbf{v} = \\mathbf{0}$. No row reduction is needed: just multiply.', '$A\\mathbf{v} = ' + texv(Av) + '$.', inside ? 'That is $\\mathbf{0}$: <b>true</b>.' : 'That is not $\\mathbf{0}$: <b>false</b>.'],
        hint: 'Compute $A\\mathbf{v}$.' }, { kind: 'innul', A: A, v: v, inside: inside });
    }
    if (kind === 'incol') {
      var A2 = randRankMatrix(R, 3, 3, [0, 1]), cs = [R.nz(-2, 2), R.nz(-2, 2), R.int(-2, 2)], b = mv(A2, cs), inside2 = true;
      if (R.coin()) { b = b.slice(); b[R.int(0, 2)] = b[R.int(0, 2)].add(R.nz(-3, 3)); }
      inside2 = rank(A2.map(function (r, i) { return r.concat([b[i]]); })) === rank(A2);
      var E = elim(A2.map(function (r, i) { return r.concat([b[i]]); }), { mode: 'echelon', ncoef: 3 });
      return test({ q: 'Let $A = ' + tex(A2) + '$ and $\\mathbf{b} = ' + texv(b) + '$. True or false: $\\mathbf{b}$ is in $\\operatorname{Col} A$.', a: aTF(inside2),
        steps: ['$\\mathbf{b}$ is in $\\operatorname{Col} A$ exactly when $A\\mathbf{x} = \\mathbf{b}$ is consistent. Row reduce $[\\,A \\mid \\mathbf{b}\\,]$.'].concat(stepTexts(E, 1)).concat([inside2 ? 'No row says $0 = c$ with $c \\neq 0$: consistent, so <b>true</b>.' : 'A row says $0 = c$ with $c \\neq 0$: inconsistent, so <b>false</b>.']),
        hint: 'Is $A\\mathbf{x} = \\mathbf{b}$ consistent?' }, { kind: 'incol', A: A2, b: b, inside: inside2 });
    }
    if (kind === 'dims') {
      var m = R.int(2, 5), n = R.intNot(2, 6, m);
      return test({ q: '$A$ is $' + m + ' \\times ' + n + '$. $\\operatorname{Nul} A$ is a subspace of $\\mathbb{R}^{k}$ and $\\operatorname{Col} A$ is a subspace of $\\mathbb{R}^{j}$. Find $k$ and $j$.',
        a: { t: 'multi', parts: [{ label: '$k =$', a: aN(q(n)) }, { label: '$j =$', a: aN(q(m)) }] },
        steps: ['$\\operatorname{Nul} A$ holds the vectors $\\mathbf{x}$ with $A\\mathbf{x} = \\mathbf{0}$; $\\mathbf{x}$ has one entry per column: $k = ' + n + '$.', '$\\operatorname{Col} A$ is spanned by the columns, which have one entry per row: $j = ' + m + '$.'],
        hint: 'Inputs $\\mathbf{x}$ have as many entries as $A$ has columns; outputs have as many as $A$ has rows.' }, { kind: 'dims', m: m, n: n });
    }
    if (kind === 'colbasis') {
      var piv3 = R.pick([[0, 2], [0, 1, 3], [0, 2, 3], [0, 1]]), n3 = 4, A3 = randRankMatrix(R, 3, n3, piv3), R3 = rref(A3), p3 = pivotsOf(R3);
      var good = p3.map(function (j) { return texv(col(A3, j)); }).join(',\\ '), trap = p3.map(function (j) { return texv(col(R3, j)); }).join(',\\ ');
      var nonp = [0, 1, 2, 3].filter(function (j) { return p3.indexOf(j) < 0; });
      var firstK = [0, 1, 2, 3].slice(0, p3.length), alt = firstK.join() !== p3.join() ? firstK : p3.slice(0, -1).concat([nonp[nonp.length - 1]]).sort();
      var wrong1 = alt.map(function (j) { return texv(col(A3, j)); }).join(',\\ ');
      var all = [0, 1, 2, 3].map(function (j) { return texv(col(A3, j)); }).join(',\\ ');
      var ch = uniqStr(['$' + good + '$', '$' + trap + '$', '$' + wrong1 + '$', '$' + all + '$']);
      return test({ q: '$A = ' + tex(A3) + '$ row reduces to $R = ' + tex(R3) + '$. Which set is a basis for $\\operatorname{Col} A$?', a: { t: 'mc', choices: ch, v: 0 },
        steps: ['The pivots of $R$ are in columns ' + lst(p3.map(function (j) { return String(j + 1); })) + '.', 'Take those columns <b>from $A$ itself</b>: row operations change the column space, so the columns of $R$ usually are not even in $\\operatorname{Col} A$. Row operations do keep the dependence relations among the columns, which is why the pivot positions can be read from $R$.', 'Basis: $' + good + '$.'],
        hint: 'Find the pivot columns using $R$, but copy the vectors from $A$.' }, { kind: 'colbasis', A: A3, piv: p3 });
    }
    var two = ctx.level >= 3 && R.coin(), piv4 = two ? R.pick([[0, 1], [0, 2]]) : R.pick([[0, 1, 2], [0, 1, 3], [0, 2, 3]]), A4 = randRankMatrix(R, 3, 4, piv4, 10);
    var R4 = rref(A4), p4 = pivotsOf(R4), free4 = [0, 1, 2, 3].filter(function (j) { return p4.indexOf(j) < 0; }), fN = free4.length === 1 ? ['t'] : ['s', 't'];
    var S = paramSolution(R4.map(function (r) { return r.concat([q(0)]); }), 4, fN), names = xs(4), E4 = elim(A4, { mode: 'rref' });
    var st4 = ['Solve $A\\mathbf{x} = \\mathbf{0}$: row reduce $A$.'].concat(stepTexts(E4, 0)).concat(['Free: ' + lst(free4.map(function (c, k) { return '$' + names[c] + ' = ' + fN[k] + '$'; })) + '. Then ' + S.piv.map(function (pc) { return '$' + names[pc] + ' = ' + S.texs[pc] + '$'; }).join(', ') + '.']);
    if (free4.length === 1) {
      st4.push('So $\\mathbf{x} = t' + texv(S.dirs[0]) + '$ and $\\operatorname{Nul} A = \\operatorname{Span}\\{' + texv(S.dirs[0]) + '\\}$.');
      return test({ q: 'Find a vector $\\mathbf{v}$ with $\\operatorname{Nul} A = \\operatorname{Span}\\{\\mathbf{v}\\}$ for $A = ' + tex(A4) + '$. Make the entry for the free variable equal to $1$.', a: aV(S.dirs[0]), steps: st4,
        hint: 'Solve $A\\mathbf{x} = \\mathbf{0}$ in parametric form. The vector multiplying the parameter is $\\mathbf{v}$.' }, { kind: 'nulbasis', A: A4, v: S.dirs[0], free: free4 });
    }
    st4.push('So $\\mathbf{x} = s' + texv(S.dirs[0]) + ' + t' + texv(S.dirs[1]) + '$, and these two vectors are a basis for $\\operatorname{Nul} A$.');
    return test({ q: 'Find a basis $\\{\\mathbf{u}, \\mathbf{v}\\}$ for $\\operatorname{Nul} A$, where $A = ' + tex(A4) + '$. Use $' + names[free4[0]] + ' = s$, $' + names[free4[1]] + ' = t$ and write $\\mathbf{x} = s\\mathbf{u} + t\\mathbf{v}$.',
      a: { t: 'multi', parts: [{ label: '$\\mathbf{u} =$', a: aV(S.dirs[0]) }, { label: '$\\mathbf{v} =$', a: aV(S.dirs[1]) }] }, steps: st4,
      hint: 'Write the general solution of $A\\mathbf{x} = \\mathbf{0}$ and split it into the $s$ part and the $t$ part.' }, { kind: 'nulbasis2', A: A4, us: S.dirs, free: free4 });
  });

  // ---------------------------------------------------------------- la.basis
  G('la.basis', function (R, ctx) {
    var kind = by(ctx, R.pick(['isbasis', 'isbasis', 'plane']), R.pick(['isbasis', 'plane', 'count']), R.pick(['plane', 'isbasis', 'count']));
    if (kind === 'isbasis') {
      var n = R.pick([2, 3, 3]), k = R.pick([n, n, n, n - 1, n + 1]), vs = [], yes;
      if (k === n && R.coin()) { vs = indepSet(R, n, n, -3, 4); }
      else if (k === n) { var b0 = indepSet(R, n - 1, n, -3, 4); vs = b0.concat([vadd(vsc(R.nz(-2, 2), b0[0]), vsc(R.int(-2, 2), b0[b0.length - 1]))]); vs = R.shuffle(vs); }
      else for (var i = 0; i < k; i++) vs.push(randV(R, n, -3, 4));
      yes = k === n && rank(cols(vs)) === n;
      var st;
      if (k !== n) st = ['A basis of $\\mathbb{R}^{' + n + '}$ has exactly ' + n + ' vectors. ' + (k < n ? k + ' vectors cannot span $\\mathbb{R}^{' + n + '}$.' : k + ' vectors in $\\mathbb{R}^{' + n + '}$ must be dependent.'), 'So <b>false</b>.'];
      else { var E = elim(cols(vs), { mode: 'echelon' }); st = ['A basis must be independent and span. For ' + n + ' vectors in $\\mathbb{R}^{' + n + '}$, both happen exactly when the square matrix with them as columns has ' + n + ' pivots.'].concat(stepTexts(E, 0)).concat([E.pivots.length + ' pivots: ' + (yes ? '<b>true</b>, it is a basis.' : '<b>false</b>, the vectors are dependent (and do not span).')]); }
      return test({ q: 'True or false: ' + vs.map(function (v) { return '$' + texv(v) + '$'; }).join(', ') + ' form a basis of $\\mathbb{R}^{' + n + '}$.', a: aTF(yes), steps: st,
        hint: 'Count the vectors first. If the count is right, row reduce and check for a pivot in every column.' }, { kind: 'isbasis', vs: vs, n: n, yes: yes });
    }
    if (kind === 'plane') {
      var a = R.nz(-3, 3), b = R.nz(-3, 3), c = R.pick([1, -1]); // plane a x + b y + c z = 0 -> z = -(a x + b y)/c
      function onPlane(x, y) { return [q(x), q(y), q(-(a * x + b * y) * c)]; }
      var u = onPlane(1, 0), w = onPlane(0, 1), good = [u, vadd(w, vsc(R.int(-1, 1), u))];
      var dep = [u, vsc(R.pick([2, -1, 3]), u)], off = [u, [q(0), q(0), q(1)]], three = [u, w, vadd(u, w)];
      var fmt = function (set) { return '$' + set.map(texr).join(',\\ ') + '$'; };
      var eqTex = T.terms([[a, 'x'], [b, 'y'], [c, 'z']]) + ' = 0';
      return test({ q: 'Which set is a basis for the plane $' + eqTex + '$ (a subspace of $\\mathbb{R}^{3}$)?', a: { t: 'mc', choices: uniqStr([fmt(good), fmt(dep), fmt(off), fmt(three)]), v: 0 },
        steps: ['The plane is 2-dimensional, so a basis has two independent vectors that lie in it.', 'Check each vector in the equation. ' + fmt(off) + ': the last vector gives $' + c + ' \\neq 0$, so it is not in the plane. ' + fmt(dep) + ': the second is a multiple of the first (dependent). The three-vector set is dependent.', fmt(good) + ' both satisfy the equation and are not multiples: a basis.'],
        hint: 'Each vector must satisfy the equation, and the set must be independent and the right size.' }, { kind: 'plane', a: a, b: b, c: c, good: good });
    }
    var m = R.pick([1, 2]), n2 = R.pick([3, 4, 5]), A = randRankMatrix(R, m, n2, m === 1 ? [0] : [0, R.int(1, n2 - 1)].sort(), 7);
    var rk = rank(A), eqs = A.map(function (r) { return T.terms(r.map(function (cc, j) { return [cc, 'x_{' + (j + 1) + '}']; })) + ' = 0'; });
    return test({ q: 'How many vectors are in a basis for the subspace of $\\mathbb{R}^{' + n2 + '}$ defined by ' + eqs.map(function (e) { return '$' + e + '$'; }).join(' and ') + '?', a: aN(q(n2 - rk)),
      steps: ['The subspace is the null space of the coefficient matrix $' + tex(A) + '$.', 'That matrix has ' + rk + ' pivot' + (rk > 1 ? 's' : '') + ', so ' + (n2 - rk) + ' of the ' + n2 + ' variables are free.', 'Each free variable gives one basis vector: <b>' + (n2 - rk) + '</b>.'],
      hint: 'Count free variables in the system.' }, { kind: 'count', A: A });
  });

  // ---------------------------------------------------------------- la.dimension-rank
  G('la.dimension-rank', function (R, ctx) {
    var kind = by(ctx, R.pick(['rank', 'dimnul']), R.pick(['rank', 'dimnul', 'dimspan']), R.pick(['rank', 'dimspan', 'dimnul']));
    var m = R.pick([3, 3, 4]), n = R.pick([3, 4, 5]), r = R.int(1, Math.min(m, n, 3)), piv = R.sample(U.range(1, n - 1), r - 1).concat([0]).sort(function (x, y) { return x - y; });
    var A = randRankMatrix(R, m, n, piv, 9), E = elim(A, { mode: 'echelon' }), rk = E.pivots.length;
    if (kind === 'dimspan') {
      var vs = []; for (var j = 0; j < n; j++) vs.push(col(A, j));
      return test({ q: 'Find the dimension of $\\operatorname{Span}\\{' + vs.map(texv).join(', ') + '\\}$.', a: aN(q(rk)),
        steps: ['The span is the column space of the matrix with these columns; its dimension is the number of pivots.'].concat(stepTexts(E, 0)).concat([rk + ' pivot' + (rk > 1 ? 's' : '') + ', so the dimension is <b>' + rk + '</b>.']),
        hint: 'Put the vectors in a matrix and count the pivots.' }, { kind: 'dimspan', A: A });
    }
    var askNul = kind === 'dimnul';
    return test({ q: 'Find ' + (askNul ? '$\\dim \\operatorname{Nul} A$' : '$\\operatorname{rank} A$') + ' for $$A = ' + tex(A) + '$$', a: aN(q(askNul ? n - rk : rk)),
      steps: ['Row reduce to find the pivots.'].concat(stepTexts(E, 0)).concat([rk + ' pivot' + (rk > 1 ? 's' : '') + (askNul ? ', so ' + (n - rk) + ' free variable' + (n - rk === 1 ? '' : 's') + ' out of ' + n + ' columns: $\\dim \\operatorname{Nul} A = ' + (n - rk) + '$.' : ': $\\operatorname{rank} A = \\dim \\operatorname{Col} A = ' + rk + '$.')]),
      hint: askNul ? 'Count the columns without pivots.' : 'Count the pivots.' }, { kind: kind, A: A });
  });

  // ---------------------------------------------------------------- la.rank-nullity
  G('la.rank-nullity', function (R, ctx) {
    var kind = by(ctx, R.pick(['nullity', 'rankfrom']), R.pick(['four', 'possible', 'nullity']), R.pick(['four', 'possible', 'onto']));
    var m = R.int(3, 7), n = R.int(3, 8), r = R.int(1, Math.min(m, n));
    if (kind === 'nullity' || kind === 'rankfrom') {
      var giveRank = kind === 'nullity';
      return test({ q: '$A$ is a $' + m + ' \\times ' + n + '$ matrix with ' + (giveRank ? '$\\operatorname{rank} A = ' + r + '$' : '$\\dim \\operatorname{Nul} A = ' + (n - r) + '$') + '. Find ' + (giveRank ? '$\\dim \\operatorname{Nul} A$' : '$\\operatorname{rank} A$') + '.', a: aN(q(giveRank ? n - r : r)),
        steps: ['Rank–nullity: $\\operatorname{rank} A + \\dim \\operatorname{Nul} A = n$, the number of <b>columns</b> (here $' + n + '$).', giveRank ? '$\\dim \\operatorname{Nul} A = ' + n + ' - ' + r + ' = ' + (n - r) + '$.' : '$\\operatorname{rank} A = ' + n + ' - ' + (n - r) + ' = ' + r + '$.'],
        hint: 'Pivot columns plus free columns make up all ' + n + ' columns.' }, { kind: 'nullity', m: m, n: n, r: r });
    }
    if (kind === 'four') {
      return test({ q: '$A$ is $' + m + ' \\times ' + n + '$ with rank $' + r + '$. Find the dimensions of the four fundamental subspaces.',
        a: { t: 'multi', parts: [{ label: '$\\dim \\operatorname{Col} A$', a: aN(q(r)) }, { label: '$\\dim \\operatorname{Row} A$', a: aN(q(r)) }, { label: '$\\dim \\operatorname{Nul} A$', a: aN(q(n - r)) }, { label: '$\\dim \\operatorname{Nul} A^{T}$', a: aN(q(m - r)) }] },
        steps: ['Column space and row space both have dimension $r = ' + r + '$ (the pivots count both the independent columns and the nonzero rows of the echelon form).', '$\\operatorname{Nul} A$ lives in $\\mathbb{R}^{' + n + '}$: $' + n + ' - ' + r + ' = ' + (n - r) + '$.', '$\\operatorname{Nul} A^{T}$ lives in $\\mathbb{R}^{' + m + '}$: $A^{T}$ is $' + n + ' \\times ' + m + '$ with rank ' + r + ', so $' + m + ' - ' + r + ' = ' + (m - r) + '$.'],
        hint: 'Rank–nullity for $A$ (with $n$ columns) and for $A^{T}$ (with $m$ columns).' }, { kind: 'four', m: m, n: n, r: r });
    }
    if (kind === 'possible') {
      var k = R.int(0, n), ok = k >= n - m && k <= n && n - k <= m;
      return test({ q: 'True or false: a $' + m + ' \\times ' + n + '$ matrix can have a null space of dimension $' + k + '$.', a: aTF(ok),
        steps: ['$\\operatorname{rank} A = ' + n + ' - ' + k + ' = ' + (n - k) + '$ would be needed.', 'The rank is at most the number of rows, $' + m + '$, and at most the number of columns, $' + n + '$.', ok ? 'A rank of ' + (n - k) + ' is possible, so <b>true</b>.' : 'A rank of ' + (n - k) + ' is more than ' + m + ', so <b>false</b>: the null space must have dimension at least $' + n + ' - ' + m + ' = ' + (n - m) + '$.'],
        hint: 'Use rank + nullity = number of columns, and rank ≤ number of rows.' }, { kind: 'possible', m: m, n: n, k: k, ok: ok });
    }
    var dom = R.int(4, 8), cod = R.int(2, dom - 1), ker = R.int(0, dom - 1), rk = dom - ker, valid = rk <= cod;
    while (!valid) { ker = R.int(dom - cod, dom - 1); rk = dom - ker; valid = rk <= cod; }
    var onto = rk === cod;
    return test({ q: '$T: \\mathbb{R}^{' + dom + '} \\to \\mathbb{R}^{' + cod + '}$ is linear and its kernel (null space) has dimension $' + ker + '$. Is $T$ onto $\\mathbb{R}^{' + cod + '}$?', a: yn(onto),
      steps: ['Rank–nullity: $\\dim(\\text{range}) = ' + dom + ' - ' + ker + ' = ' + rk + '$.', onto ? 'The range has dimension ' + cod + ', so it is all of $\\mathbb{R}^{' + cod + '}$: <b>yes</b>.' : 'The range has dimension ' + rk + ' < ' + cod + ', so it misses part of $\\mathbb{R}^{' + cod + '}$: <b>no</b>.'],
      hint: 'Find the dimension of the range with rank–nullity.' }, { kind: 'onto', dom: dom, cod: cod, ker: ker, onto: onto });
  });

  // ---------------------------------------------------------------- la.change-of-basis
  G('la.change-of-basis', function (R, ctx) {
    var kind = by(ctx, R.pick(['to', 'from']), R.pick(['to', 'from', 'to3']), R.pick(['PCB', 'to3', 'to']));
    if (kind === 'PCB') {
      var PB = unimod(R, 2, 5), PC = unimod(R, 2, 5); while (eqM(PB, PC)) PC = unimod(R, 2, 5);
      var PCi = inv(PC), Pcb = mm(PCi, PB);
      return test({ q: 'Bases of $\\mathbb{R}^{2}$: $\\mathcal{B} = \\{' + texv(col(PB, 0)) + ', ' + texv(col(PB, 1)) + '\\}$ and $\\mathcal{C} = \\{' + texv(col(PC, 0)) + ', ' + texv(col(PC, 1)) + '\\}$. Find the change-of-coordinates matrix $P_{\\mathcal{C} \\leftarrow \\mathcal{B}}$, which turns $[\\mathbf{x}]_{\\mathcal{B}}$ into $[\\mathbf{x}]_{\\mathcal{C}}$.', a: aM(Pcb),
        steps: ['Its columns are the $\\mathcal{C}$-coordinates of the $\\mathcal{B}$ vectors: $P_{\\mathcal{C} \\leftarrow \\mathcal{B}} = \\left[\\,[\\mathbf{b}_{1}]_{\\mathcal{C}}\\ [\\mathbf{b}_{2}]_{\\mathcal{C}}\\,\\right] = P_{\\mathcal{C}}^{-1}P_{\\mathcal{B}}$.', '$P_{\\mathcal{C}} = ' + tex(PC) + '$, so $P_{\\mathcal{C}}^{-1} = ' + tex(PCi) + '$.', '$P_{\\mathcal{C}}^{-1}P_{\\mathcal{B}} = ' + tex(PCi) + tex(PB) + ' = ' + tex(Pcb) + '$.', 'Check column 1: $' + combTex([Pcb[0][0], Pcb[1][0]], [col(PC, 0), col(PC, 1)]) + ' = ' + texv(col(PB, 0)) + '$, which is $\\mathbf{b}_{1}$.'],
        hint: 'Write each $\\mathcal{B}$ vector in $\\mathcal{C}$-coordinates; those are the columns.' }, { kind: 'PCB', PB: PB, PC: PC });
    }
    var n = kind === 'to3' ? 3 : 2, P = unimod(R, n, 5), bs = []; for (var j = 0; j < n; j++) bs.push(col(P, j));
    var cB = randV(R, n, -4, 4, true), x = mv(P, cB), names = vecNames(n, 'b');
    var basisTex = '\\mathcal{B} = \\{' + bs.map(texv).join(', ') + '\\}';
    if (kind === 'from') {
      return test({ q: 'With $' + basisTex + '$, the vector $\\mathbf{x}$ has $[\\mathbf{x}]_{\\mathcal{B}} = ' + texv(cB) + '$. Find $\\mathbf{x}$ in standard coordinates.', a: aV(x),
        steps: ['$[\\mathbf{x}]_{\\mathcal{B}}$ lists the weights on the basis vectors: $\\mathbf{x} = ' + sumTex(cB, names) + '$.', '$\\mathbf{x} = ' + combTex(cB, bs) + ' = ' + texv(x) + '$. (That is $P_{\\mathcal{B}}[\\mathbf{x}]_{\\mathcal{B}}$.)'],
        hint: 'The coordinates are weights. Multiply each basis vector by its weight and add.' }, { kind: 'from', P: P, c: cB });
    }
    var E = elim(P.map(function (r, i) { return r.concat([x[i]]); }), { mode: 'rref', ncoef: n });
    return test({ q: 'With $' + basisTex + '$, find the coordinate vector $[\\mathbf{x}]_{\\mathcal{B}}$ of $\\mathbf{x} = ' + texv(x) + '$.', a: aV(cB),
      steps: ['We need weights $c_{i}$ with $' + sumTex(cB.map(function (_, i) { return 1; }), names.map(function (nm, i) { return 'c_{' + (i + 1) + '}' + nm; })) + ' = \\mathbf{x}$, that is $P_{\\mathcal{B}}\\mathbf{c} = \\mathbf{x}$.'].concat(stepTexts(E, 1)).concat(['So $[\\mathbf{x}]_{\\mathcal{B}} = ' + texv(cB) + '$. Check: $' + combTex(cB, bs) + ' = ' + texv(mv(P, cB)) + '$.']),
      hint: 'Solve $P_{\\mathcal{B}}\\mathbf{c} = \\mathbf{x}$, where the columns of $P_{\\mathcal{B}}$ are the basis vectors.' }, { kind: 'to', P: P, x: x });
  });


  // ================================================================ Unit 6: Eigenvalues and Eigenvectors

  /* eig2(R, opts): a 2x2 integer matrix A = P D P^-1 with integer eigenvalues l1 != l2 and eigenvectors (columns of P) */
  function eig2(R, o) {
    o = o || {};
    for (var t = 0; t < 80; t++) {
      var P = o.firstOne ? (function () { var a = R.int(-3, 3), b = a + R.pick([1, -1]); return qm([[1, 1], [a, b]]); })() : unimod(R, 2, 4);
      var l1 = R.int(-4, 5), l2 = R.intNot(-4, 5, l1);
      if (o.pos) { l1 = R.int(1, 5); l2 = R.intNot(1, 5, l1); }
      if (o.small) { l1 = R.pick([2, -1, 3, 1, -2]); l2 = R.pick([1, -1, 2, 0].filter(function (x) { return x !== l1; })); }
      var A = mm(mm(P, diag([l1, l2])), inv(P));
      if (maxAbs(A) <= (o.max || 12) && !isTrivialM(A) && allInt(A)) return { A: A, P: P, l: [q(l1), q(l2)] };
    }
    return { A: qm([[4, 1], [2, 3]]), P: qm([[1, 1], [1, -2]]), l: [q(5), q(2)] };
  }
  /* eig3(R, type): 3x3 integer A = P J P^-1; type 'distinct' | 'diag2' (repeated eigenvalue, 2-dim eigenspace) | 'jordan' (repeated, 1-dim) */
  function eig3(R, type) {
    for (var t = 0; t < 80; t++) {
      var P = unimod(R, 3, 4), l = R.int(-3, 4), mu = R.intNot(-3, 4, l), nu = R.intNot(-3, 4, [l, mu]), J;
      if (type === 'distinct') J = diag([l, mu, nu]);
      else if (type === 'diag2') J = diag([l, l, mu]);
      else J = qm([[l, 1, 0], [0, l, 0], [0, 0, mu]]);
      var A = mm(mm(P, J), inv(P));
      if (maxAbs(A) <= 12 && !isTrivialM(A)) return { A: A, P: P, J: J, l: l, mu: mu, nu: nu };
    }
    return { A: qm([[2, 0, 0], [0, 2, 0], [0, 0, 3]]), P: eye(3), J: diag([2, 2, 3]), l: 2, mu: 3, nu: 1 };
  }
  function lamI(A, lam) { return A.map(function (r, i) { return r.map(function (x, j) { return i === j ? x.sub(lam) : x; }); }); }
  function texLamI(A, sym) { // A - λI shown with λ only on the diagonal
    sym = sym || '\\lambda';
    return '\\begin{bmatrix} ' + A.map(function (r, i) { return r.map(function (x, j) { return i === j ? (x.isZero() ? '-' + sym : N(x) + ' - ' + sym) : N(x); }).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}';
  }
  function amI(lam, sym) { lam = q(lam); return (sym || 'A') + (lam.isZero() ? '' : T.coef(lam.neg(), 'I', false)); }  // "A - 3I", "A + I", "A"
  function charPoly2(A) { var tr = A[0][0].add(A[1][1]), d = det(A); return { tr: tr, det: d }; }
  function polyPlain(cs, v) { // [1, -5, 6] -> "lambda^2-5*lambda+6"
    var n = cs.length - 1, out = '';
    cs.forEach(function (c, i) { c = q(c); if (c.isZero()) return; var k = n - i, a = c.abs(), body = k === 0 ? a.toPlain() : (a.eq(1) ? '' : a.toPlain() + '*') + v + (k > 1 ? '^' + k : ''); out += (c.sign() < 0 ? '-' : out ? '+' : '') + body; });
    return out || '0';
  }
  function normVec(v, idx) { var s = v[idx]; return v.map(function (x) { return x.div(s); }); }
  function nullVec(Mx) { // one vector spanning the null space of Mx (nullity assumed 1), last free entry = 1
    var Rr = rref(Mx), n = Mx[0].length, piv = pivotsOf(Rr), free = []; for (var j = 0; j < n; j++) if (piv.indexOf(j) < 0) free.push(j);
    var v = zeros(1, n)[0]; var f = free[free.length - 1]; v[f] = q(1);
    piv.forEach(function (pc, i) { v[pc] = Rr[i][f].neg(); });
    return { v: v, free: free, R: Rr, piv: piv };
  }

  // ---------------------------------------------------------------- la.eigen-intro
  G('la.eigen-intro', function (R, ctx) {
    var kind = by(ctx, R.pick(['check', 'check', 'concept']), R.pick(['check', 'islambda', 'findvec']), R.pick(['findvec', 'islambda', 'check']));
    if (kind === 'concept') {
      var items = [['The zero vector is an eigenvector of every square matrix.', false, 'An eigenvector must be <b>nonzero</b>. ($A\\mathbf{0} = \\lambda\\mathbf{0}$ holds for every $\\lambda$, so allowing $\\mathbf{0}$ would make every number an "eigenvalue".)'],
        ['$\\lambda = 0$ can be an eigenvalue of a matrix.', true, '$0$ is an eigenvalue exactly when $A\\mathbf{v} = \\mathbf{0}$ for some nonzero $\\mathbf{v}$, that is, when $A$ is not invertible. Eigen<b>values</b> may be $0$; eigen<b>vectors</b> may not.'],
        ['If $\\mathbf{v}$ is an eigenvector of $A$ with eigenvalue $\\lambda$, then so is $3\\mathbf{v}$.', true, '$A(3\\mathbf{v}) = 3A\\mathbf{v} = 3\\lambda\\mathbf{v} = \\lambda(3\\mathbf{v})$, and $3\\mathbf{v} \\neq \\mathbf{0}$.'],
        ['If $A\\mathbf{v} = \\lambda\\mathbf{v}$ for some number $\\lambda$, then $\\mathbf{v}$ is an eigenvector of $A$.', false, 'Only if $\\mathbf{v} \\neq \\mathbf{0}$. The zero vector satisfies the equation but is never an eigenvector.']];
      var it = R.pick(items);
      return test({ q: 'True or false: ' + it[0], a: aTF(it[1]), steps: [it[2], 'So the statement is <b>' + (it[1] ? 'true' : 'false') + '</b>.'], hint: 'Recall the definition: a <b>nonzero</b> $\\mathbf{v}$ with $A\\mathbf{v} = \\lambda\\mathbf{v}$.' }, { kind: 'concept' });
    }
    var E = eig2(R, { max: 10 }), A = E.A;
    if (kind === 'check') {
      var yes = R.coin(), j = R.int(0, 1), v = vsc(R.pick([1, -1, 2]), col(E.P, j)), lam = E.l[j];
      if (!yes) { var w; do { w = randV(R, 2, -3, 3); } while (isZeroV(w) || rank(cols([w, col(E.P, 0)])) < 2 || rank(cols([w, col(E.P, 1)])) < 2); v = w; }
      var Av = mv(A, v), ratio = null;
      if (yes) ratio = lam;
      var choices = ['Yes, with $\\lambda = ' + N(E.l[0]) + '$', 'Yes, with $\\lambda = ' + N(E.l[1]) + '$', 'No: $A\\mathbf{v}$ is not a multiple of $\\mathbf{v}$'];
      var other = E.l[0].add(E.l[1]); if (!other.eq(E.l[0]) && !other.eq(E.l[1])) choices.push('Yes, with $\\lambda = ' + N(other) + '$');
      return test({ q: 'Is $\\mathbf{v} = ' + texv(v) + '$ an eigenvector of $A = ' + tex(A) + '$? If so, for which eigenvalue?', a: { t: 'mc', choices: choices, v: yes ? j : 2, keep: true },
        steps: ['Compute $A\\mathbf{v} = ' + tex(A) + texv(v) + ' = ' + texv(Av) + '$.', yes ? 'That is $' + N(lam) + texv(v) + '$, so $A\\mathbf{v} = ' + N(lam) + '\\mathbf{v}$: an eigenvector with $\\lambda = ' + N(lam) + '$.' : 'Compare entries: no single number $\\lambda$ turns $' + texv(v) + '$ into $' + texv(Av) + '$, so $\\mathbf{v}$ is <b>not</b> an eigenvector.'],
        hint: 'Multiply $A\\mathbf{v}$ and see whether the result is a multiple of $\\mathbf{v}$.' }, { kind: 'check', A: A, v: v, yes: yes, lam: lam });
    }
    if (kind === 'islambda') {
      var yes2 = R.coin(), lam2 = yes2 ? R.pick(E.l) : q(R.intNot(-5, 6, E.l.map(function (x) { return x.num(); }))), B = lamI(A, lam2), dB = det(B);
      return test({ q: 'True or false: $\\lambda = ' + N(lam2) + '$ is an eigenvalue of $A = ' + tex(A) + '$.', a: aTF(yes2),
        steps: ['$\\lambda$ is an eigenvalue exactly when $A - \\lambda I$ is <b>not</b> invertible, so that $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ has a nonzero solution.', '$' + amI(lam2) + ' = ' + tex(B) + '$, with determinant $' + det2Line(B) + ' = ' + N(dB) + '$.', dB.isZero() ? 'Determinant $0$: not invertible, so <b>true</b>.' : 'Determinant $\\neq 0$: invertible, so only $\\mathbf{v} = \\mathbf{0}$ works. <b>False</b>.'],
        hint: 'Subtract $\\lambda$ from the diagonal entries and check whether the result is invertible.' }, { kind: 'islambda', A: A, lam: lam2, yes: yes2 });
    }
    var j2 = R.int(0, 1), lam3 = E.l[j2], B3 = lamI(A, lam3), pv = col(E.P, j2), idx = !pv[0].isZero() ? 0 : 1, v3 = normVec(pv, idx);
    var form = idx === 0 ? '(1, y)' : '(x, 1)';
    return test({ q: '$\\lambda = ' + N(lam3) + '$ is an eigenvalue of $A = ' + tex(A) + '$. Find the eigenvector of the form $' + form + '$.', a: aV(v3),
      steps: ['Solve $(' + amI(lam3) + ')\\mathbf{v} = \\mathbf{0}$ with $' + amI(lam3) + ' = ' + tex(B3) + '$.', 'The rows are multiples of each other (that is what makes $\\lambda$ an eigenvalue). Use a nonzero row: $' + eqnTex(B3[B3[0].every(function (x) { return x.isZero(); }) ? 1 : 0], ['x', 'y'], 0) + '$.', 'With ' + (idx === 0 ? '$x = 1$' : '$y = 1$') + ' this gives $\\mathbf{v} = ' + texv(v3) + '$.', 'Check: $A\\mathbf{v} = ' + texv(mv(A, v3)) + ' = ' + N(lam3) + texv(v3) + '$.'],
      hint: 'Subtract $\\lambda$ from the diagonal, then solve the homogeneous system.' }, { kind: 'findvec', A: A, lam: lam3, v: v3 });
  });

  // ---------------------------------------------------------------- la.characteristic-equation
  G('la.characteristic-equation', function (R, ctx) {
    var kind = by(ctx, R.pick(['eig2', 'poly2']), R.pick(['eig2', 'poly2', 'tri3']), R.pick(['block3', 'eig2', 'tri3']));
    if (kind === 'poly2' || kind === 'eig2') {
      var E = eig2(R, { max: 9 }), A = E.A, cp = charPoly2(A), tr = cp.tr, d = cp.det;
      var polyTex = T.terms([[1, '\\lambda^{2}'], [tr.neg(), '\\lambda'], [d, '']]);
      var lines = ['$A - \\lambda I = ' + texLamI(A) + '$ (subtract $\\lambda$ <b>only on the diagonal</b>).',
        '$\\det(A - \\lambda I) = (' + T.terms([[A[0][0], ''], [-1, '\\lambda']]) + ')(' + T.terms([[A[1][1], ''], [-1, '\\lambda']]) + ') - ' + pp(A[0][1], A[1][0]) + '$.',
        'Expand: $' + polyTex + '$. (Shortcut: $\\lambda^{2} - (\\operatorname{tr} A)\\lambda + \\det A$ with $\\operatorname{tr} A = ' + N(tr) + '$ and $\\det A = ' + N(d) + '$.)'];
      if (kind === 'poly2') return test({ q: 'Find the characteristic polynomial $\\det(A - \\lambda I)$ of $A = ' + tex(A) + '$. (Type $\\lambda$ as <code>lambda</code> or use the key.)',
        a: { t: 'expr', v: polyPlain([1, tr.neg(), d], 'lambda'), vars: ['lambda'] }, steps: lines, hint: 'Subtract $\\lambda$ from the diagonal entries only, then take the $2 \\times 2$ determinant.' }, { kind: 'poly2', A: A });
      var ls = E.l.slice().sort(function (x, y) { return x.cmp(y); });
      lines.push('Factor: $' + polyTex + ' = (\\lambda' + T.signed(ls[0].neg()) + ')(\\lambda' + T.signed(ls[1].neg()) + ')$' + (ls[0].isZero() || ls[1].isZero() ? '' : '') + ', so $\\lambda = ' + N(ls[0]) + '$ or $\\lambda = ' + N(ls[1]) + '$.');
      lines.push('Check: the eigenvalues add up to the trace ($' + N(tr) + '$) and multiply to the determinant ($' + N(d) + '$).');
      return test({ q: 'Find the eigenvalues of $A = ' + tex(A) + '$.', a: aSet(ls), steps: lines.map(function (s) { return s.replace(/\(\\lambda\)/g, '\\lambda'); }),
        hint: 'Solve $\\det(A - \\lambda I) = 0$: a quadratic in $\\lambda$.' }, { kind: 'eig2', A: A, l: E.l });
    }
    if (kind === 'tri3') {
      var up = R.coin(), Tm = zeros(3, 3), ds = [R.int(-4, 5), R.int(-4, 5), R.int(-4, 5)];
      for (var i = 0; i < 3; i++) { Tm[i][i] = q(ds[i]); for (var j = 0; j < 3; j++) if (up ? j > i : j < i) Tm[i][j] = q(R.int(-5, 5)); }
      return test({ q: 'Find the eigenvalues of $A = ' + tex(Tm) + '$.', a: aSet(U.uniq(ds).map(function (x) { return q(x); })),
        steps: ['$A$ is ' + (up ? 'upper' : 'lower') + ' triangular, and so is $A - \\lambda I$.', 'The determinant of a triangular matrix is the product of its diagonal: $\\det(A - \\lambda I) = ' + ds.map(function (x) { return '(' + T.terms([[x, ''], [-1, '\\lambda']]).replace(/^0 - /, '-') + ')'; }).join('') + '$.', 'So the eigenvalues are the diagonal entries: $' + U.uniq(ds).map(function (x) { return N(x); }).join(',\\ ') + '$.'],
        hint: 'For a triangular matrix, look at the diagonal.' }, { kind: 'tri3', A: Tm });
    }
    var E2 = eig2(R, { max: 7 }), g = R.intNot(-4, 5, E2.l.map(function (x) { return x.num(); })), A3 = zeros(3, 3);
    A3[0][0] = E2.A[0][0]; A3[0][1] = E2.A[0][1]; A3[1][0] = E2.A[1][0]; A3[1][1] = E2.A[1][1]; A3[2][2] = q(g); A3[2][0] = q(R.int(-3, 3)); A3[2][1] = q(R.int(-3, 3));
    var cp2 = charPoly2(E2.A), lsB = E2.l.concat([q(g)]).sort(function (x, y) { return x.cmp(y); });
    return test({ q: 'Find the eigenvalues of $A = ' + tex(A3) + '$.', a: aSet(lsB),
      steps: ['Expand $\\det(A - \\lambda I)$ along column 3: its only nonzero entry is $' + N(g) + ' - \\lambda$ in the corner.', 'So $\\det(A - \\lambda I) = (' + T.terms([[g, ''], [-1, '\\lambda']]).replace(/^0 - /, '-') + ')\\det' + texLamI(E2.A) + '$.', 'The $2 \\times 2$ part gives $' + T.terms([[1, '\\lambda^{2}'], [cp2.tr.neg(), '\\lambda'], [cp2.det, '']]) + ' = (\\lambda' + T.signed(E2.l[0].neg()) + ')(\\lambda' + T.signed(E2.l[1].neg()) + ')$.', 'Eigenvalues: $' + lsB.map(N).join(',\\ ') + '$.'],
      hint: 'Expand along the column with two zeros.' }, { kind: 'block3', A: A3 });
  });

  // ---------------------------------------------------------------- la.eigenspaces
  G('la.eigenspaces', function (R, ctx) {
    var kind = by(ctx, R.pick(['basis2', 'basis2', 'dim']), R.pick(['basis3', 'dim', 'mult']), R.pick(['basis3two', 'mult', 'dim']));
    if (kind === 'basis2') {
      var E = eig2(R, { max: 10 }), j = R.int(0, 1), lam = E.l[j], B = lamI(E.A, lam), nv = nullVec(B), fi = nv.free[0], pi0 = nv.piv[0];
      var which = fi === 1 ? 'second' : 'first', fx = 'x_{' + (fi + 1) + '}', px = 'x_{' + (pi0 + 1) + '}';
      return test({ q: 'Find a basis for the eigenspace of $A = ' + tex(E.A) + '$ for $\\lambda = ' + N(lam) + '$. Give the basis vector with ' + which + ' entry $1$.', a: aV(nv.v),
        steps: ['The eigenspace is $\\operatorname{Nul}(' + amI(lam) + ')$ with $' + amI(lam) + ' = ' + tex(B) + '$.', 'Row reduce: $' + tex(nv.R) + '$. So $' + px + ' = ' + T.coef(nv.v[pi0], fx) .replace(/^$/, '0') + '$ with $' + fx + '$ free.', 'With $' + fx + ' = 1$: basis $\\left\\{' + texv(nv.v) + '\\right\\}$. The eigenspace is the line through this vector.'],
        hint: 'Solve $(A - \\lambda I)\\mathbf{x} = \\mathbf{0}$.' }, { kind: 'basis', A: E.A, lam: lam, dim: 1 });
    }
    var type = kind === 'basis3two' ? 'diag2' : kind === 'basis3' ? R.pick(['distinct', 'jordan']) : R.pick(['diag2', 'jordan']), E3 = eig3(R, type), A = E3.A;
    if (kind === 'dim' || kind === 'mult') {
      var lamR = q(E3.l), B3 = lamI(A, lamR), rk = rank(B3), geo = 3 - rk, Ee = elim(B3, { mode: 'echelon' });
      var st = ['The eigenspace for $\\lambda = ' + N(lamR) + '$ is $\\operatorname{Nul}(' + amI(lamR) + ')$, and its dimension is the number of free variables.', '$' + amI(lamR) + ' = ' + tex(B3) + '$.'].concat(stepTexts(Ee, 0)).concat([rk + ' pivot' + (rk > 1 ? 's' : '') + ', so ' + geo + ' free variable' + (geo > 1 ? 's' : '') + ': the eigenspace has dimension ' + geo + '.']);
      if (kind === 'dim') return test({ q: 'For $A = ' + tex(A) + '$, $\\lambda = ' + N(lamR) + '$ is an eigenvalue. Find the dimension of its eigenspace.', a: aN(q(geo)), steps: st, hint: 'Row reduce $A - \\lambda I$ and count free variables.' }, { kind: 'dim', A: A, lam: lamR });
      return test({ q: 'The characteristic polynomial of $A = ' + tex(A) + '$ is $' + '-(\\lambda' + T.signed(lamR.neg()) + ')^{2}(\\lambda' + T.signed(q(E3.mu).neg()) + ')$. For $\\lambda = ' + N(lamR) + '$, find the algebraic multiplicity and the geometric multiplicity.',
        a: { t: 'multi', parts: [{ label: 'Algebraic', a: aN(q(2)) }, { label: 'Geometric', a: aN(q(geo)) }] },
        steps: ['Algebraic multiplicity: the power of $(\\lambda' + T.signed(lamR.neg()) + ')$ in the characteristic polynomial, which is $2$.'].concat(st.slice(1)).concat(['Geometric multiplicity: $' + geo + '$. ' + (geo < 2 ? 'It is smaller than the algebraic multiplicity, which will matter for diagonalizing.' : 'It equals the algebraic multiplicity.')]),
        hint: 'Algebraic: count the repeated root. Geometric: dimension of $\\operatorname{Nul}(A - \\lambda I)$.' }, { kind: 'mult', A: A, lam: lamR });
    }
    // basis of a 3x3 eigenspace
    var lam3 = q(type === 'jordan' && R.coin() ? E3.mu : E3.l), B4 = lamI(A, lam3), Rr = rref(B4), piv = pivotsOf(Rr), free = [0, 1, 2].filter(function (c) { return piv.indexOf(c) < 0; });
    var fN = free.length === 1 ? ['t'] : ['s', 't'], S = paramSolution(Rr.map(function (r) { return r.concat([q(0)]); }), 3, fN), Ee2 = elim(B4, { mode: 'rref' });
    var st2 = ['Row reduce $' + amI(lam3) + ' = ' + tex(B4) + '$.'].concat(stepTexts(Ee2, 0)).concat(['Free: ' + lst(free.map(function (c, k) { return '$x_{' + (c + 1) + '} = ' + fN[k] + '$'; })) + '. ' + S.piv.map(function (pc) { return '$x_{' + (pc + 1) + '} = ' + S.texs[pc] + '$'; }).join(', ') + '.']);
    if (free.length === 1) return test({ q: 'For $A = ' + tex(A) + '$, find a basis for the eigenspace of $\\lambda = ' + N(lam3) + '$. Give the vector whose free-variable entry is $1$.', a: aV(S.dirs[0]),
      steps: st2.concat(['Basis: $\\left\\{' + texv(S.dirs[0]) + '\\right\\}$.']), hint: 'Solve $(A - \\lambda I)\\mathbf{x} = \\mathbf{0}$ in parametric form.' }, { kind: 'basis', A: A, lam: lam3, dim: 1, free: free });
    return test({ q: 'For $A = ' + tex(A) + '$, the eigenspace of $\\lambda = ' + N(lam3) + '$ is two-dimensional. With $x_{' + (free[0] + 1) + '} = s$ and $x_{' + (free[1] + 1) + '} = t$, write its vectors as $s\\mathbf{u} + t\\mathbf{v}$. Find $\\mathbf{u}$ and $\\mathbf{v}$.',
      a: { t: 'multi', parts: [{ label: '$\\mathbf{u} =$', a: aV(S.dirs[0]) }, { label: '$\\mathbf{v} =$', a: aV(S.dirs[1]) }] }, steps: st2.concat(['So the eigenspace has basis $\\left\\{' + texv(S.dirs[0]) + ', ' + texv(S.dirs[1]) + '\\right\\}$.']),
      hint: 'Row reduce $A - \\lambda I$; it has one pivot and two free variables.' }, { kind: 'basis2', A: A, lam: lam3, us: S.dirs });
  });

  // ---------------------------------------------------------------- la.diagonalization
  G('la.diagonalization', function (R, ctx) {
    var kind = by(ctx, R.pick(['PDP', 'findD']), R.pick(['isdiag', 'PDP', 'findP']), R.pick(['isdiag', 'findP', 'findD']));
    if (kind === 'PDP') {
      var E = eig2(R, { max: 12 }), A = E.A, D = diag(E.l), Pi = inv(E.P);
      return test({ q: 'Compute $A = PDP^{-1}$ for $P = ' + tex(E.P) + '$ and $D = ' + tex(D) + '$.', a: aM(A),
        steps: ['$P^{-1} = ' + tex(Pi) + '$ (for $2 \\times 2$: swap, negate, divide by $\\det P = ' + N(det(E.P)) + '$).', '$PD = ' + tex(mm(E.P, D)) + '$ (each column of $P$ times its eigenvalue).', '$(PD)P^{-1} = ' + tex(A) + '$.', 'Check: $A' + texv(col(E.P, 0)) + ' = ' + texv(mv(A, col(E.P, 0))) + ' = ' + N(E.l[0]) + texv(col(E.P, 0)) + '$.'],
        hint: 'Find $P^{-1}$ first. Multiplying $PD$ just scales the columns of $P$.' }, { kind: 'PDP', P: E.P, D: D });
    }
    if (kind === 'findD') {
      var E2 = eig2(R, { max: 12 }), sw = R.coin(), P2 = sw ? cols([col(E2.P, 1), col(E2.P, 0)]) : E2.P, D2 = diag(sw ? [E2.l[1], E2.l[0]] : E2.l);
      return test({ q: '$A = ' + tex(E2.A) + '$ is diagonalized by $P = ' + tex(P2) + '$. Find the diagonal matrix $D$ with $A = PDP^{-1}$.', a: aM(D2),
        steps: ['The columns of $P$ are eigenvectors, and $D$ holds the matching eigenvalues in the same order.', 'Column 1: $A' + texv(col(P2, 0)) + ' = ' + texv(mv(E2.A, col(P2, 0))) + ' = ' + N(D2[0][0]) + texv(col(P2, 0)) + '$.', 'Column 2: $A' + texv(col(P2, 1)) + ' = ' + texv(mv(E2.A, col(P2, 1))) + ' = ' + N(D2[1][1]) + texv(col(P2, 1)) + '$.', '$D = ' + tex(D2) + '$.'],
        hint: 'Multiply $A$ by each column of $P$ and read off the scale factor.' }, { kind: 'findD', A: E2.A, P: P2 });
    }
    if (kind === 'findP') {
      var E3 = eig2(R, { firstOne: true, max: 12 }), order = E3.l[0].gt(E3.l[1]) ? [0, 1] : [1, 0], P3 = cols([col(E3.P, order[0]), col(E3.P, order[1])]), D3 = diag([E3.l[order[0]], E3.l[order[1]]]);
      return test({ q: 'Diagonalize $A = ' + tex(E3.A) + '$: find $P$ with $A = PDP^{-1}$ and $D = ' + tex(D3) + '$. Scale each eigenvector so its <b>first entry is $1$</b>.', a: aM(P3),
        steps: ['Column 1 of $P$ is an eigenvector for $\\lambda = ' + N(D3[0][0]) + '$: solve $(' + amI(D3[0][0]) + ')\\mathbf{v} = \\mathbf{0}$ with $' + amI(D3[0][0]) + ' = ' + tex(lamI(E3.A, D3[0][0])) + '$, giving $' + texv(col(P3, 0)) + '$.',
          'Column 2 is an eigenvector for $\\lambda = ' + N(D3[1][1]) + '$: $' + amI(D3[1][1]) + ' = ' + tex(lamI(E3.A, D3[1][1])) + '$ gives $' + texv(col(P3, 1)) + '$.', '$P = ' + tex(P3) + '$. Check: $AP = ' + tex(mm(E3.A, P3)) + ' = PD$.'],
        hint: 'Find an eigenvector for each eigenvalue, in the order they appear in $D$.' }, { kind: 'findP', A: E3.A, P: P3, D: D3 });
    }
    var type = R.pick(['distinct', 'diag2', 'jordan', 'jordan2']), A4, yes, st;
    if (type === 'jordan2') { var lj = R.int(-3, 4), Pj = unimod(R, 2, 4); A4 = mm(mm(Pj, qm([[lj, 1], [0, lj]])), inv(Pj)); yes = false;
      st = ['$\\det(A - \\lambda I) = (\\lambda' + T.signed(-lj) + ')^{2}$: one eigenvalue, $\\lambda = ' + lj + '$, repeated.', '$' + amI(lj) + ' = ' + tex(lamI(A4, q(lj))) + '$ is not zero, so it has rank 1 and the eigenspace is only 1-dimensional.', 'We need 2 independent eigenvectors and have only 1: <b>not</b> diagonalizable.']; }
    else { var E5 = eig3(R, type), lamR = q(E5.l), geo = 3 - rank(lamI(E5.A, lamR)); A4 = E5.A; yes = type !== 'jordan';
      st = type === 'distinct' ? ['The eigenvalues are $' + [E5.l, E5.mu, E5.nu].join(',\\ ') + '$: three different values.', 'Eigenvectors for different eigenvalues are independent, so there are 3 independent eigenvectors: <b>diagonalizable</b>.']
        : ['The eigenvalues are $' + E5.l + '$ (twice) and $' + E5.mu + '$.', 'For $\\lambda = ' + E5.l + '$: $' + amI(E5.l) + ' = ' + tex(lamI(E5.A, lamR)) + '$ has rank ' + (3 - geo) + ', so the eigenspace has dimension ' + geo + '.', yes ? 'Dimensions $2 + 1 = 3$: enough independent eigenvectors, so <b>diagonalizable</b> even though an eigenvalue repeats.' : 'Dimensions $1 + 1 = 2 < 3$: not enough independent eigenvectors, so <b>not</b> diagonalizable.']; }
    var lamsTex = type === 'jordan2' ? '' : ' Its eigenvalues are ' + (type === 'distinct' ? 'all different' : 'known: one is repeated') + '.';
    return test({ q: 'True or false: $A = ' + tex(A4) + '$ is diagonalizable.' + (type === 'distinct' ? ' (Its characteristic polynomial factors with roots ' + [E5.l, E5.mu, E5.nu].map(function (x) { return '$' + x + '$'; }).join(', ') + '.)' : type === 'jordan2' ? '' : ' (Its eigenvalues are $' + E5.l + '$, $' + E5.l + '$ and $' + E5.mu + '$.)'), a: aTF(yes), steps: st,
      hint: 'Diagonalizable means $n$ independent eigenvectors. For a repeated eigenvalue, find the dimension of its eigenspace.' }, { kind: 'isdiag', A: A4, yes: yes });
  });

  // ---------------------------------------------------------------- la.matrix-powers-markov
  G('la.matrix-powers-markov', function (R, ctx) {
    var kind = by(ctx, R.pick(['step', 'steady2']), R.pick(['power', 'steady2', 'step']), R.pick(['power', 'steady3', 'steady2']));
    if (kind === 'power') {
      var E = eig2(R, { small: true, max: 9 }), k = R.int(3, 5), Pi = inv(E.P), Dk = diag(E.l.map(function (l) { return l.pow(k); })), Ak = mm(mm(E.P, Dk), Pi);
      while (maxAbs(Ak) > 400 && k > 2) { k--; Dk = diag(E.l.map(function (l) { return l.pow(k); })); Ak = mm(mm(E.P, Dk), Pi); }
      return test({ q: '$A = PDP^{-1}$ with $P = ' + tex(E.P) + '$, $D = ' + tex(diag(E.l)) + '$ and $P^{-1} = ' + tex(Pi) + '$. Compute $A^{' + k + '}$.', a: aM(Ak),
        steps: ['$A^{' + k + '} = (PDP^{-1})(PDP^{-1})\\cdots = PD^{' + k + '}P^{-1}$, because each $P^{-1}P$ in the middle cancels.', '$D^{' + k + '} = ' + tex(Dk) + '$: just raise the diagonal entries to the power ' + k + '.', '$PD^{' + k + '} = ' + tex(mm(E.P, Dk)) + '$.', '$PD^{' + k + '}P^{-1} = ' + tex(Ak) + '$.'],
        hint: 'Use $A^{k} = PD^{k}P^{-1}$; powers of a diagonal matrix are easy.' }, { kind: 'power', A: E.A, k: k });
    }
    if (kind === 'step' || kind === 'steady2') {
      var a = R.int(1, 5), b = R.intNot(1, 5, a); // P = [[1-a/10, b/10], [a/10, 1-b/10]]
      var Pm = [[q(10 - a).div(10), q(b).div(10)], [q(a).div(10), q(10 - b).div(10)]], dec = function (x) { return x.toDec(1); };
      var Ptex = '\\begin{bmatrix} ' + Pm.map(function (r) { return r.map(dec).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}';
      var ctxs = R.pick([['a city', 'live downtown', 'live in the suburbs'], ['a coffee shop', 'buy coffee', 'buy tea'], ['a bike share', 'are at station A', 'are at station B']]);
      if (kind === 'step') {
        var x0 = [q(R.int(2, 8)).div(10)]; x0.push(q(1).sub(x0[0])); var x1 = mv(Pm, x0);
        return test({ q: 'In ' + ctxs[0] + ', the people who ' + ctxs[1] + ' or ' + ctxs[2] + ' move between the two groups each year by the Markov matrix $P = ' + Ptex + '$ (column $j$ says where group $j$ goes). This year the split is $\\mathbf{x}_{0} = ' + texv(x0.map(dec)) + '$. Find next year\'s split $\\mathbf{x}_{1} = P\\mathbf{x}_{0}$.', a: { t: 'tuple', v: x1.map(function (x) { return x.toDec(2); }) },
          steps: ['$\\mathbf{x}_{1} = P\\mathbf{x}_{0} = ' + Ptex + texv(x0.map(dec)) + '$.', 'First entry: $(' + dec(Pm[0][0]) + ')(' + dec(x0[0]) + ') + (' + dec(Pm[0][1]) + ')(' + dec(x0[1]) + ') = ' + x1[0].toDec(2) + '$. Second: $' + x1[1].toDec(2) + '$.', 'The entries still add up to $1$, as they must.'],
          hint: 'Multiply the matrix by the vector.' }, { kind: 'step', P: Pm, x0: x0 });
      }
      var s = [q(b).div(a + b), q(a).div(a + b)];
      return test({ q: 'A two-state Markov chain has transition matrix $P = ' + Ptex + '$ (columns add up to $1$). Find the steady-state vector $\\mathbf{q}$ (with $P\\mathbf{q} = \\mathbf{q}$ and entries adding up to $1$).', a: aV(s),
        steps: ['Solve $(P - I)\\mathbf{q} = \\mathbf{0}$: $P - I = ' + '\\begin{bmatrix} ' + [[q(-a).div(10), q(b).div(10)], [q(a).div(10), q(-b).div(10)]].map(function (r) { return r.map(dec).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}' + '$.', 'Both rows say $' + dec(q(a).div(10)) + 'q_{1} = ' + dec(q(b).div(10)) + 'q_{2}$, so $\\mathbf{q}$ is a multiple of $' + texv([b, a]) + '$.', 'Scale so the entries add up to $1$: divide by $' + b + ' + ' + a + ' = ' + (a + b) + '$. $\\mathbf{q} = ' + texv(s) + '$.', 'This is the eigenvector for $\\lambda = 1$; in the long run $P^{k}\\mathbf{x}_{0} \\to \\mathbf{q}$ because the other eigenvalue, $' + dec(q(10 - a - b).div(10)) + '$, has size less than $1$.'],
        hint: 'Solve $P\\mathbf{q} = \\mathbf{q}$, then scale so the entries sum to $1$.' }, { kind: 'steady2', P: Pm });
    }
    // 3-state chain with a symmetric flow matrix
    var Fm; do { Fm = zeros(3, 3); for (var i = 0; i < 3; i++) for (var j = i; j < 3; j++) { var v = q(R.int(i === j ? 1 : 0, 3)); Fm[i][j] = v; Fm[j][i] = v; } } while (Fm[0][1].isZero() && Fm[0][2].isZero() || Fm[1][2].isZero() && Fm[0][1].isZero() || Fm[0][2].isZero() && Fm[1][2].isZero());
    var cs = [0, 1, 2].map(function (j) { return Fm.reduce(function (s2, r) { return s2.add(r[j]); }, q(0)); }), tot = cs.reduce(function (s2, x) { return s2.add(x); }, q(0));
    var P3 = Fm.map(function (r) { return r.map(function (x, j) { return x.div(cs[j]); }); }), st3 = cs.map(function (x) { return x.div(tot); });
    var E3 = elim(lamI(P3, q(1)), { mode: 'rref' }), nv = nullVec(lamI(P3, q(1)));
    return test({ q: 'Find the steady-state vector $\\mathbf{q}$ (entries adding up to $1$) of the Markov matrix $$P = ' + tex(P3) + '$$', a: aV(st3),
      steps: ['Solve $(P - I)\\mathbf{q} = \\mathbf{0}$. Row reduce $P - I$.'].concat(stepTexts(E3, 0)).concat(['A solution is $' + texv(nv.v) + '$ (free variable set to $1$).', 'Divide by the sum of its entries, $' + N(nv.v.reduce(function (s2, x) { return s2.add(x); }, q(0))) + '$: $\\mathbf{q} = ' + texv(st3) + '$.', 'Check: $P\\mathbf{q} = ' + texv(mv(P3, st3)) + '$.']),
      hint: 'The steady state is the eigenvector for $\\lambda = 1$, scaled so its entries add up to $1$.' }, { kind: 'steady3', P: P3 });
  });

  // ---------------------------------------------------------------- la.complex-eigenvalues
  function cplx(a, b) { a = q(a); b = q(b); if (b.isZero()) return a.toPlain(); var bs = b.abs().eq(1) ? 'i' : b.abs().toPlain() + '*i'; return (a.isZero() ? '' : a.toPlain()) + (b.sign() < 0 ? '-' : a.isZero() ? '' : '+') + bs; }
  function cplxTex(a, b) { a = q(a); b = q(b); return b.isZero() ? N(a) : (a.isZero() ? (b.sign() < 0 ? '-' : '') : N(a) + (b.sign() < 0 ? ' - ' : ' + ')) + (b.abs().eq(1) ? '' : b.abs().toTex()) + 'i'; }
  G('la.complex-eigenvalues', function (R, ctx) {
    var kind = by(ctx, R.pick(['rotscale', 'rotscale', 'general']), R.pick(['general', 'modulus', 'rotscale']), R.pick(['general', 'modulus', 'eigvec']));
    var a = R.int(-4, 4), b = R.nz(1, 4);
    if (kind === 'rotscale' || kind === 'general') {
      var A = qm([[a, -b], [b, a]]);
      if (kind === 'general') { var t = 0; do { var Pm = unimod(R, 2, 3); A = mm(mm(Pm, qm([[a, -b], [b, a]])), inv(Pm)); } while (maxAbs(A) > 12 && ++t < 30); }
      var tr = A[0][0].add(A[1][1]), d = det(A), disc = tr.mul(tr).sub(d.mul(4));
      return test({ q: 'Find the (complex) eigenvalues of $A = ' + tex(A) + '$.', a: aSet([cplx(a, b), cplx(a, -b)]),
        steps: ['$\\det(A - \\lambda I) = \\lambda^{2} - (\\operatorname{tr} A)\\lambda + \\det A = ' + T.terms([[1, '\\lambda^{2}'], [tr.neg(), '\\lambda'], [d, '']]) + '$.', 'Quadratic formula: $\\lambda = \\dfrac{' + N(tr) + ' \\pm \\sqrt{' + N(disc) + '}}{2}$. The number under the root is negative, so the roots are complex.', '$\\sqrt{' + N(disc) + '} = ' + N(2 * b) + 'i$, so $\\lambda = ' + cplxTex(a, b) + '$ and $\\lambda = ' + cplxTex(a, -b) + '$: a conjugate pair.'],
        hint: 'Use $\\lambda^{2} - (\\operatorname{tr} A)\\lambda + \\det A = 0$ and the quadratic formula.' }, { kind: 'eig', A: A, a: a, b: b });
    }
    if (kind === 'modulus') {
      var pick = R.pick([[1, 1, 45], [1, -1, -45], [0, 1, 90], [-1, 1, 135], [0, -1, -90], [-1, -1, -135]]), k = R.pick([1, 2, 3]), aa = pick[0] * k, bb = pick[1] * k;
      var A2 = qm([[aa, -bb], [bb, aa]]), r = sqrtQ(aa * aa + bb * bb);
      return test({ q: '$A = ' + tex(A2) + '$ has eigenvalues $' + cplxTex(aa, bb) + '$ and $' + cplxTex(aa, -bb) + '$. It acts as a rotation combined with a scaling. Find the scale factor $r$ and the rotation angle $\\varphi$ (in degrees, between $-180$ and $180$).',
        a: { t: 'multi', parts: [{ label: '$r =$', a: { t: 'num', v: r.plain } }, { label: '$\\varphi =$', a: aN(q(pick[2])) }] },
        steps: ['A matrix $' + T.mat([['a', '-b'], ['b', 'a']]) + '$ is $r$ times a rotation by $\\varphi$, where $a + bi = r(\\cos\\varphi + i\\sin\\varphi)$.', '$r = |' + cplxTex(aa, bb) + '| = \\sqrt{' + pp(aa, aa) + ' + ' + pp(bb, bb) + '} = ' + r.tex + '$.', 'The point $(' + aa + ', ' + bb + ')$ makes the angle $\\varphi = ' + T.deg(pick[2]) + '$ with the positive real axis.', 'So $A = ' + r.tex + '\\begin{bmatrix} \\cos\\varphi & -\\sin\\varphi \\\\ \\sin\\varphi & \\cos\\varphi \\end{bmatrix}$ with $\\varphi = ' + T.deg(pick[2]) + '$.'],
        hint: 'Write the eigenvalue $a + bi$ in polar form.' }, { kind: 'modulus', a: aa, b: bb, deg: pick[2] });
    }
    // eigenvector of [[a,-b],[b,a]] for a + bi is (1, -i)
    var A3 = qm([[a, -b], [b, a]]), which = R.coin();
    return test({ q: 'Find the eigenvector of the form $(1, y)$ for the eigenvalue $\\lambda = ' + cplxTex(a, which ? b : -b) + '$ of $A = ' + tex(A3) + '$. ($y$ is a complex number; type $i$ for the imaginary unit.)', a: { t: 'tuple', v: ['1', which ? '-i' : 'i'] },
      steps: ['$A - \\lambda I = ' + '\\begin{bmatrix} ' + cplxTex(0, which ? -b : b) + ' & ' + N(-b) + ' \\\\ ' + N(b) + ' & ' + cplxTex(0, which ? -b : b) + ' \\end{bmatrix}$.', 'Row 1 with $\\mathbf{v} = (1, y)$: $' + cplxTex(0, which ? -b : b) + T.coef(-b, 'y', false) + ' = 0$, so $y = ' + (which ? '-i' : 'i') + '$.', 'Check row 2: $' + N(b) + ' + (' + cplxTex(0, which ? -b : b) + ')(' + (which ? '-i' : 'i') + ') = ' + N(b) + ' - ' + N(b) + ' = 0$.'],
      hint: 'Subtract $\\lambda$ on the diagonal and solve the first row for $y$.' }, { kind: 'eigvec', a: a, b: b, which: which });
  });

  // ---------------------------------------------------------------- la.similar-matrices
  G('la.similar-matrices', function (R, ctx) {
    var kind = by(ctx, R.pick(['compute', 'invariant']), R.pick(['compute', 'similar', 'invariant']), R.pick(['similar', 'compute', 'jordan']));
    if (kind === 'compute') {
      var A = randM(R, 2, 2, -4, 5), P = unimod(R, 2, 4), Pi = inv(P), B = mm(mm(Pi, A), P);
      return test({ q: 'Compute $B = P^{-1}AP$ for $A = ' + tex(A) + '$ and $P = ' + tex(P) + '$.', a: aM(B),
        steps: ['$P^{-1} = ' + tex(Pi) + '$.', '$AP = ' + tex(mm(A, P)) + '$.', '$P^{-1}(AP) = ' + tex(B) + '$.', 'Check the invariants: $\\operatorname{tr} B = ' + N(B[0][0].add(B[1][1])) + ' = \\operatorname{tr} A$ and $\\det B = ' + N(det(B)) + ' = \\det A$.'],
        hint: 'Find $P^{-1}$, then multiply $P^{-1}(AP)$.' }, { kind: 'compute', A: A, P: P });
    }
    if (kind === 'invariant') {
      var A2 = randM(R, 3, 3, -3, 4), w = R.pick(['trace', 'det']), v = w === 'trace' ? A2[0][0].add(A2[1][1]).add(A2[2][2]) : det(A2);
      return test({ q: '$B = P^{-1}AP$ for some invertible $P$, where $A = ' + tex(A2) + '$. Find ' + (w === 'trace' ? '$\\operatorname{tr} B$' : '$\\det B$') + '.', a: aN(v),
        steps: [w === 'trace' ? 'Similar matrices have the same trace: $\\operatorname{tr}(P^{-1}AP) = \\operatorname{tr}(APP^{-1}) = \\operatorname{tr} A$.' : 'Similar matrices have the same determinant: $\\det(P^{-1}AP) = \\det P^{-1}\\det A\\det P = \\det A$.', w === 'trace' ? '$\\operatorname{tr} A = ' + N(A2[0][0]) + T.signed(A2[1][1]) + T.signed(A2[2][2]) + ' = ' + N(v) + '$.' : '$\\det A = ' + N(v) + '$ (cofactor expansion).', 'No need to know $P$.'],
        hint: 'Similar matrices share trace, determinant and eigenvalues.' }, { kind: 'invariant', A: A2, w: w, v: v });
    }
    if (kind === 'similar') {
      var E1 = eig2(R, { max: 9 }), same = R.coin(), Bm, why;
      if (same) { var E2; var t = 0; do { var P2 = unimod(R, 2, 4); Bm = mm(mm(P2, diag(E1.l)), inv(P2)); } while ((eqM(Bm, E1.A) || maxAbs(Bm) > 12) && ++t < 30); if (eqM(Bm, E1.A)) Bm = diag(E1.l); }
      else { var E3 = eig2(R, { max: 9 }); Bm = E3.A; if (E3.l.map(String).sort().join() === E1.l.map(String).sort().join()) { same = true; } }
      var trA = E1.A[0][0].add(E1.A[1][1]), trB = Bm[0][0].add(Bm[1][1]), dA = det(E1.A), dB = det(Bm);
      var sim = trA.eq(trB) && dA.eq(dB);
      return test({ q: 'True or false: $A = ' + tex(E1.A) + '$ and $B = ' + tex(Bm) + '$ are similar.', a: aTF(sim),
        steps: ['$\\operatorname{tr} A = ' + N(trA) + '$, $\\det A = ' + N(dA) + '$; $\\operatorname{tr} B = ' + N(trB) + '$, $\\det B = ' + N(dB) + '$.',
          sim ? 'Same trace and determinant, so the same characteristic polynomial $' + T.terms([[1, '\\lambda^{2}'], [trA.neg(), '\\lambda'], [dA, '']]) + '$ and the same eigenvalues, which are <b>distinct</b>. Each matrix is then similar to the same diagonal matrix $D$, so they are similar to each other: <b>true</b>.' : 'Similar matrices must have the same trace and determinant. These differ, so <b>false</b>.'],
        hint: 'Compare trace and determinant first. If they match and the eigenvalues are distinct, both are similar to the same diagonal matrix.' }, { kind: 'similar', A: E1.A, B: Bm, sim: sim });
    }
    var l = R.nz(-3, 4), Pj = unimod(R, 2, 3), J = mm(mm(Pj, qm([[l, 1], [0, l]])), inv(Pj));
    return test({ q: 'True or false: $A = ' + tex(J) + '$ is similar to $' + T.coef(l, 'I') + ' = ' + tex(sc(l, eye(2))) + '$.', a: aTF(false),
      steps: ['Both have trace $' + 2 * l + '$ and determinant $' + l * l + '$, so the same eigenvalues ($' + l + '$, twice). That is necessary but not enough.', 'If $A = P(' + T.coef(l, 'I') + ')P^{-1}$, then $A = ' + T.coef(l, 'PP^{-1}') + ' = ' + T.coef(l, 'I') + '$. The only matrix similar to $' + T.coef(l, 'I') + '$ is itself.', 'Since $A \\neq ' + T.coef(l, 'I') + '$, they are <b>not</b> similar.'],
      hint: 'What is $P(cI)P^{-1}$?' }, { kind: 'jordan', A: J, l: l });
  });


  // ================================================================ Unit 7: Orthogonality and Least Squares

  var PYTH = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]], PYTH3 = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15]];
  function signsRand(R, v) { return v.map(function (x) { return R.coin() ? x : -x; }); }
  function nrmSq(v) { return dot(v, v); }
  function sq2(x) { return '(' + N(x) + ')^{2}'; }
  function normTex(v) { var s = sqrtQ(nrmSq(v)); return s; }
  function orthPartner(R, u, lo, hi) { // an integer vector orthogonal to u, not zero, entries small
    for (var t = 0; t < 60; t++) {
      var v = randV(R, u.length, lo || -4, hi || 4), w = vsub(vsc(nrmSq(u), v), vsc(dot(u, v), u));
      if (isZeroV(w)) continue;
      var g = U.gcd.apply(null, w.map(function (x) { return x.num(); })) || 1; w = w.map(function (x) { return x.div(g); });
      if (maxAbs([w]) <= 9) return w;
    }
    var n = u.length, w0 = zeros(1, n)[0], i0 = -1; for (var i = 0; i < n; i++) if (!u[i].isZero()) { i0 = i; break; }
    if (i0 < 0) { w0[0] = q(1); return w0; }
    var j0 = (i0 + 1) % n; w0[i0] = u[j0].neg(); w0[j0] = u[i0]; return w0;
  }
  function projTex(y, u, name) { return '\\dfrac{\\mathbf{y}\\cdot\\mathbf{' + name + '}}{\\mathbf{' + name + '}\\cdot\\mathbf{' + name + '}}\\mathbf{' + name + '}'; }

  // ---------------------------------------------------------------- la.orthogonality
  G('la.orthogonality', function (R, ctx) {
    var kind = by(ctx, R.pick(['dot', 'norm', 'orth', 'unit']), R.pick(['orth', 'k', 'unit', 'dist']), R.pick(['k', 'unit', 'dist', 'norm']));
    var n = R.pick([3, 3, 4]);
    if (kind === 'dot' || kind === 'orth') {
      var u = randV(R, n, -5, 5), v = kind === 'orth' && R.coin() ? orthPartner(R, u) : randV(R, n, -5, 5), d = dot(u, v);
      if (kind === 'dot') return test({ q: 'Compute $\\mathbf{u}\\cdot\\mathbf{v}$ for $\\mathbf{u} = ' + texv(u) + '$ and $\\mathbf{v} = ' + texv(v) + '$.', a: aN(d),
        steps: ['Multiply matching entries and add: $' + prods(u, v) + '$.', '$= ' + N(d) + '$.'], hint: 'Entry by entry, multiply, then add.' }, { kind: 'dot', u: u, v: v });
      return test({ q: 'True or false: $\\mathbf{u} = ' + texv(u) + '$ and $\\mathbf{v} = ' + texv(v) + '$ are orthogonal.', a: aTF(d.isZero()),
        steps: ['Orthogonal means $\\mathbf{u}\\cdot\\mathbf{v} = 0$.', '$\\mathbf{u}\\cdot\\mathbf{v} = ' + prods(u, v) + ' = ' + N(d) + '$.', d.isZero() ? 'It is $0$: <b>true</b>.' : 'It is not $0$: <b>false</b>.'], hint: 'Compute the dot product.' }, { kind: 'orth', u: u, v: v });
    }
    if (kind === 'norm' || kind === 'unit') {
      var useP = kind === 'unit' && ctx.level < 3 || kind === 'norm' && R.coin(), base, v2;
      if (useP) { var tr0 = R.pick(PYTH3); base = R.shuffle(tr0.slice(0, 3)); v2 = signsRand(R, base).map(q); if (R.chance(0.3)) v2 = vsc(R.pick([2, 3]), v2); }
      else { v2 = randV(R, n === 4 ? 3 : n, -4, 5); if (isZeroV(v2)) v2[0] = q(1); }
      var s = sqrtQ(nrmSq(v2));
      if (kind === 'norm') return test({ q: 'Find the length $\\lVert\\mathbf{v}\\rVert$ of $\\mathbf{v} = ' + texv(v2) + '$.', a: { t: 'num', v: s.plain },
        steps: ['$\\lVert\\mathbf{v}\\rVert = \\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$.', '$\\mathbf{v}\\cdot\\mathbf{v} = ' + v2.map(sq2).join(' + ') + ' = ' + N(nrmSq(v2)) + '$.', '$\\lVert\\mathbf{v}\\rVert = \\sqrt{' + N(nrmSq(v2)) + '} = ' + s.tex + '$.'], hint: 'Square the entries, add, take the square root.' }, { kind: 'norm', v: v2 });
      var uv = s.exact ? v2.map(function (x) { return x.div(q(s.plain)); }) : null;
      var spec = s.exact ? aV(uv) : { t: 'tuple', v: v2.map(function (x) { return x.isZero() ? '0' : '(' + x.toPlain() + ')/sqrt(' + nrmSq(v2).toPlain() + ')'; }) };
      var shown = s.exact ? texv(uv) : texv(v2.map(function (x) { return rtTex(x.div(nrmSq(v2)), nrmSq(v2).num()); }));
      return test({ q: 'Find the unit vector in the direction of $\\mathbf{v} = ' + texv(v2) + '$.', a: spec,
        steps: ['Divide $\\mathbf{v}$ by its length.', '$\\lVert\\mathbf{v}\\rVert = \\sqrt{' + N(nrmSq(v2)) + '} = ' + s.tex + '$.', '$\\mathbf{u} = \\dfrac{1}{' + s.tex + '}' + texv(v2) + ' = ' + shown + '$.', 'Check: its length is $1$.'],
        hint: 'Find $\\lVert\\mathbf{v}\\rVert$, then divide each entry by it.' }, { kind: 'unit', v: v2 });
    }
    if (kind === 'k') {
      var u3 = randV(R, 3, -5, 5, true), a = R.int(-5, 5), c = R.int(-5, 5), j = R.int(0, 2), others = [0, 1, 2].filter(function (x) { return x !== j; });
      var vv = []; vv[others[0]] = q(a); vv[others[1]] = q(c);
      var rest = u3[others[0]].mul(a).add(u3[others[1]].mul(c)), k = rest.neg().div(u3[j]);
      var vshow = [0, 1, 2].map(function (i) { return i === j ? 'k' : vv[i]; });
      return test({ q: 'For what value of $k$ are $\\mathbf{u} = ' + texv(u3) + '$ and $\\mathbf{v} = ' + texv(vshow) + '$ orthogonal?', a: aN(k),
        steps: ['Set $\\mathbf{u}\\cdot\\mathbf{v} = 0$: $' + [0, 1, 2].map(function (i) { return i === j ? '(' + N(u3[i]) + ')k' : pp(u3[i], vv[i]); }).join(' + ') + ' = 0$.', 'That is $' + T.coef(u3[j], 'k') + T.signed(rest) + ' = 0$, so $k = ' + N(k) + '$.'], hint: 'Write the dot product, set it equal to $0$, and solve for $k$.' }, { kind: 'k', u: u3, v: [0, 1, 2].map(function (i) { return i === j ? k : vv[i]; }) });
    }
    var p1 = randV(R, 3, -4, 5), p2 = randV(R, 3, -4, 5), dvec = vsub(p1, p2);
    if (isZeroV(dvec)) { p2 = p2.slice(); p2[0] = p2[0].add(3); dvec = vsub(p1, p2); }
    var sd = sqrtQ(nrmSq(dvec));
    return test({ q: 'Find the distance between $\\mathbf{u} = ' + texv(p1) + '$ and $\\mathbf{v} = ' + texv(p2) + '$.', a: { t: 'num', v: sd.plain },
      steps: ['The distance is $\\lVert\\mathbf{u} - \\mathbf{v}\\rVert$.', '$\\mathbf{u} - \\mathbf{v} = ' + texv(dvec) + '$.', '$\\lVert\\mathbf{u} - \\mathbf{v}\\rVert = \\sqrt{' + dvec.map(sq2).join(' + ') + '} = \\sqrt{' + N(nrmSq(dvec)) + '} = ' + sd.tex + '$.'],
      hint: 'Subtract, then take the length.' }, { kind: 'dist', u: p1, v: p2 });
  });

  // ---------------------------------------------------------------- la.orthogonal-complements
  G('la.orthogonal-complements', function (R, ctx) {
    var kind = by(ctx, R.pick(['inperp', 'dim', 'line']), R.pick(['line', 'plane', 'inperp']), R.pick(['plane', 'line', 'rowspace']));
    if (kind === 'inperp') {
      var w1 = randV(R, 3, -4, 4), w2 = orthPartner(R, w1), n = cols([w1, w2]), yes = R.coin(), z = yes ? (function () { var c = [w1[1].mul(w2[2]).sub(w1[2].mul(w2[1])), w1[2].mul(w2[0]).sub(w1[0].mul(w2[2])), w1[0].mul(w2[1]).sub(w1[1].mul(w2[0]))]; var g = U.gcd.apply(null, c.map(function (x) { return x.num(); })) || 1; var fz = R.pick([1, -1, 2]); return c.map(function (x) { return x.div(g).mul(fz); }); })() : randV(R, 3, -4, 4);
      if (isZeroV(w1)) w1[0] = q(1);
      var d1 = dot(z, w1), d2 = dot(z, w2), inside = d1.isZero() && d2.isZero();
      return test({ q: 'Let $W = \\operatorname{Span}\\{' + texv(w1) + ', ' + texv(w2) + '\\}$. True or false: $\\mathbf{z} = ' + texv(z) + '$ is in $W^{\\perp}$.', a: aTF(inside),
        steps: ['$\\mathbf{z}$ is in $W^{\\perp}$ exactly when it is orthogonal to every vector in a spanning set of $W$.', '$\\mathbf{z}\\cdot\\mathbf{w}_{1} = ' + prods(z, w1) + ' = ' + N(d1) + '$ and $\\mathbf{z}\\cdot\\mathbf{w}_{2} = ' + prods(z, w2) + ' = ' + N(d2) + '$.', inside ? 'Both are $0$: <b>true</b>.' : 'Not both $0$: <b>false</b>.'],
        hint: 'Dot $\\mathbf{z}$ with each spanning vector.' }, { kind: 'inperp', w: [w1, w2], z: z, inside: inside });
    }
    if (kind === 'dim') {
      var nn = R.int(3, 7), k = R.int(1, nn - 1);
      return test({ q: '$W$ is a subspace of $\\mathbb{R}^{' + nn + '}$ with $\\dim W = ' + k + '$. Find $\\dim W^{\\perp}$.', a: aN(q(nn - k)),
        steps: ['If the rows of a matrix $A$ form a basis of $W$, then $W^{\\perp} = \\operatorname{Nul} A$.', '$A$ is $' + k + ' \\times ' + nn + '$ with rank ' + k + ', so by rank–nullity $\\dim \\operatorname{Nul} A = ' + nn + ' - ' + k + ' = ' + (nn - k) + '$.', 'In general $\\dim W + \\dim W^{\\perp} = n$.'],
        hint: 'The dimensions of $W$ and $W^{\\perp}$ add up to $n$.' }, { kind: 'dim', n: nn, k: k });
    }
    if (kind === 'line') { // W = span{w1, w2} in R3, W-perp is a line
      var a1, a2; do { a1 = randV(R, 3, -3, 3); a2 = randV(R, 3, -3, 3); } while (rank([a1, a2]) < 2);
      var nv = nullVec([a1, a2]), last = nv.v; // free var = last free column, entry 1
      var E = elim([a1, a2], { mode: 'rref' }), fi = nv.free[nv.free.length - 1];
      return test({ q: 'Let $W = \\operatorname{Span}\\{' + texv(a1) + ', ' + texv(a2) + '\\}$ in $\\mathbb{R}^{3}$. $W^{\\perp}$ is a line. Find the vector spanning it whose entry ' + (fi + 1) + ' is $1$.', a: aV(last),
        steps: ['$W^{\\perp}$ is the set of $\\mathbf{x}$ with $\\mathbf{w}_{1}\\cdot\\mathbf{x} = 0$ and $\\mathbf{w}_{2}\\cdot\\mathbf{x} = 0$: the null space of the matrix with rows $\\mathbf{w}_{1}^{T}$ and $\\mathbf{w}_{2}^{T}$.', 'Row reduce $' + tex([a1, a2]) + '$.'].concat(stepTexts(E, 0)).concat(['With $x_{' + (fi + 1) + '} = 1$: $\\mathbf{x} = ' + texv(last) + '$. Check: $\\mathbf{w}_{1}\\cdot\\mathbf{x} = ' + N(dot(a1, last)) + '$ and $\\mathbf{w}_{2}\\cdot\\mathbf{x} = ' + N(dot(a2, last)) + '$.']),
        hint: 'Put the spanning vectors in the rows of a matrix and find its null space.' }, { kind: 'line', w: [a1, a2], free: fi });
    }
    if (kind === 'plane') {
      var u = randV(R, 3, -4, 4); if (u[0].isZero()) u[0] = q(R.pick([1, -1, 2]));
      var S = paramSolution([u.concat([q(0)])].map(function (r) { var s = r[0]; return r.map(function (x) { return x.div(s); }); }), 3, ['s', 't']);
      return test({ q: 'Let $W = \\operatorname{Span}\\{' + texv(u) + '\\}$ in $\\mathbb{R}^{3}$. With $x_{2} = s$ and $x_{3} = t$, write $W^{\\perp}$ as all vectors $s\\mathbf{a} + t\\mathbf{b}$. Find $\\mathbf{a}$ and $\\mathbf{b}$.',
        a: { t: 'multi', parts: [{ label: '$\\mathbf{a} =$', a: aV(S.dirs[0]) }, { label: '$\\mathbf{b} =$', a: aV(S.dirs[1]) }] },
        steps: ['$W^{\\perp}$ is the plane $' + T.terms([[u[0], 'x_{1}'], [u[1], 'x_{2}'], [u[2], 'x_{3}']]) + ' = 0$ (dot product with $' + texv(u) + '$ equal to $0$).', 'Solve for $x_{1}$: $x_{1} = ' + S.texs[0] + '$.', 'So $\\mathbf{x} = s' + texv(S.dirs[0]) + ' + t' + texv(S.dirs[1]) + '$.'],
        hint: 'One equation, $\\mathbf{u}\\cdot\\mathbf{x} = 0$, in three unknowns: two free variables.' }, { kind: 'plane', u: u, ab: S.dirs });
    }
    var A = randRankMatrix(R, 2, 3, [0, 1], 6), nvr = nullVec(A).v, fct = R.pick([1, 2, -1]), cands = [nvr.map(function (x) { return x.mul(fct); })];
    var wr1 = A[0].slice(), wr2 = vadd(A[0], A[1]), wr3 = vadd(nvr, A[0]);
    var ch = uniqStr(['$' + texv(cands[0]) + '$', '$' + texv(wr1) + '$', '$' + texv(wr2) + '$', '$' + texv(wr3) + '$']);
    return test({ q: 'Let $A = ' + tex(A) + '$. Which vector is orthogonal to every row of $A$ (that is, lies in $(\\operatorname{Row} A)^{\\perp}$)?', a: { t: 'mc', choices: ch, v: 0 },
      steps: ['$(\\operatorname{Row} A)^{\\perp} = \\operatorname{Nul} A$: $A\\mathbf{x} = \\mathbf{0}$ says exactly that $\\mathbf{x}$ is orthogonal to each row.', 'Test: $A' + texv(cands[0]) + ' = ' + texv(mv(A, cands[0])) + '$, so that vector works. The others give a nonzero product.'],
      hint: 'Multiply $A$ by each candidate: you want $\\mathbf{0}$.' }, { kind: 'rowspace', A: A, x: cands[0] });
  });

  // ---------------------------------------------------------------- la.orthogonal-projections
  G('la.orthogonal-projections', function (R, ctx) {
    var kind = by(ctx, R.pick(['line', 'line', 'plane']), R.pick(['line', 'plane', 'decomp']), R.pick(['plane', 'dist', 'nonorth']));
    if (kind === 'line') {
      var n = R.pick([2, 3]), u = randV(R, n, -3, 4); if (isZeroV(u)) u[0] = q(2); var y = randV(R, n, -5, 6), c = dot(y, u).div(nrmSq(u)), pr = vsc(c, u);
      return test({ q: 'Find the orthogonal projection of $\\mathbf{y} = ' + texv(y) + '$ onto the line through $\\mathbf{u} = ' + texv(u) + '$.', a: aV(pr),
        steps: ['$\\hat{\\mathbf{y}} = ' + projTex(y, u, 'u') + '$.', '$\\mathbf{y}\\cdot\\mathbf{u} = ' + N(dot(y, u)) + '$ and $\\mathbf{u}\\cdot\\mathbf{u} = ' + N(nrmSq(u)) + '$.', '$\\hat{\\mathbf{y}} = ' + T.frac(dot(y, u), nrmSq(u)) + texv(u) + ' = ' + texv(pr) + '$.', 'Check: $\\mathbf{y} - \\hat{\\mathbf{y}} = ' + texv(vsub(y, pr)) + '$ is orthogonal to $\\mathbf{u}$ (dot product $' + N(dot(vsub(y, pr), u)) + '$).'],
        hint: 'Use $\\dfrac{\\mathbf{y}\\cdot\\mathbf{u}}{\\mathbf{u}\\cdot\\mathbf{u}}\\mathbf{u}$.' }, { kind: 'line', y: y, u: u });
    }
    var u1 = randV(R, 3, -3, 3); if (isZeroV(u1)) u1 = [q(1), q(1), q(0)];
    var u2 = orthPartner(R, u1, -3, 3), yv = randV(R, 3, -5, 6);
    if (kind === 'nonorth') {
      var w1 = u1, w2 = vadd(u2, vsc(R.nz(-1, 1), u1)), Aw = cols([w1, w2]), AtA = mm(tr(Aw), Aw), Atb = mv(tr(Aw), yv), xh = mv(inv(AtA), Atb), ph = mv(Aw, xh);
      var naive = vadd(vsc(dot(yv, w1).div(nrmSq(w1)), w1), vsc(dot(yv, w2).div(nrmSq(w2)), w2));
      return test({ q: 'Find the orthogonal projection of $\\mathbf{y} = ' + texv(yv) + '$ onto $W = \\operatorname{Span}\\{\\mathbf{w}_{1}, \\mathbf{w}_{2}\\}$ with $\\mathbf{w}_{1} = ' + texv(w1) + '$, $\\mathbf{w}_{2} = ' + texv(w2) + '$. (Careful: these are not orthogonal.)', a: aV(ph),
        steps: ['$\\mathbf{w}_{1}\\cdot\\mathbf{w}_{2} = ' + N(dot(w1, w2)) + ' \\neq 0$, so adding the two separate projections would be wrong (it would give $' + texv(naive) + '$).', 'Instead solve the normal equations $A^{T}A\\mathbf{c} = A^{T}\\mathbf{y}$ with $A = [\\,\\mathbf{w}_{1}\\ \\mathbf{w}_{2}\\,]$: $A^{T}A = ' + tex(AtA) + '$, $A^{T}\\mathbf{y} = ' + texv(Atb) + '$.', 'Solving gives $\\mathbf{c} = ' + texv(xh) + '$.', '$\\hat{\\mathbf{y}} = A\\mathbf{c} = ' + texv(ph) + '$. Check: $\\mathbf{y} - \\hat{\\mathbf{y}} = ' + texv(vsub(yv, ph)) + '$ is orthogonal to both $\\mathbf{w}_{1}$ and $\\mathbf{w}_{2}$.'],
        hint: 'With a non-orthogonal basis, use the normal equations (or make the basis orthogonal first).' }, { kind: 'nonorth', y: yv, w: [w1, w2] });
    }
    var c1 = dot(yv, u1).div(nrmSq(u1)), c2 = dot(yv, u2).div(nrmSq(u2)), ph2 = vadd(vsc(c1, u1), vsc(c2, u2)), z = vsub(yv, ph2);
    var base = ['$\\mathbf{u}_{1}\\cdot\\mathbf{u}_{2} = 0$, so the basis is orthogonal and we may project onto each and add.', '$\\dfrac{\\mathbf{y}\\cdot\\mathbf{u}_{1}}{\\mathbf{u}_{1}\\cdot\\mathbf{u}_{1}} = ' + T.frac(dot(yv, u1), nrmSq(u1)) + '$ and $\\dfrac{\\mathbf{y}\\cdot\\mathbf{u}_{2}}{\\mathbf{u}_{2}\\cdot\\mathbf{u}_{2}} = ' + T.frac(dot(yv, u2), nrmSq(u2)) + '$.', '$\\hat{\\mathbf{y}} = ' + combTex([c1, c2], [u1, u2]) + ' = ' + texv(ph2) + '$.'];
    var intro = '$\\mathbf{y} = ' + texv(yv) + '$, $\\mathbf{u}_{1} = ' + texv(u1) + '$, $\\mathbf{u}_{2} = ' + texv(u2) + '$, and $W = \\operatorname{Span}\\{\\mathbf{u}_{1}, \\mathbf{u}_{2}\\}$.';
    if (kind === 'plane') return test({ q: intro + ' Find the orthogonal projection $\\hat{\\mathbf{y}}$ of $\\mathbf{y}$ onto $W$.', a: aV(ph2), steps: base.concat(['Check: $\\mathbf{y} - \\hat{\\mathbf{y}} = ' + texv(z) + '$ is orthogonal to $\\mathbf{u}_{1}$ and $\\mathbf{u}_{2}$.']),
      hint: 'The basis is orthogonal: project onto each vector and add.' }, { kind: 'plane', y: yv, u: [u1, u2] });
    if (kind === 'decomp') return test({ q: intro + ' Write $\\mathbf{y} = \\hat{\\mathbf{y}} + \\mathbf{z}$ with $\\hat{\\mathbf{y}}$ in $W$ and $\\mathbf{z}$ in $W^{\\perp}$. Find $\\mathbf{z}$.', a: aV(z), steps: base.concat(['$\\mathbf{z} = \\mathbf{y} - \\hat{\\mathbf{y}} = ' + texv(z) + '$. Check: $\\mathbf{z}\\cdot\\mathbf{u}_{1} = ' + N(dot(z, u1)) + '$, $\\mathbf{z}\\cdot\\mathbf{u}_{2} = ' + N(dot(z, u2)) + '$.']),
      hint: 'Find $\\hat{\\mathbf{y}}$ first; $\\mathbf{z}$ is what is left over.' }, { kind: 'decomp', y: yv, u: [u1, u2] });
    var sd = sqrtQ(nrmSq(z));
    return test({ q: intro + ' Find the distance from $\\mathbf{y}$ to $W$.', a: { t: 'num', v: sd.plain }, steps: base.concat(['The closest point of $W$ is $\\hat{\\mathbf{y}}$, so the distance is $\\lVert\\mathbf{y} - \\hat{\\mathbf{y}}\\rVert = \\left\\lVert' + texv(z) + '\\right\\rVert = \\sqrt{' + N(nrmSq(z)) + '} = ' + sd.tex + '$.']),
      hint: 'The distance is the length of $\\mathbf{y} - \\hat{\\mathbf{y}}$.' }, { kind: 'dist', y: yv, u: [u1, u2] });
  });

  // ---------------------------------------------------------------- la.gram-schmidt-qr
  var Q3 = [[1, 2, 2], [2, 1, -2], [2, -2, 1]]; // (1/3) Q3 is orthogonal
  G('la.gram-schmidt-qr', function (R, ctx) {
    var kind = by(ctx, R.pick(['gs2', 'gs2', 'unit']), R.pick(['gs2', 'R', 'gs3']), R.pick(['gs3', 'R', 'gs2']));
    if (kind === 'gs2' || kind === 'unit') {
      var x1, x2; do { x1 = randV(R, 3, -3, 3); x2 = randV(R, 3, -3, 4); } while (isZeroV(x1) || rank([x1, x2]) < 2 || dot(x1, x2).isZero());
      var c = dot(x2, x1).div(nrmSq(x1)), v2 = vsub(x2, vsc(c, x1));
      if (kind === 'unit') {
        var tr0 = R.pick(PYTH3), u = signsRand(R, R.shuffle(tr0.slice(0, 3))).map(q), s = q(tr0[3]), ex2 = orthPartner(R, u, -3, 3), w2 = vadd(ex2, vsc(R.nz(-1, 1), u));
        var cc = dot(w2, u).div(nrmSq(u)), vv = vsub(w2, vsc(cc, u));
        return test({ q: 'Gram–Schmidt on $\\mathbf{x}_{1} = ' + texv(u) + '$, $\\mathbf{x}_{2} = ' + texv(w2) + '$ starts with $\\mathbf{v}_{1} = \\mathbf{x}_{1}$. Find the first vector of the <b>orthonormal</b> basis, $\\mathbf{q}_{1} = \\mathbf{v}_{1}/\\lVert\\mathbf{v}_{1}\\rVert$.', a: aV(u.map(function (x) { return x.div(s); })),
          steps: ['$\\lVert\\mathbf{v}_{1}\\rVert = \\sqrt{' + u.map(sq2).join(' + ') + '} = \\sqrt{' + N(nrmSq(u)) + '} = ' + N(s) + '$.', '$\\mathbf{q}_{1} = ' + T.frac(1, s) + texv(u) + ' = ' + texv(u.map(function (x) { return x.div(s); })) + '$.'],
          hint: 'Divide $\\mathbf{v}_{1}$ by its length.' }, { kind: 'unit', u: u, s: s });
      }
      return test({ q: 'Apply Gram–Schmidt to $\\mathbf{x}_{1} = ' + texv(x1) + '$ and $\\mathbf{x}_{2} = ' + texv(x2) + '$. With $\\mathbf{v}_{1} = \\mathbf{x}_{1}$, find $\\mathbf{v}_{2}$ (not normalized).', a: aV(v2),
        steps: ['Subtract from $\\mathbf{x}_{2}$ its projection onto $\\mathbf{v}_{1}$: $\\mathbf{v}_{2} = \\mathbf{x}_{2} - \\dfrac{\\mathbf{x}_{2}\\cdot\\mathbf{v}_{1}}{\\mathbf{v}_{1}\\cdot\\mathbf{v}_{1}}\\mathbf{v}_{1}$.', '$\\mathbf{x}_{2}\\cdot\\mathbf{v}_{1} = ' + N(dot(x2, x1)) + '$ and $\\mathbf{v}_{1}\\cdot\\mathbf{v}_{1} = ' + N(nrmSq(x1)) + '$.', '$\\mathbf{v}_{2} = ' + texv(x2) + T.coef(c.neg(), texv(x1), false) + ' = ' + texv(v2) + '$.', 'Check: $\\mathbf{v}_{2}\\cdot\\mathbf{v}_{1} = ' + N(dot(v2, x1)) + '$.'],
        hint: 'Remove the part of $\\mathbf{x}_{2}$ that points along $\\mathbf{v}_{1}$.' }, { kind: 'gs2', x1: x1, x2: x2 });
    }
    if (kind === 'gs3') {
      var v1 = randV(R, 3, -2, 3); if (isZeroV(v1)) v1 = [q(1), q(1), q(1)];
      var v2b = orthPartner(R, v1, -3, 3), x3; do { x3 = randV(R, 3, -4, 4); } while (rank([v1, v2b, x3]) < 3);
      var c1 = dot(x3, v1).div(nrmSq(v1)), c2 = dot(x3, v2b).div(nrmSq(v2b)), v3 = vsub(vsub(x3, vsc(c1, v1)), vsc(c2, v2b));
      return test({ q: 'Gram–Schmidt has produced the orthogonal vectors $\\mathbf{v}_{1} = ' + texv(v1) + '$ and $\\mathbf{v}_{2} = ' + texv(v2b) + '$. The third input vector is $\\mathbf{x}_{3} = ' + texv(x3) + '$. Find $\\mathbf{v}_{3}$.', a: aV(v3),
        steps: ['$\\mathbf{v}_{3} = \\mathbf{x}_{3} - \\dfrac{\\mathbf{x}_{3}\\cdot\\mathbf{v}_{1}}{\\mathbf{v}_{1}\\cdot\\mathbf{v}_{1}}\\mathbf{v}_{1} - \\dfrac{\\mathbf{x}_{3}\\cdot\\mathbf{v}_{2}}{\\mathbf{v}_{2}\\cdot\\mathbf{v}_{2}}\\mathbf{v}_{2}$ (subtract the projection onto $\\operatorname{Span}\\{\\mathbf{v}_{1}, \\mathbf{v}_{2}\\}$).', 'The coefficients are $' + T.frac(dot(x3, v1), nrmSq(v1)) + '$ and $' + T.frac(dot(x3, v2b), nrmSq(v2b)) + '$.', '$\\mathbf{v}_{3} = ' + texv(x3) + T.coef(c1.neg(), texv(v1), false) + T.coef(c2.neg(), texv(v2b), false) + ' = ' + texv(v3) + '$.', 'Check: $\\mathbf{v}_{3}\\cdot\\mathbf{v}_{1} = ' + N(dot(v3, v1)) + '$ and $\\mathbf{v}_{3}\\cdot\\mathbf{v}_{2} = ' + N(dot(v3, v2b)) + '$.'],
        hint: 'Subtract the projections of $\\mathbf{x}_{3}$ onto $\\mathbf{v}_{1}$ and onto $\\mathbf{v}_{2}$.' }, { kind: 'gs3', v1: v1, v2: v2b, x3: x3 });
    }
    var ci = R.sample([0, 1, 2], 2), signs = [R.pick([1, -1]), R.pick([1, -1])], Qm = [0, 1, 2].map(function (i) { return [q(Q3[i][ci[0]] * signs[0]).div(3), q(Q3[i][ci[1]] * signs[1]).div(3)]; });
    var Rm = [[q(3 * R.int(1, 3)), q(3 * R.int(-2, 2))], [q(0), q(3 * R.int(1, 3))]], Am = mm(Qm, Rm);
    return test({ q: '$A = ' + tex(Am) + '$ has the QR factorization $A = QR$ with $Q = ' + tex(Qm) + '$ (orthonormal columns). Find $R$.', a: aM(Rm),
      steps: ['$Q$ has orthonormal columns, so $Q^{T}Q = I$. Multiply $A = QR$ on the left by $Q^{T}$: $R = Q^{T}A$.', '$Q^{T}A = ' + tex(tr(Qm)) + tex(Am) + ' = ' + tex(Rm) + '$.', 'As expected, $R$ is upper triangular with positive diagonal entries.'],
      hint: 'Use $R = Q^{T}A$.' }, { kind: 'R', A: Am, Q: Qm });
  });

  // ---------------------------------------------------------------- la.least-squares
  G('la.least-squares', function (R, ctx) {
    var kind = by(ctx, R.pick(['normal', 'line']), R.pick(['line', 'system', 'line']), R.pick(['system', 'line', 'error']));
    if (kind === 'line' || kind === 'normal') {
      var npts = by(ctx, 3, R.pick([3, 4]), R.pick([4, 5])), xsv = R.sample(U.range(-2, 5), npts).sort(function (a, b) { return a - b; }).map(q);
      var X = xsv.map(function (x) { return [q(1), x]; }), Xt = tr(X), nul = rref(Xt), piv = pivotsOf(nul), free = U.range(0, npts - 1).filter(function (j) { return piv.indexOf(j) < 0; });
      var e, tries = 0;
      do {
        e = zeros(1, npts)[0]; free.forEach(function (fj) { e[fj] = q(R.int(-2, 2)); }); piv.forEach(function (pc, i) { var s = q(0); free.forEach(function (fj) { s = s.sub(nul[i][fj].mul(e[fj])); }); e[pc] = s; });
        var den = U.lcm.apply(null, e.map(function (x) { return x.den(); })); e = e.map(function (x) { return x.mul(den); });
      } while ((isZeroV(e) || maxAbs([e]) > 6) && ++tries < 40);
      if (isZeroV(e) || maxAbs([e]) > 6) { e = zeros(1, npts)[0]; var nv0 = nullVec(Xt).v, d0 = U.lcm.apply(null, nv0.map(function (x) { return x.den(); })); e = nv0.map(function (x) { return x.mul(d0); }); }
      var beta = [q(R.int(-3, 4)), q(R.nz(-2, 3))], yv = X.map(function (r, i) { return beta[0].add(beta[1].mul(r[1])).add(e[i]); });
      var XtX = mm(Xt, X), Xty = mv(Xt, yv), bh = mv(inv(XtX), Xty);
      var pts = xsv.map(function (x, i) { return T.pt([x, yv[i]]); }).join(', ');
      if (kind === 'normal') return test({ q: 'To fit a line $y = \\beta_{0} + \\beta_{1}x$ to the points ' + pts + ', set up the normal equations $X^{T}X\\boldsymbol{\\beta} = X^{T}\\mathbf{y}$. Find $X^{T}X$.', a: aM(XtX),
        steps: ['The design matrix has a column of $1$s and a column of $x$-values: $X = ' + tex(X) + '$.', '$X^{T}X = ' + T.mat([['n', '\\sum x'], ['\\sum x', '\\sum x^{2}']]) + ' = ' + tex(XtX) + '$.', '(And $X^{T}\\mathbf{y} = ' + texv(Xty) + '$.)'],
        hint: 'Write $X$ with a column of ones and a column of $x$-values, then multiply $X^{T}X$.' }, { kind: 'normal', X: X, y: yv });
      return test({ q: 'Find the least-squares line $y = \\beta_{0} + \\beta_{1}x$ for the points ' + pts + '. Give $(\\beta_{0}, \\beta_{1})$.', a: aV(bh, ['\\beta_{0}', '\\beta_{1}']),
        steps: ['The design matrix is $X = ' + tex(X) + '$ and $\\mathbf{y} = ' + texv(yv) + '$. The system $X\\boldsymbol{\\beta} = \\mathbf{y}$ has no exact solution, so solve the normal equations $X^{T}X\\boldsymbol{\\beta} = X^{T}\\mathbf{y}$.', '$X^{T}X = ' + tex(XtX) + '$ and $X^{T}\\mathbf{y} = ' + texv(Xty) + '$.', 'Solve: $\\boldsymbol{\\beta} = (X^{T}X)^{-1}X^{T}\\mathbf{y} = ' + tex(inv(XtX)) + texv(Xty) + ' = ' + texv(bh) + '$.', 'So $y = ' + T.lin(bh[1], 'x', bh[0]) + '$. Check: the residuals $' + texv(vsub(yv, mv(X, bh))) + '$ add up to $0$ and are orthogonal to the $x$-values.'],
        hint: 'Build $X$ (ones and $x$-values), then solve $X^{T}X\\boldsymbol{\\beta} = X^{T}\\mathbf{y}$.' }, { kind: 'line', X: X, y: yv });
    }
    var A = randM(R, 3, 2, -2, 3); while (rank(A) < 2) A = randM(R, 3, 2, -2, 3);
    var nv = nullVec(tr(A)).v, den2 = U.lcm.apply(null, nv.map(function (x) { return x.den(); })); nv = nv.map(function (x) { return x.mul(den2); });
    var xh = randV(R, 2, -3, 3), k = R.nz(-2, 2), b = vadd(mv(A, xh), vsc(k, nv)), AtA = mm(tr(A), A), Atb = mv(tr(A), b), e = vsc(k, nv);
    if (kind === 'error') { var se = sqrtQ(nrmSq(e));
      return test({ q: 'Find the least-squares error $\\lVert\\mathbf{b} - A\\hat{\\mathbf{x}}\\rVert$ for $A = ' + tex(A) + '$ and $\\mathbf{b} = ' + texv(b) + '$.', a: { t: 'num', v: se.plain },
        steps: ['Solve the normal equations: $A^{T}A = ' + tex(AtA) + '$, $A^{T}\\mathbf{b} = ' + texv(Atb) + '$, giving $\\hat{\\mathbf{x}} = ' + texv(xh) + '$.', '$A\\hat{\\mathbf{x}} = ' + texv(mv(A, xh)) + '$, so $\\mathbf{b} - A\\hat{\\mathbf{x}} = ' + texv(e) + '$.', 'Error $= \\sqrt{' + N(nrmSq(e)) + '} = ' + se.tex + '$.'],
        hint: 'Find $\\hat{\\mathbf{x}}$ first, then the length of the residual $\\mathbf{b} - A\\hat{\\mathbf{x}}$.' }, { kind: 'error', A: A, b: b }); }
    return test({ q: 'The system $A\\mathbf{x} = \\mathbf{b}$ with $A = ' + tex(A) + '$ and $\\mathbf{b} = ' + texv(b) + '$ has no solution. Find the least-squares solution $\\hat{\\mathbf{x}}$.', a: aV(xh),
      steps: ['Multiply both sides by $A^{T}$ to get the normal equations $A^{T}A\\hat{\\mathbf{x}} = A^{T}\\mathbf{b}$.', '$A^{T}A = ' + tex(AtA) + '$ and $A^{T}\\mathbf{b} = ' + texv(Atb) + '$.', 'Solve the $2 \\times 2$ system: $\\hat{\\mathbf{x}} = ' + tex(inv(AtA)) + texv(Atb) + ' = ' + texv(xh) + '$.', 'Check: the residual $\\mathbf{b} - A\\hat{\\mathbf{x}} = ' + texv(e) + '$ is orthogonal to both columns of $A$.'],
      hint: 'Solve $A^{T}A\\hat{\\mathbf{x}} = A^{T}\\mathbf{b}$ instead of $A\\mathbf{x} = \\mathbf{b}$.' }, { kind: 'system', A: A, b: b });
  });

  // ---------------------------------------------------------------- la.orthogonal-matrices
  G('la.orthogonal-matrices', function (R, ctx) {
    var kind = by(ctx, R.pick(['isorth', 'inverse', 'norm']), R.pick(['isorth', 'inverse', 'missing']), R.pick(['missing', 'isorth', 'norm']));
    function pyQ(Rr) { var p = R.pick(PYTH), a = q(p[0]).div(p[2]), b = q(p[1]).div(p[2]); if (Rr.coin()) { var t = a; a = b; b = t; } var refl = Rr.coin(); return refl ? [[a, b], [b, a.neg()]] : [[a, b.neg()], [b, a]]; }
    if (kind === 'isorth') {
      var cand = R.int(0, 4), Qm, yes;
      if (cand === 0) { Qm = pyQ(R); yes = true; }
      else if (cand === 1) { Qm = Q3.map(function (r) { return r.map(function (x) { return q(x).div(3); }); }); yes = true; }
      else if (cand === 2) { var p = R.pick(PYTH); Qm = [[q(p[0]), q(-p[1])], [q(p[1]), q(p[0])]]; yes = false; }
      else if (cand === 3) { Qm = [[q(1), q(1)], [q(0), q(1)]]; yes = false; }
      else { Qm = R.shuffle(eye(3)); yes = true; }
      var QtQ = mm(tr(Qm), Qm);
      return test({ q: 'True or false: $Q = ' + tex(Qm) + '$ is an orthogonal matrix.', a: aTF(eqM(QtQ, eye(Qm.length))),
        steps: ['$Q$ is orthogonal when $Q^{T}Q = I$: its columns are orthonormal (perpendicular <b>and</b> of length $1$).', '$Q^{T}Q = ' + tex(QtQ) + '$.', eqM(QtQ, eye(Qm.length)) ? 'That is $I$: <b>true</b>.' : 'That is not $I$: <b>false</b>.' + (cand === 2 ? ' The columns are perpendicular but have length $' + PYTH.filter(function (pp2) { return q(pp2[0]).eq(Qm[0][0]); })[0][2] + '$, not $1$.' : '')],
        hint: 'Compute $Q^{T}Q$ and compare with $I$.' }, { kind: 'isorth', Q: Qm, yes: yes });
    }
    if (kind === 'inverse') {
      var Q2 = R.coin() ? pyQ(R) : Q3.map(function (r) { return r.map(function (x) { return q(x).div(3); }); });
      if (Q2.length === 3 && R.coin()) Q2 = R.shuffle(Q2).map(function (r) { return r; });
      return test({ q: 'The matrix $Q = ' + tex(Q2) + '$ is orthogonal. Find $Q^{-1}$.', a: aM(tr(Q2)),
        steps: ['For an orthogonal matrix, $Q^{T}Q = I$, so $Q^{-1} = Q^{T}$. No row reduction needed.', '$Q^{-1} = Q^{T} = ' + tex(tr(Q2)) + '$.', 'Check: $Q^{T}Q = ' + tex(mm(tr(Q2), Q2)) + '$.'],
        hint: 'The inverse of an orthogonal matrix is its transpose.' }, { kind: 'inverse', Q: Q2 });
    }
    if (kind === 'norm') {
      var Q4 = R.coin() ? pyQ(R) : Q3.map(function (r) { return r.map(function (x) { return q(x).div(3); }); }), x = randV(R, Q4.length, -5, 6), s = sqrtQ(nrmSq(x));
      if (isZeroV(x)) { x[0] = q(3); s = sqrtQ(9); }
      return test({ q: '$Q = ' + tex(Q4) + '$ is orthogonal and $\\mathbf{x} = ' + texv(x) + '$. Find $\\lVert Q\\mathbf{x}\\rVert$.', a: { t: 'num', v: s.plain },
        steps: ['Orthogonal matrices preserve length: $\\lVert Q\\mathbf{x}\\rVert^{2} = (Q\\mathbf{x})^{T}(Q\\mathbf{x}) = \\mathbf{x}^{T}Q^{T}Q\\mathbf{x} = \\mathbf{x}^{T}\\mathbf{x}$.', 'So $\\lVert Q\\mathbf{x}\\rVert = \\lVert\\mathbf{x}\\rVert = \\sqrt{' + N(nrmSq(x)) + '} = ' + s.tex + '$.', '(Indeed $Q\\mathbf{x} = ' + texv(mv(Q4, x)) + '$ has the same length.)'],
        hint: 'You do not need to compute $Q\\mathbf{x}$.' }, { kind: 'norm', Q: Q4, x: x });
    }
    var p2 = R.pick(PYTH), a = q(p2[0]).div(p2[2]), b = q(p2[1]).div(p2[2]), rot = R.coin();
    if (R.coin()) { var tt = a; a = b; b = tt; }
    var full = rot ? [[a, b.neg()], [b, a]] : [[a, b], [b, a.neg()]];
    return test({ q: 'Complete $Q = ' + T.mat([[N(a), 'p'], [N(b), 'r']]) + '$ so that $Q$ is orthogonal with $\\det Q = ' + (rot ? '1' : '-1') + '$. Find $p$ and $r$.',
      a: { t: 'multi', parts: [{ label: '$p =$', a: aN(full[0][1]) }, { label: '$r =$', a: aN(full[1][1]) }] },
      steps: ['The second column must be a unit vector perpendicular to the first, $' + texr([a, b]) + '$. The two choices are $' + texr([b.neg(), a]) + '$ and $' + texr([b, a.neg()]) + '$.', '$\\det' + T.mat([[N(a), N(full[0][1])], [N(b), N(full[1][1])]]) + ' = ' + pp(a, full[1][1]) + ' - ' + pp(full[0][1], b) + ' = ' + N(det(full)) + '$, as required.', 'So $p = ' + N(full[0][1]) + '$ and $r = ' + N(full[1][1]) + '$ (' + (rot ? 'a rotation' : 'a reflection') + ').'],
      hint: 'Rotate the first column by $90^\\circ$ one way or the other; the determinant decides which.' }, { kind: 'missing', Q: full });
  });


  // ================================================================ Unit 8: Symmetric Matrices and the SVD

  /* symmetric 2x2 with integer eigenvalues: A = l2 I + k [[p^2, pq], [pq, q^2]], eigenvectors (p, q) and (-q, p) */
  function sym2(R, o) {
    o = o || {};
    for (var t = 0; t < 60; t++) {
      var dir = R.pick([[1, 1], [1, -1], [1, 2], [2, 1], [1, -2], [2, -1], [1, 3], [3, 1]]), p = dir[0], qq = dir[1], k = R.nz(-2, 3), l2 = R.int(-4, 5);
      if (o.pos) { k = R.int(1, 2); l2 = R.int(1, 4); }
      var n = p * p + qq * qq, A = add(sc(l2, eye(2)), sc(k, qm([[p * p, p * qq], [p * qq, qq * qq]]))), l1 = l2 + k * n;
      if (maxAbs(A) <= (o.max || 12)) return { A: A, l: [q(l1), q(l2)], u: [q(p), q(qq)], w: [q(-qq), q(p)], n: n };
    }
    return { A: qm([[2, 1], [1, 2]]), l: [q(3), q(1)], u: [q(1), q(1)], w: [q(-1), q(1)], n: 2 };
  }
  function unitTex(v, n) { return texv(v.map(function (x) { return rtTex(q(x).div(n), n); })); }
  function unitPlain(v, n) { return v.map(function (x) { return q(x).isZero() ? '0' : rtPlain(q(x).div(n), n); }); }

  // ---------------------------------------------------------------- la.spectral-theorem
  G('la.spectral-theorem', function (R, ctx) {
    var kind = by(ctx, R.pick(['eig', 'concept', 'unitvec']), R.pick(['unitvec', 'eig', 'decomp']), R.pick(['decomp', 'unitvec', 'build']));
    if (kind === 'concept') {
      var items = [['Every real symmetric matrix has only real eigenvalues.', true, 'This is part of the spectral theorem. (For example, rotation matrices have complex eigenvalues, but they are not symmetric.)'],
        ['For a symmetric matrix, eigenvectors that belong to different eigenvalues are orthogonal.', true, 'If $A\\mathbf{u} = \\lambda\\mathbf{u}$ and $A\\mathbf{v} = \\mu\\mathbf{v}$ with $\\lambda \\neq \\mu$, then $\\lambda\\,\\mathbf{u}\\cdot\\mathbf{v} = (A\\mathbf{u})\\cdot\\mathbf{v} = \\mathbf{u}\\cdot(A\\mathbf{v}) = \\mu\\,\\mathbf{u}\\cdot\\mathbf{v}$, which forces $\\mathbf{u}\\cdot\\mathbf{v} = 0$.'],
        ['A symmetric matrix with a repeated eigenvalue might not be diagonalizable.', false, 'Every symmetric matrix is orthogonally diagonalizable, repeated eigenvalues or not. The eigenspace of a repeated eigenvalue always has full dimension.'],
        ['If $A = PDP^{T}$ with $P$ orthogonal and $D$ diagonal, then $A$ is symmetric.', true, '$A^{T} = (PDP^{T})^{T} = (P^{T})^{T}D^{T}P^{T} = PDP^{T} = A$. So orthogonally diagonalizable matrices are exactly the symmetric ones.'],
        ['Every diagonalizable matrix is symmetric.', false, 'For example $' + tex(qm([[1, 1], [0, 2]])) + '$ has distinct eigenvalues $1$ and $2$, so it is diagonalizable, but it is not symmetric. Its eigenvectors $(1, 0)$ and $(1, 1)$ are not orthogonal.']];
      var it = R.pick(items);
      return test({ q: 'True or false: ' + it[0], a: aTF(it[1]), steps: [it[2], 'So the statement is <b>' + (it[1] ? 'true' : 'false') + '</b>.'], hint: 'Think of the spectral theorem: $A = A^{T}$ exactly when $A = PDP^{T}$ with $P$ orthogonal.' }, { kind: 'concept' });
    }
    var S = sym2(R), A = S.A, big = S.l[0].gt(S.l[1]) ? 0 : 1, lam = S.l, ui = [S.u, S.w];
    if (kind === 'eig') {
      var tr0 = A[0][0].add(A[1][1]), d = det(A);
      return test({ q: 'Find the eigenvalues of the symmetric matrix $A = ' + tex(A) + '$.', a: aSet(lam),
        steps: ['$\\det(A - \\lambda I) = ' + T.terms([[1, '\\lambda^{2}'], [tr0.neg(), '\\lambda'], [d, '']]) + '$.', 'It factors as $(\\lambda' + T.signed(lam[0].neg()) + ')(\\lambda' + T.signed(lam[1].neg()) + ')$, so $\\lambda = ' + N(lam[0]) + '$ and $\\lambda = ' + N(lam[1]) + '$.', 'Real, as the spectral theorem promises for a symmetric matrix.'],
        hint: 'Use $\\lambda^{2} - (\\operatorname{tr} A)\\lambda + \\det A = 0$.' }, { kind: 'eig', A: A });
    }
    if (kind === 'unitvec') {
      var v = ui[big], sgn = v[0].sign() < 0 ? -1 : 1; v = vsc(sgn, v);
      return test({ q: 'Orthogonally diagonalize $A = ' + tex(A) + '$: find the <b>unit</b> eigenvector for the larger eigenvalue, with positive first entry.', a: { t: 'tuple', v: unitPlain(v, S.n) },
        steps: ['The eigenvalues are $' + N(lam[0]) + '$ and $' + N(lam[1]) + '$; the larger is $' + N(lam[big]) + '$.', '$' + amI(lam[big]) + ' = ' + tex(lamI(A, lam[big])) + '$, so an eigenvector is $' + texv(v) + '$.', 'Its length is $\\sqrt{' + S.n + '}$, so the unit eigenvector is $' + unitTex(v, S.n) + '$.', 'The other unit eigenvector, $' + unitTex(vsc(sgn, ui[1 - big]), S.n) + '$, is orthogonal to it, as it must be.'],
        hint: 'Solve $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$, then divide by the length.' }, { kind: 'unitvec', A: A, lam: lam[big], n: S.n });
    }
    if (kind === 'decomp') {
      var j = R.int(0, 1), u = ui[j], term = sc(lam[j].div(S.n), mm(u.map(function (x) { return [x]; }), [u]));
      return test({ q: '$A = ' + tex(A) + '$ has eigenvalues $' + N(lam[0]) + '$ and $' + N(lam[1]) + '$ with eigenvectors $' + texv(S.u) + '$ and $' + texv(S.w) + '$. In the spectral decomposition $A = \\lambda_{1}\\mathbf{u}_{1}\\mathbf{u}_{1}^{T} + \\lambda_{2}\\mathbf{u}_{2}\\mathbf{u}_{2}^{T}$ (unit eigenvectors), find the term for $\\lambda = ' + N(lam[j]) + '$.', a: aM(term),
        steps: ['The unit eigenvector is $\\mathbf{u} = \\dfrac{1}{\\sqrt{' + S.n + '}}' + texv(u) + '$.', '$\\mathbf{u}\\mathbf{u}^{T} = \\dfrac{1}{' + S.n + '}' + texv(u) + T.mat([u]) + ' = \\dfrac{1}{' + S.n + '}' + tex(mm(u.map(function (x) { return [x]; }), [u])) + '$ (the projection onto that eigenvector\'s line).', 'Multiply by $\\lambda = ' + N(lam[j]) + '$: $' + tex(term) + '$.', 'Check: adding the other term, $' + tex(sc(lam[1 - j].div(S.n), mm(ui[1 - j].map(function (x) { return [x]; }), [ui[1 - j]]))) + '$, gives back $A$.'],
        hint: '$\\mathbf{u}\\mathbf{u}^{T}$ for a unit vector $\\mathbf{u}$; with $\\mathbf{u} = \\mathbf{v}/\\lVert\\mathbf{v}\\rVert$ it is $\\mathbf{v}\\mathbf{v}^{T}/(\\mathbf{v}\\cdot\\mathbf{v})$.' }, { kind: 'decomp', A: A, lam: lam[j], u: u, n: S.n });
    }
    // build A from P and D (with P orthogonal from a Pythagorean triple)
    var p = R.pick(PYTH), a = q(p[0]).div(p[2]), b = q(p[1]).div(p[2]), Pm = [[a, b.neg()], [b, a]], l1 = R.int(-3, 4) * 1, l2 = R.intNot(-3, 4, l1), D = diag([l1, l2]), Ab = mm(mm(Pm, D), tr(Pm));
    return test({ q: 'Find $A = PDP^{T}$ for the orthogonal matrix $P = ' + tex(Pm) + '$ and $D = ' + tex(D) + '$.', a: aM(Ab),
      steps: ['$P$ is orthogonal, so $P^{-1} = P^{T} = ' + tex(tr(Pm)) + '$.', '$PD = ' + tex(mm(Pm, D)) + '$.', '$(PD)P^{T} = ' + tex(Ab) + '$, which is symmetric, as it must be.'],
      hint: 'Multiply $PD$ first, then by $P^{T}$.' }, { kind: 'build', P: Pm, D: D });
  });

  // ---------------------------------------------------------------- la.quadratic-forms
  var CLASSES = ['Positive definite', 'Negative definite', 'Indefinite', 'Positive semidefinite (not definite)'];
  G('la.quadratic-forms', function (R, ctx) {
    var kind = by(ctx, R.pick(['matrix', 'eval']), R.pick(['matrix', 'classify', 'expand']), R.pick(['classify', 'matrix3', 'classify']));
    if (kind === 'matrix' || kind === 'expand' || kind === 'eval') {
      var a = R.nz(-5, 5), b = R.pick([-6, -4, -2, 2, 4, 6, -3, 3, 1, -1, 0]), c = R.nz(-5, 5);
      var Am = [[q(a), q(b).div(2)], [q(b).div(2), q(c)]], Qtex = T.terms([[a, 'x_{1}^{2}'], [b, 'x_{1}x_{2}'], [c, 'x_{2}^{2}']]);
      if (kind === 'matrix') return test({ q: 'Find the symmetric matrix $A$ with $Q(\\mathbf{x}) = \\mathbf{x}^{T}A\\mathbf{x}$ for $Q(x_{1}, x_{2}) = ' + Qtex + '$.', a: aM(Am),
        steps: ['$\\mathbf{x}^{T}' + T.mat([['a', 'b'], ['b', 'c']]) + '\\mathbf{x} = ax_{1}^{2} + 2bx_{1}x_{2} + cx_{2}^{2}$: the cross term is split <b>evenly</b> between the two off-diagonal entries.', 'Diagonal: the coefficients of $x_{1}^{2}$ and $x_{2}^{2}$, $' + a + '$ and $' + c + '$. Off-diagonal: half of $' + b + '$, which is $' + N(q(b).div(2)) + '$.', '$A = ' + tex(Am) + '$.'],
        hint: 'Squares go on the diagonal; half the $x_{1}x_{2}$ coefficient goes in each off-diagonal spot.' }, { kind: 'matrix', a: a, b: b, c: c });
      if (kind === 'expand') return test({ q: 'Write $Q(\\mathbf{x}) = \\mathbf{x}^{T}A\\mathbf{x}$ as a polynomial in $x$ and $y$ (with $\\mathbf{x} = (x, y)$) for $A = ' + tex(Am) + '$.', a: { t: 'expr', v: polyXY(a, b, c), vars: ['x', 'y'] },
        steps: ['$\\mathbf{x}^{T}A\\mathbf{x} = a_{11}x^{2} + 2a_{12}xy + a_{22}y^{2}$.', '$= ' + T.terms([[a, 'x^{2}'], [b, 'xy'], [c, 'y^{2}']]) + '$.'],
        hint: 'Diagonal entries multiply the squares; the off-diagonal entry counts twice for $xy$.' }, { kind: 'expand', a: a, b: b, c: c });
      var x = randV(R, 2, -3, 3, true), val = dot(x, mv(Am, x));
      return test({ q: 'Evaluate $Q(\\mathbf{x}) = \\mathbf{x}^{T}A\\mathbf{x}$ for $A = ' + tex(Am) + '$ and $\\mathbf{x} = ' + texv(x) + '$.', a: aN(val),
        steps: ['$A\\mathbf{x} = ' + texv(mv(Am, x)) + '$.', '$\\mathbf{x}^{T}(A\\mathbf{x}) = ' + prods(x, mv(Am, x)) + ' = ' + N(val) + '$.', 'Or with the formula: $' + T.terms([[a, 'x_{1}^{2}'], [b, 'x_{1}x_{2}'], [c, 'x_{2}^{2}']]) + '$ at $' + texr(x) + '$ gives the same value.'],
        hint: 'Compute $A\\mathbf{x}$ first, then dot with $\\mathbf{x}$.' }, { kind: 'eval', A: Am, x: x });
    }
    if (kind === 'matrix3') {
      var co = [R.nz(-4, 4), R.int(-4, 4), R.nz(-4, 4)], cr = [R.pick([2, -2, 4, 0, 6]), R.pick([2, -4, 0, 1]), R.pick([-2, 2, 3, 0])];
      var A3 = [[q(co[0]), q(cr[0]).div(2), q(cr[1]).div(2)], [q(cr[0]).div(2), q(co[1]), q(cr[2]).div(2)], [q(cr[1]).div(2), q(cr[2]).div(2), q(co[2])]];
      var Qt = T.terms([[co[0], 'x_{1}^{2}'], [co[1], 'x_{2}^{2}'], [co[2], 'x_{3}^{2}'], [cr[0], 'x_{1}x_{2}'], [cr[1], 'x_{1}x_{3}'], [cr[2], 'x_{2}x_{3}']]);
      return test({ q: 'Find the symmetric matrix of the quadratic form $Q(x_{1}, x_{2}, x_{3}) = ' + Qt + '$.', a: aM(A3),
        steps: ['The coefficient of $x_{i}^{2}$ goes in position $(i, i)$.', 'The coefficient of $x_{i}x_{j}$ is split in half between positions $(i, j)$ and $(j, i)$.', '$A = ' + tex(A3) + '$.'],
        hint: 'Halve each cross-term coefficient.' }, { kind: 'matrix3', A: A3, co: co, cr: cr });
    }
    var cls = R.int(0, 3), S = sym2(R, { pos: true }), l = S.l.slice(), Ac;
    if (cls === 1) { l = l.map(function (x) { return x.neg(); }); Ac = sc(-1, S.A); }
    else if (cls === 2) { var shift = l[1].add(R.int(1, 2)); l = l.map(function (x) { return x.sub(shift); }); Ac = add(S.A, sc(shift.neg(), eye(2))); if (l[0].sign() * l[1].sign() >= 0) { l = [q(3), q(-1)]; Ac = qm([[1, 2], [2, 1]]); } }
    else if (cls === 3) { var sh = l[1]; l = l.map(function (x) { return x.sub(sh); }); Ac = add(S.A, sc(sh.neg(), eye(2))); }
    else Ac = S.A;
    var tr0 = Ac[0][0].add(Ac[1][1]), d = det(Ac);
    var why = cls === 0 ? 'Both eigenvalues are positive: <b>positive definite</b> ($Q(\\mathbf{x}) > 0$ for every $\\mathbf{x} \\neq \\mathbf{0}$).' : cls === 1 ? 'Both eigenvalues are negative: <b>negative definite</b>.' : cls === 2 ? 'One positive and one negative eigenvalue: <b>indefinite</b> (a saddle).' : 'One eigenvalue is $0$ and the other positive: <b>positive semidefinite</b>, not definite ($Q = 0$ along the eigenvector for $0$).';
    return test({ q: 'Classify the quadratic form $\\mathbf{x}^{T}A\\mathbf{x}$ for $A = ' + tex(Ac) + '$.', a: { t: 'mc', choices: CLASSES.slice(), v: cls, keep: true },
      steps: ['Rotate to the eigenvector axes: $Q = \\lambda_{1}y_{1}^{2} + \\lambda_{2}y_{2}^{2}$, so the signs of the eigenvalues decide.', '$\\det(A - \\lambda I) = ' + T.terms([[1, '\\lambda^{2}'], [tr0.neg(), '\\lambda'], [d, '']]) + '$, with roots $' + N(l[0]) + '$ and $' + N(l[1]) + '$.', why, 'Quick check for $2 \\times 2$: $\\det A = ' + N(d) + '$ and $a_{11} = ' + N(Ac[0][0]) + '$.'],
      hint: 'Find the eigenvalues and look at their signs.' }, { kind: 'classify', A: Ac, cls: cls });
  });
  function polyXY(a, b, c) { var out = ''; [[a, 'x^2'], [b, 'x*y'], [c, 'y^2']].forEach(function (t) { if (!t[0]) return; var ab = Math.abs(t[0]); out += (t[0] < 0 ? '-' : out ? '+' : '') + (ab === 1 ? '' : ab + '*') + t[1]; }); return out || '0'; }

  // ---------------------------------------------------------------- la.svd
  var SVPOOL = null;
  function svPool() { // 2x2 integer matrices whose A^T A has integer eigenvalues (both > 0, not both squares of the same)
    if (SVPOOL) return SVPOOL;
    SVPOOL = [];
    for (var a = -3; a <= 3; a++) for (var b = -3; b <= 3; b++) for (var c = -3; c <= 3; c++) for (var d = -3; d <= 3; d++) {
      var p = a * a + c * c, r = a * b + c * d, s = b * b + d * d, disc = (p - s) * (p - s) + 4 * r * r, sq = Math.round(Math.sqrt(disc));
      if (sq * sq !== disc || (p + s + sq) % 2) continue;
      var l1 = (p + s + sq) / 2, l2 = (p + s - sq) / 2;
      if (l2 <= 0 || r === 0) continue; // nonsingular, A^T A not already diagonal
      if (a * d - b * c === 0) continue;
      SVPOOL.push([[a, b], [c, d], l1, l2]);
    }
    return SVPOOL;
  }
  G('la.svd', function (R, ctx) {
    var kind = by(ctx, R.pick(['AtA', 'sv']), R.pick(['sv', 'norm', 'trap']), R.pick(['sv', 'trap', 'rank']));
    if (kind === 'rank') {
      var sig = R.sample([7, 5, 4, 3, 2, 9], R.int(2, 3)).sort(function (x, y) { return y - x; }), zerosN = R.int(1, 2), m = sig.length + zerosN + R.int(0, 2), n = sig.length + zerosN;
      var list = sig.map(String).concat(new Array(zerosN).fill('0'));
      return test({ q: 'A $' + m + ' \\times ' + n + '$ matrix $A$ has singular values $' + list.join(', ') + '$. Find $\\operatorname{rank} A$ and $\\lVert A\\rVert$ (the largest value of $\\lVert A\\mathbf{x}\\rVert$ over unit vectors $\\mathbf{x}$).',
        a: { t: 'multi', parts: [{ label: 'Rank', a: aN(q(sig.length)) }, { label: '$\\lVert A\\rVert$', a: aN(q(sig[0])) }] },
        steps: ['In $A = U\\Sigma V^{T}$, the rank of $A$ equals the rank of $\\Sigma$: the number of <b>nonzero</b> singular values, here ' + sig.length + '.', 'The largest stretch of a unit vector is $\\sigma_{1} = ' + sig[0] + '$, reached at $\\mathbf{x} = \\mathbf{v}_{1}$.'],
        hint: 'Count the nonzero singular values; the biggest one is the norm.' }, { kind: 'rank', sig: sig });
    }
    if (kind === 'trap') {
      var k = R.pick([1, 2, -2, 3, -1, 4]), A = qm([[1, k], [0, 1]]), AtA = mm(tr(A), A), ak = Math.abs(k), s4 = k * k + 4, tr0 = 2 + k * k;
      var rt = T.sqrt(s4), s1 = '(' + ak + '+sqrt(' + s4 + '))/2', s2 = '(sqrt(' + s4 + ')-' + ak + ')/2';
      var s1t = '\\dfrac{' + rt + ' + ' + ak + '}{2}', s2t = '\\dfrac{' + rt + ' - ' + ak + '}{2}';
      if (ak === 2) { s1t = T.sqrt(2) + ' + 1'; s2t = T.sqrt(2) + ' - 1'; } else if (ak === 4) { s1t = T.sqrt(5) + ' + 2'; s2t = T.sqrt(5) + ' - 2'; }
      return test({ q: '$A = ' + tex(A) + '$ has eigenvalues $1$ and $1$. Find its singular values $\\sigma_{1} \\geq \\sigma_{2}$.', a: { t: 'multi', parts: [{ label: '$\\sigma_{1} =$', a: { t: 'num', v: s1 } }, { label: '$\\sigma_{2} =$', a: { t: 'num', v: s2 } }] },
        steps: ['Singular values are <b>not</b> the eigenvalues of $A$. They are the square roots of the eigenvalues of $A^{T}A$.', '$A^{T}A = ' + tex(AtA) + '$, with $\\det(A^{T}A - \\lambda I) = \\lambda^{2} - ' + tr0 + '\\lambda + 1$.', 'So $\\sigma_{1}^{2}\\sigma_{2}^{2} = 1$ and $\\sigma_{1}^{2} + \\sigma_{2}^{2} = ' + tr0 + '$. Then $(\\sigma_{1} - \\sigma_{2})^{2} = ' + tr0 + ' - 2 = ' + (k * k) + '$ and $(\\sigma_{1} + \\sigma_{2})^{2} = ' + tr0 + ' + 2 = ' + s4 + '$.', 'So $\\sigma_{1} - \\sigma_{2} = ' + ak + '$ and $\\sigma_{1} + \\sigma_{2} = ' + rt + '$, giving $\\sigma_{1} = ' + s1t + ' \\approx ' + ((ak + Math.sqrt(s4)) / 2).toFixed(3) + '$ and $\\sigma_{2} = ' + s2t + ' \\approx ' + ((Math.sqrt(s4) - ak) / 2).toFixed(3) + '$.', 'A shear stretches some directions and shrinks others, even though its eigenvalues are both $1$.'],
        hint: 'Compute $A^{T}A$ and take square roots of its eigenvalues.' }, { kind: 'trap', A: A });
    }
    var big3 = ctx.level >= 3 && R.coin(), pick, Am, AtA2, l1, l2;
    if (big3) { // a 3x2 matrix built from a 2x2 pool entry plus a zero-sum extra row keeps A^T A simple: use [A; 0]
      pick = R.pick(svPool()); Am = qm([pick[0], pick[1], [0, 0]]); var perm = R.shuffle([0, 1, 2]); Am = perm.map(function (i) { return Am[i]; });
    } else { pick = R.pick(svPool()); Am = qm([pick[0], pick[1]]); }
    AtA2 = mm(tr(Am), Am); l1 = pick[2]; l2 = pick[3];
    var s1x = sqrtQ(l1), s2x = sqrtQ(l2), trA = AtA2[0][0].add(AtA2[1][1]), dA = det(AtA2);
    var lines = ['$A^{T}A = ' + tex(AtA2) + '$ (symmetric, so its eigenvalues are real and $\\geq 0$).', 'Its characteristic polynomial is $' + T.terms([[1, '\\lambda^{2}'], [trA.neg(), '\\lambda'], [dA, '']]) + ' = (\\lambda - ' + l1 + ')(\\lambda - ' + l2 + ')$.', 'Singular values are the square roots: $\\sigma_{1} = \\sqrt{' + l1 + '} = ' + s1x.tex + '$ and $\\sigma_{2} = \\sqrt{' + l2 + '} = ' + s2x.tex + '$.'];
    if (kind === 'AtA') return test({ q: 'For $A = ' + tex(Am) + '$, compute $A^{T}A$, the matrix whose eigenvalues give the singular values of $A$.', a: aM(AtA2),
      steps: ['$A^{T} = ' + tex(tr(Am)) + '$.', 'Entry $(i, j)$ of $A^{T}A$ is column $i$ of $A$ dotted with column $j$: $A^{T}A = ' + tex(AtA2) + '$.', 'Its eigenvalues are $' + l1 + '$ and $' + l2 + '$, so the singular values of $A$ are $' + s1x.tex + '$ and $' + s2x.tex + '$.'],
      hint: 'Dot the columns of $A$ with each other.' }, { kind: 'AtA', A: Am });
    if (kind === 'norm') return test({ q: 'Find the largest possible value of $\\lVert A\\mathbf{x}\\rVert$ over all unit vectors $\\mathbf{x}$, for $A = ' + tex(Am) + '$.', a: { t: 'num', v: s1x.plain },
      steps: ['$\\lVert A\\mathbf{x}\\rVert^{2} = \\mathbf{x}^{T}(A^{T}A)\\mathbf{x}$, a quadratic form whose maximum over unit vectors is the largest eigenvalue of $A^{T}A$.'].concat(lines.slice(0, 2)).concat(['So the maximum of $\\lVert A\\mathbf{x}\\rVert$ is $\\sigma_{1} = \\sqrt{' + l1 + '} = ' + s1x.tex + '$, reached at the eigenvector $\\mathbf{v}_{1}$.']),
      hint: 'It is the largest singular value.' }, { kind: 'norm', A: Am, l1: l1 });
    return test({ q: 'Find the singular values $\\sigma_{1} \\geq \\sigma_{2}$ of $A = ' + tex(Am) + '$.', a: { t: 'multi', parts: [{ label: '$\\sigma_{1} =$', a: { t: 'num', v: s1x.plain } }, { label: '$\\sigma_{2} =$', a: { t: 'num', v: s2x.plain } }] },
      steps: lines.concat(['Check: $\\sigma_{1}^{2} + \\sigma_{2}^{2} = ' + (l1 + l2) + '$ equals the sum of the squares of all entries of $A$.']),
      hint: 'Compute $A^{T}A$, find its eigenvalues, and take square roots.' }, { kind: 'sv', A: Am, l: [l1, l2] });
  });

  // ---------------------------------------------------------------- la.svd-applications
  G('la.svd-applications', function (R, ctx) {
    var kind = by(ctx, R.pick(['storage', 'energy', 'error']), R.pick(['rank1', 'error', 'energy', 'storage']), R.pick(['rank1', 'frob', 'keep']));
    if (kind === 'storage') {
      var m = R.pick([100, 200, 300, 400, 500, 600]), n = R.pick([100, 150, 200, 300, 400, 800]), k = R.pick([5, 10, 20, 25, 40, 50]);
      var st = k * (m + n + 1), full = m * n;
      return test({ q: 'A grayscale image is a $' + m + ' \\times ' + n + '$ matrix of pixel values. How many numbers must be stored for its rank-$' + k + '$ approximation $A_{' + k + '} = \\sum_{i=1}^{' + k + '}\\sigma_{i}\\mathbf{u}_{i}\\mathbf{v}_{i}^{T}$?', a: aN(q(st)),
        steps: ['Each term needs one $\\sigma_{i}$, one $\\mathbf{u}_{i}$ (' + m + ' numbers) and one $\\mathbf{v}_{i}$ (' + n + ' numbers): $1 + ' + m + ' + ' + n + ' = ' + (m + n + 1) + '$ numbers.', 'For ' + k + ' terms: $' + k + ' \\times ' + (m + n + 1) + ' = ' + T.commas(st) + '$ numbers.', 'The full image has $' + m + ' \\times ' + n + ' = ' + T.commas(full) + '$ numbers, so this is about ' + Math.round(100 * st / full) + '\\% of the original.'],
        hint: 'Count the numbers in $\\sigma_{i}$, $\\mathbf{u}_{i}$ and $\\mathbf{v}_{i}$, then multiply by $k$.' }, { kind: 'storage', m: m, n: n, k: k });
    }
    var sig = R.sample([12, 10, 8, 6, 5, 4, 3, 2, 1], R.int(4, 5)).sort(function (a, b) { return b - a; });
    if (kind === 'energy' || kind === 'keep') {
      var tot = sig.reduce(function (s, x) { return s + x * x; }, 0);
      if (kind === 'keep') { var target = R.pick([80, 90, 95]), acc = 0, kk = 0; while (kk < sig.length && acc * 100 < target * tot) { acc += sig[kk] * sig[kk]; kk++; }
        return test({ q: 'A matrix has singular values $' + sig.join(', ') + '$. What is the smallest $k$ for which $A_{k}$ keeps at least ' + target + '\\% of the total "energy" $\\sum \\sigma_{i}^{2}$?', a: aN(q(kk)),
          steps: ['Total energy: $' + sig.map(function (x) { return x + '^{2}'; }).join(' + ') + ' = ' + tot + '$. We need at least $' + T.num(q(target * tot).div(100)) + '$.', 'Running totals: ' + sig.map(function (x, i) { var s2 = sig.slice(0, i + 1).reduce(function (s, y) { return s + y * y; }, 0); return '$k = ' + (i + 1) + '$: $' + s2 + '$'; }).join(', ') + '.', 'The first running total that reaches the target is at $k = ' + kk + '$.'],
          hint: 'Add squared singular values from the largest until you reach the target fraction.' }, { kind: 'keep', sig: sig, target: target, k: kk }); }
      var k2 = R.int(1, 2), kept = sig.slice(0, k2).reduce(function (s, x) { return s + x * x; }, 0), frac = q(kept).div(tot);
      return test({ q: 'A matrix has singular values $' + sig.join(', ') + '$. What fraction of the total $\\sum \\sigma_{i}^{2}$ (the squared Frobenius norm) does the rank-$' + k2 + '$ approximation keep? Give an exact fraction.', a: aN(frac),
        steps: ['$\\lVert A\\rVert_{F}^{2} = \\sum \\sigma_{i}^{2} = ' + sig.map(function (x) { return x + '^{2}'; }).join(' + ') + ' = ' + tot + '$.', '$A_{' + k2 + '}$ keeps $' + sig.slice(0, k2).map(function (x) { return x + '^{2}'; }).join(' + ') + ' = ' + kept + '$.', 'Fraction: $' + T.frac(kept, tot) + '$, about $' + Math.round(1000 * kept / tot) / 10 + '\\%$.'],
        hint: 'Square the singular values; compare the kept sum with the total.' }, { kind: 'energy', sig: sig, k: k2 });
    }
    if (kind === 'error' || kind === 'frob') {
      var k3 = R.int(1, sig.length - 2);
      if (kind === 'error') return test({ q: 'A matrix $A$ has singular values $' + sig.join(', ') + '$. What is $\\lVert A - A_{' + k3 + '}\\rVert$ (the operator norm, largest stretch) for the best rank-$' + k3 + '$ approximation $A_{' + k3 + '}$?', a: aN(q(sig[k3])),
        steps: ['$A - A_{' + k3 + '} = \\sum_{i > ' + k3 + '}\\sigma_{i}\\mathbf{u}_{i}\\mathbf{v}_{i}^{T}$: the terms that were dropped.', 'Its largest singular value is the first one dropped, $\\sigma_{' + (k3 + 1) + '} = ' + sig[k3] + '$.', 'By the Eckart–Young theorem, no rank-$' + k3 + '$ matrix does better.'],
        hint: 'The error is the first singular value you threw away.' }, { kind: 'error', sig: sig, k: k3 });
      var rest = sig.slice(k3), ss = rest.reduce(function (s, x) { return s + x * x; }, 0), r = sqrtQ(ss);
      return test({ q: 'A matrix $A$ has singular values $' + sig.join(', ') + '$. Find the Frobenius-norm error $\\lVert A - A_{' + k3 + '}\\rVert_{F}$ of its best rank-$' + k3 + '$ approximation.', a: { t: 'num', v: r.plain },
        steps: ['$\\lVert A - A_{' + k3 + '}\\rVert_{F}^{2}$ is the sum of the squares of the dropped singular values: $' + rest.map(function (x) { return x + '^{2}'; }).join(' + ') + ' = ' + ss + '$.', 'So the error is $\\sqrt{' + ss + '} = ' + r.tex + '$.'],
        hint: 'Square the dropped singular values, add, take the square root.' }, { kind: 'frob', sig: sig, k: k3 });
    }
    // rank-1 term from U, Sigma, V with Pythagorean columns
    var pu = R.pick(PYTH), pv = R.pick(PYTH), u1 = [q(pu[0]).div(pu[2]), q(pu[1]).div(pu[2])], v1 = [q(pv[0]).div(pv[2]), q(pv[1]).div(pv[2])];
    if (R.coin()) u1 = [u1[1], u1[0].neg()];
    var s1 = R.pick([5, 10, 15, 20]), s2 = R.int(1, 4), u2 = [u1[1].neg(), u1[0]], v2 = [v1[1].neg(), v1[0]];
    var Um = cols([u1, u2]), Vm = cols([v1, v2]), A1 = sc(s1, mm(u1.map(function (x) { return [x]; }), [v1]));
    return test({ q: '$A = U\\Sigma V^{T}$ with $U = ' + tex(Um) + '$, $\\Sigma = ' + tex(diag([s1, s2])) + '$, $V = ' + tex(Vm) + '$. Find the best rank-1 approximation $A_{1} = \\sigma_{1}\\mathbf{u}_{1}\\mathbf{v}_{1}^{T}$.', a: aM(A1),
      steps: ['$\\mathbf{u}_{1}$ and $\\mathbf{v}_{1}$ are the first columns of $U$ and $V$: $\\mathbf{u}_{1} = ' + texv(u1) + '$, $\\mathbf{v}_{1} = ' + texv(v1) + '$.', '$\\mathbf{u}_{1}\\mathbf{v}_{1}^{T} = ' + tex(mm(u1.map(function (x) { return [x]; }), [v1])) + '$.', 'Times $\\sigma_{1} = ' + s1 + '$: $A_{1} = ' + tex(A1) + '$.', 'The error $\\lVert A - A_{1}\\rVert$ is $\\sigma_{2} = ' + s2 + '$.'],
      hint: 'Outer product of the first columns of $U$ and $V$, times $\\sigma_{1}$.' }, { kind: 'rank1', u1: u1, v1: v1, s1: s1 });
  });






  // ==== neural-network thread (nn) begin: la.neural-network-layers ====
  // A layer is h = ReLU(Wx + b); a two-layer network is y = v·ReLU(Wx + b) + c. Every answer is computed with exact
  // integers or rationals from the generated weights; p.chk holds them for an independent re-run of the network.
  (function () {
    var Q = ML.Q, T = ML.T;
    function q(v) { return Q.from(v); }
    function relu(v) { return Math.max(0, v); }
    var RL = '\\operatorname{ReLU}';
    function mv(W, x) { return W.map(function (r) { return r.reduce(function (s, w, j) { return s + w * x[j]; }, 0); }); }
    function sumTex(r, x, b) { // "2(3) + (-1)(2) + 1" written with dots
      var t = r.map(function (w, j) { return T.p(w) + ' \\cdot ' + T.p(x[j]); }).join(' + ');
      return t + (!b ? '' : (b < 0 ? ' - ' + (-b) : ' + ' + b));
    }
    function M(rows) { return T.mat(rows); }
    // a weight of 0 is written out ("0 \\cdot 3") so the learner sees every product; that is meant, not an artifact
    function zl(p, W) { if (JSON.stringify(W).match(/(^|[\[,])0([,\]])/)) p.nolint = ['+ 0']; return p; }
    function C(v) { return T.col(v); }
    function netViz(W, b, v, c, x, extra) { return { name: 'la-network', opts: Object.assign({ W1: W, b1: b, W2: [v], b2: [c], x: x, quiet: true, label: 'A small network with its weights' }, extra || {}) }; }
    // weights and an input whose pre-activations are never 0 (no unit sits exactly on its switch)
    function pickLayer(R, nh, nin, wantOff) {
      for (var t = 0; t < 200; t++) {
        var W = [], b = [], x = [];
        for (var i = 0; i < nh; i++) { var r = []; for (var j = 0; j < nin; j++) r.push(R.int(-3, 3)); if (r.every(function (w) { return !w; })) r[0] = R.nz(-3, 3); W.push(r); b.push(R.int(-4, 4)); }
        for (j = 0; j < nin; j++) x.push(R.nz(-3, 3));
        var z = mv(W, x).map(function (s, i) { return s + b[i]; });
        if (z.some(function (v) { return v === 0; })) continue;
        var off = z.filter(function (v) { return v < 0; }).length;
        if (wantOff === 'some' && (off === 0 || off === nh)) continue;
        if (Math.max.apply(null, z.map(Math.abs)) > 14) continue;
        return { W: W, b: b, x: x, z: z };
      }
      return { W: [[1, 2], [-1, 1]], b: [0, 1], x: [3, -1], z: [1, -3] };
    }
    function layerSteps(L) {
      return [
        'Multiply: $W\\mathbf{x}$ takes each row of $W$ times $\\mathbf{x}$: ' + L.W.map(function (r, i) { return '$' + sumTex(r, L.x) + ' = ' + mv(L.W, L.x)[i] + '$'; }).join(', ') + '.',
        'Add the bias: $\\mathbf{z} = W\\mathbf{x} + \\mathbf{b} = ' + C(mv(L.W, L.x)) + ' + ' + C(L.b) + ' = ' + C(L.z) + '$.',
        'Switch: ReLU keeps each positive entry and turns each negative entry into ${}0$, so $\\mathbf{h} = ' + C(L.z.map(relu)) + '$.' + (L.z.some(function (v) { return v < 0; }) ? ' A unit with a negative $z$ is <b>off</b>.' : '')
      ];
    }

    G('la.neural-network-layers', function (R, ctx) {
      var kind = R.pick(ML.byLevel(ctx, ['unit', 'layer', 'layer'], ['net', 'net', 'collapse', 'kinks', 'rulemid'], ['rulebuild', 'gate', 'net3', 'net', 'collapse']));
      if (kind === 'unit') {
        var L = pickLayer(R, 1, 2), w = L.W[0], bb = L.b[0], z = L.z[0];
        return zl({ q: 'A neuron has weights $\\mathbf{w} = ' + T.pt(w) + '$ and bias $b = ' + bb + '$. Its output is $' + RL + '(\\mathbf{w} \\cdot \\mathbf{x} + b)$. Find the output for the input $\\mathbf{x} = ' + T.pt(L.x) + '$.', a: { t: 'num', v: String(relu(z)) },
          steps: ['$\\mathbf{w} \\cdot \\mathbf{x} + b = ' + sumTex(w, L.x, bb) + ' = ' + z + '$.', z > 0 ? 'The sum is positive, so the switch is on and passes it through: $' + RL + '(' + z + ') = ' + z + '$.' : 'The sum is negative, so the switch is off: $' + RL + '(' + z + ') = 0$.'],
          hint: 'Add up weight times input, add the bias, then apply ReLU.', chk: { k: 'unit', W: [w], b: [bb], x: L.x, ans: [relu(z)] } }, [w, L.x]);
      }
      if (kind === 'layer') {
        var L2 = pickLayer(R, 2, 2, R.chance(0.7) ? 'some' : null);
        return zl({ q: 'A layer has $$W = ' + M(L2.W) + ', \\qquad \\mathbf{b} = ' + C(L2.b) + '.$$ Find its output $\\mathbf{h} = ' + RL + '(W\\mathbf{x} + \\mathbf{b})$ for $\\mathbf{x} = ' + C(L2.x) + '$. (ReLU acts on each entry.)', a: { t: 'tuple', v: L2.z.map(function (v) { return String(relu(v)); }) },
          steps: layerSteps(L2), hint: 'Compute $W\\mathbf{x}$, add $\\mathbf{b}$, then replace each negative entry by 0.', chk: { k: 'layer', W: L2.W, b: L2.b, x: L2.x, ans: L2.z.map(relu) } }, L2.W);
      }
      if (kind === 'net' || kind === 'net3') {
        var nh = kind === 'net3' ? 3 : 2, L3 = pickLayer(R, nh, 2, 'some'), v = [], c = R.int(-3, 3);
        for (var i = 0; i < nh; i++) v.push(R.nz(-3, 3));
        var h = L3.z.map(relu), y = h.reduce(function (s, hv, i) { return s + v[i] * hv; }, 0) + c;
        var offIdx = L3.z.map(function (zz, i) { return zz < 0 ? i : -1; }).filter(function (i) { return i >= 0; });
        return zl({ q: 'A network computes $y = \\mathbf{v} \\cdot ' + RL + '(W\\mathbf{x} + \\mathbf{b}) + c$ with $$W = ' + M(L3.W) + ', \\quad \\mathbf{b} = ' + C(L3.b) + ', \\quad \\mathbf{v} = ' + T.pt(v) + ', \\quad c = ' + c + '.$$ Find $y$ for $\\mathbf{x} = ' + C(L3.x) + '$.', a: { t: 'num', v: String(y) },
          steps: layerSteps(L3).concat(['Output layer: $y = \\mathbf{v} \\cdot \\mathbf{h} + c = ' + sumTex(v, h, c) + ' = ' + y + '$.' + (offIdx.length ? ' The weight on the unit that is off never mattered for this input.' : '')]),
          hint: 'Work left to right: the hidden layer first, then the output.', viz: netViz(L3.W, L3.b, v, c, L3.x), chk: { k: 'net', W: L3.W, b: L3.b, v: v, c: c, x: L3.x, ans: y } }, [L3.W, h]);
      }
      if (kind === 'collapse') {
        var W = [[R.nz(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.nz(-3, 3)]], b = [R.int(-3, 3), R.int(-3, 3)], v2 = [R.nz(-3, 3), R.nz(-3, 3)], c2 = R.int(-4, 4);
        var p = v2[0] * W[0][0] + v2[1] * W[1][0], qq = v2[0] * W[0][1] + v2[1] * W[1][1], r = v2[0] * b[0] + v2[1] * b[1] + c2;
        return zl({ q: 'Someone builds a two-layer network but forgets the ReLU switches: $$y = \\mathbf{v} \\cdot (W\\mathbf{x} + \\mathbf{b}) + c, \\quad W = ' + M(W) + ', \\ \\mathbf{b} = ' + C(b) + ', \\ \\mathbf{v} = ' + T.pt(v2) + ', \\ c = ' + c2 + '.$$ Show that it is one affine map: write $y = px_{1} + qx_{2} + r$.',
          a: { t: 'multi', parts: [{ label: '$p =$', a: { t: 'num', v: String(p) } }, { label: '$q =$', a: { t: 'num', v: String(qq) } }, { label: '$r =$', a: { t: 'num', v: String(r) } }] },
          steps: ['Without switches, $y = \\mathbf{v}^{T}W\\mathbf{x} + (\\mathbf{v} \\cdot \\mathbf{b} + c)$: a product of matrices, as in composition.', '$\\mathbf{v}^{T}W = ' + M([v2]) + M(W) + ' = ' + M([[p, qq]]) + '$, so $p = ' + p + '$ and $q = ' + qq + '$.', '$r = \\mathbf{v} \\cdot \\mathbf{b} + c = ' + sumTex(v2, b, c2) + ' = ' + r + '$.', 'So $y = ' + T.terms([[p, 'x_{1}'], [qq, 'x_{2}'], [r, '']]) + '$: stacking layers without switches gives nothing new.'],
          hint: 'Multiply the row $\\mathbf{v}^{T}$ by $W$ for the coefficients; the constant is $\\mathbf{v} \\cdot \\mathbf{b} + c$.', chk: { k: 'collapse', W: W, b: b, v: v2, c: c2, ans: [p, qq, r] } }, [W, b]);
      }
      if (kind === 'kinks') { // one input, two hidden units: where does the graph of y(x) bend?
        var w1 = R.pick([1, 2, -1, -2]), w2 = R.pick([1, 2, 3, -1]), k1 = R.int(-4, 4), k2 = R.intNot(-4, 4, k1);
        var b1 = -w1 * k1, b2 = -w2 * k2, u1 = R.nz(-3, 3), u2 = R.nz(-3, 3), c3 = R.int(-3, 3);
        var yT = T.terms([[u1, RL + '(' + T.lin(w1, 'x', b1) + ')'], [u2, RL + '(' + T.lin(w2, 'x', b2) + ')'], [c3, '']]);
        return { q: 'A network with one input and two hidden units computes $$y = ' + yT + '.$$ At which values of $x$ does its graph bend? (Enter both.)', a: { t: 'set', v: [String(k1), String(k2)] },
          steps: ['Each hidden unit is a ramp. It bends where its switch flips, where its input is ${}0$.', '$' + T.lin(w1, 'x', b1) + ' = 0$ gives $x = ' + k1 + '$.', '$' + T.lin(w2, 'x', b2) + ' = 0$ gives $x = ' + k2 + '$.', 'Between and beyond these points the graph is straight: each piece is a line.'],
          hint: 'Find where the expression inside each ReLU is 0.', chk: { k: 'kinks', u: [u1, u2], w: [w1, w2], b: [b1, b2], c: c3, ans: [k1, k2] } };
      }
      if (kind === 'rulemid' || kind === 'rulebuild') {
        var t = R.int(2, 9), A = R.int(0, 20), B = R.intNot(0, 20, A), d = A - B;
        var net = 'y = ' + T.terms([[B, ''], [d, RL + '(' + T.lin(1, 'x', -(t - 1)) + ')'], [-d, RL + '(' + T.lin(1, 'x', -t) + ')']]);
        var rule = '"if $x \\ge ' + t + '$ the answer is ' + A + ', otherwise it is ' + B + '"';
        if (kind === 'rulemid') {
          var xm = Q(2 * t - 1, 2), ym = Q(A + B, 2), at = R.pick(['mid', 'mid', 'whole']), xw = R.pick([t - 2, t - 1, t, t + 1, t + 3]), yw = xw >= t ? A : B;
          if (xw < 0) xw = t + 1, yw = A;
          if (at === 'whole') return { q: 'The rule ' + rule + ' is built from two ramps: $$' + net + '.$$ Find $y$ for $x = ' + xw + '$.', a: { t: 'num', v: String(yw) },
            steps: ['Ramps at $x = ' + xw + '$: $' + RL + '(' + (xw - t + 1) + ') = ' + relu(xw - t + 1) + '$ and $' + RL + '(' + (xw - t) + ') = ' + relu(xw - t) + '$.', '$y = ' + B + ' + ' + T.p(d) + ' \\cdot ' + relu(xw - t + 1) + ' - ' + T.p(d) + ' \\cdot ' + relu(xw - t) + ' = ' + yw + '$, which is what the rule says for $x = ' + xw + '$.'],
            hint: 'Evaluate each ramp, then add.', chk: { k: 'rule', t: t, A: A, B: B, x: xw, ans: yw } };
          var xd = xm.toDec(1), yd = ym.toDec(1).replace(/\.0$/, '');   // 4.5 and 10.5 read better here than fractions
          return { q: 'The rule ' + rule + ' is built from two ramps: $$' + net + '.$$ It is exact for every whole number $x$. What does it give for $x = ' + xd + '$, between the whole numbers?', a: { t: 'num', v: yd },
            steps: ['At $x = ' + xd + '$: $' + RL + '(0.5) = 0.5$ and $' + RL + '(-0.5) = 0$.', '$y = ' + B + ' + ' + T.p(d) + ' \\cdot 0.5 = ' + yd + '$.', 'Between $' + (t - 1) + '$ and $' + t + '$ the output ramps from $' + B + '$ to $' + A + '$ instead of jumping. A sum of ramps is always continuous, so it can never jump; it only has to be right on whole numbers.'],
            hint: 'Exactly one of the two ramps is on there.', chk: { k: 'rule', t: t, A: A, B: B, x: xm.toPlain(), ans: yd } };
        }
        return { q: 'Turn the rule ' + rule + ' into a tiny network that is exact for every whole number $x$: $$y = \\beta + c\\,' + RL + '(' + T.lin(1, 'x', -(t - 1)) + ') + d\\,' + RL + '(' + T.lin(1, 'x', -t) + ').$$ Find $\\beta$, $c$ and $d$.',
          a: { t: 'multi', parts: [{ label: '$\\beta =$', a: { t: 'num', v: String(B) } }, { label: '$c =$', a: { t: 'num', v: String(d) } }, { label: '$d =$', a: { t: 'num', v: String(-d) } }] },
          steps: ['For whole $x \\le ' + (t - 1) + '$ both ramps are ${}0$, so $y = \\beta$. The rule says ' + B + ': $\\beta = ' + B + '$.', 'At $x = ' + t + '$ the first ramp is ${}1$ and the second is ${}0$: $' + B + ' + c = ' + A + '$, so $c = ' + d + '$.', 'For $x > ' + t + '$ both ramps grow by ${}1$ per step; the output must stay at ' + A + ', so the slopes cancel: $d = -c = ' + (-d) + '$.', 'Check $x = ' + (t + 2) + '$: $' + B + ' + ' + T.p(d) + ' \\cdot 3 + ' + T.p(-d) + ' \\cdot 2 = ' + A + '$. ✓'],
          hint: 'Use $x = ' + (t - 1) + '$, $x = ' + t + '$ and $x = ' + (t + 1) + '$.', chk: { k: 'rulebuild', t: t, A: A, B: B, ans: [B, d, -d] } };
      }
      // gate: a ReLU network on two bits
      var gates = [
        { name: 'AND', f: RL + '(x_{1} + x_{2} - 1)', y: function (a, b) { return relu(a + b - 1); } },
        { name: 'OR', f: 'x_{1} + x_{2} - ' + RL + '(x_{1} + x_{2} - 1)', y: function (a, b) { return a + b - relu(a + b - 1); } },
        { name: 'XOR (exactly one)', f: 'x_{1} + x_{2} - 2\\,' + RL + '(x_{1} + x_{2} - 1)', y: function (a, b) { return a + b - 2 * relu(a + b - 1); } },
        { name: 'NAND (not both)', f: '1 - ' + RL + '(x_{1} + x_{2} - 1)', y: function (a, b) { return 1 - relu(a + b - 1); } }
      ];
      var g = R.pick(gates), rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (pr) { return [pr[0], pr[1], g.y(pr[0], pr[1])]; });
      return { q: 'Inputs $x_{1}$ and $x_{2}$ are bits ($0$ or $1$). Which rule does $y = ' + g.f + '$ compute?', a: { t: 'mc', choices: gates.map(function (h) { return h.name; }), v: gates.indexOf(g) },
        steps: ['Try all four inputs. The ramp $' + RL + '(x_{1} + x_{2} - 1)$ is ${}1$ only when both bits are ${}1$; otherwise it is ${}0$.', rows.map(function (r) { return '$(' + r[0] + ', ' + r[1] + ') \\to ' + r[2] + '$'; }).join(', ') + '.', 'That table is ' + g.name + '. Logic like this is how a fixed set of weights can carry out an if-else rule.'],
        hint: 'Make a table of y for (0, 0), (0, 1), (1, 0) and (1, 1).', chk: { k: 'gate', f: g.name, table: rows } };
    });
  })();
  // ==== neural-network thread (nn) end ====

})(window.MathLadder);
