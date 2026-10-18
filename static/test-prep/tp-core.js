/* Test Prep core: window.TestPrep (TP). Pure logic on top of Math Ladder's public API; no DOM. Also loads in Node
   (module.exports) for the tests in /tmp/work_tp/.
   Needs (browser or Node globals): MathLadder with core/gen.js (ML.makeProblem, ML.rand, ML.hasGen), core/tex.js
   (ML.plainToTex) and core/check.js (ML.check, ML.answerShow, ML.answerValue, ML.evalPlain), and the generator files.

   MULTIPLE CHOICE FROM A GENERATOR'S PROBLEM
   TP.toMC(p, R, k)     → a copy of problem p whose answer is { t: 'mc', choices: [k strings with $…$], v, keep: true },
                          or null when no honest set of choices can be made. The right choice is ML.answerShow(p.a); the
                          other k−1 are distractors: values from the worked steps (a learner who stops one step early lands
                          there), then common slips (sign, off by one, doubled or halved, reciprocal, place value, a changed
                          constant or sign inside an expression, swapped coordinates, a flipped inequality). Every distractor
                          is checked with ML.check against the answer with its form rules removed (so 6/8 is never offered
                          beside 3/4) and against every other choice, and must read differently on screen.
                          Problems that already are multiple choice keep their own choices (at most k, the right one always
                          kept). True/false, multi-part, matrix and word answers give null (the caller makes another problem).
                          The original answer stays in p.orig; p.mcFrom names its type.
   TP.verifyMC(p)       → '' when every choice but the right one is unequal to the original answer and to each other,
                          else a description of the problem (used by the tests).
   SETS
   TP.handOK(p)         → false for problems that need a calculator (rounded answers, "use a calculator")
   TP.plan(test, n, R, opts)  → [{ area, topic, level }] n slots, areas by share (largest remainder), topics spread
                          evenly within an area, levels from the area's list; opts.area limits to one area; opts.avail(id)
                          → false skips topics that can't be practiced; opts.order: 'easy-first' sorts each part by level
   TP.makeItem(slot, test, R, opts) → { id, area, level, p, typed } a ready problem in the test's format, or null:
                          typed (the SAT's student-produced response) when opts.typed and the answer is one number;
                          otherwise multiple choice with test.format.choices options; opts.native keeps the generator's own
                          answer format (AP unit practice); opts.seen (set of question texts) avoids repeats.
   TP.build(test, n, seed, opts) → { items, seed } a whole set (typed share from test.format.typed); opts.seen is shared
                          across calls when given (no repeated question text)
   TP.buildSet(test, counts, seed, opts) → { items, parts } a timed set made of the test's parts (test.parts: [{ name,
                          questions, minutes, calculator, typed, grid, choices }]): counts[k] questions from part k (0 skips it).
                          Each part keeps its own rules: no calculator → only problems meant to be done by hand; its share
                          of typed answers; grid → typed answers fit the paper SAT's grid. parts: [{ name, k, n, secs,
                          calculator, grid }] with secs at the part's own pace; items[i].part indexes parts.
   TP.typedFits(v, grid) → can this answer be typed as the test asks? grid (paper SAT): zero or positive, at most four
                          characters; otherwise (digital SAT): at most five characters, six with a minus sign
   RESULTS
   TP.summarize(test, items, answers) → { right, total, byArea: [{ key, title, right, total }], misses: [item],
                          topics: [{ id, n }] (topics of missed questions, most missed first), time: { total, avg } }
   TP.fmtTime(sec)      → "1:05", "12:30", "1:02:03"                                                                   */
