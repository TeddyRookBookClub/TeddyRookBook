/* Math Ladder generators: Calculus 1, Limits and Derivatives (course key calc1).
   One generator per topic in data/math/topics/calc1.json, registered with MathLadder.gen.
   Built from the source parts in the course builder's work dir (gen/*.js, concatenated in order).

   Every problem also carries `chk`: machine-readable facts about the problem (the function, the point, the interval)
   that the course's node test uses to verify each answer independently (numeric derivatives, numeric integrals,
   numeric limits and the CAS). The runner ignores it. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util;
  // promote long inline math ($...$) to display math ($$...$$): inline math never wraps, so long pieces widen phone pages
  function wideMath(s, limit) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    limit = limit || 30;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (c === '$') {
        var k = i + 1; while (k < n && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        var vis = tex.replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|bigg|Bigg|bigl|bigr|text|mathrm|operatorname|lvert|rvert)\b/g, '').replace(/\\(arcsin|arccos|arctan|sin|cos|tan|sec|csc|cot|ln|log|lim|exp)\b/g, 'xxx').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
        out += vis > limit ? '$$' + tex + '$$' : '$' + tex + '$';
        i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  // register a generator; long inline math in the question, steps and hint becomes display math (it scrolls on phones)
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var pr = fn(R, ctx);
      if (pr && typeof pr === 'object') { pr.q = wideMath(pr.q); if (Array.isArray(pr.steps)) pr.steps = pr.steps.map(function (x) { return wideMath(x); }); if (pr.hint) pr.hint = wideMath(pr.hint); }
      return pr;
    });
  }

  // ------------------------------------------------------------------ small helpers
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function q(x) { return Q.from(x); }
  function tx(x) { return T.num(q(x)); }                       // exact TeX: -\frac{3}{4}
  function pl(x) { return q(x).toPlain(); }                    // plain: -3/4
  function tp(x) { return T.p(q(x)); }                         // (-3) when negative
  function sg(x) { return T.signed(q(x)); }                    // " + 3", " - 3"
  function num(v, extra) { return Object.assign({ t: 'num', v: typeof v === 'string' ? tidy(v) : pl(v) }, extra || {}); }
  function expr(v, vars, extra) { return Object.assign({ t: 'expr', v: tidy(v), vars: vars || ['x'] }, extra || {}); }
  // tidy a plain answer so that the shown answer reads well: (4/8) -> 1/2, x^1 -> x, x^0* -> nothing, (1)* -> nothing
  function tidy(s) {
    s = String(s);
    for (var k = 0; k < 3; k++) {
      s = s.replace(/\((-?\d+)\/\(?(\d+)\)?\)/g, function (m, a, b) { var r = Q(BigInt(a), BigInt(b)); return r.d === 1n ? (r.n < 0n ? '(' + r.n + ')' : String(r.n)) : '(' + r.toPlain() + ')'; })
        .replace(/\^\(1\)/g, '').replace(/\^1(?![\d.\/])/g, '')
        .replace(/(^|[*(+\-])x\^0\*/g, '$1').replace(/\*x\^0(?![\d.])/g, '')
        .replace(/(^|[*(+\-])\(1\)\*/g, '$1').replace(/\*\(1\)(?![\d.^])/g, '').replace(/\*1(?![\d.\/^])/g, '')
        .replace(/(^|[^\w.])1(?=[a-z(])/g, '$1').replace(/(^|[(+\-*])1\*(?=\d)/g, '$1')
        .replace(/(^|[*+\-\/(])\((\d+)\)(?![\^\d(])/g, '$1$2');
      s = cl(s);
    }
    return s;
  }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function multi(parts) { return { t: 'multi', parts: parts.map(function (p) { return { label: p[0], a: p[1] }; }) }; }
  function abs(x) { return x < 0 ? -x : x; }
  function gcd(a, b) { return U.gcd(a, b); }
  function cl(s) { // tidy a plain-math string: "+-" -> "-", "--" -> "+", "1*x" -> "x"
    return String(s).replace(/\+\s*-/g, '-').replace(/-\s*-/g, '+').replace(/(^|[(+\-*])1\*(?=[a-z(])/g, '$1').replace(/^\+/, '').replace(/\(\+/g, '(');
  }
  // c·body as plain math, with a fraction coefficient written as a fraction of the whole: 3*(x^2+1)^5/5
  function cmulP(c, body) { c = q(c); var n = c.n, d = c.d, an = n < 0n ? -n : n, sgn = n < 0n ? '-' : ''; var top = an === 1n ? body : an + '*' + body; return sgn + top + (d === 1n ? '' : '/' + d); }
  // a rational multiple of pi as plain math: 5/(12*pi) style for over-pi values, 3*pi/4 for times-pi
  function overPi(c) { c = q(c); return c.n + '/' + (c.d === 1n ? 'pi' : '(' + c.d + '*pi)'); }
  function timesPi(c) { c = q(c); return c.isTerminating() && !c.isInt() ? c.toDec(6).replace(/0+$/, '') + '*pi' : cmulP(c, 'pi'); }
  // an exact number as a decimal when it terminates (shown answers read better: 5.1, not 51/10)
  function numD(c, extra) { c = q(c); return num(c.isTerminating() && !c.isInt() ? c.toDec(12).replace(/0+$/, '') : pl(c), extra); }
  function dfrac(a, b) { return '\\dfrac{' + a + '}{' + b + '}'; }
  function frac(a, b) { return '\\frac{' + a + '}{' + b + '}'; }
  function lim(a, side, v) { return '\\lim_{' + (v || 'x') + ' \\to ' + a + (side < 0 ? '^-' : side > 0 ? '^+' : '') + '}'; }
  function limInf(sgn, v) { return '\\lim_{' + (v || 'x') + ' \\to ' + (sgn < 0 ? '-' : '') + '\\infty}'; }
  function ddx(v) { return '\\dfrac{d}{d' + (v || 'x') + '}'; }
  function I(a, b, f, v) { return '\\displaystyle\\int_{' + a + '}^{' + b + '} ' + f + '\\,d' + (v || 'x'); }
  function II(f, v) { return '\\displaystyle\\int ' + f + '\\,d' + (v || 'x'); }
  function cases(rows) { return '\\begin{cases} ' + rows.map(function (r) { return r[0] + ' & ' + r[1]; }).join(' \\\\ ') + ' \\end{cases}'; }
  function table(head, rows, opt) { // rows: [label, values...]; vertical bar after the label column
    var n = rows[0].length - 1;
    return '\\begin{array}{c|' + new Array(n + 1).join('c') + '} ' + rows.map(function (r) { return r.join(' & '); }).join(' \\\\ \\hline ') + ' \\end{array}';
  }
  function xs(v) { return v === undefined ? 'x' : v; }
  function signWord(s) { return s > 0 ? 'positive' : 'negative'; }
  function pick(R, arr) { return R.pick(arr); }
  function piTex(k, d) { // k·π/d as TeX (k, d integers)
    var g = gcd(abs(k), abs(d)) || 1; k /= g; d /= g; if (d < 0) { k = -k; d = -d; }
    if (k === 0) return '0';
    var s = k < 0 ? '-' : '', a = abs(k), top = (a === 1 ? '' : a) + '\\pi';
    return s + (d === 1 ? top : '\\frac{' + top + '}{' + d + '}');
  }
  function piPlain(k, d) { var g = gcd(abs(k), abs(d)) || 1; k /= g; d /= g; if (d < 0) { k = -k; d = -d; } if (k === 0) return '0'; return (k === 1 ? '' : k === -1 ? '-' : k + '*') + 'pi' + (d === 1 ? '' : '/' + d); }

  // ------------------------------------------------------------------ polynomials with exact coefficients (low -> high)
  function Poly(c) {
    var a = (c || [0]).map(function (x) { return q(x); });
    while (a.length > 1 && a[a.length - 1].isZero()) a.pop();
    if (!a.length) a = [q(0)];
    this.c = a;
  }
  function P(c) { return new Poly(c); }
  Poly.prototype.deg = function () { return this.c.length === 1 && this.c[0].isZero() ? -1 : this.c.length - 1; };
  Poly.prototype.at = function (x) { x = q(x); var s = q(0); for (var i = this.c.length - 1; i >= 0; i--) s = s.mul(x).add(this.c[i]); return s; };
  Poly.prototype.d = function () { var r = []; for (var i = 1; i < this.c.length; i++) r.push(this.c[i].mul(i)); return P(r.length ? r : [0]); };
  Poly.prototype.anti = function () { var r = [q(0)]; for (var i = 0; i < this.c.length; i++) r.push(this.c[i].div(i + 1)); return P(r); };
  Poly.prototype.add = function (o) { var n = Math.max(this.c.length, o.c.length), r = []; for (var i = 0; i < n; i++) r.push((this.c[i] || q(0)).add(o.c[i] || q(0))); return P(r); };
  Poly.prototype.scale = function (k) { k = q(k); return P(this.c.map(function (x) { return x.mul(k); })); };
  Poly.prototype.sub = function (o) { return this.add(o.scale(-1)); };
  Poly.prototype.mul = function (o) { var r = []; for (var i = 0; i < this.c.length + o.c.length - 1; i++) r.push(q(0)); for (i = 0; i < this.c.length; i++) for (var j = 0; j < o.c.length; j++) r[i + j] = r[i + j].add(this.c[i].mul(o.c[j])); return P(r); };
  Poly.prototype.lead = function () { return this.c[this.c.length - 1]; };
  Poly.prototype.tex = function (v) { return T.poly(this.c.slice().reverse(), xs(v)); };
  Poly.prototype.ptex = function (v) { return this.terms() > 1 ? '(' + this.tex(v) + ')' : this.tex(v); }; // for multiplying
  Poly.prototype.terms = function () { return this.c.filter(function (x) { return !x.isZero(); }).length; };
  Poly.prototype.plain = function (v) {
    v = xs(v); var out = [];
    for (var k = this.c.length - 1; k >= 0; k--) {
      var c = this.c[k]; if (c.isZero()) continue;
      var n = c.n, d = c.d, base = k === 0 ? '' : k === 1 ? v : v + '^' + k, t;
      if (k === 0) t = c.toPlain();
      else {
        var an = n < 0n ? -n : n, sgn = n < 0n ? '-' : '';
        t = sgn + (an === 1n ? base : an + '*' + base) + (d === 1n ? '' : '/' + d);
      }
      out.push(t);
    }
    if (!out.length) return '0';
    return cl(out.join('+'));
  };
  Poly.prototype.pplain = function (v) { return '(' + this.plain(v) + ')'; };
  // the polynomial with x replaced by a number, every operation shown: 3 \cdot 2^{2} - 2 + 1
  Poly.prototype.subT = function (a) {
    a = q(a); if (a.isZero()) return tx(this.c[0]);
    var out = '', first = true, ap = a.sign() < 0 || !a.isInt() ? '\\left(' + tx(a) + '\\right)' : tx(a);
    for (var k = this.c.length - 1; k >= 0; k--) {
      var c = this.c[k]; if (c.isZero()) continue;
      var neg = c.sign() < 0, m = c.abs(), body;
      if (k === 0) body = tx(m);
      else body = (m.eq(1) ? '' : tx(m) + ' \\cdot ') + ap + (k > 1 ? '^{' + k + '}' : '');
      out += (first ? (neg ? '-' : '') : (neg ? ' - ' : ' + ')) + body; first = false;
    }
    return out || '0';
  };
  // (x - r1)(x - r2)… times k
  function fromRoots(k, roots) { var p = P([k]); roots.forEach(function (r) { p = p.mul(P([q(r).neg(), 1])); }); return p; }
  // "x - 3", "x + 2" for a root r
  function xm(r, v) { r = q(r); return r.isZero() ? xs(v) : xs(v) + (r.sign() > 0 ? ' - ' + tx(r) : ' + ' + tx(r.neg())); }
  function xmP(r, v) { r = q(r); return r.isZero() ? xs(v) : xs(v) + (r.sign() > 0 ? '-' + pl(r) : '+' + pl(r.neg())); }
  // a·x + b as TeX and plain
  function linT(a, b, v) { return T.lin(q(a), xs(v), q(b)); }
  function linP(a, b, v) { return P([b, a]).plain(v); }
  function mono(c, k, v) { // c·x^k as TeX (k may be a Q or number)
    v = xs(v); c = q(c); k = q(k);
    if (k.isZero()) return tx(c);
    var base = k.eq(1) ? v : v + '^{' + tx(k) + '}';
    return T.coef(c, base);
  }
  function monoP(c, k, v) { // plain
    v = xs(v); c = q(c); k = q(k);
    if (k.isZero()) return pl(c);
    var base = k.eq(1) ? v : v + '^(' + pl(k) + ')';
    return cl((c.eq(1) ? '' : c.eq(-1) ? '-' : pl(c) + '*') + base);
  }
  function sumP(parts) { return cl(parts.filter(function (s) { return s && s !== '0'; }).join('+')) || '0'; }
  function sumT(parts) { // parts: TeX terms possibly starting with "-"
    var s = '';
    parts.forEach(function (t) { if (!t || t === '0') return; if (!s) s = t; else if (t.charAt(0) === '-') s += ' - ' + t.slice(1); else s += ' + ' + t; });
    return s || '0';
  }

  // exact square roots: [outside, inside] with value outside·√inside (inside squarefree)
  function surd(n) { var r = U.simplifyRadical(n); return r; }
  function sqrtT(n) { return T.sqrt(n); }
  function sqrtP(n) { var r = surd(n); return r[1] === 1 ? String(r[0]) : (r[0] === 1 ? '' : r[0] + '*') + 'sqrt(' + r[1] + ')'; }

  // a decimal string for a Q that terminates (for tables of values)
  function decf(x) { x = q(x); return x.isTerminating() ? dec(x) : tx(x); }
  function dec(x) { x = q(x); var d = 0, t = x; while (!t.isInt() && d < 12) { t = t.mul(10); d++; } return T.num(x.toDec(d)); }


  // ================================================================== UNIT 1: LIMITS
  var INF_NOTE = 'If the values grow without bound, answer ∞ or −∞. If there is no limit of any kind, answer DNE.';
  function infAns(s) { return num(s > 0 ? 'inf' : '-inf'); }
  function infT(s) { return s > 0 ? '\\infty' : '-\\infty'; }

  G('calc1.limit-idea', function (R, ctx) {
    var kind = lv(ctx, R.pick(['table', 'table', 'piece']), R.pick(['table', 'piece', 'hole']), R.pick(['cube', 'piece', 'hole']));
    if (kind === 'table' || kind === 'cube') {
      var a = R.intNot(-4, 5, 0), f, L, num_, den, fx;
      var hs = ['0.1', '0.01', '0.001'];
      if (kind === 'table') {
        var r = R.intNot(-5, 6, [a, 0]);
        var p = fromRoots(1, [a, r]); L = q(a - r);
        num_ = p.tex(); den = xm(a); f = '(' + p.plain() + ')/(' + xmP(a) + ')';
        fx = function (x) { return q(x).sub(r); };
      } else {
        num_ = 'x^{3}' + sg(-a * a * a); den = xm(a); f = '(x^3-(' + (a * a * a) + '))/(' + xmP(a) + ')'; L = q(3 * a * a);
        fx = function (x) { x = q(x); return x.mul(x).add(x.mul(a)).add(a * a); };
      }
      var xsL = hs.map(function (h) { return q(a).sub(q(h)); }), xsR = hs.slice().reverse().map(function (h) { return q(a).add(q(h)); });
      var cols = xsL.concat(xsR);
      var tab = table(null, [['x'].concat(xsL.map(dec), ['\\color{gray}{' + a + '}'], xsR.map(dec)), ['f(x)'].concat(xsL.map(function (x) { return dec(fx(x)); }), ['\\text{undefined}'], xsR.map(function (x) { return dec(fx(x)); }))]);
      return {
        q: 'Let $f(x) = ' + dfrac(num_, den) + '$. Its values near $x = ' + a + '$ are in the table. Use the table to find $' + lim(a) + ' f(x)$.$$' + tab + '$$',
        a: num(L),
        steps: [
          'Read the table from the left: as $x$ climbs toward $' + a + '$, $f(x)$ goes ' + dec(fx(xsL[0])) + ', ' + dec(fx(xsL[1])) + ', ' + dec(fx(xsL[2])) + '.',
          'Read it from the right: as $x$ drops toward $' + a + '$, $f(x)$ goes ' + dec(fx(cols[5])) + ', ' + dec(fx(cols[4])) + ', ' + dec(fx(cols[3])) + '.',
          'Both sides close in on the same number, $' + tx(L) + '$.',
          '$f(' + a + ')$ is undefined (the denominator is 0 there), but a limit never asks for the value at $x = ' + a + '$, only for the values near it. So $' + lim(a) + ' f(x) = ' + tx(L) + '$.'
        ],
        hint: 'Look at the numbers in the f(x) row as you move toward the middle column from either side.',
        chk: { k: 'lim', f: f, a: a }
      };
    }
    // a function that is "broken" at one point: limit vs value
    var a2 = R.intNot(-3, 4, 0), g = R.coin() ? P([R.nz(-6, 6), R.nz(-4, 4)]) : P([R.nz(-6, 6), R.int(-3, 3), R.nz(-2, 2)]);
    var L2 = g.at(a2), k = L2.add(R.nz(-5, 5)), both = ctx.level >= 2;
    var qtext, steps;
    if (kind === 'piece') {
      qtext = 'Let $f(x) = ' + cases([[g.tex(), '\\text{if } x \\ne ' + a2], [tx(k), '\\text{if } x = ' + a2]]) + '$. ';
      steps = ['For every $x$ near $' + a2 + '$ but not equal to it, $f(x) = ' + g.tex() + '$.',
        'As $x \\to ' + a2 + '$, $' + g.tex() + ' \\to ' + g.subT(a2) + ' = ' + tx(L2) + '$. So $' + lim(a2) + ' f(x) = ' + tx(L2) + '$.',
        'The value at the point is set separately: $f(' + a2 + ') = ' + tx(k) + '$. The limit and the value are different numbers here, and that is allowed.'];
    } else {
      var m = R.nz(-3, 3), b = L2.sub(q(m * a2));
      g = P([b, m]); L2 = g.at(a2);
      qtext = 'The graph of $g$ is the line $y = ' + g.tex() + '$, except at $x = ' + a2 + '$: there is an open circle at $(' + a2 + ', ' + tx(L2) + ')$ and a filled dot at $(' + a2 + ', ' + tx(k) + ')$. ';
      steps = ['The open circle means the point $(' + a2 + ', ' + tx(L2) + ')$ is missing from the graph, but the line runs right up to it from both sides.',
        'So as $x \\to ' + a2 + '$ from either side, $g(x)$ gets close to $' + tx(L2) + '$: $' + lim(a2) + ' g(x) = ' + tx(L2) + '$.',
        'The filled dot gives the value: $g(' + a2 + ') = ' + tx(k) + '$. The limit ignores it.'];
    }
    var nm = kind === 'piece' ? 'f' : 'g';
    if (both) {
      return {
        q: qtext + 'Find the limit and the value.',
        a: multi([['$' + lim(a2) + ' ' + nm + '(x) =$', num(L2)], ['$' + nm + '(' + a2 + ') =$', num(k)]]),
        steps: steps, hint: 'The limit depends only on the values near x = ' + a2 + ', not at it.',
        chk: [{ k: 'lim', f: g.plain(), a: a2 }, { k: 'val', v: k.toNumber() }]
      };
    }
    return { q: qtext + 'Find $' + lim(a2) + ' ' + nm + '(x)$.', a: num(L2), steps: steps, hint: 'The limit depends only on the values near x = ' + a2 + ', not at it.', chk: { k: 'lim', f: g.plain(), a: a2 } };
  });

  G('calc1.one-sided-limits', function (R, ctx) {
    var kind = lv(ctx, R.pick(['one', 'one', 'abs1']), R.pick(['three', 'three', 'abs']), R.pick(['three', 'abs', 'abs2']));
    var a = R.int(-3, 4);
    if (kind === 'one' || kind === 'three') {
      var g1 = R.coin() ? P([R.int(-6, 6), R.nz(-3, 3)]) : P([R.int(-5, 5), R.int(-2, 2), R.nz(-2, 2)]);
      var g2 = R.coin() ? P([R.int(-6, 6), R.nz(-3, 3)]) : P([R.int(-5, 5), R.int(-2, 2), R.nz(-2, 2)]);
      var L1 = g1.at(a), L2 = g2.at(a);
      var same = kind === 'three' && R.chance(0.3);
      if (same) { g2 = g2.add(P([L1.sub(L2)])); L2 = g2.at(a); }
      else if (L1.eq(L2)) { g2 = g2.add(P([R.nz(-3, 3)])); L2 = g2.at(a); }
      var leftClosed = R.coin();
      var fT = 'f(x) = ' + cases([[g1.tex(), '\\text{if } x ' + (leftClosed ? '\\le ' : '< ') + a], [g2.tex(), '\\text{if } x ' + (leftClosed ? '> ' : '\\ge ') + a]]);
      var sL = 'From the left ($x < ' + a + '$), $f(x) = ' + g1.tex() + '$, so $' + lim(a, -1) + ' f(x) = ' + tx(L1) + '$.';
      var sR = 'From the right ($x > ' + a + '$), $f(x) = ' + g2.tex() + '$, so $' + lim(a, 1) + ' f(x) = ' + tx(L2) + '$.';
      if (kind === 'one') {
        var side = R.sign();
        return {
          q: 'Let $' + fT + '$. Find $' + lim(a, side) + ' f(x)$.',
          a: num(side < 0 ? L1 : L2),
          steps: [side < 0 ? 'The minus sign in $x \\to ' + a + '^-$ means $x$ comes from the left, through values less than $' + a + '$.' : 'The plus sign in $x \\to ' + a + '^+$ means $x$ comes from the right, through values greater than $' + a + '$.',
            side < 0 ? sL : sR, 'Plug in $x = ' + a + '$ into that piece: the answer is $' + tx(side < 0 ? L1 : L2) + '$.'],
          hint: 'Use only the piece of f that applies on the ' + (side < 0 ? 'left' : 'right') + ' side of ' + a + '.',
          chk: { k: 'lim', f: (side < 0 ? g1 : g2).plain(), a: a }
        };
      }
      var two = L1.eq(L2) ? num(L1) : num('DNE');
      return {
        q: 'Let $' + fT + '$. Find each limit. Answer DNE if a limit does not exist.',
        a: multi([['$' + lim(a, -1) + ' f(x) =$', num(L1)], ['$' + lim(a, 1) + ' f(x) =$', num(L2)], ['$' + lim(a) + ' f(x) =$', two]]),
        steps: [sL, sR, L1.eq(L2) ? 'Both one-sided limits equal $' + tx(L1) + '$, so the two-sided limit exists and equals $' + tx(L1) + '$.' : 'The one-sided limits are different ($' + tx(L1) + ' \\ne ' + tx(L2) + '$): the graph jumps at $x = ' + a + '$. So the two-sided limit does not exist (DNE).'],
        hint: 'Find the left and right limits separately, then compare them.',
        chk: [{ k: 'lim', f: g1.plain(), a: a }, { k: 'lim', f: g2.plain(), a: a }, { k: 'lim', fl: g1.plain(), fr: g2.plain(), a: a }]
      };
    }
    if (kind === 'abs' || kind === 'abs1') {
      var k = R.intNot(-5, 5, 0), c = R.int(-4, 4), fT2 = 'f(x) = ' + (c ? tx(c) + ' + ' : '') + dfrac((abs(k) === 1 ? (k < 0 ? '-' : '') : k) + '\\lvert ' + xm(a) + ' \\rvert', xm(a));
      var f = cl(c + '+' + k + '*abs(' + xmP(a) + ')/(' + xmP(a) + ')');
      var Lm = c - k, Lp = c + k;
      var st = ['For $x > ' + a + '$, $' + xm(a) + '$ is positive, so $\\lvert ' + xm(a) + ' \\rvert = ' + xm(a) + '$ and the fraction is $' + k + '$. So $f(x) = ' + (c + k) + '$ on the right.',
        'For $x < ' + a + '$, $' + xm(a) + '$ is negative, so $\\lvert ' + xm(a) + ' \\rvert = -(' + xm(a) + ')$ and the fraction is $' + (-k) + '$. So $f(x) = ' + (c - k) + '$ on the left.'];
      if (kind === 'abs1') {
        var sd = R.sign();
        return { q: 'Let $' + fT2 + '$. Find $' + lim(a, sd) + ' f(x)$.', a: num(sd < 0 ? Lm : Lp), steps: st.concat(['So $' + lim(a, sd) + ' f(x) = ' + (sd < 0 ? Lm : Lp) + '$.']), hint: 'Decide the sign of x − ' + a + ' on that side, then remove the absolute value.', chk: { k: 'lim', f: f, a: a, side: sd } };
      }
      return {
        q: 'Let $' + fT2 + '$. Find each limit. Answer DNE if a limit does not exist.',
        a: multi([['$' + lim(a, -1) + ' f(x) =$', num(Lm)], ['$' + lim(a, 1) + ' f(x) =$', num(Lp)], ['$' + lim(a) + ' f(x) =$', num('DNE')]]),
        steps: st.concat(['Left limit $' + Lm + '$, right limit $' + Lp + '$. They differ, so the two-sided limit does not exist.']),
        hint: 'Decide the sign of x − ' + a + ' on each side, then remove the absolute value.',
        chk: [{ k: 'lim', f: f, a: a, side: -1 }, { k: 'lim', f: f, a: a, side: 1 }, { k: 'lim', f: f, a: a, side: 0 }]
      };
    }
    // (x - a)(x - r) / |x - a|
    var r = R.intNot(-5, 6, a), p = fromRoots(1, [a, r]), Lr = q(a - r), fA = '(' + p.plain() + ')/abs(' + xmP(a) + ')';
    return {
      q: 'Let $f(x) = ' + dfrac(p.tex(), '\\lvert ' + xm(a) + ' \\rvert') + '$. Find each limit. Answer DNE if a limit does not exist.',
      a: multi([['$' + lim(a, -1) + ' f(x) =$', num(Lr.neg())], ['$' + lim(a, 1) + ' f(x) =$', num(Lr)], ['$' + lim(a) + ' f(x) =$', num('DNE')]]),
      steps: ['Factor the top: $' + p.tex() + ' = (' + xm(a) + ')(' + xm(r) + ')$.',
        'For $x > ' + a + '$: $\\lvert ' + xm(a) + ' \\rvert = ' + xm(a) + '$, so $f(x) = ' + xm(r) + ' \\to ' + tx(Lr) + '$.',
        'For $x < ' + a + '$: $\\lvert ' + xm(a) + ' \\rvert = -(' + xm(a) + ')$, so $f(x) = -(' + xm(r) + ') \\to ' + tx(Lr.neg()) + '$.',
        'The two sides disagree, so the two-sided limit does not exist.'],
      hint: 'Factor the numerator, then think about the sign of x − ' + a + ' on each side.',
      chk: [{ k: 'lim', f: fA, a: a, side: -1 }, { k: 'lim', f: fA, a: a, side: 1 }, { k: 'lim', f: fA, a: a, side: 0 }]
    };
  });

  G('calc1.infinite-limits', function (R, ctx) {
    var kind = lv(ctx, R.pick(['one', 'square']), R.pick(['one', 'ratio', 'two', 'square']), R.pick(['ratio2', 'va', 'two', 'ratio']));
    var a = R.int(-4, 4), k = R.nz(-6, 6), side = R.sign();
    if (kind === 'one') {
      var s = (k > 0 ? 1 : -1) * side;
      return {
        q: 'Find $' + lim(a, side) + ' ' + dfrac(k, xm(a)) + '$. ' + INF_NOTE,
        a: infAns(s),
        steps: ['As $x \\to ' + a + '^' + (side < 0 ? '-' : '+') + '$, the denominator $' + xm(a) + '$ is a tiny ' + (side < 0 ? 'negative' : 'positive') + ' number.',
          'The numerator stays $' + k + '$. A ' + signWord(k) + ' number divided by a tiny ' + (side < 0 ? 'negative' : 'positive') + ' number is huge and ' + signWord(s) + '.',
          'So the values grow without bound: the limit is $' + infT(s) + '$, and $x = ' + a + '$ is a vertical asymptote.'],
        hint: 'Decide the sign of the denominator just to the ' + (side < 0 ? 'left' : 'right') + ' of ' + a + '.',
        chk: { k: 'lim', f: k + '/(' + xmP(a) + ')', a: a, side: side }
      };
    }
    if (kind === 'square') {
      var s2 = k > 0 ? 1 : -1;
      return {
        q: 'Find $' + lim(a) + ' ' + dfrac(k, '(' + xm(a) + ')^{2}') + '$. ' + INF_NOTE,
        a: infAns(s2),
        steps: ['Near $x = ' + a + '$, $(' + xm(a) + ')^2$ is a tiny positive number on both sides (a square is never negative).',
          '$' + k + '$ divided by a tiny positive number is huge and ' + signWord(k) + ', from the left and from the right.',
          'Both sides agree, so $' + lim(a) + ' ' + frac(k, '(' + xm(a) + ')^{2}') + ' = ' + infT(s2) + '$.'],
        hint: 'What is the sign of a square close to 0?',
        chk: { k: 'lim', f: k + '/(' + xmP(a) + ')^2', a: a, side: 0 }
      };
    }
    if (kind === 'two') {
      return {
        q: 'Find $' + lim(a) + ' ' + dfrac(k, xm(a)) + '$ (the two-sided limit). ' + INF_NOTE,
        a: num('DNE'),
        steps: ['From the right, $' + xm(a) + '$ is a tiny positive number, so the fraction goes to $' + infT(k) + '$.',
          'From the left, $' + xm(a) + '$ is a tiny negative number, so the fraction goes to $' + infT(-k) + '$.',
          'The two sides head in opposite directions, so there is no single limit, not even an infinite one: DNE.'],
        hint: 'Check each side separately.',
        chk: { k: 'lim', f: k + '/(' + xmP(a) + ')', a: a, side: 0 }
      };
    }
    if (kind === 'ratio') {
      var b = R.intNot(-6, 6, -a), top = q(a + b), s3 = top.sign() * side;
      return {
        q: 'Find $' + lim(a, side) + ' ' + dfrac(xm(-b), xm(a)) + '$. ' + INF_NOTE,
        a: infAns(s3),
        steps: ['As $x \\to ' + a + '$, the numerator $' + xm(-b) + ' \\to ' + tx(top) + '$, which is ' + signWord(top.sign()) + '.',
          'The denominator $' + xm(a) + '$ is a tiny ' + (side < 0 ? 'negative' : 'positive') + ' number.',
          'A ' + signWord(top.sign()) + ' number over a tiny ' + (side < 0 ? 'negative' : 'positive') + ' number is huge and ' + signWord(s3) + ': the limit is $' + infT(s3) + '$.'],
        hint: 'Find the sign of the top and of the bottom just to the ' + (side < 0 ? 'left' : 'right') + ' of ' + a + '.',
        chk: { k: 'lim', f: '(' + xmP(-b) + ')/(' + xmP(a) + ')', a: a, side: side }
      };
    }
    if (kind === 'ratio2') {
      var c = R.intNot(-5, 5, a), b2 = R.intNot(-6, 6, -a), den = fromRoots(1, [a, c]), topv = q(a + b2), other = q(a - c), s4 = topv.sign() * other.sign() * side;
      return {
        q: 'Find $' + lim(a, side) + ' ' + dfrac(xm(-b2), den.tex()) + '$. ' + INF_NOTE,
        a: infAns(s4),
        steps: ['Factor the bottom: $' + den.tex() + ' = (' + xm(a) + ')(' + xm(c) + ')$.',
          'As $x \\to ' + a + '$: the top $\\to ' + tx(topv) + '$ (' + signWord(topv.sign()) + '), and $' + xm(c) + ' \\to ' + tx(other) + '$ (' + signWord(other.sign()) + ').',
          'The factor $' + xm(a) + '$ is a tiny ' + (side < 0 ? 'negative' : 'positive') + ' number.',
          'Count the signs: the fraction is huge and ' + signWord(s4) + ', so the limit is $' + infT(s4) + '$.'],
        hint: 'Factor the denominator and find the sign of each piece near x = ' + a + '.',
        chk: { k: 'lim', f: '(' + xmP(-b2) + ')/(' + den.plain() + ')', a: a, side: side }
      };
    }
    // vertical asymptotes, with a hole to watch for
    var p = R.intNot(-5, 5, 0), s5 = R.intNot(-5, 5, p), withHole = R.coin(), d2, nm, ans;
    if (withHole) { d2 = fromRoots(1, [p, s5]); nm = xm(p); ans = [String(s5)]; }
    else { var n = R.int(2, 5), m = R.intNot(-6, 6, [n, -n]); d2 = P([-n * n, 0, 1]); nm = xm(m); ans = [String(n), String(-n)]; p = null; s5 = n; }
    return {
      q: 'Find every $x$ where $f(x) = ' + dfrac(nm, d2.tex()) + '$ has a vertical asymptote.',
      a: { t: 'set', v: ans },
      steps: withHole ? ['Factor the bottom: $' + d2.tex() + ' = (' + xm(p) + ')(' + xm(s5) + ')$. It is 0 at $x = ' + p + '$ and $x = ' + s5 + '$.',
        'At $x = ' + p + '$ the factor $' + xm(p) + '$ cancels with the top: $f(x) = ' + frac(1, xm(s5)) + '$ for $x \\ne ' + p + '$. The graph has a hole there, not an asymptote.',
        'At $x = ' + s5 + '$ the top is not 0 but the bottom is, so $f$ grows without bound: a vertical asymptote at $x = ' + s5 + '$.']
        : ['Factor the bottom: $' + d2.tex() + ' = (' + xm(s5) + ')(' + xm(-s5) + ')$, which is 0 at $x = \\pm ' + s5 + '$.',
          'The top, $' + nm + '$, is not 0 at either of those points, so nothing cancels.',
          'So $f$ grows without bound near both: vertical asymptotes at $x = ' + s5 + '$ and $x = ' + (-s5) + '$.'],
      hint: 'Factor the denominator, and check whether any factor cancels with the numerator.',
      chk: { k: 'va', f: '(' + (withHole ? xmP(p) : nm.replace(/\s/g, '')) + ')/(' + d2.plain() + ')', xs: ans.map(Number) }
    };
  });

  G('calc1.limit-laws', function (R, ctx) {
    var kind = lv(ctx, R.pick(['combo', 'sub']), R.pick(['combo', 'combo', 'sub', 'fail']), R.pick(['combo', 'sub', 'fail']));
    var a = R.int(-3, 4);
    if (kind === 'combo') {
      var A = R.nz(-6, 6), B = R.nz(-5, 5), form = R.int(1, ctx.level >= 2 ? 6 : 4), c1 = R.intNot(-4, 4, [0, 1]), c2 = R.nz(-4, 4), c3 = R.intNot(-4, 4, [0, B]), val, ex, st;
      var given = 'Suppose $' + lim(a) + ' f(x) = ' + A + '$ and $' + lim(a) + ' g(x) = ' + B + '$. ';
      if (form === 1) { val = q(c1 * A + c2 * B); ex = T.coef(c1, 'f(x)') + T.coef(c2, 'g(x)', false); st = ['Sum and constant-multiple laws: take the limit of each piece.', '$' + c1 + '(' + A + ')' + (c2 < 0 ? ' - ' + (-c2) : ' + ' + c2) + '(' + B + ') = ' + tx(val) + '$.']; }
      else if (form === 2) { val = q(A * B); ex = 'f(x)\\,g(x)'; st = ['Product law: the limit of a product is the product of the limits.', '$(' + A + ')(' + B + ') = ' + tx(val) + '$.']; }
      else if (form === 3) { val = q(A).div(B); ex = dfrac('f(x)', 'g(x)'); st = ['Quotient law: allowed because the bottom\'s limit, $' + B + '$, is not 0.', '$' + frac(A, B) + ' = ' + tx(val) + '$.']; }
      else if (form === 4) { val = q(A * A + c2 * B); ex = '\\big[f(x)\\big]^{2}' + T.coef(c2, 'g(x)', false); st = ['Power law: $\\big[f(x)\\big]^2 \\to (' + A + ')^2 = ' + (A * A) + '$.', 'Then add: $' + (A * A) + (c2 < 0 ? ' - ' + (-c2) : ' + ' + c2) + '(' + B + ') = ' + tx(val) + '$.']; }
      else if (form === 5) { val = q(A + c1).div(B - c3); ex = dfrac('f(x)' + sg(c1), 'g(x)' + sg(-c3)); st = ['The bottom tends to $' + B + sg(-c3) + ' = ' + (B - c3) + '$, which is not 0, so the quotient law applies.', 'The top tends to $' + A + sg(c1) + ' = ' + (A + c1) + '$.', 'So the limit is $' + frac(A + c1, B - c3) + ' = ' + tx(val) + '$.']; }
      else { val = q(a * a * A); ex = 'x^{2} f(x)'; st = ['$x^2 \\to ' + tp(a) + '^2 = ' + (a * a) + '$ as $x \\to ' + a + '$.', 'Product law: $' + (a * a) + ' \\cdot ' + tp(A) + ' = ' + tx(val) + '$.']; }
      return { q: given + 'Find $' + lim(a) + ' \\left(' + ex + '\\right)$.', a: num(val), steps: st, hint: 'Replace each limit by its value, using the sum, product and quotient laws.', chk: { k: 'val', v: val.toNumber() } };
    }
    if (kind === 'sub') {
      if (a === 0) a = R.pick([-2, 2, 3]);
      var top = P([R.int(-5, 5), R.int(-4, 4), R.nz(-3, 3)]), bot;
      do { bot = P([R.int(-6, 6), R.nz(-3, 3)]); } while (bot.at(a).isZero());
      var vt = top.at(a), vb = bot.at(a), v = vt.div(vb);
      return {
        q: 'Find $' + lim(a) + ' ' + dfrac(top.tex(), bot.tex()) + '$.',
        a: num(v),
        steps: ['The bottom tends to $' + bot.subT(a) + ' = ' + tx(vb) + '$, which is not 0. So the quotient law applies and we may substitute $x = ' + a + '$.',
          'Top: $' + top.subT(a) + ' = ' + tx(vt) + '$.',
          'The limit is $' + frac(tx(vt), tx(vb)) + ' = ' + tx(v) + '$.'],
        hint: 'First check that the denominator does not tend to 0. Then substitute.',
        chk: { k: 'lim', f: '(' + top.plain() + ')/(' + bot.plain() + ')', a: a }
      };
    }
    var b = R.intNot(-4, 5, [0, a]);
    var good = 'No: the denominator tends to 0, so the quotient law does not apply. (Factor first.)';
    return {
      q: 'A classmate says: "By the quotient law, $' + lim(b) + ' ' + frac('x^{2} - ' + (b * b), xm(b)) + ' = ' + frac(lim(b) + ' (x^{2} - ' + (b * b) + ')', lim(b) + ' (' + xm(b) + ')') + '$." Is that step correct?',
      a: mc(good, ['Yes: the quotient law always applies to a fraction.', 'Yes, and it shows the limit is $' + frac(0, 0) + ' = 0$.', 'No: the numerator tends to 0, so the limit is 0.']),
      steps: ['The quotient law needs the limit of the bottom to be a number other than 0.', 'Here the bottom tends to $' + b + ' - ' + tp(b) + ' = 0$, so the law cannot be used.',
        'The limit still exists: $' + frac('x^{2} - ' + (b * b), xm(b)) + ' = ' + xm(-b) + '$ for $x \\ne ' + b + '$, which tends to $' + (2 * b) + '$.'],
      hint: 'Check the condition the quotient law needs.',
      chk: { k: 'mc' }
    };
  });

  G('calc1.limits-by-factoring', function (R, ctx) {
    var kind = lv(ctx, R.pick(['lin', 'lin', 'dsq']), R.pick(['quad', 'lin', 'dsq']), R.pick(['quad', 'cube', 'cube2', 'cfrac']));
    var a = R.intNot(-4, 5, 0), top, bot, L, st, f;
    if (kind === 'lin') {
      var r = R.intNot(-6, 6, a), k = ctx.level >= 2 ? R.pick([1, 1, 2, 3, -1]) : 1;
      top = fromRoots(k, [a, r]); bot = P([-a, 1]); L = q(k * (a - r));
      st = ['Substituting $x = ' + a + '$ gives $' + frac(0, 0) + '$. That is not an answer; it says $' + xm(a) + '$ is a factor of the top.',
        'Factor: $' + top.tex() + ' = ' + (k === 1 ? '' : k === -1 ? '-' : k) + '(' + xm(a) + ')(' + xm(r) + ')$.',
        'Cancel the common factor (allowed, since $x \\ne ' + a + '$ in a limit): the expression equals $' + (k === 1 ? xm(r) : (k === -1 ? '-' : k) + '(' + xm(r) + ')') + '$.',
        'Substitute: $' + (k === 1 ? '' : k === -1 ? '-' : k) + '(' + a + sg(-r) + ') = ' + tx(L) + '$.'];
    } else if (kind === 'dsq') {
      var flip = R.coin();
      top = flip ? P([-a, 1]) : P([-a * a, 0, 1]); bot = flip ? P([-a * a, 0, 1]) : P([-a, 1]); L = flip ? q(1).div(2 * a) : q(2 * a);
      st = ['Substituting gives $' + frac(0, 0) + '$, so look for a common factor.',
        'Difference of squares: $x^{2} - ' + (a * a) + ' = (' + xm(a) + ')(' + xm(-a) + ')$.',
        flip ? 'Cancel $' + xm(a) + '$: the expression equals $' + frac(1, xm(-a)) + '$.' : 'Cancel $' + xm(a) + '$: the expression equals $' + xm(-a) + '$.',
        'Substitute $x = ' + a + '$: $' + tx(L) + '$.'];
    } else if (kind === 'quad') {
      var r2 = R.intNot(-6, 6, a), s = R.intNot(-6, 6, [a, r2]);
      top = fromRoots(1, [a, r2]); bot = fromRoots(1, [a, s]); L = q(a - r2).div(a - s);
      st = ['Substituting gives $' + frac(0, 0) + '$: both top and bottom have the factor $' + xm(a) + '$.',
        'Factor both: $' + frac('(' + xm(a) + ')(' + xm(r2) + ')', '(' + xm(a) + ')(' + xm(s) + ')') + '$.',
        'Cancel $' + xm(a) + '$: $' + frac(xm(r2), xm(s)) + '$.',
        'Substitute $x = ' + a + '$: $' + frac(a - r2, a - s) + ' = ' + tx(L) + '$.'];
    } else if (kind === 'cube' || kind === 'cube2') {
      a = R.intNot(-3, 3, 0);
      top = P([-a * a * a, 0, 0, 1]);
      if (kind === 'cube') { bot = P([-a, 1]); L = q(3 * a * a); }
      else { bot = P([-a * a, 0, 1]); L = q(3 * a * a).div(2 * a); }
      st = ['Substituting gives $' + frac(0, 0) + '$.',
        'Difference of cubes: $x^{3}' + sg(-a * a * a) + ' = (' + xm(a) + ')(x^{2}' + T.coef(a, 'x', false) + ' + ' + (a * a) + ')$.',
        kind === 'cube' ? 'Cancel $' + xm(a) + '$: the expression equals $x^{2}' + T.coef(a, 'x', false) + ' + ' + (a * a) + '$.' : 'Also $x^{2} - ' + (a * a) + ' = (' + xm(a) + ')(' + xm(-a) + ')$. Cancel $' + xm(a) + '$: $' + frac('x^{2}' + T.coef(a, 'x', false) + ' + ' + (a * a), xm(-a)) + '$.',
        kind === 'cube' ? 'Substitute: $' + (a * a) + ' + ' + (a * a) + ' + ' + (a * a) + ' = ' + tx(L) + '$.' : 'Substitute: $' + frac(3 * a * a, 2 * a) + ' = ' + tx(L) + '$.'];
    } else {
      a = R.intNot(-5, 5, [0]);
      L = q(-1).div(a * a);
      return {
        q: 'Find $' + lim(a) + ' ' + dfrac(frac(1, 'x') + (a > 0 ? ' - ' : ' + ') + frac(1, abs(a)), xm(a)) + '$.',
        a: num(L),
        steps: ['Substituting gives $' + frac(0, 0) + '$. Combine the top over the common denominator $' + T.coef(a, 'x') + '$: $' + frac(1, 'x') + (a > 0 ? ' - ' : ' + ') + frac(1, abs(a)) + ' = ' + frac(a + ' - x', T.coef(a, 'x')) + '$.',
          'Write $' + a + ' - x = -(' + xm(a) + ')$, then divide by $' + xm(a) + '$: the expression equals $' + frac(-1, T.coef(a, 'x')) + '$.',
          'Substitute $x = ' + a + '$: $' + frac(-1, tp(a) + '\\cdot' + tp(a)) + ' = ' + tx(L) + '$.'],
        hint: 'Combine the two fractions in the numerator first.',
        chk: { k: 'lim', f: '(1/x-1/(' + a + '))/(' + xmP(a) + ')', a: a }
      };
    }
    f = '(' + top.plain() + ')/(' + bot.plain() + ')';
    return {
      q: 'Find $' + lim(a) + ' ' + dfrac(top.tex(), bot.tex()) + '$.',
      a: num(L),
      steps: st,
      hint: 'Substituting gives 0/0. Factor the top and bottom and cancel the common factor.',
      chk: { k: 'lim', f: f, a: a }
    };
  });

  G('calc1.limits-by-rationalizing', function (R, ctx) {
    var kind = lv(ctx, R.pick(['zero', 'sqrtx']), R.pick(['shift', 'flip', 'zero', 'm']), R.pick(['m', 'flip', 'two']));
    var c = R.int(1, 6), p, n, m, L, topT, botT, f, st, a;
    if (kind === 'zero') {
      a = 0; topT = '\\sqrt{x + ' + (c * c) + '} - ' + c; botT = 'x'; L = q(1).div(2 * c); f = '(sqrt(x+' + (c * c) + ')-' + c + ')/x';
      st = ['Substituting $x = 0$ gives $' + frac('\\sqrt{' + (c * c) + '} - ' + c, 0) + ' = ' + frac(0, 0) + '$.',
        'Multiply top and bottom by the conjugate $\\sqrt{x + ' + (c * c) + '} + ' + c + '$.',
        'Top: $(\\sqrt{x + ' + (c * c) + '})^{2} - ' + c + '^{2} = x + ' + (c * c) + ' - ' + (c * c) + ' = x$.',
        'So the expression is $' + frac('x', 'x(\\sqrt{x + ' + (c * c) + '} + ' + c + ')') + ' = ' + frac(1, '\\sqrt{x + ' + (c * c) + '} + ' + c) + '$.',
        'Substitute $x = 0$: $' + frac(1, c + ' + ' + c) + ' = ' + tx(L) + '$.'];
    } else if (kind === 'sqrtx') {
      a = c * c; c = Math.max(c, 2); a = c * c; topT = '\\sqrt{x} - ' + c; botT = 'x - ' + a; L = q(1).div(2 * c); f = '(sqrt(x)-' + c + ')/(x-' + a + ')';
      st = ['Substituting $x = ' + a + '$ gives $' + frac(0, 0) + '$.',
        'Multiply top and bottom by $\\sqrt{x} + ' + c + '$. The top becomes $x - ' + a + '$.',
        'Cancel $x - ' + a + '$: the expression is $' + frac(1, '\\sqrt{x} + ' + c) + '$.',
        'Substitute: $' + frac(1, c + ' + ' + c) + ' = ' + tx(L) + '$.'];
    } else if (kind === 'shift' || kind === 'm' || kind === 'flip') {
      m = kind === 'm' ? R.pick([2, 3, 4, 5]) : 1; p = R.intNot(-4, 5, 0); c = R.int(1, 5); n = c * c - m * p; a = p;
      var inside = linT(m, n), insideP = linP(m, n);
      if (kind === 'flip') {
        topT = xm(p); botT = '\\sqrt{' + inside + '} - ' + c; L = q(2 * c); f = '(' + xmP(p) + ')/(sqrt(' + insideP + ')-' + c + ')';
        st = ['Substituting $x = ' + p + '$ gives $' + frac(0, '\\sqrt{' + (c * c) + '} - ' + c) + ' = ' + frac(0, 0) + '$.',
          'Multiply top and bottom by $\\sqrt{' + inside + '} + ' + c + '$.',
          'Bottom: $(' + inside + ') - ' + (c * c) + ' = ' + xm(p) + '$.',
          'Cancel $' + xm(p) + '$: the expression is $\\sqrt{' + inside + '} + ' + c + '$.',
          'Substitute: $\\sqrt{' + (c * c) + '} + ' + c + ' = ' + (2 * c) + '$.'];
      } else {
        topT = '\\sqrt{' + inside + '} - ' + c; botT = xm(p); L = q(m).div(2 * c); f = '(sqrt(' + insideP + ')-' + c + ')/(' + xmP(p) + ')';
        st = ['Substituting $x = ' + p + '$ gives $' + frac('\\sqrt{' + (c * c) + '} - ' + c, 0) + ' = ' + frac(0, 0) + '$.',
          'Multiply top and bottom by the conjugate $\\sqrt{' + inside + '} + ' + c + '$.',
          'Top: $(' + inside + ') - ' + (c * c) + ' = ' + (m === 1 ? xm(p) : m + '(' + xm(p) + ')') + '$.',
          'Cancel $' + xm(p) + '$: the expression is $' + frac(m, '\\sqrt{' + inside + '} + ' + c) + '$.',
          'Substitute: $' + frac(m, c + ' + ' + c) + ' = ' + tx(L) + '$.'];
      }
    } else {
      a = 0; topT = '\\sqrt{' + (c * c) + ' + x} - \\sqrt{' + (c * c) + ' - x}'; botT = 'x'; L = q(1).div(c); f = '(sqrt(' + (c * c) + '+x)-sqrt(' + (c * c) + '-x))/x';
      st = ['Substituting $x = 0$ gives $' + frac(0, 0) + '$.',
        'Multiply top and bottom by $\\sqrt{' + (c * c) + ' + x} + \\sqrt{' + (c * c) + ' - x}$.',
        'Top: $(' + (c * c) + ' + x) - (' + (c * c) + ' - x) = 2x$.',
        'Cancel $x$: the expression is $' + frac(2, '\\sqrt{' + (c * c) + ' + x} + \\sqrt{' + (c * c) + ' - x}') + '$.',
        'Substitute: $' + frac(2, c + ' + ' + c) + ' = ' + tx(L) + '$.'];
    }
    return {
      q: 'Find $' + lim(a) + ' ' + dfrac(topT, botT) + '$.',
      a: num(L), steps: st,
      hint: 'Multiply the top and bottom by the conjugate of the expression with the square root.',
      chk: { k: 'lim', f: f, a: a }
    };
  });

  G('calc1.squeeze-theorem', function (R, ctx) {
    var kind = lv(ctx, R.pick(['bound', 'osc']), R.pick(['bound', 'osc', 'inf']), R.pick(['bound', 'inf', 'inf2']));
    if (kind === 'bound') {
      var a = R.int(-3, 4), L = R.int(-6, 8), m = R.int(-4, 4), b = L - m * a;
      var g = P([b, m]), h = P([a * a, -2 * a, 1]).add(g);
      var flip = R.coin();
      return {
        q: 'For all $x$ near $' + a + '$, $' + (flip ? h.tex() + ' \\ge f(x) \\ge ' + g.tex() : g.tex() + ' \\le f(x) \\le ' + h.tex()) + '$. Find $' + lim(a) + ' f(x)$.',
        a: num(L),
        steps: ['Lower function: $' + lim(a) + ' (' + g.tex() + ') = ' + g.subT(a) + ' = ' + L + '$.',
          'Upper function: $' + lim(a) + ' (' + h.tex() + ') = ' + L + '$.',
          'Both bounds tend to $' + L + '$, and $f(x)$ is trapped between them, so by the squeeze theorem $' + lim(a) + ' f(x) = ' + L + '$.'],
        hint: 'Find the limits of the two bounding functions.',
        chk: { k: 'val', v: L, alsoLim: [g.plain(), h.plain(), a] }
      };
    }
    if (kind === 'osc') {
      var n = R.int(1, 3), k = R.int(1, 5), fn = R.pick(['sin', 'cos']), xn = n === 1 ? 'x' : 'x^{' + n + '}';
      var ft = xn + '\\' + fn + '\\left(' + frac(k, 'x') + '\\right)';
      var bnd = n % 2 === 0 ? xn : '\\lvert x \\rvert' + (n > 1 ? '^{' + n + '}' : '');
      return {
        q: 'Find $' + lim(0) + ' ' + ft + '$.',
        a: num(0),
        steps: ['$\\' + fn + '(' + k + '/x)$ swings between $-1$ and $1$ forever as $x \\to 0$, so it has no limit by itself. The product rule for limits cannot be used.',
          'But $-1 \\le \\' + fn + '(' + k + '/x) \\le 1$, so $-' + bnd + ' \\le ' + ft + ' \\le ' + bnd + '$.',
          'Both $-' + bnd + '$ and $' + bnd + '$ tend to $0$ as $x \\to 0$.',
          'By the squeeze theorem, the limit is $0$.'],
        hint: 'Bound the sine or cosine factor between −1 and 1.',
        chk: { k: 'lim', f: 'x^' + n + '*' + fn + '(' + k + '/x)', a: 0, osc: true }
      };
    }
    var mm = R.nz(-6, 6), kk = R.int(1, 5), fn2 = R.pick(['sin', 'cos']), pw = kind === 'inf2' ? 2 : 1;
    var xp = pw === 1 ? 'x' : 'x^{2}';
    return {
      q: 'Find $' + limInf(1) + ' ' + dfrac(T.coef(mm, xp) + ' + \\' + fn2 + '(' + (kk === 1 ? '' : kk) + 'x)', xp) + '$.',
      a: num(mm),
      steps: ['Split the fraction: $' + frac(T.coef(mm, xp), xp) + ' + ' + frac('\\' + fn2 + '(' + (kk === 1 ? '' : kk) + 'x)', xp) + ' = ' + mm + ' + ' + frac('\\' + fn2 + '(' + (kk === 1 ? '' : kk) + 'x)', xp) + '$.',
        'Since $-1 \\le \\' + fn2 + '(' + (kk === 1 ? '' : kk) + 'x) \\le 1$, for $x > 0$: $-' + frac(1, xp) + ' \\le ' + frac('\\' + fn2 + '(' + (kk === 1 ? '' : kk) + 'x)', xp) + ' \\le ' + frac(1, xp) + '$.',
        'Both bounds tend to $0$ as $x \\to \\infty$, so the second piece tends to $0$ by the squeeze theorem.',
        'The limit is $' + mm + ' + 0 = ' + mm + '$.'],
      hint: 'Split into two fractions and squeeze the one with the sine or cosine.',
      chk: { k: 'lim', f: '(' + mm + '*x^' + pw + '+' + fn2 + '(' + kk + 'x))/x^' + pw, a: 'inf' }
    };
  });

  G('calc1.trig-limits', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sinab', 'sinab', 'tan']), R.pick(['sinsin', 'tan', 'xsin', 'factor', 'cos1']), R.pick(['cos2', 'sinsq', 'factor', 'sinsin']));
    var a = R.int(2, 7), b = R.intNot(2, 9, a), L, ft, f, st;
    var ax = a + 'x', bx = b + 'x';
    if (kind === 'sinab') {
      L = q(a).div(b); ft = dfrac('\\sin(' + ax + ')', bx); f = 'sin(' + ax + ')/(' + bx + ')';
      st = ['To use $\\lim_{\\theta \\to 0} ' + frac('\\sin\\theta', '\\theta') + ' = 1$, the bottom must match the angle $' + ax + '$.',
        'Rewrite: $' + frac('\\sin(' + ax + ')', bx) + ' = ' + frac(a, b) + ' \\cdot ' + frac('\\sin(' + ax + ')', ax) + '$.',
        'As $x \\to 0$, $\\theta = ' + ax + ' \\to 0$, so $' + frac('\\sin(' + ax + ')', ax) + ' \\to 1$.',
        'The limit is $' + frac(a, b) + ' \\cdot 1 = ' + tx(L) + '$.'];
    } else if (kind === 'tan') {
      L = q(a).div(b); ft = dfrac('\\tan(' + ax + ')', bx); f = 'tan(' + ax + ')/(' + bx + ')';
      st = ['Write $\\tan(' + ax + ') = ' + frac('\\sin(' + ax + ')', '\\cos(' + ax + ')') + '$.',
        'Then $' + frac('\\tan(' + ax + ')', bx) + ' = ' + frac(a, b) + ' \\cdot ' + frac('\\sin(' + ax + ')', ax) + ' \\cdot ' + frac(1, '\\cos(' + ax + ')') + '$.',
        'As $x \\to 0$: $' + frac('\\sin(' + ax + ')', ax) + ' \\to 1$ and $\\cos(' + ax + ') \\to 1$.',
        'The limit is $' + tx(L) + '$.'];
    } else if (kind === 'sinsin') {
      L = q(a).div(b); ft = dfrac('\\sin(' + ax + ')', '\\sin(' + bx + ')'); f = 'sin(' + ax + ')/sin(' + bx + ')';
      st = ['Multiply and divide to make two special limits: $' + frac('\\sin(' + ax + ')', '\\sin(' + bx + ')') + ' = ' + frac('\\sin(' + ax + ')', ax) + ' \\cdot ' + frac(bx, '\\sin(' + bx + ')') + ' \\cdot ' + frac(ax, bx) + '$.',
        'As $x \\to 0$ the first two factors tend to $1$, and $' + frac(ax, bx) + ' = ' + frac(a, b) + '$.',
        'The limit is $' + tx(L) + '$.'];
    } else if (kind === 'xsin') {
      L = q(b).div(a); ft = dfrac(bx, '\\sin(' + ax + ')'); f = '(' + bx + ')/sin(' + ax + ')';
      st = ['Flip the special limit: $' + frac('\\theta', '\\sin\\theta') + ' \\to 1$ as $\\theta \\to 0$ too.',
        'Rewrite: $' + frac(bx, '\\sin(' + ax + ')') + ' = ' + frac(b, a) + ' \\cdot ' + frac(ax, '\\sin(' + ax + ')') + '$.',
        'The limit is $' + frac(b, a) + ' \\cdot 1 = ' + tx(L) + '$.'];
    } else if (kind === 'factor') {
      var c = R.intNot(2, 9, a); L = q(a).div(c); ft = dfrac('\\sin(' + ax + ')', T.poly([b, c, 0], 'x')); f = 'sin(' + ax + ')/(' + b + 'x^2+' + c + 'x)';
      st = ['Factor the bottom: $' + b + 'x^{2} + ' + c + 'x = x(' + b + 'x + ' + c + ')$.',
        'So the expression is $' + frac('\\sin(' + ax + ')', 'x') + ' \\cdot ' + frac(1, b + 'x + ' + c) + '$.',
        'As $x \\to 0$: $' + frac('\\sin(' + ax + ')', 'x') + ' = ' + a + ' \\cdot ' + frac('\\sin(' + ax + ')', ax) + ' \\to ' + a + '$, and $' + frac(1, b + 'x + ' + c) + ' \\to ' + frac(1, c) + '$.',
        'The limit is $' + frac(a, c) + (gcd(a, c) > 1 ? ' = ' + tx(L) : '') + '$.'];
    } else if (kind === 'cos1') {
      L = q(0); ft = dfrac('1 - \\cos(' + ax + ')', bx); f = '(1-cos(' + ax + '))/(' + bx + ')';
      st = ['Use the second special limit: $\\lim_{\\theta \\to 0} ' + frac('1 - \\cos\\theta', '\\theta') + ' = 0$.',
        'Rewrite: $' + frac('1 - \\cos(' + ax + ')', bx) + ' = ' + frac(a, b) + ' \\cdot ' + frac('1 - \\cos(' + ax + ')', ax) + '$.',
        'The limit is $' + frac(a, b) + ' \\cdot 0 = 0$.'];
    } else if (kind === 'cos2') {
      L = q(a * a).div(2); ft = dfrac('1 - \\cos(' + ax + ')', 'x^{2}'); f = '(1-cos(' + ax + '))/x^2';
      st = ['Multiply top and bottom by $1 + \\cos(' + ax + ')$: the top becomes $1 - \\cos^{2}(' + ax + ') = \\sin^{2}(' + ax + ')$.',
        'So the expression is $\\left(' + frac('\\sin(' + ax + ')', 'x') + '\\right)^{2} \\cdot ' + frac(1, '1 + \\cos(' + ax + ')') + '$.',
        'As $x \\to 0$: $' + frac('\\sin(' + ax + ')', 'x') + ' \\to ' + a + '$ and $1 + \\cos(' + ax + ') \\to 2$.',
        'The limit is $' + frac(a + '^{2}', 2) + ' = ' + tx(L) + '$.'];
    } else {
      L = q(a * a).div(b); ft = dfrac('\\sin^{2}(' + ax + ')', b + 'x^{2}'); f = 'sin(' + ax + ')^2/(' + b + 'x^2)';
      st = ['Write it as $' + frac(1, b) + '\\left(' + frac('\\sin(' + ax + ')', 'x') + '\\right)^{2}$.',
        '$' + frac('\\sin(' + ax + ')', 'x') + ' = ' + a + ' \\cdot ' + frac('\\sin(' + ax + ')', ax) + ' \\to ' + a + '$.',
        'The limit is $' + frac(1, b) + ' \\cdot ' + a + '^{2} = ' + tx(L) + '$.'];
    }
    return { q: 'Find $' + lim(0) + ' ' + ft + '$. (Angles are in radians.)', a: num(L), steps: st, hint: 'Rewrite the expression so that sin(θ)/θ appears with the same θ on top and bottom.', chk: { k: 'lim', f: f, a: 0 } };
  });

  G('calc1.continuity', function (R, ctx) {
    var kind = lv(ctx, R.pick(['k1', 'k2']), R.pick(['k1', 'type', 'where', 'k2']), R.pick(['two', 'type', 'where', 'k1']));
    if (kind === 'k1') {
      var a = R.pick([1, 2, 3, -1, -2]), k = R.nz(-5, 5), b = R.int(-6, 6), c = k * a + b - a * a;
      var left = 'kx' + sg(b), right = 'x^{2}' + sg(c), lc = R.coin();
      return {
        q: 'Find the value of $k$ that makes $f(x) = ' + cases([[left, '\\text{if } x < ' + a], [right, '\\text{if } x \\ge ' + a]]) + '$ continuous at $x = ' + a + '$.',
        a: num(k),
        steps: ['For continuity at $x = ' + a + '$ the left limit, the right limit and $f(' + a + ')$ must all agree.',
          'Right side and value: $f(' + a + ') = ' + tp(a) + '^{2}' + sg(c) + ' = ' + (a * a + c) + '$.',
          'Left limit: $k \\cdot ' + tp(a) + sg(b) + ' = ' + T.coef(a, 'k') + sg(b) + '$.',
          'Set them equal: $' + T.coef(a, 'k') + sg(b) + ' = ' + (a * a + c) + '$, so $' + T.coef(a, 'k') + ' = ' + (a * a + c - b) + '$ and $k = ' + k + '$.'],
        hint: 'Make the two pieces give the same value at x = ' + a + '.',
        chk: { k: 'val', v: k, cont: { l: 'k*x+' + b, r: 'x^2+' + c, a: a } }
      };
    }
    if (kind === 'k2') {
      var a2 = R.intNot(-4, 5, 0), r = R.intNot(-5, 5, a2), p = fromRoots(1, [a2, r]), val = q(a2 - r);
      return {
        q: 'Let $f(x) = ' + cases([[dfrac(p.tex(), xm(a2)), '\\text{if } x \\ne ' + a2], ['k', '\\text{if } x = ' + a2]]) + '$. What value of $k$ makes $f$ continuous at $x = ' + a2 + '$?',
        a: num(val),
        steps: ['$f$ is continuous at $' + a2 + '$ exactly when $f(' + a2 + ') = ' + lim(a2) + ' f(x)$, so $k$ must equal the limit.',
          'Factor: $' + p.tex() + ' = (' + xm(a2) + ')(' + xm(r) + ')$, so for $x \\ne ' + a2 + '$, $f(x) = ' + xm(r) + '$.',
          'The limit is $' + a2 + sg(-r) + ' = ' + tx(val) + '$, so $k = ' + tx(val) + '$. This fills the hole in the graph.'],
        hint: 'k has to be the limit of f at x = ' + a2 + '.',
        chk: { k: 'lim', f: '(' + p.plain() + ')/(' + xmP(a2) + ')', a: a2 }
      };
    }
    if (kind === 'type') {
      var t = R.pick(['removable', 'infinite', 'jump', 'continuous']), a3 = R.int(-3, 4), ft, why;
      if (t === 'removable') { var r3 = R.intNot(-5, 5, a3), p3 = fromRoots(1, [a3, r3]); ft = 'f(x) = ' + dfrac(p3.tex(), xm(a3)); why = ['Factor: $f(x) = ' + frac('(' + xm(a3) + ')(' + xm(r3) + ')', xm(a3)) + ' = ' + xm(r3) + '$ for $x \\ne ' + a3 + '$.', 'The limit exists ($' + (a3 - r3) + '$) but $f(' + a3 + ')$ is undefined: a hole, which is a removable discontinuity.']; }
      else if (t === 'infinite') { var b3 = R.intNot(-5, 5, -a3); ft = 'f(x) = ' + dfrac(xm(-b3), xm(a3)); why = ['Near $x = ' + a3 + '$ the bottom tends to 0 while the top tends to $' + (a3 + b3) + '$, which is not 0.', 'So $f$ grows without bound: an infinite discontinuity (a vertical asymptote).']; }
      else if (t === 'jump') { var m1 = R.nz(-3, 3), c1 = R.int(-4, 4), c2 = c1 + R.nz(-4, 4); ft = 'f(x) = ' + cases([[linT(m1, c1 - m1 * a3), 'x < ' + a3], [linT(m1, c2 - m1 * a3), 'x \\ge ' + a3]]); why = ['Left limit: $' + c1 + '$. Right limit: $' + c2 + '$.', 'Both one-sided limits exist but they differ, so the graph jumps: a jump discontinuity.']; }
      else { var m2 = R.nz(-3, 3), c3 = R.int(-4, 4); ft = 'f(x) = ' + cases([[linT(m2, c3 - m2 * a3), 'x < ' + a3], ['x^{2}' + sg(c3 - a3 * a3), 'x \\ge ' + a3]]); why = ['Left limit: $' + c3 + '$. Right limit and value: $' + tp(a3) + '^{2}' + sg(c3 - a3 * a3) + ' = ' + c3 + '$.', 'All three agree, so $f$ is continuous at $x = ' + a3 + '$.']; }
      var names = { removable: 'A removable discontinuity (a hole)', infinite: 'An infinite discontinuity (a vertical asymptote)', jump: 'A jump discontinuity', continuous: 'No discontinuity: f is continuous there' };
      return {
        q: 'What happens at $x = ' + a3 + '$ for $' + ft + '$?',
        a: { t: 'mc', choices: [names.removable, names.infinite, names.jump, names.continuous], v: ['removable', 'infinite', 'jump', 'continuous'].indexOf(t), keep: true },
        steps: why, hint: 'Find the left and right limits at x = ' + a3 + ' and compare them with f(' + a3 + ').', chk: { k: 'mc' }
      };
    }
    if (kind === 'where') {
      var n = R.int(1, 5), bb = R.intNot(-6, 6, [n, -n]);
      if (R.coin()) {
        return {
          q: 'On what intervals is $f(x) = ' + dfrac(xm(-bb), 'x^{2} - ' + (n * n)) + '$ continuous? Answer in interval notation.',
          a: { t: 'interval', v: '(-inf, ' + (-n) + ') U (' + (-n) + ', ' + n + ') U (' + n + ', inf)' },
          steps: ['A rational function is continuous everywhere it is defined.', 'It is undefined where $x^{2} - ' + (n * n) + ' = 0$, that is, at $x = \\pm ' + n + '$.',
            'So $f$ is continuous on $(-\\infty, ' + (-n) + ') \\cup (' + (-n) + ', ' + n + ') \\cup (' + n + ', \\infty)$.'],
          hint: 'Where is the denominator zero?', chk: { k: 'mc' }
        };
      }
      var s = R.int(-5, 6);
      return {
        q: 'On what interval is $f(x) = \\sqrt{' + xm(s) + '}$ continuous? Answer in interval notation.',
        a: { t: 'interval', v: '[' + s + ', inf)' },
        steps: ['A square root is defined (and continuous) where the inside is at least 0.', '$' + xm(s) + ' \\ge 0$ means $x \\ge ' + s + '$.', 'At the endpoint $x = ' + s + '$ the function is continuous from the right, which is all a closed endpoint needs.', 'So $f$ is continuous on $[' + s + ', \\infty)$.'],
        hint: 'Where is the expression under the root nonnegative?', chk: { k: 'mc' }
      };
    }
    // two unknowns
    var A = R.int(-2, 1), B = A + R.int(2, 3), m = R.nz(-3, 3), nn = R.int(-4, 4), pp = m * A + nn - A, rr = m * B + nn - B * B;
    return {
      q: 'Find $m$ and $n$ so that $f(x) = ' + cases([['x' + sg(pp), 'x < ' + A], ['mx + n', A + ' \\le x \\le ' + B], ['x^{2}' + sg(rr), 'x > ' + B]]) + '$ is continuous everywhere.',
      a: multi([['$m =$', num(m)], ['$n =$', num(nn)]]),
      steps: ['At $x = ' + A + '$: the left piece gives $' + A + sg(pp) + ' = ' + (A + pp) + '$, and the middle piece gives $' + (A === 0 ? 'n' : T.coef(A, 'm') + ' + n') + '$. So $' + (A === 0 ? 'n' : T.coef(A, 'm') + ' + n') + ' = ' + (A + pp) + '$.',
        'At $x = ' + B + '$: the right piece gives $' + tp(B) + '^{2}' + sg(rr) + ' = ' + (B * B + rr) + '$, so $' + (B === 0 ? 'n' : T.coef(B, 'm') + ' + n') + ' = ' + (B * B + rr) + '$.',
        'Subtract the first equation from the second: $' + (B - A) + 'm = ' + (B * B + rr - A - pp) + '$, so $m = ' + m + '$.',
        A === 0 ? 'The first equation already says $n = ' + nn + '$.' : 'Then $n = ' + (A + pp) + ' - ' + tp(A) + ' \\cdot ' + tp(m) + ' = ' + nn + '$.'],
      hint: 'Write one equation for each break point, then solve the system.',
      chk: { k: 'val', v: m, cont2: { A: A, B: B, pp: pp, rr: rr, m: m, n: nn } }
    };
  });

  G('calc1.intermediate-value-theorem', function (R, ctx) {
    var kind = lv(ctx, 'interval', R.pick(['interval', 'count', 'applies']), R.pick(['count', 'applies', 'applies']));
    if (kind === 'interval') {
      var p = R.int(1, 3), k = R.int(0, 3), lo = k * k * k + p * k, hi = (k + 1) * (k + 1) * (k + 1) + p * (k + 1), c = R.int(lo + 1, hi - 1);
      var f = P([-c, p, 0, 1]), vals = [0, 1, 2, 3, 4].map(function (x) { return f.at(x); });
      var choices = [0, 1, 2, 3].map(function (i) { return '$[' + i + ', ' + (i + 1) + ']$'; });
      return {
        q: 'Let $f(x) = ' + f.tex() + '$. Its values are $$' + table(null, [['x', '0', '1', '2', '3', '4'], ['f(x)'].concat(vals.map(tx))]) + '$$ On which interval does the Intermediate Value Theorem guarantee a zero of $f$?',
        a: { t: 'mc', choices: choices, v: k, keep: true },
        steps: ['$f$ is a polynomial, so it is continuous on every interval.', 'Look for a sign change: $f(' + k + ') = ' + tx(vals[k]) + '$ is negative and $f(' + (k + 1) + ') = ' + tx(vals[k + 1]) + '$ is positive.',
          '0 is between them, so by the IVT there is a $c$ in $(' + k + ', ' + (k + 1) + ')$ with $f(c) = 0$.'],
        hint: 'Look for two neighbors in the table with opposite signs.', chk: { k: 'ivt', f: f.plain(), lo: k, hi: k + 1 }
      };
    }
    if (kind === 'count') {
      var signs = [R.sign()], changes = 0;
      for (var i = 1; i < 6; i++) { var s = R.chance(0.45) ? -signs[i - 1] : signs[i - 1]; if (s !== signs[i - 1]) changes++; signs.push(s); }
      if (!changes) { signs[3] = -signs[2]; signs[4] = signs[3]; signs[5] = signs[3]; changes = 1; }
      var vs = signs.map(function (s) { return s * R.int(1, 9); });
      return {
        q: 'A function $g$ is continuous on $[0, 5]$, with these values: $$' + table(null, [['x', '0', '1', '2', '3', '4', '5'], ['g(x)'].concat(vs.map(String))]) + '$$ What is the smallest number of zeros that $g$ must have on $[0, 5]$?',
        a: num(changes),
        steps: ['Each time the sign changes between neighbors, the IVT (with $N = 0$) guarantees a zero in between.',
          'Sign changes: ' + (signs.map(function (s, j) { return j && s !== signs[j - 1] ? '$[' + (j - 1) + ', ' + j + ']$' : null; }).filter(Boolean).join(', ')) + '.',
          'These intervals do not overlap, so the zeros are different: at least ' + changes + '. ($g$ could have more zeros; the theorem only promises these.)'],
        hint: 'Count the places where neighboring values have opposite signs.', chk: { k: 'val', v: changes }
      };
    }
    var t = R.pick(['yes', 'notbetween', 'notcont']), a = R.int(-2, 1), b = a + R.int(2, 4), N, ft, f2, fa, fb;
    var C = { yes: 'Yes: $f$ is continuous on $[a, b]$ and $N$ is between $f(a)$ and $f(b)$.', notbetween: 'No: $N$ is not between $f(a)$ and $f(b)$.', notcont: 'No: $f$ is not continuous on $[a, b]$.', wrong: 'Yes: $f(a)$ and $f(b)$ are different numbers.' };
    if (t === 'notcont') {
      var m = R.int(a + 1, b - 1); f2 = P([-m, 1]); ft = frac(1, xm(m)); fa = q(1).div(a - m); fb = q(1).div(b - m); N = q(0);
      return {
        q: 'Let $f(x) = ' + ft + '$ on $[' + a + ', ' + b + ']$, and $N = 0$. Here $f(' + a + ') = ' + tx(fa) + '$ and $f(' + b + ') = ' + tx(fb) + '$. Does the Intermediate Value Theorem guarantee a $c$ in $(' + a + ', ' + b + ')$ with $f(c) = N$?',
        a: { t: 'mc', choices: [C.notcont, C.yes, C.notbetween, C.wrong], v: 0, keep: true },
        steps: ['The IVT needs $f$ to be continuous on the whole closed interval.', '$f$ is undefined at $x = ' + m + '$, which is inside $[' + a + ', ' + b + ']$ (a vertical asymptote).', 'So the theorem does not apply. In fact $' + ft + '$ is never 0, even though its values change sign.'],
        hint: 'Check both conditions of the theorem.', chk: { k: 'mc' }
      };
    }
    var f3 = P([R.int(-4, 4), R.nz(-3, 3), R.nz(-2, 2)]); fa = f3.at(a); fb = f3.at(b);
    while (fa.eq(fb)) { f3 = f3.add(P([0, 1])); fa = f3.at(a); fb = f3.at(b); }
    var lo2 = Q.min(fa, fb), hi2 = Q.max(fa, fb);
    var gap = hi2.sub(lo2).toNumber();
    if (t === 'yes') N = gap >= 2 ? lo2.add(R.int(1, gap - 1)) : lo2.add(hi2).div(2); else N = R.coin() ? hi2.add(R.int(1, 4)) : lo2.sub(R.int(1, 4));
    return {
      q: 'Let $f(x) = ' + f3.tex() + '$ on $[' + a + ', ' + b + ']$, and $N = ' + tx(N) + '$. Here $f(' + a + ') = ' + tx(fa) + '$ and $f(' + b + ') = ' + tx(fb) + '$. Does the Intermediate Value Theorem guarantee a $c$ in $(' + a + ', ' + b + ')$ with $f(c) = N$?',
      a: { t: 'mc', choices: t === 'yes' ? [C.yes, C.notbetween, C.notcont, C.wrong] : [C.notbetween, C.yes, C.notcont, C.wrong], v: 0, keep: true },
      steps: ['$f$ is a polynomial, so it is continuous on $[' + a + ', ' + b + ']$.',
        t === 'yes' ? '$' + tx(N) + '$ is between $' + tx(lo2) + '$ and $' + tx(hi2) + '$, so the IVT guarantees such a $c$.' : '$' + tx(N) + '$ is not between $' + tx(lo2) + '$ and $' + tx(hi2) + '$, so the IVT promises nothing. (Some $c$ might still exist, but the theorem does not say so.)'],
      hint: 'Check both conditions of the theorem.', chk: { k: 'mc' }
    };
  });

  G('calc1.limits-at-infinity', function (R, ctx) {
    var kind = lv(ctx, R.pick(['eq', 'low']), R.pick(['eq', 'high', 'ha', 'low']), R.pick(['sqrt', 'high', 'eq', 'sqrt']));
    var dir = lv(ctx, 1, R.sign(), R.sign());
    if (kind === 'sqrt') {
      var aa = R.int(1, 5), b = R.int(1, 9), c = R.nz(-4, 4), d = R.int(-6, 6), L = q(aa).div(c).mul(dir);
      return {
        q: 'Find $' + limInf(dir) + ' ' + dfrac('\\sqrt{' + (aa * aa) + 'x^{2} + ' + b + '}', linT(c, d)) + '$.',
        a: num(L),
        steps: ['Divide top and bottom by $\\lvert x \\rvert$, the size of the leading behavior. ' + (dir > 0 ? 'For $x > 0$, $\\lvert x \\rvert = x$.' : 'For $x < 0$, $\\lvert x \\rvert = -x$, so dividing the bottom by $\\lvert x \\rvert$ means dividing by $-x$.'),
          'Top: $' + frac('\\sqrt{' + (aa * aa) + 'x^{2} + ' + b + '}', '\\lvert x \\rvert') + ' = \\sqrt{' + (aa * aa) + ' + ' + frac(b, 'x^{2}') + '} \\to ' + aa + '$.',
          'Bottom: $' + frac(linT(c, d), (dir > 0 ? 'x' : '-x')) + ' \\to ' + (dir > 0 ? c : -c) + '$.',
          'The limit is $' + frac(aa, dir > 0 ? c : -c) + ' = ' + tx(L) + '$.' + (dir < 0 ? ' The sign flips because $\\sqrt{x^2} = -x$ when $x$ is negative.' : '')],
        hint: 'Remember that the square root of x² is |x|.', chk: { k: 'lim', f: 'sqrt(' + (aa * aa) + 'x^2+' + b + ')/(' + linP(c, d) + ')', a: dir > 0 ? 'inf' : '-inf' }
      };
    }
    var dt = kind === 'low' ? R.int(2, 3) : R.int(1, 3), dn = kind === 'low' ? dt - 1 : kind === 'high' ? dt + 1 : dt;
    var top = [], bot = [], i;
    for (i = 0; i < dn; i++) top.push(R.int(-6, 6)); top.push(R.nz(-6, 6));
    for (i = 0; i < dt; i++) bot.push(R.int(-6, 6)); bot.push(R.nz(-5, 5));
    var Pt = P(top), Pb = P(bot), lt = Pt.lead(), lb = Pb.lead(), ans, last;
    var f = '(' + Pt.plain() + ')/(' + Pb.plain() + ')', pw = dt === 1 ? 'x' : 'x^{' + dt + '}';
    var stp = ['Divide every term by $' + pw + '$, the highest power in the denominator. Any term $' + frac('c', 'x^{k}') + '$ with $k > 0$ tends to $0$.'];
    if (kind === 'eq' || kind === 'ha') {
      ans = num(lt.div(lb)); last = 'Only the leading terms survive: $' + frac(mono(lt, dn), mono(lb, dt)) + ' = ' + frac(tx(lt), tx(lb)) + ' = ' + tx(lt.div(lb)) + '$.';
    } else if (kind === 'low') {
      ans = num(0); last = 'The top becomes terms like $' + frac(tx(lt), 'x') + '$, which tend to 0, while the bottom tends to $' + tx(lb) + '$. The limit is $0$.';
    } else {
      var s = lt.div(lb).sign() * dir; ans = num(s > 0 ? 'inf' : '-inf');
      last = 'The top has a higher power: the expression behaves like $' + frac(mono(lt, dn), mono(lb, dt)) + ' = ' + mono(lt.div(lb), 1) + '$, which tends to $' + infT(s) + '$ as $x \\to ' + (dir < 0 ? '-' : '') + '\\infty$.';
    }
    if (kind === 'ha') {
      return {
        q: 'Find the horizontal asymptote of $f(x) = ' + dfrac(Pt.tex(), Pb.tex()) + '$. Give the number $b$ in $y = b$.',
        a: ans, steps: stp.concat([last, 'So $f(x) \\to ' + tx(lt.div(lb)) + '$ as $x \\to \\pm\\infty$, and the horizontal asymptote is $y = ' + tx(lt.div(lb)) + '$.']),
        hint: 'Compare the leading terms of the top and bottom.', chk: { k: 'lim', f: f, a: 'inf' }
      };
    }
    return {
      q: 'Find $' + limInf(dir) + ' ' + dfrac(Pt.tex(), Pb.tex()) + '$.' + (kind === 'high' ? ' Answer ∞ or −∞ if the values grow without bound.' : ''),
      a: ans, steps: stp.concat([last]),
      hint: 'Compare the highest powers of x on the top and bottom.', chk: { k: 'lim', f: f, a: dir > 0 ? 'inf' : '-inf' }
    };
  });

  G('calc1.epsilon-delta', function (R, ctx) {
    var kind = lv(ctx, R.pick(['delta', 'delta', 'def']), R.pick(['delta', 'eps', 'def']), R.pick(['which', 'eps', 'delta']));
    var m = R.pick([2, 3, 4, 5, -2, -3, -4]), b = R.int(-6, 6), a = R.int(-3, 5), L = m * a + b, am = abs(m);
    var fT = linT(m, b), eps = q(R.pick(['0.1', '0.06', '0.03', '0.2', '0.12', '0.01', '0.3', '0.24']));
    if (kind === 'delta') {
      var d = eps.div(am);
      return {
        q: 'Let $f(x) = ' + fT + '$, so $' + lim(a) + ' f(x) = ' + L + '$. For $\\varepsilon = ' + dec(eps) + '$, find the largest $\\delta$ such that $0 < \\lvert ' + xm(a) + ' \\rvert < \\delta$ guarantees $\\lvert f(x)' + sg(-L) + ' \\rvert < ' + dec(eps) + '$.',
        a: numD(d),
        steps: ['Simplify the distance to $L$: $\\lvert (' + fT + ')' + sg(-L) + ' \\rvert = \\lvert ' + T.coef(m, 'x') + sg(b - L) + ' \\rvert = ' + am + '\\lvert ' + xm(a) + ' \\rvert$.',
          'We need $' + am + '\\lvert ' + xm(a) + ' \\rvert < ' + dec(eps) + '$, that is, $\\lvert ' + xm(a) + ' \\rvert < ' + frac(dec(eps), am) + ' = ' + decf(d) + '$.',
          'So $\\delta = ' + decf(d) + '$ works, and any larger $\\delta$ would let $\\lvert f(x)' + sg(-L) + ' \\rvert$ reach $' + dec(eps) + '$. The largest is $\\delta = ' + decf(d) + '$.'],
        hint: 'Write |f(x) − L| as a constant times |x − a|.', chk: { k: 'val', v: d.toNumber(), ed: { m: m, eps: eps.toNumber() } }
      };
    }
    if (kind === 'eps') {
      var dl = q(R.pick(['0.01', '0.02', '0.05', '0.1', '0.03'])), e2 = dl.mul(am);
      return {
        q: 'Let $f(x) = ' + fT + '$, so $' + lim(a) + ' f(x) = ' + L + '$. If $0 < \\lvert ' + xm(a) + ' \\rvert < ' + dec(dl) + '$, then $\\lvert f(x)' + sg(-L) + ' \\rvert < \\varepsilon$. What is the smallest $\\varepsilon$ this guarantees?',
        a: numD(e2),
        steps: ['$\\lvert f(x)' + sg(-L) + ' \\rvert = \\lvert ' + T.coef(m, 'x') + sg(b - L) + ' \\rvert = ' + am + '\\lvert ' + xm(a) + ' \\rvert$.',
          'If $\\lvert ' + xm(a) + ' \\rvert < ' + dec(dl) + '$, then $' + am + '\\lvert ' + xm(a) + ' \\rvert < ' + am + ' \\cdot ' + dec(dl) + ' = ' + dec(e2) + '$.',
          'So $\\varepsilon = ' + dec(e2) + '$. The slope ' + am + ' stretches every distance along the $x$-axis by a factor of ' + am + '.'],
        hint: 'How much does f stretch distances?', chk: { k: 'val', v: e2.toNumber() }
      };
    }
    if (kind === 'def') {
      var good = 'For every $\\varepsilon > 0$ there is a $\\delta > 0$ such that if $0 < \\lvert x - a \\rvert < \\delta$, then $\\lvert f(x) - L \\rvert < \\varepsilon$.';
      return {
        q: 'Which statement is the precise definition of $\\lim_{x \\to a} f(x) = L$?',
        a: mc(good, ['There is a $\\delta > 0$ such that for every $\\varepsilon > 0$, if $0 < \\lvert x - a \\rvert < \\delta$, then $\\lvert f(x) - L \\rvert < \\varepsilon$.',
          'For every $\\delta > 0$ there is an $\\varepsilon > 0$ such that if $0 < \\lvert x - a \\rvert < \\delta$, then $\\lvert f(x) - L \\rvert < \\varepsilon$.',
          'For every $\\varepsilon > 0$ there is a $\\delta > 0$ such that if $\\lvert f(x) - L \\rvert < \\varepsilon$, then $0 < \\lvert x - a \\rvert < \\delta$.']),
        steps: ['The challenge comes first: someone names any tolerance $\\varepsilon$, as small as they like.', 'Then you answer with a $\\delta$ (which may depend on $\\varepsilon$).',
          'The promise: every $x$ within $\\delta$ of $a$ (other than $a$ itself) gives $f(x)$ within $\\varepsilon$ of $L$.', 'Swapping the order ("there is a δ for every ε") would demand one δ that works for all ε at once, which is far too strong.'],
        hint: 'Who moves first: the tolerance ε, or your δ?', chk: { k: 'mc' }
      };
    }
    // select all deltas that work
    var dmax = eps.div(am), opts = [dmax, dmax.div(2), dmax.mul(2), eps.mul(am)];
    return {
      q: 'For $' + lim(a) + ' (' + fT + ') = ' + L + '$ and $\\varepsilon = ' + dec(eps) + '$, which values of $\\delta$ work? (Select all that apply.)',
      a: { t: 'mc', choices: opts.map(function (v) { return '$\\delta = ' + decf(v) + '$'; }), v: [0, 1] },
      steps: ['$\\lvert f(x)' + sg(-L) + ' \\rvert = ' + am + '\\lvert ' + xm(a) + ' \\rvert$, so we need $\\lvert ' + xm(a) + ' \\rvert < ' + frac(dec(eps), am) + ' = ' + decf(dmax) + '$.',
        'Any $\\delta$ with $0 < \\delta \\le ' + decf(dmax) + '$ works: $' + decf(dmax) + '$ and $' + decf(dmax.div(2)) + '$.',
        'A larger $\\delta$ ($' + decf(dmax.mul(2)) + '$ or $' + dec(eps.mul(am)) + '$) lets in some $x$ with $\\lvert f(x)' + sg(-L) + ' \\rvert \\ge ' + dec(eps) + '$. Once a $\\delta$ works, every smaller one works too.'],
      hint: 'Find the largest δ that works; then every smaller positive δ works as well.', chk: { k: 'mc' }
    };
  });


  // ================================================================== UNIT 2: THE DERIVATIVE
  function aph(a, h) { h = h || 'h'; return a === 0 ? h : tx(a) + ' + ' + h; }        // "3 + h"
  // the polynomial with x replaced by a TeX expression s (in parentheses): 2(3 + h)^{2} - 5(3 + h) + 1
  function subExpr(p, s) {
    var terms = [];
    for (var k = p.c.length - 1; k >= 0; k--) { var c = p.c[k]; if (c.isZero()) continue; terms.push([c, k === 0 ? '' : '(' + s + ')' + (k > 1 ? '^{' + k + '}' : '')]); }
    return T.terms(terms);
  }
  // f(a + h) for a polynomial f, as a polynomial in h (exact Taylor shift)
  function shift(p, a) { var r = P([0]), base = P([1]); for (var k = 0; k < p.c.length; k++) { r = r.add(base.scale(p.c[k])); base = base.mul(P([a, 1])); } return r; }

  G('calc1.instantaneous-rate', function (R, ctx) {
    var kind = lv(ctx, R.pick(['avg', 'ball']), R.pick(['ball', 'avgh', 'avg']), R.pick(['avgh', 'ball', 'est']));
    if (kind === 'avg') {
      var f = P([R.int(-5, 5), R.int(-4, 4), R.nz(-3, 3)]), a = R.int(-3, 2), b = a + R.int(1, 4), fa = f.at(a), fb = f.at(b), m = fb.sub(fa).div(b - a);
      return {
        q: 'Find the average rate of change of $f(x) = ' + f.tex() + '$ from $x = ' + a + '$ to $x = ' + b + '$.',
        a: num(m),
        steps: ['Average rate of change $= ' + frac('f(' + b + ') - f(' + a + ')', b + ' - ' + tp(a)) + '$: the slope of the secant line through the two points.',
          '$f(' + b + ') = ' + f.subT(b) + ' = ' + tx(fb) + '$ and $f(' + a + ') = ' + f.subT(a) + ' = ' + tx(fa) + '$.',
          'So the rate is $' + frac(tx(fb) + ' - ' + tp(fa), b - a) + ' = ' + tx(m) + '$.'],
        hint: 'Change in f divided by change in x.', chk: { k: 'val', v: (f.at(b).toNumber() - f.at(a).toNumber()) / (b - a) }
      };
    }
    if (kind === 'ball') {
      var v0 = R.pick([48, 64, 80, 96, 32]), h0 = R.pick([0, 6, 10, 20, 50]), t1 = R.int(1, 2), s = P([h0, v0, -16]);
      var av = function (h) { return s.at(q(t1).add(h)).sub(s.at(t1)).div(h); };
      var inst = q(v0 - 32 * t1);
      return {
        q: 'A ball is thrown upward. Its height after $t$ seconds is $s(t) = ' + s.tex('t') + '$ feet. Find its average velocity over each time interval, then use the pattern to find its velocity at $t = ' + t1 + '$.',
        a: multi([['over $[' + t1 + ', ' + dec(q(t1).add('0.1')) + ']$: ', numD(av(q('0.1')))], ['over $[' + t1 + ', ' + dec(q(t1).add('0.01')) + ']$: ', numD(av(q('0.01')))], ['velocity at $t = ' + t1 + '$: ', num(inst)]]),
        steps: ['Average velocity $= ' + frac('s(' + t1 + ' + h) - s(' + t1 + ')', 'h') + '$. Here $s(' + t1 + ') = ' + tx(s.at(t1)) + '$.',
          'For $h = 0.1$: $' + frac(dec(s.at(q(t1).add('0.1'))) + ' - ' + tx(s.at(t1)), '0.1') + ' = ' + dec(av(q('0.1'))) + '$ ft/s.',
          'For $h = 0.01$: $' + frac(dec(s.at(q(t1).add('0.01'))) + ' - ' + tx(s.at(t1)), '0.01') + ' = ' + dec(av(q('0.01'))) + '$ ft/s.',
          'Each time $h$ shrinks by a factor of 10, the average changes by less, and it closes in on $' + tx(inst) + '$. (Algebra confirms it: the average over $[' + t1 + ', ' + t1 + ' + h]$ is $' + tx(inst) + ' - 16h$.)',
          'So the velocity at $t = ' + t1 + '$ is $' + tx(inst) + '$ ft/s' + (inst.sign() < 0 ? ': the ball is already coming down.' : inst.isZero() ? ': the ball is at the top for an instant.' : ': the ball is still rising.')],
        hint: 'Average velocity is change in height over change in time.',
        chk: [{ k: 'val', v: (s.at(t1 + 0.1).toNumber() - s.at(t1).toNumber()) / 0.1, tol: 1e-9 }, { k: 'val', v: (s.at(t1 + 0.01).toNumber() - s.at(t1).toNumber()) / 0.01 }, { k: 'dat', f: s.plain(), x: t1 }]
      };
    }
    if (kind === 'avgh') {
      var p = R.nz(-3, 3), qq = R.int(-5, 5), r = R.int(-6, 6), f2 = P([r, qq, p]), a2 = R.intNot(-3, 4, 0), sh = shift(f2, a2), dq = P([sh.c[1] || 0, sh.c[2] || 0]);
      return {
        q: 'Let $f(x) = ' + f2.tex() + '$. Write the average rate of change of $f$ over $[' + a2 + ', ' + aph(a2) + ']$ as a simplified expression in $h$.',
        a: expr(dq.plain('h'), ['h'], { form: 'simplified' }),
        steps: ['The average rate is $' + frac('f(' + aph(a2) + ') - f(' + a2 + ')', 'h') + '$.',
          '$f(' + aph(a2) + ') = ' + subExpr(f2, aph(a2)) + ' = ' + sh.tex('h') + '$.',
          'Subtract $f(' + a2 + ') = ' + tx(f2.at(a2)) + '$: the top is $' + P([0].concat(sh.c.slice(1))).tex('h') + '$.',
          'Divide by $h$: $' + dq.tex('h') + '$. As $h \\to 0$ this tends to $' + tx(dq.c[0]) + '$, the instantaneous rate at $x = ' + a2 + '$.'],
        hint: 'Expand f(' + aph(a2) + '), subtract f(' + a2 + '), then divide every term by h.',
        chk: { k: 'dq', f: f2.plain(), a: a2 }
      };
    }
    var c = R.pick([1, 2, -1]), a3 = R.int(1, 3), cube = P([0, 0, 0, c]);
    var rows = ['0.1', '0.01', '0.001'].map(function (h) { return cube.at(q(a3).add(h)).sub(cube.at(a3)).div(q(h)); });
    var inst3 = q(3 * c * a3 * a3);
    return {
      q: 'For $f(x) = ' + cube.tex() + '$, the average rate of change over $[' + a3 + ', ' + a3 + ' + h]$ is shown for smaller and smaller $h$. $$' + table(null, [['h', '0.1', '0.01', '0.001'], ['\\text{average rate}'].concat(rows.map(dec))]) + '$$ What is the instantaneous rate of change at $x = ' + a3 + '$?',
      a: num(inst3),
      steps: ['As $h$ shrinks, the averages ' + rows.map(dec).join(', ') + ' settle down.', 'They are approaching $' + tx(inst3) + '$: each new row adds another digit that agrees.',
        'Algebra confirms it: the average is $' + T.terms([[3 * c * a3 * a3, ''], [3 * c * a3, 'h'], [c, 'h^{2}']]) + '$, which tends to $' + tx(inst3) + '$ as $h \\to 0$.'],
      hint: 'Which number are the averages closing in on?', chk: { k: 'dat', f: cube.plain(), x: a3 }
    };
  });

  G('calc1.derivative-at-a-point', function (R, ctx) {
    var kind = lv(ctx, 'quad', R.pick(['quad', 'quad', 'recip']), R.pick(['recip', 'cube', 'sqrt', 'quad']));
    if (kind === 'quad' || kind === 'cube') {
      var f = kind === 'quad' ? P([R.int(-6, 6), R.int(-5, 5), lv(ctx, R.pick([1, -1, 2]), R.nz(-3, 3), R.nz(-4, 4))]) : P([R.int(-4, 4), R.int(-3, 3), 0, R.pick([1, 2, -1])]);
      var a = R.intNot(-3, 4, 0), sh = shift(f, a), top = P([0].concat(sh.c.slice(1))), dq = P(sh.c.slice(1)), d = dq.c[0];
      return {
        q: 'Let $f(x) = ' + f.tex() + '$. Use the limit definition $f\'(' + a + ') = \\displaystyle\\lim_{h \\to 0} ' + frac('f(' + aph(a) + ') - f(' + a + ')', 'h') + '$. First simplify the difference quotient, then find $f\'(' + a + ')$.',
        a: multi([['$' + frac('f(' + aph(a) + ') - f(' + a + ')', 'h') + ' =$', expr(dq.plain('h'), ['h'], { form: 'simplified' })], ['$f\'(' + a + ') =$', num(d)]]),
        steps: ['$f(' + aph(a) + ') = ' + subExpr(f, aph(a)) + '$.', 'Expand carefully (every $x$ becomes $' + aph(a) + '$, not just one of them): $f(' + aph(a) + ') = ' + sh.tex('h') + '$.',
          '$f(' + a + ') = ' + tx(f.at(a)) + '$, so $f(' + aph(a) + ') - f(' + a + ') = ' + top.tex('h') + '$. Every term has a factor $h$.',
          'Divide by $h$: $' + frac('f(' + aph(a) + ') - f(' + a + ')', 'h') + ' = ' + dq.tex('h') + '$ (for $h \\ne 0$).',
          'Now let $h \\to 0$: $f\'(' + a + ') = ' + tx(d) + '$. This is the slope of the tangent line at $x = ' + a + '$.'],
        hint: 'Expand f(' + aph(a) + ') completely before subtracting f(' + a + '). Do not set h = 0 until the h in the denominator is gone.',
        chk: [{ k: 'dq', f: f.plain(), a: a }, { k: 'dat', f: f.plain(), x: a }]
      };
    }
    if (kind === 'recip') {
      var k = R.nz(-6, 6), a2 = R.intNot(-4, 4, 0), ans = q(-k).div(a2 * a2);
      return {
        q: 'Let $f(x) = ' + frac(k, 'x') + '$. Use the limit definition of the derivative to find $f\'(' + a2 + ')$.',
        a: num(ans),
        steps: ['$f(' + a2 + ') = ' + tx(q(k).div(a2)) + '$, so $f\'(' + a2 + ') = \\displaystyle\\lim_{h \\to 0} ' + frac(frac(k, aph(a2)) + ' - ' + tp(q(k).div(a2)), 'h') + '$.',
          'Combine the top over the common denominator $' + tp(a2) + '(' + aph(a2) + ')$: the numerator is $' + tx(k) + ' \\cdot ' + tp(a2) + ' - ' + tp(k) + '(' + aph(a2) + ') = ' + T.coef(-k, 'h') + '$. So the top is $' + frac(T.coef(-k, 'h'), tp(a2) + '(' + aph(a2) + ')') + '$.',
          'Divide by $h$: the difference quotient is $' + frac(-k, tp(a2) + '(' + aph(a2) + ')') + '$.',
          'Let $h \\to 0$: $f\'(' + a2 + ') = ' + frac(-k, tp(a2) + '^{2}') + ' = ' + tx(ans) + '$.'],
        hint: 'Combine the two fractions on top into one fraction before dividing by h.',
        chk: { k: 'dat', f: k + '/x', x: a2 }
      };
    }
    var c = R.int(1, 5), a3 = c * c, ans3 = q(1).div(2 * c);
    return {
      q: 'Let $f(x) = \\sqrt{x}$. Use the limit definition of the derivative to find $f\'(' + a3 + ')$.',
      a: num(ans3),
      steps: ['$f\'(' + a3 + ') = \\displaystyle\\lim_{h \\to 0} ' + frac('\\sqrt{' + a3 + ' + h} - ' + c, 'h') + '$, since $\\sqrt{' + a3 + '} = ' + c + '$.',
        'Multiply top and bottom by the conjugate $\\sqrt{' + a3 + ' + h} + ' + c + '$: the top becomes $(' + a3 + ' + h) - ' + a3 + ' = h$.',
        'Cancel $h$: the quotient is $' + frac(1, '\\sqrt{' + a3 + ' + h} + ' + c) + '$.',
        'Let $h \\to 0$: $f\'(' + a3 + ') = ' + frac(1, c + ' + ' + c) + ' = ' + tx(ans3) + '$.'],
      hint: 'Rationalize the numerator with the conjugate.',
      chk: { k: 'dat', f: 'sqrt(x)', x: a3 }
    };
  });

  G('calc1.tangent-lines', function (R, ctx) {
    var kind = lv(ctx, R.pick(['given', 'quad']), R.pick(['quad', 'given', 'quad']), R.pick(['recip', 'quad', 'cube']));
    var a = R.intNot(-3, 4, 0), f, fa, m, fplain, pre;
    if (kind === 'given') {
      fa = q(R.int(-6, 8)); m = q(R.nz(-5, 5));
      var line = P([fa.sub(m.mul(a)), m]);
      return {
        q: 'A function $f$ has $f(' + a + ') = ' + tx(fa) + '$ and $f\'(' + a + ') = ' + tx(m) + '$. Write the equation of the tangent line at $x = ' + a + '$ in the form $y = mx + b$.',
        a: expr(line.plain()),
        steps: ['The tangent line passes through $(' + a + ', ' + tx(fa) + ')$ with slope $f\'(' + a + ') = ' + tx(m) + '$.',
          'Point-slope form: $y' + sg(fa.neg()) + ' = ' + tx(m) + '(' + xm(a) + ')$.',
          'Solve for $y$: $y = ' + line.tex() + '$.'],
        hint: 'Use point-slope form with the point (a, f(a)) and slope f′(a).',
        chk: { k: 'fn', test: function (spec) { var g = function (x) { return ML.evalPlain(spec.v, { x: x }); }; return Math.abs(g(a) - fa.toNumber()) < 1e-9 && Math.abs(g(a + 1) - g(a) - m.toNumber()) < 1e-9 ? true : 'line wrong'; } }
      };
    }
    if (kind === 'quad' || kind === 'cube') {
      f = kind === 'quad' ? P([R.int(-5, 5), R.int(-4, 4), R.nz(-2, 2)]) : P([R.int(-4, 4), R.int(-2, 2), 0, R.pick([1, -1])]);
      fa = f.at(a); m = f.d().at(a); fplain = f.plain();
      var sh = shift(f, a), dq = P(sh.c.slice(1));
      pre = ['Find the slope with the limit definition: $' + frac('f(' + aph(a) + ') - f(' + a + ')', 'h') + ' = ' + dq.tex('h') + '$, which tends to $' + tx(m) + '$. So $f\'(' + a + ') = ' + tx(m) + '$.'];
    } else {
      var k = R.nz(-6, 6); f = null; fa = q(k).div(a); m = q(-k).div(a * a); fplain = k + '/x';
      pre = ['From the limit definition, $f\'(' + a + ') = ' + frac(-k, tp(a) + '^{2}') + ' = ' + tx(m) + '$ (the difference quotient simplifies to $' + frac(-k, tp(a) + '(' + aph(a) + ')') + '$).'];
    }
    var ln = P([fa.sub(m.mul(a)), m]), fT = f ? f.tex() : frac(k, 'x');
    return {
      q: 'Find the equation of the line tangent to $f(x) = ' + fT + '$ at $x = ' + a + '$. Write it as $y = mx + b$.',
      a: expr(ln.plain()),
      steps: ['The point of tangency: $f(' + a + ') = ' + tx(fa) + '$, so the line passes through $(' + a + ', ' + tx(fa) + ')$.'].concat(pre, [
        'Use the number $f\'(' + a + ') = ' + tx(m) + '$ as the slope (not a formula with $x$ in it).',
        '$y' + sg(fa.neg()) + ' = ' + tx(m) + '(' + xm(a) + ')$, so $y = ' + ln.tex() + '$.']),
      hint: 'You need a point, (a, f(a)), and a slope, the number f′(a).',
      chk: { k: 'tan', f: fplain, a: a }
    };
  });

  G('calc1.derivative-function', function (R, ctx) {
    var kind = lv(ctx, R.pick(['def', 'table']), R.pick(['def', 'sign', 'table', 'recip']), R.pick(['recip', 'sign', 'sqrt', 'def']));
    if (kind === 'def') {
      var p = R.nz(-4, 4), qq = R.int(-6, 6), r = R.int(-6, 6), f = P([r, qq, p]), d = f.d();
      return {
        q: 'Use the limit definition $f\'(x) = \\displaystyle\\lim_{h \\to 0} ' + frac('f(x + h) - f(x)', 'h') + '$ to find $f\'(x)$ for $f(x) = ' + f.tex() + '$.',
        a: expr(d.plain()),
        steps: ['$f(x + h) = ' + subExpr(f, 'x + h') + ' = ' + T.terms([[p, 'x^{2}'], [2 * p, 'xh'], [p, 'h^{2}'], [qq, 'x'], [qq, 'h'], [r, '']]) + '$.',
          'Subtract $f(x)$: the $' + T.coef(p, 'x^{2}') + '$' + (qq ? ', $' + T.coef(qq, 'x') + '$' : '') + (r ? ' and $' + r + '$' : '') + ' cancel, leaving $' + T.terms([[2 * p, 'xh'], [p, 'h^{2}'], [qq, 'h']]) + '$.',
          'Divide by $h$: $' + T.terms([[2 * p, 'x'], [p, 'h'], [qq, '']]) + '$.',
          'Let $h \\to 0$: $f\'(x) = ' + d.tex() + '$. This one formula gives the slope at every $x$.'],
        hint: 'Work with a general x: expand f(x + h), subtract f(x), divide by h, then let h → 0.',
        chk: { k: 'd', f: f.plain() }
      };
    }
    if (kind === 'recip') {
      var k = R.nz(-6, 6), c = R.int(-4, 4), den = xm(-c), ans = cl(-k + '/(' + xmP(-c) + ')^2');
      return {
        q: 'Use the limit definition of the derivative to find $f\'(x)$ for $f(x) = ' + frac(k, den) + '$.',
        a: expr(ans),
        steps: ['$f(x + h) - f(x) = ' + frac(k, den.replace('x', 'x + h')) + ' - ' + frac(k, den) + ' = ' + frac(k + '(' + den + ') - ' + tp(k) + '(' + den.replace('x', 'x + h') + ')', '(' + den.replace('x', 'x + h') + ')(' + den + ')') + ' = ' + frac(T.coef(-k, 'h'), '(' + den.replace('x', 'x + h') + ')(' + den + ')') + '$.',
          'Divide by $h$: $' + frac(-k, '(' + den.replace('x', 'x + h') + ')(' + den + ')') + '$.',
          'Let $h \\to 0$: $f\'(x) = ' + frac(-k, '(' + den + ')^{2}') + '$.'],
        hint: 'Combine the fractions in the numerator over a common denominator.',
        chk: { k: 'd', f: k + '/(' + xmP(-c) + ')' }
      };
    }
    if (kind === 'sqrt') {
      var c2 = R.int(-5, 5), inT = xm(-c2), ans2 = '1/(2*sqrt(' + xmP(-c2) + '))';
      return {
        q: 'Use the limit definition of the derivative to find $f\'(x)$ for $f(x) = \\sqrt{' + inT + '}$.',
        a: expr(ans2),
        steps: ['The quotient is $' + frac('\\sqrt{' + inT.replace('x', 'x + h') + '} - \\sqrt{' + inT + '}', 'h') + '$.',
          'Multiply top and bottom by $\\sqrt{' + inT.replace('x', 'x + h') + '} + \\sqrt{' + inT + '}$: the top becomes $(' + inT.replace('x', 'x + h') + ') - (' + inT + ') = h$.',
          'Cancel $h$: $' + frac(1, '\\sqrt{' + inT.replace('x', 'x + h') + '} + \\sqrt{' + inT + '}') + '$.',
          'Let $h \\to 0$: $f\'(x) = ' + frac(1, '2\\sqrt{' + inT + '}') + '$.'],
        hint: 'Rationalize the numerator with the conjugate.',
        chk: { k: 'd', f: 'sqrt(' + xmP(-c2) + ')' }
      };
    }
    if (kind === 'sign') {
      var p1 = R.int(-5, 1), p2 = p1 + R.int(2, 5), up = R.coin(), wantPos = R.coin();
      var desc = up ? 'increasing on $(-\\infty, ' + p1 + ')$, decreasing on $(' + p1 + ', ' + p2 + ')$ and increasing on $(' + p2 + ', \\infty)$' : 'decreasing on $(-\\infty, ' + p1 + ')$, increasing on $(' + p1 + ', ' + p2 + ')$ and decreasing on $(' + p2 + ', \\infty)$';
      var mid = '(' + p1 + ', ' + p2 + ')', outer = '(-inf, ' + p1 + ') U (' + p2 + ', inf)';
      var ansI = (up === wantPos) ? outer : mid;
      return {
        q: 'The graph of $f$ is smooth and ' + desc + ', with horizontal tangents at $x = ' + p1 + '$ and $x = ' + p2 + '$. On what intervals is $f\'(x) ' + (wantPos ? '> 0' : '< 0') + '$? Answer in interval notation.',
        a: { t: 'interval', v: ansI },
        steps: ['$f\'(x)$ is the slope of the tangent line at $x$.', 'Where $f$ is increasing, its tangent lines slope up, so $f\' > 0$. Where $f$ is decreasing, $f\' < 0$.',
          'At the turning points $x = ' + p1 + '$ and $x = ' + p2 + '$ the tangent is horizontal, so $f\' = 0$ there.',
          'So $f\'(x) ' + (wantPos ? '> 0' : '< 0') + '$ on ' + (ansI === mid ? '$' + mid + '$' : '$(-\\infty, ' + p1 + ') \\cup (' + p2 + ', \\infty)$') + '.'],
        hint: 'f′ is positive exactly where f is going up.', chk: { k: 'mc' }
      };
    }
    // estimate from a table with a symmetric difference
    var t0 = R.int(2, 6), dt = R.pick([1, 2]), base = R.int(50, 70), sl = R.pick([-3, -2, 2, 3, 4, 5]), cv = R.pick([0, 1, -1]);
    var T_ = function (t) { return base + sl * (t - t0) + cv * (t - t0) * (t - t0); };
    var ts = [t0 - 2 * dt, t0 - dt, t0, t0 + dt, t0 + 2 * dt], est = q(T_(t0 + dt) - T_(t0 - dt)).div(2 * dt);
    return {
      q: 'The temperature $T$ (in °F) of a cup of cider $t$ minutes after it was set on a stove is recorded: $$' + table(null, [['t'].concat(ts.map(String)), ['T(t)'].concat(ts.map(function (t) { return String(T_(t)); }))]) + '$$ Estimate $T\'(' + t0 + ')$ using the two readings on either side of $t = ' + t0 + '$.',
      a: num(est), unit: '°F per minute',
      steps: ['$T\'(' + t0 + ')$ is a slope, so estimate it with a secant line that straddles $t = ' + t0 + '$: use $t = ' + (t0 - dt) + '$ and $t = ' + (t0 + dt) + '$.',
        '$T\'(' + t0 + ') \\approx ' + frac('T(' + (t0 + dt) + ') - T(' + (t0 - dt) + ')', (t0 + dt) + ' - ' + (t0 - dt)) + ' = ' + frac(T_(t0 + dt) + ' - ' + T_(t0 - dt), 2 * dt) + ' = ' + tx(est) + '$ °F per minute.',
        'A symmetric (centered) secant usually beats a one-sided one, because its errors on the two sides partly cancel.'],
      hint: 'Use the slope between the readings just before and just after t = ' + t0 + '.',
      chk: { k: 'val', v: (T_(t0 + dt) - T_(t0 - dt)) / (2 * dt) }
    };
  });

  G('calc1.differentiability', function (R, ctx) {
    var kind = lv(ctx, R.pick(['abs', 'class']), R.pick(['class', 'abs2', 'class']), R.pick(['match', 'class', 'abs2']));
    if (kind === 'abs' || kind === 'abs2') {
      if (kind === 'abs') {
        var a = R.int(-5, 5), c = R.nz(-4, 4), d = R.int(-5, 5), lin = R.int(-3, 3);
        var fT = (abs(c) === 1 ? (c < 0 ? '-' : '') : c) + '\\lvert ' + xm(a) + ' \\rvert' + T.coef(lin, 'x', false) + sg(d);
        return {
          q: 'Where is $f(x) = ' + fT + '$ not differentiable? List every such $x$.',
          a: { t: 'set', v: [String(a)] },
          steps: ['Away from $x = ' + a + '$, $\\lvert ' + xm(a) + ' \\rvert$ is just $' + xm(a) + '$ or $-(' + xm(a) + ')$, a line, so $f$ is a polynomial piece and differentiable.',
            'At $x = ' + a + '$ the slope jumps from $' + (lin - c) + '$ (left) to $' + (lin + c) + '$ (right).',
            'The graph has a corner there: the left and right slopes disagree, so $f\'(' + a + ')$ does not exist. $f$ is still continuous at $x = ' + a + '$.'],
          hint: 'Look for a corner where the expression inside the absolute value changes sign.',
          chk: { k: 'set', test: function (vs) { return vs.length === 1 && vs[0] === a ? true : 'wrong corner'; } }
        };
      }
      var n = R.int(1, 4);
      return {
        q: 'Where is $f(x) = \\lvert x^{2} - ' + (n * n) + ' \\rvert$ not differentiable? List every such $x$.',
        a: { t: 'set', v: [String(n), String(-n)] },
        steps: ['$x^{2} - ' + (n * n) + '$ changes sign at $x = \\pm ' + n + '$. There the absolute value flips the graph over, making a corner.',
          'For example, at $x = ' + n + '$ the slope from the right is $2(' + n + ') = ' + (2 * n) + '$ and from the left it is $-' + (2 * n) + '$.',
          'Between and beyond those points $f$ is a polynomial, so it is differentiable there. Answer: $x = ' + n + '$ and $x = ' + (-n) + '$.'],
        hint: 'Corners appear where the inside of the absolute value crosses 0.',
        chk: { k: 'set', test: function (vs) { return vs.length === 2 && vs.indexOf(n) >= 0 && vs.indexOf(-n) >= 0 ? true : 'wrong'; } }
      };
    }
    if (kind === 'class') {
      var a2 = R.int(-3, 3), t = R.pick(['corner', 'cusp', 'vert', 'jump', 'smooth']), ft;
      var C = ['Differentiable at that point', 'Continuous, but not differentiable: a corner', 'Continuous, but not differentiable: a cusp', 'Continuous, but not differentiable: a vertical tangent', 'Not continuous, so not differentiable'];
      var ix = { smooth: 0, corner: 1, cusp: 2, vert: 3, jump: 4 }[t], st;
      var xa = a2 === 0 ? 'x' : '(' + xm(a2) + ')';
      if (t === 'corner') { ft = '\\lvert ' + xm(a2) + ' \\rvert'; st = ['The slope is $-1$ just left of $x = ' + a2 + '$ and $1$ just right of it.', 'Different one-sided slopes make a corner: continuous, not differentiable.']; }
      else if (t === 'cusp') { ft = xa + '^{2/3}'; st = ['$f\'(x) = ' + frac(2, '3(' + xm(a2) + ')^{1/3}') + '$, which tends to $-\\infty$ from the left and $+\\infty$ from the right.', 'The two sides come in steeply from opposite directions to a sharp point: a cusp. Continuous, not differentiable.']; }
      else if (t === 'vert') { ft = xa + '^{1/3}'; st = ['$f\'(x) = ' + frac(1, '3(' + xm(a2) + ')^{2/3}') + '$, which tends to $+\\infty$ from both sides.', 'The tangent line stands straight up: a vertical tangent. Its slope is not a number, so $f$ is not differentiable there (but it is continuous).']; }
      else if (t === 'jump') { var c1 = R.int(-3, 3), c2 = c1 + R.nz(-3, 3); ft = '\\begin{cases} ' + linT(1, c1 - a2) + ' & x < ' + a2 + ' \\\\ ' + linT(1, c2 - a2) + ' & x \\ge ' + a2 + ' \\end{cases}'; st = ['The left limit is $' + c1 + '$ and the right limit is $' + c2 + '$: a jump.', 'A function must be continuous to be differentiable, so it is not differentiable at $x = ' + a2 + '$, even though both pieces have slope 1.']; }
      else { ft = (a2 === 0 ? 'x' : '(' + xm(a2) + ')') + '\\lvert ' + xm(a2) + ' \\rvert'; st = ['To the right, $f(x) = (' + xm(a2) + ')^{2}$; to the left, $f(x) = -(' + xm(a2) + ')^{2}$.', 'Both pieces have slope $0$ at $x = ' + a2 + '$, so the one-sided slopes agree: $f\'(' + a2 + ') = 0$. It is differentiable (the absolute value does not always make a corner).']; }
      return {
        q: 'Describe $f(x) = ' + ft + '$ at $x = ' + a2 + '$.',
        a: { t: 'mc', choices: C, v: ix, keep: true },
        steps: st, hint: 'Check continuity first, then compare the slopes from the left and the right.', chk: { k: 'mc' }
      };
    }
    var a3 = R.int(-3, 3), c3 = R.int(-5, 5), m = 2 * a3, b = c3 - a3 * a3;
    return {
      q: 'Find $m$ and $b$ so that $f(x) = ' + cases([['x^{2}' + sg(c3), 'x \\le ' + a3], ['mx + b', 'x > ' + a3]]) + '$ is differentiable at $x = ' + a3 + '$.',
      a: multi([['$m =$', num(m)], ['$b =$', num(b)]]),
      steps: ['Differentiable means the slopes must match: the left piece has slope $2x$, which is $' + m + '$ at $x = ' + a3 + '$. So $m = ' + m + '$.',
        'It must also be continuous: the left piece gives $f(' + a3 + ') = ' + (a3 * a3 + c3) + '$, so $' + (m === 0 ? 'b' : m + '(' + a3 + ') + b') + ' = ' + (a3 * a3 + c3) + '$.',
        'Solve: $b = ' + (a3 * a3 + c3) + ' - ' + tp(m * a3) + ' = ' + b + '$. The line $y = ' + linT(m, b) + '$ is the tangent line to the parabola at $x = ' + a3 + '$.'],
      hint: 'Match the values and the slopes of the two pieces at x = ' + a3 + '.',
      chk: [{ k: 'val', v: 2 * a3 }, { k: 'fn', test: function (spec) { var bb = ML.evalPlain(spec.v); return Math.abs(m * a3 + bb - (a3 * a3 + c3)) < 1e-9 ? true : 'not continuous'; } }]
    };
  });

  var CTX = [
    { f: 'V', x: 't', intro: 'Let $V(t)$ be the volume of water in a tank, in liters, $t$ minutes after a valve opens.', what: 'the volume of water', yu: 'liters', yu1: 'liter', xu: 'minute', xus: 'minutes' },
    { f: 'C', x: 'q', intro: 'Let $C(q)$ be the cost, in dollars, of printing $q$ shirts.', what: 'the cost', yu: 'dollars', yu1: 'dollar', xu: 'shirt', xus: 'shirts' },
    { f: 'h', x: 't', intro: 'Let $h(t)$ be the height of a sunflower, in centimeters, $t$ days after planting.', what: 'the height', yu: 'centimeters', yu1: 'centimeter', xu: 'day', xus: 'days' },
    { f: 'P', x: 't', intro: 'Let $P(t)$ be the population of a town, in people, $t$ years after 2020.', what: 'the population', yu: 'people', yu1: 'person', xu: 'year', xus: 'years' },
    { f: 'T', x: 'd', intro: 'Let $T(d)$ be the temperature of a lake, in degrees Celsius, at a depth of $d$ meters.', what: 'the temperature', yu: 'degrees Celsius', yu1: 'degree Celsius', xu: 'meter', xus: 'meters' },
    { f: 'N', x: 'p', intro: 'Let $N(p)$ be the number of concert tickets sold when a ticket costs $p$ dollars.', what: 'the number of tickets sold', yu: 'tickets', yu1: 'ticket', xu: 'dollar', xus: 'dollars' },
    { f: 'B', x: 't', intro: 'Let $B(t)$ be the charge left in a phone battery, in percent, $t$ hours after it was unplugged.', what: 'the charge', yu: 'percent', yu1: 'percent', xu: 'hour', xus: 'hours' }
  ];
  G('calc1.derivative-notation', function (R, ctx) {
    var kind = lv(ctx, R.pick(['units', 'estimate']), R.pick(['units', 'interp', 'estimate', 'leibniz']), R.pick(['interp', 'estimate', 'leibniz']));
    var c = R.pick(CTX), F = c.f + '(' + c.x + ')', Fp = c.f + "'(" + c.x + ')';
    var intro = c.intro + ' ';
    if (kind === 'units') {
      return {
        q: intro + 'What are the units of $' + Fp + '$, which is also written $' + frac('d' + c.f, 'd' + c.x) + '$?',
        a: mc(c.yu + ' per ' + c.xu, [c.yu, c.xus + ' per ' + c.yu1, c.yu + ' times ' + c.xus]),
        steps: ['$' + frac('d' + c.f, 'd' + c.x) + '$ is a limit of ratios $' + frac('\\Delta ' + c.f, '\\Delta ' + c.x) + '$: a change in ' + c.yu + ' divided by a change in ' + c.xus + '.',
          'So its units are the units of $' + c.f + '$ over the units of $' + c.x + '$: ' + c.yu + ' per ' + c.xu + '.'],
        hint: 'Read dy/dx as a fraction: units on top over units on the bottom.', chk: { k: 'mc' }
      };
    }
    var a = R.int(2, 12), m = R.nz(-9, 9), val0 = R.int(20, 400);
    if (kind === 'interp') {
      var dir = m > 0 ? 'increasing' : 'decreasing';
      return {
        q: intro + 'What does $' + c.f + "'(" + a + ') = ' + m + '$ mean?',
        a: mc('When $' + c.x + ' = ' + a + '$, ' + c.what + ' is ' + dir + ' at about ' + abs(m) + ' ' + (abs(m) === 1 ? c.yu1 : c.yu) + ' per ' + c.xu + '.',
          ['$' + c.f + '(' + a + ') = ' + m + '$ ' + c.yu + '.', 'When $' + c.x + ' = ' + m + '$, the value is ' + a + ' ' + c.yu + '.', 'Over the first ' + a + ' ' + c.xus + ', the total change is ' + m + ' ' + c.yu + '.']),
        steps: ['$' + c.f + "'(" + a + ')$ is a rate of change at one instant, $' + c.x + ' = ' + a + '$, not a value of $' + c.f + '$.',
          'Its units are ' + c.yu + ' per ' + c.xu + ', and its sign says ' + (m > 0 ? 'up' : 'down') + '.',
          'So at $' + c.x + ' = ' + a + '$ the quantity is ' + dir + ' at about ' + abs(m) + ' ' + c.yu + ' per ' + c.xu + '. Over one more ' + c.xu + ' it would change by roughly ' + m + '.'],
        hint: 'A derivative is a rate: how fast, in units of output per unit of input.', chk: { k: 'mc' }
      };
    }
    if (kind === 'estimate') {
      var dx = q(R.pick(['0.5', '1', '2', '0.2'])), est = q(val0).add(dx.mul(m));
      return {
        q: intro + 'Suppose $' + c.f + '(' + a + ') = ' + val0 + '$ and $' + c.f + "'(" + a + ') = ' + m + '$. Estimate $' + c.f + '(' + dec(q(a).add(dx)) + ')$.',
        a: numD(est), unit: c.yu,
        steps: ['The derivative says ' + c.f + ' changes by about ' + m + ' ' + c.yu + ' for each ' + c.xu + ', near $' + c.x + ' = ' + a + '$.',
          'Going from $' + a + '$ to $' + dec(q(a).add(dx)) + '$ is a step of $' + dec(dx) + '$, so the change is about $' + m + ' \\times ' + dec(dx) + ' = ' + dec(dx.mul(m)) + '$.',
          '$' + c.f + '(' + dec(q(a).add(dx)) + ') \\approx ' + val0 + sg(dx.mul(m)) + ' = ' + dec(est) + '$ ' + c.yu + '.'],
        hint: 'New value ≈ old value + rate × step.', chk: { k: 'val', v: val0 + dx.toNumber() * m }
      };
    }
    var xa = R.int(2, 6);
    return {
      q: 'Let $y = f(x)$. Which expression means the same as $f\'(' + xa + ')$?',
      a: mc('$\\left.' + frac('dy', 'dx') + '\\right|_{x = ' + xa + '}$', ['$' + frac('d', 'dx') + '\\big[f(' + xa + ')\\big]$', '$' + frac('dy', 'd' + xa) + '$', '$' + frac('f(' + xa + ')', xa) + '$']),
      steps: ['$' + frac('dy', 'dx') + '$ is the derivative function; the bar $\\Big|_{x = ' + xa + '}$ says to evaluate it at $x = ' + xa + '$.',
        'Watch out for $' + frac('d', 'dx') + '\\big[f(' + xa + ')\\big]$: $f(' + xa + ')$ is one fixed number, so its derivative is $0$.',
        '$' + frac('f(' + xa + ')', xa) + '$ is just a value divided by ' + xa + ', not a rate of change.'],
      hint: 'Differentiate first, then plug in.', chk: { k: 'mc' }
    };
  });


  // ================================================================== UNIT 3: DIFFERENTIATION RULES
  function expT(n) { n = q(n); return n.isInt() ? tx(n) : (n.sign() < 0 ? '-' : '') + n.abs().n + '/' + n.d; }  // 3/2 in an exponent
  function powT(c, n, v) { // c·x^n with the exponent written plainly (x^{3/2}, x^{-2})
    v = xs(v); c = q(c); n = q(n);
    if (n.isZero()) return tx(c);
    return T.coef(c, n.eq(1) ? v : v + '^{' + expT(n) + '}');
  }
  // a power term c·x^n written the way people write it: 3/x^2, 4√x, 5/√x, 2∛x
  function natT(c, n) {
    c = q(c); n = q(n); var neg = c.sign() < 0, m = c.abs(), s = neg ? '-' : '';
    if (n.isInt() && n.sign() >= 0) return powT(c, n);
    if (n.isInt()) { var k = n.abs(); return s + frac(tx(m), k.eq(1) ? 'x' : 'x^{' + tx(k) + '}'); }
    if (n.eq(q(1).div(2))) return T.coef(c, '\\sqrt{x}');
    if (n.eq(q(-1).div(2))) return s + frac(tx(m), '\\sqrt{x}');
    if (n.eq(q(1).div(3))) return T.coef(c, '\\sqrt[3]{x}');
    if (n.eq(q(-1).div(3))) return s + frac(tx(m), '\\sqrt[3]{x}');
    if (n.eq(q(2).div(3))) return T.coef(c, '\\sqrt[3]{x^{2}}');
    if (n.eq(q(3).div(2))) return T.coef(c, 'x\\sqrt{x}');
    return powT(c, n);
  }
  function xpw(n) { return n === 0 ? '' : n === 1 ? 'x' : 'x^{' + n + '}'; }
  function termsT(list, fnT) { return sumT(list.map(function (t) { return fnT(t[0], t[1]); })); }
  function termsP(list) { return sumP(list.map(function (t) { return monoP(t[0], t[1]); })); }
  function dTerms(list) { return list.map(function (t) { return [q(t[0]).mul(t[1]), q(t[1]).sub(1)]; }).filter(function (t) { return !t[0].isZero(); }); }

  G('calc1.power-rule', function (R, ctx) {
    var kind = lv(ctx, 'poly', R.pick(['mixed', 'mixed', 'poly']), R.pick(['rewrite', 'mixed', 'at']));
    if (kind === 'poly' || kind === 'mixed' || kind === 'at') {
      var list = [], used = {};
      var nPoly = kind === 'poly' ? R.int(3, 4) : 2, i;
      var exps = R.sample([0, 1, 2, 3, 4, 5, 6], nPoly).sort(function (a, b) { return b - a; });
      if (exps.every(function (e) { return e < 2; })) exps[0] = 3;
      exps.forEach(function (e) { list.push([R.nz(-7, 9), e]); });
      if (kind !== 'poly') {
        var odd = R.sample([[-1, 1], [-2, 1], [-3, 1], ['1/2', 1], ['-1/2', 1], ['1/3', 1], ['3/2', 1], ['2/3', 1]], R.int(1, 2));
        odd.forEach(function (o) { var n = q(o[0]), c = n.isInt() ? R.nz(-6, 8) : n.d === 2n ? R.pick([2, 4, 6, -4, 8]) : R.pick([3, 6, -3, 9]); list.push([c, n]); });
      }
      list.sort(function (a, b) { return q(b[1]).cmp(q(a[1])); });
      var d = dTerms(list), fT = termsT(list, natT), fP = termsP(list), dP = termsP(d);
      var needs = list.filter(function (t) { var n = q(t[1]); return !(n.isInt() && n.sign() >= 0); });
      var st = [];
      if (needs.length) st.push('Rewrite every term as a power of $x$: $f(x) = ' + termsT(list, powT) + '$.');
      st.push('Power rule, term by term: bring the exponent down as a factor, then lower the exponent by 1. A constant term has derivative 0.');
      st.push(list.map(function (t) { var n = q(t[1]); return n.isZero() ? '$' + tx(t[0]) + ' \\to 0$' : n.eq(1) ? '$' + powT(t[0], 1) + ' \\to ' + tx(t[0]) + '$' : '$' + powT(t[0], n) + ' \\to ' + tx(q(t[0])) + ' \\cdot ' + tp(n) + 'x^{' + expT(n.sub(1)) + '} = ' + powT(q(t[0]).mul(n), n.sub(1)) + '$'; }).join(', ') + '.');
      st.push('So $f\'(x) = ' + termsT(d, powT) + '$' + (needs.length ? ', which can also be written $' + termsT(d, natT) + '$.' : '.'));
      if (kind === 'at') {
        var halves = list.some(function (u) { return q(u[1]).d === 2n; }), thirds = list.some(function (u) { return q(u[1]).d === 3n; });
        var a = halves && thirds ? 1 : halves ? R.pick([1, 4]) : thirds ? R.pick([1, 8]) : R.pick([1, 2, -1, 2]);
        var val = evalTerms(d, a);
        if (val === null) { a = 1; val = evalTerms(d, 1); }
        st.push('At $x = ' + a + '$: $f\'(' + a + ') = ' + tx(val) + '$.');
        return { q: 'Let $f(x) = ' + fT + '$. Find $f\'(' + a + ')$.', a: num(val), steps: st, hint: 'Rewrite roots and fractions as powers of x first.', chk: { k: 'dat', f: fP, x: a } };
      }
      return { q: 'Find $f\'(x)$ for $f(x) = ' + fT + '$.', a: expr(dP), steps: st, hint: needs.length ? 'Rewrite roots and fractions as powers of x, then use the power rule on each term.' : 'Use the power rule on each term: multiply by the exponent, then subtract 1 from it.', chk: { k: 'd', f: fP } };
    }
    // rewrite first
    var t = R.pick(['divide', 'square', 'rootprod']), fT2, list2, pre;
    if (t === 'divide') {
      var A = R.nz(-5, 5), B = R.int(-6, 6), C = R.nz(-6, 6);
      fT2 = dfrac(T.poly([A, B, C], 'x'), 'x'); list2 = [[A, 1], [B, 0], [C, -1]];
      pre = 'Divide each term by $x$: $f(x) = ' + termsT(list2.filter(function (u) { return u[0] !== 0; }), powT) + '$.';
    } else if (t === 'square') {
      var a2 = R.nz(-3, 4), b2 = R.nz(-6, 6), sq = P([b2, a2]).mul(P([b2, a2]));
      fT2 = '(' + linT(a2, b2) + ')^{2}'; list2 = [[sq.c[2], 2], [sq.c[1], 1], [sq.c[0], 0]];
      pre = 'There is no rule yet for the square of a sum, so expand first: $f(x) = ' + sq.tex() + '$.';
    } else {
      var c3 = R.nz(-6, 6);
      fT2 = '\\sqrt{x}\\,(' + linT(1, c3) + ')'; list2 = [[1, q(3).div(2)], [c3, q(1).div(2)]];
      pre = 'Multiply out and write powers: $f(x) = x^{3/2}' + (c3 < 0 ? ' - ' : ' + ') + (abs(c3) === 1 ? '' : abs(c3)) + 'x^{1/2}$.';
    }
    list2 = list2.filter(function (u) { return !q(u[0]).isZero(); });
    var d2 = dTerms(list2);
    return {
      q: 'Find $f\'(x)$ for $f(x) = ' + fT2 + '$.',
      a: expr(termsP(d2)),
      steps: [pre, 'Now use the power rule on each term: $f\'(x) = ' + termsT(d2, powT) + '$.' + (d2.some(function (u) { return !q(u[1]).isInt() || q(u[1]).sign() < 0; }) ? ' In root form: $' + termsT(d2, natT) + '$.' : '')],
      hint: 'Rewrite f as a sum of powers of x before differentiating.',
      chk: { k: 'd', f: termsP(list2) }
    };
  });
  function evalTerms(list, a) { // exact value of Σ c x^n at x = a when all exponents are integers or a is a perfect power
    var s = q(0);
    for (var i = 0; i < list.length; i++) {
      var n = q(list[i][1]), c = q(list[i][0]), v;
      if (n.isInt()) { var k = Number(n.n); v = k >= 0 ? q(a).pow(k) : q(1).div(q(a).pow(-k)); }
      else { var r = Math.pow(a, n.toNumber()); if (Math.abs(r - Math.round(r * 1e6) / 1e6) > 1e-12) return null; v = q(Math.round(r * 1e6)).div(1e6); if (Math.abs(v.toNumber() - r) > 1e-12) return null; }
      s = s.add(c.mul(v));
    }
    return s;
  }

  G('calc1.product-rule', function (R, ctx) {
    var kind = lv(ctx, R.pick(['poly', 'poly', 'table']), R.pick(['poly', 'table', 'root', 'xsq']), R.pick(['three', 'root', 'table', 'xsq']));
    if (kind === 'poly') {
      var m = R.int(1, 3), n = R.int(1, 3), f = P([R.nz(-5, 5)]).add(P([0]).add(mk(R.nz(-3, 4), m))), g = P([R.nz(-6, 6)]).add(mk(R.nz(-3, 3), n));
      var fp = f.d(), gp = g.d(), prod = f.mul(g).d();
      return {
        q: 'Use the product rule to find $' + ddx() + '\\Big[(' + f.tex() + ')(' + g.tex() + ')\\Big]$.',
        a: expr(prod.plain()),
        steps: ['Name the factors: $f = ' + f.tex() + '$ and $g = ' + g.tex() + '$. Then $f\' = ' + fp.tex() + '$ and $g\' = ' + gp.tex() + '$.',
          'Product rule: $(fg)\' = f\'g + fg\'$. Each term changes one factor and keeps the other.',
          '$(fg)\' = ' + fp.ptex() + '(' + g.tex() + ') + (' + f.tex() + ')' + gp.ptex() + '$.',
          'Multiply out and combine: $' + prod.tex() + '$. (Check: expanding $fg$ first and using the power rule gives the same answer.)'],
        hint: 'First times derivative of the second, plus second times derivative of the first.',
        chk: { k: 'd', f: '(' + f.plain() + ')*(' + g.plain() + ')' }
      };
    }
    if (kind === 'table' || kind === 'xsq') {
      var a = R.int(1, 4), fa = R.nz(-6, 6), fpa = R.nz(-5, 5), ga = R.nz(-6, 6), gpa = R.nz(-5, 5);
      if (kind === 'table') {
        var ans = q(fpa * ga + fa * gpa);
        return {
          q: 'Suppose $f(' + a + ') = ' + fa + '$, $f\'(' + a + ') = ' + fpa + '$, $g(' + a + ') = ' + ga + '$ and $g\'(' + a + ') = ' + gpa + '$. Let $h(x) = f(x)\\,g(x)$. Find $h\'(' + a + ')$.',
          a: num(ans),
          steps: ['Product rule: $h\'(x) = f\'(x)g(x) + f(x)g\'(x)$.', 'At $x = ' + a + '$: $h\'(' + a + ') = ' + tp(fpa) + tp(ga) + ' + ' + tp(fa) + tp(gpa) + '$.', '$= ' + (fpa * ga) + sg(fa * gpa) + ' = ' + tx(ans) + '$. (The tempting $f\'(' + a + ')g\'(' + a + ') = ' + (fpa * gpa) + '$ is not the derivative of a product.)'],
          hint: "h′ = f′g + fg′; plug in the table values.", chk: { k: 'val', v: fpa * ga + fa * gpa }
        };
      }
      var k = R.pick([2, 3]), c = R.nz(-4, 4), ans2 = q(k).mul(Math.pow(a, k - 1)).mul(fa).add(q(Math.pow(a, k)).mul(fpa)).mul(1);
      return {
        q: 'Suppose $f(' + a + ') = ' + fa + '$ and $f\'(' + a + ') = ' + fpa + '$. Let $h(x) = x^{' + k + '} f(x)$. Find $h\'(' + a + ')$.',
        a: num(ans2),
        steps: ['Product rule with $x^{' + k + '}$ and $f(x)$: $h\'(x) = ' + k + 'x^{' + (k - 1) + '} f(x) + x^{' + k + '} f\'(x)$.'.replace('x^{1}', 'x'),
          'At $x = ' + a + '$: $h\'(' + a + ') = ' + k + ' \\cdot ' + a + (k - 1 > 1 ? '^{' + (k - 1) + '}' : '') + ' \\cdot ' + tp(fa) + ' + ' + a + '^{' + k + '} \\cdot ' + tp(fpa) + '$.',
          '$= ' + (k * Math.pow(a, k - 1) * fa) + sg(Math.pow(a, k) * fpa) + ' = ' + tx(ans2) + '$.'],
        hint: 'Treat x^' + k + ' as the first factor and f(x) as the second.', chk: { k: 'val', v: k * Math.pow(a, k - 1) * fa + Math.pow(a, k) * fpa }
      };
    }
    if (kind === 'root') {
      var A = R.nz(-6, 6), ans3 = '(5x^2' + (A < 0 ? '' : '+') + A + ')/(2*sqrt(x))';
      return {
        q: 'Use the product rule to find $' + ddx() + '\\Big[\\sqrt{x}\\,(x^{2}' + sg(A) + ')\\Big]$.',
        a: expr(ans3),
        steps: ['$f = \\sqrt{x} = x^{1/2}$ so $f\' = ' + frac(1, '2\\sqrt{x}') + '$; $g = x^{2}' + sg(A) + '$ so $g\' = 2x$.',
          '$(fg)\' = ' + frac(1, '2\\sqrt{x}') + '(x^{2}' + sg(A) + ') + \\sqrt{x} \\cdot 2x$.',
          'Common denominator $2\\sqrt{x}$: $' + frac('x^{2}' + sg(A) + ' + 4x^{2}', '2\\sqrt{x}') + ' = ' + frac('5x^{2}' + sg(A), '2\\sqrt{x}') + '$.'],
        hint: 'Write √x as x^(1/2) to differentiate it.', chk: { k: 'd', f: 'sqrt(x)*(x^2+' + A + ')' }
      };
    }
    var a3 = R.nz(-4, 4), b3 = R.intNot(-4, 4, [0, a3]), F = P([0, 1]), G2 = P([a3, 1]), H = P([b3, 1]), tot = F.mul(G2).mul(H).d();
    return {
      q: 'Find $' + ddx() + '\\Big[x\\,(' + G2.tex() + ')(' + H.tex() + ')\\Big]$.',
      a: expr(tot.plain()),
      steps: ['For three factors the product rule becomes $(fgh)\' = f\'gh + fg\'h + fgh\'$: differentiate one factor at a time.',
        '$= 1 \\cdot (' + G2.tex() + ')(' + H.tex() + ') + x \\cdot 1 \\cdot (' + H.tex() + ') + x(' + G2.tex() + ') \\cdot 1$.',
        'Expand and combine: $' + G2.mul(H).tex() + ' + ' + F.mul(H).tex() + ' + ' + F.mul(G2).tex() + ' = ' + tot.tex() + '$.'],
      hint: 'Differentiate one factor at a time, keeping the other two.', chk: { k: 'd', f: 'x*(' + G2.plain() + ')*(' + H.plain() + ')' }
    };
    function mk(c, k) { var arr = []; for (var i = 0; i < k; i++) arr.push(0); arr.push(c); return P(arr); }
  });

  G('calc1.quotient-rule', function (R, ctx) {
    var kind = lv(ctx, R.pick(['lin', 'lin', 'recip']), R.pick(['quad', 'table', 'xover', 'recip']), R.pick(['quad', 'root', 'table', 'xover']));
    var top, bot, ans, st, fT, fP;
    if (kind === 'table') {
      var a = R.int(1, 4), fa = R.nz(-6, 6), fpa = R.nz(-5, 5), ga = R.pick([-3, -2, -1, 1, 2, 3, 4]), gpa = R.nz(-5, 5), v = q(fpa * ga - fa * gpa).div(ga * ga);
      return {
        q: 'Suppose $f(' + a + ') = ' + fa + '$, $f\'(' + a + ') = ' + fpa + '$, $g(' + a + ') = ' + ga + '$ and $g\'(' + a + ') = ' + gpa + '$. Let $h(x) = ' + frac('f(x)', 'g(x)') + '$. Find $h\'(' + a + ')$.',
        a: num(v),
        steps: ['Quotient rule: $h\' = ' + frac('f\'g - fg\'', 'g^{2}') + '$ (derivative of the top first, then the minus sign).',
          '$h\'(' + a + ') = ' + frac(tp(fpa) + tp(ga) + ' - ' + tp(fa) + tp(gpa), tp(ga) + '^{2}') + ' = ' + frac(fpa * ga - fa * gpa, ga * ga) + '$' + (v.isInt() || gcd(abs(fpa * ga - fa * gpa), ga * ga) > 1 ? ' $= ' + tx(v) + '$' : '') + '.'],
        hint: '(f′g − fg′)/g², with the table values.', chk: { k: 'val', v: (fpa * ga - fa * gpa) / (ga * ga) }
      };
    }
    if (kind === 'lin') {
      var A = R.nz(-5, 5), B = R.int(-6, 6), C = R.nz(-4, 4), D = R.int(-6, 6);
      if (A * D - B * C === 0) D = D + 1;
      top = P([B, A]); bot = P([D, C]); fT = dfrac(top.tex(), bot.tex()); fP = '(' + top.plain() + ')/(' + bot.plain() + ')';
      ans = (A * D - B * C) + '/(' + bot.plain() + ')^2';
      st = ['Top $f = ' + top.tex() + '$, $f\' = ' + A + '$. Bottom $g = ' + bot.tex() + '$, $g\' = ' + C + '$.',
        'Quotient rule: $' + frac('f\'g - fg\'', 'g^{2}') + ' = ' + frac(tx(A) + '(' + bot.tex() + ') - (' + top.tex() + ')' + tp(C), '(' + bot.tex() + ')^{2}') + '$.',
        'Expand the top: $' + P([A * D, A * C]).tex() + ' - (' + P([B * C, A * C]).tex() + ') = ' + (A * D - B * C) + '$. The $x$ terms cancel.',
        'So the derivative is $' + frac(A * D - B * C, '(' + bot.tex() + ')^{2}') + '$.'];
    } else if (kind === 'recip') {
      var k = R.nz(-6, 6), b = R.nz(1, 9);
      fT = dfrac(k, 'x^{2} + ' + b); fP = k + '/(x^2+' + b + ')'; ans = (-2 * k) + 'x/(x^2+' + b + ')^2';
      st = ['Top $f = ' + k + '$, so $f\' = 0$. Bottom $g = x^{2} + ' + b + '$, $g\' = 2x$.',
        '$' + frac('f\'g - fg\'', 'g^{2}') + ' = ' + frac('0 \\cdot (x^{2} + ' + b + ') - ' + tp(k) + '(2x)', '(x^{2} + ' + b + ')^{2}') + ' = ' + frac(T.coef(-2 * k, 'x'), '(x^{2} + ' + b + ')^{2}') + '$.'];
    } else if (kind === 'quad') {
      var a2 = R.nz(-6, 6), b2 = R.nz(-5, 5);
      top = P([a2, 0, 1]); bot = P([b2, 1]); fT = dfrac(top.tex(), bot.tex()); fP = '(' + top.plain() + ')/(' + bot.plain() + ')';
      var num_ = P([-a2, 2 * b2, 1]); ans = '(' + num_.plain() + ')/(' + bot.plain() + ')^2';
      st = ['Top $f = ' + top.tex() + '$, $f\' = 2x$. Bottom $g = ' + bot.tex() + '$, $g\' = 1$.',
        '$' + frac('f\'g - fg\'', 'g^{2}') + ' = ' + frac('2x(' + bot.tex() + ') - (' + top.tex() + ')(1)', '(' + bot.tex() + ')^{2}') + '$.',
        'Top: $' + P([0, 2 * b2, 2]).tex() + ' - ' + top.ptex() + ' = ' + num_.tex() + '$.',
        'So the derivative is $' + frac(num_.tex(), '(' + bot.tex() + ')^{2}') + '$.'];
    } else if (kind === 'xover') {
      var a3 = R.int(1, 9);
      fT = dfrac('x', 'x^{2} + ' + a3); fP = 'x/(x^2+' + a3 + ')'; ans = '(' + a3 + '-x^2)/(x^2+' + a3 + ')^2';
      st = ['Top $f = x$, $f\' = 1$. Bottom $g = x^{2} + ' + a3 + '$, $g\' = 2x$.',
        '$' + frac('f\'g - fg\'', 'g^{2}') + ' = ' + frac('1(x^{2} + ' + a3 + ') - x(2x)', '(x^{2} + ' + a3 + ')^{2}') + ' = ' + frac(a3 + ' - x^{2}', '(x^{2} + ' + a3 + ')^{2}') + '$.'];
    } else {
      var a4 = R.int(1, 9);
      fT = dfrac('\\sqrt{x}', 'x + ' + a4); fP = 'sqrt(x)/(x+' + a4 + ')'; ans = '(' + a4 + '-x)/(2*sqrt(x)*(x+' + a4 + ')^2)';
      st = ['Top $f = \\sqrt{x}$, $f\' = ' + frac(1, '2\\sqrt{x}') + '$. Bottom $g = x + ' + a4 + '$, $g\' = 1$.',
        '$' + frac('f\'g - fg\'', 'g^{2}') + ' = ' + frac(frac(1, '2\\sqrt{x}') + '(x + ' + a4 + ') - \\sqrt{x}', '(x + ' + a4 + ')^{2}') + '$.',
        'Multiply top and bottom by $2\\sqrt{x}$: $' + frac('(x + ' + a4 + ') - 2x', '2\\sqrt{x}\\,(x + ' + a4 + ')^{2}') + ' = ' + frac(a4 + ' - x', '2\\sqrt{x}\\,(x + ' + a4 + ')^{2}') + '$.'];
    }
    return { q: 'Find $' + ddx() + '\\left[' + fT + '\\right]$.', a: expr(ans), steps: st, hint: 'Low d-high minus high d-low, over low squared: (f′g − fg′)/g².', chk: { k: 'd', f: fP } };
  });

  // exact values of sin and cos at the special angles: [rational part, coefficient of √k, k]
  var SPEC = { '0': [[0, 0, 1], [1, 0, 1]], 'pi/6': [['1/2', 0, 1], [0, '1/2', 3]], 'pi/4': [[0, '1/2', 2], [0, '1/2', 2]], 'pi/3': [[0, '1/2', 3], ['1/2', 0, 1]], 'pi/2': [[1, 0, 1], [0, 0, 1]], '2pi/3': [[0, '1/2', 3], ['-1/2', 0, 1]], 'pi': [[0, 0, 1], [-1, 0, 1]] };
  var SPECT = { '0': '0', 'pi/6': '\\frac{\\pi}{6}', 'pi/4': '\\frac{\\pi}{4}', 'pi/3': '\\frac{\\pi}{3}', 'pi/2': '\\frac{\\pi}{2}', '2pi/3': '\\frac{2\\pi}{3}', 'pi': '\\pi' };
  function exactLin(a, A, b, B) { // a·A + b·B for exact values A, B = [r, s, k]; result [r, s, k]
    var k = A[1] && q(A[1]).sign() ? A[2] : B[2];
    return [q(a).mul(A[0]).add(q(b).mul(B[0])), q(a).mul(A[1]).add(q(b).mul(B[1])), k];
  }
  function exactT(E) { var r = q(E[0]), s = q(E[1]); if (s.isZero()) return tx(r); var sa = s.abs(), rt = sa.isInt() ? T.coef(sa, '\\sqrt{' + E[2] + '}') : frac((sa.n === 1n ? '' : String(sa.n)) + '\\sqrt{' + E[2] + '}', String(sa.d)); var body = (s.sign() < 0 ? '-' : '') + rt; if (r.isZero()) return body; return tx(r) + (s.sign() < 0 ? ' - ' : ' + ') + rt; }
  function exactP(E) { var r = q(E[0]), s = q(E[1]); if (s.isZero()) return pl(r); var sq = cmulP(s, 'sqrt(' + E[2] + ')'); if (r.isZero()) return sq; return r.sign() < 0 ? cl(sq + '-' + pl(r.neg())) : cl(pl(r) + '+' + sq); }

  G('calc1.trig-derivatives', function (R, ctx) {
    var kind = lv(ctx, R.pick(['basic', 'basic', 'at']), R.pick(['prod', 'more', 'at', 'basic']), R.pick(['quot', 'prod', 'more', 'quot2']));
    if (kind === 'basic' || kind === 'more') {
      var list = kind === 'basic' ? [['sin', R.nz(-6, 6)], ['cos', R.nz(-6, 6)]] : R.sample([['tan', R.nz(-5, 5)], ['sec', R.nz(-5, 5)], ['csc', R.nz(-5, 5)], ['cot', R.nz(-5, 5)], ['sin', R.nz(-5, 5)]], 2);
      if (kind === 'basic' && R.coin()) list.push(['x', R.nz(-5, 5)]);
      var D = { sin: ['\\cos x', 'cos(x)', 1], cos: ['\\sin x', 'sin(x)', -1], tan: ['\\sec^{2} x', 'sec(x)^2', 1], sec: ['\\sec x \\tan x', 'sec(x)*tan(x)', 1], csc: ['\\csc x \\cot x', 'csc(x)*cot(x)', -1], cot: ['\\csc^{2} x', 'csc(x)^2', -1], x: ['', '1', 1] };
      var fT = sumT(list.map(function (t) { return t[0] === 'x' ? T.coef(t[1], 'x') : T.coef(t[1], '\\' + t[0] + ' x'); }));
      var fP = sumP(list.map(function (t) { return t[0] === 'x' ? t[1] + '*x' : t[1] + '*' + t[0] + '(x)'; }));
      var dT = sumT(list.map(function (t) { var c = t[1] * D[t[0]][2]; return t[0] === 'x' ? tx(c) : T.coef(c, D[t[0]][0]); }));
      var dP = sumP(list.map(function (t) { var c = t[1] * D[t[0]][2]; return t[0] === 'x' ? String(c) : c + '*' + D[t[0]][1]; }));
      return {
        q: 'Find $f\'(x)$ for $f(x) = ' + fT + '$.',
        a: expr(dP),
        steps: ['Differentiate term by term, using ' + list.filter(function (t) { return t[0] !== 'x'; }).map(function (t) { return '$' + ddx() + '\\' + t[0] + ' x = ' + (D[t[0]][2] < 0 ? '-' : '') + D[t[0]][0] + '$'; }).join(' and ') + '.',
          list.some(function (t) { return D[t[0]][2] < 0 && t[0] !== 'x'; }) ? 'Watch the signs: the derivatives of the "co" functions (cosine, cosecant, cotangent) all carry a minus sign.' : 'Constants ride along.',
          '$f\'(x) = ' + dT + '$.'],
        hint: 'd/dx sin x = cos x, d/dx cos x = −sin x.', chk: { k: 'd', f: fP }
      };
    }
    if (kind === 'at') {
      var a = R.nz(-6, 6), b = R.nz(-6, 6), ang = R.pick(['pi/6', 'pi/4', 'pi/3', 'pi/2', '2pi/3', 'pi', '0']), S = SPEC[ang];
      var val = exactLin(a, S[1], -b, S[0]);
      return {
        q: 'Let $f(x) = ' + T.coef(a, '\\sin x') + T.coef(b, '\\cos x', false) + '$. Find $f\'\\left(' + SPECT[ang] + '\\right)$ exactly.',
        a: num(exactP(val)),
        steps: ['$f\'(x) = ' + T.coef(a, '\\cos x') + T.coef(-b, '\\sin x', false) + '$.',
          'At $x = ' + SPECT[ang] + '$: $\\cos' + (ang === 'pi' ? '\\pi' : '\\left(' + SPECT[ang] + '\\right)') + ' = ' + exactT(S[1]) + '$ and $\\sin' + (ang === 'pi' ? '\\pi' : '\\left(' + SPECT[ang] + '\\right)') + ' = ' + exactT(S[0]) + '$.',
          '$f\'\\left(' + SPECT[ang] + '\\right) = ' + (a === 1 ? '' : a === -1 ? '-' : tx(a)) + '\\left(' + exactT(S[1]) + '\\right)' + (b > 0 ? ' - ' : ' + ') + (abs(b) === 1 ? '' : abs(b)) + '\\left(' + exactT(S[0]) + '\\right) = ' + exactT(val) + '$.'],
        hint: 'Differentiate first, then use the unit circle values.', chk: { k: 'dat', f: a + '*sin(x)+' + b + '*cos(x)', x: ML.evalPlain(ang) }
      };
    }
    if (kind === 'prod') {
      var n = R.int(1, 4), fn = R.pick(['sin', 'cos']), c = R.pick([1, 1, 2, 3, -1]);
      var xn = n === 1 ? 'x' : 'x^{' + n + '}', fT2 = T.coef(c, xn + '\\' + fn + ' x');
      var dfn = fn === 'sin' ? ['\\cos x', 'cos(x)', 1] : ['\\sin x', 'sin(x)', -1];
      var dP2 = c * n + '*x^' + (n - 1) + '*' + fn + '(x)+' + (c * dfn[2]) + '*x^' + n + '*' + dfn[1];
      var dT2 = T.coef(c * n, (n - 1 === 0 ? '' : n - 1 === 1 ? 'x' : 'x^{' + (n - 1) + '}') + '\\' + fn + ' x') + T.coef(c * dfn[2], xn + dfn[0], false);
      return {
        q: 'Find $' + ddx() + '\\left[' + fT2 + '\\right]$.',
        a: expr(cl(dP2)),
        steps: ['It is a product, so use the product rule with $' + T.coef(c, xn) + '$ and $\\' + fn + ' x$.',
          'Derivatives: $' + ddx() + '\\big(' + T.coef(c, xn) + '\\big) = ' + T.coef(c * n, n - 1 === 0 ? '' : n - 1 === 1 ? 'x' : 'x^{' + (n - 1) + '}') + '$ and $' + ddx() + '\\' + fn + ' x = ' + (dfn[2] < 0 ? '-' : '') + dfn[0] + '$.',
          'Answer: $' + dT2 + '$.'],
        hint: 'Product rule: f′g + fg′.', chk: { k: 'd', f: c + '*x^' + n + '*' + fn + '(x)' }
      };
    }
    if (kind === 'quot') {
      return {
        q: 'Find $' + ddx() + '\\left[' + frac('\\sin x', 'x') + '\\right]$.',
        a: expr('(x*cos(x)-sin(x))/x^2'),
        steps: ['Quotient rule with top $\\sin x$ (derivative $\\cos x$) and bottom $x$ (derivative 1).', '$' + frac('\\cos x \\cdot x - \\sin x \\cdot 1', 'x^{2}') + ' = ' + frac('x\\cos x - \\sin x', 'x^{2}') + '$.'],
        hint: '(f′g − fg′)/g².', chk: { k: 'd', f: 'sin(x)/x' }
      };
    }
    var k2 = R.int(1, 4), fnc = R.coin();
    return {
      q: 'Find $' + ddx() + '\\left[' + frac(fnc ? '\\sin x' : '\\cos x', k2 + ' + ' + (fnc ? '\\cos x' : '\\sin x')) + '\\right]$ and simplify.',
      a: expr(fnc ? (k2 === 1 ? '1/(1+cos(x))' : '(' + k2 + '*cos(x)+1)/(' + k2 + '+cos(x))^2') : (k2 === 1 ? '-1/(1+sin(x))' : '-(' + k2 + '*sin(x)+1)/(' + k2 + '+sin(x))^2')),
      steps: fnc ? ['Quotient rule: top $\\sin x$, bottom $' + k2 + ' + \\cos x$ (derivative $-\\sin x$).',
        '$' + frac('\\cos x\\,(' + k2 + ' + \\cos x) - \\sin x\\,(-\\sin x)', '(' + k2 + ' + \\cos x)^{2}') + ' = ' + frac(T.coef(k2, '\\cos x') + ' + \\cos^{2} x + \\sin^{2} x', '(' + k2 + ' + \\cos x)^{2}') + '$.',
        'Use $\\sin^{2} x + \\cos^{2} x = 1$: $' + frac(T.coef(k2, '\\cos x') + ' + 1', '(' + k2 + ' + \\cos x)^{2}') + '$' + (k2 === 1 ? ' $= ' + frac(1, '1 + \\cos x') + '$.' : '.')]
        : ['Quotient rule: top $\\cos x$, bottom $' + k2 + ' + \\sin x$ (derivative $\\cos x$).',
          '$' + frac('-\\sin x\\,(' + k2 + ' + \\sin x) - \\cos x \\cdot \\cos x', '(' + k2 + ' + \\sin x)^{2}') + ' = ' + frac('-' + T.coef(k2, '\\sin x') + ' - (\\sin^{2} x + \\cos^{2} x)', '(' + k2 + ' + \\sin x)^{2}') + '$.',
          'Use $\\sin^{2} x + \\cos^{2} x = 1$: $-' + frac(T.coef(k2, '\\sin x') + ' + 1', '(' + k2 + ' + \\sin x)^{2}') + '$' + (k2 === 1 ? ' $= -' + frac(1, '1 + \\sin x') + '$.' : '.')],
      hint: 'Quotient rule, then the Pythagorean identity.', chk: { k: 'd', f: fnc ? 'sin(x)/(' + k2 + '+cos(x))' : 'cos(x)/(' + k2 + '+sin(x))' }
    };
  });

  G('calc1.higher-derivatives', function (R, ctx) {
    var kind = lv(ctx, R.pick(['poly2', 'poly2', 'at']), R.pick(['poly3', 'mixed', 'at']), R.pick(['nth', 'mixed', 'nthpow']));
    if (kind === 'poly2' || kind === 'poly3' || kind === 'at') {
      var f = P([R.int(-6, 6), R.int(-6, 6), R.int(-5, 5), R.nz(-4, 4), kind === 'poly2' ? 0 : R.int(-3, 3)]), n = kind === 'poly3' ? 3 : 2, d1 = f.d(), d2 = d1.d(), d3 = d2.d();
      var dn = n === 3 ? d3 : d2, st = ['$f\'(x) = ' + d1.tex() + '$.', '$f\'\'(x) = ' + d2.tex() + '$ (differentiate $f\'$).'];
      if (n === 3) st.push('$f\'\'\'(x) = ' + d3.tex() + '$.');
      if (kind === 'at') { var a = R.int(-3, 3); st.push('At $x = ' + a + '$: $f\'\'(' + a + ') = ' + d2.subT(a) + ' = ' + tx(d2.at(a)) + '$.'); return { q: 'Let $f(x) = ' + f.tex() + '$. Find $f\'\'(' + a + ')$.', a: num(d2.at(a)), steps: st, hint: 'Differentiate twice, then substitute.', chk: { k: 'dat', f: f.plain(), x: a, n: 2 } }; }
      return { q: 'Find $f' + (n === 3 ? "'''" : "''") + '(x)$ for $f(x) = ' + f.tex() + '$.', a: expr(dn.plain()), steps: st, hint: 'Take the derivative, then take the derivative of that.', chk: { k: 'd', f: f.plain(), n: n } };
    }
    if (kind === 'mixed') {
      var a2 = R.nz(-4, 4), b2 = R.nz(-6, 6), k = R.int(1, 2), m = R.int(2, 4);
      var list = [[a2, m], [b2, -k]], d1l = dTerms(list), d2l = dTerms(d1l);
      return {
        q: 'Find $f\'\'(x)$ for $f(x) = ' + termsT(list, natT) + '$.',
        a: expr(termsP(d2l)),
        steps: ['Write $f(x) = ' + termsT(list, powT) + '$.', '$f\'(x) = ' + termsT(d1l, powT) + '$.', '$f\'\'(x) = ' + termsT(d2l, powT) + ' = ' + termsT(d2l, natT) + '$.'],
        hint: 'Write the fraction as a negative power first.', chk: { k: 'd', f: termsP(list), n: 2 }
      };
    }
    if (kind === 'nth') {
      var n2 = R.int(3, 5), c = R.pick([1, 2, 3, -1]), fact = 1; for (var i = 2; i <= n2; i++) fact *= i;
      var coef = c * fact * (n2 % 2 ? -1 : 1);
      return {
        q: 'Let $f(x) = ' + frac(c, 'x') + '$. Find $f^{(' + n2 + ')}(x)$, the ' + U.ordinal(n2) + ' derivative.',
        a: expr(coef + '/x^' + (n2 + 1)),
        steps: ['Write $f(x) = ' + T.coef(c, 'x^{-1}') + '$.', '$f\'(x) = ' + T.coef(-c, 'x^{-2}') + '$, $f\'\'(x) = ' + T.coef(2 * c, 'x^{-3}') + '$, $f\'\'\'(x) = ' + T.coef(-6 * c, 'x^{-4}') + '$.',
          'Each step multiplies by the current (negative) exponent, so the sign flips and the coefficient picks up $1, 2, 3, \\ldots$: after ' + n2 + ' steps the coefficient is $' + tx(c) + ' \\cdot (-1)^{' + n2 + '} \\cdot ' + n2 + '! = ' + coef + '$.',
          '$f^{(' + n2 + ')}(x) = ' + frac(coef, 'x^{' + (n2 + 1) + '}') + '$.'],
        hint: 'Find the first three derivatives and look for the pattern.', chk: { k: 'dn', f: c + '/x', n: n2 }
      };
    }
    var m2 = R.int(4, 7), k2 = R.int(2, m2 - 1), c2 = 1; for (var j = 0; j < k2; j++) c2 *= (m2 - j);
    return {
      q: 'Let $f(x) = x^{' + m2 + '}$. Find $f^{(' + k2 + ')}(x)$.',
      a: expr(c2 + '*x^' + (m2 - k2)),
      steps: ['Each derivative brings down the current exponent and lowers it by 1.', 'After ' + k2 + ' derivatives the coefficient is $' + m2 + new Array(k2).join(' ').split(' ').map(function (_, i) { return i ? ' \\cdot ' + (m2 - i) : ''; }).join('') + ' = ' + c2 + '$ and the exponent is $' + m2 + ' - ' + k2 + ' = ' + (m2 - k2) + '$.',
        '$f^{(' + k2 + ')}(x) = ' + powT(c2, m2 - k2) + '$.'],
      hint: 'Write out the first two derivatives and look at the pattern.', chk: { k: 'dn', f: 'x^' + m2, n: k2 }
    };
  });

  // ---- composite functions: an outer layer applied to an inner polynomial
  var OUT = {
    sin: { T: function (u) { return '\\sin(' + u + ')'; }, P: function (u) { return 'sin(' + u + ')'; }, dT: function (u) { return '\\cos(' + u + ')'; }, dP: function (u) { return 'cos(' + u + ')'; }, coef: 1, body: function (u) { return '\\cos(' + u + ')'; }, bodyP: function (u) { return 'cos(' + u + ')'; }, name: '\\sin(\\,\\cdot\\,)', rule: '$' + ddx('u') + '\\sin u = \\cos u$' },
    cos: { T: function (u) { return '\\cos(' + u + ')'; }, P: function (u) { return 'cos(' + u + ')'; }, dT: function (u) { return '-\\sin(' + u + ')'; }, dP: function (u) { return '-sin(' + u + ')'; }, coef: -1, body: function (u) { return '\\sin(' + u + ')'; }, bodyP: function (u) { return 'sin(' + u + ')'; }, name: '\\cos(\\,\\cdot\\,)', rule: '$' + ddx('u') + '\\cos u = -\\sin u$' },
    tan: { T: function (u) { return '\\tan(' + u + ')'; }, P: function (u) { return 'tan(' + u + ')'; }, dT: function (u) { return '\\sec^{2}(' + u + ')'; }, dP: function (u) { return 'sec(' + u + ')^2'; }, coef: 1, body: function (u) { return '\\sec^{2}(' + u + ')'; }, bodyP: function (u) { return 'sec(' + u + ')^2'; }, name: '\\tan(\\,\\cdot\\,)', rule: '$' + ddx('u') + '\\tan u = \\sec^{2} u$' },
    sqrt: { T: function (u) { return '\\sqrt{' + u + '}'; }, P: function (u) { return 'sqrt(' + u + ')'; }, dT: function (u) { return frac(1, '2\\sqrt{' + u + '}'); }, dP: function (u) { return '1/(2*sqrt(' + u + '))'; }, coef: 1, sqrt: true, name: '\\sqrt{\\,\\cdot\\,}', rule: '$' + ddx('u') + '\\sqrt{u} = ' + frac(1, '2\\sqrt{u}') + '$' }
  };
  function powOut(n) { return { T: function (u) { return '(' + u + ')^{' + n + '}'; }, P: function (u) { return '(' + u + ')^' + n; }, dT: function (u) { return n + '(' + u + ')' + (n - 1 === 1 ? '' : '^{' + (n - 1) + '}'); }, dP: function (u) { return n + '*(' + u + ')^' + (n - 1); }, coef: n, body: function (u) { return '(' + u + ')' + (n - 1 === 1 ? '' : '^{' + (n - 1) + '}'); }, bodyP: function (u) { return '(' + u + ')' + (n - 1 === 1 ? '' : '^' + (n - 1)); }, name: '(\\,\\cdot\\,)^{' + n + '}', rule: 'the power rule, $' + ddx('u') + 'u^{' + n + '} = ' + n + 'u^{' + (n - 1) + '}$'.replace('u^{1}', 'u') }; }
  function negPowOut(n, k) { return { T: function (u) { return frac(k, '(' + u + ')^{' + n + '}'); }, P: function (u) { return k + '/(' + u + ')^' + n; }, dT: function (u) { return frac(-k * n, '(' + u + ')^{' + (n + 1) + '}'); }, dP: function (u) { return (-k * n) + '/(' + u + ')^' + (n + 1); }, coef: -k * n, neg: true, n: n, name: frac(k, '(\\,\\cdot\\,)^{' + n + '}'), rule: '$' + ddx('u') + ' ' + T.coef(k, 'u^{-' + n + '}') + ' = ' + T.coef(-k * n, 'u^{-' + (n + 1) + '}') + '$' }; }

  G('calc1.chain-rule', function (R, ctx) {
    var kind = lv(ctx, R.pick(['powlin', 'trig', 'powlin']), R.pick(['powquad', 'sqrt', 'trig', 'table', 'neg']), R.pick(['table', 'sqrt', 'trig2', 'powquad', 'neg']));
    if (kind === 'table') {
      var xs_ = [1, 2, 3, 4], fv = xs_.map(function () { return R.int(-4, 6); }), fpv = xs_.map(function () { return R.nz(-5, 5); }), gv = xs_.map(function () { return R.int(1, 4); }), gpv = xs_.map(function () { return R.nz(-5, 5); });
      var a = R.int(1, 4), ga = gv[a - 1], ans = fpv[ga - 1] * gpv[a - 1];
      if (ga === a) { gv[a - 1] = a === 4 ? 1 : a + 1; ga = gv[a - 1]; ans = fpv[ga - 1] * gpv[a - 1]; }
      return {
        q: 'Use the table to find $h\'(' + a + ')$ for $h(x) = f\\big(g(x)\\big)$. $$' + table(null, [['x', '1', '2', '3', '4'], ['f(x)'].concat(fv), ["f'(x)"].concat(fpv), ['g(x)'].concat(gv), ["g'(x)"].concat(gpv)]) + '$$',
        a: num(ans),
        steps: ['Chain rule: $h\'(x) = f\'\\big(g(x)\\big) \\cdot g\'(x)$. The outer derivative is evaluated at the inside value.',
          'First the inside: $g(' + a + ') = ' + ga + '$.',
          'Outer rate at that inside value: $f\'(' + ga + ') = ' + fpv[ga - 1] + '$. Inner rate: $g\'(' + a + ') = ' + gpv[a - 1] + '$.',
          'Multiply the rates: $h\'(' + a + ') = ' + tp(fpv[ga - 1]) + tp(gpv[a - 1]) + ' = ' + ans + '$. (Using $f\'(' + a + ')$ instead of $f\'(' + ga + ')$ is the classic slip.)'],
        hint: 'Find g(' + a + ') first; the outer derivative is taken there.', chk: { k: 'val', v: fpv[gv[a - 1] - 1] * gpv[a - 1] }
      };
    }
    var u, out, n;
    if (kind === 'powlin') { u = P([R.nz(-6, 6), R.pick([2, 3, 4, 5, -2, -3])]); n = R.int(3, 8); out = powOut(n); }
    else if (kind === 'powquad') { u = R.coin() ? P([R.nz(-5, 5), 0, R.nz(-3, 3)]) : P([R.nz(-5, 5), R.nz(-4, 4), 1]); n = R.int(2, 6); out = powOut(n); }
    else if (kind === 'sqrt') { u = R.coin() ? P([R.int(1, 9), 0, R.int(1, 4)]) : P([R.int(1, 9), R.int(1, 5)]); out = OUT.sqrt; }
    else if (kind === 'neg') { u = P([R.nz(-5, 5), R.int(2, 4)]); out = negPowOut(R.int(1, 3), R.pick([1, 2, 3, 5])); }
    else if (kind === 'trig') { u = P([R.int(-3, 3), R.pick([2, 3, 4, 5, 7, -2, -3])]); out = OUT[R.pick(['sin', 'cos', 'tan'])]; }
    else { u = P([R.int(-3, 3), 0, R.pick([1, 2, 3, -1])]); out = OUT[R.pick(['sin', 'cos'])]; }
    var up = u.d(), uT = u.tex(), uP = u.plain(), fT = out.T(uT), fP = out.P(uP);
    var ansP = '(' + out.dP(uP) + ')*(' + up.plain() + ')';
    if (up.terms() === 1) { // monomial inner rate: a clean product for the shown answer
      var cu0 = up.c[up.c.length - 1], xk = up.deg() === 0 ? '' : up.deg() === 1 ? 'x' : 'x^' + up.deg(), tot0 = cu0.mul(out.coef);
      if (out.sqrt) ansP = cmulP(cu0.div(2), (xk ? xk + '/' : '1/') + 'sqrt(' + uP + ')').replace('1/', '1/');
      else if (out.neg) ansP = cmulP(tot0, (xk ? xk + '/' : '1/') + '(' + uP + ')^' + (out.n + 1));
      else ansP = cmulP(tot0, (xk ? xk + '*' : '') + out.bodyP(uP));
    } else if (out.bodyP) ansP = cmulP(out.coef, '(' + up.plain() + ')*' + out.bodyP(uP));
    var ansT = out.dT(uT) + ' \\cdot ' + (up.terms() > 1 ? '(' + up.tex() + ')' : up.deg() === 0 ? tp(up.c[0]) : up.tex());
    if (up.terms() === 1) { // a monomial inner rate: collect the numbers in front
      var cu = up.c[up.c.length - 1], xp = up.deg() === 0 ? '' : up.deg() === 1 ? 'x' : 'x^{' + up.deg() + '}', tot = cu.mul(out.coef);
      ansT += ' = ' + (out.sqrt ? frac(T.coef(cu.div(2), xp) || '1', '\\sqrt{' + uT + '}') : out.neg ? frac(T.coef(tot, xp), '(' + uT + ')^{' + (out.n + 1) + '}') : T.coef(tot, xp + out.body(uT)));
    }
    return {
      q: 'Find $' + ddx() + '\\left[' + fT + '\\right]$.',
      a: expr(ansP),
      steps: ['Spot the layers. Inside: $u = ' + uT + '$. Outside: $' + out.name + '$.',
        'Outer rate: ' + out.rule + ', evaluated at the inside: $' + out.dT(uT) + '$.',
        'Inner rate: $' + frac('du', 'dx') + ' = ' + up.tex() + '$.',
        'Chain rule: multiply the rates. $' + frac('dy', 'dx') + ' = ' + frac('dy', 'du') + ' \\cdot ' + frac('du', 'dx') + ' = ' + ansT + '$.'],
      hint: 'Differentiate the outer layer (leave the inside alone), then multiply by the derivative of the inside.',
      chk: { k: 'd', f: fP }
    };
  });

  G('calc1.chain-rule-layers', function (R, ctx) {
    var t = lv(ctx, R.pick(['sinpow', 'sqrtsin', 'tansq']), R.pick(['cospow', 'sinsqrt', 'nested', 'sincos']), R.pick(['nested', 'cossin', 'sqrtsinsq', 'sincos']));
    var k = R.pick([2, 3, 4, 5]), n = R.int(2, 5), c = R.int(2, 5), fT, fP, layers, ansT, ansP;
    var kx = k + 'x';
    if (t === 'sinpow') { fT = '\\sin^{' + n + '}(' + kx + ')'; fP = 'sin(' + kx + ')^' + n; layers = ['$(\\,\\cdot\\,)^{' + n + '}$', '$\\sin(\\,\\cdot\\,)$', '$' + kx + '$']; ansT = n + '\\sin' + (n - 1 > 1 ? '^{' + (n - 1) + '}' : '') + '(' + kx + ') \\cdot \\cos(' + kx + ') \\cdot ' + k + ' = ' + (n * k) + '\\sin' + (n - 1 > 1 ? '^{' + (n - 1) + '}' : '') + '(' + kx + ')\\cos(' + kx + ')'; ansP = (n * k) + '*sin(' + kx + ')^' + (n - 1) + '*cos(' + kx + ')'; }
    else if (t === 'cospow') { var u = P([R.nz(-4, 4), 0, R.pick([1, 2, 3])]); fT = '\\cos^{' + n + '}(' + u.tex() + ')'; fP = 'cos(' + u.plain() + ')^' + n; layers = ['$(\\,\\cdot\\,)^{' + n + '}$', '$\\cos(\\,\\cdot\\,)$', '$' + u.tex() + '$']; ansT = n + '\\cos' + (n - 1 > 1 ? '^{' + (n - 1) + '}' : '') + '(' + u.tex() + ') \\cdot \\big(-\\sin(' + u.tex() + ')\\big) \\cdot ' + u.d().tex(); ansP = (-n) + '*cos(' + u.plain() + ')^' + (n - 1) + '*sin(' + u.plain() + ')*(' + u.d().plain() + ')'; }
    else if (t === 'sqrtsin') { fT = '\\sqrt{' + c + ' + \\sin(' + kx + ')}'; fP = 'sqrt(' + c + '+sin(' + kx + '))'; layers = ['$\\sqrt{\\,\\cdot\\,}$', '$' + c + ' + \\sin(\\,\\cdot\\,)$', '$' + kx + '$']; ansT = frac(1, '2\\sqrt{' + c + ' + \\sin(' + kx + ')}') + ' \\cdot \\cos(' + kx + ') \\cdot ' + k + ' = ' + (k % 2 ? frac(k + '\\cos(' + kx + ')', '2\\sqrt{' + c + ' + \\sin(' + kx + ')}') : frac((k / 2 === 1 ? '' : k / 2) + '\\cos(' + kx + ')', '\\sqrt{' + c + ' + \\sin(' + kx + ')}')); ansP = k % 2 ? k + '*cos(' + kx + ')/(2*sqrt(' + c + '+sin(' + kx + ')))' : (k / 2) + '*cos(' + kx + ')/sqrt(' + c + '+sin(' + kx + '))'; }
    else if (t === 'tansq') { fT = '\\tan^{2}(' + kx + ')'; fP = 'tan(' + kx + ')^2'; layers = ['$(\\,\\cdot\\,)^{2}$', '$\\tan(\\,\\cdot\\,)$', '$' + kx + '$']; ansT = '2\\tan(' + kx + ') \\cdot \\sec^{2}(' + kx + ') \\cdot ' + k + ' = ' + (2 * k) + '\\tan(' + kx + ')\\sec^{2}(' + kx + ')'; ansP = (2 * k) + '*tan(' + kx + ')*sec(' + kx + ')^2'; }
    else if (t === 'sinsqrt') { var a = R.int(1, 4), b = R.int(1, 9); fT = '\\sin\\left(\\sqrt{' + linT(a, b) + '}\\right)'; fP = 'sin(sqrt(' + linP(a, b) + '))'; layers = ['$\\sin(\\,\\cdot\\,)$', '$\\sqrt{\\,\\cdot\\,}$', '$' + linT(a, b) + '$']; ansT = '\\cos\\left(\\sqrt{' + linT(a, b) + '}\\right) \\cdot ' + frac(1, '2\\sqrt{' + linT(a, b) + '}') + ' \\cdot ' + a + ' = ' + frac((a === 1 ? '' : a) + '\\cos\\left(\\sqrt{' + linT(a, b) + '}\\right)', '2\\sqrt{' + linT(a, b) + '}'); ansP = a + '*cos(sqrt(' + linP(a, b) + '))/(2*sqrt(' + linP(a, b) + '))'; }
    else if (t === 'nested') { var m = R.int(2, 3), a2 = R.pick([2, 3, -2]), b2 = R.int(-3, 3), w = linT(a2, b2), wP = linP(a2, b2); fT = '\\left(1 + (' + w + ')^{' + m + '}\\right)^{' + n + '}'; fP = '(1+(' + wP + ')^' + m + ')^' + n; layers = ['$(\\,\\cdot\\,)^{' + n + '}$', '$1 + (\\,\\cdot\\,)^{' + m + '}$', '$' + w + '$']; ansT = n + '\\left(1 + (' + w + ')^{' + m + '}\\right)' + (n - 1 > 1 ? '^{' + (n - 1) + '}' : '') + ' \\cdot ' + m + '(' + w + ')' + (m - 1 > 1 ? '^{' + (m - 1) + '}' : '') + ' \\cdot ' + tp(a2); ansP = (n * m * a2) + '*(1+(' + wP + ')^' + m + ')^' + (n - 1) + '*(' + wP + ')^' + (m - 1); }
    else if (t === 'sincos') { fT = '\\sin\\big(\\cos(' + kx + ')\\big)'; fP = 'sin(cos(' + kx + '))'; layers = ['$\\sin(\\,\\cdot\\,)$', '$\\cos(\\,\\cdot\\,)$', '$' + kx + '$']; ansT = '\\cos\\big(\\cos(' + kx + ')\\big) \\cdot \\big(-\\sin(' + kx + ')\\big) \\cdot ' + k + ' = -' + k + '\\sin(' + kx + ')\\cos\\big(\\cos(' + kx + ')\\big)'; ansP = (-k) + '*sin(' + kx + ')*cos(cos(' + kx + '))'; }
    else if (t === 'cossin') { var a3 = R.pick([1, 2, 3]); fT = '\\cos\\big(\\sin(' + (a3 === 1 ? '' : a3) + 'x^{2})\\big)'; fP = 'cos(sin(' + a3 + 'x^2))'; layers = ['$\\cos(\\,\\cdot\\,)$', '$\\sin(\\,\\cdot\\,)$', '$' + (a3 === 1 ? '' : a3) + 'x^{2}$']; ansT = '-\\sin\\big(\\sin(' + (a3 === 1 ? '' : a3) + 'x^{2})\\big) \\cdot \\cos(' + (a3 === 1 ? '' : a3) + 'x^{2}) \\cdot ' + (2 * a3) + 'x'; ansP = (-2 * a3) + 'x*sin(sin(' + a3 + 'x^2))*cos(' + a3 + 'x^2)'; }
    else { fT = '\\sqrt{1 + \\sin^{2}(' + kx + ')}'; fP = 'sqrt(1+sin(' + kx + ')^2)'; layers = ['$\\sqrt{\\,\\cdot\\,}$', '$1 + (\\,\\cdot\\,)^{2}$', '$\\sin(\\,\\cdot\\,)$', '$' + kx + '$']; ansT = frac(1, '2\\sqrt{1 + \\sin^{2}(' + kx + ')}') + ' \\cdot 2\\sin(' + kx + ') \\cdot \\cos(' + kx + ') \\cdot ' + k + ' = ' + frac(k + '\\sin(' + kx + ')\\cos(' + kx + ')', '\\sqrt{1 + \\sin^{2}(' + kx + ')}'); ansP = k + '*sin(' + kx + ')*cos(' + kx + ')/sqrt(1+sin(' + kx + ')^2)'; }
    return {
      q: 'Find $' + ddx() + '\\left[' + fT + '\\right]$.',
      a: expr(cl(ansP)),
      steps: ['Peel the layers from the outside in: ' + layers.join(', then ') + '.',
        'Differentiate each layer at whatever is inside it, leaving the inside untouched, and multiply all the factors (one per layer).',
        '$' + frac('dy', 'dx') + ' = ' + ansT + '$.'],
      hint: 'There are ' + layers.length + ' layers, so the answer is a product of ' + layers.length + ' factors.',
      chk: { k: 'd', f: cl(fP) }
    };
  });

  G('calc1.exp-log-derivatives', function (R, ctx) {
    var t = lv(ctx, R.pick(['ekx', 'lnlin', 'ekx']), R.pick(['equad', 'lnquad', 'xe', 'base', 'xln']), R.pick(['lnsin', 'xe', 'logb', 'esin', 'equot']));
    var k = R.intNot(-5, 6, [0, 1]), a = R.nz(-5, 6), fT, fP, ansP, st;
    if (t === 'ekx') { fT = T.coef(a, 'e^{' + T.coef(k, 'x') + '}'); fP = a + '*e^(' + k + 'x)'; ansP = (a * k) + '*e^(' + k + 'x)'; st = ['$e^{u}$ is its own derivative, but here the exponent is $u = ' + T.coef(k, 'x') + '$, so the chain rule adds a factor $' + frac('du', 'dx') + ' = ' + k + '$.', '$' + ddx() + '\\left[' + fT + '\\right] = ' + tx(a) + ' \\cdot e^{' + T.coef(k, 'x') + '} \\cdot ' + tp(k) + ' = ' + T.coef(a * k, 'e^{' + T.coef(k, 'x') + '}') + '$.']; }
    else if (t === 'lnlin') { var b = R.nz(-6, 6), m = R.int(2, 5); fT = '\\ln(' + linT(m, b) + ')'; fP = 'ln(' + linP(m, b) + ')'; ansP = m + '/(' + linP(m, b) + ')'; st = ['$' + ddx('u') + '\\ln u = ' + frac(1, 'u') + '$, with $u = ' + linT(m, b) + '$ and $' + frac('du', 'dx') + ' = ' + m + '$.', 'Chain rule: $' + frac(1, linT(m, b)) + ' \\cdot ' + tp(m) + ' = ' + frac(m, linT(m, b)) + '$.']; }
    else if (t === 'equad') { var u = P([0, R.int(-4, 4), R.nz(-3, 3)]); fT = 'e^{' + u.tex() + '}'; fP = 'e^(' + u.plain() + ')'; ansP = '(' + u.d().plain() + ')*e^(' + u.plain() + ')'; st = ['Outer layer $e^{u}$ (derivative $e^{u}$), inner layer $u = ' + u.tex() + '$ (derivative $' + u.d().tex() + '$).', 'Chain rule: $' + u.d().ptex() + 'e^{' + u.tex() + '}$.']; }
    else if (t === 'lnquad') { var c = R.int(1, 9), A = R.pick([1, 2, 3]); fT = '\\ln(' + T.coef(A, 'x^{2}') + ' + ' + c + ')'; fP = 'ln(' + A + 'x^2+' + c + ')'; ansP = (2 * A) + 'x/(' + A + 'x^2+' + c + ')'; st = ['$' + ddx('u') + '\\ln u = ' + frac(1, 'u') + '$ with $u = ' + T.coef(A, 'x^{2}') + ' + ' + c + '$, $' + frac('du', 'dx') + ' = ' + T.coef(2 * A, 'x') + '$.', 'So the derivative is $' + frac(T.coef(2 * A, 'x'), T.coef(A, 'x^{2}') + ' + ' + c) + '$: the derivative of the inside over the inside.']; }
    else if (t === 'xe') { var n = R.int(1, 3), xn = xpw(n), ek = 'e^{' + T.coef(k, 'x') + '}'; fT = xn + ek; fP = 'x^' + n + '*e^(' + k + 'x)'; ansP = '(' + n + '*x^' + (n - 1) + '+' + k + '*x^' + n + ')*e^(' + k + 'x)'; st = ['Product rule: $(' + xn + ')\' = ' + T.coef(n, xpw(n - 1)) + '$ and $(' + ek + ')\' = ' + T.coef(k, ek) + '$ (chain rule).', '$' + T.coef(n, xpw(n - 1) + ek) + T.coef(k, xn + ek, false) + ' = ' + xpw(n - 1) + '(' + linT(k, n) + ')' + ek + '$.']; }
    else if (t === 'xln') { var n2 = R.int(1, 4), xn2 = xpw(n2); fT = xn2 + '\\ln x'; fP = 'x^' + n2 + '*ln(x)'; ansP = n2 + '*x^' + (n2 - 1) + '*ln(x)+x^' + (n2 - 1); st = ['Product rule with $' + xn2 + '$ and $\\ln x$ (derivative $' + frac(1, 'x') + '$).', '$' + T.coef(n2, xpw(n2 - 1) + '\\ln x') + ' + ' + xn2 + ' \\cdot ' + frac(1, 'x') + ' = ' + T.coef(n2, xpw(n2 - 1) + '\\ln x') + ' + ' + (xpw(n2 - 1) || '1') + '$.']; }
    else if (t === 'base') { var B = R.pick([2, 3, 5, 10]), kk = R.pick([1, 1, 2, 3]); fT = B + '^{' + (kk === 1 ? '' : kk) + 'x}'; fP = B + '^(' + kk + 'x)'; ansP = kk + '*' + B + '^(' + kk + 'x)*ln(' + B + ')'; st = ['Write $' + B + ' = e^{\\ln ' + B + '}$, so $' + fT + ' = e^{' + (kk === 1 ? '' : kk) + '(\\ln ' + B + ')x}$.', 'Differentiate: $e^{' + (kk === 1 ? '' : kk) + '(\\ln ' + B + ')x} \\cdot ' + (kk === 1 ? '' : kk) + '\\ln ' + B + ' = ' + (kk === 1 ? '' : kk + ' \\cdot ') + B + '^{' + (kk === 1 ? '' : kk) + 'x}\\ln ' + B + '$.', 'The power rule does not apply: the variable is in the exponent, not the base.']; }
    else if (t === 'logb') { var B2 = R.pick([2, 3, 5, 10]); fT = '\\log_{' + B2 + '} x'; fP = 'ln(x)/ln(' + B2 + ')'; ansP = '1/(x*ln(' + B2 + '))'; st = ['Change of base: $\\log_{' + B2 + '} x = ' + frac('\\ln x', '\\ln ' + B2) + '$, and $\\ln ' + B2 + '$ is just a constant.', 'So the derivative is $' + frac(1, '\\ln ' + B2) + ' \\cdot ' + frac(1, 'x') + ' = ' + frac(1, 'x\\ln ' + B2) + '$.']; }
    else if (t === 'lnsin') { var cs = R.coin(); fT = '\\ln(' + (cs ? '\\sin' : '\\cos') + ' x)'; fP = 'ln(' + (cs ? 'sin' : 'cos') + '(x))'; ansP = cs ? 'cos(x)/sin(x)' : '-sin(x)/cos(x)'; st = ['Derivative of the inside over the inside: $' + frac(cs ? '\\cos x' : '-\\sin x', cs ? '\\sin x' : '\\cos x') + '$.', 'That simplifies to $' + (cs ? '\\cot x' : '-\\tan x') + '$.']; }
    else if (t === 'esin') { var fn = R.pick(['sin', 'cos']); fT = 'e^{\\' + fn + ' x}'; fP = 'e^(' + fn + '(x))'; ansP = (fn === 'sin' ? 'cos(x)' : '-sin(x)') + '*e^(' + fn + '(x))'; st = ['Outer $e^{u}$, inner $u = \\' + fn + ' x$ with $u\' = ' + (fn === 'sin' ? '\\cos x' : '-\\sin x') + '$.', 'Chain rule: $' + (fn === 'sin' ? '\\cos x' : '-\\sin x') + '\\, e^{\\' + fn + ' x}$.']; }
    else { fT = frac('e^{x}', 'x'); fP = 'e^x/x'; ansP = 'e^x*(x-1)/x^2'; st = ['Quotient rule: $' + frac('e^{x} \\cdot x - e^{x} \\cdot 1', 'x^{2}') + '$.', 'Factor out $e^{x}$: $' + frac('e^{x}(x - 1)', 'x^{2}') + '$.']; }
    return { q: 'Find $' + ddx() + '\\left[' + fT + '\\right]$.', a: expr(cl(ansP)), steps: st, hint: t.indexOf('ln') >= 0 || t === 'logb' ? 'd/dx ln u = u′/u.' : 'd/dx e^u = e^u · u′. Don\'t forget the derivative of the exponent.', chk: { k: 'd', f: cl(fP) } };
  });

  function exactSlope(ans, x, y) { // evaluate a rational expression in x, y exactly (integers in, Q out)
    var r = ML.evalPlain(ans, { x: x, y: y });
    for (var d = 1; d <= 400; d++) { var n = Math.round(r * d); if (Math.abs(n / d - r) < 1e-9) return q(n).div(d); }
    return q(Math.round(r * 1000)).div(1000);
  }



  // ---- implicit differentiation: families of curves with parameters
  var DYDX = frac('dy', 'dx');
  function redFrac(nT, nP, a, b, vx, vy) { // -(a·vx)/(b·vy) reduced: returns [tex, plain]
    var g = gcd(abs(a), abs(b)) || 1; a /= g; b /= g; if (b < 0) { a = -a; b = -b; }
    var top = T.coef(abs(a), vx), bot = T.coef(b, vy), sign = a > 0 ? '-' : '';
    return [sign + (bot === vy && b === 1 ? frac(top, bot) : frac(top, bot)), (a > 0 ? '-' : '') + '(' + abs(a) + '*' + vx + ')/(' + b + '*' + vy + ')'];
  }
  function pw(v, k) { return k === 0 ? '' : k === 1 ? v : v + '^{' + k + '}'; }
  function implicitFamily(R, which) {
    var x0, y0, F, T_, ans, ansT, st, eqT;
    if (which === 'ellipse') {
      var a = R.int(1, 5), b = R.int(1, 5); x0 = R.nz(-4, 4); y0 = R.nz(-4, 4);
      var c = a * x0 * x0 + b * y0 * y0, r = redFrac(null, null, a, b, 'x', 'y');
      F = a + '*x^2+' + b + '*y^2'; eqT = T.coef(a, 'x^{2}') + ' + ' + T.coef(b, 'y^{2}') + ' = ' + c; ansT = r[0]; ans = r[1];
      st = ['$' + T.coef(2 * a, 'x') + ' + ' + T.coef(2 * b, 'y') + '\\,' + DYDX + ' = 0$ (the $y^{2}$ term gives $2y\\,' + DYDX + '$ by the chain rule)', '$' + T.coef(2 * b, 'y') + '\\,' + DYDX + ' = ' + T.coef(-2 * a, 'x') + '$'];
    } else if (which === 'mixed') {
      var k = R.pick([1, 3, -1, -3]);
      do { x0 = R.int(-3, 3); y0 = R.int(-3, 3); } while (k * x0 + 2 * y0 === 0 || (!x0 && !y0));
      F = 'x^2+' + k + '*x*y+y^2'; eqT = 'x^{2}' + T.coef(k, 'xy', false) + ' + y^{2} = ' + (x0 * x0 + k * x0 * y0 + y0 * y0);
      ans = '-(2x+' + k + '*y)/(' + k + '*x+2y)'; ansT = '-' + frac('2x' + T.coef(k, 'y', false), T.coef(k, 'x') + ' + 2y');
      st = ['$2x' + (k === 1 ? ' + ' : k === -1 ? ' - ' : (k < 0 ? ' - ' : ' + ') + abs(k)) + '\\left(y + x\\,' + DYDX + '\\right) + 2y\\,' + DYDX + ' = 0$ (product rule on $xy$)', '$(' + T.coef(k, 'x') + ' + 2y)\\,' + DYDX + ' = -(2x' + T.coef(k, 'y', false) + ')$'];
    } else if (which === 'power') {
      var m = R.int(1, 3), n = R.int(1, 3); if (m === 1 && n === 1 && R.coin()) n = 2;
      x0 = R.pick([1, 2, -1, -2]); y0 = R.pick([1, 2, 3, -1]);
      var cc = Math.pow(x0, m) * Math.pow(y0, n), r2 = redFrac(null, null, m, n, 'y', 'x');
      var xm_ = m === 1 ? 'x' : 'x^{' + m + '}', yn = n === 1 ? 'y' : 'y^{' + n + '}';
      F = 'x^' + m + '*y^' + n; eqT = xm_ + yn + ' = ' + cc; ansT = r2[0]; ans = r2[1];
      st = ['Product rule: $' + T.coef(m, pw('x', m - 1) + pw('y', n)) + ' + ' + T.coef(n, pw('x', m) + pw('y', n - 1)) + '\\,' + DYDX + ' = 0$',
        'Divide through by $' + (m - 1 > 0 ? (m - 1 === 1 ? 'x' : 'x^{' + (m - 1) + '}') : '') + (n - 1 > 0 ? (n - 1 === 1 ? 'y' : 'y^{' + (n - 1) + '}') : '') + '$' + (m - 1 > 0 || n - 1 > 0 ? '' : ' (nothing to divide)') + ': $' + T.coef(m, 'y') + ' + ' + T.coef(n, 'x') + '\\,' + DYDX + ' = 0$'];
      if (m === 1 && n === 1) st[1] = '$y + x\\,' + DYDX + ' = 0$, so $x\\,' + DYDX + ' = -y$';
    } else if (which === 'cubic') {
      var k2 = R.int(-4, 4); x0 = R.int(-1, 3); y0 = R.nz(-4, 4); var d = y0 * y0 - x0 * x0 * x0 - k2 * x0;
      F = 'y^2-x^3-' + '(' + k2 + ')*x'; eqT = 'y^{2} = ' + P([d, k2, 0, 1]).tex();
      ans = '(3x^2+' + k2 + ')/(2y)'; ansT = frac('3x^{2}' + sg(k2), '2y');
      st = ['$2y\\,' + DYDX + ' = 3x^{2}' + sg(k2) + '$ (the constant on the right has derivative 0)', 'Divide by $2y$'];
      if (!k2) { ans = '3x^2/(2y)'; ansT = frac('3x^{2}', '2y'); }
    } else if (which === 'ycube') {
      var k3 = R.pick([1, 2, 3, -1, -2]);
      do { x0 = R.int(-3, 3); y0 = R.nz(-3, 3); } while (3 * y0 * y0 + k3 * x0 === 0);
      F = 'y^3+' + k3 + '*x*y'; eqT = 'y^{3}' + T.coef(k3, 'xy', false) + ' = ' + (y0 * y0 * y0 + k3 * x0 * y0);
      ans = '-(' + k3 + '*y)/(3y^2+' + k3 + '*x)'; ansT = '-' + frac(T.coef(k3, 'y'), '3y^{2}' + T.coef(k3, 'x', false));
      st = ['$3y^{2}\\,' + DYDX + (k3 === 1 ? ' + ' : k3 === -1 ? ' - ' : (k3 < 0 ? ' - ' : ' + ') + abs(k3)) + '\\left(y + x\\,' + DYDX + '\\right) = 0$', '$(3y^{2}' + T.coef(k3, 'x', false) + ')\\,' + DYDX + ' = ' + T.coef(-k3, 'y') + '$'];
    } else if (which === 'x2y') {
      var a3 = R.int(1, 3); x0 = R.nz(-3, 3); y0 = R.nz(-2, 2);
      F = 'x^2*y+' + a3 + '*y^3'; eqT = 'x^{2}y + ' + T.coef(a3, 'y^{3}') + ' = ' + (x0 * x0 * y0 + a3 * y0 * y0 * y0);
      ans = '-2x*y/(x^2+' + (3 * a3) + '*y^2)'; ansT = '-' + frac('2xy', 'x^{2} + ' + (3 * a3) + 'y^{2}');
      st = ['$2xy + x^{2}\\,' + DYDX + ' + ' + (3 * a3) + 'y^{2}\\,' + DYDX + ' = 0$ (product rule on $x^{2}y$)', '$(x^{2} + ' + (3 * a3) + 'y^{2})\\,' + DYDX + ' = -2xy$'];
    } else {
      x0 = 3; y0 = 3; F = 'x^3+y^3-6*x*y'; eqT = 'x^{3} + y^{3} = 6xy'; ans = '(2y-x^2)/(y^2-2x)'; ansT = frac('2y - x^{2}', 'y^{2} - 2x');
      st = ['$3x^{2} + 3y^{2}\\,' + DYDX + ' = 6\\left(y + x\\,' + DYDX + '\\right)$', '$(3y^{2} - 6x)\\,' + DYDX + ' = 6y - 3x^{2}$; divide by 3'];
      which = 'folium';
    }
    var Fv = ML.evalPlain(F, { x: x0, y: y0 });
    return { F: F, Fc: F + '-(' + Fv + ')', eqT: eqT, ans: ans, ansT: ansT, st: st, x0: x0, y0: y0 };
  }
  G('calc1.implicit-differentiation', function (R, ctx) {
    var fam = R.pick(lv(ctx, ['ellipse', 'power', 'ellipse'], ['ellipse', 'mixed', 'power', 'cubic', 'ycube'], ['mixed', 'cubic', 'ycube', 'x2y', 'folium']));
    var C = implicitFamily(R, fam), askSlope = lv(ctx, R.chance(0.3), R.coin(), R.chance(0.6));
    var st = ['Differentiate both sides with respect to $x$, treating $y$ as a function of $x$. Every piece with $y$ in it picks up a factor $' + DYDX + '$ from the chain rule.', C.st[0] + '.', C.st[1] + '.', 'Solve: $' + DYDX + ' = ' + C.ansT + '$.'];
    if (askSlope) {
      var sv = exactSlope(C.ans, C.x0, C.y0);
      st.push('At $(' + C.x0 + ', ' + C.y0 + ')$: $' + DYDX + ' = ' + tx(sv) + '$.');
      return { q: 'The point $(' + C.x0 + ', ' + C.y0 + ')$ is on the curve $' + C.eqT + '$. Find the slope of the tangent line there.', a: num(sv), steps: st, hint: 'Differentiate both sides, collect the dy/dx terms, then substitute the point.', chk: { k: 'islope', F: C.Fc, x0: C.x0, y0: C.y0 } };
    }
    return { q: 'Find $' + DYDX + '$ in terms of $x$ and $y$ for the curve $' + C.eqT + '$.', a: expr(cl(C.ans), ['x', 'y']), steps: st, hint: 'The derivative of y² with respect to x is 2y · dy/dx, not just 2y.', chk: { k: 'implicit', F: C.F } };
  });

  G('calc1.inverse-derivatives', function (R, ctx) {
    var t = lv(ctx, R.pick(['asin', 'atanlin', 'atanlin', 'overa']), R.pick(['atansq', 'acos', 'xatan', 'overa', 'inv', 'inv']), R.pick(['inv', 'inv', 'xatan', 'atansqrt', 'at', 'xasin']));
    var k = R.pick([2, 3, 4, 5]), c = R.pick([1, 1, 2, 3, -1]), fT, fP, ansP, st;
    if (t === 'inv') {
      var deg = R.pick([3, 3, 5]), p = R.int(1, 4), c0 = R.int(-5, 5), a = R.pick(deg === 5 ? [-1, 0, 1] : [-1, 0, 1, 2]), coeffs = [c0, p]; while (coeffs.length < deg) coeffs.push(0); coeffs.push(1);
      var f = P(coeffs), b = f.at(a), fp = f.d(), v = q(1).div(fp.at(a));
      return {
        q: 'Let $f(x) = ' + f.tex() + '$, which is one-to-one. Find $(f^{-1})\'(' + tx(b) + ')$.',
        a: num(v),
        steps: ['Formula: $(f^{-1})\'(b) = ' + frac(1, 'f\'\\big(f^{-1}(b)\\big)') + '$. The slope of the inverse is the reciprocal of the slope of $f$ at the matching point.',
          'Find the matching point: solve $f(x) = ' + tx(b) + '$. Trying small numbers, $f(' + a + ') = ' + f.subT(a) + ' = ' + tx(b) + '$, so $f^{-1}(' + tx(b) + ') = ' + a + '$.',
          '$f\'(x) = ' + fp.tex() + '$, so $f\'(' + a + ') = ' + tx(fp.at(a)) + '$.',
          '$(f^{-1})\'(' + tx(b) + ') = ' + frac(1, tx(fp.at(a))) + '$. (Using $f\'(' + tx(b) + ')$ here is the common mistake.)'],
        hint: 'First find which x has f(x) = ' + tx(b) + '. The derivative of f is taken there.', chk: { k: 'inv', f: f.plain(), b: b.toNumber() }
      };
    }
    if (t === 'at') {
      var which = R.pick(['atan', 'atan', 'asin']), x0 = q(R.pick(which === 'atan' ? [1, 2, 3, '1/2', -1, -2, '1/3'] : ['1/2', '-1/2', 0])), vP, vT;
      if (which === 'atan') { var val = q(1).div(q(1).add(x0.mul(x0))); vP = pl(val); vT = tx(val); }
      else { vP = x0.isZero() ? '1' : '2/sqrt(3)'; vT = x0.isZero() ? '1' : frac(2, '\\sqrt{3}') + ' = ' + frac('2\\sqrt{3}', 3); }
      return {
        q: 'Find the slope of $y = ' + (which === 'atan' ? '\\arctan x' : '\\arcsin x') + '$ at $x = ' + tx(x0) + '$.',
        a: num(vP),
        steps: [which === 'atan' ? '$' + ddx() + '\\arctan x = ' + frac(1, '1 + x^{2}') + '$.' : '$' + ddx() + '\\arcsin x = ' + frac(1, '\\sqrt{1 - x^{2}}') + '$.',
          'At $x = ' + tx(x0) + '$: $' + (which === 'atan' ? frac(1, '1 + ' + tp(x0) + '^{2}') : frac(1, '\\sqrt{1 - ' + tp(x0) + '^{2}}')) + ' = ' + vT + '$.'],
        hint: 'Use the derivative formula, then substitute.', chk: { k: 'dat', f: which + '(x)', x: x0.toNumber() }
      };
    }
    var cT = c === 1 ? '' : c === -1 ? '-' : String(c);
    if (t === 'asin') { fT = cT + '\\arcsin(' + k + 'x)'; fP = c + '*asin(' + k + 'x)'; ansP = (c * k) + '/sqrt(1-' + (k * k) + 'x^2)'; st = ['$' + ddx('u') + '\\arcsin u = ' + frac(1, '\\sqrt{1 - u^{2}}') + '$, with $u = ' + k + 'x$ and $u\' = ' + k + '$.', '$' + cT + frac(1, '\\sqrt{1 - (' + k + 'x)^{2}}') + ' \\cdot ' + k + ' = ' + frac(c * k, '\\sqrt{1 - ' + (k * k) + 'x^{2}}') + '$.']; }
    else if (t === 'acos') { fT = '\\arccos(' + k + 'x)'; fP = 'acos(' + k + 'x)'; ansP = -k + '/sqrt(1-' + (k * k) + 'x^2)'; st = ['$' + ddx('u') + '\\arccos u = -' + frac(1, '\\sqrt{1 - u^{2}}') + '$, with $u = ' + k + 'x$ and $u\' = ' + k + '$.', '$-' + frac(k, '\\sqrt{1 - ' + (k * k) + 'x^{2}}') + '$.']; }
    else if (t === 'atanlin') { var kk = R.int(1, 5), bb = kk === 1 ? R.nz(-3, 3) : R.int(-3, 3), u = linT(kk, bb); fT = cT + '\\arctan(' + u + ')'; fP = c + '*atan(' + linP(kk, bb) + ')'; ansP = (c * kk) + '/(1+(' + linP(kk, bb) + ')^2)'; st = ['$' + ddx('u') + '\\arctan u = ' + frac(1, '1 + u^{2}') + '$, with $u = ' + u + '$ and $u\' = ' + kk + '$.', '$' + cT + frac(1, '1 + (' + u + ')^{2}') + ' \\cdot ' + kk + ' = ' + frac(c * kk, '1 + (' + u + ')^{2}') + '$.']; }
    else if (t === 'overa') { var A = R.int(2, 6), tn = R.coin(); fT = (tn ? '\\arctan' : '\\arcsin') + '\\left(' + frac('x', A) + '\\right)'; fP = (tn ? 'atan' : 'asin') + '(x/' + A + ')'; ansP = tn ? A + '/(' + (A * A) + '+x^2)' : '1/sqrt(' + (A * A) + '-x^2)';
      st = tn ? ['$u = ' + frac('x', A) + '$, $u\' = ' + frac(1, A) + '$: $' + frac(1, '1 + x^{2}/' + (A * A)) + ' \\cdot ' + frac(1, A) + '$.', 'Multiply top and bottom by $' + (A * A) + '$: $' + frac(A, (A * A) + ' + x^{2}') + '$.']
        : ['$u = ' + frac('x', A) + '$, $u\' = ' + frac(1, A) + '$: $' + frac(1, '\\sqrt{1 - x^{2}/' + (A * A) + '}') + ' \\cdot ' + frac(1, A) + '$.', 'Since $' + A + '\\sqrt{1 - x^{2}/' + (A * A) + '} = \\sqrt{' + (A * A) + ' - x^{2}}$, this is $' + frac(1, '\\sqrt{' + (A * A) + ' - x^{2}}') + '$.']; }
    else if (t === 'atansq') { var s2 = R.coin(), m = R.pick([1, 2, 3]); var mx = m === 1 ? 'x^{2}' : m + 'x^{2}'; fT = (s2 ? '\\arctan(' : '\\arcsin(') + mx + ')'; fP = (s2 ? 'atan(' : 'asin(') + m + 'x^2)'; ansP = s2 ? (2 * m) + 'x/(1+' + (m * m) + 'x^4)' : (2 * m) + 'x/sqrt(1-' + (m * m) + 'x^4)'; st = ['Inner $u = ' + mx + '$, $u\' = ' + (2 * m) + 'x$.', s2 ? '$' + frac(1, '1 + (' + mx + ')^{2}') + ' \\cdot ' + (2 * m) + 'x = ' + frac((2 * m) + 'x', '1 + ' + (m * m === 1 ? '' : m * m) + 'x^{4}') + '$.' : '$' + frac(1, '\\sqrt{1 - (' + mx + ')^{2}}') + ' \\cdot ' + (2 * m) + 'x = ' + frac((2 * m) + 'x', '\\sqrt{1 - ' + (m * m === 1 ? '' : m * m) + 'x^{4}}') + '$.']; }
    else if (t === 'xatan') { var kx = R.pick([1, 2, 3]), kxT = kx === 1 ? 'x' : kx + 'x'; fT = 'x\\arctan(' + kxT + ')'; fP = 'x*atan(' + kx + 'x)'; ansP = 'atan(' + kx + 'x)+' + kx + 'x/(1+' + (kx * kx) + 'x^2)'; st = ['Product rule: $1 \\cdot \\arctan(' + kxT + ') + x \\cdot ' + frac(kx, '1 + ' + (kx === 1 ? '' : kx * kx) + 'x^{2}') + '$.', '$= \\arctan(' + kxT + ') + ' + frac(kxT, '1 + ' + (kx === 1 ? '' : kx * kx) + 'x^{2}') + '$.']; }
    else if (t === 'xasin') { fT = 'x\\arcsin x'; fP = 'x*asin(x)'; ansP = 'asin(x)+x/sqrt(1-x^2)'; st = ['Product rule: $1 \\cdot \\arcsin x + x \\cdot ' + frac(1, '\\sqrt{1 - x^{2}}') + '$.', '$= \\arcsin x + ' + frac('x', '\\sqrt{1 - x^{2}}') + '$.']; }
    else { var mm = R.pick([1, 2, 3]); fT = '\\arctan\\left(\\sqrt{' + (mm === 1 ? '' : mm) + 'x}\\right)'; fP = 'atan(sqrt(' + mm + 'x))'; ansP = mm + '/(2*sqrt(' + mm + 'x)*(1+' + mm + 'x))'; st = ['Inner $u = \\sqrt{' + (mm === 1 ? '' : mm) + 'x}$, $u\' = ' + frac(mm, '2\\sqrt{' + (mm === 1 ? '' : mm) + 'x}') + '$, and $1 + u^{2} = 1 + ' + (mm === 1 ? '' : mm) + 'x$.', '$' + frac(1, '1 + ' + (mm === 1 ? '' : mm) + 'x') + ' \\cdot ' + frac(mm, '2\\sqrt{' + (mm === 1 ? '' : mm) + 'x}') + ' = ' + frac(mm, '2\\sqrt{' + (mm === 1 ? '' : mm) + 'x}\\,(1 + ' + (mm === 1 ? '' : mm) + 'x)') + '$.']; }
    return { q: 'Find $' + ddx() + '\\left[' + fT + '\\right]$.', a: expr(cl(ansP)), steps: st, hint: 'd/dx arcsin u = u′/√(1 − u²), d/dx arctan u = u′/(1 + u²).', chk: { k: 'd', f: cl(fP), pts: [-0.15, -0.09, 0.03, 0.11, 0.17, 0.6, 1.3, 2.2, -1.4] } };
  });

  G('calc1.log-differentiation', function (R, ctx) {
    var t = lv(ctx, R.pick(['xx', 'xpow', 'xpow', 'at']), R.pick(['xpow', 'xsq', 'xsin', 'at', 'xpow']), R.pick(['xinv', 'prod', 'xsin', 'baseq', 'lnx', 'prod', 'xpow']));
    var fT, fP, ansP, st, k = R.int(2, 9);
    if (t === 'at') {
      var form = R.pick(['xx', 'xpow', 'xpow']), a = form === 'xx' ? R.pick([1, 2, 3]) : 1, kk = R.int(1, 6), cc = R.int(-5, 5), val, fT0, fP0, lines;
      if (kk === 1 && cc === 0) cc = 3;
      if (form === 'xx') { fT0 = 'x^{x}'; fP0 = 'x^x'; val = a === 1 ? '1' : Math.pow(a, a) + '*ln(' + a + ')+' + Math.pow(a, a); lines = ['$\\ln y = x\\ln x$, so $' + frac('y\'', 'y') + ' = \\ln x + 1$ and $y\' = x^{x}(\\ln x + 1)$.', 'At $x = ' + a + '$: $' + a + '^{' + a + '}(\\ln ' + a + ' + 1) = ' + (a === 1 ? '1 \\cdot (0 + 1) = 1' : Math.pow(a, a) + '\\ln ' + a + ' + ' + Math.pow(a, a)) + '$.']; }
      else { var eT = linT(kk, cc); fT0 = 'x^{' + eT + '}'; fP0 = 'x^(' + linP(kk, cc) + ')'; val = String(kk + cc); lines = ['$\\ln y = (' + eT + ')\\ln x$, so $' + frac('y\'', 'y') + ' = ' + T.coef(kk, '\\ln x') + ' + ' + frac(eT, 'x') + '$.', 'At $x = 1$: $y = 1^{' + (kk + cc) + '} = 1$ and $\\ln 1 = 0$, so $y\'(1) = 1 \\cdot \\left(0' + sg(kk + cc) + '\\right) = ' + (kk + cc) + '$.']; }
      return { q: 'Let $f(x) = ' + fT0 + '$ for $x > 0$. Find $f\'(' + a + ')$ exactly.', a: num(cl(val)), steps: ['Take logs of $y = ' + fT0 + '$ and differentiate implicitly.'].concat(lines), hint: 'Take ln of both sides first.', chk: { k: 'dat', f: cl(fP0), x: a } };
    }
    if (t === 'prod') {
      var aa = R.int(1, 3), bb = R.int(1, 3), c3 = R.int(1, 2), y1 = q(Math.pow(2, bb)).div(Math.pow(3, c3)), lp = q(aa).add(q(bb).div(2)).sub(q(c3).div(3)), v = y1.mul(lp);
      return {
        q: ('Let $y = ' + frac('x^{' + aa + '}(x + 1)^{' + bb + '}', '(x + 2)^{' + c3 + '}') + '$. Use logarithmic differentiation to find $y\'(1)$.').replace(/\^\{1\}/g, ''),
        a: num(v),
        steps: ['Take logs and expand: $\\ln y = ' + T.coef(aa, '\\ln x') + T.coef(bb, '\\ln(x + 1)', false) + T.coef(-c3, '\\ln(x + 2)', false) + '$.',
          'Differentiate: $' + frac('y\'', 'y') + ' = ' + frac(aa, 'x') + ' + ' + frac(bb, 'x + 1') + ' - ' + frac(c3, 'x + 2') + '$.',
          'At $x = 1$: $y(1) = ' + frac('1 \\cdot 2^{' + bb + '}', '3^{' + c3 + '}') + ' = ' + tx(y1) + '$ and $' + frac('y\'', 'y') + ' = ' + aa + ' + ' + frac(bb, 2) + ' - ' + frac(c3, 3) + ' = ' + tx(lp) + '$.',
          '$y\'(1) = ' + tx(y1) + ' \\cdot ' + tx(lp) + ' = ' + tx(v) + '$.'],
        hint: 'Logs turn the product and quotient into a sum and difference.', chk: { k: 'dat', f: 'x^' + aa + '*(x+1)^' + bb + '/(x+2)^' + c3, x: 1 }
      };
    }
    if (t === 'xx') { fT = 'x^{x}'; fP = 'x^x'; ansP = 'x^x*(ln(x)+1)'; st = ['Let $y = x^{x}$. Take $\\ln$ of both sides: $\\ln y = x\\ln x$.', 'Differentiate both sides (the left by the chain rule): $' + frac(1, 'y') + '\\,y\' = \\ln x + x \\cdot ' + frac(1, 'x') + ' = \\ln x + 1$.', 'Multiply by $y$: $y\' = x^{x}(\\ln x + 1)$.']; }
    else if (t === 'xpow') { var ka = R.int(1, 6), kb = R.int(-5, 5); if (ka === 1 && kb === 0) kb = R.pick([-2, 3]); var eT2 = linT(ka, kb); fT = 'x^{' + eT2 + '}'; fP = 'x^(' + linP(ka, kb) + ')'; ansP = 'x^(' + linP(ka, kb) + ')*(' + ka + '*ln(x)+' + ka + '+' + kb + '/x)'; st = ['$\\ln y = (' + eT2 + ')\\ln x$.', 'Product rule on the right: $' + frac('y\'', 'y') + ' = ' + T.coef(ka, '\\ln x') + ' + (' + eT2 + ') \\cdot ' + frac(1, 'x') + ' = ' + T.coef(ka, '\\ln x') + ' + ' + ka + (kb ? (kb < 0 ? ' - ' : ' + ') + frac(abs(kb), 'x') : '') + '$.', 'Multiply by $y$: $y\' = x^{' + eT2 + '}\\left(' + T.coef(ka, '\\ln x') + ' + ' + ka + (kb ? (kb < 0 ? ' - ' : ' + ') + frac(abs(kb), 'x') : '') + '\\right)$.']; }
    else if (t === 'xkx') { fT = 'x^{' + k + 'x}'; fP = 'x^(' + k + 'x)'; ansP = 'x^(' + k + 'x)*' + k + '*(ln(x)+1)'; st = ['$\\ln y = ' + k + 'x\\ln x$.', '$' + frac('y\'', 'y') + ' = ' + k + '\\ln x + ' + k + 'x \\cdot ' + frac(1, 'x') + ' = ' + k + '(\\ln x + 1)$.', '$y\' = ' + k + 'x^{' + k + 'x}(\\ln x + 1)$.']; }
    else if (t === 'xpc') { var c = R.nz(-5, 5); fT = 'x^{x' + sg(c) + '}'; fP = 'x^(x+' + c + ')'; ansP = 'x^(x+' + c + ')*(ln(x)+1+' + c + '/x)'; st = ['$\\ln y = (x' + sg(c) + ')\\ln x$.', 'Product rule: $' + frac('y\'', 'y') + ' = \\ln x + (x' + sg(c) + ') \\cdot ' + frac(1, 'x') + ' = \\ln x + 1' + (c < 0 ? ' - ' : ' + ') + frac(abs(c), 'x') + '$.', '$y\' = x^{x' + sg(c) + '}\\left(\\ln x + 1' + (c < 0 ? ' - ' : ' + ') + frac(abs(c), 'x') + '\\right)$.']; }
    else if (t === 'xsq') { var am = R.int(1, 3), ax = am === 1 ? 'x^{2}' : am + 'x^{2}'; fT = 'x^{' + ax + '}'; fP = 'x^(' + am + 'x^2)'; ansP = 'x^(' + am + 'x^2)*(' + (2 * am) + 'x*ln(x)+' + am + 'x)'; st = ['$\\ln y = ' + ax + '\\ln x$.', '$' + frac('y\'', 'y') + ' = ' + (2 * am) + 'x\\ln x + ' + ax + ' \\cdot ' + frac(1, 'x') + ' = ' + (2 * am) + 'x\\ln x + ' + (am === 1 ? '' : am) + 'x$.', '$y\' = x^{' + ax + '}(' + (2 * am) + 'x\\ln x + ' + (am === 1 ? '' : am) + 'x)$.']; }
    else if (t === 'xsin') { var fn = R.pick(['sin', 'cos']), m2 = R.pick([1, 1, 2, 3]), arg = m2 === 1 ? 'x' : m2 + 'x', argT = m2 === 1 ? ' x' : '(' + m2 + 'x)', dT = (fn === 'sin' ? '' : '-') + (m2 === 1 ? '' : m2) + '\\' + (fn === 'sin' ? 'cos' : 'sin') + argT; fT = 'x^{\\' + fn + argT + '}'; fP = 'x^(' + fn + '(' + arg + '))'; ansP = 'x^(' + fn + '(' + arg + '))*(' + (fn === 'sin' ? '' : '-') + m2 + '*' + (fn === 'sin' ? 'cos' : 'sin') + '(' + arg + ')*ln(x)+' + fn + '(' + arg + ')/x)'; st = ['$\\ln y = \\' + fn + argT + ' \\cdot \\ln x$.', 'Product rule on the right: $' + frac('y\'', 'y') + ' = ' + dT + '\\ln x + ' + frac('\\' + fn + argT, 'x') + '$.', '$y\' = x^{\\' + fn + argT + '}\\left(' + dT + '\\ln x + ' + frac('\\' + fn + argT, 'x') + '\\right)$.']; }
    else if (t === 'xinv') { var kq = R.int(1, 4), kT = kq === 1 ? '' : kq; fT = 'x^{' + kq + '/x}'; fP = 'x^(' + kq + '/x)'; ansP = 'x^(' + kq + '/x)*' + kq + '*(1-ln(x))/x^2'; st = ['$\\ln y = ' + frac(kT + '\\ln x', 'x') + '$.', 'Quotient rule: $' + frac('y\'', 'y') + ' = ' + frac(kT + '(1 - \\ln x)', 'x^{2}') + '$.', '$y\' = x^{' + kq + '/x} \\cdot ' + frac(kT + '(1 - \\ln x)', 'x^{2}') + '$.']; }
    else if (t === 'lnx') { fT = '(\\ln x)^{x}'; fP = 'ln(x)^x'; ansP = 'ln(x)^x*(ln(ln(x))+1/ln(x))'; st = ['For $x > 1$: $\\ln y = x\\ln(\\ln x)$.', 'Product and chain rules: $' + frac('y\'', 'y') + ' = \\ln(\\ln x) + x \\cdot ' + frac(1, '\\ln x') + ' \\cdot ' + frac(1, 'x') + ' = \\ln(\\ln x) + ' + frac(1, '\\ln x') + '$.', '$y\' = (\\ln x)^{x}\\left(\\ln(\\ln x) + ' + frac(1, '\\ln x') + '\\right)$.']; }
    else { var cb = R.int(1, 9); fT = '(x^{2} + ' + cb + ')^{x}'; fP = '(x^2+' + cb + ')^x'; ansP = '(x^2+' + cb + ')^x*(ln(x^2+' + cb + ')+2x^2/(x^2+' + cb + '))'; st = ['$\\ln y = x\\ln(x^{2} + ' + cb + ')$.', '$' + frac('y\'', 'y') + ' = \\ln(x^{2} + ' + cb + ') + x \\cdot ' + frac('2x', 'x^{2} + ' + cb) + '$.', '$y\' = (x^{2} + ' + cb + ')^{x}\\left(\\ln(x^{2} + ' + cb + ') + ' + frac('2x^{2}', 'x^{2} + ' + cb) + '\\right)$.']; }
    return { q: 'Use logarithmic differentiation to find $' + frac('dy', 'dx') + '$ for $y = ' + fT + '$ (with $x > ' + (t === 'lnx' ? 1 : 0) + '$).', a: expr(cl(ansP)), steps: st, hint: 'Neither the power rule nor the exponential rule fits. Take ln of both sides, then differentiate implicitly.', chk: { k: 'd', f: cl(fP), pts: [0.4, 0.7, 1.2, 1.6, 2.1, 2.7, 3.3] } };
  });


  // ================================================================== UNIT 4: APPLICATIONS OF DERIVATIVES
  // the "nice cubic" 2x^3 - 3(p+q)x^2 + 6pq x + c, whose derivative is 6(x - p)(x - q)
  function niceCubic(p, q2, c, s) { s = s || 1; return P([c, 6 * p * q2 * s, -3 * (p + q2) * s, 2 * s]); }
  function ivlStr(parts) { return parts.map(function (pp) { return '(' + pp[0] + ', ' + pp[1] + ')'; }).join(' U '); }
  function ivlT(parts) { return parts.map(function (pp) { return '(' + (pp[0] === '-inf' ? '-\\infty' : tx(pp[0])) + ', ' + (pp[1] === 'inf' ? '\\infty' : tx(pp[1])) + ')'; }).join(' \\cup '); }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-7) * Math.max(1, Math.abs(a), Math.abs(b)); }

  G('calc1.motion', function (R, ctx) {
    var kind = lv(ctx, R.pick(['proj', 'va']), R.pick(['rest', 'left', 'va', 'proj']), R.pick(['speed', 'speedmc', 'left', 'rest']));
    if (kind === 'proj') {
      var v0 = R.pick([32, 48, 64, 80, 96, 112]), h0 = R.pick([0, 5, 10, 20, 64]), s = P([h0, v0, -16]), t1 = R.int(1, Math.floor(v0 / 16) - 1), top = q(v0).div(32);
      var askTop = R.coin();
      return {
        q: 'A ball is thrown straight up. Its height after $t$ seconds is $s(t) = ' + s.tex('t') + '$ feet. ' + (askTop ? 'At what time $t$ does it reach its highest point?' : 'Find its velocity and acceleration at $t = ' + t1 + '$.'),
        a: askTop ? num(top) : multi([['$v(' + t1 + ') =$', num(s.d().at(t1))], ['$a(' + t1 + ') =$', num(-32)]]),
        unit: askTop ? 'seconds' : undefined,
        steps: ['Velocity is the derivative of position: $v(t) = s\'(t) = ' + s.d().tex('t') + '$ ft/s.', 'Acceleration is the derivative of velocity: $a(t) = v\'(t) = -32$ ft/s² (gravity).',
          askTop ? 'At the top the ball stops rising for an instant: $v(t) = 0$, so $' + s.d().tex('t') + ' = 0$ and $t = ' + frac(v0, 32) + ' = ' + tx(top) + '$ s.' : 'At $t = ' + t1 + '$: $v(' + t1 + ') = ' + s.d().subT(t1) + ' = ' + tx(s.d().at(t1)) + '$ ft/s' + (s.d().at(t1).sign() > 0 ? ' (still rising)' : s.d().at(t1).sign() < 0 ? ' (falling)' : ' (at the top)') + ', and $a(' + t1 + ') = -32$ ft/s².'],
        hint: 'Differentiate the position to get velocity, and again to get acceleration.',
        chk: askTop ? { k: 'fn', test: function (spec, val) { return Math.abs(-32 * val(spec) + v0) < 1e-9 ? true : 'not the top'; } } : [{ k: 'dat', f: s.plain('x'), x: t1 }, { k: 'dat', f: s.plain('x'), x: t1, n: 2 }]
      };
    }
    var p = R.int(1, 3), q2 = p + R.int(1, 3), c = R.int(0, 9), S = niceCubic(p, q2, c), V = S.d(), A = V.d(), m = q(p + q2).div(2);
    var sT = 's(t) = ' + S.tex('t'), intro = 'A particle moves along a line. Its position at time $t \\ge 0$ (seconds) is $' + sT + '$ meters. ';
    var vSteps = ['$v(t) = s\'(t) = ' + V.tex('t') + ' = 6(' + xm(p, 't') + ')(' + xm(q2, 't') + ')$.'];
    if (kind === 'va') {
      var t0 = R.int(0, q2 + 2);
      return {
        q: intro + 'Find its velocity and acceleration at $t = ' + t0 + '$.',
        a: multi([['$v(' + t0 + ') =$', num(V.at(t0))], ['$a(' + t0 + ') =$', num(A.at(t0))]]),
        steps: vSteps.concat(['$a(t) = v\'(t) = ' + A.tex('t') + '$.', 'At $t = ' + t0 + '$: $v(' + t0 + ') = ' + tx(V.at(t0)) + '$ m/s and $a(' + t0 + ') = ' + tx(A.at(t0)) + '$ m/s².']),
        hint: 'v = s′ and a = v′ = s″.', chk: [{ k: 'dat', f: S.plain(), x: t0 }, { k: 'dat', f: S.plain(), x: t0, n: 2 }]
      };
    }
    if (kind === 'rest') {
      return {
        q: intro + 'At what times is the particle at rest?',
        a: { t: 'set', v: [String(p), String(q2)] },
        steps: vSteps.concat(['At rest means velocity 0: $6(' + xm(p, 't') + ')(' + xm(q2, 't') + ') = 0$.', 'So $t = ' + p + '$ s and $t = ' + q2 + '$ s.']),
        hint: 'At rest means v(t) = 0.', chk: { k: 'set', test: function (vs) { return vs.length === 2 && vs.every(function (t) { return Math.abs(V.at(q(t)).toNumber()) < 1e-12; }) ? true : 'not rest times'; } }
      };
    }
    if (kind === 'left') {
      return {
        q: intro + 'On what time interval is the particle moving in the negative direction? Answer in interval notation.',
        a: { t: 'interval', v: '(' + p + ', ' + q2 + ')' },
        steps: vSteps.concat(['It moves in the negative direction when $v(t) < 0$.', 'Test a time in each piece: $v$ is positive before $t = ' + p + '$, negative between $' + p + '$ and $' + q2 + '$, and positive after $' + q2 + '$.', 'So the answer is $(' + p + ', ' + q2 + ')$.']),
        hint: 'Find where v(t) < 0 with a sign chart.', chk: { k: 'ivl', g: V.plain(), sign: -1, lo: 0, hi: 10 }
      };
    }
    var vaStr = '(' + V.plain() + ')*(' + A.plain() + ')';
    if (kind === 'speed') {
      return {
        q: intro + 'On what time intervals is the particle speeding up? Answer in interval notation.',
        a: { t: 'interval', v: '(' + p + ', ' + pl(m) + ') U (' + q2 + ', inf)' },
        steps: vSteps.concat(['$a(t) = ' + A.tex('t') + '$, which is negative before $t = ' + tx(m) + '$ and positive after.',
          'Speeding up means the speed $\\lvert v \\rvert$ grows, which happens when $v$ and $a$ have the same sign.',
          'Sign chart: on $(0, ' + p + ')$, $v > 0$ and $a < 0$ (slowing). On $(' + p + ', ' + tx(m) + ')$, $v < 0$ and $a < 0$ (speeding up). On $(' + tx(m) + ', ' + q2 + ')$, $v < 0$ and $a > 0$ (slowing). After $' + q2 + '$, both are positive (speeding up).',
          'So it speeds up on $(' + p + ', ' + tx(m) + ') \\cup (' + q2 + ', \\infty)$. Negative acceleration alone does not mean slowing down.']),
        hint: 'Compare the signs of v and a. Same sign: speeding up.', chk: { k: 'ivl', g: vaStr, sign: 1, lo: 0, hi: 12 }
      };
    }
    var t3 = R.pick([q(p).add(m).div(2), m.add(q2).div(2), q(q2 + 1), q(p).div(2)]), v3 = V.at(t3), a3 = A.at(t3), speeding = v3.sign() * a3.sign() > 0;
    return {
      q: intro + 'At $t = ' + tx(t3) + '$, is the particle speeding up or slowing down?',
      a: { t: 'mc', choices: ['Speeding up', 'Slowing down'], v: speeding ? 0 : 1, keep: true },
      steps: vSteps.concat(['$a(t) = ' + A.tex('t') + '$.', 'At $t = ' + tx(t3) + '$: $v = ' + tx(v3) + '$ and $a = ' + tx(a3) + '$.',
        speeding ? 'They have the same sign, so the speed is growing: speeding up.' + (v3.sign() < 0 ? ' (The acceleration is negative, yet the particle speeds up, because it is moving in the negative direction.)' : '') : 'They have opposite signs, so the speed is shrinking: slowing down.' + (a3.sign() > 0 ? ' (Positive acceleration, yet slowing down, because the particle moves in the negative direction.)' : '')]),
      hint: 'Speeding up when v and a have the same sign.', chk: { k: 'mc' }
    };
  });

  G('calc1.related-rates', function (R, ctx) {
    var kind = lv(ctx, R.pick(['square', 'circle', 'cube']), R.pick(['ladder', 'sphere', 'cars', 'circle2']), R.pick(['cone', 'shadow', 'cars', 'ladder']));
    var first = 'Write an equation that links the quantities, differentiate both sides with respect to $t$, and only then substitute the numbers.';
    if (kind === 'square' || kind === 'cube') {
      var k = R.int(2, 6), s0 = R.int(3, 12), isCube = kind === 'cube', ans = isCube ? q(3 * s0 * s0 * k) : q(2 * s0 * k);
      return {
        q: 'The side of a ' + (isCube ? 'cube' : 'square') + ' grows at $' + k + '$ cm/s. How fast is its ' + (isCube ? 'volume' : 'area') + ' growing when the side is $' + s0 + '$ cm?',
        a: num(ans), unit: isCube ? 'cm³/s' : 'cm²/s',
        steps: [first, isCube ? '$V = s^{3}$, so $' + frac('dV', 'dt') + ' = 3s^{2}' + frac('ds', 'dt') + '$ (chain rule: $s$ depends on $t$).' : '$A = s^{2}$, so $' + frac('dA', 'dt') + ' = 2s' + frac('ds', 'dt') + '$ (chain rule: $s$ depends on $t$).',
          isCube ? 'Substitute: $3(' + s0 + ')^{2}(' + k + ') = ' + tx(ans) + '$ cm³/s.' : 'Substitute: $2(' + s0 + ')(' + k + ') = ' + tx(ans) + '$ cm²/s.'],
        hint: 'Differentiate the area (or volume) formula with respect to t.',
        chk: { k: 'fn', test: function (spec, val) { var f = function (t) { var sd = s0 + k * t; return isCube ? sd * sd * sd : sd * sd; }; var h = 1e-6, d = (f(h) - f(-h)) / (2 * h); return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
      };
    }
    if (kind === 'circle' || kind === 'circle2') {
      var k2 = R.int(2, 6), r0 = R.int(2, 15);
      if (kind === 'circle') {
        return {
          q: 'A ripple spreads in a circle. Its radius grows at $' + k2 + '$ cm/s. How fast is the area inside it growing when the radius is $' + r0 + '$ cm? Give an exact answer.',
          a: num((2 * r0 * k2) + '*pi'), unit: 'cm²/s',
          steps: [first, '$A = \\pi r^{2}$, so $' + frac('dA', 'dt') + ' = 2\\pi r\\,' + frac('dr', 'dt') + '$.', 'Substitute $r = ' + r0 + '$ and $' + frac('dr', 'dt') + ' = ' + k2 + '$: $2\\pi(' + r0 + ')(' + k2 + ') = ' + (2 * r0 * k2) + '\\pi$ cm²/s.'],
          hint: 'Differentiate A = πr² with respect to t.',
          chk: { k: 'fn', test: function (spec, val) { var f = function (t) { var r = r0 + k2 * t; return Math.PI * r * r; }; var d = (f(1e-6) - f(-1e-6)) / 2e-6; return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
        };
      }
      var Ar = R.pick([10, 12, 20, 30, 40]), drdt = q(Ar).div(2 * r0);
      return {
        q: 'Oil spreads in a circle on still water. The area grows at $' + Ar + '$ m²/min. How fast is the radius growing when it is $' + r0 + '$ m? Give an exact answer.',
        a: num(overPi(drdt)), unit: 'm/min',
        steps: [first, '$A = \\pi r^{2}$, so $' + frac('dA', 'dt') + ' = 2\\pi r\\,' + frac('dr', 'dt') + '$.', 'Substitute: $' + Ar + ' = 2\\pi(' + r0 + ')' + frac('dr', 'dt') + '$, so $' + frac('dr', 'dt') + ' = ' + frac(Ar, (2 * r0) + '\\pi') + (drdt.n !== BigInt(Ar) ? ' = ' + frac(drdt.n, drdt.d === 1n ? '\\pi' : drdt.d + '\\pi') : '') + '$ m/min.'],
        hint: 'Differentiate A = πr², then solve for dr/dt.',
        chk: { k: 'fn', test: function (spec, val) { var r = function (t) { return Math.sqrt((Math.PI * r0 * r0 + Ar * t) / Math.PI); }; var d = (r(1e-6) - r(-1e-6)) / 2e-6; return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
      };
    }
    if (kind === 'sphere') {
      var Vp = R.pick([16, 32, 36, 48, 64, 100]), r1 = R.int(2, 6), dr = q(Vp).div(4 * r1 * r1);
      return {
        q: 'Air is pumped into a spherical balloon at $' + Vp + '$ cm³/s. How fast is the radius increasing when the radius is $' + r1 + '$ cm? Give an exact answer.',
        a: num(overPi(dr)), unit: 'cm/s',
        steps: [first, '$V = ' + frac(4, 3) + '\\pi r^{3}$, so $' + frac('dV', 'dt') + ' = 4\\pi r^{2}' + frac('dr', 'dt') + '$.', 'Substitute: $' + Vp + ' = 4\\pi(' + r1 + ')^{2}' + frac('dr', 'dt') + ' = ' + (4 * r1 * r1) + '\\pi\\,' + frac('dr', 'dt') + '$.', '$' + frac('dr', 'dt') + ' = ' + frac(Vp, (4 * r1 * r1) + '\\pi') + ' = ' + (dr.isInt() ? frac(tx(dr), '\\pi') : frac(dr.n, dr.d + '\\pi')) + '$ cm/s.'],
        hint: 'Differentiate the volume formula for a sphere with respect to t.',
        chk: { k: 'fn', test: function (spec, val) { var r = function (t) { return Math.cbrt((4 / 3 * Math.PI * r1 * r1 * r1 + Vp * t) * 3 / (4 * Math.PI)); }; var d = (r(1e-6) - r(-1e-6)) / 2e-6; return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
      };
    }
    var TR = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
    if (kind === 'ladder') {
      var tr = R.pick(TR), sw = R.coin(), x0 = sw ? tr[1] : tr[0], y0 = sw ? tr[0] : tr[1], L = tr[2], k3 = R.int(1, 4), dy = q(-x0 * k3).div(y0);
      return {
        q: 'A ' + L + '-ft ladder leans against a wall. Its bottom slides away from the wall at $' + k3 + '$ ft/s. How fast is the top moving when the bottom is $' + x0 + '$ ft from the wall? Give $' + frac('dy', 'dt') + '$, where $y$ is the height of the top (negative means moving down).',
        a: num(dy), unit: 'ft/s',
        steps: [first, 'Let $x$ be the distance of the bottom from the wall and $y$ the height of the top: $x^{2} + y^{2} = ' + (L * L) + '$.',
          'Differentiate with respect to $t$: $2x' + frac('dx', 'dt') + ' + 2y' + frac('dy', 'dt') + ' = 0$. (Substituting $x = ' + x0 + '$ first would turn $x$ into a constant and lose $' + frac('dx', 'dt') + '$.)',
          'Now substitute: when $x = ' + x0 + '$, $y = \\sqrt{' + (L * L) + ' - ' + (x0 * x0) + '} = ' + y0 + '$. So $2(' + x0 + ')(' + k3 + ') + 2(' + y0 + ')' + frac('dy', 'dt') + ' = 0$.',
          '$' + frac('dy', 'dt') + ' = ' + frac(-x0 * k3, y0) + (dy.isInt() || gcd(x0 * k3, y0) > 1 ? ' = ' + tx(dy) : '') + '$ ft/s: the top slides down.'],
        hint: 'Use x² + y² = L², differentiate, then substitute.',
        chk: { k: 'fn', test: function (spec, val) { var y = function (t) { var xx = x0 + k3 * t; return Math.sqrt(L * L - xx * xx); }; var d = (y(1e-6) - y(-1e-6)) / 2e-6; return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
      };
    }
    if (kind === 'cars') {
      var tr2 = R.pick(TR), a = R.pick([30, 40, 45, 50, 60]), b = R.pick([30, 40, 50, 60, 70]), xA = tr2[0], yB = tr2[1], D = tr2[2], rate = q(xA * a + yB * b).div(D);
      return {
        q: 'Car A drives east away from an intersection at $' + a + '$ mph, and car B drives north away from it at $' + b + '$ mph. How fast is the distance between them growing when A is $' + xA + '$ miles and B is $' + yB + '$ miles from the intersection?',
        a: num(rate), unit: 'mph',
        steps: [first, 'With $x$ for car A, $y$ for car B and $D$ for the distance: $D^{2} = x^{2} + y^{2}$.',
          'Differentiate: $2D' + frac('dD', 'dt') + ' = 2x' + frac('dx', 'dt') + ' + 2y' + frac('dy', 'dt') + '$.',
          'At that moment $D = \\sqrt{' + (xA * xA) + ' + ' + (yB * yB) + '} = ' + D + '$, so $' + D + frac('dD', 'dt') + ' = ' + xA + '(' + a + ') + ' + yB + '(' + b + ') = ' + (xA * a + yB * b) + '$.',
          '$' + frac('dD', 'dt') + ' = ' + frac(xA * a + yB * b, D) + (rate.isInt() || gcd(xA * a + yB * b, D) > 1 ? ' = ' + tx(rate) : '') + '$ mph.'],
        hint: 'Use the Pythagorean theorem, then differentiate.',
        chk: { k: 'fn', test: function (spec, val) { var Dd = function (t) { var x = xA + a * t, y = yB + b * t; return Math.sqrt(x * x + y * y); }; var d = (Dd(1e-6) - Dd(-1e-6)) / 2e-6; return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
      };
    }
    if (kind === 'cone') {
      var Rr = R.pick([2, 3, 4]), H = Rr * R.pick([2, 3]), kk = R.pick([2, 3, 4, 5, 6]), h0 = R.pick([2, 3, 4, 6]), dh = q(kk * H * H).div(Rr * Rr * h0 * h0);
      return {
        q: 'Water flows at $' + kk + '$ m³/min into a tank shaped like a cone, point down, with top radius $' + Rr + '$ m and height $' + H + '$ m. How fast is the water level rising when the water is $' + h0 + '$ m deep? Give an exact answer.',
        a: num(overPi(dh)), unit: 'm/min',
        steps: [first, 'By similar triangles the water\'s radius is $r = ' + frac(Rr, H) + 'h' + (gcd(Rr, H) > 1 ? ' = ' + T.coef(q(Rr).div(H), 'h') : '') + '$.',
          'So $V = ' + frac(1, 3) + '\\pi r^{2} h = ' + frac(1, 3) + '\\pi\\left(' + tx(q(Rr).div(H)) + '\\right)^{2} h^{3} = ' + frac('\\pi', tx(q(3 * H * H).div(Rr * Rr))) + 'h^{3}$.'.replace('\\frac{\\pi}{1}', '\\pi'),
          'Differentiate: $' + frac('dV', 'dt') + ' = ' + frac('\\pi', tx(q(H * H).div(Rr * Rr))) + 'h^{2}' + frac('dh', 'dt') + '$.'.replace('\\frac{\\pi}{1}', '\\pi'),
          'Substitute $' + frac('dV', 'dt') + ' = ' + kk + '$ and $h = ' + h0 + '$: $' + frac('dh', 'dt') + ' = ' + frac(tx(q(kk).mul(H * H).div(Rr * Rr)), (h0 * h0) + '\\pi') + ' = ' + (dh.isInt() ? frac(tx(dh), '\\pi') : frac(dh.n, dh.d + '\\pi')) + '$ m/min.'],
        hint: 'Use similar triangles to write the volume in terms of h alone before differentiating.',
        chk: { k: 'fn', test: function (spec, val) { var c3 = Math.PI * Rr * Rr / (3 * H * H), hh = function (t) { return Math.cbrt((c3 * h0 * h0 * h0 + kk * t) / c3); }; var d = (hh(1e-6) - hh(-1e-6)) / 2e-6; return near(d, val(spec), 1e-6) ? true : 'numeric ' + d; } }
      };
    }
    var Hs = R.pick([[15, 6], [12, 4], [16, 6], [18, 6], [14, 6]]), Hl = Hs[0], ph = Hs[1], v = R.pick([3, 4, 5]), tipRate = R.coin(), sr = q(ph * v).div(Hl - ph), tr3 = q(Hl * v).div(Hl - ph);
    return {
      q: 'A person ' + ph + ' ft tall walks away from a ' + Hl + '-ft lamppost at $' + v + '$ ft/s. How fast is ' + (tipRate ? 'the tip of their shadow moving' : 'their shadow getting longer') + '?',
      a: num(tipRate ? tr3 : sr), unit: 'ft/s',
      steps: [first, 'Let $x$ be the person\'s distance from the post and $s$ the shadow\'s length. Similar triangles: $' + frac('s', ph) + ' = ' + frac('x + s', Hl) + '$.',
        'Cross-multiply: $' + Hl + 's = ' + ph + 'x + ' + ph + 's$, so $' + (Hl - ph) + 's = ' + ph + 'x$.',
        'Differentiate: $' + (Hl - ph) + frac('ds', 'dt') + ' = ' + ph + frac('dx', 'dt') + ' = ' + ph + '(' + v + ')$, so $' + frac('ds', 'dt') + ' = ' + tx(sr) + '$ ft/s.',
        tipRate ? 'The tip is at $x + s$, so it moves at $' + frac('dx', 'dt') + ' + ' + frac('ds', 'dt') + ' = ' + v + ' + ' + tx(sr) + ' = ' + tx(tr3) + '$ ft/s. (The rate does not depend on where the person is.)' : 'The rate does not even depend on where the person is.'],
      hint: 'Draw the two similar triangles: the lamppost and the person.',
      chk: { k: 'fn', test: function (spec, val) { var want = tipRate ? Hl * v / (Hl - ph) : ph * v / (Hl - ph); return near(want, val(spec)) ? true : 'shadow ' + want; } }
    };
  });

  G('calc1.linear-approximation', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sqrt', 'sqrt', 'L']), R.pick(['cbrt', 'diff', 'L', 'circle']), R.pick(['pow', 'trig', 'cbrt', 'circle', 'L']));
    if (kind === 'sqrt' || kind === 'cbrt') {
      var cube = kind === 'cbrt', a = cube ? R.int(2, 5) : R.int(3, 10), d = R.nz(-3, 3) * (cube ? R.pick([1, 2]) : 1), base = cube ? a * a * a : a * a, xv = base + d;
      var slope = cube ? q(1).div(3 * a * a) : q(1).div(2 * a), est = q(a).add(slope.mul(d));
      return {
        q: 'Use a linear approximation (the tangent line at $x = ' + base + '$) to estimate $' + (cube ? '\\sqrt[3]{' + xv + '}' : '\\sqrt{' + xv + '}') + '$. Give the exact value of the estimate.',
        a: numD(est),
        steps: ['Use $f(x) = ' + (cube ? '\\sqrt[3]{x}' : '\\sqrt{x}') + '$ at $a = ' + base + '$, a nearby number whose root is easy: $f(' + base + ') = ' + a + '$.',
          cube ? '$f\'(x) = ' + frac(1, '3\\sqrt[3]{x^{2}}') + '$, so $f\'(' + base + ') = ' + frac(1, 3 * a * a) + '$.' : '$f\'(x) = ' + frac(1, '2\\sqrt{x}') + '$, so $f\'(' + base + ') = ' + frac(1, 2 * a) + '$.',
          '$L(x) = ' + a + ' + ' + tx(slope) + '(' + xm(base) + ')$.', '$L(' + xv + ') = ' + a + ' + ' + tx(slope) + '(' + tx(d) + ') = ' + tx(est) + (est.isTerminating() ? ' = ' + dec(est) : '') + '$.'],
        hint: 'Start from the nearest perfect ' + (cube ? 'cube' : 'square') + ' and follow the tangent line.',
        chk: { k: 'fn', test: function (spec, val) { var f = function (x) { return cube ? Math.cbrt(x) : Math.sqrt(x); }, h = 1e-6, fp = (f(base + h) - f(base - h)) / (2 * h); return near(f(base) + fp * d, val(spec), 1e-8) ? true : 'tangent estimate'; } }
      };
    }
    if (kind === 'L') {
      var which = R.pick(['sqrt', 'recip', 'cube']), L, fT, fP, a2, st, fa;
      if (which === 'sqrt') { var c = R.int(1, 6); a2 = c * c; fa = q(c); L = P([q(c).sub(q(a2).div(2 * c)), q(1).div(2 * c)]); fT = '\\sqrt{x}'; fP = 'sqrt(x)'; st = ['$f(' + a2 + ') = ' + c + '$ and $f\'(x) = ' + frac(1, '2\\sqrt{x}') + '$, so $f\'(' + a2 + ') = ' + frac(1, 2 * c) + '$.']; }
      else if (which === 'recip') { a2 = R.nz(-4, 4); fa = q(1).div(a2); L = P([q(2).div(a2), q(-1).div(a2 * a2)]); fT = frac(1, 'x'); fP = '1/x'; st = ['$f(' + a2 + ') = ' + tx(q(1).div(a2)) + '$ and $f\'(x) = -' + frac(1, 'x^{2}') + '$, so $f\'(' + a2 + ') = ' + tx(q(-1).div(a2 * a2)) + '$.']; }
      else { a2 = R.nz(-3, 3); fa = q(a2 * a2 * a2); L = P([-2 * a2 * a2 * a2, 3 * a2 * a2]); fT = 'x^{3}'; fP = 'x^3'; st = ['$f(' + a2 + ') = ' + (a2 * a2 * a2) + '$ and $f\'(x) = 3x^{2}$, so $f\'(' + a2 + ') = ' + (3 * a2 * a2) + '$.']; }
      return {
        q: 'Find the linearization $L(x)$ of $f(x) = ' + fT + '$ at $a = ' + a2 + '$. Write it as $mx + b$.',
        a: expr(L.plain()),
        steps: ['The linearization is the tangent line: $L(x) = f(a) + f\'(a)(x - a)$.'].concat(st, ['$L(x) = ' + tx(fa) + ' + ' + tx(L.c[1]) + '(' + xm(a2) + ') = ' + L.tex() + '$.']).map(function (s) { return s.replace('+ -', '- '); }),
        hint: 'L(x) = f(a) + f′(a)(x − a).', chk: { k: 'tan', f: fP, a: a2 }
      };
    }
    if (kind === 'diff') {
      var f = P([R.int(-5, 5), R.int(-4, 4), R.nz(-3, 3), R.pick([1, -1, 2])]), x0 = R.int(-2, 3), dx = q(R.pick(['0.1', '0.2', '-0.1', '0.05', '0.01'])), fp = f.d().at(x0), dy = fp.mul(dx);
      return {
        q: 'Let $y = ' + f.tex() + '$. Find the differential $dy$ when $x = ' + x0 + '$ and $dx = ' + dec(dx) + '$.',
        a: numD(dy),
        steps: ['The differential is $dy = f\'(x)\\,dx$: the change along the tangent line.', '$f\'(x) = ' + f.d().tex() + '$, so $f\'(' + x0 + ') = ' + tx(fp) + '$.', '$dy = ' + tx(fp) + ' \\cdot ' + tp(dx) + ' = ' + dec(dy) + '$. (The true change $\\Delta y$ is close to this when $dx$ is small.)'],
        hint: 'dy = f′(x) · dx.', chk: { k: 'fn', test: function (spec, val) { return near(fp.toNumber() * dx.toNumber(), val(spec)) ? true : 'dy'; } }
      };
    }
    if (kind === 'circle') {
      var r = R.int(5, 30), dr = q(R.pick(['0.1', '0.2', '0.05', '0.5'])), sph = R.coin(), dA = sph ? dr.mul(4 * r * r) : dr.mul(2 * r);
      return {
        q: 'The radius of a ' + (sph ? 'ball' : 'circular plate') + ' is measured as $' + r + '$ cm, with a possible error of $' + dec(dr) + '$ cm. Use differentials to estimate the possible error in its ' + (sph ? 'volume' : 'area') + '. Give an exact answer.',
        a: num(timesPi(dA)), unit: sph ? 'cm³' : 'cm²',
        steps: [sph ? '$V = ' + frac(4, 3) + '\\pi r^{3}$, so $dV = 4\\pi r^{2}\\,dr$.' : '$A = \\pi r^{2}$, so $dA = 2\\pi r\\,dr$.',
          sph ? '$dV = 4\\pi(' + r + ')^{2}(' + dec(dr) + ') = ' + dec(dA) + '\\pi$ cm³.' : '$dA = 2\\pi(' + r + ')(' + dec(dr) + ') = ' + dec(dA) + '\\pi$ cm².'],
        hint: 'Differentiate the formula and multiply by dr.', chk: { k: 'fn', test: function (spec, val) { return near(val(spec), Math.PI * (sph ? 4 * r * r : 2 * r) * dr.toNumber()) ? true : 'error'; } }
      };
    }
    if (kind === 'pow') {
      var n = R.int(3, 8), xs_ = q(R.pick(['0.01', '0.02', '0.03', '-0.01', '-0.02'])), est2 = q(1).add(xs_.mul(n));
      return {
        q: 'Use the linear approximation $(1 + x)^{n} \\approx 1 + nx$ (the tangent line at $x = 0$) to estimate $(' + dec(q(1).add(xs_)) + ')^{' + n + '}$.',
        a: numD(est2),
        steps: ['For $f(x) = (1 + x)^{' + n + '}$: $f(0) = 1$ and $f\'(x) = ' + n + '(1 + x)^{' + (n - 1) + '}$, so $f\'(0) = ' + n + '$.', 'So $L(x) = 1 + ' + n + 'x$ near $x = 0$.', 'Here $x = ' + dec(xs_) + '$: $1 + ' + n + '(' + dec(xs_) + ') = ' + dec(est2) + '$.'],
        hint: 'Write the number as 1 + x with x small.', chk: { k: 'fn', test: function (spec, val) { return near(val(spec), 1 + n * xs_.toNumber()) ? true : 'pow'; } }
      };
    }
    var dd = q(R.pick(['0.1', '0.05', '0.02', '-0.1', '0.2'])), fn = R.pick(['sin', 'tan', 'cos']), est3 = fn === 'cos' ? q(1) : dd;
    return {
      q: 'Use the tangent line at $x = 0$ to estimate $\\' + fn + '(' + dec(dd) + ')$ (radians).',
      a: numD(est3),
      steps: ['At $a = 0$: $\\' + fn + '(0) = ' + (fn === 'cos' ? 1 : 0) + '$ and the derivative there is $' + (fn === 'sin' ? '\\cos 0 = 1' : fn === 'tan' ? '\\sec^{2} 0 = 1' : '-\\sin 0 = 0') + '$.',
        'So $L(x) = ' + (fn === 'cos' ? '1' : 'x') + '$ near 0.', 'Estimate: $\\' + fn + '(' + dec(dd) + ') \\approx ' + dec(est3) + '$.' + (fn === 'cos' ? ' (The tangent at the top of the cosine curve is flat.)' : '')],
      hint: 'Find the value and the slope of the function at 0.', chk: { k: 'fn', test: function (spec, val) { var f = Math[fn], d1 = (f(1e-6) - f(-1e-6)) / 2e-6; return near(val(spec), f(0) + d1 * dd.toNumber(), 1e-6) ? true : 'trig'; } }
    };
  });

  G('calc1.critical-points-extrema', function (R, ctx) {
    var kind = lv(ctx, R.pick(['crit', 'abs']), R.pick(['abs', 'abs1', 'crit', 'quart']), R.pick(['quart', 'cusp', 'abs', 'abs1']));
    if (kind === 'cusp') {
      var c = R.nz(-3, 3), b = 5 * c;
      return {
        q: 'Find all critical numbers of $f(x) = x^{2/3}(' + xm(b) + ')$.',
        a: { t: 'set', v: ['0', String(2 * c)] },
        steps: ['Expand: $f(x) = x^{5/3}' + (b < 0 ? ' + ' : ' - ') + abs(b) + 'x^{2/3}$.', '$f\'(x) = ' + frac(5, 3) + 'x^{2/3}' + (b < 0 ? ' + ' : ' - ') + frac(2 * abs(b), 3) + 'x^{-1/3} = ' + frac('5x' + sg(-2 * b), '3x^{1/3}') + '$.',
          'Critical numbers are where $f\' = 0$ or $f\'$ does not exist (with $f$ defined there).', '$f\' = 0$ when $5x = ' + (2 * b) + '$, so $x = ' + (2 * c) + '$. $f\'$ does not exist at $x = 0$, where $f(0) = 0$ is defined.', 'Critical numbers: $0$ and $' + (2 * c) + '$.'],
        hint: 'Look for where f′ = 0 and also where f′ is undefined.', chk: { k: 'set', test: function (vs) { return vs.length === 2 && vs.indexOf(0) >= 0 && vs.indexOf(2 * c) >= 0 ? true : 'cusp crit'; } }
      };
    }
    var f, crit, fT;
    if (kind === 'quart') { var k = R.int(1, 3), cc = R.int(-5, 5); f = P([cc, 0, -2 * k * k, 0, 1]); crit = [-k, 0, k]; }
    else { var p = R.int(-3, 2), q2 = p + (kind === 'abs1' ? R.int(2, 3) : R.int(1, 3)); f = niceCubic(p, q2, R.int(-6, 6), R.pick([1, 1, -1])); crit = [p, q2]; }
    fT = f.tex(); var fp = f.d();
    if (kind === 'crit' || (kind === 'quart' && R.coin())) {
      return {
        q: 'Find all critical numbers of $f(x) = ' + fT + '$.',
        a: { t: 'set', v: crit.map(String) },
        steps: ['$f\'(x) = ' + fp.tex() + '$. A polynomial\'s derivative exists everywhere, so the critical numbers are where $f\'(x) = 0$.',
          kind === 'quart' ? 'Factor: $4x^{3} - ' + (4 * crit[2] * crit[2]) + 'x = 4x(x^{2} - ' + (crit[2] * crit[2]) + ') = 4x(' + xm(crit[2]) + ')(' + xm(-crit[2]) + ')$.' : 'Factor: $f\'(x) = ' + tx(fp.lead()) + '(' + xm(crit[0]) + ')(' + xm(crit[1]) + ')$.',
          'Critical numbers: $' + crit.join(', ') + '$. (Each is only a candidate for a max or min; it still needs checking.)'],
        hint: 'Set f′(x) = 0 and factor.', chk: { k: 'set', test: function (vs) { return vs.length === crit.length && vs.every(function (x) { return Math.abs(fp.at(q(x)).toNumber()) < 1e-12; }) ? true : 'not critical'; } }
      };
    }
    var lo, hi, inside;
    if (kind === 'abs1') { lo = crit[0] - R.int(1, 2); hi = crit[0] + 1; }
    else { lo = crit[0] - R.int(1, 2); hi = crit[crit.length - 1] + R.int(1, 2); }
    inside = crit.filter(function (x) { return x > lo && x < hi; });
    var cands = [lo].concat(inside, [hi]), vals = cands.map(function (x) { return f.at(x); });
    var mx = vals.reduce(function (m, v) { return v.gt(m) ? v : m; }), mn = vals.reduce(function (m, v) { return v.lt(m) ? v : m; });
    return {
      q: 'Find the absolute maximum and minimum values of $f(x) = ' + fT + '$ on $[' + lo + ', ' + hi + ']$.',
      a: multi([['maximum value: ', num(mx)], ['minimum value: ', num(mn)]]),
      steps: ['$f$ is continuous on a closed interval, so both extremes exist, and they occur at critical numbers or endpoints.',
        '$f\'(x) = ' + fp.tex() + '$, which is 0 at $x = ' + crit.join(', ') + '$. ' + (inside.length === crit.length ? 'All are inside the interval.' : 'Only $' + (inside.join(', ') || 'none') + '$ ' + (inside.length === 1 ? 'is' : 'are') + ' inside the interval.'),
        'Evaluate at the candidates: ' + cands.map(function (x, i) { return '$f(' + x + ') = ' + tx(vals[i]) + '$'; }).join(', ') + '.',
        'The largest is $' + tx(mx) + '$ and the smallest is $' + tx(mn) + '$. (Endpoints count: they are often where the extremes happen.)'],
      hint: 'Compare f at the critical numbers inside the interval and at both endpoints.',
      chk: [{ k: 'fn', test: function (spec, val, fn) { var g = fn(f.plain()), m = -Infinity; for (var i = 0; i <= 6000; i++) m = Math.max(m, g(lo + (hi - lo) * i / 6000)); return Math.abs(m - val(spec)) < 1e-6 * Math.max(1, Math.abs(m)) ? true : 'max ' + m; } },
        { k: 'fn', test: function (spec, val, fn) { var g = fn(f.plain()), m = Infinity; for (var i = 0; i <= 6000; i++) m = Math.min(m, g(lo + (hi - lo) * i / 6000)); return Math.abs(m - val(spec)) < 1e-6 * Math.max(1, Math.abs(m)) ? true : 'min ' + m; } }]
    };
  });

  G('calc1.mean-value-theorem', function (R, ctx) {
    var kind = lv(ctx, R.pick(['quad', 'speed', 'applies']), R.pick(['recip', 'sqrt', 'applies', 'quad']), R.pick(['cube', 'recip', 'sqrt', 'applies']));
    var mvtStep = 'The Mean Value Theorem promises a $c$ in $(a, b)$ with $f\'(c) = ' + frac('f(b) - f(a)', 'b - a') + '$: a tangent parallel to the secant.';
    function chkC(fP, a, b) { return { k: 'fn', test: function (spec, val, fn, nd) { var f = fn(fP), c = val(spec), sl = (f(b) - f(a)) / (b - a); return c > a && c < b && near(nd(f, c), sl, 1e-6) ? true : 'c = ' + c + ' fails'; } }; }
    if (kind === 'quad') {
      var f = P([R.int(-5, 5), R.int(-4, 4), R.nz(-3, 3)]), a = R.int(-3, 2), b = a + R.pick([2, 3, 4, 5]), m = f.at(b).sub(f.at(a)).div(b - a), c = q(a + b).div(2);
      return {
        q: 'Find the number $c$ that satisfies the Mean Value Theorem for $f(x) = ' + f.tex() + '$ on $[' + a + ', ' + b + ']$.',
        a: num(c),
        steps: [mvtStep, 'Secant slope: $' + frac('f(' + b + ') - f(' + a + ')', b + ' - ' + tp(a)) + ' = ' + frac(tx(f.at(b)) + ' - ' + tp(f.at(a)), b - a) + ' = ' + tx(m) + '$.',
          '$f\'(c) = ' + f.d().tex('c') + ' = ' + tx(m) + '$, so $c = ' + tx(c) + '$.', 'Check: $' + tx(c) + '$ is inside $(' + a + ', ' + b + ')$. (For any parabola, $c$ is the midpoint.)'],
        hint: 'Set f′(c) equal to the slope of the secant line.', chk: chkC(f.plain(), a, b)
      };
    }
    if (kind === 'recip') {
      var pr = R.pick([[1, 4], [1, 9], [2, 8], [4, 9], [1, 16], [3, 12], [2, 18]]), k = R.nz(-6, 6), a2 = pr[0], b2 = pr[1], c2 = Math.round(Math.sqrt(a2 * b2)), m2 = q(-k).div(a2 * b2);
      return {
        q: 'Find the number $c$ that satisfies the Mean Value Theorem for $f(x) = ' + frac(k, 'x') + '$ on $[' + a2 + ', ' + b2 + ']$.',
        a: num(c2),
        steps: [mvtStep, '$f$ is continuous and differentiable on $[' + a2 + ', ' + b2 + ']$ (no zero in it). Secant slope: $' + frac(tx(q(k).div(b2)) + ' - ' + tp(q(k).div(a2)), b2 - a2) + ' = ' + tx(m2) + '$.',
          '$f\'(c) = ' + frac(-k, 'c^{2}') + ' = ' + tx(m2) + '$ gives $c^{2} = ' + (a2 * b2) + '$, so $c = \\pm ' + c2 + '$.', 'Only $c = ' + c2 + '$ is in $(' + a2 + ', ' + b2 + ')$.'],
        hint: 'Set f′(c) equal to the secant slope and keep the solution inside the interval.', chk: chkC(k + '/x', a2, b2)
      };
    }
    if (kind === 'sqrt') {
      var aa = R.int(0, 3), bb = aa + R.int(1, 3), A = aa * aa, B = bb * bb, c3 = q(aa + bb).div(2).pow(2), m3 = q(1).div(aa + bb);
      return {
        q: 'Find the number $c$ that satisfies the Mean Value Theorem for $f(x) = \\sqrt{x}$ on $[' + A + ', ' + B + ']$.',
        a: num(c3),
        steps: [mvtStep, 'Secant slope: $' + frac(bb + ' - ' + aa, B + ' - ' + A) + ' = ' + tx(m3) + '$.', '$f\'(c) = ' + frac(1, '2\\sqrt{c}') + ' = ' + tx(m3) + '$, so $\\sqrt{c} = ' + tx(q(aa + bb).div(2)) + '$.', '$c = ' + tx(c3) + '$, which is inside the interval.'],
        hint: 'Solve 1/(2√c) = secant slope.', chk: chkC('sqrt(x)', A, B)
      };
    }
    if (kind === 'cube') {
      var b4 = R.pick([2, 3, 4, 6]), kk = R.int(-3, 3), f4 = P([0, kk, 0, 1]), m4 = q(b4 * b4 + kk), cP = b4 === 3 ? 'sqrt(3)' : b4 === 6 ? '2*sqrt(3)' : b4 + '*sqrt(3)/3', cT = b4 === 3 ? '\\sqrt{3}' : b4 === 6 ? '2\\sqrt{3}' : frac(b4 + '\\sqrt{3}', 3);
      return {
        q: 'Find the number $c$ that satisfies the Mean Value Theorem for $f(x) = ' + f4.tex() + '$ on $[0, ' + b4 + ']$.',
        a: num(cP),
        steps: [mvtStep, 'Secant slope: $' + frac(tx(f4.at(b4)) + ' - 0', b4) + ' = ' + tx(m4) + '$.', '$f\'(c) = 3c^{2}' + sg(kk) + ' = ' + tx(m4) + '$, so $3c^{2} = ' + (b4 * b4) + '$ and $c^{2} = ' + tx(q(b4 * b4).div(3)) + '$.', '$c = ' + cT + '$ (the positive root, the one inside the interval).'],
        hint: 'Solve f′(c) = secant slope; keep the root inside the interval.', chk: chkC(f4.plain(), 0, b4)
      };
    }
    if (kind === 'speed') {
      var D = R.pick([90, 120, 150, 180, 210, 240]), Tm = R.pick([2, 3]), sp = q(D).div(Tm);
      return {
        q: 'A car travels ' + D + ' miles in ' + Tm + ' hours. What speed does the Mean Value Theorem guarantee the car was going at some moment?',
        a: num(sp), unit: 'mph',
        steps: ['Position $s(t)$ is differentiable, so the MVT applies on $[0, ' + Tm + ']$.', 'Average velocity: $' + frac(D, Tm) + ' = ' + tx(sp) + '$ mph.', 'So at some instant $s\'(c) = ' + tx(sp) + '$: the speedometer read exactly ' + tx(sp) + ' mph.'],
        hint: 'The MVT links the average rate to an instantaneous rate.', chk: { k: 'fn', test: function (spec, val) { return near(val(spec), D / Tm) ? true : 'speed'; } }
      };
    }
    var t = R.pick(['yes', 'corner', 'break', 'cusp']), A5 = R.int(-3, 0), B5 = A5 + R.int(3, 5), mm = R.int(A5 + 1, B5 - 1), fT, why;
    var C = ['Yes: $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$.', 'No: $f$ is not differentiable at some point inside the interval.', 'No: $f$ is not continuous on the interval.'];
    if (t === 'yes') { fT = P([R.int(-3, 3), R.int(-3, 3), 0, 1]).tex(); why = 'A polynomial is continuous and differentiable everywhere, so the theorem applies.'; }
    else if (t === 'corner') { fT = '\\lvert ' + xm(mm) + ' \\rvert'; why = '$f$ has a corner at $x = ' + mm + '$, inside the interval, so it is not differentiable there. The theorem does not apply.'; }
    else if (t === 'cusp') { fT = '(' + xm(mm) + ')^{2/3}'; why = '$f$ has a cusp at $x = ' + mm + '$ (its derivative blows up there), so it is not differentiable on the whole open interval.'; }
    else { fT = frac(1, xm(mm)); why = '$f$ is undefined at $x = ' + mm + '$, inside the interval, so it is not continuous there.'; }
    return {
      q: 'Does the Mean Value Theorem apply to $f(x) = ' + fT + '$ on $[' + A5 + ', ' + B5 + ']$?',
      a: { t: 'mc', choices: C, v: t === 'yes' ? 0 : t === 'break' ? 2 : 1, keep: true },
      steps: ['The MVT needs two things: continuity on the closed interval and differentiability on the open interval.', why],
      hint: 'Check continuity on [a, b] and differentiability on (a, b).', chk: { k: 'mc' }
    };
  });

  G('calc1.first-derivative-test', function (R, ctx) {
    var kind = lv(ctx, R.pick(['inc', 'ext']), R.pick(['inc', 'dec', 'ext', 'neither']), R.pick(['chart', 'neither', 'inc', 'ext']));
    if (kind === 'chart') {
      var a = R.int(-3, 2), b = a + R.int(1, 4), sw = R.coin(), dbl = sw ? a : b, sgl = sw ? b : a, s = R.pick([1, -1]);
      var fpT = (s < 0 ? '-' : '') + '(' + xm(dbl) + ')^{2}(' + xm(sgl) + ')';
      return {
        q: 'A function $f$ has derivative $f\'(x) = ' + fpT + '$. At what $x$ does $f$ have a local ' + (s > 0 ? 'minimum' : 'maximum') + '?',
        a: { t: 'set', v: [String(sgl)] },
        steps: ['Critical numbers: $x = ' + Math.min(a, b) + '$ and $x = ' + Math.max(a, b) + '$.', 'The squared factor $(' + xm(dbl) + ')^{2}$ is never negative, so $f\'$ does not change sign at $x = ' + dbl + '$: no extremum there, even though $f\'(' + dbl + ') = 0$.',
          'At $x = ' + sgl + '$ the factor $' + xm(sgl) + '$ changes sign, so $f\'$ goes from ' + (s > 0 ? 'negative to positive: a local minimum.' : 'positive to negative: a local maximum.')],
        hint: 'Check whether f′ actually changes sign at each critical number.', chk: { k: 'set', test: function (vs) { return vs.length === 1 && vs[0] === sgl ? true : 'chart'; } }
      };
    }
    if (kind === 'neither') {
      var k = R.int(1, 2), c0 = R.int(-5, 5), f0 = P([c0, 0, 0, -4 * k, 1]);
      return {
        q: 'Let $f(x) = ' + f0.tex() + '$. Classify the critical number $x = 0$.',
        a: { t: 'mc', choices: ['Local maximum', 'Local minimum', 'Neither a maximum nor a minimum'], v: 2, keep: true },
        steps: ['$f\'(x) = 4x^{3} - ' + (12 * k) + 'x^{2} = 4x^{2}(' + xm(3 * k) + ')$, so the critical numbers are $0$ and $' + (3 * k) + '$.',
          'Just left of 0, $f\'(x) = 4x^{2}(' + xm(3 * k) + ')$ is negative; just right of 0 it is still negative ($x^{2} > 0$ and $' + xm(3 * k) + ' < 0$).',
          '$f\'$ does not change sign at 0, so $f$ keeps falling through $x = 0$: neither a max nor a min. (At $x = ' + (3 * k) + '$ there is a local minimum.)'],
        hint: 'Test the sign of f′ on both sides of 0.', chk: { k: 'mc' }
      };
    }
    var p = R.int(-3, 2), q2 = p + R.int(1, 4), s2 = R.pick([1, -1]), f = niceCubic(p, q2, R.int(-6, 6), s2), fp = f.d();
    var incParts = s2 > 0 ? [['-inf', p], [q2, 'inf']] : [[p, q2]], decParts = s2 > 0 ? [[p, q2]] : [['-inf', p], [q2, 'inf']];
    var chart = 'Sign chart for $f\'(x) = ' + tx(fp.lead()) + '(' + xm(p) + ')(' + xm(q2) + ')$: ' + (s2 > 0 ? 'positive, then negative between $' + p + '$ and $' + q2 + '$, then positive.' : 'negative, then positive between $' + p + '$ and $' + q2 + '$, then negative.');
    if (kind === 'inc' || kind === 'dec') {
      var parts = kind === 'inc' ? incParts : decParts;
      return {
        q: 'On what intervals is $f(x) = ' + f.tex() + '$ ' + (kind === 'inc' ? 'increasing' : 'decreasing') + '? Answer in interval notation.',
        a: { t: 'interval', v: ivlStr(parts) },
        steps: ['$f\'(x) = ' + fp.tex() + '$, which is 0 at $x = ' + p + '$ and $x = ' + q2 + '$. These split the line into three pieces.', chart, '$f$ is ' + (kind === 'inc' ? 'increasing where $f\' > 0$' : 'decreasing where $f\' < 0$') + ': $' + ivlT(parts) + '$.'],
        hint: 'Find where f′ = 0, then test the sign of f′ in each piece.', chk: { k: 'ivl', g: fp.plain(), sign: kind === 'inc' ? 1 : -1 }
      };
    }
    var askMax = R.coin(), xx = (askMax === (s2 > 0)) ? p : q2;
    return {
      q: 'Let $f(x) = ' + f.tex() + '$. Where does $f$ have a local ' + (askMax ? 'maximum' : 'minimum') + '? Give the $x$-value.',
      a: num(xx),
      steps: ['$f\'(x) = ' + fp.tex() + '$, which is 0 at $x = ' + p + '$ and $x = ' + q2 + '$.', chart,
        'A local maximum is where $f\'$ changes from $+$ to $-$; a local minimum is where it changes from $-$ to $+$.', 'So the local ' + (askMax ? 'maximum' : 'minimum') + ' is at $x = ' + xx + '$.'],
      hint: 'Make a sign chart for f′.', chk: { k: 'fn', test: function (spec, val) { var x = val(spec), h = 1e-3, l = fp.at(q(x - h)).toNumber(), r = fp.at(q(x + h)).toNumber(); return (askMax ? l > 0 && r < 0 : l < 0 && r > 0) ? true : 'not a local ' + (askMax ? 'max' : 'min'); } }
    };
  });

  G('calc1.concavity', function (R, ctx) {
    var kind = lv(ctx, R.pick(['infl', 'up']), R.pick(['quartic', 'sdt', 'up', 'infl']), R.pick(['flat', 'quartic', 'sdt', 'down']));
    if (kind === 'flat') {
      var t = R.pick(['x4', 'x4', 'x5', 'x3']), b = R.int(-4, 4), n = t === 'x4' ? 4 : t === 'x5' ? 5 : 3, fT = 'x^{' + n + '}' + T.coef(b, 'x', false), yes = n !== 4;
      return {
        q: 'Let $f(x) = ' + fT + '$, so $f\'\'(0) = 0$. Does $f$ have an inflection point at $x = 0$?',
        a: { t: 'mc', choices: ['Yes: $f\'\'$ changes sign at $x = 0$.', 'No: $f\'\'$ does not change sign at $x = 0$.', 'Yes: $f\'\'(0) = 0$ is enough.'], v: yes ? 0 : 1, keep: true },
        steps: ['$f\'\'(x) = ' + (n * (n - 1)) + 'x^{' + (n - 2) + '}$.'.replace('x^{1}', 'x'), yes ? 'For $x < 0$, $f\'\' < 0$ (concave down); for $x > 0$, $f\'\' > 0$ (concave up). The concavity changes, so $x = 0$ is an inflection point.' : '$f\'\'(x) = 12x^{2} \\ge 0$ on both sides of 0: concave up throughout. No change, so no inflection point, even though $f\'\'(0) = 0$.',
          '$f\'\' = 0$ only makes a point a candidate; the sign must change.'],
        hint: 'Check the sign of f″ on each side of 0.', chk: { k: 'mc' }
      };
    }
    if (kind === 'quartic') {
      var k = R.int(1, 3), c = R.int(-5, 5), lin = R.int(-4, 4), f = P([c, lin, -6 * k * k, 0, 1]), f2 = f.d().d(), askSet = R.coin();
      return {
        q: askSet ? 'Find the $x$-coordinates of the inflection points of $f(x) = ' + f.tex() + '$.' : 'On what interval is $f(x) = ' + f.tex() + '$ concave down? Answer in interval notation.',
        a: askSet ? { t: 'set', v: [String(k), String(-k)] } : { t: 'interval', v: '(' + (-k) + ', ' + k + ')' },
        steps: ['$f\'(x) = ' + f.d().tex() + '$ and $f\'\'(x) = ' + f2.tex() + ' = 12(' + xm(k) + ')(' + xm(-k) + ')$.', '$f\'\'$ is positive for $x < ' + (-k) + '$, negative between $' + (-k) + '$ and $' + k + '$, and positive for $x > ' + k + '$.',
          askSet ? 'The concavity changes at both $x = ' + (-k) + '$ and $x = ' + k + '$, so both are inflection points.' : 'Concave down where $f\'\' < 0$: $(' + (-k) + ', ' + k + ')$.'],
        hint: 'Find f″, then where it changes sign.', chk: askSet ? { k: 'set', test: function (vs) { return vs.length === 2 && vs.every(function (x) { return Math.abs(f2.at(q(x)).toNumber()) < 1e-12; }) ? true : 'infl'; } } : { k: 'ivl', g: f2.plain(), sign: -1 }
      };
    }
    var p = R.int(-3, 2), q2 = p + 2 * R.int(1, 2), s = R.pick([1, -1]), f3 = niceCubic(p, q2, R.int(-6, 6), s), d2 = f3.d().d(), m = (p + q2) / 2;
    if (kind === 'sdt') {
      var at = R.pick([p, q2]), sec = d2.at(at), isMin = sec.sign() > 0;
      return {
        q: 'Let $f(x) = ' + f3.tex() + '$. Use the second derivative test to classify the critical number $x = ' + at + '$.',
        a: { t: 'mc', choices: ['Local minimum', 'Local maximum', 'The test gives no information'], v: isMin ? 0 : 1, keep: true },
        steps: ['$f\'(x) = ' + f3.d().tex() + '$, so $f\'(' + at + ') = 0$.', '$f\'\'(x) = ' + d2.tex() + '$, so $f\'\'(' + at + ') = ' + tx(sec) + '$.',
          isMin ? 'Positive second derivative: the graph is concave up there (a cup), so $x = ' + at + '$ is a local minimum.' : 'Negative second derivative: the graph is concave down there (a cap), so $x = ' + at + '$ is a local maximum.'],
        hint: 'f′(c) = 0 and f″(c) > 0 means a cup: local minimum.', chk: { k: 'mc' }
      };
    }
    if (kind === 'infl') {
      return {
        q: 'Find the $x$-coordinate of the inflection point of $f(x) = ' + f3.tex() + '$.',
        a: num(m),
        steps: ['$f\'(x) = ' + f3.d().tex() + '$ and $f\'\'(x) = ' + d2.tex() + '$.', '$f\'\'(x) = 0$ at $x = ' + m + '$, and since $f\'\'$ is a line with nonzero slope, it changes sign there.', 'So the inflection point is at $x = ' + m + '$.'],
        hint: 'Set f″(x) = 0 and check that it changes sign.', chk: { k: 'fn', test: function (spec, val) { var x = val(spec); return d2.at(q(x - 0.01)).sign() * d2.at(q(x + 0.01)).sign() < 0 ? true : 'not inflection'; } }
      };
    }
    var up = kind === 'up', parts = (s > 0) === up ? [[m, 'inf']] : [['-inf', m]];
    return {
      q: 'On what interval is $f(x) = ' + f3.tex() + '$ concave ' + (up ? 'up' : 'down') + '? Answer in interval notation.',
      a: { t: 'interval', v: ivlStr(parts) },
      steps: ['$f\'\'(x) = ' + d2.tex() + '$, which is 0 at $x = ' + m + '$.', 'Test the sign: $f\'\'$ is ' + (s > 0 ? 'negative to the left of ' + m + ' and positive to the right.' : 'positive to the left of ' + m + ' and negative to the right.'),
        'Concave ' + (up ? 'up where $f\'\' > 0$' : 'down where $f\'\' < 0$') + ': $' + ivlT(parts) + '$.'],
      hint: 'Concave up where f″ > 0.', chk: { k: 'ivl', g: d2.plain(), sign: up ? 1 : -1 }
    };
  });

  G('calc1.curve-sketching', function (R, ctx) {
    var kind = lv(ctx, 'cubic', R.pick(['cubic', 'rational', 'bump']), R.pick(['bump', 'xplus', 'rational', 'quartic']));
    if (kind === 'cubic') {
      var p = R.int(-3, 1), q2 = p + 2 * R.int(1, 2), s = R.pick([1, -1]), f = niceCubic(p, q2, R.int(-6, 6), s), d1 = f.d(), d2 = d1.d(), mx = s > 0 ? p : q2, mn = s > 0 ? q2 : p, m = (p + q2) / 2;
      return {
        q: 'For $f(x) = ' + f.tex() + '$, find the $x$-values of the local maximum, the local minimum and the inflection point.',
        a: multi([['local max at $x =$', num(mx)], ['local min at $x =$', num(mn)], ['inflection at $x =$', num(m)]]),
        steps: ['$f\'(x) = ' + d1.tex() + ' = ' + tx(d1.lead()) + '(' + xm(p) + ')(' + xm(q2) + ')$: critical numbers $' + p + '$ and $' + q2 + '$.',
          '$f\'\'(x) = ' + d2.tex() + '$. Second derivative test: $f\'\'(' + p + ') = ' + tx(d2.at(p)) + '$ and $f\'\'(' + q2 + ') = ' + tx(d2.at(q2)) + '$.',
          'Negative means a cap (local max), positive a cup (local min): max at $x = ' + mx + '$, min at $x = ' + mn + '$.',
          '$f\'\' = 0$ at $x = ' + m + '$, where the concavity flips: the inflection point, halfway between the two turning points.'],
        hint: 'Critical numbers from f′, classification and inflection from f″.',
        chk: [{ k: 'fn', test: function (spec, val) { var x = val(spec); return d1.at(q(x)).isZero() && d2.at(q(x)).sign() < 0 ? true : 'max'; } }, { k: 'fn', test: function (spec, val) { var x = val(spec); return d1.at(q(x)).isZero() && d2.at(q(x)).sign() > 0 ? true : 'min'; } }, { k: 'fn', test: function (spec, val) { return d2.at(q(val(spec))).isZero() ? true : 'infl'; } }]
      };
    }
    if (kind === 'rational') {
      var a = R.nz(-4, 4), b = R.int(-6, 6), c = R.int(-4, 4); if (a * c + b === 0) b++;
      var inc = -(a * c + b) > 0;
      return {
        q: 'For $f(x) = ' + dfrac(linT(a, b), xm(c)) + '$, find the vertical asymptote, the horizontal asymptote, and how $f$ behaves on each side of the vertical asymptote.',
        a: multi([['vertical asymptote $x =$', num(c)], ['horizontal asymptote $y =$', num(a)], ['on each side of the asymptote, $f$ is', { t: 'mc', choices: ['increasing', 'decreasing'], v: inc ? 0 : 1, keep: true }]]),
        steps: ['Vertical asymptote where the bottom is 0 and the top is not: $x = ' + c + '$ (the top there is $' + (a * c + b) + '$).', 'As $x \\to \\pm\\infty$, $f(x) \\to ' + tx(a) + '$ (ratio of the leading coefficients): horizontal asymptote $y = ' + a + '$.',
          'Quotient rule: $f\'(x) = ' + frac(tx(a) + '(' + xm(c) + ') - (' + linT(a, b) + ')', '(' + xm(c) + ')^{2}') + ' = ' + frac(-(a * c + b), '(' + xm(c) + ')^{2}') + '$.',
          'The bottom is always positive, so $f\'$ has the sign of $' + (-(a * c + b)) + '$: $f$ is ' + (inc ? 'increasing' : 'decreasing') + ' on each side of $x = ' + c + '$.'],
        hint: 'Asymptotes from the formula, behavior from the sign of f′.',
        chk: [{ k: 'val', v: c }, { k: 'val', v: a }, { k: 'mc' }]
      };
    }
    if (kind === 'bump') {
      var k = R.pick([1, 2, 3, 4, 6]), aa = R.int(1, 3), fP = k + 'x/(x^2+' + (aa * aa) + ')', ymax = q(k).div(2 * aa);
      return {
        q: 'For $f(x) = ' + dfrac(T.coef(k, 'x'), 'x^{2} + ' + (aa * aa)) + '$, find the location and value of the local maximum, and the horizontal asymptote.',
        a: multi([['local max at $x =$', num(aa)], ['local max value $=$', num(ymax)], ['horizontal asymptote $y =$', num(0)]]),
        steps: ['Quotient rule: $f\'(x) = ' + frac((k === 1 ? '' : k) + '(x^{2} + ' + (aa * aa) + ') - ' + T.coef(k, 'x(2x)'), '(x^{2} + ' + (aa * aa) + ')^{2}') + ' = ' + frac((k === 1 ? '' : k) + '(' + (aa * aa) + ' - x^{2})', '(x^{2} + ' + (aa * aa) + ')^{2}') + '$.',
          '$f\' = 0$ at $x = \\pm ' + aa + '$. $f\'$ is positive between them and negative outside, so $x = ' + aa + '$ is a local max (and $x = ' + (-aa) + '$ a local min).',
          '$f(' + aa + ') = ' + frac(k * aa, (2 * aa * aa)) + ' = ' + tx(ymax) + '$.', 'Degree of top < degree of bottom, so $f(x) \\to 0$: horizontal asymptote $y = 0$.'],
        hint: 'Find f′ with the quotient rule and solve f′ = 0.',
        chk: [{ k: 'fn', test: function (spec, val, fn, nd) { var f = fn(fP), x = val(spec); return Math.abs(nd(f, x)) < 1e-7 && f(x) > f(x - 0.01) && f(x) > f(x + 0.01) ? true : 'max'; } }, { k: 'fn', test: function (spec, val, fn) { return near(fn(fP)(aa), val(spec)) ? true : 'value'; } }, { k: 'lim', f: fP, a: 'inf' }]
      };
    }
    if (kind === 'xplus') {
      var k2 = R.int(1, 5), fP2 = 'x+' + (k2 * k2) + '/x';
      return {
        q: 'For $f(x) = x + ' + frac(k2 * k2, 'x') + '$, find the local minimum value, the local maximum value, and the vertical asymptote.',
        a: multi([['local min value $=$', num(2 * k2)], ['local max value $=$', num(-2 * k2)], ['vertical asymptote $x =$', num(0)]]),
        steps: ['$f\'(x) = 1 - ' + frac(k2 * k2, 'x^{2}') + '$, which is 0 at $x = \\pm ' + k2 + '$.', 'For $x > 0$: $f\'$ goes from negative to positive at $x = ' + k2 + '$, a local min with value $' + k2 + ' + ' + k2 + ' = ' + (2 * k2) + '$.',
          'For $x < 0$: $f\'$ goes from positive to negative at $x = ' + (-k2) + '$, a local max with value $' + (-2 * k2) + '$.', 'The local max value is below the local min value: the two pieces are separated by the vertical asymptote $x = 0$. (The line $y = x$ is a slant asymptote.)'],
        hint: 'Solve f′(x) = 0 and classify each critical number.',
        chk: [{ k: 'fn', test: function (spec, val, fn) { return near(fn(fP2)(k2), val(spec)) ? true : 'min'; } }, { k: 'fn', test: function (spec, val, fn) { return near(fn(fP2)(-k2), val(spec)) ? true : 'max'; } }, { k: 'val', v: 0 }]
      };
    }
    var k3 = R.int(1, 3), fq = P([0, 0, -2 * k3 * k3, 0, 1]);
    return {
      q: 'For $f(x) = ' + fq.tex() + '$, find the local maximum value, the $x$-values of the local minima, and the $x$-values of the inflection points.',
      a: multi([['local max value $=$', num(0)], ['local minima at $x =$', { t: 'set', v: [String(k3), String(-k3)] }], ['inflection points at $x =$', { t: 'set', v: [k3 + '*sqrt(3)/3', '-' + k3 + '*sqrt(3)/3'] }]]),
      steps: ['$f\'(x) = 4x^{3} - ' + (4 * k3 * k3) + 'x = 4x(x^{2} - ' + (k3 * k3) + ')$: critical numbers $0, \\pm ' + k3 + '$.', 'Sign chart: $f\'$ is $-, +, -, +$ across them, so local minima at $x = \\pm ' + k3 + '$ and a local max at $x = 0$, where $f(0) = 0$.',
        '$f\'\'(x) = 12x^{2} - ' + (4 * k3 * k3) + '$, zero at $x^{2} = ' + tx(q(k3 * k3).div(3)) + '$, so $x = \\pm ' + (k3 === 1 ? frac('\\sqrt{3}', 3) : frac(k3 + '\\sqrt{3}', 3)) + '$; $f\'\'$ changes sign at both.'],
      hint: 'Use f′ for the extrema and f″ for the inflection points.',
      chk: [{ k: 'val', v: 0 }, { k: 'set', test: function (vs) { return vs.length === 2 && vs.every(function (x) { return Math.abs(fq.d().at(q(x)).toNumber()) < 1e-12; }) ? true : 'min'; } }, { k: 'set', test: function (vs) { return vs.length === 2 && vs.every(function (x) { return Math.abs(12 * x * x - 4 * k3 * k3) < 1e-9; }) ? true : 'infl'; } }]
    };
  });

  G('calc1.optimization', function (R, ctx) {
    var kind = lv(ctx, R.pick(['perim', 'sum', 'river']), R.pick(['river', 'box', 'pens', 'price']), R.pick(['box', 'closest', 'cost', 'price', 'pens']));
    function maxChk(obj, lo, hi, isMin) { return { k: 'fn', test: function (spec, val) { var best = isMin ? Infinity : -Infinity, N = 20000; for (var i = 1; i < N; i++) { var x = lo + (hi - lo) * i / N, v = obj(x); best = isMin ? Math.min(best, v) : Math.max(best, v); } return Math.abs(best - val(spec)) < 1e-5 * Math.max(1, Math.abs(best)) ? true : 'numeric optimum ' + best; } }; }
    function argChk(obj, lo, hi, isMin) { return { k: 'fn', test: function (spec, val) { var bx = lo, best = isMin ? Infinity : -Infinity, N = 200000; for (var i = 1; i < N; i++) { var x = lo + (hi - lo) * i / N, v = obj(x); if (isMin ? v < best : v > best) { best = v; bx = x; } } return Math.abs(bx - val(spec)) < 1e-3 * Math.max(1, Math.abs(bx)) ? true : 'numeric argmax ' + bx; } }; }
    var model = 'Steps: name the variables, write the quantity to optimize as a function of one variable, find its domain, then set the derivative to 0.';
    if (kind === 'perim') {
      var Pm = 4 * R.int(5, 40), A = q(Pm * Pm).div(16);
      return {
        q: 'A rectangle has a perimeter of ' + Pm + ' m. What is the largest area it can have?', a: num(A), unit: 'm²',
        steps: [model, 'Sides $x$ and $y$: $2x + 2y = ' + Pm + '$, so $y = ' + (Pm / 2) + ' - x$.', 'Area $A(x) = x(' + (Pm / 2) + ' - x) = ' + (Pm / 2) + 'x - x^{2}$ on $0 < x < ' + (Pm / 2) + '$.', '$A\'(x) = ' + (Pm / 2) + ' - 2x = 0$ gives $x = ' + (Pm / 4) + '$, and $A\'\' = -2 < 0$: a maximum.', 'Then $y = ' + (Pm / 4) + '$ (a square), and $A = ' + (Pm / 4) + '^{2} = ' + tx(A) + '$ m².'],
        hint: 'Write the area as a function of one side.', chk: maxChk(function (x) { return x * (Pm / 2 - x); }, 0, Pm / 2)
      };
    }
    if (kind === 'sum') {
      var S = 2 * R.int(5, 30), t = R.pick(['prod', 'sq']);
      if (t === 'prod') return { q: 'Two positive numbers add up to ' + S + '. What is the largest possible value of their product?', a: num(S * S / 4), steps: [model, 'Numbers $x$ and $' + S + ' - x$; product $P(x) = x(' + S + ' - x)$ on $0 < x < ' + S + '$.', '$P\'(x) = ' + S + ' - 2x = 0$ gives $x = ' + (S / 2) + '$; $P\'\' = -2 < 0$, a maximum.', 'Both numbers are $' + (S / 2) + '$, and the product is $' + (S * S / 4) + '$.'], hint: 'Write the product in terms of one number.', chk: maxChk(function (x) { return x * (S - x); }, 0, S) };
      return { q: 'Two positive numbers add up to ' + S + '. What is the smallest possible value of the sum of their squares?', a: num(S * S / 2), steps: [model, 'Numbers $x$ and $' + S + ' - x$; $Q(x) = x^{2} + (' + S + ' - x)^{2}$ on $0 < x < ' + S + '$.', '$Q\'(x) = 2x - 2(' + S + ' - x) = 4x - ' + (2 * S) + ' = 0$ gives $x = ' + (S / 2) + '$; $Q\'\' = 4 > 0$, a minimum.', '$Q = 2 \\cdot ' + (S / 2) + '^{2} = ' + (S * S / 2) + '$.'], hint: 'Write the sum of squares in terms of one number.', chk: maxChk(function (x) { return x * x + (S - x) * (S - x); }, 0, S, true) };
    }
    if (kind === 'river') {
      var F = 4 * R.int(10, 100), askA = R.coin(), Ar = q(F * F).div(8);
      return {
        q: 'A farmer has ' + F + ' ft of fence to enclose a rectangular field along a straight river. No fence is needed along the river. ' + (askA ? 'What is the largest area she can enclose?' : 'How long should the side parallel to the river be to enclose the most area?'),
        a: num(askA ? Ar : q(F / 2)), unit: askA ? 'ft²' : 'ft',
        steps: [model, 'Let $x$ be each side perpendicular to the river and $y$ the side parallel to it: $2x + y = ' + F + '$, so $y = ' + F + ' - 2x$.',
          '$A(x) = x(' + F + ' - 2x) = ' + F + 'x - 2x^{2}$ on $0 < x < ' + (F / 2) + '$.', '$A\'(x) = ' + F + ' - 4x = 0$ gives $x = ' + (F / 4) + '$; $A\'\' = -4 < 0$, a maximum.',
          'Then $y = ' + F + ' - 2(' + (F / 4) + ') = ' + (F / 2) + '$ ft and $A = ' + (F / 4) + ' \\cdot ' + (F / 2) + ' = ' + tx(Ar) + '$ ft².'],
        hint: 'Only three sides need fence. Write the area in terms of the perpendicular side.',
        chk: askA ? maxChk(function (x) { return x * (F - 2 * x); }, 0, F / 2) : { k: 'fn', test: function (spec, val) { return near(val(spec), F / 2) ? true : 'river side'; } }
      };
    }
    if (kind === 'box') {
      var s = 6 * R.int(1, 8), askV = R.coin(), xc = s / 6, V = 2 * s * s * s / 27;
      return {
        q: 'An open-top box is made from a square sheet of cardboard ' + s + ' in on a side by cutting equal squares from the corners and folding up the sides. ' + (askV ? 'What is the largest possible volume?' : 'What size square should be cut from each corner to make the volume as large as possible? Give its side length.'),
        a: num(askV ? V : xc), unit: askV ? 'in³' : 'in',
        steps: [model, 'Cut squares of side $x$. The base is $' + s + ' - 2x$ on each side and the height is $x$: $V(x) = x(' + s + ' - 2x)^{2}$ on $0 < x < ' + (s / 2) + '$.',
          '$V\'(x) = (' + s + ' - 2x)^{2} - 4x(' + s + ' - 2x) = (' + s + ' - 2x)(' + s + ' - 6x)$.',
          '$V\' = 0$ at $x = ' + (s / 2) + '$ (an endpoint, volume 0) or $x = ' + xc + '$. $V$ rises before ' + xc + ' and falls after: a maximum.',
          'Cut $' + xc + '$-in squares; $V = ' + xc + '(' + (s - 2 * xc) + ')^{2} = ' + V + '$ in³.'],
        hint: 'Volume = x(side − 2x)². Find where V′ = 0 inside the domain.',
        chk: askV ? maxChk(function (x) { return x * (s - 2 * x) * (s - 2 * x); }, 0, s / 2) : argChk(function (x) { return x * (s - 2 * x) * (s - 2 * x); }, 0, s / 2)
      };
    }
    if (kind === 'pens') {
      var n = R.int(2, 4), Fp = 4 * (n + 1) * R.int(2, 10), Am = q(Fp * Fp).div(8 * (n + 1));
      return {
        q: 'With ' + Fp + ' m of fence, a rectangular area is enclosed and split into ' + n + ' pens by ' + (n - 1) + ' fence' + (n > 2 ? 's' : '') + ' parallel to one side. What is the largest total area?',
        a: num(Am), unit: 'm²',
        steps: [model, 'Let $y$ be the length of the sides parallel to the dividers and $x$ the other side. There are $' + (n + 1) + '$ pieces of length $y$ and $2$ of length $x$: $2x + ' + (n + 1) + 'y = ' + Fp + '$.',
          'So $x = ' + tx(q(Fp).div(2)) + ' - ' + tx(q(n + 1).div(2)) + 'y$ and $A(y) = xy = ' + tx(q(Fp).div(2)) + 'y - ' + tx(q(n + 1).div(2)) + 'y^{2}$.',
          '$A\'(y) = ' + tx(q(Fp).div(2)) + ' - ' + (n + 1) + 'y = 0$ gives $y = ' + tx(q(Fp).div(2 * (n + 1))) + '$, a maximum (the parabola opens down).',
          'Then $x = ' + tx(q(Fp).div(4)) + '$ and $A = ' + tx(q(Fp).div(4)) + ' \\cdot ' + tx(q(Fp).div(2 * (n + 1))) + ' = ' + tx(Am) + '$ m².'],
        hint: 'Count the fence pieces carefully, then write the area in terms of one variable.',
        chk: maxChk(function (y) { return y * (Fp - (n + 1) * y) / 2; }, 0, Fp / (n + 1))
      };
    }
    if (kind === 'price') {
      var B = R.pick([2, 4, 5, 10]), pStar = R.int(5, 30), Aq = 2 * B * pStar, c = R.pick([0, 0, 2, 4]), pOpt = q(Aq + B * c).div(2 * B);
      return {
        q: 'A shop sells $q = ' + Aq + ' - ' + B + 'p$ mugs per week at a price of $p$ dollars' + (c ? ', and each mug costs the shop \\$' + c + ' to make' : '') + '. What price maximizes the weekly ' + (c ? 'profit' : 'revenue') + '?',
        a: numD(pOpt), unit: 'dollars',
        steps: [model, c ? 'Profit $= (p - ' + c + ')(' + Aq + ' - ' + B + 'p)$: profit per mug times mugs sold.' : 'Revenue $R(p) = p(' + Aq + ' - ' + B + 'p) = ' + Aq + 'p - ' + B + 'p^{2}$.',
          c ? 'Expand: $P(p) = -' + B + 'p^{2} + ' + (Aq + B * c) + 'p - ' + (Aq * c) + '$, so $P\'(p) = -' + (2 * B) + 'p + ' + (Aq + B * c) + '$.' : '$R\'(p) = ' + Aq + ' - ' + (2 * B) + 'p$.',
          'Set it to 0: $p = ' + frac(Aq + B * c, 2 * B) + ' = ' + tx(pOpt) + '$. The second derivative is $-' + (2 * B) + ' < 0$, so this is a maximum.',
          'Charge \\$' + (pOpt.isInt() ? tx(pOpt) : dec(pOpt)) + '.'],
        hint: (c ? 'Profit' : 'Revenue') + ' is a quadratic in p. Find where its derivative is 0.',
        chk: argChk(function (p) { return (p - c) * (Aq - B * p); }, c, Aq / B)
      };
    }
    if (kind === 'closest') {
      var a2 = R.int(1, 6) + R.pick([0, 0.5]), x2 = q(a2).sub(q(1).div(2));
      return {
        q: 'Find the $x$-coordinate of the point on the curve $y = \\sqrt{x}$ that is closest to the point $(' + dec(q(a2)) + ', 0)$.',
        a: numD(x2),
        steps: [model, 'A point on the curve is $(x, \\sqrt{x})$. Minimize the squared distance (same minimizer, simpler algebra): $D(x) = (x - ' + dec(q(a2)) + ')^{2} + x$.',
          '$D\'(x) = 2(x - ' + dec(q(a2)) + ') + 1 = 0$ gives $x = ' + dec(q(a2)) + ' - ' + frac(1, 2) + ' = ' + tx(x2) + '$.', '$D\'\' = 2 > 0$, so this is a minimum. The closest point has $x = ' + tx(x2) + '$.'],
        hint: 'Minimize the square of the distance; it has the same minimizer.',
        chk: argChk(function (x) { return (x - a2) * (x - a2) + x; }, 0, 20, true)
      };
    }
    var c2 = 2, c1 = R.pick([2, 4, 6]), xs2 = 2 * R.int(5, 20), Area = xs2 * xs2 * (c1 + c2) / (2 * c2);
    return {
      q: 'A rectangular lot of ' + Area + ' ft² will be fenced. The fence along the front costs \\$' + c1 + ' per foot and the other three sides cost \\$' + c2 + ' per foot. How long should the front be to make the cost as small as possible?',
      a: num(xs2), unit: 'ft',
      steps: [model, 'Front length $x$, depth $y$, with $xy = ' + Area + '$, so $y = ' + frac(Area, 'x') + '$.',
        'Cost: front $' + c1 + 'x$, back $' + c2 + 'x$, two sides $2 \\cdot ' + c2 + 'y$: $C(x) = ' + (c1 + c2) + 'x + ' + frac(2 * c2 * Area, 'x') + '$ for $x > 0$.',
        '$C\'(x) = ' + (c1 + c2) + ' - ' + frac(2 * c2 * Area, 'x^{2}') + ' = 0$ gives $x^{2} = ' + (2 * c2 * Area / (c1 + c2)) + '$, so $x = ' + xs2 + '$.', '$C\'\' > 0$ for $x > 0$, so this is a minimum: a front of ' + xs2 + ' ft.'],
      hint: 'Write the cost using the area to eliminate one variable.', chk: argChk(function (x) { return (c1 + c2) * x + 2 * c2 * Area / x; }, 1, 200, true)
    };
  });

  G('calc1.lhopital', function (R, ctx) {
    var kind = lv(ctx, R.pick(['exp', 'ln', 'sinexp']), R.pick(['pow', 'inf', 'trap', 'twice', 'exp']), R.pick(['twice', 'e', 'xln', 'inf', 'trap']));
    var a = R.int(2, 7), b = R.intNot(2, 9, a), L, fT, fP, st, lim0 = lim(0), atP = 0, side = 0;
    var rule = 'The limit has the form $' + frac(0, 0) + '$, so L\'Hôpital\'s rule applies: replace the top and bottom by their derivatives (separately; this is not the quotient rule).';
    if (kind === 'exp') { L = q(a).div(b); fT = dfrac('e^{' + a + 'x} - 1', b + 'x'); fP = '(e^(' + a + 'x)-1)/(' + b + 'x)'; st = [rule, 'Derivatives: top $' + a + 'e^{' + a + 'x}$, bottom $' + b + '$.', 'Limit: $' + frac(a + 'e^{0}', b) + ' = ' + tx(L) + '$.']; }
    else if (kind === 'ln') { L = q(a).div(b); fT = dfrac('\\ln(1 + ' + a + 'x)', b + 'x'); fP = 'ln(1+' + a + 'x)/(' + b + 'x)'; st = [rule, 'Derivatives: top $' + frac(a, '1 + ' + a + 'x') + '$, bottom $' + b + '$.', 'Limit: $' + frac(a, b) + (gcd(a, b) > 1 ? ' = ' + tx(L) : '') + '$.']; }
    else if (kind === 'sinexp') { L = q(a).div(b); fT = dfrac('\\sin(' + a + 'x)', 'e^{' + b + 'x} - 1'); fP = 'sin(' + a + 'x)/(e^(' + b + 'x)-1)'; st = [rule, 'Derivatives: top $' + a + '\\cos(' + a + 'x)$, bottom $' + b + 'e^{' + b + 'x}$.', 'At $x = 0$: $' + frac(a + ' \\cdot 1', b + ' \\cdot 1') + ' = ' + tx(L) + '$.']; }
    else if (kind === 'pow') { var c = R.int(1, 3), n = R.int(3, 6); atP = c; L = q(n * Math.pow(c, n - 1)); fT = dfrac('x^{' + n + '} - ' + Math.pow(c, n), xm(c)); fP = '(x^' + n + '-' + Math.pow(c, n) + ')/(x-' + c + ')'; lim0 = lim(c); st = ['At $x = ' + c + '$ both top and bottom are 0: form $' + frac(0, 0) + '$.', 'Derivatives: top $' + n + 'x^{' + (n - 1) + '}$, bottom $1$.', 'Limit: $' + n + ' \\cdot ' + c + '^{' + (n - 1) + '} = ' + tx(L) + '$. (Factoring would also work, but this is quicker.)']; }
    else if (kind === 'twice') { var tw = R.coin(); L = q(a * a).div(2); fT = tw ? dfrac('1 - \\cos(' + a + 'x)', 'x^{2}') : dfrac('e^{' + a + 'x} - 1 - ' + a + 'x', 'x^{2}'); fP = tw ? '(1-cos(' + a + 'x))/x^2' : '(e^(' + a + 'x)-1-' + a + 'x)/x^2';
      st = [rule, tw ? 'Once: $' + frac(a + '\\sin(' + a + 'x)', '2x') + '$, still $' + frac(0, 0) + '$.' : 'Once: $' + frac(a + 'e^{' + a + 'x} - ' + a, '2x') + '$, still $' + frac(0, 0) + '$.', tw ? 'Again: $' + frac((a * a) + '\\cos(' + a + 'x)', 2) + ' \\to ' + frac(a * a, 2) + '$.' : 'Again: $' + frac((a * a) + 'e^{' + a + 'x}', 2) + ' \\to ' + frac(a * a, 2) + '$.', 'So the limit is $' + tx(L) + '$.']; }
    else if (kind === 'inf') { var t = R.pick(['xe', 'lnx', 'ex']), n2 = R.int(1, 3), k = R.int(1, 3);
      if (t === 'xe') { L = 'zero'; fT = dfrac('x^{' + n2 + '}', 'e^{' + (k === 1 ? '' : k) + 'x}').replace('x^{1}', 'x'); fP = 'x^' + n2 + '/e^(' + k + 'x)'; st = ['As $x \\to \\infty$ the form is $' + frac('\\infty', '\\infty') + '$, so the rule applies.', 'Each application lowers the power of $x$ on top by 1, while the bottom stays an exponential. After ' + n2 + ' step' + (n2 > 1 ? 's' : '') + ' the top is a constant and the bottom still grows without bound.', 'The limit is $0$: exponentials outgrow every power.']; }
      else if (t === 'lnx') { L = 'zero'; fT = dfrac('\\ln x', 'x^{' + n2 + '}').replace('x^{1}', 'x'); fP = 'ln(x)/x^' + n2; st = ['Form $' + frac('\\infty', '\\infty') + '$.', 'Derivatives: $' + frac(frac(1, 'x'), n2 + 'x^{' + (n2 - 1) + '}') + ' = ' + frac(1, n2 + 'x^{' + n2 + '}') + '$.'.replace(/x\^\{0\}/g, '').replace(/x\^\{1\}/g, 'x').replace('{1x', '{x'), 'This tends to $0$: logarithms grow slower than every power.']; }
      else { L = 'inf'; fT = dfrac('e^{' + (k === 1 ? '' : k) + 'x}', 'x^{' + n2 + '}').replace('x^{1}', 'x'); fP = 'e^(' + k + 'x)/x^' + n2; st = ['Form $' + frac('\\infty', '\\infty') + '$.', 'Apply the rule ' + n2 + ' time' + (n2 > 1 ? 's' : '') + ': the bottom becomes a constant, the top stays a multiple of $e^{' + (k === 1 ? '' : k) + 'x}$.', 'So the limit is $\\infty$.']; }
      return { q: 'Find $' + limInf(1) + ' ' + fT + '$.' + (L === 'inf' ? ' Answer ∞ if the values grow without bound.' : ''), a: num(L === 'inf' ? 'inf' : '0'), steps: st, hint: 'Check the form, then differentiate top and bottom separately.', chk: { k: 'lim', f: fP, a: 'inf' } };
    }
    else if (kind === 'trap') { var aa = R.int(1, 5), bb = R.nz(-4, 4), tr = R.coin(); L = tr ? q(1 + aa).div(bb) : q(1).div(bb); fT = tr ? dfrac('e^{x} + ' + aa, xm(-bb)) : dfrac('\\cos x', xm(-bb)); fP = tr ? '(e^x+' + aa + ')/(x+' + bb + ')' : 'cos(x)/(x+' + bb + ')';
      st = ['First check the form: at $x = 0$ the top is $' + (tr ? '1 + ' + aa + ' = ' + (1 + aa) : '1') + '$ and the bottom is $' + bb + '$.', 'This is not $' + frac(0, 0) + '$ or $' + frac('\\infty', '\\infty') + '$, so L\'Hôpital\'s rule does not apply (it would give the wrong answer $' + (tr ? frac(1, 1) : '0') + '$).'.replace('\\frac{1}{1}', '1'), 'The function is continuous there; just substitute: $' + tx(L) + '$.']; }
    else if (kind === 'e') { var aE = R.int(1, 5), form = R.coin(); L = 'e'; fT = form ? '\\left(1 + ' + frac(aE, 'x') + '\\right)^{x}' : '(1 + ' + (aE === 1 ? '' : aE) + 'x)^{1/x}'; fP = form ? '(1+' + aE + '/x)^x' : '(1+' + aE + 'x)^(1/x)';
      st = ['This is the indeterminate form $1^{\\infty}$. Take logs: $\\ln y = ' + (form ? 'x\\ln\\left(1 + ' + frac(aE, 'x') + '\\right)' : frac('\\ln(1 + ' + (aE === 1 ? '' : aE) + 'x)', 'x')) + '$.', form ? 'Rewrite as $' + frac('\\ln(1 + ' + aE + '/x)', '1/x') + '$, a $' + frac(0, 0) + '$ form; L\'Hôpital gives $' + frac(aE, '1 + ' + aE + '/x') + ' \\to ' + aE + '$.' : 'L\'Hôpital: $' + frac(aE, '1 + ' + (aE === 1 ? '' : aE) + 'x') + ' \\to ' + aE + '$.', 'So $\\ln y \\to ' + aE + '$ and $y \\to e^{' + aE + '}$.'];
      return { q: 'Find $' + (form ? limInf(1) : lim(0, 1)) + ' ' + fT + '$.', a: num('e^' + aE), steps: st, hint: 'Take the natural log, find that limit, then exponentiate.', chk: { k: 'lim', f: fP, a: form ? 'inf' : 0, side: form ? 0 : 1 } };
    }
    else { var kx = R.int(1, 3); fT = (kx === 1 ? 'x' : 'x^{' + kx + '}') + '\\ln x'; fP = 'x^' + kx + '*ln(x)';
      st = ['This is $0 \\cdot (-\\infty)$. Rewrite as a fraction: $' + frac('\\ln x', 'x^{-' + kx + '}') + '$, now $' + frac('-\\infty', '\\infty') + '$.', 'L\'Hôpital: $' + frac(frac(1, 'x'), '-' + T.coef(kx, 'x^{-' + (kx + 1) + '}')) + ' = ' + (kx === 1 ? '-x' : '-' + frac('x^{' + kx + '}', kx)) + '$.', 'As $x \\to 0^+$ this tends to $0$.'];
      return { q: 'Find $' + lim(0, 1) + ' ' + fT + '$.', a: num(0), steps: st, hint: 'Rewrite the product as a quotient first.', chk: { k: 'lim', f: fP, a: 0, side: 1 } };
    }
    return { q: 'Find $' + lim0 + ' ' + fT + '$.', a: num(L), steps: st, hint: kind === 'trap' ? 'Before using L\'Hôpital\'s rule, check the form.' : 'Check the form, then differentiate the top and the bottom separately.', chk: { k: 'lim', f: fP, a: atP, side: side } };
  });

  G('calc1.newtons-method', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sqrt', 'formula']), R.pick(['sqrt', 'cbrt', 'cubic']), R.pick(['two', 'cubic', 'fail', 'cbrt']));
    function newton(fP, x0) { return { k: 'fn', test: function (spec, val, fn, nd) { var f = fn(fP), x1 = x0 - f(x0) / nd(f, x0); return near(x1, val(spec), 1e-9) ? true : 'newton step ' + x1; } }; }
    if (kind === 'formula') {
      var n0 = R.pick([2, 3, 5, 6, 7, 10, 11]);
      return {
        q: 'Write the Newton\'s method update $x - ' + frac('f(x)', 'f\'(x)') + '$ for $f(x) = x^{2} - ' + n0 + '$ as a single simplified fraction.',
        a: expr('(x^2+' + n0 + ')/(2x)'),
        steps: ['$f\'(x) = 2x$, so the update is $x - ' + frac('x^{2} - ' + n0, '2x') + '$.', 'Common denominator: $' + frac('2x^{2} - (x^{2} - ' + n0 + ')', '2x') + ' = ' + frac('x^{2} + ' + n0, '2x') + '$.', 'This is the ancient "divide and average" rule for $\\sqrt{' + n0 + '}$: average $x$ and $' + frac(n0, 'x') + '$.'],
        hint: 'Combine x and the fraction over the denominator 2x.', chk: { k: 'fn', test: function (spec) { for (var x = 0.7; x < 5; x += 0.9) if (!near(ML.evalPlain(spec.v, { x: x }), x - (x * x - n0) / (2 * x), 1e-9)) return 'formula'; return true; } }
      };
    }
    if (kind === 'sqrt' || kind === 'two') {
      var n = R.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 19, 20, 23, 24]), x0 = Math.round(Math.sqrt(n)), x1 = q(x0 * x0 + n).div(2 * x0);
      if (kind === 'sqrt') return {
        q: 'Use one step of Newton\'s method on $f(x) = x^{2} - ' + n + '$, starting from $x_0 = ' + x0 + '$, to approximate $\\sqrt{' + n + '}$. Give $x_1$ as an exact fraction.',
        a: num(x1),
        steps: ['$x_1 = x_0 - ' + frac('f(x_0)', 'f\'(x_0)') + '$, where $f\'(x) = 2x$.', '$f(' + x0 + ') = ' + (x0 * x0 - n) + '$ and $f\'(' + x0 + ') = ' + (2 * x0) + '$.', '$x_1 = ' + x0 + (x0 * x0 > n ? ' - ' : ' + ') + frac(abs(x0 * x0 - n), 2 * x0) + ' = ' + tx(x1) + '$' + (x1.isTerminating() ? ' $= ' + dec(x1) + '$' : '') + '.', 'Geometrically: follow the tangent line at $x_0$ down to the $x$-axis.'],
        hint: 'x₁ = x₀ − f(x₀)/f′(x₀).', chk: newton('x^2-' + n, x0)
      };
      var x2 = x1.mul(x1).add(n).div(x1.mul(2));
      return {
        q: 'Apply Newton\'s method twice to $f(x) = x^{2} - ' + n + '$, starting from $x_0 = ' + x0 + '$. Give $x_2$ as an exact fraction.',
        a: num(x2),
        steps: ['For this $f$, the update simplifies to $x_{n+1} = ' + frac('x_n^{2} + ' + n, '2x_n') + '$.', '$x_1 = ' + frac((x0 * x0) + ' + ' + n, 2 * x0) + ' = ' + tx(x1) + '$.', '$x_2 = ' + frac('(' + tx(x1) + ')^{2} + ' + n, '2 \\cdot ' + tx(x1)) + ' = ' + tx(x2) + '$.', 'As a decimal, $x_2 \\approx ' + x2.toDec(6) + '$, while $\\sqrt{' + n + '} \\approx ' + Math.sqrt(n).toFixed(6) + '$. Each step roughly doubles the number of correct digits.'],
        hint: 'Do one step at a time.', chk: { k: 'fn', test: function (spec, val) { var a1 = x0 - (x0 * x0 - n) / (2 * x0), a2 = a1 - (a1 * a1 - n) / (2 * a1); return near(a2, val(spec), 1e-12) ? true : 'x2 ' + a2; } }
      };
    }
    if (kind === 'cbrt') {
      var nc = R.pick([2, 3, 5, 7, 9, 10, 20, 25, 30, 60, 100]), c0 = Math.max(1, Math.round(Math.cbrt(nc))), c1 = q(2 * c0 * c0 * c0 + nc).div(3 * c0 * c0);
      return {
        q: 'Use one step of Newton\'s method on $f(x) = x^{3} - ' + nc + '$, starting from $x_0 = ' + c0 + '$. Give $x_1$ as an exact fraction.',
        a: num(c1),
        steps: ['$f\'(x) = 3x^{2}$. $f(' + c0 + ') = ' + (c0 * c0 * c0 - nc) + '$ and $f\'(' + c0 + ') = ' + (3 * c0 * c0) + '$.', '$x_1 = ' + c0 + (c0 * c0 * c0 > nc ? ' - ' : ' + ') + frac(abs(c0 * c0 * c0 - nc), 3 * c0 * c0) + ' = ' + tx(c1) + '$.', 'This approximates $\\sqrt[3]{' + nc + '} \\approx ' + Math.cbrt(nc).toFixed(4) + '$; $x_1 \\approx ' + c1.toDec(4) + '$.'],
        hint: 'x₁ = x₀ − f(x₀)/f′(x₀).', chk: newton('x^3-' + nc, c0)
      };
    }
    if (kind === 'cubic') {
      var p = R.int(1, 4), qq = R.nz(-6, 6), f = P([qq, p, 0, 1]), x0c = R.int(-2, 2), fx = f.at(x0c), fpx = f.d().at(x0c), x1c = q(x0c).sub(fx.div(fpx));
      return {
        q: 'Use one step of Newton\'s method on $f(x) = ' + f.tex() + '$, starting from $x_0 = ' + x0c + '$. Give $x_1$ exactly.',
        a: num(x1c),
        steps: ['$f\'(x) = ' + f.d().tex() + '$.', '$f(' + x0c + ') = ' + tx(fx) + '$ and $f\'(' + x0c + ') = ' + tx(fpx) + '$.', '$x_1 = ' + x0c + ' - ' + frac(tx(fx), tx(fpx)) + ' = ' + tx(x1c) + '$.'],
        hint: 'x₁ = x₀ − f(x₀)/f′(x₀).', chk: newton(f.plain(), x0c)
      };
    }
    var k = R.int(1, 3), c = R.int(1, 9), fq = 'x^{2} - ' + (2 * k) + 'x' + ' - ' + c;
    return {
      q: 'Newton\'s method is started at $x_0 = ' + k + '$ for $f(x) = ' + fq + '$. What goes wrong?',
      a: mc('$f\'(' + k + ') = 0$: the tangent line is horizontal and never meets the $x$-axis, so there is no $x_1$.', ['Nothing: $x_1 = ' + k + '$ is already a root.', 'The method converges to the wrong root.', '$f(' + k + ') = 0$, so the method stops.']),
      steps: ['$f\'(x) = 2x - ' + (2 * k) + '$, so $f\'(' + k + ') = 0$: $x_0$ sits at the vertex of the parabola.', 'The formula $x_1 = x_0 - ' + frac('f(x_0)', 'f\'(x_0)') + '$ would divide by 0. The tangent there is horizontal, so it never crosses the $x$-axis.', 'Fix: start somewhere else, away from where $f\'$ is 0.'],
      hint: 'Compute f′(x₀).', chk: { k: 'mc' }
    };
  });


  // ================================================================== UNIT 5: INTEGRALS
  function antiTerms(list) { return list.map(function (t) { var n = q(t[1]).add(1); return [q(t[0]).div(n), n]; }); }
  function cp(c, inner) { return (c === 1 ? '' : c === -1 ? '-' : tx(c)) + '\\left(' + inner + '\\right)'; }
  function cI(c, body) { return T.coef(q(c), body); }
  function plusC(s) { return s + ' + C'; }
  function bracket(F, a, b) { return '\\Big[' + F + '\\Big]_{' + a + '}^{' + b + '}'; }
  function sumRect(fx, a, dx, n, mode) { var s = q(0); for (var i = 0; i < n; i++) { var x = q(a).add(dx.mul(mode === 'left' ? i : mode === 'right' ? i + 1 : q(2 * i + 1).div(2))); s = s.add(fx(x)); } return s.mul(dx); }

  G('calc1.antiderivatives', function (R, ctx) {
    var kind = lv(ctx, 'poly', R.pick(['powers', 'trans', 'poly']), R.pick(['trans', 'powers', 'mixed']));
    if (kind === 'poly' || kind === 'powers') {
      var list = [], exps = R.sample([0, 1, 2, 3, 4, 5], kind === 'poly' ? R.int(2, 3) : 1);
      exps.forEach(function (e) { list.push([R.nz(-6, 9), e]); });
      if (kind === 'powers') R.sample([[-2, 1], [-3, 1], ['1/2', 1], ['-1/2', 1], ['2/3', 1], ['1/3', 1]], 2).forEach(function (o) { var n = q(o[0]), c = n.isInt() ? R.nz(-6, 8) : n.d === 2n ? R.pick([3, 6, -3, 9]) : R.pick([4, 8, -4]); list.push([c, n]); });
      list.sort(function (a, b) { return q(b[1]).cmp(q(a[1])); });
      var F = antiTerms(list), fT = termsT(list, natT), FP = termsP(F);
      return {
        q: 'Find $' + II('\\left(' + fT + '\\right)') + '$.',
        a: expr(plusC(FP)),
        steps: [(kind === 'powers' ? 'Write each term as a power of $x$: $' + termsT(list, powT) + '$. ' : '') + 'Reverse the power rule: $' + II('x^{n}') + ' = ' + frac('x^{n+1}', 'n+1') + ' + C$ for $n \\ne -1$ (raise the power by 1, then divide by the new power).',
          list.map(function (t) { var n = q(t[1]).add(1); return '$' + powT(t[0], t[1]) + ' \\to ' + (q(t[0]).eq(1) ? '' : tx(t[0]) + ' \\cdot ') + frac('x^{' + expT(n) + '}', expT(n)) + '$'; }).join(', ') + '.',
          'Add one constant for the whole answer: $' + termsT(F, powT) + ' + C$.' + (kind === 'powers' ? ' In root form: $' + termsT(F, natT) + ' + C$.' : ''),
          'Check by differentiating: you get back $' + fT + '$.'],
        hint: 'Raise each power by 1, divide by the new power, and add + C.',
        chk: { k: 'anti', f: termsP(list) }
      };
    }
    var parts = R.sample([['cos', R.nz(-5, 6)], ['sin', R.nz(-5, 6)], ['exp', R.nz(-4, 6)], ['inv', R.nz(-4, 6)], ['sec2', R.nz(-3, 4)], ['x', R.nz(-6, 6)]], kind === 'mixed' ? 3 : 2);
    var TT = { cos: '\\cos x', sin: '\\sin x', exp: 'e^{x}', inv: '', sec2: '\\sec^{2} x', x: 'x' };
    var fT2 = sumT(parts.map(function (t) { return t[0] === 'inv' ? (t[1] < 0 ? '-' : '') + frac(abs(t[1]), 'x') : T.coef(t[1], TT[t[0]]); }));
    var fP2 = sumP(parts.map(function (t) { return t[0] === 'cos' ? t[1] + '*cos(x)' : t[0] === 'sin' ? t[1] + '*sin(x)' : t[0] === 'exp' ? t[1] + '*e^x' : t[0] === 'inv' ? t[1] + '/x' : t[0] === 'sec2' ? t[1] + '*sec(x)^2' : t[1] + '*x'; }));
    var FT = sumT(parts.map(function (t) { return t[0] === 'cos' ? T.coef(t[1], '\\sin x') : t[0] === 'sin' ? T.coef(-t[1], '\\cos x') : t[0] === 'exp' ? T.coef(t[1], 'e^{x}') : t[0] === 'inv' ? T.coef(t[1], '\\ln\\lvert x \\rvert') : t[0] === 'sec2' ? T.coef(t[1], '\\tan x') : T.coef(q(t[1]).div(2), 'x^{2}'); }));
    var FP2 = sumP(parts.map(function (t) { return t[0] === 'cos' ? t[1] + '*sin(x)' : t[0] === 'sin' ? (-t[1]) + '*cos(x)' : t[0] === 'exp' ? t[1] + '*e^x' : t[0] === 'inv' ? t[1] + '*ln(abs(x))' : t[0] === 'sec2' ? t[1] + '*tan(x)' : pl(q(t[1]).div(2)) + '*x^2'; }));
    var rules = { cos: '$' + II('\\cos x') + ' = \\sin x + C$', sin: '$' + II('\\sin x') + ' = -\\cos x + C$ (the derivative of $-\\cos x$ is $\\sin x$)', exp: '$' + II('e^{x}') + ' = e^{x} + C$', inv: '$' + II(frac(1, 'x')) + ' = \\ln\\lvert x \\rvert + C$ (the one power the power rule cannot handle)', sec2: '$' + II('\\sec^{2} x') + ' = \\tan x + C$', x: '$' + II('x') + ' = ' + frac('x^{2}', 2) + ' + C$' };
    return {
      q: 'Find $' + II('\\left(' + fT2 + '\\right)') + '$.',
      a: expr(plusC(FP2)),
      steps: ['Each piece reverses a derivative you know: ' + parts.map(function (t) { return rules[t[0]]; }).join('; ') + '.', 'So the antiderivative is $' + FT + ' + C$.', 'Check by differentiating: you get back the integrand.'],
      hint: 'Ask: what function has this as its derivative?', chk: { k: 'anti', f: fP2 }
    };
  });

  G('calc1.initial-value-antiderivatives', function (R, ctx) {
    var kind = lv(ctx, R.pick(['poly', 'poly', 'motion']), R.pick(['trig', 'motion', 'poly']), R.pick(['second', 'trig', 'motionval']));
    if (kind === 'poly') {
      var fp = P([R.int(-6, 6), R.int(-5, 5), R.pick([3, 6, -3, 9, 12])]), a = R.int(-2, 3), b = R.int(-8, 10), F0 = fp.anti(), C = q(b).sub(F0.at(a)), F = F0.add(P([C]));
      return {
        q: 'Find $f(x)$ if $f\'(x) = ' + fp.tex() + '$ and $f(' + a + ') = ' + b + '$.',
        a: expr(F.plain()),
        steps: ['Antidifferentiate: $f(x) = ' + F0.tex() + ' + C$.', 'Use the known value: $f(' + a + ') = ' + F0.subT(a) + ' + C = ' + tx(F0.at(a)) + ' + C = ' + b + '$.', 'So $C = ' + tx(C) + '$ and $f(x) = ' + F.tex() + '$.'],
        hint: 'Antidifferentiate with + C, then use the given value to find C.', chk: { k: 'ivp', f: fp.plain(), x0: a, y0: b }
      };
    }
    if (kind === 'trig') {
      var useSin = R.coin(), A = R.nz(-5, 5), B = R.int(-4, 4), k = R.int(-5, 6), Cc = useSin ? k + A : k;
      var fpT = T.coef(A, useSin ? '\\sin x' : '\\cos x') + sg(B), FT = T.coef(useSin ? -A : A, useSin ? '\\cos x' : '\\sin x') + T.coef(B, 'x', false);
      var FP = sumP([useSin ? -A + '*cos(x)' : A + '*sin(x)', B ? B + '*x' : '', Cc ? String(Cc) : '']);
      return {
        q: 'Find $f(x)$ if $f\'(x) = ' + fpT + '$ and $f(0) = ' + k + '$.',
        a: expr(FP),
        steps: ['Antidifferentiate: $f(x) = ' + FT + ' + C$.', useSin ? 'At $x = 0$: $' + T.coef(-A, '\\cos 0') + ' + C = ' + (-A) + ' + C$. (Careful: $\\cos 0 = 1$, not 0.)' : 'At $x = 0$: $\\sin 0 = 0$, so $f(0) = C$.', 'Set it equal to $' + k + '$: $C = ' + Cc + '$.', '$f(x) = ' + FT + sg(Cc) + '$.'],
        hint: 'Antidifferentiate, then plug in x = 0.', chk: { k: 'ivp', f: cl(A + '*' + (useSin ? 'sin' : 'cos') + '(x)+' + B), x0: 0, y0: k }
      };
    }
    if (kind === 'motion' || kind === 'motionval') {
      var v0 = R.pick([16, 32, 48, 64, 80]), h0 = R.pick([0, 6, 10, 48, 100]), s = P([h0, v0, -16]);
      if (kind === 'motionval') { var t1 = R.int(1, 3); return { q: 'A stone is thrown upward at $' + v0 + '$ ft/s from a height of $' + h0 + '$ ft. Its acceleration is $a(t) = -32$ ft/s². How high is it after $' + t1 + '$ second' + (t1 === 1 ? '' : 's') + '?', a: num(s.at(t1)), unit: 'ft', steps: ['$v(t) = ' + II('-32', 't') + ' = -32t + C_1$, and $v(0) = ' + v0 + '$ gives $C_1 = ' + v0 + '$.', '$s(t) = ' + II('(-32t + ' + v0 + ')', 't') + ' = -16t^{2} + ' + v0 + 't + C_2$, and $s(0) = ' + h0 + '$ gives $C_2 = ' + h0 + '$.', '$s(' + t1 + ') = ' + s.subT(t1) + ' = ' + tx(s.at(t1)) + '$ ft.'], hint: 'Antidifferentiate twice, using the starting velocity and height.', chk: { k: 'fn', test: function (spec, val) { return near(val(spec), -16 * t1 * t1 + v0 * t1 + h0) ? true : 'height'; } } }; }
      return {
        q: 'A stone is thrown upward at $' + v0 + '$ ft/s from a height of $' + h0 + '$ ft. Its acceleration is $a(t) = -32$ ft/s². Find its height $s(t)$.',
        a: expr(s.plain('t'), ['t']),
        steps: ['$v(t) = ' + II('-32', 't') + ' = -32t + C_1$. The starting velocity $v(0) = ' + v0 + '$ gives $C_1 = ' + v0 + '$.', '$s(t) = ' + II('(-32t + ' + v0 + ')', 't') + ' = -16t^{2} + ' + v0 + 't + C_2$.', 'The starting height $s(0) = ' + h0 + '$ gives $C_2 = ' + h0 + '$, so $s(t) = ' + s.tex('t') + '$.'],
        hint: 'Antidifferentiate twice; each time use a starting value to find the constant.', chk: { k: 'ivp', f: '-32', v: 't', n: 2, x0: 0, y0: h0, y1: v0 }
      };
    }
    var f2 = P([R.int(-4, 4) * 2, R.pick([6, -6, 12])]), y1 = R.int(-4, 4), y0 = R.int(-5, 5), Fp = f2.anti().add(P([y1])), F2 = Fp.anti().add(P([y0]));
    return {
      q: 'Find $f(x)$ if $f\'\'(x) = ' + f2.tex() + '$, $f\'(0) = ' + y1 + '$ and $f(0) = ' + y0 + '$.',
      a: expr(F2.plain()),
      steps: ['First $f\'(x) = ' + f2.anti().tex() + ' + C_1$; $f\'(0) = C_1 = ' + y1 + '$.', 'So $f\'(x) = ' + Fp.tex() + '$.', 'Then $f(x) = ' + Fp.anti().tex() + ' + C_2$; $f(0) = C_2 = ' + y0 + '$.', '$f(x) = ' + F2.tex() + '$.'],
      hint: 'Two antiderivatives, two constants, two conditions.', chk: { k: 'ivp', f: f2.plain(), n: 2, x0: 0, y0: y0, y1: y1 }
    };
  });

  G('calc1.area-approximations', function (R, ctx) {
    var kind = lv(ctx, R.pick(['lr', 'data']), R.pick(['lr', 'lr', 'data', 'ou']), R.pick(['lr', 'ou', 'data']));
    if (kind === 'ou') {
      var inc = R.coin(), left = R.coin(), over = inc !== left;
      var fT = inc ? R.pick(['x^{2} + 1', '\\sqrt{x}', 'e^{x}', '2x + 3']) : R.pick([frac(1, 'x'), '9 - x^{2}', 'e^{-x}', '10 - 2x']);
      return {
        q: 'On $[1, 3]$, the function $f(x) = ' + fT + '$ is ' + (inc ? 'increasing' : 'decreasing') + ' (and positive). Is the ' + (left ? 'left' : 'right') + '-endpoint sum an overestimate or an underestimate of the area under $f$?',
        a: { t: 'mc', choices: ['An overestimate', 'An underestimate'], v: over ? 0 : 1, keep: true },
        steps: [(left ? 'A left sum uses the height at the left edge of each strip.' : 'A right sum uses the height at the right edge of each strip.'),
          'For an ' + (inc ? 'increasing' : 'decreasing') + ' function, the ' + (left ? 'left' : 'right') + ' edge is the ' + (over ? 'highest' : 'lowest') + ' point of each strip.',
          'So each rectangle ' + (over ? 'sticks out above the curve: an overestimate.' : 'stays below the curve: an underestimate.')],
        hint: 'Picture one strip: where along it is the curve highest?', chk: { k: 'mc' }
      };
    }
    if (kind === 'data') {
      var dt = R.pick([2, 5, 10]), n = 4, vs = [], base = R.int(10, 30);
      for (var i = 0; i <= n; i++) vs.push(base + i * R.int(1, 6) + R.int(0, 3));
      var lft = R.coin(), sum = 0; for (i = 0; i < n; i++) sum += (lft ? vs[i] : vs[i + 1]) * dt;
      var ts = vs.map(function (_, j) { return String(j * dt); });
      return {
        q: 'A runner\'s speed (in ft/s) is recorded every $' + dt + '$ seconds: $$' + table(null, [['t'].concat(ts), ['v(t)'].concat(vs.map(String))]) + '$$ Estimate the distance run in the first $' + (n * dt) + '$ seconds with a ' + (lft ? 'left' : 'right') + '-endpoint sum.',
        a: num(sum), unit: 'ft',
        steps: ['Distance is the area under the speed graph. Each strip is $' + dt + '$ s wide.', (lft ? 'Left endpoints: use the speeds at $t = ' + ts.slice(0, n).join(', ') + '$ (not the last reading).' : 'Right endpoints: use the speeds at $t = ' + ts.slice(1).join(', ') + '$ (not the first reading).'),
          '$' + dt + '(' + (lft ? vs.slice(0, n) : vs.slice(1)).join(' + ') + ') = ' + dt + ' \\cdot ' + (sum / dt) + ' = ' + sum + '$ ft.'],
        hint: 'Rectangle heights come from the ' + (lft ? 'left' : 'right') + ' end of each time interval.', chk: { k: 'fn', test: function (spec, val) { var s2 = 0; for (var j = 0; j < n; j++) s2 += dt * (lft ? vs[j] : vs[j + 1]); return near(s2, val(spec)) ? true : 'sum'; } }
      };
    }
    var a = R.int(0, 2), w = R.pick([2, 4, 4, 8]), b = a + w, dx = q(w).div(4), f = R.coin() ? P([R.int(1, 5), 0, R.pick([1, 1, 2])]) : P([R.int(1, 6), R.pick([1, 2, 3])]), mode = R.pick(['left', 'right']);
    var pts = [0, 1, 2, 3].map(function (i) { return q(a).add(dx.mul(mode === 'left' ? i : i + 1)); }), S = sumRect(function (x) { return f.at(x); }, a, dx, 4, mode);
    return {
      q: 'Estimate the area under $f(x) = ' + f.tex() + '$ on $[' + a + ', ' + b + ']$ using $4$ rectangles and ' + mode + ' endpoints.',
      a: num(S),
      steps: ['Width of each rectangle: $\\Delta x = ' + frac(b + ' - ' + a, 4) + ' = ' + tx(dx) + '$.', 'The ' + mode + ' endpoints are $x = ' + pts.map(tx).join(', ') + '$' + (mode === 'left' ? ' (start at $a$, stop one strip before $b$).' : ' (start one strip after $a$, end at $b$).'),
        'Heights: ' + pts.map(function (x) { return '$f(' + tx(x) + ') = ' + tx(f.at(x)) + '$'; }).join(', ') + '.',
        'Sum: $' + (dx.eq(1) ? '' : tx(dx)) + '\\left(' + pts.map(function (x) { return tx(f.at(x)); }).join(' + ') + '\\right) = ' + tx(S) + '$.'],
      hint: 'Find Δx, list the ' + mode + ' endpoints, then add up height × width.', chk: { k: 'fn', test: function (spec, val, fn) { var g = fn(f.plain()), d = w / 4, s2 = 0; for (var j = 0; j < 4; j++) s2 += g(a + d * (mode === 'left' ? j : j + 1)) * d; return near(s2, val(spec)) ? true : 'sum ' + s2; } }
    };
  });

  G('calc1.riemann-sums', function (R, ctx) {
    var kind = lv(ctx, R.pick(['mid', 'sigma']), R.pick(['mid', 'sigma', 'upper', 'read']), R.pick(['limit', 'read', 'upper', 'mid']));
    if (kind === 'mid' || kind === 'upper') {
      var n = R.int(2, 4), a = R.int(0, 2), dx = q(R.pick([1, 2])), b = q(a).add(dx.mul(n)), f, S, mode, fT;
      if (kind === 'mid') { f = P([R.int(0, 4), R.int(0, 3), R.pick([1, 1, 2])]); mode = 'mid'; }
      else { f = P([R.int(10, 30), 0, R.pick([-1, -1, -2])]); mode = 'left'; b = q(a).add(dx.mul(n)); if (f.at(b).sign() <= 0) f = f.add(P([f.at(b).neg().add(R.int(1, 5)).toNumber()])); }
      fT = f.tex(); S = sumRect(function (x) { return f.at(x); }, a, dx, n, mode);
      var pts = []; for (var i = 0; i < n; i++) pts.push(q(a).add(dx.mul(mode === 'mid' ? q(2 * i + 1).div(2) : i)));
      return {
        q: kind === 'mid' ? 'Find the midpoint sum $M_{' + n + '}$ for $f(x) = ' + fT + '$ on $[' + a + ', ' + tx(b) + ']$.' : 'The function $f(x) = ' + fT + '$ is decreasing on $[' + a + ', ' + tx(b) + ']$. Find the upper sum with $' + n + '$ equal subintervals.',
        a: num(S),
        steps: ['$\\Delta x = ' + frac(tx(b) + ' - ' + a, n) + ' = ' + tx(dx) + '$.',
          kind === 'mid' ? 'Sample at the middle of each subinterval: $x = ' + pts.map(tx).join(', ') + '$.' : 'For a decreasing function the highest point of each subinterval is its left end, so the upper sum is the left sum: $x = ' + pts.map(tx).join(', ') + '$.',
          '$' + (dx.eq(1) ? '' : tx(dx)) + '\\left(' + pts.map(function (x) { return tx(f.at(x)); }).join(' + ') + '\\right) = ' + tx(S) + '$.'],
        hint: kind === 'mid' ? 'Use the midpoint of each subinterval for the height.' : 'Which end of each subinterval is higher for a decreasing function?',
        chk: { k: 'fn', test: function (spec, val, fn) { var g = fn(f.plain()), d = dx.toNumber(), s2 = 0; for (var j = 0; j < n; j++) s2 += g(a + d * (mode === 'mid' ? j + 0.5 : j)) * d; return near(s2, val(spec)) ? true : 'sum ' + s2; } }
      };
    }
    if (kind === 'sigma') {
      var n2 = R.int(3, 5), k = R.pick([1, 2]), c = R.int(0, 3), dxq = q(1).div(k), S2 = q(0);
      for (var j = 1; j <= n2; j++) { var xj = q(c).add(q(j).div(k)); S2 = S2.add(xj.mul(xj)); }
      S2 = S2.mul(dxq);
      var term = k === 1 ? '(' + (c ? c + ' + ' : '') + 'i)^{2}' : '\\left(' + (c ? c + ' + ' : '') + frac('i', k) + '\\right)^{2}';
      return {
        q: 'Evaluate the Riemann sum $\\displaystyle\\sum_{i=1}^{' + n2 + '} ' + term + (k === 1 ? '' : ' \\cdot ' + frac(1, k)) + '$.',
        a: num(S2),
        steps: ['This is a right-endpoint sum for $f(x) = x^{2}$ with $\\Delta x = ' + tx(dxq) + '$, starting at $x = ' + c + '$.', 'Terms: ' + [1, 2, 3, 4, 5].slice(0, n2).map(function (i) { return '$' + tx(q(c).add(q(i).div(k)).mul(q(c).add(q(i).div(k)))) + '$'; }).join(', ') + '.',
          'Add them' + (k === 1 ? '' : ' and multiply by $\\Delta x = ' + tx(dxq) + '$') + ': $' + tx(S2) + '$.'],
        hint: 'Write out each term for i = 1, 2, …, then add.', chk: { k: 'fn', test: function (spec, val) { var s2 = 0; for (var i = 1; i <= n2; i++) { var x = c + i / k; s2 += x * x / k; } return near(s2, val(spec)) ? true : 'sigma ' + s2; } }
      };
    }
    if (kind === 'read') {
      var n3 = R.pick([4, 5, 6, 8, 10]), a3 = R.int(0, 3), w3 = R.int(1, 4) * (R.coin() ? 1 : 2), dxT = frac(w3, n3), b3 = a3 + w3;
      return {
        q: 'The sum $\\displaystyle\\sum_{i=1}^{' + n3 + '} \\left(' + (a3 ? a3 + ' + ' : '') + frac((w3 === 1 ? '' : w3) + 'i', n3) + '\\right)^{3} \\cdot ' + frac(w3, n3) + '$ is a right-endpoint Riemann sum for $' + I('a', 'b', 'x^{3}') + '$. Find $a$ and $b$.',
        a: multi([['$a =$', num(a3)], ['$b =$', num(b3)]]),
        steps: ['In a right sum $\\sum f(x_i)\\Delta x$, the factor outside is $\\Delta x = ' + dxT + '$.', 'The sample points are $x_i = ' + (a3 ? a3 + ' + ' : '') + 'i\\,\\Delta x$, so the interval starts at $a = ' + a3 + '$.', 'With $' + n3 + '$ strips of width $' + dxT + '$, the interval has length $' + w3 + '$, so $b = ' + a3 + ' + ' + w3 + ' = ' + b3 + '$.'],
        hint: 'Δx is the factor outside; x_i = a + iΔx.', chk: [{ k: 'val', v: a3 }, { k: 'val', v: b3 }]
      };
    }
    var bL = R.int(1, 4), sq = R.coin(), lim_ = sq ? q(bL * bL * bL).div(3) : q(bL * bL).div(2);
    return {
      q: 'For $f(x) = ' + (sq ? 'x^{2}' : 'x') + '$ on $[0, ' + bL + ']$, the right Riemann sum with $n$ strips works out to $R_n = ' + (sq ? frac(bL * bL * bL + '(n + 1)(2n + 1)', '6n^{2}') : frac(bL * bL + '(n + 1)', '2n')) + '$. Find $\\displaystyle\\lim_{n \\to \\infty} R_n$, the exact area.',
      a: num(lim_),
      steps: [sq ? 'Expand the top: $' + (bL * bL * bL) + '(2n^{2} + 3n + 1)$. Divide top and bottom by $n^{2}$: $' + frac((bL * bL * bL) + '(2 + 3/n + 1/n^{2})', 6) + '$.' : 'Divide top and bottom by $n$: $' + frac((bL * bL) + '(1 + 1/n)', 2) + '$.',
        'As $n \\to \\infty$ the terms with $n$ in the denominator vanish.', 'Limit: $' + (sq ? frac((bL * bL * bL) + ' \\cdot 2', 6) : frac(bL * bL, 2)) + ' = ' + tx(lim_) + '$. This exact area is the definite integral $' + I(0, bL, sq ? 'x^{2}' : 'x') + '$.'],
      hint: 'Compare the highest powers of n on top and bottom.', chk: { k: 'int', f: sq ? 'x^2' : 'x', a: 0, b: bL }
    };
  });

  G('calc1.definite-integral', function (R, ctx) {
    var kind = lv(ctx, R.pick(['line', 'const']), R.pick(['line', 'circle', 'odd', 'total']), R.pick(['total', 'abs', 'circle', 'odd']));
    var geo = 'A definite integral is the net signed area: area above the $x$-axis counts as positive, area below counts as negative.';
    if (kind === 'const') {
      var k = R.nz(-6, 6), a = R.int(-3, 2), b = a + R.int(1, 5), v = q(k * (b - a));
      return { q: 'Find $' + I(a, b, String(k)) + '$.', a: num(v), steps: [geo, 'The region is a rectangle of width $' + (b - a) + '$ and height $' + abs(k) + '$, ' + (k > 0 ? 'above' : 'below') + ' the axis.', 'So the integral is $' + k + ' \\cdot ' + (b - a) + ' = ' + tx(v) + '$.'], hint: 'Picture the region: what shape is it?', chk: { k: 'int', f: String(k), a: a, b: b } };
    }
    if (kind === 'line') {
      var r = R.int(-2, 3), m = R.pick([1, 2, -1, -2, 1]), a2 = R.int(r - 3, r), b2 = R.int(r + 1, r + 4), f = P([-m * r, m]), v2 = f.anti().at(b2).sub(f.anti().at(a2));
      var A1 = q(m * (a2 - r) * (a2 - r)).div(2).mul(-1), A2 = q(m * (b2 - r) * (b2 - r)).div(2);
      return {
        q: 'Use areas (geometry) to find $' + I(a2, b2, '(' + f.tex() + ')') + '$.',
        a: num(v2),
        steps: [geo, 'The line crosses the $x$-axis at $x = ' + r + '$, making two triangles.',
          a2 < r ? 'From $' + a2 + '$ to $' + r + '$: base $' + (r - a2) + '$, height $' + abs(m * (a2 - r)) + '$, signed area $' + tx(A1) + '$ (' + (A1.sign() < 0 ? 'below' : 'above') + ' the axis).' : 'There is no piece to the left of $x = ' + r + '$.',
          'From $' + r + '$ to $' + b2 + '$: base $' + (b2 - r) + '$, height $' + abs(m * (b2 - r)) + '$, signed area $' + tx(A2) + '$.', 'Net: $' + tx(A1) + ' + ' + tp(A2) + ' = ' + tx(v2) + '$.'.replace('$0 + ', '$')],
        hint: 'Find where the line crosses the axis and use triangle areas.', chk: { k: 'int', f: f.plain(), a: a2, b: b2 }
      };
    }
    if (kind === 'circle') {
      var rr = R.int(1, 6), half = R.coin();
      return {
        q: 'Use geometry to find $' + I(half ? 0 : -rr, rr, '\\sqrt{' + (rr * rr) + ' - x^{2}}') + '$ exactly.',
        a: num(cmulP(q(rr * rr).div(half ? 4 : 2), 'pi')),
        steps: ['$y = \\sqrt{' + (rr * rr) + ' - x^{2}}$ is the top half of the circle $x^{2} + y^{2} = ' + (rr * rr) + '$, radius $' + rr + '$.',
          half ? 'From $0$ to $' + rr + '$ the region is a quarter of the disk.' : 'From $-' + rr + '$ to $' + rr + '$ the region is half of the disk.',
          'Area: $' + (half ? frac(1, 4) : frac(1, 2)) + '\\pi (' + rr + ')^{2} = ' + (half ? frac((rr * rr === 1 ? '' : rr * rr) + '\\pi', 4) : frac((rr * rr === 1 ? '' : rr * rr) + '\\pi', 2)) + '$.'],
        hint: 'What curve is y = √(r² − x²)?', chk: { k: 'int', f: 'sqrt(' + (rr * rr) + '-x^2)', a: half ? 0 : -rr, b: rr, tol: 2e-5 }
      };
    }
    if (kind === 'odd') {
      var A = R.int(1, 4), p = R.pick([[1, 3], [1, 5], [3, 5]]), c1 = R.nz(-4, 4), c2 = R.nz(-4, 4), k2 = R.int(0, 4) * (R.coin() ? 1 : 0), fT = T.coef(c1, 'x^{' + p[1] + '}') + T.coef(c2, p[0] === 1 ? 'x' : 'x^{' + p[0] + '}', false) + sg(k2), v3 = q(2 * A * k2);
      return {
        q: 'Find $' + I(-A, A, '\\left(' + fT + '\\right)') + '$.',
        a: num(v3),
        steps: ['Odd powers of $x$ are odd functions: the area to the right of 0 is cancelled exactly by an equal area, of opposite sign, to the left.', 'So $' + I(-A, A, '\\left(' + T.coef(c1, 'x^{' + p[1] + '}') + T.coef(c2, p[0] === 1 ? 'x' : 'x^{' + p[0] + '}', false) + '\\right)') + ' = 0$.',
          k2 ? 'The constant $' + k2 + '$ gives a rectangle: $' + k2 + ' \\cdot ' + (2 * A) + ' = ' + (2 * A * k2) + '$.' : 'There is no constant term, so the whole integral is $0$.', 'Total: $' + tx(v3) + '$.'],
        hint: 'Use symmetry: odd functions cancel on [−a, a].', chk: { k: 'int', f: cl(c1 + '*x^' + p[1] + '+' + c2 + '*x^' + p[0] + '+' + k2), a: -A, b: A }
      };
    }
    if (kind === 'total') {
      var c = R.int(1, 4), bb = c + R.int(1, 4), fP = 'x-' + c, net = q(bb * bb).div(2).sub(c * bb), tot = q(c * c).div(2).add(q((bb - c) * (bb - c)).div(2));
      return {
        q: 'For $f(x) = ' + xm(c) + '$ on $[0, ' + bb + ']$, find the net signed area $' + I(0, bb, '(' + xm(c) + ')') + '$ and the total area between the graph and the $x$-axis.',
        a: multi([['net signed area: ', num(net)], ['total area: ', num(tot)]]),
        steps: ['The graph crosses the axis at $x = ' + c + '$.', 'From $0$ to $' + c + '$: a triangle below the axis with area $' + frac(c + ' \\cdot ' + c, 2) + ' = ' + tx(q(c * c).div(2)) + '$.', 'From $' + c + '$ to $' + bb + '$: a triangle above with area $' + frac((bb - c) + ' \\cdot ' + (bb - c), 2) + ' = ' + tx(q((bb - c) * (bb - c)).div(2)) + '$.',
          'Net: $' + tx(q((bb - c) * (bb - c)).div(2)) + ' - ' + tx(q(c * c).div(2)) + ' = ' + tx(net) + '$. Total: add the sizes, $' + tx(tot) + '$.'],
        hint: 'Area below the axis counts negative in the integral, but positive in the total area.',
        chk: [{ k: 'int', f: fP, a: 0, b: bb }, { k: 'int', f: fP, a: 0, b: bb, abs: true }]
      };
    }
    var a4 = R.int(1, 4), b4 = R.int(1, 5), v4 = q(a4 * a4 + b4 * b4).div(2);
    return {
      q: 'Find $' + I(-a4, b4, '\\lvert x \\rvert') + '$.',
      a: num(v4),
      steps: ['The graph of $\\lvert x \\rvert$ is a V. On $[-' + a4 + ', 0]$ it makes a triangle with base and height $' + a4 + '$; on $[0, ' + b4 + ']$ a triangle with base and height $' + b4 + '$.', 'Both are above the axis: $' + frac(a4 + '^{2}', 2) + ' + ' + frac(b4 + '^{2}', 2) + ' = ' + tx(v4) + '$.'],
      hint: 'Split at 0 and add two triangle areas.', chk: { k: 'int', f: 'abs(x)', a: -a4, b: b4 }
    };
  });

  G('calc1.integral-properties', function (R, ctx) {
    var kind = lv(ctx, R.pick(['split', 'reverse']), R.pick(['linear', 'const', 'split', 'zero']), R.pick(['bounds', 'linear', 'combo']));
    var A = R.int(1, 4), B = A + R.int(1, 4), F1 = R.nz(-9, 9), F2 = R.nz(-9, 9), Gv = R.nz(-9, 9);
    var gv = 'Given $' + I(0, A, 'f(x)') + ' = ' + F1 + '$, $' + I(0, B, 'f(x)') + ' = ' + F2 + '$ and $' + I(0, B, 'g(x)') + ' = ' + Gv + '$. ';
    if (kind === 'split') return { q: gv + 'Find $' + I(A, B, 'f(x)') + '$.', a: num(F2 - F1), steps: ['Intervals add: $' + I(0, A, 'f') + ' + ' + I(A, B, 'f') + ' = ' + I(0, B, 'f') + '$.', 'So $' + I(A, B, 'f') + ' = ' + F2 + ' - ' + tp(F1) + ' = ' + (F2 - F1) + '$.'], hint: 'The integral over [0, ' + B + '] splits at x = ' + A + '.', chk: { k: 'val', v: F2 - F1 } };
    if (kind === 'reverse') { var rev = R.coin(); return { q: gv + 'Find $' + (rev ? I(B, 0, 'f(x)') : I(B, A, 'f(x)')) + '$.', a: num(rev ? -F2 : -(F2 - F1)), steps: ['Swapping the limits changes the sign: $' + I('b', 'a', 'f') + ' = -' + I('a', 'b', 'f') + '$.', rev ? 'So $' + I(B, 0, 'f') + ' = ' + tx(-F2) + '$.' : 'First $' + I(A, B, 'f') + ' = ' + F2 + ' - ' + tp(F1) + ' = ' + (F2 - F1) + '$, so $' + I(B, A, 'f') + ' = ' + tx(-(F2 - F1)) + '$.'], hint: 'What happens when the limits are swapped?', chk: { k: 'val', v: rev ? -F2 : F1 - F2 } }; }
    if (kind === 'linear' || kind === 'combo') {
      var c1 = R.nz(-4, 4), c2 = R.nz(-4, 4), v = c1 * F2 + c2 * Gv;
      return { q: gv + 'Find $' + I(0, B, '\\big[' + T.coef(c1, 'f(x)') + T.coef(c2, 'g(x)', false) + '\\big]') + '$.', a: num(v), steps: ['Integrals split over sums and constants come out: $' + T.coef(c1, I(0, B, 'f')) + T.coef(c2, I(0, B, 'g'), false) + '$.', '$= ' + c1 + '(' + F2 + ')' + (c2 < 0 ? ' - ' + (-c2) : ' + ' + c2) + '(' + Gv + ') = ' + v + '$.'], hint: 'Use linearity: split the sum, pull out the constants.', chk: { k: 'val', v: c1 * F2 + c2 * Gv } };
    }
    if (kind === 'const') { var k = R.nz(-5, 5), v2 = F2 + k * B; return { q: gv + 'Find $' + I(0, B, '\\big[f(x)' + sg(k) + '\\big]') + '$.', a: num(v2), steps: ['Split: $' + I(0, B, 'f(x)') + ' + ' + I(0, B, String(k)) + '$.', 'The constant integrates to a rectangle: $' + k + ' \\cdot ' + B + ' = ' + (k * B) + '$.', 'Total: $' + F2 + sg(k * B) + ' = ' + v2 + '$.'], hint: 'The integral of a constant k over [a, b] is k(b − a).', chk: { k: 'val', v: F2 + k * B } }; }
    if (kind === 'zero') return { q: gv + 'Find $' + I(A, A, 'f(x)') + ' + ' + I(0, A, 'f(x)') + '$.', a: num(F1), steps: ['An integral over an interval of zero width is 0: $' + I(A, A, 'f') + ' = 0$.', 'So the total is $0 + ' + tp(F1) + ' = ' + F1 + '$.'], hint: 'How wide is the interval [' + A + ', ' + A + ']?', chk: { k: 'val', v: F1 } };
    var m = R.int(-3, 3), M = m + R.int(2, 6), a = R.int(-2, 2), b = a + R.int(2, 5), low = R.coin();
    return {
      q: 'Suppose $' + m + ' \\le f(x) \\le ' + M + '$ for all $x$ in $[' + a + ', ' + b + ']$. What is the ' + (low ? 'smallest' : 'largest') + ' value that $' + I(a, b, 'f(x)') + '$ could possibly have?',
      a: num(low ? m * (b - a) : M * (b - a)),
      steps: ['If $f$ stays between $m$ and $M$, its integral stays between the rectangles $m(b - a)$ and $M(b - a)$.', 'Here $b - a = ' + (b - a) + '$: the integral is between $' + m + ' \\cdot ' + (b - a) + ' = ' + (m * (b - a)) + '$ and $' + M + ' \\cdot ' + (b - a) + ' = ' + (M * (b - a)) + '$.', 'So the ' + (low ? 'smallest' : 'largest') + ' possible value is $' + (low ? m * (b - a) : M * (b - a)) + '$ (when $f$ is the constant ' + (low ? m : M) + ').'],
      hint: 'Compare f with the constant functions m and M.', chk: { k: 'val', v: low ? m * (b - a) : M * (b - a) }
    };
  });

  function wr(u) { return /^[a-z]$/.test(u) ? u : '(' + u + ')'; }
  var ACC = [ // integrands f(t): TeX, plain, f(u) as TeX for a TeX argument, f(u) as plain for a plain argument
    { T: '(t^{2} + 1)', P: 't^2+1', sum: true, fT: function (u) { return wr(u) + '^{2} + 1'; }, fP: function (u) { return wr(u) + '^2+1'; } },
    { T: '\\sqrt{1 + t^{3}}', P: 'sqrt(1+t^3)', fT: function (u) { return '\\sqrt{1 + ' + wr(u) + '^{3}}'; }, fP: function (u) { return 'sqrt(1+' + wr(u) + '^3)'; } },
    { T: '\\cos(t^{2})', P: 'cos(t^2)', fT: function (u) { return '\\cos\\big(' + wr(u) + '^{2}\\big)'; }, fP: function (u) { return 'cos(' + wr(u) + '^2)'; } },
    { T: '\\sin^{2} t', P: 'sin(t)^2', fT: function (u) { return '\\sin^{2}(' + u + ')'; }, fP: function (u) { return 'sin(' + u + ')^2'; } },
    { T: frac(1, '1 + t^{4}'), P: '1/(1+t^4)', fT: function (u) { return frac(1, '1 + ' + wr(u) + '^{4}'); }, fP: function (u) { return '1/(1+' + wr(u) + '^4)'; } },
    { T: 't\\,e^{t}', P: 't*e^t', fT: function (u) { return wr(u) + 'e^{' + u + '}'; }, fP: function (u) { return wr(u) + '*e^(' + u + ')'; } }
  ];
  var UPS = [{ T: 'x^{2}', P: 'x^2', dT: '2x', dP: '2x' }, { T: 'x^{3}', P: 'x^3', dT: '3x^{2}', dP: '3x^2' }, { T: '3x', P: '3x', dT: '3', dP: '3' }, { T: '\\sin x', P: 'sin(x)', dT: '\\cos x', dP: 'cos(x)' }, { T: '\\sqrt{x}', P: 'sqrt(x)', dT: frac(1, '2\\sqrt{x}'), dP: '1/(2*sqrt(x))' }];
  G('calc1.ftc-accumulation', function (R, ctx) {
    var kind = lv(ctx, R.pick(['basic', 'basic', 'flip']), R.pick(['chain', 'chain', 'flip', 'value']), R.pick(['both', 'chain', 'max', 'value']));
    var f = R.pick(ACC), a = R.int(0, 2);
    var thm = 'Fundamental Theorem, Part 1: if $g(x) = ' + I('a', 'x', 'f(t)', 't') + '$, then $g\'(x) = f(x)$. The rate at which area piles up equals the height of the curve at the moving edge.';
    if (kind === 'basic' || kind === 'flip') {
      var flip = kind === 'flip';
      return {
        q: 'Let $g(x) = ' + (flip ? I('x', a, f.T, 't') : I(a, 'x', f.T, 't')) + '$. Find $g\'(x)$.',
        a: expr(flip ? '-(' + f.fP('x') + ')' : f.fP('x')),
        steps: [thm].concat(flip ? ['The variable is in the lower limit. Swap the limits first: $g(x) = -' + I(a, 'x', f.T, 't') + '$.', 'So $g\'(x) = -' + (f.sum ? '(' + f.fT('x') + ')' : f.fT('x')) + '$.'] : ['Replace $t$ by $x$: $g\'(x) = ' + f.fT('x') + '$. No antiderivative is needed (and for many integrands none can be written with familiar functions).']),
        hint: 'You do not need to integrate. Use FTC Part 1.', chk: { k: 'dacc', f: f.P, lo: flip ? 'x' : String(a), hi: flip ? String(a) : 'x' }
      };
    }
    if (kind === 'chain') {
      var u = R.pick(UPS);
      return {
        q: 'Let $g(x) = ' + I(a, u.T, f.T, 't') + '$. Find $g\'(x)$.',
        a: expr('(' + f.fP(u.P) + ')*(' + u.dP + ')'),
        steps: [thm, 'Here the upper limit is $u = ' + u.T + '$, not $x$. Write $g(x) = G(u)$ with $G(u) = ' + I(a, 'u', f.T, 't') + '$.', 'Chain rule: $g\'(x) = G\'(u) \\cdot ' + frac('du', 'dx') + ' = f(u) \\cdot ' + frac('du', 'dx') + '$.', '$g\'(x) = ' + (f.sum ? '\\big(' + f.fT(u.T) + '\\big)' : f.fT(u.T)) + ' \\cdot ' + (u.dT.length > 3 ? '\\left(' + u.dT + '\\right)' : u.dT) + '$.'],
        hint: 'Plug the upper limit into f, then multiply by the derivative of the upper limit.', chk: { k: 'dacc', f: f.P, lo: String(a), hi: u.P }
      };
    }
    if (kind === 'both') {
      var u2 = R.pick(UPS.slice(0, 3));
      return {
        q: 'Let $g(x) = ' + I('x', u2.T, f.T, 't') + '$. Find $g\'(x)$.',
        a: expr('(' + f.fP(u2.P) + ')*(' + u2.dP + ')-(' + f.fP('x') + ')'),
        steps: [thm, 'Split at a constant: $g(x) = ' + I(0, u2.T, f.T, 't') + ' - ' + I(0, 'x', f.T, 't') + '$.', 'Differentiate each piece: the upper limit $' + u2.T + '$ needs the chain rule; the second piece gives $f(x)$.', '$g\'(x) = ' + (f.sum ? '\\big(' + f.fT(u2.T) + '\\big)' : f.fT(u2.T)) + ' \\cdot ' + u2.dT + ' - ' + (f.sum ? '(' + f.fT('x') + ')' : f.fT('x')) + '$.'],
        hint: 'Split the integral at a constant, then use FTC on each part.', chk: { k: 'dacc', f: f.P, lo: 'x', hi: u2.P, pts: [0.4, 0.9, 1.3, 1.6] }
      };
    }
    if (kind === 'value') {
      var pp = P([R.int(-4, 4), R.int(-3, 3), R.nz(-2, 2)]), c = R.int(-2, 3), u3 = R.coin() ? UPS[0] : null, val, st;
      if (u3) { val = pp.at(c * c).mul(2 * c); st = ['$g\'(x) = f(x^{2}) \\cdot 2x$ with $f(t) = ' + pp.tex('t') + '$.', '$g\'(' + c + ') = f(' + (c * c) + ') \\cdot ' + (2 * c) + ' = ' + tx(pp.at(c * c)) + ' \\cdot ' + tp(2 * c) + ' = ' + tx(val) + '$.']; }
      else { val = pp.at(c); st = ['$g\'(x) = ' + pp.tex() + '$.', '$g\'(' + c + ') = ' + pp.subT(c) + ' = ' + tx(val) + '$.']; }
      return {
        q: 'Let $g(x) = ' + I(a, u3 ? 'x^{2}' : 'x', '(' + pp.tex('t') + ')', 't') + '$. Find $g\'(' + c + ')$.',
        a: num(val), steps: [thm].concat(st), hint: 'Differentiate g with FTC Part 1 first, then substitute.',
        chk: { k: 'fn', test: function (spec, vv, fn, nd, simpson) { var ff = fn(pp.plain('t'), ['t']), g = function (x) { return simpson(ff, a, u3 ? x * x : x, 400); }, h = 1e-4, d = (g(c + h) - g(c - h)) / (2 * h); return near(d, vv(spec), 1e-5) ? true : 'gprime ' + d; } }
      };
    }
    var p = R.int(-2, 2), q2 = p + R.int(1, 4), pr = fromRoots(1, [p, q2]);
    return {
      q: 'Let $g(x) = ' + I(0, 'x', '(' + pr.tex('t') + ')', 't') + '$. At what $x$ does $g$ have a local maximum?',
      a: num(p),
      steps: [thm, 'So $g\'(x) = ' + pr.tex() + ' = (' + xm(p) + ')(' + xm(q2) + ')$, which is 0 at $x = ' + p + '$ and $x = ' + q2 + '$.',
        '$g\'$ is positive before $' + p + '$ and negative between $' + p + '$ and $' + q2 + '$: the area stops growing and starts shrinking at $x = ' + p + '$.', 'So $g$ has a local maximum at $x = ' + p + '$ (and a local minimum at $x = ' + q2 + '$).'],
      hint: 'g′ = the integrand. Where does it change from positive to negative?', chk: { k: 'fn', test: function (spec, val) { var x = val(spec); return pr.at(q(x - 0.01)).sign() > 0 && pr.at(q(x + 0.01)).sign() < 0 ? true : 'max'; } }
    };
  });

  G('calc1.ftc-evaluate', function (R, ctx) {
    var kind = lv(ctx, R.pick(['poly', 'poly', 'recip']), R.pick(['trig', 'exp', 'recip', 'poly']), R.pick(['neg', 'trig', 'exp', 'powers']));
    var thm = 'Fundamental Theorem, Part 2: $' + I('a', 'b', 'f(x)') + ' = F(b) - F(a)$ for any antiderivative $F$ (the $+ C$ cancels).';
    if (kind === 'poly' || kind === 'neg') {
      var f = P([R.int(-5, 5), R.int(-4, 4) * 2, R.pick([3, 3, 6, -3]), kind === 'neg' ? R.pick([0, 4, -4]) : 0]), a = kind === 'neg' ? R.int(-3, -1) : R.int(0, 2), b = a + R.int(1, 3), F = f.anti(), v = F.at(b).sub(F.at(a));
      return {
        q: 'Evaluate $' + I(a, b, '\\left(' + f.tex() + '\\right)') + '$.',
        a: num(v),
        steps: [thm, 'Antiderivative: $F(x) = ' + F.tex() + '$.', '$F(' + b + ') = ' + F.subT(b) + ' = ' + tx(F.at(b)) + '$.', '$F(' + a + ') = ' + F.subT(a) + ' = ' + tx(F.at(a)) + '$.', 'Top minus bottom: $' + tx(F.at(b)) + ' - ' + tp(F.at(a)) + ' = ' + tx(v) + '$.' + (F.at(a).sign() < 0 ? ' (Subtracting a negative adds.)' : '')],
        hint: 'Find an antiderivative F, then compute F(upper) − F(lower).', chk: { k: 'int', f: f.plain(), a: a, b: b }
      };
    }
    if (kind === 'trig') {
      var A = R.nz(-4, 4), B = R.nz(-4, 4), ang = R.pick(['pi/6', 'pi/4', 'pi/3', 'pi/2', 'pi']), S = SPEC[ang], Sb = S[0], Cb = S[1];
      var val = exactLin(A, [1, 0, 1], -A, Cb); val = [q(val[0]).add(q(B).mul(Sb[0])), q(val[1]).add(q(B).mul(Sb[1])), Sb[1] && q(Sb[1]).sign() ? Sb[2] : val[2]];
      return {
        q: 'Evaluate $' + I(0, SPECT[ang], '\\left(' + T.coef(A, '\\sin x') + T.coef(B, '\\cos x', false) + '\\right)') + '$ exactly.',
        a: num(exactP(val)),
        steps: [thm, 'Antiderivative: $F(x) = ' + T.coef(-A, '\\cos x') + T.coef(B, '\\sin x', false) + '$.', '$F\\left(' + SPECT[ang] + '\\right) = ' + cp(-A, exactT(Cb)) + (B < 0 ? ' - ' : ' + ') + cp(abs(B), exactT(Sb)) + '$ and $F(0) = ' + (-A) + '$.',
          'Subtract: the integral is $' + exactT(val) + '$.'],
        hint: 'The antiderivative of sin x is −cos x.', chk: { k: 'int', f: A + '*sin(x)+' + B + '*cos(x)', a: 0, b: ang }
      };
    }
    if (kind === 'recip') {
      var t = R.pick(['ln', 'inv2', 'root']);
      if (t === 'ln') { var k = R.int(1, 5), c = R.pick([1, 2, 3]); return { q: 'Evaluate $' + I(1, 'e^{' + k + '}', frac(c, 'x')) + '$.'.replace('e^{1}', 'e'), a: num(c * k), steps: [thm, 'Antiderivative: $' + T.coef(c, '\\ln x') + '$ (here $x > 0$).', '$' + T.coef(c, '\\ln(e^{' + k + '})') + ' - ' + T.coef(c, '\\ln 1') + ' = ' + c + ' \\cdot ' + k + ' - 0 = ' + (c * k) + '$.'.replace('e^{1}', 'e')], hint: 'The antiderivative of 1/x is ln|x|.', chk: { k: 'int', f: c + '/x', a: 1, b: 'e^' + k } }; }
      if (t === 'inv2') { var bb = R.int(2, 6), v2 = q(1).sub(q(1).div(bb)); return { q: 'Evaluate $' + I(1, bb, frac(1, 'x^{2}')) + '$.', a: num(v2), steps: [thm, 'Write $x^{-2}$; antiderivative $-x^{-1} = -' + frac(1, 'x') + '$.', '$\\left(-' + frac(1, bb) + '\\right) - (-1) = 1 - ' + frac(1, bb) + ' = ' + tx(v2) + '$.'], hint: 'Raise the power: x⁻² → −x⁻¹.', chk: { k: 'int', f: '1/x^2', a: 1, b: bb } }; }
      var r2 = R.int(2, 5), v3 = q(2 * (r2 - 1)); return { q: 'Evaluate $' + I(1, r2 * r2, frac(1, '\\sqrt{x}')) + '$.', a: num(v3), steps: [thm, 'Write $x^{-1/2}$; antiderivative $2x^{1/2} = 2\\sqrt{x}$.', '$2\\sqrt{' + (r2 * r2) + '} - 2\\sqrt{1} = ' + (2 * r2) + ' - 2 = ' + (2 * r2 - 2) + '$.'], hint: 'Write the root as a power first.', chk: { k: 'int', f: '1/sqrt(x)', a: 1, b: r2 * r2 } };
    }
    if (kind === 'exp') {
      var kk = R.int(2, 9), useLn = R.coin();
      if (useLn) return { q: 'Evaluate $' + I(0, '\\ln ' + kk, 'e^{x}') + '$.', a: num(kk - 1), steps: [thm, 'Antiderivative: $e^{x}$.', '$e^{\\ln ' + kk + '} - e^{0} = ' + kk + ' - 1 = ' + (kk - 1) + '$.'], hint: 'e^x is its own antiderivative; e^(ln k) = k.', chk: { k: 'int', f: 'e^x', a: 0, b: 'ln(' + kk + ')' } };
      var m = R.int(1, 3); return { q: 'Evaluate $' + I(0, m, 'e^{x}') + '$ exactly.', a: num('e^' + m + '-1'), steps: [thm, 'Antiderivative: $e^{x}$.', '$e^{' + m + '} - e^{0} = e^{' + m + '} - 1$.'.replace('e^{1}', 'e')], hint: 'e^x is its own antiderivative.', chk: { k: 'int', f: 'e^x', a: 0, b: m } };
    }
    var r3 = R.pick([1, 4, 9]), b3 = R.pick([4, 9, 16].filter(function (z) { return z > r3; })), c3 = R.pick([3, 6, -3]), v4 = q(c3).mul(2).div(3).mul(Math.pow(b3, 1.5) - Math.pow(r3, 1.5));
    return {
      q: 'Evaluate $' + I(r3, b3, T.coef(c3, '\\sqrt{x}')) + '$.',
      a: num(v4),
      steps: [thm, 'Write $' + T.coef(c3, 'x^{1/2}') + '$; antiderivative $' + T.coef(q(2 * c3).div(3), 'x^{3/2}') + '$.', '$x^{3/2}$ at $' + b3 + '$ is $' + Math.pow(b3, 1.5) + '$ and at $' + r3 + '$ is $' + Math.pow(r3, 1.5) + '$.', '$' + tx(q(2 * c3).div(3)) + '(' + Math.pow(b3, 1.5) + ' - ' + Math.pow(r3, 1.5) + ') = ' + tx(v4) + '$.'],
      hint: 'Raise the power 1/2 to 3/2 and divide by 3/2.', chk: { k: 'int', f: c3 + '*sqrt(x)', a: r3, b: b3 }
    };
  });

  G('calc1.net-change', function (R, ctx) {
    var kind = lv(ctx, R.pick(['lin', 'flow']), R.pick(['vel', 'lin', 'cost']), R.pick(['vel', 'vel', 'flow']));
    if (kind === 'flow') {
      var a = R.int(2, 10), b = R.pick([1, 2, 3, 4]), T0 = R.pick([5, 10, 20]), V0 = R.pick([0, 50, 100, 200]), rate = P([a, b]), add = rate.anti().at(T0), V = add.add(V0);
      return {
        q: 'Water flows into a tank at $r(t) = ' + rate.tex('t') + '$ liters per minute. The tank starts with $' + V0 + '$ liters. How much water is in it after $' + T0 + '$ minutes?',
        a: num(V), unit: 'liters',
        steps: ['Net change theorem: the integral of a rate is the total change. Water added $= ' + I(0, T0, '(' + rate.tex('t') + ')', 't') + '$.', 'Antiderivative $' + rate.anti().tex('t') + '$; at $' + T0 + '$ it is $' + tx(add) + '$, at 0 it is 0. So $' + tx(add) + '$ liters were added.', 'Amount: $' + V0 + ' + ' + tx(add) + ' = ' + tx(V) + '$ liters.'],
        hint: 'Start amount + integral of the rate.', chk: { k: 'fn', test: function (spec, val, fn, nd, simpson) { return near(V0 + simpson(fn(rate.plain()), 0, T0), val(spec), 1e-7) ? true : 'flow'; } }
      };
    }
    if (kind === 'cost') {
      var A = R.pick([40, 50, 60, 80]), B = R.pick([0.1, 0.2, 0.5]), x1 = R.pick([100, 200]), x2 = x1 + R.pick([50, 100]), mc_ = P([A, -B]), dC = mc_.anti().at(x2).sub(mc_.anti().at(x1));
      return {
        q: 'The marginal cost of making $x$ bikes is $C\'(x) = ' + mc_.tex() + '$ dollars per bike. How much does the total cost rise when production goes from ' + x1 + ' to ' + x2 + ' bikes?',
        a: num(dC), unit: 'dollars',
        steps: ['The change in cost is the integral of the marginal cost: $' + I(x1, x2, '(' + mc_.tex() + ')') + '$.', 'Antiderivative: $' + mc_.anti().tex() + '$.', 'Evaluate: $' + tx(mc_.anti().at(x2)) + ' - ' + tp(mc_.anti().at(x1)) + ' = ' + tx(dC) + '$ dollars.'],
        hint: 'Integrate the rate from ' + x1 + ' to ' + x2 + '.', chk: { k: 'int', f: mc_.plain(), a: x1, b: x2 }
      };
    }
    if (kind === 'lin') {
      var m = R.int(1, 4), c = m * R.int(1, 3), Tt = c / m + R.int(1, 3), v = P([-c, m]), disp = v.anti().at(Tt), r0 = c / m, dist = q(c * r0).div(2).add(q(m * (Tt - r0) * (Tt - r0)).div(2));
      return {
        q: 'A cart moves along a track with velocity $v(t) = ' + v.tex('t') + '$ m/s for $0 \\le t \\le ' + Tt + '$. Find its displacement and the total distance it travels.',
        a: multi([['displacement: ', num(disp)], ['total distance: ', num(dist)]]),
        steps: ['Displacement $= ' + I(0, Tt, '(' + v.tex('t') + ')', 't') + ' = ' + tx(disp) + '$ m (moving backward counts as negative).', 'For distance, every bit of motion counts as positive: $' + I(0, Tt, '\\lvert ' + v.tex('t') + ' \\rvert', 't') + '$.',
          '$v < 0$ before $t = ' + r0 + '$ and $v > 0$ after. Backward: $' + tx(q(c * r0).div(2)) + '$ m; forward: $' + tx(q(m * (Tt - r0) * (Tt - r0)).div(2)) + '$ m.', 'Total distance: $' + tx(dist) + '$ m.'],
        hint: 'Split the interval where v changes sign; add the sizes for total distance.',
        chk: [{ k: 'int', f: v.plain(), a: 0, b: Tt }, { k: 'int', f: v.plain(), a: 0, b: Tt, abs: true }]
      };
    }
    var p = R.int(1, 2), q2 = p + R.int(1, 3), T1 = q2 + R.int(1, 2), vv = fromRoots(1, [p, q2]), F = vv.anti(), d = F.at(T1).sub(F.at(0));
    var seg1 = F.at(p).sub(F.at(0)), seg2 = F.at(q2).sub(F.at(p)), seg3 = F.at(T1).sub(F.at(q2)), tot = seg1.abs().add(seg2.abs()).add(seg3.abs());
    return {
      q: 'A particle moves with velocity $v(t) = ' + vv.tex('t') + '$ m/s for $0 \\le t \\le ' + T1 + '$. Find its displacement and the total distance traveled.',
      a: multi([['displacement: ', num(d)], ['total distance: ', num(tot)]]),
      steps: ['$v(t) = (' + xm(p, 't') + ')(' + xm(q2, 't') + ')$: positive on $[0, ' + p + ')$, negative on $(' + p + ', ' + q2 + ')$, positive after $' + q2 + '$.', 'Antiderivative: $F(t) = ' + F.tex('t') + '$.',
        'Pieces: $[0, ' + p + ']$: $' + tx(seg1) + '$; $[' + p + ', ' + q2 + ']$: $' + tx(seg2) + '$; $[' + q2 + ', ' + T1 + ']$: $' + tx(seg3) + '$.',
        'Displacement (just add them): $' + tx(d) + '$ m. Distance (add their sizes): $' + tx(tot) + '$ m.'],
      hint: 'Displacement is ∫v; distance is ∫|v|, so split where v changes sign.',
      chk: [{ k: 'int', f: vv.plain(), a: 0, b: T1 }, { k: 'int', f: vv.plain(), a: 0, b: T1, abs: true }]
    };
  });

  G('calc1.average-value', function (R, ctx) {
    var kind = lv(ctx, 'poly', R.pick(['poly', 'trig', 'c']), R.pick(['c', 'trig', 'recip', 'poly']));
    var def = 'Average value: $f_{\\text{avg}} = ' + frac(1, 'b - a') + I('a', 'b', 'f(x)') + '$: the height of the rectangle with the same area.';
    if (kind === 'poly') {
      var f = P([R.int(-4, 6), R.int(-4, 4) * 2, R.pick([3, -3, 6])]), a = R.int(-1, 1), b = a + R.int(1, 4), F = f.anti(), I_ = F.at(b).sub(F.at(a)), av = I_.div(b - a);
      return { q: 'Find the average value of $f(x) = ' + f.tex() + '$ on $[' + a + ', ' + b + ']$.', a: num(av), steps: [def, '$' + I(a, b, '(' + f.tex() + ')') + ' = ' + bracket(F.tex(), a, b) + ' = ' + tx(I_) + '$.', 'Divide by the length $' + (b - a) + '$: $f_{\\text{avg}} = ' + tx(av) + '$.'], hint: 'Integrate, then divide by the length of the interval.', chk: { k: 'int', f: f.plain(), a: a, b: b, scale: 1 / (b - a) } };
    }
    if (kind === 'trig') {
      var k = R.int(1, 5), t = R.pick(['sin0pi', 'cos0half', 'sin0half']), bT = t === 'sin0pi' ? '\\pi' : frac('\\pi', 2), I2 = t === 'sin0pi' ? 2 * k : k, Lp = t === 'sin0pi' ? 'pi' : 'pi/2', av2 = (2 * k) + '/pi';
      return { q: 'Find the average value of $f(x) = ' + T.coef(k, t.indexOf('sin') === 0 ? '\\sin x' : '\\cos x') + '$ on $[0, ' + bT + ']$.', a: num(av2), steps: [def, '$' + I(0, bT, T.coef(k, t.indexOf('sin') === 0 ? '\\sin x' : '\\cos x')) + ' = ' + I2 + '$.', 'Divide by the length $' + bT + '$: $' + frac(I2, bT) + ' = ' + frac(2 * k, '\\pi') + '$.'], hint: 'Integrate over the interval, then divide by its length.', chk: { k: 'int', f: k + '*' + (t.indexOf('sin') === 0 ? 'sin' : 'cos') + '(x)', a: 0, b: Lp, scale: 1 / ML.evalPlain(Lp) } };
    }
    if (kind === 'recip') {
      var kk = R.int(1, 3);
      return { q: 'Find the average value of $f(x) = ' + frac(1, 'x') + '$ on $[1, ' + (kk === 1 ? 'e' : 'e^{' + kk + '}') + ']$ exactly.', a: num(kk + '/(e^' + kk + '-1)'), steps: [def, '$' + I(1, kk === 1 ? 'e' : 'e^{' + kk + '}', frac(1, 'x')) + ' = \\ln(' + (kk === 1 ? 'e' : 'e^{' + kk + '}') + ') - \\ln 1 = ' + kk + '$.', 'Divide by the length $' + (kk === 1 ? 'e' : 'e^{' + kk + '}') + ' - 1$: $' + frac(kk, (kk === 1 ? 'e' : 'e^{' + kk + '}') + ' - 1') + '$.'], hint: 'The antiderivative of 1/x is ln x.', chk: { k: 'int', f: '1/x', a: 1, b: 'e^' + kk, scale: 1 / (Math.exp(kk) - 1) } };
    }
    var bb = R.pick([3, 6, 9]), cT = bb === 3 ? '\\sqrt{3}' : bb === 6 ? '2\\sqrt{3}' : '3\\sqrt{3}', cP = bb === 3 ? 'sqrt(3)' : bb === 6 ? '2*sqrt(3)' : '3*sqrt(3)';
    return {
      q: 'For $f(x) = x^{2}$ on $[0, ' + bb + ']$, find the number $c$ in the interval where $f(c)$ equals the average value of $f$.',
      a: num(cP),
      steps: [def, '$' + I(0, bb, 'x^{2}') + ' = ' + frac(bb + '^{3}', 3) + ' = ' + (bb * bb * bb / 3) + '$, so $f_{\\text{avg}} = ' + frac(bb * bb * bb / 3, bb) + ' = ' + (bb * bb / 3) + '$.', 'Solve $c^{2} = ' + (bb * bb / 3) + '$: $c = \\pm' + cT + '$.', 'Only $c = ' + cT + '$ lies in $[0, ' + bb + ']$. (The Mean Value Theorem for integrals promises such a $c$.)'],
      hint: 'Find the average value first, then solve f(c) = f_avg.', chk: { k: 'fn', test: function (spec, val) { var c = val(spec); return c > 0 && c < bb && near(c * c, bb * bb / 3) ? true : 'c'; } }
    };
  });

  G('calc1.u-substitution', function (R, ctx) {
    var kind = lv(ctx, R.pick(['xpow', 'lin', 'trigk']), R.pick(['root', 'cube', 'sinn', 'xcos', 'xexp']), R.pick(['adjust', 'shift', 'xcos', 'root', 'sinn']));
    var a = R.int(1, 9), n = R.int(2, 6), fT, fP, ansP, st;
    var steps0 = 'Look for an inside function $u$ whose derivative also appears (up to a constant factor).';
    if (kind === 'xpow') { var k = R.pick([2, 4, 6, 1, 3]); fT = T.coef(k, 'x') + '(x^{2} + ' + a + ')^{' + n + '}'; fP = k + '*x*(x^2+' + a + ')^' + n; ansP = cmulP(q(k).div(2 * (n + 1)), '(x^2+' + a + ')^' + (n + 1)) + '+C';
      st = [steps0, 'Let $u = x^{2} + ' + a + '$. Then $du = 2x\\,dx$, so $x\\,dx = ' + frac(1, 2) + 'du$.', 'The integral becomes $' + cI(q(k).div(2), II('u^{' + n + '}', 'u')) + ' = ' + (q(k).div(2).eq(1) ? '' : tx(q(k).div(2)) + ' \\cdot ') + frac('u^{' + (n + 1) + '}', n + 1) + ' + C$.', 'Back to $x$: $' + T.coef(q(k).div(2 * (n + 1)), '(x^{2} + ' + a + ')^{' + (n + 1) + '}') + ' + C$.']; }
    else if (kind === 'lin') { var m = R.pick([2, 3, 4, 5, -2]), b = R.int(-6, 6); fT = '(' + linT(m, b) + ')^{' + n + '}'; fP = '(' + linP(m, b) + ')^' + n; ansP = '(' + linP(m, b) + ')^' + (n + 1) + '/(' + (m * (n + 1)) + ')+C';
      st = [steps0, 'Let $u = ' + linT(m, b) + '$, so $du = ' + m + '\\,dx$ and $dx = ' + frac(1, m) + 'du$.'.replace('\\frac{1}{-2}', '-\\frac{1}{2}'), '$' + II('(' + linT(m, b) + ')^{' + n + '}') + ' = ' + frac(1, m).replace('\\frac{1}{-2}', '-\\frac{1}{2}') + II('u^{' + n + '}', 'u') + ' = ' + frac('u^{' + (n + 1) + '}', (m * (n + 1))) + ' + C$.', 'Back to $x$: $' + frac('(' + linT(m, b) + ')^{' + (n + 1) + '}', m * (n + 1)) + ' + C$.']; }
    else if (kind === 'trigk') { var kk = R.int(2, 7), fn = R.pick(['sin', 'cos']); fT = '\\' + fn + '(' + kk + 'x)'; fP = fn + '(' + kk + 'x)'; ansP = (fn === 'sin' ? '-' : '') + (fn === 'sin' ? 'cos' : 'sin') + '(' + kk + 'x)/' + kk + '+C';
      st = [steps0, 'Let $u = ' + kk + 'x$, so $dx = ' + frac(1, kk) + 'du$.', '$' + frac(1, kk) + II('\\' + fn + ' u', 'u') + ' = ' + (fn === 'sin' ? '-' : '') + frac(1, kk) + '\\' + (fn === 'sin' ? 'cos' : 'sin') + ' u + C$.', 'Answer: $' + (fn === 'sin' ? '-' : '') + frac(1, kk) + '\\' + (fn === 'sin' ? 'cos' : 'sin') + '(' + kk + 'x) + C$. (Check: differentiating brings back the factor ' + kk + '.)']; }
    else if (kind === 'root') { fT = 'x\\sqrt{x^{2} + ' + a + '}'; fP = 'x*sqrt(x^2+' + a + ')'; ansP = '(x^2+' + a + ')^(3/2)/3+C';
      st = [steps0, 'Let $u = x^{2} + ' + a + '$, $du = 2x\\,dx$, so $x\\,dx = ' + frac(1, 2) + 'du$.', '$' + frac(1, 2) + II('u^{1/2}', 'u') + ' = ' + frac(1, 2) + ' \\cdot ' + frac(2, 3) + 'u^{3/2} + C = ' + frac(1, 3) + 'u^{3/2} + C$.', 'Answer: $' + frac(1, 3) + '(x^{2} + ' + a + ')^{3/2} + C$.']; }
    else if (kind === 'cube') { fT = 'x^{2}(x^{3} + ' + a + ')^{' + n + '}'; fP = 'x^2*(x^3+' + a + ')^' + n; ansP = '(x^3+' + a + ')^' + (n + 1) + '/' + (3 * (n + 1)) + '+C';
      st = [steps0, 'Let $u = x^{3} + ' + a + '$, $du = 3x^{2}\\,dx$, so $x^{2}\\,dx = ' + frac(1, 3) + 'du$.', '$' + frac(1, 3) + II('u^{' + n + '}', 'u') + ' = ' + frac('u^{' + (n + 1) + '}', 3 * (n + 1)) + ' + C$.', 'Answer: $' + frac('(x^{3} + ' + a + ')^{' + (n + 1) + '}', 3 * (n + 1)) + ' + C$.']; }
    else if (kind === 'sinn') { var fn2 = R.pick(['sin', 'cos']), other = fn2 === 'sin' ? 'cos' : 'sin'; fT = '\\' + fn2 + '^{' + n + '} x\\,\\' + other + ' x'; fP = fn2 + '(x)^' + n + '*' + other + '(x)'; ansP = (fn2 === 'sin' ? '' : '-') + fn2 + '(x)^' + (n + 1) + '/' + (n + 1) + '+C';
      st = [steps0, 'Let $u = \\' + fn2 + ' x$, so $du = ' + (fn2 === 'sin' ? '' : '-') + '\\' + other + ' x\\,dx$.', '$' + (fn2 === 'sin' ? '' : '-') + II('u^{' + n + '}', 'u') + ' = ' + (fn2 === 'sin' ? '' : '-') + frac('u^{' + (n + 1) + '}', n + 1) + ' + C$.', 'Answer: $' + (fn2 === 'sin' ? '' : '-') + frac('\\' + fn2 + '^{' + (n + 1) + '} x', n + 1) + ' + C$.']; }
    else if (kind === 'xcos') { var fn3 = R.pick(['sin', 'cos']), k3 = R.pick([1, 2, 3]); fT = T.coef(k3, 'x') + '\\' + fn3 + '(x^{2})'; fP = k3 + '*x*' + fn3 + '(x^2)'; ansP = cmulP(q(fn3 === 'sin' ? -k3 : k3).div(2), (fn3 === 'sin' ? 'cos' : 'sin') + '(x^2)') + '+C';
      st = [steps0, 'Let $u = x^{2}$, $du = 2x\\,dx$, so $x\\,dx = ' + frac(1, 2) + 'du$.', '$' + cI(q(k3).div(2), II('\\' + fn3 + ' u', 'u')) + ' = ' + T.coef(q(fn3 === 'sin' ? -k3 : k3).div(2), '\\' + (fn3 === 'sin' ? 'cos' : 'sin') + ' u') + ' + C$.', 'Answer: $' + T.coef(q(fn3 === 'sin' ? -k3 : k3).div(2), '\\' + (fn3 === 'sin' ? 'cos' : 'sin') + '(x^{2})') + ' + C$.']; }
    else if (kind === 'xexp') { var k4 = R.pick([1, 2, 4, 6]), s = R.pick([1, -1]); fT = T.coef(k4, 'x') + 'e^{' + (s < 0 ? '-' : '') + 'x^{2}}'; fP = k4 + '*x*e^(' + s + '*x^2)'; ansP = cmulP(q(s * k4).div(2), 'e^(' + (s < 0 ? '-' : '') + 'x^2)') + '+C';
      st = [steps0, 'Let $u = ' + (s < 0 ? '-' : '') + 'x^{2}$, $du = ' + (s < 0 ? '-' : '') + '2x\\,dx$, so $x\\,dx = ' + (s < 0 ? '-' : '') + frac(1, 2) + 'du$.', '$' + cI(q(s * k4).div(2), II('e^{u}', 'u')) + ' = ' + cI(q(s * k4).div(2), 'e^{u}') + ' + C$.', 'Answer: $' + T.coef(q(s * k4).div(2), 'e^{' + (s < 0 ? '-' : '') + 'x^{2}}') + ' + C$.']; }
    else if (kind === 'adjust') { var nn = R.int(2, 4); fT = frac('x', '(x^{2} + ' + a + ')^{' + nn + '}'); fP = 'x/(x^2+' + a + ')^' + nn; ansP = '-1/(' + (2 * (nn - 1)) + '*(x^2+' + a + ')^' + (nn - 1) + ')+C';
      st = [steps0, 'Let $u = x^{2} + ' + a + '$, $x\\,dx = ' + frac(1, 2) + 'du$.', '$' + frac(1, 2) + II('u^{-' + nn + '}', 'u') + ' = ' + frac(1, 2) + ' \\cdot ' + frac('u^{-' + (nn - 1) + '}', -(nn - 1)) + ' + C$.', 'Answer: $-' + frac(1, (2 * (nn - 1)) + '(x^{2} + ' + a + ')^{' + (nn - 1) + '}') + ' + C$.'.replace('^{1}', '')]; }
    else { var b2 = R.nz(-4, 4), c2 = R.int(1, 6), inner = P([c2, b2, 1]); fT = '(' + linT(2, b2) + ')(' + inner.tex() + ')^{' + n + '}'; fP = '(' + linP(2, b2) + ')*(' + inner.plain() + ')^' + n; ansP = '(' + inner.plain() + ')^' + (n + 1) + '/' + (n + 1) + '+C';
      st = [steps0, 'Let $u = ' + inner.tex() + '$. Then $du = (' + linT(2, b2) + ')\\,dx$: exactly the other factor.', '$' + II('u^{' + n + '}', 'u') + ' = ' + frac('u^{' + (n + 1) + '}', n + 1) + ' + C$.', 'Answer: $' + frac('(' + inner.tex() + ')^{' + (n + 1) + '}', n + 1) + ' + C$.']; }
    return { q: 'Find $' + II(fT) + '$.', a: expr(cl(ansP)), steps: st.concat(['Check by differentiating: the chain rule brings back the integrand.']), hint: 'Choose u = the inside function. Then replace every x and dx, so only u is left.', chk: { k: 'anti', f: cl(fP) } };
  });

  G('calc1.substitution-definite', function (R, ctx) {
    var kind = lv(ctx, R.pick(['lin', 'xpow']), R.pick(['xpow', 'trig', 'exp']), R.pick(['root', 'trig', 'exp', 'xpow']));
    var note = 'Change the limits along with the variable, so you never have to go back to $x$.';
    if (kind === 'lin') {
      var m = R.pick([2, 3, -2]), b = R.int(0, 4), n = R.int(1, 3), lims = R.pick([[0, 1], [-1, 0], [0, 2], [1, 2]]), lo = lims[0], hi = lims[1], uL = m * lo + b, uH = m * hi + b, v = q(Math.pow(uH, n + 1) - Math.pow(uL, n + 1)).div(m * (n + 1));
      return { q: 'Evaluate $' + I(lo, hi, '(' + linT(m, b) + ')^{' + n + '}') + '$.'.replace('^{1}', ''), a: num(v), steps: ['Let $u = ' + linT(m, b) + '$, $du = ' + m + '\\,dx$.', note + ' When $x = ' + lo + '$, $u = ' + uL + '$; when $x = ' + hi + '$, $u = ' + uH + '$.', '$' + (m < 0 ? '-' + frac(1, -m) : frac(1, m)) + I(uL, uH, 'u^{' + n + '}', 'u') + ' = ' + frac(1, m) + bracket(frac('u^{' + (n + 1) + '}', n + 1), uL, uH) + ' = ' + (m < 0 ? '-' + frac(1, -m) : frac(1, m)) + ' \\cdot ' + frac(Math.pow(uH, n + 1) + ' - ' + T.p(Math.pow(uL, n + 1)), n + 1) + ' = ' + tx(v) + '$.'.replace('u^{1}', 'u')], hint: 'Substitute, and change the limits to u-values.', chk: { k: 'int', f: '(' + linP(m, b) + ')^' + n, a: lo, b: hi } };
    }
    if (kind === 'xpow') {
      var a = R.int(0, 3), bb = R.int(1, 2), n2 = R.int(1, 3), uL2 = a, uH2 = bb * bb + a, v2 = q(Math.pow(uH2, n2 + 1) - Math.pow(uL2, n2 + 1)).div(2 * (n2 + 1));
      return { q: 'Evaluate $' + I(0, bb, 'x(x^{2}' + sg(a) + ')' + (n2 === 1 ? '' : '^{' + n2 + '}')) + '$.', a: num(v2), steps: ['Let $u = x^{2}' + sg(a) + '$, $du = 2x\\,dx$, so $x\\,dx = ' + frac(1, 2) + 'du$.', note + ' $x = 0 \\Rightarrow u = ' + uL2 + '$; $x = ' + bb + ' \\Rightarrow u = ' + uH2 + '$.', '$' + frac(1, 2) + I(uL2, uH2, 'u^{' + n2 + '}', 'u') + ' = ' + frac(1, 2) + ' \\cdot ' + frac(Math.pow(uH2, n2 + 1) + ' - ' + Math.pow(uL2, n2 + 1), n2 + 1) + ' = ' + tx(v2) + '$.'.replace('u^{1}', 'u'), 'Keeping the old limits $0$ and $' + bb + '$ with $u$ would give a wrong answer.'], hint: 'u = x² + ' + a + '; find the new limits by plugging in x = 0 and x = ' + bb + '.', chk: { k: 'int', f: 'x*(x^2+' + a + ')^' + n2, a: 0, b: bb } };
    }
    if (kind === 'trig') {
      var n3 = R.int(1, 5), fn = R.pick(['sin', 'cos']), other = fn === 'sin' ? 'cos' : 'sin', kc = R.pick([1, 1, 2, 3, 4]), v3 = q(kc).div(n3 + 1);
      return { q: ('Evaluate $' + I(0, frac('\\pi', 2), (kc === 1 ? '' : kc) + '\\' + fn + '^{' + n3 + '} x\\,\\' + other + ' x') + '$.').replace('^{1} x', ' x'), a: num(v3), steps: ['Let $u = \\' + fn + ' x$, $du = ' + (fn === 'sin' ? '' : '-') + '\\' + other + ' x\\,dx$.', note + ' $x = 0 \\Rightarrow u = ' + (fn === 'sin' ? 0 : 1) + '$; $x = ' + frac('\\pi', 2) + ' \\Rightarrow u = ' + (fn === 'sin' ? 1 : 0) + '$.', (fn === 'sin' ? '$' + (kc === 1 ? '' : kc) + I(0, 1, 'u^{' + n3 + '}', 'u') + ' = ' + frac(kc, n3 + 1) + '$.' : '$-' + (kc === 1 ? '' : kc) + I(1, 0, 'u^{' + n3 + '}', 'u') + ' = ' + (kc === 1 ? '' : kc) + I(0, 1, 'u^{' + n3 + '}', 'u') + ' = ' + frac(kc, n3 + 1) + '$ (the minus sign flips the limits back).') + (gcd(kc, n3 + 1) > 1 ? ' That is $' + tx(v3) + '$.' : '')], hint: 'u = ' + fn + ' x.', chk: { k: 'int', f: kc + '*' + fn + '(x)^' + n3 + '*' + other + '(x)', a: 0, b: 'pi/2' } };
    }
    if (kind === 'exp') {
      var k = R.int(1, 3), cc = R.pick([1, 2]);
      return { q: 'Evaluate $' + I(0, cc === 1 ? 1 : '\\sqrt{' + k + '}', 'x\\,e^{x^{2}}') + '$ exactly.', a: num(cc === 1 ? '(e-1)/2' : '(e^' + k + '-1)/2'), steps: ['Let $u = x^{2}$, $x\\,dx = ' + frac(1, 2) + 'du$.', note + ' $x = 0 \\Rightarrow u = 0$; $x = ' + (cc === 1 ? 1 : '\\sqrt{' + k + '}') + ' \\Rightarrow u = ' + (cc === 1 ? 1 : k) + '$.', '$' + frac(1, 2) + I(0, cc === 1 ? 1 : k, 'e^{u}', 'u') + ' = ' + frac(1, 2) + '(e^{' + (cc === 1 ? 1 : k) + '} - 1)$.'.replace('e^{1}', 'e')], hint: 'u = x².', chk: { k: 'int', f: 'x*e^(x^2)', a: 0, b: cc === 1 ? 1 : 'sqrt(' + k + ')' } };
    }
    var tr = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [4, 3, 5], [8, 6, 10]]), A = tr[0], C = tr[1], v4 = tr[2] - A;
    return { q: 'Evaluate $' + I(0, C, frac('x', '\\sqrt{x^{2} + ' + (A * A) + '}')) + '$.', a: num(v4), steps: ['Let $u = x^{2} + ' + (A * A) + '$, $x\\,dx = ' + frac(1, 2) + 'du$.', note + ' $x = 0 \\Rightarrow u = ' + (A * A) + '$; $x = ' + C + ' \\Rightarrow u = ' + (C * C + A * A) + '$.', '$' + frac(1, 2) + I(A * A, C * C + A * A, 'u^{-1/2}', 'u') + ' = \\Big[\\sqrt{u}\\Big]_{' + (A * A) + '}^{' + (C * C + A * A) + '} = ' + tr[2] + ' - ' + A + ' = ' + v4 + '$.'], hint: 'u = x² + ' + (A * A) + '.', chk: { k: 'int', f: 'x/sqrt(x^2+' + (A * A) + ')', a: 0, b: C } };
  });

  G('calc1.exp-log-integrals', function (R, ctx) {
    function c1(t) { return t === '1' ? '' : t === '-1' ? '-' : t; } // a coefficient of 1 is not written
    var kind = lv(ctx, R.pick(['ekx', 'lin']), R.pick(['quad', 'def', 'base', 'trap']), R.pick(['tan', 'defneg', 'trap', 'quad']));
    if (kind === 'ekx') { var a = R.nz(-6, 8), k = R.intNot(-5, 6, [0, 1]); return { q: 'Find $' + II(T.coef(a, 'e^{' + T.coef(k, 'x') + '}')) + '$.', a: expr(cmulP(q(a).div(k), 'e^(' + k + 'x)') + '+C'), steps: ['Let $u = ' + T.coef(k, 'x') + '$, $dx = ' + frac(1, k).replace('\\frac{1}{-', '-\\frac{1}{') + 'du$.', '$' + II('e^{u}', 'u') + ' = e^{u} + C$, so the answer is $' + T.coef(q(a).div(k), 'e^{' + T.coef(k, 'x') + '}') + ' + C$.', 'Check: differentiating brings down a factor $' + k + '$, which cancels the $' + frac(1, k).replace('\\frac{1}{-', '-\\frac{1}{') + '$.'], hint: 'Divide by the coefficient of x in the exponent.', chk: { k: 'anti', f: a + '*e^(' + k + 'x)' } }; }
    if (kind === 'lin') { var c = R.nz(-6, 6), m = R.int(2, 5), b = R.nz(-6, 6), r = q(c).div(m); return { q: 'Find $' + II(frac(c, linT(m, b))) + '$.', a: expr(cl(pl(r) + '*ln(abs(' + linP(m, b) + '))+C')), steps: ['Let $u = ' + linT(m, b) + '$, $du = ' + m + '\\,dx$.', '$' + c1(tx(q(c).div(m))) + II(frac(1, 'u'), 'u') + ' = ' + c1(tx(r)) + '\\ln\\lvert u \\rvert + C$.', 'Answer: $' + T.coef(r, '\\ln\\lvert ' + linT(m, b) + ' \\rvert') + ' + C$. (The absolute value keeps the log defined where $' + linT(m, b) + ' < 0$.)'], hint: 'The antiderivative of 1/u is ln|u|.', chk: { k: 'anti', f: c + '/(' + linP(m, b) + ')' } }; }
    if (kind === 'quad') { var kq = R.pick([1, 2, 3, 4, 6]), aq = R.int(1, 9); return { q: 'Find $' + II(frac(T.coef(kq, 'x'), 'x^{2} + ' + aq)) + '$.', a: expr(cmulP(q(kq).div(2), 'ln(x^2+' + aq + ')') + '+C'), steps: ['Let $u = x^{2} + ' + aq + '$; $du = 2x\\,dx$, so $x\\,dx = ' + frac(1, 2) + 'du$.', '$' + cI(q(kq).div(2), II(frac(1, 'u'), 'u')) + ' = ' + cI(q(kq).div(2), '\\ln u') + ' + C$.', 'Answer: $' + T.coef(q(kq).div(2), '\\ln(x^{2} + ' + aq + ')') + ' + C$ (no absolute value needed: $x^{2} + ' + aq + ' > 0$).'], hint: 'The top is (a multiple of) the derivative of the bottom.', chk: { k: 'anti', f: kq + 'x/(x^2+' + aq + ')' } }; }
    if (kind === 'base') { var B = R.pick([2, 3, 5, 10]); return { q: 'Find $' + II(B + '^{x}') + '$.', a: expr(B + '^x/ln(' + B + ')+C'), steps: ['$' + ddx() + B + '^{x} = ' + B + '^{x}\\ln ' + B + '$.', 'So divide by the constant $\\ln ' + B + '$: $' + II(B + '^{x}') + ' = ' + frac(B + '^{x}', '\\ln ' + B) + ' + C$.'], hint: 'What is the derivative of ' + B + '^x?', chk: { k: 'anti', f: B + '^x' } }; }
    if (kind === 'tan') { var tn = R.coin(); return { q: 'Find $' + II(tn ? '\\tan x' : '\\cot x') + '$.', a: expr(tn ? '-ln(abs(cos(x)))+C' : 'ln(abs(sin(x)))+C'), steps: ['Write $' + (tn ? '\\tan x = ' + frac('\\sin x', '\\cos x') : '\\cot x = ' + frac('\\cos x', '\\sin x')) + '$.', 'Let $u = ' + (tn ? '\\cos x' : '\\sin x') + '$, $du = ' + (tn ? '-\\sin x' : '\\cos x') + '\\,dx$.', '$' + (tn ? '-' : '') + II(frac(1, 'u'), 'u') + ' = ' + (tn ? '-' : '') + '\\ln\\lvert u \\rvert + C = ' + (tn ? '-\\ln\\lvert \\cos x \\rvert' : '\\ln\\lvert \\sin x \\rvert') + ' + C$.'], hint: 'Write it as sine over cosine (or the reverse), then substitute.', chk: { k: 'anti', f: tn ? 'tan(x)' : 'cot(x)', pts: [0.3, 0.7, 1.1, 2.0, 2.6, 3.5, 4.0] } }; }
    if (kind === 'def') { var kd = R.int(1, 4), w = R.coin(); return w ? { q: 'Evaluate $' + I(1, kd === 1 ? 'e' : 'e^{' + kd + '}', frac(1, 'x')) + '$.', a: num(kd), steps: ['$' + II(frac(1, 'x')) + ' = \\ln\\lvert x \\rvert + C$.', '$\\ln(' + (kd === 1 ? 'e' : 'e^{' + kd + '}') + ') - \\ln 1 = ' + kd + ' - 0 = ' + kd + '$.'], hint: 'ln(e^k) = k.', chk: { k: 'int', f: '1/x', a: 1, b: 'e^' + kd } } : { q: 'Evaluate $' + I(0, '\\ln ' + (kd + 2), 'e^{x}') + '$.', a: num(kd + 1), steps: ['$' + II('e^{x}') + ' = e^{x} + C$.', '$e^{\\ln ' + (kd + 2) + '} - e^{0} = ' + (kd + 2) + ' - 1 = ' + (kd + 1) + '$.'], hint: 'e^(ln k) = k.', chk: { k: 'int', f: 'e^x', a: 0, b: 'ln(' + (kd + 2) + ')' } }; }
    if (kind === 'defneg') { var kn = R.int(1, 3); return { q: 'Evaluate $' + I(kn === 1 ? '-e' : '-e^{' + kn + '}', -1, frac(1, 'x')) + '$.', a: num(-kn), steps: ['On this interval $x$ is negative, so $\\ln x$ is undefined there; the absolute value in $\\ln\\lvert x \\rvert$ is what makes the formula work.', '$\\Big[\\ln\\lvert x \\rvert\\Big]_{' + (kn === 1 ? '-e' : '-e^{' + kn + '}') + '}^{-1} = \\ln 1 - \\ln(' + (kn === 1 ? 'e' : 'e^{' + kn + '}') + ') = 0 - ' + kn + ' = ' + (-kn) + '$.', 'This makes sense: $' + frac(1, 'x') + '$ is negative on the interval, so the signed area is negative.'], hint: 'Use ln|x|: the absolute value matters for negative x.', chk: { k: 'int', f: '1/x', a: '-e^' + kn, b: -1 } }; }
    var t = R.pick(['x2', 'frac']);
    if (t === 'x2') { var cx = R.pick([1, 2, 3, 5]); return { q: 'Find $' + II(frac(cx, 'x^{2}')) + '$.', a: expr('-' + cx + '/x+C'), steps: ['Careful: this is not a $\\ln$ integral. Only $' + frac(1, 'x') + '$ (the power $-1$) gives a logarithm.', 'Write $' + T.coef(cx, 'x^{-2}') + '$ and use the power rule: $' + T.coef(cx, frac('x^{-1}', -1)) + ' + C = -' + frac(cx, 'x') + ' + C$.'], hint: 'Is the power exactly −1?', chk: { k: 'anti', f: cx + '/x^2' } }; }
    var cn = R.nz(-5, 5); return { q: 'Find $' + II(frac('x' + sg(cn), 'x')) + '$.', a: expr(cl('x+' + cn + '*ln(abs(x))+C')), steps: ['Split the fraction: $' + frac('x' + sg(cn), 'x') + ' = 1' + (cn < 0 ? ' - ' : ' + ') + frac(abs(cn), 'x') + '$.', 'Integrate each piece: $x' + (cn < 0 ? ' - ' : ' + ') + T.coef(abs(cn), '\\ln\\lvert x \\rvert') + ' + C$.'], hint: 'Divide each term on top by x first.', chk: { k: 'anti', f: '(x+' + cn + ')/x' } };
  });

  G('calc1.inverse-trig-integrals', function (R, ctx) {
    var kind = lv(ctx, R.pick(['atan', 'asin']), R.pick(['def', 'kx', 'atan', 'asin', 'contrast']), R.pick(['square', 'contrast', 'def', 'mix']));
    var a = R.int(2, 6), c = R.pick([1, 1, 2, 3, 5]);
    if (kind === 'atan') return { q: 'Find $' + II(frac(c, (a * a) + ' + x^{2}')) + '$.', a: expr(cmulP(q(c).div(a), 'atan(x/' + a + ')') + '+C'), steps: ['Factor out $' + (a * a) + '$: $' + frac(c, (a * a) + ' + x^{2}') + ' = ' + frac(c, a * a) + ' \\cdot ' + frac(1, '1 + (x/' + a + ')^{2}') + '$.', 'Let $u = ' + frac('x', a) + '$, $dx = ' + a + '\\,du$: $' + frac(c, a * a) + ' \\cdot ' + a + II(frac(1, '1 + u^{2}'), 'u') + ' = ' + frac(c, a) + '\\arctan u + C$.', 'Answer: $' + T.coef(q(c).div(a), '\\arctan\\left(' + frac('x', a) + '\\right)') + ' + C$.'], hint: '∫ 1/(a² + x²) dx = (1/a) arctan(x/a) + C.', chk: { k: 'anti', f: c + '/(' + (a * a) + '+x^2)' } };
    if (kind === 'asin') return { q: 'Find $' + II(frac(c, '\\sqrt{' + (a * a) + ' - x^{2}}')) + '$.', a: expr(cl(c + '*asin(x/' + a + ')+C')), steps: ['Factor $' + a + '$ out of the root: $\\sqrt{' + (a * a) + ' - x^{2}} = ' + a + '\\sqrt{1 - (x/' + a + ')^{2}}$.', 'Let $u = ' + frac('x', a) + '$, $dx = ' + a + '\\,du$: the $' + a + '$s cancel, leaving $' + (c === 1 ? '' : c) + II(frac(1, '\\sqrt{1 - u^{2}}'), 'u') + ' = ' + T.coef(c, '\\arcsin u') + ' + C$.', 'Answer: $' + T.coef(c, '\\arcsin\\left(' + frac('x', a) + '\\right)') + ' + C$.'], hint: '∫ 1/√(a² − x²) dx = arcsin(x/a) + C.', chk: { k: 'anti', f: c + '/sqrt(' + (a * a) + '-x^2)', pts: [-1.5, -0.6, 0.35, 0.8, 1.3, 1.7] } };
    if (kind === 'kx') { var k = R.int(2, 6); return { q: 'Find $' + II(frac(1, '1 + ' + (k * k) + 'x^{2}')) + '$.', a: expr('atan(' + k + 'x)/' + k + '+C'), steps: ['Write $' + (k * k) + 'x^{2} = (' + k + 'x)^{2}$ and let $u = ' + k + 'x$, $dx = ' + frac(1, k) + 'du$.', '$' + frac(1, k) + II(frac(1, '1 + u^{2}'), 'u') + ' = ' + frac(1, k) + '\\arctan u + C = ' + frac(1, k) + '\\arctan(' + k + 'x) + C$.'], hint: 'Let u = ' + k + 'x.', chk: { k: 'anti', f: '1/(1+' + (k * k) + 'x^2)' } }; }
    if (kind === 'def') {
      var t = R.pick(['atan1', 'atan3', 'atansym', 'asinhalf']), A = R.int(1, 5), res, upT, upP, lo = 0, fT, fP;
      if (t === 'atan1') { res = 'pi/' + (4 * A); upT = String(A); upP = String(A); fT = frac(1, (A * A) + ' + x^{2}'); fP = '1/(' + (A * A) + '+x^2)'; }
      else if (t === 'atan3') { res = 'pi/' + (3 * A); upT = (A === 1 ? '' : A) + '\\sqrt{3}'; upP = A + '*sqrt(3)'; fT = frac(1, (A * A) + ' + x^{2}'); fP = '1/(' + (A * A) + '+x^2)'; }
      else if (t === 'atansym') { res = 'pi/' + (2 * A); upT = String(A); upP = String(A); lo = -A; fT = frac(1, (A * A) + ' + x^{2}'); fP = '1/(' + (A * A) + '+x^2)'; }
      else { A = 2 * R.int(1, 3); res = 'pi/6'; upT = String(A / 2); upP = String(A / 2); fT = frac(1, '\\sqrt{' + (A * A) + ' - x^{2}}'); fP = '1/sqrt(' + (A * A) + '-x^2)'; }
      var resT = t === 'asinhalf' ? frac('\\pi', 6) : frac('\\pi', (t === 'atan1' ? 4 : t === 'atan3' ? 3 : 2) * A);
      return { q: 'Evaluate $' + I(lo, upT, fT) + '$ exactly.', a: num(res),
        steps: t === 'asinhalf' ? ['Antiderivative: $\\arcsin\\left(' + frac('x', A) + '\\right)$.', 'At the top: $\\arcsin\\left(' + frac(1, 2) + '\\right) = ' + frac('\\pi', 6) + '$. At 0: $\\arcsin 0 = 0$.', 'Result: $' + resT + '$.']
          : ['Antiderivative: $' + frac(1, A) + '\\arctan\\left(' + frac('x', A) + '\\right)$.'.replace('\\frac{1}{1}', '').replace('\\frac{x}{1}', 'x'), 'At the top: $\\arctan(' + (t === 'atan3' ? '\\sqrt{3}' : '1') + ') = ' + (t === 'atan3' ? frac('\\pi', 3) : frac('\\pi', 4)) + '$. ' + (t === 'atansym' ? 'At the bottom: $\\arctan(-1) = -' + frac('\\pi', 4) + '$.' : 'At 0: $\\arctan 0 = 0$.'), 'Result: $' + resT + '$.'],
        hint: 'Use the arctan or arcsin antiderivative, then exact unit-circle values.', chk: { k: 'int', f: fP, a: lo, b: upP } };
    }
    if (kind === 'contrast') {
      var withX = R.coin(), kk = R.pick([1, 2, 3, 4]);
      return withX ? { q: 'Find $' + II(frac(T.coef(kk, 'x'), '1 + x^{2}')) + '$.', a: expr(cmulP(q(kk).div(2), 'ln(1+x^2)') + '+C'), steps: ['The top is a multiple of the derivative of the bottom ($2x$), so this is a log integral, not an arctan.', 'Let $u = 1 + x^{2}$: $' + cI(q(kk).div(2), II(frac(1, 'u'), 'u')) + ' = ' + T.coef(q(kk).div(2), '\\ln(1 + x^{2})') + ' + C$.'], hint: 'Is the numerator the derivative of the denominator (up to a constant)?', chk: { k: 'anti', f: kk + 'x/(1+x^2)' } }
        : { q: 'Find $' + II(frac(kk, '1 + x^{2}')) + '$.', a: expr(kk + '*atan(x)+C'), steps: ['There is no $x$ on top, so $u = 1 + x^{2}$ does not help ($du = 2x\\,dx$ needs an $x$).', 'This is a standard form: $' + II(frac(1, '1 + x^{2}')) + ' = \\arctan x + C$. So the answer is $' + T.coef(kk, '\\arctan x') + ' + C$ (not a logarithm).'], hint: 'What has derivative 1/(1 + x²)?', chk: { k: 'anti', f: kk + '/(1+x^2)' } };
    }
    if (kind === 'mix') { var p2 = R.nz(-4, 4), q3 = R.nz(-4, 4); return { q: 'Find $' + II(frac(T.coef(p2, 'x') + sg(q3), 'x^{2} + 1')) + '$.', a: expr(cl(cmulP(q(p2).div(2), 'ln(x^2+1)') + '+' + cmulP(q3, 'atan(x)') + '+C')), steps: ['Split into two fractions: $' + frac(T.coef(p2, 'x'), 'x^{2} + 1') + ' + ' + frac(q3, 'x^{2} + 1') + '$.', 'The first is a log integral: $' + T.coef(q(p2).div(2), '\\ln(x^{2} + 1)') + '$.', 'The second is an arctan: $' + T.coef(q3, '\\arctan x') + '$.', 'Answer: $' + T.coef(q(p2).div(2), '\\ln(x^{2} + 1)') + T.coef(q3, '\\arctan x', false) + ' + C$.'], hint: 'Split the fraction; one part is a log, the other an arctan.', chk: { k: 'anti', f: '(' + p2 + 'x+' + q3 + ')/(x^2+1)' } }; }
    var b = R.nz(-4, 4), aa = R.int(1, 4), cc2 = b * b + aa * aa, den = P([cc2, 2 * b, 1]);
    return { q: 'Find $' + II(frac(1, den.tex())) + '$.', a: expr(cl(cmulP(q(1).div(aa), 'atan((x+' + b + ')/' + aa + ')') + '+C')), steps: ['Complete the square: $' + den.tex() + ' = (' + xm(-b) + ')^{2} + ' + (aa * aa) + '$.', 'Let $u = ' + xm(-b) + '$, $du = dx$: $' + II(frac(1, 'u^{2} + ' + (aa * aa)), 'u') + ' = ' + frac(1, aa) + '\\arctan\\left(' + frac('u', aa) + '\\right) + C$.'.replace('\\frac{1}{1}', '').replace('\\frac{u}{1}', 'u'), 'Answer: $' + (aa === 1 ? '' : frac(1, aa)) + '\\arctan\\left(' + (aa === 1 ? xm(-b) : frac(xm(-b), aa)) + '\\right) + C$.'], hint: 'Complete the square in the denominator.', chk: { k: 'anti', f: '1/(' + den.plain() + ')' } };
  });


  ML.calc1Poly = P; // exposed for the course's node tests
})(window.MathLadder);
