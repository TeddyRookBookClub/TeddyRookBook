/* Math Ladder core: the generator registry, seeded random numbers, exact rationals and TeX helpers.
   Browser: window.MathLadder (ML).  Node: module.exports = ML (set global.window = global first if a file uses window.MathLadder).

   REGISTRY
   ML.gen(id, fn)                 register a generator: fn(R, ctx) -> { q, a, steps, hint?, viz?, choices?, unit? }
   ML.genIds() / ML.hasGen(id)    the registered topic ids / whether one exists
   ML.makeProblem(id, seed, ctx)  run a generator with ML.rand(id + seed); ctx = { level: 1|2|3, mode }; validates the problem
                                  (throws a clear Error if it is malformed), shuffles mc choices unless a.keep (also inside multi
                                  parts) and adds { id, seed, level }. Same id + seed + level -> same problem.
   ML.validateProblem(p)          a list of problems with a problem object ([] when fine)
   ML.loadCourse(key)             browser: load static/math/gen/<key>.js once; Promise -> true (loaded) or false (missing)
   ML.byLevel(ctx, a, b, c)       a at level 1, b at level 2, c at level 3 (b and c default to the one before)

   RANDOM  R = ML.rand(seed)      (seed: number or string; mulberry32, fully reproducible)
   R.seed  R.next() -> [0, 1)
   R.int(lo, hi)                  integer in [lo, hi]           R.nz(lo, hi)        integer in [lo, hi], never 0
   R.intNot(lo, hi, not)          integer in [lo, hi] avoiding a number or an array of numbers
   R.ints(n, lo, hi, distinct)    n integers (distinct if true)
   R.pick(arr)  R.pickW(arr, w)   one item (weighted by w)      R.sign()            1 or -1
   R.shuffle(arr)                 a shuffled copy               R.sample(arr, k)    k different items, in random order
   R.coin()                       true or false                 R.chance(p)         true with probability p
   R.real(lo, hi, dp)             a number in [lo, hi] rounded to dp decimals (default 1), no float noise
   R.frac(maxD, opts)             a random proper fraction ML.Q (opts: { min: 2 (smallest denominator), improper, neg })

   TEX HELPERS  ML.T  (all return math-mode TeX with correct signs: "-3", never "+ -3", "1x" or "-1x")
   Numbers may be JS numbers, BigInts, ML.Q values or numeric strings ("3/4", "-2.5"). "-" is printed as a real minus by tex.js.
   T.num(x)                       exact number: 0.1 + 0.2 -> "0.3"; a fraction ML.Q -> \frac; -0 -> "0"
   T.commas(x)                    with thousands commas: 12345.5 -> "12,345.5" (fine in text and in math)
   T.dec(x, dp)                   fixed decimals: dec(2.5, 2) -> "2.50"
   T.frac(n, d)                   reduced fraction, sign in front: frac(6, -8) -> "-\frac{3}{4}"; frac(8, 4) -> "2"
   T.dfrac(n, d)                  the same with \dfrac (full size in inline math)
   T.mixed(n, d)                  mixed number: mixed(7, 2) -> "3\frac{1}{2}", mixed(-7, 2) -> "-3\frac{1}{2}", mixed(1, 2) -> "\frac{1}{2}"
   T.p(x)                         a number ready to multiply into: p(-3) -> "(-3)", p(3) -> "3" (also takes TeX strings)
   T.signed(x)                    for chaining: " + 3", " - 3", " + \frac{1}{2}"; signed(0) -> "" (the term is dropped)
   T.coef(a, v, first)            coefficient times v: (3,'x') "3x", (-1,'x') "-x", (1,'x',false) " + x", (-2,'x',false) " - 2x",
                                  (0, …) ""; v may be '' for a constant term; first defaults to true
   T.mono(a, v)                   one term: "3x", "-x", "x", "\frac{1}{2}x"; mono(0, 'x') -> "0"
   T.lin(a, v, b)                 "ax + b": lin(3,'x',-2) "3x - 2", lin(-1,'x',0) "-x", lin(0,'x',5) "5"
   T.poly(coeffs, v)              high -> low, zero terms skipped: poly([1,-3,0,2],'x') "x^{3} - 3x^{2} + 2"; all zero -> "0"
   T.terms([[c, 'x^{2}'], [c2, 'xy'], [c3, '']])   any sum of terms with correct signs ("2x - 3y + 1"); c may be a TeX string
   T.pow(b, e)                    "x^{2}", "(-3)^{2}", "\left(\frac{1}{2}\right)^{3}"; pow(b, 1) -> b
   T.sqrt(n, k)                   simplified k·√n: sqrt(12) "2\sqrt{3}", sqrt(16) "4", sqrt(8, -3) "-6\sqrt{2}"
   T.root(n, idx)                 "\sqrt[3]{n}" (idx 2 -> \sqrt{n}; no simplification)
   T.money(x)                     "\$1.25", "\$5", "\$1,250", "-\$3.50" (works in text and in math)
   T.pct(x)                       "25\%" (works in text and in math)
   T.deg(x)                       "30^\circ"
   T.sci(x, sig)                  scientific notation: sci(32000) "3.2 \times 10^{4}"
   T.times()  T.cdot()  T.div()   " \times ", " \cdot ", " \div "
   T.pm(a, b)                     "a \pm b"
   T.vec(arr)                     "\langle 1, -2, 3 \rangle"       T.pt(arr)    "(1, -2)"       T.col(arr)  a column vector (bmatrix)
   T.mat(rows, env)               matrix, env 'bmatrix' (default), 'pmatrix' or 'vmatrix' (determinant bars)
   T.aug(rows, k)                 augmented matrix: a bar before the last k columns (default 1)
   T.set(arr)                     "\{1, 2, 3\}"; empty -> "\varnothing"
   T.interval(a, b, openA, openB) "(-\infty, 3]"; ±Infinity (or '-inf'/'inf') always gets a parenthesis
   T.abs(s)                       "\left|s\right|"
   T.paren(s)                     "\left(s\right)"
   T.eq(l, r)                     "l = r"
   T.plain(s)                     a CAS-syntax string ("2*sqrt(3)/x^2") as TeX (needs tex.js)
   Every helper accepts TeX strings where a "number" is a ready-made term, e.g. T.coef('\frac{1}{2}', 'x').

   EXACT RATIONALS  ML.Q(n, d) or ML.Q.from(x)   (BigInt inside; immutable)
   q.add(o) q.sub(o) q.mul(o) q.div(o) q.neg() q.abs() q.inv() q.pow(k)   (o may be a number, string or Q)
   q.eq(o) q.lt(o) q.gt(o) q.le(o) q.ge(o) q.cmp(o) q.sign() q.isInt() q.isZero()
   q.n q.d (BigInt)  q.num() q.den() (JS numbers)  q.toNumber()  q.floor()  q.toTex() ("-\frac{3}{4}")  q.toMixedTex()
   q.toPlain() ("-3/4", for answer specs)  q.toString()  q.toDec(dp) (string, rounded)  q.isTerminating()
   ML.Q.from(x): number (exact for decimals: 0.1 -> 1/10), "3/4", "-2.5", "1e3", BigInt or Q.   ML.Q.min(a, b), ML.Q.max(a, b)

   UTILITIES  ML.util
   gcd(a, b, …)  lcm(a, b, …)  isPrime(n)  primeFactors(n) ([2, 2, 3])  factorPairs(n) ([[1,12],[2,6],[3,4]])  factors(n) (divisors)
   simplifyRadical(n) -> [outside, inside] (12 -> [2, 3])   isSquare(n)   isCube(n)   reduce(n, d) -> [n, d] (d > 0)
   round(x, dp) (no float noise)   fix(x) (removes float noise)   digits(n) ([1, 2, 3])   digitSum(n)   range(a, b, step)
   factorial(n)  nCr(n, k)  nPr(n, k)   uniq(arr) (by string value)   sum(arr)   mean(arr)   median(arr)   mode(arr)
   words(n) ("one hundred twenty-three")   ordinal(n) ("1st")   plural(n, word, plurals)   list(arr) ("a, b and c")
   mc(correct, wrongs, k)         an mc answer spec: correct first plus up to k-1 different wrongs; makeProblem shuffles it
   shuffleWithout(R, arr)         a shuffled copy where no item stays at its index (a derangement; for matching)
   M.mul(A, B)  M.det(A)  M.T(A)  M.inv(A)  M.rref(A)  M.add(A, B)  M.scale(k, A)   exact matrix math on numbers or Q (det -> Q)
   M.plain(A)                     a matrix as CAS strings, for { t: 'matrix', v: … }                                        */
