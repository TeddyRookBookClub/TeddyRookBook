/* Math Ladder problem generators: Calculus 3: Multivariable Calculus (calc3). One generator per topic in data/math/topics/calc3.json.
   Built from parts by the course builder; every answer is computed from the generated numbers (exact rationals,
   exact polynomial algebra and exact trig integrals) and checked independently in node tests (numeric integration,
   CAS derivatives, brute-force search). Problems carry p.chk: the raw data those tests use. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T;
  // ===================================================================== shared helpers (calc3 + calc4)
  // Exact numbers are ML.Q. Polynomials in several variables (class Poly) give exact derivatives and exact
  // iterated integrals over polynomial-bounded regions; intCS integrates polynomials in cos and sin over
  // multiples of a quarter turn exactly (result r + p·π). Every answer is computed from the generated numbers.
  var Q = ML.Q, U = ML.util;
  // The typesetter reads "$2 ... xyz$" (a digit first, then a 3-letter run) as money; a leading {} keeps it math.
  // Inline math wider than about 270 px (a phone-width card) becomes display math, which scrolls inside its own box
  // instead of widening the page; punctuation right after it moves inside.
  var WIDE_EM = 15.5;
  function fixMath(s, wide) { // wide: the em limit for that text (0 or undefined: leave inline math alone)
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
  function q(x) { return x instanceof Q ? x : Q.from(x); }
  function qt(x) { return q(x).toTex(); }
  function qp(x) { return q(x).toPlain(); }
  function qn(x) { return q(x).toNumber(); }
  function pf(x) { return T.p(q(x)); }                        // TeX, parenthesized when negative
  function pick(R, arr) { return R.pick(arr); }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }

  // ---- k·√n (k a Q, n a positive whole number), simplified ----
  function radNorm(k, n) { k = q(k); if (n === 0 || k.isZero()) return { k: Q(0), n: 1 }; var s = U.simplifyRadical(n); return { k: k.mul(s[0]), n: s[1] }; }
  function radPlain(k, n) {
    var r = radNorm(k, n); if (r.n === 1) return r.k.toPlain();
    var a = r.k.abs(), num = a.n === 1n ? 'sqrt(' + r.n + ')' : a.n + '*sqrt(' + r.n + ')';
    return (r.k.sign() < 0 ? '-' : '') + (a.d === 1n ? num : '(' + num + ')/' + a.d);
  }
  function radTex(k, n) {
    var r = radNorm(k, n); if (r.n === 1) return r.k.toTex();
    var a = r.k.abs(), num = (a.n === 1n ? '' : a.n.toString()) + '\\sqrt{' + r.n + '}';
    return (r.k.sign() < 0 ? '-' : '') + (a.d === 1n ? num : '\\frac{' + num + '}{' + a.d + '}');
  }
  function sqrtQPlain(v) { v = q(v); return radPlain(Q(1, v.den()), v.num() * v.den()); }   // √(p/q) = √(pq)/q
  function sqrtQTex(v) { v = q(v); return radTex(Q(1, v.den()), v.num() * v.den()); }
  function unitPlain(w) { var n2 = vn2(w), p = n2.num(), d = n2.den(); return w.map(function (x) { return radPlain(q(x).div(p), p * d); }); }
  function unitTex(w) { var n2 = vn2(w), p = n2.num(), d = n2.den(); return w.map(function (x) { return radTex(q(x).div(p), p * d); }); }
  function sqrtTex(n) { return radTex(1, n); }
  function sqrtPlain(n) { return radPlain(1, n); }
  // ---- k·π ----
  function piPowPlain(k, e) { k = q(k); if (k.isZero()) return '0'; var a = k.abs(), s = k.sign() < 0 ? '-' : ''; return s + (a.n === 1n ? '' : a.n + '*') + 'pi^' + e + (a.d === 1n ? '' : '/' + a.d); }
  function piPowTex(k, e) { k = q(k); if (k.isZero()) return '0'; var a = k.abs(), s = k.sign() < 0 ? '-' : '', top = (a.n === 1n ? '' : a.n.toString()) + '\\pi^{' + e + '}'; return s + (a.d === 1n ? top : '\\frac{' + top + '}{' + a.d + '}'); }
  function piPlain(k) { k = q(k); if (k.isZero()) return '0'; var a = k.abs(), s = k.sign() < 0 ? '-' : ''; return s + (a.n === 1n ? '' : a.n + '*') + 'pi' + (a.d === 1n ? '' : '/' + a.d); }
  function piTex(k) { k = q(k); if (k.isZero()) return '0'; var a = k.abs(), s = k.sign() < 0 ? '-' : '', top = (a.n === 1n ? '' : a.n.toString()) + '\\pi'; return s + (a.d === 1n ? top : '\\frac{' + top + '}{' + a.d + '}'); }
  // ---- r + p·π ----
  function rpPlain(v) { var r = q(v.r), p = q(v.p); if (p.isZero()) return r.toPlain(); if (r.isZero()) return piPlain(p); return r.toPlain() + (p.sign() < 0 ? ' - ' : ' + ') + piPlain(p.abs()); }
  function rpTex(v) { var r = q(v.r), p = q(v.p); if (p.isZero()) return r.toTex(); if (r.isZero()) return piTex(p); return r.toTex() + (p.sign() < 0 ? ' - ' : ' + ') + piTex(p.abs()); }
  function rpNum(v) { return qn(v.r) + qn(v.p) * Math.PI; }

  // ---- vectors of Q ----
  function V(a) { return a.map(q); }
  function vadd(a, b) { return a.map(function (x, i) { return q(x).add(b[i]); }); }
  function vsub(a, b) { return a.map(function (x, i) { return q(x).sub(b[i]); }); }
  function vsc(k, a) { return a.map(function (x) { return q(x).mul(k); }); }
  function vdot(a, b) { var s = Q(0); a.forEach(function (x, i) { s = s.add(q(x).mul(b[i])); }); return s; }
  function vcross(a, b) { a = V(a); b = V(b); return [a[1].mul(b[2]).sub(a[2].mul(b[1])), a[2].mul(b[0]).sub(a[0].mul(b[2])), a[0].mul(b[1]).sub(a[1].mul(b[0]))]; }
  function vn2(a) { return vdot(a, a); }
  function vTex(a) { return T.vec(a.map(q)); }
  function ptTex(a) { return T.pt(a.map(q)); }
  function vPlain(a) { return a.map(qp); }
  function vZero(a) { return a.every(function (x) { return q(x).isZero(); }); }
  function vint(a) { return a.map(function (x) { return qn(x); }); }
  // integer vectors whose length is a whole number: [a, b, c, |v|]
  var PY3 = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 5, 14, 15], [2, 10, 11, 15], [1, 12, 12, 17], [8, 9, 12, 17]];
  var PY2 = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25]];
  function py3(R, maxN) { var L = PY3.filter(function (t) { return t[3] <= (maxN || 99); }), t = R.pick(L), v = R.shuffle(t.slice(0, 3)).map(function (x) { return x * R.sign(); }); return { v: v, n: t[3] }; }
  function py2(R, maxN) { var L = PY2.filter(function (t) { return t[2] <= (maxN || 99); }), t = R.pick(L), v = R.shuffle(t.slice(0, 2)).map(function (x) { return x * R.sign(); }); return { v: v, n: t[2] }; }

  // ===================================================================== polynomials in several variables
  function Poly(vars, m) { this.vars = vars; this.m = m || {}; }
  function key(e) { return e.join(','); }
  function unkey(k) { return k.split(',').map(Number); }
  Poly.c = function (vars, c) { var p = new Poly(vars); c = q(c); if (!c.isZero()) p.m[key(vars.map(function () { return 0; }))] = c; return p; };
  Poly.v = function (vars, name) { var e = vars.map(function (v) { return v === name ? 1 : 0; }); if (e.indexOf(1) < 0) throw new Error('Poly: no variable ' + name); var p = new Poly(vars); p.m[key(e)] = Q(1); return p; };
  Poly.mono = function (vars, c, exps) { var p = new Poly(vars); c = q(c); if (!c.isZero()) p.m[key(exps)] = c; return p; };
  // from a list of [coef, {x: 2, y: 1}] pairs
  Poly.of = function (vars, list) { var p = new Poly(vars); list.forEach(function (t) { p = p.add(Poly.mono(vars, t[0], vars.map(function (v) { return (t[1] && t[1][v]) || 0; }))); }); return p; };
  Poly.prototype.lift = function (o) { return o instanceof Poly ? o : Poly.c(this.vars, o); };
  Poly.prototype.add = function (o) { o = this.lift(o); var m = {}, k; for (k in this.m) m[k] = this.m[k]; for (k in o.m) { var s = (m[k] || Q(0)).add(o.m[k]); if (s.isZero()) delete m[k]; else m[k] = s; } return new Poly(this.vars, m); };
  Poly.prototype.neg = function () { var m = {}; for (var k in this.m) m[k] = this.m[k].neg(); return new Poly(this.vars, m); };
  Poly.prototype.sub = function (o) { return this.add(this.lift(o).neg()); };
  Poly.prototype.scale = function (c) { c = q(c); if (c.isZero()) return new Poly(this.vars); var m = {}; for (var k in this.m) m[k] = this.m[k].mul(c); return new Poly(this.vars, m); };
  Poly.prototype.mul = function (o) {
    if (!(o instanceof Poly)) return this.scale(o);
    var out = new Poly(this.vars);
    for (var a in this.m) for (var b in o.m) { var ea = unkey(a), eb = unkey(b), e = ea.map(function (x, i) { return x + eb[i]; }); out = out.add(Poly.mono(this.vars, this.m[a].mul(o.m[b]), e)); }
    return out;
  };
  Poly.prototype.pow = function (n) { var r = Poly.c(this.vars, 1); for (var i = 0; i < n; i++) r = r.mul(this); return r; };
  Poly.prototype.idx = function (name) { var i = this.vars.indexOf(name); if (i < 0) throw new Error('Poly: no variable ' + name); return i; };
  Poly.prototype.d = function (name) {
    var i = this.idx(name), out = new Poly(this.vars);
    for (var k in this.m) { var e = unkey(k); if (!e[i]) continue; var c = this.m[k].mul(e[i]); e[i]--; out = out.add(Poly.mono(this.vars, c, e)); }
    return out;
  };
  Poly.prototype.integ = function (name) { // antiderivative in one variable
    var i = this.idx(name), out = new Poly(this.vars);
    for (var k in this.m) { var e = unkey(k); e[i]++; out = out.add(Poly.mono(this.vars, this.m[k].div(e[i]), e)); }
    return out;
  };
  Poly.prototype.subst = function (name, p) { // replace a variable by a polynomial (same vars) or a number
    p = this.lift(p); var i = this.idx(name), out = new Poly(this.vars);
    for (var k in this.m) { var e = unkey(k), n = e[i]; e[i] = 0; out = out.add(Poly.mono(this.vars, this.m[k], e).mul(p.pow(n))); }
    return out;
  };
  Poly.prototype.substAll = function (map) { // simultaneous: {x: Poly, y: Poly}; polys may use another var list given by map.__vars
    var self = this, vars2 = map.__vars || this.vars, out = Poly.c(vars2, 0);
    for (var k in this.m) {
      var e = unkey(k), t = Poly.c(vars2, this.m[k]);
      e.forEach(function (n, i) { if (!n) return; var v = self.vars[i], r = map[v] !== undefined ? map[v] : Poly.v(vars2, v); if (!(r instanceof Poly)) r = Poly.c(vars2, r); t = t.mul(r.pow(n)); });
      out = out.add(t);
    }
    return out;
  };
  Poly.prototype.defint = function (name, lo, hi) { var F = this.integ(name); return F.subst(name, hi).sub(F.subst(name, lo)); };
  Poly.prototype.at = function (env) { // env: {x: number|string|Q}; missing variables count as 0
    var s = Q(0), self = this;
    for (var k in this.m) { var e = unkey(k), t = this.m[k]; e.forEach(function (n, i) { if (n) t = t.mul(q(env[self.vars[i]] === undefined ? 0 : env[self.vars[i]]).pow(n)); }); s = s.add(t); }
    return s;
  };
  Poly.prototype.atNum = function (env) { var s = 0, self = this; for (var k in this.m) { var e = unkey(k), t = qn(this.m[k]); e.forEach(function (n, i) { if (n) t *= Math.pow(env[self.vars[i]] || 0, n); }); s += t; } return s; };
  Poly.prototype.isZero = function () { return !Object.keys(this.m).length; };
  Poly.prototype.isConst = function () { for (var k in this.m) if (/[1-9]/.test(k)) return false; return true; };
  Poly.prototype.cval = function () { return this.at({}); };
  Poly.prototype.deg = function (name) { var i = name ? this.idx(name) : -1, d = 0; for (var k in this.m) { var e = unkey(k); d = Math.max(d, i < 0 ? e.reduce(function (a, b) { return a + b; }, 0) : e[i]); } return d; };
  Poly.prototype.has = function (name) { var i = this.idx(name); for (var k in this.m) if (unkey(k)[i]) return true; return false; };
  Poly.prototype.terms = function () { // [[Q, exps]] high total degree first, then by variable order
    var out = []; for (var k in this.m) out.push([this.m[k], unkey(k)]);
    out.sort(function (a, b) { var da = a[1].reduce(function (s, x) { return s + x; }, 0), db = b[1].reduce(function (s, x) { return s + x; }, 0); if (da !== db) return db - da; for (var i = 0; i < a[1].length; i++) if (a[1][i] !== b[1][i]) return b[1][i] - a[1][i]; return 0; });
    return out;
  };
  var TEXV = { theta: '\\theta', phi: '\\varphi', rho: '\\rho', cth: '\\cos\\theta', sth: '\\sin\\theta', cph: '\\cos\\varphi', sph: '\\sin\\varphi' };
  function monoTex(vars, e) { var s = ''; e.forEach(function (n, i) { if (!n) return; var v = TEXV[vars[i]] || vars[i]; if (/\\(cos|sin)/.test(v)) s += (s ? ' ' : '') + v.replace(/(\\(cos|sin))/, n === 1 ? '$1' : '$1^{' + n + '}'); else s += (s && /^\\/.test(v) ? ' ' : '') + (n === 1 ? v : v + '^{' + n + '}'); }); return s; }
  function monoPlain(vars, e) { var parts = []; e.forEach(function (n, i) { if (!n) return; var v = { cth: 'cos(theta)', sth: 'sin(theta)', cph: 'cos(phi)', sph: 'sin(phi)' }[vars[i]] || vars[i]; parts.push(n === 1 ? v : v + '^' + n); }); return parts.join('*'); }
  Poly.prototype.toTex = function () { var self = this; return T.terms(this.terms().map(function (t) { return [t[0], monoTex(self.vars, t[1])]; })); };
  Poly.prototype.toPlain = function () {
    var self = this, s = '';
    this.terms().forEach(function (t) {
      var c = t[0], m = monoPlain(self.vars, t[1]), a = c.abs(), body;
      if (!m) body = a.toPlain(); else if (a.eq(1)) body = m; else body = (a.d === 1n ? a.n + '*' : '(' + a.toPlain() + ')*') + m;
      s += s ? (c.sign() < 0 ? ' - ' : ' + ') + body : (c.sign() < 0 ? '-' : '') + body;
    });
    return s || '0';
  };
  Poly.prototype.texParen = function () { var s = this.toTex(); return Object.keys(this.m).length > 1 ? '\\left(' + s + '\\right)' : s; };
  Poly.prototype.plainParen = function () { var s = this.toPlain(); return '(' + s + ')'; };
  function PX(vars) { var o = {}; vars.forEach(function (v) { o[v] = Poly.v(vars, v); }); o.c = function (k) { return Poly.c(vars, k); }; return o; }

  // ===================================================================== ∫ cos^m sin^n over quarter turns, exactly
  function I00(m, n) { // over [0, π/2]: {r, p} (value r + p·π)
    if (m >= 2) { var a = I00(m - 2, n), f = Q(m - 1, m + n); return { r: a.r.mul(f), p: a.p.mul(f) }; }
    if (n >= 2) { var b = I00(m, n - 2), g = Q(n - 1, m + n); return { r: b.r.mul(g), p: b.p.mul(g) }; }
    if (m === 0 && n === 0) return { r: Q(0), p: Q(1, 2) };
    if (m === 1 && n === 1) return { r: Q(1, 2), p: Q(0) };
    return { r: Q(1), p: Q(0) };
  }
  // poly whose only variables left are a cosine and a sine of one angle (names cn, sn: 'cth', 'sth' or 'cph', 'sph');
  // integrate the angle from j0·π/2 to j1·π/2
  function intCS(p, j0, j1, cn, sn) {
    var ic = p.idx(cn || 'cth'), is = p.idx(sn || 'sth'), tot = { r: Q(0), p: Q(0) };
    for (var k in p.m) {
      var e = unkey(k), m = e[ic], n = e[is], c0 = p.m[k];
      for (var j = j0; j < j1; j++) { // shift θ = φ + jπ/2: (c, s) -> rotate j times: c -> -s, s -> c
        var mm = m, nn = n, sg = 1;
        for (var r = 0; r < ((j % 4) + 4) % 4; r++) { if (mm % 2) sg = -sg; var t = mm; mm = nn; nn = t; }
        var I = I00(mm, nn);
        tot.r = tot.r.add(I.r.mul(c0).mul(sg)); tot.p = tot.p.add(I.p.mul(c0).mul(sg));
      }
    }
    return tot;
  }
  function rpScale(v, k) { return { r: q(v.r).mul(k), p: q(v.p).mul(k) }; }
  function rpAdd(a, b) { return { r: q(a.r).add(b.r), p: q(a.p).add(b.p) }; }

  // ===================================================================== text helpers
  function eqTex(l, r) { return l + ' = ' + r; }
  function mc(R, correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function dispM(s) { return '$$' + s + '$$'; }
  function signTerm(c, s) { c = q(c); return c.isZero() ? '' : (c.sign() < 0 ? ' - ' : ' + ') + (c.abs().eq(1) && s ? '' : c.abs().toTex()) + s; }
  function angTex(k) { return piTex(k); } // k·π radians
  var NICE_ANG = [[Q(0), '1', '0'], [Q(1, 6), 'sqrt(3)/2', '1/2'], [Q(1, 4), 'sqrt(2)/2', 'sqrt(2)/2'], [Q(1, 3), '1/2', 'sqrt(3)/2'], [Q(1, 2), '0', '1'], [Q(2, 3), '-1/2', 'sqrt(3)/2'], [Q(3, 4), '-sqrt(2)/2', 'sqrt(2)/2'], [Q(5, 6), '-sqrt(3)/2', '1/2'], [Q(1), '-1', '0']];

  // ===================================================================== Ex: exact expressions for derivatives
  // A sum of terms p · Π F(u), with p a Poly and F one of exp, sin, cos, ln, pow (u a Poly, pow has a rational
  // exponent n). Supports d(v) (product and chain rules), exact values where the factors are nice (e^0, sin 0,
  // cos 0, ln 1, rational powers of perfect squares), numbers, plain (CAS) text and TeX.
  function Fac(f, u, n) { return { f: f, u: u, n: n === undefined || n === null ? null : q(n) }; }
  function facSig(F) { return F.f + '|' + (F.n ? F.n.toString() : '') + '|' + F.u.toPlain(); }
  function Ex(vars, t) { this.vars = vars; this.t = t || {}; }
  function termSig(F) { return F.map(facSig).sort().join('&'); }
  Ex.poly = function (p) { var e = new Ex(p.vars); if (!p.isZero()) e.t[''] = { p: p, F: [] }; return e; };
  Ex.c = function (vars, c) { return Ex.poly(Poly.c(vars, c)); };
  Ex.fn = function (f, u, n, coef) { var vars = u.vars, p = coef instanceof Poly ? coef : Poly.c(vars, coef === undefined ? 1 : coef); var e = new Ex(vars); if (!p.isZero()) { var F = [Fac(f, u, n)]; e.t[termSig(F)] = { p: p, F: F }; } return e; };
  Ex.prototype.addTerm = function (p, F) {
    // merge pow factors with the same base, drop pow with exponent 0
    var out = [], byU = {};
    F.forEach(function (f) { if (f.f === 'pow') { var k = f.u.toPlain(); if (byU[k]) { byU[k].n = byU[k].n.add(f.n); return; } var g = Fac('pow', f.u, f.n); byU[k] = g; out.push(g); } else out.push(f); });
    out = out.filter(function (f) { return !(f.f === 'pow' && f.n.isZero()); });
    // a pow factor whose base is a constant becomes a number when it is rational
    var p2 = p, keep = [];
    out.forEach(function (f) { if (f.u.isConst() && f.f === 'pow' && f.n.isInt()) p2 = p2.scale(f.u.cval().pow(f.n.num())); else keep.push(f); });
    if (p2.isZero()) return this;
    var sg = termSig(keep), cur = this.t[sg];
    if (cur) { var s = cur.p.add(p2); if (s.isZero()) delete this.t[sg]; else this.t[sg] = { p: s, F: cur.F }; }
    else this.t[sg] = { p: p2, F: keep };
    return this;
  };
  Ex.prototype.copy = function () { var e = new Ex(this.vars); for (var k in this.t) e.t[k] = { p: this.t[k].p, F: this.t[k].F }; return e; };
  Ex.prototype.add = function (o) { if (o instanceof Poly) o = Ex.poly(o); var e = this.copy(); for (var k in o.t) e.addTerm(o.t[k].p, o.t[k].F); return e; };
  Ex.prototype.neg = function () { var e = new Ex(this.vars); for (var k in this.t) e.t[k] = { p: this.t[k].p.neg(), F: this.t[k].F }; return e; };
  Ex.prototype.sub = function (o) { if (o instanceof Poly) o = Ex.poly(o); return this.add(o.neg()); };
  Ex.prototype.scale = function (c) { var e = new Ex(this.vars); for (var k in this.t) e.addTerm(this.t[k].p.scale(c), this.t[k].F); return e; };
  Ex.prototype.mul = function (o) {
    if (!(o instanceof Ex)) { if (o instanceof Poly) o = Ex.poly(o); else return this.scale(o); }
    var e = new Ex(this.vars);
    for (var a in this.t) for (var b in o.t) e.addTerm(this.t[a].p.mul(o.t[b].p), this.t[a].F.concat(o.t[b].F));
    return e;
  };
  Ex.prototype.isZero = function () { return !Object.keys(this.t).length; };
  Ex.prototype.isPoly = function () { var ks = Object.keys(this.t); return !ks.length || (ks.length === 1 && ks[0] === ''); };
  Ex.prototype.poly = function () { return this.t[''] ? this.t[''].p : Poly.c(this.vars, 0); };
  function facD(F, v) { // derivative of one factor: an Ex
    var du = F.u.d(v); if (du.isZero()) return new Ex(F.u.vars);
    var one = Poly.c(F.u.vars, 1), e = new Ex(F.u.vars);
    if (F.f === 'exp') e.addTerm(du, [F]);
    else if (F.f === 'sin') e.addTerm(du, [Fac('cos', F.u)]);
    else if (F.f === 'cos') e.addTerm(du.neg(), [Fac('sin', F.u)]);
    else if (F.f === 'ln') e.addTerm(du, [Fac('pow', F.u, -1)]);
    else if (F.f === 'pow') e.addTerm(du.scale(F.n), F.n.eq(1) ? [] : [Fac('pow', F.u, F.n.sub(1))]);
    return e;
  }
  Ex.prototype.d = function (v) {
    var e = new Ex(this.vars);
    for (var k in this.t) {
      var p = this.t[k].p, F = this.t[k].F;
      e.addTerm(p.d(v), F);
      F.forEach(function (f, i) { var rest = F.filter(function (_, j) { return j !== i; }), df = facD(f, v); for (var kk in df.t) e.addTerm(p.mul(df.t[kk].p), rest.concat(df.t[kk].F)); });
    }
    return e;
  };
  Ex.prototype.subst = function (map) { // substitute polynomials (map.__vars: the new variable list) into everything
    var vars2 = map.__vars || this.vars, e = new Ex(vars2);
    for (var k in this.t) e.addTerm(this.t[k].p.substAll(map), this.t[k].F.map(function (f) { return Fac(f.f, f.u.substAll(map), f.n); }));
    return e;
  };
  function facAt(F, env) { // exact value of one factor or null
    var u = F.u.at(env);
    if (F.f === 'exp') return u.isZero() ? Q(1) : null;
    if (F.f === 'sin') return u.isZero() ? Q(0) : null;
    if (F.f === 'cos') return u.isZero() ? Q(1) : null;
    if (F.f === 'ln') return u.eq(1) ? Q(0) : null;
    if (F.n.isInt()) return u.isZero() && F.n.sign() < 0 ? null : u.pow(F.n.num());
    if (F.n.d === 2n && u.sign() > 0 && U.isSquare(Number(u.n)) && U.isSquare(Number(u.d))) { var r = Q(Math.round(Math.sqrt(Number(u.n))), Math.round(Math.sqrt(Number(u.d)))); return r.pow(Number(F.n.n)); }
    return null;
  }
  Ex.prototype.at = function (env) { var s = Q(0); for (var k in this.t) { var v = this.t[k].p.at(env); for (var i = 0; i < this.t[k].F.length; i++) { if (v.isZero()) break; var f = facAt(this.t[k].F[i], env); if (f === null) return null; v = v.mul(f); } s = s.add(v); } return s; };
  Ex.prototype.num = function (env) { var s = 0; for (var k in this.t) { var v = this.t[k].p.atNum(env); this.t[k].F.forEach(function (f) { var u = f.u.atNum(env); v *= f.f === 'exp' ? Math.exp(u) : f.f === 'sin' ? Math.sin(u) : f.f === 'cos' ? Math.cos(u) : f.f === 'ln' ? Math.log(u) : Math.pow(u, qn(f.n)); }); s += v; } return s; };
  function facTex(F, n, inDen) { // n: exponent override (for denominators)
    var u = F.u.toTex(), multi = Object.keys(F.u.m).length > 1, simple = !multi && !/[\^]/.test(u) && /^[a-z\\]/.test(u) && u.length <= 8;
    if (F.f === 'exp') return 'e^{' + u + '}';
    if (F.f === 'sin' || F.f === 'cos' || F.f === 'ln') return '\\' + F.f + (simple && !/\\/.test(u) ? ' ' + u : '\\left(' + u + '\\right)');
    var e = n || F.n;
    if (e.eq(Q(1, 2))) return '\\sqrt{' + u + '}';
    var base = multi || !/^[a-z]$/.test(u) ? '\\left(' + u + '\\right)' : u;
    return e.eq(1) ? (multi && !inDen ? '\\left(' + u + '\\right)' : u) : base + '^{' + (e.isInt() ? e.toTex() : e.n + '/' + e.d) + '}';
  }
  function facPlain(F) { var u = F.u.toPlain(); if (F.f === 'exp') return 'e^(' + u + ')'; if (F.f !== 'pow') return F.f + '(' + u + ')'; return '(' + u + ')^(' + F.n.toPlain() + ')'; }
  var FORD = { exp: 0, sin: 1, cos: 2, ln: 3, pow: 4 };
  Ex.prototype.terms = function () { var self = this; return Object.keys(this.t).sort().map(function (k) { return self.t[k]; }).sort(function (a, b) { return a.F.length - b.F.length || (a.F.length && FORD[a.F[0].f] - FORD[b.F[0].f]) || 0; }); };
  Ex.prototype.toPlain = function () {
    var out = '';
    this.terms().forEach(function (t) {
      var pm = t.p.terms(), fs = t.F.map(facPlain), body, sg = 1;
      if (!fs.length) { var ps = t.p.toPlain(); if (!out) { out = ps; return; } out += ps[0] === '-' ? ' - ' + ps.slice(1) : ' + ' + ps; return; }
      if (pm.length === 1) { var c = pm[0][0], m = monoPlain(t.p.vars, pm[0][1]), a = c.abs(), parts = []; sg = c.sign(); if (!a.eq(1)) parts.push(a.d === 1n ? a.toPlain() : '(' + a.toPlain() + ')'); if (m) parts.push(m); body = parts.concat(fs).join('*'); }
      else body = '(' + t.p.toPlain() + ')*' + fs.join('*');
      out += out ? (sg < 0 ? ' - ' : ' + ') + body : (sg < 0 ? '-' : '') + body;
    });
    return out || '0';
  };
  Ex.prototype.toTex = function () {
    var out = '';
    this.terms().forEach(function (t) {
      var num = [], den = [], pm = t.p.terms(), single = pm.length === 1, c = single ? pm[0][0] : Q(1), sg = single ? c.sign() : 1;
      t.F.forEach(function (f) { if (f.f === 'pow' && f.n.sign() < 0) den.push(facTex(f, f.n.neg(), den.length === 0 && t.F.filter(function (g) { return g.f === 'pow' && g.n.sign() < 0; }).length === 1)); else num.push(facTex(f)); });
      var pstr;
      if (single) { var m = monoTex(t.p.vars, pm[0][1]); pstr = { c: c.abs(), m: m }; }
      var body;
      if (!den.length && !num.length) { var ps = t.p.toTex(); if (!out) out = ps; else out += ps[0] === '-' ? ' - ' + ps.slice(1) : ' + ' + ps; return; }
      if (!den.length) {
        if (single) { var lead = pstr.c.eq(1) && (pstr.m || num.length) ? '' : pstr.c.toTex(); body = lead + (lead && /^\d/.test(pstr.m) ? ' \\cdot ' : '') + pstr.m + (num.length ? (lead || pstr.m ? ' ' : '') + num.join(' ') : ''); }
        else body = '\\left(' + t.p.toTex() + '\\right)' + (num.length ? ' ' + num.join(' ') : '');
      } else {
        var top;
        if (single) { var cn = pstr.c.n, cd = pstr.c.d; top = (cn === 1n && (pstr.m || num.length) ? '' : cn.toString()) + pstr.m + (num.length ? (pstr.m || cn !== 1n ? ' ' : '') + num.join(' ') : ''); if (!top) top = '1'; body = '\\frac{' + top + '}{' + (cd === 1n ? '' : cd + ' ') + den.join(' ') + '}'; }
        else body = '\\frac{' + t.p.toTex() + (num.length ? ' ' + num.join(' ') : '') + '}{' + den.join(' ') + '}';
      }
      out += out ? (sg < 0 ? ' - ' : ' + ') + body : (sg < 0 ? '-' : '') + body;
    });
    return out || '0';
  };
  function EX(vars) { var o = PX(vars); o.exp = function (u, c) { return Ex.fn('exp', u, null, c); }; o.sin = function (u, c) { return Ex.fn('sin', u, null, c); }; o.cos = function (u, c) { return Ex.fn('cos', u, null, c); }; o.ln = function (u, c) { return Ex.fn('ln', u, null, c); }; o.pow = function (u, n, c) { return Ex.fn('pow', u, n, c); }; o.P = function (p) { return Ex.poly(p); }; return o; }

  // ---- rough rendered width of inline TeX, in em (calibrated against Chrome's MathML at 16px) ----
  var TW_OP = { '+': 1.2, '-': 1.2, '=': 1.3, '<': 1.3, '>': 1.3, '/': 0.5, '*': 0.6, '!': 0.3, "'": 0.3, ':': 0.6, ';': 0.45, '.': 0.28, ',': 0.45, '(': 0.39, ')': 0.39, '[': 0.28, ']': 0.28, '|': 0.28, '&': 0, '~': 0.33 };
  var TW_CMD = { ',': 0.17, ':': 0.22, ';': 0.28, '!': -0.17, ' ': 0.33, quad: 1, qquad: 2, cdot: 0.72, times: 1.2, div: 1.2, pm: 1.2, mp: 1.2, le: 1.3, ge: 1.3, leq: 1.3, geq: 1.3, ne: 1.3, neq: 1.3, approx: 1.3, equiv: 1.3, to: 1.5, rightarrow: 1.5, Rightarrow: 1.5, implies: 2, iff: 2, mapsto: 1.5, langle: 0.39, rangle: 0.39, lvert: 0.28, rvert: 0.28, '|': 0.5, '{': 0.5, '}': 0.5, lfloor: 0.45, rfloor: 0.45, lceil: 0.45, rceil: 0.45, infty: 1.0, nabla: 0.85, partial: 0.57, circ: 0.5, ldots: 1.2, cdots: 1.2, dots: 1.2, in: 1.2, subset: 1.2, cup: 1.1, cap: 1.1, perp: 1.2, parallel: 0.8, angle: 0.7, prime: 0.3, int: 0.75, oint: 0.75, iint: 1.15, iiint: 1.55, iiiint: 1.9, sum: 1.05, prod: 1.05, lim: 1.2, max: 1.6, min: 1.5, '$': 0.5, '%': 0.8, hbar: 0.6, ell: 0.45 };
  var TW_FN = /^(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|sinh|cosh|tanh|ln|log|exp|det|dim|deg|arg|gcd|ker|Pr)$/;
  var TW_IGN = /^(left|right|middle|displaystyle|textstyle|big|Big|bigg|Bigg|bigl|bigr|Bigl|Bigr|limits|nolimits|color|textcolor)$/;
  function texWidth(src) {
    var i = 0, s = String(src), disp = false;
    function skipSp() { while (s[i] === ' ') i++; }
    function group(k) { // parse a {…} group or a single token, return width
      skipSp(); if (s[i] === '{') { i++; var w = seq(k, '}'); i++; return w; } return atom(k);
    }
    function name() { var m = /^\\([A-Za-z]+|.)/.exec(s.slice(i)); i += m ? m[0].length : 1; return m ? m[1] : ''; }
    function atom(k) {
      var c = s[i];
      if (c === undefined) return 0;
      if (c === '\\') {
        var n = name();
        if (n === 'displaystyle') { disp = true; return 0; }
        if (n === 'color') { group(k); return 0; }
        if (TW_IGN.test(n)) { if (/^(left|right|middle)$/.test(n)) { skipSp(); if (s[i] === '\\') { var n2 = name(); return n2 === '.' ? 0 : (TW_CMD[n2] || 0.4) * k; } var ch = s[i++]; return ch === '.' ? 0 : (TW_OP[ch] || 0.4) * k; } return 0; }
        if (n === 'frac' || n === 'dfrac' || n === 'tfrac' || n === 'cfrac') { var big = n === 'dfrac' || (disp && n !== 'tfrac'), kk = big ? k : k * 0.9; var a = group(kk), b = group(kk); return Math.max(a, b) + 0.24 * k; }
        if (n === 'binom') { var a2 = group(k * 0.71), b2 = group(k * 0.71); return Math.max(a2, b2) + 0.9 * k; }
        if (n === 'sqrt') { skipSp(); var idx = 0; if (s[i] === '[') { var j = s.indexOf(']', i); idx = 0.4 * k; i = j + 1; } return group(k) + 0.85 * k + idx; }
        if (/^(mathbf|boldsymbol|bm)$/.test(n)) return group(k * 1.12);
        if (/^(mathrm|mathit|mathsf|mathtt|mathcal|mathbb|mathfrak|operatorname|vec|hat|bar|tilde|dot|ddot|overline|underline|widehat|widetilde|overrightarrow|overleftarrow|boxed|cancel|phantom)$/.test(n)) return group(k) + (n === 'operatorname' ? 0.17 * k : 0);
        if (/^(text|textbf|textit|mbox|textrm)$/.test(n)) { skipSp(); if (s[i] === '{') { var e = i + 1, d = 1; while (e < s.length && d) { if (s[e] === '{') d++; else if (s[e] === '}') d--; e++; } var t = s.slice(i + 1, e - 1); i = e; return t.length * 0.47 * k; } return 0.5 * k; }
        if (n === 'hspace') { group(k); return 0.5 * k; }
        if (n === 'begin') { var end = s.indexOf('\\end', i); var body = s.slice(i, end < 0 ? s.length : end); i = end < 0 ? s.length : s.indexOf('}', end) + 1; var rows = body.replace(/^\{[^}]*\}/, '').split('\\\\'); return Math.max.apply(null, rows.map(function (r) { return texWidth(r.replace(/&/g, ' \\quad ')); })) * k + 1 * k; }
        if (TW_FN.test(n)) return (n.length * 0.5 + 0.17) * k;
        if (n in TW_CMD) { var w0 = TW_CMD[n]; if (disp && /^(int|oint|iint|iiint|sum|prod)$/.test(n)) w0 *= 1.4; return w0 * k; }
        if (/^[A-Za-z]+$/.test(n)) return 0.6 * k; // greek letters and other symbols
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
    return disp ? w * 1.12 : w; // display style: bigger integral signs and fractions
  }

  // ---------- helpers shared by the calc3 and calc4 generators ----------
  function randPt(R, lo, hi) { return [R.int(lo, hi), R.int(lo, hi), R.int(lo, hi)]; }
  function nzVec(R, lo, hi) { var v; do { v = [R.int(lo, hi), R.int(lo, hi), R.int(lo, hi)]; } while (v.every(function (x) { return x === 0; })); return v; }
  function intLen(v) { var s = v.reduce(function (a, x) { return a + x * x; }, 0); return s; }
  function planeTex(n, d) { return T.terms([[n[0], 'x'], [n[1], 'y'], [n[2], 'z']]) + ' = ' + qt(d); }
  function planePlain(n, d) { var s = ''; ['x', 'y', 'z'].forEach(function (c, i) { var a = q(n[i]); if (a.isZero()) return; var body = (a.abs().eq(1) ? '' : a.abs().toPlain() + '*') + c; s += s ? (a.sign() < 0 ? ' - ' : ' + ') + body : (a.sign() < 0 ? '-' : '') + body; }); return s + ' = ' + qp(d); }
  function primitive(v) { var g = U.gcd.apply(null, v.map(function (x) { return Math.abs(qn(x)); })) || 1; var w = v.map(function (x) { return qn(x) / g; }); var first = w.find(function (x) { return x !== 0; }); if (first < 0) w = w.map(function (x) { return -x; }); return w; }
  var TRIG = {};
  [[0, [1, 1], [0, 1]], [Q(1, 6), [Q(1, 2), 3], [Q(1, 2), 1]], [Q(1, 4), [Q(1, 2), 2], [Q(1, 2), 2]], [Q(1, 3), [Q(1, 2), 1], [Q(1, 2), 3]], [Q(1, 2), [0, 1], [1, 1]]].forEach(function (r) {
    var a = q(r[0]);
    [[a, 1, 1], [Q(1).sub(a), -1, 1], [Q(1).add(a), -1, -1], [Q(2).sub(a), 1, -1]].forEach(function (w) { var key = w[0].toString(); if (!TRIG[key]) TRIG[key] = { c: { k: q(r[1][0]).mul(w[1]), n: r[1][1] }, s: { k: q(r[2][0]).mul(w[2]), n: r[2][1] } }; });
  });
  function radMul(a, b) { return radNorm(q(a.k).mul(b.k), a.n * b.n); }
  function rT(r) { return radTex(r.k, r.n); }
  function rP(r) { return radPlain(r.k, r.n); }
  function rNum(r) { return qn(r.k) * Math.sqrt(r.n); }
  var TV = ['t'], TX = EX(TV), tP = TX.t;
  function rTex(comps, name) { return (name || '\\mathbf{r}(t)') + ' = \\left\\langle ' + comps.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle'; }
  function tq(k) { return Poly.c(TV, k); }
  function lin1(a, b) { return tP.scale(a).add(b); } // a t + b
  var XY = ['x', 'y'], XYZ = ['x', 'y', 'z'], E2 = EX(XY), E3 = EX(XYZ);
  // shift the inner polynomials so every factor is exact (and defined) at the point env
  function anchor(e, env, R) {
    var e2 = new Ex(e.vars);
    for (var k in e.t) e2.addTerm(e.t[k].p, e.t[k].F.map(function (f) {
      var u = f.u, v = u.at(env);
      if (f.f === 'exp' || f.f === 'sin' || f.f === 'cos') u = u.sub(v);
      else if (f.f === 'ln') u = u.sub(v).add(1);
      else if (f.f === 'pow' && !f.n.isInt()) { var s = R ? R.pick([1, 2, 3]) : 2; u = u.sub(v).add(s * s); }
      else if (f.f === 'pow' && f.n.sign() < 0 && v.isZero()) u = u.add(1);
      return Fac(f.f, u, f.n);
    }));
    return e2;
  }
  function rmono(R, vars, maxDeg, cmax) { var ex = {}, tot = 0; vars.forEach(function (v) { ex[v] = R.int(0, maxDeg); tot += ex[v]; }); if (!tot) ex[vars[0]] = 1; return Poly.of(vars, [[R.nz(-(cmax || 5), cmax || 5), ex]]); }
  // a random function of x, y (or x, y, z) as an Ex; L = 1 polynomial, 2 one special term, 3 a product or chain term
  function randF(R, vars, L) {
    var X = EX(vars), x = X.x, y = X.y, z = X.z, f = Ex.poly(rmono(R, vars, 3).add(rmono(R, vars, 2)));
    if (L === 1 && R.coin()) f = f.add(Ex.poly(rmono(R, vars, 2)));
    if (L >= 2) {
      var a = R.nz(-3, 3), b = R.nz(-3, 3), c = R.nz(-4, 4), u = R.pick([x.mul(y).scale(a), x.scale(a).add(y.scale(b)), x.pow(2).add(y.scale(b))]);
      if (z && R.coin()) u = R.pick([x.mul(z).scale(a), y.scale(a).add(z.scale(b)), x.mul(y).mul(z)]);
      var menu = [function () { return X.exp(u, c); }, function () { return X.sin(u, c); }, function () { return X.cos(u, c); }, function () { return X.ln(x.pow(2).add(y.pow(2)).add(z ? z.pow(2) : 0), c); }];
      if (L >= 3) menu.push(function () { return X.exp(u, x.pow(R.int(1, 2)).scale(c)); }, function () { return X.pow(x.pow(2).add(y.pow(2)).add(R.int(1, 9)), Q(1, 2), c); }, function () { return X.sin(u, y.scale(c)); });
      f = f.add(R.pick(menu)());
    }
    return f;
  }
  function dTex(v, ord) { return ord ? 'f_{' + ord + '}' : '\\dfrac{\\partial f}{\\partial ' + v + '}'; }
  function fdef(f, vars) { return 'f(' + (vars || f.vars).join(', ') + ') = ' + f.toTex(); }
  function envPt(vars, P) { var e = {}; vars.forEach(function (v, i) { e[v] = P[i]; }); return e; }
  function radSum(list) { // [{k, n}] -> combined {plain, tex}, grouping equal radicands
    var by = {}; list.forEach(function (r) { var z = radNorm(r.k, r.n); if (z.k.isZero()) return; by[z.n] = (by[z.n] || Q(0)).add(z.k); });
    var ks = Object.keys(by).map(Number).filter(function (n) { return !by[n].isZero(); }).sort(function (a, b) { return a - b; });
    if (!ks.length) return { plain: '0', tex: '0' };
    var pl = '', tx = '';
    ks.forEach(function (n, i) { var p = radPlain(by[n], n), t = radTex(by[n], n); if (!i) { pl = p; tx = t; } else { pl += p[0] === '-' ? ' - ' + p.slice(1) : ' + ' + p; tx += t[0] === '-' ? ' - ' + t.slice(1) : ' + ' + t; } });
    return { plain: pl, tex: tx };
  }
  function I2(f, ylo, yhi, xa, xb) { return f.defint('y', ylo, yhi).defint('x', xa, xb).cval(); } // ∫_xa^xb ∫_ylo^yhi f dy dx
  function polyXY(R, deg, n) { var p = new Poly(XY); for (var i = 0; i < (n || 2); i++) p = p.add(rmono(R, XY, deg || 2, 4)); return p.isZero() ? Poly.of(XY, [[1, { x: 1 }]]) : p; }
  function intTex(f, lims, dv) { // lims outermost first: [['a','b'], ...]; dv like ['dx','dy'] innermost first
    var s = ''; lims.forEach(function (L) { s += '\\int_{' + L[0] + '}^{' + L[1] + '} '; });
    return s + (f.indexOf(' + ') >= 0 || f.indexOf(' - ') > 0 ? '\\left(' + f + '\\right)' : f) + '\\,' + dv.join('\\,');
  }
  function decQ(v) { return v.isTerminating() ? v.toDec(6).replace(/\.?0+$/, '') : v.toPlain(); }
  var RCS = ['r', 'cth', 'sth'];
  function toPolar(f) { var r = Poly.v(RCS, 'r'), c = Poly.v(RCS, 'cth'), s = Poly.v(RCS, 'sth'); return f.substAll({ __vars: RCS, x: r.mul(c), y: r.mul(s) }); }
  function polarInt(fp, r0, r1, j0, j1) { // ∫_{j0π/2}^{j1π/2} ∫_{r0}^{r1} fp · r dr dθ, fp in RCS
    var inner = fp.mul(Poly.v(RCS, 'r')).defint('r', r0, r1); return intCS(inner, j0, j1, 'cth', 'sth');
  }
  var RZ = ['r', 'z', 'cth', 'sth'];
  function toCyl(f) { var r = Poly.v(RZ, 'r'), c = Poly.v(RZ, 'cth'), s = Poly.v(RZ, 'sth'); return f.substAll({ __vars: RZ, x: r.mul(c), y: r.mul(s), z: Poly.v(RZ, 'z') }); }


  // ===================================================================== g3_1space.js
  // ---------- unit: Vectors and Space ----------
  function distSteps(P, Qp) {
    var d = vsub(Qp, P), s = vn2(d);
    return { d: d, s: s.num(), steps: ['Differences: $\\Delta x = ' + qt(d[0]) + '$, $\\Delta y = ' + qt(d[1]) + '$, $\\Delta z = ' + qt(d[2]) + '$.',
      'Square and add all three: $' + d.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + ' = ' + s.toTex() + '$.',
      'Take the square root: $d = \\sqrt{' + s.toTex() + '} = ' + sqrtTex(s.num()) + '$.'] };
  }

  G('calc3.space-coordinates', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['dist', 'dist', 'mid', 'plane'], ['dist', 'axis', 'mid', 'sphere'], ['dist', 'sphere', 'sphere', 'axis']));
    if (kind === 'dist') {
      var P = randPt(R, -6, 6), d = L === 1 ? py3(R, 11).v : nzVec(R, -6, 6); if (L > 1 && U.isSquare(intLen(d)) && R.coin()) d[0] += 1;
      var Qp = vadd(P, d), ds = distSteps(P, Qp);
      return { q: 'Find the distance between $P' + ptTex(P) + '$ and $Q' + ptTex(Qp) + '$.', a: { t: 'num', v: sqrtPlain(ds.s) },
        steps: ['In space the distance formula has three squared differences: $d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2 + (\\Delta z)^2}$.'].concat(ds.steps),
        hint: 'Use all three coordinates: square the differences in $x$, $y$ and $z$, add, then take the square root.', chk: { k: 'dist', P: vint(P), Q: vint(Qp) }, nolint: ['+ 0'] };
    }
    if (kind === 'mid') {
      var A = randPt(R, -8, 8), B = randPt(R, -8, 8), M = vsc(Q(1, 2), vadd(A, B));
      return { q: 'Find the midpoint of the segment from $A' + ptTex(A) + '$ to $B' + ptTex(B) + '$.', a: { t: 'tuple', v: vPlain(M) },
        steps: ['Average each coordinate: $M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}, \\frac{z_1 + z_2}{2}\\right)$.',
          '$x$: $\\frac{' + A[0] + T.signed(B[0]) + '}{2} = ' + qt(M[0]) + '$, $y$: $\\frac{' + A[1] + T.signed(B[1]) + '}{2} = ' + qt(M[1]) + '$, $z$: $\\frac{' + A[2] + T.signed(B[2]) + '}{2} = ' + qt(M[2]) + '$.',
          'So $M = ' + ptTex(M) + '$.'],
        hint: 'The midpoint averages the two $x$-values, the two $y$-values and the two $z$-values.', chk: { k: 'mid', A: A, B: B }, nolint: ['+ 0'] };
    }
    if (kind === 'plane') {
      var zi = R.int(0, 2), P2 = nzVec(R, -7, 7).map(function (x, i) { return i === zi ? 0 : (x || 3); });
      var names = ['the $yz$-plane', 'the $xz$-plane', 'the $xy$-plane'], wrong = names.filter(function (s, i) { return i !== zi; });
      return { q: 'The point $' + ptTex(P2) + '$ lies in which coordinate plane?', a: mc(R, names[zi], wrong.concat(['the $' + 'xyz'[zi] + '$-axis'])),
        steps: ['Its $' + 'xyz'[zi] + '$-coordinate is $0$.', 'Every point with $' + 'xyz'[zi] + ' = 0$ lies in the plane spanned by the other two axes: ' + names[zi] + '.'],
        hint: 'Which coordinate is zero?', chk: { k: 'plane', P: P2 } };
    }
    if (kind === 'axis') {
      var P3 = nzVec(R, -8, 8).map(function (x) { return x || 2; }), ax = R.int(0, 2), other = [0, 1, 2].filter(function (i) { return i !== ax; });
      var toPlane = R.coin(), s2;
      if (toPlane) {
        var pl = R.int(0, 2), plName = ['yz', 'xz', 'xy'][pl];
        return { q: 'How far is the point $' + ptTex(P3) + '$ from the $' + plName + '$-plane?', a: { t: 'num', v: String(Math.abs(P3[pl])) },
          steps: ['The $' + plName + '$-plane is where $' + 'xyz'[pl] + ' = 0$.', 'The shortest path to it runs parallel to the $' + 'xyz'[pl] + '$-axis, so the distance is $|' + 'xyz'[pl] + '| = |' + P3[pl] + '| = ' + Math.abs(P3[pl]) + '$.'],
          hint: 'Only one coordinate measures how far you are from that plane.', chk: { k: 'toplane', P: P3, pl: pl }, nolint: ['+ 0'] };
      }
      s2 = P3[other[0]] * P3[other[0]] + P3[other[1]] * P3[other[1]];
      return { q: 'How far is the point $' + ptTex(P3) + '$ from the $' + 'xyz'[ax] + '$-axis?', a: { t: 'num', v: sqrtPlain(s2) },
        steps: ['The closest point on the $' + 'xyz'[ax] + '$-axis has the same $' + 'xyz'[ax] + '$-coordinate and zeros elsewhere.', 'So only the other two coordinates count: $d = \\sqrt{' + T.pow(pf(P3[other[0]]), 2) + ' + ' + T.pow(pf(P3[other[1]]), 2) + '} = \\sqrt{' + s2 + '} = ' + sqrtTex(s2) + '$.'],
        hint: 'Drop straight to the axis: the coordinate along the axis does not change.', chk: { k: 'toaxis', P: P3, ax: ax }, nolint: ['+ 0'] };
    }
    // sphere: x^2 + y^2 + z^2 + Dx + Ey + Fz + G = 0
    var C = randPt(R, -5, 5), r = R.int(1, 7), Dv = C.map(function (c) { return -2 * c; }), Gc = C[0] * C[0] + C[1] * C[1] + C[2] * C[2] - r * r;
    var eq = 'x^{2} + y^{2} + z^{2}' + T.coef(Dv[0], 'x', false) + T.coef(Dv[1], 'y', false) + T.coef(Dv[2], 'z', false) + T.signed(Gc) + ' = 0';
    var cs = ['xyz'].join('');
    return { q: 'Find the center and radius of the sphere $' + eq + '$.', a: { t: 'multi', parts: [{ label: 'center', a: { t: 'tuple', v: C.map(String) } }, { label: 'radius', a: { t: 'num', v: String(r) } }] },
      steps: ['Group each variable and complete the square: add $\\left(\\frac{b}{2}\\right)^2$ for each linear coefficient $b$.',
        [0, 1, 2].map(function (i) { var v = cs[i]; return Dv[i] ? '$' + v + '^{2}' + T.coef(Dv[i], v, false) + ' = ' + T.pow('(' + T.lin(1, v, -C[i]) + ')', 2) + ' - ' + C[i] * C[i] + '$' : '$' + v + '^{2}$ needs nothing'; }).join(', ') + '.',
        'So $' + [0, 1, 2].map(function (i) { return C[i] ? T.pow('(' + T.lin(1, cs[i], -C[i]) + ')', 2) : cs[i] + '^{2}'; }).join(' + ') + ' = ' + (C[0] * C[0] + C[1] * C[1] + C[2] * C[2]) + T.signed(-Gc) + ' = ' + r * r + '$.',
        'Center $' + ptTex(C) + '$ (signs flip), radius $\\sqrt{' + r * r + '} = ' + r + '$.'],
      hint: 'Complete the square in $x$, in $y$ and in $z$, then match $(x - a)^2 + (y - b)^2 + (z - c)^2 = r^2$.', chk: { k: 'sphere', D: Dv, G: Gc }, nolint: ['+ 0'] };
  });

  G('calc3.vectors-in-space', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['pq', 'lin', 'mag'], ['lin', 'mag', 'unit', 'scale'], ['unit', 'scale', 'lin', 'par']));
    if (kind === 'pq') {
      var P = randPt(R, -7, 7), Qp = randPt(R, -7, 7), d = vsub(Qp, P);
      return { q: 'Find the vector $\\overrightarrow{PQ}$ from $P' + ptTex(P) + '$ to $Q' + ptTex(Qp) + '$.', a: { t: 'tuple', v: vPlain(d) },
        steps: ['A vector from $P$ to $Q$ is "end minus start": $\\overrightarrow{PQ} = \\langle x_Q - x_P, y_Q - y_P, z_Q - z_P \\rangle$.', '$= \\langle ' + Qp[0] + ' - ' + pf(P[0]) + ', ' + Qp[1] + ' - ' + pf(P[1]) + ', ' + Qp[2] + ' - ' + pf(P[2]) + ' \\rangle = ' + vTex(d) + '$.'],
        hint: 'Subtract the starting point from the ending point, one coordinate at a time.', chk: { k: 'pq', P: P, Q: Qp }, nolint: ['+ 0', '--'] };
    }
    if (kind === 'lin') {
      var u = randPt(R, -5, 5), v = nzVec(R, -5, 5), a = R.nz(-4, 4), b = R.nz(-4, 4), w = vadd(vsc(a, u), vsc(b, v));
      return { q: 'Let $\\mathbf{u} = ' + vTex(u) + '$ and $\\mathbf{v} = ' + vTex(v) + '$. Find $' + T.coef(a, '\\mathbf{u}') + T.coef(b, '\\mathbf{v}', false) + '$.', a: { t: 'tuple', v: vPlain(w) },
        steps: ['Scale each vector component by component: $' + T.coef(a, '\\mathbf{u}') + ' = ' + vTex(vsc(a, u)) + '$ and $' + T.coef(b, '\\mathbf{v}') + ' = ' + vTex(vsc(b, v)) + '$.', 'Add matching components: $' + vTex(w) + '$.'],
        hint: 'Multiply every component by the scalar, then add $x$ to $x$, $y$ to $y$ and $z$ to $z$.', chk: { k: 'lin', u: u, v: v, a: a, b: b } };
    }
    if (kind === 'mag') {
      var m = L === 1 ? py3(R, 11).v : nzVec(R, -6, 6), s = intLen(m);
      return { q: 'Find the length $|\\mathbf{v}|$ of $\\mathbf{v} = ' + vTex(m) + '$.', a: { t: 'num', v: sqrtPlain(s) },
        steps: ['$|\\mathbf{v}| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$.', '$= \\sqrt{' + m.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + '} = \\sqrt{' + s + '} = ' + sqrtTex(s) + '$.'],
        hint: 'Square each component, add, and take the square root.', chk: { k: 'mag', v: m }, nolint: ['+ 0'] };
    }
    if (kind === 'unit') {
      var pv = L < 3 ? py3(R, 15) : null, uv = pv ? pv.v : nzVec(R, -4, 4), s2 = intLen(uv), un;
      if (U.isSquare(s2)) { var n0 = Math.sqrt(s2); un = uv.map(function (x) { return Q(x, n0); }); }
      var ans = uv.map(function (x) { return radPlain(Q(x, s2), s2); }), texU = uv.map(function (x) { return radTex(Q(x, s2), s2); });
      return { q: 'Find the unit vector in the direction of $\\mathbf{v} = ' + vTex(uv) + '$.', a: { t: 'tuple', v: ans },
        steps: ['First the length: $|\\mathbf{v}| = \\sqrt{' + s2 + '} = ' + sqrtTex(s2) + '$.', 'Divide every component by the length: $\\dfrac{\\mathbf{v}}{|\\mathbf{v}|} = \\left\\langle ' + texU.join(', ') + ' \\right\\rangle$.', 'Check: its length is $1$, and it points the same way as $\\mathbf{v}$.'],
        hint: 'A unit vector is the vector divided by its own length.', chk: { k: 'unit', v: uv } };
    }
    if (kind === 'scale') {
      var p3 = py3(R, 11), k = R.pick([2, 3, 4, 5, 6].filter(function (x) { return x !== p3.n; })), Lw = k * p3.n, out = p3.v.map(function (x) { return x * k; });
      var flip = L > 2 && R.coin(); if (flip) out = out.map(function (x) { return -x; });
      return { q: 'Find the vector of length $' + Lw + '$ that points in the ' + (flip ? 'opposite direction to' : 'same direction as') + ' $\\mathbf{v} = ' + vTex(p3.v) + '$.', a: { t: 'tuple', v: out.map(String) },
        steps: ['$|\\mathbf{v}| = ' + p3.n + '$, so the unit vector is $\\frac{1}{' + p3.n + '}\\mathbf{v}$.', 'Multiply by the length you want' + (flip ? ' and by $-1$ to turn it around' : '') + ': $' + (flip ? '-' : '') + '\\frac{' + Lw + '}{' + p3.n + '}\\mathbf{v} = ' + vTex(out) + '$.'],
        hint: 'Make a unit vector first, then stretch it to the length you need.', chk: { k: 'scale', v: p3.v, len: Lw, flip: flip } };
    }
    // parallel: <a, m*v2, b> parallel to v
    var base = nzVec(R, -4, 4).map(function (x) { return x || 1; }), kk = R.pick([-3, -2, 2, 3, Q(1, 2), Q(-1, 2)]), tgt = vsc(kk, base), idx = R.int(0, 2);
    var shown = tgt.map(function (x, i) { return i === idx ? qt(x) : ['a', 'b', 'c'][i]; }), others = [0, 1, 2].filter(function (i) { return i !== idx; });
    return { q: 'For which values of the unknowns is $\\langle ' + shown.join(', ') + ' \\rangle$ parallel to $' + vTex(base) + '$?', a: { t: 'multi', parts: others.map(function (i) { return { label: '$' + ['a', 'b', 'c'][i] + ' =$', a: { t: 'num', v: qp(tgt[i]) } }; }) },
      steps: ['Parallel vectors are scalar multiples: $\\langle ' + shown.join(', ') + ' \\rangle = k' + vTex(base) + '$.', 'The known component fixes $k$: $' + qt(tgt[idx]) + ' = k \\cdot ' + pf(base[idx]) + '$, so $k = ' + qt(kk) + '$.', others.map(function (i) { return '$' + ['a', 'b', 'c'][i] + ' = ' + qt(kk) + ' \\cdot ' + pf(base[i]) + ' = ' + qt(tgt[i]) + '$'; }).join(' and ') + '.'],
      hint: 'Parallel means one vector is a number times the other. Find that number from the component you know.', chk: { k: 'par', base: base, idx: idx, val: qp(tgt[idx]) } };
  });

  // a random pair of small vectors whose angle is a "nice" angle (cos^2 in {0, 1/4, 1/2, 3/4})
  function niceAnglePair(R) {
    for (var t = 0; t < 400; t++) {
      var u = nzVec(R, -2, 2), v = nzVec(R, -2, 2), d = vdot(u, v).num(), a = intLen(u), b = intLen(v), c2 = Q(d * d, a * b);
      if ([Q(0), Q(1, 4), Q(1, 2), Q(3, 4)].some(function (x) { return x.eq(c2); })) {
        var deg = c2.eq(0) ? 90 : c2.eq(Q(1, 4)) ? 60 : c2.eq(Q(1, 2)) ? 45 : 30; if (d < 0) deg = 180 - deg;
        var k1 = R.pick([1, 1, 2, 3]), k2 = R.pick([1, 1, 2]);
        return { u: u.map(function (x) { return x * k1; }), v: v.map(function (x) { return x * k2; }), deg: deg };
      }
    }
    return { u: [1, 1, 0], v: [1, 0, 0], deg: 45 };
  }
  G('calc3.dot-product-projections', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['dot', 'orth', 'angle', 'work'], ['angle', 'comp', 'proj', 'orth'], ['proj', 'comp', 'which', 'angle']));
    if (kind === 'dot') {
      var u = nzVec(R, -6, 6), v = nzVec(R, -6, 6), d = vdot(u, v);
      return { q: 'Find $\\mathbf{u} \\cdot \\mathbf{v}$ for $\\mathbf{u} = ' + vTex(u) + '$ and $\\mathbf{v} = ' + vTex(v) + '$.', a: { t: 'num', v: d.toPlain() },
        steps: ['Multiply matching components and add: $u_1v_1 + u_2v_2 + u_3v_3$.', '$' + u.map(function (x, i) { return pf(x) + '(' + qt(v[i]) + ')'; }).join(' + ') + ' = ' + u.map(function (x, i) { return x * v[i]; }).map(function (x, i) { return i ? (x < 0 ? ' - ' + (-x) : ' + ' + x) : String(x); }).join('') + ' = ' + d.toTex() + '$.', 'The dot product is a number (a scalar), not a vector.'],
        hint: 'Multiply $x$ by $x$, $y$ by $y$, $z$ by $z$, then add the three products.', chk: { k: 'dot', u: u, v: v }, nolint: ['+ 0', '--', '+ -'] };
    }
    if (kind === 'orth') {
      var a = nzVec(R, -5, 5), slot = R.int(0, 2), b = nzVec(R, -5, 5); if (!a[slot]) a[slot] = R.pick([-3, -2, 2, 3]);
      var rest = vdot(a, b).sub(a[slot] * b[slot]), k = rest.neg().div(a[slot]);
      var shown = b.map(function (x, i) { return i === slot ? 'k' : String(x); });
      return { q: 'Find $k$ so that $' + vTex(a) + '$ and $\\langle ' + shown.join(', ') + ' \\rangle$ are orthogonal.', a: { t: 'num', v: k.toPlain() },
        steps: ['Orthogonal means the dot product is $0$.', '$' + a.map(function (x, i) { return pf(x) + '\\cdot ' + (i === slot ? 'k' : pf(b[i])); }).join(' + ') + ' = 0$', 'So $' + T.mono(a[slot], 'k') + T.signed(rest) + ' = 0$, which gives $k = ' + k.toTex() + '$.'],
        hint: 'Set the dot product equal to zero and solve for $k$.', chk: { k: 'orth', a: a, b: b, slot: slot }, nolint: ['+ 0'] };
    }
    if (kind === 'angle') {
      var pr = niceAnglePair(R), dd = vdot(pr.u, pr.v), nu = intLen(pr.u), nv = intLen(pr.v);
      return { q: 'Find the angle between $\\mathbf{u} = ' + vTex(pr.u) + '$ and $\\mathbf{v} = ' + vTex(pr.v) + '$, in degrees.', a: { t: 'num', v: String(pr.deg) },
        steps: ['$\\cos\\theta = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{u}||\\mathbf{v}|}$.', '$\\mathbf{u} \\cdot \\mathbf{v} = ' + dd.toTex() + '$, $|\\mathbf{u}| = ' + sqrtTex(nu) + '$, $|\\mathbf{v}| = ' + sqrtTex(nv) + '$.',
          '$\\cos\\theta = \\dfrac{' + dd.toTex() + '}{\\sqrt{' + nu * nv + '}} = ' + radTex(Q(dd.num(), nu * nv), nu * nv) + '$.', 'The angle in $[0^\\circ, 180^\\circ]$ with that cosine is $\\theta = ' + pr.deg + '^\\circ$.'],
        hint: 'Divide the dot product by the product of the lengths to get $\\cos\\theta$.', chk: { k: 'angle', u: pr.u, v: pr.v } };
    }
    if (kind === 'work') {
      var F = nzVec(R, -6, 8), P = randPt(R, -4, 4), Qp = vadd(P, nzVec(R, -5, 5)), D = vsub(Qp, P), W = vdot(F, D);
      return { q: 'A constant force $\\mathbf{F} = ' + vTex(F) + '$ (newtons) moves an object in a straight line from $' + ptTex(P) + '$ to $' + ptTex(Qp) + '$ (meters). How much work does it do, in joules?', a: { t: 'num', v: W.toPlain() },
        steps: ['Work by a constant force is $W = \\mathbf{F} \\cdot \\mathbf{D}$, where $\\mathbf{D}$ is the displacement.', '$\\mathbf{D} = ' + vTex(D) + '$.', '$W = ' + F.map(function (x, i) { return pf(x) + '(' + qt(D[i]) + ')'; }).join(' + ') + ' = ' + W.toTex() + '$ J.'],
        hint: 'Find the displacement vector first, then dot it with the force.', chk: { k: 'work', F: F, P: P, Q: vint(Qp) }, nolint: ['+ 0'] };
    }
    // projections: v with whole-number length
    var pv = py3(R, L > 2 ? 15 : 11), vv = pv.v, uu = nzVec(R, -6, 6), d2 = vdot(uu, vv); if (d2.isZero()) { uu[0] += 1; d2 = vdot(uu, vv); }
    var comp = d2.div(pv.n), proj = vsc(d2.div(pv.n * pv.n), vv);
    if (kind === 'comp') return { q: 'Find the scalar projection of $\\mathbf{u} = ' + vTex(uu) + '$ onto $\\mathbf{v} = ' + vTex(vv) + '$.', a: { t: 'num', v: comp.toPlain() },
      steps: ['The scalar projection is the signed length of the shadow of $\\mathbf{u}$ on the line of $\\mathbf{v}$: $\\operatorname{comp}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|}$.', '$\\mathbf{u} \\cdot \\mathbf{v} = ' + d2.toTex() + '$ and $|\\mathbf{v}| = ' + pv.n + '$.', 'So $\\operatorname{comp}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{' + d2.toTex() + '}{' + pv.n + '} = ' + comp.toTex() + '$' + (comp.sign() < 0 ? ' (negative: the shadow points against $\\mathbf{v}$).' : '.')],
      hint: 'Divide $\\mathbf{u} \\cdot \\mathbf{v}$ by the length of the vector you project onto.', chk: { k: 'comp', u: uu, v: vv } };
    if (kind === 'proj') return { q: 'Find the vector projection $\\operatorname{proj}_{\\mathbf{v}}\\mathbf{u}$ of $\\mathbf{u} = ' + vTex(uu) + '$ onto $\\mathbf{v} = ' + vTex(vv) + '$.', a: { t: 'tuple', v: vPlain(proj) },
      steps: ['$\\operatorname{proj}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|^2}\\,\\mathbf{v}$: a multiple of $\\mathbf{v}$.', '$\\mathbf{u} \\cdot \\mathbf{v} = ' + d2.toTex() + '$ and $|\\mathbf{v}|^2 = ' + pv.n * pv.n + '$.', 'So the multiplier is $' + d2.div(pv.n * pv.n).toTex() + '$ and $\\operatorname{proj}_{\\mathbf{v}}\\mathbf{u} = ' + T.coef(d2.div(pv.n * pv.n), vTex(vv)) + ' = ' + vTex(proj) + '$.'],
      hint: 'The vector projection is a multiple of $\\mathbf{v}$: divide $\\mathbf{u} \\cdot \\mathbf{v}$ by $|\\mathbf{v}|^2$ and multiply $\\mathbf{v}$ by that.', chk: { k: 'proj', u: uu, v: vv } };
    // which: choose the scalar projection among plausible mix-ups
    var nu2 = intLen(uu), wrongs = [d2.div(pv.n * pv.n).toTex(), vTex(proj), radTex(Q(d2.num(), nu2), nu2), d2.toTex()];
    return { q: 'For $\\mathbf{u} = ' + vTex(uu) + '$ and $\\mathbf{v} = ' + vTex(vv) + '$, which is the scalar projection $\\operatorname{comp}_{\\mathbf{v}}\\mathbf{u}$?', a: mc(R, '$' + comp.toTex() + '$', wrongs.map(function (s) { return '$' + s + '$'; })),
      steps: ['$\\operatorname{comp}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{\\mathbf{u} \\cdot \\mathbf{v}}{|\\mathbf{v}|} = \\dfrac{' + d2.toTex() + '}{' + pv.n + '} = ' + comp.toTex() + '$: a single number.', 'A vector answer is the vector projection; dividing by $|\\mathbf{v}|^2$ gives only its multiplier; dividing by $|\\mathbf{u}|$ projects the other way.'],
      hint: 'A scalar projection is a number, and it divides by the length of the vector you project onto.', chk: { k: 'which', u: uu, v: vv } };
  });

  function crossSteps(u, v) {
    var c = vcross(u, v);
    return { c: c, steps: ['Use the determinant pattern $\\mathbf{u} \\times \\mathbf{v} = \\langle u_2v_3 - u_3v_2,\\ u_3v_1 - u_1v_3,\\ u_1v_2 - u_2v_1 \\rangle$.',
      'First: $' + pf(u[1]) + pf(v[2]) + ' - ' + pf(u[2]) + pf(v[1]) + ' = ' + qt(c[0]) + '$.', 'Second (mind the order): $' + pf(u[2]) + pf(v[0]) + ' - ' + pf(u[0]) + pf(v[2]) + ' = ' + qt(c[1]) + '$.', 'Third: $' + pf(u[0]) + pf(v[1]) + ' - ' + pf(u[1]) + pf(v[0]) + ' = ' + qt(c[2]) + '$.',
      'So $\\mathbf{u} \\times \\mathbf{v} = ' + vTex(c) + '$. Check: its dot product with $\\mathbf{u}$ and with $\\mathbf{v}$ is $0$.'] };
  }
  G('calc3.cross-product', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['cross', 'cross', 'rev'], ['cross', 'area', 'tri', 'rev'], ['tri', 'vol', 'area', 'cross']));
    var u = nzVec(R, -4, 4), v = nzVec(R, -4, 4); while (vZero(vcross(u, v))) v = nzVec(R, -4, 4);
    if (kind === 'cross') { var cs = crossSteps(u, v); return { q: 'Find $\\mathbf{u} \\times \\mathbf{v}$ for $\\mathbf{u} = ' + vTex(u) + '$ and $\\mathbf{v} = ' + vTex(v) + '$.', a: { t: 'tuple', v: vPlain(cs.c) }, steps: cs.steps, hint: 'For the middle component, it is $u_3v_1 - u_1v_3$: the minus sign is the one people lose.', chk: { k: 'cross', u: u, v: v }, nolint: ['+ 0', '--'] }; }
    if (kind === 'rev') {
      var w = vcross(u, v), a = R.pick([-1, 1, 2, -2, 3]), b = R.pick([1, 1, 2, -1]), out = vsc(-a * b, w);
      var lhs = T.coef(b, '\\mathbf{v}') + ' \\times ' + (a === 1 ? '\\mathbf{u}' : a === -1 ? '(-\\mathbf{u})' : '(' + a + '\\mathbf{u})');
      return { q: 'Given $\\mathbf{u} \\times \\mathbf{v} = ' + vTex(w) + '$, find $' + lhs + '$.', a: { t: 'tuple', v: vPlain(out) },
        steps: ['Swapping the order flips the sign: $\\mathbf{v} \\times \\mathbf{u} = -(\\mathbf{u} \\times \\mathbf{v})$.', 'Scalars come out of either factor: $(b\\mathbf{v}) \\times (a\\mathbf{u}) = ab\\,(\\mathbf{v} \\times \\mathbf{u}) = -ab\\,(\\mathbf{u} \\times \\mathbf{v})$.', 'Here $-ab = ' + (-a * b) + '$, so the answer is $' + T.coef(-a * b, vTex(w)) + ' = ' + vTex(out) + '$.'],
        hint: 'The cross product is anticommutative: $\\mathbf{v} \\times \\mathbf{u} = -\\mathbf{u} \\times \\mathbf{v}$.', chk: { k: 'rev', w: vint(w), a: a, b: b } };
    }
    if (kind === 'area') {
      var c = vcross(u, v), s = vn2(c).num();
      return { q: 'Find the area of the parallelogram with sides $\\mathbf{u} = ' + vTex(u) + '$ and $\\mathbf{v} = ' + vTex(v) + '$.', a: { t: 'num', v: sqrtPlain(s) },
        steps: ['The area is $|\\mathbf{u} \\times \\mathbf{v}| = |\\mathbf{u}||\\mathbf{v}|\\sin\\theta$, base times height.', '$\\mathbf{u} \\times \\mathbf{v} = ' + vTex(c) + '$.', 'Its length: $\\sqrt{' + c.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + '} = \\sqrt{' + s + '} = ' + sqrtTex(s) + '$.'],
        hint: 'Take the cross product, then its length.', chk: { k: 'area', u: u, v: v }, nolint: ['+ 0'] };
    }
    if (kind === 'tri') {
      var P = randPt(R, -4, 4), A = vadd(P, u), B = vadd(P, v), c2 = vcross(u, v), s2 = vn2(c2).num();
      return { q: 'Find the area of the triangle with vertices $P' + ptTex(P) + '$, $A' + ptTex(A) + '$ and $B' + ptTex(B) + '$.', a: { t: 'num', v: radPlain(Q(1, 2), s2) },
        steps: ['Two sides from $P$: $\\overrightarrow{PA} = ' + vTex(u) + '$ and $\\overrightarrow{PB} = ' + vTex(v) + '$.', '$\\overrightarrow{PA} \\times \\overrightarrow{PB} = ' + vTex(c2) + '$, with length $\\sqrt{' + s2 + '}$.', 'The triangle is half the parallelogram: area $= \\frac{1}{2}\\sqrt{' + s2 + '} = ' + radTex(Q(1, 2), s2) + '$.'],
        hint: 'A triangle is half of the parallelogram built on two of its sides.', chk: { k: 'tri', P: P, A: vint(A), B: vint(B) } };
    }
    var w3 = nzVec(R, -3, 3), trip = vdot(u, vcross(v, w3)); while (trip.isZero()) { w3 = nzVec(R, -3, 3); trip = vdot(u, vcross(v, w3)); }
    return { q: 'Find the volume of the parallelepiped with edges $\\mathbf{u} = ' + vTex(u) + '$, $\\mathbf{v} = ' + vTex(v) + '$ and $\\mathbf{w} = ' + vTex(w3) + '$.', a: { t: 'num', v: trip.abs().toPlain() },
      steps: ['Volume $= |\\mathbf{u} \\cdot (\\mathbf{v} \\times \\mathbf{w})|$: the base area $|\\mathbf{v} \\times \\mathbf{w}|$ times the height, the part of $\\mathbf{u}$ along the normal.', '$\\mathbf{v} \\times \\mathbf{w} = ' + vTex(vcross(v, w3)) + '$.', '$\\mathbf{u} \\cdot (\\mathbf{v} \\times \\mathbf{w}) = ' + trip.toTex() + '$, so the volume is $' + trip.abs().toTex() + '$.'],
      hint: 'Use the scalar triple product and take its absolute value.', chk: { k: 'vol', u: u, v: v, w: w3 } };
  });

  // ---- lines ----
  function lineTex(P, v, t) { t = t || 't'; return '\\mathbf{r}(' + t + ') = ' + vTex(P) + ' + ' + t + vTex(v); }
  function paramEqs(P, v, t) { t = t || 't'; return ['x', 'y', 'z'].map(function (c, i) { return c + ' = ' + T.lin(v[i], t, P[i]); }).join(',\\quad '); }
  G('calc3.lines-in-space', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['point', 'cross', 'on'], ['cross', 'classify', 'sym', 'on'], ['classify', 'meet', 'classify', 'cross']));
    var P = randPt(R, -5, 5), v = nzVec(R, -4, 4).map(function (x) { return x || R.pick([-2, 1, 3]); });
    if (kind === 'point') {
      var Qp = vadd(P, nzVec(R, -4, 4)), d = vsub(Qp, P), t = R.pick([-2, -1, 2, 3, Q(1, 2), Q(3, 2)]), pt = vadd(P, vsc(t, d));
      return { q: 'The line through $P' + ptTex(P) + '$ and $Q' + ptTex(Qp) + '$ is $\\mathbf{r}(t) = P + t\\,\\overrightarrow{PQ}$. Find the point $\\mathbf{r}(' + qt(t) + ')$.', a: { t: 'tuple', v: vPlain(pt) },
        steps: ['Direction: $\\overrightarrow{PQ} = ' + vTex(d) + '$, so $' + lineTex(P, d) + '$.', 'At $t = ' + qt(t) + '$: $' + vTex(P) + T.coef(t, vTex(d), false) + ' = ' + ptTex(pt) + '$.', 'Check: $t = 0$ gives $P$ and $t = 1$ gives $Q$.'],
        hint: 'Start at $P$ and add $t$ copies of the direction vector $Q - P$.', chk: { k: 'point', P: P, Q: vint(Qp), t: qp(t) }, nolint: ['+ 0'] };
    }
    if (kind === 'cross') { // where the line crosses a coordinate plane
      var c = R.int(0, 2), tt = R.pick([-3, -2, -1, 1, 2, 3, Q(1, 2), Q(-1, 2)]), val = q(P[c]).add(q(v[c]).mul(tt)), pt2 = vadd(P, vsc(tt, v));
      var plane = ['yz', 'xz', 'xy'][c], lv = val.toTex();
      var useCoord = !val.isZero();
      return { q: 'Where does the line $' + paramEqs(P, v) + '$ cross the plane $' + 'xyz'[c] + ' = ' + lv + '$?', a: { t: 'tuple', v: vPlain(pt2) },
        steps: ['Set $' + 'xyz'[c] + ' = ' + lv + '$: $' + T.lin(v[c], 't', P[c]) + ' = ' + lv + '$, so $t = ' + qt(tt) + '$.', 'Put $t = ' + qt(tt) + '$ into all three equations: $' + ptTex(pt2) + '$.'],
        hint: 'Solve the one equation that involves the plane\'s variable for $t$, then use that $t$ in the others.', chk: { k: 'cross', P: P, v: v, c: c, val: val.toPlain() }, nolint: ['+ 0'] };
    }
    if (kind === 'on') {
      var onIt = R.coin(), t3 = R.nz(-3, 3), pt3 = vadd(P, vsc(t3, v)); if (!onIt) { var j = R.int(0, 2); pt3[j] = pt3[j].add(R.pick([-1, 1, 2])); }
      return { q: 'Is the point $' + ptTex(pt3) + '$ on the line $' + paramEqs(P, v) + '$?', a: { t: 'tf', v: onIt },
        steps: ['Solve each coordinate equation for $t$.', ['x', 'y', 'z'].map(function (cc, i) { return '$' + cc + '$: $t = ' + q(pt3[i]).sub(P[i]).div(v[i]).toTex() + '$'; }).join(', ') + '.', onIt ? 'All three give the same $t$, so the point is on the line.' : 'The values of $t$ do not agree, so no single $t$ reaches the point: it is not on the line.'],
        hint: 'A point is on the line only if one value of $t$ works in all three equations.', chk: { k: 'on', P: P, v: v, pt: vPlain(pt3) } };
    }
    if (kind === 'sym') {
      var xv = R.int(-4, 6), ts = q(xv - P[0]).div(v[0]), pt4 = vadd(P, vsc(ts, v));
      var symT = ['x', 'y', 'z'].map(function (cc, i) { return '\\frac{' + T.lin(1, cc, -P[i]) + '}{' + v[i] + '}'; }).join(' = ');
      return { q: 'A line has symmetric equations $' + symT + '$. Find the point on it with $x = ' + xv + '$.', a: { t: 'tuple', v: vPlain(pt4) },
        steps: ['Each fraction equals the parameter $t$, so the line passes through $' + ptTex(P) + '$ with direction $' + vTex(v) + '$.', 'With $x = ' + xv + '$: $t = \\frac{' + xv + ' - ' + pf(P[0]) + '}{' + v[0] + '} = ' + ts.toTex() + '$.', 'Then $y = ' + P[1] + ' + ' + pf(v[1]) + '\\cdot ' + pf(ts) + ' = ' + qt(pt4[1]) + '$ and $z = ' + P[2] + ' + ' + pf(v[2]) + '\\cdot ' + pf(ts) + ' = ' + qt(pt4[2]) + '$.'],
        hint: 'Every fraction in the symmetric equations equals the same $t$.', chk: { k: 'sym', P: P, v: v, x: xv }, nolint: ['+ 0', '--', '+ -'] };
    }
    // two lines: parallel, intersecting or skew
    var type = kind === 'meet' ? 'intersect' : R.pick(['parallel', 'intersect', 'skew', 'skew']), w, P2;
    if (type === 'parallel') { w = vsc(R.pick([-2, -1, 2, 3]), v); P2 = vadd(P, nzVec(R, -3, 3)); while (vZero(vcross(vsub(P2, P), v))) P2 = vadd(P, nzVec(R, -3, 3)); }
    else {
      w = nzVec(R, -3, 3); while (vZero(vcross(v, w))) w = nzVec(R, -3, 3);
      var t1 = R.nz(-2, 2), s1 = R.nz(-2, 2), X = vadd(P, vsc(t1, v)); P2 = vsub(X, vsc(s1, w));
      if (type === 'skew') { var nn = vcross(v, w); P2 = vadd(P2, nn.map(function (x) { return q(x).isZero() ? Q(0) : q(x).div(q(x).abs()); })); if (vdot(vsub(P2, P), vcross(v, w)).isZero()) P2 = vadd(P2, nn); }
    }
    var l1 = '\\mathbf{r}_1(t) = ' + vTex(P) + ' + t' + vTex(v), l2 = '\\mathbf{r}_2(s) = ' + vTex(P2) + ' + s' + vTex(w);
    var X2 = null;
    if (type === 'intersect') X2 = vadd(P, vsc(t1, v));
    if (kind === 'meet') return { q: 'The lines $' + l1 + '$ and $' + l2 + '$ intersect. Find the point where they meet.', a: { t: 'tuple', v: vPlain(X2) },
      steps: ['Set the coordinates equal: $' + vTex(P) + ' + t' + vTex(v) + ' = ' + vTex(P2) + ' + s' + vTex(w) + '$.', 'Solve two of the three equations for $t$ and $s$: $t = ' + t1 + '$, $s = ' + s1 + '$.', 'The third equation checks out with these values.', 'Point: $\\mathbf{r}_1(' + t1 + ') = ' + ptTex(X2) + '$.'],
      hint: 'Use different parameters for the two lines, set them equal, and solve two of the equations.', chk: { k: 'meet', P: vPlain(P), v: vPlain(v), P2: vPlain(P2), w: vPlain(w) } };
    var names = { parallel: 'Parallel', intersect: 'Intersecting', skew: 'Skew' };
    var steps = ['Directions: $' + vTex(v) + '$ and $' + vTex(w) + '$. ' + (type === 'parallel' ? 'One is a multiple of the other, so the lines are parallel (and they are not the same line: the point $' + ptTex(P2) + '$ is not on the first line).' : 'Neither is a multiple of the other, so the lines are not parallel.')];
    if (type !== 'parallel') steps.push('Set them equal and solve two equations for $t$ and $s$, then test the third.', type === 'intersect' ? 'All three equations hold with $t = ' + t1 + '$, $s = ' + s1 + '$: they meet at $' + ptTex(X2) + '$.' : 'The third equation fails, so they never meet. Not parallel and not meeting means skew.');
    return { q: 'Are the lines $' + l1 + '$ and $' + l2 + '$ parallel, intersecting or skew?', a: { t: 'mc', choices: ['Parallel', 'Intersecting', 'Skew'], v: ['parallel', 'intersect', 'skew'].indexOf(type), keep: true },
      steps: steps, hint: 'First compare the directions. If they are not parallel, try to solve for a common point.', chk: { k: 'classify', P: vPlain(P), v: vPlain(v), P2: vPlain(P2), w: vPlain(w), ans: names[type] } };
  });

  // ---- planes ----
  G('calc3.planes', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['pn', 'pn', 'normal', 'meet'], ['three', 'meet', 'normal', 'pn'], ['three', 'angle', 'meet', 'three']));
    var n = nzVec(R, -5, 5), P = randPt(R, -4, 4), d = vdot(n, P);
    if (kind === 'pn') return { q: 'Find an equation of the plane through $P' + ptTex(P) + '$ with normal vector $\\mathbf{n} = ' + vTex(n) + '$.', a: { t: 'eq', v: planePlain(n, d) },
      steps: ['A point $X = (x, y, z)$ is in the plane exactly when $\\overrightarrow{PX}$ is perpendicular to $\\mathbf{n}$: $\\mathbf{n} \\cdot (X - P) = 0$.', '$' + [0, 1, 2].filter(function (i) { return n[i]; }).map(function (i) { return pf(n[i]) + '(' + T.lin(1, 'xyz'[i], -P[i]) + ')'; }).join(' + ') + ' = 0$.', 'Expand: $' + planeTex(n, d) + '$.'],
      hint: 'Use $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$ with the normal $\\langle a, b, c \\rangle$.', chk: { k: 'pn', n: n, P: P }, nolint: ['+ 0'] };
    if (kind === 'normal') {
      var inPlane = vcross(n, nzVec(R, -2, 2)); while (vZero(inPlane)) inPlane = vcross(n, nzVec(R, -2, 2));
      var k = R.pick([-2, 2, 3, -1]), good = vsc(k, n), dvec = [n[0], n[1], d.num()], swapped = [n[1], n[0], n[2]];
      var wr = [inPlane, dvec, swapped].filter(function (w) { return !vZero(vcross(w, n)) && !vZero(w); }).map(function (w) { return '$' + vTex(w) + '$'; });
      return { q: 'Which vector is perpendicular to the plane $' + planeTex(n, d) + '$?', a: mc(R, '$' + vTex(good) + '$', wr.concat(['$' + vTex(vadd(n, [1, 1, 1])) + '$'])),
        steps: ['The coefficients of $x$, $y$ and $z$ form a normal vector: $\\mathbf{n} = ' + vTex(n) + '$.', 'Any nonzero multiple of a normal is also normal: $' + vTex(good) + ' = ' + k + '\\mathbf{n}$.', 'A vector whose dot product with $\\mathbf{n}$ is $0$, such as $' + vTex(inPlane) + '$, lies along the plane, not across it.'],
        hint: 'Read the normal from the coefficients of $x$, $y$ and $z$.', chk: { k: 'normal', n: n } };
    }
    if (kind === 'meet') {
      var v = nzVec(R, -3, 3); while (vdot(n, v).isZero()) v = nzVec(R, -3, 3);
      var t = R.nz(-3, 3), X = vadd(P, vsc(t, v)), P0 = vsub(X, vsc(t, v)); // line through P0 = P
      var dd = vdot(n, X);
      return { q: 'Where does the line $' + paramEqs(P, v) + '$ meet the plane $' + planeTex(n, dd) + '$?', a: { t: 'tuple', v: vPlain(X) },
        steps: ['Substitute the line into the plane: $' + [0, 1, 2].filter(function (i) { return n[i]; }).map(function (i) { return pf(n[i]) + '(' + T.lin(v[i], 't', P[i]) + ')'; }).join(' + ') + ' = ' + dd.toTex() + '$.', 'Collect: $' + T.lin(vdot(n, v), 't', vdot(n, P)) + ' = ' + dd.toTex() + '$, so $t = ' + t + '$.', 'The point is $\\mathbf{r}(' + t + ') = ' + ptTex(X) + '$.'],
        hint: 'Put the line\'s $x$, $y$ and $z$ (in terms of $t$) into the plane equation and solve for $t$.', chk: { k: 'meet', n: n, d: dd.toPlain(), P: P, v: v }, nolint: ['+ 0'] };
    }
    if (kind === 'three') {
      var A = randPt(R, -4, 4), B = vadd(A, nzVec(R, -3, 3)), C, ab = vsub(B, A), ac, nn;
      do { C = vadd(A, nzVec(R, -3, 3)); ac = vsub(C, A); nn = vcross(ab, ac); } while (vZero(nn));
      var np = primitive(nn), dp = vdot(np, A);
      return { q: 'Find an equation of the plane through $A' + ptTex(A) + '$, $B' + ptTex(B) + '$ and $C' + ptTex(C) + '$.', a: { t: 'eq', v: planePlain(np, dp) },
        steps: ['Two vectors in the plane: $\\overrightarrow{AB} = ' + vTex(ab) + '$ and $\\overrightarrow{AC} = ' + vTex(ac) + '$.', 'Their cross product is perpendicular to both, so it is a normal: $\\overrightarrow{AB} \\times \\overrightarrow{AC} = ' + vTex(nn) + '$' + (vint(nn).join() !== np.join() ? ', or the simpler multiple $' + vTex(np) + '$.' : '.'), 'Use point $A$: $' + planeTex(np, dp) + '$.', 'Check with $B$ and $C$: both satisfy the equation.'],
        hint: 'Make two vectors from the points, cross them to get a normal, then use one point.', chk: { k: 'three', A: A, B: vint(B), C: vint(C) } };
    }
    // angle between planes
    var pr = niceAnglePair(R), d1 = R.int(-6, 6), d2 = R.int(-6, 6), deg = pr.deg > 90 ? 180 - pr.deg : pr.deg;
    if (deg === 90 && R.coin()) pr = niceAnglePair(R), deg = pr.deg > 90 ? 180 - pr.deg : pr.deg;
    return { q: 'Find the angle between the planes $' + planeTex(pr.u, d1) + '$ and $' + planeTex(pr.v, d2) + '$, in degrees (between $0^\\circ$ and $90^\\circ$).', a: { t: 'num', v: String(deg) },
      steps: ['The angle between planes is the angle between their normals: $' + vTex(pr.u) + '$ and $' + vTex(pr.v) + '$.', '$\\cos\\theta = \\dfrac{|\\mathbf{n}_1 \\cdot \\mathbf{n}_2|}{|\\mathbf{n}_1||\\mathbf{n}_2|} = \\dfrac{' + vdot(pr.u, pr.v).abs().toTex() + '}{\\sqrt{' + intLen(pr.u) + '}\\sqrt{' + intLen(pr.v) + '}}$.', 'That cosine belongs to $' + deg + '^\\circ$.'],
      hint: 'Compare the normal vectors; take the absolute value of the dot product to get the acute angle.', chk: { k: 'angle', u: pr.u, v: pr.v } };
  });

  G('calc3.distance-to-plane', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['pt', 'pt', 'par'], ['pt', 'par', 'line'], ['line', 'skew', 'pt', 'par']));
    if (kind === 'pt' || kind === 'par') {
      var pv = L < 3 ? py3(R, 11) : { v: nzVec(R, -4, 4) }, n = pv.v, s = intLen(n), P = randPt(R, -5, 5), d = R.int(-12, 12), num = vdot(n, P).sub(d);
      if (num.isZero()) d += 3, num = vdot(n, P).sub(d);
      if (kind === 'pt') return { q: 'Find the distance from the point $P' + ptTex(P) + '$ to the plane $' + planeTex(n, d) + '$.', a: { t: 'num', v: radPlain(Q(num.abs().num(), s), s) },
        steps: ['The shortest path runs along the normal $\\mathbf{n} = ' + vTex(n) + '$, so the distance is the scalar projection of any $\\overrightarrow{X_0P}$ onto $\\mathbf{n}$: $D = \\dfrac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}$.', 'Numerator: $|' + n.map(function (x, i) { return pf(x) + '(' + P[i] + ')'; }).join(' + ') + ' - ' + pf(d) + '| = |' + num.toTex() + '| = ' + num.abs().toTex() + '$.', 'Denominator: $\\sqrt{' + s + '} = ' + sqrtTex(s) + '$.', 'So $D = ' + radTex(Q(num.abs().num(), s), s) + '$.'],
        hint: 'Put the point into $ax + by + cz - d$, take the absolute value, and divide by the length of the normal.', chk: { k: 'pt', n: n, d: d, P: P }, nolint: ['+ 0', '--'] };
      var k = R.pick([2, 3, -2]), d2 = d + R.nz(-9, 9) * (k > 0 ? 1 : 1), nk = vsc(k, n), dk = q(d2).mul(k);
      var gap = q(d2).sub(d).abs();
      return { q: 'Find the distance between the parallel planes $' + planeTex(n, d) + '$ and $' + planeTex(nk, dk) + '$.', a: { t: 'num', v: radPlain(gap.div(s), s) },
        steps: ['Divide the second equation by $' + k + '$ so both have the same normal: $' + planeTex(n, d2) + '$.', 'For planes $\\mathbf{n} \\cdot X = d_1$ and $\\mathbf{n} \\cdot X = d_2$: $D = \\dfrac{|d_1 - d_2|}{|\\mathbf{n}|} = \\dfrac{|' + d + ' - ' + pf(d2) + '|}{\\sqrt{' + s + '}}$.', '$D = ' + radTex(gap.div(s), s) + '$.'],
        hint: 'Make the normal vectors identical first, then compare the constants.', chk: { k: 'par', n: n, d: d, m: k, d2: d2 } };
    }
    if (kind === 'line') {
      var P0 = randPt(R, -4, 4), v = nzVec(R, -3, 3), X = randPt(R, -4, 4), w = vsub(X, P0), c = vcross(w, v); while (vZero(c)) { X = randPt(R, -4, 4); w = vsub(X, P0); c = vcross(w, v); }
      var cs = vn2(c).num(), vs = intLen(v), val = Q(cs, vs), g = U.gcd(cs, vs), num2 = cs / g, den = vs / g; // sqrt(num2/den) = sqrt(num2*den)/den
      return { q: 'Find the distance from the point $X' + ptTex(X) + '$ to the line $' + lineTex(P0, v) + '$.', a: { t: 'num', v: radPlain(Q(1, den), num2 * den) },
        steps: ['With $P_0 = ' + ptTex(P0) + '$ on the line: $\\overrightarrow{P_0X} = ' + vTex(w) + '$.', 'The parallelogram on $\\overrightarrow{P_0X}$ and $\\mathbf{v}$ has area $|\\overrightarrow{P_0X} \\times \\mathbf{v}|$ = base $|\\mathbf{v}|$ times height $D$, so $D = \\dfrac{|\\overrightarrow{P_0X} \\times \\mathbf{v}|}{|\\mathbf{v}|}$.', '$\\overrightarrow{P_0X} \\times \\mathbf{v} = ' + vTex(c) + '$, length $\\sqrt{' + cs + '}$; $|\\mathbf{v}| = \\sqrt{' + vs + '}$.', '$D = \\sqrt{\\tfrac{' + cs + '}{' + vs + '}} = ' + radTex(Q(1, den), num2 * den) + '$.'],
        hint: 'Height of a parallelogram = area / base. Use a cross product for the area.', chk: { k: 'line', P0: P0, v: v, X: X } };
    }
    // skew lines
    var A = randPt(R, -3, 3), u = nzVec(R, -3, 3), B, w2 = nzVec(R, -3, 3), nn; while (vZero(vcross(u, w2))) w2 = nzVec(R, -3, 3);
    nn = vcross(u, w2); do { B = randPt(R, -3, 3); } while (vdot(vsub(B, A), nn).isZero());
    var top = vdot(vsub(B, A), nn).abs(), ns = vn2(nn).num();
    return { q: 'Find the distance between the skew lines $\\mathbf{r}_1(t) = ' + vTex(A) + ' + t' + vTex(u) + '$ and $\\mathbf{r}_2(s) = ' + vTex(B) + ' + s' + vTex(w2) + '$.', a: { t: 'num', v: radPlain(top.div(ns), ns) },
      steps: ['$\\mathbf{n} = \\mathbf{u} \\times \\mathbf{w} = ' + vTex(nn) + '$ is perpendicular to both lines.', 'The distance is the length of the projection of $\\overrightarrow{AB} = ' + vTex(vsub(B, A)) + '$ onto $\\mathbf{n}$: $D = \\dfrac{|\\overrightarrow{AB} \\cdot \\mathbf{n}|}{|\\mathbf{n}|}$.', '$|\\overrightarrow{AB} \\cdot \\mathbf{n}| = ' + top.toTex() + '$ and $|\\mathbf{n}| = \\sqrt{' + ns + '}$, so $D = ' + radTex(top.div(ns), ns) + '$.'],
      hint: 'A vector perpendicular to both directions is their cross product. Project the vector between the two base points onto it.', chk: { k: 'skew', A: A, u: u, B: B, w: w2 } };
  });

  // ---- quadric surfaces ----
  var QNAMES = { ell: 'Ellipsoid', h1: 'Hyperboloid of one sheet', h2: 'Hyperboloid of two sheets', cone: 'Elliptic cone', ep: 'Elliptic paraboloid', hp: 'Hyperbolic paraboloid', ec: 'Elliptic cylinder', pc: 'Parabolic cylinder', hc: 'Hyperbolic cylinder' };
  var QWRONG = { ell: ['h1', 'ep', 'cone'], h1: ['h2', 'cone', 'ell'], h2: ['h1', 'cone', 'hp'], cone: ['h1', 'ep', 'h2'], ep: ['hp', 'cone', 'pc'], hp: ['ep', 'h1', 'hc'], ec: ['ell', 'cone', 'pc'], pc: ['ep', 'ec', 'hp'], hc: ['h1', 'hp', 'ec'] };
  function quadTex(A, B, C) { // A: quadratic coefficients, B: linear, C: constant (LHS = RHS split for display)
    var lhs = [], rhs = [];
    ['x', 'y', 'z'].forEach(function (v, i) { if (A[i]) lhs.push([A[i], v + '^{2}']); });
    ['x', 'y', 'z'].forEach(function (v, i) { if (B[i]) rhs.push([-B[i], v]); });
    return { lhs: lhs, rhs: rhs, C: C };
  }
  G('calc3.quadric-surfaces', function (R, ctx) {
    var L = lvl(ctx), type = R.pick(ML.byLevel(ctx, ['ell', 'h1', 'h2', 'ep', 'hp', 'cone', 'ec'], ['ell', 'h1', 'h2', 'ep', 'hp', 'cone', 'pc', 'hc'], ['h1', 'h2', 'cone', 'hp', 'ep', 'hc', 'pc']));
    var ax = R.int(0, 2), oth = [0, 1, 2].filter(function (i) { return i !== ax; }), A = [0, 0, 0], B = [0, 0, 0], C = 0, k = R.pick([1, 2, 3, 4, 9]);
    function c() { return R.pick([1, 2, 3, 4, 9]); }
    if (type === 'ell') { A = [c(), c(), c()]; C = -R.pick([4, 9, 16, 36]); }
    if (type === 'h1') { A[oth[0]] = c(); A[oth[1]] = c(); A[ax] = -c(); C = -R.pick([1, 4, 9, 16]); }
    if (type === 'h2') { A[oth[0]] = -c(); A[oth[1]] = -c(); A[ax] = c(); C = -R.pick([1, 4, 9, 16]); }
    if (type === 'cone') { A[oth[0]] = c(); A[oth[1]] = c(); A[ax] = -c(); C = 0; }
    if (type === 'ep') { A[oth[0]] = c(); A[oth[1]] = c(); B[ax] = -R.pick([1, 2, 4]); }
    if (type === 'hp') { A[oth[0]] = c(); A[oth[1]] = -c(); B[ax] = -R.pick([1, 2, 4]); }
    if (type === 'ec') { A[oth[0]] = c(); A[oth[1]] = c(); C = -R.pick([4, 9, 16]); }
    if (type === 'hc') { A[oth[0]] = c(); A[oth[1]] = -c(); C = -R.pick([1, 4, 9]); }
    if (type === 'pc') { A[oth[0]] = c(); B[oth[1]] = -R.pick([1, 2, 3]); }
    // display: quadratic terms on the left, linear and constant on the right (possibly multiplied by -1 and with one term moved)
    var sg = R.pick([1, 1, -1]), lhs = [], rhs = [];
    [0, 1, 2].forEach(function (i) { if (A[i]) lhs.push([A[i] * sg, 'xyz'[i] + '^{2}']); });
    [0, 1, 2].forEach(function (i) { if (B[i]) rhs.push([-B[i] * sg, 'xyz'[i]]); });
    if (L > 1 && lhs.length === 3 && R.coin()) { var mv = lhs.splice(R.int(0, 2), 1)[0]; rhs.unshift([-mv[0], mv[1]]); }
    var rc = -C * sg; if (rc || !rhs.length) rhs.push([rc, '']);
    var eq = T.terms(lhs) + ' = ' + T.terms(rhs);
    var names = [QNAMES[type]].concat(QWRONG[type].map(function (t) { return QNAMES[t]; }));
    var why = {
      ell: 'All three squared terms have the same sign as the constant: every trace is an ellipse, and the surface is bounded.',
      h1: 'Two squared terms are positive and one is negative, with a positive constant (in the form $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} - \\frac{z^2}{c^2} = 1$): the traces across the negative variable are ellipses that never vanish, so the surface is one connected piece.',
      h2: 'Written as $\\ldots = 1$, only one squared term is positive: across that variable the traces are empty near $0$, so the surface comes in two pieces.',
      cone: 'All squared terms with constant $0$, mixed signs: every trace through the origin axis is a pair of lines, and the surface is a double cone.',
      ep: 'One variable appears only to the first power and the other two squared terms have the same sign: the traces are ellipses that grow as you move along that variable.',
      hp: 'One variable appears only to the first power and the squared terms have opposite signs: the traces are hyperbolas and parabolas that open opposite ways, a saddle.',
      ec: 'One variable is missing entirely, so the trace (an ellipse) is copied along that axis: a cylinder.',
      hc: 'One variable is missing and the two squared terms have opposite signs: a hyperbola copied along the missing axis.',
      pc: 'One variable is missing and only one variable is squared: a parabola copied along the missing axis.'
    }[type];
    var missing = [0, 1, 2].filter(function (i) { return !A[i] && !B[i]; });
    return { q: 'Identify the surface $' + eq + '$.', a: mc(R, names[0], names.slice(1)),
      steps: ['Move everything into the standard pattern and look at which variables are squared, their signs, and the constant.', why, missing.length ? 'Missing variable: $' + 'xyz'[missing[0]] + '$, so the surface runs parallel to the $' + 'xyz'[missing[0]] + '$-axis.' : 'Check a trace: set one variable to a constant and name the curve you get.', 'So it is ' + (/^[AEIOU]/.test(names[0]) ? 'an ' : 'a ') + names[0].toLowerCase() + '.'],
      hint: 'Count the squared variables and compare their signs; check whether some variable appears only to the first power, or not at all.', chk: { k: 'quad', A: A.map(function (x) { return x * sg; }), B: B.map(function (x) { return x * sg; }), C: C * sg } };
  });

  // ---- cylindrical and spherical coordinates ----
  // nice angle a·π (a from the list) -> {c: rad, s: rad} with rad = {k: Q, n}
  G('calc3.cylindrical-spherical', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['c2r', 'r2c', 'surf'], ['s2r', 'r2c', 'surf', 'c2r'], ['r2s', 's2r', 'surf', 'r2s']));
    var thList = ['0', '1/6', '1/4', '1/3', '1/2', '2/3', '3/4', '5/6', '1', '7/6', '5/4', '4/3', '3/2', '5/3', '7/4', '11/6'];
    if (kind === 'c2r' || kind === 'r2c') {
      var th = q(R.pick(thList.filter(function (s) { return !/^(0|1|1\/2|3\/2)$/.test(s) || R.chance(0.15); }))), tr = TRIG[th.toString()], den = th.den(), z = R.int(-5, 5);
      var r = den === 4 ? { k: q(R.int(1, 3)), n: 2 } : den === 1 || den === 2 ? { k: q(R.int(1, 5)), n: 1 } : { k: q(2 * R.int(1, 3)), n: 1 };
      var x = radMul(r, tr.c), y = radMul(r, tr.s);
      if (kind === 'c2r') return { q: 'Convert the cylindrical point $(r, \\theta, z) = \\left(' + rT(r) + ', ' + piTex(th) + ', ' + z + '\\right)$ to rectangular coordinates.', a: { t: 'tuple', v: [rP(x), rP(y), String(z)] },
        steps: ['$x = r\\cos\\theta = ' + rT(r) + (rT(r) === '1' ? ' \\cdot ' : '') + '\\cos' + T.paren(piTex(th)) + ' = ' + rT(x) + '$.', '$y = r\\sin\\theta = ' + rT(r) + (rT(r) === '1' ? ' \\cdot ' : '') + '\\sin' + T.paren(piTex(th)) + ' = ' + rT(y) + '$.', '$z$ stays $' + z + '$: cylindrical coordinates are polar coordinates in the $xy$-plane plus the height.'],
        hint: 'Use $x = r\\cos\\theta$, $y = r\\sin\\theta$, and keep $z$.', chk: { k: 'c2r', r: rNum(r), th: qn(th), z: z } };
      return { q: 'Convert the rectangular point $\\left(' + rT(x) + ', ' + rT(y) + ', ' + z + '\\right)$ to cylindrical coordinates $(r, \\theta, z)$ with $r > 0$ and $0 \\le \\theta < 2\\pi$.', a: { t: 'tuple', v: [rP(r), piPlain(th), String(z)] },
        steps: ['$r = \\sqrt{x^2 + y^2} = ' + rT(r) + '$.', '$\\tan\\theta = \\frac{y}{x}$, and the signs of $x$ and $y$ put the point in the ' + (th.lt(Q(1, 2)) ? 'first' : th.lt(1) ? 'second' : th.lt(Q(3, 2)) ? 'third' : 'fourth') + ' quadrant (or on an axis), so $\\theta = ' + piTex(th) + '$.', '$z = ' + z + '$.'],
        hint: 'Find $r$ from $x^2 + y^2$, then pick the angle whose cosine and sine have the signs of $x$ and $y$.', chk: { k: 'r2c', x: rNum(x), y: rNum(y), z: z } };
    }
    if (kind === 's2r' || kind === 'r2s') {
      var phi = q(R.pick(['1/6', '1/4', '1/3', '1/2', '2/3', '3/4', '5/6'])), th2 = q(R.pick(thList)), rho = R.pick([2, 4, 6]);
      var tp = TRIG[phi.toString()], tt = TRIG[th2.toString()], rr = { k: q(rho), n: 1 };
      var xs = radMul(radMul(rr, tp.s), tt.c), ys = radMul(radMul(rr, tp.s), tt.s), zs = radMul(rr, tp.c);
      if (kind === 's2r') return { q: 'Convert the spherical point $(\\rho, \\theta, \\varphi) = \\left(' + rho + ', ' + piTex(th2) + ', ' + piTex(phi) + '\\right)$ to rectangular coordinates.', a: { t: 'tuple', v: [rP(xs), rP(ys), rP(zs)] },
        steps: ['$\\varphi$ is measured down from the positive $z$-axis, so $z = \\rho\\cos\\varphi = ' + rho + '\\cos' + T.paren(piTex(phi)) + ' = ' + rT(zs) + '$.', 'The distance from the $z$-axis is $r = \\rho\\sin\\varphi = ' + rT(radMul(rr, tp.s)) + '$.', '$x = r\\cos\\theta = ' + rT(xs) + '$ and $y = r\\sin\\theta = ' + rT(ys) + '$.'],
        hint: '$x = \\rho\\sin\\varphi\\cos\\theta$, $y = \\rho\\sin\\varphi\\sin\\theta$, $z = \\rho\\cos\\varphi$.', chk: { k: 's2r', rho: rho, th: qn(th2), phi: qn(phi) } };
      if (th2.eq(0) && R.coin()) th2 = Q(1, 3), tt = TRIG['1/3'], xs = radMul(radMul(rr, tp.s), tt.c), ys = radMul(radMul(rr, tp.s), tt.s);
      return { q: 'Convert the rectangular point $\\left(' + rT(xs) + ', ' + rT(ys) + ', ' + rT(zs) + '\\right)$ to spherical coordinates $(\\rho, \\theta, \\varphi)$ with $0 \\le \\theta < 2\\pi$ and $0 \\le \\varphi \\le \\pi$.', a: { t: 'tuple', v: [String(rho), piPlain(th2), piPlain(phi)] },
        steps: ['$\\rho = \\sqrt{x^2 + y^2 + z^2} = ' + rho + '$.', '$\\cos\\varphi = \\frac{z}{\\rho} = ' + rT({ k: q(zs.k).div(rho), n: zs.n }) + '$ with $0 \\le \\varphi \\le \\pi$, so $\\varphi = ' + piTex(phi) + '$ (measured from the positive $z$-axis).', '$\\theta$ is the same angle as in polar coordinates for $(x, y)$: $\\theta = ' + piTex(th2) + '$.'],
        hint: 'Get $\\rho$ first, then $\\varphi$ from $\\cos\\varphi = z/\\rho$, then $\\theta$ from $x$ and $y$ as in polar coordinates.', chk: { k: 'r2s', x: rNum(xs), y: rNum(ys), z: rNum(zs) } };
    }
    var a = R.pick([1, 2, 3, 4]);
    var S = R.pick([
      ['r = ' + a, 'A cylinder of radius ' + a + ' around the $z$-axis', ['A sphere of radius ' + a, 'A circle of radius ' + a + ' in the $xy$-plane', 'A plane']],
      ['\\rho = ' + a, 'A sphere of radius ' + a + ' centered at the origin', ['A cylinder of radius ' + a, 'A cone', 'A circle of radius ' + a]],
      ['\\varphi = \\frac{\\pi}{' + R.pick([3, 4, 6]) + '}', 'A cone with its vertex at the origin, opening upward', ['A plane through the $z$-axis', 'A sphere', 'A cone opening downward']],
      ['\\varphi = \\frac{\\pi}{2}', 'The $xy$-plane', ['The $z$-axis', 'A cone', 'A sphere of radius $\\frac{\\pi}{2}$']],
      ['\\theta = \\frac{\\pi}{' + R.pick([3, 4, 6]) + '}', 'A half-plane with edge on the $z$-axis', ['A cone', 'A line through the origin', 'A cylinder']],
      ['z = ' + (a === 1 ? '' : a) + 'r', 'A cone with its vertex at the origin', ['A paraboloid', 'A plane', 'A cylinder']],
      ['z = r^{2}', 'A paraboloid opening upward', ['A cone', 'A sphere', 'A cylinder']],
      ['\\rho\\cos\\varphi = ' + a, 'The plane $z = ' + a + '$', ['A sphere', 'A cone', 'The plane $x = ' + a + '$']],
      ['\\rho = ' + 2 * a + '\\cos\\varphi', 'A sphere of radius ' + a + ' centered at $(0, 0, ' + a + ')$', ['A cone', 'A sphere of radius ' + 2 * a + ' centered at the origin', 'A cylinder']]
    ]);
    var expl = /^r = /.test(S[0]) ? 'Every point at distance ' + a + ' from the $z$-axis, at every angle and every height: a cylinder.' :
      /^\\rho = \d+$/.test(S[0]) ? '$\\rho$ is the distance from the origin, so this is every point ' + a + ' units from the origin.' :
      /^\\varphi = \\frac\{\\pi\}\{2\}/.test(S[0]) ? '$\\varphi$ is measured from the positive $z$-axis; $\\varphi = \\frac{\\pi}{2}$ means straight out sideways: $z = 0$.' :
      /^\\varphi/.test(S[0]) ? '$\\varphi$ is the angle from the positive $z$-axis; fixing it below $\\frac{\\pi}{2}$ sweeps a cone that opens upward.' :
      /^\\theta/.test(S[0]) ? 'Only the angle around the $z$-axis is fixed; $r$ (at least $0$) and $z$ are free: half of a plane.' :
      /^z = r\^/.test(S[0]) ? 'Since $r^2 = x^2 + y^2$, this is $z = x^2 + y^2$.' :
      /^z = /.test(S[0]) ? 'Since $r = \\sqrt{x^2 + y^2}$, this is $z = ' + (a === 1 ? '' : a) + '\\sqrt{x^2 + y^2}$: height grows in proportion to the distance from the axis.' :
      /cos\\varphi = /.test(S[0]) ? 'Since $z = \\rho\\cos\\varphi$, this says $z = ' + a + '$.' :
      'Multiply by $\\rho$: $\\rho^2 = ' + 2 * a + '\\rho\\cos\\varphi$, so $x^2 + y^2 + z^2 = ' + 2 * a + 'z$; completing the square gives $x^2 + y^2 + (z - ' + a + ')^2 = ' + a * a + '$.';
    return { q: 'Which surface is $' + S[0] + '$?', a: mc(R, S[1], S[2]), steps: [expl, 'So the surface is: ' + S[1].charAt(0).toLowerCase() + S[1].slice(1) + '.'],
      hint: 'Remember: $r$ is the distance from the $z$-axis, $\\rho$ the distance from the origin, and $\\varphi$ the angle down from the positive $z$-axis.', chk: { k: 'surf', eq: S[0], ans: S[1] } };
  });


  // ===================================================================== g3_2vf.js
  // ---------- unit: Vector-Valued Functions ----------
  // a component of r(t) whose value at t0 (a whole number) is exact
  function compAt(R, t0) {
    var kind = R.pick(['poly', 'poly', 'sqrt', 'rat', 'exp', 'ln']);
    if (kind === 'poly') return Ex.poly(Poly.of(TV, [[R.nz(-3, 3), { t: 2 }], [R.int(-4, 4), { t: 1 }], [R.int(-5, 5), {}]]));
    if (kind === 'sqrt') { var s = R.int(1, 4), m = R.pick([1, 2, 3]), n = s * s - m * t0; return TX.pow(lin1(m, n), Q(1, 2), R.pick([1, 2])); }
    if (kind === 'rat') { var c = R.intNot(-4, 4, [-t0, 0]); return TX.pow(lin1(1, c), -1, Poly.of(TV, [[R.nz(1, 3), { t: 1 }], [R.int(-3, 3), {}]])); }
    if (kind === 'exp') return TX.exp(lin1(R.pick([1, 2]), 0).sub(R.pick([1, 2]) * t0).sub(0), R.pick([1, 2, 3]));
    return TX.ln(lin1(1, 1 - t0), R.pick([1, 2, -1]));
  }
  function fixExp(e, t0) { // make sure exp/ln arguments vanish (or equal 1) at t0
    for (var k in e.t) e.t[k].F.forEach(function (f) { if (f.f === 'exp') { var u = f.u.at({ t: t0 }); if (!u.isZero()) f.u = f.u.sub(u); } if (f.f === 'ln') { var w = f.u.at({ t: t0 }); if (!w.eq(1)) f.u = f.u.sub(w.sub(1)); } });
    var e2 = new Ex(e.vars); for (var k2 in e.t) e2.addTerm(e.t[k2].p, e.t[k2].F); return e2;
  }

  G('calc3.vector-functions', function (R, ctx) {
    function cs(k) { return k === 1 ? '' : k === -1 ? '-' : k; } // a coefficient of 1 is not written
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['eval', 'eval', 'curve', 'onsurf'], ['eval', 'domain', 'limit', 'curve'], ['domain', 'limit', 'onsurf', 'limit']));
    if (kind === 'eval') {
      var t0 = R.pick([-1, 1, 2, 3]), comps = [compAt(R, t0), compAt(R, t0), compAt(R, t0)].map(function (c) { return fixExp(c, t0); }), vals = comps.map(function (c) { return c.at({ t: t0 }); });
      return { q: 'Let $' + rTex(comps) + '$. Find $\\mathbf{r}(' + t0 + ')$.', a: { t: 'tuple', v: vals.map(qp) },
        steps: ['A vector function is three ordinary functions; evaluate each one at $t = ' + t0 + '$.'].concat(comps.map(function (c, i) { return 'Component ' + (i + 1) + ': $' + vals[i].toTex() + '$.'; })).concat(['So $\\mathbf{r}(' + t0 + ') = ' + vTex(vals) + '$: the position of the moving point at that time.']),
        hint: 'Put $t = ' + t0 + '$ into each component separately.', chk: { k: 'eval', comps: comps.map(function (c) { return c.toPlain(); }), t0: t0 } };
    }
    if (kind === 'domain') {
      var a = R.int(-4, 2), b = a + R.int(3, 7), c = R.coin() ? R.int(a + 1, b - 1) : b + R.int(1, 3), order = R.shuffle([0, 1, 2]);
      var parts = ['\\sqrt{' + T.lin(1, 't', -a) + '}', '\\ln\\left(' + T.lin(-1, 't', b) + '\\right)', '\\frac{' + R.nz(1, 4) + '}{' + T.lin(1, 't', -c) + '}'];
      var inside = c > a && c < b, ans = inside ? '[' + a + ', ' + c + ') U (' + c + ', ' + b + ')' : '[' + a + ', ' + b + ')';
      return { q: 'Find the domain of $\\mathbf{r}(t) = \\left\\langle ' + order.map(function (i) { return parts[i]; }).join(', ') + ' \\right\\rangle$. Write it in interval notation.', a: { t: 'interval', v: ans },
        steps: ['The domain is every $t$ where all three components are defined.', 'Square root: $' + T.lin(1, 't', -a) + ' \\ge 0$, so $t \\ge ' + a + '$.', 'Logarithm: $' + T.lin(-1, 't', b) + ' > 0$, so $t < ' + b + '$.', 'Fraction: $t \\ne ' + c + '$' + (inside ? ', which lies inside the interval.' : ', which is already outside.'), 'Together: $' + (inside ? '[' + a + ', ' + c + ') \\cup (' + c + ', ' + b + ')' : '[' + a + ', ' + b + ')') + '$.'],
        hint: 'Intersect the three domains: square roots need $\\ge 0$, logarithms need $> 0$, and denominators cannot be $0$.', chk: { k: 'domain', a: a, b: b, c: c } };
    }
    if (kind === 'limit') {
      if (R.coin()) {
        var k1 = R.pick([2, 3, 4, 5]), m1 = R.pick([2, 3, -1, -2]), c1 = R.int(-5, 5), sl = R.shuffle([
          ['\\frac{\\sin(' + k1 + 't)}{t}', k1, 'Since $\\frac{\\sin u}{u} \\to 1$: $\\frac{\\sin(' + k1 + 't)}{t} = ' + k1 + '\\cdot\\frac{\\sin(' + k1 + 't)}{' + k1 + 't} \\to ' + k1 + '$.', 'sin(' + k1 + '*t)/t'],
          ['\\frac{e^{' + T.mono(m1, 't') + '} - 1}{t}', m1, 'This is the derivative of $e^{' + T.mono(m1, 't') + '}$ at $0$ (or use L\'H\u00f4pital): the limit is $' + m1 + '$.', '(e^(' + m1 + '*t) - 1)/t'],
          ['t^{2}' + T.signed(c1), c1, 'Polynomial: just substitute, giving $' + c1 + '$.', 't^2 + (' + c1 + ')']]);
        return { q: 'Find $\\displaystyle\\lim_{t \\to 0} \\left\\langle ' + sl.map(function (x) { return x[0]; }).join(', ') + ' \\right\\rangle$.', a: { t: 'tuple', v: sl.map(function (x) { return String(x[1]); }) },
          steps: ['The limit of a vector function is taken component by component.'].concat(sl.map(function (x) { return x[2]; })).concat(['So the limit is $' + vTex(sl.map(function (x) { return x[1]; })) + '$.']),
          hint: 'Take the limit of each component separately.', chk: { k: 'lim', at: 0, comps: sl.map(function (x) { return x[3]; }) } };
      }
      var a2 = R.nz(-3, 3), p2 = R.nz(-3, 3), sl2 = R.shuffle([['\\frac{t^{2} - ' + a2 * a2 + '}{' + T.lin(1, 't', -a2) + '}', 2 * a2, 'Factor: $\\frac{(t - ' + pf(a2) + ')(t + ' + pf(a2) + ')}{t - ' + pf(a2) + '} = t + ' + pf(a2) + ' \\to ' + 2 * a2 + '$.'], ['e^{' + T.lin(1, 't', -a2) + '}', 1, 'Continuous: $e^{0} = 1$.', 'e^(t - (' + a2 + '))'], [T.mono(p2, 't^{3}'), p2 * a2 * a2 * a2, 'Continuous: substitute to get $' + p2 * a2 * a2 * a2 + '$.', '(' + p2 + ')*t^3']]);
      sl2.forEach(function (x) { if (x.length === 3) x.push('(t^2 - ' + a2 * a2 + ')/(t - (' + a2 + '))'); });
      return { q: 'Find $\\displaystyle\\lim_{t \\to ' + a2 + '} \\left\\langle ' + sl2.map(function (x) { return x[0]; }).join(', ') + ' \\right\\rangle$.', a: { t: 'tuple', v: sl2.map(function (x) { return String(x[1]); }) },
        steps: ['Work component by component.'].concat(sl2.map(function (x) { return x[2]; })).concat(['So the limit is $' + vTex(sl2.map(function (x) { return x[1]; })) + '$.']),
        hint: 'Take each component\'s limit on its own; one of them needs factoring first.', chk: { k: 'lim', at: a2, comps: sl2.map(function (x) { return x[3]; }) }, nolint: ['--', '+ -'] };
    }
    if (kind === 'curve') {
      var Rr = R.int(1, 4), cc = R.nz(-3, 3), typ = R.pick(['helix', 'circle', 'line', 'ellipse']), q0, ans2, why;
      if (typ === 'helix') { q0 = '\\langle ' + cs(Rr) + '\\cos t, ' + cs(Rr) + '\\sin t, ' + T.mono(cc, 't') + ' \\rangle'; ans2 = 'A helix around the $z$-axis'; why = 'The first two components trace a circle of radius ' + Rr + ' while $z$ changes steadily: the point spirals ' + (cc > 0 ? 'up' : 'down') + ' around the $z$-axis.'; }
      if (typ === 'circle') { q0 = '\\langle ' + cs(Rr) + '\\cos t, ' + cs(Rr) + '\\sin t, ' + cc + ' \\rangle'; ans2 = 'A circle in the plane $z = ' + cc + '$'; why = '$x^2 + y^2 = ' + Rr * Rr + '$ while $z$ stays $' + cc + '$: a circle at constant height.'; }
      if (typ === 'line') { var P = randPt(R, -3, 3), v = nzVec(R, -3, 3); q0 = '\\langle ' + [0, 1, 2].map(function (i) { return T.lin(v[i], 't', P[i]); }).join(', ') + ' \\rangle'; ans2 = 'A line'; why = 'Every component is linear in $t$: the point moves by the same vector $' + vTex(v) + '$ each unit of time.'; }
      if (typ === 'ellipse') { var b2 = Rr + R.int(1, 3); q0 = '\\langle ' + cs(Rr) + '\\cos t, ' + b2 + '\\sin t, ' + cc + ' \\rangle'; ans2 = 'An ellipse in the plane $z = ' + cc + '$'; why = '$\\frac{x^2}{' + Rr * Rr + '} + \\frac{y^2}{' + b2 * b2 + '} = 1$ with constant $z$: an ellipse (the radii differ).'; }
      var all = ['A helix around the $z$-axis', 'A circle in the plane $z = ' + cc + '$', 'A line', 'An ellipse in the plane $z = ' + cc + '$', 'A parabola'];
      return { q: 'Which curve does $\\mathbf{r}(t) = ' + q0 + '$ trace as $t$ runs over all real numbers?', a: mc(R, ans2, all.filter(function (s) { return s !== ans2; })),
        steps: [why, 'So the curve is: ' + ans2.charAt(0).toLowerCase() + ans2.slice(1) + '.'], hint: 'Look for a relation among the components, such as $x^2 + y^2$ staying constant.', chk: { k: 'curve', typ: typ, ans: ans2 }, nolint: ['+ 0'] };
    }
    // onsurf
    var a3 = R.int(2, 4), opts = R.pick([
      ['\\langle ' + a3 + '\\cos t, ' + a3 + '\\sin t, t \\rangle', ['x^{2} + y^{2} = ' + a3 * a3, 'x^2 + y^2 - ' + a3 * a3], [['x^{2} + y^{2} + z^{2} = ' + a3 * a3, 'x^2+y^2+z^2-' + a3 * a3], ['z = x^{2} + y^{2}', 'z-x^2-y^2'], ['x + y = ' + a3, 'x+y-' + a3]], '$x^2 + y^2 = ' + a3 * a3 + '(\\cos^2 t + \\sin^2 t) = ' + a3 * a3 + '$ for every $t$.', [a3 + '*cos(t)', a3 + '*sin(t)', 't']],
      ['\\langle t, t^{2}, ' + a3 + 't \\rangle', ['y = x^{2}', 'y - x^2'], [['z = x^{2}', 'z - x^2'], ['y = z^{2}', 'y - z^2'], ['x^{2} + y^{2} = 1', 'x^2+y^2-1']], 'With $x = t$ and $y = t^2$: $y = x^2$ for every $t$.', ['t', 't^2', a3 + '*t']],
      ['\\langle t\\cos t, t\\sin t, t \\rangle', ['z^{2} = x^{2} + y^{2}', 'z^2 - x^2 - y^2'], [['x^{2} + y^{2} = 1', 'x^2+y^2-1'], ['z = x^{2} + y^{2}', 'z-x^2-y^2'], ['x^{2} + y^{2} + z^{2} = 1', 'x^2+y^2+z^2-1']], '$x^2 + y^2 = t^2(\\cos^2 t + \\sin^2 t) = t^2 = z^2$: a cone.', ['t*cos(t)', 't*sin(t)', 't']],
      ['\\langle \\cos t, \\sin t, \\cos^{2} t \\rangle', ['z = x^{2}', 'z - x^2'], [['z = y^{2}', 'z - y^2'], ['z = x^{2} + y^{2}', 'z-x^2-y^2'], ['x^{2} + z^{2} = 1', 'x^2+z^2-1']], '$z = \\cos^2 t = x^2$.', ['cos(t)', 'sin(t)', 'cos(t)^2']]
    ]);
    var plainOf = {}; plainOf['$' + opts[1][0] + '$'] = opts[1][1]; opts[2].forEach(function (w) { plainOf['$' + w[0] + '$'] = w[1]; });
    return { q: 'The curve $\\mathbf{r}(t) = ' + opts[0] + '$ lies on which surface?', a: mc(R, '$' + opts[1][0] + '$', opts[2].map(function (w) { return '$' + w[0] + '$'; })),
      steps: ['Substitute the components into each equation and see which one holds for every $t$.', opts[3], 'So the curve lies on $' + opts[1][0] + '$.'], hint: 'Put $x(t)$, $y(t)$ and $z(t)$ into each equation; the right one becomes an identity.', chk: { k: 'onsurf', curve: opts[4], plainOf: plainOf } };
  });

  // components with known derivatives (Ex in t)
  function compD(R, L) {
    var k = R.pick([2, 3, 4, -1, -2]), a = R.nz(-4, 4), n = R.int(2, 4);
    var list = [function () { return Ex.poly(Poly.of(TV, [[a, { t: n }], [R.int(-5, 5), { t: 1 }]])); }, function () { return TX.exp(tP.scale(k), a); }, function () { return TX.sin(tP.scale(Math.abs(k)), a); }, function () { return TX.cos(tP.scale(Math.abs(k)), a); }];
    if (L > 1) list.push(function () { return TX.ln(tP, a); }, function () { return TX.exp(tP.scale(k), tP.scale(a)); }, function () { return TX.sin(tP, tP.pow(2).scale(a)); });
    return R.pick(list)();
  }
  G('calc3.vector-function-calculus', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['deriv', 'deriv', 'int', 'tan'], ['deriv', 'tan', 'int', 'ivp'], ['ivp', 'dot', 'tan', 'int']));
    if (kind === 'deriv') {
      var comps = [compD(R, L), compD(R, L), compD(R, L)], ds = comps.map(function (c) { return c.d('t'); });
      return { q: 'Find $\\mathbf{r}\'(t)$ for $' + rTex(comps) + '$.', a: { t: 'tuple', v: ds.map(function (d) { return d.toPlain(); }), vars: ['t'] },
        steps: ['Differentiate each component with the one-variable rules.'].concat(comps.map(function (c, i) { return '$\\frac{d}{dt}\\left[' + c.toTex() + '\\right] = ' + ds[i].toTex() + '$'; })).concat(['So $' + rTex(ds, '\\mathbf{r}\'(t)') + '$.']),
        hint: 'A vector function is differentiated one component at a time.', chk: { k: 'deriv', comps: comps.map(function (c) { return c.toPlain(); }) } };
    }
    if (kind === 'tan') {
      var t0 = 0, cs = [compD(R, 1), compD(R, 1), Ex.poly(Poly.of(TV, [[R.nz(-3, 3), { t: 2 }], [R.nz(-3, 3), { t: 1 }], [R.int(-3, 3), {}]]))], ord = R.shuffle([0, 1, 2]); cs = ord.map(function (i) { return cs[i]; });
      var P0 = cs.map(function (c) { return c.at({ t: t0 }); }), D0 = cs.map(function (c) { return c.d('t').at({ t: t0 }); });
      if (vZero(D0)) D0 = [Q(1), Q(0), Q(0)], cs[0] = cs[0].add(Ex.poly(tP));
      P0 = cs.map(function (c) { return c.at({ t: t0 }); }); D0 = cs.map(function (c) { return c.d('t').at({ t: t0 }); });
      var sP = R.pick([1, 2, -1]), pt = vadd(P0, vsc(sP, D0));
      return { q: 'The tangent line to $' + rTex(cs) + '$ at $t = 0$ is $\\mathbf{L}(s) = \\mathbf{r}(0) + s\\,\\mathbf{r}\'(0)$. Find $\\mathbf{r}(0)$, $\\mathbf{r}\'(0)$, and the point $\\mathbf{L}(' + sP + ')$.', a: { t: 'multi', parts: [{ label: '$\\mathbf{r}(0) =$', a: { t: 'tuple', v: vPlain(P0) } }, { label: '$\\mathbf{r}\'(0) =$', a: { t: 'tuple', v: vPlain(D0) } }, { label: '$\\mathbf{L}(' + sP + ') =$', a: { t: 'tuple', v: vPlain(pt) } }] },
        steps: ['Point of tangency: $\\mathbf{r}(0) = ' + vTex(P0) + '$.', 'Derivative: $' + rTex(cs.map(function (c) { return c.d('t'); }), '\\mathbf{r}\'(t)') + '$, so $\\mathbf{r}\'(0) = ' + vTex(D0) + '$: the direction of motion.', '$\\mathbf{L}(' + sP + ') = ' + vTex(P0) + T.coef(sP, vTex(D0), false) + ' = ' + vTex(pt) + '$.'],
        hint: 'The tangent line starts at $\\mathbf{r}(0)$ and runs along the velocity $\\mathbf{r}\'(0)$.', chk: { k: 'tan', comps: cs.map(function (c) { return c.toPlain(); }), s: sP } };
    }
    if (kind === 'int') {
      var T1 = R.pick([1, 2, 3]), pc = [0, 1, 2].map(function () { return Poly.of(TV, [[R.nz(-3, 3), { t: R.int(1, 3) }], [R.int(-4, 4), {}]]); });
      var useTrig = L > 1 && R.coin(), trigC = R.int(0, 2), vals = pc.map(function (p) { return p.defint('t', 0, T1).cval(); }), texC = pc.map(function (p) { return p.toTex(); }), up = T1;
      if (useTrig) { up = 'pi/2'; var A = R.nz(-3, 3), cosK = R.coin(); pc = pc.map(function (p) { return p; }); texC = pc.map(function (p) { return Poly.of(TV, [[R.nz(-3, 3), { t: 1 }]]).toTex(); });
        var lin = [0, 1, 2].map(function () { return R.nz(-3, 3); }); texC = lin.map(function (c) { return T.mono(c, 't'); }); texC[trigC] = T.coef(A, cosK ? '\\cos t' : '\\sin t');
        vals = lin.map(function (c) { return Q(c, 8); }); // ∫0^{π/2} c t dt = c π²/8
        var plainVals = lin.map(function (c) { return piPowPlain(Q(c, 8), 2); }); plainVals[trigC] = String(A);
        var texVals = lin.map(function (c) { return piPowTex(Q(c, 8), 2); }); texVals[trigC] = String(A);
        return { q: 'Evaluate $\\displaystyle\\int_0^{\\pi/2} \\left\\langle ' + texC.join(', ') + ' \\right\\rangle dt$.', a: { t: 'tuple', v: plainVals },
          steps: ['Integrate each component over $[0, \\frac{\\pi}{2}]$.', '$\\int_0^{\\pi/2} t\\,dt = \\frac{1}{2}\\left(\\frac{\\pi}{2}\\right)^2 = \\frac{\\pi^2}{8}$, and $\\int_0^{\\pi/2} ' + (cosK ? '\\cos t' : '\\sin t') + '\\,dt = 1$.', 'So the integral is $\\left\\langle ' + texVals.join(', ') + ' \\right\\rangle$.'],
          hint: 'Integrate component by component; the answer is a vector.', chk: { k: 'inttrig', lin: lin, trigC: trigC, A: A, cos: cosK } };
      }
      return { q: 'Evaluate $\\displaystyle\\int_0^{' + T1 + '} \\left\\langle ' + texC.join(', ') + ' \\right\\rangle dt$.', a: { t: 'tuple', v: vals.map(qp) },
        steps: ['Integrate each component from $0$ to $' + T1 + '$.'].concat(pc.map(function (p, i) { return '$\\int_0^{' + T1 + '} \\left(' + p.toTex() + '\\right) dt = \\left[' + p.integ('t').toTex() + '\\right]_0^{' + T1 + '} = ' + vals[i].toTex() + '$'; })).concat(['The integral is the vector $' + vTex(vals) + '$.']),
        hint: 'Integrate component by component; the answer is a vector.', chk: { k: 'int', comps: pc.map(function (p) { return p.toPlain(); }), T: T1 } };
    }
    if (kind === 'ivp') {
      var r0 = randPt(R, -4, 4), kk = R.pick([1, 2, 3]), Aa = R.nz(-3, 3) * kk, which = R.int(0, 2), type = R.pick(['cos', 'sin', 'poly']);
      var dcomps = [0, 1, 2].map(function () { return Poly.of(TV, [[R.nz(-3, 3) * 2, { t: 1 }], [R.int(-4, 4), {}]]); });
      var dT = dcomps.map(function (p) { return p.toTex(); }), rT2 = [], rPl = [];
      dcomps.forEach(function (p, i) { var F = p.integ('t').add(r0[i]); rT2.push(F.toTex()); rPl.push(F.toPlain()); });
      if (type !== 'poly') {
        var c = Q(Aa, kk);
        dT[which] = T.coef(Aa, '\\' + type + '(' + (kk === 1 ? '' : kk) + 't)');
        if (type === 'cos') { rT2[which] = T.coef(c, '\\sin(' + (kk === 1 ? '' : kk) + 't)') + T.signed(r0[which]); rPl[which] = '(' + c.toPlain() + ')*sin(' + kk + '*t) + ' + pf(r0[which]).replace(/[()]/g, ''); }
        else { rT2[which] = T.coef(c.neg(), '\\cos(' + (kk === 1 ? '' : kk) + 't)') + T.signed(c.add(r0[which])); rPl[which] = '(' + c.neg().toPlain() + ')*cos(' + kk + '*t) + (' + c.add(r0[which]).toPlain() + ')'; }
      }
      rPl = rPl.map(function (s) { return s.replace(/\+ -/g, '- '); });
      return { q: 'Find $\\mathbf{r}(t)$ if $\\mathbf{r}\'(t) = \\left\\langle ' + dT.join(', ') + ' \\right\\rangle$ and $\\mathbf{r}(0) = ' + vTex(r0) + '$.', a: { t: 'tuple', v: rPl, vars: ['t'] },
        steps: ['Antidifferentiate each component; each gets its own constant: $\\mathbf{r}(t) = \\int \\mathbf{r}\'(t)\\,dt + \\mathbf{C}$.', 'Choose the constants so that $t = 0$ gives $' + vTex(r0) + '$' + (type === 'sin' ? ' (careful: $\\cos 0 = 1$, so that component needs an extra constant)' : '') + '.', 'Result: $\\mathbf{r}(t) = \\left\\langle ' + rT2.join(', ') + ' \\right\\rangle$.', 'Check: differentiate to get $\\mathbf{r}\'(t)$ back, and put $t = 0$ to get $\\mathbf{r}(0)$.'],
        hint: 'Integrate each component, then fix each constant with $\\mathbf{r}(0)$.', chk: { k: 'ivp', d: dcomps.map(function (p) { return p.toPlain(); }), which: which, type: type, A: Aa, kk: kk, r0: r0 } };
    }
    // dot product rule
    var u0 = nzVec(R, -3, 3), u1 = nzVec(R, -3, 3), v0 = nzVec(R, -3, 3), v1 = nzVec(R, -3, 3), t1 = R.int(1, 4), val = vdot(u1, v0).add(vdot(u0, v1));
    return { q: 'At $t = ' + t1 + '$: $\\mathbf{u} = ' + vTex(u0) + '$, $\\mathbf{u}\' = ' + vTex(u1) + '$, $\\mathbf{v} = ' + vTex(v0) + '$, $\\mathbf{v}\' = ' + vTex(v1) + '$. Find $\\dfrac{d}{dt}\\left[\\mathbf{u}(t) \\cdot \\mathbf{v}(t)\\right]$ at $t = ' + t1 + '$.', a: { t: 'num', v: val.toPlain() },
      steps: ['The product rule works for dot products: $(\\mathbf{u} \\cdot \\mathbf{v})\' = \\mathbf{u}\' \\cdot \\mathbf{v} + \\mathbf{u} \\cdot \\mathbf{v}\'$.', '$\\mathbf{u}\' \\cdot \\mathbf{v} = ' + vdot(u1, v0).toTex() + '$ and $\\mathbf{u} \\cdot \\mathbf{v}\' = ' + vdot(u0, v1).toTex() + '$.', 'Sum: $' + val.toTex() + '$.'],
      hint: 'Differentiate one factor at a time, just like the ordinary product rule.', chk: { k: 'dot', u0: u0, u1: u1, v0: v0, v1: v1 } };
  });

  // curves with nice speed: r' = <A, B t, C t^2> with B^2 = 2AC gives |r'| = A + C t^2
  var SPEEDY = [[1, 2, 2], [2, 2, 1], [1, 4, 8], [8, 4, 1], [2, 4, 4], [4, 4, 2], [3, 6, 6], [6, 6, 3], [2, 6, 9], [9, 6, 2]];
  function speedyCurve(R) { var s = R.pick(SPEEDY), ord = R.shuffle([0, 1, 2]), comps = [Poly.of(TV, [[s[0], { t: 1 }]]), Poly.of(TV, [[Q(s[1], 2), { t: 2 }]]), Poly.of(TV, [[Q(s[2], 3), { t: 3 }]])]; return { A: s[0], B: s[1], C: s[2], comps: ord.map(function (i) { return comps[i]; }), ord: ord }; }
  G('calc3.space-arc-length', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['helix', 'line', 'poly'], ['poly', 'helix', 'log', 'exp'], ['poly', 'log', 'exp', 'point']));
    if (kind === 'helix' || kind === 'point') {
      var p2 = R.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10]]), a = p2[0], b = p2[1], c = p2[2], Tq = R.pick([Q(1), Q(2), Q(1, 2), Q(4)]);
      var hel = '\\mathbf{r}(t) = \\langle ' + a + '\\cos t, ' + a + '\\sin t, ' + b + 't \\rangle';
      if (kind === 'helix') return { q: 'Find the length of the helix $' + hel + '$ for $0 \\le t \\le ' + piTex(Tq) + '$.', a: { t: 'num', v: piPlain(Tq.mul(c)) },
        steps: ['$\\mathbf{r}\'(t) = \\langle -' + a + '\\sin t, ' + a + '\\cos t, ' + b + ' \\rangle$.', '$|\\mathbf{r}\'(t)| = \\sqrt{' + a * a + '\\sin^2 t + ' + a * a + '\\cos^2 t + ' + b * b + '} = \\sqrt{' + (a * a + b * b) + '} = ' + c + '$: constant speed.', '$L = \\int_0^{' + piTex(Tq) + '} ' + c + '\\,dt = ' + piTex(Tq.mul(c)) + '$.'],
        hint: 'Find the speed $|\\mathbf{r}\'(t)|$ first; $\\sin^2 t + \\cos^2 t = 1$ makes it constant.', chk: { k: 'helix', a: a, b: b, T: qn(Tq) * Math.PI } };
      var s0 = Q(c).mul(R.pick([Q(1, 2), Q(1), Q(3, 2), Q(1, 3)])), tt = s0.div(c), trig = TRIG[tt.toString()];
      var pt = [radMul({ k: q(a), n: 1 }, trig.c), radMul({ k: q(a), n: 1 }, trig.s)];
      return { q: 'Starting at $t = 0$ and moving in the direction of increasing $t$ along $' + hel + '$, where is the point after traveling an arc length of $' + piTex(s0) + '$?', a: { t: 'tuple', v: [rP(pt[0]), rP(pt[1]), piPlain(tt.mul(b))] },
        steps: ['Speed: $|\\mathbf{r}\'(t)| = \\sqrt{' + a * a + ' + ' + b * b + '} = ' + c + '$, so the arc length from $0$ to $t$ is $s = ' + c + 't$.', 'Solve $' + c + 't = ' + piTex(s0) + '$: $t = ' + piTex(tt) + '$.', '$\\mathbf{r}\\left(' + piTex(tt) + '\\right) = \\left(' + rT(pt[0]) + ', ' + rT(pt[1]) + ', ' + piTex(tt.mul(b)) + '\\right)$.'],
        hint: 'For constant speed, arc length is speed times time. Solve for $t$, then evaluate $\\mathbf{r}$.', chk: { k: 'point', a: a, b: b, s: qn(s0) * Math.PI } };
    }
    if (kind === 'line') {
      var P = randPt(R, -4, 4), dv = py3(R, 11), T2 = R.int(1, 4), comps = [0, 1, 2].map(function (i) { return T.lin(dv.v[i], 't', P[i]); });
      return { q: 'Find the length of the curve $\\mathbf{r}(t) = \\left\\langle ' + comps.join(', ') + ' \\right\\rangle$ for $0 \\le t \\le ' + T2 + '$.', a: { t: 'num', v: String(dv.n * T2) },
        steps: ['$\\mathbf{r}\'(t) = ' + vTex(dv.v) + '$, a constant: the curve is a straight line traveled at constant speed.', '$|\\mathbf{r}\'(t)| = \\sqrt{' + dv.v.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + '} = ' + dv.n + '$.', '$L = \\int_0^{' + T2 + '} ' + dv.n + '\\,dt = ' + dv.n * T2 + '$.'],
        hint: 'Arc length is the integral of the speed $|\\mathbf{r}\'(t)|$.', chk: { k: 'line', v: dv.v, T: T2 } };
    }
    if (kind === 'poly') {
      var sc2 = speedyCurve(R), T3 = R.pick([1, 2, 3]), Lq = q(sc2.A * T3).add(Q(sc2.C * T3 * T3 * T3, 3)), ds = sc2.comps.map(function (p) { return p.d('t'); });
      return { q: 'Find the length of $' + rTex(sc2.comps.map(Ex.poly)) + '$ for $0 \\le t \\le ' + T3 + '$.', a: { t: 'num', v: Lq.toPlain() },
        steps: ['$' + rTex(ds.map(Ex.poly), '\\mathbf{r}\'(t)') + '$.', '$|\\mathbf{r}\'(t)|^2 = ' + T.terms([[sc2.C * sc2.C, 't^{4}'], [sc2.B * sc2.B, 't^{2}'], [sc2.A * sc2.A, '']]) + ' = \\left(' + T.terms([[sc2.C, 't^{2}'], [sc2.A, '']]) + '\\right)^2$, a perfect square.', 'So $|\\mathbf{r}\'(t)| = ' + T.terms([[sc2.C, 't^{2}'], [sc2.A, '']]) + '$.', '$L = \\int_0^{' + T3 + '} \\left(' + T.terms([[sc2.C, 't^{2}'], [sc2.A, '']]) + '\\right) dt = \\left[' + T.terms([[Q(sc2.C, 3), 't^{3}'], [sc2.A, 't']]) + '\\right]_0^{' + T3 + '} = ' + Lq.toTex() + '$.'],
        hint: 'Square the speed: the expression under the root is a perfect square.', chk: { k: 'poly', comps: sc2.comps.map(function (p) { return p.toPlain(); }), T: T3 } };
    }
    if (kind === 'log') {
      var k = R.pick([1, 2, 3]), up = R.pick(['e', '2', '3']), comps2 = [T.mono(2 * k, 't'), T.mono(k, 't^{2}'), T.coef(k, '\\ln t')], ord = R.shuffle([0, 1, 2]);
      var ans = up === 'e' ? k + '*e^2' : k + '*(' + (Number(up) * Number(up) - 1) + ' + ln(' + up + '))', ansT = up === 'e' ? T.coef(k, 'e^{2}') : (k === 1 ? '' : k) + '\\left(' + (Number(up) * Number(up) - 1) + ' + \\ln ' + up + '\\right)';
      return { q: 'Find the length of $\\mathbf{r}(t) = \\left\\langle ' + ord.map(function (i) { return comps2[i]; }).join(', ') + ' \\right\\rangle$ for $1 \\le t \\le ' + up + '$.', a: { t: 'num', v: ans },
        steps: ['The derivatives of the components are $' + 2 * k + '$, $' + T.mono(2 * k, 't') + '$ and $\\frac{' + k + '}{t}$.', '$|\\mathbf{r}\'(t)|^2 = ' + 4 * k * k + ' + ' + 4 * k * k + 't^2 + \\frac{' + k * k + '}{t^2} = ' + (k === 1 ? '' : k * k) + '\\left(2t + \\frac{1}{t}\\right)^2$.', 'So $|\\mathbf{r}\'(t)| = ' + (k === 1 ? '' : k) + '\\left(2t + \\frac{1}{t}\\right)$ for $t > 0$.', '$L = ' + (k === 1 ? '' : k) + '\\left[t^2 + \\ln t\\right]_1^{' + up + '} = ' + ansT + '$.'],
        hint: 'The expression under the square root is a perfect square: look for $(2t + 1/t)^2$.', chk: { k: 'log', kk: k, up: up === 'e' ? Math.E : Number(up), ord: ord } };
    }
    var m = R.pick([2, 3, 4]), sc3 = R.pick([1, 2]);
    return { q: 'Find the length of $\\mathbf{r}(t) = \\langle ' + (sc3 === 1 ? '' : sc3) + 'e^{t}\\cos t, ' + (sc3 === 1 ? '' : sc3) + 'e^{t}\\sin t, ' + (sc3 === 1 ? '' : sc3) + 'e^{t} \\rangle$ for $0 \\le t \\le \\ln ' + m + '$.', a: { t: 'num', v: radPlain(sc3 * (m - 1), 3) },
      steps: ['$\\mathbf{r}\'(t) = ' + (sc3 === 1 ? '' : sc3) + 'e^{t}\\langle \\cos t - \\sin t, \\sin t + \\cos t, 1 \\rangle$.', '$(\\cos t - \\sin t)^2 + (\\sin t + \\cos t)^2 + 1 = 2 + 1 = 3$, so $|\\mathbf{r}\'(t)| = ' + (sc3 === 1 ? '' : sc3) + '\\sqrt{3}\\,e^{t}$.', '$L = ' + (sc3 === 1 ? '' : sc3) + '\\sqrt{3}\\left[e^{t}\\right]_0^{\\ln ' + m + '} = ' + (sc3 === 1 ? '' : sc3) + '\\sqrt{3}(' + m + ' - 1) = ' + radTex(sc3 * (m - 1), 3) + '$.'],
      hint: 'Factor $e^t$ out of $\\mathbf{r}\'(t)$; the cross terms cancel when you square.', chk: { k: 'exp', s: sc3, m: m } };
  });

  function helTex(a, b) { return '\\langle ' + T.coef(a, '\\cos t') + ', ' + T.coef(a, '\\sin t') + ', ' + T.mono(b, 't') + ' \\rangle'; }
  function helDTex(a, b) { return '\\langle ' + T.coef(-a, '\\sin t') + ', ' + T.coef(a, '\\cos t') + ', ' + b + ' \\rangle'; }
  G('calc3.curvature', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['helix', 'graph', 'unitT'], ['graph', 'unitT', 'space', 'helix'], ['space', 'radius', 'N', 'graph']));
    if (kind === 'helix' || kind === 'N') {
      var a = R.int(1, 5), b = R.int(1, 5), kap = Q(a, a * a + b * b);
      if (kind === 'N') {
        var th = q(R.pick(['1/6', '1/4', '1/3', '1/2', '2/3', '1', '3/2'])), tr = TRIG[th.toString()];
        var Nv = [{ k: q(tr.c.k).neg(), n: tr.c.n }, { k: q(tr.s.k).neg(), n: tr.s.n }];
        return { q: 'Find the unit normal $\\mathbf{N}(t)$ of $\\mathbf{r}(t) = ' + helTex(a, b) + '$ at $t = ' + piTex(th) + '$.', a: { t: 'tuple', v: [rP(Nv[0]), rP(Nv[1]), '0'] },
          steps: ['$\\mathbf{r}\' = ' + helDTex(a, b) + '$ has length $\\sqrt{' + (a * a + b * b) + '}$, so $\\mathbf{T} = \\frac{1}{\\sqrt{' + (a * a + b * b) + '}}' + helDTex(a, b) + '$.', '$\\mathbf{T}\' = \\frac{1}{\\sqrt{' + (a * a + b * b) + '}}\\langle ' + T.coef(-a, '\\cos t') + ', ' + T.coef(-a, '\\sin t') + ', 0 \\rangle$; dividing by its length gives $\\mathbf{N}(t) = \\langle -\\cos t, -\\sin t, 0 \\rangle$: it points straight at the $z$-axis.', 'At $t = ' + piTex(th) + '$: $\\mathbf{N} = \\left\\langle ' + rT(Nv[0]) + ', ' + rT(Nv[1]) + ', 0 \\right\\rangle$.'],
          hint: '$\\mathbf{N} = \\mathbf{T}\'/|\\mathbf{T}\'|$. For a helix it points horizontally toward the axis.', chk: { k: 'N', th: qn(th) * Math.PI } };
      }
      return { q: 'Find the curvature of the helix $\\mathbf{r}(t) = ' + helTex(a, b) + '$.', a: { t: 'num', v: kap.toPlain() },
        steps: ['$\\mathbf{r}\' = ' + helDTex(a, b) + '$ and $|\\mathbf{r}\'| = \\sqrt{' + (a * a + b * b) + '}$.', '$\\mathbf{T} = \\frac{\\mathbf{r}\'}{|\\mathbf{r}\'|}$, so $\\mathbf{T}\' = \\frac{1}{\\sqrt{' + (a * a + b * b) + '}}\\langle ' + T.coef(-a, '\\cos t') + ', ' + T.coef(-a, '\\sin t') + ', 0 \\rangle$ with $|\\mathbf{T}\'| = \\frac{' + a + '}{\\sqrt{' + (a * a + b * b) + '}}$.', '$\\kappa = \\frac{|\\mathbf{T}\'|}{|\\mathbf{r}\'|} = \\frac{' + a + '}{' + (a * a + b * b) + '}$' + (kap.eq(Q(a, a * a + b * b)) && U.gcd(a, a * a + b * b) > 1 ? ' $= ' + kap.toTex() + '$' : '') + '.', 'Check: with $b = 0$ it is a circle of radius ' + a + ' and $\\kappa = \\frac{1}{' + a + '}$.'],
        hint: 'Use $\\kappa = |\\mathbf{T}\'(t)| / |\\mathbf{r}\'(t)|$; both lengths are constant here.', chk: { k: 'helix', a: a, b: b } };
    }
    if (kind === 'graph' || kind === 'radius') {
      var x0 = R.int(-2, 2), slope = R.pick(kind === 'radius' ? [0, 0, 1, -1] : [0, 1, -1, 2, -2]), c2 = R.nz(-3, 3);
      // f(x) = c2 (x - x0)^2 + slope (x - x0) + k  => f' = slope, f'' = 2 c2 at x0
      var kq = R.int(-3, 3), f = Poly.of(['x'], [[c2, { x: 2 }]]).add(Poly.of(['x'], [[slope - 2 * c2 * x0, { x: 1 }], [c2 * x0 * x0 - slope * x0 + kq, {}]])), m = 1 + slope * slope, fpp = Math.abs(2 * c2);
      var kapT = radTex(Q(fpp, m * m), m), kapP = radPlain(Q(fpp, m * m), m);
      if (kind === 'radius') { return { q: 'Find the radius of curvature of $y = ' + f.toTex() + '$ at $x = ' + x0 + '$.', a: { t: 'num', v: radPlain(Q(m, fpp), m) },
        steps: ['$y\' = ' + f.d('x').toTex() + '$ and $y\'\' = ' + f.d('x').d('x').toTex() + '$; at $x = ' + x0 + '$: $y\' = ' + slope + '$, $y\'\' = ' + 2 * c2 + '$.', '$\\kappa = \\dfrac{|y\'\'|}{(1 + (y\')^2)^{3/2}} = \\dfrac{' + fpp + '}{' + m + '^{3/2}} = ' + kapT + '$.', 'The radius of curvature is $\\frac{1}{\\kappa} = ' + radTex(Q(m, fpp), m) + '$: the radius of the circle that hugs the curve there.'],
        hint: 'Find $\\kappa$ first, then take its reciprocal.', chk: { k: 'radius', f: f.toPlain(), x0: x0 } }; }
      return { q: 'Find the curvature of $y = ' + f.toTex() + '$ at $x = ' + x0 + '$.', a: { t: 'num', v: kapP },
        steps: ['For a graph, $\\kappa = \\dfrac{|y\'\'|}{\\left(1 + (y\')^2\\right)^{3/2}}$.', '$y\' = ' + f.d('x').toTex() + '$, so $y\'(' + x0 + ') = ' + slope + '$; $y\'\' = ' + 2 * c2 + '$.', '$\\kappa = \\dfrac{' + fpp + '}{(1 + ' + slope * slope + ')^{3/2}} = \\dfrac{' + fpp + '}{' + m + '^{3/2}} = ' + kapT + '$.'],
        hint: 'You need both $y\'$ and $y\'\'$ at the point.', chk: { k: 'graph', f: f.toPlain(), x0: x0 } };
    }
    if (kind === 'unitT') {
      var sc2 = speedyCurve(R), t1 = R.pick([1, 2, -1]), ds = sc2.comps.map(function (p) { return p.d('t'); }), dv = ds.map(function (p) { return p.at({ t: t1 }); }), sp = sc2.A + sc2.C * t1 * t1, Tv = dv.map(function (x) { return x.div(sp); });
      return { q: 'Find the unit tangent vector $\\mathbf{T}(' + t1 + ')$ of $' + rTex(sc2.comps.map(Ex.poly)) + '$.', a: { t: 'tuple', v: vPlain(Tv) },
        steps: ['$' + rTex(ds.map(Ex.poly), '\\mathbf{r}\'(t)') + '$, so $\\mathbf{r}\'(' + t1 + ') = ' + vTex(dv) + '$.', 'Its length: $\\sqrt{' + dv.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + '} = ' + sp + '$.', 'Divide by the length: $\\mathbf{T}(' + t1 + ') = \\frac{1}{' + sp + '}' + vTex(dv) + ' = ' + vTex(Tv) + '$, a vector of length $1$.'],
        hint: 'Unit tangent = velocity divided by speed. Do not skip the division.', chk: { k: 'unitT', comps: sc2.comps.map(function (p) { return p.toPlain(); }), t: t1 } };
    }
    // space curve curvature with the cross product formula
    var cs = [Poly.of(TV, [[R.nz(1, 3), { t: 1 }]]), Poly.of(TV, [[R.nz(-2, 2), { t: 2 }]]), Poly.of(TV, [[R.nz(-2, 2), { t: 3 }], [R.int(-2, 2), { t: 1 }]])], ord2 = R.shuffle([0, 1, 2]); cs = ord2.map(function (i) { return cs[i]; });
    var t2 = R.pick([0, 1, -1]), r1 = cs.map(function (p) { return p.d('t').at({ t: t2 }); }), r2 = cs.map(function (p) { return p.d('t').d('t').at({ t: t2 }); }), cr = vcross(r1, r2), A2 = vn2(cr).num(), s2 = vn2(r1).num();
    return { q: 'Find the curvature of $' + rTex(cs.map(Ex.poly)) + '$ at $t = ' + t2 + '$.', a: { t: 'num', v: radPlain(Q(1, s2 * s2), A2 * s2) },
      steps: ['Use $\\kappa = \\dfrac{|\\mathbf{r}\' \\times \\mathbf{r}\'\'|}{|\\mathbf{r}\'|^3}$.', 'At $t = ' + t2 + '$: $\\mathbf{r}\' = ' + vTex(r1) + '$, $\\mathbf{r}\'\' = ' + vTex(r2) + '$.', '$\\mathbf{r}\' \\times \\mathbf{r}\'\' = ' + vTex(cr) + '$, length $\\sqrt{' + A2 + '}$; $|\\mathbf{r}\'| = \\sqrt{' + s2 + '}$.', '$\\kappa = \\dfrac{\\sqrt{' + A2 + '}}{' + s2 + '\\sqrt{' + s2 + '}} = ' + radTex(Q(1, s2 * s2), A2 * s2) + '$.'],
      hint: 'Compute $\\mathbf{r}\'$ and $\\mathbf{r}\'\'$ at the point, cross them, and divide by the speed cubed.', chk: { k: 'space', comps: cs.map(function (p) { return p.toPlain(); }), t: t2 }, nolint: ['+ 0'] };
  });

  G('calc3.motion-in-space', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['va', 'va', 'proj'], ['aT', 'va', 'proj', 'aN'], ['aN', 'aT', 'proj', 'aN']));
    if (kind === 'proj') {
      var Tl = R.pick([2, 3, 4, 5]), kk = R.int(1, Tl - 1), vz = 16 * kk, h = 16 * Tl * (Tl - kk), vx = R.int(10, 40), vy = R.int(-20, 20), ask = R.pick(['land', 'max']), hmax = h + vz * vz / 64;
      var setup = 'A ball is launched from $(0, 0, ' + h + ')$ (feet) with initial velocity $\\mathbf{v}(0) = ' + vTex([vx, vy, vz]) + '$ ft/s. Gravity gives $\\mathbf{a} = \\langle 0, 0, -32 \\rangle$ ft/s$^2$. ';
      var st = ['Integrate twice: $\\mathbf{v}(t) = ' + T.vec([vx, vy, T.lin(-32, 't', vz)]) + '$ and $\\mathbf{r}(t) = \\left\\langle ' + T.mono(vx, 't') + ', ' + T.mono(vy, 't') + ', ' + T.terms([[-16, 't^{2}'], [vz, 't'], [h, '']]) + ' \\right\\rangle$.'];
      if (ask === 'land') return { q: setup + 'Where does it hit the ground $z = 0$?', a: { t: 'tuple', v: [String(vx * Tl), String(vy * Tl), '0'] },
        steps: st.concat(['Ground: $-16t^2 + ' + vz + 't + ' + h + ' = 0$, or $' + T.terms([[1, 't^{2}'], [-kk, 't'], [-Tl * (Tl - kk), '']]) + ' = 0$, so $(t - ' + Tl + ')(t + ' + (Tl - kk) + ') = 0$ and $t = ' + Tl + '$ s.', 'At $t = ' + Tl + '$: $(' + vx * Tl + ', ' + vy * Tl + ', 0)$.']),
        hint: 'Find $\\mathbf{r}(t)$ by integrating twice, then solve $z(t) = 0$ for the positive time.', chk: { k: 'land', h: h, v: [vx, vy, vz] }, nolint: ['+ 0'] };
      return { q: setup + 'What is its maximum height?', a: { t: 'num', v: String(hmax) },
        steps: st.concat(['Highest point when the vertical velocity is $0$: $' + vz + ' - 32t = 0$, $t = ' + Q(vz, 32).toTex() + '$ s.', '$z = -16' + T.pow(Q(vz, 32).toTex(), 2) + ' + ' + vz + '\\cdot ' + Q(vz, 32).toTex() + ' + ' + h + ' = ' + hmax + '$ feet.']),
        hint: 'The top of the path is where the $z$-component of velocity is zero.', chk: { k: 'max', h: h, vz: vz }, nolint: ['+ 0'] };
    }
    var cs = [Poly.of(TV, [[R.nz(-3, 3), { t: 2 }], [R.int(-3, 3), { t: 1 }]]), Poly.of(TV, [[R.nz(-2, 2), { t: 3 }], [R.int(-2, 2), {}]]), Poly.of(TV, [[R.nz(1, 4), { t: 1 }]])], ord = R.shuffle([0, 1, 2]); cs = ord.map(function (i) { return cs[i]; });
    var t0 = R.pick([0, 1, -1, 2]), v = cs.map(function (p) { return p.d('t').at({ t: t0 }); }), a = cs.map(function (p) { return p.d('t').d('t').at({ t: t0 }); }), sv = vn2(v).num(), va = vdot(v, a), cr = vcross(v, a), cs2 = vn2(cr).num();
    var vT = rTex(cs.map(function (p) { return Ex.poly(p.d('t')); }), '\\mathbf{v}(t)'), aT = rTex(cs.map(function (p) { return Ex.poly(p.d('t').d('t')); }), '\\mathbf{a}(t)');
    var head = 'An object moves along $' + rTex(cs.map(Ex.poly)) + '$. ';
    if (kind === 'va') return { q: head + 'Find its velocity, acceleration and speed at $t = ' + t0 + '$.', a: { t: 'multi', parts: [{ label: '$\\mathbf{v}(' + t0 + ') =$', a: { t: 'tuple', v: vPlain(v) } }, { label: '$\\mathbf{a}(' + t0 + ') =$', a: { t: 'tuple', v: vPlain(a) } }, { label: 'speed $=$', a: { t: 'num', v: sqrtPlain(sv) } }] },
      steps: ['$' + vT + '$, so $\\mathbf{v}(' + t0 + ') = ' + vTex(v) + '$.', '$' + aT + '$, so $\\mathbf{a}(' + t0 + ') = ' + vTex(a) + '$.', 'Speed is the length of velocity: $\\sqrt{' + sv + '} = ' + sqrtTex(sv) + '$.'],
      hint: 'Velocity is $\\mathbf{r}\'$, acceleration is $\\mathbf{r}\'\'$, speed is $|\\mathbf{v}|$.', chk: { k: 'va', comps: cs.map(function (p) { return p.toPlain(); }), t: t0 }, nolint: ['+ 0'] };
    if (kind === 'aT') return { q: head + 'Find the tangential component of acceleration $a_T$ at $t = ' + t0 + '$.', a: { t: 'num', v: radPlain(va.div(sv), sv) },
      steps: ['$\\mathbf{v}(' + t0 + ') = ' + vTex(v) + '$ and $\\mathbf{a}(' + t0 + ') = ' + vTex(a) + '$.', '$a_T$ is the part of $\\mathbf{a}$ along the direction of motion: $a_T = \\dfrac{\\mathbf{v} \\cdot \\mathbf{a}}{|\\mathbf{v}|}$. It is the rate of change of speed.', '$\\mathbf{v} \\cdot \\mathbf{a} = ' + va.toTex() + '$, $|\\mathbf{v}| = ' + sqrtTex(sv) + '$, so $a_T = ' + radTex(va.div(sv), sv) + '$.'],
      hint: 'Project the acceleration onto the velocity.', chk: { k: 'aT', comps: cs.map(function (p) { return p.toPlain(); }), t: t0 }, nolint: ['+ 0'] };
    return { q: head + 'Find the normal component of acceleration $a_N$ at $t = ' + t0 + '$.', a: { t: 'num', v: radPlain(Q(1, sv), cs2 * sv) },
      steps: ['$\\mathbf{v}(' + t0 + ') = ' + vTex(v) + '$ and $\\mathbf{a}(' + t0 + ') = ' + vTex(a) + '$.', '$a_N$ is the part of $\\mathbf{a}$ that turns the path: $a_N = \\dfrac{|\\mathbf{v} \\times \\mathbf{a}|}{|\\mathbf{v}|} = \\kappa |\\mathbf{v}|^2$.', '$\\mathbf{v} \\times \\mathbf{a} = ' + vTex(cr) + '$, length $\\sqrt{' + cs2 + '}$; $|\\mathbf{v}| = \\sqrt{' + sv + '}$.', '$a_N = \\sqrt{\\tfrac{' + cs2 + '}{' + sv + '}} = ' + radTex(Q(1, sv), cs2 * sv) + '$.'],
      hint: 'Use $a_N = |\\mathbf{v} \\times \\mathbf{a}| / |\\mathbf{v}|$.', chk: { k: 'aN', comps: cs.map(function (p) { return p.toPlain(); }), t: t0 }, nolint: ['+ 0'] };
  });


  // ===================================================================== g3_3partials.js
  // ---------- unit: Partial Derivatives ----------

  G('calc3.multivariable-functions', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['eval', 'k', 'shape', 'steep'], ['k', 'domain', 'shape', 'steep'], ['domain', 'steep', 'eval', 'domain']));
    if (kind === 'eval' || kind === 'k') {
      var P = [R.int(-3, 3), R.int(-3, 3)], f = anchor(randF(R, XY, L === 1 ? 1 : 2), envPt(XY, P), R), v = f.at(envPt(XY, P));
      if (kind === 'k') return { q: 'Which level curve $f(x, y) = k$ of $' + fdef(f) + '$ passes through the point $' + ptTex(P) + '$? Give $k$.', a: { t: 'num', v: v.toPlain() },
        steps: ['A level curve collects all points where $f$ has one value $k$.', 'The curve through $' + ptTex(P) + '$ is the one with $k = f' + ptTex(P) + '$.', 'Substitute: $k = ' + v.toTex() + '$.'],
        hint: 'The level curve through a point uses the value of $f$ at that point.', chk: { k: 'eval', f: f.toPlain(), P: P } };
      return { q: 'Evaluate $f' + ptTex(P) + '$ for $' + fdef(f) + '$.', a: { t: 'num', v: v.toPlain() },
        steps: ['Replace $x$ by $' + P[0] + '$ and $y$ by $' + P[1] + '$ everywhere.', 'Simplify each term: the total is $' + v.toTex() + '$.'],
        hint: 'Substitute both coordinates, then simplify.', chk: { k: 'eval', f: f.toPlain(), P: P } };
    }
    if (kind === 'shape') {
      var a = R.int(1, 4), b = R.int(1, 4), S = R.pick([
        ['x^{2} + y^{2}', 'Circles centered at the origin', 'Each level curve $x^2 + y^2 = k$ (for $k > 0$) is a circle of radius $\\sqrt{k}$.'],
        [T.coef(a, 'x^{2}') + ' + ' + (a + b) + 'y^{2}', 'Ellipses centered at the origin', '$' + T.coef(a, 'x^2') + ' + ' + (a + b) + 'y^2 = k$ is an ellipse for each $k > 0$ (unequal coefficients).'],
        ['y - ' + (a === 1 ? '' : a) + 'x^{2}', 'Parabolas', '$y = ' + (a === 1 ? '' : a) + 'x^2 + k$: the same parabola shifted up or down.'],
        [T.lin(a, 'x', 0) + ' + ' + T.mono(b, 'y'), 'Parallel lines', '$' + a + 'x + ' + b + 'y = k$ is a line with slope $-\\frac{' + a + '}{' + b + '}$ for every $k$.'],
        ['x^{2} - y^{2}', 'Hyperbolas (and two crossing lines for $k = 0$)', '$x^2 - y^2 = k$ is a hyperbola for $k \\ne 0$ and the lines $y = \\pm x$ for $k = 0$.'],
        ['xy', 'Hyperbolas (and the two axes for $k = 0$)', '$xy = k$ is a hyperbola $y = \\frac{k}{x}$ for $k \\ne 0$; $k = 0$ gives the axes.']]);
      var all = ['Circles centered at the origin', 'Ellipses centered at the origin', 'Parabolas', 'Parallel lines', 'Hyperbolas (and two crossing lines for $k = 0$)', 'Hyperbolas (and the two axes for $k = 0$)'];
      return { q: 'What do the level curves of $f(x, y) = ' + S[0] + '$ look like?', a: mc(R, S[1], all.filter(function (s) { return s !== S[1] && !(/^Hyperbolas/.test(s) && /^Hyperbolas/.test(S[1])); })),
        steps: ['Set $f(x, y) = k$ and recognize the curve.', S[2]], hint: 'Write $f(x, y) = k$ and ask what kind of curve that equation describes.', chk: { k: 'shape', ans: S[1] } };
    }
    if (kind === 'steep') {
      var step = R.pick([10, 20, 25, 50]), base = R.int(2, 9) * 100, gaps = R.shuffle([R.int(30, 45), R.int(60, 90), R.int(100, 160)]), labs = ['A', 'B', 'C'];
      var pos = [0, gaps[0], gaps[0] + gaps[1], gaps[0] + gaps[1] + gaps[2]], mi = gaps.indexOf(Math.min.apply(null, gaps));
      var rows = [0, 1, 2].map(function (i) { return 'stretch ' + labs[i] + ': from the $' + (base + i * step) + '$ m contour to the $' + (base + (i + 1) * step) + '$ m contour, $' + gaps[i] + '$ m of trail'; });
      return { q: 'A straight trail crosses contour lines of a hiking map spaced every $' + step + '$ m of height: ' + rows.join('; ') + '. On which stretch is the trail steepest?', a: { t: 'mc', choices: ['Stretch A', 'Stretch B', 'Stretch C'], v: mi, keep: true },
        steps: ['Each stretch climbs the same $' + step + '$ m.', 'Average slope = rise / run: ' + [0, 1, 2].map(function (i) { return labs[i] + ': $\\frac{' + step + '}{' + gaps[i] + '}$'; }).join(', ') + '.', 'The shortest run gives the biggest slope: stretch ' + labs[mi] + '. Contours that are close together mean steep ground.'],
        hint: 'Same height change each time: which stretch packs it into the shortest distance?', chk: { k: 'steep', gaps: gaps } };
    }
    var r = R.int(1, 5), D = R.pick([
      ['\\sqrt{' + r * r + ' - x^{2} - y^{2}}', 'The disk $x^2 + y^2 \\le ' + r * r + '$ (with its boundary circle)', ['The circle $x^2 + y^2 = ' + r * r + '$ only', 'All points with $x^2 + y^2 \\ge ' + r * r + '$', 'The open disk $x^2 + y^2 < ' + r * r + '$']],
      ['\\ln(x - y)', 'The half-plane $y < x$ (below the line $y = x$)', ['The half-plane $y > x$', 'All points with $x > 0$ and $y > 0$', 'The half-plane $y \\le x$']],
      ['\\sqrt{y - x^{2}}', 'The points on or above the parabola $y = x^2$', ['The points below the parabola $y = x^2$', 'The points strictly above the parabola $y = x^2$', 'All points with $y \\ge 0$']],
      ['\\dfrac{1}{x^{2} + y^{2} - ' + r * r + '}', 'Every point except the circle $x^2 + y^2 = ' + r * r + '$', ['Every point except the origin', 'The disk $x^2 + y^2 < ' + r * r + '$', 'Every point except the point $(' + r + ', ' + r + ')$']],
      ['\\dfrac{\\sqrt{x}}{y - ' + r + '}', 'The points with $x \\ge 0$ and $y \\ne ' + r + '$', ['The points with $x > 0$ and $y > ' + r + '$', 'The points with $x \\ge 0$ only', 'The points with $y \\ne ' + r + '$ only']]]);
    return { q: 'What is the domain of $f(x, y) = ' + D[0] + '$?', a: mc(R, D[1], D[2]),
      steps: ['The domain is every point $(x, y)$ where the formula makes sense: square roots need a number $\\ge 0$, logarithms need $> 0$, and denominators cannot be $0$.', 'For this function that is: ' + D[1].charAt(0).toLowerCase() + D[1].slice(1) + '.'],
      hint: 'Ask what could go wrong: a negative under a root, a log of something not positive, or division by zero.', chk: { k: 'domain', fx: D[0], ans: D[1] } };
  });

  G('calc3.level-surfaces', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['value', 'sphere', 'plane'], ['sphere', 'plane', 'shape', 'ell'], ['shape', 'ell', 'plane', 'shape']));
    var P = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)];
    if (kind === 'value') { var f = randF(R, XYZ, 1), v = f.at(envPt(XYZ, P)); return { q: 'Find the value $k$ of the level surface of $f(x, y, z) = ' + f.toTex() + '$ that passes through $' + ptTex(P) + '$.', a: { t: 'num', v: v.toPlain() },
      steps: ['A level surface is the set where $f(x, y, z) = k$; the one through a point has $k$ equal to $f$ there.', '$k = f' + ptTex(P) + ' = ' + v.toTex() + '$.'], hint: 'Evaluate $f$ at the point.', chk: { k: 'eval', f: f.toPlain(), P: P } }; }
    if (kind === 'sphere') {
      var p3 = py3(R, 11), c = randPt(R, -3, 3), Pp = vadd(c, p3.v), cx = T.lin(1, 'x', -c[0]), cy = T.lin(1, 'y', -c[1]), cz = T.lin(1, 'z', -c[2]);
      var ftex = [cx, cy, cz].map(function (s, i) { return c[i] ? '(' + s + ')^{2}' : s + '^{2}'; }).join(' + ');
      return { q: 'The level surfaces of $f(x, y, z) = ' + ftex + '$ are spheres. Find the radius of the one through $' + ptTex(Pp) + '$.', a: { t: 'num', v: String(p3.n) },
        steps: ['$f(x, y, z) = k$ is a sphere centered at $' + ptTex(c) + '$ with radius $\\sqrt{k}$.', '$k = f' + ptTex(Pp) + ' = ' + p3.v.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + ' = ' + p3.n * p3.n + '$.', 'Radius $= \\sqrt{' + p3.n * p3.n + '} = ' + p3.n + '$.'],
        hint: 'Find $k$ from the point; the radius is $\\sqrt{k}$.', chk: { k: 'sphere', c: c, P: vint(Pp) }, nolint: ['+ 0'] };
    }
    if (kind === 'plane') {
      var n = nzVec(R, -4, 4), d = vdot(n, P);
      return { q: 'Find an equation of the level surface of $f(x, y, z) = ' + T.terms([[n[0], 'x'], [n[1], 'y'], [n[2], 'z']]) + '$ through $' + ptTex(P) + '$.', a: { t: 'eq', v: planePlain(n, d) },
        steps: ['Level surfaces of a linear function are planes $f(x, y, z) = k$.', '$k = f' + ptTex(P) + ' = ' + d.toTex() + '$.', 'So the surface is $' + planeTex(n, d) + '$.'], hint: 'Compute $k = f(P)$ and set $f(x, y, z) = k$.', chk: { k: 'plane', n: n, P: P } };
    }
    if (kind === 'ell') {
      var a = R.pick([1, 4, 9]), b = R.pick([4, 9, 16]), Pt = [R.nz(-2, 2), R.int(-2, 2), R.int(-2, 2)], kk = a * Pt[0] * Pt[0] + b * Pt[1] * Pt[1] + Pt[2] * Pt[2];
      var ax = R.int(0, 2), coef = [a, b, 1][ax], icept = radPlain(Q(1, coef), kk * coef);
      return { q: 'The level surface of $f(x, y, z) = ' + T.terms([[a, 'x^{2}'], [b, 'y^{2}'], [1, 'z^{2}']]) + '$ through $' + ptTex(Pt) + '$ is an ellipsoid. Where does it cross the positive $' + 'xyz'[ax] + '$-axis? Give the $' + 'xyz'[ax] + '$-coordinate.', a: { t: 'num', v: icept },
        steps: ['$k = f' + ptTex(Pt) + ' = ' + kk + '$, so the surface is $' + T.terms([[a, 'x^{2}'], [b, 'y^{2}'], [1, 'z^{2}']]) + ' = ' + kk + '$.', 'On the $' + 'xyz'[ax] + '$-axis the other two coordinates are $0$: $' + T.mono(coef, 'xyz'[ax] + '^{2}') + ' = ' + kk + '$.', '$' + 'xyz'[ax] + ' = \\sqrt{\\tfrac{' + kk + '}{' + coef + '}} = ' + radTex(Q(1, coef), kk * coef) + '$.'],
        hint: 'Find $k$ first; then set the other two variables to zero.', chk: { k: 'ell', a: a, b: b, P: Pt, ax: ax } };
    }
    var k = R.pick([1, 4, 9]), S = R.pick([
      ['x^{2} + y^{2} - z^{2}', k, 'Hyperboloids of one sheet', 'For $k > 0$: $x^2 + y^2 - z^2 = ' + k + '$ has circular traces for every $z$ that never shrink to a point: one sheet.'],
      ['x^{2} + y^{2} - z^{2}', -k, 'Hyperboloids of two sheets', 'For $k < 0$: $z^2 = x^2 + y^2 + ' + k + '$, so $|z| \\ge ' + Math.sqrt(k) + '$: two separate pieces.'],
      ['x^{2} + y^{2} - z^{2}', 0, 'A double cone', 'For $k = 0$: $z^2 = x^2 + y^2$, a cone with its vertex at the origin.'],
      ['z - x^{2} - y^{2}', k, 'Paraboloids opening upward', '$z = x^2 + y^2 + ' + k + '$: the same paraboloid lifted by $' + k + '$.'],
      ['x^{2} + z^{2}', k, 'Cylinders around the $y$-axis', '$x^2 + z^2 = ' + k + '$ with $y$ free: a circular cylinder along the $y$-axis.'],
      ['x + y + z', k, 'Parallel planes', '$x + y + z = ' + k + '$ are planes with the same normal $\\langle 1, 1, 1 \\rangle$.']]);
    var all = ['Hyperboloids of one sheet', 'Hyperboloids of two sheets', 'A double cone', 'Paraboloids opening upward', 'Cylinders around the $y$-axis', 'Parallel planes', 'Spheres'];
    return { q: 'Describe the level surface $f(x, y, z) = ' + S[1] + '$ of $f(x, y, z) = ' + S[0] + '$' + (S[0] === 'x^{2} + y^{2} - z^{2}' ? '' : ' (and of its other levels)') + '.', a: mc(R, S[2], all.filter(function (s) { return s !== S[2]; })),
      steps: ['Write $f(x, y, z) = ' + S[1] + '$ and look at the traces.', S[3]], hint: 'Set $f$ equal to the given number and recognize the quadric surface.', chk: { k: 'shape', ans: S[2] } };
  });

  // limits along paths
  function LIMS(c, k) { // c: a nonzero whole number scaling the numerator; k: a scale inside the special limits
    var C = function (t) { return T.coef(c, t); }, cp = '(' + c + ')*';
    return [
      ['\\dfrac{' + C('xy') + '}{x^{2} + y^{2}}', cp + 'x*y/(x^2+y^2)', 'DNE', 'Along $y = mx$: $\\frac{' + C('m') + 'x^2}{(1 + m^2)x^2} = \\frac{' + C('m') + '}{1 + m^2}$, which depends on $m$ ($0$ on the $x$-axis, $' + Q(c, 2).toTex() + '$ on $y = x$).'],
      ['\\dfrac{' + C('(x^{2} - y^{2})') + '}{x^{2} + y^{2}}', cp + '(x^2-y^2)/(x^2+y^2)', 'DNE', 'On the $x$-axis it is $' + c + '$, on the $y$-axis it is $' + (-c) + '$: two paths, two values.'],
      ['\\dfrac{' + C('x^{2}y') + '}{x^{4} + y^{2}}', cp + 'x^2*y/(x^4+y^2)', 'DNE', 'Every line $y = mx$ gives $\\frac{' + C('m') + 'x^3}{x^4 + m^2x^2} \\to 0$, but the parabola $y = x^2$ gives $\\frac{' + C('x^4') + '}{2x^4} = ' + Q(c, 2).toTex() + '$.'],
      ['\\dfrac{' + C('xy^{2}') + '}{x^{2} + y^{4}}', cp + 'x*y^2/(x^2+y^4)', 'DNE', 'Lines give $0$, but along $x = y^2$ the value is $\\frac{' + C('y^4') + '}{2y^4} = ' + Q(c, 2).toTex() + '$.'],
      ['\\dfrac{' + C('x^{2}y') + '}{x^{2} + y^{2}}', cp + 'x^2*y/(x^2+y^2)', '0', 'In polar form it is $' + C('r\\cos^2\\theta\\sin\\theta') + '$, and its size is at most $' + T.mono(Math.abs(c), 'r') + ' \\to 0$, whatever the path.'],
      ['\\dfrac{' + C('(x^{3} + y^{3})') + '}{x^{2} + y^{2}}', cp + '(x^3+y^3)/(x^2+y^2)', '0', 'In polar form it is $' + C('r(\\cos^3\\theta + \\sin^3\\theta)') + '$, at most $' + T.mono(2 * Math.abs(c), 'r') + '$ in size, so it goes to $0$.'],
      ['\\dfrac{' + C('xy') + '}{\\sqrt{x^{2} + y^{2}}}', cp + 'x*y/sqrt(x^2+y^2)', '0', 'In polar form it is $' + C('r\\cos\\theta\\sin\\theta') + '$, at most $' + T.mono(Math.abs(c), 'r') + '$ in size, so it goes to $0$.'],
      ['\\dfrac{' + C('(x^{4} - y^{4})') + '}{x^{2} + y^{2}}', cp + '(x^4-y^4)/(x^2+y^2)', '0', 'Factor: $\\frac{(x^2 - y^2)(x^2 + y^2)}{x^2 + y^2} = x^2 - y^2 \\to 0$.'],
      ['\\dfrac{\\sin(' + T.coef(k, '(x^{2} + y^{2})') + ')}{x^{2} + y^{2}}', 'sin(' + k + '*(x^2+y^2))/(x^2+y^2)', String(k), 'With $u = x^2 + y^2 \\to 0$ this is $\\frac{\\sin(' + T.coef(k, 'u') + ')}{u} = ' + (k === 1 ? '' : k + '\\cdot') + '\\frac{\\sin(' + T.coef(k, 'u') + ')}{' + T.coef(k, 'u') + '} \\to ' + k + '$, the same on every path.'],
      ['\\dfrac{e^{' + T.coef(k, '(x^{2} + y^{2})') + '} - 1}{x^{2} + y^{2}}', '(e^(' + k + '*(x^2+y^2))-1)/(x^2+y^2)', String(k), 'With $u = x^2 + y^2 \\to 0$ this is $\\frac{e^{' + T.coef(k, 'u') + '} - 1}{u} \\to ' + k + '$ (the derivative of $e^{' + T.coef(k, 'u') + '}$ at $u = 0$).']];
  }
  G('calc3.multivariable-limits', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['cont', 'line', 'decide'], ['line', 'decide', 'parab', 'cont'], ['decide', 'parab', 'decide', 'line']));
    if (kind === 'cont') {
      if (R.coin()) { var a = R.nz(-4, 4), b = R.nz(-4, 4); return { q: 'Find $\\displaystyle\\lim_{(x, y) \\to ' + ptTex([a, a]) + '} \\frac{x^{2} - y^{2}}{x - y}$.', a: { t: 'num', v: String(2 * a) },
        steps: ['Direct substitution gives $\\frac{0}{0}$, so simplify first.', 'Factor: $\\frac{(x - y)(x + y)}{x - y} = x + y$ wherever $x \\ne y$.', 'The limit of $x + y$ is $' + a + ' + ' + pf(a) + ' = ' + 2 * a + '$.'],
        hint: 'Factor the numerator as a difference of squares.', chk: { k: 'cont', f: '(x^2-y^2)/(x-y)', P: [a, a] }, nolint: ['+ -'] }; }
      var P = [R.int(-3, 3), R.int(-3, 3)], nu = Poly.of(XY, [[R.nz(-3, 3), { x: 2 }], [R.nz(-4, 4), { x: 1, y: 1 }], [R.int(-5, 5), {}]]), de = Poly.of(XY, [[1, { x: 2 }], [1, { y: 2 }], [R.int(1, 4), {}]]), val = nu.at(envPt(XY, P)).div(de.at(envPt(XY, P)));
      return { q: 'Find $\\displaystyle\\lim_{(x, y) \\to ' + ptTex(P) + '} \\frac{' + nu.toTex() + '}{' + de.toTex() + '}$.', a: { t: 'num', v: val.toPlain() },
        steps: ['A rational function is continuous wherever its denominator is not zero.', 'At $' + ptTex(P) + '$ the denominator is $' + de.at(envPt(XY, P)).toTex() + ' \\ne 0$, so substitute.', 'The limit is $\\frac{' + nu.at(envPt(XY, P)).toTex() + '}{' + de.at(envPt(XY, P)).toTex() + '} = ' + val.toTex() + '$.'],
        hint: 'Check the denominator first; if it is not zero, just substitute.', chk: { k: 'cont', f: '(' + nu.toPlain() + ')/(' + de.toPlain() + ')', P: P } };
    }
    if (kind === 'line') {
      var c1 = R.pick([1, 2, 3]), m1 = R.pick([0, 1, 2, -1, 3]), m2 = R.pick([1, 2, -1, -2, 3].filter(function (m) { return m !== m1; }));
      var fr = function (m) { return Q(c1 * m, 1 + m * m); };
      return { q: 'Let $f(x, y) = \\dfrac{' + T.mono(c1, 'xy') + '}{x^{2} + y^{2}}$. Find the limit of $f$ as $(x, y) \\to (0, 0)$ along the line $y = ' + T.mono(m1, 'x') + '$ and along $y = ' + T.mono(m2, 'x') + '$. Then: does $\\displaystyle\\lim_{(x, y) \\to (0, 0)} f(x, y)$ exist?', a: { t: 'multi', parts: [{ label: 'along $y = ' + T.mono(m1, 'x') + '$:', a: { t: 'num', v: fr(m1).toPlain() } }, { label: 'along $y = ' + T.mono(m2, 'x') + '$:', a: { t: 'num', v: fr(m2).toPlain() } }, { label: 'the limit exists?', a: { t: 'mc', choices: ['Yes', 'No'], v: 1, keep: true } }] },
        steps: ['Along $y = mx$ (with $x \\ne 0$): $f(x, mx) = \\frac{' + T.mono(c1, 'm') + 'x^2}{x^2 + m^2x^2} = \\frac{' + T.mono(c1, 'm') + '}{1 + m^2}$, a constant.', '$m = ' + m1 + '$ gives $' + fr(m1).toTex() + '$; $m = ' + m2 + '$ gives $' + fr(m2).toTex() + '$.', 'Two paths into the origin give two different values, so the limit does not exist.'],
        hint: 'Put $y = mx$ into $f$ and simplify; the $x$\'s cancel.', chk: { k: 'line', c: c1, m1: m1, m2: m2 } };
    }
    if (kind === 'parab') {
      var kk = R.pick([1, 2, 3, -1, -2]), val2 = Q(kk, 1 + kk * kk);
      return { q: 'Let $f(x, y) = \\dfrac{x^{2}y}{x^{4} + y^{2}}$. Along every line $y = mx$ the limit at the origin is $0$. Find the limit along the parabola $y = ' + T.mono(kk, 'x^{2}') + '$, and decide whether $\\displaystyle\\lim_{(x, y) \\to (0, 0)} f(x, y)$ exists.', a: { t: 'multi', parts: [{ label: 'along the parabola:', a: { t: 'num', v: val2.toPlain() } }, { label: 'the limit exists?', a: { t: 'mc', choices: ['Yes, it is 0', 'No'], v: 1, keep: true } }] },
        steps: ['Put $y = ' + T.mono(kk, 'x^{2}') + '$: $f = \\frac{x^2 \\cdot ' + pf(kk) + 'x^2}{x^4 + ' + kk * kk + 'x^4} = \\frac{' + kk + '}{' + (1 + kk * kk) + '}$.', 'That is not $0$, but lines give $0$. Different paths, different values.', 'So the limit does not exist. Checking only straight lines is not enough.'],
        hint: 'Substitute $y = ' + T.mono(kk, 'x^{2}') + '$; every term becomes a multiple of $x^4$.', chk: { k: 'parab', kk: kk }, nolint: ['1x'] };
    }
    var LL = LIMS(R.pick([1, 1, 2, 3, -1, -2]), R.pick([1, 2, 3])), it = R.pick(L === 1 ? LL.slice(0, 2).concat(LL.slice(4, 6)) : LL);
    return { q: 'Find $\\displaystyle\\lim_{(x, y) \\to (0, 0)} ' + it[0] + '$, or type DNE if it does not exist.', a: { t: 'num', v: it[2] },
      steps: [it[3], it[2] === 'DNE' ? 'So the limit does not exist.' : 'So the limit is $' + it[2] + '$.'], hint: 'Try two different paths (the axes, lines $y = mx$, or $y = x^2$). If they agree, try polar coordinates to prove it.', chk: { k: 'decide', f: it[1] } };
  });

  G('calc3.partial-derivatives', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['fx', 'fy', 'slope'], ['fx', 'fy', 'at', 'three'], ['fx', 'at', 'three', 'fy']));
    if (kind === 'fx' || kind === 'fy') {
      var f = randF(R, XY, L), v = kind === 'fx' ? 'x' : 'y', o = v === 'x' ? 'y' : 'x', d = f.d(v);
      return { q: 'Find $f_' + v + '$ for $' + fdef(f) + '$.', a: { t: 'expr', v: d.toPlain(), vars: XY },
        steps: ['Treat $' + o + '$ as a constant and differentiate with respect to $' + v + '$ only.'].concat(f.terms().map(function (t) { var e = new Ex(XY); e.addTerm(t.p, t.F); return '$\\frac{\\partial}{\\partial ' + v + '}\\left[' + e.toTex() + '\\right] = ' + e.d(v).toTex() + '$'; })).concat(['So $f_' + v + ' = ' + d.toTex() + '$.']),
        hint: 'Any factor made only of $' + o + '$ is a constant here: it stays put (or its term disappears if it has no $' + v + '$).', chk: { k: 'd', f: f.toPlain(), v: [v] } };
    }
    if (kind === 'slope') {
      var g = Ex.poly(rmono(R, XY, 3).add(rmono(R, XY, 2)).add(rmono(R, XY, 2))), P = [R.int(-2, 2), R.int(-2, 2)], sv = R.pick(['x', 'y']), dv = g.d(sv).at(envPt(XY, P)), fixed = sv === 'x' ? 'y' : 'x';
      return { q: 'The plane $' + fixed + ' = ' + P[sv === 'x' ? 1 : 0] + '$ cuts the surface $z = ' + g.toTex() + '$ in a curve. Find the slope of that curve, in the $' + sv + '$-direction, at $' + sv + ' = ' + P[sv === 'x' ? 0 : 1] + '$.', a: { t: 'num', v: dv.toPlain() },
        steps: ['Holding $' + fixed + '$ fixed makes $z$ a function of $' + sv + '$ alone, so the slope is the partial derivative $\\frac{\\partial z}{\\partial ' + sv + '}$.', '$\\frac{\\partial z}{\\partial ' + sv + '} = ' + g.d(sv).toTex() + '$.', 'At $' + ptTex(P) + '$: $' + dv.toTex() + '$.'],
        hint: 'The slope of a trace is a partial derivative.', chk: { k: 'dat', f: g.toPlain(), v: [sv], P: P } };
    }
    if (kind === 'at') {
      var P2 = [R.int(-2, 2), R.int(-2, 2)], f2 = anchor(randF(R, XY, L), envPt(XY, P2), R), v2 = R.pick(['x', 'y']), d2 = f2.d(v2), val = d2.at(envPt(XY, P2));
      return { q: 'Let $' + fdef(f2) + '$. Find $f_' + v2 + ptTex(P2) + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['Differentiate with respect to $' + v2 + '$, holding the other variable constant: $f_' + v2 + ' = ' + d2.toTex() + '$.', 'Substitute $' + ptTex(P2) + '$: $f_' + v2 + ptTex(P2) + ' = ' + val.toTex() + '$.'],
        hint: 'Differentiate first, then substitute the point.', chk: { k: 'dat', f: f2.toPlain(), v: [v2], P: P2 } };
    }
    var f3 = randF(R, XYZ, Math.min(L, 2)), v3 = R.pick(['x', 'y', 'z']), d3 = f3.d(v3);
    return { q: 'Find $\\dfrac{\\partial f}{\\partial ' + v3 + '}$ for $' + fdef(f3) + '$.', a: { t: 'expr', v: d3.toPlain(), vars: XYZ },
      steps: ['Hold the other two variables constant.', '$\\frac{\\partial f}{\\partial ' + v3 + '} = ' + d3.toTex() + '$.'], hint: 'Only $' + v3 + '$ changes; everything else is a constant.', chk: { k: 'd', f: f3.toPlain(), v: [v3] } };
  });

  G('calc3.higher-partials', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['mixed', 'pure', 'clair'], ['mixed', 'pure', 'at', 'clair'], ['at', 'third', 'mixed', 'clair']));
    if (kind === 'clair') {
      var g = Ex.poly(rmono(R, XY, 3).add(rmono(R, XY, 3)).add(rmono(R, XY, 2))), fx = g.d('x').poly(), fy = g.d('y').poly(), ok = R.coin();
      if (!ok) { var bump = Poly.of(XY, [[R.nz(-3, 3), { x: R.int(1, 2), y: R.int(1, 2) }]]); fy = fy.add(bump); }
      var good = fx.d('y').sub(fy.d('x')).isZero();
      return { q: 'Could $f_x = ' + fx.toTex() + '$ and $f_y = ' + fy.toTex() + '$ be the partial derivatives of one smooth function $f$?', a: { t: 'tf', v: good },
        steps: ['For a smooth $f$, the mixed partials agree (Clairaut): $(f_x)_y = (f_y)_x$.', '$(f_x)_y = ' + fx.d('y').toTex() + '$ and $(f_y)_x = ' + fy.d('x').toTex() + '$.', good ? 'They match, so such an $f$ can exist.' : 'They differ, so no smooth $f$ has these partials.'],
        hint: 'Differentiate $f_x$ with respect to $y$ and $f_y$ with respect to $x$, and compare.', chk: { k: 'clair', fx: fx.toPlain(), fy: fy.toPlain() } };
    }
    var f = randF(R, XY, L), ords = { mixed: R.pick(['xy', 'yx']), pure: R.pick(['xx', 'yy']), at: R.pick(['xy', 'xx', 'yy']), third: R.pick(['xxy', 'xyy', 'yxy']) }, ord = ords[kind];
    var cur = f, chain = [];
    ord.split('').forEach(function (v) { cur = cur.d(v); chain.push(cur); });
    if (kind === 'at' || kind === 'third') {
      var P = [R.int(-2, 2), R.int(-2, 2)]; f = anchor(f, envPt(XY, P), R); cur = f; chain = []; ord.split('').forEach(function (v) { cur = cur.d(v); chain.push(cur); });
      var val = cur.at(envPt(XY, P));
      return { q: 'Let $' + fdef(f) + '$. Find $f_{' + ord + '}' + ptTex(P) + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['$f_{' + ord + '}$ means: differentiate in $' + ord.split('').join('$, then $') + '$, in that order.'].concat(chain.map(function (c, i) { return '$f_{' + ord.slice(0, i + 1) + '} = ' + c.toTex() + '$'; })).concat(['At $' + ptTex(P) + '$: $' + val.toTex() + '$.']),
        hint: 'Take one derivative at a time; substitute the point at the end.', chk: { k: 'dat', f: f.toPlain(), v: ord.split(''), P: P } };
    }
    return { q: 'Find $f_{' + ord + '}$ for $' + fdef(f) + '$.', a: { t: 'expr', v: cur.toPlain(), vars: XY },
      steps: ['$f_{' + ord + '}$: differentiate with respect to $' + ord[0] + '$ first, then $' + ord[1] + '$.'].concat(chain.map(function (c, i) { return '$f_{' + ord.slice(0, i + 1) + '} = ' + c.toTex() + '$'; })).concat(kind === 'mixed' ? ['For smooth functions $f_{xy} = f_{yx}$, so the other order gives the same answer: a good check.'] : []),
      hint: 'Two derivatives, one after the other. Keep track of which variable each one is in.', chk: { k: 'd', f: f.toPlain(), v: ord.split('') } };
  });

  // tangent planes and linear approximation
  function tpData(R, L) {
    var P = [R.int(-2, 2), R.int(-2, 2)], f = anchor(randF(R, XY, L), envPt(XY, P), R), env = envPt(XY, P);
    return { P: P, f: f, z0: f.at(env), fx: f.d('x').at(env), fy: f.d('y').at(env) };
  }
  function tanTex(z0, fx, fy, P) { return T.terms([[z0, ''], [fx, P[0] ? '(' + T.lin(1, 'x', -P[0]) + ')' : 'x'], [fy, P[1] ? '(' + T.lin(1, 'y', -P[1]) + ')' : 'y']]); }
  function decOr(v) { return v.isTerminating() ? v.toDec(10).replace(/\.?0+$/, '') : v.toPlain(); }
  function tpPlain(d) { return 'z = ' + d.z0.toPlain() + ' + (' + d.fx.toPlain() + ')*(x - (' + d.P[0] + ')) + (' + d.fy.toPlain() + ')*(y - (' + d.P[1] + '))'; }
  function tpExpanded(d) { var p = Poly.of(XY, [[d.fx, { x: 1 }], [d.fy, { y: 1 }], [d.z0.sub(d.fx.mul(d.P[0])).sub(d.fy.mul(d.P[1])), {}]]); return p; }
  G('calc3.tangent-planes', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['plane', 'plane', 'approx'], ['plane', 'approx', 'normal'], ['approx', 'plane', 'normal']));
    var d = tpData(R, L), lin = tpExpanded(d), env = envPt(XY, d.P);
    var base = ['$f' + ptTex(d.P) + ' = ' + d.z0.toTex() + '$.', '$f_x = ' + d.f.d('x').toTex() + '$, so $f_x' + ptTex(d.P) + ' = ' + d.fx.toTex() + '$.', '$f_y = ' + d.f.d('y').toTex() + '$, so $f_y' + ptTex(d.P) + ' = ' + d.fy.toTex() + '$.'];
    if (kind === 'plane') return { q: 'Find an equation of the tangent plane to $z = ' + d.f.toTex() + '$ at the point where $(x, y) = ' + ptTex(d.P) + '$.', a: { t: 'eq', v: tpPlain(d) },
      steps: base.concat(['$z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$: $z = ' + tanTex(d.z0, d.fx, d.fy, d.P) + '$.', 'Simplified: $z = ' + lin.toTex() + '$.']),
      hint: 'You need three numbers at the point: $f$, $f_x$ and $f_y$.', chk: { k: 'tp', f: d.f.toPlain(), P: d.P } };
    if (kind === 'normal') return { q: 'Find the normal vector $\\langle f_x, f_y, -1 \\rangle$ to the surface $z = ' + d.f.toTex() + '$ at the point where $(x, y) = ' + ptTex(d.P) + '$.', a: { t: 'tuple', v: [d.fx.toPlain(), d.fy.toPlain(), '-1'] },
      steps: base.slice(1).concat(['Write the tangent plane as $f_x(x - a) + f_y(y - b) - (z - z_0) = 0$: its normal is $\\langle f_x, f_y, -1 \\rangle = ' + vTex([d.fx, d.fy, -1]) + '$.']),
      hint: 'Compute both partial derivatives at the point.', chk: { k: 'normal', f: d.f.toPlain(), P: d.P } };
    var h = R.pick([Q(1, 10), Q(-1, 10), Q(1, 20), Q(1, 5), Q(-1, 5)]), k = R.pick([Q(1, 10), Q(-1, 10), Q(-1, 20), Q(1, 5), Q(0)]), X = [q(d.P[0]).add(h), q(d.P[1]).add(k)], Lv = d.z0.add(d.fx.mul(h)).add(d.fy.mul(k));
    return { q: 'Use the linear approximation of $f(x, y) = ' + d.f.toTex() + '$ at $' + ptTex(d.P) + '$ to estimate $f(' + X.map(function (x) { return x.toDec(2).replace(/\.?0+$/, ''); }).join(', ') + ')$.', a: { t: 'num', v: decOr(Lv) },
      steps: base.concat(['$L(x, y) = ' + tanTex(d.z0, d.fx, d.fy, d.P) + '$.', 'Here $\\Delta x = ' + h.toDec(2).replace(/\.?0+$/, '') + '$ and $\\Delta y = ' + k.toDec(2).replace(/\.?0+$/, '') + '$: $L = ' + d.z0.toTex() + ' + ' + pf(d.fx) + '(' + h.toDec(2).replace(/\.?0+$/, '') + ') + ' + pf(d.fy) + '(' + k.toDec(2).replace(/\.?0+$/, '') + ') = ' + Lv.toDec(4).replace(/\.?0+$/, '') + '$.']),
      hint: 'Near the point, $f \\approx f(a, b) + f_x\\,\\Delta x + f_y\\,\\Delta y$.', chk: { k: 'approx', f: d.f.toPlain(), P: d.P, h: qn(h), kk: qn(k) }, nolint: ['+ 0', '+ -'] };
  });

  G('calc3.differentials-error', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['dz', 'dz', 'cyl'], ['cyl', 'box', 'pct', 'dz'], ['pct', 'cyl', 'cone', 'box']));
    if (kind === 'dz') {
      var d = tpData(R, Math.min(L, 2)), dx = R.pick([Q(1, 10), Q(-1, 10), Q(1, 20), Q(1, 5)]), dy = R.pick([Q(-1, 10), Q(1, 10), Q(-1, 20), Q(1, 5)]), dz = d.fx.mul(dx).add(d.fy.mul(dy));
      return { q: 'For $z = ' + d.f.toTex() + '$, find the differential $dz$ at $' + ptTex(d.P) + '$ when $dx = ' + dx.toDec(2).replace(/\.?0+$/, '') + '$ and $dy = ' + dy.toDec(2).replace(/\.?0+$/, '') + '$.', a: { t: 'num', v: decOr(dz) },
        steps: ['$dz = f_x\\,dx + f_y\\,dy$: the change along the tangent plane.', '$f_x' + ptTex(d.P) + ' = ' + d.fx.toTex() + '$ and $f_y' + ptTex(d.P) + ' = ' + d.fy.toTex() + '$.', '$dz = ' + pf(d.fx) + '(' + dx.toDec(2).replace(/\.?0+$/, '') + ') + ' + pf(d.fy) + '(' + dy.toDec(2).replace(/\.?0+$/, '') + ') = ' + dz.toDec(4).replace(/\.?0+$/, '') + '$.'],
        hint: 'Find both partials at the point, then $dz = f_x\\,dx + f_y\\,dy$.', chk: { k: 'dz', f: d.f.toPlain(), P: d.P, dx: qn(dx), dy: qn(dy) }, nolint: ['+ -', '+ 0'] };
    }
    if (kind === 'cyl' || kind === 'cone') {
      var r = R.int(2, 10), hh = R.int(3, 20), er = R.pick([Q(1, 10), Q(1, 20), Q(1, 5)]), eh = R.pick([Q(1, 10), Q(1, 5), Q(1, 4)]), c = kind === 'cone' ? Q(1, 3) : Q(1);
      var Vr = c.mul(2 * r * hh), Vh = c.mul(r * r), err = Vr.mul(er).add(Vh.mul(eh));
      var Vtex = kind === 'cone' ? 'V = \\frac{1}{3}\\pi r^2 h' : 'V = \\pi r^2 h';
      return { q: 'The radius and height of a ' + (kind === 'cone' ? 'cone' : 'cylinder') + ' are measured as $r = ' + r + '$ cm and $h = ' + hh + '$ cm, with possible errors of at most $' + er.toDec(2).replace(/\.?0+$/, '') + '$ cm and $' + eh.toDec(2).replace(/\.?0+$/, '') + '$ cm. Use differentials to estimate the largest possible error in the computed volume $' + Vtex + '$ (in cm$^3$).', a: { t: 'num', v: piPlain(err) },
        steps: ['$dV = V_r\\,dr + V_h\\,dh$ with $V_r = ' + (kind === 'cone' ? '\\frac{2}{3}' : '2') + '\\pi r h$ and $V_h = ' + (kind === 'cone' ? '\\frac{1}{3}' : '') + '\\pi r^2$.', 'At the measurements: $V_r = ' + piTex(Vr) + '$ and $V_h = ' + piTex(Vh) + '$.', 'Worst case, both errors push the same way: $|dV| \\le ' + piTex(Vr) + '(' + er.toDec(2).replace(/\.?0+$/, '') + ') + ' + piTex(Vh) + '(' + eh.toDec(2).replace(/\.?0+$/, '') + ') = ' + piTex(err) + ' \\approx ' + (qn(err) * Math.PI).toFixed(1) + '$ cm$^3$.'],
        hint: 'Use $dV = V_r\\,dr + V_h\\,dh$ with the largest errors as $dr$ and $dh$.', chk: { k: 'cyl', c: qn(c), r: r, h: hh, er: qn(er), eh: qn(eh) } };
    }
    if (kind === 'box') {
      var dims = [R.int(2, 9), R.int(2, 9), R.int(2, 9)], e = R.pick([Q(1, 10), Q(1, 20), Q(1, 50)]), dV = q(dims[0] * dims[1] + dims[1] * dims[2] + dims[0] * dims[2]).mul(e);
      return { q: 'A box measures $' + dims.join('$ by $') + '$ inches, and each edge could be off by up to $' + e.toDec(2).replace(/\.?0+$/, '') + '$ inch. Estimate the largest possible error in its volume (cubic inches).', a: { t: 'num', v: decOr(dV) },
        steps: ['$V = xyz$, so $dV = yz\\,dx + xz\\,dy + xy\\,dz$.', '$yz = ' + dims[1] * dims[2] + '$, $xz = ' + dims[0] * dims[2] + '$, $xy = ' + dims[0] * dims[1] + '$.', '$|dV| \\le (' + dims[1] * dims[2] + ' + ' + dims[0] * dims[2] + ' + ' + dims[0] * dims[1] + ')(' + e.toDec(2).replace(/\.?0+$/, '') + ') = ' + dV.toDec(3).replace(/\.?0+$/, '') + '$.'],
        hint: 'Each partial derivative of $V = xyz$ is the product of the other two edges.', chk: { k: 'box', d: dims, e: qn(e) } };
    }
    var a = R.pick([1, 2, 3]), b = R.pick([1, 2]), pa = R.pick([1, 2, 3]), pb = R.pick([1, 2, 4]), tot = a * pa + b * pb;
    return { q: 'A quantity is computed as $Q = k\\,x^{' + a + '}y^{' + b + '}$ (with $k$ a constant). If $x$ can be off by $' + pa + '\\%$ and $y$ by $' + pb + '\\%$, estimate the largest possible percent error in $Q$.', a: { t: 'num', v: String(tot), pct: true },
      steps: ['Divide $dQ$ by $Q$: $\\frac{dQ}{Q} = ' + (a === 1 ? '' : a) + '\\frac{dx}{x} + ' + (b === 1 ? '' : b) + '\\frac{dy}{y}$ (each power becomes a multiplier).', 'Worst case: $' + a + '(' + pa + '\\%) + ' + b + '(' + pb + '\\%) = ' + tot + '\\%$.'],
      hint: 'Relative errors add up, each multiplied by its power.', chk: { k: 'pct', a: a, b: b, pa: pa, pb: pb } };
  });

  // chain rule
  function polyT(R, deg) { return Poly.of(TV, [[R.nz(-3, 3), { t: deg || R.int(1, 2) }], [R.int(-3, 3), {}]]); }
  G('calc3.multivariable-chain-rule', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['dzdt', 'dzdt', 'tree'], ['dzdt', 'partial', 'expr', 'tree'], ['partial', 'expr', 'partial', 'tree']));
    if (kind === 'dzdt' || kind === 'expr') {
      var xt = polyT(R), yt = polyT(R), t0 = R.int(-2, 2), P = [xt.at({ t: t0 }), yt.at({ t: t0 })], f = anchor(randF(R, XY, kind === 'expr' ? 1 : L), envPt(XY, P), R);
      var fx = f.d('x'), fy = f.d('y'), env = envPt(XY, P), xd = xt.d('t'), yd = yt.d('t'), val = fx.at(env).mul(xd.at({ t: t0 })).add(fy.at(env).mul(yd.at({ t: t0 })));
      var head = 'Let $z = ' + f.toTex() + '$ with $x = ' + xt.toTex() + '$ and $y = ' + yt.toTex() + '$.';
      if (kind === 'expr') { var comp = f.subst({ __vars: TV, x: xt, y: yt }), dd = comp.d('t');
        return { q: head + ' Find $\\dfrac{dz}{dt}$ as a function of $t$.', a: { t: 'expr', v: dd.toPlain(), vars: ['t'] },
          steps: ['$\\dfrac{dz}{dt} = \\dfrac{\\partial z}{\\partial x}\\dfrac{dx}{dt} + \\dfrac{\\partial z}{\\partial y}\\dfrac{dy}{dt}$: one term for each path from $z$ down to $t$.', '$z_x = ' + fx.toTex() + '$, $z_y = ' + fy.toTex() + '$, $\\frac{dx}{dt} = ' + xd.toTex() + '$, $\\frac{dy}{dt} = ' + yd.toTex() + '$.', 'Put everything in terms of $t$ and simplify: $\\dfrac{dz}{dt} = ' + dd.toTex() + '$.', 'Check: substituting first and differentiating $z(t) = ' + comp.toTex() + '$ directly gives the same result.'],
          hint: 'Use both paths, $z \\to x \\to t$ and $z \\to y \\to t$, then write everything in $t$.', chk: { k: 'expr', f: f.toPlain(), x: xt.toPlain(), y: yt.toPlain() } }; }
      return { q: head + ' Find $\\dfrac{dz}{dt}$ at $t = ' + t0 + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['$\\dfrac{dz}{dt} = \\dfrac{\\partial z}{\\partial x}\\dfrac{dx}{dt} + \\dfrac{\\partial z}{\\partial y}\\dfrac{dy}{dt}$.', 'At $t = ' + t0 + '$: $(x, y) = ' + ptTex(P) + '$, $\\frac{dx}{dt} = ' + xd.at({ t: t0 }).toTex() + '$, $\\frac{dy}{dt} = ' + yd.at({ t: t0 }).toTex() + '$.', '$z_x = ' + fx.toTex() + ' = ' + fx.at(env).toTex() + '$ and $z_y = ' + fy.toTex() + ' = ' + fy.at(env).toTex() + '$ there.', '$\\dfrac{dz}{dt} = ' + pf(fx.at(env)) + '\\cdot ' + pf(xd.at({ t: t0 })) + ' + ' + pf(fy.at(env)) + '\\cdot ' + pf(yd.at({ t: t0 })) + ' = ' + val.toTex() + '$.'],
        hint: 'Find $(x, y)$ at that $t$ first, then add the two products.', chk: { k: 'dzdt', f: f.toPlain(), x: xt.toPlain(), y: yt.toPlain(), t0: t0 }, nolint: ['+ 0'] };
    }
    if (kind === 'partial') {
      var ST = ['s', 't'], xs = Poly.of(ST, [[R.nz(-3, 3), { s: 1, t: R.int(0, 1) }], [R.nz(-2, 2), { t: R.int(1, 2) }]]), ys = Poly.of(ST, [[R.nz(-2, 2), { s: R.int(1, 2) }], [R.nz(-3, 3), { t: 1 }]]);
      var s0 = R.int(-2, 2), tt0 = R.int(-2, 2), env2 = { s: s0, t: tt0 }, P2 = [xs.at(env2), ys.at(env2)], g = anchor(randF(R, XY, Math.min(L, 2)), envPt(XY, P2), R), wrt = R.pick(['s', 't']);
      var gx = g.d('x').at(envPt(XY, P2)), gy = g.d('y').at(envPt(XY, P2)), xw = xs.d(wrt).at(env2), yw = ys.d(wrt).at(env2), val2 = gx.mul(xw).add(gy.mul(yw));
      return { q: 'Let $z = ' + g.toTex() + '$, where $x = ' + xs.toTex() + '$ and $y = ' + ys.toTex() + '$. Find $\\dfrac{\\partial z}{\\partial ' + wrt + '}$ at $(s, t) = ' + ptTex([s0, tt0]) + '$.', a: { t: 'num', v: val2.toPlain() },
        steps: ['$\\dfrac{\\partial z}{\\partial ' + wrt + '} = \\dfrac{\\partial z}{\\partial x}\\dfrac{\\partial x}{\\partial ' + wrt + '} + \\dfrac{\\partial z}{\\partial y}\\dfrac{\\partial y}{\\partial ' + wrt + '}$.', 'At $(s, t) = ' + ptTex([s0, tt0]) + '$: $(x, y) = ' + ptTex(P2) + '$, $\\frac{\\partial x}{\\partial ' + wrt + '} = ' + xw.toTex() + '$, $\\frac{\\partial y}{\\partial ' + wrt + '} = ' + yw.toTex() + '$.', '$z_x = ' + gx.toTex() + '$ and $z_y = ' + gy.toTex() + '$ at that point.', 'So $\\dfrac{\\partial z}{\\partial ' + wrt + '} = ' + pf(gx) + '\\cdot ' + pf(xw) + ' + ' + pf(gy) + '\\cdot ' + pf(yw) + ' = ' + val2.toTex() + '$.'],
        hint: 'Two paths lead from $z$ to $' + wrt + '$: through $x$ and through $y$.', chk: { k: 'partial', f: g.toPlain(), x: xs.toPlain(), y: ys.toPlain(), s0: s0, t0: tt0, w: wrt }, nolint: ['+ 0'] };
    }
    var three = L > 1 && R.coin(), vs = three ? ['x', 'y', 'z'] : ['x', 'y'], w = R.pick(['s', 't']);
    var term = function (v) { return '\\frac{\\partial w}{\\partial ' + v + '}\\frac{\\partial ' + v + '}{\\partial ' + w + '}'; };
    var right = vs.map(term).join(' + '), drop = vs.slice(0, -1).map(term).join(' + '), wrongD = vs.map(function (v) { return '\\frac{\\partial w}{\\partial ' + v + '}\\frac{d' + v + '}{d' + w + '}'; }).join(' + '), mult = vs.map(term).join(' \\cdot ');
    return { q: 'Suppose $w = f(' + vs.join(', ') + ')$ and each of $' + vs.join(', ') + '$ is a function of $s$ and $t$. Which formula gives $\\dfrac{\\partial w}{\\partial ' + w + '}$?', a: mc(R, '$' + right + '$', ['$' + drop + '$', '$' + mult + '$', '$\\frac{\\partial w}{\\partial ' + w + '}\\frac{\\partial ' + w + '}{\\partial ' + (w === 's' ? 't' : 's') + '}$']),
      steps: ['Draw the tree: $w$ branches to ' + vs.map(function (v) { return '$' + v + '$'; }).join(', ') + ', and each of those branches to $s$ and $t$.', 'Every path from $w$ down to $' + w + '$ contributes the product of the derivatives along it; then add the paths.', 'There are ' + vs.length + ' paths, so: $\\dfrac{\\partial w}{\\partial ' + w + '} = ' + right + '$.'],
      hint: 'Count every path from $w$ down to $' + w + '$; multiply along a path and add across paths.', chk: { k: 'tree', ans: '$' + right + '$' } };
  });

  G('calc3.implicit-partials', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['dydx', 'dydx', 'expr'], ['dydx', 'dzdx', 'expr'], ['dzdx', 'dzdx', 'dydx']));
    if (kind === 'dydx' || kind === 'expr') {
      var F = Poly.of(XY, [[R.nz(-3, 3), { x: R.int(1, 3), y: R.int(0, 2) }], [R.nz(-3, 3), { x: R.int(0, 2), y: R.int(1, 3) }], [R.nz(-3, 3), { x: 1, y: 1 }]]), P = [R.nz(-2, 2), R.nz(-2, 2)], env = envPt(XY, P);
      var Fx = F.d('x'), Fy = F.d('y'); while (Fy.at(env).isZero()) { F = F.add(Poly.of(XY, [[1, { y: 1 }]])); Fx = F.d('x'); Fy = F.d('y'); }
      var c = F.at(env), Fxv = Fx.at(env), Fyv = Fy.at(env), slope = Fxv.neg().div(Fyv);
      if (kind === 'expr') return { q: 'Use $\\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y}$ to find $\\dfrac{dy}{dx}$ for the curve $' + F.toTex() + ' = ' + c.toTex() + '$, as an expression in $x$ and $y$.', a: { t: 'expr', v: '-(' + Fx.toPlain() + ')/(' + Fy.toPlain() + ')', vars: XY },
        steps: ['Write the curve as $F(x, y) = ' + c.toTex() + '$ with $F = ' + F.toTex() + '$.', 'Along the curve $F$ is constant, so the chain rule gives $F_x + F_y\\frac{dy}{dx} = 0$.', '$F_x = ' + Fx.toTex() + '$ and $F_y = ' + Fy.toTex() + '$.', '$\\dfrac{dy}{dx} = -\\dfrac{' + Fx.toTex() + '}{' + Fy.toTex() + '}$.'],
        hint: 'Find $F_x$ and $F_y$, then use $-F_x/F_y$. Keep the minus sign.', chk: { k: 'expr', F: F.toPlain() } };
      return { q: 'The point $' + ptTex(P) + '$ is on the curve $' + F.toTex() + ' = ' + c.toTex() + '$. Find $\\dfrac{dy}{dx}$ there.', a: { t: 'num', v: slope.toPlain() },
        steps: ['Differentiate $F(x, y(x)) = ' + c.toTex() + '$ with the chain rule: $F_x + F_y\\,\\frac{dy}{dx} = 0$, so $\\frac{dy}{dx} = -\\frac{F_x}{F_y}$.', '$F_x = ' + Fx.toTex() + ' = ' + Fxv.toTex() + '$ and $F_y = ' + Fy.toTex() + ' = ' + Fyv.toTex() + '$ at the point.', '$\\dfrac{dy}{dx} = -\\dfrac{' + Fxv.toTex() + '}{' + Fyv.toTex() + '} = ' + slope.toTex() + '$.'],
        hint: 'Use $\\frac{dy}{dx} = -\\frac{F_x}{F_y}$ at the point. The minus sign matters.', chk: { k: 'dydx', F: F.toPlain(), P: P } };
    }
    var F3 = Poly.of(XYZ, [[R.nz(-3, 3), { x: R.int(1, 2), z: R.int(0, 1) }], [R.nz(-3, 3), { y: R.int(1, 2), z: R.int(0, 1) }], [R.nz(-3, 3), { z: R.int(1, 3) }], [R.nz(-2, 2), { x: 1, y: 1, z: R.int(0, 1) }]]), P3 = [R.nz(-2, 2), R.nz(-2, 2), R.nz(-2, 2)], e3 = envPt(XYZ, P3);
    while (F3.d('z').at(e3).isZero()) F3 = F3.add(Poly.of(XYZ, [[1, { z: 1 }]]));
    var wv = R.pick(['x', 'y']), Fw = F3.d(wv).at(e3), Fz = F3.d('z').at(e3), ans = Fw.neg().div(Fz);
    return { q: 'The equation $' + F3.toTex() + ' = ' + F3.at(e3).toTex() + '$ defines $z$ as a function of $x$ and $y$ near $' + ptTex(P3) + '$. Find $\\dfrac{\\partial z}{\\partial ' + wv + '}$ there.', a: { t: 'num', v: ans.toPlain() },
      steps: ['Hold the other variable fixed and differentiate $F(x, y, z) = \\text{const}$: $F_' + wv + ' + F_z\\frac{\\partial z}{\\partial ' + wv + '} = 0$, so $\\frac{\\partial z}{\\partial ' + wv + '} = -\\frac{F_' + wv + '}{F_z}$.', '$F_' + wv + ' = ' + F3.d(wv).toTex() + ' = ' + Fw.toTex() + '$ and $F_z = ' + F3.d('z').toTex() + ' = ' + Fz.toTex() + '$ at the point.', '$\\dfrac{\\partial z}{\\partial ' + wv + '} = -\\dfrac{' + Fw.toTex() + '}{' + Fz.toTex() + '} = ' + ans.toTex() + '$.'],
      hint: 'Use $-F_' + wv + '/F_z$ at the point.', chk: { k: 'dzdx', F: F3.toPlain(), P: P3, w: wv } };
  });

  // directional derivatives and gradients
  G('calc3.directional-derivatives', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['vec', 'vec', 'toward'], ['vec', 'angle', 'toward', 'which'], ['angle', 'three', 'which', 'toward']));
    if (kind === 'three') {
      var P3 = [R.int(-2, 2), R.int(-2, 2), R.int(-2, 2)], f3 = anchor(randF(R, XYZ, 2), envPt(XYZ, P3), R), g3 = XYZ.map(function (v) { return f3.d(v).at(envPt(XYZ, P3)); }), dv = py3(R, 11), D3 = vdot(g3, dv.v).div(dv.n);
      return { q: 'Find the directional derivative of $f(x, y, z) = ' + f3.toTex() + '$ at $' + ptTex(P3) + '$ in the direction of $\\mathbf{v} = ' + vTex(dv.v) + '$.', a: { t: 'num', v: D3.toPlain() },
        steps: ['$\\nabla f' + ptTex(P3) + ' = ' + vTex(g3) + '$.', '$\\mathbf{v}$ is not a unit vector: $|\\mathbf{v}| = ' + dv.n + '$, so $\\mathbf{u} = \\frac{1}{' + dv.n + '}' + vTex(dv.v) + '$.', '$D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u} = \\frac{' + vdot(g3, dv.v).toTex() + '}{' + dv.n + '} = ' + D3.toTex() + '$.'],
        hint: 'Make the direction a unit vector before you dot it with the gradient.', chk: { k: 'dir', f: f3.toPlain(), vars: XYZ, P: P3, v: dv.v } };
    }
    var P = [R.int(-2, 2), R.int(-2, 2)], f = anchor(randF(R, XY, Math.min(L, 2)), envPt(XY, P), R), env = envPt(XY, P), g = [f.d('x').at(env), f.d('y').at(env)];
    if (vZero(g)) { f = f.add(Ex.poly(Poly.of(XY, [[2, { x: 1 }], [-1, { y: 1 }]]))); g = [f.d('x').at(env), f.d('y').at(env)]; }
    var gradStep = '$f_x = ' + f.d('x').toTex() + '$ and $f_y = ' + f.d('y').toTex() + '$, so $\\nabla f' + ptTex(P) + ' = ' + vTex(g) + '$.';
    if (kind === 'vec' || kind === 'toward' || kind === 'which') {
      var dv2 = py2(R, 13), dirT, Qp;
      if (kind === 'toward') { Qp = vadd(P, dv2.v); dirT = 'toward the point $' + ptTex(Qp) + '$'; } else dirT = 'in the direction of $\\mathbf{v} = ' + vTex(dv2.v) + '$';
      var D = vdot(g, dv2.v).div(dv2.n);
      if (kind === 'which') return { q: 'For $f(x, y) = ' + f.toTex() + '$, which number is the rate of change of $f$ at $' + ptTex(P) + '$ in the direction of $\\mathbf{v} = ' + vTex(dv2.v) + '$?', a: mc(R, '$' + D.toTex() + '$', ['$' + vdot(g, dv2.v).toTex() + '$', '$' + vdot(g, dv2.v).div(dv2.n * dv2.n).toTex() + '$', '$' + radTex(Q(1), vn2(g).num()) + '$']),
        steps: [gradStep, 'Only a unit vector measures the rate per unit of distance: $\\mathbf{u} = \\frac{\\mathbf{v}}{|\\mathbf{v}|} = \\frac{1}{' + dv2.n + '}' + vTex(dv2.v) + '$.', '$D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u} = \\frac{' + vdot(g, dv2.v).toTex() + '}{' + dv2.n + '} = ' + D.toTex() + '$. (Dotting with $\\mathbf{v}$ itself gives $' + vdot(g, dv2.v).toTex() + '$, too big by the factor $|\\mathbf{v}| = ' + dv2.n + '$.)'],
        hint: 'Is $\\mathbf{v}$ a unit vector? If not, divide by its length first.', chk: { k: 'dir', f: f.toPlain(), vars: XY, P: P, v: dv2.v, mcAns: '$' + D.toTex() + '$' } };
      return { q: 'Find the directional derivative of $f(x, y) = ' + f.toTex() + '$ at $' + ptTex(P) + '$ ' + dirT + '.', a: { t: 'num', v: D.toPlain() },
        steps: [gradStep, (kind === 'toward' ? 'The direction is $\\overrightarrow{PQ} = ' + vTex(dv2.v) + '$, ' : '$\\mathbf{v}$ ') + 'with length $' + dv2.n + '$, so $\\mathbf{u} = \\left\\langle ' + Q(dv2.v[0], dv2.n).toTex() + ', ' + Q(dv2.v[1], dv2.n).toTex() + ' \\right\\rangle$.', '$D_{\\mathbf{u}}f = ' + pf(g[0]) + '\\cdot ' + pf(Q(dv2.v[0], dv2.n)) + ' + ' + pf(g[1]) + '\\cdot ' + pf(Q(dv2.v[1], dv2.n)) + ' = ' + D.toTex() + '$.'],
        hint: 'Gradient at the point, dotted with a unit vector in the direction.', chk: { k: 'dir', f: f.toPlain(), vars: XY, P: P, v: dv2.v }, nolint: ['+ 0'] };
    }
    var ang = R.pick([30, 45, 60, 120, 135, 150, 210, 240, 300, 315]), aq = Q(ang, 180), tr = TRIG[aq.toString()], rs = radSum([{ k: q(tr.c.k).mul(g[0]), n: tr.c.n }, { k: q(tr.s.k).mul(g[1]), n: tr.s.n }]);
    return { q: 'Find the directional derivative of $f(x, y) = ' + f.toTex() + '$ at $' + ptTex(P) + '$ in the direction that makes an angle of $' + ang + '^\\circ$ with the positive $x$-axis.', a: { t: 'num', v: rs.plain },
      steps: [gradStep, 'The unit vector at angle $\\theta$ is $\\mathbf{u} = \\langle \\cos\\theta, \\sin\\theta \\rangle = \\left\\langle ' + rT(tr.c) + ', ' + rT(tr.s) + ' \\right\\rangle$.', '$D_{\\mathbf{u}}f = ' + pf(g[0]) + ' \\cdot \\left(' + rT(tr.c) + '\\right) + ' + pf(g[1]) + ' \\cdot \\left(' + rT(tr.s) + '\\right) = ' + rs.tex + '$.'],
      hint: '$\\langle \\cos\\theta, \\sin\\theta \\rangle$ is already a unit vector.', chk: { k: 'dirang', f: f.toPlain(), P: P, ang: ang }, nolint: ['+ 0'] };
  });

  G('calc3.gradient', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['grad', 'grad', 'max'], ['max', 'dir', 'gexpr', 'hiker'], ['dir', 'max', 'level', 'hiker']));
    if (kind === 'gexpr') { var f0 = randF(R, XY, 2); return { q: 'Find $\\nabla f$ for $f(x, y) = ' + f0.toTex() + '$.', a: { t: 'tuple', v: [f0.d('x').toPlain(), f0.d('y').toPlain()], vars: XY },
      steps: ['$\\nabla f = \\langle f_x, f_y \\rangle$: the vector of partial derivatives.', '$f_x = ' + f0.d('x').toTex() + '$.', '$f_y = ' + f0.d('y').toTex() + '$.'], hint: 'Take both partial derivatives and put them in a vector.', chk: { k: 'gexpr', f: f0.toPlain() } }; }
    if (kind === 'hiker') {
      var a = R.pick([Q(1, 100), Q(1, 50), Q(1, 200)]), b = R.pick([Q(1, 100), Q(1, 50), Q(1, 25)]), H = R.int(5, 15) * 100, x0 = R.int(-6, 6) * 10, y0 = R.int(-6, 6) * 10; if (!x0 && !y0) x0 = 30;
      var g = [a.mul(-2 * x0), b.mul(-2 * y0)], hz = H - qn(a) * x0 * x0 - qn(b) * y0 * y0;
      return { q: 'A hill has height $h(x, y) = ' + H + T.coef(a.neg(), 'x^{2}', false) + T.coef(b.neg(), 'y^{2}', false) + '$ meters ($x$ east, $y$ north, in meters). A hiker stands at $(' + x0 + ', ' + y0 + ')$. Find $\\nabla h$ there (the direction of steepest climb) and the steepest slope (meters of height per meter walked).', a: { t: 'multi', parts: [{ label: '$\\nabla h =$', a: { t: 'tuple', v: vPlain(g) } }, { label: 'steepest slope $=$', a: { t: 'num', v: sqrtQPlain(vn2(g)) } }] },
        steps: ['$\\nabla h = \\langle h_x, h_y \\rangle = \\left\\langle ' + T.mono(a.mul(-2), 'x') + ', ' + T.mono(b.mul(-2), 'y') + ' \\right\\rangle$.', 'At $(' + x0 + ', ' + y0 + ')$: $\\nabla h = ' + vTex(g) + '$. It points in the direction on the map where the hill rises fastest.', 'The steepest slope is $|\\nabla h| = \\sqrt{' + vn2(g).toTex() + '} = ' + sqrtQTex(vn2(g)) + '$.'],
        hint: 'The gradient points uphill fastest; its length is the steepest rate.', chk: { k: 'hiker', a: qn(a), b: qn(b), P: [x0, y0] } };
    }
    var P = [R.int(-2, 2), R.int(-2, 2)], f = anchor(randF(R, XY, Math.min(L, 2)), envPt(XY, P), R), env = envPt(XY, P), gv = [f.d('x').at(env), f.d('y').at(env)];
    if (vZero(gv)) { f = f.add(Ex.poly(Poly.of(XY, [[3, { x: 1 }], [4, { y: 1 }]]))); gv = [f.d('x').at(env), f.d('y').at(env)]; }
    var n2 = vn2(gv), gs = '$f_x = ' + f.d('x').toTex() + '$, $f_y = ' + f.d('y').toTex() + '$, so $\\nabla f' + ptTex(P) + ' = ' + vTex(gv) + '$.';
    if (kind === 'grad') return { q: 'Find $\\nabla f' + ptTex(P) + '$ for $f(x, y) = ' + f.toTex() + '$.', a: { t: 'tuple', v: vPlain(gv) },
      steps: ['$\\nabla f = \\langle f_x, f_y \\rangle$.', gs], hint: 'Compute both partial derivatives and evaluate them at the point.', chk: { k: 'grad', f: f.toPlain(), P: P } };
    if (kind === 'max') return { q: 'What is the maximum rate of change of $f(x, y) = ' + f.toTex() + '$ at $' + ptTex(P) + '$?', a: { t: 'num', v: sqrtQPlain(n2) },
      steps: [gs, '$D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u} = |\\nabla f|\\cos\\theta$ is largest when $\\mathbf{u}$ points along $\\nabla f$ ($\\theta = 0$).', 'The maximum rate is $|\\nabla f| = \\sqrt{' + n2.toTex() + '} = ' + sqrtQTex(n2) + '$.'],
      hint: 'The largest directional derivative is the length of the gradient.', chk: { k: 'max', f: f.toPlain(), P: P } };
    if (kind === 'level') {
      var perp = [gv[1].neg(), gv[0]];
      return { q: 'At $' + ptTex(P) + '$, in which direction is the rate of change of $f(x, y) = ' + f.toTex() + '$ zero?', a: mc(R, '$\\pm' + vTex(perp) + '$', ['$' + vTex(gv) + '$', '$' + vTex(gv.map(function (x) { return x.neg(); })) + '$', '$\\pm' + vTex([gv[1], gv[0]]) + '$']),
        steps: [gs, '$D_{\\mathbf{u}}f = |\\nabla f|\\cos\\theta = 0$ when $\\mathbf{u}$ is perpendicular to $\\nabla f$: along the level curve.', 'Swap the components and change one sign: $\\pm' + vTex(perp) + '$ (dot product with $\\nabla f$ is $0$).'],
        hint: 'Zero change means moving along the level curve, perpendicular to the gradient.', chk: { k: 'level', f: f.toPlain(), P: P, ans: '$\\pm' + vTex(perp) + '$' } };
    }
    var ndir = gv.map(function (x) { return x.neg(); }), unit = unitPlain(ndir), unitT = unitTex(ndir);
    return { q: 'Find the unit vector in the direction in which $f(x, y) = ' + f.toTex() + '$ decreases fastest at $' + ptTex(P) + '$.', a: { t: 'tuple', v: unit },
      steps: [gs, 'Fastest decrease is opposite the gradient: $-\\nabla f = ' + vTex(ndir) + '$.', 'Divide by its length $\\sqrt{' + n2.toTex() + '}$: $\\mathbf{u} = \\left\\langle ' + unitT.join(', ') + ' \\right\\rangle$.'],
      hint: 'Downhill fastest is $-\\nabla f$; then make it a unit vector.', chk: { k: 'dir', f: f.toPlain(), P: P } };
  });

  G('calc3.gradient-normals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['tplane', 'tline', 'normline'], ['tplane', 'normline', 'tline', 'tplane'], ['tplane', 'normline', 'cross', 'tplane']));
    if (kind === 'tline') {
      var F2 = Poly.of(XY, [[R.nz(1, 3), { x: 2 }], [R.nz(-3, 3), { y: 2 }], [R.int(-2, 2), { x: 1, y: 1 }]]), P2 = [R.nz(-2, 2), R.nz(-2, 2)], e2 = envPt(XY, P2), g2 = [F2.d('x').at(e2), F2.d('y').at(e2)]; if (vZero(g2)) { F2 = F2.add(Poly.of(XY, [[1, { x: 1 }]])); g2 = [F2.d('x').at(e2), F2.d('y').at(e2)]; }
      var k2 = F2.at(e2), rhs = vdot(g2, P2);
      return { q: 'Find an equation of the tangent line to the curve $' + F2.toTex() + ' = ' + k2.toTex() + '$ at $' + ptTex(P2) + '$.', a: { t: 'eq', v: '(' + g2[0].toPlain() + ')*x + (' + g2[1].toPlain() + ')*y = ' + rhs.toPlain() },
        steps: ['The curve is a level curve of $F(x, y) = ' + F2.toTex() + '$, so $\\nabla F$ is perpendicular to it.', '$\\nabla F = \\langle ' + F2.d('x').toTex() + ', ' + F2.d('y').toTex() + ' \\rangle$, so $\\nabla F' + ptTex(P2) + ' = ' + vTex(g2) + '$.', 'The tangent line has this normal: $' + pf(g2[0]) + '(' + T.lin(1, 'x', -P2[0]) + ')' + T.coef(g2[1], '(' + T.lin(1, 'y', -P2[1]) + ')', false) + ' = 0$, that is $' + T.terms([[g2[0], 'x'], [g2[1], 'y']]) + ' = ' + rhs.toTex() + '$.'],
        hint: 'The gradient at the point is a normal vector for the tangent line.', chk: { k: 'tline', F: F2.toPlain(), P: P2 } };
    }
    var S = R.pick(['ell', 'hyp', 'xyz', 'mix']), F, P, xyz = PX(XYZ);
    if (S === 'ell') { F = Poly.of(XYZ, [[R.int(1, 3), { x: 2 }], [R.int(1, 4), { y: 2 }], [R.int(1, 3), { z: 2 }]]); }
    if (S === 'hyp') { F = Poly.of(XYZ, [[R.int(1, 3), { x: 2 }], [R.int(1, 3), { y: 2 }], [-R.int(1, 3), { z: 2 }]]); }
    if (S === 'xyz') { F = Poly.of(XYZ, [[1, { x: 1, y: 1, z: 1 }]]); }
    if (S === 'mix') { F = Poly.of(XYZ, [[R.nz(-2, 2), { x: 2, y: 1 }], [R.nz(-2, 2), { y: 1, z: 2 }], [R.nz(-3, 3), { x: 1 }]]); }
    do { P = [R.nz(-2, 2), R.nz(-2, 2), R.nz(-2, 2)]; } while (vZero(XYZ.map(function (v) { return F.d(v).at(envPt(XYZ, P)); })));
    var env = envPt(XYZ, P), g = XYZ.map(function (v) { return F.d(v).at(env); }), k = F.at(env), d = vdot(g, P), gp = primitive(g), dp = vdot(gp, P);
    var gradS = '$\\nabla F = \\langle ' + XYZ.map(function (v) { return F.d(v).toTex(); }).join(', ') + ' \\rangle$, so $\\nabla F' + ptTex(P) + ' = ' + vTex(g) + '$.';
    if (kind === 'tplane') return { q: 'Find an equation of the tangent plane to the surface $' + F.toTex() + ' = ' + k.toTex() + '$ at $' + ptTex(P) + '$.', a: { t: 'eq', v: planePlain(gp, dp) },
      steps: ['The surface is a level surface of $F(x, y, z) = ' + F.toTex() + '$, and $\\nabla F$ is perpendicular to its level surfaces.', gradS, 'The tangent plane has normal $\\nabla F$: $' + [0, 1, 2].filter(function (i) { return !g[i].isZero(); }).map(function (i) { return pf(g[i]) + '(' + T.lin(1, 'xyz'[i], -P[i]) + ')'; }).join(' + ') + ' = 0$.', 'Simplified: $' + planeTex(gp, dp) + '$.'],
      hint: 'Use the gradient at the point as the normal vector of the plane.', chk: { k: 'tplane', F: F.toPlain(), P: P }, nolint: ['+ -'] };
    if (kind === 'normline') { var t1 = R.pick([1, -1, 2]), pt = vadd(P, vsc(t1, g)); return { q: 'The normal line to $' + F.toTex() + ' = ' + k.toTex() + '$ at $' + ptTex(P) + '$ is $\\mathbf{r}(t) = ' + vTex(P) + ' + t\\,\\nabla F' + ptTex(P) + '$. Find $\\mathbf{r}(' + t1 + ')$.', a: { t: 'tuple', v: vPlain(pt) },
      steps: [gradS, 'The normal line runs along the gradient, straight out of the surface.', '$\\mathbf{r}(' + t1 + ') = ' + vTex(P) + T.coef(t1, vTex(g), false) + ' = ' + ptTex(pt) + '$.'],
      hint: 'The direction of the normal line is the gradient at the point.', chk: { k: 'normline', F: F.toPlain(), P: P, t: t1 } }; }
    var zc = R.nz(-2, 2), Pq = [P[0], P[1], zc];
    var surf = Poly.of(XYZ, [[1, { x: 2 }], [1, { y: 2 }]]), G2 = XYZ.map(function (v) { return surf.d(v).at(envPt(XYZ, Pq)); });
    var Hn = [R.nz(-2, 2), R.nz(-2, 2), 1], dirc = vcross(G2, Hn);
    return { q: 'The cylinder $x^{2} + y^{2} = ' + (P[0] * P[0] + P[1] * P[1]) + '$ and the plane $' + planeTex(Hn, vdot(Hn, Pq)) + '$ meet in a curve through $' + ptTex(Pq) + '$. Find a tangent vector to that curve there, as $\\nabla F \\times \\nabla G$ (cylinder first).', a: { t: 'tuple', v: vPlain(dirc) },
      steps: ['The curve lies on both surfaces, so its tangent is perpendicular to both normals.', '$\\nabla F = \\langle 2x, 2y, 0 \\rangle = ' + vTex(G2) + '$ and $\\nabla G = ' + vTex(Hn) + '$.', 'A vector perpendicular to both is the cross product: $' + vTex(G2) + ' \\times ' + vTex(Hn) + ' = ' + vTex(dirc) + '$.'],
      hint: 'A tangent to the intersection is perpendicular to both gradients.', chk: { k: 'cross', P: Pq, H: Hn }, nolint: ['+ 0'] };
  });


  // ===================================================================== g3_4opt.js
  // ---------- unit: Optimization ----------
  var CPN = ['Local minimum', 'Local maximum', 'Saddle point', 'The test is inconclusive'];
  function classify(fxx, fyy, fxy) { var D = q(fxx).mul(fyy).sub(q(fxy).mul(fxy)); return D.sign() < 0 ? 2 : D.isZero() ? 3 : q(fxx).sign() > 0 ? 0 : 1; }
  function dSteps(fxx, fyy, fxy) {
    var D = q(fxx).mul(fyy).sub(q(fxy).mul(fxy)), c = classify(fxx, fyy, fxy);
    return ['$D = f_{xx}f_{yy} - (f_{xy})^2 = ' + pf(fxx) + pf(fyy) + ' - ' + T.pow(pf(fxy), 2) + ' = ' + D.toTex() + '$.',
      c === 2 ? '$D < 0$: the surface bends up in one direction and down in another, so it is a saddle point.' : c === 3 ? '$D = 0$: the second-derivative test gives no information here; other methods are needed.' : '$D > 0$ and $f_{xx} ' + (c === 0 ? '> 0' : '< 0') + '$: the surface bends ' + (c === 0 ? 'up' : 'down') + ' in every direction, so it is a local ' + (c === 0 ? 'minimum' : 'maximum') + '.'];
  }
  G('calc3.critical-points', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['classify', 'find', 'classify'], ['find', 'quad', 'classify', 'cubic'], ['cubic', 'quad', 'cubic2', 'classify']));
    if (kind === 'classify') {
      var want = R.int(0, 3), fxx, fyy, fxy;
      for (var t = 0; t < 200; t++) { fxx = R.int(-6, 6); fyy = R.int(-6, 6); fxy = R.int(-5, 5); if (classify(fxx, fyy, fxy) === want && (want === 3 || fxx)) break; }
      return { q: 'At a critical point of $f$, $f_{xx} = ' + fxx + '$, $f_{yy} = ' + fyy + '$ and $f_{xy} = ' + fxy + '$. What does the second-derivative test say?', a: { t: 'mc', choices: CPN.slice(), v: classify(fxx, fyy, fxy), keep: true },
        steps: dSteps(fxx, fyy, fxy), hint: 'Compute $D = f_{xx}f_{yy} - (f_{xy})^2$ first. Its sign decides; then look at $f_{xx}$.', chk: { k: 'classify', fxx: fxx, fyy: fyy, fxy: fxy }, nolint: ['+ 0'] };
    }
    if (kind === 'find' || kind === 'quad') {
      var a, b, c; do { a = R.nz(-3, 3); b = R.int(-4, 4); c = R.nz(-3, 3); } while (4 * a * c - b * b === 0);
      var x0 = R.int(-3, 3), y0 = R.int(-3, 3), dd = -(2 * a * x0 + b * y0), ee = -(b * x0 + 2 * c * y0), g = R.int(-5, 5);
      var f = Poly.of(XY, [[a, { x: 2 }], [b, { x: 1, y: 1 }], [c, { y: 2 }], [dd, { x: 1 }], [ee, { y: 1 }], [g, {}]]);
      var st = ['$f_x = ' + f.d('x').toTex() + '$ and $f_y = ' + f.d('y').toTex() + '$.', 'Set both to $0$ and solve the linear system: $(x, y) = ' + ptTex([x0, y0]) + '$.'];
      if (kind === 'find') return { q: 'Find the critical point of $f(x, y) = ' + f.toTex() + '$.', a: { t: 'tuple', v: [String(x0), String(y0)] },
        steps: ['Critical points are where $\\nabla f = \\mathbf{0}$ (both partials zero).'].concat(st).concat(['Check: both partials vanish at $' + ptTex([x0, y0]) + '$.']), hint: 'Set $f_x = 0$ and $f_y = 0$ and solve the two equations together.', chk: { k: 'find', f: f.toPlain() } };
      return { q: 'Find the critical point of $f(x, y) = ' + f.toTex() + '$ and classify it.', a: { t: 'multi', parts: [{ label: 'critical point', a: { t: 'tuple', v: [String(x0), String(y0)] } }, { label: 'type', a: { t: 'mc', choices: CPN.slice(0, 3), v: classify(2 * a, 2 * c, b), keep: true } }] },
        steps: st.concat(['$f_{xx} = ' + 2 * a + '$, $f_{yy} = ' + 2 * c + '$, $f_{xy} = ' + b + '$ (constants for a quadratic).']).concat(dSteps(2 * a, 2 * c, b)), hint: 'Solve $\\nabla f = \\mathbf{0}$, then use $D = f_{xx}f_{yy} - f_{xy}^2$.', chk: { k: 'quad', f: f.toPlain() }, nolint: ['+ 0'] };
    }
    if (kind === 'cubic') { // f = x^3 + y^3 - 3kxy: critical points (0,0) and (k,k)
      var k = R.nz(-3, 3), f2 = Poly.of(XY, [[1, { x: 3 }], [1, { y: 3 }], [-3 * k, { x: 1, y: 1 }]]), which = R.coin();
      var P = which ? [k, k] : [0, 0], cl = which ? classify(6 * k, 6 * k, -3 * k) : classify(0, 0, -3 * k);
      return { q: 'The function $f(x, y) = ' + f2.toTex() + '$ has two critical points. Classify the one at $' + ptTex(P) + '$.', a: { t: 'mc', choices: CPN.slice(), v: cl, keep: true },
        steps: ['$f_x = 3x^2 ' + (k > 0 ? '-' : '+') + ' ' + 3 * Math.abs(k) + 'y$ and $f_y = 3y^2 ' + (k > 0 ? '-' : '+') + ' ' + 3 * Math.abs(k) + 'x$; they vanish at $(0, 0)$ and $' + ptTex([k, k]) + '$.', '$f_{xx} = 6x$, $f_{yy} = 6y$, $f_{xy} = ' + (-3 * k) + '$. At $' + ptTex(P) + '$: $f_{xx} = ' + 6 * P[0] + '$, $f_{yy} = ' + 6 * P[1] + '$.'].concat(dSteps(6 * P[0], 6 * P[1], -3 * k)),
        hint: 'Compute the second partials at that point and the discriminant $D$.', chk: { k: 'cubic', f: f2.toPlain(), P: P }, nolint: ['+ 0'] };
    }
    // cubic2: f = x^3 - 3a^2 x + b y^2 + c y  -> critical points (±a, -c/(2b))
    var a2 = R.int(1, 3), b2 = R.nz(-3, 3), cc = 2 * b2 * R.int(-2, 2), y0c = Q(-cc, 2 * b2), f3 = Poly.of(XY, [[1, { x: 3 }], [-3 * a2 * a2, { x: 1 }], [b2, { y: 2 }], [cc, { y: 1 }]]), sx = R.pick([1, -1]);
    var cl3 = classify(6 * sx * a2, 2 * b2, 0);
    return { q: 'Find the critical point of $f(x, y) = ' + f3.toTex() + '$ with ' + (sx > 0 ? 'positive' : 'negative') + ' $x$-coordinate, and classify it.', a: { t: 'multi', parts: [{ label: 'point', a: { t: 'tuple', v: [String(sx * a2), y0c.toPlain()] } }, { label: 'type', a: { t: 'mc', choices: CPN.slice(0, 3), v: cl3, keep: true } }] },
      steps: ['$f_x = 3x^2 - ' + 3 * a2 * a2 + ' = 0$ gives $x = \\pm ' + a2 + '$; $f_y = ' + T.lin(2 * b2, 'y', cc) + ' = 0$ gives $y = ' + y0c.toTex() + '$.', 'The point asked for is $' + ptTex([sx * a2, y0c]) + '$.', '$f_{xx} = 6x = ' + 6 * sx * a2 + '$, $f_{yy} = ' + 2 * b2 + '$, $f_{xy} = 0$.'].concat(dSteps(6 * sx * a2, 2 * b2, 0)),
      hint: 'The equations separate: $f_x$ involves only $x$ and $f_y$ only $y$.', chk: { k: 'cubic2', f: f3.toPlain(), sx: sx }, nolint: ['+ 0'] };
  });

  // absolute extrema of a quadratic on a rectangle or triangle
  function edgeCands(f, A, B) { // f on the segment A->B: corners plus an interior critical point if any
    var t = Poly.v(['s'], 's'), x = Poly.c(['s'], A[0]).add(t.scale(q(B[0]).sub(A[0]))), y = Poly.c(['s'], A[1]).add(t.scale(q(B[1]).sub(A[1]))), g = f.substAll({ __vars: ['s'], x: x, y: y }), out = [];
    var g2 = g.d('s'); if (g2.deg('s') === 1) { var c1 = g2.terms().filter(function (tm) { return tm[1][0] === 1; })[0][0], c0 = g2.at({ s: 0 }), s0 = c0.neg().div(c1); if (s0.gt(0) && s0.lt(1)) out.push([x.at({ s: s0 }), y.at({ s: s0 })]); }
    return out;
  }
  G('calc3.absolute-extrema', function (R, ctx) {
    var L = lvl(ctx), shape = R.pick(ML.byLevel(ctx, ['rect', 'rect'], ['rect', 'tri'], ['tri', 'rect']));
    var a = R.pick([1, 1, 2, -1]), c = R.pick([1, 2, 1, -1]), b = L > 1 ? R.int(-1, 1) : 0, x0 = R.int(0, 2), y0 = R.int(0, 2);
    var f = Poly.of(XY, [[a, { x: 2 }], [b, { x: 1, y: 1 }], [c, { y: 2 }], [-(2 * a * x0 + b * y0), { x: 1 }], [-(b * x0 + 2 * c * y0), { y: 1 }], [R.int(-3, 5), {}]]);
    var corners, desc;
    if (shape === 'rect') { var w = R.int(2, 4), h = R.int(2, 4), xl = R.int(-1, 0), yl = R.int(-1, 0); corners = [[xl, yl], [xl + w, yl], [xl + w, yl + h], [xl, yl + h]]; desc = 'the rectangle $' + xl + ' \\le x \\le ' + (xl + w) + '$, $' + yl + ' \\le y \\le ' + (yl + h) + '$'; }
    else { var s = R.int(3, 5); corners = [[0, 0], [s, 0], [0, s]]; desc = 'the closed triangle with vertices $(0, 0)$, $(' + s + ', 0)$ and $(0, ' + s + ')$'; }
    var cand = corners.map(function (p) { return p.map(q); }), notes = [];
    // interior critical point (determinant of the Hessian is nonzero unless 4ac = b^2)
    var det = 4 * a * c - b * b, inside = false;
    if (det !== 0) {
      var cx = q(x0), cy = q(y0);
      if (shape === 'rect') inside = cx.gt(corners[0][0]) && cx.lt(corners[1][0]) && cy.gt(corners[0][1]) && cy.lt(corners[2][1]);
      else inside = cx.gt(0) && cy.gt(0) && cx.add(cy).lt(corners[1][0]);
      notes.push('Inside: $\\nabla f = \\mathbf{0}$ at $' + ptTex([x0, y0]) + '$' + (inside ? ', which is inside the region: $f = ' + f.at({ x: x0, y: y0 }).toTex() + '$.' : ', which is not inside the region, so it does not count.'));
      if (inside) cand.push([cx, cy]);
    }
    var edgeList = [];
    for (var i = 0; i < corners.length; i++) { var A = corners[i], B = corners[(i + 1) % corners.length], ec = edgeCands(f, A, B); ec.forEach(function (p) { cand.push(p); edgeList.push(p); }); }
    var vals = cand.map(function (p) { return f.at({ x: p[0], y: p[1] }); }), mx = vals.reduce(function (m, v) { return v.gt(m) ? v : m; }), mn = vals.reduce(function (m, v) { return v.lt(m) ? v : m; });
    var list = U.uniq(cand.map(function (p, j) { return ptTex(p) + ': ' + vals[j].toTex(); }));
    return { q: 'Find the absolute maximum and minimum values of $f(x, y) = ' + f.toTex() + '$ on ' + desc + '.', a: { t: 'multi', parts: [{ label: 'maximum', a: { t: 'num', v: mx.toPlain() } }, { label: 'minimum', a: { t: 'num', v: mn.toPlain() } }] },
      steps: ['A continuous function on a closed, bounded region has both. They occur at critical points inside or somewhere on the boundary.'].concat(notes).concat(['On each edge, $f$ becomes a function of one variable; its critical points' + (edgeList.length ? ' are ' + edgeList.map(function (p) { return '$' + ptTex(p) + '$'; }).join(', ') : ' all fall at the ends') + '.', 'Add the corners and compare every candidate: $' + list.join('$; $') + '$.', 'Largest: $' + mx.toTex() + '$. Smallest: $' + mn.toTex() + '$.']),
      hint: 'List the candidates: interior critical points, critical points of $f$ along each edge, and every corner.', chk: { k: 'abs', f: f.toPlain(), corners: corners, shape: shape }, nolint: ['+ 0'] };
  });

  G('calc3.lagrange-multipliers', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['lin', 'lin', 'quad'], ['lin', 'quad', 'xy', 'dist'], ['dist', 'box', 'xy', 'lin']));
    if (kind === 'lin') {
      var r = R.int(1, 4), ab = L === 1 ? py2(R, 13) : { v: [R.nz(-4, 4), R.nz(-4, 4)] }, a = ab.v[0], b = ab.v[1], s2 = a * a + b * b, mx = radPlain(r, s2), mn = radPlain(-r, s2);
      return { q: 'Use Lagrange multipliers to find the maximum and minimum of $f(x, y) = ' + T.terms([[a, 'x'], [b, 'y']]) + '$ on the circle $x^{2} + y^{2} = ' + r * r + '$.', a: { t: 'multi', parts: [{ label: 'maximum', a: { t: 'num', v: mx } }, { label: 'minimum', a: { t: 'num', v: mn } }] },
        steps: ['$\\nabla f = \\lambda\\nabla g$: $' + a + ' = 2\\lambda x$ and $' + b + ' = 2\\lambda y$, with $x^2 + y^2 = ' + r * r + '$.', 'So $(x, y)$ is parallel to $' + vTex([a, b]) + '$: $(x, y) = \\pm\\frac{' + r + '}{\\sqrt{' + s2 + '}}' + vTex([a, b]) + '$.', 'Check both solutions: $f = \\pm\\frac{' + r + '(' + a * a + ' + ' + b * b + ')}{\\sqrt{' + s2 + '}} = \\pm ' + radTex(r, s2) + '$.', 'Maximum $' + radTex(r, s2) + '$, minimum $' + radTex(-r, s2) + '$. Where they occur, the level line of $f$ just touches the circle.'],
        hint: 'Solve $\\nabla f = \\lambda \\nabla g$ together with the constraint, and evaluate $f$ at every solution.', chk: { k: 'lin', a: a, b: b, r: r } };
    }
    if (kind === 'quad') {
      var p = R.int(1, 5), qq = R.intNot(1, 5, p), r2 = R.int(1, 4), sg = R.pick([1, -1]), ps = p * sg, qs = qq * sg;
      return { q: 'Find the maximum and minimum values of $f(x, y) = ' + T.terms([[ps, 'x^{2}'], [qs, 'y^{2}']]) + '$ on the circle $x^{2} + y^{2} = ' + r2 * r2 + '$.', a: { t: 'multi', parts: [{ label: 'maximum', a: { t: 'num', v: String(Math.max(ps, qs) * r2 * r2) } }, { label: 'minimum', a: { t: 'num', v: String(Math.min(ps, qs) * r2 * r2) } }] },
        steps: ['$\\nabla f = \\lambda \\nabla g$: $' + 2 * ps + 'x = 2\\lambda x$ and $' + 2 * qs + 'y = 2\\lambda y$.', 'First equation: $x = 0$ or $\\lambda = ' + ps + '$. Second: $y = 0$ or $\\lambda = ' + qs + '$. Since $' + ps + ' \\ne ' + qs + '$, one of $x$, $y$ must be $0$.', 'Candidates: $(\\pm ' + r2 + ', 0)$ with $f = ' + ps * r2 * r2 + '$ and $(0, \\pm ' + r2 + ')$ with $f = ' + qs * r2 * r2 + '$.', 'Compare all of them: max $' + Math.max(ps, qs) * r2 * r2 + '$, min $' + Math.min(ps, qs) * r2 * r2 + '$.'],
        hint: 'Each equation gives two options ("this variable is $0$" or "$\\lambda$ equals ..."). Check every combination.', chk: { k: 'quad', p: ps, q: qs, r: r2 } };
    }
    if (kind === 'xy') {
      var A = R.int(1, 4), B = R.int(1, 4), C = 2 * A * B * R.int(1, 3), mxv = Q(C * C, 4 * A * B), xx = Q(C, 2 * A), yy = Q(C, 2 * B);
      return { q: 'Maximize $f(x, y) = xy$ subject to $' + T.terms([[A, 'x'], [B, 'y']]) + ' = ' + C + '$ with $x, y > 0$.', a: { t: 'num', v: mxv.toPlain() },
        steps: ['$\\nabla f = \\langle y, x \\rangle$ and $\\nabla g = \\langle ' + A + ', ' + B + ' \\rangle$, so $y = ' + T.mono(A, '\\lambda') + '$ and $x = ' + T.mono(B, '\\lambda') + '$.', 'Put into the constraint: $' + T.mono(2 * A * B, '\\lambda') + ' = ' + C + '$, so $\\lambda = ' + Q(C, 2 * A * B).toTex() + '$.', 'Then $x = ' + xx.toTex() + '$ and $y = ' + yy.toTex() + '$: each term uses half of the total, $' + T.mono(A, 'x') + ' = ' + T.mono(B, 'y') + ' = ' + C / 2 + '$.', 'Maximum $xy = ' + mxv.toTex() + '$.'],
        hint: 'From $\\nabla f = \\lambda\\nabla g$ write $x$ and $y$ in terms of $\\lambda$, then use the constraint.', chk: { k: 'xy', A: A, B: B, C: C } };
    }
    if (kind === 'dist') {
      var n = L > 2 ? nzVec(R, -3, 3) : py3(R, 9).v, d = R.nz(-12, 12), nn = intLen(n), md = Q(d * d, nn), Pc = n.map(function (x) { return Q(d * x, nn); }), ask = R.coin();
      if (ask) return { q: 'Find the point on the plane $' + planeTex(n, d) + '$ closest to the origin.', a: { t: 'tuple', v: vPlain(Pc) },
        steps: ['Minimize $f = x^2 + y^2 + z^2$ (squared distance) with $g = ' + T.terms([[n[0], 'x'], [n[1], 'y'], [n[2], 'z']]) + ' = ' + d + '$.', '$\\nabla f = \\lambda\\nabla g$: $\\langle 2x, 2y, 2z \\rangle = \\lambda' + vTex(n) + '$, so $(x, y, z) = \\frac{\\lambda}{2}' + vTex(n) + '$: along the normal.', 'Constraint: $\\frac{\\lambda}{2}(' + nn + ') = ' + d + '$, so $\\frac{\\lambda}{2} = ' + Q(d, nn).toTex() + '$.', 'Point: $' + ptTex(Pc) + '$.'],
        hint: 'The closest point lies along the normal vector from the origin.', chk: { k: 'distpt', n: n, d: d } };
      return { q: 'Find the minimum of $x^{2} + y^{2} + z^{2}$ subject to $' + planeTex(n, d) + '$.', a: { t: 'num', v: md.toPlain() },
        steps: ['$\\nabla f = \\lambda\\nabla g$ gives $(x, y, z) = \\frac{\\lambda}{2}' + vTex(n) + '$.', 'The constraint gives $\\frac{\\lambda}{2} = \\frac{' + d + '}{' + nn + '}$.', 'Then $x^2 + y^2 + z^2 = \\left(\\frac{' + d + '}{' + nn + '}\\right)^2 \\cdot ' + nn + ' = ' + md.toTex() + '$: the squared distance from the origin to the plane.'],
        hint: 'Write $x$, $y$, $z$ in terms of $\\lambda$, put them in the constraint, and solve for $\\lambda$.', chk: { k: 'dist', n: n, d: d } };
    }
    var ca = R.int(1, 3), cb = R.int(1, 3), cc = R.int(1, 3), S = 3 * ca * cb * cc * R.int(1, 2), vol = Q(S * S * S, 27 * ca * cb * cc);
    return { q: 'A box with edges $x, y, z > 0$ must satisfy $' + T.terms([[ca, 'x'], [cb, 'y'], [cc, 'z']]) + ' = ' + S + '$ (a cost budget). Find the largest possible volume $xyz$.', a: { t: 'num', v: vol.toPlain() },
      steps: ['$\\nabla(xyz) = \\lambda\\nabla g$: $yz = ' + T.mono(ca, '\\lambda') + '$, $xz = ' + T.mono(cb, '\\lambda') + '$, $xy = ' + T.mono(cc, '\\lambda') + '$.', 'Multiply by $x$, $y$, $z$ respectively: $xyz = ' + T.mono(ca, '\\lambda x') + ' = ' + T.mono(cb, '\\lambda y') + ' = ' + T.mono(cc, '\\lambda z') + '$, so $' + T.mono(ca, 'x') + ' = ' + T.mono(cb, 'y') + ' = ' + T.mono(cc, 'z') + '$: each term takes a third of the budget.', '$' + T.mono(ca, 'x') + ' = ' + T.mono(cb, 'y') + ' = ' + T.mono(cc, 'z') + ' = ' + S / 3 + '$, so $x = ' + Q(S, 3 * ca).toTex() + '$, $y = ' + Q(S, 3 * cb).toTex() + '$, $z = ' + Q(S, 3 * cc).toTex() + '$.', 'Volume: $' + vol.toTex() + '$.'],
      hint: 'Show that the three terms of the constraint must be equal at the best box.', chk: { k: 'box', a: ca, b: cb, c: cc, S: S } };
  });

  G('calc3.lagrange-two-constraints', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['cyl', 'cyl', 'line'], ['cyl', 'line', 'circle'], ['circle', 'line', 'cyl']));
    if (kind === 'cyl') { // f = αx + βy + γz on x^2 + y^2 = R^2, px + qy + z = d
      var Rr = R.int(1, 3), gm = R.nz(-2, 2), p = R.int(-2, 2), qy = R.int(-2, 2), d = R.int(-4, 4), w = L === 1 ? py2(R, 13).v : [R.nz(-3, 3), R.nz(-3, 3)];
      var al = w[0] + gm * p, be = w[1] + gm * qy, s2 = w[0] * w[0] + w[1] * w[1], base = gm * d;
      var mxT = radTex(Rr, s2), mxP = radPlain(Rr, s2), hi = radSum([{ k: q(base), n: 1 }, { k: q(Rr), n: s2 }]), lo = radSum([{ k: q(base), n: 1 }, { k: q(-Rr), n: s2 }]);
      return { q: 'Find the maximum and minimum of $f(x, y, z) = ' + T.terms([[al, 'x'], [be, 'y'], [gm, 'z']]) + '$ on the curve where the cylinder $x^{2} + y^{2} = ' + Rr * Rr + '$ meets the plane $' + T.terms([[p, 'x'], [qy, 'y'], [1, 'z']]) + ' = ' + d + '$.', a: { t: 'multi', parts: [{ label: 'maximum', a: { t: 'num', v: hi.plain } }, { label: 'minimum', a: { t: 'num', v: lo.plain } }] },
        steps: ['Two constraints: $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$ with $g = x^2 + y^2$, $h = ' + T.terms([[p, 'x'], [qy, 'y'], [1, 'z']]) + '$. The $z$-equation gives $\\mu = ' + gm + '$.', 'Equivalently, use the plane to write $z = ' + T.terms([[-p, 'x'], [-qy, 'y'], [d, '']]) + '$; then $f = ' + T.terms([[w[0], 'x'], [w[1], 'y'], [base, '']]) + '$ on the circle.', 'The remaining equations say $(x, y)$ is parallel to $' + vTex(w) + '$: $(x, y) = \\pm\\frac{' + Rr + '}{\\sqrt{' + s2 + '}}' + vTex(w) + '$.', 'So $f = ' + (base ? base + ' \\pm ' : '\\pm ') + mxT + '$: maximum $' + hi.tex + '$, minimum $' + lo.tex + '$.'],
        hint: 'Solve the plane for $z$ to see what $f$ becomes on the circle, or set up $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$.', chk: { k: 'cyl', al: al, be: be, gm: gm, R: Rr, p: p, q: qy, d: d }, nolint: ['+ 0'] };
    }
    if (kind === 'line') { // min x^2 + y^2 + z^2 on two planes
      var n1, n2, cr; do { n1 = nzVec(R, -2, 2); n2 = nzVec(R, -2, 2); cr = vcross(n1, n2); } while (vZero(cr));
      var d1 = R.int(-6, 6), d2 = R.int(-6, 6); if (!d1 && !d2) d1 = 3;
      var a11 = vdot(n1, n1), a12 = vdot(n1, n2), a22 = vdot(n2, n2), det = a11.mul(a22).sub(a12.mul(a12)), lam = q(d1).mul(a22).sub(q(d2).mul(a12)).div(det), mu = a11.mul(d2).sub(a12.mul(d1)).div(det);
      var X = vadd(vsc(lam, n1), vsc(mu, n2)), m = vn2(X);
      return { q: 'Find the minimum of $x^{2} + y^{2} + z^{2}$ subject to $' + planeTex(n1, d1) + '$ and $' + planeTex(n2, d2) + '$.', a: { t: 'num', v: m.toPlain() },
        steps: ['$\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$: $2(x, y, z) = \\lambda' + vTex(n1) + ' + \\mu' + vTex(n2) + '$, so the closest point is a combination $X = a' + vTex(n1) + ' + b' + vTex(n2) + '$.', 'Put $X$ into both constraints: $' + T.terms([[a11, 'a'], [a12, 'b']]) + ' = ' + d1 + '$ and $' + T.terms([[a12, 'a'], [a22, 'b']]) + ' = ' + d2 + '$, so $a = ' + lam.toTex() + '$, $b = ' + mu.toTex() + '$.', '$X = ' + ptTex(X) + '$ and $x^2 + y^2 + z^2 = ' + m.toTex() + '$: the squared distance from the origin to the line where the planes meet.'],
        hint: 'The gradient condition says the closest point is a combination of the two normal vectors.', chk: { k: 'line', n1: n1, n2: n2, d1: d1, d2: d2 }, nolint: ['+ 0', '+ -'] };
    }
    // max of u·X on the circle where the sphere |X| = R meets a plane through the origin with normal n
    var nn, uu; do { nn = nzVec(R, -2, 2); uu = nzVec(R, -2, 2); } while (vZero(vcross(nn, uu)));
    var R2 = R.int(1, 3), val = vn2(uu).sub(vdot(uu, nn).pow(2).div(vn2(nn))), mx = val.mul(R2 * R2);
    return { q: 'Find the maximum of $f(x, y, z) = ' + T.terms([[uu[0], 'x'], [uu[1], 'y'], [uu[2], 'z']]) + '$ on the circle where the sphere $x^{2} + y^{2} + z^{2} = ' + R2 * R2 + '$ meets the plane $' + planeTex(nn, 0) + '$.', a: { t: 'num', v: sqrtQPlain(mx) },
      steps: ['$\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$: $' + vTex(uu) + ' = 2\\lambda X + \\mu' + vTex(nn) + '$. So the best $X$ points along the part of $\\mathbf{u} = ' + vTex(uu) + '$ that lies in the plane.', 'That part is $\\mathbf{u} - \\frac{\\mathbf{u} \\cdot \\mathbf{n}}{|\\mathbf{n}|^2}\\mathbf{n}$, with squared length $|\\mathbf{u}|^2 - \\frac{(\\mathbf{u} \\cdot \\mathbf{n})^2}{|\\mathbf{n}|^2} = ' + vn2(uu).toTex() + ' - \\frac{' + vdot(uu, nn).pow(2).toTex() + '}{' + vn2(nn).toTex() + '} = ' + val.toTex() + '$.', 'The maximum is the radius times that length: $' + R2 + '\\sqrt{' + val.toTex() + '} = ' + sqrtQTex(mx) + '$.'],
      hint: 'On the circle, $f$ is largest where $X$ points along the projection of $\\mathbf{u}$ onto the plane.', chk: { k: 'circle', n: nn, u: uu, R: R2 } };
  });


  // ===================================================================== g3_5int.js
  // ---------- unit: Multiple Integrals ----------

  G('calc3.double-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['mid', 'sep', 'lin'], ['mid', 'corner', 'sep', 'avg'], ['corner', 'avg', 'mid', 'sep']));
    var a = R.int(0, 2), w = R.pick([2, 4]), c = R.int(0, 2), h = R.pick([2, 4]), b = a + w, d = c + h, rect = 'R = [' + a + ', ' + b + '] \\times [' + c + ', ' + d + ']';
    if (kind === 'mid' || kind === 'corner') {
      var f = polyXY(R, 2, 2).add(R.int(0, 6)), m = 2, dx = w / m, dy = h / m, pts = [], sum = Q(0), corner = kind === 'corner';
      for (var i = 0; i < m; i++) for (var j = 0; j < m; j++) { var px = corner ? q(a + (i + 1) * dx) : q(a).add(Q((2 * i + 1) * dx, 2)), py = corner ? q(c + (j + 1) * dy) : q(c).add(Q((2 * j + 1) * dy, 2)); pts.push([px, py]); sum = sum.add(f.at({ x: px, y: py })); }
      var est = sum.mul(dx * dy);
      return { q: 'Estimate $\\displaystyle\\iint_R \\left(' + f.toTex() + '\\right) dA$ over $' + rect + '$ with a $2 \\times 2$ grid of equal squares, sampling each square at its ' + (corner ? 'upper right corner' : 'center (midpoint rule)') + '.', a: { t: 'num', v: decQ(est) },
        steps: ['Each small rectangle has area $\\Delta A = ' + dx + ' \\cdot ' + dy + ' = ' + dx * dy + '$.', 'Sample points: ' + pts.map(function (p) { return '$' + ptTex(p) + '$'; }).join(', ') + '.', 'Values of $f$ there: ' + pts.map(function (p) { return '$' + f.at({ x: p[0], y: p[1] }).toTex() + '$'; }).join(', ') + '; their sum is $' + sum.toTex() + '$.', 'Estimate $= \\Delta A \\times \\text{sum} = ' + dx * dy + ' \\cdot ' + pf(sum) + ' = ' + est.toTex() + '$: the total volume of four boxes standing on the squares.'],
        hint: 'Volume of each box = (value of $f$ at the sample point) × (area of the small square). Add the four boxes.', chk: { k: 'riemann', f: f.toPlain(), a: a, b: b, c: c, d: d, corner: corner } };
    }
    if (kind === 'sep') {
      var g = Poly.of(['x'], [[R.nz(1, 3), { x: R.int(1, 2) }], [R.int(0, 3), {}]]), hy = Poly.of(['y'], [[R.nz(1, 3), { y: R.int(1, 2) }], [R.int(-2, 3), {}]]);
      var Ig = g.defint('x', a, b).cval(), Ih = hy.defint('y', c, d).cval(), tot = Ig.mul(Ih), gT = g.toTex(), hT = hy.toTex();
      return { q: 'Evaluate $\\displaystyle\\iint_R \\left(' + gT + '\\right)\\left(' + hT + '\\right) dA$ where $' + rect + '$.', a: { t: 'num', v: tot.toPlain() },
        steps: ['The integrand is (a function of $x$) times (a function of $y$) and the region is a rectangle, so the double integral splits into a product.', '$\\int_{' + a + '}^{' + b + '} \\left(' + gT + '\\right) dx = ' + Ig.toTex() + '$.', '$\\int_{' + c + '}^{' + d + '} \\left(' + hT + '\\right) dy = ' + Ih.toTex() + '$.', 'Product: $' + Ig.toTex() + ' \\cdot ' + pf(Ih) + ' = ' + tot.toTex() + '$.'],
        hint: 'On a rectangle, $\\iint g(x)h(y)\\,dA = \\left(\\int g\\,dx\\right)\\left(\\int h\\,dy\\right)$.', chk: { k: 'int', f: '(' + g.toPlain() + ')*(' + hy.toPlain().replace(/y/g, 'y') + ')', lim: [[a, b], [c, d]] } };
    }
    if (kind === 'lin') {
      var I1 = R.int(-8, 8), J1 = R.int(-8, 8), p = R.nz(-4, 4), r = R.nz(-4, 4), k = R.int(1, 5), area = w * h, val = q(p * I1 + r * J1 + k * area);
      return { q: 'Over a rectangle $R$ of area $' + area + '$, $\\iint_R f\\,dA = ' + I1 + '$ and $\\iint_R g\\,dA = ' + J1 + '$. Find $\\displaystyle\\iint_R \\left(' + T.terms([[p, 'f'], [r, 'g'], [k, '']]) + '\\right) dA$.', a: { t: 'num', v: val.toPlain() },
        steps: ['Double integrals are linear: constants come out and sums split.', '$\\iint_R ' + k + '\\,dA = ' + k + ' \\cdot \\text{area} = ' + k * area + '$.', 'Total: $' + p + '(' + I1 + ') + ' + pf(r) + '(' + J1 + ') + ' + k * area + ' = ' + val.toTex() + '$.'],
        hint: 'Split the integral term by term; a constant integrates to constant times area.', chk: { k: 'lin', p: p, r: r, k2: k, I: I1, J: J1, area: area } };
    }
    var f2 = polyXY(R, 2, 2).add(R.int(0, 5)), I = I2(f2, c, d, a, b), avg = I.div(w * h);
    return { q: 'Find the average value of $f(x, y) = ' + f2.toTex() + '$ over $' + rect + '$.', a: { t: 'num', v: avg.toPlain() },
      steps: ['Average value $= \\dfrac{1}{\\text{area}}\\iint_R f\\,dA$: the height of the flat box with the same volume.', 'Iterate: $\\int_{' + a + '}^{' + b + '}\\int_{' + c + '}^{' + d + '} f\\,dy\\,dx = ' + I.toTex() + '$.', 'Area $= ' + w * h + '$, so the average is $\\frac{' + I.toTex() + '}{' + w * h + '} = ' + avg.toTex() + '$.'],
      hint: 'Integrate, then divide by the area of the rectangle.', chk: { k: 'avg', f: f2.toPlain(), lim: [[a, b], [c, d]] } };
  });

  G('calc3.iterated-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['full', 'inner', 'full'], ['full', 'inner', 'exp'], ['exp', 'full', 'exp']));
    var a = R.int(0, 1), b = a + R.int(1, 3), c = R.int(-1, 1), d = c + R.int(1, 3), f = polyXY(R, L === 1 ? 1 : 2, L === 1 ? 2 : 3), inX = R.coin();
    if (kind === 'inner') {
      var innerV = inX ? 'y' : 'x', lo = inX ? c : a, hi = inX ? d : b, res = f.defint(innerV, lo, hi);
      return { q: 'Evaluate the inner integral $\\displaystyle\\int_{' + lo + '}^{' + hi + '} \\left(' + f.toTex() + '\\right) d' + innerV + '$ (the answer is a function of $' + (inX ? 'x' : 'y') + '$).', a: { t: 'expr', v: res.toPlain(), vars: XY },
        steps: ['Integrate with respect to $' + innerV + '$, treating $' + (inX ? 'x' : 'y') + '$ as a constant.', 'Antiderivative: $' + f.integ(innerV).toTex() + '$.', 'Evaluate from $' + innerV + ' = ' + lo + '$ to $' + innerV + ' = ' + hi + '$: $' + res.toTex() + '$.'],
        hint: 'Exactly like a partial derivative in reverse: the other variable is a constant.', chk: { k: 'inner', f: f.toPlain(), v: innerV, lo: lo, hi: hi } };
    }
    if (kind === 'full') {
      var I = I2(f, c, d, a, b), first = inX ? 'dy\\,dx' : 'dx\\,dy', inner = inX ? f.defint('y', c, d) : f.defint('x', a, b);
      var lims = inX ? [[a, b], [c, d]] : [[c, d], [a, b]];
      return { q: 'Evaluate $\\displaystyle' + intTex(f.toTex(), lims, inX ? ['dy', 'dx'] : ['dx', 'dy']) + '$.', a: { t: 'num', v: I.toPlain() },
        steps: ['Work from the inside out. Inner integral (in $' + (inX ? 'y' : 'x') + '$): $' + inner.toTex() + '$.', 'Outer integral of that from $' + lims[0][0] + '$ to $' + lims[0][1] + '$: $' + I.toTex() + '$.', 'By Fubini\'s theorem the other order gives the same number.'],
        hint: 'Do the inner integral first, holding the outer variable constant.', chk: { k: 'int', f: f.toPlain(), lim: [[a, b], [c, d]] } };
    }
    var A = R.int(1, 2), B = R.pick([1, 2, 3]);
    var ans = '(e^' + A * B + ' - 1)/' + B + ' - ' + A, ansT = '\\frac{e^{' + A * B + '} - 1}{' + B + '} - ' + A;
    return { q: 'Evaluate $\\displaystyle\\int_0^{' + A + '}\\int_0^{' + B + '} x\\,e^{xy}\\,dy\\,dx$.', a: { t: 'num', v: ans },
      steps: ['Inner integral in $y$ ($x$ is a constant): $\\int_0^{' + B + '} x\\,e^{xy}\\,dy = \\left[e^{xy}\\right]_{y=0}^{y=' + B + '} = e^{' + (B === 1 ? '' : B) + 'x} - 1$.', 'Outer: $\\int_0^{' + A + '} \\left(e^{' + (B === 1 ? '' : B) + 'x} - 1\\right) dx = \\left[\\frac{e^{' + (B === 1 ? '' : B) + 'x}}{' + B + '} - x\\right]_0^{' + A + '}$.', '$= ' + ansT + '$.', 'Doing $x$ first would need integration by parts: choosing the easy order is part of the skill.'],
      hint: 'With $y$ inside, the factor $x$ is exactly the derivative of $xy$ with respect to $y$.', chk: { k: 'int', f: 'x*e^(x*y)', lim: [[0, A], [0, B]] } };
  });

  // type I regions: y from lo(x) to hi(x), x from xa to xb; with the reversed description when simple
  function regionI(R, L) {
    var m = R.pick([1, 2]), a = R.pick([1, 2, 3]), x = Poly.v(XY, 'x'), one = Poly.c(XY, 1);
    var list = [
      { lo: x.pow(2).scale(Q(1, m)), hi: x, xa: 0, xb: m, d: 'the region between $y = ' + T.coef(Q(1, m), 'x^{2}') + '$ and $y = x$', rev: { lo: 'y', hi: m === 1 ? '\\sqrt{y}' : '\\sqrt{' + m + 'y}', loP: 'y', hiP: 'sqrt(' + m + '*y)', c: 0, d: m } },
      { lo: Poly.c(XY, 0), hi: x.scale(m), xa: 0, xb: a, d: 'the triangle bounded by $y = 0$, $x = ' + a + '$ and $y = ' + T.mono(m, 'x') + '$', rev: { lo: m === 1 ? 'y' : '\\frac{y}{' + m + '}', hi: String(a), loP: 'y/' + m, hiP: String(a), c: 0, d: m * a } },
      { lo: Poly.c(XY, 0), hi: one.scale(a).sub(x), xa: 0, xb: a, d: 'the triangle with vertices $(0, 0)$, $(' + a + ', 0)$ and $(0, ' + a + ')$', rev: { lo: '0', hi: a + ' - y', loP: '0', hiP: a + ' - y', c: 0, d: a } },
      { lo: x.pow(2), hi: Poly.c(XY, m * m), xa: -m, xb: m, d: 'the region between the parabola $y = x^{2}$ and the line $y = ' + m * m + '$', rev: { lo: '-\\sqrt{y}', hi: '\\sqrt{y}', loP: '-sqrt(y)', hiP: 'sqrt(y)', c: 0, d: m * m } },
      { lo: x.pow(3), hi: x, xa: 0, xb: 1, d: 'the region between $y = x^{3}$ and $y = x$ for $0 \\le x \\le 1$', rev: { lo: 'y', hi: '\\sqrt[3]{y}', loP: 'y', hiP: 'y^(1/3)', c: 0, d: 1 } }];
    return R.pick(list);
  }
  G('calc3.general-regions', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['eval', 'area', 'setup'], ['eval', 'setup', 'area'], ['eval', 'setup', 'eval']));
    var rg = regionI(R, L);
    if (kind === 'setup') {
      var lo = rg.lo.toTex(), hi = rg.hi.toTex(), right = '$\\displaystyle\\int_{' + rg.xa + '}^{' + rg.xb + '}\\int_{' + lo + '}^{' + hi + '} f\\,dy\\,dx$';
      var w1 = '$\\displaystyle\\int_{' + lo + '}^{' + hi + '}\\int_{' + rg.xa + '}^{' + rg.xb + '} f\\,dy\\,dx$', w2 = '$\\displaystyle\\int_{' + rg.xa + '}^{' + rg.xb + '}\\int_{' + hi + '}^{' + lo + '} f\\,dy\\,dx$', w3 = '$\\displaystyle\\int_{' + rg.xa + '}^{' + rg.xb + '}\\int_{' + lo + '}^{' + hi + '} f\\,dx\\,dy$';
      return { q: 'Which iterated integral gives $\\iint_D f\\,dA$ over ' + rg.d + '?', a: mc(R, right, [w1, w2, w3]),
        steps: ['Sketch the region and slice it vertically: for each $x$ from $' + rg.xa + '$ to $' + rg.xb + '$, $y$ runs from the lower curve $y = ' + lo + '$ up to the upper curve $y = ' + hi + '$.', 'The variable limits belong to the inner integral; the outer limits must be numbers.', 'The inner differential matches the inner limits: $dy$ inside, $dx$ outside.'],
        hint: 'The outer limits must be constants. The inner limits are the bottom and top curves of a vertical slice.', chk: { k: 'setup', ans: right } };
    }
    var f = kind === 'area' ? Poly.c(XY, 1) : polyXY(R, 1, 2), I = I2(f, rg.lo, rg.hi, rg.xa, rg.xb), inner = f.defint('y', rg.lo, rg.hi);
    return { q: (kind === 'area' ? 'Use a double integral to find the area of ' + rg.d + '.' : 'Evaluate $\\displaystyle\\iint_D \\left(' + f.toTex() + '\\right) dA$ where $D$ is ' + rg.d + '.'), a: { t: 'num', v: I.toPlain() },
      steps: ['Slice vertically: $' + rg.xa + ' \\le x \\le ' + rg.xb + '$ and $' + rg.lo.toTex() + ' \\le y \\le ' + rg.hi.toTex() + '$.', 'So the integral is $\\displaystyle' + intTex(f.toTex(), [[rg.xa, rg.xb], [rg.lo.toTex(), rg.hi.toTex()]], ['dy', 'dx']) + '$.', 'Inner integral (substitute the curves for $y$): $' + inner.toTex() + '$.', 'Outer integral: $\\int_{' + rg.xa + '}^{' + rg.xb + '} \\left(' + inner.toTex() + '\\right) dx = ' + I.toTex() + '$.'],
      hint: 'Inner limits: the lower and upper curves (functions of $x$). Outer limits: numbers.', chk: { k: 'region', f: f.toPlain(), lo: rg.lo.toPlain(), hi: rg.hi.toPlain(), xa: rg.xa, xb: rg.xb } };
  });

  G('calc3.reverse-order', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['limits', 'evalexp', 'limits'], ['limits', 'evalexp', 'evaltrig'], ['evalexp', 'evaltrig', 'evalroot', 'limits']));
    if (kind === 'limits') {
      var rg = regionI(R, L), r = rg.rev, lo = rg.lo.toTex(), hi = rg.hi.toTex();
      var right = '$\\displaystyle\\int_{' + r.c + '}^{' + r.d + '}\\int_{' + r.lo + '}^{' + r.hi + '} f\\,dx\\,dy$';
      var wrongs = ['$\\displaystyle\\int_{' + rg.xa + '}^{' + rg.xb + '}\\int_{' + r.lo + '}^{' + r.hi + '} f\\,dx\\,dy$', '$\\displaystyle\\int_{' + r.c + '}^{' + r.d + '}\\int_{' + r.hi + '}^{' + r.lo + '} f\\,dx\\,dy$', '$\\displaystyle\\int_{' + lo + '}^{' + hi + '}\\int_{' + rg.xa + '}^{' + rg.xb + '} f\\,dx\\,dy$'];
      return { q: 'Reverse the order of integration: $\\displaystyle\\int_{' + rg.xa + '}^{' + rg.xb + '}\\int_{' + lo + '}^{' + hi + '} f(x, y)\\,dy\\,dx$.', a: mc(R, right, wrongs),
        steps: ['Draw the region: ' + rg.d + '.', 'Now slice horizontally. The lowest and highest $y$ in the region are $' + r.c + '$ and $' + r.d + '$: those are the new outer limits.', 'For a fixed $y$, $x$ runs from the left boundary $x = ' + r.lo + '$ to the right boundary $x = ' + r.hi + '$ (solve each curve for $x$).', 'Result: ' + right + '.'],
        hint: 'Sketch the region first. New outer limits: the full range of $y$. New inner limits: left and right curves, solved for $x$.', chk: { k: 'limits', ans: right } };
    }
    if (kind === 'evalexp' && R.coin()) {
      var a1 = R.pick([1, 2]), c1 = R.pick([1, 2, 4]), ans1 = c1 === 1 ? '(e^' + a1 * a1 + ' - 1)/2' : c1 + '*(e^' + a1 * a1 + ' - 1)/2';
      return { q: 'Evaluate $\\displaystyle\\int_0^{' + a1 + '}\\int_{x}^{' + a1 + '} ' + T.coef(c1, 'e^{y^{2}}') + '\\,dy\\,dx$ by reversing the order of integration.', a: { t: 'num', v: ans1 },
        steps: ['$e^{y^2}$ has no elementary antiderivative in $y$.', 'Region: $0 \\le x \\le y \\le ' + a1 + '$, a triangle. Slicing horizontally: $0 \\le y \\le ' + a1 + '$ and $0 \\le x \\le y$.', '$\\displaystyle\\int_0^{' + a1 + '}\\int_0^{y} ' + T.coef(c1, 'e^{y^{2}}') + '\\,dx\\,dy = \\int_0^{' + a1 + '} ' + T.coef(c1, 'y e^{y^{2}}') + '\\,dy$.', 'With $u = y^2$: $\\frac{' + c1 + '}{2}\\left(e^{' + a1 * a1 + '} - 1\\right)$.'],
        hint: 'Integrate in $x$ first; it produces the factor $y$ that $e^{y^2}$ needs.', chk: { k: 'num2', f: c1 + '*e^(x^2)', inner: 'x', lo: 'y', hi: String(a1), outer: [0, a1] } };
    }
    if (kind === 'evalexp') {
      var a = R.pick([1, 2]), k = R.pick([1, 2, 3]), ans = k === 1 ? '(e^' + a * a + ' - 1)/2' : k + '*(e^' + a * a + ' - 1)/2';
      var top = k * a, inLo = k === 1 ? 'y' : '\\frac{y}{' + k + '}';
      return { q: 'Evaluate $\\displaystyle\\int_0^{' + top + '}\\int_{' + inLo + '}^{' + a + '} e^{x^{2}}\\,dx\\,dy$ by reversing the order of integration.', a: { t: 'num', v: ans },
        steps: ['$e^{x^2}$ has no elementary antiderivative, so the inner integral cannot be done as written.', 'Region: $0 \\le y \\le ' + top + '$ and $' + inLo + ' \\le x \\le ' + a + '$, a triangle with vertices $(0, 0)$, $(' + a + ', 0)$, $(' + a + ', ' + top + ')$. Slicing vertically: $0 \\le x \\le ' + a + '$ and $0 \\le y \\le ' + T.mono(k, 'x') + '$.', '$\\displaystyle\\int_0^{' + a + '}\\int_0^{' + T.mono(k, 'x') + '} e^{x^{2}}\\,dy\\,dx = \\int_0^{' + a + '} ' + T.mono(k, 'x') + 'e^{x^{2}}\\,dx$.', 'Substitute $u = x^2$: $= \\frac{' + k + '}{2}\\left[e^{x^{2}}\\right]_0^{' + a + '} = \\frac{' + k + '}{2}\\left(e^{' + a * a + '} - 1\\right)$.'],
        hint: 'Integrate in $y$ first instead; the new inner integral produces exactly the factor $x$ that makes $e^{x^2}$ integrable.', chk: { k: 'num2', f: 'e^(x^2)', inner: 'x', lo: 'y/' + k, hi: String(a), outer: [0, top] } };
    }
    if (kind === 'evaltrig') {
      var cosV = R.coin(), choice = cosV ? R.pick([['pi/2', 1, '\\frac{\\pi}{2}'], ['pi/6', Q(1, 2), '\\frac{\\pi}{6}']]) : R.pick([['pi', 2, '\\pi'], ['pi/2', 1, '\\frac{\\pi}{2}']]), k = R.pick([1, 2, 3]);
      var ub = '\\sqrt{' + choice[2] + '}', val = Q(k, 2).mul(choice[1]), fn = cosV ? '\\cos' : '\\sin', inLo = k === 1 ? 'y' : '\\frac{y}{' + k + '}', top = k === 1 ? ub : k + ub;
      return { q: 'Evaluate $\\displaystyle\\int_0^{' + top + '}\\int_{' + inLo + '}^{' + ub + '} ' + fn + '(x^{2})\\,dx\\,dy$ by reversing the order of integration.', a: { t: 'num', v: val.toPlain() },
        steps: ['$' + fn + '(x^2)$ has no elementary antiderivative in $x$, so reverse the order.', 'Region: $0 \\le y \\le ' + top + '$, $' + inLo + ' \\le x \\le ' + ub + '$, a triangle. Slicing vertically: $0 \\le x \\le ' + ub + '$ and $0 \\le y \\le ' + T.mono(k, 'x') + '$.', '$\\displaystyle\\int_0^{' + ub + '}\\int_0^{' + T.mono(k, 'x') + '} ' + fn + '(x^{2})\\,dy\\,dx = \\int_0^{' + ub + '} ' + T.mono(k, 'x') + fn + '(x^{2})\\,dx$.', 'With $u = x^2$: $\\frac{' + k + '}{2}\\left[' + (cosV ? '\\sin u' : '-\\cos u') + '\\right]_0^{' + choice[2] + '} = ' + val.toTex() + '$.'],
        hint: 'Integrating $y$ first leaves a factor $x$, the derivative of $x^2$ up to a constant.', chk: { k: 'num2', f: (cosV ? 'cos' : 'sin') + '(x^2)', inner: 'x', lo: 'y/' + k, hi: 'sqrt(' + choice[0] + ')', outer: [0, k + '*sqrt(' + choice[0] + ')'] } };
    }
    var bb = R.pick([1, 2]), rv = bb === 2 ? '52/9' : '2*(2*sqrt(2) - 1)/9', rT = bb === 2 ? '\\frac{2}{9}(27 - 1) = \\frac{52}{9}' : '\\frac{2}{9}\\left(2\\sqrt{2} - 1\\right)';
    return { q: 'Evaluate $\\displaystyle\\int_0^{' + bb * bb + '}\\int_{\\sqrt{y}}^{' + bb + '} \\sqrt{x^{3} + 1}\\,dx\\,dy$ by reversing the order of integration.', a: { t: 'num', v: rv },
      steps: ['Region: $0 \\le y \\le ' + bb * bb + '$, $\\sqrt{y} \\le x \\le ' + bb + '$, which is $0 \\le x \\le ' + bb + '$, $0 \\le y \\le x^2$ (under the parabola).', '$\\displaystyle\\int_0^{' + bb + '}\\int_0^{x^2} \\sqrt{x^3 + 1}\\,dy\\,dx = \\int_0^{' + bb + '} x^2\\sqrt{x^3 + 1}\\,dx$.', 'With $u = x^3 + 1$: $\\frac{1}{3}\\int_1^{' + (bb * bb * bb + 1) + '} \\sqrt{u}\\,du = \\frac{2}{9}\\left(' + (bb * bb * bb + 1) + '^{3/2} - 1\\right) = ' + rT + '$.'],
      hint: 'The region lies under $y = x^2$. Integrate in $y$ first to get a factor $x^2$.', chk: { k: 'num2', f: 'sqrt(x^3+1)', inner: 'x', lo: 'sqrt(y)', hi: String(bb), outer: [0, bb * bb] } };
  });

  // polar: integrand polynomial in x, y converted to r, cth, sth
  G('calc3.polar-double-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['disk', 'area', 'convert'], ['disk', 'gauss', 'sector', 'convert'], ['sector', 'gauss', 'annulus', 'sector']));
    if (kind === 'convert') {
      var Rr = R.int(1, 4), right = '$\\displaystyle\\int_0^{2\\pi}\\int_0^{' + Rr + '} r^{2}\\cdot r\\,dr\\,d\\theta$';
      return { q: 'Which polar integral equals $\\displaystyle\\iint_D (x^{2} + y^{2})\\,dA$, where $D$ is the disk $x^{2} + y^{2} \\le ' + Rr * Rr + '$?', a: mc(R, right, ['$\\displaystyle\\int_0^{2\\pi}\\int_0^{' + Rr + '} r^{2}\\,dr\\,d\\theta$', '$\\displaystyle\\int_0^{2\\pi}\\int_0^{' + Rr * Rr + '} r^{2}\\cdot r\\,dr\\,d\\theta$', '$\\displaystyle\\int_0^{\\pi}\\int_0^{' + Rr + '} r^{2}\\cdot r\\,dr\\,d\\theta$']),
        steps: ['$x^2 + y^2 = r^2$, and the disk is $0 \\le r \\le ' + Rr + '$ (the radius, not $' + Rr * Rr + '$), $0 \\le \\theta \\le 2\\pi$.', 'The area element is $dA = r\\,dr\\,d\\theta$: a small polar box is about $\\Delta r$ by $r\\,\\Delta\\theta$.', 'So the integrand becomes $r^2 \\cdot r$.'],
        hint: 'Do not forget the extra factor $r$ in $dA$, and use the radius as the upper limit for $r$.', chk: { k: 'convert', R: Rr, ans: right } };
    }
    if (kind === 'gauss') {
      var R2 = R.pick([1, 2, 3]), k = R.pick([1, 2]), ans = k === 1 ? 'pi*(1 - e^(-' + R2 * R2 + '))' : 'pi*(1 - e^(-' + 2 * R2 * R2 + '))/2';
      return { q: 'Evaluate $\\displaystyle\\iint_D e^{-' + (k === 1 ? '' : k) + '(x^{2} + y^{2})}\\,dA$ over the disk $x^{2} + y^{2} \\le ' + R2 * R2 + '$.', a: { t: 'num', v: ans },
        steps: ['In polar coordinates: $\\displaystyle\\int_0^{2\\pi}\\int_0^{' + R2 + '} e^{-' + (k === 1 ? '' : k) + 'r^2}\\, r\\,dr\\,d\\theta$.', 'The factor $r$ from $dA$ makes the inner integral easy: with $u = ' + (k === 1 ? '' : k) + 'r^2$, $\\int_0^{' + R2 + '} e^{-' + (k === 1 ? '' : k) + 'r^2} r\\,dr = \\frac{1}{' + 2 * k + '}\\left(1 - e^{-' + k * R2 * R2 + '}\\right)$.', 'Multiply by $2\\pi$: $' + (k === 1 ? '\\pi\\left(1 - e^{-' + R2 * R2 + '}\\right)' : '\\frac{\\pi}{2}\\left(1 - e^{-' + 2 * R2 * R2 + '}\\right)') + '$.'],
        hint: 'Switch to polar; the extra $r$ is exactly what a substitution needs.', chk: { k: 'polar', f: 'e^(-' + k + '*(x^2+y^2))', r: [0, R2], th: [0, 4] } };
    }
    var Rr2 = R.int(1, 3), j1 = 4, j0 = 0, r0 = 0, f, desc;
    if (kind === 'area') { f = Poly.c(XY, 1); var th = R.pick([[0, 1, 'the quarter disk in the first quadrant'], [0, 2, 'the upper half of the disk'], [1, 2, 'the quarter disk in the second quadrant']]); j0 = th[0]; j1 = th[1]; r0 = R.coin() ? 0 : 1; Rr2 = r0 + R.int(1, 3); desc = r0 ? 'the part of the ring $' + r0 + ' \\le x^2 + y^2 \\le ' + Rr2 * Rr2 + '$ in ' + (j0 === 0 && j1 === 1 ? 'the first quadrant' : j1 === 2 && j0 === 0 ? 'the upper half-plane' : 'the second quadrant') : th[2] + ' of radius ' + Rr2; }
    else if (kind === 'disk') { var pw = R.int(1, 2); f = Poly.of(XY, [[1, { x: 2 }], [1, { y: 2 }]]).pow(pw); desc = 'the disk $x^2 + y^2 \\le ' + Rr2 * Rr2 + '$'; }
    else if (kind === 'sector') { var th2 = R.pick([[0, 1, 'first quadrant'], [0, 2, 'upper half'], [1, 2, 'second quadrant'], [3, 4, 'fourth quadrant']]); j0 = th2[0]; j1 = th2[1]; f = Poly.of(XY, R.pick([[[1, { x: 1 }]], [[1, { y: 1 }]], [[1, { x: 1, y: 1 }]], [[1, { x: 2 }]], [[2, { x: 1 }], [1, { y: 1 }]]])); desc = 'the ' + th2[2] + ' part of the disk $x^2 + y^2 \\le ' + Rr2 * Rr2 + '$'; }
    else { r0 = R.int(1, 2); Rr2 = r0 + R.int(1, 2); f = Poly.of(XY, R.pick([[[1, { x: 2 }], [1, { y: 2 }]], [[1, { y: 2 }]], [[1, {}]]])); desc = 'the ring $' + r0 * r0 + ' \\le x^2 + y^2 \\le ' + Rr2 * Rr2 + '$'; }
    var fp = toPolar(f), val = polarInt(fp, r0, Rr2, j0, j1), thT = [piTex(Q(j0, 2)), piTex(Q(j1, 2))];
    var integrandR = fp.mul(Poly.v(RCS, 'r'));
    return { q: (kind === 'area' ? 'Use a polar double integral to find the area of ' + desc + '.' : 'Evaluate $\\displaystyle\\iint_D ' + (f.isConst() ? 'dA' : '\\left(' + f.toTex() + '\\right) dA') + '$ where $D$ is ' + desc + '.'), a: { t: 'num', v: rpPlain(val) },
      steps: ['Describe $D$ in polar coordinates: $' + r0 + ' \\le r \\le ' + Rr2 + '$ and $' + thT[0] + ' \\le \\theta \\le ' + thT[1] + '$.', 'Substitute $x = r\\cos\\theta$, $y = r\\sin\\theta$ and $dA = r\\,dr\\,d\\theta$: the integrand becomes $' + integrandR.toTex() + '$.', 'Inner integral in $r$: $' + integrandR.defint('r', r0, Rr2).toTex() + '$.', 'Outer integral in $\\theta$ from $' + thT[0] + '$ to $' + thT[1] + '$: $' + rpTex(val) + '$.'],
      hint: 'Write the region with $r$ and $\\theta$, replace $dA$ by $r\\,dr\\,d\\theta$, and integrate $r$ first.', chk: { k: 'polar', f: f.toPlain(), r: [r0, Rr2], th: [j0, j1] } };
  });

  G('calc3.double-integral-applications', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['mass', 'mass', 'prob'], ['com', 'mass', 'prob', 'kconst'], ['com', 'inertia', 'prob', 'com']));
    if (kind === 'prob' || kind === 'kconst') {
      if (kind === 'kconst') { var f0 = Poly.of(XY, R.pick([[[1, { x: 1, y: 1 }]], [[1, { x: 1 }], [1, { y: 1 }]], [[1, { x: 2 }], [1, { y: 1 }]], [[1, { x: 1, y: 2 }]]])), tot = I2(f0, 0, 1, 0, 1), k = tot.inv();
        return { q: 'For which constant $k$ is $f(x, y) = k\\left(' + f0.toTex() + '\\right)$ a joint probability density on the unit square $0 \\le x \\le 1$, $0 \\le y \\le 1$ (and $0$ elsewhere)?', a: { t: 'num', v: k.toPlain() },
          steps: ['A density must have total probability $1$: $\\iint f\\,dA = 1$.', '$\\int_0^1\\int_0^1 \\left(' + f0.toTex() + '\\right) dy\\,dx = ' + tot.toTex() + '$.', 'So $k \\cdot ' + tot.toTex() + ' = 1$ and $k = ' + k.toTex() + '$.'], hint: 'Set the total integral equal to $1$.', chk: { k: 'kconst', f: f0.toPlain() } }; }
      var lam = R.pick([1, 2, 3]), mu = R.pick([1, 2]), a = R.pick([1, 2]), b = R.pick([1, 2]);
      return { q: 'The waiting times $X$ and $Y$ (minutes) at two counters have joint density $f(x, y) = ' + T.coef(lam * mu, 'e^{-' + T.lin(lam, 'x', 0) + ' - ' + T.mono(mu, 'y') + '}') + '$ for $x, y \\ge 0$. Find $P(X \\le ' + a + ',\\ Y \\le ' + b + ')$.', a: { t: 'num', v: '(1 - e^(-' + lam * a + '))*(1 - e^(-' + mu * b + '))' },
        steps: ['$P = \\displaystyle\\int_0^{' + a + '}\\int_0^{' + b + '} ' + T.coef(lam * mu, 'e^{-' + T.lin(lam, 'x', 0) + '}e^{-' + T.mono(mu, 'y') + '}') + '\\,dy\\,dx$: integrate the density over the event.', 'It splits: $\\left(\\int_0^{' + a + '} ' + T.coef(lam, 'e^{-' + T.mono(lam, 'x') + '}') + '\\,dx\\right)\\left(\\int_0^{' + b + '} ' + T.coef(mu, 'e^{-' + T.mono(mu, 'y') + '}') + '\\,dy\\right)$.', '$= \\left(1 - e^{-' + lam * a + '}\\right)\\left(1 - e^{-' + mu * b + '}\\right) \\approx ' + ((1 - Math.exp(-lam * a)) * (1 - Math.exp(-mu * b))).toFixed(4) + '$.'],
        hint: 'A probability is the double integral of the density over the region the event describes.', chk: { k: 'prob', lam: lam, mu: mu, a: a, b: b } };
    }
    var rg = regionI(R, 2), rho = Poly.of(XY, R.pick([[[1, { x: 1 }]], [[1, { y: 1 }]], [[1, { x: 1 }], [1, { y: 1 }]], [[1, {}], [1, { x: 1 }]], [[2, {}]]])), M = I2(rho, rg.lo, rg.hi, rg.xa, rg.xb);
    if (M.isZero() || M.sign() < 0) { rho = Poly.of(XY, [[1, {}], [1, { y: 2 }]]); M = I2(rho, rg.lo, rg.hi, rg.xa, rg.xb); }
    var dens = 'density $\\rho(x, y) = ' + rho.toTex() + '$', reg = rg.d;
    if (kind === 'mass') return { q: 'A thin plate covers ' + reg + ' and has ' + dens + '. Find its mass.', a: { t: 'num', v: M.toPlain() },
      steps: ['Mass is density added up over the plate: $m = \\iint_D \\rho\\,dA$.', 'Slice vertically: $' + rg.xa + ' \\le x \\le ' + rg.xb + '$, $' + rg.lo.toTex() + ' \\le y \\le ' + rg.hi.toTex() + '$.', '$m = \\displaystyle' + intTex(rho.toTex(), [[rg.xa, rg.xb], [rg.lo.toTex(), rg.hi.toTex()]], ['dy', 'dx']) + ' = ' + M.toTex() + '$.'],
      hint: 'Integrate the density over the region.', chk: { k: 'mom', rho: rho.toPlain(), w: '1', lo: rg.lo.toPlain(), hi: rg.hi.toPlain(), xa: rg.xa, xb: rg.xb } };
    if (kind === 'inertia') { var Ix = I2(rho.mul(Poly.v(XY, 'y').pow(2)), rg.lo, rg.hi, rg.xa, rg.xb);
      return { q: 'A thin plate covers ' + reg + ' and has ' + dens + '. Find its moment of inertia about the $x$-axis, $I_x = \\iint_D y^2\\rho\\,dA$.', a: { t: 'num', v: Ix.toPlain() },
        steps: ['$I_x$ weights each bit of mass by the square of its distance from the $x$-axis, $y^2$.', '$I_x = \\displaystyle' + intTex(rho.mul(Poly.v(XY, 'y').pow(2)).toTex(), [[rg.xa, rg.xb], [rg.lo.toTex(), rg.hi.toTex()]], ['dy', 'dx']) + ' = ' + Ix.toTex() + '$.'],
        hint: 'Multiply the density by $y^2$ and integrate over the plate.', chk: { k: 'mom', rho: rho.toPlain(), w: 'y^2', lo: rg.lo.toPlain(), hi: rg.hi.toPlain(), xa: rg.xa, xb: rg.xb } }; }
    var which = R.pick(['x', 'y']), Mom = I2(rho.mul(Poly.v(XY, which === 'x' ? 'x' : 'y')), rg.lo, rg.hi, rg.xa, rg.xb), bar = Mom.div(M);
    return { q: 'A thin plate covers ' + reg + ' and has ' + dens + '. Find $\\bar{' + which + '}$, the ' + which + '-coordinate of its center of mass.', a: { t: 'num', v: bar.toPlain() },
      steps: ['$\\bar{' + which + '} = \\dfrac{\\iint_D ' + which + '\\rho\\,dA}{\\iint_D \\rho\\,dA}$: the average of $' + which + '$, weighted by mass.', 'Mass: $m = ' + M.toTex() + '$.', 'Moment: $\\iint_D ' + which + '\\rho\\,dA = ' + Mom.toTex() + '$.', '$\\bar{' + which + '} = \\frac{' + Mom.toTex() + '}{' + M.toTex() + '} = ' + bar.toTex() + '$.'],
      hint: 'Center of mass = moment divided by mass.', chk: { k: 'bar', rho: rho.toPlain(), w: which, lo: rg.lo.toPlain(), hi: rg.hi.toPlain(), xa: rg.xa, xb: rg.xb } };
  });

  var SA_PL = [[2, 2, 3], [4, 8, 9], [8, 4, 9], [12, 12, 17], [6, 18, 19], [18, 6, 19], [1, 2, 0], [2, 1, 0], [1, 1, 0]];
  G('calc3.surface-area-double', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['plane', 'plane', 'cone'], ['plane', 'parab', 'cone'], ['parab', 'cap', 'plane']));
    if (kind === 'plane') {
      var pl = R.pick(SA_PL.filter(function (t) { return L > 1 || t[2]; })), a = pl[0] * R.sign(), b = pl[1] * R.sign(), c0 = R.int(0, 9), s = 1 + a * a + b * b;
      var reg = R.pick([['the rectangle $0 \\le x \\le 2$, $0 \\le y \\le 3$', Q(6), 'Area of the rectangle: $6$.'], ['the triangle with vertices $(0, 0)$, $(4, 0)$, $(0, 2)$', Q(4), 'Area of the triangle: $\\frac{1}{2}(4)(2) = 4$.'], ['the disk $x^2 + y^2 \\le 4$', null, 'Area of the disk: $4\\pi$.']]);
      var areaD = reg[1], ansP = areaD ? radPlain(areaD, s) : radPlain(4, s).replace(/^/, '') + '*pi', ansT = areaD ? radTex(areaD, s) : radTex(4, s) + '\\pi';
      if (!areaD) ansP = '(' + radPlain(4, s) + ')*pi';
      return { q: 'Find the area of the part of the plane $z = ' + T.terms([[c0, ''], [a, 'x'], [b, 'y']]) + '$ that lies above ' + reg[0] + '.', a: { t: 'num', v: ansP },
        steps: ['$A = \\iint_D \\sqrt{1 + f_x^2 + f_y^2}\\,dA$: each patch of the shadow is stretched by that factor.', '$f_x = ' + a + '$ and $f_y = ' + b + '$, so the factor is $\\sqrt{1 + ' + a * a + ' + ' + b * b + '} = ' + sqrtTex(s) + '$, a constant.', reg[2], 'Surface area $= ' + sqrtTex(s) + ' \\times ' + (areaD ? areaD.toTex() : '4\\pi') + ' = ' + ansT + '$.'],
        hint: 'For a plane the stretching factor $\\sqrt{1 + f_x^2 + f_y^2}$ is constant: multiply it by the area of the region below.', chk: { k: 'graph', f: c0 + ' + (' + a + ')*x + (' + b + ')*y', reg: areaD ? (reg[1].eq(6) ? 'rect' : 'tri') : 'disk' } };
    }
    if (kind === 'cone') {
      var Rr = R.int(1, 4), h0 = R.coin();
      return { q: 'Find the area of the part of the cone $z = \\sqrt{x^{2} + y^{2}}$ that lies ' + (h0 ? 'below the plane $z = ' + Rr + '$' : 'above the disk $x^2 + y^2 \\le ' + Rr * Rr + '$') + '.', a: { t: 'num', v: radPlain(Rr * Rr, 2) + '*pi' },
        steps: ['$f_x = \\frac{x}{\\sqrt{x^2 + y^2}}$, $f_y = \\frac{y}{\\sqrt{x^2 + y^2}}$, so $1 + f_x^2 + f_y^2 = 1 + \\frac{x^2 + y^2}{x^2 + y^2} = 2$.', 'The stretching factor is $\\sqrt{2}$ everywhere.', 'The shadow is the disk of radius $' + Rr + '$, area $' + piTex(Rr * Rr) + '$.', 'Area $= \\sqrt{2} \\cdot ' + piTex(Rr * Rr) + ' = ' + radTex(Rr * Rr, 2) + '\\pi$.'],
        hint: 'Compute $1 + f_x^2 + f_y^2$; it simplifies to a constant.', chk: { k: 'cone', R: Rr } };
    }
    if (kind === 'parab') {
      var hh = R.pick(L > 2 ? [1, 2, 6, 12, 3] : [2, 6, 12]), m = 1 + 4 * hh, ans = U.isSquare(m) ? piPlain(Q(Math.pow(Math.sqrt(m), 3) - 1, 6)) : 'pi*(' + m + '*sqrt(' + m + ') - 1)/6';
      return { q: 'Find the area of the part of the paraboloid $z = x^{2} + y^{2}$ that lies below the plane $z = ' + hh + '$.', a: { t: 'num', v: ans },
        steps: ['The shadow is the disk $x^2 + y^2 \\le ' + hh + '$. The factor is $\\sqrt{1 + 4x^2 + 4y^2} = \\sqrt{1 + 4r^2}$.', 'In polar coordinates: $A = \\displaystyle\\int_0^{2\\pi}\\int_0^{' + sqrtTex(hh) + '} \\sqrt{1 + 4r^2}\\, r\\,dr\\,d\\theta$.', 'With $u = 1 + 4r^2$: $\\int \\sqrt{1 + 4r^2}\\,r\\,dr = \\frac{1}{12}(1 + 4r^2)^{3/2}$.', '$A = 2\\pi \\cdot \\frac{1}{12}\\left(' + m + '^{3/2} - 1\\right) = \\frac{\\pi}{6}\\left(' + m + '^{3/2} - 1\\right)' + (U.isSquare(m) ? ' = ' + piTex(Q(Math.pow(Math.sqrt(m), 3) - 1, 6)) : '') + '$.'],
        hint: 'The shadow is a disk: switch to polar coordinates; the factor $r$ makes a substitution work.', chk: { k: 'parab', h: hh } };
    }
    var Rs = R.int(2, 5), hc = R.int(0, Rs - 1);
    return { q: 'Find the area of the cap of the sphere $x^{2} + y^{2} + z^{2} = ' + Rs * Rs + '$ that lies above the plane $z = ' + hc + '$.', a: { t: 'num', v: piPlain(2 * Rs * (Rs - hc)) },
      steps: ['Top half: $z = \\sqrt{' + Rs * Rs + ' - x^2 - y^2}$, and $1 + z_x^2 + z_y^2 = \\frac{' + Rs * Rs + '}{' + Rs * Rs + ' - r^2}$.', 'The cap lies over the disk $r \\le \\sqrt{' + (Rs * Rs - hc * hc) + '}$ (where $z = ' + hc + '$).', '$A = \\displaystyle\\int_0^{2\\pi}\\int_0^{\\sqrt{' + (Rs * Rs - hc * hc) + '}} \\frac{' + Rs + '}{\\sqrt{' + Rs * Rs + ' - r^2}}\\,r\\,dr\\,d\\theta = 2\\pi \\cdot ' + Rs + '\\left[-\\sqrt{' + Rs * Rs + ' - r^2}\\right]_0^{\\sqrt{' + (Rs * Rs - hc * hc) + '}}$.', '$= 2\\pi \\cdot ' + Rs + '(' + Rs + ' - ' + hc + ') = ' + piTex(2 * Rs * (Rs - hc)) + '$.'],
      hint: 'Use polar coordinates on the shadow; the integrand becomes $\\frac{R\\,r}{\\sqrt{R^2 - r^2}}$.', chk: { k: 'cap', R: Rs, h: hc } };
  });

  // triple integrals over boxes and tetrahedra
  G('calc3.triple-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['box', 'tvol', 'box'], ['tvol', 'tint', 'box', 'setup'], ['tint', 'setup', 'tint', 'tvol']));
    var x = Poly.v(XYZ, 'x'), y = Poly.v(XYZ, 'y');
    if (kind === 'box') {
      var a = R.int(1, 3), b = R.int(1, 3), c = R.int(1, 3), f = Poly.of(XYZ, [[R.nz(1, 3), { x: R.int(0, 1), y: R.int(0, 1), z: R.int(1, 2) }], [R.nz(-3, 3), { x: R.int(0, 2) }]]);
      var v = f.defint('z', 0, c).defint('y', 0, b).defint('x', 0, a).cval();
      return { q: 'Evaluate $\\displaystyle\\iiint_B \\left(' + f.toTex() + '\\right) dV$ where $B = [0, ' + a + '] \\times [0, ' + b + '] \\times [0, ' + c + ']$.', a: { t: 'num', v: v.toPlain() },
        steps: ['On a box every limit is a constant; integrate $z$, then $y$, then $x$ (any order works).', 'After $z$: $' + f.defint('z', 0, c).toTex() + '$.', 'After $y$: $' + f.defint('z', 0, c).defint('y', 0, b).toTex() + '$.', 'After $x$: $' + v.toTex() + '$.'],
        hint: 'Integrate one variable at a time, treating the others as constants.', chk: { k: 'box', f: f.toPlain(), a: a, b: b, c: c } };
    }
    var A = R.pick([1, 2, 3, 6]), B = R.pick([1, 2, 3]), C = R.pick([2, 3, 6]), plane = '\\frac{x}{' + A + '} + \\frac{y}{' + B + '} + \\frac{z}{' + C + '} = 1';
    var nA = 6 / A, nB = 6 / B, nC = 6 / C, pl = T.terms([[Q(6, A), 'x'], [Q(6, B), 'y'], [Q(6, C), 'z']]) + ' = 6';
    var zTop = Poly.c(XYZ, C).sub(x.scale(Q(C, A))).sub(y.scale(Q(C, B))), yTop = Poly.c(XYZ, B).sub(x.scale(Q(B, A)));
    if (kind === 'setup') {
      var right = '$\\displaystyle\\int_0^{' + A + '}\\int_0^{' + yTop.toTex() + '}\\int_0^{' + zTop.toTex() + '} f\\,dz\\,dy\\,dx$';
      return { q: 'The tetrahedron $E$ is bounded by the coordinate planes and the plane $' + pl + '$. Which iterated integral equals $\\iiint_E f\\,dV$?', a: mc(R, right, ['$\\displaystyle\\int_0^{' + A + '}\\int_0^{' + B + '}\\int_0^{' + C + '} f\\,dz\\,dy\\,dx$', '$\\displaystyle\\int_0^{' + A + '}\\int_0^{' + yTop.toTex() + '}\\int_0^{' + C + '} f\\,dz\\,dy\\,dx$', '$\\displaystyle\\int_0^{' + zTop.toTex() + '}\\int_0^{' + yTop.toTex() + '}\\int_0^{' + A + '} f\\,dz\\,dy\\,dx$']),
        steps: ['Solve the plane for $z$: $z = ' + zTop.toTex() + '$. That is the top; the bottom is $z = 0$.', 'The shadow on the $xy$-plane is the triangle under the line where the top meets $z = 0$: $y = ' + yTop.toTex() + '$.', 'So $0 \\le x \\le ' + A + '$, $0 \\le y \\le ' + yTop.toTex() + '$, $0 \\le z \\le ' + zTop.toTex() + '$.'],
        hint: 'Find $z$ on the slanted face first, then the shadow triangle in the $xy$-plane.', chk: { k: 'setup', ans: right } };
    }
    var f2 = kind === 'tvol' ? Poly.c(XYZ, 1) : Poly.of(XYZ, R.pick([[[1, { x: 1 }]], [[1, { y: 1 }]], [[1, { z: 1 }]], [[1, { x: 1 }], [1, { z: 1 }]], [[2, {}], [1, { y: 1 }]]]));
    var val = f2.defint('z', 0, zTop).defint('y', 0, yTop).defint('x', 0, A).cval();
    return { q: (kind === 'tvol' ? 'Use a triple integral to find the volume of the tetrahedron bounded by the coordinate planes and the plane $' + pl + '$.' : 'Evaluate $\\displaystyle\\iiint_E ' + (f2.isConst() ? '' : '\\left(' + f2.toTex() + '\\right)') + ' dV$, where $E$ is the tetrahedron bounded by the coordinate planes and $' + pl + '$.'), a: { t: 'num', v: val.toPlain() },
      steps: ['Top face: $z = ' + zTop.toTex() + '$. Shadow: $0 \\le x \\le ' + A + '$, $0 \\le y \\le ' + yTop.toTex() + '$.', 'Inner ($z$ from $0$ to the top): $' + f2.defint('z', 0, zTop).toTex() + '$.', 'Middle ($y$): $' + f2.defint('z', 0, zTop).defint('y', 0, yTop).toTex() + '$.', 'Outer ($x$ from $0$ to $' + A + '$): $' + val.toTex() + '$.' + (kind === 'tvol' ? ' Check: $\\frac{1}{6}(' + A + ')(' + B + ')(' + C + ') = ' + Q(A * B * C, 6).toTex() + '$, the familiar tetrahedron volume.' : '')],
      hint: 'Limits: $z$ from $0$ up to the slanted plane, $y$ across the shadow triangle, $x$ from $0$ to the intercept.', chk: { k: 'tetra', f: f2.toPlain(), A: A, B: B, C: C } };
  });

  G('calc3.triple-cylindrical', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['parab', 'cyl', 'cyl'], ['parab', 'cone', 'cyl'], ['cone', 'icecream', 'cyl', 'parab']));
    var r = Poly.v(RZ, 'r'), z = Poly.v(RZ, 'z');
    if (kind === 'icecream') {
      var a = R.pick([1, 2]), ans = '4*pi*' + a * a * a + '*(sqrt(2) - 1)/3';
      return { q: 'Find the volume of the solid above the cone $z = \\sqrt{x^{2} + y^{2}}$ and below the sphere $x^{2} + y^{2} + z^{2} = ' + 2 * a * a + '$.', a: { t: 'num', v: ans },
        steps: ['In cylindrical coordinates: $r \\le z \\le \\sqrt{' + 2 * a * a + ' - r^2}$. They meet where $r = \\sqrt{' + 2 * a * a + ' - r^2}$, at $r = ' + a + '$.', '$V = \\displaystyle\\int_0^{2\\pi}\\int_0^{' + a + '}\\int_r^{\\sqrt{' + 2 * a * a + ' - r^2}} r\\,dz\\,dr\\,d\\theta = 2\\pi\\int_0^{' + a + '} \\left(r\\sqrt{' + 2 * a * a + ' - r^2} - r^2\\right) dr$.', '$= 2\\pi\\left[-\\frac{1}{3}(' + 2 * a * a + ' - r^2)^{3/2} - \\frac{r^3}{3}\\right]_0^{' + a + '} = \\frac{4\\pi \\cdot ' + a * a * a + '}{3}\\left(\\sqrt{2} - 1\\right)$.'],
        hint: 'Find where the cone meets the sphere; that radius is the outer limit for $r$. Remember $dV = r\\,dz\\,dr\\,d\\theta$.', chk: { k: 'cylnum', f: '1', zlo: 'r', zhi: 'sqrt(' + 2 * a * a + '-r^2)', r: [0, a], th: [0, 4] } };
    }
    var f, zlo, zhi, r1, j1 = 4, desc;
    if (kind === 'parab' && R.coin()) { var hh = R.int(1, 5), sq = Math.sqrt(hh); f = R.coin() ? Poly.c(XYZ, 1) : Poly.v(XYZ, 'z'); zlo = r.pow(2); zhi = Poly.c(RZ, hh); r1 = null; desc = (f.isConst() ? 'Find the volume of the solid' : 'Evaluate $\\iiint_E z\\,dV$ over the solid $E$') + ' between the paraboloid $z = x^{2} + y^{2}$ and the plane $z = ' + hh + '$.';
      var fcp = toCyl(f).mul(r), inZp = fcp.defint('z', zlo, zhi), rr = Poly.v(RZ, 'r'); // r from 0 to sqrt(h): integrate in u = r^2 exactly: inZp is a polynomial in r^2 times r
      var uV = ['u'], inU = new Poly(uV); for (var key in inZp.m) { var ex = key.split(',').map(Number); inU = inU.add(Poly.mono(uV, inZp.m[key].div(2), [(ex[0] - 1) / 2])); }
      var valP = inU.defint('u', 0, hh).cval().mul(2);
      return { q: desc, a: { t: 'num', v: piPlain(valP) },
        steps: ['Cylindrical coordinates: $r^2 \\le z \\le ' + hh + '$, and the shadow is the disk $r \\le ' + sqrtTex(hh) + '$.', 'With $dV = r\\,dz\\,dr\\,d\\theta$, the inner integral gives $' + inZp.toTex() + '$.', 'Integrate in $r$ from $0$ to $' + sqrtTex(hh) + '$ (the substitution $u = r^2$ helps), then multiply by $2\\pi$: $' + piTex(valP) + '$.'],
        hint: 'The paraboloid is $z = r^2$; it meets the plane where $r^2 = ' + hh + '$.', chk: { k: 'cylnum', f: f.toPlain(), zlo: 'r^2', zhi: String(hh), r: [0, sq], th: [0, 4] } };
    }
    if (kind === 'parab') { var A = R.pick([1, 4, 9, 16]), sA = Math.sqrt(A); f = Poly.c(XYZ, 1); zlo = Poly.c(RZ, 0); zhi = Poly.c(RZ, A).sub(r.pow(2)); r1 = sA; desc = 'Find the volume of the solid under the paraboloid $z = ' + A + ' - x^{2} - y^{2}$ and above the $xy$-plane.'; }
    if (kind === 'cone') { var h = R.int(1, 5); f = R.coin() ? Poly.c(XYZ, 1) : Poly.v(XYZ, 'z'); zlo = r; zhi = Poly.c(RZ, h); r1 = h; desc = (f.isConst() ? 'Find the volume of the solid' : 'Evaluate $\\iiint_E z\\,dV$ over the solid $E$') + ' between the cone $z = \\sqrt{x^{2} + y^{2}}$ and the plane $z = ' + h + '$.'; }
    if (kind === 'cyl') { var Rr = R.int(1, 4), H = R.int(1, 5), half = L > 1 && R.coin(); f = Poly.of(XYZ, half ? R.pick([[[1, { y: 1 }]], [[1, { y: 1, z: 1 }]], [[1, { x: 2 }]]]) : R.pick([[[1, { x: 2 }], [1, { y: 2 }]], [[1, { z: 1 }]], [[1, { x: 2 }], [1, { y: 2 }], [1, { z: 1 }]], [[1, { y: 2 }]]])); zlo = Poly.c(RZ, 0); zhi = Poly.c(RZ, H); r1 = Rr; if (half) j1 = 2; desc = 'Evaluate $\\iiint_E \\left(' + f.toTex() + '\\right) dV$ where $E$ is the solid ' + (half ? 'half-cylinder $x^{2} + y^{2} \\le ' + Rr * Rr + '$, $y \\ge 0$' : 'cylinder $x^{2} + y^{2} \\le ' + Rr * Rr + '$') + ', $0 \\le z \\le ' + H + '$.'; }
    var fc = toCyl(f).mul(r), inZ = fc.defint('z', zlo, zhi), inR = inZ.defint('r', 0, r1), val = intCS(inR, 0, j1, 'cth', 'sth');
    return { q: desc, a: { t: 'num', v: rpPlain(val) },
      steps: ['Cylindrical coordinates: $x = r\\cos\\theta$, $y = r\\sin\\theta$, $z = z$, and $dV = r\\,dz\\,dr\\,d\\theta$.', 'Limits: $' + zlo.toTex() + ' \\le z \\le ' + zhi.toTex() + '$, $0 \\le r \\le ' + r1 + '$, $0 \\le \\theta \\le ' + (j1 === 2 ? '\\pi' : '2\\pi') + '$.', 'Integrand times $r$: $' + fc.toTex() + '$. After $z$: $' + inZ.toTex() + '$.', 'After $r$: $' + inR.toTex() + '$. After $\\theta$: $' + rpTex(val) + '$.'],
      hint: 'Use $dV = r\\,dz\\,dr\\,d\\theta$; describe the top and bottom as functions of $r$.', chk: { k: 'cylnum', f: f.toPlain(), zlo: zlo.toPlain(), zhi: zhi.toPlain(), r: [0, r1], th: [0, j1] } };
  });

  G('calc3.triple-spherical', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['ball', 'cone', 'ball'], ['cone', 'zhemi', 'ball', 'dv'], ['exp', 'zhemi', 'shell', 'dv']));
    var a = R.int(1, 4);
    if (kind === 'dv') {
      var right = '$\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$ with $0 \\le \\varphi \\le \\pi$';
      return { q: 'In spherical coordinates, which is the volume element for a whole ball centered at the origin, with the right range for $\\varphi$?', a: mc(R, right, ['$\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$ with $0 \\le \\varphi \\le 2\\pi$', '$\\rho\\,d\\rho\\,d\\varphi\\,d\\theta$ with $0 \\le \\varphi \\le \\pi$', '$\\rho^2\\cos\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$ with $0 \\le \\varphi \\le \\pi$']),
        steps: ['A small spherical box has sides $d\\rho$, $\\rho\\,d\\varphi$ (along a meridian) and $\\rho\\sin\\varphi\\,d\\theta$ (around a circle of radius $\\rho\\sin\\varphi$).', 'Multiply: $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$.', '$\\varphi$ is measured from the positive $z$-axis, so it only needs to run from $0$ (north pole) to $\\pi$ (south pole); $\\theta$ goes all the way around, $0$ to $2\\pi$.'],
        hint: 'Picture the three edges of a small box; $\\varphi$ only goes from the north pole to the south pole.', chk: { k: 'dv', ans: right } };
    }
    if (kind === 'ball' || kind === 'cone' || kind === 'zhemi') {
      // integrand type: 1, rho^2, z^2 or x^2 + y^2; region: ball, upper half or cone phi <= pi/3; radius a
      var it = R.pick(kind === 'ball' ? [0, 1, 2, 3] : [0, 0, 2, 3]), reg = kind === 'ball' ? 1 : kind === 'zhemi' ? 2 : R.pick([3, 4]), c0 = [null, Q(-1), Q(0), Q(1, 2), Q(-1, 2)][reg];
      var r0 = L > 1 && a > 1 && R.chance(0.4) ? R.int(1, a - 1) : 0, rr = r0 ? r0 * r0 + ' \\le x^{2} + y^{2} + z^{2} \\le ' + a * a : 'x^{2} + y^{2} + z^{2} \\le ' + a * a;
      var phiTop = ['', '\\pi', '\\frac{\\pi}{2}', '\\frac{\\pi}{3}', '\\frac{2\\pi}{3}'][reg], regT = ['', (r0 ? 'the shell $' : 'the ball $') + rr + '$', 'the upper half of ' + (r0 ? 'the shell $' : 'the ball $') + rr + '$', 'the part of ' + (r0 ? 'the shell $' : 'the ball $') + rr + '$ inside the cone $\\varphi \\le \\frac{\\pi}{3}$', 'the part of ' + (r0 ? 'the shell $' : 'the ball $') + rr + '$ where $\\varphi \\le \\frac{2\\pi}{3}$'][reg];
      var fT = ['1', 'x^{2} + y^{2} + z^{2}', 'z^{2}', 'x^{2} + y^{2}'][it], fP = ['1', 'x^2+y^2+z^2', 'z^2', 'x^2+y^2'][it], fS = ['1', '\\rho^2', '\\rho^2\\cos^2\\varphi', '\\rho^2\\sin^2\\varphi'][it];
      var n = it ? 4 : 2, rhoI = Q(Math.pow(a, n + 1) - Math.pow(r0, n + 1), n + 1), one = Q(1), c3 = c0.pow(3), phiI = it === 2 ? one.sub(c3).div(3) : it === 3 ? one.sub(c0).sub(one.sub(c3).div(3)) : one.sub(c0), val = rhoI.mul(phiI).mul(2);
      var phiS = it === 2 ? '\\int_0^{' + phiTop + '}\\cos^2\\varphi\\sin\\varphi\\,d\\varphi = \\left[-\\frac{\\cos^3\\varphi}{3}\\right]_0^{' + phiTop + '} = ' + phiI.toTex() : it === 3 ? '\\int_0^{' + phiTop + '}\\sin^3\\varphi\\,d\\varphi = \\left[-\\cos\\varphi + \\frac{\\cos^3\\varphi}{3}\\right]_0^{' + phiTop + '} = ' + phiI.toTex() : '\\int_0^{' + phiTop + '}\\sin\\varphi\\,d\\varphi = ' + phiI.toTex();
      var vol = it === 0;
      return { q: (vol ? 'Find the volume of ' + regT + '.' : 'Evaluate $\\displaystyle\\iiint_E (' + fT + ')\\,dV$ over ' + regT + '.'), a: { t: 'num', v: piPlain(val) },
        steps: ['Spherical limits: $' + r0 + ' \\le \\rho \\le ' + a + '$, $0 \\le \\varphi \\le ' + phiTop + '$, $0 \\le \\theta \\le 2\\pi$; $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$.', (vol ? 'The integrand is $1$' : 'The integrand becomes $' + fS + '$') + ', so the integral separates into a $\\rho$ part, a $\\varphi$ part and a $\\theta$ part.', '$\\int_{' + r0 + '}^{' + a + '}\\rho^{' + n + '}\\,d\\rho = ' + rhoI.toTex() + '$, $' + phiS + '$, $\\int_0^{2\\pi}d\\theta = 2\\pi$.', 'Product: $' + piTex(val) + '$.'],
        hint: 'Write the integrand and $dV$ in spherical coordinates; remember the factor $\\rho^2\\sin\\varphi$ and that $\\varphi$ starts at the positive $z$-axis.', chk: { k: 'sph', f: fP, rho: [r0, a], phi: [0, [0, 1, 1 / 2, 1 / 3, 2 / 3][reg]], th: [0, 2] } };
    }
    if (kind === 'exp') return { q: 'Evaluate $\\displaystyle\\iiint_B e^{(x^{2} + y^{2} + z^{2})^{3/2}}\\,dV$ over the ball $x^{2} + y^{2} + z^{2} \\le 1$.', a: { t: 'num', v: '4*pi*(e - 1)/3' },
      steps: ['$(x^2 + y^2 + z^2)^{3/2} = \\rho^3$, so the integral is $\\displaystyle\\int_0^{2\\pi}\\int_0^{\\pi}\\int_0^1 e^{\\rho^3}\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$.', 'The $\\rho^2$ from $dV$ makes $u = \\rho^3$ work: $\\int_0^1 e^{\\rho^3}\\rho^2\\,d\\rho = \\frac{1}{3}(e - 1)$.', 'Times $2$ (from $\\varphi$) and $2\\pi$ (from $\\theta$): $\\frac{4\\pi}{3}(e - 1)$.'],
      hint: 'In spherical coordinates the exponent is $\\rho^3$; the volume element supplies $\\rho^2$.', chk: { k: 'sph', f: 'e^((x^2+y^2+z^2)^(3/2))', rho: [0, 1], phi: [0, 1], th: [0, 2] } };
    var b = a + R.int(1, 2);
    return { q: 'Find the volume of the spherical shell between $\\rho = ' + a + '$ and $\\rho = ' + b + '$ that lies above the $xy$-plane.', a: { t: 'num', v: piPlain(Q(2 * (b * b * b - a * a * a), 3)) },
      steps: ['$V = \\displaystyle\\int_0^{2\\pi}\\int_0^{\\pi/2}\\int_{' + a + '}^{' + b + '} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$.', '$\\int_{' + a + '}^{' + b + '}\\rho^2\\,d\\rho = \\frac{' + (b * b * b - a * a * a) + '}{3}$, $\\int_0^{\\pi/2}\\sin\\varphi\\,d\\varphi = 1$.', '$V = 2\\pi \\cdot \\frac{' + (b * b * b - a * a * a) + '}{3} = ' + piTex(Q(2 * (b * b * b - a * a * a), 3)) + '$.'],
      hint: 'Above the $xy$-plane means $0 \\le \\varphi \\le \\frac{\\pi}{2}$.', chk: { k: 'sph', f: '1', rho: [a, b], phi: [0, 0.5], th: [0, 2] } };
  });

  G('calc3.triple-applications', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['mass', 'mass', 'zbarbox'], ['zbarbox', 'hemi', 'Iz', 'mass'], ['hemi', 'conebar', 'Iz', 'zbarbox']));
    if (kind === 'mass') { var a = R.int(1, 3), b = R.int(1, 3), c = R.int(1, 3), rho = Poly.of(XYZ, R.pick([[[1, { x: 1 }], [1, { y: 1 }], [1, { z: 1 }]], [[1, { x: 1, y: 1 }]], [[1, { z: 1 }], [1, {}]], [[1, { x: 2 }]]])), m = rho.defint('z', 0, c).defint('y', 0, b).defint('x', 0, a).cval();
      return { q: 'A solid box $[0, ' + a + '] \\times [0, ' + b + '] \\times [0, ' + c + ']$ has density $\\rho(x, y, z) = ' + rho.toTex() + '$. Find its mass.', a: { t: 'num', v: m.toPlain() },
        steps: ['$m = \\iiint_B \\rho\\,dV$.', 'Integrate $z$, then $y$, then $x$ over the box: $' + rho.defint('z', 0, c).toTex() + '$, then $' + rho.defint('z', 0, c).defint('y', 0, b).toTex() + '$.', '$m = ' + m.toTex() + '$.'], hint: 'Mass is the triple integral of density.', chk: { k: 'boxw', rho: rho.toPlain(), w: '1', a: a, b: b, c: c } }; }
    if (kind === 'zbarbox') { var a2 = R.int(1, 3), b2 = R.int(1, 3), c2 = R.int(1, 4), rho2 = Poly.of(XYZ, R.pick([[[1, { z: 1 }]], [[1, { z: 1 }], [1, {}]], [[1, { z: 2 }]]])), m2 = rho2.defint('z', 0, c2).cval().mul(a2 * b2), Mz = rho2.mul(Poly.v(XYZ, 'z')).defint('z', 0, c2).cval().mul(a2 * b2), zb = Mz.div(m2);
      return { q: 'A box $[0, ' + a2 + '] \\times [0, ' + b2 + '] \\times [0, ' + c2 + ']$ has density $\\rho = ' + rho2.toTex() + '$ (heavier higher up). Find $\\bar{z}$.', a: { t: 'num', v: zb.toPlain() },
        steps: ['$\\bar{z} = \\dfrac{\\iiint z\\rho\\,dV}{\\iiint \\rho\\,dV}$.', 'Mass: $' + m2.toTex() + '$. Moment: $\\iiint z\\rho\\,dV = ' + Mz.toTex() + '$.', '$\\bar{z} = ' + zb.toTex() + '$, above the middle height $' + Q(c2, 2).toTex() + '$, as expected.'], hint: 'Center of mass = moment / mass. The $x$ and $y$ integrals give the same factor on top and bottom.', chk: { k: 'boxbar', rho: rho2.toPlain(), a: a2, b: b2, c: c2 } }; }
    if (kind === 'hemi') { var A2 = R.int(1, 4) * R.pick([1, 2]);
      return { q: 'Find $\\bar{z}$ for the solid upper half-ball $x^{2} + y^{2} + z^{2} \\le ' + A2 * A2 + '$, $z \\ge 0$, with constant density.', a: { t: 'num', v: Q(3 * A2, 8).toPlain() },
        steps: ['Volume (mass with density $1$): $\\frac{2}{3}\\pi(' + A2 + ')^3$.', 'Moment: $\\iiint z\\,dV = \\frac{\\pi(' + A2 + ')^4}{4}$ (spherical coordinates, $z = \\rho\\cos\\varphi$).', '$\\bar{z} = \\dfrac{\\pi(' + A2 + ')^4/4}{2\\pi(' + A2 + ')^3/3} = \\frac{3(' + A2 + ')}{8} = ' + Q(3 * A2, 8).toTex() + '$.'], hint: 'Use spherical coordinates for both integrals.', chk: { k: 'hemi', a: A2 } }; }
    if (kind === 'conebar') { var h = R.int(1, 4) * 4;
      return { q: 'Find $\\bar{z}$ for the solid cone $\\sqrt{x^{2} + y^{2}} \\le z \\le ' + h + '$ with constant density.', a: { t: 'num', v: String(3 * h / 4) },
        steps: ['Cylindrical coordinates: $r \\le z \\le ' + h + '$, $0 \\le r \\le ' + h + '$.', 'Volume: $\\int_0^{2\\pi}\\int_0^{' + h + '}\\int_r^{' + h + '} r\\,dz\\,dr\\,d\\theta = \\frac{\\pi(' + h + ')^3}{3}$.', 'Moment: $\\int_0^{2\\pi}\\int_0^{' + h + '}\\int_r^{' + h + '} z\\,r\\,dz\\,dr\\,d\\theta = \\frac{\\pi(' + h + ')^4}{4}$.', '$\\bar{z} = \\frac{3}{4}(' + h + ') = ' + 3 * h / 4 + '$: three quarters of the way up from the tip.'], hint: 'In cylindrical coordinates the cone is $r \\le z$.', chk: { k: 'cone', h: h } }; }
    var Rr = R.int(1, 3), H = R.int(1, 4);
    return { q: 'Find the moment of inertia about the $z$-axis, $I_z = \\iiint (x^{2} + y^{2})\\,dV$, of the solid cylinder $x^{2} + y^{2} \\le ' + Rr * Rr + '$, $0 \\le z \\le ' + H + '$ (density $1$).', a: { t: 'num', v: piPlain(Q(Math.pow(Rr, 4) * H, 2)) },
      steps: ['$x^2 + y^2 = r^2$ is the squared distance from the $z$-axis.', '$I_z = \\displaystyle\\int_0^{2\\pi}\\int_0^{' + Rr + '}\\int_0^{' + H + '} r^2 \\cdot r\\,dz\\,dr\\,d\\theta = 2\\pi \\cdot ' + H + ' \\cdot \\frac{' + Math.pow(Rr, 4) + '}{4}$.', '$= ' + piTex(Q(Math.pow(Rr, 4) * H, 2)) + '$ (the familiar $\\frac{1}{2}MR^2$ with $M = \\pi(' + Rr + ')^2(' + H + ')$).'], hint: 'Cylindrical coordinates; the integrand is $r^2$ and $dV$ adds another $r$.', chk: { k: 'Iz', R: Rr, H: H } };
  });

  G('calc3.change-of-variables', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['jac', 'jac', 'area'], ['area', 'lin', 'jacx', 'which'], ['lin', 'jacx', 'which', 'lin']));
    if (kind === 'jac') { var a = R.nz(-4, 4), b = R.nz(-4, 4), c = R.nz(-4, 4), d = R.nz(-4, 4); while (a * d - b * c === 0) d = R.nz(-4, 4); var J = a * d - b * c;
      return { q: 'Find the Jacobian $\\dfrac{\\partial(x, y)}{\\partial(u, v)}$ for $x = ' + T.terms([[a, 'u'], [b, 'v']]) + '$, $y = ' + T.terms([[c, 'u'], [d, 'v']]) + '$.', a: { t: 'num', v: String(J) },
        steps: ['$\\dfrac{\\partial(x, y)}{\\partial(u, v)} = \\begin{vmatrix} x_u & x_v \\\\ y_u & y_v \\end{vmatrix} = ' + T.mat([[a, b], [c, d]], 'vmatrix') + '$.', '$= ' + pf(a) + pf(d) + ' - ' + pf(b) + pf(c) + ' = ' + J + '$.', 'The map stretches areas by $|J| = ' + Math.abs(J) + '$: a small $du\\,dv$ rectangle becomes a parallelogram of area $' + Math.abs(J) + '\\,du\\,dv$.'],
        hint: 'Put the four partial derivatives in a $2 \\times 2$ determinant.', chk: { k: 'jac', m: [[a, b], [c, d]] } }; }
    if (kind === 'jacx') { var S = R.pick([['uv', 'u^{2} - v^{2}', 'u*v', 'u^2 - v^2', '-2*u^2 - 2*v^2', '-2u^{2} - 2v^{2}', 'v(-2v) - u(2u)'], ['u + v', 'uv', 'u + v', 'u*v', 'u - v', 'u - v', '1 \\cdot u - 1 \\cdot v'], ['e^{u}\\cos v', 'e^{u}\\sin v', 'e^(u)*cos(v)', 'e^(u)*sin(v)', 'e^(2*u)', 'e^{2u}', 'e^{2u}\\cos^2 v + e^{2u}\\sin^2 v'], ['u^{2}', 'uv', 'u^2', 'u*v', '2*u^2', '2u^{2}', '2u \\cdot u - 0 \\cdot v']]);
      return { q: 'Find the Jacobian $\\dfrac{\\partial(x, y)}{\\partial(u, v)}$ for $x = ' + S[0] + '$, $y = ' + S[1] + '$.', a: { t: 'expr', v: S[4], vars: ['u', 'v'] },
        steps: ['$\\dfrac{\\partial(x, y)}{\\partial(u, v)} = x_u y_v - x_v y_u$.', '$= ' + S[6] + ' = ' + S[5] + '$.'], hint: 'Compute $x_u$, $x_v$, $y_u$, $y_v$ and take the determinant.', chk: { k: 'jacx', x: S[2], y: S[3] }, nolint: ['+ 0'] }; }
    if (kind === 'which') { var right = '$\\left|\\dfrac{\\partial(x, y)}{\\partial(u, v)}\\right| du\\,dv$';
      return { q: 'When you substitute $x = x(u, v)$, $y = y(u, v)$ in a double integral, what replaces $dA = dx\\,dy$?', a: mc(R, right, ['$\\dfrac{\\partial(x, y)}{\\partial(u, v)}\\, du\\,dv$ (no absolute value)', '$\\left|\\dfrac{\\partial(u, v)}{\\partial(x, y)}\\right| du\\,dv$', '$du\\,dv$']),
        steps: ['A small $du$ by $dv$ rectangle maps to (nearly) a parallelogram with sides $\\mathbf{r}_u\\,du$ and $\\mathbf{r}_v\\,dv$.', 'Its area is $|\\det[\\mathbf{r}_u\\ \\mathbf{r}_v]|\\,du\\,dv = \\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| du\\,dv$. Area is never negative, hence the absolute value.', 'The Jacobian of the inverse map, $\\frac{\\partial(u, v)}{\\partial(x, y)}$, is the reciprocal: using it would shrink where you should stretch.'],
        hint: 'Think of the area of the image of a tiny rectangle.', chk: { k: 'which', ans: right } }; }
    // linear change of variables over a parallelogram: u = p x + q y, v = r x + s y
    var p, qq, r, s; do { p = R.nz(-2, 2); qq = R.nz(-2, 2); r = R.nz(-2, 2); s = R.nz(-2, 2); } while (p * s - qq * r === 0);
    var det = p * s - qq * r, u0 = R.int(-2, 1), u1 = u0 + R.int(1, 3), v0 = R.int(-2, 1), v1 = v0 + R.int(1, 3), UV = ['u', 'v'];
    var g = kind === 'area' ? Poly.c(UV, 1) : Poly.of(UV, R.pick([[[1, { u: 1 }]], [[1, { v: 1 }]], [[1, { u: 1, v: 1 }]], [[1, { v: 2 }]], [[1, { u: 2 }], [1, { v: 1 }]]]));
    var val = g.defint('v', v0, v1).defint('u', u0, u1).cval().div(Math.abs(det)), uT = T.terms([[p, 'x'], [qq, 'y']]), vT = T.terms([[r, 'x'], [s, 'y']]);
    var gx = g.toTex().replace(/u/g, '(' + uT + ')').replace(/v/g, '(' + vT + ')');
    var region = '$' + u0 + ' \\le ' + uT + ' \\le ' + u1 + '$ and $' + v0 + ' \\le ' + vT + ' \\le ' + v1 + '$';
    return { q: (kind === 'area' ? 'Find the area of the parallelogram ' + region + '.' : 'Evaluate $\\displaystyle\\iint_D ' + gx + '\\,dA$ where $D$ is the parallelogram ' + region + '.'), a: { t: 'num', v: val.toPlain() },
      steps: ['Let $u = ' + uT + '$ and $v = ' + vT + '$: the region becomes the rectangle $' + u0 + ' \\le u \\le ' + u1 + '$, $' + v0 + ' \\le v \\le ' + v1 + '$.', '$\\dfrac{\\partial(u, v)}{\\partial(x, y)} = ' + pf(p) + pf(s) + ' - ' + pf(qq) + pf(r) + ' = ' + det + '$, so $\\dfrac{\\partial(x, y)}{\\partial(u, v)} = ' + Q(1, det).toTex() + '$ (the reciprocal) and $dA = ' + Q(1, Math.abs(det)).toTex() + '\\,du\\,dv$.', 'The integral becomes $\\displaystyle' + Q(1, Math.abs(det)).toTex() + '\\int_{' + u0 + '}^{' + u1 + '}\\int_{' + v0 + '}^{' + v1 + '} ' + (kind === 'area' ? '1' : g.toTex()) + '\\,dv\\,du$.', 'Evaluate: $' + val.toTex() + '$.'],
      hint: 'Use the expressions that bound the region as the new variables. Then $dA = \\left|\\frac{\\partial(x, y)}{\\partial(u, v)}\\right| du\\,dv$, the reciprocal of $\\left|\\frac{\\partial(u, v)}{\\partial(x, y)}\\right|$.', chk: { k: 'para', g: g.toPlain(), p: p, q: qq, r: r, s: s, u: [u0, u1], v: [v0, v1] }, nolint: ['+ 0'] };
  });

})(window.MathLadder);
