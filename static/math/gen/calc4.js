/* Math Ladder problem generators: Calculus 4: Vector Calculus (calc4). One generator per topic in data/math/topics/calc4.json.
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


  // ===================================================================== g4_1fields.js
  // ---------- calc4 unit: Vector Fields ----------
  function polyField(R, vars, nTerms, deg) { return vars.map(function () { var p = new Poly(vars); for (var i = 0; i < (nTerms || 2); i++) p = p.add(rmono(R, vars, deg || 2, 4)); return p.isZero() ? Poly.c(vars, R.nz(-3, 3)) : p; }); }
  function fieldTex(F) { return '\\left\\langle ' + F.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle'; }
  function fieldPlain(F) { return F.map(function (c) { return c.toPlain(); }); }
  function exField(R, vars, L) { // components as Ex: polynomial, with an exp/sin term at higher levels
    var X = EX(vars), F = polyField(R, vars, 2, 2).map(Ex.poly);
    if (L >= 2) { var i = R.int(0, vars.length - 1), u = R.pick([X.x.mul(X.y), X.x.scale(R.nz(-2, 2)).add(X.y), vars.length > 2 ? X.y.mul(X.z) : X.x.pow(2)]); F[i] = F[i].add(R.pick([X.exp(u, R.nz(-3, 3)), X.sin(u, R.nz(-3, 3)), X.cos(u, R.nz(-2, 2))])); }
    return F;
  }
  function divEx(F, vars) { var d = new Ex(vars); F.forEach(function (c, i) { d = d.add(c.d(vars[i])); }); return d; }
  function curlEx(F) { return [F[2].d('y').sub(F[1].d('z')), F[0].d('z').sub(F[2].d('x')), F[1].d('x').sub(F[0].d('y'))]; }
  var DIRN = [[[1, 0], 'to the right (the $+x$ direction)'], [[-1, 0], 'to the left (the $-x$ direction)'], [[0, 1], 'straight up (the $+y$ direction)'], [[0, -1], 'straight down (the $-y$ direction)']];

  G('calc4.vector-fields', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['eval', 'dir', 'which'], ['eval', 'mag', 'dir', 'flow'], ['eval3', 'flow', 'mag', 'which']));
    if (kind === 'eval' || kind === 'eval3' || kind === 'mag') {
      var vars = kind === 'eval3' ? XYZ : XY, F = polyField(R, vars, 2, 2), P = vars.map(function () { return R.int(-3, 3); }), env = envPt(vars, P), val = F.map(function (c) { return c.at(env); });
      if (kind === 'mag') { var n2 = vn2(val).num(); if (!n2) { F[0] = F[0].add(3); val = F.map(function (c) { return c.at(env); }); n2 = vn2(val).num(); }
        return { q: 'Find the length of the arrow of $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$ at $' + ptTex(P) + '$.', a: { t: 'num', v: sqrtPlain(n2) },
          steps: ['The arrow at a point is the vector $\\mathbf{F}' + ptTex(P) + ' = ' + vTex(val) + '$.', 'Its length is $\\sqrt{' + val.map(function (x) { return T.pow(pf(x), 2); }).join(' + ') + '} = ' + sqrtTex(n2) + '$: in a velocity field, the speed there.'],
          hint: 'Evaluate the field at the point, then take the length of that vector.', chk: { k: 'mag', F: fieldPlain(F), P: P }, nolint: ['+ 0'] }; }
      return { q: 'Find the vector $\\mathbf{F}' + ptTex(P) + '$ for $\\mathbf{F}(' + vars.join(', ') + ') = ' + fieldTex(F) + '$.', a: { t: 'tuple', v: vPlain(val) },
        steps: ['A vector field attaches a vector to each point: substitute the point into each component.'].concat(F.map(function (c, i) { return 'Component ' + (i + 1) + ': $' + c.toTex() + ' = ' + val[i].toTex() + '$.'; })).concat(['So the arrow at $' + ptTex(P) + '$ is $' + vTex(val) + '$.']),
        hint: 'Put the coordinates of the point into each component.', chk: { k: 'eval', F: fieldPlain(F), P: P } };
    }
    if (kind === 'dir') {
      var fields = [['-y', 'x', '\\langle -y, x \\rangle'], ['y', '-x', '\\langle y, -x \\rangle'], ['x', 'y', '\\langle x, y \\rangle'], ['-x', '-y', '\\langle -x, -y \\rangle'], ['y', '0', '\\langle y, 0 \\rangle'], ['0', 'x', '\\langle 0, x \\rangle']];
      var fd = R.pick(fields), a = R.pick([1, 2, 3]) * R.sign(), onX = R.coin(), P2 = onX ? [a, 0] : [0, a];
      var fx = cf2(fd[0])(P2[0], P2[1]), fy = cf2(fd[1])(P2[0], P2[1]); if (!fx && !fy) { P2 = onX ? [0, a] : [a, 0]; fx = cf2(fd[0])(P2[0], P2[1]); fy = cf2(fd[1])(P2[0], P2[1]); }
      var unit = [Math.sign(fx), Math.sign(fy)], right = DIRN.filter(function (d) { return d[0][0] === unit[0] && d[0][1] === unit[1]; })[0][1];
      return { q: 'In the field $\\mathbf{F}(x, y) = ' + fd[2] + '$, which way does the arrow at $' + ptTex(P2) + '$ point?', a: mc(R, right, DIRN.map(function (d) { return d[1]; }).filter(function (s) { return s !== right; })),
        steps: ['$\\mathbf{F}' + ptTex(P2) + ' = ' + vTex([fx, fy]) + '$.', 'That vector points ' + right.replace(/ \(.*\)/, '') + ', with length $' + Math.abs(fx + fy) + '$.'],
        hint: 'Evaluate $\\mathbf{F}$ at the point and look at the signs of its components.', chk: { k: 'dir', F: [fd[0], fd[1]], P: P2, ans: right } };
    }
    if (kind === 'which') {
      var S = R.pick([['every arrow points directly away from the origin, longer the farther out it is', '\\langle x, y \\rangle'], ['every arrow points directly toward the origin', '\\langle -x, -y \\rangle'], ['the arrows circle the origin counterclockwise', '\\langle -y, x \\rangle'], ['the arrows circle the origin clockwise', '\\langle y, -x \\rangle'], ['every arrow is the same, pointing right and up', '\\langle 1, 1 \\rangle'], ['the arrows point right above the $x$-axis and left below it', '\\langle y, 0 \\rangle']]);
      var all = ['\\langle x, y \\rangle', '\\langle -x, -y \\rangle', '\\langle -y, x \\rangle', '\\langle y, -x \\rangle', '\\langle 1, 1 \\rangle', '\\langle y, 0 \\rangle'];
      return { q: 'Which field has this picture: ' + S[0] + '?', a: mc(R, '$' + S[1] + '$', R.shuffle(all.filter(function (s) { return s !== S[1]; })).map(function (s) { return '$' + s + '$'; })),
        steps: ['Test a few points, for example $(1, 0)$ and $(0, 1)$, in each formula.', 'For $' + S[1] + '$: at $(1, 0)$ the arrow is $' + vTex([cf2(S[1] === '\\langle 1, 1 \\rangle' ? '1' : S[1].replace(/\\langle |\\rangle/g, '').split(', ')[0])(1, 0), cf2(S[1] === '\\langle 1, 1 \\rangle' ? '1' : S[1].replace(/\\langle |\\rangle/g, '').split(', ')[1])(1, 0)]) + '$ and at $(0, 1)$ it is $' + vTex([cf2(S[1].replace(/\\langle |\\rangle/g, '').split(', ')[0])(0, 1), cf2(S[1].replace(/\\langle |\\rangle/g, '').split(', ')[1])(0, 1)]) + '$, which matches the description.'],
        hint: 'Draw the arrows at $(1, 0)$, $(0, 1)$, $(-1, 0)$ for each candidate.', chk: { k: 'which', ans: '$' + S[1] + '$', desc: S[0] } };
    }
    // flow lines
    var opts = R.pick([
      [['-y', 'x'], ['@*cos(t)', '@*sin(t)'], '\\langle @\\cos t, @\\sin t \\rangle', true, '$\\mathbf{r}\'(t) = \\langle -@\\sin t, @\\cos t \\rangle = \\langle -y, x \\rangle$'],
      [['y', '-x'], ['@*cos(t)', '@*sin(t)'], '\\langle @\\cos t, @\\sin t \\rangle', false, '$\\mathbf{r}\'(t) = \\langle -@\\sin t, @\\cos t \\rangle$, but $\\mathbf{F} = \\langle y, -x \\rangle = \\langle @\\sin t, -@\\cos t \\rangle$: the opposite direction'],
      [['x', '2y'], ['@*e^t', '@*e^(2t)'], '\\langle @e^{t}, @e^{2t} \\rangle', true, '$\\mathbf{r}\'(t) = \\langle @e^{t}, 2 \\cdot @e^{2t} \\rangle = \\langle x, 2y \\rangle$'],
      [['2x', 'y'], ['@*e^t', '@*e^(2t)'], '\\langle @e^{t}, @e^{2t} \\rangle', false, '$\\mathbf{r}\'(t) = \\langle @e^{t}, 2 \\cdot @e^{2t} \\rangle$, but $\\mathbf{F} = \\langle 2x, y \\rangle = \\langle 2 \\cdot @e^{t}, @e^{2t} \\rangle$'],
      [['1', '2x'], ['t', 't^2 + @'], '\\langle t, t^{2} + @ \\rangle', true, '$\\mathbf{r}\'(t) = \\langle 1, 2t \\rangle = \\langle 1, 2x \\rangle$']]);
    var aa = R.pick([2, 3, 4]), sub = function (x) { return x.replace(/@/g, String(aa)); }, Fvec = '\\langle ' + opts[0].join(', ') + ' \\rangle';
    return { q: 'Is $\\mathbf{r}(t) = ' + sub(opts[2]) + '$ a flow line (a curve whose velocity always equals the field) of $\\mathbf{F}(x, y) = ' + Fvec + '$?', a: { t: 'tf', v: opts[3] },
      steps: ['A flow line satisfies $\\mathbf{r}\'(t) = \\mathbf{F}(\\mathbf{r}(t))$ for every $t$: the path of a particle carried by the field.', sub(opts[4]) + '.', opts[3] ? 'They match for every $t$, so it is a flow line.' : 'They do not match, so it is not a flow line.'],
      hint: 'Compute $\\mathbf{r}\'(t)$ and compare it with $\\mathbf{F}$ evaluated at $x(t)$, $y(t)$.', chk: { k: 'flow', F: opts[0], r: opts[1].map(function (x) { return x.replace(/@/g, '(' + aa + ')'); }) } };
  });
  function cf2(s) { // tiny evaluator for the simple field strings used above
    var t = String(s).replace(/\\langle |\\rangle/g, '').trim();
    return function (x, y) { if (t === 'x') return x; if (t === '-x') return -x; if (t === 'y') return y; if (t === '-y') return -y; if (t === '0') return 0; if (t === '1') return 1; if (t === '2x') return 2 * x; if (t === '2y') return 2 * y; return NaN; };
  }

  G('calc4.gradient-fields', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['grad', 'at', 'isgrad'], ['grad', 'at', 'whichf', 'isgrad'], ['grad3', 'whichf', 'at', 'grad3']));
    if (kind === 'grad' || kind === 'grad3') {
      var vars = kind === 'grad3' ? XYZ : XY, f = randF(R, vars, kind === 'grad3' ? 2 : L), g = vars.map(function (v) { return f.d(v); });
      return { q: 'Find the gradient field $\\nabla f$ of $f(' + vars.join(', ') + ') = ' + f.toTex() + '$.', a: { t: 'tuple', v: g.map(function (e) { return e.toPlain(); }), vars: vars },
        steps: ['$\\nabla f = \\langle ' + vars.map(function (v) { return 'f_' + v; }).join(', ') + ' \\rangle$: at each point, the vector of partial derivatives.'].concat(vars.map(function (v, i) { return '$f_' + v + ' = ' + g[i].toTex() + '$.'; })),
        hint: 'Take each partial derivative, holding the other variables constant.', chk: { k: 'grad', f: f.toPlain(), vars: vars } };
    }
    if (kind === 'at') {
      var P = [R.int(-2, 2), R.int(-2, 2)], f2 = anchor(randF(R, XY, Math.min(L, 2)), envPt(XY, P), R), gv = XY.map(function (v) { return f2.d(v).at(envPt(XY, P)); });
      return { q: 'Let $\\mathbf{F} = \\nabla f$ for $f(x, y) = ' + f2.toTex() + '$. Find $\\mathbf{F}' + ptTex(P) + '$.', a: { t: 'tuple', v: vPlain(gv) },
        steps: ['$\\mathbf{F} = \\langle f_x, f_y \\rangle = \\langle ' + f2.d('x').toTex() + ', ' + f2.d('y').toTex() + ' \\rangle$.', 'At $' + ptTex(P) + '$: $' + vTex(gv) + '$. It points uphill on the graph of $f$, across the level curve through the point.'],
        hint: 'Differentiate first, then substitute the point.', chk: { k: 'at', f: f2.toPlain(), P: P } };
    }
    var fP = new Poly(XY); for (var i = 0; i < 2; i++) fP = fP.add(rmono(R, XY, 3, 4)); fP = fP.add(Poly.of(XY, [[R.nz(-3, 3), { x: R.int(1, 2), y: R.int(1, 2) }]]));
    var F = [fP.d('x'), fP.d('y')];
    if (kind === 'isgrad') {
      var ok = R.coin(), shown = F.slice(); if (!ok) { shown = [F[0].add(Poly.of(XY, [[R.nz(-3, 3), { x: R.int(0, 1), y: R.int(1, 2) }]])), F[1]]; }
      var gx = fP.d('x');
      return { q: 'Is $\\mathbf{F}(x, y) = ' + fieldTex(shown) + '$ the gradient of $f(x, y) = ' + fP.toTex() + '$?', a: { t: 'tf', v: ok },
        steps: ['Compute $\\nabla f = \\langle ' + fP.d('x').toTex() + ', ' + fP.d('y').toTex() + ' \\rangle$.', ok ? 'Both components match $\\mathbf{F}$, so $\\mathbf{F} = \\nabla f$.' : 'The first component of $\\mathbf{F}$ is $' + shown[0].toTex() + '$, not $' + gx.toTex() + '$, so $\\mathbf{F} \\ne \\nabla f$.'],
        hint: 'Differentiate $f$ and compare component by component.', chk: { k: 'isgrad', f: fP.toPlain(), F: fieldPlain(shown) } };
    }
    // which f has gradient F (mistakes: double-counting a shared term, a factor off, a swapped variable)
    var terms = fP.terms(), mixed = terms.filter(function (t) { return t[1][0] && t[1][1]; })[0];
    var w1 = mixed ? fP.add(Poly.mono(XY, mixed[0], mixed[1])) : fP.add(Poly.of(XY, [[2, { x: 1 }]])), w2 = fP.scale(2), w3 = fP.substAll({ x: Poly.v(XY, 'y'), y: Poly.v(XY, 'x') });
    var wrongs = [w1, w2, w3].filter(function (w) { return !(w.d('x').sub(F[0]).isZero() && w.d('y').sub(F[1]).isZero()); }).map(function (w) { return '$' + w.toTex() + '$'; });
    return { q: 'Which function $f$ has $\\nabla f = ' + fieldTex(F) + '$?', a: mc(R, '$' + fP.toTex() + '$', wrongs.concat(['$' + fP.add(Poly.of(XY, [[1, { x: 1, y: 1 }]])).toTex() + '$'])),
      steps: ['Check each candidate by differentiating: the right one must give $f_x = ' + F[0].toTex() + '$ and $f_y = ' + F[1].toTex() + '$.', 'For $f = ' + fP.toTex() + '$: $f_x = ' + fP.d('x').toTex() + '$ and $f_y = ' + fP.d('y').toTex() + '$. Both match.', mixed ? 'A term shared by both components (like $' + Poly.mono(XY, mixed[0], mixed[1]).toTex() + '$) must appear in $f$ only once.' : 'Each term of $f$ shows up in just one component here, since no term has both $x$ and $y$.'],
      hint: 'Differentiate each choice; the gradient must match both components.', chk: { k: 'whichf', F: fieldPlain(F), ans: '$' + fP.toTex() + '$' } };
  });

  G('calc4.divergence-curl', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['div', 'curl2d', 'div'], ['div', 'curl', 'curlAt', 'kind'], ['curl', 'divAt', 'curl', 'kind']));
    if (kind === 'kind') {
      var v = R.coin();
      if (v) return { q: 'For a scalar function $f(x, y, z)$ and a vector field $\\mathbf{F}$, which of these is <b>not</b> defined?', a: mc(R, '$\\nabla \\cdot f$', ['$\\nabla f$', '$\\nabla \\cdot \\mathbf{F}$', '$\\nabla \\times \\mathbf{F}$']),
        steps: ['$\\nabla f$ (gradient) takes a scalar function and gives a vector field.', '$\\nabla \\cdot \\mathbf{F}$ (divergence) and $\\nabla \\times \\mathbf{F}$ (curl) take a vector field.', '$\\nabla \\cdot f$ would dot $\\nabla$ with a single number at each point, which does not make sense: divergence needs three components to differentiate.'],
        hint: 'Which operations need a vector field as input?', chk: { k: 'kind', ans: '$\\nabla \\cdot f$' } };
      return { q: 'Which of these is a vector field (not a scalar function)?', a: mc(R, '$\\nabla \\times \\mathbf{F}$', ['$\\nabla \\cdot \\mathbf{F}$', '$\\nabla \\cdot (\\nabla \\times \\mathbf{F})$', '$\\mathbf{F} \\cdot \\mathbf{F}$']),
        steps: ['Divergence is a sum of three partial derivatives: one number at each point, a scalar.', 'Curl has three components, like a cross product: a vector field.', 'The divergence of a curl, and a dot product, are scalars.'],
        hint: 'Dots give scalars; crosses give vectors.', chk: { k: 'kind', ans: '$\\nabla \\times \\mathbf{F}$' } };
    }
    if (kind === 'curl2d') {
      var F2 = polyField(R, XY, 2, 2), P2 = [R.int(-3, 3), R.int(-3, 3)], cu = F2[1].d('x').sub(F2[0].d('y')), val2 = cu.at(envPt(XY, P2));
      return { q: 'Find the scalar curl $Q_x - P_y$ of $\\mathbf{F}(x, y) = ' + fieldTex(F2) + '$ at $' + ptTex(P2) + '$.', a: { t: 'num', v: val2.toPlain() },
        steps: ['$Q_x = ' + F2[1].d('x').toTex() + '$ and $P_y = ' + F2[0].d('y').toTex() + '$.', '$Q_x - P_y = ' + cu.toTex() + '$, which is $' + val2.toTex() + '$ at $' + ptTex(P2) + '$.', 'This is the $\\mathbf{k}$-component of $\\nabla \\times \\langle P, Q, 0 \\rangle$.'],
        hint: 'Differentiate the second component in $x$ and the first in $y$, then subtract.', chk: { k: 'curl2d', F: fieldPlain(F2), P: P2 } };
    }
    var F = exField(R, XYZ, L), P = [R.int(-2, 2), R.int(-2, 2), R.int(-2, 2)];
    if (kind === 'divAt' || kind === 'curlAt') { F = F.map(function (c) { return anchor(c, envPt(XYZ, P), R); }); }
    var dv = divEx(F, XYZ), cr = curlEx(F);
    var fT = '\\mathbf{F}(x, y, z) = ' + '\\left\\langle ' + F.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle';
    if (kind === 'div' || kind === 'divAt') {
      var parts = F.map(function (c, i) { return '$\\frac{\\partial}{\\partial ' + XYZ[i] + '}\\left(' + c.toTex() + '\\right) = ' + c.d(XYZ[i]).toTex() + '$'; });
      if (kind === 'divAt') { var dvv = dv.at(envPt(XYZ, P)); return { q: 'Find $\\nabla \\cdot \\mathbf{F}$ at $' + ptTex(P) + '$ for $' + fT + '$.', a: { t: 'num', v: dvv.toPlain() },
        steps: ['$\\nabla \\cdot \\mathbf{F} = P_x + Q_y + R_z$: each component differentiated in its own variable.'].concat(parts).concat(['At $' + ptTex(P) + '$: $' + dvv.toTex() + '$.']), hint: 'Divergence: $P_x + Q_y + R_z$, a single number at each point.', chk: { k: 'divAt', F: F.map(function (c) { return c.toPlain(); }), P: P } }; }
      return { q: 'Find $\\nabla \\cdot \\mathbf{F}$ for $' + fT + '$.', a: { t: 'expr', v: dv.toPlain(), vars: XYZ },
        steps: ['$\\nabla \\cdot \\mathbf{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}$.'].concat(parts).concat(['Add: $\\nabla \\cdot \\mathbf{F} = ' + dv.toTex() + '$, a scalar function.']),
        hint: 'Differentiate the first component in $x$, the second in $y$, the third in $z$, and add.', chk: { k: 'div', F: F.map(function (c) { return c.toPlain(); }) } };
    }
    var cst = ['$\\nabla \\times \\mathbf{F} = \\langle R_y - Q_z,\\ P_z - R_x,\\ Q_x - P_y \\rangle$ (the cross-product pattern with $\\nabla = \\langle \\partial_x, \\partial_y, \\partial_z \\rangle$).',
      'First: $R_y - Q_z = ' + cr[0].toTex() + '$.', 'Second: $P_z - R_x = ' + cr[1].toTex() + '$.', 'Third: $Q_x - P_y = ' + cr[2].toTex() + '$.'];
    if (kind === 'curlAt') { var cv = cr.map(function (c) { return c.at(envPt(XYZ, P)); }); return { q: 'Find $\\nabla \\times \\mathbf{F}$ at $' + ptTex(P) + '$ for $' + fT + '$.', a: { t: 'tuple', v: vPlain(cv) },
      steps: cst.concat(['At $' + ptTex(P) + '$: $' + vTex(cv) + '$.']), hint: 'Use the determinant pattern of a cross product, then substitute.', chk: { k: 'curlAt', F: F.map(function (c) { return c.toPlain(); }), P: P } }; }
    return { q: 'Find $\\nabla \\times \\mathbf{F}$ for $' + fT + '$.', a: { t: 'tuple', v: cr.map(function (c) { return c.toPlain(); }), vars: XYZ },
      steps: cst, hint: 'Write the $3 \\times 3$ determinant with $\\partial_x, \\partial_y, \\partial_z$ in the middle row; mind the minus sign in the middle component.', chk: { k: 'curl', F: F.map(function (c) { return c.toPlain(); }) } };
  });

  var MEAN_TF = [
    ['The field $\\langle y, 0 \\rangle$ has straight, parallel arrows, so its curl is $0$.', false, 'Its curl is $Q_x - P_y = 0 - 1 = -1$: the flow is faster above a paddle wheel than below it, so the wheel turns clockwise.'],
    ['The field $\\frac{\\langle -y, x \\rangle}{x^2 + y^2}$ has arrows that curve around the origin, so its curl is not $0$ (away from the origin).', false, 'Computing gives $Q_x - P_y = 0$ for $(x, y) \\ne (0, 0)$: the flow circles, but a small paddle wheel off the origin does not spin.'],
    ['The field $\\langle x, y \\rangle$ has divergence $2$ everywhere: every point is a source.', true, '$P_x + Q_y = 1 + 1 = 2 > 0$: more flows out of any small box than in.'],
    ['The rotation field $\\langle -y, x \\rangle$ has divergence $0$.', true, '$P_x + Q_y = 0 + 0 = 0$: it swirls without spreading out or bunching up.'],
    ['The constant field $\\langle 3, -1 \\rangle$ has zero divergence and zero curl.', true, 'All partial derivatives of constants are $0$.'],
    ['If $\\nabla \\cdot \\mathbf{F} = 0$ everywhere, the net flow out of every small box is $0$.', true, 'Divergence is the outflow per unit volume; zero means what flows in also flows out.'],
    ['The field $\\langle x, 0 \\rangle$ has divergence $0$ because it does not swirl.', false, 'Divergence measures spreading, not swirling: $P_x + Q_y = 1$, so it spreads out in the $x$-direction.'],
    ['A field with positive curl at a point makes a paddle wheel there turn counterclockwise.', true, 'In the plane, $Q_x - P_y > 0$ means counterclockwise rotation (by the right-hand rule, the curl points up out of the page).']];
  G('calc4.curl-divergence-meaning', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['source', 'spin', 'tf'], ['source', 'spin', 'tf', 'rigid'], ['tf', 'source', 'spin', 'rigid']));
    if (kind === 'tf') { var s = R.pick(MEAN_TF); return { q: 'True or false: ' + s[0], a: { t: 'tf', v: s[1] }, steps: [s[2]], hint: 'Compute $P_x + Q_y$ (divergence) or $Q_x - P_y$ (curl) instead of judging by the shape of the arrows.', chk: { k: 'tf', ans: s[1] } }; }
    if (kind === 'rigid') { var w = R.pick([1, 2, 3, Q(1, 2), Q(3, 2)]); return { q: 'A wheel spins about the $z$-axis with angular speed $\\omega = ' + qt(w) + '$ rad/s, so the velocity of its points is $\\mathbf{v} = \\omega\\langle -y, x, 0 \\rangle$. Find the $z$-component of $\\nabla \\times \\mathbf{v}$.', a: { t: 'num', v: q(w).mul(2).toPlain() },
      steps: ['$\\mathbf{v} = \\langle -\\omega y, \\omega x, 0 \\rangle$.', 'The $z$-component of the curl is $Q_x - P_y = \\omega - (-\\omega) = 2\\omega = ' + q(w).mul(2).toTex() + '$.', 'The curl of a rigid rotation is twice its angular velocity: a small paddle wheel carried along spins at $\\omega$.'],
      hint: 'Write $P = -\\omega y$ and $Q = \\omega x$, and compute $Q_x - P_y$.', chk: { k: 'rigid', w: qn(w) } }; }
    var F = polyField(R, XY, 2, 2), P = [R.int(-2, 2), R.int(-2, 2)], env = envPt(XY, P);
    if (kind === 'source') { var dv = F[0].d('x').add(F[1].d('y')), d0 = dv.at(env); if (d0.isZero() && R.chance(0.7)) { F[0] = F[0].add(Poly.of(XY, [[R.nz(-2, 2), { x: 1 }]])); dv = F[0].d('x').add(F[1].d('y')); d0 = dv.at(env); }
      var ans = d0.sign() > 0 ? 'A source: more flows out than in' : d0.sign() < 0 ? 'A sink: more flows in than out' : 'Neither: inflow and outflow balance';
      return { q: 'For the flow $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$, find $\\nabla \\cdot \\mathbf{F}$ at $' + ptTex(P) + '$ and say what it means there.', a: { t: 'multi', parts: [{ label: '$\\nabla \\cdot \\mathbf{F} =$', a: { t: 'num', v: d0.toPlain() } }, { label: 'the point is', a: { t: 'mc', choices: ['A source: more flows out than in', 'A sink: more flows in than out', 'Neither: inflow and outflow balance'], v: d0.sign() > 0 ? 0 : d0.sign() < 0 ? 1 : 2, keep: true } }] },
        steps: ['$\\nabla \\cdot \\mathbf{F} = P_x + Q_y = ' + F[0].d('x').toTex() + ' + ' + F[1].d('y').toTex().replace(/^-/, '(-') + (F[1].d('y').toTex()[0] === '-' ? ')' : '') + '$.', 'At $' + ptTex(P) + '$ it equals $' + d0.toTex() + '$.', ans + '.'],
        hint: 'Divergence $= P_x + Q_y$; its sign tells source or sink.', chk: { k: 'source', F: fieldPlain(F), P: P }, nolint: ['+ -', '+ 0'] }; }
    var cu = F[1].d('x').sub(F[0].d('y')), c0 = cu.at(env); if (c0.isZero() && R.chance(0.7)) { F[1] = F[1].add(Poly.of(XY, [[R.nz(-2, 2), { x: 1 }]])); cu = F[1].d('x').sub(F[0].d('y')); c0 = cu.at(env); }
    return { q: 'A tiny paddle wheel sits at $' + ptTex(P) + '$ in the flow $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$. Find $Q_x - P_y$ there and say how the wheel turns.', a: { t: 'multi', parts: [{ label: '$Q_x - P_y =$', a: { t: 'num', v: c0.toPlain() } }, { label: 'the wheel', a: { t: 'mc', choices: ['turns counterclockwise', 'turns clockwise', 'does not turn'], v: c0.sign() > 0 ? 0 : c0.sign() < 0 ? 1 : 2, keep: true } }] },
      steps: ['$Q_x - P_y = ' + F[1].d('x').toTex() + ' - (' + F[0].d('y').toTex() + ')$.', 'At $' + ptTex(P) + '$: $' + c0.toTex() + '$.', c0.sign() > 0 ? 'Positive: counterclockwise.' : c0.sign() < 0 ? 'Negative: clockwise.' : 'Zero: no spin there.'],
      hint: 'The scalar curl $Q_x - P_y$ measures spin: positive means counterclockwise.', chk: { k: 'spin', F: fieldPlain(F), P: P }, nolint: ['+ 0'] };
  });


  // ===================================================================== g4_2line.js
  // ---------- calc4 unit: Line Integrals ----------
  var CS = ['cth', 'sth'];
  function segParam(A, B) { return A.map(function (a, i) { return Poly.of(TV, [[q(B[i]).sub(a), { t: 1 }], [a, {}]]); }); }
  function rMap(vars, rs, nv) { var m = { __vars: nv || TV }; vars.forEach(function (v, i) { m[v] = rs[i]; }); return m; }
  function workPoly(F, vars, rs, t0, t1) { // exact ∫ F(r(t)) · r'(t) dt
    var m = rMap(vars, rs), g = Poly.c(TV, 0); F.forEach(function (c, i) { g = g.add(c.substAll(m).mul(rs[i].d('t'))); });
    return { g: g, val: g.defint('t', t0, t1).cval() };
  }
  function circleMap(h, k, Rr) { var c = Poly.v(CS, 'cth'), s = Poly.v(CS, 'sth'); return { m: { __vars: CS, x: c.scale(Rr).add(h), y: s.scale(Rr).add(k) }, dx: s.scale(-Rr), dy: c.scale(Rr) }; }
  function workCircle(F, h, k, Rr, j0, j1, flux) { // ∮ P dx + Q dy (or P dy − Q dx) over a circle, θ from j0·π/2 to j1·π/2
    var C = circleMap(h, k, Rr), P = F[0].substAll(C.m), Qy = F[1].substAll(C.m), g = flux ? P.mul(C.dy).sub(Qy.mul(C.dx)) : P.mul(C.dx).add(Qy.mul(C.dy));
    return { g: g, val: intCS(g, j0, j1, 'cth', 'sth') };
  }
  function circPlain(h, k, Rr, cw) { return ['(' + h + ') + (' + Rr + ')*cos(t)', '(' + k + ') + (' + (cw ? -Rr : Rr) + ')*sin(t)']; }
  function circTex(h, k, Rr, cw, v) { v = v || 't'; return '\\left\\langle ' + T.coef(Rr, '\\cos ' + v) + T.signed(h).replace(/^ \+ /, ' + ') + ', ' + T.coef(cw ? -Rr : Rr, '\\sin ' + v) + T.signed(k) + ' \\right\\rangle'; }
  function thetaRange(j0, j1) { return piTex(Q(j0, 2)) + ' \\le \\theta \\le ' + piTex(Q(j1, 2)); }
  function arcName(j0, j1) { var n = j1 - j0; return n === 4 ? 'the full circle' : n === 2 ? (j0 === 0 ? 'the upper half of the circle' : 'the lower half of the circle') : 'the quarter of the circle in the ' + ['first', 'second', 'third', 'fourth'][j0] + ' quadrant'; }

  G('calc4.parametrize-curves', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['seg', 'point', 'circle', 'which'], ['seg', 'circle', 'graph', 'which'], ['seg3', 'circle', 'which', 'graph']));
    if (kind === 'seg' || kind === 'seg3' || kind === 'point') {
      var dim = kind === 'seg3' ? 3 : 2, A = (dim === 3 ? randPt(R, -4, 4) : [R.int(-5, 5), R.int(-5, 5)]), B; do { B = (dim === 3 ? randPt(R, -4, 4) : [R.int(-5, 5), R.int(-5, 5)]); } while (A.join() === B.join());
      var rs = segParam(A, B), d = vsub(B, A);
      if (kind === 'point') { var t1 = R.pick([Q(1, 2), Q(1, 4), Q(3, 4), Q(1, 3), Q(2, 3)]), pt = rs.map(function (p) { return p.at({ t: t1 }); });
        return { q: 'The segment from $A' + ptTex(A) + '$ to $B' + ptTex(B) + '$ is traced by $\\mathbf{r}(t) = A + t(B - A)$, $0 \\le t \\le 1$. Find $\\mathbf{r}\\left(' + t1.toTex() + '\\right)$.', a: { t: 'tuple', v: vPlain(pt) },
          steps: ['$B - A = ' + vTex(d) + '$.', '$\\mathbf{r}\\left(' + t1.toTex() + '\\right) = ' + ptTex(A) + ' + ' + t1.toTex() + vTex(d) + ' = ' + ptTex(pt) + '$: the point $' + t1.toTex() + '$ of the way from $A$ to $B$.'],
          hint: 'Start at $A$ and go that fraction of the way along $B - A$.', chk: { k: 'segpt', A: A, B: B, t: qn(t1) } }; }
      return { q: 'Parametrize the segment from $A' + ptTex(A) + '$ to $B' + ptTex(B) + '$ at constant speed, with $\\mathbf{r}(0) = A$, $\\mathbf{r}(1) = B$. Give $\\mathbf{r}(t)$.', a: { t: 'tuple', v: rs.map(function (p) { return p.toPlain(); }), vars: ['t'] },
        steps: ['Start at $A$ and add $t$ copies of the direction $B - A = ' + vTex(d) + '$: $\\mathbf{r}(t) = A + t(B - A)$.', '$\\mathbf{r}(t) = \\left\\langle ' + rs.map(function (p) { return p.toTex(); }).join(', ') + ' \\right\\rangle$, $0 \\le t \\le 1$.', 'Check: $t = 0$ gives $A$ and $t = 1$ gives $B$.'],
        hint: 'Use $\\mathbf{r}(t) = A + t(B - A)$: the start point plus a fraction of the trip.', chk: { k: 'seg', A: A, B: B } };
    }
    if (kind === 'circle') {
      var h = R.int(-3, 3), k = R.int(-3, 3), Rr = R.int(1, 5), cw = L > 1 && R.coin(), pl = circPlain(h, k, Rr, cw);
      return { q: 'Parametrize the circle with center $' + ptTex([h, k]) + '$ and radius $' + Rr + '$, traced once ' + (cw ? 'clockwise' : 'counterclockwise') + ' at constant speed, starting at $' + ptTex([h + Rr, k]) + '$ when $t = 0$ ($0 \\le t \\le 2\\pi$).', a: { t: 'tuple', v: pl, vars: ['t'] },
        steps: ['A circle of radius $R$ around the origin is $\\langle R\\cos t, R\\sin t \\rangle$, counterclockwise from $(R, 0)$.', cw ? 'To go clockwise, flip the sign of the sine: $\\langle R\\cos t, -R\\sin t \\rangle$.' : 'That already goes the right way.', 'Shift the center to $' + ptTex([h, k]) + '$: $\\mathbf{r}(t) = ' + circTex(h, k, Rr, cw) + '$.'],
        hint: 'Start from $\\langle R\\cos t, R\\sin t \\rangle$, then move the center' + (cw ? ' and reverse the direction' : '') + '.', chk: { k: 'circle', h: h, kk: k, R: Rr, cw: cw }, nolint: ['+ -'] };
    }
    if (kind === 'graph') {
      var g = Poly.of(['x'], [[R.nz(-2, 3), { x: 2 }], [R.int(-3, 3), { x: 1 }], [R.int(-4, 4), {}]]), a = R.int(-2, 1), b = a + R.int(1, 3), gt = g.substAll({ __vars: TV, x: tP });
      return { q: 'Parametrize the part of the graph $y = ' + g.toTex() + '$ from $x = ' + a + '$ to $x = ' + b + '$, using $x = t$.', a: { t: 'tuple', v: ['t', gt.toPlain()], vars: ['t'] },
        steps: ['Let $x$ itself be the parameter: $x = t$ and $y = ' + gt.toTex() + '$.', 'So $\\mathbf{r}(t) = \\left\\langle t, ' + gt.toTex() + ' \\right\\rangle$ with $' + a + ' \\le t \\le ' + b + '$, moving left to right.'],
        hint: 'For a graph $y = f(x)$, take $x = t$ and $y = f(t)$.', chk: { k: 'graph', g: g.toPlain() } };
    }
    var A2 = [R.int(-4, 4), R.int(-4, 4)], B2 = [A2[0] + R.nz(-4, 4), A2[1] + R.nz(-4, 4)], dd = vsub(B2, A2), back = vsub(A2, B2);
    var good = '$\\mathbf{r}(t) = ' + vTex(B2) + ' + t' + vTex(back) + '$', bad = '$\\mathbf{r}(t) = ' + vTex(A2) + ' + t' + vTex(dd) + '$';
    return { q: 'A curve $C$ is the segment from $B' + ptTex(B2) + '$ to $A' + ptTex(A2) + '$ (in that direction). Which parametrization, $0 \\le t \\le 1$, traces $C$ with the right orientation?', a: mc(R, good, [bad, '$\\mathbf{r}(t) = ' + vTex(B2) + ' + t' + vTex(dd) + '$', '$\\mathbf{r}(t) = ' + vTex(A2) + ' + t' + vTex(back) + '$']),
      steps: ['The curve starts at $B$, so $\\mathbf{r}(0)$ must be $B$, and it ends at $A$, so $\\mathbf{r}(1) = A$.', 'Direction: end minus start, $A - B = ' + vTex(back) + '$.', 'So $\\mathbf{r}(t) = B + t(A - B)$. The other order traces the same points backward, which flips the sign of every line integral of a vector field.'],
      hint: 'Check $\\mathbf{r}(0)$ and $\\mathbf{r}(1)$ against the start and end of $C$.', chk: { k: 'which', A: A2, B: B2, ans: good } };
  });

  G('calc4.scalar-line-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['seg', 'seg', 'length'], ['seg', 'circle', 'mass'], ['circle', 'seg3', 'helix', 'mass']));
    if (kind === 'seg' || kind === 'seg3' || kind === 'mass' || kind === 'length') {
      var dim = kind === 'seg3' ? 3 : 2, vars = dim === 3 ? XYZ : XY, dv = dim === 3 ? py3(R, 11) : py2(R, 13), A = dim === 3 ? randPt(R, -3, 3) : [R.int(-3, 3), R.int(-3, 3)], B = vadd(A, dv.v);
      var f = kind === 'length' ? Poly.c(vars, 1) : (function () { var p = new Poly(vars); p = p.add(rmono(R, vars, 1, 3)).add(rmono(R, vars, 2, 3)); return p.isZero() ? Poly.c(vars, 2) : p; })();
      if (kind === 'mass') f = Poly.of(XY, [[R.int(1, 3), {}], [R.int(1, 2), { x: R.int(0, 1), y: R.int(0, 1) }]]);
      var rs = segParam(A, B), fr = f.substAll(rMap(vars, rs)), val = fr.defint('t', 0, 1).cval().mul(dv.n);
      var lead = kind === 'mass' ? 'A thin wire lies along the segment from $' + ptTex(A) + '$ to $' + ptTex(B) + '$ and has density $\\delta(x, y) = ' + f.toTex() + '$. Find its mass $\\int_C \\delta\\,ds$.' : kind === 'length' ? 'Use $\\int_C 1\\,ds$ to find the length of the segment from $' + ptTex(A) + '$ to $' + ptTex(B) + '$.' : 'Evaluate $\\displaystyle\\int_C \\left(' + f.toTex() + '\\right) ds$ where $C$ is the segment from $' + ptTex(A) + '$ to $' + ptTex(B) + '$.';
      return { q: lead, a: { t: 'num', v: val.toPlain() },
        steps: ['Parametrize: $\\mathbf{r}(t) = ' + vTex(A) + ' + t' + vTex(dv.v) + '$, $0 \\le t \\le 1$.', '$ds = |\\mathbf{r}\'(t)|\\,dt = |' + vTex(dv.v) + '|\\,dt = ' + dv.n + '\\,dt$.', 'Along the segment the integrand is $' + fr.toTex() + '$.', '$\\int_0^1 \\left(' + fr.toTex() + '\\right) \\cdot ' + dv.n + '\\,dt = ' + val.toTex() + '$.'],
        hint: 'Parametrize, replace $ds$ by $|\\mathbf{r}\'(t)|\\,dt$, and integrate in $t$.', chk: { k: 'scal', f: f.toPlain(), r: rs.map(function (p) { return p.toPlain(); }), t: [0, 1] } };
    }
    if (kind === 'circle') {
      var Rr = R.int(1, 3), arc = R.pick([[0, 4], [0, 2], [0, 1], [2, 4]]), f2 = Poly.of(XY, R.pick([[[1, { x: 2 }]], [[1, { y: 2 }]], [[1, { x: 2 }], [1, { y: 1 }]], [[1, { x: 1 }], [2, {}]], [[1, { x: 1, y: 1 }], [1, {}]], [[1, { y: 1 }]]]));
      var C = circleMap(0, 0, Rr), g = f2.substAll(C.m).scale(Rr), val2 = intCS(g, arc[0], arc[1], 'cth', 'sth');
      return { q: 'Evaluate $\\displaystyle\\int_C \\left(' + f2.toTex() + '\\right) ds$ where $C$ is ' + arcName(arc[0], arc[1]) + ' $x^2 + y^2 = ' + Rr * Rr + '$.', a: { t: 'num', v: rpPlain(val2) },
        steps: ['Parametrize: $x = ' + T.coef(Rr, '\\cos\\theta') + '$, $y = ' + T.coef(Rr, '\\sin\\theta') + '$, $' + thetaRange(arc[0], arc[1]) + '$.', 'The speed is $' + Rr + '$, so $ds = ' + Rr + '\\,d\\theta$ (arc length is radius times angle).', 'The integral becomes $\\int ' + g.toTex() + '\\,d\\theta$ over that range.', 'Value: $' + rpTex(val2) + '$.'],
        hint: 'On a circle of radius $R$, $ds = R\\,d\\theta$.', chk: { k: 'scal', f: f2.toPlain(), r: [Rr + '*cos(t)', Rr + '*sin(t)'], t: [arc[0] / 2, arc[1] / 2], pi: true } };
    }
    var p2 = R.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10]]), a = p2[0], b = p2[1], c = p2[2], useZ = R.coin(), val3 = useZ ? Q(2 * b * c) : Q(2 * a * a * c);
    return { q: 'Evaluate $\\displaystyle\\int_C ' + (useZ ? 'z' : '(x^2 + y^2)') + '\\,ds$ over one turn of the helix $\\mathbf{r}(t) = \\langle ' + a + '\\cos t, ' + a + '\\sin t, ' + b + 't \\rangle$, $0 \\le t \\le 2\\pi$.', a: { t: 'num', v: useZ ? (2 * b * c) + '*pi^2' : piPlain(2 * a * a * c) },
      steps: ['$|\\mathbf{r}\'(t)| = \\sqrt{' + a * a + ' + ' + b * b + '} = ' + c + '$, so $ds = ' + c + '\\,dt$.', useZ ? 'On the helix $z = ' + b + 't$: $\\int_0^{2\\pi} ' + b + 't \\cdot ' + c + '\\,dt = ' + b * c + ' \\cdot \\frac{(2\\pi)^2}{2} = ' + 2 * b * c + '\\pi^2$.' : 'On the helix $x^2 + y^2 = ' + a * a + '$: $\\int_0^{2\\pi} ' + a * a + ' \\cdot ' + c + '\\,dt = ' + piTex(2 * a * a * c) + '$.'],
      hint: 'Find the speed $|\\mathbf{r}\'(t)|$ first. It is constant here, and $ds$ is the speed times $dt$.', chk: { k: 'scal', f: useZ ? 'z' : 'x^2+y^2', r: [a + '*cos(t)', a + '*sin(t)', b + '*t'], t: [0, 2], pi: true } };
  });

  function polyF2(R, deg) { return [0, 1].map(function () { var p = new Poly(XY); p = p.add(rmono(R, XY, deg || 2, 3)).add(rmono(R, XY, 1, 3)); return p.isZero() ? Poly.c(XY, 1) : p; }); }
  G('calc4.work-line-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['seg', 'parab', 'reverse'], ['seg', 'parab', 'circle', 'reverse'], ['circle', 'cubic', 'parab', 'circle']));
    if (kind === 'seg' || kind === 'reverse') {
      var F = polyF2(R, 2), A = [R.int(-2, 2), R.int(-2, 2)], B = [A[0] + R.nz(-3, 3), A[1] + R.nz(-3, 3)], rs = segParam(A, B), W = workPoly(F, XY, rs, 0, 1);
      if (kind === 'reverse') return { q: 'For $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$, the work along the segment from $A' + ptTex(A) + '$ to $B' + ptTex(B) + '$ is $' + W.val.toTex() + '$. What is the work along the same segment from $B$ to $A$?', a: { t: 'num', v: W.val.neg().toPlain() },
        steps: ['Reversing the direction reverses $d\\mathbf{r}$ at every point, so every bit of work $\\mathbf{F} \\cdot d\\mathbf{r}$ changes sign.', '$\\int_{-C} \\mathbf{F} \\cdot d\\mathbf{r} = -\\int_C \\mathbf{F} \\cdot d\\mathbf{r} = ' + W.val.neg().toTex() + '$.'],
        hint: 'What happens to $d\\mathbf{r}$ when you walk the other way?', chk: { k: 'work', F: fieldPlain(F), r: segParam(B, A).map(function (p) { return p.toPlain(); }), t: [0, 1] } };
      return { q: 'Find the work $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ done by $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$ along the segment from $' + ptTex(A) + '$ to $' + ptTex(B) + '$.', a: { t: 'num', v: W.val.toPlain() },
        steps: ['$\\mathbf{r}(t) = \\left\\langle ' + rs.map(function (p) { return p.toTex(); }).join(', ') + ' \\right\\rangle$, $0 \\le t \\le 1$, and $\\mathbf{r}\'(t) = ' + vTex(vsub(B, A)) + '$.', '$\\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}\'(t) = ' + W.g.toTex() + '$.', '$\\int_0^1 \\left(' + W.g.toTex() + '\\right) dt = ' + W.val.toTex() + '$.'],
        hint: 'Parametrize, then integrate $\\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}\'(t)$ from $t = 0$ to $1$.', chk: { k: 'work', F: fieldPlain(F), r: rs.map(function (p) { return p.toPlain(); }), t: [0, 1] } };
    }
    if (kind === 'parab') {
      var F2 = polyF2(R, 2), a = R.pick([1, 2, -1]), rs2 = [Poly.of(TV, [[1, { t: 1 }]]), Poly.of(TV, [[1, { t: 2 }]])], lo = Math.min(0, a), hi = Math.max(0, a), W2 = workPoly(F2, XY, rs2, 0, a);
      return { q: 'Find $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ for $\\mathbf{F}(x, y) = ' + fieldTex(F2) + '$, where $C$ is the parabola $y = x^2$ from $(0, 0)$ to $' + ptTex([a, a * a]) + '$.', a: { t: 'num', v: W2.val.toPlain() },
        steps: ['Use $x = t$: $\\mathbf{r}(t) = \\langle t, t^2 \\rangle$, $t$ from $0$ to $' + a + '$, and $\\mathbf{r}\'(t) = \\langle 1, 2t \\rangle$.', '$\\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}\'(t) = ' + W2.g.toTex() + '$.', '$\\int_0^{' + a + '} \\left(' + W2.g.toTex() + '\\right) dt = ' + W2.val.toTex() + '$.' + (a < 0 ? ' (The curve runs to the left, so $t$ decreases from $0$ to $' + a + '$; keep those limits in that order.)' : '')],
        hint: 'Parametrize the parabola with $x = t$; the limits follow the direction of travel.', chk: { k: 'work', F: fieldPlain(F2), r: ['t', 't^2'], t: [0, a] } };
    }
    if (kind === 'circle') {
      var F3 = polyF2(R, 2), Rr = R.int(1, 3), arc = R.pick([[0, 4], [0, 2], [0, 1]]), W3 = workCircle(F3, 0, 0, Rr, arc[0], arc[1]);
      return { q: 'Find the work done by $\\mathbf{F}(x, y) = ' + fieldTex(F3) + '$ along ' + arcName(arc[0], arc[1]) + ' $x^2 + y^2 = ' + Rr * Rr + '$, traced counterclockwise.', a: { t: 'num', v: rpPlain(W3.val) },
        steps: ['$x = ' + T.coef(Rr, '\\cos\\theta') + '$, $y = ' + T.coef(Rr, '\\sin\\theta') + '$, $' + thetaRange(arc[0], arc[1]) + '$; $d\\mathbf{r} = \\langle ' + T.coef(-Rr, '\\sin\\theta') + ', ' + T.coef(Rr, '\\cos\\theta') + ' \\rangle d\\theta$.', '$\\mathbf{F} \\cdot \\frac{d\\mathbf{r}}{d\\theta} = ' + W3.g.toTex() + '$.', 'Integrate over the range of $\\theta$: $' + rpTex(W3.val) + '$.'],
        hint: 'Parametrize the circle by the angle $\\theta$, counterclockwise.', chk: { k: 'work', F: fieldPlain(F3), r: [Rr + '*cos(t)', Rr + '*sin(t)'], t: [0, arc[1] / 2], pi: true } };
    }
    var F4 = [0, 1, 2].map(function () { var p = new Poly(XYZ).add(rmono(R, XYZ, 1, 3)).add(rmono(R, XYZ, 2, 2)); return p.isZero() ? Poly.c(XYZ, 1) : p; }), rs4 = [Poly.of(TV, [[1, { t: 1 }]]), Poly.of(TV, [[1, { t: 2 }]]), Poly.of(TV, [[1, { t: 3 }]])], W4 = workPoly(F4, XYZ, rs4, 0, 1);
    return { q: 'Find $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ for $\\mathbf{F}(x, y, z) = ' + fieldTex(F4) + '$ along the twisted cubic $\\mathbf{r}(t) = \\langle t, t^2, t^3 \\rangle$, $0 \\le t \\le 1$.', a: { t: 'num', v: W4.val.toPlain() },
      steps: ['$\\mathbf{r}\'(t) = \\langle 1, 2t, 3t^2 \\rangle$.', '$\\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}\'(t) = ' + W4.g.toTex() + '$.', '$\\int_0^1 \\left(' + W4.g.toTex() + '\\right) dt = ' + W4.val.toTex() + '$.'],
      hint: 'Substitute $x = t$, $y = t^2$, $z = t^3$ into $\\mathbf{F}$, then dot with $\\mathbf{r}\'(t)$.', chk: { k: 'work', F: fieldPlain(F4), r: ['t', 't^2', 't^3'], t: [0, 1] } };
  });

  function formTex(F, ds) { var out = ''; F.forEach(function (c, i) { var t = c.toTex(), one = c.terms().length > 1, d = '\\,' + ds[i], piece;
      if (one) piece = '\\left(' + t + '\\right)' + d; else if (t === '1') piece = ds[i]; else if (t === '-1') piece = '-' + ds[i]; else piece = t + d;
      out += i === 0 ? piece : piece[0] === '-' ? ' - ' + piece.slice(1) : ' + ' + piece; }); return out; }
  G('calc4.differential-form', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['graph', 'segs', 'graph'], ['graph', 'segs', 'xdy'], ['segs', 'three', 'graph', 'xdy']));
    if (kind === 'graph') {
      var F = polyF2(R, 2), g = Poly.of(['x'], [[R.nz(-2, 2), { x: R.int(2, 3) }], [R.int(-2, 2), { x: 1 }]]), a = R.int(0, 1), b = a + R.int(1, 2), gt = g.substAll({ __vars: TV, x: tP });
      var W = workPoly(F, XY, [tP, gt], a, b), dg = g.d('x');
      return { q: 'Evaluate $\\displaystyle\\int_C ' + formTex(F, ['dx', 'dy']) + '$ where $C$ is the curve $y = ' + g.toTex() + '$ from $x = ' + a + '$ to $x = ' + b + '$.', a: { t: 'num', v: W.val.toPlain() },
        steps: ['Use $x$ as the parameter: $y = ' + g.toTex() + '$ and $dy = ' + dg.texParen() + '\\,dx$.', 'Substitute: the integrand becomes $\\left(' + W.g.substAll({ __vars: ['x'], t: Poly.v(['x'], 'x') }).toTex() + '\\right) dx$.', 'Integrate from $x = ' + a + '$ to $' + b + '$: $' + W.val.toTex() + '$.'],
        hint: 'Replace $y$ by the curve and $dy$ by $y\'(x)\\,dx$; then it is an ordinary integral in $x$.', chk: { k: 'work', F: fieldPlain(F), r: ['t', gt.toPlain()], t: [a, b] } };
    }
    if (kind === 'segs') {
      var F2 = polyF2(R, 2), A = [0, 0], c = R.nz(-3, 3), d = R.nz(-3, 3), mid = [c, 0], B = [c, d];
      var W1 = workPoly(F2, XY, segParam(A, mid), 0, 1), W2 = workPoly(F2, XY, segParam(mid, B), 0, 1), tot = W1.val.add(W2.val);
      return { q: 'Evaluate $\\displaystyle\\int_C ' + formTex(F2, ['dx', 'dy']) + '$ where $C$ goes along straight segments from $(0, 0)$ to $' + ptTex(mid) + '$ and then to $' + ptTex(B) + '$.', a: { t: 'num', v: tot.toPlain() },
        steps: ['First piece: $y = 0$ and $dy = 0$, $x$ from $0$ to $' + c + '$: $\\int_0^{' + c + '} ' + F2[0].subst('y', 0).texParen() + '\\,dx = ' + W1.val.toTex() + '$.', 'Second piece: $x = ' + c + '$ and $dx = 0$, $y$ from $0$ to $' + d + '$: $\\int_0^{' + d + '} ' + F2[1].subst('x', c).texParen() + '\\,dy = ' + W2.val.toTex() + '$.', 'Add the pieces: $' + W1.val.toTex() + ' + ' + pf(W2.val) + ' = ' + tot.toTex() + '$.'],
        hint: 'On a horizontal piece $dy = 0$; on a vertical piece $dx = 0$. Integrate each piece in the direction of travel.', chk: { k: 'segs', F: fieldPlain(F2), pts: [A, mid, B] }, nolint: ['+ 0'] };
    }
    if (kind === 'xdy') {
      var Rr = R.int(1, 4), arc = R.pick([[0, 4], [0, 2]]), half = arc[1] === 2, val = Q(Rr * Rr * (half ? 1 : 2));
      return { q: 'Evaluate $\\displaystyle\\int_C x\\,dy - y\\,dx$ where $C$ is ' + arcName(arc[0], arc[1]) + ' $x^2 + y^2 = ' + Rr * Rr + '$, counterclockwise.', a: { t: 'num', v: piPlain(val) },
        steps: ['$x = ' + T.coef(Rr, '\\cos\\theta') + '$, $y = ' + T.coef(Rr, '\\sin\\theta') + '$: $dx = ' + T.coef(-Rr, '\\sin\\theta') + '\\,d\\theta$, $dy = ' + T.coef(Rr, '\\cos\\theta') + '\\,d\\theta$.', '$x\\,dy - y\\,dx = ' + Rr * Rr + '(\\cos^2\\theta + \\sin^2\\theta)\\,d\\theta = ' + Rr * Rr + '\\,d\\theta$.', 'Over $' + thetaRange(arc[0], arc[1]) + '$: $' + piTex(val) + '$.'],
        hint: 'Substitute the circle; $\\cos^2\\theta + \\sin^2\\theta = 1$ does the rest.', chk: { k: 'work', F: ['-y', 'x'], r: [Rr + '*cos(t)', Rr + '*sin(t)'], t: [0, arc[1] / 2], pi: true } };
    }
    var F3 = [0, 1, 2].map(function () { var p = new Poly(XYZ).add(rmono(R, XYZ, 1, 3)).add(rmono(R, XYZ, 1, 2)); return p.isZero() ? Poly.c(XYZ, 1) : p; }), A3 = randPt(R, -2, 2), B3 = vadd(A3, nzVec(R, -2, 2)), rs3 = segParam(A3, B3), W3 = workPoly(F3, XYZ, rs3, 0, 1);
    return { q: 'Evaluate $\\displaystyle\\int_C ' + formTex(F3, ['dx', 'dy', 'dz']) + '$ along the segment from $' + ptTex(A3) + '$ to $' + ptTex(B3) + '$.', a: { t: 'num', v: W3.val.toPlain() },
      steps: ['$x = ' + rs3[0].toTex() + '$, $y = ' + rs3[1].toTex() + '$, $z = ' + rs3[2].toTex() + '$ for $0 \\le t \\le 1$, so $dx$, $dy$, $dz$ are $' + vsub(B3, A3).map(qt).join('\\,dt$, $') + '\\,dt$.', 'The integrand becomes $\\left(' + W3.g.toTex() + '\\right) dt$.', 'Integrate: $' + W3.val.toTex() + '$.'],
      hint: 'Write $x$, $y$, $z$ and their differentials in terms of $t$.', chk: { k: 'work', F: fieldPlain(F3), r: rs3.map(function (p) { return p.toPlain(); }), t: [0, 1] }, nolint: ['+ 0'] };
  });

  G('calc4.circulation-flux-curves', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['flux', 'circ', 'which'], ['flux', 'circ', 'seg', 'which'], ['flux', 'seg', 'square', 'circ']));
    var lin = function () { return [Poly.of(XY, [[R.int(-3, 3), { x: 1 }], [R.int(-3, 3), { y: 1 }], [R.int(-2, 2), {}]]), Poly.of(XY, [[R.int(-3, 3), { x: 1 }], [R.int(-3, 3), { y: 1 }], [R.int(-2, 2), {}]])]; };
    if (kind === 'which') { var right = '$\\oint_C P\\,dy - Q\\,dx$';
      return { q: 'For a closed curve $C$ traced counterclockwise and $\\mathbf{F} = \\langle P, Q \\rangle$, which integral is the outward flux $\\oint_C \\mathbf{F} \\cdot \\mathbf{n}\\,ds$?', a: mc(R, right, ['$\\oint_C P\\,dx + Q\\,dy$', '$\\oint_C Q\\,dx - P\\,dy$', '$\\oint_C P\\,dx - Q\\,dy$']),
        steps: ['The tangent step is $d\\mathbf{r} = \\langle dx, dy \\rangle$. Turning it a quarter turn clockwise points out of a counterclockwise curve: $\\mathbf{n}\\,ds = \\langle dy, -dx \\rangle$.', 'So $\\mathbf{F} \\cdot \\mathbf{n}\\,ds = P\\,dy - Q\\,dx$.', '$\\oint P\\,dx + Q\\,dy$ is the circulation (it uses the tangent), and $\\oint Q\\,dx - P\\,dy$ is the inward flux.'],
        hint: 'Rotate $\\langle dx, dy \\rangle$ to get an outward normal.', chk: { k: 'which', ans: right } }; }
    if (kind === 'flux' || kind === 'circ') {
      var F = lin(), h = R.int(-2, 2), k = R.int(-2, 2), Rr = R.int(1, 3), flux = kind === 'flux', W = workCircle(F, h, k, Rr, 0, 4, flux);
      return { q: 'Find the ' + (flux ? 'outward flux $\\oint_C \\mathbf{F} \\cdot \\mathbf{n}\\,ds$' : 'circulation $\\oint_C \\mathbf{F} \\cdot \\mathbf{T}\\,ds$') + ' of $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$ around the circle $C$ with center $' + ptTex([h, k]) + '$ and radius $' + Rr + '$ (counterclockwise).', a: { t: 'num', v: rpPlain(W.val) },
        steps: [flux ? 'Outward flux: $\\oint P\\,dy - Q\\,dx$ (the normal $\\langle dy, -dx \\rangle$ points out of a counterclockwise curve).' : 'Circulation: $\\oint P\\,dx + Q\\,dy$ (the tangential part of $\\mathbf{F}$ added around the loop).', 'Parametrize: $x = ' + T.lin(Rr, '\\cos\\theta', h) + '$, $y = ' + T.lin(Rr, '\\sin\\theta', k) + '$, $0 \\le \\theta \\le 2\\pi$.', 'The integrand becomes $' + W.g.toTex() + '$.', 'Over a full turn, $\\cos\\theta$, $\\sin\\theta$ and $\\sin\\theta\\cos\\theta$ average to $0$ and $\\cos^2\\theta$, $\\sin^2\\theta$ give $\\pi$ each: the total is $' + rpTex(W.val) + '$.'],
        hint: flux ? 'Flux uses the normal: $\\oint P\\,dy - Q\\,dx$.' : 'Circulation uses the tangent: $\\oint P\\,dx + Q\\,dy$.', chk: { k: flux ? 'flux' : 'circ', F: fieldPlain(F), h: h, kk: k, R: Rr } };
    }
    if (kind === 'seg') {
      var F2 = polyF2(R, 1), A = [R.int(-2, 2), R.int(-2, 2)], B = [A[0] + R.nz(-3, 3), A[1] + R.nz(-3, 3)], rs = segParam(A, B), m = rMap(XY, rs), g = F2[0].substAll(m).mul(rs[1].d('t')).sub(F2[1].substAll(m).mul(rs[0].d('t'))), val = g.defint('t', 0, 1).cval();
      return { q: 'Find the flux of $\\mathbf{F}(x, y) = ' + fieldTex(F2) + '$ across the segment from $' + ptTex(A) + '$ to $' + ptTex(B) + '$, with the normal pointing to the right of the direction of travel: $\\int_C \\mathbf{F} \\cdot \\mathbf{n}\\,ds = \\int_C P\\,dy - Q\\,dx$.', a: { t: 'num', v: val.toPlain() },
        steps: ['$\\mathbf{r}(t) = \\left\\langle ' + rs.map(function (p) { return p.toTex(); }).join(', ') + ' \\right\\rangle$: $dx = ' + qt(B[0] - A[0]) + '\\,dt$, $dy = ' + qt(B[1] - A[1]) + '\\,dt$.', '$P\\,dy - Q\\,dx = \\left(' + g.toTex() + '\\right) dt$.', '$\\int_0^1 \\left(' + g.toTex() + '\\right) dt = ' + val.toTex() + '$.'],
        hint: 'Flux across a curve uses $\\langle dy, -dx \\rangle$, not $\\langle dx, dy \\rangle$.', chk: { k: 'fluxseg', F: fieldPlain(F2), A: A, B: B } };
    }
    var F3 = polyF2(R, 2), s = R.int(1, 3), pts = [[0, 0], [s, 0], [s, s], [0, s]], tot = Q(0);
    for (var i = 0; i < 4; i++) tot = tot.add(workPoly(F3, XY, segParam(pts[i], pts[(i + 1) % 4]), 0, 1).val);
    return { q: 'Find the circulation of $\\mathbf{F}(x, y) = ' + fieldTex(F3) + '$ around the boundary of the square $[0, ' + s + '] \\times [0, ' + s + ']$, counterclockwise.', a: { t: 'num', v: tot.toPlain() },
      steps: ['Go around the four sides: bottom ($y = 0$, $x: 0 \\to ' + s + '$), right ($x = ' + s + '$, $y: 0 \\to ' + s + '$), top ($y = ' + s + '$, $x: ' + s + ' \\to 0$), left ($x = 0$, $y: ' + s + ' \\to 0$).', 'On horizontal sides only $P\\,dx$ counts; on vertical sides only $Q\\,dy$.', 'Adding the four pieces gives $' + tot.toTex() + '$.'],
      hint: 'Do the four sides separately; keep the direction of travel on each.', chk: { k: 'square', F: fieldPlain(F3), s: s } };
  });

  G('calc4.ftc-line-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['value', 'value', 'which'], ['value', 'which', 'closed'], ['value', 'exp', 'which']));
    if (kind === 'which') { var right = '$\\langle 2xy, x^2 \\rangle$, which is $\\nabla(x^2y)$';
      return { q: 'For which field can $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ be found from the endpoints of $C$ alone (by the fundamental theorem for line integrals)?', a: mc(R, right, ['$\\langle y, -x \\rangle$', '$\\langle x^2, xy \\rangle$', '$\\langle y^2, x \\rangle$']),
        steps: ['The theorem needs $\\mathbf{F} = \\nabla f$ for some $f$.', '$\\langle 2xy, x^2 \\rangle = \\nabla(x^2y)$, so $\\int_C \\mathbf{F} \\cdot d\\mathbf{r} = f(B) - f(A)$.', 'The others fail the test $P_y = Q_x$: for $\\langle y, -x \\rangle$, $P_y = 1$ but $Q_x = -1$; for $\\langle x^2, xy \\rangle$, $P_y = 0$ but $Q_x = y$; for $\\langle y^2, x \\rangle$, $P_y = 2y$ but $Q_x = 1$.'],
        hint: 'Look for a field that is the gradient of something.', chk: { k: 'which', ans: right } }; }
    if (kind === 'closed') { var f0 = Poly.of(XY, [[R.nz(-3, 3), { x: 2, y: 1 }], [R.nz(-3, 3), { y: 2 }]]), F0 = [f0.d('x'), f0.d('y')];
      return { q: 'Evaluate $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r}$ for $\\mathbf{F} = ' + fieldTex(F0) + '$, where $C$ is the ellipse $\\frac{x^2}{4} + \\frac{y^2}{9} = 1$ traced once counterclockwise.', a: { t: 'num', v: '0' },
        steps: ['$\\mathbf{F} = \\nabla f$ with $f = ' + f0.toTex() + '$ (check: $f_x = ' + f0.d('x').toTex() + '$, $f_y = ' + f0.d('y').toTex() + '$).', 'A closed curve starts and ends at the same point $A$, so the integral is $f(A) - f(A) = 0$.'],
        hint: 'Is $\\mathbf{F}$ a gradient? Where does a closed curve end?', chk: { k: 'closed', F: fieldPlain(F0) } }; }
    var vars = L > 2 && kind === 'value' && R.coin() ? XYZ : XY, f = new Poly(vars); f = f.add(rmono(R, vars, 2, 3)).add(rmono(R, vars, 3, 2)).add(Poly.of(vars, [[R.nz(-2, 2), vars.length === 3 ? { x: 1, z: 1 } : { x: 1, y: 1 }]]));
    var fE = Ex.poly(f), A, B, curve, rsT;
    if (kind === 'exp') { var c = R.nz(-2, 2), aa = R.nz(-2, 2), bb = R.nz(-2, 2); fE = fE.add(E2.exp(Poly.of(XY, [[1, { x: 1, y: 1 }]]), c)); A = [0, aa]; B = [bb, 0]; }
    else { A = vars.map(function () { return R.int(-2, 2); }); B = vars.map(function () { return R.int(-2, 2); }); if (A.join() === B.join()) B[0] += 1; }
    // a wiggly path from A to B: r(t) = A + t(B - A) + t(1 - t)·w
    var w = vars.map(function () { return R.nz(-3, 3); }), rs = A.map(function (a, i) { return Poly.of(TV, [[q(B[i]).sub(a).add(w[i]), { t: 1 }], [-w[i], { t: 2 }], [a, {}]]); });
    var fA = fE.at(envPt(vars, A)), fB = fE.at(envPt(vars, B)), val = fB.sub(fA), F = vars.map(function (v) { return fE.d(v); });
    return { q: 'Let $\\mathbf{F} = ' + '\\left\\langle ' + F.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle$, which is $\\nabla f$ for $f = ' + fE.toTex() + '$. Find $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ along $\\mathbf{r}(t) = \\left\\langle ' + rs.map(function (p) { return p.toTex(); }).join(', ') + ' \\right\\rangle$, $0 \\le t \\le 1$.', a: { t: 'num', v: val.toPlain() },
      steps: ['$\\mathbf{F}$ is a gradient, so only the endpoints matter: $\\int_C \\nabla f \\cdot d\\mathbf{r} = f(\\mathbf{r}(1)) - f(\\mathbf{r}(0))$.', 'Endpoints: $\\mathbf{r}(0) = ' + ptTex(A) + '$ and $\\mathbf{r}(1) = ' + ptTex(B) + '$.', '$f' + ptTex(B) + ' = ' + fB.toTex() + '$ and $f' + ptTex(A) + ' = ' + fA.toTex() + '$.', 'Answer: $' + fB.toTex() + ' - ' + pf(fA) + ' = ' + val.toTex() + '$. No parametrization integral needed.'],
      hint: 'Find where the curve starts and ends, and evaluate $f$ there.', chk: { k: 'ftc', F: F.map(function (c) { return c.toPlain(); }), r: rs.map(function (p) { return p.toPlain(); }), vars: vars } };
  });

  G('calc4.conservative-test', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['tf2', 'k', 'tf2'], ['tf2', 'k', 'tf3', 'hole'], ['tf3', 'k', 'hole', 'tf3']));
    if (kind === 'hole') { var right = 'No: its circulation around the unit circle is $2\\pi$, not $0$';
      return { q: 'The field $\\mathbf{F} = \\left\\langle \\frac{-y}{x^2 + y^2}, \\frac{x}{x^2 + y^2} \\right\\rangle$ satisfies $Q_x = P_y$ at every point where it is defined (everywhere except the origin). Is it conservative on the plane without the origin?', a: mc(R, right, ['Yes: $Q_x = P_y$ everywhere it is defined', 'Yes: every field with zero curl is conservative', 'It cannot be decided']),
        steps: ['On the unit circle $\\mathbf{F} = \\langle -\\sin\\theta, \\cos\\theta \\rangle$ and $d\\mathbf{r} = \\langle -\\sin\\theta, \\cos\\theta \\rangle d\\theta$, so $\\oint \\mathbf{F} \\cdot d\\mathbf{r} = \\int_0^{2\\pi} 1\\,d\\theta = 2\\pi$.', 'A conservative field has zero circulation around every closed curve, so this field is not conservative.', 'The test $Q_x = P_y$ guarantees a potential only on a simply connected region (no holes). The missing origin is a hole, and the loop goes around it.'],
        hint: 'Compute the circulation around the unit circle.', chk: { k: 'hole', ans: right } }; }
    if (kind === 'tf3') {
      var f3 = new Poly(XYZ).add(rmono(R, XYZ, 2, 3)).add(rmono(R, XYZ, 2, 3)).add(Poly.of(XYZ, [[R.nz(-2, 2), { x: 1, y: 1, z: 1 }]])), F3 = XYZ.map(function (v) { return f3.d(v); }), ok3 = R.coin();
      if (!ok3) F3[2] = F3[2].add(Poly.of(XYZ, [[R.nz(-2, 2), { x: 1 }]]));
      var Fe = F3.map(Ex.poly), cr = curlEx(Fe), crT = cr.map(function (c) { return c.toTex(); });
      return { q: 'Is this field conservative on all of space? $$\\mathbf{F}(x, y, z) = ' + fieldTex(F3) + '$$', a: { t: 'tf', v: ok3 },
        steps: ['All of space has no holes, so $\\mathbf{F}$ is conservative exactly when $\\nabla \\times \\mathbf{F} = \\mathbf{0}$.', '$\\nabla \\times \\mathbf{F} = \\langle R_y - Q_z, P_z - R_x, Q_x - P_y \\rangle = \\langle ' + crT.join(', ') + ' \\rangle$.', ok3 ? 'Every component is $0$: conservative.' : 'Not all components are $0$: not conservative.'],
        hint: 'Compute the curl.', chk: { k: 'tf3', F: fieldPlain(F3) } };
    }
    var f = new Poly(XY).add(rmono(R, XY, 3, 3)).add(rmono(R, XY, 2, 3)).add(Poly.of(XY, [[R.nz(-3, 3), { x: R.int(1, 3), y: R.int(1, 2) }]])), F = [f.d('x'), f.d('y')];
    if (kind === 'k') {
      var mixed = f.terms().filter(function (t) { return t[1][0] && t[1][1]; })[0];
      if (!mixed) { f = f.add(Poly.of(XY, [[2, { x: 1, y: 1 }]])); F = [f.d('x'), f.d('y')]; mixed = f.terms().filter(function (t) { return t[1][0] && t[1][1]; })[0]; } // the random terms cancelled the mixed one
      var c = mixed[0], p = mixed[1][0], qq = mixed[1][1], kval = c.mul(qq), hiddenTerm = Poly.mono(XY, kval, [p, qq - 1]);
      var Qrest = F[1].sub(hiddenTerm), Qtex = T.terms([[1, 'k' + (p ? (p === 1 ? 'x' : 'x^{' + p + '}') : '') + (qq - 1 ? (qq - 1 === 1 ? 'y' : 'y^{' + (qq - 1) + '}') : '')]]) + (Qrest.isZero() ? '' : (Qrest.toTex()[0] === '-' ? ' - ' + Qrest.toTex().slice(1) : ' + ' + Qrest.toTex()));
      return { q: 'Find the constant $k$ that makes $\\mathbf{F}(x, y) = \\left\\langle ' + F[0].toTex() + ', ' + Qtex + ' \\right\\rangle$ conservative.', a: { t: 'num', v: kval.toPlain() },
        steps: ['On the whole plane, $\\mathbf{F}$ is conservative exactly when $P_y = Q_x$.', '$P_y = ' + F[0].d('y').toTex() + '$.', '$Q_x$ contains $' + T.coef(p, 'k' + (p > 1 ? 'x^{' + (p - 1) + '}' : '') + (qq - 1 ? (qq - 1 === 1 ? 'y' : 'y^{' + (qq - 1) + '}') : '')) + '$ plus $' + Qrest.d('x').toTex() + '$.', 'Matching the terms gives $k = ' + kval.toTex() + '$.'],
        hint: 'Set $P_y = Q_x$ and compare the matching terms.', chk: { k: 'k', P: F[0].toPlain(), Qrest: Qrest.toPlain(), p: p, q: qq } };
    }
    var ok = R.coin(); if (!ok) F[1] = F[1].add(Poly.of(XY, [[R.nz(-3, 3), { x: R.int(1, 2), y: R.int(0, 1) }]]));
    return { q: 'Is $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$ conservative on the whole plane?', a: { t: 'tf', v: ok },
      steps: ['The plane is simply connected, so $\\mathbf{F}$ is conservative exactly when $P_y = Q_x$.', '$P_y = ' + F[0].d('y').toTex() + '$ and $Q_x = ' + F[1].d('x').toTex() + '$.', ok ? 'They are equal: conservative.' : 'They differ: not conservative.'],
      hint: 'Compare $P_y$ with $Q_x$.', chk: { k: 'tf2', F: fieldPlain(F) } };
  });

  G('calc4.find-potential', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['pot2', 'pot2', 'use'], ['pot2', 'pot3', 'use'], ['pot2e', 'pot3', 'use', 'pot2e']));
    var vars = kind === 'pot3' ? XYZ : XY, f = new Poly(vars).add(rmono(R, vars, 2, 3)).add(rmono(R, vars, 3, 3)).add(Poly.of(vars, [[R.nz(-3, 3), vars.length === 3 ? { x: 1, y: R.int(0, 1), z: 1 } : { x: R.int(1, 2), y: R.int(1, 2) }]]));
    f = f.sub(f.at({})); if (f.isZero()) f = Poly.of(vars, [[2, { x: 1, y: 1 }]]);
    var fE = Ex.poly(f); if (kind === 'pot2e') { var c = R.nz(-3, 3); fE = fE.add(E2.exp(Poly.of(XY, [[1, { x: 1, y: 1 }]]), c)).add(Ex.c(XY, -c)); }
    var F = vars.map(function (v) { return fE.d(v); }), Ft = '\\left\\langle ' + F.map(function (x) { return x.toTex(); }).join(', ') + ' \\right\\rangle';
    if (kind === 'use') {
      var A = [R.int(-2, 2), R.int(-2, 2)], B = [R.int(-2, 2), R.int(-2, 2)]; if (A.join() === B.join()) B[1] += 1;
      var val = fE.at(envPt(XY, B)).sub(fE.at(envPt(XY, A)));
      return { q: '$\\mathbf{F}(x, y) = ' + Ft + '$ is conservative. Find a potential function and use it to compute the work done by $\\mathbf{F}$ along any path from $' + ptTex(A) + '$ to $' + ptTex(B) + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['Integrate $P$ in $x$, holding $y$ fixed. The "constant" of integration can be any function $g(y)$.', 'Differentiate in $y$ and compare with $Q$ to find $g(y)$: $f(x, y) = ' + fE.toTex() + '$.', 'Work $= f' + ptTex(B) + ' - f' + ptTex(A) + ' = ' + fE.at(envPt(XY, B)).toTex() + ' - ' + pf(fE.at(envPt(XY, A))) + ' = ' + val.toTex() + '$.'],
        hint: 'Once you have $f$, the work is $f(\\text{end}) - f(\\text{start})$.', chk: { k: 'use', F: F.map(function (x) { return x.toPlain(); }), A: A, B: B } };
    }
    var Px = F[0], intP = kind === 'pot2e' ? null : f.terms().filter(function (t) { return t[1][0]; }).reduce(function (acc, t) { return acc.add(Poly.mono(vars, t[0], t[1])); }, new Poly(vars));
    var steps = ['Integrate the first component in $x$, treating the other variable' + (vars.length > 2 ? 's' : '') + ' as constant: $f = \\int P\\,dx = ' + (intP ? intP.toTex() : 'x\\text{-terms}') + ' + g(' + vars.slice(1).join(', ') + ')$.',
      'Differentiate that in $y$ and compare with $Q = ' + F[1].toTex() + '$: whatever is missing must come from $g$.' + (vars.length > 2 ? ' Then do the same with $z$ and $R$.' : ''),
      'Result (with the constant chosen so that $f(' + vars.map(function () { return '0'; }).join(', ') + ') = 0$): $f = ' + fE.toTex() + '$.',
      'Check: $\\nabla f$ gives back every component of $\\mathbf{F}$.'];
    return { q: 'Find the potential function $f$ with $\\nabla f = \\mathbf{F}$ and $f(' + vars.map(function () { return '0'; }).join(', ') + ') = 0$, where $\\mathbf{F}(' + vars.join(', ') + ') = ' + Ft + '$.', a: { t: 'expr', v: fE.toPlain(), vars: vars },
      steps: steps, hint: 'Integrate one component, then use the next component to find the "constant", which may depend on the other variables.', chk: { k: 'pot', F: F.map(function (x) { return x.toPlain(); }), vars: vars } };
  });

  G('calc4.path-independence', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['cons', 'loop', 'cons'], ['cons', 'compare', 'loop'], ['compare', 'cons', 'compare']));
    if (kind === 'compare') {
      var F = polyF2(R, 2), A = [0, 0], B = [R.nz(-2, 2), R.nz(-2, 2)], C = [B[0], 0];
      if (F[0].d('y').sub(F[1].d('x')).isZero()) F[1] = F[1].add(Poly.of(XY, [[1, { x: 1 }]]));
      var W1 = workPoly(F, XY, segParam(A, B), 0, 1).val, W2 = workPoly(F, XY, segParam(A, C), 0, 1).val.add(workPoly(F, XY, segParam(C, B), 0, 1).val), same = W1.eq(W2);
      return { q: 'For $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$, compute the work from $(0, 0)$ to $' + ptTex(B) + '$ along (1) the straight segment, and (2) the path $(0, 0) \\to ' + ptTex(C) + ' \\to ' + ptTex(B) + '$.', a: { t: 'multi', parts: [{ label: '(1)', a: { t: 'num', v: W1.toPlain() } }, { label: '(2)', a: { t: 'num', v: W2.toPlain() } }] },
        steps: ['(1) $\\mathbf{r}(t) = t' + vTex(B) + '$, $0 \\le t \\le 1$: the work is $' + W1.toTex() + '$.', '(2) Along the $x$-axis ($dy = 0$) then up the vertical line ($dx = 0$): $' + W2.toTex() + '$.', same ? 'The two happen to agree here.' : 'The two paths give different work, so this field is not path independent (and indeed $P_y = ' + F[0].d('y').toTex() + '$ differs from $Q_x = ' + F[1].d('x').toTex() + '$).'],
        hint: 'Parametrize each piece; on horizontal pieces only $P\\,dx$ counts, on vertical pieces only $Q\\,dy$.', chk: { k: 'compare', F: fieldPlain(F), B: B } };
    }
    var f = new Poly(XY).add(rmono(R, XY, 2, 3)).add(rmono(R, XY, 3, 2)).add(Poly.of(XY, [[R.nz(-2, 2), { x: 1, y: 1 }]])), F2 = [f.d('x'), f.d('y')];
    if (kind === 'loop') { var s = R.int(1, 3);
      return { q: 'Find the work done by $\\mathbf{F}(x, y) = ' + fieldTex(F2) + '$ around the triangle $(0, 0) \\to (' + s + ', 0) \\to (0, ' + s + ') \\to (0, 0)$.', a: { t: 'num', v: '0' },
        steps: ['$P_y = ' + F2[0].d('y').toTex() + ' = Q_x$ on the whole plane, so $\\mathbf{F}$ is conservative: $\\mathbf{F} = \\nabla f$ with $f = ' + f.toTex() + '$.', 'Around any closed path the work is $f(\\text{end}) - f(\\text{start}) = 0$, because the end is the start.'],
        hint: 'Is the field conservative? Where does the path end?', chk: { k: 'loop', F: fieldPlain(F2), s: s } }; }
    var A2 = [R.int(-2, 2), R.int(-2, 2)], B2 = [R.int(-2, 2), R.int(-2, 2)], M2 = [R.int(-3, 3), R.int(-3, 3)]; if (A2.join() === B2.join()) B2[0] += 2;
    var val = f.at(envPt(XY, B2)).sub(f.at(envPt(XY, A2)));
    return { q: 'Find the work done by $\\mathbf{F}(x, y) = ' + fieldTex(F2) + '$ along the broken path $' + ptTex(A2) + ' \\to ' + ptTex(M2) + ' \\to ' + ptTex(B2) + '$.', a: { t: 'num', v: val.toPlain() },
      steps: ['$P_y = ' + F2[0].d('y').toTex() + '$ and $Q_x = ' + F2[1].d('x').toTex() + '$ agree everywhere, so $\\mathbf{F}$ is conservative and the path does not matter.', 'A potential: $f = ' + f.toTex() + '$.', 'Work $= f' + ptTex(B2) + ' - f' + ptTex(A2) + ' = ' + val.toTex() + '$, whatever route is taken.'],
      hint: 'Check $P_y = Q_x$; if so, only the endpoints matter.', chk: { k: 'cons', F: fieldPlain(F2), pts: [A2, M2, B2] } };
  });


  // ===================================================================== g4_3greens.js
  // ---------- calc4 unit: Green's Theorem ----------
  // regions: {type: 'rect', a0, a1, b0, b1} | {type: 'tri', s} (vertices (0,0), (s,0), (0,s)) | {type: 'disk', R}
  function regionTex(rg) {
    if (rg.type === 'rect') return 'the rectangle $[' + rg.a0 + ', ' + rg.a1 + '] \\times [' + rg.b0 + ', ' + rg.b1 + ']$';
    if (rg.type === 'tri') return 'the triangle with vertices $(0, 0)$, $(' + rg.s + ', 0)$ and $(0, ' + rg.s + ')$';
    return 'the disk $x^2 + y^2 \\le ' + rg.R * rg.R + '$';
  }
  function curveTex(rg) { return rg.type === 'disk' ? 'the circle $x^2 + y^2 = ' + rg.R * rg.R + '$' : 'the boundary of ' + regionTex(rg); }
  function randRegion(R, types) {
    var t = R.pick(types);
    if (t === 'rect') { var a0 = R.int(-1, 1), b0 = R.int(-1, 1); return { type: 'rect', a0: a0, a1: a0 + R.int(1, 3), b0: b0, b1: b0 + R.int(1, 3) }; }
    if (t === 'tri') return { type: 'tri', s: R.int(1, 3) };
    return { type: 'disk', R: R.int(1, 3) };
  }
  // ∬ over the region of a polynomial g(x, y): {r, p} (value r + pπ) plus a TeX line for the steps
  function regionInt(g, rg) {
    if (rg.type === 'rect') { var inner = g.defint('y', rg.b0, rg.b1), v = inner.defint('x', rg.a0, rg.a1).cval();
      return { v: { r: v, p: Q(0) }, how: '$\\int_{' + rg.a0 + '}^{' + rg.a1 + '} \\int_{' + rg.b0 + '}^{' + rg.b1 + '} ' + g.texParen() + '\\,dy\\,dx = \\int_{' + rg.a0 + '}^{' + rg.a1 + '} ' + inner.texParen() + '\\,dx = ' + v.toTex() + '$' }; }
    if (rg.type === 'tri') { var top = Poly.of(XY, [[rg.s, {}], [-1, { x: 1 }]]), in2 = g.defint('y', Poly.c(XY, 0), top), v2 = in2.defint('x', 0, rg.s).cval();
      return { v: { r: v2, p: Q(0) }, how: '$\\int_0^{' + rg.s + '} \\int_0^{' + top.toTex() + '} ' + g.texParen() + '\\,dy\\,dx = \\int_0^{' + rg.s + '} ' + in2.texParen() + '\\,dx = ' + v2.toTex() + '$' }; }
    var gp = toPolar(g), v3 = polarInt(gp, 0, rg.R, 0, 4);
    return { v: v3, how: 'In polar coordinates: $\\int_0^{2\\pi} \\int_0^{' + rg.R + '} \\left(' + gp.toTex() + '\\right) r\\,dr\\,d\\theta = ' + rpTex(v3) + '$' };
  }
  function regionChk(rg) { return rg; }
  function rpNeg(v) { return { r: q(v.r).neg(), p: q(v.p).neg() }; }

  G('calc4.greens-circulation', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['rect', 'which', 'tri'], ['rect', 'tri', 'disk', 'cw'], ['tri', 'disk', 'cw', 'disk']));
    if (kind === 'which') { var right = '$\\displaystyle\\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA$';
      return { q: 'Let $C$ be the boundary of a region $D$, traced counterclockwise, and $\\mathbf{F} = \\langle P, Q \\rangle$. Which double integral equals the circulation $\\oint_C P\\,dx + Q\\,dy$?', a: mc(R, right, ['$\\displaystyle\\iint_D \\left(\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y}\\right) dA$', '$\\displaystyle\\iint_D \\left(\\frac{\\partial P}{\\partial y} - \\frac{\\partial Q}{\\partial x}\\right) dA$', '$\\displaystyle\\iint_D \\left(\\frac{\\partial Q}{\\partial y} - \\frac{\\partial P}{\\partial x}\\right) dA$']),
        steps: ['Circulation adds up spin, and the spin density in the plane is the scalar curl $Q_x - P_y$.', 'Green\'s theorem: $\\oint_C P\\,dx + Q\\,dy = \\iint_D (Q_x - P_y)\\,dA$ for a counterclockwise boundary.', '$P_x + Q_y$ (divergence) belongs to the flux form, and the reversed difference has the wrong sign.'],
        hint: 'Circulation goes with curl: which combination is $Q_x - P_y$?', chk: { k: 'which', ans: right } }; }
    var F = polyF2(R, 2), rg = randRegion(R, kind === 'disk' ? ['disk'] : kind === 'tri' ? ['tri'] : kind === 'cw' ? ['rect', 'tri', 'disk'] : ['rect']);
    if (rg.type === 'disk' && F[1].d('x').sub(F[0].d('y')).isZero()) F[1] = F[1].add(Poly.of(XY, [[R.nz(-3, 3), { x: 1 }]]));
    var g = F[1].d('x').sub(F[0].d('y')), I = regionInt(g, rg), cw = kind === 'cw', val = cw ? rpNeg(I.v) : I.v;
    return { q: 'Use Green\'s theorem to find $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r}$ for $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$, where $C$ is ' + curveTex(rg) + ', traced ' + (cw ? '<b>clockwise</b>' : 'counterclockwise') + '.', a: { t: 'num', v: rpPlain(val) },
      steps: ['Green\'s theorem: $\\oint_C P\\,dx + Q\\,dy = \\iint_D (Q_x - P_y)\\,dA$ when $C$ goes counterclockwise around $D$.', '$Q_x = ' + F[1].d('x').toTex() + '$ and $P_y = ' + F[0].d('y').toTex() + '$, so $Q_x - P_y = ' + g.toTex() + '$.', I.how + '.'].concat(cw ? ['The curve runs clockwise, the negative orientation, so the answer changes sign: $' + rpTex(val) + '$.'] : []),
      hint: 'Compute $Q_x - P_y$ and integrate it over the region' + (cw ? '; then account for the direction.' : '.'), chk: { k: 'circ', F: fieldPlain(F), rg: rg, cw: cw } };
  });

  G('calc4.greens-flux', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['rect', 'which', 'rect'], ['rect', 'tri', 'disk'], ['tri', 'disk', 'zero', 'disk']));
    if (kind === 'which') { var right = '$\\displaystyle\\iint_D \\left(\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y}\\right) dA$';
      return { q: 'Let $C$ be the counterclockwise boundary of $D$ and $\\mathbf{n}$ the outward unit normal. Which double integral equals the outward flux $\\oint_C \\mathbf{F} \\cdot \\mathbf{n}\\,ds$ of $\\mathbf{F} = \\langle P, Q \\rangle$?', a: mc(R, right, ['$\\displaystyle\\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA$', '$\\displaystyle\\iint_D \\left(\\frac{\\partial P}{\\partial y} + \\frac{\\partial Q}{\\partial x}\\right) dA$', '$\\displaystyle\\iint_D \\left(\\frac{\\partial P}{\\partial x} - \\frac{\\partial Q}{\\partial y}\\right) dA$']),
        steps: ['Flux adds up outflow, and the outflow density is the divergence $P_x + Q_y$.', 'Flux form of Green\'s theorem: $\\oint_C P\\,dy - Q\\,dx = \\iint_D (P_x + Q_y)\\,dA$.'],
        hint: 'Flux goes with divergence.', chk: { k: 'which', ans: right } }; }
    var F = polyF2(R, 2), rg = randRegion(R, kind === 'disk' ? ['disk'] : kind === 'tri' ? ['tri'] : kind === 'zero' ? ['rect', 'disk'] : ['rect']);
    if (kind === 'zero') { var f = new Poly(XY).add(rmono(R, XY, 2, 3)).add(rmono(R, XY, 2, 3)); if (f.isZero()) f = Poly.of(XY, [[1, { x: 1, y: 1 }]]); F = [f.d('y'), f.d('x').neg()]; if (F[0].isZero() && F[1].isZero()) F = [Poly.v(XY, 'y'), Poly.v(XY, 'x')]; }
    var g = F[0].d('x').add(F[1].d('y'));
    if (kind !== 'zero' && rg.type === 'disk' && g.isZero()) { F[0] = F[0].add(Poly.of(XY, [[R.nz(-3, 3), { x: 1 }]])); g = F[0].d('x').add(F[1].d('y')); }
    var I = regionInt(g, rg);
    return { q: 'Use Green\'s theorem to find the outward flux $\\oint_C \\mathbf{F} \\cdot \\mathbf{n}\\,ds$ of $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$ across ' + curveTex(rg) + '.', a: { t: 'num', v: rpPlain(I.v) },
      steps: ['Flux form: $\\oint_C \\mathbf{F} \\cdot \\mathbf{n}\\,ds = \\iint_D (P_x + Q_y)\\,dA$, the total divergence inside.', '$P_x = ' + F[0].d('x').toTex() + '$ and $Q_y = ' + F[1].d('y').toTex() + '$, so $P_x + Q_y = ' + g.toTex() + '$.', g.isZero() ? 'The divergence is $0$ everywhere, so the net outward flux is $0$: what flows in also flows out.' : I.how + '.'],
      hint: 'Compute the divergence $P_x + Q_y$ and integrate it over the region.', chk: { k: 'flux', F: fieldPlain(F), rg: rg }, nolint: ['+ -'] };
  });

  G('calc4.greens-area', function (R, ctx) {
    function cs(k) { return k === 1 ? '' : k === -1 ? '-' : k; } // a coefficient of 1 is not written
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['ellipse', 'poly', 'formula'], ['poly', 'ellipse', 'formula'], ['astroid', 'poly', 'astroid', 'ellipse']));
    if (kind === 'formula') { var right = '$\\oint_C x\\,dy$';
      return { q: 'Which line integral around the counterclockwise boundary $C$ of a region $D$ gives the area of $D$?', a: mc(R, right, ['$\\oint_C y\\,dy$', '$\\oint_C x\\,dx$', '$\\oint_C y\\,dx$']),
        steps: ['Green\'s theorem turns $\\oint_C P\\,dx + Q\\,dy$ into $\\iint_D (Q_x - P_y)\\,dA$. For the area we need $Q_x - P_y = 1$.', '$P = 0$, $Q = x$ works: $\\oint_C x\\,dy = \\iint_D 1\\,dA$.', '$\\oint y\\,dx$ gives $-$area, and $\\oint x\\,dx$, $\\oint y\\,dy$ give $0$.'],
        hint: 'Find $P$, $Q$ with $Q_x - P_y = 1$.', chk: { k: 'which', ans: right } }; }
    if (kind === 'ellipse') { var a = R.int(2, 12), b = R.intNot(1, 10, a);
      return { q: 'Use $A = \\frac{1}{2}\\oint_C x\\,dy - y\\,dx$ to find the area inside the ellipse $\\mathbf{r}(t) = \\langle ' + cs(a) + '\\cos t, ' + cs(b) + '\\sin t \\rangle$, $0 \\le t \\le 2\\pi$.', a: { t: 'num', v: piPlain(a * b) },
        steps: ['$x = ' + cs(a) + '\\cos t$, $y = ' + cs(b) + '\\sin t$, so $dx = -' + cs(a) + '\\sin t\\,dt$ and $dy = ' + cs(b) + '\\cos t\\,dt$.', '$x\\,dy - y\\,dx = ' + a * b + '\\cos^2 t\\,dt + ' + a * b + '\\sin^2 t\\,dt = ' + a * b + '\\,dt$.', '$A = \\frac{1}{2}\\int_0^{2\\pi} ' + a * b + '\\,dt = ' + piTex(a * b) + '$, the familiar $\\pi ab$.'],
        hint: 'Substitute the parametrization; $\\cos^2 t + \\sin^2 t = 1$.', chk: { k: 'ellipse', a: a, b: b } }; }
    if (kind === 'astroid') { var a2 = R.int(1, 9), C = circleMap(0, 0, 1), c = Poly.v(CS, 'cth'), s = Poly.v(CS, 'sth');
      var x = c.pow(3).scale(a2), y = s.pow(3).scale(a2), dx = c.pow(2).mul(s).scale(-3 * a2), dy = s.pow(2).mul(c).scale(3 * a2), g = x.mul(dy).sub(y.mul(dx)).scale(Q(1, 2)), val = intCS(g, 0, 4, 'cth', 'sth');
      return { q: 'Find the area inside the astroid $\\mathbf{r}(t) = \\langle ' + T.coef(a2, '\\cos^3 t') + ', ' + T.coef(a2, '\\sin^3 t') + ' \\rangle$, $0 \\le t \\le 2\\pi$, using $A = \\frac{1}{2}\\oint_C x\\,dy - y\\,dx$.', a: { t: 'num', v: rpPlain(val) },
        steps: ['$dx = ' + T.coef(-3 * a2, '\\cos^2 t \\sin t') + '\\,dt$ and $dy = ' + T.coef(3 * a2, '\\sin^2 t \\cos t') + '\\,dt$.', '$x\\,dy - y\\,dx = ' + 3 * a2 * a2 + '(\\cos^4 t \\sin^2 t + \\sin^4 t \\cos^2 t)\\,dt = ' + 3 * a2 * a2 + '\\cos^2 t \\sin^2 t\\,dt$.', 'Over a full turn $\\int_0^{2\\pi} \\cos^2 t \\sin^2 t\\,dt = \\frac{\\pi}{4}$, so $A = \\frac{1}{2} \\cdot ' + 3 * a2 * a2 + ' \\cdot \\frac{\\pi}{4} = ' + rpTex(val) + '$.'],
        hint: 'Factor out $\\cos^2 t \\sin^2 t$; then use $\\cos^2 t \\sin^2 t = \\frac{1}{4}\\sin^2 2t$.', chk: { k: 'astroid', a: a2 } }; }
    // polygon by the shoelace sum
    var pts; do { var n = R.pick([3, 4]); pts = []; for (var i = 0; i < n; i++) pts.push([R.int(-5, 6), R.int(-5, 6)]); var cx = pts.reduce(function (s0, p) { return s0 + p[0]; }, 0) / n, cy = pts.reduce(function (s0, p) { return s0 + p[1]; }, 0) / n;
      pts.sort(function (p, r) { return Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(r[1] - cy, r[0] - cx); });
      var ok = true; for (i = 0; i < n; i++) { var A0 = pts[i], B0 = pts[(i + 1) % n], C0 = pts[(i + 2) % n]; if ((B0[0] - A0[0]) * (C0[1] - B0[1]) - (B0[1] - A0[1]) * (C0[0] - B0[0]) <= 0) ok = false; }
    } while (!ok);
    var terms = pts.map(function (p, i) { var r = pts[(i + 1) % pts.length]; return p[0] * r[1] - r[0] * p[1]; }), area = Q(terms.reduce(function (s0, t) { return s0 + t; }, 0), 2);
    return { q: 'Use $A = \\frac{1}{2}\\oint_C x\\,dy - y\\,dx$ to find the area of the polygon with vertices ' + pts.map(function (p) { return '$' + ptTex(p) + '$'; }).join(', ') + ' (in counterclockwise order).', a: { t: 'num', v: area.toPlain() },
      steps: ['On the segment from $(x_1, y_1)$ to $(x_2, y_2)$, $\\int x\\,dy - y\\,dx = x_1y_2 - x_2y_1$ (parametrize the segment and integrate).', 'The sides give ' + terms.map(function (t) { return '$' + t + '$'; }).join(', ') + '.', '$A = \\frac{1}{2}(' + terms.join(' + ').replace(/\+ -/g, '- ') + ') = ' + area.toTex() + '$. (This is the "shoelace formula".)'],
      hint: 'Each side contributes $x_1y_2 - x_2y_1$.', chk: { k: 'poly', pts: pts } };
  });

  var VORT = '\\left\\langle \\frac{-y}{x^2 + y^2}, \\frac{x}{x^2 + y^2} \\right\\rangle';
  G('calc4.greens-holes', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['orient', 'vortex', 'inner'], ['annulus', 'vortex', 'inner', 'orient'], ['annulus', 'inner', 'vortex', 'annulus']));
    if (kind === 'orient') { var right = 'Clockwise, so the region stays on the left';
      return { q: 'Green\'s theorem for the region between two circles uses the whole boundary with positive orientation. The outer circle goes counterclockwise. How must the inner circle go?', a: mc(R, right, ['Counterclockwise, the same as the outer one', 'Either way; the answer is the same', 'It is left out, since it is not the outside edge']),
        steps: ['Positive orientation means: walk along the boundary and the region is on your left.', 'On the inner circle the region lies outside the circle, so you must walk clockwise to keep it on your left.', 'Cutting the ring into two pieces shows why: the cut lines are traversed twice in opposite directions and cancel, leaving the outer circle counterclockwise and the inner circle clockwise.'],
        hint: 'Keep the region on your left as you walk.', chk: { k: 'which', ans: right } }; }
    if (kind === 'vortex') { var k = R.nz(-3, 3), h = R.int(-3, 3), kk = R.int(-3, 3), rad = R.int(1, 4), d2 = h * h + kk * kk; if (d2 === rad * rad) rad++;
      var inside = d2 < rad * rad, cw = R.chance(0.3), val = inside ? Q(2 * k * (cw ? -1 : 1)) : Q(0);
      return { q: 'Find $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r}$ for $\\mathbf{F} = ' + (k === 1 ? '' : k === -1 ? '-' : k) + VORT + '$, where $C$ is the circle with center $' + ptTex([h, kk]) + '$ and radius $' + rad + '$, traced ' + (cw ? 'clockwise' : 'counterclockwise') + '.', a: { t: 'num', v: piPlain(val) },
        steps: ['Away from the origin, $Q_x - P_y = 0$ for this field (check by differentiating).', 'Distance from the center to the origin: $\\sqrt{' + d2 + '}$, ' + (inside ? 'less than' : 'more than') + ' the radius $' + rad + '$, so the origin is ' + (inside ? 'inside' : 'outside') + ' $C$.',
          inside ? 'Green\'s theorem on the region between $C$ and a tiny circle around the origin says both circles have the same circulation. On a tiny counterclockwise circle, $\\mathbf{F} \\cdot d\\mathbf{r} = ' + (k === 1 ? '' : k) + '\\,d\\theta$, giving $' + piTex(2 * k) + '$.' : 'Green\'s theorem applies on the whole disk inside $C$ (no hole), and the integrand $Q_x - P_y$ is $0$ there.',
          'Answer: $' + piTex(val) + '$' + (inside && cw ? ' (clockwise flips the sign).' : '.')],
        hint: 'Does $C$ enclose the origin, where the field is not defined?', chk: { k: 'vortex', c: k, h: h, kk: kk, rad: rad, cw: cw } }; }
    if (kind === 'inner') { var r1 = R.int(1, 2), r2 = r1 + R.int(1, 3), K = R.int(-6, 6), c = R.nz(-3, 3), val2 = { r: Q(K), p: Q(c * (r2 * r2 - r1 * r1)) };
      return { q: 'In the ring $' + r1 * r1 + ' \\le x^2 + y^2 \\le ' + r2 * r2 + '$, a field $\\mathbf{F}$ (not defined at the origin) has $Q_x - P_y = ' + c + '$. Its circulation around the inner circle $x^2 + y^2 = ' + r1 * r1 + '$, counterclockwise, is $' + K + '$. Find its circulation around the outer circle, counterclockwise.', a: { t: 'num', v: rpPlain(val2) },
        steps: ['Green\'s theorem on the ring: $\\oint_{\\text{outer, ccw}} + \\oint_{\\text{inner, cw}} = \\iint_{\\text{ring}} (Q_x - P_y)\\,dA$.', 'The inner integral clockwise is $-' + pf(K) + '$, and the right side is $' + c + ' \\cdot \\pi(' + r2 * r2 + ' - ' + r1 * r1 + ') = ' + piTex(c * (r2 * r2 - r1 * r1)) + '$.', 'So $\\oint_{\\text{outer}} = ' + K + ' + ' + piTex(c * (r2 * r2 - r1 * r1)).replace(/^-/, '(-') + (c < 0 ? ')' : '') + ' = ' + rpTex(val2) + '$.'],
        hint: 'The outer circulation minus the inner circulation (both counterclockwise) equals the double integral over the ring.', chk: { k: 'inner', r1: r1, r2: r2, K: K, c: c }, nolint: ['+ -', '--'] }; }
    var F = polyF2(R, 2), ra = R.int(1, 2), rb = ra + R.int(1, 2), g = F[1].d('x').sub(F[0].d('y'));
    if (g.isZero()) { F[1] = F[1].add(Poly.of(XY, [[R.nz(-3, 3), { x: 1 }]])); g = F[1].d('x').sub(F[0].d('y')); }
    var gp = toPolar(g), val3 = polarInt(gp, ra, rb, 0, 4);
    return { q: 'Let $D$ be the ring $' + ra * ra + ' \\le x^2 + y^2 \\le ' + rb * rb + '$ and $\\mathbf{F}(x, y) = ' + fieldTex(F) + '$. Find $\\oint_{\\partial D} \\mathbf{F} \\cdot d\\mathbf{r}$, with the outer circle counterclockwise and the inner circle clockwise.', a: { t: 'num', v: rpPlain(val3) },
      steps: ['That is the positive orientation of the ring\'s boundary, so Green\'s theorem applies: the answer is $\\iint_D (Q_x - P_y)\\,dA$.', '$Q_x - P_y = ' + g.toTex() + '$.', 'In polar coordinates over $' + ra + ' \\le r \\le ' + rb + '$, $0 \\le \\theta \\le 2\\pi$: $\\int_0^{2\\pi} \\int_{' + ra + '}^{' + rb + '} \\left(' + gp.toTex() + '\\right) r\\,dr\\,d\\theta = ' + rpTex(val3) + '$.'],
      hint: 'Integrate $Q_x - P_y$ over the ring, using polar coordinates.', chk: { k: 'annulus', F: fieldPlain(F), ra: ra, rb: rb } };
  });


  // ===================================================================== g4_4surf.js
  // ---------- calc4 unit: Surfaces and Surface Integrals ----------
  var UV = ['u', 'v'], SPH = ['cth', 'sth', 'cph', 'sph'], BALL = ['rho', 'cth', 'sth', 'cph', 'sph'], CYZ = ['z', 'cth', 'sth'];
  function csI(m, n, j0, j1) { return intCS(Poly.mono(['c', 's'], 1, [m, n]), j0, j1, 'c', 's'); }
  // exact ∫∫ over θ in [th0, th1]·π/2 and φ in [ph0, ph1]·π/2 of a polynomial in cos/sin of θ and φ (other variables must be gone)
  function angInt(p, th, ph) {
    var tot = { r: Q(0), p: Q(0) }, p2 = Q(0), V0 = p.vars;
    for (var k in p.m) {
      var e = unkey(k), c = p.m[k], ex = {}; V0.forEach(function (v, i) { ex[v] = e[i]; });
      V0.forEach(function (v) { if (ex[v] && !/^(cth|sth|cph|sph)$/.test(v)) throw new Error('angInt: variable ' + v + ' left'); });
      var A = csI(ex.cth || 0, ex.sth || 0, th[0], th[1]), B = ph ? csI(ex.cph || 0, ex.sph || 0, ph[0], ph[1]) : { r: Q(1), p: Q(0) };
      tot.r = tot.r.add(c.mul(A.r).mul(B.r)); tot.p = tot.p.add(c.mul(A.r.mul(B.p).add(A.p.mul(B.r)))); p2 = p2.add(c.mul(A.p).mul(B.p));
    }
    if (!p2.isZero()) throw new Error('angInt: pi^2 term');
    return tot;
  }
  function sphMap(a, vars, withRho) { var c = Poly.v(vars, 'cth'), s = Poly.v(vars, 'sth'), C = Poly.v(vars, 'cph'), S = Poly.v(vars, 'sph'), r = withRho ? Poly.v(vars, 'rho') : Poly.c(vars, a);
    return { __vars: vars, x: r.mul(S).mul(c), y: r.mul(S).mul(s), z: r.mul(C) }; }
  function sphSurf(f, a, phEnd) { return angInt(f.substAll(sphMap(a, SPH)).mul(Poly.v(SPH, 'sph')).scale(a * a), [0, 4], [0, phEnd]); } // ∬ f dS on the sphere ρ = a, φ ≤ phEnd·π/2
  function ballInt(f, a, phEnd) { var g = f.substAll(sphMap(a, BALL, true)).mul(Poly.v(BALL, 'rho').pow(2)).mul(Poly.v(BALL, 'sph')).defint('rho', 0, a); return angInt(g, [0, 4], [0, phEnd]); }
  function cylSurf(f, a, h) { var m = { __vars: CYZ, x: Poly.v(CYZ, 'cth').scale(a), y: Poly.v(CYZ, 'sth').scale(a), z: Poly.v(CYZ, 'z') }; return angInt(f.substAll(m).scale(a).defint('z', 0, h), [0, 4]); } // side x² + y² = a², 0 ≤ z ≤ h
  function cylVol(f, a, h) { var g = toCyl(f).mul(Poly.v(RZ, 'r')).defint('z', 0, h).defint('r', 0, a); return angInt(g, [0, 4]); }
  function diskInt(f, a) { return polarInt(toPolar(f), 0, a, 0, 4); }
  function fDotR(F) { return F[0].mul(Poly.v(XYZ, 'x')).add(F[1].mul(Poly.v(XYZ, 'y'))).add(F[2].mul(Poly.v(XYZ, 'z'))); }
  function fluxSphere(F, a, phEnd) { return sphSurf(fDotR(F).scale(Q(1, a)), a, phEnd); } // outward
  function fluxCylSide(F, a, h) { return cylSurf(F[0].mul(Poly.v(XYZ, 'x')).add(F[1].mul(Poly.v(XYZ, 'y'))).scale(Q(1, a)), a, h); } // outward
  function polyF3(R, deg, cmax) { return [0, 1, 2].map(function () { var p = new Poly(XYZ).add(rmono(R, XYZ, deg || 1, cmax || 3)).add(rmono(R, XYZ, 1, cmax || 3)); return p.isZero() ? Poly.c(XYZ, R.nz(-2, 2)) : p; }); }
  function uvTex(rs) { return '\\left\\langle ' + rs.map(function (p) { return p.toTex(); }).join(', ') + ' \\right\\rangle'; }
  function sphereTex(a, phEnd) { return phEnd === 2 ? 'the sphere $x^2 + y^2 + z^2 = ' + a * a + '$' : 'the upper hemisphere $x^2 + y^2 + z^2 = ' + a * a + '$, $z \\ge 0$'; }

  G('calc4.parametric-surfaces', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['point', 'identify', 'graph'], ['point', 'normal', 'identify', 'cyl'], ['normal', 'sphere', 'cyl', 'normal']));
    if (kind === 'point' || kind === 'normal') {
      var rs = [0, 1, 2].map(function () { var p = new Poly(UV).add(rmono(R, UV, kind === 'normal' ? 2 : 1, 3)).add(rmono(R, UV, 1, 3)).add(Poly.c(UV, R.int(-2, 2))); return p.isZero() ? Poly.v(UV, 'u') : p; });
      var u0 = R.int(-3, 3), v0 = R.int(-3, 3), env = { u: u0, v: v0 };
      if (kind === 'point') { var P = rs.map(function (p) { return p.at(env); });
        return { q: 'Find the point on the surface $\\mathbf{r}(u, v) = ' + uvTex(rs) + '$ where $u = ' + u0 + '$ and $v = ' + v0 + '$.', a: { t: 'tuple', v: vPlain(P) },
          steps: ['A parametric surface sends each parameter pair $(u, v)$ to a point in space.', 'Substitute $u = ' + u0 + '$, $v = ' + v0 + '$ into each component: $' + ptTex(P) + '$.'],
          hint: 'Put the parameter values into each component.', chk: { k: 'point', r: rs.map(function (p) { return p.toPlain(); }), u: u0, v: v0 } }; }
      var ru = rs.map(function (p) { return p.d('u').at(env); }), rv = rs.map(function (p) { return p.d('v').at(env); }), N = vcross(ru, rv);
      if (vZero(N)) { rs[2] = rs[2].add(Poly.v(UV, 'u').mul(Poly.v(UV, 'v'))); ru = rs.map(function (p) { return p.d('u').at(env); }); rv = rs.map(function (p) { return p.d('v').at(env); }); N = vcross(ru, rv); }
      return { q: 'Find the normal vector $\\mathbf{r}_u \\times \\mathbf{r}_v$ to $\\mathbf{r}(u, v) = ' + uvTex(rs) + '$ at $(u, v) = (' + u0 + ', ' + v0 + ')$.', a: { t: 'tuple', v: vPlain(N) },
        steps: ['$\\mathbf{r}_u = ' + uvTex(rs.map(function (p) { return p.d('u'); })) + '$ and $\\mathbf{r}_v = ' + uvTex(rs.map(function (p) { return p.d('v'); })) + '$: tangent vectors along the two grid lines.', 'At $(' + u0 + ', ' + v0 + ')$: $\\mathbf{r}_u = ' + vTex(ru) + '$, $\\mathbf{r}_v = ' + vTex(rv) + '$.', '$\\mathbf{r}_u \\times \\mathbf{r}_v = ' + vTex(N) + '$, perpendicular to both, so normal to the surface.'],
        hint: 'Differentiate in $u$ and in $v$, substitute, then take the cross product.', chk: { k: 'normal', r: rs.map(function (p) { return p.toPlain(); }), u: u0, v: v0 } };
    }
    if (kind === 'identify') {
      var a = R.int(2, 9), S = [['\\langle ' + a + '\\cos u, ' + a + '\\sin u, v \\rangle', 'a cylinder of radius $' + a + '$ around the $z$-axis'], ['\\langle ' + a + '\\sin u \\cos v, ' + a + '\\sin u \\sin v, ' + a + '\\cos u \\rangle', 'a sphere of radius $' + a + '$ centered at the origin'], ['\\langle v\\cos u, v\\sin u, v \\rangle', 'a cone with vertex at the origin'], ['\\langle u, v, u^2 + v^2 \\rangle', 'a paraboloid opening upward'], ['\\langle u, v, ' + a + ' - u - v \\rangle', 'a plane']];
      var pickS = R.pick(S);
      return { q: 'What surface does $\\mathbf{r}(u, v) = ' + pickS[0] + '$ describe (for all allowed $u$, $v$)?', a: mc(R, pickS[1].replace(/^a /, 'A '), S.filter(function (s) { return s !== pickS; }).map(function (s) { return s[1].replace(/^a /, 'A '); }).slice(0, 3)),
        steps: ['Look for an equation the coordinates satisfy for every $u$ and $v$.', { 0: '$x^2 + y^2 = ' + a * a + '$ and $z = v$ is free: a cylinder.', 1: '$x^2 + y^2 + z^2 = ' + a * a + '(\\sin^2 u + \\cos^2 u) = ' + a * a + '$: a sphere.', 2: '$x^2 + y^2 = v^2 = z^2$: the cone $z^2 = x^2 + y^2$.', 3: '$z = x^2 + y^2$: a paraboloid.', 4: '$x + y + z = ' + a + '$: a plane.' }[S.indexOf(pickS)]],
        hint: 'Eliminate $u$ and $v$: try $x^2 + y^2$, or $x + y + z$.', chk: { k: 'which', ans: pickS[1].replace(/^a /, 'A ') } }; }
    if (kind === 'graph') { var g = new Poly(XY).add(rmono(R, XY, 2, 3)).add(rmono(R, XY, 1, 3)); if (g.isZero()) g = Poly.of(XY, [[1, { x: 2 }]]); var gu = g.substAll({ __vars: UV, x: Poly.v(UV, 'u'), y: Poly.v(UV, 'v') });
      return { q: 'Parametrize the graph $z = ' + g.toTex() + '$ using $x = u$ and $y = v$.', a: { t: 'tuple', v: ['u', 'v', gu.toPlain()], vars: UV },
        steps: ['Any graph $z = f(x, y)$ is the parametric surface $\\mathbf{r}(u, v) = \\langle u, v, f(u, v) \\rangle$.', 'Here $\\mathbf{r}(u, v) = \\langle u, v, ' + gu.toTex() + ' \\rangle$.'],
        hint: 'Keep $x$ and $y$ as the parameters; $z$ comes from the formula.', chk: { k: 'graph', g: g.toPlain() } }; }
    if (kind === 'cyl') { var a2 = R.int(2, 9);
      return { q: 'Parametrize the cylinder $x^2 + y^2 = ' + a2 * a2 + '$ with $u$ the angle around the $z$-axis (measured from the positive $x$-axis) and $v = z$.', a: { t: 'tuple', v: [a2 + '*cos(u)', a2 + '*sin(u)', 'v'], vars: UV },
        steps: ['Each horizontal slice is a circle of radius $' + a2 + '$: $x = ' + a2 + '\\cos u$, $y = ' + a2 + '\\sin u$.', 'The height is free: $z = v$. So $\\mathbf{r}(u, v) = \\langle ' + a2 + '\\cos u, ' + a2 + '\\sin u, v \\rangle$.'],
        hint: 'Polar coordinates in each horizontal slice, plus the height.', chk: { k: 'cyl', a: a2 } }; }
    var a3 = R.int(2, 5);
    return { q: 'Parametrize the sphere $x^2 + y^2 + z^2 = ' + a3 * a3 + '$ with $u = \\varphi$ (the angle down from the positive $z$-axis) and $v = \\theta$ (the angle around the $z$-axis).', a: { t: 'tuple', v: [a3 + '*sin(u)*cos(v)', a3 + '*sin(u)*sin(v)', a3 + '*cos(u)'], vars: UV },
      steps: ['Spherical coordinates with $\\rho$ fixed at $' + a3 + '$: $x = \\rho\\sin\\varphi\\cos\\theta$, $y = \\rho\\sin\\varphi\\sin\\theta$, $z = \\rho\\cos\\varphi$.', '$\\mathbf{r}(u, v) = \\langle ' + a3 + '\\sin u\\cos v, ' + a3 + '\\sin u\\sin v, ' + a3 + '\\cos u \\rangle$, $0 \\le u \\le \\pi$, $0 \\le v \\le 2\\pi$.'],
      hint: 'Fix $\\rho$ in spherical coordinates.', chk: { k: 'sphere', a: a3 } };
  });

  G('calc4.parametric-surface-area', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['plane', 'cyl', 'plane'], ['plane', 'zone', 'cone', 'cyl'], ['parab', 'zone', 'cone', 'plane']));
    if (kind === 'plane') { var a = nzVec(R, -2, 2), b; do { b = nzVec(R, -2, 2); } while (vZero(vcross(a, b))); var P0 = randPt(R, -2, 2), U = R.int(1, 3), Vv = R.int(1, 3), N = vcross(a, b), n2 = vn2(N).num();
      var rs = [0, 1, 2].map(function (i) { return Poly.of(UV, [[a[i], { u: 1 }], [b[i], { v: 1 }], [P0[i], {}]]); });
      return { q: 'Find the area of the surface $\\mathbf{r}(u, v) = ' + uvTex(rs) + '$, $0 \\le u \\le ' + U + '$, $0 \\le v \\le ' + Vv + '$.', a: { t: 'num', v: radPlain(U * Vv, n2) },
        steps: ['$\\mathbf{r}_u = ' + vTex(a) + '$ and $\\mathbf{r}_v = ' + vTex(b) + '$ (constant: the surface is a flat parallelogram).', '$\\mathbf{r}_u \\times \\mathbf{r}_v = ' + vTex(N) + '$, with length $' + sqrtTex(n2) + '$.', 'Area $= \\iint |\\mathbf{r}_u \\times \\mathbf{r}_v|\\,dA = ' + sqrtTex(n2) + ' \\cdot ' + U + ' \\cdot ' + Vv + ' = ' + radTex(U * Vv, n2) + '$.'],
        hint: 'Area $= \\iint_D |\\mathbf{r}_u \\times \\mathbf{r}_v|\\,du\\,dv$.', chk: { k: 'area', r: rs.map(function (p) { return p.toPlain(); }), u: [0, U], v: [0, Vv] }, nolint: ['+ 0'] }; }
    if (kind === 'cyl') { var a2 = R.int(2, 5), h = R.int(1, 6), part = R.pick([[4, 'the whole side'], [2, 'the half with $y \\ge 0$'], [1, 'the quarter with $x \\ge 0$, $y \\ge 0$']]), val = Q(a2 * h * part[0], 2);
      return { q: 'Use $\\mathbf{r}(u, v) = \\langle ' + a2 + '\\cos u, ' + a2 + '\\sin u, v \\rangle$ to find the area of ' + part[1] + ' of the cylinder $x^2 + y^2 = ' + a2 * a2 + '$ for $0 \\le z \\le ' + h + '$.', a: { t: 'num', v: piPlain(val) },
        steps: ['$\\mathbf{r}_u = \\langle -' + a2 + '\\sin u, ' + a2 + '\\cos u, 0 \\rangle$, $\\mathbf{r}_v = \\langle 0, 0, 1 \\rangle$, so $|\\mathbf{r}_u \\times \\mathbf{r}_v| = ' + a2 + '$.', 'The angle $u$ runs over an interval of length $' + piTex(Q(part[0], 2)) + '$ and $v$ over $[0, ' + h + ']$.', 'Area $= ' + a2 + ' \\cdot ' + piTex(Q(part[0], 2)) + ' \\cdot ' + h + ' = ' + piTex(val) + '$ (arc length times height, as unrolling the cylinder suggests).'],
        hint: 'Here $|\\mathbf{r}_u \\times \\mathbf{r}_v|$ is the radius.', chk: { k: 'cylA', a: a2, h: h, th: part[0] } }; }
    if (kind === 'zone') { var a3 = R.int(2, 5), z0 = R.int(-a3, a3 - 1), z1 = R.int(z0 + 1, a3), val3 = Q(2 * a3 * (z1 - z0));
      return { q: 'Find the area of the part of the sphere $x^2 + y^2 + z^2 = ' + a3 * a3 + '$ between the planes $z = ' + z0 + '$ and $z = ' + z1 + '$.', a: { t: 'num', v: piPlain(val3) },
        steps: ['With $\\mathbf{r}(\\varphi, \\theta) = \\langle ' + a3 + '\\sin\\varphi\\cos\\theta, ' + a3 + '\\sin\\varphi\\sin\\theta, ' + a3 + '\\cos\\varphi \\rangle$, $|\\mathbf{r}_\\varphi \\times \\mathbf{r}_\\theta| = ' + a3 * a3 + '\\sin\\varphi$.', 'Area $= \\int_0^{2\\pi} \\int ' + a3 * a3 + '\\sin\\varphi\\,d\\varphi\\,d\\theta = 2\\pi \\cdot ' + a3 * a3 + '\\left[-\\cos\\varphi\\right]$ over the band, and $' + a3 + '\\cos\\varphi = z$ runs from $' + z0 + '$ to $' + z1 + '$.', 'So the area is $2\\pi \\cdot ' + a3 + ' \\cdot (' + z1 + ' - ' + pf(z0) + ') = ' + piTex(val3) + '$: it depends only on the height of the band (Archimedes\' result).'],
        hint: 'On a sphere of radius $a$, a band of height $h$ has area $2\\pi a h$; derive it with $dS = a^2\\sin\\varphi\\,d\\varphi\\,d\\theta$.', chk: { k: 'zone', a: a3, z0: z0, z1: z1 } }; }
    if (kind === 'cone') { var k = R.int(1, 3), Rr = R.int(1, 4), n2c = 1 + k * k;
      return { q: 'Find the area of the cone $z = ' + T.coef(k, '\\sqrt{x^2 + y^2}') + '$ for $0 \\le z \\le ' + k * Rr + '$, using $\\mathbf{r}(r, \\theta) = \\langle r\\cos\\theta, r\\sin\\theta, ' + T.coef(k, 'r') + ' \\rangle$.', a: { t: 'num', v: radPlain(Rr * Rr, n2c) + '*pi' },
        steps: ['$\\mathbf{r}_r = \\langle \\cos\\theta, \\sin\\theta, ' + k + ' \\rangle$ and $\\mathbf{r}_\\theta = \\langle -r\\sin\\theta, r\\cos\\theta, 0 \\rangle$.', '$\\mathbf{r}_r \\times \\mathbf{r}_\\theta = \\langle ' + T.coef(-k, 'r\\cos\\theta') + ', ' + T.coef(-k, 'r\\sin\\theta') + ', r \\rangle$, with length $r\\sqrt{' + n2c + '}$.', 'The top edge $z = ' + k * Rr + '$ means $r \\le ' + Rr + '$: Area $= \\int_0^{2\\pi} \\int_0^{' + Rr + '} r\\sqrt{' + n2c + '}\\,dr\\,d\\theta = ' + radTex(Rr * Rr, n2c) + '\\pi$.'],
        hint: 'Find $|\\mathbf{r}_r \\times \\mathbf{r}_\\theta|$; it is a multiple of $r$.', chk: { k: 'cone', k2: k, R: Rr } }; }
    var hh = R.pick([2, 6, 12, 20]), s = Math.sqrt(1 + 4 * hh), val4 = Q(s * s * s - 1, 6);
    return { q: 'Find the area of the paraboloid $z = x^2 + y^2$ below the plane $z = ' + hh + '$.', a: { t: 'num', v: piPlain(val4) },
      steps: ['Use $\\mathbf{r}(r, \\theta) = \\langle r\\cos\\theta, r\\sin\\theta, r^2 \\rangle$: $|\\mathbf{r}_r \\times \\mathbf{r}_\\theta| = r\\sqrt{1 + 4r^2}$.', '$z \\le ' + hh + '$ means $r \\le \\sqrt{' + hh + '}$.', 'Area $= 2\\pi \\int_0^{\\sqrt{' + hh + '}} r\\sqrt{1 + 4r^2}\\,dr = 2\\pi \\cdot \\frac{1}{12}\\left[(1 + 4r^2)^{3/2}\\right]_0^{\\sqrt{' + hh + '}} = \\frac{\\pi}{6}(' + s * s * s + ' - 1) = ' + piTex(val4) + '$.'],
      hint: 'Substitute $w = 1 + 4r^2$ in the radial integral.', chk: { k: 'parab', h: hh } };
  });

  G('calc4.scalar-surface-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['plane', 'which', 'cyl'], ['plane', 'sphere', 'cyl'], ['sphere', 'plane', 'cyl', 'sphere']));
    if (kind === 'which') { var right = '$\\sqrt{1 + f_x^2 + f_y^2}\\,dA$';
      return { q: 'For a surface that is the graph $z = f(x, y)$ over a region $D$, what is $dS$?', a: mc(R, right, ['$dA$', '$(1 + f_x + f_y)\\,dA$', '$\\sqrt{f_x^2 + f_y^2}\\,dA$']),
        steps: ['With $\\mathbf{r} = \\langle x, y, f(x, y) \\rangle$: $\\mathbf{r}_x \\times \\mathbf{r}_y = \\langle -f_x, -f_y, 1 \\rangle$.', 'Its length is $\\sqrt{1 + f_x^2 + f_y^2}$, the factor by which the tilted surface is bigger than its shadow.', 'Using $dA$ alone treats the surface as if it were flat and level.'],
        hint: 'Find $|\\mathbf{r}_x \\times \\mathbf{r}_y|$ for $\\mathbf{r} = \\langle x, y, f(x, y) \\rangle$.', chk: { k: 'which', ans: right } }; }
    if (kind === 'plane') { var al = R.int(-2, 2), be = R.int(-2, 2), c = R.int(1, 6), p = R.int(1, 3), qq = R.int(1, 3), gpl = Poly.of(XY, [[c, {}], [-al, { x: 1 }], [-be, { y: 1 }]]);
      var f = Poly.of(XYZ, R.pick([[[1, { z: 1 }]], [[1, { x: 1 }], [1, { y: 1 }]], [[1, { x: 1, y: 1 }]], [[1, { z: 1 }], [R.nz(-2, 2), { x: 1 }]], [[2, { y: 1 }], [1, {}]]]));
      var fr = f.substAll({ __vars: XY, x: Poly.v(XY, 'x'), y: Poly.v(XY, 'y'), z: gpl }), I = fr.defint('y', 0, qq).defint('x', 0, p).cval(), n2 = 1 + al * al + be * be;
      return { q: 'Evaluate $\\displaystyle\\iint_S ' + f.texParen() + '\\,dS$, where $S$ is the part of the plane $z = ' + gpl.toTex() + '$ above the rectangle $0 \\le x \\le ' + p + '$, $0 \\le y \\le ' + qq + '$.', a: { t: 'num', v: radPlain(I, n2) },
        steps: ['For $z = f(x, y)$: $dS = \\sqrt{1 + f_x^2 + f_y^2}\\,dA = \\sqrt{1 + ' + al * al + ' + ' + be * be + '}\\,dA = ' + sqrtTex(n2) + '\\,dA$.', 'On the surface the integrand is $' + fr.toTex() + '$.', '$\\int_0^{' + p + '} \\int_0^{' + qq + '} ' + fr.texParen() + '\\,dy\\,dx = ' + I.toTex() + '$.', 'Multiply by the area factor: $' + radTex(I, n2) + '$.'],
        hint: 'Put $z$ from the plane into the integrand, and do not forget the factor $\\sqrt{1 + f_x^2 + f_y^2}$.', chk: { k: 'plane', f: f.toPlain(), g: gpl.toPlain(), p: p, q: qq }, nolint: ['+ 0'] }; }
    if (kind === 'cyl') { var a = R.int(2, 3), h = R.int(1, 4), fc = Poly.of(XYZ, R.pick([[[1, { z: 1 }]], [[1, { x: 2 }]], [[1, { z: 2 }], [1, {}]], [[1, { x: 1 }], [1, { z: 1 }]], [[1, { y: 2 }], [1, { z: 1 }]]])), val = cylSurf(fc, a, h);
      return { q: 'Evaluate $\\displaystyle\\iint_S ' + fc.texParen() + '\\,dS$, where $S$ is the side of the cylinder $x^2 + y^2 = ' + a * a + '$, $0 \\le z \\le ' + h + '$.', a: { t: 'num', v: rpPlain(val) },
        steps: ['$\\mathbf{r}(\\theta, z) = \\langle ' + a + '\\cos\\theta, ' + a + '\\sin\\theta, z \\rangle$ and $|\\mathbf{r}_\\theta \\times \\mathbf{r}_z| = ' + a + '$, so $dS = ' + a + '\\,d\\theta\\,dz$.', 'The integral becomes $\\int_0^{2\\pi} \\int_0^{' + h + '} \\left(' + fc.substAll({ __vars: ['z', 'cth', 'sth'], x: Poly.v(['z', 'cth', 'sth'], 'cth').scale(a), y: Poly.v(['z', 'cth', 'sth'], 'sth').scale(a), z: Poly.v(['z', 'cth', 'sth'], 'z') }).toTex() + '\\right) ' + a + '\\,dz\\,d\\theta$.', 'Value: $' + rpTex(val) + '$.'],
        hint: 'On the cylinder, $dS = a\\,d\\theta\\,dz$.', chk: { k: 'cyl', f: fc.toPlain(), a: a, h: h } }; }
    var a2 = R.int(2, 3), phEnd = R.pick([2, 1]), fs = Poly.of(XYZ, R.pick(phEnd === 1 ? [[[1, { z: 1 }]], [[1, { x: 2 }], [1, { y: 2 }]], [[1, { z: 2 }]], [[1, {}], [1, { z: 1 }]], [[1, { x: 2 }]]] : [[[1, { z: 2 }]], [[1, { x: 2 }], [1, { y: 2 }]], [[1, { x: 2 }]], [[2, {}], [1, { z: 1 }]]])), val2 = sphSurf(fs, a2, phEnd);
    return { q: 'Evaluate $\\displaystyle\\iint_S ' + fs.texParen() + '\\,dS$, where $S$ is ' + sphereTex(a2, phEnd) + '.', a: { t: 'num', v: rpPlain(val2) },
      steps: ['$\\mathbf{r}(\\varphi, \\theta) = \\langle ' + a2 + '\\sin\\varphi\\cos\\theta, ' + a2 + '\\sin\\varphi\\sin\\theta, ' + a2 + '\\cos\\varphi \\rangle$ and $dS = ' + a2 * a2 + '\\sin\\varphi\\,d\\varphi\\,d\\theta$.', 'The integrand on the sphere: $' + fs.substAll(sphMap(a2, SPH)).toTex() + '$.', 'Integrate $\\theta$ over $[0, 2\\pi]$ and $\\varphi$ over $[0, ' + (phEnd === 2 ? '\\pi' : '\\frac{\\pi}{2}') + ']$: $' + rpTex(val2) + '$.'],
      hint: 'On a sphere of radius $a$, $dS = a^2\\sin\\varphi\\,d\\varphi\\,d\\theta$.', chk: { k: 'sphere', f: fs.toPlain(), a: a2, ph: phEnd } };
  });

  G('calc4.oriented-surfaces', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['graphN', 'closed', 'tf'], ['graphN', 'plane', 'tf', 'mobius'], ['graphN', 'plane', 'tf', 'graphN']));
    if (kind === 'closed') { var right = 'Outward, away from the enclosed solid';
      return { q: 'For a closed surface, such as a sphere or the surface of a box, which orientation is called positive?', a: mc(R, right, ['Inward, toward the enclosed solid', 'Upward, the positive $z$-direction', 'Whichever way $\\mathbf{r}_u \\times \\mathbf{r}_v$ points']),
        steps: ['A closed surface separates inside from outside, so it has two possible orientations.', 'By convention the positive orientation is the outward normal. The divergence theorem uses it.', 'The cross product $\\mathbf{r}_u \\times \\mathbf{r}_v$ may point either way, depending on the order of the parameters.'],
        hint: 'Think of the divergence theorem: net outflow.', chk: { k: 'which', ans: right } }; }
    if (kind === 'mobius') { return { q: 'True or false: a Möbius strip can be given a continuous unit normal $\\mathbf{n}$, so flux through it makes sense.', a: { t: 'tf', v: false },
      steps: ['Carry a normal vector once around the center line of a Möbius strip: it comes back pointing the opposite way.', 'So no continuous choice of $\\mathbf{n}$ exists. The strip is not orientable, and flux through it is not defined.'],
      hint: 'Slide a normal vector once around the strip.', chk: { k: 'tf' } }; }
    if (kind === 'tf') { var S = R.pick([
        ['For the sphere $\\mathbf{r}(\\varphi, \\theta) = \\langle a\\sin\\varphi\\cos\\theta, a\\sin\\varphi\\sin\\theta, a\\cos\\varphi \\rangle$, the vector $\\mathbf{r}_\\varphi \\times \\mathbf{r}_\\theta$ points outward.', true, '$\\mathbf{r}_\\varphi \\times \\mathbf{r}_\\theta = a^2\\sin\\varphi\\,\\langle \\sin\\varphi\\cos\\theta, \\sin\\varphi\\sin\\theta, \\cos\\varphi \\rangle$, a positive multiple of the position vector.'],
        ['For the sphere $\\mathbf{r}(\\varphi, \\theta) = \\langle a\\sin\\varphi\\cos\\theta, a\\sin\\varphi\\sin\\theta, a\\cos\\varphi \\rangle$, the vector $\\mathbf{r}_\\theta \\times \\mathbf{r}_\\varphi$ points outward.', false, 'Swapping the order flips the cross product: $\\mathbf{r}_\\theta \\times \\mathbf{r}_\\varphi = -a^2\\sin\\varphi\\,\\langle \\ldots \\rangle$ points inward.'],
        ['For the cylinder $\\mathbf{r}(\\theta, z) = \\langle a\\cos\\theta, a\\sin\\theta, z \\rangle$, the vector $\\mathbf{r}_\\theta \\times \\mathbf{r}_z$ points outward.', true, '$\\mathbf{r}_\\theta \\times \\mathbf{r}_z = \\langle a\\cos\\theta, a\\sin\\theta, 0 \\rangle$, pointing away from the axis.'],
        ['For the cylinder $\\mathbf{r}(\\theta, z) = \\langle a\\cos\\theta, a\\sin\\theta, z \\rangle$, the vector $\\mathbf{r}_z \\times \\mathbf{r}_\\theta$ points outward.', false, '$\\mathbf{r}_z \\times \\mathbf{r}_\\theta = \\langle -a\\cos\\theta, -a\\sin\\theta, 0 \\rangle$ points toward the axis.'],
        ['For a graph $\\mathbf{r}(x, y) = \\langle x, y, f(x, y) \\rangle$, the vector $\\mathbf{r}_x \\times \\mathbf{r}_y$ points upward.', true, '$\\mathbf{r}_x \\times \\mathbf{r}_y = \\langle -f_x, -f_y, 1 \\rangle$ has $z$-component $1 > 0$.']]);
      return { q: 'True or false: ' + S[0], a: { t: 'tf', v: S[1] }, steps: [S[2], 'Always check the direction of $\\mathbf{r}_u \\times \\mathbf{r}_v$ against the orientation you need, and negate it if it points the wrong way.'], hint: 'Compute the cross product at one convenient point and see where it points.', chk: { k: 'tf' } }; }
    if (kind === 'plane') { var a, b, N; do { a = nzVec(R, -2, 2); b = nzVec(R, -2, 2); N = vcross(a, b); } while (q(N[2]).isZero());
      var up = q(N[2]).sign() > 0;
      return { q: 'The plane $\\mathbf{r}(u, v) = u' + vTex(a) + ' + v' + vTex(b) + '$ is to be oriented upward. Does $\\mathbf{r}_u \\times \\mathbf{r}_v$ give that orientation?', a: { t: 'tf', v: up },
        steps: ['$\\mathbf{r}_u \\times \\mathbf{r}_v = ' + vTex(a) + ' \\times ' + vTex(b) + ' = ' + vTex(N) + '$.', 'Its $z$-component is $' + qt(N[2]) + '$, ' + (up ? 'positive: it points upward, so it works.' : 'negative: it points downward, so use $\\mathbf{r}_v \\times \\mathbf{r}_u = ' + vTex(vsc(-1, N)) + '$ instead.')],
        hint: 'Upward means a positive $z$-component.', chk: { k: 'plane', a: a, b: b } }; }
    var g = new Poly(XY).add(rmono(R, XY, 2, 3)).add(rmono(R, XY, 1, 3)); if (g.isZero()) g = Poly.of(XY, [[1, { x: 2 }]]);
    var P = [R.int(-3, 3), R.int(-3, 3)], env = envPt(XY, P), gx = g.d('x').at(env), gy = g.d('y').at(env), down = L >= 2 && R.coin(), N2 = down ? [gx, gy, Q(-1)] : [gx.neg(), gy.neg(), Q(1)];
    return { q: 'Find the ' + (down ? '<b>downward</b>' : 'upward') + ' normal vector of the form $\\langle \\ldots, \\ldots, ' + (down ? '-1' : '1') + ' \\rangle$ to the surface $z = ' + g.toTex() + '$ at the point above $' + ptTex(P) + '$.', a: { t: 'tuple', v: vPlain(N2) },
      steps: ['With $\\mathbf{r}(x, y) = \\langle x, y, f(x, y) \\rangle$, $\\mathbf{r}_x \\times \\mathbf{r}_y = \\langle -f_x, -f_y, 1 \\rangle$, which points up.', '$f_x = ' + g.d('x').toTex() + '$ and $f_y = ' + g.d('y').toTex() + '$; at $' + ptTex(P) + '$ they are $' + gx.toTex() + '$ and $' + gy.toTex() + '$.', down ? 'Upward: $' + vTex([gx.neg(), gy.neg(), 1]) + '$. Downward is its negative: $' + vTex(N2) + '$.' : 'Upward normal: $' + vTex(N2) + '$.'],
      hint: 'Use $\\langle -f_x, -f_y, 1 \\rangle$ for upward' + (down ? ', then flip it.' : '.'), chk: { k: 'graphN', g: g.toPlain(), P: P, down: down } };
  });

  G('calc4.flux-integrals', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['plane', 'which', 'plane'], ['plane', 'graph', 'cyl', 'sphere'], ['graph', 'sphere', 'cyl', 'sphere']));
    if (kind === 'which') { var right = '$\\displaystyle\\iint_D \\left(-P f_x - Q f_y + R\\right) dA$';
      return { q: 'For the graph $z = f(x, y)$ over $D$, oriented upward, which double integral is the flux $\\iint_S \\mathbf{F} \\cdot d\\mathbf{S}$ of $\\mathbf{F} = \\langle P, Q, R \\rangle$?', a: mc(R, right, ['$\\displaystyle\\iint_D \\left(P f_x + Q f_y + R\\right) dA$', '$\\displaystyle\\iint_D \\left(-P f_x - Q f_y + R\\right) dS$', '$\\displaystyle\\iint_D (P + Q + R)\\,dA$']),
        steps: ['$d\\mathbf{S} = (\\mathbf{r}_x \\times \\mathbf{r}_y)\\,dA = \\langle -f_x, -f_y, 1 \\rangle\\,dA$ for the upward orientation.', 'So $\\mathbf{F} \\cdot d\\mathbf{S} = (-P f_x - Q f_y + R)\\,dA$.', 'Writing $dS = \\sqrt{1 + f_x^2 + f_y^2}\\,dA$ there would count the stretch twice: it is already inside the length of $\\langle -f_x, -f_y, 1 \\rangle$.'],
        hint: 'Write $d\\mathbf{S} = \\langle -f_x, -f_y, 1 \\rangle\\,dA$ and dot.', chk: { k: 'which', ans: right } }; }
    if (kind === 'plane' || kind === 'graph') {
      var F = polyF3(R, 1, 3), p = R.int(1, 2), qq = R.int(1, 2), gg = kind === 'plane' ? Poly.of(XY, [[R.int(1, 6), {}], [R.int(-2, 2), { x: 1 }], [R.int(-2, 2), { y: 1 }]]) : Poly.of(XY, [[R.nz(-2, 2), { x: 2 }], [R.int(-1, 1), { y: 2 }], [R.int(0, 3), {}]]);
      var mp = { __vars: XY, x: Poly.v(XY, 'x'), y: Poly.v(XY, 'y'), z: gg }, Fs = F.map(function (c) { return c.substAll(mp); }), integ = Fs[0].mul(gg.d('x')).neg().sub(Fs[1].mul(gg.d('y'))).add(Fs[2]), val = integ.defint('y', 0, qq).defint('x', 0, p).cval();
      return { q: 'Find the flux of $\\mathbf{F}(x, y, z) = ' + fieldTex(F) + '$ upward through the surface $z = ' + gg.toTex() + '$ over the rectangle $0 \\le x \\le ' + p + '$, $0 \\le y \\le ' + qq + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['Upward: $d\\mathbf{S} = \\langle -f_x, -f_y, 1 \\rangle\\,dA = \\langle ' + gg.d('x').neg().toTex() + ', ' + gg.d('y').neg().toTex() + ', 1 \\rangle\\,dA$.', 'On the surface, $\\mathbf{F} \\cdot d\\mathbf{S} = \\left(' + integ.toTex() + '\\right) dA$.', '$\\int_0^{' + p + '} \\int_0^{' + qq + '} ' + integ.texParen() + '\\,dy\\,dx = ' + val.toTex() + '$.'],
        hint: 'Substitute $z = f(x, y)$ into $\\mathbf{F}$ and dot with $\\langle -f_x, -f_y, 1 \\rangle$.', chk: { k: 'graph', F: fieldPlain(F), g: gg.toPlain(), p: p, q: qq } };
    }
    if (kind === 'cyl') { var a = R.int(2, 3), h = R.int(1, 3), Fc = polyF3(R, 1, 3), val2 = fluxCylSide(Fc, a, h);
      if (rpNum(val2) === 0 && R.chance(0.7)) { Fc[0] = Fc[0].add(Poly.v(XYZ, 'x')); val2 = fluxCylSide(Fc, a, h); }
      return { q: 'Find the outward flux of $\\mathbf{F}(x, y, z) = ' + fieldTex(Fc) + '$ through the side of the cylinder $x^2 + y^2 = ' + a * a + '$, $0 \\le z \\le ' + h + '$ (no top or bottom).', a: { t: 'num', v: rpPlain(val2) },
        steps: ['$\\mathbf{r}(\\theta, z) = \\langle ' + a + '\\cos\\theta, ' + a + '\\sin\\theta, z \\rangle$; $\\mathbf{r}_\\theta \\times \\mathbf{r}_z = \\langle ' + a + '\\cos\\theta, ' + a + '\\sin\\theta, 0 \\rangle$ points outward.', 'So $\\mathbf{F} \\cdot d\\mathbf{S} = ' + a + '(P\\cos\\theta + Q\\sin\\theta)\\,d\\theta\\,dz$ with $x = ' + a + '\\cos\\theta$, $y = ' + a + '\\sin\\theta$.', 'Integrating over $0 \\le \\theta \\le 2\\pi$, $0 \\le z \\le ' + h + '$ gives $' + rpTex(val2) + '$.'],
        hint: 'Only $P$ and $Q$ matter on the side: the normal has no $z$-component.', chk: { k: 'cyl', F: fieldPlain(Fc), a: a, h: h } }; }
    var a2 = R.int(2, 3), phEnd = R.pick([2, 1]), Fs2 = polyF3(R, 1, 3); if (phEnd === 2) Fs2 = Fs2.map(function (c, i) { return c.add(Poly.v(XYZ, XYZ[i]).scale(R.int(0, 2))); });
    var val3 = fluxSphere(Fs2, a2, phEnd);
    return { q: 'Find the outward flux of $\\mathbf{F}(x, y, z) = ' + fieldTex(Fs2) + '$ through ' + sphereTex(a2, phEnd) + (phEnd === 1 ? ' (no base)' : '') + '.', a: { t: 'num', v: rpPlain(val3) },
      steps: ['On a sphere of radius $a$ the outward unit normal is $\\mathbf{n} = \\frac{1}{a}\\langle x, y, z \\rangle$, and $dS = a^2\\sin\\varphi\\,d\\varphi\\,d\\theta$.', 'So $\\mathbf{F} \\cdot \\mathbf{n} = \\frac{1}{' + a2 + '}\\left(' + fDotR(Fs2).toTex() + '\\right)$.', 'In spherical coordinates, integrating over $\\theta \\in [0, 2\\pi]$ and $\\varphi \\in [0, ' + (phEnd === 2 ? '\\pi' : '\\frac{\\pi}{2}') + ']$ gives $' + rpTex(val3) + '$.'],
      hint: 'Use $\\mathbf{n} = \\langle x, y, z \\rangle / a$ and spherical coordinates.', chk: { k: 'sphere', F: fieldPlain(Fs2), a: a2, ph: phEnd } };
  });


  // ===================================================================== g4_5thm.js
  // ---------- calc4 unit: Stokes' and Divergence Theorems ----------
  function at0(F) { return F.map(function (c) { return c.substAll({ __vars: XY, x: Poly.v(XY, 'x'), y: Poly.v(XY, 'y'), z: 0 }); }); }
  function atZ(f, z) { return f.substAll({ __vars: XY, x: Poly.v(XY, 'x'), y: Poly.v(XY, 'y'), z: z }); }
  function curlP(F) { return [F[2].d('y').sub(F[1].d('z')), F[0].d('z').sub(F[2].d('x')), F[1].d('x').sub(F[0].d('y'))]; }
  function negParen(p) { var t = p.toTex(); return Object.keys(p.m).length > 1 || t[0] === '-' ? '\\left(' + t + '\\right)' : t; }
  function termSum(ps) { // P_x + Q_y + R_z written out with honest signs and parentheses
    var nz = ps.filter(function (p) { return !p.isZero(); }); if (!nz.length) return '0'; ps = nz;
    return ps.map(function (p, i) { var t = p.toTex(), many = Object.keys(p.m).length > 1; if (i === 0) return many ? '\\left(' + t + '\\right)' : t; if (many) return ' + \\left(' + t + '\\right)'; return t[0] === '-' ? ' - ' + t.slice(1) : ' + ' + t; }).join('');
  }
  function divP(F) { return F[0].d('x').add(F[1].d('y')).add(F[2].d('z')); }
  function capTex(kind, a) { return kind === 'hemi' ? 'the upper hemisphere $x^2 + y^2 + z^2 = ' + a * a + '$, $z \\ge 0$' : 'the paraboloid $z = ' + a * a + ' - x^2 - y^2$, $z \\ge 0$'; }

  G('calc4.stokes-theorem', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['const', 'orient', 'cap'], ['cap', 'const', 'tri', 'orient'], ['tri', 'cap', 'tri', 'const']));
    if (kind === 'orient') { var right = 'Counterclockwise, as seen from above';
      return { q: 'A surface $S$ above the $xy$-plane is oriented with its normal pointing upward, and its boundary is a circle in the $xy$-plane. For Stokes\' theorem, which way must the boundary circle be traced?', a: mc(R, right, ['Clockwise, as seen from above', 'Either way gives the same value', 'It depends on the shape of $S$']),
        steps: ['The right-hand rule: with your thumb along the normal $\\mathbf{n}$, your fingers curl in the direction of the boundary.', 'Thumb up means fingers curl counterclockwise as seen from above.', 'Equivalently: walk along the boundary with your head pointing along $\\mathbf{n}$, and the surface stays on your left.'],
        hint: 'Right-hand rule: thumb along the normal.', chk: { k: 'which', ans: right } }; }
    if (kind === 'const') { var F = [0, 1, 2].map(function () { return Poly.of(XYZ, [[R.int(-3, 3), { x: 1 }], [R.int(-3, 3), { y: 1 }], [R.int(-3, 3), { z: 1 }]]); }), c = curlP(F).map(function (p) { return p.cval(); });
      if (c[2].isZero()) { F[1] = F[1].add(Poly.v(XYZ, 'x').scale(R.nz(-2, 2))); c = curlP(F).map(function (p) { return p.cval(); }); }
      var a = R.int(1, 3), h = R.int(-2, 3), val = c[2].mul(a * a);
      return { q: 'Use Stokes\' theorem to find the circulation of $\\mathbf{F}(x, y, z) = ' + fieldTex(F) + '$ around the circle $x^2 + y^2 = ' + a * a + '$ in the plane $z = ' + h + '$, counterclockwise as seen from above.', a: { t: 'num', v: piPlain(val) },
        steps: ['Take $S$ to be the flat disk inside the circle, with upward normal $\\mathbf{k}$ (matching counterclockwise).', '$\\nabla \\times \\mathbf{F} = ' + vTex(c) + '$, a constant vector, so $(\\nabla \\times \\mathbf{F}) \\cdot \\mathbf{k} = ' + c[2].toTex() + '$.', 'Circulation $= \\iint_S ' + pf(c[2]) + '\\,dS = ' + c[2].toTex() + ' \\cdot \\pi \\cdot ' + a * a + ' = ' + piTex(val) + '$.'],
        hint: 'The curl of a linear field is constant; dot it with the normal and multiply by the area.', chk: { k: 'const', F: fieldPlain(F), a: a, h: h } }; }
    if (kind === 'cap') { var Fc = polyF3(R, 2, 3), cp = R.pick(['hemi', 'parab']), a2 = R.int(1, 3), W = workCircle(at0(Fc), 0, 0, a2, 0, 4);
      return { q: 'Use Stokes\' theorem to find $\\displaystyle\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$ for $\\mathbf{F}(x, y, z) = ' + fieldTex(Fc) + '$, where $S$ is ' + capTex(cp, a2) + ', oriented upward.', a: { t: 'num', v: rpPlain(W.val) },
        steps: ['The boundary of $S$ is the circle $x^2 + y^2 = ' + a2 * a2 + '$, $z = 0$. Upward normal means counterclockwise as seen from above.', 'Stokes: $\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S} = \\oint_C \\mathbf{F} \\cdot d\\mathbf{r}$. On $C$: $z = 0$ and $dz = 0$, so only $P(x, y, 0) = ' + at0(Fc)[0].toTex() + '$ and $Q(x, y, 0) = ' + at0(Fc)[1].toTex() + '$ matter.', 'With $x = ' + T.coef(a2, '\\cos\\theta') + '$, $y = ' + T.coef(a2, '\\sin\\theta') + '$: $\\oint_C P\\,dx + Q\\,dy = \\int_0^{2\\pi} \\left(' + W.g.toTex() + '\\right) d\\theta = ' + rpTex(W.val) + '$.'],
        hint: 'Replace the surface integral by the circulation around the boundary circle.', chk: { k: 'cap', F: fieldPlain(Fc), cap: cp, a: a2 } }; }
    var Ft = polyF3(R, 1, 3), A = [R.int(1, 3), 0, 0], B = [0, R.int(1, 3), 0], C = [0, 0, R.int(1, 3)];
    var w1 = workPoly(Ft, XYZ, segParam(A, B), 0, 1).val, w2 = workPoly(Ft, XYZ, segParam(B, C), 0, 1).val, w3 = workPoly(Ft, XYZ, segParam(C, A), 0, 1).val, tot = w1.add(w2).add(w3);
    return { q: 'Let $S$ be the triangle with vertices $' + ptTex(A) + '$, $' + ptTex(B) + '$, $' + ptTex(C) + '$, oriented upward (away from the origin). Find $\\displaystyle\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$ for $\\mathbf{F}(x, y, z) = ' + fieldTex(Ft) + '$.', a: { t: 'num', v: tot.toPlain() },
      steps: ['Stokes: the flux of the curl equals the circulation around the boundary, traced $' + ptTex(A) + ' \\to ' + ptTex(B) + ' \\to ' + ptTex(C) + ' \\to ' + ptTex(A) + '$ (counterclockwise seen from the side the normal points to).', 'Parametrize each side as $P + t(Q - P)$, $0 \\le t \\le 1$, and integrate $\\mathbf{F} \\cdot \\mathbf{r}\'(t)$: the three sides give $' + w1.toTex() + '$, $' + w2.toTex() + '$ and $' + w3.toTex() + '$.', 'Total: $' + tot.toTex() + '$. (Computing $\\nabla \\times \\mathbf{F}$ and integrating over the triangle gives the same.)'],
      hint: 'Integrate around the three sides instead of over the triangle.', chk: { k: 'tri', F: fieldPlain(Ft), A: A, B: B, C: C } };
  });

  G('calc4.stokes-surfaces', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['cap', 'tf', 'cap'], ['cap', 'can', 'tf'], ['can', 'cap', 'can']));
    if (kind === 'tf') { var S = R.pick([
        ['If two oriented surfaces have the same boundary curve, with matching orientations, then $\\iint (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$ is the same over both.', true, 'Both equal $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r}$ by Stokes\' theorem.'],
        ['If two oriented surfaces have the same boundary curve, then $\\iint \\mathbf{F} \\cdot d\\mathbf{S}$ is the same over both, for any field $\\mathbf{F}$.', false, 'Only fluxes of curls are guaranteed to agree. A general $\\mathbf{F}$ can have different flux through the two surfaces (their difference is $\\iiint \\nabla \\cdot \\mathbf{F}\\,dV$ over the solid between them).'],
        ['The flux of $\\nabla \\times \\mathbf{F}$ out of a closed surface, such as a sphere, is $0$.', true, 'A closed surface has no boundary curve, so Stokes gives $0$. (Also $\\nabla \\cdot (\\nabla \\times \\mathbf{F}) = 0$.)'],
        ['To use Stokes\' theorem, the surface must be flat.', false, 'Any piecewise smooth oriented surface with a boundary curve works; switching to a flat one is a convenience.']]);
      return { q: 'True or false: ' + S[0], a: { t: 'tf', v: S[1] }, steps: [S[2]], hint: 'Stokes\' theorem: the flux of a curl depends only on the boundary curve.', chk: { k: 'tf' } }; }
    var F = polyF3(R, 2, 3), cu = curlP(F), a = R.int(1, 3), cz = atZ(cu[2], 0);
    if (cz.isZero()) { F[1] = F[1].add(Poly.of(XYZ, [[R.nz(-2, 2), { x: 1 }]])); cu = curlP(F); cz = atZ(cu[2], 0); }
    var val = diskInt(cz, a), h = R.int(1, 3), cp = R.pick(['hemi', 'parab']);
    var surf = kind === 'can' ? 'the side and top of the cylinder $x^2 + y^2 = ' + a * a + '$, $0 \\le z \\le ' + h + '$ (open at the bottom), with outward normal' : capTex(cp, a) + ', oriented upward';
    return { q: 'Find $\\displaystyle\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$ for $\\mathbf{F}(x, y, z) = ' + fieldTex(F) + '$, where $S$ is ' + surf + '. (Hint: change the surface.)', a: { t: 'num', v: rpPlain(val) },
      steps: ['The boundary of $S$ is the circle $x^2 + y^2 = ' + a * a + '$ in the plane $z = 0$, traced counterclockwise seen from above (right-hand rule).', 'The flat disk $D$: $x^2 + y^2 \\le ' + a * a + '$, $z = 0$, with upward normal $\\mathbf{k}$, has the same oriented boundary, so by Stokes\' theorem it has the same curl flux.', '$\\nabla \\times \\mathbf{F} = \\left\\langle ' + cu.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle$; on $D$ we need only the $\\mathbf{k}$-component at $z = 0$: $' + cz.toTex() + '$.', 'In polar coordinates: $\\iint_D \\left(' + cz.toTex() + '\\right) dA = ' + rpTex(val) + '$.'],
      hint: 'Any surface with the same oriented boundary gives the same flux of the curl. Use the flat disk.', chk: { k: kind, F: fieldPlain(F), a: a, h: h, cap: cp } };
  });

  G('calc4.divergence-theorem', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['box', 'closed', 'box'], ['box', 'ball', 'cyl', 'closed'], ['ball', 'cyl', 'box', 'ball']));
    if (kind === 'closed') { var right = 'The surface of a solid cylinder, including top and bottom';
      return { q: 'To which surface can the divergence theorem $\\iint_S \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_E \\nabla \\cdot \\mathbf{F}\\,dV$ be applied directly?', a: mc(R, right, ['The upper hemisphere $x^2 + y^2 + z^2 = 1$, $z \\ge 0$', 'The side of a cylinder, without top and bottom', 'A flat disk in the $xy$-plane']),
        steps: ['The theorem needs $S$ to be the whole boundary of a solid $E$: a closed surface, oriented outward.', 'A hemisphere without its base, a cylinder without its lids, and a disk all have edges, so they do not enclose a solid.', 'To use the theorem on such a surface, add the missing pieces, apply the theorem to the closed surface, and subtract the flux through the added pieces.'],
        hint: 'The surface must enclose a solid.', chk: { k: 'which', ans: right } }; }
    var F = polyF3(R, 2, 3);
    if (kind === 'ball') F = F.map(function (c, i) { return R.chance(0.4) ? c.add(Poly.v(XYZ, XYZ[i]).mul(Poly.v(XYZ, XYZ[(i + 1) % 3]).pow(2)).scale(R.nz(-2, 2))) : c; });
    var dv = divP(F), val, how;
    if (kind === 'box') { var a = R.int(1, 3), b = R.int(1, 3), c = R.int(1, 3), v0 = dv.defint('z', 0, c).defint('y', 0, b).defint('x', 0, a).cval(); val = { r: v0, p: Q(0) };
      how = 'Over the box: $\\int_0^{' + a + '} \\int_0^{' + b + '} \\int_0^{' + c + '} ' + dv.texParen() + '\\,dz\\,dy\\,dx = ' + v0.toTex() + '$.';
      var shape = 'the surface of the box $[0, ' + a + '] \\times [0, ' + b + '] \\times [0, ' + c + ']$', chk = { k: 'box', F: fieldPlain(F), a: a, b: b, c: c }; }
    else if (kind === 'ball') { var r0 = R.int(1, 2); val = ballInt(dv, r0, 2); how = 'In spherical coordinates over the ball of radius $' + r0 + '$ ($dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta$; odd powers of $x$, $y$ or $z$ integrate to $0$ by symmetry): $' + rpTex(val) + '$.';
      shape = 'the sphere $x^2 + y^2 + z^2 = ' + r0 * r0 + '$'; chk = { k: 'ball', F: fieldPlain(F), a: r0 }; }
    else { var a3 = R.int(1, 2), h = R.int(1, 3); val = cylVol(dv, a3, h); how = 'In cylindrical coordinates over $0 \\le r \\le ' + a3 + '$, $0 \\le z \\le ' + h + '$ ($dV = r\\,dz\\,dr\\,d\\theta$): $' + rpTex(val) + '$.';
      shape = 'the closed cylinder $x^2 + y^2 = ' + a3 * a3 + '$, $0 \\le z \\le ' + h + '$, with its top and bottom'; chk = { k: 'cyl', F: fieldPlain(F), a: a3, h: h }; }
    return { q: 'Use the divergence theorem to find the outward flux of $\\mathbf{F}(x, y, z) = ' + fieldTex(F) + '$ through ' + shape + '.', a: { t: 'num', v: rpPlain(val) },
      steps: ['The surface is closed and oriented outward, so the flux equals $\\iiint_E \\nabla \\cdot \\mathbf{F}\\,dV$.', '$\\nabla \\cdot \\mathbf{F} = ' + (function (ts) { return ts === dv.toTex() ? ts : ts + ' = ' + dv.toTex(); })(termSum([F[0].d('x'), F[1].d('y'), F[2].d('z')])) + '$.', how],
      hint: 'Compute the divergence, then integrate it over the solid.', chk: chk };
  });

  G('calc4.divergence-applications', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['vol', 'inv', 'cube5'], ['cube5', 'inv', 'hemi', 'vol'], ['hemi', 'cube5', 'inv', 'hemi']));
    if (kind === 'vol') { var sh = R.pick([['box', 'the box $[0, 2] \\times [0, 3] \\times [0, 1]$', { r: Q(6), p: Q(0) }], ['ball', 'the ball $x^2 + y^2 + z^2 \\le 9$', { r: Q(0), p: Q(36) }], ['cyl', 'the solid cylinder $x^2 + y^2 \\le 4$, $0 \\le z \\le 3$', { r: Q(0), p: Q(12) }], ['cube', 'the cube $[0, 2]^3$', { r: Q(8), p: Q(0) }]]);
      var k = [R.int(1, 3), R.int(0, 3), R.int(0, 3)], ks = k[0] + k[1] + k[2], val = rpScale(sh[2], ks), Fv = [Poly.of(XYZ, [[k[0], { x: 1 }]]), Poly.of(XYZ, [[k[1], { y: 1 }]]), Poly.of(XYZ, [[k[2], { z: 1 }]])];
      return { q: 'Find the outward flux of $\\mathbf{F} = ' + fieldTex(Fv) + '$ out of the boundary of ' + sh[1] + '.', a: { t: 'num', v: rpPlain(val) },
        steps: ['$\\nabla \\cdot \\mathbf{F} = ' + k.join(' + ') + ' = ' + ks + '$, a constant.', 'So the flux is $' + ks + '$ times the volume. The volume is $' + rpTex(sh[2]) + '$.', 'Flux $= ' + rpTex(val) + '$. (With $\\mathbf{F} = \\frac{1}{3}\\langle x, y, z \\rangle$ the flux is exactly the volume: one way to compute volumes from a surface.)'],
        hint: 'A constant divergence times the volume.', chk: { k: 'vol', F: fieldPlain(Fv), sh: sh[0] }, nolint: ['+ 0'] }; }
    if (kind === 'inv') { var c = R.nz(-3, 3), C0 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], d2 = vn2(C0).num(), rad; do { rad = R.int(1, 4); } while (Math.abs(d2 - rad * rad) < 3);
      var inside = d2 < rad * rad, val2 = Q(inside ? 4 * c : 0);
      return { q: 'Find the outward flux of $\\mathbf{F} = ' + (c === 1 ? '' : c === -1 ? '-' : c) + '\\dfrac{\\langle x, y, z \\rangle}{(x^2 + y^2 + z^2)^{3/2}}$ through the sphere with center $' + ptTex(C0) + '$ and radius $' + rad + '$.', a: { t: 'num', v: piPlain(val2) },
        steps: ['Away from the origin, $\\nabla \\cdot \\mathbf{F} = 0$ (the inverse-square field neither spreads nor bunches in empty space).', 'The center is at distance $\\sqrt{' + d2 + '}$ from the origin, ' + (inside ? 'less' : 'more') + ' than the radius $' + rad + '$, so the origin is ' + (inside ? 'inside' : 'outside') + ' the sphere.', inside ? 'Cut out a tiny sphere around the origin. The divergence theorem on the region between gives the same flux through both, and through a tiny sphere of radius $\\varepsilon$ the flux is $' + (c === 1 ? '' : c) + '\\frac{1}{\\varepsilon^2} \\cdot 4\\pi\\varepsilon^2 = ' + piTex(4 * c) + '$.' : 'The field is smooth inside, so the flux is $\\iiint 0\\,dV = 0$.'],
        hint: 'Is the origin, where $\\mathbf{F}$ blows up, inside the surface?', chk: { k: 'inv', c: c, C: C0, r: rad } }; }
    var F = polyF3(R, 2, 3), dv = divP(F);
    if (kind === 'cube5') { var s = R.int(1, 2), tot = dv.defint('z', 0, s).defint('y', 0, s).defint('x', 0, s).cval(), topF = atZ(F[2], s), top = topF.defint('y', 0, s).defint('x', 0, s).cval(), ans = tot.sub(top);
      return { q: 'Find the outward flux of $\\mathbf{F}(x, y, z) = ' + fieldTex(F) + '$ through the five faces of the cube $[0, ' + s + ']^3$ other than the top face $z = ' + s + '$.', a: { t: 'num', v: ans.toPlain() },
        steps: ['All six faces: by the divergence theorem the flux is $\\iiint (\\nabla \\cdot \\mathbf{F})\\,dV$ with $\\nabla \\cdot \\mathbf{F} = ' + dv.toTex() + '$: that is $' + tot.toTex() + '$.', 'The top face has normal $\\mathbf{k}$: its flux is $\\int_0^{' + s + '} \\int_0^{' + s + '} R(x, y, ' + s + ')\\,dy\\,dx = \\iint ' + topF.texParen() + '\\,dA = ' + top.toTex() + '$.', 'Five faces: $' + tot.toTex() + ' - ' + pf(top) + ' = ' + ans.toTex() + '$.'],
        hint: 'Flux through all six faces minus the flux through the top.', chk: { k: 'cube5', F: fieldPlain(F), s: s }, nolint: ['+ 0'] }; }
    var a = R.int(1, 2), Vin = ballInt(dv, a, 1), base = diskInt(at0(F)[2], a), ans2 = rpAdd(Vin, base);
    return { q: 'Find the outward (upward) flux of $\\mathbf{F}(x, y, z) = ' + fieldTex(F) + '$ through the upper hemisphere $x^2 + y^2 + z^2 = ' + a * a + '$, $z \\ge 0$, without its base.', a: { t: 'num', v: rpPlain(ans2) },
      steps: ['Close the surface with the disk $D$: $x^2 + y^2 \\le ' + a * a + '$, $z = 0$, whose outward normal points down, $-\\mathbf{k}$.', 'Divergence theorem on the half ball: hemisphere flux $+$ disk flux $= \\iiint (' + dv.toTex() + ')\\,dV = ' + rpTex(Vin) + '$.', 'Disk flux: $\\iint_D \\mathbf{F} \\cdot (-\\mathbf{k})\\,dA = -\\iint_D ' + negParen(at0(F)[2]) + '\\,dA = ' + rpTex(rpScale(base, -1)) + '$.', 'Hemisphere flux $= ' + rpTex(Vin) + ' - \\left(' + rpTex(rpScale(base, -1)) + '\\right) = ' + rpTex(ans2) + '$.'],
      hint: 'Add the base to make a closed surface, then subtract the base\'s flux.', chk: { k: 'hemi', F: fieldPlain(F), a: a } };
  });

  var BIG = [
    ['$\\int_C \\nabla f \\cdot d\\mathbf{r} = f(B) - f(A)$', 'The fundamental theorem for line integrals'],
    ['$\\oint_C P\\,dx + Q\\,dy = \\iint_D (Q_x - P_y)\\,dA$', 'Green\'s theorem'],
    ['$\\oint_{\\partial S} \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$', 'Stokes\' theorem'],
    ['$\\iint_{\\partial E} \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_E \\nabla \\cdot \\mathbf{F}\\,dV$', 'The divergence theorem'],
    ['$\\int_a^b F\'(x)\\,dx = F(b) - F(a)$', 'The fundamental theorem of calculus']];
  var BIG_TF = [
    ['Green\'s theorem is Stokes\' theorem for a flat region in the $xy$-plane with normal $\\mathbf{k}$.', true, 'With $S$ flat and $\\mathbf{n} = \\mathbf{k}$, $(\\nabla \\times \\mathbf{F}) \\cdot \\mathbf{k} = Q_x - P_y$ and Stokes becomes Green.'],
    ['Each of the big theorems says: a derivative of $\\mathbf{F}$ integrated over a region equals $\\mathbf{F}$ integrated over the boundary of that region.', true, 'Gradient on a curve and values at endpoints; curl on a surface and circulation on its edge; divergence in a solid and flux through its skin.'],
    ['The divergence theorem applies to any surface, closed or not.', false, 'It needs a closed surface: the complete boundary of a solid.'],
    ['$\\nabla \\cdot (\\nabla \\times \\mathbf{F}) = 0$ matches the fact that a closed surface has no boundary curve.', true, 'Divergence theorem plus Stokes: the flux of a curl out of a closed surface is $\\oint$ over an empty boundary, $0$; so the divergence of a curl integrates to $0$ over every solid.'],
    ['$\\nabla \\times (\\nabla f) = \\mathbf{0}$ says that gradient fields have zero circulation around every closed loop.', true, 'By Stokes the circulation is the flux of the curl, and the curl of a gradient is $\\mathbf{0}$. (The fundamental theorem for line integrals says the same thing.)'],
    ['Stokes\' theorem turns a triple integral into a surface integral.', false, 'Stokes relates a surface integral to a line integral. The divergence theorem relates a triple integral to a surface integral.']];
  G('calc4.big-picture', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['match', 'tf', 'match'], ['match', 'tf', 'zero'], ['zero', 'tf', 'match']));
    if (kind === 'match') { var b = R.pick(BIG);
      return { q: 'Which theorem is this? ' + b[0], a: mc(R, b[1], BIG.filter(function (x) { return x !== b; }).map(function (x) { return x[1]; }).slice(0, 3)),
        steps: ['Look at what is integrated on each side: ' + { 0: 'a gradient along a curve on the left, values at the two endpoints on the right.', 1: 'a line integral around a plane curve and a double integral of the scalar curl over the region inside.', 2: 'a circulation around a curve and the flux of the curl through a surface it bounds.', 3: 'a flux out of a closed surface and the divergence integrated over the solid inside.', 4: 'a derivative over an interval and values at its two ends.' }[BIG.indexOf(b)], 'So it is ' + b[1].replace(/^The /, 'the ') + '.'],
        hint: 'What kind of region is on each side: interval, curve, surface or solid?', chk: { k: 'which', ans: b[1] } }; }
    if (kind === 'tf') { var s = R.pick(BIG_TF); return { q: 'True or false: ' + s[0], a: { t: 'tf', v: s[1] }, steps: [s[2]], hint: 'Line up each theorem as "derivative inside = function on the boundary".', chk: { k: 'tf' } }; }
    var F = exField(R, XYZ, 2), cr = curlEx(F), dd = divEx(cr, XYZ), P = [R.int(-2, 2), R.int(-2, 2), R.int(-2, 2)];
    return { q: 'Find $\\nabla \\cdot (\\nabla \\times \\mathbf{F})$ at $' + ptTex(P) + '$ for $$\\mathbf{F}(x, y, z) = \\left\\langle ' + F.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle$$', a: { t: 'num', v: '0' },
      steps: ['$\\nabla \\times \\mathbf{F} = \\left\\langle ' + cr.map(function (c) { return c.toTex(); }).join(', ') + ' \\right\\rangle$.', 'Its divergence is $(R_y - Q_z)_x + (P_z - R_x)_y + (Q_x - P_y)_z = (R_{yx} - R_{xy}) + (P_{zy} - P_{yz}) + (Q_{xz} - Q_{zx})$.', 'Mixed partials are equal (Clairaut), so every pair cancels: $\\nabla \\cdot (\\nabla \\times \\mathbf{F}) = 0$ everywhere, including at $' + ptTex(P) + '$.'],
      hint: 'Write out the divergence of the curl and pair up mixed partials.', chk: { k: 'zero', F: F.map(function (c) { return c.toPlain(); }), P: P } };
  });


  // ===================================================================== g4_6app.js
  // ---------- calc4 unit: Applications ----------
  G('calc4.fluid-flow', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['rate', 'incomp', 'rate'], ['rate', 'net', 'incomp', 'circ'], ['net', 'circ', 'incomp', 'mass']));
    if (kind === 'rate' || kind === 'mass') {
      var v = [R.int(-3, 3), R.int(-3, 3), R.int(1, 4)], a = nzVec(R, -2, 2), b, N; do { b = nzVec(R, -2, 2); N = vcross(a, b); } while (vZero(N));
      if (q(N[2]).sign() < 0) { var tmp = a; a = b; b = tmp; N = vcross(a, b); }
      var P0 = randPt(R, -2, 2), fl = vdot(v, N), rho = kind === 'mass' ? R.int(2, 5) * 100 : 1, val = fl.mul(rho);
      return { q: 'Water moves with constant velocity $\\mathbf{v} = ' + vTex(v) + '$ (meters per second)' + (kind === 'mass' ? ' and has density $' + rho + '$ kg/m$^3$' : '') + '. Find the ' + (kind === 'mass' ? 'mass of water per second (kg/s)' : 'volume of water per second (m$^3$/s)') + ' crossing the parallelogram with corner $' + ptTex(P0) + '$ and edges $' + vTex(a) + '$ and $' + vTex(b) + '$, in the direction of $' + vTex(a) + ' \\times ' + vTex(b) + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['For a constant velocity and a flat piece, the flow rate is $\\mathbf{v} \\cdot \\mathbf{N}$, where $\\mathbf{N}$ is the normal whose length is the area.', '$\\mathbf{N} = ' + vTex(a) + ' \\times ' + vTex(b) + ' = ' + vTex(N) + '$.', '$\\mathbf{v} \\cdot \\mathbf{N} = ' + fl.toTex() + '$ m$^3$/s.' + (kind === 'mass' ? ' Times the density: $' + rho + ' \\cdot ' + pf(fl) + ' = ' + val.toTex() + '$ kg/s.' : ' (Only the part of $\\mathbf{v}$ across the surface counts.)')],
        hint: 'Flow rate $= \\mathbf{v} \\cdot (\\mathbf{a} \\times \\mathbf{b})$ for a flat parallelogram.', chk: { k: 'rate', v: v, a: a, b: b, rho: rho } }; }
    if (kind === 'incomp') { var m = R.nz(-3, 3), n = R.int(-3, 3), al = R.int(-3, 3), be = R.int(-3, 3), ga = R.int(-3, 3), de = R.int(-3, 3), kk = -(m + n);
      var Fq = [T.terms([[1, 'kx'], [al, 'y'], [be, 'z']]), T.terms([[ga, 'x'], [m, 'y'], [de, 'z']]), T.terms([[be + ga, 'x'], [al, 'y'], [n, 'z']]) || '0'];
      return { q: 'For which value of $k$ is the flow $\\mathbf{v}(x, y, z) = \\left\\langle ' + Fq.join(', ') + ' \\right\\rangle$ incompressible ($\\nabla \\cdot \\mathbf{v} = 0$)?', a: { t: 'num', v: String(kk) },
        steps: ['Incompressible means no sources or sinks: $\\nabla \\cdot \\mathbf{v} = 0$ everywhere.', '$\\nabla \\cdot \\mathbf{v} = k + ' + pf(m) + ' + ' + pf(n) + '$.', 'Set it to $0$: $k = ' + kk + '$.'],
        hint: 'Differentiate each component in its own variable and add.', chk: { k: 'incomp', m: m, n: n }, nolint: ['+ 0'] }; }
    if (kind === 'circ') { var F2 = polyF2(R, 1), Rr = R.int(1, 3), W = workCircle(F2, 0, 0, Rr, 0, 4);
      if (rpNum(W.val) === 0) { F2[1] = F2[1].add(Poly.v(XY, 'x').scale(R.nz(-2, 2))); W = workCircle(F2, 0, 0, Rr, 0, 4); }
      var cu = F2[1].d('x').sub(F2[0].d('y'));
      return { q: 'A fluid in the plane has velocity $\\mathbf{v}(x, y) = ' + fieldTex(F2) + '$. Find its circulation around the circle $x^2 + y^2 = ' + Rr * Rr + '$, counterclockwise, and use it to tell whether a small paddle wheel there tends to turn.', a: { t: 'num', v: rpPlain(W.val) },
        steps: ['Circulation $= \\oint_C \\mathbf{v} \\cdot d\\mathbf{r}$. By Green\'s theorem it equals $\\iint_D (Q_x - P_y)\\,dA$.', '$Q_x - P_y = ' + cu.toTex() + '$' + (cu.isConst() ? ', a constant, so the circulation is that constant times the area $' + piTex(Rr * Rr) + '$.' : '.'), 'Circulation $= ' + rpTex(W.val) + '$: ' + (rpNum(W.val) > 0 ? 'positive, so on average the fluid swirls counterclockwise.' : rpNum(W.val) < 0 ? 'negative, so on average the fluid swirls clockwise.' : 'zero, no net swirl.')],
        hint: 'Use Green\'s theorem: the circulation is the total scalar curl inside.', chk: { k: 'circ', F: fieldPlain(F2), R: Rr } }; }
    var F = polyF3(R, 2, 3), s1 = R.int(1, 2), s2 = R.int(1, 2), s3 = R.int(1, 2), dv = divP(F), tot = dv.defint('z', 0, s3).defint('y', 0, s2).defint('x', 0, s1).cval();
    return { q: 'A fluid has velocity $\\mathbf{v}(x, y, z) = ' + fieldTex(F) + '$. Find the net rate at which fluid flows out of the box $[0, ' + s1 + '] \\times [0, ' + s2 + '] \\times [0, ' + s3 + ']$.', a: { t: 'num', v: tot.toPlain() },
      steps: ['Net outflow is the flux through the closed surface of the box. By the divergence theorem it is $\\iiint \\nabla \\cdot \\mathbf{v}\\,dV$.', '$\\nabla \\cdot \\mathbf{v} = ' + dv.toTex() + '$: the rate of outflow per unit volume at each point.', '$\\int_0^{' + s1 + '} \\int_0^{' + s2 + '} \\int_0^{' + s3 + '} ' + dv.texParen() + '\\,dz\\,dy\\,dx = ' + tot.toTex() + '$. ' + (tot.sign() > 0 ? 'Positive: more leaves than enters, so there are sources inside.' : tot.sign() < 0 ? 'Negative: more enters than leaves.' : 'Zero: what enters also leaves.')],
      hint: 'Integrate the divergence over the box.', chk: { k: 'net', F: fieldPlain(F), s: [s1, s2, s3] } };
  });

  G('calc4.gauss-law', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['enclosed', 'shape', 'enclosed'], ['enclosed', 'ball', 'density', 'shape'], ['ball', 'line', 'density', 'enclosed']));
    if (kind === 'shape') { var S = R.pick([
        ['A point charge $q$ sits at the center of a sphere. Doubling the sphere\'s radius doubles the electric flux through it.', false, 'The field strength drops like $1/r^2$ while the area grows like $r^2$; the flux stays $q/\\varepsilon_0$.'],
        ['The electric flux through a closed surface depends only on the charge inside, not on the surface\'s shape.', true, 'Gauss\'s law: $\\iint_S \\mathbf{E} \\cdot d\\mathbf{S} = Q_{\\text{enc}}/\\varepsilon_0$.'],
        ['A charge outside a closed surface adds nothing to the net flux through it.', true, 'Its field lines go in and come back out: $\\nabla \\cdot \\mathbf{E} = 0$ inside the surface, so the net flux from it is $0$.'],
        ['If the net flux through a closed surface is $0$, the electric field on the surface must be $\\mathbf{0}$.', false, 'Only the total is $0$: a charge outside the surface gives a nonzero field with zero net flux.']]);
      return { q: 'True or false: ' + S[0], a: { t: 'tf', v: S[1] }, steps: [S[2]], hint: 'Gauss\'s law counts only the enclosed charge.', chk: { k: 'tf' } }; }
    if (kind === 'enclosed') { var n = R.int(3, 4), pts = [], qs = [], rad = R.int(2, 4);
      while (pts.length < n) { var p = randPt(R, -4, 4), d = vn2(p).num(); if (d === rad * rad || pts.some(function (x) { return x.join() === p.join(); })) continue; pts.push(p); qs.push(R.nz(-5, 5)); }
      var enc = 0, lines = pts.map(function (p, i) { var d2 = vn2(p).num(), inn = d2 < rad * rad; if (inn) enc += qs[i]; return '$' + qs[i] + '$ at $' + ptTex(p) + '$: $|\\mathbf{r}|^2 = ' + d2 + '$, ' + (inn ? 'inside' : 'outside'); });
      return { q: 'Point charges (in microcoulombs) are placed as follows: ' + pts.map(function (p, i) { return '$' + qs[i] + '$ at $' + ptTex(p) + '$'; }).join(', ') + '. The electric flux through the sphere $x^2 + y^2 + z^2 = ' + rad * rad + '$ is $k/\\varepsilon_0$ microcoulombs. Find $k$.', a: { t: 'num', v: String(enc) },
        steps: ['Gauss\'s law: the flux equals $Q_{\\text{enc}}/\\varepsilon_0$, the charge inside divided by $\\varepsilon_0$.', 'A charge is inside when its distance squared from the origin is less than $' + rad * rad + '$.'].concat(lines.map(function (s) { return s + '.'; })).concat(['$k = Q_{\\text{enc}} = ' + enc + '$.']),
        hint: 'Add up only the charges inside the sphere.', chk: { k: 'enclosed', pts: pts, qs: qs, r: rad } }; }
    if (kind === 'ball') { var Rb = R.int(2, 4), rr = R.pick([Q(R.int(1, 2 * Rb - 1), 2), Q(R.int(Rb + 1, 2 * Rb + 2))]), inside = rr.lt(Rb), val = inside ? rr.div(Rb * Rb * Rb) : Q(1).div(rr.mul(rr));
      return { q: 'A ball of radius $' + Rb + '$ carries total charge $Q$ spread uniformly through its volume. At distance $r = ' + rr.toTex() + '$ from the center, the field has magnitude $E = k\\dfrac{Q}{4\\pi\\varepsilon_0}$. Find $k$.', a: { t: 'num', v: val.toPlain() },
        steps: ['By symmetry $\\mathbf{E}$ points radially with magnitude $E(r)$. On the sphere of radius $r$: $\\iint \\mathbf{E} \\cdot d\\mathbf{S} = E \\cdot 4\\pi r^2$.', inside ? 'Inside the ball ($r < ' + Rb + '$) the enclosed charge is the fraction $r^3/' + Rb * Rb * Rb + '$ of $Q$.' : 'Outside the ball ($r > ' + Rb + '$) all of $Q$ is enclosed.', inside ? 'Gauss: $E \\cdot 4\\pi r^2 = \\frac{Q r^3}{' + Rb * Rb * Rb + '\\varepsilon_0}$, so $E = \\frac{Q}{4\\pi\\varepsilon_0} \\cdot \\frac{r}{' + Rb * Rb * Rb + '}$ and $k = ' + rr.toTex() + ' \\cdot \\frac{1}{' + Rb * Rb * Rb + '} = ' + val.toTex() + '$.' : 'Gauss: $E \\cdot 4\\pi r^2 = Q/\\varepsilon_0$, so $E = \\frac{Q}{4\\pi\\varepsilon_0} \\cdot \\frac{1}{r^2}$ and $k = ' + val.toTex() + '$, as if all the charge sat at the center.'],
        hint: 'Use a Gaussian sphere of radius $r$; how much charge does it enclose?', chk: { k: 'ball', R: Rb, r: qn(rr) } }; }
    if (kind === 'line') { var rl = R.int(1, 5);
      return { q: 'An infinitely long straight wire carries charge $\\lambda$ per unit length. At distance $r = ' + rl + '$ from the wire the field has magnitude $E = k\\dfrac{\\lambda}{\\varepsilon_0}$. Find $k$.', a: { t: 'num', v: '1/(' + 2 * rl + '*pi)' },
        steps: ['By symmetry $\\mathbf{E}$ points straight away from the wire. Use a closed cylinder of radius $r$ and length $\\ell$ around it.', 'Flux through the ends is $0$ (the field is parallel to them); through the side it is $E \\cdot 2\\pi r\\ell$.', 'Gauss: $E \\cdot 2\\pi r \\ell = \\lambda \\ell/\\varepsilon_0$, so $E = \\frac{\\lambda}{2\\pi r \\varepsilon_0}$ and $k = \\frac{1}{' + 2 * rl + '\\pi}$.'],
        hint: 'Use a cylinder around the wire as the closed surface.', chk: { k: 'line', r: rl } }; }
    var E = polyF3(R, 2, 3), P = randPt(R, -2, 2), dv = divP(E), val2 = dv.at(envPt(XYZ, P));
    return { q: 'An electric field is $\\mathbf{E}(x, y, z) = ' + fieldTex(E) + '$. Use the differential form of Gauss\'s law, $\\nabla \\cdot \\mathbf{E} = \\rho/\\varepsilon_0$, to find $\\rho/\\varepsilon_0$ at $' + ptTex(P) + '$.', a: { t: 'num', v: val2.toPlain() },
      steps: ['The divergence theorem turns $\\iint_S \\mathbf{E} \\cdot d\\mathbf{S} = Q_{\\text{enc}}/\\varepsilon_0$ into $\\iiint (\\nabla \\cdot \\mathbf{E})\\,dV = \\iiint \\rho/\\varepsilon_0\\,dV$ for every region, so $\\nabla \\cdot \\mathbf{E} = \\rho/\\varepsilon_0$.', '$\\nabla \\cdot \\mathbf{E} = ' + dv.toTex() + '$.', 'At $' + ptTex(P) + '$: $' + val2.toTex() + '$.'],
      hint: 'Charge density shows up as divergence.', chk: { k: 'density', F: fieldPlain(E), P: P } };
  });

  var MAXW = [
    ['$\\nabla \\cdot \\mathbf{E} = \\rho/\\varepsilon_0$', 'Gauss\'s law: electric flux out of a closed surface is the enclosed charge over $\\varepsilon_0$'],
    ['$\\nabla \\cdot \\mathbf{B} = 0$', 'No magnetic charges: the magnetic flux out of every closed surface is $0$'],
    ['$\\nabla \\times \\mathbf{E} = -\\partial \\mathbf{B}/\\partial t$', 'Faraday\'s law: a changing magnetic flux through a loop drives a circulation of $\\mathbf{E}$ around it'],
    ['$\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0\\,\\partial \\mathbf{E}/\\partial t$', 'Ampère–Maxwell law: current (and changing electric flux) through a loop drives a circulation of $\\mathbf{B}$ around it']];
  G('calc4.maxwell-equations', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['match', 'amp', 'match'], ['match', 'divB', 'amp', 'faraday'], ['faraday', 'divB', 'amp', 'match']));
    if (kind === 'match') { var m = R.pick(MAXW);
      return { q: 'Which statement is the integral form of the equation ' + m[0] + '?', a: mc(R, m[1], MAXW.filter(function (x) { return x !== m; }).map(function (x) { return x[1]; })),
        steps: [MAXW.indexOf(m) < 2 ? 'A divergence equation becomes a statement about flux through a closed surface (divergence theorem).' : 'A curl equation becomes a statement about circulation around a loop (Stokes\' theorem).', m[1] + '.'],
        hint: 'Divergence goes with closed surfaces; curl goes with loops.', chk: { k: 'which', ans: m[1] } }; }
    if (kind === 'divB') { var B = polyF3(R, 2, 3), ok = R.coin(); if (ok) { var d = divP(B); B[2] = B[2].sub(d.integ('z')); } var dv = divP(B), isOk = dv.isZero();
      return { q: 'Could $\\mathbf{B}(x, y, z) = ' + fieldTex(B) + '$ be a magnetic field?', a: { t: 'tf', v: isOk },
        steps: ['Every magnetic field satisfies $\\nabla \\cdot \\mathbf{B} = 0$ (no magnetic charges).', '$\\nabla \\cdot \\mathbf{B} = ' + dv.toTex() + '$.', isOk ? 'It is $0$ everywhere, so it passes this test.' : 'It is not identically $0$, so $\\mathbf{B}$ cannot be a magnetic field.'],
        hint: 'Compute the divergence.', chk: { k: 'divB', F: fieldPlain(B) } }; }
    if (kind === 'amp') { var n = R.int(2, 4), ws = [], cur = [], rad = R.int(2, 4), enc = 0, lines = [];
      while (ws.length < n) { var w = [R.int(-4, 4), R.int(-4, 4)], d2 = w[0] * w[0] + w[1] * w[1]; if (d2 === rad * rad || ws.some(function (x) { return x.join() === w.join(); })) continue; ws.push(w); cur.push(R.nz(-6, 6)); }
      ws.forEach(function (w, i) { var d2 = w[0] * w[0] + w[1] * w[1], inn = d2 < rad * rad; if (inn) enc += cur[i]; lines.push('Wire at $' + ptTex(w) + '$ ($' + cur[i] + '$ A): ' + (inn ? 'inside' : 'outside')); });
      return { q: 'Long straight wires run parallel to the $z$-axis, carrying steady currents (in amperes, positive means in the $+z$ direction): ' + ws.map(function (w, i) { return '$' + cur[i] + '$ through $' + ptTex(w) + '$'; }).join(', ') + '. Find $\\frac{1}{\\mu_0}\\oint_C \\mathbf{B} \\cdot d\\mathbf{r}$ for the circle $C$: $x^2 + y^2 = ' + rad * rad + '$ in the $xy$-plane, counterclockwise seen from above.', a: { t: 'num', v: String(enc) },
        steps: ['For steady currents, Ampère\'s law: $\\oint_C \\mathbf{B} \\cdot d\\mathbf{r} = \\mu_0 I_{\\text{enc}}$, where currents in the direction given by the right-hand rule (here $+z$) count positive.'].concat(lines.map(function (s) { return s + '.'; })).concat(['$I_{\\text{enc}} = ' + enc + '$ A.']),
        hint: 'Only currents passing through the disk inside $C$ count.', chk: { k: 'amp', ws: ws, cur: cur, r: rad } }; }
    var a = R.int(1, 3), b1 = R.nz(-4, 4), b0 = R.int(0, 3), val = Q(-a * a * b1);
    return { q: 'A uniform magnetic field $\\mathbf{B} = \\langle 0, 0, ' + T.lin(b1, 't', b0) + ' \\rangle$ (teslas, $t$ in seconds) passes through the circle $x^2 + y^2 = ' + a * a + '$ in the $xy$-plane. Find $\\oint_C \\mathbf{E} \\cdot d\\mathbf{r}$ (volts) with $C$ counterclockwise seen from above.', a: { t: 'num', v: piPlain(val) },
      steps: ['Faraday\'s law in integral form (Stokes\' theorem applied to $\\nabla \\times \\mathbf{E} = -\\partial \\mathbf{B}/\\partial t$): $\\oint_C \\mathbf{E} \\cdot d\\mathbf{r} = -\\frac{d}{dt}\\iint_S \\mathbf{B} \\cdot d\\mathbf{S}$.', 'With the upward normal (matching counterclockwise), the flux is $(' + T.lin(b1, 't', b0) + ') \\cdot ' + piTex(a * a) + '$.', 'Its rate of change is $' + piTex(a * a * b1) + '$, so $\\oint_C \\mathbf{E} \\cdot d\\mathbf{r} = ' + piTex(val) + '$ volts.'],
      hint: 'Circulation of $\\mathbf{E}$ equals minus the rate of change of magnetic flux.', chk: { k: 'faraday', a: a, b1: b1 } };
  });

  G('calc4.shell-mass', function (R, ctx) {
    var L = lvl(ctx), kind = R.pick(ML.byLevel(ctx, ['hemi', 'cyl', 'hemi'], ['hemi', 'zbar', 'cyl', 'plane'], ['zbar', 'inertia', 'plane', 'hemi']));
    if (kind === 'hemi') { var a = R.int(2, 5), ph = R.pick([1, 2]), dl = Poly.of(XYZ, R.pick(ph === 1 ? [[[1, { z: 1 }]], [[1, { x: 2 }], [1, { y: 2 }]], [[2, {}], [1, { z: 1 }]], [[3, {}]]] : [[[1, { z: 2 }]], [[1, {}], [1, { x: 2 }]], [[2, {}]]])), M = sphSurf(dl, a, ph);
      return { q: 'A thin shell has the shape of ' + sphereTex(a, ph) + ' and density $\\delta(x, y, z) = ' + dl.toTex() + '$ (mass per unit area). Find its mass.', a: { t: 'num', v: rpPlain(M) },
        steps: ['Mass $= \\iint_S \\delta\\,dS$, with $dS = ' + a * a + '\\sin\\varphi\\,d\\varphi\\,d\\theta$ on the sphere of radius $' + a + '$.', 'In spherical coordinates the density is $' + dl.substAll(sphMap(a, SPH)).toTex() + '$.', 'Integrate over $0 \\le \\theta \\le 2\\pi$, $0 \\le \\varphi \\le ' + (ph === 2 ? '\\pi' : '\\frac{\\pi}{2}') + '$: mass $= ' + rpTex(M) + '$.'],
        hint: 'Mass is the surface integral of the density.', chk: { k: 'hemi', f: dl.toPlain(), a: a, ph: ph } }; }
    if (kind === 'cyl') { var a2 = R.int(2, 5), h = R.int(1, 6), dl2 = Poly.of(XYZ, R.pick([[[1, { z: 1 }]], [[1, {}], [1, { z: 1 }]], [[1, { x: 2 }]], [[2, { z: 1 }], [1, { y: 2 }]]])), M2 = cylSurf(dl2, a2, h);
      return { q: 'A thin can (side only) is the cylinder $x^2 + y^2 = ' + a2 * a2 + '$, $0 \\le z \\le ' + h + '$, with density $\\delta = ' + dl2.toTex() + '$. Find its mass.', a: { t: 'num', v: rpPlain(M2) },
        steps: ['On the cylinder, $dS = ' + a2 + '\\,d\\theta\\,dz$.', 'Mass $= \\int_0^{2\\pi} \\int_0^{' + h + '} \\delta \\cdot ' + a2 + '\\,dz\\,d\\theta$ with $x = ' + a2 + '\\cos\\theta$, $y = ' + a2 + '\\sin\\theta$.', 'Mass $= ' + rpTex(M2) + '$.'],
        hint: 'Use $dS = a\\,d\\theta\\,dz$.', chk: { k: 'cyl', f: dl2.toPlain(), a: a2, h: h } }; }
    if (kind === 'zbar') { var a3 = R.int(1, 7), dl3 = Poly.of(XYZ, R.pick([[[1, {}]], [[1, { z: 1 }]], [[1, { x: 2 }], [1, { y: 2 }]], [[1, {}], [1, { z: 1 }]]])), M3 = sphSurf(dl3, a3, 1), Mz = sphSurf(dl3.mul(Poly.v(XYZ, 'z')), a3, 1), zb = Mz.p.div(M3.p);
      return { q: 'A hemispherical shell $x^2 + y^2 + z^2 = ' + a3 * a3 + '$, $z \\ge 0$, has density $\\delta = ' + dl3.toTex() + '$. Find the $z$-coordinate $\\bar{z}$ of its center of mass.', a: { t: 'num', v: zb.toPlain() },
        steps: ['$\\bar{z} = \\dfrac{\\iint_S z\\,\\delta\\,dS}{\\iint_S \\delta\\,dS}$ (by symmetry $\\bar{x} = \\bar{y} = 0$).', 'Mass: $\\iint_S \\delta\\,dS = ' + rpTex(M3) + '$.', 'Moment: $\\iint_S z\\delta\\,dS = ' + rpTex(Mz) + '$.', '$\\bar{z} = ' + zb.toTex() + '$.' + (dl3.isConst() ? ' For a uniform hemispherical shell, $\\bar{z}$ is half the radius.' : '')],
        hint: 'Divide the moment $\\iint z\\delta\\,dS$ by the mass.', chk: { k: 'zbar', f: dl3.toPlain(), a: a3 } }; }
    if (kind === 'inertia') { var a4 = R.int(2, 5), m0 = R.int(1, 5), I = sphSurf(Poly.of(XYZ, [[m0, { x: 2 }], [m0, { y: 2 }]]), a4, 2);
      return { q: 'A spherical shell $x^2 + y^2 + z^2 = ' + a4 * a4 + '$ has constant density $\\delta = ' + m0 + '$. Find its moment of inertia about the $z$-axis, $I_z = \\iint_S (x^2 + y^2)\\,\\delta\\,dS$.', a: { t: 'num', v: rpPlain(I) },
        steps: ['On the sphere, $x^2 + y^2 = ' + a4 * a4 + '\\sin^2\\varphi$ and $dS = ' + a4 * a4 + '\\sin\\varphi\\,d\\varphi\\,d\\theta$.', '$I_z = ' + m0 + ' \\cdot ' + Math.pow(a4, 4) + ' \\int_0^{2\\pi} \\int_0^{\\pi} \\sin^3\\varphi\\,d\\varphi\\,d\\theta = ' + m0 * Math.pow(a4, 4) + ' \\cdot 2\\pi \\cdot \\frac{4}{3} = ' + rpTex(I) + '$.', 'The mass is $M = ' + m0 + ' \\cdot 4\\pi \\cdot ' + a4 * a4 + '$, so $I_z = \\frac{2}{3}Ma^2$, the textbook value for a thin spherical shell.'],
        hint: 'Write $x^2 + y^2$ in spherical coordinates.', chk: { k: 'inertia', m: m0, a: a4 } }; }
    var al = R.int(0, 3), be = R.int(0, 3), c = R.int(2, 9), s = R.int(1, 4), g = Poly.of(XY, [[c, {}], [-al, { x: 1 }], [-be, { y: 1 }]]), dl4 = Poly.of(XYZ, R.pick([[[1, { x: 1 }]], [[1, { y: 1 }], [1, {}]], [[1, { x: 1, y: 1 }]], [[2, {}]]]));
    var dxy = dl4.substAll({ __vars: XY, x: Poly.v(XY, 'x'), y: Poly.v(XY, 'y'), z: g }), I4 = dxy.defint('y', 0, Poly.of(XY, [[s, {}], [-1, { x: 1 }]])).defint('x', 0, s).cval(), n2 = 1 + al * al + be * be;
    return { q: 'A thin triangular plate lies in the plane $z = ' + g.toTex() + '$ above the triangle $x \\ge 0$, $y \\ge 0$, $x + y \\le ' + s + '$, with density $\\delta = ' + dl4.toTex() + '$. Find its mass.', a: { t: 'num', v: radPlain(I4, n2) },
      steps: ['$dS = \\sqrt{1 + f_x^2 + f_y^2}\\,dA = \\sqrt{1 + ' + al * al + ' + ' + be * be + '}\\,dA = ' + sqrtTex(n2) + '\\,dA$.', '$\\int_0^{' + s + '} \\int_0^{' + s + ' - x} ' + dxy.texParen() + '\\,dy\\,dx = ' + I4.toTex() + '$.', 'Mass $= ' + radTex(I4, n2) + '$.'],
      hint: 'Integrate the density over the shadow triangle, times the area factor.', chk: { k: 'plane', f: dl4.toPlain(), g: g.toPlain(), s: s } };
  });

})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen", a supplement to the wider numbers above): a topic whose own
   generator still has few different problems at a level sometimes asks the same skill in another form, built only from
   problems that generator made, so every answer is the generator's own:
   - check an answer: the question with a classmate's answer, and "Is that right?" (Yes / No; not in placement). The
     classmate's answer is either the right one or a nearby wrong one, and a wrong one is used only when the answer
     checker rejects it;
   - two at once: two different short questions of the topic, answered together.
   Topics whose generator already varies a lot at a level are left as they are. Placed after the generators and
   registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'calc4', VAR = {};
  // how often another form is used: never when the topic's own generator already varies a lot at this level, up to
  // half the time when it has few different questions (counted once per topic and level from 40 fixed seeds)
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
    return VAR[key] >= 37 ? 0 : VAR[key] >= 30 ? 0.3 : VAR[key] >= 20 ? 0.45 : 0.55;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function okAns(a, v) { try { return ML.check(a, v).ok; } catch (e) { return null; } }
  // a nearby wrong answer for a number or an expression, or null
  function wrongFor(R, a) {
    var v = String(ML.answerValue(a)), cands = [], m;
    if (a.t === 'num') {
      if (/^-?\d+$/.test(v)) { var n = +v; cands = [n + 1, n - 1, -n, 2 * n, n + 2, n - 2, n + 10].map(String); }
      else if ((m = /^(-?)(\d+)\/(\d+)$/.exec(v))) { var s = m[1], p = +m[2], q = +m[3]; cands = [s + (p + 1) + '/' + q, s + p + '/' + (q + 1), (s ? '' : '-') + p + '/' + q, s + q + '/' + p, s + (p * 2) + '/' + q]; }
      else if (/^-?\d+\.\d+$/.test(v)) { var x = +v, dp = v.split('.')[1].length, st = Math.pow(10, -Math.min(dp, 2)); cands = [x + st, x - st, -x, x * 10, x / 10].map(function (y) { return ML.util.numStr(ML.util.round(y, dp + 1)); }); }
      else return null;
    } else if (a.t === 'expr') {
      if (v.length > 60) return null;
      if (/ \+ /.test(v)) cands.push(v.replace(' + ', ' - '));
      if (/ - /.test(v)) cands.push(v.replace(' - ', ' + '));
      if ((m = /(^|[^\d.^])(\d+)(?![\d.])/.exec(v)) && !/\^$/.test(v.slice(0, m.index + m[1].length))) cands.push(v.slice(0, m.index) + m[1] + (+m[2] + 1) + v.slice(m.index + m[0].length));
      if (!cands.length) return null;
    } else return null;
    var nv = function (s) { var mm = /^(-?\d+)\/(\d+)$/.exec(s); return mm ? mm[1] / mm[2] : /^-?\d+(\.\d+)?$/.test(s) ? +s : null; }, v0 = nv(v);
    cands = R.shuffle(cands.filter(function (c, i, all) { var x = nv(c); return c !== v && all.indexOf(c) === i && (x === null || v0 === null || (Math.abs(x - v0) >= 0.01 * Math.max(Math.abs(v0), 1e-12) && (v0 <= 0 || x > 0) && (v0 <= 0 || v0 > 1 || x <= 1))); })); // a believable slip: the same sign, and at most 1 when the right answer is
    for (var i = 0; i < cands.length; i++) if (okAns(a, cands[i]) === false) return cands[i];
    return null;
  }
  function checkable(p) {
    var a = p.a;
    if (!a || p.unit || (a.form && a.form !== 'int' && a.form !== 'frac' && a.form !== 'simplest')) return false;
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b|\bclassmate\b/i.test(txt(p.q))) return false;
    if (a.t === 'num' || a.t === 'expr') return okAns(a, ML.answerValue(a)) === true;
    if (a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    return true;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || ['mc', 'tf', 'num'].indexOf(p.a.t) < 0) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= 300 && !/<(table|svg|img|canvas|ol|ul)\b|\$\$|\\begin\{/i.test(p.q);
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), shown, good;
    if (a.t === 'mc') {
      var k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
      shown = a.choices[k]; good = a.choices[a.v];
    } else {
      good = ML.answerShow(a);
      var w = right ? null : wrongFor(R, a);
      if (!right && w === null) return null;
      shown = right ? good : ML.answerShow(Object.assign({}, a, { v: w }));
      if (!shown || /undefined|NaN/.test(shown)) return null;
    }
    var q = p.q + (a.t === 'mc' && listed(p.q) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>A classmate answered: <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is ') + end(good)].concat(p.steps || []) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var out = { q: '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q + '</li><li>' + p2.q + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + (p.steps || [''])[0]].concat((p.steps || []).slice(1), ['Question 2: ' + (p2.steps || [''])[0]], (p2.steps || []).slice(1)) };
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
      var p = base(R, ctx), mode = ctx && ctx.mode;
      if (!p || !p.a || !ML.check || !ML.answerShow || !R.chance(share(id, base, ctx))) return p;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check', 'check');
      if (pairable(p, true)) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = null;
      try { out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base); } catch (e) { out = null; }
      return out || p;
    };
    fn._forms = true;
    fn._base = base; // the topic's own generator (for tests)
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
