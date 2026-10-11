/* A small computer algebra system for the Teddy Rook Book calculator.
   Exact fractions (BigInt), decimals, complex numbers, lists and matrices; symbolic simplify, expand, factor,
   derivatives, integrals, solving, limits, Taylor series and more. No outside libraries.
   Works in the browser (window.CAS) and in Node (module.exports). */
(function (root) {
  'use strict';

  // ================= rational numbers =================
  function babs(a) { return a < 0n ? -a : a; }
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function Q(n, d) { if (d === undefined) d = 1n; if (d < 0n) { n = -n; d = -d; } var g = bgcd(n, d) || 1n; this.n = n / g; this.d = d / g; }
  function q(n, d) { return new Q(BigInt(n), BigInt(d === undefined ? 1 : d)); }
  Q.prototype.add = function (o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); };
  Q.prototype.sub = function (o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); };
  Q.prototype.mul = function (o) { return new Q(this.n * o.n, this.d * o.d); };
  Q.prototype.div = function (o) { if (o.n === 0n) throw new Error('Division by zero'); return new Q(this.n * o.d, this.d * o.n); };
  Q.prototype.neg = function () { return new Q(-this.n, this.d); };
  Q.prototype.isInt = function () { return this.d === 1n; };
  Q.prototype.isZero = function () { return this.n === 0n; };
  Q.prototype.isOne = function () { return this.n === 1n && this.d === 1n; };
  Q.prototype.sign = function () { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; };
  Q.prototype.cmp = function (o) { var a = this.n * o.d, b = o.n * this.d; return a < b ? -1 : a > b ? 1 : 0; };
  Q.prototype.toNum = function () { return Number(this.n) / Number(this.d); };
  Q.prototype.pow = function (k) { // k: BigInt integer
    if (k === 0n) return q(1);
    var neg = k < 0n; if (neg) k = -k;
    if (k > 4000n) throw new Error('Exponent too large');
    var r = new Q(this.n ** k, this.d ** k); return neg ? q(1).div(r) : r;
  };
  Q.prototype.toString = function () { return this.d === 1n ? this.n.toString() : this.n + '/' + this.d; };
  function fromDecimal(str) { // "1.25" -> 5/4, "2e3"
    var m = /^(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(str); if (!m) return null;
    var ip = m[1] || '0', fp = m[2] || '', ex = parseInt(m[3] || '0', 10);
    var n = BigInt(ip + fp), d = 10n ** BigInt(fp.length);
    if (ex > 0) n *= 10n ** BigInt(ex); else if (ex < 0) d *= 10n ** BigInt(-ex);
    return new Q(n, d);
  }
  function floatToQ(x, maxD) { // continued fraction, for exact()
    maxD = maxD || 1000000; if (!isFinite(x)) return null;
    var sgn = x < 0 ? -1 : 1; x = Math.abs(x);
    var h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
    for (var i = 0; i < 40; i++) { var a = Math.floor(b), h2 = a * h1 + h0, k2 = a * k1 + k0; if (k2 > maxD) break; h0 = h1; h1 = h2; k0 = k1; k1 = k2; if (Math.abs(x - h1 / k1) < 1e-12 * Math.max(1, x)) break; b = 1 / (b - a); if (!isFinite(b)) break; }
    return new Q(BigInt(sgn * h1), BigInt(k1));
  }
  function iroot(n, k) { // integer k-th root of BigInt n >= 0, or null if not exact
    if (n < 0n) return null; if (n < 2n) return n;
    var x = BigInt(Math.round(Math.pow(Number(n), 1 / Number(k))));
    for (var d = -2n; d <= 2n; d++) { var y = x + d; if (y >= 0n && y ** k === n) return y; }
    return null;
  }

  // ================= complex numbers (floats) =================
  function C(re, im) { this.re = re; this.im = im; }
  function cx(v) { return v instanceof C ? v : new C(num(v), 0); }
  function num(v) { return v instanceof Q ? v.toNum() : v; }
  var Cx = {
    add: function (a, b) { return new C(a.re + b.re, a.im + b.im); }, sub: function (a, b) { return new C(a.re - b.re, a.im - b.im); },
    mul: function (a, b) { return new C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); },
    div: function (a, b) { var d = b.re * b.re + b.im * b.im; return new C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); },
    abs: function (a) { return Math.hypot(a.re, a.im); }, arg: function (a) { return Math.atan2(a.im, a.re); },
    exp: function (a) { var m = Math.exp(a.re); return new C(m * Math.cos(a.im), m * Math.sin(a.im)); },
    log: function (a) { return new C(Math.log(Cx.abs(a)), Cx.arg(a)); },
    pow: function (a, b) { if (a.re === 0 && a.im === 0) return new C(0, 0); return Cx.exp(Cx.mul(b, Cx.log(a))); },
    sqrt: function (a) { var r = Cx.abs(a), re = Math.sqrt((r + a.re) / 2), im = Math.sqrt(Math.max(0, (r - a.re) / 2)); return new C(re, a.im < 0 ? -im : im); }
  };

  // ================= nodes =================
  // {k:'n', v: Q | number | C}  {k:'s', name}  {k:'+', a:[]}  {k:'*', a:[]}  {k:'^', a:[base, exp]}  {k:'f', name, a:[]}
  // {k:'list', a}  {k:'tuple', a}  {k:'mat', a:[rows lists]}  {k:'rel', op, a:[l, r]}  {k:'assign', ...}
  function N(v) { return { k: 'n', v: v }; }
  function S(name) { return { k: 's', name: name }; }
  function Add(a) { return { k: '+', a: a }; }
  function Mul(a) { return { k: '*', a: a }; }
  function Pow(b, e) { return { k: '^', a: [b, e] }; }
  function F(name, a) { return { k: 'f', name: name, a: a }; }
  var ZERO = N(q(0)), ONE = N(q(1)), MONE = N(q(-1)), HALF = N(q(1, 2)), TWO = N(q(2));
  function isNum(x) { return x.k === 'n'; }
  function isQ(x) { return x.k === 'n' && x.v instanceof Q; }
  function isZero(x) { return x.k === 'n' && (x.v instanceof Q ? x.v.isZero() : x.v instanceof C ? x.v.re === 0 && x.v.im === 0 : x.v === 0); }
  function isOne(x) { return x.k === 'n' && (x.v instanceof Q ? x.v.isOne() : x.v === 1); }
  function neg(x) { return Mul([MONE, x]); }
  function sub(a, b) { return Add([a, neg(b)]); }
  function div(a, b) { return Mul([a, Pow(b, MONE)]); }

  var CONSTS = { pi: 'π', 'π': 'π', e: 'e', i: 'i', inf: '∞', infinity: '∞', '∞': '∞' };
  var FUNCS = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'asin', 'acos', 'atan', 'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'ln', 'log', 'exp', 'sqrt', 'cbrt', 'root', 'nthroot', 'abs', 'floor', 'ceil', 'round', 'sign', 'sgn', 'mod', 'gcd', 'lcm', 'max', 'min', 'factorial', 'ncr', 'npr', 'nCr', 'nPr', 'choose',
    'simplify', 'expand', 'factor', 'd', 'diff', 'deriv', 'derivative', 'int', 'integrate', 'integral', 'solve', 'nsolve', 'zeros', 'roots', 'limit', 'lim', 'taylor', 'series', 'sum', 'product', 'prod',
    'approx', 'exact', 'num', 'det', 'inv', 'inverse', 'transpose', 'trans', 'rref', 'identity', 'eye', 'eigenvalues', 'eig', 'dot', 'cross', 'norm', 'size', 'trace',
    'mean', 'median', 'mode', 'stdev', 'stddev', 'std', 'variance', 'var', 'total', 'sort', 'seq', 'range', 'length', 'len', 'linreg', 'quadreg', 'expreg',
    'isprime', 'prime', 'factorint', 'numer', 'denom', 'real', 're', 'imag', 'im', 'conj', 'arg', 'angle', 'bin', 'hex', 'oct', 'deg', 'rad', 'tangent', 'partfrac', 'propfrac', 'comdenom', 'together', 'random', 'rand', 'randint'];
  var FSET = {}; FUNCS.forEach(function (f) { FSET[f] = 1; });
  var ALIAS = { arcsin: 'asin', arccos: 'acos', arctan: 'atan', sgn: 'sign', nCr: 'ncr', nPr: 'npr', choose: 'ncr', diff: 'd', deriv: 'd', derivative: 'd', integrate: 'int', integral: 'int',
    lim: 'limit', series: 'taylor', prod: 'product', num: 'approx', inverse: 'inv', trans: 'transpose', eye: 'identity', eig: 'eigenvalues', stddev: 'stdev', std: 'stdev', var: 'variance',
    len: 'length', root: 'nthroot', prime: 'isprime', re: 'real', im: 'imag', angle: 'arg', zeros: 'roots', together: 'comdenom', rand: 'random' };

  // ================= tokenizer and parser =================
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  function tokenize(src, known) {
    var s = src.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (m) { return '^(' + m.split('').map(function (c) { return SUP[c]; }).join('') + ')'; })
      .replace(/\*\*/g, '^').replace(/×|·/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=').replace(/θ/g, ' theta ').replace(/∛/g, ' cbrt ');
    var out = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (m && !(m[2] && /[a-zA-Z]/.test(s[i + m[0].length] || ''))) { out.push({ t: 'num', v: m[0] }); i += m[0].length; continue; }
      if (/[a-zA-Zα-ωΑ-Ωπ∞_]/.test(c)) {
        var j = i; while (j < s.length && /[a-zA-Z0-9_α-ωΑ-Ωπ∞]/.test(s[j])) j++;
        var pj = j; while (s[pj] === '\'') pj++; if (pj > j && known(s.slice(i, pj))) { out.push({ t: 'id', v: s.slice(i, pj) }); i = pj; continue; }
        splitIdent(s.slice(i, j), known).forEach(function (w) { out.push({ t: 'id', v: w }); });
        i = j; continue;
      }
      var two = s.substr(i, 2);
      if (['<=', '>=', '!=', ':=', '=='].indexOf(two) >= 0) { out.push({ t: 'op', v: two === '==' ? '=' : two }); i += 2; continue; }
      if ('+-*/^()[]{},=<>!\'√|~;:'.indexOf(c) >= 0) { out.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('I don\'t understand the character “' + c + '”');
    }
    return out;
  }
  function splitIdent(w, known) { // "xsin" -> x, sin ; "ab" -> a, b ; keeps known names, x1, x_1
    if (known(w) || /^[a-zA-Z](_?\d+|_[a-zA-Z0-9]+)$/.test(w)) return [w];
    var res = [], i = 0;
    outer: while (i < w.length) {
      for (var L = w.length - i; L > 1; L--) { var p = w.substr(i, L); if (known(p)) { res.push(p); i += L; continue outer; } }
      var m = /^[a-zA-Z](_?\d+)/.exec(w.slice(i)); if (m) { res.push(m[0]); i += m[0].length; continue; }
      res.push(w[i]); i++;
    }
    return res;
  }

  function Parser(tokens, ctx) { this.t = tokens; this.i = 0; this.ctx = ctx; }
  Parser.prototype.peek = function (o) { return this.t[this.i + (o || 0)]; };
  Parser.prototype.isOp = function (v, o) { var t = this.peek(o); return t && t.t === 'op' && t.v === v; };
  Parser.prototype.next = function () { return this.t[this.i++]; };
  Parser.prototype.expect = function (v) { if (!this.isOp(v)) throw new Error('Expected “' + v + '”'); this.i++; };
  Parser.prototype.parseTop = function () {
    var e = this.parseStatement();
    if (this.i < this.t.length) throw new Error('I didn\'t expect “' + this.peek().v + '” there');
    return e;
  };
  Parser.prototype.parseStatement = function () {
    var l = this.parseRel();
    if (this.isOp(':=')) { this.next(); return { k: 'assign', target: l, a: this.parseRel() }; }
    if (this.isOp('~')) { this.next(); return { k: 'regress', a: [l, this.parseRel()] }; }
    return l;
  };
  Parser.prototype.parseRel = function () {
    var l = this.parseSum(), ops = [], parts = [l];
    while (this.peek() && this.peek().t === 'op' && ['=', '<', '>', '<=', '>=', '!='].indexOf(this.peek().v) >= 0) { ops.push(this.next().v); parts.push(this.parseSum()); }
    if (!ops.length) return l;
    if (ops.length === 1) return { k: 'rel', op: ops[0], a: parts };
    return { k: 'chain', ops: ops, a: parts }; // a < x < b
  };
  Parser.prototype.parseSum = function () {
    var terms = [this.parseProduct()];
    while (this.isOp('+') || this.isOp('-')) { var o = this.next().v, t = this.parseProduct(); terms.push(o === '-' ? neg(t) : t); }
    return terms.length === 1 ? terms[0] : Add(terms);
  };
  Parser.prototype.startsAtom = function () {
    var t = this.peek(); if (!t) return false;
    if (t.t === 'num' || t.t === 'id') return true;
    return t.t === 'op' && (t.v === '(' || t.v === '[' || t.v === '√' || (t.v === '|' && !this.inAbs));
  };
  Parser.prototype.parseProduct = function () {
    var f = [this.parseUnary()];
    for (;;) {
      if (this.isOp('*')) { this.next(); f.push(this.parseUnary()); }
      else if (this.peek() && this.peek().t === 'id' && this.peek().v === 'mod' && !this.isOp('(', 1)) { this.next(); var lhs = f.length === 1 ? f[0] : Mul(f); f = [F('mod', [lhs, this.parseUnary()])]; }
      else if (this.isOp('/')) { this.next(); f.push(Pow(this.parseUnary(), MONE)); }
      else if (this.startsAtom()) f.push(this.parsePower()); // implicit multiplication
      else break;
    }
    return f.length === 1 ? f[0] : Mul(f);
  };
  Parser.prototype.parseUnary = function () {
    if (this.isOp('-')) { this.next(); var x = this.parseUnary(); return isQ(x) ? N(x.v.neg()) : neg(x); }
    if (this.isOp('+')) { this.next(); return this.parseUnary(); }
    return this.parsePower();
  };
  Parser.prototype.parsePower = function () {
    var b = this.parsePostfix();
    if (this.isOp('^')) { this.next(); var e = this.parseUnary(); return Pow(b, e); }
    return b;
  };
  Parser.prototype.parsePostfix = function () {
    var x = this.parseAtom();
    for (;;) {
      if (this.isOp('!')) { this.next(); x = F('factorial', [x]); }
      else if (this.isOp('\'') && x.k === 's') { var pr = 0; while (this.isOp('\'')) { this.next(); pr++; } x = { k: 's', name: x.name + '\''.repeat(pr) }; }
      else break;
    }
    return x;
  };
  Parser.prototype.parseArgs = function (close) {
    var args = [];
    if (this.isOp(close)) { this.next(); return args; }
    for (;;) { args.push(this.parseStatement()); if (this.isOp(',')) { this.next(); continue; } this.expect(close); return args; }
  };
  Parser.prototype.parseAtom = function () {
    var t = this.next(); if (!t) throw new Error('The expression ends too soon');
    if (t.t === 'num') return N(fromDecimal(t.v));
    if (t.t === 'op') {
      if (t.v === '(') { var a = this.parseArgs(')'); if (a.length === 1) return a[0]; return { k: 'tuple', a: a }; }
      if (t.v === '[') { var items = this.parseArgs(']'); if (items.length && items.every(function (r) { return r.k === 'list'; })) return { k: 'mat', a: items.map(function (r) { return r.a; }) }; return { k: 'list', a: items }; }
      if (t.v === '{') { var it = this.parseArgs('}'); return { k: 'list', a: it }; }
      if (t.v === '√') { var arg = this.isOp('(') ? this.parseAtom() : this.parsePower(); return F('sqrt', [arg]); }
      if (t.v === '|') { var save = this.inAbs; this.inAbs = true; var inner = this.parseSum(); this.inAbs = save; this.expect('|'); return F('abs', [inner]); }
      throw new Error('I didn\'t expect “' + t.v + '” there');
    }
    var name = t.v;
    if (name === 'theta') name = 'θ';
    if (CONSTS[name] && !this.ctx.funcs[name]) return S(CONSTS[name]);
    var isF = (FSET[name] && (name.length > 1 || this.isOp('('))) || this.ctx.funcs[name];
    if (isF) {
      name = ALIAS[name] || name;
      var power = null;
      if (this.isOp('^') && !this.ctx.funcs[name]) { this.next(); power = this.parseUnary(); } // sin^2 x
      var args;
      if (this.isOp('(')) { this.next(); args = this.parseArgs(')'); }
      else { // sin x, sin 2x
        var f = [this.parsePower()]; while (this.startsAtom() && !(this.peek().t === 'id' && (FSET[this.peek().v] || this.ctx.funcs[this.peek().v]))) f.push(this.parsePower());
        args = [f.length === 1 ? f[0] : Mul(f)];
      }
      var call = this.ctx.funcs[name] ? { k: 'call', name: name, a: args } : F(name, args);
      if (power) { if (isQ(power) && power.v.n === -1n && power.v.d === 1n && ['sin', 'cos', 'tan'].indexOf(name) >= 0) return F('a' + name, args); return Pow(call, power); }
      return call;
    }
    return S(name);
  };
  function parse(src, ctx) {
    ctx = ctx || { funcs: {} };
    var known = function (w) { return !!(FSET[w] || CONSTS[w] || ctx.funcs[w] || (ctx.vars && ctx.vars[w] !== undefined && w.length > 1) || w === 'theta'); };
    var toks = tokenize(src, known); if (!toks.length) return null;
    return new Parser(toks, ctx).parseTop();
  }

  // ================= keys and ordering =================
  function key(x) {
    switch (x.k) {
      case 'n': return 'n' + (x.v instanceof Q ? x.v.toString() : x.v instanceof C ? x.v.re + ',' + x.v.im + 'i' : x.v);
      case 's': return 's' + x.name;
      case 'f': return 'f' + x.name + '(' + x.a.map(key).join(',') + ')';
      default: return x.k + '(' + (x.a || []).map(function (y) { return Array.isArray(y) ? '[' + y.map(key).join(',') + ']' : key(y); }).join(',') + ')';
    }
  }
  function hasVar(x, v) {
    if (x.k === 's') return x.name === v;
    if (!x.a) return false;
    for (var i = 0; i < x.a.length; i++) { var y = x.a[i]; if (Array.isArray(y) ? y.some(function (z) { return hasVar(z, v); }) : hasVar(y, v)) return true; }
    return false;
  }
  function freeVars(x, out) {
    out = out || {};
    if (x.k === 's' && ['π', 'e', 'i', '∞'].indexOf(x.name) < 0) out[x.name] = 1;
    if (x.a) x.a.forEach(function (y) { if (Array.isArray(y)) y.forEach(function (z) { freeVars(z, out); }); else freeVars(y, out); });
    return out;
  }
  function degreeIn(x, v) { // for ordering terms
    if (x.k === 's') return x.name === v ? 1 : 0;
    if (x.k === '^' && x.a[0].k === 's' && isQ(x.a[1])) return x.a[0].name === v ? x.a[1].v.toNum() : 0;
    if (x.k === '*') return x.a.reduce(function (s, y) { return s + degreeIn(y, v); }, 0);
    return 0;
  }
  function mainVar(x) { var fv = Object.keys(freeVars(x)); if (fv.indexOf('x') >= 0) return 'x'; fv.sort(); return fv[0] || 'x'; }

  // ================= numeric values =================
  function vAdd(a, b) { if (a instanceof Q && b instanceof Q) return a.add(b); if (a instanceof C || b instanceof C) return Cx.add(cx(a), cx(b)); return num(a) + num(b); }
  function vMul(a, b) { if (a instanceof Q && b instanceof Q) return a.mul(b); if (a instanceof C || b instanceof C) return Cx.mul(cx(a), cx(b)); return num(a) * num(b); }
  function vNorm(v) { if (v instanceof C) { if (Math.abs(v.im) < 1e-14 * Math.max(1, Math.abs(v.re))) return v.re; } return v; }

  // ================= simplification =================
  function simp(x) {
    switch (x.k) {
      case 'n': return x.v instanceof C ? N(vNorm(x.v)) : x;
      case 's': return x;
      case '+': return simpAdd(x.a.map(simp));
      case '*': return simpMul(x.a.map(simp));
      case '^': return simpPow(simp(x.a[0]), simp(x.a[1]));
      case 'f': return simpF(x.name, x.a.map(simp));
      case 'list': case 'tuple': return { k: x.k, a: x.a.map(simp) };
      case 'mat': return { k: 'mat', a: x.a.map(function (r) { return r.map(simp); }) };
      case 'rel': case 'chain': return { k: x.k, op: x.op, ops: x.ops, a: x.a.map(simp) };
      default: return x;
    }
  }
  function splitCoef(t) { // term -> [numeric coef, rest node or null]
    if (t.k === 'n') return [t.v, null];
    if (t.k === '*' && t.a[0].k === 'n') { var rest = t.a.slice(1); return [t.a[0].v, rest.length === 1 ? rest[0] : Mul(rest)]; }
    return [q(1), t];
  }
  function simpAdd(terms) {
    var flat = []; terms.forEach(function (t) { if (t.k === '+') flat.push.apply(flat, t.a); else flat.push(t); });
    if (flat.some(function (t) { return t.k === 'list'; })) return listMap(flat, Add);
    if (flat.some(function (t) { return t.k === 'mat'; })) return matAdd(flat);
    var c = q(0), map = {}, order = [];
    flat.forEach(function (t) {
      var sc = splitCoef(t); if (!sc[1]) { c = vAdd(c, sc[0]); return; }
      var k = key(sc[1]); if (!map[k]) { map[k] = { c: q(0), t: sc[1] }; order.push(k); } map[k].c = vAdd(map[k].c, sc[0]);
    });
    var out = [];
    order.forEach(function (k) { var m = map[k]; if (isZero(N(m.c))) return; out.push(isOne(N(m.c)) ? m.t : simpMul([N(m.c), m.t])); });
    if (!isZero(N(c)) || !out.length) out.push(N(vNorm(c)));
    return out.length === 1 ? out[0] : Add(out);
  }
  function baseExp(f) { if (f.k === '^') return [f.a[0], f.a[1]]; return [f, ONE]; }
  function simpMul(fs) {
    var flat = []; fs.forEach(function (f) { if (f.k === '*') flat.push.apply(flat, f.a); else flat.push(f); });
    if (flat.some(function (t) { return t.k === 'mat'; })) return matMulAll(flat);
    if (flat.some(function (t) { return t.k === 'list'; })) return listMap(flat, Mul);
    var c = q(1), map = {}, order = [];
    flat.forEach(function (f) {
      if (f.k === 'n') { c = vMul(c, f.v); return; }
      var be = baseExp(f), k = key(be[0]);
      if (!map[k]) { map[k] = { b: be[0], e: [] }; order.push(k); } map[k].e.push(be[1]);
    });
    if (isZero(N(c))) return ZERO;
    var out = [];
    order.forEach(function (k) {
      var m = map[k], e = m.e.length === 1 ? m.e[0] : simpAdd(m.e);
      var p = simpPow(m.b, e);
      if (p.k === 'n') c = vMul(c, p.v); else if (p.k === '*') p.a.forEach(function (y) { if (y.k === 'n') c = vMul(c, y.v); else out.push(y); }); else out.push(p);
    });
    if (isZero(N(c))) return ZERO;
    out.sort(function (a, b) { return key(a) < key(b) ? -1 : 1; });
    if (!isOne(N(c)) || !out.length) out.unshift(N(vNorm(c)));
    return out.length === 1 ? out[0] : Mul(out);
  }
  function rootQ(v, p, qd) { // exact (v)^(p/qd) for rational v, or null; returns node
    if (v.sign() < 0) { if (qd % 2n === 0n) return null; var r = rootQ(v.neg(), p, qd); return r ? simpMul([MONE, r]) : null; }
    // extract perfect qd-th powers from numerator and denominator
    function split(n) { var out = 1n, rest = n; if (n > 10n ** 18n) return [1n, n]; for (var f = 2n; f * f <= rest && f < 100000n; f++) { var fk = f ** qd; while (rest % fk === 0n) { rest /= fk; out *= f; } } var r = iroot(rest, qd); if (r !== null) { out *= r; rest = 1n; } return [out, rest]; }
    var a = split(v.n), b = split(v.d);
    var outside = new Q(a[0], b[0]).pow(p), insideN = a[1], insideD = b[1];
    if (insideN === 1n && insideD === 1n) return N(outside);
    // rationalize: inside = insideN/insideD -> insideN*insideD^(qd-1) / insideD^qd
    var inside = insideN * insideD ** (qd - 1n); outside = outside.div(new Q(insideD, 1n).pow(p));
    var e = new Q(p, qd); var whole = e.n / e.d; // integer part of exponent
    var rem = e.sub(new Q(whole, 1n));
    if (rem.sign() < 0) { rem = rem.add(q(1)); whole -= 1n; }
    outside = outside.mul(new Q(inside, 1n).pow(whole));
    if (rem.isZero()) return N(outside);
    var pw = Pow(N(new Q(inside, 1n)), N(rem));
    return outside.isOne() ? pw : Mul([N(outside), pw]);
  }
  function simpPow(b, e) {
    if (isZero(e)) return ONE;
    if (isOne(e)) return b;
    if (isOne(b)) return ONE;
    if (b.k === 'list' || e.k === 'list') return listMap([b, e], function (a) { return Pow(a[0], a[1]); });
    if (b.k === 'mat' && isQ(e) && e.v.isInt()) return matPow(b, e.v.n);
    if (isZero(b)) { if (isNum(e) && num(e.v) > 0) return ZERO; }
    if (b.k === 's' && b.name === 'i' && isQ(e) && e.v.isInt()) { var m = Number(((e.v.n % 4n) + 4n) % 4n); return [ONE, S('i'), MONE, neg(S('i'))][m].k === '*' ? simpMul([MONE, S('i')]) : [ONE, S('i'), MONE][m]; }
    if (isNum(b) && isNum(e)) {
      if (b.v instanceof Q && e.v instanceof Q) {
        if (e.v.isInt()) return N(b.v.pow(e.v.n));
        var r = rootQ(b.v, e.v.n, e.v.d); if (r) return r;
        if (b.v.sign() < 0 && e.v.d === 2n) { var rr = rootQ(b.v.neg(), e.v.n, 2n); if (rr) return simpMul([rr, simpPow(S('i'), N(new Q(e.v.n, 1n)))]); }
        return Pow(b, e);
      }
      var bv = b.v, ev = e.v;
      if (!(bv instanceof C) && !(ev instanceof C) && (num(bv) >= 0 || Number.isInteger(num(ev)))) return N(Math.pow(num(bv), num(ev)));
      return N(vNorm(Cx.pow(cx(bv), cx(ev))));
    }
    if (b.k === '^' && isQ(e) && (e.v.isInt() || (isQ(b.a[1]) && b.a[1].v.isInt() && b.a[1].v.n % 2n === 1n))) return simpPow(b.a[0], simpMul([b.a[1], e]));
    if (b.k === '*' && isQ(e) && e.v.isInt()) return simpMul(b.a.map(function (f) { return simpPow(f, e); }));
    if (b.k === 's' && b.name === 'e' && e.k === 'f' && e.name === 'ln') return e.a[0];
    if (b.k === 's' && b.name === 'e' && hasVar(e, 'i') && !hasAnyVar(e)) { var z = evalNum(Pow(b, e)); if (z instanceof C || typeof z === 'number') { z = cx(z); var rq = floatToQ(z.re, 12), iq = floatToQ(z.im, 12); if (rq && iq && Math.abs(rq.toNum() - z.re) < 1e-12 && Math.abs(iq.toNum() - z.im) < 1e-12) return simpAdd([N(rq), simpMul([N(iq), S('i')])]); } }
    return Pow(b, e);
  }
  var PI = Math.PI;
  function isPiMultiple(x) { // returns Q r if x == r*π
    if (x.k === 's' && x.name === 'π') return q(1);
    if (x.k === '*' && x.a.length === 2 && isQ(x.a[0]) && x.a[1].k === 's' && x.a[1].name === 'π') return x.a[0].v;
    if (isZero(x)) return q(0);
    return null;
  }
  function trigExact(name, r) { // r = multiple of π
    var t = r.mul(q(12)); if (!t.isInt()) return null; // multiples of π/12 -> use 30°, 45° families
    var deg = Number(((t.n % 24n) + 24n) % 24n) * 15; // degrees mod 360
    var s = { 0: '0', 30: '1/2', 45: 'r2/2', 60: 'r3/2', 90: '1', 120: 'r3/2', 135: 'r2/2', 150: '1/2', 180: '0', 210: '-1/2', 225: '-r2/2', 240: '-r3/2', 270: '-1', 300: '-r3/2', 315: '-r2/2', 330: '-1/2' };
    function val(code) { if (code === undefined) return null; var neg1 = code[0] === '-'; if (neg1) code = code.slice(1); var v = code === 'r2/2' ? simpMul([HALF, simpPow(TWO, HALF)]) : code === 'r3/2' ? simpMul([HALF, simpPow(N(q(3)), HALF)]) : N(fromFrac(code)); return neg1 ? simpMul([MONE, v]) : v; }
    function fromFrac(c) { var p = c.split('/'); return q(p[0], p[1] || 1); }
    if (name === 'sin') return val(s[deg]);
    if (name === 'cos') return val(s[(deg + 90) % 360]);
    if (name === 'tan') { var sn = val(s[deg]), cs = val(s[(deg + 90) % 360]); if (!sn || !cs) return null; if (isZero(cs)) return null; return simp(div(sn, cs)); }
    return null;
  }
  var NUMF = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, sec: function (x) { return 1 / Math.cos(x); }, csc: function (x) { return 1 / Math.sin(x); }, cot: function (x) { return 1 / Math.tan(x); },
    asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
    ln: Math.log, exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
    factorial: function (n) { return gammaF(n + 1); }
  };
  function gammaF(z) { // Lanczos
    if (Number.isInteger(z) && z <= 0) return NaN;
    if (z < 0.5) return PI / (Math.sin(PI * z) * gammaF(1 - z));
    z -= 1; var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    var x = c[0]; for (var i = 1; i < g + 2; i++) x += c[i] / (z + i); var t = z + g + 0.5; return Math.sqrt(2 * PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
  var STATE = { deg: false };
  function trigArg(v) { return STATE.deg ? v * PI / 180 : v; }
  function trigOut(v) { return STATE.deg ? v * 180 / PI : v; }
  function simpF(name, a) {
    var x = a[0];
    if (a.some(function (y) { return y.k === 'list'; }) && ['sin', 'cos', 'tan', 'ln', 'log', 'exp', 'sqrt', 'abs', 'floor', 'ceil', 'round', 'asin', 'acos', 'atan', 'factorial'].indexOf(name) >= 0) return { k: 'list', a: x.a.map(function (y) { return simpF(name, [y].concat(a.slice(1))); }) };
    switch (name) {
      case 'sqrt': return simpPow(x, HALF);
      case 'cbrt': return simpPow(x, N(q(1, 3)));
      case 'nthroot': return simpPow(a[0], simpPow(a[1], MONE));
      case 'exp': return simpPow(S('e'), x);
      case 'ln':
        if (isOne(x)) return ZERO; if (x.k === 's' && x.name === 'e') return ONE;
        if (x.k === '^' && x.a[0].k === 's' && x.a[0].name === 'e') return x.a[1];
        if (isNum(x) && !(x.v instanceof Q)) { var lv = cx(x.v); return N(num(x.v) > 0 && !(x.v instanceof C) ? Math.log(num(x.v)) : vNorm(Cx.log(lv))); }
        return F('ln', a);
      case 'log':
        if (a.length === 2) return simp(div(F('ln', [a[0]]), F('ln', [a[1]])));
        if (isQ(x) && x.v.sign() > 0) { var k = 0, v = x.v; while (v.isInt() && v.n % 10n === 0n && v.n > 0n) { v = new Q(v.n / 10n, 1n); k++; } if (v.isOne()) return N(q(k)); }
        if (isNum(x) && !(x.v instanceof Q)) return N(Math.log10(num(x.v)));
        return F('log', a);
      case 'abs':
        if (isQ(x)) return N(x.v.sign() < 0 ? x.v.neg() : x.v);
        if (isNum(x)) return N(x.v instanceof C ? Cx.abs(x.v) : Math.abs(x.v));
        if (x.k === 's' && (x.name === 'π' || x.name === 'e')) return x;
        return F('abs', a);
      case 'sin': case 'cos': case 'tan':
        if (!STATE.deg) { var r = isPiMultiple(x); if (r) { var ex = trigExact(name, r); if (ex) return ex; } }
        else if (isQ(x)) { var ex2 = trigExact(name, x.v.div(q(180))); if (ex2) return ex2; }
        if (isNum(x) && !(x.v instanceof Q)) return N(NUMF[name](trigArg(num(x.v))));
        if (x.k === '*' && isQ(x.a[0]) && x.a[0].v.sign() < 0) { var pos = simpMul([N(x.a[0].v.neg())].concat(x.a.slice(1))); return name === 'cos' ? F('cos', [pos]) : simpMul([MONE, F(name, [pos])]); }
        return F(name, a);
      case 'asin': case 'acos': case 'atan':
        if (isZero(x)) return name === 'acos' ? (STATE.deg ? N(q(90)) : simpMul([HALF, S('π')])) : ZERO;
        if (isOne(x)) return name === 'atan' ? (STATE.deg ? N(q(45)) : simpMul([N(q(1, 4)), S('π')])) : name === 'asin' ? (STATE.deg ? N(q(90)) : simpMul([HALF, S('π')])) : ZERO;
        if (isNum(x) && !(x.v instanceof Q)) return N(trigOut(NUMF[name](num(x.v))));
        return F(name, a);
      case 'factorial':
        if (isQ(x) && x.v.isInt() && x.v.n >= 0n) { if (x.v.n > 3000n) throw new Error('That factorial is too big'); var p = 1n; for (var j = 2n; j <= x.v.n; j++) p *= j; return N(new Q(p, 1n)); }
        if (isNum(x)) return N(gammaF(num(x.v) + 1));
        return F(name, a);
      case 'floor': case 'ceil': case 'round': case 'sign':
        if (isQ(x)) { var fl = x.v.n / x.v.d - (x.v.n < 0n && x.v.n % x.v.d !== 0n ? 1n : 0n); var res = name === 'floor' ? fl : name === 'ceil' ? (x.v.isInt() ? fl : fl + 1n) : name === 'sign' ? BigInt(x.v.sign()) : BigInt(Math.round(x.v.toNum())); return N(new Q(res, 1n)); }
        if (isNum(x)) return N(NUMF[name](num(x.v)));
        return F(name, a);
      case 'mod': if (isQ(a[0]) && isQ(a[1]) && a[0].v.isInt() && a[1].v.isInt()) { var mm = a[0].v.n % a[1].v.n; if (mm < 0n) mm += babs(a[1].v.n); return N(new Q(mm, 1n)); } if (isNum(a[0]) && isNum(a[1])) { var A = num(a[0].v), B = num(a[1].v); return N(((A % B) + B) % B); } return F(name, a);
      case 'gcd': case 'lcm': if (a.every(isQ)) { var g = a.reduce(function (s, y) { var n = y.v.n; return name === 'gcd' ? bgcd(s, n) : (s === 0n ? babs(n) : babs(s * n) / bgcd(s, n)); }, name === 'gcd' ? 0n : 0n); return N(new Q(g, 1n)); } return F(name, a);
      case 'max': case 'min': { var vals = a.length === 1 && x.k === 'list' ? x.a : a; if (vals.every(isNum)) { var best = vals[0]; vals.forEach(function (y) { var c = num(y.v) - num(best.v); if (name === 'max' ? c > 0 : c < 0) best = y; }); return best; } return F(name, a); }
      case 'ncr': case 'npr': if (isQ(a[0]) && isQ(a[1])) { var n = a[0].v.n, kk = a[1].v.n, res2 = 1n; if (kk < 0n || kk > n) return ZERO; for (var t = 0n; t < kk; t++) res2 *= n - t; if (name === 'ncr') { for (t = 2n; t <= kk; t++) res2 /= t; } return N(new Q(res2, 1n)); } return F(name, a);
    }
    if (NUMF[name] && isNum(x) && !(x.v instanceof Q) && a.length === 1) return N(NUMF[name](num(x.v)));
    if (NUMF[name] && isQ(x) && ['sec', 'csc', 'cot', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'].indexOf(name) >= 0 && x.v.isZero()) return N(q(name === 'cosh' || name === 'sec' ? 1 : 0));
    return F(name, a);
  }

  // ---- lists and matrices ----
  function listMap(items, mk) {
    var len = 0; items.forEach(function (t) { if (t.k === 'list') len = Math.max(len, t.a.length); });
    var out = []; for (var i = 0; i < len; i++) out.push(simp(mk(items.map(function (t) { return t.k === 'list' ? (t.a[i] || ZERO) : t; }))));
    return { k: 'list', a: out };
  }
  function matAdd(items) {
    var ms = items.filter(function (t) { return t.k === 'mat'; }); if (ms.length !== items.length) throw new Error('Can\'t add a matrix and a number');
    var r = ms[0].a.length, c = ms[0].a[0].length;
    if (ms.some(function (m) { return m.a.length !== r || m.a[0].length !== c; })) throw new Error('Matrices must be the same size to add');
    return { k: 'mat', a: ms[0].a.map(function (row, i) { return row.map(function (_, j) { return simp(Add(ms.map(function (m) { return m.a[i][j]; }))); }); }) };
  }
  function matMul2(A, B) {
    if (A.k !== 'mat' && B.k !== 'mat') return simp(Mul([A, B]));
    if (A.k !== 'mat') return { k: 'mat', a: B.a.map(function (r) { return r.map(function (y) { return simp(Mul([A, y])); }); }) };
    if (B.k !== 'mat') return { k: 'mat', a: A.a.map(function (r) { return r.map(function (y) { return simp(Mul([y, B])); }); }) };
    if (A.a[0].length !== B.a.length) throw new Error('These matrices can\'t be multiplied: the columns of the first must match the rows of the second');
    return { k: 'mat', a: A.a.map(function (r) { return B.a[0].map(function (_, j) { return simp(Add(r.map(function (y, k) { return Mul([y, B.a[k][j]]); }))); }); }) };
  }
  function matMulAll(items) {
    var acc = null; items.forEach(function (t) { if (t.k === 'list') throw new Error('Can\'t multiply a list and a matrix'); acc = acc ? matMul2(acc, t) : t; });
    if (acc.k === 'mat') return acc; return simp(acc);
  }
  function identity(n) { var a = []; for (var i = 0; i < n; i++) { a.push([]); for (var j = 0; j < n; j++) a[i].push(i === j ? ONE : ZERO); } return { k: 'mat', a: a }; }
  function matPow(M, k) { if (k < 0n) { M = matInv(M); k = -k; } var R = identity(M.a.length); for (var i = 0n; i < k; i++) R = matMul2(R, M); return R; }
  function matDet(M) {
    var n = M.a.length; if (M.a.some(function (r) { return r.length !== n; })) throw new Error('Only square matrices have a determinant');
    if (n === 1) return M.a[0][0];
    if (n === 2) return simp(sub(Mul([M.a[0][0], M.a[1][1]]), Mul([M.a[0][1], M.a[1][0]])));
    var terms = []; for (var j = 0; j < n; j++) { var minor = { k: 'mat', a: M.a.slice(1).map(function (r) { return r.filter(function (_, c) { return c !== j; }); }) }; terms.push(Mul([N(q(j % 2 ? -1 : 1)), M.a[0][j], matDet(minor)])); }
    return simp(Add(terms));
  }
  function matRref(M, aug) {
    var A = M.a.map(function (r) { return r.slice(); }), rows = A.length, cols = A[0].length, lead = 0;
    for (var r = 0; r < rows; r++) {
      if (lead >= cols) break;
      var i = r; while (isZero(simp(A[i][lead]))) { i++; if (i === rows) { i = r; lead++; if (lead === cols) return { k: 'mat', a: A }; } }
      var tmp = A[i]; A[i] = A[r]; A[r] = tmp;
      var lv = A[r][lead]; A[r] = A[r].map(function (y) { return simp(div(y, lv)); });
      for (var k = 0; k < rows; k++) if (k !== r) { var f = A[k][lead]; A[k] = A[k].map(function (y, c) { return simp(sub(y, Mul([f, A[r][c]]))); }); }
      lead++;
    }
    return { k: 'mat', a: A };
  }
  function matInv(M) {
    var n = M.a.length; if (isZero(matDet(M))) throw new Error('This matrix has no inverse (its determinant is 0)');
    var aug = { k: 'mat', a: M.a.map(function (r, i) { return r.concat(identity(n).a[i]); }) };
    var R = matRref(aug); return { k: 'mat', a: R.a.map(function (r) { return r.slice(n); }) };
  }
  function matT(M) { return { k: 'mat', a: M.a[0].map(function (_, j) { return M.a.map(function (r) { return r[j]; }); }) }; }

  // ================= numeric evaluation (floats) =================
  function evalNum(x, env) {
    switch (x.k) {
      case 'n': return x.v instanceof C ? x.v : num(x.v);
      case 's':
        if (env && env[x.name] !== undefined) return env[x.name];
        if (x.name === 'π') return PI; if (x.name === 'e') return Math.E; if (x.name === 'i') return new C(0, 1); if (x.name === '∞') return Infinity;
        return NaN;
      case '+': { var s = 0; for (var i = 0; i < x.a.length; i++) { var v = evalNum(x.a[i], env); if (v instanceof C || s instanceof C) s = Cx.add(cx(s), cx(v)); else s += v; } return s; }
      case '*': { var p = 1; for (i = 0; i < x.a.length; i++) { v = evalNum(x.a[i], env); if (v instanceof C || p instanceof C) p = Cx.mul(cx(p), cx(v)); else p *= v; } return p; }
      case '^': {
        var b = evalNum(x.a[0], env), e = evalNum(x.a[1], env);
        if (b instanceof C || e instanceof C) return vNorm(Cx.pow(cx(b), cx(e)));
        if (b < 0 && !Number.isInteger(e)) { var ee = isQ(x.a[1]) ? x.a[1].v : null; if (ee && ee.d % 2n === 1n) { var r = Math.pow(-b, e); return ee.n % 2n === 0n ? r : -r; } return env && env.__complex ? vNorm(Cx.pow(cx(b), cx(e))) : NaN; }
        return Math.pow(b, e);
      }
      case 'f': {
        var a = x.a.map(function (y) { return evalNum(y, env); });
        var f = x.name, a0 = a[0];
        if (a0 instanceof C) { if (f === 'sqrt') return Cx.sqrt(a0); if (f === 'ln') return Cx.log(a0); if (f === 'exp') return Cx.exp(a0); if (f === 'abs') return Cx.abs(a0); return NaN; }
        if (['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].indexOf(f) >= 0) return NUMF[f](trigArg(a0));
        if (['asin', 'acos', 'atan'].indexOf(f) >= 0) return trigOut(NUMF[f](a0));
        if (NUMF[f]) return NUMF[f](a0);
        if (f === 'log') return a.length > 1 ? Math.log(a0) / Math.log(a[1]) : Math.log10(a0);
        if (f === 'nthroot') return a0 < 0 && a[1] % 2 === 1 ? -Math.pow(-a0, 1 / a[1]) : Math.pow(a0, 1 / a[1]);
        if (f === 'mod') return ((a0 % a[1]) + a[1]) % a[1];
        if (f === 'max') return Math.max.apply(null, a); if (f === 'min') return Math.min.apply(null, a);
        if (f === 'ncr' || f === 'npr') { var r2 = gammaF(a0 + 1) / gammaF(a0 - a[1] + 1); return f === 'ncr' ? r2 / gammaF(a[1] + 1) : r2; }
        if (f === 'random') return Math.random();
        var r3 = simp(x); if (r3.k === 'n') return num(r3.v);
        return NaN;
      }
      case 'call': {
        var fn = env && env.__funcs && env.__funcs[x.name]; if (!fn) return NaN;
        var sub2 = Object.create(env); fn.params.forEach(function (p, i) { sub2[p] = evalNum(x.a[i], env); });
        return evalNum(fn.body, sub2);
      }
      default: return NaN;
    }
  }
  // Compile to a fast JS function of the given variables (for graphing). Falls back to evalNum.
  function compile(x, vars, env) {
    var js = toJS(x, env);
    if (js) { try { return new Function(vars.join(','), '"use strict";var M=Math;return ' + js + ';'); } catch (e) { } }
    return function () { var e2 = Object.create(env || {}); for (var i = 0; i < vars.length; i++) e2[vars[i]] = arguments[i]; return num(evalNum(x, e2)); };
  }
  function toJS(x, env) {
    switch (x.k) {
      case 'n': return x.v instanceof C ? null : '(' + num(x.v) + ')';
      case 's':
        if (x.name === 'π') return 'M.PI'; if (x.name === 'e') return 'M.E'; if (x.name === 'i') return null;
        if (env && typeof env[x.name] === 'number') return '(' + env[x.name] + ')';
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(x.name) || x.name === 'θ') return x.name === 'θ' ? 'theta' : x.name;
        return null;
      case '+': { var p = x.a.map(function (y) { return toJS(y, env); }); return p.indexOf(null) >= 0 ? null : '(' + p.join('+') + ')'; }
      case '*': { p = x.a.map(function (y) { return toJS(y, env); }); return p.indexOf(null) >= 0 ? null : '(' + p.join('*') + ')'; }
      case '^': {
        var b = toJS(x.a[0], env), e = toJS(x.a[1], env); if (b === null || e === null) return null;
        if (isQ(x.a[1]) && !x.a[1].v.isInt() && x.a[1].v.d % 2n === 1n) { var ev = x.a[1].v; return '(M.sign(' + b + ')' + (ev.n % 2n === 0n ? '*0+1' : '') + '*M.pow(M.abs(' + b + '),' + ev.toNum() + '))'; }
        if (isQ(x.a[1]) && x.a[1].v.isInt() && x.a[1].v.n === 2n) return '((' + b + ')*(' + b + '))';
        return 'M.pow(' + b + ',' + e + ')';
      }
      case 'f': {
        var a = x.a.map(function (y) { return toJS(y, env); }); if (a.indexOf(null) >= 0) return null;
        var d = STATE.deg ? '*M.PI/180' : '', o = STATE.deg ? '*180/M.PI' : '';
        var m = { sin: 'M.sin(' + a[0] + d + ')', cos: 'M.cos(' + a[0] + d + ')', tan: 'M.tan(' + a[0] + d + ')', sec: '(1/M.cos(' + a[0] + d + '))', csc: '(1/M.sin(' + a[0] + d + '))', cot: '(1/M.tan(' + a[0] + d + '))',
          asin: '(M.asin(' + a[0] + ')' + o + ')', acos: '(M.acos(' + a[0] + ')' + o + ')', atan: '(M.atan(' + a[0] + ')' + o + ')', sinh: 'M.sinh(' + a[0] + ')', cosh: 'M.cosh(' + a[0] + ')', tanh: 'M.tanh(' + a[0] + ')',
          asinh: 'M.asinh(' + a[0] + ')', acosh: 'M.acosh(' + a[0] + ')', atanh: 'M.atanh(' + a[0] + ')', ln: 'M.log(' + a[0] + ')', exp: 'M.exp(' + a[0] + ')', sqrt: 'M.sqrt(' + a[0] + ')', cbrt: 'M.cbrt(' + a[0] + ')',
          abs: 'M.abs(' + a[0] + ')', floor: 'M.floor(' + a[0] + ')', ceil: 'M.ceil(' + a[0] + ')', round: 'M.round(' + a[0] + ')', sign: 'M.sign(' + a[0] + ')',
          log: a.length > 1 ? '(M.log(' + a[0] + ')/M.log(' + a[1] + '))' : 'M.log10(' + a[0] + ')', mod: '(((' + a[0] + ')%(' + a[1] + ')+(' + a[1] + '))%(' + a[1] + '))',
          max: 'M.max(' + a.join(',') + ')', min: 'M.min(' + a.join(',') + ')' }[x.name];
        return m || null;
      }
      default: return null;
    }
  }

  // ================= printing =================
  var SUPS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function fmtNum(v, digits) {
    if (v instanceof Q) return v.toString();
    if (v instanceof C) { var re = v.re, im = v.im; var r = Math.abs(re) > 1e-12 ? fmtNum(re, digits) : ''; var ii = Math.abs(im) > 1e-12 ? (Math.abs(Math.abs(im) - 1) < 1e-12 ? (im < 0 ? '−' : '') : fmtNum(im, digits)) + 'i' : ''; if (!r && !ii) return '0'; if (!r) return ii; if (!ii) return r; return r + (im < 0 ? ' − ' + ii.replace('-', '').replace('−', '') : ' + ' + ii); }
    if (!isFinite(v)) return isNaN(v) ? 'undefined' : (v > 0 ? '∞' : '−∞');
    if (v === 0) return '0';
    var s = Number(v.toPrecision(digits || 10)); var a = Math.abs(s);
    if (a >= 1e12 || a < 1e-7) { var ex = s.toExponential((digits || 10) - 1).replace(/\.?0+e/, 'e'); var m2 = /^(-?[\d.]+)e([+-]\d+)$/.exec(ex); return m2 ? m2[1] + '×10' + m2[2].replace('+', '').split('').map(function (c) { return SUPS[c]; }).join('') : ex; }
    return String(s).replace('-', '−');
  }
  function prec(x) { if (x.k === '+') return 1; if (x.k === '*') return 2; if (x.k === 'n' && x.v instanceof Q && (!x.v.isInt() || x.v.sign() < 0)) return 2; if (x.k === 'n' && typeof x.v === 'number' && x.v < 0) return 2; if (x.k === 'n' && x.v instanceof C) return 1; if (x.k === '^') return 3; return 4; }
  function paren(x, p) { var s = show(x); return prec(x) < p ? '(' + s + ')' : s; }
  function supNum(s) { return /^-?\d+$/.test(s) ? s.split('').map(function (c) { return SUPS[c]; }).join('') : null; }
  function termSign(t) { var sc = splitCoef(t); var c = sc[0]; var neg1 = c instanceof Q ? c.sign() < 0 : typeof c === 'number' ? c < 0 : false; return neg1; }
  function negTerm(t) { return simp(Mul([MONE, t])); }
  function show(x) {
    switch (x.k) {
      case 'n': return fmtNum(x.v).replace(/^-/, '−');
      case 's': return x.name;
      case '+': {
        var v = mainVar(x), nv = !hasAnyVar(x), terms = x.a.slice().sort(function (a, b) { var da = degreeIn(a, v), db = degreeIn(b, v); if (da !== db) return db - da; return isNum(a) ? (nv ? -1 : 1) : isNum(b) ? (nv ? 1 : -1) : 0; });
        var s = '';
        terms.forEach(function (t, i) { if (termSign(t)) s += (i ? ' − ' : '−') + paren(negTerm(t), 2); else s += (i ? ' + ' : '') + show(t); });
        return s;
      }
      case '*': {
        if (x.keep) {
          var lst = x.a[x.a.length - 1];
          if (x.a.length === 2 && lst.k === '^' && isQ(lst.a[1]) && lst.a[1].v.n === -1n) return paren(x.a[0], 3) + '/' + paren(lst.a[0], 3);
          return x.a.map(function (f) { return paren(f, 3); }).join('·');
        }
        var numr = [], den = [], c = null, cf = '';
        x.a.forEach(function (f) {
          if (f.k === 'n' && f.v instanceof Q) { c = f.v; return; }
          if (f.k === 'n') { cf = show(f); return; }
          if (f.k === '^' && isNum(f.a[1]) && num(f.a[1].v) < 0) { den.push(simpPow(f.a[0], N(f.a[1].v instanceof Q ? f.a[1].v.neg() : -f.a[1].v))); return; }
          numr.push(f);
        });
        if (c && c.d !== 1n) { den.unshift(N(new Q(c.d, 1n))); c = new Q(c.n, 1n); }
        var sgn = c && c.sign() < 0 ? '−' : ''; if (c && c.sign() < 0) c = c.neg();
        function rank(f) { var bb = f.k === '^' ? f.a[0] : f; if (bb.k === 's' && ['π', 'e', 'i'].indexOf(bb.name) < 0) return 0; if (bb.k === 's') return 1; return 2; }
        numr = numr.map(function (f, i) { return [f, i]; }).sort(function (p1, p2) { var r1 = rank(p1[0]), r2 = rank(p2[0]); if (r1 !== r2) return r1 - r2; if (r1 === 0) { var n1 = (p1[0].k === '^' ? p1[0].a[0] : p1[0]).name, n2 = (p2[0].k === '^' ? p2[0].a[0] : p2[0]).name; if (n1 !== n2) return n1 < n2 ? -1 : 1; } return p1[1] - p2[1]; }).map(function (p1) { return p1[0]; });
        var str = cf || (c && !c.isOne() ? c.toString() : '');
        numr.forEach(function (f, i) {
          var ps = paren(f, 3);
          if (!str) { str = ps; return; }
          var glue;
          if (/^\d/.test(ps)) glue = '·';
          else if (i === 0) glue = '';
          else glue = (rank(numr[i - 1]) === 0 && rank(f) === 0) || ps[0] === '(' ? '' : '·';
          str += glue + ps;
        });
        if (!str) str = '1';
        if (!den.length) return sgn + str;
        return sgn + str + '/' + paren(den.length === 1 ? den[0] : simpMul(den), 3);
      }
      case '^': {
        var b = x.a[0], e = x.a[1];
        if (isQ(e) && e.v.n === 1n && e.v.d === 2n) return '√' + paren(b, 4);
        if (isQ(e) && e.v.n === 1n && e.v.d === 3n) return '∛' + paren(b, 4);
        if (isNum(e) && num(e.v) < 0) return '1/' + paren(simpPow(b, N(e.v instanceof Q ? e.v.neg() : -e.v)), 3);
        if (isQ(e) && e.v.d === 2n) return '√' + paren(simpPow(b, N(new Q(e.v.n, 1n))), 4);
        var es = isQ(e) && e.v.isInt() ? supNum(e.v.n.toString()) : null;
        return paren(b, 4) + (es || '^' + paren(e, 4));
      }
      case 'f': return x.name + '(' + x.a.map(show).join(', ') + ')';
      case 'call': return x.name + '(' + x.a.map(show).join(', ') + ')';
      case 'list': return '{' + x.a.map(show).join(', ') + '}';
      case 'tuple': return '(' + x.a.map(show).join(', ') + ')';
      case 'mat': return '[' + x.a.map(function (r) { return '[' + r.map(show).join(', ') + ']'; }).join(', ') + ']';
      case 'rel': return show(x.a[0]) + ' ' + ({ '<=': '≤', '>=': '≥', '!=': '≠' }[x.op] || x.op) + ' ' + show(x.a[1]);
      case 'chain': return x.a.map(show).reduce(function (s, p, i) { return i ? s + ' ' + ({ '<=': '≤', '>=': '≥' }[x.ops[i - 1]] || x.ops[i - 1]) + ' ' + p : p; }, '');
      case 'text': return x.s;
      case 'sol': return x.a.length ? x.a.map(show).join(x.and ? ',  ' : '  or  ') + (x.note || '') : 'no solution' + (x.note || '');
      default: return '?';
    }
  }

  // ================= calculus =================
  function D(x, v) { // derivative, unsimplified
    if (!hasVar(x, v)) return ZERO;
    switch (x.k) {
      case 's': return ONE;
      case '+': return Add(x.a.map(function (t) { return D(t, v); }));
      case '*': { var terms = []; x.a.forEach(function (f, i) { if (!hasVar(f, v)) return; var o = x.a.slice(); o[i] = D(f, v); terms.push(Mul(o)); }); return Add(terms); }
      case '^': {
        var b = x.a[0], e = x.a[1];
        if (!hasVar(e, v)) return Mul([e, Pow(b, Add([e, MONE])), D(b, v)]);
        if (!hasVar(b, v)) return Mul([x, F('ln', [b]), D(e, v)]);
        return Mul([x, Add([Mul([D(e, v), F('ln', [b])]), Mul([e, D(b, v), Pow(b, MONE)])])]);
      }
      case 'f': {
        var u = x.a[0], du = D(u, v), k = STATE.deg ? N(PI / 180) : ONE;
        var r = {
          sin: function () { return Mul([k, F('cos', [u])]); }, cos: function () { return Mul([MONE, k, F('sin', [u])]); }, tan: function () { return Mul([k, Pow(F('cos', [u]), N(q(-2)))]); },
          sec: function () { return Mul([k, F('sec', [u]), F('tan', [u])]); }, csc: function () { return Mul([MONE, k, F('csc', [u]), F('cot', [u])]); }, cot: function () { return Mul([MONE, k, Pow(F('sin', [u]), N(q(-2)))]); },
          asin: function () { return Pow(sub(ONE, Pow(u, TWO)), N(q(-1, 2))); }, acos: function () { return Mul([MONE, Pow(sub(ONE, Pow(u, TWO)), N(q(-1, 2)))]); }, atan: function () { return Pow(Add([ONE, Pow(u, TWO)]), MONE); },
          sinh: function () { return F('cosh', [u]); }, cosh: function () { return F('sinh', [u]); }, tanh: function () { return Pow(F('cosh', [u]), N(q(-2))); },
          asinh: function () { return Pow(Add([Pow(u, TWO), ONE]), N(q(-1, 2))); }, acosh: function () { return Pow(sub(Pow(u, TWO), ONE), N(q(-1, 2))); }, atanh: function () { return Pow(sub(ONE, Pow(u, TWO)), MONE); },
          ln: function () { return Pow(u, MONE); }, log: function () { return Pow(Mul([u, F('ln', [N(q(10))])]), MONE); }, exp: function () { return F('exp', [u]); },
          sqrt: function () { return Mul([HALF, Pow(u, N(q(-1, 2)))]); }, cbrt: function () { return Mul([N(q(1, 3)), Pow(u, N(q(-2, 3)))]); }, abs: function () { return F('sign', [u]); },
          sign: function () { return ZERO; }, floor: function () { return ZERO; }, ceil: function () { return ZERO; }, round: function () { return ZERO; }
        }[x.name];
        if (x.name === 'log' && x.a.length === 2) return D(div(F('ln', [x.a[0]]), F('ln', [x.a[1]])), v);
        if (!r) throw new Error('I can\'t differentiate ' + x.name);
        return Mul([r(), du]);
      }
      default: throw new Error('I can\'t differentiate that');
    }
  }
  function deriv(x, v, n) { var r = x; for (var i = 0; i < (n || 1); i++) r = simp(expandTrig(D(r, v))); return tidy(r); }
  function expandTrig(x) { return x; }

  // linear form a*v + b  ->  [a, b] nodes, or null
  function linear(x, v) { var d = simp(D(x, v)); if (hasVar(d, v)) return null; var b = simp(sub(x, Mul([d, S(v)]))); if (hasVar(b, v)) return null; return [d, b]; }
  function splitConst(x, v) { // x = c * rest, c free of v
    if (x.k === '*') { var c = [], r = []; x.a.forEach(function (f) { (hasVar(f, v) ? r : c).push(f); }); return [c.length ? simp(Mul(c)) : ONE, r.length === 0 ? ONE : r.length === 1 ? r[0] : Mul(r)]; }
    return hasVar(x, v) ? [ONE, x] : [x, ONE];
  }
  function integ(x, v, depth) { // indefinite integral or null
    depth = depth || 0; if (depth > 8) return null;
    x = simp(x);
    if (!hasVar(x, v)) return simp(Mul([x, S(v)]));
    if (x.k === '+') { var parts = x.a.map(function (t) { return integ(t, v, depth + 1); }); return parts.indexOf(null) >= 0 ? null : simp(Add(parts)); }
    var cs = splitConst(x, v); if (!isOne(cs[0])) { var r = integ(cs[1], v, depth + 1); return r ? simp(Mul([cs[0], r])) : null; }
    var V = S(v);
    if (x.k === 's') return simp(Mul([HALF, Pow(V, TWO)]));
    if (x.k === '^') {
      var b = x.a[0], e = x.a[1];
      if (!hasVar(e, v)) { var lin = linear(b, v); if (lin && !isZero(lin[0])) { if (isQ(e) && e.v.n === -1n && e.v.d === 1n) return simp(Mul([Pow(lin[0], MONE), F('ln', [F('abs', [b])])])); var e1 = simp(Add([e, ONE])); return simp(Mul([Pow(Mul([lin[0], e1]), MONE), Pow(b, e1)])); } }
      if (!hasVar(b, v)) { var le = linear(e, v); if (le) return simp(Mul([Pow(Mul([le[0], F('ln', [b])]), MONE), x])); }
      // 1/(x^2+a^2) -> atan
      if (isQ(e) && e.v.n === -1n && e.v.d === 1n) {
        var p = toPoly(b, v); if (p && p.length === 3 && p[1].isZero() && p[2].sign() > 0 && p[0].sign() > 0) { var a2 = p[0].div(p[2]); var a = simpPow(N(a2), HALF); return simp(Mul([Pow(N(p[2]), MONE), Pow(a, MONE), F('atan', [Mul([S(v), Pow(a, MONE)])])])); }
        if (p && p.length >= 2) { var pf = partialFractions(p, v); if (pf) return integ(pf, v, depth + 1); }
      }
      if (isQ(e) && e.v.n === -1n && e.v.d === 2n) { var p2 = toPoly(b, v); if (p2 && p2.length === 3 && p2[1].isZero() && p2[2].sign() < 0 && p2[0].sign() > 0) { var a3 = simpPow(N(p2[0].div(p2[2].neg())), HALF); return simp(Mul([Pow(simpPow(N(p2[2].neg()), HALF), MONE), F('asin', [Mul([S(v), Pow(a3, MONE)])])])); } }
    }
    if (x.k === 'f' && x.a.length === 1) {
      var u = x.a[0], l = linear(u, v);
      if (l && !isZero(l[0])) {
        var inv = Pow(l[0], MONE), k = STATE.deg ? N(180 / PI) : ONE;
        var t = { sin: Mul([MONE, k, F('cos', [u])]), cos: Mul([k, F('sin', [u])]), tan: Mul([MONE, k, F('ln', [F('abs', [F('cos', [u])])])]), exp: F('exp', [u]),
          sinh: F('cosh', [u]), cosh: F('sinh', [u]), ln: sub(Mul([u, F('ln', [u])]), u), sqrt: Mul([N(q(2, 3)), Pow(u, N(q(3, 2)))]), sec: F('ln', [F('abs', [Add([F('sec', [u]), F('tan', [u])])])]),
          atan: sub(Mul([u, F('atan', [u])]), Mul([HALF, F('ln', [Add([ONE, Pow(u, TWO)])])])), asin: Add([Mul([u, F('asin', [u])]), Pow(sub(ONE, Pow(u, TWO)), HALF)]) }[x.name];
        if (t) return simp(Mul([inv, t]));
      }
    }
    if (x.k === '*') {
      // polynomial * (exp|sin|cos of linear): integrate by parts
      var polyPart = [], other = [];
      x.a.forEach(function (f) { (toPoly(f, v) ? polyPart : other).push(f); });
      if (polyPart.length && other.length === 1) {
        var P = simp(Mul(polyPart)), G = other[0], Gi = integ(G, v, depth + 1);
        if (Gi && toPoly(P, v)) { var rest = integ(simp(Mul([D(P, v), Gi])), v, depth + 1); if (rest) return simp(sub(Mul([P, Gi]), rest)); }
      }
      // f'(x) * g(f(x)) style: u-substitution for (stuff)^n * stuff'
      var sbs = uSub(x, v, depth); if (sbs) return sbs;
      if (polyPart.length === x.a.length || x.a.every(function (f) { return toPoly(f, v) || (f.k === '^' && isQ(f.a[1]) && toPoly(f.a[0], v)); })) { var ex = expand(x); if (key(ex) !== key(x)) return integ(ex, v, depth + 1); }
    }
    if (x.k === '^' && isQ(x.a[1]) && x.a[1].v.isInt() && x.a[1].v.n > 1n && toPoly(x.a[0], v)) return integ(expand(x), v, depth + 1);
    if (x.k === '^' && x.a[0].k === 'f' && ['sin', 'cos'].indexOf(x.a[0].name) >= 0 && isQ(x.a[1]) && x.a[1].v.n === 2n && x.a[1].v.d === 1n) {
      var uu = x.a[0].a[0]; var dbl = Mul([TWO, uu]); return integ(Mul([HALF, x.a[0].name === 'sin' ? sub(ONE, F('cos', [dbl])) : Add([ONE, F('cos', [dbl])])]), v, depth + 1);
    }
    var sb = uSub(x, v, depth); if (sb) return sb;
    return null;
  }
  function uSub(x, v, depth) { // try u = an inner expression whose derivative appears as a factor
    var cands = []; (function walk(y) { if (y.k === 'f' || y.k === '^') { var inner = y.k === 'f' ? y.a[0] : y.a[0]; if (hasVar(inner, v) && inner.k !== 's') cands.push(inner); } if (y.a) y.a.forEach(function (z) { if (!Array.isArray(z)) walk(z); }); })(x);
    for (var i = 0; i < cands.length; i++) {
      var u = cands[i], du = simp(D(u, v)); if (isZero(du)) continue;
      var ratio = simp(div(x, du)); var U = S('__u');
      var replaced = simp(replaceExpr(ratio, u, U));
      if (!hasVar(replaced, v)) { var r = integ(replaced, '__u', depth + 1); if (r) return simp(replaceExpr(r, U, u)); }
    }
    return null;
  }
  function replaceExpr(x, from, to) { var kf = key(from); return (function rep(y) { if (key(y) === kf) return to; if (!y.a) return y; var c = Object.assign({}, y); c.a = y.a.map(function (z) { return Array.isArray(z) ? z.map(rep) : rep(z); }); return c; })(x); }
  function subst(x, v, val) { return simp(replaceExpr(x, S(v), val)); }

  function numIntegrate(f, a, b) { // adaptive Simpson
    if (a === b) return 0; if (!isFinite(a) || !isFinite(b)) { // map infinite ranges
      if (!isFinite(a) && !isFinite(b)) return numIntegrate(function (t) { var x = t / (1 - t * t); return f(x) * (1 + t * t) / Math.pow(1 - t * t, 2); }, -1 + 1e-9, 1 - 1e-9);
      if (!isFinite(b)) return numIntegrate(function (t) { return f(a + t / (1 - t)) / Math.pow(1 - t, 2); }, 0, 1 - 1e-9);
      return -numIntegrate(function (t) { return f(b - t / (1 - t)) / Math.pow(1 - t, 2); }, 0, 1 - 1e-9);
    }
    function simpson(a, b, fa, fm, fb) { return (b - a) / 6 * (fa + 4 * fm + fb); }
    function rec(a, b, fa, fm, fb, whole, eps, depth) {
      var m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2, flm = f(lm), frm = f(rm);
      var left = simpson(a, m, fa, flm, fm), right = simpson(m, b, fm, frm, fb);
      if (depth > 40 || Math.abs(left + right - whole) <= 15 * eps) return left + right + (left + right - whole) / 15;
      return rec(a, m, fa, flm, fm, left, eps / 2, depth + 1) + rec(m, b, fm, frm, fb, right, eps / 2, depth + 1);
    }
    var fa = f(a), fb = f(b), fm = f((a + b) / 2);
    if (!isFinite(fa)) fa = f(a + (b - a) * 1e-9); if (!isFinite(fb)) fb = f(b - (b - a) * 1e-9);
    return rec(a, b, fa, fm, fb, simpson(a, b, fa, fm, fb), 1e-10, 0);
  }

  // ================= polynomials =================
  function toPoly(x, v) { // array of Q coefficients (index = degree) or null
    x = simp(x);
    function P(y) {
      if (!hasVar(y, v)) return isQ(y) ? [y.v] : null;
      if (y.k === 's') return [q(0), q(1)];
      if (y.k === '+') { var acc = [q(0)]; for (var i = 0; i < y.a.length; i++) { var p = P(y.a[i]); if (!p) return null; acc = pAdd(acc, p); } return acc; }
      if (y.k === '*') { var acc2 = [q(1)]; for (i = 0; i < y.a.length; i++) { p = P(y.a[i]); if (!p) return null; acc2 = pMul(acc2, p); } return acc2; }
      if (y.k === '^' && isQ(y.a[1]) && y.a[1].v.isInt() && y.a[1].v.n >= 0n && y.a[1].v.n < 60n) { var b = P(y.a[0]); if (!b) return null; var r = [q(1)]; for (var k = 0n; k < y.a[1].v.n; k++) r = pMul(r, b); return r; }
      return null;
    }
    var p = P(x); return p ? pTrim(p) : null;
  }
  function pTrim(p) { while (p.length > 1 && p[p.length - 1].isZero()) p.pop(); return p; }
  function pAdd(a, b) { var r = []; for (var i = 0; i < Math.max(a.length, b.length); i++) r.push((a[i] || q(0)).add(b[i] || q(0))); return pTrim(r); }
  function pMul(a, b) { var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(q(0)); a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] = r[i + j].add(x.mul(y)); }); }); return pTrim(r); }
  function pDivmod(a, b) { a = a.slice(); var qt = []; var db = b.length - 1; for (var i = a.length - 1 - db; i >= 0; i--) { var c = a[i + db].div(b[db]); qt[i] = c; for (var j = 0; j <= db; j++) a[i + j] = a[i + j].sub(c.mul(b[j])); } for (i = 0; i < qt.length; i++) if (!qt[i]) qt[i] = q(0); return [pTrim(qt.length ? qt : [q(0)]), pTrim(a.slice(0, Math.max(1, db)))]; }
  function pEval(p, x) { var r = q(0); for (var i = p.length - 1; i >= 0; i--) r = r.mul(x).add(p[i]); return r; }
  function polyNode(p, v) { var t = []; p.forEach(function (c, i) { if (c.isZero()) return; t.push(simpMul([N(c), simpPow(S(v), N(q(i)))])); }); return t.length ? simp(Add(t)) : ZERO; }
  function divisors(n) { n = babs(n); var r = []; if (n === 0n) return [1n]; if (n > 10n ** 12n) return [1n]; for (var i = 1n; i * i <= n; i++) if (n % i === 0n) { r.push(i); if (i * i !== n) r.push(n / i); } return r; }
  function rationalRoots(p) { // p with Q coefs -> list of Q roots (with multiplicity handled by caller)
    var lcmD = p.reduce(function (s, c) { return s * c.d / bgcd(s, c.d); }, 1n); var ints = p.map(function (c) { return c.n * (lcmD / c.d); });
    var low = 0; while (low < ints.length && ints[low] === 0n) low++;
    var roots = []; if (low > 0) roots.push(q(0));
    var a0 = ints[low], an = ints[ints.length - 1]; if (a0 === undefined) return roots;
    var ps = divisors(a0), qs = divisors(an), seen = {};
    ps.forEach(function (pp) { qs.forEach(function (qq) { [1n, -1n].forEach(function (s) { var r = new Q(s * pp, qq), k = r.toString(); if (seen[k]) return; seen[k] = 1; if (pEval(p, r).isZero()) roots.push(r); }); }); });
    return roots;
  }
  function factorPoly(p, v) {
    p = p.slice(); var factors = [];
    var lcmD = p.reduce(function (s, c) { return s * c.d / bgcd(s, c.d); }, 1n); var g = p.reduce(function (s, c) { return bgcd(s, c.n * (lcmD / c.d)); }, 0n);
    var content = new Q(g, lcmD); if (p[p.length - 1].sign() < 0) content = content.neg();
    p = p.map(function (c) { return c.div(content); });
    var changed = true;
    while (changed && p.length > 2) {
      changed = false; var rs = rationalRoots(p);
      for (var i = 0; i < rs.length; i++) { var r = rs[i]; var lin = [r.n === 0n ? q(0) : new Q(-r.n, 1n), new Q(r.d, 1n)]; var dm = pDivmod(p, lin); if (dm[1].every(function (c) { return c.isZero(); })) { factors.push(lin); p = dm[0]; changed = true; break; } }
    }
    if (p.length === 3) { // quadratic over Q with square discriminant
      var a = p[2], b = p[1], c = p[0], disc = b.mul(b).sub(q(4).mul(a).mul(c));
      if (disc.sign() >= 0) { var sn = iroot(disc.n, 2n), sd = iroot(disc.d, 2n); if (sn !== null && sd !== null) { var s = new Q(sn, sd); var r1 = b.neg().add(s).div(q(2).mul(a)), r2 = b.neg().sub(s).div(q(2).mul(a)); factors.push([new Q(-r1.n, 1n), new Q(r1.d, 1n)]); factors.push([new Q(-r2.n, 1n), new Q(r2.d, 1n)]); var lead = a.div(new Q(r1.d * r2.d, 1n)); content = content.mul(lead); p = [q(1)]; } }
    }
    // group equal factors
    var groups = {}, ord = [];
    factors.concat(p.length > 1 ? [p] : []).forEach(function (f) { var k = f.map(String).join(','); if (!groups[k]) { groups[k] = { f: f, n: 0 }; ord.push(k); } groups[k].n++; });
    if (p.length === 1) content = content.mul(p[0]);
    var nodes = ord.map(function (k) { var gp = groups[k]; var fn = polyNode(gp.f, v); return gp.n > 1 ? Pow(fn, N(q(gp.n))) : fn; });
    if (!content.isOne()) nodes.unshift(N(content));
    return nodes.length === 1 ? nodes[0] : Mul(nodes);
  }
  function partialFractions(den, v) { return null; }
  function polyRoots(p) { // numeric complex roots (Durand–Kerner)
    var n = p.length - 1; if (n < 1) return [];
    var a = p.map(function (c) { return c.toNum(); }), lead = a[n]; a = a.map(function (c) { return c / lead; });
    var z = []; for (var i = 0; i < n; i++) z.push(Cx.pow(new C(0.4, 0.9), new C(i, 0)));
    function f(x) { var r = new C(0, 0); for (var k = n; k >= 0; k--) r = Cx.add(Cx.mul(r, x), new C(a[k], 0)); return r; }
    for (var it = 0; it < 500; it++) { var delta = 0; for (i = 0; i < n; i++) { var den = new C(1, 0); for (var j = 0; j < n; j++) if (j !== i) den = Cx.mul(den, Cx.sub(z[i], z[j])); var w = Cx.div(f(z[i]), den); z[i] = Cx.sub(z[i], w); delta = Math.max(delta, Cx.abs(w)); } if (delta < 1e-14) break; }
    return z.map(function (r) { return new C(Math.abs(r.re) < 1e-10 ? 0 : r.re, Math.abs(r.im) < 1e-9 ? 0 : r.im); });
  }

  // ================= expand / factor / tidy =================
  function expand(x) {
    x = simp(x);
    if (x.a && x.k !== 'f') { var c = Object.assign({}, x); c.a = x.a.map(function (y) { return Array.isArray(y) ? y.map(expand) : expand(y); }); x = simp(c); }
    if (x.k === '*') {
      var acc = [ONE];
      var r0 = ONE; x.a.forEach(function (f) { r0 = mulDistribute(r0, f); }); return r0;
    }
    if (x.k === '^' && x.a[0].k === '+' && isQ(x.a[1]) && x.a[1].v.isInt() && x.a[1].v.n > 1n && x.a[1].v.n <= 30n) {
      var r = x.a[0]; for (var i = 1n; i < x.a[1].v.n; i++) r = mulDistribute(r, x.a[0]); return r;
    }
    if (x.k === '^' && x.a[0].k === '+' && isQ(x.a[1]) && x.a[1].v.isInt() && x.a[1].v.n < 0n) return simpPow(expand(Pow(x.a[0], N(x.a[1].v.neg()))), MONE);
    return x;
  }
  function mulDistribute(A, B) { var ta = A.k === '+' ? A.a : [A], tb = B.k === '+' ? B.a : [B], out = []; ta.forEach(function (a) { tb.forEach(function (b) { out.push(simp(Mul([a, b]))); }); }); return simpAdd(out); }
  function distribute(x) { // c*(a+b) -> c*a + c*b, recursively, for tidier answers
    if (!x.a || x.k === 'f') return x;
    var c = Object.assign({}, x); c.a = x.a.map(function (y) { return Array.isArray(y) ? y.map(distribute) : distribute(y); }); x = simp(c);
    if (x.k === '*' && x.a.length === 2 && isQ(x.a[0])) { var s2 = x.a[1]; if (s2.k === '+') return simpAdd(s2.a.map(function (t) { return simpMul([x.a[0], t]); })); }
    return x;
  }
  function factor(x) {
    x = simp(x);
    if (isQ(x) && x.v.isInt()) return factorInt(x.v.n);
    if (isQ(x)) { var fn = factorInt(x.v.n), fd = factorInt(x.v.d); return { k: 'text', s: show(fn) + ' / ' + show(fd) }; }
    var v = mainVar(x), p = toPoly(expand(x), v);
    if (p && p.length > 2) return factorPoly(p, v);
    var ex = expand(x); if (ex.k === '+') { // common factor of terms
      var parts = ex.a.map(function (t) { return splitCoef(t); });
      var ints = parts.map(function (pc) { return pc[0] instanceof Q ? pc[0] : null; });
      if (ints.every(function (c) { return c; })) { var g = ints.reduce(function (s, c) { return bgcd(s, c.n); }, 0n), d = ints.reduce(function (s, c) { return s * c.d / bgcd(s, c.d); }, 1n); var cf = new Q(g, d); if (!cf.isOne() && !cf.isZero()) return Mul([N(cf), simp(div(ex, N(cf)))]); }
    }
    return x;
  }
  function factorInt(n) {
    if (n === 0n || babs(n) === 1n) return N(new Q(n, 1n));
    var out = [], m = babs(n);
    if (m > 10n ** 22n) throw new Error('That number is too big to factor here');
    for (var p = 2n; p * p <= m; p += (p === 2n ? 1n : 2n)) { var c = 0; while (m % p === 0n) { m /= p; c++; } if (c) out.push(c > 1 ? Pow(N(new Q(p, 1n)), N(q(c))) : N(new Q(p, 1n))); }
    if (m > 1n) out.push(N(new Q(m, 1n)));
    if (n < 0n) out.unshift(MONE);
    return out.length === 1 ? out[0] : { k: '*', a: out, keep: true };
  }
  function tidy(x) { // light clean-up for nicer derivative/integral output
    return simp(x);
  }
  function comdenom(x) { // combine into one fraction
    x = simp(x); if (x.k !== '+') return x;
    var dens = []; x.a.forEach(function (t) { var d = (t.k === '*' ? t.a : [t]).filter(function (f) { return f.k === '^' && isNum(f.a[1]) && num(f.a[1].v) < 0; }); dens.push(simp(Mul(d.map(function (f) { return simpPow(f.a[0], N(f.a[1].v instanceof Q ? f.a[1].v.neg() : -f.a[1].v)); }).concat([ONE])))); });
    var common = simp(Mul(dens.filter(function (d, i) { return dens.findIndex(function (e) { return key(e) === key(d); }) === i; })));
    var numr = expand(Add(x.a.map(function (t) { return Mul([t, common]); })));
    return { k: '*', a: [numr, Pow(common, MONE)], keep: true };
  }

  // ================= solving =================
  function sqrtNode(qv) { return simpPow(N(qv), HALF); }
  function solve(eq, v, ctx) {
    var expr = eq.k === 'rel' ? simp(sub(eq.a[0], eq.a[1])) : simp(eq);
    if (eq.k === 'rel' && eq.op !== '=') return solveIneq(eq, v);
    var ex = expand(comdenomNum(expr));
    var p = toPoly(ex, v);
    if (p) {
      if (p.length === 1) return { k: 'text', s: p[0].isZero() ? 'true for every ' + v : 'no solution' };
      var sols = [], rest = p.slice(), rs;
      for (var guard = 0; guard < 20 && rest.length > 1; guard++) {
        rs = rationalRoots(rest); if (!rs.length) break;
        var r = rs[0]; sols.push(N(r)); rest = pDivmod(rest, [r.neg(), q(1)])[0];
      }
      if (rest.length === 2) sols.push(N(rest[0].neg().div(rest[1])));
      else if (rest.length === 3) {
        var a = rest[2], b = rest[1], c = rest[0], disc = b.mul(b).sub(q(4).mul(a).mul(c));
        var twoA = q(2).mul(a), m = N(b.neg().div(twoA)), sq = sqrtNode(disc.div(twoA.mul(twoA)));
        sols.push(simp(Add([m, sq]))); sols.push(simp(sub(m, sq)));
      } else if (rest.length > 3) polyRoots(rest).forEach(function (z) { sols.push(N(vNorm(z))); });
      var uniq = []; sols.forEach(function (s) { if (!uniq.some(function (u) { return key(u) === key(s); })) uniq.push(s); });
      // keep the real ones first
      uniq.sort(function (A, B) { var a1 = evalNum(A), b1 = evalNum(B); var ar = !(a1 instanceof C), br = !(b1 instanceof C); if (ar !== br) return ar ? -1 : 1; return num(ar ? a1 : 0) - num(br ? b1 : 0); });
      return { k: 'sol', v: v, a: uniq.map(function (s) { return { k: 'rel', op: '=', a: [S(v), s] }; }) };
    }
    var iso = isolate(eq.a[0], eq.a[1], v) || isolate(eq.a[1], eq.a[0], v);
    if (iso) { var chkf = compile(expr, [v], ctx && ctx.env), iv = evalNum(iso); if (typeof iv === 'number' && Math.abs(chkf(iv)) < 1e-8 * Math.max(1, Math.abs(iv))) return { k: 'sol', v: v, a: [{ k: 'rel', op: '=', a: [S(v), iso] }] }; }
    var fn = compile(expr, [v], ctx && ctx.env), roots = numRoots(fn, -10, 10), note = '    (solutions between −10 and 10)';
    if (!roots.length) { roots = numRoots(fn, -1000, 1000); note = '    (solutions between −1000 and 1000)'; }
    if (roots.length > 12) { roots = roots.slice().sort(function (a, b) { return Math.abs(a) - Math.abs(b); }).slice(0, 12).sort(function (a, b) { return a - b; }); note = '    (the 12 solutions nearest 0; there are more)'; }
    return { k: 'sol', v: v, approx: true, note: roots.length ? note : '', a: roots.map(function (r) { return { k: 'rel', op: '=', a: [S(v), roundNice(r)] }; }) };
  }
  function isolate(l, r, v) {
    l = simp(l); r = simp(r); if (hasVar(r, v) || !hasVar(l, v)) return null;
    for (var g = 0; g < 12; g++) {
      if (l.k === 's' && l.name === v) { r = simp(r); if (!hasAnyVar(r)) { var rv = evalNum(r), rq = typeof rv === 'number' ? floatToQ(rv, 1000) : null; if (rq && Math.abs(rq.toNum() - rv) < 1e-12 * Math.max(1, Math.abs(rv))) return N(rq); } return r; }
      if (l.k === '+' || l.k === '*') {
        var w = l.a.filter(function (t) { return hasVar(t, v); }), o = l.a.filter(function (t) { return !hasVar(t, v); });
        if (w.length !== 1) return null;
        if (l.k === '+') r = simp(sub(r, Add(o.length ? o : [ZERO]))); else r = simp(div(r, Mul(o.length ? o : [ONE])));
        l = w[0]; continue;
      }
      if (l.k === '^') {
        var b = l.a[0], e = l.a[1];
        if (!hasVar(e, v)) { if (isQ(e) && e.v.isInt() && e.v.n % 2n === 0n) return null; r = simpPow(r, simpPow(e, MONE)); l = b; continue; }
        if (!hasVar(b, v)) { r = simp(div(F('ln', [r]), F('ln', [b]))); l = e; continue; }
        return null;
      }
      if (l.k === 'f' && l.a.length === 1) {
        var u = l.a[0], inv = { ln: function () { return Pow(S('e'), r); }, exp: function () { return F('ln', [r]); }, log: function () { return Pow(N(q(10)), r); }, sqrt: function () { return Pow(r, TWO); }, cbrt: function () { return Pow(r, N(q(3))); },
          sinh: function () { return F('asinh', [r]); }, tanh: function () { return F('atanh', [r]); } }[l.name];
        if (!inv) return null; r = simp(inv()); l = u; continue;
      }
      return null;
    }
    return null;
  }
  function comdenomNum(x) { // multiply through by denominators so rational equations become polynomial
    x = simp(x); if (x.k !== '+') { if (x.k === '*') return simp(Mul(x.a.filter(function (f) { return !(f.k === '^' && isNum(f.a[1]) && num(f.a[1].v) < 0 && hasAnyVar(f.a[0])); }))); return x; }
    var c = comdenom(x); return c.a ? c.a[0] : x;
  }
  function hasAnyVar(x) { return Object.keys(freeVars(x)).length > 0; }
  function solveIneq(eq, v) {
    var expr = simp(sub(eq.a[0], eq.a[1])), f = compile(expr, [v]);
    var crit = numRoots(f, -1000, 1000).sort(function (a, b) { return a - b; });
    var pts = [-Infinity].concat(crit, [Infinity]), parts = [];
    var test = { '<': function (y) { return y < 0; }, '<=': function (y) { return y <= 0; }, '>': function (y) { return y > 0; }, '>=': function (y) { return y >= 0; } }[eq.op];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], mid = !isFinite(a) ? b - 1 : !isFinite(b) ? a + 1 : (a + b) / 2;
      if (!isFinite(a) && !isFinite(b)) mid = 0;
      if (test(f(mid))) parts.push([a, b]);
    }
    if (!parts.length) return { k: 'text', s: 'no solution' };
    var inc = eq.op.length === 2;
    var s = parts.map(function (p) { var a = p[0], b = p[1]; if (!isFinite(a) && !isFinite(b)) return 'every ' + v; if (!isFinite(a)) return v + (inc ? ' ≤ ' : ' < ') + fmtNum(b); if (!isFinite(b)) return v + (inc ? ' ≥ ' : ' > ') + fmtNum(a); return fmtNum(a) + (inc ? ' ≤ ' : ' < ') + v + (inc ? ' ≤ ' : ' < ') + fmtNum(b); }).join('  or  ');
    return { k: 'text', s: s };
  }
  function numRoots(f, lo, hi) {
    var n = 4000, roots = [], step = (hi - lo) / n, prev = f(lo), px = lo;
    for (var i = 1; i <= n; i++) {
      var x = lo + i * step, y = f(x);
      if (isFinite(prev) && isFinite(y)) {
        if (prev === 0) roots.push(px);
        else if (prev * y < 0) { var a = px, b = x, fa = prev; for (var k = 0; k < 80; k++) { var m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } } var r = (a + b) / 2; if (Math.abs(f(r)) < 1e-6 * Math.max(1, Math.abs(prev), Math.abs(y))) roots.push(r); }
        else { // touching zero (double root): check a local min of |f|
          var mid = (px + x) / 2, fm2 = f(mid); if (Math.abs(fm2) < 1e-10) roots.push(mid);
        }
      }
      prev = y; px = x;
    }
    var out = []; roots.forEach(function (r) { r = Math.abs(r) < 1e-12 ? 0 : r; if (!out.some(function (o) { return Math.abs(o - r) < 1e-7 * Math.max(1, Math.abs(r)); })) out.push(Number(r.toPrecision(12))); });
    return out;
  }
  function solveSystem(eqs, vars) { // linear systems
    var n = vars.length, rows = eqs.map(function (eq) { var e = simp(sub(eq.a[0], eq.a[1])); var row = vars.map(function (v) { var d = simp(D(e, v)); if (vars.some(function (w) { return hasVar(d, w); })) throw new Error('That system isn\'t linear; try solving one equation at a time'); return d; }); var c = e; vars.forEach(function (v) { c = subst(c, v, ZERO); }); return row.concat([simp(neg(c))]); });
    var R = matRref({ k: 'mat', a: rows });
    var out = []; for (var i = 0; i < n; i++) { var row = R.a[i]; if (!row) break; var lead = row.findIndex(function (y) { return !isZero(y); }); if (lead < 0) continue; if (lead === n) return { k: 'text', s: 'no solution' }; if (row.slice(lead + 1, n).some(function (y) { return !isZero(y); })) return { k: 'text', s: 'infinitely many solutions' }; out.push({ k: 'rel', op: '=', a: [S(vars[lead]), row[n]] }); }
    if (out.length < n) return { k: 'text', s: 'infinitely many solutions' };
    return { k: 'sol', a: out, and: true };
  }

  // ================= statistics =================
  function nums(listNode) { if (!listNode || listNode.k !== 'list') throw new Error('Give a list, like {1, 2, 3}'); return listNode.a.map(function (y) { var v = evalNum(simp(y)); if (typeof v !== 'number' || isNaN(v)) throw new Error('The list must hold numbers'); return v; }); }
  function stats(name, L) {
    var xs = nums(L), n = xs.length; if (!n) throw new Error('The list is empty');
    var mean = xs.reduce(function (s, x) { return s + x; }, 0) / n;
    if (name === 'mean') return exactMean(L) || N(mean);
    if (name === 'total') return simp(Add(L.a));
    if (name === 'median') { var s = xs.slice().sort(function (a, b) { return a - b; }); var m = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; return N(floatToQ(m, 1000) && Math.abs(floatToQ(m, 1000).toNum() - m) < 1e-12 ? floatToQ(m, 1000) : m); }
    if (name === 'mode') { var cnt = {}, best = 0; xs.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; best = Math.max(best, cnt[x]); }); return { k: 'list', a: Object.keys(cnt).filter(function (k) { return cnt[k] === best; }).map(function (k) { return N(+k); }) }; }
    var ss = xs.reduce(function (s, x) { return s + (x - mean) * (x - mean); }, 0);
    if (name === 'variance') return N(ss / (n - 1));
    if (name === 'stdev') return N(Math.sqrt(ss / (n - 1)));
  }
  function exactMean(L) { if (!L.a.every(isQ)) return null; return simp(div(Add(L.a), N(q(L.a.length)))); }
  function regress(kind, X, Y) {
    var xs = nums(X), ys = nums(Y), n = xs.length; if (n !== ys.length || n < 2) throw new Error('Give two lists of the same length');
    if (kind === 'expreg') { var ly = ys.map(function (y) { if (y <= 0) throw new Error('expreg needs positive y values'); return Math.log(y); }); var lr = lsq(xs, ly, 1); return { k: 'text', s: 'y = ' + fmtNum(Math.exp(lr[0]), 6) + '·' + fmtNum(Math.exp(lr[1]), 6) + 'ˣ' }; }
    var deg = kind === 'quadreg' ? 2 : 1, c = lsq(xs, ys, deg);
    var mean = ys.reduce(function (s, y) { return s + y; }, 0) / n, sst = 0, sse = 0;
    ys.forEach(function (y, i) { var f = 0; for (var k = 0; k <= deg; k++) f += c[k] * Math.pow(xs[i], k); sse += (y - f) * (y - f); sst += (y - mean) * (y - mean); });
    var r2 = 1 - sse / sst;
    var eqs = 'y = ' + polyStr(c);
    return { k: 'text', s: eqs + '    (r² = ' + fmtNum(r2, 5) + (deg === 1 ? ', r = ' + fmtNum(Math.sign(c[1]) * Math.sqrt(Math.max(0, r2)), 5) : '') + ')', coef: c };
  }
  function polyStr(c) {
    var out = '';
    for (var k = c.length - 1; k >= 0; k--) {
      var v = Number(c[k].toPrecision(6)); if (Math.abs(v) < 1e-9) continue;
      var a = Math.abs(v), cs = (a === 1 && k > 0) ? '' : fmtNum(a, 6), xs = k === 0 ? '' : k === 1 ? 'x' : 'x' + (k === 2 ? '²' : '³');
      out += (out ? (v < 0 ? ' − ' : ' + ') : (v < 0 ? '−' : '')) + cs + xs;
    }
    return out || '0';
  }
  function lsq(xs, ys, deg) { // normal equations
    var m = deg + 1, A = [], b = [];
    for (var i = 0; i < m; i++) { A.push([]); for (var j = 0; j < m; j++) A[i].push(xs.reduce(function (s, x) { return s + Math.pow(x, i + j); }, 0)); b.push(xs.reduce(function (s, x, k) { return s + ys[k] * Math.pow(x, i); }, 0)); }
    for (i = 0; i < m; i++) { var p = i; for (j = i + 1; j < m; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j; var t = A[i]; A[i] = A[p]; A[p] = t; t = b[i]; b[i] = b[p]; b[p] = t; for (j = i + 1; j < m; j++) { var f = A[j][i] / A[i][i]; for (var k = i; k < m; k++) A[j][k] -= f * A[i][k]; b[j] -= f * b[i]; } }
    var x = []; for (i = m - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < m; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; } return x;
  }

  // ================= the evaluator (commands) =================
  function Ctx() { this.vars = {}; this.funcs = {}; this.deg = false; }
  Ctx.prototype.env = function () { var e = { __funcs: this.funcs }; for (var k in this.vars) { var v = evalNum(this.vars[k], e); if (typeof v === 'number') e[k] = v; } return e; };
  function substAll(x, ctx, bound) { // replace stored variables and user functions
    bound = bound || {};
    if (x.k === 's' && ctx.vars[x.name] && !bound[x.name]) return ctx.vars[x.name];
    if (x.k === 'call') { var fn = ctx.funcs[x.name]; var args = x.a.map(function (y) { return substAll(y, ctx, bound); }); var body = fn.body; fn.params.forEach(function (p, i) { body = replaceExpr(body, S(p), S('__p' + i)); }); fn.params.forEach(function (p, i) { body = replaceExpr(body, S('__p' + i), args[i]); }); return substAll(body, ctx, bound); }
    if (!x.a) return x;
    var c = Object.assign({}, x); c.a = x.a.map(function (y) { return Array.isArray(y) ? y.map(function (z) { return substAll(z, ctx, bound); }) : substAll(y, ctx, bound); }); return c;
  }
  function defPrimes(ctx, name) { var fn = ctx.funcs[name]; delete ctx.funcs[name + '\'']; delete ctx.funcs[name + '\'\''];
    if (fn.params.length !== 1) return; try { var d1 = deriv(simp(fn.body), fn.params[0]); ctx.funcs[name + '\''] = { params: fn.params, body: d1 }; ctx.funcs[name + '\'\''] = { params: fn.params, body: deriv(d1, fn.params[0]) }; } catch (e) { } }
  function varOf(node, fallback) { if (node && node.k === 's') return node.name; return fallback; }
  function approxNode(x) {
    x = simp(x);
    if (x.k === 'list' || x.k === 'tuple') return { k: x.k, a: x.a.map(approxNode) };
    if (x.k === 'mat') return { k: 'mat', a: x.a.map(function (r) { return r.map(approxNode); }) };
    if (x.k === 'rel') return { k: 'rel', op: x.op, a: x.a.map(approxNode) };
    if (x.k === 'sol') return { k: 'sol', a: x.a.map(approxNode) };
    if (!hasAnyVar(x)) { var v = evalNum(x, { __complex: true }); if (typeof v === 'number' || v instanceof C) return N(vNorm(v)); }
    // approximate the numbers inside
    var c = Object.assign({}, x); if (x.a) c.a = x.a.map(function (y) { return Array.isArray(y) ? y.map(approxNode) : approxNode(y); });
    if (x.k === 's' && (x.name === 'π' || x.name === 'e')) return N(evalNum(x));
    if (x.k === 'n' && x.v instanceof Q) return N(x.v.toNum());
    return simp(c);
  }

  function run(src, ctx) {
    ctx = ctx || new Ctx(); STATE.deg = ctx.deg;
    var am = /^\s*([A-Za-z][A-Za-z0-9_]+)\s*:?=(?!=)\s*(.+)$/.exec(src);
    if (am && !FSET[am[1]] && !CONSTS[am[1]] && am[1] !== 'theta' && !new RegExp('\\b' + am[1] + '\\b').test(am[2])) {
      var rv = parse(am[2], ctx); if (!rv) throw new Error('Nothing on the right of =');
      var val0 = evaluate(substAll(rv, ctx), ctx); ctx.vars[am[1]] = val0; return { out: am[1] + ' = ' + show(val0), node: val0, def: am[1] };
    }
    var tree = parse(src, ctx); if (!tree) return null;
    if (tree.k === 'rel' && tree.op === '=' && tree.a[0].k === 's' && tree.a[0].name.length > 1 && !hasVar(tree.a[1], tree.a[0].name) && !FSET[tree.a[0].name]) tree = { k: 'assign', target: tree.a[0], a: tree.a[1] };
    if (tree.k === 'assign') {
      var t = tree.target;
      if (t.k === 'call' || (t.k === '*' && t.a.length === 2 && t.a[0].k === 's' && t.a[1].k !== 'n')) { // f(x) := ...
        var name = t.k === 'call' ? t.name : t.a[0].name, params = t.k === 'call' ? t.a.map(function (p) { return p.name; }) : (t.a[1].k === 'tuple' ? t.a[1].a.map(function (p) { return p.name; }) : [t.a[1].name]);
        ctx.funcs[name] = { params: params, body: substAll(tree.a, ctx, params.reduce(function (o, p) { o[p] = 1; return o; }, {})) };
        defPrimes(ctx, name);
        return { out: name + '(' + params.join(', ') + ') = ' + show(simp(ctx.funcs[name].body)), node: ctx.funcs[name].body, def: name };
      }
      if (t.k !== 's') throw new Error('Put a name on the left of :=, like a := 5 or f(x) := x²');
      var val = evaluate(substAll(tree.a, ctx), ctx); ctx.vars[t.name] = val;
      return { out: t.name + ' = ' + show(val), node: val, def: t.name };
    }
    var res = evaluate(substAll(tree, ctx), ctx);
    var out = show(res), approx = null;
    if (res.k !== 'text' && !res.approx && !res.keep && !hasAnyVar(res)) { var ap = approxNode(res); var as = show(ap); if (as !== out && !/undefined/.test(as)) approx = as; }
    if (approx && /\d\.\d|(^|[^\d])\.\d/.test(src)) { out = approx; approx = null; } // decimals in, decimals out
    return { out: out, approx: approx, node: res };
  }
  function evaluate(x, ctx) {
    if (x.k === 'f') {
      var a = x.a, n = x.name, e = ctx.env();
      var arg0 = function () { return simp(a[0]); };
      switch (n) {
        case 'simplify': return simplifyFull(a[0]);
        case 'expand': return expand(a[0]);
        case 'factor': return factor(a[0]);
        case 'comdenom': return comdenom(a[0]);
        case 'approx': return approxNode(a[0]);
        case 'exact': { var v = evalNum(simp(a[0])); var r = floatToQ(num(v)); return r ? N(r) : simp(a[0]); }
        case 'd': {
          var ex = simp(a[0]), v1 = varOf(a[1], mainVar(ex)), times = a[2] && isQ(simp(a[2])) ? Number(simp(a[2]).v.n) : 1;
          if (a[1] && a[1].k === 'rel') { v1 = a[1].a[0].name; var dv = deriv(ex, v1, times); return subst(dv, v1, simp(a[1].a[1])); }
          return deriv(ex, v1, times);
        }
        case 'tangent': { var fx = simp(a[0]), vv = mainVar(fx), at = simp(a[1]); var y0 = subst(fx, vv, at), m = subst(deriv(fx, vv), vv, at); return { k: 'rel', op: '=', a: [S('y'), simp(expand(Add([Mul([m, sub(S(vv), at)]), y0])))] }; }
        case 'int': {
          var f = simp(a[0]), v2 = varOf(a[1], mainVar(f));
          if (a.length >= 4) {
            var lo = simp(a[2]), hi = simp(a[3]); var F2 = integ(f, v2);
            if (F2 && !hasNonFinite(lo, hi)) { var val2 = simp(sub(subst(F2, v2, hi), subst(F2, v2, lo))); var chk = evalNum(val2), nchk = numIntegrate(compile(f, [v2], e), num(evalNum(lo)), num(evalNum(hi))); if (typeof chk === 'number' && Math.abs(chk - nchk) < 1e-6 * Math.max(1, Math.abs(nchk))) return val2; }
            return N(numIntegrate(compile(f, [v2], e), num(evalNum(lo)), num(evalNum(hi))));
          }
          var r2 = integ(f, v2); if (r2) r2 = distribute(r2); if (!r2) throw new Error('I can\'t find an exact antiderivative for that. Try a definite integral, like int(' + show(f) + ', ' + v2 + ', 0, 1), for a number.');
          return r2;
        }
        case 'solve': case 'nsolve': {
          if (a[0].k === 'list' || a[0].k === 'tuple') { var vars = a[1] ? (a[1].k === 'list' || a[1].k === 'tuple' ? a[1].a.map(function (y) { return y.name; }) : [a[1].name]) : Object.keys(freeVars(a[0])).sort(); return solveSystem(a[0].a.map(function (q2) { return q2.k === 'rel' ? q2 : { k: 'rel', op: '=', a: [q2, ZERO] }; }), vars); }
          var eq = a[0].k === 'rel' ? a[0] : { k: 'rel', op: '=', a: [a[0], ZERO] };
          var v3 = varOf(a[1], mainVar(eq));
          if (n === 'nsolve') { var rs = numRoots(compile(simp(sub(eq.a[0], eq.a[1])), [v3], e), -1000, 1000); return { k: 'sol', a: rs.map(function (r) { return { k: 'rel', op: '=', a: [S(v3), N(r)] }; }) }; }
          return solve(eq, v3, { env: e });
        }
        case 'roots': { var pe = simp(a[0]), v4 = varOf(a[1], mainVar(pe)), pp = toPoly(expand(pe), v4); if (!pp) return solve({ k: 'rel', op: '=', a: [pe, ZERO] }, v4, { env: e }); return { k: 'list', a: polyRoots(pp).map(function (z) { return N(vNorm(z)); }) }; }
        case 'limit': {
          var lf = simp(a[0]), v5 = a[1] && a[1].k === 'rel' ? a[1].a[0].name : varOf(a[1], mainVar(lf)), pt = a[1] && a[1].k === 'rel' ? simp(a[1].a[1]) : simp(a[2] || ZERO);
          return limitNode(lf, v5, num(evalNum(pt)), e);
        }
        case 'taylor': {
          var tf = simp(a[0]), v6 = varOf(a[1], mainVar(tf)), c0 = a[2] ? simp(a[2]) : ZERO, ord = a[3] ? Number(simp(a[3]).v.n) : 5, terms = [], dcur = tf, fact = q(1);
          if (a[1] && a[1].k === 'rel') { v6 = a[1].a[0].name; c0 = simp(a[1].a[1]); ord = a[2] ? Number(simp(a[2]).v.n) : 5; }
          for (var k = 0; k <= ord; k++) { if (k) { dcur = deriv(dcur, v6); fact = fact.mul(q(k)); } var coef = simp(div(subst(dcur, v6, c0), N(fact))); if (!isZero(coef)) terms.push(simp(Mul([coef, Pow(sub(S(v6), c0), N(q(k)))]))); }
          return terms.length ? simp(Add(terms)) : ZERO;
        }
        case 'sum': case 'product': {
          var body = a[0], v7 = varOf(a[1], 'k'), lo2 = simp(a[2]), hi2 = simp(a[3]);
          if (!isQ(lo2) || !isQ(hi2)) throw new Error('The limits of a sum must be whole numbers');
          var from = Number(lo2.v.n), to = Number(hi2.v.n); if (to - from > 100000) throw new Error('That\'s too many terms');
          if (to - from > 200) { var fb = compile(simp(body), [v7], e), tot = n === 'sum' ? 0 : 1; for (var i3 = from; i3 <= to; i3++) tot = n === 'sum' ? tot + fb(i3) : tot * fb(i3); return N(tot); }
          var acc = [];
          for (var i2 = from; i2 <= to; i2++) acc.push(subst(body, v7, N(q(i2))));
          return simp(n === 'sum' ? Add(acc.length ? acc : [ZERO]) : Mul(acc.length ? acc : [ONE]));
        }
        case 'seq': case 'range': {
          if (n === 'range' || a.length <= 3 && a[0].k === 'n') { var A1 = num(evalNum(simp(a[0]))), B1 = num(evalNum(simp(a[1]))), st = a[2] ? num(evalNum(simp(a[2]))) : 1, L = []; for (var t2 = A1; st > 0 ? t2 <= B1 + 1e-12 : t2 >= B1 - 1e-12; t2 += st) { L.push(N(floatToQ(t2, 1e6) || t2)); if (L.length > 10000) break; } return { k: 'list', a: L }; }
          var b3 = a[0], v8 = varOf(a[1], 'k'), f3 = Number(simp(a[2]).v.n), t3 = Number(simp(a[3]).v.n), s3 = a[4] ? Number(simp(a[4]).v.n) : 1, L2 = [];
          for (var j2 = f3; j2 <= t3; j2 += s3) L2.push(subst(b3, v8, N(q(j2)))); return { k: 'list', a: L2 };
        }
        case 'det': { var M = simp(a[0]); if (M.k !== 'mat') throw new Error('det needs a matrix, like [[1,2],[3,4]]'); return matDet(M); }
        case 'inv': { var M2 = simp(a[0]); if (M2.k !== 'mat') return simpPow(M2, MONE); return matInv(M2); }
        case 'transpose': return matT(simp(a[0]));
        case 'rref': return matRref(simp(a[0]));
        case 'identity': return identity(Number(simp(a[0]).v.n));
        case 'trace': { var M3 = simp(a[0]); return simp(Add(M3.a.map(function (r, i) { return r[i]; }))); }
        case 'size': { var M4 = simp(a[0]); return M4.k === 'mat' ? { k: 'tuple', a: [N(q(M4.a.length)), N(q(M4.a[0].length))] } : N(q(M4.a ? M4.a.length : 1)); }
        case 'eigenvalues': { var M5 = simp(a[0]); var lam = S('λ'); var ch = matDet({ k: 'mat', a: M5.a.map(function (r, i) { return r.map(function (y, j) { return i === j ? sub(y, lam) : y; }); }) }); return solve({ k: 'rel', op: '=', a: [ch, ZERO] }, 'λ', { env: e }); }
        case 'dot': { var u = simp(a[0]), w = simp(a[1]); return simp(Add(u.a.map(function (y, i) { return Mul([y, w.a[i]]); }))); }
        case 'cross': { var u2 = simp(a[0]).a, w2 = simp(a[1]).a; return { k: 'list', a: [simp(sub(Mul([u2[1], w2[2]]), Mul([u2[2], w2[1]]))), simp(sub(Mul([u2[2], w2[0]]), Mul([u2[0], w2[2]]))), simp(sub(Mul([u2[0], w2[1]]), Mul([u2[1], w2[0]])))] }; }
        case 'norm': { var u3 = simp(a[0]); return simpPow(simp(Add(u3.a.map(function (y) { return Pow(y, TWO); }))), HALF); }
        case 'mean': case 'median': case 'mode': case 'stdev': case 'variance': case 'total': return stats(n, simp(a[0]));
        case 'sort': { var Ls = simp(a[0]); return { k: 'list', a: Ls.a.slice().sort(function (p, r) { return num(evalNum(p)) - num(evalNum(r)); }) }; }
        case 'length': { var Ll = simp(a[0]); return N(q(Ll.a ? Ll.a.length : 1)); }
        case 'linreg': case 'quadreg': case 'expreg': return regress(n, simp(a[0]), simp(a[1]));
        case 'isprime': { var pn = simp(a[0]); if (!isQ(pn) || !pn.v.isInt()) throw new Error('isprime needs a whole number'); var nn = pn.v.n; if (nn < 2n) return { k: 'text', s: 'false' }; for (var d2 = 2n; d2 * d2 <= nn; d2++) { if (nn % d2 === 0n) return { k: 'text', s: 'false (' + d2 + ' × ' + nn / d2 + ')' }; if (d2 > 10000000n) break; } return { k: 'text', s: 'true' }; }
        case 'numer': case 'denom': { var fr = simp(a[0]); if (isQ(fr)) return N(new Q(n === 'numer' ? fr.v.n : fr.v.d, 1n)); var cd = comdenom(fr); return n === 'numer' ? (cd.a ? cd.a[0] : fr) : (cd.a ? cd.a[1].a[0] : ONE); }
        case 'real': case 'imag': case 'conj': case 'arg': { var z = evalNum(simp(a[0]), { __complex: true }); z = cx(z); return N(n === 'real' ? z.re : n === 'imag' ? z.im : n === 'arg' ? trigOut(Cx.arg(z)) : vNorm(new C(z.re, -z.im))); }
        case 'bin': case 'hex': case 'oct': { var bn = simp(a[0]); if (!isQ(bn) || !bn.v.isInt()) throw new Error(n + ' needs a whole number'); return { k: 'text', s: (bn.v.n < 0n ? '−' : '') + (n === 'bin' ? '0b' : n === 'hex' ? '0x' : '0o') + babs(bn.v.n).toString(n === 'bin' ? 2 : n === 'hex' ? 16 : 8).toUpperCase() }; }
        case 'deg': return simp(Mul([a[0], N(q(180)), Pow(S('π'), MONE)]));
        case 'rad': return simp(Mul([a[0], S('π'), N(q(1, 180))]));
        case 'propfrac': { var pf = simp(a[0]); if (isQ(pf) && !pf.v.isInt()) { var w3 = pf.v.n / pf.v.d, rr = pf.v.sub(new Q(w3, 1n)); return { k: 'text', s: w3 + ' + ' + rr.toString() }; } return pf; }
        case 'random': return N(Math.random());
        case 'randint': { var lo3 = Number(simp(a[0]).v.n), hi3 = Number(simp(a[1]).v.n); return N(q(lo3 + Math.floor(Math.random() * (hi3 - lo3 + 1)))); }
      }
    }
    if (x.k === 'regress') { var X = simp(x.a[0]), Y = simp(x.a[1]); return regress('linreg', X, Y); }
    if (x.k === 'rel') { var l = simp(x.a[0]), r = simp(x.a[1]); if (!hasAnyVar(l) && !hasAnyVar(r)) { var lv = num(evalNum(l)), rv = num(evalNum(r)); var ok = { '=': Math.abs(lv - rv) < 1e-12 * Math.max(1, Math.abs(lv)), '<': lv < rv, '>': lv > rv, '<=': lv <= rv, '>=': lv >= rv, '!=': lv !== rv }[x.op]; return { k: 'text', s: ok ? 'true' : 'false' }; } return solve({ k: 'rel', op: x.op, a: [l, r] }, mainVar(sub(l, r)), { env: ctx.env() }); }
    return simplifyFull(x);
  }
  function hasNonFinite() { for (var i = 0; i < arguments.length; i++) { var v = evalNum(arguments[i]); if (typeof v !== 'number' || !isFinite(v)) return true; } return false; }
  function pGcd(a, b) { while (b.length > 1 || !b[0].isZero()) { var r = pDivmod(a, b)[1]; a = b; b = r; if (b.every(function (c) { return c.isZero(); })) break; } var lead = a[a.length - 1]; return a.map(function (c) { return c.div(lead); }); }
  function cancel(x) {
    var v = mainVar(x), c = x.k === '+' ? comdenom(x) : x, fs = c.k === '*' ? c.a : [c], nf = [], df = [];
    fs.forEach(function (f) { if (f.k === '^' && isNum(f.a[1]) && num(f.a[1].v) < 0) df.push(simpPow(f.a[0], N(f.a[1].v instanceof Q ? f.a[1].v.neg() : -f.a[1].v))); else nf.push(f); });
    if (!df.length) return x;
    var P = toPoly(Mul(nf.length ? nf : [ONE]), v), D2 = toPoly(Mul(df), v); if (!P || !D2 || D2.length < 2) return x;
    var g = pGcd(P, D2); if (g.length < 2) return x;
    P = pDivmod(P, g)[0]; D2 = pDivmod(D2, g)[0];
    if (D2.length === 1) return simp(div(polyNode(P, v), N(D2[0])));
    var pn = P.length > 2 ? factorPoly(P, v) : polyNode(P, v);
    return { k: '*', a: [pn, Pow(D2.length > 2 ? factorPoly(D2, v) : polyNode(D2, v), MONE)], keep: true };
  }
  function simplifyFull(x) {
    var s = simp(x); if (s.k === 'list' || s.k === 'mat' || s.k === 'tuple' || s.k === 'text') return s;
    if (!hasAnyVar(s) && hasVar(s, 'i')) { var z = evalNum(s); if (z instanceof C || typeof z === 'number') { z = cx(z); var rq = floatToQ(z.re, 10000), iq = floatToQ(z.im, 10000); if (rq && iq && Math.abs(rq.toNum() - z.re) < 1e-12 && Math.abs(iq.toNum() - z.im) < 1e-12) return simpAdd([N(rq), simpMul([N(iq), S('i')])]); } }
    try { var cn = cancel(s); if (cn !== s) return cn; } catch (er) { }
    // try expanded form; keep whichever is shorter
    try { var e = expand(s); if (show(e).length < show(s).length) s = e; } catch (er) { }
    return s;
  }
  function limitNode(f, v, a, env) {
    var fn = compile(f, [v], env);
    function at(x) { var y = fn(x); return typeof y === 'number' ? y : NaN; }
    if (!isFinite(a)) { var big = a > 0 ? 1 : -1, vals = [1e3, 1e5, 1e7, 1e8].map(function (h) { return at(big * h); }); var last = vals[3], prev = vals[2]; if (Math.abs(last) < 1e-7) return ZERO; if (Math.abs(last) > 1e12 && Math.abs(last) > Math.abs(prev)) return S(last > 0 ? '∞' : '−∞'); return roundNice(last); }
    var hs = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7], L = hs.map(function (h) { return at(a - h); }), R = hs.map(function (h) { return at(a + h); });
    var l = L[4], r = R[4];
    if (Math.abs(l) > 1e6 && Math.abs(r) > 1e6) { if (l > 0 && r > 0) return S('∞'); if (l < 0 && r < 0) return { k: 'text', s: '−∞' }; return { k: 'text', s: 'does not exist (left → ' + (l > 0 ? '∞' : '−∞') + ', right → ' + (r > 0 ? '∞' : '−∞') + ')' }; }
    if (Math.abs(l - r) > 1e-4 * Math.max(1, Math.abs(l))) return { k: 'text', s: 'does not exist (left ' + fmtNum(l, 6) + ', right ' + fmtNum(r, 6) + ')' };
    return roundNice((l + r) / 2);
  }
  function roundNice(x) { if (!isFinite(x)) return N(x); var r = floatToQ(x, 1000); if (r && Math.abs(r.toNum() - x) < 1e-10 * Math.max(1, Math.abs(x))) return N(r); var consts = [[PI, 'π'], [Math.E, 'e'], [Math.SQRT2, '√2'], [Math.sqrt(3), '√3']]; for (var i = 0; i < consts.length; i++) { var k = floatToQ(x / consts[i][0], 100); if (k && Math.abs(k.toNum() * consts[i][0] - x) < 1e-7) return simp(Mul([N(k), consts[i][1] === '√2' ? simpPow(TWO, HALF) : consts[i][1] === '√3' ? simpPow(N(q(3)), HALF) : S(consts[i][1])])); } r = floatToQ(x, 1000); if (r && Math.abs(r.toNum() - x) < 1e-8 * Math.max(1, Math.abs(x))) return N(r); return N(Number(x.toPrecision(10))); }

  var API = { evaluate: evaluate, roundNice: roundNice, parse: parse, run: run, Ctx: Ctx, simp: simp, show: show, evalNum: evalNum, compile: compile, deriv: deriv, integ: integ, numIntegrate: numIntegrate, numRoots: numRoots, solve: solve,
    expand: expand, factor: factor, toPoly: toPoly, freeVars: freeVars, hasVar: hasVar, substAll: substAll, fmtNum: fmtNum, STATE: STATE, Q: Q, C: C, key: key, regress: regress, lsq: lsq, isNum: isNum, num: num, FUNCS: FUNCS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.CAS = API;
})(typeof window !== 'undefined' ? window : this);
