// ---- 00-head.js
/* Math Ladder generators: Algebra 2 (alg2). One generator per topic in data/math/topics/alg2.json.
   Built from /tmp/work_mlp11/gen/*.js by build.js (edit the parts there, not this file).
   Every problem may carry p.chk, a small record the course's own test (verify.js) uses to check the answer independently:
     chk.zero  plain expression (in chk.v, default x) that each solution must make 0;  chk.def  expressions that must not be 0;
     chk.pos   expressions that must be positive;  chk.eqv  an independent expression the answer must equal;  chk.val  a value. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util;
  // every generator's text goes through splitWide, so long inline math can wrap on phones
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); if (p && ML.mathSegments) { p.q = splitWide(p.q, ML); if (p.steps) p.steps = p.steps.map(function (s) { return splitWide(s, ML); }); } return p; }); }
  /* split long inline math at top-level relations so it can wrap on phones: "$a = b = c$" -> "$a = b$ $= c$" */
  function vis(tex) {
    var s = String(tex), i;
    for (i = 0; i < 6; i++) s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, function (m, a, b) { return vis(a) >= vis(b) ? a : b; });
    s = s.replace(/\\text\{([^{}]*)\}/g, '$1').replace(/\\(left|right|big|Big|bigg|displaystyle|,|;|:|!|quad|qquad| )/g, '');
    s = s.replace(/\^\{([^{}]*)\}/g, function (m, a) { return new Array(Math.ceil(a.replace(/\\[a-zA-Z]+/g, 'x').length * 0.7) + 1).join('x'); });
    s = s.replace(/_\{([^{}]*)\}/g, function (m, a) { return new Array(Math.ceil(a.length * 0.7) + 1).join('x'); });
    s = s.replace(/\\(sqrt)(\[[^\]]*\])?/g, 'r').replace(/\\[a-zA-Z]+/g, 'c').replace(/[{}^_]/g, '');
    var n = 0; for (i = 0; i < s.length; i++) { var ch = s[i]; if (ch === ' ') continue; n += /[=<>+\-]/.test(ch) ? 2 : 1; } return n;
  }
  function splitTex(tex) { // top-level relation positions
    var parts = [], depth = 0, start = 0, i = 0, rel = /^(=|\\approx|\\le(?![a-z])|\\ge(?![a-z])|<|>|\\ne(?![a-z]))/;
    while (i < tex.length) {
      var ch = tex[i];
      if (ch === '\\' && /^\\left\b/.test(tex.slice(i))) { depth++; i += 5; continue; }
      if (ch === '\\' && /^\\right\b/.test(tex.slice(i))) { depth--; i += 6; continue; }
      if (ch === '{') depth++; else if (ch === '}') depth--;
      if (depth === 0 && i > start) { var m = rel.exec(tex.slice(i)); if (m && tex.slice(start, i).trim()) { parts.push(tex.slice(start, i).trim()); start = i; i += m[0].length; continue; } }
      if (ch === '\\') { var cm = /^\\[a-zA-Z]+|^\\./.exec(tex.slice(i)); i += cm ? cm[0].length : 1; continue; }
      i++;
    }
    parts.push(tex.slice(start).trim());
    return parts.filter(function (p) { return p; });
  }
  function splitWide(text, ML, lim) {
    if (typeof text !== 'string' || text.indexOf('$') < 0) return text;
    lim = lim || 30;
    var segs = ML.mathSegments(text), changed = false;
    var out = segs.map(function (sg) {
      if (!sg.math) return sg.s;
      if (sg.display || vis(sg.tex) <= lim) return sg.raw;
      var parts = splitTex(sg.tex); if (parts.length < 2) return sg.raw;
      // merge small neighbors so pieces stay meaningful (each piece up to lim)
      var merged = [parts[0]];
      for (var k = 1; k < parts.length; k++) { var last = merged[merged.length - 1]; if (vis(last + ' ' + parts[k]) <= lim) merged[merged.length - 1] = last + ' ' + parts[k]; else merged.push(parts[k]); }
      if (merged.length < 2) return sg.raw;
      changed = true; return merged.map(function (p) { return '$' + p + '$'; }).join(' ');
    });
    return changed ? out.join('') : text;
  }


  function L(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }

  // ---------------------------------------------------------------- numbers
  function q(x) { return x instanceof Q ? x : Q.from(x); }
  function qp(x) { return q(x).toPlain(); }                 // plain "3/4"
  function qt(x) { return q(x).toTex(); }                   // TeX "\frac{3}{4}"
  function pp(s) { s = String(s); return /^-/.test(s) || /[+\-*/ ]/.test(s.replace(/^-/, '')) ? '(' + s + ')' : s; } // parenthesize a plain piece
  function sgnTerm(c, body, first) { // plain term with sign: c (Q|number), body ('' or '*x^2')
    var cq = q(c); if (cq.isZero()) return '';
    var neg = cq.sign() < 0, a = cq.abs(), mag;
    if (body && a.eq(1)) mag = body.replace(/^\*/, ''); else mag = a.toPlain() + body;
    return (first ? (neg ? '-' : '') : (neg ? '-' : '+')) + mag;
  }
  function frac(n, d) { return Q(n, d); }
  function money(x) { return T.money(x); }

  // ---------------------------------------------------------------- polynomials: arrays low -> high (c[k] multiplies x^k), entries Q
  function P(a) { return a.map(q); }
  function ptrim(a) { a = a.slice(); while (a.length > 1 && a[a.length - 1].isZero()) a.pop(); return a; }
  function padd(a, b) { var n = Math.max(a.length, b.length), r = []; for (var i = 0; i < n; i++) r.push((a[i] || Q(0)).add(b[i] || Q(0))); return ptrim(r); }
  function pscale(a, k) { return ptrim(a.map(function (c) { return c.mul(k); })); }
  function psub(a, b) { return padd(a, pscale(b, -1)); }
  function pmul(a, b) { var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(Q(0)); a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] = r[i + j].add(x.mul(y)); }); }); return ptrim(r); }
  function ppow(a, n) { var r = [Q(1)]; for (var i = 0; i < n; i++) r = pmul(r, a); return r; }
  function pfromRoots(rs, lead) { var r = [q(lead === undefined ? 1 : lead)]; rs.forEach(function (x) { r = pmul(r, [q(x).neg(), Q(1)]); }); return r; }
  function peval(a, x) { x = q(x); var s = Q(0); for (var i = a.length - 1; i >= 0; i--) s = s.mul(x).add(a[i]); return s; }
  function pdeg(a) { return ptrim(a).length - 1; }
  function pdiv(a, b) { // -> { q, r } with exact rationals
    a = ptrim(a); b = ptrim(b); var r = a.slice(), dq = [], db = b.length - 1, lc = b[db];
    if (a.length - 1 < db) return { q: [Q(0)], r: a };
    for (var k = a.length - 1 - db; k >= 0; k--) { var c = r[k + db].div(lc); dq[k] = c; for (var j = 0; j <= db; j++) r[k + j] = r[k + j].sub(c.mul(b[j])); }
    r = ptrim(r.slice(0, Math.max(1, db))); return { q: ptrim(dq.map(function (c) { return c || Q(0); })), r: r };
  }
  function ptex(a, v) { return T.poly(ptrim(a).slice().reverse(), v || 'x'); }
  function pplain(a, v) {
    v = v || 'x'; a = ptrim(a); var s = '';
    for (var k = a.length - 1; k >= 0; k--) { var body = k === 0 ? '' : k === 1 ? '*' + v : '*' + v + '^' + k; s += sgnTerm(a[k], body, s === ''); }
    return s || '0';
  }
  function pint(a) { return a.every(function (c) { return c.isInt(); }); }
  // a linear factor x - r as TeX ("x - 3", "x + 2", "x", "2x - 1" for r = 1/2)
  function lfTex(r, v) { v = v || 'x'; r = q(r); if (r.isInt()) return r.isZero() ? v : v + T.signed(r.neg()); return T.lin(r.den(), v, -r.num()); }
  function lfPlain(r, v) { v = v || 'x'; r = q(r); if (r.isInt()) return r.isZero() ? v : v + (r.sign() > 0 ? '-' + r.toPlain() : '+' + r.neg().toPlain()); return r.den() + v + (r.num() > 0 ? '-' + r.num() : '+' + (-r.num())); }
  function powTex(base, m) { return m === 1 ? base : base + '^{' + m + '}'; }
  function factTex(rs, ms, lead, v) { // lead · Π (x - r)^m  as TeX
    var s = ''; rs.forEach(function (r, i) { var m = ms ? ms[i] : 1, b = lfTex(r, v); s += (rs.length === 1 && m === 1 && (lead === undefined || q(lead).eq(1)) && !/[+-]/.test(b.replace(/^-/, '')) ? b : powTex('(' + b + ')', m)); });
    if (lead !== undefined && !q(lead).eq(1)) s = (q(lead).eq(-1) ? '-' : qt(lead)) + s;
    return s;
  }
  function factPlain(rs, ms, lead, v) {
    var s = rs.map(function (r, i) { var m = ms ? ms[i] : 1; return '(' + lfPlain(r, v) + ')' + (m === 1 ? '' : '^' + m); }).join('');
    if (lead !== undefined && !q(lead).eq(1)) s = (q(lead).eq(-1) ? '-' : qp(lead)) + s;
    return s;
  }

  // ---------------------------------------------------------------- complex numbers { re: Q, im: Q }
  function C(re, im) { return { re: q(re), im: q(im === undefined ? 0 : im) }; }
  function cadd(a, b) { return C(a.re.add(b.re), a.im.add(b.im)); }
  function csub(a, b) { return C(a.re.sub(b.re), a.im.sub(b.im)); }
  function cmul(a, b) { return C(a.re.mul(b.re).sub(a.im.mul(b.im)), a.re.mul(b.im).add(a.im.mul(b.re))); }
  function cconj(a) { return C(a.re, a.im.neg()); }
  function cnorm(a) { return a.re.mul(a.re).add(a.im.mul(a.im)); }
  function cdiv(a, b) { var n = cmul(a, cconj(b)), d = cnorm(b); return C(n.re.div(d), n.im.div(d)); }
  function cplain(z) { // "3-2i", "-i", "2/5i" (CAS syntax)
    var s = z.re.isZero() ? '' : z.re.toPlain();
    if (!z.im.isZero()) { var a = z.im.abs(), body = a.eq(1) ? 'i' : a.toPlain() + 'i'; s += (z.im.sign() < 0 ? '-' : (s ? '+' : '')) + body; }
    return s || '0';
  }
  function ctex(z) {
    var s = z.re.isZero() ? '' : z.re.toTex();
    if (!z.im.isZero()) { var a = z.im.abs(), body = a.eq(1) ? 'i' : a.toTex() + 'i'; s += z.im.sign() < 0 ? (s ? ' - ' : '-') + body : (s ? ' + ' : '') + body; }
    return s || '0';
  }
  function cpar(z) { var s = ctex(z); return /[+\-]/.test(s.replace(/^-/, '')) || /^-/.test(s) ? '(' + s + ')' : s; }

  // ---------------------------------------------------------------- intervals
  function ival(a, b, oa, ob) { // plain interval; a/b numbers, Q or ±Infinity
    var A = a === -Infinity ? '-inf' : qp(a), B = b === Infinity ? 'inf' : qp(b);
    return (oa || a === -Infinity ? '(' : '[') + A + ', ' + B + (ob || b === Infinity ? ')' : ']');
  }
  function ivalTex(a, b, oa, ob) { return T.interval(a === -Infinity ? '-inf' : q(a), b === Infinity ? 'inf' : q(b), oa || a === -Infinity, ob || b === Infinity); }
  function ivalT(plain) { return ML.plainToTex ? plainIval(plain) : plain; }
  function plainIval(s) { // "(-inf, 3) U (3, inf)" -> TeX
    return s.split(/\s*U\s*/).map(function (part) {
      var m = /^([\[(])\s*([^,]+?)\s*,\s*([^\])]+?)\s*([\])])$/.exec(part.trim()); if (!m) return part;
      function e(x) { return x === '-inf' ? '-\\infty' : x === 'inf' ? '\\infty' : qt(x); }
      return m[1] + e(m[2]) + ', ' + e(m[3]) + m[4];
    }).join(' \\cup ');
  }
  // the real line minus some points, as a plain interval union
  function allBut(pts) {
    var s = pts.map(q).sort(function (a, b) { return a.cmp(b); }).filter(function (x, i, arr) { return !i || !x.eq(arr[i - 1]); });
    if (!s.length) return '(-inf, inf)';
    var parts = ['(-inf, ' + s[0].toPlain() + ')'];
    for (var i = 1; i < s.length; i++) parts.push('(' + s[i - 1].toPlain() + ', ' + s[i].toPlain() + ')');
    parts.push('(' + s[s.length - 1].toPlain() + ', inf)');
    return parts.join(' U ');
  }

  // ---------------------------------------------------------------- small text helpers
  function mc(correct, wrongs, k) { return U.mc(correct, wrongs.filter(function (w) { return w !== correct; }), k || 4); }
  function uniq(arr) { var seen = {}; return arr.filter(function (x) { var k = String(x); if (seen[k]) return false; seen[k] = 1; return true; }); }
  function ord(n) { return U.ordinal(n); }
  function m$(s) { return '$' + s + '$'; }
  function dd(s) { return '$$' + s + '$$'; }
  function tableTex(rows) { // rows: [['x', 1, 2], ['f(x)', 3, 4]] -> a small array
    var n = rows[0].length;
    return '\\begin{array}{c|' + 'c'.repeat(n - 1) + '}' + rows.map(function (r, i) { return r.map(function (c) { return typeof c === 'string' ? c : T.num(c); }).join(' & ') + (i === 0 ? ' \\\\ \\hline' : i < rows.length - 1 ? ' \\\\' : ''); }).join(' ') + '\\end{array}';
  }
  function pterms(a) { a = ptrim(a); var out = []; for (var k = a.length - 1; k >= 0; k--) if (!a[k].isZero()) out.push([a[k], k === 0 ? '' : k === 1 ? 'x' : 'x^{' + k + '}']); return out.length ? out : [[0, '']]; }
  function pnorm(a) { // scale to whole numbers with no common factor and a positive leading coefficient
    a = ptrim(a); var l = 1; a.forEach(function (c) { l = U.lcm(l, c.den()); }); var b = a.map(function (c) { return c.mul(l); });
    var g = 0; b.forEach(function (c) { g = U.gcd(g, Math.abs(c.num())); }); if (g > 1) b = b.map(function (c) { return c.div(g); });
    if (b[b.length - 1].sign() < 0) b = b.map(function (c) { return c.neg(); }); return b;
  }
  function facs(rs, v) { // product of (x - r) factors as TeX, a bare x first for r = 0: facs([0, 3]) -> "x(x - 3)"
    var z = rs.filter(function (r) { return q(r).isZero(); }), nz = rs.filter(function (r) { return !q(r).isZero(); });
    return (z.length ? (v || 'x') + (z.length > 1 ? '^{' + z.length + '}' : '') : '') + nz.map(function (r) { return '(' + lfTex(r, v) + ')'; }).join('');
  }
  function ivalToIneq(u) { // "(-inf, -2) U (1, 3]" -> "x < -2 or 1 < x <= 3"
    return u.split(/\s*U\s*/).map(function (part) {
      var m = /^([\[(])\s*([^,]+?)\s*,\s*([^\])]+?)\s*([\])])$/.exec(part.trim()); if (!m) return part;
      var lo = m[2], hi = m[3], li = m[1] === '[', hi2 = m[4] === ']';
      if (lo === '-inf' && hi === 'inf') return 'x > -inf';
      if (lo === '-inf') return 'x ' + (hi2 ? '<=' : '<') + ' ' + hi;
      if (hi === 'inf') return 'x ' + (li ? '>=' : '>') + ' ' + lo;
      return lo + ' ' + (li ? '<=' : '<') + ' x ' + (hi2 ? '<=' : '<') + ' ' + hi;
    }).join(' or ');
  }
  function mterm(c, body) { return c === 1 ? body : c === -1 ? '-' + body : c + '*' + body; }
  function nf(s) { return s.replace(/\\frac\{-([0-9a-z.]+)\}/g, '-\\frac{$1}').replace(/\+ -\\frac/g, '- \\frac').replace(/= -\\frac/g, '= -\\frac'); } // move a minus sign out of a numerator

// ---- 01-functions.js

  // =================================================================== Unit 1: functions and their graphs
  var PARENTS = [
    { k: 'id', name: 'linear (identity)', tex: 'y = x', f: function (x) { return q(x); }, plain: 'x', dom: '(-inf, inf)', ran: '(-inf, inf)', xs: [-3, -2, -1, 2, 3, 5] },
    { k: 'sq', name: 'quadratic', tex: 'y = x^{2}', f: function (x) { return q(x).mul(x); }, plain: 'x^2', dom: '(-inf, inf)', ran: '[0, inf)', xs: [-3, -2, -1, 2, 3, 4] },
    { k: 'cu', name: 'cubic', tex: 'y = x^{3}', f: function (x) { return q(x).pow(3); }, plain: 'x^3', dom: '(-inf, inf)', ran: '(-inf, inf)', xs: [-3, -2, -1, 2, 3] },
    { k: 'abs', name: 'absolute value', tex: 'y = |x|', f: function (x) { return q(x).abs(); }, plain: 'abs(x)', dom: '(-inf, inf)', ran: '[0, inf)', xs: [-4, -3, -2, -1, 2, 3, 5] },
    { k: 'sqrt', name: 'square root', tex: 'y = \\sqrt{x}', f: function (x) { x = q(x); if (x.sign() < 0 || !x.isInt() || !U.isSquare(x.num())) return null; return Q(Math.round(Math.sqrt(x.num()))); }, plain: 'sqrt(x)', dom: '[0, inf)', ran: '[0, inf)', xs: [1, 4, 9, 16, 25, 36] },
    { k: 'cbrt', name: 'cube root', tex: 'y = \\sqrt[3]{x}', f: function (x) { x = q(x); if (!x.isInt()) return null; var r = Math.round(Math.cbrt(x.num())); return r * r * r === x.num() ? Q(r) : null; }, plain: 'cbrt(x)', dom: '(-inf, inf)', ran: '(-inf, inf)', xs: [-27, -8, -1, 1, 8, 27, 64] },
    { k: 'rec', name: 'reciprocal', tex: 'y = \\frac{1}{x}', f: function (x) { x = q(x); return x.isZero() ? null : x.inv(); }, plain: '1/x', dom: '(-inf, 0) U (0, inf)', ran: '(-inf, 0) U (0, inf)', xs: [-2, -1, '1/2', '1/4', 2, 3, 4] }
  ];
  function parentBy(k) { return PARENTS.filter(function (p) { return p.k === k; })[0]; }
  // does parent p match every pair (x, y)? (undefined -> no)
  function fits(p, pairs) { return pairs.every(function (xy) { var v; try { v = p.f(xy[0]); } catch (e) { v = null; } if (v === null || v === undefined) { return false; } return v.eq(xy[1]); }); }

  G('alg2.parent-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['table', 'eval', 'domran'], ['table', 'domran', 'prop', 'eval'], ['table', 'prop', 'domran']));
    var p = R.pick(PARENTS), steps = [];
    if (kind === 'table') {
      var pairs, tries = 0;
      do { pairs = R.sample(p.xs, 3).sort(function (a, b) { return q(a).cmp(q(b)); }).map(function (x) { return [q(x), p.f(x)]; }); tries++; }
      while (PARENTS.some(function (o) { return o !== p && fits(o, pairs); }) && tries < 30);
      var others = R.sample(PARENTS.filter(function (o) { return o !== p; }), 3);
      var tbl = tableTex([['x'].concat(pairs.map(function (xy) { return qt(xy[0]); })), ['y'].concat(pairs.map(function (xy) { return qt(xy[1]); }))]);
      steps.push('Test each rule on the table. For $' + p.tex + '$: ' + pairs.map(function (xy) { return '$x = ' + qt(xy[0]) + '$ gives $' + qt(xy[1]) + '$'; }).join(', ') + '. Every pair matches.');
      others.forEach(function (o) {
        var bad = pairs.filter(function (xy) { var v = o.f(xy[0]); return !v || !v.eq(xy[1]); })[0];
        var v = o.f(bad[0]);
        steps.push('$' + o.tex + '$ fails at $x = ' + qt(bad[0]) + '$: ' + (v ? 'it gives $' + qt(v) + '$, not $' + qt(bad[1]) + '$.' : 'it is not defined there (or not a whole number), so it can\'t give $' + qt(bad[1]) + '$.'));
      });
      return { q: 'A parent function gives this table of values. Which parent function is it?' + dd(tbl),
        a: { t: 'mc', choices: ['$' + p.tex + '$'].concat(others.map(function (o) { return '$' + o.tex + '$'; })), v: 0 },
        steps: steps, hint: 'Put each $x$ into each rule and see which rule gives every $y$ in the table.' };
    }
    if (kind === 'eval') {
      var e = R.pick(['sq', 'cu', 'abs', 'sqrt', 'cbrt', 'rec']), pe = parentBy(e), x, y;
      if (e === 'sq') { x = R.nz(-9, 9); } else if (e === 'cu') { x = R.pick([-5, -4, -3, -2, 2, 3, 4]); } else if (e === 'abs') { x = R.int(-15, -2); }
      else if (e === 'sqrt') { x = R.pick([16, 25, 36, 49, 64, 81, 100, 121, 144]); } else if (e === 'cbrt') { x = R.pick([-125, -64, -27, -8, 27, 64, 125, 1000, -1000]); }
      else { x = R.pick(['1/3', '1/5', '-1/4', '2/3', '-3/5', '4', '-8']); }
      y = pe.f(x);
      var fx = pe.tex.replace('y = ', '').replace(/x/g, '{' + (e === 'sq' || e === 'cu' ? T.p(q(x)) : qt(x)) + '}');
      steps.push('Replace $x$ with $' + qt(x) + '$: $' + fx + '$.');
      if (e === 'cbrt') steps.push('Ask which number cubed gives $' + qt(x) + '$: $' + T.pow(T.p(y), 3) + ' = ' + qt(x) + '$, so the answer is $' + qt(y) + '$. Cube roots of negatives are fine.');
      else if (e === 'rec') steps.push('Dividing 1 by a fraction flips it: $' + qt(y) + '$.');
      else if (e === 'sqrt') steps.push('$' + qt(y) + '^{2} = ' + qt(x) + '$ and $' + qt(y) + '$ is not negative, so the answer is $' + qt(y) + '$.');
      else steps.push('So the output is $' + qt(y) + '$.');
      return { q: 'Evaluate the ' + pe.name + ' parent function $' + pe.tex.replace('y', 'f(x)') + '$ at $x = ' + qt(x) + '$.', a: { t: 'num', v: y.toPlain() },
        steps: steps, hint: e === 'cbrt' ? 'Which number, multiplied by itself three times, gives the input?' : 'Substitute the input for $x$.' };
    }
    if (kind === 'domran') {
      var dr = R.coin() ? 'domain' : 'range', pd = R.pick(PARENTS.filter(function (o) { return o.k !== 'id'; })), ans = pd[dr === 'domain' ? 'dom' : 'ran'];
      var why = {
        sq: { domain: 'You can square any real number.', range: 'A square is never negative, and every number $y \\ge 0$ is the square of $\\sqrt{y}$.' },
        cu: { domain: 'You can cube any real number.', range: 'Cubes keep the sign, and every real number is a cube (of its cube root).' },
        abs: { domain: 'Every real number has an absolute value.', range: 'Distances from 0 are never negative, and every $y \\ge 0$ is $|y|$.' },
        sqrt: { domain: 'No real number squares to a negative, so the input must be $0$ or more.', range: 'The square root sign means the root that is not negative, and every $y \\ge 0$ is $\\sqrt{y^{2}}$.' },
        cbrt: { domain: 'Every real number has a real cube root, negatives included.', range: 'Every real number $y$ is the cube root of $y^{3}$.' },
        rec: { domain: 'Division by 0 is undefined, so only $x = 0$ is left out.', range: 'The fraction $\\frac{1}{x}$ is never 0, and every other $y$ comes from $x = \\frac{1}{y}$.' }
      }[pd.k][dr];
      steps.push(why);
      steps.push('In interval notation: $' + plainIval(ans) + '$.');
      return { q: 'What is the ' + dr + ' of $' + pd.tex + '$? Use interval notation.', a: { t: 'interval', v: ans }, steps: steps,
        hint: dr === 'domain' ? 'Which inputs could cause trouble: a negative under an even root, or a zero in a denominator?' : 'Which outputs can the rule actually produce?' };
    }
    // prop: a description that fits exactly one parent
    var PROPS = [
      ['sqrt', 'Its domain is $[0, \\infty)$ and its range is $[0, \\infty)$.', 'Only $\\sqrt{x}$ refuses negative inputs.'],
      ['abs', 'Its domain is all real numbers, its range is $[0, \\infty)$, and its graph has a sharp corner at the origin.', 'Both $x^{2}$ and $|x|$ have that range, but only $|x|$ makes a V with a corner.'],
      ['rec', 'It is defined for every real number except $0$, and it is never equal to $0$.', 'Only $\\frac{1}{x}$ leaves out an input.'],
      ['cbrt', 'Its graph passes through $(-8, -2)$ and $(27, 3)$.', 'Cube roots: $\\sqrt[3]{-8} = -2$ and $\\sqrt[3]{27} = 3$.'],
      ['sq', 'Its range is $[0, \\infty)$ and its graph passes through $(-3, 9)$.', 'Of the two with that range, only $x^{2}$ sends $-3$ to $9$.'],
      ['cu', 'Its graph passes through $(-2, -8)$ and its range is all real numbers.', '$(-2)^{3} = -8$; no other parent sends $-2$ to $-8$.'],
      ['id', 'Its graph is a straight line through the origin with slope 1.', 'That is $y = x$.']
    ];
    var pr = R.pick(PROPS), pc = parentBy(pr[0]), wr = R.sample(PARENTS.filter(function (o) { return o !== pc; }), 3);
    return { q: 'Which parent function matches this description? ' + pr[1],
      a: { t: 'mc', choices: ['$' + pc.tex + '$'].concat(wr.map(function (o) { return '$' + o.tex + '$'; })), v: 0 },
      steps: [pr[2], 'So the function is $' + pc.tex + '$.'], hint: 'Check the domain and range of each choice first.' };
  });

  // --- transformations
  var TPAR = [
    { k: 'sq', name: 'y = x^{2}', ft: function (u) { return '(' + u + ')^{2}'; }, fp: function (u) { return '(' + u + ')^2'; }, pts: [[2, 4], [-1, 1], [3, 9], [-2, 4]], vert: 'vertex' },
    { k: 'abs', name: 'y = |x|', ft: function (u) { return '|' + u + '|'; }, fp: function (u) { return 'abs(' + u + ')'; }, pts: [[-2, 2], [3, 3], [4, 4], [-1, 1]], vert: 'vertex' },
    { k: 'sqrt', name: 'y = \\sqrt{x}', ft: function (u) { return '\\sqrt{' + u + '}'; }, fp: function (u) { return 'sqrt(' + u + ')'; }, pts: [[4, 2], [9, 3], [1, 1], [16, 4]], vert: 'starting point' },
    { k: 'cu', name: 'y = x^{3}', ft: function (u) { return '(' + u + ')^{3}'; }, fp: function (u) { return '(' + u + ')^3'; }, pts: [[2, 8], [-1, -1], [1, 1], [-2, -8]], vert: 'center (point of symmetry)' },
    { k: 'cbrt', name: 'y = \\sqrt[3]{x}', ft: function (u) { return '\\sqrt[3]{' + u + '}'; }, fp: function (u) { return 'cbrt(' + u + ')'; }, pts: [[8, 2], [-8, -2], [1, 1], [-1, -1]], vert: 'center (point of symmetry)' }
  ];
  function insideTex(b, h, expanded) {
    b = q(b); h = q(h);
    if (h.isZero()) return T.mono(b, 'x');
    if (b.eq(1)) return lfTex(h);
    if (expanded) return T.lin(b, 'x', b.mul(h).neg());
    return (b.eq(-1) ? '-' : qt(b)) + '(' + lfTex(h) + ')';
  }
  G('alg2.combined-transformations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['map', 'write'], ['map', 'write', 'vertex'], ['map', 'vertex', 'write']));
    var a = R.pick([-3, -2, -1, 2, 3]), h = R.nz(-5, 5), k = R.nz(-6, 6);
    if (kind === 'map') {
      var b = L(ctx, 1, R.pick([1, 2, 2, -1, '1/2']), R.pick([2, 3, -2, '1/2'])), expanded = lvl(ctx) === 3 && !q(b).eq(1);
      b = q(b); var p0 = R.int(-4, 6), q0 = R.int(-5, 5);
      if (!b.isInt()) p0 = R.int(-3, 3); else if (!b.abs().eq(1)) p0 = b.num() * R.int(-3, 3) || b.num() * 2;
      var inner = insideTex(b, h, expanded), g = T.coef(a, 'f\\left(' + inner + '\\right)') + T.signed(k);
      var X = q(p0).div(b).add(h), Y = q(q0).mul(a).add(k), steps = [];
      if (expanded) steps.push('Factor the inside first: $' + inner + ' = ' + insideTex(b, h, false) + '$. So the graph is squeezed or stretched horizontally by $\\frac{1}{b}$ with $b = ' + qt(b) + '$, then shifted ' + (h > 0 ? 'right ' + h : 'left ' + (-h)) + ', not $' + qt(b.mul(h).abs()) + '$.');
      steps.push('Inside, find the $x$ that feeds $f$ the old input $' + p0 + '$: solve $' + insideTex(b, h, false) + ' = ' + p0 + '$. ' + (b.eq(1) ? '' : 'Divide by $' + qt(b) + '$: $' + lfTex(h) + ' = ' + qt(q(p0).div(b)) + '$. ') + 'Then $x = ' + qt(X) + '$.');
      steps.push('Outside, the output is multiplied by $' + a + '$ and then ' + (k > 0 ? k + ' is added' : (-k) + ' is subtracted') + ': $' + T.p(a) + ' \\cdot ' + T.p(q0) + T.signed(k) + ' = ' + qt(Y) + '$.');
      steps.push('The point lands at $(' + qt(X) + ', ' + qt(Y) + ')$.');
      return { q: 'The point $(' + p0 + ', ' + q0 + ')$ is on the graph of $y = f(x)$. Where does it land on the graph of $y = ' + g + '$?',
        a: { t: 'tuple', v: [X.toPlain(), Y.toPlain()] }, steps: steps,
        hint: 'Outside numbers act on $y$ the way they look; inside numbers act on $x$ backwards (solve for $x$).', chk: { x: [p0, q0, a, b.toPlain(), h, k] } };
    }
    var tp = R.pick(TPAR);
    if (kind === 'vertex') {
      var tv = R.pick(TPAR.filter(function (t) { return t.k !== 'cu'; })), bb = R.pick([2, 3, -2, 4]), hh = R.nz(-4, 4), kk = R.nz(-6, 6), aa = R.pick([1, 1, -1, 2]);
      var ins = T.lin(bb, 'x', -bb * hh), expr = T.coef(aa, tv.ft(ins)) + T.signed(kk);
      return { q: 'Find the ' + tv.vert + ' of the graph of $y = ' + expr + '$.',
        a: { t: 'tuple', v: [String(hh), String(kk)] },
        steps: ['The ' + tv.vert + ' of $' + tv.name + '$ is at $(0, 0)$, where the inside is $0$.', 'Here the inside is $' + ins + '$. Set it to $0$: $' + ins + ' = 0$ gives $x = ' + hh + '$. (Factor it: $' + ins + ' = ' + insideTex(bb, hh, false) + '$, a shift of ' + Math.abs(hh) + ', not ' + Math.abs(bb * hh) + '.)',
          'At $x = ' + hh + '$ the ' + (tv.k === 'sq' ? 'square' : tv.k === 'abs' ? 'absolute value' : 'root') + ' is $0$, so $y = ' + kk + '$.', 'The ' + tv.vert + ' is $(' + hh + ', ' + kk + ')$.'],
        hint: 'Where is the inside expression equal to 0?' };
    }
    // write the equation from words
    var A = R.pick(L(ctx, [-1, 2, 3], [-2, -1, 2, 3, '1/2'], [-3, -2, '-1/2', 2, 3])), Aq = q(A), H = R.nz(-5, 5), K = R.nz(-6, 6);
    var words = [];
    if (Aq.sign() < 0) words.push('reflected over the $x$-axis');
    if (!Aq.abs().eq(1)) words.push(Aq.abs().gt(1) ? 'stretched vertically by a factor of $' + qt(Aq.abs()) + '$' : 'compressed vertically by a factor of $' + qt(Aq.abs()) + '$');
    var shifts = 'shifted ' + Math.abs(H) + ' unit' + (Math.abs(H) === 1 ? '' : 's') + (H > 0 ? ' right' : ' left') + ' and ' + Math.abs(K) + ' unit' + (Math.abs(K) === 1 ? '' : 's') + (K > 0 ? ' up' : ' down');
    var inner2 = lfTex(H), innerP = lfPlain(H);
    var ansTex = T.coef(Aq, tp.ft(inner2)) + T.signed(K);
    var ansPlain = (Aq.eq(1) ? '' : Aq.eq(-1) ? '-' : Aq.toPlain() + '*') + tp.fp(innerP) + (K > 0 ? '+' + K : String(K));
    return { q: 'The graph of $' + tp.name + '$ is ' + (words.length ? words.join(', ') + ', then ' : '') + shifts + '. Write an equation for the new graph.',
      a: { t: 'expr', v: ansPlain, vars: ['x'] },
      steps: [(words.length ? 'The vertical change multiplies the output by $' + qt(Aq) + '$: $y = ' + T.coef(Aq, tp.ft('x')) + '$.' : 'There is no stretch or reflection, so $a = 1$.'),
        'A shift of ' + Math.abs(H) + (H > 0 ? ' right replaces $x$ with $x - ' + H + '$' : ' left replaces $x$ with $x + ' + (-H) + '$') + ' (the inside works backwards).',
        'A shift of ' + Math.abs(K) + (K > 0 ? ' up adds ' + K : ' down subtracts ' + (-K)) + ' outside.', 'So $y = ' + ansTex + '$.'],
      hint: 'Stretches and reflections multiply the whole function; shifts go inside (left/right) and outside (up/down).',
      chk: { eqv: ansPlain } };
  });

  // --- even and odd
  G('alg2.even-odd-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['poly', 'poly', 'fneg', 'value'], ['poly', 'special', 'value'], ['special', 'special', 'poly', 'value']));
    var CH = ['Even', 'Odd', 'Neither'];
    if (kind === 'poly' || kind === 'fneg') {
      var type = R.pick(['even', 'odd', 'neither']), pw;
      if (type === 'even') pw = R.sample([6, 4, 2, 0], R.int(2, 3)); else if (type === 'odd') pw = R.sample([5, 3, 1], R.int(2, 3));
      else pw = R.sample([4, 2, 0], R.int(1, 2)).concat(R.sample([5, 3, 1], R.int(1, 2)));
      pw.sort(function (a, b) { return b - a; });
      var cs = pw.map(function () { return R.nz(-7, 7); }), coeffs = [];
      for (var i = 0; i <= pw[0]; i++) coeffs.push(Q(0));
      pw.forEach(function (p, j) { coeffs[p] = Q(cs[j]); });
      var neg = coeffs.map(function (c, i) { return i % 2 ? c.neg() : c; });
      var ft = ptex(coeffs), fnt = ptex(neg);
      if (kind === 'fneg') return { q: 'For $f(x) = ' + ft + '$, find $f(-x)$ and simplify.', a: { t: 'expr', v: pplain(neg), vars: ['x'], form: 'expanded' },
        steps: ['Replace every $x$ with $(-x)$. Even powers lose the sign: $(-x)^{2} = x^{2}$. Odd powers keep it: $(-x)^{3} = -x^{3}$.', '$f(-x) = ' + fnt + '$.',
          type === 'even' ? 'This equals $f(x)$, so $f$ is even.' : type === 'odd' ? 'This is $-f(x)$, so $f$ is odd.' : 'This is neither $f(x)$ nor $-f(x)$, so $f$ is neither even nor odd.'],
        hint: 'Only the terms with odd powers change sign.', chk: { eqv: pplain(coeffs).replace(/x/g, '(-x)') } };
      var v = type === 'even' ? 0 : type === 'odd' ? 1 : 2;
      return { q: 'Is $f(x) = ' + ft + '$ even, odd, or neither?', a: { t: 'mc', choices: CH, v: v, keep: true },
        steps: ['Find $f(-x)$: replace $x$ with $-x$. $f(-x) = ' + fnt + '$.', type === 'even' ? 'Every power is even' + (coeffs[0].isZero() ? '' : ' (a constant counts as $x^{0}$)') + ', so nothing changed: $f(-x) = f(x)$. Even.' :
          type === 'odd' ? 'Every power is odd, so every sign flipped: $f(-x) = -f(x)$. Odd.' : 'Some signs flipped and some did not, so $f(-x)$ is neither $f(x)$ nor $-f(x)$. Neither.'],
        hint: 'Compute $f(-x)$ and compare it with $f(x)$ and with $-f(x)$.' };
    }
    if (kind === 'special') {
      var S = [
        ['|x| + x^{2}', 0, '$f(-x) = |-x| + (-x)^{2} = |x| + x^{2} = f(x)$.'],
        ['x|x|', 1, '$f(-x) = (-x)|-x| = -x|x| = -f(x)$.'],
        ['\\frac{x}{x^{2} + 1}', 1, '$f(-x) = \\frac{-x}{x^{2} + 1} = -f(x)$.'],
        ['\\frac{x^{2}}{x^{4} + 1}', 0, '$f(-x) = \\frac{x^{2}}{x^{4} + 1} = f(x)$.'],
        ['(x - 1)^{2}', 2, '$f(-x) = (-x - 1)^{2} = (x + 1)^{2}$. Check numbers: $f(1) = 0$ but $f(-1) = 4$, so it is not even, and $-f(1) = 0 \\ne 4$, so it is not odd.'],
        ['x^{3} + 1', 2, '$f(-x) = -x^{3} + 1$. That is neither $x^{3} + 1$ nor $-x^{3} - 1$. The constant is an even power hiding among odd ones.'],
        ['x + \\frac{1}{x}', 1, '$f(-x) = -x - \\frac{1}{x} = -f(x)$.'],
        ['|x - 2|', 2, '$f(2) = 0$ but $f(-2) = 4$: not even, and not odd since $-f(2) = 0$.'],
        ['\\sqrt[3]{x}', 1, '$\\sqrt[3]{-x} = -\\sqrt[3]{x}$, so $f(-x) = -f(x)$.'],
        ['\\frac{5}{x^{2}}', 0, '$f(-x) = \\frac{5}{(-x)^{2}} = \\frac{5}{x^{2}} = f(x)$.'],
        ['x^{4} - x', 2, '$f(-x) = x^{4} + x$, which is neither $f(x)$ nor $-f(x)$.'],
        ['\\sqrt{x^{2} + 4}', 0, '$f(-x) = \\sqrt{(-x)^{2} + 4} = \\sqrt{x^{2} + 4} = f(x)$.'],
        ['(x + 3)(x - 3)', 0, 'Multiply out: $x^{2} - 9$. Only even powers, so $f(-x) = f(x)$.'],
        ['x(x^{2} - 4)', 1, 'Multiply out: $x^{3} - 4x$. Only odd powers, so $f(-x) = -f(x)$.'],
        ['(x + 2)^{3} - 8', 2, 'Multiply out: $x^{3} + 6x^{2} + 12x$. Even and odd powers are mixed, so neither.'],
        ['|x^{3}|', 0, '$f(-x) = |-x^{3}| = |x^{3}| = f(x)$.']
      ];
      var s = R.pick(S);
      return { q: 'Is $f(x) = ' + s[0] + '$ even, odd, or neither?', a: { t: 'mc', choices: CH, v: s[1], keep: true },
        steps: ['Compute $f(-x)$ and compare.', s[2], 'So $f$ is ' + CH[s[1]].toLowerCase() + '.'], hint: 'Replace $x$ with $-x$ everywhere, then simplify.' };
    }
    // value
    var odd = R.coin(), a = R.int(2, 8), b = R.nz(-12, 12), shift = lvl(ctx) >= 3 ? R.nz(-5, 5) : 0;
    if (shift) {
      var ans = (odd ? -b : b) + shift;
      return { q: 'The function $f$ is ' + (odd ? 'odd' : 'even') + ' and $f(' + a + ') = ' + b + '$. Let $g(x) = f(x)' + T.signed(shift) + '$. Find $g(-' + a + ')$.', a: { t: 'num', v: String(ans) },
        steps: [(odd ? 'Odd means $f(-x) = -f(x)$, so $f(-' + a + ') = ' + (-b) + '$.' : 'Even means $f(-x) = f(x)$, so $f(-' + a + ') = ' + b + '$.'), '$g(-' + a + ') = f(-' + a + ')' + T.signed(shift) + ' = ' + ans + '$.'],
        hint: 'Find $f(-' + a + ')$ first, then add.' };
    }
    return { q: 'The function $f$ is ' + (odd ? 'odd' : 'even') + ' and $f(' + a + ') = ' + b + '$. Find $f(-' + a + ')$.', a: { t: 'num', v: String(odd ? -b : b) },
      steps: [odd ? 'Odd means $f(-x) = -f(x)$: the graph is symmetric about the origin.' : 'Even means $f(-x) = f(x)$: the graph is symmetric about the $y$-axis.', 'So $f(-' + a + ') = ' + (odd ? '-(' + b + ') = ' + (-b) : String(b)) + '$.'],
      hint: odd ? 'Odd functions flip the sign of the output when the input flips.' : 'Even functions give the same output for $x$ and $-x$.' };
  });

  // --- function operations
  function linP(R, lo, hi) { return P([R.nz(lo || -9, hi || 9), R.pick([-4, -3, -2, 2, 3, 4, 5])]); }
  G('alg2.function-operations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['combine', 'value', 'domain'], ['combine', 'value', 'domain'], ['combine', 'domain', 'domain2', 'value']));
    if (kind === 'combine') {
      var f = linP(R), g = R.coin() ? P([R.nz(-6, 6), R.int(-5, 5), R.pick([1, -1, 2])]) : linP(R);
      var op = R.pick(L(ctx, ['+', '-'], ['+', '-', '*'], ['-', '*']));
      var r = op === '+' ? padd(f, g) : op === '-' ? psub(f, g) : pmul(f, g);
      var name = op === '+' ? '(f + g)(x)' : op === '-' ? '(f - g)(x)' : '(fg)(x)';
      var mid = op === '+' ? '(' + ptex(f) + ') + (' + ptex(g) + ')' : op === '-' ? '(' + ptex(f) + ') - (' + ptex(g) + ')' : '(' + ptex(f) + ')(' + ptex(g) + ')';
      var st = ['$' + name + ' = ' + mid + '$.'];
      if (op === '-') st.push('The minus sign applies to every term of $g$: $' + T.terms(pterms(f).concat(pterms(pscale(g, -1)))) + '$.');
      if (op === '*') st.push('Multiply each term of the first by each term of the second, then combine like terms.');
      st.push('$' + name + ' = ' + ptex(r) + '$.');
      return { q: 'Let $f(x) = ' + ptex(f) + '$ and $g(x) = ' + ptex(g) + '$. Find $' + name + '$.', a: { t: 'expr', v: pplain(r), vars: ['x'], form: 'expanded' },
        steps: st, hint: op === '-' ? 'Put $g(x)$ in parentheses before you subtract.' : 'Write out the two expressions and combine them.',
        chk: { eqv: '(' + pplain(f) + ')' + op + '(' + pplain(g) + ')' } };
    }
    if (kind === 'value') {
      var f2 = linP(R), g2 = P([R.nz(-6, 6), 0, 1]), c = R.nz(-4, 4), op2 = R.pick(['*', '/', '-']);
      if (peval(g2, c).isZero()) g2 = P([g2[0].add(1), 0, 1]);
      var fv = peval(f2, c), gv = peval(g2, c), v = op2 === '*' ? fv.mul(gv) : op2 === '/' ? fv.div(gv) : fv.sub(gv);
      var nm = op2 === '*' ? '(fg)' : op2 === '/' ? '\\left(\\frac{f}{g}\\right)' : '(f - g)';
      return { q: 'Let $f(x) = ' + ptex(f2) + '$ and $g(x) = ' + ptex(g2) + '$. Find $' + nm + '(' + c + ')$.', a: { t: 'num', v: v.toPlain() },
        steps: ['$f(' + c + ') = ' + qt(fv) + '$ and $g(' + c + ') = ' + qt(gv) + '$.', '$' + nm + '(' + c + ') = ' + (op2 === '*' ? T.p(qt(fv)) + ' \\cdot ' + T.p(qt(gv)) : op2 === '/' ? '\\frac{' + qt(fv) + '}{' + qt(gv) + '}' : qt(fv) + ' - ' + T.p(qt(gv))) + ' = ' + qt(v) + '$.'],
        hint: 'Find each function\'s output at ' + c + ' first, then combine the two numbers.' };
    }
    if (kind === 'domain') {
      var r1 = R.nz(-6, 6), r2 = R.intNot(-6, 6, [r1, 0]), two = R.coin();
      var gq = two ? pfromRoots([r1, r2]) : pfromRoots([r1], R.pick([1, 2, 3]));
      var f3 = linP(R);
      var bad = two ? [r1, r2] : [r1], ans = allBut(bad);
      return { q: 'Let $f(x) = ' + ptex(f3) + '$ and $g(x) = ' + ptex(gq) + '$. What is the domain of $\\frac{f}{g}$? Use interval notation.', a: { t: 'interval', v: ans },
        steps: ['Both $f$ and $g$ are polynomials, defined for every $x$. The only problem is division by $0$.', 'Solve $g(x) = 0$: $' + ptex(gq) + ' = ' + (two ? '(' + lfTex(r1) + ')(' + lfTex(r2) + ')' : ptex(gq)) + ' = 0$ when $x = ' + bad.join('$ or $x = ') + '$.', 'Leave ' + (two ? 'those values' : 'that value') + ' out: $' + plainIval(ans) + '$.'],
        hint: 'Where is the denominator $g(x)$ equal to 0?' };
    }
    // domain with a square root on top
    var m = R.int(-5, 3), rr = R.coin() ? R.int(m + 1, m + 6) : R.int(m - 5, m - 1), b0 = -m;
    var ans2 = rr > m ? ival(m, rr, false, true) + ' U ' + ival(rr, Infinity, true, true) : ival(m, Infinity);
    return { q: 'Let $f(x) = \\sqrt{' + lfTex(m) + '}$ and $g(x) = ' + lfTex(rr) + '$. What is the domain of $\\frac{f}{g}$? Use interval notation.', a: { t: 'interval', v: ans2 },
      steps: ['$f$ needs $' + lfTex(m) + ' \\ge 0$, so $x \\ge ' + m + '$.', 'The denominator $g(x)$ is $0$ at $x = ' + rr + '$.',
        rr > m ? 'That value is inside $[' + m + ', \\infty)$, so remove it: $' + plainIval(ans2) + '$.' : 'That value is already left out (it is less than ' + m + '), so the domain is $' + plainIval(ans2) + '$.'],
      hint: 'Two conditions: the square root needs a nonnegative inside, and the denominator can\'t be 0.' };
  });

  // --- composition
  G('alg2.function-composition', function (R, ctx) {
    var kind = R.pick(L(ctx, ['num', 'num', 'table'], ['num', 'expr', 'table'], ['expr', 'expr', 'num']));
    if (kind === 'table') {
      var xs = [1, 2, 3, 4, 5], gv = xs.map(function () { return R.int(1, 5); }), fv = xs.map(function () { return R.int(-3, 9); });
      var a = R.pick(xs), inner = gv[a - 1], out = fv[inner - 1];
      var tb = tableTex([['x'].concat(xs), ['f(x)'].concat(fv), ['g(x)'].concat(gv)]);
      return { q: 'Use the table to find $f(g(' + a + '))$.' + dd(tb), a: { t: 'num', v: String(out) },
        steps: ['Work from the inside out. Read $g(' + a + ')$ from the $g$ row: $g(' + a + ') = ' + inner + '$.', 'Now find $f(' + inner + ')$ in the $f$ row: $f(' + inner + ') = ' + out + '$.', 'So $f(g(' + a + ')) = ' + out + '$.'],
        hint: 'Find $g(' + a + ')$ first. Its output is the input for $f$.' };
    }
    var f = R.coin() ? P([R.nz(-5, 5), 0, R.pick([1, 1, 2, -1])]) : linP(R), g = linP(R, -6, 6);
    if (R.coin()) { var t = f; f = g; g = t; }
    if (kind === 'num') {
      var c = R.nz(-3, 3), order = R.pick(['fg', 'gf']);
      var A = order === 'fg' ? f : g, B = order === 'fg' ? g : f, an = order === 'fg' ? 'f' : 'g', bn = order === 'fg' ? 'g' : 'f';
      for (var tries = 0; tries < 20 && peval(B, c).abs().gt(7); tries++) c = R.int(-3, 3);
      var in1 = peval(B, c), out1 = peval(A, in1);
      return { q: 'Let $f(x) = ' + ptex(f) + '$ and $g(x) = ' + ptex(g) + '$. Find $' + an + '(' + bn + '(' + c + '))$.', a: { t: 'num', v: out1.toPlain() },
        steps: ['Inside first: $' + bn + '(' + c + ') = ' + qt(in1) + '$.', 'Feed that into $' + an + '$: $' + an + '(' + qt(in1) + ') = ' + qt(out1) + '$.', 'So $' + an + '(' + bn + '(' + c + ')) = ' + qt(out1) + '$. (Multiplying $' + an + '(' + c + ') \\cdot ' + bn + '(' + c + ')$ would be a different thing.)'],
        hint: 'Evaluate the inner function first.' };
    }
    var ord = R.pick(['fg', 'gf']), outer = ord === 'fg' ? f : g, innerP = ord === 'fg' ? g : f, on = ord === 'fg' ? 'f' : 'g', inn = ord === 'fg' ? 'g' : 'f';
    var comp = [Q(0)]; for (var i = outer.length - 1; i >= 0; i--) comp = padd(pmul(comp, innerP), [outer[i]]);
    var sub = pplain(outer).replace(/x/g, '(' + pplain(innerP) + ')');
    return { q: 'Let $f(x) = ' + ptex(f) + '$ and $g(x) = ' + ptex(g) + '$. Find $' + on + '(' + inn + '(x))$ and simplify.', a: { t: 'expr', v: pplain(comp), vars: ['x'], form: 'expanded' },
      steps: ['Replace every $x$ in $' + on + '$ with the whole expression $' + inn + '(x) = ' + ptex(innerP) + '$.', '$' + on + '(' + inn + '(x)) = ' + ptex(outer).replace(/x/g, '(' + ptex(innerP) + ')') + '$.', 'Expand and combine like terms: $' + ptex(comp) + '$.'],
      hint: 'Put $' + inn + '(x)$ in parentheses wherever $' + on + '$ has an $x$.', chk: { eqv: sub } };
  });

  // --- inverse functions
  G('alg2.inverse-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['lin', 'value', 'mc'], ['lin', 'cube', 'root', 'value'], ['cube', 'rational', 'root', 'rational']));
    var a = R.pick([-5, -4, -3, -2, 2, 3, 4, 5]), b = R.nz(-9, 9);
    if (kind === 'lin' || kind === 'mc') {
      var ft = T.lin(a, 'x', b), inv = '\\frac{x' + T.signed(-b) + '}{' + a + '}', invP = '(x' + (b > 0 ? '-' + b : '+' + (-b)) + ')/(' + a + ')';
      var st = ['Write $y = ' + ft + '$ and swap $x$ and $y$: $x = ' + T.lin(a, 'y', b) + '$.', 'Solve for $y$: subtract ' + b + ' to get $x' + T.signed(-b) + ' = ' + a + 'y$, then divide by $' + a + '$.', '$f^{-1}(x) = ' + inv + '$. Check: $f(1) = ' + (a + b) + '$ and $f^{-1}(' + (a + b) + ') = \\frac{' + (a + b) + T.signed(-b) + '}{' + a + '} = 1$.'];
      if (kind === 'mc') return { q: 'Let $f(x) = ' + ft + '$. Which is $f^{-1}(x)$?',
        a: mc('$' + inv + '$', ['$\\frac{1}{' + ft + '}$', '$\\frac{x}{' + a + '}' + T.signed(-b) + '$', '$\\frac{x' + T.signed(b) + '}{' + a + '}$']), steps: st,
        hint: 'The $-1$ means "undo", not "1 over". Undo the steps of $f$ in reverse order.' };
      return { q: 'Find the inverse of $f(x) = ' + ft + '$.', a: { t: 'expr', v: invP, vars: ['x'] }, steps: st, hint: 'Swap $x$ and $y$, then solve for $y$.', chk: { f: pplain(P([b, a])) } };
    }
    if (kind === 'value') {
      var x0 = R.int(-6, 6), c = a * x0 + b;
      return { q: 'Let $f(x) = ' + T.lin(a, 'x', b) + '$. Find $f^{-1}(' + c + ')$.', a: { t: 'num', v: String(x0) },
        steps: ['$f^{-1}(' + c + ')$ is the input that $f$ sends to ' + c + '. Solve $' + T.lin(a, 'x', b) + ' = ' + c + '$.', '$' + a + 'x = ' + (c - b) + '$, so $x = ' + x0 + '$.', 'Check: $f(' + x0 + ') = ' + c + '$. So $f^{-1}(' + c + ') = ' + x0 + '$.'],
        hint: 'Ask: which input gives the output ' + c + '?' };
    }
    if (kind === 'cube') {
      var a3 = R.pick([1, 2, -2, 3, 4]), b3 = R.nz(-8, 8), ft3 = T.coef(a3, 'x^{3}') + T.signed(b3);
      var inv3 = a3 === 1 ? '\\sqrt[3]{x' + T.signed(-b3) + '}' : '\\sqrt[3]{\\frac{x' + T.signed(-b3) + '}{' + a3 + '}}', invP3 = 'cbrt((x' + (b3 > 0 ? '-' + b3 : '+' + (-b3)) + ')/(' + a3 + '))';
      return { q: 'Find the inverse of $f(x) = ' + ft3 + '$.', a: { t: 'expr', v: invP3, vars: ['x'] },
        steps: ['$f$ cubes, ' + (a3 === 1 ? '' : 'multiplies by ' + a3 + ', ') + (b3 > 0 ? 'then adds ' + b3 : 'then subtracts ' + (-b3)) + '. The inverse undoes these in reverse order.', 'Swap and solve: $x = ' + T.coef(a3, 'y^{3}') + T.signed(b3) + '$, so $' + T.coef(a3, 'y^{3}') + ' = x' + T.signed(-b3) + '$' + (a3 === 1 ? '' : ' and $y^{3} = \\frac{x' + T.signed(-b3) + '}{' + a3 + '}$') + '.', 'Take the cube root: $f^{-1}(x) = ' + inv3 + '$.'],
        hint: 'Undo the last step first: the constant, then the coefficient, then the cube.', chk: { f: a3 + '*x^3+(' + b3 + ')' } };
    }
    if (kind === 'root') {
      var h = R.nz(-6, 6), k = R.nz(-6, 6);
      return { q: 'Find the inverse of $f(x) = \\sqrt{' + lfTex(h) + '}' + T.signed(k) + '$, $x \\ge ' + h + '$. (Its domain will be $x \\ge ' + k + '$.)',
        a: { t: 'expr', v: '(' + lfPlain(k) + ')^2' + (h > 0 ? '+' + h : String(h)), vars: ['x'] },
        steps: ['Swap: $x = \\sqrt{' + lfTex(h, 'y') + '}' + T.signed(k) + '$.', 'Isolate the root: $\\sqrt{' + lfTex(h, 'y') + '} = ' + lfTex(k) + '$.', 'Square both sides: $' + lfTex(h, 'y') + ' = (' + lfTex(k) + ')^{2}$, so $f^{-1}(x) = (' + lfTex(k) + ')^{2}' + T.signed(h) + '$ for $x \\ge ' + k + '$.'],
        hint: 'Swap $x$ and $y$, isolate the square root, then square both sides.', chk: { f: 'sqrt(' + lfPlain(h) + ')+(' + k + ')', fx: [h, h + 9] } };
    }
    // rational (ax + b)/(cx + d)
    var A = R.pick([1, 2, 3, -1]), B = R.nz(-5, 5), Cc = 1, D = R.nz(-5, 5);
    if (A * D - B * Cc === 0) D = D + 1 === 0 ? 2 : D + 1;
    var ftr = '\\frac{' + T.lin(A, 'x', B) + '}{' + T.lin(Cc, 'x', D) + '}', invPr = '(' + (-D) + '*x' + (B >= 0 ? '+' + B : String(B)) + ')/(x' + (A > 0 ? '-' + A : '+' + (-A)) + ')';
    var invT = '\\frac{' + T.lin(-D, 'x', B) + '}{' + lfTex(A) + '}';
    return { q: 'Find the inverse of $f(x) = ' + ftr + '$.', a: { t: 'expr', v: invPr, vars: ['x'] },
      steps: ['Swap $x$ and $y$: $x = \\frac{' + T.lin(A, 'y', B) + '}{' + T.lin(Cc, 'y', D) + '}$.', 'Multiply by the denominator: $x(' + T.lin(Cc, 'y', D) + ') = ' + T.lin(A, 'y', B) + '$, so $xy' + T.coef(D, 'x', false) + ' = ' + T.lin(A, 'y', B) + '$.',
        'Get the $y$ terms together: $xy' + T.coef(-A, 'y', false) + ' = ' + T.lin(-D, 'x', B) + '$.', 'Factor out $y$: $y(' + lfTex(A) + ') = ' + T.lin(-D, 'x', B) + '$, so $f^{-1}(x) = ' + invT + '$.'],
      hint: 'After swapping, clear the fraction, collect the $y$ terms on one side, and factor out $y$.', chk: { f: '(' + A + '*x+(' + B + '))/(x+(' + D + '))' } };
  });

  // --- verifying inverses by composition
  G('alg2.verify-inverses', function (R, ctx) {
    var kind = R.pick(L(ctx, ['tf', 'fact', 'k'], ['tf', 'comp', 'k', 'cube'], ['comp', 'cube', 'k', 'tf']));
    var a = R.pick([-4, -3, -2, 2, 3, 4, 5]), b = R.nz(-8, 8);
    if (kind === 'fact') {
      var x0 = R.int(-5, 9), y0 = R.int(-9, 12), t = R.coin();
      return { q: t ? 'The functions $f$ and $g$ are inverses, and $f(' + x0 + ') = ' + y0 + '$. Find $g(' + y0 + ')$.' : 'The functions $f$ and $g$ are inverses. Find $f(g(' + y0 + '))$.',
        a: { t: 'num', v: String(t ? x0 : y0) },
        steps: t ? ['An inverse reverses each input-output pair: $f$ sends $' + x0 + '$ to $' + y0 + '$, so $g$ sends $' + y0 + '$ back to $' + x0 + '$.'] : ['$g$ does something to $' + y0 + '$ and $f$ undoes it, so you get back where you started: $' + y0 + '$.'],
        hint: 'Inverses undo each other.' };
    }
    if (kind === 'k') {
      var k = Q(-b, a);
      var gk = T.coef(Q(1, a), 'x') + ' + k';
      return { q: 'Let $f(x) = ' + T.lin(a, 'x', b) + '$ and $g(x) = ' + gk + '$. What value of $k$ makes $f$ and $g$ inverses?', a: { t: 'num', v: k.toPlain() },
        steps: ['Compose: $f(g(x)) = ' + a + '\\left(' + gk + '\\right)' + T.signed(b) + ' = x' + T.coef(a, 'k', false) + T.signed(b) + '$.', 'For inverses this must equal $x$, so $' + T.coef(a, 'k') + T.signed(b) + ' = 0$.', '$k = ' + qt(k) + '$.'],
        hint: 'Compute $f(g(x))$ and make it equal $x$.' };
    }
    // g as m x + n (correct or with a typical error)
    var good = R.coin(), m = Q(1, a), n = Q(-b, a), form = '\\frac{x' + T.signed(-b) + '}{' + a + '}';
    if (!good) { var err = R.pick(['order', 'sign', 'recip']); if (err === 'order') { n = Q(-b); form = '\\frac{x}{' + a + '}' + T.signed(-b); } else if (err === 'sign') { n = Q(b, a); form = '\\frac{x' + T.signed(b) + '}{' + a + '}'; } else { m = Q(a); n = Q(-b); form = T.lin(a, 'x', -b); } }
    if (kind === 'cube') {
      var c3 = R.int(2, 5), gd = R.coin();
      var gt = gd ? '\\sqrt[3]{x' + T.signed(-c3) + '}' : '\\sqrt[3]{x}' + T.signed(-c3);
      var stc = gd ? ['$f(g(x)) = (\\sqrt[3]{x - ' + c3 + '})^{3} + ' + c3 + ' = x - ' + c3 + ' + ' + c3 + ' = x$.', '$g(f(x)) = \\sqrt[3]{x^{3} + ' + c3 + ' - ' + c3 + '} = \\sqrt[3]{x^{3}} = x$.', 'Both are $x$, so they are inverses.']
        : ['Try a number: $g(0) = -' + c3 + '$, then $f(-' + c3 + ') = ' + (-c3 * c3 * c3) + ' + ' + c3 + ' = ' + (-c3 * c3 * c3 + c3) + '$.', 'That is not $0$, so $f(g(x)) \\ne x$. They are not inverses: $g$ undoes the steps in the wrong order. The inverse is $\\sqrt[3]{x - ' + c3 + '}$.'];
      return { q: 'Are $f(x) = x^{3} + ' + c3 + '$ and $g(x) = ' + gt + '$ inverse functions?', a: { t: 'tf', v: gd }, steps: stc, hint: 'Compute $f(g(x))$, or test one number to look for a failure.' };
    }
    var am = m.mul(a), an = n.mul(a).add(b), comp = T.lin(am, 'x', an), ok = am.eq(1) && an.isZero();
    if (kind === 'tf') {
      var st = ['Compute $f(g(x)) = ' + a + '\\left(' + form + '\\right)' + T.signed(b) + ' = ' + comp + '$.'];
      st.push(ok ? 'Also $g(f(x)) = \\frac{(' + T.lin(a, 'x', b) + ')' + T.signed(-b) + '}{' + a + '} = x$. Both compositions give $x$: inverses.' : 'That is not $x$, so $g$ does not undo $f$. Not inverses.');
      return { q: 'Are $f(x) = ' + T.lin(a, 'x', b) + '$ and $g(x) = ' + form + '$ inverse functions?', a: { t: 'tf', v: ok }, steps: st, hint: 'Compute $f(g(x))$. Inverses give exactly $x$.' };
    }
    return { q: 'Let $f(x) = ' + T.lin(a, 'x', b) + '$ and $g(x) = ' + form + '$. Find $f(g(x))$ and simplify. Are they inverses?', a: { t: 'expr', v: pplain(P([an, am])), vars: ['x'], form: 'expanded' },
      steps: ['Replace $x$ in $f$ with $g(x)$: $f(g(x)) = ' + a + '\\left(' + form + '\\right)' + T.signed(b) + '$.', 'Distribute and combine: $' + comp + '$.', ok ? 'This is $x$, so (after checking $g(f(x))$ too) they are inverses.' : 'This is not $x$, so they are not inverses.'],
      hint: 'Distribute the ' + a + ' across both terms of $g(x)$.', chk: { eqv: a + '*(' + m.toPlain() + '*x+(' + n.toPlain() + '))+(' + b + ')' } };
  });

  // --- restricting the domain
  G('alg2.restrict-domain-inverse', function (R, ctx) {
    var kind = R.pick(L(ctx, ['formula', 'value', 'choose'], ['formula', 'domain', 'value'], ['formula', 'domain', 'formula']));
    var a = L(ctx, 1, R.pick([1, 2, -1]), R.pick([2, -1, -2, 3])), h = R.nz(-5, 5), k = R.nz(-6, 6), right = R.coin();
    var ft = T.coef(a, '(' + lfTex(h) + ')^{2}') + T.signed(k), restr = right ? 'x \\ge ' + h : 'x \\le ' + h;
    var numT = a > 0 ? lfTex(k) : T.terms([[k, ''], [-1, 'x']]), numP = a > 0 ? lfPlain(k) : k + '-x';
    var inside = Math.abs(a) === 1 ? numT : '\\frac{' + numT + '}{' + Math.abs(a) + '}', insideP = Math.abs(a) === 1 ? numP : '(' + numP + ')/' + Math.abs(a);
    var invT = h + (right ? ' + ' : ' - ') + '\\sqrt{' + inside + '}', invP = h + (right ? '+' : '-') + 'sqrt(' + insideP + ')';
    var dom = a > 0 ? ival(k, Infinity) : ival(-Infinity, k);
    if (kind === 'choose') {
      return { q: 'The function $f(x) = (' + lfTex(h) + ')^{2}' + T.signed(k) + '$ is not one-to-one. Which domain restriction makes it one-to-one while keeping every output?',
        a: mc('$x \\ge ' + h + '$', ['$x \\ge 0$', '$x \\ge ' + k + '$', '$x \\ge ' + (-h) + '$']),
        steps: ['The parabola turns around at its vertex, $(' + h + ', ' + k + ')$. On either side of $x = ' + h + '$ it only rises or only falls.', 'So keep $x \\ge ' + h + '$ (or $x \\le ' + h + '$). Cutting anywhere else either leaves a turn in or loses outputs.'],
        hint: 'Where does the parabola turn around?' };
    }
    if (kind === 'value') {
      var mm = R.int(1, 4), out = a * mm * mm + k, ans = right ? h + mm : h - mm;
      return { q: 'Let $f(x) = ' + ft + '$ with $' + restr + '$. Find $f^{-1}(' + out + ')$.', a: { t: 'num', v: String(ans) },
        steps: ['Solve $f(x) = ' + out + '$: $' + T.coef(a, '(' + lfTex(h) + ')^{2}') + ' = ' + (out - k) + '$, so $(' + lfTex(h) + ')^{2} = ' + mm * mm + '$.', '$x' + T.signed(-h) + ' = \\pm ' + mm + '$ gives $x = ' + (h + mm) + '$ or $x = ' + (h - mm) + '$.', 'Only $x = ' + ans + '$ satisfies $' + restr + '$, so $f^{-1}(' + out + ') = ' + ans + '$.'],
        hint: 'Two inputs give that output; the restriction picks one.' };
    }
    if (kind === 'domain') {
      return { q: 'Let $f(x) = ' + ft + '$ with $' + restr + '$. What is the domain of $f^{-1}$? Use interval notation.', a: { t: 'interval', v: dom },
        steps: ['The domain of $f^{-1}$ is the range of $f$.', 'On $' + restr + '$, the squared part takes every value ' + (a > 0 ? 'from $0$ up' : 'from $0$ down (because $a < 0$)') + ', so $f(x)$ takes every value ' + (a > 0 ? '$\\ge ' + k + '$' : '$\\le ' + k + '$') + '.', 'Domain of $f^{-1}$: $' + plainIval(dom) + '$.'],
        hint: 'Inputs of the inverse are outputs of $f$.' };
    }
    return { q: 'Let $f(x) = ' + ft + '$ with $' + restr + '$. Find $f^{-1}(x)$.', a: { t: 'expr', v: invP, vars: ['x'] },
      steps: ['Swap $x$ and $y$: $x = ' + T.coef(a, '(' + lfTex(h, 'y') + ')^{2}') + T.signed(k) + '$.', 'Isolate the square: $(' + lfTex(h, 'y') + ')^{2} = ' + inside + '$.',
        'Take square roots: $y' + T.signed(-h) + ' = \\pm\\sqrt{' + inside + '}$.', 'The outputs of $f^{-1}$ must satisfy $' + restr.replace('x', 'y') + '$, so take the ' + (right ? '$+$' : '$-$') + ' root: $f^{-1}(x) = ' + invT + '$.'],
      hint: 'Solve for $y$, then use the restriction to choose the sign of the square root.', chk: { f: (a === 1 ? '' : a + '*') + '(' + lfPlain(h) + ')^2+(' + k + ')', fx: right ? [h, h + 6] : [h - 6, h] } };
  });

// ---- 02-quadratics.js

  // =================================================================== Unit 2: quadratics and complex numbers
  G('alg2.vertex-formula', function (R, ctx) {
    var kind = R.pick(L(ctx, ['vertex', 'axis', 'vertex', 'ext'], ['vertex', 'ext', 'axis'], ['vertex', 'ext', 'vertex']));
    var a = R.pick(L(ctx, [1, -1, 2, -2], [1, -1, 2, -2, 3, -3], [2, -2, 3, -1, 1])), h = L(ctx, R.nz(-5, 5), R.nz(-6, 6), R.pick([R.nz(-5, 5), Q(R.pick([-7, -5, -3, -1, 1, 3, 5, 7]), 2)]));
    h = q(h); if (!h.isInt() && Math.abs(a) !== 1 && Math.abs(a) !== 2) a = a > 0 ? 1 : -1;
    var b = h.mul(-2 * a), c = q(R.int(-9, 9)), k = h.mul(h).mul(a).add(b.mul(h)).add(c);
    var f = ptex([c, b, q(a)]), mx = a > 0 ? 'minimum' : 'maximum';
    var s1 = 'Here $a = ' + a + '$ and $b = ' + qt(b) + '$. The vertex is at $x = -\\frac{b}{2a} = -\\frac{' + qt(b) + '}{2 \\cdot ' + T.p(a) + '} = ' + qt(h) + '$.';
    var s2 = 'Substitute to get the height: $f\\left(' + qt(h) + '\\right) = ' + qt(k) + '$.';
    if (kind === 'axis') return { q: 'Find the axis of symmetry of $f(x) = ' + f + '$.', a: { t: 'eq', v: 'x = ' + h.toPlain() },
      steps: [s1, 'The axis of symmetry is the vertical line through the vertex: $x = ' + qt(h) + '$.'], hint: 'The axis passes through the vertex, at $x = -\\frac{b}{2a}$.', chk: { val0: h.toPlain() } };
    if (kind === 'ext') return { q: 'Find the ' + mx + ' value of $f(x) = ' + f + '$.', a: { t: 'num', v: k.toPlain() },
      steps: ['$a = ' + a + (a > 0 ? ' > 0' : ' < 0') + '$, so the parabola opens ' + (a > 0 ? 'up and the vertex is the lowest point' : 'down and the vertex is the highest point') + '.', s1, s2, 'The ' + mx + ' value is $' + qt(k) + '$ (the $y$-coordinate of the vertex).'],
      hint: 'The ' + mx + ' is the height of the vertex.', chk: { val: pplain([c, b, q(a)]).replace(/x/g, '(' + h.toPlain() + ')') } };
    return { q: 'Find the vertex of the parabola $y = ' + f + '$.', a: { t: 'tuple', v: [h.toPlain(), k.toPlain()] }, steps: [s1, s2, 'The vertex is $\\left(' + qt(h) + ', ' + qt(k) + '\\right)$.'],
      hint: 'Use $x = -\\frac{b}{2a}$, then substitute that $x$ into the function.' };
  });

  G('alg2.quadratic-from-points', function (R, ctx) {
    var kind = R.pick(L(ctx, ['vertex', 'zeros'], ['vertex', 'zeros', 'three'], ['three', 'zeros', 'vertex']));
    if (kind === 'vertex') {
      var h = R.nz(-5, 5), k = R.int(-6, 6), a = q(L(ctx, R.pick([1, -1, 2, -2, 3]), R.pick([2, -2, 3, -1, '1/2', '-1/2']), R.pick(['1/2', '-1/2', 3, -3, '1/3']))), d = R.pick([1, 2, -1, -2, 3]);
      if (!a.isInt()) d = a.den() === 2 ? R.pick([2, -2]) : R.pick([3, -3]);
      var x1 = h + d, y1 = a.mul(d * d).add(k);
      var ans = (a.eq(1) ? '' : a.eq(-1) ? '-' : a.toPlain() + '*') + '(' + lfPlain(h) + ')^2' + (k ? (k > 0 ? '+' : '') + k : '');
      return { q: 'A parabola has vertex $(' + h + ', ' + k + ')$ and passes through $(' + x1 + ', ' + qt(y1) + ')$. Write its equation: $y = $ ?'.replace(': $y = $ ?', '. Give $y$ in terms of $x$.'),
        a: { t: 'expr', v: ans, vars: ['x'] },
        steps: ['Start from vertex form with the vertex filled in: $y = a(' + lfTex(h) + ')^{2}' + T.signed(k) + '$.', 'Substitute the point: $' + qt(y1) + ' = a(' + x1 + T.signed(-h) + ')^{2}' + T.signed(k) + ' = ' + T.mono(d * d, 'a') + T.signed(k) + '$.', 'Solve: $' + T.mono(d * d, 'a') + ' = ' + qt(y1.sub(k)) + '$, so $a = ' + qt(a) + '$.', '$y = ' + T.coef(a, '(' + lfTex(h) + ')^{2}') + T.signed(k) + '$.'],
        hint: 'Put the vertex into $y = a(x - h)^2 + k$, then use the other point to find $a$.', chk: { pts: [[h, k], [x1, y1.toPlain()]] } };
    }
    if (kind === 'zeros') {
      var r = R.int(-6, 5), s = R.intNot(-6, 6, [r]), A = q(L(ctx, R.pick([1, -1, 2]), R.pick([2, -2, 3, -1, '1/2']), R.pick(['1/2', '-1/2', 3, -3, -2])));
      var x0 = R.intNot(-4, 5, [r, s]); if (!A.isInt() && ((x0 - r) * (x0 - s)) % 2) x0 = x0 + 1 === r || x0 + 1 === s ? x0 + 3 : x0 + 1;
      if (x0 === r || x0 === s) x0 = Math.max(r, s) + 1;
      var y0 = A.mul((x0 - r) * (x0 - s)), ansz = (A.eq(1) ? '' : A.eq(-1) ? '-' : A.toPlain() + '*') + '(' + lfPlain(r) + ')(' + lfPlain(s) + ')';
      return { q: 'A parabola crosses the $x$-axis at $x = ' + r + '$ and $x = ' + s + '$ and passes through $(' + x0 + ', ' + qt(y0) + ')$. Write its equation. Give $y$ in terms of $x$.',
        a: { t: 'expr', v: ansz, vars: ['x'] },
        steps: ['Zeros $' + r + '$ and $' + s + '$ give the factors $(' + lfTex(r) + ')$ and $(' + lfTex(s) + ')$: $y = a' + facs([r, s]) + '$.', 'Substitute the point: $' + qt(y0) + ' = a(' + x0 + T.signed(-r) + ')(' + x0 + T.signed(-s) + ') = ' + T.mono((x0 - r) * (x0 - s), 'a') + '$.', 'So $a = ' + qt(A) + '$ and $y = ' + T.coef(A, facs([r, s])) + '$.'],
        hint: 'A zero at $x = r$ means a factor $(x - r)$. Then use the point to find the stretch $a$.', chk: { pts: [[r, 0], [s, 0], [x0, y0.toPlain()]] } };
    }
    // three points: solve for a, b, c
    var aa = R.pick([1, -1, 2, -2, 3]), bb = R.int(-6, 6), cc = R.int(-8, 8), xs = R.pick([[0, 1, 2], [-1, 0, 1], [0, 1, -1], [0, 2, -1]]);
    var pts = xs.map(function (x) { return [x, aa * x * x + bb * x + cc]; });
    var p0 = pts.filter(function (p) { return p[0] === 0; })[0], others = pts.filter(function (p) { return p[0] !== 0; });
    var eqs = others.map(function (p) { return T.coef(p[0] * p[0], 'a') + T.coef(p[0], 'b', false) + T.signed(cc) + ' = ' + p[1]; });
    return { q: 'Find the quadratic $y = ax^2 + bx + c$ whose graph passes through $' + pts.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join('$, $') + '$. Give $y$ in terms of $x$.',
      a: { t: 'expr', v: pplain(P([cc, bb, aa])), vars: ['x'] },
      steps: ['The point $(0, ' + p0[1] + ')$ gives $c = ' + cc + '$ right away.', 'The other two points give $' + eqs[0] + '$ and $' + eqs[1] + '$.',
        'Simplify: $' + T.coef(others[0][0] * others[0][0], 'a') + T.coef(others[0][0], 'b', false) + ' = ' + (others[0][1] - cc) + '$ and $' + T.coef(others[1][0] * others[1][0], 'a') + T.coef(others[1][0], 'b', false) + ' = ' + (others[1][1] - cc) + '$.',
        'Solve this pair (add or subtract to eliminate $b$): $a = ' + aa + '$ and $b = ' + bb + '$.', 'So $y = ' + ptex(P([cc, bb, aa])) + '$.'],
      hint: 'Substitute each point into $y = ax^2 + bx + c$. The point with $x = 0$ gives $c$ at once.', chk: { pts: pts } };
  });

  // --- complex numbers
  G('alg2.imaginary-unit', function (R, ctx) {
    var kind = R.pick(L(ctx, ['root', 'pow', 'square'], ['root', 'pow', 'prod', 'root2'], ['prod', 'pow2', 'root2', 'prod']));
    if (kind === 'root' || kind === 'root2') {
      var k = R.int(2, 12), m = kind === 'root2' ? R.pick([2, 3, 5, 6, 7]) : 1, n = k * k * m, neg = R.chance(0.25);
      var v = (neg ? '-' : '') + (m === 1 ? k + 'i' : k + '*sqrt(' + m + ')*i'), tex = (neg ? '-' : '') + (m === 1 ? k + 'i' : k + '\\sqrt{' + m + '}\\,i');
      return { q: 'Simplify $' + (neg ? '-' : '') + '\\sqrt{-' + n + '}$.', a: { t: 'num', v: v, form: 'simplest' },
        steps: ['Split off $-1$: $\\sqrt{-' + n + '} = \\sqrt{' + n + '} \\cdot \\sqrt{-1} = \\sqrt{' + n + '}\\,i$.', m === 1 ? '$\\sqrt{' + n + '} = ' + k + '$.' : 'Simplify the root: $\\sqrt{' + n + '} = \\sqrt{' + (k * k) + ' \\cdot ' + m + '} = ' + k + '\\sqrt{' + m + '}$.', 'So the answer is $' + tex + '$.'],
        hint: 'Write $\\sqrt{-' + n + '}$ as $\\sqrt{' + n + '} \\cdot i$.', chk: { val: (neg ? '-' : '') + 'sqrt(-' + n + ')' } };
    }
    if (kind === 'pow' || kind === 'pow2') {
      var e = R.int(kind === 'pow' ? 5 : 20, kind === 'pow' ? 30 : 150), rr = e % 4, val = ['1', 'i', '-1', '-i'][rr];
      if (kind === 'pow2' && R.coin()) { var e2 = R.int(3, 40), tot = e + e2, r2 = tot % 4, v2 = ['1', 'i', '-1', '-i'][r2];
        return { q: 'Simplify $i^{' + e + '} \\cdot i^{' + e2 + '}$.', a: { t: 'num', v: v2 },
          steps: ['Add exponents: $i^{' + e + '} \\cdot i^{' + e2 + '} = i^{' + tot + '}$.', 'Powers of $i$ repeat every 4: $i^{4} = 1$. Divide ' + tot + ' by 4: remainder ' + r2 + '.', '$i^{' + tot + '} = i^{' + r2 + '} = ' + ['1', 'i', '-1', '-i'][r2] + '$.'], hint: 'Combine into one power, then use $i^{4} = 1$.' };
      }
      return { q: 'Simplify $i^{' + e + '}$.', a: { t: 'num', v: val },
        steps: ['The powers of $i$ cycle: $i^{1} = i$, $i^{2} = -1$, $i^{3} = -i$, $i^{4} = 1$, then repeat.', '$' + e + ' = 4 \\cdot ' + Math.floor(e / 4) + ' + ' + rr + '$, so $i^{' + e + '} = (i^{4})^{' + Math.floor(e / 4) + '} \\cdot i^{' + rr + '} = i^{' + rr + '}$.', '$i^{' + rr + '} = ' + val + '$.'],
        hint: 'Find the remainder when ' + e + ' is divided by 4.' };
    }
    if (kind === 'square') {
      var b = R.int(2, 9), sg = R.pick([1, -1]);
      return { q: 'Simplify $(' + (sg < 0 ? '-' : '') + b + 'i)^{2}$.', a: { t: 'num', v: String(-b * b) },
        steps: ['Square each factor: $(' + (sg < 0 ? '-' : '') + b + ')^{2} \\cdot i^{2} = ' + (b * b) + ' \\cdot i^{2}$.', 'Replace $i^{2}$ with $-1$: $' + (b * b) + '(-1) = ' + (-b * b) + '$.'], hint: 'Use $i^2 = -1$.' };
    }
    // product of two square roots of negatives (the trouble spot)
    var p = R.int(1, 6), qq = R.intNot(1, 7, [p]), m2 = R.pick([1, 1, 2, 3]);
    var A = p * p * m2, B = qq * qq * m2, prod = -p * qq * m2;
    return { q: 'Simplify $\\sqrt{-' + A + '} \\cdot \\sqrt{-' + B + '}$.', a: { t: 'num', v: String(prod) },
      steps: ['First write each root with $i$: $\\sqrt{-' + A + '} = ' + (m2 === 1 ? T.mono(p, 'i') : T.sqrt(A) + 'i') + '$ and $\\sqrt{-' + B + '} = ' + (m2 === 1 ? T.mono(qq, 'i') : T.sqrt(B) + 'i') + '$.', 'Multiply: $' + (m2 === 1 ? p * qq : p * qq + ' \\cdot ' + m2) + ' \\cdot i^{2} = ' + (p * qq * m2) + '(-1) = ' + prod + '$.', 'The rule $\\sqrt{a}\\sqrt{b} = \\sqrt{ab}$ only holds when $a, b \\ge 0$; using it here would give $+' + (p * qq * m2) + '$, which is wrong.'],
      hint: 'Change each root to an $i$ form before you multiply.' };
  });

  function rc(R, lo, hi) { return C(R.int(lo, hi), R.nz(lo, hi)); }
  G('alg2.complex-arithmetic', function (R, ctx) {
    var kind = R.pick(L(ctx, ['add', 'sub', 'mul'], ['sub', 'mul', 'mul', 'sq'], ['mul', 'sq', 'conj', 'mix']));
    var z = rc(R, -8, 8), w = rc(R, -8, 8), res, q0, st;
    if (kind === 'add' || kind === 'sub') {
      res = kind === 'add' ? cadd(z, w) : csub(z, w);
      q0 = cpar(z) + (kind === 'add' ? ' + ' : ' - ') + cpar(w);
      st = ['Combine real parts and imaginary parts separately, like collecting like terms.', 'Real: $' + qt(z.re) + (kind === 'add' ? ' + ' : ' - ') + T.p(qt(w.re)) + ' = ' + qt(res.re) + '$. Imaginary: $' + qt(z.im) + (kind === 'add' ? ' + ' : ' - ') + T.p(qt(w.im)) + ' = ' + qt(res.im) + '$.', 'Result: $' + ctex(res) + '$.'];
    } else if (kind === 'mul' || kind === 'conj') {
      z = C(R.nz(-6, 6), R.nz(-6, 6)); w = kind === 'conj' ? cconj(z) : C(R.nz(-6, 6), R.nz(-6, 6)); res = cmul(z, w);
      q0 = cpar(z) + cpar(w);
      var ac = z.re.mul(w.re), ad = z.re.mul(w.im), bc = z.im.mul(w.re), bd = z.im.mul(w.im);
      st = ['Multiply like binomials (FOIL): $' + T.terms([[ac, ''], [ad, 'i'], [bc, 'i'], [bd, 'i^{2}']]) + '$.', 'Replace $i^{2}$ with $-1$: the last term becomes $' + qt(bd.neg()) + '$.', 'Combine: real part $' + qt(ac) + T.signed(bd.neg()) + ' = ' + qt(res.re) + '$, imaginary part $' + qt(ad) + T.signed(bc) + ' = ' + qt(res.im) + '$.', 'Result: $' + ctex(res) + '$.' + (kind === 'conj' ? ' A number times its conjugate is always real: $a^{2} + b^{2}$.' : '')];
    } else if (kind === 'sq') {
      z = C(R.nz(-6, 6), R.nz(-6, 6)); res = cmul(z, z); q0 = '(' + ctex(z) + ')^{2}';
      st = ['$(' + ctex(z) + ')^{2} = (' + ctex(z) + ')(' + ctex(z) + ')$. Use $(a + bi)^{2} = a^{2} + 2abi + b^{2}i^{2}$.', '$a^{2} = ' + qt(z.re.mul(z.re)) + '$, $2ab = ' + qt(z.re.mul(z.im).mul(2)) + '$, $b^{2}i^{2} = -' + qt(z.im.mul(z.im)) + '$.', 'Result: $' + ctex(res) + '$.'];
    } else {
      var k = R.pick([-4, -3, -2, 2, 3, 4]); res = csub(cmul(C(k), z), w); q0 = k + '(' + ctex(z) + ') - ' + cpar(w);
      st = ['Distribute: $' + k + '(' + ctex(z) + ') = ' + ctex(cmul(C(k), z)) + '$.', 'Subtract the second number, part by part: $' + ctex(res) + '$.'];
    }
    return { q: 'Simplify $' + q0 + '$. Write the answer as $a + bi$.', a: { t: 'num', v: cplain(res) }, steps: st, hint: kind === 'add' || kind === 'sub' ? 'Treat $i$ like a variable and combine like terms.' : 'Multiply out, then replace $i^2$ with $-1$.',
      chk: { val: q0.replace(/\\left|\\right/g, '').replace(/\{|\}/g, '').replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(') } };
  });

  G('alg2.complex-division', function (R, ctx) {
    var kind = R.pick(L(ctx, ['nice', 'byi', 'nice'], ['nice', 'frac', 'recip'], ['frac', 'frac', 'recip', 'byi']));
    var w = C(R.nz(-4, 4), R.nz(-4, 4)), z, res;
    if (kind === 'nice') { res = rc(R, -5, 5); z = cmul(res, w); }
    else if (kind === 'byi') { w = C(0, R.nz(-5, 5)); z = rc(R, -9, 9); res = cdiv(z, w); }
    else if (kind === 'recip') { z = C(1, 0); if (R.coin()) z = C(R.int(2, 5), 0); res = cdiv(z, w); }
    else { z = rc(R, -7, 7); res = cdiv(z, w); }
    var cj = cconj(w), num = cmul(z, cj), den = cnorm(w);
    var st = [];
    if (kind === 'byi') st.push('Multiply top and bottom by $i$ (or by the conjugate $' + ctex(cj) + '$): the bottom becomes $' + ctex(w) + ' \\cdot ' + ctex(cj) + ' = ' + qt(den) + '$.');
    else st.push('Multiply top and bottom by the conjugate of the denominator, $' + ctex(cj) + '$.');
    st.push('Denominator: $' + cpar(w) + cpar(cj) + ' = ' + qt(w.re.mul(w.re)) + ' + ' + qt(w.im.mul(w.im)) + ' = ' + qt(den) + '$, a real number.');
    st.push('Numerator: $' + cpar(z) + cpar(cj) + ' = ' + ctex(num) + '$.');
    st.push('Divide each part by ' + qt(den) + ': $\\frac{' + ctex(num) + '}{' + qt(den) + '} = ' + ctex(res) + '$.');
    return { q: 'Divide and write the answer as $a + bi$: $\\dfrac{' + ctex(z) + '}{' + ctex(w) + '}$', a: { t: 'num', v: cplain(res) }, steps: st,
      hint: 'Multiply the numerator and denominator by the conjugate of the denominator.', chk: { val: '(' + cplain(z) + ')/(' + cplain(w) + ')' } };
  });

  G('alg2.complex-solutions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['pure', 'monic', 'monic'], ['monic', 'scaled', 'half'], ['surd', 'scaled', 'half', 'count']));
    var p, qv, a = 1, roots, rootTex, polyc;
    if (kind === 'count') {
      var A = R.pick([1, 2, -1, 3]), B = R.int(-8, 8), Cc = R.int(-9, 9), D = B * B - 4 * A * Cc;
      var ans = D > 0 ? 0 : D === 0 ? 1 : 2;
      return { q: 'How many solutions does $' + ptex(P([Cc, B, A])) + ' = 0$ have, and what kind?',
        a: { t: 'mc', choices: ['Two real solutions', 'One real solution (a double root)', 'Two complex (non-real) solutions'], v: ans, keep: true },
        steps: ['Compute the discriminant: $b^{2} - 4ac = ' + T.p(B) + '^{2} - 4 \\cdot ' + T.p(A) + ' \\cdot ' + T.p(Cc) + ' = ' + D + '$.', D > 0 ? 'Positive: two real solutions.' : D === 0 ? 'Zero: one real (double) solution.' : 'Negative: its square root is imaginary, so there are two complex conjugate solutions.'],
        hint: 'Look at the sign of $b^2 - 4ac$.' };
    }
    if (kind === 'pure') { var k = R.int(2, 10); a = R.pick([1, 1, 2, 3]); polyc = P([a * k * k, 0, a]);
      return { q: 'Solve $' + ptex(polyc) + ' = 0$.', a: { t: 'set', v: [k + 'i', '-' + k + 'i'] },
        steps: [(a === 1 ? '' : 'Divide by ' + a + ': $x^{2} + ' + (k * k) + ' = 0$. ') + 'Subtract: $x^{2} = -' + (k * k) + '$.', 'Take square roots: $x = \\pm\\sqrt{-' + (k * k) + '} = \\pm ' + k + 'i$.'],
        hint: 'Isolate $x^2$, then take the square root of a negative number.', chk: { zero: pplain(polyc), n: 2 } };
    }
    if (kind === 'surd') { p = R.int(-4, 4); var m = R.pick([2, 3, 5, 6, 7]); polyc = P([p * p + m, -2 * p, 1]);
      var re = p === 0 ? '' : String(p);
      roots = [re + (re ? '+' : '') + 'sqrt(' + m + ')*i', re + '-sqrt(' + m + ')*i'];
      var D2 = 4 * p * p - 4 * (p * p + m);
      return { q: 'Solve $' + ptex(polyc) + ' = 0$.', a: { t: 'set', v: roots },
        steps: ['Use the quadratic formula with $a = 1$, $b = ' + (-2 * p) + '$, $c = ' + (p * p + m) + '$.', 'Discriminant: $' + T.p(-2 * p) + '^{2} - 4(' + (p * p + m) + ') = ' + D2 + '$. Negative, so the solutions are complex.', '$\\sqrt{' + D2 + '} = \\sqrt{' + (-D2) + '}\\,i = ' + T.sqrt(-D2) + 'i$.', '$x = \\frac{' + (2 * p) + ' \\pm ' + T.sqrt(-D2) + 'i}{2} = ' + (p === 0 ? '' : p + ' ') + '\\pm \\sqrt{' + m + '}\\,i$.'],
        hint: 'Find $b^2 - 4ac$; its square root will be imaginary.', chk: { zero: pplain(polyc), n: 2 } };
    }
    if (kind === 'half') { // x^2 + bx + c with b odd: roots (-b ± i sqrt(4c - b^2))/2
      var bh = R.pick([-5, -3, -1, 1, 3, 5]), ch = Math.floor(bh * bh / 4) + R.int(1, 4), Dn = 4 * ch - bh * bh, sr = U.simplifyRadical(Dn);
      polyc = P([ch, bh, 1]);
      var reQ = Q(-bh, 2), imS = sr[1] === 1 ? Q(sr[0], 2).toPlain() : '(' + sr[0] + '*sqrt(' + sr[1] + ')/2)';
      roots = [reQ.toPlain() + '+' + imS + '*i', reQ.toPlain() + '-' + imS + '*i'];
      var imT = sr[1] === 1 ? qt(Q(sr[0], 2)) : '\\frac{' + (sr[0] === 1 ? '' : sr[0]) + '\\sqrt{' + sr[1] + '}}{2}';
      return { q: 'Solve $' + ptex(polyc) + ' = 0$.', a: { t: 'set', v: roots },
        steps: ['Quadratic formula with $a = 1$, $b = ' + bh + '$, $c = ' + ch + '$: discriminant $' + T.p(bh) + '^{2} - 4(' + ch + ') = ' + (-Dn) + '$.', '$\\sqrt{' + (-Dn) + '} = ' + T.sqrt(Dn) + 'i$.', '$x = \\frac{' + (-bh) + ' \\pm ' + T.sqrt(Dn) + 'i}{2} = ' + qt(reQ) + ' \\pm ' + imT + 'i$.'],
        hint: 'Use the quadratic formula; the discriminant is negative.', chk: { zero: pplain(polyc), n: 2 } };
    }
    p = R.int(-5, 5); qv = R.int(1, 5); a = kind === 'scaled' ? R.pick([2, 3, -1, -2]) : 1;
    polyc = P([a * (p * p + qv * qv), -2 * a * p, a]);
    roots = [cplain(C(p, qv)), cplain(C(p, -qv))];
    var bq = -2 * a * p, cq = a * (p * p + qv * qv), Dd = bq * bq - 4 * a * cq;
    return { q: 'Solve $' + ptex(polyc) + ' = 0$.', a: { t: 'set', v: roots },
      steps: ['Quadratic formula: $a = ' + a + '$, $b = ' + bq + '$, $c = ' + cq + '$.', 'Discriminant: $' + T.p(bq) + '^{2} - 4 \\cdot ' + T.p(a) + ' \\cdot ' + T.p(cq) + ' = ' + Dd + '$, which is negative.', '$\\sqrt{' + Dd + '} = ' + Math.sqrt(-Dd) + 'i$.', '$x = \\frac{' + (-bq) + ' \\pm ' + Math.sqrt(-Dd) + 'i}{' + (2 * a) + '} = ' + (p === 0 ? '' : p + ' ') + '\\pm ' + (qv === 1 ? '' : qv) + 'i$.'],
      hint: 'Use the quadratic formula. A negative discriminant gives $\\pm$ an imaginary part.', chk: { zero: pplain(polyc), n: 2 } };
  });

  // --- inequalities
  function ineqAns(lo, hi, rel, up) { // solution of a(x-lo)(x-hi) rel 0 with lo < hi; up: a > 0
    var outside = (rel[0] === '>') === up, eq = rel.length > 1, lt = eq ? '<=' : '<', gt = eq ? '>=' : '>';
    lo = qp(lo); hi = qp(hi);
    return outside ? 'x ' + lt + ' ' + lo + ' or x ' + gt + ' ' + hi : lo + ' ' + lt + ' x ' + lt + ' ' + hi;
  }
  function relTex(r) { return { '>': '>', '<': '<', '>=': '\\ge', '<=': '\\le' }[r]; }
  G('alg2.quadratic-inequalities', function (R, ctx) {
    var kind = R.pick(L(ctx, ['factored', 'square', 'factored'], ['expanded', 'square', 'factored'], ['expanded', 'neg', 'expanded', 'square']));
    var rel = R.pick(['>', '<', '>=', '<=']), st = [];
    if (kind === 'square') {
      var k = R.int(2, 9), n = k * k, ans = ineqAns(-k, k, rel, true);
      return { q: 'Solve $x^{2} ' + relTex(rel) + ' ' + n + '$.', a: { t: 'ineq', v: ans },
        steps: ['Move everything to one side and factor: $x^{2} - ' + n + ' = (x + ' + k + ')(x - ' + k + ') ' + relTex(rel) + ' 0$.', 'The zeros $-' + k + '$ and $' + k + '$ split the line into three parts. The parabola $y = x^{2} - ' + n + '$ opens up, so it is below the axis between the zeros and above it outside.',
          rel[0] === '>' ? 'We want ' + (rel === '>' ? 'positive' : 'positive or zero') + ' values: outside the zeros.' : 'We want ' + (rel === '<' ? 'negative' : 'negative or zero') + ' values: between the zeros.', 'Answer: $' + ML.plainToTex(ans) + '$. (Writing $x ' + relTex(rel) + ' \\pm ' + k + '$ would hide that the two halves point in opposite directions.)'],
        hint: 'Don\'t take a square root of both sides. Find the zeros of $x^2 - ' + n + '$ and test each region.', chk: { ineq: 'x^2-' + n, rel: rel, pts: [-k, k] } };
    }
    var r = R.int(-7, 5), s = R.int(r + 1, r + 8), a = kind === 'neg' ? R.pick([-1, -2]) : L(ctx, 1, R.pick([1, 1, 2]), R.pick([1, 2, 3])), up = a > 0;
    var poly = pfromRoots([r, s], a), lhs = kind === 'factored' ? T.coef(a, facs([r, s])) : ptex(poly), ans2 = ineqAns(r, s, rel, up);
    if (kind !== 'factored') st.push('Factor: $' + ptex(poly) + ' = ' + T.coef(a, facs([r, s])) + '$. The zeros are $' + r + '$ and $' + s + '$.');
    else st.push('The zeros are $x = ' + r + '$ and $x = ' + s + '$.');
    var mid = (r + s) / 2, midv = a * (mid - r) * (mid - s);
    st.push('Test a point in each region. Between the zeros, e.g. $x = ' + U.fix(mid) + '$: the value is ' + (midv > 0 ? 'positive' : 'negative') + '. Outside, e.g. $x = ' + (s + 1) + '$: ' + (midv > 0 ? 'negative' : 'positive') + '.');
    st.push('The parabola opens ' + (up ? 'up' : 'down') + ', which agrees: it is ' + (up ? 'below' : 'above') + ' the axis between its zeros.');
    st.push('We want ' + (rel[0] === '>' ? 'positive' : 'negative') + (rel.length > 1 ? ' or zero (so include the zeros)' : ' (zeros excluded)') + ': $' + ML.plainToTex(ans2) + '$.');
    return { q: 'Solve $' + lhs + ' ' + relTex(rel) + ' 0$.', a: { t: 'ineq', v: ans2 }, steps: st,
      hint: 'Find the zeros, then decide whether you want the part of the parabola above or below the $x$-axis.', chk: { ineq: pplain(poly), rel: rel, pts: [r, s] } };
  });

  // --- three variables
  function eqTex3(c, d) { return T.terms([[c[0], 'x'], [c[1], 'y'], [c[2], 'z']]) + ' = ' + d; }
  G('alg2.three-variable-systems', function (R, ctx) {
    var sol = [R.int(-4, 5), R.int(-4, 5), R.int(-4, 5)], A, tries = 0;
    var lo = L(ctx, -2, -3, -4), hi = L(ctx, 2, 3, 4);
    do {
      A = [[1, R.int(lo, hi), R.int(lo, hi)], [R.nz(lo, hi), R.int(lo, hi), R.int(lo, hi)], [R.nz(lo, hi), R.int(lo, hi), R.int(lo, hi)]];
      if (lvl(ctx) === 1) A[2][R.int(1, 2)] = 0;
      A = R.shuffle(A); tries++;
    } while ((Number(U.M.det(A).toString ? U.M.det(A).num() : U.M.det(A)) === 0 || A.some(function (r) { return r.filter(function (v) { return v; }).length < 2; })) && tries < 60);
    var d = A.map(function (r) { return r[0] * sol[0] + r[1] * sol[1] + r[2] * sol[2]; });
    // elimination steps: eliminate x using the equation with the smallest |x coefficient|, then y
    var idx = [0, 1, 2].sort(function (i, j) { return Math.abs(A[i][0]) - Math.abs(A[j][0]) || i - j; }), pv = idx[0], others = idx.slice(1), st = [];
    function comb(r1, d1, r2, d2, v) { var g = U.gcd(Math.abs(r1[v]), Math.abs(r2[v])) || 1, k1 = r2[v] / g, k2 = -r1[v] / g; var r = [0, 1, 2].map(function (j) { return k1 * r1[j] + k2 * r2[j]; }), dd2 = k1 * d1 + k2 * d2; return { r: r, d: dd2, k1: k1, k2: k2 }; }
    var names = ['(1)', '(2)', '(3)'], red = [];
    others.forEach(function (o) {
      if (A[o][0] === 0) { red.push({ r: A[o].slice(), d: d[o], txt: 'Equation ' + names[o] + ' has no $x$ already: $' + T.terms([[A[o][1], 'y'], [A[o][2], 'z']]) + ' = ' + d[o] + '$.' }); return; }
      var c = comb(A[pv], d[pv], A[o], d[o], 0);
      red.push({ r: c.r, d: c.d, txt: 'Eliminate $x$ from ' + names[pv] + ' and ' + names[o] + ': multiply ' + names[pv] + ' by $' + c.k1 + '$ and ' + names[o] + ' by $' + c.k2 + '$, then add: $' + T.terms([[c.r[1], 'y'], [c.r[2], 'z']]) + ' = ' + c.d + '$.' });
    });
    red.forEach(function (x) { st.push(x.txt); });
    var e1 = red[0], e2 = red[1], yv, zv;
    if (e1.r[1] === 0 || e2.r[1] === 0) {
      var only = e1.r[1] === 0 ? e1 : e2; zv = only.d / only.r[2];
      st.push('One of these has only $z$: $z = ' + zv + '$.');
    } else {
      var c2 = comb(e1.r, e1.d, e2.r, e2.d, 1); zv = c2.d / c2.r[2];
      st.push('Now eliminate $y$ from those two: multiply by $' + c2.k1 + '$ and $' + c2.k2 + '$ and add: $' + T.mono(c2.r[2], 'z') + ' = ' + c2.d + '$, so $z = ' + zv + '$.');
    }
    var useE = e1.r[1] !== 0 ? e1 : e2; yv = (useE.d - useE.r[2] * zv) / useE.r[1];
    st.push('Substitute $z = ' + zv + '$ into $' + T.terms([[useE.r[1], 'y'], [useE.r[2], 'z']]) + ' = ' + useE.d + '$: $y = ' + yv + '$.');
    var xv = (d[pv] - A[pv][1] * yv - A[pv][2] * zv) / A[pv][0];
    st.push('Substitute $y$ and $z$ into ' + names[pv] + ': $x = ' + xv + '$.');
    st.push('Check in all three equations: the solution is $(' + xv + ', ' + yv + ', ' + zv + ')$.');
    return { q: 'Solve the system.' + dd('\\begin{aligned} ' + A.map(function (r, i) { return eqTex3(r, d[i]) + ' & \\quad ' + names[i]; }).join(' \\\\ ') + ' \\end{aligned}'),
      a: { t: 'tuple', v: [String(sol[0]), String(sol[1]), String(sol[2])] }, steps: st,
      hint: 'Use one equation to eliminate the same variable from the other two. That leaves two equations in two unknowns.', chk: { sys: { A: A, d: d }, same: [xv, yv, zv] } };
  });

  // --- nonlinear systems
  var CIRC = (function () { var out = {}; [25, 5, 10, 13, 2].forEach(function (r2) { var pts = []; for (var x = -5; x <= 5; x++) for (var y = -5; y <= 5; y++) if (x * x + y * y === r2) pts.push([x, y]); out[r2] = pts; }); return out; })();
  var CPAR = (function () { var out = []; [25, 100, 169].forEach(function (R2) { for (var k = -20; k <= 20; k++) { var dsc = 1 + 4 * (k + R2), sq = Math.round(Math.sqrt(dsc)); if (sq * sq !== dsc || (sq - 1) % 2) continue; var ys = [(-1 + sq) / 2, (-1 - sq) / 2], sols = []; ys.forEach(function (y) { var x2 = y - k; if (x2 < 0) return; var xr = Math.round(Math.sqrt(x2)); if (xr * xr !== x2) { sols = null; return; } if (sols) { if (xr === 0) sols.push([0, y]); else { sols.push([-xr, y]); sols.push([xr, y]); } } }); if (sols && sols.length >= 2) out.push({ R2: R2, k: k, sols: sols, ys: ys }); } }); return out; })();
  G('alg2.nonlinear-systems', function (R, ctx) {
    var kind = R.pick(L(ctx, ['lp', 'lp', 'lc'], ['lc', 'lp', 'pp'], ['cp', 'cp', 'lc', 'pp']));
    function multi2(p1, p2, st, qq, hint, chk) { var pts = [p1, p2].sort(function (u, v) { return q(u[0]).cmp(q(v[0])); }); return { q: qq, a: { t: 'multi', parts: [{ label: 'Solution with the smaller $x$:', a: { t: 'tuple', v: [qp(pts[0][0]), qp(pts[0][1])] } }, { label: 'Solution with the larger $x$:', a: { t: 'tuple', v: [qp(pts[1][0]), qp(pts[1][1])] } }] }, steps: st, hint: hint, chk: chk }; }
    if (kind === 'lp' || kind === 'pp') {
      var r = R.int(-5, 3), s = R.intNot(r + 1, r + 6, []), m = R.int(-3, 3), n = R.int(-6, 6), a = kind === 'pp' ? R.pick([1, 2]) : 1;
      // parabola y = a x^2 + bx + c; other curve y = m x + n (+ d x^2 for pp)
      var dco = kind === 'pp' ? R.pick([-1, -2]) : 0, lead = a - dco;
      var diff = pfromRoots([r, s], lead), b = diff[1].toNumber() + m, c = diff[0].toNumber() + n;
      var par = P([c, b, a]), oth = P([n, m, dco]);
      var f1 = ptex(par), f2 = ptex(oth), p1 = [r, peval(oth, r)], p2 = [s, peval(oth, s)];
      return multi2(p1, p2, ['Both expressions equal $y$, so set them equal: $' + f1 + ' = ' + f2 + '$.', 'Move everything to one side: $' + ptex(diff) + ' = 0$.', 'Factor: $' + T.coef(lead, facs([r, s])) + ' = 0$, so $x = ' + r + '$ or $x = ' + s + '$.', 'Find each $y$ from the simpler equation $y = ' + f2 + '$: $(' + r + ', ' + qt(p1[1]) + ')$ and $(' + s + ', ' + qt(p2[1]) + ')$.'],
        'Solve the system: $y = ' + f1 + '$ and $y = ' + f2 + '$.', 'Set the two expressions for $y$ equal to each other.', { curves: ['y-(' + pplain(par) + ')', 'y-(' + pplain(oth) + ')'] });
    }
    if (kind === 'lc') {
      var r2 = R.pick([25, 25, 10, 13, 5]), pts = CIRC[r2], A, B, tries = 0;
      var maxD = lvl(ctx) >= 3 ? 2 : 1;
      do { var two = R.sample(pts, 2); A = two[0]; B = two[1]; tries++; } while ((A[0] === B[0] || Q(B[1] - A[1], B[0] - A[0]).den() > maxD || Q(B[1] - A[1], B[0] - A[0]).abs().gt(3)) && tries < 80);
      if (A[0] === B[0] || Q(B[1] - A[1], B[0] - A[0]).den() > maxD) { r2 = 25; A = [3, 4]; B = [5, 0]; }
      var mq = Q(B[1] - A[1], B[0] - A[0]), nq = q(A[1]).sub(mq.mul(A[0]));
      var line = T.lin(mq, 'x', nq), quad = pnorm(P([nq.mul(nq).sub(r2), mq.mul(nq).mul(2), mq.mul(mq).add(1)]));
      return multi2(A, B, ['Substitute $y = ' + line + '$ into the circle: $x^{2} + \\left(' + line + '\\right)^{2} = ' + r2 + '$.', 'Expand, collect like terms and divide out any common factor: $' + ptex(quad) + ' = 0$.', 'Solve (factor or use the formula): $x = ' + A[0] + '$ or $x = ' + B[0] + '$.', 'Use the line to find $y$: $(' + A[0] + ', ' + A[1] + ')$ and $(' + B[0] + ', ' + B[1] + ')$. Both check in $x^{2} + y^{2} = ' + r2 + '$.'],
        'Solve the system: $x^{2} + y^{2} = ' + r2 + '$ and $y = ' + line + '$.', 'Substitute the line into the circle to get one equation in $x$.', { curves: ['x^2+y^2-' + r2, 'y-(' + mq.toPlain() + ')*x-(' + nq.toPlain() + ')'] });
    }
    // circle and parabola: x^2 + y^2 = R^2, y = x^2 + k
    var cs = R.pick(CPAR), sols = cs.sols, xs = uniq(sols.map(function (p) { return String(p[0]); })), ask = R.pick(['n', 'x']);
    var stc = ['Solve the parabola for $x^{2}$: $x^{2} = y' + T.signed(-cs.k) + '$. Substitute into the circle: $y' + T.signed(-cs.k) + ' + y^{2} = ' + cs.R2 + '$.', 'So $y^{2} + y' + T.signed(-cs.k - cs.R2) + ' = 0$, which factors as $(y' + T.signed(-cs.ys[0]) + ')(y' + T.signed(-cs.ys[1]) + ') = 0$: $y = ' + cs.ys[0] + '$ or $y = ' + cs.ys[1] + '$.'];
    cs.ys.forEach(function (y) { var x2 = y - cs.k; stc.push('$y = ' + y + '$: $x^{2} = ' + x2 + '$, ' + (x2 < 0 ? 'no real $x$.' : x2 === 0 ? 'so $x = 0$ (one point).' : 'so $x = \\pm ' + Math.round(Math.sqrt(x2)) + '$ (two points; keep both signs).')); });
    stc.push('Solutions: $' + sols.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '$.');
    if (ask === 'n') return { q: 'How many real solutions does the system $x^{2} + y^{2} = ' + cs.R2 + '$, $y = x^{2}' + T.signed(cs.k) + '$ have?', a: { t: 'num', v: String(sols.length) }, steps: stc,
      hint: 'Substitute $x^2 = y' + T.signed(-cs.k) + '$ into the circle, and remember each positive $x^2$ gives two values of $x$.', chk: { cp: cs } };
    return { q: 'Solve the system $x^{2} + y^{2} = ' + cs.R2 + '$, $y = x^{2}' + T.signed(cs.k) + '$. Enter all the $x$-values of the solutions.', a: { t: 'set', v: xs }, steps: stc,
      hint: 'Substitute $x^2 = y' + T.signed(-cs.k) + '$ into the circle to get an equation in $y$ alone.', chk: { cp: cs } };
  });

// ---- 03-polynomials.js

  // =================================================================== Unit 3: polynomial functions
  G('alg2.seeing-structure', function (R, ctx) {
    var kind = R.pick(L(ctx, ['x4', 'shift', 'num'], ['x4', 'shift', 'chunk', 'num'], ['chunk', 'x4full', 'shift', 'chunk']));
    if (kind === 'num') {
      var c = R.pick([20, 30, 40, 50, 60, 70, 80, 100]), d = R.int(1, 4), useSq = R.coin();
      if (useSq) { var A = c + d, B = c - d; return { q: 'Use structure (not a calculator) to find $' + A + '^{2} - ' + B + '^{2}$.', a: { t: 'num', v: String(A * A - B * B) },
        steps: ['This is a difference of squares, $a^{2} - b^{2} = (a - b)(a + b)$, with $a = ' + A + '$ and $b = ' + B + '$.', '$(' + A + ' - ' + B + ')(' + A + ' + ' + B + ') = ' + (A - B) + ' \\cdot ' + (A + B) + ' = ' + (A * A - B * B) + '$.'], hint: 'Treat it as $a^2 - b^2$ and factor.' }; }
      return { q: 'Use structure (not a calculator) to find $' + (c + d) + ' \\times ' + (c - d) + '$.', a: { t: 'num', v: String((c + d) * (c - d)) },
        steps: ['Both numbers are ' + d + ' away from ' + c + ': $(' + c + ' + ' + d + ')(' + c + ' - ' + d + ')$.', 'That is a difference of squares: $' + c + '^{2} - ' + d + '^{2} = ' + (c * c) + ' - ' + (d * d) + ' = ' + ((c + d) * (c - d)) + '$.'], hint: 'Write each number as ' + c + ' plus or minus something.' };
    }
    if (kind === 'x4' || kind === 'x4full') {
      var full = kind === 'x4full', k = full ? R.int(2, 6) : R.pick([2, 3, 5, 6, 7, 10, 11]), sq = k * k, kk = full ? k * k : k;
      // x^4 - kk^2 = (x^2 - kk)(x^2 + kk); if kk is a perfect square, (x^2 - kk) splits again
      var n = kk * kk, ans, st = ['See $x^{4}$ as $(x^{2})^{2}$ and $' + n + '$ as $' + kk + '^{2}$: this is a difference of squares with $u = x^{2}$.', '$u^{2} - ' + kk + '^{2} = (u - ' + kk + ')(u + ' + kk + ')$, so $x^{4} - ' + n + ' = (x^{2} - ' + kk + ')(x^{2} + ' + kk + ')$.'];
      if (full) { ans = '(x-' + k + ')(x+' + k + ')(x^2+' + sq + ')'; st.push('$x^{2} - ' + sq + '$ is again a difference of squares: $(x - ' + k + ')(x + ' + k + ')$. The sum $x^{2} + ' + sq + '$ does not factor over the real numbers.'); st.push('Completely factored: $(x - ' + k + ')(x + ' + k + ')(x^{2} + ' + sq + ')$.'); }
      else { ans = '(x^2-' + kk + ')(x^2+' + kk + ')'; st.push('$' + kk + '$ is not a perfect square, so $x^{2} - ' + kk + '$ does not factor over the integers. Done.'); }
      return { q: 'Factor completely over the integers: $x^{4} - ' + n + '$.', a: { t: 'expr', v: ans, vars: ['x'], form: 'factored' }, steps: st,
        hint: 'Think of $x^4$ as $(x^2)^2$.', chk: { eqv: 'x^4-' + n } };
    }
    if (kind === 'shift') {
      var p = R.nz(-6, 6), qn = R.int(1, 7), a1 = p - qn, a2 = p + qn;
      var exprT = '(' + lfTex(-p) + ')^{2} - ' + (qn * qn), ansP = '(' + lfPlain(-a1) + ')(' + lfPlain(-a2) + ')';
      return { q: 'Factor $' + exprT + '$ without expanding it first.', a: { t: 'expr', v: ansP, vars: ['x'], form: 'factored' },
        steps: ['Let $u = ' + lfTex(-p) + '$. The expression is $u^{2} - ' + qn + '^{2} = (u - ' + qn + ')(u + ' + qn + ')$.', 'Put $u$ back: $(' + lfTex(-p) + ' - ' + qn + ')(' + lfTex(-p) + ' + ' + qn + ')$.', 'Simplify each factor: $(' + lfTex(-a1) + ')(' + lfTex(-a2) + ')$.'],
        hint: 'Treat $(' + lfTex(-p) + ')$ as one quantity $u$.', chk: { eqv: '(' + lfPlain(-p) + ')^2-' + (qn * qn) } };
    }
    // chunk: (x + p)^2 + b(x + p) + c with c = mn, b = m + n
    var p2 = R.nz(-5, 5), m = R.nz(-6, 6), nn = R.intNot(-6, 6, [0, -m]), b = m + nn, cc = m * nn, u = lfTex(-p2);
    var f1 = -(p2 + m), f2 = -(p2 + nn);
    return { q: 'Factor $(' + u + ')^{2}' + T.coef(b, '(' + u + ')', false) + T.signed(cc) + '$.', a: { t: 'expr', v: '(' + lfPlain(f1) + ')(' + lfPlain(f2) + ')', vars: ['x'], form: 'factored' },
      steps: ['Let $u = ' + u + '$. Then the expression is $u^{2}' + T.coef(b, 'u', false) + T.signed(cc) + '$.', 'Factor as a quadratic in $u$: two numbers that multiply to $' + cc + '$ and add to $' + b + '$ are $' + m + '$ and $' + nn + '$, so $(u' + T.signed(m) + ')(u' + T.signed(nn) + ')$.', 'Put $u$ back and simplify: $(' + u + T.signed(m) + ')(' + u + T.signed(nn) + ') = (' + lfTex(f1) + ')(' + lfTex(f2) + ')$.'],
      hint: 'Replace $(' + u + ')$ with a single letter, factor, then put it back.', chk: { eqv: '(' + lfPlain(-p2) + ')^2+(' + b + ')*(' + lfPlain(-p2) + ')+(' + cc + ')' } };
  });

  var EB = ['Falls left, rises right', 'Rises left, rises right', 'Rises left, falls right', 'Falls left, falls right'];
  function ebIndex(deg, lead) { var even = deg % 2 === 0; return even ? (lead > 0 ? 1 : 3) : (lead > 0 ? 0 : 2); }
  G('alg2.end-behavior', function (R, ctx) {
    var kind = R.pick(L(ctx, ['mc', 'lead', 'mc'], ['mc', 'mcf', 'lead'], ['mcf', 'mc', 'mcf']));
    if (kind === 'mcf') { // factored form
      var rs = R.sample([-4, -3, -2, -1, 1, 2, 3, 4], R.int(2, 3)), ms = rs.map(function () { return R.pick([1, 1, 2, 3]); }), a = R.pick([-3, -2, -1, 1, 2, 3]);
      var deg = ms.reduce(function (s, x) { return s + x; }, 0), ft = T.coef(a, rs.map(function (r, i) { return powTex('(' + lfTex(r) + ')', ms[i]); }).join(''));
      var iv = ebIndex(deg, a);
      return { q: 'Describe the end behavior of $f(x) = ' + ft + '$.', a: { t: 'mc', choices: EB.slice(), v: iv, keep: true },
        steps: ['If you multiplied this out, the leading term would come from the $x$ in each factor: $' + T.coef(a, 'x^{' + deg + '}') + '$ (degree ' + rs.map(function (r, i) { return ms[i]; }).join(' + ') + ' = ' + deg + ').', 'Degree ' + deg + ' is ' + (deg % 2 ? 'odd, so the ends go opposite ways' : 'even, so both ends go the same way') + '; the leading coefficient is ' + (a > 0 ? 'positive' : 'negative') + '.', 'So: ' + EB[iv].toLowerCase() + '.'],
        hint: 'Find the degree by adding the exponents on the factors, and the sign of the leading coefficient.' };
    }
    var deg2 = R.int(2, 6), lead = R.nz(-6, 6), coeffs = []; for (var i = 0; i <= deg2; i++) coeffs.push(Q(i === deg2 ? lead : R.chance(0.6) ? R.int(-9, 9) : 0));
    var terms = pterms(coeffs).reverse(); // low to high: the leading term is written last
    if (R.coin()) terms = R.shuffle(terms); if (terms[0][1] === 'x^{' + deg2 + '}' && terms.length > 1) terms.push(terms.shift());
    var ft2 = T.terms(terms), leadT = T.coef(lead, deg2 === 1 ? 'x' : 'x^{' + deg2 + '}');
    if (kind === 'lead') return { q: 'What is the leading term of $f(x) = ' + ft2 + '$?', a: { t: 'expr', v: lead + '*x^' + deg2, vars: ['x'] },
      steps: ['The leading term is the term of highest degree, wherever it is written.', 'The highest power is $x^{' + deg2 + '}$, with coefficient $' + lead + '$: the leading term is $' + leadT + '$.'], hint: 'Look for the largest exponent, not the first term.' };
    var iv2 = ebIndex(deg2, lead);
    return { q: 'Describe the end behavior of $f(x) = ' + ft2 + '$.', a: { t: 'mc', choices: EB.slice(), v: iv2, keep: true },
      steps: ['Find the term with the highest power: $' + leadT + '$. For very large $|x|$ it outweighs all the others.', 'Degree ' + deg2 + ' is ' + (deg2 % 2 ? 'odd: the ends point opposite ways.' : 'even: both ends point the same way.') + ' Leading coefficient ' + lead + ' is ' + (lead > 0 ? 'positive.' : 'negative.'), 'So as $x \\to \\infty$, $f(x) \\to ' + (lead > 0 ? '\\infty' : '-\\infty') + '$, and as $x \\to -\\infty$, $f(x) \\to ' + ((deg2 % 2 ? -1 : 1) * lead > 0 ? '\\infty' : '-\\infty') + '$: ' + EB[iv2].toLowerCase() + '.'],
      hint: 'Only the leading term matters at the ends. Is its degree even or odd, and is its coefficient positive or negative?' };
  });

  G('alg2.zeros-multiplicity', function (R, ctx) {
    var n = L(ctx, 2, 3, R.pick([3, 4])), rs = R.sample([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], n), ms = rs.map(function () { return R.pick([1, 2, 2, 3]); });
    if (!ms.some(function (m) { return m % 2 === 0; })) ms[0] = 2;
    if (!ms.some(function (m) { return m % 2 === 1; })) ms[n - 1] = R.pick([1, 3]);
    var a = R.pick([1, -1, 2, -2, 3]), ft = T.coef(a, rs.map(function (r, i) { return powTex(r === 0 ? 'x' : '(' + lfTex(r) + ')', ms[i]); }).join(''));
    var kind = R.pick(L(ctx, ['touch', 'mult', 'behav'], ['touch', 'mult', 'behav', 'zeros'], ['touch', 'behav', 'touch']));
    var even = rs.filter(function (r, i) { return ms[i] % 2 === 0; });
    var exp = rs.map(function (r, i) { return '$x = ' + r + '$ has multiplicity ' + ms[i] + ' (' + (ms[i] % 2 ? 'odd: crosses' : 'even: touches and turns back') + ')'; }).join('; ');
    if (kind === 'touch') return { q: 'At which zeros does the graph of $f(x) = ' + ft + '$ touch the $x$-axis without crossing it?', a: { t: 'set', v: even.map(String) },
      steps: ['Read each zero and its multiplicity from the exponents: ' + exp + '.', 'A factor with an even power never changes sign, so the graph stays on one side there.', 'Touch points: $x = ' + even.join('$ and $x = ') + '$.'], hint: 'Look at the exponent on each factor: even or odd?' };
    var j = R.int(0, n - 1);
    if (kind === 'mult') return { q: 'What is the multiplicity of the zero $x = ' + rs[j] + '$ of $f(x) = ' + ft + '$?', a: { t: 'num', v: String(ms[j]) },
      steps: ['The zero $x = ' + rs[j] + '$ comes from the factor $' + powTex(rs[j] === 0 ? 'x' : '(' + lfTex(rs[j]) + ')', ms[j]) + '$.', 'Its exponent, ' + ms[j] + ', is the multiplicity.'], hint: 'Find the factor that is 0 at $x = ' + rs[j] + '$.' };
    if (kind === 'zeros') return { q: 'List all the zeros of $f(x) = ' + ft + '$.', a: { t: 'set', v: rs.map(String) },
      steps: ['Each factor gives one zero, no matter its power: ' + exp + '.', 'Zeros: $' + rs.slice().sort(function (x, y) { return x - y; }).join(', ') + '$.'], hint: 'Set each factor equal to 0.' };
    var CH = ['It crosses the axis (like a line)', 'It touches the axis and turns back', 'It crosses the axis and flattens out there (like $x^3$)'];
    var v = ms[j] === 1 ? 0 : ms[j] % 2 === 0 ? 1 : 2;
    return { q: 'How does the graph of $f(x) = ' + ft + '$ behave at $x = ' + rs[j] + '$?', a: { t: 'mc', choices: CH, v: v, keep: true },
      steps: ['The factor for $x = ' + rs[j] + '$ has exponent ' + ms[j] + '.', ms[j] === 1 ? 'Multiplicity 1: the graph crosses like a line.' : ms[j] % 2 === 0 ? 'Even multiplicity: the factor is never negative, so the graph bounces off the axis.' : 'Odd multiplicity above 1: the sign changes, but the graph flattens as it crosses, like $x^{3}$ at 0.'],
      hint: 'Odd or even exponent? And is it 1?' };
  });

  // --- division
  function divSteps(num, den) { // long division record: [{ c: Q, k: degree, prod: poly, rem: poly }]
    var r = ptrim(num).slice(), out = [], db = pdeg(den), lc = den[db];
    while (pdeg(r) >= db && !(r.length === 1 && r[0].isZero())) {
      var k = pdeg(r) - db, c = r[r.length - 1].div(lc), t = []; for (var i = 0; i < k; i++) t.push(Q(0)); t.push(c);
      var prod = pmul(t, den); r = psub(r, prod); out.push({ c: c, k: k, prod: prod, rem: r });
      if (out.length > 8) break;
    }
    return out;
  }
  function monoTex(c, k) { return T.mono(c, k === 0 ? '' : k === 1 ? 'x' : 'x^{' + k + '}'); }
  function fullTex(a) { // every power written, 0 coefficients included (for "write 0x^2")
    a = ptrim(a); var s = ''; for (var k = a.length - 1; k >= 0; k--) { var body = k === 0 ? '' : k === 1 ? 'x' : 'x^{' + k + '}'; if (a[k].isZero()) s += (s ? ' + ' : '') + '0' + body; else s += T.coef(a[k], body, s === ''); } return s;
  }
  G('alg2.polynomial-long-division', function (R, ctx) {
    var lv = lvl(ctx), kind = R.pick(L(ctx, ['lin'], ['lin', 'gap', 'lin2'], ['quad', 'gap', 'lin2']));
    var den = kind === 'quad' ? P([R.nz(-3, 3), R.pick([0, 0, 1, -1]), 1]) : kind === 'lin2' ? P([R.nz(-3, 3), 2]) : P([-R.nz(-5, 5), 1]);
    var qdeg = kind === 'quad' ? R.int(1, 2) : R.int(1, 2) + (lv > 1 ? 1 : 0), quo = []; for (var i = 0; i <= qdeg; i++) quo.push(Q(i === qdeg ? R.pick([1, 2, 3, -1, -2]) : R.int(-5, 5)));
    var rem = kind === 'quad' ? P([R.int(-6, 6), R.int(-4, 4)]) : P([R.int(-9, 9)]);
    if (kind === 'lin2') { quo = quo.map(function (c, j) { return j === qdeg ? c : c; }); }
    var num = padd(pmul(quo, den), rem);
    if (kind === 'gap' && pdeg(num) >= 3) { // force a missing power: zero the x^1 or x^2 coefficient of the dividend, recompute quotient/remainder
      var kz = R.int(1, pdeg(num) - 1); num[kz] = Q(0); var dv = pdiv(num, den); quo = dv.q; rem = dv.r;
    }
    var hasGap = ptrim(num).some(function (c, j) { return j < pdeg(num) && c.isZero(); });
    var stp = divSteps(num, den), st = [];
    if (hasGap) st.push('Write the dividend with a 0 for each missing power so the columns line up: $' + fullTex(num) + '$.');
    stp.forEach(function (s, j) {
      st.push((j === 0 ? 'Divide the leading terms: ' : 'Bring down and divide again: ') + '$\\frac{' + monoTex(ptrim(j ? stp[j - 1].rem : num)[pdeg(j ? stp[j - 1].rem : num)], pdeg(j ? stp[j - 1].rem : num)) + '}{' + monoTex(den[pdeg(den)], pdeg(den)) + '} = ' + monoTex(s.c, s.k) + '$. Multiply: $' + monoTex(s.c, s.k) + '(' + ptex(den) + ') = ' + ptex(s.prod) + '$. Subtract: $' + ptex(s.rem) + '$.');
    });
    var dq = pdiv(num, den); quo = dq.q; rem = dq.r;
    st.push('The degree of $' + ptex(rem) + '$ is less than the divisor\'s, so stop. Quotient $' + ptex(quo) + '$, remainder $' + ptex(rem) + '$.');
    var remSpec = pdeg(den) > 1 ? { t: 'expr', v: pplain(rem), vars: ['x'] } : { t: 'num', v: rem[0].toPlain() };
    return { q: 'Divide and give the quotient and the remainder:' + dd('\\dfrac{' + ptex(num) + '}{' + ptex(den) + '}'),
      a: { t: 'multi', parts: [{ label: 'Quotient:', a: { t: 'expr', v: pplain(quo), vars: ['x'] } }, { label: 'Remainder:', a: remSpec }] },
      steps: st, hint: hasGap ? 'Write a 0 term for each missing power before you start.' : 'Divide the leading term of what is left by the leading term of the divisor, every time.',
      nolint: hasGap ? ['+ 0'] : [], chk: { div: { num: pplain(num), den: pplain(den) } } };
  });

  function synthText(cs, r) { // cs high -> low (Q)
    var sums = [cs[0]], prods = [null], st = [];
    for (var i = 1; i < cs.length; i++) { prods.push(sums[i - 1].mul(r)); sums.push(cs[i].add(prods[i])); }
    st.push('Bring down the first coefficient: $' + qt(sums[0]) + '$.');
    for (var j = 1; j < cs.length; j++) st.push('Multiply $' + qt(r) + ' \\cdot ' + T.p(qt(sums[j - 1])) + ' = ' + qt(prods[j]) + '$; add to $' + qt(cs[j]) + '$: $' + qt(sums[j]) + '$.');
    return { sums: sums, st: st };
  }
  G('alg2.synthetic-division', function (R, ctx) {
    var lv = lvl(ctx), r = R.nz(-5, 5), deg = L(ctx, 2, 3, R.pick([3, 4])), quo = [];
    for (var i = 0; i < deg; i++) quo.push(Q(i === deg - 1 ? R.pick([1, 2, 3, -1, -2]) : R.int(-6, 6)));
    var rem = Q(R.int(-9, 9)), num = padd(pmul(quo, P([-r, 1])), [rem]);
    if (lv >= 2 && R.coin()) { var kz = R.int(1, deg - 1); num[kz] = Q(0); var dv = pdiv(num, P([-r, 1])); quo = dv.q; rem = dv.r[0]; }
    var cs = ptrim(num).slice().reverse(), sy = synthText(cs, q(r)), gap = cs.some(function (c) { return c.isZero(); });
    var st = ['Divide by $x' + T.signed(-r) + '$: the number in the box is $' + r + '$ (it makes $x' + T.signed(-r) + '$ equal 0). Coefficients: $' + cs.map(qt).join(', ') + '$' + (gap ? ' (a 0 holds the place of each missing power)' : '') + '.'].concat(sy.st);
    st.push('The last number, $' + qt(rem) + '$, is the remainder. The others are the quotient\'s coefficients, one degree lower: $' + ptex(quo) + '$.');
    return { q: 'Use synthetic division to divide:' + dd('\\dfrac{' + ptex(num) + '}{x' + T.signed(-r) + '}'),
      a: { t: 'multi', parts: [{ label: 'Quotient:', a: { t: 'expr', v: pplain(quo), vars: ['x'] } }, { label: 'Remainder:', a: { t: 'num', v: rem.toPlain() } }] },
      steps: st, hint: 'Dividing by $x' + T.signed(-r) + '$ means you put $' + r + '$ in the box' + (r < 0 ? ' (the sign flips)' : '') + '.', chk: { div: { num: pplain(num), den: lfPlain(r) } } };
  });

  G('alg2.remainder-factor-theorems', function (R, ctx) {
    var kind = R.pick(L(ctx, ['rem', 'factor', 'rem'], ['rem', 'factor', 'k', 'which'], ['k', 'which', 'rem', 'k']));
    var deg = L(ctx, 3, 3, 4), r = R.nz(-4, 4), cs = [];
    for (var i = 0; i <= deg; i++) cs.push(Q(i === deg ? R.pick([1, 2, -1]) : R.int(-6, 6)));
    var val = peval(cs, r);
    if (kind === 'rem') return { q: 'Find the remainder when $p(x) = ' + ptex(cs) + '$ is divided by $x' + T.signed(-r) + '$.', a: { t: 'num', v: val.toPlain() },
      steps: ['By the remainder theorem, the remainder is $p(' + r + ')$. No division needed.', '$$p(' + r + ') = ' + T.terms(pterms(cs).map(function (t) { return [t[0], t[1].replace(/x/, T.p(r))]; })).replace(/(\d)(\()/g, '$1 \\cdot $2') + ' = ' + qt(val) + '$$'],
      hint: 'Evaluate $p(' + r + ')$.', chk: { val: ('(' + pplain(cs) + ')').replace(/x/g, '(' + r + ')') } };
    // build a polynomial with (x - r) as a factor (or not)
    var other = []; for (var j = 0; j < deg; j++) other.push(Q(j === deg - 1 ? 1 : R.int(-5, 5)));
    var isF = kind === 'factor' ? R.coin() : true, poly = pmul(other, P([-r, 1])); if (!isF) poly = padd(poly, [Q(R.nz(-5, 5))]);
    var pv = peval(poly, r);
    if (kind === 'factor') return { q: 'Is $x' + T.signed(-r) + '$ a factor of $p(x) = ' + ptex(poly) + '$?', a: { t: 'tf', v: pv.isZero() },
      steps: ['By the factor theorem, $x' + T.signed(-r) + '$ is a factor exactly when $p(' + r + ') = 0$.', '$p(' + r + ') = ' + qt(pv) + '$.', pv.isZero() ? 'It is 0, so yes: $x' + T.signed(-r) + '$ is a factor.' : 'It is not 0, so no. (The remainder would be $' + qt(pv) + '$.)'],
      hint: 'Evaluate $p(' + r + ')$.' };
    if (kind === 'k') { // p(x) = poly with one coefficient replaced by k
      var kpos = R.int(0, deg - 1), kval = poly[kpos];
      var partial = poly.slice(); partial[kpos] = Q(0);
      var terms = []; for (var t = deg; t >= 0; t--) { var body = t === 0 ? '' : t === 1 ? 'x' : 'x^{' + t + '}'; if (t === kpos) terms.push(['k', body]); else if (!poly[t].isZero()) terms.push([poly[t], body]); }
      var pt = T.terms(terms.map(function (tt) { return tt[0] === 'k' ? ['k', tt[1]] : tt; }));
      var rest = peval(partial, r), coefK = Math.pow(r, kpos);
      return { q: 'Find $k$ so that $x' + T.signed(-r) + '$ is a factor of $p(x) = ' + pt + '$.', a: { t: 'num', v: kval.toPlain() },
        steps: ['$x' + T.signed(-r) + '$ is a factor exactly when $p(' + r + ') = 0$.', 'Substitute $x = ' + r + '$: the terms without $k$ add to $' + qt(rest) + '$, and the $k$ term is $' + (kpos === 0 ? 'k' : T.coef(coefK, 'k')) + '$.', 'Solve $' + (kpos === 0 ? 'k' : T.coef(coefK, 'k')) + T.signed(rest) + ' = 0$: $k = ' + qt(kval) + '$.'],
        hint: 'Set $p(' + r + ') = 0$ and solve for $k$.', chk: { val: kval.toPlain() } };
    }
    // which: p(r) = 0 -> which factor
    return { q: 'For a polynomial $p$, $p(' + r + ') = 0$. Which must be a factor of $p(x)$?', a: mc('$x' + T.signed(-r) + '$', ['$x' + T.signed(r) + '$', '$x - ' + Math.abs(r) * 2 + '$', '$' + T.mono(r, 'x') + '$']),
      steps: ['The factor theorem: $p(a) = 0$ means $x - a$ is a factor.', 'Here $a = ' + r + '$, so the factor is $x - ' + T.p(r) + ' = x' + T.signed(-r) + '$.'], hint: 'Which factor equals 0 when $x = ' + r + '$?' };
  });

  G('alg2.sum-difference-cubes', function (R, ctx) {
    var kind = R.pick(L(ctx, ['basic', 'basic', 'mid'], ['basic', 'coef', 'mid'], ['gcf', 'coef', 'two', 'gcf']));
    var a = kind === 'basic' || kind === 'mid' && lvl(ctx) === 1 ? 1 : R.pick([2, 3, 4, 5]), b = R.int(1, 6); while (U.gcd(a, b) > 1) b++;
    var sum = R.coin(), sg = sum ? '+' : '-', s2 = sum ? -1 : 1, g = kind === 'gcf' ? R.pick([2, 3, 5]) : 1, two = kind === 'two', y = two ? 'y' : '';
    var A = a * a * a, B = b * b * b;
    var ax = T.mono(a, 'x'), by = two ? T.mono(b, 'y') : String(b);
    var binT = ax + (sum ? ' + ' : ' - ') + by, binP = mterm(a, 'x') + sg + (two ? mterm(b, 'y') : b);
    var triT = T.terms([[a * a, 'x^{2}'], [s2 * a * b, two ? 'xy' : 'x'], [b * b, two ? 'y^{2}' : '']]);
    var triP = mterm(a * a, 'x^2') + (s2 < 0 ? '-' : '+') + mterm(a * b, two ? 'x*y' : 'x') + '+' + (two ? mterm(b * b, 'y^2') : b * b);
    var qx = T.terms([[A * g, 'x^{3}'], [(sum ? 1 : -1) * B * g, two ? 'y^{3}' : '']]), plainQ = (A * g) + '*x^3' + sg + (B * g) + (two ? '*y^3' : '');
    var cubeB = two ? (B === 1 ? '' : B) + 'y^{3}' : String(B);
    if (kind === 'mid') {
      return { q: 'Complete the factoring: $' + qx + ' = (' + binT + ')(\\ ?\\ )$. What is the second factor?', a: { t: 'expr', v: triP, vars: ['x'] },
        steps: ['$' + qx + ' = ' + (a === 1 ? 'x' : '(' + ax + ')') + '^{3} ' + sg + ' ' + b + '^{3}$, a ' + (sum ? 'sum' : 'difference') + ' of cubes with $a = ' + ax + '$ and $b = ' + b + '$.', 'Use $a^{3} ' + sg + ' b^{3} = (a ' + sg + ' b)(a^{2} ' + (sum ? '-' : '+') + ' ab + b^{2})$. The middle sign is the opposite of the binomial\'s sign.', 'Second factor: $' + triT + '$.'],
        hint: 'Square the first term, use the opposite sign for the product of the terms, then square the last term.', chk: { eqv: '(' + plainQ + ')/(' + binP + ')' } };
    }
    var ans = (g === 1 ? '' : g + '*') + '(' + binP + ')(' + triP + ')', st = [];
    if (g > 1) st.push('Take out the common factor ' + g + ' first: $' + g + '(' + T.terms([[A, 'x^{3}'], [(sum ? 1 : -1) * B, two ? 'y^{3}' : '']]) + ')$.');
    st.push('Recognize cubes: ' + (a === 1 ? '$x^{3}$ is already a cube' : '$' + T.mono(A, 'x^{3}') + ' = (' + ax + ')^{3}$') + ' and $' + cubeB + ' = ' + (by.length > 1 ? '(' + by + ')' : by) + '^{3}$.');
    st.push('Use $a^{3} ' + sg + ' b^{3} = (a ' + sg + ' b)(a^{2} ' + (sum ? '-' : '+') + ' ab + b^{2})$ with $a = ' + ax + '$ and $b = ' + by + '$.');
    st.push('Result: $' + (g === 1 ? '' : g) + '(' + binT + ')(' + triT + ')$. The trinomial does not factor further.');
    return { q: 'Factor completely: $' + qx + '$.', a: { t: 'expr', v: ans, vars: two ? ['x', 'y'] : ['x'], form: 'factored' }, steps: st,
      hint: 'Write each term as a cube, then use the pattern. Watch the middle sign.', chk: { eqv: plainQ } };
  });

  G('alg2.quadratic-form-factoring', function (R, ctx) {
    var kind = R.pick(L(ctx, ['both', 'one'], ['both', 'one', 'none'], ['cube', 'both', 'one', 'lead']));
    var u1, u2, ans, st = [];
    if (kind === 'cube') {
      var p = R.int(1, 3), qq = R.intNot(1, 3, [p]), s1 = R.sign(), s2 = R.sign(); // (x^3 - s1 p^3)(x^3 - s2 q^3)
      var c1 = s1 * p * p * p, c2 = s2 * qq * qq * qq, poly = pmul(P([-c1, 0, 0, 1]), P([-c2, 0, 0, 1]));
      function cubeF(c) { var r = Math.round(Math.cbrt(c)); return { bin: 'x' + (r > 0 ? '-' + r : '+' + (-r)), tri: 'x^2' + (r > 0 ? '+' + r : '-' + (-r)) + '*x+' + (r * r), binT: 'x' + T.signed(-r), triT: 'x^{2}' + T.coef(r, 'x', false) + ' + ' + (r * r) }; }
      var f1 = cubeF(c1), f2 = cubeF(c2);
      ans = '(' + f1.bin + ')(' + f1.tri + ')(' + f2.bin + ')(' + f2.tri + ')';
      return { q: 'Factor completely over the integers: $' + ptex(poly) + '$.', a: { t: 'expr', v: ans, vars: ['x'], form: 'factored' },
        steps: ['Let $u = x^{3}$: $u^{2}' + T.coef(-(c1 + c2), 'u', false) + T.signed(c1 * c2) + ' = (u' + T.signed(-c1) + ')(u' + T.signed(-c2) + ')$.', 'So the polynomial is $(x^{3}' + T.signed(-c1) + ')(x^{3}' + T.signed(-c2) + ')$.', 'Each is a sum or difference of cubes: $(' + f1.binT + ')(' + f1.triT + ')$ and $(' + f2.binT + ')(' + f2.triT + ')$.'],
        hint: 'Treat $x^6$ as $(x^3)^2$; then factor each cube.', chk: { eqv: pplain(poly) } };
    }
    if (kind === 'lead') { // (2x^2 - m)(x^2 - n) style with no further integer factoring
      var m = R.pick([1, 3, 5, 7]), nn = R.pick([2, 3, 5, 6, 7]), polyL = pmul(P([-m, 0, 2]), P([-nn, 0, 1]));
      ans = '(2*x^2-' + m + ')(x^2-' + nn + ')';
      return { q: 'Factor completely over the integers: $' + ptex(polyL) + '$.', a: { t: 'expr', v: ans, vars: ['x'], form: 'factored' },
        steps: ['Let $u = x^{2}$: $2u^{2}' + T.coef(-(m + 2 * nn), 'u', false) + T.signed(m * nn) + '$.', 'Factor the quadratic in $u$ (split the middle term using $ac = ' + (2 * m * nn) + '$): $(2u - ' + m + ')(u - ' + nn + ')$.', 'Put $x^{2}$ back: $(2x^{2} - ' + m + ')(x^{2} - ' + nn + ')$. Neither $' + m + '/2$ nor $' + nn + '$ is a perfect square, so this is complete over the integers.'],
        hint: 'Substitute $u = x^2$ and factor $2u^2 + bu + c$.', chk: { eqv: pplain(polyL) } };
    }
    if (kind === 'both') { var s = R.sample([1, 4, 9, 16, 25], 2); u1 = s[0]; u2 = s[1]; }
    else if (kind === 'one') { u1 = R.pick([1, 4, 9, 16]); u2 = -R.pick([1, 2, 3, 4, 5, 9]); }
    else { u1 = R.pick([2, 3, 5, 6, 7]); u2 = R.pick([-1, -2, -3, -4, 10, 11]); if (u2 === u1) u2 = -5; }
    var polyQ = pmul(P([-u1, 0, 1]), P([-u2, 0, 1]));
    function part(u) { if (u > 0 && U.isSquare(u)) { var k = Math.round(Math.sqrt(u)); return { p: '(x-' + k + ')(x+' + k + ')', t: '(x - ' + k + ')(x + ' + k + ')', note: '$x^{2} - ' + u + '$ is a difference of squares' }; } return { p: '(x^2' + (u > 0 ? '-' + u : '+' + (-u)) + ')', t: '(x^{2}' + T.signed(-u) + ')', note: '$x^{2}' + T.signed(-u) + '$ does not factor over the integers' }; }
    var A1 = part(u1), A2 = part(u2); ans = A1.p + A2.p;
    st.push('Let $u = x^{2}$. Then $' + ptex(polyQ) + ' = u^{2}' + T.coef(-(u1 + u2), 'u', false) + T.signed(u1 * u2) + '$.');
    st.push('Two numbers that multiply to $' + (u1 * u2) + '$ and add to $' + (-(u1 + u2)) + '$: $' + (-u1) + '$ and $' + (-u2) + '$. So $(u' + T.signed(-u1) + ')(u' + T.signed(-u2) + ')$.');
    st.push('Put $x^{2}$ back: $(x^{2}' + T.signed(-u1) + ')(x^{2}' + T.signed(-u2) + ')$.');
    st.push(A1.note + '; ' + A2.note + '. Result: $' + A1.t + A2.t + '$.');
    return { q: 'Factor completely over the integers: $' + ptex(polyQ) + '$.', a: { t: 'expr', v: ans, vars: ['x'], form: 'factored' }, steps: st,
      hint: 'Substitute $u = x^2$, factor the quadratic in $u$, then check each factor for a difference of squares.', chk: { eqv: pplain(polyQ) } };
  });

  // --- rational root theorem
  function divisors(n) { n = Math.abs(n); var d = []; for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
  G('alg2.rational-root-theorem', function (R, ctx) {
    var kind = R.pick(L(ctx, ['notpos', 'find'], ['notpos', 'find', 'find'], ['find', 'findirr', 'notpos']));
    var a = R.pick([2, 3]), b = R.pick([1, 2, 5, 7]); if (U.gcd(a, b) > 1) b = 1; b *= R.sign();
    if (kind === 'notpos') {
      var lead = R.pick([2, 3, 4, 6]), cst = R.pick([3, 5, 6, 10, 15, 9]) * R.sign(), mid = [R.int(-7, 7), R.int(-7, 7)], poly = P([cst, mid[0], mid[1], lead]);
      var ps = divisors(cst), qs = divisors(lead), cands = [];
      ps.forEach(function (p) { qs.forEach(function (qv) { var f = Q(p, qv); if (!cands.some(function (c) { return c.eq(f); })) cands.push(f); }); });
      var wrongs = [], tries = 0;
      while (wrongs.length < 1 && tries < 50) { tries++; var qv2 = R.pick(ps), p2 = R.pick(qs); var f2 = Q(p2, qv2); if (!cands.some(function (c) { return c.eq(f2); })) wrongs.push(f2); }
      if (!wrongs.length) { var p3 = R.pick([7, 11, 13]); wrongs.push(Q(p3, qs[qs.length - 1])); }
      var pool = cands.filter(function (c) { return !c.isInt() || R.coin(); }); if (pool.length < 3) pool = cands;
      var right = R.sample(pool, Math.min(3, pool.length));
      var bad = wrongs[0];
      return { q: 'Which number is <b>not</b> a possible rational zero of $p(x) = ' + ptex(poly) + '$?',
        a: { t: 'mc', choices: ['$' + qt(bad) + '$'].concat(right.map(function (c) { return '$' + qt(c) + '$'; })), v: 0 },
        steps: ['Possible rational zeros are $\\pm\\frac{p}{q}$ with $p$ a factor of the constant $' + cst + '$ and $q$ a factor of the leading coefficient $' + lead + '$.', 'Factors of ' + Math.abs(cst) + ': $' + ps.join(', ') + '$. Factors of ' + lead + ': $' + qs.join(', ') + '$.', '$' + qt(bad) + '$ is not on the list: ' + (lead % bad.den() !== 0 ? 'its denominator ' + bad.den() + ' is not a factor of the leading coefficient ' + lead : 'its numerator ' + Math.abs(bad.num()) + ' is not a factor of the constant ' + Math.abs(cst)) + '. (Swapping $p$ and $q$ is the usual way to get such a number.)'],
        hint: 'Numerators come from the constant term, denominators from the leading coefficient.' };
    }
    var r1 = Q(b, a), others, poly2, sols, st2 = [];
    if (kind === 'find') { var r2 = R.nz(-4, 4), r3 = R.intNot(-4, 4, [0, r2]); others = [r2, r3]; poly2 = pmul(P([-b, a]), pfromRoots([r2, r3])); sols = [r1.toPlain(), String(r2), String(r3)]; }
    else { var m = R.pick([2, 3, 5, 7]); poly2 = pmul(P([-b, a]), P([-m, 0, 1])); sols = [r1.toPlain()]; others = null; }
    var lc = poly2[poly2.length - 1].num(), c0 = poly2[0].num();
    st2.push('Candidates are $\\pm\\frac{p}{q}$: $p$ divides $' + c0 + '$ and $q$ divides $' + lc + '$.');
    var test = others ? R.pick(others) : null;
    if (test !== null) {
      st2.push('Test integers first: $p(' + test + ') = 0$, so $x' + T.signed(-test) + '$ is a factor.');
      var dq = pdiv(poly2, P([-test, 1])).q;
      st2.push('Divide (synthetic division): $p(x) = (x' + T.signed(-test) + ')(' + ptex(dq) + ')$.');
      st2.push('Factor the quadratic: $' + ptex(dq) + ' = (' + lfTex(r1) + ')(' + lfTex(others[0] === test ? others[1] : others[0]) + ')$.');
      st2.push('Rational zeros: $' + [qt(r1), String(others[0]), String(others[1])].join(', ') + '$.');
    } else {
      st2.push('Testing candidates, $p\\left(' + qt(r1) + '\\right) = 0$.');
      var dq2 = pdiv(poly2, P([-b, a])).q;
      st2.push('So $' + lfTex(r1) + '$ is a factor. Divide: $p(x) = (' + lfTex(r1) + ')(' + ptex(dq2) + ')$.');
      st2.push('The other factor gives $x^{2} = ' + (-dq2[0].num()) + '$, so $x = \\pm\\sqrt{' + (-dq2[0].num()) + '}$, which are irrational. The only rational zero is $' + qt(r1) + '$.');
    }
    return { q: 'Find all <b>rational</b> zeros of $p(x) = ' + ptex(poly2) + '$.', a: { t: 'set', v: sols }, steps: st2,
      hint: 'List $\\pm\\frac{p}{q}$ candidates and test them with synthetic division.', chk: { zero: pplain(poly2) } };
  });

  G('alg2.solve-polynomial-equations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['gcf', 'group', 'qform'], ['gcf', 'group', 'qform', 'gcf2'], ['cube', 'qform', 'group', 'cubic']));
    var poly, sols, st = [], complex = kind === 'cube' || kind === 'cubic';
    if (kind === 'gcf' || kind === 'gcf2') {
      var k = R.int(1, 7), a = R.pick([1, 2, 3]); var two = kind === 'gcf2';
      if (two) { var r2 = R.nz(-5, 5), r3 = R.intNot(-5, 5, [0, r2]); poly = pmul(P([0, a]), pfromRoots([r2, r3])); sols = ['0', String(r2), String(r3)];
        st = ['Every term has a factor of $' + T.mono(a, 'x') + '$. Factor it out: $' + T.mono(a, 'x') + '(' + ptex(pfromRoots([r2, r3])) + ') = 0$.', 'Factor the quadratic: $' + T.mono(a, 'x') + facs([r2, r3]) + ' = 0$.', 'Zero product property: $x = 0$, $x = ' + r2 + '$ or $x = ' + r3 + '$.']; }
      else { poly = P([0, -a * k * k, 0, a]); sols = ['0', String(k), String(-k)];
        st = ['Move everything to one side (it already is) and factor out the GCF $' + T.mono(a, 'x') + '$: $' + T.mono(a, 'x') + '(x^{2} - ' + (k * k) + ') = 0$.', 'Difference of squares: $' + T.mono(a, 'x') + '(x - ' + k + ')(x + ' + k + ') = 0$.', 'So $x = 0$, $x = ' + k + '$ or $x = ' + (-k) + '$. (Dividing both sides by $x$ would have lost $x = 0$.)']; }
      var lhs = R.coin() && !two ? T.mono(a, 'x^{3}') + ' = ' + T.mono(a * k * k, 'x') : ptex(poly) + ' = 0';
      return { q: 'Solve $' + lhs + '$.', a: { t: 'set', v: sols }, steps: st, hint: 'Don\'t divide by $x$. Move everything to one side and factor out the common factor.', chk: { zero: pplain(poly), n: 3 } };
    }
    if (kind === 'group') { var c = R.nz(-5, 5), b = R.int(1, 5); if (b === Math.abs(c)) b = b === 5 ? 4 : b + 1; poly = pmul(P([c, 1]), P([-b * b, 0, 1])); sols = [String(-c), String(b), String(-b)];
      st = ['Group in pairs: $(' + ptex(P([0, 0, poly[2], 1])) + ') + (' + ptex(P([poly[0], poly[1]])) + ')$.', 'Factor each pair: $x^{2}(x' + T.signed(c) + ')' + T.signed(-b * b) + '(x' + T.signed(c) + ')$.', 'Common factor: $(x' + T.signed(c) + ')(x^{2} - ' + (b * b) + ') = (x' + T.signed(c) + ')(x - ' + b + ')(x + ' + b + ')$.', 'Solutions: $x = ' + (-c) + '$, $' + b + '$, $' + (-b) + '$.'];
      return { q: 'Solve $' + ptex(poly) + ' = 0$.', a: { t: 'set', v: sols }, steps: st, hint: 'Try factoring by grouping: the first two terms and the last two terms.', chk: { zero: pplain(poly), n: 3 } };
    }
    if (kind === 'qform') { var ss = R.sample([1, 2, 3, 4, 5], 2), u1 = ss[0] * ss[0], u2 = ss[1] * ss[1]; poly = pmul(P([-u1, 0, 1]), P([-u2, 0, 1])); sols = [ss[0], -ss[0], ss[1], -ss[1]].map(String);
      st = ['Let $u = x^{2}$: $u^{2}' + T.coef(-(u1 + u2), 'u', false) + ' + ' + (u1 * u2) + ' = (u - ' + u1 + ')(u - ' + u2 + ') = 0$.', 'So $x^{2} = ' + u1 + '$ or $x^{2} = ' + u2 + '$.', 'Each gives two solutions: $x = \\pm ' + ss[0] + '$ and $x = \\pm ' + ss[1] + '$.'];
      return { q: 'Solve $' + ptex(poly) + ' = 0$.', a: { t: 'set', v: sols }, steps: st, hint: 'It is a quadratic in $x^2$.', chk: { zero: pplain(poly), n: 4 } };
    }
    if (kind === 'cube') { var cb = R.int(1, 4), sgn = R.sign(), r = sgn * cb; // x^3 - r^3 = 0 -> r, r(-1 ± i√3)/2
      poly = P([-r * r * r, 0, 0, 1]); var re = Q(-r, 2), imc = Q(Math.abs(r), 2);
      var im = imc.eq(1) ? 'sqrt(3)' : imc.toPlain() + '*sqrt(3)';
      sols = [String(r), re.toPlain() + '+' + im + '*i', re.toPlain() + '-' + im + '*i'];
      var imT = imc.eq(1) ? '\\sqrt{3}' : (imc.isInt() ? imc.num() + '\\sqrt{3}' : '\\frac{' + (imc.num() === 1 ? '' : imc.num()) + '\\sqrt{3}}{' + imc.den() + '}');
      st = ['$x^{3}' + T.signed(-r * r * r) + '$ is a ' + (r > 0 ? 'difference' : 'sum') + ' of cubes: $(x' + T.signed(-r) + ')(x^{2}' + T.coef(r, 'x', false) + ' + ' + (r * r) + ') = 0$.', 'The first factor gives $x = ' + r + '$.', 'The quadratic has discriminant $' + (r * r) + ' - ' + (4 * r * r) + ' = ' + (-3 * r * r) + '$, so $x = \\frac{' + (-r) + ' \\pm ' + T.sqrt(3 * r * r) + 'i}{2} = ' + qt(re) + ' \\pm ' + imT + 'i$.'];
      return { q: 'Find all solutions, including complex ones: $' + ptex(poly) + ' = 0$.', a: { t: 'set', v: sols }, steps: st, hint: 'Factor as a sum or difference of cubes, then use the quadratic formula on the second factor.', chk: { zero: pplain(poly), n: 3 } };
    }
    // cubic with one integer root and a complex pair
    var rr = R.nz(-4, 4), p = R.int(-3, 3), qq = R.int(1, 3); poly = pmul(P([-rr, 1]), P([p * p + qq * qq, -2 * p, 1]));
    sols = [String(rr), cplain(C(p, qq)), cplain(C(p, -qq))];
    st = ['Try integer factors of the constant $' + poly[0].toPlain() + '$: $p(' + rr + ') = 0$, so $x' + T.signed(-rr) + '$ is a factor.', 'Synthetic division: $' + ptex(poly) + ' = (x' + T.signed(-rr) + ')(' + ptex(P([p * p + qq * qq, -2 * p, 1])) + ')$.', 'The quadratic formula on the second factor: discriminant $' + (4 * p * p - 4 * (p * p + qq * qq)) + '$, so $x = ' + (p === 0 ? '' : p + ' ') + '\\pm ' + (qq === 1 ? '' : qq) + 'i$.', 'All solutions: $' + rr + '$, $' + ctex(C(p, qq)) + '$, $' + ctex(C(p, -qq)) + '$.'];
    return { q: 'Find all solutions, including complex ones: $' + ptex(poly) + ' = 0$.', a: { t: 'set', v: sols }, steps: st, hint: 'Find one rational root by testing factors of the constant, divide it out, then solve the quadratic.', chk: { zero: pplain(poly), n: 3 } };
  });

  G('alg2.fundamental-theorem-algebra', function (R, ctx) {
    var kind = R.pick(L(ctx, ['conj', 'count', 'conj'], ['conj', 'all', 'realcount'], ['all', 'all', 'realcount', 'conj']));
    if (kind === 'count') { var n = R.int(3, 9); return { q: 'How many complex zeros, counted with multiplicity, does a polynomial of degree ' + n + ' have?', a: { t: 'num', v: String(n) },
      steps: ['The fundamental theorem of algebra says a degree-$n$ polynomial has exactly $n$ complex zeros when each is counted as many times as its multiplicity.', 'So degree ' + n + ' gives ' + n + '.'], hint: 'It matches the degree.' }; }
    if (kind === 'conj') { var a = R.int(-6, 6), b = R.nz(-6, 6); return { q: 'A polynomial with real coefficients has $' + ctex(C(a, b)) + '$ as a zero. Name another zero it must have.', a: { t: 'num', v: cplain(C(a, -b)) },
      steps: ['Complex zeros of a polynomial with real coefficients come in conjugate pairs.', 'The conjugate of $' + ctex(C(a, b)) + '$ is $' + ctex(C(a, -b)) + '$.'], hint: 'Change the sign of the imaginary part.' }; }
    if (kind === 'realcount') { var d = R.pick([3, 4, 5, 6]), cz = R.int(1, Math.floor(d / 2)) * 2;
      var possible = []; for (var k = d % 2; k <= d; k += 2) possible.push(k);
      var wrong = d % 2 ? [0, 2, 4] : [1, 3, 5], w = R.pick(wrong.filter(function (x) { return x <= d; }));
      return { q: 'A polynomial of degree ' + d + ' has real coefficients. Which number of real zeros (counted with multiplicity) is <b>impossible</b>?', a: mc('$' + w + '$', possible.slice(0, 3).map(function (x) { return '$' + x + '$'; })),
        steps: ['The total number of zeros, counted with multiplicity, is ' + d + '.', 'Non-real zeros come in conjugate pairs, so there is an even number of them.', 'So the number of real zeros is ' + d + ' minus an even number: ' + possible.join(', ') + '. ' + (d % 2 ? 'An odd-degree polynomial always has at least one real zero.' : '') + ' $' + w + '$ is impossible.'],
        hint: 'Non-real zeros come in pairs.', chk: { unused: cz } }; }
    // all zeros given one complex zero
    var r = R.nz(-4, 4), p = R.int(-3, 3), qv = R.int(1, 3), poly = pmul(P([-r, 1]), P([p * p + qv * qv, -2 * p, 1]));
    return { q: 'The number $' + ctex(C(p, qv)) + '$ is a zero of $p(x) = ' + ptex(poly) + '$. Find all the zeros.', a: { t: 'set', v: [String(r), cplain(C(p, qv)), cplain(C(p, -qv))] },
      steps: ['Real coefficients, so the conjugate $' + ctex(C(p, -qv)) + '$ is also a zero.', 'Together they give the factor $(x - (' + ctex(C(p, qv)) + '))(x - (' + ctex(C(p, -qv)) + ')) = ' + ptex(P([p * p + qv * qv, -2 * p, 1])) + '$.', 'Divide: $p(x) = (' + ptex(P([p * p + qv * qv, -2 * p, 1])) + ')(x' + T.signed(-r) + ')$.', 'Degree 3 means three zeros: $' + r + '$, $' + ctex(C(p, qv)) + '$ and $' + ctex(C(p, -qv)) + '$.'],
      hint: 'Use the conjugate to build a quadratic factor, then divide.', chk: { zero: pplain(poly), n: 3 } };
  });

  G('alg2.polynomial-from-zeros', function (R, ctx) {
    var kind = R.pick(L(ctx, ['ints', 'ints', 'surd'], ['ints', 'surd', 'cplx'], ['cplx', 'point', 'surd', 'point']));
    var poly, desc, st = [], lead = 1;
    if (kind === 'ints' || kind === 'point') {
      var rs = R.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 3); if (kind === 'ints' && lvl(ctx) === 1) rs = rs.slice(0, R.pick([2, 3]));
      lead = kind === 'point' ? R.pick([2, -1, -2, 3]) : 1; poly = pfromRoots(rs, lead); desc = 'zeros $' + rs.join('$, $') + '$';
      st.push('Each zero $r$ gives a factor $(x - r)$: $' + facs(rs) + '$.');
      if (kind === 'point') { var x0 = R.intNot(-2, 3, rs), base = peval(pfromRoots(rs), x0), y0 = base.mul(lead);
        desc += ', passing through $(' + x0 + ', ' + qt(y0) + ')$'; st.push('Write $p(x) = a' + facs(rs) + '$ and substitute the point: $' + qt(y0) + ' = a \\cdot ' + T.p(qt(base)) + '$, so $a = ' + lead + '$.'); }
    } else if (kind === 'surd') {
      var m = R.pick([2, 3, 5, 7]), r = R.nz(-4, 4); poly = pmul(P([-m, 0, 1]), P([-r, 1])); desc = 'zeros $' + r + '$, $\\sqrt{' + m + '}$ and $-\\sqrt{' + m + '}$';
      st.push('The pair $\\pm\\sqrt{' + m + '}$ gives $(x - \\sqrt{' + m + '})(x + \\sqrt{' + m + '}) = x^{2} - ' + m + '$ (a difference of squares).'); st.push('Multiply by $(x' + T.signed(-r) + ')$.');
    } else {
      var a = R.int(-3, 3), b = R.int(1, 3), r2 = R.nz(-4, 4); poly = pmul(P([a * a + b * b, -2 * a, 1]), P([-r2, 1]));
      desc = 'real coefficients and zeros $' + r2 + '$ and $' + ctex(C(a, b)) + '$';
      st.push('Real coefficients force the conjugate $' + ctex(C(a, -b)) + '$ to be a zero too, so the polynomial has degree 3.');
      st.push('The conjugate pair gives $(x - ' + cpar(C(a, b)) + ')(x - ' + cpar(C(a, -b)) + ') = ' + (a === 0 ? 'x^{2} + ' + (b * b) : '(x' + T.signed(-a) + ')^{2} + ' + (b * b)) + ' = ' + ptex(P([a * a + b * b, -2 * a, 1])) + '$.');
      st.push('Multiply by $(x' + T.signed(-r2) + ')$.');
    }
    st.push('Expand: $p(x) = ' + ptex(poly) + '$.');
    var lowest = kind === 'cplx' ? 'with the lowest possible degree and leading coefficient 1' : kind === 'point' ? 'of degree 3' : 'with leading coefficient 1 and the lowest possible degree';
    return { q: 'Write the polynomial ' + lowest + ' that has ' + desc + '. Give it in standard form.', a: { t: 'expr', v: pplain(poly), vars: ['x'], form: 'expanded' }, steps: st,
      hint: kind === 'cplx' ? 'Don\'t forget the conjugate. Multiply the conjugate pair first: the $i$ terms cancel.' : 'Each zero $r$ gives a factor $(x - r)$.', chk: { zero: pplain(poly) } };
  });

  // --- sketching: a graph with no formula shown, plus questions about it
  function plotOpts(poly, rs) {
    var r0 = Math.min.apply(null, rs), r1 = Math.max.apply(null, rs), lo = r0 - 1.2, hi = r1 + 1.2, big = 0;
    var cf = poly.map(function (c) { return c.toNumber(); }), ev = function (x) { var s = 0; for (var j = cf.length - 1; j >= 0; j--) s = s * x + cf[j]; return s; };
    for (var i = 0; i <= 120; i++) { var x = r0 + (r1 - r0) * i / 120; big = Math.max(big, Math.abs(ev(x))); }
    var y0 = Math.abs(ev(0)); if (r0 <= 0 && r1 >= 0) big = Math.max(big, y0);
    var Y = Math.max(1, Math.round(big * 1.6 * 10) / 10);
    return { fns: [pplain(poly)], xmin: lo, xmax: hi, ymin: -Y, ymax: Y, label: 'The graph of a polynomial' };
  }
  G('alg2.sketch-polynomials', function (R, ctx) {
    var kind = R.pick(L(ctx, ['which', 'yint', 'sign'], ['which', 'which', 'sign', 'yint'], ['which', 'sign', 'which']));
    var n = L(ctx, 2, R.pick([2, 3]), 3), rs, gt = 0;
    do { rs = R.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4], n).sort(function (a, b) { return a - b; }); gt++; } while (gt < 40 && rs.some(function (r, i) { return i && r - rs[i - 1] < 2; }));
    var ms = rs.map(function () { return R.pick(L(ctx, [1, 1, 2], [1, 2, 3], [1, 2, 2, 3])); }), a = R.pick(L(ctx, [1, -1], [1, -1, 2, -2], ['1/2', -1, 2, '-1/2']));
    while (ms.reduce(function (t, m) { return t + m; }, 0) > 6) ms[ms.indexOf(Math.max.apply(null, ms))]--;
    a = q(a);
    function fT(rr, mm, aa) { return T.coef(aa, rr.map(function (r, i) { return powTex(r === 0 ? 'x' : '(' + lfTex(r) + ')', mm[i]); }).join('')); }
    function polyOf(rr, mm, aa) { var p = [q(aa)]; rr.forEach(function (r, i) { for (var k = 0; k < mm[i]; k++) p = pmul(p, P([-r, 1])); }); return p; }
    var poly = polyOf(rs, ms, a), deg = pdeg(poly);
    if (kind === 'which') {
      var j = R.int(0, n - 1), ms2 = ms.slice(); ms2[j] = ms[j] === 1 ? 2 : ms[j] === 2 ? 1 : 2;
      var rsNeg = rs.map(function (r) { return -r; });
      var wrongs = [fT(rs, ms2, a), fT(rs, ms, a.neg()), fT(rsNeg, ms, a)];
      if (rs.every(function (r) { return rsNeg.indexOf(r) >= 0; })) wrongs[2] = fT(rs, ms.map(function (m) { return m === 1 ? 3 : m; }), a.neg());
      var choices = uniq(['$y = ' + fT(rs, ms, a) + '$'].concat(wrongs.map(function (w) { return '$y = ' + w + '$'; })));
      return { q: 'Which equation could match this graph?', viz: { name: 'alg2-plot', opts: plotOpts(poly, rs) },
        a: { t: 'mc', choices: choices, v: 0 },
        steps: ['Zeros: the graph meets the $x$-axis at $' + rs.join(', ') + '$, so the factors involve ' + rs.map(function (r) { return '$' + (r === 0 ? 'x' : '(' + lfTex(r) + ')') + '$'; }).join(', ') + '.',
          'Behavior at each zero: ' + rs.map(function (r, i) { return '$x = ' + r + '$ ' + (ms[i] % 2 === 0 ? 'touches (even power)' : ms[i] === 1 ? 'crosses (power 1)' : 'crosses and flattens (power 3)'); }).join('; ') + '.',
          'Ends: degree ' + deg + ' with a ' + (a.sign() > 0 ? 'positive' : 'negative') + ' leading coefficient, so the right end goes ' + (a.sign() > 0 ? 'up' : 'down') + ' and the left end goes ' + ((deg % 2 ? -1 : 1) * a.sign() > 0 ? 'up' : 'down') + '.', 'Only $y = ' + fT(rs, ms, a) + '$ fits all three.'],
        hint: 'Check the zeros, then touch or cross at each one, then the end behavior.' };
    }
    if (kind === 'yint') { var y0 = peval(poly, 0); return { q: 'What is the $y$-intercept of $y = ' + fT(rs, ms, a) + '$?', a: { t: 'num', v: y0.toPlain() },
      steps: ['The $y$-intercept is the value at $x = 0$.', 'Substitute $0$ for $x$ in every factor: $' + (a.eq(1) ? '' : T.p(qt(a))) + rs.map(function (r, i) { return powTex(T.p(-r), ms[i]); }).join(' \\cdot ') + ' = ' + qt(y0) + '$.'], hint: 'Put $x = 0$ into each factor and multiply.' }; }
    // sign on an interval
    var gaps = [], lo = rs[0] - 1, pts = [lo].concat(rs).concat([rs[n - 1] + 1]);
    for (var g = 0; g < pts.length - 1; g++) gaps.push([pts[g], pts[g + 1]]);
    var gi = R.int(0, gaps.length - 1), mid = q(gaps[gi][0] + gaps[gi][1]).div(2), sv = peval(poly, mid).sign();
    var where = gi === 0 ? 'x < ' + rs[0] : gi === gaps.length - 1 ? 'x > ' + rs[n - 1] : rs[gi - 1] + ' < x < ' + rs[gi];
    return { q: 'Is $f(x) = ' + fT(rs, ms, a) + '$ positive or negative for $' + where + '$?', a: { t: 'mc', choices: ['Positive', 'Negative'], v: sv > 0 ? 0 : 1, keep: true },
      steps: ['Pick a test value in that interval, such as $x = ' + qt(mid) + '$.', 'Find the sign of each factor there and multiply the signs (an even power is always positive). The result is ' + (sv > 0 ? 'positive' : 'negative') + '.', 'So $f$ is ' + (sv > 0 ? 'positive (above the axis)' : 'negative (below the axis)') + ' for $' + where + '$.'],
      hint: 'Test one number from the interval.', chk: { sign: sv } };
  });

  G('alg2.polynomial-identities', function (R, ctx) {
    var kind = R.pick(L(ctx, ['triple', 'mental', 'missing'], ['triple', 'missing', 'tf', 'mental'], ['triple', 'tf', 'missing']));
    if (kind === 'triple') { var x = R.int(2, 9), y = R.int(1, x - 1), A = x * x - y * y, B = 2 * x * y, Cc = x * x + y * y, s = [A, B].sort(function (u, v) { return u - v; });
      return { q: 'The identity $(x^{2} + y^{2})^{2} = (x^{2} - y^{2})^{2} + (2xy)^{2}$ makes Pythagorean triples. Use $x = ' + x + '$ and $y = ' + y + '$. Give the triple $(a, b, c)$ with $a < b < c$.', a: { t: 'tuple', v: [String(s[0]), String(s[1]), String(Cc)] },
        steps: ['$x^{2} - y^{2} = ' + (x * x) + ' - ' + (y * y) + ' = ' + A + '$, $2xy = ' + B + '$, $x^{2} + y^{2} = ' + Cc + '$.', 'Check: $' + A + '^{2} + ' + B + '^{2} = ' + (A * A) + ' + ' + (B * B) + ' = ' + (Cc * Cc) + ' = ' + Cc + '^{2}$.', 'In order: $(' + s[0] + ', ' + s[1] + ', ' + Cc + ')$.'], hint: 'Compute $x^2 - y^2$, $2xy$ and $x^2 + y^2$.' }; }
    if (kind === 'mental') { var c = R.pick([10, 20, 30, 40, 50, 60, 70, 80, 100]), d = R.int(1, 5), sq = R.coin(); var N = c + d;
      return sq ? { q: 'Use $(a + b)^{2} = a^{2} + 2ab + b^{2}$ to find $' + N + '^{2}$ without a calculator.', a: { t: 'num', v: String(N * N) },
        steps: ['$' + N + ' = ' + c + ' + ' + d + '$.', '$' + N + '^{2} = ' + c + '^{2} + 2(' + c + ')(' + d + ') + ' + d + '^{2} = ' + (c * c) + ' + ' + (2 * c * d) + ' + ' + (d * d) + ' = ' + (N * N) + '$.'], hint: 'Split ' + N + ' into ' + c + ' + ' + d + '.' }
        : { q: 'Use $(a + b)(a - b) = a^{2} - b^{2}$ to find $' + (c + d) + ' \\times ' + (c - d) + '$ without a calculator.', a: { t: 'num', v: String((c + d) * (c - d)) },
          steps: ['$(' + c + ' + ' + d + ')(' + c + ' - ' + d + ') = ' + c + '^{2} - ' + d + '^{2}$.', '$= ' + (c * c) + ' - ' + (d * d) + ' = ' + ((c + d) * (c - d)) + '$.'], hint: 'Both numbers are the same distance from ' + c + '.' }; }
    if (kind === 'missing') { var M = R.pick([
        ['(a + b)^{3} = a^{3} + 3a^{2}b + \\square + b^{3}', '3*a*b^2', 'Expand $(a + b)^{2}(a + b) = (a^{2} + 2ab + b^{2})(a + b)$; the $ab^{2}$ terms are $ab^{2} + 2ab^{2} = 3ab^{2}$.'],
        ['(a - b)^{3} = a^{3} - 3a^{2}b + \\square - b^{3}', '3*a*b^2', 'Replace $b$ with $-b$ in $(a + b)^{3}$: $3a(-b)^{2} = 3ab^{2}$.'],
        ['a^{3} - b^{3} = (a - b)(a^{2} + \\square + b^{2})', 'a*b', 'Multiply out $(a - b)(a^{2} + ab + b^{2})$: the middle terms cancel, leaving $a^{3} - b^{3}$. The missing term is $ab$.'],
        ['a^{3} + b^{3} = (a + b)(a^{2} + \\square + b^{2})', '-a*b', 'For a sum of cubes the middle term is $-ab$: $(a + b)(a^{2} - ab + b^{2}) = a^{3} + b^{3}$.'],
        ['(a + b)^{2} - (a - b)^{2} = \\square', '4*a*b', '$(a^{2} + 2ab + b^{2}) - (a^{2} - 2ab + b^{2}) = 4ab$.'],
        ['(a + b)^{2} = a^{2} + \\square + b^{2}', '2*a*b', 'Multiply $(a + b)(a + b)$: the two middle products $ab + ba$ make $2ab$.'],
        ['a^{4} - b^{4} = (a - b)(a + b)(\\square)', 'a^2+b^2', '$a^{4} - b^{4} = (a^{2} - b^{2})(a^{2} + b^{2})$, and $a^{2} - b^{2} = (a - b)(a + b)$. The box is $a^{2} + b^{2}$.'],
        ['(a + b)^{2} - 4ab = (\\square)^{2}', 'a-b', '$a^{2} + 2ab + b^{2} - 4ab = a^{2} - 2ab + b^{2} = (a - b)^{2}$. (The box could also be $b - a$.)'],
        ['(a + b + 1)(a + b - 1) = (a + b)^{2} - \\square', '1', 'Treat $a + b$ as one quantity $u$: $(u + 1)(u - 1) = u^{2} - 1$.'],
        ['(a^{2} + b^{2})(c^{2} + d^{2}) = (ac - bd)^{2} + \\square', '(a*d+b*c)^2', 'Expanding both sides shows the missing square is $(ad + bc)^{2}$: the two terms with $abcd$ cancel.']
      ]);
      return { q: 'Fill in the box to make an identity (true for all values): $' + M[0] + '$', a: { t: 'expr', v: M[1], vars: M[1].indexOf('c') >= 0 ? ['a', 'b', 'c', 'd'] : ['a', 'b'] }, steps: [M[2]], hint: 'Expand the side you know and compare.' }; }
    var TF = [['(x + y)^{2} = x^{2} + y^{2}', false, 'Try $x = y = 1$: the left side is 4, the right side is 2. It is missing $2xy$.'],
      ['(x + 1)^{3} - (x - 1)^{3} = 6x^{2} + 2', true, 'Expand: $$(x^{3} + 3x^{2} + 3x + 1) - (x^{3} - 3x^{2} + 3x - 1) = 6x^{2} + 2.$$'],
      ['x^{2} - y^{2} = (x - y)^{2}', false, 'Try $x = 2, y = 1$: $3 \\ne 1$. The correct factoring is $(x - y)(x + y)$.'],
      ['(x - y)(x^{2} + xy + y^{2}) = x^{3} - y^{3}', true, 'Multiply out: $x^{3} + x^{2}y + xy^{2} - x^{2}y - xy^{2} - y^{3} = x^{3} - y^{3}$.'],
      ['(x^{2} + 1)^{2} - (x^{2} - 1)^{2} = 4x^{2}', true, 'Difference of squares: $(2x^{2})(2) = 4x^{2}$.'],
      ['(2x)^{3} = 2x^{3}', false, 'The cube applies to the 2 as well: $(2x)^{3} = 8x^{3}$.'],
      ['(x + y)^{3} = x^{3} + y^{3}', false, 'Try $x = y = 1$: $8 \\ne 2$.']];
    var t = R.pick(TF);
    return { q: 'True or false: $' + t[0] + '$ is an identity (true for every value of the variables).', a: { t: 'tf', v: t[1] }, steps: [t[2]], hint: 'Expand, or test with small numbers. One counterexample proves it false.' };
  });

  G('alg2.binomial-theorem', function (R, ctx) {
    var kind = R.pick(L(ctx, ['expand', 'pascal', 'coef'], ['coef', 'expand', 'coef'], ['coef', 'term', 'coef']));
    if (kind === 'pascal') { var n = R.int(4, 8), k = R.int(1, n - 1); return { q: 'Find $\\binom{' + n + '}{' + k + '}$, the entry in row ' + n + ' of Pascal\'s triangle (starting the count at 0).', a: { t: 'num', v: String(U.nCr(n, k)) },
      steps: ['$\\binom{' + n + '}{' + k + '} = \\frac{' + n + '!}{' + k + '!\\,' + (n - k) + '!}$.', '$= ' + U.nCr(n, k) + '$.'], hint: 'Use $\\frac{n!}{k!(n-k)!}$ or build the triangle.' }; }
    if (kind === 'expand') { var b = R.nz(-4, 4), n2 = L(ctx, 3, R.pick([3, 4]), 4), poly = ppow(P([b, 1]), n2);
      return { q: 'Expand $(x' + T.signed(b) + ')^{' + n2 + '}$.', a: { t: 'expr', v: pplain(poly), vars: ['x'], form: 'expanded' },
        steps: ['Row ' + n2 + ' of Pascal\'s triangle: $' + [0, 1, 2, 3, 4].slice(0, n2 + 1).map(function (k) { return U.nCr(n2, k); }).join(', ') + '$.', 'Terms: $\\binom{' + n2 + '}{k}x^{' + n2 + ' - k}(' + b + ')^{k}$ for $k = 0$ to $' + n2 + '$.', 'Result: $' + ptex(poly) + '$.'],
        hint: 'Use the coefficients from Pascal\'s triangle and powers of ' + b + '.', chk: { eqv: '(x+(' + b + '))^' + n2 } }; }
    var a, bb, nn, kk, coef, tries = 0;
    do { a = R.pick([2, 3, -2, -1, 1]); bb = R.nz(-3, 3); nn = R.int(4, 7); kk = R.int(1, nn - 1); coef = U.nCr(nn, kk) * Math.pow(a, kk) * Math.pow(bb, nn - kk); tries++; } while ((Math.abs(coef) > 1500 || (Math.abs(a) === 1 && Math.abs(bb) === 1 && lvl(ctx) > 1)) && tries < 40);
    var base = '(' + T.mono(a, 'x') + T.signed(bb) + ')';
    if (kind === 'term') return { q: 'Find the term containing $x^{' + kk + '}$ in the expansion of $' + base + '^{' + nn + '}$.', a: { t: 'expr', v: coef + '*x^' + kk, vars: ['x'] },
      steps: ['The term with $x^{' + kk + '}$ is $\\binom{' + nn + '}{' + kk + '}(' + T.mono(a, 'x') + ')^{' + kk + '}(' + bb + ')^{' + (nn - kk) + '}$.', '$= ' + U.nCr(nn, kk) + ' \\cdot (' + T.mono(Math.pow(a, kk), 'x^{' + kk + '}') + ') \\cdot ' + T.p(Math.pow(bb, nn - kk)) + ' = ' + T.mono(coef, 'x^{' + kk + '}') + '$.'],
      hint: 'Raise the whole term $' + T.mono(a, 'x') + '$ to the power, coefficient included.' };
    return { q: 'Find the coefficient of $x^{' + kk + '}$ in the expansion of $' + base + '^{' + nn + '}$.', a: { t: 'num', v: String(coef) },
      steps: ['The general term is $\\binom{' + nn + '}{j}(' + T.mono(a, 'x') + ')^{j}(' + bb + ')^{' + nn + ' - j}$. For $x^{' + kk + '}$ take $j = ' + kk + '$.', '$\\binom{' + nn + '}{' + kk + '} = ' + U.nCr(nn, kk) + '$, $(' + a + ')^{' + kk + '} = ' + Math.pow(a, kk) + '$, $(' + bb + ')^{' + (nn - kk) + '} = ' + Math.pow(bb, nn - kk) + '$.', 'Multiply: $' + U.nCr(nn, kk) + ' \\cdot ' + T.p(Math.pow(a, kk)) + ' \\cdot ' + T.p(Math.pow(bb, nn - kk)) + ' = ' + coef + '$.'],
      hint: 'Don\'t forget to raise the coefficient $' + a + '$ to the power too.', chk: { binom: [a, bb, nn, kk] } };
  });

  G('alg2.polynomial-inequalities', function (R, ctx) {
    var kind = R.pick(L(ctx, ['cubic', 'rat'], ['cubic', 'rat', 'sq'], ['sq', 'rat', 'cubic']));
    var rel = R.pick(['>', '<', '>=', '<=']), rt = relTex(rel), st = [];
    if (kind === 'rat') {
      var a = R.int(-5, 4), b = R.intNot(-5, 5, [a]), lo = Math.min(a, b), hi = Math.max(a, b);
      var f = '\\frac{' + lfTex(a) + '}{' + lfTex(b) + '}';
      // sign is + outside [lo, hi], - between
      var incA = rel.length > 1, outside = rel[0] === '>', ans;
      var loIn = incA && lo === a, hiIn = incA && hi === a;
      if (outside) ans = 'x ' + (loIn ? '<=' : '<') + ' ' + lo + ' or x ' + (hiIn ? '>=' : '>') + ' ' + hi;
      else ans = lo + ' ' + (loIn ? '<=' : '<') + ' x ' + (hiIn ? '<=' : '<') + ' ' + hi;
      st.push('Critical numbers: the numerator is 0 at $x = ' + a + '$; the denominator is 0 at $x = ' + b + '$ (never allowed).');
      st.push('Sign chart: the quotient is positive when both factors have the same sign (outside the two numbers) and negative between them.');
      st.push('Keep the ' + (outside ? 'positive' : 'negative') + ' parts' + (incA ? ', include $x = ' + a + '$ (it makes the quotient 0) but never $x = ' + b + '$' : '') + '.');
      st.push('Answer: $' + ML.plainToTex(ans) + '$.');
      return { q: 'Solve $' + f + ' ' + rt + ' 0$.', a: { t: 'ineq', v: ans }, steps: st,
        hint: 'Don\'t multiply both sides by $' + lfTex(b) + '$: its sign is unknown. Use a sign chart instead.', chk: { ineq: '(' + lfPlain(a) + ')/(' + lfPlain(b) + ')', rel: rel, pts: [a], den: [b] } };
    }
    var rs = R.sample([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4], 3).sort(function (u, v) { return u - v; }), ms = [1, 1, 1];
    if (kind === 'sq') ms[R.int(0, 2)] = 2;
    var lead = R.pick([1, 1, -1]), poly = [q(lead)]; rs.forEach(function (r, i) { for (var k = 0; k < ms[i]; k++) poly = pmul(poly, P([-r, 1])); });
    var ft = T.coef(lead, rs.map(function (r, i) { return powTex(r === 0 ? 'x' : '(' + lfTex(r) + ')', ms[i]); }).join(''));
    // build answer by sign analysis over exact test points
    function build(rl) {
      var its = [];
      for (var i = 0; i <= rs.length; i++) {
        var tlo = i ? rs[i - 1] : rs[0] - 2, thi = i < rs.length ? rs[i] : rs[rs.length - 1] + 2, mid = q(tlo + thi).div(2);
        var sv = peval(poly, mid).sign(); its.push({ lo: i ? rs[i - 1] : -Infinity, hi: i < rs.length ? rs[i] : Infinity, ok: rl[0] === '>' ? sv > 0 : sv < 0, pt: false });
        if (i < rs.length) its.push({ lo: rs[i], hi: rs[i], ok: rl.length > 1, pt: true });
      }
      var rn = [], cur = null;
      its.forEach(function (it) { if (it.ok) { if (!cur) cur = { lo: it.lo, hi: it.hi, li: it.pt, hi2: it.pt }; else { cur.hi = it.hi; cur.hi2 = it.pt; } } else if (cur) { rn.push(cur); cur = null; } });
      if (cur) rn.push(cur);
      return { items: its, runs: rn };
    }
    var B = build(rel); if (B.runs.some(function (r) { return r.lo === r.hi; })) { rel = rel[0]; rt = relTex(rel); B = build(rel); }
    var items = B.items, runs = B.runs;
    var ansI = runs.map(function (r) { return (r.li ? '[' : '(') + (r.lo === -Infinity ? '-inf' : r.lo) + ', ' + (r.hi === Infinity ? 'inf' : r.hi) + (r.hi2 ? ']' : ')'); }).join(' U ');
    st.push('Zeros: $' + rs.join(', ') + '$' + (kind === 'sq' ? ' (the squared factor does not change sign at its zero)' : '') + '.');
    st.push('Make a sign chart: test one number between each pair of zeros and outside them. ' + items.filter(function (it) { return !it.pt; }).map(function (it) { var mid2 = it.lo === -Infinity ? it.hi - 1 : it.hi === Infinity ? it.lo + 1 : (it.lo + it.hi) / 2; return '$x = ' + U.fix(mid2) + '$: ' + (peval(poly, Q.from(mid2)).sign() > 0 ? '+' : '−'); }).join(', ') + '.');
    st.push('Keep the ' + (rel[0] === '>' ? 'positive' : 'negative') + ' intervals' + (rel.length > 1 ? ' and the zeros' : '') + ': $' + plainIval(ansI) + '$.');
    return { q: 'Solve $' + ft + ' ' + rt + ' 0$. Use interval notation or inequalities.', a: { t: 'ineq', v: ivalToIneq(ansI) }, steps: st,
      hint: 'Mark the zeros on a number line and test one value in each piece.', chk: { ineq: pplain(poly), rel: rel, pts: rs } };
  });

// ---- 04-rational.js

  // =================================================================== Unit 4: rational expressions and functions
  G('alg2.simplify-rational', function (R, ctx) {
    var kind = R.pick(L(ctx, ['simp', 'simp', 'excl'], ['simp', 'excl', 'mc', 'neg'], ['lead', 'neg', 'simp', 'mc']));
    if (kind === 'mc') { var a = R.int(2, 9);
      return { q: 'Which simplification of $\\frac{x + ' + a + '}{' + a + '}$ is correct?', a: mc('$\\frac{x}{' + a + '} + 1$', ['$x$', '$x + 1$', '$1$']),
        steps: ['You may cancel only common <b>factors</b>. The ' + a + ' on top is a term of a sum, not a factor of the whole numerator.', 'Split the fraction instead: $\\frac{x + ' + a + '}{' + a + '} = \\frac{x}{' + a + '} + \\frac{' + a + '}{' + a + '} = \\frac{x}{' + a + '} + 1$.', 'Check with $x = ' + a + '$: $\\frac{' + (2 * a) + '}{' + a + '} = 2$, and $\\frac{' + a + '}{' + a + '} + 1 = 2$. The choice $x$ would give ' + a + '.'],
        hint: 'Can you cancel a term that is being added?' }; }
    if (kind === 'neg') { var r = R.nz(-6, 6), s = R.intNot(-6, 6, [r]);
      var numT = T.lin(-1, 'x', r), ans = '-1/(' + lfPlain(s) + ')';
      return { q: 'Simplify $\\frac{' + T.terms([[r, ''], [-1, 'x']]) + '}{' + ptex(pfromRoots([r, s])) + '}$.', a: { t: 'expr', v: ans, vars: ['x'], form: 'simplified' },
        steps: ['Factor the denominator: $' + facs([r, s]) + '$.', 'Factor $-1$ out of the numerator: $' + T.terms([[r, ''], [-1, 'x']]) + ' = -(' + lfTex(r) + ')$.', 'Cancel $(' + lfTex(r) + ')$: $-\\frac{1}{' + lfTex(s) + '}$, with $x \\ne ' + r + '$ and $x \\ne ' + s + '$.'],
        hint: '$' + T.terms([[r, ''], [-1, 'x']]) + '$ and $' + lfTex(r) + '$ are opposites.', chk: { eqv: '(' + r + '-x)/(' + pplain(pfromRoots([r, s])) + ')' } }; void numT; }
    var c = R.nz(-6, 6), a1 = R.intNot(-6, 6, [c]), b1 = R.intNot(-6, 6, [c, a1]), lead = kind === 'lead' ? R.pick([2, 3]) : 1;
    // (lead x - lead a1)(x - c) / ((x - c)(x - b1)) ... use lead on first numerator factor
    var numP = pmul(P([-lead * a1, lead]), P([-c, 1])), denP = pfromRoots([c, b1]);
    var ansP = (lead === 1 ? '(' + lfPlain(a1) + ')' : lead + '*(' + lfPlain(a1) + ')') + '/(' + lfPlain(b1) + ')';
    if (kind === 'excl') return { q: 'For which values of $x$ is $\\frac{' + ptex(numP) + '}{' + ptex(denP) + '}$ undefined?', a: { t: 'set', v: [String(c), String(b1)] },
      steps: ['Only the denominator matters: the expression is undefined where it is 0.', 'Factor: $' + ptex(denP) + ' = ' + facs([c, b1]) + '$.', 'So $x = ' + c + '$ and $x = ' + b1 + '$ are excluded. (This stays true after simplifying.)'], hint: 'Set the denominator equal to 0.' };
    return { q: 'Simplify $\\frac{' + ptex(numP) + '}{' + ptex(denP) + '}$.', a: { t: 'expr', v: ansP, vars: ['x'], form: 'simplified' },
      steps: ['Factor the numerator: $' + ptex(numP) + ' = ' + (lead === 1 ? '' : lead) + facs([a1, c]) + '$.', 'Factor the denominator: $' + ptex(denP) + ' = ' + facs([c, b1]) + '$.', 'Cancel the common factor $(' + lfTex(c) + ')$: $\\frac{' + (lead === 1 ? '' : lead) + facs([a1]) + '}{' + lfTex(b1) + '}$' + (lead === 1 ? '' : '') + ', for $x \\ne ' + c + ', ' + b1 + '$.'],
      hint: 'Factor the top and bottom completely, then cancel common factors (not terms).', chk: { eqv: '(' + pplain(numP) + ')/(' + pplain(denP) + ')' } };
  });

  G('alg2.multiply-divide-rational', function (R, ctx) {
    var div = L(ctx, R.chance(0.3), R.coin(), R.chance(0.6));
    var pool = R.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 4), A = pool[0], B = pool[1], Cc = pool[2], D = pool[3];
    // left = (x-A)(x-B)/((x-C)(x-D)); right = (x-C)/(x-A)  -> product = (x-B)/(x-D)
    var leftN = pfromRoots([A, B]), leftD = pfromRoots([Cc, D]), rN = [Cc], rD = [A];
    var rightTex = '\\frac{' + lfTex(rN[0]) + '}{' + lfTex(rD[0]) + '}', rightRecip = '\\frac{' + lfTex(rD[0]) + '}{' + lfTex(rN[0]) + '}';
    var q0 = '\\frac{' + ptex(leftN) + '}{' + ptex(leftD) + '}' + (div ? ' \\div ' + rightRecip : ' \\cdot ' + rightTex);
    var st = [];
    if (div) st.push('Dividing is multiplying by the reciprocal: flip $' + rightRecip + '$ to $' + rightTex + '$.');
    st.push('Factor everything: $\\frac{' + facs([A, B]) + '}{' + facs([Cc, D]) + '} \\cdot ' + rightTex + '$.');
    st.push('Cancel $(' + lfTex(A) + ')$ and $(' + lfTex(Cc) + ')$, which appear on top and bottom.');
    st.push('Result: $\\frac{' + lfTex(B) + '}{' + lfTex(D) + '}$.');
    return { q: (div ? 'Divide' : 'Multiply') + ' and simplify: $' + q0 + '$', a: { t: 'expr', v: '(' + lfPlain(B) + ')/(' + lfPlain(D) + ')', vars: ['x'], form: 'simplified' }, steps: st,
      hint: (div ? 'Flip the second fraction first. ' : '') + 'Factor every numerator and denominator before you cancel.', chk: { eqv: '(' + pplain(leftN) + ')/(' + pplain(leftD) + ')*(' + lfPlain(Cc) + ')/(' + lfPlain(A) + ')' } };
  });

  // sum of a/(x - p) and b/(x - q) as one fraction
  G('alg2.add-subtract-rational', function (R, ctx) {
    var kind = R.pick(L(ctx, ['two', 'two'], ['two', 'sub', 'shared'], ['sub', 'shared', 'sub']));
    var p = R.nz(-6, 6), qq = R.intNot(-6, 6, [p]), a = R.nz(-5, 5), b = R.nz(-5, 5), sub = kind === 'sub';
    if (kind === 'shared') { // a/(x^2 - m^2) + b/(x + m)
      var m = R.int(1, 6), D2 = pfromRoots([m, -m]); var N2 = padd(P([a]), pmul(P([b]), P([-m, 1]))); // a + b(x - m)
      var num2 = N2, den2 = [m, -m], canc = N2.length > 1 && peval(N2, -m).isZero() ? -m : peval(N2, m).isZero() ? m : null;
      var ansN = num2, ansD = den2.slice();
      if (canc !== null) { ansN = pdiv(N2, P([-canc, 1])).q; ansD.splice(ansD.indexOf(canc), 1); }
      var ans2 = '(' + pplain(ansN) + ')/(' + ansD.map(function (r) { return '(' + lfPlain(r) + ')'; }).join('') + ')';
      return { q: 'Add and simplify: $\\frac{' + a + '}{' + ptex(D2) + '} + \\frac{' + b + '}{x + ' + m + '}$.', a: { t: 'expr', v: ans2, vars: ['x'], form: 'simplified' },
        steps: ['Factor the first denominator: $x^{2} - ' + (m * m) + ' = (x - ' + m + ')(x + ' + m + ')$. That is the common denominator.', 'Rewrite the second fraction: $\\frac{' + b + '}{x + ' + m + '} = \\frac{' + b + '(x - ' + m + ')}{(x - ' + m + ')(x + ' + m + ')}$.', 'Add the numerators: $' + a + T.signed(b) + '(x - ' + m + ') = ' + ptex(N2) + '$.', canc !== null ? 'The numerator factors and cancels with $(' + lfTex(canc) + ')$: $' + ML.plainToTex(ans2) + '$.' : 'Result: $\\frac{' + ptex(N2) + '}{(x - ' + m + ')(x + ' + m + ')}$.'],
        hint: 'Factor the denominators first; the LCD is not always their product.', chk: { eqv: a + '/(x^2-' + (m * m) + ')+' + '(' + b + ')/(x+' + m + ')' } };
    }
    // a(x - q) ± b(x - p) over (x - p)(x - q)
    var bb = sub ? -b : b, N = padd(pmul(P([a]), P([-qq, 1])), pmul(P([bb]), P([-p, 1])));
    var ansN2 = N, ansD2 = [p, qq], c2 = null;
    [p, qq].forEach(function (r) { if (c2 === null && pdeg(ansN2) >= 1 && peval(ansN2, r).isZero()) c2 = r; });
    if (c2 !== null) { ansN2 = pdiv(N, P([-c2, 1])).q; ansD2.splice(ansD2.indexOf(c2), 1); }
    var ans = '(' + pplain(ansN2) + ')/(' + ansD2.map(function (r) { return '(' + lfPlain(r) + ')'; }).join('') + ')';
    var st = ['The common denominator is $' + facs([p, qq]) + '$.', 'Rewrite: $\\frac{' + a + '(' + lfTex(qq) + ')}{' + facs([p, qq]) + '} ' + (sub ? '-' : '+') + ' \\frac{' + b + '(' + lfTex(p) + ')}{' + facs([p, qq]) + '}$.'];
    st.push((sub ? 'Subtract the whole second numerator (distribute the minus sign): ' : 'Add the numerators: ') + '$' + a + '(' + lfTex(qq) + ')' + (sub ? ' - ' : ' + ') + T.p(b) + '(' + lfTex(p) + ') = ' + ptex(N) + '$.');
    st.push(c2 !== null ? 'The numerator has a factor $(' + lfTex(c2) + ')$ that cancels: $' + ML.plainToTex(ans) + '$.' : 'Result: $\\frac{' + ptex(N) + '}{' + facs([p, qq]) + '}$.');
    return { q: (sub ? 'Subtract' : 'Add') + ' and simplify: $\\frac{' + a + '}{' + lfTex(p) + '} ' + (sub ? '-' : '+') + ' \\frac{' + b + '}{' + lfTex(qq) + '}$.', a: { t: 'expr', v: ans, vars: ['x'], form: 'simplified' }, steps: st,
      hint: sub ? 'After rewriting over the common denominator, subtract every term of the second numerator.' : 'Rewrite both fractions over the common denominator, then add the numerators.', chk: { eqv: '(' + a + ')/(' + lfPlain(p) + ')' + (sub ? '-' : '+') + '(' + b + ')/(' + lfPlain(qq) + ')' } };
  });

  G('alg2.complex-fractions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['t1', 't2'], ['t1', 't2', 't3'], ['t3', 't4', 't2', 't4']));
    var a = R.nz(-6, 6), b = R.pick([1, 2, 3, 4, -1, -2]), c = R.nz(-6, 6), d = R.pick([1, 2, 3, -1, -2]);
    if (kind === 't1') { if (a * d === b * c) d += 1; if (!d) d = 2;
      return { q: nf('Simplify $\\dfrac{\\frac{' + a + '}{x}' + T.signed(b) + '}{\\frac{' + c + '}{x}' + T.signed(d) + '}$.'), a: { t: 'expr', v: '(' + pplain(P([a, b])) + ')/(' + pplain(P([c, d])) + ')', vars: ['x'], form: 'simplified' },
        steps: ['The only denominator inside is $x$. Multiply the top and the bottom of the big fraction by $x$.', 'Top: $x\\left(\\frac{' + a + '}{x}' + T.signed(b) + '\\right) = ' + T.lin(b, 'x', a) + '$. Bottom: $' + T.lin(d, 'x', c) + '$.', 'Result: $\\frac{' + T.lin(b, 'x', a) + '}{' + T.lin(d, 'x', c) + '}$.'],
        hint: 'Multiply the numerator and denominator by $x$, the LCD of the small fractions.', chk: { eqv: '(' + a + '/x+(' + b + '))/(' + c + '/x+(' + d + '))' } }; }
    if (kind === 't2') { var k = R.int(1, 6);
      return { q: 'Simplify $\\dfrac{1 - \\frac{' + (k * k) + '}{x^{2}}}{1 + \\frac{' + k + '}{x}}$.', a: { t: 'expr', v: '(x-' + k + ')/x', vars: ['x'], form: 'simplified' },
        steps: ['Multiply top and bottom by $x^{2}$, the LCD: $\\frac{x^{2} - ' + (k * k) + '}{x^{2} + ' + T.mono(k, 'x') + '}$.', 'Factor: $\\frac{(x - ' + k + ')(x + ' + k + ')}{x(x + ' + k + ')}$.', 'Cancel $(x + ' + k + ')$: $\\frac{x - ' + k + '}{x}$.'],
        hint: 'Clear the small fractions by multiplying top and bottom by $x^2$.', chk: { eqv: '(1-' + (k * k) + '/x^2)/(1+' + k + '/x)' } }; }
    if (kind === 't3') { var m = R.int(2, 9);
      return { q: 'Simplify $\\dfrac{\\frac{1}{x} - \\frac{1}{' + m + '}}{x - ' + m + '}$.', a: { t: 'expr', v: '-1/(' + m + '*x)', vars: ['x'], form: 'simplified' },
        steps: ['Combine the top: $\\frac{1}{x} - \\frac{1}{' + m + '} = \\frac{' + m + ' - x}{' + m + 'x}$.', 'Dividing by $x - ' + m + '$ is multiplying by $\\frac{1}{x - ' + m + '}$: $\\frac{' + m + ' - x}{' + m + 'x(x - ' + m + ')}$.', 'Since $' + m + ' - x = -(x - ' + m + ')$, cancel to get $-\\frac{1}{' + m + 'x}$.'],
        hint: 'Write the top as a single fraction first, then watch for opposite factors.', chk: { eqv: '(1/x-1/' + m + ')/(x-' + m + ')' } }; }
    var h = R.int(2, 5);
    return { q: 'Simplify $\\dfrac{\\frac{1}{x + ' + h + '} - \\frac{1}{x}}{' + h + '}$.', a: { t: 'expr', v: '-1/(x*(x+' + h + '))', vars: ['x'], form: 'simplified' },
      steps: ['Combine the top over $x(x + ' + h + ')$: $\\frac{x - (x + ' + h + ')}{x(x + ' + h + ')} = \\frac{-' + h + '}{x(x + ' + h + ')}$.', 'Divide by ' + h + ': $\\frac{-' + h + '}{' + h + 'x(x + ' + h + ')} = -\\frac{1}{x(x + ' + h + ')}$.'],
      hint: 'Subtract the two small fractions first; be careful with $x - (x + ' + h + ')$.', chk: { eqv: '(1/(x+' + h + ')-1/x)/' + h } };
  });

  G('alg2.rational-equations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['prop', 'lin', 'lin'], ['lin', 'quad', 'prop', 'extr'], ['extr', 'quad', 'extr', 'lin']));
    if (kind === 'prop') { var x0 = R.int(-6, 8), a = R.pick([2, 3, 4, 5]), b = R.intNot(1, 6, [a]), p = R.nz(-5, 5), qq; // a/(x+p) = b/(x+q)
      qq = (a * (x0 + p) === 0) ? 1 : null; var num = b * (x0 + p); if (num % a !== 0) { x0 = x0 + 1; }
      // choose q so that b(x0 + p) = a(x0 + q)
      var tries = 0; while (tries++ < 30) { x0 = R.int(-6, 8); p = R.nz(-5, 5); if (x0 + p === 0) continue; if ((b * (x0 + p)) % a === 0) { qq = b * (x0 + p) / a - x0; if (qq !== p && qq !== 0 && x0 + qq !== 0) break; } }
      if (tries >= 30) { a = 2; b = 4; p = 1; x0 = 1; qq = 3; }
      return { q: 'Solve $\\frac{' + a + '}{x' + T.signed(p) + '} = \\frac{' + b + '}{x' + T.signed(qq) + '}$.', a: { t: 'set', v: [String(x0)] },
        steps: ['Cross-multiply (multiply both sides by both denominators): $' + a + '(x' + T.signed(qq) + ') = ' + b + '(x' + T.signed(p) + ')$.', '$' + T.lin(a, 'x', a * qq) + ' = ' + T.lin(b, 'x', b * p) + '$, so $' + T.mono(a - b, 'x') + ' = ' + (b * p - a * qq) + '$ and $x = ' + x0 + '$.', 'Check: $x = ' + x0 + '$ makes neither denominator 0, so it stands.'],
        hint: 'Cross-multiply, then check that no denominator is 0.', chk: { zero: a + '/(x+(' + p + '))-' + b + '/(x+(' + qq + '))', def: ['x+(' + p + ')', 'x+(' + qq + ')'], n: 1 } }; }
    if (kind === 'lin') { var d = R.nz(-6, 6), bq = R.pick([1, 2, 3, -1, -2]), aa = R.nz(-8, 8), none = R.chance(lvl(ctx) === 1 ? 0.15 : 0.3), cc, xs;
      if (none) { cc = aa; xs = []; } else { var shift = R.nz(-4, 4); if (aa + bq * shift === 0) shift = -shift; cc = aa + bq * shift; xs = [String(d + shift)]; }
      // a/(x - d) + b = c/(x - d)
      return { q: nf('Solve $\\frac{' + aa + '}{' + lfTex(d) + '}' + T.signed(bq) + ' = \\frac{' + cc + '}{' + lfTex(d) + '}$.'), a: { t: 'set', v: xs },
        steps: ['Multiply every term by $' + lfTex(d) + '$ (note $x \\ne ' + d + '$): $' + aa + T.signed(bq) + '(' + lfTex(d) + ') = ' + cc + '$.', 'Solve: $' + T.mono(bq, '(' + lfTex(d) + ')') + ' = ' + (cc - aa) + '$, so $x = ' + qt(q(cc - aa).div(bq).add(d)) + '$.', none ? 'But $x = ' + d + '$ makes the denominators 0. It is extraneous, so there is no solution.' : 'That is not ' + d + ', so it checks.'],
        hint: 'Multiply by the common denominator, solve, then check against the excluded value $x = ' + d + '$.', chk: { zero: '(' + aa + ')/(' + lfPlain(d) + ')+(' + bq + ')-(' + cc + ')/(' + lfPlain(d) + ')', def: [lfPlain(d)], cands: [String(d)] } }; }
    if (kind === 'quad') { var r1 = R.nz(-6, 6), r2 = R.intNot(-6, 6, [0, r1]), S = r1 + r2, Pd = r1 * r2; // x + P/x = S
      return { q: 'Solve $x' + (Pd < 0 ? ' - ' : ' + ') + '\\frac{' + Math.abs(Pd) + '}{x} = ' + S + '$.', a: { t: 'set', v: [String(r1), String(r2)] },
        steps: ['Multiply every term by $x$ (so $x \\ne 0$): $x^{2}' + T.signed(Pd) + ' = ' + T.mono(S, 'x') + '$.', 'Rearrange: $' + ptex(pfromRoots([r1, r2])) + ' = 0$, so $' + facs([r1, r2]) + ' = 0$.', 'Both $' + r1 + '$ and $' + r2 + '$ are nonzero, so both work.'],
        hint: 'Multiply through by $x$ to get a quadratic.', chk: { zero: 'x+(' + Pd + ')/x-(' + S + ')', def: ['x'], n: 2 } }; }
    // extraneous: a/(x - d) + x/(x + d) = 2ad/(x^2 - d^2)  -> x = -a (x = d extraneous)
    var dd = R.int(1, 6), a2 = R.intNot(-7, 7, [0, dd, -dd]);
    return { q: nf('Solve $\\frac{' + a2 + '}{x - ' + dd + '} + \\frac{x}{x + ' + dd + '} = \\frac{' + (2 * a2 * dd) + '}{x^{2} - ' + (dd * dd) + '}$.'), a: { t: 'set', v: [String(-a2)] },
      steps: ['The LCD is $x^{2} - ' + (dd * dd) + ' = (x - ' + dd + ')(x + ' + dd + ')$, so $x \\ne \\pm ' + dd + '$.', 'Multiply every term by it: $' + a2 + '(x + ' + dd + ') + x(x - ' + dd + ') = ' + (2 * a2 * dd) + '$.', 'Simplify: $x^{2}' + T.coef(a2 - dd, 'x', false) + T.signed(-a2 * dd) + ' = 0$, which factors as $(x - ' + dd + ')(x' + T.signed(a2) + ') = 0$.', '$x = ' + dd + '$ is excluded (it makes a denominator 0), so it is extraneous. The only solution is $x = ' + (-a2) + '$.'],
      hint: 'After you solve, check every answer against the values that make a denominator zero.', chk: { zero: a2 + '/(x-' + dd + ')+x/(x+' + dd + ')-(' + (2 * a2 * dd) + ')/(x^2-' + (dd * dd) + ')', def: ['x-' + dd, 'x+' + dd], cands: [String(dd)] } };
  });

  G('alg2.rational-models', function (R, ctx) {
    var kind = R.pick(L(ctx, ['together', 'cost'], ['together', 'other', 'cost'], ['other', 'drain', 'cost', 'together']));
    var names = R.pick([['Ana', 'Ben'], ['Maya', 'Leo'], ['Sam', 'Priya'], ['Jo', 'Kai']]);
    if (kind === 'together') { var pr = R.pick([[2, 3], [3, 6], [4, 12], [6, 12], [2, 6], [5, 20], [4, 6], [3, 4], [6, 10], [10, 15]]), a = pr[0], b = pr[1], t = Q(a * b, a + b);
      return { q: names[0] + ' can paint a fence in ' + a + ' hours. ' + names[1] + ' can paint it in ' + b + ' hours. How many hours will it take them working together?', a: { t: 'num', v: t.toPlain() }, unit: 'hours',
        steps: ['Rates add, times do not. ' + names[0] + ' paints $\\frac{1}{' + a + '}$ of the fence per hour; ' + names[1] + ' paints $\\frac{1}{' + b + '}$.', 'Together: $\\frac{1}{' + a + '} + \\frac{1}{' + b + '} = \\frac{' + (a + b) + '}{' + (a * b) + '}$ of the fence per hour.', 'Time $= \\frac{1}{\\text{rate}} = \\frac{' + (a * b) + '}{' + (a + b) + '} = ' + qt(t) + '$ hours' + (t.isInt() ? '' : ' (about ' + t.toDec(2) + ')') + '.'],
        hint: 'Add the fractions of the job each one does in an hour.', chk: { val: '1/(1/' + a + '+1/' + b + ')' } }; }
    if (kind === 'other') { var pr2 = R.pick([[6, 4, 12], [3, 2, 6], [10, 6, 15], [12, 4, 6], [20, 12, 30], [6, 2, 3], [15, 6, 10], [8, 6, 24]]), A = pr2[0], Tt = pr2[1], B = pr2[2];
      return { q: 'Working together, two pumps empty a tank in ' + Tt + ' hours. The first pump alone takes ' + A + ' hours. How long would the second pump take alone?', a: { t: 'num', v: String(B) }, unit: 'hours',
        steps: ['Let the second pump take $t$ hours. Rates: $\\frac{1}{' + A + '} + \\frac{1}{t} = \\frac{1}{' + Tt + '}$.', 'Multiply by the LCD $' + (A * Tt) + 't$: $' + Tt + 't + ' + (A * Tt) + ' = ' + A + 't$.', 'So $' + T.mono(A - Tt, 't') + ' = ' + (A * Tt) + '$ and $t = ' + B + '$ hours.'],
        hint: 'Write the rates as fractions of the job per hour and set up an equation.', chk: { val: '1/(1/' + Tt + '-1/' + A + ')' } }; }
    if (kind === 'drain') { var pr3 = R.pick([[3, 6], [4, 12], [2, 3], [6, 12], [3, 4], [5, 20], [4, 6]]), f = pr3[0], dr = pr3[1], net = Q(f * dr, dr - f);
      return { q: 'A faucet fills a tub in ' + f + ' minutes. The open drain empties a full tub in ' + dr + ' minutes. If both are open, how many minutes does it take to fill the tub?', a: { t: 'num', v: net.toPlain() }, unit: 'minutes',
        steps: ['Filling adds $\\frac{1}{' + f + '}$ tub per minute; draining subtracts $\\frac{1}{' + dr + '}$.', 'Net rate: $\\frac{1}{' + f + '} - \\frac{1}{' + dr + '} = \\frac{' + (dr - f) + '}{' + (f * dr) + '}$ tub per minute.', 'Time: $\\frac{' + (f * dr) + '}{' + (dr - f) + '} = ' + qt(net) + '$ minutes.'],
        hint: 'The drain\'s rate counts as negative.', chk: { val: '1/(1/' + f + '-1/' + dr + ')' } }; }
    var F = R.pick([200, 300, 400, 500, 600, 1000, 1200]), c = R.pick([2, 3, 4, 5, 6, 8]), extra = R.pick([1, 2, 3, 4, 5]); var n = F / extra;
    while (!Number.isInteger(n)) { extra = R.pick([1, 2, 4, 5]); n = F / extra; }
    var target = c + extra;
    return { q: 'A small press pays ' + T.money(F) + ' to set up a print run, plus ' + T.money(c) + ' per book. The average cost per book is $\\bar{C}(x) = \\frac{' + F + ' + ' + c + 'x}{x}$. How many books must they print for the average cost to be ' + T.money(target) + '?', a: { t: 'num', v: String(n) }, unit: 'books',
      steps: ['Set $\\frac{' + F + ' + ' + c + 'x}{x} = ' + target + '$.', 'Multiply by $x$: $' + F + ' + ' + c + 'x = ' + target + 'x$.', 'So $' + F + ' = ' + T.mono(extra, 'x') + '$ and $x = ' + n + '$ books.', 'Check: $\\frac{' + F + ' + ' + (c * n) + '}{' + n + '} = ' + target + '$.'],
      hint: 'Multiply both sides by $x$ to clear the fraction.', chk: { val: F + '/' + extra } };
  });

  G('alg2.variation', function (R, ctx) {
    var kind = R.pick(L(ctx, ['direct', 'inverse'], ['direct', 'inverse', 'joint', 'k'], ['joint', 'invsq', 'inverse', 'k']));
    if (kind === 'direct') { var k = R.int(2, 9), x1 = R.int(2, 6), x2 = R.intNot(2, 12, [x1]);
      return { q: '$y$ varies directly with $x$, and $y = ' + (k * x1) + '$ when $x = ' + x1 + '$. Find $y$ when $x = ' + x2 + '$.', a: { t: 'num', v: String(k * x2) },
        steps: ['Direct variation: $y = kx$.', '$' + (k * x1) + ' = k \\cdot ' + x1 + '$, so $k = ' + k + '$.', '$y = ' + k + ' \\cdot ' + x2 + ' = ' + (k * x2) + '$.'], hint: 'Find $k$ in $y = kx$ first.' }; }
    if (kind === 'inverse') { var x1b = R.int(2, 6), y1 = R.int(2, 9) * R.pick([1, 2, 3]), kk = x1b * y1, x2b = R.pick(U.factors(kk).filter(function (f) { return f !== x1b && f > 1; }).concat([kk])) ;
      return { q: '$y$ varies inversely with $x$, and $y = ' + y1 + '$ when $x = ' + x1b + '$. Find $y$ when $x = ' + x2b + '$.', a: { t: 'num', v: Q(kk, x2b).toPlain() },
        steps: ['Inverse variation: $y = \\frac{k}{x}$, so $k = xy = ' + x1b + ' \\cdot ' + y1 + ' = ' + kk + '$.', '$y = \\frac{' + kk + '}{' + x2b + '} = ' + qt(Q(kk, x2b)) + '$.', 'As $x$ ' + (x2b > x1b ? 'grew' : 'shrank') + ', $y$ ' + (x2b > x1b ? 'shrank' : 'grew') + ': that is inverse variation.'], hint: 'In inverse variation the product $xy$ stays the same.' }; }
    if (kind === 'joint') { var k3 = R.int(2, 6), x = R.int(2, 5), z = R.int(2, 5), x3 = R.int(2, 6), z3 = R.int(2, 6);
      return { q: '$y$ varies jointly with $x$ and $z$. When $x = ' + x + '$ and $z = ' + z + '$, $y = ' + (k3 * x * z) + '$. Find $y$ when $x = ' + x3 + '$ and $z = ' + z3 + '$.', a: { t: 'num', v: String(k3 * x3 * z3) },
        steps: ['Joint variation: $y = kxz$.', '$' + (k3 * x * z) + ' = k \\cdot ' + x + ' \\cdot ' + z + '$, so $k = ' + k3 + '$.', '$y = ' + k3 + ' \\cdot ' + x3 + ' \\cdot ' + z3 + ' = ' + (k3 * x3 * z3) + '$.'], hint: 'Write $y = kxz$ and find $k$.' }; }
    if (kind === 'invsq') { var d1 = R.int(1, 4), I1 = R.pick([36, 48, 72, 100, 144, 180]), kq = I1 * d1 * d1, d2 = d1 * R.pick([2, 3]);
      return { q: 'The brightness $I$ of a light varies inversely with the square of the distance $d$. At $d = ' + d1 + '$ m, $I = ' + I1 + '$ units. Find $I$ at $d = ' + d2 + '$ m.', a: { t: 'num', v: Q(kq, d2 * d2).toPlain() },
        steps: ['$I = \\frac{k}{d^{2}}$, so $k = I d^{2} = ' + I1 + ' \\cdot ' + (d1 * d1) + ' = ' + kq + '$.', '$I = \\frac{' + kq + '}{' + d2 + '^{2}} = \\frac{' + kq + '}{' + (d2 * d2) + '} = ' + qt(Q(kq, d2 * d2)) + '$.', 'The distance was multiplied by ' + (d2 / d1) + ', so the brightness was divided by $' + (d2 / d1) + '^{2} = ' + ((d2 / d1) * (d2 / d1)) + '$.'], hint: 'Find $k = Id^2$.' }; }
    var kd = R.pick([2, 3, 4, 5, '1/2', '3/2']), kq2 = q(kd), xv = R.int(2, 8) * (kq2.isInt() ? 1 : 2), inv = R.coin(), yv = inv ? Q(R.int(2, 9) * 6).div(1) : kq2.mul(xv);
    if (inv) { var kk2 = q(xv).mul(yv); return { q: '$y$ varies inversely with $x$, and $y = ' + qt(yv) + '$ when $x = ' + xv + '$. What is the constant of variation $k$?', a: { t: 'num', v: kk2.toPlain() },
      steps: ['$y = \\frac{k}{x}$ means $k = xy$.', '$k = ' + xv + ' \\cdot ' + qt(yv) + ' = ' + qt(kk2) + '$.'], hint: 'Multiply $x$ and $y$.' }; }
    return { q: '$y$ varies directly with $x$, and $y = ' + qt(yv) + '$ when $x = ' + xv + '$. What is the constant of variation $k$?', a: { t: 'num', v: kq2.toPlain() },
      steps: ['$y = kx$ means $k = \\frac{y}{x}$.', '$k = \\frac{' + qt(yv) + '}{' + xv + '} = ' + qt(kq2) + '$.'], hint: 'Divide $y$ by $x$.' };
  });

  // --- asymptotes, holes, graphs
  G('alg2.asymptotes-holes', function (R, ctx) {
    var kind = R.pick(L(ctx, ['va', 'hole', 'ha'], ['va', 'hole', 'ha', 'ha0'], ['va', 'hole', 'ha', 'mc']));
    var h = R.nz(-5, 5), z = R.intNot(-5, 5, [h]), v = R.intNot(-5, 5, [h, z]), a = R.pick([1, 2, 3, -1, -2]);
    // f = a(x - h)(x - z) / ((x - h)(x - v))
    var numP = pmul(P([a]), pfromRoots([h, z])), denP = pfromRoots([h, v]), ft = '\\frac{' + ptex(numP) + '}{' + ptex(denP) + '}';
    var holeY = Q(a * (h - z), h - v);
    var fac = 'Factor: $f(x) = \\frac{' + T.coef(a, facs([h, z])) + '}{' + facs([h, v]) + '}$.';
    if (kind === 'va' || kind === 'mc') {
      if (kind === 'mc') return { q: 'Where does $f(x) = ' + ft + '$ have a vertical asymptote?', a: mc('$x = ' + v + '$ only', ['$x = ' + h + '$ and $x = ' + v + '$', '$x = ' + h + '$ only', '$x = ' + z + '$']),
        steps: [fac, 'The factor $(' + lfTex(h) + ')$ cancels, so $x = ' + h + '$ is a hole, not an asymptote.', 'The factor $(' + lfTex(v) + ')$ stays in the denominator: vertical asymptote $x = ' + v + '$.'], hint: 'Cancel common factors first. Only factors left in the denominator give asymptotes.' };
      return { q: 'Find the $x$-value of every vertical asymptote of $f(x) = ' + ft + '$.', a: { t: 'set', v: [String(v)] },
        steps: [fac, 'Cancel $(' + lfTex(h) + ')$; it leaves a hole at $x = ' + h + '$.', 'What is left in the denominator, $' + lfTex(v) + '$, is 0 at $x = ' + v + '$: that is the only vertical asymptote.'], hint: 'Simplify first. A factor that cancels makes a hole.' };
    }
    if (kind === 'hole') return { q: 'Find the hole in the graph of $f(x) = ' + ft + '$. Give it as a point.', a: { t: 'tuple', v: [String(h), holeY.toPlain()] },
      steps: [fac, 'The common factor $(' + lfTex(h) + ')$ cancels, so the graph has a hole at $x = ' + h + '$.', 'Find its height from the simplified form $\\frac{' + T.coef(a, '(' + lfTex(z) + ')') + '}{' + lfTex(v) + '}$ at $x = ' + h + '$: $' + qt(holeY) + '$.', 'The hole is at $\\left(' + h + ', ' + qt(holeY) + '\\right)$.'], hint: 'Cancel the common factor, then substitute its zero into what is left.' };
    if (kind === 'ha0') { var numL = P([R.nz(-6, 6), R.pick([1, 2, 3])]), den2 = pfromRoots([v, z]);
      return { q: 'Find the horizontal asymptote of $g(x) = \\frac{' + ptex(numL) + '}{' + ptex(den2) + '}$.', a: { t: 'eq', v: 'y = 0' },
        steps: ['The numerator has degree 1 and the denominator degree 2.', 'For large $|x|$ the denominator grows faster, so $g(x) \\to 0$.', 'Horizontal asymptote: $y = 0$.'], hint: 'Compare the degrees of the top and bottom.' }; }
    var b2 = R.pick([1, 2, 3, 4]), a2 = R.nz(-6, 6), num3 = pmul(P([a2]), pfromRoots([z, R.int(-4, 4)])), den3 = pmul(P([b2]), pfromRoots([v, R.intNot(-4, 4, [v])])), H = Q(a2, b2);
    return { q: 'Find the horizontal asymptote of $g(x) = \\frac{' + ptex(num3) + '}{' + ptex(den3) + '}$.', a: { t: 'eq', v: 'y = ' + H.toPlain() },
      steps: ['Top and bottom both have degree 2.', 'For large $|x|$ only the leading terms matter: $\\frac{' + T.mono(a2, 'x^{2}') + '}{' + T.mono(b2, 'x^{2}') + '} = ' + qt(H) + '$.', 'Horizontal asymptote: $y = ' + qt(H) + '$.'], hint: 'Same degree: divide the leading coefficients.' };
  });

  G('alg2.graph-rational-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['xint', 'yint', 'domain'], ['xint', 'cross', 'yint', 'domain'], ['cross', 'cross', 'xint', 'domain']));
    // f = (x - a)(x - b) / ((x - c)(x - d)), all different
    var pts, a, b, c, d, tr = 0, xcq;
    do { pts = R.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 4); a = pts[0]; b = pts[1]; c = pts[2]; d = pts[3]; tr++;
      xcq = (a + b) !== (c + d) ? Q(c * d - a * b, (c + d) - (a + b)) : null; } while (tr < 50 && (!xcq || xcq.eq(c) || xcq.eq(d) || xcq.abs().gt(12)));
    var numP = pfromRoots([a, b]), denP = pfromRoots([c, d]), ft = '\\frac{' + ptex(numP) + '}{' + ptex(denP) + '}';
    if (kind === 'xint') return { q: 'Find the $x$-intercepts of $f(x) = ' + ft + '$.', a: { t: 'set', v: [String(a), String(b)] },
      steps: ['$x$-intercepts are where the numerator is 0 (and the denominator is not).', 'Numerator: $' + ptex(numP) + ' = ' + facs([a, b]) + '$, zero at $x = ' + a + '$ and $x = ' + b + '$.', 'Neither makes the denominator 0, so both are intercepts.'], hint: 'Set the numerator equal to 0.', chk: { zero: '(' + pplain(numP) + ')/(' + pplain(denP) + ')', def: [pplain(denP)] } };
    if (kind === 'yint') { var y0 = Q(a * b, c * d); return { q: 'Find the $y$-intercept of $f(x) = ' + ft + '$.', a: { t: 'num', v: y0.toPlain() },
      steps: ['Substitute $x = 0$: $f(0) = \\frac{' + (a * b) + '}{' + (c * d) + '}$ (the constant terms).', 'So the $y$-intercept is $' + qt(y0) + '$.'], hint: 'Put $x = 0$.', chk: { val: '(' + pplain(numP).replace(/x/g, '(0)') + ')/(' + pplain(denP).replace(/x/g, '(0)') + ')' } }; }
    if (kind === 'domain') return { q: 'What is the domain of $f(x) = ' + ft + '$? Use interval notation.', a: { t: 'interval', v: allBut([c, d]) },
      steps: ['The domain leaves out every $x$ that makes the denominator 0.', '$' + ptex(denP) + ' = ' + facs([c, d]) + '$ is 0 at $x = ' + c + '$ and $x = ' + d + '$.', 'Domain: $' + plainIval(allBut([c, d])) + '$.'], hint: 'Factor the denominator and find its zeros.' };
    // where the graph crosses its horizontal asymptote y = 1:  (x - a)(x - b) = (x - c)(x - d)
    var s1 = -(a + b), s2 = -(c + d), xc = Q(c * d - a * b, s1 - s2);
    return { q: 'The graph of $f(x) = ' + ft + '$ has horizontal asymptote $y = 1$. At what $x$ does the graph cross that asymptote?', a: { t: 'num', v: xc.toPlain() },
      steps: ['A horizontal asymptote describes the far ends only; in the middle the graph can cross it. Solve $f(x) = 1$.', 'Multiply by the denominator: $' + ptex(numP) + ' = ' + ptex(denP) + '$.', 'The $x^{2}$ terms cancel: $' + T.lin(s1 - s2, 'x', a * b - c * d) + ' = 0$, so $x = ' + qt(xc) + '$.'],
      hint: 'Set $f(x) = 1$ and solve.', chk: { zero: '(' + pplain(numP) + ')/(' + pplain(denP) + ')-1', def: [pplain(denP)], v: 'x' } };
  });

  G('alg2.slant-asymptotes', function (R, ctx) {
    var kind = R.pick(L(ctx, ['slant', 'slant', 'va'], ['slant', 'slant2', 'which'], ['slant2', 'cubic', 'which', 'slant']));
    if (kind === 'which') { var CH = ['$\\frac{x^{2} + 1}{x - 2}$', '$\\frac{x^{2} + 1}{x^{2} - 2}$', '$\\frac{x + 1}{x^{2} - 2}$', '$\\frac{x^{3} + 1}{x - 2}$'];
      return { q: 'Which function has a slant (oblique) asymptote?', a: { t: 'mc', choices: CH, v: 0 },
        steps: ['A slant asymptote happens when the numerator\'s degree is exactly one more than the denominator\'s.', '$\\frac{x^{2} + 1}{x - 2}$: degrees 2 and 1. Yes.', 'Equal degrees give a horizontal asymptote; a bigger denominator gives $y = 0$; a numerator two degrees bigger behaves like a parabola at the ends.'], hint: 'Compare the degrees.' }; }
    var a = R.nz(-5, 5), m = kind === 'slant2' ? R.pick([2, 3, -1, -2]) : 1, b0 = R.int(-6, 6), r = R.nz(-8, 8);
    // numerator = (m x + b0)(x - a) + r  over (x - a)
    var num = padd(pmul(P([b0, m]), P([-a, 1])), [Q(r)]), den = P([-a, 1]);
    if (kind === 'cubic') { var c0 = R.nz(-4, 4); num = padd(pmul(P([b0, m]), P([c0, 0, 1])), P([R.nz(-6, 6), R.int(-3, 3)])); den = P([c0, 0, 1]); }
    var dv = pdiv(num, den), lineT = 'y = ' + ptex(dv.q), lineP = 'y = ' + pplain(dv.q);
    var ft = '\\frac{' + ptex(num) + '}{' + ptex(den) + '}';
    if (kind === 'va') return { q: 'Find the vertical asymptote of $f(x) = ' + ft + '$.', a: { t: 'eq', v: 'x = ' + a },
      steps: ['The denominator is 0 at $x = ' + a + '$.', 'The numerator there is $' + qt(peval(num, a)) + ' \\ne 0$, so nothing cancels: vertical asymptote $x = ' + a + '$.'], hint: 'Where is the denominator 0?' };
    return { q: 'Find the slant asymptote of $f(x) = ' + ft + '$.', a: { t: 'eq', v: lineP, form: 'solved' },
      steps: ['The numerator\'s degree is one more than the denominator\'s, so divide.', 'Division gives $f(x) = ' + ptex(dv.q) + nf(' + \\frac{' + ptex(dv.r) + '}{' + ptex(den) + '}') + '$.', 'As $|x| \\to \\infty$ the fraction part goes to 0, so the graph approaches the line $' + lineT + '$.'],
      hint: 'Divide the numerator by the denominator and drop the remainder.', chk: { div: { num: pplain(num), den: pplain(den) } } };
  });

// ---- 05-radicals.js

  // =================================================================== Unit 5: radicals
  function rootTex(n, inside) { return n === 2 ? '\\sqrt{' + inside + '}' : '\\sqrt[' + n + ']{' + inside + '}'; }
  G('alg2.nth-roots', function (R, ctx) {
    var kind = R.pick(L(ctx, ['eval', 'eval', 'exp'], ['eval', 'solve', 'exp'], ['solve', 'exp', 'solve', 'eval']));
    var C = [[3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 10], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [4, 5], [6, 2], [2, 11], [2, 12], [2, 13], [2, 15], [5, 4], [3, 9]];
    var pc = R.pick(C), n = pc[0], b = pc[1], pw = Math.pow(b, n);
    if (kind === 'eval') { var neg = n % 2 === 1 && R.coin(), fracd = lvl(ctx) > 1 && R.chance(0.3) ? R.pick([2, 3]) : 1;
      var top = neg ? -pw : pw, val = Q(neg ? -b : b, fracd), inside = fracd === 1 ? String(top) : '\\frac{' + top + '}{' + Math.pow(fracd, n) + '}';
      inside = inside.replace('\\frac{-', '-\\frac{');
      return { q: 'Evaluate $' + rootTex(n, inside) + '$.', a: { t: 'num', v: val.toPlain() },
        steps: ['Look for the number whose ' + ord(n) + ' power is $' + inside + '$.', '$' + T.pow(T.p(qt(val)), n) + ' = ' + inside + '$' + (neg ? ' (an odd power keeps the negative sign)' : '') + '.', 'So $' + rootTex(n, inside) + ' = ' + qt(val) + '$.'],
        hint: 'Try small numbers: which one, raised to the ' + ord(n) + ' power, gives the inside?' }; }
    if (kind === 'exp') { var pc2 = R.pick([[8, 3, 2], [27, 3, 2], [16, 4, 3], [32, 5, 2], [81, 4, 3], [125, 3, 2], [64, 3, 2], [64, 2, 3], [9, 2, 3], [4, 2, 5], [100, 2, 3], [16, 2, 3]]);
      var base = pc2[0], den = pc2[1], num = pc2[2], r1 = Math.round(Math.pow(base, 1 / den)), negE = lvl(ctx) >= 2 && R.chance(0.35);
      var v = Q(Math.pow(r1, num)); if (negE) v = v.inv();
      return { q: 'Evaluate $' + base + '^{' + (negE ? '-' : '') + num + '/' + den + '}$.', a: { t: 'num', v: v.toPlain() },
        steps: ['The denominator is the root: $' + base + '^{1/' + den + '} = ' + rootTex(den, base) + ' = ' + r1 + '$.', 'The numerator is the power: $' + r1 + '^{' + num + '} = ' + Math.pow(r1, num) + '$.', negE ? 'The negative exponent means the reciprocal: $' + qt(v) + '$.' : 'So the value is $' + qt(v) + '$.'],
        hint: 'Take the root first (the denominator), then the power.' }; }
    // solve x^n = a over the real numbers
    var nn = R.pick([2, 3, 4, 5]), bb = R.int(2, nn > 3 ? 3 : 6), negA = R.chance(0.4), A = Math.pow(bb, nn) * (negA ? -1 : 1), sols, st;
    if (nn % 2 === 0) { if (negA) { sols = []; st = ['An even power is never negative: $x^{' + nn + '} \\ge 0$ for every real $x$.', 'So $x^{' + nn + '} = ' + A + '$ has no real solution.']; }
      else { sols = [String(bb), String(-bb)]; st = ['Both $' + bb + '$ and $-' + bb + '$ have ' + ord(nn) + ' power $' + A + '$ (even powers erase the sign).', 'So $x = \\pm ' + bb + '$.']; } }
    else { sols = [String(negA ? -bb : bb)]; st = ['Odd powers keep the sign, so there is exactly one real solution.', '$x = ' + rootTex(nn, A) + ' = ' + (negA ? -bb : bb) + '$.']; }
    return { q: 'Find all real solutions of $x^{' + nn + '} = ' + A + '$.', a: { t: 'set', v: sols }, steps: st,
      hint: nn % 2 === 0 ? 'Can an even power ever be negative? If not, how many numbers have this even power?' : 'An odd root of a negative number is negative.', chk: { zero: 'x^' + nn + '-(' + A + ')' } };
  });

  G('alg2.simplify-radicals', function (R, ctx) {
    var kind = R.pick(L(ctx, ['sqrt', 'ratsimple', 'sqrt'], ['sqrt', 'cube', 'ratsimple', 'conj'], ['cube', 'conj', 'conj', 'ratsimple']));
    if (kind === 'sqrt') { var k = R.int(2, 9), m = R.pick([2, 3, 5, 6, 7, 10, 11]), n = k * k * m, coef = R.pick([1, 1, 2, 3]);
      return { q: 'Simplify $' + (coef === 1 ? '' : coef) + '\\sqrt{' + n + '}$.', a: { t: 'num', v: (coef * k) + '*sqrt(' + m + ')', form: 'simplest' },
        steps: ['Find the largest perfect square factor of ' + n + ': $' + n + ' = ' + (k * k) + ' \\cdot ' + m + '$.', '$\\sqrt{' + n + '} = \\sqrt{' + (k * k) + '}\\sqrt{' + m + '} = ' + k + '\\sqrt{' + m + '}$.', coef === 1 ? 'Done: $' + k + '\\sqrt{' + m + '}$.' : 'Multiply by ' + coef + ': $' + (coef * k) + '\\sqrt{' + m + '}$.'],
        hint: 'Look for a perfect square that divides ' + n + '.' }; }
    if (kind === 'cube') { var kc = R.int(2, 5), mc3 = R.pick([2, 3, 4, 5, 6, 7]), nc = kc * kc * kc * mc3;
      return { q: 'Write $\\sqrt[3]{' + nc + '}$ in the form $a\\sqrt[3]{b}$ with $b$ as small as possible.', a: { t: 'multi', parts: [{ label: '$a =$', a: { t: 'num', v: String(kc) } }, { label: '$b =$', a: { t: 'num', v: String(mc3) } }] },
        steps: ['Look for a perfect cube factor: $' + nc + ' = ' + (kc * kc * kc) + ' \\cdot ' + mc3 + '$, and $' + (kc * kc * kc) + ' = ' + kc + '^{3}$.', '$\\sqrt[3]{' + nc + '} = \\sqrt[3]{' + (kc * kc * kc) + '}\\,\\sqrt[3]{' + mc3 + '} = ' + kc + '\\sqrt[3]{' + mc3 + '}$.'],
        hint: 'Perfect cubes: 8, 27, 64, 125.' }; }
    if (kind === 'ratsimple') { var mm = R.pick([2, 3, 5, 6, 7]), aa = mm * R.int(1, 4) * R.pick([1, 2]);
      var res = Q(aa, mm), ans = (res.eq(1) ? '' : res.toPlain() + '*') + 'sqrt(' + mm + ')';
      return { q: 'Rationalize the denominator: $\\frac{' + aa + '}{\\sqrt{' + mm + '}}$.', a: { t: 'num', v: ans, form: 'simplest' },
        steps: ['Multiply top and bottom by $\\sqrt{' + mm + '}$: $\\frac{' + aa + '\\sqrt{' + mm + '}}{' + mm + '}$.', 'Simplify the fraction: $' + T.coef(res, '\\sqrt{' + mm + '}') + '$.'],
        hint: '$\\sqrt{' + mm + '} \\cdot \\sqrt{' + mm + '} = ' + mm + '$.', chk: { val: aa + '/sqrt(' + mm + ')' } }; }
    // conjugate: c/(a - sqrt(b)) with a^2 - b dividing nicely
    var pairs = [[3, 5, 4], [3, 7, 2], [2, 3, 1], [4, 15, 1], [5, 21, 4], [4, 13, 3], [3, 2, 7], [1, 2, -1], [2, 5, -1], [5, 23, 2]];
    var pr = R.pick(pairs), a = pr[0], b = pr[1], dd = pr[2], plus = R.coin(), cnum = dd * R.pick([1, 2, 3, -1, -2]);
    var factor = Q(cnum, dd); // c/(a - √b) = c(a + √b)/(a^2 - b) = factor·(a + √b)
    var sign = plus ? '+' : '-', conj = plus ? '-' : '+';
    var ansP = (factor.eq(1) ? '' : factor.eq(-1) ? '-' : factor.toPlain() + '*') + '(' + a + conj + 'sqrt(' + b + '))';
    return { q: 'Rationalize the denominator: $\\frac{' + cnum + '}{' + a + ' ' + sign + ' \\sqrt{' + b + '}}$.', a: { t: 'num', v: ansP, form: 'simplest' },
      steps: ['Multiply top <b>and</b> bottom by the conjugate $' + a + ' ' + conj + ' \\sqrt{' + b + '}$.', 'Bottom: $(' + a + ' ' + sign + ' \\sqrt{' + b + '})(' + a + ' ' + conj + ' \\sqrt{' + b + '}) = ' + (a * a) + ' - ' + b + ' = ' + dd + '$, with no root left.', 'Top: $' + cnum + '(' + a + ' ' + conj + ' \\sqrt{' + b + '})$.', 'Divide by ' + dd + ': $' + (factor.eq(1) ? '' : factor.eq(-1) ? '-' : qt(factor)) + '(' + a + ' ' + conj + ' \\sqrt{' + b + '})$.'],
      hint: 'Use the conjugate: change the sign between the terms of the denominator.', chk: { val: cnum + '/(' + a + sign + 'sqrt(' + b + '))' } };
  });

  G('alg2.radical-functions', function (R, ctx) {
    var kind = R.pick(L(ctx, ['start', 'domain', 'range'], ['domain', 'range', 'start', 'cbrt'], ['domain2', 'range', 'domain2', 'cbrt']));
    var h = R.nz(-6, 6), k = R.nz(-6, 6), a = R.pick([1, 2, 3, -1, -2]);
    var ft = T.coef(a, '\\sqrt{' + lfTex(h) + '}') + T.signed(k);
    if (kind === 'start') return { q: 'Where does the graph of $f(x) = ' + ft + '$ start? Give the endpoint.', a: { t: 'tuple', v: [String(h), String(k)] },
      steps: ['$\\sqrt{x}$ starts at $(0, 0)$, where the inside is 0.', 'Here the inside $' + lfTex(h) + '$ is 0 at $x = ' + h + '$, and then $f(' + h + ') = ' + k + '$.', 'The endpoint is $(' + h + ', ' + k + ')$.'], hint: 'Where is the expression under the root equal to 0?' };
    if (kind === 'domain') return { q: 'What is the domain of $f(x) = ' + ft + '$? Use interval notation.', a: { t: 'interval', v: ival(h, Infinity) },
      steps: ['The expression under a square root must be $\\ge 0$: $' + lfTex(h) + ' \\ge 0$.', 'So $x \\ge ' + h + '$: $[' + h + ', \\infty)$.'], hint: 'Set the inside $\\ge 0$.' };
    if (kind === 'range') { var rg = a > 0 ? ival(k, Infinity) : ival(-Infinity, k);
      return { q: 'What is the range of $f(x) = ' + ft + '$? Use interval notation.', a: { t: 'interval', v: rg },
        steps: ['$\\sqrt{' + lfTex(h) + '}$ takes every value $\\ge 0$.', a > 0 ? 'Multiplying by ' + a + ' keeps it $\\ge 0$; adding ' + k + ' gives $f(x) \\ge ' + k + '$.' : 'Multiplying by ' + a + ' makes it $\\le 0$; adding ' + k + ' gives $f(x) \\le ' + k + '$.', 'Range: $' + plainIval(rg) + '$.'], hint: 'Start with the range of $\\sqrt{u}$, then apply the stretch, flip and shift.' }; }
    if (kind === 'cbrt') { var askD = R.coin(), ftc = T.coef(a, '\\sqrt[3]{' + lfTex(h) + '}') + T.signed(k);
      return askD ? { q: 'What is the domain of $g(x) = ' + ftc + '$? Use interval notation.', a: { t: 'interval', v: '(-inf, inf)' },
        steps: ['Cube roots accept every real number, negatives included: $\\sqrt[3]{-8} = -2$.', 'So the domain is all real numbers: $(-\\infty, \\infty)$.'], hint: 'Is there any number without a cube root?' }
        : { q: 'Find the point of symmetry (the center) of the graph of $g(x) = ' + ftc + '$.', a: { t: 'tuple', v: [String(h), String(k)] },
          steps: ['$y = \\sqrt[3]{x}$ is symmetric about the origin, where the inside is 0.', 'Here the inside is 0 at $x = ' + h + '$ and $g(' + h + ') = ' + k + '$.', 'Center: $(' + h + ', ' + k + ')$.'], hint: 'Where is the inside 0?' }; }
    // domain of sqrt(bx + c), possibly with negative b
    var b = R.pick([2, 3, -2, -3, -1]), z = R.int(-5, 5), c = -b * z;
    var dm = b > 0 ? ival(z, Infinity) : ival(-Infinity, z);
    return { q: 'What is the domain of $f(x) = \\sqrt{' + T.lin(b, 'x', c) + '}$? Use interval notation.', a: { t: 'interval', v: dm },
      steps: ['Require $' + T.lin(b, 'x', c) + ' \\ge 0$.', 'Solve: $' + T.mono(b, 'x') + ' \\ge ' + (-c) + '$. ' + (b < 0 ? 'Dividing by a negative flips the inequality: ' : 'Divide: ') + '$x ' + (b > 0 ? '\\ge' : '\\le') + ' ' + z + '$.', 'Domain: $' + plainIval(dm) + '$.'],
      hint: 'Solve inside $\\ge 0$. Watch for dividing by a negative.' };
  });

  G('alg2.radical-equations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['basic', 'basic', 'cube'], ['basic', 'quad', 'noneg', 'cube'], ['quad', 'quad2', 'noneg', 'quad']));
    if (kind === 'basic' || kind === 'noneg') { var a = R.pick([1, 2, 3]), x0 = R.int(-4, 12), c = R.int(1, 7), b0 = c * c - a * x0, neg = kind === 'noneg' && R.coin();
      var lhs = '\\sqrt{' + T.lin(a, 'x', b0) + '}';
      if (neg) return { q: 'Solve $' + lhs + ' = -' + c + '$.', a: { t: 'set', v: [] },
        steps: ['A square root (the principal root) is never negative, so it can\'t equal $-' + c + '$.', 'If you squared anyway you would get $x = ' + x0 + '$, but checking gives $\\sqrt{' + (c * c) + '} = ' + c + ' \\ne -' + c + '$. Extraneous.', 'No solution.'],
        hint: 'Can a square root be negative?', chk: { zero: 'sqrt(' + pplain(P([b0, a])) + ')+' + c, cands: [String(x0)] } };
      return { q: 'Solve $' + lhs + ' = ' + c + '$.', a: { t: 'set', v: [String(x0)] },
        steps: ['The root is already alone. Square both sides: $' + T.lin(a, 'x', b0) + ' = ' + (c * c) + '$.', 'Solve: $' + T.mono(a, 'x') + ' = ' + (c * c - b0) + '$, so $x = ' + x0 + '$.', 'Check: $\\sqrt{' + (c * c) + '} = ' + c + '$. It works.'], hint: 'Square both sides, solve, then check.', chk: { zero: 'sqrt(' + pplain(P([b0, a])) + ')-' + c } }; }
    if (kind === 'cube') { var cc = R.int(-4, 4), aa = R.nz(-9, 9), xs = cc * cc * cc - aa;
      return { q: 'Solve $\\sqrt[3]{x' + T.signed(aa) + '} = ' + cc + '$.', a: { t: 'set', v: [String(xs)] },
        steps: ['Cube both sides: $x' + T.signed(aa) + ' = ' + T.pow(T.p(cc), 3) + ' = ' + (cc * cc * cc) + '$.', '$x = ' + xs + '$. Cubing can\'t create extraneous solutions, but checking is still good: $\\sqrt[3]{' + (cc * cc * cc) + '} = ' + cc + '$.'], hint: 'Undo a cube root by cubing.', chk: { zero: 'cbrt(x+(' + aa + '))-(' + cc + ')' } }; }
    // sqrt(x + a) = x + b with one valid root s (s + b >= 0) and one extraneous t (t + b < 0)
    var s, t, b, A, tries = 0;
    do { s = R.int(-3, 8); t = R.int(-8, 6); b = (1 - s - t) / 2; A = b * b - s * t; tries++; } while ((!Number.isInteger(b) || s === t || s + b < 0 || t + b >= 0 || A === 0 || s + A < 0) && tries < 200);
    if (tries >= 200) { s = 5; t = 2; b = -3; A = -1; }
    var qform = kind === 'quad2' ? 'Solve $\\sqrt{x' + T.signed(A) + '}' + T.signed(-b) + ' = x$.' : 'Solve $\\sqrt{x' + T.signed(A) + '} = ' + lfTex(-b) + '$.';
    var quad = pfromRoots([s, t]);
    return { q: qform, a: { t: 'set', v: [String(s)] },
      steps: (kind === 'quad2' ? ['Isolate the root first: $\\sqrt{x' + T.signed(A) + '} = ' + lfTex(-b) + '$.'] : []).concat(['Square both sides: $x' + T.signed(A) + ' = (' + lfTex(-b) + ')^{2} = ' + ptex(P([b * b, 2 * b, 1])) + '$.', 'Rearrange: $' + ptex(quad) + ' = 0$, so $' + facs([s, t]) + ' = 0$: $x = ' + s + '$ or $x = ' + t + '$.',
        'Check $x = ' + s + '$: $\\sqrt{' + (s + A) + '} = ' + Math.sqrt(s + A) + '$ and $' + s + T.signed(b) + ' = ' + (s + b) + '$. It works.', 'Check $x = ' + t + '$: $\\sqrt{' + (t + A) + '} = ' + Math.sqrt(t + A) + '$ but $' + t + T.signed(b) + ' = ' + (t + b) + '$. A square root can\'t be negative, so $x = ' + t + '$ is extraneous.']),
      hint: 'Isolate the root, square both sides, solve the quadratic, and check both answers in the original equation.', chk: { zero: 'sqrt(x+(' + A + '))-(x+(' + b + '))', cands: [String(s), String(t)] } };
  });

// ---- 06-explog.js

  // =================================================================== Unit 6: exponential and logarithmic functions
  function logb(b) { return b === 10 ? '\\log' : b === 'e' ? '\\ln' : '\\log_{' + b + '}'; }
  function logbP(b, arg) { return b === 10 ? 'log(' + arg + ')' : b === 'e' ? 'ln(' + arg + ')' : 'log(' + arg + ')/log(' + b + ')'; }
  function dec(x, dp) { return U.round(x, dp === undefined ? 2 : dp); }

  G('alg2.exponential-graphs', function (R, ctx) {
    var kind = R.pick(L(ctx, ['asym', 'yint', 'gd'], ['asym', 'range', 'yint', 'gd'], ['range', 'yint', 'asym', 'range']));
    var b = R.pick([2, 3, 4, '1/2', '1/3', 5]), bq = q(b), a = R.pick(L(ctx, [1, 2, 3], [1, 2, 3, -2, -3], [2, -2, -3, '1/2'])), aq = q(a), h = L(ctx, 0, R.int(-2, 2), R.int(-3, 3)), k = R.nz(-6, 6);
    var bT = bq.isInt() ? String(b) : '\\left(' + qt(bq) + '\\right)', expo = h === 0 ? 'x' : lfTex(h);
    var ft = T.coef(aq, bT + '^{' + expo + '}') + T.signed(k);
    if (kind === 'asym') return { q: 'Find the horizontal asymptote of $y = ' + ft + '$.', a: { t: 'eq', v: 'y = ' + k },
      steps: ['$' + bT + '^{' + expo + '}$ gets as close to 0 as you like (at one end) but never reaches it.', 'So $' + T.coef(aq, bT + '^{' + expo + '}') + '$ approaches 0 too, and $y$ approaches $' + k + '$.', 'Asymptote: $y = ' + k + '$ (the vertical shift).'], hint: 'The asymptote of $y = b^x$ is $y = 0$. Which transformations move it?' };
    if (kind === 'range') { var rg = aq.sign() > 0 ? ival(k, Infinity, true) : ival(-Infinity, k, false, true);
      return { q: 'What is the range of $y = ' + ft + '$? Use interval notation.', a: { t: 'interval', v: rg },
        steps: ['$' + bT + '^{' + expo + '}$ takes every positive value.', aq.sign() > 0 ? 'Multiplying by a positive number keeps it positive; adding ' + k + ' gives $y > ' + k + '$.' : 'Multiplying by a negative number makes it negative; adding ' + k + ' gives $y < ' + k + '$.', 'Range: $' + plainIval(rg) + '$ (the asymptote value itself is never reached).'],
        hint: 'Start from the range of $b^x$, $(0, \\infty)$, and apply the stretch, flip and shift.' }; }
    if (kind === 'yint') { var y0 = aq.mul(bq.pow(-h)).add(k);
      return { q: 'Find the $y$-intercept of $y = ' + ft + '$.', a: { t: 'num', v: y0.toPlain() },
        steps: ['Set $x = 0$: $y = ' + T.coef(aq, bT + '^{' + (h === 0 ? '0' : -h) + '}') + T.signed(k) + '$.', h === 0 ? 'Any nonzero number to the 0 power is 1.' : '$' + bT + '^{' + (-h) + '} = ' + qt(bq.pow(-h)) + '$.', '$y = ' + qt(y0) + '$.'], hint: 'Substitute $x = 0$.', chk: { val: y0.toPlain() } }; }
    var grow = bq.gt(1);
    return { q: 'Does $y = ' + T.coef(Math.abs(aq.num()) === aq.num() ? aq : aq.neg(), bT + '^{x}') + '$ show exponential growth or decay?', a: { t: 'mc', choices: ['Growth', 'Decay'], v: grow ? 0 : 1, keep: true },
      steps: ['Look at the base: $b = ' + qt(bq) + '$.', grow ? '$b > 1$: each step right multiplies $y$ by more than 1. Growth.' : '$0 < b < 1$: each step right multiplies $y$ by a fraction. Decay.'], hint: 'Is the base bigger or smaller than 1?' };
  });

  var BASES = [[2, [2, 4, 8, 16, 32, 64, 128]], [3, [3, 9, 27, 81, 243]], [5, [5, 25, 125, 625]]];
  G('alg2.common-base-equations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['simple', 'simple', 'linear'], ['linear', 'two', 'frac'], ['two', 'frac', 'two', 'linear']));
    var pb = R.pick(BASES), b = pb[0];
    if (kind === 'simple') { var e = R.int(2, pb[1].length), v = Math.pow(b, e), c = R.nz(-3, 3), x0 = e - c;
      return { q: 'Solve $' + b + '^{x' + T.signed(c) + '} = ' + v + '$.', a: { t: 'num', v: String(x0) },
        steps: ['Write ' + v + ' as a power of ' + b + ': $' + v + ' = ' + b + '^{' + e + '}$.', 'Same base, so the exponents are equal: $x' + T.signed(c) + ' = ' + e + '$.', '$x = ' + x0 + '$.'], hint: 'Write ' + v + ' as a power of ' + b + '.', chk: { zero: b + '^(x+(' + c + '))-' + v } }; }
    if (kind === 'linear') { var m = R.pick([2, 3]), e2 = R.int(1, 4), c2 = R.int(-4, 4), x2 = Q(e2 - c2, m);
      return { q: 'Solve $' + b + '^{' + T.lin(m, 'x', c2) + '} = ' + Math.pow(b, e2) + '$.', a: { t: 'num', v: x2.toPlain() },
        steps: ['$' + Math.pow(b, e2) + ' = ' + b + '^{' + e2 + '}$.', 'Set exponents equal: $' + T.lin(m, 'x', c2) + ' = ' + e2 + '$.', '$x = ' + qt(x2) + '$.'], hint: 'Rewrite the right side with base ' + b + '.', chk: { zero: b + '^(' + m + '*x+(' + c2 + '))-' + Math.pow(b, e2) } }; }
    if (kind === 'frac') { var e3 = R.int(1, 4), negv = R.coin(), base3 = b, rhs = negv ? '\\frac{1}{' + Math.pow(base3, e3) + '}' : String(Math.pow(base3, e3)), lb = R.pick([1, 2]);
      // (1/b^lb)^x = rhs  -> b^(-lb x) = b^(±e3)
      var target = negv ? -e3 : e3, x3 = Q(-target, lb), lhsB = Math.pow(base3, lb);
      return { q: 'Solve $\\left(\\frac{1}{' + lhsB + '}\\right)^{x} = ' + rhs + '$.', a: { t: 'num', v: x3.toPlain() },
        steps: ['Write both sides as powers of ' + base3 + ': $\\frac{1}{' + lhsB + '} = ' + base3 + '^{' + (-lb) + '}$ and $' + rhs + ' = ' + base3 + '^{' + target + '}$.', 'So $' + base3 + '^{' + T.mono(-lb, 'x') + '} = ' + base3 + '^{' + target + '}$, and $' + T.mono(-lb, 'x') + ' = ' + target + '$.', '$x = ' + qt(x3) + '$.'], hint: 'A fraction like $\\frac{1}{' + lhsB + '}$ is a negative power.', chk: { zero: '(1/' + lhsB + ')^x-(' + (negv ? '1/' + Math.pow(base3, e3) : Math.pow(base3, e3)) + ')' } }; }
    // two powers of the same base: (b^p)^(x + c) = (b^q)^(x)
    var P2 = R.sample([1, 2, 3], 2), p1 = P2[0], p2 = P2[1], c4 = R.nz(-4, 4), B1 = Math.pow(b, p1), B2 = Math.pow(b, p2), x4 = Q(-p1 * c4, p1 - p2);
    return { q: 'Solve $' + B1 + '^{x' + T.signed(c4) + '} = ' + B2 + '^{x}$.', a: { t: 'num', v: x4.toPlain() },
      steps: ['Use base ' + b + ': $' + B1 + ' = ' + b + '^{' + p1 + '}$ and $' + B2 + ' = ' + b + '^{' + p2 + '}$.', 'Power of a power multiplies exponents: $' + b + '^{' + p1 + '(x' + T.signed(c4) + ')} = ' + b + '^{' + p2 + 'x}$.', 'Set exponents equal: $' + T.lin(p1, 'x', p1 * c4) + ' = ' + T.mono(p2, 'x') + '$, so $x = ' + qt(x4) + '$.'],
      hint: 'Rewrite both bases as powers of ' + b + '.', chk: { zero: B1 + '^(x+(' + c4 + '))-' + B2 + '^x' } };
  });

  G('alg2.compound-interest', function (R, ctx) {
    var kind = R.pick(L(ctx, ['parts', 'amount'], ['parts', 'amount', 'mc'], ['amount', 'amount', 'mc', 'compare']));
    var P0 = R.pick([500, 1000, 1500, 2000, 2500, 5000]), rp = R.pick([2, 3, 4, 5, 6, 8]), r = rp / 100, nn = R.pick([[1, 'annually'], [2, 'semiannually'], [4, 'quarterly'], [12, 'monthly']]), n = nn[0], t = R.int(2, 15);
    var A = P0 * Math.pow(1 + r / n, n * t), Ar = dec(A, 2);
    var setup = '$A = ' + P0 + '\\left(1 + \\frac{' + U.fix(r) + '}{' + n + '}\\right)^{' + n + ' \\cdot ' + t + '}$';
    if (kind === 'parts') return { q: 'You deposit ' + T.money(P0) + ' at ' + rp + '% annual interest, compounded ' + nn[1] + ', for ' + t + ' years. In $A = P\\left(1 + \\frac{r}{n}\\right)^{nt}$, what is the interest rate per period and how many periods are there?',
      a: { t: 'multi', parts: [{ label: 'Rate per period (fraction or decimal):', a: { t: 'num', v: Q.from(r).div(n).toPlain() } }, { label: 'Number of periods:', a: { t: 'num', v: String(n * t) } }] },
      steps: ['The yearly rate is $r = ' + U.fix(r) + '$, split over $n = ' + n + '$ periods a year: $\\frac{' + U.fix(r) + '}{' + n + '} = ' + T.num(Q.from(r).div(n)) + '$ per period.', 'Periods: $nt = ' + n + ' \\cdot ' + t + ' = ' + (n * t) + '$.'], hint: 'Divide the yearly rate by the number of periods per year.' };
    if (kind === 'mc') return { q: 'Which expression gives the value of ' + T.money(P0) + ' invested at ' + rp + '% per year, compounded ' + nn[1] + ', after ' + t + ' years?',
      a: mc(setup, ['$A = ' + P0 + '(1 + ' + U.fix(r) + ')^{' + (n * t) + '}$', '$A = ' + P0 + '(1 + ' + rp + ')^{' + t + '}$', '$A = ' + P0 + '\\left(1 + \\frac{' + U.fix(r) + '}{' + n + '}\\right)^{' + t + '}$']),
      steps: ['Each period earns $\\frac{r}{n}$ and there are $nt$ periods.', 'So ' + setup + '.'], hint: 'Two things change with $n$: the rate per period and the number of periods.' };
    if (kind === 'compare') { var n2 = 12, A1 = P0 * Math.pow(1 + r, t), A2 = P0 * Math.pow(1 + r / n2, n2 * t);
      return { q: T.money(P0) + ' earns ' + rp + '% per year for ' + t + ' years. How much more does monthly compounding give than yearly compounding? Round to the nearest cent.', a: { t: 'num', v: String(dec(dec(A2, 2) - dec(A1, 2), 2)), tol: 0.02 },
        steps: ['Yearly: $' + P0 + '(1.' + (rp < 10 ? '0' : '') + rp + ')^{' + t + '} \\approx ' + T.money(dec(A1, 2)) + '$.', 'Monthly: $' + P0 + '\\left(1 + \\frac{' + U.fix(r) + '}{12}\\right)^{' + (12 * t) + '} \\approx ' + T.money(dec(A2, 2)) + '$.', 'Difference: about ' + T.money(dec(A2 - A1, 2)) + '. Compounding more often helps, but only a little.'],
        hint: 'Compute both amounts, then subtract.' }; }
    return { q: 'You invest ' + T.money(P0) + ' at ' + rp + '% annual interest, compounded ' + nn[1] + '. How much is in the account after ' + t + ' years? Round to the nearest cent.', a: { t: 'num', v: A.toFixed(2), tol: 0.011 }, unit: 'dollars',
      steps: ['Use ' + setup + '.', 'Rate per period: $\\frac{' + U.fix(r) + '}{' + n + '}$; number of periods: $' + (n * t) + '$.', 'With a calculator: $A \\approx ' + T.money(Ar) + '$.'],
      hint: 'Divide the rate by ' + n + ' and multiply the years by ' + n + '.', chk: { valNum: P0 * Math.exp(n * t * Math.log1p(r / n)), valTol: 0.006 } };
  });

  G('alg2.number-e', function (R, ctx) {
    var kind = R.pick(L(ctx, ['cont', 'exact', 'limit'], ['cont', 'exact', 'compare'], ['cont', 'compare', 'rate']));
    var P0 = R.pick([100, 500, 1000, 2000, 5000]), rp = R.pick([2, 3, 4, 5, 6, 8]), r = rp / 100, t = R.int(2, 20);
    var A = P0 * Math.exp(r * t), rt = U.fix(r * t);
    if (kind === 'exact') return { q: T.money(P0) + ' grows at ' + rp + '% per year, compounded continuously, for ' + t + ' years. Write the exact amount using $e$.', a: { t: 'num', v: P0 + '*e^(' + rt + ')' },
      steps: ['Continuous compounding: $A = Pe^{rt}$.', '$rt = ' + U.fix(r) + ' \\cdot ' + t + ' = ' + rt + '$.', '$A = ' + P0 + 'e^{' + rt + '}$ (about ' + T.money(dec(A, 2)) + ').'], hint: 'Use $A = Pe^{rt}$ with $r$ as a decimal.' };
    if (kind === 'limit') { var ns = R.pick([[1, '2'], [2, '2.25'], [4, '2.44140625']]); return { q: 'Compute $\\left(1 + \\frac{1}{n}\\right)^{n}$ for $n = ' + ns[0] + '$. (As $n$ grows, these values approach $e \\approx 2.718$.)', a: { t: 'num', v: ns[1] },
      steps: ['$\\left(1 + \\frac{1}{' + ns[0] + '}\\right)^{' + ns[0] + '} = ' + T.pow(T.num(Q.from(1 + 1 / ns[0])), ns[0]) + ' = ' + ns[1] + '$.', 'Bigger $n$ gives values closer to $e$: $n = 100$ gives about $2.7048$, and $n = 1000$ gives about $2.7169$.'], hint: 'Compute $1 + \\frac{1}{n}$ first, then raise it to the power.' }; }
    if (kind === 'compare') { var Am = P0 * Math.pow(1 + r / 12, 12 * t), diff = dec(A, 2) - dec(Am, 2);
      return { q: T.money(P0) + ' earns ' + rp + '% per year for ' + t + ' years. Which gives more: continuous compounding or monthly compounding, and by how much? Round to the nearest cent.', a: { t: 'num', v: String(dec(diff, 2)), tol: 0.02 },
        steps: ['Continuous: $' + P0 + 'e^{' + rt + '} \\approx ' + T.money(dec(A, 2)) + '$.', 'Monthly: $' + P0 + '\\left(1 + \\frac{' + U.fix(r) + '}{12}\\right)^{' + (12 * t) + '} \\approx ' + T.money(dec(Am, 2)) + '$.', 'Continuous compounding is the limit of compounding more and more often, so it gives a little more: about ' + T.money(dec(diff, 2)) + '.'],
        hint: 'Compute both amounts.' }; }
    if (kind === 'rate') { var P1 = R.pick([100, 200, 500]), k = R.pick([3, 4, 5, 6]), tt = R.pick([10, 20, 25]);
      var N = P1 * Math.exp(k / 100 * tt);
      return { q: 'A colony of ' + P1 + ' bacteria grows continuously at ' + k + '% per hour: $N(t) = ' + P1 + 'e^{' + U.fix(k / 100) + 't}$. How many bacteria are there after ' + tt + ' hours? Round to the nearest whole number.', a: { t: 'num', v: String(Math.round(N)), tol: 1 },
        steps: ['$N(' + tt + ') = ' + P1 + 'e^{' + U.fix(k / 100) + ' \\cdot ' + tt + '} = ' + P1 + 'e^{' + U.fix(k * tt / 100) + '}$.', '$e^{' + U.fix(k * tt / 100) + '} \\approx ' + dec(Math.exp(k * tt / 100), 4) + '$, so $N \\approx ' + Math.round(N) + '$.'], hint: 'Multiply the rate by the time, then use the $e^x$ key.' }; }
    return { q: 'You invest ' + T.money(P0) + ' at ' + rp + '% per year, compounded continuously. How much do you have after ' + t + ' years? Round to the nearest cent.', a: { t: 'num', v: String(dec(A, 2)), tol: 0.011 }, unit: 'dollars',
      steps: ['$A = Pe^{rt}$ with $P = ' + P0 + '$, $r = ' + U.fix(r) + '$, $t = ' + t + '$.', '$A = ' + P0 + 'e^{' + rt + '} \\approx ' + T.money(dec(A, 2)) + '$.'], hint: 'Use $A = Pe^{rt}$.' };
  });

  var LOGS = [[2, 2, 4], [2, 3, 8], [2, 4, 16], [2, 5, 32], [2, 6, 64], [3, 2, 9], [3, 3, 27], [3, 4, 81], [4, 2, 16], [4, 3, 64], [5, 2, 25], [5, 3, 125], [10, 2, 100], [10, 3, 1000], [10, 4, 10000], [6, 2, 36], [7, 2, 49]];
  G('alg2.logarithms', function (R, ctx) {
    var kind = R.pick(L(ctx, ['basic', 'basic', 'mc'], ['basic', 'neg', 'frac', 'mc'], ['neg', 'frac', 'ln', 'frac']));
    var e = R.pick(LOGS), b = e[0], k = e[1], v = e[2];
    if (kind === 'mc') { var e2 = R.pick(LOGS.filter(function (x) { return x[0] < 10 && x[1] > 1 && x[2] / x[0] !== x[1]; })), b2 = e2[0], k2 = e2[1], v2 = e2[2];
      return { q: 'What is $\\log_{' + b2 + '} ' + v2 + '$?', a: mc('$' + k2 + '$', ['$' + (b2 * v2) + '$', '$' + qt(Q(v2, b2)) + '$', '$' + (b2 + v2) + '$']),
        steps: ['$\\log_{' + b2 + '} ' + v2 + '$ asks: what power of ' + b2 + ' gives ' + v2 + '?', '$' + b2 + '^{' + k2 + '} = ' + v2 + '$, so the answer is ' + k2 + '. (It is not $' + b2 + ' \\cdot ' + v2 + '$ or $' + v2 + ' \\div ' + b2 + '$: a log is an exponent.)'],
        hint: 'A logarithm is an exponent.' }; }
    if (kind === 'basic') return { q: 'Evaluate $' + logb(b) + ' ' + v + '$.', a: { t: 'num', v: String(k) },
      steps: ['Ask: ' + b + ' to what power gives ' + v + '?', '$' + b + '^{' + k + '} = ' + v + '$, so $' + logb(b) + ' ' + v + ' = ' + k + '$.'], hint: 'Count how many factors of ' + b + ' make ' + v + '.' };
    if (kind === 'neg') { var z = R.chance(0.2);
      if (z) return { q: 'Evaluate $' + logb(b) + ' 1$.', a: { t: 'num', v: '0' }, steps: ['$' + b + '^{0} = 1$, so $' + logb(b) + ' 1 = 0$. (Every base works the same way.)'], hint: 'Any nonzero number to the power 0 is 1.' };
      return { q: 'Evaluate $' + logb(b) + ' \\frac{1}{' + v + '}$.', a: { t: 'num', v: String(-k) },
        steps: ['$\\frac{1}{' + v + '} = \\frac{1}{' + b + '^{' + k + '}} = ' + b + '^{-' + k + '}$.', 'So $' + logb(b) + ' \\frac{1}{' + v + '} = -' + k + '$.'], hint: 'A reciprocal is a negative power.' }; }
    if (kind === 'frac') { var F = R.pick([[4, 2, '1/2', 2], [8, 2, '1/3', 2], [9, 3, '1/2', 3], [27, 3, '1/3', 3], [16, 2, '1/4', 2], [16, 4, '1/2', 2], [25, 5, '1/2', 5], [4, 8, '3/2', 2], [8, 4, '2/3', 2], [9, 27, '3/2', 3], [27, 9, '2/3', 3], [16, 8, '3/4', 2], [4, 32, '5/2', 2], [100, 10, '1/2', 10]]);
      var cb = F[3], eA = Math.round(Math.log(F[0]) / Math.log(cb)), eB = Math.round(Math.log(F[1]) / Math.log(cb));
      return { q: 'Evaluate $\\log_{' + F[0] + '} ' + F[1] + '$.', a: { t: 'num', v: F[2] },
        steps: ['Write both numbers as powers of ' + cb + ': $' + F[0] + ' = ' + cb + '^{' + eA + '}$ and $' + F[1] + ' = ' + cb + '^{' + eB + '}$.', 'If $' + F[0] + '^{x} = ' + F[1] + '$, then $' + cb + '^{' + eA + 'x} = ' + cb + '^{' + eB + '}$, so $' + eA + 'x = ' + eB + '$ and $x = ' + qt(q(F[2])) + '$.', 'Check: $' + F[0] + '^{' + F[2] + '} = ' + F[1] + '$.'],
        hint: 'Write both numbers as powers of the same small base.', chk: { val: 'log(' + F[1] + ')/log(' + F[0] + ')' } }; }
    var kk = R.intNot(-4, 7, [0, 1]); return { q: 'Evaluate $\\ln e^{' + kk + '}$.', a: { t: 'num', v: String(kk) },
      steps: ['$\\ln$ is $\\log_{e}$. It asks: $e$ to what power gives $e^{' + kk + '}$?', 'The answer is the exponent, $' + kk + '$.'], hint: '$\\ln$ undoes $e$ to a power.' };
  });

  G('alg2.log-exp-forms', function (R, ctx) {
    var kind = R.pick(L(ctx, ['toexp', 'solvex', 'tolog'], ['solvex', 'solveb', 'toexp', 'exact'], ['solveb', 'exact', 'solvex']));
    var e = R.pick(LOGS), b = e[0], k = e[1], v = e[2];
    if (kind === 'toexp') return { q: 'Which exponential equation means the same as $' + logb(b) + ' ' + v + ' = ' + k + '$?', a: mc('$' + b + '^{' + k + '} = ' + v + '$', ['$' + k + '^{' + b + '} = ' + v + '$', '$' + v + '^{' + k + '} = ' + b + '$', '$' + b + '^{' + v + '} = ' + k + '$']),
      steps: ['$\\log_{b} y = x$ means $b^{x} = y$: the base stays the base, and the log is the exponent.', 'So $' + b + '^{' + k + '} = ' + v + '$.'], hint: 'The base of the log is the base of the power.' };
    if (kind === 'tolog') return { q: 'Which logarithmic equation means the same as $' + b + '^{' + k + '} = ' + v + '$?', a: mc('$' + logb(b) + ' ' + v + ' = ' + k + '$', ['$\\log_{' + k + '} ' + v + ' = ' + b + '$', '$\\log_{' + v + '} ' + b + ' = ' + k + '$', '$' + logb(b) + ' ' + k + ' = ' + v + '$']),
      steps: ['The exponent ' + k + ' is the logarithm. The base ' + b + ' is the base of the log.', 'So $' + logb(b) + ' ' + v + ' = ' + k + '$.'], hint: 'A log answers "what exponent?"' };
    if (kind === 'solvex') { var neg = R.chance(0.3); return { q: 'Solve $' + logb(b) + ' x = ' + (neg ? -k : k) + '$.', a: { t: 'num', v: neg ? '1/' + v : String(v) },
      steps: ['Rewrite in exponential form: $x = ' + b + '^{' + (neg ? -k : k) + '}$.', '$x = ' + (neg ? '\\frac{1}{' + v + '}' : v) + '$.'], hint: 'Switch to exponential form.', chk: { zero: 'log(x)/log(' + b + ')-(' + (neg ? -k : k) + ')' } }; }
    if (kind === 'solveb') { var e2 = R.pick(LOGS.filter(function (x) { return x[1] >= 2; })); return { q: 'Solve $\\log_{x} ' + e2[2] + ' = ' + e2[1] + '$.', a: { t: 'num', v: String(e2[0]) },
      steps: ['Exponential form: $x^{' + e2[1] + '} = ' + e2[2] + '$.', 'The base of a log must be positive, so $x = ' + rootTex(e2[1], e2[2]) + ' = ' + e2[0] + '$.'], hint: 'Rewrite as $x^{' + e2[1] + '} = ' + e2[2] + '$.' }; }
    var bb = R.pick([2, 3, 5, 10]), y = R.pick([3, 5, 6, 7, 10, 11, 12, 15].filter(function (n) { return Math.round(Math.log(n) / Math.log(bb)) !== Math.log(n) / Math.log(bb); }));
    return { q: 'Solve $' + bb + '^{x} = ' + y + '$ exactly by writing it in logarithmic form.', a: { t: 'num', v: logbP(bb, y) },
      steps: ['$b^{x} = y$ means $x = \\log_{b} y$.', 'So $x = ' + logb(bb) + ' ' + y + '$' + (bb === 10 ? '' : ' (you may also write $\\frac{\\ln ' + y + '}{\\ln ' + bb + '}$)') + ', about ' + dec(Math.log(y) / Math.log(bb), 3) + '.'], hint: 'The answer is a logarithm.', chk: { zero: bb + '^x-' + y } };
  });

  G('alg2.log-properties', function (R, ctx) {
    var kind = R.pick(L(ctx, ['eval', 'pq', 'tf'], ['pq', 'eval', 'cond', 'tf'], ['pq', 'cond', 'pq', 'eval']));
    if (kind === 'pq') {
      var e2 = R.int(0, 3), e3 = R.int(0, 2); if (e2 + e3 < 2) { e2 = 2; e3 = R.int(0, 1) ? 1 : e3; }
      var form = R.pick(e2 && e3 ? ['prod', 'quot', lvl(ctx) === 3 ? 'sqrt' : 'prod'] : ['prod', lvl(ctx) === 3 ? 'sqrt' : 'prod']), ln = R.coin() ? '\\log_{b}' : '\\log';
      var prod = Math.pow(2, e2) * Math.pow(3, e3), argT, exprP, ansT, st1;
      if (form === 'quot') { argT = '\\frac{' + Math.pow(2, e2) + '}{' + Math.pow(3, e3) + '}'; exprP = mterm(e2, 'p') + '-' + mterm(e3, 'q'); ansT = T.terms([[e2, 'p'], [-e3, 'q']]); st1 = 'Quotient rule: $' + ln + ' ' + Math.pow(2, e2) + ' - ' + ln + ' ' + Math.pow(3, e3) + '$, and $' + Math.pow(2, e2) + ' = 2^{' + e2 + '}$, $' + Math.pow(3, e3) + ' = 3^{' + e3 + '}$.'; }
      else { argT = form === 'sqrt' ? '\\sqrt{' + prod + '}' : String(prod); exprP = [e2 ? mterm(e2, 'p') : '', e3 ? mterm(e3, 'q') : ''].filter(Boolean).join('+'); if (form === 'sqrt') exprP = '(' + exprP + ')/2'; ansT = T.terms([[e2, 'p'], [e3, 'q']]); st1 = 'Factor: $' + prod + ' = ' + [e2 ? '2^{' + e2 + '}' : '', e3 ? '3^{' + e3 + '}' : ''].filter(Boolean).join(' \\cdot ') + '$. Product rule: add the logs of the factors.'; }
      return { q: 'Let $' + ln + ' 2 = p$ and $' + ln + ' 3 = q$. Write $' + ln + ' ' + argT + '$ in terms of $p$ and $q$.', a: { t: 'expr', v: exprP, vars: ['p', 'q'] },
        steps: [st1, 'Power rule: ' + [e2 ? '$' + ln + ' 2^{' + e2 + '} = ' + T.mono(e2, 'p') + '$' : '', e3 ? '$' + ln + ' 3^{' + e3 + '} = ' + T.mono(e3, 'q') + '$' : ''].filter(Boolean).join(' and ') + '. So $' + ln + ' ' + (form === 'sqrt' ? prod : argT) + ' = ' + ansT + '$.', form === 'sqrt' ? 'A square root is the power $\\frac{1}{2}$, so halve it: $\\frac{' + ansT + '}{2}$.' : 'Answer: $' + ansT + '$.'],
        hint: 'Write the number using 2s and 3s, then use the product, quotient and power rules.'}; }
    if (kind === 'eval') { var E = R.pick([
        ['\\log_{2} 40 - \\log_{2} 5', '3', '$\\log_{2} \\frac{40}{5} = \\log_{2} 8 = 3$.'], ['\\log_{3} 6 + \\log_{3} \\frac{9}{2}', '3', '$\\log_{3}\\left(6 \\cdot \\frac{9}{2}\\right) = \\log_{3} 27 = 3$.'],
        ['2\\log 5 + \\log 4', '2', '$\\log 5^{2} + \\log 4 = \\log(25 \\cdot 4) = \\log 100 = 2$.'], ['\\log_{6} 4 + \\log_{6} 9', '2', '$\\log_{6} 36 = 2$.'],
        ['\\log 50 + \\log 20', '3', '$\\log 1000 = 3$.'], ['\\log_{2} 48 - \\log_{2} 3', '4', '$\\log_{2} 16 = 4$.'], ['3\\log_{2} 4', '6', '$\\log_{2} 4^{3} = \\log_{2} 64 = 6$, or $3 \\cdot 2 = 6$.'],
        ['\\log_{5} 75 - \\log_{5} 3', '2', '$\\log_{5} 25 = 2$.'], ['\\log_{4} 2 + \\log_{4} 32', '3', '$\\log_{4} 64 = 3$.'], ['\\frac{1}{2}\\log_{3} 81', '2', '$\\log_{3} 81^{1/2} = \\log_{3} 9 = 2$.'],
        ['\\log_{2} 12 - \\log_{2} 3 + \\log_{2} 2', '3', '$\\log_{2} \\frac{12 \\cdot 2}{3} = \\log_{2} 8 = 3$.'], ['\\ln e^{4} + \\ln 1', '4', '$4 + 0 = 4$.']]);
      return { q: 'Evaluate without a calculator: $' + E[0] + '$.', a: { t: 'num', v: E[1] }, steps: ['Combine into a single logarithm using the properties.', E[2]], hint: 'Sums of logs are logs of products; differences are logs of quotients.' }; }
    if (kind === 'cond') { var a = R.int(2, 4), c = R.int(2, 3), sum = R.coin();
      var correct = sum ? '$\\log\\left(\\frac{x^{' + a + '}z^{' + c + '}}{y}\\right)$' : '$\\log\\left(\\frac{x^{' + a + '}}{y z^{' + c + '}}\\right)$';
      var qx = a + '\\log x - \\log y ' + (sum ? '+ ' : '- ') + c + '\\log z';
      return { q: 'Write as a single logarithm: $' + qx + '$', a: mc(correct, [sum ? '$\\log(' + a + 'x - y + ' + c + 'z)$' : '$\\log(' + a + 'x - y - ' + c + 'z)$', sum ? '$\\log\\left(\\frac{' + a + 'x \\cdot ' + c + 'z}{y}\\right)$' : '$\\log\\left(\\frac{' + a + 'x}{' + c + 'yz}\\right)$', sum ? '$\\log\\left(\\frac{x^{' + a + '}}{y z^{' + c + '}}\\right)$' : '$\\log\\left(\\frac{x^{' + a + '}z^{' + c + '}}{y}\\right)$']),
        steps: ['Coefficients become exponents: $\\log x^{' + a + '} - \\log y ' + (sum ? '+' : '-') + ' \\log z^{' + c + '}$.', 'Added logs multiply; subtracted logs divide.', 'Result: ' + correct + '.'], hint: 'First move each coefficient up as an exponent.' }; }
    var TF = [['\\log(a + b) = \\log a + \\log b', false, 'False. The product rule is $\\log(ab) = \\log a + \\log b$. With $a = b = 10$: $\\log 20 \\approx 1.3$, but $\\log 10 + \\log 10 = 2$.'],
      ['\\log(ab) = \\log a + \\log b', true, 'True: multiplying powers of 10 adds their exponents.'], ['\\log(a^{3}) = 3\\log a', true, 'True: $a^{3} = a \\cdot a \\cdot a$, and each factor adds $\\log a$.'],
      ['(\\log a)^{2} = 2\\log a', false, 'False. $2\\log a = \\log a^{2}$, which is different from $(\\log a)^{2}$. Try $a = 1000$: $(\\log 1000)^{2} = 9$, but $2\\log 1000 = 6$.'],
      ['\\frac{\\log a}{\\log b} = \\log a - \\log b', false, 'False. The quotient rule is $\\log\\frac{a}{b} = \\log a - \\log b$. A quotient of logs is something else (change of base).'],
      ['\\log \\frac{1}{a} = -\\log a', true, 'True: $\\frac{1}{a} = a^{-1}$, and the power rule gives $-\\log a$.']];
    var t = R.pick(TF);
    return { q: 'True or false, for all positive $a$ and $b$: $' + t[0] + '$', a: { t: 'tf', v: t[1] }, steps: [t[2]], hint: 'Each log property comes from an exponent rule. Test with powers of 10.' };
  });

  G('alg2.change-of-base', function (R, ctx) {
    var kind = R.pick(L(ctx, ['exact', 'exact', 'approx'], ['exact', 'approx', 'formula'], ['approx', 'exact', 'formula', 'approx']));
    if (kind === 'exact') { var E = R.pick([[8, 32, '5/3', 2, 3, 5], [4, 32, '5/2', 2, 2, 5], [9, 27, '3/2', 3, 2, 3], [27, 9, '2/3', 3, 3, 2], [16, 8, '3/4', 2, 4, 3], [8, 16, '4/3', 2, 3, 4], [25, 125, '3/2', 5, 2, 3], [4, '1/8', '-3/2', 2, 2, -3], [32, 4, '2/5', 2, 5, 2], [9, '1/27', '-3/2', 3, 2, -3]]);
      var argT = typeof E[1] === 'string' ? '\\frac{1}{' + E[1].split('/')[1] + '}' : String(E[1]);
      return { q: 'Evaluate $\\log_{' + E[0] + '} ' + argT + '$ exactly.', a: { t: 'num', v: E[2] },
        steps: ['Change to base ' + E[3] + ': $\\log_{' + E[0] + '} ' + argT + ' = \\frac{\\log_{' + E[3] + '} ' + argT + '}{\\log_{' + E[3] + '} ' + E[0] + '}$.', '$\\log_{' + E[3] + '} ' + argT + ' = ' + E[5] + '$ and $\\log_{' + E[3] + '} ' + E[0] + ' = ' + E[4] + '$.', 'So the value is $\\frac{' + E[5] + '}{' + E[4] + '} = ' + qt(q(E[2])) + '$.'],
        hint: 'Both numbers are powers of ' + E[3] + '.', chk: { val: 'log(' + E[1] + ')/log(' + E[0] + ')' } }; }
    if (kind === 'formula') { var b = R.pick([3, 5, 7, 2]), a = R.pick([10, 20, 30, 50]);
      return { q: 'Which expression equals $\\log_{' + b + '} ' + a + '$?', a: mc('$\\frac{\\ln ' + a + '}{\\ln ' + b + '}$', ['$\\frac{\\ln ' + b + '}{\\ln ' + a + '}$', '$\\ln ' + a + ' - \\ln ' + b + '$', '$\\ln\\frac{' + a + '}{' + b + '}$']),
        steps: ['Change of base: $\\log_{b} a = \\frac{\\log a}{\\log b}$ in any base, such as $\\ln$.', 'The number you take the log of goes on top: $\\frac{\\ln ' + a + '}{\\ln ' + b + '}$.'], hint: 'Top: the argument. Bottom: the base.' }; }
    var b2 = R.pick([2, 3, 5, 6, 7]), x = R.pick([10, 15, 20, 30, 40, 50, 100]), val = Math.log(x) / Math.log(b2);
    return { q: 'Use change of base and a calculator to find $\\log_{' + b2 + '} ' + x + '$ to three decimal places.', a: { t: 'num', v: String(dec(val, 3)), tol: 0.0011 },
      steps: ['$\\log_{' + b2 + '} ' + x + ' = \\frac{\\ln ' + x + '}{\\ln ' + b2 + '}$ (or $\\frac{\\log ' + x + '}{\\log ' + b2 + '}$).', '$\\approx \\frac{' + dec(Math.log(x), 4) + '}{' + dec(Math.log(b2), 4) + '} \\approx ' + dec(val, 3) + '$.', 'Check: $' + b2 + '^{' + dec(val, 3) + '} \\approx ' + x + '$.'], hint: 'Divide $\\ln ' + x + '$ by $\\ln ' + b2 + '$.' };
  });

  G('alg2.log-graphs', function (R, ctx) {
    var kind = R.pick(L(ctx, ['va', 'domain', 'mc'], ['va', 'domain', 'xint', 'mc'], ['xint', 'domain', 'xint', 'va']));
    var b = R.pick([2, 3, 10]), h = R.nz(-5, 5), k = L(ctx, 0, R.int(-3, 3), R.int(-2, 2));
    var ft = logb(b) + '(' + lfTex(h) + ')' + T.signed(k);
    if (kind === 'va') return { q: 'Find the vertical asymptote of $y = ' + ft + '$.', a: { t: 'eq', v: 'x = ' + h },
      steps: ['$\\log$ needs a positive input: $' + lfTex(h) + ' > 0$, so $x > ' + h + '$.', 'As $x$ gets close to ' + h + ' from the right, the input gets close to 0 and the log heads to $-\\infty$.', 'Vertical asymptote: $x = ' + h + '$.'], hint: 'Where does the input of the log become 0?' };
    if (kind === 'domain') return { q: 'What is the domain of $y = ' + ft + '$? Use interval notation.', a: { t: 'interval', v: ival(h, Infinity, true) },
      steps: ['The input of a log must be positive: $' + lfTex(h) + ' > 0$.', '$x > ' + h + '$: $(' + h + ', \\infty)$. (Not $\\ge$: $\\log 0$ is undefined.)'], hint: 'Set the inside $> 0$.' };
    if (kind === 'xint') { var xi = q(b).pow(-k).add(h);
      return { q: 'Find the $x$-intercept of $y = ' + ft + '$.', a: { t: 'num', v: xi.toPlain() },
        steps: ['Set $y = 0$: $' + logb(b) + '(' + lfTex(h) + ') = ' + (-k) + '$.', 'Exponential form: $' + lfTex(h) + ' = ' + b + '^{' + (-k) + '} = ' + qt(q(b).pow(-k)) + '$.', '$x = ' + qt(xi) + '$.'], hint: 'Set $y = 0$ and switch to exponential form.', chk: { zero: 'log(x+(' + (-h) + '))/log(' + b + ')+(' + k + ')' } }; }
    return { q: 'The graph of $y = \\log_{' + b + '} x$ is the reflection of $y = ' + b + '^{x}$ across $y = x$. Which describes its asymptote?', a: mc('A vertical asymptote $x = 0$', ['A horizontal asymptote $y = 0$', 'A vertical asymptote $x = 1$', 'No asymptote']),
      steps: ['$y = ' + b + '^{x}$ has the horizontal asymptote $y = 0$.', 'Reflecting across $y = x$ swaps $x$ and $y$, so the log has the vertical asymptote $x = 0$.'], hint: 'Swap the roles of $x$ and $y$.' };
  });

  G('alg2.log-scales', function (R, ctx) {
    var kind = R.pick(L(ctx, ['ph', 'db'], ['ph', 'db', 'richter', 'dbup'], ['dbup', 'phval', 'ph', 'richter']));
    if (kind === 'ph') { var SUBS = [['Lemon juice', 2], ['Vinegar', 3], ['Tomato juice', 4], ['Black coffee', 5], ['Pure water', 7], ['Seawater', 8], ['A baking soda solution', 9], ['Household ammonia', 11]], two = R.sample(SUBS, 2).sort(function (u, v) { return u[1] - v[1]; }), p1 = two[0][1], p2 = two[1][1], d = p2 - p1;
      return { q: two[0][0] + ' has a pH of about ' + p1 + ', and ' + two[1][0].charAt(0).toLowerCase() + two[1][0].slice(1) + ' has a pH of about ' + p2 + '. About how many times more acidic is ' + two[0][0].charAt(0).toLowerCase() + two[0][0].slice(1) + ' (how many times greater is its $[H^{+}]$)?', a: { t: 'num', v: String(Math.pow(10, d)) },
        steps: ['$\\text{pH} = -\\log[H^{+}]$, so $[H^{+}] = 10^{-\\text{pH}}$.', 'Ratio: $\\frac{10^{-' + p1 + '}}{10^{-' + p2 + '}} = 10^{' + d + '} = ' + Math.pow(10, d) + '$.', 'Each step of 1 in pH is a factor of 10. A lower pH is more acidic.'], hint: 'Each pH unit is a factor of 10.' }; }
    if (kind === 'phval') { var k = R.int(2, 12); return { q: 'A solution has $[H^{+}] = 10^{-' + k + '}$ moles per liter. What is its pH, using $\\text{pH} = -\\log[H^{+}]$?', a: { t: 'num', v: String(k) },
      steps: ['$\\log 10^{-' + k + '} = -' + k + '$.', '$\\text{pH} = -(-' + k + ') = ' + k + '$.'], hint: '$\\log 10^{n} = n$.' }; }
    if (kind === 'db') { var dd = R.pick([10, 20, 30, 40, 50, 60, 70]); return { q: 'Sound level is $L = 10\\log\\frac{I}{I_0}$ decibels. One sound is ' + dd + ' dB louder than another. How many times greater is its intensity $I$?', a: { t: 'num', v: String(Math.pow(10, dd / 10)) },
      steps: ['A difference of ' + dd + ' dB means $10\\log\\frac{I_1}{I_2} = ' + dd + '$.', 'So $\\log\\frac{I_1}{I_2} = ' + (dd / 10) + '$ and $\\frac{I_1}{I_2} = 10^{' + (dd / 10) + '} = ' + Math.pow(10, dd / 10) + '$.'], hint: 'Every 10 dB is a factor of 10 in intensity.' }; }
    if (kind === 'dbup') { var f = R.pick([10, 100, 1000, 10000, 100000]), L0 = R.pick([20, 30, 40, 50, 60, 70, 80]); var add = 10 * Math.log10(f);
      return { q: 'A sound is ' + L0 + ' dB. Its intensity is multiplied by ' + f + '. What is the new level, using $L = 10\\log\\frac{I}{I_0}$?', a: { t: 'num', v: String(L0 + add) }, unit: 'dB',
        steps: ['Multiplying $I$ by ' + f + ' adds $10\\log ' + f + ' = 10 \\cdot ' + Math.log10(f) + ' = ' + add + '$ decibels (product rule).', 'New level: $' + L0 + ' + ' + add + ' = ' + (L0 + add) + '$ dB.'], hint: 'Multiplying inside a log adds outside.' }; }
    var m1 = R.int(2, 6), dm = R.int(1, 3);
    return { q: 'On the Richter scale, each whole number means 10 times the ground motion (amplitude). How many times larger is the amplitude of a magnitude ' + (m1 + dm) + ' earthquake than a magnitude ' + m1 + ' one?', a: { t: 'num', v: String(Math.pow(10, dm)) },
      steps: ['$M = \\log\\frac{A}{A_0}$, so a difference of ' + dm + ' means a ratio of $10^{' + dm + '}$.', '$10^{' + dm + '} = ' + Math.pow(10, dm) + '$.'], hint: 'Each unit is a factor of 10.' };
  });

  G('alg2.solve-exponential-equations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['div', 'basic', 'e'], ['basic', 'div', 'e', 'shift'], ['twobase', 'div2', 'e', 'shift']));
    if (kind === 'div' || kind === 'div2') { var a = R.int(2, 7), b = R.pick([2, 3, 5]), e = R.int(1, 4), v = a * Math.pow(b, e), exact = kind === 'div' || R.coin();
      if (exact) return { q: 'Solve $' + a + ' \\cdot ' + b + '^{x} = ' + v + '$.', a: { t: 'num', v: String(e) },
        steps: ['Divide both sides by ' + a + ' first: $' + b + '^{x} = ' + Math.pow(b, e) + '$. (Don\'t multiply ' + a + ' into the base: $' + a + ' \\cdot ' + b + '^{x}$ is not $' + (a * b) + '^{x}$.)', '$' + Math.pow(b, e) + ' = ' + b + '^{' + e + '}$, so $x = ' + e + '$.'], hint: 'Isolate the power before anything else.', chk: { zero: a + '*' + b + '^x-' + v } };
      var c = R.pick([7, 10, 11, 13, 20, 50]) * a, ratio = c / a;
      return { q: 'Solve $' + a + ' \\cdot ' + b + '^{x} = ' + c + '$. Give the exact answer.', a: { t: 'num', v: 'ln(' + ratio + ')/ln(' + b + ')' },
        steps: ['Divide by ' + a + ': $' + b + '^{x} = ' + ratio + '$.', 'Take a log of both sides: $x\\ln ' + b + ' = \\ln ' + ratio + '$.', '$x = \\frac{\\ln ' + ratio + '}{\\ln ' + b + '}$ (also $\\log_{' + b + '} ' + ratio + '$), about ' + dec(Math.log(ratio) / Math.log(b), 3) + '.'], hint: 'Isolate $' + b + '^x$, then take logs.', chk: { zero: a + '*' + b + '^x-' + c } }; }
    if (kind === 'basic') { var b2 = R.pick([2, 3, 5, 7]), y = R.pick([3, 5, 6, 10, 12, 20].filter(function (n) { return n % b2 !== 0 || n / b2 > 7; }));
      return { q: 'Solve $' + b2 + '^{x} = ' + y + '$. Give the exact answer.', a: { t: 'num', v: 'ln(' + y + ')/ln(' + b2 + ')' },
        steps: ['' + y + ' is not a whole power of ' + b2 + ', so take a logarithm of both sides: $\\ln ' + b2 + '^{x} = \\ln ' + y + '$.', 'The power rule brings the exponent down: $x\\ln ' + b2 + ' = \\ln ' + y + '$.', '$x = \\frac{\\ln ' + y + '}{\\ln ' + b2 + '} \\approx ' + dec(Math.log(y) / Math.log(b2), 3) + '$.'], hint: 'Take $\\ln$ of both sides.', chk: { zero: b2 + '^x-' + y } }; }
    if (kind === 'e') { var k = R.pick([2, 3, 4, 5, '1/2', 0.5]), kq = q(k), c2 = R.pick([5, 7, 10, 20, 50]), A = R.pick([1, 1, 2, 3]);
      var rhs = c2 * A, kt = kq.isInt() ? String(kq.num()) : qt(kq);
      return { q: 'Solve $' + (A === 1 ? '' : A) + 'e^{' + (kq.eq(1) ? '' : kq.isInt() ? kq.num() : U.fix(kq.toNumber())) + 'x} = ' + rhs + '$. Give the exact answer.', a: { t: 'num', v: 'ln(' + c2 + ')/(' + kq.toPlain() + ')' },
        steps: [(A === 1 ? '' : 'Divide by ' + A + ': $e^{' + U.fix(kq.toNumber()) + 'x} = ' + c2 + '$. ') + 'Take $\\ln$ of both sides: $' + U.fix(kq.toNumber()) + 'x = \\ln ' + c2 + '$.', '$x = \\frac{\\ln ' + c2 + '}{' + kt + '}$' + (kq.isInt() ? '' : ' $= ' + (1 / kq.toNumber()) + '\\ln ' + c2 + '$') + ', about ' + dec(Math.log(c2) / kq.toNumber(), 3) + '.'],
        hint: '$\\ln$ undoes $e$.', chk: { zero: A + '*e^(' + kq.toPlain() + '*x)-' + rhs } }; }
    if (kind === 'shift') { var b3 = R.pick([2, 3, 5]), s = R.nz(-3, 3), y3 = R.pick([7, 10, 11, 15]);
      return { q: 'Solve $' + b3 + '^{x' + T.signed(s) + '} = ' + y3 + '$. Give the exact answer.', a: { t: 'num', v: 'ln(' + y3 + ')/ln(' + b3 + ')' + (s > 0 ? '-' + s : '+' + (-s)) },
        steps: ['Take logs: $(x' + T.signed(s) + ')\\ln ' + b3 + ' = \\ln ' + y3 + '$.', 'Divide: $x' + T.signed(s) + ' = \\frac{\\ln ' + y3 + '}{\\ln ' + b3 + '}$.', '$x = \\frac{\\ln ' + y3 + '}{\\ln ' + b3 + '}' + T.signed(-s) + ' \\approx ' + dec(Math.log(y3) / Math.log(b3) - s, 3) + '$.'], hint: 'Bring the whole exponent down, then isolate $x$.', chk: { zero: b3 + '^(x+(' + s + '))-' + y3 } }; }
    // different bases: b^x = d^(x - 1)
    var P = R.sample([2, 3, 5, 7], 2), bb = P[0], d = P[1];
    return { q: 'Solve $' + bb + '^{x} = ' + d + '^{x - 1}$. Give the exact answer.', a: { t: 'num', v: 'ln(' + d + ')/(ln(' + d + ')-ln(' + bb + '))' },
      steps: ['Take $\\ln$ of both sides: $x\\ln ' + bb + ' = (x - 1)\\ln ' + d + '$.', 'Expand and collect the $x$ terms: $x\\ln ' + bb + ' - x\\ln ' + d + ' = -\\ln ' + d + '$.', 'Factor: $x(\\ln ' + bb + ' - \\ln ' + d + ') = -\\ln ' + d + '$, so $x = \\frac{\\ln ' + d + '}{\\ln ' + d + ' - \\ln ' + bb + '} \\approx ' + dec(Math.log(d) / (Math.log(d) - Math.log(bb)), 3) + '$.'],
      hint: 'After taking logs, the logs are just numbers: collect the $x$ terms.', chk: { zero: bb + '^x-' + d + '^(x-1)' } };
  });

  G('alg2.solve-log-equations', function (R, ctx) {
    var kind = R.pick(L(ctx, ['single', 'single', 'ln'], ['sum', 'single', 'diff'], ['sum', 'sum', 'diff', 'ln']));
    if (kind === 'single') { var b = R.pick([2, 3, 5, 10]), n = R.int(1, b === 10 ? 2 : 3), a = R.pick([1, 2, 3]), bn = Math.pow(b, n), c = R.int(-9, 9), x0num = bn - c, x0 = Q(x0num, a);
      return { q: 'Solve $' + logb(b) + '(' + T.lin(a, 'x', c) + ') = ' + n + '$.', a: { t: 'set', v: [x0.toPlain()] },
        steps: ['Exponential form: $' + T.lin(a, 'x', c) + ' = ' + b + '^{' + n + '} = ' + bn + '$.', 'Solve: $x = ' + qt(x0) + '$.', 'Check the domain: $' + T.lin(a, 'x', c) + ' = ' + bn + ' > 0$. It works.'], hint: 'Rewrite as an exponential equation.', chk: { zero: 'log(' + a + '*x+(' + c + '))/log(' + b + ')-' + n, pos: [a + '*x+(' + c + ')'] } }; }
    if (kind === 'ln') { var k = R.int(-2, 4), sh = R.int(-5, 5);
      return { q: 'Solve $\\ln(x' + T.signed(sh) + ') = ' + k + '$. Give the exact answer.', a: { t: 'set', v: ['e^(' + k + ')' + (sh ? (sh > 0 ? '-' + sh : '+' + (-sh)) : '')] },
        steps: ['$\\ln u = ' + k + '$ means $u = e^{' + k + '}$.', '$x' + T.signed(sh) + ' = e^{' + k + '}$, so $x = e^{' + k + '}' + T.signed(-sh) + '$.'], hint: 'Exponentiate with base $e$.', chk: { zero: 'ln(x+(' + sh + '))-(' + k + ')', pos: ['x+(' + sh + ')'] } }; }
    if (kind === 'diff') { var m = R.pick([2, 3, 4, 5]), aa = (m - 1) * R.int(1, 4), xs = aa / (m - 1), bd = R.pick([10, 2, 3]);
      return { q: 'Solve $' + logb(bd) + '(x + ' + aa + ') - ' + logb(bd) + ' x = ' + logb(bd) + ' ' + m + '$.', a: { t: 'set', v: [String(xs)] },
        steps: ['Quotient rule: $' + logb(bd) + '\\frac{x + ' + aa + '}{x} = ' + logb(bd) + ' ' + m + '$.', 'Logs are one-to-one, so $\\frac{x + ' + aa + '}{x} = ' + m + '$.', '$x + ' + aa + ' = ' + m + 'x$, so $x = ' + xs + '$. Both $x$ and $x + ' + aa + '$ are positive, so it checks.'], hint: 'Combine the left side into one log.', chk: { zero: 'log(x+' + aa + ')-log(x)-log(' + m + ')', pos: ['x', 'x+' + aa] } }; }
    // sum: log_b x + log_b (x - k) = n  -> x(x - k) = b^n, roots u and -w
    var opts = [];
    [[2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [6, 2], [10, 2], [2, 6]].forEach(function (bn) { var B = Math.pow(bn[0], bn[1]); for (var w = 1; w * w < B; w++) if (B % w === 0) opts.push([bn[0], bn[1], B / w, w]); });
    var o = R.pick(opts), bb = o[0], nn = o[1], u = o[2], w = o[3], kk = u - w;
    return { q: 'Solve $' + logb(bb) + ' x + ' + logb(bb) + '(x - ' + kk + ') = ' + nn + '$.', a: { t: 'set', v: [String(u)] },
      steps: ['Product rule: $' + logb(bb) + '[x(x - ' + kk + ')] = ' + nn + '$.', 'Exponential form: $x(x - ' + kk + ') = ' + bb + '^{' + nn + '} = ' + (u * w) + '$, so $' + ptex(P([-u * w, -kk, 1])) + ' = 0$.', 'Factor: $(x - ' + u + ')(x + ' + w + ') = 0$, so $x = ' + u + '$ or $x = -' + w + '$.', '$x = -' + w + '$ would need $' + logb(bb) + '(-' + w + ')$, the log of a negative number, so it is extraneous. Only $x = ' + u + '$ works.'],
      hint: 'Combine the logs, solve, then check that every log has a positive input.', chk: { zero: 'log(x)/log(' + bb + ')+log(x-' + kk + ')/log(' + bb + ')-' + nn, pos: ['x', 'x-' + kk], cands: [String(u), String(-w)] } };
  });

  G('alg2.exponential-log-models', function (R, ctx) {
    var kind = R.pick(L(ctx, ['half', 'halftime', 'double'], ['half', 'halftime', 'decayk', 'double'], ['decayk', 'halflog', 'double', 'halftime']));
    if (kind === 'half') { var A0 = R.pick([80, 160, 200, 320, 400, 640]), h = R.pick([5, 8, 10, 12, 30]), m = R.int(1, 4), t = h * m, A = A0 / Math.pow(2, m);
      return { q: 'A substance has a half-life of ' + h + ' years. A sample starts at ' + A0 + ' grams. How much is left after ' + t + ' years?', a: { t: 'num', v: String(A) }, unit: 'grams',
        steps: ['$A = A_0\\left(\\frac{1}{2}\\right)^{t/h}$.', '$\\frac{t}{h} = \\frac{' + t + '}{' + h + '} = ' + m + '$ half-lives.', '$A = ' + A0 + '\\left(\\frac{1}{2}\\right)^{' + m + '} = ' + A + '$ grams.'], hint: 'How many half-lives fit into ' + t + ' years?' }; }
    if (kind === 'halftime') { var h2 = R.pick([3, 6, 8, 10, 20]), m2 = R.int(2, 5), frac = Math.pow(2, m2);
      return { q: 'A medicine has a half-life of ' + h2 + ' hours. How long until only $\\frac{1}{' + frac + '}$ of a dose remains?', a: { t: 'num', v: String(h2 * m2) }, unit: 'hours',
        steps: ['$\\frac{1}{' + frac + '} = \\left(\\frac{1}{2}\\right)^{' + m2 + '}$, so ' + m2 + ' half-lives must pass.', '$' + m2 + ' \\cdot ' + h2 + ' = ' + (h2 * m2) + '$ hours.'], hint: 'Write the fraction as a power of $\\frac{1}{2}$.' }; }
    if (kind === 'double') { var rp = R.pick([2, 3, 4, 5, 6, 7, 8, 10]), dt = Math.log(2) / (rp / 100);
      return { q: 'An investment grows continuously at ' + rp + '% per year ($A = Pe^{' + U.fix(rp / 100) + 't}$). How many years until it doubles? Round to two decimal places.', a: { t: 'num', v: String(dec(dt, 2)), tol: 0.011 }, unit: 'years',
        steps: ['Doubling: $2P = Pe^{' + U.fix(rp / 100) + 't}$, so $e^{' + U.fix(rp / 100) + 't} = 2$.', 'Take $\\ln$: $' + U.fix(rp / 100) + 't = \\ln 2$.', '$t = \\frac{\\ln 2}{' + U.fix(rp / 100) + '} \\approx ' + dec(dt, 2) + '$ years. (This is behind the "rule of 70": $70 \\div ' + rp + ' \\approx ' + dec(70 / rp, 1) + '$.)'], hint: 'Set $A = 2P$, then take $\\ln$.', chk: { val: 'ln(2)/' + (rp / 100), valTol: 0.006 } }; }
    if (kind === 'decayk') { var h3 = R.pick([5, 10, 20, 25, 50]), k = Math.log(2) / h3;
      return { q: 'A substance decays by $A = A_0e^{-kt}$ and has a half-life of ' + h3 + ' days. Find $k$. Round to four decimal places.', a: { t: 'num', v: String(dec(k, 4)), tol: 0.00011 },
        steps: ['At one half-life, $A = \\frac{1}{2}A_0$: $\\frac{1}{2} = e^{-' + h3 + 'k}$.', 'Take $\\ln$: $\\ln\\frac{1}{2} = -' + h3 + 'k$, and $\\ln\\frac{1}{2} = -\\ln 2$.', '$k = \\frac{\\ln 2}{' + h3 + '} \\approx ' + dec(k, 4) + '$.'], hint: 'Use $A = \\frac{1}{2}A_0$ when $t = ' + h3 + '$.', chk: { val: 'ln(2)/' + h3, valTol: 0.00006 } }; }
    var h4 = R.pick([5, 10, 30]), pct = R.pick([10, 20, 25, 30, 40]), tt = h4 * Math.log(pct / 100) / Math.log(0.5);
    return { q: 'A substance has a half-life of ' + h4 + ' years. How long until ' + pct + '% of it remains? Round to two decimal places.', a: { t: 'num', v: String(dec(tt, 2)), tol: 0.011 }, unit: 'years',
      steps: ['$' + U.fix(pct / 100) + ' = \\left(\\frac{1}{2}\\right)^{t/' + h4 + '}$.', 'Take logs: $\\ln ' + U.fix(pct / 100) + ' = \\frac{t}{' + h4 + '}\\ln\\frac{1}{2}$.', '$t = ' + h4 + ' \\cdot \\frac{\\ln ' + U.fix(pct / 100) + '}{\\ln 0.5} \\approx ' + dec(tt, 2) + '$ years.'], hint: 'Set up $(\\frac{1}{2})^{t/h}$ equal to the fraction left, then take logs.' };
  });

  G('alg2.choose-a-model', function (R, ctx) {
    var kind = R.pick(L(ctx, ['table', 'situation'], ['table', 'situation', 'table'], ['table', 'situation', 'table']));
    var FAM = ['Linear', 'Quadratic', 'Exponential', 'Logarithmic'];
    if (kind === 'table') {
      var f = R.int(0, lvl(ctx) === 1 ? 2 : 3), xs, ys, why;
      if (f === 0) { var m = R.nz(-6, 6), b = R.int(-5, 10); xs = [0, 1, 2, 3, 4]; ys = xs.map(function (x) { return m * x + b; }); why = 'The first differences are all $' + m + '$: equal steps in $x$ add the same amount. Linear.'; }
      else if (f === 1) { var a = R.pick([1, 2, -1, 3]), bq = R.int(-4, 4), c = R.int(-5, 5); xs = [0, 1, 2, 3, 4]; ys = xs.map(function (x) { return a * x * x + bq * x + c; }); var d1 = ys.slice(1).map(function (y, i) { return y - ys[i]; }); why = 'First differences: $' + d1.join(', ') + '$ (not constant). Second differences are all $' + (2 * a) + '$. Quadratic.'; }
      else if (f === 2) { var a0 = R.pick([1, 2, 3, 5]), r = R.pick([2, 3, '1/2']), rq = q(r); xs = [0, 1, 2, 3, 4]; ys = xs.map(function (x) { return q(a0 * (rq.isInt() ? 1 : 16)).mul(rq.pow(x)); }); why = 'Each $y$ is $' + qt(rq) + '$ times the one before: a constant ratio. Exponential.'; }
      else { var bb = R.pick([2, 10]), c0 = R.int(0, 5), s = R.pick([1, 2, 3]); xs = bb === 2 ? [1, 2, 4, 8, 16] : [1, 10, 100, 1000, 10000]; ys = xs.map(function (x, i) { return c0 + s * i; }); why = 'Each time $x$ is multiplied by ' + bb + ', $y$ goes up by the same amount, ' + s + '. That is a logarithm: $y = ' + (s === 1 ? '' : s) + '\\log_{' + bb + '} x' + T.signed(c0) + '$.'; }
      var tb = tableTex([['x'].concat(xs.map(function (x) { return String(x); })), ['y'].concat(ys.map(function (y) { return qt(y); }))]);
      return { q: 'Which kind of function fits this data exactly?' + dd(tb), a: { t: 'mc', choices: FAM.slice(), v: f, keep: true },
        steps: ['Look at how $y$ changes as $x$ changes: differences for linear and quadratic, ratios for exponential, and multiplying $x$ for logarithmic.', why], hint: 'Compute the differences between consecutive $y$ values. If they aren\'t constant, try ratios.' };
    }
    var S = [['A town of 8,000 people grows by 3% each year.', 2, 'A fixed percent each year means a constant ratio (1.03): exponential.'],
      ['A ball is thrown upward; its height over time.', 1, 'Gravity makes the height a quadratic in time: it rises, peaks and falls.'],
      ['A gym charges a \\$40 sign-up fee plus \\$25 per month; total cost over time.', 0, 'The same amount is added each month: linear.'],
      ['The loudness in decibels of a sound as its intensity grows.', 3, 'Decibels count factors of 10 in intensity: logarithmic.'],
      ['A car is worth 15% less each year.', 2, 'Losing the same percent each year multiplies by 0.85 each year: exponential decay.'],
      ['The area of a square as its side grows.', 1, '$A = s^{2}$ is quadratic.'],
      ['The pH of a solution as its hydrogen-ion concentration changes.', 3, 'pH is $-\\log[H^{+}]$: logarithmic.'],
      ['A candle 30 cm tall burns down 2 cm each hour.', 0, 'Losing the same 2 cm each hour is linear.'],
      ['The number of digits in a whole number as the number gets bigger.', 3, 'Digits go up by one each time the number is multiplied by 10: that is logarithmic.'],
      ['A bacteria culture doubles every 20 minutes.', 2, 'Doubling is a constant ratio: exponential.']];
    var s0 = R.pick(S);
    return { q: 'Which kind of function best models this? ' + s0[0], a: { t: 'mc', choices: FAM.slice(), v: s0[1], keep: true }, steps: [s0[2]], hint: 'Does the quantity change by equal amounts, by equal factors, or by equal amounts for each factor of the input?' };
  });

// ---- 07-sequences.js

  // =================================================================== Unit 7: sequences and series
  function seqList(a1, f, n) { var out = [a1]; for (var i = 1; i < n; i++) out.push(f(out[i - 1], i + 1, out)); return out; }
  G('alg2.recursive-sequences', function (R, ctx) {
    var kind = R.pick(L(ctx, ['term', 'term', 'mc'], ['term', 'mixed', 'mc', 'explicit'], ['mixed', 'fib', 'explicit', 'mc']));
    if (kind === 'term') { var a1 = R.int(-5, 9), d = R.nz(-6, 6), geo = R.coin(), r = R.pick([2, 3, -2]), k = R.int(4, geo ? 5 : 7);
      var seq = seqList(a1 || 1, function (p) { return geo ? p * r : p + d; }, k); if (geo && !a1) a1 = 1; a1 = seq[0];
      return { q: 'A sequence has $a_1 = ' + a1 + '$ and $a_n = ' + (geo ? T.mono(r, 'a_{n-1}') : 'a_{n-1}' + T.signed(d)) + '$ for $n \\ge 2$. Find $a_{' + k + '}$.', a: { t: 'num', v: String(seq[k - 1]) },
        steps: ['Apply the rule one step at a time: ' + seq.map(function (v, i) { return '$a_{' + (i + 1) + '} = ' + v + '$'; }).join(', ') + '.', 'So $a_{' + k + '} = ' + seq[k - 1] + '$.'], hint: 'Each term comes from the one before it. Write them out in order.' }; }
    if (kind === 'mixed') { var b1 = R.int(1, 5), m = R.pick([2, 3, -1]), c = R.nz(-4, 4), kk = R.int(4, 5);
      var s2 = seqList(b1, function (p) { return m * p + c; }, kk);
      return { q: 'A sequence has $a_1 = ' + b1 + '$ and $a_n = ' + T.mono(m, 'a_{n-1}') + T.signed(c) + '$. Find $a_{' + kk + '}$.', a: { t: 'num', v: String(s2[kk - 1]) },
        steps: s2.slice(1).map(function (v, i) { return '$a_{' + (i + 2) + '} = ' + T.mono(m, '(' + s2[i] + ')').replace(/^(\d+)\(/, '$1 \\cdot (').replace('(' + s2[i] + ')', T.p(s2[i])) + T.signed(c) + ' = ' + v + '$'; }).concat(['So $a_{' + kk + '} = ' + s2[kk - 1] + '$.']),
        hint: 'Multiply the previous term by ' + m + ', then ' + (c > 0 ? 'add ' + c : 'subtract ' + (-c)) + '.' }; }
    if (kind === 'fib') { var f1 = R.int(1, 4), f2 = R.int(1, 5), kf = R.int(5, 7), fs = [f1, f2]; for (var i = 2; i < kf; i++) fs.push(fs[i - 1] + fs[i - 2]);
      return { q: 'A sequence has $a_1 = ' + f1 + '$, $a_2 = ' + f2 + '$ and $a_n = a_{n-1} + a_{n-2}$. Find $a_{' + kf + '}$.', a: { t: 'num', v: String(fs[kf - 1]) },
        steps: ['Each term is the sum of the two before it.', fs.map(function (v, j) { return '$a_{' + (j + 1) + '} = ' + v + '$'; }).join(', ') + '.'], hint: 'Add the two previous terms each time.' }; }
    var a0 = R.int(-5, 9), dd = R.nz(-5, 6), geo2 = R.chance(0.4), rr = R.pick([2, 3, 4]);
    if (kind === 'explicit') { if (geo2) { a0 = R.int(1, 5); return { q: 'A sequence has $a_1 = ' + a0 + '$ and $a_n = ' + rr + 'a_{n-1}$. Write an explicit formula for $a_n$.', a: { t: 'expr', v: a0 + '*' + rr + '^(n-1)', vars: ['n'] },
        steps: ['Each step multiplies by ' + rr + ', so this is geometric with $r = ' + rr + '$.', 'After $n - 1$ steps from $a_1$: $a_n = ' + a0 + ' \\cdot ' + rr + '^{n - 1}$.'], hint: 'How many times has ' + rr + ' been multiplied in by the $n$th term?', chk: { eqv: a0 + '*' + rr + '^(n-1)' } }; }
      return { q: 'A sequence has $a_1 = ' + a0 + '$ and $a_n = a_{n-1}' + T.signed(dd) + '$. Write an explicit formula for $a_n$.', a: { t: 'expr', v: pplain(P([a0 - dd, dd]), 'n'), vars: ['n'] },
        steps: ['Each step adds ' + dd + ', so this is arithmetic with $d = ' + dd + '$.', 'After $n - 1$ steps: $a_n = ' + a0 + T.signed(dd) + '(n - 1)$, which simplifies to $' + T.lin(dd, 'n', a0 - dd) + '$.'], hint: 'Count the steps from $a_1$ to $a_n$.' }; }
    // mc: explicit -> recursive (trouble: a_n vs a_{n+1})
    var correct = '$a_1 = ' + (a0 + dd) + ',\\ a_n = a_{n-1}' + T.signed(dd) + '$';
    return { q: 'Which recursive formula describes $a_n = ' + T.lin(dd, 'n', a0) + '$ (for $n \\ge 1$)?', a: mc(correct, ['$a_1 = ' + a0 + ',\\ a_n = a_{n-1}' + T.signed(dd) + '$', '$a_1 = ' + (a0 + dd) + ',\\ a_{n-1} = a_n' + T.signed(dd) + '$', '$a_1 = ' + (a0 + dd) + ',\\ a_n = ' + T.mono(dd, 'a_{n-1}') + '$']),
      steps: ['First term: $a_1 = ' + dd + ' \\cdot 1' + T.signed(a0) + ' = ' + (a0 + dd) + '$.', 'Each step adds the slope ' + dd + ', so $a_n = a_{n-1}' + T.signed(dd) + '$: the new term is the previous term plus ' + dd + '.'],
      hint: 'Compute $a_1$ by putting $n = 1$, then find what is added each time.' };
  });

  function sumTex(lo, hi, body) { return '\\sum_{k=' + lo + '}^{' + hi + '} ' + body; }
  G('alg2.sigma-notation', function (R, ctx) {
    var kind = R.pick(L(ctx, ['eval', 'count', 'eval'], ['eval', 'count', 'evalsq', 'write'], ['evalsq', 'write', 'count', 'eval']));
    var lo = R.int(0, 4), n = R.int(3, 6), hi = lo + n - 1;
    if (kind === 'count') { var lo2 = R.int(2, 12), hi2 = lo2 + R.int(5, 30); return { q: 'How many terms are in $' + sumTex(lo2, hi2, '(2k + 1)') + '$?', a: { t: 'num', v: String(hi2 - lo2 + 1) },
      steps: ['The index runs from ' + lo2 + ' to ' + hi2 + ', including both ends.', 'Number of terms $= ' + hi2 + ' - ' + lo2 + ' + 1 = ' + (hi2 - lo2 + 1) + '$. (Just subtracting would miss one.)'], hint: 'Count from ' + lo2 + ' to ' + hi2 + ' inclusive.' }; }
    if (kind === 'eval') { var a = R.nz(-4, 5), b = R.int(-5, 5), terms = []; for (var k = lo; k <= hi; k++) terms.push(a * k + b);
      return { q: 'Evaluate $' + sumTex(lo, hi, '(' + T.lin(a, 'k', b) + ')') + '$.', a: { t: 'num', v: String(U.sum(terms)) },
        steps: ['Substitute $k = ' + lo + ', ' + (lo + 1) + ', \\ldots, ' + hi + '$: the terms are $' + terms.join(', ') + '$.', 'Add them: $' + U.sum(terms) + '$.'], hint: 'Start at $k = ' + lo + '$, not at 1.' }; }
    if (kind === 'evalsq') { var useP = R.coin(), c = useP ? R.pick([1, 2, 3]) : R.pick([1, 2, -1]), t2 = []; for (var j = lo; j <= Math.min(hi, lo + 4); j++) t2.push(useP ? c * Math.pow(2, j) : c * j * j);
      var hi3 = Math.min(hi, lo + 4), body = useP ? T.mono(c, '2^{k}') : T.mono(c, 'k^{2}');
      return { q: 'Evaluate $' + sumTex(lo, hi3, body) + '$.', a: { t: 'num', v: String(U.sum(t2)) },
        steps: ['List the terms for $k = ' + lo + '$ to $' + hi3 + '$: $' + t2.join(', ') + '$.', 'Sum: $' + U.sum(t2) + '$.'], hint: 'Write out every term first.' }; }
    // write: identify sigma for a listed sum
    var d = R.pick([2, 3, 4, 5]), s0 = R.int(1, 6), m = R.int(4, 7), list = []; for (var i = 0; i < m; i++) list.push(s0 + d * i);
    var right = '$' + sumTex(1, m, '(' + T.lin(d, 'k', s0 - d) + ')') + '$';
    return { q: 'Which sigma expression equals $' + list.join(' + ') + '$?', a: mc(right, ['$' + sumTex(1, m - 1, '(' + T.lin(d, 'k', s0 - d) + ')') + '$', '$' + sumTex(1, m, '(' + T.lin(d, 'k', s0) + ')') + '$', '$' + sumTex(0, m, '(' + T.lin(d, 'k', s0) + ')') + '$']),
      steps: ['The terms go up by ' + d + ', so the general term is $' + d + 'k + c$.', 'With $k = 1$ the first term is $' + s0 + '$, so $c = ' + (s0 - d) + '$. There are ' + m + ' terms, so $k$ runs from 1 to ' + m + '.', 'Check the last term: $' + d + ' \\cdot ' + m + T.signed(s0 - d) + ' = ' + list[m - 1] + '$.'], hint: 'Find the general term, then check the first and last terms and the number of terms.' };
  });

  G('alg2.arithmetic-series', function (R, ctx) {
    var kind = R.pick(L(ctx, ['first', 'range', 'first'], ['first', 'range', 'sigma', 'word'], ['sigma', 'word', 'findn', 'range']));
    if (kind === 'first') { var a1 = R.int(-10, 15), d = R.nz(-5, 8), n = R.int(8, 30), an = a1 + (n - 1) * d, S = n * (a1 + an) / 2;
      return { q: 'Find the sum of the first ' + n + ' terms of the arithmetic sequence $' + a1 + ', ' + (a1 + d) + ', ' + (a1 + 2 * d) + ', \\ldots$', a: { t: 'num', v: String(S) },
        steps: ['$a_1 = ' + a1 + '$, $d = ' + d + '$. The last term is $a_{' + n + '} = ' + a1 + ' + ' + (n - 1) + ' \\cdot ' + T.p(d) + ' = ' + an + '$.', '$S_{' + n + '} = \\frac{' + n + '(a_1 + a_{' + n + '})}{2} = \\frac{' + n + '(' + a1 + ' + ' + T.p(an) + ')}{2} = ' + S + '$.'], hint: 'Find the last term first, then average the first and last and multiply by the number of terms.' }; }
    if (kind === 'range') { var lo = R.int(1, 30), hi = lo + R.int(10, 90), cnt = hi - lo + 1, S2 = cnt * (lo + hi) / 2;
      return { q: 'Find the sum of all the whole numbers from ' + lo + ' to ' + hi + '.', a: { t: 'num', v: String(S2) },
        steps: ['There are $' + hi + ' - ' + lo + ' + 1 = ' + cnt + '$ numbers.', 'Pair the first with the last: each pair adds to $' + (lo + hi) + '$.', '$S = \\frac{' + cnt + ' \\cdot ' + (lo + hi) + '}{2} = ' + S2 + '$.'], hint: 'Count the terms (don\'t forget the +1), then average the ends.' }; }
    if (kind === 'sigma') { var a = R.pick([2, 3, 4, 5, -2]), b = R.int(-6, 6), n2 = R.int(10, 40), f = a + b, l = a * n2 + b, S3 = n2 * (f + l) / 2;
      return { q: 'Evaluate $' + sumTex(1, n2, '(' + T.lin(a, 'k', b) + ')') + '$.', a: { t: 'num', v: String(S3) },
        steps: ['The terms are arithmetic: first $' + f + '$, last $' + l + '$, and there are ' + n2 + ' of them.', '$S = \\frac{' + n2 + '(' + f + ' + ' + T.p(l) + ')}{2} = ' + S3 + '$.'], hint: 'Find the first term ($k = 1$) and the last term ($k = ' + n2 + '$).' }; }
    if (kind === 'word') { var r1 = R.int(12, 25), inc = R.int(1, 4), rows = R.int(10, 30), last = r1 + (rows - 1) * inc, seats = rows * (r1 + last) / 2;
      return { q: 'A theater has ' + r1 + ' seats in the first row, and each row has ' + inc + ' more seat' + (inc > 1 ? 's' : '') + ' than the row in front of it. There are ' + rows + ' rows. How many seats are there in all?', a: { t: 'num', v: String(seats) }, unit: 'seats',
        steps: ['The rows form an arithmetic sequence: $a_1 = ' + r1 + '$, $d = ' + inc + '$, $n = ' + rows + '$.', 'Last row: $' + r1 + ' + ' + (rows - 1) + ' \\cdot ' + inc + ' = ' + last + '$.', 'Total: $\\frac{' + rows + '(' + r1 + ' + ' + last + ')}{2} = ' + seats + '$.'], hint: 'Find the number of seats in the last row first.' }; }
    var d2 = R.pick([2, 4]), a12 = R.int(1, 6), n3 = R.int(5, 15), Sn = n3 * (2 * a12 + (n3 - 1) * d2) / 2;
    return { q: 'The arithmetic series $' + a12 + ' + ' + (a12 + d2) + ' + ' + (a12 + 2 * d2) + ' + \\cdots$ has a sum of ' + Sn + '. How many terms does it have?', a: { t: 'num', v: String(n3) },
      steps: ['$S_n = \\frac{n}{2}(2a_1 + (n - 1)d) = \\frac{n}{2}(' + (2 * a12) + ' + ' + d2 + '(n - 1))$.', 'Set it equal to ' + Sn + ' and simplify: $' + ptex(P([-Sn, (2 * a12 - d2) / 2, d2 / 2])).replace(/x/g, 'n') + ' = 0$.', 'Solve: $n = ' + n3 + '$ (the other root is negative, so it can\'t count terms).'], hint: 'Use $S_n = \\frac{n}{2}(2a_1 + (n - 1)d)$ and solve the quadratic for $n$.', chk: { val: String(n3) } };
  });

  G('alg2.geometric-series', function (R, ctx) {
    var kind = R.pick(L(ctx, ['int', 'sigma', 'tf'], ['int', 'frac', 'sigma', 'tf'], ['frac', 'save', 'sigma', 'int']));
    if (kind === 'int') { var a = R.int(1, 5), r = R.pick([2, 3, -2]), n = R.int(5, r === 3 ? 6 : 8), S = a * (1 - Math.pow(r, n)) / (1 - r);
      return { q: 'Find the sum of the first ' + n + ' terms: $' + a + T.signed(a * r) + T.signed(a * r * r) + ' + \\cdots$', a: { t: 'num', v: String(S) },
        steps: ['Geometric with $a = ' + a + '$ and $r = ' + r + '$; we want $n = ' + n + '$ terms.', '$S_{' + n + '} = \\frac{a(1 - r^{n})}{1 - r} = \\frac{' + a + '(1 - ' + T.pow(T.p(r), n) + ')}{1 - ' + T.p(r) + '} = \\frac{' + a + '(' + (1 - Math.pow(r, n)) + ')}{' + (1 - r) + '} = ' + S + '$.'],
        hint: 'Use $S_n = \\frac{a(1 - r^n)}{1 - r}$ with $n$ = the number of terms.', chk: { val: String((function () { var s = 0, t = a; for (var i = 0; i < n; i++) { s += t; t *= r; } return s; })()) } }; }
    if (kind === 'frac') { var a2 = R.pick([16, 32, 64, 81, 27]), r2 = a2 % 3 === 0 ? Q(1, 3) : Q(1, 2), n2 = R.int(4, 6), S2 = q(a2).mul(Q(1).sub(r2.pow(n2))).div(Q(1).sub(r2));
      var terms = []; for (var i = 0; i < 3; i++) terms.push(qt(q(a2).mul(r2.pow(i))));
      return { q: 'Find the sum of the first ' + n2 + ' terms: $' + terms.join(' + ') + ' + \\cdots$', a: { t: 'num', v: S2.toPlain() },
        steps: ['$a = ' + a2 + '$, $r = ' + qt(r2) + '$, $n = ' + n2 + '$.', '$S_{' + n2 + '} = \\frac{' + a2 + '\\left(1 - \\left(' + qt(r2) + '\\right)^{' + n2 + '}\\right)}{1 - ' + qt(r2) + '} = ' + qt(S2) + '$.'], hint: 'Here $r = ' + qt(r2) + '$.' }; }
    if (kind === 'sigma') { var a3 = R.int(1, 4), r3 = R.pick([2, 3]), n3 = R.int(4, 7), S3 = a3 * (Math.pow(r3, n3) - 1) / (r3 - 1);
      return { q: 'Evaluate $' + sumTex(1, n3, T.mono(a3, r3 + '^{k-1}')) + '$.', a: { t: 'num', v: String(S3) },
        steps: ['First term ($k = 1$): $' + a3 + '$. Ratio $' + r3 + '$. Number of terms: ' + n3 + '.', '$S = \\frac{' + a3 + '(' + r3 + '^{' + n3 + '} - 1)}{' + r3 + ' - 1} = ' + S3 + '$.'], hint: 'Read $a$, $r$ and $n$ from the sigma notation.' }; }
    if (kind === 'save') { var dep = R.pick([50, 100, 200]), rp = R.pick([3, 4, 5, 6]), yrs = R.pick([5, 10, 15]), i = rp / 100 / 12, N = 12 * yrs, FV = dep * (Math.pow(1 + i, N) - 1) / i;
      return { q: 'You deposit ' + T.money(dep) + ' at the end of every month into an account earning ' + rp + '% per year, compounded monthly. The balance after $n$ deposits is the geometric series $' + dep + ' + ' + dep + '(1 + i) + \\cdots + ' + dep + '(1 + i)^{n - 1}$ with $i = \\frac{' + U.fix(rp / 100) + '}{12}$. Find the balance after ' + yrs + ' years. Round to the nearest cent.', a: { t: 'num', v: String(dec(FV, 2)), tol: 0.02 }, unit: 'dollars',
        steps: ['$a = ' + dep + '$, $r = 1 + i$, $n = ' + N + '$ deposits.', '$S = \\frac{' + dep + '\\left((1 + i)^{' + N + '} - 1\\right)}{i}$ (the series formula, with $r - 1 = i$).', 'With a calculator: about ' + T.money(dec(FV, 2)) + '. You deposited ' + T.money(dep * N) + '; the rest is interest.'], hint: 'There are ' + N + ' monthly deposits.' }; }
    var TF = [['The formula $S_n = \\frac{a(1 - r^{n})}{1 - r}$ works when $r = 1$.', false, 'False: with $r = 1$ the denominator is 0. Every term equals $a$, so $S_n = na$.'],
      ['$2 + 6 + 18 + 54 + 162$ has $n = 5$ terms, so its sum is $\\frac{2(1 - 3^{5})}{1 - 3}$.', true, 'True: $\\frac{2(1 - 243)}{-2} = 242$, and $2 + 6 + 18 + 54 + 162 = 242$.'],
      ['$1 + 2 + 4 + \\cdots + 128$ has 7 terms.', false, 'False: $128 = 2^{7}$, and the powers run from $2^{0}$ to $2^{7}$: that is 8 terms.'],
      ['$5 + 5 + 5 + 5$ is a geometric series with $r = 1$, and its sum is $20$.', true, 'True: each term is $5 \\cdot 1^{k}$, and $S = 4 \\cdot 5 = 20$.']];
    var t = R.pick(TF);
    return { q: 'True or false: ' + t[0], a: { t: 'tf', v: t[1] }, steps: [t[2]], hint: 'Check $r$ and count the terms carefully.' };
  });

  G('alg2.infinite-geometric-series', function (R, ctx) {
    var kind = R.pick(L(ctx, ['sum', 'sum', 'diverge'], ['sum', 'diverge', 'decimal', 'sigma'], ['decimal', 'sigma', 'sum', 'diverge']));
    if (kind === 'sum') { var a = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]), rr = R.pick([Q(1, 2), Q(1, 3), Q(-1, 2), Q(2, 3), Q(1, 4), Q(-1, 3), Q(3, 4)]), S = q(a).div(Q(1).sub(rr));
      var t1 = q(a).mul(rr), t2 = t1.mul(rr);
      return { q: 'Find the sum: $' + a + T.signed(t1) + T.signed(t2) + ' + \\cdots$', a: { t: 'num', v: S.toPlain() },
        steps: ['$a = ' + a + '$ and $r = ' + qt(rr) + '$. Since $|r| < 1$, the partial sums approach a limit.', '$S = \\frac{a}{1 - r} = \\frac{' + a + '}{1 - ' + T.p(qt(rr)) + '} = ' + qt(S) + '$.'], hint: 'Find $r$ by dividing a term by the one before it.' }; }
    if (kind === 'diverge') { var a2 = R.int(1, 5), r2 = R.pick([Q(3, 2), Q(2), Q(-2), Q(5, 4), Q(-3, 2), Q(1, 2), Q(-1, 2), Q(1, 3)]), conv = r2.abs().lt(1);
      var s1 = q(a2).mul(r2), s2 = s1.mul(r2), S2 = conv ? q(a2).div(Q(1).sub(r2)) : null;
      return { q: 'Find the sum of $' + a2 + T.signed(s1) + T.signed(s2) + ' + \\cdots$, or type DNE if it has no sum.', a: { t: 'num', v: conv ? S2.toPlain() : 'DNE' },
        steps: ['$r = ' + qt(r2) + '$.', conv ? '$|r| < 1$, so $S = \\frac{' + a2 + '}{1 - ' + T.p(qt(r2)) + '} = ' + qt(S2) + '$.' : '$|r| \\ge 1$: the terms don\'t shrink, so the partial sums ' + (r2.sign() > 0 ? 'grow without bound' : 'swing wider and wider') + '. There is no sum. (Plugging into $\\frac{a}{1 - r}$ would give $' + qt(q(a2).div(Q(1).sub(r2))) + '$, which is meaningless here.)'],
        hint: 'Check $|r|$ before using the formula.' }; }
    if (kind === 'decimal') { var dg = R.pick([[3, 1], [7, 1], [27, 2], [45, 2], [12, 2], [81, 2], [36, 2], [123, 3]]), N = dg[0], L0 = dg[1], den = Math.pow(10, L0) - 1, fr = Q(N, den);
      var digits = String(N).padStart(L0, '0'), dec1 = '0.' + digits + digits + digits;
      return { q: 'Write the repeating decimal $0.\\overline{' + digits + '}$ (that is, $' + dec1 + '\\ldots$) as a fraction in lowest terms.', a: { t: 'num', v: fr.toPlain(), form: 'frac' },
        steps: ['$0.\\overline{' + digits + '} = \\frac{' + N + '}{' + Math.pow(10, L0) + '} + \\frac{' + N + '}{' + Math.pow(10, 2 * L0) + '} + \\cdots$, geometric with $a = \\frac{' + N + '}{' + Math.pow(10, L0) + '}$ and $r = \\frac{1}{' + Math.pow(10, L0) + '}$.', '$S = \\frac{a}{1 - r} = \\frac{' + N + '/' + Math.pow(10, L0) + '}{' + den + '/' + Math.pow(10, L0) + '} = \\frac{' + N + '}{' + den + '}$.', 'Reduce: $' + qt(fr) + '$.'], hint: 'Write the decimal as a sum: one block of digits at a time.' }; }
    var a4 = R.int(2, 9), r4 = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(-1, 2)]), S4 = q(a4).div(Q(1).sub(r4));
    return { q: 'Evaluate $\\sum_{k=1}^{\\infty} ' + a4 + '\\left(' + qt(r4) + '\\right)^{k-1}$.', a: { t: 'num', v: S4.toPlain() },
      steps: ['First term ($k = 1$): $' + a4 + '$. Ratio: $' + qt(r4) + '$, and $|r| < 1$.', '$S = \\frac{' + a4 + '}{1 - ' + T.p(qt(r4)) + '} = ' + qt(S4) + '$.'], hint: 'Read off $a$ and $r$, then use $\\frac{a}{1 - r}$.' };
  });

// ---- 99-tail.js
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
