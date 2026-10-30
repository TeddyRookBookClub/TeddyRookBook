/* Economics Ladder generators: Intermediate Microeconomics (course key imicro).
   One generator per topic in data/economics/topics/imicro.json, registered with MathLadder.gen.
   Built from the source parts in the course builder's work dir (gen/*.js, concatenated in order).

   Conventions (the economics overview): price on the vertical axis; inverse demand p(q) for monopoly and oligopoly;
   price elasticity ε is signed (negative for demand) and formulas use |ε|; payoffs list the row player first;
   Cobb-Douglas U = x^a y^b and Q = A K^α L^β; MRS = MUx/MUy and MRTS = MPL/MPK as positive numbers.
   Answers are exact (integers, terminating decimals or fractions) wherever the numbers allow; a fraction that does not
   terminate also accepts a decimal within 0.2%, and an irrational answer carries rtol. Money answers carry
   unit 'dollars'. Every problem also carries `chk`: the setup in machine-readable form, so the course's node test can
   recompute each answer by an independent route (numeric optimization, numeric integration, brute force). The runner
   ignores it. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, M = Math;
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
        var vis = tex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|bigg|Bigg|bigl|bigr|mathrm|operatorname|lvert|rvert|vec|hat)\b/g, '').replace(/\\(sin|cos|tan|ln|log|lim|exp|min|max)\b/g, 'xxx').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
        if (vis > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$';
        i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  // register a generator; long inline math in the question, steps and hint becomes display math
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var pr = fn(R, ctx);
      if (pr && typeof pr === 'object') {
        pr.q = wideMath(pr.q); if (Array.isArray(pr.steps)) pr.steps = pr.steps.map(function (x) { return wideMath(x); }); if (pr.hint) pr.hint = wideMath(pr.hint);
      }
      return pr;
    });
  }

  // ------------------------------------------------------------------ numbers
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  // a fraction n/d (d <= maxD) equal to x, or null
  function rat(x, maxD) { if (x instanceof Q) return x; if (!isFinite(x)) return null; x = fix(x); for (var d = 1; d <= (maxD || 1000); d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9 * M.max(1, M.abs(x))) return Q(n, d); } return null; }
  function decPlaces(q) { if (!q.isTerminating()) return 99; for (var k = 0; k < 12; k++) { if (q.mul(M.pow(10, k)).isInt()) return k; } return 99; }
  function sgf(x, n) { if (x === 0 || !isFinite(x)) return x; var e = M.floor(M.log10(M.abs(x))); var f = M.pow(10, n - 1 - e); return fix(M.round(x * f) / f); }
  function toNum(x) { return x instanceof Q ? x.toNumber() : +x; }
  // TeX for a computed number: whole numbers (commas from 10,000), short decimals, fractions, or 4 significant figures
  function nx(x, dp) {
    var q = rat(x);
    if (q) { if (q.isInt()) { var v = q.toNumber(); return M.abs(v) >= 10000 ? T.commas(v) : T.num(v); } if (decPlaces(q) <= (dp || 4)) return T.num(q.toDec(decPlaces(q)).replace(/(\.\d*?)0+$/, '$1')); return q.toTex(); }
    return T.num(sgf(toNum(x), 4));
  }
  // the same, as a decimal (rounded to dp places, trailing zeros dropped) when it is not exact
  function dx(x, dp) { var q = rat(x); if (q && decPlaces(q) <= (dp || 2)) return nx(q); var v = fix(M.round(toNum(x) * M.pow(10, dp || 2)) / M.pow(10, dp || 2)); return T.num(v); }
  function apx(x, dp) { var q = rat(x); if (q && decPlaces(q) <= (dp || 2)) return '= ' + nx(q); return '\\approx ' + dx(x, dp); }
  function money(x) { x = fix(toNum(x)); return T.money(x); }          // "\$12.50" (cents when needed)
  // a plain string for an answer spec value
  function av(x) {
    var q = rat(x);
    if (q) { if (q.isInt()) return q.toPlain(); var k = decPlaces(q); if (k <= 6) return q.toDec(k).replace(/(\.\d*?)0+$/, '$1'); return q.toPlain(); }
    return String(sgf(toNum(x), 6));
  }
  // a number answer: exact when rational (non-terminating fractions also take a decimal within 0.2%), else rtol
  function A(x, o) {
    o = o || {}; var q = o.rtol ? null : rat(x), a = { t: 'num', v: q ? av(x) : String(sgf(toNum(x), 6)) };
    if (o.rtol) a.rtol = o.rtol; else if (!q) a.rtol = 0.005; else if (decPlaces(q) > 4) { a.rtol = 0.002; var ax = M.abs(q.toNumber()); if (ax >= 1) a.tol = 0.006; else if (ax >= 0.1) a.tol = 0.0051; }  // a 2-decimal rounding is accepted for values from 0.1 up
    if (o.form) a.form = o.form;
    return a;
  }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function mcAll(choices, rightIdx) { return { t: 'mc', choices: choices, v: rightIdx.slice().sort() }; }
  function expr(v, vars) { return { t: 'expr', v: v, vars: vars }; }
  function multi(parts) { return { t: 'multi', parts: parts.map(function (p) { var o = { label: p[0], a: p[1] }; if (p[2]) o.unit = p[2]; return o; }) }; }
  // P(q, a, steps, hint, o): o = { unit, viz, chk }
  function P(q, a, steps, hint, o) {
    o = o || {}; var p = { q: q, a: a, steps: steps };
    if (hint) p.hint = hint;
    if (o.unit && a.t === 'num') p.unit = o.unit;
    if (o.viz) p.viz = o.viz;
    if (o.chk) p.chk = o.chk;
    if (o.nolint) p.nolint = o.nolint;
    return p;
  }
  // ------------------------------------------------------------------ TeX helpers
  function fr(a, b) { return '\\frac{' + a + '}{' + b + '}'; }
  function dfr(a, b) { return '\\dfrac{' + a + '}{' + b + '}'; }
  function sq(a) { return '\\sqrt{' + a + '}'; }
  function pn(x) { return toNum(x) < 0 ? '(' + nx(x) + ')' : nx(x); }   // a number ready to multiply into
  function cf(x) { x = toNum(x); return x === 1 ? '' : x === -1 ? '-' : nx(x); } // coefficient in front of a letter
  function expTex(e) { e = rat(e); return e.isInt() ? e.toPlain() : (e.sign() < 0 ? '-' : '') + M.abs(e.num()) + '/' + e.den(); }
  function pw(v, e) { e = rat(e) || e; if (e instanceof Q) { if (e.isInt() && e.toNumber() === 1) return v; if (e.isZero()) return ''; return v + '^{' + expTex(e) + '}'; } return v + '^{' + e + '}'; }
  function cq(q, v) { q = rat(q); return (q.eq(1) ? '' : q.eq(-1) ? '-' : q.toTex()) + v; } // a coefficient (exact) times a variable
  function cfq(q) { q = rat(q); if (q.isInt()) return cf(q.toNumber()); return (q.sign() < 0 ? '-' : '') + '\\tfrac{' + M.abs(q.num()) + '}{' + q.den() + '}'; } // a fraction coefficient
  function ppw(v, e) { e = rat(e); return e.toNumber() === 1 ? v : v + '^(' + e.toPlain() + ')'; } // plain-syntax power
  function poly(c, v) { return T.poly(c.map(function (x) { var r = rat(x); return r && !r.isInt() && decPlaces(r) > 4 ? r : fix(toNum(x)); }), v || 'q'); }
  function polyAt(c, x) { var s = 0; c.forEach(function (a) { s = s * x + a; }); return s; }
  function polyD(c) { var n = c.length - 1, r = []; for (var i = 0; i < n; i++) r.push(fix(c[i] * (n - i))); return r.length ? r : [0]; }
  function polyI(c) { var n = c.length - 1, r = []; for (var i = 0; i <= n; i++) r.push(fix(c[i] / (n - i + 1))); r.push(0); return r; }
  function gcd(a, b) { return U.gcd(a, b); }
  function pick(R, arr) { return R.pick(arr); }
  function words(n) { return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // a 2-player matrix as a TeX array (row player's payoff first)
  function matTeX(rows, cols, pay) {
    var s = '\\begin{array}{r|' + cols.map(function () { return 'c'; }).join('') + '} & ' + cols.map(function (c) { return '\\text{' + c + '}'; }).join(' & ') + ' \\\\ \\hline ';
    s += rows.map(function (r, i) { return '\\text{' + r + '} & ' + pay[i].map(function (c) { return '(' + c[0] + ',\\ ' + c[1] + ')'; }).join(' & '); }).join(' \\\\ ');
    return s + ' \\end{array}';
  }
  var PEOPLE = [['Ana', 'f'], ['Ben', 'm'], ['Chloe', 'f'], ['Dev', 'm'], ['Elena', 'f'], ['Femi', 'm'], ['Grace', 'f'], ['Hiro', 'm'], ['Iris', 'f'], ['Jamal', 'm'], ['Kara', 'f'], ['Luis', 'm'], ['Maya', 'f'], ['Nico', 'm'], ['Omar', 'm'], ['Priya', 'f'], ['Rosa', 'f'], ['Sam', 'm'], ['Tara', 'f'], ['Uma', 'f']];
  var NAMES = PEOPLE.map(function (p) { return p[0]; });
  // a person: String(who) is the name; who.she, who.her (possessive), who.him, who.She, who.Her
  function person(R, not) { var p; do { p = R.pick(PEOPLE); } while (not && String(not) === p[0]); var f = p[1] === 'f'; return { n: p[0], she: f ? 'she' : 'he', her: f ? 'her' : 'his', him: f ? 'her' : 'him', She: f ? 'She' : 'He', Her: f ? 'Her' : 'His', toString: function () { return p[0]; } }; }

  // exposed for the course's node tests
  ML.imicroHelpers = { rat: rat, av: av, nx: nx, A: A };

  // =================================================================== Unit 1: Preferences and Utility

  G('imicro.preferences', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['dom', 'chain', 'axiom', 'mix', 'dom'], ['dom', 'chain', 'axiom', 'mix', 'tf'], ['mix', 'axiom', 'dom', 'chain', 'tf']));
    var who = person(R), goods = R.pick([['apples', 'pears'], ['books', 'movies'], ['coffee', 'tea'], ['pizza slices', 'salads'], ['concert tickets', 'museum passes']]);
    if (kind === 'dom') {
      var a = [R.int(2, 9), R.int(2, 9)], b, dominated = ctx.level === 1 ? true : R.chance(0.6);
      if (dominated) { var d = R.pick([[1, 0], [0, 1], [1, 1]]); b = [a[0] + d[0] * R.int(1, 3), a[1] + d[1] * R.int(1, 3)]; if (R.coin()) { var t = a; a = b; b = t; } }
      else { var s = R.int(1, 3), u = R.int(1, 3); b = R.coin() ? [a[0] + s, a[1] - u] : [a[0] - s, a[1] + u]; if (b[0] < 0 || b[1] < 0) b = [a[0] + s, a[1] + u + 1], dominated = true; }
      var A0 = 'Bundle A', B0 = 'Bundle B', geA = a[0] >= b[0] && a[1] >= b[1], geB = b[0] >= a[0] && b[1] >= a[1];
      var right = geA ? 'Bundle A is preferred' : geB ? 'Bundle B is preferred' : 'More-is-better alone cannot rank them';
      var all = ['Bundle A is preferred', 'Bundle B is preferred', 'They must be equally good', 'More-is-better alone cannot rank them'];
      var steps = ['A = (' + a[0] + ', ' + a[1] + ') and B = (' + b[0] + ', ' + b[1] + '), with ' + goods[0] + ' first.'];
      if (geA || geB) { var big = geA ? 'A' : 'B', sm = geA ? 'B' : 'A'; steps.push('Bundle ' + big + ' has at least as much of both goods as ' + sm + ' and more of one.', 'When more is better, a bundle with more of something and less of nothing is preferred: ' + big + ' $\\succ$ ' + sm + '.'); }
      else steps.push('Each bundle has more of one good and less of the other.', 'More-is-better ranks only bundles where one has at least as much of everything. Here the answer depends on how ' + who + ' trades one good against the other, which only ' + who.her + ' indifference curves can tell.');
      return P(who + ' likes both ' + goods[0] + ' and ' + goods[1] + ', and more of either is better. Bundle A has ' + a[0] + ' ' + goods[0] + ' and ' + a[1] + ' ' + goods[1] + '; bundle B has ' + b[0] + ' ' + goods[0] + ' and ' + b[1] + ' ' + goods[1] + '. What does the more-is-better axiom tell us?',
        mc(right, all.filter(function (x) { return x !== right; })), steps, 'Compare the bundles good by good. Does one have at least as much of both?', { chk: { k: 'dom', a: a, b: b } });
    }
    if (kind === 'chain') {
      var rels = [['\\succ', 's'], ['\\sim', 'i'], ['\\succeq', 'w']];
      var r1 = R.pick(ctx.level === 1 ? rels.slice(0, 2) : rels), r2 = R.pick(ctx.level === 1 ? rels.slice(0, 2) : rels);
      if (r1[1] === 'w' && r2[1] === 'w') r2 = rels[0];
      var strict = r1[1] === 's' || r2[1] === 's', allI = r1[1] === 'i' && r2[1] === 'i';
      var ans = allI ? 'A and C are equally good' : strict ? 'A is preferred to C' : 'A is at least as good as C';
      var wrong = ans === 'A is at least as good as C' ? ['C is preferred to A', 'Nothing: A and C cannot be compared', 'A and C must be equally good'] : ['A is preferred to C', 'C is preferred to A', 'A and C are equally good', 'Nothing: A and C cannot be compared'].filter(function (x) { return x !== ans; });
      var said = function (r) { return r === 's' ? 'strictly preferred to' : r === 'i' ? 'just as good as' : 'at least as good as'; };
      var st = ['Transitivity chains the two comparisons: A is ' + said(r1[1]) + ' B, and B is ' + said(r2[1]) + ' C.'];
      st.push(allI ? 'Two links of indifference give indifference: A $\\sim$ C.' : strict ? 'At least one link is strict, so the chain is strict: A $\\succ$ C.' : 'A weak link and an indifference give a weak ranking: A $\\succeq$ C. (A could be strictly better, or just as good.)');
      return P('For ' + who + ', $\\text{A} ' + r1[0] + ' \\text{B}$ and $\\text{B} ' + r2[0] + ' \\text{C}$. If ' + who.her + ' preferences are rational, what must be true of A and C?',
        mc(ans, wrong), st,
        'Follow the chain from A through B to C. Is any link strict?', { chk: { k: 'chain', r: [r1[1], r2[1]] } });
    }
    if (kind === 'axiom') {
      var ax = R.pick(['transitivity', 'completeness', 'more-is-better', 'convexity']), stmt;
      var g = goods, n1 = R.int(3, 8), n2 = R.int(3, 8);
      if (ax === 'transitivity') stmt = who + ' prefers ' + g[0] + ' to ' + g[1] + ', ' + g[1] + ' to juice, and juice to ' + g[0] + '.';
      else if (ax === 'completeness') stmt = 'Asked about two bundles of ' + g[0] + ' and ' + g[1] + ', ' + who + ' says ' + who.she + ' can\u2019t rank them: ' + who.she + ' doesn\u2019t prefer either one and doesn\u2019t like them equally.';
      else if (ax === 'more-is-better') stmt = who + ' likes both goods, yet ' + who.she + ' ranks ' + n1 + ' ' + g[0] + ' with ' + n2 + ' ' + g[1] + ' below ' + n1 + ' ' + g[0] + ' with ' + (n2 - 1) + ' ' + g[1] + ', and ' + who.she + ' could throw the extra away for free.';
      else stmt = who + ' likes ' + (2 * n1) + ' ' + g[0] + ' alone and ' + (2 * n1) + ' ' + g[1] + ' alone equally, but ' + who.she + ' likes the mix of ' + n1 + ' of each less than either.';
      var why = { transitivity: 'The rankings go in a circle, so they can\u2019t all hold at once: that breaks transitivity.', completeness: 'Completeness asks only that any two bundles can be compared (one is preferred, or they are equally good). ' + who.She + ' can\u2019t compare these.', 'more-is-better': 'She likes both goods, and more of one with no less of the other is ranked lower: that breaks more-is-better (monotonicity).', convexity: 'Convexity (a taste for variety) says a mix of two equally good bundles is at least as good as either. ' + who.She + ' likes the mix less.' };
      return P('Which axiom of preferences does this break? ' + stmt, mc(cap(ax), ['Transitivity', 'Completeness', 'More-is-better', 'Convexity'].filter(function (x) { return x !== cap(ax); })),
        [why[ax], 'The other axioms say nothing against this statement, so the broken one is ' + ax + '.'], 'Is the problem a circle, a missing comparison, ranking more below less, or disliking a mix?', { chk: { k: 'axiom', ax: ax, stmt: stmt } });
    }
    if (kind === 'mix') {
      var A1 = [R.int(1, 5) * 2, R.int(5, 10) * 2], B1 = [A1[0] + R.int(2, 6) * 2, R.int(1, 4) * 2];
      var t = ctx.level === 1 ? Q(1, 2) : R.pick([Q(1, 2), Q(1, 2), Q(1, 4), Q(3, 4)]);
      if (!t.eq(Q(1, 2))) { A1 = [A1[0] * 2, A1[1] * 2]; B1 = [B1[0] * 2, B1[1] * 2]; }
      var mx = [t.mul(A1[0]).add(Q(1).sub(t).mul(B1[0])), t.mul(A1[1]).add(Q(1).sub(t).mul(B1[1]))];
      var tw = t.eq(Q(1, 2)) ? 'half of A and half of B' : 'a mix with weight $' + t.toTex() + '$ on A and $' + Q(1).sub(t).toTex() + '$ on B';
      return P(who + ' likes A = (' + A1[0] + ', ' + A1[1] + ') and B = (' + B1[0] + ', ' + B1[1] + ') equally (' + goods[0] + ', ' + goods[1] + '). With convex preferences, ' + who.she + ' likes ' + tw + ' at least as much as either. What bundle is that mix?',
        { t: 'tuple', v: [mx[0].toPlain(), mx[1].toPlain()] },
        ['Mix each good separately with the same weights.', goods[0] + ': $' + t.toTex() + '(' + A1[0] + ') + ' + Q(1).sub(t).toTex() + '(' + B1[0] + ') = ' + mx[0].toTex() + '$.', goods[1] + ': $' + t.toTex() + '(' + A1[1] + ') + ' + Q(1).sub(t).toTex() + '(' + B1[1] + ') = ' + mx[1].toTex() + '$.', 'The mix is $(' + mx[0].toTex() + ', ' + mx[1].toTex() + ')$, on the straight line between A and B.'],
        'Average the first coordinates and the second coordinates with the given weights.', { chk: { k: 'mix', A: A1, B: B1, t: t.toNumber() } });
    }
    var tfs = [['A person who would rather donate money to a food bank than buy a new phone can still have rational preferences.', true, 'The axioms ask only that rankings be complete and consistent. They say nothing about what a person should like, so generous tastes are fine.'],
      ['Rational preferences must be selfish: a rational person always ranks more money for herself above giving it away.', false, 'Nothing in completeness, transitivity, more-is-better or convexity says what a person must like. Caring about others is allowed.'],
      ['If someone prefers A to B and B to C, then rational preferences require that they prefer A to C.', true, 'That is transitivity: rankings must chain consistently.'],
      ['Completeness means a person must like every bundle at least a little.', false, 'Completeness only says any two bundles can be compared: one is preferred, or they are equally good.'],
      ['Preferences that rank healthy food above sweets are rational, and preferences that rank sweets above healthy food are not.', false, 'Rationality in economics is about consistency, not about which goods are wise to want.']];
    var f = R.pick(tfs);
    return P('True or false? ' + f[0], { t: 'tf', v: f[1] }, [f[2], f[1] ? 'True.' : 'False.'], 'The axioms are about consistency of rankings, not about the content of tastes.', { chk: { k: 'tf', v: f[1], s: f[0] } });
  });

  // utility families used in Unit 1 (plain strings for chk, TeX for questions)
  function cdU(a, b) { return { tex: 'U(x, y) = ' + pw('x', a) + pw('y', b), plain: ppw('x', a) + '*' + ppw('y', b), f: function (x, y) { return M.pow(x, toNum(a)) * M.pow(y, toNum(b)); } }; }

  G('imicro.indifference-curves', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['find', 'rank', 'find', 'tf'], ['find', 'rank', 'find', 'tf', 'lin'], ['find', 'rank', 'lin', 'find']));
    var who = person(R);
    if (kind === 'find') {
      var ex = R.pick(lv(ctx, [[1, 1]], [[1, 1], [2, 1], [1, 2]], [[2, 1], [1, 2], [2, 2]])), a = ex[0], b = ex[1], x0, y0, x1, k, y1;
      for (var tries = 0; tries < 200; tries++) { x0 = R.int(2, 8); y0 = R.int(2, 12); x1 = R.intNot(2, 12, x0); k = M.pow(x0, a) * M.pow(y0, b); var yy = M.pow(k / M.pow(x1, a), 1 / b); if (M.abs(yy - M.round(yy)) < 1e-9 && yy >= 1) { y1 = M.round(yy); break; } }
      if (y1 === undefined) { x0 = 4; y0 = 9; x1 = 6; a = 1; b = 1; k = 36; y1 = 6; }
      var Uf = cdU(a, b), pnum = function (n, e) { return e === 1 ? String(n) : n + '^{' + e + '}'; };
      var st = ['The curve through (' + x0 + ', ' + y0 + ') is every bundle with the same utility: $U = ' + pnum(x0, a) + '\\cdot ' + pnum(y0, b) + ' = ' + k + '$.',
        'Set $' + pnum(x1, a) + '\\cdot ' + pw('y', b) + ' = ' + k + '$ and solve for $y$.'];
      if (b === 1) st.push('$y = ' + fr(k, M.pow(x1, a)) + ' = ' + y1 + '$.'); else st.push('$y^{' + b + '} = ' + fr(k, M.pow(x1, a)) + ' = ' + M.pow(y1, b) + '$, so $y = ' + y1 + '$.');
      st.push('Check: $U(' + x1 + ', ' + y1 + ') = ' + k + '$, the same as at (' + x0 + ', ' + y0 + ').');
      return P(who + '\u2019s utility is $' + Uf.tex + '$. Bundle (' + x0 + ', ' + y0 + ') is on one of ' + who.her + ' indifference curves. What amount $y$ puts the bundle $(' + x1 + ', y)$ on the same curve?', A(y1),
        st, 'Find the utility of the first bundle, then keep it the same at the new x.', { chk: { k: 'icfind', a: a, b: b, p0: [x0, y0], x1: x1 } });
    }
    if (kind === 'rank') {
      var a2 = lv(ctx, 1, R.pick([1, 2]), R.pick([1, 2, 3])), b2 = lv(ctx, 1, R.pick([1, 2]), R.pick([1, 2]));
      var Uf2 = cdU(a2, b2), A1, B1, uA, uB;
      for (var t2 = 0; t2 < 100; t2++) { A1 = [R.int(1, 9), R.int(1, 9)]; B1 = [R.int(1, 9), R.int(1, 9)]; uA = Uf2.f(A1[0], A1[1]); uB = Uf2.f(B1[0], B1[1]); if ((A1[0] - B1[0]) * (A1[1] - B1[1]) < 0 && M.abs(uA - uB) / M.max(uA, uB) < 0.35) break; }
      var right = uA > uB ? 'A is on the higher curve' : uB > uA ? 'B is on the higher curve' : 'Both are on the same curve';
      return P('With $' + Uf2.tex + '$, bundle A = (' + A1[0] + ', ' + A1[1] + ') and bundle B = (' + B1[0] + ', ' + B1[1] + '). Which bundle lies on the higher indifference curve?',
        mc(right, ['A is on the higher curve', 'B is on the higher curve', 'Both are on the same curve', 'Neither: curves can only be compared when one bundle has more of both goods'].filter(function (x) { return x !== right; })),
        ['$U(A) = ' + nx(uA) + '$ and $U(B) = ' + nx(uB) + '$.', uA === uB ? 'Equal utilities: the same indifference curve.' : 'The higher number means the higher (preferred) curve: ' + right + '.', 'Neither bundle has more of both goods, yet the utility function still ranks them. A higher curve means "preferred," not "more of everything."'],
        'Compute the utility of each bundle.', { chk: { k: 'icrank', a: a2, b: b2, A: A1, B: B1 } });
    }
    if (kind === 'lin') {
      var c1 = R.int(1, 4), c2 = R.intNot(1, 4, c1), x0l = R.int(2, 10), y0l = R.int(2, 10), kk = c1 * x0l + c2 * y0l, x1l, y1l;
      for (var t3 = 0; t3 < 100; t3++) { x1l = R.intNot(0, 14, x0l); if ((kk - c1 * x1l) % c2 === 0 && kk - c1 * x1l >= 0) { y1l = (kk - c1 * x1l) / c2; break; } }
      if (y1l === undefined) { x1l = x0l + c2; y1l = y0l - c1; if (y1l < 0) { x1l = x0l - c2; y1l = y0l + c1; } }
      return P(who + ' sees the two goods as perfect substitutes: $U(x, y) = ' + T.lin(c1, 'x', 0) + ' + ' + T.mono(c2, 'y') + '$. Which $y$ puts $(' + x1l + ', y)$ on the same indifference curve as (' + x0l + ', ' + y0l + ')?',
        A(y1l), ['$U(' + x0l + ', ' + y0l + ') = ' + c1 + '(' + x0l + ') + ' + c2 + '(' + y0l + ') = ' + kk + '$.', 'Set $' + c1 + '(' + x1l + ') + ' + T.mono(c2, 'y') + ' = ' + kk + '$: $' + T.mono(c2, 'y') + ' = ' + (kk - c1 * x1l) + '$, so $y = ' + y1l + '$.', 'This indifference curve is a straight line with slope $-' + T.frac(c1, c2) + '$.'],
        'Keep $' + T.mono(c1, 'x') + ' + ' + T.mono(c2, 'y') + '$ at the same value.', { chk: { k: 'iclin', c: [c1, c2], p0: [x0l, y0l], x1: x1l } });
    }
    var tfs = [['Two indifference curves of the same person can cross if the person\u2019s tastes are unusual.', false, 'If two curves crossed, the crossing bundle would be equally good as bundles on both curves, and by transitivity a bundle with more of both goods would be no better than one with less. That breaks more-is-better, so curves of one person never cross.'],
      ['When more is better, an indifference curve slopes down.', true, 'To stay equally happy after getting more of one good, the person must give up some of the other.'],
      ['A bundle on a higher indifference curve must contain more of every good.', false, 'Higher means preferred. A bundle on a higher curve can have less of one good if it has enough more of the other.'],
      ['Every bundle lies on some indifference curve.', true, 'By completeness every bundle can be ranked, so each has a set of equally good bundles: its own curve.']];
    var f = R.pick(tfs);
    return P('True or false? ' + f[0], { t: 'tf', v: f[1] }, [f[2], f[1] ? 'True.' : 'False.'], 'Think about what the curves mean: bundles that are equally good.', { chk: { k: 'tf', v: f[1], s: f[0] } });
  });

  G('imicro.utility-functions', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['same', 'tf', 'level', 'best'], ['same', 'level', 'best', 'tf', 'same'], ['same', 'level', 'best', 'level']));
    var who = person(R);
    if (kind === 'same') {
      var a = R.pick([1, 2, 3]), b = R.pick([1, 2, 3]), Ut = pw('x', a) + pw('y', b);
      var good = R.pick([cf(a) + '\\ln x + ' + cf(b) + '\\ln y', '(' + Ut + ')^{2}', R.int(2, 5) + Ut + ' + ' + R.int(1, 9), '\\sqrt{' + Ut + '}']);
      var bad = R.shuffle(['-' + Ut, '\\dfrac{1}{' + Ut + '}', T.mono(a, 'x') + ' + ' + T.mono(b, 'y'), a === b ? pw('x', a) + pw('y', b + 1) : pw('x', b) + pw('y', a), '10 - ' + Ut]).slice(0, 3);
      return P('$U(x, y) = ' + Ut + '$ with $x, y > 0$. Which function describes exactly the same preferences?', mc('$V = ' + good + '$', bad.map(function (s) { return '$V = ' + s + '$'; })),
        ['Two utility functions describe the same preferences when one is an increasing function of the other: then they rank every pair of bundles the same way.', 'For positive values, $\\ln U$, $U^2$, $\\sqrt{U}$ and $kU + c$ with $k > 0$ are all increasing in $U$; here $V = ' + good + '$ is one of them.', '$-U$, $1/U$ and $10 - U$ reverse the ranking; changing the formula itself (a sum, or other exponents) changes which bundles are equally good.'],
        'Look for V = f(U) with f increasing.', { chk: { k: 'same', a: a, b: b, good: good, bad: bad } });
    }
    if (kind === 'level') {
      var k = R.int(2, 9) * (ctx.level === 1 ? 1 : R.pick([1, 2])), tr = R.pick(lv(ctx, ['sq', 'aff'], ['sq', 'aff', 'affsq'], ['affsq', 'cube', 'aff']));
      var m = R.int(2, 5), c = R.int(1, 9), val, tex, st;
      if (tr === 'sq') { val = k * k; tex = 'V = (xy)^{2}'; st = '$V = U^2 = ' + k + '^2 = ' + val + '$.'; }
      else if (tr === 'aff') { val = m * k + c; tex = 'V = ' + m + 'xy + ' + c; st = '$V = ' + m + 'U + ' + c + ' = ' + m + '(' + k + ') + ' + c + ' = ' + val + '$.'; }
      else if (tr === 'affsq') { val = m * k * k + c; tex = 'V = ' + m + '(xy)^{2} + ' + c; st = '$V = ' + m + 'U^2 + ' + c + ' = ' + m + '(' + (k * k) + ') + ' + c + ' = ' + val + '$.'; }
      else { val = k * k * k; tex = 'V = x^{3}y^{3}'; st = '$V = U^3 = ' + k + '^3 = ' + val + '$.'; }
      return P(who + '\u2019s preferences are described by $U(x, y) = xy$ and also by $' + tex + '$. The indifference curve $U = ' + k + '$ is which level curve of V?', A(val),
        ['On that curve every bundle has $xy = ' + k + '$.', st, 'Same curve, different label: an increasing transformation relabels the curves but keeps their shapes and their order.'],
        'Write V in terms of U = xy, then plug in U.', { chk: { k: 'level', tr: tr, kk: k, m: m, c: c } });
    }
    if (kind === 'best') {
      var B = [], U3 = function (p) { return p[0] * p[1]; };
      for (var t = 0; t < 200; t++) { B = [[R.int(1, 10), R.int(1, 10)], [R.int(1, 10), R.int(1, 10)], [R.int(1, 10), R.int(1, 10)]]; var us = B.map(U3).sort(function (p, q) { return q - p; }); if (us[0] !== us[1] && us[0] - us[2] < 12 && B.every(function (p) { return p[0] !== p[1] || true; })) break; }
      var Vt = R.pick(['\\ln x + \\ln y', '\\sqrt{xy}', '(xy)^{3}', '5xy - 2']), lab = ['A', 'B', 'C'], ui = B.map(U3), bi = ui.indexOf(M.max.apply(null, ui));
      return P('Bundles: A = (' + B[0].join(', ') + '), B = (' + B[1].join(', ') + '), C = (' + B[2].join(', ') + '). Using $V(x, y) = ' + Vt + '$, which bundle does the person like best?',
        mc('Bundle ' + lab[bi], lab.filter(function (l, i) { return i !== bi; }).map(function (l) { return 'Bundle ' + l; }).concat(['They are all equally good'])),
        ['$V$ is an increasing function of $xy$, so it ranks bundles exactly as $xy$ does.', 'Products: A: ' + ui[0] + ', B: ' + ui[1] + ', C: ' + ui[2] + '.', 'The largest is ' + lab[bi] + ', so V ranks bundle ' + lab[bi] + ' first.'],
        'Is V an increasing function of xy? Then compare xy.', { chk: { k: 'best', B: B, V: Vt } });
    }
    var tfs = [['If $U(A) = 20$ and $U(B) = 10$, the person likes A twice as much as B.', false, 'Utility numbers only rank bundles. $V = \\ln U$ gives the same ranking with values about 3.0 and 2.3, and there is no "twice."'],
      ['If $U$ describes someone\u2019s preferences, so does $V = 3U + 7$.', true, '$3U + 7$ is increasing in $U$, so it ranks every pair of bundles the same way.'],
      ['If $U$ describes someone\u2019s preferences, so does $V = -U$.', false, '$-U$ reverses every ranking: the best bundle becomes the worst.'],
      ['Two different utility functions can describe the same preferences.', true, 'Any increasing transformation of a utility function describes the same preferences.']];
    var f = R.pick(tfs);
    return P('True or false? ' + f[0], { t: 'tf', v: f[1] }, [f[2], f[1] ? 'True.' : 'False.'], 'Utility is ordinal: only the ranking matters.', { chk: { k: 'tf', v: f[1], s: f[0] } });
  });

  // a menu of utility functions with partial derivatives (plain strings for the CAS)
  function utilMenu(R, ctx) {
    var pick = R.pick(lv(ctx, ['cdhalf', 'cdint', 'ql'], ['cdhalf', 'cdint', 'ql', 'log', 'shift'], ['cdfrac', 'cdint', 'ql', 'log', 'shift']));
    var o;
    if (pick === 'cdhalf') o = { tex: 'x^{1/2}y^{1/2}', plain: 'x^(1/2)*y^(1/2)', ux: 'y^(1/2)/(2*x^(1/2))', uy: 'x^(1/2)/(2*y^(1/2))', uxTex: '\\tfrac{1}{2}x^{-1/2}y^{1/2}', uyTex: '\\tfrac{1}{2}x^{1/2}y^{-1/2}', sq: true, a: Q(1, 2), b: Q(1, 2), kind: 'cd' };
    else if (pick === 'cdint') { var a = R.int(1, 3), b = R.int(1, 3); if (a === 1 && b === 1) b = 2; o = { tex: pw('x', a) + pw('y', b), plain: ppw('x', a) + '*' + ppw('y', b), a: Q(a), b: Q(b), kind: 'cd' }; }
    else if (pick === 'cdfrac') { var fa = R.pick([[1, 3, 2, 3], [1, 4, 3, 4], [2, 3, 1, 3], [1, 2, 1, 4]]); o = { tex: 'x^{' + fa[0] + '/' + fa[1] + '}y^{' + fa[2] + '/' + fa[3] + '}', plain: 'x^(' + fa[0] + '/' + fa[1] + ')*y^(' + fa[2] + '/' + fa[3] + ')', a: Q(fa[0], fa[1]), b: Q(fa[2], fa[3]), kind: 'cd', roots: [fa[1], fa[3]] }; }
    else if (pick === 'ql') { var c = R.pick([2, 4, 6, 8]); o = { tex: c + '\\sqrt{x} + y', plain: c + '*sqrt(x)+y', c: c, kind: 'ql' }; }
    else if (pick === 'log') { var la = R.int(1, 4), lb = R.int(1, 4); o = { tex: (la > 1 ? la : '') + '\\ln x + ' + (lb > 1 ? lb : '') + '\\ln y', plain: la + '*ln(x)+' + lb + '*ln(y)', la: la, lb: lb, kind: 'log' }; }
    else { var s = R.int(1, 5); o = { tex: '(x + ' + s + ')y', plain: '(x+' + s + ')*y', s: s, kind: 'shift' }; }
    return o;
  }
  // a point where the menu's partials are nice
  function utilPoint(R, o) {
    if (o.kind === 'cd' && o.sq) return [R.pick([1, 4, 9, 16, 25]), R.pick([1, 4, 9, 16, 36])];
    if (o.kind === 'cd' && o.roots) { var r1 = o.roots[0], r2 = o.roots[1]; return [M.pow(R.int(1, 3), r1), M.pow(R.int(1, 3), r2)]; }
    if (o.kind === 'cd') return [R.int(1, 4), R.int(1, 4)];
    if (o.kind === 'ql') return [R.pick([1, 4, 9, 16, 25]), R.int(1, 20)];
    return [R.int(1, 9), R.int(1, 9)];
  }
  function muAt(o, wrt, x, y) { // exact partial derivative at (x, y) as a Q (or number)
    if (o.kind === 'cd') { var a = o.a, b = o.b, xa = rootPow(x, a), yb = rootPow(y, b); return wrt === 'x' ? a.mul(rootPow(x, a.sub(1))).mul(yb) : b.mul(xa).mul(rootPow(y, b.sub(1))); }
    if (o.kind === 'ql') return wrt === 'x' ? Q(o.c, 2).div(rootPow(x, Q(1, 2))) : Q(1);
    if (o.kind === 'log') return wrt === 'x' ? Q(o.la, x) : Q(o.lb, y);
    return wrt === 'x' ? Q(y) : Q(x + o.s);
  }
  // x^e for a rational e when the root is exact (else a float wrapped as Q via rat when possible)
  function rootPow(x, e) {
    e = Q.from(e); var n = e.num(), d = e.den(), r = M.round(M.pow(x, 1 / d));
    if (M.pow(r, d) === x) { var v = Q(r).pow(M.abs(n)); return n < 0 ? v.inv() : v; }
    return rat(M.pow(x, n / d)) || Q.from(fix(M.pow(x, n / d)));
  }
  function muTex(o, wrt) {
    if (o.kind === 'cd') { var a = o.a, b = o.b; if (wrt === 'x') return (cfq(a) + pw('x', a.sub(1)) + pw('y', b)) || '1'; return (cfq(b) + pw('x', a) + pw('y', b.sub(1))) || '1'; }
    if (o.kind === 'ql') return wrt === 'x' ? dfr(o.c / 2, '\\sqrt{x}') : '1';
    if (o.kind === 'log') return wrt === 'x' ? dfr(o.la, 'x') : dfr(o.lb, 'y');
    return wrt === 'x' ? 'y' : 'x + ' + o.s;
  }
  function muPlain(o, wrt) {
    if (o.kind === 'cd') {
      var term = function (c, ex, ey) { var parts = []; if (!c.eq(1)) parts.push(c.toPlain().indexOf('/') >= 0 ? '(' + c.toPlain() + ')' : c.toPlain()); [['x', ex], ['y', ey]].forEach(function (v) { if (v[1].isZero()) return; parts.push(v[1].eq(1) ? v[0] : v[0] + '^(' + v[1].toPlain() + ')'); }); return parts.join('*') || '1'; };
      return wrt === 'x' ? term(o.a, o.a.sub(1), o.b) : term(o.b, o.a, o.b.sub(1));
    }
    if (o.kind === 'ql') return wrt === 'x' ? (o.c / 2) + '/sqrt(x)' : '1';
    if (o.kind === 'log') return wrt === 'x' ? o.la + '/x' : o.lb + '/y';
    return wrt === 'x' ? 'y' : 'x+' + o.s;
  }

  G('imicro.marginal-utility-calculus', function (R, ctx) {
    var o = utilMenu(R, ctx), kind = R.pick(lv(ctx, ['at', 'at', 'expr'], ['at', 'expr', 'at', 'dim'], ['expr', 'at', 'dim', 'at']));
    var who = person(R), wrt = R.pick(['x', 'x', 'y']);
    if (kind === 'at') {
      var pt = utilPoint(R, o), v = muAt(o, wrt, pt[0], pt[1]);
      return P(who + '\u2019s utility is $U(x, y) = ' + o.tex + '$. Find the marginal utility of ' + wrt + ', $MU_' + wrt + ' = \\partial U/\\partial ' + wrt + '$, at $(x, y) = (' + pt[0] + ', ' + pt[1] + ')$.', A(v),
        ['Hold ' + (wrt === 'x' ? 'y' : 'x') + ' fixed and differentiate with respect to ' + wrt + ': $MU_' + wrt + ' = ' + muTex(o, wrt) + '$.', 'Substitute $x = ' + pt[0] + '$, $y = ' + pt[1] + '$: $MU_' + wrt + ' = ' + nx(v) + '$.', 'Meaning: a small extra amount $\\Delta ' + wrt + '$ raises utility by about $' + nx(v) + '\\,\\Delta ' + wrt + '$.'],
        'Treat the other good as a constant number.', { chk: { k: 'mu', U: o.plain, wrt: wrt, at: pt } });
    }
    if (kind === 'expr') {
      return P(who + '\u2019s utility is $U(x, y) = ' + o.tex + '$. Find $MU_' + wrt + ' = \\partial U/\\partial ' + wrt + '$ as an expression in $x$ and $y$.', expr(muPlain(o, wrt), ['x', 'y']),
        ['Treat ' + (wrt === 'x' ? 'y' : 'x') + ' as a constant.', 'Differentiate the ' + wrt + ' part by the power, log or sum rules.', '$MU_' + wrt + ' = ' + muTex(o, wrt) + '$.'],
        'Only the ' + wrt + ' terms change; the other good rides along as a constant factor or drops out as a constant term.', { chk: { k: 'muexpr', U: o.plain, wrt: wrt } });
    }
    // diminishing marginal utility of x?
    var dim, why;
    if (o.kind === 'cd') { dim = o.a.lt(1); why = '$\\partial^2 U/\\partial x^2 = ' + cf(o.a.mul(o.a.sub(1))) + pw('x', o.a.sub(2)) + pw('y', o.b) + '$, which is ' + (dim ? 'negative' : o.a.eq(1) ? 'zero' : 'positive') + ' for $x, y > 0$ (the exponent of x is ' + o.a.toTex().replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') + ').'; }
    else if (o.kind === 'ql') { dim = true; why = '$MU_x = ' + dfr(o.c / 2, '\\sqrt{x}') + '$ falls as x grows.'; }
    else if (o.kind === 'log') { dim = true; why = '$MU_x = ' + dfr(o.la, 'x') + '$ falls as x grows.'; }
    else { dim = false; why = '$MU_x = y$ does not depend on x at all, so it stays constant as x grows (with y fixed).'; }
    var ansT = dim ? 'Yes: MUx falls as x rises' : (o.kind === 'cd' && o.a.gt(1)) ? 'No: MUx rises as x rises' : 'No: MUx stays the same as x rises';
    return P('$U(x, y) = ' + o.tex + '$ with $x, y > 0$. Holding y fixed, does the marginal utility of x diminish as x rises?',
      mc(ansT, ['Yes: MUx falls as x rises', 'No: MUx rises as x rises', 'No: MUx stays the same as x rises', 'It depends on whether y is above or below x'].filter(function (s) { return s !== ansT; })),
      ['Find $MU_x = ' + muTex(o, 'x') + '$ and see how it changes with x (the sign of $\\partial^2 U/\\partial x^2$).', why, ansT + '.'],
      'Differentiate MUx once more with respect to x.', { chk: { k: 'dim', U: o.plain, ans: ansT } });
  });

  G('imicro.mrs', function (R, ctx) {
    var o = utilMenu(R, ctx), kind = R.pick(lv(ctx, ['at', 'at', 'give'], ['at', 'expr', 'slope', 'give'], ['expr', 'at', 'slope', 'give']));
    var who = person(R), pt = utilPoint(R, o);
    var mux = muAt(o, 'x', pt[0], pt[1]), muy = muAt(o, 'y', pt[0], pt[1]), mrs = Q.from(mux).div(Q.from(muy));
    if (o.kind === 'cd' && !rat(mrs.toNumber())) { pt = [4, 4]; mux = muAt(o, 'x', 4, 4); muy = muAt(o, 'y', 4, 4); mrs = Q.from(mux).div(Q.from(muy)); }
    var rr = o.kind === 'cd' ? o.a.div(o.b) : o.kind === 'log' ? Q(o.la, o.lb) : null;
    var rTex = function (top, bot) { return rr.isInt() ? (rr.eq(1) ? dfr(top, bot) : dfr(rr.toPlain() + top, bot)) : dfr(cf(rr.num()) + top, cf(rr.den()) + bot); };
    var mrsTex = o.kind === 'cd' || o.kind === 'log' ? rTex('y', 'x') : o.kind === 'ql' ? dfr(o.c / 2, '\\sqrt{x}') : dfr('y', 'x + ' + o.s);
    var mrsPlain = o.kind === 'cd' || o.kind === 'log' ? (rr.num() === 1 ? 'y' : rr.num() + '*y') + '/' + (rr.den() === 1 ? 'x' : '(' + rr.den() + '*x)') : o.kind === 'ql' ? (o.c / 2) + '/sqrt(x)' : 'y/(x+' + o.s + ')';
    var base = ['$MU_x = ' + muTex(o, 'x') + '$ and $MU_y = ' + muTex(o, 'y') + '$.', '$MRS = \\dfrac{MU_x}{MU_y} = ' + mrsTex + '$.'];
    var chk = { k: 'mrs', U: o.plain, at: pt };
    if (kind === 'expr') return P('For $U(x, y) = ' + o.tex + '$, find the marginal rate of substitution $MRS = MU_x/MU_y$ as an expression in $x$ and $y$ (simplify).', expr(mrsPlain, ['x', 'y']),
      base.concat(['Common factors cancel; that is why the MRS is often simpler than either marginal utility.']), 'Divide MUx by MUy and cancel.', { chk: { k: 'mrsexpr', U: o.plain } });
    var at = '$MRS = ' + nx(mrs) + '$ at (' + pt[0] + ', ' + pt[1] + ').';
    if (kind === 'at') return P(who + '\u2019s utility is $U(x, y) = ' + o.tex + '$. What is ' + who.her + ' marginal rate of substitution $MRS = MU_x/MU_y$ at the bundle (' + pt[0] + ', ' + pt[1] + ')?', A(mrs),
      base.concat(['Substitute: ' + at]), 'MRS is MUx over MUy (x on top), both at the same bundle.', { chk: chk });
    if (kind === 'slope') return P('$U(x, y) = ' + o.tex + '$. What is the slope $dy/dx$ of the indifference curve through (' + pt[0] + ', ' + pt[1] + ') at that point?', A(mrs.neg()),
      ['Along the curve $U(x, y) = k$, implicit differentiation gives $MU_x + MU_y\\,\\dfrac{dy}{dx} = 0$, so $\\dfrac{dy}{dx} = -\\dfrac{MU_x}{MU_y} = -MRS$.'].concat(base).concat([at, 'Slope $= ' + nx(mrs.neg()) + '$: the curve falls as x grows.']), 'The slope is minus the MRS.', { chk: { k: 'slope', U: o.plain, at: pt } });
    return P(who + '\u2019s utility is $U(x, y) = ' + o.tex + '$ and ' + who.she + ' has the bundle (' + pt[0] + ', ' + pt[1] + '). About how many units of y would ' + who.she + ' give up for one more small unit of x, and stay equally well off? (Use the MRS.)', A(mrs),
      base.concat([at, who.She + ' would trade about $' + nx(mrs) + '$ units of y for one more unit of x. (For a whole unit this is an approximation, because the MRS changes as ' + who.she + ' moves along a curved indifference curve.)']), 'That rate is the MRS: MUx/MUy.', { chk: chk });
  });

  G('imicro.preference-types', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['subs', 'comp', 'id'], ['subs', 'comp', 'ql', 'id'], ['comp', 'ql', 'id', 'subs']));
    var who = person(R);
    if (kind === 'subs') {
      var a = R.int(1, 6), b = R.intNot(1, 6, a), pt = [R.int(1, 12), R.int(1, 12)], mrs = Q(a, b);
      return P(who + ' sees two brands of sparkling water as perfect substitutes: $U(x, y) = ' + T.mono(a, 'x') + ' + ' + T.mono(b, 'y') + '$. What is ' + who.her + ' MRS at the bundle (' + pt[0] + ', ' + pt[1] + ')?', A(mrs),
        ['$MU_x = ' + a + '$ and $MU_y = ' + b + '$, constants.', '$MRS = ' + fr(a, b) + ' = ' + nx(mrs) + '$ at every bundle; the bundle does not matter.', who.Her + ' indifference curves are straight lines with slope $-' + fr(a, b) + '$.'],
        'For a linear utility the marginal utilities are the coefficients.', { chk: { k: 'mrs', U: a + '*x+' + b + '*y', at: pt } });
    }
    if (kind === 'comp') {
      var c1 = R.int(1, 4), c2 = R.intNot(1, 4, c1), m = c1 * c2 * R.int(1, 4) * (ctx.level === 1 ? 1 : R.pick([1, 2]));
      var goods = R.pick([['left shoes', 'right shoes'], ['bike frames', 'wheels'], ['pancakes', 'scoops of butter'], ['cups of coffee', 'creamers']]);
      return P(who + '\u2019s utility is $U(x, y) = \\min\\{' + T.mono(c1, 'x') + ', ' + T.mono(c2, 'y') + '\\}$ (x = ' + goods[0] + ', y = ' + goods[1] + '). Where is the corner of ' + who.her + ' indifference curve $U = ' + m + '$? Give the bundle $(x, y)$.', { t: 'tuple', v: [String(m / c1), String(m / c2)] },
        ['The corner is where neither good is left over: $' + T.mono(c1, 'x') + ' = ' + T.mono(c2, 'y') + ' = ' + m + '$.', '$x = ' + (c1 === 1 ? m : m + '/' + c1 + ' = ' + (m / c1)) + '$ and $y = ' + (c2 === 1 ? m : m + '/' + c2 + ' = ' + (m / c2)) + '$.', 'Adding more of only one good from there leaves the minimum, and so utility, unchanged: the curve is L-shaped.'],
        'At the corner the two terms inside the min are equal.', { chk: { k: 'comp', c: [c1, c2], m: m } });
    }
    if (kind === 'ql') {
      var c = R.pick([2, 4, 6, 8]), x = R.pick([1, 4, 9, 16, 25, 36]), y1 = R.int(1, 30), mr = Q(c / 2).div(M.sqrt(x));
      return P('$U(x, y) = ' + c + '\\sqrt{x} + y$ (quasilinear). Find the MRS at (' + x + ', ' + y1 + '). (Then think: what is it at (' + x + ', ' + (y1 + R.int(5, 20)) + ')?)', A(mr),
        ['$MU_x = ' + dfr(c / 2, '\\sqrt{x}') + '$ and $MU_y = 1$.', '$MRS = ' + dfr(c / 2, '\\sqrt{x}') + ' = ' + dfr(c / 2, M.sqrt(x)) + ' = ' + nx(mr) + '$.', 'The MRS depends on x only, so it is the same at every y: the indifference curves are vertical shifts of one another.'],
        'With quasilinear utility the MRS is $v\'(x)$.', { chk: { k: 'mrs', U: c + '*sqrt(x)+y', at: [x, y1] } });
    }
    var types = [['a straight line with the same slope everywhere', 'Perfect substitutes, like $U = 2x + y$'], ['an L shape with a corner where the goods are in fixed proportion', 'Perfect complements, like $U = \\min\\{x, 2y\\}$'], ['a smooth curve bowed toward the origin whose MRS is $(a/b)(y/x)$', 'Cobb-Douglas, like $U = x^a y^b$'], ['a smooth curve whose MRS depends only on x, so each curve is a vertical shift of the next', 'Quasilinear, like $U = v(x) + y$']];
    var ti = R.int(0, 3);
    return P('An indifference curve is ' + types[ti][0] + '. Which kind of preferences gives it?', mc(types[ti][1], types.filter(function (t, i) { return i !== ti; }).map(function (t) { return t[1]; })),
      ['Substitutes: constant MRS, straight lines. Complements: fixed proportions, L shapes. Cobb-Douglas: $MRS = (a/b)(y/x)$. Quasilinear: $MRS = v\'(x)$.', 'So the answer is: ' + types[ti][1] + '.'],
      'Match the shape to the MRS of each family.', { chk: { k: 'ptype', i: ti, ans: types[ti][1] } });
  });

  // =================================================================== Unit 2: Consumer Choice

  var GOODS2 = [['books', 'concert tickets'], ['cups of coffee', 'sandwiches'], ['bus rides', 'movies'], ['apples', 'loaves of bread'], ['gym visits', 'meals out'], ['notebooks', 'pens']];

  G('imicro.budget-set', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['int', 'slope', 'afford', 'int'], ['rotate', 'afford', 'tax', 'slope', 'ration'], ['tax', 'kink', 'rotate', 'ration', 'double']));
    var who = person(R), g = R.pick(GOODS2), p1 = R.int(2, 8), p2 = R.intNot(2, 8, p1), m = p1 * p2 * R.int(2, 6);
    var bud = '$' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + ' \\le ' + m + '$';
    var intro = who + ' has ' + money(m) + ' to spend on ' + g[0] + ' ($x$, ' + money(p1) + ' each) and ' + g[1] + ' ($y$, ' + money(p2) + ' each).';
    if (kind === 'int') {
      var onX = R.coin(), v = onX ? m / p1 : m / p2;
      return P(intro + ' What is the most ' + (onX ? g[0] : g[1]) + ' ' + who.she + ' can buy?', A(v),
        ['The budget set is ' + bud + '.', 'Spend everything on ' + (onX ? g[0] : g[1]) + ': ' + (onX ? '$x = ' + m + '/' + p1 + ' = ' + nx(v) + '$' : '$y = ' + m + '/' + p2 + ' = ' + nx(v) + '$') + '.', 'That is the ' + (onX ? 'horizontal' : 'vertical') + ' intercept of the budget line.'],
        'Spend all the money on that one good.', { unit: onX ? g[0] : g[1], chk: { k: 'bint', p: [p1, p2], m: m, good: onX ? 0 : 1 } });
    }
    if (kind === 'slope') {
      var s = Q(p1, p2), oc = R.coin();
      if (oc) return P(intro + ' What is the opportunity cost of one more unit of ' + g[0] + ', measured in ' + g[1] + '?', A(s),
        ['One unit of $x$ costs ' + money(p1) + '; that money would buy $' + p1 + '/' + p2 + ' = ' + nx(s) + '$ units of $y$.', 'That is the size of the budget line’s slope, $p_1/p_2$.'], 'Divide the price of x by the price of y.', { unit: 'units', chk: { k: 'bslope', p: [p1, p2], m: m, abs: true } });
      return P(intro + ' With $x$ on the horizontal axis, what is the slope of ' + who.her + ' budget line?', A(s.neg()),
        ['The line is $' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + ' = ' + m + '$, so $y = ' + fr(m, p2) + ' - ' + fr(p1, p2) + 'x$.', 'Slope $= -p_1/p_2 = -' + fr(p1, p2) + ' = ' + nx(s.neg()) + '$.'], 'Solve the budget equation for y.', { chk: { k: 'bslope', p: [p1, p2], m: m } });
    }
    if (kind === 'afford') {
      var bx = R.int(1, M.floor(m / p1)), by = R.int(0, M.floor(m / p2)), cost = p1 * bx + p2 * by, left = m - cost;
      if (ctx.level === 1 && left < 0) { by = M.floor((m - p1 * bx) / p2); cost = p1 * bx + p2 * by; left = m - cost; }
      return P(intro + ' Bundle $(' + bx + ', ' + by + ')$: how much money is left over after buying it? (Enter a negative number if it costs more than ' + who.she + ' has.)', A(left),
        ['Cost: $' + p1 + '(' + bx + ') + ' + p2 + '(' + by + ') = ' + cost + '$.', 'Left over: $' + m + ' - ' + cost + ' = ' + left + '$.', left > 0 ? 'Positive: the bundle is inside the budget set, below the line.' : left === 0 ? 'Zero: the bundle is on the budget line.' : 'Negative: the bundle costs more than her income, outside the budget set.'],
        'Price times quantity for each good, then subtract from income.', { unit: 'dollars', chk: { k: 'bleft', p: [p1, p2], m: m, b: [bx, by] } });
    }
    if (kind === 'rotate') {
      var np = R.intNot(1, 12, p1); while (m % np) np = R.intNot(1, 12, p1);
      var ask = R.pick(['x', 'y']), v2 = ask === 'x' ? m / np : m / p2;
      return P(intro + ' The price of ' + g[0] + ' changes to ' + money(np) + '. What is the new ' + (ask === 'x' ? 'horizontal ($x$)' : 'vertical ($y$)') + ' intercept of the budget line?', A(v2),
        ['The new line is $' + T.mono(np, 'x') + ' + ' + T.mono(p2, 'y') + ' = ' + m + '$.', ask === 'x' ? 'Horizontal intercept: $' + m + '/' + np + ' = ' + nx(v2) + '$.' : 'Vertical intercept: $' + m + '/' + p2 + ' = ' + nx(v2) + '$, unchanged, because the price of $y$ did not change.', 'A change in one price rotates the line around the intercept on the other good’s axis; it does not shift it in parallel.'],
        'Only the intercept on the axis of the good whose price changed moves.', { unit: ask === 'x' ? g[0] : g[1], chk: { k: 'bint', p: [np, p2], m: m, good: ask === 'x' ? 0 : 1 } });
    }
    if (kind === 'tax') {
      var t = R.int(1, 4), mm = (p1 + t) * p2 * R.int(2, 5), v3 = mm / (p1 + t);
      return P(who + ' has ' + money(mm) + ' for ' + g[0] + ' ($x$, ' + money(p1) + ' each before tax) and ' + g[1] + ' ($y$, ' + money(p2) + ' each). A tax of ' + money(t) + ' per unit is added to the price of ' + g[0] + '. What is the most ' + g[0] + ' ' + who.she + ' can buy now?', A(v3),
        ['With the tax, each unit of $x$ costs $' + p1 + ' + ' + t + ' = ' + (p1 + t) + '$ dollars.', 'Budget: $' + T.mono(p1 + t, 'x') + ' + ' + T.mono(p2, 'y') + ' \\le ' + mm + '$.', 'Most $x$: $' + mm + '/' + (p1 + t) + ' = ' + nx(v3) + '$. The line pivots inward around the $y$-intercept, which stays at $' + nx(mm / p2) + '$.'],
        'A per-unit tax acts like a higher price for that good.', { unit: g[0], chk: { k: 'bint', p: [p1 + t, p2], m: mm, good: 0 } });
    }
    if (kind === 'ration') {
      var r = R.int(2, M.max(2, m / p1 - 2)), ask2 = R.pick(['x', 'ylim']);
      if (ask2 === 'x') return P(intro + ' The store limits each customer to ' + r + ' ' + g[0] + '. What is the most ' + g[0] + ' ' + who.she + ' can buy?', A(M.min(r, m / p1)),
        ['Money alone allows $' + m + '/' + p1 + ' = ' + nx(m / p1) + '$.', 'The limit allows ' + r + '.', 'The tighter one binds: ' + nx(M.min(r, m / p1)) + '. The budget set loses the part to the right of $x = ' + r + '$.'], 'Both the money and the limit must be satisfied.', { unit: g[0], chk: { k: 'bration', p: [p1, p2], m: m, r: r } });
      var yl = (m - p1 * r) / p2;
      return P(intro + ' The store limits each customer to ' + r + ' ' + g[0] + '. If ' + who.she + ' buys the limit of ' + r + ', how many ' + g[1] + ' can ' + who.she + ' still afford?', A(yl),
        ['Spending on $x$: $' + p1 + '(' + r + ') = ' + (p1 * r) + '$.', 'Left for $y$: $' + m + ' - ' + (p1 * r) + ' = ' + (m - p1 * r) + '$, which buys $' + (m - p1 * r) + '/' + p2 + ' = ' + nx(yl) + '$.', 'This is the corner where the budget line meets the vertical cut at $x = ' + r + '$.'], 'Spend on the limit first, then see what remains.', { unit: g[1], chk: { k: 'bleftq', p: [p1, p2], m: m, x: r } });
    }
    if (kind === 'kink') {
      var k = R.int(2, 6), p1b = p1 + R.int(1, 3) * (R.coin() ? 1 : -1); if (p1b < 1) p1b = p1 + 2;
      var mm2 = p1 * k + p1b * R.int(2, 8), xm = k + (mm2 - p1 * k) / p1b;
      return P(who + ' has ' + money(mm2) + '. Each of the first ' + k + ' ' + g[0] + ' costs ' + money(p1) + '; every one after that costs ' + money(p1b) + '. What is the most ' + g[0] + ' ' + who.she + ' can buy?', A(xm),
        ['The first ' + k + ' cost $' + p1 + '(' + k + ') = ' + (p1 * k) + '$.', 'That leaves $' + mm2 + ' - ' + (p1 * k) + ' = ' + (mm2 - p1 * k) + '$ for more at ' + money(p1b) + ' each: $' + (mm2 - p1 * k) + '/' + p1b + ' = ' + nx((mm2 - p1 * k) / p1b) + '$ more.', 'Total: $' + k + ' + ' + nx((mm2 - p1 * k) / p1b) + ' = ' + nx(xm) + '$. The budget line has a kink at $x = ' + k + '$ where its slope changes.'],
        'Pay for the first block at the first price, then use what is left at the second price.', { unit: g[0], chk: { k: 'bkink', p1: p1, p1b: p1b, kq: k, m: mm2 } });
    }
    var f = R.int(2, 5);
    return P(intro + ' Then all prices and ' + who.her + ' income are multiplied by ' + f + '. What is the most ' + g[0] + ' ' + who.she + ' can buy now?', A(m / p1),
      ['New line: $' + (f * p1) + 'x + ' + (f * p2) + 'y = ' + (f * m) + '$.', 'Divide every term by ' + f + ': $' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + ' = ' + m + '$, the same line as before.', 'So the most ' + g[0] + ' is still $' + m + '/' + p1 + ' = ' + nx(m / p1) + '$. Only relative prices and real income shape the budget set.'],
      'What happens to the budget equation if every term is multiplied by the same number?', { unit: g[0], chk: { k: 'bint', p: [f * p1, f * p2], m: f * m, good: 0 } });
  });

  // ---------- utility menus for choice problems (all with interior optima by construction)
  // returns { tex, plain, x, y } with the optimum for prices p1, p2 and income m
  G('imicro.optimal-choice', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['cd', 'cd', 'which'], ['cd', 'shift', 'ql', 'which'], ['shift', 'ql', 'cd', 'cdlog']));
    var who = person(R), g = R.pick(GOODS2), p1, p2, m, x, y, U, Up, st;
    if (kind === 'which') {
      var pa = R.int(2, 6), pb = R.intNot(2, 6, pa), mrs = rat(pa / pb).add(R.pick([Q(1, 2), Q(1), Q(-1, 2), Q(1, 4), Q(-1, 4)]).mul(rat(pa / pb)));
      var dir = mrs.gt(Q(pa, pb)) ? 'Buy more x and less y' : 'Buy more y and less x';
      return P(who + ' is spending all of ' + who.her + ' income on $x$ (price ' + money(pa) + ') and $y$ (price ' + money(pb) + '). At ' + who.her + ' current bundle ' + who.her + ' MRS is $' + mrs.toTex() + '$. What should ' + who.she + ' do?',
        mc(dir, ['Buy more x and less y', 'Buy more y and less x', 'Stay put: this is the best bundle', 'Spend less in total'].filter(function (c) { return c !== dir; })),
        ['The price ratio is $p_1/p_2 = ' + fr(pa, pb) + ' = ' + Q(pa, pb).toTex() + '$: the market trades one $x$ for $' + Q(pa, pb).toTex() + '$ units of $y$.', 'Her MRS, $' + mrs.toTex() + '$, is what one more $x$ is worth to her in $y$.', mrs.gt(Q(pa, pb)) ? 'She values $x$ more than it costs, so trading $y$ for $x$ along the budget line raises her utility.' : 'She values $x$ less than it costs, so trading $x$ for $y$ raises her utility.', dir + ', until the MRS equals the price ratio.'],
        'Compare what x is worth to her (MRS) with what it costs in y (p1/p2).', { chk: { k: 'which', mrs: mrs.toNumber(), p: [pa, pb] } });
    }
    if (kind === 'cd' || kind === 'cdlog') {
      var a = R.int(1, 4), b = R.int(1, 4); if (a === b && ctx.level > 1) b = a + 1;
      p1 = R.int(1, 8); p2 = R.int(1, 8); m = (a + b) * p1 * p2 * R.int(1, 6) * (ctx.level === 1 ? 1 : R.pick([1, 2]));
      x = a * m / ((a + b) * p1); y = b * m / ((a + b) * p2);
      U = kind === 'cd' ? pw('x', a) + pw('y', b) : cf(a) + '\\ln x + ' + cf(b) + '\\ln y'; Up = kind === 'cd' ? 'x^' + a + '*y^' + b : a + '*ln(x)+' + b + '*ln(y)';
      st = ['$MU_x = ' + (kind === 'cd' ? cf(a) + pw('x', a - 1) + pw('y', b) : dfr(a, 'x')) + '$ and $MU_y = ' + (kind === 'cd' ? cf(b) + pw('x', a) + pw('y', b - 1) : dfr(b, 'y')) + '$, so $MRS = ' + dfr(cf(a) + 'y', cf(b) + 'x') + '$.',
        'Tangency: $' + dfr(cf(a) + 'y', cf(b) + 'x') + ' = ' + fr(p1, p2) + '$, so $' + T.mono(a * p2, 'y') + ' = ' + T.mono(b * p1, 'x') + '$, or $y = ' + (Q(b * p1, a * p2).eq(1) ? '' : Q(b * p1, a * p2).toTex()) + 'x$.',
        'Substitute into the budget $' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + ' = ' + m + '$: $' + T.mono(p1, 'x') + ' + ' + T.mono(Q(b * p1, a), 'x') + ' = ' + m + '$, so $' + T.mono(Q((a + b) * p1, a), 'x') + ' = ' + m + '$ and $x = ' + nx(x) + '$.',
        'Then $y = ' + nx(y) + '$. Check: $' + p1 + '(' + nx(x) + ') + ' + p2 + '(' + nx(y) + ') = ' + m + '$.'];
    } else if (kind === 'shift') {
      var s = R.int(1, 6); p1 = R.int(1, 6); p2 = R.int(1, 6); x = R.int(2, 12); m = p1 * (2 * x + s); y = (m + p1 * s) / (2 * p2);
      U = '(x + ' + s + ')y'; Up = '(x+' + s + ')*y';
      st = ['$MU_x = y$ and $MU_y = x + ' + s + '$, so $MRS = ' + dfr('y', 'x + ' + s) + '$.', 'Tangency: $' + dfr('y', 'x + ' + s) + ' = ' + fr(p1, p2) + '$, so $' + T.mono(p2, 'y') + ' = ' + T.mono(p1, 'x') + ' + ' + (p1 * s) + '$.',
        'Substitute $' + T.mono(p2, 'y') + '$ into the budget: $' + T.mono(p1, 'x') + ' + ' + T.mono(p1, 'x') + ' + ' + (p1 * s) + ' = ' + m + '$, so $' + T.mono(2 * p1, 'x') + ' = ' + (m - p1 * s) + '$ and $x = ' + nx(x) + '$.',
        'Then $' + T.mono(p2, 'y') + ' = ' + (m - p1 * x) + '$, so $y = ' + nx(y) + '$. Both are positive, so this interior tangency is the best bundle.'];
    } else {
      var c = R.pick([2, 4, 6, 8, 12]); p1 = R.int(1, 4); p2 = R.int(1, 4); var sx = rat(c * p2 / (2 * p1)); if (!sx.isInt()) { p2 = 2 * p1; sx = Q(c); }
      x = sx.toNumber() * sx.toNumber(); m = p1 * x + p2 * R.int(2, 20); y = (m - p1 * x) / p2;
      U = c + '\\sqrt{x} + y'; Up = c + '*sqrt(x)+y';
      st = ['$MU_x = ' + dfr(c / 2, '\\sqrt{x}') + '$ and $MU_y = 1$, so $MRS = ' + dfr(c / 2, '\\sqrt{x}') + '$.', 'Tangency: $' + dfr(c / 2, '\\sqrt{x}') + ' = ' + fr(p1, p2) + '$, so $\\sqrt{x} = ' + fr(c / 2 * p2, p1) + ' = ' + nx(sx) + '$ and $x = ' + nx(x) + '$.',
        'Income does not enter: with quasilinear utility the demand for $x$ is set by prices alone (as long as income covers it).', 'The rest buys $y$: $y = (' + m + ' - ' + p1 + '\\cdot ' + nx(x) + ')/' + p2 + ' = ' + nx(y) + '$, which is positive, so the tangency is the best bundle.'];
    }
    var askY = ctx.level > 1 && R.chance(0.35);
    return P(who + '’s utility is $U(x, y) = ' + U + '$, where $x$ is ' + g[0] + ' at ' + money(p1) + ' and $y$ is ' + g[1] + ' at ' + money(p2) + '. ' + who.She + ' has ' + money(m) + '. How many ' + (askY ? g[1] : g[0]) + ' does ' + who.she + ' buy at ' + who.her + ' best affordable bundle?', A(askY ? y : x),
      st.concat(askY ? ['The question asks for $y$: ' + nx(y) + '.'] : []), 'Set MRS = p1/p2 to get a relation between y and x, then substitute it into the budget.', { unit: askY ? g[1] : g[0], chk: { k: 'opt', U: Up, p: [p1, p2], m: m, ask: askY ? 'y' : 'x' } });
  });

  G('imicro.cobb-douglas-demand', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['qty', 'share', 'qty'], ['qty', 'share', 'cross', 'expr'], ['expr', 'cross', 'spend', 'qty']));
    var who = person(R), g = R.pick(GOODS2), a = R.int(1, 4), b = R.int(1, 4); if (a === b) b = a + 1;
    var p1 = R.int(1, 10), p2 = R.int(1, 10), m = (a + b) * R.int(2, 12) * 10, sh = Q(a, a + b), x = sh.mul(m).div(p1), y = Q(b, a + b).mul(m).div(p2);
    var U = pw('x', a) + pw('y', b), Up = 'x^' + a + '*y^' + b;
    var rule = ['With $U = x^a y^b$ the best bundle spends the share $\\dfrac{a}{a + b}$ of income on $x$ and $\\dfrac{b}{a + b}$ on $y$.', 'Here $a = ' + a + '$ and $b = ' + b + '$: the share for $x$ is $' + sh.toTex() + '$.'];
    if (kind === 'qty') return P(who + '’s utility is $U = ' + U + '$. ' + who.She + ' has ' + money(m) + ', and ' + g[0] + ' ($x$) cost ' + money(p1) + ' each (' + g[1] + ' cost ' + money(p2) + '). How many ' + g[0] + ' does ' + who.she + ' buy?', A(x),
      rule.concat(['Spending on $x$: $' + sh.toTex() + ' \\times ' + m + ' = ' + nx(sh.mul(m)) + '$ dollars.', '$x^* = ' + nx(sh.mul(m)) + '/' + p1 + ' = ' + nx(x) + '$.']), 'Find the income share a/(a + b), then divide that spending by the price.', { unit: g[0], chk: { k: 'opt', U: Up, p: [p1, p2], m: m, ask: 'x' } });
    if (kind === 'share') return P('With $U = ' + U + '$, what fraction of income does the consumer spend on $x$, whatever the prices and income?', A(sh),
      ['Demand: $x^* = \\dfrac{a}{a + b}\\cdot\\dfrac{m}{p_1}$, so spending on $x$ is $p_1 x^* = \\dfrac{a}{a + b}m$.', 'Share: $\\dfrac{' + a + '}{' + a + ' + ' + b + '} = ' + sh.toTex() + '$.'], 'Spending on x is p1 times x*.', { chk: { k: 'share', U: Up } });
    if (kind === 'cross') {
      var np2 = R.intNot(1, 12, p2);
      return P(who + '’s utility is $U = ' + U + '$ and ' + who.she + ' has ' + money(m) + '. Good $x$ costs ' + money(p1) + '. The price of good $y$ changes from ' + money(p2) + ' to ' + money(np2) + '. How many units of $x$ does ' + who.she + ' buy after the change?', A(x),
        rule.concat(['$x^* = ' + sh.toTex() + '\\cdot\\dfrac{' + m + '}{' + p1 + '} = ' + nx(x) + '$, and the price of $y$ is not in this formula.', 'So $x^*$ stays at ' + nx(x) + '. With Cobb-Douglas utility the two effects of $p_2$ on $x$ cancel exactly: spending on $x$ is a fixed share of income.']),
        'Does p2 appear in the Cobb-Douglas demand for x?', { unit: 'units', chk: { k: 'opt', U: Up, p: [p1, np2], m: m, ask: 'x' } });
    }
    if (kind === 'spend') return P('With $U = ' + U + '$ and income ' + money(m) + ', how many dollars does the consumer spend on $y$ (price ' + money(p2) + ')?', A(Q(b, a + b).mul(m)),
      ['The share of income spent on $y$ is $\\dfrac{b}{a + b} = ' + Q(b, a + b).toTex() + '$.', 'Spending: $' + Q(b, a + b).toTex() + ' \\times ' + m + ' = ' + nx(Q(b, a + b).mul(m)) + '$ dollars, whatever $p_2$ is.'], 'The share for y is b/(a + b).', { unit: 'dollars', chk: { k: 'spendy', U: Up, p: [R.int(1, 9), p2], m: m } });
    return P('$U(x, y) = ' + U + '$. Write the demand for $x$ as a function of income $m$ and its price $p$.', expr(sh.eq(1) ? 'm/p' : sh.num() + '*m/(' + sh.den() + '*p)', ['m', 'p']),
      ['Tangency: $\\dfrac{' + cf(a) + 'y}{' + cf(b) + 'x} = \\dfrac{p}{p_2}$, so $p_2 y = ' + Q(b, a).toTex().replace(/^1$/, '') + '\\,p\\,x$.', 'Budget: $px + p_2 y = m$ becomes $px\\left(1 + ' + Q(b, a).toTex() + '\\right) = m$.', '$x = ' + sh.toTex() + '\\cdot\\dfrac{m}{p}$.'],
      'Spending px is a fixed share of m.', { chk: { k: 'cdexpr', a: a, b: b } });
  });

  G('imicro.corner-solutions', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['subs', 'comp', 'subs'], ['subs', 'comp', 'tie', 'comp'], ['subs', 'comp', 'qlcorner', 'tie']));
    var who = person(R);
    if (kind === 'subs' || kind === 'tie') {
      var a = R.int(1, 5), b = R.int(1, 5), p1 = R.int(1, 8), p2 = R.int(1, 8);
      if (kind === 'tie') { p1 = a * R.int(1, 3); p2 = b * (p1 / a); } else { var guard = 0; while (a * p2 === b * p1 && guard++ < 20) { p2 = R.int(1, 8); } if (a * p2 === b * p1) p2 = p2 + 1; }
      var m = p1 * p2 * R.int(2, 8), xr = a / p1, yr = b / p2;
      if (kind === 'tie') {
        var ans = 'Any bundle on the budget line is best';
        return P(who + ' sees $x$ and $y$ as perfect substitutes: $U = ' + T.mono(a, 'x') + ' + ' + T.mono(b, 'y') + '$. Prices are $p_1 = ' + p1 + '$ and $p_2 = ' + p2 + '$, and income is ' + money(m) + '. Which bundle is best?',
          mc(ans, ['Only $x$: $x = ' + (m / p1) + '$', 'Only $y$: $y = ' + (m / p2) + '$', 'Half the money on each good']),
          ['Utility per dollar: $x$ gives $' + a + '/' + p1 + ' = ' + nx(xr) + '$, $y$ gives $' + b + '/' + p2 + ' = ' + nx(yr) + '$.', 'They are equal, so every dollar buys the same utility either way.', 'Every bundle on the budget line gives the same utility: the budget line lies along an indifference curve.'],
          'Compare utility per dollar.', { chk: { k: 'subsmc', a: a, b: b, p: [p1, p2], m: m } });
      }
      var askX = R.coin(), xs = xr > yr ? m / p1 : 0, ys = xr > yr ? 0 : m / p2;
      return P(who + ' sees $x$ and $y$ as perfect substitutes: $U = ' + T.mono(a, 'x') + ' + ' + T.mono(b, 'y') + '$. With $p_1 = ' + p1 + '$, $p_2 = ' + p2 + '$ and income ' + money(m) + ', how many units of ' + (askX ? '$x$' : '$y$') + ' does ' + who.she + ' buy?', A(askX ? xs : ys),
        ['Utility per dollar: $x$ gives $' + a + '/' + p1 + ' = ' + nx(xr) + '$, $y$ gives $' + b + '/' + p2 + ' = ' + nx(yr) + '$.', 'Every dollar does more on ' + (xr > yr ? '$x$' : '$y$') + ', so ' + who.she + ' spends all ' + money(m) + ' there: ' + (xr > yr ? '$x = ' + m + '/' + p1 + ' = ' + nx(m / p1) + '$, $y = 0$.' : '$y = ' + m + '/' + p2 + ' = ' + nx(m / p2) + '$, $x = 0$.'), 'A corner solution: $MRS = ' + fr(a, b) + '$ never equals $p_1/p_2 = ' + fr(p1, p2) + '$, so there is no tangency to find.', 'The answer for ' + (askX ? '$x$' : '$y$') + ' is ' + nx(askX ? xs : ys) + '.'],
        'Which good gives more utility per dollar?', { unit: 'units', chk: { k: 'opt', U: a + '*x+' + b + '*y', p: [p1, p2], m: m, ask: askX ? 'x' : 'y' } });
    }
    if (kind === 'comp') {
      var c1 = R.int(1, 3), c2 = R.int(1, 3), q1 = R.int(1, 6), q2 = R.int(1, 6), k = c1 * c2 * R.int(1, 5);
      var xx = k / c1, yy = k / c2, mm = q1 * xx + q2 * yy;
      if (!Number.isInteger(mm)) { xx = k; yy = k; }
      var ask = R.pick(['x', 'y']);
      return P(who + '’s utility is $U = \\min\\{' + T.mono(c1, 'x') + ', ' + T.mono(c2, 'y') + '\\}$ (perfect complements). Prices are $p_1 = ' + q1 + '$ and $p_2 = ' + q2 + '$, and income is ' + money(mm) + '. How many units of $' + ask + '$ does ' + who.she + ' buy?', A(ask === 'x' ? xx : yy),
        ['No money is wasted on unmatched units, so the best bundle sits at a corner: $' + T.mono(c1, 'x') + ' = ' + T.mono(c2, 'y') + '$, or $y = ' + (Q(c1, c2).eq(1) ? '' : Q(c1, c2).toTex()) + 'x$.', 'Budget: $' + T.mono(q1, 'x') + ' + ' + T.mono(q2, 'y') + ' = ' + mm + '$ with $y = ' + (Q(c1, c2).eq(1) ? '' : Q(c1, c2).toTex()) + 'x$: $\\left(' + q1 + ' + ' + Q(q2 * c1, c2).toTex() + '\\right)x = ' + mm + '$.', '$x = ' + nx(xx) + '$ and $y = ' + nx(yy) + '$.', 'The MRS is not defined at the corner, so the tangency rule does not apply; the corner of the L is the answer.'],
        'Buy the goods in the fixed proportion where c1·x = c2·y.', { unit: 'units', chk: { k: 'opt', U: 'min(' + c1 + '*x,' + c2 + '*y)', p: [q1, q2], m: mm, ask: ask } });
    }
    var c = R.pick([4, 6, 8]), p1q = 1, p2q = R.pick([2, 3, 4]), xint = M.pow(c * p2q / 2, 2), mq = R.int(4, 9) * (xint > 40 ? 4 : 2);
    if (mq >= xint) mq = M.floor(xint / 2);
    return P(who + '’s utility is $U = ' + c + '\\sqrt{x} + y$, with $p_1 = ' + p1q + '$, $p_2 = ' + p2q + '$ and income ' + money(mq) + '. How many units of $x$ does ' + who.she + ' buy?', A(mq / p1q),
      ['Tangency would need $MRS = ' + dfr(c / 2, '\\sqrt{x}') + ' = ' + fr(p1q, p2q) + '$, so $x = ' + xint + '$.', 'That would cost $' + xint + '$, more than the income of ' + mq + ': it would need a negative amount of $y$.', 'At every affordable bundle $MRS > p_1/p_2$: she always wants more $x$. So she spends everything on $x$: $x = ' + mq + '$, $y = 0$.', 'A corner solution: check that a tangency is affordable with nonnegative amounts before you trust it.'],
      'Is the tangency bundle affordable with y ≥ 0?', { unit: 'units', chk: { k: 'opt', U: c + '*sqrt(x)+y', p: [p1q, p2q], m: mq, ask: 'x' } });
  });

  G('imicro.lagrange-consumer', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['loglam', 'interp', 'cdlam'], ['loglam', 'cdlam', 'interp', 'qllam', 'count'], ['cdlam', 'qllam', 'loglam', 'interp']));
    var who = person(R);
    if (kind === 'loglam') {
      var a = R.int(1, 4), b = R.int(1, 4), p1 = R.int(1, 6), p2 = R.int(1, 6), m = (a + b) * R.pick([10, 20, 30, 40, 50, 60]), lam = Q(a + b, m);
      return P(who + ' maximizes $U = ' + cf(a) + '\\ln x + ' + cf(b) + '\\ln y$ subject to $' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + ' = ' + m + '$. Use the Lagrange method. What is the multiplier $\\lambda$ at the optimum?', A(lam),
        ['$\\mathcal{L} = ' + cf(a) + '\\ln x + ' + cf(b) + '\\ln y - \\lambda(' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + ' - ' + m + ')$.', 'First-order conditions: $' + dfr(a, 'x') + ' = ' + cf(p1) + '\\lambda$ and $' + dfr(b, 'y') + ' = ' + cf(p2) + '\\lambda$, so $' + T.mono(p1, 'x') + ' = ' + dfr(a, '\\lambda') + '$ and $' + T.mono(p2, 'y') + ' = ' + dfr(b, '\\lambda') + '$.',
          'Add them and use the budget: $' + dfr(a + b, '\\lambda') + ' = ' + m + '$, so $\\lambda = ' + fr(a + b, m) + ' = ' + nx(lam) + '$.', 'Then $x = ' + nx(Q(a * m, (a + b) * p1)) + '$ and $y = ' + nx(Q(b * m, (a + b) * p2)) + '$. $\\lambda$ is the marginal utility of income: one more dollar raises utility by about ' + nx(lam) + '.'],
        'Solve each first-order condition for spending on that good, then add.', { chk: { k: 'lam', U: a + '*ln(x)+' + b + '*ln(y)', p: [p1, p2], m: m } });
    }
    if (kind === 'cdlam') {
      var p1c = R.int(1, 5), p2c = R.int(1, 5), mc0 = 2 * p1c * p2c * R.int(2, 6), xc = mc0 / (2 * p1c), yc = mc0 / (2 * p2c), lc = Q(mc0, 2 * p1c * p2c);
      return P('Maximize $U = xy$ subject to $' + T.mono(p1c, 'x') + ' + ' + T.mono(p2c, 'y') + ' = ' + mc0 + '$ with the Lagrange method. What is $\\lambda$ at the optimum?', A(lc),
        ['$\\mathcal{L} = xy - \\lambda(' + T.mono(p1c, 'x') + ' + ' + T.mono(p2c, 'y') + ' - ' + mc0 + ')$.', 'FOCs: $y = ' + cf(p1c) + '\\lambda$, $x = ' + cf(p2c) + '\\lambda$, and the budget.', 'Substitute into the budget: $' + p1c + '(' + cf(p2c) + '\\lambda) + ' + p2c + '(' + cf(p1c) + '\\lambda) = ' + mc0 + '$, so $' + (2 * p1c * p2c) + '\\lambda = ' + mc0 + '$ and $\\lambda = ' + nx(lc) + '$.',
          'So $x = ' + nx(xc) + '$ and $y = ' + nx(yc) + '$. Check: $\\lambda = MU_x/p_1 = ' + nx(yc) + '/' + p1c + ' = ' + nx(lc) + '$.'],
        'Write x and y in terms of λ, then use the budget.', { chk: { k: 'lam', U: 'x*y', p: [p1c, p2c], m: mc0 } });
    }
    if (kind === 'qllam') {
      var c = R.pick([4, 6, 8]), p2q = R.int(2, 5), p1q = R.int(1, 3), xq = M.pow(c * p2q / (2 * p1q), 2), mq = M.ceil(p1q * xq) + p2q * R.int(3, 10);
      if (!Number.isInteger(xq)) { p1q = 1; xq = M.pow(c * p2q / 2, 2); mq = xq + p2q * R.int(3, 10); }
      return P('Maximize $U = ' + c + '\\sqrt{x} + y$ subject to $' + T.mono(p1q, 'x') + ' + ' + T.mono(p2q, 'y') + ' = ' + mq + '$ (the optimum is interior). What is the Lagrange multiplier $\\lambda$?', A(Q(1, p2q)),
        ['FOC for $y$: $MU_y = 1 = ' + p2q + '\\lambda$, so $\\lambda = ' + fr(1, p2q) + '$.', 'FOC for $x$: $' + dfr(c / 2, '\\sqrt{x}') + ' = ' + cf(p1q) + '\\lambda$ gives $x = ' + nx(xq) + '$; the rest of the income goes to $y$.', 'With quasilinear utility an extra dollar is spent on $y$, so it adds $MU_y/p_2 = ' + fr(1, p2q) + '$ to utility: that is $\\lambda$.'],
        'Look at the first-order condition for y.', { chk: { k: 'lam', U: c + '*sqrt(x)+y', p: [p1q, p2q], m: mq } });
    }
    if (kind === 'interp') {
      var l0 = R.pick([Q(1, 4), Q(1, 2), Q(3, 4), Q(2), Q(3, 2), Q(1, 5)]), dm = R.pick([2, 4, 8, 10, 20]), du = l0.mul(dm);
      return P('At ' + who + '’s optimum the Lagrange multiplier is $\\lambda = ' + l0.toTex() + '$ (utility per dollar). About how much does ' + who.her + ' maximum utility rise if ' + who.her + ' income rises by ' + money(dm) + '?', A(du),
        ['$\\lambda$ is the marginal utility of income: $\\dfrac{dU^*}{dm} = \\lambda$.', 'For a small change, $\\Delta U^* \\approx \\lambda\\,\\Delta m = ' + l0.toTex() + ' \\times ' + dm + ' = ' + nx(du) + '$.'],
        'Multiply λ by the change in income.', { chk: { k: 'interp', l: l0.toNumber(), dm: dm } });
    }
    var ans = '3 equations in 3 unknowns';
    return P('You maximize $U(x, y)$ subject to $p_1x + p_2y = m$ with $\\mathcal{L} = U - \\lambda(p_1x + p_2y - m)$. How many equations and unknowns does the system of first-order conditions have?',
      mc(ans, ['2 equations in 2 unknowns', '2 equations in 3 unknowns', '3 equations in 2 unknowns']),
      ['Unknowns: $x$, $y$ and $\\lambda$.', 'Equations: $\\partial\\mathcal{L}/\\partial x = 0$, $\\partial\\mathcal{L}/\\partial y = 0$, and $\\partial\\mathcal{L}/\\partial\\lambda = 0$, which is the budget constraint itself.', 'Dropping the budget leaves 2 equations in 3 unknowns, which cannot pin down the bundle.'],
      'Count λ as an unknown, and the budget as an equation.', { chk: { k: 'const', text: ans } });
  });

  G('imicro.expenditure-minimization', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['xy', 'xyE', 'comp'], ['xy', 'xyE', 'comp', 'cd'], ['cd', 'xyE', 'dual', 'comp']));
    var who = person(R);
    if (kind === 'xy' || kind === 'xyE') {
      var p1 = R.int(1, 6), p2 = R.int(1, 6), h = p2 * R.int(1, 4), y = h * p1 / p2, u = h * y, E = p1 * h + p2 * y;
      var st = ['Minimize $' + T.mono(p1, 'x') + ' + ' + T.mono(p2, 'y') + '$ subject to $xy = ' + u + '$.', 'Tangency is the same as for maximizing: $MRS = \\dfrac{y}{x} = ' + fr(p1, p2) + '$, so $y = ' + (Q(p1, p2).eq(1) ? '' : Q(p1, p2).toTex()) + 'x$.',
        'On the target curve: $x \\cdot ' + (Q(p1, p2).eq(1) ? '' : Q(p1, p2).toTex()) + 'x = ' + u + '$, so $x^2 = ' + nx(u * p2 / p1) + '$ and $x = ' + h + '$; then $y = ' + nx(y) + '$.'];
      if (kind === 'xy') return P(who + '’s utility is $U = xy$. Prices are $p_1 = ' + p1 + '$ and $p_2 = ' + p2 + '$. What is the cheapest way to reach utility ' + u + '? Give $x$, the compensated (Hicksian) demand for good 1.', A(h), st, 'Use MRS = p1/p2 together with the target xy = ū (not a budget).', { unit: 'units', chk: { k: 'emin', U: 'x*y', p: [p1, p2], u: u, ask: 'x' } });
      return P(who + '’s utility is $U = xy$, with $p_1 = ' + p1 + '$ and $p_2 = ' + p2 + '$. What is the least money that reaches utility ' + u + '?', A(E),
        st.concat(['Spending: $' + p1 + '(' + h + ') + ' + p2 + '(' + nx(y) + ') = ' + nx(E) + '$ dollars. This is the expenditure function $E(p_1, p_2, \\bar u) = 2\\sqrt{p_1 p_2 \\bar u}$ evaluated here.']), 'Find the cheapest bundle on the target curve, then price it.', { unit: 'dollars', chk: { k: 'emin', U: 'x*y', p: [p1, p2], u: u, ask: 'E' } });
    }
    if (kind === 'comp') {
      var c1 = R.int(1, 3), c2 = R.int(1, 3), q1 = R.int(1, 6), q2 = R.int(1, 6), uu = c1 * c2 * R.int(2, 6), Ec = q1 * uu / c1 + q2 * uu / c2;
      return P('$U = \\min\\{' + T.mono(c1, 'x') + ', ' + T.mono(c2, 'y') + '\\}$, $p_1 = ' + q1 + '$, $p_2 = ' + q2 + '$. What is the least money needed to reach utility ' + uu + '?', A(Ec),
        ['Any unmatched units are wasted, so the cheapest bundle is the corner: $' + T.mono(c1, 'x') + ' = ' + T.mono(c2, 'y') + ' = ' + uu + '$.', '$x = ' + nx(uu / c1) + '$, $y = ' + nx(uu / c2) + '$.', 'Cost: $' + q1 + '(' + nx(uu / c1) + ') + ' + q2 + '(' + nx(uu / c2) + ') = ' + nx(Ec) + '$ dollars.'],
        'At the corner both terms of the min equal the target.', { unit: 'dollars', chk: { k: 'emin', U: 'min(' + c1 + '*x,' + c2 + '*y)', p: [q1, q2], u: uu, ask: 'E' } });
    }
    if (kind === 'cd') {
      var a = 2, b = 1, q1c = R.int(1, 4), q2c = 2 * q1c * R.int(1, 2) / 2, x0 = R.int(2, 6); q2c = q1c * R.pick([1, 2]);
      var yr = Q(b * q1c, a * q2c), y0 = yr.mul(x0); if (!y0.isInt()) { x0 = x0 * y0.den(); y0 = yr.mul(x0); }
      var uc = x0 * x0 * y0.toNumber(), Ec2 = q1c * x0 + q2c * y0.toNumber();
      return P('$U = x^{2}y$, $p_1 = ' + q1c + '$, $p_2 = ' + q2c + '$. Find the cheapest bundle that reaches $U = ' + uc + '$ and give the amount of $x$ in it.', A(x0),
        ['$MRS = \\dfrac{2xy}{x^2} = \\dfrac{2y}{x}$. Set it equal to $' + fr(q1c, q2c) + '$: $y = ' + (yr.eq(1) ? '' : yr.toTex()) + 'x$.', 'On the target curve: $x^2\\cdot ' + (yr.eq(1) ? '' : yr.toTex()) + 'x = ' + uc + '$, so $x^3 = ' + nx(Q(uc).div(yr)) + '$ and $x = ' + x0 + '$.', 'Then $y = ' + nx(y0) + '$, and the least spending is $' + q1c + '(' + x0 + ') + ' + q2c + '(' + nx(y0) + ') = ' + Ec2 + '$.'],
        'Tangency first (MRS = p1/p2), then put the relation into U = ū.', { unit: 'units', chk: { k: 'emin', U: 'x^2*y', p: [q1c, q2c], u: uc, ask: 'x' } });
    }
    var m = R.int(4, 20) * 10, ans = money(m);
    return P('At prices $(p_1, p_2)$, a consumer with income ' + money(m) + ' maximizes utility and reaches level $U^*$. What is the least money that reaches $U^*$ at the same prices?', A(m),
      ['If a cheaper bundle reached $U^*$, the consumer could buy it and have money left to buy more of something, reaching a higher utility with income ' + money(m) + '. That would contradict $U^*$ being the maximum.', 'So $E(p, U^*) = m$: the most utility a budget buys and the least money a utility level costs describe the same tangency from two sides (duality). Answer: ' + ans + '.'],
      'Could a cheaper bundle reach the same utility?', { unit: 'dollars', chk: { k: 'dual', m: m } });
  });

  G('imicro.revealed-preference', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['cost', 'verdict'], ['verdict', 'cost', 'verdict'], ['verdict', 'verdict', 'cost']));
    var who = person(R), P1, P2, A1, B1, m1, m2, cBA, cAB, tries = 0, want = R.pick(['viol', 'ok', 'ok2', 'none']);
    do {
      P1 = [R.int(1, 6), R.int(1, 6)]; P2 = [R.int(1, 6), R.int(1, 6)]; A1 = [R.int(1, 10), R.int(1, 10)]; B1 = [R.int(1, 10), R.int(1, 10)];
      m1 = P1[0] * A1[0] + P1[1] * A1[1]; m2 = P2[0] * B1[0] + P2[1] * B1[1]; cBA = P1[0] * B1[0] + P1[1] * B1[1]; cAB = P2[0] * A1[0] + P2[1] * A1[1];
      var rA = cBA <= m1 && (A1[0] !== B1[0] || A1[1] !== B1[1]), rB = cAB <= m2 && (A1[0] !== B1[0] || A1[1] !== B1[1]);
      var got = rA && rB ? 'viol' : rA ? 'ok' : rB ? 'ok2' : 'none';
      tries++;
    } while ((got !== want || cBA === m1 || cAB === m2) && tries < 4000);
    var setup = 'At prices $(' + P1.join(', ') + ')$, ' + who + ' chose bundle A = (' + A1.join(', ') + '). At prices $(' + P2.join(', ') + ')$, ' + who.she + ' chose bundle B = (' + B1.join(', ') + '). (Each time ' + who.she + ' spent all ' + who.her + ' money.)';
    var st = ['First situation: A cost $' + P1[0] + '(' + A1[0] + ') + ' + P1[1] + '(' + A1[1] + ') = ' + m1 + '$. B would have cost $' + P1[0] + '(' + B1[0] + ') + ' + P1[1] + '(' + B1[1] + ') = ' + cBA + '$, ' + (cBA <= m1 ? 'which was affordable, so A is revealed preferred to B.' : 'which was not affordable, so this choice reveals nothing about A versus B.'),
      'Second situation: B cost $' + m2 + '$. A would have cost $' + P2[0] + '(' + A1[0] + ') + ' + P2[1] + '(' + A1[1] + ') = ' + cAB + '$, ' + (cAB <= m2 ? 'which was affordable, so B is revealed preferred to A.' : 'which was not affordable, so this choice reveals nothing about B versus A.')];
    if (kind === 'cost') return P(setup + ' What would bundle B have cost at the first prices?', A(cBA), [st[0], 'Compare that cost with what ' + who.she + ' spent the first time (' + m1 + '): ' + (cBA <= m1 ? 'B was affordable when A was chosen.' : 'B was out of reach then.')], 'Price B with the first situation’s prices.', { unit: 'dollars', chk: { k: 'rpcost', P1: P1, B: B1 } });
    var lab = { viol: 'Each is revealed preferred to the other: the choices break the weak axiom', ok: 'A is revealed preferred to B, and the choices are consistent', ok2: 'B is revealed preferred to A, and the choices are consistent', none: 'Neither is revealed preferred to the other; the choices are consistent' };
    var gotK = (cBA <= m1 ? 1 : 0) + (cAB <= m2 ? 2 : 0), key2 = ['none', 'ok', 'ok2', 'viol'][gotK];
    return P(setup + ' What do these choices reveal?', mc(lab[key2], Object.keys(lab).filter(function (k) { return k !== key2; }).map(function (k) { return lab[k]; })),
      st.concat([key2 === 'viol' ? 'A was chosen when B was affordable, and B was chosen when A was affordable. With A and B different, no consistent preferences produce both choices: a violation of the weak axiom of revealed preference.' : 'No pair of choices contradicts the other, so the data are consistent with some well-behaved preferences.']),
      'For each choice, check whether the other bundle was affordable at that time.', { chk: { k: 'rp', P1: P1, P2: P2, A: A1, B: B1, lab: lab } });
  });

  // =================================================================== Unit 3: Demand and Welfare

  G('imicro.income-changes', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['lin', 'class', 'pow'], ['lin', 'quad', 'class', 'pow'], ['quad', 'turn', 'lin', 'class']));
    var who = person(R), g = R.pick(['restaurant meals', 'bus rides', 'store-brand pasta', 'concert tickets', 'jeans', 'fresh berries']);
    if (kind === 'lin') {
      var c = R.int(1, 8) * 5 * R.sign(), d = R.pick([Q(1, 10), Q(1, 20), Q(1, 25), Q(1, 50), Q(1, 100)]), m = R.int(2, 10) * 100;
      if (c < 0) m = M.max(m, M.ceil(-c / d.toNumber() / 100) * 100 + 100);
      var x = d.mul(m).add(c), eta = d.mul(m).div(x);
      return P(who + '\u2019s demand for ' + g + ' depends on income $m$ (dollars per month) as $x = ' + (c < 0 ? '' : c + ' + ') + d.toTex() + 'm' + (c < 0 ? ' - ' + (-c) : '') + '$, at fixed prices. What is the income elasticity of demand at $m = ' + T.commas(m) + '$?', A(eta),
        ['Income elasticity: $\\eta = \\dfrac{dx}{dm}\\cdot\\dfrac{m}{x}$.', '$\\dfrac{dx}{dm} = ' + d.toTex() + '$ and at $m = ' + T.commas(m) + '$, $x = ' + nx(x) + '$.', '$\\eta = ' + d.toTex() + '\\cdot\\dfrac{' + m + '}{' + nx(x) + '} = ' + nx(eta) + '$.', eta.gt(1) ? 'Greater than 1: a luxury at this income (its budget share rises with income).' : 'Between 0 and 1: a necessity at this income (normal, but its budget share falls as income rises).'],
        'Multiply the slope of the Engel curve by m/x.', { chk: { k: 'eta', f: d.toPlain() + '*m+(' + c + ')', m: m } });
    }
    if (kind === 'pow') {
      var k = R.pick([Q(1, 2), Q(3, 2), Q(2), Q(1, 4), Q(3, 4), Q(-1, 2)]), A0 = R.int(2, 9);
      return P('Along an Engel curve, demand for ' + g + ' is $x = ' + A0 + 'm^{' + expTex(k) + '}$ (prices fixed). What is the income elasticity at any income $m$?', A(k),
        ['$\\eta = \\dfrac{dx}{dm}\\cdot\\dfrac{m}{x} = ' + A0 + '\\cdot ' + cfq(k) + 'm^{' + expTex(k.sub(1)) + '}\\cdot\\dfrac{m}{' + A0 + 'm^{' + expTex(k) + '}}$.', 'The powers of $m$ cancel: $\\eta = ' + nx(k) + '$ at every income.', k.sign() < 0 ? 'Negative: an inferior good.' : k.gt(1) ? 'Above 1: a luxury.' : 'Between 0 and 1: a necessity.'],
        'For a power function the elasticity is the exponent.', { chk: { k: 'eta', f: A0 + '*m^(' + k.toPlain() + ')', m: R.int(2, 9) * 100 } });
    }
    if (kind === 'quad' || kind === 'turn') {
      var a = R.int(2, 9), b = Q(a, 2 * R.pick([10, 20, 25, 40, 50]) * R.int(1, 4)), mt = Q(a).div(b.mul(2));
      var fx = function (mm) { return b.mul(mm).mul(mm).neg().add(Q(a).mul(mm)); };
      if (kind === 'turn') return P('Demand for ' + g + ' rises and then falls with income: $x = ' + a + 'm - ' + b.toTex() + 'm^2$, where $m$ is income in thousands of dollars a year (prices fixed). At what income $m$ does it switch from a normal good to an inferior good?', A(mt),
        ['The good is normal where $dx/dm > 0$ and inferior where $dx/dm < 0$.', '$\\dfrac{dx}{dm} = ' + a + ' - ' + b.mul(2).toTex() + 'm$.', 'Set it to zero: $m = ' + a + '/' + b.mul(2).toTex() + ' = ' + nx(mt) + '$.', 'Below that income more income means more ' + g + '; above it, less. "Inferior" depends on where you are.'],
        'Where is dx/dm zero?', { unit: 'thousand dollars', chk: { k: 'turn', a: a, b: b.toNumber() } });
      var mq = mt.mul(R.pick([Q(1, 2), Q(3, 2), Q(1, 4), Q(5, 4)])), xq = fx(mq), dq = Q(a).sub(b.mul(2).mul(mq)), et = dq.mul(mq).div(xq);
      return P('Demand for ' + g + ' is $x = ' + a + 'm - ' + b.toTex() + 'm^2$, with income $m$ in thousands of dollars a year (prices fixed). What is the income elasticity at $m = ' + nx(mq) + '$?', A(et),
        ['$\\dfrac{dx}{dm} = ' + a + ' - ' + b.mul(2).toTex() + 'm = ' + nx(dq) + '$ at $m = ' + nx(mq) + '$.', '$x = ' + nx(xq) + '$ there.', '$\\eta = ' + nx(dq) + '\\cdot\\dfrac{' + nx(mq) + '}{' + nx(xq) + '} = ' + nx(et) + '$.', et.sign() < 0 ? 'Negative: at this income the good is inferior.' : et.gt(1) ? 'Above 1: a luxury at this income.' : 'Between 0 and 1: a necessity at this income.'],
        'Differentiate, then multiply by m/x at that income.', { chk: { k: 'eta', f: a + '*m-' + b.toPlain() + '*m^2', m: mq.toNumber() } });
    }
    var cases = [['luxury', 'Its income elasticity is above 1, so its share of the budget rises as income rises', Q(R.int(13, 25), 10), 'A luxury'], ['necessity', 'Its income elasticity is between 0 and 1, so it is a normal good whose budget share falls as income rises', Q(R.int(2, 8), 10), 'A necessity'], ['inferior', 'Its income elasticity is negative, so people buy less of it as income rises', Q(-R.int(2, 9), 10), 'An inferior good']];
    var ci = R.int(0, 2), pi = R.int(4, 9) * 2, qi = cases[ci][2].mul(pi);
    return P('When ' + who + '\u2019s income rises by ' + pi + '%, with prices unchanged, ' + who.her + ' purchases of ' + g + ' change by about ' + (qi.sign() < 0 ? '\u2212' : '+') + nx(qi.abs()) + '%. For ' + who.him + ', ' + g + ' are…',
      mc(cases[ci][3] + ': ' + cases[ci][1].charAt(0).toLowerCase() + cases[ci][1].slice(1), cases.filter(function (c, i) { return i !== ci; }).map(function (c) { return c[3] + ': ' + c[1].charAt(0).toLowerCase() + c[1].slice(1); }).concat(['A Giffen good: quantity rises with income because the good is cheap'])),
      ['Income elasticity $\\approx \\dfrac{\\%\\Delta x}{\\%\\Delta m} = \\dfrac{' + nx(qi) + '}{' + pi + '} = ' + nx(cases[ci][2]) + '$.', 'Above 1: luxury. Between 0 and 1: necessity. Below 0: inferior.', 'So the good is ' + (ci === 2 ? 'an inferior good' : 'a ' + cases[ci][0]) + ' for this person, at this income.'],
      'Divide the percent change in quantity by the percent change in income.', { chk: { k: 'eclass', eta: cases[ci][2].toNumber() } });
  });

  G('imicro.price-changes', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['newq', 'homog', 'newq'], ['newq', 'homog', 'elas', 'tf', 'yfix'], ['expr', 'elas', 'tf', 'yfix', 'newq']));
    var who = person(R), a = R.int(1, 3), b = R.int(1, 3); if (a === b && R.coin()) b = a + 1;
    var s = Q(a, a + b), m = (a + b) * R.int(2, 10) * 12, p1 = R.pick([2, 3, 4, 6]), U = pw('x', a) + pw('y', b), Up = 'x^' + a + '*y^' + b;
    if (kind === 'newq') {
      var np = R.pick([1, 2, 3, 4, 6, 8, 12].filter(function (v) { return v !== p1; })), x0 = s.mul(m).div(p1), x1 = s.mul(m).div(np);
      return P(who + '\u2019s utility is $U = ' + U + '$ and ' + who.she + ' has ' + money(m) + '. When the price of $x$ was ' + money(p1) + ', ' + who.she + ' bought ' + nx(x0) + ' units. How many units does ' + who.she + ' buy when the price changes to ' + money(np) + '?', A(x1),
        ['Cobb-Douglas demand: $x^* = ' + s.toTex() + '\\cdot\\dfrac{m}{p_1}$; spending on $x$ is always $' + s.toTex() + '\\times ' + m + ' = ' + nx(s.mul(m)) + '$.', 'At ' + money(np) + ': $x^* = ' + nx(s.mul(m)) + '/' + np + ' = ' + nx(x1) + '$.', 'Two points on ' + who.her + ' demand curve: $(' + nx(x0) + ', ' + p1 + ')$ and $(' + nx(x1) + ', ' + np + ')$. Rotating the budget line and re-optimizing traces the whole curve.'],
        'Spending on x is a fixed share of income.', { unit: 'units', chk: { k: 'opt', U: Up, p: [np, R.int(1, 5)], m: m, ask: 'x' } });
    }
    if (kind === 'homog') {
      var k = R.int(2, 4), x2 = s.mul(m).div(p1), p2 = R.int(1, 6);
      return P(who + '\u2019s utility is $U = ' + U + '$. With income ' + money(m) + ', $p_1 = ' + p1 + '$ and $p_2 = ' + p2 + '$, ' + who.she + ' buys ' + nx(x2) + ' units of $x$. Then every price and ' + who.her + ' income are multiplied by ' + k + '. How many units of $x$ does ' + who.she + ' buy now?', A(x2),
        ['The new budget is $' + (k * p1) + 'x + ' + (k * p2) + 'y = ' + (k * m) + '$; divide by ' + k + ' and it is the old budget.', 'Same budget set, same preferences, same choice: ' + nx(x2) + ' units.', 'Demand is homogeneous of degree zero in prices and income: only relative prices and real income matter.'],
        'Divide the new budget equation by the common factor.', { unit: 'units', chk: { k: 'opt', U: Up, p: [k * p1, k * p2], m: k * m, ask: 'x' } });
    }
    if (kind === 'elas') return P('With $U = ' + U + '$, demand for $x$ is $x^* = ' + s.toTex() + '\\,m/p_1$. What is its own-price elasticity $\\varepsilon = \\dfrac{\\partial x}{\\partial p_1}\\cdot\\dfrac{p_1}{x}$ (a signed number)?', A(-1),
      ['$\\dfrac{\\partial x}{\\partial p_1} = -' + s.toTex() + '\\dfrac{m}{p_1^2}$.', '$\\varepsilon = -' + s.toTex() + '\\dfrac{m}{p_1^2}\\cdot\\dfrac{p_1}{' + s.toTex() + 'm/p_1} = -1$.', 'Unit elastic at every price: spending $p_1x$ stays the same when the price changes.'],
      'Differentiate m/p and multiply by p/x.', { chk: { k: 'cdelas', a: a, b: b } });
    if (kind === 'yfix') {
      var p2y = R.int(1, 6), np2 = R.pick([1, 2, 3, 4, 6, 8, 12].filter(function (v) { return v !== p1; })), y = Q(b, a + b).mul(m).div(p2y);
      return P(who + '\u2019s utility is $U = ' + U + '$, income ' + money(m) + ', $p_2 = ' + p2y + '$. The price of $x$ ' + (np2 < p1 ? 'falls' : 'rises') + ' from ' + money(p1) + ' to ' + money(np2) + '. How many units of $y$ does ' + who.she + ' buy after the change?', A(y),
        ['Spending on $y$ is the share $' + Q(b, a + b).toTex() + '$ of income, whatever $p_1$ is: $' + nx(Q(b, a + b).mul(m)) + '$ dollars.', '$y^* = ' + nx(Q(b, a + b).mul(m)) + '/' + p2y + ' = ' + nx(y) + '$, the same as before.', 'For Cobb-Douglas the price offer curve is flat: as $p_1$ changes the optimum moves horizontally.'],
        'Is p1 in the demand for y?', { unit: 'units', chk: { k: 'opt', U: Up, p: [np2, p2y], m: m, ask: 'y' } });
    }
    if (kind === 'expr') return P('$U = ' + U + '$ and income is ' + money(m) + '. Write the demand curve for $x$ as a function of its price $p$.', expr(nx(s.mul(m)).replace(/\{,\}/g, '') + '/p', ['p']),
      ['Cobb-Douglas: $x^* = ' + s.toTex() + '\\cdot\\dfrac{m}{p}$.', 'With $m = ' + m + '$: $x(p) = \\dfrac{' + nx(s.mul(m)) + '}{p}$, a hyperbola: price times quantity is constant.'], 'Spending on x is a fixed share of income.', { chk: { k: 'demexpr', U: Up, m: m } });
    var tfs = [['Every inferior good is a Giffen good.', false, 'An inferior good has an income effect that works against the substitution effect. It is Giffen only if that income effect is bigger, so that a price rise increases the quantity bought. Most inferior goods are not Giffen.'],
      ['A Giffen good must be an inferior good.', true, 'For quantity to rise with price, the income effect must push against the substitution effect and win. That needs an inferior good.'],
      ['For a normal good, the demand curve slopes down.', true, 'Substitution and income effects both push quantity down when the price rises.'],
      ['If all prices and income double, a consumer buys twice as much of each normal good.', false, 'Doubling everything leaves the budget set unchanged, so the choice is unchanged.']];
    var f = R.pick(tfs);
    return P('True or false? ' + f[0], { t: 'tf', v: f[1] }, [f[2], f[1] ? 'True.' : 'False.'], 'Think about the income effect and the substitution effect separately.', { chk: { k: 'tf', v: f[1], s: f[0] } });
  });

  // Slutsky numbers with Cobb-Douglas share s: A, compensated income, B, C
  function slutskyCD(s, m, p1, q1) { var xA = s.mul(m).div(p1), mp = Q(m).add(Q(q1 - p1).mul(xA)), xB = s.mul(mp).div(q1), xC = s.mul(m).div(q1); return { xA: xA, mp: mp, xB: xB, xC: xC, se: xB.sub(xA), ie: xC.sub(xB) }; }
  G('imicro.income-substitution-effects', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['se', 'ie', 'mp'], ['se', 'ie', 'mp', 'tot', 'sign'], ['hicks', 'se', 'ie', 'sign', 'hicks']));
    var who = person(R);
    if (kind === 'sign') {
      var cases = [['normal', 'falls', 'Both raise the quantity: the substitution effect (it is relatively cheaper) and the income effect (she is richer, and the good is normal)'], ['inferior', 'falls', 'The substitution effect raises the quantity; the income effect lowers it, because she is richer and buys less of an inferior good'], ['normal', 'rises', 'Both lower the quantity: the substitution effect (it is relatively dearer) and the income effect (she is poorer, and the good is normal)'], ['inferior', 'rises', 'The substitution effect lowers the quantity; the income effect raises it, because she is poorer and buys more of an inferior good']];
      var ci = R.int(0, 3), c = cases[ci];
      return P('The price of a good ' + c[1] + ', and for this consumer the good is ' + c[0] + '. Which statement describes the substitution and income effects on the quantity she buys?',
        mc(c[2], cases.filter(function (x, i) { return i !== ci; }).map(function (x) { return x[2]; })),
        ['The substitution effect always moves quantity opposite to the price change (it is a move along one indifference curve).', 'The income effect depends on the good: a price fall makes her richer, a price rise poorer; normal goods move with real income, inferior goods against it.', c[2] + '.'],
        'Sort out the direction of each effect separately.', { chk: { k: 'sesign', ci: ci, text: c[2] } });
    }
    var s = R.pick(lv(ctx, [Q(1, 2)], [Q(1, 2), Q(1, 3), Q(1, 4)], [Q(1, 2), Q(1, 3)])), p1, q1, m, sl, tries = 0;
    do { p1 = R.pick([2, 3, 4, 6, 8]); q1 = R.pick([1, 2, 3, 4, 6, 8, 12].filter(function (v) { return v !== p1; })); m = R.int(2, 20) * 12 * s.den(); sl = slutskyCD(s, m, p1, q1); tries++; }
    while (tries < 300 && !(decPlaces(sl.xA) <= 1 && decPlaces(sl.xB) <= 2 && decPlaces(sl.xC) <= 1));
    var Up = s.eq(Q(1, 2)) ? 'x*y' : s.eq(Q(1, 3)) ? 'x*y^2' : 'x*y^3', Ut = s.eq(Q(1, 2)) ? 'xy' : s.eq(Q(1, 3)) ? 'xy^{2}' : 'xy^{3}', p2 = R.int(1, 4);
    var setup = who + '\u2019s utility is $U = ' + Ut + '$ (so ' + who.she + ' spends the share $' + s.toTex() + '$ of income on $x$). Income is ' + money(m) + ', $p_2 = ' + p2 + '$, and the price of $x$ ' + (q1 < p1 ? 'falls' : 'rises') + ' from ' + money(p1) + ' to ' + money(q1) + '.';
    if (kind === 'hicks') {
      // U = xy only: Hicksian x at the new price on the old curve
      var tries2 = 0, P1, Q1, Mh, P2, xA, yA, uA, xB, xC;
      do { P1 = R.pick([1, 2, 4, 8, 9]); Q1 = R.pick([1, 2, 4, 8, 9].filter(function (v) { return v !== P1; })); P2 = R.pick([1, 2, 4]); Mh = 2 * R.int(2, 30) * 6; xA = Q(Mh, 2 * P1); yA = Q(Mh, 2 * P2); uA = xA.mul(yA); var h2 = uA.mul(P2).div(Q1); var rt = rat(M.sqrt(h2.toNumber())); xB = rt && rt.mul(rt).eq(h2) ? rt : null; tries2++; }
      while (tries2 < 500 && !(xB && decPlaces(xB) <= 1 && decPlaces(xA) <= 1));
      xC = Q(Mh, 2 * Q1);
      return P(who + '\u2019s utility is $U = xy$, income ' + money(Mh) + ', $p_2 = ' + P2 + '$. The price of $x$ changes from ' + money(P1) + ' to ' + money(Q1) + '. Using the Hicks decomposition (stay on the original indifference curve), what is the substitution effect on $x$ (signed)?', A(xB.sub(xA)),
        ['Before: $x_A = ' + Mh + '/(2\\cdot ' + P1 + ') = ' + nx(xA) + '$ and $y_A = ' + nx(yA) + '$, so $u_A = ' + nx(uA) + '$.', 'Hicks: the cheapest bundle on $xy = ' + nx(uA) + '$ at the new prices has $y/x = ' + fr(Q1, P2) + '$, so $x_B^2 = ' + nx(uA) + '\\cdot\\dfrac{' + P2 + '}{' + Q1 + '}$ and $x_B = ' + nx(xB) + '$.', 'Substitution effect: $x_B - x_A = ' + nx(xB) + ' - ' + nx(xA) + ' = ' + nx(xB.sub(xA)) + '$.', 'The new optimum is $x_C = ' + nx(xC) + '$, so the income effect is $' + nx(xC.sub(xB)) + '$.'],
        'Find the original utility, then the cheapest bundle with that utility at the new prices.', { unit: 'units', chk: { k: 'hicks', m: Mh, p: [P1, P2], q1: Q1 } });
    }
    var lines = ['Original choice A: $x_A = ' + s.toTex() + '\\cdot\\dfrac{' + m + '}{' + p1 + '} = ' + nx(sl.xA) + '$.',
      'Slutsky compensation keeps A just affordable: $m\' = ' + m + ' + (' + q1 + ' - ' + p1 + ')(' + nx(sl.xA) + ') = ' + nx(sl.mp) + '$.',
      'Compensated choice B: $x_B = ' + s.toTex() + '\\cdot\\dfrac{' + nx(sl.mp) + '}{' + q1 + '} = ' + nx(sl.xB) + '$, so the substitution effect is $x_B - x_A = ' + nx(sl.se) + '$.',
      'New choice C (actual income): $x_C = ' + s.toTex() + '\\cdot\\dfrac{' + m + '}{' + q1 + '} = ' + nx(sl.xC) + '$, so the income effect is $x_C - x_B = ' + nx(sl.ie) + '$.'];
    var chk = { k: 'slutsky', U: Up, m: m, p: [p1, p2], q1: q1, ask: kind };
    if (kind === 'mp') return P(setup + ' Using the Slutsky method, what income would let ' + who.him + ' just afford ' + who.her + ' original bundle at the new price?', A(sl.mp), lines.slice(0, 2).concat(['That compensated income is $' + nx(sl.mp) + '$ dollars.']), 'Change income by (change in price) × (original quantity of x).', { unit: 'dollars', chk: chk });
    if (kind === 'se') return P(setup + ' Using the Slutsky method, what is the substitution effect on $x$ (signed: positive means more $x$)?', A(sl.se), lines.slice(0, 3), 'Compensate income so the old bundle is just affordable, then re-optimize at the new price.', { unit: 'units', chk: chk });
    if (kind === 'ie') return P(setup + ' Using the Slutsky method, what is the income effect on $x$ (signed)?', A(sl.ie), lines, 'Income effect = new choice minus the compensated choice.', { unit: 'units', chk: chk });
    return P(setup + ' What is the total change in $x$, and does it equal the substitution effect plus the income effect? Enter the total change (signed).', A(sl.xC.sub(sl.xA)), lines.concat(['Total: $' + nx(sl.xC) + ' - ' + nx(sl.xA) + ' = ' + nx(sl.xC.sub(sl.xA)) + ' = ' + nx(sl.se) + ' + ' + pn(sl.ie) + '$.']), 'New choice minus original choice.', { unit: 'units', chk: chk });
  });

  G('imicro.point-elasticity', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['lin', 'const', 'lin'], ['lin', 'inv', 'const', 'unit', 'pct'], ['inv', 'lin', 'unit', 'pct', 'const']));
    var g = R.pick(['concert tickets', 'bike rentals', 'phone cases', 'coffee', 'museum passes', 'gasoline']);
    if (kind === 'lin') {
      var b = R.int(1, 8), a = b * R.int(6, 20) * 2, P0 = R.int(1, a / b - 1), Q0 = a - b * P0, e = Q(-b * P0, Q0);
      return P('Demand for ' + g + ' is $Q = ' + a + ' - ' + T.mono(b, 'P') + '$. What is the point price elasticity of demand at $P = ' + P0 + '$? (Give the signed value.)', A(e),
        ['$\\varepsilon = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q}$.', '$\\dfrac{dQ}{dP} = -' + b + '$, and at $P = ' + P0 + '$, $Q = ' + a + ' - ' + b + '(' + P0 + ') = ' + Q0 + '$.', '$\\varepsilon = -' + b + '\\cdot\\dfrac{' + P0 + '}{' + Q0 + '} = ' + nx(e) + '$.', e.abs().gt(1) ? 'Elastic here ($|\\varepsilon| > 1$).' : e.abs().eq(1) ? 'Unit elastic here.' : 'Inelastic here ($|\\varepsilon| < 1$).'],
        'Multiply the slope dQ/dP by P/Q at that point.', { chk: { k: 'pe', Q: a + '-' + b + '*P', P: P0 } });
    }
    if (kind === 'inv') {
      var d = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4), Q(3)]), c = R.int(10, 60), q0 = R.int(2, 20); var p0 = Q(c).sub(d.mul(q0)); if (p0.sign() <= 0) { q0 = 2; p0 = Q(c).sub(d.mul(2)); }
      var e2 = p0.div(d.mul(q0)).neg();
      return P('Inverse demand for ' + g + ' is $P = ' + c + ' - ' + (d.eq(1) ? '' : d.toTex()) + 'Q$. What is the price elasticity of demand at $Q = ' + q0 + '$ (signed)?', A(e2),
        ['Here $\\dfrac{dP}{dQ} = -' + d.toTex() + '$, so $\\dfrac{dQ}{dP} = \\dfrac{1}{dP/dQ} = -' + d.inv().toTex() + '$.', 'At $Q = ' + q0 + '$: $P = ' + nx(p0) + '$.', '$\\varepsilon = -' + d.inv().toTex() + '\\cdot\\dfrac{' + nx(p0) + '}{' + q0 + '} = ' + nx(e2) + '$.'],
        'Invert the slope: you need dQ/dP, not dP/dQ.', { chk: { k: 'pe', Q: '(' + c + '-P)/(' + d.toPlain() + ')', P: p0.toNumber() } });
    }
    if (kind === 'const') {
      var k = R.pick([Q(1, 2), Q(3, 2), Q(2), Q(3, 4), Q(5, 4), Q(3)]), A0 = R.int(2, 9) * 100, Pc = R.int(2, 20);
      return P('Demand for ' + g + ' is $Q = ' + A0 + 'P^{-' + expTex(k) + '}$. What is the price elasticity of demand at $P = ' + Pc + '$ (signed)?', A(k.neg()),
        ['$\\dfrac{dQ}{dP} = -' + k.toTex() + '\\cdot ' + A0 + 'P^{-' + expTex(k.add(1)) + '}$.', '$\\varepsilon = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q} = -' + k.toTex() + '\\cdot ' + A0 + 'P^{-' + expTex(k.add(1)) + '}\\cdot\\dfrac{P}{' + A0 + 'P^{-' + expTex(k) + '}} = ' + nx(k.neg()) + '$.', 'The same at every price: a constant-elasticity demand curve. Taking logs gives $\\ln Q = \\ln ' + A0 + ' - ' + nx(k) + '\\ln P$, a straight line whose slope is the elasticity.'],
        'For a power function the elasticity is the exponent.', { chk: { k: 'pe', Q: A0 + '*P^(-' + k.toPlain() + ')', P: Pc } });
    }
    if (kind === 'unit') {
      var bb = R.int(1, 6), aa = 2 * bb * R.int(3, 15), pu = Q(aa, 2 * bb);
      return P('Demand for ' + g + ' is $Q = ' + aa + ' - ' + T.mono(bb, 'P') + '$. At what price is demand unit elastic ($\\varepsilon = -1$)?', A(pu),
        ['$\\varepsilon = \\dfrac{-' + T.mono(bb, 'P') + '}{' + aa + ' - ' + T.mono(bb, 'P') + '}$.', 'Set it equal to $-1$: $' + T.mono(bb, 'P') + ' = ' + aa + ' - ' + T.mono(bb, 'P') + '$, so $P = ' + nx(pu) + '$.', 'That is the midpoint of the line: elastic above it, inelastic below it, and total revenue is largest there.'],
        'Set |ε| = 1 and solve for P.', { unit: 'dollars', chk: { k: 'unitel', a: aa, b: bb } });
    }
    var ep = R.pick([Q(-1, 2), Q(-3, 2), Q(-2), Q(-4, 5), Q(-5, 2)]), dp = R.pick([2, 4, 5, 10]) * R.sign(), dq = ep.mul(dp);
    return P('The price elasticity of demand for ' + g + ' is $' + nx(ep) + '$. If the price ' + (dp > 0 ? 'rises' : 'falls') + ' by ' + M.abs(dp) + '%, by about what percent does the quantity demanded change? (Signed: negative for a fall.)', Object.assign(A(dq), { pct: true }),
      ['$\\%\\Delta Q \\approx \\varepsilon\\cdot\\%\\Delta P = ' + nx(ep) + '\\cdot(' + dp + '\\%)$.', '$= ' + nx(dq) + '\\%$.', 'This is a first-order approximation: it is close for small changes.'],
      'Multiply the elasticity by the percent change in price.', { chk: { k: 'pct', e: ep.toNumber(), dp: dp } });
  });

  G('imicro.market-demand', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['qat', 'qat', 'kink'], ['qat', 'kink', 'pat', 'qat'], ['pat', 'qat3', 'kink', 'pat']));
    var names = [person(R)], b1 = R.int(1, 5), c1 = R.int(8, 20), b2 = R.int(1, 5), c2 = R.intNot(4, 18, c1);
    names.push(person(R, names[0]));
    var a1 = b1 * c1, a2 = b2 * c2, hi = M.max(c1, c2), lo = M.min(c1, c2);
    var dem = function (P) { return M.max(0, a1 - b1 * P) + M.max(0, a2 - b2 * P); };
    var desc = names[0] + '\u2019s demand is $q_1 = ' + a1 + ' - ' + T.mono(b1, 'P') + '$ (zero above $P = ' + c1 + '$) and ' + names[1] + '\u2019s is $q_2 = ' + a2 + ' - ' + T.mono(b2, 'P') + '$ (zero above $P = ' + c2 + '$).';
    var viz = { name: 'graph', opts: { fns: [{ f: c1 + '-x/' + b1, label: 'D1', from: 0, to: a1 }, { f: c2 + '-x/' + b2, label: 'D2', from: 0, to: a2, dash: true }], xmin: 0, xmax: M.ceil(M.max(a1, a2) / 10) * 10 + 5, ymin: 0, ymax: hi + 3, xlabel: 'q', ylabel: 'P', interactive: false, quiet: true, zoom: false, roots: false, intersections: false } };
    if (kind === 'qat' || kind === 'qat3') {
      var P0 = R.int(1, hi - 1); if (ctx.level > 1 && R.coin()) P0 = R.int(lo, hi - 1);
      var q1 = M.max(0, a1 - b1 * P0), q2 = M.max(0, a2 - b2 * P0);
      return P(desc + ' What is the market quantity demanded at $P = ' + P0 + '$?', A(q1 + q2),
        [names[0] + ': ' + (a1 - b1 * P0 > 0 ? '$' + a1 + ' - ' + b1 + '(' + P0 + ') = ' + q1 + '$' : 'the price is above ' + c1 + ', so 0') + '.', names[1] + ': ' + (a2 - b2 * P0 > 0 ? '$' + a2 + ' - ' + b2 + '(' + P0 + ') = ' + q2 + '$' : 'the price is above ' + c2 + ', so 0') + '.', 'Add quantities at the same price (a horizontal sum): $' + q1 + ' + ' + q2 + ' = ' + (q1 + q2) + '$.'],
        'Find each buyer\u2019s quantity at that price (zero if the price is above the buyer\u2019s choke price), then add.', { unit: 'units', chk: { k: 'mktq', d: [[a1, b1], [a2, b2]], P: P0 } });
    }
    if (kind === 'kink') return P(desc + ' Market demand has a kink. At what price is it?', A(lo),
      ['Above $P = ' + hi + '$ nobody buys. Between ' + lo + ' and ' + hi + ', only the buyer with the higher choke price buys.', 'At $P = ' + lo + '$ the second buyer starts buying, and the market curve gets flatter (its slope in $Q$ per dollar jumps from ' + (c1 > c2 ? b1 : b2) + ' to ' + (b1 + b2) + ').', 'The kink is at $P = ' + lo + '$.'],
      'Where does the second buyer enter?', { unit: 'dollars', viz: viz, chk: { k: 'kink', d: [[a1, b1], [a2, b2]] } });
    // a price for a target quantity on the two-buyer segment
    var Pt = R.int(1, lo - 1), Qt = dem(Pt);
    return P(desc + ' At what price is the market quantity demanded equal to ' + Qt + '?', A(Pt),
      ['Check which segment: at $P = ' + lo + '$ the market quantity is ' + dem(lo) + ', less than ' + Qt + ', so both buyers are buying.', 'Both buying: $Q = ' + (a1 + a2) + ' - ' + T.mono(b1 + b2, 'P') + '$.', 'Set $' + (a1 + a2) + ' - ' + T.mono(b1 + b2, 'P') + ' = ' + Qt + '$: $P = ' + Pt + '$.'],
      'First decide whether one buyer or both are buying at that quantity.', { unit: 'dollars', chk: { k: 'mktp', d: [[a1, b1], [a2, b2]], Q: Qt } });
  });

  G('imicro.consumer-surplus-integral', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['lin', 'lin', 'wtp'], ['lin', 'quad', 'root', 'dcs'], ['quad', 'root', 'dcs', 'lin']));
    var g = R.pick(['streaming rentals', 'water (thousand gallons)', 'ride shares', 'bottled tea', 'gym classes']);
    if (kind === 'lin' || kind === 'wtp') {
      var a = R.int(10, 40), b = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4)]), p = R.int(2, a - 4), Q0 = Q(a - p).div(b), cs = Q(a - p).mul(Q0).div(2), wtp = Q(a).mul(Q0).sub(b.mul(Q0).mul(Q0).div(2));
      if (!Q0.isInt()) { b = Q(1); Q0 = Q(a - p); cs = Q(a - p).mul(Q0).div(2); wtp = Q(a).mul(Q0).sub(Q0.mul(Q0).div(2)); }
      var Pt = a + ' - ' + (b.eq(1) ? '' : b.toTex()) + 'q';
      var viz = { name: 'ftc', opts: { f: (a - p) + '-' + b.toPlain() + '*x', a: 0, x: Q0.toNumber(), xmin: 0, xmax: Q0.toNumber() * 1.2 + 1, play: false, quiet: true } };
      if (kind === 'wtp') return P('Inverse demand for ' + g + ' is $P(q) = ' + Pt + '$ and the price is ' + money(p) + '. What is buyers\u2019 total willingness to pay for the quantity they buy, $\\int_0^{Q} P(q)\\,dq$?', A(wtp),
        ['Quantity bought: $' + Pt + ' = ' + p + '$ gives $Q = ' + nx(Q0) + '$.', '$\\int_0^{' + nx(Q0) + '} (' + Pt + ')\\,dq = \\left[' + a + 'q - ' + (b.div(2).eq(1) ? '' : b.div(2).toTex()) + 'q^2\\right]_0^{' + nx(Q0) + '} = ' + nx(wtp) + '$.', 'Consumer surplus is this minus what they pay ($' + p + '\\times ' + nx(Q0) + ' = ' + nx(Q0.mul(p)) + '$): $' + nx(cs) + '$.'],
        'Integrate the inverse demand from 0 to the quantity bought.', { unit: 'dollars', chk: { k: 'csint', P: a + '-' + b.toPlain() + '*x', p: p, wtp: true } });
      return P('Inverse demand for ' + g + ' is $P(q) = ' + Pt + '$, and the price is ' + money(p) + '. Find consumer surplus as an integral.', A(cs),
        ['Quantity: $' + Pt + ' = ' + p + '$ gives $Q = ' + nx(Q0) + '$.', '$CS = \\int_0^{' + nx(Q0) + '}\\left(' + Pt + ' - ' + p + '\\right)dq = \\left[' + (a - p) + 'q - ' + (b.div(2).eq(1) ? '' : b.div(2).toTex()) + 'q^2\\right]_0^{' + nx(Q0) + '}$.', '$= ' + nx(Q(a - p).mul(Q0)) + ' - ' + nx(b.div(2).mul(Q0).mul(Q0)) + ' = ' + nx(cs) + '$ (the triangle $\\tfrac{1}{2}\\cdot ' + nx(Q0) + '\\cdot ' + (a - p) + '$).'],
        'Integrate (demand minus price) from 0 to the quantity bought.', { unit: 'dollars', viz: viz, chk: { k: 'csint', P: a + '-' + b.toPlain() + '*x', p: p } });
    }
    if (kind === 'quad') {
      var bq = R.pick([1, 2, 3]), Qq = R.int(2, 6), pq = R.int(1, 30), aq = pq + bq * Qq * Qq, csq = Q(2, 3).mul(aq - pq).mul(Qq);
      return P('Inverse demand is $P(q) = ' + aq + ' - ' + T.mono(bq, 'q^2') + '$ and the price is ' + money(pq) + '. What is consumer surplus?', A(csq),
        ['Quantity: $' + aq + ' - ' + T.mono(bq, 'q^2') + ' = ' + pq + '$, so $q^2 = ' + (Qq * Qq) + '$ and $Q = ' + Qq + '$.', '$CS = \\int_0^{' + Qq + '}\\left(' + (aq - pq) + ' - ' + T.mono(bq, 'q^2') + '\\right)dq = \\left[' + (aq - pq) + 'q - ' + Q(bq, 3).toTex().replace(/^1$/, '') + 'q^3\\right]_0^{' + Qq + '}$.', '$= ' + ((aq - pq) * Qq) + ' - ' + nx(Q(bq * Qq * Qq * Qq, 3)) + ' = ' + nx(csq) + '$.'],
        'Find Q first, then integrate P(q) − p from 0 to Q.', { unit: 'dollars', chk: { k: 'csint', P: aq + '-' + bq + '*x^2', p: pq } });
    }
    if (kind === 'root') {
      var k = R.pick([6, 8, 10, 12, 20, 24, 30]), pr = R.pick([1, 2, 3, 4, 5, 6].filter(function (v) { return (k / v) === M.round(k / v); })), Qr = (k / pr) * (k / pr), csr = k * k / pr;
      return P('Inverse demand is $P(q) = \\dfrac{' + k + '}{\\sqrt{q}}$ and the price is ' + money(pr) + '. What is consumer surplus?', A(csr),
        ['Quantity: $\\dfrac{' + k + '}{\\sqrt{Q}} = ' + pr + '$, so $\\sqrt{Q} = ' + (k / pr) + '$ and $Q = ' + Qr + '$.', '$CS = \\int_0^{' + Qr + '}\\left(' + k + 'q^{-1/2} - ' + pr + '\\right)dq = \\left[' + (2 * k) + '\\sqrt{q} - ' + T.mono(pr, 'q') + '\\right]_0^{' + Qr + '}$.', '$= ' + (2 * k) + '(' + (k / pr) + ') - ' + pr + '(' + Qr + ') = ' + (2 * k * k / pr) + ' - ' + (pr * Qr) + ' = ' + csr + '$.', 'The integrand is unbounded near $q = 0$, but the integral converges.'],
        'Write P as k·q^(−1/2) and integrate.', { unit: 'dollars', chk: { k: 'csint', P: k + '/sqrt(x)', p: pr } });
    }
    var ad = R.int(20, 60), bd = R.int(1, 4), p0 = R.int(4, M.floor(ad / bd) - 2), p1 = R.int(1, p0 - 1), dcs = Q(ad).mul(p0 - p1).sub(Q(bd, 2).mul(p0 * p0 - p1 * p1));
    return P('Demand is $Q = ' + ad + ' - ' + T.mono(bd, 'P') + '$. The price falls from ' + money(p0) + ' to ' + money(p1) + '. By how much does consumer surplus rise?', A(dcs),
      ['The gain is the area to the left of the demand curve between the two prices: $\\Delta CS = \\int_{' + p1 + '}^{' + p0 + '}(' + ad + ' - ' + T.mono(bd, 'P') + ')\\,dP$.', '$= \\left[' + ad + 'P - ' + Q(bd, 2).toTex().replace(/^1$/, '') + 'P^2\\right]_{' + p1 + '}^{' + p0 + '} = ' + nx(dcs) + '$.', 'Check with geometry: a trapezoid of height ' + (p0 - p1) + ' between quantities ' + (ad - bd * p0) + ' and ' + (ad - bd * p1) + ': $\\tfrac{1}{2}(' + (ad - bd * p0) + ' + ' + (ad - bd * p1) + ')(' + (p0 - p1) + ') = ' + nx(dcs) + '$.'],
      'Integrate the demand Q(P) over the price range.', { unit: 'dollars', chk: { k: 'dcs', Q: ad + '-' + bd + '*x', p0: p0, p1: p1 } });
  });

  G('imicro.compensating-equivalent-variation', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['cvfall', 'evfall', 'ql'], ['cvfall', 'evfall', 'cvrise', 'ql', 'order'], ['cvrise', 'evrise', 'ql', 'order', 'dcs']));
    var who = person(R), pairs = [[4, 1], [9, 4], [4, 9], [1, 4], [16, 9], [9, 16], [16, 4], [4, 16]];
    if (kind === 'ql') {
      var c = R.pick([4, 6, 8, 12]), p0 = R.pick([1, 2, 3, 4]), p1 = R.pick([1, 2, 3, 4, 6].filter(function (v) { return v !== p0; })), dcs = Q(c * c, 4).mul(Q(1, M.min(p0, p1)).sub(Q(1, M.max(p0, p1))));
      var fall = p1 < p0;
      return P(who + '\u2019s utility is quasilinear, $U = ' + c + '\\sqrt{x} + y$ ($y$ is money left for everything else, price 1), and ' + who.her + ' income is large enough that ' + who.she + ' always buys some $y$. The price of $x$ ' + (fall ? 'falls' : 'rises') + ' from ' + money(p0) + ' to ' + money(p1) + '. What is the compensating variation (the size, in dollars)?', A(dcs),
        ['Demand: $MRS = ' + dfr(c / 2, '\\sqrt{x}') + ' = p$, so $x(p) = ' + dfr(c * c / 4, 'p^2') + '$.', 'With quasilinear utility there is no income effect on $x$, so CV, EV and the change in consumer surplus are equal.', '$\\Delta CS = \\int_{' + M.min(p0, p1) + '}^{' + M.max(p0, p1) + '}' + dfr(c * c / 4, 'p^2') + '\\,dp = ' + (c * c / 4) + '\\left(\\dfrac{1}{' + M.min(p0, p1) + '} - \\dfrac{1}{' + M.max(p0, p1) + '}\\right) = ' + nx(dcs) + '$.', 'So $CV = ' + nx(dcs) + '$ dollars (' + (fall ? 'what ' + who.she + ' would pay to have the price fall' : 'what ' + who.she + ' must be paid to accept the rise') + ').'],
        'With no income effect, CV equals the change in consumer surplus.', { unit: 'dollars', chk: { k: 'cvql', c: c, p0: p0, p1: p1 } });
    }
    var pr = R.pick(kind === 'cvfall' || kind === 'evfall' || kind === 'order' || kind === 'dcs' ? pairs.filter(function (q) { return q[1] < q[0]; }) : pairs.filter(function (q) { return q[1] > q[0]; }));
    if (kind === 'order' || kind === 'dcs') pr = R.pick(pairs.filter(function (q) { return q[1] < q[0]; }));
    var P0 = pr[0], P1 = pr[1], rt = Q(M.round(M.sqrt(P1)), M.round(M.sqrt(P0))), m = R.int(2, 12) * 6 * M.round(M.sqrt(P0)) * M.round(M.sqrt(P1)) * 2;
    var fallP = P1 < P0, cv = fallP ? Q(m).mul(Q(1).sub(rt)) : Q(m).mul(rt.sub(1)), ev = fallP ? Q(m).mul(rt.inv().sub(1)) : Q(m).mul(Q(1).sub(rt.inv())), dcs2 = m / 2 * M.log(M.max(P0, P1) / M.min(P0, P1));
    var setup = who + '\u2019s utility is $U = xy$ (half of income goes to each good), $p_y = 1$, and income is ' + money(m) + '. The price of $x$ ' + (fallP ? 'falls' : 'rises') + ' from ' + money(P0) + ' to ' + money(P1) + '.';
    var facts = ['With $U = xy$ and $p_y = 1$: utility from income $m$ at price $p$ is $V = \\dfrac{m^2}{4p}$, and the money needed for utility $u$ is $E = 2\\sqrt{pu}$.', 'Before: $u_0 = \\dfrac{' + m + '^2}{4\\cdot ' + P0 + '} = ' + nx(Q(m * m, 4 * P0)) + '$. After: $u_1 = \\dfrac{' + m + '^2}{4\\cdot ' + P1 + '} = ' + nx(Q(m * m, 4 * P1)) + '$.'];
    var chk = { k: 'cvev', m: m, p0: P0, p1: P1 };
    if (kind === 'cvfall' || kind === 'cvrise') return P(setup + ' What is the compensating variation: the amount of money that, taken away (for a fall) or given (for a rise) after the change, leaves ' + who.him + ' exactly as well off as before? (Give its size.)', A(cv),
      facts.concat(['At the new price, reaching $u_0$ costs $E = 2\\sqrt{' + P1 + '\\cdot ' + nx(Q(m * m, 4 * P0)) + '} = ' + nx(Q(m).mul(rt)) + '$.', 'CV $= |' + m + ' - ' + nx(Q(m).mul(rt)) + '| = ' + nx(cv) + '$ dollars.']), 'Price the old utility level at the new prices and compare with income.', { unit: 'dollars', chk: Object.assign({ ask: 'cv' }, chk) });
    if (kind === 'evfall' || kind === 'evrise') return P(setup + ' What is the equivalent variation: the change in income, at the old price, that would leave ' + who.him + ' as well off as the price change does? (Give its size.)', A(ev),
      facts.concat(['At the old price, reaching $u_1$ costs $E = 2\\sqrt{' + P0 + '\\cdot ' + nx(Q(m * m, 4 * P1)) + '} = ' + nx(Q(m).mul(rt.inv())) + '$.', 'EV $= |' + nx(Q(m).mul(rt.inv())) + ' - ' + m + '| = ' + nx(ev) + '$ dollars.']), 'Price the new utility level at the old prices and compare with income.', { unit: 'dollars', chk: Object.assign({ ask: 'ev' }, chk) });
    if (kind === 'dcs') return P(setup + ' By how much does consumer surplus (the area to the left of the demand curve $x = m/(2p)$ between the two prices) rise?', A(dcs2, { rtol: 0.005 }),
      ['$\\Delta CS = \\int_{' + P1 + '}^{' + P0 + '}\\dfrac{' + m + '}{2p}\\,dp = ' + (m / 2) + '\\ln\\dfrac{' + P0 + '}{' + P1 + '}$.', '$\\approx ' + dx(dcs2, 2) + '$ dollars.', 'Compare: CV $= ' + nx(cv) + '$ and EV $= ' + nx(ev) + '$. For a price fall of a normal good, $CV < \\Delta CS < EV$.'],
      'Integrate the demand curve over the price range.', { unit: 'dollars', chk: Object.assign({ ask: 'dcs' }, chk) });
    var ans = 'CV < change in consumer surplus < EV';
    return P(setup + ' Rank the compensating variation (CV), the equivalent variation (EV) and the change in consumer surplus ($\\Delta CS$), all measured as positive gains.',
      mc(ans, ['EV < change in consumer surplus < CV', 'All three are equal', 'Change in consumer surplus < CV < EV']),
      facts.concat(['CV $= ' + nx(cv) + '$, EV $= ' + nx(ev) + '$, and $\\Delta CS = ' + (m / 2) + '\\ln(' + P0 + '/' + P1 + ') \\approx ' + dx(dcs2, 2) + '$.', 'So $CV < \\Delta CS < EV$. They differ because $x$ is a normal good with an income effect; with quasilinear utility all three would be equal.']),
      'Compute each one.', { chk: Object.assign({ ask: 'order' }, chk) });
  });

  // =================================================================== Unit 4: Work, Time and Risk

  G('imicro.labor-leisure', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['hours', 'hours', 'cons'], ['hours', 'cons', 'raise', 'zeroN'], ['raise', 'comp', 'hours', 'zeroN']));
    var who = person(R);
    if (kind === 'comp') { // perfect complements: leisure rises with the wage when T·k > N (backward-bending)
      var k = R.pick([5, 10, 15, 20]), T0 = R.pick([16, 20, 24]), w1 = R.pick([5, 10, 15]), w2 = w1 + R.pick([5, 10, 15, 20]), N = 0;
      var l1 = Q(w1 * T0 + N, w1 + k), l2 = Q(w2 * T0 + N, w2 + k), h1 = Q(T0).sub(l1), h2 = Q(T0).sub(l2);
      return P(who + ' wants consumption and leisure in fixed proportion: $U = \\min\\{C, ' + k + '\\ell\\}$ ($C$ in dollars a day, $\\ell$ in hours of leisure). ' + who.She + ' has ' + T0 + ' hours a day, no other income, and earns $w$ per hour. How many hours does ' + who.she + ' work when $w$ rises from ' + money(w1) + ' to ' + money(w2) + '? Give hours at the new wage.', A(h2),
        ['At the optimum $C = ' + k + '\\ell$, and the budget is $C = w(' + T0 + ' - \\ell)$.', 'So $' + k + '\\ell = w(' + T0 + ' - \\ell)$, giving $\\ell = \\dfrac{' + T0 + 'w}{w + ' + k + '}$ and hours $h = ' + T0 + ' - \\ell = \\dfrac{' + (T0 * k) + '}{w + ' + k + '}$.', 'At $w = ' + w1 + '$: $h = ' + nx(h1) + '$. At $w = ' + w2 + '$: $h = ' + nx(h2) + '$.', 'Hours fall as the wage rises: with fixed proportions there is no substitution effect, only the income effect, which raises leisure. Labor supply bends backward.'],
        'At a kink, C = kℓ. Use the budget to solve for ℓ.', { unit: 'hours', chk: { k: 'labor', U: 'min(y,' + k + '*x)', T: T0, w: w2, N: N, ask: 'h' } });
    }
    var a = R.pick([1, 1, 2, 3]), b = R.pick([1, 1, 2, 3]), T0b = 24, sh = Q(b, a + b);
    var w = R.pick([8, 10, 12, 15, 16, 20, 24, 25, 30]), N0 = R.int(0, 8) * 10;
    if (kind === 'zeroN') N0 = 0;
    var full = Q(w * T0b + N0), l = sh.mul(full).div(w), h = Q(T0b).sub(l), C = Q(a, a + b).mul(full);
    var tries = 0; while ((decPlaces(l) > 2 || h.sign() <= 0) && tries++ < 60) { w = R.pick([8, 10, 12, 15, 16, 20, 24, 25, 30]); if (tries > 30) N0 = 0; full = Q(w * T0b + N0); l = sh.mul(full).div(w); h = Q(T0b).sub(l); C = Q(a, a + b).mul(full); }
    var Ut = 'U = ' + pw('C', a) + '\\,' + pw('\\ell', b), Up = 'x^' + b + '*y^' + a; // chk: x = leisure, y = consumption
    var base = ['Full income: the value of all ' + T0b + ' hours plus other income, $' + w + '\\cdot ' + T0b + ' + ' + N0 + ' = ' + nx(full) + '$.', 'Cobb-Douglas: spend the share $' + sh.toTex() + '$ of full income on leisure (whose price is the wage): $\\ell = ' + sh.toTex() + '\\cdot\\dfrac{' + nx(full) + '}{' + w + '} = ' + nx(l) + '$ hours.'];
    var intro = who + '\u2019s utility is $' + Ut + '$, where $C$ is consumption (dollars a day) and $\\ell$ is hours of leisure. ' + who.She + ' has ' + T0b + ' hours a day, earns ' + money(w) + ' an hour' + (N0 ? ', and has ' + money(N0) + ' a day of other income' : ' and has no other income') + '.';
    if (kind === 'hours' || kind === 'zeroN') return P(intro + ' How many hours a day does ' + who.she + ' work?', A(h),
      base.concat(['Hours worked: $' + T0b + ' - ' + nx(l) + ' = ' + nx(h) + '$.'].concat(kind === 'zeroN' ? ['With no other income, hours are $' + T0b + '\\cdot ' + Q(a, a + b).toTex() + '$ whatever the wage: the income and substitution effects of a raise cancel exactly for Cobb-Douglas.'] : [])),
      'Leisure is a good whose price is the wage. Find full income, then the Cobb-Douglas share for leisure.', { unit: 'hours', chk: { k: 'labor', U: Up, T: T0b, w: w, N: N0, ask: 'h' } });
    if (kind === 'cons') return P(intro + ' How much does ' + who.she + ' consume (in dollars a day)?', A(C),
      base.concat(['Consumption gets the share $' + Q(a, a + b).toTex() + '$ of full income: $C = ' + nx(C) + '$ dollars.', 'Check: $C = ' + w + '(' + nx(h) + ')' + (N0 ? ' + ' + N0 : '') + ' = ' + nx(C) + '$.']), 'Consumption gets the other share of full income.', { unit: 'dollars', chk: { k: 'labor', U: Up, T: T0b, w: w, N: N0, ask: 'C' } });
    var w2b, N1 = M.min(N0 || 40, 40), full1, full2, h1b, h2b, tw = 0;
    do { w2b = w + R.pick([2, 4, 5, 6, 10, 15, 20]); if (tw > 20) N1 = 20; full1 = Q(w * T0b + N1); full2 = Q(w2b * T0b + N1); h1b = Q(T0b).sub(sh.mul(full1).div(w)); h2b = Q(T0b).sub(sh.mul(full2).div(w2b)); tw++; } while (tw < 40 && (decPlaces(h2b) > 2 || decPlaces(h1b) > 2 || h1b.sign() <= 0));
    return P(who + '\u2019s utility is $' + Ut + '$ ($C$ = consumption in dollars a day, $\\ell$ = leisure hours). ' + who.She + ' has ' + T0b + ' hours a day and ' + money(N1) + ' a day of other income. ' + who.Her + ' wage rises from ' + money(w) + ' to ' + money(w2b) + ' an hour. How many hours does ' + who.she + ' work at the new wage?', A(h2b),
      ['Hours $= ' + T0b + ' - ' + sh.toTex() + '\\cdot\\dfrac{' + T0b + 'w + ' + N1 + '}{w} = ' + nx(Q(T0b).mul(Q(1).sub(sh))) + ' - ' + nx(sh.mul(N1)) + '/w$.', 'At $w = ' + w + '$: ' + nx(h1b) + ' hours. At $w = ' + w2b + '$: ' + nx(h2b) + ' hours.', 'Hours rise with the wage here because the other income makes the income effect smaller than the substitution effect.'],
      'Recompute full income and the leisure share at the new wage.', { unit: 'hours', chk: { k: 'labor', U: Up, T: T0b, w: w2b, N: N1, ask: 'h' } });
  });

  G('imicro.present-value', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['single', 'perp', 'single'], ['single', 'annuity', 'perp', 'growing', 'compare'], ['annuity', 'growing', 'compare', 'single']));
    var who = person(R);
    if (kind === 'single') {
      var r = R.pick([0.04, 0.05, 0.06, 0.08, 0.1]), t = R.int(2, 10), pv0 = R.int(2, 40) * 100, fv = pv0 * M.pow(1 + r, t), FV = M.round(fv / 10) * 10, pv = FV / M.pow(1 + r, t);
      if (ctx.level === 1) { var e1 = R.pick([[0.1, 2, 121], [0.1, 1, 110], [0.05, 1, 105], [0.2, 1, 120], [0.2, 2, 144], [0.25, 1, 125], [0.08, 1, 108], [0.04, 1, 104]]); r = e1[0]; t = e1[1]; FV = R.int(1, 12) * e1[2] * 10; pv = FV / M.pow(1 + r, t); }
      return P('What is the present value of ' + money(FV) + ' received ' + t + ' years from now, if the interest rate is ' + T.pct(r * 100) + ' a year (compounded yearly)?', A(pv, { rtol: 0.002 }),
        ['$PV = \\dfrac{FV}{(1 + r)^t} = \\dfrac{' + T.commas(FV) + '}{(' + T.num(1 + r) + ')^{' + t + '}}$.', '$(' + T.num(1 + r) + ')^{' + t + '} ' + apx(M.pow(1 + r, t), 4) + '$.', '$PV ' + apx(pv, 2) + '$ dollars: put that much in the bank today at ' + T.pct(r * 100) + ' and it grows to ' + money(FV) + ' in ' + t + ' years.'],
        'Divide by (1 + r) once for every year of waiting.', { unit: 'dollars', chk: { k: 'pv', flows: [[t, FV]], r: r } });
    }
    if (kind === 'perp') {
      var rr = R.pick([0.02, 0.04, 0.05, 0.08, 0.1, 0.125]), Cp = R.int(1, 20) * 100;
      return P('A perpetuity pays ' + money(Cp) + ' at the end of every year forever. What is it worth today at an interest rate of ' + T.pct(rr * 100) + '?', A(Cp / rr),
        ['$PV = \\dfrac{C}{1 + r} + \\dfrac{C}{(1 + r)^2} + \\cdots$, an infinite geometric series with ratio $\\dfrac{1}{1 + r}$.', 'Its sum is $\\dfrac{C/(1 + r)}{1 - 1/(1 + r)} = \\dfrac{C}{r}$.', '$PV = \\dfrac{' + Cp + '}{' + T.num(rr) + '} = ' + nx(Cp / rr) + '$ dollars.'],
        'Sum the geometric series, or remember C/r.', { unit: 'dollars', chk: { k: 'pv', perp: Cp, r: rr } });
    }
    if (kind === 'growing') {
      var rg = R.pick([0.06, 0.08, 0.1]), g = R.pick([0.01, 0.02, 0.03, 0.04].filter(function (x) { return x < rg - 0.01; })), Cg = R.int(1, 10) * 100, pvg = Cg / (rg - g);
      return P('A payment of ' + money(Cg) + ' arrives one year from now and then grows by ' + T.pct(g * 100) + ' a year forever. What is the stream worth today at an interest rate of ' + T.pct(rg * 100) + '?', A(pvg),
        ['Growing perpetuity: $PV = \\dfrac{C}{r - g}$ (the ratio of the series is $\\dfrac{1 + g}{1 + r} < 1$).', '$PV = \\dfrac{' + Cg + '}{' + T.num(rg) + ' - ' + T.num(g) + '} = \\dfrac{' + Cg + '}{' + T.num(fix(rg - g)) + '} = ' + nx(pvg) + '$ dollars.'],
        'Use C/(r − g).', { unit: 'dollars', chk: { k: 'pv', growing: [Cg, g], r: rg } });
    }
    if (kind === 'annuity') {
      var ra = R.pick([0.04, 0.05, 0.06, 0.08, 0.1]), n = R.int(3, 10), Ca = R.int(1, 20) * 100, pva = Ca * (1 - M.pow(1 + ra, -n)) / ra;
      return P(who + ' will receive ' + money(Ca) + ' at the end of each year for ' + n + ' years. At an interest rate of ' + T.pct(ra * 100) + ', what is that stream worth today?', A(pva, { rtol: 0.002 }),
        ['Annuity: $PV = C\\cdot\\dfrac{1 - (1 + r)^{-n}}{r}$, the sum of ' + n + ' discounted payments.', '$(' + T.num(1 + ra) + ')^{-' + n + '} ' + apx(M.pow(1 + ra, -n), 4) + '$.', '$PV = ' + Ca + '\\cdot\\dfrac{1 - ' + dx(M.pow(1 + ra, -n), 4) + '}{' + T.num(ra) + '} ' + apx(pva, 2) + '$ dollars.', 'Less than $' + n + '\\times ' + Ca + ' = ' + (n * Ca) + '$, because later dollars are worth less today.'],
        'An annuity is a perpetuity that stops: C/r times (1 − (1 + r)^(−n)).', { unit: 'dollars', chk: { k: 'pv', flows: U.range(1, n).map(function (t) { return [t, Ca]; }), r: ra } });
    }
    var rc = R.pick([0.05, 0.08, 0.1]), now = R.int(5, 15) * 100, later = M.round(now * M.pow(1 + rc, 3) * R.pick([0.9, 0.95, 1.05, 1.1]) / 10) * 10, pvl = later / M.pow(1 + rc, 3);
    var better = pvl > now ? money(later) + ' in 3 years' : money(now) + ' now';
    return P('At an interest rate of ' + T.pct(rc * 100) + ', which is worth more: ' + money(now) + ' now or ' + money(later) + ' in 3 years?', mc(better, [pvl > now ? money(now) + ' now' : money(later) + ' in 3 years', 'They are worth exactly the same', 'It depends on inflation only, not on the interest rate']),
      ['Compare in today\u2019s dollars: $PV = \\dfrac{' + later + '}{(' + T.num(1 + rc) + ')^3} ' + apx(pvl, 2) + '$.', 'That is ' + (pvl > now ? 'more' : 'less') + ' than ' + money(now) + ', so ' + better + ' is worth more.'],
      'Discount the later amount to today, then compare.', { chk: { k: 'pvcmp', now: now, later: later, t: 3, r: rc, ans: better } });
  });

  G('imicro.intertemporal-choice', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['c1', 'save', 'c1'], ['c1', 'save', 'c2', 'class'], ['save', 'c2', 'beta', 'rate']));
    var who = person(R), r = R.pick([0.05, 0.1, 0.2, 0.25]), beta = kind === 'beta' ? R.pick([Q(1, 2), Q(2, 3), Q(3, 4)]) : Q(1);
    var m1, m2, W, c1, s, c2, tq = 0;
    do { m1 = R.int(2, 20) * 10; m2 = Q(R.int(0, 20) * 10).mul(rat(1 + r)); W = Q(m1).add(m2.div(rat(1 + r))); c1 = W.div(beta.add(1)); s = Q(m1).sub(c1); c2 = s.mul(rat(1 + r)).add(m2); tq++; } while (tq < 100 && (decPlaces(c1) > 2 || decPlaces(c2) > 2));
    if (kind === 'rate') m2 = Q(0);
    if (kind === 'rate') { W = Q(m1); c1 = W.div(2); s = Q(m1).sub(c1); c2 = s.mul(rat(1 + r)); }
    var Ut = beta.eq(1) ? 'U = \\ln c_1 + \\ln c_2' : 'U = \\ln c_1 + ' + beta.toTex() + '\\ln c_2', Up = beta.eq(1) ? 'ln(x)+ln(y)' : 'ln(x)+' + beta.toPlain() + '*ln(y)';
    var intro = who + ' earns ' + money(m1) + ' this year and ' + money(m2) + ' next year, and can borrow or save at ' + T.pct(r * 100) + '. ' + who.Her + ' utility is $' + Ut + '$.';
    var base = ['Present value of income: $W = ' + m1 + ' + \\dfrac{' + nx(m2) + '}{' + T.num(1 + r) + '} = ' + nx(W) + '$. Budget: $c_1 + \\dfrac{c_2}{' + T.num(1 + r) + '} = ' + nx(W) + '$.', 'With log utility, consumption now gets the share $\\dfrac{1}{1 + \\beta}$ of $W$ (here $\\beta = ' + beta.toTex() + '$): $c_1 = ' + nx(c1) + '$.'];
    var chk = { k: 'inter', m: [m1, m2.toNumber()], r: r, beta: beta.toNumber() };
    if (kind === 'c1' || kind === 'beta') return P(intro + ' How much does ' + who.she + ' consume this year?', A(c1), base.concat(['Check the tangency: $MRS = \\dfrac{c_2}{' + (beta.eq(1) ? '' : beta.toTex()) + 'c_1}$ should equal $1 + r$; with $c_2 = ' + nx(c2) + '$ it does.']), 'Find the present value of all income, then the log-utility share for now.', { unit: 'dollars', chk: Object.assign({ ask: 'c1' }, chk) });
    if (kind === 'save' || kind === 'rate') return P(intro + ' How much does ' + who.she + ' save this year? (Negative means borrowing.)', A(s), base.concat(['Saving: $s = m_1 - c_1 = ' + m1 + ' - ' + nx(c1) + ' = ' + nx(s) + '$' + (s.sign() < 0 ? ', so ' + who.she + ' borrows ' + nx(s.neg()) + '.' : '.')].concat(kind === 'rate' ? ['With all income now ($m_2 = 0$) and log utility, $c_1 = m_1/2$ whatever the interest rate: the income and substitution effects of a rate change cancel.'] : [])), 'Saving is this year\u2019s income minus this year\u2019s consumption.', { unit: 'dollars', chk: Object.assign({ ask: 's' }, chk) });
    if (kind === 'c2') return P(intro + ' How much does ' + who.she + ' consume next year?', A(c2), base.concat(['Saving: $' + m1 + ' - ' + nx(c1) + ' = ' + nx(s) + '$.', 'Next year: $c_2 = m_2 + (1 + r)s = ' + nx(m2) + ' + ' + T.num(1 + r) + '(' + nx(s) + ') = ' + nx(c2) + '$.']), 'Next year\u2019s income plus saving with interest (or minus the loan repaid with interest).', { unit: 'dollars', chk: Object.assign({ ask: 'c2' }, chk) });
    var lab = s.sign() > 0 ? 'A saver: she consumes less than her income this year' : s.sign() < 0 ? 'A borrower: she consumes more than her income this year' : 'Neither: she consumes exactly her income each year';
    lab = lab.replace(/she|her/g, function (w0) { return w0 === 'she' ? who.she : who.her; });
    var alls = ['A saver: she consumes less than her income this year', 'A borrower: she consumes more than her income this year', 'Neither: she consumes exactly her income each year'].map(function (t) { return t.replace(/she|her/g, function (w0) { return w0 === 'she' ? who.she : who.her; }); });
    return P(intro + ' Is ' + who.she + ' a saver or a borrower this year?', mc(lab, alls.filter(function (t) { return t !== lab; }).concat(['A saver, because the interest rate is positive'])), base.concat(['Compare $c_1 = ' + nx(c1) + '$ with $m_1 = ' + m1 + '$: ' + lab + '.']), 'Compare this year\u2019s consumption with this year\u2019s income.', { chk: { k: 'interclass', m: [m1, m2.toNumber()], r: r, beta: 1, alls: alls } });
  });

  // lotteries with square-root utility on perfect squares
  function sqLottery(R) {
    var roots = R.sample([4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 20], 2).sort(function (a, b) { return a - b; }), p = R.pick([Q(1, 2), Q(1, 4), Q(3, 4), Q(1, 3), Q(2, 3), Q(1, 5), Q(2, 5)]);
    return { w: [roots[0] * roots[0], roots[1] * roots[1]], r: roots, p: p }; // p = chance of the high outcome
  }
  G('imicro.expected-utility', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['eu', 'eu', 'ew'], ['eu', 'cmp', 'ueu', 'ew'], ['cmp', 'eu', 'ueu', 'cmp']));
    var who = person(R), L = sqLottery(R), pL = L.p, qL = Q(1).sub(pL);
    var desc = 'a ' + pL.toTex().replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') + ' chance of ' + money(L.w[1]) + ' and a ' + qL.toTex().replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') + ' chance of ' + money(L.w[0]);
    var EU = pL.mul(L.r[1]).add(qL.mul(L.r[0])), EW = pL.mul(L.w[1]).add(qL.mul(L.w[0]));
    if (kind === 'eu') return P(who + '\u2019s utility of wealth is $u(W) = \\sqrt{W}$. A lottery gives ' + desc + '. What is its expected utility $E[u(W)]$?', A(EU),
      ['Expected utility weights the <i>utilities</i> by the probabilities: $E[u] = ' + pL.toTex() + '\\sqrt{' + L.w[1] + '} + ' + qL.toTex() + '\\sqrt{' + L.w[0] + '}$.', '$= ' + pL.toTex() + '(' + L.r[1] + ') + ' + qL.toTex() + '(' + L.r[0] + ') = ' + nx(EU) + '$.'],
      'Take the utility of each outcome first, then the probability-weighted average.', { chk: { k: 'eu', w: L.w, p: pL.toNumber(), u: 'sqrt', ask: 'eu' } });
    if (kind === 'ew') return P('A lottery gives ' + desc + '. What is its expected value $E[W]$ in dollars?', A(EW),
      ['$E[W] = ' + pL.toTex() + '(' + L.w[1] + ') + ' + qL.toTex() + '(' + L.w[0] + ') = ' + nx(EW) + '$.', 'This is the average in dollars. A risk-averse person values the lottery at less than this, which the next questions measure with expected utility.'],
      'Probability-weighted average of the dollar amounts.', { unit: 'dollars', chk: { k: 'eu', w: L.w, p: pL.toNumber(), ask: 'ew' } });
    if (kind === 'ueu') return P(who + '\u2019s utility of wealth is $u(W) = \\sqrt{W}$, and a lottery gives ' + desc + '. Which is larger: the expected utility $E[u(W)]$ or the utility of the expected value $u(E[W])$? Enter the difference $u(E[W]) - E[u(W)]$.', { t: 'num', v: String(sgf(M.sqrt(EW.toNumber()) - EU.toNumber(), 6)), tol: 0.006 },
      ['$E[u(W)] = ' + nx(EU) + '$.', '$E[W] = ' + nx(EW) + '$, so $u(E[W]) = \\sqrt{' + nx(EW) + '} ' + apx(M.sqrt(EW.toNumber()), 3) + '$.', 'Difference $' + apx(M.sqrt(EW.toNumber()) - EU.toNumber(), 3) + '$: positive, as it must be for a concave $u$ (Jensen\u2019s inequality). The sure average beats the gamble for this person.'],
      'Compute both; they are not the same thing.', { chk: { k: 'eu', w: L.w, p: pL.toNumber(), u: 'sqrt', ask: 'gap' } });
    // compare two lotteries with the same expected value or a sure amount
    var sure = M.floor(EW.toNumber() * R.pick([0.82, 0.88, 0.94, 0.97])); if (M.abs(M.sqrt(sure) - EU.toNumber()) < 1e-9) sure -= 1; var uS = M.sqrt(sure), pick2 = uS > EU.toNumber() ? 'The sure ' + money(sure) : 'The lottery';
    return P(who + '\u2019s utility of wealth is $u(W) = \\sqrt{W}$. Which does ' + who.she + ' prefer: the sure amount ' + money(sure) + ', or a lottery with ' + desc + '?', mc(pick2, [pick2 === 'The lottery' ? 'The sure ' + money(sure) : 'The lottery', 'She is indifferent between them'.replace('She', who.She), 'The one with the higher expected value, whatever her utility']),
      ['Lottery: $E[u] = ' + nx(EU) + '$ (its expected value is ' + money(EW.toNumber()) + ').', 'Sure amount: $u = \\sqrt{' + sure + '} ' + apx(uS, 3) + '$.', pick2 === 'The lottery' ? 'The lottery has the higher expected utility, so ' + who.she + ' takes it.' : 'The sure amount has the higher expected utility, even though the lottery\u2019s expected value is higher: ' + who.she + ' gives up some expected value to avoid risk.'],
      'Compare expected utilities, not expected values.', { chk: { k: 'eucmp', w: L.w, p: pL.toNumber(), sure: sure, ans: pick2 } });
  });

  G('imicro.risk-aversion', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['ce', 'rp', 'ce'], ['ce', 'rp', 'lnce', 'accept', 'ap'], ['rp', 'lnce', 'accept', 'ap', 'ce']));
    var who = person(R);
    if (kind === 'ce' || kind === 'rp') {
      var L = sqLottery(R), p = L.p, q = Q(1).sub(p), EU = p.mul(L.r[1]).add(q.mul(L.r[0])), CE = EU.mul(EU), EW = p.mul(L.w[1]).add(q.mul(L.w[0])), RP = EW.sub(CE);
      var desc = money(L.w[1]) + ' with probability $' + p.toTex() + '$ and ' + money(L.w[0]) + ' otherwise';
      var st = ['$E[u] = ' + p.toTex() + '\\sqrt{' + L.w[1] + '} + ' + q.toTex() + '\\sqrt{' + L.w[0] + '} = ' + nx(EU) + '$.', 'Certainty equivalent: the sure wealth with the same utility, $\\sqrt{CE} = ' + nx(EU) + '$, so $CE = ' + nx(EU) + '^2 = ' + nx(CE) + '$.'];
      if (kind === 'ce') return P(who + '\u2019s utility of wealth is $u(W) = \\sqrt{W}$. ' + who.Her + ' wealth will be ' + desc + '. What is ' + who.her + ' certainty equivalent?', A(CE), st.concat(['Below the expected value ' + nx(EW) + ': ' + who.she + ' would swap the gamble for any sure amount above ' + nx(CE) + '.']), 'Find the expected utility, then undo u.', { unit: 'dollars', chk: { k: 'ce', w: L.w, p: p.toNumber(), u: 'sqrt', ask: 'ce' } });
      return P(who + '\u2019s utility of wealth is $u(W) = \\sqrt{W}$. ' + who.Her + ' wealth will be ' + desc + '. What is the risk premium (expected value minus certainty equivalent)?', A(RP), st.concat(['$E[W] = ' + nx(EW) + '$.', 'Risk premium $= ' + nx(EW) + ' - ' + nx(CE) + ' = ' + nx(RP) + '$: the expected value ' + who.she + ' would give up to remove the risk.']), 'Risk premium = E[W] − CE.', { unit: 'dollars', chk: { k: 'ce', w: L.w, p: p.toNumber(), u: 'sqrt', ask: 'rp' } });
    }
    if (kind === 'lnce') {
      var base = R.pick([[16, 64], [25, 100], [9, 36], [36, 144], [4, 64], [10, 1000], [20, 80]]);
      var g = M.sqrt(base[0] * base[1]);
      return P(who + '\u2019s utility of wealth is $u(W) = \\ln W$ (wealth in thousands of dollars). ' + who.Her + ' wealth will be ' + base[1] + ' or ' + base[0] + ' with equal chances. What is ' + who.her + ' certainty equivalent (in thousands)?', A(g),
        ['$E[u] = \\tfrac{1}{2}\\ln ' + base[1] + ' + \\tfrac{1}{2}\\ln ' + base[0] + ' = \\ln\\sqrt{' + base[1] + '\\cdot ' + base[0] + '}$.', '$CE = \\sqrt{' + (base[0] * base[1]) + '} = ' + nx(g) + '$, the geometric mean, below the expected value ' + nx((base[0] + base[1]) / 2) + '.'],
        'With equal chances and log utility, the certainty equivalent is the geometric mean.', { unit: 'thousand dollars', chk: { k: 'ce', w: base, p: 0.5, u: 'ln', ask: 'ce' } });
    }
    if (kind === 'ap') {
      var u = R.pick(['sqrt', 'ln']), Wv = R.pick([25, 50, 100, 200, 400]), ar = u === 'sqrt' ? Q(1, 2 * Wv) : Q(1, Wv);
      return P('For $u(W) = ' + (u === 'sqrt' ? '\\sqrt{W}' : '\\ln W') + '$, what is the Arrow-Pratt measure of absolute risk aversion $A(W) = -\\dfrac{u\'\'(W)}{u\'(W)}$ at $W = ' + Wv + '$?', A(ar),
        u === 'sqrt' ? ['$u\' = \\tfrac{1}{2}W^{-1/2}$ and $u\'\' = -\\tfrac{1}{4}W^{-3/2}$.', '$A(W) = \\dfrac{\\tfrac{1}{4}W^{-3/2}}{\\tfrac{1}{2}W^{-1/2}} = \\dfrac{1}{2W} = ' + nx(ar) + '$.', 'It falls as wealth rises: richer people are less averse to a gamble of a fixed dollar size.'] : ['$u\' = 1/W$ and $u\'\' = -1/W^2$.', '$A(W) = \\dfrac{1/W^2}{1/W} = \\dfrac{1}{W} = ' + nx(ar) + '$.'],
        'Differentiate twice, then divide.', { chk: { k: 'ap', u: u, W: Wv } });
    }
    // accept a 50-50 gamble?
    var W0r = R.pick([10, 12, 15, 20]), up = R.int(1, 5), dn = R.int(1, 4), W0 = W0r * W0r, gain = (W0r + up) * (W0r + up) - W0, loss = W0 - (W0r - dn) * (W0r - dn);
    var euA = (W0r + up + W0r - dn) / 2, acc = euA > W0r ? 'Accept' : euA < W0r ? 'Reject' : 'Indifferent';
    var text = { Accept: 'Accept: the gamble raises her expected utility', Reject: 'Reject: the gamble lowers her expected utility', Indifferent: 'Indifferent: the gamble leaves her expected utility unchanged' };
    var tt = function (s) { return s.replace(/her/g, who.her); };
    return P(who + ' has wealth ' + money(W0) + ' and utility $u(W) = \\sqrt{W}$. ' + who.She + ' is offered a coin flip: win ' + money(gain) + ' or lose ' + money(loss) + '. Should ' + who.she + ' accept?', mc(tt(text[acc]), Object.keys(text).filter(function (k) { return k !== acc; }).map(function (k) { return tt(text[k]); }).concat(['Reject: a risk-averse person never accepts a gamble'])),
      ['Expected gain in dollars: $\\tfrac{1}{2}(' + gain + ') - \\tfrac{1}{2}(' + loss + ') = ' + nx((gain - loss) / 2) + '$.', 'Accept: $E[u] = \\tfrac{1}{2}\\sqrt{' + (W0 + gain) + '} + \\tfrac{1}{2}\\sqrt{' + (W0 - loss) + '} = \\tfrac{1}{2}(' + (W0r + up) + ' + ' + (W0r - dn) + ') = ' + nx(euA) + '$.', 'Reject: $u = \\sqrt{' + W0 + '} = ' + W0r + '$.', acc === 'Accept' ? 'Accepting gives more expected utility: the expected gain is big enough to cover the risk.' : acc === 'Reject' ? 'Rejecting gives more: the expected gain is too small to pay for the risk.' : 'They are equal.'],
      'Compare the expected utility of accepting with the utility of keeping her wealth.', { chk: { k: 'accept', W: W0, gain: gain, loss: loss, text: text, who: who.her } });
  });

  G('imicro.insurance', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['fair', 'max', 'fair'], ['fair', 'max', 'rp', 'cover'], ['max', 'rp', 'unfair', 'cover']));
    var who = person(R), item = R.pick(['car', 'bike shop', 'house', 'boat', 'food truck']);
    // wealth a^2, loss leaves b^2, probability pi of loss
    var a, b, pi, tries = 0;
    do { a = R.int(8, 20); b = R.int(3, a - 2); pi = R.pick([Q(1, 2), Q(1, 4), Q(1, 5), Q(1, 10), Q(1, 3), Q(1, 8)]); tries++; } while (tries < 200 && !Q(1).sub(pi).mul(a).add(pi.mul(b)).isInt());
    var W = a * a, Lo = W - b * b, EU = Q(1).sub(pi).mul(a).add(pi.mul(b)), CE = EU.mul(EU), maxP = Q(W).sub(CE), fair = pi.mul(Lo);
    var intro = who + '\u2019s wealth is ' + money(W) + ' thousand, including a ' + item + '. With probability $' + pi.toTex() + '$ ' + who.she + ' loses ' + money(Lo) + ' thousand. ' + who.Her + ' utility of wealth is $u(W) = \\sqrt{W}$, with $W$ in thousands of dollars.';
    if (kind === 'fair') return P(intro + ' What is the actuarially fair premium for full coverage?', A(fair),
      ['A fair premium equals the expected payout: probability of the loss times its size.', '$' + pi.toTex() + '\\times ' + Lo + ' = ' + nx(fair) + '$ dollars.', 'At that price the insurer breaks even on average, and a risk-averse buyer chooses full coverage.'],
      'Expected loss.', { unit: 'thousand dollars', chk: { k: 'ins', W: W, L: Lo, pi: pi.toNumber(), ask: 'fair' } });
    var st = ['Without insurance: $E[u] = ' + Q(1).sub(pi).toTex() + '\\sqrt{' + W + '} + ' + pi.toTex() + '\\sqrt{' + (b * b) + '} = ' + Q(1).sub(pi).toTex() + '(' + a + ') + ' + pi.toTex() + '(' + b + ') = ' + nx(EU) + '$.', 'With full coverage at premium $P$, wealth is $' + W + ' - P$ for sure. ' + who.She + ' buys if $\\sqrt{' + W + ' - P} \\ge ' + nx(EU) + '$, that is, $P \\le ' + W + ' - ' + nx(EU) + '^2 = ' + W + ' - ' + nx(CE) + ' = ' + nx(maxP) + '$.'];
    if (kind === 'max') return P(intro + ' What is the most ' + who.she + ' would pay for insurance that fully covers the loss?', A(maxP), st, 'Find the sure wealth with the same utility as going uninsured.', { unit: 'thousand dollars', chk: { k: 'ins', W: W, L: Lo, pi: pi.toNumber(), ask: 'max' } });
    if (kind === 'rp') return P(intro + ' How much more than the expected loss would ' + who.she + ' be willing to pay for full coverage (the risk premium)?', A(maxP.sub(fair)), st.concat(['Expected loss: $' + pi.toTex() + '\\times ' + Lo + ' = ' + nx(fair) + '$.', 'Risk premium: $' + nx(maxP) + ' - ' + nx(fair) + ' = ' + nx(maxP.sub(fair)) + '$. Paying above the expected loss can still make a risk-averse buyer better off.']), 'Maximum premium minus expected loss.', { unit: 'thousand dollars', chk: { k: 'ins', W: W, L: Lo, pi: pi.toNumber(), ask: 'rp' } });
    if (kind === 'cover') return P(intro + ' Insurance costs $\\gamma = ' + pi.toTex() + '$ per dollar of coverage (actuarially fair). How much coverage (in thousands of dollars) does ' + who.she + ' buy?', A(Lo),
      ['With coverage $K$ at price $\\gamma$ per dollar: wealth is $' + W + ' - \\gamma K$ with no loss and $' + W + ' - ' + Lo + ' + (1 - \\gamma)K$ with the loss.', 'First-order condition: $\\pi(1 - \\gamma)u\'(W_{\\text{loss}}) = (1 - \\pi)\\gamma\\,u\'(W_{\\text{no loss}})$. With $\\gamma = \\pi$ this says $u\'(W_{\\text{loss}}) = u\'(W_{\\text{no loss}})$.', 'Since $u\'$ is strictly decreasing, wealth must be equal in both states: full coverage, $K = ' + Lo + '$.'],
      'With fair odds, a risk-averse buyer equalizes wealth across the two states.', { unit: 'thousand dollars', chk: { k: 'ins', W: W, L: Lo, pi: pi.toNumber(), gamma: pi.toNumber(), u: 'sqrt', ask: 'cover' } });
    // unfair premium, log utility: interior coverage
    var Wl = R.pick([100, 200, 400]), Ll = Wl * R.pick([0.5, 0.6, 0.75]), pil = R.pick([0.1, 0.2, 0.25]), gl = fix(pil + R.pick([0.02, 0.05])), K = (pil * (1 - gl) * Wl - (1 - pil) * gl * (Wl - Ll)) / (gl * (1 - gl));
    if (K <= 0) { gl = fix(pil + 0.01); K = (pil * (1 - gl) * Wl - (1 - pil) * gl * (Wl - Ll)) / (gl * (1 - gl)); }
    return P(who + ' has wealth ' + Wl + ' (thousand dollars) and faces a loss of ' + Ll + ' with probability ' + pil + '. ' + who.Her + ' utility is $u(W) = \\ln W$. Coverage costs $\\gamma = ' + gl + '$ per dollar, more than the fair price ' + pil + '. How much coverage $K$ (in thousands) does ' + who.she + ' buy?', A(K, { rtol: 0.01 }),
      ['Maximize $' + pil + '\\ln(' + (Wl - Ll) + ' + ' + T.num(fix(1 - gl)) + 'K) + ' + T.num(fix(1 - pil)) + '\\ln(' + Wl + ' - ' + gl + 'K)$.', 'FOC: $\\dfrac{' + pil + '(' + T.num(fix(1 - gl)) + ')}{' + (Wl - Ll) + ' + ' + T.num(fix(1 - gl)) + 'K} = \\dfrac{' + T.num(fix(1 - pil)) + '(' + gl + ')}{' + Wl + ' - ' + gl + 'K}$.', 'Solving: $K = \\dfrac{\\pi(1 - \\gamma)W - (1 - \\pi)\\gamma(W - L)}{\\gamma(1 - \\gamma)} ' + apx(K, 1) + '$.', 'Less than the full ' + Ll + ': when insurance costs more than its expected payout, a risk-averse buyer keeps part of the risk.'],
      'Write wealth in each state as a function of K, then set the derivative of expected utility to zero.', { unit: 'thousand dollars', chk: { k: 'ins', W: Wl, L: Ll, pi: pil, gamma: gl, u: 'ln', ask: 'cover' } });
  });

  // =================================================================== Unit 5: Production and Cost

  // a Cobb-Douglas technology Q = A K^al L^be with points where the numbers come out exact
  function cdTech(R, ctx) {
    var ex = R.pick(lv(ctx, [[Q(1, 2), Q(1, 2)]], [[Q(1, 2), Q(1, 2)], [Q(1, 3), Q(2, 3)], [Q(2, 3), Q(1, 3)], [Q(1, 4), Q(3, 4)], [Q(1, 2), Q(1, 4)]], [[Q(1, 3), Q(2, 3)], [Q(1, 4), Q(3, 4)], [Q(3, 4), Q(1, 4)], [Q(1, 2), Q(1, 4)], [Q(1, 3), Q(1, 3)], [Q(1, 2), Q(1, 2)]]));
    var al = ex[0], be = ex[1], A0 = R.pick([1, 2, 3, 4, 5, 10]);
    function base(e) { var d = e.den(); return d === 1 ? R.int(2, 9) : M.pow(R.int(1, 4), d) || 1; }
    var lcm = U.lcm(al.den(), be.den()), K = M.pow(R.int(1, 3), lcm), L = M.pow(R.int(1, 3), lcm);
    if (K === L && R.coin()) L = M.pow(R.int(2, 4), lcm);
    var tex = (A0 === 1 ? '' : A0) + pw('K', al) + pw('L', be), plain = A0 + '*K^(' + al.toPlain() + ')*L^(' + be.toPlain() + ')';
    var at = function (k, l) { return Q(A0).mul(rootPow(k, al)).mul(rootPow(l, be)); };
    return { al: al, be: be, A: A0, K: K, L: L, tex: tex, plain: plain, at: at,
      mpl: function (k, l) { return Q(A0).mul(be).mul(rootPow(k, al)).mul(rootPow(l, be.sub(1))); },
      mpk: function (k, l) { return Q(A0).mul(al).mul(rootPow(k, al.sub(1))).mul(rootPow(l, be)); },
      mplTex: cfq(be.mul(A0)) + pw('K', al) + pw('L', be.sub(1)), mpkTex: cfq(al.mul(A0)) + pw('K', al.sub(1)) + pw('L', be) };
  }

  G('imicro.production-functions', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['mpl', 'apl', 'mpl'], ['mpl', 'apl', 'mpk', 'poly', 'dim'], ['poly', 'expr', 'mpk', 'dim', 'polymax']));
    var firm = R.pick(['A bakery', 'A print shop', 'A small brewery', 'A furniture workshop', 'A delivery service']);
    if (kind === 'poly' || kind === 'polymax') {
      var a = R.int(4, 20), b = R.int(1, 4), c = R.pick([Q(1, 10), Q(1, 5), Q(1, 3), Q(1, 2)]), L0 = R.int(2, 12);
      var mp = function (l) { return Q(a).add(Q(2 * b * l)).sub(c.mul(3 * l * l)); }, qf = function (l) { return Q(a * l + b * l * l).sub(c.mul(l * l * l)); };
      var Qt = a + 'L + ' + T.mono(b, 'L^2') + ' - ' + c.toTex() + 'L^3';
      if (kind === 'polymax') { var Lm = Q(2 * b).div(c.mul(6)); return P(firm + ' with a fixed building makes $Q = ' + Qt + '$ with $L$ workers. At what $L$ is the marginal product of labor largest (where diminishing marginal returns set in)?', A(Lm),
        ['$MP_L = \\dfrac{dQ}{dL} = ' + a + ' + ' + T.mono(2 * b, 'L') + ' - ' + cq(c.mul(3), 'L^2')+ '$.', 'It peaks where its own derivative is zero: $' + (2 * b) + ' - ' + cq(c.mul(6), 'L') + ' = 0$, so $L = ' + nx(Lm) + '$.', 'Beyond that point each added worker adds less than the one before: diminishing marginal returns, though total output still rises while $MP_L > 0$.'],
        'Maximize MP_L: set its derivative to zero.', { unit: 'workers', chk: { k: 'mpmax', f: a + '*x+' + b + '*x^2-' + c.toPlain() + '*x^3' } }); }
      var mv = mp(L0);
      return P(firm + ' with a fixed building makes $Q = ' + Qt + '$ units a day with $L$ workers. What is the marginal product of labor at $L = ' + L0 + '$?', A(mv),
        ['$MP_L = \\dfrac{dQ}{dL} = ' + a + ' + ' + T.mono(2 * b, 'L') + ' - ' + cq(c.mul(3), 'L^2')+ '$.', 'At $L = ' + L0 + '$: $' + a + ' + ' + (2 * b * L0) + ' - ' + nx(c.mul(3 * L0 * L0)) + ' = ' + nx(mv) + '$.', 'Compare the average product: $Q/L = ' + nx(qf(L0).div(L0)) + '$. The marginal product is the extra output from one more worker; the average is output per worker.'],
        'Differentiate Q with respect to L.', { unit: 'units', chk: { k: 'dpoly', f: a + '*x+' + b + '*x^2-' + c.toPlain() + '*x^3', at: L0 } });
    }
    var t = cdTech(R, ctx), K = t.K, L = t.L;
    var intro = firm + ' produces $Q = ' + t.tex + '$ from capital $K$ and labor $L$. ';
    if (kind === 'mpl') return P(intro + 'Find the marginal product of labor at $K = ' + K + '$, $L = ' + L + '$.', A(t.mpl(K, L)),
      ['$MP_L = \\dfrac{\\partial Q}{\\partial L} = ' + t.mplTex + '$ (hold $K$ fixed).', 'At $K = ' + K + '$, $L = ' + L + '$: $MP_L = ' + nx(t.mpl(K, L)) + '$.', 'One more worker (a small step in $L$) adds about ' + nx(t.mpl(K, L)) + ' units of output.'],
      'Differentiate with respect to L, treating K as a constant.', { unit: 'units', chk: { k: 'mp', f: t.plain, wrt: 'L', at: [K, L] } });
    if (kind === 'mpk') return P(intro + 'Find the marginal product of capital at $K = ' + K + '$, $L = ' + L + '$.', A(t.mpk(K, L)),
      ['$MP_K = \\dfrac{\\partial Q}{\\partial K} = ' + t.mpkTex + '$ (hold $L$ fixed).', 'At the point: $MP_K = ' + nx(t.mpk(K, L)) + '$.'],
      'Differentiate with respect to K, treating L as a constant.', { unit: 'units', chk: { k: 'mp', f: t.plain, wrt: 'K', at: [K, L] } });
    if (kind === 'apl') {
      var ap = t.at(K, L).div(L), mpl = t.mpl(K, L);
      return P(intro + 'At $K = ' + K + '$, $L = ' + L + '$, what is the <b>average</b> product of labor, $Q/L$?', A(ap),
        ['$Q = ' + nx(t.at(K, L)) + '$ at that point.', '$AP_L = Q/L = ' + nx(t.at(K, L)) + '/' + L + ' = ' + nx(ap) + '$.', 'The marginal product there is $' + nx(mpl) + '$, which is $' + t.be.toTex() + '$ of the average: for Cobb-Douglas, $MP_L = \\beta\\cdot AP_L$.'],
        'Output divided by workers.', { unit: 'units', chk: { k: 'apl', f: t.plain, at: [K, L] } });
    }
    if (kind === 'expr') return P(intro + 'Write the marginal product of labor $MP_L$ as an expression in $K$ and $L$.', expr(t.A + '*' + t.be.toPlain() + '*K^(' + t.al.toPlain() + ')*L^(' + t.be.sub(1).toPlain() + ')', ['K', 'L']),
      ['Hold $K$ fixed: the factor $' + (t.A === 1 ? '' : t.A) + pw('K', t.al) + '$ rides along.', 'Power rule on $' + pw('L', t.be) + '$: $' + cfq(t.be) + pw('L', t.be.sub(1)) + '$.', '$MP_L = ' + t.mplTex + '$.'],
      'Power rule in L; K is a constant.', { chk: { k: 'mpexpr', f: t.plain, wrt: 'L' } });
    if (R.chance(0.35)) { var be2 = R.pick([Q(1), Q(3, 2)]); t = { al: Q(1, 2), be: be2, tex: t.A === 1 ? pw('K', Q(1, 2)) + pw('L', be2) : t.A + pw('K', Q(1, 2)) + pw('L', be2), plain: t.A + '*K^(1/2)*L^(' + be2.toPlain() + ')', mplTex: cfq(be2.mul(t.A)) + pw('K', Q(1, 2)) + pw('L', be2.sub(1)) }; intro = firm + ' produces $Q = ' + t.tex + '$ from capital $K$ and labor $L$. '; }
    var d = t.be.lt(1) ? 'Yes: MP of labor falls as L rises (K fixed)' : 'No: MP of labor does not fall';
    return P(intro + 'Holding $K$ fixed, does the marginal product of labor diminish as $L$ rises?', mc(d, ['Yes: MP of labor falls as L rises (K fixed)', 'No: MP of labor does not fall', 'Only if the firm also has decreasing returns to scale', 'It depends on the wage'].filter(function (x) { return x !== d; })),
      ['$MP_L = ' + (t.mplTex || '') + '$; the exponent on $L$ is $' + expTex(t.be.sub(1)) + '$.', t.be.lt(1) ? 'A negative exponent: as $L$ grows with $K$ fixed, $MP_L$ falls. Diminishing marginal product of labor.' : 'Not negative, so $MP_L$ does not fall as $L$ grows.', 'This is about one input growing alone; it says nothing by itself about returns to scale.'],
      'Look at the exponent of L in MP_L.', { chk: { k: 'dimmp', f: t.plain, ans: d } });
  });

  G('imicro.isoquants-mrts', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['mrts', 'find', 'mrts'], ['mrts', 'find', 'subs', 'fixed'], ['mrts', 'find', 'fixed', 'expr']));
    var firm = R.pick(['A car wash', 'A data center', 'A farm', 'A call center', 'A bike factory']);
    if (kind === 'subs') {
      var a = R.int(1, 6), b = R.intNot(1, 6, a), pt = [R.int(1, 12), R.int(1, 12)];
      return P(firm + ' can use machines ($K$) and workers ($L$) as perfect substitutes: $Q = ' + T.mono(a, 'L') + ' + ' + T.mono(b, 'K') + '$. What is the MRTS ($MP_L/MP_K$) at $K = ' + pt[0] + '$, $L = ' + pt[1] + '$?', A(Q(a, b)),
        ['$MP_L = ' + a + '$ and $MP_K = ' + b + '$.', '$MRTS = ' + fr(a, b) + ' = ' + nx(Q(a, b)) + '$ everywhere: straight-line isoquants.'],
        'Divide the constant marginal products.', { chk: { k: 'mrts', f: a + '*L+' + b + '*K', at: [pt[0], pt[1]] } });
    }
    if (kind === 'fixed') {
      var ka = R.int(1, 3), la = R.int(1, 4), q = R.int(2, 12) * ka * la, ask = R.pick(['K', 'L']);
      return P(firm + ' needs ' + ka + ' machine' + (ka > 1 ? 's' : '') + ' and ' + la + ' worker' + (la > 1 ? 's' : '') + ' per unit of output: $Q = \\min\\{' + (ka === 1 ? 'K' : 'K/' + ka) + ', ' + (la === 1 ? 'L' : 'L/' + la) + '\\}$. With no waste, how many ' + (ask === 'K' ? 'machines' : 'workers') + ' does it use to make ' + q + ' units?', A(ask === 'K' ? ka * q : la * q),
        ['The isoquant is L-shaped; the corner uses no spare input: $' + (ka === 1 ? 'K' : 'K/' + ka) + ' = ' + (la === 1 ? 'L' : 'L/' + la) + ' = ' + q + '$.', '$K = ' + (ka * q) + '$, $L = ' + (la * q) + '$.', 'Extra machines without workers (or the reverse) add nothing.'],
        'At the corner both terms of the min equal q.', { unit: ask === 'K' ? 'machines' : 'workers', chk: { k: 'fixedq', a: [ka, la], q: q, ask: ask } });
    }
    var t = cdTech(R, ctx), K = t.K, L = t.L, rr = t.be.div(t.al), mr = rr.mul(Q(K, L));
    var intro = firm + ' produces $Q = ' + t.tex + '$. ';
    var mrTex = (rr.eq(1) ? '' : rr.isInt() ? rr.toPlain() : rr.toTex()) + '\\dfrac{K}{L}';
    if (kind === 'mrts') return P(intro + 'What is the marginal rate of technical substitution $MRTS = MP_L/MP_K$ at $K = ' + K + '$, $L = ' + L + '$?', A(mr),
      ['$MP_L = ' + t.mplTex + '$ and $MP_K = ' + t.mpkTex + '$.', '$MRTS = \\dfrac{MP_L}{MP_K} = ' + mrTex + '$ (the powers and $A$ cancel).', 'At the point: $' + mrTex.replace('\\dfrac{K}{L}', '\\cdot\\dfrac{' + K + '}{' + L + '}') + ' = ' + nx(mr) + '$. One more worker can replace about ' + nx(mr) + ' units of capital with output unchanged.'],
      'Labor\u2019s marginal product goes on top.', { chk: { k: 'mrts', f: t.plain, at: [K, L] } });
    if (kind === 'expr') return P(intro + 'Write the MRTS ($MP_L/MP_K$) as an expression in $K$ and $L$.', expr((rr.num() === 1 ? 'K' : rr.num() + '*K') + '/' + (rr.den() === 1 ? 'L' : '(' + rr.den() + '*L)'), ['K', 'L']),
      ['$MP_L = ' + t.mplTex + '$ and $MP_K = ' + t.mpkTex + '$.', 'Divide and cancel: $MRTS = ' + mrTex + '$.'], 'Divide MP_L by MP_K.', { chk: { k: 'mrtsexpr', f: t.plain } });
    // find K on the isoquant through (K, L) at a new L (square-root technology for exact numbers)
    var Ksq = R.int(1, 12), Lsq = R.int(1, 12), q2 = 0, L2, K2, tries = 0;
    do { Ksq = R.int(1, 16); Lsq = R.int(1, 16); L2 = R.intNot(1, 24, Lsq); K2 = Q(Ksq * Lsq, L2); tries++; } while (tries < 200 && (!K2.isInt() || !U.isSquare(Ksq * Lsq)));
    q2 = M.sqrt(Ksq * Lsq);
    return P(firm + ' produces $Q = \\sqrt{KL}$. The bundle $K = ' + Ksq + '$, $L = ' + Lsq + '$ makes ' + nx(q2) + ' units. If it uses $L = ' + L2 + '$ workers instead, how much capital keeps output at ' + nx(q2) + '?', A(K2),
      ['On the isoquant $\\sqrt{KL} = ' + nx(q2) + '$, so $KL = ' + (Ksq * Lsq) + '$.', '$K = ' + (Ksq * Lsq) + '/' + L2 + ' = ' + nx(K2) + '$.', 'An isoquant is every input mix that makes the same output, not the same cost.'],
      'Keep K times L the same.', { unit: 'units of capital', chk: { k: 'isoq', f: 'sqrt(K*L)', p0: [Ksq, Lsq], L1: L2 } });
  });

  G('imicro.returns-to-scale', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['class', 'double', 'class'], ['class', 'double', 'tf', 'class'], ['class', 'double', 'tf', 'scale']));
    var menu = [['Q = K^{1/2}L^{1/2}', 'K^(1/2)*L^(1/2)', 'constant'], ['Q = K^{1/3}L^{1/3}', 'K^(1/3)*L^(1/3)', 'decreasing'], ['Q = KL', 'K*L', 'increasing'], ['Q = 2K + 3L', '2*K+3*L', 'constant'], ['Q = \\sqrt{K} + \\sqrt{L}', 'sqrt(K)+sqrt(L)', 'decreasing'], ['Q = \\min\\{K, 2L\\}', 'min(K,2*L)', 'constant'], ['Q = K^{2/3}L^{2/3}', 'K^(2/3)*L^(2/3)', 'increasing'], ['Q = 5K^{1/4}L^{1/2}', '5*K^(1/4)*L^(1/2)', 'decreasing'], ['Q = K^{1/2}L', 'K^(1/2)*L', 'increasing'], ['Q = 4K^{3/4}L^{1/4}', '4*K^(3/4)*L^(1/4)', 'constant']];
    if (kind === 'class') {
      var f = R.pick(menu), lab = { increasing: 'Increasing returns to scale', constant: 'Constant returns to scale', decreasing: 'Decreasing returns to scale' };
      return P('What kind of returns to scale does $' + f[0] + '$ have?', mc(lab[f[2]], Object.keys(lab).filter(function (k) { return k !== f[2]; }).map(function (k) { return lab[k]; }).concat(['It depends on the input prices'])),
        ['Multiply every input by $t > 1$ and compare with $t\\cdot Q$.', f[2] === 'constant' ? 'Output is multiplied by exactly $t$: constant returns.' : f[2] === 'increasing' ? 'Output is multiplied by more than $t$: increasing returns.' : 'Output is multiplied by less than $t$: decreasing returns.', 'For Cobb-Douglas $AK^\\alpha L^\\beta$ the test is the sum $\\alpha + \\beta$ compared with 1.'],
        'Scale both inputs by t and see what happens to Q.', { chk: { k: 'rts', f: f[1], ans: lab[f[2]], lab: lab } });
    }
    if (kind === 'double' || kind === 'scale') {
      var pr = R.pick([[Q(1, 4), Q(1, 4)], [Q(1, 4), Q(1, 2)], [Q(1, 2), Q(1, 2)], [Q(1, 4), Q(3, 4)], [Q(1, 2), Q(3, 4)], [Q(3, 4), Q(3, 4)], [Q(1, 3), Q(1, 3)], [Q(1, 3), Q(2, 3)], [Q(2, 3), Q(2, 3)], [Q(1, 2), Q(1)], [Q(1), Q(1)]]);
      var al = pr[0], be = pr[1], s = al.add(be), dd = s.den(), tt = R.pick(dd === 1 ? [2, 3, 4, 10] : dd === 2 ? [4, 9, 16] : dd === 3 ? [8, 27] : [16, 81]), q0 = R.int(2, 20) * 10, rm = rootPow(tt, s);
      return P('A firm\u2019s technology is $Q = A K^{' + expTex(al) + '}L^{' + expTex(be) + '}$, and it now makes ' + q0 + ' units. If it multiplies both capital and labor by ' + tt + ', how many units does it make?', A(rm.mul(q0)),
        ['$Q(' + tt + 'K, ' + tt + 'L) = A(' + tt + 'K)^{' + expTex(al) + '}(' + tt + 'L)^{' + expTex(be) + '} = ' + tt + '^{' + expTex(s) + '}\\cdot Q(K, L)$.', '$' + tt + '^{' + expTex(s) + '} = ' + nx(rm) + '$, so output is $' + nx(rm) + '\\times ' + q0 + ' = ' + nx(rm.mul(q0)) + '$.', s.gt(1) ? 'More than ' + tt + ' times: increasing returns to scale.' : s.lt(1) ? 'Less than ' + tt + ' times: decreasing returns to scale.' : 'Exactly ' + tt + ' times: constant returns.'],
        'Scaling all inputs by t scales Cobb-Douglas output by t to the power α + β.', { unit: 'units', chk: { k: 'scale', al: al.toNumber(), be: be.toNumber(), t: tt, q0: q0 } });
    }
    var tfs = [['$Q = K^{1/2}L^{1/2}$ has diminishing marginal products of both inputs and constant returns to scale.', true, 'Each exponent is below 1, so each marginal product falls when that input grows alone. The exponents sum to 1, so scaling both inputs scales output in proportion. The two ideas are different questions.'],
      ['If a technology has diminishing marginal product of labor, it must have decreasing returns to scale.', false, 'Diminishing marginal product is about one input growing with the others fixed; returns to scale is about all inputs growing together. $K^{1/2}L^{1/2}$ has the first and constant returns.'],
      ['$Q = KL$ has increasing returns to scale.', true, 'Doubling both gives $(2K)(2L) = 4KL$, more than double.'],
      ['A technology with constant returns to scale can have a marginal product of labor that stays constant as labor grows alone.', true, 'For example $Q = 2K + 3L$: $MP_L = 3$ always, and doubling both inputs doubles output.']];
    var tf = R.pick(tfs);
    return P('True or false? ' + tf[0], { t: 'tf', v: tf[1] }, [tf[2], tf[1] ? 'True.' : 'False.'], 'Separate "one input grows" from "all inputs grow together."', { chk: { k: 'tf', v: tf[1], s: tf[0] } });
  });

  G('imicro.cost-minimization', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['sqrtL', 'sqrtC', 'fixed'], ['sqrtL', 'sqrtC', 'cd', 'subs', 'fixed'], ['cd', 'sqrtC', 'subs', 'cd']));
    var firm = R.pick(['A coffee roaster', 'A laundry', 'A recycling plant', 'A bakery', 'A print shop']);
    if (kind === 'sqrtL' || kind === 'sqrtC') {
      var pr = R.pick([[4, 1], [1, 4], [9, 1], [1, 9], [9, 4], [4, 9], [16, 1], [1, 1], [25, 4]]), sc = R.int(1, 5), w = pr[0] * sc, r = pr[1] * sc, q = R.int(2, 20) * M.sqrt(pr[0]) * M.sqrt(pr[1]);
      var Ls = Q(q).mul(Q(M.sqrt(pr[1]), M.sqrt(pr[0]))), Ks = Q(q).mul(Q(M.sqrt(pr[0]), M.sqrt(pr[1]))), Cmin = Ls.mul(w).add(Ks.mul(r));
      var st = ['Tangency: $MRTS = \\dfrac{K}{L} = \\dfrac{w}{r} = ' + fr(w, r) + '$, so $K = ' + (Q(w, r).eq(1) ? '' : Q(w, r).toTex()) + 'L$.', 'On the isoquant $\\sqrt{KL} = ' + q + '$: $' + (Q(w, r).eq(1) ? '' : Q(w, r).toTex()) + 'L^2 = ' + (q * q) + '$, so $L = ' + nx(Ls) + '$ and $K = ' + nx(Ks) + '$.'];
      var intro = firm + ' has $Q = \\sqrt{KL}$, pays $w = ' + w + '$ per worker and $r = ' + r + '$ per machine. ';
      if (kind === 'sqrtL') return P(intro + 'What is the cost-minimizing amount of labor for ' + q + ' units?', A(Ls), st, 'Set MRTS = w/r, then stay on the isoquant.', { unit: 'workers', chk: { k: 'cmin', f: 'sqrt(K*L)', w: w, r: r, q: q, ask: 'L' } });
      return P(intro + 'What is the least it can spend to make ' + q + ' units?', A(Cmin), st.concat(['Cost: $' + w + '(' + nx(Ls) + ') + ' + r + '(' + nx(Ks) + ') = ' + nx(Cmin) + '$. (In general $C = 2q\\sqrt{wr}$ for this technology.)']), 'Find the cheapest bundle, then price it.', { unit: 'dollars', chk: { k: 'cmin', f: 'sqrt(K*L)', w: w, r: r, q: q, ask: 'C' } });
    }
    if (kind === 'cd') {
      // Q = K^a L^b (a + b = 1): K/L = rho = (a/b)(w/r); pick rho with rho^a exact
      var ab = R.pick([[Q(1, 2), [Q(4), Q(9), Q(1, 4), Q(1)]], [Q(1, 3), [Q(8), Q(1, 8), Q(27)]], [Q(2, 3), [Q(8), Q(1, 8), Q(27)]], [Q(1, 4), [Q(16), Q(1, 16)]], [Q(3, 4), [Q(16), Q(1, 16)]]]);
      var a = ab[0], b = Q(1).sub(a), rho = R.pick(ab[1]), r2 = R.int(1, 5), w2q = rho.mul(b).div(a).mul(r2);
      if (!w2q.isInt()) { r2 = r2 * w2q.den(); w2q = rho.mul(b).div(a).mul(r2); }
      var w2 = w2q.toNumber(), L2 = R.int(2, 6) * rho.den(), K2v = rho.mul(L2), qr = rootPow(rho.num(), a).div(rootPow(rho.den(), a)).mul(L2);
      var tex2 = pw('K', a) + pw('L', b), ratio = rho;
      return P(firm + ' has $Q = ' + tex2 + '$, with $w = ' + w2 + '$ and $r = ' + r2 + '$. In the cheapest way to make ' + nx(qr) + ' units, how much labor does it use?', A(L2),
        ['$MRTS = \\dfrac{MP_L}{MP_K} = \\dfrac{' + b.toTex() + 'K}{' + a.toTex() + 'L} = ' + (b.div(a).eq(1) ? '' : b.div(a).toTex()) + '\\dfrac{K}{L}$.', 'Set it equal to $w/r = ' + fr(w2, r2) + '$: $K = ' + (ratio.eq(1) ? '' : ratio.toTex()) + 'L$.', 'Isoquant: $(' + (ratio.eq(1) ? '' : ratio.toTex()) + 'L)^{' + expTex(a) + '}L^{' + expTex(b) + '} = ' + (ratio.eq(1) ? '' : nx(rootPow(rho.num(), a).div(rootPow(rho.den(), a)))) + 'L = ' + nx(qr) + '$, so $L = ' + L2 + '$ (and $K = ' + nx(K2v) + '$).'],
        'Use MRTS = w/r to relate K and L, then substitute into the production function.', { unit: 'workers', chk: { k: 'cmin', f: 'K^(' + a.toPlain() + ')*L^(' + b.toPlain() + ')', w: w2, r: r2, q: qr.toNumber(), ask: 'L' } });
    }
    if (kind === 'subs') {
      var aa = R.int(1, 5), bb = R.int(1, 5), ws = R.int(2, 12), rs = R.int(2, 12); while (aa * rs === bb * ws) rs++;
      var qs = aa * bb * R.int(2, 10), useL = aa / ws > bb / rs, Cs = useL ? qs / aa * ws : qs / bb * rs, ask2 = R.pick(['L', 'C']);
      return P(firm + ' can use workers and machines as perfect substitutes: $Q = ' + T.mono(aa, 'L') + ' + ' + T.mono(bb, 'K') + '$. With $w = ' + ws + '$ and $r = ' + rs + '$, ' + (ask2 === 'L' ? 'how many workers does the cheapest way to make ' + qs + ' units use?' : 'what is the least cost of making ' + qs + ' units?'), A(ask2 === 'L' ? (useL ? qs / aa : 0) : Cs),
        ['Output per dollar: labor gives $' + aa + '/' + ws + ' = ' + nx(Q(aa, ws)) + '$, capital gives $' + bb + '/' + rs + ' = ' + nx(Q(bb, rs)) + '$.', 'Use only the input with more output per dollar: ' + (useL ? 'labor, $L = ' + qs + '/' + aa + ' = ' + nx(qs / aa) + '$, $K = 0$.' : 'capital, $K = ' + qs + '/' + bb + ' = ' + nx(qs / bb) + '$, $L = 0$.'), 'Cost: $' + nx(Cs) + '$. A corner, not a tangency: the MRTS ' + fr(aa, bb) + ' never equals $w/r$.'],
        'Compare output per dollar of each input.', { unit: ask2 === 'L' ? 'workers' : 'dollars', chk: { k: 'cmin', f: aa + '*L+' + bb + '*K', w: ws, r: rs, q: qs, ask: ask2 } });
    }
    var ka = R.int(1, 3), la = R.int(1, 4), wf = R.int(5, 25), rf = R.int(5, 40), qf = R.int(2, 20) * 5, Cf = qf * (ka * rf + la * wf);
    return P(firm + ' needs ' + ka + ' machine-hour' + (ka > 1 ? 's' : '') + ' and ' + la + ' worker-hour' + (la > 1 ? 's' : '') + ' per unit: $Q = \\min\\{' + (ka === 1 ? 'K' : 'K/' + ka) + ', ' + (la === 1 ? 'L' : 'L/' + la) + '\\}$. Machine-hours cost ' + money(rf) + ' and worker-hours ' + money(wf) + '. What is the least cost of ' + qf + ' units?', A(Cf),
      ['No input should sit idle: $K = ' + ka + '(' + qf + ') = ' + (ka * qf) + '$ and $L = ' + la + '(' + qf + ') = ' + (la * qf) + '$.', 'Cost: $' + rf + '(' + (ka * qf) + ') + ' + wf + '(' + (la * qf) + ') = ' + Cf + '$.', 'Input prices don\u2019t change the mix here: with fixed proportions there is nothing to substitute.'],
      'Use exactly the required inputs for each unit.', { unit: 'dollars', chk: { k: 'cmin', f: 'min(K/' + ka + ',L/' + la + ')', w: wf, r: rf, q: qf, ask: 'C' } });
  });

  G('imicro.cost-functions', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['mc', 'ac', 'fc'], ['mc', 'ac', 'avc', 'sr', 'mcexpr'], ['sr', 'mc', 'avc', 'mcexpr', 'ac']));
    var F = R.int(2, 20) * 10, a = R.int(2, 20), b = R.int(0, 3), c = R.pick([Q(1, 10), Q(1, 5), Q(1, 2), Q(1), Q(1, 3)]), q = R.int(2, 15);
    if (ctx.level === 1) { b = 0; c = R.pick([Q(1), Q(1, 2), Q(2)]); }
    if (b) a = M.max(a, M.ceil(Q(b * b).div(c.mul(3)).toNumber()) + R.int(1, 5));   // keep MC positive everywhere
    var C = function (x) { return Q(F + a * x - b * x * x).add(c.mul(x * x * x)); }, VC = function (x) { return C(x).sub(F); };
    var mc = function (x) { return Q(a - 2 * b * x).add(c.mul(3 * x * x)); };
    while (mc(q).sign() <= 0) q++;
    var Ctex = F + ' + ' + a + 'q' + (b ? ' - ' + T.mono(b, 'q^2') : '') + ' + ' + (c.eq(1) ? '' : c.toTex()) + 'q^3', Cp = F + '+' + a + '*x-' + b + '*x^2+' + c.toPlain() + '*x^3';
    var intro = 'A firm\u2019s cost function is $C(q) = ' + Ctex + '$ (dollars). ';
    if (kind === 'sr') {
      var Kb = R.pick([1, 4, 9, 16, 25]), w = R.int(1, 10), r = R.int(1, 10), qq = R.int(2, 10), mcv = Q(2 * w * qq, Kb);
      return P('A firm has $Q = \\sqrt{KL}$, with capital fixed at $K = ' + Kb + '$ in the short run. Wages are $w = ' + w + '$ and capital costs $r = ' + r + '$. What is short-run marginal cost at $q = ' + qq + '$?', A(mcv),
        ['Labor needed: $\\sqrt{' + Kb + 'L} = q$ gives $L = q^2/' + Kb + '$.', 'Short-run cost: $C(q) = ' + r + '(' + Kb + ') + ' + w + '\\cdot\\dfrac{q^2}{' + Kb + '}$.', '$MC = C\'(q) = \\dfrac{' + (2 * w) + 'q}{' + Kb + '} = ' + nx(mcv) + '$ at $q = ' + qq + '$. The fixed capital cost ' + (r * Kb) + ' drops out of $MC$.'],
        'Find the labor needed for q, write the cost, then differentiate.', { unit: 'dollars', chk: { k: 'deriv', f: (r * Kb) + '+' + w + '*x^2/' + Kb, at: qq } });
    }
    if (kind === 'mc') return P(intro + 'What is marginal cost at $q = ' + q + '$?', A(mc(q)),
      ['$MC(q) = C\'(q) = ' + a + (b ? ' - ' + T.mono(2 * b, 'q') : '') + ' + ' + (c.mul(3).eq(1) ? '' : c.mul(3).toTex()) + 'q^2$. The fixed cost ' + F + ' has derivative 0.', 'At $q = ' + q + '$: $MC = ' + nx(mc(q)) + '$.'],
      'Differentiate C(q).', { unit: 'dollars', chk: { k: 'deriv', f: Cp, at: q } });
    if (kind === 'mcexpr') return P(intro + 'Write marginal cost $MC(q)$.', expr(a + '-' + (2 * b) + '*q+' + c.mul(3).toPlain() + '*q^2', ['q']),
      ['Differentiate term by term; the constant ' + F + ' (fixed cost) drops out.', '$MC(q) = ' + a + (b ? ' - ' + T.mono(2 * b, 'q') : '') + ' + ' + (c.mul(3).eq(1) ? '' : c.mul(3).toTex()) + 'q^2$.'],
      'MC is the derivative of total cost.', { chk: { k: 'derivexpr', f: Cp } });
    if (kind === 'ac') return P(intro + 'What is average (total) cost at $q = ' + q + '$?', A(C(q).div(q)),
      ['$C(' + q + ') = ' + nx(C(q)) + '$.', '$AC = C(q)/q = ' + nx(C(q)) + '/' + q + ' = ' + nx(C(q).div(q)) + '$.', 'Compare $MC(' + q + ') = ' + nx(mc(q)) + '$: average and marginal cost are different numbers.'],
      'Total cost divided by output.', { unit: 'dollars', chk: { k: 'avgc', f: Cp, at: q, fixed: 0 } });
    if (kind === 'avc') return P(intro + 'What is average variable cost at $q = ' + q + '$?', A(VC(q).div(q)),
      ['Variable cost leaves out the fixed ' + F + ': $VC(' + q + ') = ' + nx(VC(q)) + '$.', '$AVC = ' + nx(VC(q)) + '/' + q + ' = ' + nx(VC(q).div(q)) + '$.'],
      'Subtract the fixed cost before dividing.', { unit: 'dollars', chk: { k: 'avgc', f: Cp, at: q, fixed: F } });
    return P(intro + 'What is the fixed cost?', A(F), ['Fixed cost is the cost at $q = 0$: $C(0) = ' + F + '$.', 'It does not change with output, so it has no effect on marginal cost.'], 'Set q = 0.', { unit: 'dollars', chk: { k: 'fc', f: Cp } });
  });

  G('imicro.short-long-run-cost', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['sr', 'lr', 'touch'], ['sr', 'lr', 'touch', 'gap'], ['gap', 'touch', 'sr', 'lr']));
    var pr = R.pick([[1, 1], [4, 1], [1, 4], [9, 1], [1, 9], [4, 9], [9, 4]]), sc = R.int(1, 4), w = pr[0] * sc, r = pr[1] * sc, sw = M.sqrt(pr[0]), sr = M.sqrt(pr[1]);
    var Kb = sw * R.int(1, 8) * 2, q = R.int(2, 20), qt = Q(Kb * sr, sw), tq = 0;
    while ((w * q * q) % Kb && tq++ < 60) q = R.int(2, 24);
    var srC = function (x) { return Q(r * Kb).add(Q(w * x * x, Kb)); }, lrC = function (x) { return Q(2 * x * sw * sr * sc); };
    var intro = 'A firm has $Q = \\sqrt{KL}$, $w = ' + w + '$ and $r = ' + r + '$. In the short run its capital is fixed at $K = ' + Kb + '$. ';
    var lrSteps = ['Long run: both inputs adjust. Tangency $K/L = w/r = ' + fr(w, r) + '$, and $\\sqrt{KL} = q$, so $L = q\\sqrt{r/w}$ and $K = q\\sqrt{w/r}$.', 'Long-run cost: $C_{LR}(q) = wL + rK = 2q\\sqrt{wr} = ' + nx(2 * sw * sr * sc) + 'q$.'];
    var srSteps = ['Short run: $L = q^2/' + Kb + '$, so $C_{SR}(q) = ' + r + '(' + Kb + ') + ' + w + '\\cdot\\dfrac{q^2}{' + Kb + '} = ' + (r * Kb) + ' + ' + cq(Q(w, Kb), 'q^2') + '$.'];
    var chk = { k: 'slr', w: w, r: r, K: Kb };
    if (kind === 'sr') return P(intro + 'What is its short-run cost of making ' + q + ' units?', A(srC(q)), srSteps.concat(['At $q = ' + q + '$: $' + nx(srC(q)) + '$ dollars.']), 'With K fixed, find the labor needed for q.', { unit: 'dollars', chk: Object.assign({ ask: 'sr', q: q }, chk) });
    if (kind === 'lr') return P(intro + 'What would it cost to make ' + q + ' units in the long run, when capital can also change?', A(lrC(q)), lrSteps.concat(['At $q = ' + q + '$: $' + nx(lrC(q)) + '$ dollars.']), 'Minimize cost with both inputs free.', { unit: 'dollars', chk: Object.assign({ ask: 'lr', q: q }, chk) });
    if (kind === 'touch') return P(intro + 'At what output is the short-run cost equal to the long-run cost?', A(qt),
      lrSteps.concat(['The fixed $K = ' + Kb + '$ is the best plant for the output where $q\\sqrt{w/r} = ' + Kb + '$: $q = ' + Kb + '\\sqrt{r/w} = ' + nx(qt) + '$.', 'There the two costs match ($' + nx(srC(qt.toNumber())) + '$); at every other output the short-run cost is higher.']),
      'Find the output for which K = ' + Kb + ' is the long-run choice.', { unit: 'units', chk: Object.assign({ ask: 'touch' }, chk) });
    var gq = q === qt.toNumber() ? q + 3 : q;
    return P(intro + 'At $q = ' + gq + '$, how much more does it cost to produce in the short run than in the long run?', A(srC(gq).sub(lrC(gq))),
      srSteps.concat(lrSteps).concat(['$C_{SR}(' + gq + ') = ' + nx(srC(gq)) + '$ and $C_{LR}(' + gq + ') = ' + nx(lrC(gq)) + '$.', 'Difference: $' + nx(srC(gq).sub(lrC(gq))) + '$. It is never negative: the long run can always choose the short run\u2019s capital, and may do better.']),
      'Compute both costs at that output.', { unit: 'dollars', chk: Object.assign({ ask: 'gap', q: gq }, chk) });
  });

  G('imicro.minimum-average-cost', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['quadq', 'quadac', 'quadq'], ['quadq', 'quadac', 'linq', 'avc', 'mcat'], ['linq', 'avc', 'mcat', 'quadac', 'avcmin']));
    if (kind === 'avc' || kind === 'avcmin') {
      var b = R.pick([2, 4, 6]), c = R.pick([Q(1, 3), Q(1, 12)]), qv = Q(b).div(c.mul(2)), a2 = Q(b * b).div(c.mul(3)).add(R.int(1, 10)), F = R.int(2, 30) * 10;
      var avcMin = a2.sub(Q(b * b).div(c.mul(4)));
      var Ct = F + ' + ' + nx(a2) + 'q - ' + T.mono(b, 'q^2') + ' + ' + (c.eq(1) ? '' : c.toTex()) + 'q^3';
      if (kind === 'avc') return P('A firm\u2019s cost is $C(q) = ' + Ct + '$. At what output is average <b>variable</b> cost lowest?', A(qv),
        ['$AVC = \\dfrac{VC}{q} = ' + nx(a2) + ' - ' + T.mono(b, 'q') + ' + ' + (c.eq(1) ? '' : c.toTex()) + 'q^2$.', '$\\dfrac{d\\,AVC}{dq} = -' + b + ' + ' + c.mul(2).toTex().replace(/^1$/, '') + 'q = 0$, so $q = ' + nx(qv) + '$.', 'Check: $MC = ' + nx(a2) + ' - ' + T.mono(2 * b, 'q') + ' + ' + cq(c.mul(3), 'q^2') + '$ equals $AVC$ there (both ' + nx(avcMin) + ').'],
        'Minimize AVC = VC/q (leave out the fixed cost).', { unit: 'units', chk: { k: 'minavg', f: nx(a2).replace(/\{,\}/g, '') + '*x-' + b + '*x^2+' + c.toPlain() + '*x^3', ask: 'q' } });
      return P('A firm\u2019s cost is $C(q) = ' + Ct + '$. What is the lowest average variable cost (the shutdown price)?', A(avcMin),
        ['$AVC = ' + nx(a2) + ' - ' + T.mono(b, 'q') + ' + ' + (c.eq(1) ? '' : c.toTex()) + 'q^2$, lowest at $q = ' + nx(qv) + '$.', '$AVC_{\\min} = ' + nx(a2) + ' - ' + b + '(' + nx(qv) + ') + ' + c.toTex() + '(' + nx(qv) + ')^2 = ' + nx(avcMin) + '$.'],
        'Find where AVC is lowest, then evaluate it.', { unit: 'dollars', chk: { k: 'minavg', f: nx(a2).replace(/\{,\}/g, '') + '*x-' + b + '*x^2+' + c.toPlain() + '*x^3', ask: 'min' } });
    }
    var c2 = R.pick([Q(1), Q(2), Q(1, 2), Q(4), Q(1, 4), Q(3)]), qs = R.int(2, 15), F2 = c2.mul(qs * qs), a3 = kind === 'linq' || kind === 'mcat' ? R.int(2, 20) : 0;
    if (!F2.isInt()) { qs = qs * 2; F2 = c2.mul(qs * qs); }
    var acMin = Q(a3).add(c2.mul(2 * qs)), Ct2 = nx(F2) + (a3 ? ' + ' + a3 + 'q' : '') + ' + ' + (c2.eq(1) ? '' : c2.toTex()) + 'q^2', Cp2 = F2.toPlain() + '+' + a3 + '*x+' + c2.toPlain() + '*x^2';
    var st = ['$AC(q) = \\dfrac{' + nx(F2) + '}{q}' + (a3 ? ' + ' + a3 : '') + ' + ' + (c2.eq(1) ? '' : c2.toTex()) + 'q$.', 'Quotient (or power) rule: $AC\'(q) = -\\dfrac{' + nx(F2) + '}{q^2} + ' + (c2.eq(1) ? '1' : c2.toTex()) + ' = 0$, so $q^2 = ' + nx(F2.div(c2)) + '$ and $q = ' + qs + '$.'];
    if (kind === 'quadq' || kind === 'linq') return P('A firm\u2019s cost is $C(q) = ' + Ct2 + '$. At what output is average cost lowest?', A(qs), st.concat(['Check: $MC = ' + (a3 ? a3 + ' + ' : '') + T.mono(c2.mul(2), 'q') + ' = ' + nx(acMin) + '$ and $AC = ' + nx(acMin) + '$ at $q = ' + qs + '$: they are equal at the minimum.']), 'Differentiate AC = C(q)/q and set it to zero.', { unit: 'units', chk: { k: 'minavg', f: Cp2, ask: 'q', total: true } });
    if (kind === 'quadac') return P('A firm\u2019s cost is $C(q) = ' + Ct2 + '$. What is the lowest average cost it can reach?', A(acMin), st.concat(['$AC(' + qs + ') = \\dfrac{' + nx(F2) + '}{' + qs + '} + ' + (a3 ? a3 + ' + ' : '') + nx(c2.mul(qs)) + ' = ' + nx(acMin) + '$.']), 'Find the output with the lowest AC, then evaluate AC there.', { unit: 'dollars', chk: { k: 'minavg', f: Cp2, ask: 'min', total: true } });
    return P('A firm\u2019s cost is $C(q) = ' + Ct2 + '$. Average cost is lowest at $q = ' + qs + '$. What is marginal cost at that output?', A(acMin),
      ['$MC(q) = ' + (a3 ? a3 + ' + ' : '') + T.mono(c2.mul(2), 'q') + '$, so $MC(' + qs + ') = ' + nx(acMin) + '$.', 'And $AC(' + qs + ') = ' + nx(acMin) + '$ too. Why: $AC\'(q) = \\dfrac{qC\'(q) - C(q)}{q^2} = \\dfrac{MC - AC}{q}$, which is zero only where $MC = AC$.'],
      'At the bottom of AC, MC = AC.', { unit: 'dollars', chk: { k: 'deriv', f: Cp2, at: qs } });
  });

  // =================================================================== Unit 6: Competitive Markets

  G('imicro.competitive-supply', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['quad', 'quad', 'quadexpr'], ['quad', 'cubic', 'shut', 'profit'], ['cubic', 'shut', 'below', 'profit']));
    var firm = R.pick(['A tomato grower', 'A t-shirt printer', 'A small sawmill', 'A dairy farm', 'A trucking firm']);
    if (kind === 'quad' || kind === 'quadexpr') {
      var c = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4), Q(5)]), F = R.int(1, 20) * 10, p = R.int(2, 20) * 2, q = Q(p).div(c.mul(2));
      if (kind === 'quadexpr') return P(firm + ' in a competitive market has $C(q) = ' + F + ' + ' + cq(c, 'q^2') + '$ (the fixed cost is sunk in the short run). Write its supply curve $q(p)$ for prices where it produces.', expr(Q(1).div(c.mul(2)).toPlain() + '*p', ['p']),
        ['Profit $pq - C(q)$ is largest where $p = MC(q) = ' + cq(c.mul(2), 'q') + '$.', '$AVC = ' + cq(c, 'q') + '$ is below $MC$ at every $q > 0$, so the firm produces at any positive price.', 'Supply: $q(p) = ' + (c.mul(2).eq(1) ? 'p' : '\\dfrac{p}{' + c.mul(2).toTex() + '}') + '$.'],
        'Solve p = MC(q) for q.', { chk: { k: 'supexpr', C: F + '+' + c.toPlain() + '*x^2' } });
      return P(firm + ' takes the market price as given. Its cost is $C(q) = ' + F + ' + ' + cq(c, 'q^2') + '$, and the price is ' + money(p) + '. How much does it produce?', A(q),
        ['Maximize $\\pi = pq - C(q)$: $\\dfrac{d\\pi}{dq} = p - MC(q) = 0$.', '$MC = ' + cq(c.mul(2), 'q') + '$, so $' + cq(c.mul(2), 'q') + ' = ' + p + '$ and $q = ' + nx(q) + '$.', 'Second-order check: $MC$ is rising, so this is a maximum. Price covers $AVC = ' + cq(c, 'q') + ' = ' + nx(c.mul(q)) + '$, so it produces.'],
        'Set price equal to marginal cost.', { unit: 'units', chk: { k: 'csup', C: F + '+' + c.toPlain() + '*x^2', F: F, p: p } });
    }
    // cubic: C = F + a q - b q^2 + c q^3 with c = 1/3: MC = a - 2bq + q^2, AVC = a - bq + q^2/3; min AVC at q = 3b/2
    var b = R.pick([2, 4, 6]), cc = Q(1, 3), a = b * b + R.int(1, 10), F2 = R.int(2, 20) * 10, qmin = Q(3 * b, 2), shut = Q(a).sub(Q(3 * b * b, 4));
    var Ct = F2 + ' + ' + a + 'q - ' + T.mono(b, 'q^2') + ' + \\tfrac{1}{3}q^3', Cp = F2 + '+' + a + '*x-' + b + '*x^2+(1/3)*x^3';
    var MCt = a + ' - ' + T.mono(2 * b, 'q') + ' + q^2';
    if (kind === 'shut') return P(firm + ' has $C(q) = ' + Ct + '$. Below what price does it shut down in the short run?', A(shut),
      ['It shuts down when the price is below the lowest average variable cost.', '$AVC = ' + a + ' - ' + T.mono(b, 'q') + ' + \\tfrac{1}{3}q^2$, lowest where $-' + b + ' + \\tfrac{2}{3}q = 0$: $q = ' + nx(qmin) + '$.', '$AVC_{\\min} = ' + a + ' - ' + b + '(' + nx(qmin) + ') + \\tfrac{1}{3}(' + nx(qmin) + ')^2 = ' + nx(shut) + '$.', 'Check: $MC(' + nx(qmin) + ') = ' + nx(Q(a - 2 * b * qmin.toNumber()).add(qmin.mul(qmin))) + '$, equal to $AVC$ there.'],
      'Find the minimum of AVC (not ATC).', { unit: 'dollars', chk: { k: 'shut', C: Cp, F: F2 } });
    if (kind === 'below') {
      var pb = shut.sub(R.int(1, 3)).toNumber(); if (pb <= 0) pb = 1;
      return P(firm + ' has $C(q) = ' + Ct + '$, and the market price falls to ' + money(pb) + '. How much does it produce in the short run?', A(0),
        ['Lowest $AVC$: at $q = ' + nx(qmin) + '$, $AVC = ' + nx(shut) + '$.', 'The price ' + money(pb) + ' is below that, so at every output the firm loses more than its fixed cost. Producing nothing limits the loss to the fixed cost ' + F2 + '.', 'Output: 0. The part of $MC$ below minimum $AVC$ is not part of the supply curve.'],
        'Compare the price with the lowest AVC first.', { unit: 'units', chk: { k: 'csup', C: Cp, F: F2, p: pb } });
    }
    var q0 = qmin.toNumber() + R.int(1, 6), p0 = a - 2 * b * q0 + q0 * q0, prof = p0 * q0 - (F2 + a * q0 - b * q0 * q0 + q0 * q0 * q0 / 3);
    if (kind === 'cubic') return P(firm + ' takes the price as given and has $C(q) = ' + Ct + '$. At a price of ' + money(p0) + ', how much does it produce?', A(q0),
      ['$MC = ' + MCt + '$. Set $p = MC$: $q^2 - ' + T.mono(2 * b, 'q') + T.signed(a - p0) + ' = 0$.', 'Roots: $q = ' + b + ' \\pm \\sqrt{' + (b * b - a + p0) + '}$, so $q = ' + (b - M.sqrt(b * b - a + p0)) + '$ or $q = ' + q0 + '$.', 'Take the root on the rising part of $MC$ (the smaller one is where $MC$ is falling: profit is at a minimum there): $q = ' + q0 + '$.', 'It is above the shutdown output ' + nx(qmin) + ' (price ' + money(p0) + ' is above min AVC ' + nx(shut) + '), so the firm produces ' + q0 + '.'],
      'Solve p = MC and keep the root on the rising part of MC.', { unit: 'units', chk: { k: 'csup', C: Cp, F: F2, p: p0 } });
    return P(firm + ' has $C(q) = ' + Ct + '$. At a price of ' + money(p0) + ' it produces where $p = MC$, at $q = ' + q0 + '$. What is its profit (negative for a loss)?', A(prof),
      ['Revenue: $' + p0 + '\\times ' + q0 + ' = ' + (p0 * q0) + '$.', 'Cost: $C(' + q0 + ') = ' + nx(F2 + a * q0 - b * q0 * q0 + q0 * q0 * q0 / 3) + '$.', 'Profit: $' + nx(prof) + '$.' + (prof < 0 ? ' A loss, but smaller than the fixed cost ' + F2 + ', so producing beats shutting down.' : '')],
      'Revenue minus total cost (fixed cost included).', { unit: 'dollars', chk: { k: 'cprof', C: Cp, p: p0, q: q0 } });
  });

  G('imicro.producer-surplus-integral', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['firm', 'market', 'firm'], ['firm', 'profit', 'market', 'cubic'], ['cubic', 'profit', 'firm', 'diff']));
    if (kind === 'firm' || kind === 'profit' || kind === 'diff') {
      var c = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4)]), F = R.int(1, 30) * 10, p = R.int(2, 15) * 2, q = Q(p).div(c.mul(2)), ps = Q(p).mul(q).sub(c.mul(q).mul(q)), pr = ps.sub(F);
      var intro = 'A competitive firm has $C(q) = ' + F + ' + ' + cq(c, 'q^2') + '$ and faces a price of ' + money(p) + '. ';
      var st = ['Output: $p = MC = ' + cq(c.mul(2), 'q') + '$, so $q = ' + nx(q) + '$.', '$PS = \\int_0^{' + nx(q) + '}(' + p + ' - ' + cq(c.mul(2), 'q') + ')\\,dq = \\left[' + p + 'q - ' + cq(c, 'q^2') + '\\right]_0^{' + nx(q) + '} = ' + nx(ps) + '$.'];
      if (kind === 'firm') return P(intro + 'What is its producer surplus?', A(ps), st.concat(['Same as revenue minus variable cost: $' + nx(Q(p).mul(q)) + ' - ' + nx(c.mul(q).mul(q)) + ' = ' + nx(ps) + '$.']), 'Integrate p − MC from 0 to the chosen q.', { unit: 'dollars', chk: { k: 'psint', MC: c.mul(2).toPlain() + '*x', p: p } });
      if (kind === 'profit') return P(intro + 'What is its profit?', A(pr), st.concat(['Profit = producer surplus minus fixed cost: $' + nx(ps) + ' - ' + F + ' = ' + nx(pr) + '$.']), 'Producer surplus leaves out the fixed cost; profit does not.', { unit: 'dollars', chk: { k: 'cprof', C: F + '+' + c.toPlain() + '*x^2', p: p, q: q.toNumber() } });
      return P(intro + 'By how much does its producer surplus exceed its profit?', A(F), st.concat(['Profit $= ' + nx(pr) + '$.', 'The gap is the fixed cost, ' + F + ': producer surplus counts only costs that depend on output.']), 'What is in profit that is not in producer surplus?', { unit: 'dollars', chk: { k: 'psgap', C: F + '+' + c.toPlain() + '*x^2', p: p } });
    }
    if (kind === 'market') {
      var c0 = R.int(1, 10), d = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4)]), Qm = R.int(2, 20) * 2, pm = d.mul(Qm).add(c0), psm = pm.sub(c0).mul(Qm).div(2);
      return P('Market supply is $P = ' + c0 + ' + ' + cq(d, 'Q') + '$ and the price is ' + money(pm.toNumber()) + '. What is producer surplus?', A(psm),
        ['Quantity supplied: $' + c0 + ' + ' + cq(d, 'Q') + ' = ' + nx(pm) + '$, so $Q = ' + Qm + '$.', '$PS = \\int_0^{' + Qm + '}\\left(' + nx(pm) + ' - ' + c0 + ' - ' + cq(d, 'Q') + '\\right)dQ = \\tfrac{1}{2}(' + Qm + ')(' + nx(pm.sub(c0)) + ') = ' + nx(psm) + '$.'],
        'Area above supply and below the price, out to the quantity sold.', { unit: 'dollars', chk: { k: 'psint', MC: c0 + '+' + d.toPlain() + '*x', p: pm.toNumber() } });
    }
    var a = R.int(1, 10), bq = R.pick([1, 3]), qc = R.int(2, 6), pc = a + bq * qc * qc, psc = Q(pc - a).mul(qc).sub(Q(bq * qc * qc * qc, 3));
    return P('A firm’s marginal cost is $MC(q) = ' + a + ' + ' + T.mono(bq, 'q^2') + '$ and the price is ' + money(pc) + '. What is its producer surplus?', A(psc),
      ['Output: $' + a + ' + ' + T.mono(bq, 'q^2') + ' = ' + pc + '$, so $q = ' + qc + '$.', '$PS = \\int_0^{' + qc + '}\\left(' + (pc - a) + ' - ' + T.mono(bq, 'q^2') + '\\right)dq = \\left[' + (pc - a) + 'q - ' + cq(Q(bq, 3), 'q^3') + '\\right]_0^{' + qc + '} = ' + nx(psc) + '$.'],
      'Integrate price minus MC up to the output where they meet.', { unit: 'dollars', chk: { k: 'psint', MC: a + '+' + bq + '*x^2', p: pc } });
  });

  G('imicro.long-run-industry', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['price', 'qfirm', 'n'], ['price', 'n', 'qfirm', 'cubic'], ['n', 'cubic', 'price', 'n']));
    if (kind === 'cubic') {
      var b = R.pick([2, 4, 6]), a = b * b + R.int(1, 10), qs = Q(3 * b, 2), pmin = Q(a).sub(Q(3 * b * b, 4));
      return P('Every firm in a competitive industry has the long-run cost $C(q) = ' + a + 'q - ' + T.mono(b, 'q^2') + ' + \\tfrac{1}{3}q^3$ (no fixed cost in the long run), and anyone can enter. What is the long-run equilibrium price?', A(pmin),
        ['Free entry pushes the price to the bottom of long-run average cost.', '$AC = ' + a + ' - ' + T.mono(b, 'q') + ' + \\tfrac{1}{3}q^2$, lowest where $-' + b + ' + \\tfrac{2}{3}q = 0$: $q = ' + nx(qs) + '$.', '$P = AC_{\\min} = ' + nx(pmin) + '$.'],
        'Price equals minimum average cost in the long run.', { unit: 'dollars', chk: { k: 'lrp', C: a + '*x-' + b + '*x^2+(1/3)*x^3' } });
    }
    var cpr = R.pick([[100, 1], [64, 1], [36, 1], [25, 1], [50, 2], [18, 2], [72, 2], [16, 4], [36, 4], [9, 1]]), F = cpr[0], c = cpr[1], qs2 = M.sqrt(F / c), pstar = 2 * M.sqrt(F * c);
    var Bd = R.int(1, 10) * 10, n = R.int(10, 80), Qd = n * qs2, Ad = Qd + Bd * pstar;
    var intro = 'Each firm in a competitive industry has the long-run cost $C(q) = ' + F + ' + ' + cq(Q(c), 'q^2') + '$ (all of it avoidable by leaving), firms are identical, and entry is free. Market demand is $Q = ' + T.commas(Ad) + ' - ' + Bd + 'P$. ';
    var st = ['$AC = \\dfrac{' + F + '}{q} + ' + cq(Q(c), 'q') + '$ is lowest where $MC = AC$: $' + (2 * c) + 'q = \\dfrac{' + F + '}{q} + ' + cq(Q(c), 'q') + '$, so $q^2 = ' + (F / c) + '$ and $q = ' + qs2 + '$.', 'Long-run price: $P = AC_{\\min} = \\dfrac{' + F + '}{' + qs2 + '} + ' + (c * qs2) + ' = ' + pstar + '$.'];
    if (kind === 'price') return P(intro + 'What is the long-run equilibrium price?', A(pstar), st, 'Free entry drives the price to minimum average cost.', { unit: 'dollars', chk: { k: 'lrp', C: F + '+' + c + '*x^2' } });
    if (kind === 'qfirm') return P(intro + 'How much does each firm produce in the long run?', A(qs2), st, 'Each firm produces at the bottom of its average cost curve.', { unit: 'units', chk: { k: 'lrq', C: F + '+' + c + '*x^2' } });
    return P(intro + 'How many firms are in the industry in the long run?', A(n),
      st.concat(['Market quantity at that price: $Q = ' + T.commas(Ad) + ' - ' + Bd + '(' + pstar + ') = ' + T.commas(Qd) + '$.', 'Number of firms: $' + T.commas(Qd) + '/' + qs2 + ' = ' + n + '$.']),
      'Price from min AC, then market quantity from demand, then divide by each firm’s output.', { unit: 'firms', chk: { k: 'lrn', C: F + '+' + c + '*x^2', A: Ad, B: Bd } });
  });

  // linear market: Qd = a - bP, Qs = c + dP
  function linMarket(R) {
    var b = R.int(1, 6), d = R.int(1, 6), ps0 = R.int(1, 6), P0 = ps0 + R.int(4, 16), Q0 = d * (P0 - ps0), a = Q0 + b * P0, c = -d * ps0;
    return { a: a, b: b, c: c, d: d, P0: P0, Q0: Q0, ps0: ps0 };
  }
  // a per-unit tax that keeps the sellers' price above the supply choke price: t = (b + d)k/2, Ps = P0 - b k/2 > ps0
  function linTax(R, m) { var room = m.P0 - m.ps0, k = R.int(1, 4); while (k > 1 && m.b * k / 2 >= room) k--; return (m.b + m.d) * k / 2; }
  function lmTex(m) { return '$Q_d = ' + m.a + ' - ' + T.mono(m.b, 'P') + '$ and $Q_s = ' + (m.c === 0 ? '' : m.c + ' + ') + T.mono(m.d, 'P') + '$'.replace('= -', '= -'); }
  function lmTexS(m) { return m.c >= 0 ? (m.c === 0 ? '' : m.c + ' + ') + T.mono(m.d, 'P') : T.mono(m.d, 'P') + ' - ' + (-m.c); }

  G('imicro.tax-incidence-formula', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['share', 'pb', 'share'], ['share', 'pb', 'ps', 'who'], ['pb', 'ps', 'eshare', 'who']));
    if (kind === 'share' || kind === 'who') {
      var eD = R.pick([Q(-1, 2), Q(-1), Q(-3, 2), Q(-2), Q(-3), Q(-1, 4), Q(-3, 4), Q(-5, 2), Q(-4)]), eS = R.pick([Q(1, 2), Q(1), Q(3, 2), Q(2), Q(3), Q(1, 4), Q(3, 4), Q(5, 2), Q(4)]); if (eD.abs().eq(eS)) eS = eS.add(Q(1, 2));
      var sh = eS.div(eS.sub(eD));
      if (kind === 'who') { var more = eD.abs().lt(eS) ? 'Buyers bear more, because demand is less elastic' : 'Sellers bear more, because supply is less elastic';
        return P('At the equilibrium, the price elasticity of demand is $' + nx(eD) + '$ and the price elasticity of supply is $' + nx(eS) + '$. A small per-unit tax is collected from sellers. Who bears more of it?', mc(more, ['Buyers bear more, because demand is less elastic', 'Sellers bear more, because supply is less elastic', 'Sellers bear all of it, because they send the money to the government', 'Each side bears half'].filter(function (x) { return x !== more; })),
          ['Buyers’ share $= \\dfrac{\\varepsilon_S}{\\varepsilon_S + |\\varepsilon_D|} = \\dfrac{' + nx(eS) + '}{' + nx(eS) + ' + ' + nx(eD.abs()) + '} = ' + nx(sh) + '$.', 'The side that responds less to price can’t get away from the tax, so it bears more. Who sends the check does not matter.'],
          'The less elastic side bears more.', { chk: { k: 'incwho', eD: eD.toNumber(), eS: eS.toNumber() } }); }
      return P('Near the equilibrium, the price elasticity of demand is $' + nx(eD) + '$ and of supply is $' + nx(eS) + '$. What share of a small per-unit tax do buyers bear (as a fraction)?', A(sh),
        ['Buyers’ share $= \\dfrac{\\varepsilon_S}{\\varepsilon_S + |\\varepsilon_D|}$.', '$= \\dfrac{' + nx(eS) + '}{' + nx(eS) + ' + ' + nx(eD.abs()) + '} = ' + nx(sh) + '$.', 'Sellers bear the rest, $' + nx(Q(1).sub(sh)) + '$.'],
        'The elasticity of the OTHER side goes on top.', { chk: { k: 'incshare', eD: eD.toNumber(), eS: eS.toNumber() } });
    }
    var m = linMarket(R), t = linTax(R, m), sb = Q(m.d, m.b + m.d), Pb = sb.mul(t).add(m.P0), Ps = Pb.sub(t);
    var intro = 'Demand is $Q_d = ' + m.a + ' - ' + T.mono(m.b, 'P') + '$ and supply is $Q_s = ' + lmTexS(m) + '$. A tax of ' + money(t) + ' per unit is collected from sellers. ';
    var st = ['Before the tax: $' + m.a + ' - ' + T.mono(m.b, 'P') + ' = ' + lmTexS(m) + '$ gives $P = ' + m.P0 + '$, $Q = ' + m.Q0 + '$.', 'With the tax, sellers keep $P_s = P_b - ' + nx(t) + '$: $' + m.a + ' - ' + T.mono(m.b, 'P_b') + ' = ' + (m.d === 1 ? '' : m.d) + '(P_b - ' + nx(t) + ')' + (m.c < 0 ? ' - ' + (-m.c) : m.c > 0 ? ' + ' + m.c : '') + '$.', 'So $P_b = ' + m.P0 + ' + \\dfrac{' + m.d + '}{' + m.b + ' + ' + m.d + '}\\cdot ' + nx(t) + ' = ' + nx(Pb) + '$ and $P_s = ' + nx(Ps) + '$.'];
    if (kind === 'eshare') { var eDv = Q(-m.b * m.P0, m.Q0), eSv = Q(m.d * m.P0, m.Q0);
      return P(intro + 'Using the elasticities at the original equilibrium, what share of the tax do buyers bear?', A(sb),
        ['At $P = ' + m.P0 + '$, $Q = ' + m.Q0 + '$: $\\varepsilon_D = -' + m.b + '\\cdot\\dfrac{' + m.P0 + '}{' + m.Q0 + '} = ' + nx(eDv) + '$ and $\\varepsilon_S = ' + m.d + '\\cdot\\dfrac{' + m.P0 + '}{' + m.Q0 + '} = ' + nx(eSv) + '$.', 'Buyers’ share $= \\dfrac{' + nx(eSv) + '}{' + nx(eSv) + ' + ' + nx(eDv.abs()) + '} = ' + nx(sb) + '$.', 'For straight lines this is exact: it equals $\\dfrac{d}{b + d} = \\dfrac{' + m.d + '}{' + (m.b + m.d) + '}$ for any tax size.'],
        'Compute both elasticities at P0, Q0, then the formula.', { chk: { k: 'linshare', m: m, t: t } }); }
    if (kind === 'pb') return P(intro + 'What price do buyers pay after the tax?', A(Pb), st, 'Buyers pay P_b; sellers keep P_b − t. Set Qd(P_b) = Qs(P_b − t).', { unit: 'dollars', chk: { k: 'taxeq', m: m, t: t, ask: 'pb' } });
    return P(intro + 'What price do sellers keep after the tax?', A(Ps), st.concat(['Sellers keep $P_s = ' + nx(Pb) + ' - ' + nx(t) + ' = ' + nx(Ps) + '$: their price fell by $' + nx(Q(m.P0).sub(Ps)) + '$, buyers’ rose by $' + nx(Pb.sub(m.P0)) + '$.']), 'Find P_b first, then subtract the tax.', { unit: 'dollars', chk: { k: 'taxeq', m: m, t: t, ask: 'ps' } });
  });

  G('imicro.deadweight-loss-calculus', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['dwl', 'dq', 'dwl'], ['dwl', 'ratio', 'rev', 'dq'], ['dwl', 'ratio', 'int', 'rev']));
    if (kind === 'ratio') {
      var k = R.pick([2, 3, 4, Q(1, 2), Q(3, 2)]), kk = Q.from(k);
      return P('With straight-line demand and supply, a per-unit tax of $t$ causes a deadweight loss of ' + money(R.int(2, 30) * 10) + '. If the tax is multiplied by $' + kk.toTex() + '$, by what factor is the deadweight loss multiplied?', A(kk.mul(kk)),
        ['$DWL = \\tfrac{1}{2}t\\,\\Delta Q$, and with straight lines $\\Delta Q$ is proportional to $t$.', 'So $DWL$ is proportional to $t^2$: multiplying $t$ by $' + kk.toTex() + '$ multiplies $DWL$ by $' + (kk.isInt() ? kk.toTex() : '\\left(' + kk.toTex() + '\\right)') + '^2 = ' + nx(kk.mul(kk)) + '$.'],
        'DWL grows with the square of the tax.', { chk: { k: 'dwlratio', k2: kk.toNumber() } });
    }
    var m = linMarket(R), t = linTax(R, m), dQ = Q(m.b * m.d, m.b + m.d).mul(t), dwl = dQ.mul(t).div(2), Qt = Q(m.Q0).sub(dQ);
    var intro = 'Demand is $Q_d = ' + m.a + ' - ' + T.mono(m.b, 'P') + '$ and supply is $Q_s = ' + lmTexS(m) + '$. A tax of ' + money(t) + ' per unit is imposed. ';
    var st = ['Equilibrium without the tax: $P = ' + m.P0 + '$, $Q = ' + m.Q0 + '$.', 'With the tax, $Q_d(P_b) = Q_s(P_b - ' + t + ')$; the quantity falls by $\\Delta Q = \\dfrac{bd}{b + d}t = \\dfrac{' + (m.b * m.d) + '}{' + (m.b + m.d) + '}(' + t + ') = ' + nx(dQ) + '$, to $' + nx(Qt) + '$.'];
    if (kind === 'dq') return P(intro + 'By how many units does the quantity traded fall?', A(dQ), st, 'Solve for the new quantity, or use ΔQ = t·bd/(b + d).', { unit: 'units', chk: { k: 'dwl', m: m, t: t, ask: 'dq' } });
    if (kind === 'rev') return P(intro + 'How much tax revenue does it raise?', A(Qt.mul(t)), st.concat(['Revenue: $t\\times Q_t = ' + t + '\\times ' + nx(Qt) + ' = ' + nx(Qt.mul(t)) + '$.']), 'Tax per unit times the quantity still traded.', { unit: 'dollars', chk: { k: 'dwl', m: m, t: t, ask: 'rev' } });
    if (kind === 'int') return P(intro + 'Find the deadweight loss as $\\int_{Q_t}^{Q^*}\\big(P_D(Q) - P_S(Q)\\big)\\,dQ$, the gap between the demand and supply curves over the lost units.', A(dwl),
      st.concat(['Inverse curves: $P_D = \\dfrac{' + m.a + ' - Q}{' + m.b + '}$, $P_S = \\dfrac{Q ' + (m.c >= 0 ? '- ' + m.c : '+ ' + (-m.c)) + '}{' + m.d + '}$. Their gap falls linearly from $' + t + '$ at $Q_t$ to 0 at $Q^*$.', '$\\int_{' + nx(Qt) + '}^{' + m.Q0 + '}(P_D - P_S)\\,dQ = \\tfrac{1}{2}(' + t + ')(' + nx(dQ) + ') = ' + nx(dwl) + '$.']),
      'The integrand is the gap between the curves; it is t at Q_t and 0 at Q*.', { unit: 'dollars', chk: { k: 'dwl', m: m, t: t, ask: 'dwl' } });
    return P(intro + 'What is the deadweight loss?', A(dwl), st.concat(['$DWL = \\tfrac{1}{2}t\\,\\Delta Q = \\tfrac{1}{2}(' + t + ')(' + nx(dQ) + ') = ' + nx(dwl) + '$: the surplus from trades that no longer happen.']), 'A triangle with height t and base ΔQ.', { unit: 'dollars', chk: { k: 'dwl', m: m, t: t, ask: 'dwl' } });
  });

  // =================================================================== Unit 7: Market Power

  G('imicro.monopoly-calculus', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['lin', 'linp', 'lin'], ['lin', 'linp', 'rising', 'quad', 'mrexpr'], ['rising', 'quad', 'ce', 'linprof', 'mrexpr']));
    var firm = R.pick(['A patented drug maker', 'The only ferry operator on a route', 'A software firm with a unique app', 'The only cinema in a small town', 'A water utility']);
    if (kind === 'lin' || kind === 'linp' || kind === 'linprof') {
      var b = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4), Q(3)]), c = R.int(2, 20), q = R.int(4, 30), a = b.mul(2 * q).add(c), F = R.int(0, 10) * 10;
      if (!a.isInt()) { q = q * 2; a = b.mul(2 * q).add(c); }
      var p = a.sub(b.mul(q)), prof = p.sub(c).mul(q).sub(F);
      var intro = firm + ' faces inverse demand $p(q) = ' + nx(a) + ' - ' + cq(b, 'q') + '$ and has constant marginal cost ' + money(c) + (F ? ' and fixed cost ' + money(F) : '') + '. ';
      var st = ['Revenue $R = p(q)\\,q = ' + nx(a) + 'q - ' + cq(b, 'q^2') + '$, so $MR = R\'(q) = ' + nx(a) + ' - ' + cq(b.mul(2), 'q') + '$.', 'Set $MR = MC$: $' + nx(a) + ' - ' + cq(b.mul(2), 'q') + ' = ' + c + '$, so $q = ' + q + '$.'];
      if (kind === 'lin') return P(intro + 'What quantity maximizes profit?', A(q), st, 'MR has twice the slope of linear inverse demand. Set MR = MC.', { unit: 'units', chk: { k: 'mono', p: nx(a).replace(/\{,\}/g, '') + '-' + b.toPlain() + '*x', C: c + '*x+' + F, ask: 'q' } });
      if (kind === 'linp') return P(intro + 'What price maximizes profit?', A(p), st.concat(['Read the price from the demand curve, not from MR or MC: $p = ' + nx(a) + ' - ' + cq(b, '(' + q + ')') + ' = ' + nx(p) + '$.']), 'Find q from MR = MC, then go up to demand for the price.', { unit: 'dollars', chk: { k: 'mono', p: nx(a).replace(/\{,\}/g, '') + '-' + b.toPlain() + '*x', C: c + '*x+' + F, ask: 'p' } });
      return P(intro + 'What is its maximum profit?', A(prof), st.concat(['Price: $' + nx(p) + '$.', 'Profit: $(' + nx(p) + ' - ' + c + ')(' + q + ')' + (F ? ' - ' + F : '') + ' = ' + nx(prof) + '$.']), 'Profit = (p − MC)·q − fixed cost.', { unit: 'dollars', chk: { k: 'mono', p: nx(a).replace(/\{,\}/g, '') + '-' + b.toPlain() + '*x', C: c + '*x+' + F, ask: 'prof' } });
    }
    if (kind === 'mrexpr') {
      var a2 = R.int(20, 120), b2 = R.pick([1, 2, 3, Q(1, 2)]), bq = Q.from(b2), pw2 = R.pick([1, 2]);
      var pt = a2 + ' - ' + cq(bq, pw2 === 1 ? 'q' : 'q^2'), mrp = a2 + '-' + bq.mul(pw2 + 1).toPlain() + '*q^' + pw2;
      return P('Inverse demand is $p(q) = ' + pt + '$. Write marginal revenue $MR(q)$.', expr(mrp, ['q']),
        ['$R(q) = p(q)\\,q = ' + a2 + 'q - ' + cq(bq, pw2 === 1 ? 'q^2' : 'q^3') + '$.', 'By the product rule, $MR = p(q) + q\\,p\'(q) = ' + a2 + ' - ' + cq(bq.mul(pw2 + 1), pw2 === 1 ? 'q' : 'q^2') + '$.'],
        'Differentiate p(q)·q, not p(q).', { chk: { k: 'mrexpr', p: a2 + '-' + bq.toPlain() + '*q^' + pw2 } });
    }
    if (kind === 'rising') {
      var b3 = R.pick([Q(1), Q(1, 2), Q(2)]), d3 = R.pick([Q(1, 2), Q(1), Q(2)]), c3 = R.int(2, 20), q3 = R.int(4, 20), a3 = b3.mul(2).add(d3.mul(2)).mul(q3).add(c3), p3 = a3.sub(b3.mul(q3));
      var ask = R.pick(['q', 'p']);
      return P(firm + ' faces $p(q) = ' + nx(a3) + ' - ' + cq(b3, 'q') + '$ and has cost $C(q) = ' + c3 + 'q + ' + cq(d3, 'q^2') + '$. What profit-maximizing ' + (ask === 'q' ? 'quantity' : 'price') + ' does it choose?', A(ask === 'q' ? q3 : p3),
        ['$MR = ' + nx(a3) + ' - ' + cq(b3.mul(2), 'q') + '$ and $MC = ' + c3 + ' + ' + cq(d3.mul(2), 'q') + '$.', 'Set them equal: $' + nx(a3.sub(c3)) + ' = ' + cq(b3.mul(2).add(d3.mul(2)), 'q') + '$, so $q = ' + q3 + '$.', 'Price from demand: $p = ' + nx(a3) + ' - ' + cq(b3, '(' + q3 + ')') + ' = ' + nx(p3) + '$.'],
        'MR = MC with a rising MC.', { unit: ask === 'q' ? 'units' : 'dollars', chk: { k: 'mono', p: nx(a3).replace(/\{,\}/g, '') + '-' + b3.toPlain() + '*x', C: c3 + '*x+' + d3.toPlain() + '*x^2', ask: ask } });
    }
    if (kind === 'quad') {
      var bq4 = R.pick([1, 2, Q(1, 3), Q(2, 3)]), b4 = Q.from(bq4), q4 = R.int(2, 8), c4 = R.int(2, 30), a4 = b4.mul(3 * q4 * q4).add(c4), p4 = a4.sub(b4.mul(q4 * q4));
      if (!a4.isInt()) { q4 = 3; a4 = b4.mul(27).add(c4); p4 = a4.sub(b4.mul(9)); }
      return P(firm + ' faces $p(q) = ' + nx(a4) + ' - ' + cq(b4, 'q^2') + '$ and has constant marginal cost ' + money(c4) + '. What quantity maximizes profit?', A(q4),
        ['$R = ' + nx(a4) + 'q - ' + cq(b4, 'q^3') + '$, so $MR = ' + nx(a4) + ' - ' + cq(b4.mul(3), 'q^2') + '$.', 'Set $MR = ' + c4 + '$: $' + cq(b4.mul(3), 'q^2') + ' = ' + nx(a4.sub(c4)) + '$, so $q^2 = ' + (q4 * q4) + '$ and $q = ' + q4 + '$.', 'The price is $p = ' + nx(p4) + '$.'],
        'Differentiate p(q)·q, then set MR = MC.', { unit: 'units', chk: { k: 'mono', p: nx(a4).replace(/\{,\}/g, '') + '-' + b4.toPlain() + '*x^2', C: c4 + '*x', ask: 'q' } });
    }
    var k = R.pick([Q(2), Q(3), Q(4), Q(3, 2), Q(5, 4), Q(5)]), c5 = R.int(2, 20) * 2, p5 = Q(c5).mul(k).div(k.sub(1));
    return P(firm + ' faces constant-elasticity demand $q = A p^{-' + expTex(k) + '}$ and has constant marginal cost ' + money(c5) + '. What price maximizes profit?', A(p5),
      ['With $|\\varepsilon| = ' + nx(k) + '$, marginal revenue is $MR = p\\left(1 - \\dfrac{1}{|\\varepsilon|}\\right) = p\\cdot ' + nx(Q(1).sub(k.inv())) + '$.', 'Set $MR = MC$: $p = \\dfrac{' + c5 + '}{' + nx(Q(1).sub(k.inv())) + '} = ' + nx(p5) + '$.', 'A fixed markup over marginal cost, whatever $A$ is.'],
      'MR = p(1 − 1/|ε|).', { unit: 'dollars', chk: { k: 'monoce', k2: k.toNumber(), c: c5 } });
  });

  G('imicro.lerner-index', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['price', 'lerner', 'price'], ['price', 'lerner', 'elas', 'inel'], ['price', 'elas', 'inel', 'linear']));
    if (kind === 'price') {
      var e = R.pick([Q(2), Q(3), Q(4), Q(5), Q(3, 2), Q(5, 4), Q(6), Q(11)]), mc0 = R.int(2, 20) * 3, p = Q(mc0).mul(e).div(e.sub(1));
      return P('A firm with market power faces a price elasticity of demand of $-' + nx(e) + '$ at its optimum, and its marginal cost is ' + money(mc0) + '. What price does it charge?', A(p),
        ['Markup rule: $\\dfrac{p - MC}{p} = \\dfrac{1}{|\\varepsilon|} = ' + nx(e.inv()) + '$.', 'So $p = \\dfrac{MC}{1 - 1/|\\varepsilon|} = \\dfrac{' + mc0 + '}{' + nx(Q(1).sub(e.inv())) + '} = ' + nx(p) + '$.'],
        'Solve (p − MC)/p = 1/|ε| for p.', { unit: 'dollars', chk: { k: 'monoce', k2: e.toNumber(), c: mc0 } });
    }
    if (kind === 'lerner' || kind === 'elas') {
      var mc1 = R.int(2, 20) * 2, Lr = R.pick([Q(1, 2), Q(1, 3), Q(1, 4), Q(1, 5), Q(2, 5), Q(1, 10)]), p1 = Q(mc1).div(Q(1).sub(Lr));
      if (!p1.isInt()) { mc1 = mc1 * p1.den(); p1 = Q(mc1).div(Q(1).sub(Lr)); }
      if (kind === 'lerner') return P('A firm charges ' + money(p1.toNumber()) + ' for a product whose marginal cost is ' + money(mc1) + '. What is its Lerner index $(p - MC)/p$?', A(Lr),
        ['$L = \\dfrac{' + nx(p1) + ' - ' + mc1 + '}{' + nx(p1) + '} = ' + nx(Lr) + '$.', 'A Lerner index of 0 means price equals marginal cost (no market power); closer to 1 means a larger markup.'],
        'Markup as a share of price.', { chk: { k: 'lerner', p: p1.toNumber(), mc: mc1 } });
      return P('A profit-maximizing firm charges ' + money(p1.toNumber()) + ' and its marginal cost is ' + money(mc1) + '. What must the price elasticity of demand be at that price? (Give the signed value.)', A(Lr.inv().neg()),
        ['Lerner index: $\\dfrac{' + nx(p1) + ' - ' + mc1 + '}{' + nx(p1) + '} = ' + nx(Lr) + '$.', 'At the optimum $L = 1/|\\varepsilon|$, so $|\\varepsilon| = ' + nx(Lr.inv()) + '$ and $\\varepsilon = ' + nx(Lr.inv().neg()) + '$.'],
        'Invert the Lerner index.', { chk: { k: 'lernerE', p: p1.toNumber(), mc: mc1 } });
    }
    if (kind === 'inel') {
      var ans = 'No: at an inelastic point, raising the price would raise revenue and cut cost, so it is not the optimum';
      return P('A monopolist with positive marginal cost is charging a price where demand is inelastic ($|\\varepsilon| < 1$). Can that be its profit-maximizing price?', mc(ans, ['Yes: inelastic demand lets it charge whatever it likes', 'Yes, if marginal cost is high enough', 'Only if the firm is regulated']),
        ['$MR = p(1 - 1/|\\varepsilon|)$ is negative when $|\\varepsilon| < 1$.', 'Producing a little less then <i>raises</i> revenue and also saves cost, so profit rises. A profit maximizer keeps cutting output (raising the price) until demand is elastic.', 'With $MC > 0$, the optimum needs $MR = MC > 0$, which needs $|\\varepsilon| > 1$.'],
        'What is the sign of MR on the inelastic part of demand?', { chk: { k: 'const', text: ans } });
    }
    // |eps| = (a + c)/(a - c) at the monopoly optimum: pick |eps| = k and set a = c(k + 1)/(k - 1)
    var kk = R.pick([2, 3, 5, 4]), c = kk === 4 ? R.int(2, 8) * 6 : R.int(3, 15) * 2, a = c * (kk + 1) / (kk - 1), b = R.pick([1, 2, Q(1, 2)]), bq = Q.from(b);
    var q = Q(a - c).div(bq.mul(2)), p2 = Q(a + c, 2), eps = p2.div(bq.mul(q)).neg(), L2 = p2.sub(c).div(p2);
    return P('A monopolist faces $p(q) = ' + a + ' - ' + cq(bq, 'q') + '$ with constant marginal cost ' + money(c) + '. At its profit-maximizing price, what is the price elasticity of demand (signed)?', A(eps),
      ['$MR = ' + a + ' - ' + cq(bq.mul(2), 'q') + ' = ' + c + '$ gives $q = ' + nx(q) + '$ and $p = ' + nx(p2) + '$.', '$\\varepsilon = \\dfrac{dq}{dp}\\cdot\\dfrac{p}{q} = -' + nx(bq.inv()) + '\\cdot\\dfrac{' + nx(p2) + '}{' + nx(q) + '} = ' + nx(eps) + '$.', 'Check the markup rule: $\\dfrac{p - MC}{p} = ' + nx(L2) + ' = \\dfrac{1}{|\\varepsilon|}$.'],
      'Find the optimum, then the elasticity there.', { chk: { k: 'monoeps', p: a + '-' + bq.toPlain() + '*x', c: c } });
  });

  G('imicro.third-degree-discrimination', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['p1', 'q', 'p1'], ['p1', 'q', 'which', 'ce'], ['ce', 'p1', 'prof', 'which']));
    var labels = R.pick([['students', 'other adults'], ['seniors', 'working-age adults'], ['the home market', 'the export market'], ['weekday riders', 'weekend riders']]);
    if (kind === 'ce') {
      var e1 = R.pick([Q(2), Q(3), Q(4)]), e2 = R.pick([Q(5, 4), Q(3, 2), Q(5, 3)]), c = R.int(2, 12) * 6, pa = Q(c).mul(e1).div(e1.sub(1)), pb = Q(c).mul(e2).div(e2.sub(1)), ask = R.coin();
      return P('A firm sells to ' + labels[0] + ' (price elasticity $-' + nx(e1) + '$) and ' + labels[1] + ' (price elasticity $-' + nx(e2) + '$), with marginal cost ' + money(c) + ' in both markets and no resale between them. What price does it charge ' + (ask ? labels[0] : labels[1]) + '?', A(ask ? pa : pb),
        ['In each market, $MR_i = p_i(1 - 1/|\\varepsilon_i|) = MC$.', labels[0] + ': $p = \\dfrac{' + c + '}{1 - 1/' + nx(e1) + '} = ' + nx(pa) + '$.', labels[1] + ': $p = \\dfrac{' + c + '}{1 - 1/' + nx(e2) + '} = ' + nx(pb) + '$.', 'The less elastic market pays more.'],
        'Markup rule market by market.', { unit: 'dollars', chk: { k: 'monoce', k2: (ask ? e1 : e2).toNumber(), c: c } });
    }
    var c2 = R.int(2, 10) * 2, a1 = c2 + R.int(4, 20) * 2, a2 = c2 + R.int(4, 20) * 2, b1 = R.pick([Q(1, 2), Q(1), Q(2)]), b2 = R.pick([Q(1, 2), Q(1), Q(2)]);
    if (a1 === a2) a2 += 4;
    var q1 = Q(a1 - c2).div(b1.mul(2)), q2 = Q(a2 - c2).div(b2.mul(2)), p1 = Q(a1 + c2, 2), p2 = Q(a2 + c2, 2);
    var intro = 'A firm sells to ' + labels[0] + ', with inverse demand $p_1 = ' + a1 + ' - ' + cq(b1, 'q_1') + '$, and to ' + labels[1] + ', with $p_2 = ' + a2 + ' - ' + cq(b2, 'q_2') + '$. Marginal cost is ' + money(c2) + ' in both markets, and resale is impossible. ';
    var st = [labels[0] + ': $MR_1 = ' + a1 + ' - ' + cq(b1.mul(2), 'q_1') + ' = ' + c2 + '$ gives $q_1 = ' + nx(q1) + '$, $p_1 = ' + nx(p1) + '$.', labels[1] + ': $MR_2 = ' + a2 + ' - ' + cq(b2.mul(2), 'q_2') + ' = ' + c2 + '$ gives $q_2 = ' + nx(q2) + '$, $p_2 = ' + nx(p2) + '$.'];
    if (kind === 'p1') return P(intro + 'What price does it charge ' + labels[0] + '?', A(p1), st.concat(['Each market gets its own MR = MC; the prices differ because the demands differ.']), 'Set MR = MC separately in each market.', { unit: 'dollars', chk: { k: 'mono', p: a1 + '-' + b1.toPlain() + '*x', C: c2 + '*x', ask: 'p' } });
    if (kind === 'q') return P(intro + 'How many units does it sell to ' + labels[1] + '?', A(q2), st, 'Set MR = MC in that market.', { unit: 'units', chk: { k: 'mono', p: a2 + '-' + b2.toPlain() + '*x', C: c2 + '*x', ask: 'q' } });
    if (kind === 'prof') { var pr = p1.sub(c2).mul(q1).add(p2.sub(c2).mul(q2)); return P(intro + 'What is its total profit (no fixed cost)?', A(pr), st.concat(['Profit: $(' + nx(p1) + ' - ' + c2 + ')(' + nx(q1) + ') + (' + nx(p2) + ' - ' + c2 + ')(' + nx(q2) + ') = ' + nx(pr) + '$.']), 'Add the profit from each market.', { unit: 'dollars', chk: { k: 'mono2', d: [[a1, b1.toNumber()], [a2, b2.toNumber()]], c: c2 } }); }
    var e1v = p1.div(b1.mul(q1)), e2v = p2.div(b2.mul(q2)), hi = p1.gt(p2) ? labels[0] : labels[1];
    return P(intro + 'Which group pays the higher price, and why?', mc(hi + ', whose demand is less elastic at its price', [(hi === labels[0] ? labels[1] : labels[0]) + ', whose demand is less elastic at its price', hi + ', because more units are sold there', 'Both pay the same, because marginal cost is the same']),
      st.concat(['Elasticities at those prices: $|\\varepsilon_1| = ' + nx(e1v) + '$, $|\\varepsilon_2| = ' + nx(e2v) + '$.', 'The market with the smaller $|\\varepsilon|$ gets the bigger markup, as $(p - MC)/p = 1/|\\varepsilon|$ says: ' + hi + '.']),
      'Compute both prices.', { chk: { k: 'which3', d: [[a1, b1.toNumber()], [a2, b2.toNumber()]], c: c2, labels: labels } });
  });

  G('imicro.two-part-tariff', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['fee', 'fee', 'price'], ['fee', 'profit', 'compare', 'price'], ['compare', 'profit', 'fee', 'compare']));
    var club = R.pick(['A golf club', 'A gym', 'An amusement park', 'A warehouse store', 'A ski resort']);
    var b = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4)]), c = R.int(1, 10), qc = R.int(4, 20) * 2, a = b.mul(qc).add(c), N = R.int(1, 20) * 50;
    var fee = Q(qc).mul(a.sub(c)).div(2), mono = a.sub(c).mul(a.sub(c)).div(b.mul(4));
    var intro = club + ' has ' + T.commas(N) + ' identical customers, each with inverse demand $p = ' + nx(a) + ' - ' + cq(b, 'q') + '$ for visits. Each visit costs it ' + money(c) + '. It charges an entry fee plus a price per visit. ';
    var st = ['Best per-visit price: marginal cost, $p = ' + c + '$, so each customer makes the efficient number of visits, $q = ' + qc + '$.', 'Entry fee: each customer’s consumer surplus at that price, $\\tfrac{1}{2}(' + qc + ')(' + nx(a) + ' - ' + c + ') = ' + nx(fee) + '$.'];
    if (kind === 'price') return P(intro + 'What price per visit maximizes its profit?', A(c), st.concat(['Any higher price shrinks the surplus that the fee can capture by more than it adds in per-visit profit (the lost deadweight triangle).']), 'Price where the surplus to capture is largest.', { unit: 'dollars', chk: { k: 'tpt', a: a.toNumber(), b: b.toNumber(), c: c, ask: 'p' } });
    if (kind === 'fee') return P(intro + 'What entry fee maximizes its profit?', A(fee), st, 'The fee captures the consumer surplus at the per-visit price.', { unit: 'dollars', chk: { k: 'tpt', a: a.toNumber(), b: b.toNumber(), c: c, ask: 'fee' } });
    if (kind === 'profit') return P(intro + 'What is its total profit?', A(fee.mul(N)), st.concat(['Per-visit profit is zero (price = MC), so profit is the fees: $' + T.commas(N) + '\\times ' + nx(fee) + ' = ' + nx(fee.mul(N)) + '$.']), 'Fees times customers.', { unit: 'dollars', chk: { k: 'tpt', a: a.toNumber(), b: b.toNumber(), c: c, N: N, ask: 'profit' } });
    return P(intro + 'How much more profit per customer does the best two-part tariff earn than the best single price per visit (no fee)?', A(fee.sub(mono)),
      st.concat(['Single price: $MR = ' + nx(a) + ' - ' + cq(b.mul(2), 'q') + ' = ' + c + '$ gives $q = ' + nx(Q(qc, 2)) + '$ and $p = ' + nx(a.add(c).div(2)) + '$; profit per customer $' + nx(mono) + '$.', 'Difference: $' + nx(fee) + ' - ' + nx(mono) + ' = ' + nx(fee.sub(mono)) + '$, twice the single-price profit minus itself: the tariff gets the whole triangle, the single price only half of it.']),
      'Compare the fee at p = MC with the single-price monopoly profit.', { unit: 'dollars', chk: { k: 'tpt', a: a.toNumber(), b: b.toNumber(), c: c, ask: 'gain' } });
  });

  G('imicro.monopsony-calculus', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['L', 'w', 'L'], ['L', 'w', 'comp', 'mcl'], ['w', 'minw', 'comp', 'L']));
    var who = R.pick(['The only hospital in a rural county', 'The one large employer in a mill town', 'A mine in a remote area', 'The only school district in a valley']);
    var s = R.pick([Q(1, 2), Q(1), Q(2), Q(1, 4)]), bb = R.pick([Q(1, 2), Q(1), Q(2)]), w0 = R.int(4, 12), L = R.int(4, 20) * 2;
    var a = bb.add(s.mul(2)).mul(L).add(w0), wm = s.mul(L).add(w0), Lc = a.sub(w0).div(bb.add(s)), wc = s.mul(Lc).add(w0);
    if (!a.isInt()) { L = L * 2; a = bb.add(s.mul(2)).mul(L).add(w0); wm = s.mul(L).add(w0); Lc = a.sub(w0).div(bb.add(s)); wc = s.mul(Lc).add(w0); }
    var intro = who + ' faces the labor supply curve $w(L) = ' + w0 + ' + ' + cq(s, 'L') + '$ (dollars per hour, $L$ workers) and the marginal revenue product $MRP = ' + nx(a) + ' - ' + cq(bb, 'L') + '$. ';
    var st = ['Cost of labor: $w(L)\\,L = ' + w0 + 'L + ' + cq(s, 'L^2') + '$, so the marginal cost of labor is $MCL = ' + w0 + ' + ' + cq(s.mul(2), 'L') + '$ (product rule: $w + L\\,w\'(L)$).', 'Hire where $MRP = MCL$: $' + nx(a) + ' - ' + cq(bb, 'L') + ' = ' + w0 + ' + ' + cq(s.mul(2), 'L') + '$, so $L = ' + L + '$.'];
    if (kind === 'L') return P(intro + 'How many workers does it hire?', A(L), st, 'Set MRP equal to the marginal cost of labor, not to the wage.', { unit: 'workers', chk: { k: 'msony', w0: w0, s: s.toNumber(), a: a.toNumber(), b: bb.toNumber(), ask: 'L' } });
    if (kind === 'w') return P(intro + 'What wage does it pay?', A(wm), st.concat(['The wage is read from the supply curve at $L = ' + L + '$: $w = ' + w0 + ' + ' + cq(s, '(' + L + ')') + ' = ' + nx(wm) + '$.', 'That is below the MRP there ($' + nx(a.sub(bb.mul(L))) + '$) and below $MCL$.']), 'Find L from MRP = MCL, then go down to the supply curve.', { unit: 'dollars', chk: { k: 'msony', w0: w0, s: s.toNumber(), a: a.toNumber(), b: bb.toNumber(), ask: 'w' } });
    if (kind === 'mcl') { var Lx = R.int(2, 30); return P('Labor supply is $w(L) = ' + w0 + ' + ' + cq(s, 'L') + '$. What is the marginal cost of labor at $L = ' + Lx + '$?', A(s.mul(2 * Lx).add(w0)),
      ['Total wage bill: $w(L)\\,L = ' + w0 + 'L + ' + cq(s, 'L^2') + '$.', '$MCL = \\dfrac{d}{dL}\\big(w(L)L\\big) = w(L) + L\\,w\'(L) = ' + w0 + ' + ' + cq(s.mul(2), 'L') + '$.', 'At $L = ' + Lx + '$: $' + nx(s.mul(2 * Lx).add(w0)) + '$, more than the wage $' + nx(s.mul(Lx).add(w0)) + '$, because hiring one more worker means raising the pay of everyone already hired.'],
      'Differentiate the wage bill w(L)·L.', { unit: 'dollars', chk: { k: 'mcl', w0: w0, s: s.toNumber(), L: Lx } }); }
    if (kind === 'comp') return P(intro + 'If the employer had to take the wage as given (a competitive labor market), how many workers would be hired?', A(Lc),
      ['Competitive: hire until $MRP = w(L)$: $' + nx(a) + ' - ' + cq(bb, 'L') + ' = ' + w0 + ' + ' + cq(s, 'L') + '$.', '$L = ' + nx(Lc) + '$, with wage $' + nx(wc) + '$.', 'The monopsonist hires ' + L + ' at $' + nx(wm) + '$: fewer workers and a lower wage.'],
      'Set MRP equal to the supply curve itself.', { unit: 'workers', chk: { k: 'msony', w0: w0, s: s.toNumber(), a: a.toNumber(), b: bb.toNumber(), ask: 'Lc' } });
    var wmin = Q(M.floor(wm.toNumber()) + 1); if (!wmin.lt(wc)) wmin = wm.add(wc).div(2);
    var Ls = wmin.sub(w0).div(s), Ld = a.sub(wmin).div(bb), Le = Q.min(Ls, Ld);
    return P(intro + 'A minimum wage of ' + money(wmin.toNumber()) + ' an hour is set (between the monopsony wage and the competitive wage). How many workers are employed?', A(Le),
      st.concat(['Without it: $L = ' + L + '$ at $w = ' + nx(wm) + '$.', 'With the floor, the first workers all cost $' + nx(wmin) + '$: $MCL = ' + nx(wmin) + '$ until the supply curve reaches it, at $L = (' + nx(wmin) + ' - ' + w0 + ')/' + s.toTex() + ' = ' + nx(Ls) + '$.', 'At that wage $MRP \\ge ' + nx(wmin) + '$ for $L \\le ' + nx(Ld) + '$, so the employer hires $' + nx(Le) + '$: more than ' + L + '. In this model the floor raises both the wage and employment.']),
      'With a minimum wage, the marginal cost of labor is flat at the minimum wage up to the supply curve.', { unit: 'workers', chk: { k: 'msony', w0: w0, s: s.toNumber(), a: a.toNumber(), b: bb.toNumber(), wmin: wmin.toNumber(), ask: 'Lmin' } });
  });

  // =================================================================== Unit 8: Game Theory and Strategy

  var RC2 = [['Up', 'Down'], ['Left', 'Right']], RC3 = [['Top', 'Middle', 'Bottom'], ['Left', 'Center', 'Right']];
  // best-response analysis of a bimatrix game: pay[i][j] = [row, col]
  function pureNE(pay) {
    var n = pay.length, m = pay[0].length, out = [];
    for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) {
      var rowBest = true, colBest = true;
      for (var k = 0; k < n; k++) if (pay[k][j][0] > pay[i][j][0]) rowBest = false;
      for (var l2 = 0; l2 < m; l2++) if (pay[i][l2][1] > pay[i][j][1]) colBest = false;
      if (rowBest && colBest) out.push([i, j]);
    }
    return out;
  }
  // a random game with no ties in either player's comparisons; want = number of pure equilibria (0, 1, 2) or null
  function randGame(R, n, m, want) {
    for (var t = 0; t < 4000; t++) {
      var pay = [];
      for (var i = 0; i < n; i++) { pay.push([]); for (var j = 0; j < m; j++) pay[i].push([0, 0]); }
      for (var j2 = 0; j2 < m; j2++) { var col = R.sample(U.range(0, 9), n); for (var i2 = 0; i2 < n; i2++) pay[i2][j2][0] = col[i2]; }
      for (var i3 = 0; i3 < n; i3++) { var row = R.sample(U.range(0, 9), m); for (var j3 = 0; j3 < m; j3++) pay[i3][j3][1] = row[j3]; }
      var ne = pureNE(pay);
      if (want === null || want === undefined || ne.length === want) return { pay: pay, ne: ne };
    }
    return null;
  }

  G('imicro.pure-nash', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['count', 'which', 'br'], ['count', 'which', 'br', 'coord'], ['count3', 'which3', 'coord', 'count3']));
    var three = /3$/.test(kind), n = three ? 3 : 2, names = three ? RC3 : RC2;
    var want = kind === 'coord' ? 2 : kind === 'which' || kind === 'which3' ? 1 : R.pick([0, 1, 1, 2, 2]);
    if (kind === 'br') want = null;
    var g = randGame(R, n, n, want) || randGame(R, n, n, null), pay = g.pay, ne = g.ne;
    var players = R.pick([['Row', 'Column'], ['Firm A', 'Firm B'], ['Ana', 'Ben']]);
    var mat = '$$' + matTeX(names[0], names[1], pay) + '$$';
    var intro = 'In this game ' + players[0] + ' picks a row and ' + players[1] + ' picks a column; each cell lists (' + players[0] + '’s payoff, ' + players[1] + '’s payoff). ' + mat;
    var cell = function (c) { return '(' + names[0][c[0]] + ', ' + names[1][c[1]] + ')'; };
    var brSteps = [];
    for (var j = 0; j < n; j++) { var bi = 0; for (var i = 1; i < n; i++) if (pay[i][j][0] > pay[bi][j][0]) bi = i; brSteps.push('If ' + players[1] + ' plays ' + names[1][j] + ', ' + players[0] + '’s best response is ' + names[0][bi] + ' (' + pay[bi][j][0] + ').'); }
    for (var i4 = 0; i4 < n; i4++) { var bj = 0; for (var j4 = 1; j4 < n; j4++) if (pay[i4][j4][1] > pay[i4][bj][1]) bj = j4; brSteps.push('If ' + players[0] + ' plays ' + names[0][i4] + ', ' + players[1] + '’s best response is ' + names[1][bj] + ' (' + pay[i4][bj][1] + ').'); }
    var verdict = ne.length ? 'Cells where both are best responses: ' + ne.map(cell).join(' and ') + '.' : 'No cell has both payoffs as best responses: there is no pure-strategy Nash equilibrium (there is one in mixed strategies).';
    if (kind === 'count' || kind === 'count3' || kind === 'coord') return P(intro + ' How many pure-strategy Nash equilibria does it have?', A(ne.length), brSteps.concat([verdict]),
      'Mark each player’s best response to each choice of the other player, then look for cells marked twice.', { chk: { k: 'nashcount', pay: pay } });
    if (kind === 'which' || kind === 'which3') {
      var others = []; for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) if (!(a === ne[0][0] && b === ne[0][1])) others.push([a, b]);
      return P(intro + ' Which cell is the pure-strategy Nash equilibrium?', mc(cell(ne[0]), R.sample(others, 3).map(cell)), brSteps.concat([verdict]),
        'Underline each player’s best responses; the equilibrium has both payoffs underlined.', { chk: { k: 'nashwhich', pay: pay, names: names } });
    }
    var jj = R.int(0, n - 1), best = 0; for (var i5 = 1; i5 < n; i5++) if (pay[i5][jj][0] > pay[best][jj][0]) best = i5;
    return P(intro + ' If ' + players[1] + ' plays ' + names[1][jj] + ', what is ' + players[0] + '’s best response?', mc(names[0][best], names[0].filter(function (x, i) { return i !== best; }).concat(['Whatever gives ' + players[1] + ' the lowest payoff'])),
      ['Look down the ' + names[1][jj] + ' column at ' + players[0] + '’s payoffs (the first number in each cell): ' + pay.map(function (r, i) { return names[0][i] + ' ' + r[jj][0]; }).join(', ') + '.', 'The largest is ' + pay[best][jj][0] + ', from ' + names[0][best] + '. Compare a player’s own payoffs across that player’s own choices; the other player’s payoffs don’t enter.'],
      'Compare only ' + players[0] + '’s own payoffs within that column.', { chk: { k: 'br', pay: pay, j: jj, names: names } });
  });

  // "a v + b(1 - v)" with zero and unit coefficients tidied
  function mixT(a, b, v) { var t1 = a === 0 ? '' : (a === 1 ? '' : a) + v, t2 = b === 0 ? '' : (b === 1 ? '' : b) + '(1 - ' + v + ')'; return t1 && t2 ? t1 + ' + ' + t2 : t1 || t2 || '0'; }
  G('imicro.mixed-strategies', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['p', 'q', 'p'], ['p', 'q', 'val', 'kick'], ['q', 'val', 'kick', 'p']));
    if (kind === 'kick') {
      // penalty kick: kicker L/R, goalie dives L/R; scoring probabilities (percent)
      var aLL = R.int(2, 6) * 10, aRR = R.int(2, 6) * 10, aLR = R.int(8, 10) * 10, aRL = R.int(8, 10) * 10;
      if (aLR === 100 && aRL === 100) aRL = 90;
      var q = Q(aRR - aLR, aLL - aLR - aRL + aRR); // goalie's prob of diving left making the kicker indifferent
      var pk = Q(aRR - aRL, aLL - aRL - aLR + aRR); // kicker's prob of kicking left making the goalie indifferent
      return P('A kicker shoots left or right; the goalie dives left or right. Scoring chances (percent): kick left, dive left ' + aLL + '; kick left, dive right ' + aLR + '; kick right, dive left ' + aRL + '; kick right, dive right ' + aRR + '. The kicker wants to score; the goalie wants to stop it. In the mixed-strategy equilibrium, how often does the kicker shoot left (as a fraction)?', A(pk),
        ['There is no pure equilibrium: whatever one does, the other wants to switch.', 'The kicker’s mix must make the <b>goalie</b> indifferent. With $x$ = chance of kicking left, scoring when the goalie dives left is $' + mixT(aLL, aRL, 'x') + '$; diving right, $' + mixT(aLR, aRR, 'x') + '$.', 'Set them equal: $x = \\dfrac{' + aRR + ' - ' + aRL + '}{' + aLL + ' - ' + aRL + ' - ' + aLR + ' + ' + aRR + '} = ' + nx(pk) + '$.'],
        'Use the goalie’s outcomes to find the kicker’s mix.', { chk: { k: 'mixed', pay: [[[aLL, -aLL], [aLR, -aLR]], [[aRL, -aRL], [aRR, -aRR]]], ask: 'p' } });
    }
    // cycle: r11 > r21, r22 > r12 ; c12 > c11, c21 > c22
    var pay, tries = 0, pp, qq;
    do {
      var r21 = R.int(0, 6), r11 = r21 + R.int(1, 5), r12 = R.int(0, 6), r22 = r12 + R.int(1, 5), c11 = R.int(0, 6), c12 = c11 + R.int(1, 5), c22 = R.int(0, 6), c21 = c22 + R.int(1, 5);
      pay = [[[r11, c11], [r12, c12]], [[r21, c21], [r22, c22]]];
      pp = Q(c22 - c21, c11 - c21 - c12 + c22); qq = Q(r22 - r12, r11 - r12 - r21 + r22); tries++;
    } while (tries < 300 && (decPlaces(pp) > 2 && pp.den() > 6 || decPlaces(qq) > 2 && qq.den() > 6));
    var mat = '$$' + matTeX(RC2[0], RC2[1], pay) + '$$', intro = 'Row picks Up or Down; Column picks Left or Right; payoffs are (Row, Column). ' + mat + ' This game has no pure-strategy equilibrium. ';
    var stP = ['Row\u2019s probability $p$ of Up must make <b>Column</b> indifferent. Column\u2019s payoff from Left: $' + mixT(c11, c21, 'p') + '$; from Right: $' + mixT(c12, c22, 'p') + '$.', 'Set them equal and solve: $p = \\dfrac{' + c22 + ' - ' + c21 + '}{' + c11 + ' - ' + c21 + ' - ' + c12 + ' + ' + c22 + '} = ' + nx(pp) + '$.'];
    var stQ = ['Column\u2019s probability $q$ of Left must make <b>Row</b> indifferent. Row\u2019s payoff from Up: $' + mixT(r11, r12, 'q') + '$; from Down: $' + mixT(r21, r22, 'q') + '$.', 'Set them equal and solve: $q = \\dfrac{' + r22 + ' - ' + r12 + '}{' + r11 + ' - ' + r12 + ' - ' + r21 + ' + ' + r22 + '} = ' + nx(qq) + '$.'];
    if (kind === 'p') return P(intro + 'In the mixed-strategy equilibrium, with what probability does Row play Up?', A(pp), stP, 'Row’s mix is pinned down by Column’s payoffs.', { chk: { k: 'mixed', pay: pay, ask: 'p' } });
    if (kind === 'q') return P(intro + 'In the mixed-strategy equilibrium, with what probability does Column play Left?', A(qq), stQ, 'Column’s mix is pinned down by Row’s payoffs.', { chk: { k: 'mixed', pay: pay, ask: 'q' } });
    var v = qq.mul(r11).add(Q(1).sub(qq).mul(r12));
    return P(intro + 'What is Row’s expected payoff in the mixed-strategy equilibrium?', A(v), stQ.concat(['At that $q$ Row is indifferent, so its expected payoff equals the payoff from Up: $' + [[r11, qq], [r12, Q(1).sub(qq)]].filter(function (t) { return t[0] !== 0; }).map(function (t) { return t[0] + '\\cdot ' + nx(t[1]); }).join(' + ') + ' = ' + nx(v) + '$.']), 'Find Column’s mix, then Row’s payoff from either row.', { chk: { k: 'mixed', pay: pay, ask: 'v' } });
  });

  // game trees: { p: player index, m: [[label, subtree | payoff array]] }
  function solveTree(node) {
    if (Array.isArray(node)) return { pay: node, path: [] };
    var best = null, bi = -1;
    node.m.forEach(function (mv, i) { var r = solveTree(mv[1]); if (!best || r.pay[node.p] > best.pay[node.p]) { best = r; bi = i; } });
    return { pay: best.pay, path: [node.m[bi][0]].concat(best.path) };
  }
  G('imicro.backward-induction', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['entry', 'entrypay', 'entry'], ['entry', 'tree', 'entrypay', 'threat'], ['tree', 'treepay', 'threat', 'tree']));
    if (kind === 'entry' || kind === 'entrypay' || kind === 'threat') {
      // entrant: out -> (0, M); in -> incumbent fights (-f, F) or accommodates (a, A)
      var Mo = R.int(6, 12) * 10, A0 = R.int(2, 5) * 10, a = R.int(1, 4) * 10, fight = R.coin() || kind === 'threat';
      var Fi = fight ? A0 - R.int(1, 3) * 10 : A0 + R.int(1, 3) * 10, fe = R.int(1, 3) * 10;
      if (kind === 'threat') Fi = A0 - R.int(1, 3) * 10;
      var tree = { p: 0, m: [['Stay out', [0, Mo]], ['Enter', { p: 1, m: [['Fight', [-fe, Fi]], ['Accommodate', [a, A0]]] }]] }, sol = solveTree(tree);
      var desc = 'A potential entrant chooses Stay out or Enter. If it stays out, the payoffs are (entrant 0, incumbent ' + Mo + '). If it enters, the incumbent chooses Fight, giving (' + (-fe) + ', ' + Fi + '), or Accommodate, giving (' + a + ', ' + A0 + ').';
      var st = ['Start at the end: if entry happens, the incumbent compares Fight (' + Fi + ') with Accommodate (' + A0 + ') and picks ' + (Fi > A0 ? 'Fight' : 'Accommodate') + '.', 'The entrant looks ahead: Enter gives it ' + (Fi > A0 ? -fe : a) + ', Stay out gives 0, so it chooses ' + sol.path[0] + '.', 'Subgame-perfect outcome: ' + sol.path.join(', then ') + ', with payoffs (' + sol.pay.join(', ') + ').'];
      if (kind === 'entrypay') return P(desc + ' Using backward induction, what is the incumbent’s payoff?', A(sol.pay[1]), st, 'Solve the incumbent’s choice first, then the entrant’s.', { chk: { k: 'tree', tree: tree, ask: 1 } });
      if (kind === 'threat') { var ans = 'No: once entry has happened, fighting gives it ' + Fi + ' and accommodating gives ' + A0 + ', so it would accommodate';
        return P(desc + ' Before the entrant decides, the incumbent announces "If you enter, I will fight." Is the threat believable?', mc(ans, ['Yes: the incumbent said so, and fighting hurts the entrant', 'Yes: fighting keeps the incumbent’s profit at ' + Mo, 'It depends on whether the entrant is risk averse']),
          st.concat(['A threat is credible only if carrying it out is the best move when the time comes. Here it is not, so the entrant ignores it and enters.']), 'Ask what the incumbent would actually do after entry.', { chk: { k: 'tree', tree: tree, ask: 'threat', text: ans } }); }
      var outc = sol.path.join(', then ');
      return P(desc + ' What is the subgame-perfect outcome?', mc(outc, ['Stay out', 'Enter, then Fight', 'Enter, then Accommodate'].filter(function (x) { return x !== outc; })), st, 'Solve from the last move backward.', { chk: { k: 'tree', tree: tree, ask: 'path', text: outc } });
    }
    // a two-stage tree: A chooses L or R, then B chooses l or r
    var leaves = [], i;
    for (i = 0; i < 4; i++) leaves.push([R.int(0, 9), R.int(0, 9)]);
    if (leaves[0][1] === leaves[1][1]) leaves[1][1] = (leaves[1][1] + 3) % 10;
    if (leaves[2][1] === leaves[3][1]) leaves[3][1] = (leaves[3][1] + 4) % 10;
    var tr = { p: 0, m: [['L', { p: 1, m: [['l', leaves[0]], ['r', leaves[1]]] }], ['R', { p: 1, m: [['l', leaves[2]], ['r', leaves[3]]] }]] };
    var bL = leaves[0][1] > leaves[1][1] ? 0 : 1, bR = leaves[2][1] > leaves[3][1] ? 2 : 3;
    if (leaves[bL][0] === leaves[bR][0]) leaves[bR][0] = (leaves[bR][0] + 5) % 10;
    var s2 = solveTree(tr);
    var d2 = 'Player A moves first, choosing L or R. Player B sees that choice and picks l or r. Payoffs (A, B): after L: l gives (' + leaves[0].join(', ') + '), r gives (' + leaves[1].join(', ') + '); after R: l gives (' + leaves[2].join(', ') + '), r gives (' + leaves[3].join(', ') + ').';
    var st2 = ['After L, B compares ' + leaves[0][1] + ' and ' + leaves[1][1] + ' and picks ' + (bL === 0 ? 'l' : 'r') + ', giving A ' + leaves[bL][0] + '.', 'After R, B compares ' + leaves[2][1] + ' and ' + leaves[3][1] + ' and picks ' + (bR === 2 ? 'l' : 'r') + ', giving A ' + leaves[bR][0] + '.', 'A compares ' + leaves[bL][0] + ' (L) with ' + leaves[bR][0] + ' (R) and chooses ' + s2.path[0] + '. Outcome: ' + s2.path.join(', then ') + ', payoffs (' + s2.pay.join(', ') + ').'];
    var viz = { name: 'ec-gametree', opts: { players: ['A', 'B'], tree: { player: 0, moves: [{ label: 'L', to: { player: 1, moves: [{ label: 'l', pay: leaves[0] }, { label: 'r', pay: leaves[1] }] } }, { label: 'R', to: { player: 1, moves: [{ label: 'l', pay: leaves[2] }, { label: 'r', pay: leaves[3] }] } }] }, quiet: true, interactive: false } };
    if (kind === 'treepay') return P(d2 + ' With backward induction, what payoff does A get?', A(s2.pay[0]), st2, 'Work out B’s choice at each of B’s nodes first.', { viz: viz, chk: { k: 'tree', tree: tr, ask: 0 } });
    var o2 = s2.path.join(', then '), alts = ['L, then l', 'L, then r', 'R, then l', 'R, then r'].filter(function (x) { return x !== o2; });
    return P(d2 + ' What is the subgame-perfect outcome?', mc(o2, alts), st2, 'Solve B’s choices first, then A’s.', { viz: viz, chk: { k: 'tree', tree: tr, ask: 'path', text: o2 } });
  });

  G('imicro.repeated-games', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['dstar', 'pv', 'dstar'], ['dstar', 'decide', 'pv', 'gain'], ['dstar', 'decide', 'gain', 'dstar']));
    var Pp = R.int(1, 5), Rr = Pp + R.int(2, 6), Tt = Rr + R.int(1, 6), Ss = R.int(0, Pp - 1);
    var ds = Q(Tt - Rr, Tt - Pp);
    var desc = 'Two firms repeat a pricing game forever. Each round: both cooperate (keep prices high) gives each ' + Rr + '; both cheat gives each ' + Pp + '; a firm that cheats while the other cooperates gets ' + Tt + ' (the other gets ' + Ss + '). Each firm uses grim trigger: cooperate until the other cheats, then cheat forever. Payoffs are discounted by $\\delta$ per round.';
    var st = ['Cooperate forever: $' + Rr + ' + ' + Rr + '\\delta + ' + Rr + '\\delta^2 + \\cdots = \\dfrac{' + Rr + '}{1 - \\delta}$.', 'Cheat now: $' + Tt + '$ this round, then $' + Pp + '$ forever: $' + Tt + ' + \\dfrac{' + Pp + '\\delta}{1 - \\delta}$.', 'Cooperation holds if $\\dfrac{' + Rr + '}{1 - \\delta} \\ge ' + Tt + ' + \\dfrac{' + Pp + '\\delta}{1 - \\delta}$, which simplifies to $\\delta \\ge \\dfrac{T - R}{T - P} = \\dfrac{' + Tt + ' - ' + Rr + '}{' + Tt + ' - ' + Pp + '} = ' + nx(ds) + '$.'];
    if (kind === 'dstar') return P(desc + ' What is the smallest discount factor $\\delta$ at which cooperation can be sustained?', A(ds), st, 'Compare the stream from cooperating with a one-time gain followed by punishment.', { chk: { k: 'grim', T: Tt, R: Rr, P: Pp, ask: 'd' } });
    if (kind === 'pv') { var dd = R.pick([Q(1, 2), Q(3, 4), Q(4, 5), Q(9, 10), Q(2, 3)]); return P(desc + ' With $\\delta = ' + dd.toTex() + '$, what is the present value of cooperating forever, starting now?', A(Q(Rr).div(Q(1).sub(dd))),
      ['A geometric series: $' + Rr + '(1 + \\delta + \\delta^2 + \\cdots) = \\dfrac{' + Rr + '}{1 - \\delta}$.', '$= \\dfrac{' + Rr + '}{1 - ' + dd.toTex() + '} = ' + nx(Q(Rr).div(Q(1).sub(dd))) + '$.'], 'Sum the infinite geometric series.', { chk: { k: 'grim', T: Tt, R: Rr, P: Pp, d: dd.toNumber(), ask: 'pv' } }); }
    if (kind === 'gain') { var d3 = R.pick([Q(1, 2), Q(3, 4), Q(4, 5), Q(9, 10)]), gainV = Q(Tt).add(Q(Pp).mul(d3).div(Q(1).sub(d3))).sub(Q(Rr).div(Q(1).sub(d3)));
      return P(desc + ' With $\\delta = ' + d3.toTex() + '$, how much more (or less, if negative) does a firm get from cheating now than from cooperating forever (in present value)?', A(gainV),
        st.slice(0, 2).concat(['Cooperate: $\\dfrac{' + Rr + '}{1 - ' + d3.toTex() + '} = ' + nx(Q(Rr).div(Q(1).sub(d3))) + '$. Cheat: $' + Tt + ' + \\dfrac{' + Pp + '(' + d3.toTex() + ')}{1 - ' + d3.toTex() + '} = ' + nx(Q(Tt).add(Q(Pp).mul(d3).div(Q(1).sub(d3)))) + '$.', 'Difference (cheat minus cooperate): $' + nx(gainV) + '$. ' + (gainV.sign() < 0 ? 'Negative: cheating does not pay, so cooperation holds.' : gainV.sign() > 0 ? 'Positive: cheating pays, so cooperation breaks down.' : 'Zero: just indifferent.')]),
        'Value each stream as a geometric series.', { chk: { k: 'grim', T: Tt, R: Rr, P: Pp, d: d3.toNumber(), ask: 'gain' } }); }
    var dv = R.pick([Q(1, 4), Q(1, 2), Q(3, 4), Q(9, 10), Q(1, 3), Q(2, 3)]); if (dv.eq(ds)) dv = dv.eq(Q(9, 10)) ? Q(1, 4) : Q(9, 10);
    var holds = dv.ge(ds), txt = holds ? 'Yes: δ is at least the threshold, so the future loss from punishment outweighs the one-time gain' : 'No: δ is below the threshold, so the one-time gain from cheating outweighs the future loss';
    return P(desc + ' If $\\delta = ' + dv.toTex() + '$, can cooperation be sustained?', mc(txt, [holds ? 'No: δ is below the threshold, so the one-time gain from cheating outweighs the future loss' : 'Yes: δ is at least the threshold, so the future loss from punishment outweighs the one-time gain', 'Yes, because cooperating pays more each round than cheating against a cheater', 'No, because a cheater always earns ' + Tt + ', the most of any outcome']),
      st.concat(['$' + dv.toTex() + (holds ? ' \\ge ' : ' < ') + nx(ds) + '$: ' + (holds ? 'cooperation holds.' : 'cooperation breaks down.')]), 'Find the threshold first.', { chk: { k: 'grim', T: Tt, R: Rr, P: Pp, d: dv.toNumber(), ask: 'holds', text: txt } });
  });

  // linear inverse demand P = a - bQ
  function duoSetup(R, ctx, asym) {
    // q1 = (a - 2c1 + c2)/(3b) = k (whole) and q2 = k - (c2 - c1)/b > 0
    var b = R.pick([Q(1), Q(1, 2), Q(2)]), c1 = R.int(1, 10) * 2, c2 = asym ? c1 + R.int(1, 3) * 3 : c1;
    var k = R.int(3, 12) + M.ceil(Q(c2 - c1).div(b).toNumber()), a = b.mul(3 * k).add(2 * c1 - c2);
    return { a: a, b: b, c1: c1, c2: c2 };
  }
  G('imicro.cournot', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['q1', 'Q', 'br'], ['q1', 'Q', 'price', 'br', 'asym'], ['asym', 'price', 'profit', 'q1']));
    var asym = kind === 'asym' || (ctx.level === 3 && R.coin()), d = duoSetup(R, ctx, asym), a = d.a, b = d.b, c1 = d.c1, c2 = d.c2;
    var q1 = a.sub(2 * c1).add(c2).div(b.mul(3)), q2 = a.sub(2 * c2).add(c1).div(b.mul(3)), Qt = q1.add(q2), P0 = a.sub(b.mul(Qt));
    var intro = 'Two firms choose quantities at the same time. Inverse demand is $P = ' + nx(a) + ' - ' + cq(b, 'Q') + '$ with $Q = q_1 + q_2$; marginal costs are ' + (c1 === c2 ? money(c1) + ' for both' : money(c1) + ' for firm 1 and ' + money(c2) + ' for firm 2') + '. ';
    var st = ['Firm 1 maximizes $(' + nx(a) + ' - ' + cq(b, '(q_1 + q_2)') + ')q_1 - ' + c1 + 'q_1$, treating $q_2$ as given: $' + nx(a) + ' - ' + cq(b.mul(2), 'q_1') + ' - ' + cq(b, 'q_2') + ' - ' + c1 + ' = 0$.', 'Best response: $q_1 = \\dfrac{' + nx(a.sub(c1)) + ' - ' + cq(b, 'q_2') + '}{' + nx(b.mul(2)) + '}$, and likewise for firm 2' + (c1 === c2 ? '.' : ' with cost ' + c2 + '.'), 'Solve the two together: $q_1 = \\dfrac{a - 2c_1 + c_2}{3b} = ' + nx(q1) + '$ and $q_2 = ' + nx(q2) + '$.'];
    var chk = { k: 'cournot', a: a.toNumber(), b: b.toNumber(), c: [c1, c2] };
    if (kind === 'br') { var qo = R.int(1, M.max(1, M.floor(a.sub(c1).div(b).toNumber() / 2))), br = a.sub(c1).sub(b.mul(qo)).div(b.mul(2));
      return P(intro + 'If firm 2 produces ' + qo + ' units, how much should firm 1 produce?', A(br), st.slice(0, 2).concat(['With $q_2 = ' + qo + '$: $q_1 = \\dfrac{' + nx(a.sub(c1)) + ' - ' + nx(b.mul(qo)) + '}{' + nx(b.mul(2)) + '} = ' + nx(br) + '$.']), 'Maximize firm 1’s profit with q2 fixed: its residual demand.', { unit: 'units', chk: Object.assign({ ask: 'br', q2: qo }, chk) }); }
    if (kind === 'q1' || kind === 'asym') return P(intro + 'In the Cournot equilibrium, how much does firm 1 produce?', A(q1), st, 'Write each best response, then solve them together.', { unit: 'units', chk: Object.assign({ ask: 'q1' }, chk) });
    if (kind === 'Q') return P(intro + 'What is total output in the Cournot equilibrium?', A(Qt), st.concat(['Total: $' + nx(q1) + ' + ' + nx(q2) + ' = ' + nx(Qt) + '$. For comparison, a monopoly would produce $' + nx(a.sub(c1).div(b.mul(2))) + '$ and competition (P = MC) $' + nx(a.sub(c1).div(b)) + '$.']), 'Find each firm’s output and add.', { unit: 'units', chk: Object.assign({ ask: 'Q' }, chk) });
    if (kind === 'price') return P(intro + 'What is the market price in the Cournot equilibrium?', A(P0), st.concat(['$Q = ' + nx(Qt) + '$, so $P = ' + nx(a) + ' - ' + cq(b, '(' + nx(Qt) + ')') + ' = ' + nx(P0) + '$.']), 'Find total output, then use demand.', { unit: 'dollars', chk: Object.assign({ ask: 'P' }, chk) });
    var pr1 = P0.sub(c1).mul(q1);
    return P(intro + 'What is firm 1’s profit in the Cournot equilibrium?', A(pr1), st.concat(['Price: $' + nx(P0) + '$.', 'Profit: $(' + nx(P0) + ' - ' + c1 + ')(' + nx(q1) + ') = ' + nx(pr1) + '$.']), 'Price minus cost, times quantity.', { unit: 'dollars', chk: Object.assign({ ask: 'pi1' }, chk) });
  });

  G('imicro.bertrand', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['same', 'asym', 'same'], ['same', 'asym', 'asymq', 'diff'], ['diff', 'asymprof', 'diff', 'asym']));
    var good = R.pick(['identical phone chargers', 'the same brand of bottled water', 'identical flights on a route', 'identical bags of cement']);
    if (kind === 'same') { var c = R.int(2, 30); return P('Two firms sell ' + good + ', each with constant marginal cost ' + money(c) + ' and no capacity limits. They set prices at the same time, and buyers buy from the cheaper firm (splitting evenly at a tie). What is the equilibrium price?', A(c),
      ['At any common price above ' + money(c) + ', either firm could cut its price slightly and take the whole market, almost doubling its sales.', 'At a price below cost a firm loses money on every sale, so it would rather raise its price.', 'The only price where neither firm wants to move is $p = MC = ' + c + '$, with zero profit: two firms are enough for the competitive outcome.'],
      'Ask whether either firm gains by undercutting.', { unit: 'dollars', chk: { k: 'bert', c: [c, c], ask: 'p' } }); }
    if (kind === 'diff') {
      var e = R.pick([Q(1, 2), Q(1, 4), Q(1, 3), Q(2, 3)]), cc = R.int(2, 10), pstar = R.int(cc + 2, cc + 20);
      var A0 = Q(2).sub(e).mul(pstar).sub(cc); if (!A0.isInt()) { pstar = pstar * e.den(); A0 = Q(2).sub(e).mul(pstar).sub(cc); }
      return P('Two firms sell differentiated products. Demand for firm $i$ is $q_i = ' + nx(A0) + ' - p_i + ' + cq(e, 'p_j') + '$, and each has marginal cost ' + money(cc) + '. They set prices at the same time. What is the equilibrium price?', A(pstar),
        ['Firm $i$ maximizes $(p_i - ' + cc + ')(' + nx(A0) + ' - p_i + ' + cq(e, 'p_j') + ')$.', 'First-order condition: $' + nx(A0) + ' - 2p_i + ' + cq(e, 'p_j') + ' + ' + cc + ' = 0$, so $p_i = \\dfrac{' + nx(A0.add(cc)) + ' + ' + cq(e, 'p_j') + '}{2}$.', 'Symmetric equilibrium $p_i = p_j = p$: $2p = ' + nx(A0.add(cc)) + ' + ' + cq(e, 'p') + '$, so $p = \\dfrac{' + nx(A0.add(cc)) + '}{' + nx(Q(2).sub(e)) + '} = ' + pstar + '$.', 'Above marginal cost: with differentiated products, undercutting no longer steals the whole market.'],
        'Write firm i’s best response, then impose symmetry.', { unit: 'dollars', chk: { k: 'bertdiff', A: A0.toNumber(), e: e.toNumber(), c: cc } });
    }
    var c1 = R.int(2, 10), c2 = c1 + R.int(2, 8), a = c2 * 2 + R.int(2, 20), b = R.pick([1, 2]), mon = (a + c1) / 2;
    if (c2 > mon) c2 = M.floor(mon);
    var q = (a - c2) / b, pr = (c2 - c1) * q;
    var intro = 'Two firms sell ' + good + '. Market demand is $Q = ' + (a / b === M.round(a / b) && b === 1 ? a + ' - P' : '(' + a + ' - P)/' + b) + '$. Firm 1’s marginal cost is ' + money(c1) + ' and firm 2’s is ' + money(c2) + '. They set prices at the same time, buyers buy from the cheaper firm, and prices can be set to the cent. ';
    var st = ['Firm 2 won’t sell below its cost of ' + money(c2) + '.', 'Firm 1 can price just below ' + money(c2) + ' (a cent under) and serve the whole market; the monopoly price for firm 1, ' + money(mon) + ', is higher, so it doesn’t want to go above ' + money(c2) + ' either.', 'So the price is (essentially) ' + money(c2) + ', firm 1 sells $Q = ' + nx(q) + '$ units, and firm 2 sells nothing.'];
    if (kind === 'asym') return P(intro + 'About what price prevails?', A(c2, { rtol: 0.005 }), st, 'The low-cost firm only has to beat the high-cost firm’s cost.', { unit: 'dollars', chk: { k: 'bert', c: [c1, c2], a: a, b: b, ask: 'p' } });
    if (kind === 'asymq') return P(intro + 'About how many units does firm 1 sell?', A(q, { rtol: 0.01 }), st, 'Find the price first, then use demand.', { unit: 'units', chk: { k: 'bert', c: [c1, c2], a: a, b: b, ask: 'q' } });
    return P(intro + 'About how much profit does firm 1 earn?', A(pr, { rtol: 0.01 }), st.concat(['Profit: $(' + c2 + ' - ' + c1 + ')(' + nx(q) + ') = ' + nx(pr) + '$.']), 'Margin over its own cost, times the market quantity at that price.', { unit: 'dollars', chk: { k: 'bert', c: [c1, c2], a: a, b: b, ask: 'pi' } });
  });

  G('imicro.stackelberg', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['lead', 'follow', 'lead'], ['lead', 'follow', 'price', 'leadprof'], ['leadprof', 'compare', 'price', 'follow']));
    var b = R.pick([Q(1), Q(1, 2), Q(2)]), c = R.int(1, 10) * 2, k = R.int(2, 10), a = b.mul(12 * k).add(c);
    var q1 = a.sub(c).div(b.mul(2)), q2 = a.sub(c).div(b.mul(4)), P0 = a.sub(b.mul(q1.add(q2))), pi1 = P0.sub(c).mul(q1), qc = a.sub(c).div(b.mul(3)), pic = qc.mul(b).mul(qc);
    var intro = 'Firm 1 chooses its quantity first; firm 2 sees it and then chooses. Inverse demand is $P = ' + nx(a) + ' - ' + cq(b, '(q_1 + q_2)') + '$, and both have marginal cost ' + money(c) + '. ';
    var st = ['Follower’s best response: $q_2 = \\dfrac{' + nx(a.sub(c)) + ' - ' + cq(b, 'q_1') + '}{' + nx(b.mul(2)) + '}$.', 'The leader plugs that in: $P = ' + nx(a) + ' - ' + cq(b, 'q_1') + ' - ' + cq(b, 'q_2') + ' = \\dfrac{' + nx(a.add(c)) + ' - ' + cq(b, 'q_1') + '}{2}$, so its profit is $\\left(\\dfrac{' + nx(a.add(c)) + ' - ' + cq(b, 'q_1') + '}{2} - ' + c + '\\right)q_1$.', 'Maximize: $\\dfrac{' + nx(a.sub(c)) + '}{2} - ' + cq(b, 'q_1') + ' = 0$, so $q_1 = ' + nx(q1) + '$; then $q_2 = ' + nx(q2) + '$.'];
    var chk = { k: 'stack', a: a.toNumber(), b: b.toNumber(), c: c };
    if (kind === 'lead') return P(intro + 'How much does the leader produce?', A(q1), st, 'Substitute the follower’s best response into the leader’s profit before maximizing.', { unit: 'units', chk: Object.assign({ ask: 'q1' }, chk) });
    if (kind === 'follow') return P(intro + 'How much does the follower produce?', A(q2), st, 'Find the leader’s quantity first, then the follower’s best response to it.', { unit: 'units', chk: Object.assign({ ask: 'q2' }, chk) });
    if (kind === 'price') return P(intro + 'What is the market price?', A(P0), st.concat(['$P = ' + nx(a) + ' - ' + cq(b, '(' + nx(q1.add(q2)) + ')') + ' = ' + nx(P0) + '$.']), 'Add the two outputs, then use demand.', { unit: 'dollars', chk: Object.assign({ ask: 'P' }, chk) });
    if (kind === 'leadprof') return P(intro + 'What is the leader’s profit?', A(pi1), st.concat(['Price: $' + nx(P0) + '$. Leader’s profit: $(' + nx(P0) + ' - ' + c + ')(' + nx(q1) + ') = ' + nx(pi1) + '$.']), 'Find both outputs, the price, then profit.', { unit: 'dollars', chk: Object.assign({ ask: 'pi1' }, chk) });
    return P(intro + 'How much more profit does the leader earn than it would in the Cournot equilibrium (where both move at once)?', A(pi1.sub(pic)),
      st.concat(['Leader’s profit: $' + nx(pi1) + '$.', 'Cournot: each makes $q = \\dfrac{a - c}{3b} = ' + nx(qc) + '$, price $' + nx(Q(c).add(b.mul(qc))) + '$, profit $' + nx(pic) + '$.', 'Difference: $' + nx(pi1.sub(pic)) + '$. Moving first and committing to a big output pays.']),
      'Compute the leader’s Stackelberg profit and the Cournot profit.', { unit: 'dollars', chk: Object.assign({ ask: 'gain' }, chk) });
  });

  G('imicro.auctions', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['spay', 'dom', 'spay'], ['spay', 'surplus', 'fpbid', 'dom'], ['fpbid', 'revenue', 'surplus', 'fpbid']));
    if (kind === 'spay' || kind === 'surplus') {
      var nb = R.int(3, 5), bids = R.sample(U.range(10, 60), nb).map(function (x) { return x * 5; }), names = R.sample(NAMES, nb), sorted = bids.slice().sort(function (x, y) { return y - x; });
      var wi = bids.indexOf(sorted[0]), val = sorted[0] + R.int(1, 8) * 5;
      var list = names.map(function (n, i) { return n + ' ' + money(bids[i]); }).join(', ');
      if (kind === 'spay') return P('In a sealed-bid second-price auction the bids are: ' + list + '. Who wins, and what does the winner pay? Enter the price paid.', A(sorted[1]),
        ['The highest bid wins: ' + names[wi] + ' (' + money(sorted[0]) + ').', 'In a second-price auction the winner pays the second-highest bid: ' + money(sorted[1]) + '.'], 'The winner pays the runner-up’s bid.', { unit: 'dollars', chk: { k: 'auc2', bids: bids, ask: 'pay' } });
      return P('In a sealed-bid second-price auction the bids are: ' + list + '. The winner, ' + names[wi] + ', values the item at ' + money(val) + '. What is the winner’s surplus?', A(val - sorted[1]),
        ['The winner pays the second-highest bid, ' + money(sorted[1]) + '.', 'Surplus: $' + val + ' - ' + sorted[1] + ' = ' + (val - sorted[1]) + '$.', 'Her own bid only decided <i>whether</i> she won, not what she paid.'], 'Value minus the price actually paid.', { unit: 'dollars', chk: { k: 'auc2', bids: bids, v: val, ask: 'surplus' } });
    }
    if (kind === 'dom') { var v = R.int(10, 90) * 10, ans = 'Bid exactly ' + money(v) + ', your value';
      return P('You value a painting at ' + money(v) + '. It is sold in a sealed-bid second-price auction (highest bid wins, pays the second-highest bid). What bid is best for you no matter what others bid?', mc(ans, ['Bid a bit less than ' + money(v) + ', to keep some surplus', 'Bid a bit more than ' + money(v) + ', to raise your chance of winning', 'Bid half your value, since there are other bidders']),
        ['Your bid never sets your price; it only decides whether you win. You win exactly when your bid beats the highest other bid $B$, and then you pay $B$.', 'Bidding your value wins exactly when $B < ' + v + '$, the cases where winning is profitable.', 'Bidding less only loses some of those profitable wins; bidding more only adds wins at prices above ' + money(v) + '. Truthful bidding is a dominant strategy.'],
        'What does your bid change, and what doesn’t it change?', { chk: { k: 'const', text: ans } }); }
    var n = R.int(2, 6), V = R.pick([100, 200, 300, 500, 1000, 60, 120]);
    if (kind === 'fpbid') { var vv = R.int(1, 9) * V / 10; if (!Number.isInteger(vv * (n - 1) / n * 100)) vv = V / 2;
      return P('In a first-price sealed-bid auction with ' + n + ' bidders, each bidder’s value is independent and uniformly distributed between \\$0 and ' + money(V) + '. In the symmetric equilibrium each bids $b(v) = \\dfrac{n - 1}{n}v$. What does a bidder with value ' + money(vv) + ' bid?', A(Q.from(vv).mul(n - 1).div(n)),
        ['$b = \\dfrac{' + (n - 1) + '}{' + n + '}\\times ' + nx(vv) + ' = ' + nx(Q.from(vv).mul(n - 1).div(n)) + '$.', 'She shades her bid below her value: winning at her full value would leave no surplus. With more bidders the shading shrinks, because competition is tougher.'],
        'Multiply the value by (n − 1)/n.', { unit: 'dollars', chk: { k: 'auc1', n: n, V: V, v: vv } }); }
    var rev = Q(V).mul(n - 1).div(n + 1);
    return P('An item is sold to ' + n + ' bidders whose values are independent and uniform between \\$0 and ' + money(V) + '. In a second-price auction (bidding your value), what is the seller’s expected revenue?', A(rev),
      ['The price is the second-highest value. For $n$ independent uniform values on $[0, V]$, its expected value is $\\dfrac{n - 1}{n + 1}V$.', '$\\dfrac{' + (n - 1) + '}{' + (n + 1) + '}\\times ' + V + ' = ' + nx(rev) + '$.', 'A first-price auction with the equilibrium bids $\\frac{n - 1}{n}v$ earns the same on average: revenue equivalence.'],
      'Expected second-highest of n uniform values.', { unit: 'dollars', chk: { k: 'aucrev', n: n, V: V } });
  });

  // =================================================================== Unit 9: General Equilibrium and Welfare

  // Cobb-Douglas exchange: U_i = x^a_i y^(1 - a_i)
  function cdMRS(a, x, y) { return Q.from(a).mul(y).div(Q(1).sub(a).mul(x)); }
  G('imicro.edgeworth-box', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['mrsA', 'eff', 'tf'], ['mrsA', 'eff', 'contract', 'tf'], ['contract', 'eff', 'contract2', 'mrsB']));
    var names = [person(R)]; names.push(person(R, names[0]));
    if (kind === 'tf') { var tfs = [['An allocation that gives one person everything is Pareto efficient.', true, 'No change can help the person with nothing without taking something from the person who has everything, so no Pareto improvement exists. Efficient does not mean fair.'], ['Every Pareto-efficient allocation is fair.', false, 'Pareto efficiency only rules out waste: no one can gain without someone losing. The corners of the box, where one person has everything, are efficient.'], ['At an interior Pareto-efficient allocation, the two people\u2019s marginal rates of substitution are equal.', true, 'If they differed, a small trade at a rate between the two MRSs would make both better off.'], ['If an allocation is not Pareto efficient, there is some trade that makes both people better off (or one better off and neither worse off).', true, 'That is the definition: a Pareto improvement exists.']]; var f = R.pick(tfs);
      return P('True or false? ' + f[0], { t: 'tf', v: f[1] }, [f[2], f[1] ? 'True.' : 'False.'], 'Pareto efficiency is about waste, not fairness.', { chk: { k: 'tf', v: f[1], s: f[0] } }); }
    var aA = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4)]), aB = kind === 'contract' ? aA : R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4)]);
    var X = R.int(2, 10) * 10, Y = R.int(2, 10) * 10;
    var uTex = function (a) { return 'x^{' + expTex(a) + '}y^{' + expTex(Q(1).sub(a)) + '}'; };
    var intro = 'In an exchange economy there are ' + X + ' units of $x$ and ' + Y + ' units of $y$. ' + names[0] + '\u2019s utility is $U_A = ' + uTex(aA) + '$ and ' + names[1] + '\u2019s is $U_B = ' + uTex(aB) + '$. ';
    if (kind === 'mrsA' || kind === 'mrsB') {
      var xA = R.int(1, X / 10 - 1) * 10, yA = R.int(1, Y / 10 - 1) * 10, who = kind === 'mrsA' ? 0 : 1, xx = who ? X - xA : xA, yy = who ? Y - yA : yA, a0 = who ? aB : aA, m = cdMRS(a0, xx, yy);
      return P(intro + names[0] + ' has (' + xA + ', ' + yA + ') and ' + names[1] + ' has the rest. What is ' + names[who] + '\u2019s MRS (units of $y$ per unit of $x$)?', A(m),
        [names[who] + ' has $(' + xx + ', ' + yy + ')$.', 'For $x^a y^{1-a}$, $MRS = \\dfrac{a}{1 - a}\\cdot\\dfrac{y}{x} = \\dfrac{' + a0.toTex() + '}{' + Q(1).sub(a0).toTex() + '}\\cdot\\dfrac{' + yy + '}{' + xx + '} = ' + nx(m) + '$.'],
        'Use that person\u2019s own bundle (the rest of the box for B).', { chk: { k: 'emrs', a: a0.toNumber(), x: xx, y: yy } });
    }
    if (kind === 'eff') {
      var xA2, yA2, mA, mB, tries = 0;
      var wantEff = R.coin();
      do { xA2 = R.int(1, X / 5 - 1) * 5; yA2 = wantEff ? null : R.int(1, Y / 5 - 1) * 5;
        if (wantEff) { var yq = Q.from(contractYq(aA, aB, X, Y, xA2)); if (!yq || decPlaces(yq) > 2) { tries++; continue; } yA2 = yq.toNumber(); }
        mA = cdMRS(aA, xA2, yA2); mB = cdMRS(aB, X - xA2, Y - yA2); tries++; } while (tries < 200 && (yA2 === null || yA2 <= 0 || yA2 >= Y || (!wantEff && mA.eq(mB))));
      if (yA2 === null || yA2 <= 0 || yA2 >= Y) { aB = aA; xA2 = X / 2; yA2 = Y / 2; mA = cdMRS(aA, xA2, yA2); mB = cdMRS(aB, X - xA2, Y - yA2); }
      var effic = mA.eq(mB), ans = effic ? 'Yes: the MRSs are equal, so no trade can help one without hurting the other' : 'No: the MRSs differ, so a trade between them can make both better off';
      return P(intro + names[0] + ' has (' + xA2 + ', ' + nx(yA2) + ') and ' + names[1] + ' has the rest. Is this allocation Pareto efficient?', mc(ans, [effic ? 'No: the MRSs differ, so a trade between them can make both better off' : 'Yes: the MRSs are equal, so no trade can help one without hurting the other', 'Yes, because every unit of both goods is owned by someone', 'No, because the two people have different amounts']),
        [names[0] + '\u2019s MRS: $' + nx(mA) + '$. ' + names[1] + ' has $(' + (X - xA2) + ', ' + nx(Y - yA2) + ')$, MRS $' + nx(mB) + '$.', effic ? 'Equal: their indifference curves are tangent, so this point is on the contract curve.' : 'Different: ' + (mA.gt(mB) ? names[0] : names[1]) + ' values $x$ more (in $y$), so trading $x$ to that person for $y$ at a rate between the two MRSs helps both.'],
        'Compare the two marginal rates of substitution.', { chk: { k: 'eeff', aA: aA.toNumber(), aB: aB.toNumber(), X: X, Y: Y, xA: xA2, yA: yA2, ans: ans } });
    }
    // contract curve
    var xA3, yA3, t3 = 0;
    do { xA3 = R.int(1, X / 5 - 1) * 5; yA3 = contractYq(aA, aB, X, Y, xA3); t3++; } while (t3 < 200 && (!yA3 || decPlaces(yA3) > 2));
    if (!yA3 || decPlaces(yA3) > 2) { aB = aA; yA3 = Q(Y * xA3, X); }
    var same = aA.eq(aB), kA = aA.div(Q(1).sub(aA)), kB = aB.div(Q(1).sub(aB));
    return P(intro + 'If ' + names[0] + ' has ' + xA3 + ' units of $x$ at a Pareto-efficient allocation, how much $y$ does ' + names[0] + ' have?', A(yA3),
      ['On the contract curve the MRSs are equal: $' + nx(kA) + '\\cdot\\dfrac{y_A}{x_A} = ' + nx(kB) + '\\cdot\\dfrac{' + Y + ' - y_A}{' + X + ' - x_A}$.', 'With $x_A = ' + xA3 + '$: $' + nx(kA) + '\\cdot\\dfrac{y_A}{' + xA3 + '} = ' + nx(kB) + '\\cdot\\dfrac{' + Y + ' - y_A}{' + (X - xA3) + '}$.', 'Solving: $y_A = ' + nx(yA3) + '$.' + (same ? ' With identical preferences the contract curve is the diagonal: $y_A/x_A = Y/X$.' : '')],
      'Set the two MRSs equal, using B\u2019s bundle as the rest of the box.', { chk: { k: 'contract', aA: aA.toNumber(), aB: aB.toNumber(), X: X, Y: Y, x: xA3 } });
  });
  // exact contract-curve y for Cobb-Douglas people (Q or null)
  function contractYq(aA, aB, X, Y, x) { var kA = aA.div(Q(1).sub(aA)), kB = aB.div(Q(1).sub(aB)); return kB.mul(x).mul(Y).div(kA.mul(X - x).add(kB.mul(x))); }

  G('imicro.exchange-equilibrium', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['price', 'xA', 'price'], ['price', 'xA', 'yB', 'income'], ['price', 'xA', 'yB', 'income']));
    var names = [person(R)]; names.push(person(R, names[0]));
    var aA, aB, eA, eB, p, tries = 0;
    var ok = false;
    do {
      aA = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4)]); aB = ctx.level === 1 ? aA : R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4), Q(3, 4)]);
      eA = [R.int(0, 10) * 5, R.int(0, 10) * 5]; eB = [R.int(0, 10) * 5, R.int(0, 10) * 5]; tries++;
      if (eA[0] + eB[0] === 0 || eA[1] + eB[1] === 0 || eA[0] + eA[1] === 0 || eB[0] + eB[1] === 0) continue;
      p = aA.mul(eA[1]).add(aB.mul(eB[1])).div(Q(1).sub(aA).mul(eA[0]).add(Q(1).sub(aB).mul(eB[0])));
      ok = p.sign() > 0 && decPlaces(p) <= 2 && decPlaces(aA.mul(p.mul(eA[0]).add(eA[1])).div(p)) <= 2;
    } while (tries < 400 && !ok);
    if (!ok) { aA = Q(1, 2); aB = Q(1, 2); eA = [20, 10]; eB = [10, 20]; p = Q(1); }
    var mA = p.mul(eA[0]).add(eA[1]), mB = p.mul(eB[0]).add(eB[1]), xA = aA.mul(mA).div(p), yB = Q(1).sub(aB).mul(mB);
    var uTex = function (a) { return 'x^{' + expTex(a) + '}y^{' + expTex(Q(1).sub(a)) + '}'; };
    var intro = names[0] + ' ($U_A = ' + uTex(aA) + '$) starts with ' + eA[0] + ' units of $x$ and ' + eA[1] + ' of $y$; ' + names[1] + ' ($U_B = ' + uTex(aB) + '$) starts with ' + eB[0] + ' of $x$ and ' + eB[1] + ' of $y$. Use $y$ as money ($p_y = 1$) and let $p$ be the price of $x$. ';
    var st = ['Each person\u2019s income is the value of what they start with: $m_A = ' + T.lin(eA[0], 'p', eA[1]) + '$ and $m_B = ' + T.lin(eB[0], 'p', eB[1]) + '$.', 'Cobb-Douglas demands for $x$: $x_A = ' + aA.toTex() + '\\,m_A/p$ and $x_B = ' + aB.toTex() + '\\,m_B/p$.', 'Market for $x$ clears: $x_A + x_B = ' + (eA[0] + eB[0]) + '$. Multiply by $p$: $' + aA.toTex() + '(' + T.lin(eA[0], 'p', eA[1]) + ') + ' + aB.toTex() + '(' + T.lin(eB[0], 'p', eB[1]) + ') = ' + (eA[0] + eB[0]) + 'p$, so $p = ' + nx(p) + '$.'];
    var chk = { k: 'xeq', aA: aA.toNumber(), aB: aB.toNumber(), eA: eA, eB: eB };
    if (kind === 'price') return P(intro + 'What is the competitive equilibrium price of $x$?', A(p), st.concat(['(The market for $y$ then clears too, by Walras\u2019s law.)']), 'Income depends on p: write each demand with income = value of the endowment, then clear the x market.', { chk: Object.assign({ ask: 'p' }, chk) });
    if (kind === 'income') return P(intro + 'At the competitive equilibrium price, what is ' + names[0] + '\u2019s income, measured in units of $y$?', A(mA), st.concat(['$m_A = ' + eA[0] + '(' + nx(p) + ')' + (eA[1] ? ' + ' + eA[1] : '') + ' = ' + nx(mA) + '$.']), 'Find p first; income is the value of the endowment at p.', { chk: Object.assign({ ask: 'mA' }, chk) });
    if (kind === 'xA') return P(intro + 'How much $x$ does ' + names[0] + ' consume in the competitive equilibrium?', A(xA), st.concat(['$m_A = ' + nx(mA) + '$, so $x_A = ' + aA.toTex() + '\\cdot\\dfrac{' + nx(mA) + '}{' + nx(p) + '} = ' + nx(xA) + '$.']), 'Find p, then A\u2019s income and demand.', { chk: Object.assign({ ask: 'xA' }, chk) });
    return P(intro + 'How much $y$ does ' + names[1] + ' consume in the competitive equilibrium?', A(yB), st.concat(['$m_B = ' + nx(mB) + '$, so $y_B = ' + Q(1).sub(aB).toTex() + '\\cdot ' + nx(mB) + ' = ' + nx(yB) + '$.']), 'Find p, then B\u2019s income and the Cobb-Douglas share for y.', { chk: Object.assign({ ask: 'yB' }, chk) });
  });

  G('imicro.welfare-theorems', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['concept', 'tf', 'concept'], ['concept', 'transfer', 'tf'], ['transfer', 'concept', 'transfer']));
    if (kind === 'concept') {
      var qs = [['What does the first welfare theorem say?', 'With complete competitive markets, no externalities and full information, every competitive equilibrium is Pareto efficient', ['Every competitive equilibrium is fair', 'Every Pareto-efficient allocation is a competitive equilibrium of the existing endowments', 'Markets always reach equilibrium quickly']],
        ['What does the second welfare theorem say?', 'With convex preferences, any Pareto-efficient allocation can be reached as a competitive equilibrium after suitable lump-sum transfers', ['Taxes on prices are the best way to redistribute', 'Every competitive equilibrium is the fairest efficient allocation', 'Efficiency requires equal endowments']],
        ['Which situation breaks the conditions of the first welfare theorem?', 'A factory\u2019s smoke harms neighbors who are not part of any market', ['Many buyers and sellers, each too small to affect prices', 'Consumers with different tastes', 'An allocation where one person is much richer than another']],
        ['Which situation breaks the conditions of the first welfare theorem?', 'One seller controls the whole market and sets its price', ['Many buyers and sellers, each too small to affect prices', 'Consumers with different tastes', 'Buyers and sellers who know the quality of what they trade']],
        ['Which situation breaks the conditions of the first welfare theorem?', 'Sellers of used cars know their quality, but buyers cannot tell', ['Many buyers and sellers, each too small to affect prices', 'An allocation where one person is much richer than another', 'Consumers with different tastes']],
        ['What does it mean for an allocation to be Pareto efficient?', 'No one can be made better off without making someone else worse off', ['Everyone has the same amount', 'Total income is as large as possible', 'Every market has the same price']],
        ['Which is a lump-sum transfer, as the second welfare theorem uses the term?', 'A one-time payment whose size does not depend on anything the person chooses', ['A tax on each unit of a good bought', 'A tax that rises with the hours a person works', 'A subsidy on each unit of a good sold']]];
      var qq = R.pick(qs);
      return P(qq[0], mc(qq[1], qq[2]), ['The first theorem: competitive equilibrium (with its conditions: price-taking, complete markets, no externalities, full information) is Pareto efficient. It says nothing about fairness.', 'The second theorem: with convex preferences (and those conditions), any efficient allocation can be supported by prices after lump-sum transfers of wealth, which separates efficiency from distribution.', 'Answer: ' + qq[1] + '.'], 'Separate efficiency from fairness, and remember the conditions.', { chk: { k: 'const', text: qq[1] } });
    }
    if (kind === 'tf') { var tfs = [['The first welfare theorem shows that competitive markets produce fair outcomes.', false, 'It shows only that they produce Pareto-efficient outcomes, under its conditions. An efficient outcome can be very unequal.'], ['The second welfare theorem suggests separating efficiency from distribution: redistribute wealth with lump-sum transfers, then let markets work.', true, 'That is its message. Real taxes are rarely lump-sum, which is why redistribution usually has some efficiency cost.'], ['The first welfare theorem holds even when there are large externalities.', false, 'Externalities are one of the conditions it needs: when actions affect others outside markets, equilibrium need not be efficient.'],
      ['A Pareto-efficient allocation can be very unequal.', true, 'Giving everything to one person is Pareto efficient: no one can gain without that person losing.'],
      ['Under the first welfare theorem\u2019s conditions, a competitive equilibrium leaves no trade that would make someone better off and no one worse off.', true, 'That is what Pareto efficiency means, and the theorem says competitive equilibrium has it.'],
      ['The first welfare theorem needs buyers and sellers to be price-takers.', true, 'Price-taking is one of its conditions; a firm with market power can hold output below the efficient level.'],
      ['A tax on each unit of a good is a lump-sum transfer.', false, 'Its size depends on how much a person buys, so it changes choices; a lump-sum transfer does not.'],
      ['If two people could both gain from a trade they have not made, their allocation is not Pareto efficient.', true, 'A trade that helps both, or helps one and hurts no one, means the allocation can still be improved.']]; var f = R.pick(tfs);
      return P('True or false? ' + f[0], { t: 'tf', v: f[1] }, [f[2], f[1] ? 'True.' : 'False.'], 'Efficiency is not fairness; check the conditions.', { chk: { k: 'tf', v: f[1], s: f[0] } }); }
    // identical Cobb-Douglas a: p = a Y/((1-a) X); target on the diagonal
    var a = R.pick([Q(1, 2), Q(1, 3), Q(2, 3), Q(1, 4)]), p = R.pick([Q(1, 2), Q(1), Q(2), Q(3, 2), Q(3)]), X = R.int(4, 12) * 10, Y = p.mul(Q(1).sub(a)).div(a).mul(X);
    while (!Y.isInt()) { X = X * 2; Y = p.mul(Q(1).sub(a)).div(a).mul(X); }
    Y = Y.toNumber();
    var eAx = R.int(0, M.floor(X / 10)) * 10, eAy = R.int(0, M.floor(Y / 10)) * 10, share = R.pick([Q(1, 4), Q(1, 2), Q(3, 4), Q(2, 5), Q(3, 5)]), tx = share.mul(X), ty = share.mul(Y);
    var Wstar = p.mul(tx).add(ty), W0 = p.mul(eAx).add(eAy), T = Wstar.sub(W0);
    var names = [person(R)]; names.push(person(R, names[0]));
    return P(names[0] + ' and ' + names[1] + ' both have $U = x^{' + expTex(a) + '}y^{' + expTex(Q(1).sub(a)) + '}$. There are ' + X + ' units of $x$ and ' + Y + ' of $y$; ' + names[0] + ' starts with (' + eAx + ', ' + eAy + '). A planner wants the efficient allocation that gives ' + names[0] + ' $(' + nx(tx) + ', ' + nx(ty) + ')$. Using $y$ as money, what lump-sum transfer to ' + names[0] + ' (negative means taking from ' + names[0] + ') makes that allocation the competitive equilibrium?', A(T),
      ['With identical Cobb-Douglas preferences the contract curve is the diagonal, and the equilibrium price of $x$ is $p = \\dfrac{a}{1 - a}\\cdot\\dfrac{Y}{X} = ' + nx(p) + '$ whatever the endowments.', 'To choose $(' + nx(tx) + ', ' + nx(ty) + ')$ at that price, ' + names[0] + ' needs wealth $' + nx(p) + '(' + nx(tx) + ') + ' + nx(ty) + ' = ' + nx(Wstar) + '$ (for Cobb-Douglas, spending on $x$ is the share $' + a.toTex() + '$ of wealth, and $' + nx(p.mul(tx)) + '$ is exactly that share of $' + nx(Wstar) + '$).', 'The endowment is worth $' + nx(p) + '(' + eAx + ')' + (eAy ? ' + ' + eAy : '') + ' = ' + nx(W0) + '$.', 'Transfer: $' + nx(Wstar) + ' - ' + nx(W0) + ' = ' + nx(T) + '$ units of $y$. The second welfare theorem in action: move wealth, then let the market do the rest.'],
      'Find the equilibrium price, then the wealth A needs to buy the target bundle.', { chk: { k: 'transfer', a: a.toNumber(), X: X, Y: Y, eA: [eAx, eAy], tx: tx.toNumber() } });
  });

  // =================================================================== Unit 10: Externalities and Information

  G('imicro.externality-optimum', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['qm', 'qstar', 'tax'], ['qstar', 'tax', 'dwl', 'which'], ['tax', 'dwl', 'qstar', 'which']));
    var good = R.pick(['electricity from a coal plant', 'pesticide spraying', 'late-night concerts', 'truck deliveries through a town', 'cement']);
    var b = R.pick([1, 2, Q(1, 2)]), bq = Q.from(b), d = R.pick([1, 2, Q(1, 2)]), dq = Q.from(d), f = ctx.level === 1 ? Q(0) : R.pick([Q(0), Q(1, 2), Q(1)]);
    var Qs = R.int(4, 20) * 2, e = R.int(2, 12), c = R.int(2, 20);
    var a = bq.add(dq).add(f).mul(Qs).add(c).add(e), Qm = a.sub(c).div(bq.add(dq)), tax = f.mul(Qs).add(e);
    var MSCt = c + ' + ' + cq(dq, 'Q') + ' + ' + e + (f.isZero() ? '' : ' + ' + cq(f, 'Q'));
    var mecT = f.isZero() ? String(e) : e + ' + ' + cq(f, 'Q');
    var intro = 'In the market for ' + good + ', demand (marginal benefit) is $P = ' + nx(a) + ' - ' + cq(bq, 'Q') + '$ and supply (marginal private cost) is $P = ' + c + ' + ' + cq(dq, 'Q') + '$. Each unit also causes marginal external damage $MEC = ' + mecT + '$ to people outside the market. ';
    var stM = ['Market: $' + nx(a) + ' - ' + cq(bq, 'Q') + ' = ' + c + ' + ' + cq(dq, 'Q') + '$ gives $Q_m = ' + nx(Qm) + '$.'];
    var stS = ['Efficient: marginal benefit = marginal social cost $' + MSCt + '$: $Q^* = ' + nx(Qs) + '$.'];
    var dwlExact;
    // DWL = integral from Q* to Qm of (MSC - MB) dQ, linear integrand: average of endpoints times width
    var gap = function (q) { return Q(c).add(dq.mul(q)).add(e).add(f.mul(q)).sub(a.sub(bq.mul(q))); };
    dwlExact = gap(Qs).add(gap(Qm)).div(2).mul(Qm.sub(Qs));
    var chk = { k: 'ext', a: a.toNumber(), b: bq.toNumber(), c: c, d: dq.toNumber(), e: e, f: f.toNumber() };
    if (kind === 'qm') return P(intro + 'How much does the unregulated market produce?', A(Qm), stM.concat(['The market ignores the external damage, so it produces where private benefit equals private cost.']), 'Buyers and sellers look only at their own benefit and cost.', { unit: 'units', chk: Object.assign({ ask: 'qm' }, chk) });
    if (kind === 'qstar') return P(intro + 'What is the efficient quantity?', A(Qs), stS.concat(['Less than the market\u2019s $' + nx(Qm) + '$: the market overproduces.']), 'Add the external damage to the private cost, then set it equal to marginal benefit.', { unit: 'units', chk: Object.assign({ ask: 'qs' }, chk) });
    if (kind === 'tax') return P(intro + 'What per-unit tax on producers makes the market choose the efficient quantity?', A(tax), stS.concat(['The tax must equal the marginal external damage <i>at the efficient quantity</i>: $MEC(' + nx(Qs) + ') = ' + nx(tax) + '$.', 'With that tax, private cost becomes $' + c + ' + ' + cq(dq, 'Q') + ' + ' + nx(tax) + '$, which crosses demand at $Q^* = ' + nx(Qs) + '$.']), 'Evaluate MEC at Q*, not at the market quantity.', { unit: 'dollars', chk: Object.assign({ ask: 'tax' }, chk) });
    if (kind === 'which') { var wrongTax = f.mul(Qm).add(e), ans = 'Its marginal damage at the efficient quantity, ' + money(tax.toNumber());
      return P(intro + 'A per-unit tax equal to which amount gets the market to the efficient quantity?', mc(ans, f.isZero() || wrongTax.eq(tax) ? ['The full damage of all units produced', 'The market price of the good', 'Zero: the market already accounts for the damage'] : ['Its marginal damage at the market quantity, ' + money(wrongTax.toNumber()), 'The full damage of all units produced', 'The market price of the good']),
        stM.concat(stS).concat(['The corrective tax equals marginal damage where the market should end up, $MEC(Q^*) = ' + nx(tax) + '$.' + (wrongTax.eq(tax) ? '' : ' Using $MEC(Q_m) = ' + nx(wrongTax) + '$ would overshoot and cut output below $Q^*$.')]),
        'Where should the market end up?', { chk: Object.assign({ ask: 'which', text: ans }, chk) }); }
    return P(intro + 'What is the deadweight loss of the unregulated market?', A(dwlExact), stM.concat(stS).concat(['Each unit from $Q^*$ to $Q_m$ costs society more than it is worth: the gap $MSC - MB$ is 0 at $Q^*$ and $' + nx(gap(Qm)) + '$ at $Q_m$.', '$DWL = \\int_{' + nx(Qs) + '}^{' + nx(Qm) + '}(MSC - MB)\\,dQ = \\tfrac{1}{2}(' + nx(Qm.sub(Qs)) + ')(' + nx(gap(Qm)) + ') = ' + nx(dwlExact) + '$.']), 'Integrate MSC − MB over the units the market should not produce.', { unit: 'dollars', chk: Object.assign({ ask: 'dwl' }, chk) });
  });

  G('imicro.coase-theorem', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['qstar', 'qstar', 'same'], ['qstar', 'minpay', 'maxpay', 'same'], ['minpay', 'maxpay', 'factpay', 'same']));
    var who = R.pick([['the factory', 'the laundry next door', 'smoke', false], ['the rancher', 'the neighboring farmer', 'grazing cattle', false], ['the bar', 'its neighbors', 'late-night music', true], ['the airport', 'nearby homeowners', 'night flights', true]]);
    var has = who[3] ? 'have' : 'has';
    var b = R.pick([1, 2]), d = R.pick([1, 2, 3]), Qs = R.int(2, 8) * b, a = (b + d) * Qs, Qmax = a / b;
    var intro = 'The marginal benefit of ' + who[2] + ' to ' + who[0] + ' is $MB = ' + a + ' - ' + T.mono(b, 'Q') + '$ (dollars per unit), and the marginal damage to ' + who[1] + ' is $MD = ' + T.mono(d, 'Q') + '$. Bargaining is costless. ';
    var stE = ['The efficient amount maximizes total benefit minus total damage: $' + a + ' - ' + T.mono(b, 'Q') + ' = ' + T.mono(d, 'Q') + '$, so $Q^* = ' + Qs + '$.'];
    var chk = { k: 'coase', a: a, b: b, d: d };
    if (kind === 'qstar') return P(intro + 'If ' + who[0] + ' has the legal right to as much as it wants, what amount do the parties end up with after bargaining?', A(Qs), stE.concat(['With the right, ' + who[0] + ' would choose $Q = ' + Qmax + '$ (where $MB = 0$). But beyond $Q^* = ' + Qs + '$ each unit does more damage than it is worth to ' + who[0] + ', so ' + who[1] + ' can pay ' + who[0] + ' to cut back to $' + Qs + '$ and both gain.']), 'Where does marginal benefit equal marginal damage?', { unit: 'units', chk: Object.assign({ ask: 'q' }, chk) });
    if (kind === 'same') { var ans = 'The same amount, ' + Qs + ' units; only who pays whom changes';
      return P(intro + 'Compare two legal rules: ' + who[0] + ' has the right to ' + who[2] + ', or ' + who[1] + ' ' + has + ' the right to be free of it. With costless bargaining, how much results under each rule?', mc(ans, [Qmax + ' units when ' + who[0] + ' has the right, and 0 when ' + who[1] + ' do', '0 units under both rules', Qmax + ' units under both rules']),
        stE.concat(['Either way, any amount other than ' + Qs + ' leaves gains from a deal on the table, so bargaining reaches ' + Qs + '. The legal rule decides who pays whom.']), 'Who has the right changes the payments, not the efficient amount (with no income effects).', { chk: Object.assign({ ask: 'same', text: ans }, chk) }); }
    var lostB = Q(a).mul(Qmax - Qs).sub(Q(b, 2).mul(Qmax * Qmax - Qs * Qs)), avoidD = Q(d, 2).mul(Qmax * Qmax - Qs * Qs);
    if (kind === 'minpay') return P(intro + who[0].charAt(0).toUpperCase() + who[0].slice(1) + ' has the right. What is the least that ' + who[1] + ' must pay to get it to cut back from ' + Qmax + ' to the efficient ' + Qs + ' units?', A(lostB),
      stE.concat([who[0].charAt(0).toUpperCase() + who[0].slice(1) + ' gives up the benefit of the units from ' + Qs + ' to ' + Qmax + ': $\\int_{' + Qs + '}^{' + Qmax + '}(' + a + ' - ' + T.mono(b, 'Q') + ')\\,dQ = ' + nx(lostB) + '$.', 'It will accept any payment at least that large.']),
      'The least it accepts is the benefit it gives up.', { unit: 'dollars', chk: Object.assign({ ask: 'min' }, chk) });
    if (kind === 'maxpay') return P(intro + who[0].charAt(0).toUpperCase() + who[0].slice(1) + ' has the right. What is the most that ' + who[1] + ' would pay to get it to cut back from ' + Qmax + ' to ' + Qs + ' units?', A(avoidD),
      stE.concat(['The cutback spares ' + who[1] + ' the damage from units ' + Qs + ' to ' + Qmax + ': $\\int_{' + Qs + '}^{' + Qmax + '}' + T.mono(d, 'Q') + '\\,dQ = ' + nx(avoidD) + '$.', 'Any payment between the least ' + who[0] + ' accepts and this amount makes both better off.']),
      'The most they pay is the damage they avoid.', { unit: 'dollars', chk: Object.assign({ ask: 'max' }, chk) });
    var dmg = Q(d, 2).mul(Qs * Qs);
    return P(intro + who[1].charAt(0).toUpperCase() + who[1].slice(1) + ' ' + has + ' the right to no ' + who[2] + ' at all. What is the least ' + who[0] + ' must pay them to allow the efficient ' + Qs + ' units?', A(dmg),
      stE.concat(['Allowing ' + Qs + ' units does damage to ' + who[1] + ' of $\\int_0^{' + Qs + '}' + T.mono(d, 'Q') + '\\,dQ = ' + nx(dmg) + '$, so they need at least that.', 'It is worth it to ' + who[0] + ': its benefit from those units is $' + nx(Q(a * Qs).sub(Q(b * Qs * Qs, 2))) + '$.']),
      'The least they accept is the damage they suffer.', { unit: 'dollars', chk: Object.assign({ ask: 'fact' }, chk) });
  });

  G('imicro.public-goods-samuelson', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['eff', 'eff', 'priv'], ['eff', 'priv', 'lindahl', 'eff3'], ['eff3', 'lindahl', 'priv', 'eff3']));
    var thing = R.pick(['a streetlight program (hours of lighting)', 'a neighborhood park (acres)', 'fireworks (minutes)', 'a shared garden (square meters)']);
    var n = kind === 'eff3' ? 3 : 2, G0, bs, as, c, tries = 0;
    do { bs = []; as = []; G0 = R.int(2, 12); c = R.int(5, 30); var tot = 0; for (var i = 0; i < n; i++) { bs.push(R.int(1, 4)); } var sb = bs.reduce(function (s, x) { return s + x; }, 0); var need = c + sb * G0; for (var j = 0; j < n - 1; j++) { as.push(bs[j] * G0 + R.int(1, 12)); tot += as[j]; } as.push(need - tot); tries++; } while (tries < 200 && !(as[n - 1] > bs[n - 1] * G0));
    var names = [person(R)]; for (var k2 = 1; k2 < n; k2++) names.push(person(R, names[k2 - 1]));
    var desc = names.map(function (nm, i) { return nm + ': $MB_' + (i + 1) + ' = ' + as[i] + ' - ' + T.mono(bs[i], 'G') + '$'; }).join('; ');
    var intro = 'People value ' + thing + ' $G$. Marginal benefits: ' + desc + ' (each zero once it would turn negative). Each unit costs ' + money(c) + ' to provide. ';
    var sumA = as.reduce(function (s, x) { return s + x; }, 0), sumB = bs.reduce(function (s, x) { return s + x; }, 0);
    var st = ['Everyone enjoys the same units, so add willingness to pay <b>vertically</b>: $\\sum MB = ' + sumA + ' - ' + T.mono(sumB, 'G') + '$ (while each MB is positive).', 'Efficient: $\\sum MB = MC$: $' + sumA + ' - ' + T.mono(sumB, 'G') + ' = ' + c + '$, so $G^* = ' + G0 + '$.', 'Check: at $G = ' + G0 + '$ every MB is positive (' + as.map(function (x, i) { return x - bs[i] * G0; }).join(', ') + '), so no one\u2019s curve has dropped to zero.'];
    var chk = { k: 'pubg', as: as, bs: bs, c: c };
    if (kind === 'eff' || kind === 'eff3') return P(intro + 'What is the efficient amount of $G$?', A(G0), st, 'Sum the marginal benefits (a vertical sum) and set the sum equal to MC.', { unit: 'units', chk: Object.assign({ ask: 'eff' }, chk) });
    if (kind === 'lindahl') { var who = R.int(0, n - 1), lp = as[who] - bs[who] * G0;
      return P(intro + 'At the efficient amount, how much is ' + names[who] + '\u2019s marginal benefit (the per-unit share ' + names[who] + ' would pay under a Lindahl scheme)?', A(lp), st.concat([names[who] + '\u2019s MB at $G^* = ' + G0 + '$: $' + as[who] + ' - ' + bs[who] + '(' + G0 + ') = ' + lp + '$. The shares add up to the cost: ' + as.map(function (x, i) { return x - bs[i] * G0; }).join(' + ') + ' = ' + c + '.']),
        'Find G* first, then evaluate that person\u2019s MB there.', { unit: 'dollars', chk: Object.assign({ ask: 'share', who: who }, chk) }); }
    var stand = as.map(function (x, i) { return M.max(0, (x - c) / bs[i]); }), Gp = M.max.apply(null, stand);
    return P(intro + 'If each person decides alone how much to contribute (taking the others\u2019 contributions as given), about how much $G$ gets provided?', A(Gp, { rtol: 0.01 }),
      ['Acting alone, a person adds units while her <i>own</i> marginal benefit exceeds the cost: ' + names.map(function (nm, i) { return nm + ' would stop at ' + nx(rat(stand[i]) || stand[i]); }).join(', ') + '.', 'The person with the highest stopping point provides up to it; the others ride free, because at that amount their own MB is below the cost.', 'Provided: ' + nx(rat(Gp) || Gp) + ' units, less than the efficient ' + G0 + '. Free riding leads to underprovision.'],
      'Compare each person\u2019s own MB with the cost.', { unit: 'units', chk: Object.assign({ ask: 'priv' }, chk) });
  });

  G('imicro.common-resources', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['open', 'eff', 'open'], ['open', 'eff', 'rent', 'fee'], ['fee', 'rent', 'eff', 'open']));
    var b = R.pick([1, 2, 5, Q(1, 2)]), bq = Q.from(b), c = R.int(2, 10) * 10, Ns = R.int(4, 30), a = bq.mul(2 * Ns).add(c), No = Q(2 * Ns), rent = bq.mul(Ns * Ns), fee = bq.mul(Ns);
    var intro = 'A lake\u2019s total catch is $Y(N) = ' + nx(a) + 'N - ' + cq(bq, 'N^2') + '$ (dollars of fish a season) when $N$ boats fish it. Each boat costs ' + money(c) + ' a season to run, and anyone can fish. ';
    var st = ['Average catch per boat: $AP = ' + nx(a) + ' - ' + cq(bq, 'N') + '$. Marginal catch: $MP = Y\'(N) = ' + nx(a) + ' - ' + cq(bq.mul(2), 'N') + '$.'];
    var chk = { k: 'commons', a: a.toNumber(), b: bq.toNumber(), c: c };
    if (kind === 'open') return P(intro + 'With open access, how many boats fish the lake?', A(No), st.concat(['A boat joins while its own catch, the average $AP$, covers its cost: $' + nx(a) + ' - ' + cq(bq, 'N') + ' = ' + c + '$, so $N = ' + nx(No) + '$.', 'At that point profits are zero: the lake\u2019s value is used up by too many boats.']), 'Entry continues until average catch equals cost.', { unit: 'boats', chk: Object.assign({ ask: 'open' }, chk) });
    if (kind === 'eff') return P(intro + 'What number of boats maximizes the total value of the catch minus boat costs?', A(Ns), st.concat(['Maximize $Y(N) - ' + c + 'N$: $MP = ' + c + '$, so $' + nx(a) + ' - ' + cq(bq.mul(2), 'N') + ' = ' + c + '$ and $N^* = ' + Ns + '$.', 'Half the open-access number: each new boat lowers every other boat\u2019s catch, a cost open access ignores.']), 'Set the marginal (not average) catch equal to the cost.', { unit: 'boats', chk: Object.assign({ ask: 'eff' }, chk) });
    if (kind === 'rent') return P(intro + 'What is the most the lake\u2019s fishery can earn a season, total catch minus boat costs?', A(rent), st.concat(['At $N^* = ' + Ns + '$: $Y = ' + nx(a.mul(Ns).sub(bq.mul(Ns * Ns))) + '$, costs $' + (c * Ns) + '$.', 'Rent: $' + nx(rent) + '$. Under open access it is driven to zero.']), 'Find N*, then catch minus cost.', { unit: 'dollars', chk: Object.assign({ ask: 'rent' }, chk) });
    return P(intro + 'A license fee per boat could limit entry to the efficient number. How large must the fee be?', A(fee), st.concat(['Efficient: $MP = ' + c + '$ gives $N^* = ' + Ns + '$.', 'With a fee $F$, boats enter until $AP = ' + c + ' + F$. At $N^* = ' + Ns + '$: $AP = ' + nx(a.sub(bq.mul(Ns))) + '$, so $F = ' + nx(a.sub(bq.mul(Ns))) + ' - ' + c + ' = ' + nx(fee) + '$.', 'The fee charges each boat for the catch it takes from the others.']), 'The fee must close the gap between AP and cost at N*.', { unit: 'dollars', chk: Object.assign({ ask: 'fee' }, chk) });
  });

  G('imicro.adverse-selection', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['wtp', 'works', 'wtp'], ['wtp', 'works', 'thresh', 'which'], ['thresh', 'works', 'which', 'thresh']));
    if (kind === 'which') { var cases = [['A health insurer finds that people who buy its most generous plan are much sicker on average than people who don\u2019t, because people know their own health better than the insurer does.', 'Adverse selection: hidden information before the deal'], ['After buying full theft insurance, a shop owner stops locking the back door.', 'Moral hazard: hidden action after the deal'], ['A seller knows her used laptop overheats; buyers can\u2019t tell, so they offer only an average price, and owners of good laptops keep theirs.', 'Adverse selection: hidden information before the deal'], ['A worker paid by the hour, with no one checking, takes long breaks.', 'Moral hazard: hidden action after the deal']], ci = R.int(0, 3);
      return P('Which problem is this? ' + cases[ci][0], mc(cases[ci][1], ['Adverse selection: hidden information before the deal', 'Moral hazard: hidden action after the deal', 'A negative externality', 'Neither: both sides know everything'].filter(function (x) { return x !== cases[ci][1]; })),
        ['Adverse selection is about hidden <i>information</i> (types, quality) that one side has before agreeing: the deal attracts the wrong mix.', 'Moral hazard is about hidden <i>actions</i> after the deal: behavior changes because someone else bears the cost.', cases[ci][1] + '.'], 'Is the hidden thing a fact before the deal, or a choice after it?', { chk: { k: 'const', text: cases[ci][1] } }); }
    var Sg = R.int(6, 12) * 500, Bg = Sg + R.int(2, 6) * 500, Sl = R.int(1, 4) * 500, Bl = Sl + R.int(1, 3) * 500, pi = R.pick([Q(1, 4), Q(1, 3), Q(1, 2), Q(2, 3), Q(3, 4), Q(1, 5), Q(4, 5)]);
    if (Bl >= Sg) Sg = Bl + 1000, Bg = Sg + 1500;
    var wtp = pi.mul(Bg).add(Q(1).sub(pi).mul(Bl)), works = wtp.ge(Sg), th = Q(Sg - Bl, Bg - Bl);
    var intro = 'In a used-car market, a fraction $' + pi.toTex() + '$ of cars are good and the rest are lemons. Owners of good cars will sell for at least ' + money(Sg) + '; buyers value good cars at ' + money(Bg) + '. Owners of lemons will sell for at least ' + money(Sl) + '; buyers value lemons at ' + money(Bl) + '. Sellers know which they have; buyers can\u2019t tell and are risk neutral. ';
    var st = ['If every car were offered, a random car would be worth $' + pi.toTex() + '(' + Bg + ') + ' + Q(1).sub(pi).toTex() + '(' + Bl + ') = ' + nx(wtp) + '$ to a buyer.'];
    if (kind === 'wtp') return P(intro + 'If all cars were offered for sale, what is the most a buyer would pay for a car of unknown quality?', A(wtp), st.concat(['That is the expected value to the buyer, since good and lemon cars look alike.']), 'Probability-weighted average of the buyer values.', { unit: 'dollars', chk: { k: 'lemons', Sg: Sg, Bg: Bg, Sl: Sl, Bl: Bl, pi: pi.toNumber(), ask: 'wtp' } });
    if (kind === 'thresh') return P(intro + 'What is the smallest fraction of good cars for which good cars can still sell?', A(th),
      ['Good cars sell only if buyers\u2019 pooled valuation reaches the good owners\u2019 minimum: $\\pi(' + Bg + ') + (1 - \\pi)(' + Bl + ') \\ge ' + Sg + '$.', 'Solve: $\\pi \\ge \\dfrac{' + Sg + ' - ' + Bl + '}{' + Bg + ' - ' + Bl + '} = ' + nx(th) + '$.', 'Below that share, good cars stay off the market and only lemons trade.'],
      'Set the pooled value equal to the good sellers\u2019 minimum price.', { chk: { k: 'lemons', Sg: Sg, Bg: Bg, Sl: Sl, Bl: Bl, pi: pi.toNumber(), ask: 'thresh' } });
    var ans = works ? 'Yes: buyers will pay up to ' + money(wtp.toNumber()) + ', enough for good-car owners' : 'No: buyers pay at most ' + money(wtp.toNumber()) + ', less than good-car owners need, so only lemons are sold';
    return P(intro + 'Can good cars be sold in this market?', mc(ans, [works ? 'No: buyers pay at most ' + money(wtp.toNumber()) + ', less than good-car owners need, so only lemons are sold' : 'Yes: buyers will pay up to ' + money(wtp.toNumber()) + ', enough for good-car owners', 'Yes: buyers value good cars at ' + money(Bg) + ', more than sellers need', 'No: lemons are always worth less than good cars']),
      st.concat([works ? nx(wtp) + ' is at least ' + Sg + ', so good-car owners are willing to sell at the pooled price.' : nx(wtp) + ' is below ' + Sg + ': good-car owners won\u2019t sell. Buyers then know only lemons are offered and pay at most ' + money(Bl) + '. Mutually beneficial trades in good cars are lost.']),
      'Compare the pooled value with what good-car owners need.', { chk: { k: 'lemons', Sg: Sg, Bg: Bg, Sl: Sl, Bl: Bl, pi: pi.toNumber(), ask: 'works', text: ans } });
  });

  G('imicro.moral-hazard', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['deduct', 'bonus', 'which'], ['deduct', 'bonus', 'which', 'check'], ['deduct', 'bonus', 'check', 'deduct']));
    if (kind === 'which') { var cases = [['After getting a phone plan that replaces broken phones for free, Sam stops using a case.', 'Moral hazard'], ['People who expect to need many repairs are the ones most likely to buy an extended warranty.', 'Adverse selection'], ['A contractor paid a fixed fee, whose work can\u2019t be checked, uses cheaper materials than promised.', 'Moral hazard'], ['A rock climber who loves risk buys climbing gear.', 'Neither: no one else bears the cost of the risk']], ci = R.int(0, 3);
      return P('Which is it? ' + cases[ci][0], mc(cases[ci][1], ['Moral hazard', 'Adverse selection', 'Neither: no one else bears the cost of the risk', 'A public good'].filter(function (x) { return x !== cases[ci][1]; })),
        ['Moral hazard: someone\u2019s hidden behavior changes after a deal because someone else now bears part of the cost.', 'Adverse selection: hidden information before a deal changes who signs up.', 'Risky behavior alone is not moral hazard if the person bears its cost.', 'Answer: ' + cases[ci][1] + '.'], 'Does someone else now bear the cost, and is the hidden thing an action after the deal?', { chk: { k: 'const', text: cases[ci][1] } }); }
    if (kind === 'deduct' || kind === 'check') {
      var cst = R.int(1, 20) * 10, piH = R.pick([Q(1, 5), Q(1, 4), Q(3, 10), Q(2, 5)]), piL = piH.sub(R.pick([Q(1, 10), Q(1, 20), Q(1, 5)])); if (piL.sign() <= 0) piL = Q(1, 20);
      var Dmin = Q(cst).div(piH.sub(piL));
      var intro = 'Driving carefully costs a driver the equivalent of ' + money(cst) + ' a year (time, effort). It cuts the chance of an accident from $' + piH.toTex() + '$ to $' + piL.toTex() + '$ a year. With full insurance the insurer pays every repair, so the driver gains nothing from care. The insurer can add a deductible $D$ that the driver pays per accident. ';
      if (kind === 'deduct') return P(intro + 'What is the smallest deductible that makes careful driving worth it to a (risk-neutral) driver?', A(Dmin),
        ['Care saves the driver the deductible in the accidents it prevents: $(' + piH.toTex() + ' - ' + piL.toTex() + ')D = ' + nx(piH.sub(piL)) + 'D$ a year on average.', 'Care pays when that is at least its cost: $' + nx(piH.sub(piL)) + 'D \\ge ' + cst + '$, so $D \\ge ' + nx(Dmin) + '$.'],
        'Expected savings from care must cover the cost of care.', { unit: 'dollars', chk: { k: 'mh', c: cst, pH: piH.toNumber(), pL: piL.toNumber(), ask: 'D' } });
      var D = Dmin.mul(R.pick([Q(1, 2), Q(3, 4), Q(5, 4), Q(2)])), careful = D.ge(Dmin), ans2 = careful ? 'Yes: the expected deductible saved is at least the cost of care' : 'No: the expected deductible saved is less than the cost of care';
      return P(intro + 'With a deductible of ' + money(D.toNumber()) + ', does a (risk-neutral) driver drive carefully?', mc(ans2, [careful ? 'No: the expected deductible saved is less than the cost of care' : 'Yes: the expected deductible saved is at least the cost of care', 'Yes: any deductible makes drivers careful', 'No: insured drivers never take care']),
        ['Expected saving from care: $' + nx(piH.sub(piL)) + '\\times ' + nx(D) + ' = ' + nx(piH.sub(piL).mul(D)) + '$; cost of care: ' + cst + '.', ans2 + '.'], 'Compare the expected saving with the cost.', { chk: { k: 'mh', c: cst, pH: piH.toNumber(), pL: piL.toNumber(), D: D.toNumber(), ask: 'check', text: ans2 } });
    }
    var e = R.int(2, 20) * 50, pH = R.pick([Q(3, 4), Q(4, 5), Q(9, 10), Q(2, 3)]), pL = pH.sub(R.pick([Q(1, 4), Q(1, 5), Q(1, 2), Q(1, 3)])); if (pL.sign() <= 0) pL = Q(1, 10);
    var Bmin = Q(e).div(pH.sub(pL));
    return P('A salesperson\u2019s effort can\u2019t be observed. Extra effort costs her the equivalent of ' + money(e) + ' and raises the chance of landing a big client from $' + pL.toTex() + '$ to $' + pH.toTex() + '$. The firm pays a base salary plus a bonus $B$ if the client signs. What is the smallest bonus that makes extra effort worth it to her (risk neutral)?', A(Bmin),
      ['Effort raises her expected bonus by $(' + pH.toTex() + ' - ' + pL.toTex() + ')B = ' + nx(pH.sub(pL)) + 'B$.', 'She puts in effort if that covers its cost: $B \\ge \\dfrac{' + e + '}{' + nx(pH.sub(pL)) + '} = ' + nx(Bmin) + '$.', 'Pay tied to results restores the incentive that hidden effort removes.'],
      'The rise in the expected bonus must cover the cost of effort.', { unit: 'dollars', chk: { k: 'mhb', e: e, pH: pH.toNumber(), pL: pL.toNumber() } });
  });

  G('imicro.signaling', function (R, ctx) {
    var kind = R.pick(lv(ctx, ['min', 'max', 'min'], ['min', 'max', 'check', 'range'], ['check', 'range', 'min', 'max']));
    var wL = R.int(3, 6) * 10, wH = wL + R.int(2, 6) * 10, cH = R.int(1, 4) * 5, cL = cH + R.int(1, 4) * 5, dW = wH - wL;
    var lo = Q(dW, cL), hi = Q(dW, cH);
    var intro = 'There are two kinds of workers. High-productivity workers are worth ' + wH + ' (thousand dollars) to an employer; low-productivity workers are worth ' + wL + '. Employers can\u2019t tell them apart but can see years of extra education $e$, which costs a high type ' + cH + ' per year and a low type ' + cL + ' per year (in effort, time and money). Education adds nothing to productivity here. Employers pay ' + wH + ' to anyone with at least $e^*$ years and ' + wL + ' to everyone else. ';
    var st = ['Low types must not want to copy: $' + wH + ' - ' + cL + 'e^* \\le ' + wL + '$, so $e^* \\ge \\dfrac{' + dW + '}{' + cL + '} = ' + nx(lo) + '$.', 'High types must want to get it: $' + wH + ' - ' + cH + 'e^* \\ge ' + wL + '$, so $e^* \\le \\dfrac{' + dW + '}{' + cH + '} = ' + nx(hi) + '$.'];
    var chk = { k: 'signal', wH: wH, wL: wL, cH: cH, cL: cL };
    if (kind === 'min') return P(intro + 'What is the smallest $e^*$ that separates the types (so low types choose not to get it)?', A(lo), st.slice(0, 1).concat(['The smallest separating requirement is ' + nx(lo) + ' years; any less and low types would copy.']), 'Make copying unattractive to low types.', { unit: 'years', chk: Object.assign({ ask: 'lo' }, chk) });
    if (kind === 'max') return P(intro + 'What is the largest $e^*$ that high types would still be willing to meet?', A(hi), st.slice(1).concat(['Above ' + nx(hi) + ' years, the education costs a high type more than the higher wage is worth.']), 'Make the signal still worth it for high types.', { unit: 'years', chk: Object.assign({ ask: 'hi' }, chk) });
    if (kind === 'range') return P(intro + 'Separating equilibria exist for every $e^*$ between two bounds. How wide is that range, in years?', A(hi.sub(lo)), st.concat(['Width: $' + nx(hi) + ' - ' + nx(lo) + ' = ' + nx(hi.sub(lo)) + '$ years. It exists because the signal is cheaper for high types.']), 'Find both bounds.', { unit: 'years', chk: Object.assign({ ask: 'range' }, chk) });
    var e0 = R.pick([lo.mul(Q(1, 2)), lo.add(hi).div(2), hi.mul(Q(3, 2)), lo.add(hi).div(2)]), sep = e0.ge(lo) && e0.le(hi);
    var ans = sep ? 'Yes: low types won\u2019t copy it and high types will get it' : e0.lt(lo) ? 'No: it is so cheap that low types copy it too' : 'No: it is so costly that even high types skip it';
    return P(intro + 'Does a requirement of $e^* = ' + nx(e0) + '$ years separate the types?', mc(ans, ['Yes: low types won\u2019t copy it and high types will get it', 'No: it is so cheap that low types copy it too', 'No: it is so costly that even high types skip it', 'No: education must raise productivity to work as a signal'].filter(function (x) { return x !== ans; })),
      st.concat(['Separation needs ' + nx(lo) + ' ≤ $e^*$ ≤ ' + nx(hi) + '; here $e^* = ' + nx(e0) + '$. ' + ans + '.']), 'Check both incentive conditions.', { chk: Object.assign({ ask: 'check', e: e0.toNumber(), text: ans }, chk) });
  });

})(window.MathLadder);

/* ---- widen: more forms of the same questions (so practice repeats less) ----------------------------------------
   Every topic of this course keeps its own problems, and some draws are turned into other forms of the same skill,
   built only from the topic's own problems (so their answers stay the ones the topic already checks):
     check   "Ava chose X. Is Ava right?" (Yes or No) from a one-answer multiple-choice problem
     pairs   two or three lines "question → answer"; which line is right (or, at level 3, which one is wrong)
     tfpick  "Which sentence is true?" (or false) from three of the topic's true-or-false sentences
   Questions whose answer depends on the other choices (first, best, most, not …) show the choices in the check form
   and never go into pairs. Mix per level: CFG.mix[level] = [check, pairs, tfpick] shares; the rest stays as it was. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var CFG = {"prefix":"imicro.","only":["cobb-douglas-demand","present-value","minimum-average-cost","tax-incidence-formula","lerner-index","welfare-theorems"]};
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jude', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia',
    'Quinn', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vic', 'Wren', 'Zoe', 'Ada', 'Leo', 'Mia', 'Theo', 'June', 'Max'];
  var REL = /\b(first|last|earliest|latest|earlier|later|before|after|older|oldest|newer|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|look|read|here|example|examples|likely|probably|mainly|main|usually|typically|other|another|which one|each|order|then|next)\b|n['’]t\b/i;
  // pairs judge each line on its own, so only questions whose answer depends on the other choices are left out
  var RELP = /\b(first|last|earliest|latest|oldest|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|which one|other|another|rank|order|more|less|fewer)\b|n['’]t\b|\w+est\b/i;
  var REF = /\b(this|these|those|shown|picture|map|table|chart|graph|diagram|passage|scene|story|above|below|here|following)\b/i;
  var BADCH = /\b(all|none|both|neither) of\b|\b(above|below)\b|^(both|neither|all|none)\b|\bchoice\b|\boption\b/i;
  function strip(s) { return String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plainish(s) { return !/<(?!\/?(b|i|em|strong)\b)[^>]*>/.test(String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1')); }
  function add(q, html) { // inside a read-aloud big span when there is one
    var m = /<span class="[\w-]*big">/.exec(q);
    if (m) { var k = q.lastIndexOf('</span>'); if (k > m.index) return q.slice(0, k) + '<br>' + html.replace(/<\/p>\s*<p[^>]*>/g, '<br>').replace(/<\/?p[^>]*>/g, '') + q.slice(k); }
    return q + html;
  }
  function single(p) {
    return p && p.a && p.a.t === 'mc' && !Array.isArray(p.a.v) && Array.isArray(p.a.choices) && p.a.choices.length >= 2 &&
      !p.a.choices.some(function (c) { return BADCH.test(strip(c)); });
  }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function nameFor(q, key) { // the same claim always gets the same name, so a name alone never makes a "new" problem
    var t = strip(q), ok = NAMES.filter(function (n) { return t.indexOf(n) < 0 && String(key).indexOf(n) < 0; });
    return (ok.length ? ok : NAMES)[hash(t + '|' + key) % (ok.length || NAMES.length)];
  }
  function dot(s) { s = String(s); return /[.!?…"”')\]]\s*(<\/b>)?$/.test(strip(s)) || /\$$/.test(s) ? s : s + '.'; }
  function optList(ch) { return '<p class="wd-opts">The choices were:<br>' + ch.map(function (c) { return '• ' + c; }).join('<br>') + '</p>'; }
  function copyP(p, q, a, steps) { var o = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.q = q; o.a = a; o.steps = steps; delete o.choices; return o; }

  // check: show one choice (the right one half the time) and ask whether it is right
  function check(p, R) {
    var ch = p.a.choices, v = p.a.v, idx = ch.map(function (_, i) { return i; }), others = idx.filter(function (i) { return i !== v; });
    var i = R.chance(0.5) ? v : R.pick(others), ok = i === v, nm = nameFor(p.q, ch[i]), letters = ch.every(function (c) { return /^[A-Z]$/.test(String(c)); });
    var stem = strip(p.q), html = '';
    if (!letters && (REL.test(stem) || ch.length > 4 || CFG.listAll)) {
      var shown = p.a.keep ? ch.slice() : R.shuffle(ch);
      html += optList(shown);
    }
    html += '<p class="wd-check">' + nm + ' chose: <b>' + ch[i] + '</b>' + (/[.!?…"”]$/.test(strip(ch[i])) ? '' : '.') + ' Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes. ' + dot(ch[v]) + ' is the right answer.' : 'No. The right answer is: ' + dot(ch[v]);
    if (ok) first = 'Yes, that is the right answer.';
    return copyP(p, add(p.q, html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [first].concat(p.steps || []));
  }
  // check for "choose all": the whole list is shown, and one learner's picks; right only if exactly the right ones
  function checkAll(p, R) {
    var ch = p.a.choices, v = p.a.v.slice().sort(), n = ch.length, pick;
    if (R.chance(0.45)) pick = v.slice();
    else {
      var t = 0; do { var j = R.int(0, n - 1), s = v.slice(), k = s.indexOf(j); if (k >= 0) s.splice(k, 1); else s.push(j); if (R.chance(0.3)) { var j2 = R.int(0, n - 1), k2 = s.indexOf(j2); if (k2 >= 0) s.splice(k2, 1); else s.push(j2); } pick = s.sort(); t++; }
      while (t < 20 && (!pick.length || pick.join() === v.join()));
      if (!pick.length || pick.join() === v.join()) return null;
    }
    var ok = pick.join() === v.join(), nm = nameFor(p.q, pick.join());
    var html = optList(ch) + '<p class="wd-check">' + nm + ' chose ' +
      (pick.length === 1 ? 'only: <b>' + ch[pick[0]] + '</b>' : 'these: <b>' + pick.map(function (i) { return ch[i]; }).join('</b>; <b>') + '</b>') + '. Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes, those are exactly the right ones.' : 'No. The right ones are: ' + v.map(function (i) { return ch[i]; }).join('; ');
    return copyP(p, add(p.q.replace(/\s*(Choose|Select|Pick) (all|every)[^.?!<]*[.?!]?/i, ''), html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [dot(first)].concat(p.steps || []));
  }

  // items for pairs: one-answer questions that stand on their own (no picture, no passage, no "first/best/…")
  function pairItem(p) {
    if (!single(p) || p.viz) return null;
    var max = CFG.maxStem || 120, maxA = CFG.maxAns || 70, a = strip(p.a.choices[p.a.v]), stem, group = '';
    // "prompt<br><b>thing</b>" or "prompt<blockquote>thing</blockquote>": a line is "thing → answer", lines share the prompt
    var q0 = p.q.replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1').trim();
    var m = /^([^<]{6,140}?)\s*(?:<br>\s*<b>([^<]{3,140})<\/b>|<blockquote>([^<]{3,140})<\/blockquote>)\s*$/.exec(q0);
    if (m) { group = m[1].trim(); stem = (m[2] || m[3]).trim(); if (RELP.test(group.replace(/\b(this|these)\b/gi, ''))) return null; }
    else {
      if (!plainish(p.q)) return null;
      stem = strip(p.q); if (RELP.test(stem)) return null;
    }
    if (stem.length > max || stem.length < 3 || a.length > maxA || /^[A-Z]$/.test(a) || /\$/.test(stem + a + group)) return null;
    var w = p.a.choices.filter(function (_, i) { return i !== p.a.v; }).map(strip).filter(function (x) { return x.length <= maxA && x !== a; });
    if (!w.length) return null;
    return { stem: stem.replace(/\s*(Choose one|Pick one)\.?$/i, ''), a: a, w: w, why: (p.steps || [])[0] || '', group: group };
  }
  function tfItem(p) {
    if (!p || !p.a || p.a.t !== 'tf' || p.viz || !plainish(p.q)) return null;
    var s = strip(p.q).replace(/^(True or false\?|True or false:)\s*/i, '').replace(/\s*(True or false\?|Is this true or false\?|Is it true or false\?)$/i, '').trim();
    if (s.length < 8 || s.length > (CFG.maxStem || 120) + 20 || REF.test(s) || /\?$/.test(s) || /\$/.test(s)) return null;
    return { s: s, v: p.a.v, why: (p.steps || [])[0] || '' };
  }
  function harvest(base, R, ctx, make, n, distinct) {
    var out = [], keys = {};
    for (var t = 0; t < 24 && out.length < n; t++) {
      // at level 3, lines may come from level 2 questions too: three lines with one wrong is the harder form
      var c2 = ctx && ctx.level >= 3 && (t % 2) ? Object.assign({}, ctx, { level: 2 }) : ctx;
      var p; try { p = base(ML.rand(R.int(1, 2e9)), c2); } catch (e) { continue; }
      var it = make(p); if (!it) continue;
      if (out.length && it.group !== undefined && it.group !== out[0].group) continue;
      var k = distinct(it); if (k.some(function (x) { return keys[x]; })) continue;
      k.forEach(function (x) { keys[x] = 1; }); out.push(it);
    }
    return out;
  }
  function pairs(base, R, ctx, n, wrongOne) {
    var its = harvest(base, R, ctx, pairItem, n, function (it) { return it.group ? ['s:' + it.stem] : ['s:' + it.stem, 'a:' + it.a]; });
    if (its.length < n) return null;
    var answers = its.map(function (it) { return it.a; }), used = {};
    var target = R.int(0, n - 1), lines = [], steps = [];
    for (var i = 0; i < n; i++) {
      var it = its[i], right = wrongOne ? i !== target : i === target, ans = it.a;
      if (!right) {
        var ws = it.w.filter(function (x) { return (its[0].group || answers.indexOf(x) < 0) && !used[x]; });
        if (!ws.length) return null;
        ans = R.pick(ws); if (!its[0].group) used[ans] = 1;
      }
      lines.push(it.stem + ' → ' + ans); // plain text: ladder pages show choices as text
      steps.push(it.group ? dot(it.stem) + ' Answer: ' + it.a + (right ? '.' : ', not ' + ans + '.') : it.stem + ' The answer is ' + it.a + (right ? '.' : ', not ' + ans + '.'));
    }
    var g = its[0].group, q = g ? '<p class="wd-group">The question for every line: <i>' + g + '</i></p>' + (wrongOne ? 'One line has the <b>wrong</b> answer. Which line is it?' : n === 2 ? 'Which line has the <b>right</b> answer?' : 'Only one line has the right answer. Which line is it?') : wrongOne ? 'Each line is a question and an answer. One answer is <b>wrong</b>. Which line is it?'
      : (n === 2 ? 'Each line is a question and an answer. Which line has the <b>right</b> answer?' : 'Each line is a question and an answer. Only one answer is right. Which line is it?');
    if (its[target].why) steps.push(its[target].why);
    return { q: q, a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own. Does the answer fit the question?' };
  }
  function tfpick(base, R, ctx, wantFalse) {
    var its = harvest(base, R, ctx, tfItem, 6, function (it) { return ['s:' + it.s]; });
    var T = its.filter(function (x) { return x.v; }), F = its.filter(function (x) { return !x.v; });
    var odd = wantFalse ? F : T, rest = wantFalse ? T : F;
    if (!odd.length || rest.length < 2) return null;
    var pick = [odd[0], rest[0], rest[1]], order = R.shuffle([0, 1, 2]), choices = order.map(function (i) { return pick[i].s; });
    var steps = pick.map(function (x) { return x.s + ' ' + (x.v ? 'True.' : 'False.'); });
    if (odd[0].why) steps.push(odd[0].why);
    return { q: wantFalse ? 'Which sentence is <b>false</b>?' : 'Which sentence is <b>true</b>?', a: { t: 'mc', choices: choices, v: order.indexOf(0) }, steps: steps,
      hint: 'Decide about each sentence on its own.' };
  }
  var MIX = CFG.mix || { 1: [0.38, 0.25, 0.04], 2: [0.27, 0.3, 0.1], 3: [0.17, 0.4, 0.15] };
  function wrap(id, base) {
    var fn = function (R, ctx) {
      var lv = ctx && ctx.level || 1, p = base(R, ctx), m = MIX[lv] || MIX[3], r = R.next();
      if (p.nowiden || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf') || (CFG.skip && CFG.skip.indexOf(id) >= 0)) return p; // typed answers stay as they are
      var form = r < m[0] ? 0 : r < m[0] + m[1] ? 1 : r < m[0] + m[1] + m[2] ? 2 : -1;
      if (form < 0) return p;
      var tries = [form, (form + 1) % 3, (form + 2) % 3].filter(function (f) { return m[f] > 0; });
      for (var t = 0; t < tries.length; t++) {
        var f = tries[t], alt = null;
        if (f === 0) alt = single(p) ? check(p, R) : (p.a && p.a.t === 'mc' && Array.isArray(p.a.v) && !p.viz ? checkAll(p, R) : null);
        else if (f === 1) alt = pairs(base, R, ctx, lv === 1 ? 2 : 3, lv >= 3 && R.chance(0.6));
        else alt = tfpick(base, R, ctx, R.chance(0.4));
        if (alt) return alt;
      }
      return p;
    };
    fn.widened = true;
    return fn;
  }
  ML.genIds().forEach(function (id) {
    if (id.indexOf(CFG.prefix) !== 0 || (CFG.only && CFG.only.indexOf(id.slice(CFG.prefix.length)) < 0)) return;
    var g = ML.getGen(id); if (g && !g.widened) ML.gen(id, wrap(id, g));
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen ---- */
