/* Math Ladder: problem generators for Geometry (course key geo). Built from /tmp/work_mlp10/gen/*.js by build-gen.js.
   One generator per topic in data/math/topics/geo.json. Diagrams use the course visual "geo-fig" (static/math/viz/geo.js).
   Exact answers: lengths as simplified radicals and areas/volumes in terms of π use form 'simplest'; calculator answers
   (trig, density) use a small tolerance. Every answer is computed from the numbers generated.                           */
(function (ML) {
  'use strict';
  var T = ML.T, U = ML.util, byL = ML.byLevel, M = Math;
  /* inline math that starts with a digit and has a 3-letter run (like "$30 + m\angle DBC$") reads as money to the
     typesetter, so such math gets a leading {} */
  function fixMath(s) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    var parts = s.split(/(\\\$|\$\$|\$)/), out = '', inM = false;
    for (var i = 0; i < parts.length; i++) {
      var x = parts[i];
      if (x === '$') { inM = !inM; out += x; continue; }
      if (inM && /^\s*\d/.test(x) && /[a-zA-Z]{3,}/.test(x.replace(/\\[a-zA-Z]+/g, ' '))) x = '{}' + x;
      out += x;
    }
    return out;
  }
  function fixP(p) {
    p.q = fixMath(p.q); if (p.hint) p.hint = fixMath(p.hint); p.steps = p.steps.map(fixMath);
    (function walk(a) { if (!a) return; if (a.choices) a.choices = a.choices.map(fixMath); if (a.parts) a.parts.forEach(function (q) { if (q.label) q.label = fixMath(q.label); walk(q.a); }); })(p.a);
    return p;
  }
  function G(id, fn) { ML.gen(id, function (R, ctx) { return fixP(fn(R, ctx)); }); }

  /* ---------------------------------------------------------------- exact numbers */
  // (n/d)·√r, simplified (r becomes square-free)
  function rad(n, d, r) {
    d = d === undefined ? 1 : d; r = r === undefined ? 1 : r;
    if (r === 0 || n === 0) return { n: 0, d: 1, r: 1, val: 0 };
    var s = U.simplifyRadical(r); n *= s[0]; r = s[1];
    var g = U.gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; }
    return { n: n, d: d, r: r, val: n / d * M.sqrt(r) };
  }
  function sqrtN(N) { return rad(1, 1, N); }
  function rtex(x) {
    if (x.n === 0) return '0';
    var a = M.abs(x.n), top = x.r === 1 ? String(a) : (a === 1 ? '' : a) + '\\sqrt{' + x.r + '}';
    return (x.n < 0 ? '-' : '') + (x.d === 1 ? top : '\\frac{' + top + '}{' + x.d + '}');
  }
  function rplain(x) {
    if (x.n === 0) return '0';
    if (x.r === 1) return x.d === 1 ? String(x.n) : x.n + '/' + x.d;
    var top = (x.n === 1 ? '' : x.n === -1 ? '-' : x.n + '*') + 'sqrt(' + x.r + ')';
    return x.d === 1 ? top : top + '/' + x.d;
  }
  function rnum(x) { return { t: 'num', v: rplain(x), form: 'simplest' }; }
  // (n/d)·π
  function pq(n, d) { d = d || 1; var g = U.gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return { n: n, d: d, val: n / d * M.PI }; }
  function ptex(p) { if (p.n === 0) return '0'; var a = M.abs(p.n), top = (a === 1 ? '' : a) + '\\pi'; return (p.n < 0 ? '-' : '') + (p.d === 1 ? top : '\\frac{' + top + '}{' + p.d + '}'); }
  function pplain(p) { if (p.n === 0) return '0'; var top = (p.n === 1 ? '' : p.n === -1 ? '-' : p.n + '*') + 'pi'; return p.d === 1 ? top : top + '/' + p.d; }
  function pnum(p) { return { t: 'num', v: pplain(p), form: 'simplest' }; }
  function frac(n, d) { return T.frac(n, d); }
  function qplain(n, d) { var r = U.reduce(n, d); return r[1] === 1 ? String(r[0]) : r[0] + '/' + r[1]; }
  function num(v, o) { return Object.assign({ t: 'num', v: String(v) }, o || {}); }
  function dec(x, dp) { var s = (M.round(x * M.pow(10, dp)) / M.pow(10, dp)).toFixed(dp); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; }
  // a rounded calculator answer: to the nearest tenth (default) or, with t >= 0.5, to the nearest whole number
  function tol(x, t) { return t !== undefined && t >= 0.5 ? { t: 'num', v: String(M.round(x)), tol: 0.55 } : { t: 'num', v: dec(x, 1), tol: 0.06 }; }
  function sinD(d) { return M.sin(d * M.PI / 180); }
  function cosD(d) { return M.cos(d * M.PI / 180); }
  function tanD(d) { return M.tan(d * M.PI / 180); }
  function aD(r) { return r * 180 / M.PI; }

  /* ---------------------------------------------------------------- text helpers */
  function deg(x) { return T.num(x) + '^\\circ'; }
  function seg(s) { return '\\overline{' + s + '}'; }
  function ang(s) { return '\\angle ' + s; }
  function mang(s) { return 'm\\angle ' + s; }
  function tri(s) { return '\\triangle ' + s; }
  function arcT(s) { return '\\widehat{' + s + '}'; }
  function lin(a, b, v) { return T.lin(a, v || 'x', b); }
  function pt(p) { return T.pt(p); }
  function $(s) { return '$' + s + '$'; }
  var LET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
  function letters(R, n) { var start = R.int(0, LET.length - n); return LET.slice(start, start + n); }
  function mc(correct, wrongs) {
    var out = [String(correct)];
    (wrongs || []).forEach(function (w) { w = String(w); if (out.length < 4 && out.indexOf(w) < 0) out.push(w); });
    return { t: 'mc', choices: out, v: 0 };
  }
  function mcKeep(choices, i) { return { t: 'mc', choices: choices, v: i, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function fig(o, label) { var opts = Object.assign({}, o); if (label) opts.label = label; return { name: 'geo-fig', opts: opts, label: label || 'A diagram for this problem' }; }
  function pickN(R, arr, k) { return R.sample(arr, k); }

  /* two linear expressions in x that are equal at x = xv: a·x + b and c·x + d (a ≠ c), value in [lo, hi] */
  function eqPair(R, xv, lo, hi) {
    for (var t = 0; t < 200; t++) {
      var a = R.int(2, 7), c = R.intNot(1, 8, [a]), val = R.int(lo, hi), b = val - a * xv, d = val - c * xv;
      if (b !== 0 && d !== 0 && M.abs(b) <= 60 && M.abs(d) <= 60) return { a: a, b: b, c: c, d: d, val: val };
    }
    return { a: 3, b: val - 3 * xv, c: 1, d: val - xv, val: val };
  }
  /* an expression a·x + b worth `val` at x = xv */
  function expr(R, xv, val, amin, amax) {
    for (var t = 0; t < 100; t++) { var a = R.int(amin || 2, amax || 6), b = val - a * xv; if (b !== 0 && M.abs(b) <= 80) return { a: a, b: b, tex: lin(a, b) }; }
    return { a: 1, b: val - xv, tex: lin(1, val - xv) };
  }
  function solveSteps(e1, e2, xv) { // steps for e1 = e2 (each {a, b}) with solution xv
    var A = e1.a - e2.a, B = e2.b - e1.b, out = [];
    out.push('Set the expressions equal: $' + lin(e1.a, e1.b) + ' = ' + lin(e2.a, e2.b) + '$.');
    if (A > 0) out.push('Collect $x$ on the left: $' + T.mono(A, 'x') + ' = ' + B + '$' + (A === 1 ? '.' : ', so $x = ' + xv + '$.'));
    else out.push('Collect $x$ on the right: $' + (-B) + ' = ' + T.mono(-A, 'x') + '$, so $x = ' + xv + '$.');
    return out;
  }
  function sumSteps(es, total, xv) { // steps for e1 + e2 (+ e3) = total
    var a = 0, b = 0; es.forEach(function (e) { a += e.a; b += e.b; });
    var terms = es.map(function (e) { return '(' + lin(e.a, e.b) + ')'; });
    var eqn = terms.join(' + ');
    if (terms.length > 3) { eqn = ''; for (var i = 0; i < terms.length; i += 2) eqn += (i ? '$ $+ ' : '') + terms.slice(i, i + 2).join(' + '); }
    return ['Write the equation: $' + eqn + ' = ' + total + '$.',
      'Combine like terms: $' + lin(a, b) + ' = ' + total + '$.',
      (b !== 0 ? (b > 0 ? 'Subtract ' + b + ' from' : 'Add ' + (-b) + ' to') + ' both sides: $' + T.mono(a, 'x') + ' = ' + (total - b) + '$. ' : '') + (a === 1 ? 'So $x = ' + xv + '$.' : 'Divide by ' + a + ': $x = ' + xv + '$.')];
  }

  /* ---------------------------------------------------------------- coordinates */
  function dist2(A, B) { var dx = B[0] - A[0], dy = B[1] - A[1]; return dx * dx + dy * dy; }
  function mid(A, B) { return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; }
  function tq(x) { return ML.Q.from(x).toPlain(); } // number -> exact plain string
  function rot(P, deg, C) { C = C || [0, 0]; var x = P[0] - C[0], y = P[1] - C[1], d = ((deg % 360) + 360) % 360; var r = d === 90 ? [-y, x] : d === 180 ? [-x, -y] : d === 270 ? [y, -x] : [x, y]; return [r[0] + C[0], r[1] + C[1]]; }
  function refl(P, line) { // line: {t:'x', c} (x = c), {t:'y', c} (y = c), 'y=x', 'y=-x'
    if (line === 'y=x') return [P[1], P[0]]; if (line === 'y=-x') return [-P[1], -P[0]];
    if (line.t === 'x') return [2 * line.c - P[0], P[1]]; return [P[0], 2 * line.c - P[1]];
  }
  function lineName(line) { if (line === 'y=x') return 'y = x'; if (line === 'y=-x') return 'y = -x'; if (line.t === 'x') return line.c === 0 ? 'the y\\text{-axis}' : 'x = ' + line.c; return line.c === 0 ? 'the x\\text{-axis}' : 'y = ' + line.c; }
  function lineWords(line) { if (line !== 'y=x' && line !== 'y=-x' && line.c === 0) return line.t === 'x' ? 'the $y$-axis' : 'the $x$-axis'; return 'the line $' + lineName(line) + '$'; }
  function slopeTex(dy, dx) { return T.frac(dy, dx); }

  /* a figure of two lines cut by a transversal: angles numbered 1-8 (1-4 at the top crossing: upper left, upper right,
     lower left, lower right; 5-8 at the bottom crossing, same order). phi = the transversal's angle with the lines. */
  function transFig(phi, o) {
    o = o || {}; var t = phi * M.PI / 180, h = 3, cx = 4.5 - 1.5 / M.tan(t), X2 = [cx, 0], X1 = [cx + h / M.tan(t), h], u = [M.cos(t), M.sin(t)];
    var pts = { L1: [0, h], L2: [9, h], M1: [0, 0], M2: [9, 0], X1: X1, X2: X2, T1: [X2[0] - 1.7 * u[0], -1.7 * u[1]], T2: [X1[0] + 1.7 * u[0], h + 1.7 * u[1]] };
    var texts = [], mids = [phi / 2 + 0, (phi + 180) / 2, 180 + phi / 2, 270 + phi / 2], halfs = [phi / 2, (180 - phi) / 2, phi / 2, (180 - phi) / 2];
    // quadrant order for numbering: UL, UR, LL, LR -> mids index 1, 0, 2, 3
    var qi = [1, 0, 2, 3];
    [X1, X2].forEach(function (P, c) {
      qi.forEach(function (q, j) {
        var r = M.min(1.05, 0.45 / M.max(0.3, M.sin(halfs[q] * M.PI / 180))), a = mids[q] * M.PI / 180, n = c * 4 + j + 1;
        var lab = o.labels && o.labels[n] !== undefined ? o.labels[n] : String(n);
        if (lab !== '') texts.push([P[0] + r * M.cos(a), P[1] + r * M.sin(a), lab, { color: o.hl && o.hl.indexOf(n) >= 0 ? 'red' : 'blue', size: 14 }]);
      });
    });
    texts.push([8.7, h + 0.38, 'ℓ', { it: 1 }], [8.7, 0.38, 'm', { it: 1 }], [pts.T2[0] + 0.25, pts.T2[1], 't', { it: 1 }]);
    var par = o.parallel !== false;
    return { pts: pts, hide: ['L1', 'L2', 'M1', 'M2', 'X1', 'X2', 'T1', 'T2'], lines: [['L1', 'L2', par ? { arrow: 1 } : {}], ['M1', 'M2', par ? { arrow: 1 } : {}], ['T1', 'T2']], texts: texts, height: 250 };
  }
  // measure of angle n (1-8) when the transversal makes angle phi; quadrants UR, LL = phi; UL, LR = 180 - phi
  function transAngle(n, phi) { var q = (n - 1) % 4; return q === 1 || q === 2 ? phi : 180 - phi; }
  function transRel(i, j) { // the name of the relationship between angles i and j (1-8), or null
    var ci = i <= 4 ? 0 : 1, cj = j <= 4 ? 0 : 1, qi = (i - 1) % 4, qj = (j - 1) % 4; // q: 0 UL, 1 UR, 2 LL, 3 LR
    if (ci === cj) { if (qi + qj === 3) return 'vertical'; return 'linear pair'; }
    if (qi === qj) return 'corresponding';
    var top = ci === 0 ? qi : qj, bot = ci === 0 ? qj : qi; // top crossing quadrant, bottom crossing quadrant
    var inTop = top >= 2, inBot = bot <= 1; // interior: between the lines
    var sideTop = top % 2, sideBot = bot % 2; // 0 left of t, 1 right of t
    if (inTop && inBot) return sideTop === sideBot ? 'same-side interior' : 'alternate interior';
    if (!inTop && !inBot) return sideTop === sideBot ? 'same-side exterior' : 'alternate exterior';
    return null;
  }
  var REL_EQUAL = { vertical: true, corresponding: true, 'alternate interior': true, 'alternate exterior': true, 'linear pair': false, 'same-side interior': false, 'same-side exterior': false };

  /* ================================================================ Unit: Tools of Geometry */

  G('geo.points-lines-planes', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['segadd', 'post', 'ray', 'segadd'], ['segalg', 'post', 'ray', 'assume'], ['seglen', 'count', 'assume', 'post']));
    var L = letters(R, 3), A = L[0], B = L[1], C = L[2];
    if (kind === 'segadd') {
      var ab = R.int(3, 19), bc = R.int(3, 19), ac = ab + bc, rev = R.coin();
      var fo = { pts: {}, segs: [[A, B, { lab: String(ab) }], [B, C, { lab: rev ? '?' : String(bc) }]], labpos: {}, texts: [[ac / 2, -ac * 0.1, 'whole: ' + (rev ? ac : '?'), { color: 'blue' }]], height: 130 };
      fo.pts[A] = [0, 0]; fo.pts[B] = [ab, 0]; fo.pts[C] = [ac, 0]; [A, B, C].forEach(function (n) { fo.labpos[n] = 'n'; });
      var f = fig(fo, 'Points ' + A + ', ' + B + ', ' + C + ' on a line in that order');
      return rev ? {
        q: 'Points ' + A + ', ' + B + ' and ' + C + ' are collinear, and ' + B + ' is between ' + A + ' and ' + C + '. If $' + A + C + ' = ' + ac + '$ and $' + A + B + ' = ' + ab + '$, find $' + B + C + '$.',
        a: num(bc), viz: f,
        steps: ['Because ' + B + ' is between ' + A + ' and ' + C + ', the Segment Addition Postulate says $' + A + B + ' + ' + B + C + ' = ' + A + C + '$.', 'Substitute: $' + ab + ' + ' + B + C + ' = ' + ac + '$.', 'Subtract ' + ab + ': $' + B + C + ' = ' + bc + '$.'],
        hint: 'The two parts add up to the whole segment.'
      } : {
        q: 'Points ' + A + ', ' + B + ' and ' + C + ' are collinear, and ' + B + ' is between ' + A + ' and ' + C + '. If $' + A + B + ' = ' + ab + '$ and $' + B + C + ' = ' + bc + '$, find $' + A + C + '$.',
        a: num(ac),
        steps: ['Because ' + B + ' is between ' + A + ' and ' + C + ', the Segment Addition Postulate says $' + A + C + ' = ' + A + B + ' + ' + B + C + '$.', '$' + A + C + ' = ' + ab + ' + ' + bc + ' = ' + ac + '$.'],
        hint: 'The whole segment is the sum of its two parts.'
      };
    }
    if (kind === 'segalg' || kind === 'seglen') {
      var xv = R.int(2, 9), e1 = expr(R, xv, R.int(5, 30), 2, 5), e2 = expr(R, xv, R.int(5, 30), 1, 4), tot = e1.a * xv + e1.b + e2.a * xv + e2.b;
      var askLen = kind === 'seglen';
      var st = sumSteps([e1, e2], tot, xv);
      st[0] = 'By the Segment Addition Postulate, $' + A + B + ' + ' + B + C + ' = ' + A + C + '$, so $(' + e1.tex + ') + (' + e2.tex + ') = ' + tot + '$.';
      if (askLen) st.push('Substitute $x = ' + xv + '$: $' + A + B + ' = ' + e1.a + '(' + xv + ')' + T.signed(e1.b) + ' = ' + (e1.a * xv + e1.b) + '$. Check: $' + (e1.a * xv + e1.b) + ' + ' + (e2.a * xv + e2.b) + ' = ' + tot + '$.');
      return {
        q: B + ' is between ' + A + ' and ' + C + ' on a line. $' + A + B + ' = ' + e1.tex + '$, $' + B + C + ' = ' + e2.tex + '$ and $' + A + C + ' = ' + tot + '$. ' + (askLen ? 'Find $' + A + B + '$.' : 'Find $x$.'),
        a: num(askLen ? e1.a * xv + e1.b : xv), steps: st,
        hint: 'Write part + part = whole, then solve for $x$.'
      };
    }
    if (kind === 'post') {
      var bank = [
        ['How many lines pass through two different points?', 'Exactly one', ['Exactly two', 'Infinitely many', 'None'], 'Through any two points there is exactly one line (a postulate: we accept it without proof).'],
        ['Two different lines intersect. How many points can they have in common?', 'Exactly one', ['Exactly two', 'Infinitely many', 'It depends on the lines'], 'If two lines shared two points, they would be the same line, because two points determine one line.'],
        ['Two different planes intersect. What is their intersection?', 'A line', ['A point', 'A plane', 'A segment'], 'When two planes meet, they meet in a line (think of two walls meeting at a corner line).'],
        ['How many planes contain three points that are not on one line?', 'Exactly one', ['Exactly two', 'Infinitely many', 'None'], 'Three noncollinear points determine exactly one plane (that is why a three-legged stool never wobbles).'],
        ['How many planes contain three points that are all on one line?', 'Infinitely many', ['Exactly one', 'Exactly three', 'None'], 'A line lies in infinitely many planes, like the pages of a book turning around its spine.'],
        ['Two points of a line lie in a plane. What must be true of the line?', 'The whole line lies in the plane', ['The line crosses the plane at one point', 'The line is parallel to the plane', 'Only the two points are in the plane'], 'If two points lie in a plane, the line through them lies in that plane (a postulate).'],
        ['Which of these is an undefined term in geometry?', 'Point', ['Segment', 'Ray', 'Angle'], 'Point, line and plane are undefined terms: we describe them and build every other definition from them.'],
        ['Which is the definition of a segment $\\overline{AB}$?', 'Points A and B and all the points between them on line AB', ['All the points on line AB', 'Point A and all the points on line AB on the same side of A as B', 'The distance from A to B'], 'A segment has two endpoints and contains every point between them.']
      ];
      var b = R.pick(bank);
      return { q: b[0], a: mc(b[1], b[2]), steps: [b[3]], hint: 'Think about what the basic postulates say about points, lines and planes.' };
    }
    if (kind === 'ray') {
      var L4 = letters(R, 4), P = L4[0], Qn = L4[1], S = L4[2], Tn = L4[3];
      var f2 = { pts: {}, rays: [], labpos: {}, height: 120 }; f2.pts[P] = [0, 0]; f2.pts[Qn] = [3, 0]; f2.pts[S] = [6, 0]; f2.pts[Tn] = [9, 0]; f2.lines = [[P, Tn]];[P, Qn, S, Tn].forEach(function (n) { f2.labpos[n] = 'n'; });
      var t = R.int(0, 2);
      if (t === 0) return {
        q: 'Points ' + P + ', ' + Qn + ', ' + S + ' and ' + Tn + ' lie on a line in that order. Which ray is the same as $\\overrightarrow{' + Qn + S + '}$?',
        a: mc('$\\overrightarrow{' + Qn + Tn + '}$', ['$\\overrightarrow{' + S + Qn + '}$', '$\\overrightarrow{' + Qn + P + '}$', '$\\overrightarrow{' + S + Tn + '}$']), viz: fig(f2, 'Four points on a line'),
        steps: ['$\\overrightarrow{' + Qn + S + '}$ starts at ' + Qn + ' and goes through ' + S + ', on toward ' + Tn + '.', '$\\overrightarrow{' + Qn + Tn + '}$ also starts at ' + Qn + ' and goes the same way, so it is the same ray.', 'A ray is named by its endpoint first, so $\\overrightarrow{' + S + Qn + '}$ (endpoint ' + S + ') is a different ray.'],
        hint: 'The first letter is the endpoint. Which ray starts at the same point and points the same way?'
      };
      if (t === 1) return {
        q: 'Points ' + P + ', ' + Qn + ', ' + S + ' and ' + Tn + ' lie on a line in that order. Which pair are opposite rays?',
        a: mc('$\\overrightarrow{' + Qn + P + '}$ and $\\overrightarrow{' + Qn + S + '}$', ['$\\overrightarrow{' + P + Qn + '}$ and $\\overrightarrow{' + Qn + S + '}$', '$\\overrightarrow{' + Qn + S + '}$ and $\\overrightarrow{' + Qn + Tn + '}$', '$\\overrightarrow{' + Qn + P + '}$ and $\\overrightarrow{' + S + Tn + '}$']), viz: fig(f2, 'Four points on a line'),
        steps: ['Opposite rays share the same endpoint and point in opposite directions along one line.', '$\\overrightarrow{' + Qn + P + '}$ and $\\overrightarrow{' + Qn + S + '}$ both start at ' + Qn + ': one goes left and one goes right.'],
        hint: 'Opposite rays have the same endpoint.'
      };
      return {
        q: 'Points ' + P + ', ' + Qn + ', ' + S + ' and ' + Tn + ' lie on a line in that order. Which name does NOT describe the same line?',
        a: mc('$\\overrightarrow{' + Qn + S + '}$', ['$\\overleftrightarrow{' + P + Tn + '}$', '$\\overleftrightarrow{' + S + Qn + '}$', '$\\overleftrightarrow{' + Tn + P + '}$']), viz: fig(f2, 'Four points on a line'),
        steps: ['Any two of the points name the whole line, in either order: $\\overleftrightarrow{' + P + Tn + '}$, $\\overleftrightarrow{' + S + Qn + '}$ and $\\overleftrightarrow{' + Tn + P + '}$ all work.', '$\\overrightarrow{' + Qn + S + '}$ has an arrow on one end only: it is a ray, which stops at ' + Qn + '.'],
        hint: 'Look at the arrows over the letters.'
      };
    }
    if (kind === 'count') {
      var n = R.int(4, 9), lines = n * (n - 1) / 2;
      return {
        q: 'There are ' + n + ' points in a plane, and no three of them are on one line. How many different lines can be drawn through two of the points?',
        a: num(lines),
        steps: ['Each pair of points determines exactly one line, and no line holds three points, so each pair gives a different line.', 'Each of the ' + n + ' points pairs with the other ' + (n - 1) + ': $' + n + ' \\cdot ' + (n - 1) + ' = ' + n * (n - 1) + '$.', 'That counts every pair twice (once from each end), so there are $' + n * (n - 1) + ' \\div 2 = ' + lines + '$ lines.'],
        hint: 'Count the pairs of points. Each pair gives one line.'
      };
    }
    // assume: what a diagram does and does not tell you
    var good = R.pick(['Points that are drawn on a line are on that line (they are collinear)', 'A point drawn between two others on a segment is between them', 'Lines that are drawn crossing meet at a point']);
    var bad = ['Segments that look the same length are congruent', 'Angles that look like right angles are right angles', 'Lines that look parallel are parallel', 'A point that looks like a midpoint is the midpoint', 'Angles that look equal are congruent'];
    return {
      q: 'A diagram has no tick marks, right-angle marks or arrows on it. Which of these may you conclude just from the drawing?',
      a: mc(good, R.sample(bad, 3)),
      steps: ['A drawing reliably shows how points sit on lines: which points are collinear, which are between others, and where lines cross.', 'Sizes are different: lengths, angle measures, parallel lines and right angles must be given (in words or with marks) or proved. A drawing can look right and still be off.'],
      hint: 'A sketch shows position, but not exact size.'
    };
  });

  G('geo.distance-midpoint', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['dist', 'mid', 'numline', 'dist'], ['dist', 'mid', 'end', 'dist'], ['dist', 'end', 'mid', 'end']));
    var A, B, dx, dy;
    if (kind === 'numline') {
      var a = R.int(-15, 5), b = a + 2 * R.int(2, 10);
      return { q: 'On a number line, point $A$ is at $' + a + '$ and point $B$ is at $' + b + '$. Find the coordinate of the midpoint of $' + seg('AB') + '$.', a: num((a + b) / 2),
        steps: ['The midpoint is the average of the endpoints.', '$\\dfrac{' + a + ' + ' + T.p(b) + '}{2} = \\dfrac{' + (a + b) + '}{2} = ' + (a + b) / 2 + '$.', 'Check: it is $' + (b - a) / 2 + '$ from each end.'], hint: 'Add the two coordinates and divide by 2.' };
    }
    if (kind === 'dist') {
      var lv = ctx.level || 1, trip = lv === 1 || R.chance(0.3);
      if (trip) { var tr = R.pick([[3, 4], [6, 8], [5, 12], [8, 6], [4, 3], [12, 5], [8, 15], [9, 12]]); dx = tr[0] * R.sign(); dy = tr[1] * R.sign(); }
      else { do { dx = R.nz(-8, 8); dy = R.nz(-8, 8); } while (U.isSquare(dx * dx + dy * dy) || M.abs(dx) === M.abs(dy) && R.chance(0.5)); }
      A = [R.int(-6, 6 - M.max(0, dx)), R.int(-5, 5 - M.max(0, dy))]; A[0] = M.max(-8, M.min(8, A[0])); A[1] = M.max(-7, M.min(7, A[1])); B = [A[0] + dx, A[1] + dy];
      var N = dx * dx + dy * dy, d = sqrtN(N);
      var f = fig({ pts: { A: A, B: B, C: [B[0], A[1]] }, hide: ['C'], segs: [['A', 'B', { color: 'blue', w: 3 }], ['A', 'C', { dash: 1, lab: String(M.abs(dx)), color: 'muted' }], ['C', 'B', { dash: 1, lab: String(M.abs(dy)), color: 'muted' }]], axes: true, coords: true, height: 260 }, 'Points A and B on a coordinate grid');
      var st = ['Use $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$, which is the Pythagorean theorem on the right triangle under the segment.',
        'Differences: $x_2 - x_1 = ' + B[0] + ' - ' + T.p(A[0]) + ' = ' + dx + '$ and $y_2 - y_1 = ' + B[1] + ' - ' + T.p(A[1]) + ' = ' + dy + '$.',
        'Square and add: $' + T.p(dx) + '^2 + ' + T.p(dy) + '^2 = ' + dx * dx + ' + ' + dy * dy + ' = ' + N + '$.',
        'Take the square root: $d = \\sqrt{' + N + '}' + (d.r === N ? '' : ' = ' + rtex(d)) + '$.'];
      return { q: 'Find the distance between $A' + pt(A) + '$ and $B' + pt(B) + '$. Give an exact answer in simplest form.', a: rnum(d), viz: lv === 1 ? f : undefined, steps: st, hint: 'Square the change in $x$ and the change in $y$ (both are positive once squared), add, then take the square root.', chk: { A: A, B: B } };
    }
    if (kind === 'mid') {
      A = [R.int(-9, 9), R.int(-9, 9)]; do { B = [R.int(-9, 9), R.int(-9, 9)]; } while (B[0] === A[0] && B[1] === A[1]);
      if ((ctx.level || 1) === 1) { if ((A[0] + B[0]) % 2) B[0] += B[0] < 9 ? 1 : -1; if ((A[1] + B[1]) % 2) B[1] += B[1] < 9 ? 1 : -1; }
      var Mx = tq((A[0] + B[0]) / 2), My = tq((A[1] + B[1]) / 2);
      return { q: 'Find the midpoint $M$ of the segment from $A' + pt(A) + '$ to $B' + pt(B) + '$.', a: { t: 'tuple', v: [Mx, My] },
        steps: ['The midpoint averages the coordinates: $M = \\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$.', '$x$: $\\dfrac{' + A[0] + ' + ' + T.p(B[0]) + '}{2} = \\dfrac{' + (A[0] + B[0]) + '}{2} = ' + T.num(Mx) + '$.', '$y$: $\\dfrac{' + A[1] + ' + ' + T.p(B[1]) + '}{2} = \\dfrac{' + (A[1] + B[1]) + '}{2} = ' + T.num(My) + '$.', 'So $M = ' + T.pt([Mx, My]) + '$.'],
        hint: 'Add, then divide by 2. (Subtracting gives the change, not the middle.)', chk: { A: A, B: B } };
    }
    // end: the other endpoint from a midpoint
    A = [R.int(-8, 8), R.int(-8, 8)]; var Mm; do { Mm = [R.int(-6, 6), R.int(-6, 6)]; } while (Mm[0] === A[0] && Mm[1] === A[1]);
    B = [2 * Mm[0] - A[0], 2 * Mm[1] - A[1]];
    return { q: '$M' + pt(Mm) + '$ is the midpoint of $' + seg('AB') + '$, and $A = ' + pt(A) + '$. Find the coordinates of $B$.', a: { t: 'tuple', v: [String(B[0]), String(B[1])] },
      steps: ['From $A$ to $M$, $x$ changes by $' + Mm[0] + ' - ' + T.p(A[0]) + ' = ' + (Mm[0] - A[0]) + '$ and $y$ changes by $' + Mm[1] + ' - ' + T.p(A[1]) + ' = ' + (Mm[1] - A[1]) + '$.', 'Because $M$ is halfway, take the same step again from $M$: $B = (' + Mm[0] + T.signed(Mm[0] - A[0]) + ', ' + Mm[1] + T.signed(Mm[1] - A[1]) + ') = ' + pt(B) + '$.', 'Check: the average of $' + A[0] + '$ and $' + B[0] + '$ is $' + Mm[0] + '$, and the average of $' + A[1] + '$ and $' + B[1] + '$ is $' + Mm[1] + '$.'],
      hint: 'Go from A to M, then take the same step again.', chk: { A: A, M: Mm } };
  });

  G('geo.angles-bisectors', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['add', 'sub', 'classify', 'bis1'], ['bisx', 'addx', 'bis1', 'sub'], ['bisang', 'addx', 'bisx', 'bisang']));
    function rayFig(a1, a2, labs, bis) { // rays BA (angle 0), BD (a1), BC (a1 + a2) from vertex B
      var t1 = a1 * M.PI / 180, t2 = (a1 + a2) * M.PI / 180, rot0 = R.int(-15, 25) * M.PI / 180;
      function P(t) { return [5 * M.cos(t + rot0), 5 * M.sin(t + rot0)]; }
      return fig({ pts: { B: [0, 0], A: P(0), D: P(t1), C: P(t2) }, rays: [['B', 'A'], ['B', 'D', { color: 'blue' }], ['B', 'C']], angs: [['A', 'B', 'D', { lab: labs[0], r: 34 }], ['D', 'B', 'C', { lab: labs[1], color: 'blue', r: 26, n: bis ? 1 : 1 }]], win: undefined, height: 230 }, 'Three rays from B: BA, BD and BC, with D inside angle ABC');
    }
    if (kind === 'add' || kind === 'sub') {
      var a = R.int(15, 80), b = R.int(15, 80), tot = a + b;
      if (kind === 'add') return { q: 'Point $D$ is in the interior of $' + ang('ABC') + '$. If $' + mang('ABD') + ' = ' + deg(a) + '$ and $' + mang('DBC') + ' = ' + deg(b) + '$, find $' + mang('ABC') + '$.', a: num(tot), viz: rayFig(a, b, [a + '°', b + '°']),
        steps: ['$D$ is inside the angle, so the Angle Addition Postulate gives $' + mang('ABC') + ' = ' + mang('ABD') + ' + ' + mang('DBC') + '$.', '$' + mang('ABC') + ' = ' + a + ' + ' + b + ' = ' + deg(tot) + '$.'], hint: 'The two smaller angles fill the bigger one.' };
      return { q: 'Point $D$ is in the interior of $' + ang('ABC') + '$. If $' + mang('ABC') + ' = ' + deg(tot) + '$ and $' + mang('ABD') + ' = ' + deg(a) + '$, find $' + mang('DBC') + '$.', a: num(b), viz: rayFig(a, b, [a + '°', '?']),
        steps: ['By the Angle Addition Postulate, $' + mang('ABD') + ' + ' + mang('DBC') + ' = ' + mang('ABC') + '$.', '$' + a + ' + ' + mang('DBC') + ' = ' + tot + '$, so $' + mang('DBC') + ' = ' + tot + ' - ' + a + ' = ' + deg(b) + '$.'], hint: 'Part + part = whole.' };
    }
    if (kind === 'classify') {
      var m = R.pick([R.int(5, 89), R.int(5, 89), 90, R.int(91, 179), R.int(91, 179), 180]), name = m < 90 ? 'Acute' : m === 90 ? 'Right' : m < 180 ? 'Obtuse' : 'Straight';
      return { q: 'An angle measures $' + deg(m) + '$. How do you classify it?', a: { t: 'mc', choices: ['Acute', 'Right', 'Obtuse', 'Straight'], v: ['Acute', 'Right', 'Obtuse', 'Straight'].indexOf(name), keep: true },
        steps: ['Acute: less than $90^\\circ$. Right: exactly $90^\\circ$. Obtuse: between $90^\\circ$ and $180^\\circ$. Straight: exactly $180^\\circ$.', '$' + deg(m) + '$ is ' + name.toLowerCase() + '.'], hint: 'Compare the measure with 90° and 180°.' };
    }
    if (kind === 'bis1') {
      var h = R.int(12, 85), whole = R.coin();
      return whole ? { q: '$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$, and $' + mang('ABD') + ' = ' + deg(h) + '$. Find $' + mang('ABC') + '$.', a: num(2 * h), viz: rayFig(h, h, [h + '°', '']),
        steps: ['A bisector splits an angle into two congruent angles, so $' + mang('DBC') + ' = ' + mang('ABD') + ' = ' + deg(h) + '$.', '$' + mang('ABC') + ' = ' + h + ' + ' + h + ' = ' + deg(2 * h) + '$.'], hint: 'The bisector makes two equal halves.' }
        : { q: '$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$, and $' + mang('ABC') + ' = ' + deg(2 * h) + '$. Find $' + mang('DBC') + '$.', a: num(h), viz: rayFig(h, h, ['', '?']),
          steps: ['A bisector splits the angle into two congruent halves.', '$' + mang('DBC') + ' = ' + (2 * h) + ' \\div 2 = ' + deg(h) + '$.'], hint: 'Half of the whole angle.' };
    }
    if (kind === 'bisx' || kind === 'bisang') {
      var xv = R.int(3, 14), P = eqPair(R, xv, 18, 75), e1 = { a: P.a, b: P.b }, e2 = { a: P.c, b: P.d };
      var st = ['A bisector makes two congruent angles: $' + mang('ABD') + ' = ' + mang('DBC') + '$.'].concat(solveSteps(e1, e2, xv));
      if (kind === 'bisang') st.push('Each half is $' + lin(P.a, P.b).replace('x', '(' + xv + ')') + ' = ' + P.val + '^\\circ$, so $' + mang('ABC') + ' = 2 \\cdot ' + P.val + ' = ' + deg(2 * P.val) + '$.');
      return { q: '$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$. $' + mang('ABD') + ' = (' + lin(P.a, P.b) + ')^\\circ$ and $' + mang('DBC') + ' = (' + lin(P.c, P.d) + ')^\\circ$. ' + (kind === 'bisang' ? 'Find $' + mang('ABC') + '$.' : 'Find $x$.'),
        a: num(kind === 'bisang' ? 2 * P.val : xv), viz: rayFig(P.val, P.val, ['(' + lin(P.a, P.b) + ')°', '(' + lin(P.c, P.d) + ')°']), steps: st, hint: 'Set the two halves equal to each other.' };
    }
    // addx: angle addition with algebra
    var xv2 = R.int(3, 12), e3 = expr(R, xv2, R.int(20, 60), 2, 5), e4 = expr(R, xv2, R.int(20, 60), 1, 4), tot2 = e3.a * xv2 + e3.b + e4.a * xv2 + e4.b;
    var st2 = sumSteps([e3, e4], tot2, xv2); st2[0] = 'By the Angle Addition Postulate, $' + mang('ABD') + ' + ' + mang('DBC') + ' = ' + mang('ABC') + '$: $(' + e3.tex + ') + (' + e4.tex + ') = ' + tot2 + '$.';
    return { q: '$D$ is in the interior of $' + ang('ABC') + '$, $' + mang('ABD') + ' = (' + e3.tex + ')^\\circ$, $' + mang('DBC') + ' = (' + e4.tex + ')^\\circ$ and $' + mang('ABC') + ' = ' + deg(tot2) + '$. Find $x$.', a: num(xv2), steps: st2, hint: 'Part + part = whole, then solve.' };
  });

  G('geo.basic-constructions', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['concept', 'half', 'order', 'copy'], ['order', 'concept', 'quarter', 'error'], ['order', 'error', 'quarter', 'concept']));
    if (kind === 'half' || kind === 'quarter') {
      var m = kind === 'half' ? 2 * R.int(15, 85) : 4 * R.int(8, 44), q = kind === 'half' ? m / 2 : m / 4;
      return kind === 'half' ? { q: 'You bisect an angle that measures $' + deg(m) + '$ with a compass and straightedge. What is the measure of each new angle?', a: num(q), steps: ['Bisecting splits the angle into two congruent angles.', '$' + m + ' \\div 2 = ' + deg(q) + '$.'], hint: 'Bisect means cut into two equal parts.' }
        : { q: 'You bisect a $' + deg(m) + '$ angle, then bisect one of the two halves. What is the measure of each of the smallest angles?', a: num(q), steps: ['The first bisection gives two angles of $' + m + ' \\div 2 = ' + deg(m / 2) + '$.', 'Bisecting one of those gives two angles of $' + (m / 2) + ' \\div 2 = ' + deg(q) + '$.', 'That is one quarter of the original angle.'], hint: 'Halve it, then halve again.' };
    }
    if (kind === 'copy') {
      var s = R.real(2.1, 9.8, 1), k = R.int(2, 4);
      return { q: 'Segment $AB$ is $' + T.num(s) + '$ cm long. Starting at $C$, you copy $' + seg('AB') + '$ onto a ray ' + U.words(k) + ' times, end to end, without changing the compass width. How long is the new segment, in centimeters?', a: num(U.fix(s * k)),
        steps: ['Each copy has the same length as $' + seg('AB') + '$, because the compass width never changes.', U.words(k).replace(/^./, function (c) { return c.toUpperCase(); }) + ' copies: $' + k + ' \\times ' + T.num(s) + ' = ' + T.num(U.fix(s * k)) + '$ cm.'], hint: 'Each copy is exactly as long as AB.' };
    }
    if (kind === 'order') {
      var which = R.pick(['bisect', 'copyang', 'copyseg']), steps, title;
      if (which === 'bisect') { title = 'bisect $' + ang('A') + '$'; steps = ['With the compass on $A$, draw an arc crossing both sides at $P$ and $Q$.', 'With the compass on $P$, draw an arc inside the angle.', 'With the same width and the compass on $Q$, draw an arc crossing the last one at $X$.', 'Draw the ray from $A$ through $X$.']; }
      else if (which === 'copyang') { title = 'copy $' + ang('A') + '$ onto a ray from $D$'; steps = ['With the compass on $A$, draw an arc crossing both sides at $P$ and $Q$.', 'With the same width and the compass on $D$, draw an arc crossing the ray at $R$.', 'Set the compass to the distance $PQ$; with it on $R$, mark $S$ on the arc.', 'Draw the ray from $D$ through $S$.']; }
      else { title = 'copy $' + seg('AB') + '$ onto a ray from $C$'; steps = ['Put the compass point on $A$.', 'Open the compass so the pencil is on $B$.', 'Without changing the width, put the compass point on $C$.', 'Swing an arc across the ray and label the crossing $D$.']; }
      var lab = ['P', 'Q', 'R', 'S'], perm = R.shuffle([0, 1, 2, 3]); while (perm.every(function (v, i) { return v === i; })) perm = R.shuffle([0, 1, 2, 3]);
      // shown step i (letter lab[i]) is the real step perm[i]; the right order lists letters by real step
      var order = [0, 1, 2, 3].map(function (r) { return lab[perm.indexOf(r)]; }).join(', ');
      var wrongs = []; for (var t = 0; t < 40 && wrongs.length < 3; t++) { var w = R.shuffle(lab).join(', '); if (w !== order && wrongs.indexOf(w) < 0) wrongs.push(w); }
      return { q: 'Put the steps in order to ' + title + ':<br>' + [0, 1, 2, 3].map(function (i) { return '(' + lab[i] + ') ' + steps[perm[i]]; }).join('<br>'), a: mc(order, wrongs),
        steps: ['The right order is ' + order + ':'].concat(steps.map(function (s, i) { return (i + 1) + '. ' + s; })), hint: 'What must exist before each step can happen? Start with the arc from the vertex or endpoint you are given.' };
    }
    if (kind === 'error') {
      var e = R.pick([
        ['Jo is bisecting $' + ang('A') + '$. After drawing the arc from $P$, she widens the compass before drawing the arc from $Q$. What goes wrong?', 'The crossing point is no longer the same distance from $P$ and $Q$, so the ray may not split the angle in half.', ['Nothing: any arcs that cross give the bisector.', 'The arcs can never cross.', 'The ray becomes perpendicular to a side.'], 'The bisector works because $PX = QX$ (both are the same compass width). With two widths, $PX \\neq QX$, the triangles are not congruent, and the two angles can differ.'],
        ['Sam copies $' + seg('AB') + '$ onto a ray from $C$. He closes the compass a little while moving it from $A$ to $C$. What is true about his copy $' + seg('CD') + '$?', '$CD$ is shorter than $AB$.', ['$CD = AB$, because he used a compass.', '$CD$ is longer than $AB$.', '$CD = AB$, because both start at a point.'], 'The compass carries the length. Closing it changes the length it carries, so the copy comes out shorter.'],
        ['Kai bisects $' + seg('AB') + '$ but opens the compass to less than half of $AB$. What happens?', 'The arcs from $A$ and $B$ do not cross, so there are no points to connect.', ['The arcs cross at the midpoint.', 'The construction still works.', 'He gets a line parallel to $' + seg('AB') + '$.'], 'Two circles with radii smaller than half of $AB$ cannot reach each other, so they never meet.']
      ]);
      return { q: e[0], a: mc(e[1], e[2]), steps: [e[3]], hint: 'What does the compass width guarantee in this construction?' };
    }
    var c = R.pick([
      ['Why does the angle-bisector construction work?', 'Two triangles it creates are congruent by SSS, so the two angles at the vertex are equal.', ['The arcs are curved.', 'The ray is drawn with a straightedge.', 'Any ray inside an angle bisects it.']],
      ['When you copy a segment, what does the compass carry from one place to another?', 'A length', ['An angle', 'A point', 'A direction']],
      ['In the angle-bisector construction, which two arcs must use the same compass width?', 'The arcs drawn from $P$ and from $Q$', ['The arc from $A$ and the arc from $P$', 'Only the first arc', 'None of them']],
      ['When you copy an angle, which triangles are congruent, and why?', 'The triangle at the original angle and the one at the copy, by SSS', ['They are congruent by AAA.', 'No triangles are involved.', 'Only right triangles, by HL.']],
      ['In a compass-and-straightedge construction, what is the straightedge used for?', 'Drawing lines and segments through points', ['Measuring lengths', 'Measuring angles', 'Drawing circles']]
    ]);
    return { q: c[0], a: mc(c[1], c[2]), steps: ['The compass copies lengths (every arc from one center has the same radius), the straightedge draws lines, and congruent triangles explain why the results are exact.', 'Answer: ' + c[1]], hint: 'Each compass arc keeps one distance fixed.' };
  });

  G('geo.perpendicular-parallel-constructions', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['equi', 'concept', 'mid'], ['equix', 'midslope', 'concept', 'order'], ['eqn', 'equix', 'concept', 'order']));
    if (kind === 'equi') { var d = R.int(4, 25); return { q: 'Point $P$ lies on the perpendicular bisector of $' + seg('AB') + '$, and $PA = ' + d + '$. Find $PB$.', a: num(d), steps: ['Every point on the perpendicular bisector of a segment is the same distance from both endpoints.', 'So $PB = PA = ' + d + '$.'], hint: 'That is exactly why the construction uses equal arcs from A and B.' }; }
    if (kind === 'equix') { var xv = R.int(2, 9), P = eqPair(R, xv, 8, 40), st = ['$P$ is on the perpendicular bisector, so $PA = PB$.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)); st.push('Then $PA = ' + P.val + '$.'); return { q: 'Point $P$ is on the perpendicular bisector of $' + seg('AB') + '$. $PA = ' + lin(P.a, P.b) + '$ and $PB = ' + lin(P.c, P.d) + '$. Find $PA$.', a: num(P.val), steps: st, hint: 'Points on the perpendicular bisector are equally far from A and B.' }; }
    var A = [R.int(-7, 5), R.int(-7, 5)], p = R.nz(-4, 4), q = R.nz(-4, 4), B = [A[0] + 2 * p, A[1] + 2 * q], Mm = [A[0] + p, A[1] + q];
    var sl = U.reduce(q, p), ps = U.reduce(-p, q), psT = T.frac(-p, q), slT = T.frac(q, p);
    if (kind === 'mid' || kind === 'midslope') {
      if (kind === 'mid') return { q: 'The perpendicular bisector of $' + seg('AB') + '$ passes through its midpoint. Find that point for $A' + pt(A) + '$ and $B' + pt(B) + '$.', a: { t: 'tuple', v: [String(Mm[0]), String(Mm[1])] }, steps: ['Average the coordinates: $\\left(\\dfrac{' + A[0] + ' + ' + T.p(B[0]) + '}{2}, \\dfrac{' + A[1] + ' + ' + T.p(B[1]) + '}{2}\\right) = ' + pt(Mm) + '$.'], hint: 'The midpoint averages the coordinates.' };
      return { q: 'Find the slope of the perpendicular bisector of the segment from $A' + pt(A) + '$ to $B' + pt(B) + '$.', a: num(qplain(-p, q)),
        steps: ['Slope of $' + seg('AB') + '$: $\\dfrac{' + B[1] + ' - ' + T.p(A[1]) + '}{' + B[0] + ' - ' + T.p(A[0]) + '} = \\dfrac{' + 2 * q + '}{' + 2 * p + '} = ' + slT + '$.', 'A perpendicular line has the negative reciprocal slope: $' + psT + '$.', 'Check: $' + T.p(slT) + ' \\cdot ' + T.p(psT) + ' = -1$.'], hint: 'Find the slope of AB first, then flip it and change its sign.' };
    }
    if (kind === 'eqn') {
      var b = ML.Q(Mm[1]).sub(ML.Q(-p, q).mul(Mm[0])), bT = b.toTex(), mPl = qplain(-p, q);
      return { q: 'Write an equation of the perpendicular bisector of the segment from $A' + pt(A) + '$ to $B' + pt(B) + '$.', a: { t: 'eq', v: 'y = ' + mPl + '*x + ' + '(' + b.toPlain() + ')' },
        steps: ['Midpoint: $M = ' + pt(Mm) + '$. The bisector passes through it.', 'Slope of $' + seg('AB') + '$ is $' + slT + '$, so the perpendicular slope is $' + psT + '$.', 'Point-slope form: $y' + T.signed(-Mm[1]) + ' = ' + psT + '(x' + T.signed(-Mm[0]) + ')$.', 'Slope-intercept form: $y = ' + T.lin(ML.Q(-p, q), 'x', b) + '$.'], hint: 'You need a point (the midpoint) and a slope (perpendicular to AB).' };
    }
    if (kind === 'order') {
      var lab = ['P', 'Q', 'R', 'S'], ss = R.pick([
        ['construct the line through $P$ perpendicular to line $\\ell$ ($P$ is not on $\\ell$)', ['With the compass on $P$, draw an arc crossing $\\ell$ at $A$ and $B$.', 'From $A$, draw an arc on the other side of $\\ell$.', 'With the same width, draw an arc from $B$ crossing the last one at $X$.', 'Draw the line through $P$ and $X$.']],
        ['construct the perpendicular bisector of $' + seg('AB') + '$', ['Open the compass to more than half of $AB$.', 'With the compass on $A$, draw arcs above and below the segment.', 'With the same width, draw arcs from $B$ crossing them at $X$ and $Y$.', 'Draw line $XY$.']],
        ['construct the line through $P$ parallel to line $\\ell$', ['Draw a line through $P$ that crosses $\\ell$ at $Q$.', 'With the compass on $Q$, draw an arc crossing both lines.', 'With the same width, draw the matching arc at $P$.', 'Copy the angle at $Q$ to $P$ (same position) and draw the new line.']]
      ]);
      var perm = R.shuffle([0, 1, 2, 3]); while (perm.every(function (v, i) { return v === i; })) perm = R.shuffle([0, 1, 2, 3]);
      var order = [0, 1, 2, 3].map(function (r) { return lab[perm.indexOf(r)]; }).join(', '), wrongs = [];
      for (var t = 0; t < 40 && wrongs.length < 3; t++) { var w = R.shuffle(lab).join(', '); if (w !== order && wrongs.indexOf(w) < 0) wrongs.push(w); }
      return { q: 'Put the steps in order to ' + ss[0] + ':<br>' + [0, 1, 2, 3].map(function (i) { return '(' + lab[i] + ') ' + ss[1][perm[i]]; }).join('<br>'), a: mc(order, wrongs), steps: ['The right order is ' + order + ':'].concat(ss[1].map(function (s, i) { return (i + 1) + '. ' + s; })), hint: 'Each step uses points made by the step before it.' };
    }
    var c = R.pick([
      ['To construct a line through $P$ parallel to $\\ell$, you copy an angle. Which angle pair does the copy make congruent?', 'Corresponding angles', ['Vertical angles', 'Same-side interior angles', 'Complementary angles'], 'The copied angle sits in the same position at $P$ as the original at $Q$: corresponding angles.'],
      ['Why is the line from the parallel construction parallel to $\\ell$?', 'Corresponding angles are congruent, so by the converse of the Corresponding Angles Theorem the lines are parallel.', ['Because it was drawn with a straightedge.', 'Because parallel lines have congruent corresponding angles.', 'Because the lines look parallel.'], 'We make the angles congruent first and then conclude the lines are parallel. That is the converse.'],
      ['In the perpendicular-bisector construction, why is the crossing point $X$ on the bisector?', '$X$ is the same distance from $A$ and $B$ (both arcs have the same radius).', ['$X$ is above the midpoint.', '$X$ is on the segment.', 'The arcs are perpendicular.'], 'Equal arcs from $A$ and $B$ make $XA = XB$, and every point equally far from $A$ and $B$ is on the perpendicular bisector.'],
      ['To drop a perpendicular from $P$ to line $\\ell$, what is the first step?', 'Draw an arc centered at $P$ that crosses $\\ell$ in two points.', ['Draw a line through $P$ parallel to $\\ell$.', 'Measure the distance from $P$ to $\\ell$.', 'Bisect an angle at $P$.'], 'The two crossings $A$ and $B$ are equally far from $P$. The perpendicular bisector of $AB$ then goes through $P$.']
    ]);
    return { q: c[0], a: mc(c[1], c[2]), steps: [c[3]], hint: 'Think about which equal distances or equal angles the arcs create.' };
  });

  G('geo.inscribed-constructions', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['hexper', 'central', 'concept'], ['sq', 'central', 'concept', 'sqarea'], ['tri', 'sq', 'dodec', 'triper']));
    var r = R.int(2, 15);
    if (kind === 'hexper') return { q: 'A regular hexagon is inscribed in a circle of radius $' + r + '$ cm. What is the perimeter of the hexagon?', a: num(6 * r), steps: ['Each side of an inscribed regular hexagon equals the radius: each side and two radii form an equilateral triangle (central angle $60^\\circ$).', 'Perimeter $= 6 \\cdot ' + r + ' = ' + 6 * r + '$ cm.'], hint: 'The construction steps around the circle with the radius as the compass width.' };
    if (kind === 'central') { var n = R.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]); return { q: 'A regular polygon with ' + n + ' sides is inscribed in a circle. What is the measure of each central angle (the angle at the center between two neighboring vertices)?', a: num(360 / n), steps: ['The ' + n + ' central angles are equal and fill the full turn of $360^\\circ$.', '$360 \\div ' + n + ' = ' + deg(360 / n) + '$.'], hint: 'Split 360° evenly.' }; }
    if (kind === 'sq' || kind === 'sqarea') {
      var s = rad(r, 1, 2);
      if (kind === 'sqarea') return { q: 'A square is inscribed in a circle of radius $' + r + '$. Find the area of the square.', a: num(2 * r * r), steps: ['The diagonals of the inscribed square are diameters: each is $2 \\cdot ' + r + ' = ' + 2 * r + '$.', 'A square\'s area is half the product of its diagonals: $\\dfrac{' + 2 * r + ' \\cdot ' + 2 * r + '}{2} = ' + 2 * r * r + '$.', 'Check with the side: $s = ' + rtex(s) + '$ and $s^2 = ' + 2 * r * r + '$.'], hint: 'Its diagonals are diameters of the circle.' };
      return { q: 'A square is inscribed in a circle of radius $' + r + '$. Find the length of a side of the square. Give an exact answer.', a: rnum(s), steps: ['The diagonals are perpendicular diameters, so they cut the square into four right isosceles triangles with legs equal to the radius, $' + r + '$.', 'Each side is a hypotenuse: $s = \\sqrt{' + r + '^2 + ' + r + '^2} = \\sqrt{' + 2 * r * r + '} = ' + rtex(s) + '$.'], hint: 'Two radii and a side make a right triangle.' };
    }
    if (kind === 'tri' || kind === 'triper') {
      var side = rad(r, 1, 3), per = rad(3 * r, 1, 3);
      return { q: 'An equilateral triangle is inscribed in a circle of radius $' + r + '$. Find ' + (kind === 'tri' ? 'the length of one side' : 'its perimeter') + '. Give an exact answer.', a: rnum(kind === 'tri' ? side : per),
        steps: ['Each central angle is $360^\\circ \\div 3 = 120^\\circ$. The radius to a vertex and the perpendicular from the center to a side make a $30$-$60$-$90$ triangle with hypotenuse $' + r + '$.', 'Half of a side is the leg opposite $60^\\circ$: $\\dfrac{' + r + '\\sqrt{3}}{2}$. So a side is $' + rtex(side) + '$.'].concat(kind === 'triper' ? ['Perimeter: $3 \\cdot ' + rtex(side) + ' = ' + rtex(per) + '$.'] : []), hint: 'Draw radii to two vertices and drop a perpendicular from the center to the side between them.' };
    }
    if (kind === 'dodec') { var k = R.pick([[6, 12], [4, 8], [3, 6], [8, 16], [5, 10], [10, 20], [12, 24], [9, 18]]); return { q: 'You inscribe a regular polygon with ' + k[0] + ' sides in a circle, then bisect each of its central angles to mark new points on the circle. How many sides does the new regular polygon have?', a: num(k[1]), steps: ['Bisecting each of the ' + k[0] + ' arcs adds one new point per arc.', 'That doubles the number of vertices: $2 \\cdot ' + k[0] + ' = ' + k[1] + '$ sides, each central angle $' + deg(360 / k[1]) + '$.'], hint: 'Each arc gets a new point in its middle.' }; }
    var c = R.pick([
      ['You have constructed a regular hexagon $ABCDEF$ in a circle. How do you get an inscribed equilateral triangle?', 'Connect every other vertex: $A$, $C$ and $E$.', ['Connect $A$, $B$ and $C$.', 'Bisect each side of the hexagon.', 'Draw the three diameters.'], 'Skipping every other vertex joins points $120^\\circ$ apart around the center. Three equal central angles give three equal chords: an equilateral triangle.'],
      ['What is the first step for inscribing a square in a circle with center $O$?', 'Draw a diameter, then construct the diameter perpendicular to it.', ['Step around the circle with the radius.', 'Draw a chord equal to the radius.', 'Bisect an angle at $O$.'], 'Two perpendicular diameters make four $90^\\circ$ central angles. Their endpoints are the corners of a square (its diagonals are equal, perpendicular, and bisect each other).'],
      ['Why does stepping around a circle with the radius as the compass width give a regular hexagon?', 'Each chord equal to the radius makes an equilateral triangle with the center, so each central angle is $60^\\circ$ and $6 \\cdot 60^\\circ = 360^\\circ$.', ['Because the compass is round.', 'Because every polygon in a circle is regular.', 'Because a hexagon has six sides.'], 'The triangle formed by the center and two neighboring marks has three sides equal to the radius, so all its angles are $60^\\circ$. Six of those central angles fill the circle exactly.']
    ]);
    return { q: c[0], a: mc(c[1], c[2]), steps: [c[3]], hint: 'Think about the central angles.' };
  });

  /* ================================================================ Unit: Reasoning and Proof */

  var CONDS = [
    { p: 'two angles are vertical angles', q: 'they are congruent', np: 'two angles are not vertical angles', nq: 'they are not congruent', s: true, c: false, cx: 'Two $40^\\circ$ angles in different corners of a figure are congruent but are not vertical angles.', ncx: ['Two vertical angles that each measure $70^\\circ$ are congruent.', 'Angles of $30^\\circ$ and $60^\\circ$ are not congruent and are not vertical angles.'] },
    { p: 'a quadrilateral is a square', q: 'it has four right angles', np: 'a quadrilateral is not a square', nq: 'it does not have four right angles', s: true, c: false, cx: 'A $3$ by $5$ rectangle has four right angles but is not a square.', ncx: ['A square with sides of $4$ has four right angles.', 'A parallelogram with a $70^\\circ$ angle has no right angles and is not a square.'] },
    { p: 'a triangle has three congruent sides', q: 'it has three congruent angles', np: 'a triangle does not have three congruent sides', nq: 'it does not have three congruent angles', s: true, c: true },
    { p: 'an angle is a right angle', q: 'it measures $90^\\circ$', np: 'an angle is not a right angle', nq: 'it does not measure $90^\\circ$', s: true, c: true },
    { p: 'a number is divisible by $6$', q: 'it is divisible by $3$', np: 'a number is not divisible by $6$', nq: 'it is not divisible by $3$', s: true, c: false, cx: '$9$ is divisible by $3$ but not by $6$.', ncx: ['$12$ is divisible by $3$ and by $6$.', '$10$ is divisible by neither $3$ nor $6$.'] },
    { p: 'two lines are perpendicular', q: 'they intersect', np: 'two lines are not perpendicular', nq: 'they do not intersect', s: true, c: false, cx: 'Two lines can cross at $50^\\circ$: they intersect but are not perpendicular.', ncx: ['Two perpendicular lines intersect at a right angle.', 'Two parallel lines do not intersect and are not perpendicular.'] },
    { p: '$x = 4$', q: '$x^2 = 16$', np: '$x \\ne 4$', nq: '$x^2 \\ne 16$', s: true, c: false, cx: '$x = -4$ gives $x^2 = 16$, but $x \\ne 4$.', ncx: ['$x = 4$ gives $x^2 = 16$ and $x = 4$.', '$x = 5$ gives $x^2 = 25$, so $x^2 \\ne 16$.'] },
    { p: 'a polygon is a triangle', q: 'its interior angles add to $180^\\circ$', np: 'a polygon is not a triangle', nq: 'its interior angles do not add to $180^\\circ$', s: true, c: true },
    { p: '$M$ is the midpoint of $\\overline{AB}$', q: '$AM = MB$', np: '$M$ is not the midpoint of $\\overline{AB}$', nq: '$AM \\ne MB$', s: true, c: false, cx: 'Any point on the perpendicular bisector of $\\overline{AB}$ above the segment has $AM = MB$ without being on $\\overline{AB}$.', ncx: ['The midpoint $M$ of $\\overline{AB}$ has $AM = MB$.', 'A point $M$ on $\\overline{AB}$ that is closer to $A$ has $AM \\ne MB$.'] },
    { p: 'an animal is a dog', q: 'it is a mammal', np: 'an animal is not a dog', nq: 'it is not a mammal', s: true, c: false, cx: 'A cat is a mammal but not a dog.', ncx: ['A beagle is a dog and a mammal.', 'A lizard is not a mammal and not a dog.'] },
    { p: 'two angles form a linear pair', q: 'they are supplementary', np: 'two angles do not form a linear pair', nq: 'they are not supplementary', s: true, c: false, cx: 'A $70^\\circ$ angle and a $110^\\circ$ angle in different places are supplementary but do not form a linear pair.', ncx: ['Two angles of a linear pair, $70^\\circ$ and $110^\\circ$, are supplementary.', 'Angles of $50^\\circ$ and $60^\\circ$ are not supplementary and do not form a linear pair.'] },
    { p: 'a number is even', q: 'its last digit is $0$, $2$, $4$, $6$ or $8$', np: 'a number is not even', nq: 'its last digit is not $0$, $2$, $4$, $6$ or $8$', s: true, c: true },
    { p: 'a quadrilateral is a rectangle', q: 'its diagonals are congruent', np: 'a quadrilateral is not a rectangle', nq: 'its diagonals are not congruent', s: true, c: false, cx: 'An isosceles trapezoid has congruent diagonals but is not a rectangle.', ncx: ['A square has congruent diagonals and is a rectangle.', 'A kite with unequal diagonals is not a rectangle.'] },
    { p: 'two angles are complementary', q: 'their measures add to $90^\\circ$', np: 'two angles are not complementary', nq: 'their measures do not add to $90^\\circ$', s: true, c: true },
    { p: 'a figure is a square', q: 'it is a rhombus', np: 'a figure is not a square', nq: 'it is not a rhombus', s: true, c: false, cx: 'A rhombus with $60^\\circ$ and $120^\\circ$ angles is not a square.', ncx: ['A square is a rhombus.', 'A rectangle that is not a square is not a rhombus.'] }
  ];
  // the converse needs a subject for "they"/"it": rewrite the q part with the p subject
  function subj(c) { var m = /^(two angles|a quadrilateral|a triangle|an angle|a number|two lines|a polygon|an animal|a figure)/.exec(c.p); return m ? m[1] : null; }
  function convQ(c, neg) { // q (or not q) as a stand-alone clause for the "if" part
    var s = neg ? c.nq : c.q, sb = subj(c); if (!sb) return s;
    return s.replace(/^they /, sb + ' ').replace(/^their (\w+) /, 'the $1 of ' + sb + ' ').replace(/^its /, sb + '\'s ').replace(/^it /, sb + ' ');
  }
  function convP(c, neg) { var s = neg ? c.np : c.p, sb = subj(c); if (!sb) return s; var pr = /^two/.test(sb) ? 'they' : 'it'; return s.replace(sb + ' ', pr + ' '); }
  function form(c, f) {
    if (f === 'S') return 'If ' + c.p + ', then ' + c.q + '.';
    if (f === 'C') return 'If ' + convQ(c, false) + ', then ' + convP(c, false) + '.';
    if (f === 'I') return 'If ' + c.np + ', then ' + c.nq + '.';
    return 'If ' + convQ(c, true) + ', then ' + convP(c, true) + '.';
  }
  var FNAME = { S: 'the statement', C: 'the converse', I: 'the inverse', P: 'the contrapositive' };

  G('geo.conditional-statements', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['which', 'which', 'truth'], ['which', 'truth', 'cx', 'numcx'], ['truth', 'numcx', 'bicond', 'equiv']));
    var c = R.pick(CONDS);
    if (kind === 'which') {
      var f = R.pick(['C', 'I', 'P']), others = ['S', 'C', 'I', 'P'].filter(function (x) { return x !== f; });
      return { q: 'Statement: <i>' + form(c, 'S') + '</i><br>Which sentence is ' + FNAME[f] + '?', a: mc(form(c, f), others.map(function (x) { return form(c, x); })),
        steps: ['For "If $p$, then $q$": the converse swaps the parts (If $q$, then $p$); the inverse negates both (If not $p$, then not $q$); the contrapositive swaps and negates (If not $q$, then not $p$).', FNAME[f].charAt(0).toUpperCase() + FNAME[f].slice(1) + ': <i>' + form(c, f) + '</i>'],
        hint: 'Converse: swap. Inverse: negate. Contrapositive: swap and negate.' };
    }
    if (kind === 'truth') {
      var f2 = R.pick(['C', 'I', 'P']), val = f2 === 'P' ? c.s : c.c;
      var why = f2 === 'P' ? 'A contrapositive always has the same truth value as the original statement, which is true.' : (c.c ? 'Here the converse is also true, so the statement is a biconditional; the inverse matches the converse.' : 'The converse is false: ' + c.cx + ' The inverse always has the same truth value as the converse.');
      return { q: 'Statement: <i>' + form(c, 'S') + '</i> (This statement is true.)<br>' + FNAME[f2].charAt(0).toUpperCase() + FNAME[f2].slice(1) + ': <i>' + form(c, f2) + '</i><br>Is ' + FNAME[f2] + ' true?', a: tf(val),
        steps: ['The statement and its contrapositive are logically equivalent. The converse and the inverse are equivalent to each other, but not to the statement.', why, 'So ' + FNAME[f2] + ' is ' + (val ? 'true' : 'false') + '.'],
        hint: f2 === 'P' ? 'The contrapositive always matches the original.' : 'Look for an example where the "if" part is true but the "then" part is false.' };
    }
    if (kind === 'cx') {
      var cs = CONDS.filter(function (x) { return !x.c; }), c2 = R.pick(cs), others2 = R.sample(cs.filter(function (x) { return x !== c2; }), 3);
      return { q: 'Statement: <i>' + form(c2, 'S') + '</i><br>Its converse is false. Which of these is a counterexample to the converse?', a: mc(c2.cx, c2.ncx.concat([others2[0].cx])),
        steps: ['The converse is <i>' + form(c2, 'C') + '</i>', 'A counterexample makes the "if" part true and the "then" part false.', c2.cx], hint: 'You need a case where the converse\'s hypothesis is true and its conclusion is false.' };
    }
    if (kind === 'numcx') {
      var t = R.int(0, 3);
      if (t === 0) { var n = R.int(3, 12); return { q: 'Which value of $x$ is a counterexample to: <i>If $x^2 = ' + n * n + '$, then $x = ' + n + '$</i>?', a: mc('$x = ' + (-n) + '$', ['$x = ' + n + '$', '$x = ' + n * n + '$', '$x = ' + (n + 1) + '$']), steps: ['A counterexample makes $x^2 = ' + n * n + '$ true but $x = ' + n + '$ false.', '$(' + (-n) + ')^2 = ' + n * n + '$, and $' + (-n) + ' \\ne ' + n + '$. So $x = ' + (-n) + '$ is a counterexample.'], hint: 'Negative numbers have squares too.' }; }
      if (t === 1) { var a = R.int(2, 6), b = a * a; return { q: 'Which value of $x$ is a counterexample to: <i>If $x^2 > ' + b + '$, then $x > ' + a + '$</i>?', a: mc('$x = ' + (-(a + R.int(1, 4))) + '$', ['$x = ' + (a + 1) + '$', '$x = ' + (a - 1) + '$', '$x = ' + a + '$']), steps: ['We need $x^2 > ' + b + '$ but $x \\le ' + a + '$.', 'A negative number far from zero works: its square is large, but it is less than $' + a + '$.'], hint: 'Try a negative number.' }; }
      if (t === 2) { var m3 = 3 * (2 * R.int(1, 15) + 1); return { q: 'Which number is a counterexample to: <i>If a number is divisible by $3$, then it is divisible by $6$</i>?', a: mc('$' + m3 + '$', ['$' + 6 * R.int(2, 9) + '$', '$' + (6 * R.int(2, 9) + 2) + '$', '$' + (6 * R.int(2, 9) + 4) + '$']), steps: ['We need a number divisible by $3$ but not by $6$: an odd multiple of $3$.', '$' + m3 + ' = 3 \\cdot ' + m3 / 3 + '$ is odd, so it is not divisible by $6$.'], hint: 'Find a multiple of 3 that is odd.' }; }
      return { q: 'Which number is a counterexample to: <i>If a number is prime, then it is odd</i>?', a: mc('$2$', ['$' + R.pick([3, 5, 7, 11, 13]) + '$', '$9$', '$15$']), steps: ['We need a prime number that is not odd.', '$2$ is prime (its only factors are $1$ and $2$) and it is even.'], hint: 'Is there an even prime?' };
    }
    if (kind === 'bicond') {
      var yes = R.pick(CONDS.filter(function (x) { return x.c; })), no = R.sample(CONDS.filter(function (x) { return !x.c; }), 3);
      return { q: 'Which statement can be written as a true biconditional ("if and only if")?', a: mc(form(yes, 'S'), no.map(function (x) { return form(x, 'S'); })),
        steps: ['A biconditional is true only when the statement and its converse are both true.', 'The converse of <i>' + form(yes, 'S') + '</i> is <i>' + form(yes, 'C') + '</i>, which is also true.', 'The others have false converses.'], hint: 'Check each converse.' };
    }
    var e = R.pick([['A statement and its contrapositive always have the same truth value.', true], ['A statement and its converse always have the same truth value.', false], ['A statement and its inverse always have the same truth value.', false], ['The converse and the inverse of a statement always have the same truth value.', true], ['If a statement is true, its converse must be true.', false], ['One counterexample is enough to show that a conditional statement is false.', true]]);
    return { q: 'True or false: ' + e[0], a: tf(e[1]), steps: ['The statement and its contrapositive are logically equivalent; so are the converse and the inverse (the inverse is the contrapositive of the converse).', 'One case where the "if" part is true and the "then" part is false makes a conditional false.', 'So the sentence is ' + (e[1] ? 'true' : 'false') + '.'], hint: 'Which pairs are contrapositives of each other?' };
  });

  var PROPS = ['Addition Property of Equality', 'Subtraction Property of Equality', 'Multiplication Property of Equality', 'Division Property of Equality', 'Distributive Property', 'Substitution Property', 'Reflexive Property', 'Symmetric Property', 'Transitive Property', 'Combine like terms'];
  G('geo.algebraic-proof', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['solve', 'single', 'solve'], ['solve', 'single', 'solve2'], ['solve2', 'geom', 'single']));
    function ask(lines, k, extraWrong) {
      var right = lines[k][1], pool = PROPS.filter(function (x) { return x !== right && (lines[k][2] || []).indexOf(x) < 0; });
      var close = { 'Addition Property of Equality': 'Subtraction Property of Equality', 'Subtraction Property of Equality': 'Addition Property of Equality', 'Multiplication Property of Equality': 'Division Property of Equality', 'Division Property of Equality': 'Multiplication Property of Equality', 'Symmetric Property': 'Transitive Property', 'Transitive Property': 'Symmetric Property', 'Substitution Property': 'Transitive Property', 'Distributive Property': 'Combine like terms', 'Combine like terms': 'Distributive Property', 'Reflexive Property': 'Symmetric Property' }[right];
      var wr = []; if (close && pool.indexOf(close) >= 0) wr.push(close); R.shuffle(pool).forEach(function (x) { if (wr.indexOf(x) < 0) wr.push(x); });
      var tbl = lines.map(function (l, i) { return (i + 1) + '. $' + l[0] + '$ — ' + (i === k ? '<b>?</b>' : l[1]); }).join('<br>');
      return { q: 'Which reason justifies step ' + (k + 1) + '?<br>' + tbl, a: mc(right, wr), steps: lines.map(function (l, i) { return (i + 1) + '. $' + l[0] + '$ — ' + l[1] + (i === k ? ' ← this step' : ''); }), hint: 'Compare step ' + (k + 1) + ' with step ' + k + '. What was done to both sides, or what was replaced?' };
    }
    if (kind === 'solve' || kind === 'solve2') {
      var xv = R.nz(-9, 12), a = R.int(2, 9), lines;
      var t = kind === 'solve' ? R.int(0, 2) : R.int(2, 4);
      if (t === 0) { var b = R.nz(-15, 15), c = a * xv + b; lines = [[lin(a, b) + ' = ' + c, 'Given'], [T.mono(a, 'x') + ' = ' + (c - b), b > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality'], ['x = ' + xv, 'Division Property of Equality']]; }
      else if (t === 1) { a = R.int(2, 6); var q1 = R.nz(-6, 6), b1 = R.nz(-9, 9); xv = a * q1; var c1 = q1 + b1; lines = [['\\frac{x}{' + a + '}' + T.signed(b1) + ' = ' + c1, 'Given'], ['\\frac{x}{' + a + '} = ' + q1, b1 > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality'], ['x = ' + xv, 'Multiplication Property of Equality']]; }
      else if (t === 2) { var b2 = R.nz(-6, 8), c2 = a * (xv + b2); lines = [[a + '(' + lin(1, b2) + ') = ' + c2, 'Given'], [lin(a, a * b2) + ' = ' + c2, 'Distributive Property'], [T.mono(a, 'x') + ' = ' + (c2 - a * b2), a * b2 > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality'], ['x = ' + xv, 'Division Property of Equality']]; }
      else if (t === 3) { var c3, b3, d3; do { c3 = R.intNot(1, 8, [a]); b3 = R.nz(-10, 10); d3 = a * xv + b3 - c3 * xv; } while (d3 === 0 || M.abs(d3) > 60); var big = a > c3; lines = [[lin(a, b3) + ' = ' + lin(c3, d3), 'Given'], [big ? lin(a - c3, b3) + ' = ' + d3 : b3 + ' = ' + lin(c3 - a, d3), 'Subtraction Property of Equality'], [big ? T.mono(a - c3, 'x') + ' = ' + (d3 - b3) : (b3 - d3) + ' = ' + T.mono(c3 - a, 'x'), big ? (b3 > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality') : (d3 > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality')]]; if (M.abs(a - c3) !== 1) lines.push([big ? 'x = ' + xv : xv + ' = x', 'Division Property of Equality']); if (!big) lines.push(['x = ' + xv, 'Symmetric Property']); }
      else { var b4 = R.nz(-6, 6), c4 = R.int(2, 5), tot = a * xv + c4 * xv + b4; lines = [[T.mono(a, 'x') + ' + ' + T.mono(c4, 'x') + T.signed(b4) + ' = ' + tot, 'Given'], [lin(a + c4, b4) + ' = ' + tot, 'Combine like terms'], [T.mono(a + c4, 'x') + ' = ' + (tot - b4), b4 > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality'], ['x = ' + xv, 'Division Property of Equality']]; }
      var k = R.int(1, lines.length - 1);
      return ask(lines, k);
    }
    if (kind === 'single') {
      var L = letters(R, 4), A = L[0], B = L[1], C = L[2], Dd = L[3], v = R.int(3, 20), w = R.int(2, 9);
      var s = R.pick([
        ['If $' + A + B + ' = ' + C + Dd + '$, then $' + C + Dd + ' = ' + A + B + '$.', 'Symmetric Property'],
        ['$' + mang(A + B + C) + ' = ' + mang(A + B + C) + '$', 'Reflexive Property'],
        ['If $' + A + B + ' = ' + C + Dd + '$ and $' + C + Dd + ' = ' + v + '$, then $' + A + B + ' = ' + v + '$.', 'Transitive Property'],
        ['If $x = ' + v + '$, then $x + ' + w + ' = ' + (v + w) + '$.', 'Addition Property of Equality'],
        ['If $x + ' + w + ' = ' + (v + w) + '$, then $x = ' + v + '$.', 'Subtraction Property of Equality'],
        ['If $\\frac{x}{' + w + '} = ' + v + '$, then $x = ' + v * w + '$.', 'Multiplication Property of Equality'],
        ['If $' + w + 'x = ' + v * w + '$, then $x = ' + v + '$.', 'Division Property of Equality'],
        ['If $y = ' + w + 'x$ and $x = ' + v + '$, then $y = ' + w + ' \\cdot ' + v + '$.', 'Substitution Property'],
        ['$' + w + '(x + ' + v + ') = ' + w + 'x + ' + w * v + '$', 'Distributive Property']
      ]);
      var twin = { 'Transitive Property': 'Substitution Property', 'Substitution Property': 'Transitive Property' }[s[1]];
      var pool = PROPS.filter(function (x) { return x !== s[1] && x !== twin && x !== 'Combine like terms'; });
      return { q: 'Which property justifies this statement?<br>' + s[0], a: mc(s[1], R.sample(pool, 3)), steps: ['Reflexive: a quantity equals itself. Symmetric: you may swap the sides. Transitive: if $a = b$ and $b = c$, then $a = c$. Substitution: replace a quantity with one equal to it.', 'Here: ' + s[1] + '.'], hint: 'What changed from the first part to the second?' };
    }
    // geom: the same properties in a segment or angle argument
    var g = R.pick([
      [['AB = CD', 'Given'], ['AB + BC = CD + BC', 'Addition Property of Equality'], ['AC = BD', 'Substitution Property', ['Transitive Property']]],
      [[mang('1') + ' + ' + mang('2') + ' = 180', 'Given'], [mang('1') + ' = 180 - ' + mang('2'), 'Subtraction Property of Equality'], [mang('3') + ' = 180 - ' + mang('2'), 'Given'], [mang('1') + ' = ' + mang('3'), 'Transitive Property', ['Substitution Property']]],
      [['2 \\cdot AM = AB', 'Given'], ['AM = \\frac{1}{2}AB', 'Division Property of Equality', ['Multiplication Property of Equality']]],
      [[mang('A') + ' = ' + mang('B'), 'Given'], [mang('B') + ' = ' + mang('A'), 'Symmetric Property']]
    ]);
    var kk = R.int(1, g.length - 1);
    return ask(g.map(function (l) { return [l[0], l[1], l[2]]; }), kk);
  });

  /* short proofs for "Writing a Proof": [statement, reason, alsoOK] */
  function proofBank(R) {
    var x = R.int(2, 9), a = R.int(2, 5), b = R.nz(-6, 9), c = R.int(1, 4), d = R.nz(-6, 9), tot = a * x + b + c * x + d;
    while (a * x + b <= 0 || c * x + d <= 0) { b = R.int(1, 9); d = R.int(1, 9); tot = a * x + b + c * x + d; }
    return [
      { given: '$AB = CD$; points $A$, $B$, $C$, $D$ lie on a line in that order', prove: '$AC = BD$', fig: { pts: { A: [0, 0], B: [3, 0], C: [5, 0], D: [8, 0] }, segs: [['A', 'D']], labpos: { A: 'n', B: 'n', C: 'n', D: 'n' }, height: 110 },
        s: [['$AB = CD$', 'Given'], ['$AB + BC = BC + CD$', 'Addition Property of Equality'], ['$AB + BC = AC$ and $BC + CD = BD$', 'Segment Addition Postulate'], ['$AC = BD$', 'Substitution Property', ['Transitive Property']]] },
      { given: '$' + mang('ABD') + ' = ' + mang('EBC') + '$; ray $BE$ is between rays $BD$ and $BC$', prove: '$' + mang('ABE') + ' = ' + mang('DBC') + '$', fig: { pts: { B: [0, 0], A: [5, 0], D: [3.6, 2.6], E: [1.3, 4.3], C: [-2.6, 3.9] }, rays: [['B', 'A'], ['B', 'D'], ['B', 'E'], ['B', 'C']], height: 200 },
        s: [['$' + mang('ABD') + ' = ' + mang('EBC') + '$', 'Given'], ['$' + mang('ABD') + ' + ' + mang('DBE') + '$ $= ' + mang('DBE') + ' + ' + mang('EBC') + '$', 'Addition Property of Equality'], ['$' + mang('ABD') + ' + ' + mang('DBE') + ' = ' + mang('ABE') + '$ and $' + mang('DBE') + ' + ' + mang('EBC') + ' = ' + mang('DBC') + '$', 'Angle Addition Postulate'], ['$' + mang('ABE') + ' = ' + mang('DBC') + '$', 'Substitution Property', ['Transitive Property']]] },
      { given: '$M$ is the midpoint of $' + seg('AB') + '$', prove: '$AM = \\frac{1}{2}AB$', fig: { pts: { A: [0, 0], M: [3, 0], B: [6, 0] }, segs: [['A', 'M', { tick: 1 }], ['M', 'B', { tick: 1 }]], labpos: { A: 'n', M: 'n', B: 'n' }, height: 110 },
        s: [['$M$ is the midpoint of $' + seg('AB') + '$', 'Given'], ['$AM = MB$', 'Definition of midpoint'], ['$AM + MB = AB$', 'Segment Addition Postulate'], ['$AM + AM = AB$', 'Substitution Property'], ['$2 \\cdot AM = AB$', 'Combine like terms'], ['$AM = \\frac{1}{2}AB$', 'Division Property of Equality', ['Multiplication Property of Equality']]] },
      { given: '$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$', prove: '$' + mang('ABD') + ' = \\frac{1}{2}' + mang('ABC') + '$', fig: { pts: { B: [0, 0], A: [5, 0], D: [4, 2.9], C: [1.6, 4.7] }, rays: [['B', 'A'], ['B', 'D'], ['B', 'C']], angs: [['A', 'B', 'D', { r: 30 }], ['D', 'B', 'C', { r: 30 }]], height: 190 },
        s: [['$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$', 'Given'], ['$' + mang('ABD') + ' = ' + mang('DBC') + '$', 'Definition of angle bisector'], ['$' + mang('ABD') + ' + ' + mang('DBC') + ' = ' + mang('ABC') + '$', 'Angle Addition Postulate'], ['$' + mang('ABD') + ' + ' + mang('ABD') + ' = ' + mang('ABC') + '$', 'Substitution Property'], ['$2 \\cdot ' + mang('ABD') + ' = ' + mang('ABC') + '$', 'Combine like terms'], ['$' + mang('ABD') + ' = \\frac{1}{2}' + mang('ABC') + '$', 'Division Property of Equality', ['Multiplication Property of Equality']]] },
      { given: '$' + ang('ABC') + '$ is a right angle; $D$ is in the interior of $' + ang('ABC') + '$', prove: '$' + ang('ABD') + '$ and $' + ang('DBC') + '$ are complementary', fig: { pts: { B: [0, 0], A: [0, 4.5], C: [5, 0], D: [3.6, 2.8] }, rays: [['B', 'A'], ['B', 'C'], ['B', 'D']], angs: [['C', 'B', 'A', { right: 1, r: 22 }]], height: 190 },
        s: [['$' + ang('ABC') + '$ is a right angle', 'Given'], ['$' + mang('ABC') + ' = 90^\\circ$', 'Definition of right angle'], ['$' + mang('ABD') + ' + ' + mang('DBC') + ' = ' + mang('ABC') + '$', 'Angle Addition Postulate'], ['$' + mang('ABD') + ' + ' + mang('DBC') + ' = 90^\\circ$', 'Substitution Property', ['Transitive Property']], ['$' + ang('ABD') + '$ and $' + ang('DBC') + '$ are complementary', 'Definition of complementary angles']] },
      { given: '$' + ang('1') + '$ and $' + ang('2') + '$ form a linear pair; $' + ang('3') + '$ and $' + ang('4') + '$ form a linear pair; $' + mang('1') + ' = ' + mang('3') + '$', prove: '$' + mang('2') + ' = ' + mang('4') + '$', fig: null,
        s: [['$' + ang('1') + '$, $' + ang('2') + '$ and $' + ang('3') + '$, $' + ang('4') + '$ are linear pairs', 'Given'], ['$' + mang('1') + ' + ' + mang('2') + ' = 180^\\circ$ and $' + mang('3') + ' + ' + mang('4') + ' = 180^\\circ$', 'Linear Pair Postulate'], ['$' + mang('1') + ' + ' + mang('2') + ' = ' + mang('3') + ' + ' + mang('4') + '$', 'Substitution Property', ['Transitive Property']], ['$' + mang('1') + ' = ' + mang('3') + '$', 'Given'], ['$' + mang('1') + ' + ' + mang('2') + ' = ' + mang('1') + ' + ' + mang('4') + '$', 'Substitution Property'], ['$' + mang('2') + ' = ' + mang('4') + '$', 'Subtraction Property of Equality']] },
      { given: '$B$ is between $A$ and $C$; $AB = ' + lin(a, b) + '$, $BC = ' + lin(c, d) + '$, $AC = ' + tot + '$', prove: '$x = ' + x + '$', fig: null,
        s: [['$B$ is between $A$ and $C$; $AB = ' + lin(a, b) + '$, $BC = ' + lin(c, d) + '$, $AC = ' + tot + '$', 'Given'], ['$AB + BC = AC$', 'Segment Addition Postulate'], ['$(' + lin(a, b) + ') + (' + lin(c, d) + ') = ' + tot + '$', 'Substitution Property'], ['$' + lin(a + c, b + d) + ' = ' + tot + '$', 'Combine like terms']].concat(b + d !== 0 ? [['$' + T.mono(a + c, 'x') + ' = ' + (tot - b - d) + '$', b + d > 0 ? 'Subtraction Property of Equality' : 'Addition Property of Equality']] : []).concat([['$x = ' + x + '$', 'Division Property of Equality']]) }
    ];
  }
  var REASONS = ['Given', 'Definition of midpoint', 'Definition of angle bisector', 'Definition of right angle', 'Definition of complementary angles', 'Definition of supplementary angles', 'Segment Addition Postulate', 'Angle Addition Postulate', 'Linear Pair Postulate', 'Addition Property of Equality', 'Subtraction Property of Equality', 'Division Property of Equality', 'Substitution Property', 'Transitive Property', 'Reflexive Property', 'Symmetric Property', 'Combine like terms', 'Vertical Angles Theorem'];
  function proofTable(P, blank, mode) { // mode: 'reason' blanks the reason; 'stmt' blanks the statement
    return P.s.map(function (r, i) { return (i + 1) + '. ' + (i === blank && mode === 'stmt' ? '<b>?</b>' : r[0]) + ' — ' + (i === blank && mode === 'reason' ? '<b>?</b>' : r[1]); }).join('<br>');
  }
  function proofFull(P) { return P.s.map(function (r, i) { return (i + 1) + '. ' + r[0] + ' — ' + r[1]; }); }
  function reasonWrongs(R, right, also, pool) {
    var close = { 'Substitution Property': ['Transitive Property', 'Reflexive Property'], 'Definition of midpoint': ['Segment Addition Postulate', 'Definition of angle bisector'], 'Definition of angle bisector': ['Angle Addition Postulate', 'Definition of midpoint'], 'Segment Addition Postulate': ['Definition of midpoint', 'Angle Addition Postulate'], 'Angle Addition Postulate': ['Segment Addition Postulate', 'Definition of angle bisector'], 'Linear Pair Postulate': ['Vertical Angles Theorem', 'Definition of supplementary angles'], 'Definition of right angle': ['Definition of complementary angles', 'Given'], 'Definition of complementary angles': ['Definition of supplementary angles', 'Definition of right angle'] }[right] || [];
    var out = close.filter(function (x) { return (also || []).indexOf(x) < 0; });
    R.shuffle(pool).forEach(function (x) { if (x !== right && (also || []).indexOf(x) < 0 && out.indexOf(x) < 0) out.push(x); });
    return out.slice(0, 3);
  }

  G('geo.two-column-proofs', function (R, ctx) {
    var bank = proofBank(R), P = R.pick(bank), kind = R.pick(byL(ctx, ['reason', 'reason', 'stmt'], ['reason', 'stmt', 'flaw'], ['order', 'flaw', 'reason', 'stmt']));
    var head = '<b>Given:</b> ' + P.given + '<br><b>Prove:</b> ' + P.prove + '<br>';
    var viz = P.fig ? fig(P.fig, 'A diagram for the proof') : undefined;
    if (kind === 'reason') {
      var k = R.int(1, P.s.length - 1), right = P.s[k][1];
      return { q: head + proofTable(P, k, 'reason') + '<br>Which reason belongs in step ' + (k + 1) + '?', a: mc(right, reasonWrongs(R, right, P.s[k][2], REASONS)), viz: viz,
        steps: proofFull(P).concat(['Step ' + (k + 1) + ' is justified by: ' + right + '.']), hint: 'Compare step ' + (k + 1) + ' with the steps before it. Is it a definition, a postulate, or something done to both sides?' };
    }
    if (kind === 'stmt') {
      var k2 = R.int(1, P.s.length - 1), wr = P.s.filter(function (r, i) { return i !== k2; }).map(function (r) { return r[0]; });
      wr.unshift(P.prove.replace(/^\$|\$$/g, '') === P.s[k2][0].replace(/^\$|\$$/g, '') ? P.s[0][0] : P.prove);
      return { q: head + proofTable(P, k2, 'stmt') + '<br>Which statement belongs in step ' + (k2 + 1) + '?', a: mc(P.s[k2][0], R.shuffle(wr.filter(function (w) { return w !== P.s[k2][0]; }))), viz: viz,
        steps: proofFull(P), hint: 'The reason tells you what kind of statement it must be: ' + P.s[k2][1] + '.' };
    }
    if (kind === 'flaw') {
      var k3 = R.int(1, P.s.length - 1), bad = R.pick(['It looks that way in the diagram', 'This is what we are trying to prove', 'Given']);
      if (bad === 'Given' && P.s[k3][1] === 'Given') bad = 'It looks that way in the diagram';
      var rows = P.s.map(function (r, i) { return (i + 1) + '. ' + r[0] + ' — ' + (i === k3 ? bad : r[1]); }).join('<br>');
      var ch = P.s.map(function (r, i) { return 'Step ' + (i + 1); });
      return { q: head + rows + '<br>One step has a reason that does not justify it. Which step?', a: mcKeep(ch, k3), viz: viz,
        steps: ['Step ' + (k3 + 1) + ' says "' + bad + '". ' + (bad === 'Given' ? 'That fact is not in the given information.' : bad === 'This is what we are trying to prove' ? 'A proof cannot use its own conclusion as a reason: that is circular.' : 'A diagram can suggest an idea, but it is never a reason: drawings are not exact.'), 'The correct reason is: ' + P.s[k3][1] + '.'],
        hint: 'Every reason must be given information, a definition, a postulate, a property or a theorem already proved.' };
    }
    // order: put the middle statements in order (first and last fixed)
    var midIdx = []; for (var i = 1; i < P.s.length - 1; i++) midIdx.push(i);
    if (midIdx.length < 2) { midIdx = [1, 2].filter(function (j) { return j < P.s.length; }); }
    var lab = ['P', 'Q', 'R', 'S', 'T'].slice(0, midIdx.length), perm = R.shuffle(midIdx.map(function (_, j) { return j; }));
    var tries = 0; while (perm.every(function (v, j) { return v === j; }) && tries++ < 20) perm = R.shuffle(perm);
    var right2 = midIdx.map(function (_, r) { return lab[perm.indexOf(r)]; }).join(', '), wrongs = [];
    for (var t = 0; t < 60 && wrongs.length < 3; t++) { var w = R.shuffle(lab).join(', '); if (w !== right2 && wrongs.indexOf(w) < 0) wrongs.push(w); }
    if (wrongs.length < 1) wrongs.push(lab.slice().reverse().join(', '));
    var list = midIdx.map(function (_, j) { var r = P.s[midIdx[perm[j]]]; return '(' + lab[j] + ') ' + r[0] + ' — ' + r[1]; }).join('<br>');
    return { q: head + 'The proof starts with step 1, <i>' + P.s[0][0] + ' (Given)</i>, and ends with <i>' + P.s[P.s.length - 1][0] + '</i>. Put the middle steps in order:<br>' + list, a: mc(right2, wrongs), viz: viz,
      steps: ['The right order is ' + right2 + '.'].concat(proofFull(P)), hint: 'Each step can only use facts that come before it.' };
  });

  G('geo.line-angle-theorems', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['vert', 'find', 'find', 'name'], ['find', 'algebra', 'converse', 'name'], ['algebra', 'makepar', 'converse', 'find']));
    var phi = R.pick([R.int(35, 75), R.int(105, 145)]);
    if (kind === 'vert') {
      var i = R.int(1, 4), j = R.intNot(1, 4, [i]), mi = transAngle(i, phi), rel = transRel(i, j), mj = transAngle(j, phi);
      return { q: 'Line $t$ crosses line $\\ell$. If $' + mang(String(i)) + ' = ' + deg(mi) + '$, find $' + mang(String(j)) + '$.', a: num(mj), viz: fig(transFig(phi, { parallel: false, hl: [i, j] }), 'Line t crossing lines l and m, angles numbered 1 to 8'),
        steps: rel === 'vertical' ? ['$' + ang(String(i)) + '$ and $' + ang(String(j)) + '$ are vertical angles, and vertical angles are congruent.', '$' + mang(String(j)) + ' = ' + deg(mj) + '$.'] : ['$' + ang(String(i)) + '$ and $' + ang(String(j)) + '$ form a linear pair, so they are supplementary.', '$' + mang(String(j)) + ' = 180 - ' + mi + ' = ' + deg(mj) + '$.'],
        hint: 'Are the two angles across from each other (vertical) or side by side on a line (a linear pair)?' };
    }
    if (kind === 'find' || kind === 'name') {
      var a, b, r2; do { a = R.int(1, 8); b = R.int(1, 8); r2 = transRel(a, b); } while (a === b || !r2 || (kind === 'name' && (r2 === 'vertical' || r2 === 'linear pair')) || (a <= 4) === (b <= 4) && R.chance(0.7));
      var ma = transAngle(a, phi), mb = transAngle(b, phi), eq = REL_EQUAL[r2];
      var viz = fig(transFig(phi, { hl: [a, b] }), 'Parallel lines l and m cut by transversal t, angles numbered 1 to 8');
      if (kind === 'name') {
        var names = ['corresponding', 'alternate interior', 'alternate exterior', 'same-side interior', 'vertical', 'linear pair'].filter(function (x) { return x !== r2; });
        return { q: 'Lines $\\ell$ and $m$ are parallel. What kind of angle pair are $' + ang(String(a)) + '$ and $' + ang(String(b)) + '$, and how are their measures related?', viz: viz,
          a: mc(relName(r2) + '; ' + (eq ? 'congruent' : 'supplementary'), [relName(r2) + '; ' + (eq ? 'supplementary' : 'congruent'), relName(names[0]) + '; ' + (REL_EQUAL[names[0]] ? 'congruent' : 'supplementary'), relName(R.pick(names.slice(1))) + '; ' + (eq ? 'congruent' : 'supplementary')]),
          steps: ['Look at where each angle sits: ' + where(a) + ' and ' + where(b) + '.', 'That makes them ' + r2 + ' angles. With parallel lines, ' + r2 + ' angles are ' + (eq ? 'congruent' : 'supplementary') + '.'],
          hint: 'Interior means between the parallel lines; alternate means on opposite sides of the transversal.' };
      }
      return { q: 'Lines $\\ell$ and $m$ are parallel. If $' + mang(String(a)) + ' = ' + deg(ma) + '$, find $' + mang(String(b)) + '$.', a: num(mb), viz: viz,
        steps: ['$' + ang(String(a)) + '$ is ' + where(a) + ' and $' + ang(String(b)) + '$ is ' + where(b) + ': they are ' + r2 + ' angles.', eq ? 'With parallel lines these are congruent, so $' + mang(String(b)) + ' = ' + deg(mb) + '$.' : 'These are supplementary, so $' + mang(String(b)) + ' = 180 - ' + ma + ' = ' + deg(mb) + '$.', 'Check: in this figure every angle is either $' + deg(phi) + '$ or $' + deg(180 - phi) + '$.'],
        hint: 'Name the pair first. Then decide: equal, or adding to 180°?' };
    }
    if (kind === 'algebra' || kind === 'makepar') {
      var a2, b2, r3; do { a2 = R.int(1, 8); b2 = R.int(1, 8); r3 = transRel(a2, b2); } while (a2 === b2 || !r3 || r3 === 'vertical' || r3 === 'linear pair');
      var xv = R.int(4, 20), m1 = transAngle(a2, phi), m2 = transAngle(b2, phi), e1 = expr(R, xv, m1, 2, 6), e2 = expr(R, xv, m2, 1, 5);
      if (e1.a === e2.a) e2 = expr(R, xv, m2, e1.a + 1, e1.a + 3);
      var eq2 = REL_EQUAL[r3], lab = {}; lab[a2] = '(' + e1.tex + ')°'; lab[b2] = '(' + e2.tex + ')°';
      for (var n = 1; n <= 8; n++) if (!(n in lab)) lab[n] = '';
      var vz = fig(transFig(phi, { labels: lab, hl: [a2, b2], parallel: kind === 'algebra' }), 'Lines l and m cut by transversal t, two angles labeled with expressions');
      var st = ['The two marked angles are ' + r3 + ' angles.'];
      if (eq2) st = st.concat(solveSteps(e1, e2, xv)); else st = st.concat(sumSteps([e1, e2], 180, xv));
      if (kind === 'makepar') st.push('With $x = ' + xv + '$ the angles are $' + deg(m1) + '$ and $' + deg(m2) + '$, which makes them ' + (eq2 ? 'congruent' : 'supplementary') + ', so by the converse of the ' + cap(r3) + ' Angles Theorem, $\\ell \\parallel m$.');
      return { q: kind === 'algebra' ? 'Lines $\\ell$ and $m$ are parallel. Find $x$.' : 'For what value of $x$ is $\\ell \\parallel m$?', a: num(xv), viz: vz, steps: st,
        hint: eq2 ? 'These angles are equal when the lines are parallel.' : 'These angles add to 180° when the lines are parallel.' };
    }
    // converse: the direction of the logic
    var pr = R.pick([[1, 5, 'corresponding'], [3, 6, 'alternate interior'], [4, 5, 'alternate interior'], [2, 7, 'alternate exterior'], [2, 6, 'corresponding'], [3, 7, 'corresponding']]);
    var gv = R.coin();
    if (gv) return { q: 'In the figure, you are told only that $' + ang(String(pr[0])) + ' \\cong ' + ang(String(pr[1])) + '$. What can you conclude?', viz: fig(transFig(phi, { parallel: false, hl: [pr[0], pr[1]] }), 'Lines l and m cut by transversal t, not marked parallel'),
      a: mc('$\\ell \\parallel m$, by the converse of the ' + cap(pr[2]) + ' Angles Theorem', ['$\\ell \\parallel m$, by the ' + cap(pr[2]) + ' Angles Theorem', '$' + ang(String(pr[0])) + ' \\cong ' + ang(String(pr[1])) + '$, by the ' + cap(pr[2]) + ' Angles Theorem', 'Nothing: the lines are not marked parallel']),
      steps: ['The ' + pr[2] + ' angles theorem goes from parallel lines to congruent angles. Here we know the angles and want the lines, so we need the converse.', 'Converse of the ' + cap(pr[2]) + ' Angles Theorem: if ' + pr[2] + ' angles are congruent, the lines are parallel. So $\\ell \\parallel m$.'],
      hint: 'Which way does the logic go: from lines to angles, or from angles to lines?' };
    return { q: 'You want to prove $\\ell \\parallel m$. Which fact, if true, would let you conclude it?', viz: fig(transFig(phi, { parallel: false }), 'Lines l and m cut by transversal t, not marked parallel'),
      a: mc('$' + ang(String(pr[0])) + ' \\cong ' + ang(String(pr[1])) + '$', ['$' + ang('1') + ' \\cong ' + ang('4') + '$', '$' + ang('5') + ' \\cong ' + ang('8') + '$', '$' + mang('2') + ' + ' + mang('1') + ' = 180^\\circ$']),
      steps: ['$' + ang(String(pr[0])) + '$ and $' + ang(String(pr[1])) + '$ are ' + pr[2] + ' angles. If they are congruent, the converse of the ' + cap(pr[2]) + ' Angles Theorem gives $\\ell \\parallel m$.', 'The other choices are vertical angles or a linear pair at one crossing. They are true for any two crossing lines, so they say nothing about $\\ell$ and $m$.'],
      hint: 'The useful pair must use one angle at each crossing.' };
  });
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function relName(r) { return r === 'linear pair' ? 'A linear pair' : cap(r) + ' angles'; }
  function where(n) { var top = n <= 4, q = (n - 1) % 4, inside = top ? q >= 2 : q <= 1, side = q % 2 === 0 ? 'left' : 'right'; return 'at the ' + (top ? 'top' : 'bottom') + ' crossing, ' + (inside ? 'between the lines' : 'outside the lines') + ', ' + side + ' of $t$'; }

  /* ================================================================ Unit: Rigid Motions */

  function ruleOf(k, a, b) { // [tex of the image, function, rigid?, words]
    var R = {
      tr: ['(' + lin(1, a) + ', ' + T.lin(1, 'y', b) + ')', function (p) { return [p[0] + a, p[1] + b]; }, true, 'a translation'],
      ry: ['(-x, y)', function (p) { return [-p[0], p[1]]; }, true, 'a reflection over the $y$-axis'],
      rx: ['(x, -y)', function (p) { return [p[0], -p[1]]; }, true, 'a reflection over the $x$-axis'],
      sw: ['(y, x)', function (p) { return [p[1], p[0]]; }, true, 'a reflection over the line $y = x$'],
      r90: ['(-y, x)', function (p) { return [-p[1], p[0]]; }, true, 'a rotation of $90^\\circ$ counterclockwise about the origin'],
      r180: ['(-x, -y)', function (p) { return [-p[0], -p[1]]; }, true, 'a rotation of $180^\\circ$ about the origin'],
      d2: ['(' + a + 'x, ' + a + 'y)', function (p) { return [a * p[0], a * p[1]]; }, false, 'a dilation by scale factor $' + a + '$'],
      sx: ['(' + a + 'x, y)', function (p) { return [a * p[0], p[1]]; }, false, 'a horizontal stretch'],
      sy: ['(x, ' + a + 'y)', function (p) { return [p[0], a * p[1]]; }, false, 'a vertical stretch']
    };
    return R[k];
  }

  G('geo.transformations-as-functions', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['apply', 'apply', 'apply2'], ['apply2', 'pre', 'rigid', 'twice'], ['rigid', 'pre', 'dist', 'twice']));
    var P = [R.nz(-7, 7), R.nz(-7, 7)];
    if (kind === 'apply' || kind === 'apply2' || kind === 'twice') {
      var k = kind === 'apply' ? 'tr' : R.pick(['ry', 'rx', 'sw', 'r90', 'r180', 'd2', 'sy']), a = k === 'tr' ? R.nz(-6, 6) : R.int(2, 3), b = R.nz(-6, 6), r = ruleOf(k, a, b), img = r[1](P);
      if (kind === 'twice') { var k2 = R.pick(['tr', 'r90', 'rx']), r2 = ruleOf(k2, R.nz(-5, 5), R.nz(-5, 5)); if (k2 === 'tr') r2 = ruleOf('tr', R.nz(-5, 5), R.nz(-5, 5)); var once = r2[1](P), twice = r2[1](once);
        return { q: 'The transformation $T$ is defined by $T(x, y) = ' + r2[0] + '$. Find $T(T(' + P[0] + ', ' + P[1] + '))$.', a: { t: 'tuple', v: twice.map(String) },
          steps: ['Work from the inside out. First $T' + pt(P) + ' = ' + pt(once) + '$.', 'Then apply $T$ again: $T' + pt(once) + ' = ' + pt(twice) + '$.'], hint: 'Apply the rule once, then apply it to the result.' }; }
      return { q: 'A transformation $T$ maps each point $(x, y)$ to $' + r[0] + '$. Find the image of $P' + pt(P) + '$, that is, $T' + pt(P) + '$.', a: { t: 'tuple', v: img.map(String) },
        steps: ['A transformation is a function: put the input point\'s coordinates into the rule.', 'With $x = ' + P[0] + '$ and $y = ' + P[1] + '$: $T' + pt(P) + ' = ' + pt(img) + '$.', 'This rule is ' + r[3] + '.'], hint: 'Replace x and y in the rule with the coordinates of P.' };
    }
    if (kind === 'pre') {
      var a2 = R.nz(-6, 6), b2 = R.nz(-6, 6), img2 = [P[0] + a2, P[1] + b2];
      return { q: 'The translation $T(x, y) = (' + lin(1, a2) + ', ' + T.lin(1, 'y', b2) + ')$ maps point $P$ to $P\' = ' + pt(img2) + '$. Find $P$.', a: { t: 'tuple', v: P.map(String) },
        steps: ['$T$ adds $' + a2 + '$ to $x$ and $' + b2 + '$ to $y$. To go back, undo it: subtract them.', '$x = ' + img2[0] + ' - ' + T.p(a2) + ' = ' + P[0] + '$ and $y = ' + img2[1] + ' - ' + T.p(b2) + ' = ' + P[1] + '$.', 'Check: $T' + pt(P) + ' = ' + pt(img2) + '$.'], hint: 'Work backward: undo the shift.' };
    }
    if (kind === 'rigid') {
      var good = R.pick(['tr', 'ry', 'rx', 'sw', 'r90', 'r180']), bad = R.sample(['d2', 'sx', 'sy'], 3), ask = R.coin();
      var mk = function (k) { var r = ruleOf(k, k === 'tr' ? R.nz(-5, 5) : R.int(2, 4), R.nz(-5, 5)); return '$T(x, y) = ' + r[0] + '$'; };
      if (ask) return { q: 'Which rule is a rigid motion (it keeps every distance the same)?', a: mc(mk(good), bad.map(mk)), steps: ['Rigid motions (translations, reflections, rotations) slide, flip or turn a figure without stretching it.', mk(good) + ' is ' + ruleOf(good, 2, 1)[3] + ', so it is rigid.', 'Multiplying a coordinate by a number other than $\\pm 1$ stretches or shrinks distances.'], hint: 'Look for a rule that multiplies a coordinate by 2, 3 or 4. That stretches the figure.' };
      var k3 = R.pick(['d2', 'sx', 'sy', 'tr', 'r90', 'ry']), r3 = ruleOf(k3, k3 === 'tr' ? R.nz(-5, 5) : R.int(2, 4), R.nz(-5, 5));
      return { q: 'True or false: $T(x, y) = ' + r3[0] + '$ is a rigid motion.', a: tf(r3[2]), steps: [r3[2] ? 'This is ' + r3[3] + '. It moves points without changing any distance, so it is rigid.' : 'This is ' + r3[3] + ': it multiplies distances in at least one direction, so it is not rigid. For example, the distance from $(0, 0)$ to $(1, 1)$ changes.'], hint: 'Does the rule stretch or shrink anything?' };
    }
    // dist: a stretch changes a length
    var k4 = R.pick(['sx', 'sy', 'd2']), a4 = 2, r4 = ruleOf(k4, a4, 0), A = [R.int(-3, 3), R.int(-3, 3)], tr = R.pick([[3, 4], [4, 3], [1, 2], [2, 1], [2, 3]]), B = [A[0] + tr[0], A[1] + tr[1]], A2 = r4[1](A), B2 = r4[1](B);
    var N = dist2(A2, B2);
    return { q: 'The rule $T(x, y) = ' + r4[0] + '$ maps $A' + pt(A) + '$ and $B' + pt(B) + '$ to $A\'$ and $B\'$. Find $A\'B\'$ exactly.', a: rnum(sqrtN(N)),
      steps: ['Images: $A\' = ' + pt(A2) + '$ and $B\' = ' + pt(B2) + '$.', '$A\'B\' = \\sqrt{' + T.p(B2[0] - A2[0]) + '^2 + ' + T.p(B2[1] - A2[1]) + '^2} = \\sqrt{' + N + '}' + (sqrtN(N).r !== N ? ' = ' + rtex(sqrtN(N)) : '') + '$.', 'Compare $AB = \\sqrt{' + dist2(A, B) + '}$: the length changed, so this rule is not a rigid motion.'], hint: 'Find both images first, then use the distance formula.' };
  });

  G('geo.define-rigid-motions', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['reflAxis', 'rot0', 'vec'], ['reflLine', 'rot0', 'def', 'reflAxis'], ['rotC', 'mirror', 'def', 'reflLine']));
    var P = [R.nz(-6, 6), R.nz(-6, 6)];
    if (kind === 'reflAxis' || kind === 'reflLine') {
      var line = kind === 'reflAxis' ? R.pick([{ t: 'x', c: 0 }, { t: 'y', c: 0 }]) : R.pick(['y=x', 'y=-x', { t: 'x', c: R.nz(-4, 4) }, { t: 'y', c: R.nz(-4, 4) }]), img = refl(P, line);
      var why = line === 'y=x' ? 'Reflecting over $y = x$ swaps the coordinates.' : line === 'y=-x' ? 'Reflecting over $y = -x$ swaps the coordinates and changes both signs.' : line.t === 'x' ? '$P$ is $' + M.abs(P[0] - line.c) + '$ unit' + (M.abs(P[0] - line.c) === 1 ? '' : 's') + ' ' + (P[0] > line.c ? 'right' : 'left') + ' of the line $x = ' + line.c + '$, so its image is the same distance on the other side; $y$ stays the same.' : '$P$ is $' + M.abs(P[1] - line.c) + '$ unit' + (M.abs(P[1] - line.c) === 1 ? '' : 's') + ' ' + (P[1] > line.c ? 'above' : 'below') + ' the line $y = ' + line.c + '$, so its image is the same distance on the other side; $x$ stays the same.';
      return { q: 'Reflect $P' + pt(P) + '$ over ' + lineWords(line) + '. What are the coordinates of the image $P\'$?', a: { t: 'tuple', v: img.map(String) },
        steps: ['A reflection over a line sends $P$ to the point $P\'$ so that the line is the perpendicular bisector of $\\overline{PP\'}$.', why, '$P\' = ' + pt(img) + '$.'], hint: 'The mirror line must cut PP\' in half at a right angle.' };
    }
    if (kind === 'rot0' || kind === 'rotC') {
      var d = R.pick([90, 180, 270]), C = kind === 'rot0' ? [0, 0] : [R.nz(-3, 3), R.nz(-3, 3)], img2 = rot(P, d, C), rel = [P[0] - C[0], P[1] - C[1]], relI = rot(rel, d);
      var rule = d === 90 ? '(x, y) \\to (-y, x)' : d === 180 ? '(x, y) \\to (-x, -y)' : '(x, y) \\to (y, -x)';
      var st = kind === 'rot0' ? ['For a counterclockwise rotation about the origin by $' + deg(d) + '$: $' + rule + '$.', '$P\' = ' + pt(img2) + '$.', 'Check: $OP = OP\'$ and the angle $POP\'$ is $' + deg(d) + '$.']
        : ['Move the center to the origin: $P$ is $' + pt(rel) + '$ relative to $C$.', 'Rotate by $' + deg(d) + '$ counterclockwise: $' + rule + '$ gives $' + pt(relI) + '$.', 'Move back by adding $C$: $P\' = ' + pt(img2) + '$.'];
      return { q: 'Rotate $P' + pt(P) + '$ by $' + deg(d) + '$ counterclockwise about ' + (kind === 'rot0' ? 'the origin' : '$C' + pt(C) + '$') + '. Find the image $P\'$.', a: { t: 'tuple', v: img2.map(String) }, steps: st, hint: kind === 'rot0' ? 'A 90° turn counterclockwise sends (x, y) to (−y, x).' : 'Work relative to the center, then shift back.' };
    }
    if (kind === 'vec') {
      var v = [R.nz(-7, 7), R.nz(-7, 7)], Pp = [P[0] + v[0], P[1] + v[1]];
      return { q: 'A translation maps $P' + pt(P) + '$ to $P\'' + pt(Pp) + '$. Write the translation vector $\\langle a, b \\rangle$.', a: { t: 'tuple', v: v.map(String) },
        steps: ['The vector is the change from $P$ to $P\'$.', '$a = ' + Pp[0] + ' - ' + T.p(P[0]) + ' = ' + v[0] + '$, $b = ' + Pp[1] + ' - ' + T.p(P[1]) + ' = ' + v[1] + '$.', 'The vector is $\\langle ' + v[0] + ', ' + v[1] + ' \\rangle$. Every point moves by the same vector.'], hint: 'Subtract: image minus original.' };
    }
    if (kind === 'mirror') {
      var vert = R.coin(), c = R.nz(-4, 4), off = R.int(1, 5), y0 = R.nz(-5, 5), A = vert ? [c - off, y0] : [y0, c - off], B = vert ? [c + off, y0] : [y0, c + off];
      return { q: 'A reflection maps $P' + pt(A) + '$ to $P\'' + pt(B) + '$. Find an equation of the line of reflection.', a: { t: 'eq', v: (vert ? 'x = ' : 'y = ') + c },
        steps: ['The line of reflection is the perpendicular bisector of $\\overline{PP\'}$.', 'Midpoint: $' + pt(mid(A, B)) + '$. ' + (vert ? 'The segment is horizontal, so the bisector is the vertical line through the midpoint.' : 'The segment is vertical, so the bisector is the horizontal line through the midpoint.'), 'The line is $' + (vert ? 'x' : 'y') + ' = ' + c + '$.'], hint: 'The mirror line goes through the midpoint of PP\' at a right angle.' };
    }
    var dd = R.pick([
      ['A rotation about point $C$ by $' + deg(R.pick([40, 60, 75, 110])) + '$ maps $P$ to $P\'$. Which must be true?', '$CP = CP\'$, and the angle $PCP\'$ is the angle of rotation', ['$C$ is the midpoint of $\\overline{PP\'}$', '$PP\'$ equals the angle of rotation', '$\\overline{CP}$ and $\\overline{CP\'}$ are parallel'], 'A rotation keeps each point on a circle around the center: $CP = CP\'$, and it turns it through the given angle.'],
      ['A reflection over line $\\ell$ maps $P$ to $P\'$ ($P$ is not on $\\ell$). Which must be true?', '$\\ell$ is the perpendicular bisector of $\\overline{PP\'}$', ['$\\ell$ is parallel to $\\overline{PP\'}$', '$P$ and $P\'$ are on the same side of $\\ell$', '$PP\' = 2$'], 'That is the definition of a reflection: the line cuts $\\overline{PP\'}$ in half at a right angle.'],
      ['A translation maps $P$ to $P\'$ and $Q$ to $Q\'$. Which must be true?', '$\\overline{PP\'}$ and $\\overline{QQ\'}$ have the same length and direction', ['$\\overline{PP\'}$ and $\\overline{QQ\'}$ are perpendicular', '$P\'$ and $Q\'$ are the same point', '$PQ = 2 \\cdot P\'Q\'$'], 'A translation moves every point the same distance in the same direction.'],
      ['Which transformation has exactly one point that does not move?', 'A rotation by $90^\\circ$', ['A translation by $\\langle 3, 1 \\rangle$', 'A reflection over a line', 'A rotation by $360^\\circ$'], 'A rotation (not a full turn) fixes only its center. A reflection fixes every point on its line; a translation fixes none.']
    ]);
    return { q: dd[0], a: mc(dd[1], dd[2]), steps: [dd[3]], hint: 'Use the definition: what does each rigid motion keep the same?' };
  });

  G('geo.polygon-symmetry', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['minrot', 'lines', 'minrot', 'both'], ['tfrot', 'count', 'quad', 'which'], ['quad', 'sides', 'tfrot', 'count', 'which', 'both']));
    var NAMES = { 3: 'equilateral triangle', 4: 'square', 5: 'regular pentagon', 6: 'regular hexagon', 8: 'regular octagon', 9: 'regular nonagon', 10: 'regular decagon', 12: 'regular dodecagon', 15: 'regular 15-gon', 18: 'regular 18-gon', 20: 'regular 20-gon' };
    var n = R.pick(byL(ctx, [3, 4, 5, 6, 8, 9, 10, 12], [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20], [5, 6, 8, 9, 10, 12, 15, 18, 20])), nm = NAMES[n], step = 360 / n;
    if (kind === 'both') return { q: 'A ' + nm + ' is carried onto itself by some reflections and some rotations about its center. Give the number of lines of symmetry and the smallest positive rotation angle.', a: { t: 'multi', parts: [{ label: 'Lines of symmetry:', a: num(n) }, { label: 'Smallest rotation (degrees):', a: num(step) }] },
      steps: ['A regular polygon with ' + n + ' sides has ' + n + ' lines of symmetry, all through its center.', 'It turns onto itself every $360^\\circ \\div ' + n + ' = ' + deg(step) + '$.'], hint: 'Both answers come from the number of sides.' };
    if (kind === 'which') { var good = step * R.int(1, n - 1), bads = [10, 20, 25, 35, 50, 65, 80, 100, 110, 130, 140, 155, 170, 190, 200, 230, 260, 275, 290, 310, 320, 340].filter(function (x) { return x % step !== 0; });
      return { q: 'Which rotation about its center carries a ' + nm + ' onto itself?', a: mc('$' + deg(good) + '$', R.sample(bads, 3).map(function (x) { return '$' + deg(x) + '$'; })), steps: ['The rotations that work are the multiples of $360^\\circ \\div ' + n + ' = ' + deg(step) + '$.', '$' + deg(good) + ' = ' + good / step + ' \\cdot ' + deg(step) + '$ is one of them; the other angles are not multiples of $' + deg(step) + '$.'], hint: 'Find the multiple of 360° ÷ ' + n + '.' }; }
    if (kind === 'minrot') return { q: 'What is the smallest positive angle of rotation (about its center) that carries a ' + nm + ' onto itself?', a: num(step), viz: [3, 4, 5, 6, 8].indexOf(n) >= 0 ? { name: 'shapes', opts: { quiet: true, shape: { 3: 'equilateral', 4: 'square', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' }[n], show: ['symmetry'], drag: false, turn: false, controls: false }, label: 'A ' + nm } : undefined,
      steps: ['A regular polygon with ' + n + ' sides looks the same after you turn it one "vertex step".', 'The ' + n + ' steps share the full turn: $360^\\circ \\div ' + n + ' = ' + deg(step) + '$.'], hint: 'Divide 360° by the number of sides.' };
    if (kind === 'lines') return { q: 'How many lines of symmetry does a ' + nm + ' have?', a: num(n), steps: ['A regular polygon has as many lines of symmetry as sides.', n % 2 ? 'With an odd number of sides, each line goes through a vertex and the midpoint of the opposite side: ' + n + ' lines.' : 'With an even number of sides, ' + n / 2 + ' lines join opposite vertices and ' + n / 2 + ' join midpoints of opposite sides: ' + n + ' lines.'], hint: 'Count the mirror lines through the center.' };
    if (kind === 'tfrot') { var k = R.int(1, 6), ang2 = R.chance(0.55) ? step * R.int(1, n - 1) : R.pick([25, 40, 50, 70, 100, 135, 150, 210, 225, 250].filter(function (x) { return x % step !== 0; })); var ok = ang2 % step === 0;
      return { q: 'True or false: a rotation of $' + deg(ang2) + '$ about its center carries a ' + nm + ' onto itself.', a: tf(ok), steps: ['The rotations that work are multiples of $360^\\circ \\div ' + n + ' = ' + deg(step) + '$.', ok ? '$' + ang2 + ' = ' + ang2 / step + ' \\cdot ' + step + '$, a multiple, so it works.' : '$' + ang2 + ' \\div ' + step + '$ is not a whole number, so it does not.'], hint: 'Is the angle a multiple of 360° ÷ ' + n + '?' }; }
    if (kind === 'count') return { q: 'How many rotations with angles greater than $0^\\circ$ and less than $360^\\circ$ carry a ' + nm + ' onto itself?', a: num(n - 1), steps: ['They are the multiples of $' + deg(step) + '$: ' + U.range(1, n - 1).map(function (i) { return '$' + deg(i * step) + '$'; }).join(', ') + '.', 'That is $' + (n - 1) + '$ rotations (the next multiple is $360^\\circ$, a full turn).'], hint: 'List the multiples of 360° ÷ ' + n + ' below 360°.' };
    if (kind === 'sides') { var n2 = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72]), s2 = 360 / n2; return { q: 'The smallest positive rotation that carries a regular polygon onto itself is $' + deg(s2) + '$. How many sides does it have?', a: num(n2), steps: ['The smallest rotation is $360^\\circ \\div n$.', '$n = 360 \\div ' + s2 + ' = ' + n2 + '$.'], hint: 'Undo the division: 360° ÷ the angle.' }; }
    var Q4 = R.pick([['rectangle that is not a square', 2, '180^\\circ'], ['rhombus that is not a square', 2, '180^\\circ'], ['parallelogram that is not a rectangle or a rhombus', 0, '180^\\circ'], ['isosceles trapezoid', 1, 'none'], ['kite that is not a rhombus', 1, 'none'], ['square', 4, '90^\\circ']]);
    if (R.coin()) return { q: 'How many lines of symmetry does a ' + Q4[0] + ' have?', a: num(Q4[1]), steps: [{ 2: 'The lines through the midpoints of opposite sides (rectangle) or through opposite vertices (rhombus) work: 2 lines. The diagonals of a rectangle are not lines of symmetry, and neither are the side bisectors of a rhombus.', 0: 'No line folds a slanted parallelogram onto itself, even though a $180^\\circ$ turn does.', 1: 'Only one line works: the line through the midpoints of the two bases (trapezoid), or the diagonal joining the vertices between equal sides (kite).', 4: 'Two diagonals and two lines through the midpoints of opposite sides: 4 lines.' }[Q4[1]]], hint: 'Imagine folding the shape so the halves match.' };
    var opts = ['$90^\\circ$', '$180^\\circ$', 'No rotation less than $360^\\circ$ works', '$45^\\circ$'], right = Q4[2] === 'none' ? 2 : Q4[2] === '90^\\circ' ? 0 : 1;
    return { q: 'What is the smallest positive rotation (less than $360^\\circ$) that carries a ' + Q4[0] + ' onto itself?', a: mcKeep(opts, right), steps: [right === 2 ? 'A ' + Q4[0] + ' has a line of symmetry but no turn symmetry: only a full $360^\\circ$ turn brings it back.' : right === 0 ? 'A square turns onto itself every $90^\\circ$.' : 'A $180^\\circ$ turn about the point where the diagonals cross swaps opposite vertices, so it carries the shape onto itself.'], hint: 'Turn it around the center. When does it first look the same?' };
  });

  G('geo.compose-transformations', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['two', 'two', 'order'], ['two', 'order', 'single', 'rots'], ['single', 'order', 'parallel', 'two']));
    var P = [R.nz(-6, 6), R.nz(-6, 6)];
    function mkT() {
      var t = R.pick(['tr', 'rx', 'ry', 'r90', 'r180', 'rl']);
      if (t === 'tr') { var a = R.nz(-5, 5), b = R.nz(-5, 5); return { w: 'translate by $\\langle ' + a + ', ' + b + ' \\rangle$', f: function (p) { return [p[0] + a, p[1] + b]; } }; }
      if (t === 'rx') return { w: 'reflect over the $x$-axis', f: function (p) { return [p[0], -p[1]]; } };
      if (t === 'ry') return { w: 'reflect over the $y$-axis', f: function (p) { return [-p[0], p[1]]; } };
      if (t === 'r90') return { w: 'rotate $90^\\circ$ counterclockwise about the origin', f: function (p) { return [-p[1], p[0]]; } };
      if (t === 'r180') return { w: 'rotate $180^\\circ$ about the origin', f: function (p) { return [-p[0], -p[1]]; } };
      var c = R.nz(-3, 3), ln = R.coin() ? { t: 'x', c: c } : { t: 'y', c: c }; return { w: 'reflect over the line $' + lineName(ln) + '$', f: function (p) { return refl(p, ln); } };
    }
    if (kind === 'two') {
      var A = mkT(), B = mkT(); while (A.w === B.w) B = mkT(); var p1 = A.f(P), p2 = B.f(p1);
      return { q: 'Start with $P' + pt(P) + '$. First ' + A.w + ', then ' + B.w + '. Where does $P$ end up?', a: { t: 'tuple', v: p2.map(String) },
        steps: ['First: ' + A.w + ': $' + pt(P) + ' \\to ' + pt(p1) + '$.', 'Then: ' + B.w + ': $' + pt(p1) + ' \\to ' + pt(p2) + '$.'], hint: 'Do them one at a time, in the order given.' };
    }
    if (kind === 'order') {
      var A2, B2, ab, ba; do { A2 = mkT(); B2 = mkT(); ab = B2.f(A2.f(P)); ba = A2.f(B2.f(P)); } while (A2.w === B2.w);
      var same = ab[0] === ba[0] && ab[1] === ba[1];
      return { q: 'Transformation 1: ' + A2.w + '. Transformation 2: ' + B2.w + '. True or false: doing 1 then 2 sends $P' + pt(P) + '$ to the same point as doing 2 then 1.', a: tf(same),
        steps: ['1 then 2: $' + pt(P) + ' \\to ' + pt(A2.f(P)) + ' \\to ' + pt(ab) + '$.', '2 then 1: $' + pt(P) + ' \\to ' + pt(B2.f(P)) + ' \\to ' + pt(ba) + '$.', same ? 'They match here. Some pairs give the same result in either order, but many do not, so always check.' : 'They are different points: the order of transformations matters.'], hint: 'Work out both orders.' };
    }
    if (kind === 'single') {
      var s = R.pick([
        ['Reflect a figure over the $x$-axis, then over the $y$-axis. Which single transformation does the same thing?', 'A rotation of $180^\\circ$ about the origin', ['A reflection over the line $y = x$', 'A translation', 'A rotation of $90^\\circ$ about the origin'], '$(x, y) \\to (x, -y) \\to (-x, -y)$, which is the rule for a $180^\\circ$ rotation about the origin.'],
        ['Reflect over the $x$-axis, then over the line $y = x$. Which single transformation does the same thing?', 'A rotation of $90^\\circ$ counterclockwise about the origin', ['A rotation of $90^\\circ$ clockwise about the origin', 'A reflection over the $y$-axis', 'A rotation of $180^\\circ$ about the origin'], '$(x, y) \\to (x, -y) \\to (-y, x)$, which is the rule for a $90^\\circ$ counterclockwise rotation. (The lines meet at $45^\\circ$, and the rotation is twice that.)'],
        ['Rotate a figure $90^\\circ$ counterclockwise about the origin, then another $90^\\circ$ counterclockwise about the origin. Which single transformation does the same thing?', 'A rotation of $180^\\circ$ about the origin', ['A reflection over the $x$-axis', 'A rotation of $90^\\circ$ about the origin', 'A translation'], 'Rotations about the same center add: $90^\\circ + 90^\\circ = 180^\\circ$.'],
        ['Reflect a figure over two parallel lines. What single transformation does the same thing?', 'A translation', ['A rotation', 'A reflection', 'A dilation'], 'Two reflections over parallel lines slide the figure twice the distance between the lines, perpendicular to them.'],
        ['Reflect a figure over two lines that cross at point $C$. What single transformation does the same thing?', 'A rotation about $C$', ['A translation', 'A reflection over a third line', 'A dilation about $C$'], 'Two reflections over crossing lines turn the figure about the crossing point by twice the angle between the lines.']
      ]);
      return { q: s[0], a: mc(s[1], s[2]), steps: [s[3]], hint: 'Follow a point such as (2, 1) through both steps and look at the result.' };
    }
    if (kind === 'rots') { var a1 = R.pick([30, 45, 60, 90, 120]), a2 = R.pick([45, 60, 90, 150, 180, 210]), tot = (a1 + a2) % 360; return { q: 'A figure is rotated $' + deg(a1) + '$ counterclockwise about point $C$, then $' + deg(a2) + '$ counterclockwise about the same point $C$. The result is a single rotation about $C$ by how many degrees counterclockwise (between $0^\\circ$ and $360^\\circ$)?', a: num(tot), steps: ['Rotations about the same center add.', '$' + a1 + '^\\circ + ' + a2 + '^\\circ = ' + deg(a1 + a2) + '$' + (a1 + a2 >= 360 ? '. A full turn of $360^\\circ$ changes nothing, so it is $' + deg(a1 + a2) + ' - 360^\\circ = ' + deg(tot) + '$.' : '.')], hint: 'Add the angles.' }; }
    // parallel mirrors -> translation vector
    var c1 = R.int(-4, 3), c2 = c1 + R.nz(-4, 4), vert = R.coin(), v = vert ? [2 * (c2 - c1), 0] : [0, 2 * (c2 - c1)], img = [P[0] + v[0], P[1] + v[1]];
    var L1 = vert ? { t: 'x', c: c1 } : { t: 'y', c: c1 }, L2 = vert ? { t: 'x', c: c2 } : { t: 'y', c: c2 }, q1 = refl(P, L1), q2 = refl(q1, L2);
    return { q: 'Reflect $P' + pt(P) + '$ over $' + lineName(L1) + '$, then reflect the image over $' + lineName(L2) + '$. Where does $P$ end up?', a: { t: 'tuple', v: q2.map(String) },
      steps: ['First reflection: $' + pt(P) + ' \\to ' + pt(q1) + '$.', 'Second reflection: $' + pt(q1) + ' \\to ' + pt(q2) + '$.', 'Together they translate $P$ by $\\langle ' + v[0] + ', ' + v[1] + ' \\rangle$: twice the distance from the first line to the second.'], hint: 'Reflect once, then reflect the result.' };
  });

  /* ================================================================ Unit: Triangle Congruence */

  /* two triangles for a figure: P (3 points), Q (3 points), names n1/n2 (index i of n1 matches index i of n2),
     marks: {sides: [[i, j, ticks]], angs: [[i, arcs]], right: [i]} drawn on both triangles */
  function placeRight(P, Q, gap) {
    var maxP = M.max.apply(null, P.map(function (p) { return p[0]; })), minQ = M.min.apply(null, Q.map(function (p) { return p[0]; }));
    var cyP = (M.min.apply(null, P.map(function (p) { return p[1]; })) + M.max.apply(null, P.map(function (p) { return p[1]; }))) / 2;
    var cyQ = (M.min.apply(null, Q.map(function (p) { return p[1]; })) + M.max.apply(null, Q.map(function (p) { return p[1]; }))) / 2;
    return Q.map(function (q) { return [q[0] - minQ + maxP + (gap || 2.4), q[1] - cyQ + cyP]; });
  }
  function moved(R, P, k, th, flip) { // a rotated (and maybe reflected, scaled) copy of P
    th = th === undefined ? R.pick([0, 30, 75, 120, 180, 215, 290]) : th; flip = flip === undefined ? R.coin() : flip; k = k || 1;
    var t = th * M.PI / 180;
    return P.map(function (p) { var x = p[0], y = flip ? -p[1] : p[1]; return [k * (x * M.cos(t) - y * M.sin(t)), k * (x * M.sin(t) + y * M.cos(t))]; });
  }
  function pairFig(P, Q, n1, n2, marks, extra) {
    var o = { pts: {}, polys: [n1.concat([{ fill: 'blue' }]), n2.concat([{ fill: 'green' }])], segs: [], angs: [], groups: [n1, n2], height: 230 };
    n1.forEach(function (n, i) { o.pts[n] = P[i]; }); n2.forEach(function (n, i) { o.pts[n] = Q[i]; });
    [n1, n2].forEach(function (N) {
      (marks.sides || []).forEach(function (s) { o.segs.push([N[s[0]], N[s[1]], { tick: s[2] }]); });
      (marks.angs || []).forEach(function (a) { var i = a[0]; o.angs.push([N[(i + 2) % 3], N[i], N[(i + 1) % 3], { n: a[1], r: 18 + 3 * a[1] }]); });
      (marks.right || []).forEach(function (i) { o.angs.push([N[(i + 2) % 3], N[i], N[(i + 1) % 3], { right: 1 }]); });
    });
    return Object.assign(o, extra || {});
  }
  function baseTri(R, right) {
    if (right) { var a = R.int(3, 5), b = R.int(3, 6); return [[0, 0], [a + b * 0.2, 0], [0, b]].map(function (p) { return p; }).slice(0, 3); }
    var c = R.real(4.5, 6, 1), p = R.real(1, 3.6, 1), q = R.real(2.6, 3.8, 1); return [[0, 0], [c, 0], [p, q]];
  }
  function sideName(N, i, j) { return N[i] + N[j]; }
  /* a congruence case: kind in SSS SAS ASA AAS HL SSA AAA; returns {marks, words, right?} for index triangle 0,1,2 */
  function critMarks(R, kind) {
    var v = R.int(0, 2), w = (v + 1) % 3, x = (v + 2) % 3;
    if (kind === 'SSS') return { sides: [[0, 1, 1], [1, 2, 2], [2, 0, 3]] };
    if (kind === 'SAS') return { sides: [[x, v, 1], [v, w, 2]], angs: [[v, 1]] };
    if (kind === 'ASA') return { angs: [[v, 1], [w, 2]], sides: [[v, w, 1]] };
    if (kind === 'AAS') return { angs: [[v, 1], [w, 2]], sides: [[w, x, 1]] };
    if (kind === 'SSA') return { angs: [[v, 1]], sides: [[v, w, 1], [w, x, 2]] };
    if (kind === 'AAA') return { angs: [[0, 1], [1, 2], [2, 3]] };
    return null;
  }
  function marksWords(N1, N2, mk) {
    var out = [];
    (mk.sides || []).forEach(function (s) { out.push('$' + seg(N1[s[0]] + N1[s[1]]) + ' \\cong ' + seg(N2[s[0]] + N2[s[1]]) + '$'); });
    (mk.angs || []).forEach(function (a) { out.push('$' + ang(N1[a[0]]) + ' \\cong ' + ang(N2[a[0]]) + '$'); });
    (mk.right || []).forEach(function (i) { out.push('$' + ang(N1[i]) + '$ and $' + ang(N2[i]) + '$ are right angles'); });
    return U.list(out);
  }
  function critExplain(kind, N1, mk) {
    if (kind === 'SSS') return 'All three pairs of sides are congruent: SSS.';
    if (kind === 'SAS') return 'Two sides and the angle between them ($' + ang(N1[mk.angs[0][0]]) + '$, where the two marked sides meet): SAS.';
    if (kind === 'ASA') return 'Two angles and the side between them ($' + seg(N1[mk.sides[0][0]] + N1[mk.sides[0][1]]) + '$ joins the two angles): ASA.';
    if (kind === 'AAS') return 'Two angles and a side that is not between them: AAS. (The third angles must match too, so it works like ASA.)';
    if (kind === 'HL') return 'Right triangles with congruent hypotenuses and one pair of congruent legs: HL.';
    if (kind === 'SSA') return 'Two sides and an angle that is not between them (SSA). That is not enough: two different triangles can share these parts, as the picture shows.';
    return 'Three pairs of congruent angles (AAA) only make the triangles the same shape. One can be bigger, so this is not enough.';
  }
  function critProblem(R, kinds, choices) {
    var kind = R.pick(kinds), N1 = ['A', 'B', 'C'], N2 = R.pick([['D', 'E', 'F'], ['P', 'Q', 'R'], ['X', 'Y', 'Z']]);
    var perm = R.shuffle([0, 1, 2]), n1 = perm.map(function (i) { return N1[i]; }), n2 = perm.map(function (i) { return N2[i]; });
    var P, Q, mk;
    if (kind === 'HL') {
      var a = R.int(3, 5), b = R.int(3, 6); P = [[0, 0], [b, 0], [0, a]]; // right angle at index 0
      var legIdx = R.coin() ? 1 : 2; mk = { right: [0], sides: [[1, 2, 1], [0, legIdx, 2]] };
      Q = placeRight(P, moved(R, P));
    } else if (kind === 'SSA') {
      var al = R.int(30, 42), c = 6, aa = R.real(c * sinD(al) + 0.9, c - 0.8, 1), disc = M.sqrt(aa * aa - c * c * sinD(al) * sinD(al)), b1 = c * cosD(al) + disc, b2 = c * cosD(al) - disc;
      P = [[0, 0], [c, 0], [b1 * cosD(al), b1 * sinD(al)]]; var P2 = [[0, 0], [c, 0], [b2 * cosD(al), b2 * sinD(al)]];
      mk = { angs: [[0, 1]], sides: [[0, 1, 1], [1, 2, 2]] };
      Q = placeRight(P, moved(R, P2, 1, R.pick([0, 20, 340]), false));
    } else {
      P = baseTri(R); mk = critMarks(R, kind);
      Q = placeRight(P, moved(R, P, kind === 'AAA' ? R.pick([0.62, 1.4]) : 1));
    }
    var o = pairFig(P, Q, n1, n2, mk);
    var words = marksWords(n1, n2, mk), ans = { SSS: 'SSS', SAS: 'SAS', ASA: 'ASA', AAS: 'AAS', HL: 'HL', SSA: 'Not enough information', AAA: 'Not enough information' }[kind];
    var tA = n1.slice().sort(), order = [0, 1, 2].sort(function (i, j) { return n1[i] < n1[j] ? -1 : 1; });
    var nameA = order.map(function (i) { return n1[i]; }).join(''), nameB = order.map(function (i) { return n2[i]; }).join('');
    return { q: 'The marks show: ' + words + '. Which criterion proves $' + tri(nameA) + ' \\cong ' + tri(nameB) + '$?', a: mcKeep(choices, choices.indexOf(ans)), viz: fig(o, 'Two triangles with matching marks: ' + words.replace(/\$/g, '').replace(/\\cong/g, 'congruent to').replace(/\\overline\{(\w+)\}/g, '$1').replace(/\\angle /g, 'angle ')),
      steps: ['List what is marked: ' + words + '.', critExplain(kind, n1, mk), 'Answer: ' + ans + '.'], hint: 'Is the marked angle between the marked sides? Is the marked side between the marked angles?' };
  }

  G('geo.congruence-rigid-motions', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['which', 'third', 'must'], ['which', 'tf', 'third'], ['tf', 'which', 'third']));
    var TR = [
      { w: 'a translation by $\\langle a, b \\rangle$', f: null },
      { w: 'a reflection over the $x$-axis', f: function (p) { return [p[0], -p[1]]; } },
      { w: 'a reflection over the $y$-axis', f: function (p) { return [-p[0], p[1]]; } },
      { w: 'a reflection over the line $y = x$', f: function (p) { return [p[1], p[0]]; } },
      { w: 'a rotation of $90^\\circ$ counterclockwise about the origin', f: function (p) { return [-p[1], p[0]]; } },
      { w: 'a rotation of $180^\\circ$ about the origin', f: function (p) { return [-p[0], -p[1]]; } },
      { w: 'a rotation of $90^\\circ$ clockwise about the origin', f: function (p) { return [p[1], -p[0]]; } }
    ];
    var A = [R.int(1, 5), R.int(1, 4)], B = [A[0] + R.int(2, 4), A[1] + R.int(-1, 2)], C = [A[0] + R.int(0, 2), A[1] + R.int(2, 4)];
    if (R.coin()) { A[0] -= 3; B[0] -= 3; C[0] -= 3; }
    var P3 = [A, B, C];
    if (kind === 'which') {
      var ti = R.int(0, TR.length - 1), t = TR[ti], f;
      if (ti === 0) { var a = R.nz(-6, 6), b = R.nz(-5, 5); f = function (p) { return [p[0] + a, p[1] + b]; }; t = { w: 'a translation by $\\langle ' + a + ', ' + b + ' \\rangle$', f: f }; }
      var Q3 = P3.map(t.f), same = function (g) { return P3.every(function (p, i) { var r = g(p); return r[0] === Q3[i][0] && r[1] === Q3[i][1]; }); };
      var wrongs = TR.slice(1).filter(function (u) { return u.w !== t.w && !same(u.f); }).map(function (u) { return u.w; });
      if (ti !== 0) wrongs.push('a translation by $\\langle ' + (Q3[0][0] - A[0]) + ', ' + (Q3[0][1] - A[1]) + ' \\rangle$');
      var o = { pts: { A: A, B: B, C: C, D: Q3[0], E: Q3[1], F: Q3[2] }, polys: [['A', 'B', 'C', { fill: 'blue' }], ['D', 'E', 'F', { fill: 'green' }]], axes: true, groups: [['A', 'B', 'C'], ['D', 'E', 'F']], height: 280 };
      return { q: 'Which rigid motion maps $' + tri('ABC') + '$ onto $' + tri('DEF') + '$, with $A \\to D$, $B \\to E$ and $C \\to F$? ($A' + pt(A) + '$, $B' + pt(B) + '$, $C' + pt(C) + '$; $D' + pt(Q3[0]) + '$, $E' + pt(Q3[1]) + '$, $F' + pt(Q3[2]) + '$.)', a: mc(t.w.charAt(0).toUpperCase() + t.w.slice(1), R.shuffle(wrongs).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })), viz: fig(o, 'Triangles ABC and DEF on a grid'),
        steps: ['Test a rule on each vertex: it must send $A$ to $D$, $B$ to $E$ and $C$ to $F$.', 'It is ' + t.w + ': $A' + pt(A) + ' \\to ' + pt(Q3[0]) + '$, $B' + pt(B) + ' \\to ' + pt(Q3[1]) + '$, $C' + pt(C) + ' \\to ' + pt(Q3[2]) + '$.', 'Because a rigid motion maps one triangle onto the other, $' + tri('ABC') + ' \\cong ' + tri('DEF') + '$.'], hint: 'Check where A goes under each choice, then check B and C.' };
    }
    if (kind === 'tf') {
      var rigid = R.coin(), Q4;
      if (rigid) { var fn = R.pick(TR.slice(1)).f, sh = [R.int(-3, 3), R.int(-3, 3)]; Q4 = P3.map(function (p) { var r = fn(p); return [r[0] + sh[0], r[1] + sh[1]]; }); }
      else { var st = R.pick([[2, 1], [1, 2]]); Q4 = P3.map(function (p) { return [p[0] * st[0] - 4, p[1] * st[1] - 3]; }); }
      var sides1 = [dist2(A, B), dist2(B, C), dist2(C, A)], sides2 = [dist2(Q4[0], Q4[1]), dist2(Q4[1], Q4[2]), dist2(Q4[2], Q4[0])];
      var cong = sides1.every(function (s, i) { return s === sides2[i]; });
      return { q: '$' + tri('ABC') + '$ has vertices $A' + pt(A) + '$, $B' + pt(B) + '$, $C' + pt(C) + '$, and $' + tri('DEF') + '$ has vertices $D' + pt(Q4[0]) + '$, $E' + pt(Q4[1]) + '$, $F' + pt(Q4[2]) + '$. True or false: some rigid motion maps $' + tri('ABC') + '$ onto $' + tri('DEF') + '$ (with $A \\to D$, $B \\to E$, $C \\to F$).', a: tf(cong),
        steps: ['A rigid motion keeps every length, so matching sides must be equal. Compare squared lengths:', '$AB^2 = ' + sides1[0] + '$, $BC^2 = ' + sides1[1] + '$, $CA^2 = ' + sides1[2] + '$.', '$DE^2 = ' + sides2[0] + '$, $EF^2 = ' + sides2[1] + '$, $FD^2 = ' + sides2[2] + '$.', cong ? 'All three match, so the triangles are congruent (SSS), and a rigid motion maps one onto the other: true.' : 'They do not all match, so no rigid motion can do it: false.'], hint: 'Rigid motions keep lengths. Compare the side lengths.' };
    }
    if (kind === 'third') {
      var a2 = R.nz(-6, 6), b2 = R.nz(-6, 6), D2 = [A[0] + a2, A[1] + b2], img = [C[0] + a2, C[1] + b2];
      return { q: 'A translation maps $' + tri('ABC') + '$ onto $' + tri('DEF') + '$ with $A' + pt(A) + ' \\to D' + pt(D2) + '$. If $C = ' + pt(C) + '$, find $F$.', a: { t: 'tuple', v: img.map(String) },
        steps: ['The translation moves $A$ by $\\langle ' + a2 + ', ' + b2 + ' \\rangle$.', 'A translation moves every point by the same vector, so $F = (' + C[0] + T.signed(a2) + ', ' + C[1] + T.signed(b2) + ') = ' + pt(img) + '$.'], hint: 'Find how A moved, then move C the same way.' };
    }
    var m = R.pick([['$AB = DE$ and $' + mang('B') + ' = ' + mang('E') + '$', ['$AB = 2 \\cdot DE$', '$' + mang('A') + ' + ' + mang('D') + ' = 180^\\circ$', '$AB = EF$']], ['The perimeters of the two triangles are equal', ['$' + tri('ABC') + '$ and $' + tri('DEF') + '$ are in the same position', '$AB = DF$', 'The two triangles share a vertex']], ['$' + mang('C') + ' = ' + mang('F') + '$ and $CA = FD$', ['$' + mang('C') + ' = ' + mang('D') + '$', '$CA = DE$', '$' + mang('C') + ' = 90^\\circ$']]]);
    return { q: 'A rigid motion maps $' + tri('ABC') + '$ onto $' + tri('DEF') + '$, with $A \\to D$, $B \\to E$ and $C \\to F$. Which must be true?', a: mc(m[0], m[1]), steps: ['Rigid motions keep lengths and angle measures, so each part of $' + tri('ABC') + '$ equals the matching part of $' + tri('DEF') + '$.', 'Matching parts follow the letters: $A \\leftrightarrow D$, $B \\leftrightarrow E$, $C \\leftrightarrow F$.', 'So: ' + m[0] + '.'], hint: 'Match parts by the order of the letters.' };
  });

  G('geo.corresponding-parts', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['side', 'angle', 'num'], ['num', 'alg', 'side', 'angle'], ['fig', 'stmt', 'alg', 'num']));
    var L6 = letters(R, 6), N1 = L6.slice(0, 3), N2 = R.shuffle(L6.slice(3)), S = '$' + tri(N1.join('')) + ' \\cong ' + tri(N2.join('')) + '$';
    if (kind === 'side') {
      var i = R.int(0, 2), j = (i + R.int(1, 2)) % 3, right = N2[i] + N2[j], others = [[0, 1], [1, 2], [2, 0]].map(function (p) { return N2[p[0]] + N2[p[1]]; }).filter(function (s) { return s.split('').sort().join('') !== right.split('').sort().join(''); });
      return { q: 'Given ' + S + '. Which side corresponds to $' + seg(N1[i] + N1[j]) + '$?', a: mc('$' + seg(right) + '$', others.map(function (s) { return '$' + seg(s) + '$'; })),
        steps: ['Match letters by position: ' + N1.map(function (n, k) { return '$' + n + ' \\leftrightarrow ' + N2[k] + '$'; }).join(', ') + '.', '$' + N1[i] + '$ matches $' + N2[i] + '$ and $' + N1[j] + '$ matches $' + N2[j] + '$, so $' + seg(N1[i] + N1[j]) + '$ corresponds to $' + seg(right) + '$.'], hint: 'Use the order of the letters, not the picture.' };
    }
    if (kind === 'angle') {
      var k2 = R.int(0, 2);
      return { q: 'Given ' + S + '. Which angle is congruent to $' + ang(N1[k2]) + '$?', a: mc('$' + ang(N2[k2]) + '$', N2.filter(function (n, k) { return k !== k2; }).map(function (n) { return '$' + ang(n) + '$'; })),
        steps: ['$' + N1[k2] + '$ is letter ' + (k2 + 1) + ' in the first name, and letter ' + (k2 + 1) + ' in the second name is $' + N2[k2] + '$.', 'So $' + ang(N1[k2]) + ' \\cong ' + ang(N2[k2]) + '$.'], hint: 'Same position in the two names.' };
    }
    if (kind === 'num') {
      var a0 = R.int(30, 80), a1 = R.int(30, 150 - a0), a2 = 180 - a0 - a1, ask = R.int(0, 2), giv = [0, 1, 2].filter(function (k) { return k !== ask; });
      var vals = [a0, a1, a2];
      return { q: 'Given ' + S + ', $' + mang(N1[giv[0]]) + ' = ' + deg(vals[giv[0]]) + '$ and $' + mang(N1[giv[1]]) + ' = ' + deg(vals[giv[1]]) + '$. Find $' + mang(N2[ask]) + '$.', a: num(vals[ask]),
        steps: ['$' + ang(N2[ask]) + '$ corresponds to $' + ang(N1[ask]) + '$, so they have the same measure.', 'The angles of $' + tri(N1.join('')) + '$ add to $180^\\circ$: $' + mang(N1[ask]) + ' = 180 - ' + vals[giv[0]] + ' - ' + vals[giv[1]] + ' = ' + deg(vals[ask]) + '$.', 'So $' + mang(N2[ask]) + ' = ' + deg(vals[ask]) + '$.'], hint: 'Find the matching angle in the first triangle.' };
    }
    if (kind === 'alg') {
      var xv = R.int(2, 9), i2 = R.int(0, 2), j2 = (i2 + 1) % 3, P = eqPair(R, xv, 8, 40);
      return { q: 'Given ' + S + ', $' + N1[i2] + N1[j2] + ' = ' + lin(P.a, P.b) + '$ and $' + N2[i2] + N2[j2] + ' = ' + lin(P.c, P.d) + '$. Find $' + N1[i2] + N1[j2] + '$.', a: num(P.val),
        steps: ['$' + seg(N1[i2] + N1[j2]) + '$ and $' + seg(N2[i2] + N2[j2]) + '$ are corresponding sides, so they are equal.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['$' + N1[i2] + N1[j2] + ' = ' + P.a + '(' + xv + ')' + T.signed(P.b) + ' = ' + P.val + '$.']), hint: 'Corresponding sides are equal: set the expressions equal.' };
    }
    if (kind === 'fig') {
      var P1 = baseTri(R), Q1 = placeRight(P1, moved(R, P1, 1, R.pick([120, 180, 215, 290]), R.coin()));
      var lens = [dec(M.sqrt(dist2(P1[0], P1[1])), 1), dec(M.sqrt(dist2(P1[1], P1[2])), 1), dec(M.sqrt(dist2(P1[2], P1[0])), 1)];
      var o = pairFig(P1, Q1, N1, N2, {}); o.segs = [[N1[0], N1[1], { lab: lens[0] }], [N1[1], N1[2], { lab: lens[1] }], [N1[2], N1[0], { lab: lens[2] }]];
      var ii = R.int(0, 2), jj = (ii + 1) % 3, want = N2[ii] + N2[jj];
      return { q: 'Given ' + S + '. The side lengths of $' + tri(N1.join('')) + '$ are shown. Find $' + want + '$.', a: num(lens[ii]), viz: fig(o, 'Two congruent triangles; the second one is turned'),
        steps: ['The second triangle is turned, so do not match by position on the page. Use the letters.', '$' + N2[ii] + ' \\leftrightarrow ' + N1[ii] + '$ and $' + N2[jj] + ' \\leftrightarrow ' + N1[jj] + '$, so $' + want + ' = ' + N1[ii] + N1[jj] + ' = ' + lens[ii] + '$.'], hint: 'Find which letters of the first triangle match ' + N2[ii] + ' and ' + N2[jj] + '.' };
    }
    // stmt: an equivalent congruence statement
    var p = R.pick([[1, 2, 0], [2, 0, 1], [1, 0, 2], [0, 2, 1], [2, 1, 0]]), good = '$' + tri(p.map(function (k) { return N1[k]; }).join('')) + ' \\cong ' + tri(p.map(function (k) { return N2[k]; }).join('')) + '$';
    var bads = [], perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    R.shuffle(perms).forEach(function (q2) { if (q2.join() !== p.join() && bads.length < 3) bads.push('$' + tri(p.map(function (k) { return N1[k]; }).join('')) + ' \\cong ' + tri(q2.map(function (k) { return N2[k]; }).join('')) + '$'); });
    return { q: 'Given ' + S + '. Which statement says the same thing?', a: mc(good, bads),
      steps: ['A congruence statement lists matching vertices in the same order: ' + N1.map(function (n, k) { return '$' + n + ' \\leftrightarrow ' + N2[k] + '$'; }).join(', ') + '.', 'You may reorder the letters, as long as you reorder both names the same way: ' + good + '.'], hint: 'Each letter must stay paired with its partner.' };
  });

  G('geo.congruence-criteria', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['crit', 'crit', 'tf'], ['crit', 'need', 'crit'], ['need', 'crit', 'tf']));
    if (kind === 'crit') return critProblem(R, byL(ctx, ['SSS', 'SAS', 'ASA', 'SSS', 'SAS'], ['SSS', 'SAS', 'ASA', 'SSA', 'AAA'], ['SAS', 'ASA', 'SSA', 'AAA', 'SSS']), ['SSS', 'SAS', 'ASA', 'Not enough information']);
    if (kind === 'need') {
      var t = R.pick(['SAS', 'ASA', 'SSS']);
      if (t === 'SAS') return { q: 'In $' + tri('ABC') + '$ and $' + tri('DEF') + '$, $' + seg('AB') + ' \\cong ' + seg('DE') + '$ and $' + seg('BC') + ' \\cong ' + seg('EF') + '$. Which additional fact would prove $' + tri('ABC') + ' \\cong ' + tri('DEF') + '$ by SAS?', a: mc('$' + ang('B') + ' \\cong ' + ang('E') + '$', ['$' + ang('A') + ' \\cong ' + ang('D') + '$', '$' + ang('C') + ' \\cong ' + ang('F') + '$', '$' + ang('B') + ' \\cong ' + ang('F') + '$']),
        steps: ['SAS needs the angle between the two sides.', '$' + seg('AB') + '$ and $' + seg('BC') + '$ meet at $B$; $' + seg('DE') + '$ and $' + seg('EF') + '$ meet at $E$.', 'So we need $' + ang('B') + ' \\cong ' + ang('E') + '$. ($' + ang('A') + ' \\cong ' + ang('D') + '$ would give SSA, which is not enough.)'], hint: 'Where do the two given sides meet?' };
      if (t === 'ASA') return { q: 'In $' + tri('ABC') + '$ and $' + tri('DEF') + '$, $' + ang('A') + ' \\cong ' + ang('D') + '$ and $' + ang('B') + ' \\cong ' + ang('E') + '$. Which additional fact would prove $' + tri('ABC') + ' \\cong ' + tri('DEF') + '$ by ASA?', a: mc('$' + seg('AB') + ' \\cong ' + seg('DE') + '$', ['$' + ang('C') + ' \\cong ' + ang('F') + '$', '$' + seg('AB') + ' \\cong ' + seg('EF') + '$', '$' + seg('AC') + ' \\cong ' + seg('DE') + '$']),
        steps: ['ASA needs the side between the two angles.', 'The side joining $A$ and $B$ is $' + seg('AB') + '$, and the side joining $D$ and $E$ is $' + seg('DE') + '$.', 'So we need $' + seg('AB') + ' \\cong ' + seg('DE') + '$. ($' + ang('C') + ' \\cong ' + ang('F') + '$ would only give AAA.)'], hint: 'Which side connects the two given angles?' };
      return { q: 'In $' + tri('PQR') + '$ and $' + tri('STU') + '$, $' + seg('PQ') + ' \\cong ' + seg('ST') + '$ and $' + seg('QR') + ' \\cong ' + seg('TU') + '$. Which additional fact would prove $' + tri('PQR') + ' \\cong ' + tri('STU') + '$ by SSS?', a: mc('$' + seg('PR') + ' \\cong ' + seg('SU') + '$', ['$' + seg('PR') + ' \\cong ' + seg('ST') + '$', '$' + ang('Q') + ' \\cong ' + ang('T') + '$', '$' + seg('QR') + ' \\cong ' + seg('SU') + '$']),
        steps: ['SSS needs the third pair of sides.', '$P \\leftrightarrow S$ and $R \\leftrightarrow U$, so $' + seg('PR') + '$ matches $' + seg('SU') + '$.'], hint: 'Match the letters in order.' };
    }
    var f = R.pick([['SSA (two sides and an angle that is not between them) always proves two triangles congruent.', false, 'Two different triangles can have the same SSA parts, so SSA is not a congruence criterion.'], ['AAA proves two triangles congruent.', false, 'Equal angles only fix the shape. A triangle and an enlarged copy have the same angles but different sides.'], ['SSS proves two triangles congruent.', true, 'Three side lengths fix a triangle completely: SSS works.'], ['In SAS, the angle must be between the two sides.', true, 'The angle has to be the one formed by the two sides; otherwise it is SSA.'], ['In ASA, the side can be any side of the triangle.', false, 'In ASA the side is the one between the two angles. (A side that is not between them is AAS, a different criterion.)']]);
    return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Try to build two different triangles with the same parts.' };
  });

  G('geo.aas-hl', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['crit', 'hlnum', 'crit'], ['crit', 'need', 'hlnum'], ['crit', 'need', 'tf']));
    if (kind === 'crit') return critProblem(R, byL(ctx, ['AAS', 'HL', 'ASA', 'AAS', 'HL'], ['AAS', 'HL', 'ASA', 'SSA', 'SAS'], ['AAS', 'HL', 'SSA', 'AAA', 'ASA']), ['ASA', 'AAS', 'HL', 'SAS', 'Not enough information']);
    if (kind === 'hlnum') {
      var tr = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]), legGiven = R.coin() ? tr[0] : tr[1], other = legGiven === tr[0] ? tr[1] : tr[0];
      return { q: 'Right triangles $ABC$ and $DEF$ have right angles at $C$ and $F$. $AB = DE = ' + tr[2] + '$ and $AC = DF = ' + legGiven + '$. Find $EF$.', a: num(other),
        steps: ['The hypotenuses ($' + seg('AB') + '$, $' + seg('DE') + '$) and one pair of legs ($' + seg('AC') + '$, $' + seg('DF') + '$) are congruent, so $' + tri('ABC') + ' \\cong ' + tri('DEF') + '$ by HL.', 'So $EF = BC$. By the Pythagorean theorem, $BC = \\sqrt{' + tr[2] + '^2 - ' + legGiven + '^2} = \\sqrt{' + (tr[2] * tr[2] - legGiven * legGiven) + '} = ' + other + '$.', 'This is why HL works: the hypotenuse and one leg already fix the third side.'], hint: 'The triangles are congruent by HL, so EF = BC. Use the Pythagorean theorem.' };
    }
    if (kind === 'need') {
      if (R.coin()) return { q: 'In $' + tri('ABC') + '$ and $' + tri('DEF') + '$, $' + ang('A') + ' \\cong ' + ang('D') + '$ and $' + ang('B') + ' \\cong ' + ang('E') + '$. Which additional fact would prove the triangles congruent by AAS?', a: mc('$' + seg('BC') + ' \\cong ' + seg('EF') + '$', ['$' + seg('AB') + ' \\cong ' + seg('DE') + '$', '$' + ang('C') + ' \\cong ' + ang('F') + '$', '$' + seg('BC') + ' \\cong ' + seg('DF') + '$']),
        steps: ['AAS needs a pair of matching sides that is not between the two angles.', '$' + seg('AB') + '$ is between $A$ and $B$ (that would be ASA). $' + seg('BC') + '$ and $' + seg('EF') + '$ are matching sides not between the angles, so they give AAS. ($' + seg('AC') + ' \\cong ' + seg('DF') + '$ would also work.)'], hint: 'Choose a pair of matching sides that does not join the two angles.' };
      return { q: 'Right triangles $PQR$ and $STU$ have right angles at $Q$ and $T$, and $' + seg('PR') + ' \\cong ' + seg('SU') + '$. Which additional fact would prove them congruent by HL?', a: mc('$' + seg('PQ') + ' \\cong ' + seg('ST') + '$', ['$' + ang('P') + ' \\cong ' + ang('S') + '$', '$' + seg('PQ') + ' \\cong ' + seg('TU') + '$', '$' + ang('R') + ' \\cong ' + ang('Q') + '$']),
        steps: ['$' + seg('PR') + '$ and $' + seg('SU') + '$ are opposite the right angles: they are the hypotenuses.', 'HL also needs a pair of matching legs: $' + seg('PQ') + '$ and $' + seg('ST') + '$ (or $' + seg('QR') + '$ and $' + seg('TU') + '$).', '($' + ang('P') + ' \\cong ' + ang('S') + '$ would prove it too, but by AAS, not HL.)'], hint: 'HL = hypotenuse and a leg.' };
    }
    var f = R.pick([['HL works for any two triangles with two pairs of congruent sides.', false, 'HL is only for right triangles: the right angle is what makes "hypotenuse and leg" enough.'], ['AAS works because two pairs of congruent angles make the third angles congruent too.', true, 'The angles add to $180^\\circ$, so the third angles match, and AAS becomes ASA.'], ['HL is a special case of SSA that does work.', true, 'The right angle is not between the hypotenuse and the leg, so HL looks like SSA. It works because the Pythagorean theorem fixes the third side.'], ['AAS and ASA are the same criterion.', false, 'They differ in where the side is: between the angles (ASA) or not (AAS). Both prove congruence.']]);
    return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Think about why each criterion works.' };
  });

  function cproofs(R) {
    return [
      { name: 'kite', given: '$' + seg('AB') + ' \\cong ' + seg('CB') + '$ and $' + seg('AD') + ' \\cong ' + seg('CD') + '$', prove: '$' + ang('A') + ' \\cong ' + ang('C') + '$', fig: { pts: { B: [0, 4], A: [-2.6, 1.3], C: [2.6, 1.3], D: [0, -1.8] }, polys: [['A', 'B', 'C', 'D', { fill: 'blue' }]], segs: [['B', 'D', { dash: 1 }], ['A', 'B', { tick: 1 }], ['C', 'B', { tick: 1 }], ['A', 'D', { tick: 2 }], ['C', 'D', { tick: 2 }]], height: 220 },
        s: [['$' + seg('AB') + ' \\cong ' + seg('CB') + '$, $' + seg('AD') + ' \\cong ' + seg('CD') + '$', 'Given'], ['$' + seg('BD') + ' \\cong ' + seg('BD') + '$', 'Reflexive Property'], ['$' + tri('ABD') + ' \\cong ' + tri('CBD') + '$', 'SSS'], ['$' + ang('A') + ' \\cong ' + ang('C') + '$', 'CPCTC']], cong: 2 },
      { name: 'cross', given: '$E$ is the midpoint of $' + seg('AD') + '$ and of $' + seg('BC') + '$', prove: '$' + seg('AB') + ' \\cong ' + seg('DC') + '$', fig: { pts: { A: [0, 3], B: [0, 0], C: [6, 3], D: [6, 0], E: [3, 1.5] }, polys: [['A', 'B', 'E', { fill: 'blue' }], ['D', 'C', 'E', { fill: 'green' }]], segs: [['A', 'E', { tick: 1 }], ['E', 'D', { tick: 1 }], ['B', 'E', { tick: 2 }], ['E', 'C', { tick: 2 }]], height: 200 },
        s: [['$E$ is the midpoint of $' + seg('AD') + '$ and $' + seg('BC') + '$', 'Given'], ['$' + seg('AE') + ' \\cong ' + seg('DE') + '$, $' + seg('BE') + ' \\cong ' + seg('CE') + '$', 'Definition of midpoint'], ['$' + ang('AEB') + ' \\cong ' + ang('DEC') + '$', 'Vertical Angles Theorem'], ['$' + tri('ABE') + ' \\cong ' + tri('DCE') + '$', 'SAS'], ['$' + seg('AB') + ' \\cong ' + seg('DC') + '$', 'CPCTC']], cong: 3 },
      { name: 'bisect', given: '$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$ and $' + seg('BD') + ' \\perp ' + seg('AC') + '$', prove: '$' + seg('AD') + ' \\cong ' + seg('CD') + '$', fig: { pts: { B: [0, 4], A: [-3, 0], C: [3, 0], D: [0, 0] }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [['B', 'D']], angs: [['A', 'B', 'D', { r: 30 }], ['D', 'B', 'C', { r: 30 }], ['B', 'D', 'C', { right: 1 }]], height: 200 },
        s: [['$\\overrightarrow{BD}$ bisects $' + ang('ABC') + '$; $' + seg('BD') + ' \\perp ' + seg('AC') + '$', 'Given'], ['$' + ang('ABD') + ' \\cong ' + ang('CBD') + '$', 'Definition of angle bisector'], ['$' + ang('ADB') + '$ and $' + ang('CDB') + '$ are right angles', 'Definition of perpendicular lines'], ['$' + ang('ADB') + ' \\cong ' + ang('CDB') + '$', 'All right angles are congruent'], ['$' + seg('BD') + ' \\cong ' + seg('BD') + '$', 'Reflexive Property'], ['$' + tri('ABD') + ' \\cong ' + tri('CBD') + '$', 'ASA'], ['$' + seg('AD') + ' \\cong ' + seg('CD') + '$', 'CPCTC']], cong: 5 },
      { name: 'zig', given: '$' + seg('AB') + ' \\parallel ' + seg('DE') + '$ and $C$ is the midpoint of $' + seg('AE') + '$', prove: '$' + seg('BC') + ' \\cong ' + seg('DC') + '$', fig: { pts: { A: [0, 3], B: [3.5, 3], E: [6, 0], D: [2.5, 0], C: [3, 1.5] }, polys: [['A', 'B', 'C', { fill: 'blue' }], ['E', 'D', 'C', { fill: 'green' }]], segs: [['A', 'B', { arrow: 1 }], ['D', 'E', { arrow: 1 }], ['A', 'C', { tick: 1 }], ['C', 'E', { tick: 1 }]], height: 200 },
        s: [['$' + seg('AB') + ' \\parallel ' + seg('DE') + '$; $C$ is the midpoint of $' + seg('AE') + '$', 'Given'], ['$' + seg('AC') + ' \\cong ' + seg('EC') + '$', 'Definition of midpoint'], ['$' + ang('A') + ' \\cong ' + ang('E') + '$', 'Alternate Interior Angles Theorem'], ['$' + ang('ACB') + ' \\cong ' + ang('ECD') + '$', 'Vertical Angles Theorem'], ['$' + tri('ABC') + ' \\cong ' + tri('EDC') + '$', 'ASA'], ['$' + seg('BC') + ' \\cong ' + seg('DC') + '$', 'CPCTC']], cong: 4 },
      { name: 'hl', given: '$' + seg('AB') + ' \\perp ' + seg('BC') + '$, $' + seg('DC') + ' \\perp ' + seg('BC') + '$ and $' + seg('AC') + ' \\cong ' + seg('DB') + '$', prove: '$' + seg('AB') + ' \\cong ' + seg('DC') + '$', fig: { pts: { A: [0, 3], B: [0, 0], C: [5, 0], D: [5, 3] }, segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['A', 'C', { tick: 1, color: 'blue' }], ['D', 'B', { tick: 1, color: 'green' }]], angs: [['A', 'B', 'C', { right: 1 }], ['B', 'C', 'D', { right: 1 }]], height: 190 },
        s: [['$' + seg('AB') + ' \\perp ' + seg('BC') + '$, $' + seg('DC') + ' \\perp ' + seg('BC') + '$', 'Given'], ['$' + ang('ABC') + '$ and $' + ang('DCB') + '$ are right angles', 'Definition of perpendicular lines'], ['$' + seg('AC') + ' \\cong ' + seg('DB') + '$', 'Given'], ['$' + seg('BC') + ' \\cong ' + seg('CB') + '$', 'Reflexive Property'], ['$' + tri('ABC') + ' \\cong ' + tri('DCB') + '$', 'HL'], ['$' + seg('AB') + ' \\cong ' + seg('DC') + '$', 'CPCTC']], cong: 4 }
    ];
  }
  var CREASONS = ['Given', 'Reflexive Property', 'Vertical Angles Theorem', 'Definition of midpoint', 'Definition of angle bisector', 'Definition of perpendicular lines', 'All right angles are congruent', 'Alternate Interior Angles Theorem', 'Corresponding Angles Theorem', 'SSS', 'SAS', 'ASA', 'AAS', 'HL', 'CPCTC', 'Symmetric Property'];
  G('geo.congruence-proofs', function (R, ctx) {
    var P = R.pick(cproofs(R)), kind = R.pick(byL(ctx, ['reason', 'crit', 'reason'], ['reason', 'crit', 'stmt', 'flaw'], ['flaw', 'stmt', 'reason', 'crit']));
    var head = '<b>Given:</b> ' + P.given + '<br><b>Prove:</b> ' + P.prove + '<br>', viz = fig(P.fig, 'A diagram for the proof');
    var full = P.s.map(function (r, i) { return (i + 1) + '. ' + r[0] + ' — ' + r[1]; });
    function table(k, mode) { return P.s.map(function (r, i) { return (i + 1) + '. ' + (i === k && mode === 'stmt' ? '<b>?</b>' : r[0]) + ' — ' + (i === k && mode !== 'stmt' ? '<b>?</b>' : r[1]); }).join('<br>'); }
    if (kind === 'crit') {
      var k = P.cong, right = P.s[k][1], opts = ['SSS', 'SAS', 'ASA', 'AAS', 'HL'];
      return { q: head + table(k, 'reason') + '<br>Which congruence criterion justifies step ' + (k + 1) + '?', a: mcKeep(opts, opts.indexOf(right)), viz: viz,
        steps: full.concat(['The parts used before step ' + (k + 1) + ' are exactly the ones ' + right + ' needs.', right === 'ASA' ? 'Two angles and the side between them.' : right === 'SAS' ? 'Two sides and the angle between them.' : right === 'SSS' ? 'Three pairs of sides.' : right === 'HL' ? 'Right triangles, with the hypotenuses and a pair of legs congruent.' : 'Two angles and a side that is not between them.']), hint: 'List the three pairs of parts the proof has shown congruent so far.' };
    }
    if (kind === 'reason') {
      var k2 = R.pick(P.s.map(function (_, i) { return i; }).filter(function (i) { return i > 0 && i !== P.cong; })), right2 = P.s[k2][1];
      var close = { 'Reflexive Property': ['Symmetric Property', 'Given'], 'Vertical Angles Theorem': ['Alternate Interior Angles Theorem', 'Corresponding Angles Theorem'], 'Alternate Interior Angles Theorem': ['Corresponding Angles Theorem', 'Vertical Angles Theorem'], 'CPCTC': ['SSS', 'Given'], 'Definition of midpoint': ['Definition of angle bisector', 'Given'], 'Definition of angle bisector': ['Definition of midpoint', 'Given'], 'Definition of perpendicular lines': ['All right angles are congruent', 'Given'], 'All right angles are congruent': ['Definition of perpendicular lines', 'Reflexive Property'], 'Given': ['CPCTC', 'Reflexive Property'] }[right2] || [];
      var w = close.slice(); R.shuffle(CREASONS).forEach(function (x) { if (x !== right2 && w.indexOf(x) < 0) w.push(x); });
      return { q: head + table(k2, 'reason') + '<br>Which reason belongs in step ' + (k2 + 1) + '?', a: mc(right2, w.slice(0, 3)), viz: viz, steps: full, hint: right2 === 'CPCTC' ? 'The triangles are already proved congruent. What follows about their matching parts?' : 'Look at the diagram and the given information.' };
    }
    if (kind === 'stmt') {
      var k3 = R.pick([P.cong, P.s.length - 1, 1]), wr = [];
      if (k3 === P.cong) { var tri2 = P.s[k3][0], m = /\\triangle (\w+) \\cong \\triangle (\w+)/.exec(tri2), a2 = m[1], b2 = m[2]; wr = ['$' + tri(a2) + ' \\cong ' + tri(b2.charAt(1) + b2.charAt(0) + b2.charAt(2)) + '$', '$' + tri(a2) + ' \\cong ' + tri(b2.charAt(2) + b2.charAt(1) + b2.charAt(0)) + '$', '$' + tri(a2) + ' \\cong ' + tri(b2.charAt(0) + b2.charAt(2) + b2.charAt(1)) + '$']; }
      else wr = P.s.filter(function (_, i) { return i !== k3; }).map(function (r) { return r[0]; });
      return { q: head + table(k3, 'stmt') + '<br>Which statement belongs in step ' + (k3 + 1) + '?', a: mc(P.s[k3][0], R.shuffle(wr.filter(function (x) { return x !== P.s[k3][0]; }))), viz: viz, steps: full.concat(k3 === P.cong ? ['The vertex order must match: each letter pairs with the letter in the same place.'] : []), hint: k3 === P.cong ? 'Match the vertices in the right order.' : 'The reason tells you what kind of statement it is: ' + P.s[k3][1] + '.' };
    }
    // flaw: CPCTC used before the triangles are proved congruent
    var rows = P.s.slice(), last = rows.pop(), cpIdx = R.int(1, P.cong); rows.splice(cpIdx, 0, last);
    var ch = rows.map(function (_, i) { return 'Step ' + (i + 1); });
    return { q: head + rows.map(function (r, i) { return (i + 1) + '. ' + r[0] + ' — ' + r[1]; }).join('<br>') + '<br>One step uses a reason before it is allowed. Which step?', a: mcKeep(ch, cpIdx), viz: viz,
      steps: ['Step ' + (cpIdx + 1) + ' uses CPCTC, but the triangles are not proved congruent until step ' + (P.cong + 2) + '.', 'CPCTC (corresponding parts of congruent triangles are congruent) can only come after the congruence statement.', 'Correct order:'].concat(full), hint: 'CPCTC needs congruent triangles first.' };
  });

  /* ================================================================ Unit: Properties of Triangles */

  /* a triangle drawn from its angles (degrees): A at the origin, AB along a direction, labels at each vertex */
  function triFromAngles(a, b, rotDeg, size) {
    size = size || 6; var c = 180 - a - b, AB = size, AC = AB * sinD(b) / sinD(c), t = (rotDeg || 0) * M.PI / 180;
    var P = [[0, 0], [AB, 0], [AC * cosD(a), AC * sinD(a)]];
    return P.map(function (p) { return [p[0] * M.cos(t) - p[1] * M.sin(t), p[0] * M.sin(t) + p[1] * M.cos(t)]; });
  }
  function triFig(P, N, o) {
    o = o || {}; var f = { pts: {}, polys: [N.concat([{ fill: o.fill || 'blue' }])], angs: [], segs: [], height: o.height || 220 };
    N.forEach(function (n, i) { f.pts[n] = P[i]; });
    (o.angLabs || []).forEach(function (lab, i) { if (lab) f.angs.push([N[(i + 2) % 3], N[i], N[(i + 1) % 3], { lab: lab, n: 1, color: o.angCol && o.angCol[i] || 'red' }]); });
    (o.sideLabs || []).forEach(function (lab, i) { if (lab || (o.ticks && o.ticks[i])) f.segs.push([N[i], N[(i + 1) % 3], { lab: lab || '', tick: o.ticks ? o.ticks[i] : 0 }]); });
    return f;
  }

  G('geo.triangle-theorems', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['missing', 'ext', 'missing', 'extrev'], ['alg', 'extrev', 'proof', 'ext'], ['extalg', 'ratio', 'proof', 'alg']));
    var a = R.int(30, 85), b = R.int(25, 150 - a), c = 180 - a - b;
    if (kind === 'missing') {
      var P = triFromAngles(a, b, R.int(-10, 10));
      return { q: 'In $' + tri('ABC') + '$, $' + mang('A') + ' = ' + deg(a) + '$ and $' + mang('B') + ' = ' + deg(b) + '$. Find $' + mang('C') + '$.', a: num(c), viz: fig(triFig(P, ['A', 'B', 'C'], { angLabs: [a + '°', b + '°', '?'] }), 'Triangle ABC with two angles labeled'),
        steps: ['The angles of a triangle add to $180^\\circ$.', '$' + mang('C') + ' = 180 - ' + a + ' - ' + b + ' = ' + deg(c) + '$.'], hint: 'Subtract the two known angles from 180°.' };
    }
    function extFig(lab) { var P = triFromAngles(a, b, 0), C = P[2], B = P[1], d = [C[0] - B[0], C[1] - B[1]], L = M.sqrt(d[0] * d[0] + d[1] * d[1]), D = [C[0] + d[0] / L * 2.6, C[1] + d[1] / L * 2.6];
      return fig({ pts: { A: P[0], B: B, C: C, D: D }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [['C', 'D']], angs: [['C', 'A', 'B', { lab: lab[0] }], ['A', 'B', 'C', { lab: lab[1] }], ['A', 'C', 'D', { lab: lab[2], color: 'blue', r: 20 }]], height: 230 }, 'Triangle ABC with side BC extended to D, making exterior angle ACD'); }
    if (kind === 'ext') return { q: 'Side $' + seg('BC') + '$ of $' + tri('ABC') + '$ is extended to $D$. If $' + mang('A') + ' = ' + deg(a) + '$ and $' + mang('B') + ' = ' + deg(b) + '$, find the exterior angle $' + mang('ACD') + '$.', a: num(a + b), viz: extFig([a + '°', b + '°', '?']),
      steps: ['An exterior angle equals the sum of the two remote (non-adjacent) interior angles.', '$' + mang('ACD') + ' = ' + a + ' + ' + b + ' = ' + deg(a + b) + '$.', 'Check: $' + mang('ACB') + ' = 180 - ' + (a + b) + ' = ' + c + '$, and $' + c + ' + ' + (a + b) + ' = 180$ (a linear pair).'], hint: 'Add the two angles that are not next to the exterior angle.' };
    if (kind === 'extrev') return { q: 'Side $' + seg('BC') + '$ of $' + tri('ABC') + '$ is extended to $D$. The exterior angle $' + mang('ACD') + ' = ' + deg(a + b) + '$ and $' + mang('A') + ' = ' + deg(a) + '$. Find $' + mang('B') + '$.', a: num(b), viz: extFig([a + '°', '?', (a + b) + '°']),
      steps: ['Exterior angle = sum of the remote interior angles: $' + mang('ACD') + ' = ' + mang('A') + ' + ' + mang('B') + '$.', '$' + (a + b) + ' = ' + a + ' + ' + mang('B') + '$, so $' + mang('B') + ' = ' + deg(b) + '$.'], hint: 'The exterior angle is the sum of A and B.' };
    if (kind === 'alg') {
      var xv = R.int(5, 25), e1 = expr(R, xv, a, 1, 3), e2 = expr(R, xv, b, 2, 4), e3 = expr(R, xv, c, 1, 5);
      var st = sumSteps([e1, e2, e3], 180, xv); st.unshift('The three angles add to $180^\\circ$.'); st.push('The angles are $' + deg(a) + '$, $' + deg(b) + '$ and $' + deg(c) + '$; check: they add to $180^\\circ$.');
      return { q: 'The angles of a triangle measure $(' + e1.tex + ')^\\circ$, $(' + e2.tex + ')^\\circ$ and $(' + e3.tex + ')^\\circ$. Find $x$.', a: num(xv), steps: st, hint: 'Add the three expressions and set the sum equal to 180.' };
    }
    if (kind === 'extalg') {
      var xv2 = R.int(5, 12), r1 = expr(R, xv2, a, 1, 3), r2 = expr(R, xv2, b, 1, 4), ex = expr(R, xv2, a + b, r1.a + r2.a + 1, r1.a + r2.a + 3);
      var A2 = ex.a - r1.a - r2.a, B2 = r1.b + r2.b - ex.b;
      return { q: 'An exterior angle of a triangle measures $(' + ex.tex + ')^\\circ$. The two remote interior angles measure $(' + r1.tex + ')^\\circ$ and $(' + r2.tex + ')^\\circ$. Find $x$.', a: num(xv2),
        steps: ['Exterior angle = sum of the remote interior angles: $' + ex.tex + ' = (' + r1.tex + ') + (' + r2.tex + ')$.', 'Combine: $' + ex.tex + ' = ' + lin(r1.a + r2.a, r1.b + r2.b) + '$.', 'Collect terms: $' + T.mono(A2, 'x') + ' = ' + B2 + '$' + (A2 === 1 ? '.' : ', so $x = ' + xv2 + '$.'), 'The exterior angle is $' + deg(a + b) + '$.'], hint: 'Set the exterior angle equal to the sum of the other two.' };
    }
    if (kind === 'ratio') { var r = R.pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [1, 3, 5], [2, 3, 7], [1, 4, 7], [4, 5, 9]]), s = r[0] + r[1] + r[2], k = 180 / s;
      return { q: 'The angles of a triangle are in the ratio $' + r.join(' : ') + '$. Find the largest angle.', a: num(r[2] * k), steps: ['Call the angles ' + r.map(function (v) { return '$' + (v === 1 ? '' : v) + 'k$'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.', 'They add to $180$: $' + s + 'k = 180$, so $k = ' + T.num(k) + '$.', 'Largest: $' + r[2] + ' \\cdot ' + T.num(k) + ' = ' + deg(r[2] * k) + '$.'], hint: 'Write the angles as multiples of one unknown.' }; }
    var pq = R.pick([
      ['To prove the triangle sum theorem, draw the line through $B$ parallel to $' + seg('AC') + '$. Why is the angle at $B$ next to $' + seg('BA') + '$ congruent to $' + ang('A') + '$?', 'They are alternate interior angles, and the lines are parallel.', ['They are vertical angles.', 'They are corresponding angles of congruent triangles.', 'They form a linear pair.'], 'With the parallel line through $B$, the transversal $\\overleftrightarrow{AB}$ makes alternate interior angles, which are congruent.'],
      ['In the triangle sum proof, three angles at $B$ (one is $' + ang('ABC') + '$, the other two copy $' + ang('A') + '$ and $' + ang('C') + '$) sit side by side along a line. Why do they add to $180^\\circ$?', 'They make a straight angle.', ['They are vertical angles.', 'They are the angles of a triangle.', 'They are complementary.'], 'Together the three angles fill a straight line through $B$, which measures $180^\\circ$.'],
      ['Why is an exterior angle of a triangle equal to the sum of the two remote interior angles?', 'It forms a linear pair with the third angle, and the three interior angles also add to $180^\\circ$.', ['It is a vertical angle of the third angle.', 'Exterior angles are always $90^\\circ$.', 'The remote angles are congruent to it.'], 'Exterior + third angle $= 180^\\circ$ and all three interior angles $= 180^\\circ$, so the exterior angle equals the other two angles together.']
    ]);
    return { q: pq[0], a: mc(pq[1], pq[2]), steps: [pq[3]], hint: 'Which earlier theorem about lines and angles applies?' };
  });

  G('geo.isosceles-triangles', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['base', 'vertex', 'which'], ['alg', 'sides', 'which', 'base'], ['algv', 'equi', 'sides', 'alg']));
    var L = letters(R, 3), A = L[0], B = L[1], C = L[2]; // A apex, AB = AC
    function isoFig(v, labs, rot) { var bse = (180 - v) / 2, P = triFromAngles(bse, bse, rot === undefined ? R.pick([0, 0, 35, 160, 210, 290]) : rot); // P[0], P[1] base, P[2] apex
      var f = { pts: {}, polys: [[B, C, A, { fill: 'blue' }]], segs: [[A, B, { tick: 1 }], [A, C, { tick: 1 }]], angs: [], height: 220 }; f.pts[B] = P[0]; f.pts[C] = P[1]; f.pts[A] = P[2];
      if (labs) { if (labs[0]) f.angs.push([C, A, B, { lab: labs[0] }]); if (labs[1]) f.angs.push([A, B, C, { lab: labs[1], color: 'blue' }]); if (labs[2]) f.angs.push([B, C, A, { lab: labs[2], color: 'blue' }]); }
      return f; }
    if (kind === 'base') { var v = 2 * R.int(10, 75), bs = (180 - v) / 2;
      return { q: 'In isosceles $' + tri(A + B + C) + '$, $' + A + B + ' = ' + A + C + '$ and the vertex angle $' + mang(A) + ' = ' + deg(v) + '$. Find $' + mang(B) + '$.', a: num(bs), viz: fig(isoFig(v, [v + '°', '?', '']), 'Isosceles triangle with equal sides marked'),
        steps: ['The base angles are opposite the equal sides, so $' + mang(B) + ' = ' + mang(C) + '$.', 'Together they take $180 - ' + v + ' = ' + (180 - v) + '$ degrees.', 'Each is $' + (180 - v) + ' \\div 2 = ' + deg(bs) + '$.'], hint: 'The two base angles are equal and share what is left of 180°.' }; }
    if (kind === 'vertex') { var bs2 = R.int(20, 85), v2 = 180 - 2 * bs2;
      return { q: 'In isosceles $' + tri(A + B + C) + '$, $' + A + B + ' = ' + A + C + '$ and $' + mang(B) + ' = ' + deg(bs2) + '$. Find $' + mang(A) + '$.', a: num(v2), viz: fig(isoFig(v2, ['?', bs2 + '°', '']), 'Isosceles triangle with equal sides marked'),
        steps: ['$' + ang(B) + '$ and $' + ang(C) + '$ are the base angles (opposite the equal sides), so $' + mang(C) + ' = ' + deg(bs2) + '$ too.', '$' + mang(A) + ' = 180 - 2 \\cdot ' + bs2 + ' = ' + deg(v2) + '$.'], hint: 'Both base angles are ' + bs2 + '°.' }; }
    if (kind === 'which') { var v3 = 2 * R.int(15, 50);
      return { q: 'In the triangle shown, $' + A + B + ' = ' + A + C + '$ (the tick marks). Which two angles must be congruent?', a: mc('$' + ang(B) + '$ and $' + ang(C) + '$', ['$' + ang(A) + '$ and $' + ang(B) + '$', '$' + ang(A) + '$ and $' + ang(C) + '$', 'No two angles must be congruent']), viz: fig(isoFig(v3, null, R.pick([35, 160, 210, 290, 120])), 'A triangle with two sides marked equal, drawn turned'),
        steps: ['The Isosceles Triangle Theorem: angles opposite congruent sides are congruent.', '$' + seg(A + B) + '$ is opposite $' + ang(C) + '$, and $' + seg(A + C) + '$ is opposite $' + ang(B) + '$.', 'So the base angles are $' + ang(B) + '$ and $' + ang(C) + '$, wherever the triangle points on the page.'], hint: 'Look across the triangle from each marked side.' }; }
    if (kind === 'alg' || kind === 'algv') {
      var xv = R.int(3, 15), bs3 = R.int(25, 80), P2 = eqPair(R, xv, bs3, bs3), v4 = 180 - 2 * bs3;
      var st = ['$' + ang(B) + '$ and $' + ang(C) + '$ are base angles, so they are congruent.'].concat(solveSteps({ a: P2.a, b: P2.b }, { a: P2.c, b: P2.d }, xv));
      if (kind === 'algv') st.push('Each base angle is $' + deg(bs3) + '$, so $' + mang(A) + ' = 180 - 2 \\cdot ' + bs3 + ' = ' + deg(v4) + '$.');
      return { q: 'In $' + tri(A + B + C) + '$, $' + A + B + ' = ' + A + C + '$, $' + mang(B) + ' = (' + lin(P2.a, P2.b) + ')^\\circ$ and $' + mang(C) + ' = (' + lin(P2.c, P2.d) + ')^\\circ$. ' + (kind === 'algv' ? 'Find $' + mang(A) + '$.' : 'Find $x$.'), a: num(kind === 'algv' ? v4 : xv), steps: st, hint: 'Base angles are equal: set the expressions equal.' };
    }
    if (kind === 'sides') {
      var xv2 = R.int(2, 10), P3 = eqPair(R, xv2, 9, 40), bb = R.int(25, 75);
      return { q: 'In $' + tri(A + B + C) + '$, $' + mang(B) + ' = ' + mang(C) + ' = ' + deg(bb) + '$, $' + A + B + ' = ' + lin(P3.a, P3.b) + '$ and $' + A + C + ' = ' + lin(P3.c, P3.d) + '$. Find $' + A + B + '$.', a: num(P3.val),
        steps: ['By the converse of the Isosceles Triangle Theorem, sides opposite congruent angles are congruent: $' + A + B + ' = ' + A + C + '$.'].concat(solveSteps({ a: P3.a, b: P3.b }, { a: P3.c, b: P3.d }, xv2)).concat(['$' + A + B + ' = ' + P3.a + '(' + xv2 + ')' + T.signed(P3.b) + ' = ' + P3.val + '$.']), hint: 'Equal angles mean the sides across from them are equal.' };
    }
    var xv3 = R.int(4, 20), e = expr(R, xv3, 60, 2, 5);
    return { q: '$' + tri(A + B + C) + '$ is equilateral, and $' + mang(A) + ' = (' + e.tex + ')^\\circ$. Find $x$.', a: num(xv3),
      steps: ['An equilateral triangle is also equiangular: all three angles are equal, so each is $180 \\div 3 = 60^\\circ$.', '$' + e.tex + ' = 60$, so $' + T.mono(e.a, 'x') + ' = ' + (60 - e.b) + '$ and $x = ' + xv3 + '$.'], hint: 'Each angle of an equilateral triangle is 60°.' };
  });

  G('geo.bisectors-circumcenter', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['pb', 'where', 'circ1'], ['pbx', 'circ', 'right', 'where'], ['coord', 'right', 'circ', 'coord']));
    if (kind === 'pb') { var d = R.int(4, 30), Lt = letters(R, 3);
      return { q: 'Point $' + Lt[2] + '$ is on the perpendicular bisector of $' + seg(Lt[0] + Lt[1]) + '$, and $' + Lt[2] + Lt[0] + ' = ' + d + '$. Find $' + Lt[2] + Lt[1] + '$.', a: num(d), viz: fig({ pts: (function () { var o = {}; o[Lt[0]] = [0, 0]; o[Lt[1]] = [6, 0]; o._m = [3, 0]; o[Lt[2]] = [3, 3.6]; return o; })(), segs: [[Lt[0], Lt[1]], [Lt[0], '_m', { tick: 1 }], ['_m', Lt[1], { tick: 1 }], [Lt[2], Lt[0], { lab: String(d), color: 'blue' }], [Lt[2], Lt[1], { lab: '?', color: 'blue' }]], lines: [['_m', Lt[2], { dash: 1 }]], angs: [[Lt[1], '_m', Lt[2], { right: 1 }]], nolab: ['_m'], height: 200 }, 'A point on the perpendicular bisector of a segment'),
        steps: ['Perpendicular Bisector Theorem: a point on the perpendicular bisector of a segment is equally far from its endpoints.', 'So $' + Lt[2] + Lt[1] + ' = ' + Lt[2] + Lt[0] + ' = ' + d + '$.', 'Why: the two right triangles share the bisector and have equal bases, so they are congruent by SAS.'], hint: 'Points on the perpendicular bisector are the same distance from both ends.' }; }
    if (kind === 'pbx' || kind === 'circ' || kind === 'circ1') {
      var xv = R.int(2, 9), P = eqPair(R, xv, 7, 35);
      if (kind === 'circ1') return { q: 'Point $O$ is the circumcenter of $' + tri('ABC') + '$, and $OA = ' + P.val + '$. Find $OC$.', a: num(P.val), steps: ['The circumcenter is where the perpendicular bisectors of the sides meet.', 'It lies on every perpendicular bisector, so it is equally far from all three vertices: $OA = OB = OC$.', '$OC = ' + P.val + '$. (That common distance is the radius of the circle through $A$, $B$ and $C$.)'], hint: 'The circumcenter is the same distance from every vertex.' };
      if (kind === 'pbx') return { q: 'Point $P$ is on the perpendicular bisector of $' + seg('AB') + '$. $PA = ' + lin(P.a, P.b) + '$ and $PB = ' + lin(P.c, P.d) + '$. Find $x$.', a: num(xv), steps: ['$P$ is on the perpendicular bisector, so $PA = PB$.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)), hint: 'Set PA equal to PB.' };
      return { q: '$O$ is the circumcenter of $' + tri('ABC') + '$. $OA = ' + lin(P.a, P.b) + '$ and $OB = ' + lin(P.c, P.d) + '$. Find $OC$.', a: num(P.val), steps: ['The circumcenter is equally far from all three vertices: $OA = OB = OC$.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['$OC = OA = ' + P.a + '(' + xv + ')' + T.signed(P.b) + ' = ' + P.val + '$.']), hint: 'All three distances from the circumcenter are equal.' };
    }
    if (kind === 'where') {
      var t = R.pick([['acute', 'Inside the triangle'], ['right', 'On the hypotenuse, at its midpoint'], ['obtuse', 'Outside the triangle']]), angs = t[0] === 'right' ? [90, R.int(25, 65)] : t[0] === 'acute' ? [R.int(50, 80), R.int(50, 80)] : [R.int(100, 140), R.int(15, 30)];
      return { q: 'A triangle has angles of $' + deg(angs[0]) + '$, $' + deg(angs[1]) + '$ and $' + deg(180 - angs[0] - angs[1]) + '$. Where is its circumcenter?', a: mc(t[1], ['Inside the triangle', 'On the hypotenuse, at its midpoint', 'Outside the triangle', 'At the vertex of the largest angle'].filter(function (x) { return x !== t[1]; })),
        steps: ['The triangle is ' + t[0] + ' (look at its largest angle).', 'Acute triangle: the circumcenter is inside. Right triangle: it is the midpoint of the hypotenuse. Obtuse triangle: it is outside, beyond the longest side.'], hint: 'Is the largest angle less than, equal to, or more than 90°?' };
    }
    if (kind === 'right') {
      var tr = R.pick([[6, 8], [8, 6], [10, 4], [4, 10], [6, 4], [2, 8], [8, 12]]), C = [R.int(-4, 2), R.int(-4, 2)], Ap = [C[0] + tr[0], C[1]], Bp = [C[0], C[1] + tr[1]], Mm = mid(Ap, Bp);
      return { q: 'Find the circumcenter of the right triangle with vertices $C' + pt(C) + '$, $A' + pt(Ap) + '$ and $B' + pt(Bp) + '$.', a: { t: 'tuple', v: [tq(Mm[0]), tq(Mm[1])] }, viz: fig({ pts: { A: Ap, B: Bp, C: C }, polys: [['A', 'B', 'C', { fill: 'blue' }]], angs: [['A', 'C', 'B', { right: 1 }]], axes: true, height: 240 }, 'A right triangle on a grid'),
        steps: ['The right angle is at $C$ (one leg is horizontal and one is vertical), so $' + seg('AB') + '$ is the hypotenuse.', 'The circumcenter of a right triangle is the midpoint of its hypotenuse (an angle inscribed in a semicircle is a right angle).', 'Midpoint of $' + seg('AB') + '$: $' + pt([tq(Mm[0]), tq(Mm[1])]) + '$.'], hint: 'For a right triangle, the circumcenter is the midpoint of the hypotenuse.', chk: { tri: [Ap, Bp, C] } };
    }
    // coord: (0,0), (2a, 0), (2b, 2c) shifted
    var a, b, c, y; for (var tries = 0; tries < 200; tries++) { a = R.int(1, 4); b = R.int(-1, 4); c = R.int(1, 4); if ((b * b + c * c - a * b) % c === 0 && b !== a && !(b === 0 && c === 0)) { y = (b * b + c * c - a * b) / c; break; } }
    var sh = [R.int(-3, 2), R.int(-3, 2)], P1 = [sh[0], sh[1]], P2 = [2 * a + sh[0], sh[1]], P3 = [2 * b + sh[0], 2 * c + sh[1]], O = [a + sh[0], y + sh[1]];
    return { q: 'Find the circumcenter of the triangle with vertices $A' + pt(P1) + '$, $B' + pt(P2) + '$ and $C' + pt(P3) + '$.', a: { t: 'tuple', v: [String(O[0]), String(O[1])] },
      steps: ['The circumcenter is on the perpendicular bisector of every side.', '$' + seg('AB') + '$ is horizontal, so its perpendicular bisector is the vertical line through its midpoint: $x = ' + O[0] + '$.', 'The circumcenter $(' + O[0] + ', y)$ is as far from $A$ as from $C$: $(' + O[0] + T.signed(-P1[0]) + ')^2 + (y' + T.signed(-P1[1]) + ')^2 = (' + O[0] + T.signed(-P3[0]) + ')^2 + (y' + T.signed(-P3[1]) + ')^2$.', 'Expand and solve: $y = ' + O[1] + '$.', 'Check: the distances to $A$, $B$ and $C$ all equal $\\sqrt{' + dist2(O, P1) + '}$.'], hint: 'Start with the side that is horizontal: its perpendicular bisector is easy.', chk: { tri: [P1, P2, P3], O: O } };
  });

  G('geo.triangle-centers', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['cen', 'match', 'cen'], ['calg', 'ccoord', 'incenter', 'outside'], ['ccoord', 'calg', 'inr', 'outside']));
    if (kind === 'cen') { var k = R.int(2, 12), t = R.int(0, 2);
      if (t === 0) return { q: '$G$ is the centroid of $' + tri('ABC') + '$, and $' + seg('AM') + '$ is a median with $AM = ' + 3 * k + '$. Find $AG$.', a: num(2 * k), steps: ['The centroid is two-thirds of the way from each vertex to the midpoint of the opposite side.', '$AG = \\frac{2}{3} \\cdot ' + 3 * k + ' = ' + 2 * k + '$ (and $GM = ' + k + '$).'], hint: 'AG is 2/3 of the median.' };
      if (t === 1) return { q: '$G$ is the centroid of $' + tri('ABC') + '$, and $' + seg('AM') + '$ is a median with $GM = ' + k + '$. Find $AM$.', a: num(3 * k), steps: ['The centroid splits each median in the ratio $2 : 1$: $AG = 2 \\cdot GM = ' + 2 * k + '$.', '$AM = AG + GM = ' + 2 * k + ' + ' + k + ' = ' + 3 * k + '$.'], hint: 'AG is twice GM.' };
      return { q: '$G$ is the centroid of $' + tri('ABC') + '$, and $' + seg('BN') + '$ is a median with $BG = ' + 2 * k + '$. Find $GN$.', a: num(k), steps: ['The centroid splits each median in the ratio $2 : 1$, with the longer part next to the vertex.', '$GN = \\frac{1}{2} BG = ' + k + '$.'], hint: 'The piece next to the vertex is twice the other piece.' }; }
    if (kind === 'calg') { var xv = R.int(2, 9), gm = R.int(3, 14), e1 = expr(R, xv, 2 * gm, 2, 6), e2 = expr(R, xv, gm, 1, 3); if (e1.a === 2 * e2.a) e1 = expr(R, xv, 2 * gm, 2 * e2.a + 1, 2 * e2.a + 3);
      return { q: '$G$ is the centroid of $' + tri('ABC') + '$ and $M$ is the midpoint of $' + seg('BC') + '$. $AG = ' + e1.tex + '$ and $GM = ' + e2.tex + '$. Find $AM$.', a: num(3 * gm),
        steps: ['The centroid splits median $' + seg('AM') + '$ so that $AG = 2 \\cdot GM$.', '$' + e1.tex + ' = 2(' + e2.tex + ') = ' + lin(2 * e2.a, 2 * e2.b) + '$, so $x = ' + xv + '$.', '$GM = ' + gm + '$ and $AG = ' + 2 * gm + '$, so $AM = ' + 3 * gm + '$.'], hint: 'Set AG equal to twice GM.' }; }
    if (kind === 'ccoord') { var lv = ctx.level || 1, A, B, C;
      do { A = [R.int(-6, 6), R.int(-6, 6)]; B = [R.int(-6, 6), R.int(-6, 6)]; C = [R.int(-6, 6), R.int(-6, 6)];
        if (lv < 3) { C[0] += ((3 - (A[0] + B[0] + C[0]) % 3) % 3); C[1] += ((3 - (A[1] + B[1] + C[1]) % 3) % 3); }
      } while ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0);
      var Gx = qplain(A[0] + B[0] + C[0], 3), Gy = qplain(A[1] + B[1] + C[1], 3);
      return { q: 'Find the centroid of the triangle with vertices $A' + pt(A) + '$, $B' + pt(B) + '$ and $C' + pt(C) + '$.', a: { t: 'tuple', v: [Gx, Gy] },
        steps: ['The centroid averages the three vertices.', '$x = \\dfrac{' + A[0] + ' + ' + T.p(B[0]) + ' + ' + T.p(C[0]) + '}{3} = ' + T.frac(A[0] + B[0] + C[0], 3) + '$, $y = \\dfrac{' + A[1] + ' + ' + T.p(B[1]) + ' + ' + T.p(C[1]) + '}{3} = ' + T.frac(A[1] + B[1] + C[1], 3) + '$.', 'So $G = ' + T.pt([Gx, Gy]) + '$. (It is the balance point of the triangle.)'], hint: 'Add the x-coordinates and divide by 3; do the same for y.', chk: { tri: [A, B, C] }, nolint: ['+ 0'] }; }
    if (kind === 'incenter') { var xv2 = R.int(2, 8), P = eqPair(R, xv2, 3, 20);
      return { q: '$I$ is the incenter of $' + tri('ABC') + '$. The distance from $I$ to $' + seg('AB') + '$ is $' + lin(P.a, P.b) + '$ and the distance from $I$ to $' + seg('BC') + '$ is $' + lin(P.c, P.d) + '$. Find the distance from $I$ to $' + seg('AC') + '$.', a: num(P.val),
        steps: ['The incenter is where the angle bisectors meet. Points on an angle bisector are equally far from the sides of the angle.', 'So the incenter is the same distance from all three sides.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv2)).concat(['The distance to every side is $' + P.val + '$ (the radius of the inscribed circle).']), hint: 'The incenter is equally far from all three sides.' }; }
    if (kind === 'match') { var m = R.pick([['medians', 'centroid'], ['angle bisectors', 'incenter'], ['perpendicular bisectors of the sides', 'circumcenter'], ['altitudes', 'orthocenter']]);
      return { q: 'The three ' + m[0] + ' of a triangle meet at one point. What is that point called?', a: mc('The ' + m[1], ['The centroid', 'The incenter', 'The circumcenter', 'The orthocenter'].filter(function (x) { return x !== 'The ' + m[1]; })),
        steps: ['Medians (vertex to the midpoint of the opposite side) meet at the centroid. Angle bisectors meet at the incenter. Perpendicular bisectors meet at the circumcenter. Altitudes (vertex, perpendicular to the opposite side) meet at the orthocenter.', 'So: the ' + m[1] + '.'], hint: 'A median goes to a midpoint; an altitude makes a right angle.' }; }
    if (kind === 'outside') { var q = R.pick([['Which two centers can lie outside a triangle?', 'The circumcenter and the orthocenter', ['The centroid and the incenter', 'The centroid and the circumcenter', 'The incenter and the orthocenter'], 'In an obtuse triangle, the circumcenter and orthocenter are outside. The centroid and incenter are always inside.'], ['Which center is always inside the triangle?', 'The centroid', ['The circumcenter', 'The orthocenter', 'None of them'], 'The centroid sits on medians, which stay inside the triangle. (The incenter is also always inside.)'], ['Where is the orthocenter of a right triangle?', 'At the vertex of the right angle', ['At the midpoint of the hypotenuse', 'Outside the triangle', 'At the centroid'], 'The two legs are altitudes, and they meet at the right-angle vertex.'], ['In a triangle, how is a median different from an altitude?', 'A median goes to the midpoint of the opposite side; an altitude meets the opposite side at a right angle.', ['They are the same segment.', 'A median is always longer.', 'An altitude goes to the midpoint of the opposite side.'], 'They only coincide in special cases, such as from the vertex angle of an isosceles triangle.']]);
      return { q: q[0], a: mc(q[1], q[2]), steps: [q[3]], hint: 'Picture an obtuse triangle.' }; }
    var tr = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29], [12, 16, 20]]), r = (tr[0] + tr[1] - tr[2]) / 2;
    return { q: 'A right triangle has legs $' + tr[0] + '$ and $' + tr[1] + '$ and hypotenuse $' + tr[2] + '$. Find the radius of its inscribed circle (the distance from the incenter to each side).', a: num(r),
      steps: ['Split the triangle into three triangles from the incenter $I$: each has height $r$ and one side of the triangle as its base.', 'Area two ways: $\\frac{1}{2} \\cdot ' + tr[0] + ' \\cdot ' + tr[1] + ' = \\frac{1}{2} r (' + tr[0] + ' + ' + tr[1] + ' + ' + tr[2] + ')$.', '$' + tr[0] * tr[1] + ' = ' + (tr[0] + tr[1] + tr[2]) + 'r$, so $r = ' + T.num(r) + '$.'], hint: 'The area equals ½ · r · perimeter.' };
  });

  G('geo.midsegments', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['half', 'double', 'prop'], ['alg', 'per', 'half', 'prop'], ['coord', 'alg', 'coordlen', 'per']));
    function mfig(labDE, labBC) { var P = baseTri(R), D = mid(P[0], P[1]), E = mid(P[0], P[2]); // A=P[0]? use apex at top
      var A = P[2], B = P[0], C = P[1], Dm = mid(A, B), Em = mid(A, C);
      return fig({ pts: { A: A, B: B, C: C, D: Dm, E: Em }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [['D', 'E', { lab: labDE, color: 'blue', arrow: 1, w: 3 }], ['B', 'C', { lab: labBC, arrow: 1 }], ['A', 'D', { tick: 1 }], ['D', 'B', { tick: 1 }], ['A', 'E', { tick: 2 }], ['E', 'C', { tick: 2 }]], height: 220 }, 'Triangle ABC with midsegment DE joining the midpoints of AB and AC'); }
    if (kind === 'half') { var bc = 2 * R.int(3, 20) + (R.chance(0.3) ? 1 : 0);
      return { q: '$D$ and $E$ are the midpoints of $' + seg('AB') + '$ and $' + seg('AC') + '$, and $BC = ' + bc + '$. Find $DE$.', a: num(bc / 2), viz: mfig('?', String(bc)), steps: ['$' + seg('DE') + '$ is a midsegment: it is parallel to $' + seg('BC') + '$ and half as long.', '$DE = \\frac{1}{2} \\cdot ' + bc + ' = ' + T.num(bc / 2) + '$.'], hint: 'A midsegment is half the third side.' }; }
    if (kind === 'double') { var de = R.int(3, 20) + (R.chance(0.3) ? 0.5 : 0);
      return { q: '$' + seg('DE') + '$ is the midsegment of $' + tri('ABC') + '$ that is parallel to $' + seg('BC') + '$, and $DE = ' + T.num(de) + '$. Find $BC$.', a: num(2 * de), viz: mfig(T.num(de), '?'), steps: ['A midsegment is half the length of the side it is parallel to.', '$BC = 2 \\cdot ' + T.num(de) + ' = ' + T.num(2 * de) + '$.'], hint: 'The third side is twice the midsegment.' }; }
    if (kind === 'prop') { return { q: '$D$ and $E$ are the midpoints of $' + seg('AB') + '$ and $' + seg('AC') + '$ in $' + tri('ABC') + '$. Which statement is true?', a: mc('$' + seg('DE') + ' \\parallel ' + seg('BC') + '$ and $DE = \\frac{1}{2}BC$', ['$' + seg('DE') + ' \\parallel ' + seg('BC') + '$ and $DE = BC$', '$' + seg('DE') + ' \\perp ' + seg('BC') + '$ and $DE = \\frac{1}{2}BC$', '$DE = \\frac{1}{2}AB$']), viz: mfig('', ''),
      steps: ['$' + tri('ADE') + '$ is a dilation of $' + tri('ABC') + '$ from $A$ with scale factor $\\frac{1}{2}$ (each side from $A$ is halved).', 'A dilation keeps lines parallel and multiplies lengths by the scale factor, so $' + seg('DE') + ' \\parallel ' + seg('BC') + '$ and $DE = \\frac{1}{2}BC$.'], hint: 'Think of shrinking the triangle by half toward A.' }; }
    if (kind === 'alg') { var xv = R.int(2, 10), d = R.int(4, 20), e1 = expr(R, xv, d, 1, 3), e2 = expr(R, xv, 2 * d, 2, 7); if (e2.a === 2 * e1.a) e2 = expr(R, xv, 2 * d, 2 * e1.a + 1, 2 * e1.a + 4);
      return { q: '$' + seg('DE') + '$ is a midsegment of $' + tri('ABC') + '$, parallel to $' + seg('BC') + '$. $DE = ' + e1.tex + '$ and $BC = ' + e2.tex + '$. Find $BC$.', a: num(2 * d), viz: mfig(e1.tex, e2.tex),
        steps: ['The third side is twice the midsegment: $BC = 2 \\cdot DE$.', '$' + e2.tex + ' = 2(' + e1.tex + ') = ' + lin(2 * e1.a, 2 * e1.b) + '$.', 'Solve: $x = ' + xv + '$.', '$BC = ' + e2.a + '(' + xv + ')' + T.signed(e2.b) + ' = ' + 2 * d + '$ (and $DE = ' + d + '$).'], hint: 'Write BC = 2 · DE and solve.' }; }
    if (kind === 'per') { var s; do { s = [R.int(6, 24), R.int(6, 24), R.int(6, 24)].map(function (v) { return 2 * v; }); } while (s[0] + s[1] <= s[2] || s[1] + s[2] <= s[0] || s[0] + s[2] <= s[1]);
      return { q: 'A triangle has sides $' + s.join('$, $') + '$. Its three midsegments form a smaller triangle. Find the perimeter of the smaller triangle.', a: num((s[0] + s[1] + s[2]) / 2),
        steps: ['Each midsegment is half the side it is parallel to: $' + s.map(function (v) { return v / 2; }).join('$, $') + '$.', 'Perimeter: $' + s.map(function (v) { return v / 2; }).join(' + ') + ' = ' + (s[0] + s[1] + s[2]) / 2 + '$, half the original perimeter.'], hint: 'Halve each side.' }; }
    var A, B, C;
    do { A = [2 * R.int(-3, 3), 2 * R.int(-3, 3)]; B = [2 * R.int(-4, 4), 2 * R.int(-4, 4)]; C = [2 * R.int(-4, 4), 2 * R.int(-4, 4)]; }
    while (B[0] === C[0] || dist2(B, C) < 16 || (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0);
    var D = mid(A, B), E = mid(A, C);
    if (kind === 'coord') return { q: 'In $' + tri('ABC') + '$ with $A' + pt(A) + '$, $B' + pt(B) + '$ and $C' + pt(C) + '$, $D$ and $E$ are the midpoints of $' + seg('AB') + '$ and $' + seg('AC') + '$. Find the slope of $' + seg('DE') + '$.', a: num(qplain(E[1] - D[1], E[0] - D[0])),
      steps: ['$D = ' + pt(D) + '$ and $E = ' + pt(E) + '$.', 'Slope of $' + seg('DE') + '$: $\\dfrac{' + E[1] + ' - ' + T.p(D[1]) + '}{' + E[0] + ' - ' + T.p(D[0]) + '} = ' + T.frac(E[1] - D[1], E[0] - D[0]) + '$.', 'Check: slope of $' + seg('BC') + '$ is $\\dfrac{' + C[1] + ' - ' + T.p(B[1]) + '}{' + C[0] + ' - ' + T.p(B[0]) + '} = ' + T.frac(C[1] - B[1], C[0] - B[0]) + '$, the same, so $' + seg('DE') + ' \\parallel ' + seg('BC') + '$.'], hint: 'Find both midpoints, then the slope between them.', chk: { tri: [A, B, C] } };
    var N = dist2(D, E);
    return { q: 'In $' + tri('ABC') + '$ with $A' + pt(A) + '$, $B' + pt(B) + '$ and $C' + pt(C) + '$, $D$ and $E$ are the midpoints of $' + seg('AB') + '$ and $' + seg('AC') + '$. Find $DE$ exactly.', a: rnum(sqrtN(N)),
      steps: ['$D = ' + pt(D) + '$ and $E = ' + pt(E) + '$.', '$DE = \\sqrt{' + T.p(E[0] - D[0]) + '^2 + ' + T.p(E[1] - D[1]) + '^2} = \\sqrt{' + N + '}' + (sqrtN(N).r !== N ? ' = ' + rtex(sqrtN(N)) : '') + '$.', 'Check: $BC = \\sqrt{' + dist2(B, C) + '}$, and $DE$ is half of it.'], hint: 'Find D and E, then use the distance formula.', chk: { tri: [A, B, C] } };
  });

  /* ================================================================ Unit: Quadrilaterals and Polygons */

  var PNAME = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
  function pname(n) { return PNAME[n] || n + '-gon'; }

  G('geo.polygon-angle-sums', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['sum', 'each', 'ext', 'sum'], ['nfromext', 'nfromint', 'missing', 'extsum'], ['nfromsum', 'alg', 'nfromint', 'extsum']));
    var n = R.pick([5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 11, 13, 14, 16, 24, 30]);
    if (kind === 'sum') return { q: 'Find the sum of the interior angles of a ' + pname(n) + ' (' + n + ' sides).', a: num((n - 2) * 180),
      steps: ['Draw every diagonal from one vertex. They split the polygon into $' + n + ' - 2 = ' + (n - 2) + '$ triangles.', 'Each triangle has $180^\\circ$, and together their angles make up the polygon\'s angles.', 'Sum $= ' + (n - 2) + ' \\cdot 180^\\circ = ' + deg((n - 2) * 180) + '$.'], hint: 'How many triangles do the diagonals from one vertex make?' };
    var nr = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90]);
    if (kind === 'each') return { q: 'Find the measure of each interior angle of a regular ' + pname(nr) + '.', a: num((nr - 2) * 180 / nr),
      steps: ['Sum of the interior angles: $(' + nr + ' - 2) \\cdot 180^\\circ = ' + deg((nr - 2) * 180) + '$.', 'A regular polygon has equal angles: $' + (nr - 2) * 180 + ' \\div ' + nr + ' = ' + deg((nr - 2) * 180 / nr) + '$.', 'Check: each exterior angle is $360 \\div ' + nr + ' = ' + 360 / nr + '$, and $' + (nr - 2) * 180 / nr + ' + ' + 360 / nr + ' = 180$.'], hint: 'Find the total, then share it equally.' };
    if (kind === 'ext') return { q: 'Find the measure of each exterior angle of a regular ' + pname(nr) + '.', a: num(360 / nr),
      steps: ['Walking around any convex polygon, you turn through one full turn: the exterior angles add to $360^\\circ$.', 'They are equal in a regular polygon: $360 \\div ' + nr + ' = ' + deg(360 / nr) + '$.'], hint: 'The exterior angles always add to 360°.' };
    if (kind === 'nfromext') return { q: 'Each exterior angle of a regular polygon measures $' + deg(360 / nr) + '$. How many sides does it have?', a: num(nr), steps: ['The exterior angles add to $360^\\circ$ and are all equal.', '$n = 360 \\div ' + 360 / nr + ' = ' + nr + '$.'], hint: 'How many of these angles fit in 360°?' };
    if (kind === 'nfromint') { var ia = (nr - 2) * 180 / nr; return { q: 'Each interior angle of a regular polygon measures $' + deg(ia) + '$. How many sides does it have?', a: num(nr),
      steps: ['Each exterior angle is $180 - ' + ia + ' = ' + deg(180 - ia) + '$ (they form a linear pair).', 'The exterior angles add to $360^\\circ$: $n = 360 \\div ' + (180 - ia) + ' = ' + nr + '$.'], hint: 'Work with the exterior angle: it is easier.' }; }
    if (kind === 'missing') { var m = R.pick([4, 5, 6, 7]), total = (m - 2) * 180, given, left;
      do { left = R.int(70, 170); given = []; var acc = 0; for (var i = 0; i < m - 2; i++) { var v = R.int(95, 150); given.push(v); acc += v; } given.push(total - left - acc); } while (given[m - 2] < 60 || given[m - 2] > 175);
      return { q: 'A ' + pname(m) + ' has interior angles of ' + given.map(function (g) { return '$' + deg(g) + '$'; }).join(', ') + ' and $x^\\circ$. Find $x$.', a: num(left),
        steps: ['Sum for a ' + pname(m) + ': $(' + m + ' - 2) \\cdot 180 = ' + total + '$.', 'Known angles: $' + given.join(' + ') + ' = ' + (total - left) + '$.', '$x = ' + total + ' - ' + (total - left) + ' = ' + left + '$.'], hint: 'Find the total first.' }; }
    if (kind === 'extsum') { var e = R.coin(); return e ? { q: 'What is the sum of the exterior angles (one at each vertex) of a convex polygon with ' + n + ' sides?', a: num(360), steps: ['Walk around the polygon: at each corner you turn by the exterior angle, and after a full trip you have turned once all the way around.', 'So the sum is $360^\\circ$ for every convex polygon, no matter how many sides.'], hint: 'Imagine walking around the edge and counting how far you turn.' }
      : { q: 'True or false: a convex polygon with more sides has a larger sum of exterior angles.', a: tf(false), steps: ['The exterior angles of any convex polygon add to $360^\\circ$: one full turn.', 'More sides means more exterior angles, but each one is smaller. The interior sum grows; the exterior sum does not.'], hint: 'Think about walking around the polygon.' }; }
    if (kind === 'nfromsum') { var k = R.int(5, 22); return { q: 'The interior angles of a polygon add to $' + deg((k - 2) * 180) + '$. How many sides does it have?', a: num(k), steps: ['$(n - 2) \\cdot 180 = ' + (k - 2) * 180 + '$.', '$n - 2 = ' + (k - 2) * 180 + ' \\div 180 = ' + (k - 2) + '$, so $n = ' + k + '$.'], hint: 'Solve (n − 2) · 180 = the sum.' }; }
    // alg: a hexagon or pentagon with expression angles
    var m2 = R.pick([5, 6]), tot = (m2 - 2) * 180, xv, coefs, cons;
    for (var t = 0; t < 400; t++) { xv = R.int(10, 40); coefs = []; cons = []; var sum = 0; for (var q = 0; q < m2; q++) { var a = R.int(1, 3), b = R.int(-20, 40); coefs.push(a); cons.push(b); sum += a * xv + b; } var diff = tot - sum; cons[m2 - 1] += diff; if (M.abs(cons[m2 - 1]) <= 60 && coefs.every(function (c2, i) { var vv = c2 * xv + cons[i]; return vv > 40 && vv < 175; })) break; }
    var exps = coefs.map(function (c2, i) { return { a: c2, b: cons[i] }; }), st = sumSteps(exps, tot, xv);
    st.unshift('A ' + pname(m2) + '\'s interior angles add to $(' + m2 + ' - 2) \\cdot 180 = ' + tot + '$.');
    return { q: 'The interior angles of a ' + pname(m2) + ' measure ' + exps.map(function (e2) { return '$(' + lin(e2.a, e2.b) + ')^\\circ$'; }).join(', ') + '. Find $x$.', a: num(xv), steps: st, hint: 'Add all the expressions and set the sum equal to the interior angle sum.' };
  });

  function pgramFig(R, labs, o) {
    o = o || {}; var w = R.real(4.5, 6.5, 1), s = R.real(1, 2.2, 1), h = R.real(2.6, 3.6, 1);
    var A = [0, 0], B = [w, 0], C = [w + s, h], D = [s, h];
    var f = { pts: { A: A, B: B, C: C, D: D }, polys: [['A', 'B', 'C', 'D', { fill: 'blue' }]], segs: [], angs: [], height: 210 };
    if (o.diag) { f.pts.E = mid(A, C); f.segs.push(['A', 'C', { color: 'muted' }], ['B', 'D', { color: 'muted' }]); }
    Object.keys(labs || {}).forEach(function (k) {
      if (k.length === 2) f.segs.push([k[0], k[1], { lab: labs[k] }]);
      else if (k.length === 1) { var i = 'ABCD'.indexOf(k), N = ['A', 'B', 'C', 'D']; f.angs.push([N[(i + 3) % 4], k, N[(i + 1) % 4], { lab: labs[k] }]); }
    });
    return fig(f, 'Parallelogram ABCD' + (o.diag ? ' with diagonals meeting at E' : ''));
  }

  G('geo.parallelogram-properties', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['sides', 'opp', 'tf', 'opp'], ['consec', 'diag', 'sides', 'tf'], ['sys', 'consec', 'diag', 'tf']));
    if (kind === 'sides') { var xv = R.int(2, 10), P = eqPair(R, xv, 6, 40);
      return { q: '$ABCD$ is a parallelogram with $AB = ' + lin(P.a, P.b) + '$ and $CD = ' + lin(P.c, P.d) + '$. Find $AB$.', a: num(P.val), viz: pgramFig(R, { AB: lin(P.a, P.b), CD: lin(P.c, P.d) }),
        steps: ['Opposite sides of a parallelogram are congruent, so $AB = CD$.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['$AB = ' + P.a + '(' + xv + ')' + T.signed(P.b) + ' = ' + P.val + '$.']), hint: 'AB and CD are opposite sides.' }; }
    if (kind === 'opp') { var a = R.int(40, 140); while (a === 90) a = R.int(40, 140); var askC = R.coin();
      return { q: '$ABCD$ is a parallelogram and $' + mang('A') + ' = ' + deg(a) + '$. Find $' + mang(askC ? 'C' : 'B') + '$.', a: num(askC ? a : 180 - a), viz: pgramFig(R, { A: a + '°' }),
        steps: askC ? ['$' + ang('A') + '$ and $' + ang('C') + '$ are opposite angles, and opposite angles of a parallelogram are congruent.', '$' + mang('C') + ' = ' + deg(a) + '$.'] : ['$' + ang('A') + '$ and $' + ang('B') + '$ are consecutive angles (same-side interior angles between the parallel sides $' + seg('AD') + '$ and $' + seg('BC') + '$), so they are supplementary.', '$' + mang('B') + ' = 180 - ' + a + ' = ' + deg(180 - a) + '$.'], hint: 'Opposite angles are equal; neighboring angles add to 180°.' }; }
    if (kind === 'consec') { var xv2 = R.int(5, 25), a2 = R.int(50, 130), e1 = expr(R, xv2, a2, 2, 5), e2 = expr(R, xv2, 180 - a2, 1, 4);
      var st = ['Consecutive angles of a parallelogram are supplementary.'].concat(sumSteps([e1, e2], 180, xv2)); st.push('$' + mang('A') + ' = ' + deg(a2) + '$ and $' + mang('B') + ' = ' + deg(180 - a2) + '$.');
      return { q: 'In parallelogram $ABCD$, $' + mang('A') + ' = (' + e1.tex + ')^\\circ$ and $' + mang('B') + ' = (' + e2.tex + ')^\\circ$. Find $' + mang('A') + '$.', a: num(a2), steps: st, hint: 'Neighboring angles add to 180°.' }; }
    if (kind === 'diag') { var xv3 = R.int(2, 9), P3 = eqPair(R, xv3, 4, 25);
      return { q: 'The diagonals of parallelogram $ABCD$ meet at $E$. $AE = ' + lin(P3.a, P3.b) + '$ and $EC = ' + lin(P3.c, P3.d) + '$. Find $AC$.', a: num(2 * P3.val), viz: pgramFig(R, { AE: lin(P3.a, P3.b), EC: lin(P3.c, P3.d) }, { diag: true }),
        steps: ['The diagonals of a parallelogram bisect each other, so $AE = EC$.'].concat(solveSteps({ a: P3.a, b: P3.b }, { a: P3.c, b: P3.d }, xv3)).concat(['$AE = ' + P3.val + '$, so $AC = 2 \\cdot ' + P3.val + ' = ' + 2 * P3.val + '$.']), hint: 'E is the midpoint of AC.' }; }
    if (kind === 'tf') { var f = R.pick([['The diagonals of every parallelogram are congruent.', false, 'Only rectangles have congruent diagonals. A slanted parallelogram has one long and one short diagonal.'], ['The diagonals of every parallelogram are perpendicular.', false, 'Only rhombuses have perpendicular diagonals.'], ['The diagonals of every parallelogram bisect each other.', true, 'The two triangles formed at the crossing are congruent (ASA), so each diagonal is cut in half.'], ['Opposite angles of a parallelogram are congruent.', true, 'Each pair of opposite angles are supplements of the same angle.'], ['Consecutive angles of a parallelogram are supplementary.', true, 'They are same-side interior angles between parallel sides.'], ['A diagonal of a parallelogram bisects its angles.', false, 'That is only true for rhombuses.']]);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Picture a long, slanted parallelogram.' }; }
    // sys: two unknowns with the diagonals
    var x0, y0, a1, b1, c1, d1, AE, BE;
    do { x0 = R.int(2, 8); y0 = R.int(2, 8); a1 = R.int(1, 3); b1 = R.int(1, 3); c1 = R.int(2, 4); d1 = R.pick([-2, -1, 1, 2]); AE = a1 * x0 + b1 * y0; BE = c1 * x0 + d1 * y0; } while (BE <= 0 || a1 * d1 - b1 * c1 === 0);
    return { q: 'The diagonals of parallelogram $ABCD$ meet at $E$. $AE = ' + T.terms([[a1, 'x'], [b1, 'y']]) + '$, $EC = ' + AE + '$, $BE = ' + T.terms([[c1, 'x'], [d1, 'y']]) + '$ and $ED = ' + BE + '$. Find $x$ and $y$.', a: { t: 'multi', parts: [{ label: '$x =$', a: num(x0) }, { label: '$y =$', a: num(y0) }] },
      steps: ['The diagonals bisect each other: $AE = EC$ and $BE = ED$.', 'So $' + T.terms([[a1, 'x'], [b1, 'y']]) + ' = ' + AE + '$ and $' + T.terms([[c1, 'x'], [d1, 'y']]) + ' = ' + BE + '$.', 'Solve the system (for example by elimination): $x = ' + x0 + '$ and $y = ' + y0 + '$.', 'Check: $' + a1 + '(' + x0 + ') + ' + b1 + '(' + y0 + ') = ' + AE + '$ and $' + c1 + '(' + x0 + ')' + (d1 < 0 ? ' - ' : ' + ') + M.abs(d1) + '(' + y0 + ') = ' + BE + '$.'], hint: 'Write two equations, one for each diagonal.' };
  });

  G('geo.proving-parallelograms', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['test', 'test', 'xval'], ['test', 'xval', 'fourth', 'enough'], ['enough', 'coordtf', 'fourth', 'two']));
    if (kind === 'test' || kind === 'enough') {
      var cases = [['Both pairs of opposite sides are congruent.', 'Yes: both pairs of opposite sides are congruent'], ['Both pairs of opposite angles are congruent.', 'Yes: both pairs of opposite angles are congruent'], ['The diagonals bisect each other.', 'Yes: the diagonals bisect each other'], ['One pair of opposite sides is both parallel and congruent.', 'Yes: one pair of sides is parallel and congruent'], ['Both pairs of opposite sides are parallel.', 'Yes: that is the definition of a parallelogram']];
      var bad = [['One pair of opposite sides is parallel and the other pair is congruent.', 'No: an isosceles trapezoid fits this too'], ['Two pairs of consecutive sides are congruent.', 'No: a kite fits this too'], ['The diagonals are perpendicular.', 'No: a kite fits this too'], ['The diagonals are congruent.', 'No: an isosceles trapezoid fits this too'], ['One pair of opposite sides is congruent.', 'No: many quadrilaterals fit this']];
      var useBad = kind === 'enough' ? R.chance(0.6) : R.chance(0.3), c = useBad ? R.pick(bad) : R.pick(cases);
      var choices = [c[1]]; (useBad ? R.sample(cases, 2) : R.sample(bad, 2)).forEach(function (x) { choices.push(x[1]); }); choices.push(useBad ? R.pick(cases.filter(function (x) { return choices.indexOf(x[1]) < 0; }))[1] : R.pick(bad.filter(function (x) { return choices.indexOf(x[1]) < 0; }))[1]);
      return { q: 'Quadrilateral $ABCD$ has this property: <i>' + c[0] + '</i> Is that enough to prove $ABCD$ is a parallelogram?', a: mc(c[1], choices.slice(1)),
        steps: ['Tests that prove a parallelogram: both pairs of opposite sides parallel (the definition), both pairs of opposite sides congruent, both pairs of opposite angles congruent, diagonals that bisect each other, or one pair of sides both parallel and congruent.', useBad ? 'This property is not on the list: ' + c[1].replace(/^No: /, '') + ', and that shape is not a parallelogram.' : 'This is one of the tests, so yes.'], hint: 'Can you sketch a shape with this property that is not a parallelogram?' };
    }
    if (kind === 'xval') { var xv = R.int(2, 9), P = eqPair(R, xv, 4, 30);
      return { q: 'The diagonals of quadrilateral $ABCD$ meet at $E$, with $BE = ED$. $AE = ' + lin(P.a, P.b) + '$ and $EC = ' + lin(P.c, P.d) + '$. For what value of $x$ is $ABCD$ a parallelogram?', a: num(xv),
        steps: ['If the diagonals bisect each other, the quadrilateral is a parallelogram. $BE = ED$ is given, so we need $AE = EC$.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['Then $AE = EC = ' + P.val + '$, the diagonals bisect each other, and $ABCD$ is a parallelogram.']), hint: 'Make E the midpoint of AC too.' }; }
    var A = [R.int(-5, 2), R.int(-5, 2)], u = [R.int(3, 6), R.int(-1, 2)], v = [R.int(-2, 2), R.int(3, 5)], B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + v[0], A[1] + v[1]], C = [B[0] + v[0], B[1] + v[1]];
    if (kind === 'fourth') return { q: '$ABCD$ is a parallelogram with $A' + pt(A) + '$, $B' + pt(B) + '$ and $C' + pt(C) + '$. Find $D$.', a: { t: 'tuple', v: D.map(String) }, viz: fig({ pts: { A: A, B: B, C: C }, segs: [['A', 'B'], ['B', 'C']], axes: true, height: 260 }, 'Three vertices of a parallelogram on a grid'),
      steps: ['In a parallelogram, $' + seg('AD') + '$ must be a copy of $' + seg('BC') + '$: same length and direction.', 'From $B$ to $C$: $\\langle ' + v[0] + ', ' + v[1] + ' \\rangle$.', 'So $D = A + \\langle ' + v[0] + ', ' + v[1] + ' \\rangle = ' + pt(D) + '$.', 'Check: the diagonals $' + seg('AC') + '$ and $' + seg('BD') + '$ have the same midpoint, $' + pt(mid(A, C)) + '$.'], hint: 'Move from A the same way you move from B to C.', chk: { quad: [A, B, C, D] } };
    if (kind === 'coordtf') { var ok = R.coin(), D2 = ok ? D : [D[0] + R.pick([-1, 1]), D[1] + R.pick([-1, 0, 1])], m1 = mid(A, C), m2 = mid(B, D2);
      return { q: 'Is $ABCD$ a parallelogram? $A' + pt(A) + '$, $B' + pt(B) + '$, $C' + pt(C) + '$, $D' + pt(D2) + '$. (True means yes.)', a: tf(ok),
        steps: ['Test whether the diagonals bisect each other: compare their midpoints.', 'Midpoint of $' + seg('AC') + '$: $' + pt([tq(m1[0]), tq(m1[1])]) + '$. Midpoint of $' + seg('BD') + '$: $' + pt([tq(m2[0]), tq(m2[1])]) + '$.', ok ? 'They are the same point, so the diagonals bisect each other and $ABCD$ is a parallelogram.' : 'They are different points, so the diagonals do not bisect each other: not a parallelogram.'], hint: 'Compare the midpoints of the two diagonals.' }; }
    // two: x and y from both pairs of opposite sides
    var x0 = R.int(2, 8), y0 = R.int(2, 8), AB = R.int(12, 30), AD = R.int(8, 20), a1 = R.int(2, 4), b1 = AB - a1 * x0, c1 = R.int(1, 3), d1 = AD - c1 * y0;
    return { q: 'In quadrilateral $ABCD$, $AB = ' + lin(a1, b1) + '$, $CD = ' + AB + '$, $AD = ' + T.lin(c1, 'y', d1) + '$ and $BC = ' + AD + '$. Find $x$ and $y$ so that $ABCD$ is a parallelogram (both pairs of opposite sides congruent).', a: { t: 'multi', parts: [{ label: '$x =$', a: num(x0) }, { label: '$y =$', a: num(y0) }] },
      steps: ['$AB = CD$: $' + lin(a1, b1) + ' = ' + AB + '$, so $' + T.mono(a1, 'x') + ' = ' + (AB - b1) + '$ and $x = ' + x0 + '$.', '$AD = BC$: $' + T.lin(c1, 'y', d1) + ' = ' + AD + '$, so ' + (c1 === 1 ? '' : '$' + T.mono(c1, 'y') + ' = ' + (AD - d1) + '$ and ') + '$y = ' + y0 + '$.'], hint: 'Set each pair of opposite sides equal.' };
  });

  G('geo.special-parallelograms', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['classify', 'rectdiag', 'rhomb90'], ['rectdiag', 'rhombbis', 'rhside', 'kite'], ['rhside', 'rectang', 'kite', 'rhombbis']));
    if (kind === 'classify') { var c = R.pick([['a parallelogram whose diagonals are congruent', 'Rectangle'], ['a parallelogram whose diagonals are perpendicular', 'Rhombus'], ['a parallelogram whose diagonals are congruent and perpendicular', 'Square'], ['a parallelogram with one right angle', 'Rectangle'], ['a parallelogram with two consecutive sides congruent', 'Rhombus'], ['a parallelogram whose diagonals bisect its angles', 'Rhombus']]);
      return { q: 'What is the most specific name for ' + c[0] + '?', a: { t: 'mc', choices: ['Rectangle', 'Rhombus', 'Square', 'Parallelogram'], v: ['Rectangle', 'Rhombus', 'Square', 'Parallelogram'].indexOf(c[1]), keep: true },
        steps: ['Congruent diagonals make a parallelogram a rectangle. Perpendicular diagonals make it a rhombus. Both make a square.', 'One right angle in a parallelogram forces all four (consecutive angles are supplementary): a rectangle. Two congruent consecutive sides force all four sides equal: a rhombus.', 'Answer: ' + c[1] + '.'], hint: 'Rectangle: equal diagonals. Rhombus: perpendicular diagonals.' }; }
    if (kind === 'rectdiag') { var xv = R.int(2, 9), P = eqPair(R, xv, 8, 40);
      return { q: '$ABCD$ is a rectangle. $AC = ' + lin(P.a, P.b) + '$ and $BD = ' + lin(P.c, P.d) + '$. Find $BD$.', a: num(P.val), steps: ['The diagonals of a rectangle are congruent: $AC = BD$.'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['$BD = ' + P.val + '$.']), hint: 'A rectangle\'s diagonals are equal.' }; }
    if (kind === 'rhomb90') { var xv2 = R.int(4, 20), e = expr(R, xv2, 90, 2, 6);
      return { q: 'The diagonals of rhombus $ABCD$ meet at $E$, and $' + mang('AEB') + ' = (' + e.tex + ')^\\circ$. Find $x$.', a: num(xv2), steps: ['The diagonals of a rhombus are perpendicular, so $' + mang('AEB') + ' = 90^\\circ$.', '$' + e.tex + ' = 90$, so $' + T.mono(e.a, 'x') + ' = ' + (90 - e.b) + '$ and $x = ' + xv2 + '$.'], hint: 'Rhombus diagonals cross at right angles.' }; }
    if (kind === 'rhombbis') { var xv3 = R.int(3, 12), half = R.int(20, 60), P2 = eqPair(R, xv3, half, half);
      return { q: 'In rhombus $ABCD$, $' + mang('BAC') + ' = (' + lin(P2.a, P2.b) + ')^\\circ$ and $' + mang('DAC') + ' = (' + lin(P2.c, P2.d) + ')^\\circ$. Find $' + mang('BAD') + '$.', a: num(2 * half),
        steps: ['Each diagonal of a rhombus bisects a pair of opposite angles, so $' + mang('BAC') + ' = ' + mang('DAC') + '$.'].concat(solveSteps({ a: P2.a, b: P2.b }, { a: P2.c, b: P2.d }, xv3)).concat(['Each half is $' + deg(half) + '$, so $' + mang('BAD') + ' = ' + deg(2 * half) + '$.']), hint: 'The diagonal AC splits angle BAD into two equal parts.' }; }
    if (kind === 'rhside') { var p = R.int(2, 9), q = R.int(2, 9), N = p * p + q * q;
      return { q: 'A rhombus has diagonals of length $' + 2 * p + '$ and $' + 2 * q + '$. Find the length of a side. Give an exact answer.', a: rnum(sqrtN(N)), viz: fig({ pts: { A: [-p, 0], B: [0, -q], C: [p, 0], D: [0, q], E: [0, 0] }, polys: [['A', 'B', 'C', 'D', { fill: 'blue' }]], segs: [['A', 'C', { color: 'muted' }], ['B', 'D', { color: 'muted' }], ['A', 'E', { lab: String(p) }], ['E', 'D', { lab: String(q) }]], angs: [['C', 'E', 'D', { right: 1 }]], nolab: ['E'], height: 220 }, 'A rhombus with its diagonals'),
        steps: ['The diagonals of a rhombus bisect each other at right angles, making four right triangles with legs $' + p + '$ and $' + q + '$.', 'Each side is a hypotenuse: $s = \\sqrt{' + p + '^2 + ' + q + '^2} = \\sqrt{' + N + '}' + (sqrtN(N).r !== N ? ' = ' + rtex(sqrtN(N)) : '') + '$.'], hint: 'Half of each diagonal makes a leg of a right triangle.' }; }
    if (kind === 'rectang') { var a = R.int(15, 75);
      return { q: 'The diagonals of rectangle $ABCD$ meet at $E$. If $' + mang('EAB') + ' = ' + deg(a) + '$, find $' + mang('AEB') + '$.', a: num(180 - 2 * a),
        steps: ['The diagonals of a rectangle are congruent and bisect each other, so $EA = EB$.', 'So $' + tri('AEB') + '$ is isosceles and $' + mang('EBA') + ' = ' + mang('EAB') + ' = ' + deg(a) + '$.', '$' + mang('AEB') + ' = 180 - 2 \\cdot ' + a + ' = ' + deg(180 - 2 * a) + '$.'], hint: 'Half-diagonals are equal, so triangle AEB is isosceles.' }; }
    var k = R.pick([['A quadrilateral has perpendicular diagonals. Must it be a rhombus?', 'No: a kite has perpendicular diagonals too', ['Yes: perpendicular diagonals always make a rhombus', 'Yes, if it is drawn that way', 'No: only a square has perpendicular diagonals'], 'Perpendicular diagonals make a parallelogram a rhombus, but a quadrilateral that is not a parallelogram (a kite) can also have them.'], ['A quadrilateral has congruent diagonals. Must it be a rectangle?', 'No: an isosceles trapezoid has congruent diagonals too', ['Yes: congruent diagonals always make a rectangle', 'Yes, but only if it is a square', 'No: congruent diagonals are impossible'], 'Congruent diagonals make a parallelogram a rectangle, but an isosceles trapezoid also has them.'], ['A parallelogram has perpendicular diagonals. Must it be a rhombus?', 'Yes', ['No: it could be a kite', 'No: it could be a rectangle', 'Only if its angles are right angles'], 'For a parallelogram, perpendicular diagonals do force all four sides to be equal (each side is the hypotenuse of a congruent right triangle).']]);
    return { q: k[0], a: mc(k[1], k[2]), steps: [k[3]], hint: 'Is the shape known to be a parallelogram?' };
  });

  function classifyQuad(P) { // P: 4 integer points in order
    function v(i, j) { return [P[j][0] - P[i][0], P[j][1] - P[i][1]]; }
    function par(a, b) { return a[0] * b[1] - a[1] * b[0] === 0; }
    function d2(a) { return a[0] * a[0] + a[1] * a[1]; }
    var AB = v(0, 1), BC = v(1, 2), CD = v(2, 3), DA = v(3, 0), p1 = par(AB, CD), p2 = par(BC, DA), L = [d2(AB), d2(BC), d2(CD), d2(DA)];
    var right = AB[0] * BC[0] + AB[1] * BC[1] === 0;
    if (p1 && p2) { var rh = L[0] === L[1]; if (right && rh) return 'square'; if (right) return 'rectangle'; if (rh) return 'rhombus'; return 'parallelogram'; }
    if (p1 || p2) return 'trapezoid';
    if ((L[0] === L[1] && L[2] === L[3]) || (L[1] === L[2] && L[3] === L[0])) return 'kite';
    return 'quadrilateral';
  }
  var QWORD = { square: 'A square', rectangle: 'A rectangle (not a square)', rhombus: 'A rhombus (not a square)', parallelogram: 'A parallelogram (not a rectangle or a rhombus)', trapezoid: 'A trapezoid', kite: 'A kite' };
  G('geo.coordinate-proofs', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['slope', 'mids', 'perp'], ['classify', 'mids', 'perp', 'place'], ['classify', 'place', 'classify', 'perp']));
    function makeQuad(type) {
      var A = [R.int(-5, 0), R.int(-5, 0)], u, v, P;
      var trip = R.pick([[3, 4], [4, 3], [0, 5], [5, 0]]);
      if (type === 'square') { u = [R.int(1, 4), R.int(0, 3)]; v = [-u[1], u[0]]; }
      else if (type === 'rectangle') { u = [R.int(1, 3), R.int(1, 2)]; var k = R.int(2, 3); v = [-u[1] * k, u[0] * k]; if (R.coin()) { var t = u; u = v; v = t; } }
      else if (type === 'rhombus') { u = [trip[0], trip[1]]; v = R.pick([[5, 0], [0, 5], [-3, 4], [4, -3], [3, -4]].filter(function (w) { return w[0] * u[0] + w[1] * u[1] !== 0 && !(w[0] === u[0] && w[1] === u[1]) && !(w[0] === -u[0] && w[1] === -u[1]); })); }
      else if (type === 'parallelogram') { do { u = [R.int(3, 6), R.int(-1, 1)]; v = [R.int(1, 3), R.int(2, 4)]; } while (u[0] * v[0] + u[1] * v[1] === 0 || u[0] * u[0] + u[1] * u[1] === v[0] * v[0] + v[1] * v[1]); }
      if (type === 'trapezoid') { u = [R.int(2, 4), R.int(0, 1)]; v = [R.int(0, 2), R.int(3, 4)]; var m = R.int(2, 3); return [A, [A[0] + m * u[0], A[1] + m * u[1]], [A[0] + v[0] + u[0], A[1] + v[1] + u[1]], [A[0] + v[0], A[1] + v[1]]]; }
      if (type === 'kite') { var h = R.int(2, 4), w1 = R.int(1, 3), w2 = R.int(4, 6), c = [R.int(-2, 2), R.int(-2, 2)]; var kp = [[c[0], c[1] + w1], [c[0] + h, c[1]], [c[0], c[1] - w2], [c[0] - h, c[1]]]; return kp; }
      return [A, [A[0] + u[0], A[1] + u[1]], [A[0] + u[0] + v[0], A[1] + u[1] + v[1]], [A[0] + v[0], A[1] + v[1]]];
    }
    if (kind === 'classify') {
      var type = R.pick(['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'kite']), P = makeQuad(type), got = classifyQuad(P);
      var N = ['A', 'B', 'C', 'D'], o = { pts: {}, polys: [['A', 'B', 'C', 'D', { fill: 'blue' }]], axes: true, height: 270 }; N.forEach(function (n, i) { o.pts[n] = P[i]; });
      var sl = function (i, j) { var dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1]; return dx === 0 ? '\\text{undefined}' : T.frac(dy, dx); }, ln = function (i, j) { return dist2(P[i], P[j]); };
      return { q: 'Classify quadrilateral $ABCD$ with $A' + pt(P[0]) + '$, $B' + pt(P[1]) + '$, $C' + pt(P[2]) + '$, $D' + pt(P[3]) + '$. Choose the most specific name.', a: mc(QWORD[got], Object.keys(QWORD).filter(function (k2) { return k2 !== got; }).map(function (k2) { return QWORD[k2]; }).filter(function (w) { return R.chance(0.9); })), viz: fig(o, 'Quadrilateral ABCD on a grid'),
        steps: ['Slopes: $AB$: $' + sl(0, 1) + '$, $BC$: $' + sl(1, 2) + '$, $CD$: $' + sl(2, 3) + '$, $DA$: $' + sl(3, 0) + '$. Equal slopes mean parallel sides; slopes with product $-1$ mean perpendicular sides.', 'Squared lengths: $AB^2 = ' + ln(0, 1) + '$, $BC^2 = ' + ln(1, 2) + '$, $CD^2 = ' + ln(2, 3) + '$, $DA^2 = ' + ln(3, 0) + '$.', { square: 'Both pairs of opposite sides are parallel, all sides are equal, and the sides are perpendicular: a square.', rectangle: 'Both pairs of opposite sides are parallel and consecutive sides are perpendicular, but not all sides are equal: a rectangle.', rhombus: 'Both pairs of opposite sides are parallel and all four sides are equal, but there are no right angles: a rhombus.', parallelogram: 'Both pairs of opposite sides are parallel, with no right angles and not all sides equal: a parallelogram.', trapezoid: 'Exactly one pair of sides is parallel: a trapezoid.', kite: 'No sides are parallel, but two pairs of consecutive sides are equal: a kite.' }[got]], hint: 'Compute the four slopes and the four lengths.', chk: { quad: P, type: got } };
    }
    var A = [R.int(-5, 1), R.int(-5, 1)], u2 = [R.int(2, 6), R.int(-2, 3)], v2 = [R.nz(-2, 2), R.int(2, 5)], B = [A[0] + u2[0], A[1] + u2[1]], C = [B[0] + v2[0], B[1] + v2[1]], D = [A[0] + v2[0], A[1] + v2[1]];
    if (kind === 'slope') return { q: 'Find the slope of $' + seg('BC') + '$ for $B' + pt(B) + '$ and $C' + pt(C) + '$.', a: num(qplain(v2[1], v2[0])),
      steps: ['Slope $= \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{' + C[1] + ' - ' + T.p(B[1]) + '}{' + C[0] + ' - ' + T.p(B[0]) + '} = ' + (v2[0] === 0 ? '\\dfrac{' + v2[1] + '}{0}' : T.frac(v2[1], v2[0])) + '$' + (v2[0] === 0 ? ', which is undefined: the segment is vertical.' : '.')], hint: 'Rise over run.' };
    if (kind === 'mids') { var m = mid(A, C), m2 = mid(B, D);
      return { q: '$ABCD$ has vertices $A' + pt(A) + '$, $B' + pt(B) + '$, $C' + pt(C) + '$ and $D' + pt(D) + '$. Find the midpoint of diagonal $' + seg('AC') + '$. (Compare it with the midpoint of $' + seg('BD') + '$ to see if the diagonals bisect each other.)', a: { t: 'tuple', v: [tq(m[0]), tq(m[1])] },
        steps: ['Midpoint of $' + seg('AC') + '$: $\\left(\\dfrac{' + A[0] + ' + ' + T.p(C[0]) + '}{2}, \\dfrac{' + A[1] + ' + ' + T.p(C[1]) + '}{2}\\right) = ' + T.pt([tq(m[0]), tq(m[1])]) + '$.', 'Midpoint of $' + seg('BD') + '$: $' + T.pt([tq(m2[0]), tq(m2[1])]) + '$, the same point.', 'So the diagonals bisect each other, which proves $ABCD$ is a parallelogram.'], hint: 'Average the coordinates of A and C.', nolint: ['+ 0'] }; }
    if (kind === 'perp') { var p = R.nz(-5, 5), q = R.nz(-5, 5), isP = R.coin(), s1 = [p, q], s2 = isP ? [-q, p] : [-q + R.pick([-1, 1]), p];
      var m1 = T.frac(s1[1], s1[0]), mm2 = s2[0] === 0 ? null : T.frac(s2[1], s2[0]), prodOK = s1[0] * s2[0] + s1[1] * s2[1] === 0;
      return { q: 'At vertex $B$ of a quadrilateral, side $' + seg('AB') + '$ has slope $' + m1 + '$ and side $' + seg('BC') + '$ has slope $' + (mm2 === null ? '\\text{undefined}' : mm2) + '$. True or false: $' + ang('ABC') + '$ is a right angle.', a: tf(prodOK),
        steps: ['Two lines (neither vertical) are perpendicular when the product of their slopes is $-1$.', mm2 === null ? 'A vertical side is perpendicular only to a horizontal one (slope $0$).' : 'Product: $' + T.p(m1) + ' \\cdot ' + T.p(mm2) + ' = ' + T.frac(s1[1] * s2[1], s1[0] * s2[0]) + '$.', prodOK ? 'The product is $-1$, so the sides are perpendicular: true.' : 'The product is not $-1$, so the angle is not a right angle: false.'], hint: 'Multiply the slopes.' }; }
    var pl = R.pick([['any rectangle', '$(0, 0)$, $(a, 0)$, $(a, b)$, $(0, b)$', ['$(0, 0)$, $(4, 0)$, $(4, 3)$, $(0, 3)$', '$(1, 2)$, $(a, 3)$, $(a, b)$, $(2, b)$', '$(0, 0)$, $(a, 0)$, $(b, c)$, $(0, c)$'], 'Put one corner at the origin and two sides on the axes. Using letters (not numbers) keeps the proof true for every rectangle.'], ['any isosceles triangle', '$(-a, 0)$, $(a, 0)$, $(0, b)$', ['$(0, 0)$, $(6, 0)$, $(3, 4)$', '$(0, 0)$, $(a, 0)$, $(b, c)$', '$(1, 1)$, $(a, 2)$, $(0, b)$'], 'Center the base on the $x$-axis so the apex sits on the $y$-axis; the symmetry makes the algebra short. Letters keep it general.'], ['any parallelogram', '$(0, 0)$, $(a, 0)$, $(a + b, c)$, $(b, c)$', ['$(0, 0)$, $(a, 0)$, $(a, c)$, $(0, c)$', '$(0, 0)$, $(5, 0)$, $(7, 3)$, $(2, 3)$', '$(0, 0)$, $(a, 0)$, $(b, c)$, $(d, e)$'], 'One side on the $x$-axis from the origin; the top side is the bottom side shifted by $(b, c)$, so opposite sides are parallel and equal by design. Numbers would prove it for only one shape.']]);
    return { q: 'You want to prove a fact about ' + pl[0] + ' with coordinates. Which vertices are the best choice?', a: mc(pl[1], pl[2]), steps: [pl[3]], hint: 'Use the origin and the axes, and use letters so the proof covers every case.' };
  });

  /* ================================================================ Unit: Similarity */

  function qT(n, d) { return T.frac(n, d); }
  G('geo.dilation-properties', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['img0', 'len', 'angle'], ['imgC', 'kfrom', 'angle', 'lines'], ['imgC', 'kcoord', 'lines', 'kfrom']));
    if (kind === 'img0') { var k = R.pick([2, 3, 4, '1/2']), kn = k === '1/2' ? 0.5 : k, P = [R.nz(-5, 5), R.nz(-5, 5)]; if (kn === 0.5) P = [2 * R.nz(-5, 5), 2 * R.nz(-5, 5)]; var Q = [P[0] * kn, P[1] * kn];
      return { q: 'Dilate $P' + pt(P) + '$ about the origin with scale factor $' + T.num(k) + '$. Find the image $P\'$.', a: { t: 'tuple', v: Q.map(function (v) { return tq(v); }) },
        steps: ['A dilation about the origin multiplies both coordinates by the scale factor: $(x, y) \\to (kx, ky)$.', '$P\' = (' + T.num(k) + ' \\cdot ' + T.p(P[0]) + ', ' + T.num(k) + ' \\cdot ' + T.p(P[1]) + ') = ' + pt(Q) + '$.', 'Check: $P\'$ is on the ray from the origin through $P$, ' + (kn > 1 ? kn + ' times as far out.' : 'half as far out.')], hint: 'Multiply each coordinate by k.' }; }
    if (kind === 'imgC') { var C = [R.nz(-4, 4), R.nz(-4, 4)], k2 = R.pick([2, 3, '1/2']), kn2 = k2 === '1/2' ? 0.5 : k2, d = [R.nz(-4, 4), R.nz(-4, 4)]; if (kn2 === 0.5) d = [2 * d[0], 2 * d[1]]; var P2 = [C[0] + d[0], C[1] + d[1]], Q2 = [C[0] + kn2 * d[0], C[1] + kn2 * d[1]];
      return { q: 'Dilate $P' + pt(P2) + '$ about the center $C' + pt(C) + '$ with scale factor $' + T.num(k2) + '$. Find $P\'$.', a: { t: 'tuple', v: Q2.map(String) },
        steps: ['From $C$ to $P$ is $\\langle ' + d[0] + ', ' + d[1] + ' \\rangle$.', 'Multiply by $' + T.num(k2) + '$: $\\langle ' + T.num(kn2 * d[0]) + ', ' + T.num(kn2 * d[1]) + ' \\rangle$.', 'Add to $C$: $P\' = ' + pt(Q2) + '$.'], hint: 'Scale the arrow from the center to P, not the coordinates of P.' }; }
    if (kind === 'len') { var L = R.int(2, 15), k3 = R.pick([2, 3, 4, 5, '1/2', '3/2', '2/3']), kq = ML.Q.from(k3), img = kq.mul(L);
      return { q: 'Segment $' + seg('AB') + '$ is $' + L + '$ cm long. After a dilation with scale factor $' + T.num(k3) + '$, how long is $' + seg('A\'B\'') + '$?', a: num(img.toPlain()), steps: ['A dilation multiplies every length by the scale factor.', '$A\'B\' = ' + T.num(k3) + ' \\cdot ' + L + ' = ' + img.toTex() + '$ cm.'], hint: 'Multiply the length by k.' }; }
    if (kind === 'kfrom') { var L2 = R.int(3, 12), k4 = R.pick(['2', '3', '1/2', '1/3', '5/2', '3/4', '4/3']), kq2 = ML.Q.from(k4); if (!kq2.mul(L2).isInt()) L2 = kq2.den() * R.int(1, 4); var im2 = kq2.mul(L2);
      return { q: 'A dilation maps $' + seg('AB') + '$ with $AB = ' + L2 + '$ to $' + seg('A\'B\'') + '$ with $A\'B\' = ' + im2.toTex() + '$. What is the scale factor?', a: num(kq2.toPlain()), steps: ['The scale factor is image length over original length.', '$k = \\dfrac{' + im2.toTex() + '}{' + L2 + '} = ' + kq2.toTex() + '$.', kq2.gt(1) ? 'It is more than 1: an enlargement.' : 'It is less than 1: a reduction.'], hint: 'Divide the new length by the old length.' }; }
    if (kind === 'angle') { var a = R.int(25, 120), k5 = R.pick([2, 3, '1/2', '5/2']);
      return { q: '$' + tri('ABC') + '$ is dilated by a scale factor of $' + T.num(k5) + '$ to make $' + tri('A\'B\'C\'') + '$. If $' + mang('A') + ' = ' + deg(a) + '$, find $' + mang('A\'') + '$.', a: num(a),
        steps: ['A dilation multiplies lengths by $k$, but it keeps angle measures the same: the sides keep their directions (each side maps to a parallel side).', '$' + mang('A\'') + ' = ' + deg(a) + '$.'], hint: 'Do angles change when a figure is scaled?' }; }
    if (kind === 'kcoord') { var k6 = R.pick(['3/2', '5/2', '2/3', '3/4', '4/3', '5/4']), kq3 = ML.Q.from(k6), P3 = [kq3.den() * R.nz(-3, 3), kq3.den() * R.nz(-3, 3)], Q3 = [kq3.mul(P3[0]), kq3.mul(P3[1])];
      return { q: 'A dilation about the origin maps $P' + pt(P3) + '$ to $P\'' + T.pt([Q3[0].toPlain(), Q3[1].toPlain()]) + '$. Find the scale factor.', a: num(kq3.toPlain()), steps: ['About the origin, $P\' = kP$, so $k = \\dfrac{x\'}{x}$.', '$k = \\dfrac{' + Q3[0].toTex() + '}{' + P3[0] + '} = ' + kq3.toTex() + '$ (the $y$-coordinates give the same: $\\dfrac{' + Q3[1].toTex() + '}{' + P3[1] + '} = ' + kq3.toTex() + '$).'], hint: 'Divide an image coordinate by the matching original coordinate.' }; }
    var m = R.pick([['A dilation has center $O$. Line $\\ell$ does not pass through $O$. What is the image of $\\ell$?', 'A line parallel to $\\ell$', ['Line $\\ell$ itself', 'A line perpendicular to $\\ell$', 'A line through $O$'], 'Every point of $\\ell$ moves straight away from (or toward) $O$ by the same factor, so the image is a parallel line.'], ['A dilation has center $O$. Line $m$ passes through $O$. What is the image of $m$?', 'Line $m$ itself', ['A line parallel to $m$', 'A line perpendicular to $m$', 'A single point'], 'Points on $m$ slide along $m$ (along their rays from $O$), so $m$ maps onto itself.'], ['Under a dilation with scale factor $k$, which quantity stays the same?', 'Angle measures', ['Side lengths', 'Perimeter', 'Area'], 'Lengths and perimeter are multiplied by $k$ and area by $k^2$, but angles do not change.']]);
    return { q: m[0], a: mc(m[1], m[2]), steps: [m[3]], hint: 'Each point moves along the ray from the center.' };
  });

  G('geo.similarity-transformations', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['tf', 'missing', 'perim'], ['rect', 'missing', 'tf', 'perim'], ['seq', 'rect', 'missing', 'seq']));
    if (kind === 'tf') { var f = R.pick([['All circles are similar.', true, 'Any circle can be translated to share a center with another and then dilated by the ratio of the radii.'], ['All squares are similar.', true, 'Every square has four right angles, and a dilation by the ratio of the sides matches the lengths.'], ['All rectangles are similar.', false, 'A $1 \\times 2$ rectangle and a $1 \\times 5$ rectangle have different length-to-width ratios.'], ['All equilateral triangles are similar.', true, 'All their angles are $60^\\circ$, and one dilation scales all three equal sides.'], ['All isosceles triangles are similar.', false, 'An isosceles triangle with a $20^\\circ$ vertex angle is not the same shape as one with a $100^\\circ$ vertex angle.'], ['All right triangles are similar.', false, 'A $30$-$60$-$90$ triangle and a $45$-$45$-$90$ triangle are both right triangles, but their other angles differ.'], ['All regular hexagons are similar.', true, 'All their angles are $120^\\circ$ and all sides are equal, so one dilation matches them.'], ['All rhombuses are similar.', false, 'A square is a rhombus, and so is a long, thin diamond, but they are not the same shape.'], ['All isosceles right triangles are similar.', true, 'Their angles are always $45^\\circ$, $45^\\circ$ and $90^\\circ$.']]);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Can you find two examples with different shapes?' }; }
    if (kind === 'missing') { var k = R.pick(['2', '3', '3/2', '5/2', '4/3', '1/2']), kq = ML.Q.from(k), ab = kq.den() * R.int(2, 6), bc = kq.den() * R.int(2, 7), de = kq.mul(ab), ef = kq.mul(bc);
      return { q: '$' + tri('ABC') + ' \\sim ' + tri('DEF') + '$. $AB = ' + ab + '$, $BC = ' + bc + '$ and $DE = ' + de.toTex() + '$. Find $EF$.', a: num(ef.toPlain()),
        steps: ['Corresponding sides are in the same ratio: $\\dfrac{DE}{AB} = \\dfrac{EF}{BC}$.', 'Scale factor: $\\dfrac{' + de.toTex() + '}{' + ab + '} = ' + kq.toTex() + '$.', '$EF = ' + kq.toTex() + ' \\cdot ' + bc + ' = ' + ef.toTex() + '$.'], hint: 'Find the scale factor from AB and DE.' }; }
    if (kind === 'perim') { var k2 = R.pick([2, 3, 4, 5]), P = R.int(8, 40);
      return { q: 'Two triangles are similar with scale factor $' + k2 + '$ (big to small: $' + k2 + ' : 1$). The smaller one has perimeter $' + P + '$. Find the perimeter of the larger one.', a: num(k2 * P), steps: ['Every side of the larger triangle is $' + k2 + '$ times the matching side.', 'So the perimeter (the sum of the sides) is also $' + k2 + '$ times as large: $' + k2 + ' \\cdot ' + P + ' = ' + k2 * P + '$.'], hint: 'Perimeters scale like lengths.' }; }
    if (kind === 'rect') { var w = R.int(2, 9), l = w + R.int(1, 7), k3 = R.pick([2, 3, '3/2', '5/2']), kq3 = ML.Q.from(k3), sim = R.coin(); if (!kq3.mul(w).isInt() || !kq3.mul(l).isInt()) { w *= 2; l *= 2; }
      var w2 = kq3.mul(w).num(), l2 = kq3.mul(l).num() + (sim ? 0 : R.pick([-1, 1, 2]));
      return { q: 'Rectangle 1 is $' + w + '$ by $' + l + '$. Rectangle 2 is $' + w2 + '$ by $' + l2 + '$. True or false: the rectangles are similar.', a: tf(w * l2 === l * w2),
        steps: ['Rectangles are similar when their sides are in the same ratio (all their angles are already $90^\\circ$).', 'Compare short side to short side and long side to long side: $\\dfrac{' + w2 + '}{' + w + '}$ and $\\dfrac{' + l2 + '}{' + l + '}$.', w * l2 === l * w2 ? 'Both ratios equal $' + T.frac(w2, w) + '$, so they are similar.' : '$' + T.frac(w2, w) + ' \\ne ' + T.frac(l2, l) + '$, so they are not similar.'], hint: 'Compare the two ratios.' }; }
    // seq: dilate then translate
    var k4 = R.pick([2, 3]), t = [R.nz(-5, 5), R.nz(-5, 5)], A = [R.int(-2, 2), R.int(-2, 2)], B = [A[0] + R.int(1, 2), A[1]], C = [A[0], A[1] + R.int(1, 2)];
    var img = function (p) { return [k4 * p[0] + t[0], k4 * p[1] + t[1]]; }, D = img(A), E = img(B), F = img(C);
    var good = 'Dilate by $' + k4 + '$ about the origin, then translate by $\\langle ' + t[0] + ', ' + t[1] + ' \\rangle$';
    return { q: '$' + tri('ABC') + '$ has $A' + pt(A) + '$, $B' + pt(B) + '$, $C' + pt(C) + '$ and $' + tri('DEF') + '$ has $D' + pt(D) + '$, $E' + pt(E) + '$, $F' + pt(F) + '$. Which sequence maps $' + tri('ABC') + '$ onto $' + tri('DEF') + '$?', a: mc(good, ['Translate by $\\langle ' + t[0] + ', ' + t[1] + ' \\rangle$, then dilate by $' + k4 + '$ about the origin', 'Dilate by $' + (k4 === 2 ? 3 : 2) + '$ about the origin, then translate by $\\langle ' + t[0] + ', ' + t[1] + ' \\rangle$', 'Dilate by $' + k4 + '$ about the origin, then translate by $\\langle ' + (-t[0]) + ', ' + (-t[1]) + ' \\rangle$']),
      steps: ['$DE = ' + k4 + ' \\cdot AB$, so the scale factor is $' + k4 + '$.', 'Dilate first: $A \\to ' + pt([k4 * A[0], k4 * A[1]]) + '$. Then translate to $D' + pt(D) + '$: the vector is $\\langle ' + t[0] + ', ' + t[1] + ' \\rangle$.', 'Translating first and then dilating would also multiply the translation by $' + k4 + '$, which gives a different image. Order matters.'], hint: 'Find the scale factor from side lengths, then see where A lands after the dilation.' };
  });

  G('geo.aa-similarity', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['tf', 'nested', 'why'], ['nested', 'shadow', 'tf', 'hour'], ['hour', 'nested', 'shadow']));
    if (kind === 'tf') { var a = R.int(30, 80), b = R.int(30, 140 - a), c = 180 - a - b, sim = R.coin(), b2 = sim ? c : c + R.pick([-6, -4, 4, 6]);
      return { q: '$' + tri('ABC') + '$ has angles $' + deg(a) + '$ and $' + deg(b) + '$. $' + tri('DEF') + '$ has angles $' + deg(a) + '$ and $' + deg(b2) + '$. True or false: the triangles must be similar.', a: tf(sim),
        steps: ['Find the third angle of $' + tri('ABC') + '$: $180 - ' + a + ' - ' + b + ' = ' + c + '$. So $' + tri('ABC') + '$ has angles $' + a + '^\\circ, ' + b + '^\\circ, ' + c + '^\\circ$.', sim ? '$' + tri('DEF') + '$ has $' + deg(a) + '$ and $' + deg(c) + '$: two pairs of equal angles, so they are similar by AA.' : '$' + tri('DEF') + '$ has angles $' + a + '^\\circ, ' + b2 + '^\\circ, ' + (180 - a - b2) + '^\\circ$. Only one pair matches, so they are not similar.'], hint: 'Find the missing third angles first.' }; }
    if (kind === 'why') return { q: 'In $' + tri('ABC') + '$, $D$ is on $' + seg('AB') + '$ and $E$ is on $' + seg('AC') + '$ with $' + seg('DE') + ' \\parallel ' + seg('BC') + '$. Why is $' + tri('ADE') + ' \\sim ' + tri('ABC') + '$?', a: mc('AA: they share $' + ang('A') + '$, and $' + ang('ADE') + ' \\cong ' + ang('ABC') + '$ (corresponding angles)', ['SSS: all three sides are proportional', 'SAS: two sides and the angle between them are congruent', 'They are congruent by ASA']),
      steps: ['$' + ang('A') + '$ is in both triangles.', 'The parallel lines $' + seg('DE') + '$ and $' + seg('BC') + '$, cut by $' + seg('AB') + '$, make corresponding angles $' + ang('ADE') + '$ and $' + ang('ABC') + '$ congruent.', 'Two pairs of congruent angles: similar by AA.'], hint: 'Look for angles you know are equal without measuring.' };
    if (kind === 'nested') { var ad = R.int(2, 8), db = R.int(2, 8), de = R.int(2, 9) * (ad), ab = ad + db, bc = ML.Q(de * ab, ad);
      return { q: 'In $' + tri('ABC') + '$, $' + seg('DE') + ' \\parallel ' + seg('BC') + '$ with $D$ on $' + seg('AB') + '$ and $E$ on $' + seg('AC') + '$. $AD = ' + ad + '$, $DB = ' + db + '$ and $DE = ' + de + '$. Find $BC$.', a: num(bc.toPlain()), viz: fig({ pts: { A: [2.2, 4.2], B: [0, 0], C: [6.5, 0], D: [2.2 - 2.2 * ad / ab, 4.2 - 4.2 * ad / ab], E: [2.2 + 4.3 * ad / ab, 4.2 - 4.2 * ad / ab] }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [['D', 'E', { arrow: 1, lab: String(de), color: 'blue' }], ['B', 'C', { arrow: 1, lab: '?' }], ['A', 'D', { lab: String(ad) }], ['D', 'B', { lab: String(db) }]], height: 220 }, 'Triangle ABC with DE parallel to BC'),
        steps: ['$' + tri('ADE') + ' \\sim ' + tri('ABC') + '$ by AA (shared $' + ang('A') + '$, corresponding angles at $D$ and $B$).', 'The whole side $AB = ' + ad + ' + ' + db + ' = ' + ab + '$. Match whole to whole: $\\dfrac{BC}{DE} = \\dfrac{AB}{AD} = \\dfrac{' + ab + '}{' + ad + '}$.', '$BC = ' + de + ' \\cdot \\dfrac{' + ab + '}{' + ad + '} = ' + bc.toTex() + '$.'], hint: 'Compare the small triangle ADE with the whole triangle ABC. Use AB, not DB.' }; }
    if (kind === 'shadow') { var h = R.pick([5, 6]), s = R.pick([2, 3, 4, 8]), S = s * R.int(3, 9), H = ML.Q(h * S, s); var who = R.pick(['A person', 'A post', 'A student']), obj = R.pick(['tree', 'flagpole', 'building', 'light tower']);
      return { q: who + ' who is ' + h + ' ft tall casts a ' + s + ' ft shadow. At the same moment, a ' + obj + ' casts a ' + S + ' ft shadow. How tall is the ' + obj + ', in feet?', a: num(H.toPlain()),
        steps: ['The sun\'s rays make the same angle with the ground for both, and both stand straight up, so the two right triangles are similar by AA.', 'Set up a proportion: $\\dfrac{\\text{height}}{\\text{shadow}}$: $\\dfrac{' + h + '}{' + s + '} = \\dfrac{x}{' + S + '}$.', '$x = \\dfrac{' + h + ' \\cdot ' + S + '}{' + s + '} = ' + H.toTex() + '$ ft.'], hint: 'Height and shadow make similar right triangles.' }; }
    var ac = R.int(3, 9), k = R.pick([2, 3, '3/2', '4/3', '5/2']), kq = ML.Q.from(k); if (!kq.mul(ac).isInt()) ac = kq.den() * R.int(2, 4); var ce = kq.mul(ac), ab2 = R.int(3, 10), de2 = kq.mul(ab2);
    return { q: 'Segments $' + seg('AE') + '$ and $' + seg('BD') + '$ cross at $C$, and $' + seg('AB') + ' \\parallel ' + seg('DE') + '$. $AC = ' + ac + '$, $CE = ' + ce.toTex() + '$ and $AB = ' + ab2 + '$. Find $DE$.', a: num(de2.toPlain()), viz: fig({ pts: { A: [0, 3], B: [2.6, 3], C: [2.2, 3 - 3 / (1 + kq.toNumber())], E: [2.2 * (1 + kq.toNumber()), 3 - 3 / (1 + kq.toNumber()) * (1 + kq.toNumber())], D: [2.2 * (1 + kq.toNumber()) - 2.6 * kq.toNumber(), 0] }, segs: [['A', 'B', { arrow: 1 }], ['D', 'E', { arrow: 1 }], ['A', 'E'], ['B', 'D']], height: 200 }, 'Two triangles meeting at C with AB parallel to DE'),
      steps: ['$' + ang('ACB') + ' \\cong ' + ang('ECD') + '$ (vertical angles) and $' + ang('A') + ' \\cong ' + ang('E') + '$ (alternate interior angles), so $' + tri('ACB') + ' \\sim ' + tri('ECD') + '$ by AA.', 'Scale factor from the small triangle to the big one: $\\dfrac{CE}{AC} = \\dfrac{' + ce.toTex() + '}{' + ac + '} = ' + kq.toTex() + '$.', '$DE = ' + kq.toTex() + ' \\cdot ' + ab2 + ' = ' + de2.toTex() + '$.'], hint: 'Match A with E and B with D.' };
  });

  G('geo.sss-sas-similarity', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['k', 'sss', 'k'], ['sss', 'findx', 'which'], ['which', 'sss', 'findx']));
    var base = R.pick([[3, 4, 5], [4, 5, 6], [2, 3, 4], [5, 6, 8], [3, 5, 7], [4, 6, 9], [5, 7, 9], [6, 7, 10]]), kq = ML.Q.from(R.pick(['2', '3', '3/2', '5/2', '1/2'])), sides = base.map(function (v) { return v * kq.den(); });
    var big = sides.map(function (v) { return kq.mul(v).num(); });
    if (kind === 'k') { var sh = R.shuffle(big);
      return { q: 'Two similar triangles have sides $' + sides.join('$, $') + '$ and $' + sh.join('$, $') + '$. What is the scale factor from the first triangle to the second?', a: num(kq.toPlain()),
        steps: ['Match sides by size: shortest with shortest, and so on.', 'Shortest: $\\dfrac{' + big[0] + '}{' + sides[0] + '} = ' + kq.toTex() + '$ (the other pairs give the same ratio).'], hint: 'Sort both lists, then divide.' }; }
    if (kind === 'sss') { var sim = R.coin(), B2 = big.slice(); if (!sim) { var j = R.int(0, 2); B2[j] += R.pick([-1, 1, 2]); if (B2[j] <= 0) B2[j] += 3; } var shown = R.shuffle(B2);
      var srt = B2.slice().sort(function (x, y) { return x - y; }), ok = srt.every(function (v, i) { return v * sides[0] === sides[i] * srt[0]; });
      return { q: 'Triangle 1 has sides $' + sides.join('$, $') + '$. Triangle 2 has sides $' + shown.join('$, $') + '$. True or false: the triangles are similar.', a: tf(ok),
        steps: ['Sort both lists and compare matching sides (smallest to smallest).', 'Ratios: ' + srt.map(function (v, i) { return '$\\dfrac{' + v + '}{' + sides[i] + '} = ' + T.frac(v, sides[i]) + '$'; }).join(', ') + '.', ok ? 'All three ratios are equal, so the triangles are similar by SSS.' : 'The ratios are not all equal, so the triangles are not similar.'], hint: 'Put the sides in order before you compare them.' }; }
    if (kind === 'findx') { var miss = R.int(0, 2);
      return { q: 'Triangle 1 has sides $' + sides.join('$, $') + '$ (shortest to longest). Triangle 2 has sides ' + big.map(function (v, i) { return i === miss ? '$x$' : '$' + v + '$'; }).join(', ') + ' (shortest to longest). Find $x$ so the triangles are similar.', a: num(big[miss]),
        steps: ['For similarity by SSS all three ratios must be equal.', 'From a known pair: $k = \\dfrac{' + big[(miss + 1) % 3] + '}{' + sides[(miss + 1) % 3] + '} = ' + kq.toTex() + '$.', '$x = ' + kq.toTex() + ' \\cdot ' + sides[miss] + ' = ' + big[miss] + '$.'], hint: 'Find the scale factor from a pair you know.' }; }
    var c = R.pick(['AA', 'SSS', 'SAS', 'none', 'none2']), q, why, ans;
    var an = R.int(35, 110);
    if (c === 'AA') { var b = R.int(25, 140 - an); q = '$' + mang('A') + ' = ' + mang('D') + ' = ' + deg(an) + '$ and $' + mang('B') + ' = ' + mang('E') + ' = ' + deg(b) + '$.'; ans = 'AA'; why = 'Two pairs of congruent angles.'; }
    else if (c === 'SSS') { q = '$AB = ' + sides[0] + '$, $BC = ' + sides[1] + '$, $CA = ' + sides[2] + '$; $DE = ' + big[0] + '$, $EF = ' + big[1] + '$, $FD = ' + big[2] + '$.'; ans = 'SSS'; why = 'All three ratios equal $' + kq.toTex() + '$.'; }
    else if (c === 'SAS') { q = '$AB = ' + sides[0] + '$, $AC = ' + sides[1] + '$, $' + mang('A') + ' = ' + deg(an) + '$; $DE = ' + big[0] + '$, $DF = ' + big[1] + '$, $' + mang('D') + ' = ' + deg(an) + '$.'; ans = 'SAS'; why = '$\\dfrac{DE}{AB} = \\dfrac{DF}{AC} = ' + kq.toTex() + '$ and the angles between those sides are congruent.'; }
    else if (c === 'none') { q = '$AB = ' + sides[0] + '$, $BC = ' + sides[1] + '$, $' + mang('A') + ' = ' + deg(an) + '$; $DE = ' + big[0] + '$, $EF = ' + big[1] + '$, $' + mang('D') + ' = ' + deg(an) + '$.'; ans = 'Not enough to tell'; why = 'The angle is not between the proportional sides (that would be SSA), so similarity is not guaranteed.'; }
    else { q = '$AB = ' + sides[0] + '$, $BC = ' + sides[1] + '$, $CA = ' + sides[2] + '$; $DE = ' + big[0] + '$, $EF = ' + big[1] + '$, $FD = ' + (big[2] + 1) + '$.'; ans = 'Not similar'; why = 'The ratios are $' + kq.toTex() + '$, $' + kq.toTex() + '$ and $' + T.frac(big[2] + 1, sides[2]) + '$: not all equal.'; }
    var opts = ['AA', 'SSS', 'SAS', 'Not similar', 'Not enough to tell'];
    return { q: 'Which criterion, if any, proves $' + tri('ABC') + ' \\sim ' + tri('DEF') + '$? ' + q, a: mcKeep(opts, opts.indexOf(ans)), steps: [why, 'Answer: ' + ans + '.'], hint: 'For SAS, the angle must be between the two sides you compare.' };
  });

  G('geo.side-splitter', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['basic', 'basic', 'whole'], ['alg', 'converse', 'whole'], ['three', 'alg', 'converse', 'whole']));
    function ssFig(lab) { var f = { pts: { A: [2, 4.5], B: [0, 0], C: [7, 0], D: [2 - 2 * 0.45, 4.5 - 4.5 * 0.45], E: [2 + 5 * 0.45, 4.5 - 4.5 * 0.45] }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [['D', 'E', { arrow: 1, color: 'blue' }], ['B', 'C', { arrow: 1 }]], height: 230 };
      if (lab) Object.keys(lab).forEach(function (k) { f.segs.push([k[0], k[1], { lab: lab[k] }]); }); return fig(f, 'Triangle ABC with DE parallel to BC'); }
    if (kind === 'basic') { var ad = R.int(2, 9), db = R.int(2, 9), ae = R.chance(0.75) ? ad * R.int(1, 3) : R.int(2, 12), ec = ML.Q(db * ae, ad);
      return { q: 'In $' + tri('ABC') + '$, $' + seg('DE') + ' \\parallel ' + seg('BC') + '$. $AD = ' + ad + '$, $DB = ' + db + '$ and $AE = ' + ae + '$. Find $EC$.', a: num(ec.toPlain()), viz: ssFig({ AD: String(ad), DB: String(db), AE: String(ae), EC: '?' }),
        steps: ['Triangle Proportionality Theorem: a line parallel to one side divides the other two sides proportionally: $\\dfrac{AD}{DB} = \\dfrac{AE}{EC}$.', '$\\dfrac{' + ad + '}{' + db + '} = \\dfrac{' + ae + '}{EC}$, so $' + ad + ' \\cdot EC = ' + db * ae + '$.', '$EC = ' + ec.toTex() + '$.'], hint: 'Part over part on one side equals part over part on the other.' }; }
    if (kind === 'alg') { var xv = R.int(2, 10), p = R.int(1, 6), m = R.int(2, 3), ae2 = m * xv, ec2 = m * (xv + p);
      return { q: 'In $' + tri('ABC') + '$, $' + seg('DE') + ' \\parallel ' + seg('BC') + '$. $AD = x$, $DB = ' + lin(1, p) + '$, $AE = ' + ae2 + '$ and $EC = ' + ec2 + '$. Find $x$.', a: num(xv), viz: ssFig({ AD: 'x', DB: lin(1, p), AE: String(ae2), EC: String(ec2) }),
        steps: ['$\\dfrac{AD}{DB} = \\dfrac{AE}{EC}$: $\\dfrac{x}{' + lin(1, p) + '} = \\dfrac{' + ae2 + '}{' + ec2 + '}$.', 'Cross-multiply: $' + ec2 + 'x = ' + ae2 + '(' + lin(1, p) + ') = ' + lin(ae2, ae2 * p) + '$.', '$' + (ec2 - ae2) + 'x = ' + ae2 * p + '$, so $x = ' + xv + '$.'], hint: 'Set up the proportion and cross-multiply.' }; }
    if (kind === 'converse') { var a1 = R.int(2, 9), b1 = R.int(2, 9), k = R.int(2, 3), par = R.coin(), c1 = a1 * k, d1 = par ? b1 * k : b1 * k + R.pick([-1, 1]);
      return { q: 'In $' + tri('ABC') + '$, $D$ is on $' + seg('AB') + '$ and $E$ is on $' + seg('AC') + '$. $AD = ' + a1 + '$, $DB = ' + b1 + '$, $AE = ' + c1 + '$ and $EC = ' + d1 + '$. True or false: $' + seg('DE') + ' \\parallel ' + seg('BC') + '$.', a: tf(a1 * d1 === b1 * c1),
        steps: ['By the converse of the Triangle Proportionality Theorem, $' + seg('DE') + ' \\parallel ' + seg('BC') + '$ exactly when $\\dfrac{AD}{DB} = \\dfrac{AE}{EC}$.', 'Cross products: $' + a1 + ' \\cdot ' + d1 + ' = ' + a1 * d1 + '$ and $' + b1 + ' \\cdot ' + c1 + ' = ' + b1 * c1 + '$.', a1 * d1 === b1 * c1 ? 'Equal, so the sides are divided proportionally and $' + seg('DE') + ' \\parallel ' + seg('BC') + '$.' : 'Not equal, so $' + seg('DE') + '$ is not parallel to $' + seg('BC') + '$.'], hint: 'Compare AD/DB with AE/EC.' }; }
    if (kind === 'whole') { var ad3 = R.int(2, 8), ab3 = ad3 + R.int(2, 9), ae3 = R.chance(0.75) ? ad3 * R.int(1, 3) : R.int(2, 10), ac3 = ML.Q(ab3 * ae3, ad3), ec3 = ac3.sub(ae3);
      return { q: 'In $' + tri('ABC') + '$, $' + seg('DE') + ' \\parallel ' + seg('BC') + '$. $AD = ' + ad3 + '$, $AB = ' + ab3 + '$ (the whole side) and $AE = ' + ae3 + '$. Find $EC$.', a: num(ec3.toPlain()), viz: ssFig({ AD: String(ad3), AE: String(ae3), EC: '?' }),
        steps: ['Match like with like. Using whole sides: $\\dfrac{AD}{AB} = \\dfrac{AE}{AC}$, so $\\dfrac{' + ad3 + '}{' + ab3 + '} = \\dfrac{' + ae3 + '}{AC}$.', '$AC = \\dfrac{' + ab3 + ' \\cdot ' + ae3 + '}{' + ad3 + '} = ' + ac3.toTex() + '$.', '$EC = AC - AE = ' + ac3.toTex() + ' - ' + ae3 + ' = ' + ec3.toTex() + '$.', 'Check with parts: $DB = ' + (ab3 - ad3) + '$ and $\\dfrac{' + ad3 + '}{' + (ab3 - ad3) + '} = \\dfrac{' + ae3 + '}{' + ec3.toTex() + '}$.'], hint: 'Do not mix a part on one side with a whole on the other.' }; }
    var a2 = R.int(2, 9), b2 = R.int(2, 9), c2 = R.int(2, 12), d2 = ML.Q(b2 * c2, a2);
    return { q: 'Three parallel lines cut two transversals. On the first transversal they make segments of $' + a2 + '$ and $' + b2 + '$. On the second, the segment matching $' + a2 + '$ is $' + c2 + '$. Find the segment matching $' + b2 + '$.', a: num(d2.toPlain()),
      steps: ['Parallel lines divide transversals proportionally (draw a segment joining the transversals and use the Triangle Proportionality Theorem twice).', '$\\dfrac{' + a2 + '}{' + b2 + '} = \\dfrac{' + c2 + '}{x}$, so $x = \\dfrac{' + b2 + ' \\cdot ' + c2 + '}{' + a2 + '} = ' + d2.toTex() + '$.'], hint: 'The two transversals are cut in the same ratio.' };
  });

  G('geo.partition-segment', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['line', 'coord', 'frac'], ['coord', 'frac', 'line', 'coord'], ['coordfrac', 'findB', 'coord', 'frac']));
    var m = R.int(1, 4), n = R.int(1, 5); while (U.gcd(m, n) !== 1 || m === n) { m = R.int(1, 4); n = R.int(1, 5); }
    var s = m + n;
    if (kind === 'frac') return { q: 'Point $P$ is on $' + seg('AB') + '$ and divides it in the ratio $AP : PB = ' + m + ' : ' + n + '$. What fraction of the way from $A$ to $B$ is $P$?', a: { t: 'num', v: m + '/' + s, form: 'frac' },
      steps: ['The ratio $' + m + ' : ' + n + '$ splits the segment into $' + m + ' + ' + n + ' = ' + s + '$ equal parts.', '$P$ is $' + m + '$ of those parts from $A$: $\\dfrac{' + m + '}{' + s + '}$ of the way.', '(Not $\\dfrac{' + m + '}{' + n + '}$: that compares the two pieces with each other, not a piece with the whole.)'], hint: 'How many equal parts are there in all?' };
    if (kind === 'line') { var a = R.int(-12, 6), b = a + s * R.int(2, 5), p = a + m * (b - a) / s;
      return { q: 'On a number line, $A$ is at $' + a + '$ and $B$ is at $' + b + '$. Find the point $P$ between them with $AP : PB = ' + m + ' : ' + n + '$.', a: num(p),
        steps: ['$P$ is $\\dfrac{' + m + '}{' + s + '}$ of the way from $A$ to $B$.', 'The distance from $A$ to $B$ is $' + (b - a) + '$, and $\\dfrac{' + m + '}{' + s + '} \\cdot ' + (b - a) + ' = ' + m * (b - a) / s + '$.', '$P = ' + a + ' + ' + m * (b - a) / s + ' = ' + p + '$.'], hint: 'Find the fraction of the way, then multiply by the distance.' }; }
    var A = [R.int(-8, 4), R.int(-8, 4)], lv = ctx.level || 1, d = lv === 3 && kind === 'coordfrac' ? [R.nz(-9, 9), R.nz(-9, 9)] : [s * R.nz(-3, 3), s * R.nz(-3, 3)], B = [A[0] + d[0], A[1] + d[1]];
    var Px = ML.Q(A[0]).add(ML.Q(m * d[0], s)), Py = ML.Q(A[1]).add(ML.Q(m * d[1], s));
    if (kind === 'findB') { var Pp = [A[0] + m * (d[0] / s), A[1] + m * (d[1] / s)];
      return { q: '$P' + pt(Pp) + '$ divides $' + seg('AB') + '$ so that $AP : PB = ' + m + ' : ' + n + '$, and $A = ' + pt(A) + '$. Find $B$.', a: { t: 'tuple', v: B.map(String) },
        steps: ['$P$ is $\\dfrac{' + m + '}{' + s + '}$ of the way from $A$ to $B$, so the step from $A$ to $P$ is $\\dfrac{' + m + '}{' + s + '}$ of the step from $A$ to $B$.', 'From $A$ to $P$: $\\langle ' + (Pp[0] - A[0]) + ', ' + (Pp[1] - A[1]) + ' \\rangle$. Multiply by $\\dfrac{' + s + '}{' + m + '}$: $\\langle ' + d[0] + ', ' + d[1] + ' \\rangle$.', '$B = ' + pt(B) + '$.'], hint: 'Scale the step from A to P up to the whole segment.' }; }
    return { q: 'Find the point $P$ on $' + seg('AB') + '$ with $A' + pt(A) + '$ and $B' + pt(B) + '$ so that $AP : PB = ' + m + ' : ' + n + '$.', a: { t: 'tuple', v: [Px.toPlain(), Py.toPlain()] },
      steps: ['$P$ is $\\dfrac{' + m + '}{' + s + '}$ of the way from $A$ to $B$.', 'Change from $A$ to $B$: $\\langle ' + d[0] + ', ' + d[1] + ' \\rangle$. Take $\\dfrac{' + m + '}{' + s + '}$ of it: $\\left\\langle ' + ML.Q(m * d[0], s).toTex() + ', ' + ML.Q(m * d[1], s).toTex() + ' \\right\\rangle$.', '$P = ' + T.pt([Px.toPlain(), Py.toPlain()]) + '$.'], hint: 'Go ' + m + '/' + s + ' of the way, not ' + m + '/' + n + '.', chk: { A: A, B: B, m: m, n: n } };
  });

  G('geo.similar-right-triangles', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['alt', 'alt', 'prop'], ['leg', 'seg', 'alt', 'prop'], ['legseg', 'leg', 'seg']));
    var p, q;
    function srFig(labs) { var P0 = 3.2, Q0 = 5.8, h = M.sqrt(P0 * Q0), f = { pts: { A: [0, 0], B: [P0 + Q0, 0], D: [P0, 0], C: [P0, h] }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [['C', 'D', { dash: 1 }]], angs: [['A', 'C', 'B', { right: 1 }], ['B', 'D', 'C', { right: 1 }]], labpos: { D: 's', C: 'n' }, height: 200 };
      Object.keys(labs).forEach(function (k) { f.segs.push([k[0], k[1], { lab: labs[k], side: k === 'CD' ? 1 : undefined }]); }); return fig(f, 'Right triangle ABC with altitude CD to the hypotenuse'); }
    if (kind === 'alt') { if ((ctx.level || 1) === 1) { var g = R.int(2, 9), u = R.pick([[1, 4], [1, 9], [4, 9], [1, 16], [4, 25], [9, 16], [2, 8], [3, 12], [2, 18], [1, 25], [9, 25], [16, 25], [1, 36], [4, 9], [3, 27], [5, 20]]); p = u[0] * (u[0] < 4 ? g : 1); q = u[1] * (u[0] < 4 ? g : 1); if (!U.isSquare(p * q)) { p = u[0]; q = u[1]; } } else { p = R.int(2, 12); q = R.int(2, 12); }
      var h = sqrtN(p * q);
      return { q: 'In right $' + tri('ABC') + '$, $' + seg('CD') + '$ is the altitude to the hypotenuse $' + seg('AB') + '$. $AD = ' + p + '$ and $DB = ' + q + '$. Find $CD$. Give an exact answer.', a: rnum(h), viz: srFig({ AD: String(p), DB: String(q), CD: '?' }),
        steps: ['The altitude splits the triangle into two triangles similar to each other: $' + tri('ACD') + ' \\sim ' + tri('CBD') + '$.', 'So $\\dfrac{AD}{CD} = \\dfrac{CD}{DB}$, which means $CD^2 = AD \\cdot DB = ' + p + ' \\cdot ' + q + ' = ' + p * q + '$.', '$CD = \\sqrt{' + p * q + '}' + (h.r !== p * q ? ' = ' + rtex(h) : '') + '$. (The altitude is the geometric mean of the two pieces.)'], hint: 'CD² = AD · DB.' }; }
    p = R.int(2, 10); q = R.int(2, 12); var c = p + q;
    if (kind === 'leg') { var leg = sqrtN(p * c);
      return { q: 'In right $' + tri('ABC') + '$, $' + seg('CD') + '$ is the altitude to the hypotenuse $' + seg('AB') + '$. $AD = ' + p + '$ and $DB = ' + q + '$. Find $AC$. Give an exact answer.', a: rnum(leg), viz: srFig({ AD: String(p), DB: String(q) }),
        steps: ['$' + tri('ACD') + ' \\sim ' + tri('ABC') + '$ (they share $' + ang('A') + '$ and each has a right angle).', 'So $\\dfrac{AD}{AC} = \\dfrac{AC}{AB}$, which gives $AC^2 = AD \\cdot AB$.', '$AB = ' + p + ' + ' + q + ' = ' + c + '$, so $AC^2 = ' + p + ' \\cdot ' + c + ' = ' + p * c + '$.', '$AC = \\sqrt{' + p * c + '}' + (leg.r !== p * c ? ' = ' + rtex(leg) : '') + '$.'], hint: 'A leg² = (the piece next to it) · (the whole hypotenuse).' }; }
    if (kind === 'seg') { var cd = R.int(2, 12), fl = U.factors(cd * cd).filter(function (f2) { return f2 > 1 && f2 < cd * cd && f2 !== cd; }), ad = fl.length ? R.pick(fl) : 1, db = cd * cd / ad;
      return { q: 'In right $' + tri('ABC') + '$, altitude $' + seg('CD') + '$ meets the hypotenuse at $D$. $CD = ' + cd + '$ and $AD = ' + ad + '$. Find $DB$.', a: num(db), viz: srFig({ AD: String(ad), CD: String(cd), DB: '?' }),
        steps: ['$CD^2 = AD \\cdot DB$ (the altitude is the geometric mean of the two pieces).', '$' + cd * cd + ' = ' + ad + ' \\cdot DB$, so $DB = ' + db + '$.'], hint: 'Use CD² = AD · DB.' }; }
    if (kind === 'legseg') { var tr = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]), legAC = tr[R.int(0, 1)], adq = ML.Q(legAC * legAC, tr[2]);
      return { q: 'Right $' + tri('ABC') + '$ has legs $' + tr[0] + '$ and $' + tr[1] + '$ and hypotenuse $AB = ' + tr[2] + '$, with $AC = ' + legAC + '$. Altitude $' + seg('CD') + '$ meets $' + seg('AB') + '$ at $D$. Find $AD$.', a: num(adq.toPlain()),
        steps: ['$AC^2 = AD \\cdot AB$ (from $' + tri('ACD') + ' \\sim ' + tri('ABC') + '$).', '$' + legAC * legAC + ' = AD \\cdot ' + tr[2] + '$, so $AD = ' + adq.toTex() + '$.'], hint: 'AC² = AD · AB.' }; }
    var pr = R.pick([['$\\dfrac{AD}{CD} = \\dfrac{CD}{DB}$', ['$\\dfrac{AD}{CD} = \\dfrac{DB}{CD}$', '$\\dfrac{AD}{AC} = \\dfrac{DB}{AC}$', '$\\dfrac{CD}{AD} = \\dfrac{AB}{CD}$']], ['$\\dfrac{AB}{AC} = \\dfrac{AC}{AD}$', ['$\\dfrac{AB}{AC} = \\dfrac{AD}{AC}$', '$\\dfrac{AB}{AC} = \\dfrac{DB}{AD}$', '$\\dfrac{AC}{AD} = \\dfrac{DB}{AB}$']], ['$\\dfrac{AB}{BC} = \\dfrac{BC}{DB}$', ['$\\dfrac{AB}{BC} = \\dfrac{AD}{BC}$', '$\\dfrac{BC}{DB} = \\dfrac{AD}{AB}$', '$\\dfrac{AB}{DB} = \\dfrac{BC}{AD}$']]]);
    return { q: 'In right $' + tri('ABC') + '$ (right angle at $C$), $' + seg('CD') + '$ is the altitude to the hypotenuse. Which proportion is true?', a: mc(pr[0], pr[1]), viz: srFig({}),
      steps: ['The altitude makes three similar triangles: $' + tri('ACD') + ' \\sim ' + tri('CBD') + ' \\sim ' + tri('ABC') + '$.', 'Altitude rule: $CD^2 = AD \\cdot DB$. Leg rules: $AC^2 = AD \\cdot AB$ and $BC^2 = DB \\cdot AB$.', 'The true proportion is ' + pr[0] + ', which is one of these rules written as a proportion.'], hint: 'Each proportion should come from two of the similar triangles: check by cross-multiplying.' };
  });

  G('geo.pythagorean-proof', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['why', 'eq', 'sum'], ['num', 'eq', 'sum', 'why'], ['order', 'num', 'eq']));
    if (kind === 'why') return { q: 'In right $' + tri('ABC') + '$ with the right angle at $C$, altitude $' + seg('CD') + '$ is drawn to the hypotenuse. Why is $' + tri('ACD') + ' \\sim ' + tri('ABC') + '$?', a: mc('AA: they share $' + ang('A') + '$, and $' + ang('ADC') + '$ and $' + ang('ACB') + '$ are both right angles', ['SSS: their sides are equal', 'They are congruent by HL', 'SAS: $AC$ is in both triangles']),
      steps: ['$' + ang('A') + '$ belongs to both triangles.', '$' + ang('ADC') + '$ is a right angle (the altitude is perpendicular to $' + seg('AB') + '$), and $' + ang('ACB') + '$ is the right angle of the big triangle.', 'Two pairs of congruent angles: AA similarity.'], hint: 'Which angles do you know without measuring?' };
    if (kind === 'eq') { var b = R.coin(); return { q: 'In right $' + tri('ABC') + '$ (right angle at $C$), let $a = BC$, $b = AC$, $c = AB$, and let altitude $' + seg('CD') + '$ split $c$ into $AD = p$ and $DB = q$. Which equation follows from $' + tri(b ? 'ACD' : 'CBD') + ' \\sim ' + tri('ABC') + '$?', a: mc(b ? '$b^2 = cp$' : '$a^2 = cq$', b ? ['$b^2 = cq$', '$b = cp$', '$a^2 = cp$'] : ['$a^2 = cp$', '$a = cq$', '$b^2 = cq$']),
      steps: [b ? 'Matching sides: $\\dfrac{AD}{AC} = \\dfrac{AC}{AB}$, that is $\\dfrac{p}{b} = \\dfrac{b}{c}$.' : 'Matching sides: $\\dfrac{DB}{BC} = \\dfrac{BC}{AB}$, that is $\\dfrac{q}{a} = \\dfrac{a}{c}$.', 'Cross-multiply: ' + (b ? '$b^2 = cp$.' : '$a^2 = cq$.')], hint: 'Match the short leg with the short leg and the hypotenuse with the hypotenuse.' }; }
    if (kind === 'sum') { var tr = R.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29], [4, 3, 5], [12, 5, 13]]), c = tr[2], pp = ML.Q(tr[1] * tr[1], c), qq = ML.Q(tr[0] * tr[0], c);
      return { q: 'In the similarity proof of the Pythagorean theorem we get $a^2 = cq$ and $b^2 = cp$, where $p + q = c$. If $c = ' + c + '$, $p = ' + pp.toTex() + '$ and $q = ' + qq.toTex() + '$, find $a^2 + b^2$.', a: num(c * c),
        steps: ['Add the two equations: $a^2 + b^2 = cq + cp = c(p + q)$.', '$p + q = ' + pp.toTex() + ' + ' + qq.toTex() + ' = ' + c + '$, which is $c$.', 'So $a^2 + b^2 = c \\cdot c = ' + c * c + '$: the Pythagorean theorem.'], hint: 'Add the equations and factor out c.' }; }
    if (kind === 'num') { var p = R.int(2, 10), q = R.int(2, 12), c2 = p + q, b2 = sqrtN(c2 * p);
      return { q: 'In right $' + tri('ABC') + '$ (right angle at $C$), the altitude from $C$ splits the hypotenuse into $AD = ' + p + '$ and $DB = ' + q + '$. Find $AC$. Give an exact answer.', a: rnum(b2),
        steps: ['From $' + tri('ACD') + ' \\sim ' + tri('ABC') + '$: $AC^2 = AD \\cdot AB$.', '$AB = ' + p + ' + ' + q + ' = ' + c2 + '$, so $AC^2 = ' + p + ' \\cdot ' + c2 + ' = ' + p * c2 + '$.', '$AC = \\sqrt{' + p * c2 + '}' + (b2.r !== p * c2 ? ' = ' + rtex(b2) : '') + '$.', 'Check: $BC^2 = ' + q + ' \\cdot ' + c2 + ' = ' + q * c2 + '$, and $' + p * c2 + ' + ' + q * c2 + ' = ' + c2 * c2 + ' = ' + c2 + '^2$.'], hint: 'AC² = (the piece next to A) · (the whole hypotenuse).' }; }
    var steps = ['Draw the altitude $' + seg('CD') + '$ to the hypotenuse.', 'Show $' + tri('ACD') + ' \\sim ' + tri('ABC') + '$ and $' + tri('CBD') + ' \\sim ' + tri('ABC') + '$ by AA.', 'Write the proportions and cross-multiply: $b^2 = cp$ and $a^2 = cq$.', 'Add: $a^2 + b^2 = c(p + q) = c \\cdot c = c^2$.'];
    var lab = ['P', 'Q', 'R', 'S'], perm = R.shuffle([0, 1, 2, 3]); while (perm.every(function (v, i) { return v === i; })) perm = R.shuffle([0, 1, 2, 3]);
    var order = [0, 1, 2, 3].map(function (r) { return lab[perm.indexOf(r)]; }).join(', '), wr = []; for (var t = 0; t < 40 && wr.length < 3; t++) { var w = R.shuffle(lab).join(', '); if (w !== order && wr.indexOf(w) < 0) wr.push(w); }
    return { q: 'Put the steps of the similarity proof of $a^2 + b^2 = c^2$ in order:<br>' + [0, 1, 2, 3].map(function (i) { return '(' + lab[i] + ') ' + steps[perm[i]]; }).join('<br>'), a: mc(order, wr), steps: ['The right order is ' + order + ':'].concat(steps.map(function (s, i) { return (i + 1) + '. ' + s; })), hint: 'You need the altitude before you can talk about the small triangles.' };
  });

  /* ================================================================ Unit: Right Triangles and Trigonometry */

  /* a right triangle figure: right angle at C, angle A at the left; labs: {AB, BC, CA, A, B} */
  function rtFig(angA, labs, o) {
    o = o || {}; var t = angA * M.PI / 180, H = 6, A = [0, 0], C = [H * M.cos(t), 0], B = [H * M.cos(t), H * M.sin(t)];
    if (o.flip) { A = [C[0], 0]; C = [0, 0]; B = [0, H * M.sin(t)]; }
    var f = { pts: { A: A, B: B, C: C }, polys: [['A', 'B', 'C', { fill: 'blue' }]], segs: [], angs: [['A', 'C', 'B', { right: 1 }]], height: o.height || 220 };
    labs = labs || {};
    ['AB', 'BC', 'CA'].forEach(function (k) { if (labs[k] !== undefined) f.segs.push([k[0], k[1], { lab: labs[k], color: o.hl === k ? 'red' : undefined }]); });
    if (labs.A) f.angs.push(['C', 'A', 'B', { lab: labs.A, r: 28 }]);
    if (labs.B) f.angs.push(['A', 'B', 'C', { lab: labs.B, r: 24, color: 'blue' }]);
    return f;
  }
  var SIN = { 30: [1, 2, 1], 45: [1, 2, 2], 60: [1, 2, 3], 90: [1, 1, 1], 120: [1, 2, 3], 135: [1, 2, 2], 150: [1, 2, 1] }; // sin = (n/d)√r
  var COS = { 30: [1, 2, 3], 45: [1, 2, 2], 60: [1, 2, 1] };
  function sinTex(d) { var s = SIN[d]; return rtex(rad(s[0], s[1], s[2])); }

  G('geo.special-right-triangles', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['45leg', '30short', 'which'], ['45hyp', '30hyp', '30short', 'which'], ['30long', '45hyp', 'apply', '30long']));
    var s = R.int(2, 25);
    if (kind === '45leg') return { q: 'A $45$-$45$-$90$ triangle has legs of length $' + s + '$. Find the hypotenuse. Give an exact answer.', a: rnum(rad(s, 1, 2)), viz: fig(rtFig(45, { BC: String(s), CA: String(s), AB: '?', A: '45°' }), 'An isosceles right triangle'),
      steps: ['A $45$-$45$-$90$ triangle is half of a square, so its legs are equal.', 'Pythagorean theorem: $c = \\sqrt{' + s + '^2 + ' + s + '^2} = \\sqrt{2 \\cdot ' + s * s + '} = ' + rtex(rad(s, 1, 2)) + '$.', 'Shortcut: hypotenuse $=$ leg $\\cdot \\sqrt{2}$.'], hint: 'Hypotenuse = leg · √2.' };
    if (kind === '45hyp') { var useR = R.coin(), H = useR ? null : R.int(3, 25), k = R.int(2, 20), leg = useR ? rad(k) : rad(H, 2, 2);
      return { q: 'A $45$-$45$-$90$ triangle has hypotenuse $' + (useR ? rtex(rad(k, 1, 2)) : H) + '$. Find the length of a leg. Give an exact answer.', a: rnum(leg), viz: fig(rtFig(45, { AB: useR ? k + '√2' : String(H), BC: '?', A: '45°' }), 'An isosceles right triangle'),
        steps: ['Hypotenuse $=$ leg $\\cdot \\sqrt{2}$, so leg $=$ hypotenuse $\\div \\sqrt{2}$.', useR ? 'leg $= \\dfrac{' + rtex(rad(k, 1, 2)) + '}{\\sqrt{2}} = ' + k + '$.' : 'leg $= \\dfrac{' + H + '}{\\sqrt{2}} = \\dfrac{' + H + '\\sqrt{2}}{2}' + (H % 2 === 0 ? ' = ' + rtex(leg) : '') + '$ (multiply top and bottom by $\\sqrt{2}$).'], hint: 'Divide the hypotenuse by √2.' }; }
    if (kind === '30short') { var askH = R.coin();
      return { q: 'In a $30$-$60$-$90$ triangle, the shorter leg (opposite $30^\\circ$) is $' + s + '$. Find the ' + (askH ? 'hypotenuse' : 'longer leg') + '.' + (askH ? '' : ' Give an exact answer.'), a: askH ? num(2 * s) : rnum(rad(s, 1, 3)), viz: fig(rtFig(30, { BC: String(s), AB: askH ? '?' : '', CA: askH ? '' : '?', A: '30°', B: '60°' }), 'A 30-60-90 triangle'),
        steps: ['A $30$-$60$-$90$ triangle is half of an equilateral triangle, so the hypotenuse is twice the shorter leg: $2 \\cdot ' + s + ' = ' + 2 * s + '$.', 'Longer leg: $\\sqrt{' + 2 * s + '^2 - ' + s + '^2} = \\sqrt{' + 3 * s * s + '} = ' + rtex(rad(s, 1, 3)) + '$.', 'Ratio check: $1 : \\sqrt{3} : 2$.'], hint: 'Short : long : hypotenuse = 1 : √3 : 2.' }; }
    if (kind === '30hyp') { var Hh = 2 * s, askS = R.coin();
      return { q: 'In a $30$-$60$-$90$ triangle, the hypotenuse is $' + Hh + '$. Find the ' + (askS ? 'shorter leg' : 'longer leg') + '.' + (askS ? '' : ' Give an exact answer.'), a: askS ? num(s) : rnum(rad(s, 1, 3)), viz: fig(rtFig(30, { AB: String(Hh), A: '30°', B: '60°', BC: askS ? '?' : '', CA: askS ? '' : '?' }), 'A 30-60-90 triangle'),
        steps: ['The shorter leg is half the hypotenuse: $' + Hh + ' \\div 2 = ' + s + '$.', 'The longer leg is the shorter leg times $\\sqrt{3}$: $' + rtex(rad(s, 1, 3)) + '$.'], hint: 'Start with the shorter leg: it is half the hypotenuse.' }; }
    if (kind === '30long') { var useR2 = R.coin(), m = R.int(2, 20), Lg = useR2 ? rad(m, 1, 3) : rad(R.int(3, 24)), short = useR2 ? rad(m) : rad(Lg.n, 3, 3), askH2 = R.coin(), ans = askH2 ? rad(short.n * 2, short.d, short.r) : short;
      return { q: 'In a $30$-$60$-$90$ triangle, the longer leg is $' + rtex(Lg) + '$. Find the ' + (askH2 ? 'hypotenuse' : 'shorter leg') + '. Give an exact answer.', a: rnum(ans),
        steps: ['Longer leg $=$ shorter leg $\\cdot \\sqrt{3}$, so shorter leg $= \\dfrac{' + rtex(Lg) + '}{\\sqrt{3}}' + (useR2 ? '' : ' = \\dfrac{' + Lg.n + '\\sqrt{3}}{3}') + ' = ' + rtex(short) + '$.'].concat(askH2 ? ['Hypotenuse $= 2 \\cdot$ shorter leg $= ' + rtex(ans) + '$.'] : []), hint: 'Divide the longer leg by √3 to get the shorter leg.' }; }
    if (kind === 'which') return { q: 'In a $30$-$60$-$90$ triangle with shorter leg $s$, which side has length $s\\sqrt{3}$?', a: mc('The leg opposite the $60^\\circ$ angle', ['The hypotenuse', 'The leg opposite the $30^\\circ$ angle', 'The leg next to the $60^\\circ$ angle']), viz: fig(rtFig(30, { A: '30°', B: '60°', BC: 's', AB: '2s', CA: 's√3' }), 'A 30-60-90 triangle with sides s, s√3 and 2s'),
      steps: ['The longest side is the hypotenuse, $2s$ (opposite $90^\\circ$).', 'The shortest side is $s$, opposite the smallest angle ($30^\\circ$).', 'The middle length, $s\\sqrt{3} \\approx 1.73s$, is opposite the middle angle, $60^\\circ$.'], hint: 'Bigger angles face longer sides.' };
    var t = R.coin();
    return t ? { q: 'A square has sides of length $' + s + '$. Find the length of its diagonal. Give an exact answer.', a: rnum(rad(s, 1, 2)), steps: ['A diagonal cuts the square into two $45$-$45$-$90$ triangles with legs $' + s + '$.', 'Diagonal $= ' + s + '\\sqrt{2}$.'], hint: 'The diagonal is the hypotenuse of a 45-45-90 triangle.' }
      : { q: 'An equilateral triangle has sides of length $' + 2 * s + '$. Find its height. Give an exact answer.', a: rnum(rad(s, 1, 3)), steps: ['The height splits it into two $30$-$60$-$90$ triangles with hypotenuse $' + 2 * s + '$ and shorter leg $' + s + '$.', 'The height is the longer leg: $' + rtex(rad(s, 1, 3)) + '$.'], hint: 'The height cuts the base in half.' };
  });

  var TRIPS = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [9, 40, 41]];
  G('geo.trig-ratios', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['ratio', 'name', 'ratio'], ['ratioB', 'nontriple', 'name', 'ratio'], ['given', 'nontriple', 'ratioB', 'sim']));
    var tr = R.pick(TRIPS), sw = R.coin(), a = sw ? tr[1] : tr[0], b = sw ? tr[0] : tr[1], c = tr[2]; // a = BC (opposite A), b = CA (adjacent to A)
    var angA = M.atan2(a, b) * 180 / M.PI;
    if (kind === 'ratio' || kind === 'ratioB') {
      var at = kind === 'ratioB' ? 'B' : 'A', fn = R.pick(['sin', 'cos', 'tan']), opp = at === 'A' ? a : b, adj = at === 'A' ? b : a, nn = fn === 'sin' ? opp : fn === 'cos' ? adj : opp, dd = fn === 'tan' ? adj : fn === 'sin' ? c : c;
      var oppN = at === 'A' ? 'BC' : 'CA', adjN = at === 'A' ? 'CA' : 'BC';
      return { q: 'In right $' + tri('ABC') + '$, the right angle is at $C$, $BC = ' + a + '$, $CA = ' + b + '$ and $AB = ' + c + '$. Find $\\' + fn + ' ' + at + '$.', a: num(qplain(nn, dd)), viz: fig(rtFig(angA, { BC: String(a), CA: String(b), AB: String(c) }), 'Right triangle ABC with the right angle at C'),
        steps: ['From angle $' + at + '$: the opposite side is $' + oppN + ' = ' + opp + '$, the adjacent leg is $' + adjN + ' = ' + adj + '$, and the hypotenuse is $AB = ' + c + '$.', '$\\' + fn + ' ' + at + ' = \\dfrac{\\text{' + (fn === 'cos' ? 'adjacent' : 'opposite') + '}}{\\text{' + (fn === 'tan' ? 'adjacent' : 'hypotenuse') + '}} = \\dfrac{' + nn + '}{' + dd + '}' + (U.gcd(nn, dd) > 1 ? ' = ' + T.frac(nn, dd) : '') + '$.'], hint: 'SOH-CAH-TOA, and name the sides from angle ' + at + '.' };
    }
    if (kind === 'name') { var at2 = R.pick(['A', 'B']), w = R.pick(['opposite', 'adjacent to']), right = (at2 === 'A') === (w === 'opposite') ? 'BC' : 'CA';
      return { q: 'In right $' + tri('ABC') + '$ with the right angle at $C$, which side is ' + w + ' $' + ang(at2) + '$ (not counting the hypotenuse)?', a: mc('$' + seg(right) + '$', ['$' + seg(right === 'BC' ? 'CA' : 'BC') + '$', '$' + seg('AB') + '$']), viz: fig(rtFig(angA, {}, { flip: R.coin() }), 'Right triangle ABC with the right angle at C'),
        steps: ['The hypotenuse $' + seg('AB') + '$ is across from the right angle.', 'The side opposite an angle does not touch it; the adjacent leg is the leg that forms the angle.', 'For $' + ang(at2) + '$: opposite is $' + seg(at2 === 'A' ? 'BC' : 'CA') + '$, adjacent is $' + seg(at2 === 'A' ? 'CA' : 'BC') + '$.'], hint: 'Stand at the angle. The opposite side is the one across from you.' }; }
    if (kind === 'nontriple') { var p = R.int(1, 7), q = R.int(2, 9); while (U.isSquare(p * p + q * q) || p === q) { p = R.int(1, 7); q = R.int(2, 9); } var N = p * p + q * q, fn2 = R.pick(['sin', 'cos']), top = fn2 === 'sin' ? p : q, val = rad(top, N, N);
      return { q: 'Right $' + tri('ABC') + '$ has its right angle at $C$, $BC = ' + p + '$ and $CA = ' + q + '$. Find $\\' + fn2 + ' A$ exactly.', a: { t: 'num', v: rplain(val) }, viz: fig(rtFig(M.atan2(p, q) * 180 / M.PI, { BC: String(p), CA: String(q), AB: '?' }), 'Right triangle ABC'),
        steps: ['Hypotenuse: $AB = \\sqrt{' + p + '^2 + ' + q + '^2} = \\sqrt{' + N + '}$.', '$\\' + fn2 + ' A = \\dfrac{' + (fn2 === 'sin' ? 'BC' : 'CA') + '}{AB} = \\dfrac{' + top + '}{\\sqrt{' + N + '}}$.', 'Rationalized: $' + rtex(val) + '$. (Either form is correct.)'], hint: 'Find the hypotenuse with the Pythagorean theorem first.' }; }
    if (kind === 'given') { var fn3 = R.pick(['sin', 'cos']), top2 = fn3 === 'sin' ? a : b, other = fn3 === 'sin' ? b : a;
      return { q: '$A$ is an acute angle in a right triangle and $\\' + fn3 + ' A = ' + T.frac(top2, c) + '$. Find $\\' + (fn3 === 'sin' ? 'cos' : 'sin') + ' A$ and $\\tan A$.', a: { t: 'multi', parts: [{ label: '$\\' + (fn3 === 'sin' ? 'cos' : 'sin') + ' A =$', a: num(qplain(other, c)) }, { label: '$\\tan A =$', a: num(qplain(a, b)) }] },
        steps: ['Draw a right triangle with ' + (fn3 === 'sin' ? 'opposite side $' + top2 + '$' : 'adjacent leg $' + top2 + '$') + ' and hypotenuse $' + c + '$ (or any multiple: the ratios are the same).', 'The other leg: $\\sqrt{' + c + '^2 - ' + top2 + '^2} = \\sqrt{' + (c * c - top2 * top2) + '} = ' + other + '$.', '$\\' + (fn3 === 'sin' ? 'cos' : 'sin') + ' A = ' + T.frac(other, c) + '$ and $\\tan A = \\dfrac{\\text{opposite}}{\\text{adjacent}} = ' + T.frac(a, b) + '$.'], hint: 'Build a triangle with those two sides and find the third.' }; }
    return { q: '$' + tri('ABC') + ' \\sim ' + tri('DEF') + '$, both with right angles at $C$ and $F$, and $' + tri('DEF') + '$ is ' + R.pick(['twice', 'three times', 'half']) + ' as big. Which must be true?', a: mc('$\\sin A = \\sin D$', ['$\\sin D = 2 \\sin A$', '$\\sin A = \\cos D$', '$\\tan D = \\tan A + 1$']),
      steps: ['Similar triangles have equal corresponding angles, so $' + ang('A') + ' \\cong ' + ang('D') + '$.', 'Their sides are proportional, so every ratio of two sides is the same in both triangles: $\\dfrac{BC}{AB} = \\dfrac{EF}{DE}$.', 'That is why a trig ratio depends only on the angle, not the size: $\\sin A = \\sin D$.'], hint: 'Scaling multiplies both sides of a ratio by the same number.' };
  });

  G('geo.complementary-sine-cosine', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['value', 'which', 'value'], ['solve', 'tri', 'which'], ['solve', 'tan', 'tf']));
    var x = R.int(10, 80); while (x === 45) x = R.int(10, 80);
    if (kind === 'value') { var useSin = R.coin(), v = (useSin ? sinD(x) : cosD(x)).toFixed(4);
      return { q: 'Given $\\' + (useSin ? 'sin' : 'cos') + ' ' + deg(x) + ' \\approx ' + v + '$, find $\\' + (useSin ? 'cos' : 'sin') + ' ' + deg(90 - x) + '$ without a calculator.', a: num(v),
        steps: ['$' + x + '^\\circ$ and $' + (90 - x) + '^\\circ$ add to $90^\\circ$: they are complementary, like the two acute angles of a right triangle.', 'The side opposite one acute angle is adjacent to the other, so $\\sin A = \\cos(90^\\circ - A)$.', 'So $\\' + (useSin ? 'cos' : 'sin') + ' ' + deg(90 - x) + ' = \\' + (useSin ? 'sin' : 'cos') + ' ' + deg(x) + ' \\approx ' + v + '$.'], hint: 'What do ' + x + '° and ' + (90 - x) + '° add to?' }; }
    if (kind === 'which') return { q: 'Which is equal to $\\sin ' + deg(x) + '$?', a: mc('$\\cos ' + deg(90 - x) + '$', ['$\\cos ' + deg(x) + '$', '$\\sin ' + deg(90 - x) + '$', '$\\tan ' + deg(90 - x) + '$']), steps: ['$\\sin A = \\cos(90^\\circ - A)$: the sine of an angle is the cosine of its complement.', '$90 - ' + x + ' = ' + (90 - x) + '$, so $\\sin ' + deg(x) + ' = \\cos ' + deg(90 - x) + '$.'], hint: 'Co-sine means the sine of the complement.' };
    if (kind === 'solve') { var xv, a, b, c, d; do { xv = R.int(3, 20); a = R.int(1, 4); c = R.int(1, 4); b = R.int(-10, 30); d = 90 - (a + c) * xv - b; } while (M.abs(d) > 40 || a * xv + b <= 0 || c * xv + d <= 0 || d === 0 || b === 0);
      return { q: 'Solve for $x$: $\\sin(' + lin(a, b) + ')^\\circ = \\cos(' + lin(c, d) + ')^\\circ$, where both angles are acute.', a: num(xv),
        steps: ['$\\sin A = \\cos B$ for acute angles when $A + B = 90^\\circ$.', '$(' + lin(a, b) + ') + (' + lin(c, d) + ') = 90$, so $' + lin(a + c, b + d) + ' = 90$.', '$' + T.mono(a + c, 'x') + ' = ' + (90 - b - d) + '$, so $x = ' + xv + '$.', 'Check: the angles are $' + deg(a * xv + b) + '$ and $' + deg(c * xv + d) + '$, which add to $90^\\circ$.'], hint: 'The two angles must be complementary.' }; }
    var tr = R.pick(TRIPS);
    if (kind === 'tri') { var fn = R.pick(['sin', 'cos']); return { q: 'In right $' + tri('ABC') + '$ with the right angle at $C$, $\\' + fn + ' A = ' + T.frac(tr[0], tr[2]) + '$. Find $\\' + (fn === 'sin' ? 'cos' : 'sin') + ' B$.', a: num(qplain(tr[0], tr[2])),
      steps: ['$' + ang('A') + '$ and $' + ang('B') + '$ are the two acute angles, so they are complementary.', 'The side opposite $A$ is adjacent to $B$, so $\\' + fn + ' A = \\' + (fn === 'sin' ? 'cos' : 'sin') + ' B = ' + T.frac(tr[0], tr[2]) + '$.'], hint: 'The opposite side of one acute angle is the adjacent side of the other.' }; }
    if (kind === 'tan') return { q: 'In right $' + tri('ABC') + '$ with the right angle at $C$, $\\tan A = ' + T.frac(tr[0], tr[1]) + '$. Find $\\tan B$.', a: num(qplain(tr[1], tr[0])),
      steps: ['$\\tan A = \\dfrac{BC}{CA}$ and $\\tan B = \\dfrac{CA}{BC}$: the same two legs, flipped.', 'So $\\tan B = ' + T.frac(tr[1], tr[0]) + '$, the reciprocal of $\\tan A$.'], hint: 'Opposite and adjacent trade places.' };
    var f = R.pick([['$\\sin ' + deg(x) + ' = \\cos ' + deg(90 - x) + '$', true], ['$\\sin ' + deg(x) + ' = \\cos ' + deg(x) + '$', false], ['$\\cos ' + deg(x) + ' = \\sin ' + deg(90 - x) + '$', true], ['$\\sin ' + deg(x) + ' = \\sin ' + deg(90 - x) + '$', false]]);
    return { q: 'True or false: ' + f[0] + '.', a: tf(f[1]), steps: ['The sine of an angle equals the cosine of its complement: $\\sin A = \\cos(90^\\circ - A)$.', f[1] ? 'The two angles here are complementary, so it is true.' : 'This is not that pattern (and $' + x + '^\\circ \\ne 45^\\circ$), so it is false.'], hint: 'Do the angles add to 90°?' };
  });

  G('geo.solve-right-triangles', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['exact', 'calc', 'exact'], ['calc', 'calc', 'exact'], ['calc', 'both', 'calc']));
    if (kind === 'exact') { var th = R.pick([30, 45, 60]), H = 2 * R.int(2, 9), want = R.pick(['opp', 'adj']), sv = want === 'opp' ? SIN[th] : COS[th], ans = rad(H * sv[0], sv[1], sv[2]);
      return { q: 'A right triangle has a hypotenuse of $' + H + '$ and an acute angle of $' + deg(th) + '$. Find the leg ' + (want === 'opp' ? 'opposite' : 'adjacent to') + ' that angle. Give an exact answer.', a: rnum(ans), viz: fig(rtFig(th, { AB: String(H), A: th + '°', BC: want === 'opp' ? 'x' : '', CA: want === 'adj' ? 'x' : '' }), 'A right triangle with a labeled angle and hypotenuse'),
        steps: ['$\\' + (want === 'opp' ? 'sin' : 'cos') + ' ' + deg(th) + ' = \\dfrac{x}{' + H + '}$, so $x = ' + H + ' \\' + (want === 'opp' ? 'sin' : 'cos') + ' ' + deg(th) + '$.', '$\\' + (want === 'opp' ? 'sin' : 'cos') + ' ' + deg(th) + ' = ' + rtex(rad(sv[0], sv[1], sv[2])) + '$ (from the special right triangles).', '$x = ' + H + ' \\cdot ' + rtex(rad(sv[0], sv[1], sv[2])) + ' = ' + rtex(ans) + '$.'], hint: 'Pick the ratio that uses the hypotenuse and the side you want.' }; }
    var th2 = R.int(18, 72); while ([30, 45, 60].indexOf(th2) >= 0) th2 = R.int(18, 72);
    var cfg = R.pick(byL(ctx, [['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp']], [['hyp', 'opp'], ['adj', 'opp'], ['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']], [['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj'], ['hyp', 'adj']])), g = cfg[0], w = cfg[1], gv = R.int(5, 40);
    var hyp, opp, adj; if (g === 'hyp') { hyp = gv; opp = gv * sinD(th2); adj = gv * cosD(th2); } else if (g === 'opp') { opp = gv; hyp = gv / sinD(th2); adj = gv / tanD(th2); } else { adj = gv; hyp = gv / cosD(th2); opp = gv * tanD(th2); }
    var val = w === 'hyp' ? hyp : w === 'opp' ? opp : adj, fn = (g === 'hyp' || w === 'hyp') ? ((g === 'opp' || w === 'opp') ? 'sin' : 'cos') : 'tan';
    var ratioTex = fn === 'sin' ? (w === 'hyp' ? '\\dfrac{' + gv + '}{x}' : '\\dfrac{x}{' + gv + '}') : fn === 'cos' ? (w === 'hyp' ? '\\dfrac{' + gv + '}{x}' : '\\dfrac{x}{' + gv + '}') : (w === 'adj' ? '\\dfrac{' + gv + '}{x}' : '\\dfrac{x}{' + gv + '}');
    var solveTex = (w === 'hyp' || (fn === 'tan' && w === 'adj')) ? 'x = \\dfrac{' + gv + '}{\\' + fn + ' ' + deg(th2) + '}' : 'x = ' + gv + ' \\' + fn + ' ' + deg(th2);
    var labs = { A: th2 + '°' }, nm = { hyp: 'AB', opp: 'BC', adj: 'CA' }; labs[nm[g]] = String(gv); labs[nm[w]] = 'x';
    var WN = { hyp: 'the hypotenuse', opp: 'the leg opposite the angle', adj: 'the leg adjacent to the angle' };
    if (kind === 'both') { var o2 = gv * sinD(th2), a2 = gv * cosD(th2);
      return { q: 'A right triangle has a hypotenuse of $' + gv + '$ and an acute angle of $' + deg(th2) + '$. Find both legs to the nearest tenth.', a: { t: 'multi', parts: [{ label: 'Leg opposite the angle:', a: tol(o2) }, { label: 'Leg adjacent to the angle:', a: tol(a2) }] }, viz: fig(rtFig(th2, { A: th2 + '°', AB: String(gv), BC: 'x', CA: 'y' }), 'A right triangle with its hypotenuse and an angle labeled'),
        steps: ['Opposite: $x = ' + gv + ' \\sin ' + deg(th2) + ' \\approx ' + dec(o2, 1) + '$.', 'Adjacent: $y = ' + gv + ' \\cos ' + deg(th2) + ' \\approx ' + dec(a2, 1) + '$.', 'Check: $' + dec(o2, 2) + '^2 + ' + dec(a2, 2) + '^2 \\approx ' + gv * gv + ' = ' + gv + '^2$. (Calculator in degree mode.)'], hint: 'Opposite uses sine; adjacent uses cosine.' }; }
    return { q: 'In a right triangle, an acute angle measures $' + deg(th2) + '$ and ' + WN[g] + ' is $' + gv + '$. Find ' + WN[w] + ', $x$, to the nearest tenth.', a: tol(val), viz: fig(rtFig(th2, labs), 'A right triangle with an angle, one side and the unknown side x labeled'),
      steps: ['Name the sides from the $' + deg(th2) + '$ angle: we know ' + WN[g].replace('the ', 'the ') + ' and want ' + WN[w] + '. The ratio that uses both is $\\' + fn + '$.', '$\\' + fn + ' ' + deg(th2) + ' = ' + ratioTex + '$.', '$' + solveTex + ' \\approx ' + dec(val, 1) + '$ (calculator in degree mode).'].concat(w === 'hyp' ? ['Check: the hypotenuse must be the longest side, and $' + dec(val, 1) + ' > ' + gv + '$.'] : []), hint: 'SOH-CAH-TOA: choose the ratio with the side you know and the side you want.' };
  });

  G('geo.inverse-trig-angles', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['exact', 'calc', 'mean'], ['calc', 'calc', 'mean', 'exact'], ['calc', 'both', 'calc']));
    if (kind === 'exact') { var e = R.pick([['\\sin', '\\frac{1}{2}', 30], ['\\cos', '\\frac{1}{2}', 60], ['\\tan', '1', 45], ['\\sin', '\\frac{\\sqrt{3}}{2}', 60], ['\\cos', '\\frac{\\sqrt{3}}{2}', 30], ['\\sin', '\\frac{\\sqrt{2}}{2}', 45], ['\\tan', '\\sqrt{3}', 60], ['\\tan', '\\frac{\\sqrt{3}}{3}', 30]]);
      return { q: '$A$ is an acute angle and $' + e[0] + ' A = ' + e[1] + '$. Find $' + mang('A') + '$ without a calculator.', a: num(e[2]), steps: ['Use the special right triangles: $30$-$60$-$90$ with sides $1 : \\sqrt{3} : 2$ and $45$-$45$-$90$ with sides $1 : 1 : \\sqrt{2}$.', 'The ratio $' + e[0] + ' = ' + e[1] + '$ happens at $' + deg(e[2]) + '$, so $' + mang('A') + ' = ' + e[0].replace('\\', '\\') + '^{-1}\\left(' + e[1] + '\\right) = ' + deg(e[2]) + '$.'], hint: 'Picture the 30-60-90 and 45-45-90 triangles.' }; }
    if (kind === 'mean') return { q: 'What does $\\sin^{-1}(0.6)$ mean?', a: mc('The acute angle whose sine is $0.6$', ['$\\dfrac{1}{\\sin 0.6}$', 'The sine of $0.6$ degrees', '$-\\sin 0.6$']), steps: ['$\\sin^{-1}$ is the inverse of $\\sin$: it goes from a ratio back to an angle.', '$\\sin^{-1}(0.6)$ is the angle $A$ with $\\sin A = 0.6$, about $36.9^\\circ$.', 'The $-1$ is not an exponent here: $\\dfrac{1}{\\sin x}$ has its own name, the cosecant.'], hint: 'Inverse means "undo".' };
    var leg1 = R.int(2, 15), leg2 = R.int(2, 15); while (leg1 === leg2) leg2 = R.int(2, 15);
    var t = R.pick(['tan', 'sin', 'cos']), hyp = R.int(M.max(leg1, leg2) + 1, M.max(leg1, leg2) + 10), A, top, bot, name;
    if (t === 'tan') { A = aD(M.atan(leg1 / leg2)); top = leg1; bot = leg2; name = 'the opposite leg is $' + leg1 + '$ and the adjacent leg is $' + leg2 + '$'; }
    else if (t === 'sin') { A = aD(M.asin(leg1 / hyp)); top = leg1; bot = hyp; name = 'the opposite leg is $' + leg1 + '$ and the hypotenuse is $' + hyp + '$'; }
    else { A = aD(M.acos(leg2 / hyp)); top = leg2; bot = hyp; name = 'the adjacent leg is $' + leg2 + '$ and the hypotenuse is $' + hyp + '$'; }
    if (kind === 'both') { var A2 = aD(M.atan(leg1 / leg2));
      return { q: 'A right triangle has legs $' + leg1 + '$ and $' + leg2 + '$. Find both acute angles to the nearest degree. (Angle $A$ is opposite the leg of length $' + leg1 + '$.)', a: { t: 'multi', parts: [{ label: '$' + mang('A') + ' \\approx$', a: tol(A2, 0.5) }, { label: '$' + mang('B') + ' \\approx$', a: tol(90 - A2, 0.5) }] },
        steps: ['$\\tan A = \\dfrac{' + leg1 + '}{' + leg2 + '}$, so $' + mang('A') + ' = \\tan^{-1}\\left(\\dfrac{' + leg1 + '}{' + leg2 + '}\\right) \\approx ' + dec(A2, 1) + '^\\circ \\approx ' + deg(M.round(A2)) + '$.', 'The acute angles add to $90^\\circ$: $' + mang('B') + ' \\approx 90 - ' + dec(A2, 1) + ' = ' + dec(90 - A2, 1) + '^\\circ \\approx ' + deg(M.round(90 - A2)) + '$.'], hint: 'Find one angle with tan⁻¹, then subtract from 90°.' }; }
    var labs = { A: '?' }; if (t === 'tan') { labs.BC = String(leg1); labs.CA = String(leg2); } else if (t === 'sin') { labs.BC = String(leg1); labs.AB = String(hyp); } else { labs.CA = String(leg2); labs.AB = String(hyp); }
    return { q: 'In a right triangle, ' + name + ' (measured from angle $A$). Find $' + mang('A') + '$ to the nearest degree.', a: tol(A, 0.5), viz: fig(rtFig(A, labs), 'A right triangle with two sides labeled and angle A unknown'),
      steps: ['The sides we know give $\\' + t + ' A = \\dfrac{' + top + '}{' + bot + '}$.', 'Undo the ratio with the inverse: $' + mang('A') + ' = \\' + t + '^{-1}\\left(\\dfrac{' + top + '}{' + bot + '}\\right) \\approx ' + dec(A, 2) + '^\\circ$.', 'To the nearest degree: $' + deg(M.round(A)) + '$. (Calculator in degree mode.)'], hint: 'Which ratio uses the two sides you know? Then apply its inverse.' };
  });

  G('geo.elevation-depression', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['height', 'idea', 'height'], ['angle', 'depr', 'height', 'idea'], ['eye', 'depr', 'ramp', 'angle']));
    var th = R.int(15, 65), d = R.int(20, 150);
    if (kind === 'idea') { var q = R.pick([['From the top of a lighthouse, a keeper looks down at a boat. The angle of depression is measured between the line of sight and which line?', 'A horizontal line through the keeper\'s eye', ['The vertical side of the lighthouse', 'The surface of the water at the boat', 'The line from the boat to the base of the lighthouse'], 'Angles of elevation and depression are always measured from the horizontal.'], ['The angle of depression from a tower to a car is $' + deg(th) + '$. What is the angle of elevation from the car to the top of the tower?', '$' + deg(th) + '$', ['$' + deg(90 - th) + '$', '$' + deg(180 - th) + '$', '$' + deg(2 * th) + '$'], 'The horizontal line at the top and the ground are parallel, and the line of sight is a transversal: the two angles are alternate interior angles, so they are equal.']]);
      return { q: q[0], a: mc(q[1], q[2]), steps: [q[3]], hint: 'Elevation and depression start from a horizontal line.' }; }
    if (kind === 'height') { var h = d * tanD(th), what = R.pick(['tree', 'flagpole', 'building', 'cliff']);
      return { q: 'You stand $' + d + '$ m from the base of a ' + what + ' on level ground. The angle of elevation to its top is $' + deg(th) + '$. How tall is the ' + what + ', to the nearest tenth of a meter? (Measure from the ground.)', a: tol(h), viz: fig({ pts: { P: [0, 0], Q: [6, 0], T: [6, 6 * tanD(th)] }, polys: [['P', 'Q', 'T', { fill: 'blue' }]], segs: [['P', 'Q', { lab: d + ' m' }], ['Q', 'T', { lab: 'h' }]], angs: [['Q', 'P', 'T', { lab: th + '°' }], ['P', 'Q', 'T', { right: 1 }]], nolab: ['P', 'Q', 'T'], height: 200 }, 'A right triangle: the ground, the ' + what + ' and the line of sight'),
        steps: ['The ground, the ' + what + ' and your line of sight make a right triangle. The angle of elevation is at your position.', 'The height is opposite the angle and the distance is adjacent: $\\tan ' + deg(th) + ' = \\dfrac{h}{' + d + '}$.', '$h = ' + d + ' \\tan ' + deg(th) + ' \\approx ' + dec(h, 1) + '$ m.'], hint: 'Opposite and adjacent: use tangent.' }; }
    if (kind === 'eye') { var eh = R.real(1.4, 1.8, 1), h2 = d * tanD(th) + eh;
      return { q: 'A surveyor\'s eye is $' + T.num(eh) + '$ m above level ground, $' + d + '$ m from a tower. The angle of elevation to the top of the tower is $' + deg(th) + '$. How tall is the tower, to the nearest tenth of a meter?', a: tol(h2),
        steps: ['The right triangle starts at eye level: $\\tan ' + deg(th) + ' = \\dfrac{h}{' + d + '}$, so $h = ' + d + ' \\tan ' + deg(th) + ' \\approx ' + dec(d * tanD(th), 2) + '$ m above eye level.', 'Add the eye height: $' + dec(d * tanD(th), 2) + ' + ' + T.num(eh) + ' \\approx ' + dec(h2, 1) + '$ m.'], hint: 'The triangle starts at the surveyor\'s eye, not at the ground.' }; }
    if (kind === 'angle') { var h3 = R.int(10, 120), a3 = aD(M.atan(h3 / d));
      return { q: 'A kite string is anchored to the ground. The kite is $' + h3 + '$ ft above the ground, directly above a point $' + d + '$ ft from the anchor. Find the angle of elevation of the string from the anchor, to the nearest degree.', a: tol(a3, 0.5),
        steps: ['Right triangle: height $' + h3 + '$ (opposite the angle) and ground distance $' + d + '$ (adjacent).', '$\\tan \\theta = \\dfrac{' + h3 + '}{' + d + '}$, so $\\theta = \\tan^{-1}\\left(\\dfrac{' + h3 + '}{' + d + '}\\right) \\approx ' + dec(a3, 2) + '^\\circ \\approx ' + deg(M.round(a3)) + '$.'], hint: 'Opposite over adjacent, then inverse tangent.' }; }
    if (kind === 'depr') { var h4 = R.int(30, 400), x4 = h4 / tanD(th);
      return { q: 'From the top of a ' + h4 + ' ft cliff, the angle of depression to a boat is $' + deg(th) + '$. How far is the boat from the base of the cliff, to the nearest foot?', a: tol(x4, 0.6), viz: fig({ pts: { T: [0, 4], B: [0, 0], S: [4 / tanD(th), 0], H: [4 / tanD(th), 4] }, segs: [['T', 'B', { lab: h4 + ' ft' }], ['B', 'S', { lab: 'x' }], ['T', 'S'], ['T', 'H', { dash: 1 }]], angs: [['H', 'T', 'S', { lab: th + '°' }], ['S', 'B', 'T', { right: 1 }]], nolab: ['T', 'B', 'S', 'H'], height: 200 }, 'A cliff, a boat and the line of sight with the angle of depression from the horizontal'),
        steps: ['The angle of depression is measured down from the horizontal at the top. It equals the angle of elevation from the boat (alternate interior angles).', 'In the right triangle at the boat: $\\tan ' + deg(th) + ' = \\dfrac{' + h4 + '}{x}$.', '$x = \\dfrac{' + h4 + '}{\\tan ' + deg(th) + '} \\approx ' + dec(x4, 1) + '$, about $' + M.round(x4) + '$ ft.'], hint: 'Move the angle to the boat: it is the angle of elevation there.' }; }
    var L = R.int(8, 40), r = L * sinD(th % 20 + 5), ang2 = th % 20 + 5;
    return { q: 'A ramp is $' + L + '$ ft long and makes an angle of $' + deg(ang2) + '$ with the level ground. How high does it rise, to the nearest tenth of a foot?', a: tol(r),
      steps: ['The ramp is the hypotenuse and the rise is opposite the angle.', '$\\sin ' + deg(ang2) + ' = \\dfrac{h}{' + L + '}$, so $h = ' + L + ' \\sin ' + deg(ang2) + ' \\approx ' + dec(r, 1) + '$ ft.'], hint: 'Hypotenuse and opposite side: sine.' };
  });

  G('geo.area-with-sine', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['exact', 'formula', 'exact'], ['exact', 'calc', 'rev'], ['calc', 'rev', 'exact']));
    var a = R.int(3, 14), b = R.int(3, 14);
    if (kind === 'formula') return { q: 'In $' + tri('ABC') + '$, $a = BC$ and $b = CA$. Which expression gives its area?', a: mc('$\\frac{1}{2}ab \\sin C$', ['$\\frac{1}{2}ab \\cos C$', '$\\frac{1}{2}ab \\sin A$', '$ab \\sin C$']), steps: ['Use $' + seg('BC') + '$ as the base. The height from $A$ is $b \\sin C$ (the side $b$ is a hypotenuse, and the height is opposite $' + ang('C') + '$).', 'Area $= \\frac{1}{2} \\cdot \\text{base} \\cdot \\text{height} = \\frac{1}{2} a \\cdot b \\sin C$.', 'The angle must be the one between the two sides.'], hint: 'Which angle is between sides a and b?' };
    if (kind === 'exact') { var C = R.pick([30, 45, 60, 90, 120, 135, 150]), s = SIN[C], area = rad(a * b * s[0], 2 * s[1], s[2]);
      return { q: 'Find the area of a triangle with sides $' + a + '$ and $' + b + '$ and an included angle of $' + deg(C) + '$. Give an exact answer.', a: rnum(area),
        steps: ['Area $= \\frac{1}{2}ab \\sin C$, with $C$ the angle between the two sides.', '$\\sin ' + deg(C) + ' = ' + sinTex(C) + '$' + (C > 90 ? ' (the same as $\\sin ' + deg(180 - C) + '$)' : '') + '.', 'Area $= \\frac{1}{2} \\cdot ' + a + ' \\cdot ' + b + ' \\cdot ' + sinTex(C) + ' = ' + rtex(area) + '$.'], hint: 'Use ½ab sin C with the exact value of sin ' + C + '°.' }; }
    if (kind === 'calc') { var C2 = R.int(20, 160); while ([30, 45, 60, 90, 120, 135, 150].indexOf(C2) >= 0) C2 = R.int(20, 160); var A2 = 0.5 * a * b * sinD(C2);
      return { q: 'Find the area of a triangle with sides $' + a + '$ cm and $' + b + '$ cm and an included angle of $' + deg(C2) + '$, to the nearest tenth of a square centimeter.', a: tol(A2),
        steps: ['Area $= \\frac{1}{2}ab \\sin C = \\frac{1}{2} \\cdot ' + a + ' \\cdot ' + b + ' \\cdot \\sin ' + deg(C2) + '$.', '$\\approx ' + dec(A2, 1) + '$ cm$^2$.'], hint: 'Use ½ab sin C (calculator in degree mode).' }; }
    var k = R.int(2, 12), bb = R.int(2, 10), area2 = k * bb; // with C = 30: area = ab/4, choose a = 4k so area = k·b
    return { q: 'A triangle has an area of $' + area2 + '$. Two of its sides are $' + 4 * k + '$ and $b$, and the angle between them is $30^\\circ$. Find $b$.', a: num(bb),
      steps: ['Area $= \\frac{1}{2}ab \\sin C$: $' + area2 + ' = \\frac{1}{2} \\cdot ' + 4 * k + ' \\cdot b \\cdot \\sin 30^\\circ$.', '$\\sin 30^\\circ = \\frac{1}{2}$, so $' + area2 + ' = ' + k + 'b$.', '$b = ' + bb + '$.'], hint: 'Substitute what you know into ½ab sin C and solve for b.' };
  });

  G('geo.law-of-sines', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['exact', 'pair', 'exact'], ['calc', 'exact', 'pair'], ['angle', 'calc', 'angle']));
    if (kind === 'pair') return { q: 'In $' + tri('ABC') + '$, side $a$ is opposite $' + ang('A') + '$, $b$ is opposite $' + ang('B') + '$ and $c$ is opposite $' + ang('C') + '$. Which ratio equals $\\dfrac{a}{\\sin A}$?', a: mc('$\\dfrac{b}{\\sin B}$', ['$\\dfrac{b}{\\sin A}$', '$\\dfrac{a}{\\sin B}$', '$\\dfrac{\\sin B}{b}$']),
      steps: ['The Law of Sines pairs each side with the sine of the angle opposite it: $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$.', '($\\dfrac{\\sin B}{b}$ is the reciprocal, which equals $\\dfrac{\\sin A}{a}$ instead.)'], hint: 'Each side goes with the angle across from it.' };
    if (kind === 'exact') { var pairs = [[30, 45], [30, 60], [45, 60], [45, 30], [60, 30], [60, 45], [30, 120], [45, 90], [30, 90], [120, 30], [135, 30]], pr = R.pick(pairs), A = pr[0], B = pr[1], a = 2 * R.int(2, 9), sA = SIN[A], sB = SIN[B];
      var b = rad(a * sB[0] * sA[1], sB[1] * sA[0] * sA[2], sB[2] * sA[2]);
      return { q: 'In $' + tri('ABC') + '$, $' + mang('A') + ' = ' + deg(A) + '$, $' + mang('B') + ' = ' + deg(B) + '$ and $a = BC = ' + a + '$. Find $b = AC$. Give an exact answer.', a: rnum(b), viz: fig(triFig(triFromAngles(A, B, 0), ['A', 'B', 'C'], { angLabs: [A + '°', B + '°', ''], sideLabs: ['', String(a), 'b'] }), 'Triangle ABC with two angles and side a labeled'),
        steps: ['Law of Sines: $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B}$, so $b = \\dfrac{a \\sin B}{\\sin A}$.', '$b = \\dfrac{' + a + ' \\cdot ' + sinTex(B) + '}{' + sinTex(A) + '}$.', 'Simplify: $b = ' + rtex(b) + '$.'], hint: 'Side a goes with angle A, and side b with angle B.' }; }
    if (kind === 'calc') { var A3 = R.int(25, 100), B3 = R.int(20, 150 - A3), a3 = R.int(5, 30), b3 = a3 * sinD(B3) / sinD(A3), askC = R.coin(), C3 = 180 - A3 - B3, c3 = a3 * sinD(C3) / sinD(A3);
      return { q: 'In $' + tri('ABC') + '$, $' + mang('A') + ' = ' + deg(A3) + '$, $' + mang('B') + ' = ' + deg(B3) + '$ and $a = ' + a3 + '$. Find ' + (askC ? '$c$' : '$b$') + ' to the nearest tenth.', a: tol(askC ? c3 : b3),
        steps: (askC ? ['First find the third angle: $' + mang('C') + ' = 180 - ' + A3 + ' - ' + B3 + ' = ' + deg(C3) + '$.'] : []).concat(['Law of Sines: $\\dfrac{' + (askC ? 'c' : 'b') + '}{\\sin ' + deg(askC ? C3 : B3) + '} = \\dfrac{' + a3 + '}{\\sin ' + deg(A3) + '}$.', '$' + (askC ? 'c' : 'b') + ' = \\dfrac{' + a3 + ' \\sin ' + deg(askC ? C3 : B3) + '}{\\sin ' + deg(A3) + '} \\approx ' + dec(askC ? c3 : b3, 1) + '$.']), hint: 'Pair each side with the angle across from it.' }; }
    var A4 = R.int(30, 80), a4 = R.int(10, 30), b4 = R.int(4, a4 - 2), B4 = aD(M.asin(b4 * sinD(A4) / a4));
    return { q: 'In $' + tri('ABC') + '$, $' + mang('A') + ' = ' + deg(A4) + '$, $a = ' + a4 + '$ and $b = ' + b4 + '$. Find $' + mang('B') + '$ to the nearest degree.', a: tol(B4, 0.5),
      steps: ['Law of Sines: $\\dfrac{\\sin B}{' + b4 + '} = \\dfrac{\\sin ' + deg(A4) + '}{' + a4 + '}$, so $\\sin B = \\dfrac{' + b4 + ' \\sin ' + deg(A4) + '}{' + a4 + '} \\approx ' + dec(b4 * sinD(A4) / a4, 4) + '$.', '$' + mang('B') + ' = \\sin^{-1}(' + dec(b4 * sinD(A4) / a4, 4) + ') \\approx ' + dec(B4, 1) + '^\\circ \\approx ' + deg(M.round(B4)) + '$.', 'Only this acute answer works: $b < a$, so $' + ang('B') + '$ must be smaller than $' + ang('A') + '$.'], hint: 'Solve the proportion for sin B, then use the inverse sine.' };
  });

  G('geo.law-of-cosines', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['nice', 'exact', 'nice'], ['exact', 'calc', 'error'], ['sss', 'calc', 'sssnice']));
    var NICE = [[3, 8, 60, 7], [5, 8, 60, 7], [8, 15, 60, 13], [7, 15, 60, 13], [5, 21, 60, 19], [3, 5, 120, 7], [7, 8, 120, 13], [5, 16, 120, 19], [16, 5, 120, 19], [8, 3, 60, 7]];
    if (kind === 'nice' || kind === 'exact') { var a, b, C, c2, cv;
      if (kind === 'nice') { var n = R.pick(NICE), k = R.int(1, 5); a = n[0] * k; b = n[1] * k; C = n[2]; cv = rad(n[3] * k); c2 = cv.n * cv.n; }
      else { a = R.int(2, 15); b = R.int(2, 15); C = R.pick([60, 120, 90]); c2 = a * a + b * b + (C === 60 ? -a * b : C === 120 ? a * b : 0); cv = sqrtN(c2); }
      var cosT = C === 60 ? '\\frac{1}{2}' : C === 120 ? '-\\frac{1}{2}' : '0', mid2 = C === 60 ? -a * b : C === 120 ? a * b : 0;
      return { q: 'In $' + tri('ABC') + '$, $a = ' + a + '$, $b = ' + b + '$ and the included angle $' + mang('C') + ' = ' + deg(C) + '$. Find $c$. Give an exact answer.', a: rnum(cv), viz: fig(triFig(triFromAngles(C, aD(M.atan2(a * sinD(C), b - a * cosD(C))), 0), ['C', 'A', 'B'], { angLabs: [C + '°', '', ''], sideLabs: [String(b), 'c', String(a)] }), 'Triangle ABC with sides a and b and the angle C between them'),
        steps: ['Law of Cosines: $c^2 = a^2 + b^2 - 2ab \\cos C$.', '$c^2 = ' + a + '^2 + ' + b + '^2 - 2 \\cdot ' + a + ' \\cdot ' + b + ' \\cdot ' + T.p(cosT) + '$.', 'Multiply first: $c^2 = ' + a * a + ' + ' + b * b + (mid2 < 0 ? ' - ' + (-mid2) : mid2 > 0 ? ' + ' + mid2 : ' - 0') + ' = ' + c2 + '$.', '$c = \\sqrt{' + c2 + '}' + (cv.r !== c2 ? ' = ' + rtex(cv) : '') + '$.'], hint: 'Multiply 2ab by cos C before you combine anything.', nolint: ['+ 0', '- 0', '+ -'] }; }
    if (kind === 'calc') { var a2 = R.int(4, 20), b2 = R.int(4, 20), C2 = R.int(25, 150); while ([60, 90, 120].indexOf(C2) >= 0) C2 = R.int(25, 150); var cc = M.sqrt(a2 * a2 + b2 * b2 - 2 * a2 * b2 * cosD(C2));
      return { q: 'In $' + tri('ABC') + '$, $a = ' + a2 + '$, $b = ' + b2 + '$ and $' + mang('C') + ' = ' + deg(C2) + '$. Find $c$ to the nearest tenth.', a: tol(cc),
        steps: ['Law of Cosines: $c^2 = a^2 + b^2 - 2ab \\cos C$, so $c^2 = ' + a2 * a2 + ' + ' + b2 * b2 + ' - ' + 2 * a2 * b2 + ' \\cos ' + deg(C2) + '$.', '$' + 2 * a2 * b2 + ' \\cos ' + deg(C2) + ' \\approx ' + dec(2 * a2 * b2 * cosD(C2), 2) + '$, so $c^2 \\approx ' + dec(cc * cc, 2) + '$.', '$c \\approx ' + dec(cc, 1) + '$.'], hint: 'Compute 2ab cos C first, then subtract.' }; }
    if (kind === 'error') { var e = R.pick([[5, 8, 60], [4, 7, 60], [6, 9, 60], [3, 8, 60], [7, 10, 60], [5, 12, 60], [6, 10, 60], [8, 9, 60]]), wrong = (e[0] * e[0] + e[1] * e[1] - 2 * e[0] * e[1]) * 0.5, right = e[0] * e[0] + e[1] * e[1] - e[0] * e[1];
      return { q: 'Sam finds $c$ with $a = ' + e[0] + '$, $b = ' + e[1] + '$ and $C = 60^\\circ$. He writes $c^2 = (' + e[0] + '^2 + ' + e[1] + '^2 - 2 \\cdot ' + e[0] + ' \\cdot ' + e[1] + ')\\cos 60^\\circ = ' + T.num(wrong) + '$. What went wrong, and what is the correct $c^2$?', a: mc('He multiplied the whole difference by $\\cos 60^\\circ$; only $2ab$ should be. $c^2 = ' + right + '$', ['Nothing is wrong. $c^2 = ' + T.num(wrong) + '$', 'He should add $2ab$, not subtract it. $c^2 = ' + (e[0] * e[0] + e[1] * e[1] + 2 * e[0] * e[1]) + '$', 'He should use $\\sin 60^\\circ$. $c^2 = ' + right + '$']),
        steps: ['The formula is $c^2 = a^2 + b^2 - (2ab \\cos C)$: only the $2ab$ term is multiplied by $\\cos C$.', '$c^2 = ' + e[0] * e[0] + ' + ' + e[1] * e[1] + ' - 2 \\cdot ' + e[0] + ' \\cdot ' + e[1] + ' \\cdot \\frac{1}{2} = ' + right + '$.'], hint: 'Order of operations: multiply before subtracting.' }; }
    if (kind === 'sssnice') { var S = R.pick([[3, 5, 7, 120], [5, 7, 8, 60, 7], [3, 7, 8, 60, 7], [7, 8, 13, 120], [5, 16, 19, 120], [8, 13, 15, 60, 13], [7, 13, 15, 60, 13]]), k2 = R.int(1, 3), sides = S.slice(0, 3).map(function (v) { return v * k2; }), opp = (S[4] || S[2]) * k2, others = sides.filter(function (v, i) { return v !== opp || sides.indexOf(v) !== i; });
      others = sides.slice(); others.splice(others.indexOf(opp), 1); var cosv = (others[0] * others[0] + others[1] * others[1] - opp * opp) / (2 * others[0] * others[1]);
      return { q: 'A triangle has sides $' + sides.join('$, $') + '$. Find the angle opposite the side of length $' + opp + '$.', a: num(S[3]),
        steps: ['Law of Cosines solved for the angle: $\\cos C = \\dfrac{a^2 + b^2 - c^2}{2ab}$, with $c = ' + opp + '$.', '$\\cos C = \\dfrac{' + others[0] * others[0] + ' + ' + others[1] * others[1] + ' - ' + opp * opp + '}{' + 2 * others[0] * others[1] + '} = ' + T.frac(others[0] * others[0] + others[1] * others[1] - opp * opp, 2 * others[0] * others[1]) + '$.', 'The angle with cosine $' + T.num(cosv) + '$ is $' + deg(S[3]) + '$.'], hint: 'Put the side across from the angle in the c² spot.', chk: { sides: sides, opp: opp, ang: S[3] } }; }
    var p = R.int(4, 15), q = R.int(4, 15), r = R.int(M.abs(p - q) + 2, p + q - 2); while (r === p || r === q) r = R.int(M.abs(p - q) + 2, p + q - 2); var Cang = aD(M.acos((p * p + q * q - r * r) / (2 * p * q)));
    return { q: 'A triangle has sides $' + p + '$, $' + q + '$ and $' + r + '$. Find the angle opposite the side of length $' + r + '$, to the nearest degree.', a: tol(Cang, 0.5),
      steps: ['$\\cos C = \\dfrac{' + p + '^2 + ' + q + '^2 - ' + r + '^2}{2 \\cdot ' + p + ' \\cdot ' + q + '} = \\dfrac{' + (p * p + q * q - r * r) + '}{' + 2 * p * q + '}$.', '$C = \\cos^{-1}\\left(' + T.frac(p * p + q * q - r * r, 2 * p * q) + '\\right) \\approx ' + dec(Cang, 1) + '^\\circ \\approx ' + deg(M.round(Cang)) + '$.'], hint: 'Solve the Law of Cosines for cos C.' };
  });

  /* ================================================================ Unit: Circles */

  function onC(a, r) { r = r || 3; return [r * cosD(a), r * sinD(a)]; }
  function cFig(pts, o) { // pts: {A: angle in degrees on the circle of radius 3}; o: extra geo-fig options
    var f = { pts: { O: [0, 0] }, circles: [['O', 3]], height: (o && o.height) || 230 };
    Object.keys(pts).forEach(function (k) { f.pts[k] = Array.isArray(pts[k]) ? pts[k] : onC(pts[k]); });
    return Object.assign(f, o || {});
  }

  G('geo.circle-parts', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['rd', 'name', 'name'], ['name', 'alg', 'tf'], ['circ', 'tf', 'alg', 'name']));
    if (kind === 'rd') { var r = R.int(2, 40) / (R.chance(0.2) ? 2 : 1), toD = R.coin();
      return toD ? { q: 'A circle has radius $' + T.num(r) + '$ cm. What is its diameter?', a: num(2 * r), steps: ['A diameter is a chord through the center: two radii end to end.', '$d = 2r = 2 \\cdot ' + T.num(r) + ' = ' + T.num(2 * r) + '$ cm.'], hint: 'The diameter is twice the radius.' }
        : { q: 'A circle has diameter $' + T.num(2 * r) + '$ in. What is its radius?', a: num(r), steps: ['The radius is half the diameter.', '$r = ' + T.num(2 * r) + ' \\div 2 = ' + T.num(r) + '$ in.'], hint: 'Half the diameter.' }; }
    if (kind === 'name') { var t = R.pick(['radius', 'diameter', 'chord', 'secant', 'tangent']), base = R.int(0, 359), f, q, ans;
      if (t === 'radius') { f = cFig({ P: base }, { segs: [['O', 'P', { color: 'blue', w: 3.5 }]] }); q = '$' + seg('OP') + '$'; ans = 'A radius'; }
      else if (t === 'diameter') { f = cFig({ P: base, Q: base + 180 }, { segs: [['P', 'Q', { color: 'blue', w: 3.5 }]] }); q = '$' + seg('PQ') + '$'; ans = 'A diameter'; }
      else if (t === 'chord') { f = cFig({ P: base, Q: base + R.int(70, 140) }, { segs: [['P', 'Q', { color: 'blue', w: 3.5 }]] }); q = '$' + seg('PQ') + '$'; ans = 'A chord'; }
      else if (t === 'secant') { f = cFig({ P: base, Q: base + R.int(70, 140) }, { lines: [['P', 'Q', { color: 'blue', w: 3 }]] }); q = '$\\overleftrightarrow{PQ}$'; ans = 'A secant'; }
      else { var T0 = onC(base), dir = [-sinD(base), cosD(base)]; f = cFig({ T: T0, U: [T0[0] + 2 * dir[0], T0[1] + 2 * dir[1]] }, { lines: [['T', 'U', { color: 'blue', w: 3 }]], hide: ['U'] }); q = 'the blue line through $T$'; ans = 'A tangent'; }
      return { q: 'In circle $O$, what is ' + q + '?', a: mc(ans, ['A radius', 'A diameter', 'A chord', 'A secant', 'A tangent'].filter(function (x) { return x !== ans; })), viz: fig(f, 'Circle O with one part shown in blue'),
        steps: ['Radius: center to the circle. Chord: a segment with both ends on the circle. Diameter: a chord through the center. Secant: a line that crosses the circle twice. Tangent: a line that touches the circle at exactly one point.', 'So it is ' + ans.toLowerCase() + '.'], hint: 'Is it a segment or a whole line? Does it go through the center?' }; }
    if (kind === 'alg') { var xv = R.int(2, 9), rv = R.int(5, 25), e1 = expr(R, xv, rv, 1, 4), e2 = expr(R, xv, 2 * rv, 2, 9); if (e2.a === 2 * e1.a) e2 = expr(R, xv, 2 * rv, 2 * e1.a + 1, 2 * e1.a + 4);
      return { q: 'In a circle, a radius has length $' + e1.tex + '$ and a diameter has length $' + e2.tex + '$. Find the diameter.', a: num(2 * rv),
        steps: ['A diameter is twice a radius: $' + e2.tex + ' = 2(' + e1.tex + ') = ' + lin(2 * e1.a, 2 * e1.b) + '$.', 'Solve: $x = ' + xv + '$.', 'Diameter: $' + e2.a + '(' + xv + ')' + T.signed(e2.b) + ' = ' + 2 * rv + '$ (and the radius is $' + rv + '$).'], hint: 'd = 2r.' }; }
    if (kind === 'tf') { var f2 = R.pick([['Every diameter is a chord.', true, 'A diameter has both endpoints on the circle, so it is a chord (the longest one).'], ['Every chord is a diameter.', false, 'Most chords miss the center.'], ['A secant can meet a circle in three points.', false, 'A line meets a circle in at most two points.'], ['A tangent line meets a circle in exactly one point.', true, 'That is what tangent means.'], ['The longest chord of a circle is a diameter.', true, 'A chord gets longer as it moves toward the center, and the one through the center is longest.'], ['All radii of a circle are congruent.', true, 'A circle is the set of points at one fixed distance (the radius) from the center.']]);
      return { q: 'True or false: ' + f2[0], a: tf(f2[1]), steps: [f2[2]], hint: 'Sketch a circle and try it.' }; }
    var k = R.int(3, 30), useC = R.coin();
    return useC ? { q: 'A circle has circumference $' + ptex(pq(2 * k)) + '$. Find its radius.', a: num(k), steps: ['$C = 2\\pi r$.', '$2\\pi r = ' + 2 * k + '\\pi$, so $r = ' + k + '$.'], hint: 'Circumference = 2πr.' }
      : { q: 'A circle has area $' + ptex(pq(k * k)) + '$ square units. Find its radius.', a: num(k), steps: ['$A = \\pi r^2$.', '$\\pi r^2 = ' + k * k + '\\pi$, so $r^2 = ' + k * k + '$ and $r = ' + k + '$.'], hint: 'Area = πr².' };
  });

  G('geo.central-angles-arcs', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['minor', 'major', 'minor'], ['adj', 'semi', 'major', 'tf'], ['around', 'sim', 'semi', 'adj']));
    var a = R.int(25, 165), base = R.int(0, 359);
    if (kind === 'minor' || kind === 'major') { var maj = kind === 'major';
      return { q: 'In circle $O$, $' + mang('AOB') + ' = ' + deg(a) + '$. Find ' + (maj ? 'the measure of the major arc $' + arcT('ACB') + '$ (the long way around through $C$)' : '$m' + arcT('AB') + '$, the measure of the minor arc') + '.', a: num(maj ? 360 - a : a),
        viz: fig(cFig({ A: base, B: base + a, C: base + a + (360 - a) / 2 }, { segs: [['O', 'A'], ['O', 'B']], arcs: [maj ? ['O', 'B', 'A', { color: 'red', lab: '?' }] : ['O', 'A', 'B', { color: 'red', lab: '?' }]], angs: [['A', 'O', 'B', { lab: a + '°', color: 'blue', r: 22 }]], nolab: maj ? [] : ['C'], hide: maj ? [] : ['C'] }), 'Circle O with central angle AOB'),
        steps: maj ? ['The minor arc $' + arcT('AB') + '$ has the same measure as its central angle: $' + deg(a) + '$.', 'The whole circle is $360^\\circ$, so the major arc is $360 - ' + a + ' = ' + deg(360 - a) + '$.'] : ['The measure of an arc is defined as the measure of its central angle.', '$m' + arcT('AB') + ' = ' + deg(a) + '$.'], hint: maj ? 'The two arcs make the full 360°.' : 'An arc measures the same as its central angle.' }; }
    if (kind === 'adj') { var b = R.int(20, 180 - a);
      return { q: 'Points $A$, $B$ and $C$ lie on circle $O$ with $B$ on the minor arc from $A$ to $C$. $m' + arcT('AB') + ' = ' + deg(a) + '$ and $m' + arcT('BC') + ' = ' + deg(b) + '$. Find $m' + arcT('ABC') + '$.', a: num(a + b),
        steps: ['Arc Addition Postulate: adjacent arcs add, $m' + arcT('ABC') + ' = m' + arcT('AB') + ' + m' + arcT('BC') + '$.', '$' + a + ' + ' + b + ' = ' + deg(a + b) + '$.'], hint: 'The two arcs together make the bigger arc.' }; }
    if (kind === 'semi') { var xv = R.int(5, 30), e1 = expr(R, xv, a % 150 + 20, 1, 4), v2 = 180 - (a % 150 + 20), e2 = expr(R, xv, v2, 1, 5);
      var st = ['$' + seg('AC') + '$ is a diameter, so arcs $' + arcT('AB') + '$ and $' + arcT('BC') + '$ together form a semicircle: $180^\\circ$.'].concat(sumSteps([e1, e2], 180, xv)); st.push('So $m' + arcT('AB') + ' = ' + deg(a % 150 + 20) + '$.');
      return { q: '$' + seg('AC') + '$ is a diameter of circle $O$, and $B$ is on the circle. $m' + arcT('AB') + ' = (' + e1.tex + ')^\\circ$ and $m' + arcT('BC') + ' = (' + e2.tex + ')^\\circ$. Find $m' + arcT('AB') + '$.', a: num(a % 150 + 20), steps: st, hint: 'A semicircle measures 180°.' }; }
    if (kind === 'tf') { var f = R.pick([['Two arcs with the same measure in different circles always have the same length.', false, 'Arc measure is an angle. A $60^\\circ$ arc of a big circle is longer than a $60^\\circ$ arc of a small circle.'], ['In the same circle, arcs with equal central angles are congruent.', true, 'Same circle and same angle: one arc can be turned onto the other.'], ['A semicircle measures $180^\\circ$.', true, 'Its central angle is a straight angle.'], ['All circles are similar.', true, 'Translate one circle onto the other\'s center, then dilate by the ratio of the radii.']]);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Is arc measure a length or an angle?' }; }
    if (kind === 'around') { var xv2 = R.int(5, 25), vals; do { vals = [R.int(40, 140), R.int(40, 140)]; vals.push(360 - vals[0] - vals[1]); } while (vals[2] < 40 || vals[2] > 180);
      var es = vals.map(function (v, i) { return expr(R, xv2, v, i === 2 ? 1 : 2, i === 2 ? 3 : 5); }), st2 = sumSteps(es, 360, xv2); st2.unshift('Central angles around the center that do not overlap add to $360^\\circ$.');
      return { q: 'Three central angles of circle $O$ fill the circle without overlapping. They measure $(' + es[0].tex + ')^\\circ$, $(' + es[1].tex + ')^\\circ$ and $(' + es[2].tex + ')^\\circ$. Find $x$.', a: num(xv2), steps: st2, hint: 'The angles around a point add to 360°.' }; }
    var r1 = R.int(2, 9), r2 = R.int(2, 15); while (r2 === r1) r2 = R.int(2, 15);
    return { q: 'Circle $P$ has radius $' + r1 + '$ and circle $Q$ has radius $' + r2 + '$. All circles are similar. What scale factor of a dilation maps circle $P$ onto circle $Q$ (after a translation)?', a: num(qplain(r2, r1)),
      steps: ['Translate circle $P$ so its center lands on $Q$\'s center. Then a dilation about that center with scale factor $k$ multiplies the radius by $k$.', '$k = \\dfrac{' + r2 + '}{' + r1 + '}' + (U.gcd(r1, r2) > 1 || r2 % r1 === 0 ? ' = ' + T.frac(r2, r1) : '') + '$.'], hint: 'Divide the new radius by the old one.' };
  });

  G('geo.inscribed-angles', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['half', 'double', 'half'], ['same', 'semi', 'double', 'mistake'], ['same', 'central', 'semi', 'arcalg']));
    var arc = 2 * R.int(20, 85), base = R.int(190, 260);
    function iFig(labA, labArc, o) { return fig(cFig({ A: base, B: base + arc, P: base + arc + (360 - arc) * R.real(0.3, 0.7, 2) }, Object.assign({ segs: [['P', 'A'], ['P', 'B']], arcs: [['O', 'A', 'B', { color: 'red', lab: labArc }]], angs: [['A', 'P', 'B', { lab: labA, color: 'blue', r: 24 }]], hide: ['O'] }, o || {})), 'Circle with inscribed angle APB and its intercepted arc AB'); }
    if (kind === 'half') return { q: 'An inscribed angle $' + ang('APB') + '$ intercepts an arc of $' + deg(arc) + '$. Find $' + mang('APB') + '$.', a: num(arc / 2), viz: iFig('?', arc + '°'),
      steps: ['Inscribed Angle Theorem: an inscribed angle is half of the arc it intercepts.', '$' + mang('APB') + ' = \\frac{1}{2} \\cdot ' + arc + ' = ' + deg(arc / 2) + '$.'], hint: 'Half the arc.' };
    if (kind === 'double') return { q: 'Inscribed angle $' + ang('APB') + '$ measures $' + deg(arc / 2) + '$. Find the measure of the arc it intercepts, $m' + arcT('AB') + '$.', a: num(arc), viz: iFig(arc / 2 + '°', '?'),
      steps: ['The inscribed angle is half its arc, so the arc is twice the angle.', '$m' + arcT('AB') + ' = 2 \\cdot ' + arc / 2 + ' = ' + deg(arc) + '$.'], hint: 'Double the angle.' };
    if (kind === 'mistake') return { q: 'Inscribed angle $' + ang('APB') + '$ intercepts an arc of $' + deg(arc) + '$. A student says $' + mang('APB') + ' = ' + deg(arc) + '$. What is the correct measure?', a: num(arc / 2), viz: iFig('?', arc + '°'),
      steps: ['The student treated $' + ang('APB') + '$ as a central angle. Its vertex is on the circle, not at the center.', 'An inscribed angle is half its arc: $' + mang('APB') + ' = ' + deg(arc / 2) + '$.', 'Why: draw the diameter through $P$. Each piece of the angle is a base angle of an isosceles triangle (two radii), and the exterior angle at the center is twice it.'], hint: 'Where is the vertex: at the center or on the circle?' };
    if (kind === 'same') { var xv = R.int(3, 15), P = eqPair(R, xv, arc / 2, arc / 2);
      return { q: 'Inscribed angles $' + ang('APB') + '$ and $' + ang('AQB') + '$ both intercept arc $' + arcT('AB') + '$. $' + mang('APB') + ' = (' + lin(P.a, P.b) + ')^\\circ$ and $' + mang('AQB') + ' = (' + lin(P.c, P.d) + ')^\\circ$. Find $' + mang('APB') + '$.', a: num(arc / 2),
        steps: ['Inscribed angles that intercept the same arc are congruent (each is half of that arc).'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['$' + mang('APB') + ' = ' + deg(arc / 2) + '$.']), hint: 'Same arc, same inscribed angle.' }; }
    if (kind === 'semi') { var b2 = R.int(20, 70);
      return { q: '$' + seg('AB') + '$ is a diameter of circle $O$, and $C$ is on the circle. If $' + mang('CAB') + ' = ' + deg(b2) + '$, find $' + mang('CBA') + '$.', a: num(90 - b2), viz: fig(cFig({ A: 180, B: 0, C: 180 - 2 * b2 }, { segs: [['A', 'B'], ['A', 'C'], ['C', 'B']], angs: [['A', 'C', 'B', { right: 1 }], ['C', 'A', 'B', { lab: b2 + '°' }]] }), 'Triangle ABC inscribed in a circle with AB a diameter'),
        steps: ['$' + ang('ACB') + '$ intercepts a semicircle ($180^\\circ$), so $' + mang('ACB') + ' = 90^\\circ$.', 'The angles of $' + tri('ABC') + '$ add to $180^\\circ$: $' + mang('CBA') + ' = 180 - 90 - ' + b2 + ' = ' + deg(90 - b2) + '$.'], hint: 'An angle inscribed in a semicircle is a right angle.' }; }
    if (kind === 'central') { var xv2 = R.int(4, 20), e = expr(R, xv2, arc, 2, 6), e2 = expr(R, xv2, arc / 2, 1, 3); if (e.a === 2 * e2.a) e = expr(R, xv2, arc, 2 * e2.a + 1, 2 * e2.a + 4);
      return { q: 'Central angle $' + ang('AOB') + '$ and inscribed angle $' + ang('APB') + '$ intercept the same arc. $' + mang('AOB') + ' = (' + e.tex + ')^\\circ$ and $' + mang('APB') + ' = (' + e2.tex + ')^\\circ$. Find $' + mang('AOB') + '$.', a: num(arc),
        steps: ['The central angle equals the arc, and the inscribed angle is half the arc, so $' + mang('AOB') + ' = 2 \\cdot ' + mang('APB') + '$.', '$' + e.tex + ' = 2(' + e2.tex + ') = ' + lin(2 * e2.a, 2 * e2.b) + '$, so $x = ' + xv2 + '$.', '$' + mang('AOB') + ' = ' + deg(arc) + '$ (and $' + mang('APB') + ' = ' + deg(arc / 2) + '$).'], hint: 'The central angle is twice the inscribed angle.' }; }
    var xv3 = R.int(4, 20), e3 = expr(R, xv3, arc, 2, 6);
    return { q: 'Inscribed angle $' + ang('APB') + '$ measures $' + deg(arc / 2) + '$ and intercepts $' + arcT('AB') + '$ with $m' + arcT('AB') + ' = (' + e3.tex + ')^\\circ$. Find $x$.', a: num(xv3),
      steps: ['The arc is twice the inscribed angle: $m' + arcT('AB') + ' = 2 \\cdot ' + arc / 2 + ' = ' + arc + '$.', '$' + e3.tex + ' = ' + arc + '$, so $' + T.mono(e3.a, 'x') + ' = ' + (arc - e3.b) + '$ and $x = ' + xv3 + '$.'], hint: 'Find the arc first.' };
  });

  G('geo.tangent-lines', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['op', 'tlen', 'two'], ['tlen', 'two', 'op', 'angle'], ['angle', 'istan', 'two', 'tlen']));
    var tr = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15], [20, 21, 29], [4, 3, 5], [12, 5, 13], [15, 8, 17], [12, 16, 20], [10, 24, 26]]);
    function tFig(labs) { var r = 3, d = M.min(3 * tr[2] / tr[0], 9.5), t = M.acos(r / d) * 180 / M.PI;
      return fig({ pts: { O: [0, 0], A: onC(t, r), P: [d, 0] }, circles: [['O', r]], segs: [['O', 'A', { lab: labs.r }], ['A', 'P', { lab: labs.t, color: 'blue' }], ['O', 'P', { lab: labs.d, dash: 1 }]], angs: [['O', 'A', 'P', { right: 1 }]], height: 210 }, 'Circle O with a tangent segment from P touching at A'); }
    if (kind === 'op' || kind === 'tlen') { var lv = ctx.level || 1, useTr = lv === 1 || R.chance(0.5), r = useTr ? tr[0] : R.int(2, 9), t = useTr ? tr[1] : R.int(2, 12), d2 = r * r + t * t;
      if (kind === 'op') return { q: '$' + seg('PA') + '$ is tangent to circle $O$ at $A$. The radius is $' + r + '$ and $PA = ' + t + '$. Find $OP$.' + (useTr ? '' : ' Give an exact answer.'), a: rnum(sqrtN(d2)), viz: useTr ? tFig({ r: String(r), t: String(t), d: '?' }) : undefined,
        steps: ['A tangent is perpendicular to the radius at the point of tangency, so $' + ang('OAP') + '$ is a right angle and $' + seg('OP') + '$ is a hypotenuse.', '$OP^2 = ' + r + '^2 + ' + t + '^2 = ' + d2 + '$.', '$OP = \\sqrt{' + d2 + '}' + (sqrtN(d2).r !== d2 ? ' = ' + rtex(sqrtN(d2)) : '') + '$.'], hint: 'The radius and the tangent meet at a right angle.' };
      return { q: '$' + seg('PA') + '$ is tangent to circle $O$ at $A$. The radius is $' + r + '$ and $OP = ' + rtex(sqrtN(d2)) + '$. Find $PA$.', a: num(t), viz: useTr ? tFig({ r: String(r), t: '?', d: String(M.sqrt(d2)) }) : undefined,
        steps: ['$' + seg('OA') + ' \\perp ' + seg('PA') + '$, so $' + tri('OAP') + '$ is a right triangle with hypotenuse $OP$.', '$PA^2 = OP^2 - OA^2 = ' + d2 + ' - ' + r * r + ' = ' + t * t + '$.', '$PA = ' + t + '$.'], hint: 'Pythagorean theorem with OP as the hypotenuse.' }; }
    if (kind === 'two') { var xv = R.int(2, 9), P = eqPair(R, xv, 6, 40);
      return { q: '$' + seg('PA') + '$ and $' + seg('PB') + '$ are tangent to circle $O$ from the same outside point $P$. $PA = ' + lin(P.a, P.b) + '$ and $PB = ' + lin(P.c, P.d) + '$. Find $PA$.', a: num(P.val),
        steps: ['Two tangent segments to a circle from the same outside point are congruent (the right triangles $OAP$ and $OBP$ are congruent by HL).'].concat(solveSteps({ a: P.a, b: P.b }, { a: P.c, b: P.d }, xv)).concat(['$PA = ' + P.val + '$.']), hint: 'Tangents from one point are equal.' }; }
    if (kind === 'angle') { var ap = R.int(20, 160), askC = R.coin();
      return askC ? { q: '$' + seg('PA') + '$ and $' + seg('PB') + '$ are tangent to circle $O$ at $A$ and $B$, and $' + mang('APB') + ' = ' + deg(ap) + '$. Find the central angle $' + mang('AOB') + '$.', a: num(180 - ap),
        steps: ['$' + ang('OAP') + '$ and $' + ang('OBP') + '$ are right angles (tangent ⟂ radius).', 'The angles of quadrilateral $OAPB$ add to $360^\\circ$: $' + mang('AOB') + ' = 360 - 90 - 90 - ' + ap + ' = ' + deg(180 - ap) + '$.'], hint: 'Quadrilateral OAPB has two right angles.' }
        : { q: '$' + seg('PA') + '$ and $' + seg('PB') + '$ are tangent to circle $O$ at $A$ and $B$, and $' + mang('AOB') + ' = ' + deg(180 - ap) + '$. Find $' + mang('APB') + '$.', a: num(ap),
          steps: ['The tangents meet the radii at right angles, so quadrilateral $OAPB$ has two $90^\\circ$ angles.', '$' + mang('APB') + ' = 360 - 90 - 90 - ' + (180 - ap) + ' = ' + deg(ap) + '$.'], hint: 'The four angles of OAPB add to 360°.' }; }
    var ok = R.coin(), op = ok ? tr[2] : tr[2] + R.pick([-1, 1]);
    return { q: 'In circle $O$, radius $OA = ' + tr[0] + '$. Point $P$ is outside the circle with $PA = ' + tr[1] + '$ and $OP = ' + op + '$. True or false: $' + seg('PA') + '$ is tangent to the circle at $A$.', a: tf(ok),
      steps: ['$' + seg('PA') + '$ is tangent at $A$ exactly when $' + seg('PA') + ' \\perp ' + seg('OA') + '$, that is, when $' + tri('OAP') + '$ is a right triangle with the right angle at $A$.', 'Converse of the Pythagorean theorem: is $' + tr[0] + '^2 + ' + tr[1] + '^2 = ' + op + '^2$? $' + (tr[0] * tr[0] + tr[1] * tr[1]) + (ok ? ' = ' : ' \\ne ') + op * op + '$.', ok ? 'Yes, so it is tangent.' : 'No, so it is not tangent.'], hint: 'Check for a right angle with the converse of the Pythagorean theorem.' };
  });

  G('geo.cyclic-quadrilaterals', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['opp', 'opp', 'tf'], ['alg', 'arcs', 'opp', 'tf'], ['alg', 'arcs', 'two']));
    var a = R.int(50, 130);
    function qFig(labs) { var p = [R.int(20, 60), R.int(110, 160), R.int(190, 240), R.int(280, 330)];
      return fig(cFig({ A: p[0], B: p[1], C: p[2], D: p[3] }, { polys: [['A', 'B', 'C', 'D', { fill: 'green' }]], angs: Object.keys(labs).map(function (k) { var i = 'ABCD'.indexOf(k), N = 'ABCD'; return [N[(i + 3) % 4], k, N[(i + 1) % 4], { lab: labs[k] }]; }), hide: ['O'] }), 'Quadrilateral ABCD inscribed in a circle'); }
    if (kind === 'opp') { var askOpp = R.pick(['C', 'D']), given = askOpp === 'C' ? 'A' : 'B', labs = {}; labs[given] = a + '°'; labs[askOpp] = '?';
      return { q: 'Quadrilateral $ABCD$ is inscribed in a circle. If $' + mang(given) + ' = ' + deg(a) + '$, find $' + mang(askOpp) + '$.', a: num(180 - a), viz: qFig(labs),
        steps: ['$' + ang(given) + '$ and $' + ang(askOpp) + '$ are opposite angles of an inscribed quadrilateral.', 'Their intercepted arcs make up the whole circle ($360^\\circ$), and each angle is half its arc, so the angles add to $180^\\circ$.', '$' + mang(askOpp) + ' = 180 - ' + a + ' = ' + deg(180 - a) + '$.'], hint: 'Opposite angles of an inscribed quadrilateral are supplementary.' }; }
    if (kind === 'alg') { var xv = R.int(5, 30), e1 = expr(R, xv, a, 2, 5), e2 = expr(R, xv, 180 - a, 1, 4), st = ['$' + ang('A') + '$ and $' + ang('C') + '$ are opposite angles of an inscribed quadrilateral, so they are supplementary.'].concat(sumSteps([e1, e2], 180, xv));
      st.push('$' + mang('A') + ' = ' + deg(a) + '$.');
      return { q: '$ABCD$ is inscribed in a circle. $' + mang('A') + ' = (' + e1.tex + ')^\\circ$ and $' + mang('C') + ' = (' + e2.tex + ')^\\circ$. Find $' + mang('A') + '$.', a: num(a), steps: st, hint: 'Add the opposite angles: 180°.' }; }
    if (kind === 'tf') { var f = R.pick([['Every rectangle can be inscribed in a circle.', true, 'Its opposite angles are $90^\\circ + 90^\\circ = 180^\\circ$. (Its diagonals are diameters.)'], ['A parallelogram that is not a rectangle can be inscribed in a circle.', false, 'Its opposite angles are equal but not $90^\\circ$, so they cannot add to $180^\\circ$.'], ['A rhombus that is not a square can be inscribed in a circle.', false, 'Its opposite angles are equal and not $90^\\circ$, so they do not add to $180^\\circ$.'], ['Every isosceles trapezoid can be inscribed in a circle.', true, 'Its base angles are equal and consecutive angles are supplementary, so opposite angles add to $180^\\circ$.'], ['A kite with two right angles opposite each other can be inscribed in a circle.', true, 'Those opposite right angles add to $180^\\circ$, so the other two do too.']]);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: ['A quadrilateral can be inscribed in a circle exactly when its opposite angles are supplementary.', f[2]], hint: 'Check whether opposite angles add to 180°.' }; }
    if (kind === 'arcs') { var arcBCD = 2 * R.int(40, 140);
      return { q: '$ABCD$ is inscribed in a circle, and the arc $' + arcT('BCD') + '$ (from $B$ through $C$ to $D$) measures $' + deg(arcBCD) + '$. Find $' + mang('A') + '$ and $' + mang('C') + '$.', a: { t: 'multi', parts: [{ label: '$' + mang('A') + ' =$', a: num(arcBCD / 2) }, { label: '$' + mang('C') + ' =$', a: num(180 - arcBCD / 2) }] },
        steps: ['$' + ang('A') + '$ is an inscribed angle that intercepts $' + arcT('BCD') + '$, so $' + mang('A') + ' = \\frac{1}{2} \\cdot ' + arcBCD + ' = ' + deg(arcBCD / 2) + '$.', '$' + ang('C') + '$ intercepts the rest of the circle, $360 - ' + arcBCD + ' = ' + (360 - arcBCD) + '^\\circ$, so $' + mang('C') + ' = ' + deg(180 - arcBCD / 2) + '$.', 'Check: $' + arcBCD / 2 + ' + ' + (180 - arcBCD / 2) + ' = 180$.'], hint: 'Angle A is half the arc it faces.' }; }
    var b = R.int(50, 130);
    return { q: '$ABCD$ is inscribed in a circle with $' + mang('A') + ' = ' + deg(a) + '$ and $' + mang('B') + ' = ' + deg(b) + '$. Find $' + mang('C') + '$ and $' + mang('D') + '$.', a: { t: 'multi', parts: [{ label: '$' + mang('C') + ' =$', a: num(180 - a) }, { label: '$' + mang('D') + ' =$', a: num(180 - b) }] },
      steps: ['Opposite angles are supplementary: $' + mang('C') + ' = 180 - ' + a + ' = ' + deg(180 - a) + '$ and $' + mang('D') + ' = 180 - ' + b + ' = ' + deg(180 - b) + '$.', 'Check: all four add to $360^\\circ$.'], hint: 'A pairs with C; B pairs with D.' };
  });

  var NICE_ANG = [30, 40, 45, 60, 72, 80, 90, 120, 135, 150, 160, 180, 200, 225, 240, 270, 300];
  G('geo.arc-length', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['len', 'len', 'diam'], ['diam', 'rev', 'rad', 'len'], ['rad', 'revr', 'radlen', 'rev']));
    var th = R.pick(NICE_ANG), r = R.int(2, 18), s = pq(th * 2 * r, 360);
    if (kind === 'len' || kind === 'diam') { var useD = kind === 'diam';
      return { q: 'A circle has ' + (useD ? 'diameter $' + 2 * r + '$' : 'radius $' + r + '$') + '. Find the length of an arc with central angle $' + deg(th) + '$. Give an exact answer in terms of $\\pi$.', a: pnum(s), viz: fig(cFig({ A: 0, B: th }, { segs: [['O', 'A'], ['O', 'B']], arcs: [['O', 'A', 'B', { color: 'red', lab: 's' }]], angs: [['A', 'O', 'B', { lab: th + '°', color: 'blue', r: 20 }]], nolab: ['A', 'B'] }), 'A circle with a central angle and its arc'),
        steps: (useD ? ['The radius is half the diameter: $r = ' + r + '$.'] : []).concat(['The arc is $\\dfrac{' + th + '}{360}$ of the whole circle, and the whole circumference is $2\\pi r = ' + 2 * r + '\\pi$.', '$s = \\dfrac{' + th + '}{360} \\cdot ' + 2 * r + '\\pi = ' + ptex(s) + '$.']), hint: 'Arc length = (angle/360) · 2πr.' }; }
    if (kind === 'rev') { return { q: 'An arc of a circle with radius $' + r + '$ has length $' + ptex(s) + '$. Find the measure of its central angle in degrees.', a: num(th),
      steps: ['$s = \\dfrac{\\theta}{360} \\cdot 2\\pi r$, so $' + ptex(s) + ' = \\dfrac{\\theta}{360} \\cdot ' + 2 * r + '\\pi$.', 'Divide by $' + 2 * r + '\\pi$: $\\dfrac{\\theta}{360} = ' + T.frac(th, 360) + '$.', '$\\theta = ' + deg(th) + '$.'], hint: 'What fraction of the circumference is the arc?' }; }
    if (kind === 'revr') { return { q: 'An arc with a central angle of $' + deg(th) + '$ has length $' + ptex(s) + '$. Find the radius.', a: num(r),
      steps: ['$' + ptex(s) + ' = \\dfrac{' + th + '}{360} \\cdot 2\\pi r = ' + ptex(pq(th, 180)) + ' r$.', '$r = ' + ptex(s) + ' \\div ' + ptex(pq(th, 180)) + ' = ' + r + '$.'], hint: 'Write the formula with r unknown and solve.' }; }
    if (kind === 'rad') { var rq = pq(th, 180);
      return { q: 'Convert $' + deg(th) + '$ to radians. Give an exact answer in terms of $\\pi$.', a: pnum(rq),
        steps: ['A full turn is $360^\\circ$ or $2\\pi$ radians, so $180^\\circ = \\pi$ radians.', '$' + th + '^\\circ = ' + th + ' \\cdot \\dfrac{\\pi}{180} = ' + ptex(rq) + '$.', th === 180 ? 'Check: a half turn is $\\pi$ radians.' : 'Check: $' + deg(th) + '$ is ' + (th < 180 ? 'less' : 'more') + ' than $180^\\circ$, so the answer is ' + (th < 180 ? 'less' : 'more') + ' than $\\pi$.'], hint: 'Multiply by π/180.' }; }
    var rq2 = pq(th, 180), s2 = pq(th * r, 180);
    return { q: 'A central angle of $' + ptex(rq2) + '$ radians cuts off an arc of a circle with radius $' + r + '$. Find the arc length. Give an exact answer.', a: pnum(s2),
      steps: ['In radians, arc length is $s = r\\theta$ (that is what a radian measures: arc length in units of the radius).', '$s = ' + r + ' \\cdot ' + ptex(rq2) + ' = ' + ptex(s2) + '$.'], hint: 's = rθ when θ is in radians.' };
  });

  G('geo.sector-area', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['area', 'area', 'both'], ['both', 'rev', 'area'], ['rad', 'revr', 'segment', 'both']));
    var th = R.pick(NICE_ANG), r = R.int(2, 15), A = pq(th * r * r, 360);
    if (kind === 'area') return { q: 'Find the area of a sector of a circle with radius $' + r + '$ and central angle $' + deg(th) + '$. Give an exact answer in terms of $\\pi$.', a: pnum(A), viz: { name: 'geo-circle', opts: { mode: 'sector', r: r, deg: th, nums: false }, label: 'A sector of a circle' },
      steps: ['The sector is $\\dfrac{' + th + '}{360}$ of the circle, and the circle\'s area is $\\pi r^2 = ' + r * r + '\\pi$.', 'Area $= \\dfrac{' + th + '}{360} \\cdot ' + r * r + '\\pi = ' + ptex(A) + '$.'], hint: 'Sector area = (angle/360) · πr².' };
    if (kind === 'both') { var s = pq(th * 2 * r, 360);
      return { q: 'A sector has radius $' + r + '$ and central angle $' + deg(th) + '$. Find its arc length and its area, in terms of $\\pi$.', a: { t: 'multi', parts: [{ label: 'Arc length:', a: pnum(s) }, { label: 'Area:', a: pnum(A) }] },
        steps: ['Both use the same fraction of the circle: $\\dfrac{' + th + '}{360}' + (U.gcd(th, 360) > 1 ? ' = ' + T.frac(th, 360) : '') + '$.', 'Arc length (a length, along the edge): $' + T.frac(th, 360) + ' \\cdot 2\\pi \\cdot ' + r + ' = ' + ptex(s) + '$.', 'Area (square units, the space inside): $' + T.frac(th, 360) + ' \\cdot \\pi \\cdot ' + r + '^2 = ' + ptex(A) + '$.'], hint: 'Circumference uses 2πr; area uses πr².' }; }
    if (kind === 'rev') return { q: 'A sector of a circle with radius $' + r + '$ has area $' + ptex(A) + '$. Find its central angle in degrees.', a: num(th),
      steps: ['$\\dfrac{\\theta}{360} \\cdot \\pi \\cdot ' + r * r + ' = ' + ptex(A) + '$.', 'Divide by $' + r * r + '\\pi$: $\\dfrac{\\theta}{360} = ' + T.frac(th, 360) + '$, so $\\theta = ' + deg(th) + '$.'], hint: 'What fraction of the whole circle is the sector?' };
    if (kind === 'revr') return { q: 'A sector with central angle $' + deg(th) + '$ has area $' + ptex(A) + '$. Find the radius.', a: num(r),
      steps: ['$\\dfrac{' + th + '}{360} \\pi r^2 = ' + ptex(A) + '$.', 'Multiply by $\\dfrac{360}{' + th + '\\pi}$: $r^2 = ' + r * r + '$, so $r = ' + r + '$.'], hint: 'Solve for r², then take the square root.' };
    if (kind === 'rad') { var tq2 = pq(th, 180), A2 = pq(th * r * r, 360);
      return { q: 'Find the area of a sector with radius $' + r + '$ and central angle $' + ptex(tq2) + '$ radians. Give an exact answer.', a: pnum(A2),
        steps: ['In radians the full circle is $2\\pi$, so the sector is $\\dfrac{\\theta}{2\\pi}$ of the circle: area $= \\dfrac{\\theta}{2\\pi} \\cdot \\pi r^2 = \\frac{1}{2} r^2 \\theta$.', 'Area $= \\frac{1}{2} \\cdot ' + r * r + ' \\cdot ' + ptex(tq2) + ' = ' + ptex(A2) + '$.'], hint: 'Area = ½ r² θ in radians.' }; }
    var r2 = 2 * R.int(1, 7), qa = pq(r2 * r2, 4), tri2 = r2 * r2 / 2;
    return { q: 'A $90^\\circ$ sector of a circle with radius $' + r2 + '$ is cut by the chord joining the ends of its arc. Find the area of the region between the chord and the arc (a circular segment). Give an exact answer.', a: { t: 'num', v: pplain(qa) + ' - ' + tri2 },
      steps: ['Sector area: $\\dfrac{90}{360} \\cdot \\pi \\cdot ' + r2 + '^2 = ' + ptex(qa) + '$.', 'The triangle formed by the two radii is a right triangle: area $\\frac{1}{2} \\cdot ' + r2 + ' \\cdot ' + r2 + ' = ' + tri2 + '$.', 'Segment $=$ sector $-$ triangle $= ' + ptex(qa) + ' - ' + tri2 + '$.'], hint: 'Subtract the triangle from the sector.' };
  });

  function sq(v, c) { return c === 0 ? v + '^2' : '(' + v + T.signed(-c) + ')^2'; }
  function circEq(h, k, r2) { return sq('x', h) + ' + ' + sq('y', k) + ' = ' + r2; }
  function circPlain(h, k, r2) { return '(x' + (h ? (h > 0 ? '-' : '+') + M.abs(h) : '') + ')^2+(y' + (k ? (k > 0 ? '-' : '+') + M.abs(k) : '') + ')^2=' + r2; }
  G('geo.circle-equation', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['write', 'read', 'write'], ['read', 'point', 'pos', 'sign'], ['diam', 'point', 'read', 'pos']));
    var h = R.int(-8, 8), k = R.int(-8, 8), r = R.int(1, 10);
    if (kind === 'write') return { q: 'Write an equation of the circle with center $' + pt([h, k]) + '$ and radius $' + r + '$.', a: { t: 'eq', v: circPlain(h, k, r * r) }, nolint: ['+ 0'],
      steps: ['A point $(x, y)$ is on the circle when its distance from the center is $' + r + '$: $\\sqrt{(x' + T.signed(-h) + ')^2 + (y' + T.signed(-k) + ')^2} = ' + r + '$.', 'Square both sides: $' + circEq(h, k, r * r) + '$.'], hint: '(x − h)² + (y − k)² = r².' };
    if (kind === 'read' || kind === 'sign') { var rr = (ctx.level || 1) >= 2 && R.chance(0.4) ? R.pick([2, 3, 5, 6, 7, 8, 10, 12, 18, 20, 27, 32, 45, 50]) : r * r, rv = sqrtN(rr);
      return { q: 'Find the center and radius of the circle $' + circEq(h, k, rr) + '$.', a: { t: 'multi', parts: [{ label: 'Center:', a: { t: 'tuple', v: [String(h), String(k)] } }, { label: 'Radius:', a: rnum(rv) }] }, nolint: ['+ 0'],
        steps: ['Match the form $(x - h)^2 + (y - k)^2 = r^2$.', (h < 0 ? '$x' + T.signed(-h) + '$ means $x - (' + h + ')$' : '$x' + T.signed(-h) + '$ gives') + ', so $h = ' + h + '$; ' + (k < 0 ? '$y' + T.signed(-k) + '$ means $y - (' + k + ')$' : '$y' + T.signed(-k) + '$ gives') + ', so $k = ' + k + '$. Center: $' + pt([h, k]) + '$.', '$r^2 = ' + rr + '$, so $r = \\sqrt{' + rr + '}' + (rv.r !== rr ? ' = ' + rtex(rv) : '') + '$. (The right side is $r^2$, not $r$.)'], hint: 'The signs inside the parentheses are the opposite of the center\'s coordinates.' }; }
    if (kind === 'point') { var P = [h + R.nz(-6, 6), k + R.nz(-6, 6)], r2 = dist2([h, k], P);
      return { q: 'A circle has center $' + pt([h, k]) + '$ and passes through $' + pt(P) + '$. Write its equation.', a: { t: 'eq', v: circPlain(h, k, r2) }, nolint: ['+ 0'],
        steps: ['The radius is the distance from the center to the point: $r^2 = (' + P[0] + T.signed(-h) + ')^2 + (' + P[1] + T.signed(-k) + ')^2 = ' + r2 + '$.', 'Equation: $' + circEq(h, k, r2) + '$.'], hint: 'You only need r², so skip the square root.' }; }
    if (kind === 'diam') { var A = [h - R.nz(-5, 5), k - R.nz(-5, 5)], B = [2 * h - A[0], 2 * k - A[1]], r3 = dist2([h, k], A);
      return { q: 'The endpoints of a diameter of a circle are $' + pt(A) + '$ and $' + pt(B) + '$. Write the equation of the circle.', a: { t: 'eq', v: circPlain(h, k, r3) }, nolint: ['+ 0'],
        steps: ['The center is the midpoint of the diameter: $' + pt([h, k]) + '$.', '$r^2$ is the squared distance from the center to an endpoint: $(' + A[0] + T.signed(-h) + ')^2 + (' + A[1] + T.signed(-k) + ')^2 = ' + r3 + '$.', 'Equation: $' + circEq(h, k, r3) + '$.'], hint: 'Find the center (midpoint) first.' }; }
    var P2 = [h + R.int(-6, 6), k + R.int(-6, 6)], d2 = dist2([h, k], P2), rr2 = R.pick([d2, d2 + R.int(1, 8), M.max(1, d2 - R.int(1, 8))]), where = d2 < rr2 ? 'Inside the circle' : d2 === rr2 ? 'On the circle' : 'Outside the circle';
    return { q: 'Is the point $' + pt(P2) + '$ inside, on, or outside the circle $' + circEq(h, k, rr2) + '$?', a: { t: 'mc', choices: ['Inside the circle', 'On the circle', 'Outside the circle'], v: ['Inside the circle', 'On the circle', 'Outside the circle'].indexOf(where), keep: true }, nolint: ['+ 0'],
      steps: ['Compare the squared distance from the center with $r^2 = ' + rr2 + '$.', '$(' + P2[0] + T.signed(-h) + ')^2 + (' + P2[1] + T.signed(-k) + ')^2 = ' + d2 + '$.', d2 < rr2 ? '$' + d2 + ' < ' + rr2 + '$: inside.' : d2 === rr2 ? '$' + d2 + ' = ' + rr2 + '$: on the circle.' : '$' + d2 + ' > ' + rr2 + '$: outside.'], hint: 'Substitute the point into the left side.' };
  });

  G('geo.circle-completing-square', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['one', 'both', 'both'], ['both', 'both', 'fix'], ['both', 'lead', 'fix']));
    var h = R.nz(-7, 7), k = kind === 'one' ? 0 : R.nz(-7, 7), lv = ctx.level || 1, r2 = lv >= 2 && R.chance(0.35) ? R.pick([2, 3, 5, 6, 7, 8, 10, 12, 13, 18, 20]) : M.pow(R.int(1, 9), 2);
    var D = -2 * h, E = -2 * k, F = h * h + k * k - r2, rv = sqrtN(r2);
    var eqTex = 'x^2 + y^2' + T.coef(D, 'x', false) + T.coef(E, 'y', false) + T.signed(F) + ' = 0';
    if (kind === 'fix') { var sx = h * h, sy = k * k;
      return { q: 'To write $' + eqTex + '$ in center-radius form, Ana grouped the terms, $(x^2' + T.coef(D, 'x', false) + ') + (y^2' + T.coef(E, 'y', false) + ') = ' + (-F) + '$, and added $' + sx + '$ and $' + sy + '$ inside the parentheses to complete the squares. What must the right side become?', a: num(-F + sx + sy),
        steps: ['Adding $' + sx + '$ and $' + sy + '$ on the left changes the equation, so the same amounts must be added on the right.', '$' + (-F) + ' + ' + sx + ' + ' + sy + ' = ' + (-F + sx + sy) + '$, giving $' + circEq(h, k, r2) + '$.'], hint: 'Whatever you add to one side, add to the other.', nolint: ['+ 0'] }; }
    var lead = kind === 'lead' ? R.int(2, 3) : 1, shown = lead === 1 ? eqTex : T.mono(lead, 'x^2') + ' + ' + T.mono(lead, 'y^2') + T.coef(lead * D, 'x', false) + T.coef(lead * E, 'y', false) + T.signed(lead * F) + ' = 0';
    return { q: 'Find the center and radius of the circle $' + shown + '$.', a: { t: 'multi', parts: [{ label: 'Center:', a: { t: 'tuple', v: [String(h), String(k)] } }, { label: 'Radius:', a: rnum(rv) }] }, nolint: ['+ 0'],
      steps: (lead > 1 ? ['Divide every term by $' + lead + '$: $' + eqTex + '$.'] : []).concat(['Group and move the constant: $(x^2' + T.coef(D, 'x', false) + ')' + (k !== 0 ? ' + (y^2' + T.coef(E, 'y', false) + ')' : ' + y^2') + ' = ' + (-F) + '$.', 'Complete each square: half of $' + D + '$ is $' + (D / 2) + '$, and $' + T.p(D / 2) + '^2 = ' + h * h + '$' + (k !== 0 ? '; half of $' + E + '$ is $' + (E / 2) + '$, and $' + T.p(E / 2) + '^2 = ' + k * k + '$' : '') + '. Add these to both sides.', '$' + circEq(h, k, r2) + '$, because $' + (-F) + ' + ' + h * h + (k !== 0 ? ' + ' + k * k : '') + ' = ' + r2 + '$.', 'Center $' + pt([h, k]) + '$, radius $\\sqrt{' + r2 + '}' + (rv.r !== r2 ? ' = ' + rtex(rv) : '') + '$.']), hint: 'Take half of each linear coefficient and square it, adding the result to both sides.' };
  });

  G('geo.parabola-focus-directrix', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['origin', 'dist', 'origin'], ['shift', 'focus', 'dist'], ['shift', 'side', 'focus', 'dir']));
    var p = R.pick([1, 2, 3, 4, 5, -1, -2, -3, '1/2', '-1/2', '1/4', '3/2', 6, -4, -5, '5/2', '-3/2', '-1/4', '3/4', 8]), pq2 = ML.Q.from(p), fourp = pq2.mul(4);
    if (kind === 'origin') return { q: 'Write an equation of the parabola with focus $' + T.pt(['0', pq2.toPlain()]) + '$ and directrix $y = ' + pq2.neg().toTex() + '$.', a: { t: 'eq', v: 'x^2 = ' + fourp.toPlain() + '*y' }, viz: { name: 'parabola', opts: { quiet: true, form: 'vertex', a: ML.Q(1).div(fourp).toNumber(), h: 0, k: 0, show: ['vertex', 'focus'], xmin: -8, xmax: 8, ymin: -8, ymax: 8 }, label: 'The parabola with its focus and directrix' },
      steps: ['A point $(x, y)$ is on the parabola when it is the same distance from the focus and from the directrix.', 'Distance to the focus: $\\sqrt{x^2 + (y' + T.signed(pq2.neg()) + ')^2}$. Distance to the directrix: $\\left|y' + T.signed(pq2) + '\\right|$.', 'Square and set equal: $x^2 + (y' + T.signed(pq2.neg()) + ')^2 = (y' + T.signed(pq2) + ')^2$.', 'Expand both sides; $y^2$ and the constant cancel, leaving $x^2 = 4py$ with $p = ' + pq2.toTex() + '$.', 'So $x^2 = ' + T.coef(fourp, 'y') + '$.'], hint: 'For focus (0, p) and directrix y = −p, the parabola is x² = 4py.', nolint: ['--', '+ -'] };
    var h = R.int(-9, 9), k = R.int(-9, 9);
    if (kind === 'shift') { var fy = pq2.add(k), dy = pq2.neg().add(k);
      return { q: 'Write an equation of the parabola with focus $' + T.pt([String(h), fy.toPlain()]) + '$ and directrix $y = ' + dy.toTex() + '$.', a: { t: 'eq', v: '(x' + (h ? (h > 0 ? '-' : '+') + M.abs(h) : '') + ')^2 = ' + fourp.toPlain() + '*(y' + (k ? (k > 0 ? '-' : '+') + M.abs(k) : '') + ')' }, nolint: ['+ 0'],
        steps: ['The vertex is halfway between the focus and the directrix: $' + pt([h, k]) + '$.', '$p$ is the distance from the vertex up to the focus (negative if the focus is below): $p = ' + fy.toTex() + ' - ' + T.p(k) + ' = ' + pq2.toTex() + '$.', 'Equation: $' + sq('x', h) + ' = 4p' + (k === 0 ? 'y' : '(y' + T.signed(-k) + ')') + ' = ' + T.coef(fourp, k === 0 ? 'y' : '(y' + T.signed(-k) + ')') + '$.'], hint: 'Find the vertex and p first: (x − h)² = 4p(y − k).' }; }
    if (kind === 'focus' || kind === 'dir') { var fy2 = pq2.add(k), dy2 = pq2.neg().add(k), eqT = sq('x', h).replace('^2', '^2') + ' = ' + T.coef(fourp, k === 0 ? 'y' : '(y' + T.signed(-k) + ')');
      if (kind === 'focus') return { q: 'Find the focus of the parabola $' + eqT + '$.', a: { t: 'tuple', v: [String(h), fy2.toPlain()] }, nolint: ['+ 0'],
        steps: ['Match $(x - h)^2 = 4p(y - k)$: the vertex is $' + pt([h, k]) + '$ and $4p = ' + fourp.toTex() + '$, so $p = ' + pq2.toTex() + '$.', 'The focus is $p$ units ' + (pq2.sign() > 0 ? 'above' : 'below') + ' the vertex: $' + T.pt([String(h), fy2.toPlain()]) + '$.'], hint: 'Find p from 4p, then move from the vertex.' };
      return { q: 'Find the directrix of the parabola $' + eqT + '$.', a: { t: 'eq', v: 'y = ' + dy2.toPlain() }, nolint: ['+ 0'],
        steps: ['Vertex $' + pt([h, k]) + '$ and $4p = ' + fourp.toTex() + '$, so $p = ' + pq2.toTex() + '$.', 'The directrix is the horizontal line $p$ units on the other side of the vertex: $y = ' + T.num(k) + ' - ' + T.p(pq2.toTex()) + ' = ' + dy2.toTex() + '$.'], hint: 'The directrix is as far from the vertex as the focus, on the opposite side.' }; }
    if (kind === 'side') { var pi = R.pick([1, 2, 3, -1, -2, 4, -3, 5]);
      return { q: 'Write an equation of the parabola with focus $' + pt([pi, 0]) + '$ and directrix $x = ' + (-pi) + '$.', a: { t: 'eq', v: 'y^2 = ' + 4 * pi + '*x' },
        steps: ['Points on the parabola are equally far from $' + pt([pi, 0]) + '$ and from the vertical line $x = ' + (-pi) + '$.', '$(x' + T.signed(-pi) + ')^2 + y^2 = (x' + T.signed(pi) + ')^2$.', 'Expand and simplify: $y^2 = ' + 4 * pi + 'x$. (The parabola opens ' + (pi > 0 ? 'right' : 'left') + ', toward the focus.)'], hint: 'Here the roles of x and y switch: y² = 4px.' }; }
    var pp = R.int(1, 6), x0 = 2 * pp * R.nz(-4, 4), y0 = x0 * x0 / (4 * pp), dd = y0 + pp;
    return { q: 'The parabola $x^2 = ' + 4 * pp + 'y$ has focus $(0, ' + pp + ')$ and directrix $y = ' + (-pp) + '$. The point $' + pt([x0, y0]) + '$ is on it. How far is this point from the focus?', a: num(dd),
      steps: ['Every point on a parabola is the same distance from the focus as from the directrix.', 'The distance from $' + pt([x0, y0]) + '$ down to the line $y = ' + (-pp) + '$ is $' + y0 + ' - ' + T.p(-pp) + ' = ' + dd + '$.', 'So the distance to the focus is also $' + dd + '$. Check: $\\sqrt{' + T.p(x0) + '^2 + (' + y0 + ' - ' + pp + ')^2} = \\sqrt{' + (x0 * x0 + (y0 - pp) * (y0 - pp)) + '} = ' + dd + '$.'], hint: 'Use the directrix: its distance is easy.' };
  });

  /* ================================================================ Unit: Area, Volume and Modeling */

  function hexFig() { var o = { pts: { O: [0, 0] }, polys: [['A', 'B', 'C', 'D', 'E', 'F', { fill: 'blue' }]], segs: [], angs: [], nolab: ['A', 'B', 'C', 'D', 'E', 'F', 'M'], height: 220 };
    for (var i = 0; i < 6; i++) { var n = 'ABCDEF'[i]; o.pts[n] = [3 * cosD(60 * i), 3 * sinD(60 * i)]; o.segs.push(['O', n, { dash: 1, color: 'muted', w: 1.5 }]); }
    o.pts.M = mid(o.pts.A, o.pts.B); o.segs.push(['O', 'M', { color: 'red', lab: 'apothem' }]); o.angs.push(['O', 'M', 'B', { right: 1 }]);
    return fig(o, 'A regular hexagon split into six equilateral triangles, with the apothem drawn'); }
  function qdec(q) { var s = q.toDec(4); return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
  G('geo.regular-polygon-area', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['given', 'square', 'given'], ['hex', 'tri', 'given'], ['hexap', 'calc', 'hex', 'tri']));
    if (kind === 'given') { var n = R.pick([5, 6, 8, 10]), s = R.int(3, 40), ratio = { 5: 0.688, 6: 0.866, 8: 1.207, 10: 1.539 }[n], a = U.round(s * ratio, 1), P = n * s, A = ML.Q.from(a).mul(P).div(2);
      return { q: 'A regular ' + pname(n) + ' has side length $' + s + '$ cm and apothem $' + T.num(a) + '$ cm. Find its area.', a: num(qdec(A)),
        steps: ['Cut the polygon into ' + n + ' congruent triangles from the center. Each has base $' + s + '$ (a side) and height $' + T.num(a) + '$ (the apothem).', 'Area $= ' + n + ' \\cdot \\frac{1}{2} \\cdot ' + s + ' \\cdot ' + T.num(a) + '$, which is $\\frac{1}{2} \\cdot \\text{apothem} \\cdot \\text{perimeter}$.', 'Perimeter $= ' + n + ' \\cdot ' + s + ' = ' + P + '$, so area $= \\frac{1}{2} \\cdot ' + T.num(a) + ' \\cdot ' + P + ' = ' + A.toTex() + '$ cm$^2$.'], hint: 'Area = ½ · apothem · perimeter.' }; }
    if (kind === 'square') { var ap = R.int(2, 25);
      return { q: 'A square has an apothem (the distance from its center to a side) of $' + ap + '$. Use $A = \\frac{1}{2}aP$ to find its area.', a: num(4 * ap * ap),
        steps: ['The apothem of a square is half its side, so the side is $' + 2 * ap + '$ and the perimeter is $' + 8 * ap + '$.', '$A = \\frac{1}{2} \\cdot ' + ap + ' \\cdot ' + 8 * ap + ' = ' + 4 * ap * ap + '$.', 'Check: $' + 2 * ap + '^2 = ' + 4 * ap * ap + '$.'], hint: 'Find the side and the perimeter first.' }; }
    var s2 = R.int(2, 24);
    if (kind === 'hex') { var A2 = rad(3 * s2 * s2, 2, 3);
      return { q: 'Find the area of a regular hexagon with side length $' + s2 + '$. Give an exact answer.', a: rnum(A2), viz: hexFig(),
        steps: ['A regular hexagon is six equilateral triangles with side $' + s2 + '$.', 'The apothem is the height of one of them: $\\frac{' + s2 + '\\sqrt{3}}{2}$ (the longer leg of a $30$-$60$-$90$ triangle with short leg $' + T.num(s2 / 2) + '$).', 'Area $= \\frac{1}{2} \\cdot \\text{apothem} \\cdot \\text{perimeter}$, so area $= \\frac{1}{2} \\cdot \\frac{' + s2 + '\\sqrt{3}}{2} \\cdot ' + 6 * s2 + ' = ' + rtex(A2) + '$.'], hint: 'The apothem is the height of an equilateral triangle with side ' + s2 + '.' }; }
    if (kind === 'tri') { var A3 = rad(s2 * s2, 4, 3);
      return { q: 'Find the area of an equilateral triangle with side length $' + s2 + '$. Give an exact answer.', a: rnum(A3),
        steps: ['The height splits it into two $30$-$60$-$90$ triangles, so the height is $\\frac{' + s2 + '\\sqrt{3}}{2}$.', 'Area $= \\frac{1}{2} \\cdot ' + s2 + ' \\cdot \\frac{' + s2 + '\\sqrt{3}}{2} = \\frac{\\sqrt{3}}{4} \\cdot ' + s2 * s2 + ' = ' + rtex(A3) + '$.'], hint: 'Find the height with a 30-60-90 triangle.' }; }
    if (kind === 'hexap') { var k = R.int(1, 15), A4 = rad(6 * k * k, 1, 3);
      return { q: 'A regular hexagon has an apothem of $' + rtex(rad(k, 1, 3)) + '$. Find its area. Give an exact answer.', a: rnum(A4),
        steps: ['The apothem is the longer leg of a $30$-$60$-$90$ triangle whose shorter leg is half a side. Shorter leg $= \\frac{' + rtex(rad(k, 1, 3)) + '}{\\sqrt{3}} = ' + k + '$, so a side is $' + 2 * k + '$.', 'Perimeter $= 6 \\cdot ' + 2 * k + ' = ' + 12 * k + '$.', 'Area $= \\frac{1}{2} \\cdot ' + rtex(rad(k, 1, 3)) + ' \\cdot ' + 12 * k + ' = ' + rtex(A4) + '$.'], hint: 'Find the side from the apothem first.' }; }
    var n2 = R.pick([5, 7, 8, 9, 10, 12]), s3 = R.int(3, 15), apo = s3 / (2 * tanD(180 / n2)), A5 = 0.5 * apo * n2 * s3;
    return { q: 'Find the area of a regular ' + pname(n2) + ' with side length $' + s3 + '$, to the nearest tenth.', a: tol(A5),
      steps: ['From the center, each side subtends $' + T.num(U.round(360 / n2, 2)) + '^\\circ$; half of that is $' + T.num(U.round(180 / n2, 2)) + '^\\circ$.', 'The apothem is adjacent to that half-angle, with half a side ($' + T.num(s3 / 2) + '$) opposite: $a = \\dfrac{' + T.num(s3 / 2) + '}{\\tan ' + T.num(U.round(180 / n2, 2)) + '^\\circ} \\approx ' + dec(apo, 3) + '$.', 'Area $= \\frac{1}{2} a P \\approx \\frac{1}{2} \\cdot ' + dec(apo, 3) + ' \\cdot ' + n2 * s3 + ' \\approx ' + dec(A5, 1) + '$.'], hint: 'Find the apothem with tangent, then use ½aP.' };
  });

  function shoelace(P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return M.abs(s) / 2; }
  G('geo.coordinate-area-perimeter', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['rect', 'rtri', 'rtri'], ['box', 'per', 'rtri'], ['per', 'quad', 'box']));
    var x0 = R.int(-6, 2), y0 = R.int(-6, 2);
    if (kind === 'rect') { var w = R.int(2, 8), h = R.int(2, 7), P = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], askA = R.coin(), o = { pts: { A: P[0], B: P[1], C: P[2], D: P[3] }, polys: [['A', 'B', 'C', 'D', { fill: 'blue' }]], axes: true, height: 250 };
      return { q: 'Rectangle $ABCD$ has vertices $A' + pt(P[0]) + '$, $B' + pt(P[1]) + '$, $C' + pt(P[2]) + '$, $D' + pt(P[3]) + '$. Find its ' + (askA ? 'area' : 'perimeter') + '.', a: num(askA ? w * h : 2 * (w + h)), viz: fig(o, 'Rectangle ABCD on a grid'),
        steps: ['$AB$ is horizontal: its length is $|' + P[1][0] + ' - ' + T.p(P[0][0]) + '| = ' + w + '$. $BC$ is vertical: $|' + P[2][1] + ' - ' + T.p(P[1][1]) + '| = ' + h + '$.', askA ? 'Area $= ' + w + ' \\cdot ' + h + ' = ' + w * h + '$.' : 'Perimeter $= 2(' + w + ' + ' + h + ') = ' + 2 * (w + h) + '$.'], hint: 'Count along the grid lines.' }; }
    if (kind === 'rtri') { var tr = R.pick([[3, 4], [4, 3], [6, 8], [5, 12], [8, 6], [12, 5]]), sx = R.sign(), sy = R.sign(), P2 = [[x0 + 3, y0 + 3], [x0 + 3 + sx * tr[0], y0 + 3], [x0 + 3, y0 + 3 + sy * tr[1]]], askA2 = R.coin(), hyp = M.sqrt(tr[0] * tr[0] + tr[1] * tr[1]);
      var o2 = { pts: { A: P2[0], B: P2[1], C: P2[2] }, polys: [['A', 'B', 'C', { fill: 'blue' }]], angs: [['B', 'A', 'C', { right: 1 }]], axes: true, height: 260 };
      return { q: 'Find the ' + (askA2 ? 'area' : 'perimeter') + ' of the triangle with vertices $A' + pt(P2[0]) + '$, $B' + pt(P2[1]) + '$ and $C' + pt(P2[2]) + '$.', a: num(askA2 ? tr[0] * tr[1] / 2 : tr[0] + tr[1] + hyp), viz: fig(o2, 'A right triangle on a grid'),
        steps: ['$' + seg('AB') + '$ is horizontal with length $' + tr[0] + '$ and $' + seg('AC') + '$ is vertical with length $' + tr[1] + '$, so the right angle is at $A$.', askA2 ? 'Area $= \\frac{1}{2} \\cdot ' + tr[0] + ' \\cdot ' + tr[1] + ' = ' + tr[0] * tr[1] / 2 + '$.' : '$BC = \\sqrt{' + tr[0] + '^2 + ' + tr[1] + '^2} = ' + hyp + '$, so the perimeter is $' + tr[0] + ' + ' + tr[1] + ' + ' + hyp + ' = ' + (tr[0] + tr[1] + hyp) + '$.'], hint: askA2 ? 'The legs are along grid lines.' : 'Use the distance formula for the slanted side.' }; }
    if (kind === 'box' || kind === 'quad') {
      var P3, ok = false;
      for (var t = 0; t < 200 && !ok; t++) { P3 = kind === 'box' ? [[R.int(-5, 5), R.int(-5, 5)], [R.int(-5, 5), R.int(-5, 5)], [R.int(-5, 5), R.int(-5, 5)]] : [[R.int(-6, -1), R.int(-5, 0)], [R.int(1, 6), R.int(-6, -1)], [R.int(2, 6), R.int(1, 6)], [R.int(-5, 0), R.int(1, 5)]]; ok = shoelace(P3) >= 4; }
      var A = shoelace(P3), xs = P3.map(function (p) { return p[0]; }), ys = P3.map(function (p) { return p[1]; }), bw = M.max.apply(null, xs) - M.min.apply(null, xs), bh = M.max.apply(null, ys) - M.min.apply(null, ys);
      var N = kind === 'box' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'], o3 = { pts: {}, polys: [N.concat([{ fill: 'blue' }])], axes: true, height: 260 }; N.forEach(function (n2, i) { o3.pts[n2] = P3[i]; });
      return { q: 'Find the area of the ' + (kind === 'box' ? 'triangle' : 'quadrilateral') + ' with vertices ' + N.map(function (n2, i) { return '$' + n2 + pt(P3[i]) + '$'; }).join(', ') + '.', a: num(A), viz: fig(o3, 'A polygon on a coordinate grid'),
        steps: ['Box method: the smallest rectangle around the figure is $' + bw + '$ by $' + bh + '$, with area $' + bw * bh + '$.', 'Subtract the right triangles (and rectangles) between the figure and the box; they have $' + T.num(bw * bh - A) + '$ square units in all.', 'Area $= ' + bw * bh + ' - ' + T.num(bw * bh - A) + ' = ' + T.num(A) + '$.', 'Check with the shoelace formula: half of $|\\sum (x_i y_{i+1} - x_{i+1} y_i)|$ gives $' + T.num(A) + '$ too.'], hint: 'Put a rectangle around the figure and subtract the corner pieces.' }; }
    var Q3; do { Q3 = [[R.int(-5, 5), R.int(-5, 5)], [R.int(-5, 5), R.int(-5, 5)], [R.int(-5, 5), R.int(-5, 5)]]; } while (shoelace(Q3) < 3);
    var d = [dist2(Q3[0], Q3[1]), dist2(Q3[1], Q3[2]), dist2(Q3[2], Q3[0])], parts = d.map(sqrtN), ints = 0, rads = {};
    parts.forEach(function (p2) { if (p2.r === 1) ints += p2.n; else rads[p2.r] = (rads[p2.r] || 0) + p2.n; });
    var terms = []; Object.keys(rads).sort(function (x, y) { return x - y; }).forEach(function (r) { terms.push([rads[r], '\\sqrt{' + r + '}']); }); if (ints) terms.push([ints, '']);
    var plain = Object.keys(rads).map(function (r) { return (rads[r] === 1 ? '' : rads[r] + '*') + 'sqrt(' + r + ')'; }).concat(ints ? [String(ints)] : []).join('+');
    return { q: 'Find the perimeter of the triangle with vertices $A' + pt(Q3[0]) + '$, $B' + pt(Q3[1]) + '$ and $C' + pt(Q3[2]) + '$. Give an exact answer.', a: { t: 'num', v: plain },
      steps: ['Use the distance formula on each side.', '$AB = \\sqrt{' + d[0] + '} = ' + rtex(parts[0]) + '$, $BC = \\sqrt{' + d[1] + '} = ' + rtex(parts[1]) + '$, $CA = \\sqrt{' + d[2] + '} = ' + rtex(parts[2]) + '$.', 'Add, combining like radicals: $' + T.terms(terms) + '$.'], hint: 'Find all three side lengths, simplify each radical, then add.', chk: { tri: Q3 } };
  });

  G('geo.cavalieri', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['ocyl', 'oprism', 'tf'], ['coins', 'ocyl', 'tf', 'oprism'], ['match', 'coins', 'tf', 'ocyl']));
    if (kind === 'ocyl') { var r = R.int(2, 9), h = R.int(3, 15), sl = h + R.int(2, 6);
      return { q: 'An oblique (leaning) cylinder has radius $' + r + '$ cm and vertical height $' + h + '$ cm. Its slanted side is $' + sl + '$ cm long. Find its volume in terms of $\\pi$.', a: pnum(pq(r * r * h)), viz: { name: 'geo-cavalieri', opts: { shape: 'coins', r: 3, h: 8, lean: 0.5, nums: false }, label: 'An upright and a leaning stack of coins' },
        steps: ['Slice the cylinder into thin coins. Leaning it slides the coins but does not change any of them.', 'By Cavalieri\'s principle it has the same volume as an upright cylinder with the same base and the same vertical height.', '$V = Bh = \\pi \\cdot ' + r + '^2 \\cdot ' + h + ' = ' + ptex(pq(r * r * h)) + '$ cm$^3$. The slanted length $' + sl + '$ is not the height.'], hint: 'Use the vertical height, not the slanted side.' }; }
    if (kind === 'oprism') { var l = R.int(2, 10), w = R.int(2, 8), h2 = R.int(3, 12), e = h2 + R.int(1, 5);
      return { q: 'An oblique prism has a rectangular base $' + l + '$ in by $' + w + '$ in. Its vertical height is $' + h2 + '$ in, and each slanted edge is $' + e + '$ in long. Find its volume.', a: num(l * w * h2),
        steps: ['Every horizontal slice is a $' + l + '$ by $' + w + '$ rectangle, just like in a right prism of the same height.', 'Cavalieri\'s principle: same cross-sections at every height and same height, so same volume.', '$V = Bh = ' + l + ' \\cdot ' + w + ' \\cdot ' + h2 + ' = ' + l * w * h2 + '$ in$^3$.'], hint: 'Volume = base area × perpendicular height.' }; }
    if (kind === 'tf') { var f = R.pick([['Two solids with the same height and the same cross-sectional area at every height have the same volume.', true, 'That is Cavalieri\'s principle.'], ['Leaning a stack of coins changes its volume.', false, 'Each coin keeps its size, so the total volume stays the same.'], ['Two solids with the same base area always have the same volume.', false, 'Their heights (and the slices above the base) can differ.'], ['An oblique cylinder has a greater volume than a right cylinder with the same base and height.', false, 'By Cavalieri\'s principle their volumes are equal.'], ['A cone and a pyramid with the same base area and the same height have the same volume.', true, 'At every height their slices are scaled the same way from equal bases, so their areas match.']]);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2]], hint: 'Think about slicing both solids at the same height.' }; }
    if (kind === 'coins') { var cr = R.int(8, 15), t = R.int(1, 3), n = R.int(10, 40);
      return { q: 'A stack of $' + n + '$ coins, each with radius $' + cr + '$ mm and thickness $' + t + '$ mm, leans to one side. Find the volume of the stack in terms of $\\pi$.', a: pnum(pq(cr * cr * t * n)),
        steps: ['Each coin is a short cylinder: $V = \\pi \\cdot ' + cr + '^2 \\cdot ' + t + ' = ' + ptex(pq(cr * cr * t)) + '$ mm$^3$.', 'Leaning does not change any coin, so the total is $' + n + ' \\cdot ' + ptex(pq(cr * cr * t)) + ' = ' + ptex(pq(cr * cr * t * n)) + '$ mm$^3$.'], hint: 'Add up the coins; the lean does not matter.' }; }
    var r2 = R.int(2, 8), h3 = R.int(3, 12);
    return { q: 'A cylinder has radius $' + r2 + '$ and height $' + h3 + '$. A prism has the same height. What base area must the prism have so that, at every height, its cross-sections have the same area as the cylinder\'s? Give an exact answer.', a: pnum(pq(r2 * r2)),
      steps: ['Every horizontal slice of the cylinder is a circle of area $\\pi \\cdot ' + r2 + '^2 = ' + ptex(pq(r2 * r2)) + '$.', 'Every slice of a prism equals its base, so the base area must be $' + ptex(pq(r2 * r2)) + '$.', 'Then by Cavalieri\'s principle both solids have volume $' + ptex(pq(r2 * r2)) + ' \\cdot ' + h3 + ' = ' + ptex(pq(r2 * r2 * h3)) + '$.'], hint: 'Match the areas of the slices.' };
  });

  G('geo.pyramids-cones-spheres', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['pyr', 'cone', 'sphere'], ['cone', 'sphere', 'slant', 'hemi'], ['slant', 'rev', 'comp', 'rev']));
    if (kind === 'pyr') { var s = R.int(2, 15), h = 3 * R.int(1, 8), V = s * s * h / 3;
      return { q: 'A pyramid has a square base with side $' + s + '$ m and a height of $' + h + '$ m. Find its volume.', a: num(V),
        steps: ['A pyramid holds exactly one third of the prism with the same base and height: $V = \\frac{1}{3}Bh$.', '$B = ' + s + '^2 = ' + s * s + '$, so $V = \\frac{1}{3} \\cdot ' + s * s + ' \\cdot ' + h + ' = ' + V + '$ m$^3$.'], hint: 'One third of base times height.' }; }
    var r = R.int(2, 15);
    if (kind === 'cone') { var h2 = R.int(2, 20), V2 = pq(r * r * h2, 3);
      return { q: 'Find the volume of a cone with radius $' + r + '$ and height $' + h2 + '$. Give an exact answer in terms of $\\pi$.', a: pnum(V2),
        steps: ['$V = \\frac{1}{3}\\pi r^2 h$ (one third of the cylinder with the same base and height).', '$V = \\frac{1}{3} \\cdot \\pi \\cdot ' + r * r + ' \\cdot ' + h2 + ' = ' + ptex(V2) + '$.'], hint: 'One third of πr²h.' }; }
    if (kind === 'sphere' || kind === 'hemi') { var hemi = kind === 'hemi', V3 = pq(4 * r * r * r, hemi ? 6 : 3);
      return { q: 'Find the volume of a ' + (hemi ? 'hemisphere (half of a sphere)' : 'sphere') + ' with radius $' + r + '$. Give an exact answer in terms of $\\pi$.', a: pnum(V3),
        steps: ['$V_{\\text{sphere}} = \\frac{4}{3}\\pi r^3$, and $r^3 = ' + r * r * r + '$.', hemi ? 'Half of it: $\\frac{1}{2} \\cdot \\frac{4}{3}\\pi \\cdot ' + r * r * r + ' = ' + ptex(V3) + '$.' : '$V = \\frac{4}{3} \\cdot \\pi \\cdot ' + r * r * r + ' = ' + ptex(V3) + '$.'], hint: 'Cube the radius first.' }; }
    if (kind === 'slant') { var tr = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]), rr = tr[0], hh = tr[1], l = tr[2], sw = R.coin(); if (sw) { rr = tr[1]; hh = tr[0]; }
      var V4 = pq(rr * rr * hh, 3);
      return { q: 'A cone has radius $' + rr + '$ and slant height $' + l + '$. Find its volume in terms of $\\pi$.', a: pnum(V4),
        steps: ['The volume formula needs the height (straight up through the center), not the slant height.', 'The radius, height and slant height form a right triangle: $h = \\sqrt{' + l + '^2 - ' + rr + '^2} = \\sqrt{' + (l * l - rr * rr) + '} = ' + hh + '$.', '$V = \\frac{1}{3}\\pi \\cdot ' + rr * rr + ' \\cdot ' + hh + ' = ' + ptex(V4) + '$.'], hint: 'Find the height with the Pythagorean theorem first.' }; }
    if (kind === 'rev') { var useS = R.coin();
      if (useS) { var r5 = R.int(1, 9), V5 = pq(4 * r5 * r5 * r5, 3); return { q: 'A sphere has volume $' + ptex(V5) + '$. Find its radius.', a: num(r5), steps: ['$\\frac{4}{3}\\pi r^3 = ' + ptex(V5) + '$.', 'Divide by $\\frac{4}{3}\\pi$: $r^3 = ' + r5 * r5 * r5 + '$.', '$r = \\sqrt[3]{' + r5 * r5 * r5 + '} = ' + r5 + '$.'], hint: 'Solve for r³, then take the cube root.' }; }
      var h6 = R.int(2, 12), V6 = pq(r * r * h6, 3); return { q: 'A cone with radius $' + r + '$ has volume $' + ptex(V6) + '$. Find its height.', a: num(h6), steps: ['$\\frac{1}{3}\\pi \\cdot ' + r * r + ' \\cdot h = ' + ptex(V6) + '$.', 'Multiply by $3$ and divide by $' + r * r + '\\pi$: $h = ' + h6 + '$.'], hint: 'Put the numbers into V = ⅓πr²h and solve for h.' }; }
    var r7 = R.int(1, 6), h7 = R.int(2, 12), cyl = pq(r7 * r7 * h7), hem = pq(2 * r7 * r7 * r7, 3), tot = pq(3 * r7 * r7 * h7 + 2 * r7 * r7 * r7, 3);
    return { q: 'A silo is a cylinder with radius $' + r7 + '$ m and height $' + h7 + '$ m, topped by a hemisphere with the same radius. Find its total volume in terms of $\\pi$.', a: pnum(tot),
      steps: ['Cylinder: $\\pi \\cdot ' + r7 * r7 + ' \\cdot ' + h7 + ' = ' + ptex(cyl) + '$.', 'Hemisphere: $\\frac{1}{2} \\cdot \\frac{4}{3}\\pi \\cdot ' + r7 * r7 * r7 + ' = ' + ptex(hem) + '$.', 'Total: $' + ptex(cyl) + ' + ' + ptex(hem) + ' = ' + ptex(tot) + '$ m$^3$.'], hint: 'Add the two parts.' };
  });

  G('geo.surface-area-solids', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['prism', 'cyl', 'sphere'], ['cone', 'pyr', 'cyl', 'sphere'], ['coneh', 'pyrh', 'hemi', 'cone']));
    if (kind === 'prism') { var l = R.int(2, 15), w = R.int(2, 12), h = R.int(2, 12), S = 2 * (l * w + l * h + w * h);
      return { q: 'Find the surface area of a rectangular prism that is $' + l + '$ by $' + w + '$ by $' + h + '$ cm.', a: num(S), viz: { name: 'nets', opts: { quiet: true, solid: 'prism', l: M.min(l, 6), w: M.min(w, 5), h: M.min(h, 4), fold: 0.3 }, label: 'A net of a rectangular prism' },
        steps: ['Unfold it: six rectangles in three matching pairs.', '$2(' + l + ' \\cdot ' + w + ') + 2(' + l + ' \\cdot ' + h + ') + 2(' + w + ' \\cdot ' + h + ')$, which is $' + 2 * l * w + ' + ' + 2 * l * h + ' + ' + 2 * w * h + ' = ' + S + '$ cm$^2$.'], hint: 'Three pairs of rectangles.' }; }
    var r = R.int(2, 15);
    if (kind === 'cyl') { var h2 = R.int(2, 20), S2 = pq(2 * r * r + 2 * r * h2);
      return { q: 'Find the surface area of a cylinder with radius $' + r + '$ and height $' + h2 + '$. Give an exact answer in terms of $\\pi$.', a: pnum(S2), viz: { name: 'nets', opts: { quiet: true, solid: 'cylinder', r: 1, h: 3, fold: 0.2 }, label: 'A net of a cylinder: two circles and a rectangle' },
        steps: ['The net is two circles and a rectangle. The rectangle\'s length is the circumference, $2\\pi \\cdot ' + r + ' = ' + ptex(pq(2 * r)) + '$.', 'Two circles: $2 \\cdot \\pi \\cdot ' + r * r + ' = ' + ptex(pq(2 * r * r)) + '$. Rectangle: $' + ptex(pq(2 * r)) + ' \\cdot ' + h2 + ' = ' + ptex(pq(2 * r * h2)) + '$.', 'Total: $' + ptex(S2) + '$.'], hint: '2πr² + 2πrh.' }; }
    if (kind === 'sphere') return { q: 'Find the surface area of a sphere with radius $' + r + '$. Give an exact answer in terms of $\\pi$.', a: pnum(pq(4 * r * r)), steps: ['$S = 4\\pi r^2$: exactly four times the area of a circle with the same radius.', '$S = 4 \\cdot \\pi \\cdot ' + r * r + ' = ' + ptex(pq(4 * r * r)) + '$.'], hint: 'S = 4πr².' };
    if (kind === 'hemi') return { q: 'Find the total surface area of a solid hemisphere with radius $' + r + '$, including its flat circular face. Give an exact answer in terms of $\\pi$.', a: pnum(pq(3 * r * r)), steps: ['Curved part: half of a sphere, $\\frac{1}{2} \\cdot 4\\pi r^2 = 2\\pi \\cdot ' + r * r + ' = ' + ptex(pq(2 * r * r)) + '$.', 'Flat face: a circle, $\\pi \\cdot ' + r * r + ' = ' + ptex(pq(r * r)) + '$.', 'Total: $' + ptex(pq(3 * r * r)) + '$.'], hint: 'Half a sphere plus one circle.' };
    var tr = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 5, 13], [4, 3, 5], [7, 24, 25], [15, 8, 17], [12, 16, 20], [20, 21, 29], [10, 24, 26]]);
    if (kind === 'cone' || kind === 'coneh') { var rr = tr[0], hh = tr[1], l = tr[2], S3 = pq(rr * rr + rr * l);
      return { q: 'A cone has radius $' + rr + '$ and ' + (kind === 'cone' ? 'slant height $' + l + '$' : 'height $' + hh + '$') + '. Find its total surface area in terms of $\\pi$.', a: pnum(S3),
        steps: (kind === 'coneh' ? ['The lateral area needs the slant height $\\ell$ (along the side), not the height: $\\ell = \\sqrt{' + rr + '^2 + ' + hh + '^2} = ' + l + '$.'] : []).concat(['Base: $\\pi \\cdot ' + rr + '^2 = ' + ptex(pq(rr * rr)) + '$. Lateral area: $\\pi r \\ell = \\pi \\cdot ' + rr + ' \\cdot ' + l + ' = ' + ptex(pq(rr * l)) + '$.', 'Total: $' + ptex(S3) + '$.']), hint: kind === 'coneh' ? 'Find the slant height first.' : 'Base πr² plus lateral πrℓ.' }; }
    var half = tr[0], hp = tr[1], sl = tr[2], s = 2 * half, S4 = s * s + 2 * s * sl;
    return { q: 'A square pyramid has base edge $' + s + '$ and ' + (kind === 'pyr' ? 'slant height $' + sl + '$' : 'height $' + hp + '$') + '. Find its total surface area.', a: num(S4),
      steps: (kind === 'pyrh' ? ['The triangular faces need the slant height (the height of each triangle). The pyramid\'s height, half the base edge and the slant height form a right triangle: $\\ell = \\sqrt{' + hp + '^2 + ' + half + '^2} = ' + sl + '$.'] : []).concat(['Base: $' + s + '^2 = ' + s * s + '$.', 'Four triangles: $4 \\cdot \\frac{1}{2} \\cdot ' + s + ' \\cdot ' + sl + ' = ' + 2 * s * sl + '$.', 'Total: $' + s * s + ' + ' + 2 * s * sl + ' = ' + S4 + '$.']), hint: kind === 'pyrh' ? 'Use the height and half the base edge to find the slant height.' : 'Base plus four triangles.' };
  });

  G('geo.cross-sections-revolution', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['xs', 'rev', 'xs'], ['rev', 'revvol', 'xs'], ['revvol', 'revvol2', 'rev']));
    if (kind === 'xs') { var c = R.pick([['a cube', 'parallel to a face', 'A square'], ['a cylinder', 'parallel to its bases', 'A circle'], ['a cylinder', 'through its axis (vertically, through the centers of both bases)', 'A rectangle'], ['a cone', 'parallel to its base', 'A circle'], ['a cone', 'vertically through its apex and the center of its base', 'A triangle'], ['a sphere', 'by any plane through it', 'A circle'], ['a square pyramid', 'parallel to its base', 'A square'], ['a cube', 'through three corners that are each next to the same corner', 'A triangle'], ['a rectangular prism', 'parallel to a face', 'A rectangle']]);
      return { q: 'You slice ' + c[0] + ' ' + c[1] + '. What shape is the cross section?', a: mc(c[2], ['A square', 'A circle', 'A rectangle', 'A triangle', 'An ellipse'].filter(function (x) { return x !== c[2]; })), steps: ['Picture the cut face: ' + c[2].toLowerCase() + '.'], hint: 'Imagine the flat face left behind by the knife.' }; }
    if (kind === 'rev') { var d = R.pick([['a rectangle', 'one of its sides', 'A cylinder'], ['a right triangle', 'one of its legs', 'A cone'], ['a semicircle', 'its diameter', 'A sphere'], ['a rectangle', 'a line parallel to one side, outside the rectangle', 'A cylinder with a cylindrical hole (a tube)'], ['a right triangle', 'its hypotenuse', 'Two cones joined at their bases'], ['a circle', 'a line in its plane that does not touch it', 'A donut shape (a torus)']]);
      return { q: 'You spin ' + d[0] + ' around ' + d[1] + '. What solid does it sweep out?', a: mc(d[2], ['A cylinder', 'A cone', 'A sphere', 'A cylinder with a cylindrical hole (a tube)', 'Two cones joined at their bases', 'A donut shape (a torus)'].filter(function (x) { return x !== d[2]; })), steps: ['Each point of the shape traces a circle around the axis. The farthest points make the outside surface: ' + d[2].toLowerCase() + '.'], hint: 'Follow one corner as it spins.' }; }
    if (kind === 'revvol') { var w = R.int(2, 9), h = R.int(2, 9), around = R.coin();
      var rr = around ? w : h, hh = around ? h : w;
      return { q: 'A rectangle $' + w + '$ units wide and $' + h + '$ units tall spins around its ' + (around ? 'left side (the ' + h + '-unit side)' : 'bottom side (the ' + w + '-unit side)') + '. Find the volume of the solid in terms of $\\pi$.', a: pnum(pq(rr * rr * hh)), viz: { name: 'solids', opts: { quiet: true, f: String(around ? w : h), a: 0, b: around ? h : w, axis: 'x', angle: 270 }, label: 'A rectangle spun into a cylinder' },
        steps: ['Spinning a rectangle around a side makes a cylinder. The side on the axis is the height; the other side is the radius.', 'Radius $' + rr + '$, height $' + hh + '$: $V = \\pi \\cdot ' + rr + '^2 \\cdot ' + hh + ' = ' + ptex(pq(rr * rr * hh)) + '$.'], hint: 'Which side becomes the radius?' }; }
    var a = R.int(2, 9), b = R.int(2, 9); while (a === b) b = R.int(2, 9);
    return { q: 'A right triangle has legs $' + a + '$ and $' + b + '$. It spins around the leg of length $' + a + '$. Find the volume of the cone it makes, in terms of $\\pi$.', a: pnum(pq(b * b * a, 3)),
      steps: ['The leg on the axis ($' + a + '$) becomes the height; the other leg ($' + b + '$) becomes the radius.', '$V = \\frac{1}{3}\\pi \\cdot ' + b + '^2 \\cdot ' + a + ' = ' + ptex(pq(b * b * a, 3)) + '$.', '(Spinning around the other leg gives a different cone: $' + ptex(pq(a * a * b, 3)) + '$.)'], hint: 'The axis leg is the height.' };
  });

  G('geo.scaling-solids', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['area', 'vol', 'double'], ['vol', 'ratio', 'area', 'double'], ['back', 'ratio', 'vol']));
    var k = R.pick([2, 3, 4, 5, '1/2', '3/2']), kq = ML.Q.from(k);
    if (kind === 'area') { var A = R.int(3, 40) * kq.den() * kq.den(), A2 = kq.pow(2).mul(A);
      return { q: 'Every length of a solid is multiplied by $' + T.num(k) + '$. Its surface area was $' + A + '$ cm$^2$. What is the new surface area?', a: num(A2.toPlain()),
        steps: ['Areas grow by the square of the scale factor: each face is scaled in two directions.', '$k^2 = ' + kq.pow(2).toTex() + '$, so the new area is $' + kq.pow(2).toTex() + ' \\cdot ' + A + ' = ' + A2.toTex() + '$ cm$^2$.'], hint: 'Square the scale factor.' }; }
    if (kind === 'vol') { var V = R.int(2, 30) * kq.den() * kq.den() * kq.den(), V2 = kq.pow(3).mul(V);
      return { q: 'A solid has volume $' + V + '$ in$^3$. A similar solid has every length $' + T.num(k) + '$ times as long. Find its volume.', a: num(V2.toPlain()),
        steps: ['Volume grows by the cube of the scale factor: length, width and height are all multiplied.', '$k^3 = ' + kq.pow(3).toTex() + '$, so the new volume is $' + kq.pow(3).toTex() + ' \\cdot ' + V + ' = ' + V2.toTex() + '$ in$^3$.'], hint: 'Cube the scale factor.' }; }
    if (kind === 'double') return { q: 'You double every length of a box. What happens to its volume?', a: mc('It is multiplied by $8$', ['It is multiplied by $2$', 'It is multiplied by $4$', 'It is multiplied by $6$']),
      steps: ['$V = lwh$. Doubling each: $(2l)(2w)(2h) = 8lwh$.', 'So the volume is $2^3 = 8$ times as large (and the surface area $2^2 = 4$ times).'], hint: 'Try a 1 by 1 by 1 cube.' };
    if (kind === 'ratio') { var a = R.int(1, 4), b = R.int(2, 6); while (a >= b || U.gcd(a, b) !== 1) { a = R.int(1, 4); b = R.int(2, 6); } var Vs = a * a * a * R.int(1, 6), Vb = Vs / (a * a * a) * b * b * b;
      return { q: 'Two similar cones have heights $' + a + '$ m and $' + b + '$ m. The smaller cone has volume $' + Vs + '$ m$^3$. Find the volume of the larger cone.', a: num(Vb),
        steps: ['Scale factor (small to large): $\\dfrac{' + b + '}{' + a + '}$.', 'Volumes scale by its cube: $\\left(\\dfrac{' + b + '}{' + a + '}\\right)^3 = \\dfrac{' + b * b * b + '}{' + a * a * a + '}$.', '$V = ' + Vs + ' \\cdot \\dfrac{' + b * b * b + '}{' + a * a * a + '} = ' + Vb + '$ m$^3$.'], hint: 'Cube the ratio of the heights.' }; }
    var p = R.pick([[2, 3], [1, 2], [3, 4], [2, 5], [1, 3]]), S1 = p[0] * p[0] * R.int(2, 10), S2 = S1 / (p[0] * p[0]) * p[1] * p[1];
    return { q: 'Two similar solids have volumes in the ratio $' + p[0] * p[0] * p[0] + ' : ' + p[1] * p[1] * p[1] + '$. The smaller one has surface area $' + S1 + '$ cm$^2$. Find the surface area of the larger one.', a: num(S2),
      steps: ['Volume ratio $= k^3$, so the length ratio is the cube root: $\\sqrt[3]{' + p[0] * p[0] * p[0] + '} : \\sqrt[3]{' + p[1] * p[1] * p[1] + '} = ' + p[0] + ' : ' + p[1] + '$.', 'Area ratio $= k^2$: $' + p[0] * p[0] + ' : ' + p[1] * p[1] + '$.', 'Larger surface area: $' + S1 + ' \\cdot \\dfrac{' + p[1] * p[1] + '}{' + p[0] * p[0] + '} = ' + S2 + '$ cm$^2$.'], hint: 'Go back to the length ratio first, then square it.' };
  });

  G('geo.modeling-with-geometry', function (R, ctx) {
    var kind = R.pick(byL(ctx, ['density', 'pop', 'paint'], ['density', 'units', 'paint', 'pop'], ['tank', 'units', 'cost', 'density']));
    if (kind === 'density') { var m = R.pick([['aluminum', '2.7'], ['oak wood', '0.75'], ['iron', '7.9'], ['ice', '0.92'], ['glass', '2.5'], ['copper', '8.9']]), l = R.int(2, 12), w = R.int(2, 10), h = R.int(1, 8), V = l * w * h, mass = ML.Q.from(m[1]).mul(V);
      return { q: 'A rectangular block of ' + m[0] + ' measures $' + l + '$ cm by $' + w + '$ cm by $' + h + '$ cm. The density of ' + m[0] + ' is $' + m[1] + '$ g/cm$^3$. Find the mass of the block in grams.', a: num(qdec(mass)),
        steps: ['Density is mass per unit of volume, so mass $=$ density $\\times$ volume.', 'Volume: $' + l + ' \\cdot ' + w + ' \\cdot ' + h + ' = ' + V + '$ cm$^3$.', 'Mass: $' + m[1] + ' \\cdot ' + V + ' = ' + qdec(mass) + '$ g.'], hint: 'Find the volume, then multiply by the density.' }; }
    if (kind === 'pop') { var a = R.int(3, 20), b = R.int(3, 20), per = R.int(40, 900), P = a * b * per;
      return { q: 'A rectangular county is $' + a + '$ miles by $' + b + '$ miles and has a population of $' + T.commas(P) + '$. What is its population density, in people per square mile?', a: num(per),
        steps: ['Area: $' + a + ' \\cdot ' + b + ' = ' + a * b + '$ square miles.', 'Density: $' + T.commas(P) + ' \\div ' + a * b + ' = ' + per + '$ people per square mile.'], hint: 'People divided by area.' }; }
    if (kind === 'units') { var d = R.int(100, 3000), km = d / 2.59;
      return { q: 'A town has a population density of $' + T.commas(d) + '$ people per square mile. One square mile is about $2.59$ square kilometers. What is the density in people per square kilometer, to the nearest whole number?', a: tol(km, 0.5),
        steps: ['Each square mile holds $' + T.commas(d) + '$ people, and it is $2.59$ km$^2$. Those people are spread over $2.59$ km$^2$, so each km$^2$ holds fewer.', '$' + T.commas(d) + ' \\div 2.59 \\approx ' + dec(km, 1) + '$, about $' + M.round(km) + '$ people per square kilometer.', 'Check: a square kilometer is smaller than a square mile, so the number should be smaller.'], hint: 'Should the density in smaller units be larger or smaller?' }; }
    if (kind === 'paint') { var L = R.int(10, 30), W = R.int(8, 20), Hh = R.int(8, 10), cover = R.pick([300, 350, 400]), walls = 2 * (L + W) * Hh, coats = R.int(1, 2), cans = M.ceil(walls * coats / cover);
      return { q: 'A room is $' + L + '$ ft by $' + W + '$ ft with $' + Hh + '$ ft walls. You will paint all four walls with ' + (coats === 2 ? 'two coats' : 'one coat') + ' (ignore doors and windows). One can covers $' + cover + '$ ft$^2$. How many cans must you buy?', a: { t: 'num', v: String(cans), form: 'int' },
        steps: ['Wall area: $2(' + L + ' + ' + W + ') \\cdot ' + Hh + ' = ' + walls + '$ ft$^2$' + (coats === 2 ? ', and two coats need $' + walls * 2 + '$ ft$^2$ of coverage' : '') + '.', '$' + walls * coats + ' \\div ' + cover + ' \\approx ' + dec(walls * coats / cover, 2) + '$ cans.', 'You cannot buy part of a can, so round up: $' + cans + '$ cans.'], hint: 'Find the total area to cover, then divide and round up.' }; }
    if (kind === 'tank') { var r = R.int(2, 6), h2 = R.int(4, 12), cuft = M.PI * r * r * h2, gal = cuft * 7.48;
      return { q: 'A cylindrical water tank has a radius of $' + r + '$ ft and a height of $' + h2 + '$ ft. One cubic foot holds about $7.48$ gallons. About how many gallons does the tank hold? Round to the nearest gallon.', a: tol(gal, 0.5),
        steps: ['Volume: $\\pi \\cdot ' + r + '^2 \\cdot ' + h2 + ' = ' + ptex(pq(r * r * h2)) + ' \\approx ' + dec(cuft, 2) + '$ ft$^3$.', 'Gallons: $' + dec(cuft, 2) + ' \\cdot 7.48 \\approx ' + dec(gal, 1) + '$, about $' + M.round(gal) + '$ gallons.'], hint: 'Find the volume in cubic feet, then convert.' }; }
    var s = R.int(2, 8), hb = R.int(2, 10), price = R.pick(['0.05', '0.08', '0.12', '0.15']), SA = 2 * s * s + 4 * s * hb, cost = ML.Q.from(price).mul(SA);
    return { q: 'A closed box with a square base $' + s + '$ in on a side and a height of $' + hb + '$ in is made of cardboard that costs $\\$' + price + '$ per square inch. How much does the cardboard for one box cost?', a: { t: 'num', v: cost.toDec(2), tol: 0.005 },
      steps: ['Surface area: two square ends, $2 \\cdot ' + s + '^2 = ' + 2 * s * s + '$, plus four sides, $4 \\cdot ' + s + ' \\cdot ' + hb + ' = ' + 4 * s * hb + '$: total $' + SA + '$ in$^2$.', 'Cost: $' + SA + ' \\cdot ' + T.money(price) + ' = ' + T.money(cost.toDec(2)) + '$.'], hint: 'Find the surface area, then multiply by the price.' };
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
  var COURSE = 'geo', VAR = {};
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
