/* Math Ladder generators: Number Theory (nt). One generator per topic in data/math/topics/nt.json.
   Built from /tmp/work_ug_nt/gen/*.js by build-gen.js; edit the parts there, not this file.
   Every answer is computed from the numbers generated here with exact integer arithmetic (BigInt for powers mod n)
   and checked independently by brute force in the work dir's tests (test/verify.js). Residues are asked for as least
   nonnegative residues, and coefficients in a stated range, so that every answer is unique. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;

  // ---------------------------------------------------------------- exact integer helpers
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function mod(a, n) { var r = a % n; return r < 0 ? r + n : r; }
  function mulmod(a, b, n) { var p = a * b; if (Math.abs(p) <= 9007199254740991) return mod(p, n); var N = BigInt(n); return Number(((BigInt(a) * BigInt(b)) % N + N) % N); }
  function powmod(a, e, n) { if (n === 1) return 0; var N = BigInt(n), A = ((BigInt(a) % N) + N) % N, r = 1n, E = BigInt(e); while (E > 0n) { if (E & 1n) r = r * A % N; A = A * A % N; E >>= 1n; } return Number(r); }
  function egcd(a, b) { var r0 = a, r1 = b, s0 = 1, s1 = 0, t0 = 0, t1 = 1; while (r1) { var q = Math.floor(r0 / r1), t; t = r0 - q * r1; r0 = r1; r1 = t; t = s0 - q * s1; s0 = s1; s1 = t; t = t0 - q * t1; t0 = t1; t1 = t; } return [r0, s0, t0]; } // a·s0 + b·t0 = r0 (a, b ≥ 0)
  function inv(a, n) { var e = egcd(mod(a, n), n); return e[0] === 1 ? mod(e[1], n) : null; }
  function isPrime(n) { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (var d = 3; d * d <= n; d += 2) if (n % d === 0) return false; return true; }
  function primes(lo, hi) { var out = []; for (var p = Math.max(2, lo); p <= hi; p++) if (isPrime(p)) out.push(p); return out; }
  function factor(n) { var out = [], p = 2; while (p * p <= n) { if (n % p === 0) { var k = 0; while (n % p === 0) { n /= p; k++; } out.push([p, k]); } p += p === 2 ? 1 : 2; } if (n > 1) out.push([n, 1]); return out; }
  function spf(n) { for (var p = 2; p * p <= n; p++) if (n % p === 0) return p; return n; } // smallest prime factor
  function phi(n) { var r = n; factor(n).forEach(function (f) { r = r / f[0] * (f[0] - 1); }); return r; }
  function tau(n) { return factor(n).reduce(function (s, f) { return s * (f[1] + 1); }, 1); }
  function sigma(n) { return factor(n).reduce(function (s, f) { return s * (Math.pow(f[0], f[1] + 1) - 1) / (f[0] - 1); }, 1); }
  function ord(a, n) { if (gcd(a, n) !== 1) return 0; var x = mod(a, n), k = 1; while (x !== 1 % n) { x = mulmod(x, a, n); k++; } return k; }
  function divisors(n) { var d = []; for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
  function isqrt(n) { var r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; }
  function isPrimRoot(g, p) { return ord(g, p) === p - 1; }
  function primRoots(p) { var out = []; for (var g = 1; g < p; g++) if (isPrimRoot(g, p)) out.push(g); return out; }
  function legendre(a, p) { var v = powmod(a, (p - 1) / 2, p); return v === 1 ? 1 : v === 0 ? 0 : -1; }
  function digitsOf(n) { return String(n).split('').map(Number); }

  // ---------------------------------------------------------------- answers
  function num(v) { return { t: 'num', v: String(v), form: 'int' }; }
  function anyNum(v) { return { t: 'num', v: String(v) }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function setA(arr) { return { t: 'set', v: arr.map(String) }; }
  function multi(parts) { return { t: 'multi', parts: parts.map(function (p) { return { label: p[0], a: p[1] }; }) }; }
  function mcA(correct, wrongs) { return U.mc(correct, wrongs, 1 + wrongs.length); }

  // ---------------------------------------------------------------- TeX
  function cm(n) { return T.commas(n); }                                // 12,345
  function p(n) { return n < 0 ? '(' + cm(n) + ')' : cm(n); }          // (-4) for products
  function pmod(n) { return ' \\pmod{' + n + '}'; }
  function fx(n) { return factor(n).map(function (f) { return f[1] > 1 ? f[0] + '^{' + f[1] + '}' : String(f[0]); }).join(' \\cdot '); } // 2^{3} \cdot 3^{2} \cdot 5
  function fxList(fl) { return fl.map(function (f) { return f[1] > 1 ? f[0] + '^{' + f[1] + '}' : String(f[0]); }).join(' \\cdot '); }
  function leg(a, pp) { return '\\left(\\frac{' + a + '}{' + pp + '}\\right)'; }
  function divTex(A, B, q, r) { return cm(A) + ' = ' + cm(B) + ' \\cdot ' + p(q) + ' + ' + cm(r); }
  function euclidRows(a, b) { var out = []; while (b) { var q = Math.floor(a / b), r = a - q * b; out.push({ A: a, B: b, q: q, r: r }); a = b; b = r; } return out; }
  function euclidSteps(a, b) { // the division lines as steps, then the gcd
    var rows = euclidRows(a, b), st = rows.map(function (r) { return '$' + divTex(r.A, r.B, r.q, r.r) + '$'; });
    var g = rows[rows.length - 1].B;
    st.push('The remainder is $0$, so the gcd is the last nonzero remainder: $\\gcd(' + cm(a) + ', ' + cm(b) + ') = ' + cm(g) + '$.');
    return { steps: st, g: g, rows: rows };
  }
  function bin(e) { return e.toString(2); }
  function twoPows(e) { var out = [], k = 0; while (e) { if (e & 1) out.push(k); e = Math.floor(e / 2); k++; } return out.reverse(); } // exponents of 2 in e, high first
  // fast power steps: a^e mod n by repeated squaring, every product reduced
  function fastPow(a, e, n) {
    var ks = twoPows(e), top = ks[0], sq = [mod(a, n)], st = [];
    for (var k = 1; k <= top; k++) sq.push(mulmod(sq[k - 1], sq[k - 1], n));
    st.push('Write the exponent as a sum of powers of 2: $' + e + ' = ' + ks.map(function (k) { return String(Math.pow(2, k)); }).join(' + ') + '$ (binary $' + bin(e) + '$).');
    if (top > 0) {
      var parts = ['$' + a + '^{1} \\equiv ' + sq[0] + '$'];
      for (k = 1; k <= top; k++) parts.push('$' + a + '^{' + Math.pow(2, k) + '} ' + (k === 1 && sq[0] === a ? '' : '\\equiv ' + sq[k - 1] + '^{2} ') + '= ' + cm(sq[k - 1] * sq[k - 1]) + (sq[k - 1] * sq[k - 1] >= n ? ' \\equiv ' + sq[k] : '') + '$');
      st.push('Square again and again, reducing mod ' + n + ' each time: ' + parts.join(', ') + '.');
    } else st.push('$' + a + ' \\equiv ' + sq[0] + pmod(n) + '$.');
    var val = sq[ks[0]];
    if (ks.length > 1) {
      st.push('Multiply the powers you need: $' + a + '^{' + e + '} = ' + ks.map(function (k) { return a + '^{' + Math.pow(2, k) + '}'; }).join(' \\cdot ') + ' \\equiv ' + ks.map(function (k) { return String(sq[k]); }).join(' \\cdot ') + pmod(n) + '$.');
      var prods = [];
      for (var i = 1; i < ks.length; i++) { var nv = mulmod(val, sq[ks[i]], n); prods.push('$' + val + ' \\cdot ' + sq[ks[i]] + ' = ' + cm(val * sq[ks[i]]) + (val * sq[ks[i]] >= n ? ' \\equiv ' + nv : '') + '$'); val = nv; }
      st.push('Reduce after each multiplication: ' + prods.join(', then ') + '.');
    }
    st.push('So $' + a + '^{' + e + '} \\equiv ' + val + pmod(n) + '$.');
    if (val !== powmod(a, e, n)) throw new Error('fastPow mismatch');
    return { v: val, steps: st };
  }
  function cx(c, v) { return c === 1 ? v : c === -1 ? '-' + v : c + v; } // 3x, x, -x
  function LET(k) { return String.fromCharCode(65 + k); }
  function word2nums(w) { return w.split('').map(function (c) { return c.charCodeAt(0) - 65; }); }


  // ================================================================ Unit 1: divisibility and the Euclidean algorithm
  G('nt.divisibility', function (R, ctx) {
    var shape = by(ctx, R.pick(['tf', 'tf', 'rev']), R.pick(['neg', 'comb', 'tf']), R.pick(['always', 'count', 'comb']));
    var a, b, k, r, st;
    if (shape === 'tf') {
      a = R.int(3, 15); k = R.int(3, 16); var yes = R.coin(); b = a * k + (yes ? 0 : R.int(1, a - 1));
      st = ['$' + a + ' \\mid ' + b + '$ means $' + b + ' = ' + a + ' \\cdot k$ for some integer $k$.'];
      if (yes) st.push('$' + b + ' = ' + a + ' \\cdot ' + k + '$, so such a $k$ exists: <b>true</b>.');
      else st.push('$' + divTex(b, a, k, b - a * k) + '$. The remainder is not $0$, so no integer $k$ works: $' + a + ' \\nmid ' + b + '$, <b>false</b>.');
      return { q: 'True or false: $' + a + ' \\mid ' + b + '$.', a: tf(yes), steps: st, hint: 'Is $' + b + '$ equal to $' + a + '$ times a whole number?' };
    }
    if (shape === 'rev') {
      a = R.int(3, 12); k = R.int(3, 9); b = a * k; var fwd = R.coin();
      if (fwd) return { q: 'True or false: $' + a + ' \\mid ' + b + '$.', a: tf(true), steps: ['$' + a + ' \\mid ' + b + '$ asks whether $' + b + ' = ' + a + ' \\cdot k$ for an integer $k$.', '$' + b + ' = ' + a + ' \\cdot ' + k + '$: <b>true</b>. (The bar is a statement, not a fraction: it does not mean $' + a + '/' + b + '$.)'], hint: 'Read $a \\mid b$ as "$a$ divides $b$": is $b$ a multiple of $a$?' };
      return { q: 'True or false: $' + b + ' \\mid ' + a + '$.', a: tf(false), steps: ['$' + b + ' \\mid ' + a + '$ asks whether $' + a + ' = ' + b + ' \\cdot k$ for an integer $k$. The number on the left is the divisor.', 'Since $0 < ' + a + ' < ' + b + '$, the multiples of $' + b + '$ jump from $0$ to $' + b + '$ and skip $' + a + '$. So <b>false</b>. (It is $' + a + ' \\mid ' + b + '$ that is true.)'], hint: 'The number on the left divides the number on the right. Is $' + a + '$ a multiple of $' + b + '$?' };
    }
    if (shape === 'neg') {
      a = R.int(3, 12); k = R.int(2, 9);
      var c = R.pick(['negDiv', 'negNum', 'zeroRight', 'zeroLeft', 'negFalse']);
      if (c === 'negDiv') return { q: 'True or false: $-' + a + ' \\mid ' + (a * k) + '$.', a: tf(true), steps: ['We need an integer $k$ with $' + a * k + ' = (-' + a + ') \\cdot k$.', '$k = -' + k + '$ works: $(-' + a + ')(-' + k + ') = ' + a * k + '$. <b>True.</b> Signs never matter for divisibility.'], hint: 'The integer $k$ may be negative.' };
      if (c === 'negNum') return { q: 'True or false: $' + a + ' \\mid -' + (a * k) + '$.', a: tf(true), steps: ['We need an integer $k$ with $-' + a * k + ' = ' + a + ' \\cdot k$.', '$k = -' + k + '$ works. <b>True.</b>'], hint: 'The integer $k$ may be negative.' };
      if (c === 'zeroRight') return { q: 'True or false: $' + a + ' \\mid 0$.', a: tf(true), steps: ['We need an integer $k$ with $0 = ' + a + ' \\cdot k$.', '$k = 0$ works, so <b>true</b>: every integer divides $0$.'], hint: 'Is $0$ a multiple of $' + a + '$?' };
      if (c === 'zeroLeft') return { q: 'True or false: $0 \\mid ' + a + '$.', a: tf(false), steps: ['We need an integer $k$ with $' + a + ' = 0 \\cdot k$.', 'But $0 \\cdot k = 0$ for every $k$, never $' + a + '$. <b>False.</b>'], hint: 'What are the multiples of $0$?' };
      r = R.int(1, a - 1);
      return { q: 'True or false: $-' + a + ' \\mid ' + (a * k + r) + '$.', a: tf(false), steps: ['Signs do not matter, so ask whether $' + a + ' \\mid ' + (a * k + r) + '$.', '$' + divTex(a * k + r, a, k, r) + '$ leaves remainder $' + r + '$, so <b>false</b>.'], hint: 'Drop the sign, then divide.' };
    }
    if (shape === 'comb') {
      var d = R.pick([3, 4, 5, 6, 7, 8, 9, 11]), m = R.int(2, 7), n = R.int(2, 7), sg = R.pick(['+', '-']), c1 = R.int(1, d - 1), c2 = R.int(1, d - 1), m2 = R.int(2, 9);
      var right = m + 'a ' + sg + ' ' + n + 'b';
      return { q: 'Suppose $' + d + ' \\mid a$ and $' + d + ' \\mid b$. Which number must $' + d + '$ also divide, whatever $a$ and $b$ are?', a: mcA('$' + right + '$', ['$a + b + 1$', '$' + m2 + 'a + ' + c1 + '$', '$ab + ' + c2 + '$']),
        steps: ['Write $a = ' + d + 'k$ and $b = ' + d + 'l$ for integers $k$ and $l$.', 'Then $' + right + ' = ' + d + '(' + m + 'k ' + sg + ' ' + n + 'l)$, a multiple of $' + d + '$.', 'Each other choice is a multiple of $' + d + '$ plus a number that $' + d + '$ does not divide. For example $a + b + 1 = ' + d + '(k + l) + 1$ leaves remainder $1$.'],
        hint: 'Write $a$ and $b$ as multiples of $' + d + '$ and factor.' };
    }
    if (shape === 'always') {
      var good = R.pick(['If $a \\mid b$ and $b \\mid c$, then $a \\mid c$.', 'If $a \\mid b$, then $a \\mid bc$ for every integer $c$.', 'If $a \\mid b$ and $a \\mid c$, then $a \\mid (2b - 3c)$.']);
      var bad = R.sample(['If $a \\mid bc$, then $a \\mid b$ or $a \\mid c$.', 'If $a \\mid (b + c)$, then $a \\mid b$.', 'If $a \\mid b$ and $c \\mid b$, then $ac \\mid b$.', 'If $a \\mid b$, then $b \\mid a$.', 'If $a \\mid c$ and $b \\mid c$, then $(a + b) \\mid c$.'], 3);
      var cex = { 'If $a \\mid bc$, then $a \\mid b$ or $a \\mid c$.': '$6 \\mid 4 \\cdot 9$, but $6 \\nmid 4$ and $6 \\nmid 9$', 'If $a \\mid (b + c)$, then $a \\mid b$.': '$5 \\mid (2 + 3)$, but $5 \\nmid 2$', 'If $a \\mid b$ and $c \\mid b$, then $ac \\mid b$.': '$2 \\mid 6$ and $6 \\mid 6$, but $12 \\nmid 6$', 'If $a \\mid b$, then $b \\mid a$.': '$3 \\mid 12$, but $12 \\nmid 3$', 'If $a \\mid c$ and $b \\mid c$, then $(a + b) \\mid c$.': '$2 \\mid 6$ and $3 \\mid 6$, but $5 \\nmid 6$' };
      var why = { 'If $a \\mid b$ and $b \\mid c$, then $a \\mid c$.': 'If $b = ak$ and $c = bl$, then $c = a(kl)$.', 'If $a \\mid b$, then $a \\mid bc$ for every integer $c$.': 'If $b = ak$, then $bc = a(kc)$.', 'If $a \\mid b$ and $a \\mid c$, then $a \\mid (2b - 3c)$.': 'If $b = ak$ and $c = al$, then $2b - 3c = a(2k - 3l)$.' };
      return { q: 'For integers $a$, $b$ and $c$, which statement is always true?', a: mcA(good, bad), steps: ['The true one: ' + good + ' ' + why[good], 'Each of the others fails for some numbers: ' + bad.map(function (s) { return cex[s]; }).join('; ') + '.'], hint: 'Write each "divides" as an equation $b = ak$, or look for a small counterexample.' };
    }
    // count: n | n + k exactly when n | k
    var K = R.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45]), dv = divisors(K);
    return { q: 'How many positive integers $n$ satisfy $n \\mid (n + ' + K + ')$?', a: num(dv.length),
      steps: ['$n$ always divides $n$. If $n \\mid (n + ' + K + ')$, then $n$ divides the difference $(n + ' + K + ') - n = ' + K + '$.', 'And if $n \\mid ' + K + '$, then $n$ divides the sum $n + ' + K + '$. So the condition is exactly $n \\mid ' + K + '$.', 'The positive divisors of $' + K + '$ are ' + dv.join(', ') + ': there are $' + dv.length + '$.'],
      hint: 'If $n$ divides two numbers, it divides their difference.' };
  });

  G('nt.division-algorithm', function (R, ctx) {
    var shape = by(ctx, 'pos', R.pick(['neg', 'neg', 'pos']), R.pick(['day', 'flip', 'neg']));
    var b = R.int(3, 12), a, q, r;
    if (shape === 'day') {
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], w = R.int(0, 6), dd = R.int(40, 400);
      if (dd % 7 === 0) dd++;
      q = Math.floor(-dd / 7); r = -dd - 7 * q; var ans = days[(w + r) % 7];
      return { q: 'Today is ' + days[w] + '. What day of the week was it ' + dd + ' days ago?', a: { t: 'text', v: [ans, ans.slice(0, 3)] },
        steps: ['Going back ' + dd + ' days is a change of $-' + dd + '$ days. Divide by 7 with a remainder from 0 to 6: $' + divTex(-dd, 7, q, r) + '$.', 'The $' + (-q) + '$ whole weeks change nothing, so going back ' + dd + ' days lands on the same day as going forward $' + r + '$ day' + (r === 1 ? '' : 's') + '.', days[w] + ' + ' + r + ' day' + (r === 1 ? '' : 's') + ' is <b>' + ans + '</b>.'],
        hint: 'Write $-' + dd + ' = 7q + r$ with $0 \\le r < 7$.' };
    }
    if (shape === 'flip') {
      var r0 = R.int(1, b - 1), A = b * R.int(5, 40) + r0;
      return { q: 'A positive integer $a$ leaves remainder $' + r0 + '$ when divided by $' + b + '$. What remainder does $-a$ leave when divided by $' + b + '$?', a: num(b - r0),
        steps: ['Write $a = ' + b + 'q + ' + r0 + '$. Then $-a = ' + b + '(-q) - ' + r0 + '$, but $-' + r0 + '$ is not a remainder: remainders are from $0$ to $' + (b - 1) + '$.', 'Borrow one ' + b + ': $-a = ' + b + '(-q - 1) + (' + b + ' - ' + r0 + ') = ' + b + '(-q - 1) + ' + (b - r0) + '$.', 'So the remainder is $' + (b - r0) + '$. Check with $a = ' + A + '$: $' + divTex(-A, b, Math.floor(-A / b), mod(-A, b)) + '$.'],
        hint: 'Remainders are never negative. Borrow one more ' + b + ' from the quotient.' };
    }
    a = shape === 'pos' ? R.int(20, 200) : -R.int(10, 200);
    if (mod(a, b) === 0) a += shape === 'pos' ? 1 : -1;
    q = Math.floor(a / b); r = a - b * q;
    var st = ['We need $' + cm(a) + ' = ' + b + 'q + r$ with $0 \\le r < ' + b + '$.'];
    if (a < 0) {
      st.push('$' + b + ' \\cdot ' + p(q + 1) + ' = ' + (b * (q + 1)) + '$ is too big (it is above $' + a + '$), so take one more ' + b + ' away: $q = ' + q + '$, since $' + b + ' \\cdot ' + p(q) + ' = ' + (b * q) + ' \\le ' + a + '$.');
      st.push('$r = ' + a + ' - ' + p(b * q) + ' = ' + r + '$. Check: $' + divTex(a, b, q, r) + '$ and $0 \\le ' + r + ' < ' + b + '$.');
    } else {
      st.push('The largest multiple of $' + b + '$ that is at most $' + a + '$ is $' + b + ' \\cdot ' + q + ' = ' + b * q + '$, so $q = ' + q + '$.');
      st.push('$r = ' + a + ' - ' + b * q + ' = ' + r + '$. Check: $' + divTex(a, b, q, r) + '$.');
    }
    return { q: 'Use the division algorithm with $a = ' + a + '$ and $b = ' + b + '$: find $q$ and $r$ with $a = bq + r$ and $0 \\le r < b$.', a: multi([['$q =$', num(q)], ['$r =$', num(r)]]), steps: st,
      hint: a < 0 ? 'The remainder must be between $0$ and $' + (b - 1) + '$, so $q$ is more negative than you might first guess.' : 'Find the largest multiple of $' + b + '$ that is at most $' + a + '$.' };
  });

  function toBase(n, b) { return n.toString(b).toUpperCase(); }
  function baseSteps(n, b) {
    var st = [], x = n, rs = [];
    while (x > 0) { var q = Math.floor(x / b), r = x % b; st.push('$' + divTex(x, b, q, r) + '$' + (r > 9 ? ' (digit ' + toBase(r, 16) + ')' : '')); rs.push(r); x = q; }
    st.push('Read the remainders from the last one to the first: <b>' + toBase(n, b) + '</b>$_{' + b + '}$.');
    return st;
  }
  function fromBaseSteps(s, b) {
    var ds = s.split('').map(function (c) { return parseInt(c, 16); }), L = ds.length, terms = [], vals = [];
    ds.forEach(function (d, i) { var e = L - 1 - i; terms.push(d + ' \\cdot ' + b + '^{' + e + '}'); vals.push(d * Math.pow(b, e)); });
    var n = parseInt(s, b);
    return { n: n, steps: [(b === 16 ? 'The digits are ' + ds.join(', ') + ' (A = 10, …, F = 15). ' : '') + 'Each digit counts a power of ' + b + ': $' + terms.join(' + ') + '$.', '$= ' + vals.map(cm).join(' + ') + ' = ' + cm(n) + '$.'] };
  }
  G('nt.number-bases', function (R, ctx) {
    var shape = by(ctx, R.pick(['to2', 'from2']), R.pick(['toB', 'fromB']), R.pick(['to16', 'from16', 'BtoC']));
    var n, b, s, f;
    if (shape === 'to2' || shape === 'toB' || shape === 'to16') {
      b = shape === 'to2' ? 2 : shape === 'to16' ? 16 : R.pick([3, 4, 5, 6, 7, 8]);
      n = shape === 'to2' ? R.int(18, 63) : shape === 'to16' ? R.int(170, 4000) : R.int(Math.max(30, b * b + 1), b * b * b * 2);
      var ans = toBase(n, b);
      return { q: 'Write $' + n + '$ in base ' + b + '.' + (b === 16 ? ' Use the digits 0–9 and A–F.' : ' Type just the digits.'), a: { t: 'text', v: [ans] }, steps: baseSteps(n, b), nolint: ['+ 0'],
        hint: 'Divide by ' + b + ' again and again; the remainders are the digits, read from the last to the first.' };
    }
    if (shape === 'from2' || shape === 'fromB' || shape === 'from16') {
      b = shape === 'from2' ? 2 : shape === 'from16' ? 16 : R.pick([3, 4, 5, 6, 7, 8]);
      n = shape === 'from2' ? R.int(18, 127) : shape === 'from16' ? R.int(170, 4000) : R.int(Math.max(30, b * b + 1), b * b * b * 2);
      s = toBase(n, b); f = fromBaseSteps(s, b);
      return { q: 'Write $' + (b === 16 ? '\\mathrm{' + s + '}' : s) + '_{' + b + '}$ in base 10.', a: num(n), steps: f.steps, nolint: ['+ 0', '1x'], hint: 'The rightmost digit counts ones, the next counts ' + b + 's, the next ' + (b * b) + 's, and so on.' };
    }
    // BtoC: base b to base c through base 10
    b = R.pick([3, 5, 7]); var c = R.pick([2, 4, 6, 8, 9].filter(function (x) { return x !== b; })); n = R.int(30, 200);
    s = toBase(n, b); f = fromBaseSteps(s, b);
    return { q: 'Write $' + s + '_{' + b + '}$ in base ' + c + '. Type just the digits.', a: { t: 'text', v: [toBase(n, c)] }, nolint: ['+ 0'], steps: ['First go to base 10.'].concat(f.steps, ['Now divide by ' + c + ' again and again.'], baseSteps(n, c)), hint: 'Go through base 10: first find the value, then divide by ' + c + ' repeatedly.' };
  });

  var COPRIME_PAIRS = []; (function () { for (var u = 2; u <= 160; u++) for (var v = 1; v < u; v++) if (gcd(u, v) === 1) COPRIME_PAIRS.push([u, v]); })();
  function pickEuclid(R, maxA, minSteps) { // a = g·u, b = g·v with gcd(u, v) = 1 and enough division steps
    for (var t = 0; t < 400; t++) {
      var pr = R.pick(COPRIME_PAIRS), g = R.int(1, Math.max(1, Math.floor(maxA / pr[0]))), a = g * pr[0], b = g * pr[1];
      if (a > maxA || a < maxA / 6 || pr[1] < 3) continue;
      if (euclidRows(a, b).length >= minSteps) return [a, b];
    }
    return [252, 198];
  }
  G('nt.euclidean-algorithm', function (R, ctx) {
    var L = ctx.level, shape = L === 3 ? R.pick(['big', 'three']) : 'two';
    if (shape === 'three') {
      var g = R.pick([6, 7, 8, 9, 12, 14, 15]), us = [R.int(5, 30), R.int(5, 30), R.int(5, 30)];
      if (gcd(gcd(us[0], us[1]), us[2]) !== 1) us[2] = us[2] + 1;
      if (gcd(gcd(us[0], us[1]), us[2]) !== 1) us = [7, 10, 13];
      var x = us.map(function (u) { return g * u; }), g1 = gcd(x[0], x[1]), gg = gcd(g1, x[2]);
      var e1 = euclidSteps(Math.max(x[0], x[1]), Math.min(x[0], x[1])), e2 = euclidSteps(Math.max(g1, x[2]), Math.min(g1, x[2]));
      return { q: 'Find $\\gcd(' + x.join(', ') + ')$.', a: num(gg), steps: ['Use $\\gcd(a, b, c) = \\gcd(\\gcd(a, b), c)$. First $\\gcd(' + Math.max(x[0], x[1]) + ', ' + Math.min(x[0], x[1]) + ')$:'].concat(e1.steps, ['Then $\\gcd(' + Math.max(g1, x[2]) + ', ' + Math.min(g1, x[2]) + ')$:'], e2.steps, ['So $\\gcd(' + x.join(', ') + ') = ' + gg + '$.']), hint: 'Find the gcd of the first two, then the gcd of that with the third.' };
    }
    var ab = shape === 'big' ? pickEuclid(R, R.int(3000, 20000), 5) : L === 1 ? pickEuclid(R, R.int(60, 300), 3) : pickEuclid(R, R.int(300, 2500), 4);
    var e = euclidSteps(ab[0], ab[1]), pb = { q: 'Use the Euclidean algorithm to find $\\gcd(' + cm(ab[0]) + ', ' + cm(ab[1]) + ')$.', a: num(e.g), steps: e.steps, hint: 'Divide, then replace the pair (a, b) by (b, remainder). Stop when the remainder is 0.' };
    if (L === 1 && R.chance(0.4)) pb.viz = { name: 'nt-euclid', opts: { a: ab[0], b: ab[1], mode: 'gcd', quiet: true, edit: false } };
    return pb;
  });

  G('nt.bezout', function (R, ctx) {
    var L = ctx.level, ab = L === 1 ? pickEuclid(R, R.int(30, 90), 2) : L === 2 ? pickEuclid(R, R.int(90, 400), 3) : pickEuclid(R, R.int(400, 2500), 4);
    var a = ab[0], b = ab[1], E = egcd(a, b), g = E[0], step = b / g, x = mod(E[1], step), y = (g - a * x) / b;
    var rows = euclidRows(a, b), st = [];
    rows.forEach(function (r) { st.push('$' + divTex(r.A, r.B, r.q, r.r) + '$'); });
    // forward substitution: each remainder as a·s + b·t
    var s0 = 1, t0 = 0, s1 = 0, t1 = 1, lines = [];
    rows.forEach(function (r) { if (!r.r) return; var s2 = s0 - r.q * s1, t2 = t0 - r.q * t1; lines.push('$' + cm(r.r) + ' = ' + cm(r.A) + ' - ' + r.q + ' \\cdot ' + cm(r.B) + ' = ' + cm(a) + ' \\cdot ' + p(s2) + ' + ' + cm(b) + ' \\cdot ' + p(t2) + '$'); s0 = s1; t0 = t1; s1 = s2; t1 = t2; });
    st.push('So $\\gcd(' + a + ', ' + b + ') = ' + g + '$. Now write each remainder as a combination of $' + a + '$ and $' + b + '$, using the two lines above it: ' + (lines.length ? lines.join('; ') : '$' + g + ' = ' + a + ' \\cdot 0 + ' + b + ' \\cdot 1$') + '.');
    var x0 = E[1], y0 = E[2];
    if (x0 !== x) st.push('That gives $x = ' + x0 + '$, $y = ' + y0 + '$. Every other solution is $x = ' + x0 + ' + ' + step + 't$, $y = ' + y0 + ' - ' + (a / g) + 't$. Take $t = ' + ((x - x0) / step) + '$ to get $0 \\le x < ' + step + '$: $x = ' + x + '$, $y = ' + y + '$.');
    else st.push('That gives $x = ' + x + '$, $y = ' + y + '$, and $0 \\le x < ' + step + '$ already.');
    st.push('Check: $' + a + ' \\cdot ' + p(x) + ' + ' + b + ' \\cdot ' + p(y) + ' = ' + (a * x) + ' ' + (b * y < 0 ? '- ' + (-b * y) : '+ ' + b * y) + ' = ' + g + '$.');
    if (L === 1 && R.chance(0.45)) { // choose the pair: wrong ones are sign slips and a pair that gives a different number
      var w1 = [x, -y], w2 = [-x, y], w3 = [x + 1, y], ch = [[x, y], w1, w2, w3].map(function (v) { return '$x = ' + v[0] + ',\\ y = ' + v[1] + '$'; });
      return { q: 'Which pair of integers satisfies $' + a + 'x + ' + b + 'y = ' + g + '$, where $' + g + ' = \\gcd(' + a + ', ' + b + ')$?', a: mcA(ch[0], ch.slice(1)), steps: st, hint: 'Substitute each pair and multiply out, or run the extended Euclidean algorithm.' };
    }
    return { q: 'Find integers $x$ and $y$ with $' + cm(a) + 'x + ' + cm(b) + 'y = \\gcd(' + cm(a) + ', ' + cm(b) + ')$ and $0 \\le x < ' + step + '$.', a: multi([['$x =$', num(x)], ['$y =$', num(y)]]), steps: st, hint: 'Run the Euclidean algorithm, then write each remainder as $' + a + 's + ' + b + 't$, working down the list.' };
  });

  G('nt.linear-diophantine', function (R, ctx) {
    var L = ctx.level, shape = by(ctx, R.pick(['exists', 'small']), R.pick(['small', 'count']), R.pick(['count', 'step', 'small']));
    var d, a, b, c, E, x0, y0, st;
    if (shape === 'exists') {
      d = R.pick([2, 3, 4, 5, 6]); var u = R.int(2, 9), v = R.int(2, 9); while (gcd(u, v) !== 1) v++;
      a = d * u; b = d * v; var yes = R.coin(); c = d * R.int(3, 15) + (yes ? 0 : R.int(1, d - 1));
      st = ['$\\gcd(' + a + ', ' + b + ') = ' + d + '$.', 'For any integers $x$ and $y$, $' + a + 'x + ' + b + 'y$ is a multiple of $' + d + '$.'];
      st.push(yes ? '$' + d + ' \\mid ' + c + '$, so solutions exist (scale a Bézout combination by $' + (c / d) + '$). <b>True.</b>' : '$' + d + ' \\nmid ' + c + '$, so no integers can make the left side equal $' + c + '$. <b>False.</b>');
      return { q: 'True or false: $' + a + 'x + ' + b + 'y = ' + c + '$ has a solution in integers.', a: tf(yes), steps: st, hint: 'What does $\\gcd(' + a + ', ' + b + ')$ divide?' };
    }
    if (shape === 'step') {
      d = R.pick([2, 3, 4, 6]); var u2 = R.int(2, 9), v2 = R.int(2, 9); while (gcd(u2, v2) !== 1 || u2 === v2) v2 = R.int(2, 9);
      a = d * u2; b = d * v2; x0 = R.int(-5, 9); y0 = R.int(-5, 9); c = a * x0 + b * y0;
      return { q: 'One solution of $' + a + 'x + ' + b + 'y = ' + c + '$ is $(x, y) = (' + x0 + ', ' + y0 + ')$. The next solution with a larger $x$ is $(' + x0 + ' + k, ' + y0 + ' - m)$ for positive integers $k$ and $m$. Find $k$ and $m$.', a: multi([['$k =$', num(v2)], ['$m =$', num(u2)]]),
        steps: ['Moving from one solution to another must keep $' + a + 'x + ' + b + 'y$ the same: $' + a + 'k = ' + b + 'm$.', 'Divide by $d = \\gcd(' + a + ', ' + b + ') = ' + d + '$: $' + u2 + 'k = ' + v2 + 'm$. Since $\\gcd(' + u2 + ', ' + v2 + ') = 1$, the smallest choice is $k = ' + v2 + '$, $m = ' + u2 + '$.', 'So the steps are $b/d = ' + v2 + '$ and $a/d = ' + u2 + '$, not $' + b + '$ and $' + a + '$ (those would skip solutions). Check: $(' + (x0 + v2) + ', ' + (y0 - u2) + ')$ gives $' + a + ' \\cdot ' + p(x0 + v2) + ' + ' + b + ' \\cdot ' + p(y0 - u2) + ' = ' + c + '$.'],
        hint: 'The change $' + a + 'k - ' + b + 'm$ must be 0. Divide out the gcd.' };
    }
    if (shape === 'count') {
      var pr = R.pick([[5, 8], [5, 7], [3, 7], [4, 7], [6, 11], [7, 9], [5, 12], [8, 13], [4, 9], [6, 15], [8, 12], [9, 12]]);
      a = pr[0]; b = pr[1]; d = gcd(a, b); c = d * R.int(Math.ceil(2 * a * b / d), Math.ceil(5 * a * b / d));
      var sols = []; for (var X = 0; X * a <= c; X++) if ((c - a * X) % b === 0) sols.push([X, (c - a * X) / b]);
      E = egcd(a, b);
      st = ['$d = \\gcd(' + a + ', ' + b + ') = ' + d + '$ divides $' + c + '$, so there are integer solutions.'];
      var xa = mod(E[1] * (c / d), b / d), ya = (c - a * xa) / b;
      st.push('Find the solution with the smallest $x \\ge 0$ (scale a Bézout combination, or try $x = 0, 1, 2, \\dots$ until $' + c + ' - ' + a + 'x$ is a multiple of $' + b + '$): $x = ' + xa + '$, $y = (' + c + ' - ' + a * xa + ')/' + b + ' = ' + ya + '$.');
      st.push('The others are $x = ' + xa + ' + ' + (b / d) + 't$, $y = ' + ya + ' - ' + (a / d) + 't$. We need $y \\ge 0$: $t \\le ' + ya + '/' + (a / d) + '$, so $t = 0, 1, \\dots, ' + Math.floor(ya / (a / d)) + '$.');
      st.push('That is $' + sols.length + '$ way' + (sols.length === 1 ? '' : 's') + ': ' + sols.map(function (s) { return '(' + s[0] + ', ' + s[1] + ')'; }).join(', ') + '.');
      return { q: 'Stamps come in ' + a + '¢ and ' + b + '¢. In how many ways can you make exactly ' + c + '¢ of postage? (Count pairs $(x, y)$ of whole numbers $x, y \\ge 0$ with $' + a + 'x + ' + b + 'y = ' + c + '$.)', a: num(sols.length), steps: st, hint: 'Find one solution, step by $b/d$ and $a/d$, and count the steps that keep both numbers at least 0.' };
    }
    // small: the solution with the smallest x >= 0
    var ab = L === 1 ? pickEuclid(R, R.int(20, 60), 2) : pickEuclid(R, R.int(60, 300), 3);
    a = ab[0]; b = ab[1]; E = egcd(a, b); d = E[0]; var kk = R.int(2, 9); c = d * kk * (R.coin() ? 1 : -1);
    var step = b / d, xs = mod(E[1] * (c / d), step), ys = (c - a * xs) / b;
    st = ['$d = \\gcd(' + a + ', ' + b + ') = ' + d + '$ and $' + d + ' \\mid ' + c + '$, so there are solutions.', 'The extended Euclidean algorithm gives $' + a + ' \\cdot ' + p(E[1]) + ' + ' + b + ' \\cdot ' + p(E[2]) + ' = ' + d + '$.', 'Multiply by $' + c + '/' + d + ' = ' + (c / d) + '$: $x = ' + (E[1] * c / d) + '$, $y = ' + (E[2] * c / d) + '$ is one solution.', 'All solutions: $x = ' + (E[1] * c / d) + ' + ' + step + 't$, $y = ' + (E[2] * c / d) + ' - ' + (a / d) + 't$. The smallest $x \\ge 0$ is $x = ' + xs + '$, with $y = ' + ys + '$.', 'Check: $' + a + ' \\cdot ' + xs + ' + ' + b + ' \\cdot ' + p(ys) + ' = ' + c + '$.'];
    var pb = { q: 'Find the solution of $' + a + 'x + ' + b + 'y = ' + c + '$ in integers with the smallest $x \\ge 0$.', a: multi([['$x =$', num(xs)], ['$y =$', num(ys)]]), steps: st, hint: 'Scale a Bézout combination by $c/d$, then shift $x$ by multiples of $b/d$.' };
    return pb;
  });


  // ================================================================ Unit 2: primes and factorization
  function trialSteps(n) { // trial division by the primes up to √n
    var r = Math.sqrt(n), lim = isqrt(n), ps = primes(2, lim), st = [];
    st.push('$\\sqrt{' + n + '} \\approx ' + T.dec(r, 2) + '$, so only the primes up to $' + lim + '$ need testing' + (ps.length ? ': ' + ps.join(', ') + '.' : ' (there are none).'));
    for (var i = 0; i < ps.length; i++) if (n % ps[i] === 0) { st.push('$' + n + ' = ' + ps[i] + ' \\cdot ' + (n / ps[i]) + '$, so ' + n + ' is <b>composite</b>.'); return { prime: false, steps: st, p: ps[i] }; }
    st.push('None of them divides ' + n + ' (each leaves a remainder), so ' + n + ' is <b>prime</b>. A factor above $\\sqrt{' + n + '}$ would come paired with one below it.');
    return { prime: true, steps: st };
  }
  G('nt.primality-sieve', function (R, ctx) {
    var shape = by(ctx, R.pick(['isprime', 'isprime', 'isprime', 'one']), R.pick(['largest', 'spf', 'isprime2']), R.pick(['count', 'spf3', 'largest']));
    var n, t;
    if (shape === 'one') return { q: 'True or false: 1 is a prime number.', a: tf(false), steps: ['A prime has exactly two positive divisors, 1 and itself.', '1 has only one positive divisor, so it is <b>not</b> prime (and not composite either). Leaving 1 out keeps prime factorizations unique: otherwise $6 = 2 \\cdot 3 = 1 \\cdot 2 \\cdot 3$.'], hint: 'How many positive divisors does 1 have?' };
    if (shape === 'isprime' || shape === 'isprime2') {
      var lo = shape === 'isprime' ? 30 : 150, hi = shape === 'isprime' ? 150 : 1000;
      if (R.coin()) { n = R.pick(primes(lo, hi)); }
      else if (shape === 'isprime') { var cs = []; for (var k = lo; k <= hi; k++) if (!isPrime(k) && k % 2 && k % 5) cs.push(k); n = R.pick(cs); }
      else { var pp = R.pick(primes(7, 31)), qq = R.pick(primes(pp, Math.floor(hi / pp))); n = pp * qq; if (n < lo) n = 7 * 37; }
      t = trialSteps(n);
      return { q: 'True or false: $' + n + '$ is prime.', a: tf(t.prime), steps: t.steps, hint: 'Test the primes up to $\\sqrt{' + n + '}$, and no further.' };
    }
    if (shape === 'largest') {
      n = R.int(ctx.level === 3 ? 2000 : 120, ctx.level === 3 ? 20000 : 2000); var lim = isqrt(n), big = primes(2, lim).pop();
      return { q: 'To decide by trial division whether $' + cm(n) + '$ is prime, what is the largest prime you might need to try?', a: num(big),
        steps: ['If $n = ab$ with $1 < a \\le b$, then $a \\cdot a \\le ab = n$, so $a \\le \\sqrt{n}$: a composite number has a prime factor at most $\\sqrt{n}$.', '$' + lim + '^{2} = ' + cm(lim * lim) + ' \\le ' + cm(n) + ' < ' + cm((lim + 1) * (lim + 1)) + ' = ' + (lim + 1) + '^{2}$, so $' + lim + ' \\le \\sqrt{' + cm(n) + '} < ' + (lim + 1) + '$.', 'The largest prime that is at most $' + lim + '$ is <b>' + big + '</b>.'],
        hint: 'Find the whole number part of $\\sqrt{' + cm(n) + '}$ by squaring nearby numbers.' };
    }
    if (shape === 'spf' || shape === 'spf3') {
      var top = shape === 'spf' ? 2000 : 10000, p1 = R.pick(primes(7, shape === 'spf' ? 31 : 61)), q1 = R.pick(primes(p1, Math.floor(top / p1)));
      n = p1 * q1; if (R.chance(0.3)) n *= R.pick(primes(p1, 97).filter(function (x) { return n * x <= top * 3; }).concat([q1]));
      var ps = primes(2, p1 - 1);
      return { q: 'What is the smallest prime factor of $' + cm(n) + '$?', a: num(p1),
        steps: ['$' + cm(n) + '$ is odd, not a multiple of 3 (digit sum ' + U.digitSum(n) + ') and does not end in 0 or 5.', (ps.length > 3 ? 'Keep testing primes in order: ' + ps.filter(function (x) { return x > 5; }).map(function (x) { return x + ' leaves remainder ' + (n % x); }).join(', ') + '. Then ' : 'Try 7: ') + '$' + cm(n) + ' = ' + p1 + ' \\cdot ' + cm(n / p1) + '$.', 'So the smallest prime factor is <b>' + p1 + '</b>.'],
        hint: 'Try 2, 3, 5, 7, 11, … in order and stop at the first that divides.' };
    }
    // count the primes in a short range
    var a = R.int(10, 28) * 10, b = a + R.pick([20, 30]), list = primes(a, b);
    return { q: 'How many primes are there between $' + a + '$ and $' + b + '$?', a: num(list.length),
      steps: ['Only odd numbers that do not end in 5 can be prime here. Each needs testing by the primes up to $\\sqrt{' + b + '} \\approx ' + T.dec(Math.sqrt(b), 1) + '$: 3, 7, 11, 13' + (b >= 289 ? ', 17' : '') + '.', 'The ones that survive: ' + (list.length ? list.join(', ') : 'none') + '.', 'There are <b>' + list.length + '</b>.'],
      hint: 'Cross out evens and multiples of 5 first, then test the rest by 3, 7, 11 and 13.' };
  });

  G('nt.unique-factorization', function (R, ctx) {
    var shape = by(ctx, 'exps', R.pick(['largest', 'square', 'exps']), R.pick(['lemma', 'cube', 'square']));
    var n, f, st;
    if (shape === 'exps') {
      var e;
      do { e = [R.int(0, 4), R.int(0, 3), R.int(0, 2), R.int(0, 2)]; n = Math.pow(2, e[0]) * Math.pow(3, e[1]) * Math.pow(5, e[2]) * Math.pow(7, e[3]); } while (n > 60000 || n < 200 || e.filter(function (x) { return x; }).length < 3);
      st = []; var x = n;
      [2, 3, 5, 7].forEach(function (pr, i) { if (!e[i]) { st.push('$' + cm(x) + '$ is not divisible by ' + pr + ', so the exponent of ' + pr + ' is $0$.'); return; } var chain = []; for (var k = 0; k < e[i]; k++) { chain.push(cm(x) + ' \\div ' + pr + ' = ' + cm(x / pr)); x /= pr; } st.push('Divide by ' + pr + ' while you can: $' + chain.join(',\\ ') + '$. Exponent ' + e[i] + '.'); });
      st.push('So $' + cm(n) + ' = ' + fx(n) + '$, and the exponents are $(' + e.join(', ') + ')$.');
      return { q: 'Write $' + cm(n) + ' = 2^{a} \\cdot 3^{b} \\cdot 5^{c} \\cdot 7^{d}$. Give $(a, b, c, d)$.', a: { t: 'tuple', v: e.map(String) }, steps: st, hint: 'Divide by 2 as many times as you can, then by 3, then 5, then 7.' };
    }
    if (shape === 'largest') {
      var big = R.pick(primes(11, 97)); do { n = big * R.pick([2, 3, 4, 5, 6, 7, 9, 10, 12, 14, 15, 18, 21]) * R.pick([1, 2, 3, 5]); } while (n > 20000 || spf(n) === n);
      return { q: 'What is the largest prime factor of $' + cm(n) + '$?', a: num(big), steps: ['Divide out small primes: $' + cm(n) + ' = ' + fx(n) + '$.', 'The largest prime in the factorization is <b>' + big + '</b>. (By unique factorization there is no other way to write it, so no other prime can appear.)'], hint: 'Peel off small primes until what is left is prime.' };
    }
    if (shape === 'square' || shape === 'cube') {
      var K = shape === 'square' ? 2 : 3;
      do { n = R.pick([2, 3, 5, 7]) * R.int(2, 60) * R.pick([1, 2, 3, 4, 5, 6, 8, 9]); } while (n > 6000 || n < 60);
      f = factor(n); var k = 1;
      f.forEach(function (x) { var need = (K - x[1] % K) % K; k *= Math.pow(x[0], need); });
      if (k === 1) { n *= 2; f = factor(n); k = 1; f.forEach(function (x) { k *= Math.pow(x[0], (K - x[1] % K) % K); }); }
      var word = K === 2 ? 'square' : 'cube';
      return { q: 'What is the smallest positive integer $k$ for which $' + cm(n) + 'k$ is a perfect ' + word + '?', a: num(k),
        steps: ['$' + cm(n) + ' = ' + fx(n) + '$.', 'A number is a perfect ' + word + ' exactly when every exponent in its prime factorization is a multiple of ' + K + ' (this uses unique factorization).', 'Raise each exponent to the next multiple of ' + K + ': multiply by ' + f.filter(function (x) { return x[1] % K; }).map(function (x) { var nd = (K - x[1] % K) % K; return nd > 1 ? x[0] + '^{' + nd + '}' : String(x[0]); }).map(function (s) { return '$' + s + '$'; }).join(', ') + '. So $k = ' + cm(k) + '$, and $' + cm(n) + ' \\cdot ' + cm(k) + ' = ' + fx(n * k) + '$.'],
        hint: 'Factor ' + cm(n) + ' and look at the exponents.' };
    }
    // lemma: smallest x with m | a·x
    var m = R.pick([6, 10, 12, 14, 15, 18, 20, 21, 22, 13, 17, 19]), a;
    if (isPrime(m)) { do { a = R.int(10, 99); } while (a % m === 0); }
    else { do { a = R.int(4, 60); } while (gcd(a, m) === 1 || a % m === 0); }
    var g = gcd(a, m), ans = m / g;
    st = ['$' + m + ' \\mid ' + a + 'x$ means $' + a + 'x = ' + m + 'j$. Divide by $\\gcd(' + a + ', ' + m + ') = ' + g + '$: $' + cx(a / g, 'x') + ' = ' + (m / g) + 'j$, so $' + (m / g) + ' \\mid ' + cx(a / g, 'x') + '$.'];
    st.push('Now $\\gcd(' + (a / g) + ', ' + (m / g) + ') = 1$: no prime factor of $' + (m / g) + '$ divides $' + (a / g) + '$, so by Euclid\'s lemma each one divides $x$, and $' + (m / g) + ' \\mid x$.');
    st.push('The smallest positive choice is $x = ' + ans + '$. Check: $' + a + ' \\cdot ' + ans + ' = ' + a * ans + ' = ' + m + ' \\cdot ' + (a * ans / m) + '$.' + (isPrime(m) ? '' : ' (Not $x = ' + m + '$: $' + m + '$ is not prime, so Euclid\'s lemma does not apply to it directly.)'));
    return { q: 'What is the smallest positive integer $x$ with $' + m + ' \\mid ' + a + 'x$?', a: num(ans), steps: st, hint: 'Factor $' + m + '$ and $' + a + '$. Which prime factors of $' + m + '$ does $' + a + '$ already supply?' };
  });

  function fromExp(ps, es) { return ps.reduce(function (s, pr, i) { return s * Math.pow(pr, es[i]); }, 1); }
  function texExp(ps, es) { var t = []; ps.forEach(function (pr, i) { if (es[i]) t.push(es[i] > 1 ? pr + '^{' + es[i] + '}' : String(pr)); }); return t.length ? t.join(' \\cdot ') : '1'; }
  G('nt.gcd-lcm-factorizations', function (R, ctx) {
    var shape = by(ctx, R.pick(['gcd', 'lcm']), R.pick(['back', 'gcd', 'lcm']), R.pick(['three', 'trap', 'back']));
    var ps = R.pick([[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7], [2, 3, 11]]), ea, eb, A, B, st;
    function pickE() { var e; do { e = ps.map(function () { return R.int(0, 3); }); } while (e.filter(Boolean).length < 2); return e; }
    if (shape === 'gcd' || shape === 'lcm') {
      do { ea = pickE(); eb = pickE(); A = fromExp(ps, ea); B = fromExp(ps, eb); } while (A === B || fromExp(ps, ea.map(function (x, i) { return Math.max(x, eb[i]); })) > 200000);
      var eg = ea.map(function (x, i) { return Math.min(x, eb[i]); }), el = ea.map(function (x, i) { return Math.max(x, eb[i]); }), isG = shape === 'gcd', ee = isG ? eg : el, val = fromExp(ps, ee);
      st = ['Line up the exponents of each prime: ' + ps.map(function (pr, i) { return pr + ': ' + ea[i] + ' and ' + eb[i]; }).join('; ') + '.', (isG ? 'The gcd takes the <b>smaller</b> exponent of each prime (a common divisor can use a prime only as often as both numbers have it): ' : 'The lcm takes the <b>larger</b> exponent of each prime (a common multiple must contain each number completely): ') + '$' + texExp(ps, ee) + ' = ' + cm(val) + '$.'];
      return { q: 'Let $a = ' + texExp(ps, ea) + '$ and $b = ' + texExp(ps, eb) + '$. Find $\\' + (isG ? 'gcd' : 'operatorname{lcm}') + '(a, b)$.', a: anyNum(val), steps: st, hint: isG ? 'For the gcd, use the smaller exponent of each prime.' : 'For the lcm, use the larger exponent of each prime.' };
    }
    if (shape === 'back') {
      do { ea = pickE(); eb = pickE(); A = fromExp(ps, ea); B = fromExp(ps, eb); } while (A === B || A * B > 2000000 || A < 20 || B < 20);
      var g = gcd(A, B), l = lcm(A, B);
      return { q: 'Two positive integers have $\\gcd = ' + cm(g) + '$ and $\\operatorname{lcm} = ' + cm(l) + '$. One of them is $' + cm(A) + '$. What is the other?', a: num(B),
        steps: ['For two numbers, $\\gcd(a, b) \\cdot \\operatorname{lcm}(a, b) = ab$: for each prime, the smaller exponent plus the larger exponent is the sum of the two exponents.', 'So $b = \\dfrac{' + cm(g) + ' \\cdot ' + cm(l) + '}{' + cm(A) + '} = \\dfrac{' + cm(g * l) + '}{' + cm(A) + '} = ' + cm(B) + '$.', 'Check with factorizations: $' + cm(A) + ' = ' + fx(A) + '$ and $' + cm(B) + ' = ' + fx(B) + '$.'],
        hint: 'Use $\\gcd(a, b) \\cdot \\operatorname{lcm}(a, b) = ab$.' };
    }
    var es = [pickE(), pickE(), pickE()], xs = es.map(function (e) { return fromExp(ps, e); });
    while (xs[0] === xs[1] || xs[1] === xs[2] || xs[0] === xs[2] || Math.max.apply(null, xs) > 5000) { es = [pickE(), pickE(), pickE()]; xs = es.map(function (e) { return fromExp(ps, e); }); }
    var G3 = gcd(gcd(xs[0], xs[1]), xs[2]), L3 = lcm(lcm(xs[0], xs[1]), xs[2]);
    if (shape === 'three') {
      var wantG = R.coin(), v3 = wantG ? G3 : L3;
      return { q: 'Find $\\' + (wantG ? 'gcd' : 'operatorname{lcm}') + '(a, b, c)$ for $a = ' + texExp(ps, es[0]) + '$, $b = ' + texExp(ps, es[1]) + '$, $c = ' + texExp(ps, es[2]) + '$.', a: anyNum(v3),
        steps: ['Exponents of each prime in $a$, $b$, $c$: ' + ps.map(function (pr, i) { return pr + ': ' + es[0][i] + ', ' + es[1][i] + ', ' + es[2][i]; }).join('; ') + '.', 'Take the ' + (wantG ? 'smallest' : 'largest') + ' exponent of each prime: $' + texExp(ps, ps.map(function (_, i) { return Math[wantG ? 'min' : 'max'](es[0][i], es[1][i], es[2][i]); })) + ' = ' + cm(v3) + '$.'],
        hint: 'Same rule as for two numbers: smallest exponents for the gcd, largest for the lcm.' };
    }
    var prod = xs[0] * xs[1] * xs[2], eq = G3 * L3 === prod;
    return { q: 'True or false: for $a = ' + xs[0] + '$, $b = ' + xs[1] + '$ and $c = ' + xs[2] + '$, $\\gcd(a, b, c) \\cdot \\operatorname{lcm}(a, b, c) = abc$.', a: tf(eq),
      steps: ['$\\gcd(a, b, c) = ' + cm(G3) + '$ and $\\operatorname{lcm}(a, b, c) = ' + cm(L3) + '$, so the left side is $' + cm(G3 * L3) + '$.', '$abc = ' + cm(prod) + '$. ' + (eq ? 'They are equal here, so <b>true</b> for these numbers.' : 'They differ: <b>false</b>.') + ' In general the rule fails for three numbers: for each prime, min + max misses the middle exponent.'],
      hint: 'Compute both sides. For each prime, compare min + max with the sum of all three exponents.' };
  });

  function smallestWithDivisors(k) { for (var n = 1; ; n++) if (tau(n) === k) return n; }
  function multParts(k, maxF) { // multiplicative partitions of k into factors ≥ 2, nonincreasing
    var out = []; maxF = maxF || k;
    for (var f = Math.min(k, maxF); f >= 2; f--) if (k % f === 0) { if (f === k) out.push([f]); else multParts(k / f, f).forEach(function (r) { out.push([f].concat(r)); }); }
    return out;
  }
  G('nt.divisor-functions', function (R, ctx) {
    var shape = by(ctx, 'tau', R.pick(['sigma', 'tau']), R.pick(['smallest', 'sigma']));
    var n, f;
    if (shape === 'tau') {
      do { n = R.pick([2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 27, 36]) * R.pick([5, 7, 10, 11, 14, 15, 25, 35, 49]); } while (n > 3000 || factor(n).length < 2);
      if (ctx.level >= 2) n *= R.pick([1, 3, 4, 11]);
      f = factor(n);
      return { q: 'How many positive divisors does $' + cm(n) + '$ have?', a: num(tau(n)),
        steps: ['$' + cm(n) + ' = ' + fx(n) + '$.', 'A divisor chooses each prime\'s exponent independently: ' + f.map(function (x) { return 'the exponent of ' + x[0] + ' can be $0$ to $' + x[1] + '$ (' + (x[1] + 1) + ' choices)'; }).join('; ') + '.', '$\\tau(' + cm(n) + ') = ' + f.map(function (x) { return '(' + x[1] + ' + 1)'; }).join('') + ' = ' + tau(n) + '$.'],
        hint: 'Factor first. Each exponent $a$ gives $a + 1$ choices, because the prime can also appear to the power 0.' };
    }
    if (shape === 'sigma') {
      do { n = R.pick([4, 8, 9, 12, 16, 18, 20, 24, 27, 28, 32, 36, 45, 48, 50, 54, 60, 72, 75, 80, 96, 100, 108, 112, 120, 144, 150, 180, 200, 225, 240, 250]) * R.pick([1, 1, 7, 11]); } while (n > 2000 || factor(n).length < 2);
      f = factor(n);
      var parts = f.map(function (x) { var t = []; for (var k = 0; k <= x[1]; k++) t.push(k === 0 ? '1' : k === 1 ? String(x[0]) : x[0] + '^{' + k + '}'); return '(' + t.join(' + ') + ')'; });
      var vals = f.map(function (x) { return (Math.pow(x[0], x[1] + 1) - 1) / (x[0] - 1); });
      return { q: 'Find $\\sigma(' + cm(n) + ')$, the sum of the positive divisors of $' + cm(n) + '$.', a: num(sigma(n)),
        steps: ['$' + cm(n) + ' = ' + fx(n) + '$.', 'Every divisor is a product of one term from each bracket, so $\\sigma(' + cm(n) + ') = ' + parts.join('') + '$.', 'Each bracket is a geometric sum, $\\dfrac{p^{a+1} - 1}{p - 1}$: ' + vals.join(' \\cdot ').replace(/^/, '$') + ' = ' + cm(sigma(n)) + '$.'],
        hint: 'Write $\\sigma$ as a product of one geometric sum per prime.' };
    }
    var K = R.pick([6, 8, 9, 10, 12, 14, 15, 16, 18, 20]), ans = smallestWithDivisors(K), mp = multParts(K), PR = [2, 3, 5, 7, 11, 13];
    var cands = mp.map(function (fs) { var v = 1; fs.forEach(function (fv, i) { v *= Math.pow(PR[i], fv - 1); }); return { fs: fs, v: v }; });
    var best = cands.reduce(function (m, c) { return c.v < m.v ? c : m; });
    if (best.v !== ans) throw new Error('smallest divisor count mismatch');
    return { q: 'What is the smallest positive integer with exactly $' + K + '$ positive divisors?', a: num(ans),
      steps: ['If $n = p_1^{a_1} \\cdots p_k^{a_k}$, then $\\tau(n) = (a_1 + 1) \\cdots (a_k + 1)$. So write $' + K + '$ as a product of factors, each at least 2: ' + mp.map(function (fs) { return '$' + fs.join(' \\cdot ') + '$'; }).join(', ') + '.', 'For the smallest $n$, give the biggest exponent to the smallest prime: ' + cands.map(function (c) { return '$' + c.fs.map(function (fv, i) { return fv - 1 > 1 ? PR[i] + '^{' + (fv - 1) + '}' : String(PR[i]); }).join(' \\cdot ') + ' = ' + cm(c.v) + '$'; }).join(', ') + '.', 'The smallest is <b>' + cm(ans) + '</b>.'],
      hint: 'Match the exponents plus one to a factorization of ' + K + '.' };
  });

  G('nt.perfect-numbers', function (R, ctx) {
    var shape = by(ctx, 'classify', R.pick(['euclid', 'mersenne', 'classify', 'aliquot']), R.pick(['spf', 'mersenne', 'aliquot']));
    if (shape === 'aliquot') {
      var na; do { na = R.int(12, 300); } while (isPrime(na) || factor(na).length < 2);
      var pd = divisors(na).slice(0, -1);
      return { q: 'Find the sum of the proper divisors of $' + na + '$ (all positive divisors except $' + na + '$ itself).', a: num(sigma(na) - na), steps: ['$' + na + ' = ' + fx(na) + '$, so $\\sigma(' + na + ') = ' + factor(na).map(function (x) { return (Math.pow(x[0], x[1] + 1) - 1) / (x[0] - 1); }).join(' \\cdot ') + ' = ' + sigma(na) + '$.', 'Leave out ' + na + ' itself: $' + sigma(na) + ' - ' + na + ' = ' + (sigma(na) - na) + '$. (The proper divisors are ' + pd.join(', ') + '.)', (sigma(na) - na) === na ? 'That equals ' + na + ': it is perfect.' : (sigma(na) - na) > na ? 'That is more than ' + na + ', so ' + na + ' is abundant.' : 'That is less than ' + na + ', so ' + na + ' is deficient.'], hint: 'Compute $\\sigma(' + na + ')$ from the factorization and subtract ' + na + '.' };
    }
    if (shape === 'classify') {
      var cat = R.pick([0, 1, 2, 2, 0]), pool = []; for (var x0 = 6; x0 <= 200; x0++) { var sx = sigma(x0); if ((sx === 2 * x0 ? 1 : sx > 2 * x0 ? 2 : 0) === cat && (cat || !isPrime(x0))) pool.push(x0); }
      var n = R.pick(pool), s = sigma(n), cls = s === 2 * n ? 1 : s > 2 * n ? 2 : 0, f = factor(n);
      return { q: 'Is $' + n + '$ deficient ($\\sigma(n) < 2n$), perfect ($\\sigma(n) = 2n$) or abundant ($\\sigma(n) > 2n$)?', a: { t: 'mc', choices: ['deficient', 'perfect', 'abundant'], v: cls, keep: true },
        steps: ['$' + n + ' = ' + fx(n) + '$, so $\\sigma(' + n + ') = ' + f.map(function (x) { return (Math.pow(x[0], x[1] + 1) - 1) / (x[0] - 1); }).join(' \\cdot ') + ' = ' + s + '$.', 'Compare with $2 \\cdot ' + n + ' = ' + 2 * n + '$: ' + (cls === 1 ? 'equal, so ' + n + ' is <b>perfect</b>.' : cls === 2 ? '$' + s + ' > ' + 2 * n + '$, so <b>abundant</b>.' : '$' + s + ' < ' + 2 * n + '$, so <b>deficient</b>.'), '(Equivalently: the divisors smaller than ' + n + ' add up to $' + (s - n) + '$.)'],
        hint: 'Find $\\sigma(' + n + ')$ from the factorization and compare it with $' + 2 * n + '$.' };
    }
    if (shape === 'euclid') {
      var pe = R.pick([2, 3, 5, 7, 13]), Mp = Math.pow(2, pe) - 1, N = Math.pow(2, pe - 1) * Mp;
      return { q: '$2^{' + pe + '} - 1 = ' + cm(Mp) + '$ is prime. Which perfect number does Euclid\'s formula $2^{p-1}(2^{p} - 1)$ give?', a: num(N),
        steps: ['$N = 2^{' + (pe - 1) + '} \\cdot ' + cm(Mp) + ' = ' + cm(Math.pow(2, pe - 1)) + ' \\cdot ' + cm(Mp) + ' = ' + cm(N) + '$.', 'Check: $\\sigma(N) = \\sigma(2^{' + (pe - 1) + '})\\,\\sigma(' + cm(Mp) + ') = (2^{' + pe + '} - 1)(' + cm(Mp) + ' + 1) = ' + cm(Mp) + ' \\cdot 2^{' + pe + '} = 2N$.'],
        hint: 'Multiply $2^{' + (pe - 1) + '}$ by the Mersenne prime.' };
    }
    if (shape === 'mersenne') {
      var pm = R.pick([3, 4, 5, 6, 7, 9, 11, 13]), M2 = Math.pow(2, pm) - 1, pr = isPrime(M2), st = [];
      if (!isPrime(pm)) { var a1 = spf(pm), f1 = Math.pow(2, a1) - 1; st.push('The exponent $' + pm + ' = ' + a1 + ' \\cdot ' + (pm / a1) + '$ is not prime, and $2^{' + a1 + '} - 1 = ' + f1 + '$ divides $2^{' + pm + '} - 1$ (because $x - 1$ divides $x^{' + (pm / a1) + '} - 1$, with $x = 2^{' + a1 + '}$).'); st.push('Indeed $' + M2 + ' = ' + f1 + ' \\cdot ' + M2 / f1 + '$: <b>false</b>.'); }
      else if (!pr) st.push('The exponent ' + pm + ' is prime, but that is not enough: $2^{' + pm + '} - 1 = ' + cm(M2) + ' = ' + fx(M2) + '$. <b>False.</b>');
      else st.push('No prime up to $\\sqrt{' + cm(M2) + '} \\approx ' + T.dec(Math.sqrt(M2), 1) + '$ divides $' + cm(M2) + '$, so it is prime: <b>true</b>.');
      return { q: 'True or false: $2^{' + pm + '} - 1$ is prime.', a: tf(pr), steps: ['$2^{' + pm + '} - 1 = ' + cm(M2) + '$.'].concat(st), hint: 'If the exponent factors as $ab$, then $2^{a} - 1$ is a factor. A prime exponent still has to be checked.' };
    }
    var ne = R.pick([4, 6, 8, 9, 10, 11, 12, 14, 15, 21]), V2 = Math.pow(2, ne) - 1, q0 = spf(V2), tried = primes(3, q0 - 1);
    return { q: 'What is the smallest prime factor of $2^{' + ne + '} - 1$?', a: num(q0),
      steps: ['$2^{' + ne + '} - 1 = ' + cm(V2) + '$, an odd number.', tried.length ? 'Try odd primes in order: ' + tried.map(function (x) { return x + ' leaves remainder ' + (V2 % x); }).join(', ') + '.' : 'Try 3 first.', '$' + cm(V2) + ' = ' + q0 + ' \\cdot ' + cm(V2 / q0) + '$, so the answer is <b>' + q0 + '</b>.' + (isPrime(ne) ? '' : ' (A shortcut: when $a \\mid ' + ne + '$, $2^{a} - 1$ divides $2^{' + ne + '} - 1$.)')],
      hint: 'If $a$ divides the exponent, $2^{a} - 1$ is a factor. Use that to guess, then check smaller primes.' };
  });

  function legendreExp(n, pr) { var e = 0, pk = pr, terms = []; while (pk <= n) { terms.push(Math.floor(n / pk)); e += Math.floor(n / pk); pk *= pr; } return { e: e, terms: terms }; }
  function legTex(n, pr) { var L = legendreExp(n, pr), parts = L.terms.map(function (t, i) { return '\\left\\lfloor \\frac{' + n + '}{' + (i ? pr + '^{' + (i + 1) + '}' : pr) + '} \\right\\rfloor'; }); return '$' + parts.join(' + ') + ' = ' + L.terms.join(' + ') + ' = ' + L.e + '$'; }
  G('nt.factorial-primes', function (R, ctx) {
    var shape = by(ctx, 'exp', R.pick(['zeros', 'exp']), R.pick(['power', 'zeros']));
    var n, pr, L;
    if (shape === 'exp') {
      pr = R.pick([2, 3, 5, 7]); n = R.int(pr === 7 ? 50 : 20, 60) + (ctx.level > 1 ? R.int(0, 60) : 0); L = legendreExp(n, pr);
      return { q: 'What is the largest $k$ with $' + pr + '^{k} \\mid ' + n + '!$?', a: num(L.e),
        steps: ['Count factors of ' + pr + ' among $1, 2, \\dots, ' + n + '$: every multiple of ' + pr + ' gives one, every multiple of $' + pr + '^{2}$ gives one more, and so on.', 'Legendre\'s formula: ' + legTex(n, pr) + '.'],
        hint: 'Add $\\lfloor n/p \\rfloor + \\lfloor n/p^{2} \\rfloor + \\cdots$ until the terms are 0.' };
    }
    if (shape === 'zeros') {
      n = R.int(30, 1000); L = legendreExp(n, 5);
      return { q: 'How many zeros does $' + n + '!$ end with?', a: num(L.e),
        steps: ['Each final zero is a factor $10 = 2 \\cdot 5$. There are more 2s than 5s in $' + n + '!$, so count the 5s.', legTex(n, 5) + '. Multiples of 25 give two 5s, of 125 three, and so on.', 'So $' + n + '!$ ends in <b>' + L.e + '</b> zeros.'],
        hint: 'Count the factors of 5, remembering that 25, 50, 75, … each bring an extra 5.' };
    }
    var m = R.pick([4, 6, 8, 9, 12, 18, 15, 10]); n = R.int(10, 80); var fm = factor(m), best = Infinity, parts = [];
    fm.forEach(function (x) { var e = legendreExp(n, x[0]).e, k = Math.floor(e / x[1]); best = Math.min(best, k); parts.push('the exponent of ' + x[0] + ' in $' + n + '!$ is ' + legTex(n, x[0]) + (x[1] > 1 ? ', which allows $\\lfloor ' + e + '/' + x[1] + ' \\rfloor = ' + k + '$ copies of $' + x[0] + '^{' + x[1] + '}$' : '')); });
    return { q: 'What is the largest $k$ with $' + m + '^{k} \\mid ' + n + '!$?', a: num(best),
      steps: ['$' + m + ' = ' + fx(m) + '$.', parts.join('; ') + '.', 'Each copy of $' + m + '$ needs ' + fm.map(function (x) { return x[1] > 1 ? x[1] + ' factors of ' + x[0] : 'one ' + x[0]; }).join(' and ') + ', so the scarcer prime decides: $k = ' + best + '$.'],
      hint: 'Factor ' + m + ', count each prime in ' + n + '! with Legendre\'s formula, and see which prime runs out first.' };
  });

  G('nt.infinitely-many-primes', function (R, ctx) {
    var shape = by(ctx, 'spfN', R.pick(['mcStep', 'tf', 'spfN', 'mod4']), R.pick(['fact', 'big', 'mod4']));
    if (shape === 'mod4') {
      var l4 = R.sample([3, 7, 11, 19, 23], R.int(1, 3)).sort(function (a, b) { return a - b; }), P4 = l4.reduce(function (s, x) { return s * x; }, 1), N4 = 4 * P4 - 1, fs4 = factor(N4), q4 = fs4.filter(function (x) { return x[0] % 4 === 3; })[0][0];
      return { q: 'Let $N = 4 \\cdot ' + l4.join(' \\cdot ') + ' - 1$. What is the smallest prime factor of $N$ that is $\\equiv 3' + pmod(4) + '$?', a: num(q4),
        steps: ['$N = ' + cm(N4) + '$, which is $\\equiv 3' + pmod(4) + '$.', 'If every prime factor of $N$ were $\\equiv 1' + pmod(4) + '$, then $N$ would be $\\equiv 1$ too. So some prime factor is $\\equiv 3' + pmod(4) + '$, and it is not on the list: each listed prime divides $4 \\cdot ' + cm(P4) + '$, so it leaves remainder $-1$, not $0$, when it divides $N$.', '$' + cm(N4) + ' = ' + fx(N4) + '$, and the smallest factor that is $\\equiv 3' + pmod(4) + '$ is <b>' + q4 + '</b>. This is the idea behind "infinitely many primes of the form $4k + 3$".'],
        hint: 'Factor $N$ and reduce each prime factor mod 4.' };
    }
    if (shape === 'spfN' || shape === 'big') {
      var list = shape === 'big' ? R.pick([[2, 3, 5, 7, 11, 13], [2, 3, 5, 7, 11], [3, 5, 7, 11], [2, 5, 7, 11, 13], [3, 5, 7, 11, 13]]) : R.sample([2, 3, 5, 7, 11, 13, 17, 19], R.int(2, 4)).sort(function (a, b) { return a - b; });
      if (shape === 'spfN' && list.reduce(function (s, x) { return s * x; }, 1) > 3000) list = list.slice(0, 3);
      var P = list.reduce(function (s, x) { return s * x; }, 1), N = P + 1, q = spf(N);
      return { q: 'Let $N = ' + list.join(' \\cdot ') + ' + 1$. What is the smallest prime factor of $N$?', a: num(q),
        steps: ['$N = ' + cm(P) + ' + 1 = ' + cm(N) + '$.', 'Each of ' + list.join(', ') + ' divides $' + cm(P) + '$, so each leaves remainder 1 when it divides $N$. None of them is a factor.', q === N ? 'Testing the other primes up to $\\sqrt{' + cm(N) + '}$ finds no factor, so $N$ is itself prime: the answer is <b>' + cm(N) + '</b>, a prime not on the list.' : 'Testing the other primes in order: $' + cm(N) + ' = ' + q + ' \\cdot ' + cm(N / q) + '$. The smallest prime factor is <b>' + q + '</b>, which is not on the list.', 'Either way $N$ has a prime factor missing from the list, which is the heart of Euclid\'s proof.'],
        hint: 'None of the listed primes can divide $N$. Start testing with the smallest prime not on the list.' };
    }
    if (shape === 'mcStep') {
      return { q: 'Euclid\'s proof: suppose $p_1, p_2, \\dots, p_k$ were all the primes, and let $N = p_1 p_2 \\cdots p_k + 1$. Which step comes next?', a: mcA('$N > 1$, so $N$ has a prime factor $q$; $q$ cannot be any $p_i$, since each $p_i$ leaves remainder 1 when it divides $N$.', ['$N$ is prime, so it is a new prime not on the list.', '$N$ is even, so 2 divides it, and 2 was already on the list.', '$N$ is larger than every $p_i$, so $N$ must be prime.']),
        steps: ['$N$ need not be prime ($2 \\cdot 3 \\cdot 5 \\cdot 7 \\cdot 11 \\cdot 13 + 1 = 30031 = 59 \\cdot 509$), so "N is prime" is not a valid step.', 'What is always true: $N > 1$ has some prime factor $q$ (by factorization into primes).', 'If $q = p_i$, then $q$ divides both $N$ and $p_1 \\cdots p_k$, so it divides their difference, 1. Impossible. So $q$ is a prime missing from the list: the contradiction.'],
        hint: 'Is $N$ always prime? What is true of every integer above 1?' };
    }
    if (shape === 'tf') {
      var lst = R.pick([[2, 3, 5, 7, 11, 13], [3, 5], [2, 7], [5, 7], [3, 7], [2, 3, 5, 7, 11]]), P2 = lst.reduce(function (s, x) { return s * x; }, 1), N2 = P2 + 1, isP = isPrime(N2);
      return { q: 'True or false: $' + lst.join(' \\cdot ') + ' + 1$ is prime.', a: tf(isP),
        steps: ['$' + lst.join(' \\cdot ') + ' + 1 = ' + cm(N2) + '$.', isP ? 'No prime up to $\\sqrt{' + cm(N2) + '}$ divides it, so it is prime: <b>true</b>.' : '$' + cm(N2) + ' = ' + fx(N2) + '$: <b>false</b>.', 'Euclid\'s argument only says the number has a prime factor that is not on the list; the number itself may or may not be prime.'],
        hint: 'Compute it and look for a small factor. None of the listed primes will divide it.' };
    }
    var nf = R.int(3, 10), F = U.factorial(nf) + 1, qf = spf(F);
    return { q: 'What is the smallest prime factor of $' + nf + '! + 1$?', a: num(qf),
      steps: ['$' + nf + '! + 1 = ' + cm(F) + '$.', 'Every prime $p \\le ' + nf + '$ divides $' + nf + '!$, so it leaves remainder 1 when it divides $' + nf + '! + 1$. The smallest prime factor must be larger than ' + nf + '.', qf === F ? cm(F) + ' is prime.' : 'Testing primes above ' + nf + ': $' + cm(F) + ' = ' + fx(F) + '$, so the answer is <b>' + qf + '</b>.'],
      hint: 'No prime up to ' + nf + ' can divide it. Start testing just above ' + nf + '.' };
  });

  var PI_TABLE = { 3: 168, 4: 1229, 5: 9592, 6: 78498, 7: 664579, 8: 5761455, 9: 50847534 };
  G('nt.prime-counting', function (R, ctx) {
    var shape = by(ctx, R.pick(['count', 'meaning']), R.pick(['est', 'run', 'divides']), R.pick(['ratio', 'gap', 'est']));
    if (shape === 'count') {
      var N = R.int(20, 70), ps = primes(2, N);
      return { q: 'Find $\\pi(' + N + ')$, the number of primes up to $' + N + '$.', a: num(ps.length), steps: ['List them (a sieve up to ' + N + ' only needs the primes up to $\\sqrt{' + N + '} \\approx ' + T.dec(Math.sqrt(N), 1) + '$): ' + ps.join(', ') + '.', 'There are <b>' + ps.length + '</b>, so $\\pi(' + N + ') = ' + ps.length + '$.'], hint: 'Cross out multiples of 2, 3, 5 and 7, then count what is left (1 is not prime).' };
    }
    if (shape === 'meaning') {
      return { q: 'Which statement about the prime number theorem is correct?', a: mcA('The ratio $\\pi(x) \\big/ \\dfrac{x}{\\ln x}$ gets closer and closer to 1 as $x$ grows.', ['$\\pi(x) = \\dfrac{x}{\\ln x}$ exactly, rounded to a whole number.', 'The difference $\\pi(x) - \\dfrac{x}{\\ln x}$ shrinks to 0 as $x$ grows.', 'There are at least $\\dfrac{x}{\\ln x}$ primes in every interval of length $x$.']),
        steps: ['The theorem is about the <b>ratio</b>: $\\pi(x) \\sim x/\\ln x$ means $\\pi(x) \\big/ (x/\\ln x) \\to 1$.', 'It is not exact: $\\pi(10^{6}) = 78{,}498$ while $10^{6}/\\ln 10^{6} \\approx 72{,}382$.', 'The difference actually grows (here it is about 6,000); only the relative error shrinks.'],
        hint: 'Is the estimate exact? Which goes to 0: the difference or the relative error?' };
    }
    if (shape === 'est') {
      var k = R.int(3, 9), x = Math.pow(10, k), est = x / (k * 2.302585), ans = Math.round(est);
      return { q: 'Estimate the number of primes up to $10^{' + k + '}$ with $\\dfrac{x}{\\ln x}$. Use $\\ln 10 \\approx 2.302585$ and round to the nearest whole number.', a: { t: 'num', v: String(ans), tol: Math.max(1, Math.round(ans * 2e-4)) },
        steps: ['$\\ln 10^{' + k + '} = ' + k + ' \\ln 10 \\approx ' + T.dec(k * 2.302585, 4) + '$.', '$\\dfrac{10^{' + k + '}}{' + T.dec(k * 2.302585, 4) + '} \\approx ' + cm(ans) + '$.', 'The true count is $\\pi(10^{' + k + '}) = ' + cm(PI_TABLE[k]) + '$: the estimate is about ' + T.dec(100 * (PI_TABLE[k] - est) / PI_TABLE[k], 1) + '% low. It is an estimate, not the exact count.'],
        hint: '$\\ln(10^{k}) = k \\ln 10$.' };
    }
    if (shape === 'run' || shape === 'divides') {
      var m = R.int(4, 6), F = U.factorial(m + 1);
      if (shape === 'run') return { q: 'The numbers $' + (m + 1) + '! + 2,\\ ' + (m + 1) + '! + 3,\\ \\dots,\\ ' + (m + 1) + '! + ' + (m + 1) + '$ are ' + m + ' consecutive composite numbers. What is the first of them?', a: num(F + 2), steps: ['$' + (m + 1) + '! = ' + cm(F) + '$, so the run is $' + cm(F + 2) + '$ to $' + cm(F + m + 1) + '$.', 'Each is composite: $j$ divides both $' + (m + 1) + '!$ and $j$, so $j \\mid ' + (m + 1) + '! + j$ for $2 \\le j \\le ' + (m + 1) + '$.', 'The first is <b>' + cm(F + 2) + '</b>. (Gaps between primes can be as long as you like.)'], hint: 'Compute $' + (m + 1) + '!$ and add 2.' };
      var j = R.int(2, m + 1), wr = [j + 1, j + 2, j + 3, j - 1, 11, 13].filter(function (w) { return w > 1 && w !== j && (F + j) % w !== 0; }).slice(0, 3);
      return { q: 'Which number divides $' + (m + 1) + '! + ' + j + '$?', a: mcA(String(j), wr.map(String)), steps: ['$' + j + '$ divides $' + (m + 1) + '! = 1 \\cdot 2 \\cdots ' + (m + 1) + '$ (it is one of the factors), and it divides $' + j + '$.', 'So $' + j + '$ divides the sum: $' + (m + 1) + '! + ' + j + ' = ' + cm(F + j) + ' = ' + j + ' \\cdot ' + cm((F + j) / j) + '$. The other choices leave remainders.'], hint: 'Which choice divides both terms of the sum?' };
    }
    if (shape === 'ratio') {
      var k2 = R.int(3, 9), x2 = Math.pow(10, k2), e2 = x2 / Math.log(x2), r2 = PI_TABLE[k2] / e2;
      return { q: '$\\pi(10^{' + k2 + '}) = ' + cm(PI_TABLE[k2]) + '$. Find the ratio $\\pi(x) \\big/ \\dfrac{x}{\\ln x}$ at $x = 10^{' + k2 + '}$, to 2 decimal places.', a: { t: 'num', v: r2.toFixed(2), dp: 2 },
        steps: ['$\\dfrac{x}{\\ln x} = \\dfrac{10^{' + k2 + '}}{' + k2 + ' \\ln 10} \\approx ' + cm(Math.round(e2)) + '$.', '$\\dfrac{' + cm(PI_TABLE[k2]) + '}{' + cm(Math.round(e2)) + '} \\approx ' + r2.toFixed(4) + '$, which rounds to $' + r2.toFixed(2) + '$.', 'The prime number theorem says this ratio tends to 1, slowly: it is 1.16 at $10^{3}$ and 1.05 at $10^{9}$.'],
        hint: 'First compute $x/\\ln x$ with $\\ln 10^{k} = k \\ln 10$.' };
    }
    var g = R.pick([4, 6, 8, 10, 14]), ps2 = primes(2, 2000), st0 = 0;
    for (var i = 0; i + 1 < ps2.length; i++) if (ps2[i + 1] - ps2[i] >= g) { st0 = ps2[i]; break; }
    var nx = ps2[ps2.indexOf(st0) + 1];
    return { q: 'What is the smallest prime $p$ whose next prime is at least $p + ' + g + '$?', a: num(st0),
      steps: ['Walk through the primes and look at the gaps: ' + ps2.slice(0, ps2.indexOf(st0) + 2).slice(-8).join(', ') + ', …', 'The first gap of at least ' + g + ' is from ' + st0 + ' to ' + nx + ' (a gap of ' + (nx - st0) + ').', 'So $p = ' + st0 + '$. Gaps grow, on average, like $\\ln p$.'],
      hint: 'List primes in order and watch the differences.' };
  });


  // ================================================================ Unit 3: congruences
  function resSteps(a, n) { var q = Math.floor(a / n), r = a - n * q; return { r: r, line: '$' + divTex(a, n, q, r) + '$, so $' + cm(a) + ' \\equiv ' + r + pmod(n) + '$' }; }
  G('nt.congruence', function (R, ctx) {
    var shape = by(ctx, 'res', R.pick(['neg', 'tf']), R.pick(['moduli', 'tf', 'neg']));
    var n = R.int(3, 13), a, r, s;
    if (shape === 'res' || shape === 'neg') {
      a = shape === 'res' ? R.int(20, 300) : -R.int(5, 200); if (mod(a, n) === 0) a += shape === 'res' ? 1 : -1;
      s = resSteps(a, n);
      return { q: 'Find the least nonnegative residue of $' + a + '$ mod $' + n + '$: the $r$ with $0 \\le r < ' + n + '$ and $' + a + ' \\equiv r' + pmod(n) + '$.', a: num(s.r),
        steps: [a < 0 ? 'Divide with a remainder that is not negative: $' + n + ' \\cdot ' + p(Math.floor(a / n)) + ' = ' + n * Math.floor(a / n) + '$ is the largest multiple of $' + n + '$ at or below $' + a + '$.' : 'Divide by $' + n + '$.', s.line + '.', 'Check: $' + n + ' \\mid (' + a + ' - ' + s.r + ') = ' + (a - s.r) + '$.'],
        hint: a < 0 ? 'Add multiples of $' + n + '$ to $' + a + '$ until you land between 0 and ' + (n - 1) + '.' : 'Find the remainder when $' + a + '$ is divided by $' + n + '$.' };
    }
    if (shape === 'tf') {
      a = -R.int(1, n - 1) - n * R.int(0, 3); var good = R.coin(), b = good ? mod(a, n) + n * R.int(0, 2) : (R.coin() ? -a : mod(a, n) + R.int(1, n - 1));
      if (!good && mod(b - a, n) === 0) b++;
      var ok = mod(a - b, n) === 0;
      return { q: 'True or false: $' + a + ' \\equiv ' + b + pmod(n) + '$.', a: tf(ok),
        steps: ['$a \\equiv b' + pmod(n) + '$ means $' + n + ' \\mid (a - b)$.', '$' + a + ' - ' + p(b) + ' = ' + (a - b) + '$. ' + (ok ? 'That is a multiple of $' + n + '$: <b>true</b>.' : 'That is not a multiple of $' + n + '$: <b>false</b>.'), 'Another way: $' + a + '$ leaves remainder $' + mod(a, n) + '$ and $' + b + '$ leaves remainder $' + mod(b, n) + '$.'],
        hint: 'Subtract and ask whether $' + n + '$ divides the difference. Signs matter.' };
    }
    var D = R.pick([12, 18, 20, 24, 28, 30, 36, 40]), b2 = R.int(3, 40), a2 = b2 + D * (R.coin() ? 1 : -1), dv = divisors(D).filter(function (x) { return x > 1; });
    return { q: 'Find every modulus $n > 1$ for which $' + a2 + ' \\equiv ' + b2 + ' \\pmod{n}$.', a: setA(dv),
      steps: ['$' + a2 + ' \\equiv ' + b2 + ' \\pmod{n}$ exactly when $n \\mid (' + a2 + ' - ' + b2 + ') = ' + (a2 - b2) + '$.', 'So $n$ is any divisor of $' + D + '$ larger than 1: ' + dv.join(', ') + '.'],
      hint: 'Turn the congruence into a divisibility statement about $' + a2 + ' - ' + b2 + '$.' };
  });

  G('nt.modular-arithmetic', function (R, ctx) {
    var shape = by(ctx, R.pick(['sum', 'prod']), R.pick(['expr', 'prod', 'power']), R.pick(['lastdigit', 'cancel', 'expr']));
    var n = R.int(5, 13), a, b, c, A, B, C, v;
    if (shape === 'sum' || shape === 'prod') {
      a = R.int(25, 999); b = R.int(25, 999); A = mod(a, n); B = mod(b, n); var add = shape === 'sum';
      v = add ? mod(a + b, n) : mulmod(a, b, n);
      return { q: 'Find $' + (add ? cm(a) + ' + ' + cm(b) : cm(a) + ' \\cdot ' + cm(b)) + '$ mod $' + n + '$ (the least nonnegative residue).', a: num(v),
        steps: ['Reduce first: ' + resSteps(a, n).line + ', and ' + resSteps(b, n).line + '.', 'Then $' + (add ? A + ' + ' + B + ' = ' + (A + B) : A + ' \\cdot ' + B + ' = ' + A * B) + ' \\equiv ' + v + pmod(n) + '$.', 'This works because congruences can be added and multiplied: if $a \\equiv A$ and $b \\equiv B$, then $a ' + (add ? '+' : '\\cdot') + ' b \\equiv A ' + (add ? '+' : '\\cdot') + ' B' + pmod(n) + '$.'],
        hint: 'Replace each number by its remainder mod ' + n + ' before you ' + (add ? 'add' : 'multiply') + '.' };
    }
    if (shape === 'expr') {
      a = -R.int(10, 99); b = R.int(10, 99); c = R.int(10, 99); A = mod(a, n); B = mod(b, n); C = mod(c, n); v = mod(a * b + c, n);
      return { q: 'Find $' + p(a) + ' \\cdot ' + b + ' + ' + c + '$ mod $' + n + '$ (the least nonnegative residue).', a: num(v),
        steps: ['Reduce each number: $' + a + ' \\equiv ' + A + '$, $' + b + ' \\equiv ' + B + '$, $' + c + ' \\equiv ' + C + pmod(n) + '$.', '$' + A + ' \\cdot ' + B + ' + ' + C + ' = ' + (A * B + C) + ' \\equiv ' + v + pmod(n) + '$.', 'Check with the full numbers: $' + p(a) + ' \\cdot ' + b + ' + ' + c + ' = ' + (a * b + c) + '$, and $' + (a * b + c) + ' = ' + n + ' \\cdot ' + p(Math.floor((a * b + c) / n)) + (v ? ' + ' + v : '') + '$.'],
        hint: 'A negative number reduces to a residue from 0 to ' + (n - 1) + ' too: add multiples of ' + n + '.' };
    }
    if (shape === 'power') {
      a = R.int(20, 99); var e = R.int(3, 4); A = mod(a, n); if (A === 0 || A === 1) { a++; A = mod(a, n); } v = powmod(a, e, n);
      var chain = [], x = A; for (var k = 2; k <= e; k++) { var nx = mulmod(x, A, n); chain.push('$' + x + ' \\cdot ' + A + ' = ' + x * A + ' \\equiv ' + nx + '$'); x = nx; }
      return { q: 'Find $' + a + '^{' + e + '}$ mod $' + n + '$.', a: num(v),
        steps: ['$' + a + ' \\equiv ' + A + pmod(n) + '$, so $' + a + '^{' + e + '} \\equiv ' + A + '^{' + e + '}$.', 'Multiply one factor at a time and reduce each time: ' + chain.join(', ') + '.', 'So $' + a + '^{' + e + '} \\equiv ' + v + pmod(n) + '$.'],
        hint: 'Reduce the base first, then multiply step by step.' };
    }
    if (shape === 'lastdigit') {
      var xs = [R.int(100, 9999), R.int(100, 9999), R.int(100, 9999)], ds = xs.map(function (x) { return x % 10; });
      v = (ds[0] * ds[1] * ds[2]) % 10;
      return { q: 'What is the last digit of $' + xs.map(cm).join(' \\cdot ') + '$?', a: num(v),
        steps: ['The last digit is the residue mod 10, and each factor is congruent to its own last digit: ' + ds.join(', ') + '.', '$' + ds[0] + ' \\cdot ' + ds[1] + ' = ' + ds[0] * ds[1] + ' \\equiv ' + (ds[0] * ds[1]) % 10 + '$, then $' + (ds[0] * ds[1]) % 10 + ' \\cdot ' + ds[2] + ' = ' + ((ds[0] * ds[1]) % 10) * ds[2] + ' \\equiv ' + v + pmod(10) + '$.', 'The last digit is <b>' + v + '</b>.'],
        hint: 'Work mod 10: only the last digits matter.' };
    }
    var nn = R.pick([6, 8, 9, 10, 12, 14, 15]), cc = R.int(2, nn - 1), ok = gcd(cc, nn) === 1, g = gcd(cc, nn);
    return { q: 'True or false: if $' + cc + 'x \\equiv ' + cc + 'y' + pmod(nn) + '$, then $x \\equiv y' + pmod(nn) + '$.', a: tf(ok),
      steps: ok ? ['$' + nn + ' \\mid ' + cc + '(x - y)$ and $\\gcd(' + cc + ', ' + nn + ') = 1$, so $' + nn + '$ shares no prime with $' + cc + '$ and must divide $x - y$.', '<b>True</b>: you may cancel a factor that is coprime to the modulus (it has an inverse).'] : ['$\\gcd(' + cc + ', ' + nn + ') = ' + g + '$, so cancelling can fail.', 'Take $x = ' + (nn / g) + '$ and $y = 0$: $' + cc + ' \\cdot ' + (nn / g) + ' = ' + cc * nn / g + ' \\equiv 0 \\equiv ' + cc + ' \\cdot 0' + pmod(nn) + '$, but $' + (nn / g) + ' \\not\\equiv 0' + pmod(nn) + '$. <b>False.</b>', 'What is true: $x \\equiv y \\pmod{' + (nn / g) + '}$ (divide the modulus by the gcd too).'],
      hint: 'Can you find $x \\not\\equiv y$ with $' + cc + 'x \\equiv ' + cc + 'y$? Look at $\\gcd(' + cc + ', ' + nn + ')$.' };
  });

  G('nt.divisibility-tests', function (R, ctx) {
    var shape = by(ctx, R.pick(['mod9', 'mod3']), R.pick(['mod11', 'mod11', 'mod9']), R.pick(['digit11', 'digit9', 'mod11']));
    var len, ds, n, s, v;
    if (shape === 'mod9' || shape === 'mod3') {
      var m = shape === 'mod9' ? 9 : 3; len = R.int(5, 7); n = R.int(Math.pow(10, len - 1), Math.pow(10, len) - 1); ds = digitsOf(n); s = U.sum(ds); v = n % m;
      return { q: 'What remainder does $' + cm(n) + '$ leave when divided by $' + m + '$?', a: num(v),
        steps: ['Since $10 \\equiv 1' + pmod(m) + '$, every power of 10 is $\\equiv 1$, so a number is congruent to the sum of its digits.', 'Digit sum: $' + ds.join(' + ') + ' = ' + s + '$.', '$' + s + ' = ' + m + ' \\cdot ' + Math.floor(s / m) + ' + ' + (s % m) + '$, so the remainder is <b>' + v + '</b>.'],
        hint: 'Add the digits, then reduce mod ' + m + '.' };
    }
    if (shape === 'mod11') {
      len = R.int(4, 7); n = R.int(Math.pow(10, len - 1), Math.pow(10, len) - 1); ds = digitsOf(n).reverse(); v = n % 11;
      var alt = 0, terms = ds.map(function (d, i) { alt += i % 2 ? -d : d; return (i === 0 ? '' : i % 2 ? ' - ' : ' + ') + d; }).join('');
      return { q: 'What remainder does $' + cm(n) + '$ leave when divided by $11$?', a: num(v),
        steps: ['Since $10 \\equiv -1' + pmod(11) + '$, the powers $10^{0}, 10^{1}, 10^{2}, \\dots$ are $\\equiv 1, -1, 1, \\dots$', 'So add and subtract the digits <b>starting from the ones digit</b>: $' + terms + ' = ' + alt + '$.', '$' + alt + ' \\equiv ' + v + pmod(11) + '$' + (alt < 0 ? ' (add multiples of 11 to make it nonnegative)' : '') + '. The remainder is <b>' + v + '</b>.'],
        hint: 'Alternate signs from the right: $+$ones, $-$tens, $+$hundreds, …' };
    }
    if (shape === 'digit11') {
      var tries = 0, pos, base;
      do { len = R.int(5, 6); n = R.int(Math.pow(10, len - 1), Math.pow(10, len) - 1); pos = R.int(1, len - 2); ds = digitsOf(n); ds[pos] = 0; base = Number(ds.join('')); var w = Math.pow(10, len - 1 - pos); var dd = []; for (var d = 0; d <= 9; d++) if ((base + d * w) % 11 === 0) dd.push(d); tries++; } while (dd.length !== 1 && tries < 200);
      var show = ds.map(function (x, i) { return i === pos ? '\\square' : String(x); }).join('\\,'), sign = (len - 1 - pos) % 2 ? -1 : 1;
      var rest = (base) % 11;
      return { q: 'The digit $\\square$ is missing from $' + show + '$, a number divisible by 11. Find the missing digit.', a: num(dd[0]),
        steps: ['Use the alternating sum from the ones digit. Without the missing digit the number is congruent to $' + rest + pmod(11) + '$.', 'The missing digit $d$ sits in a place worth $10^{' + (len - 1 - pos) + '} \\equiv ' + sign + pmod(11) + '$, so we need $' + rest + (sign > 0 ? ' + d' : ' - d') + ' \\equiv 0' + pmod(11) + '$.', 'The only digit that works is $d = ' + dd[0] + '$. Check: $' + cm(base + dd[0] * Math.pow(10, len - 1 - pos)) + ' = 11 \\cdot ' + cm((base + dd[0] * Math.pow(10, len - 1 - pos)) / 11) + '$.'],
        hint: 'Write the condition with the alternating digit sum, with $d$ in its place.' };
    }
    len = R.int(5, 6); n = R.int(Math.pow(10, len - 1), Math.pow(10, len) - 1); var pos2 = R.int(1, len - 2); ds = digitsOf(n); ds[pos2] = 0;
    var others = U.sum(ds), good = []; for (var d2 = 0; d2 <= 9; d2++) if ((others + d2) % 9 === 0) good.push(d2);
    return { q: 'Which digits can replace $\\square$ in $' + ds.map(function (x, i) { return i === pos2 ? '\\square' : String(x); }).join('\\,') + '$ to make a multiple of 9? Give all of them.', a: setA(good),
      steps: ['A number is a multiple of 9 exactly when its digit sum is.', 'The known digits add to $' + others + '$, so we need $' + others + ' + d \\equiv 0' + pmod(9) + '$, that is $d \\equiv ' + mod(-others, 9) + pmod(9) + '$.', good.length === 2 ? 'Both $0$ and $9$ are digits with that residue: $d \\in \\{0, 9\\}$.' : 'Only $d = ' + good[0] + '$ works.'],
      hint: 'Add the known digits and find what $d$ must be mod 9. Could two digits work?' };
  });

  G('nt.modular-powers', function (R, ctx) {
    var L = ctx.level, n = L === 1 ? R.int(7, 30) : L === 2 ? R.int(11, 100) : R.int(50, 500), e = L === 1 ? R.int(5, 20) : L === 2 ? R.int(20, 200) : R.int(200, 1000), a = R.int(2, Math.min(n - 2, L === 1 ? 12 : 40));
    if (mod(a, n) === n - 1) a--;
    var last2 = L >= 2 && R.chance(0.25); if (last2) { n = 100; a = R.pick([3, 7, 13, 17, 23, 37]); }
    var f = fastPow(a, e, n);
    return { q: last2 ? 'Find the last two digits of $' + a + '^{' + e + '}$ (that is, $' + a + '^{' + e + '}$ mod 100).' : 'Find $' + a + '^{' + e + '}$ mod $' + n + '$.', a: num(f.v), steps: f.steps,
      hint: 'Write ' + e + ' in binary, square repeatedly, and reduce mod ' + n + ' after every multiplication.' };
  });

  function invSteps(a, n) { // extended Euclid on (n, a); returns { v, steps }
    var rows = euclidRows(n, mod(a, n)), st = [];
    st.push('Run the Euclidean algorithm on $' + n + '$ and $' + mod(a, n) + '$: ' + rows.map(function (r) { return '$' + divTex(r.A, r.B, r.q, r.r) + '$'; }).join(', ') + '. The gcd is $1$, so an inverse exists.');
    var s0 = 1, t0 = 0, s1 = 0, t1 = 1, lines = [];
    rows.forEach(function (r) { if (!r.r) return; var s2 = s0 - r.q * s1, t2 = t0 - r.q * t1; lines.push('$' + r.r + ' = ' + n + ' \\cdot ' + p(s2) + ' + ' + mod(a, n) + ' \\cdot ' + p(t2) + '$'); s0 = s1; t0 = t1; s1 = s2; t1 = t2; });
    var E = egcd(n, mod(a, n)), t = E[2], v = mod(t, n);
    if (lines.length) st.push('Write each remainder in terms of $' + n + '$ and $' + mod(a, n) + '$: ' + lines.join(', ') + '.');
    st.push('Mod $' + n + '$ the multiple of $' + n + '$ drops out: $' + mod(a, n) + ' \\cdot ' + p(t) + ' \\equiv 1$, so the inverse is $' + p(t) + ' \\equiv ' + v + pmod(n) + '$.');
    st.push('Check: $' + mod(a, n) + ' \\cdot ' + v + ' = ' + cm(mod(a, n) * v) + ' = ' + n + ' \\cdot ' + Math.floor(mod(a, n) * v / n) + ' + 1$.');
    return { v: v, steps: st };
  }
  G('nt.modular-inverses', function (R, ctx) {
    var L = ctx.level, shape = L === 2 && R.chance(0.35) ? 'which' : 'inv';
    if (shape === 'which') {
      var n = R.pick([10, 12, 14, 15, 18, 20, 21, 24, 26, 28]), co = [], non = [];
      for (var c0 = 2; c0 < n; c0++) (gcd(c0, n) === 1 ? co : non).push(c0);
      var kc = Math.min(R.int(1, 3), co.length), cand = R.shuffle(R.sample(co, kc).concat(R.sample(non, 4 - kc))), yes = [];
      cand.forEach(function (c, i) { if (gcd(c, n) === 1) yes.push(i); });
      return { q: 'Which of these numbers have an inverse mod $' + n + '$? Select all that apply.', a: { t: 'mc', choices: cand.map(String), v: yes },
        steps: ['$a$ has an inverse mod $n$ exactly when $\\gcd(a, n) = 1$. Here $' + n + ' = ' + fx(n) + '$.', cand.map(function (c) { return '$\\gcd(' + c + ', ' + n + ') = ' + gcd(c, n) + '$'; }).join(', ') + '.', 'So ' + yes.map(function (i) { return cand[i]; }).join(', ') + (yes.length === 1 ? ' has an inverse' : ' have inverses') + '. A number sharing a factor $d > 1$ with ' + n + ' has only multiples of $d$ among its multiples mod ' + n + ', and 1 is not one of them.'],
        hint: 'Check $\\gcd(a, ' + n + ')$ for each one.' };
    }
    var n2 = L === 1 ? R.pick(primes(7, 23).concat([9, 10, 14, 15, 16, 20])) : L === 2 ? R.int(21, 100) : R.int(100, 1000), a;
    var tries = 0; do { a = R.int(2, n2 - 2); tries++; } while (gcd(a, n2) !== 1 || (inv(a, n2) === a && L > 1 && tries < 60)); // mod 24 every unit is its own inverse
    var f = invSteps(a, n2);
    return { q: 'Find the inverse of $' + a + '$ mod $' + n2 + '$: the $x$ with $0 \\le x < ' + n2 + '$ and $' + a + 'x \\equiv 1' + pmod(n2) + '$.', a: num(f.v), steps: f.steps,
      hint: L === 1 ? 'Try multiples of ' + a + ' until one is 1 more than a multiple of ' + n2 + ', or use the extended Euclidean algorithm.' : 'Use the extended Euclidean algorithm to write $1 = ' + n2 + 's + ' + a + 't$.' };
  });

  G('nt.linear-congruences', function (R, ctx) {
    var L = ctx.level, n, a, b, d;
    if (L === 1) { n = R.int(7, 20); do { a = R.int(2, n - 1); } while (gcd(a, n) !== 1); b = R.int(1, n - 1); }
    else { n = L === 2 ? R.pick([12, 14, 15, 16, 18, 20, 21, 24, 25, 26, 27, 28, 30, 32, 33, 35, 36, 40]) : R.int(40, 120); var dd = divisors(n).filter(function (x) { return x > 1 && x <= 8 && x < n; }); d = dd.length ? R.pick(dd) : 1; do { a = d * R.int(1, Math.floor((n - 1) / d)); } while (gcd(a, n) !== d || a === 1); b = R.chance(0.65) ? d * R.int(1, Math.floor((n - 1) / d)) : mod(d * R.int(1, n) + R.int(1, d - 1 || 1), n); }
    d = gcd(a, n);
    var sols = []; for (var x = 0; x < n; x++) if (mod(a * x - b, n) === 0) sols.push(x);
    var st = ['$d = \\gcd(' + a + ', ' + n + ') = ' + d + '$.'];
    if (b % d !== 0) { st.push('$' + a + 'x - ' + b + '$ would have to be a multiple of $' + n + '$, but $' + a + 'x - ' + n + 'k$ is always a multiple of $' + d + '$, and $' + d + ' \\nmid ' + b + '$.', 'So there is <b>no solution</b>.'); }
    else {
      var a1 = a / d, b1 = b / d, n1 = n / d, iv = inv(a1, n1), x0 = mulmod(b1, iv === null ? 0 : iv, n1);
      if (d > 1) st.push('$' + d + ' \\mid ' + b + '$, so divide everything, the modulus too: $' + cx(a1, 'x') + ' \\equiv ' + b1 + pmod(n1) + '$.');
      st.push(n1 === 1 ? 'Every $x$ works mod 1.' : a1 === 1 ? 'So $x \\equiv ' + x0 + pmod(n1) + '$.' : 'The inverse of $' + a1 + '$ mod $' + n1 + '$ is $' + iv + '$ (since $' + a1 + ' \\cdot ' + iv + ' = ' + a1 * iv + ' \\equiv 1$). Multiply both sides by it: $x \\equiv ' + b1 + ' \\cdot ' + iv + ' \\equiv ' + x0 + pmod(n1) + '$.');
      st.push(d > 1 ? 'Back mod $' + n + '$, that is $d = ' + d + '$ solutions, spaced $' + n1 + '$ apart: $x \\equiv ' + sols.join(', ') + pmod(n) + '$.' : 'One solution mod $' + n + '$: $x \\equiv ' + sols[0] + '$. Check: $' + a + ' \\cdot ' + sols[0] + ' = ' + a * sols[0] + ' \\equiv ' + b + pmod(n) + '$.');
    }
    return { q: 'Solve $' + a + 'x \\equiv ' + b + pmod(n) + '$. Give every solution with $0 \\le x < ' + n + '$' + (L > 1 ? ', or say there is none' : '') + '.', a: setA(sols), steps: st,
      hint: 'Start with $d = \\gcd(' + a + ', ' + n + ')$. Does it divide ' + b + '? If so, divide $a$, $b$ and $n$ by it.' };
  });

  function crt2Steps(a, m, b, n) { // x ≡ a (mod m), x ≡ b (mod n), gcd(m, n) = 1
    var iv = inv(m, n), k = mulmod(mod(b - a, n), iv, n), x = a + m * k, st = [];
    st.push('From the first congruence, $x = ' + a + ' + ' + m + 'k$.');
    st.push('Put it in the second: $' + a + ' + ' + m + 'k \\equiv ' + b + pmod(n) + '$, so $' + cx(mod(m, n), 'k') + ' \\equiv ' + mod(b - a, n) + pmod(n) + '$.');
    if (mod(m, n) !== 1) st.push('The inverse of $' + mod(m, n) + '$ mod $' + n + '$ is $' + iv + '$, so $k \\equiv ' + mod(b - a, n) + ' \\cdot ' + iv + ' \\equiv ' + k + pmod(n) + '$.');
    st.push('$x = ' + a + ' + ' + m + ' \\cdot ' + k + ' = ' + x + '$. Check: $' + x + ' \\equiv ' + mod(x, m) + pmod(m) + '$ and $' + x + ' \\equiv ' + mod(x, n) + pmod(n) + '$.');
    return { x: x, steps: st };
  }
  G('nt.chinese-remainder', function (R, ctx) {
    var L = ctx.level, m, n, a, b, s;
    if (L === 1) {
      do { m = R.int(3, 9); n = R.int(4, 11); } while (gcd(m, n) !== 1 || m === n);
      a = R.int(0, m - 1); b = R.int(0, n - 1); s = crt2Steps(a, m, b, n);
      var pb = { q: 'Find the smallest $x \\ge 0$ with $x \\equiv ' + a + pmod(m) + '$ and $x \\equiv ' + b + pmod(n) + '$.', a: num(s.x), steps: s.steps.concat(['Since $\\gcd(' + m + ', ' + n + ') = 1$, this is the only solution mod $' + m * n + '$.']), hint: 'Write $x = ' + a + ' + ' + m + 'k$ and choose $k$ to fix the remainder mod ' + n + '.' };
      if (R.chance(0.4) && m * n <= 60) pb.viz = { name: 'nt-crt', opts: { m: m, n: n, target: [a, b], fill: 'none', quiet: true } };
      return pb;
    }
    if (L === 2) {
      var ms = R.pick([[3, 4, 5], [3, 5, 7], [4, 5, 7], [3, 4, 7], [2, 5, 7], [3, 5, 8]]), rs = ms.map(function (q) { return R.int(1, q - 1); });
      var s1 = crt2Steps(rs[0], ms[0], rs[1], ms[1]), M1 = ms[0] * ms[1], s2 = crt2Steps(s1.x, M1, rs[2], ms[2]), word = R.coin();
      var q = word ? 'A basket holds fewer than ' + (M1 * ms[2]) + ' eggs. Taken out ' + ms[0] + ' at a time, ' + rs[0] + ' ' + (rs[0] === 1 ? 'is' : 'are') + ' left; ' + ms[1] + ' at a time, ' + rs[1] + ' left; ' + ms[2] + ' at a time, ' + rs[2] + ' left. How many eggs are in the basket?' : 'Find the smallest $x \\ge 0$ with $x \\equiv ' + rs[0] + pmod(ms[0]) + '$, $x \\equiv ' + rs[1] + pmod(ms[1]) + '$ and $x \\equiv ' + rs[2] + pmod(ms[2]) + '$.';
      return { q: q, a: num(s2.x), steps: ['Combine the first two congruences, then bring in the third.'].concat(s1.steps, ['So $x \\equiv ' + s1.x + pmod(M1) + '$. Now combine that with $x \\equiv ' + rs[2] + pmod(ms[2]) + '$.'], s2.steps, ['The moduli are pairwise coprime, so this is the only answer below $' + (M1 * ms[2]) + '$.']), hint: 'Solve two congruences at a time.' };
    }
    var pr = R.pick([[4, 6], [6, 9], [6, 10], [8, 12], [9, 12], [10, 15], [6, 8], [12, 18]]); m = pr[0]; n = pr[1]; var g = gcd(m, n);
    a = R.int(0, m - 1); b = R.chance(0.6) ? mod(a + g * R.int(0, n), n) : mod(a + g * R.int(0, n) + R.int(1, g - 1), n);
    var sols = []; for (var x = 0; x < m * n; x++) if (x % m === a && x % n === b) sols.push(x);
    var st = ['The moduli share the factor $\\gcd(' + m + ', ' + n + ') = ' + g + '$, so the theorem does not apply directly.', 'Both congruences fix $x$ mod $' + g + '$: the first says $x \\equiv ' + mod(a, g) + '$ and the second says $x \\equiv ' + mod(b, g) + pmod(g) + '$.'];
    if (!sols.length) st.push('These disagree, so there is <b>no solution</b>.');
    else st.push('They agree, so there is exactly one solution mod $\\operatorname{lcm}(' + m + ', ' + n + ') = ' + lcm(m, n) + '$: $x \\equiv ' + sols[0] + '$. Below $' + m * n + '$ that gives ' + sols.length + ' solutions: ' + sols.join(', ') + '.');
    return { q: 'Find every $x$ with $0 \\le x < ' + m * n + '$ such that $x \\equiv ' + a + pmod(m) + '$ and $x \\equiv ' + b + pmod(n) + '$, or say there is none.', a: setA(sols), steps: st, hint: 'The moduli share a factor. What does each congruence say mod $' + g + '$?' };
  });


  // ================================================================ Unit 4: Fermat, Euler and Wilson
  function smallPow(a, r, n) { // a^r mod n for a small r, one multiplication at a time
    if (r === 0) return { v: 1 % n, line: '$' + a + '^{0} = 1$' };
    if (r === 1) return { v: mod(a, n), line: '$' + a + '^{1} = ' + a + '$' };
    if (r > 6) { var f = fastPow(a, r, n); return { v: f.v, line: f.steps.slice(0, -1).join(' ') }; }
    var x = mod(a, n), parts = [];
    for (var k = 2; k <= r; k++) { var nx = mulmod(x, a, n); parts.push('$' + a + '^{' + k + '} \\equiv ' + x + ' \\cdot ' + a + ' = ' + x * a + (x * a >= n ? ' \\equiv ' + nx : '') + '$'); x = nx; }
    return { v: x, line: parts.join(', ') };
  }
  G('nt.fermat-little', function (R, ctx) {
    var L = ctx.level, shape = L === 1 ? 'reduce' : L === 2 ? R.pick(['reduce', 'reduce', 'mc']) : R.pick(['reduce', 'zero', 'mc']);
    var pr = L === 1 ? R.pick([5, 7, 11, 13]) : L === 2 ? R.pick(primes(13, 31)) : R.pick(primes(29, 61));
    if (shape === 'mc') {
      var a0 = R.int(2, pr - 2), e0 = R.int(100, 999);
      return { q: 'To simplify $' + a0 + '^{' + e0 + '}$ mod $' + pr + '$ with Fermat\'s little theorem, you may replace the exponent ' + e0 + ' by its remainder mod which number?', a: mcA(String(pr - 1), [String(pr), String(pr + 1), String(Math.floor(pr / 2))].filter(function (v, i, A) { return A.indexOf(v) === i && v !== String(pr - 1); })),
        steps: ['Fermat: $' + a0 + '^{' + (pr - 1) + '} \\equiv 1' + pmod(pr) + '$, because $' + pr + '$ is prime and does not divide $' + a0 + '$.', 'So the powers of $' + a0 + '$ repeat every $' + (pr - 1) + '$ steps (or a divisor of it), and the exponent can be reduced mod $p - 1 = ' + (pr - 1) + '$, not mod $p$.', 'Here $' + e0 + ' = ' + (pr - 1) + ' \\cdot ' + Math.floor(e0 / (pr - 1)) + ' + ' + (e0 % (pr - 1)) + '$, so $' + a0 + '^{' + e0 + '} \\equiv ' + a0 + '^{' + (e0 % (pr - 1)) + '}$.'],
        hint: 'Which power of $a$ does Fermat\'s theorem say is 1?' };
    }
    if (shape === 'zero') {
      var mlt = pr * R.int(2, 6), ez = R.int(100, 5000);
      return { q: 'Find $' + mlt + '^{' + ez + '}$ mod $' + pr + '$.', a: num(0), steps: ['$' + mlt + ' = ' + pr + ' \\cdot ' + (mlt / pr) + '$, so $' + pr + '$ divides the base. Fermat\'s theorem needs $p \\nmid a$, so it does not apply.', 'Every power of a multiple of $' + pr + '$ is a multiple of $' + pr + '$: the answer is $0$.'], hint: 'Is the base a multiple of ' + pr + '?' };
    }
    var a = R.int(2, L === 3 ? 200 : pr - 2), e = L === 1 ? R.int(20, 200) : L === 2 ? R.int(200, 10000) : R.int(10000, 1000000);
    if (a % pr === 0 || a % pr === 1) a += 1;
    var A = mod(a, pr), r = e % (pr - 1), sp = smallPow(A, r, pr), st = [];
    if (A !== a) st.push('Reduce the base: $' + a + ' \\equiv ' + A + pmod(pr) + '$.');
    st.push('$' + pr + '$ is prime and does not divide $' + A + '$, so Fermat gives $' + A + '^{' + (pr - 1) + '} \\equiv 1' + pmod(pr) + '$.');
    st.push('$' + cm(e) + ' = ' + (pr - 1) + ' \\cdot ' + cm(Math.floor(e / (pr - 1))) + ' + ' + r + '$, so $' + A + '^{' + cm(e) + '} = (' + A + '^{' + (pr - 1) + '})^{' + cm(Math.floor(e / (pr - 1))) + '} \\cdot ' + A + '^{' + r + '} \\equiv ' + A + '^{' + r + '}$.');
    if (r > 1) st.push(sp.line + '.');
    st.push('So $' + a + '^{' + cm(e) + '} \\equiv ' + sp.v + pmod(pr) + '$.');
    if (sp.v !== powmod(a, e, pr)) throw new Error('fermat mismatch');
    return { q: 'Find $' + a + '^{' + cm(e) + '}$ mod $' + pr + '$.', a: num(sp.v), steps: st, hint: 'Reduce the exponent mod $' + (pr - 1) + '$, not mod ' + pr + '.' };
  });

  G('nt.wilson', function (R, ctx) {
    var L = ctx.level, k = L === 1 ? 0 : L === 2 ? R.int(1, 3) : R.int(2, 5), pr, st, v;
    if (L === 1) {
      var n = R.coin() ? R.pick(primes(5, 199)) : R.pick([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 33, 35, 30, 32, 34, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50]);
      if (isPrime(n)) { v = n - 1; st = ['$' + n + '$ is prime, so Wilson\'s theorem applies: $(' + n + ' - 1)! \\equiv -1' + pmod(n) + '$.', 'The least nonnegative residue of $-1$ is $' + (n - 1) + '$.', 'Why: each factor from 2 to ' + (n - 2) + ' pairs with its own inverse mod ' + n + ' (a different number), and those pairs multiply to 1, leaving $1 \\cdot ' + (n - 1) + ' \\equiv -1$.']; }
      else if (n === 4) { v = 2; st = ['$3! = 6 \\equiv 2' + pmod(4) + '$.', '4 is the one composite where the answer is not 0: $4 = 2 \\cdot 2$ uses the factor 2 twice, and $3!$ has only one 2.']; }
      else { v = 0; var f2 = factor(n), a1, b1; if (f2.length > 1 || f2[0][1] > 2 || (f2[0][1] === 2 && f2[0][0] > 2)) { a1 = spf(n); b1 = n / a1; } st = ['$' + n + '$ is composite: $' + n + ' = ' + a1 + ' \\cdot ' + b1 + '$' + (a1 === b1 ? ', and $' + a1 + '$ and $' + 2 * a1 + '$ are both at most ' + (n - 1) + '.' : ' with both factors at most ' + (n - 1) + '.'), 'So $' + n + '$ divides $(' + n + ' - 1)! = 1 \\cdot 2 \\cdots ' + (n - 1) + '$, and $(' + n + ' - 1)! \\equiv 0' + pmod(n) + '$, not $-1$.']; }
      return { q: 'Find $' + (n - 1) + '!$ mod $' + n + '$.', a: num(v), steps: st, hint: 'Is ' + n + ' prime? Wilson\'s theorem is about primes.' };
    }
    pr = R.pick(primes(L === 2 ? 7 : 11, L === 2 ? 113 : 199));
    // (p - 1)! = (p - k - 1)! · (p - 1)(p - 2)…(p - k) ≡ (p - k - 1)! · (-1)^k · k!
    var kf = U.factorial(k), sgn = k % 2 ? -1 : 1, rhs = mod(-sgn * inv(kf, pr), pr), m = pr - k - 1;
    v = rhs;
    var check = 1; for (var j = 1; j <= m; j++) check = mulmod(check, j, pr);
    if (check !== v) throw new Error('wilson mismatch');
    st = ['Wilson: $(' + pr + ' - 1)! = ' + (pr - 1) + '! \\equiv -1' + pmod(pr) + '$.', 'Split off the last ' + (k + 0) + ' factor' + (k === 1 ? '' : 's') + ': $' + (pr - 1) + '! = ' + m + '! \\cdot ' + Array.from({ length: k }, function (_, i) { return String(pr - 1 - i); }).reverse().join(' \\cdot ') + '$, and $' + Array.from({ length: k }, function (_, i) { return (pr - 1 - i) + ' \\equiv ' + (-(i + 1)); }).join(',\\ ') + pmod(pr) + '$.'];
    if (k === 1) st.push('So $' + m + '! \\cdot (-1) \\equiv -1$, which gives $' + m + '! \\equiv 1' + pmod(pr) + '$.');
    else st.push('So $' + m + '! \\cdot ' + p(sgn * kf) + ' \\equiv -1' + pmod(pr) + '$. ' + (sgn * kf < 0 ? 'Here $' + (sgn * kf) + ' \\equiv ' + mod(sgn * kf, pr) + '$, and t' : 'T') + 'he inverse of $' + mod(sgn * kf, pr) + '$ mod ' + pr + ' is $' + inv(mod(sgn * kf, pr), pr) + '$. Multiply both sides by it: $' + m + '! \\equiv -' + inv(mod(sgn * kf, pr), pr) + ' \\equiv ' + v + pmod(pr) + '$.');
    return { q: 'Find $' + m + '!$ mod $' + pr + '$.', a: num(v), steps: st, hint: 'Start from Wilson\'s theorem, $' + (pr - 1) + '! \\equiv -1$, and write the missing factors as negative numbers.' };
  });

  G('nt.euler-phi', function (R, ctx) {
    var L = ctx.level, shape = L === 1 ? 'basic' : L === 2 ? R.pick(['general', 'general', 'fractions']) : R.pick(['inverse', 'trap', 'general']);
    var n, f;
    function phiSteps(n) { var f = factor(n); return ['$' + n + ' = ' + fx(n) + '$.', '$\\varphi(p^{k}) = p^{k} - p^{k-1}$ (remove the multiples of $p$), and $\\varphi$ multiplies across coprime factors: $\\varphi(' + n + ') = ' + f.map(function (x) { return x[1] > 1 ? '(' + x[0] + '^{' + x[1] + '} - ' + x[0] + '^{' + (x[1] - 1) + '})' : '(' + x[0] + ' - 1)'; }).join('') + ' = ' + f.map(function (x) { return String(Math.pow(x[0], x[1]) - Math.pow(x[0], x[1] - 1)); }).join(' \\cdot ') + ' = ' + phi(n) + '$.']; }
    if (shape === 'basic') {
      var t = R.pick(['p', 'pk', 'pq']);
      n = t === 'p' ? R.pick(primes(11, 97)) : t === 'pk' ? R.pick([8, 16, 32, 9, 27, 81, 25, 125, 49, 121]) : (function () { var a = R.pick([2, 3, 5, 7]), b = R.pick(primes(a + 1, 23)); return a * b; })();
      return { q: 'Find $\\varphi(' + n + ')$.', a: num(phi(n)), steps: t === 'p' ? ['$' + n + '$ is prime, so every number from 1 to ' + (n - 1) + ' is coprime to it.', '$\\varphi(' + n + ') = ' + (n - 1) + '$.'] : phiSteps(n), hint: 'Factor ' + n + '. For a prime power, remove the multiples of the prime.' };
    }
    if (shape === 'general' || shape === 'fractions') {
      do { n = R.int(L === 2 ? 50 : 200, L === 2 ? 1000 : 3000); f = factor(n); } while (f.length < 2);
      if (shape === 'fractions') { n = R.int(20, 120); while (factor(n).length < 2) n++; return { q: 'How many of the fractions $\\frac{1}{' + n + '}, \\frac{2}{' + n + '}, \\dots, \\frac{' + n + '}{' + n + '}$ are already in lowest terms?', a: num(phi(n)), steps: ['$\\frac{k}{' + n + '}$ is in lowest terms exactly when $\\gcd(k, ' + n + ') = 1$, so the count is $\\varphi(' + n + ')$.'].concat(phiSteps(n)), hint: 'When is $k/' + n + '$ in lowest terms?' }; }
      return { q: 'Find $\\varphi(' + cm(n) + ')$.', a: num(phi(n)), steps: phiSteps(n), hint: 'Factor first, then use $\\varphi(p^{k}) = p^{k} - p^{k-1}$ on each prime power and multiply.' };
    }
    if (shape === 'trap') {
      var pairs = [[4, 6], [2, 4], [6, 9], [3, 9], [4, 9], [5, 8], [8, 12], [3, 10], [6, 10], [7, 9]], pr2 = R.pick(pairs), m1 = pr2[0], m2 = pr2[1], ok = phi(m1 * m2) === phi(m1) * phi(m2);
      return { q: 'True or false: $\\varphi(' + m1 + ' \\cdot ' + m2 + ') = \\varphi(' + m1 + ')\\,\\varphi(' + m2 + ')$.', a: tf(ok),
        steps: ['$\\varphi(' + m1 + ') = ' + phi(m1) + '$, $\\varphi(' + m2 + ') = ' + phi(m2) + '$, so the right side is $' + phi(m1) * phi(m2) + '$.', '$\\varphi(' + m1 * m2 + ') = ' + phi(m1 * m2) + '$. ' + (ok ? 'Equal: <b>true</b>, as it must be since $\\gcd(' + m1 + ', ' + m2 + ') = 1$.' : 'Not equal: <b>false</b>. The rule $\\varphi(mn) = \\varphi(m)\\varphi(n)$ needs $\\gcd(m, n) = 1$, and here $\\gcd(' + m1 + ', ' + m2 + ') = ' + gcd(m1, m2) + '$.')],
        hint: 'Check $\\gcd(' + m1 + ', ' + m2 + ')$, or compute both sides.' };
    }
    var M0 = R.pick([2, 4, 6, 8, 10, 12, 16]), sols = []; for (var k = 1; k <= 2 * M0 * M0 + 2; k++) if (phi(k) === M0) sols.push(k);
    var cps = primes(2, M0 + 1).filter(function (q) { return M0 % (q - 1) === 0; });
    return { q: 'Find every positive integer $n$ with $\\varphi(n) = ' + M0 + '$.', a: setA(sols),
      steps: ['If a prime $q$ divides $n$, then $q - 1$ divides $\\varphi(n) = ' + M0 + '$. So the only possible primes are ' + cps.join(', ') + '.', 'Try products of powers of these primes (a prime $q$ can appear squared only if $q \\mid ' + M0 + '$ too) and compute $\\varphi$. The ones that work: ' + sols.map(function (s) { return '$\\varphi(' + s + ') = ' + (isPrime(s) ? '' : '\\varphi(' + fx(s) + ') = ') + M0 + '$'; }).join(', ') + '.', 'So $n \\in \\{' + sols.join(', ') + '\\}$.'],
      hint: 'If $q \\mid n$, then $q - 1 \\mid \\varphi(n)$. That leaves only a few primes to try.' };
  });

  G('nt.euler-theorem', function (R, ctx) {
    var L = ctx.level, n, a, e, ph, r, sp, st;
    if (L === 3) { // a tower a^(b^c)
      n = R.pick([10, 100, 7, 11, 13]); do { a = R.int(2, 19); } while (gcd(a, n) !== 1 || mod(a, n) === 1); var b = R.int(2, 9), c = R.int(2, 5);
      ph = phi(n); var E = powmod(b, c, ph), ec = Math.pow(b, c), sp2 = smallPow(mod(a, n), E, n), val = powmod(a, ec, n);
      if (sp2.v !== val) throw new Error('tower mismatch');
      st = ['$\\gcd(' + a + ', ' + n + ') = 1$ and $\\varphi(' + n + ') = ' + ph + '$, so the exponent only matters mod ' + ph + '.', 'The exponent is $' + b + '^{' + c + '} = ' + cm(ec) + '$, and $' + cm(ec) + ' \\equiv ' + E + pmod(ph) + '$.', sp2.line + '.', 'So $' + a + '^{' + b + '^{' + c + '}} \\equiv ' + a + '^{' + E + '} \\equiv ' + val + pmod(n) + '$.'];
      return { q: 'Find $' + a + '^{' + b + '^{' + c + '}}$ mod $' + n + '$. (The exponent is $' + b + '^{' + c + '}$.)', a: num(val), steps: st, hint: 'Reduce the exponent $' + b + '^{' + c + '}$ mod $\\varphi(' + n + ') = ' + ph + '$ first.' };
    }
    var last = L === 2 && R.chance(0.6);
    n = last ? R.pick([10, 100]) : R.pick([8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28]);
    do { a = R.int(2, last ? 99 : 40); } while (gcd(a, n) !== 1 || mod(a, n) === 1);
    e = L === 1 ? R.int(50, 500) : R.int(500, 100000);
    ph = phi(n); r = e % ph; sp = smallPow(mod(a, n), r, n);
    st = ['$\\gcd(' + a + ', ' + n + ') = 1$, so Euler\'s theorem applies: $' + mod(a, n) + '^{\\varphi(' + n + ')} \\equiv 1' + pmod(n) + '$, with $\\varphi(' + n + ') = ' + ph + '$.'];
    if (mod(a, n) !== a) st.push('Reduce the base: $' + a + ' \\equiv ' + mod(a, n) + pmod(n) + '$.');
    st.push('$' + cm(e) + ' = ' + ph + ' \\cdot ' + cm(Math.floor(e / ph)) + ' + ' + r + '$, so $' + a + '^{' + cm(e) + '} \\equiv ' + mod(a, n) + '^{' + r + '}' + pmod(n) + '$.');
    if (r > 1) st.push(sp.line + '.');
    st.push((last ? 'The last ' + (n === 100 ? 'two digits are' : 'digit is') + ' ' : 'So $' + a + '^{' + cm(e) + '} \\equiv ') + (last ? '<b>' + (n === 100 && sp.v < 10 ? '0' + sp.v : sp.v) + '</b>.' : sp.v + pmod(n) + '$.'));
    if (sp.v !== powmod(a, e, n)) throw new Error('euler mismatch');
    return { q: last ? 'Find the last ' + (n === 100 ? 'two digits' : 'digit') + ' of $' + a + '^{' + cm(e) + '}$' + (n === 100 ? ' (give the number from 0 to 99 they form)' : '') + '.' : 'Find $' + a + '^{' + cm(e) + '}$ mod $' + n + '$.', a: num(sp.v), steps: st, hint: 'Reduce the exponent mod $\\varphi(' + n + ') = ' + ph + '$.' };
  });

  var PSEUDO = [[91, 3], [341, 2]]; (function () { for (var n = 9; n <= 100; n++) { if (isPrime(n)) continue; for (var a = 2; a <= n - 2; a++) if (gcd(a, n) === 1 && powmod(a, n - 1, n) === 1 && ord(a, n) <= 4) PSEUDO.push([n, a]); } })();
  G('nt.pseudoprimes', function (R, ctx) {
    var L = ctx.level, CH = ['$n$ is composite: the test proves it.', '$n$ passes: it may be prime, but the test does not prove that.'];
    if (L === 1) {
      var n = R.pick(R.coin() ? [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 75, 77, 85, 87, 91, 93, 95] : [11, 13, 17, 19, 23, 29, 31, 37, 41, 43]);
      var bs = R.pick([2, 2, 3]); if (n % 3 === 0 || (!isPrime(n) && powmod(bs, n - 1, n) === 1)) bs = 2; // base 2 has no pseudoprimes below 341
      var f = fastPow(bs, n - 1, n), passes = f.v === 1;
      return { q: 'Run the base-' + bs + ' Fermat test on $n = ' + n + '$: find $' + bs + '^{' + (n - 1) + '}$ mod $' + n + '$, then say what it shows.', a: multi([['$' + bs + '^{' + (n - 1) + '} \\bmod ' + n + ' =$', num(f.v)], ['Conclusion:', { t: 'mc', choices: CH, v: passes ? 1 : 0, keep: true }]]),
        steps: f.steps.concat([passes ? 'The result is 1, so ' + n + ' passes. (' + n + ' is in fact prime, but the test alone could not prove it.)' : 'The result is not 1. If ' + n + ' were prime, Fermat\'s theorem would force $' + bs + '^{' + (n - 1) + '} \\equiv 1$. So ' + n + ' is <b>composite</b>, without our finding a factor.']),
        hint: 'Compute the power with repeated squaring. If the answer is not 1, Fermat\'s theorem has been broken.' };
    }
    if (L === 2) {
      var pr = R.pick(PSEUDO), N = pr[0], a = pr[1], k = ord(a, N), st = [];
      st.push('Look for a small power of $' + a + '$ that is 1 mod ' + N + ': ' + (function () { var x = 1, out = []; for (var i = 1; i <= k; i++) { var y = x * a; x = mulmod(x, a, N); out.push('$' + a + '^{' + i + '} \\equiv ' + x + '$'); } return out.join(', '); })() + '.');
      st.push('$' + k + ' \\mid ' + (N - 1) + '$, since $' + (N - 1) + ' = ' + k + ' \\cdot ' + (N - 1) / k + '$. So $' + a + '^{' + (N - 1) + '} = (' + a + '^{' + k + '})^{' + (N - 1) / k + '} \\equiv 1' + pmod(N) + '$.');
      st.push('But $' + N + ' = ' + fx(N) + '$ is composite. It passes the base-' + a + ' test anyway: a <b>pseudoprime</b> to base ' + a + '.');
      if (powmod(a, N - 1, N) !== 1) throw new Error('pseudo');
      return { q: '$' + N + ' = ' + fx(N) + '$. Find $' + a + '^{' + (N - 1) + '}$ mod $' + N + '$, then choose what this shows.', a: multi([['$' + a + '^{' + (N - 1) + '} \\bmod ' + N + ' =$', num(1)], ['Conclusion:', { t: 'mc', choices: [N + ' is prime.', N + ' is a pseudoprime to base ' + a + ': composite, yet it passes.', 'The test proves ' + N + ' is composite.'], v: 1, keep: true }]]),
        steps: st, hint: 'Find the first power of ' + a + ' that is 1 mod ' + N + '. Does it divide ' + (N - 1) + '?' };
    }
    var cands = [561, 1105, 1729, 2465, 2821, 105, 255, 273, 455, 1001, 1885, 385, 645], n3 = R.pick(cands), f3 = factor(n3), sq = f3.every(function (x) { return x[1] === 1; });
    var ok = sq && f3.every(function (x) { return (n3 - 1) % (x[0] - 1) === 0; });
    return { q: 'Korselt\'s criterion: a composite $n$ is a Carmichael number (it passes the Fermat test for every base coprime to it) exactly when $n$ is squarefree and $p - 1 \\mid n - 1$ for every prime $p \\mid n$. True or false: $' + cm(n3) + ' = ' + fx(n3) + '$ is a Carmichael number.', a: tf(ok),
      steps: ['$n - 1 = ' + cm(n3 - 1) + '$, and $' + fx(n3) + '$ is squarefree.', f3.map(function (x) { return '$' + (x[0] - 1) + ((n3 - 1) % (x[0] - 1) === 0 ? ' \\mid ' : ' \\nmid ') + cm(n3 - 1) + '$'; }).join(', ') + '.', ok ? 'Every condition holds: <b>true</b>. ' + cm(n3) + ' fools the Fermat test for every base coprime to it.' : 'One condition fails: <b>false</b>.'],
      hint: 'Check $p - 1 \\mid ' + (n3 - 1) + '$ for each prime factor $p$.' };
  });


  // ================================================================ Unit 5: orders and primitive roots
  function powList(a, n, upto) { var x = 1, out = []; for (var k = 1; k <= upto; k++) { x = mulmod(x, a, n); out.push(x); if (x === 1) break; } return out; }
  function powListTex(a, n, list) { return list.map(function (v, i) { return '$' + a + '^{' + (i + 1) + '} \\equiv ' + v + '$'; }).join(', '); }
  G('nt.order-mod-n', function (R, ctx) {
    var L = ctx.level, n, a, k, st;
    if (L <= 2) {
      n = L === 1 ? R.pick([5, 7, 9, 10, 11, 13, 14, 17]) : R.pick([9, 10, 14, 15, 16, 18, 20, 21, 22, 25, 26, 27, 17, 19, 23, 28, 29, 31, 33, 35]);
      do { a = R.int(2, n - 1); } while (gcd(a, n) !== 1 || (L === 1 && a === n - 1 && R.chance(0.7)));
      k = ord(a, n); var ph = phi(n);
      if (L === 1) st = ['List the powers of $' + a + '$ mod $' + n + '$ until you reach 1: ' + powListTex(a, n, powList(a, n, n)) + '.', 'The first power that is 1 is the ' + U.ordinal(k) + ', so $\\operatorname{ord}_{' + n + '}(' + a + ') = ' + k + '$. (It divides $\\varphi(' + n + ') = ' + ph + '$, as every order does.)'];
      else { var ds = divisors(ph); st = ['The order divides $\\varphi(' + n + ') = ' + ph + '$, so only the divisors ' + ds.join(', ') + ' are possible.', 'Test them in increasing order: ' + ds.filter(function (d) { return d <= k; }).map(function (d) { return '$' + a + '^{' + d + '} \\equiv ' + powmod(a, d, n) + '$'; }).join(', ') + '.', 'The first one that gives 1: $\\operatorname{ord}_{' + n + '}(' + a + ') = ' + k + '$.']; }
      return { q: 'Find the order of $' + a + '$ mod $' + n + '$: the smallest $k > 0$ with $' + a + '^{k} \\equiv 1' + pmod(n) + '$.', a: num(k), steps: st, hint: L === 1 ? 'Multiply by ' + a + ' again and again, reducing each time.' : 'The order must divide $\\varphi(' + n + ')$. Test only those exponents.' };
    }
    if (R.coin()) {
      var pr = R.pick(primes(11, 61)), g = primRoots(pr)[0], j = R.int(2, pr - 2), K = pr - 1, ans = K / gcd(K, j);
      return { q: '$' + g + '$ has order $' + K + '$ mod $' + pr + '$. What is the order of $' + g + '^{' + j + '}$ mod $' + pr + '$?', a: num(ans),
        steps: ['$(' + g + '^{' + j + '})^{m} = ' + g + '^{' + j + 'm} \\equiv 1$ exactly when $' + K + ' \\mid ' + j + 'm$, since the order of $' + g + '$ is $' + K + '$.', '$' + K + ' \\mid ' + j + 'm$ means $\\frac{' + K + '}{\\gcd(' + K + ', ' + j + ')} \\mid m$, and $\\gcd(' + K + ', ' + j + ') = ' + gcd(K, j) + '$.', 'So the order is $' + K + '/' + gcd(K, j) + ' = ' + ans + '$.'],
        hint: 'The order of $g^{j}$ is $\\operatorname{ord}(g)/\\gcd(\\operatorname{ord}(g), j)$.' };
    }
    var p2 = R.pick(primes(11, 43)), ds2 = divisors(p2 - 1), non = []; for (var x = 2; x < p2 - 1; x++) if ((p2 - 1) % x) non.push(x);
    var kk = R.int(1, 2), ch = R.sample(ds2.filter(function (d) { return d > 1; }), kk).concat(R.sample(non, 4 - kk)), yes = [];
    ch.forEach(function (c, i) { if ((p2 - 1) % c === 0) yes.push(i); });
    return { q: 'Which of these could be the order of some number mod $' + p2 + '$? Select all that apply.', a: { t: 'mc', choices: ch.map(String), v: yes },
      steps: ['Every order mod a prime $p$ divides $p - 1 = ' + (p2 - 1) + '$ (Fermat), and mod a prime every divisor of $p - 1$ is the order of something.', 'The divisors of ' + (p2 - 1) + ' are ' + ds2.join(', ') + '. So the possible orders here are ' + yes.map(function (i) { return ch[i]; }).join(', ') + '.'],
      hint: 'Orders divide $p - 1$.' };
  });

  function primeQs(n) { return factor(n).map(function (f) { return f[0]; }); }
  function prTest(g, pr) { // the test lines for "is g a primitive root mod p"
    var qs = primeQs(pr - 1), lines = qs.map(function (q) { var e = (pr - 1) / q, v = powmod(g, e, pr); return { q: q, e: e, v: v, t: '$' + g + '^{' + e + '} \\equiv ' + v + '$' }; });
    return { ok: lines.every(function (l) { return l.v !== 1; }), lines: lines, qs: qs };
  }
  G('nt.primitive-roots', function (R, ctx) {
    var L = ctx.level, pr, g, t;
    if (L === 1) {
      pr = R.pick([7, 11, 13, 17, 19, 23]); g = R.int(2, pr - 2); t = prTest(g, pr);
      return { q: 'True or false: $' + g + '$ is a primitive root mod $' + pr + '$.', a: tf(t.ok),
        steps: ['$' + g + '$ is a primitive root when its order is $p - 1 = ' + (pr - 1) + ' = ' + fx(pr - 1) + '$. The order divides ' + (pr - 1) + '; if it were smaller, it would divide $' + (pr - 1) + '/q$ for some prime $q \\mid ' + (pr - 1) + '$.', 'So check $' + g + '^{(p-1)/q}$ mod ' + pr + ' for $q = ' + t.qs.join(', ') + '$: ' + t.lines.map(function (l) { return l.t; }).join(', ') + '.', t.ok ? 'None is 1, so the order is ' + (pr - 1) + ': <b>true</b>.' : 'One of them is 1, so the order is smaller than ' + (pr - 1) + ': <b>false</b>. (Checking $' + g + '^{' + (pr - 1) + '} \\equiv 1$ proves nothing: every nonzero number passes that.)'],
        hint: 'Compute $g^{(p-1)/q}$ for each prime $q$ dividing $' + (pr - 1) + '$. A primitive root never gives 1.' };
    }
    var shape = L === 2 ? R.pick(['smallest', 'smallest', 'exps']) : R.pick(['count', 'which']);
    pr = R.pick(primes(L === 2 ? 11 : 23, L === 2 ? 61 : 97));
    if (shape === 'smallest') {
      var st = ['$p - 1 = ' + (pr - 1) + ' = ' + fx(pr - 1) + '$, so check the exponents ' + primeQs(pr - 1).map(function (q) { return (pr - 1) / q; }).join(', ') + '.'], gg = 2;
      for (; gg < pr; gg++) { t = prTest(gg, pr); st.push('$g = ' + gg + '$: ' + t.lines.map(function (l) { return l.t; }).join(', ') + (t.ok ? '. None is 1: a primitive root.' : '. A 1 appears, so no.')); if (t.ok) break; }
      return { q: 'Find the smallest positive primitive root mod $' + pr + '$.', a: num(gg), steps: st, hint: 'Try $g = 2, 3, 5, \\dots$ and compute $g^{(p-1)/q}$ for each prime $q \\mid ' + (pr - 1) + '$.' };
    }
    if (shape === 'exps') {
      var es = primeQs(pr - 1).map(function (q) { return (pr - 1) / q; });
      return { q: 'To test whether a number $g$ is a primitive root mod $' + pr + '$, which exponents $e$ must you check for $g^{e} \\not\\equiv 1$? Give the exponents $(p - 1)/q$, one for each prime $q$ dividing $p - 1$.', a: setA(es),
        steps: ['$p - 1 = ' + (pr - 1) + ' = ' + fx(pr - 1) + '$, with prime factors ' + primeQs(pr - 1).join(', ') + '.', 'The exponents are $' + primeQs(pr - 1).map(function (q) { return (pr - 1) + '/' + q + ' = ' + (pr - 1) / q; }).join('$, $') + '$.', 'If the order were a proper divisor of ' + (pr - 1) + ', it would divide one of these, and that power would be 1.'],
        hint: 'Factor $' + (pr - 1) + '$.' };
    }
    if (shape === 'count') return { q: 'How many primitive roots are there mod $' + pr + '$?', a: num(phi(pr - 1)),
      steps: ['If $g$ is one primitive root, the others are exactly the powers $g^{k}$ with $\\gcd(k, ' + (pr - 1) + ') = 1$, because $g^{k}$ has order $' + (pr - 1) + '/\\gcd(k, ' + (pr - 1) + ')$.', 'So there are $\\varphi(p - 1) = \\varphi(' + (pr - 1) + ')$ of them. $' + (pr - 1) + ' = ' + fx(pr - 1) + '$, so $\\varphi(' + (pr - 1) + ') = ' + phi(pr - 1) + '$.'],
      hint: 'Count the $k$ from 1 to $p - 1$ that are coprime to $p - 1$.' };
    g = primRoots(pr)[0]; var ks = R.sample(U.range(2, pr - 2), 4), yes = [];
    ks.forEach(function (k, i) { if (gcd(k, pr - 1) === 1) yes.push(i); });
    if (!yes.length) { var kc = [1, 5, 7, 11, 13].filter(function (k) { return gcd(k, pr - 1) === 1 && ks.indexOf(k) < 0 && k < pr - 1; })[0] || pr - 2; ks[0] = kc; yes = [0]; }
    return { q: '$' + g + '$ is a primitive root mod $' + pr + '$. Which of these are also primitive roots mod $' + pr + '$? Select all that apply.', a: { t: 'mc', choices: ks.map(function (k) { return '$' + g + '^{' + k + '}$'; }), v: yes },
      steps: ['$' + g + '^{k}$ has order $' + (pr - 1) + '/\\gcd(k, ' + (pr - 1) + ')$, so it is a primitive root exactly when $\\gcd(k, ' + (pr - 1) + ') = 1$.', ks.map(function (k) { return '$\\gcd(' + k + ', ' + (pr - 1) + ') = ' + gcd(k, pr - 1) + '$'; }).join(', ') + '.'],
      hint: 'Compare each exponent with $p - 1 = ' + (pr - 1) + '$.' };
  });

  G('nt.discrete-logs', function (R, ctx) {
    var L = ctx.level, shape = L === 2 ? R.pick(['find', 'rule', 'rule']) : L === 3 ? R.pick(['find', 'rule']) : 'find';
    var pr = R.pick(L === 1 ? [7, 11, 13, 17, 19] : L === 2 ? primes(11, 31) : primes(23, 41)), g = primRoots(pr)[0], k, h;
    if (shape === 'find') {
      k = R.int(2, pr - 2); h = powmod(g, k, pr); var list = []; for (var i = 1; i <= k; i++) list.push(powmod(g, i, pr));
      return { q: '$' + g + '$ is a primitive root mod $' + pr + '$. Find the $k$ with $0 \\le k \\le ' + (pr - 2) + '$ and $' + g + '^{k} \\equiv ' + h + pmod(pr) + '$.', a: num(k),
        steps: ['List the powers of ' + g + ', multiplying by ' + g + ' and reducing each time: ' + powListTex(g, pr, list) + '.', 'The power $' + g + '^{' + k + '}$ gives $' + h + '$, so the discrete logarithm is $k = ' + k + '$. (Checking it takes one power; finding it took a search.)'],
        hint: 'Multiply by ' + g + ' repeatedly until you reach ' + h + '.' };
    }
    var a = R.int(2, pr - 1), b = R.int(2, pr - 1), s = 0, t = 0;
    for (var e = 0; e < pr - 1; e++) { if (powmod(g, e, pr) === a) s = e; if (powmod(g, e, pr) === b) t = e; }
    if (s + t < pr - 1 && R.chance(0.7)) { b = powmod(g, pr - 2 - R.int(0, Math.max(0, s - 1)), pr); for (e = 0; e < pr - 1; e++) if (powmod(g, e, pr) === b) t = e; }
    var ab = mulmod(a, b, pr), ans = (s + t) % (pr - 1);
    if (powmod(g, ans, pr) !== ab) throw new Error('dlog rule');
    return { q: 'Mod $' + pr + '$, with the primitive root $g = ' + g + '$: $\\log_{' + g + '} ' + a + ' = ' + s + '$ and $\\log_{' + g + '} ' + b + ' = ' + t + '$. Find $\\log_{' + g + '}(' + ab + ')$ as a number from 0 to ' + (pr - 2) + '. (Note $' + a + ' \\cdot ' + b + ' \\equiv ' + ab + pmod(pr) + '$.)', a: num(ans),
      steps: ['$' + g + '^{' + s + '} \\cdot ' + g + '^{' + t + '} = ' + g + '^{' + (s + t) + '}$, so logarithms add, just like ordinary logarithms.', 'But exponents of $g$ only matter mod $p - 1 = ' + (pr - 1) + '$ (Fermat), not mod $' + pr + '$: $' + (s + t) + ' \\equiv ' + ans + pmod(pr - 1) + '$.', 'So $\\log_{' + g + '}(' + ab + ') = ' + ans + '$. Check: $' + g + '^{' + ans + '} \\equiv ' + ab + pmod(pr) + '$.'],
      hint: 'Add the logarithms, then reduce mod $p - 1$.' };
  });

  // ================================================================ Unit 6: cryptography
  var WORDS = ['MATH', 'PRIME', 'CODE', 'KEY', 'ROOK', 'SAFE', 'LOCK', 'GOLD', 'TOWER', 'CIPHER', 'SECRET', 'EULER', 'GAUSS', 'RIVER', 'LADDER', 'PROOF', 'DOOR', 'MAP', 'BOOK', 'NOTE', 'STAR', 'MOON', 'GATE', 'TRUE'];
  var UNITS26 = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
  function affEnc(w, a, b) { return word2nums(w).map(function (x) { return LET(mod(a * x + b, 26)); }).join(''); }
  G('nt.affine-ciphers', function (R, ctx) {
    var L = ctx.level, shape = L === 1 ? R.pick(['shiftE', 'shiftD']) : L === 2 ? R.pick(['affE', 'affE', 'key']) : R.pick(['affD', 'affD', 'valid']);
    var w = R.pick(WORDS), a, b, xs, st;
    if (shape === 'valid') {
      var ch = R.sample(UNITS26.slice(1), R.int(1, 3)), bad = R.sample([2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24], 4 - ch.length), all = R.shuffle(ch.concat(bad)), yes = [];
      all.forEach(function (x, i) { if (gcd(x, 26) === 1) yes.push(i); });
      return { q: 'For the cipher $x \\mapsto ax + 3 \\pmod{26}$, which values of $a$ give a cipher that can be decrypted? Select all that apply.', a: { t: 'mc', choices: all.map(String), v: yes },
        steps: ['Decrypting needs $a^{-1}$ mod 26, which exists exactly when $\\gcd(a, 26) = 1$, that is, when $a$ is odd and not 13.', all.map(function (x) { return '$\\gcd(' + x + ', 26) = ' + gcd(x, 26) + '$'; }).join(', ') + '.', 'If $\\gcd(a, 26) > 1$, two letters get the same cipher letter (for example $a = 2$ sends A and N both to D), so the message cannot be read back.'],
        hint: 'Which $a$ have an inverse mod 26?' };
    }
    if (shape === 'key') {
      a = R.pick(UNITS26.slice(1)); var ia = inv(a, 26);
      return { q: 'Messages were encrypted with $x \\mapsto ' + a + 'x + ' + R.int(1, 25) + ' \\pmod{26}$. To decrypt, you multiply by $a^{-1}$. Find $' + a + '^{-1}$ mod 26 (from 0 to 25).', a: num(ia), steps: invSteps(a, 26).steps, hint: 'Find $x$ with $' + a + 'x \\equiv 1 \\pmod{26}$.' };
    }
    xs = word2nums(w);
    if (shape === 'shiftE' || shape === 'shiftD') {
      b = R.int(3, 23); var enc = affEnc(w, 1, b), dec = shape === 'shiftD';
      st = ['Letters as numbers (A = 0, …, Z = 25): ' + (dec ? enc : w).split('').map(function (c) { return c + ' = ' + (c.charCodeAt(0) - 65); }).join(', ') + '.', dec ? 'Decrypt with $x \\mapsto x - ' + b + ' \\pmod{26}$ (add 26 to any negative result): ' + word2nums(enc).map(function (y) { return y + ' - ' + b + ' \\equiv ' + mod(y - b, 26); }).map(function (s) { return '$' + s + '$'; }).join(', ') + '.' : 'Add ' + b + ' and reduce mod 26: ' + xs.map(function (x) { return '$' + x + ' + ' + b + ' = ' + (x + b) + (x + b >= 26 ? ' \\equiv ' + (x + b - 26) : '') + '$'; }).join(', ') + '.', 'Back to letters: <b>' + (dec ? w : enc) + '</b>.'];
      return { q: dec ? 'The message <b>' + enc + '</b> was encrypted with the shift cipher $x \\mapsto x + ' + b + ' \\pmod{26}$. Decrypt it.' : 'Encrypt <b>' + w + '</b> with the shift cipher $x \\mapsto x + ' + b + ' \\pmod{26}$ (A = 0, B = 1, …, Z = 25).', a: { t: 'text', v: [dec ? w : enc] }, steps: st, hint: dec ? 'Subtract ' + b + ' from each letter\'s number, wrapping around mod 26.' : 'Add ' + b + ' to each letter\'s number, wrapping around mod 26.' };
    }
    a = R.pick(UNITS26.slice(1)); b = R.int(1, 25);
    if (shape === 'affE') {
      var c = affEnc(w, a, b);
      st = ['Letters as numbers: ' + w.split('').map(function (ch, i) { return ch + ' = ' + xs[i]; }).join(', ') + '.', 'Apply $x \\mapsto ' + a + 'x + ' + b + '$ and reduce mod 26: ' + xs.map(function (x) { return '$' + a + ' \\cdot ' + x + ' + ' + b + ' = ' + (a * x + b) + ' \\equiv ' + mod(a * x + b, 26) + '$'; }).join(', ') + '.', 'Back to letters: <b>' + c + '</b>.'];
      return { q: 'Encrypt <b>' + w + '</b> with the affine cipher $x \\mapsto ' + a + 'x + ' + b + ' \\pmod{26}$ (A = 0, …, Z = 25).', a: { t: 'text', v: [c] }, steps: st, hint: 'Turn each letter into a number, compute $' + a + 'x + ' + b + '$, reduce mod 26 and turn it back into a letter.' };
    }
    var cw = affEnc(w, a, b), ia2 = inv(a, 26), ys = word2nums(cw);
    st = ['Undo $y = ' + a + 'x + ' + b + '$: subtract ' + b + ', then multiply by $' + a + '^{-1}$. Dividing by ' + a + ' as an ordinary number would not work.', '$' + a + '^{-1} \\equiv ' + ia2 + ' \\pmod{26}$, since $' + a + ' \\cdot ' + ia2 + ' = ' + a * ia2 + ' = 26 \\cdot ' + Math.floor(a * ia2 / 26) + ' + 1$. So decrypt with $x \\equiv ' + ia2 + '(y - ' + b + ')$.', cw.split('').map(function (ch, i) { return ch + ' = ' + ys[i] + ': $' + ia2 + '(' + ys[i] + ' - ' + b + ') = ' + ia2 * (ys[i] - b) + ' \\equiv ' + mod(ia2 * (ys[i] - b), 26) + '$'; }).join('; ') + '.', 'Back to letters: <b>' + w + '</b>.'];
    return { q: 'The message <b>' + cw + '</b> was encrypted with $x \\mapsto ' + a + 'x + ' + b + ' \\pmod{26}$. Decrypt it.', a: { t: 'text', v: [w] }, steps: st, hint: 'Find $' + a + '^{-1}$ mod 26 first; then $x \\equiv ' + a + '^{-1}(y - ' + b + ')$.' };
  });

  G('nt.diffie-hellman', function (R, ctx) {
    var L = ctx.level, shape = L === 1 ? 'pub' : L === 2 ? 'key' : R.pick(['eve', 'mc']);
    var pr = R.pick(L === 3 ? primes(11, 29) : primes(23, 97)), g = primRoots(pr)[0], a = R.int(3, pr - 3), b = R.int(3, pr - 3), A = powmod(g, a, pr), B = powmod(g, b, pr), K = powmod(g, a * b, pr), f;
    if (shape === 'pub') { f = fastPow(g, a, pr); return { q: 'Public: the prime $p = ' + pr + '$ and $g = ' + g + '$. Alice picks the secret $a = ' + a + '$. What number $A = g^{a} \\bmod p$ does she send?', a: num(A), steps: f.steps.concat(['Alice sends $A = ' + A + '$ in public; her $a$ stays secret.']), hint: 'Compute $' + g + '^{' + a + '}$ mod ' + pr + ' by repeated squaring.' }; }
    if (shape === 'key') { f = fastPow(B, a, pr); if (f.v !== K) throw new Error('dh'); return { q: 'Diffie–Hellman with $p = ' + pr + '$ and $g = ' + g + '$. Alice\'s secret is $a = ' + a + '$, and Bob sends $B = ' + B + '$. What shared key does Alice compute?', a: num(K), steps: ['Alice raises Bob\'s number to her own secret: $K = B^{a} = ' + B + '^{' + a + '} \\bmod ' + pr + '$.'].concat(f.steps, ['Bob gets the same key from $A^{b}$, because $(g^{b})^{a} = g^{ab} = (g^{a})^{b}$.']), hint: 'Use $B^{a}$, not $A \\cdot B$.' }; }
    if (shape === 'mc') return { q: 'In Diffie–Hellman, Alice sends $A = g^{a}$ and Bob sends $B = g^{b}$ (mod $p$). Which number is their shared secret key?', a: mcA('$g^{ab} \\bmod p$, which Alice finds as $B^{a}$ and Bob as $A^{b}$', ['$g^{a + b} \\bmod p$, which both find as $A \\cdot B$', '$A + B \\bmod p$', '$g^{a - b} \\bmod p$']),
      steps: ['Alice knows $a$ and $B$: $B^{a} = (g^{b})^{a} = g^{ab}$. Bob knows $b$ and $A$: $A^{b} = (g^{a})^{b} = g^{ab}$. Same number.', '$A \\cdot B = g^{a + b}$ is no secret: an eavesdropper sees $A$ and $B$ and can multiply them.'], hint: 'What can each person compute with their own secret and the other\'s public number?' };
    var list = []; for (var i = 1; i <= a; i++) list.push(powmod(g, i, pr));
    return { q: 'Eve sees $p = ' + pr + '$, $g = ' + g + '$, $A = ' + A + '$ and $B = ' + B + '$. The prime is small, so she can find Alice\'s secret $a$ by trying powers. What is the shared key $g^{ab} \\bmod ' + pr + '$?', a: num(K),
      steps: ['Find $a$ with $' + g + '^{a} \\equiv ' + A + '$: ' + powListTex(g, pr, list) + '. So $a = ' + a + '$.', 'Then the key is $B^{a} = ' + B + '^{' + a + '} \\equiv ' + K + pmod(pr) + '$.', 'With a prime of hundreds of digits this search is hopeless, which is what keeps the key safe.'],
      hint: 'Solve the discrete log $' + g + '^{a} \\equiv ' + A + '$ by listing powers, then compute $B^{a}$.' };
  });

  G('nt.rsa', function (R, ctx) {
    var L = ctx.level, ps = primes(5, L === 3 ? 31 : 43), pr = R.pick(ps), q; do { q = R.pick(ps); } while (q === pr);
    var n = pr * q, ph = (pr - 1) * (q - 1), e; do { e = R.pick([3, 5, 7, 11, 13, 17]); } while (gcd(e, ph) !== 1);
    var d = inv(e, ph), st;
    if (L === 1) return { q: 'RSA with $p = ' + pr + '$ and $q = ' + q + '$. Find the modulus $n$ and $\\varphi(n)$.', a: multi([['$n =$', num(n)], ['$\\varphi(n) =$', num(ph)]]), steps: ['$n = pq = ' + pr + ' \\cdot ' + q + ' = ' + n + '$.', 'The numbers from 1 to $n$ that share a factor with $n$ are the multiples of ' + pr + ' or of ' + q + ', so $\\varphi(n) = (p - 1)(q - 1) = ' + (pr - 1) + ' \\cdot ' + (q - 1) + ' = ' + ph + '$.'], hint: '$\\varphi(pq) = (p - 1)(q - 1)$ for distinct primes.' };
    if (L === 2) { var iv = invSteps(e, ph); return { q: 'RSA with $p = ' + pr + '$, $q = ' + q + '$ and public exponent $e = ' + e + '$. Find the private exponent $d$: the inverse of $e$ mod $\\varphi(n)$, from 1 to $\\varphi(n) - 1$.', a: num(d), steps: ['$\\varphi(n) = (' + pr + ' - 1)(' + q + ' - 1) = ' + ph + '$. (Not mod $n = ' + n + '$: Euler\'s theorem works with $\\varphi(n)$.)'].concat(iv.steps), hint: 'Find $\\varphi(n) = (p - 1)(q - 1)$, then solve $' + e + 'd \\equiv 1 \\pmod{\\varphi(n)}$.' }; }
    var m; do { m = R.int(2, n - 2); } while (gcd(m, n) !== 1); var c = powmod(m, e, n), dec = R.coin(), f = dec ? fastPow(c, d, n) : fastPow(m, e, n);
    if (dec && f.v !== m) throw new Error('rsa');
    if (dec) return { q: 'RSA: $n = ' + n + '$ $(= ' + pr + ' \\cdot ' + q + ')$, $e = ' + e + '$, and the private key is $d = ' + d + '$. Decrypt the ciphertext $c = ' + c + '$: find $m = c^{d} \\bmod n$.', a: num(m), steps: f.steps.concat(['Check: $' + m + '^{' + e + '} \\equiv ' + c + pmod(n) + '$, the ciphertext we started with.']), hint: 'Compute $' + c + '^{' + d + '}$ mod ' + n + ' by repeated squaring, reducing after every multiplication.' };
    return { q: 'RSA: the public key is $(n, e) = (' + n + ', ' + e + ')$. Encrypt the message $m = ' + m + '$: find $c = m^{e} \\bmod n$.', a: num(c), steps: f.steps, hint: 'Compute $' + m + '^{' + e + '}$ mod ' + n + ', reducing after every multiplication.' };
  });


  // ================================================================ Unit 7: quadratic residues
  var LEGNOTE = ' (The symbol $\\left(\\frac{a}{p}\\right)$ is not a fraction: it is $1$ when $a$ is a nonzero square mod $p$ and $-1$ when it is not.)';
  function sqTable(pr) { var out = []; for (var x = 1; x <= (pr - 1) / 2; x++) out.push('$' + x + '^{2} = ' + x * x + (x * x >= pr ? ' \\equiv ' + mod(x * x, pr) : '') + '$'); return out.join(', '); }
  function squaresMod(n) { var s = {}; for (var x = 1; x < n; x++) s[mod(x * x, n)] = 1; return Object.keys(s).map(Number).filter(function (v) { return v; }).sort(function (a, b) { return a - b; }); }
  G('nt.quadratic-residues', function (R, ctx) {
    var L = ctx.level, pr, a, sols;
    if (L === 1 && R.chance(0.6)) { // is a a square mod p?
      var pq = R.pick([5, 7, 11, 13, 17, 19, 23, 29]), sqq = squaresMod(pq), aq = R.int(2, pq - 1), yes = sqq.indexOf(aq) >= 0;
      return { q: 'Is $' + aq + '$ a square mod $' + pq + '$? (Is there an $x$ with $x^{2} \\equiv ' + aq + pmod(pq) + '$?)', a: { t: 'mc', choices: ['Yes', 'No'], v: yes ? 0 : 1, keep: true },
        steps: ['Square $x = 1, 2, \\dots, ' + (pq - 1) / 2 + '$: ' + sqTable(pq) + '.', 'The values $' + pq + ' - x$ repeat these squares, so the nonzero squares mod ' + pq + ' are ' + sqq.join(', ') + '.', yes ? aq + ' is on the list, so the answer is yes.' : aq + ' is not on the list, so the answer is no.'],
        hint: 'Square 1, 2, … up to ' + (pq - 1) / 2 + ' and reduce mod ' + pq + '.' };
    }
    if (L === 1) {
      pr = R.pick([5, 7, 11, 13, 17, 19, 23]); var sq = squaresMod(pr);
      return { q: 'List the nonzero squares mod $' + pr + '$: every $a$ from 1 to ' + (pr - 1) + ' with $x^{2} \\equiv a' + pmod(pr) + '$ for some $x$.', a: setA(sq),
        steps: ['Square $x = 1, 2, \\dots, ' + (pr - 1) / 2 + '$: ' + sqTable(pr) + '.', 'No need to go further: $(' + pr + ' - x)^{2} \\equiv (-x)^{2} = x^{2}$, so $x$ and $' + pr + ' - x$ give the same square.', 'The nonzero squares are ' + sq.join(', ') + ': exactly $(' + pr + ' - 1)/2 = ' + sq.length + '$ of them.'],
        hint: 'Square 1, 2, … up to ' + (pr - 1) / 2 + '. The rest repeat these.' };
    }
    if (L === 2) {
      pr = R.pick(primes(7, 31)); var sqs = squaresMod(pr); a = R.chance(0.65) ? R.pick(sqs) : R.pick(U.range(2, pr - 1).filter(function (v) { return sqs.indexOf(v) < 0; }));
      sols = []; for (var x = 0; x < pr; x++) if (mod(x * x - a, pr) === 0) sols.push(x);
      return { q: 'Solve $x^{2} \\equiv ' + a + pmod(pr) + '$. Give every solution with $0 \\le x < ' + pr + '$, or say there is none.', a: setA(sols),
        steps: ['Square $x = 1, \\dots, ' + (pr - 1) / 2 + '$: ' + sqTable(pr) + '.', sols.length ? '$' + sols[0] + '^{2} \\equiv ' + a + '$, and then also $(' + pr + ' - ' + sols[0] + ')^{2} = ' + sols[1] + '^{2} \\equiv ' + a + '$. Mod a prime there are no others: $x^{2} \\equiv ' + sols[0] + '^{2}$ means $' + pr + ' \\mid (x - ' + sols[0] + ')(x + ' + sols[0] + ')$.' : a + ' is not on the list, so it is not a square mod ' + pr + ': <b>no solution</b>.'],
        hint: 'Square the numbers up to ' + (pr - 1) / 2 + '. If one works, its negative works too.' };
    }
    var nn = R.pick([[3, 5], [3, 7], [3, 11], [5, 7], [3, 13], [5, 11]]), P = nn[0], Q = nn[1], N = P * Q;
    do { a = R.chance(0.7) ? mod(R.int(2, N - 1) * R.int(2, N - 1), N) : R.int(2, N - 1); } while (gcd(a, N) !== 1 || a < 2);
    sols = []; for (var y = 0; y < N; y++) if (mod(y * y - a, N) === 0) sols.push(y);
    var sp = [], sq2 = []; for (y = 0; y < P; y++) if (mod(y * y - a, P) === 0) sp.push(y); for (y = 0; y < Q; y++) if (mod(y * y - a, Q) === 0) sq2.push(y);
    return { q: 'Solve $x^{2} \\equiv ' + a + pmod(N) + '$. Give every solution with $0 \\le x < ' + N + '$, or say there is none.', a: setA(sols),
      steps: ['$' + N + ' = ' + P + ' \\cdot ' + Q + '$, so solve mod ' + P + ' and mod ' + Q + ' and combine with the Chinese Remainder Theorem.', 'Mod ' + P + ': $x^{2} \\equiv ' + mod(a, P) + '$ gives ' + (sp.length ? '$x \\equiv ' + sp.join(', ') + '$' : 'no solution') + '. Mod ' + Q + ': $x^{2} \\equiv ' + mod(a, Q) + '$ gives ' + (sq2.length ? '$x \\equiv ' + sq2.join(', ') + '$' : 'no solution') + '.', sols.length ? 'Each pair of choices gives one solution mod ' + N + ': ' + sols.join(', ') + '. That is ' + sols.length + ' solutions, not 2, because the modulus is not prime.' : 'One of the two has no solution, so there is <b>no solution</b> mod ' + N + '.'],
      hint: 'Factor ' + N + ' and solve modulo each prime first.' };
  });

  G('nt.euler-criterion', function (R, ctx) {
    var L = ctx.level, pr, a, h, v, f, st;
    if (L === 3) {
      pr = R.pick(primes(23, 97)); var l2 = legendre(2, pr), l3 = legendre(3, pr), l5 = legendre(5, pr), i, j, k, n;
      do { i = R.int(0, 3); j = R.int(0, 2); k = R.int(0, 2); n = Math.pow(2, i) * Math.pow(3, j) * Math.pow(5, k); } while (n < 6 || (i % 2 === 0 && j % 2 === 0 && k % 2 === 0) || n % pr === 0);
      v = Math.pow(l2, i % 2) * Math.pow(l3, j % 2) * Math.pow(l5, k % 2);
      if (v !== legendre(n, pr)) throw new Error('mult');
      return { q: 'For $p = ' + pr + '$: $' + leg(2, pr) + ' = ' + l2 + '$, $' + leg(3, pr) + ' = ' + l3 + '$ and $' + leg(5, pr) + ' = ' + l5 + '$. Find $' + leg(n, pr) + '$.', a: num(v),
        steps: ['Euler\'s criterion shows the symbol is multiplicative: $\\left(\\frac{ab}{p}\\right) \\equiv (ab)^{(p-1)/2} = a^{(p-1)/2} b^{(p-1)/2} \\equiv \\left(\\frac{a}{p}\\right)\\left(\\frac{b}{p}\\right)$.', '$' + n + ' = ' + fx(n) + '$, so $' + leg(n, pr) + ' = ' + [[2, i, l2], [3, j, l3], [5, k, l5]].filter(function (t) { return t[1]; }).map(function (t) { return leg(t[0], pr) + (t[1] > 1 ? '^{' + t[1] + '}' : ''); }).join('') + '$.', 'Even powers give 1: the value is $' + [[2, i, l2], [3, j, l3], [5, k, l5]].filter(function (t) { return t[1] % 2; }).map(function (t) { return '(' + t[2] + ')'; }).join(' \\cdot ') + ' = ' + v + '$.'],
        hint: 'Factor ' + n + '; the symbol of a product is the product of the symbols.' };
    }
    pr = L === 1 ? R.pick([7, 11, 13, 17, 19, 23]) : R.pick(primes(17, 89)); a = R.int(2, pr - 2); h = (pr - 1) / 2;
    f = L === 1 ? smallPow(a, h, pr) : fastPow(a, h, pr); v = (L === 1 ? f.v : f.v) === 1 ? 1 : -1;
    st = ['Euler\'s criterion: $' + leg(a, pr) + ' \\equiv ' + a + '^{(' + pr + ' - 1)/2} = ' + a + '^{' + h + '}' + pmod(pr) + '$.'];
    st = st.concat(L === 1 ? [f.line + '.'] : f.steps);
    st.push('$' + a + '^{' + h + '} \\equiv ' + (L === 1 ? f.v : f.v) + (v < 0 ? ' \\equiv -1' : '') + pmod(pr) + '$, so $' + leg(a, pr) + ' = ' + v + '$: ' + a + ' is ' + (v > 0 ? 'a square' : 'not a square') + ' mod ' + pr + '.');
    return { q: 'Use Euler\'s criterion to find the Legendre symbol $' + leg(a, pr) + '$ (answer 1 or −1).' + LEGNOTE, a: num(v), steps: st, hint: 'Compute $' + a + '^{' + h + '}$ mod ' + pr + '. It will come out as 1 or ' + (pr - 1) + ' (that is, −1).' };
  });

  G('nt.supplementary-laws', function (R, ctx) {
    var L = ctx.level, pr = R.pick(primes(3, 199)), v;
    if (L === 1) { v = pr % 4 === 1 ? 1 : -1; return { q: 'Find $' + leg(-1, pr) + '$ (answer 1 or −1).' + LEGNOTE, a: num(v), steps: ['$-1$ is a square mod an odd prime $p$ exactly when $p \\equiv 1' + pmod(4) + '$. (Euler: $(-1)^{(p-1)/2}$ is $1$ when $(p - 1)/2$ is even.)', '$' + pr + ' = 4 \\cdot ' + Math.floor(pr / 4) + ' + ' + pr % 4 + '$, so $' + pr + ' \\equiv ' + pr % 4 + pmod(4) + '$ and $' + leg(-1, pr) + ' = ' + v + '$.'], hint: 'Look at $' + pr + '$ mod 4.' }; }
    if (L === 2) { var r8 = pr % 8; v = r8 === 1 || r8 === 7 ? 1 : -1; return { q: 'Find $' + leg(2, pr) + '$ (answer 1 or −1).' + LEGNOTE, a: num(v), steps: ['$2$ is a square mod an odd prime $p$ exactly when $p \\equiv \\pm 1' + pmod(8) + '$, that is, $p \\equiv 1$ or $7$. (The rule for $-1$ uses mod 4; this one needs mod 8.)', '$' + pr + ' = 8 \\cdot ' + Math.floor(pr / 8) + ' + ' + r8 + '$, so $' + pr + ' \\equiv ' + r8 + pmod(8) + '$ and $' + leg(2, pr) + ' = ' + v + '$.'], hint: 'Look at $' + pr + '$ mod 8, not mod 4.' }; }
    if (R.coin()) {
      var m1 = pr % 4 === 1 ? 1 : -1, m2 = pr % 8 === 1 || pr % 8 === 7 ? 1 : -1; v = m1 * m2;
      return { q: 'Find $' + leg(-2, pr) + '$ (answer 1 or −1).', a: num(v), steps: ['The symbol is multiplicative: $' + leg(-2, pr) + ' = ' + leg(-1, pr) + leg(2, pr) + '$.', '$' + pr + ' \\equiv ' + pr % 4 + pmod(4) + '$, so $' + leg(-1, pr) + ' = ' + m1 + '$; $' + pr + ' \\equiv ' + pr % 8 + pmod(8) + '$, so $' + leg(2, pr) + ' = ' + m2 + '$.', 'So $' + leg(-2, pr) + ' = ' + p(m1) + ' \\cdot ' + p(m2) + ' = ' + v + '$.'], hint: 'Split $-2$ as $(-1) \\cdot 2$.' };
    }
    var two = R.coin(), lim = R.pick([50, 60, 70]), ps = primes(3, lim).filter(function (q) { return two ? (q % 8 === 1 || q % 8 === 7) : q % 4 === 1; });
    return { q: 'List every odd prime $p < ' + lim + '$ for which ' + (two ? '$2$' : '$-1$') + ' is a square mod $p$.', a: setA(ps),
      steps: [two ? '$2$ is a square mod $p$ exactly when $p \\equiv 1$ or $7' + pmod(8) + '$.' : '$-1$ is a square mod $p$ exactly when $p \\equiv 1' + pmod(4) + '$.', 'Odd primes below ' + lim + ' with that remainder: ' + ps.join(', ') + '.'],
      hint: two ? 'Reduce each prime mod 8.' : 'Reduce each prime mod 4.' };
  });

  function legEval(a, pr, st) {
    var r = mod(a, pr);
    if (r !== a) st.push('Reduce the top mod ' + pr + ': $' + leg(a, pr) + ' = ' + leg(r, pr) + '$.');
    if (r === 1) { st.push('$' + leg(1, pr) + ' = 1$.'); return 1; }
    if (r === pr - 1) { var vv = pr % 4 === 1 ? 1 : -1; st.push('$' + leg(r, pr) + ' = ' + leg(-1, pr) + ' = ' + vv + '$, since $' + pr + ' \\equiv ' + pr % 4 + pmod(4) + '$.'); return vv; }
    var f = factor(r), odd = f.filter(function (x) { return x[1] % 2; }), v = 1;
    if (f.length > 1 || f[0][1] > 1) st.push('Factor $' + r + ' = ' + fx(r) + '$. The symbol is multiplicative and squares give 1: $' + leg(r, pr) + ' = ' + (odd.length ? odd.map(function (x) { return leg(x[0], pr); }).join('') : '1') + '$.');
    odd.forEach(function (x) { v *= legPrime(x[0], pr, st); });
    return v;
  }
  function legPrime(q, pr, st) {
    if (q === 2) { var r8 = pr % 8, v2 = (r8 === 1 || r8 === 7) ? 1 : -1; st.push('$' + pr + ' \\equiv ' + r8 + pmod(8) + '$, so $' + leg(2, pr) + ' = ' + v2 + '$.'); return v2; }
    var flip = (q % 4 === 3 && pr % 4 === 3) ? -1 : 1;
    st.push('Reciprocity: ' + (flip < 0 ? '$' + q + '$ and $' + pr + '$ are both $\\equiv 3' + pmod(4) + '$, so $' + leg(q, pr) + ' = -' + leg(pr, q) + '$.' : '$' + (q % 4 === 1 ? q : pr) + ' \\equiv 1' + pmod(4) + '$, so $' + leg(q, pr) + ' = ' + leg(pr, q) + '$.'));
    var inner = legEval(pr, q, st), val = flip * inner;
    if (flip < 0) st.push('With the minus sign: $' + leg(q, pr) + ' = -(' + inner + ') = ' + val + '$.');
    return val;
  }
  G('nt.quadratic-reciprocity', function (R, ctx) {
    var L = ctx.level, a, pr, st = [];
    if (L === 1) { do { a = R.pick(primes(3, 60)); pr = R.pick(primes(3, 60)); } while (a === pr || (a % 4 === 3 && pr % 4 === 3)); }
    else if (L === 2) { do { a = R.pick(primes(3, 100)); pr = R.pick(primes(3, 100)); } while (a === pr); }
    else { pr = R.pick(primes(31, 199)); do { a = R.int(6, 300); } while (a % pr === 0 || isPrime(a) || isqrt(a) * isqrt(a) === a); }
    var v = legEval(a, pr, st);
    if (v !== legendre(a, pr)) throw new Error('reciprocity mismatch ' + a + ' ' + pr);
    st.push('So $' + leg(a, pr) + ' = ' + v + '$: ' + a + ' is ' + (v > 0 ? '' : 'not ') + 'a square mod ' + pr + '.');
    return { q: 'Find $' + leg(a, pr) + '$ (answer 1 or −1).' + (L === 1 ? LEGNOTE : ''), a: num(v), steps: st,
      hint: L === 3 ? 'Reduce mod ' + pr + ' and factor the top into primes before flipping anything.' : 'Flip with reciprocity (watch for two primes that are both 3 mod 4), then reduce the new top.' };
  });

  // ================================================================ Unit 8: Diophantine equations and continued fractions
  function goodMN(R, maxM) { var m, n; do { m = R.int(2, maxM); n = R.int(1, m - 1); } while (gcd(m, n) !== 1 || (m - n) % 2 === 0); return [m, n]; }
  G('nt.pythagorean-triples', function (R, ctx) {
    var L = ctx.level, mn, m, n, A, B, C, shape = L === 1 ? R.pick(['gen', 'gen', 'complete']) : L === 2 ? R.pick(['prim', 'findmn', 'complete']) : R.pick(['count', 'odd', 'complete', 'complete']);
    if (shape === 'complete') {
      mn = goodMN(R, 12); m = mn[0]; n = mn[1]; A = m * m - n * n; B = 2 * m * n; C = m * m + n * n; var miss = R.int(0, 2), lg2 = [A, B].sort(function (x, y) { return x - y; });
      if (miss === 2) return { q: 'The legs of a right triangle are $' + lg2[0] + '$ and $' + lg2[1] + '$. How long is the hypotenuse?', a: num(C), steps: ['$c^{2} = ' + lg2[0] + '^{2} + ' + lg2[1] + '^{2} = ' + cm(lg2[0] * lg2[0]) + ' + ' + cm(lg2[1] * lg2[1]) + ' = ' + cm(C * C) + '$.', '$c = ' + C + '$. It is the primitive triple from $m = ' + m + '$, $n = ' + n + '$: $m^{2} + n^{2} = ' + C + '$.'], hint: 'One leg is odd and one is even; guess $m$ and $n$ from the even leg $2mn$, or just use $a^{2} + b^{2} = c^{2}$.' };
      var known = lg2[miss === 0 ? 1 : 0], other = lg2[miss];
      return { q: 'A primitive Pythagorean triple has hypotenuse $' + C + '$ and one leg $' + known + '$. Find the other leg.', a: num(other), steps: ['$b^{2} = ' + C + '^{2} - ' + known + '^{2} = ' + cm(C * C) + ' - ' + cm(known * known) + ' = ' + cm(other * other) + '$.', '$b = ' + other + '$. With $m = ' + m + '$, $n = ' + n + '$: $(m^{2} - n^{2}, 2mn, m^{2} + n^{2}) = (' + A + ', ' + B + ', ' + C + ')$.'], hint: 'Use $b^{2} = c^{2} - a^{2}$, or factor it as $(c - a)(c + a)$.' };
    }
    if (shape === 'gen') {
      mn = R.chance(0.6) ? goodMN(R, 14) : (function () { var mm = R.int(2, 12); return [mm, R.int(1, mm - 1)]; })(); m = mn[0]; n = mn[1]; A = m * m - n * n; B = 2 * m * n; C = m * m + n * n;
      return { q: 'Use $m = ' + m + '$ and $n = ' + n + '$ in $(m^{2} - n^{2},\\ 2mn,\\ m^{2} + n^{2})$.', a: multi([['$m^{2} - n^{2} =$', num(A)], ['$2mn =$', num(B)], ['$m^{2} + n^{2} =$', num(C)]]),
        steps: ['$m^{2} - n^{2} = ' + m * m + ' - ' + n * n + ' = ' + A + '$, $2mn = 2 \\cdot ' + m + ' \\cdot ' + n + ' = ' + B + '$, $m^{2} + n^{2} = ' + C + '$.', 'Check: $' + A + '^{2} + ' + B + '^{2} = ' + cm(A * A) + ' + ' + cm(B * B) + ' = ' + cm(C * C) + ' = ' + C + '^{2}$.', '$m$ and $n$ are coprime with one even and one odd, so the triple is primitive.'],
        hint: 'Square $m$ and $n$, then subtract, multiply and add.' };
    }
    if (shape === 'prim') {
      var kind = R.pick(['good', 'mult', 'odd']), tri;
      if (kind === 'good') { mn = goodMN(R, 9); tri = [mn[0] * mn[0] - mn[1] * mn[1], 2 * mn[0] * mn[1], mn[0] * mn[0] + mn[1] * mn[1]]; }
      else if (kind === 'mult') { mn = goodMN(R, 5); var k = R.int(2, 4); tri = [k * (mn[0] * mn[0] - mn[1] * mn[1]), k * 2 * mn[0] * mn[1], k * (mn[0] * mn[0] + mn[1] * mn[1])]; }
      else { do { m = R.pick([3, 5, 7, 9]); n = R.pick([1, 3, 5, 7]); } while (n >= m || gcd(m, n) !== 1); tri = [m * m - n * n, 2 * m * n, m * m + n * n]; }
      var g = gcd(gcd(tri[0], tri[1]), tri[2]), lg = tri.slice(0, 2).sort(function (x, y) { return x - y; });
      return { q: 'True or false: $(' + lg[0] + ', ' + lg[1] + ', ' + tri[2] + ')$ is a <b>primitive</b> Pythagorean triple.', a: tf(g === 1),
        steps: ['It is a Pythagorean triple: $' + lg[0] + '^{2} + ' + lg[1] + '^{2} = ' + cm(tri[2] * tri[2]) + ' = ' + tri[2] + '^{2}$.', 'Primitive means the three numbers have no common factor above 1. $\\gcd(' + lg[0] + ', ' + lg[1] + ', ' + tri[2] + ') = ' + g + '$.', g === 1 ? '<b>True.</b>' : '<b>False</b>: it is $' + g + ' \\times (' + lg.map(function (x) { return x / g; }).join(', ') + ', ' + tri[2] / g + ')$.' + (kind === 'odd' ? ' It comes from $m = ' + m + '$, $n = ' + n + '$, both odd, which always makes every side even.' : '')],
        hint: 'Look for a common factor of all three numbers.' };
    }
    if (shape === 'findmn') {
      mn = goodMN(R, 12); m = mn[0]; n = mn[1]; A = m * m - n * n; B = 2 * m * n; C = m * m + n * n;
      return { q: 'The primitive triple $(' + A + ', ' + B + ', ' + C + ')$ has the odd leg $' + A + ' = m^{2} - n^{2}$ and the hypotenuse $' + C + ' = m^{2} + n^{2}$. Find $m$ and $n$.', a: multi([['$m =$', num(m)], ['$n =$', num(n)]]),
        steps: ['Add the two equations: $2m^{2} = ' + C + ' + ' + A + ' = ' + (C + A) + '$, so $m^{2} = ' + (C + A) / 2 + '$ and $m = ' + m + '$.', 'Subtract: $2n^{2} = ' + C + ' - ' + A + ' = ' + (C - A) + '$, so $n^{2} = ' + (C - A) / 2 + '$ and $n = ' + n + '$.', 'Check the even leg: $2mn = 2 \\cdot ' + m + ' \\cdot ' + n + ' = ' + B + '$.'],
        hint: 'Add and subtract $m^{2} - n^{2}$ and $m^{2} + n^{2}$.' };
    }
    if (shape === 'odd') {
      do { m = R.pick([3, 5, 7, 9]); n = R.pick([1, 3, 5, 7]); } while (n >= m || gcd(m, n) !== 1);
      A = m * m - n * n; B = 2 * m * n; C = m * m + n * n; var hp = [B / 2, A / 2, C / 2];
      return { q: 'With $m = ' + m + '$ and $n = ' + n + '$ (both odd), the formula gives $(' + A + ', ' + B + ', ' + C + ')$, which is not primitive. It is twice a primitive triple $(a, b, c)$ with $a$ odd. Find it.', a: multi([['$a =$', num(Math.min(hp[0], hp[1]) % 2 ? Math.min(hp[0], hp[1]) : Math.max(hp[0], hp[1]))], ['$b =$', num(Math.min(hp[0], hp[1]) % 2 ? Math.max(hp[0], hp[1]) : Math.min(hp[0], hp[1]))], ['$c =$', num(C / 2)]]),
        steps: ['$m$ and $n$ both odd make $m^{2} - n^{2}$, $2mn$ and $m^{2} + n^{2}$ all even.', 'Halve them: $(' + A / 2 + ', ' + B / 2 + ', ' + C / 2 + ')$, and $' + (A / 2) + '^{2} + ' + (B / 2) + '^{2} = ' + cm(C * C / 4) + ' = ' + C / 2 + '^{2}$.', 'The odd leg is $' + (hp[0] % 2 ? hp[0] : hp[1]) + '$. (It comes from $m\' = ' + (m + n) / 2 + '$, $n\' = ' + (m - n) / 2 + '$, which are coprime and of opposite parity.)'],
        hint: 'Divide every side by 2.' };
    }
    var Nh = R.int(3, 15) * 10, list = [];
    for (m = 2; m * m < Nh; m++) for (n = 1; n < m; n++) if (gcd(m, n) === 1 && (m - n) % 2 && m * m + n * n < Nh) list.push([m, n, m * m - n * n, 2 * m * n, m * m + n * n]);
    return { q: 'How many primitive Pythagorean triples have hypotenuse less than $' + Nh + '$? (Count each triple once, whatever the order of its legs.)', a: num(list.length),
      steps: ['Every primitive triple comes from exactly one pair $m > n > 0$, coprime and of opposite parity, with hypotenuse $m^{2} + n^{2}$.', 'Pairs with $m^{2} + n^{2} < ' + Nh + '$: ' + list.map(function (t) { return '$(' + t[0] + ', ' + t[1] + ') \\to (' + t[2] + ', ' + t[3] + ', ' + t[4] + ')$'; }).join(', ') + '.', 'That is <b>' + list.length + '</b>.'],
      hint: 'List the pairs $(m, n)$ with $m^{2} + n^{2} < ' + Nh + '$, then keep the coprime ones of opposite parity.' };
  });

  function twoSq(n) { for (var b = 0; 2 * b * b <= n; b++) { var r = n - b * b, a = isqrt(r); if (a * a === r) return [a, b]; } return null; }
  function s2sReason(n) { var f = factor(n), bad = f.filter(function (x) { return x[0] % 4 === 3; }); return { ok: bad.every(function (x) { return x[1] % 2 === 0; }), f: f, bad: bad }; }
  function s2sSteps(n) {
    var s = s2sReason(n), rep = twoSq(n), st = ['$' + n + ' = ' + fx(n) + '$.'];
    if (!s.bad.length) st.push('No prime $\\equiv 3' + pmod(4) + '$ appears, so ' + n + ' is a sum of two squares.');
    else st.push('Primes $\\equiv 3' + pmod(4) + '$: ' + s.bad.map(function (x) { return '$' + x[0] + '$ to the power ' + x[1] + ' (' + (x[1] % 2 ? 'odd' : 'even') + ')'; }).join(', ') + '. ' + (s.ok ? 'All even powers, so it is a sum of two squares.' : 'An odd power, so it is <b>not</b> a sum of two squares.'));
    if (rep) st.push('Indeed $' + n + ' = ' + rep[0] + '^{2} + ' + rep[1] + '^{2}$.');
    if (!!rep !== s.ok) throw new Error('s2s');
    return st;
  }
  G('nt.sums-of-two-squares', function (R, ctx) {
    var L = ctx.level, n;
    if (L === 1) { n = R.int(10, 150); return { q: 'True or false: $' + n + '$ is a sum of two squares of integers ($0$ allowed).', a: tf(!!twoSq(n)), steps: s2sSteps(n), nolint: ['+ 0'], hint: 'Factor ' + n + ' and look at the primes that are 3 mod 4.' }; }
    if (L === 2) {
      var pr = R.pick(primes(5, 250).filter(function (q) { return q % 4 === 1; })), rep = twoSq(pr), a = rep[0], b = rep[1], tries = [];
      for (var y = 1; y <= b; y++) { var r = pr - y * y; tries.push('$' + pr + ' - ' + y + '^{2} = ' + r + '$' + (isqrt(r) * isqrt(r) === r ? ' $= ' + isqrt(r) + '^{2}$' : '')); }
      return { q: 'The prime $' + pr + '$ is $1 \\bmod 4$, so it is a sum of two squares. Find $a > b > 0$ with $a^{2} + b^{2} = ' + pr + '$.', a: multi([['$a =$', num(a)], ['$b =$', num(b)]]),
        steps: ['Try $b = 1, 2, 3, \\dots$ and test whether $' + pr + ' - b^{2}$ is a square: ' + tries.join(', ') + '.', 'So $' + pr + ' = ' + a + '^{2} + ' + b + '^{2}$. (For a prime the way is unique, apart from order and signs.)'],
        hint: 'Subtract $1, 4, 9, 16, \\dots$ from ' + pr + ' until a perfect square is left.' };
    }
    var pool = [45, 49, 63, 72, 90, 98, 117, 125, 147, 153, 162, 175, 189, 196, 200, 207, 225, 231, 245, 250, 261, 275, 289, 300, 325, 333, 338, 343, 351, 360, 369, 378, 392, 405, 441, 450], ch, yes;
    do { ch = R.sample(pool, 4); yes = []; ch.forEach(function (v, i) { if (twoSq(v)) yes.push(i); }); } while (!yes.length || yes.length === 4);
    return { q: 'Which of these are sums of two squares of integers ($0$ allowed)? Select all that apply.', a: { t: 'mc', choices: ch.map(String), v: yes }, nolint: ['+ 0'],
      steps: ['$n$ is a sum of two squares exactly when every prime $\\equiv 3' + pmod(4) + '$ appears in $n$ to an even power.'].concat(ch.map(function (v) { var s = s2sReason(v), rp = twoSq(v); return '$' + v + ' = ' + fx(v) + '$: ' + (s.ok ? 'yes, $' + v + ' = ' + rp[0] + '^{2} + ' + rp[1] + '^{2}$.' : 'no (' + s.bad.filter(function (x) { return x[1] % 2; }).map(function (x) { return x[0]; }).join(', ') + ' to an odd power).'); })),
      hint: 'Factor each one. A prime that is 3 mod 4 is allowed only to an even power.' };
  });

  function cfOf(a, b) { var q = []; while (b) { var t = Math.floor(a / b); q.push(t); var r = a - t * b; a = b; b = r; } return q; }
  function cfValue(qs) { var p2 = 0, p1 = 1, q2 = 1, q1 = 0; qs.forEach(function (q) { var pn = q * p1 + p2, qn = q * q1 + q2; p2 = p1; p1 = pn; q2 = q1; q1 = qn; }); return [p1, q1]; }
  function convergents(qs) { var p2 = 0, p1 = 1, q2 = 1, q1 = 0, out = []; qs.forEach(function (q) { var pn = q * p1 + p2, qn = q * q1 + q2; out.push([pn, qn]); p2 = p1; p1 = pn; q2 = q1; q1 = qn; }); return out; }
  function cfTex(qs) { return '[' + qs[0] + (qs.length > 1 ? '; ' + qs.slice(1).join(', ') : '') + ']'; }
  G('nt.continued-fractions', function (R, ctx) {
    var L = ctx.level, shape = L === 1 ? 'toCF' : L === 2 ? R.pick(['fromCF', 'fromCF', 'toCF']) : R.pick(['conv', 'below1']);
    var qs = [R.int(1, 5)], k = L === 1 ? R.int(2, 3) : 3; for (var i = 0; i < k; i++) qs.push(R.int(1, 6)); if (qs[qs.length - 1] === 1) qs[qs.length - 1] = R.int(2, 6);
    if (shape === 'below1') qs[0] = 0;
    var ab = cfValue(qs), a = ab[0], b = ab[1];
    if (shape === 'toCF' || shape === 'below1') {
      var rows = euclidRows(a, b);
      return { q: 'Write $\\dfrac{' + a + '}{' + b + '}$ as a continued fraction $[q_0; q_1, q_2, \\dots]$. Enter the partial quotients $q_0, q_1, \\dots$ separated by commas' + (qs[0] === 0 ? ' (start with $q_0 = 0$)' : '') + '.', a: { t: 'tuple', v: qs.map(String) },
        steps: ['Run the Euclidean algorithm on ' + a + ' and ' + b + ': ' + rows.map(function (r) { return '$' + divTex(r.A, r.B, r.q, r.r) + '$'; }).join(', ') + '.', 'The quotients, in order, are the partial quotients: $\\dfrac{' + a + '}{' + b + '} = ' + cfTex(qs) + '$.' + (qs[0] === 0 ? ' The first is 0 because the fraction is less than 1.' : ''), 'Check from the inside out: ' + (function () { var v = ML.Q(qs[qs.length - 1]); for (var j = qs.length - 2; j >= 0; j--) v = ML.Q(qs[j]).add(v.inv()); return '$' + v.toTex() + '$'; })() + '.'],
        hint: 'Divide, then divide the old divisor by the remainder, and so on. Keep the quotients, including the first one.' };
    }
    if (shape === 'fromCF') {
      var st = [], v = ML.Q(qs[qs.length - 1]);
      for (var j = qs.length - 2; j >= 0; j--) { var nv = ML.Q(qs[j]).add(v.inv()); st.push('$' + qs[j] + ' + \\dfrac{1}{' + v.toTex() + '} = ' + qs[j] + ' + ' + v.inv().toTex() + ' = ' + nv.toTex() + '$'); v = nv; }
      return { q: 'Write $' + cfTex(qs) + '$ as a fraction $\\frac{a}{b}$ in lowest terms.', a: { t: 'num', v: a + '/' + b, form: 'frac' },
        steps: ['$' + cfTex(qs) + ' = ' + qs[0] + ' + \\cfrac{1}{' + qs[1] + ' + \\cfrac{1}{' + qs[2] + (qs.length > 3 ? ' + \\cfrac{1}{' + qs[3] + '}' : '') + '}}$. Work from the innermost term outward.', 'From the inside: ' + st.join(', then ') + '.', 'So the value is $\\dfrac{' + a + '}{' + b + '}$. (It is automatically in lowest terms.)'],
        hint: 'Start with the last partial quotient and work outward: invert, then add.' };
    }
    var cv = convergents(qs), kk = 2, c2 = cv[kk];
    return { q: 'The continued fraction of $\\dfrac{' + a + '}{' + b + '}$ is $' + cfTex(qs) + '$. Find the convergent $\\dfrac{p_2}{q_2} = [' + qs[0] + '; ' + qs[1] + ', ' + qs[2] + ']$.', a: { t: 'num', v: c2[0] + '/' + c2[1], form: 'frac' },
      steps: ['Use $p_k = q_k p_{k-1} + p_{k-2}$ and $q_k = q_k q_{k-1} + q_{k-2}$, starting from $p_{-1} = 1$, $p_{-2} = 0$, $q_{-1} = 0$, $q_{-2} = 1$ (here the $q_k$ on the right are the partial quotients).', 'Convergents: ' + cv.map(function (c, i) { return '$\\frac{p_' + i + '}{q_' + i + '} = \\frac{' + c[0] + '}{' + c[1] + '}$'; }).join(', ') + '.', 'So $\\frac{p_2}{q_2} = \\frac{' + c2[0] + '}{' + c2[1] + '}$, already close to $\\frac{' + a + '}{' + b + '}$: they differ by $\\frac{1}{' + c2[1] * (cv[3] ? cv[3][1] : b) + '}$.'],
      hint: 'Cut the continued fraction after $q_2$ and evaluate it from the inside out.' };
  });

  function cfSqrt(d, k) { // first k partial quotients of √d, with exact (√d + m)/c forms
    var a0 = isqrt(d), m = 0, c = 1, a = a0, out = [];
    for (var i = 0; i < k; i++) { out.push({ a: a, m: m, c: c }); m = c * a - m; c = (d - m * m) / c; a = Math.floor((a0 + m) / c); }
    return out;
  }
  function cfSqrtSteps(d, k) {
    var t = cfSqrt(d, k), st = ['$' + t[0].a + '^{2} = ' + t[0].a * t[0].a + ' < ' + d + ' < ' + (t[0].a + 1) * (t[0].a + 1) + '$, so $a_0 = \\lfloor \\sqrt{' + d + '} \\rfloor = ' + t[0].a + '$ and $\\sqrt{' + d + '} = ' + t[0].a + ' + (\\sqrt{' + d + '} - ' + t[0].a + ')$.'];
    for (var i = 1; i < k; i++) {
      var prev = t[i - 1], m = t[i].m, c = t[i].c, num0 = prev.a * prev.c - prev.m;
      st.push('Flip the leftover and rationalize: $\\dfrac{' + (prev.c === 1 ? '1' : prev.c) + '}{\\sqrt{' + d + '} - ' + num0 + '} = \\dfrac{' + (prev.c === 1 ? '' : prev.c) + '(\\sqrt{' + d + '} + ' + num0 + ')}{' + (d - num0 * num0) + '} = \\dfrac{\\sqrt{' + d + '} + ' + m + '}{' + c + '}$' + ', whose whole part is $a_' + i + ' = ' + t[i].a + '$.');
    }
    return { t: t, steps: st };
  }
  G('nt.irrational-continued-fractions', function (R, ctx) {
    var L = ctx.level, d, k, f;
    if (L === 1) { var kk = R.int(2, 12), form = R.pick([1, 2, -1, -2]); d = kk * kk + form; if (form < 0 && kk < 3) d = 15; }
    else { do { d = R.int(L === 2 ? 5 : 3, L === 2 ? 99 : 60); } while (isqrt(d) * isqrt(d) === d); }
    if (L < 3) {
      k = L === 1 ? 4 : 5; f = cfSqrtSteps(d, k);
      var qs = f.t.map(function (x) { return x.a; });
      return { q: 'Find the first ' + k + ' partial quotients $a_0, a_1, \\dots, a_' + (k - 1) + '$ of the continued fraction of $\\sqrt{' + d + '}$. Enter them separated by commas.', a: { t: 'tuple', v: qs.map(String) },
        steps: f.steps.concat(['So $\\sqrt{' + d + '} = [' + qs[0] + '; ' + qs.slice(1).join(', ') + ', \\dots]$. Kept exact, the forms $\\frac{\\sqrt{' + d + '} + m}{c}$ repeat, and so do the quotients.']),
        hint: 'Keep exact expressions like $\\frac{1}{\\sqrt{' + d + '} - ' + isqrt(d) + '}$ and rationalize; decimals hide the pattern.' };
    }
    f = cfSqrtSteps(d, 4); var q4 = f.t.map(function (x) { return x.a; }), cv = convergents(q4), c3 = cv[3];
    return { q: 'The continued fraction of $\\sqrt{' + d + '}$ begins $[' + q4[0] + '; ' + q4.slice(1).join(', ') + ', \\dots]$. Find the convergent $\\dfrac{p_3}{q_3}$.', a: { t: 'num', v: c3[0] + '/' + c3[1], form: 'frac' },
      steps: ['$p_k = a_k p_{k-1} + p_{k-2}$ and $q_k = a_k q_{k-1} + q_{k-2}$, with $p_{-1} = 1, p_{-2} = 0, q_{-1} = 0, q_{-2} = 1$.', 'Convergents: ' + cv.map(function (c, i) { return '$\\frac{' + c[0] + '}{' + c[1] + '}$'; }).join(', ') + '.', 'So $\\frac{p_3}{q_3} = \\frac{' + c3[0] + '}{' + c3[1] + '}$. Check how close it is: $' + c3[0] + '^{2} - ' + d + ' \\cdot ' + c3[1] + '^{2} = ' + (c3[0] * c3[0] - d * c3[1] * c3[1]) + '$, small, so $\\frac{' + c3[0] + '}{' + c3[1] + '} \\approx \\sqrt{' + d + '}$.'],
      hint: 'Use the recurrence for convergents, or cut the continued fraction after $a_3$ and evaluate it from the inside out.' };
  });

  function pellFund(d) { var t = cfSqrt(d, 60), qs = t.map(function (x) { return x.a; }), cv = convergents(qs); for (var i = 0; i < cv.length; i++) if (cv[i][0] * cv[i][0] - d * cv[i][1] * cv[i][1] === 1) return { x: cv[i][0], y: cv[i][1], i: i, cv: cv.slice(0, i + 1), qs: qs.slice(0, i + 1) }; return null; }
  G('nt.pell-equation', function (R, ctx) {
    var L = ctx.level, d, F, st;
    if (L === 1) {
      d = R.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 15, 20, 24, 30, 35]); F = pellFund(d);
      if (R.coin()) {
        var tries = []; for (var y = 1; y <= F.y; y++) { var v = 1 + d * y * y, s = isqrt(v); tries.push('$y = ' + y + '$: $1 + ' + d + ' \\cdot ' + y * y + ' = ' + v + '$' + (s * s === v ? ' $= ' + s + '^{2}$' : ' (not a square)')); }
        return { q: 'Find the fundamental solution of $x^{2} - ' + d + 'y^{2} = 1$: the solution in positive integers with the smallest $y$.', a: multi([['$x =$', num(F.x)], ['$y =$', num(F.y)]]),
          steps: ['$(1, 0)$ is the trivial solution; we want $y > 0$. Try $y = 1, 2, 3, \\dots$ and test whether $1 + ' + d + 'y^{2}$ is a perfect square.', tries.join('; ') + '.', 'So $(x, y) = (' + F.x + ', ' + F.y + ')$. Check: $' + F.x + '^{2} - ' + d + ' \\cdot ' + F.y + '^{2} = ' + F.x * F.x + ' - ' + d * F.y * F.y + ' = 1$.'],
          hint: 'Test $y = 1, 2, 3, \\dots$: is $1 + ' + d + 'y^{2}$ a square?' };
      }
      var x2 = F.x * F.x + d * F.y * F.y, y2 = 2 * F.x * F.y;
      return { q: 'Which is the fundamental solution of $x^{2} - ' + d + 'y^{2} = 1$?', a: mcA('$(' + F.x + ', ' + F.y + ')$', ['$(1, 0)$', '$(' + x2 + ', ' + y2 + ')$', '$(' + (F.x + 1) + ', ' + F.y + ')$']),
        steps: ['$(1, 0)$ solves the equation but is the trivial solution; the fundamental solution is the smallest one with $y > 0$.', '$' + F.x + '^{2} - ' + d + ' \\cdot ' + F.y + '^{2} = 1$, and no smaller $y > 0$ works.', '$(' + x2 + ', ' + y2 + ')$ is a solution too, but it is the next one: it comes from squaring $' + F.x + ' + ' + F.y + '\\sqrt{' + d + '}$. And $(' + (F.x + 1) + ', ' + F.y + ')$ gives $' + ((F.x + 1) * (F.x + 1) - d * F.y * F.y) + '$, not 1.'],
        hint: 'The trivial solution has $y = 0$. Look for the smallest $y > 0$.' };
    }
    if (L === 2) {
      d = R.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 15]); F = pellFund(d); var X2 = F.x * F.x + d * F.y * F.y, Y2 = 2 * F.x * F.y;
      return { q: 'The fundamental solution of $x^{2} - ' + d + 'y^{2} = 1$ is $(' + F.x + ', ' + F.y + ')$. Find the next solution $(x_2, y_2)$, from $x_2 + y_2\\sqrt{' + d + '} = (' + F.x + ' + ' + F.y + '\\sqrt{' + d + '})^{2}$.', a: multi([['$x_2 =$', num(X2)], ['$y_2 =$', num(Y2)]]),
        steps: ['$(' + F.x + ' + ' + F.y + '\\sqrt{' + d + '})^{2} = ' + F.x + '^{2} + 2 \\cdot ' + F.x + ' \\cdot ' + F.y + '\\sqrt{' + d + '} + ' + F.y + '^{2} \\cdot ' + d + '$.', '$= (' + F.x * F.x + ' + ' + d * F.y * F.y + ') + ' + Y2 + '\\sqrt{' + d + '} = ' + X2 + ' + ' + Y2 + '\\sqrt{' + d + '}$.', 'Check: $' + cm(X2 * X2) + ' - ' + d + ' \\cdot ' + cm(Y2 * Y2) + ' = 1$. Why it works: $x^{2} - dy^{2} = (x + y\\sqrt{d})(x - y\\sqrt{d})$, and the product of two such norms equal to 1 is 1.'],
        hint: 'Expand the square; the terms with $\\sqrt{' + d + '}$ give $y_2$.' };
    }
    d = R.pick([13, 14, 17, 18, 19, 21, 22, 23, 26, 27, 28, 29, 31, 32, 33, 34, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47]); F = pellFund(d);
    if (F.y > 2000) d = 14, F = pellFund(14);
    return { q: 'Use the continued fraction of $\\sqrt{' + d + '}$ to find the fundamental solution of $x^{2} - ' + d + 'y^{2} = 1$.', a: multi([['$x =$', num(F.x)], ['$y =$', num(F.y)]]),
      steps: ['$\\sqrt{' + d + '} = [' + F.qs[0] + '; ' + cfSqrt(d, 12).slice(1).map(function (x) { return x.a; }).join(', ') + ', \\dots]$.', 'Convergents $p/q$ and the value of $p^{2} - ' + d + 'q^{2}$: ' + F.cv.map(function (c) { return '$\\frac{' + c[0] + '}{' + c[1] + '}$: $' + (c[0] * c[0] - d * c[1] * c[1]) + '$'; }).join(', ') + '.', 'The first convergent that gives $+1$ is $\\frac{' + F.x + '}{' + F.y + '}$, so the fundamental solution is $(' + F.x + ', ' + F.y + ')$.'],
      hint: 'Compute convergents $p/q$ of $\\sqrt{' + d + '}$ and evaluate $p^{2} - ' + d + 'q^{2}$ for each until you get 1.' };
  });

})(window.MathLadder);