(function (root, factory) {
  var TP = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = TP;
  if (root && root.document) root.TestPrep = TP;
})(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  function ML() { return W.MathLadder; }
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function str(x) { return x === null || x === undefined ? '' : String(x); }

  /* ---------------------------------------------------------------- equality, display */
  // the answer without its form rules: we only care whether two values are equal
  function relax(spec) {
    var s = clone(spec); delete s.form; delete s.dp; delete s.from;
    if (s.t === 'num' && spec.dp !== undefined && s.tol === undefined) s.tol = Math.pow(10, -spec.dp) / 2 - 1e-12;
    return s;
  }
  function equalTo(spec, value) {
    var r; try { r = ML().check(relax(spec), value); } catch (e) { return null; }
    if (!r || r.invalid) return null;     // can't be read: not a usable choice
    return !!r.ok;
  }
  function show(spec) { try { return ML().answerShow(spec); } catch (e) { return ''; } }
  function value(spec) { try { return ML().answerValue(spec); } catch (e) { return null; } }
  function texOK(s) { try { ML().plainToTex(s); return true; } catch (e) { return false; } }
  function num(s) { try { var v = ML().evalPlain(str(s)); return typeof v === 'number' && isFinite(v) ? v : NaN; } catch (e) { return NaN; } }

  /* ---------------------------------------------------------------- numbers in the worked steps */
  // numbers a learner meets on the way (steps first): "\frac{3}{4}", "-12", "2.5"; not exponents, not subscripts
  function stepNumbers(p) {
    var out = [], seen = {};
    (p.steps || []).forEach(function (s) {
      var m, src = str(s);
      src.replace(/\\[dt]?frac\{(-?\d+)\}\{(\d+)\}/g, function (all, a, b) { add((src.indexOf('-' + all) >= 0 ? '-' : '') + a + '/' + b); return ' '; });
      var plain = src.replace(/\\[dt]?frac\{[^{}]*\}\{[^{}]*\}/g, ' ').replace(/[\^_]\{?-?\d+\}?/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').replace(/(\d),(\d{3})/g, '$1$2');
      var re = /(^|[^\w.])(−|-)?(\d+(?:\.\d+)?)(?![\w.])/g;
      while ((m = re.exec(plain))) add((m[2] ? '-' : '') + m[3]);
    });
    function add(v) { if (!seen[v]) { seen[v] = 1; out.push(v); } }
    return out;
  }

  /* ---------------------------------------------------------------- slips by answer type */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function fracStr(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; }
  function decStr(x, dp) { var s = x.toFixed(dp); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s; }
  // a negative distractor only when the answer is negative or the question itself has negative numbers
  function negOK(p, x) { return x < 0 || /(^|[^\\a-z])[-−]\s*\d|[-−]\s*\\frac|\$-|negative|below zero|loss|debt/i.test(str(p.q)); }

  function numSlips(spec, p, R) {
    var v = str(spec.v).trim(), x = num(v), out = [], mf, neg = negOK(p, x);
    function push(s) { if (s !== null && s !== undefined && s !== '' && (neg || !(num(s) < 0))) out.push(String(s)); }
    if (!isFinite(x)) { if (/\bi\b|\di\b|\*i\b/.test(v)) exprSlips(v, R).forEach(push); return out; }   // complex numbers: a + bi
    if (spec.dp !== undefined) {
      var u = Math.pow(10, -spec.dp), dp = spec.dp;
      [x + u, x - u, x * 10, x / 10, x + 10 * u, x - 10 * u, -x, x * 2, x / 2].forEach(function (y) { push(decStr(y, dp)); });
      return out;
    }
    if (/^-?\d+$/.test(v)) {
      var n = parseInt(v, 10);
      if (n) push(-n);
      push(n + 1); push(n - 1); push(n * 2); if (n % 2 === 0) push(n / 2); push(n + 2); push(n - 2);
      if (Math.abs(n) >= 10) { push(n + 10); push(n - 10); if (n % 10 === 0) push(n / 10); }
      push(n * 10);
      var ds = String(Math.abs(n)); if (ds.length >= 2) { var rv = ds.split('').reverse().join(''); if (rv[0] !== '0') push((n < 0 ? '-' : '') + rv); }
      if (Math.abs(n) <= 12 && n) push(n * n);
      return out;
    }
    if ((mf = /^(-?)(\d+)\s*\/\s*(\d+)$/.exec(v))) {
      var a = parseInt(mf[2], 10) * (mf[1] ? -1 : 1), b = parseInt(mf[3], 10);
      push(fracStr(b, a)); push(fracStr(-a, b)); push(fracStr(a + 1, b)); push(fracStr(a - 1, b)); push(fracStr(a, b + 1)); push(fracStr(a, b - 1));
      push(fracStr(2 * a, b)); push(fracStr(a, 2 * b)); push(fracStr(a + b, b)); push(fracStr(a, b) === '1' ? '2' : fracStr(b - a, b));
      return out;
    }
    if (/^-?\d*\.\d+$/.test(v)) {
      var d = v.split('.')[1].length, uu = Math.pow(10, -d);
      [-x, x + uu, x - uu, x * 10, x / 10, x + 1, x - 1, x * 2, x / 2].forEach(function (y) { push(decStr(y, Math.min(d + 1, 6)).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')); });
      return out;
    }
    // an exact expression: 2*sqrt(3), 117*pi, pi/6, (1+sqrt(5))/2
    exprSlips(v, R).forEach(push);
    return out;
  }

  // split at top-level + and - (not inside parentheses, not after ^ * / or e): "4+sqrt(5)" -> ['4', '+sqrt(5)']
  function topTerms(s) {
    var out = [], d = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') d--;
      if (!d && (c === '+' || c === '-') && cur.trim() && !/[\^*\/eE(]\s*$/.test(cur)) { out.push(cur); cur = c; continue; }
      cur += c;
    }
    out.push(cur); return out.map(function (t) { return t.trim(); }).filter(Boolean);
  }
  // -s written the way a person would: -(4 + sqrt(5)) -> -4 - sqrt(5); (7 - sqrt(5))/4 -> (-7 + sqrt(5))/4
  function negExpr(s) {
    s = str(s).trim();
    var q = /^\((.*)\)\s*\/\s*([\w.()]+)$/.exec(s);
    if (q && topTerms(q[1]).length > 1 && balanced(q[1])) return '(' + negExpr(q[1]) + ')/' + q[2];
    var T = topTerms(s);
    if (T.length > 1) return T.map(function (t, i) { var u = t[0] === '-' ? '+' + t.slice(1) : t[0] === '+' ? '-' + t.slice(1) : '-' + t; return i === 0 ? u.replace(/^\+/, '') : u; }).join('').replace(/([^+\-])([+\-])/g, '$1 $2 ').replace(/\s+/g, ' ').replace(/([+\-])\s(?=[+\-])/, '$1');
    if (/^-/.test(s)) { var r = s.slice(1).trim(); return /^\(.*\)$/.test(r) && balanced(r.slice(1, -1)) ? r.slice(1, -1) : r; }
    return /^[\w.\/*^()]+$/.test(s) ? '-' + s : '-(' + s + ')';
  }
  function balanced(s) { var d = 0; for (var i = 0; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') { d--; if (d < 0) return false; } } return d === 0; }

  // perturb an expression in plain syntax: each whole number n -> n+1, n-1, 2n; each + <-> -; negate the whole
  function exprSlips(v, R) {
    var out = [], re = /\d+(\.\d+)?/g, m, s = str(v);
    var spots = [];
    while ((m = re.exec(s))) {
      var before = s[m.index - 1], after = s[m.index + m[0].length];
      if (before === '.' || after === '.') continue;
      spots.push({ i: m.index, t: m[0] });
    }
    spots.forEach(function (sp) {
      var n = parseFloat(sp.t), reps = [];
      var isExp = s[sp.i - 1] === '^' || (s[sp.i - 1] === '(' && s[sp.i - 2] === '^');
      if (isExp) reps = [n + 1, n > 2 ? n - 1 : n + 2]; else reps = [n + 1, n > 1 ? n - 1 : n + 2, n * 2];
      reps.forEach(function (r) { if (r > 0 && r !== n) out.push(s.slice(0, sp.i) + r + s.slice(sp.i + sp.t.length)); });
    });
    // trig functions trade places with their partners: sin <-> cos, tan <-> cot, sec <-> csc
    var SW = { sin: 'cos', cos: 'sin', tan: 'cot', cot: 'tan', sec: 'csc', csc: 'sec' }, fre = /\b(sin|cos|tan|cot|sec|csc)\b/g, fm;
    while ((fm = fre.exec(s))) out.push(s.slice(0, fm.index) + SW[fm[1]] + s.slice(fm.index + 3));
    if (/\b(sin|cos|tan|cot|sec|csc)\b.*\b(sin|cos|tan|cot|sec|csc)\b/.test(s)) out.push(s.replace(/\b(sin|cos|tan|cot|sec|csc)\b/g, function (f) { return SW[f]; }));
    for (var i = 1; i < s.length; i++) {
      if ((s[i] === '+' || s[i] === '-') && /[\w)\s]/.test(s[i - 1]) && s[i - 1] !== '^' && s[i - 1] !== 'e') out.push(s.slice(0, i) + (s[i] === '+' ? '-' : '+') + s.slice(i + 1));
    }
    out = R ? R.shuffle(out) : out;
    out.push(negExpr(s));
    return out;
  }

  function eqSlips(v, R) {
    var parts = str(v).split('='); if (parts.length !== 2) return [];
    var L = parts[0], Rh = parts[1];
    var a = exprSlips(Rh.trim(), R).map(function (x) { return L.trim() + ' = ' + x; });
    if (!/^\s*[a-z]\s*$/i.test(L)) a = a.concat(exprSlips(L.trim(), R).map(function (x) { return x + ' = ' + Rh.trim(); }));
    return a;
  }

  function setSlips(spec, p, R) {
    var v = spec.v, out = [];
    if (v === 'all') return [];
    var steps = stepNumbers(p).filter(function (s) { return isFinite(num(s)); });
    if (!v.length) { // "No solution": offer the values a learner might find by mistake
      steps.slice(0, 8).forEach(function (s) { out.push([s]); });
      for (var i = 0; i + 1 < steps.length && i < 6; i++) out.push([steps[i], steps[i + 1]]);
      return out.map(function (x) { return { t: 'set', v: x }; });
    }
    if (v.length >= 2) out.push(v.map(function (x) { return neg(x); }));
    v.forEach(function (x, i) { var w = v.slice(); w[i] = neg(x); out.push(w); });
    v.forEach(function (x, i) { numSlips({ t: 'num', v: x }, { q: p.q + ' -1', steps: [] }, R).slice(0, 4).forEach(function (y) { var w = v.slice(); w[i] = y; out.push(w); }); });
    if (v.length >= 2) v.forEach(function (x, i) { var w = v.slice(); w.splice(i, 1); out.push(w); });
    steps.slice(0, 4).forEach(function (s) { out.push(v.length === 1 ? [s] : v.slice(0, -1).concat([s])); });
    out.push([]);   // "No solution" as a choice
    return out.map(function (x) { return { t: 'set', v: x }; });
    function neg(x) { return negExpr(x); }
  }

  function tupleSlips(spec, p, R) {
    var v = spec.v.map(str), out = [];
    function neg(x) { return negExpr(x); }
    if (v.length === 2) out.push([v[1], v[0]]);
    function z(x) { return num(x) === 0; }
    v.forEach(function (x, i) { if (z(x)) return; var w = v.slice(); w[i] = neg(x); out.push(w); });
    out.push(v.map(function (x) { return z(x) ? x : neg(x); }));
    if (v.length === 2) out.push([z(v[1]) ? v[1] : neg(v[1]), z(v[0]) ? v[0] : neg(v[0])]);
    v.forEach(function (x, i) { numSlips({ t: 'num', v: x }, { q: '-', steps: [] }, R).slice(0, 3).forEach(function (y) { var w = v.slice(); w[i] = y; out.push(w); }); });
    return out.map(function (x) { var s = clone(spec); s.v = x; return s; });
  }

  function intervalSlips(spec) {
    var v = str(spec.v).trim(), m = /^([(\[])\s*([^,]+?)\s*,\s*([^,]+?)\s*([)\]])$/.exec(v); if (!m) return [];
    var lo = m[2], hi = m[3], out = [], inf = /inf/i;
    function b(o, a, c, cl) { return o + a + ', ' + c + cl; }
    function flip(o) { return { '(': '[', '[': '(', ')': ']', ']': ')' }[o]; }
    function neg(x) { return inf.test(x) ? (/^-/.test(x) ? 'inf' : '-inf') : (/^-/.test(x) ? x.slice(1) : '-' + x); }
    if (!inf.test(lo)) out.push(b(flip(m[1]), lo, hi, m[4]));
    if (!inf.test(hi)) out.push(b(m[1], lo, hi, flip(m[4])));
    if (inf.test(lo) && !inf.test(hi)) { out.push('(' + hi + ', inf)'); out.push('[' + hi + ', inf)'); out.push('(-inf, ' + neg(hi) + m[4]); }
    if (inf.test(hi) && !inf.test(lo)) { out.push('(-inf, ' + lo + ')'); out.push('(-inf, ' + lo + ']'); out.push(m[1] + neg(lo) + ', inf)'); }
    if (!inf.test(lo) && !inf.test(hi)) { out.push('(' + lo + ', ' + hi + ')'); out.push('[' + lo + ', ' + hi + ']'); out.push(b(m[1], neg(hi), neg(lo), m[4])); out.push('(-inf, ' + lo + ') U (' + hi + ', inf)'); }
    return out.map(function (x) { var s = clone(spec); s.v = x; return s; });
  }

  function ineqSlips(spec) {
    var v = str(spec.v).trim(), out = [];
    if (/\bor\b/i.test(v) || v === 'all' || v === 'none') {
      if (/\bor\b/i.test(v)) { var ps = v.split(/\s+or\s+/i); if (ps.length === 2) { var m1 = /^([a-z])\s*(<=|>=|<|>)\s*(.+)$/i.exec(ps[0].trim()), m2 = /^([a-z])\s*(<=|>=|<|>)\s*(.+)$/i.exec(ps[1].trim()); if (m1 && m2) { out.push(m1[3].trim() + ' ' + m1[2] + ' ' + m1[1] + ' ' + m2[2] + ' ' + m2[3].trim()); out.push(m1[3].trim() + ' ' + (m1[2] === '<' ? '<=' : m1[2] === '<=' ? '<' : m1[2]) + ' ' + m1[1] + ' ' + m2[2] + ' ' + m2[3].trim()); } } }
      return out.map(function (x) { var s = clone(spec); s.v = x; return s; });
    }
    var F = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }, S = { '<': '<=', '<=': '<', '>': '>=', '>=': '>' };
    var m = /^([a-z])\s*(<=|>=|<|>)\s*(.+)$/i.exec(v);
    if (m) {
      var x = m[1], o = m[2], r = m[3].trim(), nr = /^-/.test(r) ? r.slice(1) : (/^[\w.\/]+$/.test(r) ? '-' + r : '-(' + r + ')');
      out.push(x + ' ' + F[o] + ' ' + r, x + ' ' + S[o] + ' ' + r, x + ' ' + o + ' ' + nr, x + ' ' + F[o] + ' ' + nr);
      numSlips({ t: 'num', v: r }, { q: '-', steps: [] }).slice(0, 3).forEach(function (y) { out.push(x + ' ' + o + ' ' + y); });
    }
    var c = /^(.+?)\s*(<=|<)\s*([a-z])\s*(<=|<)\s*(.+)$/i.exec(v);
    if (c) {
      out.push(c[1] + ' ' + S[c[2]] + ' ' + c[3] + ' ' + c[4] + ' ' + c[5], c[1] + ' ' + c[2] + ' ' + c[3] + ' ' + S[c[4]] + ' ' + c[5]);
      out.push(c[3] + ' < ' + c[1] + ' or ' + c[3] + ' > ' + c[5]);
    }
    return out.map(function (x) { var s = clone(spec); s.v = x; return s; });
  }

  /* ---------------------------------------------------------------- multiple choice */
  var NOTMC = { tf: 1, multi: 1, matrix: 1, text: 1 };
  function candidates(p, R) {
    var a = p.a, list = [];
    function asSpec(v) { var s = clone(a); s.v = v; return s; }
    if (a.t === 'num') {
      var x = num(a.v), qs = str(p.q), prob = /probability|chance/i.test(qs) && x >= 0 && x <= 1;
      var fit = function (s) { var y = num(s); if (!isFinite(y)) return !isFinite(x); return !prob || (y >= 0 && y <= 1); };
      var steps = stepNumbers(p).filter(function (s) {
        var y = num(s); if (!isFinite(y) || !isFinite(x)) return false;
        if (x === 0) return Math.abs(y) <= 20;
        var r = Math.abs(y / x); return r >= 1 / 12 && r <= 12 && (y >= 0 || negOK(p, x));
      });
      if (a.dp !== undefined) steps = steps.map(function (s) { return decStr(num(s), a.dp); });
      if (/pi|sqrt/.test(str(a.v))) steps = []; // a bare decimal beside an exact answer gives the game away
      var counts = [];
      if (/how many (real |distinct |different )?(solutions?|roots?|zeros?|x-intercepts?|times|points? of intersection)|number of (real )?(solutions|roots|zeros|x-intercepts)/i.test(qs) && /^[0-4]$/.test(str(a.v).trim())) {
        counts = R.shuffle([0, 1, 2, 3, 4].filter(function (c) { return c !== +a.v; })).map(String);   // a count: other small counts
      }
      var slips = numSlips(a, p, R).filter(fit), top = R.shuffle(slips.slice(0, 5)), rest = R.shuffle(slips.slice(5, 9)).concat(slips.slice(9));
      list = counts.concat(R.shuffle(steps.filter(fit)).slice(0, 2), top, rest).map(asSpec);
    } else if (a.t === 'expr') list = exprSlips(a.v, R).map(asSpec);
    else if (a.t === 'eq') list = eqSlips(a.v, R).map(asSpec);
    else if (a.t === 'set') list = setSlips(a, p, R);
    else if (a.t === 'tuple') list = tupleSlips(a, p, R);
    else if (a.t === 'interval') list = R.shuffle(intervalSlips(a));
    else if (a.t === 'ineq') list = ineqSlips(a);
    return list;
  }
  function readable(spec) {
    if (spec.t === 'num' || spec.t === 'expr' || spec.t === 'eq') return texOK(str(spec.v).replace(/\s*(<=|>=|<|>)\s*/g, '='));
    if (spec.t === 'set' || spec.t === 'tuple') return (spec.v === 'all' || spec.v.every(function (x) { return texOK(x); }));
    return true;
  }
  function withUnit(text, p, spec) {
    if (!p.unit) return text;
    var u = str(p.unit);
    if (spec && spec.t === 'num' && Math.abs(num(spec.v)) === 1 && /^[a-z ]+$/i.test(u)) u = singular(u);
    return text + (/^\$/.test(u) ? ' ' + u : ' ' + u.replace(/</g, '&lt;'));
  }
  function singular(u) {
    if (/feet$/.test(u)) return u.replace(/feet$/, 'foot');
    if (/(ch|sh|x)es$/.test(u)) return u.slice(0, -2);
    if (/ies$/.test(u)) return u.slice(0, -3) + 'y';
    if (/[^s]s$/.test(u)) return u.slice(0, -1);
    return u;
  }

  function unreduced(t) { // \frac{3}{3}, \frac{2 \pi}{4}, \frac{\sqrt{2}}{1}: a learner would never see these written
    var m, re = /\\[dt]?frac\{((?:[^{}]|\{[^{}]*\})*)\}\{(\d+)\}/g;
    while ((m = re.exec(t))) {
      var N = m[1].trim(), D = +m[2], c = /^(\d+)(?![\d.])/.exec(N);
      if (D === 1) return true;
      if (c && !/[+\-]/.test(N.slice(c[1].length)) && gcd(+c[1], D) > 1) return true;
    }
    return false;
  }
  function toMC(p, R, k) {
    k = k || 4;
    var a = p.a; if (!a || NOTMC[a.t]) return null;
    var q = clone(p); q.orig = a; q.mcFrom = a.t;
    if (a.t === 'mc') {
      if (Array.isArray(a.v)) return null;
      var wrong = a.choices.map(function (c, i) { return i; }).filter(function (i) { return i !== a.v; });
      var keep = R.shuffle(wrong).slice(0, k - 1).concat([a.v]);
      if (!a.keep) keep = R.shuffle(keep); else keep.sort(function (x, y) { return x - y; });
      q.a = { t: 'mc', choices: keep.map(function (i) { return a.choices[i]; }), v: keep.indexOf(a.v), keep: true };
      return q;
    }
    var right = show(a); if (!right) return null;
    var picked = [], texts = [right], vals = [];
    var list = candidates(p, R);
    for (var i = 0; i < list.length && picked.length < k - 1; i++) {
      var c = list[i]; if (!readable(c)) continue;
      var cv = value(c); if (cv === null || cv === undefined) continue;
      if (equalTo(a, cv) !== false) continue;                              // equal to the answer (or unreadable): never offer it
      var t = show(c); if (!t || texts.indexOf(t) >= 0 || unreduced(t)) continue;
      var clash = false;
      for (var j = 0; j < picked.length && !clash; j++) { if (equalTo(picked[j], cv) !== false || equalTo(c, vals[j]) !== false) clash = true; }
      if (clash) continue;
      picked.push(c); texts.push(t); vals.push(cv);
    }
    if (picked.length < k - 1) return null;
    var order = R.shuffle(texts.map(function (t, i) { return i; }));
    q.a = { t: 'mc', choices: order.map(function (i) { return withUnit(texts[i], p, i ? picked[i - 1] : a); }), v: order.indexOf(0), keep: true };
    q.mcSpecs = order.map(function (i) { return i === 0 ? a : picked[i - 1]; });   // for verifyMC
    delete q.unit;
    return q;
  }

  function verifyMC(q) {
    if (!q || !q.a || q.a.t !== 'mc' || !q.mcSpecs) return '';
    var a = q.orig, sp = q.mcSpecs, bad = [];
    sp.forEach(function (s, i) {
      if (i === q.a.v) return;
      if (equalTo(a, value(s)) !== false) bad.push('choice ' + i + ' equals the answer: ' + q.a.choices[i]);
      sp.forEach(function (s2, j) { if (j > i && j !== q.a.v && equalTo(s, value(s2)) !== false) bad.push('choices ' + i + ' and ' + j + ' are equal'); });
    });
    var u = {}; q.a.choices.forEach(function (c) { if (u[c]) bad.push('repeated text ' + c); u[c] = 1; });
    if (q.a.choices[q.a.v] !== withUnit(show(a), q)) { /* right text matches the answer (unit already appended) */ }
    return bad.join('; ');
  }

  /* ---------------------------------------------------------------- sets */
  var CALC = /calculator/i, NOCALC = /(without|not|no|don['’]t need)\s+(a\s+|any\s+)?calculator|\(not a calculator\)/i;
  function decimalsIn(v) { var m = /\.(\d+)/.exec(str(v)); return m ? m[1].length : 0; }
  function handOK(p) {
    if (CALC.test(str(p.q)) && !NOCALC.test(str(p.q))) return false;
    var bad = false;
    (function walk(a) {
      if (!a) return;
      if (a.t === 'multi') { (a.parts || []).forEach(function (x) { walk(x.a); }); return; }
      if (a.t === 'num' && (a.tol !== undefined || a.dp !== undefined || decimalsIn(a.v) > 2)) bad = true;
    })(p.a);
    return !bad;
  }

  function counts(areas, n) { // largest remainder: n questions across areas by share
    var tot = areas.reduce(function (s, a) { return s + (+a.share || 1); }, 0);
    var raw = areas.map(function (a) { return n * (+a.share || 1) / tot; }), c = raw.map(Math.floor), left = n - c.reduce(function (s, x) { return s + x; }, 0);
    var idx = raw.map(function (r, i) { return i; }).sort(function (i, j) { return (raw[j] - c[j]) - (raw[i] - c[i]) || i - j; });
    for (var i = 0; i < left; i++) c[idx[i % idx.length]]++;
    return c;
  }
  function plan(test, n, R, opts) {
    opts = opts || {};
    var areas = (test.areas || []).filter(function (a) { return !opts.area || a.key === opts.area; });
    var avail = opts.avail || function () { return true; };
    areas = areas.map(function (a) { return { a: a, topics: (a.topics || []).filter(avail) }; }).filter(function (x) { return x.topics.length; });
    if (!areas.length) return [];
    var c = counts(areas.map(function (x) { return x.a; }), n), slots = [];
    areas.forEach(function (x, i) {
      var deck = [];
      for (var j = 0; j < c[i]; j++) {
        if (!deck.length) deck = R.shuffle(x.topics);
        var lv = x.a.levels || test.levels || [1, 2, 3];
        slots.push({ area: x.a.key, topic: deck.pop(), level: lv[Math.floor(R.next() * lv.length)] });
      }
    });
    slots = spread(R.shuffle(slots), R);
    if (opts.order === 'easy-first') {
      var parts = Math.max(1, opts.parts || 1), size = Math.ceil(slots.length / parts), out = [];
      for (var p = 0; p < parts; p++) out = out.concat(slots.slice(p * size, (p + 1) * size).sort(function (a, b) { return a.level - b.level; }));
      slots = out;
    }
    return slots;
  }
  function spread(slots, R) { // never the same topic twice in a row when it can be avoided
    for (var i = 1; i < slots.length; i++) {
      if (slots[i].topic !== slots[i - 1].topic) continue;
      for (var j = i + 1; j < slots.length; j++) if (slots[j].topic !== slots[i - 1].topic && (j + 1 >= slots.length || slots[i].topic !== slots[j + 1].topic)) { var t = slots[i]; slots[i] = slots[j]; slots[j] = t; break; }
    }
    return slots;
  }

  // a typed answer like the SAT's student-produced responses: one rational number (no radicals, no pi, not rounded)
  var SPR = /^-?\d+(\.\d+)?(\/\d+)?$/;
  function typedFits(v, grid) {
    v = str(v).trim(); var neg = /^-/.test(v), body = neg ? v.slice(1) : v, max = grid ? 4 : 5;
    if (neg && grid) return false;
    if (/^\d*\.\d+$/.test(body)) body = body.replace(/^0(?=\.)/, '');
    return body.length <= max;
  }
  function sprOK(p, f) { return p.a.t === 'num' && p.a.tol === undefined && p.a.dp === undefined && !p.a.pct && SPR.test(str(p.a.v).trim()) && typedFits(p.a.v, f && f.grid); }
  function makeItem(slot, test, R, opts) {
    opts = opts || {};
    var f = test.format || {}, k = f.choices || 4, seen = opts.seen || {};
    var topics = [slot.topic].concat(R.shuffle(((test.areas || []).filter(function (a) { return a.key === slot.area; })[0] || { topics: [] }).topics.filter(function (t) { return t !== slot.topic && (!opts.avail || opts.avail(t)); })));
    function make(id) {
      var seed = Math.floor(R.next() * 1e9), p;
      try { p = ML().makeProblem(id, seed, { level: slot.level, mode: 'quiz' }); } catch (e) { return null; }
      if (!p || seen[p.q] || (f.hand && !handOK(p))) return null;
      p.seedUsed = seed; return p;
    }
    function item(id, p, out, typed) { seen[p.q] = 1; return { id: id, area: slot.area, level: slot.level, seed: p.seedUsed, p: out, typed: typed }; }
    var ti, t, id, p, out;
    if (opts.typed && !opts.native) {   // look for a one-number answer in this area first
      for (ti = 0; ti < topics.length && ti < 5; ti++) {
        id = topics[ti];
        for (t = 0; t < 8; t++) { p = make(id); if (p && sprOK(p, f)) return item(id, p, p, true); }
      }
    }
    for (ti = 0; ti < topics.length && ti < 4; ti++) {
      id = topics[ti];
      for (t = 0; t < 14; t++) {
        p = make(id); if (!p) continue;
        out = opts.native ? p : toMC(p, R, k);
        if (out && !opts.native && out.a.choices.length < k && t < 10) continue;   // a problem with its own, shorter list of choices: try another first
        if (out) return item(id, p, out, false);
      }
    }
    return null;
  }

  function build(test, n, seed, opts) {
    opts = opts || {};
    var R = ML().rand('tp:' + test.key + ':' + seed), f = test.format || {};
    var slots = plan(test, n, R, { area: opts.area, avail: opts.avail, order: f.easy_first && !opts.area ? 'easy-first' : '', parts: opts.parts || 1 });
    var nTyped = opts.native ? 0 : Math.round(n * (f.typed || 0)), typedIdx = {};
    R.sample(slots.map(function (s, i) { return i; }), Math.min(nTyped, slots.length)).forEach(function (i) { typedIdx[i] = 1; });
    var seen = opts.seen || {}, items = [];
    slots.forEach(function (s, i) {
      var it = makeItem(s, test, R, { typed: !!typedIdx[i], seen: seen, avail: opts.avail, native: opts.native });
      if (it) items.push(it);
    });
    return { items: items, seed: seed };
  }

  // one part of a test as a test of its own: same areas, the part's own rules
  function partTest(test, P, k) {
    var f = test.format || {};
    return { key: test.key + ':' + k, areas: test.areas, levels: test.levels,
      format: { choices: P.choices || f.choices || 4, typed: P.typed !== undefined ? +P.typed : +(f.typed || 0), hand: P.calculator === false || f.hand === true,
        easy_first: !!f.easy_first, grid: !!(P.grid || f.grid) } };
  }
  function buildSet(test, counts, seed, opts) {
    opts = opts || {};
    var f = test.format || {}, parts = test.parts && test.parts.length ? test.parts : [{ name: 'Part 1', questions: f.questions, minutes: f.minutes, calculator: f.calculator !== false && !f.hand }];
    var seen = {}, items = [], out = [];
    (counts || [f.questions]).forEach(function (n, k) {
      var P = parts[k]; if (!n || !P) return;
      var pt = partTest(test, P, k), b = build(pt, n, seed + '.' + k, { avail: opts.avail, seen: seen });
      if (!b.items.length) return;
      b.items.forEach(function (it) { it.part = out.length; items.push(it); });
      out.push({ name: P.name || 'Part ' + (k + 1), k: k, n: b.items.length, secs: Math.round(P.minutes * 60 * b.items.length / P.questions), calculator: !pt.format.hand, grid: pt.format.grid, choices: pt.format.choices });
    });
    return { items: items, parts: out, seed: seed };
  }

  /* ---------------------------------------------------------------- results */
  function summarize(test, items, answers) {
    var byArea = {}, order = [], topics = {}, right = 0, total = 0, tsum = 0, misses = [];
    (test.areas || []).forEach(function (a) { byArea[a.key] = { key: a.key, title: a.title, right: 0, total: 0 }; order.push(a.key); });
    items.forEach(function (it, i) {
      var r = answers[i] || {}, A = byArea[it.area] || (byArea[it.area] = { key: it.area, title: it.area, right: 0, total: 0 });
      if (order.indexOf(it.area) < 0) order.push(it.area);
      A.total++; total++; tsum += r.time || 0;
      if (r.ok) { A.right++; right++; } else { misses.push(i); topics[it.id] = (topics[it.id] || 0) + 1; }
    });
    var tl = Object.keys(topics).map(function (id) { return { id: id, n: topics[id] }; }).sort(function (a, b) { return b.n - a.n; });
    return { right: right, total: total, byArea: order.map(function (k) { return byArea[k]; }).filter(function (a) { return a.total; }), misses: misses, topics: tl, time: { total: tsum, avg: total ? tsum / total : 0 } };
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  return { toMC: toMC, verifyMC: verifyMC, handOK: handOK, plan: plan, counts: counts, makeItem: makeItem, build: build, buildSet: buildSet, typedFits: typedFits,
    summarize: summarize, fmtTime: fmtTime, stepNumbers: stepNumbers, _relax: relax, _equalTo: equalTo };
});
