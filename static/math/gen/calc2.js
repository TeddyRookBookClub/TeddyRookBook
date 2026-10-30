/* Math Ladder generators: Calculus 2 (calc2), every topic in data/math/topics/calc2.json.
   Built from /tmp/work_mlp15/gen/*.js (one part per unit). Answers are exact: definite integrals and sums as exact
   values (num), antiderivatives as expressions with "+ C" (check.js compares them up to a constant and reminds a
   learner who leaves the constant out), convergence questions as multiple choice with reasons.
   When MathLadder.calc2Test is true, each problem also carries p.chk, data for the independent tests in the work dir. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, Q = ML.Q, U = ML.util, by = ML.byLevel;
  var r = String.raw;

  // ---------------------------------------------------------------- small helpers
  // Phone fit: a long inline formula in a step would push the card wider than a phone screen, so formulas whose
  // estimated width is too large become display math (which scrolls inside its own box), and long chains of
  // equalities are broken into aligned lines.
  var PXU = 10.7; // px per width unit at the practice font size (calibrated against rendered widths)
  function texW(t, scr) {
    var i = 0, w = 0;
    function group() { // read {..} or single token, return its string
      while (t[i] === ' ') i++;
      if (t[i] === '{') { var d = 0, s = i; for (; i < t.length; i++) { if (t[i] === '{') d++; else if (t[i] === '}') { d--; if (!d) { i++; return t.slice(s + 1, i - 1); } } } return t.slice(s + 1); }
      if (t[i] === '\\') { var m = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)); i += m[0].length; return m[0]; }
      return t[i++] || '';
    }
    while (i < t.length) {
      var c = t[i];
      if (c === '\\') {
        var m = /^\\([a-zA-Z]+|.)/.exec(t.slice(i)); var name = m[1]; i += m[0].length;
        if (/^[td]?frac$/.test(name)) { var a = group(), b = group(); w += Math.max(texW(a, 1), texW(b, 1)) * (name === 'tfrac' ? 0.8 : 1) + 0.3; continue; }
        if (name === 'sqrt') { while (t[i] === ' ') i++; if (t[i] === '[') { var e = t.indexOf(']', i); i = e + 1; } w += texW(group()) + 1; continue; }
        if (/^(left|right|big|Big|bigg|Bigg|displaystyle|textstyle|limits|mathrm|mathbf|operatorname)$/.test(name)) continue;
        if (/^(text|mbox)$/.test(name)) { w += group().length * 0.9; continue; }
        if (name === ',' || name === ':' || name === ';') { w += 0.3; continue; }
        if (name === '!') continue;
        if (name === 'quad') { w += 1.8; continue; }
        if (name === 'qquad') { w += 3.6; continue; }
        if (name === ' ') { w += 0.5; continue; }
        if (/^(sin|cos|tan|sec|csc|cot|ln|log|lim|exp|sinh|cosh|tanh|arctan|arcsin|max|min)$/.test(name)) { w += name.length * 0.9 + 0.4; continue; }
        if (/^(cdot|approx|le|ge|leq|geq|ne|to|pm|times|equiv|sim)$/.test(name)) { w += 2; continue; }
        if (/^(int|sum|prod)$/.test(name)) { w += 1.5; continue; }
        if (/^(cdots|ldots|dots)$/.test(name)) { w += 1.8; continue; }
        if (/^(begin|end)$/.test(name)) { group(); continue; }
        w += 1; continue;
      }
      if (c === '^' || c === '_') { i++; w += texW(group(), 1) * 0.7; continue; }
      if (c === '{' || c === '}') { i++; continue; }
      if (c === ' ') { i++; continue; }
      if (c === '&') { i++; continue; }
      if (/[=+<>]/.test(c) || (c === '-' && !scr)) { i++; w += 2; continue; }
      i++; w += /[()\[\]|,.:;'!]/.test(c) ? 0.55 : 1;
    }
    return w;
  }
  function splitTop(t, seps) {
    var out = [], depth = 0, lr = 0, par = 0, last = 0, i = 0;
    function isSep(s) { return t.slice(i, i + s.length) === s && (s.charAt(0) !== '\\' || !/[a-zA-Z]/.test(t.charAt(i + s.length))); }
    while (i < t.length) {
      var c = t.charAt(i);
      if (c === '\\') {
        if (/^\\left(?![a-zA-Z])/.test(t.slice(i))) { lr++; i += 5; continue; }
        if (/^\\right(?![a-zA-Z])/.test(t.slice(i))) { lr--; i += 6; continue; }
        if (!depth && !lr && !par) { var hit = null; seps.forEach(function (s) { if (!hit && s.charAt(0) === '\\' && isSep(s)) hit = s; }); if (hit) { out.push(t.slice(last, i).trim(), hit); i += hit.length; last = i; continue; } }
        i += 2; continue;
      }
      if (c === '{') depth++; else if (c === '}') depth--; else if (c === '(') par++; else if (c === ')') par--;
      else if (!depth && !lr && !par && seps.indexOf(c) >= 0) { out.push(t.slice(last, i).trim(), c); last = i + 1; }
      i++;
    }
    out.push(t.slice(last).trim());
    return out;
  }
  function breakLine(str, lim) { // break a long sum at top-level + and - signs
    if (texW(str) * PXU <= lim) return [str];
    var pt = splitTop(str, ['+', '-']), terms = [pt[0]], lines = [], cur = '', k;
    var unary = /(^|\\(cdot|times|int|sum|prod|le|ge|leq|geq|approx|pm|mp|quad|qquad|left|lim|to|ne|frac)|[=+\-(\[{,&^_*\/])\s*$/;
    for (k = 1; k < pt.length; k += 2) {
      var last = terms[terms.length - 1];
      if (!last.trim() || unary.test(last)) terms[terms.length - 1] = (last.trim() ? last + ' ' : '') + pt[k] + (pt[k + 1] ? ' ' + pt[k + 1] : '');
      else terms.push(pt[k] + ' ' + pt[k + 1]);
    }
    for (k = 0; k < terms.length; k++) {
      if (cur.trim() && texW(cur + terms[k]) * PXU > lim) { lines.push(cur); cur = terms[k]; } else cur = (cur ? cur + ' ' : '') + terms[k];
    }
    lines.push(cur);
    return lines;
  }
  function fitDisplay(tex, punct, lim) {
    if (texW(tex) * PXU <= lim) return tex + punct;
    var parts = splitTop(tex, ['=', '\\approx']), rows = [], k, j, ls;
    if (parts.length < 3) {
      ls = breakLine(tex, lim);
      if (ls.length < 2) return tex + punct;
      rows.push('&' + ls[0]); for (j = 1; j < ls.length; j++) rows.push('&\\quad ' + ls[j]);
    } else {
      var lead = texW(parts[0]) * PXU;
      if (parts[0] && lead <= 0.3 * lim) {
        for (k = 1; k < parts.length; k += 2) {
          ls = breakLine(parts[k + 1], lim - lead - 20);
          rows.push((k === 1 ? parts[0] + ' ' : '') + '&' + parts[k] + ' ' + ls[0]);
          for (j = 1; j < ls.length; j++) rows.push('&\\quad ' + ls[j]);
        }
      } else {
        if (parts[0]) { ls = breakLine(parts[0], lim); rows.push('&' + ls[0]); for (j = 1; j < ls.length; j++) rows.push('&\\quad ' + ls[j]); }
        for (k = 1; k < parts.length; k += 2) {
          ls = breakLine(parts[k + 1], lim - 20);
          rows.push('&' + parts[k] + ' ' + ls[0]);
          for (j = 1; j < ls.length; j++) rows.push('&\\quad ' + ls[j]);
        }
      }
    }
    return '\\begin{aligned} ' + rows.join(' \\\\ ') + punct + ' \\end{aligned}';
  }
  function fitTex(s, lim) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    return s.replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$([.,;:]?)/g, function (m, disp, tex, punct) {
      if (disp) return /\\begin\{/.test(disp) ? m : '$$' + fitDisplay(disp, '', lim * 0.87) + '$$';
      if (/\\begin\{/.test(tex) || texW(tex) * PXU <= lim) return m;
      return '$$' + fitDisplay(tex, punct || '', lim * 0.87) + '$$';
    });
  }
  function done(p, chk) {
    if (ML.calc2Test && chk) p.chk = chk;
    if (p.steps) p.steps = p.steps.map(function (s) { return fitTex(s, 265); });
    if (p.q) p.q = fitTex(p.q, 300);
    if (p.hint) p.hint = fitTex(p.hint, 290);
    return p;
  }
  function Qf(x) { return Q.from(x); }
  function tx(x) { return Qf(x).toTex(); }
  function dtx(x) { return Qf(x).toTex().replace('\\frac', '\\dfrac'); }
  function pl(x) { return Qf(x).toPlain(); }
  function pp(x) { var s = pl(x); return /[-/]/.test(s) ? '(' + s + ')' : s; }   // plain, ready to multiply
  function tp(x) { return T.p(Qf(x)); }                                          // TeX, ready to multiply
  // k times a symbol: kTex(3/2, '\\pi') -> \frac{3\pi}{2};  kPlain(3/2, 'pi') -> (3/2)*pi
  function kTex(k, s) {
    k = Qf(k); if (k.isZero()) return '0';
    if (!s) return k.toTex();
    var n = k.abs().n, d = k.d, sg = k.sign() < 0 ? '-' : '', top = (n === 1n ? '' : n.toString()) + s;
    return sg + (d === 1n ? top : '\\frac{' + top + '}{' + d + '}');
  }
  function kPlain(k, s) { k = Qf(k); if (!s) return k.toPlain(); return ps([[k, s]]); }
  // a clean plain-syntax sum: ps([[3, 'ln(abs(x-2))'], [-1/2, 'x'], [5, '']]) -> "3*ln(abs(x-2))-x/2+5"
  // (each body must be a single factor or product; wrap sums in parentheses)
  function ps(list) {
    var out = '';
    list.forEach(function (t) {
      var c = Qf(t[0]), b = t[1] || ''; if (c.isZero()) return;
      var neg = c.sign() < 0, a = c.abs(), n = a.n.toString(), d = a.d.toString(), term;
      if (!b) term = d === '1' ? n : n + '/' + d;
      else term = (n === '1' ? '' : n + '*') + b + (d === '1' ? '' : '/' + d);
      out += out ? (neg ? '-' : '+') + term : (neg ? '-' : '') + term;
    });
    return out || '0';
  }
  function plinX(r, v) { v = v || 'x'; return r === 0 ? v : r > 0 ? v + '-' + r : v + '+' + (-r); }   // "x-2", "x+3"
  function lnAbs(r) { return 'ln(abs(' + plinX(r) + '))'; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function mcK(correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function sgnTerm(c, body, first) { return T.coef(c, body, first); }
  function fact(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }

  // ---------------------------------------------------------------- polynomials: arrays of Q, low degree first
  function P() { return Array.prototype.slice.call(arguments).map(Qf); }
  function pnorm(a) { a = a.slice(); while (a.length > 1 && a[a.length - 1].isZero()) a.pop(); return a; }
  function padd(a, b) { var n = Math.max(a.length, b.length), o = []; for (var i = 0; i < n; i++) o.push((a[i] || Q(0)).add(b[i] || Q(0))); return pnorm(o); }
  function psub(a, b) { return padd(a, pscale(b, -1)); }
  function pscale(a, k) { k = Qf(k); return pnorm(a.map(function (c) { return c.mul(k); })); }
  function pmul(a, b) { var o = []; for (var i = 0; i < a.length + b.length - 1; i++) o.push(Q(0)); a.forEach(function (x, i) { b.forEach(function (y, j) { o[i + j] = o[i + j].add(x.mul(y)); }); }); return pnorm(o); }
  function pint(a) { return [Q(0)].concat(a.map(function (c, i) { return c.div(i + 1); })); }
  function pder(a) { return a.length < 2 ? [Q(0)] : a.slice(1).map(function (c, i) { return c.mul(i + 1); }); }
  function pev(a, x) { x = Qf(x); var s = Q(0); for (var i = a.length - 1; i >= 0; i--) s = s.mul(x).add(a[i]); return s; }
  function pdef(a, lo, hi) { var F = pint(a); return pev(F, hi).sub(pev(F, lo)); }
  function ptex(a, v) { return T.poly(pnorm(a).slice().reverse(), v || 'x'); }
  function pplain(a, v) { v = v || 'x'; var l = []; for (var i = a.length - 1; i >= 0; i--) l.push([a[i], i === 0 ? '' : v + (i === 1 ? '' : '^' + i)]); return ps(l); }
  // TeX of an antiderivative evaluated: "\Big[ F \Big]_{a}^{b}"
  function bracket(F, a, b) { return '\\left[' + F + '\\right]_{' + a + '}^{' + b + '}'; }
  function pbracket(Fp, a, b, v) { return bracket(ptex(Fp, v), tx(a), tx(b)); }
  // a display block for long math in steps or questions
  function D(s) { return '$$' + s + '$$'; }
  function M(s) { return '$' + s + '$'; }
  var DX = '\\,dx', DY = '\\,dy', DT = '\\,dt', DTH = '\\,d\\theta';
  // "A - B = C" for an evaluated antiderivative, dropping "- 0"
  function evalDiff(A, B) { A = Qf(A); B = Qf(B); var C = A.sub(B); return B.isZero() ? tx(A) : tx(A) + ' - ' + tp(B) + ' = ' + tx(C); }
  function cf(k, v) { return T.mono(Qf(k), v); }          // coefficient times a variable: 1y -> y, 3/4 y
  function numShow(x) { x = Qf(x); return x.isInt() ? T.commas(x.toNumber()) : x.toTex(); }
  function dec(x) { return U.numStr(Qf(x)); }

  // ================================================================ UNIT 1: APPLICATIONS OF INTEGRATION

  function factorTex(k, p, q, v) { // k(v - p)(v - q)
    v = v || 'x';
    function f(c) { return c === 0 ? v : '(' + v + T.signed(-c) + ')'; }
    return (k === 1 ? '' : k === -1 ? '-' : k) + f(p) + f(q);
  }

  G('calc2.area-between-curves', function (R, ctx) {
    var shape = by(ctx, R.pick(['pq', 'pq', 'y']), R.pick(['pq', 'cross', 'y', 'pq']), R.pick(['cross', 'y', 'trig', 'pq']));
    if (shape === 'pq' || shape === 'y') {
      var v = shape === 'y' ? 'y' : 'x', dv = shape === 'y' ? DY : DX;
      var p = R.int(-3, 2), w = by(ctx, R.pick([2, 3]), R.pick([1, 2, 3, 4]), R.pick([2, 3, 4, 5])), q = p + w, k = R.pick([1, 1, 2]);
      var b = R.int(-3, 3), c = R.int(-3, 3), g = P(c, b, 1);
      var diff = pscale(pmul(P(-p, 1), P(q, -1)), k), f = padd(g, diff);
      var F = pint(diff), area = pdef(diff, p, q), mid = Q(p + q, 2);
      var first = R.coin(), A = first ? f : g, B = first ? g : f;
      var top = shape === 'y' ? 'right' : 'top', name = shape === 'y' ? 'x' : 'y';
      return done({
        q: 'Find the area of the region enclosed by the curves $' + name + ' = ' + ptex(A, v) + '$ and $' + name + ' = ' + ptex(B, v) + '$.' + (shape === 'y' ? ' (Both give $x$ in terms of $y$.)' : ''),
        a: { t: 'num', v: area.toPlain() },
        steps: [
          'Find where they meet. Setting them equal gives $' + ptex(pscale(diff, -1), v) + ' = 0$, that is $' + factorTex(k, p, q, v) + ' = 0$, so $' + v + ' = ' + p + '$ or $' + v + ' = ' + q + '$.',
          'Test a value between them, $' + v + ' = ' + tx(mid) + '$: the curve $' + name + ' = ' + ptex(f, v) + '$ gives ' + M(tx(pev(f, mid))) + ' and the other gives ' + M(tx(pev(g, mid))) + '. So $' + ptex(f, v) + '$ is on the ' + top + '.',
          (shape === 'y' ? 'Integrate right minus left, in $y$: ' : 'Integrate top minus bottom: ') + D('A = \\int_{' + p + '}^{' + q + '} \\left(' + ptex(diff, v) + '\\right)' + dv),
          'An antiderivative is $' + ptex(F, v) + '$.',
          'Evaluate: $' + evalDiff(pev(F, q), pev(F, p)) + '$.'
        ],
        hint: 'Find where the curves meet, then decide which one is on the ' + top + ' between those points.'
      }, { int: 'abs(' + pplain(diff, 'x') + ')', a: p, b: q });
    }
    if (shape === 'cross') {
      var m = R.pick([1, 2, 3]), bb = m + R.pick([1, 2]), s = R.pick([1, 1, 2]);
      var line = P(0, s * m), par = P(0, 0, s), d1 = psub(line, par), d2 = psub(par, line);
      var A1 = pdef(d1, 0, m), A2 = pdef(d2, m, bb), net = pdef(d2, 0, bb), tot = A1.add(A2);
      var lineT = cf(s * m, 'x'), parT = cf(s, 'x^{2}');
      return done({
        q: 'Find the total area between $y = ' + parT + '$ and $y = ' + lineT + '$ from $x = 0$ to $x = ' + bb + '$.',
        a: { t: 'num', v: tot.toPlain() },
        steps: [
          'The curves cross where $' + parT + ' = ' + lineT + '$, at $x = 0$ and $x = ' + m + '$. Since $' + m + '$ is inside $[0, ' + bb + ']$, the top curve changes there.',
          'On $[0, ' + m + ']$ the line is on top (at $x = ' + tx(Q(m, 2)) + '$ the line gives $' + tx(Q(s * m * m, 2)) + '$, the parabola $' + tx(Q(s * m * m, 4)) + '$). On $[' + m + ', ' + bb + ']$ the parabola is on top.',
          D('A = \\int_{0}^{' + m + '} \\left(' + ptex(d1) + '\\right)' + DX + ' + \\int_{' + m + '}^{' + bb + '} \\left(' + ptex(d2) + '\\right)' + DX),
          'First piece: $' + pbracket(pint(d1), 0, m) + ' = ' + tx(A1) + '$.',
          'Second piece: $' + pbracket(pint(d2), m, bb) + ' = ' + tx(A2) + '$.',
          'Total area: $' + tx(A1) + ' + ' + tx(A2) + ' = ' + tx(tot) + '$. (One integral of $' + ptex(d2) + '$ over $[0, ' + bb + ']$ gives only $' + tx(net) + '$, because the pieces cancel.)'
        ],
        hint: 'Find where the curves cross. Split the integral there so you always subtract bottom from top.',
        viz: { name: 'graph', opts: { fns: [s + '*x^2', s * m + '*x'], shade: { fn: 0, fn2: 1, a: 0, b: bb }, xmin: -1, xmax: bb + 1, ymin: -1, ymax: s * bb * bb + 1, zoom: false } }
      }, { int: 'abs(' + s + '*x^2-' + s * m + '*x)', a: 0, b: bb });
    }
    var a = R.pick([1, 2, 3, 4, 5]), iv = R.pick(['half', 'pi', 'quarter']), aT = a === 1 ? '' : a;
    var val, valT, lo, hi, loT, hiT, st;
    if (iv === 'half') {
      lo = 0; hi = Math.PI / 2; loT = '0'; hiT = '\\frac{\\pi}{2}';
      val = ps([[2 * a, 'sqrt(2)'], [-2 * a, '']]); valT = T.terms([[2 * a, '\\sqrt{2}'], [-2 * a, '']]);
      st = ['They cross where $\\sin x = \\cos x$, at $x = \\frac{\\pi}{4}$. Cosine is on top on $[0, \\frac{\\pi}{4}]$ and sine on $[\\frac{\\pi}{4}, \\frac{\\pi}{2}]$.',
        'First piece: $' + aT + '\\left[\\sin x + \\cos x\\right]_{0}^{\\pi/4} = ' + aT + '(\\sqrt{2} - 1)$.',
        'Second piece: $' + aT + '\\left[-\\cos x - \\sin x\\right]_{\\pi/4}^{\\pi/2} = ' + aT + '(\\sqrt{2} - 1)$.',
        'Total: $' + valT + '$.'];
    } else if (iv === 'pi') {
      lo = 0; hi = Math.PI; loT = '0'; hiT = '\\pi';
      val = ps([[2 * a, 'sqrt(2)']]); valT = T.coef(2 * a, '\\sqrt{2}');
      st = ['They cross where $\\sin x = \\cos x$, at $x = \\frac{\\pi}{4}$. Cosine is on top on $[0, \\frac{\\pi}{4}]$ and sine on $[\\frac{\\pi}{4}, \\pi]$.',
        'First piece: $' + aT + '\\left[\\sin x + \\cos x\\right]_{0}^{\\pi/4} = ' + aT + '(\\sqrt{2} - 1)$.',
        'Second piece: $' + aT + '\\left[-\\cos x - \\sin x\\right]_{\\pi/4}^{\\pi} = ' + aT + '(\\sqrt{2} + 1)$.',
        'Total: $' + valT + '$.'];
    } else {
      lo = Math.PI / 4; hi = 5 * Math.PI / 4; loT = '\\frac{\\pi}{4}'; hiT = '\\frac{5\\pi}{4}';
      val = ps([[2 * a, 'sqrt(2)']]); valT = T.coef(2 * a, '\\sqrt{2}');
      st = ['The curves meet at $x = \\frac{\\pi}{4}$ and $x = \\frac{5\\pi}{4}$ and do not cross in between. At $x = \\frac{\\pi}{2}$ sine is 1 and cosine is 0, so sine is on top.',
        D('A = ' + aT + '\\int_{\\pi/4}^{5\\pi/4} (\\sin x - \\cos x)' + DX + ' = ' + aT + '\\left[-\\cos x - \\sin x\\right]_{\\pi/4}^{5\\pi/4}'),
        'At $\\frac{5\\pi}{4}$, $-\\cos x - \\sin x = \\sqrt{2}$; at $\\frac{\\pi}{4}$ it is $-\\sqrt{2}$. The difference is $2\\sqrt{2}$.',
        'Total: $' + valT + '$.'];
    }
    return done({
      q: 'Find the area between $y = ' + aT + '\\sin x$ and $y = ' + aT + '\\cos x$ from $x = ' + loT + '$ to $x = ' + hiT + '$. Give an exact answer.',
      a: { t: 'num', v: val },
      steps: st,
      hint: 'Where is $\\sin x = \\cos x$? Split there if the top curve changes.'
    }, { int: 'abs(' + a + '*(sin(x)-cos(x)))', a: lo, b: hi });
  });

  var SECTIONS = [
    { n: 'squares', k: Q(1), sym: '', sp: '', say: 'a square of side $s$ has area $s^{2}$' },
    { n: 'semicircles', k: Q(1, 8), sym: '\\pi', sp: 'pi', say: 'a semicircle with diameter $s$ has radius $\\frac{s}{2}$, so area $\\frac{1}{2}\\pi\\left(\\frac{s}{2}\\right)^{2} = \\frac{\\pi}{8}s^{2}$' },
    { n: 'equilateral triangles', k: Q(1, 4), sym: '\\sqrt{3}', sp: 'sqrt(3)', say: 'an equilateral triangle with side $s$ has area $\\frac{\\sqrt{3}}{4}s^{2}$' },
    { n: 'isosceles right triangles with one leg in the base', k: Q(1, 2), sym: '', sp: '', say: 'a right triangle with both legs $s$ has area $\\frac{1}{2}s^{2}$' }
  ];
  function secK(S) { return S.k.toNumber() * (S.sp === 'pi' ? Math.PI : S.sp ? Math.sqrt(3) : 1); }
  function secPre(S) { return S.k.eq(1) && !S.sym ? '' : kTex(S.k, S.sym); }

  G('calc2.volume-slicing', function (R, ctx) {
    var shape = by(ctx, R.pick(['pyr', 'base', 'cone']), R.pick(['base', 'disk', 'pyr', 'base']), R.pick(['base', 'disk']));
    if (shape === 'pyr') {
      var s1 = R.pick([2, 3, 4, 5, 6, 8]), s2 = R.pick([s1, s1, 2, 3, 4, 5, 7]), h = R.pick([3, 4, 5, 6, 8, 9, 10, 12]), V0 = Q(s1 * s2 * h, 3), kA = Q(s1 * s2, h * h);
      var base = s1 === s2 ? 'a square base of side ' + s1 + ' m' : 'a rectangular base ' + s1 + ' m by ' + s2 + ' m';
      return done({
        q: 'A pyramid has ' + base + ' and height ' + h + ' m. Find its volume by slicing it parallel to the base.',
        a: { t: 'num', v: V0.toPlain() }, unit: 'm³',
        steps: [
          'Let $y$ be the distance down from the top. By similar triangles, every length in the slice at depth $y$ is $\\frac{y}{' + h + '}$ times the matching length of the base.',
          'So the slice has area $A(y) = ' + s1 * s2 + '\\left(\\frac{y}{' + h + '}\\right)^{2} = ' + cf(kA, 'y^{2}') + '$.',
          D('V = \\int_{0}^{' + h + '} ' + cf(kA, 'y^{2}') + DY + ' = ' + tx(kA) + '\\cdot\\frac{' + h + '^{3}}{3}'),
          '$V = ' + tx(V0) + '$ cubic meters, which matches $\\frac{1}{3}(\\text{base area})(\\text{height})$.'
        ],
        hint: 'Write the size of a slice as a fraction of the base, using similar triangles.'
      }, { int: kA.toPlain() + '*x^2', a: 0, b: h });
    }
    if (shape === 'cone') {
      var rc = R.int(1, 8), hc = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15]), Vc = Q(rc * rc * hc, 3), kc = Q(rc * rc, hc * hc);
      return done({
        q: 'A cone has base radius ' + rc + ' cm and height ' + hc + ' cm. Slice it into thin disks parallel to the base and find its volume. Give an exact answer.',
        a: { t: 'num', v: kPlain(Vc, 'pi') }, unit: 'cm³',
        steps: [
          'Let $y$ be the distance down from the tip. By similar triangles the slice at depth $y$ has radius $r(y) = ' + cf(Q(rc, hc), 'y') + '$.',
          'Its area is $A(y) = \\pi r(y)^{2} = ' + kTex(kc, '\\pi') + ' y^{2}$.',
          D('V = \\int_{0}^{' + hc + '} ' + kTex(kc, '\\pi') + ' y^{2}' + DY + ' = ' + kTex(kc, '\\pi') + '\\cdot\\frac{' + hc + '^{3}}{3}'),
          '$V = ' + kTex(Vc, '\\pi') + '$, the familiar $\\frac{1}{3}\\pi r^{2}h$.'
        ],
        hint: 'Use similar triangles for the radius of a slice.'
      }, { int: Math.PI * kc.toNumber() + '*x^2', a: 0, b: hc });
    }
    var S = by(ctx, R.pick([SECTIONS[0], SECTIONS[3]]), R.pick(SECTIONS), R.pick(SECTIONS));
    if (shape === 'disk' && R.int(1, 3) > 1) { // an elliptical base x^2/a^2 + y^2/b^2 <= 1
      var ea = R.int(1, 6), eb = R.int(1, 6); if (eb === ea) eb = ea === 6 ? 5 : ea + 1;
      var eI = Q(16 * ea * eb * eb, 3), eV = eI.mul(S.k), ek4 = S.k.mul(Q(4 * eb * eb, ea * ea)), ekT = ek4.eq(1) && !S.sym ? '' : kTex(ek4, S.sym);
      return done({
        q: 'A solid has an elliptical base $\\frac{x^{2}}{' + ea * ea + '} + \\frac{y^{2}}{' + eb * eb + '} \\le 1$. Cross-sections perpendicular to the $x$-axis are ' + S.n + '. Find its volume.',
        a: { t: 'num', v: kPlain(eV, S.sp) },
        steps: [
          'Solve for $y$: $y = \\pm ' + (eb === 1 ? '' : eb) + '\\sqrt{1 - \\frac{x^{2}}{' + ea * ea + '}}$, for $-' + ea + ' \\le x \\le ' + ea + '$.',
          'The slice at $x$ has width $s = ' + 2 * eb + '\\sqrt{1 - \\frac{x^{2}}{' + ea * ea + '}}$, so $s^{2} = ' + 4 * eb * eb + '\\left(1 - \\frac{x^{2}}{' + ea * ea + '}\\right) = ' + tx(Q(4 * eb * eb, ea * ea)) + '(' + ea * ea + ' - x^{2})$.',
          'Area of one slice: ' + S.say + '. So $A(x) = ' + ekT + '(' + ea * ea + ' - x^{2})$.',
          D('V = ' + ekT + '\\int_{-' + ea + '}^{' + ea + '} (' + ea * ea + ' - x^{2})' + DX + ' = ' + (ekT ? ekT + '\\cdot ' : '') + tx(Q(4 * ea * ea * ea, 3))),
          '$V = ' + kTex(eV, S.sym) + '$.'
        ],
        hint: 'Find the width of the base at $x$ (top edge minus bottom edge); that is the side $s$ of the cross-section.'
      }, { int: secK(S) + '*' + 4 * eb * eb + '*(1-x^2/' + ea * ea + ')', a: -ea, b: ea });
    }
    if (shape === 'disk') {
      var rr = R.int(1, 6), I = Q(16 * rr * rr * rr, 3), V = I.mul(S.k);
      return done({
        q: 'A solid has a circular base $x^{2} + y^{2} \\le ' + rr * rr + '$. Cross-sections perpendicular to the $x$-axis are ' + S.n + '. Find its volume.',
        a: { t: 'num', v: kPlain(V, S.sp) },
        steps: [
          'At $x$, the slice crosses the base from $y = -\\sqrt{' + rr * rr + ' - x^{2}}$ to $y = \\sqrt{' + rr * rr + ' - x^{2}}$, so its width is $s = 2\\sqrt{' + rr * rr + ' - x^{2}}$ and $s^{2} = 4(' + rr * rr + ' - x^{2})$.',
          'Area of one slice: ' + S.say + '. So $A(x) = ' + kTex(S.k.mul(4), S.sym) + '(' + rr * rr + ' - x^{2})$.',
          D('V = ' + kTex(S.k.mul(4), S.sym) + '\\int_{-' + rr + '}^{' + rr + '} (' + rr * rr + ' - x^{2})' + DX + ' = ' + kTex(S.k.mul(4), S.sym) + '\\cdot ' + tx(Q(4 * rr * rr * rr, 3))),
          '$V = ' + kTex(V, S.sym) + '$.'
        ],
        hint: 'Find the width of the base at $x$; that is the side $s$ of the cross-section.'
      }, { int: secK(S) + '*4*(' + rr * rr + '-x^2)', a: -rr, b: rr });
    }
    var fam = R.pick(['lin', 'root', 'par', 'tri']), s2p, sTex, lo = 0, hi, baseTex;
    if (fam === 'lin') { var m = R.int(1, 5), b = R.int(1, 6); s2p = P(0, 0, m * m); sTex = cf(m, 'x'); hi = b; baseTex = 'the triangle bounded by $y = ' + sTex + '$, $y = 0$ and $x = ' + b + '$'; }
    else if (fam === 'tri') { var c0 = R.int(2, 9); s2p = pmul(P(c0, -1), P(c0, -1)); sTex = c0 + ' - x'; hi = c0; baseTex = 'the triangle bounded by $y = ' + sTex + '$ and the coordinate axes'; }
    else if (fam === 'root') { var cc = R.int(1, 5), b2 = R.int(1, 8); s2p = P(0, cc * cc); sTex = (cc === 1 ? '' : cc) + '\\sqrt{x}'; hi = b2; baseTex = 'the region under $y = ' + sTex + '$ from $x = 0$ to $x = ' + b2 + '$'; }
    else { var c2 = R.pick([1, 2, 3, 4]); s2p = pmul(P(c2 * c2, 0, -1), P(c2 * c2, 0, -1)); sTex = c2 * c2 + ' - x^{2}'; lo = -c2; hi = c2; baseTex = 'the region between $y = ' + sTex + '$ and the $x$-axis'; }
    var I2 = pdef(s2p, lo, hi), V2 = I2.mul(S.k), pre = secPre(S);
    return done({
      q: 'The base of a solid is ' + baseTex + '. Cross-sections perpendicular to the $x$-axis are ' + S.n + '. Find the volume.',
      a: { t: 'num', v: kPlain(V2, S.sp) },
      steps: [
        'At $x$, the side of the cross-section is the height of the base: $s = ' + sTex + '$, for $' + lo + ' \\le x \\le ' + hi + '$.',
        'Area of one slice: ' + S.say + '. So $A(x) = ' + pre + '\\left(' + sTex + '\\right)^{2}$.',
        D('V = ' + pre + '\\int_{' + lo + '}^{' + hi + '} \\left(' + ptex(s2p) + '\\right)' + DX),
        'The integral is $' + pbracket(pint(s2p), lo, hi) + ' = ' + tx(I2) + '$.',
        '$V = ' + kTex(V2, S.sym) + '$.'
      ],
      hint: 'Volume = integral of the cross-section area. First write the side $s$ in terms of $x$.'
    }, { int: secK(S) + '*(' + pplain(s2p) + ')', a: lo, b: hi });
  });

  G('calc2.disks-washers', function (R, ctx) {
    var shape = by(ctx, R.pick(['disk', 'disk', 'pick']), R.pick(['washer', 'disk', 'ydisk', 'pick']), R.pick(['shift', 'washer', 'shift', 'ydisk']));
    if (shape === 'disk') {
      var fam = R.pick(['cone', 'root', 'sq', 'exp']), f2, fT, b, vizf;
      if (fam === 'exp') {
        var bb = R.pick([1, 2, 3, 4]), kk = R.pick(bb > 2 ? [1] : bb > 1 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6]), vt = kTex(Q(1, 2 * kk), '\\pi') + '\\left(e^{' + 2 * kk * bb + '} - 1\\right)', ek = kk === 1 ? '' : kk;
        return done({
          q: 'The region under $y = e^{' + ek + 'x}$ from $x = 0$ to $x = ' + bb + '$ is revolved about the $x$-axis. Find the volume exactly.',
          a: { t: 'num', v: 'pi*(e^' + 2 * kk * bb + '-1)/' + 2 * kk },
          steps: [
            'Each slice is a disk of radius $R(x) = e^{' + ek + 'x}$, so $R(x)^{2} = e^{' + 2 * kk + 'x}$.',
            D('V = \\pi\\int_{0}^{' + bb + '} e^{' + 2 * kk + 'x}' + DX + ' = \\pi\\left[\\frac{e^{' + 2 * kk + 'x}}{' + 2 * kk + '}\\right]_{0}^{' + bb + '}'),
            '$V = ' + vt + '$.'
          ],
          hint: 'Square the radius: $(e^{kx})^{2} = e^{2kx}$.',
          viz: { name: 'solids', opts: { quiet: true, f: 'e^(' + kk + '*x)', a: 0, b: bb, axis: 'x', angle: 300 } }
        }, { int: 'pi*e^(' + 2 * kk + '*x)', a: 0, b: bb });
      }
      if (fam === 'cone') { var m = R.int(1, 5); b = R.int(1, 6); f2 = P(0, 0, m * m); fT = cf(m, 'x'); vizf = m + '*x'; }
      else if (fam === 'root') { var c = R.int(1, 5); b = R.int(1, 8); fT = (c === 1 ? '' : c) + '\\sqrt{x}'; f2 = P(0, c * c); vizf = c + '*sqrt(x)'; }
      else { var k2 = R.pick([1, 2, 3]); b = R.pick([1, 2, 3]); f2 = P(0, 0, 0, 0, k2 * k2); fT = cf(k2, 'x^{2}'); vizf = k2 + '*x^2'; }
      var I = pdef(f2, 0, b);
      return done({
        q: 'The region under $y = ' + fT + '$ from $x = 0$ to $x = ' + b + '$ is revolved about the $x$-axis. Find the volume of the solid.',
        a: { t: 'num', v: kPlain(I, 'pi') },
        steps: [
          'Each slice perpendicular to the $x$-axis is a disk whose radius is the height of the curve: $R(x) = ' + fT + '$.',
          'A disk of radius $R$ and thickness $dx$ has volume $\\pi R^{2}\\,dx$, and $R(x)^{2} = ' + ptex(f2) + '$.',
          D('V = \\pi\\int_{0}^{' + b + '} ' + ptex(f2) + DX + ' = \\pi' + pbracket(pint(f2), 0, b)),
          '$V = ' + kTex(I, '\\pi') + '$.'
        ],
        hint: 'Disk method: $V = \\pi\\int_a^b R(x)^{2}\\,dx$, with $R(x)$ the height of the curve.',
        viz: { name: 'solids', opts: { quiet: true, f: vizf, a: 0, b: b, axis: 'x', angle: 300 } }
      }, { int: 'pi*(' + pplain(f2) + ')', a: 0, b: b });
    }
    if (shape === 'pick') {
      var m2 = R.int(1, 6), kp = R.pick([1, 1, 2, 3]), sgp0 = R.pick(['x^{2}', 'x^{3}']), sgp = cf(kp, sgp0), lineT = cf(kp * (sgp0 === 'x^{3}' ? m2 * m2 : m2), 'x'), hiP = m2;
      var right = '\\pi\\int_{0}^{' + hiP + '} \\left[(' + lineT + ')^{2} - (' + sgp + ')^{2}\\right]' + DX;
      var wrongs = ['\\pi\\int_{0}^{' + hiP + '} (' + lineT + ' - ' + sgp + ')^{2}' + DX, '\\pi\\int_{0}^{' + hiP + '} \\left[(' + sgp + ')^{2} - (' + lineT + ')^{2}\\right]' + DX, '\\pi\\int_{0}^{' + hiP + '} (' + lineT + ' - ' + sgp + ')' + DX];
      return done({
        q: 'The region between $y = ' + lineT + '$ and $y = ' + sgp + '$ (for $0 \\le x \\le ' + hiP + '$) is revolved about the $x$-axis. Which integral gives the volume?',
        a: mc('$' + right + '$', wrongs.map(function (w) { return '$' + w + '$'; })),
        steps: [
          'Each slice is a washer: a disk of outer radius $R = ' + lineT + '$ (the line is on top for $0 \\le x \\le ' + hiP + '$) with a hole of radius $r = ' + sgp + '$.',
          'Its area is $\\pi R^{2} - \\pi r^{2}$: the big disk minus the hole. That is not $\\pi(R - r)^{2}$, which would be a disk whose radius is the thickness of the ring.',
          'So $V = ' + right + '$.'
        ],
        hint: 'A washer is a big disk with a smaller disk removed.'
      }, null);
    }
    if (shape === 'washer') {
      var kind = R.pick(['linepar', 'flat', 'rootlin']), top2, bot, hi, tT, bT, vt2, vb;
      if (kind === 'linepar') { var mm = R.pick([1, 2, 3, 4]), kb = R.pick([1, 1, 2, 3]); top2 = P(0, 0, mm * mm * kb * kb); bot = P(0, 0, kb); hi = mm; tT = cf(mm * kb, 'x'); bT = cf(kb, 'x^{2}'); vt2 = mm * kb + '*x'; vb = kb + '*x^2'; }
      else if (kind === 'flat') { var cc = R.pick([1, 2, 3, 4]); if (R.coin()) { top2 = P(cc * cc * cc * cc); bot = P(0, 0, 1); hi = cc; tT = String(cc * cc); bT = 'x^{2}'; vt2 = String(cc * cc); vb = 'x^2'; } else { var mf = R.pick([1, 2, 3]); cc = R.int(1, 5); top2 = P(mf * mf * cc * cc); bot = P(0, mf); hi = cc; tT = String(mf * cc); bT = cf(mf, 'x'); vt2 = String(mf * cc); vb = mf + '*x'; } }
      else { var c3 = R.pick([1, 2, 3]); top2 = P(0, c3 * c3); bot = P(0, 1); hi = c3 * c3; tT = (c3 === 1 ? '' : c3) + '\\sqrt{x}'; bT = 'x'; vt2 = c3 + '*sqrt(x)'; vb = 'x'; }
      var integrand = psub(top2, pmul(bot, bot)), Vw = pdef(integrand, 0, hi);
      return done({
        q: 'The region between $y = ' + tT + '$ and $y = ' + bT + '$ for $0 \\le x \\le ' + hi + '$ is revolved about the $x$-axis. Find the volume.',
        a: { t: 'num', v: kPlain(Vw, 'pi') },
        steps: [
          'Slices are washers. Outer radius (the curve farther from the axis): $R = ' + tT + '$. Inner radius: $r = ' + bT + '$.',
          'Washer area: $\\pi(R^{2} - r^{2}) = \\pi\\left(' + ptex(integrand) + '\\right)$. Square each radius first, then subtract.',
          D('V = \\pi\\int_{0}^{' + hi + '} \\left(' + ptex(integrand) + '\\right)' + DX + ' = \\pi' + pbracket(pint(integrand), 0, hi)),
          '$V = ' + kTex(Vw, '\\pi') + '$.'
        ],
        hint: 'Outer radius squared minus inner radius squared, not the difference squared.',
        viz: { name: 'solids', opts: { quiet: true, f: vt2, g: vb, a: 0, b: hi, axis: 'x', angle: 300 } }
      }, { int: 'pi*(' + pplain(integrand) + ')', a: 0, b: hi });
    }
    if (shape === 'ydisk') {
      var h = R.int(1, 12), ky = R.pick([1, 2, 3, 4]), Vy = Q(h * h, 2 * ky);
      return done({
        q: 'The region bounded by $y = ' + cf(ky, 'x^{2}') + '$, the $y$-axis and the line $y = ' + h + '$ (with $x \\ge 0$) is revolved about the $y$-axis. Find the volume.',
        a: { t: 'num', v: kPlain(Vy, 'pi') },
        steps: [
          'Revolving about the $y$-axis, slice perpendicular to it: horizontal disks at height $y$, thickness $dy$.',
          'The radius is the $x$-distance to the curve: $x = \\sqrt{' + (ky === 1 ? 'y' : 'y/' + ky) + '}$, so $R(y)^{2} = ' + cf(Q(1, ky), 'y') + '$.',
          D('V = \\pi\\int_{0}^{' + h + '} ' + cf(Q(1, ky), 'y') + DY + ' = \\pi\\cdot ' + (ky === 1 ? '' : tx(Q(1, ky)) + '\\cdot ') + '\\frac{' + h + '^{2}}{2}'),
          '$V = ' + kTex(Vy, '\\pi') + '$.'
        ],
        hint: 'Slice across the axis of rotation, so here use $dy$ and write the radius in terms of $y$.'
      }, { int: 'pi*x/' + ky, a: 0, b: h });
    }
    var m3 = R.pick([1, 2, 3, 4]), kq = m3 > 2 ? 1 : R.pick([1, 1, 2, 3]), below = R.coin(), kk2 = below ? R.int(1, 8) : kq * m3 * m3 + R.int(0, 4), lT = cf(kq * m3, 'x'), pT = cf(kq, 'x^{2}');
    var Rr, rr2, RT, rT;
    if (below) { Rr = P(kk2, kq * m3); rr2 = P(kk2, 0, kq); RT = lT + ' + ' + kk2; rT = pT + ' + ' + kk2; }
    else { Rr = P(kk2, 0, -kq); rr2 = P(kk2, -kq * m3); RT = kk2 + ' - ' + pT; rT = kk2 + ' - ' + lT; }
    var integ2 = psub(pmul(Rr, Rr), pmul(rr2, rr2)), Vs = pdef(integ2, 0, m3);
    var axisT = below ? 'y = -' + kk2 : 'y = ' + kk2;
    return done({
      q: 'The region between $y = ' + lT + '$ and $y = ' + pT + '$ (for $0 \\le x \\le ' + m3 + '$) is revolved about the line $' + axisT + '$. Find the volume.',
      a: { t: 'num', v: kPlain(Vs, 'pi') },
      steps: [
        'Radii are distances to the axis $' + axisT + '$, not heights. ' + (below ? 'The axis is below the region, so a point at height $y$ is $y + ' + kk2 + '$ from the axis.' : 'The axis is above the region, so a point at height $y$ is $' + kk2 + ' - y$ from the axis.'),
        'Outer radius (the curve farther from the axis): $R = ' + RT + '$. Inner radius: $r = ' + rT + '$.',
        D('V = \\pi\\int_{0}^{' + m3 + '} \\left[\\left(' + RT + '\\right)^{2} - \\left(' + rT + '\\right)^{2}\\right]' + DX),
        'Expand: the integrand is $' + ptex(integ2) + '$.',
        'Integrate: $\\pi' + pbracket(pint(integ2), 0, m3) + ' = ' + kTex(Vs, '\\pi') + '$.'
      ],
      hint: 'Measure each radius from the axis of rotation.',
      viz: { name: 'solids', opts: { quiet: true, f: kq * m3 + '*x', g: kq + '*x^2', a: 0, b: m3, axis: 'x', k: below ? -kk2 : kk2, angle: 300 } }
    }, { int: 'pi*(' + pplain(integ2) + ')', a: 0, b: m3 });
  });

  G('calc2.shells', function (R, ctx) {
    var shape = by(ctx, R.pick(['under', 'under', 'between']), R.pick(['between', 'under', 'shift', 'xaxis']), R.pick(['shift', 'shift', 'between', 'xaxis']));
    if (shape === 'under' || shape === 'shift') {
      var fam = R.pick(['dome', 'par', 'lin', 'cap']), f, fT, hi, desc, kd = R.pick([1, 1, 2, 3]);
      if (fam === 'cap') { var cq2 = R.int(1, 6); f = P(kd * cq2 * cq2, 0, -kd); fT = kd * cq2 * cq2 + ' - ' + cf(kd, 'x^{2}'); hi = cq2; desc = 'in the first quadrant under $y = ' + fT + '$'; }
      else if (fam === 'dome') { var c = R.int(2, 8); f = P(0, kd * c, -kd); fT = cf(kd * c, 'x') + ' - ' + cf(kd, 'x^{2}'); hi = c; desc = 'between $y = ' + fT + '$ and the $x$-axis'; }
      else if (fam === 'par') { var k = R.int(1, 4); hi = R.int(1, 4); f = P(0, 0, k); fT = cf(k, 'x^{2}'); desc = 'under $y = ' + fT + '$ from $x = 0$ to $x = ' + hi + '$'; }
      else { var m = R.int(1, 6); hi = R.int(1, 5); f = P(0, m); fT = cf(m, 'x'); desc = 'under $y = ' + fT + '$ from $x = 0$ to $x = ' + hi + '$'; }
      var d = 0, side = 0, rad, radT, axisT = 'the $y$-axis', kAx = 0;
      if (shape === 'shift') { side = R.coin() ? -1 : 1; d = R.int(1, 5); if (side < 0) { rad = P(d, 1); radT = 'x + ' + d; kAx = -d; axisT = 'the line $x = -' + d + '$'; } else { rad = P(hi + d, -1); radT = (hi + d) + ' - x'; kAx = hi + d; axisT = 'the line $x = ' + (hi + d) + '$'; } }
      else { rad = P(0, 1); radT = 'x'; }
      var integ = pmul(rad, f), I = pdef(integ, 0, hi), V = I.mul(2);
      return done({
        q: 'The region ' + desc + ' is revolved about ' + axisT + '. Use cylindrical shells to find the volume.',
        a: { t: 'num', v: kPlain(V, 'pi') },
        steps: [
          (fam === 'dome' ? 'The curve meets the $x$-axis at $x = 0$ and $x = ' + hi + '$, so the' : fam === 'cap' ? 'The curve meets the $x$-axis at $x = ' + hi + '$, so the' : 'The') + ' region runs over $0 \\le x \\le ' + hi + '$.',
          'A vertical strip at $x$ sweeps out a shell. Its height is $' + fT + '$. Its radius is its distance to the axis: $' + radT + '$' + (shape === 'shift' ? (side < 0 ? ' (the axis is to the left, at $x = -' + d + '$)' : ' (the axis is to the right, at $x = ' + (hi + d) + '$)') : '') + '.',
          D('V = 2\\pi\\int_{0}^{' + hi + '} ' + (radT === 'x' ? 'x' : '(' + radT + ')') + '(' + fT + ')' + DX + ' = 2\\pi\\int_{0}^{' + hi + '} \\left(' + ptex(integ) + '\\right)' + DX),
          'The integral is $' + pbracket(pint(integ), 0, hi) + ' = ' + tx(I) + '$.',
          '$V = 2\\pi\\cdot ' + tp(I) + ' = ' + kTex(V, '\\pi') + '$.'
        ],
        hint: shape === 'shift' ? 'The radius is the distance from the strip at $x$ to the axis, not $x$ itself.' : 'Shell volume: $2\\pi\\cdot(\\text{radius})\\cdot(\\text{height})\\cdot dx$.',
        viz: { name: 'solids', opts: { quiet: true, f: pplain(f), a: 0, b: hi, axis: 'y', k: kAx, angle: 300 } }
      }, { int: '2*pi*(' + pplain(integ) + ')', a: 0, b: hi });
    }
    if (shape === 'between') {
      var m2 = R.int(1, 6), s = R.pick([1, 1, 2, 3]), lT = cf(s * m2, 'x'), pT = cf(s, 'x^{2}'), h = P(0, s * m2, -s), integ2 = pmul(P(0, 1), h), I2 = pdef(integ2, 0, m2), V2 = I2.mul(2);
      return done({
        q: 'The region between $y = ' + lT + '$ and $y = ' + pT + '$ is revolved about the $y$-axis. Use shells to find the volume.',
        a: { t: 'num', v: kPlain(V2, 'pi') },
        steps: [
          'The curves meet where $' + pT + ' = ' + lT + '$: at $x = 0$ and $x = ' + m2 + '$. On $[0, ' + m2 + ']$ the line is on top.',
          'A strip at $x$ has height $' + lT + ' - ' + pT + '$ and radius $x$.',
          D('V = 2\\pi\\int_{0}^{' + m2 + '} x(' + lT + ' - ' + pT + ')' + DX + ' = 2\\pi' + pbracket(pint(integ2), 0, m2)),
          'The bracket equals $' + tx(I2) + '$, so $V = ' + kTex(V2, '\\pi') + '$.'
        ],
        hint: 'Height = top curve minus bottom curve; radius = distance to the $y$-axis.',
        viz: { name: 'solids', opts: { quiet: true, f: s * m2 + '*x', g: s + '*x^2', a: 0, b: m2, axis: 'y', angle: 300 } }
      }, { int: '2*pi*x*(' + pplain(h) + ')', a: 0, b: m2 });
    }
    var sb = R.int(1, 7), b = sb * sb, cr = R.pick([1, 1, 2, 3]), V3 = Q(cr * cr * b * b, 2), top = cr * sb, c2r = cr * cr;
    var leftT = cr === 1 ? 'y^{2}' : '\\frac{y^{2}}{' + c2r + '}';
    return done({
      q: 'The region bounded by $y = ' + (cr === 1 ? '' : cr) + '\\sqrt{x}$, $y = 0$ and $x = ' + b + '$ is revolved about the $x$-axis. Use cylindrical shells (horizontal strips) to find the volume.',
      a: { t: 'num', v: kPlain(V3, 'pi') },
      steps: [
        'Horizontal strips at height $y$ run from the curve $x = ' + leftT + '$ to the line $x = ' + b + '$, for $0 \\le y \\le ' + top + '$.',
        'Each strip sweeps out a shell with radius $y$ (distance to the $x$-axis) and length $' + b + ' - ' + leftT + '$.',
        D('V = 2\\pi\\int_{0}^{' + top + '} y\\left(' + b + ' - ' + leftT + '\\right)' + DY + ' = 2\\pi\\left[\\frac{' + (b === 1 ? '' : b) + 'y^{2}}{2} - \\frac{y^{4}}{' + 4 * c2r + '}\\right]_{0}^{' + top + '}'),
        '$V = 2\\pi\\left(' + tx(Q(b * top * top, 2)) + ' - ' + tx(Q(Math.pow(top, 4), 4 * c2r)) + '\\right) = ' + kTex(V3, '\\pi') + '$. The disk method agrees: $\\pi\\int_0^{' + b + '} ' + (cr === 1 ? '' : c2r) + 'x\\,dx = ' + kTex(V3, '\\pi') + '$.'
      ],
      hint: 'With shells about the $x$-axis, strips are horizontal: radius $y$, length (right minus left).'
    }, { int: '2*pi*x*(' + b + '-x^2/' + c2r + ')', a: 0, b: top });
  });

  G('calc2.arc-length', function (R, ctx) {
    var shape = by(ctx, R.pick(['pow', 'pick', 'pow', 'cube']), R.pick(['pow', 'recip', 'log', 'pick', 'cube']), R.pick(['recip', 'log', 'cube', 'recip', 'log', 'cos']));
    if (shape === 'pick') {
      var fs = [['x^{3}', '3x^{2}'], ['\\sin x', '\\cos x'], ['e^{2x}', '2e^{2x}'], ['x^{4}', '4x^{3}'], ['\\ln x', '\\frac{1}{x}'], ['\\sqrt{x}', '\\frac{1}{2\\sqrt{x}}'], ['x^{2}', '2x'], ['x^{5}', '5x^{4}'], ['e^{x}', 'e^{x}'], ['x^{3/2}', '\\frac{3}{2}\\sqrt{x}'], ['\\tan^{-1} x', '\\frac{1}{1 + x^{2}}'], ['\\cosh x', '\\sinh x']], F = R.pick(fs), a = R.pick([1, 2, 3]), b = a + R.pick([1, 2, 3, 4]);
      var right = '\\int_{' + a + '}^{' + b + '} \\sqrt{1 + \\left(' + F[1] + '\\right)^{2}}' + DX;
      var wr = ['\\int_{' + a + '}^{' + b + '} \\sqrt{1 + ' + F[1] + '}' + DX, '\\int_{' + a + '}^{' + b + '} \\sqrt{1 + \\left(' + F[0] + '\\right)^{2}}' + DX, '\\int_{' + a + '}^{' + b + '} \\left(1 + \\left(' + F[1] + '\\right)^{2}\\right)' + DX];
      return done({
        q: 'Which integral gives the length of the curve $y = ' + F[0] + '$ from $x = ' + a + '$ to $x = ' + b + '$?',
        a: mc('$' + right + '$', wr.map(function (w) { return '$' + w + '$'; })),
        steps: [
          'A tiny piece of the curve is the hypotenuse of a triangle with legs $dx$ and $dy$, so its length is $\\sqrt{dx^{2} + dy^{2}} = \\sqrt{1 + (dy/dx)^{2}}\\,dx$.',
          'Here $\\frac{dy}{dx} = ' + F[1] + '$, and it is squared inside the root.',
          'So $L = ' + right + '$.'
        ],
        hint: 'Pythagoras on a tiny piece: legs $dx$ and $dy$.'
      }, null);
    }
    if (shape === 'pow') {
      var opt = R.pick([{ k: '\\frac{2}{3}', kp: '2/3', c: 1, pts: [0, 3, 8, 15, 24, 35, 48] }, { k: '\\frac{4}{3}', kp: '4/3', c: 4, pts: [0, 2, 6, 12, 20, 30] }, { k: '2', kp: '2', c: 9, pts: [0, 7, 11, 32, 40] }, { k: '\\frac{8}{3}', kp: '8/3', c: 16, pts: [0, 3, 5, 14] }]);
      var ij = R.sample(opt.pts.map(function (_, i) { return i; }), 2).sort(function (x, y) { return x - y; }), A = opt.pts[ij[0]], B = opt.pts[ij[1]], c = opt.c;
      var uA = 1 + c * A, uB = 1 + c * B, sA = Math.round(Math.sqrt(uA)), sB = Math.round(Math.sqrt(uB));
      var L = Q(2, 3 * c).mul(sB * sB * sB - sA * sA * sA);
      var yp = c === 1 ? '\\sqrt{x}' : Math.round(Math.sqrt(c)) + '\\sqrt{x}', inner = c === 1 ? '1 + x' : '1 + ' + c + 'x';
      return done({
        q: 'Find the length of the curve $y = ' + opt.k + 'x^{3/2}$ from $x = ' + A + '$ to $x = ' + B + '$.',
        a: { t: 'num', v: L.toPlain() },
        steps: [
          '$\\frac{dy}{dx} = ' + opt.k + '\\cdot\\frac{3}{2}x^{1/2} = ' + yp + '$, so $1 + \\left(\\frac{dy}{dx}\\right)^{2} = ' + inner + '$.',
          D('L = \\int_{' + A + '}^{' + B + '} \\sqrt{' + inner + '}' + DX + ' = \\left[' + tx(Q(2, 3 * c)) + '(' + inner + ')^{3/2}\\right]_{' + A + '}^{' + B + '}'),
          'At $x = ' + B + '$: $' + uB + '^{3/2} = ' + sB * sB * sB + '$. At $x = ' + A + '$: $' + uA + '^{3/2} = ' + sA * sA * sA + '$.',
          '$L = ' + tx(Q(2, 3 * c)) + '(' + sB * sB * sB + ' - ' + sA * sA * sA + ') = ' + tx(L) + '$.'
        ],
        hint: 'Square the derivative, add 1, then integrate the square root.'
      }, { len: opt.kp + '*x^(3/2)', a: A, b: B });
    }
    if (shape === 'cube') {
      var a3 = R.int(0, 5), b3 = a3 + R.int(1, 5), Fc = function (x) { return Q(x * x * x, 3).add(x); }, L3 = Fc(b3).sub(Fc(a3));
      return done({
        q: 'Find the length of $y = \\frac{1}{3}\\left(x^{2} + 2\\right)^{3/2}$ from $x = ' + a3 + '$ to $x = ' + b3 + '$.',
        a: { t: 'num', v: L3.toPlain() },
        steps: [
          '$\\frac{dy}{dx} = \\frac{1}{3}\\cdot\\frac{3}{2}(x^{2} + 2)^{1/2}\\cdot 2x = x\\sqrt{x^{2} + 2}$.',
          '$1 + \\left(\\frac{dy}{dx}\\right)^{2} = 1 + x^{2}(x^{2} + 2) = x^{4} + 2x^{2} + 1 = (x^{2} + 1)^{2}$.',
          D('L = \\int_{' + a3 + '}^{' + b3 + '} (x^{2} + 1)' + DX + ' = \\left[\\frac{x^{3}}{3} + x\\right]_{' + a3 + '}^{' + b3 + '}'),
          '$L = ' + evalDiff(Fc(b3), Fc(a3)) + '$.'
        ],
        hint: 'Expand $1 + (y\')^{2}$ and look for a perfect square.'
      }, { len: '(x^2+2)^(3/2)/3', a: a3, b: b3 });
    }
    if (shape === 'recip') {
      // y = x^(n+1)/(2(n+1)) + 1/(2(n-1)x^(n-1)), so y' = x^n/2 - 1/(2x^n)
      var nR = R.pick([2, 3, 4]), fam = String(nR), a2 = R.pick([1, 1, 2, 3, 4]), b2 = a2 + R.pick([1, 2, 3, 4]), Fp, fT, ypT, sqT, FT;
      var pw = function (e) { return e === 1 ? 'x' : 'x^{' + e + '}'; }, d1 = 2 * (nR + 1), d2 = 2 * (nR - 1);
      Fp = function (x) { return Q(Math.pow(x, nR + 1), d1).sub(Q(1, d2 * Math.pow(x, nR - 1))); };
      fT = '\\frac{' + pw(nR + 1) + '}{' + d1 + '} + \\frac{1}{' + d2 + pw(nR - 1) + '}'; ypT = '\\frac{' + pw(nR) + '}{2} - \\frac{1}{2' + pw(nR) + '}'; sqT = '\\frac{' + pw(nR) + '}{2} + \\frac{1}{2' + pw(nR) + '}'; FT = '\\frac{' + pw(nR + 1) + '}{' + d1 + '} - \\frac{1}{' + d2 + pw(nR - 1) + '}';
      return done({
        q: 'Find the length of $y = ' + fT + '$ from $x = ' + a2 + '$ to $x = ' + b2 + '$.',
        a: { t: 'num', v: Fp(b2).sub(Fp(a2)).toPlain() },
        steps: [
          '$\\frac{dy}{dx} = ' + ypT + '$.',
          'Squaring gives a middle term of $-\\frac{1}{2}$; adding 1 turns it into $+\\frac{1}{2}$, so $1 + \\left(\\frac{dy}{dx}\\right)^{2} = \\left(' + sqT + '\\right)^{2}$, a perfect square.',
          D('L = \\int_{' + a2 + '}^{' + b2 + '} \\left(' + sqT + '\\right)' + DX + ' = \\left[' + FT + '\\right]_{' + a2 + '}^{' + b2 + '}'),
          '$L = ' + evalDiff(Fp(b2), Fp(a2)) + '$.'
        ],
        hint: 'Expand $1 + (y\')^{2}$. It turns out to be a perfect square, so the root disappears.'
      }, { len: 'x^' + (nR + 1) + '/' + d1 + '+1/(' + d2 + '*x^' + (nR - 1) + ')', a: a2, b: b2 });
    }
    if (shape === 'log') {
      // y = k x^2/2 - ln(x)/(4k): 1 + y'^2 = (k x + 1/(4 k x))^2
      var kq = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4)]), a4 = R.pick([1, 1, 2, 3, 4]), b4 = a4 + R.int(1, 5);
      var c1 = kq.div(2), c2 = Q(1).div(kq.mul(4)), Lq = c1.mul(b4 * b4 - a4 * a4);
      var t1 = kq.eq(2) ? 'x^{2}' : '\\frac{' + (kq.n === 1n ? '' : kq.n) + 'x^{2}}{' + c1.inv().num() * Number(kq.n) + '}';
      var t2 = '\\frac{\\ln x}{' + c2.inv().toTex() + '}', ypT = cf(kq, 'x') + ' - \\frac{1}{' + cf(kq.mul(4), 'x') + '}', sqT = cf(kq, 'x') + ' + \\frac{1}{' + cf(kq.mul(4), 'x') + '}';
      var lnPart = a4 === 1 ? 'ln(' + b4 + ')' : 'ln(' + b4 + '/' + a4 + ')', lnT = cf(c2, a4 === 1 ? '\\ln ' + b4 : '\\ln\\frac{' + b4 + '}{' + a4 + '}');
      return done({
        q: 'Find the length of $y = ' + cf(c1, 'x^{2}') + ' - ' + t2 + '$ from $x = ' + a4 + '$ to $x = ' + b4 + '$. Give an exact answer.',
        a: { t: 'num', v: ps([[Lq, ''], [c2, lnPart]]) },
        steps: [
          '$\\frac{dy}{dx} = ' + ypT + '$, so squaring gives a middle term of $-2\\cdot ' + cf(kq, 'x') + '\\cdot\\frac{1}{' + cf(kq.mul(4), 'x') + '} = -\\frac{1}{2}$.',
          'Adding 1 flips that middle term to $+\\frac{1}{2}$: $1 + \\left(\\frac{dy}{dx}\\right)^{2} = \\left(' + sqT + '\\right)^{2}$.',
          D('L = \\int_{' + a4 + '}^{' + b4 + '} \\left(' + sqT + '\\right)' + DX + ' = \\left[' + cf(c1, 'x^{2}') + ' + ' + t2 + '\\right]_{' + a4 + '}^{' + b4 + '}'),
          '$L = ' + tx(Lq) + ' + ' + lnT + '$.'
        ],
        hint: 'After squaring the derivative and adding 1, look for a perfect square.'
      }, { len: c1.toPlain() + '*x^2-(' + c2.toPlain() + ')*ln(x)', a: a4, b: b4 });
    }
    var secF = R.coin(), up = R.pick([['\\frac{\\pi}{4}', Math.PI / 4, 'ln(sqrt(2)+1)', '\\ln\\left(\\sqrt{2} + 1\\right)', '\\sec\\frac{\\pi}{4} + \\tan\\frac{\\pi}{4} = \\sqrt{2} + 1'], ['\\frac{\\pi}{3}', Math.PI / 3, 'ln(2+sqrt(3))', '\\ln\\left(2 + \\sqrt{3}\\right)', '\\sec\\frac{\\pi}{3} + \\tan\\frac{\\pi}{3} = 2 + \\sqrt{3}'], ['\\frac{\\pi}{6}', Math.PI / 6, 'ln(sqrt(3))', '\\ln\\sqrt{3} = \\frac{1}{2}\\ln 3', '\\sec\\frac{\\pi}{6} + \\tan\\frac{\\pi}{6} = \\frac{2}{\\sqrt{3}} + \\frac{1}{\\sqrt{3}} = \\sqrt{3}']]);
    return done({
      q: 'Find the length of $y = ' + (secF ? '\\ln(\\sec x)' : '\\ln(\\cos x)') + '$ from $x = 0$ to $x = ' + up[0] + '$. Give an exact answer.',
      a: { t: 'num', v: up[2] },
      steps: [
        secF ? '$\\frac{dy}{dx} = \\frac{\\sec x\\tan x}{\\sec x} = \\tan x$, so $1 + \\left(\\frac{dy}{dx}\\right)^{2} = 1 + \\tan^{2} x = \\sec^{2} x$.' : '$\\frac{dy}{dx} = \\frac{-\\sin x}{\\cos x} = -\\tan x$, so $1 + \\left(\\frac{dy}{dx}\\right)^{2} = 1 + \\tan^{2} x = \\sec^{2} x$.',
        'On this interval $\\sec x > 0$, so $\\sqrt{\\sec^{2} x} = \\sec x$.',
        D('L = \\int_{0}^{' + up[0] + '} \\sec x' + DX + ' = \\Big[\\ln\\left|\\sec x + \\tan x\\right|\\Big]_{0}^{' + up[0] + '}'),
        'At the top: $' + up[4] + '$. At $0$: $\\ln(1 + 0) = 0$. So $L = ' + up[3] + '$.'
      ],
      hint: 'Use $1 + \\tan^{2} x = \\sec^{2} x$.'
    }, { len: secF ? '-ln(cos(x))' : 'ln(cos(x))', a: 0, b: up[1] });
  });

  var PYTH = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25]];
  G('calc2.surface-of-revolution', function (R, ctx) {
    var shape = by(ctx, R.pick(['cone', 'sphere', 'frustum']), R.pick(['cone', 'sphere', 'root', 'frustum']), R.pick(['root', 'cube', 'sphere', 'root', 'sphere']));
    if (shape === 'cone' || shape === 'frustum') {
      var kk = R.pick(PYTH), k = Q(kk[0], kk[1]), b = kk[1] * R.int(1, kk[1] > 12 ? 2 : 4), c0 = shape === 'frustum' ? R.int(1, 6) : 0;
      var sqr = Q(kk[2], kk[1]), inner = k.mul(b * b).div(2).add(c0 * b), S = sqr.mul(inner).mul(2), fT = cf(k, 'x') + (c0 ? ' + ' + c0 : '');
      return done({
        q: 'The segment $y = ' + fT + '$, $0 \\le x \\le ' + b + '$, is revolved about the $x$-axis' + (c0 ? '' : ', making a cone') + '. Find the area of the surface it sweeps out' + (c0 ? '' : ' (not counting the base)') + '.',
        a: { t: 'num', v: kPlain(S, 'pi') },
        steps: [
          '$y\' = ' + tx(k) + '$, so $\\sqrt{1 + (y\')^{2}} = \\sqrt{1 + ' + tx(k.mul(k)) + '} = ' + tx(sqr) + '$.',
          D('S = 2\\pi\\int_{0}^{' + b + '} \\left(' + fT + '\\right)\\cdot ' + tx(sqr) + DX + ' = 2\\pi\\cdot ' + tx(sqr) + '\\left[' + ptex(pint(P(c0, k))) + '\\right]_{0}^{' + b + '}'),
          '$S = 2\\pi\\cdot ' + tx(sqr) + '\\cdot ' + tp(inner) + ' = ' + kTex(S, '\\pi') + '$.'
        ],
        hint: '$S = 2\\pi\\int y\\sqrt{1 + (y\')^{2}}\\,dx$.'
      }, { surf: k.toPlain() + '*x+' + c0, a: 0, b: b });
    }
    if (shape === 'sphere') {
      var r0 = R.pick([2, 3, 4, 5, 6, 7, 8]), a = R.int(-r0 + 1, 0), b2 = R.int(a + 1, r0), S2 = Q(2 * r0 * (b2 - a));
      return done({
        q: 'The curve $y = \\sqrt{' + r0 * r0 + ' - x^{2}}$ for $' + a + ' \\le x \\le ' + b2 + '$ is revolved about the $x$-axis, making a band on a sphere. Find its surface area.',
        a: { t: 'num', v: kPlain(S2, 'pi') },
        steps: [
          '$y\' = \\frac{-x}{\\sqrt{' + r0 * r0 + ' - x^{2}}}$, so $1 + (y\')^{2} = \\frac{' + r0 * r0 + ' - x^{2} + x^{2}}{' + r0 * r0 + ' - x^{2}} = \\frac{' + r0 * r0 + '}{' + r0 * r0 + ' - x^{2}}$.',
          'Then $y\\sqrt{1 + (y\')^{2}} = \\sqrt{' + r0 * r0 + ' - x^{2}}\\cdot\\frac{' + r0 + '}{\\sqrt{' + r0 * r0 + ' - x^{2}}} = ' + r0 + '$, a constant.',
          D('S = 2\\pi\\int_{' + a + '}^{' + b2 + '} ' + r0 + DX + ' = 2\\pi\\cdot ' + r0 + '\\cdot ' + (b2 - a)),
          '$S = ' + kTex(S2, '\\pi') + '$. A band of a sphere has area $2\\pi r$ times its width.'
        ],
        hint: 'Simplify $y\\sqrt{1 + (y\')^{2}}$ before integrating.'
      }, { surf: 'sqrt(' + r0 * r0 + '-x^2)', a: a, b: b2 });
    }
    if (shape === 'root') {
      var opt = R.pick([{ c: 1, list: [2, 6, 12, 20, 30] }, { c: 2, list: [3, 8, 15, 24, 35] }, { c: 3, list: [4, 10, 18, 28] }, { c: 4, list: [5, 12, 21, 32] }, { c: 6, list: [7, 16, 27, 40] }]), cc = opt.c, lst = [0].concat(opt.list);
      var ijr = R.coin() ? [0, R.int(1, lst.length - 1)] : R.sample(lst.map(function (_, i) { return i; }), 2).sort(function (x, y) { return x - y; }), aa = lst[ijr[0]], bb = lst[ijr[1]];
      var sh = Q(cc * cc, 4), top = sh.add(bb), low = sh.add(aa), rt = function (q) { var n = Math.round(Math.sqrt(q.num())), d = Math.round(Math.sqrt(q.den())); return Q(n * n * n, d * d * d); };
      var S3 = Q(4 * cc, 3).mul(rt(top).sub(rt(low))), cT = cc === 1 ? '' : cc, shT = tx(sh);
      return done({
        q: 'The curve $y = ' + cT + '\\sqrt{x}$, $' + aa + ' \\le x \\le ' + bb + '$, is revolved about the $x$-axis. Find the surface area.',
        a: { t: 'num', v: kPlain(S3, 'pi') },
        steps: [
          '$y\' = \\frac{' + cc + '}{2\\sqrt{x}}$, so $y\\sqrt{1 + (y\')^{2}} = ' + cT + '\\sqrt{x}\\sqrt{1 + \\frac{' + cc * cc + '}{4x}} = ' + cT + '\\sqrt{x + ' + shT + '}$.',
          D('S = 2\\pi\\int_{' + aa + '}^{' + bb + '} ' + cT + '\\sqrt{x + ' + shT + '}' + DX + ' = ' + kTex(Q(4 * cc, 3), '\\pi') + '\\left[\\left(x + ' + shT + '\\right)^{3/2}\\right]_{' + aa + '}^{' + bb + '}'),
          '$\\left(' + tx(top) + '\\right)^{3/2} = ' + tx(rt(top)) + '$ and $\\left(' + tx(low) + '\\right)^{3/2} = ' + tx(rt(low)) + '$.',
          '$S = ' + kTex(Q(4 * cc, 3), '\\pi') + '\\left(' + evalDiff(rt(top), rt(low)) + '\\right) = ' + kTex(S3, '\\pi') + '$.'
        ],
        hint: 'Multiply $y$ into the root before integrating.'
      }, { surf: cc + '*sqrt(x)', a: aa, b: bb });
    }
    var cq = R.pick([[1, 3], [2, 3], [1, 1], [4, 3], [2, 1]]), c = Q(cq[0], cq[1]), bU = R.pick([1, 1, 2]), iv = Q(1).add(c.mul(c).mul(9 * Math.pow(bU, 4))).num(), coef = Q(1).div(c.mul(27));
    var ansP = ps([[coef, 'pi*(' + iv + '*sqrt(' + iv + ')-1)']]), ansT = kTex(coef, '\\pi') + '\\left(' + iv + '\\sqrt{' + iv + '} - 1\\right)';
    var c9 = c.mul(c).mul(9), c9T = c9.eq(1) ? '' : tx(c9);
    return done({
      q: 'The curve $y = ' + cf(c, 'x^{3}') + '$, $0 \\le x \\le ' + bU + '$, is revolved about the $x$-axis. Find the surface area exactly.',
      a: { t: 'num', v: ansP },
      steps: [
        '$y\' = ' + cf(c.mul(3), 'x^{2}') + '$, so $1 + (y\')^{2} = 1 + ' + c9T + 'x^{4}$.',
        D('S = 2\\pi\\int_{0}^{' + bU + '} ' + cf(c, 'x^{3}') + '\\sqrt{1 + ' + c9T + 'x^{4}}' + DX),
        'Let $u = 1 + ' + c9T + 'x^{4}$, so $du = ' + cf(c.mul(c).mul(36), 'x^{3}') + '\\,dx$; $u$ runs from $1$ to $' + iv + '$.',
        '$S = 2\\pi\\cdot ' + tx(c) + '\\cdot\\frac{1}{' + tx(c.mul(c).mul(36)) + '}\\cdot\\frac{2}{3}\\left[u^{3/2}\\right]_{1}^{' + iv + '} = ' + ansT + '$.'
      ],
      hint: 'A $u$-substitution with $u = 1 + (y\')^{2}$ works because $x^{3}$ sits outside the root.'
    }, { surf: c.toPlain() + '*x^3', a: 0, b: bU });
  });

  G('calc2.work', function (R, ctx) {
    var shape = by(ctx, R.pick(['spring', 'force']), R.pick(['spring', 'rope', 'tank', 'force']), R.pick(['tank', 'cone', 'rope', 'box']));
    if (shape === 'spring') {
      var F0 = R.pick([6, 8, 10, 12, 15, 20, 24, 30]), d0 = Q.from(R.pick(['0.1', '0.2', '0.25', '0.5'])), k = Q(F0).div(d0);
      var a = Q.from(R.pick(['0', '0', '0.1', '0.2'])), b = a.add(Q.from(R.pick(['0.1', '0.2', '0.3', '0.4', '0.5']))), W = k.mul(b.mul(b).sub(a.mul(a))).div(2);
      return done({
        q: 'A force of ' + F0 + ' N holds a spring stretched ' + dec(d0) + ' m beyond its natural length. How much work does it take to stretch it from ' + dec(a) + ' m to ' + dec(b) + ' m beyond its natural length?',
        a: { t: 'num', v: W.toPlain() }, unit: 'J',
        steps: [
          'Hooke\'s law: $F(x) = kx$. From $' + F0 + ' = k(' + dec(d0) + ')$, $k = ' + tx(k) + '$ N/m.',
          'The force changes as the spring stretches, so add up $F(x)\\,dx$ over thin pieces:',
          D('W = \\int_{' + dec(a) + '}^{' + dec(b) + '} ' + cf(k, 'x') + DX + ' = \\frac{' + tx(k) + '}{2}\\left(' + dec(b) + '^{2}' + (a.isZero() ? '' : ' - ' + dec(a) + '^{2}') + '\\right)'),
          '$W = ' + dec(W) + '$ J.'
        ],
        hint: 'First find the spring constant $k$ from the given force and stretch.'
      }, { int: k.toPlain() + '*x', a: a.toNumber(), b: b.toNumber() });
    }
    if (shape === 'force') {
      var fam = R.pick(['poly', 'inv']);
      if (fam === 'poly') {
        var c0 = R.int(1, 6), c1 = R.int(1, 5), c2 = R.pick([0, 1, 2, 3]), f = P(c0, c1, c2), a1 = R.int(0, 2), b1 = a1 + R.int(1, 3), W1 = pdef(f, a1, b1);
        return done({
          q: 'An object moves along the $x$-axis from $x = ' + a1 + '$ m to $x = ' + b1 + '$ m, pushed by a force of $F(x) = ' + ptex(f) + '$ newtons. Find the work done.',
          a: { t: 'num', v: W1.toPlain() }, unit: 'J',
          steps: ['Work for a varying force is $W = \\int_a^b F(x)\\,dx$.', D('W = \\int_{' + a1 + '}^{' + b1 + '} \\left(' + ptex(f) + '\\right)' + DX + ' = ' + pbracket(pint(f), a1, b1)), '$W = ' + evalDiff(pev(pint(f), b1), pev(pint(f), a1)) + '$ J.'],
          hint: 'Integrate the force over the distance.'
        }, { int: pplain(f), a: a1, b: b1 });
      }
      var K = R.pick([12, 24, 36, 60]), a2 = R.pick([1, 2, 3]), b2 = a2 * R.pick([2, 3, 4]), W2 = Q(K, a2).sub(Q(K, b2));
      return done({
        q: 'A force of $F(x) = \\frac{' + K + '}{x^{2}}$ newtons acts on an object as it moves from $x = ' + a2 + '$ m to $x = ' + b2 + '$ m. Find the work done.',
        a: { t: 'num', v: W2.toPlain() }, unit: 'J',
        steps: [D('W = \\int_{' + a2 + '}^{' + b2 + '} \\frac{' + K + '}{x^{2}}' + DX + ' = \\left[-\\frac{' + K + '}{x}\\right]_{' + a2 + '}^{' + b2 + '}'), '$W = ' + tx(Q(-K, b2)) + ' + ' + tx(Q(K, a2)) + ' = ' + tx(W2) + '$ J.'],
        hint: 'Integrate $F(x)$ from start to finish.'
      }, { int: K + '/x^2', a: a2, b: b2 });
    }
    if (shape === 'rope') {
      var L = R.pick([10, 12, 20, 30, 40]), w = R.pick([2, 3, 4, 5]), part = R.pick(['all', 'top', 'bucket']), W3, st, qt;
      if (part === 'all') {
        W3 = Q(w * L * L, 2);
        qt = 'A ' + L + ' m rope weighing ' + w + ' N/m hangs from the top of a building. How much work does it take to pull the whole rope up to the top?';
        st = ['Cut the rope into thin pieces. A piece $y$ meters below the top weighs $' + w + '\\,dy$ newtons and is lifted $y$ meters.', D('W = \\int_{0}^{' + L + '} ' + w + 'y' + DY + ' = ' + w + '\\cdot\\frac{' + L + '^{2}}{2}'), '$W = ' + numShow(W3) + '$ J.'];
      } else if (part === 'top') {
        var hh = L / 2; W3 = Q(w * hh * hh, 2).add(Q(w * (L - hh) * hh));
        qt = 'A ' + L + ' m rope weighing ' + w + ' N/m hangs from the top of a building. How much work does it take to pull up just the top half of the rope?';
        st = ['A piece in the top ' + hh + ' m at depth $y$ is lifted $y$ meters: $\\int_0^{' + hh + '} ' + w + 'y\\,dy = ' + numShow(Q(w * hh * hh, 2)) + '$ J.', 'The bottom ' + (L - hh) + ' m (weight $' + w * (L - hh) + '$ N) rises ' + hh + ' m as a whole: $' + w * (L - hh) + '\\cdot ' + hh + ' = ' + numShow(w * (L - hh) * hh) + '$ J.', 'Total: $W = ' + numShow(W3) + '$ J.'];
      } else {
        var B = R.pick([20, 40, 50, 100]); W3 = Q(w * L * L, 2).add(B * L);
        qt = 'A bucket weighing ' + B + ' N hangs from a ' + L + ' m rope that weighs ' + w + ' N/m. How much work does it take to pull the bucket and rope up to the top?';
        st = ['The rope: a piece at depth $y$ is lifted $y$ meters: $\\int_0^{' + L + '} ' + w + 'y\\,dy = ' + numShow(Q(w * L * L, 2)) + '$ J.', 'The bucket (' + B + ' N) is lifted the whole ' + L + ' m: $' + numShow(B * L) + '$ J.', 'Total: $W = ' + numShow(W3) + '$ J.'];
      }
      return done({ q: qt, a: { t: 'num', v: W3.toPlain() }, unit: 'J', steps: st, hint: 'Different pieces of rope travel different distances: a piece at depth $y$ travels $y$.' }, { val: W3.toNumber() });
    }
    var rho = 9800;
    if (shape === 'box') {
      var Lb = R.int(2, 6), Wb = R.int(1, 3), Hb = R.int(1, 3), Wbox = Q(rho * Lb * Wb * Hb * Hb, 2);
      return done({
        q: 'A rectangular tank is ' + Lb + ' m long, ' + Wb + ' m wide and ' + Hb + ' m deep, and full of water (weight density $9800$ N/m³). Find the work needed to pump all the water out over the top.',
        a: { t: 'num', v: Wbox.toPlain() }, unit: 'J',
        steps: ['Slice the water into horizontal layers. A layer at depth $y$ below the top has volume $' + Lb * Wb + '\\,dy$ and weight $9800\\cdot ' + Lb * Wb + '\\,dy$.', 'That layer travels $y$ meters to the top. Each layer travels a different distance.', D('W = \\int_{0}^{' + Hb + '} ' + numShow(rho * Lb * Wb) + 'y' + DY + ' = ' + numShow(rho * Lb * Wb) + '\\cdot\\frac{' + Hb + '^{2}}{2}'), '$W = ' + numShow(Wbox) + '$ J.'],
        hint: 'Find the weight of one thin layer and how far that layer travels.'
      }, { int: rho * Lb * Wb + '*x', a: 0, b: Hb });
    }
    if (shape === 'cone') {
      var Rc = R.int(1, 4), Hc = R.pick([2, 3, 4, 6]), Wc = Q(rho * Rc * Rc * Hc * Hc, 12), kr = Q(Rc, Hc);
      return done({
        q: 'A tank shaped like a cone, point down, is ' + Hc + ' m tall with a top radius of ' + Rc + ' m. It is full of water (weight density $9800$ N/m³). Find the work needed to pump the water out over the top. Give an exact answer in terms of $\\pi$.',
        a: { t: 'num', v: kPlain(Wc, 'pi') }, unit: 'J',
        steps: ['Measure $y$ up from the point. By similar triangles a layer at height $y$ has radius $' + cf(kr, 'y') + '$, so its weight is $9800\\pi\\left(' + cf(kr, 'y') + '\\right)^{2}dy$.', 'That layer travels $' + Hc + ' - y$ meters to the top.', D('W = 9800\\pi\\cdot ' + tx(kr.mul(kr)) + '\\int_{0}^{' + Hc + '} y^{2}(' + Hc + ' - y)' + DY + ' = 9800\\pi\\cdot ' + tx(kr.mul(kr)) + '\\cdot\\frac{' + Hc + '^{4}}{12}'), '$W = ' + kTex(Wc, '\\pi') + '$ J.'],
        hint: 'Write the radius of a layer at height $y$ using similar triangles, then its distance to the top.'
      }, { int: rho * Math.PI * Rc * Rc / (Hc * Hc) + '*x^2*(' + Hc + '-x)', a: 0, b: Hc });
    }
    var r0 = R.int(1, 3), H = R.int(2, 5), s = R.pick([0, 0, 1, 2]), Dp = R.pick([H, H, H - 1]);
    var integ = P(H + s, -1), I = pdef(integ, 0, Dp), Wt = I.mul(rho * r0 * r0);
    return done({
      q: 'A cylindrical tank of radius ' + r0 + ' m and height ' + H + ' m stands upright' + (Dp === H ? ', full of water' : ' with water ' + Dp + ' m deep') + ' (weight density $9800$ N/m³). Find the work needed to pump the water out ' + (s ? 'through a spout ' + s + ' m above the top' : 'over the top') + '. Give an exact answer in terms of $\\pi$.',
      a: { t: 'num', v: kPlain(Wt, 'pi') }, unit: 'J',
      steps: [
        'Measure $y$ up from the bottom. A layer at height $y$ is a thin disk with weight $9800\\cdot\\pi(' + r0 + ')^{2}\\,dy$.',
        'It must rise to ' + (s ? 'the spout at height $' + (H + s) + '$' : 'the top at height $' + H + '$') + ', a distance of $' + (H + s) + ' - y$. Layers near the bottom travel farther.',
        D('W = 9800\\pi(' + r0 * r0 + ')\\int_{0}^{' + Dp + '} (' + (H + s) + ' - y)' + DY + ' = ' + numShow(rho * r0 * r0) + '\\pi' + pbracket(pint(integ), 0, Dp, 'y')),
        '$W = ' + numShow(rho * r0 * r0) + '\\pi\\cdot ' + tp(I) + ' = ' + kTex(Wt, '\\pi') + '$ J.'
      ],
      hint: 'Each thin layer travels a different distance. Write that distance in terms of the layer\'s height $y$.'
    }, { int: rho * Math.PI * r0 * r0 + '*(' + (H + s) + '-x)', a: 0, b: Dp });
  });

  G('calc2.fluid-force', function (R, ctx) {
    var rho = 9800, shape = by(ctx, R.pick(['rect']), R.pick(['rect', 'tri']), R.pick(['tri', 'semi', 'disk']));
    if (shape === 'rect') {
      var w = R.int(1, 8), h = R.int(1, 6), d = R.int(0, 5), F = Q(rho * w).mul(Q(h * d).add(Q(h * h, 2)));
      return done({
        q: 'A rectangular plate ' + w + ' m wide and ' + h + ' m tall is submerged vertically in water (weight density $9800$ N/m³) with its top edge ' + (d ? d + ' m below the surface' : 'at the surface') + '. Find the force of the water on one side.',
        a: { t: 'num', v: F.toPlain() }, unit: 'N',
        steps: [
          'Pressure at depth $y$ is $9800y$ N/m², so it grows with depth. Cut the plate into thin horizontal strips.',
          'A strip at depth $y$ has area $' + w + '\\,dy$, so the force on it is $9800\\,y\\cdot ' + w + '\\,dy$.',
          D('F = \\int_{' + d + '}^{' + (d + h) + '} ' + numShow(rho * w) + 'y' + DY + ' = ' + numShow(rho * w) + '\\cdot\\frac{' + (d + h) + '^{2}' + (d ? ' - ' + d + '^{2}' : '') + '}{2}'),
          '$F = ' + numShow(F) + '$ N.'
        ],
        hint: 'Force on a strip = pressure at its depth × its area.'
      }, { int: rho * w + '*x', a: d, b: d + h });
    }
    if (shape === 'tri') {
      var b = R.pick([2, 3, 4, 5, 6, 8]), h2 = R.int(1, 5), up = R.coin(), F2, wid;
      if (!up) { F2 = Q(rho * b * h2 * h2, 6); wid = b + '\\left(1 - \\frac{y}{' + h2 + '}\\right)'; }
      else { F2 = Q(rho * b * h2 * h2, 3); wid = cf(Q(b, h2), 'y'); }
      return done({
        q: 'A triangular plate with a ' + b + ' m base and height ' + h2 + ' m is submerged vertically in water (weight density $9800$ N/m³), ' + (up ? 'with its point at the surface and its base ' + h2 + ' m down' : 'with its base along the surface and its point ' + h2 + ' m down') + '. Find the force on one side.',
        a: { t: 'num', v: F2.toPlain() }, unit: 'N',
        steps: [
          'By similar triangles, the width at depth $y$ is $w(y) = ' + wid + '$.',
          'Force on a strip: $9800\\,y\\cdot w(y)\\,dy$.',
          D('F = 9800\\int_{0}^{' + h2 + '} y\\cdot ' + wid + DY + ' = 9800\\cdot ' + tx(F2.div(rho))),
          '$F = ' + numShow(F2) + '$ N.'
        ],
        hint: 'Write the strip width as a function of depth using similar triangles.'
      }, { int: up ? rho * b / h2 + '*x^2' : rho * b + '*x*(1-x/' + h2 + ')', a: 0, b: h2 });
    }
    if (shape === 'semi' && R.coin()) { // straight edge level, d m below the surface
      var rs = R.int(1, 5), ds = R.int(1, 4), Fa = Q(rho * 2 * rs * rs * rs, 3), Fb = Q(rho * ds * rs * rs, 2);
      return done({
        q: 'A plate shaped like a half disk of radius ' + rs + ' m is submerged vertically in water (weight density $9800$ N/m³). Its straight edge is level, ' + ds + ' m below the surface, and the curved part hangs below it. Find the force on one side. Give an exact answer.',
        a: { t: 'num', v: ps([[Fa, ''], [Fb, 'pi']]) }, unit: 'N',
        steps: [
          'Let $y$ be depth. The plate spans depths $' + ds + '$ to $' + (ds + rs) + '$, and at depth $y$ it is $2\\sqrt{' + rs * rs + ' - (y - ' + ds + ')^{2}}$ wide.',
          D('F = 9800\\int_{' + ds + '}^{' + (ds + rs) + '} y\\cdot 2\\sqrt{' + rs * rs + ' - (y - ' + ds + ')^{2}}' + DY),
          'Write $y = (y - ' + ds + ') + ' + ds + '$. With $u = ' + rs * rs + ' - (y - ' + ds + ')^{2}$, the first part gives $\\frac{2}{3}\\cdot ' + rs * rs * rs + ' = ' + tx(Q(2 * rs * rs * rs, 3)) + '$. The second part is $' + ds + '$ times the half disk\'s area, $' + kTex(Q(rs * rs, 2), '\\pi') + '$.',
          '$F = 9800\\left(' + tx(Q(2 * rs * rs * rs, 3)) + ' + ' + kTex(Q(ds * rs * rs, 2), '\\pi') + '\\right) = ' + numShow(Fa) + ' + ' + kTex(Fb, '\\pi') + '$ N.'
        ],
        hint: 'Split the depth into (distance below the straight edge) + (depth of the straight edge).'
      }, { int: rho + '*x*2*sqrt(' + rs * rs + '-(x-' + ds + ')^2)', a: ds, b: ds + rs });
    }
    if (shape === 'semi') {
      var r0 = R.int(1, 6), F3 = Q(rho * 2 * r0 * r0 * r0, 3);
      return done({
        q: 'A plate shaped like a half disk of radius ' + r0 + ' m is submerged vertically in water (weight density $9800$ N/m³), with its straight edge along the surface. Find the force on one side.',
        a: { t: 'num', v: F3.toPlain() }, unit: 'N',
        steps: [
          'At depth $y$ the plate is $2\\sqrt{' + r0 * r0 + ' - y^{2}}$ wide.',
          D('F = 9800\\int_{0}^{' + r0 + '} y\\cdot 2\\sqrt{' + r0 * r0 + ' - y^{2}}' + DY),
          'With $u = ' + r0 * r0 + ' - y^{2}$, $du = -2y\\,dy$: $F = 9800\\left[-\\frac{2}{3}(' + r0 * r0 + ' - y^{2})^{3/2}\\right]_{0}^{' + r0 + '} = 9800\\cdot\\frac{2}{3}\\cdot ' + r0 * r0 * r0 + '$.',
          '$F = ' + numShow(F3) + '$ N.'
        ],
        hint: 'The width at depth $y$ comes from the circle $x^{2} + y^{2} = r^{2}$.'
      }, { int: rho + '*x*2*sqrt(' + r0 * r0 + '-x^2)', a: 0, b: r0 });
    }
    var r1 = R.int(1, 5), dc = r1 + R.int(0, 5), F4 = Q(rho * r1 * r1 * dc);
    return done({
      q: 'A circular window of radius ' + r1 + ' m in the side of a large aquarium has its center ' + dc + ' m below the surface. Find the force of the water (weight density $9800$ N/m³) on the window. Give an exact answer in terms of $\\pi$.',
      a: { t: 'num', v: kPlain(F4, 'pi') }, unit: 'N',
      steps: [
        'Let $y$ be depth. The window spans depths $' + (dc - r1) + '$ to $' + (dc + r1) + '$, and at depth $y$ its width is $2\\sqrt{' + r1 * r1 + ' - (y - ' + dc + ')^{2}}$.',
        D('F = 9800\\int_{' + (dc - r1) + '}^{' + (dc + r1) + '} y\\cdot 2\\sqrt{' + r1 * r1 + ' - (y - ' + dc + ')^{2}}' + DY),
        'Write $y = (y - ' + dc + ') + ' + dc + '$. The part with $(y - ' + dc + ')$ is odd about the center and integrates to 0. The rest is $' + dc + '$ times the window\'s area, $' + kTex(r1 * r1, '\\pi') + '$.',
        '$F = 9800\\cdot ' + dc + '\\cdot ' + kTex(r1 * r1, '\\pi') + ' = ' + kTex(F4, '\\pi') + '$ N.'
      ],
      hint: 'Split the depth into (distance from the center) + (depth of the center).'
    }, { int: rho + '*x*2*sqrt(' + r1 * r1 + '-(x-' + dc + ')^2)', a: dc - r1, b: dc + r1 });
  });

  G('calc2.center-of-mass', function (R, ctx) {
    var shape = by(ctx, R.pick(['points', 'under']), R.pick(['under', 'between', 'points']), R.pick(['between', 'under']));
    if (shape === 'points') {
      var ms = R.ints(3, 1, 6), xs = R.ints(3, -4, 6, true), M0 = ms[0] + ms[1] + ms[2], Mo = ms[0] * xs[0] + ms[1] * xs[1] + ms[2] * xs[2], xb = Q(Mo, M0);
      return done({
        q: 'Masses of ' + ms[0] + ' kg, ' + ms[1] + ' kg and ' + ms[2] + ' kg sit on a thin rod at $x = ' + xs[0] + '$, $x = ' + xs[1] + '$ and $x = ' + xs[2] + '$. Where is the center of mass?',
        a: { t: 'num', v: xb.toPlain() },
        steps: [
          'Moment about the origin: $M = ' + ms.map(function (m, i) { return m + T.cdot() + T.p(xs[i]); }).join(' + ') + ' = ' + Mo + '$.',
          'Total mass: $m = ' + M0 + '$.',
          '$\\bar{x} = \\frac{M}{m} = ' + tx(xb) + '$.'
        ],
        hint: 'Center of mass = (sum of mass × position) ÷ (total mass).'
      }, { val: xb.toNumber() });
    }
    var f, g, a = 0, b, desc;
    if (shape === 'under') {
      var fam = R.pick(['par', 'lin', 'dome', 'cap']);
      if (fam === 'par') { var k = R.int(1, 4); b = R.int(1, 4); f = P(0, 0, k); desc = 'under $y = ' + cf(k, 'x^{2}') + '$ from $x = 0$ to $x = ' + b + '$'; }
      else if (fam === 'lin') { var m = R.int(1, 5); b = R.int(1, 6); f = P(0, m); desc = 'in the triangle under $y = ' + cf(m, 'x') + '$ from $x = 0$ to $x = ' + b + '$'; }
      else if (fam === 'dome') { var c = R.int(2, 8); b = c; f = P(0, c, -1); desc = 'between $y = ' + c + 'x - x^{2}$ and the $x$-axis'; }
      else { var cq = R.int(1, 6); b = cq; f = P(cq * cq, 0, -1); desc = 'in the first quadrant under $y = ' + cq * cq + ' - x^{2}$'; }
      g = P(0);
    } else {
      var bk = R.pick(['lp', 'lp', 'flatp', 'flatl']);
      if (bk === 'lp') { var mm = R.int(1, 5), s = R.pick([1, 1, 2, 3]); b = mm; f = P(0, s * mm); g = P(0, 0, s); desc = 'between $y = ' + cf(s * mm, 'x') + '$ and $y = ' + cf(s, 'x^{2}') + '$'; }
      else if (bk === 'flatp') { var kf = R.int(1, 3); b = R.int(1, 4); f = P(kf * b * b); g = P(0, 0, kf); desc = 'between $y = ' + cf(kf, 'x^{2}') + '$, the line $y = ' + kf * b * b + '$ and the $y$-axis'; }
      else { var ml = R.int(1, 4); b = R.int(1, 5); f = P(ml * b); g = P(0, ml); desc = 'in the triangle between $y = ' + cf(ml, 'x') + '$, the line $y = ' + ml * b + '$ and the $y$-axis'; }
    }
    var h = psub(f, g), A = pdef(h, a, b), My = pdef(pmul(P(0, 1), h), a, b), Mx = pdef(psub(pmul(f, f), pmul(g, g)), a, b).div(2);
    var xb2 = My.div(A), yb2 = Mx.div(A), askX = by(ctx, R.coin(), false, false);
    var steps = [
      'Area: $A = \\int_{' + a + '}^{' + b + '} \\left(' + ptex(h) + '\\right)' + DX + ' = ' + tx(A) + '$.',
      'Moment about the $y$-axis: $M_y = \\int_{' + a + '}^{' + b + '} x\\left(' + ptex(h) + '\\right)' + DX + ' = ' + tx(My) + '$, so $\\bar{x} = \\frac{M_y}{A} = ' + tx(xb2) + '$.'
    ];
    if (!askX) steps.push('Moment about the $x$-axis: $M_x = \\frac{1}{2}\\int_{' + a + '}^{' + b + '}\\left(' + ptex(psub(pmul(f, f), pmul(g, g))) + '\\right)' + DX + ' = ' + tx(Mx) + '$, so $\\bar{y} = \\frac{M_x}{A} = ' + tx(yb2) + '$.');
    return done({
      q: 'A thin plate of constant density lies ' + desc + '. Find ' + (askX ? 'the $x$-coordinate $\\bar{x}$ of its centroid.' : 'its centroid $(\\bar{x}, \\bar{y})$.'),
      a: askX ? { t: 'num', v: xb2.toPlain() } : { t: 'tuple', v: [xb2.toPlain(), yb2.toPlain()] },
      steps: steps,
      hint: '$\\bar{x} = \\frac{1}{A}\\int x\\,(f - g)\\,dx$ and $\\bar{y} = \\frac{1}{A}\\int \\frac{1}{2}(f^{2} - g^{2})\\,dx$.'
    }, { centroid: [pplain(f), pplain(g), a, b] });
  });

  G('calc2.hyperbolic-functions', function (R, ctx) {
    var shape = by(ctx, R.pick(['value', 'ident', 'pick']), R.pick(['ident', 'deriv', 'value', 'integ']), R.pick(['deriv', 'integ', 'ident']));
    if (shape === 'value') {
      var a = R.pick([2, 3, 4, 5, 6, 7]), fn = R.pick(['sinh', 'cosh', 'tanh']), neg = R.chance(0.3), aq = Q(a), ia = Q(1, a), v;
      if (fn === 'sinh') v = aq.sub(ia).div(2); else if (fn === 'cosh') v = aq.add(ia).div(2); else v = Q(a * a - 1, a * a + 1);
      if (neg && fn !== 'cosh') v = v.neg();
      var arg = (neg ? '-' : '') + '\\ln ' + a, e1 = neg ? '\\frac{1}{' + a + '}' : a, e2 = neg ? a : '\\frac{1}{' + a + '}';
      return done({
        q: 'Find the exact value of $\\' + fn + '(' + arg + ')$.',
        a: { t: 'num', v: v.toPlain() },
        steps: fn === 'tanh' ? ['$\\tanh x = \\frac{e^{x} - e^{-x}}{e^{x} + e^{-x}}$. Here $e^{x} = ' + e1 + '$ and $e^{-x} = ' + e2 + '$.', '$\\tanh(' + arg + ') = \\frac{' + e1 + ' - ' + e2 + '}{' + e1 + ' + ' + e2 + '} = ' + tx(v) + '$.']
          : ['$\\' + fn + ' x = \\frac{e^{x} ' + (fn === 'sinh' ? '-' : '+') + ' e^{-x}}{2}$. Here $e^{x} = ' + e1 + '$ and $e^{-x} = ' + e2 + '$.', '$\\' + fn + '(' + arg + ') = \\frac{1}{2}\\left(' + e1 + (fn === 'sinh' ? ' - ' : ' + ') + e2 + '\\right) = ' + tx(v) + '$.'],
        hint: 'Write the definition with exponentials; $e^{\\ln a} = a$.'
      }, { val: { sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh }[fn]((neg ? -1 : 1) * Math.log(a)) });
    }
    if (shape === 'ident') {
      var tr = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [4, 3, 5], [12, 5, 13], [7, 24, 25], [15, 8, 17], [24, 7, 25]]), s = Q(tr[0], tr[1]), c = Q(tr[2], tr[1]);
      var given = R.coin(), ask = R.pick(['other', 'tanh']), ans = ask === 'tanh' ? s.div(c) : given ? c : s;
      return done({
        q: given ? 'If $\\sinh x = ' + tx(s) + '$, find $' + (ask === 'tanh' ? '\\tanh x' : '\\cosh x') + '$.' : 'If $\\cosh x = ' + tx(c) + '$ and $x > 0$, find $' + (ask === 'tanh' ? '\\tanh x' : '\\sinh x') + '$.',
        a: { t: 'num', v: ans.toPlain() },
        steps: [
          'Use $\\cosh^{2} x - \\sinh^{2} x = 1$ (a minus sign, unlike the trig identity).',
          given ? '$\\cosh^{2} x = 1 + ' + tx(s.mul(s)) + ' = ' + tx(c.mul(c)) + '$, and $\\cosh x > 0$ always, so $\\cosh x = ' + tx(c) + '$.' : '$\\sinh^{2} x = ' + tx(c.mul(c)) + ' - 1 = ' + tx(s.mul(s)) + '$, and $\\sinh x > 0$ when $x > 0$, so $\\sinh x = ' + tx(s) + '$.',
          ask === 'tanh' ? '$\\tanh x = \\frac{\\sinh x}{\\cosh x} = ' + tx(s.div(c)) + '$.' : 'Answer: $' + tx(ans) + '$.'
        ],
        hint: 'The hyperbolic identity is $\\cosh^{2} x - \\sinh^{2} x = 1$.'
      }, { val: ans.toNumber() });
    }
    if (shape === 'pick') {
      if (R.coin()) return done({
        q: 'Which identity is true for every real $x$?',
        a: mc('$\\cosh^{2} x - \\sinh^{2} x = 1$', ['$\\cosh^{2} x + \\sinh^{2} x = 1$', '$\\sinh^{2} x - \\cosh^{2} x = 1$', '$\\cosh^{2} x = 1 - \\sinh^{2} x$']),
        steps: ['$\\cosh^{2} x - \\sinh^{2} x = \\frac{(e^{x} + e^{-x})^{2} - (e^{x} - e^{-x})^{2}}{4} = \\frac{4}{4} = 1$.', 'The plus version fails already at $x = 1$: $\\cosh 1 > 1$, so $\\cosh^{2} 1$ alone is more than 1.'],
        hint: 'Expand the squares of $\\frac{e^{x} \\pm e^{-x}}{2}$.'
      }, null);
      return done({
        q: 'Which statement about derivatives is true?',
        a: mc('$\\frac{d}{dx}\\cosh x = \\sinh x$', ['$\\frac{d}{dx}\\cosh x = -\\sinh x$', '$\\frac{d}{dx}\\sinh x = -\\cosh x$', '$\\frac{d}{dx}\\cosh x = \\cosh x$']),
        steps: ['$\\frac{d}{dx}\\frac{e^{x} + e^{-x}}{2} = \\frac{e^{x} - e^{-x}}{2} = \\sinh x$.', 'Unlike $\\cos x$, there is no minus sign: $\\sinh$ and $\\cosh$ differentiate into each other.'],
        hint: 'Differentiate the exponential definition.'
      }, null);
    }
    if (shape === 'deriv') {
      var k = R.int(2, 5), b = R.int(-3, 3), form = R.pick(['chain', 'prod', 'sq']), q, v2, st, fstr;
      var inner = T.lin(k, 'x', b), innerP = k + '*x' + (b ? (b > 0 ? '+' : '') + b : '');
      if (form === 'chain') { var fn2 = R.pick(['sinh', 'cosh']), d2 = fn2 === 'sinh' ? 'cosh' : 'sinh'; fstr = fn2 + '(' + innerP + ')'; q = '\\' + fn2 + '(' + inner + ')'; v2 = k + '*' + d2 + '(' + innerP + ')'; st = ['$\\frac{d}{dx}\\' + fn2 + ' u = \\' + d2 + ' u\\cdot u\'$ (no sign change).', 'Here $u = ' + inner + '$ and $u\' = ' + k + '$, so the derivative is $' + k + '\\' + d2 + '(' + inner + ')$.']; }
      else if (form === 'prod') { var fp = R.pick(['sinh', 'cosh']), dp = fp === 'sinh' ? 'cosh' : 'sinh'; fstr = 'x*' + fp + '(' + k + '*x)'; q = 'x\\' + fp + '(' + k + 'x)'; v2 = fp + '(' + k + '*x)+' + k + '*x*' + dp + '(' + k + '*x)'; st = ['Product rule: $(x)\'\\' + fp + '(' + k + 'x) + x\\left(\\' + fp + '(' + k + 'x)\\right)\'$.', '$= \\' + fp + '(' + k + 'x) + ' + k + 'x\\' + dp + '(' + k + 'x)$.']; }
      else { fstr = 'cosh(' + k + '*x)^2'; q = '\\cosh^{2}(' + k + 'x)'; v2 = '2*' + k + '*cosh(' + k + '*x)*sinh(' + k + '*x)'; st = ['Chain rule twice: $2\\cosh(' + k + 'x)\\cdot\\sinh(' + k + 'x)\\cdot ' + k + '$.', '$= ' + 2 * k + '\\cosh(' + k + 'x)\\sinh(' + k + 'x)$, which also equals $' + k + '\\sinh(' + 2 * k + 'x)$.']; }
      return done({
        q: 'Find $\\frac{d}{dx}\\left[' + q + '\\right]$.',
        a: { t: 'expr', v: v2, vars: ['x'] },
        steps: st,
        hint: '$(\\sinh x)\' = \\cosh x$ and $(\\cosh x)\' = \\sinh x$.'
      }, { deriv: fstr });
    }
    var k2 = R.int(2, 5), form2 = R.pick(['basic', 'power', 'defn']);
    if (form2 === 'defn') {
      var a2 = R.pick([2, 3, 4, 5, 7]), fd = R.pick(['cosh', 'sinh']), val = fd === 'cosh' ? Q(a2).sub(Q(1, a2)).div(2) : Q(a2).add(Q(1, a2)).div(2).sub(1);
      return done({
        q: 'Evaluate $\\int_{0}^{\\ln ' + a2 + '} \\' + fd + ' x' + DX + '$ exactly.',
        a: { t: 'num', v: val.toPlain() },
        steps: fd === 'cosh' ? ['An antiderivative of $\\cosh x$ is $\\sinh x$, and $\\sinh 0 = 0$.', '$\\sinh(\\ln ' + a2 + ') = \\frac{1}{2}\\left(' + a2 + ' - \\frac{1}{' + a2 + '}\\right) = ' + tx(val) + '$.']
          : ['An antiderivative of $\\sinh x$ is $\\cosh x$, and $\\cosh 0 = 1$.', '$\\cosh(\\ln ' + a2 + ') - 1 = \\frac{1}{2}\\left(' + a2 + ' + \\frac{1}{' + a2 + '}\\right) - 1 = ' + tx(val) + '$.'],
        hint: 'Integrate, then use $e^{\\ln a} = a$.'
      }, { int: fd + '(x)', a: 0, b: Math.log(a2) });
    }
    if (form2 === 'basic') {
      var fnb = R.pick(['sinh', 'cosh']), ib = fnb === 'sinh' ? 'cosh' : 'sinh', cc2 = R.int(1, 4), ccT = cc2 === 1 ? '' : cc2, res = Q(cc2, k2);
      return done({
        q: 'Find $\\int ' + ccT + '\\' + fnb + '(' + k2 + 'x)' + DX + '$.',
        a: { t: 'expr', v: ps([[res, ib + '(' + k2 + '*x)']]) + '+C', vars: ['x'] },
        steps: ['$\\int \\' + fnb + ' u\\,du = \\' + ib + ' u + C$.', 'With $u = ' + k2 + 'x$, $du = ' + k2 + '\\,dx$, so the answer is $' + cf(res, '\\' + ib + '(' + k2 + 'x)') + ' + C$.'],
        hint: 'Substitute $u = ' + k2 + 'x$.'
      }, { anti: cc2 + '*' + fnb + '(' + k2 + '*x)' });
    }
    var n = R.int(1, 5), fu = R.pick(['cosh', 'sinh']), fo = fu === 'cosh' ? 'sinh' : 'cosh';
    return done({
      q: 'Find $\\int \\' + fo + ' x\\,\\' + fu + (n === 1 ? '' : '^{' + n + '}') + ' x' + DX + '$.',
      a: { t: 'expr', v: fu + '(x)^' + (n + 1) + '/' + (n + 1) + '+C', vars: ['x'] },
      steps: ['Let $u = \\' + fu + ' x$; then $du = \\' + fo + ' x\\,dx$.', '$\\int u' + (n === 1 ? '' : '^{' + n + '}') + '\\,du = \\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '} + C = \\frac{\\' + fu + '^{' + (n + 1) + '} x}{' + (n + 1) + '} + C$.'],
      hint: 'Which factor is the derivative of the other?'
    }, { anti: fo + '(x)*' + fu + '(x)^' + n });
  });

  // ================================================================ UNIT 2: TECHNIQUES OF INTEGRATION

  function eT(k, v) { v = v || 'x'; return 'e^{' + cf(k, v) + '}'; }                     // e^{kx}
  function eP(k, v) { v = v || 'x'; return 'e^(' + ps([[k, v]]) + ')'; }
  function trT(fn, k) { return Qf(k).eq(1) ? '\\' + fn + ' x' : '\\' + fn + '(' + cf(k, 'x') + ')'; }
  function trP(fn, k) { return fn + '(' + pp(k) + '*x)'; }
  function linT(a, b) { return ptex(P(b, a)); }
  function linP(a, b) { return b ? '(' + pplain(P(b, a)) + ')' : pplain(P(0, a)); }

  G('calc2.integration-by-parts', function (R, ctx) {
    var shape = by(ctx, R.pick(['xexp', 'xtrig', 'choose', 'xexp']), R.pick(['xln', 'xtrig', 'def', 'xexp']), R.pick(['twice', 'cyclic', 'xln', 'def']));
    if (shape === 'choose') {
      var kc = R.pick([2, 3, 4, 5]), nc = R.pick([2, 3, 4]), E = 'e^{' + kc + 'x}', Cs = '\\cos(' + kc + 'x)', Sn = '\\sin(' + kc + 'x)', Xn = 'x^{' + nc + '}';
      var opts = [
        { I: 'x' + E, why: 'Differentiating $x$ gives $1$, and $' + E + '$ is easy to integrate, so the new integral is just a multiple of $' + E + '$.', wr: ['$u = ' + E + '$, $dv = x\\,dx$', '$u = x' + E + '$, $dv = dx$', '$u = 1$, $dv = x' + E + '\\,dx$'], right: '$u = x$, $dv = ' + E + '\\,dx$' },
        { I: Xn + '\\ln x', why: 'You cannot easily integrate $\\ln x$, but its derivative $\\frac{1}{x}$ cancels a power of $x$. With $u = ' + Xn + '$ you would need $\\int \\ln x\\,dx$ first, and the new integral would be worse.', wr: ['$u = ' + Xn + '$, $dv = \\ln x\\,dx$', '$u = ' + Xn + '\\ln x$, $dv = dx$', '$u = \\frac{1}{x}$, $dv = x^{' + (nc + 1) + '}\\,dx$'], right: '$u = \\ln x$, $dv = ' + Xn + '\\,dx$' },
        { I: 'x' + Cs, why: 'With $u = x$ the new integral is a multiple of $\\int ' + Sn + '\\,dx$, simpler than before. With $u = ' + Cs + '$ you would get $\\int \\frac{x^{2}}{2}\\cdot ' + kc + Sn + '\\,dx$, which is worse.', wr: ['$u = ' + Cs + '$, $dv = x\\,dx$', '$u = x' + Cs + '$, $dv = dx$', '$u = ' + Sn + '$, $dv = x\\,dx$'], right: '$u = x$, $dv = ' + Cs + '\\,dx$' },
        { I: 'x\\arctan x', why: 'The derivative of $\\arctan x$ is the rational function $\\frac{1}{1 + x^{2}}$, while $\\arctan x$ itself is hard to integrate.', wr: ['$u = x$, $dv = \\arctan x\\,dx$', '$u = x\\arctan x$, $dv = dx$', '$u = \\frac{1}{1 + x^{2}}$, $dv = x\\,dx$'], right: '$u = \\arctan x$, $dv = x\\,dx$' }
      ], o = R.pick(opts);
      return done({
        q: 'For $\\int ' + o.I + '\\,dx$, which choice of $u$ and $dv$ makes integration by parts work best?',
        a: mc(o.right, o.wr),
        steps: ['Aim: the new integral $\\int v\\,du$ should be simpler than the original.', o.why, 'A useful order for choosing $u$ (first in the list wins): logs, inverse trig, algebraic (powers of $x$), trig, exponentials.'],
        hint: 'Pick $u$ so that its derivative is simpler, and $dv$ so that you can integrate it.'
      }, null);
    }
    if (shape === 'xexp') {
      var k = R.pick([1, 2, 3, 4, -1, -2, -3, Q(1, 2), Q(-1, 2), Q(1, 3)]), a = R.pick([1, 1, 2, 3, 4, 5]), b = by(ctx, 0, R.int(-4, 4), R.int(-4, 4)), kq = Qf(k);
      var c1 = Q(a).div(kq), c0 = Q(b).div(kq).sub(Q(a).div(kq.mul(kq)));
      var poly = P(c0, c1), polyT = ptex(poly), uT = linT(a, b);
      return done({
        q: 'Find $\\int ' + (b ? '(' + uT + ')' : uT) + eT(kq) + '\\,dx$.',
        a: { t: 'expr', v: eP(kq) + '*(' + pplain(poly) + ')+C', vars: ['x'] },
        steps: [
          'Let $u = ' + uT + '$ and $dv = ' + eT(kq) + '\\,dx$. Then $du = ' + (a === 1 ? '' : a + '\\,') + 'dx$ and $v = ' + cf(Q(1).div(kq), eT(kq)) + '$.',
          '$\\int u\\,dv = uv - \\int v\\,du = ' + (b ? '(' + uT + ')' : uT) + (kq.sign() < 0 ? '\\left(' + cf(Q(1).div(kq), eT(kq)) + '\\right)' : '\\cdot ' + cf(Q(1).div(kq), eT(kq))) + (kq.sign() < 0 ? ' + \\int ' + cf(Q(-a).div(kq), eT(kq)) : ' - \\int ' + cf(Q(a).div(kq), eT(kq))) + '\\,dx$.',
          'The last integral is $' + cf(Q(a).div(kq.mul(kq)), eT(kq)) + '$.',
          'So the answer is $' + eT(kq) + '\\left(' + polyT + '\\right) + C$.'
        ],
        hint: 'Let $u$ be the polynomial part, so that it disappears when you differentiate.'
      }, { anti: linP(a, b) + '*' + eP(kq) });
    }
    if (shape === 'xtrig') {
      var k2 = R.pick([1, 2, 3, 4, 5, 6]), fn = R.pick(['sin', 'cos']), a2 = R.pick([1, 1, 2, 3, 4, 5]), b2 = by(ctx, 0, R.pick([0, 0, 1, -1, 2, -2, 3]), R.int(-3, 3));
      var uT2 = linT(a2, b2), uP = linP(a2, b2), k2q = Q(k2);
      var vT = fn === 'sin' ? cf(Q(-1, k2), trT('cos', k2)) : cf(Q(1, k2), trT('sin', k2));
      var ans, ansT, st3;
      var kx = k2 === 1 ? 'x' : k2 + '*x', grp = b2 ? '(' + pplain(P(b2, a2)) + ')' : 'x', gc = b2 ? 1 : a2;
      if (fn === 'sin') { ans = ps([[Q(-gc, k2), grp + '*cos(' + kx + ')'], [Q(a2, k2 * k2), 'sin(' + kx + ')']]) + '+C'; ansT = (b2 ? '-' + (k2 === 1 ? '' : '\\frac{1}{' + k2 + '}') + '(' + uT2 + ')' : cf(Q(-a2, k2), 'x')) + trT('cos', k2) + ' + ' + cf(Q(a2, k2 * k2), trT('sin', k2)) + ' + C'; st3 = '$\\int ' + cf(Q(-a2, k2), trT('cos', k2)) + '\\,dx = ' + cf(Q(-a2, k2 * k2), trT('sin', k2)) + '$.'; }
      else { ans = ps([[Q(gc, k2), grp + '*sin(' + kx + ')'], [Q(a2, k2 * k2), 'cos(' + kx + ')']]) + '+C'; ansT = (b2 ? (k2 === 1 ? '' : '\\frac{1}{' + k2 + '}') + '(' + uT2 + ')' : cf(Q(a2, k2), 'x')) + trT('sin', k2) + ' + ' + cf(Q(a2, k2 * k2), trT('cos', k2)) + ' + C'; st3 = '$\\int ' + cf(Q(a2, k2), trT('sin', k2)) + '\\,dx = ' + cf(Q(-a2, k2 * k2), trT('cos', k2)) + '$.'; }
      return done({
        q: 'Find $\\int ' + (b2 ? '(' + uT2 + ')' : uT2) + trT(fn, k2) + '\\,dx$.',
        a: { t: 'expr', v: ans, vars: ['x'] },
        steps: [
          'Let $u = ' + uT2 + '$ and $dv = ' + trT(fn, k2) + '\\,dx$. Then $du = ' + (a2 === 1 ? '' : a2 + '\\,') + 'dx$ and $v = ' + vT + '$.',
          '$uv - \\int v\\,du$, where $\\int v\\,du = \\int ' + (a2 === 1 ? '' : a2 + '\\cdot') + '\\left(' + vT + '\\right)dx$.',
          st3,
          'Answer: $' + ansT + '$.'
        ],
        hint: 'Let $u$ be the polynomial; $dv$ is the trig part.'
      }, { anti: uP + '*' + fn + '(' + k2 + '*x)' });
    }
    if (shape === 'xln') {
      var n = R.int(0, 5), c = R.pick([1, 1, 2, 3, 4, 5, 6]), n1 = n + 1, cq = Q(c);
      var t1 = cq.div(n1), t2 = cq.div(n1 * n1), xn1 = n1 === 1 ? 'x' : 'x^{' + n1 + '}', xn = n === 0 ? '' : n === 1 ? 'x' : 'x^{' + n + '}';
      return done({
        q: 'Find $\\int ' + (c === 1 ? '' : c) + xn + '\\ln x\\,dx$.',
        a: { t: 'expr', v: ps([[t1, (n1 === 1 ? 'x' : 'x^' + n1) + '*ln(x)'], [t2.neg(), n1 === 1 ? 'x' : 'x^' + n1]]) + '+C', vars: ['x'] },
        steps: [
          'Let $u = \\ln x$ (its derivative is simpler) and $dv = ' + (c === 1 && !xn ? '1' : (c === 1 ? '' : c) + xn) + '\\,dx$. Then $du = \\frac{1}{x}\\,dx$ and $v = ' + cf(t1, xn1) + '$.',
          '$uv - \\int v\\,du = ' + cf(t1, xn1 + '\\ln x') + ' - \\int ' + cf(t1, xn1) + '\\cdot\\frac{1}{x}\\,dx = ' + cf(t1, xn1 + '\\ln x') + ' - \\int ' + cf(t1, n === 0 ? '' : xn) + (n === 0 ? '' : '') + '\\,dx$.',
          'Answer: $' + cf(t1, xn1 + '\\ln x') + ' - ' + cf(t2, xn1) + ' + C$.'
        ],
        hint: 'Choose $u = \\ln x$: it becomes $\\frac{1}{x}$ when you differentiate.'
      }, { anti: c + '*x^' + n + '*ln(x)', pts: [0.31, 0.77, 1.13, 1.71, 2.29, 2.9, 3.4, 4.1] });
    }
    if (shape === 'def') {
      var D2 = R.pick([
        ['x e^{x}', '0', '1', '1', '1', 'x*e^x', 0, 1, ['$u = x$, $dv = e^{x}dx$: $\\int x e^{x}dx = x e^{x} - e^{x}$.', '$\\left[x e^{x} - e^{x}\\right]_0^1 = (e - e) - (0 - 1) = 1$.']],
        ['x e^{x}', '0', '2', 'e^{2} + 1', 'e^2+1', 'x*e^x', 0, 2, ['$\\int x e^{x}dx = x e^{x} - e^{x} = e^{x}(x - 1)$.', '$\\left[e^{x}(x - 1)\\right]_0^2 = e^{2} - (-1) = e^{2} + 1$.']],
        ['x e^{-x}', '0', '1', '1 - \\frac{2}{e}', '1-2/e', 'x*e^(-x)', 0, 1, ['$u = x$, $dv = e^{-x}dx$, $v = -e^{-x}$: $\\int x e^{-x}dx = -x e^{-x} - e^{-x}$.', '$\\left[-e^{-x}(x + 1)\\right]_0^1 = -\\frac{2}{e} + 1$.']],
        ['x e^{2x}', '0', '1', '\\frac{e^{2} + 1}{4}', '(e^2+1)/4', 'x*e^(2*x)', 0, 1, ['$\\int x e^{2x}dx = \\frac{x}{2}e^{2x} - \\frac{1}{4}e^{2x}$.', '$\\left[e^{2x}\\left(\\frac{x}{2} - \\frac{1}{4}\\right)\\right]_0^1 = \\frac{e^{2}}{4} + \\frac{1}{4}$.']],
        ['x\\sin x', '0', '\\pi', '\\pi', 'pi', 'x*sin(x)', 0, Math.PI, ['$\\int x\\sin x\\,dx = -x\\cos x + \\sin x$.', 'At $\\pi$: $-\\pi\\cos\\pi + \\sin\\pi = \\pi$. At $0$ the antiderivative is $0$.']],
        ['x\\cos x', '0', '\\frac{\\pi}{2}', '\\frac{\\pi}{2} - 1', 'pi/2-1', 'x*cos(x)', 0, Math.PI / 2, ['$\\int x\\cos x\\,dx = x\\sin x + \\cos x$.', '$\\left[x\\sin x + \\cos x\\right]_0^{\\pi/2} = \\frac{\\pi}{2} - 1$.']],
        ['x\\cos x', '0', '\\pi', '-2', '-2', 'x*cos(x)', 0, Math.PI, ['$\\int x\\cos x\\,dx = x\\sin x + \\cos x$.', '$\\left[x\\sin x + \\cos x\\right]_0^{\\pi} = (0 - 1) - (0 + 1) = -2$.']],
        ['\\ln x', '1', 'e', '1', '1', 'ln(x)', 1, Math.E, ['$u = \\ln x$, $dv = dx$: $\\int \\ln x\\,dx = x\\ln x - x$.', '$\\left[x\\ln x - x\\right]_1^{e} = (e - e) - (0 - 1) = 1$.']],
        ['x\\ln x', '1', 'e', '\\frac{e^{2} + 1}{4}', '(e^2+1)/4', 'x*ln(x)', 1, Math.E, ['$\\int x\\ln x\\,dx = \\frac{x^{2}}{2}\\ln x - \\frac{x^{2}}{4}$.', '$\\left[\\frac{x^{2}}{2}\\ln x - \\frac{x^{2}}{4}\\right]_1^{e} = \\frac{e^{2}}{2} - \\frac{e^{2}}{4} + \\frac{1}{4} = \\frac{e^{2} + 1}{4}$.']],
        ['x^{2}\\ln x', '1', 'e', '\\frac{2e^{3} + 1}{9}', '(2*e^3+1)/9', 'x^2*ln(x)', 1, Math.E, ['$\\int x^{2}\\ln x\\,dx = \\frac{x^{3}}{3}\\ln x - \\frac{x^{3}}{9}$.', '$\\left[\\ldots\\right]_1^{e} = \\frac{e^{3}}{3} - \\frac{e^{3}}{9} + \\frac{1}{9} = \\frac{2e^{3} + 1}{9}$.']],
        ['\\ln x', '1', 'e^{2}', 'e^{2} + 1', 'e^2+1', 'ln(x)', 1, Math.E * Math.E, ['$\\int \\ln x\\,dx = x\\ln x - x$.', '$\\left[x\\ln x - x\\right]_1^{e^{2}} = (2e^{2} - e^{2}) - (0 - 1) = e^{2} + 1$.']]
      ]);
      return done({
        q: 'Evaluate $\\int_{' + D2[1] + '}^{' + D2[2] + '} ' + D2[0] + '\\,dx$ exactly.',
        a: { t: 'num', v: D2[4] },
        steps: D2[8].concat(['Answer: $' + D2[3] + '$.']),
        hint: 'Find the antiderivative by parts first, then evaluate at both limits.'
      }, { int: D2[5], a: D2[6], b: D2[7] });
    }
    if (shape === 'twice') {
      var fam = R.pick(['exp', 'sin', 'cos']), k3 = fam === 'exp' ? R.pick([1, 2, 3, 4, -1, -2, -3]) : R.pick([1, 2, 3, 4, 5]), kq3 = Q(k3), ans3, ansT3, st;
      if (fam === 'exp') {
        var cA = Q(1).div(kq3), cB = Q(-2).div(kq3.pow(2)), cC = Q(2).div(kq3.pow(3)), polyx = P(cC, cB, cA);
        ans3 = eP(kq3) + '*(' + pplain(polyx) + ')+C'; ansT3 = eT(kq3) + '\\left(' + ptex(polyx) + '\\right) + C';
        st = ['First: $u = x^{2}$, $dv = ' + eT(kq3) + 'dx$, so $\\int x^{2}' + eT(kq3) + 'dx = ' + cf(cA, 'x^{2}' + eT(kq3)) + ' - \\int ' + cf(Q(2).div(kq3), 'x' + eT(kq3)) + 'dx$.', 'Second: $u = x$ again: $\\int x' + eT(kq3) + 'dx = ' + eT(kq3) + '\\left(' + ptex(P(Q(-1).div(kq3.pow(2)), cA)) + '\\right)$.', 'Combine: $' + ansT3 + '$.'];
      } else if (fam === 'sin') {
        // ∫x^2 sin(kx) = -x^2 cos/k + 2x sin/k^2 + 2 cos/k^3
        var kx3 = k3 === 1 ? 'x' : k3 + '*x'; ans3 = ps([[Q(-1, k3), 'x^2*cos(' + kx3 + ')'], [Q(2, k3 * k3), 'x*sin(' + kx3 + ')'], [Q(2, k3 * k3 * k3), 'cos(' + kx3 + ')']]) + '+C';
        ansT3 = cf(Q(-1, k3), 'x^{2}' + trT('cos', k3)) + ' + ' + cf(Q(2, k3 * k3), 'x' + trT('sin', k3)) + T.signed(Q(2, k3 * k3 * k3).toTex()).replace(/^ /, ' ') + trT('cos', k3) + ' + C';
        st = ['First: $u = x^{2}$, $dv = ' + trT('sin', k3) + 'dx$, $v = ' + cf(Q(-1, k3), trT('cos', k3)) + '$: the result is $' + cf(Q(-1, k3), 'x^{2}' + trT('cos', k3)) + ' + \\int ' + cf(Q(2, k3), 'x' + trT('cos', k3)) + 'dx$.', 'Second: by parts with $u = x$: $\\int x' + trT('cos', k3) + 'dx = ' + cf(Q(1, k3), 'x' + trT('sin', k3)) + ' + ' + cf(Q(1, k3 * k3), trT('cos', k3)) + '$.', 'Combine: $' + ansT3 + '$.'];
      } else {
        // ∫x^2 cos(kx) = x^2 sin/k + 2x cos/k^2 - 2 sin/k^3
        var kx4 = k3 === 1 ? 'x' : k3 + '*x'; ans3 = ps([[Q(1, k3), 'x^2*sin(' + kx4 + ')'], [Q(2, k3 * k3), 'x*cos(' + kx4 + ')'], [Q(-2, k3 * k3 * k3), 'sin(' + kx4 + ')']]) + '+C';
        ansT3 = cf(Q(1, k3), 'x^{2}' + trT('sin', k3)) + ' + ' + cf(Q(2, k3 * k3), 'x' + trT('cos', k3)) + T.signed(Q(-2, k3 * k3 * k3).toTex()) + trT('sin', k3) + ' + C';
        st = ['First: $u = x^{2}$, $dv = ' + trT('cos', k3) + 'dx$, $v = ' + cf(Q(1, k3), trT('sin', k3)) + '$: the result is $' + cf(Q(1, k3), 'x^{2}' + trT('sin', k3)) + ' - \\int ' + cf(Q(2, k3), 'x' + trT('sin', k3)) + 'dx$.', 'Second: by parts with $u = x$: $\\int x' + trT('sin', k3) + 'dx = ' + cf(Q(-1, k3), 'x' + trT('cos', k3)) + ' + ' + cf(Q(1, k3 * k3), trT('sin', k3)) + '$.', 'Combine: $' + ansT3 + '$.'];
      }
      return done({
        q: 'Find $\\int x^{2}' + (fam === 'exp' ? eT(kq3) : trT(fam, k3)) + '\\,dx$.',
        a: { t: 'expr', v: ans3, vars: ['x'] },
        steps: st,
        hint: 'Use parts twice, with $u = x^{2}$ and then $u = x$.'
      }, { anti: 'x^2*' + (fam === 'exp' ? eP(kq3) : fam + '(' + k3 + '*x)') });
    }
    // cyclic: ∫ e^{ax} sin(bx) or cos(bx)
    var a4 = R.pick([1, 2, 3, 4, -1, -2, -3]), b4 = R.pick([1, 2, 3, 4, 5]), fn4 = R.pick(['sin', 'cos']), den = a4 * a4 + b4 * b4;
    var bx = b4 === 1 ? 'x' : b4 + '*x', inner = fn4 === 'sin' ? ps([[a4, 'sin(' + bx + ')'], [-b4, 'cos(' + bx + ')']]) : ps([[a4, 'cos(' + bx + ')'], [b4, 'sin(' + bx + ')']]);
    var innerT = fn4 === 'sin' ? T.terms([[a4, trT('sin', b4)], [-b4, trT('cos', b4)]]) : T.terms([[a4, trT('cos', b4)], [b4, trT('sin', b4)]]);
    return done({
      q: 'Find $\\int ' + eT(a4) + trT(fn4, b4) + '\\,dx$.',
      a: { t: 'expr', v: eP(a4) + '*(' + inner + ')/' + den + '+C', vars: ['x'] },
      steps: [
        'Call the integral $I$. Use parts with $u = ' + trT(fn4, b4) + '$, $dv = ' + eT(a4) + 'dx$, then parts again on the new integral (again with the trig factor as $u$).',
        'After the second step the original integral $I$ comes back, multiplied by $-' + tx(Q(b4 * b4, a4 * a4)) + '$.',
        'So $\\left(1 + ' + tx(Q(b4 * b4, a4 * a4)) + '\\right)I = ' + (a4 * a4 === 1 ? '' : tx(Q(1, a4 * a4))) + eT(a4) + '\\left(' + innerT + '\\right)$; solve for $I$.',
        'Answer: $\\frac{' + eT(a4) + '}{' + den + '}\\left(' + innerT + '\\right) + C$.'
      ],
      hint: 'Integrate by parts twice. When $I$ reappears, solve for it like an unknown.'
    }, { anti: eP(a4) + '*' + fn4 + '(' + b4 + '*x)' });
  });

  G('calc2.trig-integrals', function (R, ctx) {
    var shape = by(ctx, R.pick(['odd', 'sq', 'sectan']), R.pick(['odd', 'sectan', 'def', 'sq']), R.pick(['odd5', 'prod', 'odd5', 'prod', 'def', 'tansec']));
    if (shape === 'odd' || shape === 'odd5') {
      var oddFn = R.pick(['sin', 'cos']), other = oddFn === 'sin' ? 'cos' : 'sin', m = shape === 'odd5' ? 5 : 3, n = R.int(0, 4), mult = R.pick([1, 1, 2, 3, 4, 5, 6]);
      // ∫ odd^m other^n: keep one odd factor, rest (1 - u^2)^k with u = other
      var kk = (m - 1) / 2, base = kk === 1 ? P(1, 0, -1) : P(1, 0, -2, 0, 1);
      var shifted = []; for (var i = 0; i < n; i++) shifted.push(Q(0)); shifted = shifted.concat(base); // u^n (1-u^2)^k
      shifted = pscale(shifted, mult);
      var Fu = pint(shifted), sign = oddFn === 'sin' ? -1 : 1, Fs = pscale(Fu, sign);
      var terms = [], plain = [];
      Fs.forEach(function (cq, j) { if (!cq.isZero()) { terms.push([cq, '\\' + other + (j === 1 ? '' : '^{' + j + '}') + ' x']); plain.push([cq, other + '(x)' + (j === 1 ? '' : '^' + j)]); } });
      var otherPow = n === 0 ? '' : '\\' + other + (n === 1 ? '' : '^{' + n + '}') + ' x';
      return done({
        q: 'Find $\\int ' + (mult === 1 ? '' : mult) + '\\' + oddFn + '^{' + m + '} x' + (otherPow ? '\\,' + otherPow : '') + '\\,dx$.',
        a: { t: 'expr', v: ps(plain.slice().reverse()) + '+C', vars: ['x'] },
        steps: [
          'The power of $\\' + oddFn + '$ is odd. Save one factor of $\\' + oddFn + ' x$ and turn the rest into $\\' + other + '$: $\\' + oddFn + '^{' + (m - 1) + '} x = (1 - \\' + other + '^{2} x)' + (kk === 1 ? '' : '^{' + kk + '}') + '$.',
          'Let $u = \\' + other + ' x$, so $du = ' + (oddFn === 'sin' ? '-\\sin x' : '\\cos x') + '\\,dx$. The integral becomes $' + (sign < 0 ? '-' : '') + '\\int \\left(' + ptex(shifted, 'u') + '\\right)du$' + (n === 0 && mult === 1 ? '' : ' (after multiplying out)') + '.',
          'Integrate: $' + (sign < 0 ? '-\\left(' + ptex(Fu, 'u') + '\\right)' : ptex(Fu, 'u')) + ' + C$.',
          'Put $u = \\' + other + ' x$ back: $' + T.terms(terms) + ' + C$.'
        ],
        hint: 'Peel off one factor of the odd power for $du$, and use $\\sin^{2} x + \\cos^{2} x = 1$ on the rest.'
      }, { anti: mult + '*' + oddFn + '(x)^' + m + '*' + other + '(x)^' + n });
    }
    if (shape === 'sq') {
      var fn = R.pick(['sin', 'cos']), k = R.int(1, 6), c = R.pick([1, 1, 2, 3, 4, 6, 8]);
      var s2 = Q(c, 4 * k), sg = fn === 'sin' ? -1 : 1;
      return done({
        q: 'Find $\\int ' + (c === 1 ? '' : c) + '\\' + fn + '^{2}' + (k === 1 ? ' x' : '(' + k + 'x)') + '\\,dx$.',
        a: { t: 'expr', v: ps([[Q(c, 2), 'x'], [s2.mul(sg), 'sin(' + 2 * k + '*x)']]) + '+C', vars: ['x'] },
        steps: [
          'Even powers need the power-reducing identity: $\\' + fn + '^{2}\\theta = \\frac{1 ' + (sg < 0 ? '-' : '+') + ' \\cos 2\\theta}{2}$.',
          'So the integrand is $' + (c === 1 ? '' : c + '\\cdot') + '\\frac{1 ' + (sg < 0 ? '-' : '+') + ' \\cos(' + 2 * k + 'x)}{2}$.',
          'Integrate: $' + cf(Q(c, 2), 'x') + (sg < 0 ? ' - ' : ' + ') + cf(s2, '\\sin(' + 2 * k + 'x)') + ' + C$.'
        ],
        hint: 'Use $\\sin^{2}\\theta = \\frac{1 - \\cos 2\\theta}{2}$ or $\\cos^{2}\\theta = \\frac{1 + \\cos 2\\theta}{2}$.'
      }, { anti: c + '*' + fn + '(' + k + '*x)^2' });
    }
    if (shape === 'sectan') {
      var n2 = R.int(1, 7), which = R.pick(['tan', 'sec']), mt = R.pick([1, 1, 2, 3, 4, 5, 6, 8]), mtT = mt === 1 ? '' : mt;
      if (which === 'tan') return done({
        q: 'Find $\\int ' + mtT + '\\tan' + (n2 === 1 ? '' : '^{' + n2 + '}') + ' x\\,\\sec^{2} x\\,dx$.',
        a: { t: 'expr', v: ps([[Q(mt, n2 + 1), 'tan(x)^' + (n2 + 1)]]) + '+C', vars: ['x'] },
        steps: ['$\\sec^{2} x$ is the derivative of $\\tan x$. Let $u = \\tan x$, $du = \\sec^{2} x\\,dx$.', '$\\int ' + mtT + 'u' + (n2 === 1 ? '' : '^{' + n2 + '}') + '\\,du = ' + cf(Q(mt, n2 + 1), 'u^{' + (n2 + 1) + '}') + ' + C = ' + cf(Q(mt, n2 + 1), '\\tan^{' + (n2 + 1) + '} x') + ' + C$.'],
        hint: 'Which factor is the derivative of the other?'
      }, { anti: mt + '*tan(x)^' + n2 + '*sec(x)^2', pts: [0.31, 0.77, 1.13, -0.43, 0.05, -1.37, 2.29, 2.9] });
      return done({
        q: 'Find $\\int ' + mtT + '\\sec' + (n2 === 1 ? '' : '^{' + n2 + '}') + ' x\\,\\tan x\\,dx$.',
        a: { t: 'expr', v: ps([[Q(mt, n2), n2 === 1 ? 'sec(x)' : 'sec(x)^' + n2]]) + '+C', vars: ['x'] },
        steps: [n2 === 1 ? '$\\sec x\\tan x$ is exactly the derivative of $\\sec x$.' : 'Write the integrand as ' + (mt === 1 ? '' : '$' + mt + '$ times ') + '$\\sec' + (n2 === 2 ? '' : '^{' + (n2 - 1) + '}') + ' x\\cdot(\\sec x\\tan x)$; $\\sec x\\tan x$ is the derivative of $\\sec x$.', 'Let $u = \\sec x$: $\\int ' + (n2 === 1 ? mt : mtT + 'u' + (n2 - 1 > 1 ? '^{' + (n2 - 1) + '}' : '')) + '\\,du = ' + cf(Q(mt, n2), n2 === 1 ? 'u' : 'u^{' + n2 + '}') + ' + C = ' + cf(Q(mt, n2), n2 === 1 ? '\\sec x' : '\\sec^{' + n2 + '} x') + ' + C$.'],
        hint: 'The derivative of $\\sec x$ is $\\sec x\\tan x$.'
      }, { anti: mt + '*sec(x)^' + n2 + '*tan(x)', pts: [0.31, 0.77, 1.13, -0.43, 0.05, -1.37, 2.29, 2.9] });
    }
    if (shape === 'tansec') {
      var tf = R.pick(['tan2k', 'tan2k', 'tan2', 'tan3sec', 'tan3']);
      if (tf === 'tan2k') {
        var tk = R.int(1, 4), tc = R.pick([1, 2, 3, 4, 5, 6]), tcT = tc === 1 ? '' : tc, tkx = tk === 1 ? 'x' : tk + '*x';
        if (tk === 1 && tc === 1) tk = 2, tkx = '2*x';
        return done({
          q: 'Find $\\int ' + tcT + trT('tan', tk).replace('\\tan', '\\tan^{2}') + '\\,dx$.',
          a: { t: 'expr', v: ps([[Q(tc, tk), 'tan(' + tkx + ')'], [Q(-tc), 'x']]) + '+C', vars: ['x'] },
          steps: ['Use $\\tan^{2}\\theta = \\sec^{2}\\theta - 1$.', '$\\int ' + tcT + '\\left(' + trT('sec', tk).replace('\\sec', '\\sec^{2}') + ' - 1\\right)\\,dx = ' + T.terms([[Q(tc, tk), trT('tan', tk)], [Q(-tc), 'x']]) + ' + C$' + (tk === 1 ? '.' : ', since the antiderivative of $' + trT('sec', tk).replace('\\sec', '\\sec^{2}') + '$ is $\\frac{1}{' + tk + '}' + trT('tan', tk) + '$.')],
          hint: 'Rewrite $\\tan^{2}$ with the identity $1 + \\tan^{2}\\theta = \\sec^{2}\\theta$.'
        }, { anti: tc + '*tan(' + tkx + ')^2', pts: [0.31, 0.27, 0.13, -0.23, 0.05, -0.17] });
      }
      if (tf === 'tan2') return done({ q: 'Find $\\int \\tan^{2} x\\,dx$.', a: { t: 'expr', v: 'tan(x)-x+C', vars: ['x'] }, steps: ['Use $\\tan^{2} x = \\sec^{2} x - 1$.', '$\\int (\\sec^{2} x - 1)\\,dx = \\tan x - x + C$.'], hint: 'Rewrite $\\tan^{2} x$ with the identity $1 + \\tan^{2} x = \\sec^{2} x$.' }, { anti: 'tan(x)^2', pts: [0.31, 0.77, 1.13, -0.43, 0.05, -1.37, 2.29, 2.9] });
      if (tf === 'tan3sec') return done({ q: 'Find $\\int \\tan^{3} x\\,\\sec x\\,dx$.', a: { t: 'expr', v: 'sec(x)^3/3-sec(x)+C', vars: ['x'] }, steps: ['Save $\\sec x\\tan x$ for $du$ and write $\\tan^{2} x = \\sec^{2} x - 1$.', 'With $u = \\sec x$: $\\int (u^{2} - 1)\\,du = \\frac{u^{3}}{3} - u + C$.', 'Answer: $\\frac{\\sec^{3} x}{3} - \\sec x + C$.'], hint: 'An odd power of tangent: save $\\sec x\\tan x\\,dx$ and convert the rest to secants.' }, { anti: 'tan(x)^3*sec(x)', pts: [0.31, 0.77, 1.13, -0.43, 0.05, -1.37, 2.29, 2.9] });
      return done({ q: 'Find $\\int \\tan^{3} x\\,dx$.', a: { t: 'expr', v: 'tan(x)^2/2+ln(abs(cos(x)))+C', vars: ['x'] }, steps: ['Write $\\tan^{3} x = \\tan x(\\sec^{2} x - 1) = \\tan x\\sec^{2} x - \\tan x$.', '$\\int \\tan x\\sec^{2} x\\,dx = \\frac{\\tan^{2} x}{2}$ (let $u = \\tan x$).', '$\\int \\tan x\\,dx = -\\ln|\\cos x|$.', 'Answer: $\\frac{\\tan^{2} x}{2} + \\ln|\\cos x| + C$ (equivalently $\\frac{\\tan^{2} x}{2} - \\ln|\\sec x| + C$).'], hint: 'Split off $\\tan x\\cdot\\tan^{2} x$ and use $\\tan^{2} x = \\sec^{2} x - 1$.' }, { anti: 'tan(x)^3', pts: [0.31, 0.77, 1.13, -0.43, 0.05, -1.37, 2.29, 2.9] });
    }
    if (shape === 'prod') {
      var a = R.int(2, 7), b = R.intNot(1, 6, a), f1 = R.pick(['sin', 'cos']), s1 = a + b, d1 = a - b, ad = Math.abs(d1), adx = ad === 1 ? 'x' : ad + '*x', adT = ad === 1 ? ' x' : '(' + ad + 'x)';
      // sin(ax)cos(bx) = [sin((a+b)x) + sin((a-b)x)]/2 ; cos(ax)cos(bx) = [cos((a-b)x) + cos((a+b)x)]/2
      var ans, ansT, idT;
      if (f1 === 'sin') { ans = ps([[Q(-1, 2 * s1), 'cos(' + s1 + '*x)'], [Q(-1, 2 * d1), 'cos(' + adx + ')']]) + '+C'; ansT = T.terms([[Q(-1, 2 * s1), '\\cos(' + s1 + 'x)'], [Q(-1, 2 * d1), '\\cos' + adT]]) + ' + C'; idT = '\\sin A\\cos B = \\frac{1}{2}\\left[\\sin(A + B) + \\sin(A - B)\\right]'; }
      else { ans = ps([[Q(1, 2 * s1), 'sin(' + s1 + '*x)'], [Q(1, 2 * ad), 'sin(' + adx + ')']]) + '+C'; ansT = T.terms([[Q(1, 2 * s1), '\\sin(' + s1 + 'x)'], [Q(1, 2 * ad), '\\sin' + adT]]) + ' + C'; idT = '\\cos A\\cos B = \\frac{1}{2}\\left[\\cos(A + B) + \\cos(A - B)\\right]'; }
      return done({
        q: 'Find $\\int \\' + f1 + '(' + a + 'x)' + trT('cos', b) + '\\,dx$.',
        a: { t: 'expr', v: ans, vars: ['x'] },
        steps: ['Use the product-to-sum identity $' + idT + '$.', 'The integrand becomes $\\frac{1}{2}\\left[\\' + f1 + '(' + s1 + 'x) + \\' + f1 + '(' + cf(d1, 'x') + ')\\right]$' + (d1 < 0 ? ', and $\\' + f1 + '(' + cf(d1, 'x') + ') = ' + (f1 === 'sin' ? '-\\sin' : '\\cos') + adT + '$' : '') + '.', 'Integrate each term: $' + ansT + '$.'],
        hint: 'Turn the product into a sum with a product-to-sum identity.'
      }, { anti: f1 + '(' + a + '*x)*cos(' + b + '*x)' });
    }
    var Dd = R.pick([
      ['\\sin^{2} x', '0', '\\pi', '\\frac{\\pi}{2}', 'pi/2', 'sin(x)^2', 0, Math.PI, '$\\sin^{2} x = \\frac{1 - \\cos 2x}{2}$; integrate to $\\frac{x}{2} - \\frac{\\sin 2x}{4}$.'],
      ['\\cos^{2} x', '0', '\\frac{\\pi}{2}', '\\frac{\\pi}{4}', 'pi/4', 'cos(x)^2', 0, Math.PI / 2, '$\\cos^{2} x = \\frac{1 + \\cos 2x}{2}$; integrate to $\\frac{x}{2} + \\frac{\\sin 2x}{4}$.'],
      ['\\sin^{3} x', '0', '\\frac{\\pi}{2}', '\\frac{2}{3}', '2/3', 'sin(x)^3', 0, Math.PI / 2, 'With $u = \\cos x$: $\\int \\sin^{3} x\\,dx = -\\cos x + \\frac{\\cos^{3} x}{3}$; at the limits: $0 - \\left(-1 + \\frac{1}{3}\\right) = \\frac{2}{3}$.'],
      ['\\cos^{3} x', '0', '\\frac{\\pi}{2}', '\\frac{2}{3}', '2/3', 'cos(x)^3', 0, Math.PI / 2, 'With $u = \\sin x$: $\\int \\cos^{3} x\\,dx = \\sin x - \\frac{\\sin^{3} x}{3}$; at the limits: $1 - \\frac{1}{3} = \\frac{2}{3}$.'],
      ['\\sin^{2} x\\cos^{2} x', '0', '\\frac{\\pi}{2}', '\\frac{\\pi}{16}', 'pi/16', 'sin(x)^2*cos(x)^2', 0, Math.PI / 2, '$\\sin^{2} x\\cos^{2} x = \\frac{\\sin^{2} 2x}{4} = \\frac{1 - \\cos 4x}{8}$; integrate to $\\frac{x}{8} - \\frac{\\sin 4x}{32}$.'],
      ['\\tan^{2} x', '0', '\\frac{\\pi}{4}', '1 - \\frac{\\pi}{4}', '1-pi/4', 'tan(x)^2', 0, Math.PI / 4, '$\\tan^{2} x = \\sec^{2} x - 1$; integrate to $\\tan x - x$.'],
      ['\\sin^{2} x', '0', '2\\pi', '\\pi', 'pi', 'sin(x)^2', 0, 2 * Math.PI, '$\\sin^{2} x = \\frac{1 - \\cos 2x}{2}$; over a whole period the cosine part adds to 0.'],
      ['\\sin x\\cos^{2} x', '0', '\\pi', '\\frac{2}{3}', '2/3', 'sin(x)*cos(x)^2', 0, Math.PI, 'With $u = \\cos x$: $-\\frac{\\cos^{3} x}{3}$, so the value is $\\frac{1}{3} - \\left(-\\frac{1}{3}\\right) = \\frac{2}{3}$.']
    ]);
    return done({
      q: 'Evaluate $\\int_{' + Dd[1] + '}^{' + Dd[2] + '} ' + Dd[0] + '\\,dx$.',
      a: { t: 'num', v: Dd[4] },
      steps: [Dd[8], 'Evaluate between the limits: $' + Dd[3] + '$.'],
      hint: 'Odd powers: substitute. Even powers: use a power-reducing identity.'
    }, { int: Dd[5], a: Dd[6], b: Dd[7] });
  });

  G('calc2.trig-substitution', function (R, ctx) {
    var shape = by(ctx, R.pick(['which', 'back', 'circle']), R.pick(['back', 'circle', 'indef', 'which']), R.pick(['indef', 'indef', 'circle']));
    var a = R.int(2, 9), a2 = a * a;
    if (shape === 'which') {
      var kind = R.pick(['sin', 'tan', 'sec']), cc = R.pick([1, 1, 2, 3]), c2 = cc * cc;
      var rad = kind === 'sin' ? a2 + ' - ' + (c2 === 1 ? '' : c2) + 'x^{2}' : kind === 'tan' ? (c2 === 1 ? '' : c2) + 'x^{2} + ' + a2 : (c2 === 1 ? '' : c2) + 'x^{2} - ' + a2;
      var co = tx(Q(a, cc)); if (co === '1') co = ''; // x = sin θ, not x = 1 sin θ
      var opts = { sin: 'x = ' + co + '\\sin\\theta', tan: 'x = ' + co + '\\tan\\theta', sec: 'x = ' + co + '\\sec\\theta' };
      var idT = { sin: '1 - \\sin^{2}\\theta = \\cos^{2}\\theta', tan: '\\tan^{2}\\theta + 1 = \\sec^{2}\\theta', sec: '\\sec^{2}\\theta - 1 = \\tan^{2}\\theta' }[kind];
      var wr = ['sin', 'tan', 'sec'].filter(function (s) { return s !== kind; }).map(function (s) { return '$' + opts[s] + '$'; }).concat(['$u = ' + rad + '$']);
      return done({
        q: 'Which substitution turns $\\sqrt{' + rad + '}$ into a single trig function times a constant?',
        a: mc('$' + opts[kind] + '$', wr),
        steps: ['Match the root to a Pythagorean identity: $' + idT + '$.', 'With $' + opts[kind] + '$, $' + (c2 === 1 ? '' : c2) + 'x^{2} = ' + a2 + '\\' + kind + '^{2}\\theta$, and the root becomes $' + a + '\\' + { sin: 'cos', tan: 'sec', sec: 'tan' }[kind] + '\\theta$ (for the usual range of $\\theta$).', 'A plain $u$-substitution needs an extra factor of $x$ outside the root, which is not there.'],
        hint: '$a^{2} - x^{2}$: sine. $a^{2} + x^{2}$: tangent. $x^{2} - a^{2}$: secant.'
      }, null);
    }
    if (shape === 'back') {
      var kind2 = R.pick(['sin', 'tan', 'sec']), ask, ans, sides, st;
      if (kind2 === 'sin') { sides = 'opposite $x$, hypotenuse $' + a + '$, adjacent $\\sqrt{' + a2 + ' - x^{2}}$'; ask = R.pick(['cos', 'tan', 'sec', 'cot']); ans = { cos: ['sqrt(' + a2 + '-x^2)/' + a, '\\frac{\\sqrt{' + a2 + ' - x^{2}}}{' + a + '}'], tan: ['x/sqrt(' + a2 + '-x^2)', '\\frac{x}{\\sqrt{' + a2 + ' - x^{2}}}'], sec: [a + '/sqrt(' + a2 + '-x^2)', '\\frac{' + a + '}{\\sqrt{' + a2 + ' - x^{2}}}'], cot: ['sqrt(' + a2 + '-x^2)/x', '\\frac{\\sqrt{' + a2 + ' - x^{2}}}{x}'] }[ask]; }
      else if (kind2 === 'tan') { sides = 'opposite $x$, adjacent $' + a + '$, hypotenuse $\\sqrt{x^{2} + ' + a2 + '}$'; ask = R.pick(['sin', 'cos', 'sec']); ans = { sin: ['x/sqrt(x^2+' + a2 + ')', '\\frac{x}{\\sqrt{x^{2} + ' + a2 + '}}'], cos: [a + '/sqrt(x^2+' + a2 + ')', '\\frac{' + a + '}{\\sqrt{x^{2} + ' + a2 + '}}'], sec: ['sqrt(x^2+' + a2 + ')/' + a, '\\frac{\\sqrt{x^{2} + ' + a2 + '}}{' + a + '}'] }[ask]; }
      else { sides = 'hypotenuse $x$, adjacent $' + a + '$, opposite $\\sqrt{x^{2} - ' + a2 + '}$'; ask = R.pick(['tan', 'sin', 'cos']); ans = { tan: ['sqrt(x^2-' + a2 + ')/' + a, '\\frac{\\sqrt{x^{2} - ' + a2 + '}}{' + a + '}'], sin: ['sqrt(x^2-' + a2 + ')/x', '\\frac{\\sqrt{x^{2} - ' + a2 + '}}{x}'], cos: [a + '/x', '\\frac{' + a + '}{x}'] }[ask]; }
      var a1 = a === 1 ? '' : a, given = kind2 === 'sin' ? 'x = ' + a1 + '\\sin\\theta' : kind2 === 'tan' ? 'x = ' + a1 + '\\tan\\theta' : 'x = ' + a1 + '\\sec\\theta';
      var rng = kind2 === 'sin' ? '-\\frac{\\pi}{2} < \\theta < \\frac{\\pi}{2}' : kind2 === 'tan' ? '-\\frac{\\pi}{2} < \\theta < \\frac{\\pi}{2}' : '0 \\le \\theta < \\frac{\\pi}{2}';
      return done({
        q: 'After the substitution $' + given + '$ (with $' + rng + '$), write $\\' + ask + '\\theta$ in terms of $x$.',
        a: { t: 'expr', v: ans[0], vars: ['x'] },
        steps: [
          'From $' + given + '$, $\\' + kind2 + '\\theta = ' + (kind2 === 'sec' ? '\\frac{x}{' + a + '}' : '\\frac{x}{' + a + '}') + '$. Draw a right triangle that has this ratio' + (kind2 === 'sin' ? ' (opposite over hypotenuse)' : kind2 === 'tan' ? ' (opposite over adjacent)' : ' (hypotenuse over adjacent)') + '.',
          'Its sides: ' + sides + ' (the third side comes from the Pythagorean theorem).',
          'Read off $\\' + ask + '\\theta = ' + ans[1] + '$.'
        ],
        hint: 'Draw the reference triangle from $\\' + kind2 + '\\theta = \\frac{x}{' + a + '}$' + (kind2 === 'sec' ? ' (that is, $\\cos\\theta = \\frac{' + a + '}{x}$)' : '') + '.'
      }, { custom: function (p) { // check numerically at a sample point
        var x = kind2 === 'sec' ? a * 1.37 : a * 0.41, th = kind2 === 'sin' ? Math.asin(x / a) : kind2 === 'tan' ? Math.atan(x / a) : Math.acos(a / x);
        var want = { sin: Math.sin, cos: Math.cos, tan: Math.tan, sec: function (t) { return 1 / Math.cos(t); }, cot: function (t) { return 1 / Math.tan(t); } }[ask](th);
        var got = ML.evalPlain(ans[0], { x: x }); return Math.abs(got - want) < 1e-9 ? '' : 'back-substitution ' + got + ' vs ' + want;
      } });
    }
    if (shape === 'circle') {
      var part = R.pick(['quarter', 'half', 'piece']), val, valT, lo = 0, hi = a, hiT = String(a), loT = '0', st2;
      if (part === 'quarter') { val = kPlain(Q(a2, 4), 'pi'); valT = kTex(Q(a2, 4), '\\pi'); st2 = 'Over $[0, ' + a + ']$, $\\theta$ runs from $0$ to $\\frac{\\pi}{2}$: $' + a2 + '\\left[\\frac{\\theta}{2} + \\frac{\\sin 2\\theta}{4}\\right]_0^{\\pi/2} = ' + valT + '$.'; }
      else if (part === 'half') { lo = -a; loT = '-' + a; val = kPlain(Q(a2, 2), 'pi'); valT = kTex(Q(a2, 2), '\\pi'); st2 = 'Over $[-' + a + ', ' + a + ']$, $\\theta$ runs from $-\\frac{\\pi}{2}$ to $\\frac{\\pi}{2}$: $' + a2 + '\\left[\\frac{\\theta}{2} + \\frac{\\sin 2\\theta}{4}\\right]_{-\\pi/2}^{\\pi/2} = ' + valT + '$.'; }
      else { hi = a / 2; hiT = tx(Q(a, 2)); val = a2 + '*(pi/12+sqrt(3)/8)'; valT = a2 + '\\left(\\frac{\\pi}{12} + \\frac{\\sqrt{3}}{8}\\right)'; st2 = 'At $x = ' + hiT + '$, $\\sin\\theta = \\frac{1}{2}$, so $\\theta = \\frac{\\pi}{6}$: $' + a2 + '\\left[\\frac{\\theta}{2} + \\frac{\\sin 2\\theta}{4}\\right]_0^{\\pi/6} = ' + a2 + '\\left(\\frac{\\pi}{12} + \\frac{\\sqrt{3}}{8}\\right)$.'; }
      return done({
        q: 'Evaluate $\\int_{' + loT + '}^{' + hiT + '} \\sqrt{' + a2 + ' - x^{2}}\\,dx$ exactly.',
        a: { t: 'num', v: val },
        steps: [
          'Let $x = ' + a + '\\sin\\theta$, $dx = ' + a + '\\cos\\theta\\,d\\theta$. Then $\\sqrt{' + a2 + ' - x^{2}} = ' + a + '\\cos\\theta$.',
          'The integrand becomes $' + a2 + '\\cos^{2}\\theta\\,d\\theta$, and $\\int\\cos^{2}\\theta\\,d\\theta = \\frac{\\theta}{2} + \\frac{\\sin 2\\theta}{4}$.',
          st2,
          part === 'piece' ? 'Check with geometry: a $30^\\circ$ sector plus a right triangle.' : 'Check with geometry: this is ' + (part === 'quarter' ? 'a quarter' : 'half') + ' of a disk of radius ' + a + '.'
        ],
        hint: 'Substitute $x = ' + a + '\\sin\\theta$ and change the limits to $\\theta$-values.'
      }, { int: 'sqrt(' + a2 + '-x^2)', a: lo, b: hi });
    }
    var form = R.pick(['x2root', 'pow32', 'rootlog', 'x2over', 'pow32m', 'full']), ansP, ansT, Iq, st3, chk;
    if (form === 'x2root') { Iq = '\\frac{1}{x^{2}\\sqrt{' + a2 + ' - x^{2}}}'; ansP = '-sqrt(' + a2 + '-x^2)/(' + a2 + '*x)+C'; ansT = '-\\frac{\\sqrt{' + a2 + ' - x^{2}}}{' + a2 + 'x} + C'; chk = '1/(x^2*sqrt(' + a2 + '-x^2))'; st3 = ['Let $x = ' + a + '\\sin\\theta$: $dx = ' + a + '\\cos\\theta\\,d\\theta$ and $\\sqrt{' + a2 + ' - x^{2}} = ' + a + '\\cos\\theta$.', 'The integral becomes $\\int \\frac{' + a + '\\cos\\theta}{' + a2 + '\\sin^{2}\\theta\\cdot ' + a + '\\cos\\theta}d\\theta = \\frac{1}{' + a2 + '}\\int\\csc^{2}\\theta\\,d\\theta = -\\frac{\\cot\\theta}{' + a2 + '} + C$.', 'Triangle: $\\cot\\theta = \\frac{\\sqrt{' + a2 + ' - x^{2}}}{x}$.', 'Answer: $' + ansT + '$.']; }
    else if (form === 'pow32') { Iq = '\\frac{1}{(x^{2} + ' + a2 + ')^{3/2}}'; ansP = 'x/(' + a2 + '*sqrt(x^2+' + a2 + '))+C'; ansT = '\\frac{x}{' + a2 + '\\sqrt{x^{2} + ' + a2 + '}} + C'; chk = '1/(x^2+' + a2 + ')^(3/2)'; st3 = ['Let $x = ' + a + '\\tan\\theta$: $dx = ' + a + '\\sec^{2}\\theta\\,d\\theta$ and $(x^{2} + ' + a2 + ')^{3/2} = ' + a * a2 + '\\sec^{3}\\theta$.', 'The integral becomes $\\frac{1}{' + a2 + '}\\int\\cos\\theta\\,d\\theta = \\frac{\\sin\\theta}{' + a2 + '} + C$.', 'Triangle: $\\sin\\theta = \\frac{x}{\\sqrt{x^{2} + ' + a2 + '}}$.', 'Answer: $' + ansT + '$.']; }
    else if (form === 'pow32m') { Iq = '\\frac{1}{(' + a2 + ' - x^{2})^{3/2}}'; ansP = 'x/(' + a2 + '*sqrt(' + a2 + '-x^2))+C'; ansT = '\\frac{x}{' + a2 + '\\sqrt{' + a2 + ' - x^{2}}} + C'; chk = '1/(' + a2 + '-x^2)^(3/2)'; st3 = ['Let $x = ' + a + '\\sin\\theta$: $dx = ' + a + '\\cos\\theta\\,d\\theta$ and $(' + a2 + ' - x^{2})^{3/2} = ' + a * a2 + '\\cos^{3}\\theta$.', 'The integral becomes $\\frac{1}{' + a2 + '}\\int\\sec^{2}\\theta\\,d\\theta = \\frac{\\tan\\theta}{' + a2 + '} + C$.', 'Triangle: $\\tan\\theta = \\frac{x}{\\sqrt{' + a2 + ' - x^{2}}}$.', 'Answer: $' + ansT + '$.']; }
    else if (form === 'rootlog') { Iq = '\\frac{1}{\\sqrt{x^{2} + ' + a2 + '}}'; ansP = 'ln(abs(x+sqrt(x^2+' + a2 + ')))+C'; ansT = '\\ln\\left|x + \\sqrt{x^{2} + ' + a2 + '}\\right| + C'; chk = '1/sqrt(x^2+' + a2 + ')'; st3 = ['Let $x = ' + a + '\\tan\\theta$: $dx = ' + a + '\\sec^{2}\\theta\\,d\\theta$ and $\\sqrt{x^{2} + ' + a2 + '} = ' + a + '\\sec\\theta$.', 'The integral becomes $\\int\\sec\\theta\\,d\\theta = \\ln|\\sec\\theta + \\tan\\theta| + C$.', 'Triangle: $\\sec\\theta = \\frac{\\sqrt{x^{2} + ' + a2 + '}}{' + a + '}$, $\\tan\\theta = \\frac{x}{' + a + '}$, so this is $\\ln\\left|\\frac{x + \\sqrt{x^{2} + ' + a2 + '}}{' + a + '}\\right| + C$.', 'The $-\\ln ' + a + '$ joins the constant: $' + ansT + '$.']; }
    else if (form === 'x2over') { Iq = '\\frac{x^{2}}{\\sqrt{' + a2 + ' - x^{2}}}'; ansP = ps([[Q(a2, 2), 'arcsin(x/' + a + ')'], [Q(-1, 2), 'x*sqrt(' + a2 + '-x^2)']]) + '+C'; ansT = '\\frac{' + a2 + '}{2}\\arcsin\\frac{x}{' + a + '} - \\frac{x\\sqrt{' + a2 + ' - x^{2}}}{2} + C'; chk = 'x^2/sqrt(' + a2 + '-x^2)'; st3 = ['Let $x = ' + a + '\\sin\\theta$: the integral becomes $\\int \\frac{' + a2 + '\\sin^{2}\\theta}{' + a + '\\cos\\theta}\\cdot ' + a + '\\cos\\theta\\,d\\theta = ' + a2 + '\\int\\sin^{2}\\theta\\,d\\theta$.', '$= ' + a2 + '\\left(\\frac{\\theta}{2} - \\frac{\\sin\\theta\\cos\\theta}{2}\\right) + C$.', 'Triangle: $\\theta = \\arcsin\\frac{x}{' + a + '}$, $\\sin\\theta = \\frac{x}{' + a + '}$, $\\cos\\theta = \\frac{\\sqrt{' + a2 + ' - x^{2}}}{' + a + '}$.', 'Answer: $' + ansT + '$.']; }
    else { Iq = '\\sqrt{' + a2 + ' - x^{2}}'; ansP = ps([[Q(a2, 2), 'arcsin(x/' + a + ')'], [Q(1, 2), 'x*sqrt(' + a2 + '-x^2)']]) + '+C'; ansT = '\\frac{' + a2 + '}{2}\\arcsin\\frac{x}{' + a + '} + \\frac{x\\sqrt{' + a2 + ' - x^{2}}}{2} + C'; chk = 'sqrt(' + a2 + '-x^2)'; st3 = ['Let $x = ' + a + '\\sin\\theta$: the integral becomes $' + a2 + '\\int\\cos^{2}\\theta\\,d\\theta = ' + a2 + '\\left(\\frac{\\theta}{2} + \\frac{\\sin\\theta\\cos\\theta}{2}\\right) + C$.', 'Triangle: $\\theta = \\arcsin\\frac{x}{' + a + '}$, $\\sin\\theta = \\frac{x}{' + a + '}$, $\\cos\\theta = \\frac{\\sqrt{' + a2 + ' - x^{2}}}{' + a + '}$.', 'Answer: $' + ansT + '$.']; }
    var tm = by(ctx, 1, R.pick([1, 1, 2, 3]), R.pick([1, 1, 2, 3, 4, 5, 6]));
    if (tm > 1) {
      Iq = /^\\frac\{1\}/.test(Iq) ? Iq.replace(/^\\frac\{1\}/, '\\frac{' + tm + '}') : /^\\frac\{x\^\{2\}\}/.test(Iq) ? Iq.replace(/^\\frac\{x\^\{2\}\}/, '\\frac{' + tm + 'x^{2}}') : tm + Iq;
      ansP = tm + '*(' + ansP.replace(/\+C$/, '') + ')+C'; chk = tm + '*' + chk;
      st3 = ['Pull the constant $' + tm + '$ out front. Find the integral without it, then multiply by $' + tm + '$.'].concat(st3.slice(0, -1)).concat([st3[st3.length - 1].replace(/^Answer: /, 'Without the constant: '), 'Multiply by $' + tm + '$: $' + tm + '\\left(' + ansT.replace(/ \+ C$/, '') + '\\right) + C$.']);
    }
    return done({
      q: 'Find $\\int ' + Iq + '\\,dx$.',
      a: { t: 'expr', v: ansP, vars: ['x'] },
      steps: st3,
      hint: 'Pick the substitution that matches the root, and change back to $x$ with a right triangle.'
    }, { anti: chk, pts: [0.31, 0.77, 1.13, -0.43, 0.05, -1.37, 1.71, -0.9, 3.3, -4.1] });
  });

  G('calc2.partial-fractions', function (R, ctx) {
    var shape = by(ctx, R.pick(['coef', 'two', 'two']), R.pick(['two', 'improper', 'def', 'coef']), R.pick(['repeated', 'quad', 'improper', 'def']));
    var ra = R.int(-4, 4), rb = R.intNot(-4, 4, ra), A = R.nz(-4, 4), B = R.nz(-4, 4);
    // A/(x - ra) + B/(x - rb) = (A(x - rb) + B(x - ra)) / ((x - ra)(x - rb))
    var num = P(-A * rb - B * ra, A + B), den = pmul(P(-ra, 1), P(-rb, 1));
    if (num.length === 1 && num[0].isZero()) { B = B + 1 === 0 ? 2 : B + 1; num = P(-A * rb - B * ra, A + B); }
    var dT = '(x' + T.signed(-ra) + ')(x' + T.signed(-rb) + ')', dExp = ptex(den), dfac = (ra === 0 ? 'x' : '(x' + T.signed(-ra) + ')') + (rb === 0 ? 'x' : '(x' + T.signed(-rb) + ')');
    function lnB(r) { return '\\ln\\left|' + (r === 0 ? 'x' : 'x' + T.signed(-r)) + '\\right|'; }
    function lnT(c, r) { return cf(c, lnB(r)); }
    function lnP(c, r) { return ps([[c, lnAbs(r)]]); }
    var findStep = 'Write $\\frac{' + ptex(num) + '}{' + dfac + '} = \\frac{A}{' + (ra === 0 ? 'x' : 'x' + T.signed(-ra)) + '} + \\frac{B}{' + (rb === 0 ? 'x' : 'x' + T.signed(-rb)) + '}$ and multiply through: $' + ptex(num) + ' = A' + (rb === 0 ? 'x' : '(x' + T.signed(-rb) + ')') + ' + B' + (ra === 0 ? 'x' : '(x' + T.signed(-ra) + ')') + '$.';
    var coverStep = 'Put $x = ' + ra + '$: $' + tx(pev(num, ra)) + ' = A(' + (ra - rb) + ')$, so $A = ' + A + '$. Put $x = ' + rb + '$: $' + tx(pev(num, rb)) + ' = B(' + (rb - ra) + ')$, so $B = ' + B + '$.';
    if (shape === 'coef') {
      return done({
        q: 'Find $A$ and $B$ so that $\\frac{' + ptex(num) + '}{' + dfac + '} = \\frac{A}{' + (ra === 0 ? 'x' : 'x' + T.signed(-ra)) + '} + \\frac{B}{' + (rb === 0 ? 'x' : 'x' + T.signed(-rb)) + '}$.',
        a: { t: 'multi', parts: [{ label: '$A =$', a: { t: 'num', v: String(A) } }, { label: '$B =$', a: { t: 'num', v: String(B) } }] },
        steps: [findStep, coverStep, 'Check at another point, say $x = ' + (Math.max(ra, rb) + 1) + '$: both sides agree.'],
        hint: 'Multiply both sides by the denominator, then choose $x$ to make one term vanish.'
      }, null);
    }
    if (shape === 'two') {
      var showExp = by(ctx, false, true, true);
      return done({
        q: 'Find $\\int \\frac{' + ptex(num) + '}{' + (showExp ? dExp : dfac) + '}\\,dx$.',
        a: { t: 'expr', v: ps([[A, lnAbs(ra)], [B, lnAbs(rb)]]) + '+C', vars: ['x'] },
        steps: (showExp ? ['Factor the denominator: $' + dExp + ' = ' + dfac + '$.'] : []).concat([findStep, coverStep, 'Integrate each piece: $' + T.terms([[A, lnB(ra)], [B, lnB(rb)]]) + ' + C$.']),
        hint: 'Split into $\\frac{A}{x - a} + \\frac{B}{x - b}$; each piece integrates to a logarithm.'
      }, { anti: '(' + pplain(num) + ')/(' + pplain(den) + ')', pts: [ra + 0.37, rb - 0.41, ra - 0.77, rb + 0.63, 5.3, -5.1, ra + 1.4, rb - 1.6] });
    }
    if (shape === 'def') {
      // integrate on an interval to the right of both roots
      var lo = Math.max(ra, rb) + R.int(1, 2), hi = lo + R.int(1, 3);
      var ansP = ps([[A, 'ln(' + Q(hi - ra, lo - ra).toPlain() + ')'], [B, 'ln(' + Q(hi - rb, lo - rb).toPlain() + ')']]);
      function lnFrac(c, r) { var q = Q(hi - r, lo - r); return cf(c, '\\ln' + (q.isInt() ? ' ' + q.toTex() : q.toTex())); }
      return done({
        q: 'Evaluate $\\int_{' + lo + '}^{' + hi + '} \\frac{' + ptex(num) + '}{' + dExp + '}\\,dx$ exactly.',
        a: { t: 'num', v: ansP },
        steps: ['Factor: $' + dExp + ' = ' + dfac + '$.', findStep, coverStep, 'Antiderivative: $' + T.terms([[A, lnB(ra)], [B, lnB(rb)]]) + '$. Both factors stay positive on $[' + lo + ', ' + hi + ']$.', 'Value: $' + lnFrac(A, ra) + (B > 0 ? ' + ' : ' - ') + lnFrac(Math.abs(B), rb) + '$.'],
        hint: 'Decompose, integrate to logarithms, then evaluate.'
      }, { int: '(' + pplain(num) + ')/(' + pplain(den) + ')', a: lo, b: hi });
    }
    if (shape === 'improper') {
      var full = padd(den, num), fullT = ptex(full); // (x-ra)(x-rb) + A(x-rb) + B(x-ra) over den -> 1 + A/(x-ra) + B/(x-rb)
      return done({
        q: 'Find $\\int \\frac{' + fullT + '}{' + dExp + '}\\,dx$.',
        a: { t: 'expr', v: ps([[1, 'x'], [A, lnAbs(ra)], [B, lnAbs(rb)]]) + '+C', vars: ['x'] },
        steps: [
          'The numerator has the same degree as the denominator, so divide first. $' + fullT + ' = (' + dExp + ')' + (num.length === 1 ? T.signed(num[0]) : ' + (' + ptex(num) + ')') + '$, so the integrand is $1 + \\frac{' + ptex(num) + '}{' + dExp + '}$.',
          findStep, coverStep,
          'Integrate: $' + T.terms([[1, 'x'], [A, lnB(ra)], [B, lnB(rb)]]) + ' + C$.'
        ],
        hint: 'When the top\'s degree is not smaller than the bottom\'s, do polynomial division before splitting.'
      }, { anti: '(' + pplain(full) + ')/(' + pplain(den) + ')', pts: [ra + 0.37, rb - 0.41, ra - 0.77, rb + 0.63, 5.3, -5.1, ra + 1.4, rb - 1.6] });
    }
    if (shape === 'repeated') {
      // A/(x-ra) + B/(x-ra)^2 + D/(x-rb)
      var A2 = R.nz(-3, 3), B2 = R.nz(-4, 4), D2 = -A2 + R.pick([0, 1, -1, 2]); if (D2 === 0) D2 = 1;
      var la = P(-ra, 1), lb = P(-rb, 1), den2 = pmul(pmul(la, la), lb);
      var num2 = padd(padd(pscale(pmul(la, lb), A2), pscale(lb, B2)), pscale(pmul(la, la), D2));
      var xa = ra === 0 ? 'x' : 'x' + T.signed(-ra), xb = rb === 0 ? 'x' : 'x' + T.signed(-rb);
      return done({
        q: 'Find $\\int \\frac{' + ptex(num2) + '}{(' + xa + ')^{2}(' + xb + ')}\\,dx$.',
        a: { t: 'expr', v: ps([[A2, lnAbs(ra)], [-B2, '1/(' + plinX(ra) + ')'], [D2, lnAbs(rb)]]).replace(/(^|[-+])1\/\(/, '$11/(').replace(/(\d+)\*1\/\(/g, '$1/(') + '+C', vars: ['x'] },
        steps: [
          'A repeated factor needs one term for each power: $\\frac{A}{' + xa + '} + \\frac{B}{(' + xa + ')^{2}} + \\frac{D}{' + xb + '}$.',
          'Clear denominators: $' + ptex(num2) + ' = A(' + xa + ')(' + xb + ') + B(' + xb + ') + D(' + xa + ')^{2}$.',
          'Put $x = ' + ra + '$: $' + tx(pev(num2, ra)) + ' = B(' + (ra - rb) + ')$, so $B = ' + B2 + '$. Put $x = ' + rb + '$: $' + tx(pev(num2, rb)) + ' = D(' + (rb - ra) + ')^{2}$, so $D = ' + D2 + '$. Compare the $x^{2}$ coefficients: $A + D = ' + (A2 + D2) + '$, so $A = ' + A2 + '$.',
          'Integrate, using $\\int \\frac{dx}{(x - a)^{2}} = -\\frac{1}{x - a}$: $' + lnT(A2, ra) + (B2 > 0 ? ' - ' : ' + ') + '\\frac{' + Math.abs(B2) + '}{' + xa + '}' + (D2 > 0 ? ' + ' : ' - ') + lnT(Math.abs(D2), rb) + ' + C$.'
        ],
        hint: 'A squared factor $(x - a)^{2}$ gets two terms: $\\frac{A}{x - a} + \\frac{B}{(x - a)^{2}}$.'
      }, { anti: '(' + pplain(num2) + ')/(' + pplain(den2) + ')', pts: [ra + 0.37, rb - 0.41, ra - 0.77, rb + 0.63, 5.3, -5.1, ra + 1.4, rb - 1.6] });
    }
    // quad: c/(x - ra) + (d x + e)/(x^2 + k^2)
    var k = R.int(1, 3), c = R.nz(-3, 3), d = R.nz(-3, 3) * 2, e = R.int(-3, 3) * k;
    var q2 = P(k * k, 0, 1), lin2 = P(-ra, 1), numq = padd(pscale(q2, c), pmul(P(e, d), lin2)), denq = pmul(lin2, q2);
    var xa2 = ra === 0 ? 'x' : 'x' + T.signed(-ra);
    var ansQ = ps([[c, lnAbs(ra)], [Q(d, 2), 'ln(x^2+' + k * k + ')'], [Q(e, k), k === 1 ? 'arctan(x)' : 'arctan(x/' + k + ')']]) + '+C';
    var ansQT = lnT(c, ra) + T.coef(Q(d, 2), '\\ln(x^{2} + ' + k * k + ')', false) + (e ? T.coef(Q(e, k), '\\arctan' + (k === 1 ? ' x' : '\\frac{x}{' + k + '}'), false) : '') + ' + C';
    return done({
      q: 'Find $\\int \\frac{' + ptex(numq) + '}{(' + xa2 + ')(x^{2} + ' + k * k + ')}\\,dx$.',
      a: { t: 'expr', v: ansQ, vars: ['x'] },
      steps: [
        '$x^{2} + ' + k * k + '$ does not factor over the reals, so its term gets a linear numerator: $\\frac{c}{' + xa2 + '} + \\frac{dx + e}{x^{2} + ' + k * k + '}$.',
        'Clear denominators: $' + ptex(numq) + ' = c(x^{2} + ' + k * k + ') + (dx + e)(' + xa2 + ')$. At $x = ' + ra + '$: $c = ' + c + '$. Matching the other coefficients gives $d = ' + d + '$, $e = ' + e + '$.',
        '$\\int \\frac{' + d + 'x}{x^{2} + ' + k * k + '}dx = ' + cf(Q(d, 2), '\\ln(x^{2} + ' + k * k + ')') + '$ (substitute $u = x^{2} + ' + k * k + '$)' + (e ? ', and $\\int \\frac{' + e + '}{x^{2} + ' + k * k + '}dx = ' + cf(Q(e, k), '\\arctan' + (k === 1 ? ' x' : '\\frac{x}{' + k + '}')) + '$.' : '.'),
        'Answer: $' + ansQT + '$.'
      ],
      hint: 'An irreducible quadratic factor gets a numerator of the form $dx + e$.'
    }, { anti: '(' + pplain(numq) + ')/(' + pplain(denq) + ')', pts: [ra + 0.37, ra - 0.41, ra - 0.77, ra + 0.63, 5.3, -5.1, ra + 1.4, ra - 1.6] });
  });

  var STRAT = [
    { I: 'x e^{x^{2}}', t: 'A $u$-substitution, $u = x^{2}$', why: 'the factor $x$ is (up to a constant) the derivative of the inner function $x^{2}$.' },
    { I: '\\frac{\\ln x}{x}', t: 'A $u$-substitution, $u = \\ln x$', why: '$\\frac{1}{x}$ is the derivative of $\\ln x$.' },
    { I: '\\sin^{4} x\\cos x', t: 'A $u$-substitution, $u = \\sin x$', why: '$\\cos x\\,dx$ is exactly $du$.' },
    { I: 'x e^{3x}', t: 'Integration by parts', why: 'it is a product of a polynomial and an exponential, and no factor is the derivative of another part.' },
    { I: 'x^{2}\\ln x', t: 'Integration by parts', why: 'take $u = \\ln x$, whose derivative is simple, and integrate the power of $x$.' },
    { I: 'e^{x}\\cos x', t: 'Integration by parts', why: 'parts twice brings the integral back, and you solve for it.' },
    { I: '\\arctan x', t: 'Integration by parts', why: 'write it as $\\arctan x\\cdot 1$ with $u = \\arctan x$.' },
    { I: '\\frac{5}{x^{2} - x - 6}', t: 'Partial fractions', why: 'the denominator factors as $(x - 3)(x + 2)$ into distinct linear factors.' },
    { I: '\\frac{x + 1}{x(x - 1)^{2}}', t: 'Partial fractions', why: 'it is a rational function whose denominator is already factored.' },
    { I: '\\sqrt{9 - x^{2}}', t: 'Trigonometric substitution, $x = 3\\sin\\theta$', why: 'a root of $a^{2} - x^{2}$ with no extra factor of $x$ outside.' },
    { I: '\\frac{1}{(x^{2} + 4)^{3/2}}', t: 'Trigonometric substitution, $x = 2\\tan\\theta$', why: 'the form $x^{2} + a^{2}$ under a power, with no factor of $x$ to substitute with.' },
    { I: '\\frac{\\sqrt{x^{2} - 16}}{x}', t: 'Trigonometric substitution, $x = 4\\sec\\theta$', why: 'the form $x^{2} - a^{2}$ under a root.' },
    { I: '\\sin^{2} x', t: 'A power-reducing identity', why: 'even powers of sine and cosine need $\\sin^{2} x = \\frac{1 - \\cos 2x}{2}$.' },
    { I: '\\tan^{2} x', t: 'A Pythagorean identity, $\\tan^{2} x = \\sec^{2} x - 1$', why: 'after the identity, both pieces are basic integrals.' }
  ];
  var TECHS = ['A $u$-substitution', 'Integration by parts', 'Partial fractions', 'Trigonometric substitution', 'A trig identity'];
  function techOf(s) { return /substitution, \$u/.test(s) ? 0 : /parts/.test(s) ? 1 : /Partial/.test(s) ? 2 : /Trigonometric substitution/.test(s) ? 3 : 4; }

  G('calc2.integration-strategy', function (R, ctx) {
    var shape = by(ctx, 'which', R.pick(['which', 'do', 'do']), R.pick(['do', 'do', 'which']));
    if (shape === 'which') {
      var it = R.pick(STRAT), ti = techOf(it.t), wr = TECHS.filter(function (_, i) { return i !== ti; });
      return done({
        q: 'Which method is the best first move for $\\int ' + it.I + '\\,dx$?',
        a: mc(TECHS[ti], R.sample(wr, 3)),
        steps: ['Best first move: ' + it.t + ', because ' + it.why, 'Order of questions to ask: Is it a basic formula after algebra? Is part of it the derivative of another part (substitution)? A product of different kinds of functions? Then parts. A rational function? Then partial fractions. A root of $a^{2} \\pm x^{2}$ or $x^{2} - a^{2}$? Then trig substitution. Powers of trig functions? Then identities.'],
        hint: 'Look first for a function and its derivative appearing together.'
      }, null);
    }
    var fams = [['calc2.integration-by-parts', 'Integration by parts'], ['calc2.trig-integrals', 'Trig identities and substitution'], ['calc2.partial-fractions', 'Partial fractions'], ['calc2.trig-substitution', 'Trigonometric substitution']];
    for (var tries = 0; tries < 30; tries++) {
      var f = R.pick(fams), sub = ML.getGen(f[0])(R, { level: R.pick([2, 3]), mode: ctx.mode });
      if (sub && sub.a && (sub.a.t === 'expr' || sub.a.t === 'num') && /^(Find|Evaluate)/.test(sub.q)) {
        var out = { q: 'Choose a method, then ' + sub.q.charAt(0).toLowerCase() + sub.q.slice(1), a: sub.a, steps: ['Method: ' + f[1].toLowerCase() + '.'].concat(sub.steps), hint: 'Decide the method first: substitution, parts, partial fractions, trig substitution or a trig identity.' };
        return done(out, sub.chk);
      }
    }
    return done({ q: 'Find $\\int x e^{x}\\,dx$.', a: { t: 'expr', v: 'x*e^x-e^x+C', vars: ['x'] }, steps: ['Parts with $u = x$: $x e^{x} - e^{x} + C$.'] }, { anti: 'x*e^x' });
  });

  G('calc2.numerical-integration', function (R, ctx) {
    var shape = by(ctx, R.pick(['trap', 'mid', 'trap']), R.pick(['simp', 'table', 'trap', 'odd']), R.pick(['simp', 'table', 'error', 'nneed']));
    function fam() {
      var t = R.pick(['poly', 'recip', 'poly']);
      if (t === 'recip') { var c = R.pick([1, 2, 6, 12]); return { tex: '\\frac{' + c + '}{x}', plain: c + '/x', f: function (x) { return Q(c).div(x); }, a: R.int(1, 2) }; }
      var cf2 = [R.int(-2, 3), R.int(-3, 3), R.nz(-2, 2)]; if (R.coin()) cf2.push(R.pick([0, 1])); var pp2 = P.apply(null, cf2);
      return { tex: ptex(pp2), plain: pplain(pp2), f: function (x) { return pev(pp2, x); }, a: R.int(-1, 1) };
    }
    if (shape === 'odd') {
      var nn = R.pick([3, 5, 7]);
      return done({
        q: 'A classmate wants to estimate $\\int_0^{' + nn + '} f(x)\\,dx$ with Simpson\'s rule using $n = ' + nn + '$ subintervals of width 1. What is the problem?',
        a: mc('Simpson\'s rule needs an even $n$: it fits one parabola over each pair of subintervals.', ['Nothing; Simpson\'s rule works for any $n$.', 'Simpson\'s rule needs $n$ to be a multiple of 3.', 'The width must be less than 1 for Simpson\'s rule.']),
        steps: ['Simpson\'s rule passes a parabola through three neighboring points, so it uses the subintervals two at a time.', 'With $n = ' + nn + '$ one subinterval is left over, and the weights $1, 4, 2, 4, \\ldots, 4, 1$ no longer fit. Use $n = ' + (nn - 1) + '$ or $n = ' + (nn + 1) + '$, or handle the last piece with a trapezoid.'],
        hint: 'Count how many subintervals each parabola covers.'
      }, null);
    }
    if (shape === 'table') {
      var n = R.pick([4, 6]), h = R.pick([1, 2, Q(1, 2)]), vals = [], useS = R.coin();
      for (var i = 0; i <= n; i++) vals.push(R.int(10, 40));
      var hq = Qf(h), sumT = Q(0), sumS = Q(0);
      vals.forEach(function (v, i) { sumT = sumT.add(Q(v).mul(i === 0 || i === n ? 1 : 2)); sumS = sumS.add(Q(v).mul(i === 0 || i === n ? 1 : i % 2 ? 4 : 2)); });
      var T0 = hq.div(2).mul(sumT), S0 = hq.div(3).mul(sumS), est = useS ? S0 : T0;
      var times = vals.map(function (_, i) { return dec(hq.mul(i)); });
      return done({
        q: 'A car\'s speed (in m/s) is recorded every ' + dec(hq) + ' s:<br>' + D('\\begin{array}{c|' + 'c'.repeat(n + 1) + '} t & ' + times.join(' & ') + ' \\\\ \\hline v & ' + vals.join(' & ') + '\\end{array}') + 'Estimate the distance traveled with ' + (useS ? 'Simpson\'s rule' : 'the trapezoid rule') + '.',
        a: { t: 'num', v: est.toPlain() }, unit: 'm',
        steps: [
          'Distance is $\\int v\\,dt$. Here $\\Delta t = ' + dec(hq) + '$ and $n = ' + n + '$.',
          useS ? 'Simpson: $\\frac{\\Delta t}{3}\\left[v_0 + 4v_1 + 2v_2 + 4v_3 + \\cdots + 4v_{' + (n - 1) + '} + v_{' + n + '}\\right]$.' : 'Trapezoid: $\\frac{\\Delta t}{2}\\left[v_0 + 2v_1 + 2v_2 + \\cdots + 2v_{' + (n - 1) + '} + v_{' + n + '}\\right]$.',
          'The bracket is $' + (useS ? sumS : sumT).toTex() + '$.',
          'Estimate: $' + (useS ? '\\frac{' + dec(hq) + '}{3}' : '\\frac{' + dec(hq) + '}{2}') + '\\cdot ' + (useS ? sumS : sumT).toTex() + ' = ' + est.toTex() + (est.isInt() ? '' : ' \\approx ' + est.toDec(2)) + '$ m.'
        ],
        hint: useS ? 'Simpson\'s weights are 1, 4, 2, 4, …, 4, 1.' : 'Trapezoid weights are 1, 2, 2, …, 2, 1.'
      }, { val: est.toNumber() });
    }
    if (shape === 'error' || shape === 'nneed') {
      var useS2 = R.coin(), K = R.pick([2, 4, 6, 12, 24]), a0 = 0, b0 = R.pick([1, 2, 3]), L3 = Q(b0 - a0);
      if (shape === 'error') {
        var n2 = useS2 ? R.pick([2, 4, 6, 10]) : R.pick([2, 4, 5, 10]);
        var bound = useS2 ? Q(K).mul(L3.pow(5)).div(180 * Math.pow(n2, 4)) : Q(K).mul(L3.pow(3)).div(12 * n2 * n2);
        return done({
          q: 'On $[0, ' + b0 + ']$, $|f' + (useS2 ? '^{(4)}' : '\'\'') + '(x)| \\le ' + K + '$. Using the error bound for ' + (useS2 ? 'Simpson\'s rule' : 'the trapezoid rule') + ' with $n = ' + n2 + '$, how large can the error be? Give the bound as an exact fraction.',
          a: { t: 'num', v: bound.toPlain() },
          steps: [
            useS2 ? 'Simpson bound: $|E_S| \\le \\frac{K(b - a)^{5}}{180n^{4}}$.' : 'Trapezoid bound: $|E_T| \\le \\frac{K(b - a)^{3}}{12n^{2}}$.',
            'Substitute $K = ' + K + '$, $b - a = ' + b0 + '$, $n = ' + n2 + '$: $\\frac{' + K + '\\cdot ' + b0 + '^{' + (useS2 ? 5 : 3) + '}}{' + (useS2 ? '180\\cdot ' + n2 + '^{4}' : '12\\cdot ' + n2 + '^{2}') + '} = ' + bound.toTex() + '$.'
          ],
          hint: 'Plug into the error bound formula; the error shrinks like $\\frac{1}{n^{2}}$ for trapezoids and $\\frac{1}{n^{4}}$ for Simpson.'
        }, { val: bound.toNumber() });
      }
      var tol = R.pick([Q(1, 100), Q(1, 1000), Q(1, 10000)]);
      // smallest n with bound <= tol (Simpson: even n)
      var nn2 = 1, bnd = function (m) { return useS2 ? Q(K).mul(L3.pow(5)).div(180 * Math.pow(m, 4)) : Q(K).mul(L3.pow(3)).div(12 * m * m); };
      if (useS2) nn2 = 2;
      while (bnd(nn2).gt(tol)) nn2 += useS2 ? 2 : 1;
      return done({
        q: 'On $[0, ' + b0 + ']$, $|f' + (useS2 ? '^{(4)}' : '\'\'') + '(x)| \\le ' + K + '$. What is the smallest $n$' + (useS2 ? ' (even)' : '') + ' for which the ' + (useS2 ? 'Simpson' : 'trapezoid') + ' error bound guarantees an error of at most $' + tol.toTex() + '$?',
        a: { t: 'num', v: String(nn2), form: 'int' },
        steps: [
          useS2 ? 'Need $\\frac{' + K + '\\cdot ' + b0 + '^{5}}{180n^{4}} \\le ' + tol.toTex() + '$, that is $n^{4} \\ge ' + Q(K).mul(L3.pow(5)).div(tol.mul(180)).toTex() + '$.' : 'Need $\\frac{' + K + '\\cdot ' + b0 + '^{3}}{12n^{2}} \\le ' + tol.toTex() + '$, that is $n^{2} \\ge ' + Q(K).mul(L3.pow(3)).div(tol.mul(12)).toTex() + '$.',
          'So $n \\ge ' + (useS2 ? Math.pow(Q(K).mul(L3.pow(5)).div(tol.mul(180)).toNumber(), 0.25) : Math.sqrt(Q(K).mul(L3.pow(3)).div(tol.mul(12)).toNumber())).toFixed(2) + '$.',
          'The smallest ' + (useS2 ? 'even ' : '') + 'whole number that works is $n = ' + nn2 + '$.'
        ],
        hint: 'Set the error bound $\\le$ the tolerance and solve for $n$; round up.'
      }, { custom: function () { return (bnd(nn2).le(tol) && (nn2 <= (useS2 ? 2 : 1) || bnd(nn2 - (useS2 ? 2 : 1)).gt(tol))) ? '' : 'n not minimal'; } });
    }
    var F = fam(), lo = F.a, n3 = shape === 'simp' ? R.pick([2, 4]) : R.pick([2, 3, 4]), hq3 = R.pick([Q(1), Q(1, 2)]), hi = Qf(lo).add(hq3.mul(n3));
    var xs = []; for (var j = 0; j <= n3; j++) xs.push(Qf(lo).add(hq3.mul(j)));
    var est3, w, rule, bracket = Q(0), terms = [];
    if (shape === 'mid') {
      xs = []; for (j = 0; j < n3; j++) xs.push(Qf(lo).add(hq3.mul(j)).add(hq3.div(2)));
      xs.forEach(function (x) { var y = F.f(x); bracket = bracket.add(y); terms.push(tp(y)); });
      est3 = bracket.mul(hq3); rule = 'midpoint';
    } else {
      xs.forEach(function (x, i) { var y = F.f(x); w = shape === 'simp' ? (i === 0 || i === n3 ? 1 : i % 2 ? 4 : 2) : (i === 0 || i === n3 ? 1 : 2); bracket = bracket.add(y.mul(w)); terms.push((w === 1 ? '' : w + '\\cdot ') + tp(y)); });
      est3 = shape === 'simp' ? bracket.mul(hq3).div(3) : bracket.mul(hq3).div(2); rule = shape === 'simp' ? 'Simpson\'s rule' : 'the trapezoid rule';
    }
    return done({
      q: 'Estimate $\\int_{' + lo + '}^{' + tx(hi) + '} ' + (/[+-]/.test(F.tex.replace(/^-/, '')) ? '\\left(' + F.tex + '\\right)' : F.tex) + '\\,dx$ with ' + rule + ' and $n = ' + n3 + '$. Give the exact value of the estimate.',
      a: { t: 'num', v: est3.toPlain() },
      steps: [
        '$\\Delta x = \\frac{' + (lo === 0 ? tx(hi) : tx(hi) + ' - ' + T.p(lo)) + '}{' + n3 + '} = ' + tx(hq3) + '$. ' + (shape === 'mid' ? 'Midpoints: ' : 'Points: ') + '$' + xs.map(tx).join(', ') + '$.',
        shape === 'mid' ? 'Midpoint rule: $\\Delta x\\left[f(m_1) + \\cdots + f(m_n)\\right]$.' : shape === 'simp' ? 'Simpson: $\\frac{\\Delta x}{3}\\left[y_0 + 4y_1 + 2y_2 + \\cdots + y_n\\right]$ with $y_k = f(x_k)$.' : 'Trapezoid: $\\frac{\\Delta x}{2}\\left[y_0 + 2y_1 + \\cdots + 2y_{n-1} + y_n\\right]$ with $y_k = f(x_k)$.',
        'Bracket: $' + terms.join(' + ').replace(/\+ -/g, '- ') + ' = ' + tx(bracket) + '$.',
        'Estimate: $' + (shape === 'mid' ? tx(hq3) : shape === 'simp' ? '\\frac{' + tx(hq3) + '}{3}' : '\\frac{' + tx(hq3) + '}{2}') + '\\cdot ' + tp(bracket) + ' = ' + tx(est3) + '$.'
      ],
      hint: shape === 'simp' ? 'Weights $1, 4, 2, 4, \\ldots, 4, 1$, all times $\\frac{\\Delta x}{3}$.' : shape === 'mid' ? 'Evaluate $f$ at the middle of each subinterval.' : 'Weights $1, 2, 2, \\ldots, 2, 1$, all times $\\frac{\\Delta x}{2}$.',
      viz: { name: 'riemann', opts: { quiet: true, f: F.plain, a: lo, b: hi.toNumber(), n: n3, method: shape === 'simp' ? 'trap' : shape === 'mid' ? 'mid' : 'trap', methods: ['left', 'right', 'mid', 'trap'], exact: false } },
      nolint: ['--', '+ -', '+ 0']
    }, { custom: function () { // recompute independently in floats
      var s = 0, hh = hq3.toNumber(), a0 = Number(lo), fn = function (x) { return F.f(Q.from(Math.round(x * 1e6) / 1e6)).toNumber(); };
      if (shape === 'mid') { for (var i = 0; i < n3; i++) s += fn(a0 + (i + 0.5) * hh); s *= hh; }
      else if (shape === 'simp') { for (i = 0; i <= n3; i++) s += (i === 0 || i === n3 ? 1 : i % 2 ? 4 : 2) * fn(a0 + i * hh); s *= hh / 3; }
      else { for (i = 0; i <= n3; i++) s += (i === 0 || i === n3 ? 1 : 2) * fn(a0 + i * hh); s *= hh / 2; }
      return Math.abs(s - est3.toNumber()) < 1e-9 ? '' : 'estimate ' + est3.toNumber() + ' vs ' + s;
    } });
  });

  G('calc2.improper-integrals', function (R, ctx) {
    var shape = by(ctx, R.pick(['pinf', 'exp']), R.pick(['pinf', 'sing', 'exp', 'decide']), R.pick(['decide', 'atan', 'xexp', 'sing', 'decide']));
    if (shape === 'pinf') {
      var p = R.pick([2, 3, 4, '3/2']), k = R.pick([1, 2, 3, 4, 6]), a = p === '3/2' ? R.pick([1, 4, 9]) : R.int(1, 3), pq = Q.from(p);
      var aPow = p === '3/2' ? Q(1, Math.round(Math.sqrt(a))) : Q(1).div(Q(a).pow(pq.num() - 1)); // a^(1-p)
      var val = Q(k).mul(aPow).div(pq.sub(1)), co = Q(k).div(pq.sub(1)), pw = pq.num() - 1;
      var pT = p === '3/2' ? 'x^{3/2}' : 'x^{' + p + '}';
      var antiT2 = p === '3/2' ? '-\\frac{' + 2 * k + '}{\\sqrt{x}}' : '-\\frac{' + co.n + '}{' + (co.d === 1n ? '' : co.d) + (pw === 1 ? 'x' : 'x^{' + pw + '}') + '}';
      return done({
        q: 'Evaluate $\\int_{' + a + '}^{\\infty} \\frac{' + k + '}{' + pT + '}\\,dx$.',
        a: { t: 'num', v: val.toPlain() },
        steps: [
          'An infinite limit means a limit: $\\int_{' + a + '}^{\\infty} = \\lim_{t\\to\\infty}\\int_{' + a + '}^{t}$.',
          'Antiderivative: $' + antiT2 + '$.',
          '$\\lim_{t\\to\\infty}\\left[' + antiT2 + '\\right]_{' + a + '}^{t}$: the term at $t$ goes to $0$, leaving $' + tx(val) + '$.'
        ],
        hint: 'Integrate up to $t$, then let $t \\to \\infty$.'
      }, { int: k + '/x^(' + pq.toNumber() + ')', a: a, inf: true });
    }
    if (shape === 'exp') {
      var c = R.int(1, 5), k2 = R.int(1, 6), a2 = R.pick([0, 0, 1, 2]);
      var valT = a2 === 0 ? tx(Q(k2, c)) : c === 1 ? (k2 === 1 ? '' : k2) + 'e^{-' + a2 + '}' : '\\frac{' + (k2 === 1 ? '' : k2) + 'e^{-' + c * a2 + '}}{' + c + '}';
      var valP = a2 === 0 ? Q(k2, c).toPlain() : k2 + '*e^(-' + c * a2 + ')/' + c;
      return done({
        q: 'Evaluate $\\int_{' + a2 + '}^{\\infty} ' + (k2 === 1 ? '' : k2) + 'e^{-' + (c === 1 ? '' : c) + 'x}\\,dx$.',
        a: { t: 'num', v: valP },
        steps: [
          '$\\int_{' + a2 + '}^{t} ' + (k2 === 1 ? '' : k2) + 'e^{-' + (c === 1 ? '' : c) + 'x}\\,dx = \\left[' + cf(Q(-k2, c), 'e^{-' + (c === 1 ? '' : c) + 'x}') + '\\right]_{' + a2 + '}^{t}$.',
          'As $t \\to \\infty$, $e^{-' + (c === 1 ? '' : c) + 't} \\to 0$.',
          'So the integral converges to $' + valT + '$.'
        ],
        hint: 'Integrate to $t$ and use $e^{-ct} \\to 0$.'
      }, { int: k2 + '*e^(-' + c + '*x)', a: a2, inf: true });
    }
    if (shape === 'xexp') {
      var c3 = R.int(1, 4);
      return done({
        q: 'Evaluate $\\int_{0}^{\\infty} x e^{-' + (c3 === 1 ? '' : c3) + 'x}\\,dx$.',
        a: { t: 'num', v: Q(1, c3 * c3).toPlain() },
        steps: [
          'By parts: $\\int x e^{-' + (c3 === 1 ? '' : c3) + 'x}dx = -\\frac{x}{' + c3 + '}e^{-' + (c3 === 1 ? '' : c3) + 'x} - \\frac{1}{' + c3 * c3 + '}e^{-' + (c3 === 1 ? '' : c3) + 'x}$.',
          'As $t \\to \\infty$, $t e^{-' + (c3 === 1 ? '' : c3) + 't} \\to 0$ (exponentials beat powers; L\'Hôpital confirms it).',
          'Value: $0 - \\left(0 - \\frac{1}{' + c3 * c3 + '}\\right) = ' + tx(Q(1, c3 * c3)) + '$.'
        ],
        hint: 'Integrate by parts, then take the limit.'
      }, { int: 'x*e^(-' + c3 + '*x)', a: 0, inf: true });
    }
    if (shape === 'atan') {
      var a4 = R.int(1, 5), whole = R.coin();
      return done({
        q: 'Evaluate $\\int_{' + (whole ? '-\\infty' : '0') + '}^{\\infty} \\frac{1}{x^{2} + ' + a4 * a4 + '}\\,dx$.',
        a: { t: 'num', v: whole ? 'pi/' + a4 : 'pi/' + 2 * a4 },
        steps: [
          '$\\int \\frac{dx}{x^{2} + ' + a4 * a4 + '} = ' + (a4 === 1 ? '\\arctan x' : '\\frac{1}{' + a4 + '}\\arctan\\frac{x}{' + a4 + '}') + '$.',
          whole ? 'Split at 0 and take both limits: $\\arctan$ tends to $\\frac{\\pi}{2}$ at $+\\infty$ and $-\\frac{\\pi}{2}$ at $-\\infty$.' : 'As $t \\to \\infty$, $\\arctan\\frac{t}{' + a4 + '} \\to \\frac{\\pi}{2}$; at $0$ it is $0$.',
          'Value: $' + (whole ? kTex(Q(1, a4), '\\pi') : kTex(Q(1, 2 * a4), '\\pi')) + '$.'
        ],
        hint: 'The antiderivative is an arctangent; what does arctan approach at infinity?'
      }, { custom: function () { var v = whole ? Math.PI / a4 : Math.PI / (2 * a4), g = 2 * integInfLocal(function (x) { return 1 / (x * x + a4 * a4); }); return Math.abs((whole ? g : g / 2) - v) < 1e-6 ? '' : 'atan ' + v + ' vs ' + g; } });
    }
    if (shape === 'sing') {
      var pr = R.pick([[1, 2], [1, 3], [2, 3], [3, 4]]), pq2 = Q(pr[0], pr[1]), one = Q(1).sub(pq2), m = R.int(1, 3), b = Math.pow(m, pr[1]), k3 = R.pick([1, 2, 3]);
      var val4 = Q(k3).mul(Q(Math.pow(m, pr[1] - pr[0]))).div(one); // b^(1-p) = m^(q-p)
      var rootT = pr[1] === 2 ? '\\sqrt{x}' : 'x^{' + pr[0] + '/' + pr[1] + '}';
      return done({
        q: 'Evaluate $\\int_{0}^{' + b + '} \\frac{' + k3 + '}{' + rootT + '}\\,dx$.',
        a: { t: 'num', v: val4.toPlain() },
        steps: [
          'The integrand blows up at $x = 0$, so this is a limit: $\\lim_{s\\to 0^{+}}\\int_{s}^{' + b + '}$.',
          'Antiderivative: $' + k3 + '\\cdot\\frac{x^{' + one.toTex() + '}}{' + one.toTex() + '} = ' + cf(Q(k3).div(one), 'x^{' + one.toTex() + '}') + '$.',
          'At $x = ' + b + '$: $' + b + '^{' + one.toTex() + '} = ' + Math.pow(m, pr[1] - pr[0]) + '$. As $s \\to 0^{+}$, $s^{' + one.toTex() + '} \\to 0$ because the exponent is positive.',
          'Value: $' + tx(val4) + '$.'
        ],
        hint: 'Treat $x = 0$ as a limit $s \\to 0^{+}$; the power $1 - p$ is positive here.'
      }, { int: k3 + '/x^(' + pq2.toNumber() + ')', a: 0, b: b, sing: true });
    }
    // decide: converge or diverge, with a reason
    var Dk = R.pick([
      { I: '\\int_{-1}^{1}\\frac{1}{x^{2}}\\,dx', right: 'Diverges: $\\frac{1}{x^{2}}$ blows up at $x = 0$, inside the interval, and $\\int_0^1 \\frac{dx}{x^{2}}$ is already infinite.', wr: ['Converges to $-2$, from $\\left[-\\frac{1}{x}\\right]_{-1}^{1}$.', 'Converges to $2$, since the function is even.', 'Converges to $0$, by symmetry.'], st: ['$\\frac{1}{x^{2}}$ is not continuous on $[-1, 1]$: it has a vertical asymptote at $x = 0$, so split there.', '$\\int_0^1 \\frac{dx}{x^{2}} = \\lim_{s\\to 0^{+}}\\left(\\frac{1}{s} - 1\\right) = \\infty$.', 'One divergent piece makes the whole integral diverge. (A positive integrand cannot have a negative integral, which is how you can tell $-2$ is wrong.)'] },
      { I: '\\int_{0}^{3}\\frac{1}{(x - 1)^{2}}\\,dx', right: 'Diverges: the integrand blows up at $x = 1$, and the piece near $x = 1$ is infinite.', wr: ['Converges to $-\\frac{3}{2}$, from $\\left[-\\frac{1}{x - 1}\\right]_0^3$.', 'Converges to $\\frac{3}{2}$.', 'Converges, because the interval is finite.'], st: ['$x = 1$ is inside $[0, 3]$ and the integrand has a vertical asymptote there.', '$\\int_1^3 \\frac{dx}{(x - 1)^{2}} = \\lim_{s\\to 1^{+}}\\left(\\frac{1}{s - 1} - \\frac{1}{2}\\right) = \\infty$.', 'So the integral diverges. The FTC needs a continuous integrand.'] },
      { I: '\\int_{1}^{\\infty}\\frac{1}{x}\\,dx', right: 'Diverges: $\\int_1^t \\frac{dx}{x} = \\ln t$, which grows without bound.', wr: ['Converges to $1$, since $\\frac{1}{x} \\to 0$.', 'Converges to $0$.', 'Converges, like $\\int_1^\\infty \\frac{dx}{x^{2}}$.'], st: ['$\\int_1^t \\frac{dx}{x} = \\ln t$.', '$\\ln t \\to \\infty$ as $t \\to \\infty$ (slowly, but without bound).', 'Terms going to 0 is not enough; they must go to 0 fast enough.'] },
      { I: '\\int_{1}^{\\infty}\\frac{1}{\\sqrt{x}}\\,dx', right: 'Diverges: $\\int_1^t x^{-1/2}dx = 2\\sqrt{t} - 2 \\to \\infty$.', wr: ['Converges to $2$.', 'Converges, since $\\frac{1}{\\sqrt{x}} \\to 0$.', 'Converges to $\\frac{1}{2}$.'], st: ['$\\int_1^t x^{-1/2}\\,dx = 2\\sqrt{t} - 2$.', 'As $t \\to \\infty$ this grows without bound.', 'For $\\int_1^\\infty \\frac{dx}{x^{p}}$: converges only when $p > 1$; here $p = \\frac{1}{2}$.'] },
      { I: '\\int_{0}^{1}\\frac{1}{\\sqrt{x}}\\,dx', right: 'Converges to $2$: $\\lim_{s\\to 0^{+}}\\left(2 - 2\\sqrt{s}\\right) = 2$.', wr: ['Diverges, because $\\frac{1}{\\sqrt{x}}$ blows up at $0$.', 'Converges to $1$.', 'Diverges, like $\\int_0^1 \\frac{dx}{x}$.'], st: ['The integrand blows up at $0$, so use a limit: $\\int_s^1 x^{-1/2}dx = 2 - 2\\sqrt{s}$.', 'As $s \\to 0^{+}$ this tends to $2$.', 'Near 0, $\\int_0^1 \\frac{dx}{x^{p}}$ converges exactly when $p < 1$. A function can blow up and still have finite area.'] },
      { I: '\\int_{0}^{1}\\ln x\\,dx', right: 'Converges to $-1$: $\\left[x\\ln x - x\\right]_s^1 \\to -1$ as $s \\to 0^{+}$.', wr: ['Diverges, because $\\ln x \\to -\\infty$ at $0$.', 'Converges to $0$.', 'Converges to $1$.'], st: ['By parts, $\\int \\ln x\\,dx = x\\ln x - x$.', 'At $1$: $-1$. As $s \\to 0^{+}$, $s\\ln s \\to 0$ (L\'Hôpital) and $s \\to 0$.', 'So the value is $-1$: finite, even though the integrand is unbounded.'] },
      { I: '\\int_{0}^{\\infty} e^{-x}\\,dx', right: 'Converges to $1$.', wr: ['Diverges, because the interval is infinite.', 'Converges to $0$.', 'Converges to $e$.'], st: ['$\\int_0^t e^{-x}dx = 1 - e^{-t}$.', '$e^{-t} \\to 0$, so the integral is $1$.'] },
      { I: '\\int_{-\\infty}^{\\infty} x\\,dx', right: 'Diverges: $\\int_0^\\infty x\\,dx$ is already infinite, so the whole integral diverges.', wr: ['Converges to $0$, by symmetry.', 'Converges to $\\infty - \\infty = 0$.', 'Converges to $1$.'], st: ['A two-sided improper integral is split at a point, and each half must converge on its own.', '$\\int_0^t x\\,dx = \\frac{t^{2}}{2} \\to \\infty$.', 'So it diverges. (Taking $\\lim_{t\\to\\infty}\\int_{-t}^{t}$ gives 0, but that is not the definition.)'] }
    ]);
    return done({
      q: 'Does $' + Dk.I + '$ converge or diverge? Choose the correct answer and reason.',
      a: mc(Dk.right, Dk.wr),
      steps: Dk.st,
      hint: 'Look for every place where the interval is infinite or the integrand blows up, and write each one as a limit.'
    }, null);
  });

  // a local helper for the custom checks above (numeric integral over [0, inf))
  function integInfLocal(f) { var s = 0, n = 20000; for (var i = 0; i < n; i++) { var t = (i + 0.5) / n, x = t / (1 - t); s += f(x) / ((1 - t) * (1 - t)); } return s / n; }

  var W_INF_C = ['Diverges, because for large $x$ it is smaller than $\\frac{1}{x}$, whose integral diverges.', 'Converges, because the integrand goes to 0 as $x \\to \\infty$.', 'Diverges, because a positive function on an infinite interval always has infinite area.'];
  var W_INF_D = ['Converges, because the integrand goes to 0 as $x \\to \\infty$.', 'Diverges, because a positive function on an infinite interval always has infinite area.', 'Converges, because for large $x$ it is smaller than $1$, and $1$ is a constant.'];
  var CMP = [
    { I: '\\int_{1}^{\\infty}\\frac{dx}{x^{2} + K}', conv: true, why: 'for $x \\ge 1$, $0 < \\frac{1}{x^{2} + K} \\le \\frac{1}{x^{2}}$, and $\\int_1^\\infty \\frac{dx}{x^{2}}$ converges', g: '\\frac{1}{x^{2}}' },
    { I: '\\int_{1}^{\\infty}\\frac{K + \\sin x}{x^{2}}\\,dx', conv: true, why: '$0 < \\frac{K + \\sin x}{x^{2}} \\le \\frac{K + 1}{x^{2}}$, and $\\int_1^\\infty \\frac{K + 1}{x^{2}}dx$ converges', g: '\\frac{K + 1}{x^{2}}' },
    { I: '\\int_{1}^{\\infty}\\frac{K + \\cos x}{x}\\,dx', conv: false, why: '$\\frac{K + \\cos x}{x} \\ge \\frac{K - 1}{x} > 0$, and $\\int_1^\\infty \\frac{K - 1}{x}dx$ diverges', g: '\\frac{K - 1}{x}', w3: 'Converges, because $\\frac{K + \\cos x}{x} \\le \\frac{K + 1}{x}$.' },
    { I: '\\int_{1}^{\\infty}\\frac{dx}{\\sqrt{x^{3} + K}}', conv: true, why: '$\\frac{1}{\\sqrt{x^{3} + K}} \\le \\frac{1}{x^{3/2}}$, and $\\int_1^\\infty x^{-3/2}dx$ converges ($p = \\frac{3}{2} > 1$)', g: '\\frac{1}{x^{3/2}}' },
    { I: '\\int_{2}^{\\infty}\\frac{dx}{\\ln x}', conv: false, why: 'for $x \\ge 2$, $\\ln x < x$, so $\\frac{1}{\\ln x} > \\frac{1}{x}$, and $\\int_2^\\infty \\frac{dx}{x}$ diverges', g: '\\frac{1}{x}', w3: 'Converges, because $\\frac{1}{\\ln x} < 1$ for $x > e$.' },
    { I: '\\int_{1}^{\\infty} e^{-x^{2}}\\,dx', conv: true, why: 'for $x \\ge 1$, $x^{2} \\ge x$, so $e^{-x^{2}} \\le e^{-x}$, and $\\int_1^\\infty e^{-x}dx$ converges', g: 'e^{-x}' },
    { I: '\\int_{1}^{\\infty}\\frac{x}{x^{3} + K}\\,dx', conv: true, why: '$\\frac{x}{x^{3} + K} \\le \\frac{x}{x^{3}} = \\frac{1}{x^{2}}$, and $\\int_1^\\infty \\frac{dx}{x^{2}}$ converges', g: '\\frac{1}{x^{2}}' },
    { I: '\\int_{1}^{\\infty}\\frac{dx}{x + e^{x}}', conv: true, why: '$\\frac{1}{x + e^{x}} \\le e^{-x}$, and $\\int_1^\\infty e^{-x}dx$ converges', g: 'e^{-x}' },
    { I: '\\int_{1}^{\\infty}\\frac{\\sqrt{x}}{x + K}\\,dx', conv: false, why: 'for $x \\ge K$, $x + K \\le 2x$, so $\\frac{\\sqrt{x}}{x + K} \\ge \\frac{1}{2\\sqrt{x}}$, and $\\int^\\infty \\frac{dx}{\\sqrt{x}}$ diverges', g: '\\frac{1}{2\\sqrt{x}}', w3: 'Converges, because $\\frac{\\sqrt{x}}{x + K} < \\frac{\\sqrt{x}}{x} = \\frac{1}{\\sqrt{x}}$.' },
    { I: '\\int_{1}^{\\infty}\\frac{dx}{x + K}', conv: false, why: 'for $x \\ge K$, $x + K \\le 2x$, so $\\frac{1}{x + K} \\ge \\frac{1}{2x}$, and $\\int^\\infty \\frac{dx}{2x}$ diverges', g: '\\frac{1}{2x}', w3: 'Converges, because $\\frac{1}{x + K} < \\frac{1}{x}$.' },
    { I: '\\int_{0}^{1}\\frac{dx}{x^{2} + \\sqrt{x}}', conv: true, zero: true, why: 'on $(0, 1]$, $\\frac{1}{x^{2} + \\sqrt{x}} \\le \\frac{1}{\\sqrt{x}}$, and $\\int_0^1 \\frac{dx}{\\sqrt{x}}$ converges', g: '\\frac{1}{\\sqrt{x}}', wr: ['Diverges, because the integrand blows up at $x = 0$.', 'Converges, because the interval has finite length.', 'Diverges, because on $(0, 1]$ it is at least $\\frac{1}{2}$.'] },
    { I: '\\int_{0}^{1}\\frac{e^{x}}{x}\\,dx', conv: false, zero: true, why: 'on $(0, 1]$, $\\frac{e^{x}}{x} \\ge \\frac{1}{x}$, and $\\int_0^1 \\frac{dx}{x}$ diverges', g: '\\frac{1}{x}', wr: ['Converges, because the interval has finite length.', 'Converges, because $e^{x} \\le e$ on the interval.', 'Diverges, because $e^{x}$ grows without bound.'] },
    { I: '\\int_{1}^{\\infty}\\frac{\\cos^{2} x}{x^{2}}\\,dx', conv: true, why: '$0 \\le \\frac{\\cos^{2} x}{x^{2}} \\le \\frac{1}{x^{2}}$, and $\\int_1^\\infty \\frac{dx}{x^{2}}$ converges', g: '\\frac{1}{x^{2}}' }
  ];
  G('calc2.improper-comparison', function (R, ctx) {
    var c = R.pick(CMP), K = R.int(2, 9), sub = function (s) { return s.replace(/K \+ 1/g, String(K + 1)).replace(/K - 1/g, String(K - 1)).replace(/\bK\b/g, String(K)); };
    var I = sub(c.I), why = sub(c.why), g = sub(c.g);
    var right = (c.conv ? 'Converges' : 'Diverges') + ': ' + why + '.';
    var wrongs = c.wr ? c.wr : c.conv ? W_INF_C.slice() : W_INF_D.slice(0, 2).concat([c.w3 ? sub(c.w3) : W_INF_D[2]]);
    return done({
      q: 'Does $' + I + '$ converge or diverge? Choose the answer with a correct reason.',
      a: mc(right, wrongs),
      steps: [
        'Compare with $' + g + '$, whose integral you know.',
        right,
        c.conv ? 'Direction matters: to show convergence, the integrand must be at most a function with a finite integral. Being smaller than a function with an infinite integral proves nothing.' : 'Direction matters: to show divergence, the integrand must be at least a positive function whose integral diverges. Being smaller than such a function proves nothing.'
      ],
      hint: 'Find a simpler function to compare with, and check which way the inequality goes.'
    }, null);
  });

  // ================================================================ UNIT 3: FIRST DIFFERENTIAL EQUATIONS

  // numeric residual check of candidate solutions (tests only): y as a plain string in x
  function odeResidual(yPlain, res, xs) {
    var f = function (x) { return ML.evalPlain(yPlain, { x: x }); }, h = 1e-4, worst = 0;
    xs.forEach(function (x) {
      var y = f(x), y1 = (f(x + h) - f(x - h)) / (2 * h), y2 = (f(x + h) - 2 * y + f(x - h)) / (h * h);
      if (isFinite(y) && isFinite(y1)) worst = Math.max(worst, Math.abs(res(x, y, y1, y2)) / Math.max(1, Math.abs(y), Math.abs(y1)));
    });
    return worst;
  }

  G('calc2.de-intro', function (R, ctx) {
    var shape = by(ctx, R.pick(['verify', 'order', 'verify', 'method']), R.pick(['rexp', 'ivp', 'const', 'verify']), R.pick(['rexp', 'ivp', 'const']));
    if (shape === 'method') {
      var k = R.int(2, 5);
      return done({
        q: 'To check that $y = e^{' + k + 'x}$ is a solution of $y\' = ' + k + 'y$, what must you show?',
        a: mc('That $y\' = ' + k + 'e^{' + k + 'x}$ equals $' + k + 'y = ' + k + 'e^{' + k + 'x}$ for every $x$.', ['That the equation holds at $x = 0$.', 'That $y$ is positive.', 'That $y(1) = ' + k + '$.']),
        steps: ['A solution is a function that makes the equation true for every $x$ in an interval, not just at one point.', 'Differentiate: $y\' = ' + k + 'e^{' + k + 'x}$. Substitute: $' + k + 'y = ' + k + 'e^{' + k + 'x}$. The two sides match for all $x$.', 'Checking a single point can be fooled: many functions agree with a solution at one point.'],
        hint: 'A solution must satisfy the equation as an identity in $x$.'
      }, null);
    }
    if (shape === 'verify') {
      var fam = R.pick(['exp', 'gauss', 'osc', 'second', 'euler', 'sq']), qT, right, wr, res, plains;
      if (fam === 'exp') { var k1 = R.pick([2, 3, -2, -1]), c = R.int(2, 5); qT = 'y\' = ' + cf(k1, 'y'); right = c + 'e^{' + cf(k1, 'x') + '}'; wr = [cf(k1, 'e^{x}'), 'e^{' + cf(k1, 'x') + '} + ' + c, c + 'xe^{' + cf(k1, 'x') + '}']; plains = [c + '*e^(' + k1 + '*x)', k1 + '*e^x', 'e^(' + k1 + '*x)+' + c, c + '*x*e^(' + k1 + '*x)']; res = function (x, y, y1) { return y1 - k1 * y; }; }
      else if (fam === 'gauss') { var a = R.pick([1, 2, 3]), a2 = Q(a, 2); qT = 'y\' = ' + cf(2 * a, 'x') + 'y'; right = 'e^{' + cf(a, 'x^{2}') + '}'; wr = ['e^{' + cf(2 * a, 'x') + '}', cf(a, 'x^{2}') + 'e^{x}', cf(2 * a, 'x') + 'e^{' + cf(a, 'x^{2}') + '}']; plains = ['e^(' + a + '*x^2)', 'e^(' + 2 * a + '*x)', a + '*x^2*e^x', 2 * a + '*x*e^(' + a + '*x^2)']; res = function (x, y, y1) { return y1 - 2 * a * x * y; }; }
      else if (fam === 'osc') { var w = R.int(2, 4), f0 = R.pick(['sin', 'cos']); qT = 'y\'\' + ' + w * w + 'y = 0'; right = '\\' + f0 + '(' + w + 'x)'; wr = ['\\' + f0 + '(' + w * w + 'x)', 'e^{' + w + 'x}', w + '\\' + f0 + ' x']; plains = [f0 + '(' + w + '*x)', f0 + '(' + w * w + '*x)', 'e^(' + w + '*x)', w + '*' + f0 + '(x)']; res = function (x, y, y1, y2) { return y2 + w * w * y; }; }
      else if (fam === 'second') { var r1 = R.pick([1, 2, 3, -1, -2]), r2 = R.intNot(-3, 3, [r1, 0, -r1]), p = -(r1 + r2), q2 = r1 * r2; qT = 'y\'\'' + T.coef(p, 'y\'', false) + T.coef(q2, 'y', false) + ' = 0'; right = 'e^{' + cf(r1, 'x') + '}'; wr = ['e^{' + cf(-r1, 'x') + '}', 'e^{' + cf(r1 + r2 === 0 ? r1 * 2 : r1 + r2, 'x') + '}', 'xe^{' + cf(r1, 'x') + '}']; plains = ['e^(' + r1 + '*x)', 'e^(' + -r1 + '*x)', 'e^(' + (r1 + r2 === 0 ? r1 * 2 : r1 + r2) + '*x)', 'x*e^(' + r1 + '*x)']; res = function (x, y, y1, y2) { return y2 + p * y1 + q2 * y; }; }
      else if (fam === 'euler') { var n = R.int(2, 4), c2 = R.int(2, 5); qT = 'xy\' = ' + n + 'y'; right = c2 + 'x^{' + n + '}'; wr = [n + 'x', 'x^{' + (n + 1) + '}', 'e^{' + n + 'x}']; plains = [c2 + '*x^' + n, n + '*x', 'x^' + (n + 1), 'e^(' + n + '*x)']; res = function (x, y, y1) { return x * y1 - n * y; }; }
      else { var c3 = R.int(1, 5); qT = 'y\' = y^{2}'; right = '\\frac{1}{' + c3 + ' - x}'; wr = ['\\frac{1}{x + ' + c3 + '}', 'e^{x}', 'x^{2}']; plains = ['1/(' + c3 + '-x)', '1/(x+' + c3 + ')', 'e^x', 'x^2']; res = function (x, y, y1) { return y1 - y * y; }; }
      return done({
        q: 'Which function is a solution of $' + qT + '$?',
        a: mc('$y = ' + right + '$', wr.map(function (s) { return '$y = ' + s + '$'; })),
        steps: ['Substitute each candidate, the whole function, and see whether both sides agree for every $x$.', 'For $y = ' + right + '$ the two sides match identically. ' + (fam === 'exp' ? 'Here $y\' = ' + cf(k1 * c, 'e^{' + cf(k1, 'x') + '}') + ' = ' + cf(k1, 'y') + '$.' : fam === 'gauss' ? 'Here $y\' = ' + cf(2 * a, 'x') + 'e^{' + cf(a, 'x^{2}') + '} = ' + cf(2 * a, 'x') + 'y$.' : fam === 'osc' ? 'Here $y\'\' = -' + w * w + '\\' + f0 + '(' + w + 'x) = -' + w * w + 'y$.' : fam === 'second' ? 'Here $y\' = ' + cf(r1, 'y') + '$ and $y\'\' = ' + cf(r1 * r1, 'y') + '$, and $' + r1 * r1 + T.signed(p * r1) + T.signed(q2) + ' = 0$.' : fam === 'euler' ? 'Here $xy\' = x\\cdot ' + c2 * n + 'x^{' + (n - 1) + '} = ' + n + 'y$.' : 'Here $y\' = \\frac{1}{(' + c3 + ' - x)^{2}} = y^{2}$.'), 'Each of the others leaves a mismatch that depends on $x$.'],
        hint: 'Differentiate the candidate and substitute into both sides.'
      }, { custom: function () { var xs = [0.3, 0.7, 1.1, -0.4, 0.15], good = odeResidual(plains[0], res, xs); if (good > 1e-4) return 'correct choice fails: ' + good; for (var i = 1; i < plains.length; i++) if (odeResidual(plains[i], res, xs) < 1e-4) return 'wrong choice ' + plains[i] + ' solves it'; return ''; } });
    }
    if (shape === 'order') {
      var ord = R.int(1, 4), DT = ['y', 'y\'', 'y\'\'', 'y\'\'\'', 'y^{(4)}'], trap = R.chance(0.35) && ord < 4;
      var terms = [DT[ord]], lower = R.sample([0, 1, 2, 3].filter(function (i) { return i < ord; }), Math.min(ord, 2));
      if (trap) terms = ['(' + DT[ord] + ')^{' + R.int(2, 3) + '}'];
      lower.forEach(function (i) { terms.push(R.pick([R.int(2, 6) + '', 'x', 'x^{2}', '']) + DT[i]); });
      var rhs = R.pick(['\\sin x', 'e^{x}', '0', 'x^{3}', '5']);
      return done({
        q: 'What is the order of the differential equation $' + R.shuffle(terms).join(' + ') + ' = ' + rhs + '$?',
        a: { t: 'num', v: String(ord), form: 'int' },
        steps: ['The order is the highest derivative that appears, not the highest power.', 'The highest derivative here is $' + DT[ord] + '$' + (trap ? ' (it is raised to a power, but that does not change the order)' : '') + '.', 'So the order is ' + ord + '.'],
        hint: 'Look for the derivative with the most primes.'
      }, null);
    }
    if (shape === 'rexp') {
      var ra = R.int(-4, 4), rb = R.intNot(-4, 4, ra), pc = -(ra + rb), qc = ra * rb;
      return done({
        q: 'For which values of $r$ is $y = e^{rx}$ a solution of $y\'\'' + T.coef(pc, 'y\'', false) + T.coef(qc, 'y', false) + ' = 0$?',
        a: { t: 'set', v: [String(ra), String(rb)] },
        steps: [
          'For $y = e^{rx}$: $y\' = re^{rx}$ and $y\'\' = r^{2}e^{rx}$.',
          'Substitute: $\\left(r^{2}' + T.coef(pc, 'r', false) + T.signed(qc) + '\\right)e^{rx} = 0$.',
          '$e^{rx}$ is never 0, so $r^{2}' + T.coef(pc, 'r', false) + T.signed(qc) + ' = 0$, that is $' + factorTex(1, ra, rb, 'r') + ' = 0$.',
          'So $r = ' + ra + '$ or $r = ' + rb + '$.'
        ],
        hint: 'Substitute $y = e^{rx}$ and divide out the exponential.'
      }, { custom: function () { var e = function (r) { return r * r + pc * r + qc; }; return e(ra) === 0 && e(rb) === 0 ? '' : 'roots wrong'; } });
    }
    if (shape === 'const') {
      var A = R.int(-4, 4), B = R.intNot(-4, 4, A), kind = R.pick(['prod', 'sq']);
      var eqT, sol;
      if (kind === 'prod') { eqT = factorTex(1, A, B, 'y'); sol = [String(A), String(B)]; if (R.coin()) eqT = R.int(2, 5) + eqT; }
      else { var m = R.int(1, 5); eqT = 'y^{2} - ' + m * m; sol = [String(m), String(-m)]; A = m; B = -m; }
      return done({
        q: 'Find every constant solution of $y\' = ' + eqT + '$.',
        a: { t: 'set', v: sol },
        steps: ['A constant function has $y\' = 0$, so it solves the equation exactly when the right side is 0 at that value of $y$.', 'Solve $' + eqT + ' = 0$: $y = ' + A + '$ or $y = ' + B + '$.', 'So $y = ' + A + '$ and $y = ' + B + '$ are solutions (equilibrium solutions).'],
        hint: 'Set the right side equal to 0.'
      }, null);
    }
    var fam2 = R.pick(['exp', 'shift', 'poly', 'recip']), x0, y0, Cv, gen, eqT2, st;
    if (fam2 === 'exp') { var k2 = R.pick([1, 2, -1, 3]); x0 = 0; y0 = R.nz(-6, 9); Cv = Q(y0); gen = 'y = Ce^{' + cf(k2, 'x') + '}'; eqT2 = 'y\' = ' + cf(k2, 'y'); st = ['At $x = 0$: $' + y0 + ' = Ce^{0} = C$.']; }
    else if (fam2 === 'shift') { var k3 = R.pick([2, -1, -2, 3]), mm = R.nz(-5, 5); x0 = 0; y0 = R.intNot(-6, 9, mm); Cv = Q(y0 - mm); gen = 'y = Ce^{' + cf(k3, 'x') + '}' + T.signed(mm); eqT2 = 'y\' = ' + k3 + '(y' + T.signed(-mm) + ')'; st = ['At $x = 0$: $' + y0 + ' = C' + T.signed(mm) + '$.', 'So $C = ' + Cv.toTex() + '$.']; }
    else if (fam2 === 'poly') { var n = R.int(2, 3), cc = R.int(1, 3); x0 = R.int(1, 2); y0 = R.int(-5, 8); Cv = Q(y0).sub(Q(cc * Math.pow(x0, n), n)); gen = 'y = ' + cf(Q(cc, n), 'x^{' + n + '}') + ' + C'; eqT2 = 'y\' = ' + cf(cc, 'x^{' + (n - 1) + '}'); st = ['At $x = ' + x0 + '$: $' + y0 + ' = ' + tx(Q(cc * Math.pow(x0, n), n)) + ' + C$.', 'So $C = ' + Cv.toTex() + '$.']; }
    else { x0 = R.int(1, 4); y0 = R.nz(-5, 6); Cv = Q(x0 * y0); gen = 'y = \\frac{C}{x}'; eqT2 = 'xy\' = -y'; st = ['At $x = ' + x0 + '$: $' + y0 + ' = \\frac{C}{' + x0 + '}$.', 'So $C = ' + Cv.toTex() + '$.']; }
    return done({
      q: 'Every solution of $' + eqT2 + '$ has the form $' + gen + '$. Find $C$ for the solution with $y(' + x0 + ') = ' + y0 + '$.',
      a: { t: 'num', v: Cv.toPlain() },
      steps: ['An initial condition picks one curve out of the family: substitute $x = ' + x0 + '$ and $y = ' + y0 + '$ into the general solution.'].concat(st),
      hint: 'Plug the initial point into the general solution and solve for $C$.'
    }, null);
  });

  G('calc2.slope-fields-euler', function (R, ctx) {
    var shape = by(ctx, R.pick(['euler', 'slope', 'euler']), R.pick(['euler', 'iso', 'match', 'euler']), R.pick(['euler', 'match', 'iso']));
    var a = R.int(-2, 2), b = R.nz(-2, 2), c = R.int(-2, 2); if (a === 0 && c === 0) c = 1;
    var fT = T.terms([[a, 'x'], [b, 'y'], [c, '']]), fP = ps([[a, 'x'], [b, 'y'], [c, '']]);
    function f(x, y) { return Q(a).mul(x).add(Q(b).mul(y)).add(c); }
    if (shape === 'slope') {
      var fam = R.pick(['lin', 'prod', 'quad']), x1 = R.int(-3, 3), y1 = R.int(-3, 3), val, ft;
      if (fam === 'lin') { ft = fT; val = f(x1, y1); }
      else if (fam === 'prod') { var k = R.int(1, 3); ft = cf(k, 'xy') + ' - x'; val = Q(k * x1 * y1 - x1); }
      else { ft = 'x^{2} - y'; val = Q(x1 * x1 - y1); }
      return done({
        q: 'In the slope field of $\\frac{dy}{dx} = ' + ft + '$, what is the slope of the little segment at the point $(' + x1 + ', ' + y1 + ')$?',
        a: { t: 'num', v: val.toPlain() },
        steps: ['A slope field draws, at each point $(x, y)$, a short segment whose slope is the value of the right side there.', 'At $(' + x1 + ', ' + y1 + ')$: $' + ft.replace(/x/g, '(' + x1 + ')').replace(/y/g, '(' + y1 + ')') + ' = ' + val.toTex() + '$.'],
        hint: 'Substitute the point into the right side.',
        nolint: ['--', '+ -']
      }, null);
    }
    if (shape === 'iso') {
      var mS = Q(-a, b), kS = Q(-c, b);
      return done({
        q: 'Where are the slopes in the slope field of $\\frac{dy}{dx} = ' + fT + '$ equal to 0? Give the equation of that curve.',
        a: { t: 'eq', v: 'y = ' + ps([[mS, 'x'], [kS, '']]) },
        steps: ['The slope is 0 exactly where the right side is 0: $' + fT + ' = 0$.', 'Solve for $y$: $y = ' + T.terms([[mS, 'x'], [kS, '']]) + '$.', 'Along this line every segment is horizontal. Solution curves can only have a peak or a valley where they cross it.'],
        hint: 'Set the right side equal to 0 and solve for $y$.'
      }, null);
    }
    if (shape === 'match') {
      var props = [
        { p: 'Along every vertical line, all the segments are parallel (the slopes depend only on $x$).', e: 'y\' = x^{2} - 1' },
        { p: 'Along every horizontal line, all the segments are parallel (the slopes depend only on $y$), and they are flat along $y = 0$ and $y = 2$.', e: 'y\' = y(2 - y)' },
        { p: 'The segments are horizontal along the line $y = x$, point upward below it and downward above it.', e: 'y\' = x - y' },
        { p: 'The segments are horizontal along both axes, and point upward in the first and third quadrants.', e: 'y\' = xy' }
      ], pick = R.int(0, 3);
      return done({
        q: 'A slope field has this pattern: ' + props[pick].p + ' Which differential equation does it belong to?',
        a: mc('$' + props[pick].e + '$', props.filter(function (_, i) { return i !== pick; }).map(function (o) { return '$' + o.e + '$'; })),
        steps: ['$y\' = x^{2} - 1$ has no $y$, so slopes depend on $x$ only. $y\' = y(2 - y)$ has no $x$, so slopes depend on $y$ only, and vanish at $y = 0, 2$.', '$y\' = x - y$ is 0 on $y = x$, positive when $y < x$, negative when $y > x$. $y\' = xy$ is 0 on both axes and positive when $x$ and $y$ have the same sign.', 'So the match is $' + props[pick].e + '$.'],
        hint: 'Ask: which variables appear on the right side, and where is it zero?'
      }, null);
    }
    // Euler
    var hq = by(ctx, R.pick([Q(1, 2), Q(1)]), R.pick([Q(1, 2), Q(1, 4), Q(1, 10)]), R.pick([Q(1, 2), Q(1, 4), Q(1, 10)])), n = by(ctx, 2, R.pick([2, 3]), 3);
    var x = Q(R.int(-1, 1)), y = Q(R.int(-2, 3)), x00 = x, y00 = y, rows = [];
    for (var i = 0; i < n; i++) {
      var m = f(x, y), yn = y.add(hq.mul(m));
      rows.push('Step ' + (i + 1) + ': at $(' + dec(x) + ', ' + dec(y) + ')$ the slope is $' + dec(m) + '$, so $y_{' + (i + 1) + '} = ' + dec(y) + ' + ' + dec(hq) + '\\cdot ' + T.p(dec(m)) + ' = ' + dec(yn) + '$ at $x = ' + dec(x.add(hq)) + '$.');
      x = x.add(hq); y = yn;
    }
    return done({
      q: 'Use Euler\'s method with step size $h = ' + dec(hq) + '$ to approximate $y(' + dec(x) + ')$ for $\\frac{dy}{dx} = ' + fT + '$, $y(' + dec(x00) + ') = ' + dec(y00) + '$.',
      a: { t: 'num', v: y.toPlain() },
      steps: ['Euler\'s method: $y_{n+1} = y_n + h\\cdot f(x_n, y_n)$, using the slope at the point you are at now.'].concat(rows).concat(['So $y(' + dec(x) + ') \\approx ' + dec(y) + '$.']),
      hint: 'Each step: find the slope at the current point, then move $h$ to the right along that slope.',
      viz: { name: 'slopefield', opts: { quiet: true, f: fP, point: [x00.toNumber(), y00.toNumber()], euler: true, h: hq.toNumber(), xmin: -3, xmax: 4, ymin: -4, ymax: 5 } },
      nolint: ['--', '+ -', '+ 0']
    }, { custom: function () { var X = x00.toNumber(), Y = y00.toNumber(), hh = hq.toNumber(); for (var j = 0; j < n; j++) { Y += hh * (a * X + b * Y + c); X += hh; } return Math.abs(Y - y.toNumber()) < 1e-9 ? '' : 'euler ' + Y + ' vs ' + y.toNumber(); } });
  });

  G('calc2.separable-equations', function (R, ctx) {
    var shape = by(ctx, R.pick(['exp', 'xy', 'shift']), R.pick(['xy', 'sqrt', 'shift', 'lost']), R.pick(['recip', 'expo', 'tan', 'sqrt', 'sqrt', 'expo']));
    var odeChk = function (yP, rhs, v, x0, y0) { return { custom: function () {
      var Y = function (t) { var e = {}; e[v] = t; return ML.evalPlain(yP, e); }, h = 1e-5, bad = '';
      if (Math.abs(Y(x0) - y0) > 1e-9) return 'initial value ' + Y(x0) + ' vs ' + y0;
      [x0 + 0.13, x0 + 0.31, x0 - 0.17, x0 + 0.44].forEach(function (t) { var y = Y(t), d = (Y(t + h) - Y(t - h)) / (2 * h); if (isFinite(y) && Math.abs(d - rhs(t, y)) > 1e-5 * Math.max(1, Math.abs(d))) bad = 'ode residual at ' + t; });
      return bad;
    } }; };
    if (shape === 'lost') {
      var A = R.nz(-4, 4), gx = R.pick(['x', 'x^{2}', '\\cos x', 'e^{x}']);
      return done({
        q: 'To solve $y\' = ' + gx + '\\,(y' + T.signed(-A) + ')$ you divide both sides by $y' + T.signed(-A) + '$. That step loses one solution, a constant. What is it? (Type the value of $y$.)',
        a: { t: 'num', v: String(A) },
        steps: ['Dividing by $y' + T.signed(-A) + '$ is only allowed where $y' + T.signed(-A) + ' \\ne 0$.', 'Check $y = ' + A + '$ directly: $y\' = 0$ and the right side is $' + gx + '\\cdot 0 = 0$, so it is a solution.', 'The separated solution $y = ' + A + ' + Ke^{\\ldots}$ only covers it if you allow $K = 0$, so state it separately: $y = ' + A + '$.'],
        hint: 'Which value of $y$ makes the divisor zero?'
      }, null);
    }
    if (shape === 'exp') {
      var k = R.pick([2, 3, -1, -2, Q(1, 2)]), y0 = R.nz(-5, 9), v = R.pick(['x', 't']), kq = Qf(k), kv = cf(kq, v);
      return done({
        q: 'Solve $\\frac{dy}{d' + v + '} = ' + cf(kq, 'y') + '$ with $y(0) = ' + y0 + '$.',
        a: { t: 'expr', v: ps([[y0, 'e^(' + ps([[kq, v]]) + ')']]), vars: [v] },
        steps: [
          'Separate: $\\frac{dy}{y} = ' + tx(kq) + '\\,d' + v + '$.',
          'Integrate both sides: $\\ln|y| = ' + kv + ' + C$.',
          'Exponentiate: $|y| = e^{C}e^{' + kv + '}$, so $y = Ke^{' + kv + '}$ with $K = \\pm e^{C}$ (and $K = 0$ gives the solution $y = 0$).',
          'Use $y(0) = ' + y0 + '$: $K = ' + y0 + '$. So $y = ' + cf(y0, 'e^{' + kv + '}') + '$.'
        ],
        hint: 'Put all the $y$\'s with $dy$ and all the $' + v + '$\'s with $d' + v + '$, then integrate.'
      }, odeChk(ps([[y0, 'e^(' + ps([[kq, v]]) + ')']]), function (t, y) { return kq.toNumber() * y; }, v, 0, y0));
    }
    if (shape === 'xy') {
      var a = R.int(1, 3), nx = R.int(1, 2), y1 = R.nz(-4, 6), co = Q(a, nx + 1), xp = nx === 1 ? 'x' : 'x^{2}', ex = cf(co, 'x^{' + (nx + 1) + '}');
      var ansP = ps([[y1, 'e^(' + ps([[co, 'x^' + (nx + 1)]]) + ')']]);
      return done({
        q: 'Solve $\\frac{dy}{dx} = ' + cf(a, xp) + 'y$ with $y(0) = ' + y1 + '$.',
        a: { t: 'expr', v: ansP, vars: ['x'] },
        steps: [
          'Separate: $\\frac{dy}{y} = ' + cf(a, xp) + '\\,dx$.',
          'Integrate: $\\ln|y| = ' + ex + ' + C$.',
          'Exponentiate: $y = Ke^{' + ex + '}$.',
          'At $x = 0$: $K = ' + y1 + '$. So $y = ' + cf(y1, 'e^{' + ex + '}') + '$.'
        ],
        hint: 'Divide by $y$ and integrate both sides.'
      }, odeChk(ansP, function (t, y) { return a * Math.pow(t, nx) * y; }, 'x', 0, y1));
    }
    if (shape === 'shift') {
      var newton = R.coin(), v2 = newton ? 't' : 'x', M0 = newton ? R.pick([20, 25, 70]) : R.nz(-4, 6), y02 = newton ? R.pick([90, 100, 5, 37]) : R.intNot(-6, 9, M0);
      var kk = newton ? R.pick([Q(1, 10), Q(1, 5), Q(1, 2)]).neg() : Qf(R.pick([2, -1, -3, 1])), name = newton ? 'T' : 'y';
      var ansP2 = ps([[M0, ''], [y02 - M0, 'e^(' + ps([[kk, v2]]) + ')']]);
      return done({
        q: newton ? 'A drink at $' + y02 + '^\\circ$C sits in a room at $' + M0 + '^\\circ$C. Its temperature follows Newton\'s law of cooling, $\\frac{dT}{dt} = ' + tx(kk) + '(T - ' + M0 + ')$ ($t$ in minutes). Find $T(t)$.'
          : 'Solve $\\frac{dy}{dx} = ' + cf(kk, '(y' + T.signed(-M0) + ')') + '$ with $y(0) = ' + y02 + '$.',
        a: { t: 'expr', v: ansP2, vars: [v2] },
        steps: [
          'Separate: $\\frac{d' + name + '}{' + name + T.signed(-M0) + '} = ' + tx(kk) + '\\,d' + v2 + '$.',
          'Integrate: $\\ln|' + name + T.signed(-M0) + '| = ' + cf(kk, v2) + ' + C$, so $' + name + T.signed(-M0) + ' = Ke^{' + cf(kk, v2) + '}$.',
          'At $' + v2 + ' = 0$: $K = ' + y02 + T.signed(-M0) + ' = ' + (y02 - M0) + '$.',
          '$' + name + ' = ' + M0 + T.coef(y02 - M0, 'e^{' + cf(kk, v2) + '}', false) + '$.'
        ],
        hint: 'Treat $' + name + T.signed(-M0) + '$ as one block: divide by it and integrate.'
      }, odeChk(ansP2, function (t, y) { return kk.toNumber() * (y - M0); }, v2, 0, y02));
    }
    if (shape === 'sqrt') {
      var a3 = R.int(1, 8), sgn = R.coin() ? 1 : -1, c3 = R.pick([1, 1, 2, 3, 4]);
      // y y' = sgn * c3 * x  ->  y^2 = sgn*c3*x^2 + a3^2
      var negY = R.chance(0.3), ansP3 = (negY ? '-' : '') + 'sqrt(' + ps([[sgn * c3, 'x^2'], [a3 * a3, '']]) + ')';
      return done({
        q: 'Solve $\\frac{dy}{dx} = ' + (sgn < 0 ? '-' : '') + '\\frac{' + (c3 === 1 ? '' : c3) + 'x}{y}$ with $y(0) = ' + (negY ? -a3 : a3) + '$.',
        a: { t: 'expr', v: ansP3, vars: ['x'] },
        steps: [
          'Separate: $y\\,dy = ' + cf(sgn * c3, 'x') + '\\,dx$.',
          'Integrate: $\\frac{y^{2}}{2} = ' + cf(Q(sgn * c3, 2), 'x^{2}') + ' + C$, so $y^{2} = ' + cf(sgn * c3, 'x^{2}') + ' + 2C$.',
          'At $x = 0$: $' + a3 * a3 + ' = 2C$. So $y^{2} = ' + T.terms([[sgn * c3, 'x^{2}'], [a3 * a3, '']]) + '$.',
          negY ? 'Since $y(0) < 0$, take the negative root: $y = -\\sqrt{' + T.terms([[sgn * c3, 'x^{2}'], [a3 * a3, '']]) + '}$.' : 'Since $y(0) > 0$, take the positive root: $y = \\sqrt{' + T.terms([[sgn * c3, 'x^{2}'], [a3 * a3, '']]) + '}$.'
        ],
        hint: 'Multiply both sides by $y\\,dx$, then integrate.'
      }, odeChk(ansP3, function (t, y) { return sgn * c3 * t / y; }, 'x', 0, negY ? -a3 : a3));
    }
    if (shape === 'recip') {
      var y04 = R.int(1, 8), k4 = R.pick([1, 2, 3, 4, 5].filter(function (k) { return k * y04 <= 8; })); // y' = k x y^2 -> -1/y = k x^2/2 - 1/y0 -> y = 2 y0 / (2 - k y0 x^2)
      var ansP4 = (2 * y04) + '/(2-' + k4 * y04 + '*x^2)';
      return done({
        q: 'Solve $\\frac{dy}{dx} = ' + cf(k4, 'x') + 'y^{2}$ with $y(0) = ' + y04 + '$.',
        a: { t: 'expr', v: ansP4, vars: ['x'] },
        steps: [
          'Separate: $\\frac{dy}{y^{2}} = ' + cf(k4, 'x') + '\\,dx$.',
          'Integrate: $-\\frac{1}{y} = ' + cf(Q(k4, 2), 'x^{2}') + ' + C$.',
          'At $x = 0$: $-\\frac{1}{' + y04 + '} = C$.',
          'So $\\frac{1}{y} = \\frac{1}{' + y04 + '} - ' + cf(Q(k4, 2), 'x^{2}') + '$, and $y = \\frac{' + 2 * y04 + '}{2 - ' + cf(k4 * y04, 'x^{2}') + '}$.',
          'Add the constant before you solve for $y$; adding it at the end would give a different (wrong) family.'
        ],
        hint: 'After integrating, add $C$ right away, then solve for $y$.'
      }, odeChk(ansP4, function (t, y) { return k4 * t * y * y; }, 'x', 0, y04));
    }
    if (shape === 'expo' && R.coin()) { // y' = e^{kx - y}, y(0) = ln c -> e^y = (e^{kx} + kc - 1)/k
      var ke = R.int(2, 4), ce = R.int(1, 6), Ce = Q(ke * ce - 1, ke), kxe = ke + 'x';
      var ansPe = 'ln((e^(' + ke + '*x)+' + (ke * ce - 1) + ')/' + ke + ')';
      return done({
        q: 'Solve $\\frac{dy}{dx} = e^{' + kxe + ' - y}$ with $y(0) = ' + (ce === 1 ? '0' : '\\ln ' + ce) + '$.',
        a: { t: 'expr', v: ansPe, vars: ['x'] },
        steps: [
          'Write $e^{' + kxe + ' - y} = e^{' + kxe + '}e^{-y}$ and separate: $e^{y}\\,dy = e^{' + kxe + '}\\,dx$.',
          'Integrate: $e^{y} = \\frac{1}{' + ke + '}e^{' + kxe + '} + C$.',
          'At $x = 0$: $' + ce + ' = \\frac{1}{' + ke + '} + C$, so $C = ' + tx(Ce) + '$.',
          'So $e^{y} = \\frac{e^{' + kxe + '} + ' + (ke * ce - 1) + '}{' + ke + '}$. Take logs: $y = \\ln\\left(\\frac{e^{' + kxe + '} + ' + (ke * ce - 1) + '}{' + ke + '}\\right)$.'
        ],
        hint: 'Split $e^{' + kxe + ' - y}$ into a product first.'
      }, odeChk(ansPe, function (t, y) { return Math.exp(ke * t - y); }, 'x', 0, Math.log(ce)));
    }
    if (shape === 'expo') {
      var c5 = R.pick([2, 3, 4, 5, 6, 7, 9, 10]); // y' = e^{x - y}, y(0) = ln c5 -> e^y = e^x + c5 - 1
      var ansP5 = 'ln(e^x+' + (c5 - 1) + ')';
      return done({
        q: 'Solve $\\frac{dy}{dx} = e^{x - y}$ with $y(0) = \\ln ' + c5 + '$.',
        a: { t: 'expr', v: ansP5, vars: ['x'] },
        steps: [
          'Write $e^{x - y} = e^{x}e^{-y}$ and separate: $e^{y}\\,dy = e^{x}\\,dx$.',
          'Integrate: $e^{y} = e^{x} + C$.',
          'At $x = 0$: $' + c5 + ' = 1 + C$, so $C = ' + (c5 - 1) + '$.',
          'Take logs: $y = \\ln\\left(e^{x} + ' + (c5 - 1) + '\\right)$.'
        ],
        hint: 'Split $e^{x - y}$ into a product first.'
      }, odeChk(ansP5, function (t, y) { return Math.exp(t - y); }, 'x', 0, Math.log(c5)));
    }
    var k6 = R.int(1, 5); // y' = k (1 + y^2), y(0) = 0 -> tan(kx)
    if (R.coin()) { // y' = k(a^2 + y^2), y(0) = 0 -> y = a tan(a k x)
      var at = R.int(2, 4), kt = R.int(1, 2), akt = at * kt, ansPt = at + '*tan(' + akt + '*x)';
      return done({
        q: 'Solve $\\frac{dy}{dx} = ' + (kt === 1 ? '' : kt) + '(' + at * at + ' + y^{2})$ with $y(0) = 0$.',
        a: { t: 'expr', v: ansPt, vars: ['x'] },
        steps: ['Separate: $\\frac{dy}{' + at * at + ' + y^{2}} = ' + (kt === 1 ? '' : kt) + '\\,dx$.', 'Integrate: $\\frac{1}{' + at + '}\\arctan\\frac{y}{' + at + '} = ' + cf(kt, 'x') + ' + C$.', 'At $x = 0$: $C = 0$. So $\\arctan\\frac{y}{' + at + '} = ' + akt + 'x$ and $y = ' + at + '\\tan(' + akt + 'x)$ (on the interval around 0 where it is defined).'],
        hint: 'Use $\\int \\frac{dy}{a^{2} + y^{2}} = \\frac{1}{a}\\arctan\\frac{y}{a}$.'
      }, odeChk(ansPt, function (t, y) { return kt * (at * at + y * y); }, 'x', 0, 0));
    }
    return done({
      q: 'Solve $\\frac{dy}{dx} = ' + (k6 === 1 ? '' : k6) + '(1 + y^{2})$ with $y(0) = 0$.',
      a: { t: 'expr', v: 'tan(' + (k6 === 1 ? 'x' : k6 + '*x') + ')', vars: ['x'] },
      steps: ['Separate: $\\frac{dy}{1 + y^{2}} = ' + (k6 === 1 ? '' : k6) + '\\,dx$.', 'Integrate: $\\arctan y = ' + cf(k6, 'x') + ' + C$.', 'At $x = 0$: $C = 0$. So $y = \\tan(' + cf(k6, 'x') + ')$ (on the interval around 0 where it is defined).'],
      hint: 'The left side integrates to an arctangent.'
    }, odeChk('tan(' + k6 + '*x)', function (t, y) { return k6 * (1 + y * y); }, 'x', 0, 0));
  });

  G('calc2.logistic-equation', function (R, ctx) {
    var shape = by(ctx, R.pick(['K', 'equil', 'half']), R.pick(['solve', 'K', 'when', 'above']), R.pick(['solve', 'when', 'value']));
    var K = R.pick([100, 200, 500, 1000, 60, 120]), Aopts = [1, 2, 3, 4, 5, 9].filter(function (A) { return K % (A + 1) === 0; }), A = R.pick(Aopts), P0 = K / (A + 1);
    var r = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4), Q(1, 5)]), rT = tx(r);
    var eqT = '\\frac{dP}{dt} = ' + (r.eq(1) ? '' : rT) + 'P\\left(1 - \\frac{P}{' + K + '}\\right)';
    if (shape === 'K') {
      var expanded = R.coin();
      if (expanded) {
        var bq = r.div(K);
        return done({
          q: 'A population follows $\\frac{dP}{dt} = ' + (r.eq(1) ? '' : dec(r)) + 'P - ' + dec(bq) + 'P^{2}$. What is its carrying capacity?',
          a: { t: 'num', v: String(K) },
          steps: ['Factor out the growth rate: $' + (r.eq(1) ? '' : dec(r)) + 'P - ' + dec(bq) + 'P^{2} = ' + (r.eq(1) ? '' : dec(r)) + 'P\\left(1 - ' + (r.eq(1) ? dec(bq) + 'P' : '\\frac{' + dec(bq) + '}{' + dec(r) + '}P') + '\\right) = ' + (r.eq(1) ? '' : dec(r)) + 'P\\left(1 - \\frac{P}{' + K + '}\\right)$.', 'Compare with $rP\\left(1 - \\frac{P}{K}\\right)$: $K = ' + K + '$.', 'Check: the growth rate is 0 at $P = ' + K + '$.'],
          hint: 'Where is $\\frac{dP}{dt} = 0$ (besides $P = 0$)?'
        }, null);
      }
      return done({
        q: 'For $' + eqT + '$, what value does $P(t)$ approach as $t \\to \\infty$ if $P(0) = ' + P0 + '$?',
        a: { t: 'num', v: String(K) },
        steps: ['For $0 < P < ' + K + '$, $\\frac{dP}{dt} > 0$: the population grows.', 'The growth slows as $P$ nears ' + K + ', where $\\frac{dP}{dt} = 0$.', 'So $P(t) \\to ' + K + '$, the carrying capacity.'],
        hint: 'Find where the growth rate is 0.'
      }, null);
    }
    if (shape === 'equil') {
      return done({
        q: 'Find the equilibrium (constant) solutions of $' + eqT + '$.',
        a: { t: 'set', v: ['0', String(K)] },
        steps: ['Constant solutions have $\\frac{dP}{dt} = 0$.', '$' + (r.eq(1) ? '' : rT) + 'P\\left(1 - \\frac{P}{' + K + '}\\right) = 0$ when $P = 0$ or $P = ' + K + '$.'],
        hint: 'Set the right side to 0.'
      }, null);
    }
    if (shape === 'half') {
      return done({
        q: 'For $' + eqT + '$, at what population $P$ is the growth rate $\\frac{dP}{dt}$ the largest?',
        a: { t: 'num', v: String(K / 2) },
        steps: ['$\\frac{dP}{dt} = ' + (r.eq(1) ? '' : rT) + '\\left(P - \\frac{P^{2}}{' + K + '}\\right)$ is a downward parabola in $P$.', 'Its vertex is halfway between its zeros $P = 0$ and $P = ' + K + '$.', 'So the growth is fastest at $P = ' + K / 2 + '$, half the carrying capacity.'],
        hint: 'As a function of $P$, the right side is a parabola.'
      }, null);
    }
    if (shape === 'above') {
      return done({
        q: 'For $' + eqT + '$, suppose $P(0) = ' + (K + K / 2) + '$. What happens to $P(t)$?',
        a: mc('It decreases toward ' + K + '.', ['It increases without bound.', 'It decreases toward 0.', 'It stays at ' + (K + K / 2) + '.']),
        steps: ['For $P > ' + K + '$, $1 - \\frac{P}{' + K + '} < 0$, so $\\frac{dP}{dt} < 0$: the population falls.', 'It cannot cross the equilibrium $P = ' + K + '$ (solutions do not cross), so it levels off toward ' + K + '.'],
        hint: 'What is the sign of $\\frac{dP}{dt}$ when $P$ is above the carrying capacity?'
      }, null);
    }
    var ansP = K + '/(1+' + (A === 1 ? '' : A + '*') + 'e^(' + ps([[r.neg(), 't']]) + '))';
    var solT = '\\frac{' + K + '}{1 + ' + (A === 1 ? '' : A) + 'e^{' + cf(r.neg(), 't') + '}}';
    var solveSteps = ['The solution of the logistic equation is $P = \\frac{K}{1 + Ae^{-rt}}$ with $A = \\frac{K - P_0}{P_0}$ (separate, then use partial fractions).', 'Here $K = ' + K + '$, $r = ' + rT + '$, $A = \\frac{' + K + ' - ' + P0 + '}{' + P0 + '} = ' + A + '$.'];
    if (shape === 'solve') {
      return done({
        q: 'Solve $' + eqT + '$ with $P(0) = ' + P0 + '$.',
        a: { t: 'expr', v: ansP, vars: ['t'] },
        steps: solveSteps.concat(['$P(t) = ' + solT + '$. Check: $P(0) = \\frac{' + K + '}{1 + ' + A + '} = ' + P0 + '$.']),
        hint: 'Use $P = \\frac{K}{1 + Ae^{-rt}}$ and find $A$ from $P(0)$.'
      }, { custom: function () { var P = function (t) { return ML.evalPlain(ansP, { t: t }); }, h = 1e-5, bad = ''; if (Math.abs(P(0) - P0) > 1e-9) return 'P0'; [0.5, 1.3, 2.2].forEach(function (t) { var y = P(t), d = (P(t + h) - P(t - h)) / (2 * h); if (Math.abs(d - r.toNumber() * y * (1 - y / K)) > 1e-5 * Math.max(1, d)) bad = 'logistic ode'; }); return bad; } });
    }
    if (shape === 'when') {
      if (A === 1) { A = 3; P0 = K / 4; if (K % 4) { K = 100; P0 = 25; } }
      var tP = 'ln(' + A + ')/(' + r.toPlain() + ')', tT = r.eq(1) ? '\\ln ' + A : '\\frac{\\ln ' + A + '}{' + rT + '}';
      if (r.n === 1n) { tP = r.d === 1n ? 'ln(' + A + ')' : r.d + '*ln(' + A + ')'; tT = (r.d === 1n ? '' : r.d) + '\\ln ' + A; }
      return done({
        q: 'A population follows $\\frac{dP}{dt} = ' + (r.eq(1) ? '' : rT) + 'P\\left(1 - \\frac{P}{' + K + '}\\right)$ with $P(0) = ' + P0 + '$. At what time is it growing fastest? Give an exact answer.',
        a: { t: 'num', v: tP },
        steps: ['Growth is fastest when $P = \\frac{K}{2} = ' + K / 2 + '$.', 'With $A = \\frac{' + K + ' - ' + P0 + '}{' + P0 + '} = ' + A + '$, $P = \\frac{' + K + '}{1 + ' + A + 'e^{' + cf(r.neg(), 't') + '}}$.', 'Set $P = ' + K / 2 + '$: $1 + ' + A + 'e^{' + cf(r.neg(), 't') + '} = 2$, so $e^{' + cf(r.neg(), 't') + '} = \\frac{1}{' + A + '}$.', 'Take logs: $' + cf(r, 't') + ' = \\ln ' + A + '$, so $t = ' + tT + '$.'],
        hint: 'Fastest growth happens at half the carrying capacity. Solve $P(t) = \\frac{K}{2}$.'
      }, { custom: function () { var t = ML.evalPlain(tP), P = K / (1 + A * Math.exp(-r.toNumber() * t)); return Math.abs(P - K / 2) < 1e-6 ? '' : 'half time wrong'; } });
    }
    // value at t = ln(2)/r: e^{-rt} = 1/2
    var val = Q(2 * K, 2 + A), tT2 = r.eq(1) ? '\\ln 2' : r.n === 1n ? r.d + '\\ln 2' : '\\frac{\\ln 2}{' + rT + '}';
    return done({
      q: 'A population follows $' + eqT + '$ with $P(0) = ' + P0 + '$. Find $P$ at $t = ' + tT2 + '$.',
      a: { t: 'num', v: val.toPlain() },
      steps: solveSteps.concat(['At $t = ' + tT2 + '$, $e^{' + cf(r.neg(), 't') + '} = e^{-\\ln 2} = \\frac{1}{2}$.', '$P = \\frac{' + K + '}{1 + ' + tx(Q(A, 2)) + '} = ' + val.toTex() + '$.']),
      hint: 'Write the solution formula first, then simplify the exponential.'
    }, { custom: function () { var t = Math.log(2) / r.toNumber(), P = K / (1 + A * Math.exp(-r.toNumber() * t)); return Math.abs(P - val.toNumber()) < 1e-6 ? '' : 'value wrong'; } });
  });

  // ================================================================ UNIT 4: PARAMETRIC AND POLAR CALCULUS

  // exact trig values at multiples of pi/6 and pi/4: [sin, cos] as plain strings and TeX
  var ANG = [
    { t: '\\frac{\\pi}{6}', p: 'pi/6', s: ['1/2', '\\frac{1}{2}'], c: ['sqrt(3)/2', '\\frac{\\sqrt{3}}{2}'], cot: ['sqrt(3)', '\\sqrt{3}'] },
    { t: '\\frac{\\pi}{4}', p: 'pi/4', s: ['sqrt(2)/2', '\\frac{\\sqrt{2}}{2}'], c: ['sqrt(2)/2', '\\frac{\\sqrt{2}}{2}'], cot: ['1', '1'] },
    { t: '\\frac{\\pi}{3}', p: 'pi/3', s: ['sqrt(3)/2', '\\frac{\\sqrt{3}}{2}'], c: ['1/2', '\\frac{1}{2}'], cot: ['sqrt(3)/3', '\\frac{\\sqrt{3}}{3}'] },
    { t: '\\frac{2\\pi}{3}', p: '2*pi/3', s: ['sqrt(3)/2', '\\frac{\\sqrt{3}}{2}'], c: ['-1/2', '-\\frac{1}{2}'], cot: ['-sqrt(3)/3', '-\\frac{\\sqrt{3}}{3}'] },
    { t: '\\frac{3\\pi}{4}', p: '3*pi/4', s: ['sqrt(2)/2', '\\frac{\\sqrt{2}}{2}'], c: ['-sqrt(2)/2', '-\\frac{\\sqrt{2}}{2}'], cot: ['-1', '-1'] },
    { t: '\\frac{5\\pi}{6}', p: '5*pi/6', s: ['1/2', '\\frac{1}{2}'], c: ['-sqrt(3)/2', '-\\frac{\\sqrt{3}}{2}'], cot: ['-sqrt(3)', '-\\sqrt{3}'] }
  ];

  G('calc2.parametric-calculus', function (R, ctx) {
    var shape = by(ctx, R.pick(['slope', 'symb', 'slope']), R.pick(['tangent', 'trig', 'length', 'horiz', 'slope']), R.pick(['length', 'second', 'horiz', 'tangent']));
    function polyPair() {
      var X = P(R.int(-2, 2), R.nz(-3, 3), R.int(-1, 2)), Y = P(R.int(-2, 2), R.int(-3, 3), R.int(-2, 2), R.pick([0, 0, 1, -1]));
      if (pnorm(Y).length < 2) Y = P(0, 1, 1);
      return [pnorm(X), pnorm(Y)];
    }
    if (shape === 'symb') {
      var a = R.int(1, 3), b = R.int(1, 3), n = R.int(2, 3), m = R.intNot(1, 4, n);
      // x = a t^n, y = b t^m -> dy/dx = (b m t^{m-1}) / (a n t^{n-1}) = (b m)/(a n) t^{m-n}
      var co = Q(b * m, a * n), pw = m - n;
      var vT = pw === 0 ? tx(co) : pw > 0 ? cf(co, pw === 1 ? 't' : 't^{' + pw + '}') : '\\frac{' + (co.n === 1n ? '1' : co.n) + '}{' + (co.d === 1n ? '' : co.d) + (pw === -1 ? 't' : 't^{' + (-pw) + '}') + '}';
      return done({
        q: 'For the curve $x = ' + cf(a, 't^{' + n + '}') + '$, $y = ' + cf(b, 't^{' + m + '}') + '$, find $\\frac{dy}{dx}$ in terms of $t$ (for $t \\ne 0$).',
        a: { t: 'expr', v: pw < 0 ? '(' + co.toPlain() + ')/t^' + (-pw) : ps([[co, pw === 1 ? 't' : 't^' + pw]]), vars: ['t'] },
        steps: [
          '$\\frac{dx}{dt} = ' + cf(a * n, n - 1 === 1 ? 't' : 't^{' + (n - 1) + '}') + '$ and $\\frac{dy}{dt} = ' + cf(b * m, m - 1 === 0 ? '' : m - 1 === 1 ? 't' : 't^{' + (m - 1) + '}') + '$.',
          'By the chain rule, $\\frac{dy}{dt} = \\frac{dy}{dx}\\cdot\\frac{dx}{dt}$, so $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$: the $y$-rate on top.',
          '$\\frac{dy}{dx} = ' + vT + '$.'
        ],
        hint: 'Divide $\\frac{dy}{dt}$ by $\\frac{dx}{dt}$, in that order.'
      }, { custom: function (p) { var t = 1.37, h = 1e-6, xs = function (s) { return a * Math.pow(s, n); }, ys = function (s) { return b * Math.pow(s, m); }; var want = (ys(t + h) - ys(t - h)) / (xs(t + h) - xs(t - h)); return Math.abs(ML.evalPlain(p.a.v, { t: t }) - want) < 1e-5 ? '' : 'dy/dx wrong'; } });
    }
    if (shape === 'slope' || shape === 'tangent') {
      var pr, t0, dx, dy, tries = 0;
      do { pr = polyPair(); t0 = R.int(-2, 2); dx = pev(pder(pr[0]), t0); dy = pev(pder(pr[1]), t0); tries++; } while ((dx.isZero() || dy.isZero() && shape === 'tangent') && tries < 60);
      if (dx.isZero()) { pr = [P(0, 2, 1), P(1, 0, 0, 1)]; t0 = 1; dx = pev(pder(pr[0]), t0); dy = pev(pder(pr[1]), t0); }
      var mq = dy.div(dx), xT = ptex(pr[0], 't'), yT = ptex(pr[1], 't'), X0 = pev(pr[0], t0), Y0 = pev(pr[1], t0), bq = Y0.sub(mq.mul(X0));
      var st = ['$\\frac{dx}{dt} = ' + ptex(pder(pr[0]), 't') + '$ and $\\frac{dy}{dt} = ' + ptex(pder(pr[1]), 't') + '$.', 'At $t = ' + t0 + '$: $\\frac{dx}{dt} = ' + tx(dx) + '$ and $\\frac{dy}{dt} = ' + tx(dy) + '$.', '$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{' + tx(dy) + '}{' + tx(dx) + '} = ' + tx(mq) + '$.'];
      if (shape === 'slope') return done({
        q: 'Find the slope $\\frac{dy}{dx}$ of the curve $x = ' + xT + '$, $y = ' + yT + '$ at $t = ' + t0 + '$.',
        a: { t: 'num', v: mq.toPlain() }, steps: st, hint: 'Slope = (rate of change of $y$) ÷ (rate of change of $x$).', nolint: ['--', '+ -']
      }, { custom: function () { var h = 1e-6, f = function (P2, s) { return pev(P2, Q.from(Math.round(s * 1e7) / 1e7)).toNumber(); }; var w = (f(pr[1], t0 + h) - f(pr[1], t0 - h)) / (f(pr[0], t0 + h) - f(pr[0], t0 - h)); return Math.abs(w - mq.toNumber()) < 1e-4 ? '' : 'slope ' + w; } });
      return done({
        q: 'Find the equation of the tangent line to $x = ' + xT + '$, $y = ' + yT + '$ at $t = ' + t0 + '$.',
        a: { t: 'eq', v: 'y = ' + ps([[mq, 'x'], [bq, '']]) },
        steps: ['The point: $x = ' + tx(X0) + '$, $y = ' + tx(Y0) + '$.'].concat(st).concat(['Line: $' + (Y0.isZero() ? 'y' : 'y' + T.signed(Y0.neg())) + ' = ' + (X0.isZero() ? cf(mq, 'x') : tx(mq) + '\\left(x' + T.signed(X0.neg()) + '\\right)') + '$, that is $y = ' + T.terms([[mq, 'x'], [bq, '']]) + '$.']),
        hint: 'Find the point and the slope at $t = ' + t0 + '$, then use point-slope form.', nolint: ['--', '+ -']
      }, null);
    }
    if (shape === 'trig') {
      var A2 = R.int(1, 5), B2 = R.intNot(1, 5, A2), ang = R.pick(ANG), ratio = Q(-B2, A2);
      var ct = { 'sqrt(3)': [Q(1), 'sqrt(3)'], '1': [Q(1), ''], 'sqrt(3)/3': [Q(1, 3), 'sqrt(3)'], '-sqrt(3)/3': [Q(-1, 3), 'sqrt(3)'], '-1': [Q(-1), ''], '-sqrt(3)': [Q(-1), 'sqrt(3)'] }[ang.cot[0]];
      var vq = ratio.mul(ct[0]), vP2 = ct[1] ? ps([[vq, ct[1]]]) : vq.toPlain(), vT2 = ct[1] ? kTex(vq, '\\sqrt{3}') : tx(vq);
      return done({
        q: 'For the ellipse $x = ' + (A2 === 1 ? '' : A2) + '\\cos t$, $y = ' + (B2 === 1 ? '' : B2) + '\\sin t$, find $\\frac{dy}{dx}$ at $t = ' + ang.t + '$.',
        a: { t: 'num', v: vP2 },
        steps: ['$\\frac{dx}{dt} = ' + cf(-A2, '\\sin t') + '$ and $\\frac{dy}{dt} = ' + cf(B2, '\\cos t') + '$.', '$\\frac{dy}{dx} = \\frac{' + cf(B2, '\\cos t') + '}{' + cf(-A2, '\\sin t') + '} = ' + cf(ratio, '\\cot t') + '$.', 'At $t = ' + ang.t + '$, $\\cot t = ' + ang.cot[1] + '$, so $\\frac{dy}{dx} = ' + vT2 + '$.'],
        hint: 'Differentiate $x$ and $y$ with respect to $t$, then divide.'
      }, { custom: function (p) { var t = ML.evalPlain(ang.p), w = -B2 * Math.cos(t) / (A2 * Math.sin(t)); return Math.abs(ML.evalPlain(p.a.v) - w) < 1e-9 ? '' : 'ellipse slope'; } });
    }
    if (shape === 'horiz') {
      var k = R.int(1, 3), c = R.int(-3, 3), vert = R.coin();
      if (!vert) return done({
        q: 'Find all values of $t$ where the curve $x = t^{2}' + T.signed(c) + '$, $y = t^{3} - ' + 3 * k * k + 't$ has a horizontal tangent line.',
        a: { t: 'set', v: [String(k), String(-k)] },
        steps: ['Horizontal tangent: $\\frac{dy}{dt} = 0$ while $\\frac{dx}{dt} \\ne 0$.', '$\\frac{dy}{dt} = 3t^{2} - ' + 3 * k * k + ' = 0$ gives $t = \\pm ' + k + '$.', '$\\frac{dx}{dt} = 2t$ is not 0 there, so both values work.'],
        hint: 'Set $\\frac{dy}{dt} = 0$ and check that $\\frac{dx}{dt} \\ne 0$.'
      }, null);
      return done({
        q: 'Find all values of $t$ where the curve $x = t^{3} - ' + 3 * k * k + 't$, $y = t^{2}' + T.signed(c) + '$ has a vertical tangent line.',
        a: { t: 'set', v: [String(k), String(-k)] },
        steps: ['Vertical tangent: $\\frac{dx}{dt} = 0$ while $\\frac{dy}{dt} \\ne 0$ (the slope $\\frac{dy/dt}{dx/dt}$ blows up).', '$\\frac{dx}{dt} = 3t^{2} - ' + 3 * k * k + ' = 0$ gives $t = \\pm ' + k + '$.', '$\\frac{dy}{dt} = 2t \\ne 0$ there, so both values work.'],
        hint: 'Set $\\frac{dx}{dt} = 0$ and check $\\frac{dy}{dt} \\ne 0$.'
      }, null);
    }
    if (shape === 'second') {
      var t1 = R.pick([1, 2, -1, 3]), cy = R.int(1, 3);
      // x = t^2, y = cy t^3: dy/dx = 3cy t / 2 ; d2y/dx2 = (3cy/2) / (2t) = 3cy/(4t)
      var val2 = Q(3 * cy, 4 * t1);
      return done({
        q: 'For $x = t^{2}$, $y = ' + cf(cy, 't^{3}') + '$, find $\\frac{d^{2}y}{dx^{2}}$ at $t = ' + t1 + '$.',
        a: { t: 'num', v: val2.toPlain() },
        steps: ['First derivative: $\\frac{dy}{dx} = \\frac{' + cf(3 * cy, 't^{2}') + '}{2t} = ' + cf(Q(3 * cy, 2), 't') + '$.', 'The second derivative is the derivative of $\\frac{dy}{dx}$ with respect to $x$: $\\frac{d^{2}y}{dx^{2}} = \\frac{\\frac{d}{dt}\\left(\\frac{dy}{dx}\\right)}{dx/dt} = \\frac{' + tx(Q(3 * cy, 2)) + '}{2t}$.', 'At $t = ' + t1 + '$: $' + tx(val2) + '$.'],
        hint: 'Differentiate $\\frac{dy}{dx}$ with respect to $t$, then divide by $\\frac{dx}{dt}$ again.'
      }, { custom: function () { var y = function (x) { var t = t1 > 0 ? Math.sqrt(x) : -Math.sqrt(x); return cy * t * t * t; }, x0 = t1 * t1, h = 1e-4; var d2 = (y(x0 + h) - 2 * y(x0) + y(x0 - h)) / (h * h); return Math.abs(d2 - val2.toNumber()) < 1e-3 ? '' : 'd2 ' + d2; } });
    }
    // length
    var fam = R.pick(['cube', 'circle', 'spiral']);
    if (fam === 'cube') {
      var a3 = R.pick([1, 2, 3]), Tt = R.pick([[3, '\\sqrt{3}', 2], [8, '2\\sqrt{2}', 3], [15, '\\sqrt{15}', 4]]), L3 = Q(2 * a3, 3).mul(Tt[2] * Tt[2] * Tt[2] - 1);
      return done({
        q: 'Find the length of the curve $x = ' + cf(a3, 't^{2}') + '$, $y = ' + cf(Q(2 * a3, 3), 't^{3}') + '$ for $0 \\le t \\le ' + Tt[1] + '$.',
        a: { t: 'num', v: L3.toPlain() },
        steps: ['$\\frac{dx}{dt} = ' + cf(2 * a3, 't') + '$, $\\frac{dy}{dt} = ' + cf(2 * a3, 't^{2}') + '$.', '$\\sqrt{\\left(\\frac{dx}{dt}\\right)^{2} + \\left(\\frac{dy}{dt}\\right)^{2}} = \\sqrt{' + 4 * a3 * a3 + 't^{2} + ' + 4 * a3 * a3 + 't^{4}} = ' + cf(2 * a3, 't') + '\\sqrt{1 + t^{2}}$ for $t \\ge 0$.', D('L = \\int_0^{' + Tt[1] + '} ' + cf(2 * a3, 't') + '\\sqrt{1 + t^{2}}\\,dt = ' + kTex(Q(2 * a3, 3), '') + '\\left[(1 + t^{2})^{3/2}\\right]_0^{' + Tt[1] + '}'), '$= ' + tx(Q(2 * a3, 3)) + '\\left(' + (Tt[0] + 1) + '^{3/2} - 1\\right) = ' + tx(Q(2 * a3, 3)) + '(' + Tt[2] * Tt[2] * Tt[2] + ' - 1) = ' + tx(L3) + '$.'],
        hint: 'Arc length: $\\int \\sqrt{(dx/dt)^{2} + (dy/dt)^{2}}\\,dt$.'
      }, { custom: function (p) { var T0 = Math.sqrt(Tt[0]), s = 0, n = 2000; for (var i = 0; i < n; i++) { var t = (i + 0.5) / n * T0; s += Math.hypot(2 * a3 * t, 2 * a3 * t * t); } s *= T0 / n; return Math.abs(s - L3.toNumber()) < 1e-4 ? '' : 'len ' + s; } });
    }
    if (fam === 'circle') {
      var rr = R.int(2, 6), ang2 = R.pick([['\\frac{\\pi}{2}', Q(1, 2)], ['\\pi', Q(1)], ['\\frac{\\pi}{3}', Q(1, 3)], ['\\frac{2\\pi}{3}', Q(2, 3)], ['2\\pi', Q(2)]]), Lc = ang2[1].mul(rr);
      return done({
        q: 'Find the length of $x = ' + rr + '\\cos t$, $y = ' + rr + '\\sin t$ for $0 \\le t \\le ' + ang2[0] + '$.',
        a: { t: 'num', v: kPlain(Lc, 'pi') },
        steps: ['$\\frac{dx}{dt} = -' + rr + '\\sin t$, $\\frac{dy}{dt} = ' + rr + '\\cos t$, so the speed is $\\sqrt{' + rr * rr + '\\sin^{2}t + ' + rr * rr + '\\cos^{2}t} = ' + rr + '$.', '$L = \\int_0^{' + ang2[0] + '} ' + rr + '\\,dt = ' + kTex(Lc, '\\pi') + '$.', 'Check: an arc of a circle has length radius × angle.'],
        hint: 'Find the speed $\\sqrt{(dx/dt)^{2} + (dy/dt)^{2}}$ first.'
      }, null);
    }
    var kk = R.pick([2, 3, 4, 5]);
    return done({
      q: 'Find the length of the spiral $x = e^{t}\\cos t$, $y = e^{t}\\sin t$ for $0 \\le t \\le \\ln ' + kk + '$.',
      a: { t: 'num', v: 'sqrt(2)*' + (kk - 1) },
      steps: ['$\\frac{dx}{dt} = e^{t}(\\cos t - \\sin t)$, $\\frac{dy}{dt} = e^{t}(\\sin t + \\cos t)$.', 'Squares add to $e^{2t}\\left[(\\cos t - \\sin t)^{2} + (\\sin t + \\cos t)^{2}\\right] = 2e^{2t}$, so the speed is $\\sqrt{2}e^{t}$.', '$L = \\int_0^{\\ln ' + kk + '}\\sqrt{2}e^{t}\\,dt = \\sqrt{2}(' + kk + ' - 1) = ' + (kk - 1 === 1 ? '' : kk - 1) + '\\sqrt{2}$.'],
      hint: 'Expand the squares; the cross terms cancel.'
    }, { custom: function (p) { var T0 = Math.log(kk), s = 0, n = 2000; for (var i = 0; i < n; i++) { var t = (i + 0.5) / n * T0; s += Math.SQRT2 * Math.exp(t); } s *= T0 / n; return Math.abs(s - ML.evalPlain(p.a.v)) < 1e-6 ? '' : 'spiral'; } });
  });

  G('calc2.polar-area', function (R, ctx) {
    var shape = by(ctx, R.pick(['circle', 'cardioid', 'limits']), R.pick(['rose', 'cardioid', 'spiral', 'limits']), R.pick(['between', 'loop', 'rose', 'spiral', 'rose', 'between']));
    var a = R.int(1, 8), aT = a === 1 ? '' : a;
    if (shape === 'limits' && R.coin()) shape = 'sector';
    if (shape === 'sector') { // inside the circle r = a between two rays
      var sd = R.pick([6, 4, 3]), sm = R.int(1, 2 * sd - 1), sAng = Q(sm, sd), As0 = Q(a * a, 2).mul(sAng);
      return done({
        q: 'Find the area of the region inside the circle $r = ' + a + '$ with $0 \\le \\theta \\le ' + kTex(sAng, '\\pi') + '$.',
        a: { t: 'num', v: kPlain(As0, 'pi') },
        steps: [
          'Polar area: $A = \\frac{1}{2}\\int_{\\alpha}^{\\beta} r^{2}\\,d\\theta$. Here $r = ' + a + '$ is constant.',
          D('A = \\frac{1}{2}\\int_{0}^{' + kTex(sAng, '\\pi') + '} ' + a * a + '\\,d\\theta = \\frac{' + a * a + '}{2}\\cdot ' + kTex(sAng, '\\pi')),
          '$A = ' + kTex(As0, '\\pi') + '$, a sector of the disk, as $\\frac{1}{2}r^{2}\\theta$ predicts.'
        ],
        hint: 'Use $A = \\frac{1}{2}\\int r^{2}\\,d\\theta$.',
        viz: { name: 'polar', opts: { r: String(a), t0: 0, t1: sm + '*pi/' + sd, theta: (sm / sd / 2).toFixed(3) + '*pi', rect: false } }
      }, { int: '0.5*' + a * a, a: 0, b: sm * Math.PI / sd });
    }
    if (shape === 'circle') {
      var fn = R.pick(['cos', 'sin']), A0 = Q(a * a, 4);
      return done({
        q: 'Find the area inside the circle $r = ' + aT + '\\' + fn + '\\theta$.',
        a: { t: 'num', v: kPlain(A0, 'pi') },
        steps: ['$r = ' + aT + '\\' + fn + '\\theta$ traces the circle once as $\\theta$ runs over an interval of length $\\pi$: ' + (fn === 'cos' ? '$-\\frac{\\pi}{2} \\le \\theta \\le \\frac{\\pi}{2}$' : '$0 \\le \\theta \\le \\pi$') + '.', D('A = \\frac{1}{2}\\int r^{2}\\,d\\theta = \\frac{1}{2}\\int ' + (a * a === 1 ? '' : a * a) + '\\' + fn + '^{2}\\theta\\,d\\theta = \\frac{' + a * a + '}{2}\\cdot\\frac{\\pi}{2}'), '$A = ' + kTex(A0, '\\pi') + '$. Check: it is a circle of diameter ' + a + ', so its area is $\\pi\\left(\\frac{' + a + '}{2}\\right)^{2}$.'],
        hint: 'Use $A = \\frac{1}{2}\\int r^{2}\\,d\\theta$ over one trip around the circle (length $\\pi$, not $2\\pi$).',
        viz: { name: 'polar', opts: { r: a + '*' + fn + '(theta)', t0: 0, t1: 'pi', theta: 'pi/3', rect: false } }
      }, { int: '0.5*(' + a + '*' + fn + '(x))^2', a: 0, b: Math.PI });
    }
    if (shape === 'cardioid') {
      var form = R.pick(['1 + \\cos\\theta', '1 - \\cos\\theta', '1 + \\sin\\theta', '1 - \\sin\\theta']), Ac = Q(3 * a * a, 2), fP = { '1 + \\cos\\theta': '1+cos(theta)', '1 - \\cos\\theta': '1-cos(theta)', '1 + \\sin\\theta': '1+sin(theta)', '1 - \\sin\\theta': '1-sin(theta)' }[form];
      return done({
        q: 'Find the area inside the cardioid $r = ' + aT + '(' + form + ')$.',
        a: { t: 'num', v: kPlain(Ac, 'pi') },
        steps: ['The curve is traced once for $0 \\le \\theta \\le 2\\pi$.', 'Expand: $r^{2} = ' + (a * a === 1 ? '' : a * a) + '\\left(1 \\pm 2\\,\\text{trig} + \\text{trig}^{2}\\right)$, where trig is the sine or cosine. Over a full period, $\\int 1 = 2\\pi$, the middle term integrates to 0, and $\\int \\text{trig}^{2} = \\pi$.', D('A = \\frac{1}{2}\\int_0^{2\\pi} r^{2}\\,d\\theta = \\frac{' + a * a + '}{2}\\left(2\\pi + \\pi\\right) = ' + kTex(Ac, '\\pi'))],
        hint: 'Expand $r^{2}$ and use $\\int_0^{2\\pi}\\cos^{2}\\theta\\,d\\theta = \\pi$.',
        viz: { name: 'polar', opts: { r: a + '*(' + fP + ')', theta: 'pi/2', rect: false } }
      }, { int: '0.5*(' + a + '*(' + fP.replace(/theta/g, 'x') + '))^2', a: 0, b: 2 * Math.PI });
    }
    if (shape === 'limits') {
      var n = R.pick([2, 3, 4, 5, 6, 7, 8]), fr = R.pick(['cos', 'sin']), odd = n % 2 === 1, half = Q(1, 2 * n);
      var right, wr;
      if (fr === 'cos') { right = '$-\\frac{\\pi}{' + 2 * n + '} \\le \\theta \\le \\frac{\\pi}{' + 2 * n + '}$'; wr = ['$0 \\le \\theta \\le \\frac{\\pi}{' + n + '}$', '$0 \\le \\theta \\le 2\\pi$', '$0 \\le \\theta \\le \\frac{\\pi}{' + 2 * n + '}$']; }
      else { right = '$0 \\le \\theta \\le \\frac{\\pi}{' + n + '}$'; wr = ['$-\\frac{\\pi}{' + 2 * n + '} \\le \\theta \\le \\frac{\\pi}{' + 2 * n + '}$', '$0 \\le \\theta \\le 2\\pi$', '$0 \\le \\theta \\le \\frac{\\pi}{' + 2 * n + '}$']; }
      return done({
        q: 'Which $\\theta$-interval traces exactly one petal of the rose $r = \\' + fr + '(' + n + '\\theta)$?',
        a: mc(right, wr),
        steps: ['A petal starts and ends where $r = 0$, with $r$ of one sign in between.', '$\\' + fr + '(' + n + '\\theta) = 0$ ' + (fr === 'cos' ? 'at $\\theta = \\pm\\frac{\\pi}{' + 2 * n + '}$, and $r > 0$ between them' : 'at $\\theta = 0$ and $\\theta = \\frac{\\pi}{' + n + '}$, and $r > 0$ between them') + '.', 'So one petal is ' + right + '. The interval $[0, 2\\pi]$ covers ' + (odd ? 'every petal twice (an odd rose is traced twice)' : 'all ' + 2 * n + ' petals') + ', not one.'],
        hint: 'Find two neighboring angles where $r = 0$.',
        viz: { name: 'polar', opts: { r: fr + '(' + n + '*theta)', theta: fr === 'cos' ? 'pi/' + (4 * n) : 'pi/' + (2 * n), rect: true } }
      }, null);
    }
    if (shape === 'rose') {
      var n2 = R.pick([2, 3, 4, 5, 6]), fr2 = R.pick(['cos', 'sin']), one = R.coin(), Ap = Q(a * a, 4 * n2), petals = n2 % 2 ? n2 : 2 * n2, Aall = Ap.mul(petals);
      var ans = one ? Ap : Aall;
      return done({
        q: 'Find the area of ' + (one ? 'one petal' : 'the whole rose (all ' + petals + ' petals)') + ' of $r = ' + aT + '\\' + fr2 + '(' + n2 + '\\theta)$.',
        a: { t: 'num', v: kPlain(ans, 'pi') },
        steps: [
          'One petal: ' + (fr2 === 'cos' ? '$-\\frac{\\pi}{' + 2 * n2 + '} \\le \\theta \\le \\frac{\\pi}{' + 2 * n2 + '}$' : '$0 \\le \\theta \\le \\frac{\\pi}{' + n2 + '}$') + ', an interval of length $\\frac{\\pi}{' + n2 + '}$.',
          D('A_{\\text{petal}} = \\frac{1}{2}\\int ' + (a * a === 1 ? '' : a * a) + '\\' + fr2 + '^{2}(' + n2 + '\\theta)\\,d\\theta = \\frac{' + a * a + '}{2}\\cdot\\frac{1}{2}\\cdot\\frac{\\pi}{' + n2 + '} = ' + kTex(Ap, '\\pi')),
          one ? 'That is the answer.' : 'With $n = ' + n2 + '$ ' + (n2 % 2 ? '(odd) there are $n = ' + n2 + '$ petals' : '(even) there are $2n = ' + 2 * n2 + '$ petals') + ', so the total is $' + petals + '\\cdot ' + kTex(Ap, '\\pi') + ' = ' + kTex(Aall, '\\pi') + '$.'
        ],
        hint: 'Find the area of one petal (where $r$ goes from 0 back to 0), then count petals.',
        viz: { name: 'polar', opts: { r: a + '*' + fr2 + '(' + n2 + '*theta)', theta: 'pi/' + (4 * n2), rect: false } }
      }, { int: '0.5*(' + a + '*' + fr2 + '(' + n2 + '*x))^2', a: 0, b: (one ? Math.PI / n2 : (n2 % 2 ? Math.PI : 2 * Math.PI)) });
    }
    if (shape === 'spiral') {
      var k = R.int(1, 5), up = R.pick([['\\pi', 'pi', Q(1)], ['2\\pi', '2*pi', Q(8)], ['\\frac{\\pi}{2}', 'pi/2', Q(1, 8)]]), As = Q(k * k, 6).mul(up[2]);
      return done({
        q: 'Find the area swept out by the spiral $r = ' + cf(k, '\\theta') + '$ for $0 \\le \\theta \\le ' + up[0] + '$.',
        a: { t: 'num', v: kPlain(As, 'pi^3') },
        steps: [D('A = \\frac{1}{2}\\int_0^{' + up[0] + '} ' + (k * k === 1 ? '' : k * k) + '\\theta^{2}\\,d\\theta = \\frac{' + k * k + '}{6}\\left(' + up[0] + '\\right)^{3}'), '$A = ' + kTex(As, '\\pi^{3}') + '$.'],
        hint: 'Square $r$, then integrate a power of $\\theta$.',
        viz: { name: 'polar', opts: { r: k + '*theta', t0: 0, t1: up[1], theta: '0.6', rect: false } }
      }, { int: '0.5*(' + k + '*x)^2', a: 0, b: ML.evalPlain(up[1]) });
    }
    if (shape === 'loop') {
      var kk = R.int(1, 6), Al = kk * kk;
      return done({
        q: 'The limaçon $r = ' + (kk === 1 ? '' : kk) + '(1 + 2\\cos\\theta)$ has a small inner loop. Find the area inside the inner loop.',
        a: { t: 'num', v: Al + '*(pi-3*sqrt(3)/2)' },
        steps: ['$r = 0$ when $\\cos\\theta = -\\frac{1}{2}$: $\\theta = \\frac{2\\pi}{3}$ and $\\frac{4\\pi}{3}$. Between them $r < 0$, which draws the inner loop.', D('A = \\frac{1}{2}\\int_{2\\pi/3}^{4\\pi/3} ' + (Al === 1 ? '' : Al) + '(1 + 2\\cos\\theta)^{2}\\,d\\theta') + ' Expand with $\\cos^{2}\\theta = \\frac{1 + \\cos 2\\theta}{2}$: $(1 + 2\\cos\\theta)^{2} = 3 + 4\\cos\\theta + 2\\cos 2\\theta$.', 'Antiderivative: $3\\theta + 4\\sin\\theta + \\sin 2\\theta$. Between the limits: $2\\pi - 4\\sqrt{3} + \\sqrt{3} = 2\\pi - 3\\sqrt{3}$.', '$A = \\frac{' + Al + '}{2}\\left(2\\pi - 3\\sqrt{3}\\right) = ' + (Al === 1 ? '' : Al) + '\\left(\\pi - \\frac{3\\sqrt{3}}{2}\\right)$.'],
        hint: 'Find where $r = 0$; the inner loop is traced between those angles.',
        viz: { name: 'polar', opts: { r: kk + '*(1+2*cos(theta))', theta: '2.4', rect: true } }
      }, { int: '0.5*(' + kk + '*(1+2*cos(x)))^2', a: 2 * Math.PI / 3, b: 4 * Math.PI / 3 });
    }
    // between: inside r = 3a sin(th), outside r = a(1 + sin th) -> a^2 pi
    var fb = R.pick(['sin', 'cos']);
    if (R.coin()) { // inside r = 2a cos(th) (or sin), outside r = a -> a^2 (pi/3 + sqrt(3)/2)
      var lim = fb === 'sin' ? ['\\frac{\\pi}{6}', '\\frac{5\\pi}{6}', Math.PI / 6, 5 * Math.PI / 6] : ['-\\frac{\\pi}{3}', '\\frac{\\pi}{3}', -Math.PI / 3, Math.PI / 3];
      return done({
        q: 'Find the area inside the circle $r = ' + 2 * a + '\\' + fb + '\\theta$ and outside the circle $r = ' + a + '$.',
        a: { t: 'num', v: (a * a === 1 ? '' : a * a + '*') + '(pi/3+sqrt(3)/2)' },
        steps: [
          'The circles meet where $' + 2 * a + '\\' + fb + '\\theta = ' + a + '$, so $\\' + fb + '\\theta = \\frac{1}{2}$: $\\theta = ' + lim[0] + '$ and $' + lim[1] + '$.',
          D('A = \\frac{1}{2}\\int_{' + lim[0] + '}^{' + lim[1] + '} \\left[' + 4 * a * a + '\\' + fb + '^{2}\\theta - ' + a * a + '\\right]d\\theta = ' + tx(Q(a * a, 2)) + '\\int_{' + lim[0] + '}^{' + lim[1] + '} \\left(' + (fb === 'sin' ? '1 - 2\\cos 2\\theta' : '1 + 2\\cos 2\\theta') + '\\right)d\\theta'),
          'The interval has length $\\frac{2\\pi}{3}$, and $\\int 2\\cos 2\\theta\\,d\\theta = \\sin 2\\theta$ changes by ' + (fb === 'sin' ? '$-\\sqrt{3}$, which the minus sign turns into $+\\sqrt{3}$' : '$\\sqrt{3}$') + '.',
          '$A = ' + tx(Q(a * a, 2)) + '\\left(\\frac{2\\pi}{3} + \\sqrt{3}\\right) = ' + (a * a === 1 ? '' : a * a) + '\\left(\\frac{\\pi}{3} + \\frac{\\sqrt{3}}{2}\\right)$.'
        ],
        hint: 'Find where the circles cross, then use $\\frac{1}{2}\\int (R^{2} - r^{2})\\,d\\theta$ between those angles.'
      }, { int: '0.5*((' + 2 * a + '*' + fb + '(x))^2-' + a * a + ')', a: lim[2], b: lim[3] });
    }
    return done({
      q: 'Find the area inside $r = ' + 3 * a + '\\' + fb + '\\theta$ and outside $r = ' + (a === 1 ? '1 + \\' + fb + '\\theta' : a + '(1 + \\' + fb + '\\theta)') + '$.',
      a: { t: 'num', v: kPlain(a * a, 'pi') },
      steps: [
        'The curves meet where $' + 3 * a + '\\' + fb + '\\theta = ' + (a === 1 ? '1 + \\' + fb + '\\theta' : a + '(1 + \\' + fb + '\\theta)') + '$, so $\\' + fb + '\\theta = \\frac{1}{2}$: ' + (fb === 'sin' ? '$\\theta = \\frac{\\pi}{6}$ and $\\frac{5\\pi}{6}$' : '$\\theta = \\pm\\frac{\\pi}{3}$') + '.',
        D('A = \\frac{1}{2}\\int \\left[(' + 3 * a + '\\' + fb + '\\theta)^{2} - ' + (a * a === 1 ? '' : a * a) + '(1 + \\' + fb + '\\theta)^{2}\\right]d\\theta = ' + tx(Q(a * a, 2)) + '\\int \\left(8\\' + fb + '^{2}\\theta - 2\\' + fb + '\\theta - 1\\right)d\\theta'),
        'Over ' + (fb === 'sin' ? '$\\left[\\frac{\\pi}{6}, \\frac{5\\pi}{6}\\right]$' : '$\\left[-\\frac{\\pi}{3}, \\frac{\\pi}{3}\\right]$') + ': $\\int 8\\' + fb + '^{2}\\theta = \\frac{8\\pi}{3} + 2\\sqrt{3}$, $\\int 2\\' + fb + '\\theta = 2\\sqrt{3}$, $\\int 1 = \\frac{2\\pi}{3}$.',
        '$A = ' + tx(Q(a * a, 2)) + '\\cdot 2\\pi = ' + kTex(a * a, '\\pi') + '$.'
      ],
      hint: 'Outer radius squared minus inner radius squared, between the intersection angles.'
    }, fb === 'sin' ? { int: '0.5*((' + 3 * a + '*sin(x))^2-(' + a + '*(1+sin(x)))^2)', a: Math.PI / 6, b: 5 * Math.PI / 6 } : { int: '0.5*((' + 3 * a + '*cos(x))^2-(' + a + '*(1+cos(x)))^2)', a: -Math.PI / 3, b: Math.PI / 3 });
  });

  G('calc2.polar-tangents-length', function (R, ctx) {
    var shape = by(ctx, R.pick(['formula', 'slope', 'slope']), R.pick(['slope', 'length', 'slope']), R.pick(['length', 'slope', 'length']));
    if (shape === 'formula') {
      var f = R.pick([['1 + \\cos\\theta', '-\\sin\\theta', '1 + \\cos\\theta - \\sin\\theta'], ['\\theta^{2}', '2\\theta', '\\theta^{2} + 2\\theta'], ['e^{\\theta}', 'e^{\\theta}', '2e^{\\theta}'], ['2\\sin\\theta', '2\\cos\\theta', '2\\sin\\theta + 2\\cos\\theta']]);
      var right = '\\int_0^{\\pi}\\sqrt{\\left(' + f[0] + '\\right)^{2} + \\left(' + f[1] + '\\right)^{2}}\\,d\\theta';
      return done({
        q: 'Which integral gives the length of the polar curve $r = ' + f[0] + '$ for $0 \\le \\theta \\le \\pi$?',
        a: mc('$' + right + '$', ['$\\int_0^{\\pi}\\sqrt{1 + \\left(' + f[1] + '\\right)^{2}}\\,d\\theta$', '$\\frac{1}{2}\\int_0^{\\pi}\\left(' + f[0] + '\\right)^{2}d\\theta$', '$\\int_0^{\\pi}\\left(' + f[2] + '\\right)d\\theta$']),
        steps: ['Treat the curve as parametric in $\\theta$: $x = r\\cos\\theta$, $y = r\\sin\\theta$.', '$\\left(\\frac{dx}{d\\theta}\\right)^{2} + \\left(\\frac{dy}{d\\theta}\\right)^{2} = r^{2} + \\left(\\frac{dr}{d\\theta}\\right)^{2}$ (the cross terms cancel).', 'So $L = ' + right + '$. The formula $\\frac{1}{2}\\int r^{2}d\\theta$ is area, and $\\sqrt{1 + (dr/d\\theta)^{2}}$ is the Cartesian formula used in the wrong setting.'],
        hint: 'Arc length in polar: $\\int\\sqrt{r^{2} + (dr/d\\theta)^{2}}\\,d\\theta$.'
      }, null);
    }
    if (shape === 'slope') {
      // r = a + b*trig at an axis angle, or r = a sin 2theta at pi/4, or r = theta at pi/2
      var fam = R.pick(['lim', 'lim', 'lim', 'rose', 'spiral']);
      if (fam === 'spiral') {
        var kk = R.int(1, 3);
        return done({
          q: 'Find the slope $\\frac{dy}{dx}$ of the spiral $r = ' + cf(kk, '\\theta') + '$ at $\\theta = \\frac{\\pi}{2}$.',
          a: { t: 'num', v: '-2/pi' },
          steps: ['$\\frac{dy}{dx} = \\frac{r\'\\sin\\theta + r\\cos\\theta}{r\'\\cos\\theta - r\\sin\\theta}$, from $x = r\\cos\\theta$, $y = r\\sin\\theta$.', 'At $\\theta = \\frac{\\pi}{2}$: $r = ' + kTex(Q(kk, 2), '\\pi') + '$, $r\' = ' + kk + '$, $\\sin\\theta = 1$, $\\cos\\theta = 0$.', '$\\frac{dy}{dx} = \\frac{' + kk + '}{-' + kTex(Q(kk, 2), '\\pi') + '} = -\\frac{2}{\\pi}$.'],
          hint: 'Use $x = r\\cos\\theta$, $y = r\\sin\\theta$ and divide $\\frac{dy}{d\\theta}$ by $\\frac{dx}{d\\theta}$.'
        }, { custom: function (p) { var th = Math.PI / 2, h = 1e-6, X = function (t) { return kk * t * Math.cos(t); }, Y = function (t) { return kk * t * Math.sin(t); }; var w = (Y(th + h) - Y(th - h)) / (X(th + h) - X(th - h)); return Math.abs(w - ML.evalPlain(p.a.v)) < 1e-5 ? '' : 'spiral slope'; } });
      }
      if (fam === 'rose') {
        var a1 = R.int(1, 4);
        return done({
          q: 'Find the slope $\\frac{dy}{dx}$ of $r = ' + (a1 === 1 ? '' : a1) + '\\sin 2\\theta$ at $\\theta = \\frac{\\pi}{4}$.',
          a: { t: 'num', v: '-1' },
          steps: ['At $\\theta = \\frac{\\pi}{4}$: $r = ' + a1 + '$ and $r\' = ' + 2 * a1 + '\\cos\\frac{\\pi}{2} = 0$; $\\sin\\theta = \\cos\\theta = \\frac{\\sqrt{2}}{2}$.', '$\\frac{dy}{dx} = \\frac{r\'\\sin\\theta + r\\cos\\theta}{r\'\\cos\\theta - r\\sin\\theta} = \\frac{0 + ' + a1 + '\\cdot\\frac{\\sqrt{2}}{2}}{0 - ' + a1 + '\\cdot\\frac{\\sqrt{2}}{2}} = -1$.', 'This is the tip of a petal, where the tangent is perpendicular to the ray $\\theta = \\frac{\\pi}{4}$.'],
          hint: 'Find $r$ and $r\'$ at the angle, then use the slope formula.'
        }, null);
      }
      var A = R.int(1, 4), B = R.nz(-3, 3), tf = R.pick(['cos', 'sin']), ang = R.pick([0, 1, 2, 3]); // theta = ang * pi/2
      var s = [0, 1, 0, -1][ang], c = [1, 0, -1, 0][ang];
      var rv = A + B * (tf === 'cos' ? c : s), rp = B * (tf === 'cos' ? -s : c);
      var num = rp * s + rv * c, den = rp * c - rv * s, tries = 0;
      while (den === 0 && tries < 10) { ang = (ang + 1) % 4; s = [0, 1, 0, -1][ang]; c = [1, 0, -1, 0][ang]; rv = A + B * (tf === 'cos' ? c : s); rp = B * (tf === 'cos' ? -s : c); num = rp * s + rv * c; den = rp * c - rv * s; tries++; }
      if (den === 0) { A = 2; B = 1; tf = 'sin'; ang = 0; s = 0; c = 1; rv = 2; rp = 1; num = 2; den = 1; }
      var thT = ['0', '\\frac{\\pi}{2}', '\\pi', '\\frac{3\\pi}{2}'][ang], m = Q(num, den), rT = A + T.coef(B, '\\' + tf + '\\theta', false);
      return done({
        q: 'Find the slope $\\frac{dy}{dx}$ of the polar curve $r = ' + rT + '$ at $\\theta = ' + thT + '$.',
        a: { t: 'num', v: m.toPlain() },
        steps: [
          'Write the curve as $x = r\\cos\\theta$, $y = r\\sin\\theta$. Then $\\frac{dy}{dx} = \\frac{r\'\\sin\\theta + r\\cos\\theta}{r\'\\cos\\theta - r\\sin\\theta}$.',
          'At $\\theta = ' + thT + '$: $\\sin\\theta = ' + s + '$, $\\cos\\theta = ' + c + '$, $r = ' + rv + '$, $r\' = ' + cf(B, tf === 'cos' ? '(-\\sin\\theta)' : '\\cos\\theta') + ' = ' + rp + '$.',
          '$\\frac{dy}{dx} = \\frac{(' + rp + ')(' + s + ') + (' + rv + ')(' + c + ')}{(' + rp + ')(' + c + ') - (' + rv + ')(' + s + ')} = \\frac{' + num + '}{' + den + '} = ' + m.toTex() + '$.'
        ],
        hint: 'Find $r$ and $\\frac{dr}{d\\theta}$ at the angle first.',
        nolint: ['--', '+ -', '+ 0']
      }, { custom: function (p) { var th = ang * Math.PI / 2, h = 1e-6, rr = function (t) { return A + B * (tf === 'cos' ? Math.cos(t) : Math.sin(t)); }, X = function (t) { return rr(t) * Math.cos(t); }, Y = function (t) { return rr(t) * Math.sin(t); }; var w = (Y(th + h) - Y(th - h)) / (X(th + h) - X(th - h)); return Math.abs(w - m.toNumber()) < 1e-5 ? '' : 'polar slope ' + w; } });
    }
    var fam2 = R.pick(['card', 'circle', 'sq', 'exp']), a = R.int(1, 8), fc = R.pick(['sin', 'cos']);
    if (fam2 === 'card') return done({
      q: 'Find the total length of the cardioid $r = ' + (a === 1 ? '' : a) + '(1 + \\cos\\theta)$.',
      a: { t: 'num', v: String(8 * a) },
      steps: ['$r^{2} + (r\')^{2} = ' + (a * a === 1 ? '' : a * a) + '\\left[(1 + \\cos\\theta)^{2} + \\sin^{2}\\theta\\right] = ' + 2 * a * a + '(1 + \\cos\\theta) = ' + 4 * a * a + '\\cos^{2}\\frac{\\theta}{2}$.', 'So $\\sqrt{r^{2} + (r\')^{2}} = ' + 2 * a + '\\left|\\cos\\frac{\\theta}{2}\\right|$. Use symmetry: twice the length for $0 \\le \\theta \\le \\pi$, where $\\cos\\frac{\\theta}{2} \\ge 0$.', '$L = 2\\int_0^{\\pi} ' + 2 * a + '\\cos\\frac{\\theta}{2}\\,d\\theta = 2\\cdot ' + 2 * a + '\\cdot\\left[2\\sin\\frac{\\theta}{2}\\right]_0^{\\pi} = ' + 8 * a + '$.'],
      hint: 'Simplify $r^{2} + (r\')^{2}$ with the half-angle identity $1 + \\cos\\theta = 2\\cos^{2}\\frac{\\theta}{2}$.'
    }, { custom: function (p) { var s = 0, n = 4000; for (var i = 0; i < n; i++) { var t = (i + 0.5) / n * 2 * Math.PI; s += Math.hypot(a * (1 + Math.cos(t)), a * Math.sin(t)); } s *= 2 * Math.PI / n; return Math.abs(s - 8 * a) < 1e-4 ? '' : 'card ' + s; } });
    if (fam2 === 'circle') return done({
      q: 'Find the length of the curve $r = ' + 2 * a + '\\' + fc + '\\theta$ for $0 \\le \\theta \\le \\pi$.',
      a: { t: 'num', v: kPlain(2 * a, 'pi') },
      steps: ['$r^{2} + (r\')^{2} = ' + 4 * a * a + '\\' + fc + '^{2}\\theta + ' + 4 * a * a + '\\' + (fc === 'sin' ? 'cos' : 'sin') + '^{2}\\theta = ' + 4 * a * a + '$.', '$L = \\int_0^{\\pi} ' + 2 * a + '\\,d\\theta = ' + kTex(2 * a, '\\pi') + '$.', 'Check: this is a circle of diameter $' + 2 * a + '$, whose circumference is $' + kTex(2 * a, '\\pi') + '$.'],
      hint: 'Simplify $r^{2} + (r\')^{2}$ first.'
    }, null);
    if (fam2 === 'sq') {
      var Tq = R.pick([[5, '\\sqrt{5}', 3], [12, '2\\sqrt{3}', 4], [21, '\\sqrt{21}', 5]]), cs = R.int(1, 4), L1 = Q(Tq[2] * Tq[2] * Tq[2] - 8, 3), L2 = L1.mul(cs), csT = cs === 1 ? '' : String(cs);
      return done({
        q: 'Find the length of $r = ' + csT + '\\theta^{2}$ for $0 \\le \\theta \\le ' + Tq[1] + '$.',
        a: { t: 'num', v: L2.toPlain() },
        steps: ['$r^{2} + (r\')^{2} = ' + (cs === 1 ? '' : cs * cs) + '(\\theta^{4} + 4\\theta^{2}) = ' + (cs === 1 ? '' : cs * cs) + '\\theta^{2}(\\theta^{2} + 4)$, so the root is $' + csT + '\\theta\\sqrt{\\theta^{2} + 4}$ for $\\theta \\ge 0$.', D('L = ' + csT + '\\int_0^{' + Tq[1] + '}\\theta\\sqrt{\\theta^{2} + 4}\\,d\\theta = ' + (cs === 1 ? '' : cs + '\\cdot ') + '\\frac{1}{3}\\left[(\\theta^{2} + 4)^{3/2}\\right]_0^{' + Tq[1] + '}'), '$= ' + (cs === 1 ? '' : cs + '\\cdot ') + '\\frac{1}{3}\\left(' + (Tq[0] + 4) + '^{3/2} - 4^{3/2}\\right) = ' + (cs === 1 ? '' : cs + '\\cdot ') + '\\frac{1}{3}(' + Tq[2] * Tq[2] * Tq[2] + ' - 8) = ' + tx(L2) + '$.'],
        hint: 'Factor $\\theta^{2}$ out of the root, then substitute $u = \\theta^{2} + 4$.'
      }, { custom: function () { var B = Math.sqrt(Tq[0]), s = 0, n = 2000; for (var i = 0; i < n; i++) { var t = (i + 0.5) / n * B; s += Math.hypot(cs * t * t, 2 * cs * t); } s *= B / n; return Math.abs(s - L2.toNumber()) < 1e-4 ? '' : 'r=th^2 ' + s; } });
    }
    var kq = R.int(2, 9), jq = R.pick([1, 1, 1, 2, 3].filter(function (j) { return j < kq; })), lowT = jq === 1 ? '0' : '\\ln ' + jq;
    return done({
      q: 'Find the length of the spiral $r = e^{\\theta}$ for $' + lowT + ' \\le \\theta \\le \\ln ' + kq + '$.',
      a: { t: 'num', v: 'sqrt(2)*' + (kq - jq) },
      steps: ['$r^{2} + (r\')^{2} = e^{2\\theta} + e^{2\\theta} = 2e^{2\\theta}$, so the root is $\\sqrt{2}e^{\\theta}$.', '$L = \\int_{' + lowT + '}^{\\ln ' + kq + '}\\sqrt{2}e^{\\theta}\\,d\\theta = \\sqrt{2}(' + kq + ' - ' + jq + ') = ' + (kq - jq === 1 ? '' : kq - jq) + '\\sqrt{2}$.'],
      hint: 'Here $r\' = r$, so $r^{2} + (r\')^{2} = 2r^{2}$.'
    }, { custom: function (p) { var s = 0, n = 2000, A0 = Math.log(jq), B0 = Math.log(kq); for (var i = 0; i < n; i++) { var t = A0 + (i + 0.5) / n * (B0 - A0); s += Math.hypot(Math.exp(t), Math.exp(t)); } s *= (B0 - A0) / n; return Math.abs(s - ML.evalPlain(p.a.v)) < 1e-5 ? '' : 'spiral ' + s; } });
  });

  // ================================================================ UNIT 5: SEQUENCES AND SERIES

  function SUM(lo, body) { return '\\sum_{n=' + lo + '}^{\\infty} ' + body; }
  function powT(b, e) { var s = tx(b); return /\\frac|^-/.test(s) ? '\\left(' + s + '\\right)^{' + e + '}' : s + '^{' + e + '}'; }
  // numeric partial sums for the tests (Kahan)
  function nsum(f, lo, N) { var s = 0, c = 0; for (var n = lo; n <= N; n++) { var y = f(n) - c, t = s + y; c = (t - s) - y; s = t; } return s; }
  var CONC3 = ['The series diverges.', 'The series converges.', 'The test gives no conclusion.'];

  G('calc2.sequences', function (R, ctx) {
    var shape = by(ctx, R.pick(['rat', 'geom', 'trap', 'rat']), R.pick(['rat', 'e', 'root', 'squeeze', 'geom']), R.pick(['e', 'root', 'growth', 'squeeze']));
    var note = ' If the sequence diverges, type DNE.';
    if (shape === 'trap') {
      var d = R.pick([2, 3, 4, 10]);
      return done({
        q: 'The sequence $a_n = \\frac{1}{' + d + '^{n}}$, $n \\ge 1$, starts $\\frac{1}{' + d + '}, \\frac{1}{' + d * d + '}, \\frac{1}{' + d * d * d + '}, \\ldots$ What is $\\lim_{n\\to\\infty} a_n$?',
        a: mc('$0$', ['$' + tx(Q(1, d - 1)) + '$, the sum of the terms', '$\\frac{1}{' + d + '}$, the first term', 'It diverges']),
        steps: ['The limit of a sequence is where the terms themselves head, not their total.', 'Each term is $\\frac{1}{' + d + '}$ of the one before, so the terms shrink toward 0: $\\lim a_n = 0$.', 'The number $' + tx(Q(1, d - 1)) + '$ is the sum $a_1 + a_2 + \\cdots$, a different question (the series).'],
        hint: 'Ask what the individual terms get close to.'
      }, null);
    }
    if (shape === 'rat') {
      var degN = R.pick([1, 2, 2, 1]), degD = by(ctx, degN, R.pick([degN, degN, degN + 1, degN - 1 || 1]), R.pick([degN, degN + 1, degN - 1 || 2]));
      var pn = [], pd = []; for (var i = 0; i <= degN; i++) pn.push(i === degN ? R.nz(-5, 6) : R.int(-5, 5)); for (i = 0; i <= degD; i++) pd.push(i === degD ? R.int(1, 6) : R.int(1, 5));
      var PN = P.apply(null, pn), PD = P.apply(null, pd), lim, st;
      if (degN === degD) { lim = Q(pn[degN], pd[degD]); st = 'Same degree on top and bottom: divide every term by $n^{' + degN + '}$. All terms but the leading ones go to 0, leaving $\\frac{' + pn[degN] + '}{' + pd[degD] + '} = ' + tx(lim) + '$.'; }
      else if (degN < degD) { lim = Q(0); st = 'The bottom has the higher degree. Divide by $n^{' + degD + '}$: the top goes to 0 and the bottom to $' + pd[degD] + '$, so the limit is 0.'; }
      else { lim = null; st = 'The top has the higher degree, so $|a_n|$ grows without bound and the sequence diverges.'; }
      return done({
        q: 'Find $\\lim_{n\\to\\infty} \\frac{' + ptex(PN, 'n') + '}{' + ptex(PD, 'n') + '}$.' + note,
        a: { t: 'num', v: lim ? lim.toPlain() : 'DNE' },
        steps: ['For a rational expression in $n$, compare the highest powers of $n$.', st],
        hint: 'Divide top and bottom by the highest power of $n$ in the denominator.'
      }, { custom: function (p) { var n = 1e7, v = pev(PN, n).toNumber() / pev(PD, n).toNumber(); if (!lim) return Math.abs(v) > 1e5 ? '' : 'should diverge'; return Math.abs(v - lim.toNumber()) < 1e-5 ? '' : 'limit ' + v; } });
    }
    if (shape === 'geom') {
      var rr = R.pick([Q(1, 2), Q(-1, 3), Q(2, 3), Q(3, 2), Q(-2), Q(1), Q(-1), Q(-3, 4), Q(5, 4)]), c = R.int(1, 5), conv = rr.abs().lt(1) || rr.eq(1);
      var v = rr.abs().lt(1) ? '0' : rr.eq(1) ? String(c) : 'DNE';
      return done({
        q: 'Find $\\lim_{n\\to\\infty} ' + (c === 1 ? '' : c) + powT(rr, 'n') + '$.' + note,
        a: { t: 'num', v: v },
        steps: ['A geometric sequence $r^{n}$ goes to 0 when $|r| < 1$, stays at 1 when $r = 1$, and diverges otherwise ($|r| > 1$ grows, $r = -1$ flips between $\\pm 1$).', 'Here $r = ' + tx(rr) + '$, so ' + (rr.abs().lt(1) ? 'the terms shrink to 0.' : rr.eq(1) ? 'every term is ' + c + '.' : rr.eq(-1) ? 'the terms alternate between $' + c + '$ and $-' + c + '$ and never settle.' : '$|r| > 1$ and the terms grow without bound.')],
        hint: 'Compare $|r|$ with 1.'
      }, null);
    }
    if (shape === 'e') {
      var k = R.nz(-5, 6), form = 'a', m = by(ctx, 1, R.pick([1, 1, 2]), R.pick([1, 2, 3]));
      var qT = '\\left(1 ' + (k > 0 ? '+' : '-') + ' \\frac{' + Math.abs(k) + '}{n}\\right)^{' + (m === 1 ? '' : m) + 'n}';
      var ex = k * m;
      return done({
        q: 'Find $\\lim_{n\\to\\infty} ' + qT + '$.',
        a: { t: 'num', v: 'e^(' + ex + ')' },
        steps: ['Use $\\lim_{n\\to\\infty}\\left(1 + \\frac{x}{n}\\right)^{n} = e^{x}$ (take $\\ln$ and use L\'Hôpital: $n\\ln\\left(1 + \\frac{x}{n}\\right) \\to x$).', m === 1 ? 'Here $x = ' + k + '$, so the limit is $e^{' + k + '}$.' : 'Write it as $\\left[\\left(1 ' + (k > 0 ? '+' : '-') + ' \\frac{' + Math.abs(k) + '}{n}\\right)^{n}\\right]^{' + m + '} \\to \\left(e^{' + k + '}\\right)^{' + m + '} = e^{' + ex + '}$.'],
        hint: 'Compare with the limit that defines $e$.'
      }, { custom: function (p) { var n = 1e7, v = Math.pow(1 + k / n, m * n); return Math.abs(v - Math.exp(ex)) < 1e-4 * Math.exp(ex) ? '' : 'e-limit'; } });
    }
    if (shape === 'root') {
      var k2 = R.nz(-8, 8), c2 = by(ctx, 1, R.pick([1, 1, 2]), R.pick([1, 2, 3])), n2T = c2 === 1 ? 'n^{2}' : c2 * c2 + 'n^{2}', cnT = cf(c2, 'n'), lim2 = Q(k2, 2 * c2);
      return done({
        q: 'Find $\\lim_{n\\to\\infty}\\left(\\sqrt{' + n2T + ' ' + (k2 > 0 ? '+ ' : '- ') + cf(Math.abs(k2), 'n') + '} - ' + cnT + '\\right)$.',
        a: { t: 'num', v: lim2.toPlain() },
        steps: ['Multiply and divide by the conjugate $\\sqrt{' + n2T + ' ' + (k2 > 0 ? '+ ' : '- ') + cf(Math.abs(k2), 'n') + '} + ' + cnT + '$.', 'The top becomes $(' + n2T + ' ' + (k2 > 0 ? '+ ' : '- ') + cf(Math.abs(k2), 'n') + ') - ' + n2T + ' = ' + cf(k2, 'n') + '$.', 'Divide top and bottom by $n$: $\\frac{' + k2 + '}{\\sqrt{' + c2 * c2 + ' ' + (k2 > 0 ? '+ ' : '- ') + '\\frac{' + Math.abs(k2) + '}{n}} + ' + c2 + '} \\to \\frac{' + k2 + '}{' + 2 * c2 + '} = ' + tx(lim2) + '$.'],
        hint: 'Rationalize with the conjugate.'
      }, { custom: function () { var n = 1e6; return Math.abs(Math.sqrt(c2 * c2 * n * n + k2 * n) - c2 * n - lim2.toNumber()) < 1e-4 ? '' : 'root limit'; } });
    }
    if (shape === 'squeeze') {
      var sK = R.pick(['', '', '2', '3', '5']), sP = R.pick(['n', 'n', 'n^{2}', '\\sqrt{n}', 'n^{3}']);
      var f = R.pick([['\\frac{' + sK + '\\sin n}{' + sP + '}', 'sin'], ['\\frac{' + sK + '\\cos(' + R.int(2, 9) + 'n)}{' + sP + '}', 'cos'], ['\\frac{(-1)^{n}' + (sK || '') + '}{' + sP + '}', 'alt'], ['\\frac{' + R.int(2, 9) + ' + \\' + R.pick(['sin', 'cos']) + ' n}{' + sP + '}', 'shift'], ['\\frac{\\sin^{2} n}{' + sP + '}', 'sq']]);
      return done({
        q: 'Find $\\lim_{n\\to\\infty} ' + f[0] + '$.' + note,
        a: { t: 'num', v: '0' },
        steps: ['The top stays between two fixed numbers, while the bottom grows without bound.', 'So $-\\frac{M}{' + sP + '} \\le a_n \\le \\frac{M}{' + sP + '}$ for a constant $M$, and both bounds go to 0.', 'By the squeeze theorem, the limit is 0.'],
        hint: 'Bound the numerator, then squeeze.'
      }, null);
    }
    var g = R.pick([
      { t: '\\frac{2^{n} + 3^{n}}{3^{n} + 1}', v: '1', s: ['Divide top and bottom by $3^{n}$: $\\frac{(2/3)^{n} + 1}{1 + (1/3)^{n}}$.', 'Both $(2/3)^{n}$ and $(1/3)^{n}$ go to 0, so the limit is 1.'] },
      { t: '\\frac{n!}{n^{n}}', v: '0', s: ['Write $\\frac{n!}{n^{n}} = \\frac{1}{n}\\cdot\\frac{2}{n}\\cdots\\frac{n}{n} \\le \\frac{1}{n}$, since every other factor is at most 1.', 'So $0 < a_n \\le \\frac{1}{n} \\to 0$: the limit is 0.'] },
      { t: '\\frac{\\ln n}{n}', v: '0', s: ['Treat $n$ as a real variable $x$: $\\lim_{x\\to\\infty}\\frac{\\ln x}{x}$ is $\\frac{\\infty}{\\infty}$.', 'L\'Hôpital: $\\frac{1/x}{1} \\to 0$. So the sequence goes to 0.'] },
      { t: 'n^{1/n}', v: '1', s: ['$\\ln\\left(n^{1/n}\\right) = \\frac{\\ln n}{n} \\to 0$.', 'So $n^{1/n} = e^{(\\ln n)/n} \\to e^{0} = 1$.'] },
      { t: '\\frac{5^{n}}{n!}', v: '0', s: ['Once $n > 10$, each new factor $\\frac{5}{n}$ is less than $\\frac{1}{2}$, so the terms are eventually at most a constant times $\\left(\\frac{1}{2}\\right)^{n}$.', 'So the terms go to 0: factorials beat exponentials.'] }
    ]);
    return done({
      q: 'Find $\\lim_{n\\to\\infty} ' + g.t + '$.' + note,
      a: { t: 'num', v: g.v },
      steps: g.s,
      hint: 'Compare growth rates: logs < powers < exponentials < factorials < $n^{n}$.'
    }, null);
  });

  G('calc2.monotone-bounded', function (R, ctx) {
    var shape = by(ctx, R.pick(['first', 'linrec', 'mono']), R.pick(['linrec', 'sqrtrec', 'mono']), R.pick(['sqrtrec', 'newton', 'mono', 'linrec']));
    if (shape === 'first' || shape === 'linrec') {
      var p = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4)]), q = R.int(1, 6), a1 = R.int(0, 4), L = Q(q).div(Q(1).sub(p));
      if (shape === 'first') {
        var a = Q(a1), seq = [a]; for (var i = 0; i < 2; i++) { a = p.mul(a).add(q); seq.push(a); }
        return done({
          q: 'A sequence has $a_1 = ' + a1 + '$ and $a_{n+1} = ' + cf(p, 'a_n') + ' + ' + q + '$. Find $a_3$.',
          a: { t: 'num', v: seq[2].toPlain() },
          steps: ['$a_2 = ' + tx(p) + '\\cdot ' + a1 + ' + ' + q + ' = ' + tx(seq[1]) + '$.', '$a_3 = ' + tx(p) + '\\cdot ' + tp(seq[1]) + ' + ' + q + ' = ' + tx(seq[2]) + '$.', 'The terms creep toward $' + tx(L) + '$, where $L = ' + tx(p) + 'L + ' + q + '$.'],
          hint: 'Apply the rule twice, starting from $a_1$.'
        }, null);
      }
      return done({
        q: 'A sequence has $a_1 = ' + a1 + '$ and $a_{n+1} = ' + cf(p, 'a_n') + ' + ' + q + '$. It is monotone and bounded, so it converges. Find its limit.',
        a: { t: 'num', v: L.toPlain() },
        steps: ['If $a_n \\to L$, then $a_{n+1} \\to L$ too, so the limit must satisfy $L = ' + cf(p, 'L') + ' + ' + q + '$.', '$' + tx(Q(1).sub(p)) + 'L = ' + q + '$, so $L = ' + tx(L) + '$.', 'This trick only finds the limit after you know one exists; that is what "monotone and bounded" guarantees.'],
        hint: 'Let $n \\to \\infty$ on both sides of the rule.'
      }, { custom: function () { var a = a1; for (var i = 0; i < 300; i++) a = p.toNumber() * a + q; return Math.abs(a - L.toNumber()) < 1e-9 ? '' : 'lim ' + a; } });
    }
    if (shape === 'sqrtrec') {
      var m = R.int(2, 5), c = m * (m - 1), a0 = R.pick([0, 1]);
      return done({
        q: 'Let $a_1 = ' + a0 + '$ and $a_{n+1} = \\sqrt{' + c + ' + a_n}$. The sequence is increasing and bounded above, so it converges. Find its limit.',
        a: { t: 'num', v: String(m) },
        steps: ['The limit $L$ satisfies $L = \\sqrt{' + c + ' + L}$, so $L^{2} = ' + c + ' + L$.', '$L^{2} - L - ' + c + ' = (L - ' + m + ')(L + ' + (m - 1) + ') = 0$.', 'The terms are positive, so $L = ' + m + '$ (not $-' + (m - 1) + '$).'],
        hint: 'Set $L = \\sqrt{' + c + ' + L}$ and solve.'
      }, { custom: function () { var a = a0; for (var i = 0; i < 200; i++) a = Math.sqrt(c + a); return Math.abs(a - m) < 1e-9 ? '' : 'sqrt rec'; } });
    }
    if (shape === 'newton') {
      var cn = R.pick([2, 3, 5, 6, 7, 10]);
      return done({
        q: 'Let $a_1 = 1$ and $a_{n+1} = \\frac{1}{2}\\left(a_n + \\frac{' + cn + '}{a_n}\\right)$. After the first step the sequence decreases and stays positive, so it converges. Find its limit exactly.',
        a: { t: 'num', v: 'sqrt(' + cn + ')' },
        steps: ['The limit satisfies $L = \\frac{1}{2}\\left(L + \\frac{' + cn + '}{L}\\right)$, so $2L = L + \\frac{' + cn + '}{L}$.', 'Then $L = \\frac{' + cn + '}{L}$, so $L^{2} = ' + cn + '$.', 'The terms are positive, so $L = \\sqrt{' + cn + '}$. (This is Newton\'s method for $x^{2} = ' + cn + '$.)'],
        hint: 'Put $L$ in for both $a_n$ and $a_{n+1}$.'
      }, { custom: function () { var a = 1; for (var i = 0; i < 60; i++) a = (a + cn / a) / 2; return Math.abs(a - Math.sqrt(cn)) < 1e-12 ? '' : 'newton'; } });
    }
    var k = R.int(1, 5), fams = [
      { t: '\\frac{n}{n + ' + k + '}', r: 'Increasing and bounded above by 1, so it converges.', w: ['Decreasing and bounded below by 0, so it converges to 0.', 'Increasing and unbounded, so it diverges.', 'Not monotone, so it must diverge.'], s: '$a_n = 1 - \\frac{' + k + '}{n + ' + k + '}$: the subtracted part shrinks, so $a_n$ increases, and it stays below 1. A monotone bounded sequence converges (here to 1).' },
      { t: '\\frac{n + ' + k + '}{n}', r: 'Decreasing and bounded below by 1, so it converges.', w: ['Increasing and bounded above, so it converges.', 'Decreasing and unbounded, so it diverges.', 'Bounded, so it converges, whether or not it is monotone.'], s: '$a_n = 1 + \\frac{' + k + '}{n}$ decreases and never drops below 1. Decreasing and bounded below means it converges (to 1).' },
      { t: '\\frac{n^{2}}{n + ' + k + '}', r: 'Increasing and unbounded, so it diverges.', w: ['Increasing and bounded above by 1, so it converges.', 'Decreasing, so it converges.', 'Bounded, so it converges.'], s: '$\\frac{n^{2}}{n + ' + k + '} > \\frac{n^{2}}{2n} = \\frac{n}{2}$ once $n \\ge ' + k + '$, so it grows without bound.' },
      { t: '\\frac{(-1)^{n}}{n}', r: 'Not monotone, but it still converges to 0.', w: ['Not monotone, so it must diverge.', 'Decreasing and bounded, so it converges.', 'Increasing and bounded, so it converges.'], s: 'The signs alternate, so it is not monotone. The theorem then says nothing, but the squeeze theorem does: $|a_n| = \\frac{1}{n} \\to 0$. Monotone and bounded is a sufficient condition, not a necessary one.' }
    ], F = R.pick(fams);
    return done({
      q: 'Which statement about $a_n = ' + F.t + '$ (for $n \\ge 1$) is true?',
      a: mc(F.r, F.w),
      steps: [F.s, 'The monotone convergence theorem: a sequence that is increasing and bounded above (or decreasing and bounded below) converges.'],
      hint: 'Check whether the terms always move the same way, and whether they are trapped below (or above) some number.'
    }, null);
  });

  G('calc2.series-partial-sums', function (R, ctx) {
    var shape = by(ctx, R.pick(['Sn', 'trap', 'Sn', 'Sn', 'Sn']), R.pick(['fromSn', 'Sn', 'term']), R.pick(['fromSn', 'term', 'trap']));
    if (shape === 'Sn') {
      var K = R.int(1, 6), KT = String(K);
      var fams = [
        { t: '\\frac{' + KT + '}{n(n+1)}', f: function (n) { return Q(K, n * (n + 1)); }, p: K + '/(n*(n+1))' },
        { t: '\\frac{' + KT + '}{2^{n}}', f: function (n) { return Q(K, Math.pow(2, n)); }, p: K + '/2^n' },
        { t: '\\frac{(-1)^{n+1}}{n}', f: function (n) { return Q(n % 2 ? 1 : -1, n); }, p: '(-1)^(n+1)/n' },
        { t: '\\frac{1}{n^{2}}', f: function (n) { return Q(1, n * n); }, p: '1/n^2' },
        { t: '\\frac{' + KT + '}{3^{n}}', f: function (n) { return Q(K, Math.pow(3, n)); }, p: K + '/3^n' },
        { t: '\\frac{1}{n}', f: function (n) { return Q(1, n); }, p: '1/n' },
        { t: '\\frac{n}{n + 1}', f: function (n) { return Q(n, n + 1); }, p: 'n/(n+1)' },
        { t: '\\frac{' + KT + '}{n(n+2)}', f: function (n) { return Q(K, n * (n + 2)); }, p: K + '/(n*(n+2))' },
        { t: '\\frac{(-1)^{n}}{' + (K + 1) + '^{n}}', f: function (n) { return Q(n % 2 ? -1 : 1, Math.pow(K + 1, n)); }, p: '(-1)^n/' + (K + 1) + '^n' },
        { t: '(2n - 1)', f: function (n) { return Q(2 * n - 1); }, p: '2*n-1' },
        { t: '\\frac{n}{2^{n}}', f: function (n) { return Q(n, Math.pow(2, n)); }, p: 'n/2^n' }
      ], F = R.pick(fams), N = R.int(3, 6), S = Q(0), parts = [];
      for (var n = 1; n <= N; n++) { var t = F.f(n); S = S.add(t); parts.push(tx(t)); }
      return done({
        q: 'Find the partial sum $S_{' + N + '}$ of the series $' + SUM(1, F.t) + '$.',
        a: { t: 'num', v: S.toPlain() },
        steps: ['$S_{' + N + '}$ adds the first ' + N + ' terms: $a_1 + a_2 + \\cdots + a_{' + N + '}$.', '$S_{' + N + '} = ' + parts.join(' + ').replace(/\+ -/g, '- ') + '$.', '$S_{' + N + '} = ' + tx(S) + '$.'],
        hint: 'Write out the first terms and add them.',
        viz: { name: 'seriespartial', opts: { quiet: true, a: F.p, start: 1, N: N, maxN: 40 } }
      }, null);
    }
    if (shape === 'trap') {
      return done({
        q: 'For the harmonic series $' + SUM(1, '\\frac{1}{n}') + '$, the terms go to 0. Which statement is true?',
        a: mc('It diverges: its partial sums grow without bound, even though the terms shrink to 0.', ['It converges, because its terms go to 0.', 'It converges to 1, because the terms add up to less than 1.', 'It converges, because each term is smaller than the one before.']),
        steps: ['A series converges when its partial sums approach a number. Terms going to 0 is required for that, but it is not enough.', 'Group the terms: $\\frac{1}{3} + \\frac{1}{4} > \\frac{1}{2}$, $\\frac{1}{5} + \\cdots + \\frac{1}{8} > \\frac{1}{2}$, $\\frac{1}{9} + \\cdots + \\frac{1}{16} > \\frac{1}{2}$, and so on.', 'You can make infinitely many groups each worth more than $\\frac{1}{2}$, so the partial sums pass every bound.'],
        hint: 'Look at the partial sums, not at the terms.',
        viz: { name: 'seriespartial', opts: { quiet: true, a: '1/n', start: 1, N: 30, maxN: 60 } }
      }, null);
    }
    var a = R.int(1, 6), b = R.int(1, 4), kind = R.pick(['rat', 'geo']);
    var SnT, Sn, lim;
    if (kind === 'rat') { var c = R.int(1, 3); SnT = '\\frac{' + cf(a, 'n') + '}{' + cf(c, 'n') + ' + ' + b + '}'; Sn = function (n) { return Q(a * n, c * n + b); }; lim = Q(a, c); }
    else { var r = R.pick([2, 3, 4]); SnT = a + ' - \\frac{' + a + '}{' + r + '^{n}}'; Sn = function (n) { return Q(a).sub(Q(a, Math.pow(r, n))); }; lim = Q(a); }
    if (shape === 'fromSn') return done({
      q: 'The partial sums of a series are $S_n = ' + SnT + '$. Find the sum of the series.',
      a: { t: 'num', v: lim.toPlain() },
      steps: ['The sum of a series is the limit of its partial sums: $\\sum a_n = \\lim_{n\\to\\infty} S_n$.', kind === 'rat' ? 'Divide top and bottom by $n$: $S_n \\to ' + tx(lim) + '$.' : 'The fraction goes to 0, so $S_n \\to ' + a + '$.', 'So the series converges to $' + tx(lim) + '$.'],
      hint: 'Take the limit of $S_n$.'
    }, null);
    var k = R.int(2, 6), ak = Sn(k).sub(Sn(k - 1));
    return done({
      q: 'The partial sums of a series are $S_n = ' + SnT + '$. Find the term $a_{' + k + '}$.',
      a: { t: 'num', v: ak.toPlain() },
      steps: ['$S_{' + k + '} = a_1 + \\cdots + a_{' + k + '}$ and $S_{' + (k - 1) + '} = a_1 + \\cdots + a_{' + (k - 1) + '}$.', 'So $a_{' + k + '} = S_{' + k + '} - S_{' + (k - 1) + '} = ' + tx(Sn(k)) + ' - ' + tp(Sn(k - 1)) + ' = ' + tx(ak) + '$.'],
      hint: 'Each term is the difference of two neighboring partial sums.'
    }, null);
  });

  G('calc2.geometric-telescoping', function (R, ctx) {
    var shape = by(ctx, R.pick(['geo', 'decimal', 'geo']), R.pick(['geo', 'tele', 'form', 'decide']), R.pick(['tele', 'form', 'decide', 'tele']));
    if (shape === 'geo') {
      var rr = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(-1, 2), Q(-1, 3), Q(3, 4), Q(-2, 5), Q(1, 4)]), c = R.nz(-4, 6), lo = by(ctx, R.pick([0, 1]), R.pick([0, 1, 2]), R.pick([1, 2, 3]));
      var first = Qf(c).mul(rr.pow(lo)), S = first.div(Q(1).sub(rr));
      return done({
        q: 'Find the sum $' + SUM(lo, (c === 1 ? '' : c === -1 ? '-' : c) + powT(rr, 'n')) + '$.',
        a: { t: 'num', v: S.toPlain() },
        steps: ['This is geometric with ratio $r = ' + tx(rr) + '$, and $|r| < 1$, so it converges.', 'First term (at $n = ' + lo + '$): $' + tx(first) + '$.', 'Sum $= \\frac{\\text{first term}}{1 - r} = \\frac{' + tx(first) + '}{1 - ' + tp(rr) + '} = ' + tx(S) + '$.'],
        hint: 'Sum = first term ÷ (1 − ratio). Be careful which term is first.'
      }, { custom: function () { var s = nsum(function (n) { return c * Math.pow(rr.toNumber(), n); }, lo, 200); return Math.abs(s - S.toNumber()) < 1e-9 ? '' : 'geo ' + s; } });
    }
    if (shape === 'decimal') {
      var len = R.pick([1, 2, 2, 3]), digs = len === 1 ? String(R.int(1, 8)) : len === 2 ? String(R.int(10, 98)) : String(R.int(101, 998));
      if (/^(\d)\1+$/.test(digs)) digs = digs.slice(0, -1) + ((+digs.slice(-1) + 1) % 10);
      var den = Math.pow(10, len) - 1, val = Q(+digs, den);
      return done({
        q: 'Write the repeating decimal $0.\\overline{' + digs + '}$ as a fraction by treating it as a geometric series.',
        a: { t: 'num', v: val.toPlain(), form: 'frac' },
        steps: ['$0.\\overline{' + digs + '} = \\frac{' + digs + '}{10^{' + len + '}} + \\frac{' + digs + '}{10^{' + 2 * len + '}} + \\cdots$, a geometric series with first term $\\frac{' + digs + '}{' + Math.pow(10, len) + '}$ and ratio $\\frac{1}{' + Math.pow(10, len) + '}$.', 'Sum: $\\frac{' + digs + '/' + Math.pow(10, len) + '}{1 - 1/' + Math.pow(10, len) + '} = \\frac{' + digs + '}{' + den + '}$.', 'In lowest terms: $' + tx(val) + '$.'],
        hint: 'Each block of repeating digits is the previous one divided by a power of 10.'
      }, null);
    }
    if (shape === 'form') {
      var b = R.int(2, 5), d = R.intNot(b + 1, 8, []), sh = R.int(1, 2), r2 = Q(b, d);
      // sum_{n=1}^inf b^n / d^(n+sh) = (1/d^sh) * (b/d)/(1 - b/d)
      var S2 = Q(1, Math.pow(d, sh)).mul(r2.div(Q(1).sub(r2)));
      return done({
        q: 'Find $' + SUM(1, '\\frac{' + b + '^{n}}{' + d + '^{n+' + sh + '}}') + '$.',
        a: { t: 'num', v: S2.toPlain() },
        steps: ['Rewrite: $\\frac{' + b + '^{n}}{' + d + '^{n+' + sh + '}} = \\frac{1}{' + Math.pow(d, sh) + '}\\left(\\frac{' + b + '}{' + d + '}\\right)^{n}$. Geometric with $r = ' + tx(r2) + '$.', 'First term ($n = 1$): $\\frac{1}{' + Math.pow(d, sh) + '}\\cdot ' + tx(r2) + ' = ' + tx(r2.div(Math.pow(d, sh))) + '$.', 'Sum: $\\frac{' + tx(r2.div(Math.pow(d, sh))) + '}{1 - ' + tx(r2) + '} = ' + tx(S2) + '$.'],
        hint: 'Pull out constants so the term looks like $c\\,r^{n}$.'
      }, { custom: function () { var s = nsum(function (n) { return Math.pow(b, n) / Math.pow(d, n + sh); }, 1, 300); return Math.abs(s - S2.toNumber()) < 1e-9 ? '' : 'form ' + s; } });
    }
    if (shape === 'decide') {
      var r3 = R.pick([Q(3, 2), Q(-5, 4), Q(-1), Q(4, 3), Q(2), Q(5, 3)]);
      return done({
        q: 'What can you say about $' + SUM(0, powT(r3, 'n')) + '$?',
        a: mc('It diverges, because $|r| = ' + tx(r3.abs()) + ' \\ge 1$, so the terms do not go to 0.', ['It converges to $' + tx(Q(1).div(Q(1).sub(r3))) + '$, by the formula $\\frac{1}{1 - r}$.', 'It converges, because it is geometric.', 'It converges to 0.']),
        steps: ['A geometric series converges only when $|r| < 1$.', 'Here $|r| = ' + tx(r3.abs()) + '$, so the terms ' + (r3.abs().eq(1) ? 'keep size 1' : 'grow') + ' and do not approach 0. The series diverges.', 'The formula $\\frac{a}{1 - r}$ only applies when $|r| < 1$; using it here gives a meaningless number.'],
        hint: 'Check $|r|$ before using the sum formula.'
      }, null);
    }
    var tf = R.pick(['k', 'shift', 'root', 'log']);
    if (tf === 'k') {
      var k = R.int(1, 3), Sk = Q(0); for (var j = 1; j <= k; j++) Sk = Sk.add(Q(1, j)); Sk = Sk.div(k);
      var cc = R.pick([1, k, 2 * k]), Sc = Sk.mul(cc);
      return done({
        q: 'Find $' + SUM(1, '\\frac{' + cc + '}{n(n + ' + k + ')}') + '$.',
        a: { t: 'num', v: Sc.toPlain() },
        steps: ['Partial fractions: $\\frac{' + cc + '}{n(n + ' + k + ')} = ' + (Q(cc, k).eq(1) ? '' : tx(Q(cc, k))) + '\\left(\\frac{1}{n} - \\frac{1}{n + ' + k + '}\\right)$.', 'In the partial sum most terms cancel: each $-\\frac{1}{n + ' + k + '}$ cancels a later $+\\frac{1}{n}$. What survives is $' + (k === 1 ? tx(Q(cc, k)) + '\\cdot 1' : (Q(cc, k).eq(1) ? '' : tx(Q(cc, k))) + '\\left(' + Array.apply(null, Array(k)).map(function (_, i) { return '\\frac{1}{' + (i + 1) + '}'; }).join(' + ').replace('\\frac{1}{1}', '1') + '\\right)') + '$ minus terms that go to 0.', 'Sum: $' + tx(Sc) + '$.'],
        hint: 'Split into a difference, write out the first few partial sums, and watch the cancellation.'
      }, { custom: function () { var s = nsum(function (n) { return cc / (n * (n + k)); }, 1, 2e6); return Math.abs(s - Sc.toNumber()) < 1e-5 ? '' : 'tele k ' + s; } });
    }
    if (tf === 'shift') {
      var m = R.int(1, 3), p = R.int(0, 2), c2 = R.int(1, 4), S3 = Q(c2, m + p + 1);
      return done({
        q: 'Find $' + SUM(m, '\\frac{' + c2 + '}{(n + ' + (p + 1) + ')(n + ' + (p + 2) + ')}') + '$.',
        a: { t: 'num', v: S3.toPlain() },
        steps: ['$\\frac{' + c2 + '}{(n + ' + (p + 1) + ')(n + ' + (p + 2) + ')} = ' + (c2 === 1 ? '' : c2) + '\\left(\\frac{1}{n + ' + (p + 1) + '} - \\frac{1}{n + ' + (p + 2) + '}\\right)$.', '$S_N = ' + (c2 === 1 ? '' : c2) + '\\left(\\frac{1}{' + (m + p + 1) + '} - \\frac{1}{N + ' + (p + 2) + '}\\right)$: everything in between cancels.', 'As $N \\to \\infty$: $' + tx(S3) + '$.'],
        hint: 'Write the term as a difference of two fractions; the middle terms cancel.'
      }, { custom: function (pp2) { var s = nsum(function (n) { return c2 / ((n + p + 1) * (n + p + 2)); }, m, 2e6); return Math.abs(s - ML.evalPlain(pp2.a.v)) < 1e-5 ? '' : 'tele shift ' + s; } });
    }
    if (tf === 'root') return done({
      q: 'Find $' + SUM(1, '\\left(\\frac{1}{\\sqrt{n}} - \\frac{1}{\\sqrt{n + 1}}\\right)') + '$.',
      a: { t: 'num', v: '1' },
      steps: ['$S_N = \\left(1 - \\frac{1}{\\sqrt{2}}\\right) + \\left(\\frac{1}{\\sqrt{2}} - \\frac{1}{\\sqrt{3}}\\right) + \\cdots + \\left(\\frac{1}{\\sqrt{N}} - \\frac{1}{\\sqrt{N + 1}}\\right)$.', 'Everything cancels except $1 - \\frac{1}{\\sqrt{N + 1}}$.', 'As $N \\to \\infty$, $S_N \\to 1$.'],
      hint: 'Write out $S_N$ and cancel.'
    }, null);
    return done({
      q: 'What can you say about $' + SUM(1, '\\ln\\frac{n + 1}{n}') + '$?',
      a: mc('It diverges: $S_N = \\ln(N + 1)$, which grows without bound.', ['It converges to 0, because $\\ln\\frac{n + 1}{n} \\to 0$.', 'It converges to $\\ln 2$.', 'It converges to 1, because it telescopes.']),
      steps: ['$\\ln\\frac{n + 1}{n} = \\ln(n + 1) - \\ln n$, so it telescopes.', '$S_N = \\ln(N + 1) - \\ln 1 = \\ln(N + 1)$.', 'This grows without bound, so the series diverges, even though its terms go to 0 and it telescopes.'],
      hint: 'Find a formula for $S_N$ and take its limit.'
    }, null);
  });

  // a bank of sequences for the divergence test: [TeX, limit plain or 'DNE', explanation]
  G('calc2.divergence-test', function (R, ctx) {
    var shape = by(ctx, R.pick(['multi', 'trap']), 'multi', R.pick(['multi', 'multi', 'trap']));
    var k = R.int(2, 9), c = R.int(1, 9);
    var bank = [
      ['\\frac{' + cf(k, 'n') + '}{' + cf(c, 'n') + ' + 1}', Q(k, c).toPlain(), 'Divide by $n$: $\\frac{' + k + '}{' + c + ' + 1/n} \\to ' + tx(Q(k, c)) + '$.'],
      ['\\frac{n^{2}}{' + cf(k, 'n^{2}') + ' - n}', Q(1, k).toPlain(), 'Divide by $n^{2}$: $\\frac{1}{' + k + ' - 1/n} \\to ' + tx(Q(1, k)) + '$.'],
      ['\\cos\\frac{' + c + '}{n}', '1', '$\\frac{' + c + '}{n} \\to 0$ and cosine is continuous, so the terms go to $\\cos 0 = 1$.'],
      ['n\\sin\\frac{' + k + '}{n}', String(k), 'With $x = \\frac{' + k + '}{n} \\to 0$: $n\\sin\\frac{' + k + '}{n} = ' + k + '\\cdot\\frac{\\sin x}{x} \\to ' + k + '$.'],
      ['\\left(1 + \\frac{1}{n}\\right)^{n}', 'e', 'This is the limit that defines $e$.'],
      ['(-1)^{n}\\frac{n}{n + ' + c + '}', 'DNE', 'The size $\\frac{n}{n + ' + c + '} \\to 1$ but the sign alternates, so the terms bounce between values near $1$ and $-1$: no limit.'],
      ['\\frac{' + c + '}{n}', '0', 'The top is fixed and the bottom grows: the terms go to 0.'],
      ['\\frac{1}{n^{2} + ' + k + '}', '0', 'The bottom grows without bound, so the terms go to 0.'],
      ['\\frac{1}{\\ln n}', '0', '$\\ln n \\to \\infty$, so the terms go to 0.'],
      ['\\frac{' + cf(k, 'n') + '}{n^{2} + 1}', '0', 'Higher degree on the bottom: the terms go to 0.'],
      ['\\left(1 + \\frac{' + k + '}{n}\\right)^{n}', 'e^(' + k + ')', 'This is $\\left(1 + \\frac{x}{n}\\right)^{n} \\to e^{x}$ with $x = ' + k + '$.'],
      ['\\frac{' + k + '^{n}}{' + k + '^{n} + ' + c + '}', '1', 'Divide top and bottom by $' + k + '^{n}$: $\\frac{1}{1 + ' + c + '/' + k + '^{n}} \\to 1$.'],
      ['\\sqrt[n]{' + (c + 1) + '}', '1', '$' + (c + 1) + '^{1/n} = e^{(\\ln ' + (c + 1) + ')/n} \\to e^{0} = 1$.'],
      ['\\frac{' + cf(c, 'n') + '}{\\sqrt{n^{2} + ' + k + '}}', String(c), 'Divide top and bottom by $n$: $\\frac{' + c + '}{\\sqrt{1 + ' + k + '/n^{2}}} \\to ' + c + '$.'],
      ['\\arctan(' + cf(k, 'n') + ')', 'pi/2', 'As $x \\to \\infty$, $\\arctan x \\to \\frac{\\pi}{2}$.'],
      ['\\frac{n + ' + c + '}{' + cf(k, 'n') + '}', Q(1, k).toPlain(), 'Divide by $n$: $\\frac{1 + ' + c + '/n}{' + k + '} \\to ' + tx(Q(1, k)) + '$.'],
      ['\\cos(n\\pi)', 'DNE', '$\\cos(n\\pi) = (-1)^{n}$ keeps switching between $1$ and $-1$: no limit.'],
      ['\\ln\\frac{' + cf(k, 'n') + ' + ' + c + '}{n}', 'ln(' + k + ')', '$\\frac{' + cf(k, 'n') + ' + ' + c + '}{n} \\to ' + k + '$ and $\\ln$ is continuous, so the terms go to $\\ln ' + k + '$.'],
      ['\\frac{' + c + '}{\\sqrt{n}}', '0', 'The top is fixed and $\\sqrt{n}$ grows: the terms go to 0.'],
      ['\\frac{1}{' + k + '^{n}}', '0', 'The bottom grows without bound: the terms go to 0.']
    ];
    if (shape === 'trap') {
      var z = R.pick(bank.filter(function (b) { return b[1] === '0'; }));
      return done({
        q: 'For $' + SUM(z[0] === '\\frac{1}{\\ln n}' ? 2 : 1, z[0]) + '$, the terms go to 0. What does the divergence test tell you?',
        a: mc('Nothing: when the terms go to 0, the test gives no conclusion.', ['The series converges.', 'The series diverges.', 'The series converges to 0.']),
        steps: ['The divergence test only works one way: if $a_n \\not\\to 0$, the series diverges.', 'If $a_n \\to 0$, the series might converge ($\\sum\\frac{1}{n^{2}}$) or diverge ($\\sum\\frac{1}{n}$). You need another test.'],
        hint: 'The test can only ever prove divergence.'
      }, null);
    }
    var B = R.pick(bank), lo = B[0] === '\\frac{1}{\\ln n}' ? 2 : 1, conc = B[1] === '0' ? 2 : 0;
    return done({
      q: 'Use the divergence test on $' + SUM(lo, B[0]) + '$. First find $\\lim_{n\\to\\infty} a_n$ (type DNE if it does not exist), then choose the conclusion.',
      a: { t: 'multi', parts: [{ label: '$\\lim a_n =$', a: { t: 'num', v: B[1] } }, { label: 'Conclusion', a: { t: 'mc', choices: CONC3.slice(), v: conc, keep: true } }] },
      steps: [B[2], conc === 2 ? 'The terms go to 0, so the divergence test says nothing. (Another test is needed.)' : 'The terms do not go to 0, so the series diverges: adding infinitely many terms that stay away from 0 cannot settle down.'],
      hint: 'If the terms do not go to 0, the partial sums keep taking steps of non-shrinking size.'
    }, null);
  });

  G('calc2.integral-test', function (R, ctx) {
    var shape = by(ctx, R.pick(['p', 'p', 'tf']), R.pick(['int', 'p', 'bound', 'lnp']), R.pick(['int', 'bound', 'lnp']));
    if (shape === 'p') {
      var ps0 = [['\\frac{1}{\\sqrt{n}}', Q(1, 2)], ['\\frac{1}{n}', Q(1)], ['\\frac{1}{n\\sqrt{n}}', Q(3, 2)], ['\\frac{1}{n^{2}}', Q(2)], ['\\frac{1}{\\sqrt[3]{n^{2}}}', Q(2, 3)], ['\\frac{1}{n^{1.01}}', Q(101, 100)], ['\\frac{1}{n^{0.99}}', Q(99, 100)], ['\\frac{1}{\\sqrt[4]{n^{5}}}', Q(5, 4)], ['\\frac{\\sqrt{n}}{n^{2}}', Q(3, 2)], ['\\frac{n}{n^{3}}', Q(2)]];
      var F = R.pick(ps0), conv = F[1].gt(1), pT = F[1].isInt() ? tx(F[1]) : F[1].den() === 100 ? dec(F[1]) : tx(F[1]);
      return done({
        q: 'Does $' + SUM(1, F[0]) + '$ converge or diverge?',
        a: mc(conv ? 'Converges: it is a $p$-series with $p = ' + pT + ' > 1$.' : 'Diverges: it is a $p$-series with $p = ' + pT + ' \\le 1$.', conv ? ['Diverges: it is a $p$-series with $p = ' + pT + '$.', 'Converges, because the terms go to 0.', 'Diverges, because the terms go to 0 too slowly to tell.'] : ['Converges: it is a $p$-series with $p = ' + pT + '$.', 'Converges, because the terms go to 0.', 'Converges, because each term is smaller than the one before.']),
        steps: ['Write the term as $\\frac{1}{n^{p}}$: here $p = ' + pT + '$.', 'By the integral test, $\\sum\\frac{1}{n^{p}}$ behaves like $\\int_1^{\\infty}\\frac{dx}{x^{p}}$, which converges exactly when $p > 1$.', conv ? 'Since $p > 1$, the series converges.' : 'Since $p \\le 1$, the series diverges.'],
        hint: 'Rewrite the term as a single power of $n$.'
      }, null);
    }
    if (shape === 'tf') {
      var p2 = R.pick([2, 3, 4]);
      return done({
        q: 'True or false: $' + SUM(1, '\\frac{1}{n^{' + p2 + '}}') + ' = \\int_1^{\\infty}\\frac{dx}{x^{' + p2 + '}} = ' + tx(Q(1, p2 - 1)) + '$.',
        a: { t: 'tf', v: false },
        steps: ['The integral test says the series and the integral both converge or both diverge. It does not say they are equal.', 'The terms $a_n$ are the heights of rectangles of width 1 starting at $n = 1$; the first rectangle alone has area 1, and the rectangles stick out above the curve.', p2 === 2 ? 'In fact $\\sum\\frac{1}{n^{2}} = \\frac{\\pi^{2}}{6} \\approx 1.645$, while the integral is 1.' : 'The sum is between $' + tx(Q(1, p2 - 1)) + '$ and $1 + ' + tx(Q(1, p2 - 1)) + '$, but not equal to $' + tx(Q(1, p2 - 1)) + '$.'],
        hint: 'Draw the rectangles: are they inside or outside the curve?',
        viz: { name: 'seriespartial', opts: { quiet: true, a: '1/n^' + p2, start: 1, N: 12, maxN: 40, limit: p2 === 2 ? 'pi^2/6' : null } }
      }, null);
    }
    if (shape === 'int') {
      var F2 = R.pick([
        { s: 'n e^{-n^{2}}', lo: 1, I: '\\int_1^{\\infty} x e^{-x^{2}}\\,dx = \\left[-\\frac{1}{2}e^{-x^{2}}\\right]_1^{\\infty}', v: '1/(2*e)', vT: '\\frac{1}{2e}', ip: 'x*e^(-x^2)', ia: 1 },
        { s: '\\frac{1}{n(\\ln n)^{2}}', lo: 2, I: '\\int_2^{\\infty}\\frac{dx}{x(\\ln x)^{2}} = \\left[-\\frac{1}{\\ln x}\\right]_2^{\\infty}', v: '1/ln(2)', vT: '\\frac{1}{\\ln 2}', ip: '1/x^2', ia: Math.log(2) },
        { s: '\\frac{1}{n^{2} + 1}', lo: 1, I: '\\int_1^{\\infty}\\frac{dx}{x^{2} + 1} = \\Big[\\arctan x\\Big]_1^{\\infty}', v: 'pi/4', vT: '\\frac{\\pi}{4}', ip: '1/(x^2+1)', ia: 1 },
        { s: '\\frac{n}{(n^{2} + 1)^{2}}', lo: 1, I: '\\int_1^{\\infty}\\frac{x\\,dx}{(x^{2} + 1)^{2}} = \\left[-\\frac{1}{2(x^{2} + 1)}\\right]_1^{\\infty}', v: '1/4', vT: '\\frac{1}{4}', ip: 'x/(x^2+1)^2', ia: 1 },
        { s: '\\frac{1}{n^{3}}', lo: 1, I: '\\int_1^{\\infty}\\frac{dx}{x^{3}} = \\left[-\\frac{1}{2x^{2}}\\right]_1^{\\infty}', v: '1/2', vT: '\\frac{1}{2}', ip: '1/x^3', ia: 1 },
        { s: '\\frac{1}{n^{4}}', lo: 2, I: '\\int_2^{\\infty}\\frac{dx}{x^{4}} = \\left[-\\frac{1}{3x^{3}}\\right]_2^{\\infty}', v: '1/24', vT: '\\frac{1}{24}', ip: '1/x^4', ia: 2 },
        { s: 'e^{-n}', lo: 1, I: '\\int_1^{\\infty} e^{-x}\\,dx = \\Big[-e^{-x}\\Big]_1^{\\infty}', v: '1/e', vT: '\\frac{1}{e}', ip: 'e^(-x)', ia: 1 }
      ]);
      if (R.coin()) {
        var pf = R.pick(['p', 'p', 'e', 'rat']);
        if (pf === 'p') { var pk = R.int(2, 5), lk = R.int(1, 3), xk = pk === 2 ? 'x' : 'x^{' + (pk - 1) + '}', vk = Q(1, (pk - 1) * Math.pow(lk, pk - 1));
          F2 = { s: '\\frac{1}{n^{' + pk + '}}', lo: lk, I: '\\int_' + lk + '^{\\infty}\\frac{dx}{x^{' + pk + '}} = \\left[-\\frac{1}{' + (pk === 2 ? '' : pk - 1) + xk + '}\\right]_' + lk + '^{\\infty}', v: vk.toPlain(), vT: tx(vk), ip: '1/x^' + pk, ia: lk }; }
        else if (pf === 'e') { var ek = R.int(2, 5);
          F2 = { s: 'e^{-' + ek + 'n}', lo: 1, I: '\\int_1^{\\infty} e^{-' + ek + 'x}\\,dx = \\left[-\\frac{e^{-' + ek + 'x}}{' + ek + '}\\right]_1^{\\infty}', v: '1/(' + ek + '*e^' + ek + ')', vT: '\\frac{1}{' + ek + 'e^{' + ek + '}}', ip: 'e^(-' + ek + '*x)', ia: 1 }; }
        else { var ak = R.int(2, 8), vr = Q(1, 2 * (1 + ak));
          F2 = { s: '\\frac{n}{(n^{2} + ' + ak + ')^{2}}', lo: 1, I: '\\int_1^{\\infty}\\frac{x\\,dx}{(x^{2} + ' + ak + ')^{2}} = \\left[-\\frac{1}{2(x^{2} + ' + ak + ')}\\right]_1^{\\infty}', v: vr.toPlain(), vT: tx(vr), ip: 'x/(x^2+' + ak + ')^2', ia: 1 }; }
      }
      return done({
        q: 'To apply the integral test to $' + SUM(F2.lo, F2.s) + '$, evaluate the matching improper integral $\\int_{' + F2.lo + '}^{\\infty} f(x)\\,dx$.',
        a: { t: 'num', v: F2.v },
        steps: ['$f(x)$ is positive, continuous and decreasing for $x \\ge ' + F2.lo + '$, so the integral test applies.', D(F2.I + ' = ' + F2.vT), 'The integral converges, so the series converges too. (Its sum is a different number.)'],
        hint: 'Replace $n$ by $x$ and integrate to infinity as a limit.'
      }, { int: F2.ip, a: F2.ia, inf: true });
    }
    if (shape === 'lnp') {
      var p3 = R.pick([Q(1, 2), Q(1), Q(2), Q(3, 2), Q(3), Q(1, 3), Q(2, 3), Q(5, 2), Q(4), Q(5, 4)]), conv3 = p3.gt(1), p3T = tx(p3);
      return done({
        q: 'Does $' + SUM(2, '\\frac{1}{n(\\ln n)^{' + p3T + '}}') + '$ converge or diverge?',
        a: mc(conv3 ? 'Converges, by the integral test.' : 'Diverges, by the integral test.', [conv3 ? 'Diverges, by the integral test.' : 'Converges, by the integral test.', 'Converges, because it is a $p$-series with $p > 1$.', 'Diverges, because $\\ln n$ grows without bound.']),
        steps: ['Use $u = \\ln x$, $du = \\frac{dx}{x}$: $\\int_2^{\\infty}\\frac{dx}{x(\\ln x)^{' + p3T + '}} = \\int_{\\ln 2}^{\\infty}\\frac{du}{u^{' + p3T + '}}$.', 'That is a $p$-integral in $u$, which converges exactly when the power is greater than 1.', conv3 ? 'Here $' + p3T + ' > 1$, so the series converges.' : 'Here $' + p3T + ' \\le 1$, so the series diverges.'],
        hint: 'Substitute $u = \\ln x$ in the integral.'
      }, null);
    }
    var p4 = R.pick([2, 3, 4, 5, 6]), lowB = Q(1, p4 - 1), highB = Q(1).add(lowB), askHigh = R.coin();
    return done({
      q: 'The integral test gives $\\int_1^{\\infty}\\frac{dx}{x^{' + p4 + '}} \\le ' + SUM(1, '\\frac{1}{n^{' + p4 + '}}') + ' \\le a_1 + \\int_1^{\\infty}\\frac{dx}{x^{' + p4 + '}}$. Find the ' + (askHigh ? 'upper' : 'lower') + ' bound.',
      a: { t: 'num', v: (askHigh ? highB : lowB).toPlain() },
      steps: ['$\\int_1^{\\infty}\\frac{dx}{x^{' + p4 + '}} = \\frac{1}{' + (p4 - 1) + '}$.', 'Rectangles of width 1 under the curve (right endpoints) give $\\sum_{n=2}^{\\infty} a_n \\le \\int_1^{\\infty}$; rectangles over the curve (left endpoints) give $\\sum_{n=1}^{\\infty} a_n \\ge \\int_1^{\\infty}$.', 'So $' + tx(lowB) + ' \\le S \\le 1 + ' + tx(lowB) + ' = ' + tx(highB) + '$. ' + (askHigh ? 'Upper bound: $' + tx(highB) + '$.' : 'Lower bound: $' + tx(lowB) + '$.')],
      hint: 'Evaluate the integral; the first term is $a_1 = 1$.'
    }, { custom: function () { var s = nsum(function (n) { return 1 / Math.pow(n, p4); }, 1, 1e5); return s >= lowB.toNumber() && s <= highB.toNumber() ? '' : 'bounds wrong'; } });
  });

  var CMPS = [
    { s: '\\frac{1}{n^{2} + K}', conv: true, b: '\\frac{1}{n^{2}}', r: 'direct comparison: $\\frac{1}{n^{2} + K} < \\frac{1}{n^{2}}$, and $\\sum\\frac{1}{n^{2}}$ converges', lim: null },
    { s: '\\frac{1}{Kn + 1}', conv: false, b: '\\frac{1}{n}', r: 'limit comparison with $\\frac{1}{n}$: the ratio tends to $\\frac{1}{K}$, a positive number, and $\\sum\\frac{1}{n}$ diverges', lim: 'K1' },
    { s: '\\frac{n + K}{n^{3} + 1}', conv: true, b: '\\frac{1}{n^{2}}', r: 'limit comparison with $\\frac{1}{n^{2}}$: the ratio $\\frac{n^{3} + Kn^{2}}{n^{3} + 1} \\to 1$, and $\\sum\\frac{1}{n^{2}}$ converges', lim: '1' },
    { s: '\\frac{\\sqrt{n}}{n + K}', conv: false, b: '\\frac{1}{\\sqrt{n}}', r: 'limit comparison with $\\frac{1}{\\sqrt{n}}$: the ratio $\\frac{n}{n + K} \\to 1$, and $\\sum\\frac{1}{\\sqrt{n}}$ diverges ($p = \\frac{1}{2}$)', lim: '1' },
    { s: '\\frac{1}{K^{n} + 1}', conv: true, b: '\\frac{1}{K^{n}}', r: 'direct comparison: $\\frac{1}{K^{n} + 1} < \\left(\\frac{1}{K}\\right)^{n}$, a convergent geometric series', lim: null },
    { s: '\\frac{\\ln n}{n}', conv: false, b: '\\frac{1}{n}', r: 'direct comparison: for $n \\ge 3$, $\\frac{\\ln n}{n} > \\frac{1}{n}$, and $\\sum\\frac{1}{n}$ diverges', lim: null },
    { s: '\\frac{\\sin^{2} n}{n^{2}}', conv: true, b: '\\frac{1}{n^{2}}', r: 'direct comparison: $0 \\le \\frac{\\sin^{2} n}{n^{2}} \\le \\frac{1}{n^{2}}$, and $\\sum\\frac{1}{n^{2}}$ converges', lim: null },
    { s: '\\frac{1}{n^{2} - K}', conv: true, b: '\\frac{1}{n^{2}}', r: 'limit comparison with $\\frac{1}{n^{2}}$: the ratio $\\frac{n^{2}}{n^{2} - K} \\to 1$, and $\\sum\\frac{1}{n^{2}}$ converges', lim: '1', lo: 'K' },
    { s: '\\frac{Kn^{2} + 1}{n^{4} + n}', conv: true, b: '\\frac{1}{n^{2}}', r: 'limit comparison with $\\frac{1}{n^{2}}$: the ratio tends to $K$, a positive number, and $\\sum\\frac{1}{n^{2}}$ converges', lim: 'K' },
    { s: '\\frac{2^{n}}{3^{n} - 1}', conv: true, b: '\\left(\\frac{2}{3}\\right)^{n}', r: 'limit comparison with $\\left(\\frac{2}{3}\\right)^{n}$: the ratio $\\frac{3^{n}}{3^{n} - 1} \\to 1$, and the geometric series converges', lim: '1' }
  ];
  G('calc2.comparison-tests', function (R, ctx) {
    var shape = by(ctx, 'mc', R.pick(['mc', 'lct']), R.pick(['mc', 'lct', 'mc']));
    var K = R.int(2, 6), sub = function (s) { return s.replace(/\bK\b/g, String(K)); };
    if (shape === 'lct') {
      var opts = CMPS.filter(function (c) { return c.lim; }), c = R.pick(opts), L = c.lim === 'K1' ? Q(1, K) : c.lim === 'K' ? Q(K) : Q(1);
      return done({
        q: 'Use the limit comparison test on $' + SUM(c.lo ? K : 1, sub(c.s)) + '$ with $b_n = ' + sub(c.b) + '$. Find $\\lim\\frac{a_n}{b_n}$, then choose the conclusion.',
        a: { t: 'multi', parts: [{ label: '$\\lim\\frac{a_n}{b_n} =$', a: { t: 'num', v: L.toPlain() } }, { label: 'Conclusion', a: { t: 'mc', choices: ['The series converges.', 'The series diverges.', 'The test gives no conclusion.'], v: c.conv ? 0 : 1, keep: true } }] },
        steps: ['Limit comparison: if $\\frac{a_n}{b_n} \\to L$ with $0 < L < \\infty$, then $\\sum a_n$ and $\\sum b_n$ do the same thing.', 'Here ' + sub(c.r) + '.', 'Since $L = ' + tx(L) + '$ is positive and finite, the series ' + (c.conv ? 'converges' : 'diverges') + '.'],
        hint: 'Divide $a_n$ by $b_n$ (multiply by its flip) and compare leading terms.'
      }, null);
    }
    var c2 = R.pick(CMPS), right = (c2.conv ? 'Converges, by ' : 'Diverges, by ') + sub(c2.r) + '.';
    var wrongs = c2.conv ? ['Diverges, because the terms are bigger than $\\frac{1}{n^{3}}$, whose series converges.', 'Converges, because the terms go to 0.', 'Diverges, because for large $n$ the terms are smaller than $\\frac{1}{\\sqrt{n}}$, whose series diverges.']
      : ['Converges, because the terms are smaller than $1$.', 'Converges, because the terms go to 0.', 'Converges, because the terms are smaller than $\\frac{' + K + '}{\\sqrt{n}}$.'];
    if (!c2.conv && c2.s === '\\frac{\\sqrt{n}}{n + K}') wrongs[2] = 'Converges, because $\\frac{\\sqrt{n}}{n + ' + K + '} < \\frac{1}{\\sqrt{n}}$.';
    if (!c2.conv && c2.s === '\\frac{1}{Kn + 1}') wrongs[2] = 'Converges, because $\\frac{1}{' + K + 'n + 1} < \\frac{1}{n}$.';
    return done({
      q: 'Does $' + SUM(c2.lo ? K : 1, sub(c2.s)) + '$ converge or diverge? Pick the correct answer and reason.',
      a: mc(right, wrongs),
      steps: ['Compare with $' + sub(c2.b) + '$, whose series you know.', right, c2.conv ? 'To prove convergence, the terms must be smaller than (or comparable to) a convergent series. Being bigger than something convergent proves nothing.' : 'To prove divergence, the terms must be bigger than (or comparable to) a divergent series. Being smaller than something divergent proves nothing.'],
      hint: 'Keep the leading terms of the top and bottom to guess the behavior, then check the direction of the comparison.'
    }, null);
  });

  G('calc2.alternating-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['decide', 'S', 'decide']), R.pick(['bound', 'decide', 'S']), R.pick(['howmany', 'bound', 'decide']));
    var bfams = [
      { t: '\\frac{1}{n}', f: function (n) { return Q(1, n); }, tt: function (n) { return '\\frac{1}{' + n + '}'; } },
      { t: '\\frac{1}{n^{2}}', f: function (n) { return Q(1, n * n); }, tt: function (n) { return '\\frac{1}{' + n * n + '}'; } },
      { t: '\\frac{1}{n!}', f: function (n) { return Q(1, fact(n)); }, tt: function (n) { return '\\frac{1}{' + n + '!}'; } },
      { t: '\\frac{1}{2^{n}}', f: function (n) { return Q(1, Math.pow(2, n)); }, tt: function (n) { return '\\frac{1}{2^{' + n + '}}'; } },
      { t: '\\frac{1}{2n + 1}', f: function (n) { return Q(1, 2 * n + 1); }, tt: function (n) { return '\\frac{1}{' + (2 * n + 1) + '}'; } },
      { t: '\\frac{1}{n^{3}}', f: function (n) { return Q(1, n * n * n); }, tt: function (n) { return '\\frac{1}{' + n * n * n + '}'; } }
    ];
    if (shape === 'S' || shape === 'bound') {
      var F = R.pick(bfams), N = R.int(3, 6);
      if (shape === 'S') {
        var S = Q(0), parts = []; for (var n = 1; n <= N; n++) { var t = F.f(n).mul(n % 2 ? 1 : -1); S = S.add(t); parts.push(tx(t)); }
        return done({
          q: 'Find the partial sum $S_{' + N + '}$ of $' + SUM(1, '(-1)^{n+1}' + F.t) + '$.',
          a: { t: 'num', v: S.toPlain() },
          steps: ['The signs alternate, starting with $+$.', '$S_{' + N + '} = ' + parts.join(' + ').replace(/\+ -/g, '- ') + ' = ' + tx(S) + '$.', 'The true sum lies between $S_{' + N + '}$ and $S_{' + (N + 1) + '}$.'],
          hint: 'Write out the first terms with their signs.',
          viz: { name: 'seriespartial', opts: { quiet: true, a: '(-1)^(n+1)*' + ({ '\\frac{1}{n}': '1/n', '\\frac{1}{n^{2}}': '1/n^2', '\\frac{1}{n!}': '1/n!', '\\frac{1}{2^{n}}': '1/2^n', '\\frac{1}{2n + 1}': '1/(2n+1)', '\\frac{1}{n^{3}}': '1/n^3' }[F.t]), start: 1, N: N, maxN: 30, view: 'walk' } }
        }, null);
      }
      var bN = F.f(N + 1);
      return done({
        q: 'The series $' + SUM(1, '(-1)^{n+1}' + F.t) + '$ converges by the alternating series test. How large can the error be if you use $S_{' + N + '}$ for the sum? Give the alternating series bound exactly.',
        a: { t: 'num', v: bN.toPlain() },
        steps: ['For an alternating series whose terms $b_n$ decrease to 0, the error after $N$ terms is at most the next term: $|S - S_N| \\le b_{N+1}$.', 'Here $b_{' + (N + 1) + '} = ' + F.tt(N + 1) + ' = ' + tx(bN) + '$.'],
        hint: 'The bound is the first term you left out.'
      }, null);
    }
    if (shape === 'howmany') {
      var F2 = R.pick(bfams.filter(function (b) { return b.t !== '\\frac{1}{2n + 1}'; })), tol = R.pick([Q(1, 100), Q(1, 1000), Q(1, 10000)]), Nn = 0;
      while (!F2.f(Nn + 1).lt(tol) && Nn < 100000) Nn++;
      return done({
        q: 'For $' + SUM(1, '(-1)^{n+1}' + F2.t) + '$, what is the smallest $N$ for which the alternating series bound guarantees $|S - S_N| < ' + dec(tol) + '$?',
        a: { t: 'num', v: String(Nn), form: 'int' },
        steps: ['The error is at most $b_{N+1}$, so we need $b_{N+1} < ' + dec(tol) + '$.', '$b_{' + Nn + '} = ' + F2.tt(Nn) + (F2.f(Nn).ge(tol) ? ' \\ge ' + dec(tol) : '') + '$ is not small enough, but $b_{' + (Nn + 1) + '} = ' + F2.tt(Nn + 1) + ' < ' + dec(tol) + '$.', 'So $N + 1 = ' + (Nn + 1) + '$, that is $N = ' + Nn + '$.'],
        hint: 'Find the first term smaller than the tolerance; $N$ is one less than its index.'
      }, { custom: function () { return F2.f(Nn + 1).lt(tol) && (Nn === 0 || !F2.f(Nn).lt(tol)) ? '' : 'howmany wrong'; } });
    }
    var D2 = R.pick([
      { s: '(-1)^{n+1}\\frac{1}{n^{p}}', conv: true, why: 'the terms $\\frac{1}{n^{p}}$ decrease and go to 0, so the alternating series test says it converges', lo: 1, P: true },
      { s: '(-1)^{n}\\frac{n}{n + K}', conv: false, why: 'the terms do not go to 0 (their size tends to 1), so it diverges by the divergence test', lo: 1 },
      { s: '\\frac{(-1)^{n}}{\\ln n}', conv: true, why: 'the terms $\\frac{1}{\\ln n}$ decrease and go to 0, so the alternating series test says it converges', lo: 2 },
      { s: '(-1)^{n}\\frac{n + 1}{n^{2}}', conv: true, why: 'the terms $\\frac{n + 1}{n^{2}} = \\frac{1}{n} + \\frac{1}{n^{2}}$ decrease and go to 0, so the alternating series test says it converges', lo: 1 },
      { s: '(-1)^{n}\\frac{Kn^{2}}{n^{2} + 1}', conv: false, why: 'the terms do not go to 0 (their size tends to $K$), so it diverges by the divergence test', lo: 1 },
      { s: '\\frac{(-1)^{n+1}}{\\sqrt{n + K}}', conv: true, why: 'the terms $\\frac{1}{\\sqrt{n + K}}$ decrease and go to 0, so the alternating series test says it converges', lo: 1 }
    ]);
    var K = R.int(2, 6), p = R.pick(['\\frac{1}{2}', '1', '2', '\\frac{1}{3}']), sub = function (s) { return s.replace(/\bK\b/g, String(K)).replace(/n\^\{p\}/g, p === '1' ? 'n' : 'n^{' + p + '}'); };
    var right = (D2.conv ? 'Converges: ' : 'Diverges: ') + sub(D2.why) + '.';
    return done({
      q: 'Does $' + SUM(D2.lo, sub(D2.s)) + '$ converge or diverge?',
      a: mc(right, D2.conv ? ['Diverges, because $\\sum b_n$ without the signs diverges or is unknown.', 'Converges, because the signs alternate, whatever the terms do.', 'Diverges, because the partial sums go up and down.'] : ['Converges, because the signs alternate.', 'Converges by the alternating series test, since the terms are positive.', 'Diverges, because every alternating series diverges.']),
      steps: ['Alternating series test: if $b_n > 0$ decreases and $b_n \\to 0$, then $\\sum(-1)^{n}b_n$ converges. Check both conditions; alternating signs alone are not enough.', right],
      hint: 'First check whether the terms go to 0; then check that their sizes decrease.'
    }, null);
  });

  var ABS = [
    { s: '\\frac{(-1)^{n}}{n^{2}}', k: 0, why: '$\\sum\\frac{1}{n^{2}}$ converges ($p = 2$)' },
    { s: '\\frac{(-1)^{n}}{n\\sqrt{n}}', k: 0, why: '$\\sum\\frac{1}{n^{3/2}}$ converges ($p = \\frac{3}{2}$)' },
    { s: '\\frac{\\sin n}{n^{2}}', k: 0, why: '$\\left|\\frac{\\sin n}{n^{2}}\\right| \\le \\frac{1}{n^{2}}$ and $\\sum\\frac{1}{n^{2}}$ converges' },
    { s: '\\frac{(-1)^{n}}{n^{2} + K}', k: 0, why: '$\\frac{1}{n^{2} + K} < \\frac{1}{n^{2}}$, so $\\sum|a_n|$ converges' },
    { s: '(-1)^{n}\\left(\\frac{2}{3}\\right)^{n}', k: 0, why: '$\\sum\\left(\\frac{2}{3}\\right)^{n}$ is a convergent geometric series' },
    { s: '\\frac{(-1)^{n}K^{n}}{n!}', k: 0, why: 'the ratio test on $\\frac{K^{n}}{n!}$ gives $L = 0 < 1$' },
    { s: '\\frac{(-1)^{n}}{n}', k: 1, why: 'it converges by the alternating series test, but $\\sum\\frac{1}{n}$ diverges' },
    { s: '\\frac{(-1)^{n}}{\\sqrt{n}}', k: 1, why: 'it converges by the alternating series test, but $\\sum\\frac{1}{\\sqrt{n}}$ diverges' },
    { s: '\\frac{(-1)^{n}}{2n + K}', k: 1, why: 'it converges by the alternating series test, but $\\sum\\frac{1}{2n + K}$ diverges (compare with $\\frac{1}{n}$)' },
    { s: '\\frac{(-1)^{n}\\ln n}{n}', k: 1, why: 'it converges by the alternating series test (the terms decrease to 0 for $n \\ge 3$), but $\\frac{\\ln n}{n} > \\frac{1}{n}$, so $\\sum|a_n|$ diverges' },
    { s: '(-1)^{n}\\frac{n}{n + K}', k: 2, why: 'the terms do not go to 0' },
    { s: '(-1)^{n}\\cos\\frac{1}{n}', k: 2, why: 'the terms do not go to 0 (their size tends to 1)' }
  ];
  G('calc2.absolute-conditional', function (R, ctx) {
    var A = R.pick(ABS), K = R.int(2, 5), sub = function (s) { return s.replace(/\bK\b/g, String(K)); };
    var cats = ['Absolutely convergent', 'Conditionally convergent', 'Divergent'];
    var right = cats[A.k] + ': ' + sub(A.why) + '.';
    var wr = [0, 1, 2].filter(function (i) { return i !== A.k; }).map(function (i) { return cats[i] + (i === 0 ? ': it passes the alternating series test.' : i === 1 ? ': it converges, but only because the signs alternate.' : ': $\\sum|a_n|$ diverges.'); });
    wr.push(A.k === 0 ? 'Conditionally convergent: the signs are not all positive.' : A.k === 1 ? 'Absolutely convergent: the terms go to 0.' : 'Conditionally convergent: the signs alternate.');
    return done({
      q: 'Classify $' + SUM(1, sub(A.s)) + '$ as absolutely convergent, conditionally convergent or divergent.',
      a: mc(right, wr),
      steps: ['First test $\\sum|a_n|$. If it converges, the series converges absolutely.', 'If $\\sum|a_n|$ diverges, test the series itself (for alternating series, the alternating series test). If it converges, the convergence is conditional.', 'If the terms do not go to 0, the series diverges.', 'Here: ' + right],
      hint: 'Drop the signs first: does $\\sum|a_n|$ converge?'
    }, null);
  });

  G('calc2.ratio-root-tests', function (R, ctx) {
    var shape = by(ctx, 'ratio', R.pick(['ratio', 'root', 'ratio']), R.pick(['ratio', 'root', 'one']));
    var c = R.int(2, 9), k = R.int(1, 4), nk = k === 1 ? 'n' : 'n^{' + k + '}', pk = k === 1 ? '' : '^{' + k + '}', dd = R.int(1, 3);
    var CONC = ['The series converges absolutely.', 'The series diverges.', 'The test is inconclusive.'];
    function ans(Ls, conc) { return { t: 'multi', parts: [{ label: '$L =$', a: { t: 'num', v: Ls } }, { label: 'Conclusion', a: { t: 'mc', choices: CONC.slice(), v: conc, keep: true } }] }; }
    if (shape === 'one') {
      var F0 = R.pick([['\\frac{1}{n^{' + (k + 1) + '}}', 'converges ($p$-series, $p = ' + (k + 1) + '$)'], ['\\frac{1}{n}', 'diverges (harmonic)'], ['\\frac{n}{n^{2} + 1}', 'diverges (compare with $\\frac{1}{n}$)'], ['\\frac{1}{\\sqrt{n}}', 'diverges ($p$-series, $p = \\frac{1}{2}$)'], ['\\frac{n + ' + c + '}{n^{3}}', 'converges (compare with $\\frac{1}{n^{2}}$)'], ['\\frac{' + c + '}{n^{2} + ' + k + '}', 'converges (compare with $\\frac{1}{n^{2}}$)'], ['\\frac{1}{' + cf(c, 'n') + ' + ' + k + '}', 'diverges (compare with $\\frac{1}{n}$)']]);
      return done({
        q: 'Apply the ratio test to $' + SUM(1, F0[0]) + '$: find $L = \\lim\\left|\\frac{a_{n+1}}{a_n}\\right|$, then choose what the ratio test concludes.',
        a: ans('1', 2),
        steps: ['For any rational expression in $n$, $\\frac{a_{n+1}}{a_n} \\to 1$, because $\\frac{n + 1}{n} \\to 1$.', 'With $L = 1$ the ratio test says nothing. This series ' + F0[1] + ', which shows that $L = 1$ can go either way.'],
        hint: 'Divide $a_{n+1}$ by $a_n$ and let $n \\to \\infty$.'
      }, null);
    }
    if (shape === 'root') {
      var a = R.int(1, 5), b = R.intNot(1, 6, a), d1 = R.int(1, 5), d2 = R.int(1, 5), L = Q(a, b);
      var conc = L.lt(1) ? 0 : 1, kind = R.pick(['frac', 'ncn']);
      if (kind === 'ncn') {
        var cc = R.int(2, 6), up = R.coin(), L2 = up ? Q(cc) : Q(1, cc);
        return done({
          q: 'Apply the root test to $' + SUM(1, up ? '\\frac{' + cc + '^{n}}{' + nk + '}' : '\\frac{' + nk + '}{' + cc + '^{n}}') + '$: find $L = \\lim\\sqrt[n]{|a_n|}$, then choose the conclusion.',
          a: ans(L2.toPlain(), up ? 1 : 0),
          steps: ['$\\sqrt[n]{a_n} = ' + (up ? '\\frac{' + cc + '}{(n^{1/n})' + pk + '}' : '\\frac{(n^{1/n})' + pk + '}{' + cc + '}') + '$, and $n^{1/n} \\to 1$.', 'So $L = ' + tx(L2) + '$.', up ? 'Since $L > 1$, the series diverges.' : 'Since $L < 1$, the series converges absolutely.'],
          hint: 'Use $n^{1/n} \\to 1$.'
        }, null);
      }
      return done({
        q: 'Apply the root test to $' + SUM(1, '\\left(\\frac{' + cf(a, 'n') + ' + ' + d1 + '}{' + cf(b, 'n') + ' + ' + d2 + '}\\right)^{n}') + '$: find $L = \\lim\\sqrt[n]{|a_n|}$, then choose the conclusion.',
        a: ans(L.toPlain(), conc),
        steps: ['The $n$th root undoes the power: $\\sqrt[n]{a_n} = \\frac{' + cf(a, 'n') + ' + ' + d1 + '}{' + cf(b, 'n') + ' + ' + d2 + '}$.', 'Its limit is $L = ' + tx(L) + '$.', conc === 0 ? 'Since $L < 1$, the series converges absolutely.' : 'Since $L > 1$, the series diverges.'],
        hint: 'Take the $n$th root first; the power disappears.'
      }, null);
    }
    var fams = [
      { s: '\\frac{' + c + '^{n}}{n!}', L: '0', LT: '0', r: '\\frac{a_{n+1}}{a_n} = \\frac{' + c + '^{n+1}}{(n + 1)!}\\cdot\\frac{n!}{' + c + '^{n}} = \\frac{' + c + '}{n + 1}', conc: 0 },
      { s: '\\frac{' + nk + '}{' + c + '^{n}}', L: '1/' + c, LT: '\\frac{1}{' + c + '}', r: '\\frac{a_{n+1}}{a_n} = \\left(\\frac{n + 1}{n}\\right)' + pk + '\\cdot\\frac{1}{' + c + '}', conc: 0 },
      { s: '\\frac{n!}{' + c + '^{n}}', L: 'inf', LT: '\\infty', r: '\\frac{a_{n+1}}{a_n} = \\frac{(n + 1)!}{n!}\\cdot\\frac{' + c + '^{n}}{' + c + '^{n+1}} = \\frac{n + 1}{' + c + '}', conc: 1 },
      { s: '\\frac{' + c + '^{n}}{' + nk + '}', L: String(c), LT: String(c), r: '\\frac{a_{n+1}}{a_n} = ' + c + '\\left(\\frac{n}{n + 1}\\right)' + pk, conc: 1 },
      { s: '\\frac{(n!)^{2}}{(2n)!}', L: '1/4', LT: '\\frac{1}{4}', r: '\\frac{a_{n+1}}{a_n} = \\frac{(n + 1)^{2}}{(2n + 2)(2n + 1)}', conc: 0 },
      { s: '\\frac{(2n)!}{(n!)^{2}}', L: '4', LT: '4', r: '\\frac{a_{n+1}}{a_n} = \\frac{(2n + 2)(2n + 1)}{(n + 1)^{2}}', conc: 1 },
      { s: '\\frac{n!}{n^{n}}', L: '1/e', LT: '\\frac{1}{e}', r: '\\frac{a_{n+1}}{a_n} = \\frac{(n + 1)!}{(n + 1)^{n+1}}\\cdot\\frac{n^{n}}{n!} = \\left(\\frac{n}{n + 1}\\right)^{n} = \\frac{1}{\\left(1 + \\frac{1}{n}\\right)^{n}}', conc: 0 },
      { s: '\\frac{(-' + c + ')^{n}}{n!}', L: '0', LT: '0', r: '\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{' + c + '}{n + 1}', conc: 0 },
      { s: '\\frac{' + nk + '}{n!}', L: '0', LT: '0', r: '\\frac{a_{n+1}}{a_n} = \\left(\\frac{n + 1}{n}\\right)' + pk + '\\cdot\\frac{1}{n + 1}', conc: 0 },
      { s: '\\frac{' + c + '^{n}}{(n + ' + dd + ')!}', L: '0', LT: '0', r: '\\frac{a_{n+1}}{a_n} = \\frac{' + c + '^{n+1}}{(n + ' + (dd + 1) + ')!}\\cdot\\frac{(n + ' + dd + ')!}{' + c + '^{n}} = \\frac{' + c + '}{n + ' + (dd + 1) + '}', conc: 0 },
      { s: '\\frac{' + nk + '\\,' + c + '^{n}}{' + (c + dd) + '^{n}}', L: c + '/' + (c + dd), LT: '\\frac{' + c + '}{' + (c + dd) + '}', r: '\\frac{a_{n+1}}{a_n} = \\left(\\frac{n + 1}{n}\\right)' + pk + '\\cdot\\frac{' + c + '}{' + (c + dd) + '}', conc: 0 },
      { s: '\\frac{' + (c + dd) + '^{n}}{' + nk + '\\,' + c + '^{n}}', L: (c + dd) + '/' + c, LT: '\\frac{' + (c + dd) + '}{' + c + '}', r: '\\frac{a_{n+1}}{a_n} = \\left(\\frac{n}{n + 1}\\right)' + pk + '\\cdot\\frac{' + (c + dd) + '}{' + c + '}', conc: 1 }
    ], F = R.pick(fams);
    return done({
      q: 'Apply the ratio test to $' + SUM(1, F.s) + '$: find $L = \\lim\\left|\\frac{a_{n+1}}{a_n}\\right|$ (type inf if it is infinite), then choose the conclusion.',
      a: ans(F.L, F.conc),
      steps: ['Simplify the ratio: $' + F.r + '$.', 'As $n \\to \\infty$ this tends to $L = ' + F.LT + '$.', F.conc === 0 ? 'Since $L < 1$, the series converges absolutely: eventually it shrinks at least as fast as a geometric series with ratio less than 1.' : 'Since $L > 1$, the terms grow, so the series diverges.'],
      hint: 'Cancel common factors in $\\frac{a_{n+1}}{a_n}$: factorials and powers simplify a lot.'
    }, { custom: function () { var Lv = F.L === 'inf' ? Infinity : ML.evalPlain(F.L); var conc = Lv < 1 ? 0 : 1; return conc === F.conc ? '' : 'conclusion mismatch'; } });
  });

  var STRAT2 = [
    { s: '\\frac{n^{2}}{3n^{2} + 1}', t: 'Divergence test', c: 'Diverges: the terms go to $\\frac{1}{3}$, not 0.', w: ['Converges: the terms are less than $\\frac{1}{3}$.', 'Converges, by limit comparison with $\\frac{1}{n^{2}}$.', 'Converges: the terms approach a limit.'], ok: [] },
    { s: '\\frac{3^{n}}{4^{n} + 1}', t: 'Comparison with a geometric series', c: 'Converges: the terms are less than $\\left(\\frac{3}{4}\\right)^{n}$.', w: ['Diverges, because $3^{n}$ grows without bound.', 'Diverges, by comparison with $\\left(\\frac{4}{3}\\right)^{n}$.', 'Diverges: the terms go to 0 too slowly.'], ok: ['Ratio test', 'Root test', 'Limit comparison test'] },
    { s: '\\frac{1}{n^{3/2}}', t: '$p$-series', c: 'Converges: $p = \\frac{3}{2} > 1$.', w: ['Diverges: $p = \\frac{3}{2}$ is not an integer.', 'Diverges, like the harmonic series.', 'The divergence test shows it converges.'], ok: ['Integral test'] },
    { s: '\\frac{(-1)^{n}}{\\sqrt{n + 1}}', t: 'Alternating series test', c: 'Converges: the terms decrease to 0 and alternate in sign.', w: ['Converges absolutely, by comparison with $\\frac{1}{n^{2}}$.', 'Diverges, because $\\sum\\frac{1}{\\sqrt{n + 1}}$ diverges.', 'Diverges, because the signs keep changing.'], ok: [] },
    { s: '\\frac{n^{5}}{n!}', t: 'Ratio test', c: 'Converges: the ratio of consecutive terms tends to 0.', w: ['Diverges, because $n^{5}$ grows without bound.', 'The ratio test is inconclusive, since the ratio tends to 1.', 'Diverges, because the ratio of consecutive terms tends to 1.'], ok: ['Root test'] },
    { s: '\\left(\\frac{n}{2n + 1}\\right)^{n}', t: 'Root test', c: 'Converges: the $n$th root tends to $\\frac{1}{2}$.', w: ['Diverges: the terms tend to $\\frac{1}{2}$.', 'The root test is inconclusive here.', 'Diverges: the $n$th root tends to 2.'], ok: ['Ratio test', 'Comparison with a geometric series'] },
    { s: '\\frac{1}{n\\ln n}', t: 'Integral test', c: 'Diverges: $\\int_2^{\\infty}\\frac{dx}{x\\ln x} = \\lim_{t\\to\\infty}\\ln(\\ln t) = \\infty$.', w: ['Converges: the terms are smaller than $\\frac{1}{n}$.', 'Converges: the terms go to 0.', 'Converges by the integral test: $\\int_2^{\\infty}\\frac{dx}{x\\ln x}$ is finite.'], lo: 2, ok: [] },
    { s: '\\frac{n + 1}{n^{2} + 5}', t: 'Limit comparison test', c: 'Diverges: compared with $\\frac{1}{n}$, the ratio of terms tends to 1.', w: ['Converges: the terms go to 0.', 'Converges, by limit comparison with $\\frac{1}{n^{2}}$.', 'Converges: the terms are at most $\\frac{2}{n}$.'], ok: ['Integral test'] },
    { s: '\\frac{2^{n}}{n^{2}}', t: 'Divergence test', c: 'Diverges: the terms grow without bound.', w: ['Converges, by comparison with $\\frac{1}{n^{2}}$.', 'Converges, by the ratio test.', 'The divergence test is inconclusive here.'], ok: ['Ratio test', 'Root test'] },
    { s: '\\frac{1}{n(n + 1)}', t: 'Telescoping', c: 'Converges to 1: the partial sums are $1 - \\frac{1}{N + 1}$.', w: ['Converges to $\\frac{1}{2}$, its first term.', 'Diverges, by comparison with $\\frac{1}{n}$.', 'Converges to 2.'], ok: ['Limit comparison test', 'Integral test', '$p$-series'] }
  ];
  var TESTS = ['Divergence test', 'Comparison with a geometric series', '$p$-series', 'Alternating series test', 'Ratio test', 'Root test', 'Integral test', 'Limit comparison test', 'Telescoping'];
  G('calc2.series-strategy', function (R, ctx) {
    var shape = by(ctx, 'which', R.pick(['which', 'conc']), R.pick(['conc', 'conc', 'which']));
    var it = R.pick(STRAT2), lo = it.lo || 1;
    if (shape === 'which') {
      var wr = R.sample(TESTS.filter(function (t) { return t !== it.t && it.ok.indexOf(t) < 0; }), 3);
      return done({
        q: 'Which test settles $' + SUM(lo, it.s) + '$ most directly?',
        a: mc(it.t, wr),
        steps: [it.t + '. ' + it.c, 'A useful order: (1) do the terms go to 0? (2) geometric, $p$-series or telescoping? (3) alternating? (4) factorials or $n$th powers: ratio or root test; (5) rational or root expressions: compare with a $p$-series; (6) an easy integral: integral test.'],
        hint: 'Start with the divergence test, then look at the shape of the terms.'
      }, null);
    }
    return done({
      q: 'Decide whether $' + SUM(lo, it.s) + '$ converges or diverges. Choose the answer with a correct reason.',
      a: mc(it.c, it.w),
      steps: ['Best tool here: ' + it.t.charAt(0).toLowerCase() + it.t.slice(1) + '.', it.c],
      hint: 'Match the shape of the terms to a test before computing anything.'
    }, null);
  });

  G('calc2.series-estimates', function (R, ctx) {
    var shape = by(ctx, R.pick(['alt', 'geo']), R.pick(['int', 'geo', 'alt', 'intlow']), R.pick(['need', 'int', 'cmp']));
    if (shape === 'alt') {
      var N = R.int(2, 10), fam = R.pick(['p1', 'p2', 'p3', 'fact', 'odd', 'three', 'three']), b, bT, sT, gb = R.int(2, 5);
      if (fam === 'fact') { b = Q(1, fact(N + 1)); sT = '\\frac{1}{n!}'; bT = '\\frac{1}{' + (N + 1) + '!}'; }
      else if (fam === 'odd') { b = Q(1, 2 * N + 3); sT = '\\frac{1}{2n + 1}'; bT = '\\frac{1}{2(' + (N + 1) + ') + 1}'; }
      else if (fam === 'three') { b = Q(1, Math.pow(gb, N + 1)); sT = '\\frac{1}{' + gb + '^{n}}'; bT = '\\frac{1}{' + gb + '^{' + (N + 1) + '}}'; }
      else { var p = +fam.slice(1); b = Q(1, Math.pow(N + 1, p)); sT = '\\frac{1}{n' + (p === 1 ? '' : '^{' + p + '}') + '}'; bT = '\\frac{1}{' + (N + 1) + (p === 1 ? '' : '^{' + p + '}') + '}'; }
      return done({
        q: 'Estimate $' + SUM(1, '(-1)^{n+1}' + sT) + '$ by $S_{' + N + '}$. Give the alternating series bound on the error, exactly.',
        a: { t: 'num', v: b.toPlain() },
        steps: ['The terms decrease to 0, so $|S - S_N| \\le b_{N+1}$.', '$b_{' + (N + 1) + '} = ' + bT + ' = ' + tx(b) + '$.'],
        hint: 'The error is at most the first omitted term.'
      }, null);
    }
    if (shape === 'int' || shape === 'intlow') {
      var p2 = R.pick([2, 3, 4, 5]), N2 = R.int(3, 12), up = shape === 'int', bnd = up ? Q(1, (p2 - 1) * Math.pow(N2, p2 - 1)) : Q(1, (p2 - 1) * Math.pow(N2 + 1, p2 - 1));
      return done({
        q: 'Let $R_{' + N2 + '} = S - S_{' + N2 + '}$ for $S = ' + SUM(1, '\\frac{1}{n^{' + p2 + '}}') + '$. Use the integral test to find ' + (up ? 'an upper' : 'a lower') + ' bound for $R_{' + N2 + '}$.',
        a: { t: 'num', v: bnd.toPlain() },
        steps: ['The remainder is the tail $a_{' + (N2 + 1) + '} + a_{' + (N2 + 2) + '} + \\cdots$. Comparing rectangles with the curve: $\\int_{' + (N2 + 1) + '}^{\\infty} f \\le R_{' + N2 + '} \\le \\int_{' + N2 + '}^{\\infty} f$.', '$\\int_{M}^{\\infty}\\frac{dx}{x^{' + p2 + '}} = \\frac{1}{' + (p2 - 1) + 'M^{' + (p2 - 1) + '}}$.', (up ? 'Upper bound ($M = ' + N2 + '$)' : 'Lower bound ($M = ' + (N2 + 1) + '$)') + ': $' + tx(bnd) + '$.'],
        hint: 'The tail lies between two integrals: one starting at $N$, one at $N + 1$.'
      }, { custom: function () { var t = nsum(function (n) { return 1 / Math.pow(n, p2); }, N2 + 1, 2e5) + 1 / ((p2 - 1) * Math.pow(2e5, p2 - 1)); return up ? (t <= bnd.toNumber() ? '' : 'upper fails') : (t >= bnd.toNumber() ? '' : 'lower fails'); } });
    }
    if (shape === 'geo') {
      var rr = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4), Q(1, 5), Q(2, 5), Q(3, 5), Q(-1, 2), Q(-1, 3)]), N3 = R.int(2, 9), Rn = rr.pow(N3 + 1).div(Q(1).sub(rr));
      return done({
        q: 'For $S = ' + SUM(1, powT(rr, 'n')) + '$, find the exact remainder $R_{' + N3 + '} = S - S_{' + N3 + '}$.',
        a: { t: 'num', v: Rn.toPlain() },
        steps: ['The remainder is itself geometric: $R_{' + N3 + '} = ' + powT(rr, N3 + 1) + ' + ' + powT(rr, N3 + 2) + ' + \\cdots$.', 'First term $' + tx(rr.pow(N3 + 1)) + '$, ratio $' + tx(rr) + '$: $R_{' + N3 + '} = \\frac{' + tx(rr.pow(N3 + 1)) + '}{1 - ' + tp(rr) + '} = ' + tx(Rn) + '$.'],
        hint: 'The tail of a geometric series is geometric.'
      }, null);
    }
    if (shape === 'cmp') {
      var N4 = R.int(3, 8), cb = R.pick([2, 2, 3, 4]), cs = R.int(1, 3), bd = Q(1, (cb - 1) * Math.pow(cb, N4));
      return done({
        q: 'For $S = ' + SUM(1, '\\frac{1}{' + cb + '^{n} + ' + cs + '}') + '$, use comparison with a geometric series to bound the remainder $R_{' + N4 + '} = S - S_{' + N4 + '}$.',
        a: { t: 'num', v: bd.toPlain() },
        steps: ['Each term satisfies $\\frac{1}{' + cb + '^{n} + ' + cs + '} < \\frac{1}{' + cb + '^{n}}$.', 'So $R_{' + N4 + '} < \\sum_{n=' + (N4 + 1) + '}^{\\infty}\\frac{1}{' + cb + '^{n}} = \\frac{1/' + cb + '^{' + (N4 + 1) + '}}{1 - 1/' + cb + '} = ' + (cb === 2 ? '\\frac{1}{2^{' + N4 + '}}' : '\\frac{1}{' + (cb - 1) + '\\cdot ' + cb + '^{' + N4 + '}}') + '$.', 'Bound: $' + tx(bd) + '$.'],
        hint: 'Bound the tail by the tail of $\\sum\\frac{1}{2^{n}}$.'
      }, { custom: function () { var t = nsum(function (n) { return 1 / (Math.pow(cb, n) + cs); }, N4 + 1, 200); return t < bd.toNumber() ? '' : 'cmp bound fails'; } });
    }
    var p5 = R.pick([2, 3, 4, 5]), tol = R.pick([Q(1, 50), Q(1, 100), Q(1, 200), Q(1, 500), Q(1, 1000), Q(1, 5000), Q(1, 10000)]), Nn = 1;
    while (Q(1, (p5 - 1) * Math.pow(Nn, p5 - 1)).gt(tol)) Nn++;
    return done({
      q: 'For $S = ' + SUM(1, '\\frac{1}{n^{' + p5 + '}}') + '$, the integral bound gives $R_N \\le \\frac{1}{' + (p5 - 1 === 1 ? '' : p5 - 1) + 'N^{' + (p5 - 1 === 1 ? '' : p5 - 1) + '}}$. What is the smallest $N$ for which this bound is at most $' + dec(tol) + '$?'.replace('N^{}', 'N'),
      a: { t: 'num', v: String(Nn), form: 'int' },
      steps: ['Need $\\frac{1}{' + (p5 - 1 === 1 ? '' : p5 - 1) + (p5 - 1 === 1 ? 'N' : 'N^{' + (p5 - 1) + '}') + '} \\le ' + dec(tol) + '$, that is $' + (p5 - 1 === 1 ? 'N' : (p5 - 1) + 'N^{' + (p5 - 1) + '}') + ' \\ge ' + tol.inv().toNumber() + '$.', 'The smallest whole number that works is $N = ' + Nn + '$.'],
      hint: 'Solve the inequality for $N$ and round up.'
    }, { custom: function () { var f = function (m) { return 1 / ((p5 - 1) * Math.pow(m, p5 - 1)); }; return f(Nn) <= tol.toNumber() + 1e-15 && (Nn === 1 || f(Nn - 1) > tol.toNumber()) ? '' : 'need N'; } });
  });

  // ================================================================ UNIT 6: POWER SERIES

  function xa(a) { return a === 0 ? 'x' : '(x' + T.signed(-a) + ')'; }          // TeX "(x - 2)"
  function xaP(a) { return a === 0 ? 'x' : '(' + plinX(a) + ')'; }              // plain "(x-2)"
  // a polynomial in (x - a) given as [[coef Q, power]] -> plain and TeX
  function tayP(terms, a) { return ps(terms.map(function (t) { return [t[0], t[1] === 0 ? '' : xaP(a) + (t[1] === 1 ? '' : '^' + t[1])]; })); }
  function tayT(terms, a) { return T.terms(terms.map(function (t) { return [t[0], t[1] === 0 ? '' : xa(a) + (t[1] === 1 ? '' : '^{' + t[1] + '}')]; })); }
  // compare a polynomial answer with a function's Taylor polynomial numerically (tests only)
  function polyMatch(ansP, exact, xs) { var bad = ''; xs.forEach(function (x) { var u = ML.evalPlain(ansP, { x: x }), w = exact(x); if (!(Math.abs(u - w) < 1e-9 * Math.max(1, Math.abs(w)))) bad = 'poly mismatch at ' + x + ': ' + u + ' vs ' + w; }); return bad; }
  function binom(k, m) { var r = Q(1); for (var i = 0; i < m; i++) r = r.mul(Qf(k).sub(i)); return r.div(fact(m)); }

  G('calc2.power-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['radius', 'endpoint']), R.pick(['interval', 'radius', 'interval']), R.pick(['interval', 'interval', 'radius']));
    if (shape === 'radius') {
      var c = R.int(2, 5), a = R.int(-3, 3), fam = R.pick(['geo', 'n', 'cn', 'fact', 'nfact', 'kn']), sT, Rv, st;
      if (fam === 'geo') { sT = '\\frac{' + xa(a) + '^{n}}{' + c + '^{n}}'; Rv = String(c); st = '$\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{|x' + T.signed(-a) + '|}{' + c + '}$'; }
      else if (fam === 'n') { sT = '\\frac{n' + xa(a) + '^{n}}{' + c + '^{n}}'; Rv = String(c); st = '$\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{n + 1}{n}\\cdot\\frac{|x' + T.signed(-a) + '|}{' + c + '} \\to \\frac{|x' + T.signed(-a) + '|}{' + c + '}$'; }
      else if (fam === 'cn') { sT = c + '^{n}x^{n}'; Rv = '1/' + c; a = 0; st = '$\\left|\\frac{a_{n+1}}{a_n}\\right| = ' + c + '|x|$'; }
      else if (fam === 'kn') { sT = '\\frac{(' + c + 'x)^{n}}{n}'; Rv = '1/' + c; a = 0; st = '$\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{n}{n + 1}\\cdot ' + c + '|x| \\to ' + c + '|x|$'; }
      else if (fam === 'fact') { sT = '\\frac{' + xa(a) + '^{n}}{n!}'; Rv = 'inf'; st = '$\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{|x' + T.signed(-a) + '|}{n + 1} \\to 0$ for every $x$'; }
      else { sT = 'n!\\,' + xa(a) + '^{n}'; Rv = '0'; st = '$\\left|\\frac{a_{n+1}}{a_n}\\right| = (n + 1)|x' + T.signed(-a) + '| \\to \\infty$ unless $x = ' + a + '$'; }
      var concl = Rv === 'inf' ? 'The limit is less than 1 for every $x$, so $R = \\infty$.' : Rv === '0' ? 'The series converges only at its center, so $R = 0$.' : 'It converges when this limit is less than 1, that is $|x' + (a === 0 ? '' : T.signed(-a)) + '| < ' + (Rv.indexOf('/') > 0 ? '\\frac{1}{' + c + '}' : c) + '$. So $R = ' + (Rv.indexOf('/') > 0 ? '\\frac{1}{' + c + '}' : c) + '$.';
      return done({
        q: 'Find the radius of convergence of $' + SUM(fam === 'kn' ? 1 : 0, sT) + '$. (Type inf for an infinite radius.)',
        a: { t: 'num', v: Rv },
        steps: ['Use the ratio test on the terms: ' + st + '.', concl],
        hint: 'Apply the ratio test with $x$ kept as a letter, and ask when the limit is less than 1.'
      }, null);
    }
    if (shape === 'endpoint') {
      var e = R.pick([[1, '-1', 'Converges: it becomes $\\sum\\frac{(-1)^{n}}{n}$, which converges by the alternating series test.'], [1, '1', 'Diverges: it becomes the harmonic series $\\sum\\frac{1}{n}$.'], [2, '1', 'Converges: it becomes $\\sum\\frac{1}{n^{2}}$, a $p$-series with $p = 2$.'], [0, '1', 'Diverges: it becomes $\\sum 1$, whose terms do not go to 0.']]);
      var pw = e[0], sT2 = pw === 0 ? 'x^{n}' : '\\frac{x^{n}}{n' + (pw === 2 ? '^{2}' : '') + '}';
      var right = e[2], wrongs = [/^Converges/.test(right) ? 'Diverges, because $x = ' + e[1] + '$ is outside the interval of convergence.' : 'Converges, because $x = ' + e[1] + '$ is inside the radius of convergence.', /^Converges/.test(right) ? 'Diverges: it becomes the harmonic series.' : 'Converges by the alternating series test.', 'Nothing can be said: the ratio test gives $L = 1$ there.'];
      return done({
        q: 'The series $' + SUM(pw === 0 ? 0 : 1, sT2) + '$ has radius of convergence 1. What happens at the endpoint $x = ' + e[1] + '$?',
        a: mc(right, wrongs),
        steps: ['The ratio test only decides $|x| < 1$ (converges) and $|x| > 1$ (diverges). At $|x| = 1$ it gives $L = 1$, so each endpoint needs its own test.', 'Substitute $x = ' + e[1] + '$ and look at the resulting number series.', right],
        hint: 'Plug the endpoint into the series and test the series you get.'
      }, null);
    }
    var c2 = R.int(1, 4), a2 = R.int(-3, 3), p = R.pick([0, 1, 1, 2]), alt = p === 1 && R.coin();
    var lo = a2 - c2, hi = a2 + c2, iv, endL, endR;
    if (p === 0) { iv = '(' + lo + ', ' + hi + ')'; endL = 'At $x = ' + lo + '$: $\\sum (-1)^{n}' + (alt ? '' : '') + '$, terms do not go to 0, diverges.'; endR = 'At $x = ' + hi + '$: $\\sum 1$, diverges.'; }
    else if (p === 2) { iv = '[' + lo + ', ' + hi + ']'; endL = 'At $x = ' + lo + '$: $\\sum\\frac{(-1)^{n}}{n^{2}}$ converges (absolutely).'; endR = 'At $x = ' + hi + '$: $\\sum\\frac{1}{n^{2}}$ converges.'; }
    else if (!alt) { iv = '[' + lo + ', ' + hi + ')'; endL = 'At $x = ' + lo + '$: $\\sum\\frac{(-1)^{n}}{n}$ converges (alternating series test).'; endR = 'At $x = ' + hi + '$: $\\sum\\frac{1}{n}$ diverges (harmonic).'; }
    else { iv = '(' + lo + ', ' + hi + ']'; endL = 'At $x = ' + lo + '$: $\\sum\\frac{(-1)^{n}(-1)^{n}}{n} = \\sum\\frac{1}{n}$ diverges.'; endR = 'At $x = ' + hi + '$: $\\sum\\frac{(-1)^{n}}{n}$ converges (alternating series test).'; }
    var termT = (alt ? '(-1)^{n}' : '') + '\\frac{' + xa(a2) + '^{n}}{' + (c2 === 1 ? '' : c2 + '^{n}') + (p === 0 ? (c2 === 1 ? '1' : '') : p === 1 ? (c2 === 1 ? 'n' : '\\,n') : (c2 === 1 ? 'n^{2}' : '\\,n^{2}')) + '}';
    if (p === 0 && c2 === 1) termT = (alt ? '(-1)^{n}' : '') + xa(a2) + '^{n}';
    return done({
      q: 'Find the interval of convergence of $' + SUM(p === 0 ? 0 : 1, termT) + '$. Use interval notation.',
      a: { t: 'interval', v: iv },
      steps: [
        'Ratio test: $\\left|\\frac{a_{n+1}}{a_n}\\right| \\to \\frac{|x' + T.signed(-a2) + '|}{' + c2 + '}$, so it converges for $|x' + T.signed(-a2) + '| < ' + c2 + '$: center $' + a2 + '$, radius $' + c2 + '$, endpoints $' + lo + '$ and $' + hi + '$.',
        'The ratio test says nothing at the endpoints, so test each one.',
        endL, endR,
        'Interval of convergence: $' + iv + '$.'
      ],
      hint: 'Find the radius with the ratio test, then check both endpoints separately.'
    }, null);
  });

  G('calc2.functions-as-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['coef', 'radius', 'coef']), R.pick(['terms', 'coef', 'interval']), R.pick(['terms', 'coef', 'interval']));
    if (shape === 'coef') {
      var fam = R.pick(['k', 'a', 'odd']), m = R.int(2, 5);
      if (fam === 'k') {
        var c = R.nz(-3, 4), k = R.pick([2, 3, -2, -1, Q(1, 2), -3]), kq = Qf(k), val = Qf(c).mul(kq.pow(m));
        var den = '1 ' + (kq.sign() > 0 ? '- ' : '+ ') + cf(kq.abs(), 'x');
        return done({
          q: 'In the power series for $f(x) = \\frac{' + c + '}{' + den + '}$ centered at 0, what is the coefficient of $x^{' + m + '}$?',
          a: { t: 'num', v: val.toPlain() },
          steps: ['Use $\\frac{1}{1 - u} = 1 + u + u^{2} + \\cdots$ with $u = ' + cf(kq, 'x') + '$.', '$f(x) = ' + c + '\\sum_{n=0}^{\\infty}' + (kq.eq(1) ? 'x^{n}' : '\\left(' + cf(kq, 'x') + '\\right)^{n}') + '$, so the coefficient of $x^{n}$ is $' + c + T.cdot() + powT(kq, 'n') + '$.', 'For $n = ' + m + '$: $' + c + T.cdot() + powT(kq, m) + ' = ' + tx(val) + '$.'],
          hint: 'Rewrite the function as $\\frac{c}{1 - u}$.'
        }, { custom: function (p) { return polyMatch('0', function () { return 0; }, []) || (Math.abs(ML.evalPlain(p.a.v) - c * Math.pow(kq.toNumber(), m)) < 1e-12 ? '' : 'coef'); } });
      }
      if (fam === 'a') {
        var c2 = R.int(1, 5), a = R.int(2, 5), val2 = Q(c2, Math.pow(a, m + 1));
        return done({
          q: 'In the power series for $f(x) = \\frac{' + c2 + '}{' + a + ' - x}$ centered at 0, what is the coefficient of $x^{' + m + '}$?',
          a: { t: 'num', v: val2.toPlain() },
          steps: ['Factor out ' + a + ': $\\frac{' + c2 + '}{' + a + ' - x} = \\frac{' + c2 + '}{' + a + '}\\cdot\\frac{1}{1 - \\frac{x}{' + a + '}}$.', '$= \\frac{' + c2 + '}{' + a + '}\\sum_{n=0}^{\\infty}\\frac{x^{n}}{' + a + '^{n}} = \\sum_{n=0}^{\\infty}\\frac{' + c2 + '}{' + a + '^{n+1}}x^{n}$.', 'For $n = ' + m + '$: $\\frac{' + c2 + '}{' + a + '^{' + (m + 1) + '}} = ' + tx(val2) + '$.'],
          hint: 'Factor the constant out of the denominator to get $1 - \\frac{x}{a}$.'
        }, null);
      }
      var j = R.int(1, 3), sgn = R.coin() ? 1 : -1, val3 = Q(sgn > 0 ? 1 : (j % 2 ? -1 : 1));
      // x/(1 -+ x^2): coefficient of x^{2j+1} is (+1) or (-1)^j
      return done({
        q: 'In the power series for $\\frac{x}{1 ' + (sgn > 0 ? '-' : '+') + ' x^{2}}$ centered at 0, what is the coefficient of $x^{' + (2 * j + 1) + '}$?',
        a: { t: 'num', v: val3.toPlain() },
        steps: ['$\\frac{1}{1 ' + (sgn > 0 ? '-' : '+') + ' x^{2}} = \\sum_{n=0}^{\\infty}' + (sgn > 0 ? '' : '(-1)^{n}') + 'x^{2n}$ (substitute $u = ' + (sgn > 0 ? '' : '-') + 'x^{2}$ into $\\frac{1}{1 - u}$).', 'Multiply by $x$: $\\sum_{n=0}^{\\infty}' + (sgn > 0 ? '' : '(-1)^{n}') + 'x^{2n+1}$.', '$x^{' + (2 * j + 1) + '}$ is the $n = ' + j + '$ term, with coefficient $' + tx(val3) + '$.'],
        hint: 'Substitute into $\\frac{1}{1 - u}$, then multiply by $x$.'
      }, null);
    }
    if (shape === 'radius' || shape === 'interval') {
      var b3 = R.int(1, 4), a3 = shape === 'interval' ? R.pick([b3, 2 * b3, 3 * b3, b3 % 2 ? 0 : b3 / 2]) || b3 : R.int(1, 5), c3 = R.int(1, 5), Rr = Q(a3, b3), sg = R.coin();
      var fT = '\\frac{' + c3 + '}{' + a3 + ' ' + (sg ? '-' : '+') + ' ' + cf(b3, 'x') + '}';
      if (shape === 'radius') return done({
        q: 'Find the radius of convergence of the power series for $' + fT + '$ centered at 0.',
        a: { t: 'num', v: Rr.toPlain() },
        steps: ['$' + fT + ' = \\frac{' + c3 + '}{' + a3 + '}\\cdot\\frac{1}{1 ' + (sg ? '-' : '+') + ' ' + cf(Rr.inv(), 'x') + '}$, a geometric series in $u = ' + (sg ? '' : '-') + cf(Rr.inv(), 'x') + '$.', 'It converges when $|u| < 1$, that is $|x| < ' + tx(Rr) + '$.', 'Radius: $' + tx(Rr) + '$ (the distance from 0 to the point where the denominator is 0).'],
        hint: 'Write it as $\\frac{c}{1 - u}$ and require $|u| < 1$.'
      }, null);
      return done({
        q: 'Find the interval of convergence of the power series for $' + fT + '$ centered at 0. Use interval notation.',
        a: { t: 'interval', v: '(' + Rr.neg().toPlain() + ', ' + Rr.toPlain() + ')' },
        steps: ['As a geometric series in $u = ' + (sg ? '' : '-') + cf(Rr.inv(), 'x') + '$, it converges exactly when $|u| < 1$: $|x| < ' + tx(Rr) + '$.', 'At both endpoints $|u| = 1$ and the terms do not go to 0, so both are excluded.', 'Interval: $\\left(' + tx(Rr.neg()) + ', ' + tx(Rr) + '\\right)$.'],
        hint: 'A geometric series converges exactly when $|r| < 1$, never at the endpoints.'
      }, null);
    }
    var fam2 = R.pick(['k', 'x2', 'xx', 'a']), ansP, ansT, fT2, st, exact;
    if (fam2 === 'k') { var c4 = R.nz(-3, 4), k4 = R.pick([2, 3, -2, Q(1, 2)]), kq4 = Qf(k4); var tt = [0, 1, 2, 3].map(function (n) { return [Qf(c4).mul(kq4.pow(n)), n]; }); ansP = tayP(tt, 0); ansT = tayT(tt, 0); fT2 = '\\frac{' + c4 + '}{1 ' + (kq4.sign() > 0 ? '- ' : '+ ') + cf(kq4.abs(), 'x') + '}'; st = 'Geometric with $u = ' + cf(kq4, 'x') + '$: multiply each power $u^{n}$ by ' + c4 + '.'; exact = function (x) { return c4 * (1 + kq4.toNumber() * x + Math.pow(kq4.toNumber() * x, 2) + Math.pow(kq4.toNumber() * x, 3)); }; }
    else if (fam2 === 'x2') { var s4 = R.coin() ? 1 : -1; ansP = s4 > 0 ? '1+x^2+x^4+x^6' : '1-x^2+x^4-x^6'; ansT = s4 > 0 ? '1 + x^{2} + x^{4} + x^{6}' : '1 - x^{2} + x^{4} - x^{6}'; fT2 = '\\frac{1}{1 ' + (s4 > 0 ? '-' : '+') + ' x^{2}}'; st = 'Substitute $u = ' + (s4 > 0 ? '' : '-') + 'x^{2}$ into $1 + u + u^{2} + u^{3} + \\cdots$.'; exact = function (x) { return 1 + s4 * x * x + x * x * x * x + s4 * Math.pow(x, 6); }; }
    else if (fam2 === 'xx') { ansP = 'x+x^3+x^5+x^7'; ansT = 'x + x^{3} + x^{5} + x^{7}'; fT2 = '\\frac{x}{1 - x^{2}}'; st = '$\\frac{1}{1 - x^{2}} = 1 + x^{2} + x^{4} + \\cdots$; multiply by $x$.'; exact = function (x) { return x + Math.pow(x, 3) + Math.pow(x, 5) + Math.pow(x, 7); }; }
    else { var a5 = R.int(2, 4); var tt5 = [0, 1, 2, 3].map(function (n) { return [Q(1, Math.pow(a5, n + 1)), n]; }); ansP = tayP(tt5, 0); ansT = tayT(tt5, 0); fT2 = '\\frac{1}{' + a5 + ' - x}'; st = '$\\frac{1}{' + a5 + ' - x} = \\frac{1}{' + a5 + '}\\cdot\\frac{1}{1 - x/' + a5 + '} = \\sum\\frac{x^{n}}{' + a5 + '^{n+1}}$.'; exact = function (x) { var s = 0; for (var n = 0; n < 4; n++) s += Math.pow(x, n) / Math.pow(a5, n + 1); return s; }; }
    return done({
      q: 'Find the first four nonzero terms of the power series for $' + fT2 + '$ centered at 0. Enter their sum.',
      a: { t: 'expr', v: ansP, vars: ['x'] },
      steps: ['Start from $\\frac{1}{1 - u} = 1 + u + u^{2} + u^{3} + \\cdots$.', st, 'First four nonzero terms: $' + ansT + '$.'],
      hint: 'Match the function to $\\frac{1}{1 - u}$ and identify $u$.'
    }, { custom: function (p) { return polyMatch(p.a.v, exact, [0.3, -0.7, 1.1, 2]); } });
  });

  G('calc2.differentiate-integrate-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['ln', 'deriv']), R.pick(['ln', 'atan', 'deriv', 'terms']), R.pick(['sum', 'atan', 'terms', 'sum', 'sum', 'atan']));
    if (shape === 'ln') {
      var k = R.pick([1, 2, 3, -1, -2, Q(1, 2)]), kq = Qf(k), m = R.int(2, 6), mul = R.pick([1, 1, 2, 3, 6]), val = kq.pow(m).div(m).mul(m % 2 ? 1 : -1).mul(mul);
      var fT = (mul === 1 ? '' : mul) + (kq.eq(1) ? '\\ln(1 + x)' : kq.eq(-1) ? '\\ln(1 - x)' : '\\ln(1 ' + (kq.sign() > 0 ? '+ ' : '- ') + cf(kq.abs(), 'x') + ')');
      return done({
        q: 'What is the coefficient of $x^{' + m + '}$ in the Maclaurin series of $' + fT + '$?',
        a: { t: 'num', v: val.toPlain() },
        steps: ['$\\frac{1}{1 + u} = 1 - u + u^{2} - \\cdots$; integrate from 0: $\\ln(1 + u) = u - \\frac{u^{2}}{2} + \\frac{u^{3}}{3} - \\cdots = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}u^{n}}{n}$.', 'Substitute $u = ' + cf(kq, 'x') + '$: the coefficient of $x^{n}$ is $' + (mul === 1 ? '' : mul + '\\cdot') + '\\frac{(-1)^{n+1}' + (kq.eq(1) ? '' : powT(kq, 'n')) + '}{n}$.', 'For $n = ' + m + '$: $' + tx(val) + '$.'],
        hint: 'Integrate the geometric series for $\\frac{1}{1 + u}$.'
      }, { custom: function (p) { var h = kq.toNumber(); return Math.abs(ML.evalPlain(p.a.v) - mul * Math.pow(-1, m + 1) * Math.pow(h, m) / m) < 1e-12 ? '' : 'ln coef'; } });
    }
    if (shape === 'atan') {
      var k2 = R.pick([1, 2, 3, 4, Q(1, 2), Q(1, 3), -1, -2]), kq2 = Qf(k2), j = R.int(1, 4), pw = 2 * j + 1, val2 = kq2.pow(pw).div(pw).mul(j % 2 ? -1 : 1);
      return done({
        q: 'What is the coefficient of $x^{' + pw + '}$ in the Maclaurin series of $\\arctan' + (kq2.eq(1) ? ' x' : '(' + cf(kq2, 'x') + ')') + '$?',
        a: { t: 'num', v: val2.toPlain() },
        steps: ['$\\frac{1}{1 + u^{2}} = 1 - u^{2} + u^{4} - \\cdots$; integrate: $\\arctan u = u - \\frac{u^{3}}{3} + \\frac{u^{5}}{5} - \\cdots = \\sum_{n=0}^{\\infty}\\frac{(-1)^{n}u^{2n+1}}{2n + 1}$.', 'With $u = ' + cf(kq2, 'x') + '$, the $x^{' + pw + '}$ term is the $n = ' + j + '$ term: $\\frac{(-1)^{' + j + '}' + (kq2.eq(1) ? '' : powT(kq2, pw)) + '}{' + pw + '}$.', 'Coefficient: $' + tx(val2) + '$.'],
        hint: 'Integrate the series for $\\frac{1}{1 + u^{2}}$.'
      }, null);
    }
    if (shape === 'deriv') {
      var k3 = R.pick([1, 2, 3, -1, -2]), m3 = R.int(2, 6), mu3 = R.pick([1, 1, 2, 5]), val3 = Q(m3 + 1).mul(Q(k3).pow(m3)).mul(mu3);
      var dT = k3 === 1 ? '(1 - x)^{2}' : '(1 ' + (k3 > 0 ? '- ' : '+ ') + cf(Math.abs(k3), 'x') + ')^{2}';
      return done({
        q: 'What is the coefficient of $x^{' + m3 + '}$ in the Maclaurin series of $\\frac{' + mu3 + '}{' + dT + '}$?',
        a: { t: 'num', v: val3.toPlain() },
        steps: ['Differentiate $\\frac{1}{1 - u} = \\sum u^{n}$: $\\frac{1}{(1 - u)^{2}} = \\sum_{n=1}^{\\infty} n u^{n-1} = \\sum_{n=0}^{\\infty}(n + 1)u^{n}$.', 'With $u = ' + cf(k3, 'x') + '$ the coefficient of $x^{n}$ is $(n + 1)' + (k3 === 1 ? '' : T.pow(k3, 'n')) + '$.', 'For $n = ' + m3 + '$' + (mu3 === 1 ? '' : ', times ' + mu3) + ': $' + (mu3 === 1 ? '' : mu3 + '\\cdot ') + (m3 + 1) + (k3 === 1 ? '' : '\\cdot ' + T.pow(k3, m3)) + ' = ' + tx(val3) + '$.'],
        hint: 'Differentiate the geometric series term by term.'
      }, null);
    }
    if (shape === 'terms') {
      var tk = R.int(2, 5), f4 = R.pick([
        { t: '\\ln(1 + x^{2})', p: 'x^2-x^4/2+x^6/3', tt: 'x^{2} - \\frac{x^{4}}{2} + \\frac{x^{6}}{3}', s: 'Substitute $u = x^{2}$ into $\\ln(1 + u) = u - \\frac{u^{2}}{2} + \\frac{u^{3}}{3} - \\cdots$.', e: function (x) { return x * x - Math.pow(x, 4) / 2 + Math.pow(x, 6) / 3; } },
        { t: 'x\\ln(1 + x)', p: 'x^2-x^3/2+x^4/3', tt: 'x^{2} - \\frac{x^{3}}{2} + \\frac{x^{4}}{3}', s: 'Multiply $\\ln(1 + x) = x - \\frac{x^{2}}{2} + \\frac{x^{3}}{3} - \\cdots$ by $x$.', e: function (x) { return x * x - x * x * x / 2 + Math.pow(x, 4) / 3; } },
        { t: '\\arctan(x^{2})', p: 'x^2-x^6/3+x^10/5', tt: 'x^{2} - \\frac{x^{6}}{3} + \\frac{x^{10}}{5}', s: 'Substitute $u = x^{2}$ into $\\arctan u = u - \\frac{u^{3}}{3} + \\frac{u^{5}}{5} - \\cdots$.', e: function (x) { return x * x - Math.pow(x, 6) / 3 + Math.pow(x, 10) / 5; } },
        { t: '\\frac{1}{(1 + x)^{2}}', p: '1-2*x+3*x^2', tt: '1 - 2x + 3x^{2}', s: '$\\frac{1}{(1 + x)^{2}} = -\\frac{d}{dx}\\frac{1}{1 + x} = -\\frac{d}{dx}(1 - x + x^{2} - x^{3} + \\cdots) = 1 - 2x + 3x^{2} - \\cdots$.', e: function (x) { return 1 - 2 * x + 3 * x * x; } },
        { t: '-\\ln(1 - x)', p: 'x+x^2/2+x^3/3', tt: 'x + \\frac{x^{2}}{2} + \\frac{x^{3}}{3}', s: 'Integrate $\\frac{1}{1 - x} = 1 + x + x^{2} + \\cdots$ from 0 to $x$.', e: function (x) { return x + x * x / 2 + x * x * x / 3; } },
        { t: '\\ln(1 + ' + tk + 'x)', p: tk + '*x-' + tk * tk + '*x^2/2+' + tk * tk * tk + '*x^3/3', tt: tk + 'x - ' + tx(Q(tk * tk, 2)) + 'x^{2} + ' + tx(Q(tk * tk * tk, 3)) + 'x^{3}', s: 'Substitute $u = ' + tk + 'x$ into $\\ln(1 + u) = u - \\frac{u^{2}}{2} + \\frac{u^{3}}{3} - \\cdots$.', e: function (x) { return tk * x - tk * tk * x * x / 2 + Math.pow(tk * x, 3) / 3; }, f: function (x) { return Math.log(1 + tk * x); }, np: 4, kk: tk },
        { t: '\\arctan(' + tk + 'x)', p: tk + '*x-' + Math.pow(tk, 3) + '*x^3/3+' + Math.pow(tk, 5) + '*x^5/5', tt: tk + 'x - ' + tx(Q(Math.pow(tk, 3), 3)) + 'x^{3} + ' + tx(Q(Math.pow(tk, 5), 5)) + 'x^{5}', s: 'Substitute $u = ' + tk + 'x$ into $\\arctan u = u - \\frac{u^{3}}{3} + \\frac{u^{5}}{5} - \\cdots$.', e: function (x) { return tk * x - Math.pow(tk * x, 3) / 3 + Math.pow(tk * x, 5) / 5; }, f: function (x) { return Math.atan(tk * x); }, np: 7, kk: tk },
        { t: 'x\\arctan x', p: 'x^2-x^4/3+x^6/5', tt: 'x^{2} - \\frac{x^{4}}{3} + \\frac{x^{6}}{5}', s: 'Multiply $\\arctan x = x - \\frac{x^{3}}{3} + \\frac{x^{5}}{5} - \\cdots$ by $x$.', e: function (x) { return x * x - Math.pow(x, 4) / 3 + Math.pow(x, 6) / 5; }, f: function (x) { return x * Math.atan(x); }, np: 8, kk: 1 },
        { t: '\\frac{1}{(1 - ' + tk + 'x)^{2}}', p: '1+' + 2 * tk + '*x+' + 3 * tk * tk + '*x^2', tt: '1 + ' + 2 * tk + 'x + ' + 3 * tk * tk + 'x^{2}', s: 'Differentiate $\\frac{1}{1 - u} = 1 + u + u^{2} + \\cdots$ to get $\\frac{1}{(1 - u)^{2}} = 1 + 2u + 3u^{2} + \\cdots$, then put $u = ' + tk + 'x$.', e: function (x) { return 1 + 2 * tk * x + 3 * tk * tk * x * x; }, f: function (x) { return 1 / Math.pow(1 - tk * x, 2); }, np: 3, kk: tk }
      ]);
      return done({
        q: 'Find the first three nonzero terms of the Maclaurin series of $' + f4.t + '$. Enter their sum.',
        a: { t: 'expr', v: f4.p, vars: ['x'] },
        steps: [f4.s, 'First three nonzero terms: $' + f4.tt + '$.'],
        hint: 'Start from a series you know and substitute, multiply, differentiate or integrate.'
      }, { custom: function (p) { var bad = polyMatch(p.a.v, f4.e, [0.3, -0.6, 1.2]); if (f4.f) [5e-4, -6e-4].forEach(function (x) { if (Math.abs(ML.evalPlain(p.a.v, { x: x }) - f4.f(x)) > Math.max(1e-13, 3 * Math.pow(f4.kk + 1, f4.np) * Math.pow(Math.abs(x), f4.np))) bad = 'near 0 ' + x; }); return bad; } });
    }
    var f5 = R.pick(['n', 'inv', 'atan', 'alt']);
    if (f5 === 'alt') {
      var cb = R.int(2, 9), ca = R.pick([1, 1, 2, 3].filter(function (t) { return t < cb; })), aq = Q(ca, cb), ares = Q(cb + ca, cb);
      return done({
        q: 'Find the sum $' + SUM(1, ca === 1 ? '\\frac{(-1)^{n+1}}{n\\cdot ' + cb + '^{n}}' : '\\frac{(-1)^{n+1}\\,' + ca + '^{n}}{n\\cdot ' + cb + '^{n}}') + '$ exactly.',
        a: { t: 'num', v: 'ln(' + ares.toPlain() + ')' },
        steps: ['Integrate $\\frac{1}{1 + x} = 1 - x + x^{2} - \\cdots$: $\\ln(1 + x) = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}x^{n}}{n}$ for $|x| < 1$.', 'Put $x = ' + tx(aq) + '$: the sum is $\\ln\\left(1 + ' + tx(aq) + '\\right) = \\ln ' + tx(ares) + '$.'],
        hint: 'Which known series has terms $\\frac{(-1)^{n+1}x^{n}}{n}$?'
      }, { custom: function () { var s = nsum(function (n) { return Math.pow(-1, n + 1) * Math.pow(ca / cb, n) / n; }, 1, 600); return Math.abs(s - Math.log((cb + ca) / cb)) < 1e-9 ? '' : 'alt sum'; } });
    }
    if (f5 === 'n') {
      var cc = R.int(2, 9), na = R.pick([1, 1, 2, 3].filter(function (t) { return t < cc; })), xq = Q(na, cc), v5 = xq.div(Q(1).sub(xq).pow(2));
      var termT = na === 1 ? '\\frac{n}{' + cc + '^{n}}' : '\\frac{n\\cdot ' + na + '^{n}}{' + cc + '^{n}}';
      return done({
        q: 'Find the sum $' + SUM(1, termT) + '$.',
        a: { t: 'num', v: v5.toPlain() },
        steps: ['Start with $\\sum_{n=0}^{\\infty}x^{n} = \\frac{1}{1 - x}$ for $|x| < 1$, differentiate, and multiply by $x$: $\\sum_{n=1}^{\\infty}n x^{n} = \\frac{x}{(1 - x)^{2}}$.', 'Put $x = ' + tx(xq) + '$, which is inside the interval of convergence: $\\frac{' + tx(xq) + '}{\\left(1 - ' + tx(xq) + '\\right)^{2}} = \\frac{' + tx(xq) + '}{' + tx(Q(1).sub(xq).pow(2)) + '}$.', 'Sum: $' + tx(v5) + '$.'],
        hint: 'Differentiate the geometric series, then choose $x$.'
      }, { custom: function () { var s = nsum(function (n) { return n * Math.pow(na / cc, n); }, 1, 600); return Math.abs(s - v5.toNumber()) < 1e-9 ? '' : 'n sum'; } });
    }
    if (f5 === 'inv') {
      var c6 = R.int(2, 9), ia = R.pick([1, 1, 2, 3].filter(function (t) { return t < c6; })), iq = Q(ia, c6), ires = Q(c6, c6 - ia);
      return done({
        q: 'Find the sum $' + SUM(1, ia === 1 ? '\\frac{1}{n\\cdot ' + c6 + '^{n}}' : '\\frac{' + ia + '^{n}}{n\\cdot ' + c6 + '^{n}}') + '$ exactly.',
        a: { t: 'num', v: 'ln(' + ires.toPlain() + ')' },
        steps: ['Integrate $\\frac{1}{1 - x} = \\sum x^{n}$: $-\\ln(1 - x) = \\sum_{n=1}^{\\infty}\\frac{x^{n}}{n}$ for $|x| < 1$.', 'Put $x = ' + tx(iq) + '$: the sum is $-\\ln\\left(1 - ' + tx(iq) + '\\right) = -\\ln' + tx(Q(c6 - ia, c6)) + '$.', 'That is $\\ln ' + tx(ires) + '$.'],
        hint: 'Which known series has terms $\\frac{x^{n}}{n}$?'
      }, { custom: function () { var s = nsum(function (n) { return Math.pow(ia / c6, n) / n; }, 1, 600); return Math.abs(s - Math.log(c6 / (c6 - ia))) < 1e-9 ? '' : 'inv sum'; } });
    }
    if (R.coin()) {
      var aa = R.int(2, 9);
      return done({
        q: 'Find the exact sum $' + SUM(0, '\\frac{(-1)^{n}}{(2n + 1)\\,' + aa + '^{2n+1}}') + '$.',
        a: { t: 'num', v: 'arctan(1/' + aa + ')' },
        steps: ['$\\arctan x = \\sum_{n=0}^{\\infty}\\frac{(-1)^{n}x^{2n+1}}{2n + 1}$ for $|x| \\le 1$.', 'The terms match with $x = \\frac{1}{' + aa + '}$, since $x^{2n+1} = \\frac{1}{' + aa + '^{2n+1}}$.', 'Sum: $\\arctan\\frac{1}{' + aa + '}$.'],
        hint: 'Which known series has odd powers divided by odd numbers, with alternating signs?'
      }, { custom: function () { var s = nsum(function (n) { return Math.pow(-1, n) / ((2 * n + 1) * Math.pow(aa, 2 * n + 1)); }, 0, 200); return Math.abs(s - Math.atan(1 / aa)) < 1e-12 ? '' : 'atan a sum'; } });
    }
    return done({
      q: 'Use the series for $\\arctan x$ at $x = \\frac{1}{\\sqrt{3}}$ to find $' + SUM(0, '\\frac{(-1)^{n}}{(2n + 1)3^{n}}') + '$ exactly.',
      a: { t: 'num', v: 'sqrt(3)*pi/6' },
      steps: ['$\\arctan x = \\sum_{n=0}^{\\infty}\\frac{(-1)^{n}x^{2n+1}}{2n + 1}$ for $|x| \\le 1$.', 'At $x = \\frac{1}{\\sqrt{3}}$: $x^{2n+1} = \\frac{1}{\\sqrt{3}}\\cdot\\frac{1}{3^{n}}$, so $\\arctan\\frac{1}{\\sqrt{3}} = \\frac{1}{\\sqrt{3}}' + SUM(0, '\\frac{(-1)^{n}}{(2n + 1)3^{n}}') + '$.', 'Since $\\arctan\\frac{1}{\\sqrt{3}} = \\frac{\\pi}{6}$, the sum is $\\frac{\\sqrt{3}\\pi}{6}$.'],
      hint: 'Factor $\\frac{1}{\\sqrt{3}}$ out of the arctangent series.'
    }, { custom: function () { var s = nsum(function (n) { return Math.pow(-1, n) / ((2 * n + 1) * Math.pow(3, n)); }, 0, 200); return Math.abs(s - Math.sqrt(3) * Math.PI / 6) < 1e-12 ? '' : 'atan sum'; } });
  });

  G('calc2.taylor-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['exp', 'derivs']), R.pick(['derivs', 'coef', 'sincos', 'derivsA']), R.pick(['center', 'coef', 'derivsA', 'sincos']));
    if (shape === 'exp') {
      var k = R.pick([1, 2, 3, -1, -2, Q(1, 2)]), kq = Qf(k), n = R.pick([2, 3]);
      var tt = []; for (var i = 0; i <= n; i++) tt.push([kq.pow(i).div(fact(i)), i]);
      return done({
        q: 'Find the Taylor polynomial $T_{' + n + '}(x)$ of $f(x) = e^{' + cf(kq, 'x') + '}$ centered at $0$.',
        a: { t: 'expr', v: tayP(tt, 0), vars: ['x'] },
        steps: ['$f^{(n)}(x) = ' + (kq.eq(1) ? '' : powT(kq, 'n')) + 'e^{' + cf(kq, 'x') + '}$, so $f^{(n)}(0) = ' + (kq.eq(1) ? '1' : powT(kq, 'n')) + '$.', 'Taylor coefficients: $c_n = \\frac{f^{(n)}(0)}{n!}$. Do not forget the $n!$.', '$T_{' + n + '}(x) = ' + tayT(tt, 0) + '$.'],
        hint: '$c_n = \\frac{f^{(n)}(0)}{n!}$.'
      }, { custom: function (p) { return polyMatch(p.a.v, function (x) { var s = 0; for (var j = 0; j <= n; j++) s += Math.pow(kq.toNumber() * x, j) / fact(j); return s; }, [0.3, -0.8, 1.7]); } });
    }
    if (shape === 'derivs' || shape === 'derivsA') {
      var a = shape === 'derivsA' ? R.nz(-2, 3) : 0, ds = [R.int(-5, 6), R.int(-4, 5), R.nz(-6, 6), R.nz(-12, 12)], tt2 = ds.map(function (d, j) { return [Q(d, fact(j)), j]; });
      return done({
        q: 'A function has $f(' + a + ') = ' + ds[0] + '$, $f\'(' + a + ') = ' + ds[1] + '$, $f\'\'(' + a + ') = ' + ds[2] + '$ and $f\'\'\'(' + a + ') = ' + ds[3] + '$. Find its third-degree Taylor polynomial centered at $' + a + '$.',
        a: { t: 'expr', v: tayP(tt2, a), vars: ['x'] },
        steps: ['$T_3(x) = f(a) + f\'(a)' + xa(a).replace(/^x$/, 'x') + ' + \\frac{f\'\'(a)}{2!}' + xa(a) + '^{2} + \\frac{f\'\'\'(a)}{3!}' + xa(a) + '^{3}$ with $a = ' + a + '$.', 'Divide each derivative by its factorial: $\\frac{' + ds[2] + '}{2} = ' + tx(Q(ds[2], 2)) + '$ and $\\frac{' + ds[3] + '}{6} = ' + tx(Q(ds[3], 6)) + '$.', '$T_3(x) = ' + tayT(tt2, a) + '$.'],
        hint: 'Coefficient of $(x - a)^{n}$: the $n$th derivative divided by $n!$.'
      }, { custom: function (p) { return polyMatch(p.a.v, function (x) { var s = 0; for (var j = 0; j < 4; j++) s += ds[j] / fact(j) * Math.pow(x - a, j); return s; }, [0.3, -0.8, 1.7, 2.5]); } });
    }
    if (shape === 'coef') {
      var m = R.int(2, 5), f = R.pick(['ln1', 'inv1', 'inv2', 'cube', 'sin', 'cos']), val, fT, a2, st;
      if (f === 'ln1') { a2 = 1; val = Q(m % 2 ? 1 : -1, m); fT = '\\ln x'; st = ['$f^{(n)}(x) = \\frac{(-1)^{n+1}(n - 1)!}{x^{n}}$, so $f^{(n)}(1) = (-1)^{n+1}(n - 1)!$.', '$c_n = \\frac{(-1)^{n+1}(n - 1)!}{n!} = \\frac{(-1)^{n+1}}{n}$.']; }
      else if (f === 'inv1') { a2 = 1; val = Q(m % 2 ? -1 : 1); fT = '\\frac{1}{x}'; st = ['$f^{(n)}(x) = \\frac{(-1)^{n}n!}{x^{n+1}}$, so $f^{(n)}(1) = (-1)^{n}n!$.', '$c_n = (-1)^{n}$.']; }
      else if (f === 'inv2') { a2 = 2; val = Q(m % 2 ? -1 : 1, Math.pow(2, m + 1)); fT = '\\frac{1}{x}'; st = ['$f^{(n)}(x) = \\frac{(-1)^{n}n!}{x^{n+1}}$, so $f^{(n)}(2) = \\frac{(-1)^{n}n!}{2^{n+1}}$.', '$c_n = \\frac{(-1)^{n}}{2^{n+1}}$.']; }
      else if (f === 'cube') { a2 = R.nz(-2, 3); m = R.int(0, 3); val = Q(U.nCr(3, m) * Math.pow(a2, 3 - m)); fT = 'x^{3}'; st = ['The derivatives of $x^{3}$ are $3x^{2}$, $6x$, $6$, then 0, so the Taylor series stops: it is $x^{3}$ rewritten in powers of $' + xa(a2) + '$.', '$c_' + m + ' = \\frac{f^{(' + m + ')}(' + a2 + ')}{' + m + '!} = ' + tx(val) + '$.']; }
      else if (f === 'sin') { a2 = 0; m = R.pick([3, 5, 7]); val = Q(((m - 1) / 2) % 2 ? -1 : 1, fact(m)); fT = '\\sin x'; st = ['The derivatives of $\\sin x$ at 0 cycle $0, 1, 0, -1$.', '$f^{(' + m + ')}(0) = ' + (((m - 1) / 2) % 2 ? '-1' : '1') + '$, so $c_' + m + ' = ' + tx(val) + '$.']; }
      else { a2 = 0; m = R.pick([2, 4, 6]); val = Q((m / 2) % 2 ? -1 : 1, fact(m)); fT = '\\cos x'; st = ['The derivatives of $\\cos x$ at 0 cycle $1, 0, -1, 0$.', '$f^{(' + m + ')}(0) = ' + ((m / 2) % 2 ? '-1' : '1') + '$, so $c_' + m + ' = ' + tx(val) + '$.']; }
      return done({
        q: 'In the Taylor series of $f(x) = ' + fT + '$ centered at $' + a2 + '$, what is the coefficient of $' + (m === 0 ? '1 \\text{ (the constant term)}' : xa(a2) + (m === 1 ? '' : '^{' + m + '}')) + '$?',
        a: { t: 'num', v: val.toPlain() },
        steps: ['The coefficient of $(x - a)^{n}$ is $c_n = \\frac{f^{(n)}(a)}{n!}$.'].concat(st),
        hint: 'Find a pattern for $f^{(n)}(a)$, then divide by $n!$.'
      }, { custom: function (p) { var F = { ln1: 'ln(x)', inv1: '1/x', inv2: '1/x', cube: 'x^3', sin: 'sin(x)', cos: 'cos(x)' }[f], t = CAS.parse(F); for (var j = 0; j < m; j++) t = CAS.deriv(t, 'x'); var d = CAS.compile(t, ['x'])(a2); return Math.abs(d / fact(m) - ML.evalPlain(p.a.v)) < 1e-9 ? '' : 'taylor coef ' + d / fact(m); } });
    }
    if (shape === 'sincos') {
      var k2 = R.int(1, 5), fn = R.pick(['sin', 'cos']), tt3 = [];
      if (fn === 'sin') [1, 3, 5].forEach(function (j, i) { tt3.push([Q(i % 2 ? -1 : 1).mul(Q(k2).pow(j)).div(fact(j)), j]); });
      else [0, 2, 4].forEach(function (j, i) { tt3.push([Q(i % 2 ? -1 : 1).mul(Q(k2).pow(j)).div(fact(j)), j]); });
      return done({
        q: 'Find the first three nonzero terms of the Maclaurin series of $\\' + fn + (k2 === 1 ? ' x' : '(' + k2 + 'x)') + '$. Enter their sum.',
        a: { t: 'expr', v: tayP(tt3, 0), vars: ['x'] },
        steps: [fn === 'sin' ? '$\\sin u = u - \\frac{u^{3}}{3!} + \\frac{u^{5}}{5!} - \\cdots$ (only odd powers, since the even derivatives of $\\sin$ vanish at 0).' : '$\\cos u = 1 - \\frac{u^{2}}{2!} + \\frac{u^{4}}{4!} - \\cdots$ (only even powers).', k2 === 1 ? 'Here $u = x$.' : 'Substitute $u = ' + k2 + 'x$ and simplify each term.', 'Answer: $' + tayT(tt3, 0) + '$.'],
        hint: 'Write out the series for $\\' + fn + ' u$, then substitute.'
      }, { custom: function (p) { return polyMatch(p.a.v, function (x) { var s = 0; tt3.forEach(function (t) { s += t[0].toNumber() * Math.pow(x, t[1]); }); return s; }, [0.3, -0.8, 1.7]); } });
    }
    var cf2 = R.pick(['sqrt', 'sqrt', 'inv1', 'inv1', 'ln1']);
    var derivMatch = function (F, c0, deg) { return function (p) { var t = CAS.parse(F), co = []; for (var j = 0; j <= deg; j++) { co.push(CAS.compile(t, ['x'])(c0) / fact(j)); t = CAS.deriv(t, 'x'); } return polyMatch(p.a.v, function (x) { var s = 0; co.forEach(function (c, j) { s += c * Math.pow(x - c0, j); }); return s; }, [c0 - 0.4, c0 + 0.7, c0 + 1.3]); }; };
    if (cf2 === 'ln1') {
      var tt6 = [[Q(1), 1], [Q(-1, 2), 2], [Q(1, 3), 3]];
      return done({
        q: 'Find the Taylor polynomial $T_3(x)$ of $f(x) = \\ln x$ centered at $1$.',
        a: { t: 'expr', v: tayP(tt6, 1), vars: ['x'] },
        steps: ['$f(1) = 0$, $f\'(x) = \\frac{1}{x}$, $f\'\'(x) = -\\frac{1}{x^{2}}$, $f\'\'\'(x) = \\frac{2}{x^{3}}$, so $f\'(1) = 1$, $f\'\'(1) = -1$, $f\'\'\'(1) = 2$.', 'Divide by $1!, 2!, 3!$: coefficients $1, -\\frac{1}{2}, \\frac{1}{3}$.', '$T_3(x) = ' + tayT(tt6, 1) + '$.'],
        hint: 'Compute the derivatives at 1 and divide by factorials.'
      }, { custom: derivMatch('ln(x)', 1, 3) });
    }
    if (cf2 === 'inv1') {
      var cI = R.pick([1, 1, 2, 3, 4, 5]), tt4 = [0, 1, 2, 3].map(function (j) { return [Q(j % 2 ? -1 : 1, Math.pow(cI, j + 1)), j]; });
      return done({
        q: 'Find the Taylor polynomial $T_3(x)$ of $f(x) = \\frac{1}{x}$ centered at $' + cI + '$.',
        a: { t: 'expr', v: tayP(tt4, cI), vars: ['x'] },
        steps: ['$f(' + cI + ') = ' + tx(Q(1, cI)) + '$, $f\'(' + cI + ') = ' + tx(Q(-1, cI * cI)) + '$, $f\'\'(' + cI + ') = ' + tx(Q(2, Math.pow(cI, 3))) + '$, $f\'\'\'(' + cI + ') = ' + tx(Q(-6, Math.pow(cI, 4))) + '$.', 'Divide by $0!, 1!, 2!, 3!$: coefficients $' + tt4.map(function (t) { return tx(t[0]); }).join(', ') + '$.', '$T_3(x) = ' + tayT(tt4, cI) + '$.'],
        hint: 'Compute $f$, $f\'$, $f\'\'$, $f\'\'\'$ at ' + cI + ' and divide by factorials.'
      }, { custom: derivMatch('1/x', cI, 3) });
    }
    var A = R.pick([4, 9, 16, 25, 36, 49]), s0 = Math.sqrt(A), tt5 = [[Q(s0), 0], [Q(1, 2 * s0), 1], [Q(-1, 8 * s0 * s0 * s0), 2]];
    return done({
      q: 'Find the Taylor polynomial $T_2(x)$ of $f(x) = \\sqrt{x}$ centered at $' + A + '$.',
      a: { t: 'expr', v: tayP(tt5, A), vars: ['x'] },
      steps: ['$f(' + A + ') = ' + s0 + '$, $f\'(x) = \\frac{1}{2\\sqrt{x}}$ so $f\'(' + A + ') = \\frac{1}{' + 2 * s0 + '}$, $f\'\'(x) = -\\frac{1}{4x^{3/2}}$ so $f\'\'(' + A + ') = -\\frac{1}{' + 4 * s0 * s0 * s0 + '}$.', 'Divide $f\'\'$ by $2! = 2$: $-\\frac{1}{' + 8 * s0 * s0 * s0 + '}$.', '$T_2(x) = ' + tayT(tt5, A) + '$.'],
      hint: 'Center at a perfect square so the values are exact.'
    }, { custom: function (p) { return polyMatch(p.a.v, function (x) { var u = x - A; return s0 + u / (2 * s0) - u * u / (8 * s0 * s0 * s0); }, [3, 5.5, 10]); } });
  });

  G('calc2.taylor-error', function (R, ctx) {
    var shape = by(ctx, R.pick(['bound', 'bound', 'whichM']), R.pick(['bound', 'exp', 'need']), R.pick(['need', 'exp', 'bound']));
    if (shape === 'bound') {
      var fn = R.pick(['\\sin x', '\\cos x']), n = R.int(1, 6), x = R.pick([Q(1, 2), Q(1, 10), Q(1), Q(1, 5), Q(1, 3), Q(1, 4), Q(2)]), B = x.pow(n + 1).div(fact(n + 1));
      return done({
        q: 'Use Taylor\'s inequality to bound the error when $T_{' + n + '}(x)$, centered at 0, approximates $' + fn + '$ at $x = ' + tx(x) + '$. Give the bound as an exact fraction.',
        a: { t: 'num', v: B.toPlain() },
        steps: ['Taylor\'s inequality: if $|f^{(n+1)}(t)| \\le M$ between $a$ and $x$, then $|R_n(x)| \\le \\frac{M}{(n + 1)!}|x - a|^{n+1}$.', 'Every derivative of $' + fn + '$ is $\\pm\\sin$ or $\\pm\\cos$, so $M = 1$ works.', '$|R_{' + n + '}| \\le \\frac{1}{' + (n + 1) + '!}\\left(' + tx(x) + '\\right)^{' + (n + 1) + '} = ' + tx(B) + '$.'],
        hint: 'Find $M$, then use $\\frac{M|x - a|^{n+1}}{(n + 1)!}$.'
      }, { custom: function () { var t = x.toNumber(), s = 0, F = fn === '\\sin x' ? Math.sin : Math.cos; for (var j = 0; j <= n; j++) { var d = fn === '\\sin x' ? [0, 1, 0, -1][j % 4] : [1, 0, -1, 0][j % 4]; s += d * Math.pow(t, j) / fact(j); } return Math.abs(F(t) - s) <= B.toNumber() + 1e-15 ? '' : 'bound violated'; } });
    }
    if (shape === 'whichM') {
      var b = R.int(2, 4), n2 = R.int(2, 4);
      return done({
        q: 'To bound the error of $T_{' + n2 + '}(x)$ for $e^{x}$ (centered at 0) on the interval $[0, ' + b + ']$, which value of $M$ can you use in Taylor\'s inequality?',
        a: mc('$M = e^{' + b + '}$, the largest value of $f^{(' + (n2 + 1) + ')}(t) = e^{t}$ on $[0, ' + b + ']$', ['$M = 1$, the value of $f^{(' + (n2 + 1) + ')}$ at the center', '$M = ' + b + '$, the right end of the interval', '$M = \\frac{1}{' + (n2 + 1) + '!}$']),
        steps: ['$M$ must bound $|f^{(n+1)}(t)|$ for every $t$ between the center and $x$, not just at the center.', 'Here every derivative is $e^{t}$, which is increasing, so its largest value on $[0, ' + b + ']$ is $e^{' + b + '}$. (A rounder bound like $' + Math.ceil(Math.exp(b)) + '$ also works.)'],
        hint: 'Find the largest value of the next derivative on the whole interval.'
      }, null);
    }
    if (shape === 'exp') {
      var n3 = R.int(1, 8), x3 = R.pick([Q(1), Q(1, 2), Q(1, 3), Q(1, 4)]), Mv = x3.eq(1) ? 3 : 2, B3 = Q(Mv).mul(x3.pow(n3 + 1)).div(fact(n3 + 1));
      return done({
        q: 'Approximate $' + (x3.eq(1) ? 'e' : '\\sqrt' + (x3.d === 2n ? '' : '[' + x3.d + ']') + '{e} = e^{' + tx(x3).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') + '}') + '$ with the Taylor polynomial $T_{' + n3 + '}$ of $e^{x}$ at 0. Using $M = ' + Mv + '$ (since $e^{' + (x3.eq(1) ? '1' : '1/' + x3.d) + '} < ' + Mv + '$), what bound does Taylor\'s inequality give on the error?',
        a: { t: 'num', v: B3.toPlain() },
        steps: ['On $[0, ' + tx(x3) + ']$, $f^{(' + (n3 + 1) + ')}(t) = e^{t} \\le e^{' + (x3.eq(1) ? '1' : '1/' + x3.d) + '} < ' + Mv + '$.', '$|R_{' + n3 + '}| \\le \\frac{' + Mv + '}{' + (n3 + 1) + '!}\\left(' + tx(x3) + '\\right)^{' + (n3 + 1) + '} = ' + tx(B3) + '$.'],
        hint: 'Use $\\frac{M|x|^{n+1}}{(n + 1)!}$ with the given $M$.'
      }, { custom: function () { var t = x3.toNumber(), s = 0; for (var j = 0; j <= n3; j++) s += Math.pow(t, j) / fact(j); return Math.abs(Math.exp(t) - s) <= B3.toNumber() ? '' : 'exp bound violated'; } });
    }
    var fam = R.pick(['sin', 'e', 'cos']), tol = R.pick([Q(1, 50), Q(1, 100), Q(1, 500), Q(1, 1000), Q(1, 5000), Q(1, 10000), Q(1, 100000), Q(1, 1000000)]), Mv2 = fam === 'e' ? 3 : 1, nn = 0;
    while (Q(Mv2, fact(nn + 1)).gt(tol) || Q(Mv2, fact(nn + 1)).eq(tol)) nn++;
    return done({
      q: 'What is the smallest $n$ for which Taylor\'s inequality guarantees that $T_n(1)$ approximates ' + (fam === 'e' ? '$e$ (from $e^{x}$ at 0, with $M = 3$)' : fam === 'cos' ? '$\\cos 1$ (from $\\cos x$ at 0, with $M = 1$)' : '$\\sin 1$ (from $\\sin x$ at 0, with $M = 1$)') + ' with error less than $' + dec(tol) + '$?',
      a: { t: 'num', v: String(nn), form: 'int' },
      steps: ['At $x = 1$ the bound is $\\frac{' + Mv2 + '}{(n + 1)!}$. We need it to be less than $' + dec(tol) + '$, that is $(n + 1)! > ' + tol.inv().mul(Mv2).toNumber() + '$.', '$' + nn + '! = ' + fact(nn) + '$ is not big enough, but $' + (nn + 1) + '! = ' + fact(nn + 1) + '$ is.', 'So $n + 1 = ' + (nn + 1) + '$: $n = ' + nn + '$.'],
      hint: 'Factorials grow fast: list them until one passes the target.'
    }, { custom: function () { return Mv2 / fact(nn + 1) < tol.toNumber() && (nn === 0 || Mv2 / fact(nn) >= tol.toNumber()) ? '' : 'need n'; } });
  });

  G('calc2.known-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['sub', 'sub', 'coef', 'coef']), R.pick(['coef', 'sum', 'sub']), R.pick(['sum', 'coef', 'sum']));
    if (shape === 'sub') {
      var k = R.int(1, 4), fam = R.pick(['egauss', 'xe', 'x2cos', 'sinx2', 'cosrt', 'xsin', 'sinc', 'expm1', 'ek', 'cosk', 'x2e', 'xcos', 'xeg']), tt, fT, st, ex, nf = null;
      var ku = cf(k, 'x'), kT = k === 1 ? ' x' : '(' + k + 'x)';
      if (fam === 'ek') { var ke = R.pick([1, 2, 3, 4, -1, -2, -3]); tt = [[Q(1), 0], [Q(ke), 1], [Q(ke * ke, 2), 2]]; fT = 'e^{' + cf(ke, 'x') + '}'; st = 'Substitute $u = ' + cf(ke, 'x') + '$ into $e^{u} = 1 + u + \\frac{u^{2}}{2!} + \\cdots$.'; nf = [function (x) { return Math.exp(ke * x); }, 3, ke]; }
      else if (fam === 'cosk') { var kc = R.int(2, 5); tt = [[Q(1), 0], [Q(-kc * kc, 2), 2], [Q(Math.pow(kc, 4), 24), 4]]; fT = '\\cos(' + kc + 'x)'; st = 'Substitute $u = ' + kc + 'x$ into $\\cos u = 1 - \\frac{u^{2}}{2!} + \\frac{u^{4}}{4!} - \\cdots$.'; nf = [function (x) { return Math.cos(kc * x); }, 6, kc]; }
      else if (fam === 'x2e') { tt = [[Q(1), 2], [Q(k), 3], [Q(k * k, 2), 4]]; fT = 'x^{2}e^{' + ku + '}'; st = 'Multiply $e^{' + ku + '} = 1 + ' + ku + ' + \\frac{(' + ku + ')^{2}}{2!} + \\cdots$ by $x^{2}$.'; nf = [function (x) { return x * x * Math.exp(k * x); }, 5, k]; }
      else if (fam === 'xcos') { tt = [[Q(1), 1], [Q(-k * k, 2), 3], [Q(Math.pow(k, 4), 24), 5]]; fT = 'x\\cos' + kT; st = 'Multiply $\\cos u = 1 - \\frac{u^{2}}{2!} + \\frac{u^{4}}{4!} - \\cdots$ (with $u = ' + ku + '$) by $x$.'; nf = [function (x) { return x * Math.cos(k * x); }, 7, k]; }
      else if (fam === 'xeg') { var kg = R.pick([1, -1, 2, -2]); tt = [[Q(1), 1], [Q(kg), 3], [Q(kg * kg, 2), 5]]; fT = 'xe^{' + cf(kg, 'x^{2}') + '}'; st = 'Substitute $u = ' + cf(kg, 'x^{2}') + '$ into $e^{u} = 1 + u + \\frac{u^{2}}{2!} + \\cdots$, then multiply by $x$.'; nf = [function (x) { return x * Math.exp(kg * x * x); }, 7, kg]; }
      if (nf) return done({
        q: 'Find the first three nonzero terms of the Maclaurin series of $' + fT + '$. Enter their sum.',
        a: { t: 'expr', v: tayP(tt, 0), vars: ['x'] },
        steps: [st, 'First three nonzero terms: $' + tayT(tt, 0) + '$.'],
        hint: 'Start from a series you know and substitute, multiply or divide.'
      }, { custom: function (p) { var bad = ''; [5e-4, -6e-4].forEach(function (x) { var d = Math.abs(ML.evalPlain(p.a.v, { x: x }) - nf[0](x)); if (d > Math.max(1e-13, 3 * Math.pow(Math.abs(nf[2]) + 1, nf[1]) * Math.pow(Math.abs(x), nf[1]))) bad = 'near 0 mismatch at ' + x + ': ' + d; }); return bad; } });
      if (fam === 'egauss') { var kk = R.pick([1, -1, 2, -2, 3, -3]); tt = [[Q(1), 0], [Q(kk), 2], [Q(kk * kk, 2), 4]]; fT = 'e^{' + cf(kk, 'x^{2}') + '}'; st = 'Substitute $u = ' + cf(kk, 'x^{2}') + '$ into $e^{u} = 1 + u + \\frac{u^{2}}{2!} + \\cdots$.'; ex = function (x) { return 1 + kk * x * x + kk * kk * Math.pow(x, 4) / 2; }; }
      else if (fam === 'xe') { tt = [[Q(1), 1], [Q(k), 2], [Q(k * k, 2), 3]]; fT = 'xe^{' + cf(k, 'x') + '}'; st = 'Multiply $e^{' + cf(k, 'x') + '} = 1 + ' + cf(k, 'x') + ' + \\frac{(' + cf(k, 'x') + ')^{2}}{2!} + \\cdots$ by $x$.'; ex = function (x) { return x + k * x * x + k * k * x * x * x / 2; }; }
      else if (fam === 'x2cos') { tt = [[Q(1), 2], [Q(-k * k, 2), 4], [Q(Math.pow(k, 4), 24), 6]]; fT = 'x^{2}\\cos' + (k === 1 ? ' x' : '(' + k + 'x)'); st = 'Multiply $\\cos u = 1 - \\frac{u^{2}}{2!} + \\frac{u^{4}}{4!} - \\cdots$ (with $u = ' + cf(k, 'x') + '$) by $x^{2}$.'; ex = function (x) { return x * x - k * k * Math.pow(x, 4) / 2 + Math.pow(k, 4) * Math.pow(x, 6) / 24; }; }
      else if (fam === 'sinx2') { tt = [[Q(1), 2], [Q(-1, 6), 6], [Q(1, 120), 10]]; fT = '\\sin(x^{2})'; st = 'Substitute $u = x^{2}$ into $\\sin u = u - \\frac{u^{3}}{3!} + \\frac{u^{5}}{5!} - \\cdots$.'; ex = function (x) { return x * x - Math.pow(x, 6) / 6 + Math.pow(x, 10) / 120; }; }
      else if (fam === 'xsin') { tt = [[Q(k), 2], [Q(-k * k * k, 6), 4], [Q(Math.pow(k, 5), 120), 6]]; fT = 'x\\sin' + (k === 1 ? ' x' : '(' + k + 'x)'); st = 'Multiply $\\sin u = u - \\frac{u^{3}}{3!} + \\frac{u^{5}}{5!} - \\cdots$ (with $u = ' + cf(k, 'x') + '$) by $x$.'; ex = function (x) { return k * x * x - Math.pow(k, 3) * Math.pow(x, 4) / 6 + Math.pow(k, 5) * Math.pow(x, 6) / 120; }; }
      else if (fam === 'sinc') { tt = [[Q(k), 0], [Q(-k * k * k, 6), 2], [Q(Math.pow(k, 5), 120), 4]]; fT = '\\frac{\\sin' + (k === 1 ? ' x' : '(' + k + 'x)') + '}{x}\\ (x \\ne 0)'; st = 'Divide $\\sin u = u - \\frac{u^{3}}{3!} + \\frac{u^{5}}{5!} - \\cdots$ (with $u = ' + cf(k, 'x') + '$) by $x$.'; ex = function (x) { return k - Math.pow(k, 3) * x * x / 6 + Math.pow(k, 5) * Math.pow(x, 4) / 120; }; }
      else if (fam === 'expm1') { tt = [[Q(k), 0], [Q(k * k, 2), 1], [Q(k * k * k, 6), 2]]; fT = '\\frac{e^{' + cf(k, 'x') + '} - 1}{x}\\ (x \\ne 0)'; st = 'Subtract 1 from $e^{u} = 1 + u + \\frac{u^{2}}{2!} + \\frac{u^{3}}{3!} + \\cdots$ (with $u = ' + cf(k, 'x') + '$), then divide by $x$.'; ex = function (x) { return k + k * k * x / 2 + k * k * k * x * x / 6; }; }
      else { tt = [[Q(1), 0], [Q(-1, 2), 1], [Q(1, 24), 2]]; fT = '\\cos\\sqrt{x}\\ (x \\ge 0)'; st = 'Substitute $u = \\sqrt{x}$ into $\\cos u = 1 - \\frac{u^{2}}{2!} + \\frac{u^{4}}{4!} - \\cdots$: $u^{2} = x$, $u^{4} = x^{2}$.'; ex = function (x) { return 1 - x / 2 + x * x / 24; }; }
      return done({
        q: 'Find the first three nonzero terms of the Maclaurin series of $' + fT + '$. Enter their sum.',
        a: { t: 'expr', v: tayP(tt, 0), vars: ['x'] },
        steps: [st, 'First three nonzero terms: $' + tayT(tt, 0) + '$.'],
        hint: 'Start from the series for $e^{u}$, $\\sin u$ or $\\cos u$, and substitute or multiply.'
      }, { custom: function (p) { return polyMatch(p.a.v, ex, [0.3, 0.8, 1.7]); } });
    }
    if (shape === 'coef') {
      var j = R.int(1, 3), k2 = R.pick([1, 2, -1, 3, -2, Q(1, 2), 4, -3, Q(-1, 2), Q(1, 3)]), m = j + R.int(2, 5), val = Qf(k2).pow(m - j).div(fact(m - j));
      return done({
        q: 'What is the coefficient of $x^{' + m + '}$ in the Maclaurin series of $' + (j === 1 ? 'x' : 'x^{' + j + '}') + 'e^{' + cf(k2, 'x') + '}$?',
        a: { t: 'num', v: val.toPlain() },
        steps: ['$e^{' + cf(k2, 'x') + '} = \\sum_{n=0}^{\\infty}\\frac{' + (k2 === 1 ? '' : T.pow(k2, 'n')) + 'x^{n}}{n!}$, so $' + (j === 1 ? 'x' : 'x^{' + j + '}') + 'e^{' + cf(k2, 'x') + '} = \\sum_{n=0}^{\\infty}\\frac{' + (k2 === 1 ? '' : T.pow(k2, 'n')) + 'x^{n+' + j + '}}{n!}$.', 'The power $x^{' + m + '}$ comes from $n = ' + (m - j) + '$: coefficient $\\frac{' + (k2 === 1 ? '1' : T.pow(k2, m - j)) + '}{' + (m - j) + '!} = ' + tx(val) + '$.'],
        hint: 'Shift the index: which $n$ gives the power you want?'
      }, null);
    }
    var S = R.pick([
      { t: SUM(0, '\\frac{K^{n}}{n!}'), v: 'e^K', vt: 'e^{K}', s: 'This is $e^{x} = \\sum\\frac{x^{n}}{n!}$ at $x = K$.' },
      { t: SUM(0, '\\frac{(-1)^{n}\\pi^{2n}}{(2n)!}'), v: '-1', vt: '-1', s: 'This is $\\cos x = \\sum\\frac{(-1)^{n}x^{2n}}{(2n)!}$ at $x = \\pi$: $\\cos\\pi = -1$.' },
      { t: SUM(0, '\\frac{(-1)^{n}\\pi^{2n}}{3^{2n}(2n)!}'), v: '1/2', vt: '\\frac{1}{2}', s: 'This is the cosine series at $x = \\frac{\\pi}{3}$: $\\cos\\frac{\\pi}{3} = \\frac{1}{2}$.' },
      { t: SUM(0, '\\frac{(-1)^{n}\\pi^{2n+1}}{2^{2n+1}(2n + 1)!}'), v: '1', vt: '1', s: 'This is $\\sin x = \\sum\\frac{(-1)^{n}x^{2n+1}}{(2n + 1)!}$ at $x = \\frac{\\pi}{2}$: $\\sin\\frac{\\pi}{2} = 1$.' },
      { t: SUM(1, '\\frac{1}{n\\,2^{n}}'), v: 'ln(2)', vt: '\\ln 2', s: 'This is $-\\ln(1 - x) = \\sum\\frac{x^{n}}{n}$ at $x = \\frac{1}{2}$: $-\\ln\\frac{1}{2} = \\ln 2$.' },
      { t: SUM(1, '\\frac{(-1)^{n+1}}{n\\,2^{n}}'), v: 'ln(3/2)', vt: '\\ln\\frac{3}{2}', s: 'This is $\\ln(1 + x) = \\sum\\frac{(-1)^{n+1}x^{n}}{n}$ at $x = \\frac{1}{2}$.' },
      { t: SUM(0, '\\frac{(-K)^{n}}{n!}'), v: 'e^(-K)', vt: 'e^{-K}', s: 'This is $e^{x}$ at $x = -K$.' },
      { t: SUM(0, '\\frac{(-1)^{n}K^{2n}}{(2n)!}'), v: 'cos(K)', vt: '\\cos K', s: 'This is $\\cos x = \\sum\\frac{(-1)^{n}x^{2n}}{(2n)!}$ at $x = K$.', f: function (n) { return Math.pow(-1, n) * Math.pow(K, 2 * n) / fact(2 * n); }, lo: 0 },
      { t: SUM(0, '\\frac{(-1)^{n}K^{2n+1}}{(2n + 1)!}'), v: 'sin(K)', vt: '\\sin K', s: 'This is $\\sin x = \\sum\\frac{(-1)^{n}x^{2n+1}}{(2n + 1)!}$ at $x = K$.', f: function (n) { return Math.pow(-1, n) * Math.pow(K, 2 * n + 1) / fact(2 * n + 1); }, lo: 0 },
      { t: SUM(1, '\\frac{K^{n}}{n!}'), v: 'e^K-1', vt: 'e^{K} - 1', s: 'This is $e^{x} = \\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!}$ at $x = K$, without the $n = 0$ term (which is 1).', f: function (n) { return Math.pow(K, n) / fact(n); }, lo: 1 },
      { t: SUM(0, '\\frac{1}{K^{n}\\,n!}'), v: 'e^(1/K)', vt: 'e^{1/K}', s: 'This is $e^{x} = \\sum\\frac{x^{n}}{n!}$ at $x = \\frac{1}{K}$.', f: function (n) { return 1 / (Math.pow(K, n) * fact(n)); }, lo: 0 },
      { t: SUM(0, '\\frac{(-1)^{n}}{K^{n}\\,n!}'), v: 'e^(-1/K)', vt: 'e^{-1/K}', s: 'This is $e^{x}$ at $x = -\\frac{1}{K}$.', f: function (n) { return Math.pow(-1, n) / (Math.pow(K, n) * fact(n)); }, lo: 0 },
      { t: SUM(1, '\\frac{1}{n\\,K^{n}}'), v: 'ln(K/J)', vt: '\\ln\\frac{K}{J}', s: 'This is $-\\ln(1 - x) = \\sum\\frac{x^{n}}{n}$ at $x = \\frac{1}{K}$: $-\\ln\\frac{J}{K} = \\ln\\frac{K}{J}$.', f: function (n) { return 1 / (n * Math.pow(K, n)); }, lo: 1 },
      { t: SUM(1, '\\frac{(-1)^{n+1}}{n\\,K^{n}}'), v: 'ln(L/K)', vt: '\\ln\\frac{L}{K}', s: 'This is $\\ln(1 + x) = \\sum\\frac{(-1)^{n+1}x^{n}}{n}$ at $x = \\frac{1}{K}$: $\\ln\\left(1 + \\frac{1}{K}\\right) = \\ln\\frac{L}{K}$.', f: function (n) { return Math.pow(-1, n + 1) / (n * Math.pow(K, n)); }, lo: 1 }
    ]), K = R.int(2, 9), sb = function (s) { return s.replace(/\bJ\b/g, String(K - 1)).replace(/\bL\b/g, String(K + 1)).replace(/\bK\b/g, String(K)); };
    return done({
      q: 'Find the exact sum $' + sb(S.t) + '$.',
      a: { t: 'num', v: sb(S.v) },
      steps: ['Match the pattern to a series you know: $e^{x}$, $\\sin x$, $\\cos x$, $\\ln(1 + x)$.', sb(S.s), 'Sum: $' + sb(S.vt) + '$.'],
      hint: 'Factorials suggest $e^{x}$, $\\sin x$ or $\\cos x$; a plain $n$ in the denominator suggests a logarithm.'
    }, { custom: function (p) { var tf = sb(S.t), v = ML.evalPlain(p.a.v), s; if (S.f) s = nsum(S.f, S.lo, 70); else if (/K\^\{n\}|\{K\}/.test(S.t) || /\(-K\)/.test(S.t)) { var kk = /-K/.test(S.t) ? -K : K; s = nsum(function (n) { return Math.pow(kk, n) / fact(n); }, 0, 60); } else if (/2\^\{n\}\}/.test(S.t) && /n\\,2/.test(S.t)) { var alt = /\(-1\)/.test(S.t); s = nsum(function (n) { return (alt ? Math.pow(-1, n + 1) : 1) / (n * Math.pow(2, n)); }, 1, 200); } else if (/\\pi\^\{2n\+1\}/.test(S.t)) s = nsum(function (n) { return Math.pow(-1, n) * Math.pow(Math.PI / 2, 2 * n + 1) / fact(2 * n + 1); }, 0, 30); else if (/3\^\{2n\}/.test(S.t)) s = nsum(function (n) { return Math.pow(-1, n) * Math.pow(Math.PI / 3, 2 * n) / fact(2 * n); }, 0, 30); else s = nsum(function (n) { return Math.pow(-1, n) * Math.pow(Math.PI, 2 * n) / fact(2 * n); }, 0, 30); return Math.abs(s - v) < 1e-9 ? '' : 'known sum ' + s + ' vs ' + v; } });
  });

  G('calc2.binomial-series', function (R, ctx) {
    var shape = by(ctx, R.pick(['coef', 'radius', 'coef']), R.pick(['terms', 'coef', 'approx']), R.pick(['shift', 'terms', 'approx', 'terms', 'approx']));
    var ks = [Q(1, 2), Q(-1, 2), Q(1, 3), Q(-1, 3), Q(3, 2), Q(-2), Q(-3), Q(2, 3), Q(5, 2), Q(-3, 2), Q(1, 4), Q(-1, 4)];
    if (shape === 'coef') {
      var k = R.pick(ks), m = R.pick([2, 3, 4]), val = binom(k, m), cb = R.pick([2, 3, -1, -2]);
      if (R.coin()) return done({
        q: 'What is the coefficient of $x^{' + m + '}$ in the binomial series for $(1 ' + (cb > 0 ? '+ ' : '- ') + cf(Math.abs(cb), 'x') + ')^{' + tx(k) + '}$?',
        a: { t: 'num', v: val.mul(Q(cb).pow(m)).toPlain() },
        steps: ['$(1 + u)^{k} = \\sum\\binom{k}{n}u^{n}$ with $u = ' + cf(cb, 'x') + '$, so the $x^{' + m + '}$ term is $\\binom{' + tx(k) + '}{' + m + '}' + T.pow(cb, m) + 'x^{' + m + '}$.', '$\\binom{' + tx(k) + '}{' + m + '} = \\frac{' + [0, 1, 2, 3].slice(0, m).map(function (i) { return T.p(k.sub(i)); }).join('\\cdot ') + '}{' + m + '!} = ' + tx(val) + '$.', 'Multiply by $' + T.pow(cb, m) + ' = ' + Math.pow(cb, m) + '$: the coefficient is $' + tx(val.mul(Q(cb).pow(m))) + '$.'],
        hint: 'Find $\\binom{k}{n}$, then multiply by the $n$th power of the coefficient of $x$.'
      }, { custom: function (p) { var kk = k.toNumber(), b = 1; for (var i = 0; i < m; i++) b *= (kk - i) / (i + 1); return Math.abs(ML.evalPlain(p.a.v) - b * Math.pow(cb, m)) < 1e-12 ? '' : 'coef'; } });
      return done({
        q: 'Find the binomial coefficient $\\binom{' + tx(k) + '}{' + m + '}$, the coefficient of $x^{' + m + '}$ in $(1 + x)^{' + tx(k) + '}$.',
        a: { t: 'num', v: val.toPlain() },
        steps: ['$\\binom{k}{n} = \\frac{k(k - 1)\\cdots(k - n + 1)}{n!}$, which makes sense for any real $k$.', '$\\binom{' + tx(k) + '}{' + m + '} = \\frac{' + [0, 1, 2, 3].slice(0, m).map(function (i) { return T.p(k.sub(i)); }).join('\\cdot ') + '}{' + m + '!}$.', '$= ' + tx(val) + '$.'],
        hint: 'Multiply $k$, $k - 1$, … ($n$ factors), then divide by $n!$.'
      }, null);
    }
    if (shape === 'radius') {
      var c = R.int(1, 5), k2 = R.pick(ks.filter(function (q) { return !q.isInt(); })), a = R.int(1, 4), useA = R.coin();
      return done({
        q: useA ? 'Find the radius of convergence of the binomial series for $(' + a * a + ' + x)^{' + tx(k2) + '}$ centered at 0.' : 'Find the radius of convergence of the binomial series for $(1 + ' + cf(c, 'x') + ')^{' + tx(k2) + '}$.',
        a: { t: 'num', v: useA ? String(a * a) : Q(1, c).toPlain() },
        steps: useA ? ['Factor: $(' + a * a + ' + x)^{' + tx(k2) + '} = ' + a * a + '^{' + tx(k2) + '}\\left(1 + \\frac{x}{' + a * a + '}\\right)^{' + tx(k2) + '}$.', 'The binomial series $(1 + u)^{k}$ (with $k$ not a whole number) converges for $|u| < 1$.', '$\\left|\\frac{x}{' + a * a + '}\\right| < 1$ means $|x| < ' + a * a + '$: $R = ' + a * a + '$.'] : ['The binomial series $(1 + u)^{k}$ converges for $|u| < 1$ when $k$ is not a whole number.', 'Here $u = ' + cf(c, 'x') + '$, so we need $|x| < ' + tx(Q(1, c)) + '$.', '$R = ' + tx(Q(1, c)) + '$.'],
        hint: 'Rewrite as $(1 + u)^{k}$ and require $|u| < 1$.'
      }, null);
    }
    if (shape === 'terms') {
      var k3 = R.pick(ks), c3 = R.pick([1, 2, -1, 3, -2]), tt = [0, 1, 2].map(function (n) { return [binom(k3, n).mul(Q(c3).pow(n)), n]; });
      return done({
        q: 'Find the first three terms of the binomial series for $(1 ' + (c3 > 0 ? '+ ' : '- ') + cf(Math.abs(c3), 'x') + ')^{' + tx(k3) + '}$. Enter their sum.',
        a: { t: 'expr', v: tayP(tt, 0), vars: ['x'] },
        steps: ['$(1 + u)^{k} = 1 + ku + \\frac{k(k - 1)}{2}u^{2} + \\cdots$ with $k = ' + tx(k3) + '$ and $u = ' + cf(c3, 'x') + '$.', '$ku = ' + tx(k3) + '\\cdot ' + (c3 === 1 ? 'x' : tp(Q(c3)) + 'x') + ' = ' + cf(tt[1][0], 'x') + '$ and $\\frac{k(k - 1)}{2}u^{2} = ' + tx(binom(k3, 2)) + '\\cdot ' + (c3 * c3 === 1 ? 'x^{2}' : c3 * c3 + 'x^{2}') + ' = ' + cf(tt[2][0], 'x^{2}') + '$.', 'Answer: $' + tayT(tt, 0) + '$.'],
        hint: 'Use $1 + ku + \\frac{k(k - 1)}{2}u^{2}$, and square $u$ (including its coefficient).'
      }, { custom: function (p) { return polyMatch(p.a.v, function (x) { return 1 + k3.toNumber() * c3 * x + k3.toNumber() * (k3.toNumber() - 1) / 2 * c3 * c3 * x * x; }, [0.3, -0.7, 1.4]); } });
    }
    if (shape === 'shift') {
      var a4 = R.int(2, 6), f = R.pick(['sqrt', 'inv']), tt4, fT, st;
      if (f === 'sqrt') { tt4 = [[Q(a4), 0], [Q(1, 2 * a4), 1], [Q(-1, 8 * a4 * a4 * a4), 2]]; fT = '\\sqrt{' + a4 * a4 + ' + x}'; st = '$\\sqrt{' + a4 * a4 + ' + x} = ' + a4 + '\\left(1 + \\frac{x}{' + a4 * a4 + '}\\right)^{1/2} = ' + a4 + '\\left(1 + \\frac{x}{' + 2 * a4 * a4 + '} - \\frac{x^{2}}{' + 8 * Math.pow(a4, 4) + '} + \\cdots\\right)$.'; }
      else { tt4 = [[Q(1, a4), 0], [Q(-1, a4 * a4), 1], [Q(1, a4 * a4 * a4), 2]]; fT = '\\frac{1}{' + a4 + ' + x}'; st = '$\\frac{1}{' + a4 + ' + x} = \\frac{1}{' + a4 + '}\\left(1 + \\frac{x}{' + a4 + '}\\right)^{-1} = \\frac{1}{' + a4 + '}\\left(1 - \\frac{x}{' + a4 + '} + \\frac{x^{2}}{' + a4 * a4 + '} - \\cdots\\right)$.'; }
      return done({
        q: 'Find the first three terms of the Maclaurin series of $' + fT + '$. Enter their sum.',
        a: { t: 'expr', v: tayP(tt4, 0), vars: ['x'] },
        steps: ['Factor out the constant so the binomial series applies to $(1 + u)^{k}$.', st, 'Answer: $' + tayT(tt4, 0) + '$.'],
        hint: 'Pull the constant out first: $(a + x)^{k} = a^{k}\\left(1 + \\frac{x}{a}\\right)^{k}$.'
      }, { custom: function (p) { return polyMatch(p.a.v, function (x) { var s = 0; tt4.forEach(function (t) { s += t[0].toNumber() * Math.pow(x, t[1]); }); return s; }, [0.3, -0.7, 1.4]); } });
    }
    var h = R.pick([Q(1, 10), Q(1, 5), Q(-1, 10), Q(1, 20), Q(-1, 5), Q(1, 4), Q(-1, 4), Q(3, 10), Q(-1, 20), Q(1, 50)]), k5 = R.pick([Q(1, 2), Q(1, 3), Q(-1, 2)]), approx = Q(1).add(k5.mul(h)).add(binom(k5, 2).mul(h.mul(h)));
    var rootT = k5.eq(Q(1, 2)) ? '\\sqrt{' + dec(Q(1).add(h)) + '}' : k5.eq(Q(1, 3)) ? '\\sqrt[3]{' + dec(Q(1).add(h)) + '}' : '\\frac{1}{\\sqrt{' + dec(Q(1).add(h)) + '}}';
    return done({
      q: 'Estimate $' + rootT + '$ with the first three terms of the binomial series for $(1 + x)^{' + tx(k5) + '}$. Give the exact value of the estimate.',
      a: { t: 'num', v: approx.toPlain() },
      steps: ['$(1 + x)^{' + tx(k5) + '} \\approx ' + T.terms([[1, ''], [k5, 'x'], [binom(k5, 2), 'x^{2}']]) + '$, with $x = ' + dec(h) + '$.', '$1 ' + T.signed(k5.mul(h)) + ' ' + T.signed(binom(k5, 2).mul(h.mul(h))).trim() + ' = ' + tx(approx) + ' \\approx ' + approx.toDec(6) + '$.', 'The next term is tiny (it has $x^{3}$), so the estimate is very close.'],
      hint: 'Use $1 + kx + \\frac{k(k - 1)}{2}x^{2}$ with a small $x$.'
    }, { custom: function () { var t = Math.pow(1 + h.toNumber(), k5.toNumber()), nb = Math.abs(binom(k5, 3).toNumber() * Math.pow(h.toNumber(), 3)); return Math.abs(t - approx.toNumber()) < 1.5 * nb ? '' : 'approx far ' + t; } });
  });

  G('calc2.series-applications', function (R, ctx) {
    var shape = by(ctx, R.pick(['limit', 'approx']), R.pick(['limit', 'integral', 'approx']), R.pick(['integral', 'limit', 'integral', 'limit']));
    if (shape === 'limit') {
      var k = R.int(1, 4), L = R.pick([
        { t: '\\frac{\\sin(Kx) - Kx}{x^{3}}', v: Q(-k * k * k, 6), s: '$\\sin(Kx) = Kx - \\frac{(Kx)^{3}}{6} + \\cdots$, so the top is $-\\frac{K^{3}x^{3}}{6} + (\\text{higher powers})$.', f: function (x) { return (Math.sin(k * x) - k * x) / (x * x * x); } },
        { t: '\\frac{1 - \\cos(Kx)}{x^{2}}', v: Q(k * k, 2), s: '$\\cos(Kx) = 1 - \\frac{(Kx)^{2}}{2} + \\cdots$, so the top is $\\frac{K^{2}x^{2}}{2} - \\cdots$.', f: function (x) { return (1 - Math.cos(k * x)) / (x * x); } },
        { t: '\\frac{e^{Kx} - 1 - Kx}{x^{2}}', v: Q(k * k, 2), s: '$e^{Kx} = 1 + Kx + \\frac{(Kx)^{2}}{2} + \\cdots$, so the top is $\\frac{K^{2}x^{2}}{2} + \\cdots$.', f: function (x) { return (Math.exp(k * x) - 1 - k * x) / (x * x); } },
        { t: '\\frac{\\ln(1 + Kx) - Kx}{x^{2}}', v: Q(-k * k, 2), s: '$\\ln(1 + Kx) = Kx - \\frac{(Kx)^{2}}{2} + \\cdots$, so the top is $-\\frac{K^{2}x^{2}}{2} + \\cdots$.', f: function (x) { return (Math.log(1 + k * x) - k * x) / (x * x); } },
        { t: '\\frac{\\arctan(Kx) - Kx}{x^{3}}', v: Q(-k * k * k, 3), s: '$\\arctan(Kx) = Kx - \\frac{(Kx)^{3}}{3} + \\cdots$, so the top is $-\\frac{K^{3}x^{3}}{3} + \\cdots$.', f: function (x) { return (Math.atan(k * x) - k * x) / (x * x * x); } },
        { t: '\\frac{e^{Kx^{2}} - 1}{x^{2}}', v: Q(k), s: '$e^{Kx^{2}} = 1 + Kx^{2} + \\frac{(Kx^{2})^{2}}{2} + \\cdots$, so the top is $Kx^{2} + (\\text{higher powers})$.', f: function (x) { return (Math.exp(k * x * x) - 1) / (x * x); } },
        { t: '\\frac{\\cos(Kx) - 1 + \\frac{(Kx)^{2}}{2}}{x^{4}}', v: Q(Math.pow(k, 4), 24), s: '$\\cos(Kx) = 1 - \\frac{(Kx)^{2}}{2} + \\frac{(Kx)^{4}}{24} - \\cdots$, so the top is $\\frac{K^{4}x^{4}}{24} - \\cdots$.', f: function (x) { return (Math.cos(k * x) - 1 + k * k * x * x / 2) / Math.pow(x, 4); } }
      ]), sb = function (s) { return s.replace(/K\^\{4\}/g, k === 1 ? '' : String(k * k * k * k)).replace(/K\^\{3\}/g, k === 1 ? '' : String(k * k * k)).replace(/K\^\{2\}/g, k === 1 ? '' : String(k * k)).replace(/\(Kx\)/g, k === 1 ? '(x)' : '(' + k + 'x)').replace(/Kx/g, k === 1 ? 'x' : k + 'x'); };
      var md = R.pick([1, 1, 2, 3, 4]), tq = md === 1 ? sb(L.t) : sb(L.t).replace(/\}\{x\^\{(\d)\}\}$/, '}{' + md + 'x^{$1}}'), lv = L.v.div(md);
      return done({
        q: 'Use series to find $\\lim_{x\\to 0}' + tq + '$.',
        a: { t: 'num', v: lv.toPlain() },
        steps: [sb(L.s), 'Divide the leading term by the denominator: that gives $' + (md === 1 ? tx(L.v) : '\\frac{1}{' + md + '}\\cdot ' + tp(L.v)) + '$, and the higher powers still carry a factor of $x$ and vanish.', 'The limit is $' + tx(lv) + '$.'],
        hint: 'Replace the function by its Maclaurin series and cancel.'
      }, { custom: function () { var v = L.f(1e-3) / md, w = lv.toNumber(); return Math.abs(v - w) < 0.02 * Math.max(1, Math.abs(w)) ? '' : 'limit ' + v + ' vs ' + w; } });
    }
    if (shape === 'integral') {
      var fam = R.pick(['gauss', 'sinx2', 'cosx2', 'sinc', 'atanx2']), b = R.pick([Q(1, 2), Q(1), Q(1, 3), Q(1, 4), Q(2, 5), Q(3, 5), Q(1, 5), Q(3, 4), Q(2, 3), Q(1, 10), Q(4, 5)]), val, fT, st, f;
      var nextB;
      if (fam === 'sinc') { val = b.sub(b.pow(3).div(18)).add(b.pow(5).div(600)); nextB = b.pow(7).div(35280).toNumber(); fT = '\\frac{\\sin x}{x}'; st = ['$\\frac{\\sin x}{x} = 1 - \\frac{x^{2}}{6} + \\frac{x^{4}}{120} - \\cdots$ (divide the sine series by $x$).', 'Integrate term by term: $x - \\frac{x^{3}}{18} + \\frac{x^{5}}{600}$ from 0 to $' + tx(b) + '$.']; f = function (x) { return Math.sin(x) / x; }; }
      else if (fam === 'atanx2') { val = b.pow(3).div(3).sub(b.pow(7).div(21)).add(b.pow(11).div(55)); nextB = b.pow(15).div(105).toNumber(); fT = '\\arctan(x^{2})'; st = ['$\\arctan(x^{2}) = x^{2} - \\frac{x^{6}}{3} + \\frac{x^{10}}{5} - \\cdots$.', 'Integrate term by term: $\\frac{x^{3}}{3} - \\frac{x^{7}}{21} + \\frac{x^{11}}{55}$ from 0 to $' + tx(b) + '$.']; f = function (x) { return Math.atan(x * x); }; }
      else if (fam === 'gauss') { val = b.sub(b.pow(3).div(3)).add(b.pow(5).div(10)); nextB = b.pow(7).div(42).toNumber(); fT = 'e^{-x^{2}}'; st = ['$e^{-x^{2}} = 1 - x^{2} + \\frac{x^{4}}{2} - \\cdots$.', 'Integrate term by term: $x - \\frac{x^{3}}{3} + \\frac{x^{5}}{10}$ from 0 to $' + tx(b) + '$.']; f = function (x) { return Math.exp(-x * x); }; }
      else if (fam === 'sinx2') { val = b.pow(3).div(3).sub(b.pow(7).div(42)).add(b.pow(11).div(1320)); nextB = b.pow(15).div(75600).toNumber(); fT = '\\sin(x^{2})'; st = ['$\\sin(x^{2}) = x^{2} - \\frac{x^{6}}{6} + \\frac{x^{10}}{120} - \\cdots$.', 'Integrate term by term: $\\frac{x^{3}}{3} - \\frac{x^{7}}{42} + \\frac{x^{11}}{1320}$ from 0 to $' + tx(b) + '$.']; f = function (x) { return Math.sin(x * x); }; }
      else { val = b.sub(b.pow(5).div(10)).add(b.pow(9).div(216)); nextB = b.pow(13).div(9360).toNumber(); fT = '\\cos(x^{2})'; st = ['$\\cos(x^{2}) = 1 - \\frac{x^{4}}{2} + \\frac{x^{8}}{24} - \\cdots$.', 'Integrate term by term: $x - \\frac{x^{5}}{10} + \\frac{x^{9}}{216}$ from 0 to $' + tx(b) + '$.']; f = function (x) { return Math.cos(x * x); }; }
      return done({
        q: 'Approximate $\\int_0^{' + tx(b) + '} ' + fT + '\\,dx$ using the first three nonzero terms of its Maclaurin series. Give the exact value of the approximation.',
        a: { t: 'num', v: val.toPlain() },
        steps: st.concat(['Value: $' + tx(val) + ' \\approx ' + val.toDec(6) + '$. (This function has no elementary antiderivative, so series are a natural tool.)']),
        hint: 'Write the series for the integrand, integrate each term, and evaluate at the limits.'
      }, { custom: function () { var s = 0, n = 2000, B = b.toNumber(); for (var i = 0; i < n; i++) s += f((i + 0.5) / n * B); s *= B / n; return Math.abs(s - val.toNumber()) <= nextB + 1e-7 ? '' : 'integral approx ' + s + ' vs ' + val.toNumber(); } });
    }
    var fam2 = R.pick(['ln', 'exp', 'sin', 'cos', 'atan']), h = R.pick([Q(1, 10), Q(1, 5), Q(1, 2), Q(1, 4), Q(3, 10), Q(2, 5)]), v2, fT2, st2, true2, eb;
    if (fam2 === 'ln') { v2 = h.sub(h.pow(2).div(2)).add(h.pow(3).div(3)); eb = Math.pow(h.toNumber(), 4) / 4; fT2 = '\\ln\\left(' + dec(Q(1).add(h)) + '\\right)'; st2 = '$\\ln(1 + x) \\approx x - \\frac{x^{2}}{2} + \\frac{x^{3}}{3}$ at $x = ' + dec(h) + '$.'; true2 = Math.log(1 + h.toNumber()); }
    else if (fam2 === 'exp') { v2 = Q(1).add(h).add(h.pow(2).div(2)).add(h.pow(3).div(6)); eb = Math.exp(h.toNumber()) * Math.pow(h.toNumber(), 4) / 24; fT2 = 'e^{' + dec(h) + '}'; st2 = '$e^{x} \\approx 1 + x + \\frac{x^{2}}{2} + \\frac{x^{3}}{6}$ at $x = ' + dec(h) + '$.'; true2 = Math.exp(h.toNumber()); }
    else if (fam2 === 'cos') { v2 = Q(1).sub(h.pow(2).div(2)).add(h.pow(4).div(24)); eb = Math.pow(h.toNumber(), 6) / 720; fT2 = '\\cos\\left(' + dec(h) + '\\right)'; st2 = '$\\cos x \\approx 1 - \\frac{x^{2}}{2} + \\frac{x^{4}}{24}$ at $x = ' + dec(h) + '$.'; true2 = Math.cos(h.toNumber()); }
    else if (fam2 === 'atan') { v2 = h.sub(h.pow(3).div(3)).add(h.pow(5).div(5)); eb = Math.pow(h.toNumber(), 7) / 7; fT2 = '\\arctan\\left(' + dec(h) + '\\right)'; st2 = '$\\arctan x \\approx x - \\frac{x^{3}}{3} + \\frac{x^{5}}{5}$ at $x = ' + dec(h) + '$.'; true2 = Math.atan(h.toNumber()); }
    else { v2 = h.sub(h.pow(3).div(6)).add(h.pow(5).div(120)); eb = Math.pow(h.toNumber(), 7) / 5040; fT2 = '\\sin\\left(' + dec(h) + '\\right)'; st2 = '$\\sin x \\approx x - \\frac{x^{3}}{6} + \\frac{x^{5}}{120}$ at $x = ' + dec(h) + '$.'; true2 = Math.sin(h.toNumber()); }
    return done({
      q: 'Estimate $' + fT2 + '$ with the first ' + (fam2 === 'exp' ? 'four' : 'three nonzero') + ' terms of its Maclaurin series. Give the exact value of the estimate (a fraction or an exact decimal).',
      a: { t: 'num', v: v2.toPlain() },
      steps: [st2, 'Exact value of the estimate: $' + tx(v2) + ' \\approx ' + v2.toDec(7) + '$.', fam2 === 'exp' ? 'Taylor\'s inequality bounds the error by $\\frac{M x^{4}}{4!}$, tiny here.' : 'The series alternates with shrinking terms, so the error is less than the next term.'],
      hint: 'Write the series, then plug in the small number.'
    }, { custom: function () { return Math.abs(true2 - v2.toNumber()) <= eb ? '' : 'approx ' + true2 + ' vs ' + v2.toNumber(); } });
  });
})(window.MathLadder);
