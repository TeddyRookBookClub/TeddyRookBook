/* Math Ladder generators: Probability (course key "prob"), one generator per topic in data/math/topics/prob.json.
   Built from /tmp/work_ug_prob/gen/*.js by build_gen.js; edit the sources, not this file.

   Conventions in this course
   - Probabilities are exact fractions wherever the problem allows (counting, tables, polynomial densities, uniform
     regions); the answer box takes any exact form (3/8 or 0.375). Answers with e, ln or a normal-table value use a
     tolerance (0.0005 unless stated), and the exact expression is accepted too.
   - Normal-table values are computed here (never typed by hand) and given in the question, rounded the way a printed
     table rounds them: z to 2 places, Φ(z) to 4. The expected answer is computed from the values shown, with a
     tolerance that also accepts a calculator's more precise value.
   - The geometric and negative binomial distributions count trials, including the last success. The exponential
     distribution is written with its rate λ (mean 1/λ). Markov chains use row vectors and rows of P that add to 1.
   - Under test (ML._probChk = true) each problem carries p.chk, the drawn parameters, so an independent checker
     (/tmp/work_ug_prob/test/verify.py) can recompute the answer. Pages never set the flag.              */
(function (ML) {
  'use strict';
  var G0 = ML.gen, T = ML.T, Q = ML.Q, U = ML.util;
  var M = Math;

  // ---------------------------------------------------------------- narrow screens
  // Inline math never wraps, so a long formula in a step would widen a phone screen. Every generator is registered
  // through G, which turns inline math wider than about 270 px into display math (display math scrolls inside its own
  // box). texWidth estimates the rendered width in units of about 10 px. (Adapted from the stat course's generators.)
  var OPS = { cdot: 2, times: 2, pm: 2, approx: 2, le: 2, ge: 2, ne: 2, mid: 1.5, cup: 2, cap: 2, to: 2, sim: 2, div: 2, ldots: 2, cdots: 2, quad: 2, qquad: 4, infty: 1.5, sum: 1.5, int: 1.5, iint: 2.5, lambda: 1, mu: 1, sigma: 1 };
  function texWidth(s) {
    var i = 0, n = s.length;
    function group() {
      if (s[i] !== '{') { var c = s[i++] || ''; if (c === '\\') { var nm = ''; while (i < n && /[a-zA-Z]/.test(s[i])) nm += s[i++]; return nm ? '\\' + nm : '\\' + (s[i++] || ''); } return c; }
      var d = 0, st = ++i; for (; i < n; i++) { if (s[i] === '\\') { i++; continue; } if (s[i] === '{') d++; else if (s[i] === '}') { if (!d) break; d--; } }
      var g = s.slice(st, i); i++; return g;
    }
    var w = 0;
    while (i < n) {
      var c = s[i];
      if (c === '\\') {
        i++; var nm = ''; while (i < n && /[a-zA-Z]/.test(s[i])) nm += s[i++];
        if (!nm) { i++; w += (s[i - 1] === ',' || s[i - 1] === '!' || s[i - 1] === ';') ? 0.3 : 1; continue; }
        if (nm === 'frac' || nm === 'dfrac' || nm === 'tfrac') { var a1 = group(), b1 = group(); w += M.max(texWidth(a1), texWidth(b1)) + 0.6; }
        else if (nm === 'binom') { var a2 = group(), b2 = group(); w += M.max(texWidth(a2), texWidth(b2)) + 1.5; }
        else if (nm === 'sqrt') { if (s[i] === '[') { while (i < n && s[i] !== ']') i++; i++; } w += texWidth(group()) + 1; }
        else if (/^(text|mathrm|textbf|mathbf|operatorname)$/.test(nm)) w += group().length * 0.9;
        else if (/^(hat|bar|overline|vec|widehat|tilde)$/.test(nm)) w += texWidth(group());
        else if (/^(left|right|displaystyle|big|Big|bigl|bigr)$/.test(nm)) w += 0;
        else w += OPS[nm] || 1;
      } else if (c === '^' || c === '_') { i++; w += 0.7 * texWidth(group()); }
      else if (c === '{') { w += texWidth(group()); }
      else { i++; w += /[=+\-<>]/.test(c) ? 2 : c === ' ' ? 0 : /[(),.]/.test(c) ? (c === '(' || c === ')' ? 0.95 : 0.6) : 1; }
    }
    return w;
  }
  function narrow(s) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      if (s[i] === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (s[i] === '$' && s[i + 1] === '$') { var e = s.indexOf('$$', i + 2); if (e < 0) { out += s.slice(i); break; } out += s.slice(i, e + 2); i = e + 2; continue; }
      if (s[i] === '$') {
        var j = i + 1; while (j < n && !(s[j] === '$' && s[j - 1] !== '\\')) j++;
        if (j >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, j);
        if (texWidth(tex) > 26) { out = out.replace(/\s+$/, ' '); out += '$$' + tex + '$$'; i = j + 1; if (s[i] === '.' || s[i] === ',' || s[i] === ';' || s[i] === ':') { i++; } }
        else { out += s.slice(i, j + 1); i = j + 1; }
        continue;
      }
      out += s[i++];
    }
    return out;
  }
  function G(id, fn) {
    G0(id, function (R, ctx) {
      var p = fn(R, ctx);
      if (p && Array.isArray(p.steps)) p.steps = p.steps.map(narrow);
      if (p && typeof p.q === 'string') p.q = narrow(p.q);
      if (p && typeof p.hint === 'string') p.hint = narrow(p.hint);
      if (p && p.chk && !ML._probChk) delete p.chk;
      return p;
    });
  }
  ML.probTexWidth = texWidth;

  // ---------------------------------------------------------------- small helpers
  function lv(ctx) { return ctx && ctx.level || 1; }
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function q(n, d) { return Q(n, d === undefined ? 1 : d); }
  function qt(x) { return Q.from(x).toTex(); }                 // \frac{3}{4}
  function qd(x) { return Q.from(x).toTex().replace(/\\frac/g, '\\dfrac'); }
  function qp(x) { return Q.from(x).toPlain(); }               // 3/4
  function ex(x) { return { t: 'num', v: Q.from(x).toPlain() }; }
  // an exact probability shown as a short decimal when it is one; otherwise exact with a decimal to 3 places accepted
  function shortDec(x) { var s = x.toDec(6).replace(/0+$/, '').replace(/\.$/, ''); return x.isTerminating() && (s.split('.')[1] || '').length <= 4 ? s : null; }
  function exd(x) { x = Q.from(x); var s = shortDec(x); if (s) return { t: 'num', v: s }; return x.abs().lt(q(1, 20)) ? { t: 'num', v: x.toPlain() } : { t: 'num', v: x.toPlain(), tol: 0.0005 }; }
  function exdNote(x) { x = Q.from(x); if (shortDec(x)) return ''; return x.abs().lt(q(1, 20)) ? ' (Give the exact value; a product like $15\\left(\\frac{1}{6}\\right)^{3}$ may be typed as 15(1/6)^3.)' : ' (Give a fraction or a decimal to 3 places.)'; }
  // a probability with a tolerance only when it is not small (a tolerance of 0.0005 would make a tiny answer trivial)
  function ptol(v, plain) { var val = typeof v === 'number' ? v : Q.from(v).toNumber(); return val >= 0.05 ? { t: 'num', v: plain || Q.from(v).toPlain(), tol: 0.0005 } : { t: 'num', v: plain || Q.from(v).toPlain() }; }
  function tol(v, t) { return { t: 'num', v: String(v), tol: t || 0.0005 }; }
  function dec(x, dp) { var s = Q.from(x).toDec(dp === undefined ? 4 : dp); return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
  function num(x) { return T.num(x); }
  function fx(x, d) { return Number(x.toFixed(d === undefined ? 4 : d)); }   // a float rounded for display
  function sgn(x) { return x < 0 ? '-' : ''; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mc(correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function chk(p, d) { if (ML._probChk) p.chk = d; return p; }
  function nl(p) { p.nolint = ['+ 0']; return p; }   // sums that list every term on purpose, zeros included
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function table(head, rows, cap2) { // an HTML table for a question (styled by math.css)
    var h = '<div class="mlp-table-wrap"><table class="mlp-table">' + (cap2 ? '<caption>' + cap2 + '</caption>' : '');
    if (head) h += '<thead><tr>' + head.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead>';
    h += '<tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 && head ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    return h;
  }
  function pmfTable(xs, ps, name) { // a one-row pmf table: x | values, P(X = x) | probabilities
    var nm = name || 'X';
    return table(null, [['$x$'].concat(xs.map(function (x) { return '$' + num(x) + '$'; })), ['$P(' + nm + ' = x)$'].concat(ps.map(function (p) { return '$' + (typeof p === 'string' ? p : qt(p)) + '$'; }))]);
  }
  function sumQ(arr) { return arr.reduce(function (s, x) { return s.add(x); }, Q(0)); }
  function gcd(a, b) { return U.gcd(a, b); }
  // exact binomial coefficients and factorials (BigInt inside)
  function nCrB(n, k) { if (k < 0 || k > n) return 0n; k = M.min(k, n - k); var r = 1n; for (var i = 1; i <= k; i++) r = r * BigInt(n - k + i) / BigInt(i); return r; }
  function Cq(n, k) { return Q(nCrB(n, k)); }
  function factB(n) { var r = 1n; for (var i = 2; i <= n; i++) r *= BigInt(i); return r; }
  function binom(n, k) { return '\\binom{' + n + '}{' + k + '}'; }
  // decimals as exact rationals: hundredths h -> "0.35"
  function hs(h, scale) { return dec(q(h, scale || 100), 6); }
  function pctS(h) { return h + '\\%'; }
  // a fraction with the given denominator from small integers, in lowest terms
  function sq(x) { return x * x; }
  // a base ready for an exponent: (-3)^{2}, \left(\frac{1}{2}\right)^{2}, 3^{2}
  function par(x) { if (typeof x === 'number') return x < 0 ? '(' + num(x) + ')' : num(x); if (x instanceof Q) x = x.toTex(); x = String(x); return /\\frac|^-|\s|\\cdot/.test(x) ? '\\left(' + x + '\\right)' : x; }

  // ---------------------------------------------------------------- the normal CDF (Marsaglia's series, ~1e-15)
  function phi(x) {
    if (x < -8) return 0; if (x > 8) return 1;
    var s = x, t = 0, b = x, q2 = x * x, i = 1;
    while (s !== t) { t = s; i += 2; b *= q2 / i; s = t + b; }
    return 0.5 + s * M.exp(-0.5 * q2 - 0.91893853320467274178);
  }
  function phiT(z) { return Number(phi(z).toFixed(4)); }   // a table value
  function z2(z) { var a = M.round(M.abs(z) * 100 + 1e-9) / 100; return z < 0 ? -a : a; }   // z as a printed table rounds it (half away from 0)
  function poisP(k, m) { var lp = -m + k * M.log(m); for (var i = 2; i <= k; i++) lp -= M.log(i); return M.exp(lp); }

  // ---------------------------------------------------------------- polynomials in x with exact coefficients
  // a polynomial is an array of Q, low degree first: [c0, c1, c2] = c0 + c1 x + c2 x²
  function P(arr) { return arr.map(function (c) { return Q.from(c); }); }
  function ptrim(a) { var b = a.slice(); while (b.length > 1 && b[b.length - 1].isZero()) b.pop(); return b; }
  function padd(a, b) { var n = M.max(a.length, b.length), r = []; for (var i = 0; i < n; i++) r.push((a[i] || Q(0)).add(b[i] || Q(0))); return ptrim(r); }
  function psub(a, b) { return padd(a, b.map(function (c) { return c.neg(); })); }
  function pscale(a, k) { return a.map(function (c) { return c.mul(k); }); }
  function pmul(a, b) { var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(Q(0)); a.forEach(function (x, i2) { b.forEach(function (y, j) { r[i2 + j] = r[i2 + j].add(x.mul(y)); }); }); return ptrim(r); }
  function ppow(a, k) { var r = [Q(1)]; for (var i = 0; i < k; i++) r = pmul(r, a); return r; }
  function pint(a) { return [Q(0)].concat(a.map(function (c, i) { return c.div(i + 1); })); }   // antiderivative with 0 constant
  function pder(a) { return a.length < 2 ? [Q(0)] : a.slice(1).map(function (c, i) { return c.mul(i + 1); }); }
  function peval(a, x) { x = Q.from(x); var r = Q(0); for (var i = a.length - 1; i >= 0; i--) r = r.mul(x).add(a[i]); return r; }
  function pdef(a, lo, hi) { var A = pint(a); return peval(A, hi).sub(peval(A, lo)); }
  function pmono(c, k) { var r = []; for (var i = 0; i < k; i++) r.push(Q(0)); r.push(Q.from(c)); return r; }
  function ptex(a, v) { // TeX, high degree first
    v = v || 'x'; var terms = [];
    for (var i = a.length - 1; i >= 0; i--) { if (a[i].isZero()) continue; terms.push([a[i], i === 0 ? '' : i === 1 ? v : v + '^{' + i + '}']); }
    if (!terms.length) return '0';
    return T.terms(terms.map(function (t2) { return [t2[0], t2[1]]; }));
  }
  function pplain(a, v) { // CAS plain string
    v = v || 'x'; var out = '';
    for (var i = a.length - 1; i >= 0; i--) { var c = a[i]; if (c.isZero()) continue; var s = c.abs().toPlain(), mon = i === 0 ? '' : i === 1 ? v : v + '^' + i;
      var term = mon ? (s === '1' ? mon : (c.isInt() ? s + '*' : '(' + s + ')*') + mon) : s; out += (out ? (c.sign() < 0 ? ' - ' : ' + ') : (c.sign() < 0 ? '-' : '')) + term; }
    return out || '0';
  }
  // ---------------------------------------------------------------- polynomials in x and y: { 'i,j': Q } for x^i y^j
  function P2(terms) { var r = {}; terms.forEach(function (t2) { var k = t2[1] + ',' + t2[2]; r[k] = (r[k] || Q(0)).add(Q.from(t2[0])); }); return r; }
  function p2scale(f, k) { var r = {}; Object.keys(f).forEach(function (key) { r[key] = f[key].mul(k); }); return r; }
  // ∫_{x=a}^{b} ∫_{y=lo(x)}^{hi(x)} f dy dx, with lo and hi polynomials in x (arrays of Q)
  function p2int(f, a, b, lo, hi) {
    var inner = [Q(0)];
    Object.keys(f).forEach(function (key) {
      var ij = key.split(',').map(Number), c = f[key], i = ij[0], j = ij[1];
      var part = psub(ppow(hi, j + 1), ppow(lo, j + 1)); part = pscale(part, c.div(j + 1)); part = pmul(pmono(1, i), part);
      inner = padd(inner, part);
    });
    return pdef(inner, a, b);
  }
  // ∫ f dy over [lo, hi] (numbers or Q) as a polynomial in x
  function p2margX(f, lo, hi) { return p2int2(f, P([lo]), P([hi])); }
  function p2int2(f, lo, hi) { var inner = [Q(0)]; Object.keys(f).forEach(function (key) { var ij = key.split(',').map(Number), c = f[key]; var part = pscale(psub(ppow(hi, ij[1] + 1), ppow(lo, ij[1] + 1)), c.div(ij[1] + 1)); inner = padd(inner, pmul(pmono(1, ij[0]), part)); }); return inner; }
  function p2swap(f) { var r = {}; Object.keys(f).forEach(function (key) { var ij = key.split(','); r[ij[1] + ',' + ij[0]] = f[key]; }); return r; }
  function p2tex(f) { // TeX for a polynomial in x and y, highest total degree first
    var keys = Object.keys(f).filter(function (k) { return !f[k].isZero(); }).sort(function (u, v) { var a = u.split(',').map(Number), b = v.split(',').map(Number); return (b[0] + b[1]) - (a[0] + a[1]) || b[0] - a[0]; });
    if (!keys.length) return '0';
    return T.terms(keys.map(function (k) { var ij = k.split(',').map(Number); var mon = (ij[0] ? (ij[0] === 1 ? 'x' : 'x^{' + ij[0] + '}') : '') + (ij[1] ? (ij[1] === 1 ? 'y' : 'y^{' + ij[1] + '}') : ''); return [f[k], mon]; }));
  }
  function p2eval(f, x, y) { var r = Q(0); Object.keys(f).forEach(function (k) { var ij = k.split(',').map(Number); r = r.add(f[k].mul(Q.from(x).pow(ij[0])).mul(Q.from(y).pow(ij[1]))); }); return r; }

  // exact solve of a small linear system A x = b (arrays of Q); null when singular
  function solveQ(A, b) {
    var n = A.length, Mx = A.map(function (r, i) { return r.slice().concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = -1; for (var r = c; r < n; r++) if (!Mx[r][c].isZero()) { p = r; break; } if (p < 0) return null;
      var t = Mx[c]; Mx[c] = Mx[p]; Mx[p] = t;
      for (r = 0; r < n; r++) { if (r === c || Mx[r][c].isZero()) continue; var f = Mx[r][c].div(Mx[c][c]); for (var j = c; j <= n; j++) Mx[r][j] = Mx[r][j].sub(f.mul(Mx[c][j])); }
    }
    return Mx.map(function (r2, i) { return r2[n].div(r2[i]); });
  }
  function vecTex(v) { return '\\left(' + v.map(function (x) { return Q.from(x).toTex(); }).join(',\\ ') + '\\right)'; }
  function matTex(A) { return '\\begin{bmatrix} ' + A.map(function (r) { return r.map(function (x) { return Q.from(x).toTex(); }).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}'; }


  // ================================================================ Unit 1: Probability Spaces
  var OUTCOMES = [
    { what: 'A spinner lands on', items: ['red', 'blue', 'green', 'yellow'] },
    { what: 'Tomorrow\'s weather will be', items: ['sunny', 'cloudy', 'rainy', 'snowy'] },
    { what: 'A customer orders a drink in size', items: ['small', 'medium', 'large', 'extra large'] },
    { what: 'A student\'s commute is by', items: ['bus', 'car', 'bike', 'walking'] }
  ];
  G('prob.axioms', function (R, ctx) {
    var shape = by(ctx, R.pick(['missing', 'fracs']), R.pick(['overlap', 'only', 'valid']), R.pick(['bound', 'impossible', 'valid']));
    if (shape === 'missing' || shape === 'fracs') {
      var o = R.pick(OUTCOMES), vals, ans, shown;
      if (shape === 'missing') {
        do { vals = [R.int(2, 8) * 5, R.int(2, 8) * 5, R.int(1, 7) * 5]; } while (vals[0] + vals[1] + vals[2] > 90);
        ans = q(100 - vals[0] - vals[1] - vals[2], 100); shown = vals.map(function (v) { return hs(v); });
      } else {
        var pool = [[q(1, 4), q(1, 3), q(1, 6)], [q(1, 2), q(1, 5), q(1, 10)], [q(1, 3), q(1, 4), q(1, 12)], [q(2, 5), q(1, 4), q(1, 10)], [q(1, 6), q(1, 3), q(1, 4)], [q(3, 8), q(1, 4), q(1, 6)], [q(1, 5), q(1, 3), q(1, 6)]];
        var fr = R.shuffle(R.pick(pool)); ans = Q(1).sub(sumQ(fr)); shown = fr.map(qt); vals = fr;
      }
      var miss = R.int(0, 3), givenIdx = [0, 1, 2, 3].filter(function (i) { return i !== miss; });
      var giv = givenIdx.map(function (i, k) { return '$P(\\text{' + o.items[i] + '}) = ' + shown[k] + '$'; });
      return chk({
        q: o.what + ' ' + U.list(o.items.map(function (s) { return s; })).replace(/ and /, ' or ') + ' (exactly one of these). ' + cap(U.list(giv)) + '. What is $P(\\text{' + o.items[miss] + '})$?',
        a: shape === 'missing' ? exd(ans) : ex(ans),
        steps: ['The four outcomes are disjoint and together they make up the whole sample space $S$.', 'By the axioms their probabilities add to $P(S) = 1$.', '$P(\\text{' + o.items[miss] + '}) = 1 - \\left(' + shown.join(' + ') + '\\right) = ' + qt(ans) + '$.'],
        hint: 'Disjoint outcomes that cover everything have probabilities adding to 1.'
      }, { kind: 'missing', given: shape === 'missing' ? vals.map(function (v) { return v / 100; }) : vals.map(function (v) { return v.toPlain(); }) });
    }
    var C = R.pick([
      { u: 'households', one: 'household', A: 'have a dog', B: 'have a cat', or: 'have a dog or a cat', both: 'has both a dog and a cat', only: 'has a dog but no cat' },
      { u: 'students', one: 'student', A: 'take Spanish', B: 'take music', or: 'take Spanish or music', both: 'takes both Spanish and music', only: 'takes Spanish but not music' },
      { u: 'shoppers', one: 'shopper', A: 'buy bread', B: 'buy milk', or: 'buy bread or milk', both: 'buys both bread and milk', only: 'buys bread but not milk' },
      { u: 'commuters', one: 'commuter', A: 'drive', B: 'listen to podcasts', or: 'drive or listen to podcasts', both: 'drives and listens to podcasts', only: 'drives but does not listen to podcasts' }
    ]);
    if (shape === 'overlap' || shape === 'only') {
      var a, b, ab, nn; do { a = R.int(2, 7) * 5; b = R.int(2, 7) * 5; ab = R.int(1, 5) * 5; nn = 100 - a - b - ab; } while (nn < 10);
      var PA = a + ab, PB = b + ab, PU = a + b + ab;
      if (shape === 'overlap') return chk({
        q: 'Of the ' + C.u + ' in a town, ' + PA + '% ' + C.A + ', ' + PB + '% ' + C.B + ', and ' + PU + '% ' + C.or + ' (or both). A ' + C.one + ' is chosen at random. What is the probability that this ' + C.one + ' ' + C.both + '?',
        a: exd(q(ab, 100)),
        steps: ['Let A = "' + C.A + '" and B = "' + C.B + '". $A \\cup B$ splits into three disjoint pieces: A only, B only, and $A \\cap B$.', 'Adding $P(A) + P(B)$ counts the overlap twice, so $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.', '$P(A \\cap B) = P(A) + P(B) - P(A \\cup B) = ' + hs(PA) + ' + ' + hs(PB) + ' - ' + hs(PU) + ' = ' + hs(ab) + '$.'],
        hint: 'P(A) + P(B) counts the overlap twice; P(A ∪ B) counts it once.'
      }, { kind: 'overlap', PA: PA / 100, PB: PB / 100, PU: PU / 100 });
      return chk({
        q: 'Of the ' + C.u + ' in a town, ' + PA + '% ' + C.A + ', and ' + ab + '% ' + C.A + ' and also ' + C.B + '. A ' + C.one + ' is chosen at random. What is the probability that this ' + C.one + ' ' + C.only + '?',
        a: exd(q(a, 100)),
        steps: ['Let A = "' + C.A + '" and B = "' + C.B + '". A splits into two disjoint pieces: $A \\cap B$ and $A \\cap B^{c}$.', 'By additivity, $P(A) = P(A \\cap B) + P(A \\cap B^{c})$.', '$P(A \\cap B^{c}) = ' + hs(PA) + ' - ' + hs(ab) + ' = ' + hs(a) + '$.'],
        hint: 'Split A into the part inside B and the part outside B.'
      }, { kind: 'only', PA: PA / 100, PAB: ab / 100 });
    }
    if (shape === 'valid') {
      function fmtA(arr) { return '$' + arr.map(function (v) { return hs(v); }).join(',\\ ') + '$'; }
      var good; do { good = [R.int(1, 6) * 5, R.int(1, 6) * 5, R.int(1, 6) * 5]; } while (good[0] + good[1] + good[2] >= 95); good.push(100 - good[0] - good[1] - good[2]); good = R.shuffle(good);
      var over = good.slice(); over[R.int(0, 3)] += R.pick([5, 10]);
      var under = good.slice(); var ui = good.indexOf(M.max.apply(M, good)); under[ui] -= R.pick([5, 10]);
      var neg = [R.int(3, 8) * 10, -R.int(1, 2) * 10, R.int(1, 3) * 10]; neg.push(100 - neg[0] - neg[1] - neg[2]); neg = R.shuffle(neg);
      var wr = R.shuffle([over, under, neg]).slice(0, 3);
      return chk({
        q: 'A sample space has four outcomes $s_1, s_2, s_3, s_4$. Which list could be their probabilities $P(s_1), P(s_2), P(s_3), P(s_4)$?',
        a: mc(fmtA(good), wr.map(fmtA)),
        steps: ['A valid assignment needs every probability at least 0 (axiom 1) and a total of $P(S) = 1$ (axiom 2).', 'Only ' + fmtA(good) + ' has no negative entries and adds to 1.', 'Check the others: ' + wr.map(function (w) { var s = w.reduce(function (x, y) { return x + y; }, 0); return fmtA(w) + (w.some(function (v) { return v < 0; }) ? ' has a negative entry' : ' adds to $' + hs(s) + '$'); }).join('; ') + '.'],
        hint: 'Check two things: nothing negative, and a total of exactly 1.'
      }, { kind: 'valid', good: good.map(function (v) { return v / 100; }) });
    }
    var pa = R.int(11, 17) * 5, pb = R.int(8, 16) * 5;
    if (shape === 'bound') {
      var which = R.pick(pa + pb > 100 ? ['minAB', 'maxAB', 'minAB'] : ['maxU', 'maxAB']);
      if (pa + pb <= 100 && which === 'minAB') which = 'maxU';
      var v = which === 'minAB' ? pa + pb - 100 : which === 'maxAB' ? M.min(pa, pb) : M.min(100, pa + pb);
      var askT = which === 'minAB' ? 'the smallest possible value of $P(A \\cap B)$' : which === 'maxAB' ? 'the largest possible value of $P(A \\cap B)$' : 'the largest possible value of $P(A \\cup B)$';
      var st = which === 'minAB' ? ['$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$, and $P(A \\cup B) \\le 1$.', 'So $P(A \\cap B) \\ge P(A) + P(B) - 1 = ' + hs(pa) + ' + ' + hs(pb) + ' - 1 = ' + hs(v) + '$.', 'This is reached when $A \\cup B$ is the whole sample space: the events must overlap at least that much.']
        : which === 'maxAB' ? ['$A \\cap B$ is inside A and inside B, so $P(A \\cap B) \\le P(A)$ and $P(A \\cap B) \\le P(B)$.', 'The largest possible value is the smaller one, $' + hs(v) + '$, reached when the smaller event lies inside the larger.']
          : ['$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\le P(A) + P(B) = ' + hs(pa + pb) + '$, and also $P(A \\cup B) \\le 1$.', 'The largest possible value is $' + hs(v) + '$' + (pa + pb <= 100 ? ', reached when A and B are disjoint.' : ', reached when the events together cover everything.')];
      return chk({ q: 'Events A and B have $P(A) = ' + hs(pa) + '$ and $P(B) = ' + hs(pb) + '$. What is ' + askT + '?', a: exd(q(v, 100)), steps: st, hint: which === 'minAB' ? 'P(A ∪ B) can be at most 1.' : 'An overlap fits inside both events.' }, { kind: which, PA: pa / 100, PB: pb / 100 });
    }
    // impossible: one listed value of P(A ∩ B) breaks the rules
    var lo = M.max(0, pa + pb - 100), hi = M.min(pa, pb), poss = [];
    for (var x = lo; x <= hi; x += 5) poss.push(x);
    poss = R.sample(poss, M.min(3, poss.length));
    var bad = lo > 0 && R.coin() ? lo - R.pick([5, 10]) : hi + R.pick([5, 10]);
    if (bad < 0) bad = hi + 5;
    return chk({
      q: 'Events A and B have $P(A) = ' + hs(pa) + '$ and $P(B) = ' + hs(pb) + '$. Which value is impossible for $P(A \\cap B)$?',
      a: mc('$' + hs(bad) + '$', poss.map(function (v2) { return '$' + hs(v2) + '$'; })),
      steps: ['$A \\cap B$ lies inside both events, so $P(A \\cap B) \\le \\min(P(A), P(B)) = ' + hs(hi) + '$.', 'Also $P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\le 1$, so $P(A \\cap B) \\ge ' + hs(pa + pb) + ' - 1' + (lo > 0 ? ' = ' + hs(lo) : '') + '$' + (lo > 0 ? '.' : ', which is no limit here beyond $P \\ge 0$.'), 'So $P(A \\cap B)$ must lie between $' + hs(lo) + '$ and $' + hs(hi) + '$; $' + hs(bad) + '$ does not.'],
      hint: 'The overlap fits inside each event, and the union can be at most 1.'
    }, { kind: 'impossible', PA: pa / 100, PB: pb / 100, bad: bad / 100 });
  });

  G('prob.inclusion-exclusion-events', function (R, ctx) {
    var shape = by(ctx, 'union', R.pick(['triple', 'none', 'count']), R.pick(['exactly1', 'exactly2', 'count']));
    if (shape === 'count') {
      var trip = R.pick([[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 4, 5], [3, 5, 7], [2, 3, 11]]), N = R.pick([100, 120, 150, 200, 210, 300]);
      var p1 = trip[0], p2 = trip[1], p3 = trip[2], f = function (d) { return M.floor(N / d); };
      var cnt = f(p1) + f(p2) + f(p3) - f(p1 * p2) - f(p1 * p3) - f(p2 * p3) + f(p1 * p2 * p3);
      return chk({
        q: 'A whole number is chosen at random from $1$ to $' + N + '$. What is the probability that it is divisible by ' + p1 + ', ' + p2 + ' or ' + p3 + '?',
        a: ex(q(cnt, N)),
        steps: ['Let A, B, C be "divisible by ' + p1 + '", "by ' + p2 + '", "by ' + p3 + '". Since ' + p1 + ', ' + p2 + ', ' + p3 + ' share no factors, "divisible by both ' + p1 + ' and ' + p2 + '" means "divisible by ' + p1 * p2 + '", and so on.',
          'Counts: $|A| = ' + f(p1) + '$, $|B| = ' + f(p2) + '$, $|C| = ' + f(p3) + '$; $|A \\cap B| = ' + f(p1 * p2) + '$, $|A \\cap C| = ' + f(p1 * p3) + '$, $|B \\cap C| = ' + f(p2 * p3) + '$; $|A \\cap B \\cap C| = ' + f(p1 * p2 * p3) + '$ (each is $\\lfloor ' + N + '/d \\rfloor$).',
          'Inclusion–exclusion: $' + f(p1) + ' + ' + f(p2) + ' + ' + f(p3) + ' - ' + f(p1 * p2) + ' - ' + f(p1 * p3) + ' - ' + f(p2 * p3) + ' + ' + f(p1 * p2 * p3) + ' = ' + cnt + '$ numbers.',
          'Probability: $\\dfrac{' + cnt + '}{' + N + '}' + (gcd(cnt, N) > 1 ? ' = ' + qd(q(cnt, N)) : '') + '$.'],
        hint: 'Add the three single counts, subtract the three pair counts, add back the triple count.'
      }, { kind: 'count', N: N, d: trip });
    }
    var r; do { r = { abc: R.int(1, 4), ab: R.int(2, 8), ac: R.int(2, 8), bc: R.int(2, 8), a: R.int(6, 20), b: R.int(6, 20), c: R.int(6, 20) }; r.n = 100 - r.abc - r.ab - r.ac - r.bc - r.a - r.b - r.c; } while (r.n < 5);
    var A = r.a + r.ab + r.ac + r.abc, B = r.b + r.ab + r.bc + r.abc, Cc = r.c + r.ac + r.bc + r.abc, AB = r.ab + r.abc, AC = r.ac + r.abc, BC = r.bc + r.abc, ABC = r.abc, U3 = 100 - r.n;
    var ctxs = [['members of a gym', 'swim', 'run', 'cycle'], ['students at a school', 'play an instrument', 'play a sport', 'act in the play'], ['customers of a store', 'buy fruit', 'buy bread', 'buy cheese'], ['visitors to a museum', 'see the fossils', 'see the paintings', 'see the planetarium']];
    var cx = R.pick(ctxs), u = cx[0];
    var given = 'Their probabilities: $P(A) = ' + hs(A) + '$, $P(B) = ' + hs(B) + '$, $P(C) = ' + hs(Cc) + '$, $P(A \\cap B) = ' + hs(AB) + '$, $P(A \\cap C) = ' + hs(AC) + '$, $P(B \\cap C) = ' + hs(BC) + '$';
    var setup = 'One of the ' + u + ' is chosen at random. A = "they ' + cx[1] + '", B = "they ' + cx[2] + '", C = "they ' + cx[3] + '". ';
    var ie = hs(A) + ' + ' + hs(B) + ' + ' + hs(Cc) + ' - ' + hs(AB) + ' - ' + hs(AC) + ' - ' + hs(BC) + ' + ' + hs(ABC);
    var data = { A: A / 100, B: B / 100, C: Cc / 100, AB: AB / 100, AC: AC / 100, BC: BC / 100, ABC: ABC / 100 };
    if (shape === 'union' || shape === 'none') {
      data.kind = shape;
      return chk({
        q: setup + given + ' and $P(A \\cap B \\cap C) = ' + hs(ABC) + '$. ' + (shape === 'union' ? 'Find $P(A \\cup B \\cup C)$.' : 'What is the probability that the person does none of the three?'),
        a: exd(q(shape === 'union' ? U3 : 100 - U3, 100)),
        steps: ['$P(A \\cup B \\cup C) = P(A) + P(B) + P(C) - P(A \\cap B) - P(A \\cap C) - P(B \\cap C) + P(A \\cap B \\cap C)$.', 'Why the last term: the triple overlap is added 3 times and subtracted 3 times, so it must be added back once.', '$= ' + ie + ' = ' + hs(U3) + '$.'].concat(shape === 'none' ? ['"None of the three" is the complement: $1 - ' + hs(U3) + ' = ' + hs(100 - U3) + '$.'] : []),
        hint: 'Add singles, subtract pairs, add back the triple.'
      }, data);
    }
    if (shape === 'triple') {
      data.kind = 'triple'; data.U = U3 / 100;
      return chk({
        q: setup + given + ', and $P(A \\cup B \\cup C) = ' + hs(U3) + '$. Find $P(A \\cap B \\cap C)$.',
        a: exd(q(ABC, 100)),
        steps: ['Inclusion–exclusion: $P(A \\cup B \\cup C) = \\Sigma P(\\text{singles}) - \\Sigma P(\\text{pairs}) + P(A \\cap B \\cap C)$.', 'Singles: $' + hs(A) + ' + ' + hs(B) + ' + ' + hs(Cc) + ' = ' + hs(A + B + Cc) + '$. Pairs: $' + hs(AB) + ' + ' + hs(AC) + ' + ' + hs(BC) + ' = ' + hs(AB + AC + BC) + '$.', '$' + hs(U3) + ' = ' + hs(A + B + Cc) + ' - ' + hs(AB + AC + BC) + ' + P(A \\cap B \\cap C)$, so $P(A \\cap B \\cap C) = ' + hs(ABC) + '$.'],
        hint: 'Write inclusion–exclusion and solve for the one unknown term.'
      }, data);
    }
    var one = shape === 'exactly1', v = one ? r.a + r.b + r.c : r.ab + r.ac + r.bc; data.kind = shape;
    return chk({
      q: setup + given + ' and $P(A \\cap B \\cap C) = ' + hs(ABC) + '$. What is the probability that the person does exactly ' + (one ? 'one' : 'two') + ' of the three?',
      a: exd(q(v, 100)),
      steps: one ? ['Count how often each region of the Venn diagram appears. $\\Sigma P(\\text{singles})$ counts the "exactly one" regions once, the "exactly two" regions twice, and the triple region three times.', '$\\Sigma P(\\text{pairs})$ counts each "exactly two" region once and the triple region three times.', 'So $P(\\text{exactly one}) = \\Sigma P(\\text{singles}) - 2\\,\\Sigma P(\\text{pairs}) + 3P(A \\cap B \\cap C)$.', '$= ' + hs(A + B + Cc) + ' - 2(' + hs(AB + AC + BC) + ') + 3(' + hs(ABC) + ') = ' + hs(v) + '$.']
        : ['Each pair probability, like $P(A \\cap B)$, includes the triple region.', 'So $P(\\text{exactly two}) = \\Sigma P(\\text{pairs}) - 3P(A \\cap B \\cap C)$.', '$= ' + hs(AB + AC + BC) + ' - 3(' + hs(ABC) + ') = ' + hs(v) + '$.'],
      hint: one ? 'Track how many times each Venn region is counted by the sums of singles and of pairs.' : 'Each pairwise overlap contains the triple overlap.'
    }, data);
  });

  G('prob.birthday-problem', function (R, ctx) {
    var CT = [
      { d: 7, s: 'Each of {n} people was born on one of the 7 days of the week, each day equally likely and independently.', ev: 'at least two of them were born on the same day of the week' },
      { d: 12, s: 'Each of {n} people was born in one of the 12 months, each month equally likely (a simplification) and independently.', ev: 'at least two of them share a birth month' },
      { d: 10, s: 'Each of {n} people picks a random digit from 0 to 9, independently.', ev: 'at least two of them pick the same digit' },
      { d: 20, s: 'Each of {n} campers is assigned one of 20 activity groups at random, independently and all equally likely.', ev: 'at least two campers land in the same group' },
      { d: 30, s: 'Each of {n} friends picks a random whole number from 1 to 30, independently.', ev: 'at least two of them pick the same number' },
      { d: 6, s: 'Each of {n} players rolls one fair die.', ev: 'at least two of them roll the same number' },
      { d: 8, s: 'Each of {n} players rolls one fair eight-sided die.', ev: 'at least two of them roll the same number' },
      { d: 26, s: 'Each of {n} people picks a random letter from A to Z, independently.', ev: 'at least two of them pick the same letter' },
      { d: 15, s: 'Each of {n} hikers picks one of 15 trail markers at random to meet at, independently.', ev: 'at least two of them pick the same marker' },
      { d: 5, s: 'Each of {n} children picks one of 5 ice-cream flavors at random, independently and all equally likely.', ev: 'at least two of them pick the same flavor' },
      { d: 9, s: 'Each of {n} people picks a random digit from 1 to 9, independently.', ev: 'at least two of them pick the same digit' },
      { d: 24, s: 'Each of {n} people was born in a random hour of the day (24 equally likely hours), independently.', ev: 'at least two of them were born in the same hour' },
      { d: 16, s: 'Each of {n} players draws a card from their own 16-card deck (all cards different, the same in every deck).', ev: 'at least two of them draw the same card' }
    ];
    var shape = by(ctx, 'match', 'match', R.pick(['needed', 'mine', 'match']));
    function noMatch(n, d) { var p = Q(1); for (var i = 0; i < n; i++) p = p.mul(q(d - i, d)); return p; }
    if (shape === 'needed') {
      var d = R.pick([7, 10, 12, 20, 30, 365]), n = 1, pr = Q(1), hist = [];
      while (pr.gt(q(1, 2))) { pr = pr.mul(q(d - n, d)); n++; hist.push([n, pr]); }
      var last = hist[hist.length - 1], prev = hist[hist.length - 2];
      return chk({
        q: 'People are assigned one of $' + d + '$ equally likely "days" at random and independently' + (d === 365 ? ' (birthdays, ignoring leap years)' : '') + '. What is the smallest group size $n$ for which the chance that at least two share a day is more than $\\frac{1}{2}$?',
        a: { t: 'num', v: String(n), form: 'int' },
        steps: ['$P(\\text{no match among } n) = \\dfrac{' + d + '}{' + d + '} \\cdot \\dfrac{' + (d - 1) + '}{' + d + '} \\cdots \\dfrac{' + d + ' - n + 1}{' + d + '}$: each new person must avoid the days already taken.', 'Multiply until the product drops below $\\frac{1}{2}$.', 'For $n = ' + prev[0] + '$: $P(\\text{no match}) \\approx ' + dec(prev[1], 4) + '$, so a match has chance about $' + dec(Q(1).sub(prev[1]), 4) + '$, not yet more than one half.', 'For $n = ' + last[0] + '$: $P(\\text{no match}) \\approx ' + dec(last[1], 4) + '$, so a match has chance about $' + dec(Q(1).sub(last[1]), 4) + ' > \\frac{1}{2}$. The answer is $n = ' + n + '$.'],
        hint: 'Multiply (d − 1)/d, (d − 2)/d, … until the chance of no match falls below one half.'
      }, { kind: 'needed', d: d });
    }
    var c = R.pick(shape === 'mine' ? CT : by(ctx, CT.filter(function (x) { return x.d <= 15; }), CT, CT)), nn = by(ctx, R.int(3, 4), R.int(4, 6), R.int(4, 6));
    if (c.d <= 8 && nn > 5) nn = 5; if (c.d === 5 && nn > 4) nn = 4;
    var askAll = shape === 'match' && R.chance(0.35);
    if (shape === 'mine') {
      var others = nn - 1, pmine = Q(1).sub(q(c.d - 1, c.d).pow(others)), pany = Q(1).sub(noMatch(nn, c.d));
      return chk({
        q: c.s.replace('{n}', String(nn)) + ' You are one of them. Find (a) the probability that at least one of the other ' + others + ' matches <i>you</i>, and (b) the probability that ' + c.ev + '.',
        a: { t: 'multi', parts: [{ label: '(a)', a: ex(pmine) }, { label: '(b)', a: ex(pany) }] },
        steps: ['(a) Each other person misses your value with probability $\\frac{' + (c.d - 1) + '}{' + c.d + '}$, independently: $P = 1 - \\left(\\frac{' + (c.d - 1) + '}{' + c.d + '}\\right)^{' + others + '} = ' + qt(pmine) + '$.', '(b) Any pair can match, not only pairs that include you: there are $\\binom{' + nn + '}{2} = ' + nn * (nn - 1) / 2 + '$ pairs.', 'No match at all: $' + Array.from({ length: nn }, function (_, i) { return '\\frac{' + (c.d - i) + '}{' + c.d + '}'; }).join(' \\cdot ') + ' = ' + qt(noMatch(nn, c.d)) + '$.', 'So $P(\\text{some match}) = 1 - ' + qt(noMatch(nn, c.d)) + ' = ' + qt(pany) + '$, larger than (a).'],
        hint: 'For (b), use the complement: everyone different.'
      }, { kind: 'mine', d: c.d, n: nn });
    }
    var nm = noMatch(nn, c.d), pm = Q(1).sub(nm);
    if (askAll) return chk({
      q: c.s.replace('{n}', String(nn)) + ' What is the probability that no two of them match (all ' + nn + ' are different)?',
      a: ex(nm),
      steps: ['Go one at a time. The first can be anything; the second must avoid 1 value; the third must avoid 2; and so on.', 'Multiply (each choice is independent of the earlier ones): $' + Array.from({ length: nn }, function (_, i) { return '\\frac{' + (c.d - i) + '}{' + c.d + '}'; }).join(' \\cdot ') + ' = ' + qt(nm) + '$.'],
      hint: 'Each new person must avoid the values already taken.'
    }, { kind: 'alldiff', d: c.d, n: nn });
    return chk({
      q: c.s.replace('{n}', String(nn)) + ' What is the probability that ' + c.ev + '?',
      a: ex(pm),
      steps: ['"At least two match" has many cases; its complement, "all different", has one.', 'All different: the first is free, the second avoids 1 value, the third avoids 2, …: $' + Array.from({ length: nn }, function (_, i) { return '\\frac{' + (c.d - i) + '}{' + c.d + '}'; }).join(' \\cdot ') + ' = ' + qt(nm) + '$.', '$P(\\text{at least two match}) = 1 - ' + qt(nm) + ' = ' + qt(pm) + '$.'],
      hint: 'Find the chance that all are different, then subtract from 1.'
    }, { kind: 'match', d: c.d, n: nn });
  });


  // ================================================================ Unit 2: Conditioning
  // an exact probability; when it is not a short decimal, a decimal to 3 places is accepted too
  
  var TWOWAY = [
    { u: 'students', one: 'student', A: 'play a sport', B: 'have a part-time job', Ah: 'Sport', nAh: 'No sport', Bh: 'Job', nBh: 'No job', Ag: 'students who play a sport', Bg: 'students with a part-time job', AB: 'play a sport and have a part-time job', A1: 'plays a sport', B1: 'has a part-time job' },
    { u: 'patients', one: 'patient', A: 'took the new drug', B: 'improved', Ah: 'Drug', nAh: 'Placebo', Bh: 'Improved', nBh: 'Did not', Ag: 'patients who took the drug', Bg: 'patients who improved', AB: 'took the drug and improved', A1: 'took the drug', B1: 'improved' },
    { u: 'emails', one: 'email', A: 'have an attachment', B: 'are spam', Ah: 'Attachment', nAh: 'None', Bh: 'Spam', nBh: 'Not spam', Ag: 'emails with an attachment', Bg: 'spam emails', AB: 'have an attachment and are spam', A1: 'has an attachment', B1: 'is spam' },
    { u: 'adults surveyed', one: 'adult', A: 'own a bike', B: 'live downtown', Ah: 'Bike', nAh: 'No bike', Bh: 'Downtown', nBh: 'Elsewhere', Ag: 'bike owners', Bg: 'downtown residents', AB: 'own a bike and live downtown', A1: 'owns a bike', B1: 'lives downtown' }
  ];
  function twoWay(R) {
    var c = R.pick(TWOWAY), n = [R.int(2, 12) * 5, R.int(2, 12) * 5, R.int(2, 12) * 5, R.int(2, 12) * 5];
    var N = n[0] + n[1] + n[2] + n[3], rA = n[0] + n[1], cB = n[0] + n[2];
    var tb = table(['', c.Bh, c.nBh, 'Total'], [[c.Ah, n[0], n[1], rA], [c.nAh, n[2], n[3], n[2] + n[3]], ['Total', cB, n[1] + n[3], N]]);
    return { c: c, n: n, N: N, rA: rA, cB: cB, tb: tb };
  }
  G('prob.conditional-vs-joint', function (R, ctx) {
    var shape = by(ctx, 'table', 'which', R.pick(['words', 'which']));
    if (shape === 'words') {
      var W = R.pick([
        { a: 'buy coffee', b: 'buy a pastry', ab: 'buy both coffee and a pastry', u: 'customers at a café', one: 'customer' },
        { a: 'are adults', b: 'borrow a DVD', ab: 'are adults who borrow a DVD', u: 'visitors to a library', one: 'visitor' },
        { a: 'own a dog', b: 'own a cat', ab: 'own both a dog and a cat', u: 'households in a city', one: 'household' },
        { a: 'take the bus', b: 'arrive late', ab: 'take the bus and arrive late', u: 'employees of a company', one: 'employee' }
      ]);
      var kind = R.pick(['cond', 'joint', 'base']), pB = R.int(3, 16) * 5, pAgB = R.pick([10, 20, 25, 30, 40, 50, 60, 75, 80]), pAB = q(pB, 100).mul(q(pAgB, 100));
      if (kind === 'cond') return chk({
        q: 'Of the ' + W.u + ', ' + pB + '% ' + W.a + ', and ' + T.num(pAB.mul(100)) + '% ' + W.ab + '. Of those who ' + W.a + ', what fraction ' + W.b + '?',
        a: exd(q(pAgB, 100)),
        steps: ['"Of those who ' + W.a + '" restricts attention to that group: this is a conditional probability, $P(B \\mid A)$ with A = "' + W.a + '" and B = "' + W.b + '".', 'The ' + T.num(pAB.mul(100)) + '% is the joint probability $P(A \\cap B)$: a share of everyone.', '$P(B \\mid A) = \\dfrac{P(A \\cap B)}{P(A)} = \\dfrac{' + dec(pAB, 4) + '}{' + hs(pB) + '} = ' + hs(pAgB) + '$.'],
        hint: 'Divide the "both" share by the share of the group you are told to look within.'
      }, { kind: 'cond', pA: pB / 100, pAB: pAB.toNumber() });
      if (kind === 'joint') return chk({
        q: 'Of the ' + W.u + ', ' + pB + '% ' + W.a + '. Of those who ' + W.a + ', ' + pAgB + '% ' + W.b + '. What percent of all the ' + W.u + ' ' + W.ab + '? (Answer as a decimal or a percent.)',
        a: exd(pAB),
        steps: ['The ' + pAgB + '% is conditional: $P(B \\mid A) = ' + hs(pAgB) + '$, a share of the group, not of everyone.', 'Joint from conditional: $P(A \\cap B) = P(A)\\,P(B \\mid A) = ' + hs(pB) + ' \\times ' + hs(pAgB) + ' = ' + dec(pAB, 4) + '$.', 'That is $' + T.num(pAB.mul(100)) + '\\%$ of all the ' + W.u + '.'],
        hint: 'A share of a share: multiply.'
      }, { kind: 'joint', pA: pB / 100, pBgA: pAgB / 100 });
      return chk({
        q: 'Of the ' + W.u + ', ' + T.num(pAB.mul(100)) + '% ' + W.ab + '. Of those who ' + W.a + ', ' + pAgB + '% ' + W.b + '. What fraction of the ' + W.u + ' ' + W.a + '?',
        a: exd(q(pB, 100)),
        steps: ['$P(A \\cap B) = ' + dec(pAB, 4) + '$ is joint; $P(B \\mid A) = ' + hs(pAgB) + '$ is conditional.', 'Since $P(A \\cap B) = P(A)\\,P(B \\mid A)$, we get $P(A) = \\dfrac{P(A \\cap B)}{P(B \\mid A)} = \\dfrac{' + dec(pAB, 4) + '}{' + hs(pAgB) + '} = ' + hs(pB) + '$.'],
        hint: 'Use P(A ∩ B) = P(A) · P(B | A) and solve for P(A).'
      }, { kind: 'base', pAB: pAB.toNumber(), pBgA: pAgB / 100 });
    }
    var D = twoWay(R), c = D.c, n = D.n, N = D.N;
    var defs = 'One ' + c.one + ' is chosen at random from the table. Let A = "' + c.A1 + '" and B = "' + c.B1 + '".';
    var Qs = [
      { k: 'joint', v: q(n[0], N), t: 'P(A \\cap B)', s: R.pick(['What fraction of all the ' + c.u + ' ' + c.AB + '?', 'What is the probability that the chosen ' + c.one + ' ' + c.A1 + ' and ' + c.B1 + '?']), how: 'both, out of everyone: $\\dfrac{' + n[0] + '}{' + N + '}$' },
      { k: 'BgA', v: q(n[0], D.rA), t: 'P(B \\mid A)', s: R.pick(['Of the ' + c.Ag + ', what fraction ' + c.B.replace(/^have/, 'have').replace(/^are/, 'are') + '?', 'Among ' + c.Ag + ', what is the probability that one chosen at random ' + c.B1 + '?']), how: 'within the ' + c.Ah + ' row: $\\dfrac{' + n[0] + '}{' + D.rA + '}$' },
      { k: 'AgB', v: q(n[0], D.cB), t: 'P(A \\mid B)', s: R.pick(['Of the ' + c.Bg + ', what fraction ' + c.A + '?', 'Among ' + c.Bg + ', what is the probability that one chosen at random ' + c.A1 + '?']), how: 'within the ' + c.Bh + ' column: $\\dfrac{' + n[0] + '}{' + D.cB + '}$' },
      { k: 'A', v: q(D.rA, N), t: 'P(A)', s: 'What fraction of all the ' + c.u + ' ' + c.A + '?', how: 'the ' + c.Ah + ' row total over everyone: $\\dfrac{' + D.rA + '}{' + N + '}$' }
    ];
    var pickQ = shape === 'table' ? R.pick(Qs.slice(0, 3)) : R.pick(Qs.slice(0, 3));
    var stepsT = ['Read the question for the group it looks within. ' + (pickQ.k === 'joint' ? 'Nothing restricts the group, and it asks for both at once: the joint probability $P(A \\cap B)$.' : pickQ.k === 'BgA' ? 'It looks only within the ' + c.Ag + ': the conditional probability $P(B \\mid A)$.' : 'It looks only within the ' + c.Bg + ': the conditional probability $P(A \\mid B)$.'), 'Divide the "both" count by the size of that group: ' + pickQ.how + ' $= ' + qt(pickQ.v) + '$.'];
    if (shape === 'table') return chk({ q: c.u.charAt(0).toUpperCase() + c.u.slice(1) + ' were counted in this table.' + D.tb + pickQ.s, a: ex(pickQ.v), steps: stepsT, hint: 'Decide which total belongs in the denominator: everyone, a row, or a column.' }, { kind: pickQ.k, n: n });
    var choices = Qs.map(function (x) { return '$' + x.t + '$'; });
    return chk({
      q: c.u.charAt(0).toUpperCase() + c.u.slice(1) + ' were counted in this table.' + D.tb + defs + ' Question: "' + pickQ.s + '" (a) Which probability does it ask for? (b) Find it.',
      a: { t: 'multi', parts: [{ label: '(a)', a: mc('$' + pickQ.t + '$', choices.filter(function (x) { return x !== '$' + pickQ.t + '$'; })) }, { label: '(b)', a: ex(pickQ.v) }] },
      steps: stepsT.slice(0, 1).concat(['So (a) is $' + pickQ.t + '$.', '(b): ' + pickQ.how + ' $= ' + qt(pickQ.v) + '$.']),
      hint: '"Of the …" or "among …" names the group you divide by.'
    }, { kind: pickQ.k, n: n });
  });

  G('prob.total-probability', function (R, ctx) {
    var shape = by(ctx, R.pick(['two', 'urn2']), R.pick(['three', 'die']), R.pick(['missing', 'second']));
    if (shape === 'two' || shape === 'three' || shape === 'missing') {
      var k = shape === 'two' ? 2 : 3, sh, rate;
      if (k === 2) { var s1 = R.int(3, 8) * 10; sh = [s1, 100 - s1]; } else { do { sh = [R.int(2, 6) * 10, R.int(1, 4) * 10]; sh.push(100 - sh[0] - sh[1]); } while (sh[2] < 10); }
      rate = R.sample([1, 2, 3, 4, 5, 6, 8], k);
      var Cx = R.pick([{ src: 'machines', one: 'Machine', item: 'parts', bad: 'defective' }, { src: 'suppliers', one: 'Supplier', item: 'chips', bad: 'faulty' }, { src: 'shifts', one: 'Shift', item: 'loaves', bad: 'underbaked' }]);
      var names = ['A', 'B', 'C'].slice(0, k), tot = sumQ(sh.map(function (s, i) { return q(s, 100).mul(q(rate[i], 100)); }));
      var parts = names.map(function (nm, i) { return Cx.one + ' ' + nm + ' makes ' + sh[i] + '% of the ' + Cx.item + ', and ' + rate[i] + '% of its ' + Cx.item + ' are ' + Cx.bad; });
      if (shape !== 'missing') return chk({
        q: 'A factory has ' + k + ' ' + Cx.src + '. ' + parts.join('; ') + '. One ' + Cx.item.replace(/s$/, '') + ' is chosen at random from all of them. What is the probability that it is ' + Cx.bad + '?',
        a: exd(tot),
        steps: ['The ' + Cx.src + ' split the ' + Cx.item + ' into cases that do not overlap and cover everything.', 'Law of total probability: $P(D) = ' + names.map(function (nm) { return 'P(D \\mid ' + nm + ')P(' + nm + ')'; }).join(' + ') + '$.', '$= ' + names.map(function (nm, i) { return hs(rate[i]) + ' \\cdot ' + hs(sh[i]) + ''; }).join(' + ') + ' = ' + dec(tot, 6) + '$.'],
        hint: 'Weight each defect rate by its share, then add.'
      }, { kind: 'mix', sh: sh, rate: rate });
      return chk({
        q: 'A factory has 3 ' + Cx.src + '. ' + parts.slice(0, 2).join('; ') + '; ' + Cx.one + ' C makes the remaining ' + sh[2] + '%. Overall, ' + T.num(tot.mul(100)) + '% of all ' + Cx.item + ' are ' + Cx.bad + '. What percent of ' + Cx.one + ' C\'s ' + Cx.item + ' are ' + Cx.bad + '? (Answer as a decimal, like 0.05, or a percent.)',
        a: exd(q(rate[2], 100)),
        steps: ['Total probability: $P(D) = P(D \\mid A)P(A) + P(D \\mid B)P(B) + P(D \\mid C)P(C)$.', '$' + dec(tot, 6) + ' = ' + hs(rate[0]) + ' \\cdot ' + hs(sh[0]) + ' + ' + hs(rate[1]) + ' \\cdot ' + hs(sh[1]) + ' + x \\cdot ' + hs(sh[2]) + '$.', '$' + hs(sh[2]) + 'x = ' + dec(tot, 6) + ' - ' + dec(q(rate[0] * sh[0] + rate[1] * sh[1], 10000), 6) + ' = ' + dec(q(rate[2] * sh[2], 10000), 6) + '$, so $x = ' + hs(rate[2]) + '$.'],
        hint: 'Write the total-probability equation with C\'s rate as the unknown.'
      }, { kind: 'missingrate', sh: sh, rate: rate.slice(0, 2), tot: tot.toNumber() });
    }
    if (shape === 'urn2' || shape === 'die') {
      var U2 = [[R.int(2, 5), R.int(1, 4)], [R.int(1, 4), R.int(2, 6)], [R.int(1, 5), R.int(1, 5)]];
      var pick = shape === 'urn2' ? (R.coin() ? { txt: 'Flip a fair coin. Heads: draw from bag I; tails: draw from bag II.', p: [q(1, 2), q(1, 2)] } : { txt: 'Roll a die. A 1 or 2 sends you to bag I; 3 to 6 sends you to bag II.', p: [q(1, 3), q(2, 3)] })
        : { txt: 'Roll a die. A 1 sends you to bag I, 2 or 3 to bag II, and 4, 5 or 6 to bag III.', p: [q(1, 6), q(1, 3), q(1, 2)] };
      var nb = pick.p.length, bags = U2.slice(0, nb), rom = ['I', 'II', 'III'];
      var prR = sumQ(bags.map(function (b, i) { return pick.p[i].mul(q(b[0], b[0] + b[1])); }));
      return chk({
        q: pick.txt + ' ' + bags.map(function (b, i) { return (i ? 'bag ' : 'Bag ') + rom[i] + ' holds ' + b[0] + ' red and ' + b[1] + ' blue marbles'; }).join('; ') + '. You draw one marble at random from your bag. What is the probability it is red?',
        a: ex(prR),
        steps: ['Condition on the bag: the bags are disjoint cases that cover every outcome.', '$P(\\text{red}) = ' + bags.map(function (b, i) { return 'P(\\text{red} \\mid ' + rom[i] + ')P(' + rom[i] + ')'; }).join(' + ') + '$.', '$= ' + bags.map(function (b, i) { return '\\frac{' + b[0] + '}{' + (b[0] + b[1]) + '} \\cdot ' + qt(pick.p[i]); }).join(' + ') + ' = ' + qt(prR) + '$.'],
        hint: 'Weight each bag\'s chance of red by the chance of using that bag.'
      }, { kind: 'urns', bags: bags, p: pick.p.map(qp) });
    }
    // second draw without replacement
    var r = R.int(2, 7), b = R.intNot(2, 7, r), nT = r + b, p2 = q(r, nT).mul(q(r - 1, nT - 1)).add(q(b, nT).mul(q(r, nT - 1)));
    return chk({
      q: 'A box holds ' + r + ' red and ' + b + ' blue marbles. You draw one marble at random and set it aside without looking, then draw a second. What is the probability that the second marble is red?',
      a: ex(p2),
      steps: ['Condition on the first draw: it is red or blue, never both.', 'If the first was red: $P(\\text{2nd red} \\mid \\text{1st red}) = \\frac{' + (r - 1) + '}{' + (nT - 1) + '}$. If it was blue: $\\frac{' + r + '}{' + (nT - 1) + '}$.', '$P(\\text{2nd red}) = \\frac{' + (r - 1) + '}{' + (nT - 1) + '} \\cdot \\frac{' + r + '}{' + nT + '} + \\frac{' + r + '}{' + (nT - 1) + '} \\cdot \\frac{' + b + '}{' + nT + '} = ' + qt(p2) + '$.', 'This equals $\\frac{' + r + '}{' + nT + '}$, the chance for the first draw: not knowing the first marble, the second is just as likely to be any marble.'],
      hint: 'Split into cases by the color of the first marble.'
    }, { kind: 'second', r: r, b: b });
  });

  G('prob.bayes-several', function (R, ctx) {
    var shape = by(ctx, R.pick(['urn2', 'mach2']), 'mach3', R.pick(['tests', 'mach3']));
    if (shape === 'urn2') {
      var b1 = [R.int(2, 6), R.int(1, 4)], b2 = [R.int(1, 3), R.int(2, 6)], pr = R.pick([[q(1, 2), q(1, 2)], [q(1, 3), q(2, 3)], [q(1, 4), q(3, 4)]]);
      var j1 = pr[0].mul(q(b1[0], b1[0] + b1[1])), j2 = pr[1].mul(q(b2[0], b2[0] + b2[1])), post = j1.div(j1.add(j2));
      return chk({
        q: 'You pick bag I with probability $' + qt(pr[0]) + '$ and bag II otherwise. Bag I holds ' + b1[0] + ' red and ' + b1[1] + ' blue marbles; bag II holds ' + b2[0] + ' red and ' + b2[1] + ' blue. You draw a marble at random from your bag, and it is red. What is the probability that you picked bag I?',
        a: ex(post),
        steps: ['Each path: $P(\\text{I} \\cap \\text{red}) = ' + qt(pr[0]) + ' \\cdot \\frac{' + b1[0] + '}{' + (b1[0] + b1[1]) + '} = ' + qt(j1) + '$ and $P(\\text{II} \\cap \\text{red}) = ' + qt(pr[1]) + ' \\cdot \\frac{' + b2[0] + '}{' + (b2[0] + b2[1]) + '} = ' + qt(j2) + '$.', 'Total: $P(\\text{red}) = ' + qt(j1) + ' + ' + qt(j2) + ' = ' + qt(j1.add(j2)) + '$.', 'Bayes: $P(\\text{I} \\mid \\text{red}) = \\dfrac{' + qt(j1) + '}{' + qt(j1.add(j2)) + '} = ' + qt(post) + '$.'],
        hint: 'Your path\'s share of all the ways to draw red.'
      }, { kind: 'urn2', b1: b1, b2: b2, p1: qp(pr[0]) });
    }
    if (shape === 'mach2' || shape === 'mach3') {
      var k = shape === 'mach2' ? 2 : 3, sh, rate;
      if (k === 2) { var s1 = R.int(3, 8) * 10; sh = [s1, 100 - s1]; } else { do { sh = [R.int(2, 6) * 10, R.int(1, 4) * 10]; sh.push(100 - sh[0] - sh[1]); } while (sh[2] < 10); }
      rate = R.sample([1, 2, 3, 4, 5, 6, 8], k);
      var names = ['A', 'B', 'C'].slice(0, k), jn = sh.map(function (s, i) { return q(s * rate[i], 10000); }), tot = sumQ(jn), j = R.int(0, k - 1), post2 = jn[j].div(tot);
      var Cx = R.pick([{ src: 'machines', one: 'Machine', item: 'part', bad: 'defective' }, { src: 'suppliers', one: 'Supplier', item: 'chip', bad: 'faulty' }, { src: 'labs', one: 'Lab', item: 'sample', bad: 'mislabeled' }]);
      var intro = k === 2 ? 'A company gets its ' + Cx.item + 's from two ' + Cx.src + '. ' : 'A company gets its ' + Cx.item + 's from three ' + Cx.src + '. ';
      return chk({
        q: intro + names.map(function (nm, i) { return Cx.one + ' ' + nm + ' supplies ' + sh[i] + '% of them, and ' + rate[i] + '% of its ' + Cx.item + 's are ' + Cx.bad; }).join('; ') + '. A ' + Cx.item + ' chosen at random is ' + Cx.bad + '. What is the probability that it came from ' + Cx.one + ' ' + names[j] + '?' + exdNote(post2),
        a: exd(post2),
        steps: ['Joint probabilities, $P(\\text{source} \\cap D) = P(D \\mid \\text{source})\\,P(\\text{source})$: ' + names.map(function (nm, i) { return '$' + nm + ': ' + hs(rate[i]) + ' \\cdot ' + hs(sh[i]) + ' = ' + dec(jn[i], 6) + '$'; }).join(', ') + '.', 'Total probability: $P(D) = ' + jn.map(function (x) { return dec(x, 6); }).join(' + ') + ' = ' + dec(tot, 6) + '$.', 'Bayes: $P(' + names[j] + ' \\mid D) = \\dfrac{' + dec(jn[j], 6) + '}{' + dec(tot, 6) + '} = ' + qt(post2) + (post2.isTerminating() ? '' : ' \\approx ' + dec(post2, 4)) + '$.'],
        hint: 'Find this source\'s share of all the ' + Cx.bad + ' ' + Cx.item + 's.'
      }, { kind: 'mach', sh: sh, rate: rate, j: j });
    }
    // two independent positive tests
    var prev = R.pick([1, 2, 4, 5, 10]), sens = R.pick([80, 90, 95]), fp = R.pick([2, 5, 10, 20]), two = R.coin();
    var pD = q(prev, 100), s = q(sens, 100), f = q(fp, 100), num1 = pD.mul(two ? s.mul(s) : s.mul(Q(1).sub(s))), num0 = Q(1).sub(pD).mul(two ? f.mul(f) : f.mul(Q(1).sub(f))), post3 = num1.div(num1.add(num0));
    var after1 = pD.mul(s).div(pD.mul(s).add(Q(1).sub(pD).mul(f)));
    return chk({
      q: 'A condition affects ' + prev + '% of a population. A test is positive for ' + sens + '% of people with the condition and for ' + fp + '% of people without it. Someone is tested twice; given their condition (or its absence), the two results are independent. The results are ' + (two ? 'positive both times' : 'positive the first time and negative the second') + '. What is the probability that they have the condition?' + exdNote(post3),
      a: exd(post3),
      steps: ['Let D = "has the condition". After the first positive: $P(D \\mid +) = \\dfrac{' + hs(sens) + ' \\cdot ' + hs(prev) + '}{' + hs(sens) + ' \\cdot ' + hs(prev) + ' + ' + hs(fp) + ' \\cdot ' + hs(100 - prev) + '} \\approx ' + dec(after1, 4) + '$.', 'Use that as the new prior and update with the second result, ' + (two ? 'positive: multiply by $' + hs(sens) + '$ (with D) or $' + hs(fp) + '$ (without).' : 'negative: multiply by $' + hs(100 - sens) + '$ (with D) or $' + hs(100 - fp) + '$ (without).'), 'In one step: $P(D \\mid \\text{results}) = \\dfrac{' + dec(num1, 8) + '}{' + dec(num1, 8) + ' + ' + dec(num0, 8) + '} = ' + qt(post3) + (post3.isTerminating() ? '' : ' \\approx ' + dec(post3, 4)) + '$.'],
      hint: 'Multiply the prior by the chance of both results on each side, then normalize.'
    }, { kind: 'tests', prev: prev / 100, sens: sens / 100, fp: fp / 100, two: two });
  });

  G('prob.independence-several', function (R, ctx) {
    var shape = by(ctx, R.pick(['pair', 'disjoint']), R.pick(['three', 'three']), R.pick(['flips', 'flips', 'pair']));
    if (shape === 'pair') {
      var pa = R.pick([q(1, 2), q(1, 3), q(2, 5), q(3, 5), q(1, 4), q(3, 4), q(2, 3), q(3, 10), q(7, 10)]), pb = R.pick([q(1, 2), q(1, 3), q(2, 5), q(1, 4), q(3, 5), q(1, 5), q(3, 4)]), ind = R.coin();
      var pab = ind ? pa.mul(pb) : pa.mul(pb).add(R.pick([q(1, 20), q(1, 30), q(1, 12), q(-1, 20)]));
      if (pab.le(0) || pab.gt(Q.min(pa, pb)) || pa.add(pb).sub(pab).gt(1)) { pab = pa.mul(pb); ind = true; }
      return chk({
        q: 'Events A and B have $P(A) = ' + qt(pa) + '$, $P(B) = ' + qt(pb) + '$ and $P(A \\cap B) = ' + qt(pab) + '$. (a) Find $P(A)\\,P(B)$. (b) True or false: A and B are independent.',
        a: { t: 'multi', parts: [{ label: '(a) $P(A)P(B) =$', a: ex(pa.mul(pb)) }, { label: '(b)', a: { t: 'tf', v: ind } }] },
        steps: ['$P(A)\\,P(B) = ' + qt(pa) + ' \\cdot ' + qt(pb) + ' = ' + qt(pa.mul(pb)) + '$.', 'Independent means $P(A \\cap B) = P(A)P(B)$. Here $P(A \\cap B) = ' + qt(pab) + (ind ? '$, equal: <b>true</b>.' : '$, not equal: <b>false</b>. Knowing A changes the chance of B: $P(B \\mid A) = ' + qt(pab.div(pa)) + ' \\ne ' + qt(pb) + '$.')],
        hint: 'Compare P(A ∩ B) with the product P(A)P(B).'
      }, { kind: 'pair', pa: qp(pa), pb: qp(pb), pab: qp(pab) });
    }
    if (shape === 'disjoint') {
      var p1 = R.int(1, 5) / 10, p2 = R.int(1, 4) / 10;
      return chk({
        q: 'Events A and B are mutually exclusive (they cannot both happen), with $P(A) = ' + num(p1) + '$ and $P(B) = ' + num(p2) + '$. (a) Find $P(A \\cap B)$. (b) True or false: A and B are independent.',
        a: { t: 'multi', parts: [{ label: '(a)', a: ex(0) }, { label: '(b)', a: { t: 'tf', v: false } }] },
        steps: ['Mutually exclusive means $A \\cap B$ is empty, so $P(A \\cap B) = 0$.', 'But $P(A)P(B) = ' + num(p1) + ' \\cdot ' + num(p2) + ' = ' + num(U.fix(p1 * p2)) + ' \\ne 0$: not independent. (b) is <b>false</b>.', 'In words: if A happens, B certainly did not, so A carries information about B. Disjoint events with positive probabilities are always dependent.'],
        hint: 'What does knowing A happened tell you about B?'
      }, { kind: 'disjoint' });
    }
    if (shape === 'three') {
      var ps = R.sample([q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(1, 5), q(2, 5), q(3, 5), q(4, 5), q(1, 10), q(9, 10)], 3), ask = R.pick(['atleast', 'exactly1', 'none', 'all']);
      var qs = ps.map(function (p) { return Q(1).sub(p); }), v;
      var Cx = R.pick([['Three smoke alarms each sound in a fire', 'alarm sounds', 'alarms sound'], ['Three players each make a free throw', 'player makes the shot', 'players make their shots'], ['Three seeds each sprout', 'seed sprouts', 'seeds sprout']]);
      if (ask === 'atleast') v = Q(1).sub(qs[0].mul(qs[1]).mul(qs[2])); else if (ask === 'none') v = qs[0].mul(qs[1]).mul(qs[2]); else if (ask === 'all') v = ps[0].mul(ps[1]).mul(ps[2]);
      else v = ps[0].mul(qs[1]).mul(qs[2]).add(qs[0].mul(ps[1]).mul(qs[2])).add(qs[0].mul(qs[1]).mul(ps[2]));
      var askT = { atleast: 'at least one ' + Cx[1], exactly1: 'exactly one ' + Cx[1], none: 'none of the ' + Cx[2], all: 'all three ' + Cx[2] }[ask];
      var st = ask === 'atleast' ? ['"At least one" is the complement of "none".', 'By independence, $P(\\text{none}) = ' + qs.map(function (x) { return T.p(qt(x)); }).join(' \\cdot ') + ' = ' + qt(qs[0].mul(qs[1]).mul(qs[2])) + '$.', '$P(\\text{at least one}) = 1 - ' + qt(qs[0].mul(qs[1]).mul(qs[2])) + ' = ' + qt(v) + '$.']
        : ask === 'none' ? ['Independence lets us multiply the three chances of failing:', '$' + qs.map(function (x) { return T.p(qt(x)); }).join(' \\cdot ') + ' = ' + qt(v) + '$.']
          : ask === 'all' ? ['Mutual independence lets us multiply all three:', '$' + ps.map(function (x) { return T.p(qt(x)); }).join(' \\cdot ') + ' = ' + qt(v) + '$.']
            : ['Exactly one: three disjoint cases (only the 1st, only the 2nd, only the 3rd).', 'Each case multiplies by independence, e.g. only the 1st: $' + qt(ps[0]) + ' \\cdot ' + qt(qs[1]) + ' \\cdot ' + qt(qs[2]) + '$.', 'Sum: $' + qt(ps[0].mul(qs[1]).mul(qs[2])) + ' + ' + qt(qs[0].mul(ps[1]).mul(qs[2])) + ' + ' + qt(qs[0].mul(qs[1]).mul(ps[2])) + ' = ' + qt(v) + '$.'];
      return chk({ q: Cx[0] + ' independently, with probabilities $' + ps.map(qt).join('$, $') + '$. What is the probability that ' + askT + '?', a: ex(v), steps: st, hint: ask === 'atleast' ? 'Use the complement: none of them.' : 'Independence lets you multiply.' }, { kind: 'three', ps: ps.map(qp), ask: ask });
    }
    // three events on three coin flips: independent, pairwise only, or not even pairwise
    var outs = []; for (var i = 0; i < 8; i++) outs.push([(i >> 2) & 1, (i >> 1) & 1, i & 1]); // 1 = heads
    var LIB = [
      { t: 'the first flip is heads', f: function (o) { return o[0] === 1; } }, { t: 'the second flip is heads', f: function (o) { return o[1] === 1; } }, { t: 'the third flip is heads', f: function (o) { return o[2] === 1; } },
      { t: 'the first two flips match', f: function (o) { return o[0] === o[1]; } }, { t: 'the last two flips match', f: function (o) { return o[1] === o[2]; } }, { t: 'the first and third flips match', f: function (o) { return o[0] === o[2]; } },
      { t: 'the number of heads is even', f: function (o) { return (o[0] + o[1] + o[2]) % 2 === 0; } }, { t: 'at least two flips are heads', f: function (o) { return o[0] + o[1] + o[2] >= 2; } }, { t: 'the first flip is tails', f: function (o) { return o[0] === 0; } }
    ];
    var TRIPS = [[0, 1, 2], [0, 1, 3], [3, 4, 5], [0, 1, 6], [0, 1, 7], [0, 4, 6], [3, 4, 6], [1, 2, 4], [0, 2, 5], [0, 8, 1], [0, 4, 2], [3, 5, 6]];
    var tr = R.pick(TRIPS), ev = tr.map(function (k2) { return LIB[k2]; });
    function P_(fs) { return q(outs.filter(function (o) { return fs.every(function (f2) { return f2(o); }); }).length, 8); }
    var pairs = [[0, 1], [0, 2], [1, 2]], pairOk = pairs.every(function (pq) { return P_([ev[pq[0]].f, ev[pq[1]].f]).eq(P_([ev[pq[0]].f]).mul(P_([ev[pq[1]].f]))); });
    var tripOk = P_([ev[0].f, ev[1].f, ev[2].f]).eq(P_([ev[0].f]).mul(P_([ev[1].f])).mul(P_([ev[2].f])));
    var verdicts = ['A, B and C are independent (every pair and the triple multiply)', 'A, B and C are independent in pairs, but not all three together', 'A, B and C are not even independent in pairs'];
    var vi = pairOk && tripOk ? 0 : pairOk ? 1 : 2;
    var pairTxt = pairs.map(function (pq) { var L = 'ABC'; var j2 = P_([ev[pq[0]].f, ev[pq[1]].f]), pr2 = P_([ev[pq[0]].f]).mul(P_([ev[pq[1]].f])); return '$P(' + L[pq[0]] + ' \\cap ' + L[pq[1]] + ') = ' + qt(j2) + (j2.eq(pr2) ? ' = ' : ' \\ne ') + qt(P_([ev[pq[0]].f])) + ' \\cdot ' + qt(P_([ev[pq[1]].f])) + '$'; });
    var j3 = P_([ev[0].f, ev[1].f, ev[2].f]), pr3 = P_([ev[0].f]).mul(P_([ev[1].f])).mul(P_([ev[2].f]));
    return chk({
      q: 'Flip a fair coin three times (8 equally likely outcomes). Let A = "' + ev[0].t + '", B = "' + ev[1].t + '", C = "' + ev[2].t + '". Which is true?',
      a: mcKeep(verdicts, vi),
      steps: ['List the outcomes in each event and count (each outcome has probability $\\frac{1}{8}$): $P(A) = ' + qt(P_([ev[0].f])) + '$, $P(B) = ' + qt(P_([ev[1].f])) + '$, $P(C) = ' + qt(P_([ev[2].f])) + '$.', 'Pairs: ' + pairTxt.join('; ') + '.', 'Triple: $P(A \\cap B \\cap C) = ' + qt(j3) + '$ and $P(A)P(B)P(C) = ' + qt(pr3) + '$' + (j3.eq(pr3) ? ', equal.' : ', not equal.'), 'So: ' + verdicts[vi] + '.'],
      hint: 'Check all three pairs, then the triple: independence of three events needs all four equations.'
    }, { kind: 'flips', trip: tr });
  });


  // ================================================================ Unit 3: Discrete Random Variables
  function composition(R, k, D, minPart) { // k positive integers adding to D, each at least minPart
    var w; do { w = []; var left = D; for (var i = 0; i < k - 1; i++) { var hi = left - minPart * (k - 1 - i); var v = R.int(minPart, M.max(minPart, M.min(hi, M.ceil(2.2 * D / k)))); w.push(v); left -= v; } w.push(left); } while (w[k - 1] < minPart);
    return R.shuffle(w);
  }
  function randPmf(R, opts) { // { xs, ps (Q), D }
    opts = opts || {}; var k = opts.k || R.int(4, 5), D = opts.D || R.pick([8, 10, 12, 16, 20]), start = opts.start !== undefined ? opts.start : R.pick([0, 1]);
    var xs = opts.xs || Array.from({ length: k }, function (_, i) { return start + i; }), w = composition(R, xs.length, D, 1);
    return { xs: xs, ps: w.map(function (v) { return q(v, D); }), w: w, D: D };
  }
  function Fat(pm, c) { return sumQ(pm.xs.map(function (x, i) { return x <= c ? pm.ps[i] : Q(0); })); }
  function meanQ(xs, ps) { return sumQ(xs.map(function (x, i) { return Q.from(x).mul(ps[i]); })); }
  function cdfTable(pm) { return table(null, [['$x$'].concat(pm.xs.map(function (x) { return '$' + x + '$'; })), ['$F(x) = P(X \\le x)$'].concat(pm.xs.map(function (x) { return '$' + qt(Fat(pm, x)) + '$'; }))]); }

  G('prob.pmf-cdf', function (R, ctx) {
    var shape = by(ctx, R.pick(['missing', 'cdfat']), R.pick(['interval', 'cdf2pmf']), R.pick(['fromcdf', 'fromcdf', 'interval']));
    var pm = randPmf(R), xs = pm.xs, n = xs.length;
    if (shape === 'missing') {
      var mi = R.int(0, n - 1), shown = pm.ps.map(function (p, i) { return i === mi ? '?' : qt(p); });
      return chk({ q: 'A random variable $X$ has this pmf. Find the missing value $P(X = ' + xs[mi] + ')$.' + pmfTable(xs, shown), a: ex(pm.ps[mi]),
        steps: ['A pmf adds to 1 over all the values of $X$.', '$P(X = ' + xs[mi] + ') = 1 - (' + pm.ps.filter(function (_, i) { return i !== mi; }).map(qt).join(' + ') + ') = ' + qt(pm.ps[mi]) + '$.'],
        hint: 'The probabilities in a pmf add to 1.' }, { kind: 'missing', xs: xs, ps: pm.ps.map(qp), i: mi });
    }
    if (shape === 'cdfat') {
      var c = R.coin() ? xs[R.int(0, n - 2)] : xs[R.int(0, n - 2)] + 0.5, Fc = Fat(pm, c);
      return chk({ q: 'A random variable $X$ has this pmf. Find $F(' + num(c) + ') = P(X \\le ' + num(c) + ')$.' + pmfTable(xs, pm.ps), a: ex(Fc),
        steps: ['$F(' + num(c) + ')$ adds the probabilities of every value of $X$ that is at most ' + num(c) + ': ' + xs.filter(function (x) { return x <= c; }).join(', ') + '.' + (c % 1 ? ' (There is no value at ' + num(c) + ' itself, so $F(' + num(c) + ') = F(' + M.floor(c) + ')$: the CDF is flat between values.)' : ''), '$F(' + num(c) + ') = ' + pm.ps.filter(function (_, i) { return xs[i] <= c; }).map(qt).join(' + ') + ' = ' + qt(Fc) + '$.'],
        hint: 'Add P(X = x) for every x up to and including the given number.' }, { kind: 'cdfat', xs: xs, ps: pm.ps.map(qp), c: c });
    }
    var TYPES = [['(]', 'a < X \\le b'], ['[]', 'a \\le X \\le b'], ['[)', 'a \\le X < b'], ['()', 'a < X < b']];
    var ty = R.pick(TYPES), ia = R.int(0, n - 3), ib = R.int(ia + 2, n - 1); if (ia === 0 && ib === n - 1) { if (R.coin()) ia = 1; else ib = n - 2; } var a = xs[ia], b = xs[ib];
    function inc(x) { var A = ty[0][0] === '[' ? x >= a : x > a, B = ty[0][1] === ']' ? x <= b : x < b; return A && B; }
    var pv = sumQ(xs.map(function (x, i) { return inc(x) ? pm.ps[i] : Q(0); })), expr = ty[1].replace('a', a).replace('b', b), incl = xs.filter(inc);
    if (shape === 'interval') return chk({ q: 'A random variable $X$ has this pmf. Find $P(' + expr + ')$.' + pmfTable(xs, pm.ps), a: ex(pv),
      steps: ['Which values count? ' + (incl.length ? incl.join(', ') : 'none') + ' (check each endpoint: ' + (ty[0][0] === '[' ? a + ' is included' : a + ' is not included') + ', ' + (ty[0][1] === ']' ? b + ' is included' : b + ' is not included') + ').', 'Add their probabilities: $' + xs.map(function (x, i) { return inc(x) ? qt(pm.ps[i]) : null; }).filter(Boolean).join(' + ') + ' = ' + qt(pv) + '$.'],
      hint: 'With a discrete X, < and ≤ give different answers: decide whether each endpoint counts.' }, { kind: 'interval', xs: xs, ps: pm.ps.map(qp), a: a, b: b, ty: ty[0] });
    if (shape === 'cdf2pmf') {
      var j = R.int(1, n - 1), pj = pm.ps[j];
      return chk({ q: 'The CDF of a discrete random variable $X$ is given at its values. Find $P(X = ' + xs[j] + ')$.' + cdfTable(pm), a: ex(pj),
        steps: ['The CDF jumps at each value of $X$, and the size of the jump is the probability there.', '$P(X = ' + xs[j] + ') = F(' + xs[j] + ') - F(' + xs[j - 1] + ') = ' + qt(Fat(pm, xs[j])) + ' - ' + qt(Fat(pm, xs[j - 1])) + ' = ' + qt(pj) + '$.'],
        hint: 'A jump of the CDF is a probability.' }, { kind: 'cdf2pmf', xs: xs, ps: pm.ps.map(qp), j: j });
    }
    // fromcdf: only the CDF is given
    var form = R.pick(['[]', '[]', '>=', '()']), lo = xs[ia], hi = xs[ib], v, ex2, st;
    if (form === '>=') { v = Q(1).sub(Fat(pm, lo - 1)); ex2 = 'P(X \\ge ' + lo + ')'; st = ['$X \\ge ' + lo + '$ is the complement of $X \\le ' + (lo - 1) + '$ (the values are whole numbers).', '$P(X \\ge ' + lo + ') = 1 - F(' + (lo - 1) + ') = 1 - ' + qt(Fat(pm, lo - 1)) + ' = ' + qt(v) + '$.']; }
    else if (form === '[]') { v = Fat(pm, hi).sub(Fat(pm, lo - 1)); ex2 = 'P(' + lo + ' \\le X \\le ' + hi + ')'; st = ['$F(' + hi + ') - F(' + lo + ')$ would give $P(' + lo + ' < X \\le ' + hi + ')$, which leaves out $X = ' + lo + '$.', 'Subtract $F(' + (lo - 1) + ')$ instead, so that ' + lo + ' stays in: $P(' + lo + ' \\le X \\le ' + hi + ') = F(' + hi + ') - F(' + (lo - 1) + ')$.', '$= ' + qt(Fat(pm, hi)) + ' - ' + qt(Fat(pm, lo - 1)) + ' = ' + qt(v) + '$.']; }
    else { v = Fat(pm, hi - 1).sub(Fat(pm, lo)); ex2 = 'P(' + lo + ' < X < ' + hi + ')'; st = ['$' + lo + ' < X < ' + hi + '$ keeps only the values strictly between: ' + (hi - lo === 2 ? 'just ' + (lo + 1) : 'from ' + (lo + 1) + ' to ' + (hi - 1)) + '.', '$P = F(' + (hi - 1) + ') - F(' + lo + ') = ' + qt(Fat(pm, hi - 1)) + ' - ' + qt(Fat(pm, lo)) + ' = ' + qt(v) + '$.']; }
    return chk(nl({ q: 'A random variable $X$ takes whole-number values, and its CDF is given at its values. Find $' + ex2 + '$.' + cdfTable(pm), a: ex(v), steps: st, hint: 'Write the event as "X ≤ something" minus "X ≤ something else", minding the endpoints.' }), { kind: 'fromcdf', xs: xs, ps: pm.ps.map(qp), lo: lo, hi: hi, form: form });
  });

  function smallPmf(R, k) { // values around 0 with small denominators
    var xs = R.sample([-2, -1, 0, 1, 2, 3, 4], k || 4).sort(function (a, b) { return a - b; }), pm = randPmf(R, { xs: xs, D: R.pick([8, 10, 12]) });
    return pm;
  }
  G('prob.expectation-of-function', function (R, ctx) {
    var shape = by(ctx, 'sq', 'g', 'compare');
    if (shape === 'sq' || shape === 'g') {
      var pm = smallPmf(R, R.int(3, 4)), xs = pm.xs, c = R.int(1, 3);
      var G1 = shape === 'sq' ? { t: 'X^{2}', f: function (x) { return Q(x * x); }, s: function (x) { return par(x) + '^{2}'; } } : R.pick([
        { t: '(X - ' + c + ')^{2}', f: function (x) { return Q((x - c) * (x - c)); }, s: function (x) { return '(' + x + ' - ' + c + ')^{2}'; } },
        { t: '\\lvert X - ' + c + '\\rvert', f: function (x) { return Q(M.abs(x - c)); }, s: function (x) { return '\\lvert ' + x + ' - ' + c + '\\rvert'; } },
        { t: 'X(X - 1)', f: function (x) { return Q(x * (x - 1)); }, s: function (x) { return T.p(x) + '(' + x + ' - 1)'; } },
        { t: '2^{X}', f: function (x) { return Q(2).pow(x); }, s: function (x) { return '2^{' + x + '}'; } }
      ]);
      var Eg = sumQ(xs.map(function (x, i) { return G1.f(x).mul(pm.ps[i]); }));
      return chk(nl({ q: 'A random variable $X$ has this pmf. Find $E[' + G1.t + ']$.' + pmfTable(xs, pm.ps), a: ex(Eg),
        steps: ['$E[g(X)] = \\sum g(x)\\,P(X = x)$: apply $g$ to each value and weight by its probability. No new distribution is needed.', 'Values of $g$: ' + xs.map(function (x) { return '$' + G1.s(x) + ' = ' + qt(G1.f(x)) + '$'; }).join(', ') + '.', '$E[' + G1.t + '] = ' + xs.map(function (x, i) { return T.p(qt(G1.f(x))) + ' \\cdot ' + qt(pm.ps[i]); }).join(' + ') + ' = ' + qt(Eg) + '$.'],
        hint: 'Apply the function to each value first, then average with the probabilities.' }), { kind: shape, xs: xs, ps: pm.ps.map(qp), g: G1.t });
    }
    var which = R.pick(['sq', 'recip', 'shift']), pm2 = which === 'recip' ? randPmf(R, { xs: R.sample([1, 2, 3, 4, 5, 6], 3).sort(function (a, b) { return a - b; }), D: R.pick([6, 8, 10, 12]) }) : smallPmf(R, 3), xs2 = pm2.xs, mu = meanQ(xs2, pm2.ps), c2 = R.int(0, 2);
    var g2 = which === 'sq' ? { t: 'X^{2}', f: function (x) { return Q.from(x).pow(2); }, gm: mu.pow(2), gt: '(E[X])^{2}' } : which === 'recip' ? { t: '\\frac{1}{X}', f: function (x) { return Q.from(x).inv(); }, gm: mu.inv(), gt: '\\frac{1}{E[X]}' } : { t: '(X - ' + c2 + ')^{2}', f: function (x) { return Q.from(x).sub(c2).pow(2); }, gm: mu.sub(c2).pow(2), gt: '(E[X] - ' + c2 + ')^{2}' };
    var Eg2 = sumQ(xs2.map(function (x, i) { return g2.f(x).mul(pm2.ps[i]); }));
    return chk(nl({ q: 'A random variable $X$ has this pmf. Find (a) $E[' + g2.t + ']$ and (b) $' + g2.gt + '$.' + pmfTable(xs2, pm2.ps),
      a: { t: 'multi', parts: [{ label: '(a)', a: ex(Eg2) }, { label: '(b)', a: ex(g2.gm) }] },
      steps: ['(a) Average the function values: $E[' + g2.t + '] = ' + xs2.map(function (x, i) { return T.p(qt(g2.f(x))) + ' \\cdot ' + qt(pm2.ps[i]); }).join(' + ') + ' = ' + qt(Eg2) + '$.', '(b) First $E[X] = ' + xs2.map(function (x, i) { return T.p(x) + ' \\cdot ' + qt(pm2.ps[i]); }).join(' + ') + ' = ' + qt(mu) + '$, then apply the function: $' + qt(g2.gm) + '$.', 'They differ: in general $E[g(X)] \\ne g(E[X])$. Only for straight-line functions $g(x) = ax + b$ are they equal.'],
      hint: 'For (a), apply the function before averaging; for (b), average first.' }), { kind: 'compare', xs: xs2, ps: pm2.ps.map(qp), g: which, c: c2 });
  });

  G('prob.variance-rules', function (R, ctx) {
    var shape = by(ctx, 'pmf', 'linear', R.pick(['moment', 'shift', 'temp']));
    if (shape === 'pmf') {
      var pm = smallPmf(R, R.int(3, 4)), xs = pm.xs, mu = meanQ(xs, pm.ps), m2 = sumQ(xs.map(function (x, i) { return Q(x * x).mul(pm.ps[i]); })), v = m2.sub(mu.pow(2));
      return chk(nl({ q: 'A random variable $X$ has this pmf. Find $\\operatorname{Var}(X)$.' + pmfTable(xs, pm.ps), a: ex(v),
        steps: ['$E[X] = ' + xs.map(function (x, i) { return T.p(x) + ' \\cdot ' + qt(pm.ps[i]); }).join(' + ') + ' = ' + qt(mu) + '$.', '$E[X^{2}] = ' + xs.map(function (x, i) { return par(x) + '^{2} \\cdot ' + qt(pm.ps[i]); }).join(' + ') + ' = ' + qt(m2) + '$.', 'Shortcut: $\\operatorname{Var}(X) = E[X^{2}] - (E[X])^{2} = ' + qt(m2) + ' - ' + par(qt(mu)) + '^{2} = ' + qt(v) + '$.'],
        hint: 'Find E[X] and E[X²], then subtract the square of the mean.' }), { kind: 'pmf', xs: xs, ps: pm.ps.map(qp) });
    }
    if (shape === 'linear') {
      var mu2 = R.int(-3, 8), sd = R.int(2, 6), a = R.pick([-3, -2, 2, 3, 4, -4, 5]), b = R.intNot(-9, 9, 0), askSD = R.coin();
      var vY = a * a * sd * sd;
      return chk({ q: '$X$ has mean $' + mu2 + '$ and standard deviation $' + sd + '$. Let $Y = ' + T.lin(a, 'X', b) + '$. Find ' + (askSD ? 'the standard deviation of $Y$' : '$\\operatorname{Var}(Y)$') + '.',
        a: ex(askSD ? M.abs(a) * sd : vY),
        steps: ['Adding ' + T.num(b) + ' shifts every value by the same amount: the spread does not change.', 'Multiplying by ' + a + ' multiplies every distance from the mean by ' + a + ', so squared distances get $' + par(a) + '^{2} = ' + a * a + '$ times bigger: $\\operatorname{Var}(aX + b) = a^{2}\\operatorname{Var}(X)$.', '$\\operatorname{Var}(Y) = ' + a * a + ' \\cdot ' + sd * sd + ' = ' + vY + '$' + (askSD ? ', so $\\operatorname{SD}(Y) = \\sqrt{' + vY + '} = ' + M.abs(a) * sd + '$ (that is $\\lvert a \\rvert \\cdot ' + sd + '$).' : '.')],
        hint: 'Shifts do not change spread; scaling by a multiplies the variance by a².' }, { kind: 'linear', sd: sd, a: a, b: b, askSD: askSD });
    }
    if (shape === 'moment' || shape === 'shift') {
      var mu3 = R.int(-4, 9), v3 = R.int(2, 20), c = R.intNot(1, 6, mu3);
      if (shape === 'moment') return chk({ q: '$X$ has mean $' + mu3 + '$ and variance $' + v3 + '$. Find $E[X^{2}]$.', a: ex(v3 + mu3 * mu3),
        steps: ['Rearrange the shortcut $\\operatorname{Var}(X) = E[X^{2}] - (E[X])^{2}$.', '$E[X^{2}] = \\operatorname{Var}(X) + (E[X])^{2} = ' + v3 + ' + ' + par(mu3) + '^{2} = ' + (v3 + mu3 * mu3) + '$.'],
        hint: 'Solve the variance shortcut for E[X²].' }, { kind: 'moment', mu: mu3, v: v3 });
      return chk({ q: '$X$ has mean $' + mu3 + '$ and variance $' + v3 + '$. Find $E[(X - ' + c + ')^{2}]$.', a: ex(v3 + (mu3 - c) * (mu3 - c)),
        steps: ['Write $X - ' + c + ' = (X - \\mu) + (\\mu - ' + c + ')$ with $\\mu = ' + mu3 + '$, and expand the square.', 'The cross term has $E[X - \\mu] = 0$, so $E[(X - ' + c + ')^{2}] = \\operatorname{Var}(X) + (\\mu - ' + c + ')^{2}$.', '$= ' + v3 + ' + ' + par(mu3 - c) + '^{2} = ' + (v3 + (mu3 - c) * (mu3 - c)) + '$.'],
        hint: 'E[(X − c)²] = Var(X) + (μ − c)².' }, { kind: 'shift', mu: mu3, v: v3, c: c });
    }
    var sdC = R.pick([2, 3, 4, 5, 10]), muC = R.int(5, 30), askV = R.coin(), sdF = q(9 * sdC, 5);
    return chk({ q: 'Daily high temperatures in a city have mean $' + muC + '^\\circ\\text{C}$ and standard deviation $' + sdC + '^\\circ\\text{C}$. In Fahrenheit, $F = \\frac{9}{5}C + 32$. Find ' + (askV ? 'the variance of the Fahrenheit temperatures' : 'the standard deviation of the Fahrenheit temperatures') + '.',
      a: ex(askV ? sdF.pow(2) : sdF),
      steps: ['The $+32$ shifts every temperature equally, so it does not change the spread.', '$\\operatorname{SD}(F) = \\frac{9}{5}\\operatorname{SD}(C) = \\frac{9}{5} \\cdot ' + sdC + ' = ' + qt(sdF) + '$.' + (askV ? ' The variance is its square: $' + par(qt(sdF)) + '^{2} = ' + qt(sdF.pow(2)) + '$.' : '')],
      hint: 'Only the factor 9/5 affects the spread.' }, { kind: 'temp', sd: sdC, askV: askV });
  });

  G('prob.linearity-indicators', function (R, ctx) {
    var shape = by(ctx, R.pick(['faces', 'cards']), R.pick(['fixed', 'pairs', 'distinct', 'runs']), R.pick(['empty', 'adjacent', 'pairs', 'distinct']));
    var v, qq, st, data;
    if (shape === 'faces') {
      var n = R.pick([12, 18, 24, 30, 36, 60, 10, 20]), f = R.pick([['a six', q(1, 6)], ['a 5 or a 6', q(1, 3)], ['an even number', q(1, 2)], ['a number less than 3', q(1, 3)]]);
      v = f[1].mul(n); qq = 'Roll a fair die ' + n + ' times. What is the expected number of rolls that show ' + f[0] + '?';
      st = ['Let $I_k = 1$ if roll $k$ shows ' + f[0] + ', and 0 otherwise. Then the count is $X = I_1 + \\cdots + I_{' + n + '}$.', 'Each $E[I_k] = P(\\text{roll } k \\text{ shows ' + f[0] + '}) = ' + qt(f[1]) + '$.', 'By linearity, $E[X] = ' + n + ' \\cdot ' + qt(f[1]) + ' = ' + qt(v) + '$.']; data = { kind: 'faces', n: n, p: qp(f[1]) };
    } else if (shape === 'cards') {
      var k = R.int(3, 13), c = R.pick([['hearts', 13], ['aces', 4], ['face cards (J, Q, K)', 12], ['red cards', 26]]);
      v = q(k * c[1], 52); qq = 'Deal ' + k + ' cards from a well-shuffled 52-card deck (without replacement). What is the expected number of ' + c[0] + ' among them?';
      st = ['Let $I_j = 1$ if card $j$ of the deal is one of the ' + c[0] + '. The draws are dependent, but linearity does not care.', 'Each single card is equally likely to be any of the 52, so $E[I_j] = \\frac{' + c[1] + '}{52}$.', '$E[X] = ' + k + ' \\cdot \\frac{' + c[1] + '}{52} = ' + qt(v) + '$.']; data = { kind: 'cards', k: k, c: c[1] };
    } else if (shape === 'fixed') {
      var n2 = R.int(5, 40), wh = R.pick([['letters', 'envelopes', 'goes into its own envelope', 'letters that end up in the right envelope'], ['guests', 'coats', 'gets their own coat back', 'guests who get their own coat back'], ['students', 'graded quizzes', 'gets their own quiz back', 'students who get their own quiz back']]), not = R.coin();
      v = Q(not ? n2 - 1 : 1);
      qq = n2 + ' ' + wh[0] + ' are matched at random with ' + n2 + ' ' + wh[1] + ' (every matching equally likely). What is the expected number of ' + (not ? wh[3].replace('who get', 'who do not get').replace('that end up in the right', 'that end up in a wrong') : wh[3]) + '?';
      st = ['Let $I_k = 1$ if number $k$ ' + wh[2] + '. In a random matching, that has probability $\\frac{1}{' + n2 + '}$.', 'The $I_k$ are dependent (if all but one match, the last must too), but linearity needs no independence.', 'Expected matches: $' + n2 + ' \\cdot \\frac{1}{' + n2 + '} = 1$' + (not ? ', so the expected number of mismatches is $' + n2 + ' - 1 = ' + (n2 - 1) + '$.' : ', whatever the number of ' + wh[0] + '.')]; data = { kind: 'fixed', n: n2, not: not };
    } else if (shape === 'pairs') {
      var n3 = R.int(6, 30), d = R.pick([7, 12, 30, 365]), np = n3 * (n3 - 1) / 2;
      v = q(np, d); qq = 'Each of ' + n3 + ' people has a birth ' + (d === 7 ? 'weekday' : d === 12 ? 'month' : d === 30 ? 'day of the month (assume 30 equally likely days)' : 'day (365 equally likely days)') + ', independently and uniformly at random. What is the expected number of pairs of people who share it?';
      st = ['Use one indicator per pair of people: there are $\\binom{' + n3 + '}{2} = ' + np + '$ pairs.', 'A given pair matches with probability $\\frac{1}{' + d + '}$.', 'Expected matching pairs: $' + np + ' \\cdot \\frac{1}{' + d + '} = ' + qt(v) + (v.isInt() ? '' : ' \\approx ' + dec(v, 2)) + '$.']; data = { kind: 'pairs', n: n3, d: d };
    } else if (shape === 'distinct') {
      var k2 = R.int(2, 6), sides = R.pick([4, 6, 6, 8]); v = Q(sides).mul(Q(1).sub(q(sides - 1, sides).pow(k2)));
      qq = 'Roll a fair ' + sides + '-sided die ' + k2 + ' times. What is the expected number of different faces that appear?';
      st = ['Let $I_f = 1$ if face $f$ appears at least once, for each of the ' + sides + ' faces. The number of different faces is $\\sum I_f$.', 'Face $f$ never appears with probability $\\left(\\frac{' + (sides - 1) + '}{' + sides + '}\\right)^{' + k2 + '}$, so $E[I_f] = 1 - \\left(\\frac{' + (sides - 1) + '}{' + sides + '}\\right)^{' + k2 + '}$.', 'Expected count: $' + sides + '\\left(1 - \\left(\\frac{' + (sides - 1) + '}{' + sides + '}\\right)^{' + k2 + '}\\right) = ' + qt(v) + '$.']; data = { kind: 'distinct', k: k2, s: sides };
    } else if (shape === 'runs') {
      var n4 = R.int(5, 30), what = R.coin();
      v = what ? q(n4 - 1, 4) : q(n4 + 1, 2);
      qq = 'Flip a fair coin ' + n4 + ' times. What is the expected number of ' + (what ? 'places where two heads appear in a row (HHH counts as 2)' : 'runs (maximal blocks of the same face; HHTHH has 3 runs)') + '?';
      st = what ? ['There are ' + (n4 - 1) + ' places for a pair of neighbors: flips 1–2, 2–3, …, ' + (n4 - 1) + '–' + n4 + '.', 'Each pair is HH with probability $\\frac{1}{4}$ (neighboring pairs overlap and are dependent; linearity does not care).', 'Expected count: $' + (n4 - 1) + ' \\cdot \\frac{1}{4} = ' + qt(v) + '$.'] : ['The number of runs is 1 plus the number of switches between neighbors.', 'Each of the ' + (n4 - 1) + ' neighboring pairs is a switch (HT or TH) with probability $\\frac{1}{2}$.', 'Expected runs: $1 + ' + (n4 - 1) + ' \\cdot \\frac{1}{2} = ' + qt(v) + '$.']; data = { kind: 'runs', n: n4, hh: what };
    } else if (shape === 'empty') {
      var balls = R.int(3, 8), boxes = R.int(3, 6); v = Q(boxes).mul(q(boxes - 1, boxes).pow(balls));
      qq = balls + ' balls are tossed independently into ' + boxes + ' boxes, each ball equally likely to land in any box. What is the expected number of empty boxes?';
      st = ['Let $I_j = 1$ if box $j$ ends up empty.', 'Every ball misses box $j$ with probability $\\frac{' + (boxes - 1) + '}{' + boxes + '}$, so $E[I_j] = \\left(\\frac{' + (boxes - 1) + '}{' + boxes + '}\\right)^{' + balls + '}$.', 'Expected empty boxes: $' + boxes + '\\left(\\frac{' + (boxes - 1) + '}{' + boxes + '}\\right)^{' + balls + '} = ' + qt(v) + '$.']; data = { kind: 'empty', balls: balls, boxes: boxes };
    } else {
      var bb = R.int(2, 6), gg = R.int(2, 6), nn = bb + gg; v = q(2 * bb * gg, nn);
      qq = bb + ' boys and ' + gg + ' girls line up in a random order (all orders equally likely). What is the expected number of neighboring pairs made of one boy and one girl?';
      st = ['There are ' + (nn - 1) + ' neighboring spots: positions 1–2, 2–3, and so on. Use an indicator for each.', 'A given neighboring pair is boy–girl or girl–boy with probability $\\frac{' + bb + '}{' + nn + '} \\cdot \\frac{' + gg + '}{' + (nn - 1) + '} + \\frac{' + gg + '}{' + nn + '} \\cdot \\frac{' + bb + '}{' + (nn - 1) + '} = ' + qt(q(2 * bb * gg, nn * (nn - 1))) + '$.', 'Expected count: $' + (nn - 1) + ' \\cdot ' + qt(q(2 * bb * gg, nn * (nn - 1))) + ' = ' + qt(v) + '$.']; data = { kind: 'adjacent', b: bb, g: gg };
    }
    return chk({ q: qq, a: ex(v), steps: st, hint: 'Write the count as a sum of 0–1 indicators and add their probabilities.' }, data);
  });

  var HYP = [
    function (R) { var N = R.int(10, 20), K = R.int(2, 5), n = R.int(3, 5); return { N: N, K: K, n: n, s: 'A box holds ' + N + ' light bulbs, and ' + K + ' of them are defective. You test ' + n + ' bulbs chosen at random (without replacement).', X: 'defective bulbs among the ' + n }; },
    function (R) { var w = R.int(4, 8), m = R.int(4, 8), n = R.int(3, 5); return { N: w + m, K: w, n: n, s: 'A committee of ' + n + ' is chosen at random from ' + w + ' women and ' + m + ' men.', X: 'women on the committee' }; },
    function (R) { var N = R.int(15, 25), K = R.int(4, 8), n = R.int(4, 6); return { N: N, K: K, n: n, s: 'A pond holds ' + N + ' fish, and ' + K + ' of them are tagged. You catch ' + n + ' different fish at random.', X: 'tagged fish in your catch' }; },
    function (R) { var n = R.int(4, 5); return { N: 52, K: 13, n: n, s: 'You are dealt ' + n + ' cards from a well-shuffled 52-card deck.', X: 'hearts in your hand' }; }
  ];
  function hyp(N, K, n, k) { return Cq(K, k).mul(Cq(N - K, n - k)).div(Cq(N, n)); }
  G('prob.hypergeometric', function (R, ctx) {
    var shape = by(ctx, 'exact', R.pick(['atleast1', 'atmost1', 'mean']), 'compare');
    var H = R.pick(HYP)(R), N = H.N, K = H.K, n = H.n, k = R.int(1, M.min(K, n) - (M.min(K, n) > 1 ? 1 : 0));
    var setup = H.s + ' Let $X$ be the number of ' + H.X + '. ';
    var formula = '$P(X = k) = \\dfrac{\\binom{' + K + '}{k}\\binom{' + (N - K) + '}{' + n + ' - k}}{\\binom{' + N + '}{' + n + '}}$';
    if (shape === 'exact') { var v = hyp(N, K, n, k);
      return chk({ q: setup + 'Find $P(X = ' + k + ')$.' + exdNote(v).replace('a decimal to 3 places', 'a decimal to 3 places'), a: exd(v),
        steps: ['Every set of ' + n + ' from the ' + N + ' is equally likely: $\\binom{' + N + '}{' + n + '} = ' + Cq(N, n).toPlain() + '$ sets.', 'Favorable: choose ' + k + ' of the ' + K + ' and ' + (n - k) + ' of the other ' + (N - K) + ': $\\binom{' + K + '}{' + k + '}\\binom{' + (N - K) + '}{' + (n - k) + '} = ' + Cq(K, k).toPlain() + ' \\cdot ' + Cq(N - K, n - k).toPlain() + '$.', '$P(X = ' + k + ') = \\dfrac{' + Cq(K, k).mul(Cq(N - K, n - k)).toPlain() + '}{' + Cq(N, n).toPlain() + '} = ' + qt(v) + (v.isTerminating() ? '' : ' \\approx ' + dec(v, 4)) + '$.'],
        hint: 'Count the ways to choose the right number from each group, over all ways to choose.' }, { kind: 'exact', N: N, K: K, n: n, k: k }); }
    if (shape === 'mean') { var mean = q(n * K, N);
      return chk({ q: setup + 'Find $E[X]$.', a: ex(mean),
        steps: ['Write $X$ as a sum of indicators, one per draw: draw $j$ is one of the ' + K + ' with probability $\\frac{' + K + '}{' + N + '}$ (by symmetry, even without replacement).', 'Linearity: $E[X] = ' + n + ' \\cdot \\frac{' + K + '}{' + N + '} = ' + qt(mean) + '$, the same mean as the binomial with $p = \\frac{' + K + '}{' + N + '}$.'],
        hint: 'E[X] = n · K/N.' }, { kind: 'mean', N: N, K: K, n: n }); }
    if (shape === 'atleast1' || shape === 'atmost1') {
      var p0 = hyp(N, K, n, 0), p1 = hyp(N, K, n, 1), v2 = shape === 'atleast1' ? Q(1).sub(p0) : p0.add(p1);
      return chk({ q: setup + 'Find $P(X ' + (shape === 'atleast1' ? '\\ge 1' : '\\le 1') + ')$.' + exdNote(v2), a: exd(v2),
        steps: ['Hypergeometric: ' + formula + '.', '$P(X = 0) = \\dfrac{\\binom{' + (N - K) + '}{' + n + '}}{\\binom{' + N + '}{' + n + '}} = ' + qt(p0) + '$.'].concat(shape === 'atleast1' ? ['$P(X \\ge 1) = 1 - ' + qt(p0) + ' = ' + qt(v2) + (v2.isTerminating() ? '' : ' \\approx ' + dec(v2, 4)) + '$.'] : ['$P(X = 1) = \\dfrac{' + K + ' \\cdot \\binom{' + (N - K) + '}{' + (n - 1) + '}}{\\binom{' + N + '}{' + n + '}} = ' + qt(p1) + '$.', '$P(X \\le 1) = ' + qt(p0) + ' + ' + qt(p1) + ' = ' + qt(v2) + (v2.isTerminating() ? '' : ' \\approx ' + dec(v2, 4)) + '$.']),
        hint: shape === 'atleast1' ? 'Use the complement: none of them.' : 'Add P(X = 0) and P(X = 1).' }, { kind: shape, N: N, K: K, n: n }); }
    var hv = hyp(N, K, n, k), bv = Cq(n, k).mul(q(K, N).pow(k)).mul(q(N - K, N).pow(n - k));
    return chk({ q: setup + 'Find $P(X = ' + k + ')$ (a) exactly, drawing without replacement as described, and (b) if instead each draw were put back before the next (with replacement). Give fractions or decimals to 3 places.',
      a: { t: 'multi', parts: [{ label: '(a)', a: { t: 'num', v: hv.toPlain(), tol: 0.0005 } }, { label: '(b)', a: { t: 'num', v: bv.toPlain(), tol: 0.0005 } }] },
      steps: ['(a) Without replacement: hypergeometric, $\\dfrac{\\binom{' + K + '}{' + k + '}\\binom{' + (N - K) + '}{' + (n - k) + '}}{\\binom{' + N + '}{' + n + '}} = ' + qt(hv) + ' \\approx ' + dec(hv, 4) + '$.', '(b) With replacement the draws are independent with $p = \\frac{' + K + '}{' + N + '}$: binomial, $\\binom{' + n + '}{' + k + '}\\left(\\frac{' + K + '}{' + N + '}\\right)^{' + k + '}\\left(\\frac{' + (N - K) + '}{' + N + '}\\right)^{' + (n - k) + '} \\approx ' + dec(bv, 4) + '$.', 'Without replacement, each draw changes the mix for the next, so the binomial is only an approximation. It is close when $N$ is large compared with $n$.'],
      hint: 'Without replacement: count subsets. With replacement: independent trials with p = K/N.' }, { kind: 'compare', N: N, K: K, n: n, k: k });
  });

  var PS = [q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(2, 5), q(3, 5), q(1, 5), q(1, 6)];
  G('prob.negative-binomial', function (R, ctx) {
    var shape = by(ctx, 'coin', R.pick(['general', 'moments']), R.pick(['series', 'bybefore', 'general']));
    if (shape === 'coin' || shape === 'general') {
      var p = shape === 'coin' ? q(1, 2) : R.pick(PS.slice(1)), r = R.int(2, 3), k = R.int(r + 1, r + 4), qq2 = Q(1).sub(p), v = Cq(k - 1, r - 1).mul(p.pow(r)).mul(qq2.pow(k - r));
      var ctxT = shape === 'coin' ? 'Flip a fair coin until the ' + U.ordinal(r) + ' head appears.' : R.pick(['A basketball player makes each free throw with probability $' + qt(p) + '$, independently, and shoots until the ' + U.ordinal(r) + ' make.', 'Each call a salesperson makes ends in a sale with probability $' + qt(p) + '$, independently. They keep calling until the ' + U.ordinal(r) + ' sale.']);
      return chk({ q: ctxT + ' What is the probability that exactly ' + k + ' ' + (shape === 'coin' ? 'flips' : /throw/.test(ctxT) ? 'shots' : 'calls') + ' are needed?', a: ex(v),
        steps: ['Trial ' + k + ' must be the ' + U.ordinal(r) + ' success, so the first ' + (k - 1) + ' trials hold exactly ' + (r - 1) + ' success' + (r - 1 === 1 ? '' : 'es') + ', in any order: $\\binom{' + (k - 1) + '}{' + (r - 1) + '} = ' + Cq(k - 1, r - 1).toPlain() + '$ ways.', 'Each such sequence has probability $p^{' + r + '}(1 - p)^{' + (k - r) + '}$ with $p = ' + qt(p) + '$.', '$P(X = ' + k + ') = ' + Cq(k - 1, r - 1).toPlain() + ' \\cdot ' + T.pow(qt(p), r) + ' \\cdot ' + T.pow(qt(qq2), k - r) + ' = ' + qt(v) + '$.'],
        hint: 'The last trial is the final success; arrange the other successes among the earlier trials.' }, { kind: 'pmf', p: qp(p), r: r, k: k });
    }
    if (shape === 'moments') {
      var p2 = R.pick(PS), r2 = R.int(2, 5), mean = Q(r2).div(p2), vr = Q(r2).mul(Q(1).sub(p2)).div(p2.pow(2));
      return chk({ q: (p2.eq(q(1, 6)) ? 'Roll a fair die until the ' + U.ordinal(r2) + ' six, and let $X$ be the number of rolls.' : 'Independent trials each succeed with probability $' + qt(p2) + '$. Let $X$ be the number of trials needed for the ' + U.ordinal(r2) + ' success.') + ' Find $E[X]$ and $\\operatorname{Var}(X)$.',
        a: { t: 'multi', parts: [{ label: '$E[X] =$', a: ex(mean) }, { label: '$\\operatorname{Var}(X) =$', a: ex(vr) }] },
        steps: ['$X$ is a sum of ' + r2 + ' independent geometric waits (trials to the 1st success, then from there to the 2nd, and so on), each with mean $\\frac{1}{p}$ and variance $\\frac{1 - p}{p^{2}}$.', '$E[X] = \\frac{r}{p} = ' + r2 + ' \\div ' + qt(p2) + ' = ' + qt(mean) + '$.', 'Independent pieces: variances add, $\\operatorname{Var}(X) = \\frac{r(1 - p)}{p^{2}} = ' + qt(vr) + '$.'],
        hint: 'Think of X as r geometric waiting times in a row.' }, { kind: 'moments', p: qp(p2), r: r2 });
    }
    if (shape === 'series') {
      var ps = R.pick([q(1, 2), q(2, 3), q(3, 5), q(3, 4), q(2, 5)]), best = R.pick([5, 7]), w = (best + 1) / 2, g = R.int(w, best), qs = Q(1).sub(ps), what = R.pick(['win', 'last']);
      var vW = Cq(g - 1, w - 1).mul(ps.pow(w)).mul(qs.pow(g - w)), vL = vW.add(Cq(g - 1, w - 1).mul(qs.pow(w)).mul(ps.pow(g - w))), v3 = what === 'win' ? vW : vL;
      return chk({ q: 'Two teams play a best-of-' + best + ' series: the first to win ' + w + ' games wins the series. Team A wins each game with probability $' + qt(ps) + '$, independently. What is the probability that ' + (what === 'win' ? 'Team A wins the series in exactly ' + g + ' games' : 'the series lasts exactly ' + g + ' games') + '?', a: ex(v3),
        steps: ['A wins in exactly ' + g + ' games when game ' + g + ' is A\'s ' + U.ordinal(w) + ' win: the first ' + (g - 1) + ' games hold ' + (w - 1) + ' A-wins. Negative binomial: $\\binom{' + (g - 1) + '}{' + (w - 1) + '}p^{' + w + '}(1 - p)^{' + (g - w) + '} = ' + qt(vW) + '$.'].concat(what === 'last' ? ['The series can also end in game ' + g + ' with B winning: swap the roles, $\\binom{' + (g - 1) + '}{' + (w - 1) + '}(1 - p)^{' + w + '}p^{' + (g - w) + '} = ' + qt(vL.sub(vW)) + '$.', 'These are disjoint: $' + qt(vW) + ' + ' + qt(vL.sub(vW)) + ' = ' + qt(vL) + '$.'] : []),
        hint: 'The deciding game must be the winner\'s ' + U.ordinal(w) + ' win.' }, { kind: 'series', p: qp(ps), w: w, g: g, what: what });
    }
    var p4 = R.pick(PS.slice(0, 7)), r4 = R.int(2, 3), m = R.int(r4 + 1, r4 + 3), q4 = Q(1).sub(p4), terms = [];
    for (var kk = r4; kk <= m; kk++) terms.push(Cq(kk - 1, r4 - 1).mul(p4.pow(r4)).mul(q4.pow(kk - r4)));
    var v4 = sumQ(terms);
    return chk({ q: 'Independent trials each succeed with probability $' + qt(p4) + '$. What is the probability that the ' + U.ordinal(r4) + ' success comes on or before trial ' + m + '?', a: ex(v4),
      steps: ['Add the negative binomial probabilities for $k = ' + r4 + '$ to $' + m + '$: $P(X = k) = \\binom{k - 1}{' + (r4 - 1) + '}p^{' + r4 + '}(1 - p)^{k - ' + r4 + '}$.', terms.map(function (t2, i) { return '$P(X = ' + (r4 + i) + ') = ' + qt(t2) + '$'; }).join(', ') + '.', 'Sum: $' + qt(v4) + '$. (Check: this equals the chance of at least ' + r4 + ' successes in the first ' + m + ' trials.)'],
      hint: 'The rth success by trial m means at least r successes in m trials.' }, { kind: 'bybefore', p: qp(p4), r: r4, m: m });
  });

  var LAMS = [1, 2, 3, 4, 0.5, 1.5, 2.5];
  function lamP(L) { L = Q.from(L); return shortDec(L) || '(' + L.toPlain() + ')'; }
  function lamT(L) { L = Q.from(L); return shortDec(L) || qt(L); }
  function poisExpr(k, lam) { var L = Q.from(lam), c = L.pow(k).div(Q(factB(k))); return { plain: (c.eq(1) ? '' : c.toPlain() + '*') + 'e^(-' + lamP(L) + ')', tex: (c.eq(1) ? '' : qt(c)) + 'e^{-' + lamT(L) + '}', val: c.toNumber() * M.exp(-L.toNumber()) }; }
  function pickK(R, lam, hi) { lam = Q.from(lam).toNumber(); var ks = []; for (var k = 0; k <= (hi || 5); k++) if (poisP(k, lam) >= 0.06) ks.push(k); return ks.length ? R.pick(ks) : M.min(hi || 5, M.floor(lam)); }
  G('prob.poisson', function (R, ctx) {
    var shape = by(ctx, 'pmf', R.pick(['window', 'atleast1', 'atmost2']), R.pick(['ratio', 'moment', 'fromzero']));
    if (shape === 'pmf') {
      var lam = R.pick(LAMS), k = pickK(R, lam, 4), E = poisExpr(k, lam), what = R.pick(['calls to a help line in an hour', 'typos on a page', 'meteors seen in ten minutes', 'customers arriving in five minutes']);
      return chk({ q: 'The number of ' + what + ' is Poisson with mean $\\lambda = ' + num(lam) + '$. Find the probability of exactly ' + k + '. (Give the exact value or a decimal to 3 places.)', a: tol(E.plain),
        steps: ['$P(X = k) = e^{-\\lambda}\\dfrac{\\lambda^{k}}{k!}$.', '$P(X = ' + k + ') = e^{-' + num(lam) + '} \\cdot \\dfrac{' + par(num(lam)) + '^{' + k + '}}{' + k + '!} = ' + E.tex + ' \\approx ' + E.val.toFixed(4) + '$.'],
        hint: 'Use e^(−λ) λ^k / k!.' }, { kind: 'pmf', lam: lam, k: k });
    }
    if (shape === 'window' || shape === 'atleast1' || shape === 'atmost2') {
      var rate = R.pick([2, 3, 4, 6, 1.5]), unit = R.pick([['per hour', 'minutes', 60], ['per day', 'hours', 24], ['per minute', 'seconds', 60]]), frac = R.pick([q(1, 2), q(1, 3), q(3, 2), q(2, 3), q(1, 4), Q(2)]);
      var len = frac.mul(unit[2]); if (!len.isInt()) { frac = q(1, 2); len = frac.mul(unit[2]); }
      var m = Q.from(rate).mul(frac); if (m.gt(6)) { frac = q(1, 2); len = frac.mul(unit[2]); m = Q.from(rate).mul(frac); }
      var mNum = m.toNumber(), mT = lamT(m), mP = lamP(m), v, steps2;
      var base = ['A window of ' + len.toPlain() + ' ' + unit[1] + ' is $' + qt(frac) + '$ of the unit, so the mean count there is $' + num(rate) + ' \\cdot ' + qt(frac) + ' = ' + mT + '$ (not $' + num(rate) + '$).'];
      if (shape === 'atmost2' && mNum > 4) { frac = q(1, 2); len = frac.mul(unit[2]); m = Q.from(rate).mul(frac); mNum = m.toNumber(); mT = lamT(m); mP = lamP(m); base = ['A window of ' + len.toPlain() + ' ' + unit[1] + ' is $' + qt(frac) + '$ of the unit, so the mean count there is $' + num(rate) + ' \\cdot ' + qt(frac) + ' = ' + mT + '$ (not $' + num(rate) + '$).']; }
      var askK = pickK(R, mNum, 4);
      if (shape === 'window') { var E2 = poisExpr(askK, m); v = E2.plain; steps2 = base.concat(['$P(X = ' + askK + ') = e^{-' + mT + '}\\dfrac{' + par(mT) + '^{' + askK + '}}{' + askK + '!} \\approx ' + E2.val.toFixed(4) + '$.']); }
      else if (shape === 'atleast1') { v = '1-e^(-' + mP + ')'; steps2 = base.concat(['"At least one" is the complement of "none": $P(X \\ge 1) = 1 - e^{-' + mT + '} \\approx ' + (1 - M.exp(-mNum)).toFixed(4) + '$.']); }
      else { v = 'e^(-' + mP + ')*(1+' + mP + '+' + mP + '^2/2)'; steps2 = base.concat(['$P(X \\le 2) = e^{-' + mT + '}\\left(1 + ' + mT + ' + \\dfrac{' + par(mT) + '^{2}}{2}\\right) \\approx ' + (M.exp(-mNum) * (1 + mNum + mNum * mNum / 2)).toFixed(4) + '$.']); }
      return chk({ q: 'Emails arrive at random at an average rate of $' + num(rate) + '$ ' + unit[0] + '. Find the probability of ' + (shape === 'window' ? 'exactly ' + askK : shape === 'atleast1' ? 'at least one' : 'at most two') + ' in a ' + len.toPlain() + '-' + unit[1].replace(/s$/, '') + ' window. (Give the exact value or a decimal to 3 places.)', a: tol(v),
        steps: steps2, hint: 'First scale λ to the length of the window.' }, { kind: shape, m: mNum, k: askK });
    }
    if (shape === 'ratio') {
      var k2 = R.int(1, 4), rr = R.pick([q(1, 2), Q(1), Q(2), q(3, 2), Q(3)]), lam2 = rr.mul(k2 + 1);
      return chk({ q: '$X$ is Poisson, and $P(X = ' + (k2 + 1) + ') = ' + (rr.eq(1) ? '' : qt(rr) + '\\,') + 'P(X = ' + k2 + ')$. Find the mean $\\lambda$.', a: ex(lam2),
        steps: ['Divide the two pmf values: $\\dfrac{P(X = k + 1)}{P(X = k)} = \\dfrac{e^{-\\lambda}\\lambda^{k + 1}/(k + 1)!}{e^{-\\lambda}\\lambda^{k}/k!} = \\dfrac{\\lambda}{k + 1}$.', 'Here $\\dfrac{\\lambda}{' + (k2 + 1) + '} = ' + qt(rr) + '$, so $\\lambda = ' + qt(lam2) + '$.'],
        hint: 'The ratio of neighboring Poisson probabilities is λ/(k + 1).' }, { kind: 'ratio', k: k2, r: qp(rr) });
    }
    if (shape === 'moment') {
      var lam3 = R.pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]), which = R.pick(['sq', 'ff']), L3 = Q.from(lam3), v3 = which === 'sq' ? L3.add(L3.pow(2)) : L3.pow(2);
      return chk({ q: '$X$ is Poisson with mean $' + num(lam3) + '$. Find $' + (which === 'sq' ? 'E[X^{2}]' : 'E[X(X - 1)]') + '$.', a: ex(v3),
        steps: which === 'sq' ? ['For a Poisson variable, $E[X] = \\operatorname{Var}(X) = \\lambda$.', '$E[X^{2}] = \\operatorname{Var}(X) + (E[X])^{2} = ' + num(lam3) + ' + ' + num(lam3) + '^{2} = ' + qt(v3) + '$.'] : ['$E[X(X - 1)] = \\sum_{k \\ge 2} k(k - 1)e^{-\\lambda}\\dfrac{\\lambda^{k}}{k!} = \\lambda^{2}\\sum_{k \\ge 2} e^{-\\lambda}\\dfrac{\\lambda^{k - 2}}{(k - 2)!} = \\lambda^{2}$.', 'So $E[X(X - 1)] = ' + num(lam3) + '^{2} = ' + qt(v3) + '$. (Then $E[X^{2}] = \\lambda^{2} + \\lambda$, and $\\operatorname{Var}(X) = \\lambda$.)'],
        hint: which === 'sq' ? 'Mean and variance of a Poisson are both λ.' : 'Cancel k(k − 1) against k! and shift the index.' }, { kind: which, lam: lam3 });
    }
    var p0 = R.pick([[q(1, 4), '4'], [q(1, 2), '2'], [q(1, 3), '3'], [q(1, 10), '10'], [q(1, 5), '5']]);
    return chk({ q: 'The number of breakdowns of a machine in a month is Poisson, and the probability of a month with no breakdowns is $' + qt(p0[0]) + '$. Find the mean number of breakdowns per month. (Exact, or a decimal to 3 places.)', a: tol('ln(' + p0[1] + ')'),
      steps: ['$P(X = 0) = e^{-\\lambda}$.', '$e^{-\\lambda} = ' + qt(p0[0]) + '$, so $\\lambda = -\\ln\\left(' + qt(p0[0]) + '\\right) = \\ln ' + p0[1] + ' \\approx ' + M.log(+p0[1]).toFixed(4) + '$.'],
      hint: 'P(X = 0) = e^(−λ); take logarithms.' }, { kind: 'fromzero', p0: qp(p0[0]) });
  });

  G('prob.poisson-approximation', function (R, ctx) {
    var shape = by(ctx, 'pmf', R.pick(['atleast1', 'atmost1']), R.pick(['which', 'compare']));
    var n = R.pick([200, 250, 400, 500, 1000, 2000]), lamT = R.pick([1, 2, 3, 4, 5]), p = Q(lamT, n), pT = dec(p, 6);
    var CTX = R.pick([['A factory makes ' + n + ' chips a day, and each is defective with probability $' + pT + '$, independently.', 'defective chips'], ['A website has ' + n + ' visitors an hour, and each buys something with probability $' + pT + '$, independently.', 'buyers'], ['A typist types ' + n + ' words, and each has a typo with probability $' + pT + '$, independently.', 'typos']]);
    if (shape === 'pmf' || shape === 'atleast1' || shape === 'atmost1') {
      var k = pickK(R, lamT, 4), E = poisExpr(k, lamT), v, st, exact;
      if (shape === 'pmf') { v = E.plain; exact = Cq(n, k).toNumber() * M.pow(p.toNumber(), k) * M.pow(1 - p.toNumber(), n - k); st = ['$X$ is binomial with $n = ' + n + '$ and $p = ' + pT + '$: many trials, each rare.', 'Poisson approximation with $\\lambda = np = ' + lamT + '$: $P(X = ' + k + ') \\approx e^{-' + lamT + '}\\dfrac{' + lamT + '^{' + k + '}}{' + k + '!} \\approx ' + E.val.toFixed(4) + '$.', 'For comparison, the exact binomial value is about $' + exact.toFixed(4) + '$.']; }
      else if (shape === 'atleast1') { v = '1-e^(-' + lamT + ')'; exact = 1 - M.pow(1 - p.toNumber(), n); st = ['Binomial with large $n = ' + n + '$ and small $p = ' + pT + '$, so use Poisson with $\\lambda = np = ' + lamT + '$.', '$P(X \\ge 1) = 1 - P(X = 0) \\approx 1 - e^{-' + lamT + '} \\approx ' + (1 - M.exp(-lamT)).toFixed(4) + '$.', 'The exact binomial value $1 - (1 - p)^{' + n + '}$ is about $' + exact.toFixed(4) + '$.']; }
      else { v = 'e^(-' + lamT + ')*(1+' + lamT + ')'; exact = M.pow(1 - p.toNumber(), n) + n * p.toNumber() * M.pow(1 - p.toNumber(), n - 1); st = ['Poisson with $\\lambda = np = ' + lamT + '$.', '$P(X \\le 1) \\approx e^{-' + lamT + '}(1 + ' + lamT + ') \\approx ' + (M.exp(-lamT) * (1 + lamT)).toFixed(4) + '$.', 'The exact binomial value is about $' + exact.toFixed(4) + '$.']; }
      return chk({ q: CTX[0] + ' Use the Poisson approximation to find the probability of ' + (shape === 'pmf' ? 'exactly ' + k + ' ' + CTX[1] : shape === 'atleast1' ? 'at least one of the ' + CTX[1] : 'at most one of the ' + CTX[1]) + '. (Give a decimal to 3 places or an exact expression.)', a: tol(v, 0.0006),
        steps: st, hint: 'Use λ = np.' }, { kind: shape, n: n, lam: lamT, k: k });
    }
    if (shape === 'which') {
      var good = R.pick([[500, '0.004'], [1000, '0.002'], [300, '0.01'], [2000, '0.001']]), bad = R.sample([[10, '0.3'], [20, '0.5'], [50, '0.4'], [15, '0.2'], [100, '0.5'], [30, '0.6']], 3);
      return chk({ q: 'For which binomial distribution is the Poisson approximation with $\\lambda = np$ most accurate?', a: mc('$n = ' + good[0] + ',\\ p = ' + good[1] + '$', bad.map(function (b) { return '$n = ' + b[0] + ',\\ p = ' + b[1] + '$'; })),
        steps: ['The approximation needs many trials and a small chance on each: $n$ large, $p$ small, with $np$ moderate.', 'Only $n = ' + good[0] + ',\\ p = ' + good[1] + '$ has a small $p$; the others have $p$ far from 0, where the binomial\'s variance $np(1 - p)$ is well below its mean $np$, while a Poisson\'s variance equals its mean.'],
        hint: 'Look for many trials, each unlikely to succeed.' }, { kind: 'which' });
    }
    var n5 = R.pick([10, 20, 30]), p5 = R.pick([q(1, 10), q(1, 5), q(1, 20)]); if (p5.mul(n5).gt(3)) n5 = 10; var l5 = p5.mul(n5), ex0 = Q(1).sub(p5).pow(n5).toNumber(), ap0 = M.exp(-l5.toNumber());
    return chk({ q: '$X$ is binomial with $n = ' + n5 + '$ and $p = ' + qt(p5) + '$. Find $P(X = 0)$ (a) exactly and (b) with the Poisson approximation $\\lambda = np$. Give decimals to 4 places.',
      a: { t: 'multi', parts: [{ label: '(a)', a: { t: 'num', v: Q(1).sub(p5).pow(n5).toPlain(), tol: 0.00006 } }, { label: '(b)', a: { t: 'num', v: 'e^(-' + l5.toPlain() + ')', tol: 0.00006 } }] },
      steps: ['(a) $P(X = 0) = (1 - p)^{n} = \\left(' + qt(Q(1).sub(p5)) + '\\right)^{' + n5 + '} \\approx ' + ex0.toFixed(4) + '$.', '(b) $\\lambda = np = ' + qt(l5) + '$, so $P(X = 0) \\approx e^{-' + qt(l5) + '} \\approx ' + ap0.toFixed(4) + '$.', 'They differ by about ' + M.abs(ex0 - ap0).toFixed(4) + (p5.toNumber() >= 0.2 ? ': with $p$ this large the approximation is rough.' : ': a small $p$ keeps them close.')],
      hint: 'Exact: (1 − p)^n. Approximate: e^(−np).' }, { kind: 'compare', n: n5, p: qp(p5) });
  });

  var STORIES = {
    binomial: [function (R) { var n = R.int(8, 20); return { s: 'A quiz has ' + n + ' true-false questions, and a student guesses on every one. $X$ = the number answered correctly.', n: n, p: q(1, 2), par: 'n = ' + n + ', p = \\frac{1}{2}' }; }, function (R) { var n = R.int(10, 30), p = R.pick([q(3, 4), q(4, 5), q(9, 10)]); return { s: n + ' seeds are planted, and each sprouts with probability $' + qt(p) + '$, independently. $X$ = the number that sprout.', n: n, p: p }; }],
    geometric: [function () { return { s: 'Roll a fair die until the first six. $X$ = the number of rolls.', p: q(1, 6) }; }, function (R) { var p = R.pick([q(1, 3), q(2, 5), q(1, 4)]); return { s: 'A player keeps shooting free throws, each made with probability $' + qt(p) + '$ independently, until the first make. $X$ = the number of shots.', p: p }; }],
    negbin: [function (R) { var r = R.int(2, 4); return { s: 'Roll a fair die until the ' + U.ordinal(r) + ' six. $X$ = the number of rolls.', p: q(1, 6), r: r }; }, function (R) { var r = R.int(2, 5), p = R.pick([q(1, 5), q(1, 4), q(1, 10)]); return { s: 'A salesperson keeps calling until making ' + r + ' sales; each call is a sale with probability $' + qt(p) + '$, independently. $X$ = the number of calls.', p: p, r: r }; }],
    hyper: [function (R) { var w = R.int(5, 9), m = R.int(5, 9), n = R.int(3, 5); return { s: 'A committee of ' + n + ' is chosen at random from ' + w + ' women and ' + m + ' men. $X$ = the number of women on it.', N: w + m, K: w, n: n }; }, function (R) { var n = R.int(4, 6); return { s: n + ' cards are dealt from a shuffled 52-card deck. $X$ = the number of hearts dealt.', N: 52, K: 13, n: n }; }],
    poisson: [function (R) { var l = R.int(2, 6); return { s: 'A help desk gets calls at random times, on average ' + l + ' per hour. $X$ = the number of calls in one hour.', lam: l }; }, function (R) { var l = R.int(1, 4); return { s: 'Flaws in a roll of fabric occur at random, on average ' + l + ' per meter. $X$ = the number of flaws in one meter.', lam: l }; }]
  };
  var DNAME = { binomial: 'binomial', geometric: 'geometric', negbin: 'negative binomial', hyper: 'hypergeometric', poisson: 'Poisson' };
  var WHY = { binomial: 'a fixed number of independent trials, each with the same chance of success, and X counts the successes', geometric: 'independent trials with the same chance, repeated until the first success, and X counts the trials', negbin: 'independent trials with the same chance, repeated until a set number of successes, and X counts the trials', hyper: 'a fixed number of draws without replacement from a group with a known number of successes, so the draws are not independent', poisson: 'events happening at random at a steady average rate, counted over a fixed time or space' };
  G('prob.choosing-distribution', function (R, ctx) {
    var shape = by(ctx, 'name', 'mean', 'prob'), kind = R.pick(Object.keys(STORIES)), S = R.pick(STORIES[kind])(R);
    var names = Object.keys(DNAME).map(function (k) { return DNAME[k]; }), right = DNAME[kind];
    var nameSpec = mcKeep(names, names.indexOf(right));
    var st0 = 'The story has ' + WHY[kind] + ': ' + right + '.';
    if (shape === 'name') return chk({ q: S.s + ' Which distribution does $X$ have?', a: nameSpec, steps: [st0, 'Check the others: ' + Object.keys(WHY).filter(function (k) { return k !== kind; }).slice(0, 2).map(function (k) { return DNAME[k] + ' would need ' + WHY[k]; }).join('; ') + '.'], hint: 'Ask: fixed number of trials? until a success? without replacement? a rate over time?' }, { kind: 'name', d: kind });
    var mean = kind === 'binomial' ? S.p.mul(S.n) : kind === 'geometric' ? S.p.inv() : kind === 'negbin' ? Q(S.r).div(S.p) : kind === 'hyper' ? q(S.n * S.K, S.N) : Q(S.lam);
    var meanWhy = { binomial: '$E[X] = np = ' + S.n + ' \\cdot ' + (S.p ? qt(S.p) : '') + '$', geometric: '$E[X] = \\frac{1}{p}$ with $p = ' + (S.p ? qt(S.p) : '') + '$', negbin: '$E[X] = \\frac{r}{p} = \\frac{' + S.r + '}{' + (S.p ? qt(S.p) : '') + '}$', hyper: '$E[X] = n\\frac{K}{N} = ' + S.n + ' \\cdot \\frac{' + S.K + '}{' + S.N + '}$', poisson: '$E[X] = \\lambda$' }[kind];
    if (shape === 'mean') return chk({ q: S.s + ' (a) Which distribution does $X$ have? (b) Find $E[X]$.', a: { t: 'multi', parts: [{ label: '(a)', a: nameSpec }, { label: '(b)', a: ex(mean) }] }, steps: [st0, '(b) ' + meanWhy + ' $= ' + qt(mean) + '$.'], hint: 'Name the distribution first; its mean formula follows.' }, { kind: 'mean', d: kind, S: { n: S.n, p: S.p && qp(S.p), r: S.r, N: S.N, K: S.K, lam: S.lam } });
    // prob: compute a probability once the model is chosen
    var v, st, spec;
    if (kind === 'binomial') { var kk = M.min(S.n, M.max(0, M.round(S.p.toNumber() * S.n) + R.int(-1, 1))); v = Cq(S.n, kk).mul(S.p.pow(kk)).mul(Q(1).sub(S.p).pow(S.n - kk)); st = ['Binomial with $n = ' + S.n + '$, $p = ' + qt(S.p) + '$.', '$P(X = ' + kk + ') = \\binom{' + S.n + '}{' + kk + '}p^{' + kk + '}(1 - p)^{' + (S.n - kk) + '} \\approx ' + dec(v, 4) + '$.']; spec = ptol(v); return chk({ q: S.s + ' Find $P(X = ' + kk + ')$.' + exdNote(v), a: exd(v), steps: st, hint: 'Decide the model, then use its pmf.' }, { kind: 'prob', d: kind, n: S.n, p: qp(S.p), k: kk }); }
    if (kind === 'geometric') { var k2 = R.int(2, 4); v = Q(1).sub(S.p).pow(k2); return chk({ q: S.s + ' Find $P(X > ' + k2 + ')$.', a: ex(v), steps: ['Geometric: $X > ' + k2 + '$ means the first ' + k2 + ' trials all failed.', '$P(X > ' + k2 + ') = (1 - p)^{' + k2 + '} = ' + T.pow(qt(Q(1).sub(S.p)), k2) + ' = ' + qt(v) + '$.'], hint: 'More than k trials means k failures in a row.' }, { kind: 'prob', d: kind, p: qp(S.p), k: k2 }); }
    if (kind === 'negbin') { var k3 = S.r + R.int(0, 2); while (k3 > S.r && Cq(k3 - 1, S.r - 1).mul(S.p.pow(S.r)).mul(Q(1).sub(S.p).pow(k3 - S.r)).toNumber() < 0.05 && Cq(k3 - 2, S.r - 1).mul(S.p.pow(S.r)).mul(Q(1).sub(S.p).pow(k3 - 1 - S.r)).toNumber() >= Cq(k3 - 1, S.r - 1).mul(S.p.pow(S.r)).mul(Q(1).sub(S.p).pow(k3 - S.r)).toNumber()) k3--; v = Cq(k3 - 1, S.r - 1).mul(S.p.pow(S.r)).mul(Q(1).sub(S.p).pow(k3 - S.r)); return chk({ q: S.s + ' Find $P(X = ' + k3 + ')$.' + exdNote(v), a: exd(v), steps: ['Negative binomial with $r = ' + S.r + '$, $p = ' + qt(S.p) + '$.', '$P(X = ' + k3 + ') = \\binom{' + (k3 - 1) + '}{' + (S.r - 1) + '}p^{' + S.r + '}(1 - p)^{' + (k3 - S.r) + '} = ' + qt(v) + ' \\approx ' + dec(v, 4) + '$.'], hint: 'The last trial is the rth success.' }, { kind: 'prob', d: kind, p: qp(S.p), r: S.r, k: k3 }); }
    if (kind === 'hyper') { var k4 = R.int(1, M.min(2, S.n - 1)); v = hyp(S.N, S.K, S.n, k4); return chk({ q: S.s + ' Find $P(X = ' + k4 + ')$.' + exdNote(v), a: exd(v), steps: ['Hypergeometric with $N = ' + S.N + '$, $K = ' + S.K + '$, $n = ' + S.n + '$.', '$P(X = ' + k4 + ') = \\dfrac{\\binom{' + S.K + '}{' + k4 + '}\\binom{' + (S.N - S.K) + '}{' + (S.n - k4) + '}}{\\binom{' + S.N + '}{' + S.n + '}} = ' + qt(v) + ' \\approx ' + dec(v, 4) + '$.'], hint: 'Count subsets: choose from each group.' }, { kind: 'prob', d: kind, N: S.N, K: S.K, n: S.n, k: k4 }); }
    var k5 = pickK(R, S.lam), E = poisExpr(k5, S.lam);
    return chk({ q: S.s + ' Find $P(X = ' + k5 + ')$ (exact, or a decimal to 3 places).', a: tol(E.plain), steps: ['Poisson with $\\lambda = ' + S.lam + '$.', '$P(X = ' + k5 + ') = e^{-' + S.lam + '}\\dfrac{' + S.lam + '^{' + k5 + '}}{' + k5 + '!} \\approx ' + E.val.toFixed(4) + '$.'], hint: 'Random events at a steady rate: Poisson.' }, { kind: 'prob', d: kind, lam: S.lam, k: k5 });
  });


  // ================================================================ Unit 4: Continuous Random Variables
  // polynomial densities on [0, b]: { poly (array of Q), b, tex }
  function densFam(R, kinds) {
    var kind = R.pick(kinds || ['power', 'power', 'ramp', 'tent', 'affine', 'ramp2']), b, poly, raw, c;
    if (kind === 'power') { var k = R.int(1, 3); b = R.pick(k === 3 ? [1, 2] : [1, 2, 3, 4]); c = q(k + 1, M.pow(b, k + 1)); raw = pmono(1, k); poly = pmono(c, k); return { kind: kind, k: k, b: b, c: c, raw: raw, poly: poly }; }
    if (kind === 'ramp') { b = R.pick([1, 2, 3, 4, 5, 6]); c = q(2, b * b); raw = P([b, -1]); poly = pscale(raw, c); return { kind: kind, b: b, c: c, raw: raw, poly: poly }; }
    if (kind === 'ramp2') { b = R.pick([1, 2, 3]); c = q(3, b * b * b); raw = P([b * b, -2 * b, 1]); poly = pscale(raw, c); return { kind: kind, b: b, c: c, raw: raw, poly: poly }; }
    if (kind === 'affine') { var a0 = R.pick([1, 2, 3]); b = 1; c = q(2, 2 * a0 + 1); raw = P([a0, 1]); poly = pscale(raw, c); return { kind: kind, a0: a0, b: b, c: c, raw: raw, poly: poly }; }
    b = R.pick([1, 2, 3]); c = q(6, b * b * b); raw = P([0, b, -1]); poly = pscale(raw, c); return { kind: 'tent', b: b, c: c, raw: raw, poly: poly };
  }
  function rawTex(Df) { return Df.kind === 'power' ? (Df.k === 1 ? 'x' : 'x^{' + Df.k + '}') : Df.kind === 'ramp' ? '(' + Df.b + ' - x)' : Df.kind === 'ramp2' ? '(' + Df.b + ' - x)^{2}' : Df.kind === 'affine' ? '(x + ' + Df.a0 + ')' : 'x(' + Df.b + ' - x)'; }
  function densTex(Df, withC) { // f(x) = … on [0, b], 0 otherwise
    var body = withC === false ? 'c\\,' + rawTex(Df) : (Df.c.eq(1) ? '' : qt(Df.c)) + rawTex(Df);
    return '$$f(x) = \\begin{cases} ' + body + ' & 0 \\le x \\le ' + Df.b + ' \\\\ 0 & \\text{otherwise} \\end{cases}$$';
  }
  function fracB(R, b, parts) { return q(b * R.int(1, parts - 1), parts); }

  G('prob.densities', function (R, ctx) {
    var shape = by(ctx, 'const', 'prob', R.pick(['tall', 'piece', 'prob']));
    if (shape === 'const') {
      var Df = densFam(R), I = pdef(Df.raw, 0, Df.b);
      return chk({ q: 'For which constant $c$ is this a probability density?' + densTex(Df, false), a: ex(Df.c),
        steps: ['A density must be at least 0 and have total area 1: $\\int_{0}^{' + Df.b + '} c\\,' + rawTex(Df) + '\\,dx = 1$.', 'Antiderivative: $\\int_{0}^{' + Df.b + '} ' + rawTex(Df) + '\\,dx = ' + qt(I) + '$.', 'So $c \\cdot ' + qt(I) + ' = 1$, and $c = ' + qt(Df.c) + '$.'],
        hint: 'Set the total area equal to 1.' }, { kind: 'const', poly: Df.raw.map(qp), b: Df.b });
    }
    if (shape === 'prob') {
      var D2 = densFam(R), lo = R.coin() ? Q(0) : fracB(R, D2.b, 4), hi = fracB(R, D2.b, 4); if (hi.le(lo)) { var t2 = lo; lo = hi; hi = t2; } if (hi.eq(lo)) hi = Q(D2.b);
      if (R.chance(0.3)) { lo = fracB(R, D2.b, 2); hi = Q(D2.b + 1); }
      var hiC = Q.min(hi, D2.b), v = pdef(D2.poly, lo, hiC), A = pint(D2.poly);
      var ask = hi.gt(D2.b) ? 'P(X \\ge ' + qt(lo) + ')' : lo.isZero() ? 'P(X \\le ' + qt(hi) + ')' : 'P(' + qt(lo) + ' \\le X \\le ' + qt(hi) + ')';
      return chk({ q: '$X$ has this density. Find $' + ask + '$.' + densTex(D2), a: ex(v),
        steps: ['A probability is an area under the density: integrate $f$ over the interval' + (hi.gt(D2.b) ? ', which stops at $' + D2.b + '$ because $f = 0$ beyond it.' : '.'), 'An antiderivative is $F_0(x) = ' + ptex(A) + '$.', lo.isZero() ? '$' + ask + ' = F_0(' + qt(hiC) + ') - F_0(0) = ' + qt(v) + '$, since $F_0(0) = 0$.' : '$' + ask + ' = F_0(' + qt(hiC) + ') - F_0(' + qt(lo) + ') = ' + qt(peval(A, hiC)) + ' - ' + T.p(qt(peval(A, lo))) + ' = ' + qt(v) + '$.'],
        hint: 'Integrate the density between the limits.' }, { kind: 'prob', poly: D2.poly.map(qp), lo: qp(lo), hi: qp(hiC) });
    }
    if (shape === 'tall') {
      var kk = R.pick([2, 4, 5, 8, 10]), w = q(1, kk), x0 = q(1, 2 * kk), right = R.pick(['zero', 'half']);
      var correct = right === 'zero' ? '$P(X = ' + qt(x0) + ') = 0$' : '$P(X \\le ' + qt(x0) + ') = \\frac{1}{2}$';
      var wrongs = ['$P(X = ' + qt(x0) + ') = ' + kk + '$', 'This is not a density, because $f(x) = ' + kk + '$ is more than 1', '$P(X \\le ' + qt(x0) + ') = ' + kk + ' \\cdot ' + qt(x0) + ' \\cdot ' + kk + '$', right === 'zero' ? '$P(X \\le ' + qt(x0) + ') = ' + qt(x0) + '$' : '$P(X = ' + qt(x0) + ') = ' + qt(w) + '$'];
      return chk({ q: '$X$ is uniform on $\\left[0, ' + qt(w) + '\\right]$, so its density is $f(x) = ' + kk + '$ there (and 0 elsewhere). Which statement is true?', a: mc(correct, R.sample(wrongs, 3)),
        steps: ['The total area is $' + kk + ' \\cdot ' + qt(w) + ' = 1$, so this is a valid density, even though its height is ' + kk + '. A density\'s height is not a probability.', 'Probabilities are areas: $P(X \\le ' + qt(x0) + ') = ' + kk + ' \\cdot ' + qt(x0) + ' = \\frac{1}{2}$.', 'A single point has no width, so $P(X = ' + qt(x0) + ') = 0$ for a continuous $X$.', 'So the true statement is ' + correct + '.'],
        hint: 'Probability is area, not height.' }, { kind: 'tall', k: kk, right: right });
    }
    // piecewise triangle on [0, 2c]
    var c2 = R.pick([1, 2, 3]), a = q(c2 * R.int(1, 3), 4), bb = Q(c2).add(q(c2 * R.int(1, 3), 4));
    var left = pdef(P([0, q(1, c2 * c2)]), a, c2), right2 = pdef(P([q(2, c2), q(-1, c2 * c2)]), c2, bb), v2 = left.add(right2);
    var ftex = '$$f(x) = \\begin{cases} ' + (c2 === 1 ? 'x' : '\\frac{x}{' + c2 * c2 + '}') + ' & 0 \\le x \\le ' + c2 + ' \\\\ ' + (c2 === 1 ? '2 - x' : '\\frac{' + 2 * c2 + ' - x}{' + c2 * c2 + '}') + ' & ' + c2 + ' < x \\le ' + 2 * c2 + ' \\\\ 0 & \\text{otherwise} \\end{cases}$$';
    return chk({ q: '$X$ has the triangle-shaped density below. Find $P(' + qt(a) + ' \\le X \\le ' + qt(bb) + ')$.' + ftex, a: ex(v2),
      steps: ['The interval crosses $x = ' + c2 + '$, where the formula changes, so split the integral there.', 'Left piece: $\\int_{' + qt(a) + '}^{' + c2 + '} ' + (c2 === 1 ? 'x' : '\\frac{x}{' + c2 * c2 + '}') + '\\,dx = ' + qt(left) + '$.', 'Right piece: $\\int_{' + c2 + '}^{' + qt(bb) + '} ' + (c2 === 1 ? '(2 - x)' : '\\frac{' + 2 * c2 + ' - x}{' + c2 * c2 + '}') + '\\,dx = ' + qt(right2) + '$.', 'Total: $' + qt(left) + ' + ' + qt(right2) + ' = ' + qt(v2) + '$.'],
      hint: 'Split the integral where the formula changes.' }, { kind: 'piece', c: c2, a: qp(a), b: qp(bb) });
  });

  G('prob.continuous-cdf', function (R, ctx) {
    var shape = by(ctx, 'F', R.pick(['pct', 'median', 'fromF']), R.pick(['tri', 'triF', 'steps']));
    if (shape === 'F' || shape === 'pct' || shape === 'median') {
      var k = shape === 'F' ? R.int(1, 3) : R.int(1, 2), b = R.pick(k === 3 ? [1, 2] : [1, 2, 3, 4, 5]), c = q(k + 1, M.pow(b, k + 1)), Df = { kind: 'power', k: k, b: b, c: c, raw: pmono(1, k), poly: pmono(c, k) };
      if (shape === 'F' && R.chance(0.4)) { var br = R.pick([1, 2, 3, 4, 5, 6]), Dr = { kind: 'ramp', b: br, c: q(2, br * br), raw: P([br, -1]) }; Dr.poly = pscale(Dr.raw, Dr.c); var Frp = pint(Dr.poly);
        return chk({ q: '$X$ has this density. Find its CDF $F(x)$ for $0 \\le x \\le ' + br + '$.' + densTex(Dr), a: { t: 'expr', v: pplain(Frp), vars: ['x'] },
          steps: ['$F(x) = \\int_{0}^{x} f(t)\\,dt$, since the density is 0 below 0.', '$F(x) = \\int_{0}^{x} ' + qt(Dr.c) + '(' + br + ' - t)\\,dt = ' + ptex(Frp) + '$.', 'Check: $F(0) = 0$ and $F(' + br + ') = 1$.'],
          hint: 'Integrate the density from 0 up to x.' }, { kind: 'Framp', b: br }); }
      var Fpoly = pmono(q(1, M.pow(b, k + 1)), k + 1);
      if (shape === 'F') return chk({ q: '$X$ has this density. Find its CDF $F(x)$ for $0 \\le x \\le ' + b + '$.' + densTex(Df), a: { t: 'expr', v: pplain(Fpoly), vars: ['x'] },
        steps: ['$F(x) = \\int_{-\\infty}^{x} f(t)\\,dt$; the density is 0 below 0, so start at 0.', '$F(x) = \\int_{0}^{x} ' + (c.eq(1) ? '' : qt(c)) + (k === 1 ? 't' : 't^{' + k + '}') + '\\,dt = ' + ptex(Fpoly) + '$.', 'Check: $F(0) = 0$ and $F(' + b + ') = 1$. (Below 0, $F = 0$; above ' + b + ', $F = 1$.)'],
        hint: 'Integrate the density from 0 up to x.' }, { kind: 'F', k: k, b: b });
      if (shape === 'pct') {
        var pr = k === 1 ? R.pick([[q(1, 4), q(1, 2)], [q(9, 16), q(3, 4)], [q(1, 9), q(1, 3)], [q(4, 9), q(2, 3)], [q(9, 25), q(3, 5)], [q(16, 25), q(4, 5)]]) : R.pick([[q(1, 8), q(1, 2)], [q(27, 64), q(3, 4)], [q(1, 27), q(1, 3)], [q(8, 27), q(2, 3)]]);
        var m = pr[1].mul(b), pct = pr[0].mul(100);
        return chk({ q: '$X$ has this density. Find the value $m$ with $P(X \\le m) = ' + qt(pr[0]) + '$' + (pct.isInt() ? ' (the ' + U.ordinal(pct.num()) + ' percentile)' : '') + '.' + densTex(Df), a: ex(m),
          steps: b === 1 ? ['The CDF is $F(x) = x^{' + (k + 1) + '}$ on $[0, 1]$.', 'Solve $m^{' + (k + 1) + '} = ' + qt(pr[0]) + '$: $m = ' + qt(m) + '$.'] : ['The CDF is $F(x) = ' + ptex(Fpoly) + ' = \\left(\\frac{x}{' + b + '}\\right)^{' + (k + 1) + '}$ on $[0, ' + b + ']$.', 'Solve $\\left(\\frac{m}{' + b + '}\\right)^{' + (k + 1) + '} = ' + qt(pr[0]) + '$: $\\frac{m}{' + b + '} = ' + qt(pr[1]) + '$.', '$m = ' + qt(m) + '$.'],
          hint: 'Find F, then solve F(m) = the given probability.' }, { kind: 'pct', k: k, b: b, p: qp(pr[0]) });
      }
      var med = b + '/2^(1/' + (k + 1) + ')';
      return chk({ q: '$X$ has this density. Find its median (exact, or a decimal to 3 places).' + densTex(Df), a: tol(med),
        steps: ['The median $m$ solves $F(m) = \\frac{1}{2}$. Here $F(x) = \\left(\\frac{x}{' + b + '}\\right)^{' + (k + 1) + '}$ on $[0, ' + b + ']$.', '$\\left(\\frac{m}{' + b + '}\\right)^{' + (k + 1) + '} = \\frac{1}{2}$, so $m = ' + b + ' \\cdot 2^{-1/' + (k + 1) + '} \\approx ' + (b * M.pow(2, -1 / (k + 1))).toFixed(4) + '$.', 'It is above the middle of the interval, $' + num(b / 2) + '$, because this density puts more weight on large values.'],
        hint: 'Solve F(m) = 1/2.' }, { kind: 'median', k: k, b: b });
    }
    if (shape === 'fromF') {
      var b2 = R.pick([2, 3, 4]), kk = R.int(2, 3), Fp = pmono(q(1, M.pow(b2, kk)), kk), lo = fracB(R, b2, 4), hi = fracB(R, b2, 4); if (hi.le(lo)) { var t = lo; lo = hi; hi = t; } if (hi.eq(lo)) hi = Q(b2);
      var v = peval(Fp, hi).sub(peval(Fp, lo)), askD = R.coin(), x1 = fracB(R, b2, 2), fval = peval(pder(Fp), x1);
      var Ft = '$$F(x) = \\begin{cases} 0 & x < 0 \\\\ \\dfrac{x^{' + kk + '}}{' + M.pow(b2, kk) + '} & 0 \\le x \\le ' + b2 + ' \\\\ 1 & x > ' + b2 + ' \\end{cases}$$';
      if (askD) return chk({ q: '$X$ has the CDF below. Find the density value $f(' + qt(x1) + ')$.' + Ft, a: ex(fval),
        steps: ['The density is the derivative of the CDF: $f(x) = F\'(x) = \\dfrac{' + kk + 'x^{' + (kk - 1) + '}}{' + M.pow(b2, kk) + '}$ on $(0, ' + b2 + ')$.', '$f(' + qt(x1) + ') = ' + qt(fval) + '$. (A density value, not a probability.)'],
        hint: 'Differentiate F.' }, { kind: 'fromFd', b: b2, k: kk, x: qp(x1) });
      return chk({ q: '$X$ has the CDF below. Find $P(' + qt(lo) + ' < X \\le ' + qt(hi) + ')$.' + Ft, a: ex(v),
        steps: ['$P(a < X \\le b) = F(b) - F(a)$.', '$= ' + qt(peval(Fp, hi)) + ' - ' + qt(peval(Fp, lo)) + ' = ' + qt(v) + '$.'],
        hint: 'Subtract the CDF values.' }, { kind: 'fromF', b: b2, k: kk, lo: qp(lo), hi: qp(hi) });
    }
    if (shape === 'steps') { // two flat pieces
      var aa = R.pick([q(1, 2), q(1, 4), q(1, 3), q(3, 5), q(1, 5), q(2, 3)]), bH = Q(1).sub(aa).div(2), x2 = R.pick([q(3, 2), Q(2), q(5, 2), q(5, 4), q(7, 4), q(9, 4)]), v2 = aa.add(bH.mul(x2.sub(1)));
      return chk({ q: '$X$ has the density $f(x) = ' + qt(aa) + '$ for $0 \\le x < 1$, $f(x) = ' + qt(bH) + '$ for $1 \\le x \\le 3$, and 0 otherwise. Find $F(' + qt(x2) + ')$.', a: ex(v2),
        steps: ['$F(' + qt(x2) + ')$ is all the area to the left of $' + qt(x2) + '$, including the whole first piece.', 'First piece: $' + qt(aa) + ' \\cdot 1 = ' + qt(aa) + '$. Second piece up to $' + qt(x2) + '$: $' + qt(bH) + ' \\cdot ' + T.p(qt(x2.sub(1))) + ' = ' + qt(bH.mul(x2.sub(1))) + '$.', '$F(' + qt(x2) + ') = ' + qt(aa) + ' + ' + qt(bH.mul(x2.sub(1))) + ' = ' + qt(v2) + '$.'],
        hint: 'Include the area of the whole first piece.' }, { kind: 'steps', a: qp(aa), x: qp(x2) });
    }
    var c3 = R.pick([1, 2, 3]), tt = Q(c3).add(q(c3 * R.int(1, 3), 4)), Ft2 = Q(1).sub(Q(2 * c3).sub(tt).pow(2).div(2 * c3 * c3));
    if (shape === 'tri') return chk({ q: '$X$ has the triangle density $f(x) = ' + (c3 === 1 ? 'x' : '\\frac{x}{' + c3 * c3 + '}') + '$ on $[0, ' + c3 + ']$, $f(x) = ' + (c3 === 1 ? '2 - x' : '\\frac{' + 2 * c3 + ' - x}{' + c3 * c3 + '}') + '$ on $[' + c3 + ', ' + 2 * c3 + ']$, and 0 otherwise. Find $F(' + qt(tt) + ')$.', a: ex(Ft2),
      steps: ['$F(' + qt(tt) + ')$ includes all of the left half: area $\\frac{1}{2}$ (the triangle is symmetric).', 'Easier: the area to the right of $' + qt(tt) + '$ is a small triangle with base $' + qt(Q(2 * c3).sub(tt)) + '$ and height $f(' + qt(tt) + ') = ' + qt(Q(2 * c3).sub(tt).div(c3 * c3)) + '$: area $' + qt(Q(2 * c3).sub(tt).pow(2).div(2 * c3 * c3)) + '$.', '$F(' + qt(tt) + ') = 1 - ' + qt(Q(2 * c3).sub(tt).pow(2).div(2 * c3 * c3)) + ' = ' + qt(Ft2) + '$.'],
      hint: 'Do not forget the area of the left piece.' }, { kind: 'tri', c: c3, t: qp(tt) });
    // triF: a formula for F on one piece of the triangle density on [0, 2c]
    var c4 = R.pick([1, 2, 3]), right = R.coin(), cc = c4 * c4;
    var Fr = right ? P([q(-1, 1), q(2, c4), q(-1, 2 * cc)]) : P([0, 0, q(1, 2 * cc)]);
    var fl = c4 === 1 ? 'x' : '\\frac{x}{' + cc + '}', frr = c4 === 1 ? '2 - x' : '\\frac{' + 2 * c4 + ' - x}{' + cc + '}';
    return chk({ q: '$X$ has the density $f(x) = ' + fl + '$ for $0 \\le x \\le ' + c4 + '$, $f(x) = ' + frr + '$ for $' + c4 + ' < x \\le ' + 2 * c4 + '$, and 0 otherwise. Find a formula for its CDF $F(x)$ when $' + (right ? c4 + ' \\le x \\le ' + 2 * c4 : '0 \\le x \\le ' + c4) + '$.', a: { t: 'expr', v: pplain(Fr), vars: ['x'] },
      steps: right ? ['For $' + c4 + ' \\le x \\le ' + 2 * c4 + '$, $F(x)$ = the whole left piece + the part of the right piece up to $x$.', 'Left piece: area $\\frac{1}{2}$ (a triangle with base ' + c4 + ' and height $\\frac{1}{' + c4 + '}$).', 'Right part: $\\int_{' + c4 + '}^{x} ' + frr.replace('x', 't') + '\\,dt = ' + ptex(padd(Fr, P([q(-1, 2)]))) + '$.', '$F(x) = \\frac{1}{2} + \\left(' + ptex(padd(Fr, P([q(-1, 2)]))) + '\\right) = ' + ptex(Fr) + '$. Check: $F(' + c4 + ') = \\frac{1}{2}$, $F(' + 2 * c4 + ') = 1$.']
        : ['For $0 \\le x \\le ' + c4 + '$, $F(x) = \\int_{0}^{x} ' + fl.replace('x', 't') + '\\,dt$.', '$F(x) = ' + ptex(Fr) + '$. Check: $F(' + c4 + ') = \\frac{1}{2}$, half the area, as the symmetric triangle should give.'],
      hint: right ? 'Start with the area of the whole left piece, then add the integral from ' + c4 + ' to x.' : 'Integrate the left formula from 0 to x.' }, { kind: 'triF', c: c4, right: right });
  });

  G('prob.continuous-expectation', function (R, ctx) {
    var shape = by(ctx, 'mean', R.pick(['var', 'var', 'unif']), R.pick(['recip', 'cube', 'expo', 'shift2']));
    if (shape === 'unif') { var a = R.int(-3, 4), b = a + R.int(2, 8), v0 = q((b - a) * (b - a), 12), askSD = false;
      return chk(nl({ q: '$X$ is uniform on $[' + a + ', ' + b + ']$. Find $\\operatorname{Var}(X)$.', a: ex(v0),
        steps: ['$f(x) = \\frac{1}{' + (b - a) + '}$ on $[' + a + ', ' + b + ']$, and $E[X] = ' + num((a + b) / 2) + '$, the midpoint.', '$E[X^{2}] = \\int_{' + a + '}^{' + b + '} \\frac{x^{2}}{' + (b - a) + '}\\,dx = \\frac{' + b + '^{3} - ' + par(a) + '^{3}}{3 \\cdot ' + (b - a) + '} = ' + qt(q(b * b * b - a * a * a, 3 * (b - a))) + '$.', '$\\operatorname{Var}(X) = ' + qt(q(b * b * b - a * a * a, 3 * (b - a))) + ' - ' + par(num((a + b) / 2)) + '^{2} = ' + qt(v0) + '$, which is $\\frac{(b - a)^{2}}{12}$.'],
        hint: 'Use E[X²] − (E[X])², or the formula (b − a)²/12.' }), { kind: 'unif', a: a, b: b }); }
    var Df = densFam(R, shape === 'recip' ? ['power'] : ['power', 'power', 'ramp', 'tent']), xf = pmul(P([0, 1]), Df.poly), x2f = pmul(P([0, 0, 1]), Df.poly);
    var EX = pdef(xf, 0, Df.b), EX2 = pdef(x2f, 0, Df.b), V = EX2.sub(EX.pow(2));
    if (shape === 'mean') return chk({ q: '$X$ has this density. Find $E[X]$.' + densTex(Df), a: ex(EX),
      steps: ['$E[X] = \\int x\\,f(x)\\,dx$: weight each $x$ by its density, as in $\\sum x\\,P(X = x)$.', '$E[X] = \\int_{0}^{' + Df.b + '} ' + ptex(xf) + '\\,dx = ' + qt(EX) + '$.', 'Check it is plausible: it lies between 0 and ' + Df.b + '.'],
      hint: 'Integrate x times the density.' }, { kind: 'mean', poly: Df.poly.map(qp), b: Df.b });
    if (shape === 'var') return chk({ q: '$X$ has this density. Find $\\operatorname{Var}(X)$.' + densTex(Df), a: ex(V),
      steps: ['$E[X] = \\int_{0}^{' + Df.b + '} ' + ptex(xf) + '\\,dx = ' + qt(EX) + '$.', '$E[X^{2}] = \\int_{0}^{' + Df.b + '} ' + ptex(x2f) + '\\,dx = ' + qt(EX2) + '$.', '$\\operatorname{Var}(X) = E[X^{2}] - (E[X])^{2} = ' + qt(EX2) + ' - ' + par(qt(EX)) + '^{2} = ' + qt(V) + '$.'],
      hint: 'Find E[X] and E[X²]; the shortcut works for densities too.' }, { kind: 'var', poly: Df.poly.map(qp), b: Df.b });
    if (shape === 'recip') { var gpoly = Df.poly.slice(1), Er = pdef(gpoly, 0, Df.b);
      return chk({ q: '$X$ has this density. Find $E\\left[\\frac{1}{X}\\right]$.' + densTex(Df), a: ex(Er),
        steps: ['$E[g(X)] = \\int g(x)\\,f(x)\\,dx$ with $g(x) = \\frac{1}{x}$.', '$\\frac{1}{x} \\cdot ' + ptex(Df.poly) + ' = ' + ptex(gpoly) + '$.', '$E\\left[\\frac{1}{X}\\right] = \\int_{0}^{' + Df.b + '} ' + ptex(gpoly) + '\\,dx = ' + qt(Er) + '$. (Not $\\frac{1}{E[X]} = ' + qt(EX.inv()) + '$.)'],
        hint: 'Integrate (1/x) f(x).' }, { kind: 'recip', poly: Df.poly.map(qp), b: Df.b }); }
    if (shape === 'cube') { var x3f = pmul(P([0, 0, 0, 1]), Df.poly), E3 = pdef(x3f, 0, Df.b);
      return chk({ q: '$X$ has this density. Find $E[X^{3}]$.' + densTex(Df), a: ex(E3),
        steps: ['$E[X^{3}] = \\int x^{3} f(x)\\,dx$.', '$= \\int_{0}^{' + Df.b + '} ' + ptex(x3f) + '\\,dx = ' + qt(E3) + '$.'],
        hint: 'Integrate x³ times the density.' }, { kind: 'cube', poly: Df.poly.map(qp), b: Df.b }); }
    if (shape === 'shift2') { var c5 = R.int(1, 3), E5 = EX2.sub(EX.mul(2 * c5)).add(c5 * c5);
      return chk({ q: '$X$ has this density. Find $E[(X - ' + c5 + ')^{2}]$.' + densTex(Df), a: ex(E5),
        steps: ['Expand: $E[(X - ' + c5 + ')^{2}] = E[X^{2}] - ' + 2 * c5 + 'E[X] + ' + c5 * c5 + '$, by linearity.', '$E[X] = ' + qt(EX) + '$ and $E[X^{2}] = ' + qt(EX2) + '$ (integrate $x f(x)$ and $x^{2} f(x)$).', '$E[(X - ' + c5 + ')^{2}] = ' + qt(EX2) + ' - ' + 2 * c5 + ' \\cdot ' + qt(EX) + ' + ' + c5 * c5 + ' = ' + qt(E5) + '$.'],
        hint: 'Expand the square and use linearity.' }, { kind: 'shift2', poly: Df.poly.map(qp), b: Df.b, c: c5 }); }
    var a2 = R.pick([1, 2, 3, 4]);
    return chk({ q: '$X$ is uniform on $[0, ' + a2 + ']$. Find $E\\left[e^{X}\\right]$ (exact, or a decimal to 3 places).', a: tol('(e^' + a2 + '-1)/' + a2),
      steps: ['$f(x) = \\frac{1}{' + a2 + '}$ on $[0, ' + a2 + ']$.', '$E[e^{X}] = \\int_{0}^{' + a2 + '} e^{x}\\cdot\\frac{1}{' + a2 + '}\\,dx = \\frac{e^{' + a2 + '} - 1}{' + a2 + '} \\approx ' + ((M.exp(a2) - 1) / a2).toFixed(4) + '$.', 'Compare $e^{E[X]} = e^{' + num(a2 / 2) + '} \\approx ' + M.exp(a2 / 2).toFixed(4) + '$: smaller, as it must be for a curve that bends upward.'],
      hint: 'Integrate e^x times the density.' }, { kind: 'expo', a: a2 });
  });

  var EXPO = [
    { s: 'The lifetime of a light bulb is exponential with mean {m} hours.', u: 'hours', ms: [500, 800, 1000, 1200, 2000] },
    { s: 'The time until the next bus arrives is exponential with mean {m} minutes.', u: 'minutes', ms: [5, 8, 10, 12, 15, 20] },
    { s: 'The time between calls at a help desk is exponential with mean {m} minutes.', u: 'minutes', ms: [2, 4, 5, 6, 10] }
  ];
  G('prob.exponential', function (R, ctx) {
    var shape = by(ctx, R.pick(['more', 'less']), R.pick(['memory', 'between', 'median']), R.pick(['outlast', 'frommedian', 'moments']));
    var E = R.pick(EXPO), m = R.pick(E.ms), setup = E.s.replace('{m}', m), r = R.pick([q(1, 2), Q(1), q(3, 2), Q(2), q(1, 4), q(1, 5)]), t = r.mul(m), rT = lamP(r), rTex = lamT(r);
    if (shape === 'more' || shape === 'less') {
      var more = shape === 'more';
      return chk({ q: setup + ' What is the probability that it ' + (E.u === 'hours' ? (more ? 'lasts more than ' : 'fails within ') : (more ? 'takes more than ' : 'takes at most ')) + t.toPlain() + ' ' + E.u + '? (Exact, or a decimal to 3 places.)', a: tol(more ? 'e^(-' + rT + ')' : '1-e^(-' + rT + ')'),
        steps: ['The rate is $\\lambda = \\frac{1}{\\text{mean}} = \\frac{1}{' + m + '}$ per ' + E.u.replace(/s$/, '') + ' (not ' + m + ').', '$P(X > t) = e^{-\\lambda t} = e^{-' + t.toPlain() + '/' + m + '} = e^{-' + rTex + '}$.', more ? '$\\approx ' + M.exp(-r.toNumber()).toFixed(4) + '$.' : '$P(X \\le ' + t.toPlain() + ') = 1 - e^{-' + rTex + '} \\approx ' + (1 - M.exp(-r.toNumber())).toFixed(4) + '$.'],
        hint: 'λ = 1/mean, and P(X > t) = e^(−λt).' }, { kind: shape, m: m, t: t.toNumber() });
    }
    if (shape === 'memory') { var s = R.pick([q(1, 2), Q(1), Q(2), q(3, 2)]).mul(m);
      return chk({ q: setup + ' It has already ' + (E.u === 'hours' ? 'lasted ' : 'taken ') + s.toPlain() + ' ' + E.u + '. What is the probability that it ' + (E.u === 'hours' ? 'lasts' : 'takes') + ' at least ' + t.toPlain() + ' more ' + E.u + '? (Exact, or a decimal to 3 places.)', a: tol('e^(-' + rT + ')'),
        steps: ['$P(X > s + t \\mid X > s) = \\dfrac{e^{-\\lambda(s + t)}}{e^{-\\lambda s}} = e^{-\\lambda t}$: the exponential distribution has no memory.', 'So the ' + s.toPlain() + ' ' + E.u + ' already passed do not matter: $e^{-' + t.toPlain() + '/' + m + '} = e^{-' + rTex + '} \\approx ' + M.exp(-r.toNumber()).toFixed(4) + '$.'],
        hint: 'What already happened does not change the exponential\'s future.' }, { kind: 'memory', m: m, t: t.toNumber() }); }
    if (shape === 'between') { var r2 = r.add(R.pick([q(1, 2), Q(1)])), t2 = r2.mul(m);
      return chk({ q: setup + ' What is the probability that it ' + (E.u === 'hours' ? 'fails' : 'happens') + ' between ' + t.toPlain() + ' and ' + t2.toPlain() + ' ' + E.u + '? (Exact, or a decimal to 3 places.)', a: tol('e^(-' + rT + ')-e^(-' + lamP(r2) + ')'),
        steps: ['$P(a < X < b) = P(X > a) - P(X > b) = e^{-\\lambda a} - e^{-\\lambda b}$ with $\\lambda = \\frac{1}{' + m + '}$.', '$= e^{-' + rTex + '} - e^{-' + lamT(r2) + '} \\approx ' + (M.exp(-r.toNumber()) - M.exp(-r2.toNumber())).toFixed(4) + '$.'],
        hint: 'Subtract two tail probabilities.' }, { kind: 'between', m: m, a: t.toNumber(), b: t2.toNumber() }); }
    if (shape === 'median') return chk({ q: setup + ' Find the median of the distribution, in ' + E.u + ' (exact, or a decimal to 3 places).', a: tol(m + '*ln(2)', 0.0005 * m),
      steps: ['The median $x$ has $P(X > x) = \\frac{1}{2}$: $e^{-x/' + m + '} = \\frac{1}{2}$.', '$x = ' + m + '\\ln 2 \\approx ' + (m * M.LN2).toFixed(3) + '$ ' + E.u + ', less than the mean ' + m + ': many short values and a few long ones.'],
      hint: 'Solve e^(−λx) = 1/2.' }, { kind: 'median', m: m });
    if (shape === 'outlast') return chk({ q: setup + ' What fraction of the time does it ' + (E.u === 'hours' ? 'outlast' : 'take longer than') + ' its mean? (Exact, or a decimal to 3 places.)', a: tol('e^(-1)'),
      steps: ['$P(X > \\text{mean}) = e^{-\\lambda \\cdot \\frac{1}{\\lambda}} = e^{-1}$, whatever the mean.', '$e^{-1} \\approx 0.3679$: only about 37% last longer than average, because a few very long times pull the mean up.'],
      hint: 'Put t = 1/λ into e^(−λt).' }, { kind: 'outlast' });
    if (shape === 'frommedian') { var md = R.pick([3, 5, 10, 20, 50]);
      return chk({ q: 'A waiting time is exponential, and half of all waits are longer than ' + md + ' minutes. What is the mean wait, in minutes? (Exact, or a decimal to 2 places.)', a: tol(md + '/ln(2)', 0.005),
        steps: ['$P(X > ' + md + ') = e^{-\\lambda \\cdot ' + md + '} = \\frac{1}{2}$, so $\\lambda = \\dfrac{\\ln 2}{' + md + '}$.', 'Mean $= \\frac{1}{\\lambda} = \\dfrac{' + md + '}{\\ln 2} \\approx ' + (md / M.LN2).toFixed(3) + '$ minutes.'],
        hint: 'The median of an exponential is ln 2 / λ.' }, { kind: 'frommedian', md: md }); }
    var lam = R.pick([q(1, 2), Q(2), Q(3), q(1, 4), q(1, 5), Q(4)]);
    return chk({ q: '$X$ is exponential with rate $\\lambda = ' + qt(lam) + '$. Find (a) its standard deviation and (b) $E[X^{2}]$.', a: { t: 'multi', parts: [{ label: '(a)', a: ex(lam.inv()) }, { label: '(b)', a: ex(Q(2).div(lam.pow(2))) }] },
      steps: ['For the exponential, $E[X] = \\frac{1}{\\lambda}$ and $\\operatorname{Var}(X) = \\frac{1}{\\lambda^{2}}$ (integrate by parts).', '(a) $\\operatorname{SD}(X) = \\frac{1}{\\lambda} = ' + qt(lam.inv()) + '$, the same as the mean.', '(b) $E[X^{2}] = \\operatorname{Var}(X) + (E[X])^{2} = \\frac{2}{\\lambda^{2}} = ' + qt(Q(2).div(lam.pow(2))) + '$.'],
      hint: 'The exponential\'s SD equals its mean.' }, { kind: 'moments', lam: qp(lam) });
  });

  G('prob.poisson-process', function (R, ctx) {
    var shape = by(ctx, 'count', R.pick(['first', 'kth', 'gapcount']), R.pick(['given', 'given', 'gapcount']));
    var rate = R.pick([2, 3, 4, 6, 12]), unit = R.pick([['per hour', 'minutes', 60, 'hour'], ['per minute', 'seconds', 60, 'minute']]);
    var who = R.pick(['Customers arrive at a shop', 'Cars pass a checkpoint', 'Messages arrive at a server']);
    var setup = who + ' as a Poisson process at rate ' + rate + ' ' + unit[0] + '. ';
    if (shape === 'count') {
      var len = R.pick([10, 15, 20, 30, 40, 45]), m = q(rate * len, unit[2]); if (m.gt(6)) { len = 10; m = q(rate * len, unit[2]); }
      var k = pickK(R, m, 4), Ex = poisExpr(k, m);
      return chk({ q: setup + 'Find the probability of exactly ' + k + ' arrivals in a ' + len + '-' + unit[1].replace(/s$/, '') + ' window. (Exact, or a decimal to 3 places.)', a: tol(Ex.plain),
        steps: ['The count in a window of length $t$ is Poisson with mean $\\lambda t$.', '$t = \\frac{' + len + '}{' + unit[2] + '}$ ' + unit[3] + ', so $\\lambda t = ' + rate + ' \\cdot \\frac{' + len + '}{' + unit[2] + '} = ' + lamT(m) + '$.', '$P(N = ' + k + ') = e^{-' + lamT(m) + '}\\dfrac{' + par(lamT(m)) + '^{' + k + '}}{' + k + '!} \\approx ' + Ex.val.toFixed(4) + '$.'],
        hint: 'The mean count is the rate times the window length, in matching units.' }, { kind: 'count', m: m.toNumber(), k: k });
    }
    if (shape === 'first') { var len2 = R.pick([5, 10, 15, 20, 30]), m2 = q(rate * len2, unit[2]); if (m2.gt(4)) { len2 = 10; m2 = q(rate * len2, unit[2]); }
      return chk({ q: setup + 'Starting now, what is the probability that the first arrival comes after more than ' + len2 + ' ' + unit[1] + '? (Exact, or a decimal to 3 places.)', a: tol('e^(-' + lamP(m2) + ')'),
        steps: ['"The first arrival comes after ' + len2 + ' ' + unit[1] + '" is the same event as "no arrivals in the first ' + len2 + ' ' + unit[1] + '".', 'That count is Poisson with mean $' + lamT(m2) + '$, so $P(N = 0) = e^{-' + lamT(m2) + '} \\approx ' + M.exp(-m2.toNumber()).toFixed(4) + '$.', 'Equivalently, the waiting time is exponential with rate ' + rate + ' ' + unit[0] + ': $P(W > t) = e^{-\\lambda t}$.'],
        hint: 'No arrivals in the window means the first arrival is later.' }, { kind: 'first', m: m2.toNumber() }); }
    if (shape === 'kth') { var kk = R.int(2, 6), mean = q(kk * unit[2], rate);
      return chk({ q: setup + 'Starting now, what is the expected waiting time, in ' + unit[1] + ', until the ' + U.ordinal(kk) + ' arrival?', a: ex(mean),
        steps: ['The gaps between arrivals are independent exponential times with mean $\\frac{1}{\\lambda} = \\frac{1}{' + rate + '}$ ' + unit[3] + ' $= ' + qt(q(unit[2], rate)) + '$ ' + unit[1] + '.', 'The ' + U.ordinal(kk) + ' arrival time is the sum of ' + kk + ' gaps; by linearity, its mean is $' + kk + ' \\cdot ' + qt(q(unit[2], rate)) + ' = ' + qt(mean) + '$ ' + unit[1] + '.'],
        hint: 'Add the expected gaps.' }, { kind: 'kth', rate: rate, k: kk, per: unit[2] }); }
    if (shape === 'gapcount') { var a1 = R.pick([5, 10]), b1 = R.pick([10, 15, 20]), ma = q(rate * a1, unit[2]), mb = q(rate * b1, unit[2]); if (mb.gt(4)) { b1 = 10; mb = q(rate * b1, unit[2]); } if (ma.gt(3)) { a1 = 5; ma = q(rate * a1, unit[2]); } var j = pickK(R, mb, 3), Ej = poisExpr(j, mb);
      return chk({ q: setup + 'What is the probability of no arrivals in the next ' + a1 + ' ' + unit[1] + ' and then exactly ' + j + ' in the ' + b1 + ' ' + unit[1] + ' after that? (Exact, or a decimal to 3 places.)', a: tol('e^(-' + lamP(ma) + ')*' + Ej.plain),
        steps: ['Counts in non-overlapping windows of a Poisson process are independent, so multiply.', 'First window: Poisson with mean $' + lamT(ma) + '$; $P(0) = e^{-' + lamT(ma) + '}$.', 'Second window: Poisson with mean $' + lamT(mb) + '$; $P(' + j + ') = ' + Ej.tex + '$.', 'Product: $\\approx ' + (M.exp(-ma.toNumber()) * Ej.val).toFixed(4) + '$.'],
        hint: 'Non-overlapping windows are independent.' }, { kind: 'gapcount', ma: ma.toNumber(), mb: mb.toNumber(), j: j }); }
    var n = R.int(3, 6), sfr = R.pick([q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4)]), jj = R.int(1, n - 1), Tlen = R.pick([1, 2]), sLen = sfr.mul(Tlen * unit[2]);
    var pv = Cq(n, jj).mul(sfr.pow(jj)).mul(Q(1).sub(sfr).pow(n - jj));
    return chk({ q: setup + 'Exactly ' + n + ' arrivals happened during one ' + (Tlen === 1 ? unit[3] : Tlen + '-' + unit[3] + ' period') + '. Given that, what is the probability that exactly ' + jj + ' of them came in the first ' + sLen.toPlain() + ' ' + unit[1] + '?', a: ex(pv),
      steps: ['Given $N = ' + n + '$ arrivals in the period, the arrival times are like ' + n + ' independent uniform points in it (the rate drops out).', 'Each falls in the first ' + sLen.toPlain() + ' ' + unit[1] + ' with probability $' + qt(sfr) + '$ (that part\'s share of the period).', 'So the count there is binomial: $\\binom{' + n + '}{' + jj + '}\\left(' + qt(sfr) + '\\right)^{' + jj + '}\\left(' + qt(Q(1).sub(sfr)) + '\\right)^{' + (n - jj) + '} = ' + qt(pv) + '$.'],
      hint: 'Given the total, each arrival lands in a part with probability equal to that part\'s share of the time.' }, { kind: 'given', n: n, j: jj, s: qp(sfr) });
  });

  G('prob.transform-density', function (R, ctx) {
    var shape = by(ctx, 'linear', 'unif', R.pick(['twoone', 'twoone', 'unif']));
    if (shape === 'linear') {
      var base = R.pick([{ t: '2x', p: P([0, 2]) }, { t: '3x^{2}', p: P([0, 0, 3]) }, { t: '1', p: P([1]) }, { t: '2(1 - x)', p: P([2, -2]) }, { t: '4x^{3}', p: P([0, 0, 0, 4]) }]);
      var a = R.pick([2, 3, 4, -2, -3, 5, 10]), b = R.int(-5, 6), lo = M.min(b, a + b), hi = M.max(b, a + b);
      var y0 = Q(lo).add(q((hi - lo) * R.int(1, 3), 4)), x0 = y0.sub(b).div(a), v = peval(base.p, x0).div(M.abs(a)), ym = b === 0 ? 'y' : 'y ' + (b > 0 ? '- ' + b : '+ ' + (-b));
      return chk({ q: '$X$ has density $f_X(x) = ' + base.t + '$ for $0 \\le x \\le 1$ (and 0 otherwise). Let $Y = ' + T.lin(a, 'X', b) + '$. Find $f_Y(' + qt(y0) + ')$.', a: ex(v),
        steps: ['$Y$ runs over $[' + lo + ', ' + hi + ']$. Through the CDF: $F_Y(y) = P(' + T.lin(a, 'X', b) + ' \\le y) = ' + (a > 0 ? 'F_X\\left(\\frac{' + ym + '}{' + a + '}\\right)' : '1 - F_X\\left(\\frac{' + ym + '}{' + a + '}\\right)') + '$' + (a < 0 ? ' (dividing by a negative flips the inequality).' : '.'), 'Differentiate with the chain rule: $f_Y(y) = f_X\\left(\\frac{' + ym + '}{' + a + '}\\right) \\cdot \\frac{1}{' + M.abs(a) + '}$. The factor $\\frac{1}{' + M.abs(a) + '}$ keeps the total area 1.', 'At $y = ' + qt(y0) + '$: $x = ' + qt(x0) + '$ and $f_Y = ' + qt(peval(base.p, x0)) + ' \\cdot \\frac{1}{' + M.abs(a) + '} = ' + qt(v) + '$.'],
        hint: 'Write F_Y in terms of F_X, then differentiate; do not forget the 1/|a|.' }, { kind: 'linear', base: base.p.map(qp), a: a, b: b, y: qp(y0) });
    }
    if (shape === 'unif') {
      var C = R.pick([
        { g: 'X^{2}', dom: '0 < y < 1', v: '1/(2*sqrt(y))', st: ['$F_Y(y) = P(X^{2} \\le y) = P(X \\le \\sqrt{y}) = \\sqrt{y}$ for $0 < y < 1$.', '$f_Y(y) = \\frac{d}{dy}\\sqrt{y} = \\dfrac{1}{2\\sqrt{y}}$.', 'It is large near 0: squaring squeezes the small values of $X$ together.'] },
        { g: '\\sqrt{X}', dom: '0 < y < 1', v: '2*y', st: ['$F_Y(y) = P(\\sqrt{X} \\le y) = P(X \\le y^{2}) = y^{2}$ for $0 < y < 1$.', '$f_Y(y) = 2y$.'] },
        { g: 'X^{3}', dom: '0 < y < 1', v: '1/(3*y^(2/3))', st: ['$F_Y(y) = P(X^{3} \\le y) = P(X \\le y^{1/3}) = y^{1/3}$ for $0 < y < 1$.', '$f_Y(y) = \\frac{1}{3}y^{-2/3} = \\dfrac{1}{3y^{2/3}}$.'] },
        { g: '-\\ln X', dom: 'y > 0', v: 'e^(-y)', st: ['$-\\ln X \\le y$ means $\\ln X \\ge -y$, that is $X \\ge e^{-y}$.', '$F_Y(y) = P(X \\ge e^{-y}) = 1 - e^{-y}$ for $y > 0$.', '$f_Y(y) = e^{-y}$: an exponential with rate 1.'] },
        { g: 'e^{X}', dom: '1 < y < e', v: '1/y', st: ['$F_Y(y) = P(e^{X} \\le y) = P(X \\le \\ln y) = \\ln y$ for $1 < y < e$.', '$f_Y(y) = \\dfrac{1}{y}$.'] },
        { g: '2X + 1', dom: '1 < y < 3', v: '1/2', st: ['$F_Y(y) = P(2X + 1 \\le y) = P\\left(X \\le \\frac{y - 1}{2}\\right) = \\frac{y - 1}{2}$ for $1 < y < 3$.', '$f_Y(y) = \\frac{1}{2}$: still uniform, but spread over an interval twice as long, so half as tall.'] }
      ]);
      return chk({ q: '$X$ is uniform on $[0, 1]$, and $Y = ' + C.g + '$. Find the density $f_Y(y)$ for $' + C.dom + '$.', a: { t: 'expr', v: C.v, vars: ['y'] },
        steps: ['Work through the CDF: write $F_Y(y) = P(Y \\le y)$ as a statement about $X$, then differentiate.'].concat(C.st),
        hint: 'Start from F_Y(y) = P(Y ≤ y) and solve the inequality for X.' }, { kind: 'unif', g: C.g, v: C.v });
    }
    if (R.coin()) return chk({ q: '$X$ is uniform on $[-1, 1]$, and $Y = X^{2}$. Find the density $f_Y(y)$ for $0 < y < 1$.', a: { t: 'expr', v: '1/(2*sqrt(y))', vars: ['y'] },
      steps: ['Two values of $X$ give each $y$: $\\pm\\sqrt{y}$. Through the CDF: $F_Y(y) = P(-\\sqrt{y} \\le X \\le \\sqrt{y}) = \\dfrac{2\\sqrt{y}}{2} = \\sqrt{y}$.', '$f_Y(y) = \\dfrac{1}{2\\sqrt{y}}$.', 'Check by the strip rule: each of the two preimages contributes $\\dfrac{f_X(\\pm\\sqrt{y})}{|2x|} = \\dfrac{1/2}{2\\sqrt{y}}$, and together they give $\\dfrac{1}{2\\sqrt{y}}$.'],
      hint: 'Both √y and −√y square to y.' }, { kind: 'sym' });
    var y0s = R.pick([q(1, 4), q(1, 9), q(4, 9), q(9, 4), q(16, 9), q(9, 16), q(25, 16)]), r = y0s.num(), sq2 = { 1: 1, 4: 2, 9: 3, 16: 4, 25: 5 }, rt = q(sq2[y0s.num()], sq2[y0s.den()]), two = rt.lt(1);
    var v2 = two ? Q(2).mul(q(1, 3)).div(rt.mul(2)) : q(1, 3).div(rt.mul(2));
    return chk({ q: '$X$ is uniform on $[-1, 2]$, and $Y = X^{2}$. Find $f_Y(' + qt(y0s) + ')$.', a: ex(v2),
      steps: ['$f_X = \\frac{1}{3}$ on $[-1, 2]$. The values of $x$ with $x^{2} = ' + qt(y0s) + '$ are $\\pm' + qt(rt) + '$; ' + (two ? 'both lie in $[-1, 2]$.' : 'only $' + qt(rt) + '$ lies in $[-1, 2]$.'), 'Each preimage contributes $\\dfrac{f_X(x)}{|g\'(x)|} = \\dfrac{1/3}{2 \\cdot ' + qt(rt) + '}$.', 'So $f_Y(' + qt(y0s) + ') = ' + (two ? '2 \\cdot ' : '') + '\\dfrac{1/3}{' + qt(rt.mul(2)) + '} = ' + qt(v2) + '$.' + (two ? '' : ' (Above $y = 1$ only positive $x$ can produce $y$, so the density drops.)')],
      hint: 'Find every x that maps to y, and add f_X(x)/|g′(x)| over them.' }, { kind: 'twoone', y: qp(y0s) });
  });


  // ================================================================ Unit 5: Joint Distributions
  function jointTab(xs, ys, cells, nx, ny) { // cells[i][j] = P(X = xs[j], Y = ys[i]); Q values or strings
    nx = nx || 'X'; ny = ny || 'Y';
    return table([''].concat(xs.map(function (x) { return '$' + nx + ' = ' + x + '$'; })), ys.map(function (y, i) { return ['$' + ny + ' = ' + y + '$'].concat(cells[i].map(function (c) { return '$' + (typeof c === 'string' ? c : qt(c)) + '$'; })); }));
  }
  function randJoint(R, opts) { // a joint table with small denominators; some cells may be 0
    opts = opts || {}; var xs = opts.xs || R.pick([[0, 1, 2], [1, 2, 3], [0, 1, 2]]), ys = opts.ys || R.pick([[0, 1], [1, 2], [0, 1, 2]]), D = opts.D || R.pick([12, 16, 20, 24]), n = xs.length * ys.length, w;
    do { w = []; var left = D; for (var i = 0; i < n - 1; i++) { var v = R.int(0, M.max(1, M.ceil(2.3 * D / n))); v = M.min(v, left); w.push(v); left -= v; } w.push(left); } while (w[n - 1] > M.ceil(2.5 * D / n) || w.filter(function (x) { return x === 0; }).length > 2);
    w = R.shuffle(w); var cells = ys.map(function (_, i) { return xs.map(function (_, j) { return q(w[i * xs.length + j], D); }); });
    return { xs: xs, ys: ys, cells: cells };
  }
  function margX(J) { return J.xs.map(function (_, j) { return sumQ(J.cells.map(function (r) { return r[j]; })); }); }
  function margY(J) { return J.cells.map(function (r) { return sumQ(r); }); }
  function jplain(J) { return { xs: J.xs, ys: J.ys, cells: J.cells.map(function (r) { return r.map(qp); }) }; }

  function GL(id, fn) { G(id, function (R, ctx) { return nl(fn(R, ctx)); }); }   // table sums list zero cells on purpose
  GL('prob.joint-pmf', function (R, ctx) {
    var shape = by(ctx, 'marg', R.pick(['sum', 'compare', 'margY']), R.pick(['missing', 'meanX']));
    var J = randJoint(R), xs = J.xs, ys = J.ys, mx = margX(J), my = margY(J), tb = jointTab(xs, ys, J.cells);
    var intro = 'The table gives the joint pmf $P(X = x, Y = y)$.' + tb;
    if (shape === 'marg' || shape === 'margY') {
      var useX = shape === 'marg' ? R.chance(0.7) : false, j = R.int(0, (useX ? xs : ys).length - 1), v = useX ? mx[j] : my[j];
      return chk({ q: intro + 'Find $P(' + (useX ? 'X = ' + xs[j] : 'Y = ' + ys[j]) + ')$.', a: ex(v),
        steps: ['$' + (useX ? 'X = ' + xs[j] : 'Y = ' + ys[j]) + '$ happens together with every value of $' + (useX ? 'Y' : 'X') + '$: those are disjoint cases, so add them.', 'Add the ' + (useX ? 'column' : 'row') + ': $' + (useX ? J.cells.map(function (r) { return qt(r[j]); }) : J.cells[j].map(qt)).join(' + ') + ' = ' + qt(v) + '$.', 'One cell alone is a joint probability; the marginal is the whole ' + (useX ? 'column' : 'row') + '.'],
        hint: 'Add every cell in that ' + (useX ? 'column' : 'row') + '.' }, { kind: 'marg', J: jplain(J), useX: useX, j: j });
    }
    if (shape === 'sum' || shape === 'compare') {
      var ev = shape === 'sum' ? R.pick([['X + Y \\le ' , 'le'], ['X + Y = ', 'eq']]) : R.pick([['X > Y', 'gt'], ['X = Y', 'same'], ['X < Y', 'lt']]), kk = xs[1] + ys[ys.length - 1] - 1 + R.int(0, 1);
      var test = function (x, y) { return ev[1] === 'le' ? x + y <= kk : ev[1] === 'eq' ? x + y === kk : ev[1] === 'gt' ? x > y : ev[1] === 'lt' ? x < y : x === y; };
      var cellsIn = [], v2 = Q(0); ys.forEach(function (y, i) { xs.forEach(function (x, j2) { if (test(x, y)) { cellsIn.push('(' + x + ', ' + y + ')'); v2 = v2.add(J.cells[i][j2]); } }); });
      var evT = shape === 'sum' ? ev[0] + kk : ev[0];
      return chk(nl({ q: intro + 'Find $P(' + evT + ')$.', a: ex(v2),
        steps: ['List the cells $(x, y)$ where $' + evT + '$: ' + (cellsIn.length ? cellsIn.join(', ') : 'none') + '.', 'Add their probabilities: $' + (cellsIn.length ? ys.map(function (y, i) { return xs.map(function (x, j2) { return test(x, y) ? qt(J.cells[i][j2]) : null; }).filter(Boolean).join(' + '); }).filter(Boolean).join(' + ') : '0') + ' = ' + qt(v2) + '$.'],
        hint: 'Mark every cell where the event holds, then add.' }), { kind: 'event', J: jplain(J), ev: ev[1], k: kk });
    }
    if (shape === 'meanX') { var EX = sumQ(xs.map(function (x, j3) { return Q(x).mul(mx[j3]); }));
      return chk(nl({ q: intro + 'Find $E[X]$.', a: ex(EX),
        steps: ['First the marginal pmf of $X$ (column totals): ' + xs.map(function (x, j3) { return '$P(X = ' + x + ') = ' + qt(mx[j3]) + '$'; }).join(', ') + '.', '$E[X] = ' + xs.map(function (x, j3) { return x + ' \\cdot ' + qt(mx[j3]); }).join(' + ') + ' = ' + qt(EX) + '$.'],
        hint: 'Get the marginal of X first.' }), { kind: 'meanX', J: jplain(J) }); }
    var mi = R.int(0, ys.length - 1), mj = R.int(0, xs.length - 1), shown = J.cells.map(function (r, i) { return r.map(function (c, j4) { return i === mi && j4 === mj ? '?' : c; }); });
    var other = R.coin(), giv = other ? 'P(X = ' + xs[mj] + ') = ' + qt(mx[mj]) : 'P(Y = ' + ys[mi] + ') = ' + qt(my[mi]);
    return chk({ q: 'The table gives a joint pmf with one cell missing, and $' + giv + '$. Find the missing cell.' + jointTab(xs, ys, shown), a: ex(J.cells[mi][mj]),
      steps: ['The ' + (other ? 'column' : 'row') + ' containing the missing cell adds to the marginal $' + giv + '$.', 'Missing cell $= ' + qt(other ? mx[mj] : my[mi]) + ' - (' + (other ? J.cells.map(function (r, i) { return i === mi ? null : qt(r[mj]); }) : J.cells[mi].map(function (c, j4) { return j4 === mj ? null : qt(c); })).filter(function (x) { return x !== null; }).join(' + ') + ') = ' + qt(J.cells[mi][mj]) + '$.', 'Check: all the cells now add to 1.'],
      hint: 'A row or column of a joint table adds to a marginal.' }, { kind: 'missing', J: jplain(J), i: mi, j: mj, other: other });
  });

  function indepJoint(R) { // independent table from marginals, then maybe disturb a 2x2 block (marginals unchanged)
    var px = R.pick([[q(1, 4), q(1, 2), q(1, 4)], [q(1, 3), q(1, 3), q(1, 3)], [q(1, 2), q(1, 4), q(1, 4)], [q(1, 6), q(1, 3), q(1, 2)], [q(1, 5), q(2, 5), q(2, 5)]]), py = R.pick([[q(1, 2), q(1, 2)], [q(1, 3), q(2, 3)], [q(1, 4), q(3, 4)], [q(2, 5), q(3, 5)]]);
    var xs = [0, 1, 2], ys = [0, 1], cells = py.map(function (b) { return px.map(function (a) { return a.mul(b); }); });
    return { xs: xs, ys: ys, cells: cells, px: px, py: py };
  }
  GL('prob.conditional-distributions', function (R, ctx) {
    var shape = by(ctx, 'cond', R.pick(['indep', 'condvec']), R.pick(['reverse', 'total', 'indep']));
    if (shape === 'cond' || shape === 'condvec') {
      var J = randJoint(R, { ys: R.pick([[0, 1], [1, 2]]) }), my = margY(J), i = R.int(0, J.ys.length - 1); while (my[i].isZero()) i = (i + 1) % J.ys.length;
      var row = J.cells[i].map(function (c) { return c.div(my[i]); }), tb = jointTab(J.xs, J.ys, J.cells);
      if (shape === 'cond') { var j = R.int(0, J.xs.length - 1);
        return chk({ q: 'The table gives the joint pmf of $X$ and $Y$.' + tb + 'Find $P(X = ' + J.xs[j] + ' \\mid Y = ' + J.ys[i] + ')$.', a: ex(row[j]),
          steps: ['Given $Y = ' + J.ys[i] + '$, only that row is possible. Its total is $P(Y = ' + J.ys[i] + ') = ' + J.cells[i].map(qt).join(' + ') + ' = ' + qt(my[i]) + '$.', '$P(X = ' + J.xs[j] + ' \\mid Y = ' + J.ys[i] + ') = \\dfrac{P(X = ' + J.xs[j] + ', Y = ' + J.ys[i] + ')}{P(Y = ' + J.ys[i] + ')} = \\dfrac{' + qt(J.cells[i][j]) + '}{' + qt(my[i]) + '} = ' + qt(row[j]) + '$.'],
          hint: 'Divide the cell by its row total.' }, { kind: 'cond', J: jplain(J), i: i, j: j }); }
      return chk({ q: 'The table gives the joint pmf of $X$ and $Y$.' + tb + 'Find the conditional distribution of $X$ given $Y = ' + J.ys[i] + '$, as the list $\\left(' + J.xs.map(function (x) { return 'P(X = ' + x + ' \\mid Y = ' + J.ys[i] + ')'; }).join(',\\ ') + '\\right)$.', a: { t: 'tuple', v: row.map(qp) },
        steps: ['Take the row $Y = ' + J.ys[i] + '$ and divide each cell by the row total $' + qt(my[i]) + '$.', 'Result: $' + vecTex(row) + '$, which adds to 1, as a distribution must.'],
        hint: 'Rescale the row so it adds to 1.' }, { kind: 'condvec', J: jplain(J), i: i });
    }
    if (shape === 'indep') {
      var I = indepJoint(R), dep = R.coin(), cells = I.cells.map(function (r) { return r.slice(); }), aj = 0, bj = 1;
      if (dep) { var eps = R.pick([q(1, 24), q(1, 36), q(1, 30), q(1, 20), q(1, 12)]); aj = R.int(0, 1); bj = R.int(aj + 1, 2);
        if (cells[0][aj].sub(eps).lt(0) || cells[1][bj].sub(eps).lt(0)) eps = Q.min(cells[0][aj], cells[1][bj]).div(2);
        cells[0][aj] = cells[0][aj].sub(eps); cells[1][bj] = cells[1][bj].sub(eps); cells[0][bj] = cells[0][bj].add(eps); cells[1][aj] = cells[1][aj].add(eps); }
      var trapJ = [0, 1, 2].filter(function (j5) { return j5 !== aj && j5 !== bj; })[0], ti = R.int(0, 1);
      if (!dep) trapJ = R.int(0, 2);
      var prod = I.px[trapJ].mul(I.py[ti]), bad = null;
      if (dep) { bad = [0, aj]; }
      return chk({ q: 'The table gives the joint pmf of $X$ and $Y$.' + jointTab(I.xs, I.ys, cells) + '(a) Find $P(X = ' + I.xs[trapJ] + ')\\,P(Y = ' + I.ys[ti] + ')$. (b) True or false: $X$ and $Y$ are independent.',
        a: { t: 'multi', parts: [{ label: '(a)', a: ex(prod) }, { label: '(b)', a: { t: 'tf', v: !dep } }] },
        steps: ['Marginals: $P(X = x)$: ' + I.px.map(qt).join(', ') + '; $P(Y = y)$: ' + I.py.map(qt).join(', ') + '.', '(a) $' + qt(I.px[trapJ]) + ' \\cdot ' + qt(I.py[ti]) + ' = ' + qt(prod) + '$, which ' + (cells[ti][trapJ].eq(prod) ? 'equals' : 'differs from') + ' the cell $' + qt(cells[ti][trapJ]) + '$.', dep ? '(b) But the cell $X = ' + I.xs[aj] + ', Y = ' + I.ys[0] + '$ holds $' + qt(cells[0][aj]) + '$, while $P(X = ' + I.xs[aj] + ')P(Y = ' + I.ys[0] + ') = ' + qt(I.px[aj].mul(I.py[0])) + '$. One cell that fails is enough: <b>false</b>, they are dependent.' : '(b) Every one of the 6 cells equals the product of its marginals, so <b>true</b>: independent.', 'Checking one cell is never enough to show independence; every cell must factor.'],
        hint: 'Independence needs P(X = x, Y = y) = P(X = x)P(Y = y) in every cell.' }, { kind: 'indep', cells: cells.map(function (r) { return r.map(qp); }), tj: trapJ, ti: ti });
    }
    // reverse / total: Y has a distribution, X given Y has a table of conditional probabilities
    var py2 = R.pick([[q(1, 2), q(1, 2)], [q(1, 3), q(2, 3)], [q(1, 4), q(3, 4)], [q(2, 5), q(3, 5)]]), cond = [R.pick([[q(1, 2), q(1, 4), q(1, 4)], [q(1, 3), q(1, 3), q(1, 3)], [q(1, 6), q(1, 2), q(1, 3)]]), R.pick([[q(1, 4), q(1, 4), q(1, 2)], [q(1, 2), q(1, 3), q(1, 6)], [q(1, 5), q(2, 5), q(2, 5)]])];
    var jx = R.int(0, 2), px2 = py2[0].mul(cond[0][jx]).add(py2[1].mul(cond[1][jx]));
    var ctab = table(['', '$x = 0$', '$x = 1$', '$x = 2$'], [0, 1].map(function (yy) { return ['$P(X = x \\mid Y = ' + yy + ')$'].concat(cond[yy].map(function (c) { return '$' + qt(c) + '$'; })); }));
    var base = '$P(Y = 0) = ' + qt(py2[0]) + '$ and $P(Y = 1) = ' + qt(py2[1]) + '$. The conditional distributions of $X$ given $Y$ are:' + ctab;
    if (shape === 'total') return chk({ q: base + 'Find $P(X = ' + jx + ')$.', a: ex(px2),
      steps: ['Joint cells: $P(X = ' + jx + ', Y = y) = P(X = ' + jx + ' \\mid Y = y)\\,P(Y = y)$.', '$P(X = ' + jx + ') = ' + qt(cond[0][jx]) + ' \\cdot ' + qt(py2[0]) + ' + ' + qt(cond[1][jx]) + ' \\cdot ' + qt(py2[1]) + ' = ' + qt(px2) + '$.'],
      hint: 'Build the joint cells, then add the column.' }, { kind: 'total', py: py2.map(qp), cond: cond.map(function (r) { return r.map(qp); }), j: jx });
    var post = py2[1].mul(cond[1][jx]).div(px2);
    return chk({ q: base + 'Find $P(Y = 1 \\mid X = ' + jx + ')$.', a: ex(post),
      steps: ['Joint cells in the column $X = ' + jx + '$: $P(X = ' + jx + ', Y = 0) = ' + qt(cond[0][jx]) + ' \\cdot ' + qt(py2[0]) + ' = ' + qt(cond[0][jx].mul(py2[0])) + '$ and $P(X = ' + jx + ', Y = 1) = ' + qt(cond[1][jx]) + ' \\cdot ' + qt(py2[1]) + ' = ' + qt(cond[1][jx].mul(py2[1])) + '$.', 'Column total: $P(X = ' + jx + ') = ' + qt(px2) + '$.', '$P(Y = 1 \\mid X = ' + jx + ') = \\dfrac{' + qt(cond[1][jx].mul(py2[1])) + '}{' + qt(px2) + '} = ' + qt(post) + '$.'],
      hint: 'Build the column of joint cells, then divide by its total.' }, { kind: 'reverse', py: py2.map(qp), cond: cond.map(function (r) { return r.map(qp); }), j: jx });
  });

  G('prob.geometric-probability', function (R, ctx) {
    var shape = by(ctx, 'square', R.pick(['meet', 'square']), R.pick(['curve', 'meet2', 'disk']));
    function viz(ev) { return { name: 'prob-region', opts: { support: 'square', f: 'uniform', event: ev, slices: '', quiet: true, edit: false, label: 'The unit square of possible pairs (X, Y) with the event shaded' } }; }
    if (shape === 'square') {
      var E = R.pick(['sumlt', 'sumgt', 'max', 'min', 'diff', 'ratio']), c, v, evS, txt2, st;
      if (E === 'sumlt' || E === 'sumgt') { c = R.pick([q(1, 2), q(2, 3), q(3, 4), q(1, 3), q(4, 3), q(3, 2), q(5, 4)]); var below = c.le(1) ? c.pow(2).div(2) : Q(1).sub(Q(2).sub(c).pow(2).div(2)); v = E === 'sumlt' ? below : Q(1).sub(below); evS = E === 'sumlt' ? 'x+y<' + c.toPlain() : 'x+y>' + c.toPlain(); txt2 = 'X + Y ' + (E === 'sumlt' ? '<' : '>') + ' ' + qt(c);
        st = [c.le(1) ? 'The region $x + y < ' + qt(c) + '$ inside the square is a right triangle with legs $' + qt(c) + '$: area $\\frac{1}{2}' + par(qt(c)) + '^{2} = ' + qt(below) + '$.' : 'The region $x + y > ' + qt(c) + '$ is the corner triangle with legs $2 - ' + qt(c) + ' = ' + qt(Q(2).sub(c)) + '$: area $' + qt(Q(2).sub(c).pow(2).div(2)) + '$, so $x + y < ' + qt(c) + '$ has area $' + qt(below) + '$.', 'For a uniform point the probability is that area (the square has area 1): $P = ' + qt(v) + '$.']; }
      else if (E === 'max' || E === 'min') { c = R.pick([q(1, 2), q(1, 3), q(2, 3), q(3, 4), q(1, 4), q(4, 5)]); v = E === 'max' ? c.pow(2) : Q(1).sub(c).pow(2); evS = E === 'max' ? 'x<' + c.toPlain() + ' and y<' + c.toPlain() : 'x>' + c.toPlain() + ' and y>' + c.toPlain(); txt2 = E === 'max' ? '\\max(X, Y) < ' + qt(c) : '\\min(X, Y) > ' + qt(c);
        st = [(E === 'max' ? 'The larger is below $' + qt(c) + '$ exactly when both are: the square $[0, ' + qt(c) + ']^{2}$.' : 'The smaller is above $' + qt(c) + '$ exactly when both are: the square $[' + qt(c) + ', 1]^{2}$.'), 'Its area: $' + par(qt(E === 'max' ? c : Q(1).sub(c))) + '^{2} = ' + qt(v) + '$.']; }
      else if (E === 'diff') { c = R.pick([q(1, 4), q(1, 3), q(1, 2), q(1, 5), q(2, 5)]); var gt = R.coin(); v = gt ? Q(1).sub(c).pow(2) : Q(1).sub(Q(1).sub(c).pow(2)); evS = gt ? 'abs(x-y)>' + c.toPlain() : 'abs(x-y)<' + c.toPlain(); txt2 = '\\lvert X - Y \\rvert ' + (gt ? '>' : '<') + ' ' + qt(c);
        st = ['$\\lvert x - y \\rvert > ' + qt(c) + '$ leaves two corner triangles, each with legs $1 - ' + qt(c) + ' = ' + qt(Q(1).sub(c)) + '$.', 'Together their area is $2 \\cdot \\frac{1}{2}' + par(qt(Q(1).sub(c))) + '^{2} = ' + qt(Q(1).sub(c).pow(2)) + '$.', gt ? 'So $P = ' + qt(v) + '$.' : 'The band between them has area $1 - ' + qt(Q(1).sub(c).pow(2)) + ' = ' + qt(v) + '$.']; }
      else { var kq = R.pick([Q(2), Q(3), q(1, 2), q(1, 3), Q(4)]); v = kq.ge(1) ? Q(1).sub(kq.inv().div(2)) : kq.div(2); evS = 'x<' + kq.toPlain() + '*y'; txt2 = 'X < ' + (kq.isInt() ? qt(kq) : qt(kq)) + 'Y';
        st = [kq.ge(1) ? 'The complement $x \\ge ' + qt(kq) + 'y$ is the triangle under the line $y = \\frac{x}{' + qt(kq) + '}$: base 1, height $' + qt(kq.inv()) + '$, area $' + qt(kq.inv().div(2)) + '$.' : 'The region $x < ' + qt(kq) + 'y$ is the triangle above the line $y = \\frac{x}{' + qt(kq) + '}$, which meets the top edge at $x = ' + qt(kq) + '$: area $\\frac{1}{2} \\cdot ' + qt(kq) + ' \\cdot 1 = ' + qt(kq.div(2)) + '$.', 'So $P = ' + qt(v) + '$.']; }
      return chk({ q: 'Two numbers $X$ and $Y$ are chosen independently and uniformly from $[0, 1]$. Find $P(' + txt2 + ')$.', a: ex(v), viz: lv(ctx) === 1 ? viz(evS) : undefined,
        steps: ['The pair $(X, Y)$ is a uniform point in the unit square, so a probability is an area.'].concat(st),
        hint: 'Draw the unit square of pairs and find the area of the event.' }, { kind: E, ev: evS });
    }
    if (shape === 'meet') {
      var Tm = R.pick([30, 60, 60, 20]), w = R.pick(Tm === 20 ? [4, 5, 10] : Tm === 30 ? [5, 6, 10, 15] : [10, 12, 15, 20, 30]), fr = q(w, Tm), v2 = Q(1).sub(Q(1).sub(fr).pow(2));
      return chk({ q: 'Two friends each arrive at a random time, uniform and independent, during the same ' + Tm + '-minute window. Each waits ' + w + ' minutes for the other and then leaves. What is the probability that they meet?', a: ex(v2),
        steps: ['Measure times in units of the window: $X, Y$ uniform on $[0, 1]$. They meet when $\\lvert X - Y \\rvert \\le ' + qt(fr) + '$.', 'The complement is two corner triangles with legs $1 - ' + qt(fr) + ' = ' + qt(Q(1).sub(fr)) + '$: total area $' + qt(Q(1).sub(fr).pow(2)) + '$.', '$P(\\text{meet}) = 1 - ' + qt(Q(1).sub(fr).pow(2)) + ' = ' + qt(v2) + '$.'],
        hint: 'Draw the square of arrival times; the meeting band is around the diagonal.' }, { kind: 'meet', T: Tm, w: w });
    }
    if (shape === 'meet2') {
      var Tm2 = 60, wa = R.pick([10, 15, 20, 30]), wb = R.intNot(1, 6, wa / 5) * 5; if (wb === wa) wb = wa + 5;
      var fa = q(wa, Tm2), fb = q(wb, Tm2), v6 = Q(1).sub(Q(1).sub(fa).pow(2).div(2)).sub(Q(1).sub(fb).pow(2).div(2));
      return chk({ q: 'Ann and Ben each arrive at a random time, uniform and independent, during the same hour. Ann waits up to ' + wa + ' minutes for Ben; Ben waits up to ' + wb + ' minutes for Ann. What is the probability that they meet?', a: ex(v6),
        steps: ['In hours, $A$ and $B$ are uniform on $[0, 1]$. If Ann comes first they meet when $B - A \\le ' + qt(fa) + '$; if Ben comes first, when $A - B \\le ' + qt(fb) + '$.', 'The two corner triangles where they miss have legs $' + qt(Q(1).sub(fa)) + '$ and $' + qt(Q(1).sub(fb)) + '$: areas $' + qt(Q(1).sub(fa).pow(2).div(2)) + '$ and $' + qt(Q(1).sub(fb).pow(2).div(2)) + '$.', '$P(\\text{meet}) = 1 - ' + qt(Q(1).sub(fa).pow(2).div(2)) + ' - ' + qt(Q(1).sub(fb).pow(2).div(2)) + ' = ' + qt(v6) + '$.'],
        hint: 'Draw the square; the two missing corners are triangles of different sizes.' }, { kind: 'meet2', wa: wa, wb: wb });
    }
    if (shape === 'curve') {
      var C2 = R.pick([['Y > X^{2}', '2/3', '\\int_{0}^{1} (1 - x^{2})\\,dx = \\frac{2}{3}', 'y>x^2'], ['Y < X^{2}', '1/3', '\\int_{0}^{1} x^{2}\\,dx = \\frac{1}{3}', 'y<x^2'], ['Y < \\sqrt{X}', '2/3', '\\int_{0}^{1} \\sqrt{x}\\,dx = \\frac{2}{3}', 'y^2<x'], ['Y > X^{3}', '3/4', '\\int_{0}^{1} (1 - x^{3})\\,dx = \\frac{3}{4}', 'y>x^3'], ['XY < \\tfrac{1}{2}', '1/2+ln(2)/2', '\\frac{1}{2} + \\int_{1/2}^{1} \\frac{1}{2x}\\,dx = \\frac{1}{2} + \\frac{\\ln 2}{2}', 'x*y<1/2'], ['XY < \\tfrac{1}{4}', '1/4+ln(4)/4', '\\frac{1}{4} + \\int_{1/4}^{1} \\frac{1}{4x}\\,dx = \\frac{1}{4} + \\frac{\\ln 4}{4}', 'x*y<1/4'], ['Y > X^{4}', '4/5', '\\int_{0}^{1} (1 - x^{4})\\,dx = \\frac{4}{5}', 'y>x^4'], ['Y < 2X^{2}', '1-sqrt(2)/3', '\\int_{0}^{1/\\sqrt{2}} 2x^{2}\\,dx + \\left(1 - \\tfrac{1}{\\sqrt{2}}\\right) = \\frac{\\sqrt{2}}{6} + 1 - \\frac{\\sqrt{2}}{2} = 1 - \\frac{\\sqrt{2}}{3}', 'y<2x^2'], ['Y > \\tfrac{1}{2}X^{2}', '5/6', '\\int_{0}^{1} \\left(1 - \\tfrac{1}{2}x^{2}\\right)dx = \\frac{5}{6}', 'y>x^2/2']]);
      var exact = !/ln|sqrt/.test(C2[1]);
      return chk({ q: 'Two numbers $X$ and $Y$ are chosen independently and uniformly from $[0, 1]$. Find $P(' + C2[0] + ')$' + (exact ? '.' : ' (exact, or a decimal to 3 places).'), a: exact ? ex(C2[1]) : tol(C2[1]),
        steps: ['A probability is the area of the event inside the unit square; slice it with vertical lines.', 'Area $= ' + C2[2] + (exact ? '' : ' \\approx ' + ML.evalPlain(C2[1]).toFixed(4)) + '$.'],
        hint: 'Integrate the height of the region over x.' }, { kind: 'curve', ev: C2[3] });
    }
    var r = R.pick([q(1, 2), q(1, 3), q(2, 3), q(1, 4), Q(1), q(3, 4)]);
    if (R.coin() && r.le(q(1, 2))) return chk({ q: 'A point is chosen uniformly at random in the unit square $[0, 1] \\times [0, 1]$. What is the probability that it lies within distance $' + qt(r) + '$ of the center $\\left(\\frac{1}{2}, \\frac{1}{2}\\right)$? (Exact, or a decimal to 3 places.)', a: tol('pi*' + r.pow(2).toPlain()),
      steps: ['Those points form a disk of radius $' + qt(r) + '$ around the center; it fits inside the square because $' + qt(r) + ' \\le \\frac{1}{2}$.', 'Area $= \\pi' + par(qt(r)) + '^{2} = ' + qt(r.pow(2)) + '\\pi \\approx ' + (M.PI * r.pow(2).toNumber()).toFixed(4) + '$, out of a total area of 1.'],
      hint: 'A whole disk of that radius fits inside.' }, { kind: 'disk2', r: qp(r) });
    return chk({ q: 'A point is chosen uniformly at random in the unit square $[0, 1] \\times [0, 1]$. What is the probability that it lies within distance $' + qt(r) + '$ of the corner $(0, 0)$? (Exact, or a decimal to 3 places.)', a: tol('pi*' + r.pow(2).toPlain() + '/4'),
      steps: ['The points within $' + qt(r) + '$ of the corner form a quarter disk of radius $' + qt(r) + '$, which fits inside the square.', 'Area $= \\frac{1}{4}\\pi' + par(qt(r)) + '^{2} = ' + qt(r.pow(2).div(4)) + '\\pi \\approx ' + (M.PI * r.pow(2).toNumber() / 4).toFixed(4) + '$, out of a total area of 1.'],
      hint: 'A quarter of a circle of that radius.' }, { kind: 'disk', r: qp(r) });
  });

  // joint polynomial densities: square [0,1]² or triangle 0 < x < y < 1
  var JSQ = [[[1, 1, 0], [1, 0, 1]], [[1, 1, 1]], [[1, 2, 0], [1, 0, 2]], [[1, 1, 0], [2, 0, 1]], [[1, 1, 2]], [[1, 2, 1]], [[1, 0, 0], [1, 1, 1]]];
  var JTR = [[[1, 0, 0]], [[1, 1, 0]], [[1, 0, 1]], [[1, 1, 1]], [[1, 1, 0], [1, 0, 1]]];
  function jdens(R, sup) {
    sup = sup || R.pick(['square', 'square', 'triangle']);
    var raw = P2(R.pick(sup === 'square' ? JSQ : JTR)), tot = sup === 'square' ? p2int(raw, 0, 1, P([0]), P([1])) : p2int(raw, 0, 1, P([0, 1]), P([1]));
    var c = tot.inv(); return { sup: sup, raw: raw, c: c, f: p2scale(raw, c) };
  }
  function supTex(sup) { return sup === 'square' ? '0 \\le x \\le 1,\\ 0 \\le y \\le 1' : '0 \\le x \\le y \\le 1'; }
  function jdTex(Jd, withC) { var body = withC === false ? 'c\\,' + (Object.keys(Jd.raw).length > 1 ? '(' + p2tex(Jd.raw) + ')' : p2tex(Jd.raw)) : p2tex(Jd.f); if (body === 'c\\,1') body = 'c'; return '$$f(x, y) = ' + body + ' \\quad \\text{for } ' + supTex(Jd.sup) + '$$(and 0 elsewhere).'; }
  // the region of an event inside the support, as x-limits and linear y-limits
  var JEV = {
    'x<y': { t: 'X < Y', sq: [[0, 1, [0, 1], [1]]], tr: null },
    'x+y<1': { t: 'X + Y < 1', sq: [[0, 1, [0], [1, -1]]], tr: [[0, q(1, 2), [0, 1], [1, -1]]] },
    'y>2x': { t: 'Y > 2X', sq: [[0, q(1, 2), [0, 2], [1]]], tr: [[0, q(1, 2), [0, 2], [1]]] },
    'x<1/2': { t: 'X < \\tfrac{1}{2}', sq: [[0, q(1, 2), [0], [1]]], tr: [[0, q(1, 2), [0, 1], [1]]] },
    'y<1/2': { t: 'Y < \\tfrac{1}{2}', sq: [[0, 1, [0], [q(1, 2)]]], tr: [[0, q(1, 2), [0, 1], [q(1, 2)]]] }
  };
  function evProb(Jd, key) { var parts = Jd.sup === 'square' ? JEV[key].sq : JEV[key].tr; return sumQ(parts.map(function (pt) { return p2int(Jd.f, pt[0], pt[1], P(pt[2]), P(pt[3])); })); }
  function limTex(pt) { return '\\int_{' + qt(pt[0]) + '}^{' + qt(pt[1]) + '} \\int_{' + ptex(P(pt[2])) + '}^{' + ptex(P(pt[3])) + '}'; }
  G('prob.joint-densities', function (R, ctx) {
    var shape = by(ctx, 'const', 'rect', R.pick(['event', 'event', 'expo']));
    if (shape === 'expo') { var l1 = R.int(1, 4), l2 = R.intNot(1, 5, l1), v0 = q(l1, l1 + l2);
      return chk({ q: '$X$ and $Y$ have joint density $f(x, y) = ' + (l1 * l2 === 1 ? '' : l1 * l2) + 'e^{-' + (l1 === 1 ? '' : l1) + 'x - ' + (l2 === 1 ? '' : l2) + 'y}$ for $x, y > 0$. Find $P(X < Y)$.', a: ex(v0),
        steps: ['Region: $0 < x < y$. Integrate $y$ from $x$ to $\\infty$ first: $\\int_{x}^{\\infty} ' + (l1 * l2 === 1 ? '' : l1 * l2) + 'e^{-' + (l1 === 1 ? '' : l1) + 'x - ' + (l2 === 1 ? '' : l2) + 'y}\\,dy = ' + (l1 === 1 ? '' : l1) + 'e^{-' + (l1 + l2) + 'x}$.', 'Then $\\int_{0}^{\\infty} ' + (l1 === 1 ? '' : l1) + 'e^{-' + (l1 + l2) + 'x}\\,dx = \\frac{' + l1 + '}{' + (l1 + l2) + '}$.', 'So $P(X < Y) = ' + qt(v0) + '$: with rates ' + l1 + ' and ' + l2 + ', the one with the larger rate tends to come first.'],
        hint: 'Integrate over 0 < x < y, inner integral in y from x to ∞.' }, { kind: 'expo', l1: l1, l2: l2 }); }
    var Jd = jdens(R, shape === 'rect' ? 'square' : undefined);
    if (shape === 'const') { var tot = Jd.c.inv();
      return chk({ q: '$X$ and $Y$ have the joint density' + jdTex(Jd, false) + ' Find the constant $c$.', a: ex(Jd.c),
        steps: ['The total volume under a joint density is 1: $\\iint c\\,(' + p2tex(Jd.raw) + ')\\,dA = 1$ over ' + (Jd.sup === 'square' ? 'the unit square.' : 'the triangle, where $y$ runs from $x$ to 1.'), (Jd.sup === 'square' ? '$\\int_{0}^{1}\\int_{0}^{1} ' : '$\\int_{0}^{1}\\int_{x}^{1} ') + '(' + p2tex(Jd.raw) + ')\\,dy\\,dx = ' + qt(tot) + '$.', 'So $c = ' + qt(Jd.c) + '$.'],
        hint: 'Set the double integral over the support equal to 1.' }, { kind: 'const', sup: Jd.sup, raw: Object.keys(Jd.raw).map(function (k) { return [k, qp(Jd.raw[k])]; }) }); }
    if (shape === 'rect') { var a = R.pick([q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4)]), b = R.pick([q(1, 2), q(1, 3), q(2, 3), Q(1)]), v = p2int(Jd.f, 0, a, P([0]), P([b]));
      return chk({ q: '$X$ and $Y$ have the joint density' + jdTex(Jd) + ' Find $P\\left(X \\le ' + qt(a) + ',\\ Y \\le ' + qt(b) + '\\right)$.', a: ex(v),
        steps: ['The event is the rectangle $0 \\le x \\le ' + qt(a) + '$, $0 \\le y \\le ' + qt(b) + '$, which lies inside the support.', '$P = \\int_{0}^{' + qt(a) + '}\\int_{0}^{' + qt(b) + '} (' + p2tex(Jd.f) + ')\\,dy\\,dx = ' + qt(v) + '$.'],
        hint: 'Integrate the density over the rectangle.' }, { kind: 'rect', f: Object.keys(Jd.f).map(function (k) { return [k, qp(Jd.f[k])]; }), a: qp(a), b: qp(b) }); }
    var keys = Object.keys(JEV).filter(function (k) { return Jd.sup === 'square' || JEV[k].tr; }), key = R.pick(keys), v2 = evProb(Jd, key), parts = Jd.sup === 'square' ? JEV[key].sq : JEV[key].tr;
    return chk({ q: '$X$ and $Y$ have the joint density' + jdTex(Jd) + ' Find $P(' + JEV[key].t + ')$.', a: ex(v2),
      steps: ['Integrate only over the part of the support where the event holds' + (Jd.sup === 'triangle' ? ' (remember $x \\le y$ there)' : '') + ': ' + parts.map(function (pt) { return '$x$ from $' + qt(pt[0]) + '$ to $' + qt(pt[1]) + '$, and for each $x$, $y$ from $' + ptex(P(pt[2])) + '$ to $' + ptex(P(pt[3])) + '$'; }).join('; ') + '.', '$P = ' + parts.map(limTex).join(' + ') + ' (' + p2tex(Jd.f) + ')\\,dy\\,dx$.', 'Inner integral first, then outer: $P = ' + qt(v2) + '$.'],
      hint: 'Sketch the support and the event; read off the limits for y at each x.' }, { kind: 'event', sup: Jd.sup, f: Object.keys(Jd.f).map(function (k) { return [k, qp(Jd.f[k])]; }), ev: key });
  });

  G('prob.marginal-densities', function (R, ctx) {
    var shape = by(ctx, 'fx', R.pick(['fy', 'condval']), R.pick(['indep', 'indep', 'condval']));
    if (shape === 'indep') {
      var good = R.pick(['4xy', '6xy^{2}', '9x^{2}y^{2}', '2x', '6x^{2}y']), cands = [['$f(x, y) = ' + good + '$ for $0 \\le x \\le 1,\\ 0 \\le y \\le 1$', true], ['$f(x, y) = x + y$ for $0 \\le x \\le 1,\\ 0 \\le y \\le 1$', false], ['$f(x, y) = 2$ for $0 \\le x \\le y \\le 1$', false], ['$f(x, y) = 8xy$ for $0 \\le x \\le y \\le 1$', false], ['$f(x, y) = \\frac{3}{2}(x^{2} + y^{2})$ for $0 \\le x \\le 1,\\ 0 \\le y \\le 1$', false]];
      var wrong = R.sample(cands.slice(1), 3);
      return chk({ q: 'For which joint density are $X$ and $Y$ independent? (Each is 0 outside the region given.)', a: mc(cands[0][0], wrong.map(function (w) { return w[0]; })),
        steps: ['Independence needs $f(x, y) = f_X(x)\\,f_Y(y)$ everywhere, so two things: the formula splits into an $x$-part times a $y$-part, and the region where $f > 0$ is a rectangle.', '$' + good + '$ on the unit square passes both tests.', '$x + y$ and $x^{2} + y^{2}$ are sums, not products. On the triangle $x \\le y$, even $8xy$ fails: knowing $X = 0.9$ forces $Y \\ge 0.9$, so $Y$ depends on $X$.'],
        hint: 'Check the formula and the shape of the region.' }, { kind: 'indep', good: good });
    }
    var Jd = jdens(R), sq = Jd.sup === 'square';
    // f_X(x) = ∫ f dy over y in [0,1] (square) or [x,1] (triangle); f_Y(y) = ∫ f dx over [0,1] or [0,y]
    var fX = sq ? p2int2(Jd.f, P([0]), P([1])) : p2int2(Jd.f, P([0, 1]), P([1]));
    var fY = sq ? p2int2(p2swap(Jd.f), P([0]), P([1])) : p2int2(p2swap(Jd.f), P([0]), P([0, 1]));
    if (shape === 'fx' || shape === 'fy') { var isX = shape === 'fx', poly = isX ? fX : fY, v = isX ? 'x' : 'y';
      return chk({ q: '$X$ and $Y$ have the joint density' + jdTex(Jd) + ' Find the marginal density $f_' + (isX ? 'X(x)' : 'Y(y)') + '$ for $0 \\le ' + v + ' \\le 1$.', a: { t: 'expr', v: pplain(poly, v), vars: [v] },
        steps: ['Integrate out the other variable: $f_' + (isX ? 'X(x) = \\int f(x, y)\\,dy' : 'Y(y) = \\int f(x, y)\\,dx') + '$, over the values where $f > 0$ ' + (sq ? '(here 0 to 1).' : (isX ? '(here $y$ from $x$ to 1, which depends on $x$).' : '(here $x$ from 0 to $y$).')), '$f_' + (isX ? 'X(x) = \\int_{' + (sq ? '0' : 'x') + '}^{1}' : 'Y(y) = \\int_{0}^{' + (sq ? '1' : 'y') + '}') + ' (' + p2tex(Jd.f) + ')\\,d' + (isX ? 'y' : 'x') + ' = ' + ptex(poly, v) + '$.', 'Check: $\\int_{0}^{1} f_' + (isX ? 'X' : 'Y') + ' = ' + qt(pdef(poly, 0, 1)) + '$.'],
        hint: 'Integrate the joint density over the other variable, with limits from the support.' }, { kind: shape, sup: Jd.sup, f: Object.keys(Jd.f).map(function (k) { return [k, qp(Jd.f[k])]; }) }); }
    var x0 = R.pick([q(1, 4), q(1, 3), q(1, 2)]), y0 = sq ? R.pick([q(1, 4), q(1, 2), q(3, 4), q(2, 3)]) : x0.add(Q(1).sub(x0).mul(R.pick([q(1, 4), q(1, 2), q(3, 4)])));
    var fxv = peval(fX, x0), cv = p2eval(Jd.f, x0, y0).div(fxv);
    return chk({ q: '$X$ and $Y$ have the joint density' + jdTex(Jd) + ' Find the conditional density value $f_{Y \\mid X}\\left(' + qt(y0) + ' \\mid ' + qt(x0) + '\\right)$.', a: ex(cv),
      steps: ['$f_{Y \\mid X}(y \\mid x) = \\dfrac{f(x, y)}{f_X(x)}$: the slice at $x$, rescaled to have area 1.', '$f_X(x) = ' + ptex(fX) + '$, so $f_X\\left(' + qt(x0) + '\\right) = ' + qt(fxv) + '$.', '$f\\left(' + qt(x0) + ', ' + qt(y0) + '\\right) = ' + qt(p2eval(Jd.f, x0, y0)) + '$, so the conditional density is $\\dfrac{' + qt(p2eval(Jd.f, x0, y0)) + '}{' + qt(fxv) + '} = ' + qt(cv) + '$.'],
      hint: 'Divide the joint density by the marginal of X at that x.' }, { kind: 'condval', sup: Jd.sup, f: Object.keys(Jd.f).map(function (k) { return [k, qp(Jd.f[k])]; }), x: qp(x0), y: qp(y0) });
  });

  function covTable(J) { var xs = J.xs, ys = J.ys, mx = margX(J), my = margY(J), EX = sumQ(xs.map(function (x, j) { return Q(x).mul(mx[j]); })), EY = sumQ(ys.map(function (y, i) { return Q(y).mul(my[i]); })), EXY = sumQ(ys.map(function (y, i) { return sumQ(xs.map(function (x, j) { return Q(x * y).mul(J.cells[i][j]); })); })); return { EX: EX, EY: EY, EXY: EXY, cov: EXY.sub(EX.mul(EY)), mx: mx, my: my }; }
  GL('prob.covariance-correlation', function (R, ctx) {
    var shape = by(ctx, 'formula', R.pick(['table', 'rho']), R.pick(['zero', 'scale', 'table']));
    if (shape === 'formula') { var ex1 = R.int(1, 6), ey = R.int(1, 6), exy = ex1 * ey + R.intNot(-6, 6, 0);
      return chk({ q: '$E[X] = ' + ex1 + '$, $E[Y] = ' + ey + '$ and $E[XY] = ' + exy + '$. Find $\\operatorname{Cov}(X, Y)$.', a: ex(exy - ex1 * ey),
        steps: ['$\\operatorname{Cov}(X, Y) = E[(X - \\mu_X)(Y - \\mu_Y)] = E[XY] - E[X]E[Y]$ (expand and use linearity).', '$= ' + exy + ' - ' + ex1 + ' \\cdot ' + ey + ' = ' + (exy - ex1 * ey) + '$.', (exy - ex1 * ey > 0 ? 'Positive: X and Y tend to be large together.' : 'Negative: when one is large, the other tends to be small.')],
        hint: 'Cov = E[XY] − E[X]E[Y].' }, { kind: 'formula', ex: ex1, ey: ey, exy: exy }); }
    if (shape === 'table') { var J = randJoint(R, { xs: R.pick([[0, 1], [0, 1, 2], [1, 2, 3]]), ys: [0, 1], D: R.pick([8, 10, 12, 16]) }), C = covTable(J);
      return chk(nl({ q: 'The table gives the joint pmf of $X$ and $Y$.' + jointTab(J.xs, J.ys, J.cells) + 'Find $\\operatorname{Cov}(X, Y)$.', a: ex(C.cov),
        steps: ['$E[X] = ' + J.xs.map(function (x, j) { return x + ' \\cdot ' + qt(C.mx[j]); }).join(' + ') + ' = ' + qt(C.EX) + '$ and $E[Y] = ' + J.ys.map(function (y, i) { return y + ' \\cdot ' + qt(C.my[i]); }).join(' + ') + ' = ' + qt(C.EY) + '$.', '$E[XY] = \\sum xy\\,P(X = x, Y = y) = ' + qt(C.EXY) + '$ (only cells with $x$ and $y$ both nonzero count).', '$\\operatorname{Cov}(X, Y) = ' + qt(C.EXY) + ' - ' + qt(C.EX) + ' \\cdot ' + qt(C.EY) + ' = ' + qt(C.cov) + '$.'],
        hint: 'Find E[X], E[Y] and E[XY] from the table.' }), { kind: 'table', J: jplain(J) }); }
    if (shape === 'rho') { var sx = R.int(2, 6), sy = R.int(2, 6), rho = R.pick([q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(1, 4), q(3, 4), q(-3, 4), q(2, 3)]), cov = rho.mul(sx * sy);
      return chk({ q: '$\\operatorname{Var}(X) = ' + sx * sx + '$, $\\operatorname{Var}(Y) = ' + sy * sy + '$ and $\\operatorname{Cov}(X, Y) = ' + qt(cov) + '$. Find the correlation $\\rho$.', a: ex(rho),
        steps: ['$\\rho = \\dfrac{\\operatorname{Cov}(X, Y)}{\\sigma_X\\sigma_Y}$, with $\\sigma_X = \\sqrt{' + sx * sx + '} = ' + sx + '$ and $\\sigma_Y = ' + sy + '$.', '$\\rho = \\dfrac{' + qt(cov) + '}{' + sx * sy + '} = ' + qt(rho) + '$, which lies between $-1$ and $1$ as it must.'],
        hint: 'Divide the covariance by both standard deviations.' }, { kind: 'rho', sx: sx, sy: sy, cov: qp(cov) }); }
    if (shape === 'scale') { var cv = R.intNot(-6, 6, 0), a = R.pick([2, 3, -2, -1, 4]), b = R.int(-5, 5), cc = R.pick([2, 3, -3, 5, -1]), d = R.int(-5, 5);
      return chk({ q: '$\\operatorname{Cov}(X, Y) = ' + cv + '$. Find $\\operatorname{Cov}(' + T.lin(a, 'X', b) + ',\\ ' + T.lin(cc, 'Y', d) + ')$.', a: ex(a * cc * cv),
        steps: ['Adding constants does not change covariance (it shifts the means along with the values).', 'Scaling: $\\operatorname{Cov}(aX, cY) = ac\\,\\operatorname{Cov}(X, Y)$.', '$= ' + T.p(a) + ' \\cdot ' + T.p(cc) + ' \\cdot ' + T.p(cv) + ' = ' + a * cc * cv + '$.'],
        hint: 'Constants added drop out; multipliers come out as a product.' }, { kind: 'scale', cov: cv, a: a, c: cc }); }
    // zero covariance, dependent
    var p = R.pick([q(1, 4), q(1, 3), q(1, 6), q(1, 5), q(3, 10)]), aa = R.int(1, 2), cells = [[Q(0), Q(1).sub(p.mul(2)), Q(0)], [p, Q(0), p]];
    var xs = [-aa, 0, aa], ys = [0, aa * aa];
    return chk({ q: 'The table gives the joint pmf of $X$ and $Y$ (here $Y = X^{2}$).' + jointTab(xs, ys, cells) + '(a) Find $\\operatorname{Cov}(X, Y)$. (b) True or false: $X$ and $Y$ are independent.',
      a: { t: 'multi', parts: [{ label: '(a)', a: ex(0) }, { label: '(b)', a: { t: 'tf', v: false } }] },
      steps: ['$E[X] = ' + T.p(-aa) + ' \\cdot ' + qt(p) + ' + ' + aa + ' \\cdot ' + qt(p) + ' = 0$, and $E[XY] = E[X^{3}] = ' + T.p(-aa * aa * aa) + ' \\cdot ' + qt(p) + ' + ' + aa * aa * aa + ' \\cdot ' + qt(p) + ' = 0$.', '(a) $\\operatorname{Cov}(X, Y) = 0 - 0 \\cdot E[Y] = 0$.', '(b) Yet $Y$ is completely determined by $X$: $P(X = 0, Y = ' + aa * aa + ') = 0$ while $P(X = 0)P(Y = ' + aa * aa + ') = ' + qt(Q(1).sub(p.mul(2)).mul(p.mul(2))) + '$. <b>False</b>: zero covariance does not mean independence. Covariance only measures a straight-line trend.'],
      hint: 'Compute Cov; then test one cell against the product of its marginals.' }, { kind: 'zero', p: qp(p), a: aa });
  });

  G('prob.variance-of-sums', function (R, ctx) {
    var shape = by(ctx, 'sum', R.pick(['combo', 'rho']), R.pick(['hyper', 'hyper', 'fixed']));
    if (shape === 'sum') { var vx = R.int(2, 16), vy = R.int(2, 16), cv = R.intNot(-4, 5, 0), minus = R.coin(), v = vx + vy + (minus ? -2 : 2) * cv;
      if (v <= 0) { cv = 1; v = vx + vy + (minus ? -2 : 2); }
      return chk({ q: '$\\operatorname{Var}(X) = ' + vx + '$, $\\operatorname{Var}(Y) = ' + vy + '$ and $\\operatorname{Cov}(X, Y) = ' + cv + '$. Find $\\operatorname{Var}(X ' + (minus ? '-' : '+') + ' Y)$.', a: ex(v),
        steps: ['Expand the square: $\\operatorname{Var}(X ' + (minus ? '-' : '+') + ' Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y) ' + (minus ? '-' : '+') + ' 2\\operatorname{Cov}(X, Y)$.', '$= ' + vx + ' + ' + vy + ' ' + (minus ? '-' : '+') + ' 2' + T.p(cv) + ' = ' + v + '$.', 'Only for uncorrelated (for example, independent) variables does the covariance term drop out.'],
        hint: 'Do not forget the 2 Cov term.' }, { kind: 'sum', vx: vx, vy: vy, cov: cv, minus: minus }); }
    if (shape === 'combo') { var vx2 = R.int(1, 9), vy2 = R.int(1, 9), cv2 = R.intNot(-3, 3, 0), a = R.pick([2, 3, -1, -2]), b = R.pick([1, 2, -3, 3]), v2 = a * a * vx2 + b * b * vy2 + 2 * a * b * cv2;
      if (v2 <= 0) { cv2 = -cv2; v2 = a * a * vx2 + b * b * vy2 + 2 * a * b * cv2; }
      return chk({ q: '$\\operatorname{Var}(X) = ' + vx2 + '$, $\\operatorname{Var}(Y) = ' + vy2 + '$ and $\\operatorname{Cov}(X, Y) = ' + cv2 + '$. Find $\\operatorname{Var}(' + T.terms([[a, 'X'], [b, 'Y']]) + ')$.', a: ex(v2),
        steps: ['$\\operatorname{Var}(aX + bY) = a^{2}\\operatorname{Var}(X) + b^{2}\\operatorname{Var}(Y) + 2ab\\,\\operatorname{Cov}(X, Y)$.', '$= ' + a * a + ' \\cdot ' + vx2 + ' + ' + b * b + ' \\cdot ' + vy2 + ' + 2' + T.p(a) + T.p(b) + T.p(cv2) + ' = ' + v2 + '$.'],
        hint: 'Square the coefficients for the variances; use 2ab for the covariance.' }, { kind: 'combo', vx: vx2, vy: vy2, cov: cv2, a: a, b: b }); }
    if (shape === 'rho') { var sx = R.int(2, 6), sy = R.int(2, 6), rho = R.pick([q(1, 2), q(-1, 2), q(1, 4), q(-1, 4), q(3, 4)]), cv3 = rho.mul(sx * sy), v3 = Q(sx * sx + sy * sy).add(cv3.mul(2));
      return chk({ q: '$X$ and $Y$ have standard deviations $' + sx + '$ and $' + sy + '$ and correlation $' + qt(rho) + '$. Find $\\operatorname{Var}(X + Y)$.', a: ex(v3),
        steps: ['$\\operatorname{Cov}(X, Y) = \\rho\\,\\sigma_X\\sigma_Y = ' + qt(rho) + ' \\cdot ' + sx + ' \\cdot ' + sy + ' = ' + qt(cv3) + '$.', '$\\operatorname{Var}(X + Y) = ' + sx * sx + ' + ' + sy * sy + ' + 2' + T.p(qt(cv3)) + ' = ' + qt(v3) + '$.'],
        hint: 'Turn the correlation into a covariance first.' }, { kind: 'rho', sx: sx, sy: sy, rho: qp(rho) }); }
    if (shape === 'fixed') { var n = R.int(4, 20);
      return chk({ q: 'A deck of ' + n + ' cards numbered 1 to ' + n + ' is shuffled. Let $X$ be the number of cards that stay in their own position. Find $\\operatorname{Var}(X)$.', a: ex(1),
        steps: ['$X = I_1 + \\cdots + I_{' + n + '}$ with $I_k = 1$ when card $k$ stays put. $E[I_k] = \\frac{1}{' + n + '}$ and $\\operatorname{Var}(I_k) = \\frac{1}{' + n + '}\\left(1 - \\frac{1}{' + n + '}\\right)$.', 'For $j \\ne k$: $P(I_j = I_k = 1) = \\frac{1}{' + n + ' \\cdot ' + (n - 1) + '}$, so $\\operatorname{Cov}(I_j, I_k) = \\frac{1}{' + n * (n - 1) + '} - \\frac{1}{' + n * n + '} = \\frac{1}{' + n * n * (n - 1) + '}$ (slightly positive).', '$\\operatorname{Var}(X) = ' + n + ' \\cdot \\frac{1}{' + n + '}\\left(1 - \\frac{1}{' + n + '}\\right) + ' + n + ' \\cdot ' + (n - 1) + ' \\cdot \\frac{1}{' + n * n * (n - 1) + '} = \\frac{' + (n - 1) + '}{' + n + '} + \\frac{1}{' + n + '} = 1$.'],
        hint: 'Add the n variances and all n(n − 1) covariances of the indicators.' }, { kind: 'fixed', n: n }); }
    var N = R.int(10, 20), K = R.int(3, N - 4), nn = R.int(3, 6), p = q(K, N), vI = p.mul(Q(1).sub(p)), cI = q(K * (K - 1), N * (N - 1)).sub(p.pow(2)), V = vI.mul(nn).add(cI.mul(nn * (nn - 1)));
    return chk({ q: 'A box holds ' + N + ' marbles, ' + K + ' of them red. You draw ' + nn + ' without replacement. Let $X$ be the number of red marbles drawn. Find $\\operatorname{Var}(X)$.', a: ex(V),
      steps: ['$X = I_1 + \\cdots + I_{' + nn + '}$, where $I_j = 1$ if draw $j$ is red. Each $P(I_j = 1) = \\frac{' + K + '}{' + N + '}$, so $\\operatorname{Var}(I_j) = \\frac{' + K + '}{' + N + '} \\cdot \\frac{' + (N - K) + '}{' + N + '} = ' + qt(vI) + '$.', 'For two different draws: $P(\\text{both red}) = \\frac{' + K + ' \\cdot ' + (K - 1) + '}{' + N + ' \\cdot ' + (N - 1) + '}$, so $\\operatorname{Cov}(I_j, I_k) = ' + qt(q(K * (K - 1), N * (N - 1))) + ' - ' + par(qt(p)) + '^{2} = ' + qt(cI) + '$ (negative: a red draw makes the next red less likely).', '$\\operatorname{Var}(X) = ' + nn + ' \\cdot ' + qt(vI) + ' + ' + nn + ' \\cdot ' + (nn - 1) + ' \\cdot ' + T.p(qt(cI)) + ' = ' + qt(V) + '$.'],
      hint: 'Variance of a sum: all the variances plus every pairwise covariance.' }, { kind: 'hyper', N: N, K: K, n: nn });
  });

  G('prob.convolution', function (R, ctx) {
    var shape = by(ctx, R.pick(['pmf', 'dice']), R.pick(['poisson', 'binom']), R.pick(['unif2', 'unif12', 'expo']));
    if (shape === 'pmf') { var X = randPmf(R, { xs: [0, 1, 2], D: R.pick([4, 6, 8]) }), Y = randPmf(R, { xs: [0, 1, 2], D: R.pick([4, 5, 10]) }), s = R.int(1, 3), terms = [];
      for (var k = 0; k <= 2; k++) if (s - k >= 0 && s - k <= 2) terms.push([k, X.ps[k], Y.ps[s - k]]);
      var v = sumQ(terms.map(function (t) { return t[1].mul(t[2]); }));
      return chk(nl({ q: '$X$ and $Y$ are independent with these pmfs. Find $P(X + Y = ' + s + ')$.' + pmfTable(X.xs, X.ps, 'X') + pmfTable(Y.xs, Y.ps, 'Y'), a: ex(v),
        steps: ['$X + Y = ' + s + '$ happens through the splits ' + terms.map(function (t) { return '$(' + t[0] + ', ' + (s - t[0]) + ')$'; }).join(', ') + ', which are disjoint.', 'By independence each split multiplies: ' + terms.map(function (t) { return '$' + qt(t[1]) + ' \\cdot ' + qt(t[2]) + '$'; }).join(', ') + '.', '$P(X + Y = ' + s + ') = \\sum_k P(X = k)P(Y = ' + s + ' - k) = ' + qt(v) + '$.'],
        hint: 'Add over every way to split the total, multiplying the two probabilities in each split.' }), { kind: 'pmf', px: X.ps.map(qp), py: Y.ps.map(qp), s: s }); }
    if (shape === 'dice') { var a = R.pick([4, 6, 8]), b = R.pick([4, 6, 10]), s2 = R.int(4, a + b - 2), ways = 0; for (var i = 1; i <= a; i++) if (s2 - i >= 1 && s2 - i <= b) ways++;
      return chk({ q: 'Roll a fair ' + a + '-sided die and a fair ' + b + '-sided die. What is the probability that the sum is ' + s2 + '?', a: ex(q(ways, a * b)),
        steps: ['Each of the $' + a + ' \\cdot ' + b + ' = ' + a * b + '$ pairs is equally likely, with probability $\\frac{1}{' + a * b + '}$.', 'Count the pairs $(k, ' + s2 + ' - k)$ with $1 \\le k \\le ' + a + '$ and $1 \\le ' + s2 + ' - k \\le ' + b + '$: ' + ways + ' of them.', '$P = \\frac{' + ways + '}{' + a * b + '}' + (gcd(ways, a * b) > 1 ? ' = ' + qt(q(ways, a * b)) : '') + '$. (Adding the two pmfs instead would give a "distribution" that adds to 2.)'],
        hint: 'Count the pairs that make the sum.' }, { kind: 'dice', a: a, b: b, s: s2 }); }
    if (shape === 'poisson') { var l1 = R.pick([0.5, 1, 1.5, 2]), l2 = R.pick([0.5, 1, 1.5, 2, 2.5]), L = Q.from(l1).add(Q.from(l2)), kk = pickK(R, L, 4), E = poisExpr(kk, L);
      return chk({ q: 'Two independent machines break down at random: the numbers of breakdowns in a week are Poisson with means $' + num(l1) + '$ and $' + num(l2) + '$. Find the probability of exactly ' + kk + ' breakdowns in total. (Exact, or a decimal to 3 places.)', a: tol(E.plain),
        steps: ['The sum of independent Poisson variables is Poisson with the means added: convolve the pmfs, and the binomial theorem collapses the sum.', '$\\lambda = ' + num(l1) + ' + ' + num(l2) + ' = ' + lamT(L) + '$.', '$P(X + Y = ' + kk + ') = e^{-' + lamT(L) + '}\\dfrac{' + par(lamT(L)) + '^{' + kk + '}}{' + kk + '!} \\approx ' + E.val.toFixed(4) + '$.'],
        hint: 'Independent Poissons add to a Poisson.' }, { kind: 'poisson', l1: l1, l2: l2, k: kk }); }
    if (shape === 'binom') { var n1 = R.int(2, 5), n2 = R.int(2, 5), p = R.pick([q(1, 2), q(1, 3), q(1, 4), q(2, 3)]), k3 = R.int(1, n1 + n2 - 1), v3 = Cq(n1 + n2, k3).mul(p.pow(k3)).mul(Q(1).sub(p).pow(n1 + n2 - k3));
      return chk({ q: '$X$ is binomial with $n = ' + n1 + '$ and $p = ' + qt(p) + '$; $Y$ is binomial with $n = ' + n2 + '$ and the same $p$, independent of $X$. Find $P(X + Y = ' + k3 + ')$.', a: ex(v3),
        steps: ['$X$ counts successes in ' + n1 + ' trials and $Y$ in ' + n2 + ' more, all independent with the same $p$, so $X + Y$ counts successes in ' + (n1 + n2) + ' trials: binomial with $n = ' + (n1 + n2) + '$.', '$P(X + Y = ' + k3 + ') = \\binom{' + (n1 + n2) + '}{' + k3 + '}' + T.pow(qt(p), k3) + T.pow(qt(Q(1).sub(p)), n1 + n2 - k3) + ' = ' + qt(v3) + '$.'],
        hint: 'Same p: the trials just pool together.' }, { kind: 'binom', n1: n1, n2: n2, p: qp(p), k: k3 }); }
    if (shape === 'unif2') { var s4 = R.pick([q(1, 2), q(1, 4), q(3, 4), q(3, 2), q(5, 4), q(7, 4), q(1, 3), q(5, 3)]), v4 = s4.le(1) ? s4 : Q(2).sub(s4);
      return chk({ q: '$X$ and $Y$ are independent and uniform on $[0, 1]$. Find the density of $S = X + Y$ at $s = ' + qt(s4) + '$.', a: ex(v4),
        steps: ['$f_S(s) = \\int f_X(t)\\,f_Y(s - t)\\,dt$: the length of the set of $t$ with $0 \\le t \\le 1$ and $0 \\le s - t \\le 1$.', s4.le(1) ? 'For $0 \\le s \\le 1$ that set is $[0, s]$, of length $s$.' : 'For $1 \\le s \\le 2$ that set is $[s - 1, 1]$, of length $2 - s$.', '$f_S(' + qt(s4) + ') = ' + qt(v4) + '$. The density of the sum is a triangle, not a uniform: middle totals have more ways to happen.'],
        hint: 'Measure how much the flipped, shifted uniform overlaps the other.' }, { kind: 'unif2', s: qp(s4) }); }
    if (shape === 'unif12') { var s5 = R.pick([q(1, 2), q(3, 2), q(5, 2), q(1, 4), q(9, 4), q(5, 4)]), v5 = s5.le(1) ? s5.div(2) : s5.le(2) ? q(1, 2) : Q(3).sub(s5).div(2);
      return chk({ q: '$X$ is uniform on $[0, 1]$ and $Y$ is uniform on $[0, 2]$, independent. Find the density of $S = X + Y$ at $s = ' + qt(s5) + '$.', a: ex(v5),
        steps: ['$f_S(s) = \\int_{0}^{1} 1 \\cdot f_Y(s - t)\\,dt$, and $f_Y = \\frac{1}{2}$ on $[0, 2]$.', 'So $f_S(s) = \\frac{1}{2} \\times$ (length of $t \\in [0, 1]$ with $0 \\le s - t \\le 2$).', 'At $s = ' + qt(s5) + '$ that length is $' + qt(v5.mul(2)) + '$, so $f_S = ' + qt(v5) + '$. (The density is a trapezoid: rising on $[0, 1]$, flat at $\\frac{1}{2}$ on $[1, 2]$, falling on $[2, 3]$.)'],
        hint: 'Find the overlap length, then multiply by the heights.' }, { kind: 'unif12', s: qp(s5) }); }
    var lam = R.pick([1, 2, 3]), s6 = R.pick([q(1, 2), Q(1), Q(2), q(3, 2)]);
    return chk({ q: '$X$ and $Y$ are independent, each exponential with rate $' + lam + '$. Find the density of $S = X + Y$ at $s = ' + qt(s6) + '$ (exact, or a decimal to 3 places).', a: tol(lam * lam + '*' + s6.toPlain() + '*e^(-' + Q(lam).mul(s6).toPlain() + ')'),
      steps: ['$f_S(s) = \\int_{0}^{s} ' + (lam === 1 ? '' : lam) + 'e^{-' + (lam === 1 ? '' : lam) + 't} \\cdot ' + (lam === 1 ? '' : lam) + 'e^{-' + (lam === 1 ? '' : lam) + '(s - t)}\\,dt$ (both densities are 0 for negative values, so $0 \\le t \\le s$).', 'The exponents add to $-' + (lam === 1 ? '' : lam) + 's$, which does not depend on $t$: $f_S(s) = ' + (lam * lam === 1 ? '' : lam * lam) + 'e^{-' + (lam === 1 ? '' : lam) + 's}\\int_{0}^{s} dt = ' + (lam * lam === 1 ? '' : lam * lam) + 's\\,e^{-' + (lam === 1 ? '' : lam) + 's}$.', 'At $s = ' + qt(s6) + '$: $' + (Q(lam * lam).mul(s6).eq(1) ? '' : qt(Q(lam * lam).mul(s6))) + 'e^{-' + qt(Q(lam).mul(s6)) + '} \\approx ' + (lam * lam * s6.toNumber() * M.exp(-lam * s6.toNumber())).toFixed(4) + '$.'],
      hint: 'Integrate the product over 0 ≤ t ≤ s.' }, { kind: 'expo', lam: lam, s: qp(s6) });
  });

  G('prob.conditional-expectation', function (R, ctx) {
    var shape = by(ctx, 'table', R.pick(['coins', 'dice', 'coinpick']), R.pick(['groups', 'missinggroup', 'coins']));
    if (shape === 'table') { var J = randJoint(R, { ys: [0, 1], xs: R.pick([[0, 1, 2], [1, 2, 3]]) }), my = margY(J), i = R.int(0, 1); while (my[i].isZero()) i = 1 - i;
      var cm = sumQ(J.xs.map(function (x, j) { return Q(x).mul(J.cells[i][j]); })).div(my[i]);
      return chk(nl({ q: 'The table gives the joint pmf of $X$ and $Y$.' + jointTab(J.xs, J.ys, J.cells) + 'Find $E[X \\mid Y = ' + J.ys[i] + ']$.', a: ex(cm),
        steps: ['Within the row $Y = ' + J.ys[i] + '$ (total $' + qt(my[i]) + '$), the conditional pmf of $X$ is each cell divided by $' + qt(my[i]) + '$.', '$E[X \\mid Y = ' + J.ys[i] + '] = \\dfrac{' + J.xs.map(function (x, j) { return x + ' \\cdot ' + qt(J.cells[i][j]); }).join(' + ') + '}{' + qt(my[i]) + '} = ' + qt(cm) + '$.'],
        hint: 'Average X within the row, using the row total as the denominator.' }), { kind: 'table', J: jplain(J), i: i }); }
    if (shape === 'coins' || shape === 'dice') { var sides = R.pick([4, 6, 8]), EN = q(sides + 1, 2), each = shape === 'coins' ? q(1, 2) : q(7, 2), v = EN.mul(each);
      return chk({ q: 'Roll a fair ' + sides + '-sided die to get a number $N$. Then ' + (shape === 'coins' ? 'flip a fair coin $N$ times. Find the expected number of heads.' : 'roll a fair six-sided die $N$ times and add the results. Find the expected total.'), a: ex(v),
        steps: ['Condition on $N$: given $N = n$, the expected ' + (shape === 'coins' ? 'number of heads is $\\frac{n}{2}$' : 'total is $\\frac{7}{2}n$') + '. So $E[X \\mid N] = ' + qt(each) + 'N$.', 'Average over $N$ (the tower rule): $E[X] = E[E[X \\mid N]] = ' + qt(each) + 'E[N]$.', '$E[N] = \\frac{' + (sides + 1) + '}{2}$, so $E[X] = ' + qt(each) + ' \\cdot ' + qt(EN) + ' = ' + qt(v) + '$.'],
        hint: 'Find E[X | N] first, then average it over N.' }, { kind: shape, sides: sides }); }
    if (shape === 'coinpick') { var pA = R.pick([q(1, 2), q(3, 4), q(2, 3), q(4, 5)]), pB = R.pick([q(1, 4), q(1, 3), q(1, 5), q(1, 10)]), w = R.pick([q(1, 2), q(1, 3), q(1, 4)]), n = R.int(4, 20), v2 = Q(n).mul(w.mul(pA).add(Q(1).sub(w).mul(pB)));
      return chk({ q: 'A bag has two coins: coin A lands heads with probability $' + qt(pA) + '$ and coin B with probability $' + qt(pB) + '$. You pick coin A with probability $' + qt(w) + '$ (otherwise B) and flip the chosen coin ' + n + ' times. Find the expected number of heads.', a: ex(v2),
        steps: ['Given coin A, expect $' + n + ' \\cdot ' + qt(pA) + ' = ' + qt(pA.mul(n)) + '$ heads; given coin B, $' + n + ' \\cdot ' + qt(pB) + ' = ' + qt(pB.mul(n)) + '$.', 'Weight by how likely each coin is: $E[X] = ' + qt(w) + ' \\cdot ' + qt(pA.mul(n)) + ' + ' + qt(Q(1).sub(w)) + ' \\cdot ' + qt(pB.mul(n)) + ' = ' + qt(v2) + '$.'],
        hint: 'Average the two conditional means with weights.' }, { kind: 'coinpick', pA: qp(pA), pB: qp(pB), w: qp(w), n: n }); }
    var sh, mu; do { sh = [R.int(2, 6) * 10, R.int(1, 4) * 10]; sh.push(100 - sh[0] - sh[1]); } while (sh[2] < 10); mu = [R.int(20, 60), R.int(20, 60), R.int(20, 60)];
    var tot = sumQ(sh.map(function (s, i) { return q(s * mu[i], 100); }));
    var Cx = R.pick([['A school has three grades', 'students', 'the mean commute', 'minutes'], ['A store has three branches', 'sales', 'the mean sale', 'dollars'], ['A farm has three fields', 'plants', 'the mean height', 'cm']]);
    if (shape === 'groups') return chk({ q: Cx[0] + ': ' + sh.map(function (s, i) { return 'group ' + (i + 1) + ' has ' + s + '% of the ' + Cx[1] + ', with ' + Cx[2] + ' ' + mu[i] + ' ' + Cx[3]; }).join('; ') + '. Find ' + Cx[2] + ' over all the ' + Cx[1] + '.', a: ex(tot),
      steps: ['Let $G$ be the group. $E[X \\mid G = g]$ is that group\'s mean.', 'Tower rule: $E[X] = \\sum_g P(G = g)\\,E[X \\mid G = g] = ' + sh.map(function (s, i) { return hs(s) + ' \\cdot ' + mu[i]; }).join(' + ') + ' = ' + qt(tot) + '$.', 'Not the plain average of the three means ($' + qt(q(mu[0] + mu[1] + mu[2], 3)) + '$): each mean is weighted by its group\'s share.'],
      hint: 'Weight each group mean by its share.' }, { kind: 'groups', sh: sh, mu: mu });
    return chk({ q: Cx[0] + '. Group 1 has ' + sh[0] + '% of the ' + Cx[1] + ' (' + Cx[2] + ' ' + mu[0] + ' ' + Cx[3] + '), group 2 has ' + sh[1] + '% (' + Cx[2] + ' ' + mu[1] + ' ' + Cx[3] + '), and group 3 has the rest. Over all the ' + Cx[1] + ', ' + Cx[2] + ' is ' + T.num(tot) + ' ' + Cx[3] + '. Find ' + Cx[2] + ' in group 3.', a: ex(mu[2]),
      steps: ['Group 3 has ' + sh[2] + '%. Tower rule: $' + T.num(tot) + ' = ' + hs(sh[0]) + ' \\cdot ' + mu[0] + ' + ' + hs(sh[1]) + ' \\cdot ' + mu[1] + ' + ' + hs(sh[2]) + 'm$.', '$' + hs(sh[2]) + 'm = ' + T.num(tot) + ' - ' + T.num(q(sh[0] * mu[0] + sh[1] * mu[1], 100)) + ' = ' + T.num(q(sh[2] * mu[2], 100)) + '$, so $m = ' + mu[2] + '$.'],
      hint: 'Write the weighted average with the unknown mean and solve.' }, { kind: 'missinggroup', sh: sh, mu: mu });
  });

  G('prob.min-max', function (R, ctx) {
    var shape = by(ctx, R.pick(['dicemax', 'dicemin']), R.pick(['maxeq', 'unif', 'expmean']), R.pick(['emax', 'expfirst', 'exptail']));
    if (shape === 'dicemax' || shape === 'dicemin') { var n = R.int(2, 4), k = R.int(2, 5), mx = shape === 'dicemax', v = mx ? q(k, 6).pow(n) : q(7 - k, 6).pow(n);
      return chk({ q: 'Roll ' + n + ' fair dice. What is the probability that the ' + (mx ? 'largest number is at most ' + k : 'smallest number is at least ' + k) + '?', a: ex(v),
        steps: [(mx ? 'The largest is at most ' + k + ' exactly when every die is at most ' + k : 'The smallest is at least ' + k + ' exactly when every die is at least ' + k) + '.', 'Each die does that with probability $\\frac{' + (mx ? k : 7 - k) + '}{6}$, independently.', '$P = \\left(\\frac{' + (mx ? k : 7 - k) + '}{6}\\right)^{' + n + '} = ' + qt(v) + '$. (Not $' + n + ' \\cdot \\frac{' + (mx ? k : 7 - k) + '}{6}$, which can exceed 1.)'],
        hint: 'Turn the statement about the max (or min) into a statement about every die.' }, { kind: shape, n: n, k: k }); }
    if (shape === 'maxeq') { var n2 = R.int(2, 3), k2 = R.int(2, 6), v2 = q(k2, 6).pow(n2).sub(q(k2 - 1, 6).pow(n2));
      return chk({ q: 'Roll ' + n2 + ' fair dice. What is the probability that the largest number is exactly ' + k2 + '?', a: ex(v2),
        steps: ['$P(\\max = ' + k2 + ') = P(\\max \\le ' + k2 + ') - P(\\max \\le ' + (k2 - 1) + ')$.', '$= \\left(\\frac{' + k2 + '}{6}\\right)^{' + n2 + '} - \\left(\\frac{' + (k2 - 1) + '}{6}\\right)^{' + n2 + '} = ' + qt(v2) + '$.'],
        hint: 'Subtract two "at most" probabilities.' }, { kind: 'maxeq', n: n2, k: k2 }); }
    if (shape === 'unif') { var n3 = R.int(2, 5), c = R.pick([q(1, 2), q(1, 3), q(2, 3), q(3, 4), q(1, 4), q(4, 5)]), mx2 = R.coin(), v3 = mx2 ? c.pow(n3) : Q(1).sub(c).pow(n3);
      return chk({ q: n3 + ' numbers are chosen independently and uniformly from $[0, 1]$. What is the probability that ' + (mx2 ? 'the largest is at most $' + qt(c) + '$' : 'the smallest is greater than $' + qt(c) + '$') + '?', a: ex(v3),
        steps: [(mx2 ? 'The largest is at most $' + qt(c) + '$ when all of them are: each with probability $' + qt(c) + '$.' : 'The smallest is greater than $' + qt(c) + '$ when all of them are: each with probability $1 - ' + qt(c) + ' = ' + qt(Q(1).sub(c)) + '$.'), 'Independent, so multiply: $' + T.pow(qt(mx2 ? c : Q(1).sub(c)), n3) + ' = ' + qt(v3) + '$.'],
        hint: mx2 ? 'P(max ≤ c) = P(all ≤ c).' : 'P(min > c) = P(all > c).' }, { kind: 'unif', n: n3, c: qp(c), max: mx2 }); }
    var means = R.sample([2, 3, 4, 5, 6, 10, 12, 15, 20], R.int(2, 3)), rates = means.map(function (m) { return q(1, m); }), L = sumQ(rates);
    if (shape === 'expmean') return chk({ q: 'A machine has ' + means.length + ' parts with independent exponential lifetimes, with means ' + U.list(means.map(function (m) { return m + ' years'; })) + '. The machine stops when the first part fails. Find the expected time until it stops, in years.', a: ex(L.inv()),
      steps: ['The machine\'s lifetime is the minimum: $P(\\min > t) = \\prod e^{-\\lambda_i t} = e^{-(\\lambda_1 + \\cdots)t}$, an exponential with the rates added.', 'Rates: ' + rates.map(function (r) { return '$' + qt(r) + '$'; }).join(', ') + ' per year; total $' + qt(L) + '$.', 'Mean $= \\frac{1}{' + qt(L) + '} = ' + qt(L.inv()) + '$ years.'],
      hint: 'Add the rates (not the means).' }, { kind: 'expmean', means: means });
    if (shape === 'expfirst') { var j = R.int(0, means.length - 1);
      return chk({ q: 'Independent exponential lifetimes have means ' + U.list(means.map(function (m) { return m + ' hours'; })) + '. What is the probability that the one with mean ' + means[j] + ' hours fails first?', a: ex(rates[j].div(L)),
        steps: ['For independent exponentials, the chance a given one comes first is its rate over the total rate.', 'Rates: ' + rates.map(function (r) { return '$' + qt(r) + '$'; }).join(', ') + '; total $' + qt(L) + '$.', '$P = \\dfrac{' + qt(rates[j]) + '}{' + qt(L) + '} = ' + qt(rates[j].div(L)) + '$.'],
        hint: 'Rate over total rate.' }, { kind: 'expfirst', means: means, j: j }); }
    if (shape === 'exptail') { var tt = R.pick([1, 2, 3]);
      return chk({ q: 'Independent exponential lifetimes have means ' + U.list(means.map(function (m) { return m + ' hours'; })) + '. What is the probability that all of them last longer than ' + tt + ' hours? (Exact, or a decimal to 3 places.)', a: tol('e^(-' + L.mul(tt).toPlain() + ')'),
        steps: ['All last longer than ' + tt + ' exactly when the minimum does.', '$P(\\min > ' + tt + ') = e^{-(' + rates.map(qt).join(' + ') + ') \\cdot ' + tt + '} = e^{-' + qt(L.mul(tt)) + '} \\approx ' + M.exp(-L.toNumber() * tt).toFixed(4) + '$.'],
        hint: 'Multiply the separate survival chances.' }, { kind: 'exptail', means: means, t: tt }); }
    var n4 = R.int(2, 9), mxx = R.coin();
    return chk({ q: n4 + ' numbers are chosen independently and uniformly from $[0, 1]$. Find the expected value of the ' + (mxx ? 'largest' : 'smallest') + '.', a: ex(mxx ? q(n4, n4 + 1) : q(1, n4 + 1)),
      steps: ['$M = \\' + (mxx ? 'max' : 'min') + '(U_1, \\ldots, U_{' + n4 + '})$ has CDF ' + (mxx ? '$F(x) = x^{' + n4 + '}$, so density $' + n4 + 'x^{' + (n4 - 1) + '}$' : '$F(x) = 1 - (1 - x)^{' + n4 + '}$, so density $' + n4 + '(1 - x)^{' + (n4 - 1) + '}$') + ' on $[0, 1]$.', mxx ? '$E[M] = \\int_{0}^{1} x \\cdot ' + n4 + 'x^{' + (n4 - 1) + '}\\,dx = \\frac{' + n4 + '}{' + (n4 + 1) + '}$.' : '$E[M] = \\int_{0}^{1} P(M > x)\\,dx = \\int_{0}^{1} (1 - x)^{' + n4 + '}\\,dx = \\frac{1}{' + (n4 + 1) + '}$.', 'The ' + n4 + ' points split $[0, 1]$ into ' + (n4 + 1) + ' gaps of equal average length $\\frac{1}{' + (n4 + 1) + '}$, which explains the answer.'],
      hint: mxx ? 'Find the CDF x^n, differentiate, then integrate x times the density.' : 'Use P(min > x) = (1 − x)^n.' }, { kind: 'emax', n: n4, max: mxx });
  });


  // ================================================================ Unit 6: Inequalities and Limit Theorems
  G('prob.markov-chebyshev', function (R, ctx) {
    var shape = by(ctx, 'markov', 'cheb', R.pick(['ksd', 'compare', 'which']));
    if (shape === 'markov') {
      var C = R.pick([['the waiting time at a clinic', 'minutes', [10, 12, 15, 20]], ['the daily rainfall in a town', 'mm', [4, 5, 6, 8]], ['the number of emails a person gets in a day', 'emails', [20, 25, 30, 40]], ['the size of a file on a server', 'MB', [2, 3, 5, 6]]]), mu = R.pick(C[2]), k = R.pick([2, 3, 4, 5, 8]), a = mu * k;
      return chk({ q: 'The average of ' + C[0] + ' is ' + mu + ' ' + C[1] + ', and it is never negative. Nothing else is known about its distribution. Use Markov\'s inequality to find an upper bound for the probability that it is at least ' + a + ' ' + C[1] + '.', a: ex(q(mu, a)),
        steps: ['Markov: for $X \\ge 0$, $P(X \\ge a) \\le \\dfrac{E[X]}{a}$.', 'Why: $E[X] \\ge E[X \\cdot 1_{X \\ge a}] \\ge a\\,P(X \\ge a)$, because $X \\ge 0$ everywhere and $X \\ge a$ on that event.', '$P(X \\ge ' + a + ') \\le \\dfrac{' + mu + '}{' + a + '} = ' + qt(q(mu, a)) + '$. This is a bound, not the exact probability; the true value is often much smaller.'],
        hint: 'Divide the mean by the threshold.' }, { kind: 'markov', mu: mu, a: a });
    }
    if (shape === 'cheb') {
      var mu2 = R.int(20, 80), sd = R.int(2, 6), c = sd * R.pick([2, 3, 4]) + R.pick([0, sd]) , within = R.coin(), b = q(sd * sd, c * c);
      return chk({ q: 'A random variable has mean $' + mu2 + '$ and standard deviation $' + sd + '$. Use Chebyshev\'s inequality to find ' + (within ? 'a lower bound for $P(' + (mu2 - c) + ' < X < ' + (mu2 + c) + ')$.' : 'an upper bound for $P(\\lvert X - ' + mu2 + '\\rvert \\ge ' + c + ')$.'), a: ex(within ? Q(1).sub(b) : b),
        steps: ['Chebyshev: $P(\\lvert X - \\mu \\rvert \\ge c) \\le \\dfrac{\\sigma^{2}}{c^{2}}$ (Markov\'s inequality applied to $(X - \\mu)^{2}$).', '$P(\\lvert X - ' + mu2 + '\\rvert \\ge ' + c + ') \\le \\dfrac{' + sd * sd + '}{' + c * c + '} = ' + qt(b) + '$.'].concat(within ? ['The interval $(' + (mu2 - c) + ', ' + (mu2 + c) + ')$ is the complement, so its probability is at least $1 - ' + qt(b) + ' = ' + qt(Q(1).sub(b)) + '$.'] : []),
        hint: 'Use σ²/c² with c the distance from the mean.' }, { kind: 'cheb', sd: sd, c: c, within: within });
    }
    if (shape === 'ksd') { var k = R.pick([q(3, 2), Q(2), q(5, 2), Q(3), Q(4), q(5, 4)]), lb = Q(1).sub(k.pow(-2));
      return chk({ q: 'Whatever the distribution, at least what fraction of its probability lies within $' + qt(k) + '$ standard deviations of the mean? (Use Chebyshev\'s inequality.)', a: ex(lb),
        steps: ['$P(\\lvert X - \\mu \\rvert \\ge k\\sigma) \\le \\dfrac{\\sigma^{2}}{k^{2}\\sigma^{2}} = \\dfrac{1}{k^{2}}$.', 'With $k = ' + qt(k) + '$: at most $' + qt(k.pow(-2)) + '$ lies outside, so at least $1 - ' + qt(k.pow(-2)) + ' = ' + qt(lb) + '$ lies within.', 'For a normal distribution the true share is much higher; Chebyshev must hold for every distribution, so it is cautious.'],
        hint: 'At most 1/k² lies k or more standard deviations away.' }, { kind: 'ksd', k: qp(k) }); }
    if (shape === 'compare') { var dist = q(5, 2), b2 = q(35, 12).div(dist.pow(2)), act = q(2, 6);
      return chk({ q: 'Roll one fair die; $X$ is the number shown, with mean $\\frac{7}{2}$ and variance $\\frac{35}{12}$. (a) Use Chebyshev\'s inequality to bound $P(\\lvert X - \\frac{7}{2}\\rvert \\ge \\frac{5}{2})$. (b) Find that probability exactly.',
        a: { t: 'multi', parts: [{ label: '(a) at most', a: ex(b2) }, { label: '(b)', a: ex(act) }] },
        steps: ['(a) $\\dfrac{\\sigma^{2}}{c^{2}} = \\dfrac{35/12}{(5/2)^{2}} = ' + qt(b2) + '$.', '(b) $\\lvert X - 3.5 \\rvert \\ge 2.5$ only for $X = 1$ or $X = 6$: probability $\\frac{2}{6} = \\frac{1}{3}$.', 'The bound $' + qt(b2) + '$ is true but not tight: $\\frac{1}{3} \\le ' + qt(b2) + '$.'],
        hint: 'Bound with σ²/c², then count the outcomes for the exact value.' }, { kind: 'compare' }); }
    return chk({ q: 'Which statement about Markov\'s inequality, $P(X \\ge a) \\le \\frac{E[X]}{a}$, is true?', a: mc('It needs $X \\ge 0$; for a variable that can be negative it can fail', ['It gives the exact value of $P(X \\ge a)$', 'It works for any random variable, positive or negative', 'It shows $P(X \\ge a) \\ge \\frac{E[X]}{a}$']),
      steps: ['The proof uses $X \\ge 0$: then $E[X] \\ge a\\,P(X \\ge a)$.', 'Counterexample when negatives are allowed: $X = -10$ or $10$, each with probability $\\frac{1}{2}$. Then $E[X] = 0$, but $P(X \\ge 5) = \\frac{1}{2} > \\frac{0}{5}$.', 'And it gives an upper bound, not the value.'],
      hint: 'Where does the proof use X ≥ 0?' }, { kind: 'which' });
  });

  G('prob.law-large-numbers', function (R, ctx) {
    var shape = by(ctx, 'sdmean', 'chebmean', R.pick(['nneeded', 'coin', 'fallacy']));
    if (shape === 'sdmean') { var n = R.pick([4, 9, 16, 25, 36, 49, 64, 100]), sd = R.int(2, 12), askV = R.coin(), v = askV ? q(sd * sd, n) : q(sd, M.sqrt(n));
      return chk({ q: 'Each of $' + n + '$ independent measurements has standard deviation $' + sd + '$. Find ' + (askV ? 'the variance' : 'the standard deviation') + ' of their average $\\bar{X}$.', a: ex(v),
        steps: ['$\\bar{X} = \\frac{1}{n}(X_1 + \\cdots + X_n)$. The variances of independent terms add: $\\operatorname{Var}(X_1 + \\cdots + X_n) = n\\sigma^{2}$.', 'Dividing by $n$ divides the variance by $n^{2}$: $\\operatorname{Var}(\\bar{X}) = \\dfrac{\\sigma^{2}}{n} = \\dfrac{' + sd * sd + '}{' + n + '}' + (askV ? ' = ' + qt(v) : '') + '$.'].concat(askV ? [] : ['$\\operatorname{SD}(\\bar{X}) = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{' + sd + '}{' + M.sqrt(n) + '} = ' + qt(v) + '$.']),
        hint: 'Var of the average is σ²/n.' }, { kind: 'sdmean', n: n, sd: sd, askV: askV }); }
    if (shape === 'chebmean') { var sd2 = R.int(2, 10), n2 = R.pick([25, 50, 100, 200, 400]), eps = R.pick([1, 2, q(1, 2)]), b = Q(sd2 * sd2).div(Q(n2).mul(Q.from(eps).pow(2)));
      if (b.gt(1)) { n2 = 400; b = Q(sd2 * sd2).div(Q(n2).mul(Q.from(eps).pow(2))); }
      return chk({ q: 'Independent observations have mean $\\mu$ and standard deviation $' + sd2 + '$. For the average $\\bar{X}$ of $' + n2 + '$ of them, use Chebyshev\'s inequality to bound $P(\\lvert \\bar{X} - \\mu \\rvert \\ge ' + qt(Q.from(eps)) + ')$.', a: ex(b),
        steps: ['$\\operatorname{Var}(\\bar{X}) = \\dfrac{\\sigma^{2}}{n} = \\dfrac{' + sd2 * sd2 + '}{' + n2 + '}$.', 'Chebyshev: $P(\\lvert \\bar{X} - \\mu \\rvert \\ge \\varepsilon) \\le \\dfrac{\\operatorname{Var}(\\bar{X})}{\\varepsilon^{2}} = \\dfrac{' + sd2 * sd2 + '}{' + n2 + ' \\cdot ' + par(qt(Q.from(eps))) + '^{2}} = ' + qt(b) + '$.', 'As $n$ grows this bound goes to 0: the weak law of large numbers.'],
        hint: 'Apply Chebyshev to the average, whose variance is σ²/n.' }, { kind: 'chebmean', sd: sd2, n: n2, eps: qp(Q.from(eps)) }); }
    if (shape === 'nneeded') { var sd3 = R.int(2, 10), eps3 = R.pick([1, 2, q(1, 2)]), del = R.pick([q(1, 10), q(1, 20), q(1, 4), q(1, 5)]), nn = Q(sd3 * sd3).div(Q.from(eps3).pow(2).mul(del)), nmin = nn.isInt() ? nn.num() : nn.floor().num() + 1;
      return chk({ q: 'Independent observations have standard deviation $' + sd3 + '$. How many observations $n$ guarantee, by Chebyshev\'s inequality, that $P(\\lvert \\bar{X} - \\mu \\rvert \\ge ' + qt(Q.from(eps3)) + ') \\le ' + qt(del) + '$? Give the smallest such $n$.', a: { t: 'num', v: String(nmin), form: 'int' },
        steps: ['The Chebyshev bound for the average is $\\dfrac{\\sigma^{2}}{n\\varepsilon^{2}} = \\dfrac{' + sd3 * sd3 + '}{n \\cdot ' + par(qt(Q.from(eps3))) + '^{2}}$.', 'Require $\\dfrac{' + sd3 * sd3 + '}{' + qt(Q.from(eps3).pow(2)) + 'n} \\le ' + qt(del) + '$, that is $n \\ge ' + qt(nn) + '$.', 'Smallest whole number: $n = ' + nmin + '$.'],
        hint: 'Set σ²/(nε²) ≤ the target and solve for n.' }, { kind: 'nneeded', sd: sd3, eps: qp(Q.from(eps3)), del: qp(del) }); }
    if (shape === 'coin') { var e = R.pick([q(1, 10), q(1, 20), q(1, 5)]), d = R.pick([q(1, 20), q(1, 10), q(1, 4)]), nreq = q(1, 4).div(e.pow(2).mul(d)), nm = nreq.isInt() ? nreq.num() : nreq.floor().num() + 1;
      return chk({ q: 'Flip a fair coin $n$ times and let $\\hat{p}$ be the fraction of heads. By Chebyshev\'s inequality, how large must $n$ be to guarantee $P(\\lvert \\hat{p} - \\frac{1}{2}\\rvert \\ge ' + qt(e) + ') \\le ' + qt(d) + '$? Give the smallest such $n$.', a: { t: 'num', v: String(nm), form: 'int' },
        steps: ['$\\hat{p}$ is the average of $n$ indicators with variance $\\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$, so $\\operatorname{Var}(\\hat{p}) = \\frac{1}{4n}$.', 'Chebyshev: $P(\\lvert \\hat{p} - \\frac{1}{2}\\rvert \\ge ' + qt(e) + ') \\le \\dfrac{1}{4n \\cdot ' + par(qt(e)) + '^{2}} = \\dfrac{' + qt(Q(1).div(e.pow(2).mul(4))) + '}{n}$.', 'Need $\\dfrac{' + qt(Q(1).div(e.pow(2).mul(4))) + '}{n} \\le ' + qt(d) + '$: $n \\ge ' + qt(nreq) + '$, so $n = ' + nm + '$.'],
        hint: 'Var of the fraction of heads is 1/(4n).' }, { kind: 'coin', e: qp(e), d: qp(d) }); }
    var streak = R.int(5, 10);
    return chk({ q: 'A fair coin has landed heads ' + streak + ' times in a row. Which statement is true?', a: mc('The next flip is heads with probability $\\frac{1}{2}$; over many more flips the early streak gets swamped, not corrected', ['Tails is now more likely, so that the fraction of heads can return to $\\frac{1}{2}$', 'Heads is now more likely, because the coin is on a streak', 'The law of large numbers says the next ' + streak + ' flips will include more tails']),
      steps: ['The flips are independent, so the next one is heads with probability $\\frac{1}{2}$, whatever came before.', 'The law of large numbers is about averages: after $n$ more flips the fraction of heads is $\\dfrac{' + streak + ' + H_n}{' + streak + ' + n}$, and $H_n \\approx \\frac{n}{2}$. The ' + streak + ' extra heads stay, but they matter less and less as $n$ grows.'],
      hint: 'Do the coin\'s past flips change its next flip?' }, { kind: 'fallacy' });
  });

  G('prob.mgf', function (R, ctx) {
    var shape = by(ctx, 'disc', R.pick(['named', 'disc2']), R.pick(['ident', 'sum', 'normal']));
    if (shape === 'disc' || shape === 'disc2') {
      var xs = R.sample([-2, -1, 0, 1, 2, 3], 3).sort(function (a, b) { return a - b; }), pm = randPmf(R, { xs: xs, D: R.pick([4, 6, 8, 10]) });
      var Mtex = xs.map(function (x, i) { return [pm.ps[i], x === 0 ? '' : 'e^{' + (x === 1 ? '' : x === -1 ? '-' : x) + 't}']; });
      var m1 = meanQ(xs, pm.ps), m2 = sumQ(xs.map(function (x, i) { return Q(x * x).mul(pm.ps[i]); })), V = m2.sub(m1.pow(2)), askV = shape === 'disc2';
      return chk(nl({ q: 'A random variable $X$ has moment generating function $$M(t) = ' + T.terms(Mtex) + '.$$ Find ' + (askV ? '$\\operatorname{Var}(X)$.' : '$E[X]$.'), a: ex(askV ? V : m1),
        steps: ['$M(t) = E[e^{tX}] = \\sum e^{tx}P(X = x)$, so this $X$ takes the values ' + xs.join(', ') + ' with probabilities ' + pm.ps.map(qt).map(function (s) { return '$' + s + '$'; }).join(', ') + '.', '$M\'(t) = \\sum x\\,e^{tx}P(X = x)$, so $E[X] = M\'(0) = ' + xs.map(function (x, i) { return T.p(x) + ' \\cdot ' + qt(pm.ps[i]); }).join(' + ') + ' = ' + qt(m1) + '$.'].concat(askV ? ['$E[X^{2}] = M\'\'(0) = ' + xs.map(function (x, i) { return par(x) + '^{2} \\cdot ' + qt(pm.ps[i]); }).join(' + ') + ' = ' + qt(m2) + '$.', '$\\operatorname{Var}(X) = M\'\'(0) - (M\'(0))^{2} = ' + qt(m2) + ' - ' + par(qt(m1)) + '^{2} = ' + qt(V) + '$.'] : []),
        hint: askV ? 'M″(0) is E[X²], not the variance.' : 'Differentiate, then set t = 0.' }), { kind: shape, xs: xs, ps: pm.ps.map(qp) });
    }
    if (shape === 'named') {
      var which = R.pick(['binom', 'pois', 'expo']), v, Mt, st, n, p, lam, l2;
      if (which === 'binom') { n = R.int(3, 12); p = R.pick([q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(2, 5)]); v = p.mul(n).mul(Q(1).sub(p)); Mt = '\\left(' + qt(Q(1).sub(p)) + ' + ' + qt(p) + 'e^{t}\\right)^{' + n + '}';
        st = ['$M\'(t) = ' + n + '\\left(' + qt(Q(1).sub(p)) + ' + ' + qt(p) + 'e^{t}\\right)^{' + (n - 1) + '} \\cdot ' + qt(p) + 'e^{t}$, so $E[X] = M\'(0) = ' + n + ' \\cdot ' + qt(p) + ' = ' + qt(p.mul(n)) + '$.', 'Differentiating again and setting $t = 0$: $E[X^{2}] = M\'\'(0) = ' + qt(p.mul(n)) + ' + ' + n + ' \\cdot ' + (n - 1) + ' \\cdot ' + par(qt(p)) + '^{2} = ' + qt(p.mul(n).add(p.pow(2).mul(n * (n - 1)))) + '$.', '$\\operatorname{Var}(X) = ' + qt(p.mul(n).add(p.pow(2).mul(n * (n - 1)))) + ' - ' + par(qt(p.mul(n))) + '^{2} = ' + qt(v) + '$, which is $np(1 - p)$: this is the binomial MGF.']; }
      else if (which === 'pois') { lam = Q.from(R.pick([1, 2, 3, 4, 5, q(1, 2), q(3, 2)])); v = lam; Mt = 'e^{' + (lam.eq(1) ? '' : qt(lam)) + '(e^{t} - 1)}';
        st = ['$M\'(t) = ' + (lam.eq(1) ? '' : qt(lam)) + 'e^{t} M(t)$, so $E[X] = M\'(0) = ' + qt(lam) + '$.', '$M\'\'(t) = ' + (lam.eq(1) ? '' : qt(lam)) + 'e^{t}M(t) + ' + (lam.eq(1) ? '' : qt(lam)) + 'e^{t}M\'(t)$, so $E[X^{2}] = ' + qt(lam) + ' + ' + par(qt(lam)) + '^{2}$.', '$\\operatorname{Var}(X) = ' + qt(lam) + '$: this is the Poisson MGF, whose mean and variance agree.']; }
      else { l2 = Q.from(R.pick([1, 2, 3, 4, 5, q(1, 2)])); v = l2.pow(-2); Mt = '\\dfrac{' + qt(l2) + '}{' + qt(l2) + ' - t}\\ \\ (t < ' + qt(l2) + ')';
        st = ['$M(t) = ' + qt(l2) + '(' + qt(l2) + ' - t)^{-1}$, so $M\'(t) = ' + qt(l2) + '(' + qt(l2) + ' - t)^{-2}$ and $E[X] = M\'(0) = ' + qt(l2.inv()) + '$.', '$M\'\'(t) = 2 \\cdot ' + qt(l2) + '(' + qt(l2) + ' - t)^{-3}$, so $E[X^{2}] = ' + qt(Q(2).div(l2.pow(2))) + '$.', '$\\operatorname{Var}(X) = ' + qt(Q(2).div(l2.pow(2))) + ' - ' + par(qt(l2.inv())) + '^{2} = ' + qt(v) + '$: the exponential MGF.']; }
      return chk({ q: 'A random variable $X$ has moment generating function $M(t) = ' + Mt + '$. Find $\\operatorname{Var}(X)$.', a: ex(v), steps: st, hint: 'Var = M″(0) − (M′(0))².' }, { kind: 'named', which: which, n: n, p: p && qp(p), lam: lam && qp(lam), l2: l2 && qp(l2) });
    }
    if (shape === 'ident') { var n3 = R.int(3, 6), p3 = R.pick([q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4)]), k3 = R.int(1, n3 - 1), v3 = Cq(n3, k3).mul(p3.pow(k3)).mul(Q(1).sub(p3).pow(n3 - k3));
      return chk({ q: 'The moment generating function of $X$ is $M(t) = \\left(' + qt(Q(1).sub(p3)) + ' + ' + qt(p3) + 'e^{t}\\right)^{' + n3 + '}$. Find $P(X = ' + k3 + ')$.', a: ex(v3),
        steps: ['An MGF determines the distribution. $\\left(q + pe^{t}\\right)^{n}$ is the MGF of a binomial with $n = ' + n3 + '$ and $p = ' + qt(p3) + '$ (expand: the coefficient of $e^{kt}$ is $P(X = k)$).', '$P(X = ' + k3 + ') = \\binom{' + n3 + '}{' + k3 + '}' + T.pow(qt(p3), k3) + T.pow(qt(Q(1).sub(p3)), n3 - k3) + ' = ' + qt(v3) + '$.'],
        hint: 'Recognize the form (q + pe^t)^n.' }, { kind: 'ident', n: n3, p: qp(p3), k: k3 }); }
    if (shape === 'sum') { var a = R.pick([1, 2, 3]), b = R.pick([1, 2, 4]), L = a + b, k4 = pickK(R, L, 4), E4 = poisExpr(k4, L);
      return chk({ q: '$X$ and $Y$ are independent with MGFs $M_X(t) = e^{' + (a === 1 ? '' : a) + '(e^{t} - 1)}$ and $M_Y(t) = e^{' + (b === 1 ? '' : b) + '(e^{t} - 1)}$. Find $P(X + Y = ' + k4 + ')$ (exact, or a decimal to 3 places).', a: tol(E4.plain),
        steps: ['For independent variables, $M_{X + Y}(t) = E[e^{tX}e^{tY}] = M_X(t)M_Y(t)$.', '$M_{X + Y}(t) = e^{' + L + '(e^{t} - 1)}$: the MGF of a Poisson with mean ' + L + '. So $X + Y$ is Poisson(' + L + ').', '$P(X + Y = ' + k4 + ') = e^{-' + L + '}\\dfrac{' + L + '^{' + k4 + '}}{' + k4 + '!} \\approx ' + E4.val.toFixed(4) + '$.'],
        hint: 'Multiply the MGFs and recognize the result.' }, { kind: 'sum', a: a, b: b, k: k4 }); }
    var mu = R.int(-3, 6), sg = R.int(2, 5);
    return chk({ q: 'The moment generating function of $X$ is $M(t) = e^{' + T.terms([[mu, 't'], [sg * sg / 2, 't^{2}']]) + '}$. Find the standard deviation of $X$.', a: ex(sg),
      steps: ['$e^{\\mu t + \\sigma^{2}t^{2}/2}$ is the MGF of a normal with mean $\\mu$ and variance $\\sigma^{2}$.', 'Here $\\mu = ' + mu + '$ and $\\frac{\\sigma^{2}}{2} = ' + num(sg * sg / 2) + '$, so $\\sigma^{2} = ' + sg * sg + '$ and $\\sigma = ' + sg + '$.', 'Check by differentiating: $M\'(0) = ' + mu + '$ and $M\'\'(0) = ' + (sg * sg + mu * mu) + '$, so $\\operatorname{Var}(X) = ' + (sg * sg + mu * mu) + ' - ' + par(mu) + '^{2} = ' + sg * sg + '$.'],
      hint: 'Match the exponent with μt + σ²t²/2.' }, { kind: 'normal', mu: mu, sg: sg });
  });

  var CLTCTX = [
    { s: 'Boxes of cereal have weights with mean {mu} g and standard deviation {sd} g, independently.', what: 'the total weight of {n} boxes', u: 'g', mus: [350, 400, 500], sds: [5, 6, 8, 10] },
    { s: 'Customer service calls last on average {mu} minutes with standard deviation {sd} minutes, independently.', what: 'the total length of {n} calls', u: 'minutes', mus: [4, 5, 6, 8], sds: [2, 3, 4] },
    { s: 'A machine fills bags with a mean of {mu} kg of sand and standard deviation {sd} kg, independently.', what: 'the total in {n} bags', u: 'kg', mus: [20, 25, 50], sds: [1, 2, 3] }
  ];
  G('prob.clt-sums', function (R, ctx) {
    var shape = by(ctx, 'params', 'tail', R.pick(['between', 'quantile']));
    var C = R.pick(CLTCTX), n = R.pick([16, 25, 36, 49, 64, 100]), mu = R.pick(C.mus), sd = R.pick(C.sds), m = n * mu, s = sd * M.sqrt(n);
    var setup = C.s.replace('{mu}', mu).replace('{sd}', sd) + ' Let $S$ be ' + C.what.replace('{n}', n) + '. ';
    if (shape === 'params') return chk({ q: setup + 'Find the mean and the standard deviation of $S$.', a: { t: 'multi', parts: [{ label: 'mean', a: ex(m) }, { label: 'standard deviation', a: ex(s) }] },
      steps: ['Means add: $E[S] = n\\mu = ' + n + ' \\cdot ' + mu + ' = ' + m + '$.', 'For independent terms, variances add: $\\operatorname{Var}(S) = n\\sigma^{2} = ' + n + ' \\cdot ' + sd * sd + ' = ' + n * sd * sd + '$.', 'So $\\operatorname{SD}(S) = \\sigma\\sqrt{n} = ' + sd + ' \\cdot ' + M.sqrt(n) + ' = ' + s + '$ (not $' + sd + ' \\cdot ' + n + '$, and not $' + sd + '/' + M.sqrt(n) + '$, which is the SD of the average).'],
      hint: 'Variances add for independent terms; take the square root at the end.' }, { kind: 'params', n: n, mu: mu, sd: sd });
    function zOf(x) { return z2((x - m) / s); }
    if (shape === 'tail') { var d = R.pick([1, 1.5, 2, 0.5, -0.5, -1, 0.8, 1.2]) * s, x = M.round(m + d), up = R.coin(), z = zOf(x), ph = phiT(z), ans = up ? 1 - ph : ph;
      return chk({ q: setup + 'Use the central limit theorem to approximate $P(S ' + (up ? '>' : '<') + ' ' + x + ')$. Use $\\Phi(' + z.toFixed(2) + ') = ' + ph.toFixed(4) + '$ (where $\\Phi$ is the standard normal CDF).', a: { t: 'num', v: String(Number(ans.toFixed(4))), tol: 0.002 },
        steps: ['$S$ is approximately normal with mean $' + m + '$ and standard deviation $' + s + '$.', '$z = \\dfrac{' + x + ' - ' + m + '}{' + s + '} \\approx ' + z.toFixed(2) + '$.', up ? '$P(S > ' + x + ') \\approx 1 - \\Phi(' + z.toFixed(2) + ') = 1 - ' + ph.toFixed(4) + ' = ' + ans.toFixed(4) + '$.' : '$P(S < ' + x + ') \\approx \\Phi(' + z.toFixed(2) + ') = ' + ph.toFixed(4) + '$.'],
        hint: 'Standardize with mean nμ and SD σ√n.' }, { kind: 'tail', n: n, mu: mu, sd: sd, x: x, up: up, z: z, ph: ph }); }
    if (shape === 'between') { var d1 = R.pick([0.5, 1, 1.5]) * s, d2 = R.pick([0.5, 1, 2]) * s, a = M.round(m - d1), b = M.round(m + d2), za = zOf(a), zb = zOf(b), pa = phiT(za), pb = phiT(zb), ans2 = pb - pa;
      return chk({ q: setup + 'Approximate $P(' + a + ' < S < ' + b + ')$. Use $\\Phi(' + za.toFixed(2) + ') = ' + pa.toFixed(4) + '$ and $\\Phi(' + zb.toFixed(2) + ') = ' + pb.toFixed(4) + '$.', a: { t: 'num', v: String(Number(ans2.toFixed(4))), tol: 0.002 },
        steps: ['$S \\approx$ normal with mean $' + m + '$ and SD $' + s + '$.', '$z$-scores: $\\dfrac{' + a + ' - ' + m + '}{' + s + '} \\approx ' + za.toFixed(2) + '$ and $\\dfrac{' + b + ' - ' + m + '}{' + s + '} \\approx ' + zb.toFixed(2) + '$.', '$P \\approx \\Phi(' + zb.toFixed(2) + ') - \\Phi(' + za.toFixed(2) + ') = ' + pb.toFixed(4) + ' - ' + pa.toFixed(4) + ' = ' + ans2.toFixed(4) + '$.'],
        hint: 'Subtract the two Φ values.' }, { kind: 'between', n: n, mu: mu, sd: sd, a: a, b: b, za: za, zb: zb, pa: pa, pb: pb }); }
    var zq = R.pick([[1.645, 0.95], [1.28, 0.9], [2.33, 0.99]]), xq = m + zq[0] * s;
    return chk({ q: setup + 'Find the value $s$ that $S$ stays below with probability about ' + zq[1] + '. Use $\\Phi(' + zq[0] + ') \\approx ' + zq[1] + '$. (Round to the nearest whole number.)', a: { t: 'num', v: String(Number(xq.toFixed(3))), tol: 0.75 },
      steps: ['$P(S \\le s) \\approx \\Phi\\left(\\dfrac{s - ' + m + '}{' + s + '}\\right) = ' + zq[1] + '$ when $\\dfrac{s - ' + m + '}{' + s + '} = ' + zq[0] + '$.', '$s = ' + m + ' + ' + zq[0] + ' \\cdot ' + s + ' \\approx ' + xq.toFixed(1) + '$.'],
      hint: 'Undo the standardization: s = nμ + z σ√n.' }, { kind: 'quantile', n: n, mu: mu, sd: sd, z: zq[0] });
  });

  var BINSET = [[100, q(1, 2)], [36, q(1, 2)], [64, q(1, 2)], [400, q(1, 2)], [100, q(1, 5)], [225, q(1, 5)], [150, q(2, 5)], [180, q(1, 6)], [720, q(1, 6)], [100, q(1, 10)], [400, q(1, 10)], [300, q(1, 4)]];
  G('prob.continuity-correction', function (R, ctx) {
    var shape = by(ctx, 'boundary', 'one', R.pick(['two', 'exact']));
    var bs = R.pick(BINSET), n = bs[0], p = bs[1], mu = p.mul(n).toNumber(), sd = M.sqrt(p.mul(n).mul(Q(1).sub(p)).toNumber());
    var C = R.pick(['A fair coin is flipped', 'A seed sprouts with probability', 'A free throw goes in with probability']);
    var setup = '$X$ is binomial with $n = ' + n + '$ and $p = ' + qt(p) + '$ (mean $' + num(mu) + '$, standard deviation $' + num(sd) + '$). ';
    var types = [['\\le', 0.5, 'left'], ['<', -0.5, 'left'], ['\\ge', -0.5, 'right'], ['>', 0.5, 'right']];
    if (shape === 'boundary') { var ty = R.pick(types), k = M.round(mu) + R.int(-3, 3), bd = k + ty[1];
      return chk({ q: setup + 'To approximate $P(X ' + ty[0] + ' ' + k + ')$ with a normal curve and the continuity correction, which boundary should the normal variable $Y$ use? (Give the number $c$ in $P(Y ' + (ty[2] === 'left' ? '<' : '>') + ' c)$.)', a: { t: 'num', v: String(bd) },
        steps: ['Each whole number $j$ is widened to the interval $[j - 0.5,\\ j + 0.5]$.', '$X ' + ty[0] + ' ' + k + '$ means $X ' + (ty[2] === 'left' ? '\\le ' + (ty[1] > 0 ? k : k - 1) : '\\ge ' + (ty[1] < 0 ? k : k + 1)) + '$' + (ty[0] === '<' || ty[0] === '>' ? ' (strict inequality: ' + k + ' itself is out)' : ' (' + k + ' itself is in)') + '.', 'So the interval ends at $' + (ty[2] === 'left' ? (ty[1] > 0 ? k : k - 1) + ' + 0.5' : (ty[1] < 0 ? k : k + 1) + ' - 0.5') + ' = ' + bd + '$: use $P(Y ' + (ty[2] === 'left' ? '<' : '>') + ' ' + bd + ')$.'],
        hint: 'Decide which whole numbers are included, then go half a unit past the last one.' }, { kind: 'boundary', k: k, ty: ty[0] }); }
    if (shape === 'one') { var ty2 = R.pick(types), k2 = M.round(mu + R.pick([-1.5, -1, -0.6, 0.6, 1, 1.4, 1.8]) * sd), bd2 = k2 + ty2[1], z = z2((bd2 - mu) / sd), ph = phiT(z), ans = ty2[2] === 'left' ? ph : 1 - ph;
      return chk({ q: setup + 'Use the normal approximation with the continuity correction to estimate $P(X ' + ty2[0] + ' ' + k2 + ')$. Use $\\Phi(' + z.toFixed(2) + ') = ' + ph.toFixed(4) + '$.', a: { t: 'num', v: String(Number(ans.toFixed(4))), tol: 0.002 },
        steps: ['Continuity correction: $P(X ' + ty2[0] + ' ' + k2 + ') \\approx P(Y ' + (ty2[2] === 'left' ? '<' : '>') + ' ' + bd2 + ')$ for $Y$ normal with mean $' + num(mu) + '$ and SD $' + num(sd) + '$.', '$z = \\dfrac{' + bd2 + ' - ' + num(mu) + '}{' + num(sd) + '} \\approx ' + z.toFixed(2) + '$.', ty2[2] === 'left' ? '$P \\approx \\Phi(' + z.toFixed(2) + ') = ' + ph.toFixed(4) + '$.' : '$P \\approx 1 - \\Phi(' + z.toFixed(2) + ') = ' + ans.toFixed(4) + '$.'],
        hint: 'Move the boundary half a unit first, then standardize.' }, { kind: 'one', n: n, p: qp(p), k: k2, ty: ty2[0], z: z, ph: ph }); }
    if (shape === 'two') { var a = M.round(mu - R.pick([0.5, 1, 1.5]) * sd), b = M.round(mu + R.pick([0.5, 1, 1.5]) * sd), za = z2((a - 0.5 - mu) / sd), zb = z2((b + 0.5 - mu) / sd), pa = phiT(za), pb = phiT(zb);
      return chk({ q: setup + 'Use the normal approximation with the continuity correction to estimate $P(' + a + ' \\le X \\le ' + b + ')$. Use $\\Phi(' + za.toFixed(2) + ') = ' + pa.toFixed(4) + '$ and $\\Phi(' + zb.toFixed(2) + ') = ' + pb.toFixed(4) + '$.', a: { t: 'num', v: String(Number((pb - pa).toFixed(4))), tol: 0.002 },
        steps: ['Both ends are included, so widen to $' + (a - 0.5) + ' < Y < ' + (b + 0.5) + '$.', '$z$-scores: $\\dfrac{' + (a - 0.5) + ' - ' + num(mu) + '}{' + num(sd) + '} \\approx ' + za.toFixed(2) + '$ and $\\dfrac{' + (b + 0.5) + ' - ' + num(mu) + '}{' + num(sd) + '} \\approx ' + zb.toFixed(2) + '$.', '$P \\approx ' + pb.toFixed(4) + ' - ' + pa.toFixed(4) + ' = ' + (pb - pa).toFixed(4) + '$.'],
        hint: 'Widen both ends by half a unit.' }, { kind: 'two', n: n, p: qp(p), a: a, b: b, za: za, zb: zb, pa: pa, pb: pb }); }
    var k3 = M.round(mu) + R.int(-2, 2), za2 = z2((k3 - 0.5 - mu) / sd), zb2 = z2((k3 + 0.5 - mu) / sd), pa2 = phiT(za2), pb2 = phiT(zb2);
    return chk({ q: setup + 'A normal curve gives $P(X = ' + k3 + ') = 0$ unless you use the continuity correction. Estimate $P(X = ' + k3 + ')$ with it. Use $\\Phi(' + za2.toFixed(2) + ') = ' + pa2.toFixed(4) + '$ and $\\Phi(' + zb2.toFixed(2) + ') = ' + pb2.toFixed(4) + '$.', a: { t: 'num', v: String(Number((pb2 - pa2).toFixed(4))), tol: 0.002 },
      steps: ['$X = ' + k3 + '$ becomes the interval $' + (k3 - 0.5) + ' < Y < ' + (k3 + 0.5) + '$ of width 1.', '$z$-scores $\\approx ' + za2.toFixed(2) + '$ and $' + zb2.toFixed(2) + '$.', '$P \\approx ' + pb2.toFixed(4) + ' - ' + pa2.toFixed(4) + ' = ' + (pb2 - pa2).toFixed(4) + '$.'],
      hint: 'A single whole number becomes an interval of width 1.' }, { kind: 'exact', n: n, p: qp(p), k: k3, za: za2, zb: zb2, pa: pa2, pb: pb2 });
  });


  // ================================================================ Unit 7: Markov Chains
  var NAMES2 = [['Sunny', 'Rainy'], ['Working', 'Broken'], ['Brand A', 'Brand B'], ['Home', 'Away'], ['Awake', 'Asleep']];
  var NAMES3 = [['A', 'B', 'C'], ['Low', 'Mid', 'High'], ['Sun', 'Cloud', 'Rain'], ['Bus', 'Car', 'Bike']];
  var STEPF = [q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(1, 5), q(2, 5), q(3, 5)];
  function chain2(R) { var a = R.pick(STEPF), b = R.pick(STEPF); return [[Q(1).sub(a), a], [b, Q(1).sub(b)]]; }
  function chain3(R, opts) { // rows with small denominators; irreducible, with a positive diagonal entry (so aperiodic)
    opts = opts || {};
    for (var tries = 0; tries < 200; tries++) {
      var P3 = [0, 1, 2].map(function () { var d = R.pick([2, 3, 4]), w = [R.int(0, d), 0, 0]; w[1] = R.int(0, d - w[0]); w[2] = d - w[0] - w[1]; w = R.shuffle(w); return w.map(function (x) { return q(x, d); }); });
      if (!P3.some(function (r, i) { return !r[i].isZero(); })) continue;
      if (P3.some(function (r, i) { return r[i].eq(1); })) continue;
      var reach = function (s) { var seen = [s], st = [s]; while (st.length) { var u = st.pop(); for (var v = 0; v < 3; v++) if (!P3[u][v].isZero() && seen.indexOf(v) < 0) { seen.push(v); st.push(v); } } return seen.length === 3; };
      if (reach(0) && reach(1) && reach(2)) return P3;
    }
    return [[q(1, 2), q(1, 4), q(1, 4)], [q(1, 3), q(1, 3), q(1, 3)], [q(1, 4), q(1, 2), q(1, 4)]];
  }
  function mmul(A, B) { return A.map(function (r) { return B[0].map(function (_, j) { return sumQ(r.map(function (x, k) { return x.mul(B[k][j]); })); }); }); }
  function vmul(v, A) { return A[0].map(function (_, j) { return sumQ(v.map(function (x, k) { return x.mul(A[k][j]); })); }); }
  function mviz(P, names, extra) { var o = { P: P.map(function (r) { return r.map(qp); }), names: names, mode: 'diagram', quiet: true, edit: false, label: 'Diagram of the Markov chain: states ' + names.join(', ') }; for (var k in extra || {}) o[k] = extra[k]; return { name: 'prob-markov', opts: o }; }
  function stationary(P) { var n = P.length, A = P[0].map(function (_, j) { return P.map(function (r, i) { return r[j].sub(i === j ? 1 : 0); }); }); A[n - 1] = P.map(function () { return Q(1); }); return solveQ(A, P.map(function (_, i) { return Q(i === n - 1 ? 1 : 0); })); }

  G('prob.markov-chains', function (R, ctx) {
    var shape = by(ctx, R.pick(['two', 'pi1']), R.pick(['P2', 'two3']), R.pick(['pi2', 'path', 'side']));
    if (shape === 'two' || shape === 'pi1' || shape === 'P2') {
      var P = chain2(R), nm = R.pick(NAMES2), Pt = matTex(P);
      var intro = 'A two-state Markov chain moves between ' + nm[0] + ' (state 1) and ' + nm[1] + ' (state 2) with transition matrix $$P = ' + Pt + '$$ (row $i$ lists the chances of moving from state $i$; each row adds to 1). ';
      if (shape === 'two') { var i = R.int(0, 1), j = R.int(0, 1), v = P[i][0].mul(P[0][j]).add(P[i][1].mul(P[1][j]));
        return chk({ q: intro + 'If today is ' + nm[i] + ', what is the probability that the day after tomorrow is ' + nm[j] + '?', a: ex(v), viz: mviz(P, nm, { matrix: false }),
          steps: ['Condition on tomorrow (the first step): it is ' + nm[0] + ' or ' + nm[1] + '.', '$P(X_2 = \\text{' + nm[j] + '} \\mid X_0 = \\text{' + nm[i] + '}) = ' + qt(P[i][0]) + ' \\cdot ' + qt(P[0][j]) + ' + ' + qt(P[i][1]) + ' \\cdot ' + qt(P[1][j]) + ' = ' + qt(v) + '$.', 'This is entry $(' + (i + 1) + ', ' + (j + 1) + ')$ of $P^{2}$: row ' + (i + 1) + ' of $P$ times column ' + (j + 1) + '.'],
          hint: 'Add over the two possible states tomorrow.' }, { kind: 'two', P: P.map(function (r) { return r.map(qp); }), i: i, j: j }); }
      if (shape === 'pi1') { var a = R.pick([q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(2, 5)]), pi0 = [a, Q(1).sub(a)], pi1 = vmul(pi0, P);
        return chk({ q: intro + 'Today the chance of ' + nm[0] + ' is $' + qt(a) + '$, so $\\pi_0 = ' + vecTex(pi0) + '$. Find $\\pi_1$, the distribution for tomorrow.', a: { t: 'tuple', v: pi1.map(qp) },
          steps: ['Rows of $P$ add to 1, so the distribution is a row vector and steps forward as $\\pi_1 = \\pi_0 P$ (the row vector on the left).', 'First entry: $' + qt(pi0[0]) + ' \\cdot ' + qt(P[0][0]) + ' + ' + qt(pi0[1]) + ' \\cdot ' + qt(P[1][0]) + ' = ' + qt(pi1[0]) + '$.', 'Second entry: $' + qt(pi0[0]) + ' \\cdot ' + qt(P[0][1]) + ' + ' + qt(pi0[1]) + ' \\cdot ' + qt(P[1][1]) + ' = ' + qt(pi1[1]) + '$. So $\\pi_1 = ' + vecTex(pi1) + '$, adding to 1.'],
          hint: 'Multiply the row vector π₀ by P: each entry is a row times a column.' }, { kind: 'pi1', P: P.map(function (r) { return r.map(qp); }), pi0: pi0.map(qp) }); }
      var P2 = mmul(P, P);
      return chk({ q: intro + 'Find the two-step transition matrix $P^{2}$.', a: { t: 'matrix', v: P2.map(function (r) { return r.map(qp); }) },
        steps: ['Entry $(i, j)$ of $P^{2}$ is the chance of going from $i$ to $j$ in two steps: row $i$ times column $j$.', '$P^{2} = ' + matTex(P2) + '$.', 'Check: each row of $P^{2}$ adds to 1, too.'],
        hint: 'Multiply P by itself.' }, { kind: 'P2', P: P.map(function (r) { return r.map(qp); }) });
    }
    var P3 = chain3(R), nm3 = R.pick(NAMES3), intro3 = 'A Markov chain on the states ' + nm3.join(', ') + ' (in that order) has transition matrix $$P = ' + matTex(P3) + '$$ ';
    if (shape === 'two3') { var i3 = R.int(0, 2), j3 = R.int(0, 2), v3 = sumQ([0, 1, 2].map(function (k) { return P3[i3][k].mul(P3[k][j3]); }));
      return chk(nl({ q: intro3 + 'Starting in ' + nm3[i3] + ', what is the probability of being in ' + nm3[j3] + ' after two steps?', a: ex(v3), viz: mviz(P3, nm3, { matrix: false }),
        steps: ['Add over the state after one step: $\\sum_k P_{' + nm3[i3] + ',k}\\,P_{k,' + nm3[j3] + '}$.', '$= ' + [0, 1, 2].map(function (k) { return qt(P3[i3][k]) + ' \\cdot ' + qt(P3[k][j3]); }).join(' + ') + ' = ' + qt(v3) + '$.'],
        hint: 'Row of the start state times column of the end state.' }), { kind: 'two3', P: P3.map(function (r) { return r.map(qp); }), i: i3, j: j3 }); }
    if (shape === 'pi2') { var s0 = R.int(0, 2), pi0 = [0, 1, 2].map(function (k) { return Q(k === s0 ? 1 : 0); }), p1 = vmul(pi0, P3), p2 = vmul(p1, P3);
      return chk(nl({ q: intro3 + 'The chain starts in ' + nm3[s0] + '. Find the distribution $\\pi_2$ after two steps.', a: { t: 'tuple', v: p2.map(qp) },
        steps: ['$\\pi_0 = ' + vecTex(pi0) + '$ and $\\pi_1 = \\pi_0 P = ' + vecTex(p1) + '$ (row ' + (s0 + 1) + ' of $P$).', '$\\pi_2 = \\pi_1 P$: each entry is $\\pi_1$ times a column of $P$.', '$\\pi_2 = ' + vecTex(p2) + '$, which adds to 1.'],
        hint: 'Step twice: π₁ = π₀P, then π₂ = π₁P.' }), { kind: 'pi2', P: P3.map(function (r) { return r.map(qp); }), s0: s0 }); }
    if (shape === 'path') { var st = [R.int(0, 2)]; for (var t = 0; t < 3; t++) { var opts = [0, 1, 2].filter(function (k) { return !P3[st[st.length - 1]][k].isZero(); }); st.push(R.pick(opts)); }
      var pv = Q(1); for (t = 0; t < 3; t++) pv = pv.mul(P3[st[t]][st[t + 1]]);
      return chk({ q: intro3 + 'Starting in ' + nm3[st[0]] + ', what is the probability that the next three states are ' + nm3[st[1]] + ', ' + nm3[st[2]] + ', ' + nm3[st[3]] + ', in that order?', a: ex(pv),
        steps: ['By the Markov property each step depends only on the current state, so multiply the one-step chances along the path.', '$' + [0, 1, 2].map(function (k) { return 'P_{\\text{' + nm3[st[k]] + '},\\text{' + nm3[st[k + 1]] + '}}'; }).join(' \\cdot ') + ' = ' + [0, 1, 2].map(function (k) { return qt(P3[st[k]][st[k + 1]]); }).join(' \\cdot ') + ' = ' + qt(pv) + '$.'],
        hint: 'Multiply the transition probabilities along the path.' }, { kind: 'path', P: P3.map(function (r) { return r.map(qp); }), st: st }); }
    var P4 = chain2(R), nm4 = R.pick(NAMES2), pi = [R.pick([q(1, 2), q(1, 3), q(1, 4)]), null]; pi[1] = Q(1).sub(pi[0]);
    var right = vmul(pi, P4), wrong = P4.map(function (r) { return r[0].mul(pi[0]).add(r[1].mul(pi[1])); });
    if (right[0].eq(wrong[0])) { P4 = [[q(3, 4), q(1, 4)], [q(1, 2), q(1, 2)]]; right = vmul(pi, P4); wrong = P4.map(function (r) { return r[0].mul(pi[0]).add(r[1].mul(pi[1])); }); }
    return chk({ q: 'A chain has transition matrix $P = ' + matTex(P4) + '$, whose rows add to 1, and today\'s distribution is $\\pi_0 = ' + vecTex(pi) + '$. Which is tomorrow\'s distribution?', a: mc('$' + vecTex(right) + '$, from $\\pi_0 P$', ['$' + vecTex(wrong) + '$, from $P\\pi_0$ (treating $\\pi_0$ as a column)', '$' + vecTex(pi) + '$, unchanged', '$' + vecTex([P4[0][0], P4[0][1]]) + '$, the first row of $P$']),
      steps: ['With rows adding to 1, row $i$ holds the chances of leaving state $i$. Tomorrow\'s chance of state $j$ adds today\'s chance of each state $i$ times $P_{ij}$: that is $\\pi_0 P$, the row vector on the left.', '$\\pi_0 P = ' + vecTex(right) + '$, which adds to 1. (Linear Algebra writes columns that add to 1 and multiplies $P\\mathbf{x}$; with this row convention, $P\\pi_0$ mixes the wrong entries and need not even add to 1: here it gives $' + vecTex(wrong) + '$.)'],
      hint: 'Rows add to 1, so the distribution is a row vector on the left.' }, { kind: 'side', P: P4.map(function (r) { return r.map(qp); }), pi: pi.map(qp) });
  });

  G('prob.first-step-analysis', function (R, ctx) {
    var shape = by(ctx, R.pick(['ruin', 'simple']), R.pick(['ruinT', 'chain']), R.pick(['unfair', 'pattern', 'chainT']));
    if (shape === 'ruin' || shape === 'ruinT') { var N = R.int(3, 8), k = R.int(1, N - 1), T2 = shape === 'ruinT';
      var v = T2 ? Q(k * (N - k)) : q(k, N);
      return chk({ q: 'A gambler has \\$' + k + ' and bets \\$1 at a time on fair coin flips, winning or losing \\$1 each time. She stops when she reaches \\$' + N + ' or goes broke. ' + (T2 ? 'What is the expected number of bets until she stops?' : 'What is the probability that she reaches \\$' + N + '?'), a: ex(v),
        viz: { name: 'prob-markov', opts: { P: ruinP(N, q(1, 2)), names: Array.from({ length: N + 1 }, function (_, i) { return '$' + i; }), mode: 'diagram', layout: 'line', quiet: true, edit: false, matrix: false, label: 'The chain of the gambler\'s fortune, 0 to ' + N + ' dollars' } },
        steps: T2 ? ['Let $m_i$ be the expected number of bets from \\$$i$. Then $m_0 = m_{' + N + '} = 0$, and for $0 < i < ' + N + '$, first-step analysis gives $m_i = 1 + \\frac{1}{2}m_{i - 1} + \\frac{1}{2}m_{i + 1}$ (the 1 counts the bet just made).', 'The solution is $m_i = i(' + N + ' - i)$: check $1 + \\frac{1}{2}(i - 1)(' + (N + 1) + ' - i) + \\frac{1}{2}(i + 1)(' + (N - 1) + ' - i) = i(' + N + ' - i)$.', 'So $m_{' + k + '} = ' + k + ' \\cdot ' + (N - k) + ' = ' + k * (N - k) + '$.']
          : ['Let $h_i$ be the chance of reaching \\$' + N + ' from \\$$i$: $h_0 = 0$, $h_{' + N + '} = 1$.', 'First step: $h_i = \\frac{1}{2}h_{i - 1} + \\frac{1}{2}h_{i + 1}$, so the $h_i$ go up by equal amounts: $h_i = \\frac{i}{' + N + '}$.', '$h_{' + k + '} = ' + qt(v) + '$.'],
        hint: T2 ? 'Write m_i = 1 + average of the neighbors; remember the +1.' : 'With a fair coin, h_i changes in equal steps from 0 to 1.' }, { kind: shape, N: N, k: k }); }
    if (shape === 'simple') { var pa = R.pick(STEPF.slice(0, 6)), pb = R.pick([q(1, 6), q(1, 4), q(1, 5), q(1, 3)]); if (pa.add(pb).ge(1)) pb = Q(1).sub(pa).div(2); var stay = Q(1).sub(pa).sub(pb), v2 = pa.div(pa.add(pb));
      return chk({ q: 'A robot in room M moves to room A with probability $' + qt(pa) + '$, to room B with probability $' + qt(pb) + '$, and otherwise stays in M for another round, independently each round. Rooms A and B lock behind it. What is the probability that it ends up in room A?', a: ex(v2),
        steps: ['Let $h$ be the chance of ending in A, starting from M. Condition on the first round: $h = ' + qt(pa) + ' \\cdot 1 + ' + qt(pb) + ' \\cdot 0 + ' + qt(stay) + 'h$.', '$' + qt(Q(1).sub(stay)) + 'h = ' + qt(pa) + '$, so $h = ' + qt(v2) + '$.', 'The rounds spent waiting do not matter: it is the share of A among the two ways out, $\\frac{' + qt(pa) + '}{' + qt(pa) + ' + ' + qt(pb) + '}$.'],
        hint: 'Condition on the first round; staying puts you back where you started.' }, { kind: 'simple', pa: qp(pa), pb: qp(pb) }); }
    if (shape === 'unfair') { var p = R.pick([q(2, 3), q(1, 3), q(3, 5), q(2, 5), q(3, 4), q(1, 4)]), N2 = R.int(3, 5), k2 = R.int(1, N2 - 1), r = Q(1).sub(p).div(p), v3 = Q(1).sub(r.pow(k2)).div(Q(1).sub(r.pow(N2)));
      return chk({ q: 'A player starts with ' + k2 + ' chips and plays rounds that win 1 chip with probability $' + qt(p) + '$ and lose 1 chip otherwise, independently. Play stops at ' + N2 + ' chips or at 0. What is the probability of reaching ' + N2 + ' chips?', a: ex(v3),
        steps: ['Let $h_i$ be the chance of reaching ' + N2 + ' from $i$ chips: $h_0 = 0$, $h_{' + N2 + '} = 1$, and $h_i = ' + qt(p) + 'h_{i + 1} + ' + qt(Q(1).sub(p)) + 'h_{i - 1}$.', 'Rearranged, $h_{i + 1} - h_i = r(h_i - h_{i - 1})$ with $r = \\frac{q}{p} = ' + qt(r) + '$: the gaps grow (or shrink) by the factor $r$, so $h_i = \\dfrac{1 - r^{i}}{1 - r^{' + N2 + '}}$.', '$h_{' + k2 + '} = \\dfrac{1 - ' + par(qt(r)) + '^{' + k2 + '}}{1 - ' + par(qt(r)) + '^{' + N2 + '}} = ' + qt(v3) + '$.'],
        hint: 'Write h_i from the first round, then look at the differences h_(i+1) − h_i.' }, { kind: 'unfair', p: qp(p), N: N2, k: k2 }); }
    if (shape === 'pattern') { var pat = R.pick([['HH', 6], ['HT', 4], ['HHH', 14], ['two sixes in a row', 42], ['a six', 6]]);
      var stTxt = pat[0] === 'HH' ? ['States: start (no useful flip yet) and "just flipped H". Let $m_0$, $m_1$ be the expected flips still needed.', '$m_0 = 1 + \\frac{1}{2}m_1 + \\frac{1}{2}m_0$ and $m_1 = 1 + \\frac{1}{2} \\cdot 0 + \\frac{1}{2}m_0$ (a T sends you back to the start).', 'From the first, $m_0 = 2 + m_1$; substituting, $m_1 = 1 + \\frac{1}{2}(2 + m_1)$, so $m_1 = 4$ and $m_0 = 6$.']
        : pat[0] === 'HT' ? ['States: start, and "have an H". Once you have an H, you are waiting for the first T.', '$m_0 = 1 + \\frac{1}{2}m_1 + \\frac{1}{2}m_0$ and $m_1 = 1 + \\frac{1}{2}m_1 + \\frac{1}{2} \\cdot 0$ (another H keeps you in "have an H").', 'So $m_1 = 2$ and $m_0 = 2 + m_1 = 4$.']
          : pat[0] === 'HHH' ? ['States by the current run of heads: 0, 1, 2. A T sends you back to 0.', '$m_0 = 1 + \\frac{1}{2}m_1 + \\frac{1}{2}m_0$, $m_1 = 1 + \\frac{1}{2}m_2 + \\frac{1}{2}m_0$, $m_2 = 1 + \\frac{1}{2} \\cdot 0 + \\frac{1}{2}m_0$.', 'The first gives $m_0 = 2 + m_1$. Substituting: $m_2 = 2 + \\frac{1}{2}m_1$ and $m_1 = 3 + \\frac{3}{4}m_1$, so $m_1 = 12$, $m_2 = 8$ and $m_0 = 14$.']
            : pat[0] === 'a six' ? ['Let $m$ be the expected rolls. Condition on the first roll: $m = 1 + \\frac{5}{6}m$ (a non-six puts you back at the start).', '$\\frac{1}{6}m = 1$, so $m = 6$.']
              : ['States: start, and "just rolled a six". $m_0 = 1 + \\frac{1}{6}m_1 + \\frac{5}{6}m_0$ and $m_1 = 1 + \\frac{1}{6} \\cdot 0 + \\frac{5}{6}m_0$.', 'The first gives $m_0 = 6 + m_1$; then $m_1 = 1 + \\frac{5}{6}(6 + m_1)$, so $\\frac{1}{6}m_1 = 6$, $m_1 = 36$ and $m_0 = 42$.'];
      return chk({ q: (pat[0].indexOf('six') >= 0 ? 'Roll a fair die' : 'Flip a fair coin') + ' until you see ' + (pat[0].indexOf('six') >= 0 ? pat[0] : pat[0] + ' (in consecutive flips)') + '. What is the expected number of ' + (pat[0].indexOf('six') >= 0 ? 'rolls' : 'flips') + '?', a: ex(pat[1]),
        steps: stTxt.concat(['Every equation has "1 +" for the ' + (pat[0].indexOf('six') >= 0 ? 'roll' : 'flip') + ' just made.']), hint: 'Name the states by how much of the pattern you have, then condition on the next ' + (pat[0].indexOf('six') >= 0 ? 'roll.' : 'flip.') }, { kind: 'pattern', pat: pat[0] }); }
    // a random chain with two transient states (1, 2) and two absorbing ones (A, B)
    var w; do { w = [0, 1].map(function () { var d = R.pick([3, 4, 6]), parts = [R.int(0, d), 0, 0, 0]; var left = d - parts[0]; parts[1] = R.int(0, left); left -= parts[1]; parts[2] = R.int(0, left); parts[3] = left - parts[2]; return R.shuffle(parts).map(function (x) { return q(x, d); }); }); }
    while (w[0][2].add(w[0][3]).add(w[1][2]).add(w[1][3]).isZero() || w[0][0].eq(1) || w[1][1].eq(1) || (w[0][2].add(w[0][3]).isZero() && w[0][1].isZero()) || (w[1][2].add(w[1][3]).isZero() && w[1][0].isZero()) || w.some(function (r) { return r.filter(function (x) { return !x.isZero(); }).length < 2; }) || w[0][2].add(w[1][2]).isZero() || w[0][3].add(w[1][3]).isZero());
    // rows: from 1, from 2; columns: to 1, to 2, to A, to B
    var A2 = [[Q(1).sub(w[0][0]), w[0][1].neg()], [w[1][0].neg(), Q(1).sub(w[1][1])]], hs = solveQ(A2, [w[0][2], w[1][2]]), ms = solveQ(A2, [Q(1), Q(1)]), wantT = shape === 'chainT';
    if (!hs || !ms) { w = [[q(1, 3), q(1, 3), q(1, 3), Q(0)], [q(1, 4), q(1, 4), Q(0), q(1, 2)]]; A2 = [[q(2, 3), q(-1, 3)], [q(-1, 4), q(3, 4)]]; hs = solveQ(A2, [w[0][2], w[1][2]]); ms = solveQ(A2, [Q(1), Q(1)]); }
    var Pfull = [w[0], w[1], [Q(0), Q(0), Q(1), Q(0)], [Q(0), Q(0), Q(0), Q(1)]], nms = ['1', '2', 'A', 'B'];
    return chk({ q: 'A Markov chain on states 1, 2, A, B has transition matrix (rows and columns in that order) $$P = ' + matTex(Pfull) + '$$ States A and B are absorbing. Starting in state 1, ' + (wantT ? 'what is the expected number of steps until the chain is absorbed?' : 'what is the probability that it is absorbed in A?'), a: ex(wantT ? ms[0] : hs[0]),
      viz: mviz(Pfull, nms, { matrix: false }),
      steps: wantT ? ['Let $m_1, m_2$ be the expected steps to absorption. Each step counts 1, and absorbing states need 0 more:', '$m_1 = ' + T.terms([[Q(1), ''], [w[0][0], 'm_1'], [w[0][1], 'm_2']]) + '$ and $m_2 = ' + T.terms([[Q(1), ''], [w[1][0], 'm_1'], [w[1][1], 'm_2']]) + '$.', 'Solving: $m_1 = ' + qt(ms[0]) + '$ (and $m_2 = ' + qt(ms[1]) + '$).']
        : ['Let $h_1, h_2$ be the chances of absorption in A. Then $h_A = 1$, $h_B = 0$, and conditioning on the first step:', '$h_1 = ' + T.terms([[w[0][0], 'h_1'], [w[0][1], 'h_2'], [w[0][2], '']]) + '$ and $h_2 = ' + T.terms([[w[1][0], 'h_1'], [w[1][1], 'h_2'], [w[1][2], '']]) + '$.', 'Solving: $h_1 = ' + qt(hs[0]) + '$ (and $h_2 = ' + qt(hs[1]) + '$).'],
      hint: wantT ? 'One equation per transient state, each starting with 1 +.' : 'One equation per transient state, conditioning on the first step.' }, { kind: shape, w: w.map(function (r) { return r.map(qp); }) });
  });
  function ruinP(N, p) { var out = []; for (var i = 0; i <= N; i++) { var r = []; for (var j = 0; j <= N; j++) r.push(i === 0 || i === N ? (i === j ? '1' : '0') : j === i + 1 ? p.toPlain() : j === i - 1 ? Q(1).sub(p).toPlain() : '0'); out.push(r); } return out; }

  G('prob.stationary-distribution', function (R, ctx) {
    var shape = by(ctx, R.pick(['two', 'share']), 'three', R.pick(['bd', 'cost', 'return']));
    if (shape === 'two' || shape === 'share') { var P = chain2(R), nm = R.pick(NAMES2), a = P[0][1], b = P[1][0], pi = [b.div(a.add(b)), a.div(a.add(b))];
      var intro = 'A Markov chain on ' + nm[0] + ' and ' + nm[1] + ' (in that order) has transition matrix $$P = ' + matTex(P) + '$$ ';
      var st = ['Stationary: $\\pi P = \\pi$. The first entry says $\\pi_1 = ' + qt(P[0][0]) + '\\pi_1 + ' + qt(P[1][0]) + '\\pi_2$, so $' + qt(a) + '\\pi_1 = ' + qt(b) + '\\pi_2$: the flow out of ' + nm[0] + ' balances the flow in.', 'This only fixes the ratio, $\\pi_1 : \\pi_2 = ' + qt(b) + ' : ' + qt(a) + '$. Add the condition $\\pi_1 + \\pi_2 = 1$.', '$\\pi = ' + vecTex(pi) + '$.'];
      if (shape === 'two') return chk({ q: intro + 'Find the stationary distribution $\\pi = (\\pi_1, \\pi_2)$.', a: { t: 'tuple', v: pi.map(qp) }, steps: st, hint: 'Solve πP = π and use π₁ + π₂ = 1.' }, { kind: 'two', P: P.map(function (r) { return r.map(qp); }) });
      return chk({ q: intro + 'In the long run, what fraction of the time is the chain in ' + nm[1] + '?', a: ex(pi[1]), steps: st.concat(['The long-run share of time in ' + nm[1] + ' is $\\pi_2 = ' + qt(pi[1]) + '$.']), hint: 'The long-run share is the stationary probability.' }, { kind: 'share', P: P.map(function (r) { return r.map(qp); }) });
    }
    if (shape === 'three' || shape === 'cost' || shape === 'return') { var P3 = chain3(R), nm3 = R.pick(NAMES3), pi3 = stationary(P3), intro3 = 'A Markov chain on ' + nm3.join(', ') + ' (in that order) has transition matrix $$P = ' + matTex(P3) + '$$ ';
      var st3 = ['Write $\\pi P = \\pi$ as equations, one per column: ' + [0, 1, 2].map(function (j) { return '$\\pi_' + (j + 1) + ' = ' + T.terms([0, 1, 2].map(function (i) { return [P3[i][j], '\\pi_' + (i + 1)]; })) + '$'; }).join(', ') + '.', 'These equations are dependent (any one follows from the others), so drop one and add $\\pi_1 + \\pi_2 + \\pi_3 = 1$.', 'Solving: $\\pi = ' + vecTex(pi3) + '$. Check: $\\pi P = \\pi$.'];
      if (shape === 'three') return chk(nl({ q: intro3 + 'Find the stationary distribution $\\pi = (\\pi_1, \\pi_2, \\pi_3)$.', a: { t: 'tuple', v: pi3.map(qp) }, viz: mviz(P3, nm3, { matrix: false }), steps: st3, hint: 'Use two of the balance equations and π₁ + π₂ + π₃ = 1.' }), { kind: 'three', P: P3.map(function (r) { return r.map(qp); }) });
      if (shape === 'cost') { var cost = [R.int(1, 9), R.int(1, 9), R.int(1, 9)], avg = sumQ(pi3.map(function (p, i) { return p.mul(cost[i]); }));
        return chk(nl({ q: intro3 + 'Each step spent in ' + nm3.map(function (n2, i) { return n2 + ' costs \\$' + cost[i]; }).join(', ') + '. What is the long-run average cost per step, in dollars?', a: ex(avg), steps: st3.concat(['Long-run average cost $= \\sum \\pi_i c_i = ' + pi3.map(function (p, i) { return qt(p) + ' \\cdot ' + cost[i]; }).join(' + ') + ' = ' + qt(avg) + '$.']), hint: 'Find π, then average the costs with weights π.' }), { kind: 'cost', P: P3.map(function (r) { return r.map(qp); }), cost: cost }); }
      var s = R.int(0, 2);
      return chk(nl({ q: intro3 + 'Starting from ' + nm3[s] + ', what is the expected number of steps until the chain first returns to ' + nm3[s] + '?', a: ex(pi3[s].inv()), steps: st3.concat(['In the long run the chain is in ' + nm3[s] + ' a fraction $\\pi_' + (s + 1) + ' = ' + qt(pi3[s]) + '$ of the time, so visits come on average every $\\frac{1}{\\pi_' + (s + 1) + '} = ' + qt(pi3[s].inv()) + '$ steps.']), hint: 'The mean return time is 1/π for that state.' }), { kind: 'return', P: P3.map(function (r) { return r.map(qp); }), s: s }); }
    // birth-death chain on 0..n with up-probability u and down-probability d (stay otherwise)
    var n = R.int(2, 3), up = R.pick([q(1, 2), q(1, 3), q(1, 4)]), dn = R.pick([q(1, 2), q(1, 3), q(1, 4), q(1, 6)]); if (up.eq(dn)) dn = q(1, 6);
    var Pb = []; for (var i = 0; i <= n; i++) { var row = []; for (var j = 0; j <= n; j++) row.push(Q(0)); if (i < n) row[i + 1] = up; if (i > 0) row[i - 1] = dn; row[i] = Q(1).sub(i < n ? up : Q(0)).sub(i > 0 ? dn : Q(0)); Pb.push(row); }
    var rr = up.div(dn), wts = []; for (i = 0; i <= n; i++) wts.push(rr.pow(i)); var Z = sumQ(wts), pib = wts.map(function (x) { return x.div(Z); });
    return chk({ q: 'A queue holds $0$ to $' + n + '$ people. Each minute one person arrives with probability $' + qt(up) + '$ (unless the queue is full), or one leaves with probability $' + qt(dn) + '$ (unless it is empty); otherwise nothing changes. The transition matrix on $0, 1, \\ldots, ' + n + '$ is $$P = ' + matTex(Pb) + '$$ Find the stationary distribution $(\\pi_0, \\ldots, \\pi_' + n + ')$.', a: { t: 'tuple', v: pib.map(qp) },
      steps: ['In the long run the flow up across each gap equals the flow down: $\\pi_i \\cdot ' + qt(up) + ' = \\pi_{i + 1} \\cdot ' + qt(dn) + '$.', 'So each $\\pi_{i + 1} = ' + qt(rr) + '\\pi_i$, and $\\pi \\propto ' + vecTex(wts) + '$.', 'Divide by the total $' + qt(Z) + '$ so the entries add to 1: $\\pi = ' + vecTex(pib) + '$.'],
      hint: 'Balance the flow across each gap between neighboring states.' }, { kind: 'bd', n: n, up: qp(up), dn: qp(dn) });
  });


})(window.MathLadder);