(function (root) {
  'use strict';
  var ML = root.MathLadder = root.MathLadder || {};

  // ================= exact rationals =================
  function babs(a) { return a < 0n ? -a : a; }
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function toBig(x) {
    if (typeof x === 'bigint') return x;
    if (typeof x === 'number') { if (!Number.isInteger(x)) throw new Error('Q: not an integer: ' + x); return BigInt(x); }
    if (typeof x === 'string' && /^[-+]?\d+$/.test(x.trim())) return BigInt(x.trim());
    throw new Error('Q: not an integer: ' + x);
  }
  function Q(n, d) {
    if (!(this instanceof Q)) {
      if (n instanceof Q && d === undefined) return n;
      if ((typeof n === 'number' && !Number.isInteger(n)) || (typeof n === 'string' && !/^[-+]?\d+$/.test(n.trim())) || n instanceof Q) {
        var a = Q.from(n); return d === undefined ? a : a.div(Q.from(d));
      }
      if (d !== undefined && ((typeof d === 'number' && !Number.isInteger(d)) || d instanceof Q || (typeof d === 'string' && !/^[-+]?\d+$/.test(d.trim())))) return Q.from(n).div(Q.from(d));
      return new Q(n, d);
    }
    var N = toBig(n), D = d === undefined ? 1n : toBig(d);
    if (D === 0n) throw new Error('Q: division by zero');
    if (D < 0n) { N = -N; D = -D; }
    var g = bgcd(N, D) || 1n;
    this.n = N / g; this.d = D / g;
    if (Object.freeze) Object.freeze(this);
  }
  Q.from = function (x) {
    if (x instanceof Q) return x;
    if (typeof x === 'bigint') return new Q(x, 1n);
    if (typeof x === 'number') {
      if (!isFinite(x)) throw new Error('Q.from: not finite: ' + x);
      if (Number.isInteger(x)) return new Q(BigInt(x), 1n);
      return Q.from(numStr(x));
    }
    if (typeof x === 'string') {
      var s = x.trim().replace(/−/g, '-').replace(/\s+/g, '');
      var m = /^([-+]?)(\d+)\/(\d+)$/.exec(s);
      if (m) return new Q(BigInt(m[2]) * (m[1] === '-' ? -1n : 1n), BigInt(m[3]));
      m = /^([-+]?)(\d*)(?:\.(\d*))?(?:[eE]([-+]?\d+))?$/.exec(s);
      if (m && (m[2] || m[3])) {
        var ip = m[2] || '0', fp = m[3] || '', ex = parseInt(m[4] || '0', 10);
        var n = BigInt(ip + fp), d = 10n ** BigInt(fp.length);
        if (ex > 0) n *= 10n ** BigInt(ex); else if (ex < 0) d *= 10n ** BigInt(-ex);
        return new Q(m[1] === '-' ? -n : n, d);
      }
      throw new Error('Q.from: cannot read "' + x + '"');
    }
    throw new Error('Q.from: cannot read ' + x);
  };
  function qq(x) { return x instanceof Q ? x : Q.from(x); }
  Q.prototype.add = function (o) { o = qq(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); };
  Q.prototype.sub = function (o) { o = qq(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); };
  Q.prototype.mul = function (o) { o = qq(o); return new Q(this.n * o.n, this.d * o.d); };
  Q.prototype.div = function (o) { o = qq(o); if (o.n === 0n) throw new Error('Q: division by zero'); return new Q(this.n * o.d, this.d * o.n); };
  Q.prototype.neg = function () { return new Q(-this.n, this.d); };
  Q.prototype.abs = function () { return this.n < 0n ? this.neg() : this; };
  Q.prototype.inv = function () { return new Q(this.d, this.n); };
  Q.prototype.pow = function (k) {
    k = Number(k); if (!Number.isInteger(k)) throw new Error('Q.pow: integer exponents only');
    if (k === 0) return new Q(1n, 1n);
    var r = new Q(this.n ** BigInt(Math.abs(k)), this.d ** BigInt(Math.abs(k)));
    return k < 0 ? r.inv() : r;
  };
  Q.prototype.cmp = function (o) { o = qq(o); var a = this.n * o.d, b = o.n * this.d; return a < b ? -1 : a > b ? 1 : 0; };
  Q.prototype.eq = function (o) { return this.cmp(o) === 0; };
  Q.prototype.lt = function (o) { return this.cmp(o) < 0; };
  Q.prototype.gt = function (o) { return this.cmp(o) > 0; };
  Q.prototype.le = function (o) { return this.cmp(o) <= 0; };
  Q.prototype.ge = function (o) { return this.cmp(o) >= 0; };
  Q.prototype.sign = function () { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; };
  Q.prototype.isInt = function () { return this.d === 1n; };
  Q.prototype.isZero = function () { return this.n === 0n; };
  Q.prototype.num = function () { return Number(this.n); };
  Q.prototype.den = function () { return Number(this.d); };
  Q.prototype.toNumber = function () { return Number(this.n) / Number(this.d); };
  Q.prototype.floor = function () { var f = this.n / this.d; if (this.n < 0n && this.n % this.d !== 0n) f -= 1n; return new Q(f, 1n); };
  Q.prototype.toString = function () { return this.d === 1n ? this.n.toString() : this.n + '/' + this.d; };
  Q.prototype.toPlain = Q.prototype.toString;
  Q.prototype.toTex = function () {
    if (this.d === 1n) return this.n.toString();
    return (this.n < 0n ? '-' : '') + '\\frac{' + babs(this.n) + '}{' + this.d + '}';
  };
  Q.prototype.toMixedTex = function () {
    if (this.d === 1n) return this.n.toString();
    var a = babs(this.n), w = a / this.d, r = a % this.d, s = this.n < 0n ? '-' : '';
    return s + (w ? w.toString() : '') + '\\frac{' + r + '}{' + this.d + '}';
  };
  Q.prototype.isTerminating = function () { var d = this.d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n; return d === 1n; };
  Q.prototype.toDec = function (dp) { // exact rounding (half away from zero) to dp places, as a string
    dp = dp === undefined ? 10 : dp;
    var sc = 10n ** BigInt(dp), a = babs(this.n) * sc * 2n + this.d, r = a / (2n * this.d); // round half up on |x|
    var s = r.toString(); if (dp > 0) { while (s.length <= dp) s = '0' + s; s = s.slice(0, s.length - dp) + '.' + s.slice(s.length - dp); }
    if (this.n < 0n && /[1-9]/.test(s)) s = '-' + s;
    return s;
  };
  Q.min = function (a, b) { a = qq(a); b = qq(b); return a.le(b) ? a : b; };
  Q.max = function (a, b) { a = qq(a); b = qq(b); return a.ge(b) ? a : b; };
  ML.Q = Q;

  // ================= numbers to strings without float noise =================
  function numStr(x) { // shortest exact-looking decimal for a float: 0.1+0.2 -> "0.3"
    if (typeof x === 'bigint') return x.toString();
    if (x instanceof Q) return x.isTerminating() ? stripZeros(x.toDec(20)) : x.toString();
    if (typeof x === 'string') return x;
    if (!isFinite(x)) return x > 0 ? 'Infinity' : x < 0 ? '-Infinity' : 'NaN';
    if (Object.is(x, -0) || x === 0) return '0';
    if (Number.isInteger(x) && Math.abs(x) < 1e21) return String(x);
    var s = String(Number(x.toPrecision(12)));
    if (/e/.test(s)) s = stripZeros(Q.from(s).toDec(40)); // expand exponent form exactly
    return s;
  }
  function stripZeros(s) { return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
  function fix(x) { return typeof x === 'number' && isFinite(x) ? Number(x.toPrecision(12)) + 0 : x; }
  function round(x, dp) { dp = dp || 0; var s = Q.from(fix(x)).toDec(dp); return Number(s) + 0; }

  // ================= seeded random numbers =================
  function hashStr(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function rand(seed) {
    var st = typeof seed === 'number' && isFinite(seed) ? (Math.floor(seed) ^ 0x9e3779b9) >>> 0 : hashStr(String(seed));
    if (!st) st = 0x6d2b79f5;
    function next() { st = (st + 0x6d2b79f5) >>> 0; var t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    for (var w = 0; w < 4; w++) next();
    var R = { seed: seed, next: next };
    R.int = function (lo, hi) { lo = Math.ceil(lo); hi = Math.floor(hi); if (hi < lo) { var t = lo; lo = hi; hi = t; } return lo + Math.floor(next() * (hi - lo + 1)); };
    R.intNot = function (lo, hi, not) {
      var bad = Array.isArray(not) ? not : [not], ok = [];
      for (var i = Math.ceil(Math.min(lo, hi)); i <= Math.floor(Math.max(lo, hi)); i++) if (bad.indexOf(i) < 0) ok.push(i);
      if (!ok.length) throw new Error('R.intNot: nothing left in [' + lo + ', ' + hi + ']');
      return ok[Math.floor(next() * ok.length)];
    };
    R.nz = function (lo, hi) { return R.intNot(lo, hi, 0); };
    R.ints = function (n, lo, hi, distinct) {
      if (distinct) { var pool = []; for (var i = Math.ceil(lo); i <= hi; i++) pool.push(i); if (pool.length < n) throw new Error('R.ints: not enough distinct values'); return R.sample(pool, n); }
      var out = []; for (var j = 0; j < n; j++) out.push(R.int(lo, hi)); return out;
    };
    R.pick = function (arr) { if (!arr || !arr.length) throw new Error('R.pick: empty array'); return arr[Math.floor(next() * arr.length)]; };
    R.pickW = function (arr, w) { var tot = 0, i; for (i = 0; i < arr.length; i++) tot += w[i] || 0; var r = next() * tot; for (i = 0; i < arr.length; i++) { r -= w[i] || 0; if (r < 0) return arr[i]; } return arr[arr.length - 1]; };
    R.shuffle = function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    R.sample = function (arr, k) { if (k > arr.length) throw new Error('R.sample: k > length'); return R.shuffle(arr).slice(0, k); };
    R.coin = function () { return next() < 0.5; };
    R.chance = function (p) { return next() < p; };
    R.sign = function () { return next() < 0.5 ? -1 : 1; };
    R.real = function (lo, hi, dp) { dp = dp === undefined ? 1 : dp; var k = Math.pow(10, dp); return fix(R.int(Math.ceil(lo * k), Math.floor(hi * k)) / k); };
    R.frac = function (maxD, o) {
      o = o || {}; var d = R.int(o.min || 2, maxD || 12), n = o.improper ? R.int(1, 3 * d) : R.int(1, d - 1);
      var f = new Q(n, d);
      return o.neg && R.coin() ? f.neg() : f;
    };
    return R;
  }
  ML.rand = rand;

  // ================= TeX helpers =================
  function isTexStr(x) { return typeof x === 'string' && !/^\s*[-+]?(\d+\.?\d*|\.\d+)(\/\d+)?\s*$/.test(x); }
  function toQ(x) { // number-like -> Q, or null for TeX strings
    if (x instanceof Q) return x;
    if (typeof x === 'bigint') return new Q(x, 1n);
    if (typeof x === 'number') { if (!isFinite(x)) throw new Error('T: not a finite number: ' + x); return Q.from(fix(x)); }
    if (typeof x === 'string' && !isTexStr(x)) return Q.from(x);
    return null;
  }
  function neg(s) { s = String(s); return s[0] === '-' ? s.slice(1) : s; }
  function texNum(x) { // decimals stay decimals; Q fractions become \frac
    if (x instanceof Q) return x.toTex();
    if (typeof x === 'string') { if (isTexStr(x)) return x; var t = x.trim(); if (/\//.test(t)) return Q.from(t).toTex(); return t.replace(/^\+/, ''); }
    if (typeof x === 'bigint') return x.toString();
    if (typeof x === 'number' && !isFinite(x)) throw new Error('T.num: not a finite number: ' + x);
    return numStr(fix(x));
  }
  function signOf(x) { // -1, 0, 1 for number-likes; TeX strings: leading '-' -> -1
    var q = toQ(x); if (q) return q.sign();
    var s = String(x).trim(); return s === '' || s === '0' ? 0 : s[0] === '-' ? -1 : 1;
  }
  function isOneLike(x) { var q = toQ(x); return q ? q.abs().eq(1) : false; }
  function absTex(x) { // |x| as TeX; decimals stay decimals
    if (typeof x === 'number') return numStr(Math.abs(fix(x)));
    if (typeof x === 'bigint') return (x < 0n ? -x : x).toString();
    if (x instanceof Q) return x.abs().toTex();
    var s = String(x).trim(); if (!isTexStr(s) && /\//.test(s)) return Q.from(s).abs().toTex();
    return neg(s.replace(/^\+/, ''));
  }
  function simpleBase(s) { // can take an exponent without parentheses
    return /^(\d+(\.\d+)?|[a-zA-Z]|\\[a-zA-Z]+|[a-zA-Z]_\{?[a-zA-Z0-9]+\}?|\\[a-zA-Z]+_\{?[a-zA-Z0-9]+\}?|\(.*\)|\\left\(.*\\right\)|\{.*\})$/.test(s) && !/^\\(frac|dfrac|sqrt)/.test(s);
  }

  var T = {};
  T.num = function (x) { return texNum(x); };
  T.commas = function (x) {
    var s = texNum(x); if (/\\/.test(s)) return s;
    var m = /^(-?)(\d+)(\.\d+)?$/.exec(s); if (!m) return s;
    return m[1] + m[2].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (m[3] || '');
  };
  T.dec = function (x, dp) { return Q.from(typeof x === 'number' ? fix(x) : x).toDec(dp === undefined ? 2 : dp); };
  T.frac = function (n, d) {
    if (d === undefined) d = 1;
    var qn = toQ(n), qd = toQ(d);
    if (qn && qd) { if (qd.isZero()) throw new Error('T.frac: denominator 0'); return qn.div(qd).toTex(); }
    var sn = qn ? qn.toTex() : String(n), sd = qd ? qd.toTex() : String(d), s = 1;
    if (sn[0] === '-') { s = -s; sn = sn.slice(1); } if (sd[0] === '-') { s = -s; sd = sd.slice(1); }
    if (sd === '1') return (s < 0 ? '-' : '') + sn;
    return (s < 0 ? '-' : '') + '\\frac{' + sn + '}{' + sd + '}';
  };
  T.dfrac = function (n, d) { return T.frac(n, d).replace('\\frac', '\\dfrac'); };
  T.mixed = function (n, d) { var q = d === undefined ? toQ(n) : toQ(n).div(toQ(d)); return q.toMixedTex(); };
  T.p = function (x) { var s = texNum(x); return /^-/.test(s) ? (/\\frac/.test(s) ? '\\left(' + s + '\\right)' : '(' + s + ')') : s; };
  T.signed = function (x) {
    var sg = signOf(x); if (sg === 0) return '';
    return (sg < 0 ? ' - ' : ' + ') + absTex(x);
  };
  T.coef = function (a, v, first) {
    if (first === undefined) first = true; v = v === undefined || v === null ? '' : String(v);
    var sg = signOf(a); if (sg === 0) return '';
    var mag = v && isOneLike(a) ? '' : absTex(a);
    if (v && mag && /^\d/.test(v)) mag += ' \\cdot ';
    var body = mag + v;
    if (first) return (sg < 0 ? '-' : '') + body;
    return (sg < 0 ? ' - ' : ' + ') + body;
  };
  T.mono = function (a, v) { return signOf(a) === 0 ? '0' : T.coef(a, v, true); };
  T.lin = function (a, v, b) { var s = T.coef(a, v, true); s = s ? s + T.signed(b) : texNum(b === undefined ? 0 : b); return s; };
  T.terms = function (list) {
    var s = '';
    list.forEach(function (t) { var piece = T.coef(t[0], t[1], s === ''); s += piece; });
    return s || '0';
  };
  T.poly = function (coeffs, v) {
    v = v || 'x'; var n = coeffs.length - 1, list = [];
    coeffs.forEach(function (c, i) { var k = n - i; list.push([c, k === 0 ? '' : k === 1 ? v : v + '^{' + k + '}']); });
    return T.terms(list);
  };
  T.pow = function (b, e) {
    var bs = texNum(b), es = texNum(e);
    if (es === '1') return bs;
    if (!simpleBase(bs)) bs = /\\frac|\\sqrt/.test(bs) ? '\\left(' + bs + '\\right)' : '(' + bs + ')';
    return bs + '^{' + es + '}';
  };
  T.sqrt = function (n, k) {
    k = k === undefined ? 1 : k; var nn = Number(n);
    if (!Number.isInteger(nn) || nn < 0) return T.coef(k, '\\sqrt{' + texNum(n) + '}');
    if (nn === 0) return '0';
    var r = util.simplifyRadical(nn), out = toQ(k).mul(r[0]);
    if (r[1] === 1 || out.isZero()) return out.toTex();
    return T.coef(out, '\\sqrt{' + r[1] + '}');
  };
  T.root = function (n, idx) { return idx === 2 || idx === undefined ? '\\sqrt{' + texNum(n) + '}' : '\\sqrt[' + idx + ']{' + texNum(n) + '}'; };
  T.money = function (x) {
    var q = Q.from(typeof x === 'number' ? fix(x) : x), s = q.abs().isInt() ? q.abs().toString() : q.abs().toDec(2);
    var m = /^(\d+)(\.\d+)?$/.exec(s); if (m) s = m[1].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (m[2] || '');
    return (q.sign() < 0 ? '-' : '') + '\\$' + s;
  };
  T.pct = function (x) { return texNum(x) + '\\%'; };
  T.deg = function (x) { return texNum(x) + '^\\circ'; };
  T.sci = function (x, sig) {
    x = Number(x); if (x === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(x))), m = fix(x / Math.pow(10, e));
    if (Math.abs(m) >= 10) { m = fix(m / 10); e += 1; }
    if (sig) m = Number(m.toPrecision(sig));
    return numStr(m) + ' \\times 10^{' + e + '}';
  };
  T.times = function () { return ' \\times '; };
  T.cdot = function () { return ' \\cdot '; };
  T.div = function () { return ' \\div '; };
  T.pm = function (a, b) { return texNum(a) + ' \\pm ' + texNum(b); };
  T.vec = function (arr) { return '\\langle ' + arr.map(texNum).join(', ') + ' \\rangle'; };
  T.pt = function (arr) { var s = arr.map(texNum); return (s.some(function (t) { return /\\frac/.test(t); }) ? '\\left(' + s.join(', ') + '\\right)' : '(' + s.join(', ') + ')'); };
  T.col = function (arr) { return '\\begin{bmatrix} ' + arr.map(texNum).join(' \\\\ ') + ' \\end{bmatrix}'; };
  T.mat = function (rows, env) { env = env || 'bmatrix'; return '\\begin{' + env + '} ' + rows.map(function (r) { return r.map(texNum).join(' & '); }).join(' \\\\ ') + ' \\end{' + env + '}'; };
  T.aug = function (rows, k) {
    k = k || 1; var c = rows[0].length;
    return '\\left[\\begin{array}{' + 'c'.repeat(c - k) + '|' + 'c'.repeat(k) + '} ' + rows.map(function (r) { return r.map(texNum).join(' & '); }).join(' \\\\ ') + ' \\end{array}\\right]';
  };
  T.set = function (arr) { return arr.length ? '\\{' + arr.map(texNum).join(', ') + '\\}' : '\\varnothing'; };
  function endTex(x) {
    if (x === Infinity || x === 'inf' || x === '+inf' || x === 'oo') return '\\infty';
    if (x === -Infinity || x === '-inf' || x === '-oo') return '-\\infty';
    return texNum(x);
  }
  T.interval = function (a, b, openA, openB) {
    var A = endTex(a), B = endTex(b);
    var oa = openA || /infty/.test(A), ob = openB || /infty/.test(B);
    return (oa ? '(' : '[') + A + ', ' + B + (ob ? ')' : ']');
  };
  T.abs = function (s) { return '\\left|' + texNum(s) + '\\right|'; };
  T.paren = function (s) { return '\\left(' + texNum(s) + '\\right)'; };
  T.eq = function (l, r) { return texNum(l) + ' = ' + texNum(r); };
  T.plain = function (s) { if (!ML.plainToTex) throw new Error('T.plain needs tex.js'); return ML.plainToTex(s); };
  ML.T = T;

  // ================= utilities =================
  var util = {};
  util.gcd = function () { var g = 0; for (var i = 0; i < arguments.length; i++) { var a = Math.abs(arguments[i]), b = g; while (a) { var t = b % a; b = a; a = t; } g = b; } return g; };
  util.lcm = function () { var l = 1; for (var i = 0; i < arguments.length; i++) { var a = Math.abs(arguments[i]); if (!a) return 0; l = l / util.gcd(l, a) * a; } return l; };
  util.isPrime = function (n) { n = Number(n); if (!Number.isInteger(n) || n < 2) return false; if (n % 2 === 0) return n === 2; for (var p = 3; p * p <= n; p += 2) if (n % p === 0) return false; return true; };
  util.primeFactors = function (n) { n = Math.abs(n); var out = []; for (var p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
  util.factors = function (n) { n = Math.abs(n); var lo = [], hi = []; for (var i = 1; i * i <= n; i++) if (n % i === 0) { lo.push(i); if (i * i !== n) hi.unshift(n / i); } return lo.concat(hi); };
  util.factorPairs = function (n) { n = Math.abs(n); var out = []; for (var i = 1; i * i <= n; i++) if (n % i === 0) out.push([i, n / i]); return out; };
  util.simplifyRadical = function (n) { n = Math.abs(n); var out = 1, inside = n; for (var f = 2; f * f <= inside; f++) while (inside % (f * f) === 0) { inside /= f * f; out *= f; } return [out, inside]; };
  util.isSquare = function (n) { if (n < 0) return false; var r = Math.round(Math.sqrt(n)); return r * r === n; };
  util.isCube = function (n) { var r = Math.round(Math.cbrt(n)); return r * r * r === n; };
  util.reduce = function (n, d) { var g = util.gcd(n, d) || 1; if (d < 0) g = -g; return [n / g, d / g]; };
  util.round = round;
  util.fix = fix;
  util.numStr = numStr;
  util.digits = function (n) { return String(Math.abs(Math.trunc(n))).split('').map(Number); };
  util.digitSum = function (n) { return util.digits(n).reduce(function (s, d) { return s + d; }, 0); };
  util.range = function (a, b, step) { step = step || 1; var out = []; for (var x = a; step > 0 ? x <= b : x >= b; x = fix(x + step)) out.push(x); return out; };
  util.factorial = function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; };
  util.nCr = function (n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  util.nPr = function (n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 0; i < k; i++) r *= n - i; return r; };
  util.uniq = function (arr) { var seen = {}, out = []; arr.forEach(function (x) { var k = typeof x === 'object' ? JSON.stringify(x) : String(x); if (!seen[k]) { seen[k] = 1; out.push(x); } }); return out; };
  util.sum = function (arr) { return fix(arr.reduce(function (s, x) { return s + x; }, 0)); };
  util.mean = function (arr) { return fix(util.sum(arr) / arr.length); };
  util.median = function (arr) { var a = arr.slice().sort(function (x, y) { return x - y; }), m = a.length >> 1; return a.length % 2 ? a[m] : fix((a[m - 1] + a[m]) / 2); };
  util.mode = function (arr) { var c = {}, best = 0; arr.forEach(function (x) { c[x] = (c[x] || 0) + 1; best = Math.max(best, c[x]); }); return Object.keys(c).filter(function (k) { return c[k] === best; }).map(Number).sort(function (a, b) { return a - b; }); };
  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  util.words = function (n) {
    n = Math.trunc(n); if (n < 0) return 'negative ' + util.words(-n); if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + util.words(n % 100) : '');
    var big = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
    for (var i = 0; i < big.length; i++) if (n >= big[i][0]) { var h = Math.floor(n / big[i][0]), r = n % big[i][0]; return util.words(h) + ' ' + big[i][1] + (r ? ' ' + util.words(r) : ''); }
    return String(n);
  };
  util.ordinal = function (n) { var s = ['th', 'st', 'nd', 'rd'], v = Math.abs(n) % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  util.plural = function (n, word, plural) { return n + ' ' + (Math.abs(n) === 1 ? word : (plural || word + 's')); };
  util.list = function (arr, conj) { conj = conj || 'and'; if (arr.length < 2) return arr.join(''); return arr.slice(0, -1).join(', ') + ' ' + conj + ' ' + arr[arr.length - 1]; };
  util.mc = function (correct, wrongs, k) {
    k = k || 4; var out = [String(correct)];
    (wrongs || []).forEach(function (w) { w = String(w); if (out.length < k && out.indexOf(w) < 0) out.push(w); });
    return { t: 'mc', choices: out, v: 0 };
  };
  util.shuffleWithout = function (R, arr) {
    if (arr.length < 2) return arr.slice();
    for (var t = 0; t < 200; t++) { var idx = R.shuffle(arr.map(function (_, i) { return i; })); if (idx.every(function (j, i) { return j !== i; })) return idx.map(function (j) { return arr[j]; }); }
    return arr.slice(1).concat(arr.slice(0, 1));
  };
  // exact matrix helpers (entries: numbers, numeric strings or Q)
  var M = {};
  function qm(A) { return A.map(function (r) { return r.map(qq); }); }
  M.add = function (A, B) { A = qm(A); B = qm(B); return A.map(function (r, i) { return r.map(function (x, j) { return x.add(B[i][j]); }); }); };
  M.scale = function (k, A) { k = qq(k); return qm(A).map(function (r) { return r.map(function (x) { return x.mul(k); }); }); };
  M.mul = function (A, B) { A = qm(A); B = qm(B); if (A[0].length !== B.length) throw new Error('M.mul: sizes do not match'); return A.map(function (r) { return B[0].map(function (_, j) { return r.reduce(function (s, x, k) { return s.add(x.mul(B[k][j])); }, new Q(0)); }); }); };
  M.T = function (A) { return A[0].map(function (_, j) { return A.map(function (r) { return r[j]; }); }); };
  M.rref = function (A) {
    var R = qm(A).map(function (r) { return r.slice(); }), rows = R.length, cols = R[0].length, lead = 0;
    for (var r = 0; r < rows && lead < cols; r++) {
      var i = r; while (R[i][lead].isZero()) { i++; if (i === rows) { i = r; lead++; if (lead === cols) return R; } }
      var t = R[i]; R[i] = R[r]; R[r] = t;
      var lv = R[r][lead]; R[r] = R[r].map(function (x) { return x.div(lv); });
      for (var k = 0; k < rows; k++) if (k !== r) { var f = R[k][lead]; R[k] = R[k].map(function (x, c) { return x.sub(f.mul(R[r][c])); }); }
      lead++;
    }
    return R;
  };
  M.det = function (A) {
    var R = qm(A).map(function (r) { return r.slice(); }), n = R.length, d = new Q(1);
    if (R.some(function (r) { return r.length !== n; })) throw new Error('M.det: square matrices only');
    for (var c = 0; c < n; c++) {
      var p = c; while (p < n && R[p][c].isZero()) p++;
      if (p === n) return new Q(0);
      if (p !== c) { var t = R[p]; R[p] = R[c]; R[c] = t; d = d.neg(); }
      d = d.mul(R[c][c]);
      for (var r = c + 1; r < n; r++) { var f = R[r][c].div(R[c][c]); if (!f.isZero()) R[r] = R[r].map(function (x, j) { return x.sub(f.mul(R[c][j])); }); }
    }
    return d;
  };
  M.inv = function (A) {
    var n = A.length; if (M.det(A).isZero()) throw new Error('M.inv: singular matrix');
    var aug = qm(A).map(function (r, i) { return r.concat(A.map(function (_, j) { return new Q(i === j ? 1 : 0); })); });
    return M.rref(aug).map(function (r) { return r.slice(n); });
  };
  M.plain = function (A) { return A.map(function (r) { return r.map(function (x) { return qq(x).toPlain(); }); }); };
  util.M = M;
  ML.util = util;
  ML.M = M;

  // ================= registry =================
  var GENS = {}, ORDER = [];
  ML.gen = function (id, fn) {
    if (typeof id !== 'string' || typeof fn !== 'function') throw new Error('ML.gen(id, fn): bad arguments for ' + id);
    if (!GENS[id]) ORDER.push(id);
    GENS[id] = fn;
  };
  ML.genIds = function () { return ORDER.slice(); };
  ML.hasGen = function (id) { return !!GENS[id]; };
  ML.getGen = function (id) { return GENS[id] || null; };
  ML.byLevel = function (ctx, a, b, c) { var l = ctx && ctx.level || 1; if (b === undefined) b = a; if (c === undefined) c = b; return l >= 3 ? c : l === 2 ? b : a; };

  var TYPES = { num: 1, expr: 1, eq: 1, set: 1, tuple: 1, matrix: 1, interval: 1, ineq: 1, mc: 1, tf: 1, text: 1, multi: 1 };
  function validateSpec(a, path, out) {
    if (!a || typeof a !== 'object') { out.push(path + ' is missing'); return; }
    if (!TYPES[a.t]) { out.push(path + '.t is "' + a.t + '" (not an answer type)'); return; }
    function str(x) { return typeof x === 'string' && x.trim() !== ''; }
    switch (a.t) {
      case 'num': case 'expr': case 'eq': case 'ineq': case 'interval':
        if (!str(a.v)) out.push(path + '.v must be a non-empty string (got ' + JSON.stringify(a.v) + ')'); break;
      case 'set':
        if (a.v !== 'all' && !(Array.isArray(a.v) && a.v.every(str))) out.push(path + '.v must be an array of strings or "all"'); break;
      case 'tuple':
        if (!(Array.isArray(a.v) && a.v.length && a.v.every(str))) out.push(path + '.v must be a non-empty array of strings'); break;
      case 'matrix':
        if (!(Array.isArray(a.v) && a.v.length && a.v.every(function (r) { return Array.isArray(r) && r.length === a.v[0].length && r.every(str); }))) out.push(path + '.v must be rows of strings, all the same length'); break;
      case 'mc':
        if (!Array.isArray(a.choices) || a.choices.length < 2) { out.push(path + '.choices needs at least 2 choices'); break; }
        var vs = Array.isArray(a.v) ? a.v : [a.v];
        if (!vs.length || !vs.every(function (i) { return Number.isInteger(i) && i >= 0 && i < a.choices.length; })) out.push(path + '.v must index into choices');
        var seen = {}; a.choices.forEach(function (c) { var k = String(c); if (seen[k]) out.push(path + ' has a repeated choice: ' + k); seen[k] = 1; });
        break;
      case 'tf': if (typeof a.v !== 'boolean') out.push(path + '.v must be true or false'); break;
      case 'text': if (!(Array.isArray(a.v) ? a.v.length && a.v.every(str) : str(a.v))) out.push(path + '.v must be a word or an array of words'); break;
      case 'multi':
        if (!Array.isArray(a.parts) || !a.parts.length) { out.push(path + '.parts must be a non-empty array'); break; }
        a.parts.forEach(function (p, i) { if (!p || typeof p !== 'object') { out.push(path + '.parts[' + i + '] is missing'); return; } if (p.label !== undefined && typeof p.label !== 'string') out.push(path + '.parts[' + i + '].label must be a string'); validateSpec(p.a, path + '.parts[' + i + '].a', out); });
        break;
    }
  }
  ML.validateProblem = function (p) {
    var out = [];
    if (!p || typeof p !== 'object') return ['the generator returned ' + p];
    if (typeof p.q !== 'string' || !p.q.trim()) out.push('q must be a non-empty string');
    if (!Array.isArray(p.steps) || !p.steps.length) out.push('steps must be a non-empty array');
    else p.steps.forEach(function (s, i) { if (typeof s !== 'string' || !s.trim()) out.push('steps[' + i + '] must be a non-empty string'); });
    if (p.hint !== undefined && typeof p.hint !== 'string') out.push('hint must be a string');
    if (p.viz !== undefined && (!p.viz || typeof p.viz.name !== 'string')) out.push('viz must be { name, opts }');
    validateSpec(p.a, 'a', out);
    return out;
  };

  function copy(x) { if (Array.isArray(x)) return x.map(copy); if (x && typeof x === 'object' && !(x instanceof Q)) { var o = {}; for (var k in x) if (Object.prototype.hasOwnProperty.call(x, k)) o[k] = copy(x[k]); return o; } return x; }
  function shuffleMc(a, R) {
    if (!a) return;
    if (a.t === 'multi' && Array.isArray(a.parts)) { a.parts.forEach(function (p) { shuffleMc(p && p.a, R); }); return; }
    if (a.t !== 'mc' || a.keep || !Array.isArray(a.choices)) return;
    var idx = R.shuffle(a.choices.map(function (_, i) { return i; }));
    var inv = []; idx.forEach(function (old, nw) { inv[old] = nw; });
    a.choices = idx.map(function (i) { return a.choices[i]; });
    a.v = Array.isArray(a.v) ? a.v.map(function (i) { return inv[i]; }).sort(function (x, y) { return x - y; }) : inv[a.v];
  }

  ML.makeProblem = function (id, seed, ctx) {
    var fn = GENS[id]; if (!fn) throw new Error('MathLadder: no generator for ' + id);
    ctx = Object.assign({ level: 1, mode: 'learn' }, ctx || {});
    if (seed === undefined || seed === null) seed = Math.floor(Math.random() * 1e9);
    var R = rand(id + '#' + seed + '#' + ctx.level);
    var p = fn(R, ctx);
    if (p && p.a && p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
    var bad = ML.validateProblem(p);
    if (bad.length) throw new Error('MathLadder: generator ' + id + ' (seed ' + seed + ', level ' + ctx.level + '): ' + bad.join('; '));
    p.a = copy(p.a);
    shuffleMc(p.a, rand(id + '#mc#' + seed));
    if (p.a.t === 'mc') p.choices = p.a.choices;
    p.id = id; p.seed = seed; p.level = ctx.level;
    return p;
  };

  // ================= loading course generator files (browser) =================
  var BASE = (function () {
    try { var s = root.document && root.document.currentScript; if (s && s.src) return s.src.replace(/core\/gen\.js(\?.*)?$/, ''); } catch (e) { }
    return '/math/';
  })();
  var LOADS = {};
  if (!ML.loadCourse) ML.loadCourse = function (key) {
    if (LOADS[key]) return LOADS[key];
    LOADS[key] = new Promise(function (res) {
      var d = root.document; if (!d) { res(false); return; }
      var s = d.createElement('script'); s.src = BASE + 'gen/' + key + '.js'; s.async = true;
      s.onload = function () { res(true); }; s.onerror = function () { res(false); };
      d.head.appendChild(s);
    });
    return LOADS[key];
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = ML;
})(typeof window !== 'undefined' ? window : globalThis);
