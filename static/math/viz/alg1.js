/* Math Ladder visuals made for Algebra 1 (course key alg1). Registered on window.MathLadder.viz; styles are injected below.
   Built on the toolkit in static/math/viz/core.js. Every visual follows the light or dark theme, works with mouse, touch
   and keyboard, keeps a live text readout, and never overflows a 360 px screen.

   alg1-numbersets   the real numbers as nested groups; sort numbers into the smallest group they belong to
     opts: items: [{t: "√9", set: "N"|"W"|"Z"|"Q"|"I", why: "√9 = 3, a counting number."}]   numbers to sort (text, not TeX)
           task: "Put each number in the smallest group it belongs to."

   alg1-ineqline     a solution set on the number line: open and closed endpoints, shading, and a test point
     opts: ineq: "x >= -2" | "-1 < x <= 4" | "x < -2 or x > 3" | "x > 1 and x <= 5" | "all" | "none"   the set to draw
           abs: {c: 3, r: 5, rel: "=" | "<" | "<=" | ">" | ">="}   the set |x − c| rel r, drawn with distance arrows from c
           check: "2x - 5 >= -9"   an inequality or equation in x (CAS syntax; "or"/"and" allowed) that the test point is
                                   substituted into, so the readout shows why a number is or is not a solution
           probe: 1                the test point's starting value (null: no test point); snap: 0.5
           build: false            true hides the answer: the learner sets each endpoint open or closed and shades the
                                   stretches of the line (canvas taps or the buttons below it); the task checks it
           min, max                the ends of the line (default: around the endpoints); task: text above the line
           var: "x"                the variable's name in the readout

   alg1-halfplane    the solutions of one linear inequality in x and y: boundary line, shaded side, test point
     opts: ineq: "2x - 3y < 6" | "y >= -x/2 + 1"   (CAS syntax, linear in x and y)
           probe: [0, 0]           a draggable test point (snaps to 0.5); null for none
           pick: false             true: the side is not shaded until the learner taps the side that works (task)
           xmin, xmax, ymin, ymax  (−8 … 8); task: text

   alg1-squarecomplete   completing the square with area: x² + bx as a square and a strip, the strip cut in half and moved,
                         and the missing corner (b/2)² that makes a perfect square
     opts: b: 6               the coefficient of x (a positive number)
           c: null            if given, the equation x² + bx = c is carried along (add (b/2)² to both sides)
           slider: true       a slider for b (2 to 12, step 1)
           step: 0            the stage to start at (0 split, 1 halves moved, 2 corner added); "Next step"/"Back" buttons

   alg1-piecewise    a piecewise function: each rule on its own interval, open and closed endpoints, and a draggable input
     opts: pieces: [{f: "x+2", tex: "x + 2", from: null|-3, to: 1, inFrom: true, inTo: false}]   from/to null = unbounded
           probe: 0            the starting input x (null: none); snap: 0.5
           name: "f"           the function's name in the readout
           xmin, xmax, ymin, ymax (−6 … 6); task: text

   alg1-dots         a plain scatter plot with no statistics shown (for problems that ask the learner to judge the data)
     opts: points: [[x, y], …]   xlabel, ylabel   line: [m, b] (optional line y = m x + b to draw)                         */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/alg1.js: load viz/core.js first'); return; }
  var M = Math, fm = V.fmt;

  // ---------------------------------------------------------------- styles
  if (!D.getElementById('a1v-css')) {
    var css = D.createElement('style'); css.id = 'a1v-css';
    css.textContent = [
      '.a1v .a1v-task{display:flex;gap:.55rem;align-items:flex-start;margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}',
      '.a1v .a1v-tk{flex:0 0 auto;width:1.25rem;height:1.25rem;margin-top:.1rem;border-radius:50%;border:2px solid #b8963e;box-sizing:border-box;position:relative}',
      '.a1v .a1v-task.ok{border-left-color:#00703c}.a1v .a1v-task.ok .a1v-tk{background:#00703c;border-color:#00703c}',
      '.a1v .a1v-task.ok .a1v-tk::after{content:"";position:absolute;left:.33rem;top:.12rem;width:.28rem;height:.55rem;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}',
      'html[data-theme="dark"] .a1v .a1v-task.ok{border-left-color:#6cc79a}html[data-theme="dark"] .a1v .a1v-task.ok .a1v-tk{background:#6cc79a;border-color:#6cc79a}',
      'html[data-theme="dark"] .a1v .a1v-task.ok .a1v-tk::after{border-color:#0f1a14}',
      '.a1v .ml-readout{overflow-wrap:anywhere}.a1v .a1v-yes{color:#00703c;font-weight:700}.a1v .a1v-no{color:#c92a2a;font-weight:700}',
      'html[data-theme="dark"] .a1v .a1v-yes{color:#6cc79a}html[data-theme="dark"] .a1v .a1v-no{color:#ff8787}',
      '.a1v .a1v-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.55rem 0 0;align-items:center}',
      '.a1v .a1v-row .a1v-lab{font-size:.85rem;color:var(--mv-muted);margin-right:.2rem}',
      '.a1v .ml-btn[aria-pressed="true"]{background:rgba(0,112,60,.16);border-color:#00703c}',
      'html[data-theme="dark"] .a1v .ml-btn[aria-pressed="true"]{background:rgba(108,199,154,.22);border-color:#6cc79a}',
      /* number sets */
      '.a1v-ns .a1v-chips{display:flex;flex-wrap:wrap;gap:.4rem;min-height:40px;margin:0 0 .6rem}',
      '.a1v-ns .a1v-chip{font:600 1rem system-ui,sans-serif;min-width:44px;min-height:38px;padding:.3rem .7rem;border-radius:999px;border:1.5px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);cursor:pointer}',
      '.a1v-ns .a1v-chip[aria-pressed="true"]{border-color:#b8963e;box-shadow:0 0 0 3px rgba(184,150,62,.35)}',
      '.a1v-ns .a1v-chip.done{cursor:default;border-style:solid;font-size:.9rem;min-height:30px;min-width:0;padding:.1rem .55rem}',
      '.a1v-ns .a1v-real{border:2px solid #56625b;border-radius:14px;padding:.45rem;display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1.4fr);gap:.45rem;background:var(--mv-card)}',
      '.a1v-ns .a1v-box{border-radius:12px;padding:.35rem .4rem .45rem;border:2px solid;min-width:0;cursor:pointer;position:relative}',
      '.a1v-ns .a1v-box>.a1v-bh{display:block;font:700 .78rem system-ui,sans-serif;letter-spacing:.02em;margin:0 0 .25rem}',
      '.a1v-ns .a1v-in{display:flex;flex-wrap:wrap;gap:.25rem;min-height:30px;margin:0 0 .3rem}',
      '.a1v-ns .b-Q{border-color:#1c6fd6;background:rgba(28,111,214,.07)}.a1v-ns .b-Q>.a1v-bh{color:#1c6fd6}',
      '.a1v-ns .b-Z{border-color:#7048e8;background:rgba(112,72,232,.08)}.a1v-ns .b-Z>.a1v-bh{color:#7048e8}',
      '.a1v-ns .b-W{border-color:#0c8599;background:rgba(12,133,153,.09)}.a1v-ns .b-W>.a1v-bh{color:#0c8599}',
      '.a1v-ns .b-N{border-color:#00703c;background:rgba(0,112,60,.1)}.a1v-ns .b-N>.a1v-bh{color:#00703c}',
      '.a1v-ns .b-I{border-color:#d6336c;background:rgba(214,51,108,.07)}.a1v-ns .b-I>.a1v-bh{color:#d6336c}',
      'html[data-theme="dark"] .a1v-ns .b-Q{border-color:#74c0fc}html[data-theme="dark"] .a1v-ns .b-Q>.a1v-bh{color:#74c0fc}',
      'html[data-theme="dark"] .a1v-ns .b-Z{border-color:#b197fc}html[data-theme="dark"] .a1v-ns .b-Z>.a1v-bh{color:#b197fc}',
      'html[data-theme="dark"] .a1v-ns .b-W{border-color:#66d9e8}html[data-theme="dark"] .a1v-ns .b-W>.a1v-bh{color:#66d9e8}',
      'html[data-theme="dark"] .a1v-ns .b-N{border-color:#6cc79a}html[data-theme="dark"] .a1v-ns .b-N>.a1v-bh{color:#6cc79a}',
      'html[data-theme="dark"] .a1v-ns .b-I{border-color:#f783ac}html[data-theme="dark"] .a1v-ns .b-I>.a1v-bh{color:#f783ac}',
      '.a1v-ns .a1v-realh{grid-column:1/-1;font:700 .8rem system-ui,sans-serif;color:var(--mv-muted)}',
      '.a1v-ns .a1v-box.flash{animation:a1vflash .6s ease 2}',
      '@keyframes a1vflash{50%{box-shadow:0 0 0 4px rgba(201,42,42,.45)}}',
      '@media (prefers-reduced-motion:reduce){.a1v-ns .a1v-box.flash{animation:none;outline:3px solid #c92a2a}}',
      '@media (max-width:520px){.a1v-ns .a1v-real{grid-template-columns:1fr}}'
    ].join('\n');
    (D.head || D.documentElement).appendChild(css);
  }

  // ---------------------------------------------------------------- helpers
  function mk(tag, cls, html) { return V.el(tag, cls, html); }
  function frame(el, o, label, extra) {
    el.classList.add('a1v'); if (extra) el.classList.add(extra); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = mk('p', 'a1v-task', '<span class="a1v-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); typeset(F.task); }
    F.box = mk('div', 'a1v-box0'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    var was = false;
    F.done = function (ok) { if (!F.task) return; ok = !!ok; F.task.classList.toggle('ok', ok); if (ok && !was) F.task.setAttribute('aria-live', 'polite'); was = ok; };
    return F;
  }
  function typeset(n) { if (ML.typeset) try { ML.typeset(n); } catch (e) { } }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function minus(s) { return String(s).replace(/-/g, '−'); }
  function ratio(x) { for (var d = 1; d <= 12; d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9) return [n, d]; } return null; }
  function nice(x) { // number as text: integers, small fractions, else up to 2 decimals
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    var r = ratio(x); if (r) { if (r[1] === 1) return minus(String(r[0])); return (r[0] < 0 ? '−' : '') + M.abs(r[0]) + '/' + r[1]; }
    return fm(x, 2);
  }
  function texNum(x) { var r = ratio(x); if (r && r[1] !== 1) return (r[0] < 0 ? '-' : '') + '\\frac{' + M.abs(r[0]) + '}{' + r[1] + '}'; return r ? String(r[0]) : String(+x.toFixed(2)); }
  function inTex(x) { return Number.isInteger(M.round(x * 100 * 1e6) / 1e6) ? String(+x.toFixed(2)) : texNum(x); }
  function numOf(s) { // "3", "-3/2", "2.5", "inf"
    s = String(s).trim().replace(/−/g, '-');
    if (/^[-+]?(inf|infinity|oo|∞)$/i.test(s)) return s[0] === '-' ? -Infinity : Infinity;
    var m = /^([-+]?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(s); if (m) return +m[1] / +m[2];
    var v = parseFloat(s); return isFinite(v) ? v : NaN;
  }
  function compile(src, vars) {
    var C = W.CAS; if (!C) throw new Error('alg1 visuals need the CAS');
    var t = C.parse(String(src)); var f = C.compile(t, vars);
    return function () { var v = f.apply(null, arguments); return typeof v === 'number' ? v : v && typeof v === 'object' && 're' in v ? (M.abs(v.im) < 1e-12 ? v.re : NaN) : NaN; };
  }
  function pretty(s) { // plain CAS text -> friendlier text
    return String(s).replace(/\*/g, '').replace(/abs\(([^()]*)\)/g, '|$1|').replace(/sqrt\(([^()]*)\)/g, '√($1)').replace(/<=/g, '≤').replace(/>=/g, '≥')
      .replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\s*([+\-=<>≤≥])\s*/g, ' $1 ').replace(/\s+/g, ' ').replace(/^ /, '').replace(/\( /g, '(').replace(/\| -/g, '|−').replace(/-/g, '−').replace(/ ([≤≥<>=]) − /g, ' $1 −').replace(/^− /, '−').replace(/\(− /g, '(−').replace(/\|− /g, '|−').trim();
  }
  var REL = /(<=|>=|<|>|=)/;
  function relTrue(a, op, b) { var e = 1e-9; return op === '<' ? a < b - e : op === '<=' ? a <= b + e : op === '>' ? a > b + e : op === '>=' ? a >= b - e : M.abs(a - b) <= e; }
  var RELSYM = { '<': '<', '<=': '≤', '>': '>', '>=': '≥', '=': '=' };

  // a set of intervals: [{lo, hi, lc, hc}] (lc/hc: endpoint closed); points are {lo: a, hi: a, lc: true, hc: true}
  function parseSet(s, v) {
    s = String(s || '').trim(); v = v || 'x';
    if (/^(all|all real numbers)$/i.test(s)) return [{ lo: -Infinity, hi: Infinity, lc: false, hc: false }];
    if (/^(none|no solution)$/i.test(s)) return [];
    var parts = s.split(/\s+or\s+/i), out = [];
    parts.forEach(function (p) {
      var ands = p.split(/\s+and\s+/i).map(function (q) { return one(q.trim()); });
      var cur = ands[0]; for (var i = 1; i < ands.length; i++) cur = inter(cur, ands[i]);
      if (cur) out.push(cur);
    });
    return out;
    function one(q) {
      var tk = q.split(REL).map(function (x) { return x.trim(); });
      if (tk.length === 5) { var a = numOf(tk[0]), b = numOf(tk[4]); if (tk[1][0] === '<') return { lo: a, hi: b, lc: tk[1] === '<=', hc: tk[3] === '<=' }; return { lo: b, hi: a, lc: tk[3] === '>=', hc: tk[1] === '>=' }; }
      var L = tk[0], op = tk[1], R = tk[2];
      if (L !== v) { var t = L; L = R; R = t; op = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=' }[op]; }
      var c = numOf(R);
      if (op === '=') return { lo: c, hi: c, lc: true, hc: true };
      if (op[0] === '<') return { lo: -Infinity, hi: c, lc: false, hc: op === '<=' };
      return { lo: c, hi: Infinity, lc: op === '>=', hc: false };
    }
    function inter(A, B) {
      if (!A || !B) return null;
      var lo = M.max(A.lo, B.lo), hi = M.min(A.hi, B.hi);
      var lc = A.lo === B.lo ? A.lc && B.lc : (A.lo > B.lo ? A.lc : B.lc), hc = A.hi === B.hi ? A.hc && B.hc : (A.hi < B.hi ? A.hc : B.hc);
      if (lo > hi || (lo === hi && !(lc && hc))) return null;
      return { lo: lo, hi: hi, lc: lc, hc: hc };
    }
  }
  function inSet(S, x) { return S.some(function (I) { return (x > I.lo || (I.lc && M.abs(x - I.lo) < 1e-9)) && (x < I.hi || (I.hc && M.abs(x - I.hi) < 1e-9)); }); }
  function setFromAbs(a) {
    var c = numOf(a.c), r = numOf(a.r), op = a.rel || '=';
    if (r < 0) return op === '>' || op === '>=' ? [{ lo: -Infinity, hi: Infinity, lc: false, hc: false }] : [];
    if (op === '=') return r === 0 ? [{ lo: c, hi: c, lc: true, hc: true }] : [{ lo: c - r, hi: c - r, lc: true, hc: true }, { lo: c + r, hi: c + r, lc: true, hc: true }];
    if (op[0] === '<') return r === 0 && op === '<' ? [] : [{ lo: c - r, hi: c + r, lc: op === '<=', hc: op === '<=' }];
    return [{ lo: -Infinity, hi: c - r, lc: false, hc: op === '>=' }, { lo: c + r, hi: Infinity, lc: op === '>=', hc: false }];
  }
  // a checker for "2x - 5 >= -9", "-3 <= 2x+1 < 7", "x + 3 < 1 or 2x - 1 > 9"
  function makeCheck(src, v) {
    var join = /\s+or\s+/i.test(src) ? 'or' : 'and', parts = src.split(/\s+(?:or|and)\s+/i);
    var P = parts.map(function (p) {
      var tk = p.split(REL).map(function (x) { return x.trim(); }), ex = [], ops = [];
      tk.forEach(function (t, i) { if (i % 2) ops.push(t); else ex.push({ s: t, f: compile(t, [v]), hasV: new RegExp('(^|[^a-z])' + v + '([^a-z]|$)').test(t) }); });
      return { ex: ex, ops: ops };
    });
    return function (x) {
      var ok = [], txt = [];
      P.forEach(function (p) {
        var vals = p.ex.map(function (e) { return e.f(x); }), good = true, chain = nice(vals[0]);
        p.ops.forEach(function (op, i) { good = good && relTrue(vals[i], op, vals[i + 1]); chain += ' ' + RELSYM[op] + ' ' + nice(vals[i + 1]); });
        var subs = p.ex.filter(function (e) { return e.hasV && e.s !== v; }).map(function (e, i) { return pretty(e.s) + ' = ' + nice(e.f(x)); });
        txt.push((subs.length ? subs.join(', ') + ', and ' : '') + chain + ' is ' + (good ? 'true' : 'false'));
        ok.push(good);
      });
      var all = join === 'or' ? ok.some(Boolean) : ok.every(Boolean);
      return { ok: all, text: txt.join(join === 'or' ? '; or ' : '; and ') };
    };
  }

  // ================================================================ alg1-numbersets
  var SETNAME = { N: 'Natural numbers', W: 'Whole numbers', Z: 'Integers', Q: 'Rational numbers', I: 'Irrational numbers' };
  V.register('alg1-numbersets', function (el, o) {
    var items = (o.items && o.items.length ? o.items : [{ t: '5', set: 'N', why: '5 is a counting number.' }, { t: '−2', set: 'Z', why: '−2 is an integer.' }, { t: '1/2', set: 'Q', why: '1/2 is a fraction of integers.' }, { t: '√2', set: 'I', why: '√2 never ends or repeats.' }]).map(function (it, i) { return { t: it.t, set: it.set, why: it.why || '', i: i, done: false }; });
    var F = frame(el, o, 'Sort numbers into the groups of the real numbers', 'a1v-ns');
    var tray = mk('div', 'a1v-chips'); tray.setAttribute('aria-label', 'Numbers to sort'); F.box.appendChild(tray);
    var real = mk('div', 'a1v-real'); F.box.appendChild(real);
    real.appendChild(mk('span', 'a1v-realh', 'Real numbers'));
    var boxes = {};
    function box(key, parent) { var b = mk('div', 'a1v-box b-' + key); b.appendChild(mk('span', 'a1v-bh', SETNAME[key])); var inn = mk('div', 'a1v-in'); b.appendChild(inn); parent.appendChild(b); boxes[key] = { el: b, inn: inn }; b.addEventListener('click', function (e) { e.stopPropagation(); place(key); }); return b; }
    var bq = box('Q', real), bz = box('Z', bq), bw = box('W', bz); box('N', bw); box('I', real);
    var sel = null, chips = [];
    items.forEach(function (it) {
      var c = mk('button', 'a1v-chip', it.t); c.type = 'button'; c.setAttribute('aria-pressed', 'false'); c.setAttribute('aria-label', 'Number ' + it.t);
      c.addEventListener('click', function () { if (it.done) return; sel = sel === it ? null : it; chips.forEach(function (x, j) { x.setAttribute('aria-pressed', String(sel === items[j])); }); say(); });
      chips.push(c); tray.appendChild(c);
    });
    var row = mk('div', 'a1v-row'); row.appendChild(mk('span', 'a1v-lab', 'Put it in:')); el.insertBefore(row, F.out.el);
    ['N', 'W', 'Z', 'Q', 'I'].forEach(function (k) { V.button(row, SETNAME[k].replace(' numbers', ''), function () { place(k); }); });
    function say(msg) {
      var left = items.filter(function (it) { return !it.done; }).length;
      F.out.set(msg || (sel ? 'Now tap the smallest group that <b>' + sel.t + '</b> belongs to.' : left ? 'Tap a number, then tap the smallest group it belongs to. ' + left + ' left.' : 'All sorted. Each number also belongs to every group around its box.'));
    }
    function place(k) {
      if (!sel) { say('Pick a number first.'); return; }
      var it = sel;
      if (k === it.set) {
        it.done = true; sel = null; var c = chips[it.i]; c.classList.add('done'); c.setAttribute('aria-pressed', 'false'); c.disabled = true; boxes[k].inn.appendChild(c);
        var left = items.filter(function (x) { return !x.done; }).length;
        say('<span class="a1v-yes">Yes.</span> ' + it.why + (left ? ' ' + left + ' left.' : ' All sorted!'));
        F.done(!left);
      } else {
        var b = boxes[k].el; b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
        var inside = { N: ['N', 'W', 'Z', 'Q'], W: ['W', 'Z', 'Q'], Z: ['Z', 'Q'], Q: ['Q'], I: ['I'] }[it.set];
        say(inside.indexOf(k) >= 0 ? '<b>' + it.t + '</b> is in that group, but there is a smaller one that fits. ' + 'Look inside.' : '<span class="a1v-no">Not quite.</span> <b>' + it.t + '</b> does not belong to the ' + SETNAME[k].toLowerCase() + '. Simplify it, then ask: is it a fraction of integers?');
      }
    }
    say();
    return {};
  });

  // ================================================================ alg1-ineqline
  V.register('alg1-ineqline', function (el, o) {
    var v = o.var || 'x', S, absO = o.abs || null;
    S = absO ? setFromAbs(absO) : parseSet(o.ineq || 'x > 0', v);
    var ends = []; S.forEach(function (I) { [I.lo, I.hi].forEach(function (e) { if (isFinite(e) && ends.indexOf(e) < 0) ends.push(e); }); }); ends.sort(function (a, b) { return a - b; });
    if (absO) { var cc = numOf(absO.c); if (ends.indexOf(cc) < 0) { /* center is drawn separately */ } }
    var lo = o.min != null ? numOf(o.min) : M.floor(M.min.apply(null, ends.concat(absO ? [numOf(absO.c)] : [0])) - 3);
    var hi = o.max != null ? numOf(o.max) : M.ceil(M.max.apply(null, ends.concat(absO ? [numOf(absO.c)] : [0])) + 3);
    if (hi - lo < 6) { lo -= 2; hi += 2; }
    var chk = o.check ? makeCheck(o.check, v) : null, snap = o.snap || 0.5;
    var probe = o.probe === null || o.probe === undefined ? (o.build ? null : (chk ? clamp(ends.length ? ends[0] + 1 : 0, lo, hi) : null)) : numOf(o.probe);
    var F = frame(el, o, 'A number line showing a solution set');
    var c = V.canvas(F.box, { height: absO ? 150 : 118 }); c.cv.tabIndex = 0;
    // build mode state: endpoints closed? regions shaded?
    var build = !!o.build, bEnd = ends.map(function () { return false; }), bReg = [], regions = [];
    for (var i = 0; i <= ends.length; i++) regions.push({ a: i ? ends[i - 1] : -Infinity, b: i < ends.length ? ends[i] : Infinity });
    regions.forEach(function () { bReg.push(false); });
    var showAns = !build;
    function X(x) { return 22 + (x - lo) / (hi - lo) * (c.w - 44); }
    function Xi(px) { return lo + (px - 22) / (c.w - 44) * (hi - lo); }
    var baseY = function () { return absO ? 92 : 62; };
    function draw() {
      var k = V.colors(), ctx = c.ctx, y = baseY();
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      // axis
      ctx.strokeStyle = k.axis; ctx.fillStyle = k.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(c.w - 8, y); ctx.stroke();
      [[8, -1], [c.w - 8, 1]].forEach(function (a) { ctx.beginPath(); ctx.moveTo(a[0], y); ctx.lineTo(a[0] - a[1] * 9, y - 5); ctx.lineTo(a[0] - a[1] * 9, y + 5); ctx.closePath(); ctx.fill(); });
      var ppu = (c.w - 44) / (hi - lo), labEvery = ppu >= 26 ? 1 : ppu >= 13 ? 2 : 5;
      ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (var t = M.ceil(lo); t <= hi; t++) {
        var px = X(t), big = t % labEvery === 0 || ends.indexOf(t) >= 0;
        if (big && ends.indexOf(t) < 0 && ends.some(function (e2) { return M.abs(X(e2) - px) < 20; })) big = false;
        ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, y - (big ? 7 : 4)); ctx.lineTo(px, y + (big ? 7 : 4)); ctx.stroke();
        if (big) { ctx.fillStyle = k.muted; ctx.fillText(minus(t), px, y + 11); }
      }
      // endpoints that are not whole numbers get their own label
      ends.forEach(function (e) { if (e !== M.round(e)) { ctx.fillStyle = k.ink; ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText(nice(e), X(e), y + 11); } });
      // abs: center and distance arrows
      if (absO) {
        var cx = numOf(absO.c), r = numOf(absO.r);
        ctx.fillStyle = k.blue; ctx.beginPath(); ctx.arc(X(cx), y, 4, 0, 2 * M.PI); ctx.fill();
        ctx.font = '600 12px system-ui,sans-serif'; ctx.textBaseline = 'top'; ctx.fillText('center', X(cx), y + 27);
        if (r > 0) [-1, 1].forEach(function (sg) {
          var x1 = X(cx), x2 = X(cx + sg * r), top = y - 28;
          ctx.strokeStyle = k.blue; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(x1, y - 10); ctx.quadraticCurveTo((x1 + x2) / 2, top - 14, x2, y - 10); ctx.stroke();
          ctx.fillStyle = k.blue; ctx.beginPath(); ctx.moveTo(x2, y - 8); ctx.lineTo(x2 - sg * 4 - 4, y - 16); ctx.lineTo(x2 - sg * 4 + 4, y - 16); ctx.closePath(); ctx.fill();
          ctx.fillStyle = k.blue; ctx.textBaseline = 'bottom'; ctx.fillText(nice(r) + (r === 1 ? ' unit' : ' units'), (x1 + x2) / 2, top - 6);
        });
      }
      // the set (answer) or the learner's build
      var col = k.green, soft = k.greenSoft;
      function seg(a, b) {
        var xa = isFinite(a) ? X(a) : 10, xb = isFinite(b) ? X(b) : c.w - 10;
        ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
        ctx.fillStyle = col;
        if (!isFinite(a)) { ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(16, y - 8); ctx.lineTo(16, y + 8); ctx.closePath(); ctx.fill(); }
        if (!isFinite(b)) { ctx.beginPath(); ctx.moveTo(c.w - 4, y); ctx.lineTo(c.w - 16, y - 8); ctx.lineTo(c.w - 16, y + 8); ctx.closePath(); ctx.fill(); }
      }
      function dot(x, closed, color) { ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.fillStyle = closed ? color : k.bg; ctx.beginPath(); ctx.arc(X(x), y, 7, 0, 2 * M.PI); ctx.fill(); ctx.stroke(); }
      if (showAns) {
        S.forEach(function (I) { if (I.lo !== I.hi) seg(I.lo, I.hi); });
        S.forEach(function (I) { if (isFinite(I.lo)) dot(I.lo, I.lc, col); if (isFinite(I.hi) && I.hi !== I.lo) dot(I.hi, I.hc, col); });
      } else {
        regions.forEach(function (R, j) { if (bReg[j]) seg(R.a, R.b); });
        ends.forEach(function (e, j) { dot(e, bEnd[j], k.purple); });
      }
      // probe
      if (probe !== null) {
        var pxp = X(probe), inS = chk ? chk(probe).ok : inSet(S, probe);
        ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(pxp, y - 8); ctx.lineTo(pxp, y - (absO ? 70 : 34)); ctx.stroke(); ctx.setLineDash([]);
        var py = y - (absO ? 70 : 34);
        ctx.fillStyle = k.bg; ctx.strokeStyle = k.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pxp, py, 8, 0, 2 * M.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(pxp, py, 3.4, 0, 2 * M.PI); ctx.fill();
        ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = pxp > c.w - 60 ? 'right' : pxp < 60 ? 'left' : 'center'; ctx.textBaseline = 'bottom';
        ctx.fillStyle = inS ? k.green : k.red; ctx.fillText(v + ' = ' + nice(probe) + (inS ? ' ✓' : ' ✗'), pxp + (ctx.textAlign === 'right' ? 8 : ctx.textAlign === 'left' ? -8 : 0), py - 11);
        if (focus) { ctx.strokeStyle = k.gold; ctx.setLineDash([4, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pxp, py, 14, 0, 2 * M.PI); ctx.stroke(); ctx.setLineDash([]); }
      }
      readout();
    }
    function setText(I) {
      var a = I.lo, b = I.hi;
      if (a === b) return v + ' = ' + nice(a);
      if (!isFinite(a) && !isFinite(b)) return 'every real number';
      if (!isFinite(a)) return v + ' ' + (I.hc ? '≤' : '<') + ' ' + nice(b);
      if (!isFinite(b)) return v + ' ' + (I.lc ? '≥' : '>') + ' ' + nice(a);
      return nice(a) + ' ' + (I.lc ? '≤' : '<') + ' ' + v + ' ' + (I.hc ? '≤' : '<') + ' ' + nice(b);
    }
    function readout() {
      var s = '';
      var pts = S.length && S.every(function (I) { return I.lo === I.hi; });
      if (showAns) s = (pts ? 'Solutions: <b>' : 'Shaded: <b>') + (S.length ? S.map(setText).join(' or ') : 'no numbers (no solution)') + '</b>.' + (pts || !S.length ? '' : ' A filled dot is included; an open dot is not.');
      else s = 'Tap each endpoint to make it open (not included) or closed (included), and tap each stretch of the line to shade it.';
      if (probe !== null) {
        var r = chk ? chk(probe) : { ok: inSet(S, probe), text: '' };
        s += '<br>Test ' + v + ' = <b>' + nice(probe) + '</b>: ' + (r.text ? r.text + '. ' : '') + (r.ok ? '<span class="a1v-yes">It is a solution.</span>' : '<span class="a1v-no">It is not a solution.</span>');
      }
      F.out.set(s);
    }
    // build controls
    var bBtns = [], rBtns = [];
    if (build) {
      var row = mk('div', 'a1v-row'); el.insertBefore(row, F.out.el);
      ends.forEach(function (e, j) { var b = V.button(row, 'Dot at ' + nice(e) + ': open', function () { bEnd[j] = !bEnd[j]; sync(); }); bBtns.push(b); });
      var row2 = mk('div', 'a1v-row'); el.insertBefore(row2, F.out.el);
      regions.forEach(function (R, j) { var txt = !isFinite(R.a) ? 'Shade left of ' + nice(R.b) : !isFinite(R.b) ? 'Shade right of ' + nice(R.a) : 'Shade ' + nice(R.a) + ' to ' + nice(R.b); var b = V.button(row2, txt, function () { bReg[j] = !bReg[j]; sync(); }); b.setAttribute('aria-pressed', 'false'); rBtns.push(b); });
      var row3 = mk('div', 'a1v-row'); el.insertBefore(row3, F.out.el);
      V.button(row3, 'Show the answer', function () { showAns = !showAns; this.textContent = showAns ? 'Hide the answer' : 'Show the answer'; draw(); });
    }
    function sync() {
      bBtns.forEach(function (b, j) { b.textContent = 'Dot at ' + nice(ends[j]) + ': ' + (bEnd[j] ? 'closed' : 'open'); b.setAttribute('aria-pressed', String(bEnd[j])); });
      rBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(bReg[j])); });
      // matches the answer?
      var ok = regions.every(function (R, j) { var mid = !isFinite(R.a) ? R.b - 1 : !isFinite(R.b) ? R.a + 1 : (R.a + R.b) / 2; return bReg[j] === inSet(S, mid); }) && ends.every(function (e, j) { return bEnd[j] === inSet(S, e); });
      F.done(ok);
      draw();
      if (ok) F.out.set('<span class="a1v-yes">That matches the solution set.</span> ' + (S.length ? S.map(setText).join(' or ') : ''));
    }
    // dragging and taps
    var focus = false, dragging = false;
    V.drag(c.cv, {
      hit: function (px, py) {
        if (probe !== null && M.abs(px - X(probe)) < 22 && py < baseY() + 4) return 'p';
        if (build) return 'b';
        return null;
      },
      start: function (h, px, py) {
        if (h === 'b') { // tap an endpoint or a region
          var near = -1, bd = 16; ends.forEach(function (e, j) { var d = M.abs(X(e) - px); if (d < bd) { bd = d; near = j; } });
          if (near >= 0 && M.abs(py - baseY()) < 24) bEnd[near] = !bEnd[near];
          else { var xv = Xi(px); regions.forEach(function (R, j) { if (xv > R.a && xv < R.b) bReg[j] = !bReg[j]; }); }
          sync();
        } else dragging = true;
      },
      move: function (h, px) { if (h !== 'p') return; probe = clamp(M.round(Xi(px) / snap) * snap, lo, hi); draw(); },
      end: function () { dragging = false; }
    });
    c.cv.style.touchAction = probe !== null ? 'none' : 'pan-y';
    c.cv.setAttribute('aria-label', probe !== null ? 'Number line. Left and right arrow keys move the test point.' : 'Number line');
    c.cv.addEventListener('focus', function () { focus = true; draw(); });
    c.cv.addEventListener('blur', function () { focus = false; draw(); });
    c.cv.addEventListener('keydown', function (e) {
      if (probe === null) return; var d = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!d) return;
      probe = clamp(probe + d * snap * (e.shiftKey ? 4 : 1), lo, hi); draw(); e.preventDefault();
    });
    c.onResize(draw); V.onTheme(draw);
    if (build) sync(); else draw();
    return { draw: draw };
  });

  // ================================================================ alg1-halfplane
  V.register('alg1-halfplane', function (el, o) {
    var src = String(o.ineq || 'y < 2x + 1'), m = src.split(REL);
    var lhs = m[0].trim(), op = m[1], rhs = m[2].trim();
    var g = compile('(' + lhs + ')-(' + rhs + ')', ['x', 'y']), gl = compile(lhs, ['x', 'y']), gr = compile(rhs, ['x', 'y']);
    var g0 = g(0, 0), A = g(1, 0) - g0, B = g(0, 1) - g0, C0 = g0; // A x + B y + C0 (op) 0
    var strict = op === '<' || op === '>';
    var F = frame(el, o, 'The solutions of a linear inequality as a shaded half-plane');
    var c = V.canvas(F.box, { aspect: 1.25, max: 460 });
    var P = V.plane(c, { xmin: o.xmin != null ? +o.xmin : -8, xmax: o.xmax != null ? +o.xmax : 8, ymin: o.ymin != null ? +o.ymin : -8, ymax: o.ymax != null ? +o.ymax : 8, equal: true });
    var pr = o.probe === null ? null : (o.probe || [0, 0]).slice(), pick = !!o.pick, picked = null, focus = false;
    function sat(x, y) { return relTrue(g(x, y), op, 0); }
    function clipPoly() { // the view rectangle cut by the half-plane where the inequality holds (boundary included)
      var vw = P.view(), poly = [[vw.xmin, vw.ymin], [vw.xmax, vw.ymin], [vw.xmax, vw.ymax], [vw.xmin, vw.ymax]], outp = [];
      var s = function (p) { var val = A * p[0] + B * p[1] + C0; return op[0] === '<' ? -val : val; }; // >= 0 inside
      for (var i = 0; i < poly.length; i++) {
        var p = poly[i], q2 = poly[(i + 1) % poly.length], sp = s(p), sq = s(q2);
        if (sp >= 0) outp.push(p);
        if ((sp >= 0) !== (sq >= 0)) { var t = sp / (sp - sq); outp.push([p[0] + t * (q2[0] - p[0]), p[1] + t * (q2[1] - p[1])]); }
      }
      return outp;
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, vw = P.view();
      P.clear(); P.grid(); P.axes();
      if (!pick || picked !== null) { var poly = clipPoly(); if (poly.length > 2) P.poly(poly, { fill: k.greenSoft, stroke: false }); }
      var dash = strict ? [9, 7] : null;
      if (M.abs(B) < 1e-12) P.seg(-C0 / A, vw.ymin, -C0 / A, vw.ymax, { color: 'blue', width: 3, dash: dash });
      else P.plot(function (x) { return -(A * x + C0) / B; }, { color: 'blue', width: 3, dash: dash });
      if (pr) {
        var ok = sat(pr[0], pr[1]), px = P.X(pr[0]), py = P.Y(pr[1]);
        ctx.fillStyle = k.bg; ctx.strokeStyle = k.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 8, 0, 2 * M.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle = ok ? k.green : k.red; ctx.beginPath(); ctx.arc(px, py, 3.6, 0, 2 * M.PI); ctx.fill();
        if (focus) { ctx.strokeStyle = k.gold; ctx.setLineDash([4, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 14, 0, 2 * M.PI); ctx.stroke(); ctx.setLineDash([]); }
      }
      var s = 'Boundary: <b>' + pretty(lhs) + ' = ' + pretty(rhs) + '</b>, drawn ' + (strict ? '<b>dashed</b> because points on it are not solutions (' + RELSYM[op] + ').' : '<b>solid</b> because points on it are solutions (' + RELSYM[op] + ').');
      if (pr) {
        var L = gl(pr[0], pr[1]), Rv = gr(pr[0], pr[1]), okp = relTrue(L, op, Rv);
        var parts = []; if (!/^[xy]$/.test(lhs)) parts.push(sub(lhs, pr) + ' = ' + nice(L)); if (/[xy]/.test(rhs) && !/^[xy]$/.test(rhs)) parts.push(sub(rhs, pr) + ' = ' + nice(Rv));
        s += '<br>Test (' + nice(pr[0]) + ', ' + nice(pr[1]) + '): ' + (parts.length ? parts.join(', ') + ', and ' : '') + nice(L) + ' ' + RELSYM[op] + ' ' + nice(Rv) + ' is ' + (okp ? '<span class="a1v-yes">true</span>, so this point is a solution' : '<span class="a1v-no">false</span>, so this point is not a solution') + '.';
      }
      if (pick && picked === null) s += '<br>Tap the side of the line where the inequality is true.';
      else if (pick) s += '<br>' + (picked ? '<span class="a1v-yes">Yes, that side works.</span> Every point in the green region is a solution.' : '<span class="a1v-no">That side does not work.</span> The green region shows the side that does.');
      F.out.set(s);
    }
    function sub(expr, p) { return pretty(expr).replace(/x/g, '(' + nice(p[0]) + ')').replace(/y/g, '(' + nice(p[1]) + ')'); }
    V.drag(c.cv, {
      hit: function (px, py) { if (pr && M.hypot(P.X(pr[0]) - px, P.Y(pr[1]) - py) < 24) return 'p'; if (pick && picked === null) return 't'; return null; },
      start: function (h, px, py) { if (h === 't') { picked = sat(P.x(px), P.y(py)); F.done(picked); draw(); } },
      move: function (h, px, py) { if (h !== 'p') return; var vw = P.view(); pr = [M.round(clamp(P.x(px), vw.xmin, vw.xmax) * 2) / 2, M.round(clamp(P.y(py), vw.ymin, vw.ymax) * 2) / 2]; draw(); }
    });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Coordinate plane with a boundary line. Arrow keys move the test point.' + (pick ? ' Press S to shade the side with the test point.' : ''));
    c.cv.addEventListener('focus', function () { focus = true; draw(); }); c.cv.addEventListener('blur', function () { focus = false; draw(); });
    c.cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[e.key];
      if (d && pr) { pr = [pr[0] + d[0] * (e.shiftKey ? 4 : 1), pr[1] + d[1] * (e.shiftKey ? 4 : 1)]; draw(); e.preventDefault(); }
      else if ((e.key === 's' || e.key === 'S') && pick && pr && picked === null) { picked = sat(pr[0], pr[1]); F.done(picked); draw(); }
    });
    if (pick) { var row = mk('div', 'a1v-row'); el.insertBefore(row, F.out.el); V.button(row, 'Shade the side with the test point', function () { if (!pr) return; picked = sat(pr[0], pr[1]); F.done(picked); draw(); }); V.button(row, 'Start over', function () { picked = null; F.done(false); draw(); }); }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ================================================================ alg1-squarecomplete
  V.register('alg1-squarecomplete', function (el, o) {
    var b = o.b != null ? +o.b : 6, cst = o.c != null ? +o.c : null, stage = clamp(o.step | 0, 0, 2), anim = 1, from = stage, raf = 0;
    var F = frame(el, o, 'Completing the square with an area model');
    var c = V.canvas(F.box, { aspect: 1.45, max: 340, min: 230 });
    var row = mk('div', 'a1v-row'); el.insertBefore(row, F.out.el);
    var back = V.button(row, 'Back', function () { go(stage - 1); }), next = V.button(row, 'Next step', function () { go(stage + 1); }, 'pri');
    var sl = o.slider === false ? null : V.slider(F.ctl, { label: 'b, the coefficient of x', min: 1, max: 12, step: 1, value: b, input: function (val) { b = val; draw(); } });
    function go(s) {
      s = clamp(s, 0, 2); if (s === stage) return; from = stage; stage = s; anim = 0;
      if (V.reduced) { anim = 1; draw(); return; }
      var t0 = 0; cancelAnimationFrame(raf);
      var step = function (t) { if (!t0) t0 = t; anim = M.min(1, (t - t0) / 650); draw(); if (anim < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - M.pow(-2 * t + 2, 2) / 2; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, h = b / 2;
      back.disabled = stage === 0; next.disabled = stage === 2;
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var X = 5; // the drawn length of x, in units
      var unit = M.min((c.w - 60) / (X + b), (c.h - 44) / (X + h));
      var ox = M.max(40, (c.w - (X + b) * unit) / 2 + 10), oy = M.max(28, (c.h - (X + h) * unit) / 2 + 8);
      var e = ease(anim), s0 = from, s1 = stage;
      var split = function (st) { return st >= 1 ? 1 : 0; }, tSplit = split(s0) + (split(s1) - split(s0)) * e;
      var corner = function (st) { return st >= 2 ? 1 : 0; }, tCorner = corner(s0) + (corner(s1) - corner(s0)) * e;
      function rect(x, y, w, hh, fill, stroke, label, dash) {
        var px = ox + x * unit, py = oy + y * unit, pw = w * unit, ph = hh * unit;
        ctx.fillStyle = fill; ctx.fillRect(px, py, pw, ph); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2); ctx.setLineDash([]);
        if (label && pw > 22 && ph > 16) { ctx.fillStyle = k.ink; ctx.font = '700 ' + M.max(12, M.min(20, M.min(pw, ph) / 3)) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, px + pw / 2, py + ph / 2); }
      }
      var hs = nice(h), t = tSplit;
      rect(0, 0, X, X, k.blueSoft, k.blue, 'x²');
      if (t < 0.02) {
        rect(X, 0, b, X, k.greenSoft, k.green, (b === 1 ? '' : nice(b)) + 'x');
        ctx.save(); ctx.strokeStyle = k.green; ctx.globalAlpha = 0.6; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox + (X + h) * unit, oy + 4); ctx.lineTo(ox + (X + h) * unit, oy + X * unit - 4); ctx.stroke(); ctx.restore();
      } else {
        rect(X, 0, h, X, k.greenSoft, k.green, hs + 'x');
        // the second half slides from the right of the square to below it, turning as it goes
        var x0 = X + h, y0 = 0, w0 = h, h0 = X, x1 = 0, y1 = X, w1 = X, h1 = h;
        rect(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w0 + (w1 - w0) * t, h0 + (h1 - h0) * t, k.greenSoft, k.green, t > 0.9 ? hs + 'x' : null);
      }
      if (tSplit > 0.98) {
        if (tCorner > 0.01) { ctx.globalAlpha = tCorner; rect(X, X, h, h, k.goldSoft, k.gold, nice(h * h)); ctx.globalAlpha = 1; }
        else rect(X, X, h, h, 'rgba(0,0,0,0)', k.gold, '?', [6, 5]);
      }
      // side labels
      ctx.fillStyle = k.muted; ctx.font = 'italic 600 14px Georgia,serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('x', ox + X * unit / 2, oy - 6);
      if (stage === 0 && anim >= 1) { ctx.fillText(nice(b), ox + (X + b / 2) * unit, oy - 6); }
      else { ctx.fillText(hs, ox + (X + h / 2) * unit, oy - 6); }
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('x', ox - 8, oy + X * unit / 2);
      if (tSplit > 0.5) ctx.fillText(hs, ox - 8, oy + (X + h / 2) * unit);
      // readout
      var bt = texNum(b), ht = texNum(h), sq = texNum(h * h), s;
      if (stage === 0) s = 'Start with $x^2 + ' + bt + 'x$: a square $x$ by $x$, and a strip $x$ by $' + bt + '$. Together they are not a square.';
      else if (stage === 1) s = 'Cut the strip in half: $' + bt + 'x = ' + ht + 'x + ' + ht + 'x$. Put one half on the right and one below. A corner is missing: a small square $' + ht + '$ by $' + ht + '$.';
      else s = 'Fill the corner with $(' + ht + ')^2 = ' + sq + '$. Now it is a square with side $x + ' + ht + '$: $$x^2 + ' + bt + 'x + ' + sq + ' = (x + ' + ht + ')^2$$' + (cst !== null ? 'For $x^2 + ' + bt + 'x = ' + texNum(cst) + '$, add $' + sq + '$ to <em>both</em> sides: $(x + ' + ht + ')^2 = ' + texNum(cst + h * h) + '$.' : 'The number added is always $(\\frac{b}{2})^2$.');
      F.out.set(s);
      F.done(stage === 2);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ================================================================ alg1-piecewise
  V.register('alg1-piecewise', function (el, o) {
    var pieces = (o.pieces || [{ f: 'x+2', tex: 'x + 2', from: null, to: 1, inFrom: false, inTo: false }, { f: '3-x', tex: '3 - x', from: 1, to: null, inFrom: true, inTo: false }]).map(function (p) {
      return { f: compile(p.f, ['x']), tex: p.tex || pretty(p.f), from: p.from == null ? -Infinity : numOf(p.from), to: p.to == null ? Infinity : numOf(p.to), inFrom: !!p.inFrom, inTo: !!p.inTo };
    });
    var name = o.name || 'f', snap = o.snap || 0.5;
    var F = frame(el, o, 'A piecewise function with open and closed endpoints');
    var c = V.canvas(F.box, { aspect: 1.45, max: 440 });
    var P = V.plane(c, { xmin: o.xmin != null ? +o.xmin : -6, xmax: o.xmax != null ? +o.xmax : 6, ymin: o.ymin != null ? +o.ymin : -6, ymax: o.ymax != null ? +o.ymax : 6, equal: !!o.equal });
    var px = o.probe === null ? null : (o.probe != null ? numOf(o.probe) : 0), focus = false;
    function which(x) { for (var i = 0; i < pieces.length; i++) { var p = pieces[i]; if ((x > p.from || (p.inFrom && M.abs(x - p.from) < 1e-9)) && (x < p.to || (p.inTo && M.abs(x - p.to) < 1e-9))) return i; } return -1; }
    function interval(p) {
      var a = isFinite(p.from), b = isFinite(p.to);
      if (a && b) return texNum(p.from) + (p.inFrom ? ' \\le ' : ' < ') + 'x' + (p.inTo ? ' \\le ' : ' < ') + texNum(p.to);
      if (a) return 'x' + (p.inFrom ? ' \\ge ' : ' > ') + texNum(p.from);
      if (b) return 'x' + (p.inTo ? ' \\le ' : ' < ') + texNum(p.to);
      return '\\text{all } x';
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, vw = P.view(), cols = ['blue', 'red', 'green', 'purple', 'orange', 'teal'];
      P.clear(); P.grid(); P.axes();
      var act = px === null ? -1 : which(px);
      pieces.forEach(function (p, i) {
        var col = cols[i % cols.length], a = M.max(p.from, vw.xmin - 1), b = M.min(p.to, vw.xmax + 1);
        if (a < b) P.plot(p.f, { from: a, to: b, color: col, width: i === act ? 4.5 : 3 });
      });
      pieces.forEach(function (p, i) {
        var col = k[cols[i % cols.length]];
        [[p.from, p.inFrom], [p.to, p.inTo]].forEach(function (e) {
          if (!isFinite(e[0])) return; var y = p.f(e[0]); if (!isFinite(y)) return;
          ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.fillStyle = e[1] ? col : k.bg; ctx.beginPath(); ctx.arc(P.X(e[0]), P.Y(y), 5.5, 0, 2 * M.PI); ctx.fill(); ctx.stroke();
        });
      });
      var s = '';
      if (px !== null) {
        var X0 = P.X(px), base = P.Y(0);
        ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X0, 0); ctx.lineTo(X0, c.h); ctx.stroke(); ctx.setLineDash([]);
        var by = M.min(M.max(base, 12), c.h - 12);
        ctx.fillStyle = k.bg; ctx.strokeStyle = k.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X0, by, 8, 0, 2 * M.PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(X0, by, 3.4, 0, 2 * M.PI); ctx.fill();
        if (focus) { ctx.strokeStyle = k.gold; ctx.setLineDash([4, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X0, by, 14, 0, 2 * M.PI); ctx.stroke(); ctx.setLineDash([]); }
        if (act >= 0) {
          var p = pieces[act], y = p.f(px);
          ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(X0, P.Y(y), 6, 0, 2 * M.PI); ctx.fill();
          s = 'Input $x = ' + inTex(px) + '$ is in $' + interval(p) + '$, so use the rule $' + p.tex + '$: $' + name + '(' + inTex(px) + ') = ' + texNum(y) + '$.';
        } else s = 'Input $x = ' + inTex(px) + '$ is not in the domain of any piece, so $' + name + '(' + inTex(px) + ')$ is not defined.';
      }
      F.out.set(s + (s ? '<br>' : '') + 'A filled dot is part of the graph; an open dot is not. Drag the gold input along the $x$-axis.');
    }
    if (px !== null) {
      V.drag(c.cv, { hit: function (x, y) { return M.abs(x - P.X(px)) < 22 ? 'p' : null; }, move: function (h, x) { var vw = P.view(); px = clamp(M.round(P.x(x) / snap) * snap, vw.xmin, vw.xmax); draw(); } });
      c.cv.style.touchAction = 'pan-y'; c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Graph of a piecewise function. Left and right arrow keys move the input.');
      c.cv.addEventListener('focus', function () { focus = true; draw(); }); c.cv.addEventListener('blur', function () { focus = false; draw(); });
      c.cv.addEventListener('keydown', function (e) { var d = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!d) return; var vw = P.view(); px = clamp(px + d * snap * (e.shiftKey ? 4 : 1), vw.xmin, vw.xmax); draw(); e.preventDefault(); });
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
  // ================================================================ alg1-dots
  V.register('alg1-dots', function (el, o) {
    var pts = (o.points || []).map(function (p) { return [+p[0], +p[1]]; });
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = M.min.apply(null, xs.concat([0])), x1 = M.max.apply(null, xs), y0 = M.min.apply(null, ys.concat([0])), y1 = M.max.apply(null, ys);
    var px = (x1 - x0) * 0.08 || 1, py = (y1 - y0) * 0.1 || 1;
    var F = frame(el, o, 'A scatter plot of ' + pts.length + ' points');
    var c = V.canvas(F.box, { aspect: 1.5, max: 360 });
    var P = V.plane(c, { xmin: x0 - px, xmax: x1 + px, ymin: y0 - py, ymax: y1 + py });
    function draw() {
      var k = V.colors(); P.clear(); P.grid(); P.axes({ x: o.xlabel || 'x', y: o.ylabel || 'y' });
      if (o.line) P.plot(function (x) { return o.line[0] * x + o.line[1]; }, { color: 'blue', width: 2.5 });
      pts.forEach(function (p) { P.point(p[0], p[1], { color: 'ink', r: 5 }); });
      F.out.set(pts.length + ' data points.');
    }
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', 'Scatter plot: ' + pts.map(function (p) { return '(' + nice(p[0]) + ', ' + nice(p[1]) + ')'; }).join(', '));
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
})(window, document);
