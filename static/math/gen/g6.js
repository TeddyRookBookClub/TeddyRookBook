/* Math Ladder: problem generators for Grade 6 (course key g6), one for every topic in data/math/topics/g6.json.
   Built from the parts in the course builder's work dir (src/gen/*.js); edit those and rebuild, not this file.
   Uses the shared API of static/math/core/gen.js (ML.gen, R, ML.T, ML.Q, ML.util, ML.byLevel).
   Pictures inside problems use the shared visuals and the Grade 6 visuals in static/math/viz/g6.js
   (g6-shape, g6-plane, g6-line, g6-ineq, g6-dots, g6-box, g6-histogram).
   Every problem also carries `chk`: the raw numbers it was built from. The course tests recompute each answer from
   them in a different way (brute force, substitution, CAS); the app ignores the field.                              */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, Q = ML.Q, U = ML.util;

  // ------------------------------------------------------------------ small helpers
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function BY(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function qq(x) { return x instanceof Q ? x : Q.from(x); }
  function num(v, form, extra) { var a = { t: 'num', v: v instanceof Q ? v.toPlain() : String(v) }; if (form) a.form = form; if (extra) for (var k in extra) a[k] = extra[k]; return a; }
  function plainMixed(x) { x = qq(x); if (x.isInt() || x.abs().lt(1)) return x.toPlain(); var a = x.abs(), w = a.floor(); return (x.sign() < 0 ? '-' : '') + w.toString() + ' ' + a.sub(w).toPlain(); }
  function numD(x, form, extra) { x = qq(x); return num(x.isTerminating() ? D(x) : plainMixed(x), form, extra); } // decimal when it ends, else a mixed number
  function numM(x, form, extra) { return num(plainMixed(qq(x)), form, extra); }                              // mixed number (or proper fraction)
  var PARTS = { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 12: 'twelfths' };
  function ths(d) { return PARTS[d] || d + 'ths'; }
  function an(w) { return /^(hour|[aeio])/i.test(w) ? 'an ' + w : 'a ' + w; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function multi(parts) { return { t: 'multi', parts: parts }; }
  function part(label, a) { return { label: label, a: a }; }
  function mc(correct, wrongs, keep) { var m = U.mc(correct, wrongs, 99); if (keep) m.keep = true; return m; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function F(x) { return qq(x).toTex(); }                 // fraction TeX
  function MX(x) { return qq(x).toMixedTex(); }           // mixed-number TeX
  function D(x) { return U.numStr(qq(x)); }               // decimal (terminating) or a/b, plain text
  function DT(x) { var s = D(x); return /\//.test(s) ? F(x) : T.commas(s); } // a decimal or a fraction, as TeX
  function $(s) { return '$' + s + '$'; }
  function money(x) { return T.money(qq(x)); }           // \$4.50 (works in text and in math)
  function cents(c) { return money(Q(c, 100)); }
  function sq(n) { return n * n; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function plural(n, one, many) { return Math.abs(n) === 1 ? one : (many || one + 's'); }
  var NAMES = ['Ana', 'Ben', 'Chen', 'Dana', 'Eli', 'Farah', 'Gabe', 'Hana', 'Ivan', 'Jada', 'Kofi', 'Lena', 'Mateo', 'Nia', 'Omar',
    'Priya', 'Quinn', 'Rosa', 'Sam', 'Tara', 'Uma', 'Victor', 'Wren', 'Yusuf', 'Zoe', 'Malik', 'Sofia', 'Diego', 'Aiko', 'Noah'];
  function name(R) { return R.pick(NAMES); }
  function names2(R) { var s = R.sample(NAMES, 2); return s; }
  function coprimePair(R, lo, hi, distinct) {
    for (var t = 0; t < 200; t++) { var a = R.int(lo, hi), b = R.int(lo, hi); if ((!distinct || a !== b) && U.gcd(a, b) === 1) return [a, b]; }
    return [2, 3];
  }
  // a whole-number TeX list like "3, 7, 2 and 9" (inside math)
  function texList(arr) { return arr.map(function (x) { return DT(x); }).join(', '); }
  function sum(arr) { return arr.reduce(function (s, x) { return s.add(qq(x)); }, Q(0)); }
  // TeX table for a ratio table: rows [[label, v1, v2, …], …]
  function texTable(rows) {
    var n = rows[0].length;
    return '$$\\begin{array}{l|' + 'c'.repeat(n - 1).split('').join('|') + '} ' + rows.map(function (r) {
      return r.map(function (c, i) { return i === 0 ? '\\text{' + c + '}' : String(c); }).join(' & ');
    }).join(' \\\\ \\hline ') + ' \\end{array}$$';
  }
  // exact value of a small plain expression (numbers, letters from env, + - * / ^, parentheses): our own check numbers
  function evalPlain(src, env) {
    var t = String(src).replace(/\s+/g, ''), i = 0;
    function peek() { return t[i]; }
    function atom() {
      var c = peek();
      if (c === '(') { i++; var v = expr(); i++; return v; }
      if (c === '-') { i++; return atom().neg(); }
      var m = /^\d+(\.\d+)?/.exec(t.slice(i)); if (m) { i += m[0].length; return Q.from(m[0]); }
      m = /^[a-z]/i.exec(t.slice(i)); if (m) { i++; return qq(env[m[0]]); }
      throw new Error('evalPlain: cannot read ' + t.slice(i));
    }
    function power() { var b = atom(); if (peek() === '^') { i++; return b.pow(power().num()); } return b; }
    function term() { var v = power(); while (peek() === '*' || peek() === '/' || peek() === '(' || /[a-z]/i.test(peek() || '')) { var op = peek(); if (op === '*' || op === '/') i++; var r = power(); v = op === '/' ? v.div(r) : v.mul(r); } return v; }
    function expr() { var v = term(); while (peek() === '+' || peek() === '-') { var op = t[i++], r = term(); v = op === '+' ? v.add(r) : v.sub(r); } return v; }
    return expr();
  }
  // a small TeX column of steps for long work
  function eqChain(arr) { return '$' + arr.join(' = ') + '$'; }

  // ================================================================== unit: ratios and rates
  var PAIRS = [
    { all: 'marbles', where: 'in a bag', a: 'red marbles', b: 'blue marbles', A: 'red', B: 'blue' },
    { all: 'animals', where: 'at a shelter', a: 'dogs', b: 'cats', A: 'dogs', B: 'cats' },
    { all: 'students', where: 'in a chess club', a: 'girls', b: 'boys', A: 'girls', B: 'boys' },
    { all: 'pieces of fruit', where: 'in a basket', a: 'apples', b: 'pears', A: 'apples', B: 'pears' },
    { all: 'flowers', where: 'in a bouquet', a: 'tulips', b: 'roses', A: 'tulips', B: 'roses' },
    { all: 'fish', where: 'in a tank', a: 'goldfish', b: 'guppies', A: 'goldfish', B: 'guppies' },
    { all: 'books', where: 'on a shelf', a: 'mysteries', b: 'comic books', A: 'mysteries', B: 'comic books' },
    { all: 'pens', where: 'in a box', a: 'black pens', b: 'green pens', A: 'black', B: 'green' },
    { all: 'shirts', where: 'in a drawer', a: 'striped shirts', b: 'plain shirts', A: 'striped', B: 'plain' }
  ];
  G('g6.ratio-language', function (R, ctx) {
    var c = R.pick(PAIRS), l = lv(ctx);
    var shape = R.pick(BY(ctx, ['pp', 'pp', 'mc', 'pw'], ['pp', 'mc', 'pw', 'frac', 'simp'], ['pp', 'mc', 'pw', 'frac', 'simp', 'simp']));
    var ab = coprimePair(R, 2, l === 1 ? 9 : 15, true), a = ab[0], b = ab[1];
    var has = cap(c.where) + ' there are ' + $(a) + ' ' + c.a + ' and ' + $(b) + ' ' + c.b + '.';
    if (shape === 'pp') {
      var rev = R.coin(), x = rev ? b : a, y = rev ? a : b, nx = rev ? c.b : c.a, ny = rev ? c.a : c.b;
      return {
        q: has + ' Write the ratio of ' + nx + ' to ' + ny + '.',
        a: multi([part(nx + ' : ' + ny + ' =', num(x, 'int')), part(':', num(y, 'int'))]),
        steps: ['The ratio of ' + nx + ' to ' + ny + ' names the ' + nx + ' first and the ' + ny + ' second.',
          'There are ' + $(x) + ' ' + nx + ' and ' + $(y) + ' ' + ny + ', so the ratio is ' + $(x + ' : ' + y) + '.',
          'Read it as "' + x + ' to ' + y + '": for every ' + x + ' ' + nx + ' there are ' + y + ' ' + ny + '.'],
        hint: 'Keep the order of the words: the first thing named comes first in the ratio.',
        chk: { kind: 'pp', a: x, b: y }
      };
    }
    if (shape === 'pw') {
      var useA = R.coin(), p = useA ? a : b, np = useA ? c.a : c.b;
      return {
        q: has + ' Write the ratio of ' + np + ' to all the ' + c.all + '.',
        a: multi([part(np + ' : all =', num(p, 'int')), part(':', num(a + b, 'int'))]),
        steps: ['This compares a part to the whole, so first find the whole: ' + $(a + ' + ' + b + ' = ' + (a + b)) + ' ' + c.all + '.',
          'There are ' + $(p) + ' ' + np + ' out of ' + $(a + b) + ' ' + c.all + '.', 'The ratio is ' + $(p + ' : ' + (a + b)) + '.'],
        hint: 'The whole is all of the ' + c.all + ' together. Add first.',
        chk: { kind: 'pw', a: p, b: a + b }
      };
    }
    if (shape === 'frac') {
      var useA2 = R.coin(), p2 = useA2 ? a : b, np2 = useA2 ? c.a : c.b;
      return {
        q: has + ' What fraction of the ' + c.all + ' are ' + np2 + '?',
        a: num(Q(p2, a + b), 'frac'),
        steps: ['A fraction of the whole is a part-to-whole ratio: ' + np2 + ' to all ' + c.all + '.',
          'All ' + c.all + ': ' + $(a + ' + ' + b + ' = ' + (a + b)) + '.',
          'The ' + np2 + ' are ' + $(p2) + ' of them, so the fraction is ' + $(F(Q(p2, a + b))) + '.'],
        hint: 'Put the ' + np2 + ' over the total number of ' + c.all + '.',
        chk: { kind: 'frac', a: p2, b: a + b }
      };
    }
    if (shape === 'simp') {
      var k = R.int(2, 5), A2 = a * k, B2 = b * k, rev2 = R.coin(), x2 = rev2 ? B2 : A2, y2 = rev2 ? A2 : B2, n1 = rev2 ? c.b : c.a, n2 = rev2 ? c.a : c.b;
      if (A2 > 60 || B2 > 60) { k = 2; A2 = a * 2; B2 = b * 2; x2 = rev2 ? B2 : A2; y2 = rev2 ? A2 : B2; }
      var g = U.gcd(x2, y2);
      return {
        q: cap(c.where) + ' there are ' + $(A2) + ' ' + c.a + ' and ' + $(B2) + ' ' + c.b + '. Write the ratio of ' + n1 + ' to ' + n2 + ' in simplest form.',
        a: multi([part(n1 + ' : ' + n2 + ' =', num(x2 / g, 'int')), part(':', num(y2 / g, 'int'))]),
        steps: ['Start with the counts in the right order: ' + $(x2 + ' : ' + y2) + '.',
          'Both numbers can be divided by ' + $(g) + ', their greatest common factor.',
          $(x2 + ' \\div ' + g + ' = ' + (x2 / g)) + ' and ' + $(y2 + ' \\div ' + g + ' = ' + (y2 / g)) + ', so the ratio is ' + $((x2 / g) + ' : ' + (y2 / g)) + '.',
          'It means the same thing: for every ' + (x2 / g) + ' ' + n1 + ' there are ' + (y2 / g) + ' ' + n2 + '.'],
        hint: 'Write the counts in order, then divide both by the same number.',
        chk: { kind: 'simp', a: x2, b: y2, ra: x2 / g, rb: y2 / g }
      };
    }
    // mc: which statement must be true?
    var T1 = 'For every ' + a + ' ' + c.a + ', there are ' + b + ' ' + c.b + '.';
    var T2 = a + ' out of every ' + (a + b) + ' ' + c.all + ' are ' + c.a + '.';
    var T3 = b + ' out of every ' + (a + b) + ' ' + c.all + ' are ' + c.b + '.';
    var F1 = 'For every ' + a + ' ' + c.b + ', there are ' + b + ' ' + c.a + '.';
    var F2 = b + ' out of every ' + (a + b) + ' ' + c.all + ' are ' + c.a + '.';
    var F3 = a + ' out of every ' + (a + b) + ' ' + c.all + ' are ' + c.b + '.';
    var F4 = a + ' out of every ' + b + ' ' + c.all + ' are ' + c.a + '.';
    var ci = R.int(0, 2), right = [T1, T2, T3][ci];
    var wrongs = R.sample(ci === 0 ? [F1, F2, F3, F4] : [F1, F4, ci === 1 ? F2 : F3, ci === 1 ? F3 : F2], 3);
    return {
      q: cap(c.where) + ', the ratio of ' + c.a + ' to ' + c.b + ' is ' + $(a + ' : ' + b) + '. Which statement must be true?',
      a: mc(right, wrongs),
      steps: ['The ratio ' + $(a + ' : ' + b) + ' says: for every ' + a + ' ' + c.a + ' there are ' + b + ' ' + c.b + '.',
        'So each group of ' + $(a + ' + ' + b + ' = ' + (a + b)) + ' ' + c.all + ' has ' + a + ' ' + c.a + ' and ' + b + ' ' + c.b + '.',
        'The true statement is: "' + right + '"'],
      hint: 'Picture one group: ' + a + ' ' + c.a + ' with ' + b + ' ' + c.b + '. How many is that in all?',
      chk: { kind: 'mc', a: a, b: b }
    };
  });

  var MIXES = [
    { a: 'cups of flour', b: 'cups of milk', s: 'A pancake recipe uses' },
    { a: 'scoops of lemonade mix', b: 'cups of water', s: 'A lemonade recipe uses' },
    { a: 'cans of blue paint', b: 'cans of yellow paint', s: 'A shade of green paint uses' },
    { a: 'cups of oats', b: 'cups of raisins', s: 'A trail mix uses' },
    { a: 'tablespoons of sugar', b: 'cups of tea', s: 'A sweet tea recipe uses' },
    { a: 'red beads', b: 'white beads', s: 'A bracelet pattern uses' }
  ];
  G('g6.equivalent-ratios', function (R, ctx) {
    var l = lv(ctx), m = R.pick(MIXES);
    var shape = R.pick(BY(ctx, ['miss', 'miss', 'tf', 'mc'], ['miss', 'tf', 'mc', 'table'], ['miss3', 'miss3', 'tf', 'mc', 'table']));
    var uv = coprimePair(R, 2, 9, true), u = uv[0], v = uv[1];
    if (shape === 'miss') {
      var k = R.int(2, l === 1 ? 6 : 12), askB = R.coin();
      var given = askB ? u * k : v * k, ans = askB ? v * k : u * k;
      return {
        q: m.s + ' ' + $(u) + ' ' + m.a + ' for every ' + $(v) + ' ' + m.b + '. How many ' + (askB ? m.b : m.a) + ' go with ' + $(given) + ' ' + (askB ? m.a : m.b) + '?',
        a: num(ans),
        steps: ['The ratio is ' + $(u + ' : ' + v) + '. To keep the same mix, multiply both amounts by the same number.',
          $(askB ? u : v) + ' times what is ' + $(given) + '? ' + $(given + ' \\div ' + (askB ? u : v) + ' = ' + k) + ', so the recipe is made ' + k + ' times.',
          'Multiply the other amount by ' + k + ' too: ' + $((askB ? v : u) + ' \\times ' + k + ' = ' + ans) + '.',
          $(u + ' : ' + v) + ' and ' + $((askB ? given : ans) + ' : ' + (askB ? ans : given)) + ' are equivalent ratios.'],
        hint: 'Find what ' + (askB ? u : v) + ' was multiplied by to get ' + given + '. Do the same to the other number.',
        chk: { kind: 'miss', u: u, v: v, k: k, askB: askB, ans: ans }
      };
    }
    if (shape === 'miss3') {
      var mm = R.int(2, 4), nn; do { nn = R.int(2, 9); } while (nn % mm === 0);
      var askB3 = R.coin(), baseA = u * mm, baseB = v * mm, giv = askB3 ? u * nn : v * nn, an = askB3 ? v * nn : u * nn;
      return {
        q: m.s + ' ' + $(baseA) + ' ' + m.a + ' for every ' + $(baseB) + ' ' + m.b + '. How many ' + (askB3 ? m.b : m.a) + ' go with ' + $(giv) + ' ' + (askB3 ? m.a : m.b) + '?',
        a: num(an),
        steps: [$(giv) + ' is not a whole-number multiple of ' + $(askB3 ? baseA : baseB) + ', so first find a smaller equivalent ratio.',
          'Divide both by ' + mm + ': ' + $(baseA + ' : ' + baseB + ' = ' + u + ' : ' + v) + '.',
          'Now scale up: ' + $(giv + ' \\div ' + (askB3 ? u : v) + ' = ' + nn) + ', so multiply both parts of ' + $(u + ' : ' + v) + ' by ' + nn + '.',
          $((askB3 ? v : u) + ' \\times ' + nn + ' = ' + an) + '. The ratio ' + $((askB3 ? giv : an) + ' : ' + (askB3 ? an : giv)) + ' is equivalent to ' + $(baseA + ' : ' + baseB) + '.'],
        hint: 'Divide both numbers of the ratio by the same number first, then multiply up.',
        chk: { kind: 'miss', u: u, v: v, k: nn, askB: askB3, ans: an }
      };
    }
    if (shape === 'tf') {
      var k2 = R.int(2, l === 1 ? 4 : 7), truth = R.coin(), c2, d2, add = 0;
      if (truth) { c2 = u * k2; d2 = v * k2; }
      else { add = R.int(1, 6); c2 = u + add; d2 = v + add; if (R.coin() && l > 1) { c2 = u * k2; d2 = v * k2 + R.pick([-1, 1]); add = 0; } }
      var st = truth ? ['Look for one number that turns ' + u + ' into ' + c2 + ': ' + $(u + ' \\times ' + k2 + ' = ' + c2) + '.', 'Multiply the other number by the same ' + k2 + ': ' + $(v + ' \\times ' + k2 + ' = ' + d2) + '. It matches.', 'Both numbers were multiplied by ' + k2 + ', so the ratios are equivalent: true.']
        : add ? ['Both numbers went up by ' + add + ', but adding the same amount is not scaling.', 'Compare the second number divided by the first: ' + $(F(Q(v, u))) + ' in the first ratio and ' + $(F(Q(d2, c2))) + ' in the second.', 'These are different, so the ratios are not equivalent: false.']
          : ['To turn ' + u + ' into ' + c2 + ' we multiply by ' + k2 + '.', 'But ' + $(v + ' \\times ' + k2 + ' = ' + (v * k2)) + ', not ' + d2 + '.', 'The numbers were not scaled by the same amount, so the ratios are not equivalent: false.'];
      return {
        q: 'True or false: ' + $(u + ' : ' + v) + ' is equivalent to ' + $(c2 + ' : ' + d2) + '.',
        a: tf(truth), steps: st,
        hint: 'Equivalent ratios come from multiplying both numbers by the same number, not adding.',
        chk: { kind: 'tf', a: u, b: v, c: c2, d: d2, truth: truth }
      };
    }
    if (shape === 'mc') {
      var k3 = R.int(2, 6), ad = R.int(1, 5), wrong = [];
      wrong.push((u + ad) + ' : ' + (v + ad));
      wrong.push((v * k3) + ' : ' + (u * k3));
      wrong.push((u * k3) + ' : ' + (v * k3 + 1));
      wrong.push((u * k3 + ad) + ' : ' + (v * k3));
      var right3 = (u * k3) + ' : ' + (v * k3);
      return {
        q: 'Which ratio is equivalent to ' + $(u + ' : ' + v) + '?',
        a: mc($(right3), R.sample(wrong, 3).map($)),
        steps: ['Equivalent ratios multiply both numbers by the same number.', $(u + ' \\times ' + k3 + ' = ' + (u * k3)) + ' and ' + $(v + ' \\times ' + k3 + ' = ' + (v * k3)) + '.',
          'So ' + $(right3) + ' is equivalent to ' + $(u + ' : ' + v) + '. Adding the same amount to both, or switching the order, changes the ratio.'],
        hint: 'Find the choice where both numbers were multiplied by the same number, in the same order.',
        chk: { kind: 'mc', a: u, b: v }
      };
    }
    // table: three missing entries
    var ks = R.sample([2, 3, 4, 5, 6, 7, 8, 10], 3).sort(function (x, y) { return x - y; });
    var hide = [R.coin() ? 'a' : 'b', R.coin() ? 'a' : 'b', R.coin() ? 'a' : 'b'], L = ['\\mathbf{A}', '\\mathbf{B}', '\\mathbf{C}'];
    var rowA = [m.a, u], rowB = [m.b, v], parts = [], st2 = ['The first column is one batch: ' + $(u + ' : ' + v) + '. Every other column multiplies both numbers by the same number.'];
    ks.forEach(function (k, i) {
      if (hide[i] === 'a') { rowA.push(L[i]); rowB.push(v * k); parts.push(part($('\\mathbf{' + 'ABC'[i] + '} ='), num(u * k))); st2.push($(v * k + ' \\div ' + v + ' = ' + k) + ', so ' + $('\\mathbf{' + 'ABC'[i] + '} = ' + u + ' \\times ' + k + ' = ' + (u * k)) + '.'); }
      else { rowA.push(u * k); rowB.push(L[i]); parts.push(part($('\\mathbf{' + 'ABC'[i] + '} ='), num(v * k))); st2.push($(u * k + ' \\div ' + u + ' = ' + k) + ', so ' + $('\\mathbf{' + 'ABC'[i] + '} = ' + v + ' \\times ' + k + ' = ' + (v * k)) + '.'); }
    });
    return {
      q: m.s + ' ' + $(u) + ' ' + m.a + ' for every ' + $(v) + ' ' + m.b + '. Fill in the ratio table.' + texTable([rowA, rowB]),
      a: multi(parts), steps: st2,
      hint: 'For each column, find what the known number was multiplied by.',
      chk: { kind: 'table', u: u, v: v, ks: ks, hide: hide }
    };
  });

  var GRAPHS = [
    { x: 'cups of flour', y: 'cups of sugar', x1: 'cup of flour', y1: 'cup of sugar' }, { x: 'hours worked', y: 'dollars earned', x1: 'hour worked', y1: 'dollar earned' },
    { x: 'gallons of gas', y: 'miles driven', x1: 'gallon of gas', y1: 'mile driven' }, { x: 'tickets', y: 'dollars', x1: 'ticket', y1: 'dollar' },
    { x: 'minutes', y: 'laps swum', x1: 'minute', y1: 'lap swum' }, { x: 'boxes', y: 'muffins', x1: 'box', y1: 'muffin' }
  ];
  G('g6.ratio-graphs', function (R, ctx) {
    var l = lv(ctx), g = R.pick(GRAPHS), shape = R.pick(BY(ctx, ['next', 'point', 'next', 'unit'], ['next', 'point', 'unit', 'tf'], ['next', 'point', 'unit', 'tf']));
    var uv = coprimePair(R, 1, l === 1 ? 5 : 9, true), u = uv[0], v = uv[1];
    if (shape === 'next') {
      var mm = l === 1 ? 1 : R.int(1, 3), nn; do { nn = R.int(2, l === 1 ? 6 : 9); } while (nn === mm);
      var px = u * mm, py = v * mm, rx = u * nn, ry = v * nn, show = l === 1;
      var p = {
        q: 'Equivalent ratios of ' + g.x + ' (' + $('x') + ') to ' + g.y + ' (' + $('y') + ') are graphed. The line goes through ' + $('(0, 0)') + ' and ' + $(T.pt([px, py])) + '. What is ' + $('y') + ' when ' + $('x = ' + rx) + '?',
        a: num(ry),
        steps: ['The point ' + $(T.pt([px, py])) + ' means ' + px + ' ' + (px === 1 ? g.x1 + ' goes' : g.x + ' go') + ' with ' + py + ' ' + (py === 1 ? g.y1 : g.y) + ': the ratio ' + $(px + ' : ' + py) + (mm > 1 ? ' = ' + $(u + ' : ' + v) : '') + '.',
          'Every point on the line is an equivalent ratio. ' + $(rx + ' = ' + u + ' \\times ' + nn) + ', so multiply ' + $(v) + ' by ' + nn + ' too.',
          $('y = ' + v + ' \\times ' + nn + ' = ' + ry) + '. The point ' + $(T.pt([rx, ry])) + ' is on the line.'],
        hint: 'Write the point as a ratio, then scale it to the new x.',
        chk: { kind: 'next', u: u, v: v, x: rx, y: ry }
      };
      if (show) p.viz = { name: 'g6-plane', opts: { xmin: 0, ymin: 0, xmax: Math.max(rx, px) + 1, ymax: Math.max(ry, py) + 1, q1: true, points: [{ x: 0, y: 0 }, { x: px, y: py }], line: [[0, 0], [px, py]] }, label: 'A line through the origin and the point (' + px + ', ' + py + ')' };
      return p;
    }
    if (shape === 'point') {
      var k = R.int(2, 5), ad = R.int(1, 4), right = [u * k, v * k];
      var wrongs = [[u + ad, v + ad], [v * k, u * k], [u * k, v * k + 1], [u * k + 1, v * k]].filter(function (w) { return w[0] * v !== w[1] * u; });
      return {
        q: 'A graph shows equivalent ratios of ' + $('x') + ' to ' + $('y') + ' = ' + $(u + ' : ' + v) + '. Which point is on the graph?',
        a: mc($(T.pt(right)), R.sample(wrongs, 3).map(function (w) { return $(T.pt(w)); })),
        steps: ['Points on the graph are equivalent ratios ' + $('x : y') + ' of ' + $(u + ' : ' + v) + ', always with x first.',
          'Multiply both numbers by ' + k + ': ' + $(u * k + ' : ' + v * k) + '.', 'So ' + $(T.pt(right)) + ' is on the graph. Adding the same number to both, or swapping them, gives a point off the line.'],
        hint: 'Which point has both coordinates multiplied by the same number?',
        chk: { kind: 'point', u: u, v: v }
      };
    }
    if (shape === 'unit') {
      var m2 = R.int(2, 6), p2 = [u * m2, v * m2], ux = Q(v, u);
      return {
        q: 'The point ' + $(T.pt(p2)) + ' is on the graph of a ratio relationship that goes through ' + $('(0, 0)') + '. Which point on the line has ' + $('x = 1') + '? Type it as ' + $('(x, y)') + '.',
        a: { t: 'tuple', v: ['1', ux.toPlain()] },
        steps: ['To get from ' + $('x = ' + p2[0]) + ' to ' + $('x = 1') + ', divide by ' + p2[0] + '.', 'Divide ' + $('y') + ' by the same number: ' + $(p2[1] + ' \\div ' + p2[0] + ' = ' + (ux.isInt() ? ux.toString() : F(ux) + (ux.isTerminating() ? ' = ' + D(ux) : ''))) + '.',
          'The point is ' + $(T.pt([1, ux])) + '. Its y-value is the unit rate: ' + $(DT(ux)) + ' for each 1 of x.'],
        hint: 'Divide both coordinates by the x-coordinate.',
        chk: { kind: 'unit', x: p2[0], y: p2[1] }
      };
    }
    // tf: do these pairs come from one ratio?
    var truth = R.coin(), xs = [1, 2, 3, 4].map(function (i) { return i * (l === 3 ? R.int(1, 2) : 1); }), c = R.int(1, 5), pts;
    xs = U.uniq(xs).sort(function (a, b) { return a - b; }); if (xs.length < 3) xs = [1, 2, 3];
    if (truth) pts = xs.map(function (x) { return [x * u, x * v]; });
    else pts = xs.map(function (x) { return [x * u, x * u + c]; });
    return {
      q: 'Do these ' + $('(x, y)') + ' pairs all come from one ratio (equivalent ratios)? ' + $(pts.map(function (p) { return T.pt(p); }).join(',\\ ')) + ' Answer true or false.',
      a: tf(truth),
      steps: truth ? ['Divide y by x for each pair: each gives ' + $(DT(Q(v, u))) + '.', 'The same unit rate every time means the pairs are equivalent ratios. On a graph they lie on one line through ' + $('(0, 0)') + ': true.']
        : ['Divide y by x for each pair: ' + pts.map(function (p) { return $(F(Q(p[1], p[0]))); }).join(', ') + '.', 'These are not all the same. Each y is x plus ' + c + ': adding the same amount does not keep a ratio.', 'The points line up, but the line would not go through ' + $('(0, 0)') + ', so they are not equivalent ratios: false.'],
      hint: 'Check whether y ÷ x is the same for every pair.',
      chk: { kind: 'tf', pts: pts, truth: truth }
    };
  });

  var RATES = [
    { s: function (A, B, n) { return 'A car travels ' + $(A) + ' miles in ' + $(B) + ' hours.'; }, a: 'miles', b: 'hours', b1: 'hour', a1: 'mile', r: [30, 65], lo: 2, hi: 6 },
    { s: function (A, B, n) { return 'A printer prints ' + $(A) + ' pages in ' + $(B) + ' minutes.'; }, a: 'pages', b: 'minutes', b1: 'minute', a1: 'page', r: [6, 30], lo: 2, hi: 9 },
    { s: function (A, B, n) { return n + ' types ' + $(A) + ' words in ' + $(B) + ' minutes.'; }, a: 'words', b: 'minutes', b1: 'minute', a1: 'word', r: [25, 60], lo: 2, hi: 8 },
    { s: function (A, B, n) { return 'A hose fills ' + $(A) + ' gallons in ' + $(B) + ' minutes.'; }, a: 'gallons', b: 'minutes', b1: 'minute', a1: 'gallon', r: [3, 12], lo: 2, hi: 9 },
    { s: function (A, B, n) { return n + ' bikes ' + $(A) + ' kilometers in ' + $(B) + ' hours.'; }, a: 'kilometers', b: 'hours', b1: 'hour', a1: 'kilometer', r: [12, 25], lo: 2, hi: 5 },
    { s: function (A, B, n) { return n + ' reads ' + $(A) + ' pages in ' + $(B) + ' hours.'; }, a: 'pages', b: 'hours', b1: 'hour', a1: 'page', r: [20, 45], lo: 2, hi: 5 },
    { s: function (A, B, n) { return 'A heart beats ' + $(A) + ' times in ' + $(B) + ' minutes.'; }, a: 'beats', b: 'minutes', b1: 'minute', a1: 'beat', r: [60, 90], lo: 2, hi: 5 }
  ];
  G('g6.unit-rate', function (R, ctx) {
    var l = lv(ctx), c = R.pick(RATES), n = name(R);
    var shape = R.pick(BY(ctx, ['rate', 'rate', 'price'], ['rate', 'price', 'inv', 'rate'], ['rate', 'price', 'inv', 'both']));
    if (shape === 'price') {
      var items = R.pick([['pounds of apples', 'pound'], ['notebooks', 'notebook'], ['bottles of juice', 'bottle'], ['yards of ribbon', 'yard'], ['pounds of rice', 'pound']]);
      var B = R.int(2, l === 1 ? 6 : 8), cents0 = l === 1 ? R.int(1, 9) * 100 : R.int(4, 40) * 25, A = Q(cents0 * B, 100);
      return {
        q: $(B) + ' ' + items[0] + ' cost ' + money(A) + '. What is the price for ' + (items[1] === 'pound' || items[1] === 'yard' ? 'one ' + items[1] : 'one ' + items[1]) + '?',
        a: numD(Q(cents0, 100)), unit: 'dollars',
        steps: ['The unit rate is the cost for 1 ' + items[1] + ': dollars ÷ ' + items[0].split(' ')[0] + '.',
          $(money(A) + ' \\div ' + B + ' = ' + money(Q(cents0, 100))) + '.', 'Each ' + items[1] + ' costs ' + money(Q(cents0, 100)) + '.'],
        hint: 'Split the total cost into ' + B + ' equal parts.',
        chk: { kind: 'div', top: A.toPlain(), bot: B }
      };
    }
    var B2 = R.int(c.lo, c.hi), r, A2;
    if (l === 1) { r = R.int(c.r[0], c.r[1]); A2 = Q(r * B2); }
    else { r = R.coin() ? Q(R.int(c.r[0] * 2, c.r[1] * 2), 2) : Q(R.int(c.r[0], c.r[1])); if (B2 % 2 && !r.isInt()) B2 += 1; A2 = qq(r).mul(B2); r = qq(r); }
    r = qq(r);
    var base = c.s(A2.toString(), B2, n), per = c.a + ' per ' + c.b1, inv = c.b + ' per ' + c.a1;
    if (shape === 'rate') {
      return {
        q: base + ' How many ' + per + '?',
        a: numD(r), unit: per,
        steps: ['"' + cap(per) + '" means ' + c.a + ' for 1 ' + c.b1 + ', so divide ' + c.a + ' by ' + c.b + '.', $(A2.toString() + ' \\div ' + B2 + ' = ' + DT(r)) + '.', 'The unit rate is ' + $(DT(r)) + ' ' + per + '.'],
        hint: 'The word after "per" tells you what to divide by.',
        chk: { kind: 'div', top: A2.toPlain(), bot: B2 }
      };
    }
    var ir = Q(B2).div(A2);
    if (shape === 'inv') {
      return {
        q: base + ' How many ' + inv + '? (A fraction is fine.)',
        a: num(ir), unit: inv,
        steps: ['"' + cap(inv) + '" means ' + c.b + ' for 1 ' + c.a1 + ', so this time divide ' + c.b + ' by ' + c.a + '.', $(B2 + ' \\div ' + A2.toString() + ' = ' + F(ir)) + (ir.isTerminating() ? ' = ' + $(D(ir)) : '') + '.',
          'That is ' + $(F(ir)) + ' of ' + an(c.b1) + ' for each ' + c.a1 + '. It is small because one ' + c.a1 + ' takes much less than ' + an(c.b1) + '.'],
        hint: 'Now the ' + c.b + ' go on top: divide ' + c.b + ' by ' + c.a + '.',
        chk: { kind: 'div', top: B2, bot: A2.toPlain() }
      };
    }
    return {
      q: base + ' Find both unit rates.',
      a: multi([part(cap(per) + ':', numD(r)), part(cap(inv) + ':', num(ir))]),
      steps: [cap(per) + ': ' + $(A2.toString() + ' \\div ' + B2 + ' = ' + DT(r)) + '.', cap(inv) + ': ' + $(B2 + ' \\div ' + A2.toString() + ' = ' + F(ir)) + '.', 'The two rates are reciprocals: ' + $(DT(r) + ' \\times ' + F(ir) + ' = 1') + '.'],
      hint: 'Each rate divides by the thing after "per".',
      chk: { kind: 'both', A: A2.toPlain(), B: B2 }
    };
  });

  var GOODS = [['granola bars', 'bar'], ['bottles of water', 'bottle'], ['pencils', 'pencil'], ['cans of soup', 'can'], ['juice boxes', 'juice box'], ['bagels', 'bagel']];
  G('g6.unit-rate-problems', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['cost', 'time', 'better', 'dist'], ['cost', 'time', 'better', 'many', 'dist'], ['cost', 'time', 'better', 'many', 'diff']));
    var gd = R.pick(GOODS), n = name(R);
    if (shape === 'better' || shape === 'diff') {
      var ua, ub, na, nb; do { ua = R.int(6, 40) * 5; ub = R.int(6, 40) * 5; } while (ua === ub || Math.abs(ua - ub) > 40);
      do { na = R.int(2, 12); nb = R.int(2, 12); } while (na === nb);
      var pa = Q(ua * na, 100), pb = Q(ub * nb, 100), aBetter = ua < ub;
      var A = 'A pack of ' + na + ' for ' + money(pa), B = 'A pack of ' + nb + ' for ' + money(pb);
      var st = ['Find the price of one ' + gd[1] + ' in each pack.', 'Pack of ' + na + ': ' + $(money(pa) + ' \\div ' + na + ' = ' + cents(ua)) + ' each.', 'Pack of ' + nb + ': ' + $(money(pb) + ' \\div ' + nb + ' = ' + cents(ub)) + ' each.'];
      if (shape === 'better') return {
        q: 'Which is the better buy for ' + gd[0] + '?', a: mcKeep([A, B], aBetter ? 0 : 1),
        steps: st.concat(['The lower price for one ' + gd[1] + ' is the better buy: ' + (aBetter ? A : B).toLowerCase() + '.']),
        hint: 'Compare the price of one ' + gd[1] + ', not the price of the packs.',
        chk: { kind: 'better', na: na, nb: nb, pa: pa.toPlain(), pb: pb.toPlain(), v: aBetter ? 0 : 1 }
      };
      return {
        q: gd[0].charAt(0).toUpperCase() + gd[0].slice(1) + ' come in a pack of ' + na + ' for ' + money(pa) + ' or a pack of ' + nb + ' for ' + money(pb) + '. How much less is one ' + gd[1] + ' in the cheaper pack, in cents?',
        a: num(Math.abs(ua - ub)), unit: 'cents',
        steps: st.concat(['The difference is ' + $(Math.max(ua, ub) + ' - ' + Math.min(ua, ub) + ' = ' + Math.abs(ua - ub)) + ' cents.']),
        hint: 'Find each unit price first.',
        chk: { kind: 'diff', na: na, nb: nb, pa: pa.toPlain(), pb: pb.toPlain() }
      };
    }
    if (shape === 'cost' || shape === 'many') {
      var k = R.int(2, 8), u = l === 1 ? R.int(1, 6) * 25 : R.int(4, 60) * 5, m = R.int(2, 6) * k, have = R.int(2, 9) * m, unitQ = Q(u, 100);
      var tot = unitQ.mul(m);
      if (shape === 'cost') {
        var want; do { want = R.int(2, 9) * k; } while (want === m);
        var cost = unitQ.mul(want);
        return {
          q: $(m) + ' ' + gd[0] + ' cost ' + money(tot) + '. At the same price, how much do ' + $(want) + ' ' + gd[0] + ' cost?',
          a: numD(cost), unit: 'dollars',
          steps: ['Find the unit price: ' + $(money(tot) + ' \\div ' + m + ' = ' + money(unitQ)) + ' per ' + gd[1] + '.', 'Multiply by the number you want: ' + $(want + ' \\times ' + money(unitQ) + ' = ' + money(cost)) + '.'],
          hint: 'How much does one ' + gd[1] + ' cost?',
          chk: { kind: 'cost', m: m, tot: tot.toPlain(), want: want }
        };
      }
      var budget = unitQ.mul(have);
      return {
        q: $(m) + ' ' + gd[0] + ' cost ' + money(tot) + '. How many can you buy with ' + money(budget) + '?',
        a: num(have, 'int'),
        steps: ['The unit price is ' + $(money(tot) + ' \\div ' + m + ' = ' + money(unitQ)) + '.', 'Divide the money by the unit price: ' + $(money(budget) + ' \\div ' + money(unitQ) + ' = ' + have) + '.'],
        hint: 'Find the price of one, then see how many of those fit in your money.',
        chk: { kind: 'many', m: m, tot: tot.toPlain(), budget: budget.toPlain() }
      };
    }
    var veh = R.pick([['A train', 'miles', 'hour', 40, 80], ['A cyclist', 'miles', 'hour', 10, 18], ['A runner', 'meters', 'second', 4, 8], ['A drone', 'meters', 'second', 6, 15], ['A bus', 'kilometers', 'hour', 40, 70]]);
    var sp = R.int(veh[3], veh[4]), t = l === 1 ? R.int(2, 6) : Q(R.int(3, 13), 2), d = Q(sp).mul(qq(t));
    if (shape === 'time') return {
      q: veh[0] + ' moves at a constant ' + $(sp) + ' ' + veh[1] + ' per ' + veh[2] + '. How many ' + veh[2] + 's does it take to go ' + $(D(d)) + ' ' + veh[1] + '?',
      a: numD(qq(t)), unit: veh[2] + 's',
      steps: ['Each ' + veh[2] + ' covers ' + sp + ' ' + veh[1] + '. Ask: how many groups of ' + sp + ' are in ' + D(d) + '?', $(D(d) + ' \\div ' + sp + ' = ' + DT(qq(t))) + '.', 'It takes ' + $(DT(qq(t))) + ' ' + veh[2] + 's.'],
      hint: 'Divide the distance by the speed.',
      chk: { kind: 'time', sp: sp, d: d.toPlain() }
    };
    return {
      q: veh[0] + ' moves at a constant ' + $(sp) + ' ' + veh[1] + ' per ' + veh[2] + '. How far does it go in ' + $(DT(qq(t))) + ' ' + veh[2] + 's?',
      a: numD(d), unit: veh[1],
      steps: ['Each ' + veh[2] + ' adds ' + sp + ' ' + veh[1] + '.', $(DT(qq(t)) + ' \\times ' + sp + ' = ' + D(d)) + '.', 'It goes ' + $(D(d)) + ' ' + veh[1] + '.'],
      hint: 'Multiply the speed by the time.',
      chk: { kind: 'dist', sp: sp, t: qq(t).toPlain() }
    };
  });

  G('g6.percent-meaning', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['outof', 'outof100', 'todec', 'tofrac'], ['outof', 'todec', 'tofrac', 'fromdec', 'tiny'], ['outof', 'todec', 'tofrac', 'fromdec', 'tiny', 'big']));
    if (shape === 'outof100') {
      var p = R.int(3, 97), thing = R.pick(['squares of a 100-square grid are shaded', 'of 100 seats are taken', 'of 100 students chose soccer', 'pennies out of a dollar are in the jar']);
      return {
        q: $(p) + ' ' + thing + '. What percent is that?', a: num(p, null, { pct: true }), unit: '%',
        steps: ['Percent means "per 100", or out of 100.', $(p) + ' out of 100 is ' + $(p + '\\%') + '.'],
        hint: 'Out of 100 is exactly what percent means.',
        chk: { kind: 'pct', part: p, whole: 100 }
      };
    }
    if (shape === 'outof') {
      var whole = R.pick([2, 4, 5, 10, 20, 25, 50]), k = 100 / whole, part2 = R.int(1, whole - 1);
      if (l === 1) whole = R.pick([10, 20, 25, 50]), k = 100 / whole, part2 = R.int(1, whole - 1);
      var ctxs = [[' of the ' + whole + ' questions on a quiz were right', 'questions'], [' of ' + whole + ' free throws went in', 'shots'], [' of the ' + whole + ' tickets were sold', 'tickets']];
      var cx = R.pick(ctxs);
      return {
        q: $(part2) + cx[0] + '. What percent is that?', a: num(part2 * k, null, { pct: true }), unit: '%',
        steps: ['A percent is a rate per 100. Make an equivalent ratio with 100 as the whole.', $(whole + ' \\times ' + k + ' = 100') + ', so multiply the part by ' + k + ' too: ' + $(part2 + ' \\times ' + k + ' = ' + part2 * k) + '.',
          $(part2 + ' : ' + whole + ' = ' + part2 * k + ' : 100') + ', which is ' + $(part2 * k + '\\%') + '.'],
        hint: 'What do you multiply ' + whole + ' by to get 100?',
        chk: { kind: 'pct', part: part2, whole: whole }
      };
    }
    if (shape === 'todec' || shape === 'tiny' || shape === 'big') {
      var pq = shape === 'tiny' ? Q(R.int(1, 9), 10) : shape === 'big' ? Q(R.int(101, 300)) : l === 1 ? Q(R.int(1, 99)) : (R.coin() ? Q(R.int(1, 9)) : Q(R.int(11, 99)));
      if (shape === 'big' && R.coin()) pq = Q(R.pick([110, 120, 125, 150, 175, 200, 250]));
      var dv = pq.div(100);
      return {
        q: 'Write ' + $(DT(pq) + '\\%') + ' as a decimal.', a: num(dv, 'dec'),
        steps: [$(DT(pq) + '\\%') + ' means ' + $(DT(pq)) + ' per 100, so divide by 100.', 'Dividing by 100 moves each digit two places to the right of where it was: ' + $(DT(pq) + ' \\div 100 = ' + D(dv)) + '.',
          shape === 'tiny' ? 'Less than 1 percent is less than one hundredth: ' + $(D(dv)) + ' is much smaller than ' + $(D(pq)) + '.' : shape === 'big' ? 'More than 100% is more than one whole, so the decimal is more than 1.' : 'Check: ' + $(D(dv)) + ' is ' + DT(pq) + ' hundredths.'],
        hint: 'Percent means "out of 100". Divide by 100.',
        chk: { kind: 'todec', p: pq.toPlain() }
      };
    }
    if (shape === 'fromdec') {
      var dd = R.coin() ? Q(R.int(1, 99), 100) : Q(R.int(1, 9), 10);
      if (R.chance(0.25)) dd = Q(R.int(1, 9), 1000).add(Q(R.int(0, 9), 100));
      return {
        q: 'Write ' + $(D(dd)) + ' as a percent.', a: numD(dd.mul(100), null, { pct: true }), unit: '%',
        steps: ['A percent counts hundredths.', $(D(dd)) + ' is ' + $(D(dd.mul(100))) + ' hundredths, because ' + $(D(dd) + ' \\times 100 = ' + D(dd.mul(100))) + '.', 'So ' + $(D(dd) + ' = ' + D(dd.mul(100)) + '\\%') + '.'],
        hint: 'How many hundredths is it?',
        chk: { kind: 'fromdec', d: dd.toPlain() }
      };
    }
    var pp = l === 1 ? R.pick([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]) : R.pick([5, 15, 35, 45, 55, 65, 12, 8, 4, 24, 36, 64, 85, 95]);
    var fr = Q(pp, 100);
    return {
      q: 'Write ' + $(pp + '\\%') + ' as a fraction in simplest form.', a: num(fr, 'frac'),
      steps: [$(pp + '\\%') + ' means ' + pp + ' out of 100: ' + $('\\frac{' + pp + '}{100}') + '.',
        'Divide the top and bottom by their greatest common factor, ' + U.gcd(pp, 100) + ': ' + $('\\frac{' + pp + '}{100} = ' + F(fr)) + '.'],
      hint: 'Write it over 100, then simplify.',
      chk: { kind: 'tofrac', p: pp }
    };
  });

  G('g6.percent-of-a-number', function (R, ctx) {
    var l = lv(ctx), p, W;
    if (l === 1) { p = R.pick([10, 20, 30, 40, 50, 60, 70, 80, 90, 25, 75]); W = p % 25 === 0 && p % 10 ? R.int(2, 20) * 4 : R.int(2, 20) * 10; }
    else if (l === 2) { p = R.pick([5, 15, 35, 45, 25, 75, 12, 60, 40]); W = R.int(2, 24) * (p % 5 === 0 ? 20 : 25); }
    else { p = R.pick([120, 150, 125, 200, 2.5, 7.5, 35, 65, 12.5]); W = R.int(2, 16) * 40; }
    var pq = qq(p), part2 = pq.mul(W).div(100);
    var cx = R.pick([
      function () { return 'A class has ' + $(W) + ' students. ' + $(DT(pq) + '\\%') + ' of them walk to school. How many students walk?'; },
      function () { return 'A jacket costs ' + money(W) + '. It is on sale for ' + $(DT(pq) + '\\%') + ' off. How many dollars is the discount?'; },
      function () { return 'Find ' + $(DT(pq) + '\\%') + ' of ' + $(W) + '.'; },
      function () { return 'A tank holds ' + $(W) + ' liters. It is ' + $(DT(pq) + '\\%') + ' full. How many liters are in it?'; },
      function () { return 'What is ' + $(DT(pq) + '\\%') + ' of ' + $(W) + '?'; }
    ]);
    var qt = cx();
    if (p > 100 && /walk|full|discount/.test(qt)) qt = 'Find ' + $(DT(pq) + '\\%') + ' of ' + $(W) + '.';
    var ten = Q(W, 10), st;
    if (p === 25 || p === 50 || p === 75) st = [$(p + '\\%') + ' is ' + $(F(Q(p, 100))) + ' of the whole.', $(F(Q(p, 100)) + ' \\times ' + W + ' = ' + DT(part2)) + '.'];
    else st = ['Start with ' + $('10\\%') + ': one tenth of ' + W + ' is ' + $(DT(ten)) + '.',
      $(DT(pq) + '\\%') + ' is ' + $(DT(pq.div(10))) + ' times as much: ' + $(DT(pq.div(10)) + ' \\times ' + DT(ten) + ' = ' + DT(part2)) + '.'];
    st.push('Check with the meaning of percent: ' + $(DT(pq) + '\\%') + ' of ' + W + ' is ' + $('\\frac{' + DT(pq) + '}{100} \\times ' + W + ' = ' + DT(part2)) + '.');
    return {
      q: qt, a: numD(part2), steps: st,
      hint: 'Find 10% (or 1%) of ' + W + ' first, then build up.',
      chk: { kind: 'pof', p: pq.toPlain(), W: W }
    };
  });

  G('g6.find-the-whole', function (R, ctx) {
    var l = lv(ctx), p, W;
    if (l === 1) { p = R.pick([10, 20, 25, 50]); W = R.int(2, 20) * (p === 25 ? 4 : p === 50 ? 2 : 10); }
    else if (l === 2) { p = R.pick([30, 40, 60, 75, 5, 15, 80]); W = R.int(2, 20) * 20; }
    else { p = R.pick([35, 45, 120, 150, 12.5, 2.5, 65]); W = R.int(2, 12) * 40; }
    var pq = qq(p), part2 = pq.mul(W).div(100), n = name(R);
    var forms = [
      $(DT(part2)) + ' is ' + $(DT(pq) + '\\%') + ' of what number?',
      n + ' has read ' + $(DT(part2)) + ' pages. That is ' + $(DT(pq) + '\\%') + ' of the book. How many pages are in the book?',
      n + ' has saved ' + money(part2) + '. That is ' + $(DT(pq) + '\\%') + ' of the price of a bike. What is the price of the bike, in dollars?',
      'A team won ' + $(DT(part2)) + ' games. That was ' + $(DT(pq) + '\\%') + ' of the games it played. How many games did it play?'
    ];
    var qt = R.pick(forms);
    if (p > 100 || !part2.isInt()) qt = forms[0];
    var g = U.gcd(Math.round(p * 10), 1000) / 10, step1 = qq(g), unit = part2.div(pq).mul(step1); // the part that matches g percent
    var st = ['We know a part, ' + $(DT(part2)) + ', and its percent, ' + $(DT(pq) + '\\%') + '. The whole is ' + $('100\\%') + '.'];
    if (Q(100).div(pq).isInt()) st.push($(DT(pq) + '\\%') + ' fits into ' + $('100\\%') + ' exactly ' + D(Q(100).div(pq)) + ' times, so the whole is ' + $(DT(part2) + ' \\times ' + D(Q(100).div(pq)) + ' = ' + W) + '.');
    else {
      st.push('Find ' + $(D(step1) + '\\%') + ' first: ' + $(DT(pq) + '\\%') + ' is ' + $(DT(pq.div(step1))) + ' groups of ' + $(D(step1) + '\\%') + ', so ' + $(D(step1) + '\\%') + ' is ' + $(DT(part2) + ' \\div ' + DT(pq.div(step1)) + ' = ' + DT(unit)) + '.');
      st.push($('100\\%') + ' is ' + $(DT(Q(100).div(step1))) + ' groups of ' + $(D(step1) + '\\%') + ': ' + $(DT(unit) + ' \\times ' + DT(Q(100).div(step1)) + ' = ' + W) + '.');
    }
    st.push('Check: ' + $(DT(pq) + '\\%') + ' of ' + W + ' is ' + $(DT(part2)) + '.');
    return {
      q: qt, a: num(W), steps: st,
      hint: 'The number you are given is only part of the whole. Use it to find 10% (or another easy percent), then 100%.',
      chk: { kind: 'whole', p: pq.toPlain(), part: part2.toPlain() }
    };
  });

  var CONV = [
    ['feet', 'inches', 12, 'foot', 'inch'], ['yards', 'feet', 3, 'yard', 'foot'], ['pounds', 'ounces', 16, 'pound', 'ounce'],
    ['gallons', 'quarts', 4, 'gallon', 'quart'], ['quarts', 'pints', 2, 'quart', 'pint'], ['cups', 'fluid ounces', 8, 'cup', 'fluid ounce'],
    ['hours', 'minutes', 60, 'hour', 'minute'], ['minutes', 'seconds', 60, 'minute', 'second'], ['days', 'hours', 24, 'day', 'hour'],
    ['meters', 'centimeters', 100, 'meter', 'centimeter'], ['kilometers', 'meters', 1000, 'kilometer', 'meter'], ['kilograms', 'grams', 1000, 'kilogram', 'gram'],
    ['liters', 'milliliters', 1000, 'liter', 'milliliter'], ['centimeters', 'millimeters', 10, 'centimeter', 'millimeter'], ['weeks', 'days', 7, 'week', 'day']
  ];
  G('g6.convert-units-ratios', function (R, ctx) {
    var l = lv(ctx), c = R.pick(CONV), f = c[2], shape = R.pick(BY(ctx, ['down', 'up'], ['down', 'up', 'up'], ['down', 'up', 'two']));
    if (shape === 'two') {
      var chains = [['yards', 'feet', 'inches', 3, 12], ['gallons', 'quarts', 'pints', 4, 2], ['days', 'hours', 'minutes', 24, 60], ['hours', 'minutes', 'seconds', 60, 60], ['quarts', 'pints', 'cups', 2, 2]];
      var ch = R.pick(chains), big = ch[0] === 'days' || ch[0] === 'hours' ? R.int(2, 3) : R.int(2, 6), mid = big * ch[3], small = mid * ch[4];
      return {
        q: 'How many ' + ch[2] + ' are in ' + $(big) + ' ' + ch[0] + '?', a: num(small), unit: ch[2],
        steps: ['Go one step at a time. ' + cap(ch[0]) + ' are bigger than ' + ch[1] + ', so the number of units grows: multiply.', $(big + ' \\times ' + ch[3] + ' = ' + mid) + ' ' + ch[1] + '.', $(mid + ' \\times ' + ch[4] + ' = ' + T.commas(small)) + ' ' + ch[2] + '.'],
        hint: 'Convert to ' + ch[1] + ' first, then to ' + ch[2] + '.',
        chk: { kind: 'two', big: big, f1: ch[3], f2: ch[4] }
      };
    }
    if (shape === 'down') {
      var amt = l === 1 ? Q(R.int(2, 9)) : Q(R.int(3, 19), 2);
      if (f >= 1000 && l > 1) amt = Q(R.int(11, 99), 10);
      var res = amt.mul(f);
      return {
        q: 'Convert ' + $(DT(amt)) + ' ' + c[0] + ' to ' + c[1] + '.', a: numD(res), unit: c[1],
        steps: ['The ratio is ' + $('1') + ' ' + c[3] + ' : ' + $(T.commas(f)) + ' ' + c[1] + '.', 'A ' + c[3] + ' is the bigger unit, so you need more ' + c[1] + ' than ' + c[0] + ': multiply.',
          $(DT(amt) + ' \\times ' + T.commas(f) + ' = ' + T.commas(D(res))) + ' ' + c[1] + '.'],
        hint: 'Each ' + c[3] + ' is ' + T.commas(f) + ' ' + c[1] + '. Will the number get bigger or smaller?',
        chk: { kind: 'down', amt: amt.toPlain(), f: f }
      };
    }
    var big2 = l === 1 ? Q(R.int(2, 9)) : Q(R.int(3, 19), 2);
    if (l === 3 && R.coin()) big2 = Q(R.int(5, 39), 4);
    if (f >= 1000) big2 = l === 1 ? Q(R.int(2, 9)) : Q(R.int(11, 99), 10);
    var sm = big2.mul(f);
    if (!sm.isInt()) { big2 = Q(R.int(2, 9)); sm = big2.mul(f); }
    return {
      q: 'Convert ' + $(T.commas(D(sm))) + ' ' + c[1] + ' to ' + c[0] + '.', a: numD(big2), unit: c[0],
      steps: ['The ratio is ' + $('1') + ' ' + c[3] + ' : ' + $(T.commas(f)) + ' ' + c[1] + '.', 'A ' + c[3] + ' is the bigger unit, so you need fewer of them: divide by ' + T.commas(f) + '.',
        $(T.commas(D(sm)) + ' \\div ' + T.commas(f) + ' = ' + DT(big2)) + (big2.isInt() ? '' : ' (that is ' + $(MX(big2)) + ')') + ' ' + c[0] + '.'],
      hint: 'How many groups of ' + T.commas(f) + ' are in ' + T.commas(D(sm)) + '?',
      chk: { kind: 'up', sm: sm.toPlain(), f: f }
    };
  });

  // ================================================================== unit: fractions, decimals and factors
  function fracTape(dividend, unitDen) { // a tape cut into 1/unitDen pieces with the dividend shaded
    var n = dividend.mul(unitDen).num(), wholes = Math.max(1, Math.ceil(dividend.toNumber())), total = wholes * unitDen, parts = [], labels = [], cols = [];
    for (var i = 0; i < total; i++) { parts.push(1); labels.push(total <= 8 ? '1/' + unitDen : ''); cols.push(i < n ? 'green' : 'empty'); }
    return { name: 'tapediagram', opts: { tapes: [{ parts: parts, labels: labels, colors: cols }], braces: [{ tape: 0, from: 0, to: n, label: dividend.toString() }, { tape: 0, from: 0, to: total, label: wholes === 1 ? '1 whole' : wholes + ' wholes', up: false }] }, label: 'A tape cut into pieces of 1/' + unitDen + ', with ' + dividend.toString() + ' shaded' };
  }
  G('g6.divide-fractions-meaning', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['count', 'count', 'which'], ['count', 'count2', 'which', 'part'], ['count2', 'part', 'which', 'part']));
    if (shape === 'which') {
      var w = R.int(2, 6), d = R.int(2, 5), uf = '\\frac{1}{' + d + '}';
      return {
        q: 'Which question does ' + $(w + ' \\div ' + uf) + ' answer?',
        a: mc('How many ' + $(uf) + 's are in ' + $(w) + '?', ['What is ' + $(uf) + ' of ' + $(w) + '?', 'How many ' + $(w) + 's are in ' + $(uf) + '?', 'What is ' + $(w) + ' shared equally by ' + $(d) + ' people?']),
        steps: ['Division can ask "how many groups?": ' + $('12 \\div 3') + ' asks how many 3s are in 12.', 'So ' + $(w + ' \\div ' + uf) + ' asks how many ' + $(uf) + 's are in ' + $(w) + '.',
          'Each whole holds ' + d + ' pieces of size ' + $(uf) + ', so ' + w + ' wholes hold ' + $(w + ' \\times ' + d + ' = ' + w * d) + ' of them. ' + $('\\frac{1}{' + d + '} \\text{ of } ' + w) + ' would be much smaller.'],
        hint: 'Think of 12 ÷ 3 as "how many 3s fit in 12?"',
        chk: { kind: 'which' }
      };
    }
    if (shape === 'count') {
      var den = R.pick(l === 1 ? [3, 4, 6, 8, 10] : [4, 6, 8, 10, 12]), k = R.int(2, l === 1 ? den - 1 : 2 * den - 1);
      if (k === den) k++;
      var dv = Q(k, den), p = {
        q: 'How many ' + $('\\frac{1}{' + den + '}') + 's are in ' + $(F(dv)) + '?',
        a: num(k),
        steps: ['The question is ' + $(F(dv) + ' \\div \\frac{1}{' + den + '}') + ': how many pieces of size ' + $('\\frac{1}{' + den + '}') + ' fit in ' + $(F(dv)) + '?',
          dv.den() === den ? 'It is already written in ' + ths(den) + '.' : 'Write ' + $(F(dv)) + ' in ' + ths(den) + ': ' + $(F(dv) + ' = \\frac{' + k + '}{' + den + '}') + '.',
          $('\\frac{' + k + '}{' + den + '}') + ' is ' + k + ' pieces of ' + $('\\frac{1}{' + den + '}') + ', so the answer is ' + $(k) + '.'],
        hint: 'Rename ' + F(dv).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') + ' so its denominator is ' + den + '.',
        chk: { kind: 'q', a: dv.toPlain(), b: Q(1, den).toPlain() }
      };
      if (l === 1 && k <= 12) p.viz = fracTape(dv, den);
      return p;
    }
    if (shape === 'count2') {
      var D2 = R.pick([6, 8, 9, 10, 12]), m; do { m = R.int(2, 5); } while (U.gcd(m, D2) !== 1 || m >= D2);
      var kk = R.int(2, 5), dvd = Q(m * kk, D2), dvs = Q(m, D2);
      return {
        q: 'How many ' + $(F(dvs)) + 's are in ' + $(F(dvd)) + '? Find ' + $(F(dvd) + ' \\div ' + F(dvs)) + '.',
        a: num(kk),
        steps: ['Use the same size pieces for both: ' + ths(D2) + '. ' + $(F(dvd) + ' = \\frac{' + m * kk + '}{' + D2 + '}') + ' and ' + $(F(dvs) + ' = \\frac{' + m + '}{' + D2 + '}') + '.',
          'Now ask: how many groups of ' + m + ' pieces are in ' + m * kk + ' pieces? ' + $(m * kk + ' \\div ' + m + ' = ' + kk) + '.', 'So ' + $(F(dvd) + ' \\div ' + F(dvs) + ' = ' + kk) + '. Check: ' + $(kk + ' \\times ' + F(dvs) + ' = ' + F(dvd)) + '.'],
        hint: 'Give both fractions the denominator ' + D2 + ', then count groups of pieces.',
        chk: { kind: 'q', a: dvd.toPlain(), b: dvs.toPlain() }
      };
    }
    // part of a group
    var D3 = R.pick([4, 6, 8, 9, 10, 12]), m3, n3;
    do { m3 = R.int(2, 4); n3 = R.int(m3 + 1, 3 * m3 + 2); } while (n3 % m3 === 0 || n3 >= 3 * D3);
    var A3 = Q(n3, D3), B3 = Q(m3, D3), ans = A3.div(B3), whole = ans.floor().num(), rest = ans.sub(whole);
    var ctxs = ['A scoop holds ' + $(F(B3)) + ' cup. How many scoops are in ' + $(F(A3)) + ' cup' + (A3.gt(1) ? 's' : '') + ' of rice? (Part of a scoop counts.)', 'Find ' + $(F(A3) + ' \\div ' + F(B3)) + '.'];
    return {
      q: R.pick(ctxs),
      a: numM(ans),
      steps: ['Rename both with denominator ' + D3 + ': ' + $('\\frac{' + n3 + '}{' + D3 + '} \\div \\frac{' + m3 + '}{' + D3 + '}') + '.',
        'How many groups of ' + m3 + ' pieces are in ' + n3 + ' pieces? ' + whole + ' full group' + (whole === 1 ? '' : 's') + ' use' + (whole === 1 ? 's ' : ' ') + whole * m3 + ' pieces, and ' + (n3 - whole * m3) + ' piece' + (n3 - whole * m3 === 1 ? ' is' : 's are') + ' left.',
        'The leftover is ' + (n3 - whole * m3) + ' of the ' + m3 + ' pieces in a group: ' + $(F(rest)) + ' of a group.',
        'So the answer is ' + $(MX(ans)) + ', which is also ' + $(F(ans)) + '.'],
      hint: 'Use the same denominator for both, then ask how many groups fit, and what part of a group is left.',
      chk: { kind: 'q', a: A3.toPlain(), b: B3.toPlain() }
    };
  });

  function randFrac(R, dens, proper) { var d = R.pick(dens), n; do { n = R.int(1, proper ? d - 1 : 2 * d); } while (U.gcd(n, d) !== 1 || n === d); return Q(n, d); }
  G('g6.divide-fractions', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['wf', 'fw', 'ff', 'ff'], ['ff', 'ff', 'ff', 'mc'], ['mixed', 'mixed', 'ff', 'mc']));
    var a, b, dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    if (shape === 'wf') { a = Q(R.int(2, 9)); b = Q(R.int(1, 4), R.int(5, 9)); if (b.num() === 1 && R.coin()) b = Q(1, R.int(2, 6)); }
    else if (shape === 'fw') { a = randFrac(R, [2, 3, 4, 5, 6, 8], true); b = Q(R.int(2, 6)); }
    else if (shape === 'mixed') { a = Q(R.int(1, 4)).add(randFrac(R, [2, 3, 4, 5, 6, 8], true)); b = R.coin() ? randFrac(R, [2, 3, 4, 5, 6, 8], true) : Q(R.int(1, 2)).add(randFrac(R, [2, 3, 4, 5, 6], true)); }
    else { do { a = randFrac(R, l === 1 ? [2, 3, 4, 5, 6, 8] : dens, true); b = randFrac(R, l === 1 ? [2, 3, 4, 5, 6, 8] : dens, true); } while (a.eq(b)); }
    if (a.eq(b)) b = b.add(1);
    var ans = a.div(b), recip = b.inv();
    var shw = function (x) { return shape === 'mixed' ? MX(x) : F(x); };
    if (shape === 'mc') {
      var ai = a.inv();
      return {
        q: 'Which expression is equal to ' + $(F(a) + ' \\div ' + F(b)) + '?',
        a: mc($(F(a) + ' \\times ' + F(recip)), [$(F(ai) + ' \\times ' + F(b)), $(F(ai) + ' \\times ' + F(recip)), $(F(a) + ' \\times ' + F(b))]),
        steps: ['Dividing by a number is the same as multiplying by its reciprocal.', 'Keep the first fraction. Flip only the divisor: the reciprocal of ' + $(F(b)) + ' is ' + $(F(recip)) + '.',
          'So ' + $(F(a) + ' \\div ' + F(b) + ' = ' + F(a) + ' \\times ' + F(recip) + ' = ' + F(ans)) + '.'],
        hint: 'Which number is the divisor? Only that one is flipped.',
        chk: { kind: 'mc' }
      };
    }
    var aa = a, steps = [];
    if (shape === 'mixed') steps.push('Write each mixed number as a fraction: ' + $(MX(a) + ' = ' + F(a)) + (b.isInt() || b.lt(1) ? '' : ' and ' + $(MX(b) + ' = ' + F(b))) + '.');
    var raw = '\\frac{' + a.num() + ' \\times ' + recip.num() + '}{' + a.den() + ' \\times ' + recip.den() + '}';
    steps.push('Multiply by the reciprocal of the divisor: ' + $(F(a) + ' \\div ' + F(b) + ' = ' + F(a) + ' \\times ' + F(recip)) + '.');
    if (a.isInt() || recip.isInt()) steps.push('Multiply: ' + $(F(a) + ' \\times ' + F(recip) + ' = ' + F(ans)) + '.');
    else steps.push('Multiply tops and bottoms: ' + $(raw + ' = \\frac{' + a.num() * recip.num() + '}{' + a.den() * recip.den() + '}') + (U.gcd(a.num() * recip.num(), a.den() * recip.den()) > 1 ? ' = ' + $(F(ans)) : '') + '.');
    if (!ans.isInt() && ans.gt(1)) steps.push('As a mixed number: ' + $(F(ans) + ' = ' + MX(ans)) + '.');
    steps.push('Check by multiplying back: ' + $(shw(ans).replace(/^(.*)$/, '$1') + ' \\times ' + F(b) + ' = ' + F(a)) + '.');
    return {
      q: 'Find ' + $(shw(a) + ' \\div ' + shw(b)) + '. Write the answer in simplest form.',
      a: num(ans, 'simplest'),
      steps: steps,
      hint: 'Keep the first number, change ÷ to ×, and flip the divisor (the second number).',
      chk: { kind: 'q', a: a.toPlain(), b: b.toPlain() }
    };
  });

  G('g6.fraction-division-problems', function (R, ctx) {
    var l = lv(ctx), n = name(R), shape = R.pick(BY(ctx, ['pieces', 'share', 'pieces', 'whole'], ['pieces', 'share', 'whole', 'rect', 'part'], ['part', 'whole', 'rect', 'share', 'pieces']));
    var dens = l === 1 ? [2, 3, 4, 6, 8] : [2, 3, 4, 5, 6, 8, 10, 12];
    function mixQ(maxW) { var w = R.int(0, maxW), f = randFrac(R, dens, true); return Q(w).add(f); }
    function T_(x) { return l === 3 && x.gt(1) && !x.isInt() ? MX(x) : F(x); }
    var A, B, ans, q, st, unit;
    if (shape === 'pieces') {
      B = randFrac(R, dens, true); if (B.num() > 1 && l === 1) B = Q(1, B.den());
      var k = R.int(2, l === 1 ? 8 : 12); A = B.mul(k); ans = Q(k);
      var it = R.pick([['ribbon', 'yard', 'yards', 'cuts'], ['board', 'meter', 'meters', 'saws'], ['nuts', 'pound', 'pounds', 'packs']]), AU = A.gt(1) ? it[2] : it[1];
      if (it[0] === 'nuts') { q = n + ' has ' + $(T_(A)) + ' ' + AU + ' of nuts and packs them into small bags of ' + $(F(B)) + ' ' + it[1] + ' each. How many small bags can ' + n + ' fill?'; it[4] = 'bags'; }
      else { q = 'A ' + it[0] + ' is ' + $(T_(A)) + ' ' + AU + ' long. ' + n + ' ' + it[3] + ' it into pieces that are each ' + $(F(B)) + ' ' + it[1] + ' long. How many pieces are there?'; it[4] = 'pieces'; }
      st = ['This asks how many ' + $(F(B)) + 's fit in ' + $(T_(A)) + ', so divide: ' + $(T_(A) + ' \\div ' + F(B)) + '.', 'Multiply by the reciprocal: ' + $(F(A) + ' \\times ' + F(B.inv()) + ' = ' + k) + '.', 'There are ' + k + ' ' + it[4] + '. Check: ' + $(k + ' \\times ' + F(B) + ' = ' + F(A)) + '.'];
      unit = it[4];
    } else if (shape === 'share') {
      var people = R.int(2, 6); A = l === 1 ? randFrac(R, [2, 3, 4, 5], true) : mixQ(l === 3 ? 3 : 1); if (A.isInt()) A = A.add(Q(1, 2));
      B = Q(people); ans = A.div(B);
      var thing = R.pick([['pound', 'pounds', 'of trail mix'], ['liter', 'liters', 'of juice'], ['quart', 'quarts', 'of soup']]);
      q = $(people) + ' friends share ' + $(T_(A)) + ' ' + (A.gt(1) ? thing[1] : thing[0]) + ' ' + thing[2] + ' equally. How much does each friend get, in ' + thing[1] + '?';
      st = ['Sharing equally among ' + people + ' means dividing by ' + people + ': ' + $(T_(A) + ' \\div ' + people) + '.', 'Dividing by ' + people + ' is the same as multiplying by ' + $('\\frac{1}{' + people + '}') + ': ' + $(F(A) + ' \\times \\frac{1}{' + people + '} = ' + F(ans)) + '.', 'Each friend gets ' + $(F(ans)) + ' ' + thing[0] + '.'];
    } else if (shape === 'whole') {
      B = randFrac(R, [2, 3, 4, 5, 6, 8], true); A = randFrac(R, [2, 3, 4, 5, 6, 8], true); if (A.eq(B)) A = A.mul(2).gt(1) ? A.div(2) : A.mul(2);
      ans = A.div(B);
      q = $(F(A)) + ' cup of water fills ' + $(F(B)) + ' of a bottle. How many cups of water fill the whole bottle?';
      st = ['If ' + $(F(B)) + ' of the bottle holds ' + $(F(A)) + ' cup, the whole bottle holds ' + $(F(A) + ' \\div ' + F(B)) + ' cups.', 'Why divide? We want how much goes in 1 whole bottle, the amount for one group, just like ' + $('6 \\div 2') + ' when 6 cups fill 2 bottles.',
        $(F(A) + ' \\times ' + F(B.inv()) + ' = ' + F(ans)) + (ans.gt(1) && !ans.isInt() ? ' = ' + $(MX(ans)) : '') + ' cups.', 'Check: ' + $(F(B)) + ' of ' + $(F(ans)) + ' is ' + $(F(B) + ' \\times ' + F(ans) + ' = ' + F(A)) + '.'];
    } else if (shape === 'rect') {
      B = randFrac(R, [2, 3, 4, 5, 6, 8], true); var W = randFrac(R, [2, 3, 4, 5, 6, 8, 10], l === 2); if (W.eq(B)) W = W.add(1);
      A = B.mul(W); ans = W;
      q = 'A rectangle has an area of ' + $(T_(A)) + ' square meter' + (A.gt(1) ? 's' : '') + '. One side is ' + $(F(B)) + ' meter long. How long is the other side, in meters?';
      st = ['Area = length × width, so the missing side is the area divided by the known side.', $(T_(A) + ' \\div ' + F(B) + ' = ' + F(A) + ' \\times ' + F(B.inv()) + ' = ' + F(ans)) + (ans.gt(1) && !ans.isInt() ? ' = ' + $(MX(ans)) : '') + '.',
        'Check: ' + $(F(B) + ' \\times ' + F(ans) + ' = ' + F(A)) + '.'];
    } else {
      var Dn = R.pick([4, 6, 8, 12]), m; do { m = R.int(2, 5); } while (m >= Dn); var nn; do { nn = R.int(m + 1, 3 * m); } while (nn % m === 0);
      A = Q(nn, Dn); B = Q(m, Dn); ans = A.div(B);
      q = n + ' has ' + $(T_(A)) + ' cup' + (A.gt(1) ? 's' : '') + ' of yogurt. One serving is ' + $(F(B)) + ' cup. How many servings is that? (Part of a serving counts.)';
      st = ['How many ' + $(F(B)) + 's are in ' + $(T_(A)) + '? Divide: ' + $(T_(A) + ' \\div ' + F(B)) + '.', 'With a common denominator: ' + $('\\frac{' + nn + '}{' + Dn + '} \\div \\frac{' + m + '}{' + Dn + '}') + ' asks how many groups of ' + m + ' pieces are in ' + nn + ' pieces: ' + $(F(Q(nn, m))) + '.',
        'That is ' + $(MX(ans)) + ' servings: ' + ans.floor().num() + ' full servings and ' + $(F(ans.sub(ans.floor()))) + ' of another.'];
    }
    return { q: q, a: numM(ans), steps: st, hint: shape === 'share' ? 'Sharing among people means dividing by the number of people.' : 'Ask "how many of this fit in that?" or "how much is one whole?" Then divide.', chk: { kind: 'q', a: A.toPlain(), b: B.toPlain() } };
  });

  function longDiv(n, d) {
    var s = String(n), out = [], cur = 0, qs = '', started = false;
    for (var i = 0; i < s.length; i++) {
      var prev = cur; cur = cur * 10 + Number(s[i]);
      if (!started && cur < d && i < s.length - 1) continue;
      var dig = Math.floor(cur / d), prod = dig * d;
      var lead = !started ? 'Divide ' + $(cur) + ' by ' + $(d) : 'Bring down the ' + s[i] + ' to make ' + $(cur) + '. Divide by ' + $(d);
      out.push(dig ? lead + ': ' + $(dig) + ' times. ' + $(dig + ' \\times ' + d + ' = ' + prod) + ', and ' + $(cur + ' - ' + prod + ' = ' + (cur - prod)) + '.' : lead + ': it goes ' + $('0') + ' times, so write 0 in the quotient.');
      qs += dig; started = true; cur -= prod;
    }
    return { q: Number(qs), r: cur, steps: out };
  }
  G('g6.long-division-fluency', function (R, ctx) {
    var l = lv(ctx), d, qn, r = 0;
    if (l === 1) { d = R.int(3, 9); qn = R.int(102, 999); }
    else if (l === 2) { d = R.int(12, 48); qn = R.int(21, 309); }
    else { d = R.int(13, 89); qn = R.int(105, 999); r = R.coin() ? R.int(1, d - 1) : 0; }
    var n = d * qn + r, ld = longDiv(n, d), story = R.chance(0.35) && !r;
    var q = story ? R.pick(['A school packs ' + $(T.commas(n)) + ' books into boxes of ' + $(d) + '. How many boxes does it fill?', 'A farm has ' + $(T.commas(n)) + ' eggs. They go in cartons that hold ' + $(d) + ' each. How many cartons are filled?', 'A theater has ' + $(T.commas(n)) + ' seats in rows of ' + $(d) + '. How many rows are there?'])
      : 'Divide: ' + $(T.commas(n) + ' \\div ' + d) + (r ? '. Give the quotient and the remainder.' : '.');
    var steps = ld.steps.slice();
    steps.push(r ? 'The quotient is ' + $(ld.q) + ' and the remainder is ' + $(ld.r) + '. Check: ' + $(ld.q + ' \\times ' + d + ' + ' + ld.r + ' = ' + T.commas(n)) + '.' : 'The quotient is ' + $(ld.q) + '. Check: ' + $(ld.q + ' \\times ' + d + ' = ' + T.commas(n)) + '.');
    return {
      q: q, a: r ? multi([part('Quotient:', num(ld.q, 'int')), part('Remainder:', num(ld.r, 'int'))]) : num(ld.q, 'int'), steps: steps,
      hint: 'Start from the left: how many times does ' + d + ' go into the first part of the number?',
      chk: { kind: 'ld', n: n, d: d }
    };
  });

  function decPlaces(x) { var s = D(x), i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  G('g6.decimal-fluency', function (R, ctx) {
    var l = lv(ctx), op = R.pick(BY(ctx, ['+', '-', '+', '-', 'x'], ['+', '-', 'x', '/'], ['x', '/', '-', '/']));
    function dec(lo, hi, dp) { return Q(R.int(Math.round(lo * Math.pow(10, dp)), Math.round(hi * Math.pow(10, dp))), Math.pow(10, dp)); }
    var a, b, ans, st;
    if (op === '+') {
      a = dec(1, l === 1 ? 50 : 200, R.int(1, 2)); b = dec(0.1, 50, R.int(1, l === 1 ? 2 : 3)); ans = a.add(b);
      st = ['Line up the decimal points so each place adds to the same place (write zeros to fill in if it helps).', $(D(a) + ' + ' + D(b) + ' = ' + D(ans)) + '.', 'Estimate to check: about ' + Math.round(a.toNumber()) + ' + ' + Math.round(b.toNumber()) + ' = ' + (Math.round(a.toNumber()) + Math.round(b.toNumber())) + '.'];
    } else if (op === '-') {
      a = l === 1 ? dec(10, 90, 1) : (R.coin() ? Q(R.int(5, 50)) : dec(5, 90, 1)); do { b = dec(0.5, a.toNumber() - 0.5, R.int(1, l === 1 ? 1 : 2)); } while (b.ge(a) || b.isZero());
      ans = a.sub(b);
      st = ['Line up the decimal points. ' + (decPlaces(b) > decPlaces(a) ? 'Write ' + $(D(a)) + ' as ' + $(qq(a).toDec(decPlaces(b))) + ' so both have the same number of places.' : 'Subtract place by place, regrouping when needed.'),
        $(D(a) + ' - ' + D(b) + ' = ' + D(ans)) + '.', 'Check by adding: ' + $(D(ans) + ' + ' + D(b) + ' = ' + D(a)) + '.'];
    } else if (op === 'x') {
      a = dec(0.2, l === 2 ? 12 : 30, R.int(1, 2)); b = dec(0.2, 9, R.int(1, 2)); if (a.isInt()) a = a.add(Q(1, 10)); if (b.isInt()) b = b.add(Q(1, 10));
      ans = a.mul(b);
      var ai = a.mul(Math.pow(10, decPlaces(a))), bi = b.mul(Math.pow(10, decPlaces(b))), pl = decPlaces(a) + decPlaces(b);
      st = ['Multiply as if there were no decimal points: ' + $(D(ai) + ' \\times ' + D(bi) + ' = ' + D(ai.mul(bi))) + '.', 'The factors have ' + decPlaces(a) + ' + ' + decPlaces(b) + ' = ' + pl + ' decimal places in all, so the product has ' + pl + ': ' + $(ai.mul(bi).div(Math.pow(10, pl)).toDec(pl)) + (decPlaces(ans) < pl ? ' = ' + $(D(ans)) : '') + '.',
        'Estimate to check: about ' + Math.round(a.toNumber()) + ' × ' + Math.max(1, Math.round(b.toNumber())) + ' = ' + Math.round(a.toNumber()) * Math.max(1, Math.round(b.toNumber())) + '.'];
    } else {
      b = l === 2 ? dec(0.2, 9, 1) : dec(0.12, 9, 2); if (b.isInt()) b = b.add(Q(1, 10)); ans = l === 2 ? dec(2, 60, R.int(0, 1)) : dec(2, 90, R.int(0, 1)); a = ans.mul(b);
      var sh = Math.pow(10, decPlaces(b));
      st = ['Make the divisor a whole number: multiply both numbers by ' + sh + '. This does not change the quotient.', $(D(a) + ' \\div ' + D(b) + ' = ' + D(a.mul(sh)) + ' \\div ' + D(b.mul(sh))) + '.',
        $(D(a.mul(sh)) + ' \\div ' + D(b.mul(sh)) + ' = ' + D(ans)) + '.', 'Check: ' + $(D(ans) + ' \\times ' + D(b) + ' = ' + D(a)) + '.'];
    }
    var sym = op === '+' ? ' + ' : op === '-' ? ' - ' : op === 'x' ? ' \\times ' : ' \\div ';
    return {
      q: 'Find ' + $(D(a) + sym + D(b)) + '.', a: numD(ans), steps: st,
      hint: op === '+' || op === '-' ? 'Line up the decimal points first.' : op === 'x' ? 'Multiply the whole numbers, then count decimal places.' : 'Move both decimal points the same number of places so you divide by a whole number.',
      chk: { kind: 'dec', a: a.toPlain(), b: b.toPlain(), op: op }
    };
  });

  G('g6.gcf-lcm', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['gcf', 'lcm', 'gcf', 'lcm'], ['gcf', 'lcm', 'gstory', 'lstory'], ['gcf', 'lcm', 'gstory', 'lstory', 'which']));
    var a, b, g;
    function gcfPair() { var gg = R.int(2, l === 1 ? 6 : 12), m, n; do { m = R.int(1, Math.floor(100 / gg)); n = R.int(1, Math.floor(100 / gg)); } while (m === n || U.gcd(m, n) !== 1 || m * gg > (l === 1 ? 40 : 100) || n * gg > (l === 1 ? 40 : 100) || (m === 1 && n === 1)); return [m * gg, n * gg, gg]; }
    function lcmPair() { var x, y; do { x = R.int(2, l === 3 ? 15 : 12); y = R.int(2, l === 3 ? 15 : 12); } while (x === y || x % y === 0 || y % x === 0); return [x, y]; }
    function facs(n) { return U.factors(n).join(', '); }
    if (shape === 'gcf' || shape === 'gstory') {
      var p = gcfPair(); a = p[0]; b = p[1]; g = U.gcd(a, b);
      var st = ['List the factors of each number.', 'Factors of ' + a + ': ' + facs(a) + '.', 'Factors of ' + b + ': ' + facs(b) + '.', 'The greatest factor in both lists is ' + $(g) + '.'];
      if (shape === 'gcf') return { q: 'Find the greatest common factor of ' + $(a) + ' and ' + $(b) + '.', a: num(g, 'int'), steps: st, hint: 'Which numbers divide both ' + a + ' and ' + b + ' with no remainder? Take the biggest.', chk: { kind: 'gcf', a: a, b: b } };
      var it = R.pick([['pencils', 'erasers', 'kits'], ['apples', 'oranges', 'baskets'], ['red roses', 'white roses', 'bouquets'], ['boys', 'girls', 'teams']]);
      return {
        q: 'There are ' + $(a) + ' ' + it[0] + ' and ' + $(b) + ' ' + it[1] + '. They are split into identical ' + it[2] + ', each with the same mix, with nothing left over. What is the greatest number of ' + it[2] + ' that can be made?',
        a: num(g, 'int'), steps: ['The number of ' + it[2] + ' must divide both ' + a + ' and ' + b + ' evenly, so it is a common factor. We want the greatest one: the GCF.'].concat(st.slice(1), ['So ' + g + ' ' + it[2] + ', each with ' + a / g + ' ' + it[0] + ' and ' + b / g + ' ' + it[1] + '.']),
        hint: 'Splitting into equal groups with nothing left over means a factor of both numbers.', chk: { kind: 'gcf', a: a, b: b }
      };
    }
    if (shape === 'lcm' || shape === 'lstory') {
      var pr = lcmPair(); a = pr[0]; b = pr[1]; var m = U.lcm(a, b), ma = [], mb = [];
      for (var i = 1; i <= m / a; i++) ma.push(a * i); for (i = 1; i <= m / b; i++) mb.push(b * i);
      var st2 = ['List multiples of each number until one shows up in both lists.', 'Multiples of ' + a + ': ' + ma.join(', ') + ', …', 'Multiples of ' + b + ': ' + mb.join(', ') + ', …', 'The first number in both lists is ' + $(m) + '.'];
      if (shape === 'lcm') return { q: 'Find the least common multiple of ' + $(a) + ' and ' + $(b) + '.', a: num(m, 'int'), steps: st2, hint: 'Count by ' + Math.max(a, b) + 's and stop at the first number that ' + Math.min(a, b) + ' also divides.', chk: { kind: 'lcm', a: a, b: b } };
      var s2 = R.pick([
        ['Hot dogs come in packs of ' + $(a) + ' and buns in packs of ' + $(b) + '. What is the smallest number of hot dogs you can buy to have exactly the same number of hot dogs and buns?', 'hot dogs'],
        ['One light blinks every ' + $(a) + ' seconds and another every ' + $(b) + ' seconds. They just blinked together. In how many seconds will they next blink together?', 'seconds'],
        [name(R) + ' visits the library every ' + $(a) + ' days and ' + name(R) + ' every ' + $(b) + ' days. They were both there today. In how many days will they both be there again?', 'days']]);
      return { q: s2[0], a: num(m, 'int'), unit: s2[1], steps: ['The answer must be a multiple of both ' + a + ' and ' + b + ', and the smallest one: the LCM.'].concat(st2.slice(1)), hint: 'Things that repeat and line up again need a common multiple.', chk: { kind: 'lcm', a: a, b: b } };
    }
    var useG = R.coin();
    var qs = useG ? ['A teacher splits 24 markers and 36 crayons into identical bags with nothing left over. What is the most bags she can make?', 'A florist has 18 tulips and 30 daisies to make identical bunches using all of them. What is the most bunches?']
      : ['Juice boxes come in packs of 6 and straws in packs of 8. What is the least number of each you can buy to have the same number?', 'Two buses leave the station together. One returns every 15 minutes and the other every 20 minutes. When are they at the station together again?'];
    return {
      q: R.pick(qs) + ' Which do you need?', a: mcKeep(['the greatest common factor (GCF)', 'the least common multiple (LCM)'], useG ? 0 : 1),
      steps: useG ? ['The items are split into equal groups with nothing left over, so the number of groups divides both amounts.', 'A number that divides both is a common factor, and we want the most groups: the GCF.'] : ['Packs or repeats add up in steps, so the answer must be a multiple of both numbers.', 'We want the first time they match: the least common multiple.'],
      hint: 'Splitting into equal groups uses factors; repeating until things match uses multiples.', chk: { kind: 'which' }
    };
  });

  G('g6.distributive-with-gcf', function (R, ctx) {
    var l = lv(ctx), g = R.int(2, l === 1 ? 6 : 12), m, n;
    do { m = R.int(1, 12); n = R.int(1, 12); } while (m === n || U.gcd(m, n) !== 1 || g * m > 100 || g * n > 100 || (m === 1 && n === 1));
    var a = g * m, b = g * n, shape = R.pick(BY(ctx, ['fill', 'fill', 'mc'], ['fill', 'mc', 'fill'], ['fill', 'mc', 'expand']));
    var st = ['Find the greatest common factor of ' + a + ' and ' + b + ': it is ' + $(g) + '.', 'Write each number as ' + g + ' times something: ' + $(a + ' = ' + g + ' \\times ' + m) + ' and ' + $(b + ' = ' + g + ' \\times ' + n) + '.',
      'The distributive property lets you pull out the ' + g + ': ' + $(a + ' + ' + b + ' = ' + g + '(' + m + ' + ' + n + ')') + '.', 'Check: ' + $(g + ' \\times ' + (m + n) + ' = ' + (a + b)) + ' and ' + $(a + ' + ' + b + ' = ' + (a + b)) + '.'];
    if (shape === 'fill') return {
      q: 'Use the greatest common factor to write ' + $(a + ' + ' + b) + ' as ' + $('\\square(\\square + \\square)') + '.',
      a: multi([part('Outside the parentheses:', num(g, 'int')), part('First number inside:', num(m, 'int')), part('Second number inside:', num(n, 'int'))]), steps: st,
      hint: 'First find the GCF of ' + a + ' and ' + b + '. Then divide each number by it.', chk: { kind: 'gcfd', a: a, b: b, g: g, m: m, n: n }
    };
    if (shape === 'expand') {
      var x = R.pick(['x', 'y', 'n', 'a']);
      return {
        q: 'Factor ' + $(a + ' + ' + b + x) + ' using the greatest common factor of ' + a + ' and ' + b + '.',
        a: { t: 'expr', v: g + '(' + m + '+' + n + x + ')', vars: [x], form: 'factored' },
        steps: ['The GCF of ' + a + ' and ' + b + ' is ' + $(g) + '.', $(a + ' = ' + g + ' \\times ' + m) + ' and ' + $(b + x + ' = ' + g + ' \\times ' + T.mono(n, x)) + '.', 'So ' + $(a + ' + ' + b + x + ' = ' + g + '(' + m + ' + ' + T.mono(n, x) + ')') + '. Check by multiplying out.'],
        hint: 'Pull out the GCF of the numbers ' + a + ' and ' + b + '.', chk: { kind: 'expr', g: g, m: m, n: n, x: x }
      };
    }
    var wr = ['$' + g + '(' + m + ' + ' + b + ')$', '$' + g + ' + (' + m + ' + ' + n + ')$', '$' + a + '(' + 1 + ' + ' + n + ')$'];
    var f = U.factors(g).filter(function (z) { return z > 1 && z < g; });
    if (f.length) { var ff = R.pick(f); wr.unshift('$' + ff + '(' + a / ff + ' + ' + b / ff + ')$'); }
    return {
      q: 'Which shows ' + $(a + ' + ' + b) + ' written with the greatest common factor pulled out?',
      a: mc('$' + g + '(' + m + ' + ' + n + ')$', wr.slice(0, 3)),
      steps: st.concat(f.length ? ['A choice like ' + wr[0] + ' is equal, but ' + wr[0].match(/\d+/)[0] + ' is not the greatest common factor.'] : []),
      hint: 'The number outside must be the greatest common factor, and it must divide both numbers.', chk: { kind: 'mc' }
    };
  });

  // ================================================================== unit: negative numbers
  var SIT = [ // [words, sign, pair group, largest sensible size]
    ['a temperature of {n} degrees below zero', -1, 0, 30], ['a temperature of {n} degrees above zero', 1, 0, 40],
    ['a diver {n} feet below sea level', -1, 1, 120], ['a bird flying {n} feet above sea level', 1, 1, 150],
    ['a deposit of \\${n} into a bank account', 1, 2, 150], ['a withdrawal of \\${n} from a bank account', -1, 2, 150],
    ['a gain of {n} yards in a football game', 1, 3, 25], ['a loss of {n} yards in a football game', -1, 3, 15],
    ['a parking level {n} floors below the street', -1, 4, 5], ['an office {n} floors above the street', 1, 4, 30],
    ['a debt of \\${n}', -1, 5, 150], ['earning {n} points in a game', 1, 6, 50], ['losing {n} points in a game', -1, 6, 50]
  ];
  function sit(s, n) { return s[0].replace('{n}', Math.min(n, s[3])); }
  function sitN(s, n) { return Math.min(n, s[3]); }
  G('g6.negatives-in-context', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['write', 'write', 'which'], ['write', 'which', 'opp'], ['write', 'which', 'opp', 'zero']));
    var n = R.int(2, l === 1 ? 20 : 150);
    if (shape === 'write') {
      var s = R.pick(SIT);
      return {
        q: 'Write a positive or negative number for ' + sit(s, n) + '.', a: num(s[1] * sitN(s, n), 'int'),
        steps: ['Pick which direction is positive: above zero, up, gaining and putting money in are positive; below zero, down, losing and taking out are negative.',
          cap(sit(s, n)) + ' is ' + (s[1] > 0 ? 'on the positive side' : 'on the negative side') + ', so the number is ' + $(s[1] * sitN(s, n)) + '.'],
        hint: 'Is it above or below zero, a gain or a loss?',
        chk: { kind: 'val', v: s[1] * sitN(s, n) }
      };
    }
    if (shape === 'opp') {
      var g = R.int(0, 6), pairs = SIT.filter(function (s) { return s[2] === g; }), p = R.shuffle(pairs);
      if (p.length < 2) p = [SIT[0], SIT[1]];
      n = Math.min(sitN(p[0], n), sitN(p[1], n));
      return {
        q: cap(sit(p[0], n)) + ' is written as ' + $(p[0][1] * n) + '. What number stands for ' + sit(p[1], n) + '?', a: num(p[1][1] * n, 'int'),
        steps: ['The two situations go in opposite directions by the same amount.', 'Opposite directions get opposite signs, so the number is ' + $(p[1][1] * n) + '.'],
        hint: 'Same size, opposite direction.', chk: { kind: 'val', v: p[1][1] * n }
      };
    }
    if (shape === 'zero') {
      var zs = [['the height of a diver, in feet', 'sea level', ['the bottom of the ocean', 'the top of a mountain', 'the deepest a diver can go']],
        ['the balance of a bank account, in dollars', 'an account with no money in it and no debt', ['an account with a lot of money', 'a very large debt', 'the most you can take out']],
        ['the floors of a building, with the street level as 0', 'the floor at street level', ['the top floor', 'the lowest parking level', 'the roof']]];
      var z = R.pick(zs);
      return {
        q: 'Positive and negative numbers describe ' + z[0] + '. What does 0 stand for?', a: mc(z[1], z[2]),
        steps: ['Zero is the starting point between the two directions.', 'Here, 0 means ' + z[1] + '. Numbers above it are positive and numbers below it are negative.'],
        hint: 'Zero is the point between "up" and "down".', chk: { kind: 'mc' }
      };
    }
    var negs = SIT.filter(function (s) { return s[1] < 0; }), poss = SIT.filter(function (s) { return s[1] > 0; }), right = R.pick(negs);
    n = Math.min(n, right[3], 25);
    return {
      q: 'Which situation could be described by the number ' + $(-n) + '?', a: mc(cap(sit(right, n)), R.sample(poss, 3).map(function (s) { return cap(sit(s, n)); })),
      steps: ['A negative number stands for the "below", "loss" or "taking away" direction.', 'Only one choice goes in that direction: ' + sit(right, n) + '.'],
      hint: 'Look for below zero, down, a loss or money going out.', chk: { kind: 'mc' }
    };
  });

  function SV(x) { x = qq(x); var d = x.den(); if (d === 3 || d === 4 || d === 8 || d === 6) return x.abs().gt(1) ? MX(x) : F(x); return DT(x); }
  function numSV(x, form) { x = qq(x); var d = x.den(); return d === 3 || d === 4 || d === 8 || d === 6 ? numM(x, form) : numD(x, form); }
  function rnd(R, l, neg) { // a rational number by level: integers, then decimals, then fractions
    var v;
    if (l === 1) v = Q(R.int(1, 15));
    else if (l === 2) v = R.coin() ? Q(R.int(1, 99), 10) : Q(R.int(1, 12));
    else v = R.coin() ? Q(R.int(1, 15), R.pick([3, 4, 8])) : Q(R.int(1, 99), 10);
    if (neg === undefined ? R.coin() : neg) v = v.neg();
    return v;
  }
  G('g6.opposites', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['opp', 'opp', 'dneg'], ['opp', 'dneg', 'pair'], ['opp', 'dneg', 'tneg', 'pair']));
    var v = rnd(R, l); if (v.isZero()) v = Q(3);
    if (shape === 'opp') return {
      q: 'What is the opposite of ' + $(SV(v)) + '?', a: numSV(v.neg()),
      steps: ['Opposites are the same distance from 0 on different sides of it.', $(SV(v)) + ' is ' + $(SV(v.abs())) + ' units ' + (v.sign() < 0 ? 'left' : 'right') + ' of 0, so its opposite is ' + $(SV(v.abs())) + ' units ' + (v.sign() < 0 ? 'right' : 'left') + ': ' + $(SV(v.neg())) + '.'],
      hint: 'Same distance from 0, other side.', chk: { kind: 'val', v: v.neg().toPlain() }
    };
    if (shape === 'dneg') {
      var a = v.abs();
      return {
        q: 'Simplify ' + $('-(-' + SV(a) + ')') + '.', a: numSV(a),
        steps: ['Read the minus sign in front as "the opposite of".', $('-' + SV(a)) + ' is the opposite of ' + $(SV(a)) + '.', 'The opposite of ' + $('-' + SV(a)) + ' is back on the other side of 0: ' + $(SV(a)) + '. So ' + $('-(-' + SV(a) + ') = ' + SV(a)) + '.'],
        hint: 'The opposite of the opposite takes you back where you started.', chk: { kind: 'val', v: a.toPlain() }
      };
    }
    if (shape === 'tneg') {
      var b = v.abs();
      return {
        q: 'Simplify ' + $('-(-(-' + SV(b) + '))') + '.', a: numSV(b.neg()),
        steps: ['Work from the inside out. ' + $('-(-' + SV(b) + ') = ' + SV(b)) + '.', 'Then ' + $('-(' + SV(b) + ') = -' + SV(b)) + '.', 'Three "opposites" flip the side three times, ending on the negative side: ' + $('-' + SV(b)) + '.'],
        hint: 'Each minus sign flips the number to the other side of 0.', chk: { kind: 'val', v: b.neg().toPlain() }
      };
    }
    var d = v.abs();
    return {
      q: 'Which two numbers are exactly ' + $(SV(d)) + ' units from 0 on a number line? Type both, with a comma between.', a: { t: 'set', v: [numSV(d).v, numSV(d.neg()).v] },
      steps: ['Go ' + $(SV(d)) + ' units right of 0 and ' + $(SV(d)) + ' units left of 0.', 'The numbers are ' + $(SV(d)) + ' and ' + $(SV(d.neg())) + '. They are opposites.'],
      hint: 'One is on each side of 0.', chk: { kind: 'set', v: [d.toPlain(), d.neg().toPlain()] }
    };
  });

  G('g6.rational-number-line', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['read', 'read', 'between'], ['read', 'between', 'half', 'letter'], ['read', 'between', 'half', 'letter']));
    var sub = R.pick(l === 1 ? [2, 4] : [2, 4, 5, 10]), hi = R.int(-1, 1), lo = hi - R.int(3, 4);
    if (shape === 'read') {
      var j; do { j = R.int(1, (hi - lo) * sub - 1); } while (j % sub === 0 || lo * sub + j >= 0);
      var v = Q(lo * sub + j, sub);
      return {
        q: 'What number is at point A?', a: numD(v),
        viz: { name: 'g6-line', opts: { min: lo, max: hi, step: 1, sub: sub, points: [{ v: v.toPlain(), label: 'A' }] }, label: 'A number line from ' + lo + ' to ' + hi + ' with point A' },
        steps: ['Each whole unit is cut into ' + sub + ' equal parts, so each small step is ' + $(F(Q(1, sub))) + (sub === 2 || sub === 4 || sub === 5 || sub === 10 ? ' = ' + $(D(Q(1, sub))) : '') + '.',
          'A is between ' + $(v.floor().num()) + ' and ' + $(v.floor().num() + 1) + '. Count steps to the left from ' + $(v.floor().num() + 1) + ': ' + v.floor().add(1).sub(v).mul(sub).num() + ' step' + (v.floor().add(1).sub(v).mul(sub).num() === 1 ? '' : 's') + '.',
          'So A is at ' + $(DT(v)) + (v.isTerminating() && !v.isInt() ? ', which is also ' + $(MX(v)) : '') + '.'],
        hint: 'Find the size of one small step first. Negative numbers get smaller as you go left.', chk: { kind: 'val', v: v.toPlain() }
      };
    }
    if (shape === 'between') {
      var w = R.int(1, 9), fr = l === 1 ? Q(1, 2) : Q(R.int(1, 9), 10), x = Q(w).add(fr).neg();
      var c = $(-(w + 1) + '\\text{ and }' + (-w)), ch = [c, $(-w + '\\text{ and }' + (-w + 1)), $(w + '\\text{ and }' + (w + 1)), $(-(w + 2) + '\\text{ and }' + (-(w + 1)))];
      return {
        q: 'Between which two integers is ' + $(DT(x)) + '?', a: mc(ch[0], ch.slice(1)),
        steps: [$(DT(x)) + ' is the opposite of ' + $(DT(x.neg())) + ', which is between ' + w + ' and ' + (w + 1) + '.', 'Flip both across 0: ' + $(DT(x)) + ' is between ' + $(-(w + 1)) + ' and ' + $(-w) + '.',
          'It is ' + $(DT(fr)) + ' to the left of ' + $(-w) + ', not to the right. ' + $(-(w + 1) + ' < ' + DT(x) + ' < ' + (-w)) + '.'],
        hint: 'Think about where ' + D(x.neg()) + ' is, then reflect across 0.', chk: { kind: 'mc' }
      };
    }
    if (shape === 'half') {
      var k = R.int(1, 9), m = R.coin() ? Q(k).add(Q(1, 2)).neg() : Q(2 * k + 1, 4).neg();
      var aa = m.sub(R.coin() ? Q(1, 2) : Q(1, 4)), bb = m.mul(2).sub(aa);
      return {
        q: 'What number is exactly halfway between ' + $(DT(aa)) + ' and ' + $(DT(bb)) + '?', a: numD(m),
        steps: ['The distance between them is ' + $(DT(bb.sub(aa))) + '.', 'Half of that is ' + $(DT(bb.sub(aa).div(2))) + '. Move that far right from ' + $(DT(aa)) + '.', 'The middle is ' + $(DT(m)) + '.'],
        hint: 'Find the gap between the two numbers, then go half of it from the left one.', chk: { kind: 'half', a: aa.toPlain(), b: bb.toPlain() }
      };
    }
    // letter: which point is at v
    var t = Q(R.int(1, 3)).add(Q(1, 2)).neg(); if (l === 3 && R.coin()) t = Q(-R.int(1, 3) * 4 - 3, 4).add(0);
    var tFloor = t.floor().num(), mirror = Q(2 * (tFloor + 1)).sub(t), cand = U.uniq([t.toPlain(), mirror.toPlain(), t.neg().toPlain(), t.add(-1).toPlain()]).slice(0, 4);
    var lab = ['A', 'B', 'C', 'D'], order = R.shuffle(cand), pts = order.map(function (s, i) { return { v: s, label: lab[i] }; });
    var mn = Math.min.apply(null, order.map(function (s) { return Math.floor(Q.from(s).toNumber()); })) - 1, mxv = Math.max.apply(null, order.map(function (s) { return Math.ceil(Q.from(s).toNumber()); })) + 1;
    var idx = order.indexOf(t.toPlain());
    return {
      q: 'Which point is at ' + $(DT(t)) + '?', a: mcKeep(lab.slice(0, order.length), idx),
      viz: { name: 'g6-line', opts: { min: mn, max: mxv, step: 1, sub: t.den(), points: pts }, label: 'A number line with points ' + lab.slice(0, order.length).join(', ') },
      steps: [$(DT(t)) + ' is negative, so it is left of 0.', 'It is ' + $(DT(t.abs())) + ' units from 0, so it sits between ' + $(tFloor) + ' and ' + $(tFloor + 1) + ', a part of a step to the left of ' + $(tFloor + 1) + '.', 'That is point ' + lab[idx] + '.'],
      hint: 'Going left from 0: first ' + $(tFloor + 1) + ', then ' + $(tFloor) + '.', chk: { kind: 'mc' }
    };
  });

  function texN(v, style) { return style === 'mixed' ? MX(v) : DT(v); }
  G('g6.order-rational-numbers', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['cmp', 'cmp', 'order', 'cold'], ['cmp', 'order', 'cold', 'tf'], ['cmp', 'order', 'order', 'tf']));
    function val() { var v = rnd(R, l); return v; }
    if (shape === 'cmp' || shape === 'tf') {
      var a = val(), b = val(), tries = 0;
      while ((a.eq(b) && shape === 'tf') || (a.sign() >= 0 && b.sign() >= 0) || tries < 1) { a = val(); b = val(); tries++; if (tries > 30) { a = Q(-8); b = Q(-3); break; } }
      if (l === 3 && R.chance(0.2)) { b = Q(-R.int(1, 15), R.pick([4, 8])); if (b.isInt()) b = Q(-3, 4); a = b; } // equal values written two ways
      var showA = SV(a), showB = SV(b);
      if (a.eq(b)) showB = /\\frac/.test(showA) ? D(b) : F(b);
      var rel = a.lt(b) ? '<' : a.gt(b) ? '>' : '=';
      var st = ['On a number line, the number farther left is less.', $(showA) + ' and ' + $(showB) + (rel === '=' ? ' are the same number written two ways.' : ': ' + $(rel === '<' ? showA : showB) + ' is farther left.'),
        rel === '=' ? 'So they are equal.' : 'So ' + $(showA + ' ' + rel + ' ' + showB) + '.'];
      if (a.sign() < 0 && b.sign() < 0 && rel !== '=') st.splice(2, 0, 'For two negatives, the one with the bigger distance from 0 is farther left, so it is less.');
      if (shape === 'cmp') return { q: 'Choose the sign that makes this true: ' + $(showA + ' \\;\\square\\; ' + showB), a: mcKeep(['$<$', '$>$', '$=$'], rel === '<' ? 0 : rel === '>' ? 1 : 2), steps: st, hint: 'Picture both on a number line. Which is farther left?', chk: { kind: 'cmp', a: a.toPlain(), b: b.toPlain(), rel: rel } };
      var claim = R.pick(['<', '>']), truth = claim === rel;
      return { q: 'True or false: ' + $(showA + ' ' + claim + ' ' + showB), a: tf(truth), steps: st.concat(['The statement ' + $(showA + ' ' + claim + ' ' + showB) + ' is ' + (truth ? 'true' : 'false') + '.']), hint: 'Farther left is less, even when the digits look bigger.', chk: { kind: 'tfcmp', a: a.toPlain(), b: b.toPlain(), claim: claim, truth: truth } };
    }
    if (shape === 'cold') {
      var t1 = -R.int(1, 25), t2; do { t2 = -R.int(1, 25); } while (t2 === t1); if (R.chance(0.3)) t2 = R.int(0, 10);
      var colder = Math.min(t1, t2);
      return {
        q: 'At 6 a.m. it was ' + $(t1 + '^\\circ\\text{F}') + ' in one town and ' + $(t2 + '^\\circ\\text{F}') + ' in another. Which temperature is colder? Type the number.', a: num(colder, 'int'),
        steps: ['Colder means less. On a thermometer, less is lower; on a number line, it is farther left.', $(Math.min(t1, t2) + ' < ' + Math.max(t1, t2)) + ', because ' + $(Math.min(t1, t2)) + ' is farther below 0.', 'So ' + $(colder + '^\\circ\\text{F}') + ' is colder.'],
        hint: 'Colder is lower on a thermometer.', chk: { kind: 'min', vals: [t1, t2] }
      };
    }
    var vals = [], guard = 0;
    while (vals.length < 4 && guard++ < 100) { var v = val(); if (!vals.some(function (u) { return u.eq(v); })) vals.push(v); }
    if (!vals.some(function (u) { return u.sign() < 0; })) vals[0] = vals[0].abs().neg();
    if (vals.filter(function (u) { return u.sign() < 0; }).length < 2 && l > 1) { vals[1] = vals[1].abs().neg(); }
    vals = U.uniq(vals.map(function (u) { return u.toPlain(); })).map(function (s) { return Q.from(s); });
    var sorted = vals.slice().sort(function (x, y) { return x.cmp(y); });
    return {
      q: 'Write these numbers in order from least to greatest, separated by commas: ' + $(vals.map(function (x) { return SV(x); }).join(',\\ ')),
      a: { t: 'tuple', v: sorted.map(function (x) { return numSV(x).v; }) },
      steps: ['Negative numbers come first, and the negative farthest from 0 is the least.', 'Then come 0 and the positive numbers, from closest to 0 to farthest.', 'Order: ' + $(sorted.map(function (x) { return SV(x); }).join(' < ')) + '.'],
      hint: 'Place each number on a number line in your head, from left to right.', chk: { kind: 'sort', vals: vals.map(function (x) { return x.toPlain(); }) }
    };
  });

  G('g6.absolute-value', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['abs', 'abs', 'set', 'debt'], ['abs', 'sum', 'set', 'debt', 'cmp'], ['sum', 'set', 'debt', 'cmp', 'abs']));
    var v = rnd(R, l, true);
    if (shape === 'abs') { if (R.chance(0.3)) v = v.neg(); return { q: 'Find ' + $(T.abs(SV(v))) + '.', a: numSV(v.abs()), steps: ['Absolute value is the distance from 0 on a number line. A distance is never negative.', $(SV(v)) + ' is ' + $(SV(v.abs())) + ' units from 0, so ' + $(T.abs(SV(v)) + ' = ' + SV(v.abs())) + '.'], hint: 'How far is it from 0?', chk: { kind: 'val', v: v.abs().toPlain() } }; }
    if (shape === 'sum') {
      var a = rnd(R, 2, true), b = rnd(R, 2, R.coin()), useSub = R.coin() && a.abs().gt(b.abs());
      var res = useSub ? a.abs().sub(b.abs()) : a.abs().add(b.abs());
      return { q: 'Find ' + $(T.abs(SV(a)) + (useSub ? ' - ' : ' + ') + T.abs(SV(b))) + '.', a: numSV(res), steps: ['Find each absolute value first: ' + $(T.abs(SV(a)) + ' = ' + SV(a.abs())) + ' and ' + $(T.abs(SV(b)) + ' = ' + SV(b.abs())) + '.', 'Then ' + $(SV(a.abs()) + (useSub ? ' - ' : ' + ') + SV(b.abs()) + ' = ' + SV(res)) + '.'], hint: 'Absolute value bars work like parentheses: find each one first.', chk: { kind: 'abssum', a: a.toPlain(), b: b.toPlain(), sub: useSub } };
    }
    if (shape === 'set') {
      var d = v.abs(), x = R.pick(['x', 'n', 'y']);
      return { q: 'Find every number ' + $(x) + ' with ' + $(T.abs(x) + ' = ' + SV(d)) + '. Type them with a comma between.', a: { t: 'set', v: [numSV(d).v, numSV(d.neg()).v] }, steps: ['We need every number that is ' + $(SV(d)) + ' units from 0.', 'Going right from 0: ' + $(SV(d)) + '. Going left: ' + $(SV(d.neg())) + '.', 'So ' + $(x + ' = ' + SV(d)) + ' or ' + $(x + ' = ' + SV(d.neg())) + '.'], hint: 'There is one on each side of 0.', chk: { kind: 'set', v: [d.toPlain(), d.neg().toPlain()] } };
    }
    if (shape === 'cmp') {
      var p = rnd(R, l, true), q2 = rnd(R, l, false); if (R.coin()) { var t = p; p = q2; q2 = t; }
      var rel = p.abs().lt(q2.abs()) ? '<' : p.abs().gt(q2.abs()) ? '>' : '=';
      return { q: 'Choose the sign that makes this true: ' + $(T.abs(SV(p)) + ' \\;\\square\\; ' + T.abs(SV(q2))), a: mcKeep(['$<$', '$>$', '$=$'], rel === '<' ? 0 : rel === '>' ? 1 : 2), steps: ['Find both absolute values: ' + $(SV(p.abs())) + ' and ' + $(SV(q2.abs())) + '.', 'Compare the distances: ' + $(SV(p.abs()) + ' ' + rel + ' ' + SV(q2.abs())) + '.', 'Notice that the absolute values compare sizes, not positions on the line.'], hint: 'Change each to a distance from 0 first.', chk: { kind: 'abscmp', a: p.toPlain(), b: q2.toPlain(), rel: rel } };
    }
    var n1 = R.int(5, 60), n2; do { n2 = R.int(5, 60); } while (n2 === n1);
    var N = names2(R), more = n1 > n2 ? 0 : 1;
    return {
      q: N[0] + '’s account balance is ' + $(T.money(-n1)) + ' and ' + N[1] + '’s is ' + $(T.money(-n2)) + '. Who owes more money?', a: mcKeep([N[0], N[1]], more),
      steps: ['A negative balance is a debt. The size of the debt is the absolute value.', $(T.abs(T.money(-n1)) + ' = ' + T.money(n1)) + ' and ' + $(T.abs(T.money(-n2)) + ' = ' + T.money(n2)) + '.', N[more] + ' owes more. Notice that ' + $(T.money(-Math.max(n1, n2)) + ' < ' + T.money(-Math.min(n1, n2))) + ': the bigger debt is the smaller balance.'],
      hint: 'Compare the sizes of the debts, which are absolute values.', chk: { kind: 'debt', a: n1, b: n2, v: more }
    };
  });

  var QUAD = ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV', 'on the x-axis', 'on the y-axis'];
  function quadOf(x, y) { return y === 0 ? 4 : x === 0 ? 5 : x > 0 ? (y > 0 ? 0 : 3) : (y > 0 ? 1 : 2); }
  G('g6.four-quadrants', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['quad', 'read', 'reflect'], ['quad', 'read', 'reflect', 'signs'], ['quad', 'reflect', 'reflect', 'signs', 'read']));
    var x = R.nz(-9, 9), y = R.nz(-9, 9);
    if (shape === 'quad') {
      if (l > 1 && R.chance(0.3)) { if (R.coin()) x = 0; else y = 0; }
      var qi = quadOf(x, y), choices = l === 1 ? QUAD.slice(0, 4) : QUAD;
      var why = qi === 4 ? 'The y-coordinate is 0, so the point is on the x-axis (it moves left or right, but not up or down).' : qi === 5 ? 'The x-coordinate is 0, so the point is on the y-axis (it moves up or down, but not left or right).' :
        'x is ' + (x > 0 ? 'positive (right)' : 'negative (left)') + ' and y is ' + (y > 0 ? 'positive (up)' : 'negative (down)') + ', which is ' + QUAD[qi] + '.';
      return { q: 'Where is the point ' + $(T.pt([x, y])) + '?', a: mcKeep(choices, qi), steps: ['The quadrants are numbered counterclockwise, starting at the top right: I (+, +), II (−, +), III (−, −), IV (+, −).', why], hint: 'Look at the sign of each coordinate: x first, then y.', chk: { kind: 'quad', x: x, y: y, v: qi } };
    }
    if (shape === 'read') {
      var lab = R.pick(['A', 'B', 'P', 'Q']);
      return { q: 'What are the coordinates of point ' + lab + '? Type them as ' + $('(x, y)') + '.', a: { t: 'tuple', v: [String(x), String(y)] }, viz: { name: 'g6-plane', opts: { xmin: -10, xmax: 10, ymin: -10, ymax: 10, points: [{ x: x, y: y, label: lab }] }, label: 'A coordinate plane with point ' + lab },
        steps: ['Start at the origin. Count left or right to the point: that is the x-coordinate, ' + $(x) + '.', 'Count up or down: that is the y-coordinate, ' + $(y) + '.', 'Point ' + lab + ' is ' + $(T.pt([x, y])) + '.'], hint: 'x first (left or right), then y (up or down).', chk: { kind: 'pt', x: x, y: y } };
    }
    if (shape === 'signs') {
      var q3 = R.int(0, 3), s = ['(+, +)', '(−, +)', '(−, −)', '(+, −)'];
      return { q: 'A point is in ' + QUAD[q3] + '. What are the signs of its coordinates?', a: mcKeep(s.map($), q3), steps: ['Quadrant I is top right; the quadrants go counterclockwise.', QUAD[q3] + ' is ' + ['right and up', 'left and up', 'left and down', 'right and down'][q3] + ', so the signs are ' + $(s[q3]) + '.'], hint: 'Right means x is positive; up means y is positive.', chk: { kind: 'mc' } };
    }
    var ax = R.pick(['x-axis', 'y-axis']), rx = ax === 'y-axis' ? -x : x, ry = ax === 'x-axis' ? -y : y;
    return { q: 'Reflect the point ' + $(T.pt([x, y])) + ' across the ' + ax + '. What is the new point?', a: { t: 'tuple', v: [String(rx), String(ry)] },
      steps: ['A reflection across the ' + ax + ' flips the point to the other side of that axis, the same distance away.', ax === 'x-axis' ? 'It moves up or down, so only the y-coordinate changes sign: ' + $(y + ' \\to ' + ry) + '.' : 'It moves left or right, so only the x-coordinate changes sign: ' + $(x + ' \\to ' + rx) + '.', 'The new point is ' + $(T.pt([rx, ry])) + '.'],
      hint: 'Across the x-axis, the y changes sign. Across the y-axis, the x changes sign.', chk: { kind: 'refl', x: x, y: y, ax: ax } };
  });

  G('g6.grid-distance', function (R, ctx) {
    var l = lv(ctx), vert = R.coin(), c = R.int(-8, 8), a, b;
    do { a = R.int(-9, 9); b = R.int(-9, 9); } while (a === b || (l > 1 && a * b >= 0 && R.chance(0.7)));
    var P = vert ? [c, a] : [a, c], Qp = vert ? [c, b] : [b, c], d = Math.abs(a - b), story = R.chance(0.3);
    var same = vert ? 'x' : 'y', diff = vert ? 'y' : 'x';
    var st = ['The points have the same ' + same + '-coordinate, so the segment is ' + (vert ? 'vertical' : 'horizontal') + '. Its length is the distance between the ' + diff + '-coordinates, ' + $(a) + ' and ' + $(b) + '.'];
    if (a === 0 || b === 0) st.push('One point has ' + diff + ' = 0, so the distance is just the other one’s distance from 0: ' + $(T.abs(a || b) + ' = ' + d) + '.');
    else if (a * b < 0) st.push('They are on opposite sides of 0, so add their distances from 0: ' + $(T.abs(a) + ' + ' + T.abs(b) + ' = ' + Math.abs(a) + ' + ' + Math.abs(b) + ' = ' + d) + '.');
    else st.push('They are on the same side of 0, so subtract their distances from 0: ' + $(Math.max(Math.abs(a), Math.abs(b)) + ' - ' + Math.min(Math.abs(a), Math.abs(b)) + ' = ' + d) + '.');
    st.push('The distance is ' + $(d) + ' units.');
    var p = {
      q: story ? 'On a town map, the library is at ' + $(T.pt(P)) + ' and the park is at ' + $(T.pt(Qp)) + '. Each unit is one block. How many blocks apart are they, walking along the street between them?' : 'Find the distance between ' + $(T.pt(P)) + ' and ' + $(T.pt(Qp)) + '.',
      a: num(d, 'int'), unit: story ? 'blocks' : 'units', steps: st, hint: 'Count the units between the ' + diff + '-coordinates. Is 0 between them?', chk: { kind: 'dist', a: a, b: b }
    };
    if (l === 1) p.viz = { name: 'g6-plane', opts: { xmin: -10, xmax: 10, ymin: -10, ymax: 10, points: [{ x: P[0], y: P[1], label: 'A' }, { x: Qp[0], y: Qp[1], label: 'B' }], segs: [[P[0], P[1], Qp[0], Qp[1]]] }, label: 'Two points on a coordinate plane joined by a segment' };
    return p;
  });

  // ================================================================== unit: expressions
  function powTex(b, e) { return T.pow(b, e); }
  function prodTex(b, e) { var a = []; for (var i = 0; i < e; i++) a.push(b); return a.join(' \\times '); }
  G('g6.whole-number-exponents', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['eval', 'eval', 'write', 'mc'], ['eval', 'write', 'mc', 'cmp'], ['frac', 'eval', 'write', 'cmp', 'frac']));
    var b, e;
    function pickBE(max) { var t = 0; do { b = R.int(2, l === 1 ? 6 : 12); e = R.int(2, l === 1 ? 4 : 5); t++; } while ((Math.pow(b, e) > max || (b === 2 && e === 2)) && t < 100); if (t >= 100) { b = 3; e = 3; } }
    if (shape === 'eval') {
      pickBE(l === 1 ? 300 : 10000); if (R.chance(0.15)) { b = 10; e = R.int(2, l === 1 ? 4 : 6); }
      var v = Math.pow(b, e), parts = [], run = b;
      for (var i = 2; i <= e; i++) { run *= b; parts.push(run); }
      return {
        q: 'Find the value of ' + $(powTex(b, e)) + '.', a: num(v, 'int'),
        steps: ['The exponent ' + e + ' says how many times ' + b + ' is used as a factor: ' + $(powTex(b, e) + ' = ' + prodTex(b, e)) + '.',
          'Multiply from left to right: ' + $([b].concat(parts).map(function (x) { return T.commas(x); }).join(' \\to ')) + '.', 'So ' + $(powTex(b, e) + ' = ' + T.commas(v)) + '.'],
        hint: 'Write ' + b + ' as a factor ' + e + ' times, then multiply.', chk: { kind: 'pow', b: b, e: e }
      };
    }
    if (shape === 'frac') {
      var base = R.coin() ? Q(R.int(1, 4), R.int(2, 5)) : Q(R.int(1, 15), 10); if (base.isInt() || base.eq(1)) base = Q(2, 3);
      var ee = R.int(2, base.den() <= 5 ? 3 : 2), val = base.pow(ee), bt = /\\frac/.test(DT(base)) ? F(base) : D(base);
      return {
        q: 'Find the value of ' + $(T.pow(bt, ee)) + '.', a: /frac/.test(bt) ? num(val) : numD(val),
        steps: ['The base is ' + $(bt) + ', used as a factor ' + ee + ' times: ' + $(T.pow(bt, ee) + ' = ' + prodTex(/frac/.test(bt) ? '\\left(' + bt + '\\right)' : bt, ee)) + '.',
          /frac/.test(bt) ? 'Multiply the tops and the bottoms: ' + $(F(val)) + '.' : 'Multiply: ' + $(D(val)) + '. (Count decimal places: ' + ee + ' factors with ' + decPlaces(base) + ' place' + (decPlaces(base) > 1 ? 's' : '') + ' each.)',
          base.lt(1) ? 'A base less than 1 gets smaller when it is raised to a power.' : 'Check the size: it should be more than the base.'],
        hint: 'Write out the factors, then multiply.', chk: { kind: 'powq', b: base.toPlain(), e: ee }
      };
    }
    if (shape === 'write') {
      pickBE(1e9); var useX = l === 3 && R.coin(), bb = useX ? R.pick(['x', 'a', 'n']) : b;
      return {
        q: 'Write ' + $(prodTex(bb, e)) + ' using an exponent.', a: useX ? { t: 'expr', v: bb + '^' + e, vars: [bb], form: 'simplified' } : multi([part('base', num(b, 'int')), part('exponent', num(e, 'int'))]),
        steps: [$(bb) + ' is used as a factor ' + e + ' times.', 'The repeated factor is the base and the count is the exponent: ' + $(powTex(bb, e)) + '.'],
        hint: 'Count how many times the same factor appears.', chk: { kind: 'write', b: bb, e: e }
      };
    }
    if (shape === 'mc') {
      pickBE(1000); if (b === e) e = e === 2 ? 3 : 2; if (Math.pow(e, b) === Math.pow(b, e)) { b = 3; e = 4; }
      return {
        q: 'Which is equal to ' + $(powTex(b, e)) + '?', a: mc($(prodTex(b, e)), [$(b + ' \\times ' + e), $(prodTex(e, b)), $(Array(e + 1).join(b + ' + ').slice(0, -3))]),
        steps: ['An exponent counts factors, not a single multiplication.', $(powTex(b, e)) + ' means ' + b + ' used as a factor ' + e + ' times: ' + $(prodTex(b, e) + ' = ' + Math.pow(b, e)) + '.', 'It is not ' + $(b + ' \\times ' + e + ' = ' + b * e) + '.'],
        hint: 'The small number tells how many times the big number is multiplied.', chk: { kind: 'mc' }
      };
    }
    var pr = R.pick([[2, 5], [2, 3], [2, 4], [3, 4], [2, 6], [3, 5], [4, 5]]), x = pr[0], y = pr[1]; if (R.coin()) { x = pr[1]; y = pr[0]; }
    var vA = Math.pow(x, y), vB = Math.pow(y, x), rel = vA < vB ? 0 : vA > vB ? 1 : 2;
    return {
      q: 'Choose the sign that makes this true: ' + $(powTex(x, y) + ' \\;\\square\\; ' + powTex(y, x)), a: mcKeep(['$<$', '$>$', '$=$'], rel),
      steps: [$(powTex(x, y) + ' = ' + prodTex(x, y) + ' = ' + vA) + '.', $(powTex(y, x) + ' = ' + prodTex(y, x) + ' = ' + vB) + '.', 'So ' + $(powTex(x, y) + ' ' + ['<', '>', '='][rel] + ' ' + powTex(y, x)) + '. Switching the base and the exponent usually changes the value.'],
      hint: 'Work out each power.', chk: { kind: 'powcmp', x: x, y: y, rel: rel }
    };
  });

  // order of operations: each template builds { tex, plain, steps } with exact values
  G('g6.order-of-operations-exponents', function (R, ctx) {
    var l = lv(ctx), t = R.pick(BY(ctx, [0, 1, 2, 3], [0, 1, 2, 3, 4, 5, 6], [3, 4, 5, 6, 7, 8])), s = [], tex, plain, v;
    var a, b, c, d, e;
    if (t === 0) { a = R.int(1, 20); b = R.int(2, 5); c = R.int(2, 5); e = 2; var p0 = c * c; v = a + b * p0; tex = a + ' + ' + b + ' \\times ' + c + '^{2}'; plain = a + '+' + b + '*' + c + '^2';
      s = ['Exponents first: ' + $(c + '^{2} = ' + p0) + '. The expression is now ' + $(a + ' + ' + b + ' \\times ' + p0) + '.', 'Multiply next: ' + $(b + ' \\times ' + p0 + ' = ' + b * p0) + '.', 'Add last: ' + $(a + ' + ' + b * p0 + ' = ' + v) + '.']; }
    else if (t === 1) { a = R.int(2, 6); b = R.int(2, 5); v = a * b * b; tex = a + ' \\times ' + b + '^{2}'; plain = a + '*' + b + '^2';
      s = ['The exponent belongs only to the ' + b + ': ' + $(b + '^{2} = ' + b * b) + '.', 'Then multiply: ' + $(a + ' \\times ' + b * b + ' = ' + v) + '.', 'Squaring first matters: ' + $('(' + a + ' \\times ' + b + ')^{2}') + ' would be ' + Math.pow(a * b, 2) + ', a different number.']; }
    else if (t === 2) { a = R.int(1, 6); b = R.int(1, 6); var sq2 = (a + b) * (a + b); c = R.int(1, sq2 - 1); v = sq2 - c; tex = '(' + a + ' + ' + b + ')^{2} - ' + c; plain = '(' + a + '+' + b + ')^2-' + c;
      s = ['Parentheses first: ' + $(a + ' + ' + b + ' = ' + (a + b)) + '.', 'Then the exponent: ' + $((a + b) + '^{2} = ' + sq2) + '.', 'Subtract: ' + $(sq2 + ' - ' + c + ' = ' + v) + '.']; }
    else if (t === 3) { b = R.int(2, 4); c = R.int(2, 6); var k = R.int(2, 6); d = b * b * k; v = k * c; tex = d + ' \\div ' + b + '^{2} \\times ' + c; plain = d + '/' + b + '^2*' + c;
      s = ['Exponent first: ' + $(b + '^{2} = ' + b * b) + '. Now it is ' + $(d + ' \\div ' + b * b + ' \\times ' + c) + '.', 'Multiply and divide from left to right. Divide first because it comes first: ' + $(d + ' \\div ' + b * b + ' = ' + k) + '.', 'Then ' + $(k + ' \\times ' + c + ' = ' + v) + '.']; }
    else if (t === 4) { a = R.int(2, 9); b = R.int(2, 9); c = R.int(1, a * a + b * b - 1); v = a * a + b * b - c; tex = a + '^{2} + ' + b + '^{2} - ' + c; plain = a + '^2+' + b + '^2-' + c;
      s = ['Exponents first: ' + $(a + '^{2} = ' + a * a) + ' and ' + $(b + '^{2} = ' + b * b) + '.', 'Add and subtract from left to right: ' + $(a * a + ' + ' + b * b + ' = ' + (a * a + b * b)) + ', then ' + $((a * a + b * b) + ' - ' + c + ' = ' + v) + '.']; }
    else if (t === 5) { b = R.int(5, 9); c = R.int(1, b - 1); a = R.int(1, 20); d = R.int(2, 4); var df = b - c; v = a + df * df * d; tex = a + ' + (' + b + ' - ' + c + ')^{2} \\times ' + d; plain = a + '+(' + b + '-' + c + ')^2*' + d;
      s = ['Parentheses: ' + $(b + ' - ' + c + ' = ' + df) + '.', 'Exponent: ' + $(df + '^{2} = ' + df * df) + '.', 'Multiply: ' + $(df * df + ' \\times ' + d + ' = ' + df * df * d) + '.', 'Add: ' + $(a + ' + ' + df * df * d + ' = ' + v) + '.']; }
    else if (t === 6) { a = R.int(2, 5); b = R.int(1, 4); c = R.int(2, 3); e = R.int(2, 3); var pw = Math.pow(c, e); v = a * (b + pw); tex = a + '(' + b + ' + ' + c + '^{' + e + '})'; plain = a + '*(' + b + '+' + c + '^' + e + ')';
      s = ['Inside the parentheses, the exponent comes first: ' + $(c + '^{' + e + '} = ' + pw) + '.', 'Finish the parentheses: ' + $(b + ' + ' + pw + ' = ' + (b + pw)) + '.', 'A number next to parentheses means multiply: ' + $(a + ' \\times ' + (b + pw) + ' = ' + v) + '.']; }
    else if (t === 7) { e = R.int(2, 4); var two = Math.pow(2, e); b = R.int(2, 3); c = R.int(2, 4); d = R.int(1, 5) * c; var mid = b * b * 2, val7 = two + mid - d / c; if (val7 < 0) d = c; v = two + mid - d / c; tex = '2^{' + e + '} + ' + b + '^{2} \\times 2 - ' + d + ' \\div ' + c; plain = '2^' + e + '+' + b + '^2*2-' + d + '/' + c;
      s = ['Exponents: ' + $('2^{' + e + '} = ' + two) + ' and ' + $(b + '^{2} = ' + b * b) + '. Now it is ' + $(two + ' + ' + b * b + ' \\times 2 - ' + d + ' \\div ' + c) + '.', 'Multiply and divide: ' + $(b * b + ' \\times 2 = ' + mid) + ' and ' + $(d + ' \\div ' + c + ' = ' + d / c) + '.', 'Add and subtract from left to right: ' + $(two + ' + ' + mid + ' - ' + d / c + ' = ' + v) + '.']; }
    else { var den = R.pick([2, 3]), m = R.int(1, 3) * den * den, ad = R.int(1, 9); var fq = Q(1, den).pow(2).mul(m); v = fq.add(ad).toPlain(); tex = '\\left(\\frac{1}{' + den + '}\\right)^{2} \\times ' + m + ' + ' + ad; plain = '(1/' + den + ')^2*' + m + '+' + ad;
      s = ['Exponent first: ' + $('\\left(\\frac{1}{' + den + '}\\right)^{2} = \\frac{1}{' + den + '} \\times \\frac{1}{' + den + '} = \\frac{1}{' + den * den + '}') + '.', 'Multiply: ' + $('\\frac{1}{' + den * den + '} \\times ' + m + ' = ' + DT(fq)) + '.', 'Add: ' + $(DT(fq) + ' + ' + ad + ' = ' + DT(Q.from(v))) + '.']; }
    return {
      q: 'Find the value of ' + $(tex) + '.', a: num(v), steps: s,
      hint: 'Order: parentheses, then exponents, then multiply and divide (left to right), then add and subtract (left to right).',
      chk: { kind: 'eval', plain: plain }
    };
  });

  G('g6.variables-meaning', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['mean', 'mean', 'build'], ['mean', 'build', 'build', 'value'], ['mean', 'build', 'value', 'two']));
    var n = name(R), p = R.int(3, 15);
    if (shape === 'mean') {
      var items = [
        ['notebooks', n + ' buys some notebooks for \\$' + p + ' each. Let ' + $('n') + ' be the number of notebooks. What does ' + $(p + 'n') + ' stand for?', 'the total cost of the notebooks, in dollars', ['the number of notebooks', p + ' notebooks', 'the cost of one notebook']],
        ['square', 'The perimeter of a square is ' + $('P = 4s') + '. What does ' + $('s') + ' stand for?', 'the length of one side of the square', ['the number of sides', 'the word "side"', 'the perimeter of the square']],
        ['3a', 'What does ' + $(p + 'a') + ' mean?', p + ' times a number ' + $('a'), [p + ' apples', 'the number ' + p + ' followed by the digit ' + $('a'), p + ' plus a number ' + $('a')]],
        ['laps', n + ' swims ' + $(p) + ' laps every day. Let ' + $('d') + ' be the number of days. What does ' + $(p + 'd') + ' stand for?', 'the total number of laps ' + n + ' swims in ' + $('d') + ' days', ['the number of days', p + ' days', 'the number of laps in one day']],
        ['age', n + ' is ' + $(p) + ' years older than a cousin. Let ' + $('c') + ' be the cousin’s age. What does ' + $('c + ' + p) + ' stand for?', n + '’s age', ['the cousin’s age', 'the number of cousins', p + ' cousins']]
      ];
      var it = R.pick(items);
      return { q: it[1], a: mc(cap(it[2]), it[3].map(cap)), steps: ['A letter in an expression stands for a number, not for a word or an object.', it[0] === '3a' ? $(p + 'a') + ' means ' + p + ' times the number ' + $('a') + ', written ' + $(p + ' \\times a') + '.' : 'Read the expression with the meaning of the letter in it.', 'So the answer is: ' + it[2] + '.'], hint: 'Ask: what number does the letter stand for, and what does the expression do to it?', chk: { kind: 'mc' } };
    }
    if (shape === 'build') {
      var ops = [
        ['A movie ticket costs \\$' + p + '. Write an expression for the cost of ' + $('t') + ' tickets, in dollars.', p + '*t', 't', 'Each ticket adds \\$' + p + ', so ' + $('t') + ' tickets cost ' + $(p + ' \\times t = ' + p + 't') + '.'],
        ['Pencils come in boxes of ' + $(p) + '. Write an expression for the number of pencils in ' + $('b') + ' boxes.', p + '*b', 'b', 'Each box has ' + p + ', so ' + $('b') + ' boxes have ' + $(p + 'b') + ' pencils.'],
        [n + ' is ' + $(p) + ' years older than a sister who is ' + $('s') + ' years old. Write an expression for ' + n + '’s age.', 's+' + p, 's', 'Older by ' + p + ' means add ' + p + ': ' + $('s + ' + p) + '.'],
        ['A pizza is cut into ' + $('k') + ' equal slices. ' + $(p) + ' friends share them equally. Write an expression for how many slices each friend gets.', 'k/' + p, 'k', 'Sharing equally means dividing: ' + $('\\frac{k}{' + p + '}') + ', or ' + $('k \\div ' + p) + '.'],
        [n + ' had ' + $('m') + ' dollars and spent \\$' + p + '. Write an expression for the money left.', 'm-' + p, 'm', 'Spending takes away: ' + $('m - ' + p) + '.']
      ];
      var o = R.pick(ops);
      return { q: o[0], a: { t: 'expr', v: o[1], vars: [o[2]] }, steps: ['The letter ' + $(o[2]) + ' stands for a number we can change.', o[3]], hint: 'Try it with a real number first, like 2. Then put the letter where the 2 was.', chk: { kind: 'expr', v: o[1], vars: [o[2]] } };
    }
    if (shape === 'value') {
      var x = R.int(2, 9);
      return { q: 'If ' + $('a = ' + x) + ', what is the value of ' + $(p + 'a') + '?', a: num(p * x, 'int'), steps: [$(p + 'a') + ' means ' + $(p + ' \\times a') + ', not a two-digit number.', 'Put ' + x + ' in for ' + $('a') + ': ' + $(p + ' \\times ' + x + ' = ' + p * x) + '.'], hint: 'A number next to a letter means multiply.', chk: { kind: 'val', v: p * x } };
    }
    var w = R.int(2, 9), h = R.int(2, 9);
    return { q: 'A rectangle has length ' + $('\\ell') + ' and width ' + $('w') + '. What does ' + $('2\\ell + 2w') + ' stand for?', a: mc('The perimeter of the rectangle', ['The area of the rectangle', 'The length plus the width', 'Two lengths only']), steps: [$('2\\ell') + ' is two lengths and ' + $('2w') + ' is two widths.', 'Adding all four sides gives the distance around: the perimeter. For example, with ' + $('\\ell = ' + w) + ' and ' + $('w = ' + h) + ' it is ' + (2 * w + 2 * h) + '.'], hint: 'What do you get when you add all four sides?', chk: { kind: 'mc' } };
  });

  var PHRASES = [
    [1, '{a} more than {v}', '{v}+{a}', 'More than means add.'],
    [1, '{a} less than {v}', '{v}-{a}', '"{a} less than {v}" starts with {v} and takes {a} away, so {v} comes first.'],
    [1, 'the product of {a} and {v}', '{a}*{v}', 'Product means multiply.'],
    [1, '{v} divided by {a}', '{v}/{a}', 'Divided by means divide, in the order written.'],
    [1, 'the sum of {v} and {a}', '{v}+{a}', 'Sum means add.'],
    [1, '{v} decreased by {a}', '{v}-{a}', 'Decreased by means subtract.'],
    [1, '{a} times {v}', '{a}*{v}', 'Times means multiply.'],
    [2, '{v} less than {a}', '{a}-{v}', '"{v} less than {a}" starts with {a} and takes {v} away.'],
    [2, 'twice {v}, plus {a}', '2*{v}+{a}', 'Twice means 2 times; then add.'],
    [2, '{a} times the sum of {v} and {b}', '{a}*({v}+{b})', 'The sum is one quantity, so it goes in parentheses before multiplying.'],
    [2, 'the sum of {a} times {v} and {b}', '{a}*{v}+{b}', 'Here the two things being added are {a}{v} and {b}.'],
    [2, '{b} fewer than {a} times {v}', '{a}*{v}-{b}', '"Fewer than" means subtract from what comes after it.'],
    [2, 'the quotient of {v} and {a}', '{v}/{a}', 'Quotient means divide, first number by second.'],
    [2, 'half of {v}', '{v}/2', 'Half of means divide by 2 (or multiply by 1/2).'],
    [3, '{v} squared, plus {a}', '{v}^2+{a}', 'Squared means the exponent 2.'],
    [3, 'the difference of {v} and {b}, divided by {a}', '({v}-{b})/{a}', 'The difference is found first, so it goes in parentheses (or on top of a fraction bar).'],
    [3, '{a} divided by {v}', '{a}/{v}', 'Divided by keeps the order: {a} is divided.'],
    [3, 'subtract {v} from {a}', '{a}-{v}', '"Subtract {v} from {a}" starts with {a}.'],
    [3, '{a} times the difference of {v} and {b}', '{a}*({v}-{b})', 'The difference goes in parentheses before multiplying.']
  ];
  function fill(s, o) { return s.replace(/\{(\w)\}/g, function (m, k) { return o[k]; }); }
  G('g6.write-expressions', function (R, ctx) {
    var l = lv(ctx), v = R.pick(['n', 'x', 'y', 'k', 'm', 't']), o = { v: v, a: R.int(2, 12), b: R.int(2, 9) };
    var pool = PHRASES.filter(function (p) { return p[0] <= l && p[0] >= l - 1; }), ph = R.pick(pool);
    if (ph[2] === '{v}-{a}' && R.chance(0.5) && l === 1) {
      var w = o.a;
      return { q: 'Which expression means "' + w + ' less than ' + v + '"?', a: mc($(v + ' - ' + w), [$(w + ' - ' + v), $(w + v), $(v + ' + ' + w)]),
        steps: ['"' + w + ' less than ' + v + '" means start with ' + $(v) + ' and take ' + w + ' away.', 'So it is ' + $(v + ' - ' + w) + '. Try a number: if ' + $(v + ' = 20') + ', then ' + w + ' less than 20 is ' + (20 - w) + ' = ' + $('20 - ' + w) + '.'], hint: 'Try it with a number: what is ' + w + ' less than 20?', chk: { kind: 'mc' } };
    }
    var plain = fill(ph[2], o), tex = T.plain(plain);
    return {
      q: 'Write an expression for "' + fill(ph[1], o) + '".', a: { t: 'expr', v: plain, vars: [v] },
      steps: [fill(ph[3], o).replace(new RegExp('\\b' + v + '\\b', 'g'), '$' + v + '$'), 'The expression is ' + $(tex) + '.', (function () { var e = {}; e[v] = 10; var r = evalPlain(plain, e); if (r.sign() < 0) { e[v] = 2; r = evalPlain(plain, e); } return 'Check with a number: if ' + $(v + ' = ' + e[v]) + ', the expression gives ' + $(DT(r)) + '. Does that match the words?'; })()],
      hint: 'Test your expression by putting in a number for ' + v + '.', chk: { kind: 'expr', v: plain, vars: [v] }
    };
  });

  G('g6.parts-of-expressions', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['terms', 'coef', 'const'], ['terms', 'coef', 'const', 'factors'], ['terms2', 'coef', 'factors', 'terms2']));
    var vars = R.sample(['x', 'y', 'z', 'a', 'b', 'm', 'n'], 3), cs = [R.int(2, 9), R.int(1, 9), R.int(2, 9)], k = R.int(1, 20);
    var nT = R.int(2, 3), termList = [], tl = [];
    for (var i = 0; i < nT; i++) { termList.push([cs[i], vars[i]]); }
    termList.push([k, '']);
    var tex = T.terms(termList);
    if (shape === 'terms') return { q: 'How many terms are in ' + $(tex) + '?', a: num(nT + 1, 'int'), steps: ['Terms are the parts that are added (or subtracted).', 'The terms are ' + termList.map(function (t) { return $(T.mono(t[0], t[1])); }).join(', ') + '.', 'There are ' + (nT + 1) + ' terms.'], hint: 'Count the parts separated by + signs.', chk: { kind: 'val', v: nT + 1 } };
    if (shape === 'coef') {
      var j = R.int(0, nT - 1), cv = termList[j][0];
      return { q: 'In ' + $(tex) + ', what is the coefficient of ' + $(termList[j][1]) + '?', a: num(cv, 'int'), steps: ['A coefficient is the number multiplied by a variable.', 'The term with ' + $(termList[j][1]) + ' is ' + $(T.mono(cv, termList[j][1])) + (cv === 1 ? ', which means ' + $('1 \\cdot ' + termList[j][1]) : '') + '.', 'So the coefficient is ' + $(cv) + '.'], hint: 'Look at the number in front of ' + termList[j][1] + '.' + (cv === 1 ? ' No number written means 1.' : ''), chk: { kind: 'val', v: cv } };
    }
    if (shape === 'const') return { q: 'What is the constant term in ' + $(tex) + '?', a: num(k, 'int'), steps: ['A constant term is a number with no variable. It stays the same whatever the variables are.', 'In ' + $(tex) + ' that is ' + $(k) + '.'], hint: 'Which term has no letter?', chk: { kind: 'val', v: k } };
    if (shape === 'factors') {
      var a = R.int(2, 9), b = R.int(1, 9), x = vars[0];
      return { q: 'The expression ' + $(a + '(' + x + ' + ' + b + ')') + ' is a product of two factors. What are they?', a: mc($(a) + ' and ' + $('(' + x + ' + ' + b + ')'), [$(a) + ' and ' + $(x), $(x) + ' and ' + $(b), $(a + x) + ' and ' + $(b)]),
        steps: ['A product is things multiplied together. The ' + a + ' multiplies everything inside the parentheses.', 'So the two factors are ' + $(a) + ' and the whole sum ' + $('(' + x + ' + ' + b + ')') + '. The sum counts as one quantity.'], hint: 'What is the ' + a + ' multiplied by?', chk: { kind: 'mc' } };
    }
    var a2 = R.int(2, 9), b2 = R.int(1, 9), c2 = R.int(2, 9), x2 = vars[0], ex = a2 + '(' + x2 + ' + ' + b2 + ') + ' + c2 + x2;
    var extra = R.coin(), ex2 = ex + (extra ? ' + ' + k : '');
    return { q: 'How many terms are in ' + $(ex2) + '?', a: num(extra ? 3 : 2, 'int'), steps: ['Terms are separated by + or − signs that are not inside parentheses.', $(a2 + '(' + x2 + ' + ' + b2 + ')') + ' is one term: a product. The + inside the parentheses does not split it.', 'The terms are ' + $(a2 + '(' + x2 + ' + ' + b2 + ')') + ', ' + $(c2 + x2) + (extra ? ' and ' + $(k) : '') + ': ' + (extra ? 3 : 2) + ' terms.'], hint: 'Signs inside parentheses do not split terms.', chk: { kind: 'val', v: extra ? 3 : 2 } };
  });

  var FORMULAS = [
    ['the area of a rectangle', 'A = \\ell w', function (R) { return { l: R.int(3, 15), w: R.int(2, 12) }; }, function (o) { return o.l * o.w; }, function (o) { return '\\ell = ' + o.l + ', w = ' + o.w; }, function (o) { return 'A = ' + o.l + ' \\times ' + o.w; }],
    ['the perimeter of a rectangle', 'P = 2\\ell + 2w', function (R) { return { l: R.int(3, 25), w: R.int(2, 15) }; }, function (o) { return 2 * o.l + 2 * o.w; }, function (o) { return '\\ell = ' + o.l + ', w = ' + o.w; }, function (o) { return 'P = 2 \\times ' + o.l + ' + 2 \\times ' + o.w + ' = ' + 2 * o.l + ' + ' + 2 * o.w; }],
    ['the volume of a cube', 'V = s^{3}', function (R) { return { s: R.int(2, 9) }; }, function (o) { return o.s * o.s * o.s; }, function (o) { return 's = ' + o.s; }, function (o) { return 'V = ' + o.s + '^{3} = ' + o.s + ' \\times ' + o.s + ' \\times ' + o.s; }],
    ['distance at a constant speed', 'd = rt', function (R) { return { r: R.int(3, 65), t: R.int(2, 6) }; }, function (o) { return o.r * o.t; }, function (o) { return 'r = ' + o.r + ', t = ' + o.t; }, function (o) { return 'd = ' + o.r + ' \\times ' + o.t; }],
    ['the area of a triangle', 'A = \\frac{1}{2}bh', function (R) { return { b: R.int(2, 12) * 2, h: R.int(2, 12) }; }, function (o) { return o.b * o.h / 2; }, function (o) { return 'b = ' + o.b + ', h = ' + o.h; }, function (o) { return 'A = \\frac{1}{2} \\times ' + o.b + ' \\times ' + o.h; }],
    ['changing Celsius to Fahrenheit', 'F = \\frac{9}{5}C + 32', function (R) { return { C: R.int(0, 20) * 5 }; }, function (o) { return o.C * 9 / 5 + 32; }, function (o) { return 'C = ' + o.C; }, function (o) { return 'F = \\frac{9}{5} \\times ' + o.C + ' + 32 = ' + o.C * 9 / 5 + ' + 32'; }]
  ];
  G('g6.evaluate-expressions', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['lin', 'lin', 'formula'], ['lin', 'paren', 'formula', 'sq', 'two'], ['frac', 'formula', 'sq', 'two', 'paren']));
    var v = R.pick(['x', 'n', 'y', 'p', 'w']), a = R.int(2, 9), b = R.int(1, 20), x = R.int(2, 10), ans, tex, plain, st;
    if (shape === 'formula') {
      var f = R.pick(l === 1 ? FORMULAS.slice(0, 4) : FORMULAS), o = f[2](R), val = f[3](o);
      return { q: 'The formula ' + $(f[1]) + ' gives ' + f[0] + '. Find its value when ' + $(f[4](o)) + '.', a: num(val), steps: ['Put each number in place of its letter. Letters written side by side are multiplied.', $(f[5](o)) + '.', 'Work it out with the order of operations: ' + $(f[1].split(' = ')[0] + ' = ' + val) + '.'], hint: 'Replace each letter with its number, keeping the operations.', chk: { kind: 'formula', val: val } };
    }
    if (shape === 'lin') { ans = a * x + b; tex = T.lin(a, v, b); plain = a + '*' + v + '+' + b; st = ['Replace ' + $(v) + ' with ' + x + '. ' + $(a + v) + ' means ' + $(a + ' \\times ' + v) + ': ' + $(a + ' \\times ' + x + ' + ' + b) + '.', 'Multiply first: ' + $(a * x + ' + ' + b) + '.', 'Add: ' + $(ans) + '.']; }
    else if (shape === 'paren') { b = R.int(1, 9); ans = a * (x + b); tex = a + '(' + v + ' + ' + b + ')'; plain = a + '*(' + v + '+' + b + ')'; st = ['Replace ' + $(v) + ' with ' + x + ': ' + $(a + '(' + x + ' + ' + b + ')') + '.', 'Parentheses first: ' + $(x + ' + ' + b + ' = ' + (x + b)) + '.', 'Multiply: ' + $(a + ' \\times ' + (x + b) + ' = ' + ans) + '.']; }
    else if (shape === 'sq') { x = R.int(2, 9); ans = x * x + a * x; tex = v + '^{2} + ' + a + v; plain = v + '^2+' + a + '*' + v; st = ['Replace each ' + $(v) + ' with ' + x + ': ' + $(x + '^{2} + ' + a + ' \\times ' + x) + '.', 'Exponent first: ' + $(x + '^{2} = ' + x * x) + '. Multiply: ' + $(a + ' \\times ' + x + ' = ' + a * x) + '.', 'Add: ' + $(x * x + ' + ' + a * x + ' = ' + ans) + '.']; }
    else if (shape === 'two') { var y = R.int(2, 9), c = R.int(2, 9); x = R.int(2, 9); ans = a * x + c * y; tex = a + 'a + ' + c + 'b'; plain = a + '*a+' + c + '*b';
      return { q: 'Evaluate ' + $(tex) + ' when ' + $('a = ' + x) + ' and ' + $('b = ' + y) + '.', a: num(ans), steps: ['Put ' + x + ' in for ' + $('a') + ' and ' + y + ' in for ' + $('b') + ': ' + $(a + ' \\times ' + x + ' + ' + c + ' \\times ' + y) + '.', 'Multiply: ' + $(a * x + ' + ' + c * y) + '.', 'Add: ' + $(ans) + '.'], hint: 'Each letter gets its own number.', chk: { kind: 'eval2', plain: plain, env: { a: x, b: y } } }; }
    else { var den = R.pick([2, 3, 4]), xq = Q(R.int(1, den - 1) || 1, den); if (xq.isInt()) xq = Q(1, den); var mul = den * R.int(1, 4); ans = xq.mul(mul).add(b); tex = mul + v + ' + ' + b; plain = mul + '*' + v + '+' + b; x = xq;
      st = ['Replace ' + $(v) + ' with ' + $(F(xq)) + ': ' + $(mul + ' \\times ' + F(xq) + ' + ' + b) + '.', 'Multiply: ' + $(mul + ' \\times ' + F(xq) + ' = ' + DT(xq.mul(mul))) + '.', 'Add: ' + $(DT(xq.mul(mul)) + ' + ' + b + ' = ' + DT(ans)) + '.']; }
    return { q: 'Evaluate ' + $(tex) + ' when ' + $(v + ' = ' + (x instanceof Q ? F(x) : x)) + '.', a: num(ans), steps: st, hint: 'Replace ' + v + ' with its value. A number next to a letter means multiply.', chk: { kind: 'eval1', plain: plain, v: v, x: x instanceof Q ? x.toPlain() : String(x) } };
  });

  G('g6.equivalent-expressions', function (R, ctx) {
    var l = lv(ctx), v = R.pick(['x', 'y', 'n', 'a', 'm']), shape = R.pick(BY(ctx, ['expand', 'expand', 'combine', 'factor'], ['expand', 'combine', 'factor', 'expand2'], ['expand3', 'combine2', 'factor', 'expand2']));
    var a = R.int(2, 9), b = R.int(1, 9), c = R.int(2, 9);
    if (shape === 'expand' || shape === 'expand2') {
      var sub = shape === 'expand2' && R.coin(), co = shape === 'expand2' && !sub ? c : 1, inner = (co === 1 ? v : co + v) + (sub ? ' - ' : ' + ') + b, res = [a * co, sub ? -a * b : a * b];
      return { q: 'Use the distributive property to write ' + $(a + '(' + inner + ')') + ' without parentheses.', a: { t: 'expr', v: T.lin(a * co, v, res[1]).replace(/\s/g, '').replace(/\\cdot/g, '*'), vars: [v], form: 'expanded' },
        steps: ['The ' + a + ' multiplies every term inside the parentheses, not just the first one.', $(a + ' \\times ' + T.mono(co, v) + ' = ' + T.mono(a * co, v)) + ' and ' + $(a + ' \\times ' + b + ' = ' + a * b) + '.', 'So ' + $(a + '(' + inner + ') = ' + T.lin(a * co, v, res[1])) + '.', 'Check with ' + $(v + ' = 10') + ': ' + $(a + ' \\times ' + (10 * co + (sub ? -b : b)) + ' = ' + a * (10 * co + (sub ? -b : b))) + ' and ' + $(10 * a * co + (sub ? ' - ' : ' + ') + a * b + ' = ' + (10 * a * co + res[1])) + '.'],
        hint: 'Multiply the ' + a + ' by each term inside.', chk: { kind: 'eq', orig: a + '*(' + co + '*' + v + (sub ? '-' : '+') + b + ')', v: v } };
    }
    if (shape === 'expand3') {
      var d = R.int(1, 9), e = R.int(2, 5);
      var cx = a * c, cc = a * b + d;
      return { q: 'Write ' + $(a + '(' + c + v + ' + ' + b + ') + ' + d) + ' as simply as possible.', a: { t: 'expr', v: cx + v + '+' + cc, vars: [v], form: 'expanded' },
        steps: ['Distribute first: ' + $(a + '(' + c + v + ' + ' + b + ') = ' + cx + v + ' + ' + a * b) + '.', 'Now combine the numbers: ' + $(a * b + ' + ' + d + ' = ' + cc) + '.', 'The result is ' + $(cx + v + ' + ' + cc) + '.'], hint: 'Distribute, then add the constant terms.', chk: { kind: 'eq', orig: a + '*(' + c + '*' + v + '+' + b + ')+' + d, v: v } };
    }
    if (shape === 'factor') {
      var g = R.int(2, 9), m, n; do { m = R.int(1, 9); n = R.int(1, 9); } while (U.gcd(m, n) !== 1 || (m === 1 && n === 1));
      var first = R.coin();
      var exp = first ? T.lin(g * m, v, g * n) : g * n + ' + ' + T.mono(g * m, v);
      var ansP = g + '*(' + (first ? m + '*' + v + '+' + n : n + '+' + m + '*' + v) + ')';
      return { q: 'Factor ' + $(exp) + ' using the greatest common factor.', a: { t: 'expr', v: ansP, vars: [v], form: 'factored' },
        steps: ['The greatest common factor of ' + g * m + ' and ' + g * n + ' is ' + $(g) + '.', 'Divide each term by ' + g + ': ' + $(T.mono(g * m, v) + ' \\div ' + g + ' = ' + T.mono(m, v)) + ' and ' + $(g * n + ' \\div ' + g + ' = ' + n) + '.', 'So ' + $(exp + ' = ' + g + '(' + (first ? T.lin(m, v, n) : n + ' + ' + T.mono(m, v)) + ')') + '. Multiply back to check.'],
        hint: 'What is the biggest number that divides both ' + g * m + ' and ' + g * n + '?', chk: { kind: 'eq', orig: g * m + '*' + v + '+' + g * n, v: v } };
    }
    if (shape === 'combine') {
      var k = R.int(3, 6), terms = []; for (var i = 0; i < k; i++) terms.push(v);
      var useNum = l > 1 || R.coin(), p2 = R.int(2, 7), q2 = R.int(2, 7);
      if (useNum) return { q: 'Write ' + $(p2 + v + ' + ' + q2 + v) + ' as one term.', a: { t: 'expr', v: (p2 + q2) + v, vars: [v], form: 'simplified' }, steps: [$(p2 + v) + ' is ' + p2 + ' groups of ' + $(v) + ' and ' + $(q2 + v) + ' is ' + q2 + ' more groups.', 'Together that is ' + (p2 + q2) + ' groups: ' + $(p2 + v + ' + ' + q2 + v + ' = ' + (p2 + q2) + v) + '. (This is the distributive property: ' + $('(' + p2 + ' + ' + q2 + ')' + v) + '.)'], hint: 'Count how many ' + v + '’s there are in all.', chk: { kind: 'eq', orig: p2 + '*' + v + '+' + q2 + '*' + v, v: v } };
      return { q: 'Write ' + $(terms.join(' + ')) + ' as one term.', a: { t: 'expr', v: k + v, vars: [v], form: 'simplified' }, steps: ['Adding the same number ' + k + ' times is the same as multiplying it by ' + k + '.', 'So ' + $(terms.join(' + ') + ' = ' + k + v) + '.'], hint: 'How many ' + v + '’s are added?', chk: { kind: 'eq', orig: terms.join('+'), v: v } };
    }
    var p3 = R.int(2, 7), q3 = R.int(1, 7), r3 = R.int(1, 9), s3 = R.int(1, 9), w = v === 'y' ? 'x' : 'y', twoV = R.coin();
    if (twoV) return { q: 'Simplify ' + $(p3 + v + ' + ' + T.mono(r3, w) + ' + ' + T.mono(q3, v) + ' + ' + T.mono(s3, w)) + '.', a: { t: 'expr', v: (p3 + q3) + v + '+' + (r3 + s3) + w, vars: [v, w], form: 'simplified' }, steps: ['Like terms have the same variable. Group them: ' + $(p3 + v + ' + ' + T.mono(q3, v)) + ' and ' + $(T.mono(r3, w) + ' + ' + T.mono(s3, w)) + '.', 'Combine each group: ' + $(T.mono(p3 + q3, v)) + ' and ' + $(T.mono(r3 + s3, w)) + '.', 'The result is ' + $(T.mono(p3 + q3, v) + ' + ' + T.mono(r3 + s3, w)) + '. The ' + $(v) + ' and ' + $(w) + ' terms cannot be combined.'], hint: 'Only terms with the same letter can be added together.', chk: { kind: 'eq2', orig: p3 + '*' + v + '+' + r3 + '*' + w + '+' + q3 + '*' + v + '+' + s3 + '*' + w, vars: [v, w] } };
    return { q: 'Simplify ' + $(p3 + v + ' + ' + r3 + ' + ' + T.mono(q3, v)) + '.', a: { t: 'expr', v: (p3 + q3) + v + '+' + r3, vars: [v], form: 'simplified' }, steps: ['Group the like terms: ' + $(p3 + v + ' + ' + T.mono(q3, v)) + ' and the number ' + $(r3) + '.', $(p3 + v + ' + ' + T.mono(q3, v) + ' = ' + (p3 + q3) + v) + '.', 'The result is ' + $((p3 + q3) + v + ' + ' + r3) + '.'], hint: 'Add the terms that have ' + v + ' in them.', chk: { kind: 'eq', orig: p3 + '*' + v + '+' + r3 + '+' + q3 + '*' + v, v: v } };
  });

  // linear forms [coef, const] for comparing expressions in x
  function linTex(f, v) { return T.lin(f[0], v, f[1]); }
  function linEq(f, g) { return f[0] === g[0] && f[1] === g[1]; }
  G('g6.identify-equivalent-expressions', function (R, ctx) {
    var l = lv(ctx), v = R.pick(['x', 'y', 'n', 'a']), shape = R.pick(BY(ctx, ['mc', 'mc', 'tf'], ['mc', 'tf', 'one', 'all'], ['mc', 'tf', 'one', 'all']));
    var a = R.int(2, 9), b = R.int(1, 9); if (a === 2 && b === 2) b = 3;
    if (shape === 'one') {
      var k = R.int(2, 5), c = R.int(1, 6), lhs = 'x + ' + c, x1 = 1, rhs = (1 + c) + 'x'; // x + c and (1 + c)x agree only at x = 1
      lhs = v + ' + ' + c; rhs = (1 + c) + v;
      return { q: 'When ' + $(v + ' = 1') + ', both ' + $(lhs) + ' and ' + $(rhs) + ' equal ' + (1 + c) + '. Are ' + $(lhs) + ' and ' + $(rhs) + ' equivalent expressions?', a: tf(false),
        steps: ['Equivalent expressions must be equal for every value of the variable, not just one.', 'Try another value, ' + $(v + ' = ' + k) + ': ' + $(lhs.replace(v, k) + ' = ' + (k + c)) + ' but ' + $((1 + c) + ' \\times ' + k + ' = ' + (1 + c) * k) + '.', 'They are different, so the expressions are not equivalent: false.'],
        hint: 'Try a different value of ' + v + '.', chk: { kind: 'tfeq', e1: v + '+' + c, e2: (1 + c) + '*' + v, v: v, truth: false } };
    }
    var form = R.pick(l === 1 ? ['dist', 'rep', 'like'] : ['dist', 'rep', 'like', 'mix']), E, Et, right, wrongs = [];
    if (form === 'dist') { E = a + '(' + v + ' + ' + b + ')'; right = [a, a * b]; wrongs = [[a, b], [1, a * b], [a, a + b], [a + 1, b]]; }
    else if (form === 'rep') { var n = R.int(3, 5), arr = []; for (var i = 0; i < n; i++) arr.push(v); E = arr.join(' + '); right = [n, 0]; wrongs = [[1, n], [n, n], [n + 1, 0]]; }
    else if (form === 'like') { E = T.mono(a, v) + ' + ' + T.mono(b, v); right = [a + b, 0]; wrongs = [[a * b, 0], [1, a + b], [b, a]]; if (a + b === a * b) wrongs.shift(); }
    else { var c2 = R.int(1, 6); E = a + '(' + v + ' + ' + b + ') + ' + T.mono(c2, v); right = [a + c2, a * b]; wrongs = [[a + c2, b], [a, a * b + c2], [a + c2, a * b + c2], [a * c2, a * b]]; }
    wrongs = wrongs.filter(function (w) { return !linEq(w, right) && w[0] !== 0; });
    var wTex = wrongs.map(function (w) { return linTex(w, v); });
    if (form === 'rep') wTex.push(T.pow(v, (E.match(/\+/g) || []).length + 1));
    if (shape === 'mc') return { q: 'Which expression is equivalent to ' + $(E) + '?', a: mc($(linTex(right, v)), R.sample(wTex, Math.min(3, wTex.length)).map($)),
      steps: form === 'dist' ? ['Distribute: the ' + a + ' multiplies both terms in the parentheses.', $(E + ' = ' + a + v + ' + ' + a * b) + '.', 'Check with ' + $(v + ' = 2') + ': ' + $(a + '(2 + ' + b + ') = ' + a * (2 + b)) + ' and ' + $(a + ' \\times 2 + ' + a * b + ' = ' + (2 * a + a * b)) + '.']
        : form === 'rep' ? ['Adding ' + $(v) + ' to itself ' + right[0] + ' times is ' + right[0] + ' times ' + $(v) + '.', $(E + ' = ' + right[0] + v) + '. It is not ' + $(T.pow(v, right[0])) + ', which multiplies ' + $(v) + ' by itself.']
          : form === 'like' ? ['Both terms count ' + $(v) + "’s: " + a + ' of them and ' + b + ' more.', $(E + ' = ' + (a + b) + v) + ', by the distributive property: ' + $('(' + a + ' + ' + b + ')' + v) + '.']
            : ['Distribute: ' + $(a + '(' + v + ' + ' + b + ') = ' + a + v + ' + ' + a * b) + '.', 'Add the like terms: ' + $(a + v + ' + ' + T.mono(c2, v) + ' = ' + (a + c2) + v) + '.', 'So ' + $(E + ' = ' + linTex(right, v)) + '.'],
      hint: 'Use the distributive property and combine like terms, then compare.', chk: { kind: 'mceq', E: E, v: v } };
    if (shape === 'tf') {
      var truth = R.coin(), F2 = truth ? right : R.pick(wrongs);
      return { q: 'True or false: ' + $(E) + ' and ' + $(linTex(F2, v)) + ' are equivalent.', a: tf(truth),
        steps: ['Rewrite ' + $(E) + ' using the properties: ' + $(E + ' = ' + linTex(right, v)) + '.', truth ? 'That is the same expression, so they are equal for every value of ' + $(v) + ': true.' : $(linTex(right, v)) + ' and ' + $(linTex(F2, v)) + ' are different. For example, with ' + $(v + ' = 2') + ' they give ' + (right[0] * 2 + right[1]) + ' and ' + (F2[0] * 2 + F2[1]) + ': false.'],
        hint: 'Simplify the first expression, then compare.', chk: { kind: 'tfeq', e1: E.replace(/(\d)\(/g, '$1*(').replace(/(\d)([a-z])/g, '$1*$2'), e2: (F2[0] + '*' + v + '+' + F2[1]), v: v, truth: truth } };
    }
    // select all equivalent to p x + q with a common factor
    var g = R.pick([2, 3, 4, 6]), m, nn; do { m = R.int(1, 5); nn = R.int(1, 5); } while (U.gcd(m, nn) !== 1);
    var P = g * m, Qc = g * nn, opts = [], good = [];
    U.factors(g).filter(function (f) { return f > 1; }).forEach(function (f) { opts.push([f + '(' + linTex([P / f, Qc / f], v) + ')', true]); });
    var sp = R.int(1, P - 1 || 1); if (P > 1) opts.push([T.mono(sp, v) + ' + ' + T.mono(P - sp, v) + ' + ' + Qc, true]);
    opts.push([g + '(' + linTex([P / g, Qc], v) + ')', false], [g + '(' + v + ' + ' + Qc + ')', P === g ? null : false], [linTex([P, Qc / g], v), false], [P + Qc + v, false]);
    opts = opts.filter(function (o) { return o[1] !== null; });
    opts = U.uniq(opts.map(function (o) { return JSON.stringify(o); })).map(function (s) { return JSON.parse(s); });
    var trues = opts.filter(function (o) { return o[1]; }), falses = opts.filter(function (o) { return !o[1]; });
    var pick = R.sample(trues, Math.min(trues.length, R.int(1, 2))).concat(R.sample(falses, Math.min(falses.length, 5 - Math.min(trues.length, 2))));
    pick = R.shuffle(pick).slice(0, 5);
    if (!pick.some(function (o) { return o[1]; })) pick[0] = trues[0];
    var vIdx = []; pick.forEach(function (o, i) { if (o[1]) vIdx.push(i); });
    return { q: 'Select all the expressions equivalent to ' + $(linTex([P, Qc], v)) + '.', a: { t: 'mc', choices: pick.map(function (o) { return $(o[0]); }), v: vIdx },
      steps: ['Multiply out or combine each choice and compare it with ' + $(linTex([P, Qc], v)) + '.'].concat(pick.map(function (o) { return $(o[0]) + (o[1] ? ' simplifies to ' + $(linTex([P, Qc], v)) + ': equivalent.' : ' is not: it does not simplify to ' + $(linTex([P, Qc], v)) + '.'); })),
      hint: 'Distribute each one. A factor outside must multiply every term inside.', chk: { kind: 'all', target: [P, Qc], v: v, opts: pick } };
  });

  // ================================================================== unit: equations and inequalities
  function makeEq(R, l, v) { // { tex, plain, lhs(x) -> Q, rhs, sol }
    var forms = l === 1 ? ['add', 'mul', 'sub'] : l === 2 ? ['add', 'mul', 'sub', 'div', 'two'] : ['div', 'two', 'paren', 'twosub'];
    var f = R.pick(forms), x = R.int(1, 12), a = R.int(2, 9), b = R.int(1, 15), e = {};
    if (f === 'add') { e = { tex: v + ' + ' + b, plain: v + '+' + b, lhs: function (t) { return qq(t).add(b); } }; }
    else if (f === 'sub') { x = R.int(b + 1, b + 20); e = { tex: v + ' - ' + b, plain: v + '-' + b, lhs: function (t) { return qq(t).sub(b); } }; }
    else if (f === 'mul') { e = { tex: a + v, plain: a + '*' + v, lhs: function (t) { return qq(t).mul(a); } }; }
    else if (f === 'div') { x = a * R.int(1, 9); e = { tex: '\\frac{' + v + '}{' + a + '}', plain: v + '/' + a, lhs: function (t) { return qq(t).div(a); } }; }
    else if (f === 'two') { e = { tex: a + v + ' + ' + b, plain: a + '*' + v + '+' + b, lhs: function (t) { return qq(t).mul(a).add(b); } }; }
    else if (f === 'twosub') { x = R.int(2, 12); b = R.int(1, a * x - 1); e = { tex: a + v + ' - ' + b, plain: a + '*' + v + '-' + b, lhs: function (t) { return qq(t).mul(a).sub(b); } }; }
    else { b = R.int(1, 6); e = { tex: a + '(' + v + ' + ' + b + ')', plain: a + '*(' + v + '+' + b + ')', lhs: function (t) { return qq(t).add(b).mul(a); } }; }
    e.sol = Q(x); e.rhs = e.lhs(x); e.form = f;
    return e;
  }
  G('g6.solutions-of-equations', function (R, ctx) {
    var l = lv(ctx), v = R.pick(['x', 'n', 'y', 'm', 'k']), shape = R.pick(BY(ctx, ['tf', 'tf', 'mc'], ['tf', 'mc', 'ineq'], ['tf', 'mc', 'ineq']));
    if (shape === 'ineq') {
      var a = R.int(2, 15), b = a + R.int(2, 15), op = R.pick(['>', '<', '\\ge', '\\le']), cands = R.sample(U.range(0, b + 6), 5).sort(function (p, q) { return p - q; });
      var ok = function (t) { var s = t + a; return op === '>' ? s > b : op === '<' ? s < b : op === '\\ge' ? s >= b : s <= b; };
      if (!cands.some(ok)) cands[4] = op === '>' || op === '\\ge' ? b : 0; if (cands.every(ok)) cands[0] = op === '>' || op === '\\ge' ? 0 : b + 5;
      cands = U.uniq(cands).sort(function (p, q) { return p - q; });
      var vi = []; cands.forEach(function (c, i) { if (ok(c)) vi.push(i); });
      var word = { '>': 'greater than', '<': 'less than', '\\ge': 'greater than or equal to', '\\le': 'less than or equal to' }[op];
      return { q: 'Which values of ' + $(v) + ' make ' + $(v + ' + ' + a + ' ' + op + ' ' + b) + ' true? Select all that work.', a: { t: 'mc', choices: cands.map(function (c) { return $(v + ' = ' + c); }), v: vi, keep: true },
        steps: ['Put each value in for ' + $(v) + ' and see whether the sum is ' + word + ' ' + b + '.'].concat(cands.map(function (c) { return $(c + ' + ' + a + ' = ' + (c + a)) + (ok(c) ? ': yes, it works.' : ': no.'); })),
        hint: 'Test each value. Watch the ones that make the sum exactly ' + b + '.', chk: { kind: 'ineqsel', a: a, b: b, op: op, cands: cands, v: vi } };
    }
    var e = makeEq(R, l, v);
    if (shape === 'tf') {
      var truth = R.coin(), t = truth ? e.sol : e.sol.add(R.pick([-2, -1, 1, 2, 3])); if (t.sign() <= 0) t = e.sol.add(1);
      truth = e.lhs(t).eq(e.rhs);
      return { q: 'Is ' + $(v + ' = ' + D(t)) + ' a solution of ' + $(e.tex + ' = ' + D(e.rhs)) + '?', a: tf(truth),
        steps: ['Substitute ' + D(t) + ' for ' + $(v) + ' and see if both sides are equal.', 'The left side becomes ' + $(D(e.lhs(t))) + '.', truth ? 'That equals the right side, ' + $(D(e.rhs)) + ', so ' + $(v + ' = ' + D(t)) + ' is a solution: true.' : $(D(e.lhs(t)) + ' \\ne ' + D(e.rhs)) + ', so ' + $(v + ' = ' + D(t)) + ' is not a solution: false.'],
        hint: 'Put the number in place of ' + v + '. Does the equation become true?', chk: { kind: 'tfsol', plain: e.plain, rhs: e.rhs.toPlain(), v: v, t: t.toPlain(), truth: truth } };
    }
    var c2 = U.uniq([e.sol.num(), e.sol.num() + 1, e.sol.num() + 2, Math.max(0, e.sol.num() - 1), e.sol.num() + 3, e.sol.num() + 4]).filter(function (z) { return z !== e.sol.num(); });
    var ch = R.sample(c2, 3).concat([e.sol.num()]).sort(function (p, q) { return p - q; });
    return { q: 'Which value of ' + $(v) + ' makes ' + $(e.tex + ' = ' + D(e.rhs)) + ' true?', a: mcKeep(ch.map(function (z) { return $(v + ' = ' + z); }), ch.indexOf(e.sol.num())),
      steps: ['Try each value in the equation.'].concat(ch.map(function (z) { return 'With ' + $(v + ' = ' + z) + ', the left side is ' + $(D(e.lhs(z))) + (e.lhs(z).eq(e.rhs) ? ', which matches.' : '.'); })).concat(['Only ' + $(v + ' = ' + e.sol.num()) + ' makes it true.']),
      hint: 'Substitute each choice. Only one gives ' + D(e.rhs) + '.', chk: { kind: 'mcsol', plain: e.plain, rhs: e.rhs.toPlain(), v: v, sol: e.sol.num() } };
  });

  var LETTERS = ['x', 'n', 'y', 'm', 'k', 'p', 'w', 'a', 'b', 't'];
  G('g6.one-step-add-subtract', function (R, ctx) {
    var l = lv(ctx), v = R.pick(LETTERS), form = R.pick(['x+a', 'a+x', 'x-a', 'b=x+a', 'x-a']), a, x;
    if (l === 1) { a = Q(R.int(2, 30)); x = Q(R.int(1, 40)); }
    else if (l === 2) { a = Q(R.int(25, 999), 100); x = Q(R.int(10, 2000), 100); if (R.coin()) a = Q(R.int(2, 99), 10); }
    else { a = randFrac(R, [2, 3, 4, 5, 6, 8, 10, 12], true).add(R.int(0, 2)); x = randFrac(R, [2, 3, 4, 5, 6, 8, 10, 12], true).add(R.int(0, 3)); }
    var show = l === 3 ? function (z) { return z.isInt() ? z.toString() : z.gt(1) ? MX(z) : F(z); } : function (z) { return DT(z); };
    var sub = form === 'x-a', b = sub ? x.sub(a) : x.add(a), eq;
    if (sub && b.sign() < 0) { var t = x; x = a; a = t; b = x.sub(a); }
    if (sub && b.isZero()) { x = x.add(1); b = x.sub(a); }
    if (form === 'x+a') eq = v + ' + ' + show(a) + ' = ' + show(b);
    else if (form === 'a+x') eq = show(a) + ' + ' + v + ' = ' + show(b);
    else if (form === 'b=x+a') eq = show(b) + ' = ' + v + ' + ' + show(a);
    else eq = v + ' - ' + show(a) + ' = ' + show(b);
    var st = sub ? ['To undo subtracting ' + show(a).replace(/.*/, function (s) { return $(s); }) + ', add ' + $(show(a)) + ' to both sides. The equation stays balanced.', $(v + ' - ' + show(a) + ' + ' + show(a) + ' = ' + show(b) + ' + ' + show(a)) + '.', $(v + ' = ' + show(x)) + '.', 'Check: ' + $(show(x) + ' - ' + show(a) + ' = ' + show(b)) + '.']
      : ['To undo adding ' + $(show(a)) + ', subtract ' + $(show(a)) + ' from both sides. Doing the same to both sides keeps them equal.', $(v + ' = ' + show(b) + ' - ' + show(a)) + (l === 3 ? '. Use a common denominator if you need one' : '') + '.', $(v + ' = ' + show(x)) + '.', 'Check: ' + $(show(x) + ' + ' + show(a) + ' = ' + show(b)) + '.'];
    return { q: 'Solve for ' + $(v) + ': ' + $(eq), a: l === 3 ? numM(x) : numD(x), steps: st, hint: sub ? 'What undoes subtracting? Do it to both sides.' : 'What undoes adding? Do it to both sides.', chk: { kind: 'addsub', sub: sub, a: a.toPlain(), b: b.toPlain() } };
  });

  G('g6.one-step-multiply-divide', function (R, ctx) {
    var l = lv(ctx), v = R.pick(LETTERS), form = R.pick(BY(ctx, ['mul', 'mul', 'div'], ['mul', 'div', 'dec', 'mul'], ['frac', 'dec', 'div', 'frac'])), a, x, eq, st, ans;
    if (form === 'mul') { a = R.int(2, 12); x = R.int(2, 15); if (l > 1 && R.coin()) x = Q(R.int(1, 9), 2); var bb = qq(x).mul(a); ans = qq(x); eq = a + v + ' = ' + DT(bb);
      st = [$(a + v) + ' means ' + a + ' times ' + $(v) + '. To undo multiplying by ' + a + ', divide both sides by ' + a + '.', $(v + ' = ' + DT(bb) + ' \\div ' + a + ' = ' + DT(ans)) + '.', 'Check: ' + $(a + ' \\times ' + DT(ans) + ' = ' + DT(bb)) + '.']; }
    else if (form === 'div') { a = R.int(2, 12); var bq = R.int(2, 15); ans = Q(a * bq); eq = '\\frac{' + v + '}{' + a + '} = ' + bq;
      st = ['The ' + $(v) + ' is divided by ' + a + '. To undo dividing, multiply both sides by ' + a + '.', $(v + ' = ' + bq + ' \\times ' + a + ' = ' + ans.toString()) + '.', 'Check: ' + $(ans.toString() + ' \\div ' + a + ' = ' + bq) + '.']; }
    else if (form === 'dec') { a = Q(R.int(2, 9), 10); if (R.coin()) a = Q(R.int(11, 49), 10); ans = Q(R.int(2, 40)); if (R.coin()) ans = Q(R.int(3, 29), 2); var bd = a.mul(ans); eq = D(a) + v + ' = ' + D(bd);
      st = ['Divide both sides by ' + D(a) + '.', $(v + ' = ' + D(bd) + ' \\div ' + D(a)) + '. Multiply both by 10 to divide by a whole number: ' + $(D(bd.mul(10)) + ' \\div ' + D(a.mul(10)) + ' = ' + D(ans)) + '.', 'Check: ' + $(D(a) + ' \\times ' + D(ans) + ' = ' + D(bd)) + '.']; }
    else { var n = R.int(1, 5), d = R.int(n + 1, 9); while (U.gcd(n, d) !== 1) d++; a = Q(n, d); ans = Q(d * R.int(1, 6)); if (R.coin()) ans = Q(R.int(1, 12)); var bf = a.mul(ans); eq = F(a) + v + ' = ' + DT(bf);
      st = ['To undo multiplying by ' + $(F(a)) + ', multiply both sides by its reciprocal, ' + $(F(a.inv())) + '. (That is the same as dividing by ' + $(F(a)) + '.)', $(v + ' = ' + DT(bf) + ' \\times ' + F(a.inv()) + ' = ' + DT(ans)) + '.', 'Check: ' + $(F(a) + ' \\times ' + DT(ans) + ' = ' + DT(bf)) + '.']; }
    return { q: 'Solve for ' + $(v) + ': ' + $(eq), a: numD(ans), steps: st, hint: form === 'div' ? 'What undoes dividing?' : 'What undoes multiplying? Do it to both sides.', chk: { kind: 'muldiv', form: form, a: qq(form === 'div' ? a : a).toPlain(), b: (form === 'mul' ? bb : form === 'div' ? Q(bq) : form === 'dec' ? bd : bf).toPlain() } };
  });

  G('g6.write-solve-equations', function (R, ctx) {
    var l = lv(ctx), n = name(R), shape = R.pick(BY(ctx, ['solve', 'solve', 'pick'], ['solve', 'solve', 'pick'], ['solve', 'pick', 'solve']));
    var kinds = [
      function () { var x = l === 3 ? Q(R.int(20, 400), 4) : Q(R.int(10, 80)), p = l === 3 ? Q(R.int(4, 120), 4) : Q(R.int(3, 40)), left = x.sub(p); if (left.sign() <= 0) { x = x.add(p); left = x.sub(p); }
        return { q: n + ' spent ' + money(p) + ' at a fair and has ' + money(left) + ' left. How much money did ' + n + ' bring?', eq: 'm - ' + D(p) + ' = ' + D(left), eqs: ['m - ' + D(p) + ' = ' + D(left), 'm + ' + D(p) + ' = ' + D(left), D(p) + 'm = ' + D(left), D(p) + ' - m = ' + D(left)], x: x, unit: 'dollars', v: 'm', why: 'Let ' + $('m') + ' be the money ' + n + ' brought. Spending ' + money(p) + ' leaves ' + money(left) + ': ' + $('m - ' + D(p) + ' = ' + D(left)) + '.', solve: 'Add ' + D(p) + ' to both sides: ' + $('m = ' + D(left) + ' + ' + D(p) + ' = ' + D(x)) + '.' }; },
      function () { var k = R.int(3, 9), x = Q(R.int(4, 15)), tot = x.mul(k); return { q: 'A box holds ' + $(tot.toString()) + ' crayons in ' + $(k) + ' equal rows. How many crayons are in each row?', eq: k + 'c = ' + tot, eqs: [k + 'c = ' + tot, 'c + ' + k + ' = ' + tot, '\\frac{c}{' + k + '} = ' + tot, tot + 'c = ' + k], x: x, unit: 'crayons', v: 'c', why: 'Let ' + $('c') + ' be the crayons in a row. ' + k + ' rows of ' + $('c') + ' make ' + tot + ': ' + $(k + 'c = ' + tot) + '.', solve: 'Divide both sides by ' + k + ': ' + $('c = ' + tot + ' \\div ' + k + ' = ' + x) + '.' }; },
      function () { var age = R.int(8, 14), add = R.int(3, 30), tot = age + add; return { q: 'In ' + $(add) + ' years, ' + n + ' will be ' + $(tot) + ' years old. How old is ' + n + ' now?', eq: 'a + ' + add + ' = ' + tot, eqs: ['a + ' + add + ' = ' + tot, 'a - ' + add + ' = ' + tot, add + 'a = ' + tot, 'a = ' + tot + ' + ' + add], x: Q(age), unit: 'years', v: 'a', why: 'Let ' + $('a') + ' be ' + n + '’s age now. Adding ' + add + ' years gives ' + tot + ': ' + $('a + ' + add + ' = ' + tot) + '.', solve: 'Subtract ' + add + ' from both sides: ' + $('a = ' + tot + ' - ' + add + ' = ' + age) + '.' }; },
      function () { var k = R.int(2, 6), x = Q(R.int(4, 30)), big = x.mul(k); return { q: 'A dog weighs ' + $(k) + ' times as much as a cat. The dog weighs ' + $(big.toString()) + ' pounds. How much does the cat weigh?', eq: k + 'c = ' + big, eqs: [k + 'c = ' + big, 'c + ' + k + ' = ' + big, '\\frac{c}{' + k + '} = ' + big, big + 'c = ' + k], x: x, unit: 'pounds', v: 'c', why: 'Let ' + $('c') + ' be the cat’s weight. ' + k + ' times it is ' + big + ': ' + $(k + 'c = ' + big) + '.', solve: 'Divide by ' + k + ': ' + $('c = ' + big + ' \\div ' + k + ' = ' + x) + '.' }; },
      function () { var k = R.int(3, 8), pr = l === 1 ? Q(R.int(3, 15)) : Q(R.int(10, 60), 4), tot = pr.mul(k); return { q: $(k) + ' movie tickets cost ' + money(tot) + ' in all. Each ticket costs the same. What is the price of one ticket?', eq: k + 't = ' + D(tot), eqs: [k + 't = ' + D(tot), 't + ' + k + ' = ' + D(tot), '\\frac{t}{' + k + '} = ' + D(tot), 't - ' + k + ' = ' + D(tot)], x: pr, unit: 'dollars', v: 't', why: 'Let ' + $('t') + ' be the price of one ticket: ' + $(k + 't = ' + D(tot)) + '.', solve: 'Divide by ' + k + ': ' + $('t = ' + D(tot) + ' \\div ' + k + ' = ' + D(pr)) + '.' }; },
      function () { var k = R.int(3, 8), piece = l === 1 ? Q(R.int(2, 9)) : Q(R.int(4, 19), 2), len = piece.mul(k); return { q: 'A rope is cut into ' + $(k) + ' equal pieces. Each piece is ' + $(DT(piece)) + ' meters long. How long was the rope?', eq: '\\frac{r}{' + k + '} = ' + D(piece), eqs: ['\\frac{r}{' + k + '} = ' + D(piece), k + 'r = ' + D(piece), 'r - ' + k + ' = ' + D(piece), 'r + ' + k + ' = ' + D(piece)], x: len, unit: 'meters', v: 'r', why: 'Let ' + $('r') + ' be the rope’s length. Cutting it into ' + k + ' equal pieces divides it by ' + k + ': ' + $('\\frac{r}{' + k + '} = ' + D(piece)) + '.', solve: 'Multiply both sides by ' + k + ': ' + $('r = ' + D(piece) + ' \\times ' + k + ' = ' + D(len)) + '.' }; }
    ];
    var s = R.pick(kinds)();
    if (shape === 'pick') {
      var wrong = s.eqs.slice(1).filter(function (e) { return e !== s.eqs[0]; });
      return { q: s.q + ' Which equation fits the story?', a: mc($(s.eqs[0]), wrong.map($)), steps: [s.why, 'Check by solving: ' + s.solve + ' That answers the question.'], hint: 'Name the unknown with a letter, then say the story in math.', chk: { kind: 'pickeq', eqs: s.eqs, x: s.x.toPlain(), v: s.v } };
    }
    return { q: s.q, a: numD(s.x), unit: s.unit, steps: [s.why, s.solve, 'Check it in the story.'], hint: 'Choose a letter for the unknown, write an equation, then undo the operation.', chk: { kind: 'story', eq: s.eq, x: s.x.toPlain(), v: s.v } };
  });

  var IOPS = { '<': ['less than', 'open', 'left'], '>': ['greater than', 'open', 'right'], '\\le': ['less than or equal to', 'closed', 'left'], '\\ge': ['greater than or equal to', 'closed', 'right'] };
  var IPLAIN = { '<': '<', '>': '>', '\\le': '<=', '\\ge': '>=' };
  G('g6.inequalities-number-line', function (R, ctx) {
    var l = lv(ctx), v = R.pick(['x', 'n', 'y', 't', 'h']), op = R.pick(['<', '>', '\\le', '\\ge']), c = l === 1 ? R.int(-5, 9) : (R.coin() ? R.int(-9, 12) : Q(R.int(-19, 19), 2));
    var cq = qq(c), shape = R.pick(BY(ctx, ['graph', 'words', 'tf', 'read'], ['graph', 'words', 'tf', 'read', 'flip'], ['graph', 'words', 'tf', 'flip']));
    var ans = { t: 'ineq', v: v + ' ' + IPLAIN[op] + ' ' + cq.toPlain() }, txt = IOPS[op];
    if (shape === 'graph') {
      var mn = Math.floor(cq.toNumber()) - 5, mx = mn + 10;
      return { q: 'Write an inequality for the graph, using ' + $(v) + '.', a: ans, viz: { name: 'g6-ineq', opts: { op: IPLAIN[op], v: cq.toPlain(), min: mn, max: mx, controls: false, var: v }, label: 'A number line with a ' + txt[1] + ' circle at ' + D(cq) + ' and shading to the ' + txt[2] },
        steps: ['The circle is at ' + $(DT(cq)) + '. It is ' + txt[1] + (txt[1] === 'open' ? ', so ' + $(DT(cq)) + ' itself is not included.' : ', so ' + $(DT(cq)) + ' is included.'), 'The shading goes ' + txt[2] + ', toward the ' + (txt[2] === 'left' ? 'smaller' : 'larger') + ' numbers.', 'So ' + $(v) + ' is ' + txt[0] + ' ' + $(DT(cq)) + ': ' + $(v + ' ' + op + ' ' + DT(cq)) + '.'],
        hint: 'Open circle: < or >. Closed circle: ≤ or ≥. Then look at which way the shading goes.', chk: { kind: 'ineq', op: op, c: cq.toPlain() } };
    }
    if (shape === 'words') {
      var cw = R.int(5, 90), tb = -R.int(1, 9), w = R.pick([
        ['You must be at least ' + cw + ' inches tall to ride. Let ' + $(v) + ' be a rider’s height.', '\\ge', cw], ['Fewer than ' + cw + ' people fit in the room. Let ' + $(v) + ' be the number of people in it.', '<', cw],
        ['The speed limit is ' + cw + ' miles per hour: you may drive at most ' + cw + '. Let ' + $(v) + ' be a legal speed.', '\\le', cw], ['A prize goes to scores of more than ' + cw + ' points. Let ' + $(v) + ' be a winning score.', '>', cw],
        ['A bag can hold no more than ' + cw + ' pounds. Let ' + $(v) + ' be the weight it can hold.', '\\le', cw], ['The temperature stayed above ' + $(tb) + ' degrees all day. Let ' + $(v) + ' be the temperature.', '>', tb]]);
      var bound = w[2];
      return { q: w[0] + ' Write an inequality.', a: { t: 'ineq', v: v + ' ' + IPLAIN[w[1]] + ' ' + bound }, steps: ['Look for the key words: ' + IOPS[w[1]][0] + ' ' + $(bound) + '.', 'So ' + $(v + ' ' + w[1] + ' ' + bound) + '.'], hint: '"At least" means ≥, "at most" and "no more than" mean ≤, "more than" means >, "fewer than" means <.', chk: { kind: 'ineq', op: w[1], c: String(bound) } };
    }
    if (shape === 'tf') {
      var test = R.pick([cq, cq.add(R.int(1, 5)), cq.sub(R.int(1, 5)), cq.add(Q(1, 2))]), truth = op === '<' ? test.lt(cq) : op === '>' ? test.gt(cq) : op === '\\le' ? test.le(cq) : test.ge(cq);
      return { q: 'Is ' + $(v + ' = ' + DT(test)) + ' a solution of ' + $(v + ' ' + op + ' ' + DT(cq)) + '?', a: tf(truth), steps: ['Put ' + $(DT(test)) + ' in for ' + $(v) + ': is ' + $(DT(test) + ' ' + op + ' ' + DT(cq)) + ' true?', test.eq(cq) ? 'The numbers are equal. ' + (op === '<' || op === '>' ? 'The sign ' + $(op) + ' does not include equal, so it is false: not a solution.' : 'The sign ' + $(op) + ' includes equal, so it is true: a solution.') : $(DT(test)) + ' is ' + (test.lt(cq) ? 'less' : 'greater') + ' than ' + $(DT(cq)) + ', so the statement is ' + (truth ? 'true: it is a solution.' : 'false: it is not a solution.')], hint: 'Substitute and decide whether the statement is true. Be careful when the numbers are equal.', chk: { kind: 'tfineq', op: op, c: cq.toPlain(), t: test.toPlain(), truth: truth } };
    }
    if (shape === 'read') {
      var r = { '<': 0, '>': 1, '\\le': 2, '\\ge': 3 }[op];
      return { q: 'What does ' + $(v + ' ' + op + ' ' + DT(cq)) + ' mean?', a: mcKeep([$(v) + ' is less than ' + $(DT(cq)), $(v) + ' is greater than ' + $(DT(cq)), $(v) + ' is less than or equal to ' + $(DT(cq)), $(v) + ' is greater than or equal to ' + $(DT(cq))], r), steps: ['Read from the variable to the number: ' + $(v + ' ' + op + ' ' + DT(cq)) + ' says ' + $(v) + ' is ' + txt[0] + ' ' + $(DT(cq)) + '.'], hint: 'The small, pointed end of < or > faces the smaller side.', chk: { kind: 'mc' } };
    }
    var flipOp = { '<': '>', '>': '<', '\\le': '\\ge', '\\ge': '\\le' }[op];
    return { q: 'Write ' + $(DT(cq) + ' ' + flipOp + ' ' + v) + ' with ' + $(v) + ' on the left.', a: ans, steps: [$(DT(cq) + ' ' + flipOp + ' ' + v) + ' says ' + $(DT(cq)) + ' is ' + IOPS[flipOp][0] + ' ' + $(v) + '.', 'That means ' + $(v) + ' is ' + txt[0] + ' ' + $(DT(cq)) + '. The sign still points at the smaller side: ' + $(v + ' ' + op + ' ' + DT(cq)) + '.'], hint: 'Swap the sides and turn the sign around so it still points to the smaller side.', chk: { kind: 'ineq', op: op, c: cq.toPlain() } };
  });

  var DEPS = [
    { s: function (r) { return 'A plumber earns \\$' + r + ' for each hour of work. Let ' + $('h') + ' be the hours worked and ' + $('p') + ' the pay, in dollars.'; }, ind: 'h', dep: 'p', iw: 'the hours worked', dw: 'the pay', r: [30, 80] },
    { s: function (r) { return 'A plant grows ' + r + ' millimeters each week. Let ' + $('w') + ' be the number of weeks and ' + $('g') + ' the total growth in millimeters.'; }, ind: 'w', dep: 'g', iw: 'the number of weeks', dw: 'the total growth', r: [3, 15] },
    { s: function (r) { return 'Notebooks cost \\$' + r + ' each. Let ' + $('n') + ' be the number of notebooks bought and ' + $('c') + ' the total cost in dollars.'; }, ind: 'n', dep: 'c', iw: 'the number of notebooks', dw: 'the total cost', r: [2, 9] },
    { s: function (r) { return 'A car drives at ' + r + ' miles per hour. Let ' + $('t') + ' be the hours driven and ' + $('d') + ' the distance in miles.'; }, ind: 't', dep: 'd', iw: 'the hours driven', dw: 'the distance', r: [40, 70] },
    { s: function (r) { return 'A pool is filled at ' + r + ' gallons per minute. Let ' + $('m') + ' be the minutes and ' + $('g') + ' the gallons in the pool.'; }, ind: 'm', dep: 'g', iw: 'the minutes of filling', dw: 'the gallons in the pool', r: [8, 25] }
  ];
  G('g6.dependent-independent', function (R, ctx) {
    var l = lv(ctx), c = R.pick(DEPS), r = R.int(c.r[0], c.r[1]), shape = R.pick(BY(ctx, ['which', 'eq', 'use'], ['which', 'eq', 'use', 'axis', 'table'], ['eq', 'use', 'table', 'start', 'axis']));
    var base = c.s(r);
    if (shape === 'which') { var depQ = R.coin(); return { q: base + ' Which is the ' + (depQ ? 'dependent' : 'independent') + ' variable?', a: mcKeep([$(c.ind) + ', ' + c.iw, $(c.dep) + ', ' + c.dw], depQ ? 1 : 0), steps: ['The independent variable is the one we choose or that changes on its own: ' + c.iw + '.', 'The dependent variable depends on it: ' + c.dw + ' changes because ' + c.iw + ' change.', 'So ' + $(c.dep) + ' is dependent and ' + $(c.ind) + ' is independent.'], hint: 'Ask: which one changes because of the other?', chk: { kind: 'mc' } }; }
    if (shape === 'eq') return { q: base + ' Write an equation for ' + $(c.dep) + ' in terms of ' + $(c.ind) + '.', a: { t: 'eq', v: c.dep + ' = ' + r + c.ind, form: 'solved' }, steps: ['Each 1 of ' + $(c.ind) + ' adds ' + r + ' to ' + $(c.dep) + '.', 'So ' + $(c.dep) + ' is ' + r + ' times ' + $(c.ind) + ': ' + $(c.dep + ' = ' + r + c.ind) + '.', 'Check: when ' + $(c.ind + ' = 2') + ', ' + $(c.dep + ' = ' + 2 * r) + '.'], hint: 'Make a small table: ' + c.ind + ' = 1, 2, 3. What is ' + c.dep + ' each time?', chk: { kind: 'eq', r: r } };
    if (shape === 'use') { var x = R.int(2, 9); return { q: base + ' The equation is ' + $(c.dep + ' = ' + r + c.ind) + '. Find ' + $(c.dep) + ' when ' + $(c.ind + ' = ' + x) + '.', a: num(r * x), steps: ['Put ' + x + ' in for ' + $(c.ind) + ': ' + $(c.dep + ' = ' + r + ' \\times ' + x) + '.', $(c.dep + ' = ' + r * x) + '.'], hint: 'Substitute the value of the independent variable.', chk: { kind: 'val', v: r * x } }; }
    if (shape === 'axis') return { q: base + ' On a graph of this relationship, which variable goes on the horizontal axis?', a: mcKeep([$(c.ind) + ', ' + c.iw, $(c.dep) + ', ' + c.dw], 0), steps: ['By custom, the independent variable goes on the horizontal (x) axis and the dependent variable on the vertical (y) axis.', 'Here ' + $(c.ind) + ' is independent, so it goes across the bottom.'], hint: 'The variable that is the "cause" goes across.', chk: { kind: 'mc' } };
    if (shape === 'start') { var s0 = R.int(5, 40), x2 = R.int(2, 9); return { q: base + ' It starts at ' + s0 + ' (when ' + $(c.ind + ' = 0') + '). Write an equation for ' + $(c.dep) + ' in terms of ' + $(c.ind) + '.', a: { t: 'eq', v: c.dep + ' = ' + r + c.ind + ' + ' + s0, form: 'solved' }, steps: ['Start with ' + s0 + ' and add ' + r + ' for each 1 of ' + $(c.ind) + '.', $(c.dep + ' = ' + r + c.ind + ' + ' + s0) + '.', 'Check: when ' + $(c.ind + ' = ' + x2) + ', ' + $(c.dep + ' = ' + (r * x2 + s0)) + '.'], hint: 'What is the value at 0, and how much is added each step?', chk: { kind: 'eq2', r: r, s0: s0 } }; }
    var xs = [1, 2, 3, 5], hide = R.int(1, 3), rows = [[c.ind].concat(xs), [c.dep].concat(xs.map(function (x, i) { return i === hide ? '?' : r * x; }))];
    return { q: base + ' Complete the table: what number goes in place of the ?' + texTable(rows).replace(/\\text\{(\w)\}/g, '$1'), a: num(r * xs[hide]), steps: ['The rule is ' + $(c.dep + ' = ' + r + c.ind) + ': each ' + $(c.dep) + ' is ' + r + ' times its ' + $(c.ind) + '.', 'For ' + $(c.ind + ' = ' + xs[hide]) + ': ' + $(r + ' \\times ' + xs[hide] + ' = ' + r * xs[hide]) + '.'], hint: 'Find the rule from a full column, then use it.', chk: { kind: 'val', v: r * xs[hide] } };
  });

  // ================================================================== unit: area, surface area and volume
  var TRIPLES = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15], [8, 15, 17]];
  var UNITS = ['cm', 'in', 'm', 'ft'];
  var UNAME = { cm: 'centimeters', in: 'inches', m: 'meters', ft: 'feet', yd: 'yards', mm: 'millimeters' };
  function sqU(u) { return u + '²'; }
  function sqW(u) { return 'square ' + UNAME[u]; }
  var UNAME1 = { cm: 'centimeter', in: 'inch', m: 'meter', ft: 'foot', yd: 'yard', mm: 'millimeter' };
  function cuW(u, v) { return 'cubic ' + (v !== undefined && qq(v).eq(1) ? UNAME1[u] : UNAME[u]); }
  function shapeViz(o, label) { return { name: 'g6-shape', opts: o, label: label }; }
  function lab(a, b, text, side) { var o = { a: a, b: b, text: text }; if (side) o.side = side; return o; }
  function nn(x) { return D(x); }
  G('g6.area-parallelogram', function (R, ctx) {
    var l = lv(ctx), t = R.pick(TRIPLES.slice(0, 6)), u = R.pick(UNITS), sc = l === 2 && R.coin() ? Q(1, 2) : Q(1);
    var h = sc.mul(t[0]), o = sc.mul(t[1]), s = sc.mul(t[2]), b = Q(R.int(t[1] + 2, t[1] + 10)).mul(sc);
    if (l === 2 && sc.eq(1) && R.coin()) b = b.add(Q(1, 2));
    var A = b.mul(h), H = h.toNumber(), O = o.toNumber(), B = b.toNumber();
    var opts = { polys: [{ pts: [[0, 0], [B, 0], [B + O, H], [O, H]] }], labels: [lab([0, 0], [B, 0], nn(b) + ' ' + u), lab([0, 0], [O, H], nn(s) + ' ' + u)], dashes: [{ a: [O, H], b: [O, 0], text: nn(h) + ' ' + u, side: 1 }], right: [[[O, 0], [B, 0], [O, H]]] };
    if (l === 3 && R.coin()) {
      return { q: 'A parallelogram has an area of ' + $(nn(A)) + ' ' + sqW(u) + '. Its base is ' + $(nn(b)) + ' ' + u + '. How tall is it (its height)?', a: numD(h), unit: u,
        steps: ['The area of a parallelogram is base times height: ' + $('A = bh') + '.', 'So ' + $(nn(A) + ' = ' + nn(b) + ' \\times h') + '. Undo the multiplying by dividing: ' + $('h = ' + nn(A) + ' \\div ' + nn(b) + ' = ' + nn(h)) + '.', 'The height is ' + $(nn(h)) + ' ' + u + '.'],
        hint: 'Area = base × height. Which number is missing?', chk: { kind: 'div', A: A.toPlain(), b: b.toPlain() } };
    }
    return { q: 'Find the area of the parallelogram.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A parallelogram with base ' + nn(b) + ', slanted side ' + nn(s) + ' and height ' + nn(h) + ' ' + u),
      steps: ['Cut the triangle off one end and slide it to the other end: the parallelogram becomes a rectangle with the same base and height.', 'So ' + $('A = b \\times h') + ', where the height is the dashed line that meets the base at a right angle. The slanted side, ' + nn(s) + ' ' + u + ', is not the height.',
        $('A = ' + nn(b) + ' \\times ' + nn(h) + ' = ' + nn(A)) + ' ' + sqW(u) + '.'],
      hint: 'Use the height that makes a right angle with the base, not the slanted side.', chk: { kind: 'mul', a: b.toPlain(), b: h.toPlain() } };
  });

  G('g6.area-triangle', function (R, ctx) {
    var l = lv(ctx), u = R.pick(UNITS), kind = R.pick(BY(ctx, ['right', 'acute', 'acute'], ['right', 'acute', 'obtuse'], ['acute', 'obtuse', 'back', 'right']));
    var opts, b, h, A, desc;
    if (kind === 'right') {
      var t0 = R.pick(TRIPLES), ks = R.int(1, t0[2] > 10 ? 1 : 3), t = t0.map(function (z) { return z * ks; }); b = Q(t[0]); h = Q(t[1]); A = b.mul(h).div(2);
      opts = { polys: [{ pts: [[0, 0], [t[0], 0], [0, t[1]]] }], labels: [lab([0, 0], [t[0], 0], t[0] + ' ' + u), lab([0, 0], [0, t[1]], t[1] + ' ' + u), lab([t[0], 0], [0, t[1]], t[2] + ' ' + u)], right: [[[0, 0], [1, 0], [0, 1]]] };
      return { q: 'Find the area of the right triangle. Its sides are ' + t[0] + ', ' + t[1] + ' and ' + t[2] + ' ' + u + ' long.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A right triangle with sides ' + t.join(', ') + ' ' + u),
        steps: ['In a right triangle, the two sides that meet at the right angle are a base and its height.', 'The longest side, ' + t[2] + ' ' + u + ', is slanted, so it is not used.', $('A = \\frac{1}{2} \\times ' + t[0] + ' \\times ' + t[1] + ' = ' + nn(A)) + ' ' + sqW(u) + '.'],
        hint: 'Use the two sides that make the right angle. Then take half.', chk: { kind: 'tri', b: t[0], h: t[1] } };
    }
    var Bn = R.int(4, 14), Hn = R.int(3, 10), c = kind === 'obtuse' ? -R.int(2, 5) : R.int(1, Bn - 1);
    b = Q(Bn); h = Q(Hn); A = b.mul(h).div(2);
    if (kind === 'back') {
      var A2 = A; var findH = R.coin();
      return { q: 'A triangle has an area of ' + $(nn(A2)) + ' ' + sqW(u) + '. Its ' + (findH ? 'base is ' + $(Bn) + ' ' + u + '. What is its height?' : 'height is ' + $(Hn) + ' ' + u + '. What is its base?'), a: num(findH ? Hn : Bn), unit: u,
        steps: [$('A = \\frac{1}{2}bh') + ', so ' + $('bh = 2A = ' + nn(A2.mul(2))) + '.', findH ? $('h = ' + nn(A2.mul(2)) + ' \\div ' + Bn + ' = ' + Hn) + '.' : $('b = ' + nn(A2.mul(2)) + ' \\div ' + Hn + ' = ' + Bn) + '.', 'Check: ' + $('\\frac{1}{2} \\times ' + Bn + ' \\times ' + Hn + ' = ' + nn(A2)) + '.'],
        hint: 'Double the area first: that is base × height.', chk: { kind: 'triback', A: A2.toPlain(), known: findH ? Bn : Hn } };
    }
    opts = { polys: [{ pts: [[0, 0], [Bn, 0], [c, Hn]] }], labels: [lab([0, 0], [Bn, 0], Bn + ' ' + u)], dashes: [{ a: [c, Hn], b: [c, 0], text: Hn + ' ' + u, side: c < 0 ? -1 : 1 }], right: [[[c, 0], [c < 0 ? c - 1 : Bn, 0], [c, Hn]]] };
    if (c < 0) opts.dashes.push({ a: [c, 0], b: [0, 0] });
    var extra = '';
    var tr = TRIPLES.filter(function (q) { return q[0] === Hn && q[1] === Math.abs(c); })[0];
    if (tr && kind === 'acute') { opts.labels.push(lab([0, 0], [c, Hn], tr[2] + ' ' + u)); extra = ' The side of ' + tr[2] + ' ' + u + ' is slanted, so it is not the height.'; }
    if (kind === 'obtuse') { var sideLen = Math.round(Math.sqrt(Math.pow(Bn - c, 2) + Hn * Hn) * 10) / 10; }
    return { q: 'Find the area of the triangle. The base is ' + Bn + ' ' + u + ' and the dashed height is ' + Hn + ' ' + u + (tr && kind === 'acute' ? '; one slanted side is ' + tr[2] + ' ' + u : '') + '.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A triangle with base ' + Bn + ' and height ' + Hn + ' ' + u),
      steps: ['A triangle is half of a parallelogram with the same base and height, so ' + $('A = \\frac{1}{2}bh') + '.', kind === 'obtuse' ? 'The height is the dashed line from the top corner straight down to the line of the base. Here it lands outside the triangle, on the extended base. That is fine.' : 'The height is the dashed line that meets the base at a right angle.' + extra,
        $('A = \\frac{1}{2} \\times ' + Bn + ' \\times ' + Hn + ' = ' + nn(A)) + ' ' + sqW(u) + '.'],
      hint: 'Multiply base by height, then take half.', chk: { kind: 'tri', b: Bn, h: Hn } };
  });

  G('g6.area-trapezoid', function (R, ctx) {
    var l = lv(ctx), u = R.pick(UNITS), t = R.pick(TRIPLES.slice(0, 6)), H = t[0], x1 = t[1], b2 = R.int(2, 9), x2r = R.int(0, 4);
    var B1 = x1 + b2 + x2r, b1 = Q(B1), A = Q(B1 + b2).mul(H).div(2), back = l === 3 && R.coin();
    if (back) return { q: 'A trapezoid has bases of ' + $(B1) + ' ' + u + ' and ' + $(b2) + ' ' + u + ' and an area of ' + $(nn(A)) + ' ' + sqW(u) + '. What is its height?', a: num(H), unit: u,
      steps: [$('A = \\frac{1}{2}(b_1 + b_2)h') + ', so ' + $(nn(A) + ' = \\frac{1}{2}(' + B1 + ' + ' + b2 + ')h = ' + nn(Q(B1 + b2, 2)) + 'h') + '.', $('h = ' + nn(A) + ' \\div ' + nn(Q(B1 + b2, 2)) + ' = ' + H) + '.'], hint: 'Find half the sum of the bases first.', chk: { kind: 'trapback', A: A.toPlain(), b1: B1, b2: b2 } };
    var opts = { polys: [{ pts: [[0, 0], [B1, 0], [x1 + b2, H], [x1, H]] }], labels: [lab([0, 0], [B1, 0], B1 + ' ' + u), lab([x1, H], [x1 + b2, H], b2 + ' ' + u)], dashes: [{ a: [x1, H], b: [x1, 0], text: H + ' ' + u, side: 1 }], right: [[[x1, 0], [B1, 0], [x1, H]]] };
    if (l > 1) opts.labels.push(lab([0, 0], [x1, H], t[2] + ' ' + u));
    return { q: 'Find the area of the trapezoid.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A trapezoid with bases ' + B1 + ' and ' + b2 + ' and height ' + H + ' ' + u),
      steps: ['Two copies of a trapezoid, one turned upside down, fit together into a parallelogram with base ' + $('b_1 + b_2') + ' and the same height. The trapezoid is half of it: ' + $('A = \\frac{1}{2}(b_1 + b_2)h') + '.', 'The bases are the parallel sides, ' + B1 + ' and ' + b2 + '. The height is ' + H + (l > 1 ? '; the slanted side, ' + t[2] + ', is not needed' : '') + '.',
        $('A = \\frac{1}{2}(' + B1 + ' + ' + b2 + ') \\times ' + H + ' = \\frac{1}{2} \\times ' + (B1 + b2) + ' \\times ' + H + ' = ' + nn(A)) + ' ' + sqW(u) + '.'],
      hint: 'Add the two parallel sides, multiply by the height, and take half.', chk: { kind: 'trap', b1: B1, b2: b2, h: H } };
  });

  G('g6.area-polygons', function (R, ctx) {
    var l = lv(ctx), u = R.pick(['cm', 'm', 'ft', 'in', 'yd']), kind = R.pick(BY(ctx, ['L', 'house', 'L'], ['L', 'house', 'cut'], ['L', 'house', 'cut', 'U']));
    var W, H, A, opts, st;
    if (kind === 'L') {
      W = R.int(6, 14); H = R.int(5, 12); var w = R.int(2, W - 3), hh = R.int(2, H - 2); A = W * H - w * hh;
      var pts = [[0, 0], [W, 0], [W, H - hh], [W - w, H - hh], [W - w, H], [0, H]];
      var labs = [lab([0, 0], [W, 0], W + ' ' + u), lab([0, H], [0, 0], H + ' ' + u)];
      if (l === 1) labs.push(lab([W, 0], [W, H - hh], (H - hh) + ' ' + u), lab([W - w, H - hh], [W, H - hh], w + ' ' + u), lab([W - w, H], [W - w, H - hh], hh + ' ' + u), lab([0, H], [W - w, H], (W - w) + ' ' + u));
      else labs.push(lab([W - w, H - hh], [W, H - hh], w + ' ' + u), lab([W - w, H], [W - w, H - hh], hh + ' ' + u));
      opts = { polys: [{ pts: pts }], labels: labs };
      st = l === 1 ? ['Split the shape with a line into two rectangles. One way: a ' + (W - w) + ' by ' + H + ' rectangle on the left and a ' + w + ' by ' + (H - hh) + ' rectangle on the right.', $((W - w) + ' \\times ' + H + ' = ' + (W - w) * H) + ' and ' + $(w + ' \\times ' + (H - hh) + ' = ' + w * (H - hh)) + '.', 'Add: ' + $((W - w) * H + ' + ' + w * (H - hh) + ' = ' + A) + ' ' + sqW(u) + '.']
        : ['Think of a full ' + W + ' by ' + H + ' rectangle with a ' + w + ' by ' + hh + ' corner missing.', 'Full rectangle: ' + $(W + ' \\times ' + H + ' = ' + W * H) + '. Missing corner: ' + $(w + ' \\times ' + hh + ' = ' + w * hh) + '.', 'Subtract: ' + $(W * H + ' - ' + w * hh + ' = ' + A) + ' ' + sqW(u) + '. (Splitting into two rectangles and adding gives the same answer.)'];
      return { q: 'Find the area of the shape. All corners are right angles.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'An L-shaped figure'), steps: st, hint: 'Split it into rectangles, or take a missing corner away from a big rectangle.', chk: { kind: 'L', W: W, H: H, w: w, hh: hh } };
    }
    if (kind === 'house') {
      W = R.int(3, 7) * 2; H = R.int(3, 9); var t = R.int(2, 6); A = W * H + W * t / 2;
      opts = { polys: [{ pts: [[0, 0], [W, 0], [W, H], [W / 2, H + t], [0, H]] }], labels: [lab([0, 0], [W, 0], W + ' ' + u), lab([W, 0], [W, H], H + ' ' + u)], dashes: [{ a: [W / 2, H + t], b: [W / 2, H], text: t + ' ' + u, side: 1 }, { a: [0, H], b: [W, H] }] };
      return { q: 'Find the area of the shape (a rectangle with a triangle on top).', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A house shape: a rectangle with a triangle on top'),
        steps: ['Split it along the dashed line into a rectangle and a triangle.', 'Rectangle: ' + $(W + ' \\times ' + H + ' = ' + W * H) + '.', 'Triangle: base ' + W + ', height ' + t + ': ' + $('\\frac{1}{2} \\times ' + W + ' \\times ' + t + ' = ' + W * t / 2) + '.', 'Add: ' + $(W * H + ' + ' + W * t / 2 + ' = ' + A) + ' ' + sqW(u) + '.'],
        hint: 'Find the rectangle and the triangle separately, then add.', chk: { kind: 'house', W: W, H: H, t: t } };
    }
    if (kind === 'cut') {
      W = R.int(6, 14); H = R.int(5, 12); var cx = R.int(2, W - 2), cy = R.int(2, H - 2); A = W * H - cx * cy / 2;
      opts = { polys: [{ pts: [[0, 0], [W, 0], [W, H - cy], [W - cx, H], [0, H]] }], labels: [lab([0, 0], [W, 0], W + ' ' + u), lab([0, H], [0, 0], H + ' ' + u), lab([W - cx, H], [W, H], cx + ' ' + u, 1), lab([W, H], [W, H - cy], cy + ' ' + u, 1)], dashes: [{ a: [W - cx, H], b: [W, H] }, { a: [W, H], b: [W, H - cy] }] };
      return { q: 'A ' + W + ' by ' + H + ' rectangle has a right-triangle corner cut off. Find the area that is left.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A rectangle with one corner cut off'),
        steps: ['Start with the whole rectangle: ' + $(W + ' \\times ' + H + ' = ' + W * H) + '.', 'The cut-off triangle has legs ' + cx + ' and ' + cy + ': ' + $('\\frac{1}{2} \\times ' + cx + ' \\times ' + cy + ' = ' + nn(Q(cx * cy, 2))) + '.', 'Subtract: ' + $(W * H + ' - ' + nn(Q(cx * cy, 2)) + ' = ' + nn(Q(2 * W * H - cx * cy, 2))) + ' ' + sqW(u) + '.'],
        hint: 'Find the full rectangle, then take away the triangle.', chk: { kind: 'cut', W: W, H: H, cx: cx, cy: cy } };
    }
    W = R.int(8, 14); H = R.int(6, 10); var gw = R.int(2, W - 4), gh = R.int(2, H - 2), gx = R.int(2, W - gw - 2); A = W * H - gw * gh;
    opts = { polys: [{ pts: [[0, 0], [W, 0], [W, H], [gx + gw, H], [gx + gw, H - gh], [gx, H - gh], [gx, H], [0, H]] }], labels: [lab([0, 0], [W, 0], W + ' ' + u), lab([0, H], [0, 0], H + ' ' + u), lab([gx, H - gh], [gx + gw, H - gh], gw + ' ' + u, -1), lab([gx + gw, H], [gx + gw, H - gh], gh + ' ' + u, -1)] };
    return { q: 'Find the area of the U-shaped figure. All corners are right angles.', a: numD(A), unit: sqU(u), viz: shapeViz(opts, 'A U-shaped figure'),
      steps: ['Picture the full ' + W + ' by ' + H + ' rectangle: ' + $(W + ' \\times ' + H + ' = ' + W * H) + '.', 'The notch is a ' + gw + ' by ' + gh + ' rectangle: ' + $(gw + ' \\times ' + gh + ' = ' + gw * gh) + '.', 'Subtract: ' + $(W * H + ' - ' + gw * gh + ' = ' + A) + ' ' + sqW(u) + '.'],
      hint: 'Fill in the notch to make a rectangle, then take the notch away.', chk: { kind: 'L', W: W, H: H, w: gw, hh: gh } };
  });

  G('g6.polygons-on-grid', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['side', 'fourth', 'perim'], ['side', 'fourth', 'perim', 'area'], ['fourth', 'perim', 'area', 'tri']));
    var x1 = R.int(-8, 2), x2 = R.int(x1 + 2, Math.min(9, x1 + 12)), y1 = R.int(-8, 2), y2 = R.int(y1 + 2, Math.min(9, y1 + 12));
    if (l > 1 && x1 * x2 >= 0) { x1 = -R.int(1, 6); x2 = R.int(1, 8); }
    var P = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], L = ['A', 'B', 'C', 'D'], w = x2 - x1, h = y2 - y1;
    var ptsTex = P.map(function (p, i) { return L[i] + T.pt(p); });
    var vz = { name: 'g6-plane', opts: { xmin: -10, xmax: 10, ymin: -10, ymax: 10, points: P.map(function (p, i) { return { x: p[0], y: p[1], label: L[i] }; }), poly: P }, label: 'Rectangle ABCD on a coordinate plane' };
    var wSt = 'Side AB is horizontal (same y), so its length is the distance from ' + $(x1) + ' to ' + $(x2) + ': ' + $(w) + '.', hSt = 'Side BC is vertical (same x), so its length is the distance from ' + $(y1) + ' to ' + $(y2) + ': ' + $(h) + '.';
    if (shape === 'side') { var horiz = R.coin(); var p = { q: 'Rectangle ABCD has vertices ' + $(ptsTex.join(',\\ ')) + '. How long is side ' + (horiz ? 'AB' : 'BC') + '?', a: num(horiz ? w : h, 'int'), unit: 'units', steps: [horiz ? wSt : hSt, (horiz ? x1 * x2 : y1 * y2) < 0 ? 'The ends are on opposite sides of 0, so add their distances from 0.' : 'The ends are on the same side of 0, so subtract their distances from 0.'], hint: 'The two endpoints share one coordinate. Find the distance between the other coordinates.', chk: { kind: 'dist', a: horiz ? x1 : y1, b: horiz ? x2 : y2 } }; if (l === 1) p.viz = vz; return p; }
    if (shape === 'fourth') { var miss = R.int(0, 3), given = P.filter(function (_, i) { return i !== miss; }); return { q: 'Three vertices of a rectangle are ' + $(given.map(function (pp) { return T.pt(pp); }).join(',\\ ')) + '. The sides are horizontal and vertical. What is the fourth vertex?', a: { t: 'tuple', v: P[miss].map(String) }, steps: ['In a rectangle with horizontal and vertical sides, each x-coordinate is used twice and each y-coordinate is used twice.', 'The x-values given are ' + given.map(function (pp) { return $(pp[0]); }).join(', ') + ': ' + $(P[miss][0]) + ' is needed once more. The y-values are ' + given.map(function (pp) { return $(pp[1]); }).join(', ') + ': ' + $(P[miss][1]) + ' is needed once more.', 'The fourth vertex is ' + $(T.pt(P[miss])) + '.'], hint: 'Each x-coordinate and each y-coordinate should appear twice.', chk: { kind: 'fourth', P: P, miss: miss } }; }
    if (shape === 'perim') { var p2 = { q: 'Find the perimeter of rectangle ABCD with vertices ' + $(ptsTex.join(',\\ ')) + '.', a: num(2 * (w + h), 'int'), unit: 'units', steps: [wSt, hSt, 'Perimeter: ' + $('2 \\times ' + w + ' + 2 \\times ' + h + ' = ' + 2 * (w + h)) + ' units.'], hint: 'Find the length and the width from the coordinates first.', chk: { kind: 'perim', w: w, h: h } }; if (l <= 2) p2.viz = vz; return p2; }
    if (shape === 'area') return { q: 'Find the area of rectangle ABCD with vertices ' + $(ptsTex.join(',\\ ')) + '.', a: num(w * h, 'int'), unit: 'square units', steps: [wSt, hSt, 'Area: ' + $(w + ' \\times ' + h + ' = ' + w * h) + ' square units.'], hint: 'Length times width, each found from the coordinates.', chk: { kind: 'area', w: w, h: h } };
    var Tp = [[x1, y1], [x2, y1], [x1, y2]];
    return { q: 'A triangle has vertices ' + $(Tp.map(function (pp) { return T.pt(pp); }).join(',\\ ')) + '. Find its area.', a: numD(Q(w * h, 2)), unit: 'square units',
      steps: ['Two sides lie along grid lines: a horizontal side from ' + $(T.pt(Tp[0])) + ' to ' + $(T.pt(Tp[1])) + ' of length ' + w + ', and a vertical side from ' + $(T.pt(Tp[0])) + ' to ' + $(T.pt(Tp[2])) + ' of length ' + h + '.', 'They meet at a right angle, so they are a base and a height.', $('A = \\frac{1}{2} \\times ' + w + ' \\times ' + h + ' = ' + nn(Q(w * h, 2))) + ' square units.'],
      hint: 'Find the horizontal and vertical sides; they are the base and height.', viz: { name: 'g6-plane', opts: { xmin: -10, xmax: 10, ymin: -10, ymax: 10, points: Tp.map(function (pp) { return { x: pp[0], y: pp[1] }; }), poly: Tp }, label: 'A right triangle on a coordinate plane' }, chk: { kind: 'tri', b: w, h: h } };
  });

  function prismNet(Lx, Wy, Hz, u) {
    var r = function (x0, y0, x1, y1) { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; };
    return { polys: [{ pts: r(0, 0, Lx, Wy), fill: 'blue' }, { pts: r(0, -Hz, Lx, 0), fill: 'green' }, { pts: r(0, Wy, Lx, Wy + Hz), fill: 'green' }, { pts: r(0, Wy + Hz, Lx, 2 * Wy + Hz), fill: 'blue' }, { pts: r(-Hz, 0, 0, Wy), fill: 'gold' }, { pts: r(Lx, 0, Lx + Hz, Wy), fill: 'gold' }],
      labels: [lab([0, -Hz], [Lx, -Hz], Lx + ' ' + u, -1), lab([0, -Hz], [0, 0], Hz + ' ' + u), lab([Lx + Hz, 0], [Lx + Hz, Wy], Wy + ' ' + u, -1)] };
  }
  G('g6.nets-surface-area', function (R, ctx) {
    var l = lv(ctx), u = R.pick(['cm', 'in', 'm', 'ft']), kind = R.pick(BY(ctx, ['prism', 'cube', 'prism'], ['prism', 'cube', 'pyramid', 'tri'], ['prism', 'pyramid', 'tri', 'faces']));
    if (kind === 'cube') { var s = R.int(2, 12); return { q: 'A cube has edges ' + $(s) + ' ' + u + ' long. What is its surface area?', a: num(6 * s * s, 'int'), unit: sqU(u), steps: ['A cube has 6 faces, and each face is a square.', 'One face: ' + $(s + ' \\times ' + s + ' = ' + s * s) + ' ' + sqW(u) + '.', 'Six faces: ' + $('6 \\times ' + s * s + ' = ' + 6 * s * s) + ' ' + sqW(u) + '.'], hint: 'How many faces does a cube have, and what is the area of one?', chk: { kind: 'cube', s: s } }; }
    if (kind === 'prism' || kind === 'faces') {
      var Lx = R.int(2, 10), Wy = R.int(2, 8), Hz = R.int(1, 7); while (Lx === Wy && Wy === Hz) Hz++;
      var sa = 2 * (Lx * Wy + Lx * Hz + Wy * Hz);
      if (kind === 'faces') { var which = R.pick([['top and bottom', Lx * Wy, Lx + ' \\times ' + Wy], ['front and back', Lx * Hz, Lx + ' \\times ' + Hz], ['left and right', Wy * Hz, Wy + ' \\times ' + Hz]]);
        return { q: 'A box is ' + $(Lx) + ' ' + u + ' long, ' + $(Wy) + ' ' + u + ' wide and ' + $(Hz) + ' ' + u + ' tall. What is the total area of its ' + which[0] + ' faces together?', a: num(2 * which[1], 'int'), unit: sqU(u), steps: ['The ' + which[0] + ' faces are a matching pair of rectangles.', 'Each is ' + $(which[2] + ' = ' + which[1]) + ' ' + sqW(u) + '.', 'Together: ' + $('2 \\times ' + which[1] + ' = ' + 2 * which[1]) + ' ' + sqW(u) + '.'], hint: 'Opposite faces of a box are the same size.', chk: { kind: 'pair', v: 2 * which[1] } }; }
      var p = { q: 'The net folds into a box ' + $(Lx) + ' ' + u + ' long, ' + $(Wy) + ' ' + u + ' wide and ' + $(Hz) + ' ' + u + ' tall. Find the surface area of the box.', a: num(sa, 'int'), unit: sqU(u), viz: shapeViz(prismNet(Lx, Wy, Hz, u), 'The net of a rectangular box: six rectangles'),
        steps: ['A box has 6 faces in 3 matching pairs, and the net shows all 6.', 'Top and bottom: ' + $('2 \\times ' + Lx + ' \\times ' + Wy + ' = ' + 2 * Lx * Wy) + '.', 'Front and back: ' + $('2 \\times ' + Lx + ' \\times ' + Hz + ' = ' + 2 * Lx * Hz) + '.', 'Left and right: ' + $('2 \\times ' + Wy + ' \\times ' + Hz + ' = ' + 2 * Wy * Hz) + '.', 'Add: ' + $(2 * Lx * Wy + ' + ' + 2 * Lx * Hz + ' + ' + 2 * Wy * Hz + ' = ' + sa) + ' ' + sqW(u) + '.'],
        hint: 'Find the area of each pair of matching faces, then add all six faces.', chk: { kind: 'prism', l: Lx, w: Wy, h: Hz } };
      if (l > 1) delete p.viz;
      if (l > 1) p.q = 'A rectangular box is ' + $(Lx) + ' ' + u + ' long, ' + $(Wy) + ' ' + u + ' wide and ' + $(Hz) + ' ' + u + ' tall. Find its surface area.';
      return p;
    }
    if (kind === 'pyramid') {
      var b = R.int(2, 10), t = R.int(2, 12), sa2 = b * b + 2 * b * t;
      var opts = { polys: [{ pts: [[0, 0], [b, 0], [b, b], [0, b]], fill: 'blue' }, { pts: [[0, 0], [b / 2, -t], [b, 0]], fill: 'gold' }, { pts: [[b, 0], [b + t, b / 2], [b, b]], fill: 'gold' }, { pts: [[b, b], [b / 2, b + t], [0, b]], fill: 'gold' }, { pts: [[0, b], [-t, b / 2], [0, 0]], fill: 'gold' }], labels: [lab([0, b], [0, 0], b + ' ' + u, 1)], dashes: [{ a: [b / 2, -t], b: [b / 2, 0], text: t + ' ' + u, side: 1 }] };
      return { q: 'A square pyramid has a base ' + $(b) + ' ' + u + ' on each side. Each triangular face has a height of ' + $(t) + ' ' + u + '. Find the surface area.', a: num(sa2, 'int'), unit: sqU(u), viz: shapeViz(opts, 'The net of a square pyramid: a square and four triangles'),
        steps: ['The net is one square base and four matching triangles.', 'Base: ' + $(b + ' \\times ' + b + ' = ' + b * b) + '.', 'Each triangle: ' + $('\\frac{1}{2} \\times ' + b + ' \\times ' + t + ' = ' + nn(Q(b * t, 2))) + '. Four of them: ' + $(2 * b * t) + '.', 'Total: ' + $(b * b + ' + ' + 2 * b * t + ' = ' + sa2) + ' ' + sqW(u) + '.'],
        hint: 'One square plus four triangles.', chk: { kind: 'pyr', b: b, t: t } };
    }
    var tr = R.pick(TRIPLES.slice(0, 4)), a = tr[0], c = tr[1], hyp = tr[2], Ln = R.int(3, 12), sa3 = a * c + (a + c + hyp) * Ln;
    var o2 = { polys: [{ pts: [[0, 0], [a, 0], [a, Ln], [0, Ln]], fill: 'green' }, { pts: [[a, 0], [a + c, 0], [a + c, Ln], [a, Ln]], fill: 'green' }, { pts: [[a + c, 0], [a + c + hyp, 0], [a + c + hyp, Ln], [a + c, Ln]], fill: 'green' }, { pts: [[a, 0], [a + c, 0], [a, -a]], fill: 'gold' }, { pts: [[0, Ln], [a, Ln], [a, Ln + c]], fill: 'gold' }],
      labels: [lab([0, 0], [a, 0], a + ' ' + u, -1), lab([a, Ln], [a + c, Ln], c + ' ' + u, 1), lab([a + c, Ln], [a + c + hyp, Ln], hyp + ' ' + u, 1), lab([a + c + hyp, 0], [a + c + hyp, Ln], Ln + ' ' + u, -1)] };
    return { q: 'A triangular prism is ' + $(Ln) + ' ' + u + ' long. Its ends are right triangles with sides ' + $(a) + ', ' + $(c) + ' and ' + $(hyp) + ' ' + u + '. Find its surface area.', a: num(sa3, 'int'), unit: sqU(u), viz: shapeViz(o2, 'The net of a triangular prism: three rectangles and two triangles'),
      steps: ['The net has two triangles (the ends) and three rectangles (the sides).', 'Each triangle: legs ' + a + ' and ' + c + ' meet at the right angle, so ' + $('\\frac{1}{2} \\times ' + a + ' \\times ' + c + ' = ' + nn(Q(a * c, 2))) + '. Two of them: ' + $(a * c) + '.', 'The rectangles are ' + Ln + ' long and as wide as each side of the triangle: ' + $('(' + a + ' + ' + c + ' + ' + hyp + ') \\times ' + Ln + ' = ' + (a + c + hyp) * Ln) + '.', 'Total: ' + $(a * c + ' + ' + (a + c + hyp) * Ln + ' = ' + sa3) + ' ' + sqW(u) + '.'],
      hint: 'Two triangles plus three rectangles. The rectangles together are as wide as the triangle’s perimeter.', chk: { kind: 'triprism', a: a, c: c, h: hyp, L: Ln } };
  });

  G('g6.volume-fractional-edges', function (R, ctx) {
    var l = lv(ctx), kind = R.pick(BY(ctx, ['count', 'vol', 'count'], ['vol', 'count', 'cube'], ['vol', 'missing', 'cube', 'vol'])), u = R.pick(['in', 'cm', 'ft', 'm']);
    function edge(dens) { var d = R.pick(dens); return Q(R.int(1, 3 * d), d).add(R.coin() ? 0 : R.int(1, 2)); }
    function show(x) { return x.isInt() || x.lt(1) ? F(x) : MX(x); }
    if (kind === 'count') {
      var k = R.pick(l === 1 ? [2] : [2, 3, 4]), dims = [R.int(1, 3 * k), R.int(1, 3 * k), R.int(1, 2 * k)].map(function (n) { return Q(n, k); });
      if (dims.every(function (d) { return d.isInt(); })) dims[0] = Q(2 * k + 1, k);
      var cnt = dims.reduce(function (p, d) { return p * d.mul(k).num(); }, 1), V = Q(cnt, k * k * k);
      return { q: 'A box is ' + $(show(dims[0])) + ' by ' + $(show(dims[1])) + ' by ' + $(show(dims[2])) + ' ' + u + '. How many cubes with edges of ' + $('\\frac{1}{' + k + '}') + ' ' + u + ' fill it exactly?', a: num(cnt, 'int'),
        steps: ['Count how many ' + $('\\frac{1}{' + k + '}') + '-' + u + ' cubes fit along each edge: multiply each length by ' + k + '.', dims.map(function (d) { return $(show(d) + ' \\times ' + k + ' = ' + d.mul(k).toString()); }).join(', ') + '.', 'Cubes in all: ' + $(dims.map(function (d) { return d.mul(k).toString(); }).join(' \\times ') + ' = ' + cnt) + '.', 'Each small cube is ' + $('\\frac{1}{' + k * k * k + '}') + ' of ' + an(UNAME1[u]) + ' cube, so the volume is ' + $(F(V)) + ' ' + cuW(u, V) + ', the same as ' + $(dims.map(show).join(' \\times ')) + '.'],
        hint: 'How many small cubes fit along each edge?', chk: { kind: 'count', dims: dims.map(function (d) { return d.toPlain(); }), k: k } };
    }
    if (kind === 'cube') { var s = Q(R.int(1, 7), R.pick([2, 3, 4])); if (s.isInt()) s = Q(3, 2); var V2 = s.pow(3); return { q: 'A cube has edges ' + $(show(s)) + ' ' + u + ' long. What is its volume?', a: numM(V2), unit: cuW(u), steps: [$('V = s \\times s \\times s = s^{3}') + '.', $('\\left(' + F(s) + '\\right)^{3} = ' + F(s) + ' \\times ' + F(s) + ' \\times ' + F(s) + ' = ' + F(V2)) + (V2.gt(1) && !V2.isInt() ? ' = ' + $(MX(V2)) : '') + ' ' + cuW(u) + '.'], hint: 'Multiply the edge by itself three times. Use improper fractions.', chk: { kind: 'vol', dims: [s.toPlain(), s.toPlain(), s.toPlain()] } }; }
    var d1 = edge([2, 4]), d2 = edge([2, 3]), d3 = Q(R.int(1, 6)).add(R.coin() ? Q(1, 2) : 0); if (d1.isInt() && d2.isInt()) d1 = d1.add(Q(1, 2));
    var V3 = d1.mul(d2).mul(d3);
    if (kind === 'missing') return { q: 'A box has a volume of ' + $(show(V3)) + ' ' + cuW(u) + '. Its length is ' + $(show(d1)) + ' ' + u + ' and its width is ' + $(show(d2)) + ' ' + u + '. What is its height?', a: numM(d3), unit: u,
      steps: [$('V = \\ell w h') + ', so ' + $('h = V \\div (\\ell w)') + '.', 'Base area: ' + $(F(d1) + ' \\times ' + F(d2) + ' = ' + F(d1.mul(d2))) + '.', $('h = ' + F(V3) + ' \\div ' + F(d1.mul(d2)) + ' = ' + F(V3) + ' \\times ' + F(d1.mul(d2).inv()) + ' = ' + DT(d3)) + ' ' + u + '.'], hint: 'Find the area of the base, then divide the volume by it.', chk: { kind: 'missing', V: V3.toPlain(), a: d1.toPlain(), b: d2.toPlain() } };
    return { q: 'Find the volume of a box that is ' + $(show(d1)) + ' ' + u + ' long, ' + $(show(d2)) + ' ' + u + ' wide and ' + $(show(d3)) + ' ' + u + ' tall.', a: numM(V3), unit: cuW(u),
      steps: [$('V = \\ell \\times w \\times h') + ' works for fraction edges too: it counts small fraction cubes, and each one is a fraction of a unit cube.', 'Write each as a fraction: ' + $([d1, d2, d3].map(F).join(',\\ ')) + '.', $(F(d1) + ' \\times ' + F(d2) + ' \\times ' + F(d3) + ' = ' + F(V3)) + (V3.gt(1) && !V3.isInt() ? ' = ' + $(MX(V3)) : '') + ' ' + cuW(u) + '.'],
      hint: 'Change mixed numbers to fractions, then multiply all three.', chk: { kind: 'vol', dims: [d1.toPlain(), d2.toPlain(), d3.toPlain()] } };
  });

  // ================================================================== unit: statistics
  var SQ = ['How many hours of sleep do the students in our class get on a school night?', 'How tall are the sunflowers in the school garden?',
    'How many pets do the families on our street have?', 'What are the shoe sizes of the players on the soccer team?',
    'How long does it take the sixth graders at our school to get to school?', 'How many books did each student in our class read this summer?',
    'What were the daily high temperatures in our town last month?', 'How much do the backpacks of the sixth graders weigh?',
    'How many minutes did each runner take to finish the race?', 'How many points did our basketball team score in each game this season?',
    'How many raisins are in each of the small boxes in this case?', 'How old are the people at the library this afternoon?',
    'How many letters are in the first names of the students in our class?', 'How many hours of TV did each family on our block watch last week?'];
  var NQ = ['How old am I?', 'How tall is the flagpole in front of our school?', 'How many students are in Room 12 right now?',
    'How many days are in a week?', 'What was the high temperature in our town yesterday?', 'How many pets does my family have?',
    'How much does my backpack weigh?', 'How many points did our team score in last night’s game?', 'What time does our school start?',
    'How many pages are in this book?', 'What is the capital of Ohio?', 'How many letters are in my first name?', 'How tall is our teacher?'];
  G('g6.statistical-questions', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['is', 'is', 'tf'], ['is', 'not', 'tf'], ['is', 'not', 'tf']));
    var why = 'A statistical question expects answers that vary, so you would collect many pieces of data to answer it.';
    if (shape === 'tf') { var stat = R.coin(), q = R.pick(stat ? SQ : NQ);
      return { q: 'True or false: "' + q + '" is a statistical question.', a: tf(stat), steps: [why, stat ? 'This question asks about many people or things, and the answers will differ. It is statistical: true.' : 'This question has one answer that you could look up or measure once. It is not statistical: false.'], hint: 'Would you get one answer, or many answers that vary?', chk: { kind: 'sq', q: q, stat: stat } }; }
    if (shape === 'is') { var right = R.pick(SQ), w = R.sample(NQ, 3);
      return { q: 'Which is a statistical question?', a: mc(right, w), steps: [why, '"' + right + '" collects many answers that will differ.', 'The other questions each have a single answer.'], hint: 'Look for a question about a group, where the answers will not all be the same.', chk: { kind: 'mc' } }; }
    var odd = R.pick(NQ), others = R.sample(SQ, 3);
    return { q: 'Which is NOT a statistical question?', a: mc(odd, others), steps: [why, '"' + odd + '" has just one answer, so it is not statistical.', 'The others ask about a group, and the answers will vary.'], hint: 'Find the question with only one answer.', chk: { kind: 'mc' } };
  });

  function dataSet(R, n, lo, hi, peak) { var out = []; for (var i = 0; i < n; i++) { var v = R.int(lo, hi); if (peak !== undefined && R.chance(0.35)) v = Math.max(lo, Math.min(hi, peak + R.int(-1, 1))); out.push(v); } return out.sort(function (a, b) { return a - b; }); }
  function countIf(arr, f) { return arr.filter(f).length; }
  var DOTCTX = [['the number of pets each student in a class has', 'Number of pets', 'students have'], ['how many books each student read this month', 'Books read this month', 'students read'], ['the goals a team scored in each game', 'Goals scored in a game', 'games had'], ['the number of siblings each student has', 'Number of siblings', 'students have']];
  G('g6.dot-plots-histograms', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['dcount', 'dmore', 'dtotal', 'hcount'], ['dmore', 'hcount', 'hmore', 'build', 'dmode'], ['hmore', 'build', 'why', 'dmore', 'hcount']));
    if (shape[0] === 'd') {
      var c = R.pick(DOTCTX), data = dataSet(R, R.int(10, 18), 0, R.int(5, 8), R.int(1, 4)), vz = { name: 'g6-dots', opts: { data: data, min: 0, max: Math.max(8, data[data.length - 1]), label: c[1] }, label: 'A dot plot of ' + c[1].toLowerCase() };
      var vals = U.uniq(data);
      if (shape === 'dcount') { var v = R.pick(vals), k = countIf(data, function (x) { return x === v; }); return { q: 'The dot plot shows ' + c[0] + '. How many ' + c[2] + ' exactly ' + v + '?', a: num(k, 'int'), viz: vz, steps: ['Each dot is one data value.', 'Count the dots stacked above ' + v + ': there are ' + k + '.'], hint: 'Count the dots above ' + v + '.', chk: { kind: 'count', data: data, f: 'eq', v: v } }; }
      if (shape === 'dtotal') return { q: 'How many data values does the dot plot show?', a: num(data.length, 'int'), viz: vz, steps: ['Each dot is one value. Count the dots in every column and add.', U.uniq(data).map(function (x) { return countIf(data, function (y) { return y === x; }); }).join(' + ') + ' = ' + data.length + '.'], hint: 'Add up the dots in each column.', chk: { kind: 'count', data: data, f: 'all' } };
      if (shape === 'dmode') { var cnts = vals.map(function (x) { return countIf(data, function (y) { return y === x; }); }), best = Math.max.apply(null, cnts); if (cnts.filter(function (x) { return x === best; }).length > 1) { data.push(vals[cnts.indexOf(best)]); data.sort(function (a, b) { return a - b; }); vz.opts.data = data; } var mode = U.mode(data)[0];
        return { q: 'Which value appears most often in the dot plot?', a: num(mode, 'int'), viz: vz, steps: ['The value that appears most often (the mode) has the tallest stack of dots.', 'The tallest stack is above ' + mode + '.'], hint: 'Find the tallest column.', chk: { kind: 'mode', data: data } }; }
      var cut = R.int(1, 5), more = countIf(data, function (x) { return x > cut; });
      return { q: 'The dot plot shows ' + c[0] + '. How many values are greater than ' + cut + '?', a: num(more, 'int'), viz: vz, steps: ['Count only the dots to the right of ' + cut + ' (not the ones at ' + cut + ').', 'There are ' + more + ' of them.'], hint: '"Greater than ' + cut + '" does not include ' + cut + ' itself.', chk: { kind: 'count', data: data, f: 'gt', v: cut } };
    }
    var w = R.pick([5, 10]), start = R.pick([0, 10, 20]), nb = R.int(4, 6), counts = []; for (var i = 0; i < nb; i++) counts.push(R.int(1, 9));
    var hl = R.pick(['Minutes spent on homework', 'Heights of plants (cm)', 'Ages of people at a park', 'Points scored']), hv = { name: 'g6-histogram', opts: { start: start, width: w, counts: counts, label: hl, controls: false }, label: 'A histogram of ' + hl.toLowerCase() };
    function iv(j) { return (start + j * w) + '–' + (start + (j + 1) * w - 1); }
    if (shape === 'hcount') { var j = R.int(0, nb - 1); return { q: 'In the histogram, how many data values are in the interval ' + iv(j) + '?', a: num(counts[j], 'int'), viz: hv, steps: ['Each bar covers one interval. Its height is how many values fall in that interval.', 'The bar over ' + iv(j) + ' reaches ' + counts[j] + '.'], hint: 'Read the height of that one bar.', chk: { kind: 'hist', counts: counts, from: j, to: j } }; }
    if (shape === 'hmore') { var j2 = R.int(1, nb - 1), tot = counts.slice(j2).reduce(function (a, b) { return a + b; }, 0); return { q: 'In the histogram, how many data values are ' + (start + j2 * w) + ' or more?', a: num(tot, 'int'), viz: hv, steps: ['Add the heights of the bars from ' + iv(j2) + ' on.', counts.slice(j2).join(' + ') + ' = ' + tot + '.'], hint: 'Add the bars from ' + (start + j2 * w) + ' to the end.', chk: { kind: 'hist', counts: counts, from: j2, to: nb - 1 } }; }
    if (shape === 'build') { var data2 = []; counts.forEach(function (cn, j) { for (var t = 0; t < Math.min(cn, 4); t++) data2.push(start + j * w + R.int(0, w - 1)); }); data2 = R.shuffle(data2).slice(0, 14); var j3 = R.int(0, nb - 1), lo = start + j3 * w, hi = lo + w - 1, k3 = countIf(data2, function (x) { return x >= lo && x <= hi; });
      if (!k3) { data2[0] = lo + R.int(0, w - 1); k3 = countIf(data2, function (x) { return x >= lo && x <= hi; }); }
      return { q: 'Here are some data: ' + $(data2.join(',\\ ')) + '. To make a histogram with intervals ' + iv(0) + ', ' + iv(1) + ', and so on, how tall is the bar for ' + lo + '–' + hi + '?', a: num(k3, 'int'), steps: ['Count the values from ' + lo + ' to ' + hi + ', including both ends.', 'They are ' + (data2.filter(function (x) { return x >= lo && x <= hi; }).sort(function (a, b) { return a - b; }).join(', ')) + ': ' + k3 + ' value' + (k3 === 1 ? '' : 's') + '.'], hint: 'Go through the list and tally the values in that interval.', chk: { kind: 'count', data: data2, f: 'in', v: lo, w: hi } }; }
    return { q: 'A histogram shows test scores. Which set of intervals could it use?', a: mc('0–19, 20–39, 40–59, 60–79, 80–99', ['0–9, 10–29, 30–79, 80–99', '0–20, 20–50, 50–100', '0–49, 60–79, 80–99']), steps: ['Histogram intervals must all be the same width, must not overlap, and must leave no gaps.', 'Only 0–19, 20–39, 40–59, 60–79, 80–99 does all three: each holds 20 whole numbers.', 'Because the intervals meet with no gaps, the bars of a histogram touch.'], hint: 'Look for equal widths, no overlaps and no gaps.', chk: { kind: 'mc' } };
  });

  function dataMean(R, n, lo, hi, m) { for (var t = 0; t < 200; t++) { var d = []; for (var i = 0; i < n - 1; i++) d.push(R.int(lo, hi)); var last = m * n - d.reduce(function (a, b) { return a + b; }, 0); if (last >= lo && last <= hi) { d.push(last); return R.shuffle(d); } } var e = []; for (var j = 0; j < n; j++) e.push(m); e[0] = m - 1; e[1] = m + 1; return e; }
  G('g6.mean', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['mean', 'mean', 'share'], ['mean', 'half', 'share', 'mean'], ['missing', 'half', 'mean', 'missing']));
    var n = R.int(4, l === 1 ? 6 : 8), m = R.int(5, l === 1 ? 20 : 60), lo = Math.max(1, m - 12), hi = m + 12, d, sm;
    if (shape === 'half') { n = R.pick([4, 5, 8]); d = dataMean(R, n, lo, hi, m); d[0] += R.int(1, n - 1); sm = d.reduce(function (a, b) { return a + b; }, 0); var mq = Q(sm, d.length);
      return { q: 'Find the mean of ' + $(d.join(',\\ ')) + '.', a: numD(mq), steps: ['Add the values: ' + $(d.join(' + ') + ' = ' + sm) + '.', 'Divide by how many there are (' + d.length + '): ' + $(sm + ' \\div ' + d.length + ' = ' + DT(mq)) + '.'], hint: 'Add them all, then divide by how many there are.', chk: { kind: 'mean', data: d } }; }
    d = dataMean(R, n, lo, hi, m); sm = m * n;
    if (shape === 'share') { var it = R.pick([['stickers', 'friends'], ['marbles', 'cousins'], ['cards', 'players']]), N = names2(R);
      return { q: $(n) + ' ' + it[1] + ' have ' + U.list(d.map(function (x) { return $(x); })) + ' ' + it[0] + '. If they put them all together and share them equally, how many does each get?', a: num(m, 'int'), steps: ['Put them all together: ' + $(d.join(' + ') + ' = ' + sm) + '.', 'Share equally among ' + n + ': ' + $(sm + ' \\div ' + n + ' = ' + m) + '.', 'This fair share is the mean.'], hint: 'Total first, then split it equally.', chk: { kind: 'mean', data: d } }; }
    if (shape === 'missing') { var known = d.slice(0, n - 1), miss = d[n - 1];
      return { q: 'The mean of ' + n + ' quiz scores is ' + $(m) + '. ' + (n - 1) + ' of the scores are ' + $(known.join(',\\ ')) + '. What is the last score?', a: num(miss, 'int'), steps: ['If the mean of ' + n + ' scores is ' + m + ', the scores add up to ' + $(n + ' \\times ' + m + ' = ' + sm) + '.', 'The known scores add to ' + $(known.reduce(function (a, b) { return a + b; }, 0)) + '.', 'The last score is ' + $(sm + ' - ' + known.reduce(function (a, b) { return a + b; }, 0) + ' = ' + miss) + '.'], hint: 'Mean × count gives the total of all the scores.', chk: { kind: 'missing', known: known, n: n, m: m } }; }
    return { q: 'Find the mean of ' + $(d.join(',\\ ')) + '.', a: num(m), steps: ['Add the values: ' + $(d.join(' + ') + ' = ' + sm) + '.', 'Divide by how many values there are (' + n + '): ' + $(sm + ' \\div ' + n + ' = ' + m) + '.', 'The mean is ' + $(m) + ': if the total were shared out evenly, each value would be ' + m + '.'], hint: 'Add them all, then divide by how many there are.', chk: { kind: 'mean', data: d } };
  });

  function medianQ(sorted) { var n = sorted.length; return n % 2 ? Q(sorted[(n - 1) / 2]) : Q(sorted[n / 2 - 1] + sorted[n / 2], 2); }
  G('g6.median-mode', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['medOdd', 'medOdd', 'mode'], ['medOdd', 'medEven', 'mode'], ['medEven', 'dot', 'mode', 'medOdd']));
    var n = shape === 'medEven' ? R.pick([6, 8, 10]) : shape === 'medOdd' ? R.pick([5, 7, 9]) : R.int(7, 11);
    var data = []; for (var i = 0; i < n; i++) data.push(R.int(1, l === 1 ? 30 : 99));
    if (shape === 'mode') { var mv = R.pick(data); data[0] = mv; data[1] = mv; var modes = U.mode(data); if (modes.length > 1) { data[2] = mv; } var mo = U.mode(data);
      while (U.mode(data).length > 1) data.push(mv);
      var md = U.mode(data)[0], sh = R.shuffle(data);
      return { q: 'Find the mode of ' + $(sh.join(',\\ ')) + '.', a: num(md, 'int'), steps: ['The mode is the value that appears most often.', 'Sorting helps you see repeats: ' + $(data.slice().sort(function (a, b) { return a - b; }).join(',\\ ')) + '.', $(md) + ' appears ' + countIf(data, function (x) { return x === md; }) + ' times, more than any other value.'], hint: 'Which number shows up the most?', chk: { kind: 'mode', data: data } }; }
    if (shape === 'dot') { var dd = dataSet(R, R.int(9, 16), 1, 9, R.int(3, 7)), mq = medianQ(dd);
      return { q: 'The dot plot shows how many hours some students spent reading last week. What is the median?', a: numD(mq), viz: { name: 'g6-dots', opts: { data: dd, min: 0, max: 10, label: 'Hours of reading' }, label: 'A dot plot of hours of reading' },
        steps: ['The dot plot already puts the values in order from left to right. There are ' + dd.length + ' dots.', dd.length % 2 ? 'The middle one is dot number ' + (dd.length + 1) / 2 + ' from the left: ' + $(D(mq)) + '.' : 'The middle two are dots ' + dd.length / 2 + ' and ' + (dd.length / 2 + 1) + ': ' + dd[dd.length / 2 - 1] + ' and ' + dd[dd.length / 2] + '. Their mean is ' + $(DT(mq)) + '.'], hint: 'Count dots from the left to the middle.', chk: { kind: 'median', data: dd } }; }
    var sorted = data.slice().sort(function (a, b) { return a - b; }), med = medianQ(sorted), shown = R.shuffle(data);
    return { q: 'Find the median of ' + $(shown.join(',\\ ')) + '.', a: numD(med), steps: ['First put the values in order: ' + $(sorted.join(',\\ ')) + '.', n % 2 ? 'There are ' + n + ' values, so the middle one is number ' + (n + 1) / 2 + ': ' + $(D(med)) + '.' : 'There are ' + n + ' values, so there are two middle ones: ' + sorted[n / 2 - 1] + ' and ' + sorted[n / 2] + '. The median is their mean: ' + $('(' + sorted[n / 2 - 1] + ' + ' + sorted[n / 2] + ') \\div 2 = ' + DT(med)) + '.'], hint: 'Put the numbers in order first.', chk: { kind: 'median', data: data } };
  });

  function quart(sorted) { var n = sorted.length, h = Math.floor(n / 2), lo = sorted.slice(0, h), hi = sorted.slice(n % 2 ? h + 1 : h); return { min: sorted[0], q1: medianQ(lo), med: medianQ(sorted), q3: medianQ(hi), max: sorted[n - 1], lo: lo, hi: hi }; }
  G('g6.range-iqr', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['range', 'iqr', 'q'], ['iqr', 'range', 'q'], ['iqr', 'iqr', 'q', 'range'])), n = R.int(l === 1 ? 7 : 8, l === 3 ? 13 : 11);
    var data = []; for (var i = 0; i < n; i++) data.push(R.int(2, l === 1 ? 40 : 95)); data = U.uniq(data); while (data.length < 6) data.push(R.int(2, 99)); data = U.uniq(data);
    var s = data.slice().sort(function (a, b) { return a - b; }), qd = quart(s), shown = R.shuffle(data), N = s.length;
    var stepsQ = ['Put the data in order: ' + $(s.join(',\\ ')) + '.', 'The median splits it in half' + (N % 2 ? ' (the middle value, ' + qd.med.toString() + ', is left out of both halves)' : '') + '. Lower half: ' + $(qd.lo.join(',\\ ')) + '. Upper half: ' + $(qd.hi.join(',\\ ')) + '.',
      $('Q_1') + ' is the median of the lower half: ' + $(DT(qd.q1)) + '. ' + $('Q_3') + ' is the median of the upper half: ' + $(DT(qd.q3)) + '.'];
    if (shape === 'range') return { q: 'Find the range of ' + $(shown.join(',\\ ')) + '.', a: num(qd.max - qd.min, 'int'), steps: ['The range is the greatest value minus the least value.', 'Greatest: ' + qd.max + '. Least: ' + qd.min + '.', $(qd.max + ' - ' + qd.min + ' = ' + (qd.max - qd.min)) + '.'], hint: 'Biggest minus smallest.', chk: { kind: 'range', data: data } };
    if (shape === 'q') { var up = R.coin(); return { q: 'Find the ' + (up ? 'third quartile, ' + $('Q_3') : 'first quartile, ' + $('Q_1')) + ', of ' + $(shown.join(',\\ ')) + '.', a: numD(up ? qd.q3 : qd.q1), steps: stepsQ, hint: 'Order the data, split it at the median, then find the middle of the ' + (up ? 'upper' : 'lower') + ' half.', chk: { kind: up ? 'q3' : 'q1', data: data } }; }
    var iqr = qd.q3.sub(qd.q1);
    return { q: 'Find the interquartile range (IQR) of ' + $(shown.join(',\\ ')) + '.', a: numD(iqr), steps: stepsQ.concat(['IQR = ' + $('Q_3 - Q_1 = ' + DT(qd.q3) + ' - ' + DT(qd.q1) + ' = ' + DT(iqr)) + '. This is the spread of the middle half of the data.']), hint: 'Find Q1 and Q3 first. The IQR is their difference.', chk: { kind: 'iqr', data: data } };
  });

  G('g6.box-plots', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['read', 'read', 'pct', 'iqr'], ['read', 'iqr', 'pct', 'myth', 'range'], ['five', 'iqr', 'myth', 'pct', 'five']));
    var mn = R.int(0, 20), q1 = mn + R.int(2, 15), med = q1 + R.int(1, 12), q3 = med + R.int(1, 12), mx = q3 + R.int(2, 20), fv = [mn, q1, med, q3, mx];
    var ctxs = ['Minutes waiting for a bus', 'Heights of seedlings (cm)', 'Scores on a game', 'Pages read in a week'], lb = R.pick(ctxs);
    var lo = Math.floor(mn / 10) * 10, hi = Math.ceil((mx + 1) / 10) * 10, bz = { name: 'g6-box', opts: { five: fv, min: lo, max: hi, label: lb }, label: 'A box plot of ' + lb.toLowerCase() };
    if (shape === 'read') { var which = R.int(0, 4), nm = ['minimum', 'first quartile (Q1)', 'median', 'third quartile (Q3)', 'maximum'][which];
      return { q: 'What is the ' + nm + ' shown by the box plot?', a: num(fv[which], 'int'), viz: bz, steps: ['A box plot marks five numbers: the minimum (left whisker end), Q1 (left edge of the box), the median (line inside the box), Q3 (right edge of the box) and the maximum (right whisker end).', 'The ' + nm + ' is at ' + $(fv[which]) + '.'], hint: 'Match each part of the picture to one of the five numbers.', chk: { kind: 'five', fv: fv, which: which } }; }
    if (shape === 'iqr') return { q: 'What is the interquartile range of the data in the box plot?', a: num(q3 - q1, 'int'), viz: bz, steps: ['The box goes from ' + $('Q_1 = ' + q1) + ' to ' + $('Q_3 = ' + q3) + '.', 'IQR = ' + $(q3 + ' - ' + q1 + ' = ' + (q3 - q1)) + ': the width of the box.'], hint: 'The IQR is the width of the box.', chk: { kind: 'iqr5', fv: fv } };
    if (shape === 'range') return { q: 'What is the range of the data in the box plot?', a: num(mx - mn, 'int'), viz: bz, steps: ['The range is from the end of one whisker to the end of the other.', $(mx + ' - ' + mn + ' = ' + (mx - mn)) + '.'], hint: 'Maximum minus minimum.', chk: { kind: 'range5', fv: fv } };
    if (shape === 'pct') { var pp = R.pick([['between Q1 and Q3 (inside the box)', 50], ['above the median', 50], ['below Q1', 25], ['above Q3', 25], ['below Q3', 75], ['above Q1', 75]]);
      return { q: 'About what percent of the data in a box plot is ' + pp[0] + '?', a: num(pp[1], null, { pct: true }), unit: '%', steps: ['The five numbers cut the data into four parts, each holding about a quarter (25%) of the values.', 'The part ' + pp[0] + ' covers ' + pp[1] / 25 + ' of those quarters: about ' + $(pp[1] + '\\%') + '.'], hint: 'Each of the four sections holds about 25% of the data.', chk: { kind: 'val', v: pp[1] } }; }
    if (shape === 'myth') { var wl = q1 - mn, wr = mx - q3; if (wl === wr) { mx += 3; fv[4] = mx; wr += 3; bz.opts.max = Math.ceil((mx + 1) / 10) * 10; }
      return { q: 'In the box plot, the ' + (wr > wl ? 'right' : 'left') + ' whisker is longer than the ' + (wr > wl ? 'left' : 'right') + ' whisker. True or false: the longer whisker has more data values in it.', a: tf(false), viz: bz, steps: ['Each whisker holds about one quarter of the data, no matter how long it is.', 'A long whisker means those values are spread out over a wider range, not that there are more of them: false.'], hint: 'How much of the data does each whisker hold?', chk: { kind: 'tf', truth: false } }; }
    var cnt = R.pick([7, 9, 11, 8, 10]), data = []; for (var i = 0; i < cnt; i++) data.push(R.int(1, 50)); data.sort(function (a, b) { return a - b; }); var qd = quart(data);
    return { q: 'Find the five-number summary of ' + $(R.shuffle(data).join(',\\ ')) + '.', a: multi([part('Minimum', num(qd.min)), part('Q1', numD(qd.q1)), part('Median', numD(qd.med)), part('Q3', numD(qd.q3)), part('Maximum', num(qd.max))]),
      steps: ['Order the data: ' + $(data.join(',\\ ')) + '.', 'Minimum ' + qd.min + ', maximum ' + qd.max + ', median ' + D(qd.med) + '.', 'Lower half ' + $(qd.lo.join(',\\ ')) + ' has median ' + $(DT(qd.q1)) + ' (Q1). Upper half ' + $(qd.hi.join(',\\ ')) + ' has median ' + $(DT(qd.q3)) + ' (Q3).'], hint: 'Order the data, then find the median, then the medians of each half.', chk: { kind: 'fivedata', data: data } };
  });

  G('g6.mean-absolute-deviation', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['mad', 'mad', 'zero'], ['mad', 'mad', 'cmp', 'zero'], ['mad', 'cmp', 'mad'])), n = l === 1 ? R.int(4, 5) : R.pick([4, 5, 8]), m = R.int(shape === 'cmp' ? 12 : 4, 30);
    var spread = shape === 'cmp' ? 5 : l === 1 ? 6 : 12, d = dataMean(R, n, Math.max(0, m - spread), m + spread, m);
    if (d.every(function (x) { return x === m; })) { d[0] = m - 1; d[1] = m + 1; }
    var dev = d.map(function (x) { return Math.abs(x - m); }), sd = dev.reduce(function (a, b) { return a + b; }, 0), mad = Q(sd, n);
    if (shape === 'zero') return { q: 'The mean of ' + $(d.join(',\\ ')) + ' is ' + m + '. ' + 'If you subtract the mean from each value (keeping the signs) and add the results, what do you get?', a: num(0, 'int'), steps: ['The differences are ' + $(d.map(function (x) { return x - m; }).join(',\\ ')) + '.', 'Their sum is ' + $('0') + ', always: the mean is the balance point, so the amounts above it and below it cancel.', 'That is why the MAD uses distances (absolute values), which are never negative.'], hint: 'Think of the mean as a balance point.', chk: { kind: 'val', v: 0 } };
    var st = ['Find the mean: ' + $('(' + d.join(' + ') + ') \\div ' + n + ' = ' + m) + '.', 'Find each value’s distance from ' + m + ': ' + $(dev.join(',\\ ')) + '.', 'Average the distances: ' + $('(' + dev.join(' + ') + ') \\div ' + n + ' = ' + sd + ' \\div ' + n + ' = ' + DT(mad)) + '.'];
    if (shape === 'mad') return { q: 'Find the mean absolute deviation (MAD) of ' + $(d.join(',\\ ')) + '.', a: numD(mad), steps: st, hint: 'Mean first. Then the distance of each value from the mean. Then the mean of those distances.', chk: { kind: 'mad', data: d } };
    var e = d.map(function (x) { return m + (x - m) * 2; }), eMad = mad.mul(2);
    var firstSpread = R.coin(), A = firstSpread ? e : d, B = firstSpread ? d : e;
    return { q: 'Two classes measured plant heights in cm. Class A: ' + $(A.join(',\\ ')) + '. Class B: ' + $(B.join(',\\ ')) + '. Both have a mean of ' + m + '. Which class’s data has the greater mean absolute deviation?', a: mcKeep(['Class A', 'Class B'], firstSpread ? 0 : 1),
      steps: ['The MAD measures how far the values are from the mean, on average.', 'Class A: MAD = ' + $(DT(firstSpread ? eMad : mad)) + '. Class B: MAD = ' + $(DT(firstSpread ? mad : eMad)) + '.', 'Class ' + (firstSpread ? 'A' : 'B') + '’s values are farther from ' + m + ', so its MAD is greater.'], hint: 'Which set is more spread out from the mean?', chk: { kind: 'madcmp', A: A, B: B, v: firstSpread ? 0 : 1 } };
  });

  G('g6.describe-distributions', function (R, ctx) {
    var l = lv(ctx), shape = R.pick(BY(ctx, ['center', 'shape', 'spread'], ['center', 'shape', 'spread', 'both'], ['center', 'both', 'shape', 'pair']));
    if (shape === 'center' || shape === 'both') {
      var n = R.int(6, 9), base = []; for (var i = 0; i < n - 1; i++) base.push(R.int(20, 35)); var out = R.coin() ? R.int(80, 120) : R.int(0, 2); base.push(out);
      var srt = base.slice().sort(function (a, b) { return a - b; }), mean = sum(base).div(n), med = medianQ(srt), hiOut = out > 50;
      if (mean.eq(med)) { base[n - 1] += 1; out += 1; srt = base.slice().sort(function (a, b) { return a - b; }); mean = sum(base).div(n); med = medianQ(srt); }
      if (shape === 'center') return { q: 'Data: ' + $(R.shuffle(base).join(',\\ ')) + '. One value is far from the rest. Which measure of center better describes a typical value?', a: mcKeep(['the median', 'the mean'], 0),
        steps: ['Mean: ' + $(mean.isTerminating() ? D(mean) : '\\approx ' + mean.toDec(1)) + '. Median: ' + $(DT(med)) + '.', 'The outlier ' + out + ' pulls the mean ' + (hiOut ? 'up' : 'down') + ', away from most of the data. The median hardly moves.', 'So the median describes a typical value better.'],
        hint: 'Which measure is pulled by one extreme value?', chk: { kind: 'center', data: base } };
      return { q: 'Data: ' + $(R.shuffle(base).join(',\\ ')) + '. Which is greater, the mean or the median?', a: mcKeep(['the mean', 'the median'], mean.gt(med) ? 0 : 1),
        steps: ['Median: order the data and take the middle: ' + $(DT(med)) + '.', 'Mean: ' + $(sum(base).toString() + ' \\div ' + n + (mean.isTerminating() ? ' = ' + D(mean) : ' \\approx ' + mean.toDec(1))) + '.', 'The ' + (hiOut ? 'high' : 'low') + ' outlier pulls the mean ' + (hiOut ? 'above' : 'below') + ' the median, so the ' + (mean.gt(med) ? 'mean' : 'median') + ' is greater.'],
        hint: 'Compute both, or think about which way the outlier pulls the mean.', chk: { kind: 'mvm', data: base, v: mean.gt(med) ? 0 : 1 } };
    }
    if (shape === 'shape') {
      var kind = R.pick(['sym', 'right', 'left']), dd = [], counts = kind === 'sym' ? [1, 2, 4, 5, 4, 2, 1] : kind === 'right' ? [3, 6, 5, 3, 2, 1, 1] : [1, 1, 2, 3, 5, 6, 3];
      counts.forEach(function (c, j) { for (var t = 0; t < c; t++) dd.push(j + 1); });
      return { q: 'How would you describe the shape of the data in the dot plot?', a: mcKeep(['roughly symmetric', 'skewed right (a long tail to the right)', 'skewed left (a long tail to the left)'], kind === 'sym' ? 0 : kind === 'right' ? 1 : 2), viz: { name: 'g6-dots', opts: { data: dd, min: 0, max: 8, label: 'Value' }, label: 'A dot plot' },
        steps: ['Look at where the dots pile up and where they trail off.', kind === 'sym' ? 'The pile is in the middle and both sides trail off about the same way: roughly symmetric.' : kind === 'right' ? 'The dots pile up on the left and trail off in a long tail to the right: skewed right.' : 'The dots pile up on the right and trail off in a long tail to the left: skewed left.'],
        hint: 'Which side has the long, thin tail?', chk: { kind: 'mc' } };
    }
    if (shape === 'spread') { var useMed = R.coin();
      return { q: 'A data set is described by its ' + (useMed ? 'median' : 'mean') + '. Which measure of spread goes with it?', a: mcKeep(['the interquartile range (IQR)', 'the mean absolute deviation (MAD)'], useMed ? 0 : 1),
        steps: [useMed ? 'The median and the IQR both come from putting the data in order and finding middles, and neither is pulled much by outliers.' : 'The MAD is built from distances to the mean, so it pairs with the mean.', 'So use the ' + (useMed ? 'IQR' : 'MAD') + '.'], hint: 'Which spread measure is built from the same idea?', chk: { kind: 'mc' } }; }
    var n2 = 7, a = [], b = []; var m = R.int(20, 30); for (var k = 0; k < n2; k++) { a.push(m + R.int(-2, 2)); b.push(m + R.int(-9, 9)); }
    var qa = quart(a.slice().sort(function (x, y) { return x - y; })), qb = quart(b.slice().sort(function (x, y) { return x - y; })), ia = qa.q3.sub(qa.q1), ib = qb.q3.sub(qb.q1);
    if (ia.eq(ib)) { b[0] = m - 12; b[1] = m + 12; b[2] = m - 10; b[3] = m + 10; qb = quart(b.slice().sort(function (x, y) { return x - y; })); ib = qb.q3.sub(qb.q1); }
    return { q: 'Team A’s scores: ' + $(a.join(',\\ ')) + '. Team B’s scores: ' + $(b.join(',\\ ')) + '. Whose scores have the greater interquartile range?', a: mcKeep(['Team A', 'Team B'], ia.gt(ib) ? 0 : 1),
      steps: ['Team A: ' + $('Q_1 = ' + DT(qa.q1) + ',\\ Q_3 = ' + DT(qa.q3)) + ', so IQR = ' + $(DT(ia)) + '.', 'Team B: ' + $('Q_1 = ' + DT(qb.q1) + ',\\ Q_3 = ' + DT(qb.q3)) + ', so IQR = ' + $(DT(ib)) + '.', 'Team ' + (ia.gt(ib) ? 'A' : 'B') + ' has the greater IQR: its middle half is more spread out.'], hint: 'Find Q1 and Q3 for each team.', chk: { kind: 'iqrcmp', A: a, B: b, v: ia.gt(ib) ? 0 : 1 } };
  });
})(window.MathLadder);
