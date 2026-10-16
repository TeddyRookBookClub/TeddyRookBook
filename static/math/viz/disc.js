/* Math Ladder visuals for Discrete Math (course key disc). Registered on window.MathLadder.viz; needs viz/core.js
   (and looks best with viz/adv.css, which these course pages load). Styles are injected below.
   Every visual takes: task (an instruction line, HTML allowed), label (aria-label), edit (default true; false freezes
   it into a picture with no buttons), quiet: true (alias readout: false: hides every number, label or verdict a
   problem might ask for; listed per visual). Light and dark themes follow the site (CSS variables), mouse, touch and
   keyboard work, nothing animates when the visitor prefers less motion, and nothing overflows at 360 px.

   disc-truth   A truth table for one or two compound statements in up to four letters (P, Q, R, S), one subformula
                column at a time. Conditional columns mark their only false row (true hypothesis, false conclusion) and
                tag rows with a false hypothesis "°: the promise was never tested".
     opts: expr: "(P -> Q) & ~Q"     accepts ~ & | -> <-> and ¬ ∧ ∨ → ↔, parentheses
           compare: "~P | Q"          a second statement beside the first; rows where they differ are flagged and the
                                      readout says whether they are equivalent
           premises: ["P -> Q", "Q"], conclusion: "P"   argument mode: rows with every premise true are highlighted,
                                      and such a row with a false conclusion is flagged as the counterexample
           steps: true                reveal the columns one at a time (Next column, Show all, Start over)
           fill: false                the learner fills the last column (click a cell: ? → T → F); each cell is checked
           story: {"P": "it rains", "Q": "the game is off"}   English beside the letters
           show: ["P -> Q"]           subformula columns that stay visible in quiet mode
     quiet hides the last column(s), the equivalent/valid verdicts and the counterexample flag.

   disc-relation   Arrow diagrams, relation digraphs, equivalence classes and Hasse diagrams.
     opts: mode: "map" | "relation" | "classes" | "hasse"
           A: ["1","2","3"], B: ["a","b"]         the sets (strings)
           pairs: [["1","a"], …]  or  rule: "x^2" | "x mod 3" | "divides" | "le" | "lt" | "mod 3" | "eq" | "subset"
                                  (map: a rule computes the arrow from each x in A; "x^2", "x mod 3", "2x", "x+1", "|x|")
           n: 12                  hasse with rule "divides": the divisors of n; rule "subset": subsets of {1, …, n} (n ≤ 3)
           range: false           map: offer a codomain switch, "B" versus "outputs only" (onto depends on the codomain)
           target: "function" | "injective" | "surjective" | "bijection"   map, with task: a check mark when met
           checks: ["reflexive", "symmetric", "antisymmetric", "transitive"]   relation: which properties to test
           closure: true          relation: buttons that add the missing pairs (reflexive, symmetric, transitive closure)
           all: false             hasse: start with every comparison drawn (the edges transitivity implies, dashed)
           order: false           hasse: the ordering task (pick the elements in an order that respects the relation)
     quiet hides the property verdicts and check marks, the flags and rings, the number of classes and missing pairs.

   disc-overcount   A counting method run in full: every outcome it produces, grouped by the actual object.
     opts: mode: "committee" | "word" | "table" | "ordered"
           people: {"w": 4, "m": 3}, size: 3, method: "one-first" | "complement" | "ordered"   (committee)
           word: "BANANA" (word), n: 5 (table: people around a round table), items: 5, size: 3 (ordered)
           group: true (start grouped), max: 60 (above this many outcomes, show most groups as counts)
     quiet hides the method's count, the number of distinct outcomes and the factor between them.

   disc-encode   Counting objects matched with strings.
     opts: mode: "paths" | "stars"
           paths: m: 4, n: 3 (grid width and height), counts: true (paths to each point), through: [2, 1],
                  avoid: [[1, 1]], identity: false (click a point to see Pascal’s rule there), path: "RRURU" (start)
           stars: n: 7, k: 3, min: 0 or [1, 1, 1], bars: [2, 5] (start positions in the row)
     quiet hides the point counts, the totals and the arrangement count (the drawn path and its string stay).

   disc-tiling   Recurrences from tilings, strings and the Tower of Hanoi.
     opts: mode: "domino" (2-by-n with dominoes) | "squares" (1-by-n with squares and dominoes) | "strings" (bit strings
           with no two 1s in a row) | "hanoi";  n: 5;  list: true;  group: true;  ratio: false (a_n / a_{n-1} column);
           max: 8 (largest n on the slider)
     quiet hides the values a_n and the group counts (hanoi: the minimum number of moves).

   disc-graph   An interactive graph.
     opts: graph: "K5" | "K33" | "C6" | "P5" | "W5" | "petersen" | "cube" | "konigsberg" | {"v": ["A", …], "e": [["A","B"], …],
                  "pos": {"A": [x, y], …} (0…100, y down)}
           mode: "degrees" | "walk" | "euler" | "hamilton" | "color" | "iso" | "planar" | "matrix"
           layout: "circle" | "given" | "tree";  k: 2 (matrix: the power);  order: ["A", …] (color: greedy order);
           graph2 (iso: the second graph);  start: "A" (walk modes: a starting vertex)
     quiet hides degrees, the degree sum, edge and walk counts, the number of colors and every verdict.

   disc-graphalgo   Kruskal, Prim and Dijkstra, one step at a time.
     opts: algo: "kruskal" | "prim" | "dijkstra";  graph: {"v": […], "e": [["A","B",4], …], "pos": {…}};  start: "A";
           play: "step" (Step and Finish buttons) | "learner" (click the next edge or vertex; wrong picks are explained)
     quiet hides the running total, the distance labels of unsettled vertices and the final order.                 */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/disc.js: load viz/core.js first'); return; }
  var M = Math, NS = 'http://www.w3.org/2000/svg', mk = V.el;
  var SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', n: 'ₙ', '-': '₋', '+': '₊', k: 'ₖ' };
  function sub(n) { return String(n).split('').map(function (c) { return SUB[c] || c; }).join(''); }

  // ---------------------------------------------------------------- styles
  (function css() {
    if (D.getElementById('disc-viz-css')) return;
    var s = D.createElement('style'); s.id = 'disc-viz-css';
    s.textContent = [
      '.dv{--dv-blue:#1c6fd6;--dv-red:#d6336c;--dv-green:#00703c;--dv-gold:#b8860b;--dv-purple:#7048e8;--dv-orange:#e8590c;--dv-teal:#0c8599;--dv-pink:#c2255c;--dv-soft:rgba(184,150,62,.16);--dv-okbg:rgba(0,112,60,.12);--dv-badbg:rgba(214,51,108,.13);--dv-gray:#9aa5a0}',
      'html[data-theme="dark"] .dv{--dv-blue:#74c0fc;--dv-red:#ff8787;--dv-green:#6cc79a;--dv-gold:#ffd479;--dv-purple:#b197fc;--dv-orange:#ffa94d;--dv-teal:#66d9e8;--dv-pink:#f783ac;--dv-soft:rgba(255,212,121,.16);--dv-okbg:rgba(108,199,154,.16);--dv-badbg:rgba(255,135,135,.16);--dv-gray:#5f6f66}',
      '.dv .dv-svgwrap{background:var(--mv-card);border-radius:10px;border:1px solid var(--mv-line);padding:4px;max-width:100%}',
      '.dv svg.dv-svg{display:block;width:100%;height:auto;max-height:440px;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none}',
      '.dv svg.dv-svg:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
      '.dv svg text{font-family:system-ui,sans-serif;fill:var(--mv-ink)}',
      '.dv .dv-legend{font-size:.88rem;color:var(--mv-muted);margin:.35rem 0 0;line-height:1.5}',
      '.dv .dv-legend b{color:var(--mv-ink)}',
      '.dv .dv-tblwrap{max-width:100%;overflow-x:auto;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card)}',
      '.dv table.dv-tt{border-collapse:collapse;margin:0 auto;font:600 .95rem system-ui,sans-serif;font-variant-numeric:tabular-nums}',
      '.dv table.dv-tt th{font:600 .9rem Georgia,serif;font-style:italic;color:var(--mv-ink);padding:.45rem .55rem;border-bottom:2px solid var(--mv-line);white-space:nowrap;background:var(--mv-paper)}',
      '.dv table.dv-tt th.dv-in{font-style:italic}',
      '.dv table.dv-tt td{text-align:center;padding:.3rem .55rem;border-bottom:1px solid var(--mv-line);min-width:2.2rem;position:relative}',
      '.dv table.dv-tt td.dv-sep,.dv table.dv-tt th.dv-sep{border-left:2px solid var(--mv-line)}',
      '.dv table.dv-tt td.T{color:var(--dv-green)}.dv table.dv-tt td.F{color:var(--dv-red)}',
      '.dv table.dv-tt td.dv-final{font-size:1.05rem}',
      '.dv table.dv-tt td.dv-hide{color:transparent}',
      '.dv table.dv-tt td.dv-bad{background:var(--dv-badbg);box-shadow:inset 0 0 0 2px var(--dv-red)}',
      '.dv table.dv-tt tr.dv-diff td{background:var(--dv-badbg)}',
      '.dv table.dv-tt tr.dv-prem td{background:var(--dv-soft)}',
      '.dv table.dv-tt tr.dv-cex td{background:var(--dv-badbg)}',
      '.dv table.dv-tt td sup{font-size:.7em;color:var(--mv-muted);margin-left:1px}',
      '.dv table.dv-tt td .dv-tag{display:block;font:600 .68rem system-ui,sans-serif;color:var(--dv-red);white-space:nowrap}',
      '.dv table.dv-tt button.dv-cell{min-width:36px;min-height:32px;border-radius:8px;border:1px solid var(--mv-line);background:var(--mv-paper);color:var(--mv-ink);font:700 .95rem system-ui,sans-serif;cursor:pointer}',
      '.dv table.dv-tt button.dv-cell.ok{border-color:var(--dv-green);color:var(--dv-green);background:var(--dv-okbg)}',
      '.dv table.dv-tt button.dv-cell.no{border-color:var(--dv-red);color:var(--dv-red);background:var(--dv-badbg)}',
      '.dv .dv-ok{color:var(--dv-green);font-weight:700}.dv .dv-no{color:var(--dv-red);font-weight:700}.dv .dv-warn{color:var(--dv-orange);font-weight:700}',
      '.dv .dv-row{display:flex;flex-wrap:wrap;gap:.6rem;align-items:flex-start}',
      '.dv .dv-row > .dv-svgwrap{flex:1 1 260px;min-width:0}',
      '.dv .dv-row > .dv-side{flex:1 1 200px;min-width:0}',
      '.dv .dv-side{font-size:.9rem}',
      '.dv table.dv-mat{border-collapse:collapse;font:600 .9rem system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:.2rem 0}',
      '.dv table.dv-mat th{color:var(--mv-muted);font-weight:600;padding:.2rem .4rem}',
      '.dv table.dv-mat td{text-align:center;border:1px solid var(--mv-line);padding:0;min-width:34px;height:32px;background:var(--mv-card)}',
      '.dv table.dv-mat td button{width:100%;height:100%;min-height:32px;min-width:34px;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}',
      '.dv table.dv-mat td.on{background:var(--dv-okbg);color:var(--dv-green)}',
      '.dv table.dv-mat td.miss{box-shadow:inset 0 0 0 2px var(--dv-red)}',
      '.dv table.dv-mat td.sel{box-shadow:inset 0 0 0 2px #b8963e}',
      '.dv ul.dv-checks{list-style:none;margin:.3rem 0;padding:0}',
      '.dv ul.dv-checks li{margin:.25rem 0;line-height:1.4}',
      '.dv .dv-chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.4rem 0 0}',
      '.dv .dv-chip{display:inline-flex;align-items:center;min-height:36px;padding:.2rem .65rem;border-radius:999px;border:1px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);font:600 .9rem system-ui,sans-serif;cursor:pointer}',
      '.dv .dv-chip[aria-pressed="true"]{background:var(--dv-okbg);border-color:var(--dv-green);color:var(--dv-green)}',
      '.dv .dv-chip:disabled{opacity:.45;cursor:default}',
      '.dv .dv-groups{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.45rem;margin:.2rem 0 0}',
      '.dv .dv-group{border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card);padding:.4rem .5rem;font-size:.82rem;line-height:1.35}',
      '.dv .dv-group h4{margin:0 0 .25rem;font:700 .9rem system-ui,sans-serif;color:var(--mv-ink);display:flex;justify-content:space-between;gap:.3rem}',
      '.dv .dv-group h4 span{color:var(--dv-gold)}',
      '.dv .dv-group.x{opacity:.5;text-decoration:line-through}',
      '.dv .dv-out{display:inline-block;margin:.08rem .2rem .08rem 0;padding:.05rem .35rem;border-radius:6px;background:var(--mv-paper);color:var(--mv-muted);white-space:nowrap}',
      '.dv .dv-list{display:flex;flex-wrap:wrap;gap:.2rem;max-height:13rem;overflow:auto;padding:.3rem;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card)}',
      '.dv .dv-str{font:700 1.05rem ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;color:var(--mv-ink);overflow-wrap:anywhere}',
      '.dv .dv-str .r{color:var(--dv-blue)}.dv .dv-str .u{color:var(--dv-orange)}',
      '.dv .dv-tiles{display:flex;flex-wrap:wrap;gap:.5rem;align-items:flex-start}',
      '.dv .dv-tilegrp{flex:1 1 220px;min-width:0;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card);padding:.4rem}',
      '.dv .dv-tilegrp h4{margin:0 0 .3rem;font:700 .88rem system-ui,sans-serif}',
      '.dv .dv-tilegrp .dv-tl{display:flex;flex-wrap:wrap;gap:.3rem}',
      '.dv .dv-tilegrp svg{display:block}',
      '.dv table.dv-vals{border-collapse:collapse;font:600 .85rem system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:.4rem 0 0}',
      '.dv table.dv-vals th,.dv table.dv-vals td{padding:.2rem .5rem;border-bottom:1px solid var(--mv-line);text-align:right}',
      '.dv table.dv-vals th{color:var(--mv-muted)}',
      '.dv table.dv-vals tr.hi td{background:var(--dv-soft)}',
      '.dv .dv-sel{display:inline-flex;align-items:center;gap:.3rem;font-size:.88rem;color:var(--mv-muted)}',
      '.dv .dv-sel select{min-height:36px;border:1px solid var(--mv-line);border-radius:8px;background:var(--mv-card);color:var(--mv-ink);font:600 .9rem system-ui,sans-serif;padding:0 .3rem}',
      '.dv .dv-iso{display:flex;flex-wrap:wrap;gap:.5rem}.dv .dv-iso > .dv-svgwrap{flex:1 1 220px;min-width:0}',
      '.dv .dv-small{font-size:.82rem;color:var(--mv-muted)}',
      '@media (max-width:480px){.dv table.dv-tt td,.dv table.dv-tt th{padding:.28rem .32rem}.dv table.dv-tt th{font-size:.8rem}}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ---------------------------------------------------------------- shared helpers
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o || {}) if (o[k] !== undefined) r[k] = o[k]; return r; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function frame(el, o, label) {
    el.classList.add('mla', 'dv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el); if (F.quiet) F.out.el.hidden = true;
    var was = false;
    F.done = function (ok) { if (!F.task) return; ok = !!ok; F.task.classList.toggle('ok', ok); if (ok && !was) F.task.setAttribute('aria-live', 'polite'); was = ok; };
    F.say = function (h) { F.out.set(h); };
    return F;
  }
  function svg(parent, w, h, label, maxW) {
    var wrap = mk('div', 'dv-svgwrap'), s = D.createElementNS(NS, 'svg');
    if (maxW) s.style.maxWidth = maxW + 'px';
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); s.setAttribute('class', 'dv-svg'); s.setAttribute('role', 'img'); if (label) s.setAttribute('aria-label', label);
    wrap.appendChild(s); parent.appendChild(wrap); s._w = w; s._h = h; return s;
  }
  function sv(tag, attrs, parent) { var e = D.createElementNS(NS, tag); for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function stext(parent, x, y, s, a) { var t = sv('text', Object.assign({ x: x, y: y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 14 }, a || {}), parent); t.textContent = s; return t; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function svgPoint(s, e) { var r = s.getBoundingClientRect(), vb = s.viewBox.baseVal; return [(e.clientX - r.left) / r.width * vb.width, (e.clientY - r.top) / r.height * vb.height]; }
  function setSize(s, w, h) { s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); s._w = w; s._h = h; }
  function btn(parent, text, fn, cls) { return V.button(parent, text, fn, cls); }
  function list(arr) { if (arr.length < 2) return arr.join(''); return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]; }
  function nCr(n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return M.round(r); }
  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function combos(arr, k) { var out = []; (function go(s, c) { if (c.length === k) { out.push(c.slice()); return; } for (var i = s; i < arr.length; i++) { c.push(arr[i]); go(i + 1, c); c.pop(); } })(0, []); return out; }
  function perms(arr) { if (arr.length <= 1) return [arr.slice()]; var out = []; arr.forEach(function (x, i) { perms(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(function (p) { out.push([x].concat(p)); }); }); return out; }
  function arrowHead(defs, id, color) { var m = sv('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 5.5, markerHeight: 5.5, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:' + color }, m); return 'url(#' + id + ')'; }

  // ================================================================ disc-truth
  function lparse(src) {
    var s = String(src).replace(/<->|↔/g, ' = ').replace(/->|→/g, ' > ').replace(/[~¬]/g, ' ~ ').replace(/[&∧]/g, ' & ').replace(/[|∨]/g, ' | ').replace(/[()]/g, ' $& ').trim().split(/\s+/), i = 0;
    function atom() { var x = s[i++]; if (x === '~') return { o: 'not', a: atom() }; if (x === '(') { var e = iff(); if (s[i] === ')') i++; return e; } if (!/^[A-Z]$/.test(x || '')) throw new Error('bad formula ' + src); return { o: 'v', v: x }; }
    function and() { var a = atom(); while (s[i] === '&') { i++; a = { o: 'and', a: a, b: atom() }; } return a; }
    function or() { var a = and(); while (s[i] === '|') { i++; a = { o: 'or', a: a, b: and() }; } return a; }
    function imp() { var a = or(); if (s[i] === '>') { i++; return { o: 'imp', a: a, b: imp() }; } return a; }
    function iff() { var a = imp(); while (s[i] === '=') { i++; a = { o: 'iff', a: a, b: imp() }; } return a; }
    var r = iff(); if (i < s.length) throw new Error('bad formula ' + src); return r;
  }
  var SYM = { and: ' ∧ ', or: ' ∨ ', imp: ' → ', iff: ' ↔ ' };
  function lshow(f, parent) { if (f.o === 'v') return f.v; if (f.o === 'not') return '¬' + lshow(f.a, 'not'); var s = lshow(f.a, f.o) + SYM[f.o] + lshow(f.b, f.o); return parent && !(parent === f.o && (f.o === 'and' || f.o === 'or')) ? '(' + s + ')' : s; }
  function lev(f, e) { switch (f.o) { case 'v': return !!e[f.v]; case 'not': return !lev(f.a, e); case 'and': return lev(f.a, e) && lev(f.b, e); case 'or': return lev(f.a, e) || lev(f.b, e); case 'imp': return !lev(f.a, e) || lev(f.b, e); default: return lev(f.a, e) === lev(f.b, e); } }
  function lvars(f, acc) { acc = acc || []; if (f.o === 'v') { if (acc.indexOf(f.v) < 0) acc.push(f.v); } else { lvars(f.a, acc); if (f.b) lvars(f.b, acc); } return acc; }
  function subs(f, acc) { acc = acc || []; if (f.o === 'v') return acc; subs(f.a, acc); if (f.b) subs(f.b, acc); var k = lshow(f); if (!acc.some(function (g) { return lshow(g) === k; })) acc.push(f); return acc; }
  function sameF(a, b) { return lshow(lparse(a)) === lshow(lparse(b)); }

  V.register('disc-truth', function (el, o) {
    o = opt(o, { steps: false, fill: true, show: [] });
    var F = frame(el, o, 'Truth table'), arg = !!(o.premises && o.conclusion), cmp = !!o.compare;
    var finals = arg ? o.premises.concat([o.conclusion]).map(lparse) : [lparse(o.expr || 'P -> Q')].concat(cmp ? [lparse(o.compare)] : []);
    var vars = []; finals.forEach(function (f) { lvars(f, vars); }); vars.sort();
    var cols = []; finals.forEach(function (f) { subs(f, []).forEach(function (g) { if (!cols.some(function (c) { return lshow(c) === lshow(g); })) cols.push(g); }); });
    // final columns go last, in the given order
    var finalKeys = finals.map(function (f) { return lshow(f); });
    var inner = cols.filter(function (c) { return finalKeys.indexOf(lshow(c)) < 0; });
    var lastCols = []; finals.forEach(function (f) { if (!lastCols.some(function (c) { return lshow(c) === lshow(f); })) lastCols.push(f); });
    var showKeys = (o.show || []).map(function (x) { try { return lshow(lparse(x)); } catch (e) { return ''; } });
    var allCols = inner.concat(lastCols), n = vars.length, rows = [];
    for (var r = 0; r < (1 << n); r++) { var e = {}; vars.forEach(function (v, j) { e[v] = !((r >> (n - 1 - j)) & 1); }); rows.push(e); }
    var learner = o.fill === false && !F.quiet, guess = {}, revealed = o.steps && F.edit ? 0 : allCols.length;
    if (o.story) { var lg = mk('p', 'dv-legend', vars.filter(function (v) { return o.story[v]; }).map(function (v) { return '<b>' + v + '</b>: ' + esc(o.story[v]); }).join(' &nbsp;·&nbsp; ')); F.box.appendChild(lg); }
    var tw = mk('div', 'dv-tblwrap'); F.box.appendChild(tw);
    var note = mk('p', 'dv-legend'); F.box.appendChild(note);
    function hiddenCol(c) { var k = lshow(c); if (F.quiet) { if (lastCols.some(function (f) { return lshow(f) === k; })) return showKeys.indexOf(k) < 0; } return false; }
    function draw() {
      var html = '<table class="dv-tt"><thead><tr>' + vars.map(function (v) { return '<th scope="col" class="dv-in">' + v + '</th>'; }).join('');
      allCols.forEach(function (c, j) { var fin = j >= inner.length; html += '<th scope="col" class="' + (j === 0 || (fin && j === inner.length) ? 'dv-sep' : '') + '">' + esc(lshow(c)) + (arg && fin ? (j === allCols.length - 1 ? '<br><span class="dv-small">conclusion</span>' : '<br><span class="dv-small">premise</span>') : '') + '</th>'; });
      if (arg && !F.quiet && revealed >= allCols.length) html += '<th scope="col" class="dv-sep"></th>';
      html += '</tr></thead><tbody>';
      var anyUntested = false, cexRow = -1, diffRows = [];
      rows.forEach(function (e, ri) {
        var cls = '', prem = arg && o.premises.every(function (p) { return lev(lparse(p), e); }), concl = arg && lev(finals[finals.length - 1], e);
        var showAll = revealed >= allCols.length;
        if (arg && prem && showAll && !F.quiet) { cls = concl ? 'dv-prem' : 'dv-cex'; if (!concl && cexRow < 0) cexRow = ri; }
        if (cmp && showAll && !F.quiet && lev(finals[0], e) !== lev(finals[1], e)) { cls = 'dv-diff'; diffRows.push(ri + 1); }
        html += '<tr class="' + cls + '">' + vars.map(function (v) { var b = e[v]; return '<td class="' + (b ? 'T' : 'F') + '">' + (b ? 'T' : 'F') + '</td>'; }).join('');
        allCols.forEach(function (c, j) {
          var b = lev(c, e), fin = j >= inner.length, sep = j === 0 || (fin && j === inner.length) ? ' dv-sep' : '';
          if (j >= revealed) { html += '<td class="dv-hide' + sep + '">·</td>'; return; }
          if (hiddenCol(c)) { html += '<td class="dv-final' + sep + '" style="color:var(--mv-muted)">?</td>'; return; }
          if (learner && j === allCols.length - 1) { var gv = guess[ri], st = gv === undefined ? '' : (gv === b ? ' ok' : ' no'); html += '<td class="' + sep + '"><button type="button" class="dv-cell' + st + '" data-r="' + ri + '" aria-label="Row ' + (ri + 1) + ': ' + (gv === undefined ? 'not filled' : gv ? 'T' : 'F') + '">' + (gv === undefined ? '?' : gv ? 'T' : 'F') + '</button></td>'; return; }
          var mark = '', bad = '';
          if (c.o === 'imp' && !F.quiet) { if (!lev(c.a, e)) { mark = '<sup>°</sup>'; anyUntested = true; } else if (!b) bad = ' dv-bad'; }
          html += '<td class="' + (b ? 'T' : 'F') + (fin ? ' dv-final' : '') + sep + bad + '">' + (b ? 'T' : 'F') + mark + '</td>';
        });
        if (arg && !F.quiet && showAll) html += '<td class="dv-sep">' + (cls === 'dv-cex' ? '<span class="dv-tag">counterexample</span>' : cls === 'dv-prem' ? '<span class="dv-small">premises true</span>' : '') + '</td>';
        html += '</tr>';
      });
      tw.innerHTML = html + '</tbody></table>';
      tw.querySelectorAll('button.dv-cell').forEach(function (b2) { b2.addEventListener('click', function () { var ri = +b2.dataset.r, g = guess[ri]; guess[ri] = g === undefined ? true : g ? false : undefined; draw(); var bt = tw.querySelector('button[data-r="' + ri + '"]'); if (bt) bt.focus(); }); });
      note.innerHTML = anyUntested && revealed > 0 ? '° The hypothesis is false in this row, so the promise was never tested: the conditional counts as true. The one false row of a conditional is boxed in red.' : '';
      // readout
      var last = finals[finals.length - 1], msg = '';
      if (learner) { var right = rows.filter(function (e2, ri) { return guess[ri] === lev(allCols[allCols.length - 1], e2); }).length; msg = right + ' of ' + rows.length + ' cells right.'; F.done(right === rows.length); }
      else if (revealed < allCols.length) msg = revealed === 0 ? 'Start with the letters: ' + n + ' letters give 2' + (n > 1 ? '<sup>' + n + '</sup>' : '') + ' = ' + rows.length + ' rows. Press Next column.' : 'Column ' + revealed + ' of ' + allCols.length + ': <b>' + esc(lshow(allCols[revealed - 1])) + '</b>' + (allCols[revealed - 1].o === 'imp' ? ' is false only where the left side is true and the right side is false.' : allCols[revealed - 1].o === 'or' ? ' is true when at least one side is true (both is fine).' : allCols[revealed - 1].o === 'and' ? ' is true only when both sides are true.' : allCols[revealed - 1].o === 'iff' ? ' is true when both sides match.' : ' flips each value.');
      else if (cmp) msg = diffRows.length ? 'Not equivalent: the two columns differ in row' + (diffRows.length > 1 ? 's ' : ' ') + list(diffRows.map(String)) + '.' : '<span class="dv-ok">Equivalent:</span> the two columns match in every row.';
      else if (arg) msg = cexRow < 0 ? '<span class="dv-ok">Valid:</span> in every row where all the premises are true, the conclusion is true.' : '<span class="dv-no">Invalid:</span> row ' + (cexRow + 1) + ' makes every premise true and the conclusion false.';
      else { var tr = rows.filter(function (e2) { return lev(last, e2); }).length; msg = esc(lshow(last)) + ' is true in ' + tr + ' of the ' + rows.length + ' rows' + (tr === rows.length ? ' (a tautology).' : tr === 0 ? ' (a contradiction).' : '.'); }
      F.say(msg);
    }
    if (o.steps && F.edit) {
      btn(F.ctl, 'Next column', function () { if (revealed < allCols.length) { revealed++; draw(); } }, 'pri');
      btn(F.ctl, 'Show all', function () { revealed = allCols.length; draw(); });
      btn(F.ctl, 'Start over', function () { revealed = 0; draw(); });
    }
    if (learner && F.edit) btn(F.ctl, 'Clear', function () { guess = {}; draw(); });
    draw();
    return { draw: draw };
  });

  // ================================================================ disc-relation
  var RULES = {
    divides: function (a, b) { return b % a === 0; }, le: function (a, b) { return a <= b; }, lt: function (a, b) { return a < b; }, eq: function (a, b) { return a === b; },
    subset: function (a, b) { return (a & b) === a; }
  };
  function relRule(rule) { if (RULES[rule]) return RULES[rule]; var m = /^mod (\d+)$/.exec(rule || ''); if (m) { var k = +m[1]; return function (a, b) { return ((a - b) % k + k) % k === 0; }; } return null; }
  function mapRule(rule) {
    var m = /^x mod (\d+)$/.exec(rule || ''); if (m) { var k = +m[1]; return function (x) { return ((x % k) + k) % k; }; }
    if (rule === 'x^2') return function (x) { return x * x; }; if (rule === '2x') return function (x) { return 2 * x; }; if (rule === 'x+1') return function (x) { return x + 1; }; if (rule === '|x|') return function (x) { return M.abs(x); };
    if (W.CAS && rule) { try { var f = W.CAS.compile(W.CAS.parse(rule), ['x']); return function (x) { return f(x); }; } catch (e) { } }
    return null;
  }
  function subsetName(mask, n) { var s = []; for (var i = 0; i < n; i++) if (mask >> i & 1) s.push(i + 1); return s.length ? '{' + s.join(',') + '}' : '∅'; }
  function relProps(A, has) {
    var r = { refl: [], sym: [], anti: [], trans: [] };
    A.forEach(function (a) { if (!has(a, a)) r.refl.push([a, a]); });
    A.forEach(function (a) { A.forEach(function (b) { if (has(a, b) && !has(b, a)) r.sym.push([a, b]); if (a !== b && has(a, b) && has(b, a) && A.indexOf(a) < A.indexOf(b)) r.anti.push([a, b]); }); });
    A.forEach(function (a) { A.forEach(function (b) { if (!has(a, b)) return; A.forEach(function (c) { if (has(b, c) && !has(a, c)) r.trans.push([a, b, c]); }); }); });
    return r;
  }
  V.register('disc-relation', function (el, o) {
    o = opt(o, { mode: 'map', checks: ['reflexive', 'symmetric', 'antisymmetric', 'transitive'], closure: true, order: false, all: false, range: false });
    var F = frame(el, o, { map: 'Arrow diagram of a function', relation: 'A relation drawn as arrows, with its matrix', classes: 'Equivalence classes', hasse: 'Hasse diagram' }[o.mode] || 'Relation');
    if (o.mode === 'map') return relMapViz(el, o, F);
    if (o.mode === 'hasse') return hasseViz(el, o, F);
    return relGraphViz(el, o, F);
  });
  function relMapViz(el, o, F) {
    var A = (o.A || ['1', '2', '3']).map(String), B = (o.B || ['a', 'b', 'c']).map(String), pairs = [];
    if (o.pairs) pairs = o.pairs.map(function (p) { return [String(p[0]), String(p[1])]; });
    else if (o.rule) { var f = mapRule(o.rule); A.forEach(function (a) { var y = f ? f(+a) : NaN; if (isFinite(y)) pairs.push([a, String(y)]); }); }
    var S = { rev: false, rangeOnly: false, pickA: null };
    var s = svg(F.box, 360, 100, 'Arrow diagram from A to B', 520);
    var defs = sv('defs', {}, s), mid = 'dvar' + V.uid(''), markA = arrowHead(defs, mid, 'var(--dv-blue)'), markR = arrowHead(defs, mid + 'r', 'var(--dv-purple)');
    function Bshown() { return S.rangeOnly ? B.filter(function (b) { return pairs.some(function (p) { return p[1] === b; }); }) : B; }
    function analyze() {
      var Bs = Bshown(), outA = A.map(function (a) { return pairs.filter(function (p) { return p[0] === a; }).length; }), inB = Bs.map(function (b) { return pairs.filter(function (p) { return p[1] === b; }).length; });
      var stray = pairs.filter(function (p) { return Bs.indexOf(p[1]) < 0; });
      var isF = outA.every(function (c) { return c === 1; }) && !stray.length, inj = inB.every(function (c) { return c <= 1; }), sur = inB.every(function (c) { return c >= 1; });
      return { Bs: Bs, outA: outA, inB: inB, isF: isF, inj: inj, sur: sur, stray: stray };
    }
    function draw() {
      clear(s); s.appendChild(defs);
      var R2 = analyze(), Bs = R2.Bs, rows = M.max(A.length, Bs.length), H = 56 + rows * 44, xA = 90, xB = 270; setSize(s, 360, H);
      var yA = function (i) { return 54 + (H - 76) * (A.length === 1 ? 0.5 : i / (A.length - 1)); }, yB = function (i) { return 54 + (H - 76) * (Bs.length === 1 ? 0.5 : i / (Bs.length - 1)); };
      sv('rect', { x: xA - 34, y: 32, width: 68, height: H - 38, rx: 30, style: 'fill:none;stroke:var(--mv-line);stroke-width:2' }, s);
      sv('rect', { x: xB - 34, y: 32, width: 68, height: H - 38, rx: 30, style: 'fill:none;stroke:var(--mv-line);stroke-width:2' }, s);
      stext(s, xA, 16, 'A (domain)', { 'font-size': 13, style: 'fill:var(--mv-muted)' }); stext(s, xB, 16, S.rangeOnly ? 'outputs only' : 'B (codomain)', { 'font-size': 13, style: 'fill:var(--mv-muted)' });
      pairs.forEach(function (p) {
        var i = A.indexOf(p[0]), j = Bs.indexOf(p[1]); if (i < 0 || j < 0) return;
        var x1 = xA + 14, y1 = yA(i), x2 = xB - 14, y2 = yB(j);
        if (S.rev) sv('line', { x1: x2, y1: y2, x2: x1, y2: y1, style: 'stroke:var(--dv-purple);stroke-width:2.2', 'marker-end': markR }, s);
        else sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, style: 'stroke:var(--dv-blue);stroke-width:2.2', 'marker-end': markA }, s);
      });
      A.forEach(function (a, i) {
        var bad = !F.quiet && R2.outA[i] !== 1, g = sv('g', { 'data-a': a, style: F.edit ? 'cursor:pointer' : '' }, s);
        if (bad) sv('circle', { cx: xA, cy: yA(i), r: 16, style: 'fill:none;stroke:var(--dv-red);stroke-width:2.5' }, g);
        if (S.pickA === a) sv('circle', { cx: xA, cy: yA(i), r: 16, style: 'fill:none;stroke:#b8963e;stroke-width:2.5;stroke-dasharray:4 3' }, g);
        sv('circle', { cx: xA, cy: yA(i), r: 11, style: 'fill:var(--mv-paper);stroke:var(--mv-ink);stroke-width:1.5' }, g);
        stext(g, xA, yA(i), a, { 'font-size': 13, 'font-weight': 700 });
        if (bad) stext(s, xA - 46, yA(i), R2.outA[i] ? 'two outputs' : 'no output', { 'font-size': 11, style: 'fill:var(--dv-red)', 'text-anchor': 'end' });
      });
      Bs.forEach(function (b, j) {
        var c = R2.inB[j], g = sv('g', { 'data-b': b, style: F.edit ? 'cursor:pointer' : '' }, s);
        if (!F.quiet && c > 1) sv('circle', { cx: xB, cy: yB(j), r: 16, style: 'fill:none;stroke:var(--dv-orange);stroke-width:2.5' }, g);
        if (!F.quiet && c === 0) sv('circle', { cx: xB, cy: yB(j), r: 16, style: 'fill:none;stroke:var(--dv-gray);stroke-width:2;stroke-dasharray:3 3' }, g);
        sv('circle', { cx: xB, cy: yB(j), r: 11, style: 'fill:var(--mv-paper);stroke:var(--mv-ink);stroke-width:1.5' }, g);
        stext(g, xB, yB(j), b, { 'font-size': 13, 'font-weight': 700 });
        if (!F.quiet && c !== 1) stext(s, xB + 22, yB(j), c > 1 ? 'hit ' + c + '×' : 'never hit', { 'font-size': 11, 'text-anchor': 'start', style: 'fill:' + (c > 1 ? 'var(--dv-orange)' : 'var(--mv-muted)') });
      });
      var msg = [];
      if (!R2.isF) msg.push('<span class="dv-no">Not a function:</span> ' + (R2.outA.some(function (c) { return c > 1; }) ? 'an element of A has two arrows out.' : R2.outA.some(function (c) { return c === 0; }) ? 'an element of A has no arrow out.' : 'an arrow lands outside the codomain.'));
      else {
        msg.push('A function: one arrow out of every element of A.');
        msg.push(R2.inj ? '<span class="dv-ok">One-to-one:</span> no element of ' + (S.rangeOnly ? 'the range' : 'B') + ' is hit twice.' : '<span class="dv-warn">Not one-to-one:</span> an output is hit more than once.');
        msg.push(R2.sur ? '<span class="dv-ok">Onto:</span> every element of the codomain is hit.' : '<span class="dv-warn">Not onto:</span> some elements of B are never hit.' + (o.range ? ' Shrink the codomain to the outputs and it becomes onto.' : ''));
        if (A.length > Bs.length) msg.push('With ' + A.length + ' inputs and only ' + Bs.length + ' outputs, two inputs must share an output (pigeonhole).');
        if (S.rev) msg.push(R2.inj && R2.sur ? 'Reversed, the arrows form the inverse function.' : 'Reversed, the arrows do not form a function: ' + (!R2.inj ? 'an element would have two arrows out' : 'an element would have no arrow out') + '.');
      }
      F.say(msg.join(' '));
      if (o.target) F.done(o.target === 'function' ? R2.isF : o.target === 'injective' ? R2.isF && R2.inj : o.target === 'surjective' ? R2.isF && R2.sur : R2.isF && R2.inj && R2.sur);
    }
    if (F.edit) {
      s.addEventListener('click', function (e) {
        var g = e.target.closest && e.target.closest('g'); if (!g) return;
        if (g.dataset.a) { S.pickA = S.pickA === g.dataset.a ? null : g.dataset.a; draw(); return; }
        if (g.dataset.b && S.pickA) { toggle(S.pickA, g.dataset.b); S.pickA = null; draw(); }
      });
      var selA = mk('label', 'dv-sel', 'arrow from '), sa = D.createElement('select'); A.forEach(function (a) { var op = D.createElement('option'); op.value = a; op.textContent = a; sa.appendChild(op); }); selA.appendChild(sa);
      var selB = mk('label', 'dv-sel', 'to '), sb = D.createElement('select'); B.forEach(function (b) { var op = D.createElement('option'); op.value = b; op.textContent = b; sb.appendChild(op); }); selB.appendChild(sb);
      F.ctl.appendChild(selA); F.ctl.appendChild(selB);
      btn(F.ctl, 'Add / remove', function () { toggle(sa.value, sb.value); draw(); });
      btn(F.ctl, 'Reverse the arrows', function () { S.rev = !S.rev; draw(); });
      if (o.range) V.seg(F.ctl, { label: 'Codomain', items: [['B', 'Codomain B'], ['R', 'Outputs only']], value: 'B', change: function (v) { S.rangeOnly = v === 'R'; draw(); } });
    }
    function toggle(a, b) { var i = -1; pairs.forEach(function (p, k) { if (p[0] === a && p[1] === b) i = k; }); if (i >= 0) pairs.splice(i, 1); else pairs.push([a, b]); }
    draw(); return { draw: draw };
  }
  function relGraphViz(el, o, F) {
    var A = (o.A || ['1', '2', '3', '4']).map(String), set = {}, rule = o.rule ? relRule(o.rule) : null;
    if (o.pairs) o.pairs.forEach(function (p) { set[p[0] + '|' + p[1]] = 1; });
    else if (rule) A.forEach(function (a) { A.forEach(function (b) { if (rule(+a, +b)) set[a + '|' + b] = 1; }); });
    function has(a, b) { return !!set[a + '|' + b]; }
    var wrap = mk('div', 'dv-row'); F.box.appendChild(wrap);
    var s = svg(wrap, 300, 300, 'Relation drawn as arrows'), side = mk('div', 'dv-side'); wrap.appendChild(side);
    var defs = sv('defs', {}, s), mid = 'dvrel' + V.uid(''), mk1 = arrowHead(defs, mid, 'var(--dv-blue)'), mk2 = arrowHead(defs, mid + 'g', 'var(--dv-red)'), mk3 = arrowHead(defs, mid + 'o', 'var(--dv-orange)');
    var hi = null; // highlighted issue
    function pos(i) { var n = A.length, t = -M.PI / 2 + 2 * M.PI * i / n, R = n <= 2 ? 70 : 105; return [150 + R * M.cos(t), 150 + R * M.sin(t)]; }
    function classes() { // union-find over symmetric pairs (assumes equivalence)
      var par = {}; A.forEach(function (a) { par[a] = a; }); function f(x) { while (par[x] !== x) x = par[x]; return x; }
      A.forEach(function (a) { A.forEach(function (b) { if (has(a, b)) par[f(a)] = f(b); }); });
      var g = {}; A.forEach(function (a) { var r = f(a); (g[r] = g[r] || []).push(a); }); return Object.keys(g).map(function (k) { return g[k]; });
    }
    function edgeLine(a, b, style, mark, bend) {
      var i = A.indexOf(a), j = A.indexOf(b), p = pos(i), q = pos(j);
      if (a === b) { var dx = p[0] - 150, dy = p[1] - 150, L = M.hypot(dx, dy) || 1, cx = p[0] + dx / L * 20, cy = p[1] + dy / L * 20; sv('circle', { cx: cx, cy: cy, r: 11, style: 'fill:none;' + style }, s); return; }
      var ang = M.atan2(q[1] - p[1], q[0] - p[0]), x1 = p[0] + 15 * M.cos(ang), y1 = p[1] + 15 * M.sin(ang), x2 = q[0] - 16 * M.cos(ang), y2 = q[1] - 16 * M.sin(ang);
      var mx = (x1 + x2) / 2 - (bend || 0) * M.sin(ang), my = (y1 + y2) / 2 + (bend || 0) * M.cos(ang);
      sv('path', { d: 'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2, style: 'fill:none;' + style, 'marker-end': mark }, s);
    }
    function draw() {
      clear(s); s.appendChild(defs);
      var P = relProps(A, has);
      if (o.mode === 'classes') {
        var cl = classes(), eq = !P.refl.length && !P.sym.length && !P.trans.length;
        var cols = ['var(--dv-blue)', 'var(--dv-orange)', 'var(--dv-green)', 'var(--dv-purple)', 'var(--dv-teal)', 'var(--dv-pink)'];
        var cw = 300 / M.max(1, M.min(3, cl.length)), rowsN = M.ceil(cl.length / 3), H = M.max(160, rowsN * 150); setSize(s, 300, H);
        cl.forEach(function (c, k) {
          var cx = cw * (k % 3) + cw / 2, cy = 75 + 150 * M.floor(k / 3), R = M.min(cw / 2 - 6, 26 + 12 * c.length);
          sv('circle', { cx: cx, cy: cy, r: R, style: 'fill:var(--mv-paper);stroke:' + cols[k % cols.length] + ';stroke-width:2.5' }, s);
          c.forEach(function (a, t) { var ang = -M.PI / 2 + 2 * M.PI * t / c.length, rr = c.length === 1 ? 0 : M.min(R - 16, 12 + 6 * c.length); var x = cx + rr * M.cos(ang), y = cy + rr * M.sin(ang); sv('circle', { cx: x, cy: y, r: 12, style: 'fill:var(--mv-card);stroke:var(--mv-ink);stroke-width:1.3' }, s); stext(s, x, y, a, { 'font-size': 12, 'font-weight': 700 }); });
        });
        side.innerHTML = F.quiet ? '' : '<p>' + (eq ? '<span class="dv-ok">An equivalence relation</span> with <b>' + cl.length + '</b> class' + (cl.length === 1 ? '' : 'es') + ':</p><p>' + cl.map(function (c) { return '[' + c[0] + '] = {' + c.join(', ') + '}'; }).join('<br>') + '</p><p class="dv-small">Every element sits in exactly one class, and two elements are related exactly when they share a class.</p>' : '<span class="dv-no">Not an equivalence relation:</span> ' + (P.refl.length ? 'not reflexive' : P.sym.length ? 'not symmetric' : 'not transitive') + ', so it does not split the set into classes.</p>');
        F.say(F.quiet ? '' : eq ? cl.length + ' classes.' : 'Not an equivalence relation.');
        return;
      }
      setSize(s, 300, 300);
      A.forEach(function (a) { A.forEach(function (b) { if (!has(a, b)) return; var both = a !== b && has(b, a), isHi = hi && hi.k === 'anti' && ((hi.p[0] === a && hi.p[1] === b) || (hi.p[0] === b && hi.p[1] === a)), isT = hi && hi.k === 'trans' && ((hi.p[0] === a && hi.p[1] === b) || (hi.p[1] === a && hi.p[2] === b));
        edgeLine(a, b, 'stroke:' + (isHi || isT ? 'var(--dv-orange)' : 'var(--dv-blue)') + ';stroke-width:' + (isHi || isT ? 3 : 2), isHi || isT ? mk3 : mk1, both ? 14 : 0); }); });
      if (hi && hi.k === 'refl') edgeLine(hi.p[0], hi.p[0], 'stroke:var(--dv-red);stroke-width:2;stroke-dasharray:4 3');
      if (hi && hi.k === 'sym') edgeLine(hi.p[1], hi.p[0], 'stroke:var(--dv-red);stroke-width:2;stroke-dasharray:5 4', mk2, 14);
      if (hi && hi.k === 'trans') edgeLine(hi.p[0], hi.p[2], 'stroke:var(--dv-red);stroke-width:2;stroke-dasharray:5 4', mk2, -10);
      A.forEach(function (a, i) { var p = pos(i); sv('circle', { cx: p[0], cy: p[1], r: 14, style: 'fill:var(--mv-paper);stroke:var(--mv-ink);stroke-width:1.5' }, s); stext(s, p[0], p[1], a, { 'font-size': 13, 'font-weight': 700 }); });
      // matrix + checks
      var mh = '<table class="dv-mat" aria-label="Relation matrix: row a, column b, 1 when a is related to b"><tr><th></th>' + A.map(function (b) { return '<th scope="col">' + esc(b) + '</th>'; }).join('') + '</tr>';
      A.forEach(function (a) { mh += '<tr><th scope="row">' + esc(a) + '</th>' + A.map(function (b) { var on = has(a, b), miss = hi && ((hi.k === 'refl' && a === b && a === hi.p[0]) || (hi.k === 'sym' && a === hi.p[1] && b === hi.p[0]) || (hi.k === 'trans' && a === hi.p[0] && b === hi.p[2])); return '<td class="' + (on ? 'on' : '') + (miss ? ' miss' : '') + '">' + (F.edit ? '<button type="button" data-a="' + esc(a) + '" data-b="' + esc(b) + '" aria-label="' + esc(a) + ' related to ' + esc(b) + ': ' + (on ? 'yes' : 'no') + '">' + (on ? 1 : 0) + '</button>' : (on ? 1 : 0)) + '</td>'; }).join('') + '</tr>'; });
      mh += '</table>';
      var items = [];
      if (!F.quiet) o.checks.forEach(function (c) {
        var k = { reflexive: 'refl', symmetric: 'sym', antisymmetric: 'anti', transitive: 'trans' }[c], bad = P[k], ok = !bad.length;
        var why = ok ? '' : k === 'refl' ? ' (' + bad[0][0] + ', ' + bad[0][0] + ') is missing' : k === 'sym' ? ' (' + bad[0][0] + ', ' + bad[0][1] + ') is in, (' + bad[0][1] + ', ' + bad[0][0] + ') is not' : k === 'anti' ? ' ' + bad[0][0] + ' and ' + bad[0][1] + ' are related both ways' : ' (' + bad[0][0] + ', ' + bad[0][1] + ') and (' + bad[0][1] + ', ' + bad[0][2] + ') are in, (' + bad[0][0] + ', ' + bad[0][2] + ') is not';
        items.push('<li>' + (ok ? '<span class="dv-ok">✓ ' + c + '</span>' : '<span class="dv-no">✗ ' + c + '</span>:' + why + (F.edit ? ' <button type="button" class="ml-btn" data-show="' + k + '" style="min-height:32px;padding:.1rem .55rem">Show</button>' : '')) + '</li>');
      });
      side.innerHTML = mh + (items.length ? '<ul class="dv-checks">' + items.join('') + '</ul>' : '');
      side.querySelectorAll('td button').forEach(function (b2) { b2.addEventListener('click', function () { var k = b2.dataset.a + '|' + b2.dataset.b; if (set[k]) delete set[k]; else set[k] = 1; hi = null; draw(); var nb = side.querySelector('button[data-a="' + b2.dataset.a + '"][data-b="' + b2.dataset.b + '"]'); if (nb) nb.focus(); }); });
      side.querySelectorAll('button[data-show]').forEach(function (b2) { b2.addEventListener('click', function () { var k = b2.dataset.show; hi = { k: k, p: relProps(A, has)[k][0] }; draw(); }); });
      var cnt = Object.keys(set).length;
      F.say(F.quiet ? '' : 'R has ' + cnt + ' ordered pair' + (cnt === 1 ? '' : 's') + '. ' + (!P.refl.length && !P.sym.length && !P.trans.length ? 'Reflexive, symmetric and transitive: an equivalence relation.' : !P.refl.length && !P.anti.length && !P.trans.length ? 'Reflexive, antisymmetric and transitive: a partial order.' : ''));
    }
    if (F.edit && o.mode === 'relation' && o.closure) {
      btn(F.ctl, 'Reflexive closure', function () { A.forEach(function (a) { set[a + '|' + a] = 1; }); hi = null; draw(); });
      btn(F.ctl, 'Symmetric closure', function () { Object.keys(set).forEach(function (k) { var p = k.split('|'); set[p[1] + '|' + p[0]] = 1; }); hi = null; draw(); });
      btn(F.ctl, 'Transitive closure', function () { var ch = true; while (ch) { ch = false; A.forEach(function (a) { A.forEach(function (b) { if (!has(a, b)) return; A.forEach(function (c) { if (has(b, c) && !has(a, c)) { set[a + '|' + c] = 1; ch = true; } }); }); }); } hi = null; draw(); });
    }
    draw(); return { draw: draw };
  }
  function hasseViz(el, o, F) {
    var rule = o.rule || 'divides', els = [], name = function (x) { return String(x); }, rel;
    if (rule === 'subset') { var n = M.min(3, o.n || 3); for (var m2 = 0; m2 < (1 << n); m2++) els.push(m2); rel = RULES.subset; name = function (x) { return subsetName(x, n); }; }
    else if (o.A) { els = o.A.map(Number); rel = relRule(rule) || RULES.divides; }
    else { var N = o.n || 12; for (var d = 1; d <= N; d++) if (N % d === 0) els.push(d); rel = RULES.divides; }
    if (rule === 'le' || rule === 'lt') rel = RULES.le;
    var lt = function (a, b) { return a !== b && rel(a, b); };
    var covers = []; els.forEach(function (a) { els.forEach(function (b) { if (lt(a, b) && !els.some(function (c) { return lt(a, c) && lt(c, b); })) covers.push([a, b]); }); });
    var rank = {}; els.forEach(function (a) { rank[a] = 0; }); for (var t = 0; t < els.length; t++) covers.forEach(function (c) { rank[c[1]] = M.max(rank[c[1]], rank[c[0]] + 1); });
    var maxR = M.max.apply(null, els.map(function (a) { return rank[a]; })), byR = []; els.forEach(function (a) { (byR[rank[a]] = byR[rank[a]] || []).push(a); });
    var W2 = 340, H = 60 + maxR * 74, pos = {};
    byR.forEach(function (row, r) { row.forEach(function (a, i) { pos[a] = [W2 * (i + 1) / (row.length + 1), H - 30 - r * 74]; }); });
    var S = { all: !!o.all, chosen: [], msg: '' };
    var s = svg(F.box, W2, H, 'Hasse diagram', 520), chips = null;
    function draw() {
      clear(s);
      if (S.all) els.forEach(function (a) { els.forEach(function (b) { if (lt(a, b) && !covers.some(function (c) { return c[0] === a && c[1] === b; })) sv('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1], style: 'stroke:var(--dv-gray);stroke-width:1.5;stroke-dasharray:5 4' }, s); }); });
      covers.forEach(function (c) { sv('line', { x1: pos[c[0]][0], y1: pos[c[0]][1], x2: pos[c[1]][0], y2: pos[c[1]][1], style: 'stroke:var(--dv-blue);stroke-width:2.2' }, s); });
      els.forEach(function (a) { var p = pos[a], lab = name(a), w = M.max(26, lab.length * 8 + 12), on = S.chosen.indexOf(a) >= 0; sv('rect', { x: p[0] - w / 2, y: p[1] - 13, width: w, height: 26, rx: 13, style: 'fill:' + (on ? 'var(--dv-okbg)' : 'var(--mv-paper)') + ';stroke:' + (on ? 'var(--dv-green)' : 'var(--mv-ink)') + ';stroke-width:1.5' }, s); stext(s, p[0], p[1], lab, { 'font-size': 13, 'font-weight': 700 }); });
      var implied = 0; els.forEach(function (a) { els.forEach(function (b) { if (lt(a, b)) implied++; }); });
      F.say(F.quiet ? '' : (S.msg ? S.msg + ' ' : '') + covers.length + ' edges in the Hasse diagram; ' + (implied - covers.length) + ' more comparisons follow by transitivity' + (S.all ? ' (dashed).' : '. Lower elements come first: a line goes up from a to b when a ' + (rule === 'subset' ? '⊆' : rule === 'le' ? '≤' : 'divides') + ' b with nothing in between.'));
      if (chips) chips.querySelectorAll('button').forEach(function (b2) { var a = +b2.dataset.v; b2.setAttribute('aria-pressed', String(S.chosen.indexOf(a) >= 0)); b2.disabled = S.chosen.indexOf(a) >= 0; });
    }
    if (F.edit) btn(F.ctl, 'Show all comparisons', function (e) { S.all = !S.all; e.target.textContent = S.all ? 'Hide implied comparisons' : 'Show all comparisons'; draw(); });
    if (o.order && F.edit) {
      var lab = mk('p', 'dv-legend', 'Click the elements in an order where everything comes after the things below it:'); F.box.appendChild(lab);
      chips = mk('div', 'dv-chips'); F.box.appendChild(chips);
      els.slice().sort(function (a, b) { return a - b; }).forEach(function (a) { var b2 = mk('button', 'dv-chip', esc(name(a))); b2.type = 'button'; b2.dataset.v = a; chips.appendChild(b2); b2.addEventListener('click', function () {
        var need = els.filter(function (c) { return lt(c, a) && S.chosen.indexOf(c) < 0; });
        if (need.length) S.msg = '<span class="dv-no">' + esc(name(a)) + ' can’t come yet:</span> ' + esc(name(need[0])) + ' is below it and not in your list.';
        else { S.chosen.push(a); S.msg = 'Your order: ' + S.chosen.map(name).join(', ') + '.'; if (S.chosen.length === els.length) { S.msg = '<span class="dv-ok">Done:</span> ' + S.chosen.map(name).join(', ') + ' respects the order.'; F.done(true); } }
        draw(); }); });
      btn(F.ctl, 'Start the list over', function () { S.chosen = []; S.msg = ''; F.done(false); draw(); });
    }
    draw(); return { draw: draw };
  }

  // ================================================================ disc-overcount
  function labeled(word) { // every labeled version of a word: copies of a letter get the subscripts in every order
    var pos = {}; word.split('').forEach(function (ch, i) { (pos[ch] = pos[ch] || []).push(i); });
    var out = [word.split('')]; Object.keys(pos).forEach(function (ch) { var ps = pos[ch], next = []; perms(ps.map(function (_, i) { return i + 1; })).forEach(function (pm) { out.forEach(function (w) { var c = w.slice(); ps.forEach(function (p, i) { c[p] = ch + sub(pm[i]); }); next.push(c); }); }); out = next; });
    return out.map(function (w) { return w.map(function (x) { return x.length === 1 ? x + sub(1) : x; }).join(''); });
  }
  V.register('disc-overcount', function (el, o) {
    o = opt(o, { mode: 'committee', people: { w: 4, m: 3 }, size: 3, method: 'one-first', word: 'BANANA', n: 4, items: 5, group: true, max: 60 });
    var F = frame(el, o, 'Seeing overcounting'), groups = [], outcomes = 0, distinct = 0, title = '', unit = '', factor = '';
    if (o.mode === 'committee' || o.mode === 'ordered') {
      var w = o.mode === 'ordered' ? o.items : o.people.w, m = o.mode === 'ordered' ? 0 : o.people.m, k = o.size, P = [];
      for (var i = 1; i <= w; i++) P.push(o.mode === 'ordered' ? String.fromCharCode(64 + i) : 'W' + sub(i)); for (i = 1; i <= m; i++) P.push('M' + sub(i));
      var isW = function (x) { return x[0] === 'W' || o.mode === 'ordered'; }, key = function (c) { return c.slice().sort(function (a, b) { return P.indexOf(a) - P.indexOf(b); }).join(' '); }, G = {};
      var meth = o.mode === 'ordered' ? 'ordered' : o.method;
      if (meth === 'one-first') { P.filter(isW).forEach(function (x) { combos(P.filter(function (y) { return y !== x; }), k - 1).forEach(function (rest) { var c = [x].concat(rest), kk = key(c); (G[kk] = G[kk] || []).push('<b>' + x + '</b> + ' + (rest.join(' ') || '∅')); outcomes++; }); }); title = 'Choose one woman first, then any ' + (k - 1) + ' others'; }
      else if (meth === 'ordered') { combos(P, k).forEach(function (c) { perms(c).forEach(function (pp) { var kk = key(c); (G[kk] = G[kk] || []).push(pp.join('')); outcomes++; }); }); title = 'Choose ' + k + ' in order'; }
      else { combos(P, k).forEach(function (c) { var kk = key(c); G[kk] = [c.some(isW) ? 'kept' : 'no woman: subtract']; outcomes++; }); title = 'All committees, minus those with no woman'; }
      groups = Object.keys(G).map(function (kk) { return { name: kk, items: G[kk], x: meth === 'complement' && !kk.split(' ').some(isW) }; });
      groups.sort(function (a, b) { return b.items.length - a.items.length || (a.name < b.name ? -1 : 1); });
      distinct = meth === 'complement' ? groups.filter(function (g) { return !g.x; }).length : groups.length; unit = meth === 'ordered' ? 'selections' : 'committees';
      if (meth === 'ordered') factor = k + '! = ' + fact(k) + ' orders of each selection';
      else if (meth === 'one-first') { var sizes = {}; groups.forEach(function (g) { sizes[g.items.length] = 1; }); factor = 'a committee with j women is counted j times (group sizes ' + Object.keys(sizes).join(', ') + '), so no single division fixes it'; }
      else factor = outcomes + ' − ' + groups.filter(function (g) { return g.x; }).length + ' = ' + distinct;
    } else if (o.mode === 'word') {
      var wd = String(o.word).toUpperCase(), cnt = {}, lab = wd.split('').map(function (ch) { cnt[ch] = (cnt[ch] || 0) + 1; return ch + sub(cnt[ch]); });
      var reps = Object.keys(cnt).filter(function (ch) { return cnt[ch] > 1; }), per = reps.reduce(function (a, ch) { return a * fact(cnt[ch]); }, 1);
      outcomes = fact(wd.length); distinct = outcomes / per; unit = 'words';
      title = 'Arrange the ' + wd.length + ' letters as if every copy were different (' + lab.join(' ') + ')';
      factor = reps.map(function (ch) { return cnt[ch] + '!'; }).join(' · ') + ' = ' + per + ' labeled versions of each word';
      if (outcomes <= o.max * 6) { var G2 = {}; perms(lab).forEach(function (pp) { var wkey = pp.map(function (x) { return x[0]; }).join(''); (G2[wkey] = G2[wkey] || []).push(pp.join('')); }); groups = Object.keys(G2).map(function (kk) { return { name: kk, items: G2[kk] }; }); }
      else { var G3 = {}, n3 = 0; (function gen(pre, rest) { if (n3 > 400) return; if (!rest.length) { if (!G3[pre]) { G3[pre] = 1; n3++; } return; } var used = {}; rest.split('').forEach(function (ch, j) { if (used[ch]) return; used[ch] = 1; gen(pre + ch, rest.slice(0, j) + rest.slice(j + 1)); }); })('', wd);
        groups = Object.keys(G3).slice(0, 12).map(function (kk, gi) { return { name: kk, items: gi < 2 ? labeled(kk) : [], count: per }; }); }
    } else {
      var nt = M.max(3, M.min(6, o.n)), ppl = 'ABCDEF'.slice(0, nt).split(''), G4 = {};
      perms(ppl).forEach(function (pp) { var r0 = pp.indexOf('A'), rot = pp.slice(r0).concat(pp.slice(0, r0)).join(''); (G4[rot] = G4[rot] || []).push(pp.join('')); });
      groups = Object.keys(G4).map(function (kk) { return { name: kk, items: G4[kk], table: kk }; }); outcomes = fact(nt); distinct = groups.length; unit = 'seatings';
      title = 'Seat ' + nt + ' people in a row (' + outcomes + ' ways), then bend the row into a circle'; factor = nt + ' rotations of each seating';
    }
    var S = { group: !!o.group };
    var head = mk('p', 'dv-legend', '<b>' + esc(title) + '.</b>'); F.box.appendChild(head);
    var body = mk('div', ''); F.box.appendChild(body);
    function tableSvg(seq) { var n = seq.length, s2 = D.createElementNS(NS, 'svg'); s2.setAttribute('viewBox', '0 0 70 70'); s2.setAttribute('width', 62); s2.setAttribute('height', 62); s2.setAttribute('aria-hidden', 'true'); sv('circle', { cx: 35, cy: 35, r: 15, style: 'fill:var(--dv-soft);stroke:var(--mv-line)' }, s2); seq.split('').forEach(function (ch, i) { var a = -M.PI / 2 + 2 * M.PI * i / n; stext(s2, 35 + 27 * M.cos(a), 35 + 27 * M.sin(a), ch, { 'font-size': 12, 'font-weight': 700 }); }); return s2; }
    function draw() {
      clear(body);
      var big = outcomes > o.max;
      if (S.group) {
        var gw = mk('div', 'dv-groups'); body.appendChild(gw);
        var show = big ? groups.slice(0, 8) : groups;
        show.forEach(function (g) {
          var d = mk('div', 'dv-group' + (g.x ? ' x' : '')), cnt2 = g.count || g.items.length;
          d.innerHTML = '<h4>' + esc(g.name) + (F.quiet || o.method === 'complement' ? '' : '<span>×' + cnt2 + '</span>') + '</h4>';
          if (g.table) d.appendChild(tableSvg(g.table));
          var lst = mk('div', ''); lst.innerHTML = (g.items.length ? g.items.slice(0, big ? 12 : 50).map(function (x) { return '<span class="dv-out">' + x + '</span>'; }).join('') + (big && g.items.length > 12 ? ' …' : '') : '<span class="dv-small">' + (F.quiet ? '' : cnt2 + ' labeled versions') + '</span>'); d.appendChild(lst);
          gw.appendChild(d);
        });
        if (big && groups.length > show.length) body.appendChild(mk('p', 'dv-small', '… and more groups like these' + (F.quiet ? '.' : ' (' + (o.mode === 'word' ? distinct : groups.length) + ' in all).')));
      } else {
        var all = []; groups.forEach(function (g) { g.items.forEach(function (x) { all.push(x); }); });
        var lst2 = mk('div', 'dv-list'); lst2.innerHTML = all.slice(0, 160).map(function (x) { return '<span class="dv-out">' + x + '</span>'; }).join('') + (all.length > 160 ? ' …' : ''); body.appendChild(lst2);
      }
      F.say(F.quiet ? '' : 'The method produces <b>' + outcomes + '</b> outcomes, but there are only <b>' + distinct + '</b> different ' + unit + ': ' + factor + '.');
    }
    if (F.edit) V.seg(F.ctl, { label: 'View', items: [['g', 'Group the same ' + unit], ['l', 'List every outcome']], value: S.group ? 'g' : 'l', change: function (v) { S.group = v === 'g'; draw(); } });
    draw(); return { draw: draw };
  });

  // ================================================================ disc-encode
  V.register('disc-encode', function (el, o) {
    o = opt(o, { mode: 'paths', m: 4, n: 3, counts: true, identity: false, k: 3, min: 0 });
    var F = frame(el, o, o.mode === 'stars' ? 'Stars and bars' : 'Lattice paths as strings of R and U');
    return o.mode === 'stars' ? starsViz(el, o, F) : pathsViz(el, o, F);
  });
  function pathsViz(el, o, F) {
    var m = M.max(1, M.min(8, o.m)), n = M.max(1, M.min(7, o.n)), avoid = (o.avoid || []).map(function (p) { return p[0] + ',' + p[1]; }), thr = o.through;
    var path = (o.path || '').toUpperCase().replace(/[^RU]/g, '').split('').filter(Boolean), sel = null;
    var cell = M.min(56, 300 / M.max(m, n)), pad = 34, Wd = pad * 2 + m * cell, Ht = pad * 2 + n * cell;
    var s = svg(F.box, Wd, Ht, 'A ' + m + ' by ' + n + ' grid. Arrow keys right and up add steps; Backspace removes one.', M.round(Wd * 1.45)); s.setAttribute('tabindex', '0');
    var strEl = mk('p', 'dv-str'); F.box.appendChild(strEl);
    var X = function (x) { return pad + x * cell; }, Y = function (y) { return Ht - pad - y * cell; };
    var cnt = []; for (var x = 0; x <= m; x++) { cnt[x] = []; for (var y = 0; y <= n; y++) cnt[x][y] = avoid.indexOf(x + ',' + y) >= 0 ? 0 : (!x && !y ? 1 : (x ? cnt[x - 1][y] : 0) + (y ? cnt[x][y - 1] : 0)); }
    function end() { var x0 = 0, y0 = 0; path.forEach(function (c) { if (c === 'R') x0++; else y0++; }); return [x0, y0]; }
    function step(c) { var e = end(); if (c === 'R' && e[0] < m && avoid.indexOf((e[0] + 1) + ',' + e[1]) < 0) path.push('R'); else if (c === 'U' && e[1] < n && avoid.indexOf(e[0] + ',' + (e[1] + 1)) < 0) path.push('U'); draw(); }
    function draw() {
      clear(s);
      for (var i = 0; i <= m; i++) sv('line', { x1: X(i), y1: Y(0), x2: X(i), y2: Y(n), style: 'stroke:var(--mv-line);stroke-width:1.5' }, s);
      for (var j = 0; j <= n; j++) sv('line', { x1: X(0), y1: Y(j), x2: X(m), y2: Y(j), style: 'stroke:var(--mv-line);stroke-width:1.5' }, s);
      var pts = [[0, 0]], e = [0, 0]; path.forEach(function (c) { e = c === 'R' ? [e[0] + 1, e[1]] : [e[0], e[1] + 1]; pts.push(e); });
      if (pts.length > 1) sv('polyline', { points: pts.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '), style: 'fill:none;stroke:var(--dv-blue);stroke-width:4;stroke-linecap:round;stroke-linejoin:round' }, s);
      for (i = 0; i <= m; i++) for (j = 0; j <= n; j++) {
        var bl = avoid.indexOf(i + ',' + j) >= 0, isT = thr && thr[0] === i && thr[1] === j, isSel = sel && sel[0] === i && sel[1] === j, isNb = sel && ((sel[0] - 1 === i && sel[1] === j) || (sel[0] === i && sel[1] - 1 === j));
        var g = sv('g', { 'data-x': i, 'data-y': j, style: F.edit ? 'cursor:pointer' : '' }, s);
        sv('circle', { cx: X(i), cy: Y(j), r: cell > 40 ? 15 : 12, style: 'fill:transparent' }, g);
        if (bl) { sv('path', { d: 'M' + (X(i) - 7) + ',' + (Y(j) - 7) + 'L' + (X(i) + 7) + ',' + (Y(j) + 7) + 'M' + (X(i) + 7) + ',' + (Y(j) - 7) + 'L' + (X(i) - 7) + ',' + (Y(j) + 7), style: 'stroke:var(--dv-red);stroke-width:3' }, g); continue; }
        sv('circle', { cx: X(i), cy: Y(j), r: isT ? 7 : 4, style: 'fill:' + (isT ? 'var(--dv-gold)' : isSel ? 'var(--dv-orange)' : isNb ? 'var(--dv-teal)' : 'var(--mv-ink)') }, g);
        if (o.counts && !F.quiet) stext(g, X(i) + 5, Y(j) - 11, String(cnt[i][j]), { 'text-anchor': 'start', 'font-size': cell > 40 ? 12 : 10, 'font-weight': 700, style: 'fill:' + (isSel ? 'var(--dv-orange)' : isNb ? 'var(--dv-teal)' : 'var(--dv-purple)') });
      }
      stext(s, X(0), Y(0) + 18, 'start', { 'font-size': 11, style: 'fill:var(--mv-muted)' }); stext(s, X(m), Y(n) - 20, 'end', { 'font-size': 11, style: 'fill:var(--mv-muted)' });
      var rs = path.filter(function (c) { return c === 'R'; }).length, us = path.length - rs;
      strEl.innerHTML = (path.length ? path.map(function (c) { return '<span class="' + c.toLowerCase() + '">' + c + '</span>'; }).join('') : '<span class="dv-small" style="letter-spacing:0;font-weight:500">Draw a path: use R and U.</span>') + ' <span class="dv-small" style="letter-spacing:0;font-weight:500">(' + rs + ' of ' + m + ' R, ' + us + ' of ' + n + ' U)</span>';
      var tot = cnt[m][n], msg = [];
      if (!F.quiet) {
        msg.push('Every shortest path is a string of ' + m + ' R’s and ' + n + ' U’s: <b>' + tot + '</b> paths' + (avoid.length ? ' avoid the blocked point' + (avoid.length > 1 ? 's' : '') : ' = C(' + (m + n) + ', ' + n + ')') + '.');
        if (thr) { var to = nCr(thr[0] + thr[1], thr[1]), fr = nCr(m - thr[0] + n - thr[1], n - thr[1]); msg.push('Through (' + thr[0] + ', ' + thr[1] + '): ' + to + ' to it × ' + fr + ' from it = <b>' + to * fr + '</b>.'); }
        if (sel && o.counts) { var l = sel[0] ? cnt[sel[0] - 1][sel[1]] : 0, b = sel[1] ? cnt[sel[0]][sel[1] - 1] : 0; msg.push('At (' + sel[0] + ', ' + sel[1] + '): ' + l + ' from the left + ' + b + ' from below = ' + cnt[sel[0]][sel[1]] + '. (Pascal’s rule.)'); }
      }
      if (rs === m && us === n) msg.push('<span class="dv-ok">Path complete.</span>');
      F.say(msg.join(' '));
      if (F.quiet) { F.out.el.hidden = !(rs === m && us === n); }
    }
    if (F.edit) {
      btn(F.ctl, 'R →', function () { step('R'); }); btn(F.ctl, 'U ↑', function () { step('U'); });
      btn(F.ctl, 'Undo', function () { path.pop(); draw(); }); btn(F.ctl, 'Clear', function () { path = []; draw(); });
      btn(F.ctl, 'Random path', function () { for (var t = 0; t < 50; t++) { var a = []; for (var i = 0; i < m; i++) a.push('R'); for (i = 0; i < n; i++) a.push('U'); for (i = a.length - 1; i > 0; i--) { var j = M.floor(M.random() * (i + 1)), tmp = a[i]; a[i] = a[j]; a[j] = tmp; } var x0 = 0, y0 = 0, ok = a.every(function (c) { if (c === 'R') x0++; else y0++; return avoid.indexOf(x0 + ',' + y0) < 0; }); if (ok) { path = a; break; } } draw(); });
      s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'r' || e.key === 'R') { step('R'); e.preventDefault(); } else if (e.key === 'ArrowUp' || e.key === 'u' || e.key === 'U') { step('U'); e.preventDefault(); } else if (e.key === 'Backspace') { path.pop(); draw(); e.preventDefault(); } });
      s.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('g'); if (!g || g.dataset.x === undefined) return; var x = +g.dataset.x, y = +g.dataset.y, en = end(); if (x === en[0] + 1 && y === en[1]) step('R'); else if (x === en[0] && y === en[1] + 1) step('U'); else if (o.identity || o.counts) { sel = sel && sel[0] === x && sel[1] === y ? null : [x, y]; draw(); } });
    }
    draw(); return { draw: draw };
  }
  function starsViz(el, o, F) {
    var k = M.max(2, M.min(6, o.k)), mins = Array.isArray(o.min) ? o.min.slice(0, k) : Array(k).fill(o.min || 0); while (mins.length < k) mins.push(0);
    var n = M.max(0, o.n), req = mins.reduce(function (a, b) { return a + b; }, 0), free = M.max(0, n - req), L = free + k - 1;
    var bars = (o.bars && o.bars.length === k - 1 ? o.bars.slice() : null) || Array.from({ length: k - 1 }, function (_, i) { return M.round((i + 1) * L / k - 0.5); });
    bars = bars.map(function (b) { return M.max(0, M.min(L - 1, b)); }); fix(); var selB = 0;
    function fix() { bars.sort(function (a, b) { return a - b; }); for (var i = 1; i < bars.length; i++) if (bars[i] <= bars[i - 1]) bars[i] = bars[i - 1] + 1; for (i = bars.length - 1; i >= 0; i--) if (bars[i] > L - (bars.length - i)) bars[i] = L - (bars.length - i); }
    var slot = M.min(34, 330 / M.max(L, 1)), Wd = M.max(300, L * slot + 30), Ht = mins.some(function (v) { return v; }) ? 150 : 132;
    var s = svg(F.box, Wd, Ht, n + ' stars and ' + (k - 1) + ' bars. Arrow keys move the selected bar; N picks the next bar.', 560); s.setAttribute('tabindex', '0');
    function counts() { var c = [], last = -1; bars.forEach(function (b) { c.push(b - last - 1); last = b; }); c.push(L - 1 - last); return c; }
    function draw() {
      clear(s); var x0 = (Wd - L * slot) / 2, c = counts();
      for (var i = 0; i < L; i++) { var bi = bars.indexOf(i), x = x0 + i * slot + slot / 2;
        if (bi >= 0) { var g = sv('g', { 'data-bar': bi, style: F.edit ? 'cursor:ew-resize' : '' }, s); sv('rect', { x: x - 10, y: 18, width: 20, height: 62, style: 'fill:transparent' }, g); sv('rect', { x: x - 3, y: 22, width: 6, height: 54, rx: 3, style: 'fill:' + (bi === selB && F.edit ? 'var(--dv-orange)' : 'var(--mv-ink)') }, g); }
        else stext(s, x, 50, '★', { 'font-size': M.min(26, slot * 0.9), style: 'fill:var(--dv-gold)' }); }
      // boxes underneath
      var bxW = (Wd - 20) / k;
      var hasMin = mins.some(function (v) { return v; });
      c.forEach(function (v, j) { var bx = 10 + j * bxW; sv('rect', { x: bx + 3, y: 92, width: bxW - 6, height: hasMin ? 48 : 30, rx: 8, style: 'fill:var(--mv-paper);stroke:var(--mv-line)' }, s); stext(s, bx + bxW / 2, hasMin ? 106 : 107, 'x' + sub(j + 1) + ' = ' + (v + mins[j]), { 'font-size': 13, 'font-weight': 700 }); if (mins[j]) stext(s, bx + bxW / 2, 126, Array(mins[j] + 1).join('★') + ' given', { 'font-size': 11, style: 'fill:var(--dv-gray)' }); });
      var tot = nCr(L, k - 1);
      F.say(F.quiet ? '' : 'This arrangement gives (' + c.map(function (v, j) { return v + mins[j]; }).join(', ') + '). ' + (req ? req + ' stars were handed out first to meet the minimums, leaving ' + free + ' free. ' : '') + free + ' stars and ' + (k - 1) + ' bars fill ' + L + ' spots: choose where the bars go, C(' + L + ', ' + (k - 1) + ') = <b>' + tot + '</b> arrangements.');
    }
    if (F.edit) {
      var drag = null;
      s.addEventListener('pointerdown', function (e) { var g = e.target.closest && e.target.closest('g'); if (!g || g.dataset.bar === undefined) return; drag = +g.dataset.bar; selB = drag; try { s.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); });
      s.addEventListener('pointermove', function (e) { if (drag === null) return; var p = svgPoint(s, e), x0 = (Wd - L * slot) / 2, i = M.max(0, M.min(L - 1, M.floor((p[0] - x0) / slot))); if (bars.indexOf(i) < 0) { bars[drag] = i; var v = bars[drag]; fix(); drag = bars.indexOf(v); selB = drag; draw(); } });
      s.addEventListener('pointerup', function () { drag = null; }); s.addEventListener('pointercancel', function () { drag = null; });
      s.addEventListener('keydown', function (e) { if (e.key === 'n' || e.key === 'N' || e.key === 'Enter') { selB = (selB + 1) % bars.length; draw(); e.preventDefault(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { var d = e.key === 'ArrowLeft' ? -1 : 1, t = bars[selB] + d; if (t >= 0 && t < L && bars.indexOf(t) < 0) { bars[selB] = t; fix(); } draw(); e.preventDefault(); } });
      btn(F.ctl, 'Next bar', function () { selB = (selB + 1) % bars.length; draw(); });
      btn(F.ctl, '◀ Move left', function () { var t = bars[selB] - 1; if (t >= 0 && bars.indexOf(t) < 0) { bars[selB] = t; fix(); } draw(); });
      btn(F.ctl, 'Move right ▶', function () { var t = bars[selB] + 1; if (t < L && bars.indexOf(t) < 0) { bars[selB] = t; fix(); } draw(); });
    }
    draw(); return { draw: draw };
  }

  // ================================================================ disc-tiling
  function tilings(mode, n) { // lists of pieces; groups by the last piece
    var out = [];
    if (mode === 'strings') { for (var x = 0; x < (1 << n); x++) { var s = x.toString(2); while (s.length < n) s = '0' + s; if (s.indexOf('11') < 0) out.push(s); } return out; }
    (function go(pre, left) { if (!left) { out.push(pre.slice()); return; } pre.push(1); go(pre, left - 1); pre.pop(); if (left >= 2) { pre.push(2); go(pre, left - 2); pre.pop(); } })([], n);
    return out;
  }
  V.register('disc-tiling', function (el, o) {
    o = opt(o, { mode: 'domino', n: 5, list: true, group: true, ratio: false, max: 8 });
    var F = frame(el, o, o.mode === 'hanoi' ? 'Tower of Hanoi' : 'Counting tilings with a recurrence');
    if (o.mode === 'hanoi') return hanoiViz(el, o, F);
    var mode = o.mode, maxN = M.min(o.max, mode === 'strings' ? 7 : 8), S = { n: M.max(1, M.min(maxN, o.n)) };
    var body = mk('div', ''); F.box.appendChild(body); var tbl = mk('div', ''); F.box.appendChild(tbl);
    function count(n) { if (mode === 'strings') { var a = [1, 2]; for (var i = 2; i <= n; i++) a[i] = a[i - 1] + a[i - 2]; return a[n]; } var b = [1, 1]; for (i = 2; i <= n; i++) b[i] = b[i - 1] + b[i - 2]; return b[n]; }
    function tileSvg(t, n) {
      var u = M.min(18, 200 / n), s2 = D.createElementNS(NS, 'svg');
      if (mode === 'strings') { s2.setAttribute('viewBox', '0 0 ' + (n * 14 + 6) + ' 22'); s2.setAttribute('width', n * 14 + 6); s2.setAttribute('height', 22); t.split('').forEach(function (ch, i) { sv('rect', { x: 3 + i * 14, y: 2, width: 13, height: 18, rx: 3, style: 'fill:' + (ch === '1' ? 'var(--dv-blue)' : 'var(--mv-paper)') + ';stroke:var(--mv-line)' }, s2); stext(s2, 3 + i * 14 + 6.5, 11, ch, { 'font-size': 11, 'font-weight': 700, style: 'fill:' + (ch === '1' ? '#fff' : 'var(--mv-ink)') }); }); return s2; }
      var h = mode === 'domino' ? 2 * u : u; s2.setAttribute('viewBox', '0 0 ' + (n * u + 4) + ' ' + (h + 4)); s2.setAttribute('width', n * u + 4); s2.setAttribute('height', h + 4);
      var x = 2; t.forEach(function (p) {
        if (mode === 'domino') { if (p === 1) sv('rect', { x: x + 1, y: 3, width: u - 2, height: 2 * u - 2, rx: 3, style: 'fill:var(--dv-blue);opacity:.85' }, s2); else { sv('rect', { x: x + 1, y: 3, width: 2 * u - 2, height: u - 2, rx: 3, style: 'fill:var(--dv-orange);opacity:.85' }, s2); sv('rect', { x: x + 1, y: 2 + u + 1, width: 2 * u - 2, height: u - 2, rx: 3, style: 'fill:var(--dv-orange);opacity:.85' }, s2); } }
        else sv('rect', { x: x + 1, y: 3, width: p * u - 2, height: u - 2, rx: 3, style: 'fill:' + (p === 1 ? 'var(--dv-blue)' : 'var(--dv-orange)') + ';opacity:.85' }, s2);
        x += p * u; });
      return s2;
    }
    function draw() {
      clear(body); var n = S.n, ts = tilings(mode, n), names = mode === 'strings' ? ['ends in 0', 'ends in 01'] : mode === 'domino' ? ['ends with a vertical domino', 'ends with two flat dominoes'] : ['ends with a square', 'ends with a domino'];
      if (o.list && ts.length <= 34) {
        var wrap = mk('div', 'dv-tiles'); body.appendChild(wrap);
        var grp = o.group ? [ts.filter(function (t) { return mode === 'strings' ? t[t.length - 1] === '0' || t.length === 1 && t === '0' : t[t.length - 1] === 1; }), ts.filter(function (t) { return mode === 'strings' ? t[t.length - 1] === '1' : t[t.length - 1] === 2; })] : [ts];
        grp.forEach(function (g, gi) { if (!g.length && n === 1 && gi === 1) return; var box = mk('div', 'dv-tilegrp'); var lab = o.group ? names[gi] + (F.quiet ? '' : ': ' + g.length + (n > 1 ? ' = a' + sub(n - 1 - gi) : '')) : (F.quiet ? 'All of them' : ts.length + ' in all'); box.appendChild(mk('h4', '', esc(lab))); var tl = mk('div', 'dv-tl'); g.forEach(function (t) { tl.appendChild(tileSvg(t, n)); }); box.appendChild(tl); wrap.appendChild(box); });
      } else body.appendChild(mk('p', 'dv-small', 'Too many to draw (' + (F.quiet ? 'many' : count(n)) + '); the table shows the counts.'));
      var rowsH = '<table class="dv-vals"><tr><th>n</th>' + (F.quiet ? '' : '<th>a' + sub('n') + '</th>') + (o.ratio && !F.quiet ? '<th>a' + sub('n') + ' / a' + sub('n') + '₋₁</th>' : '') + '</tr>';
      for (var i = 1; i <= n; i++) rowsH += '<tr class="' + (i === n ? 'hi' : '') + '"><td>' + i + '</td>' + (F.quiet ? '' : '<td>' + count(i) + '</td>') + (o.ratio && !F.quiet ? '<td>' + (i > 1 ? (count(i) / count(i - 1)).toFixed(4) : '—') + '</td>' : '') + '</tr>';
      tbl.innerHTML = F.quiet ? '' : rowsH + '</table>';
      F.say(F.quiet ? '' : 'a' + sub(n) + ' = ' + count(n) + (n >= 3 ? ' = a' + sub(n - 1) + ' + a' + sub(n - 2) + ' = ' + count(n - 1) + ' + ' + count(n - 2) : '') + '. Every pattern ' + names[0] + ' (remove it: a smaller pattern of length ' + (n - 1) + ') or ' + names[1] + ' (length ' + (n - 2) + ').' + (o.ratio && n > 2 ? ' The ratio approaches (1 + √5)/2 ≈ 1.6180.' : ''));
    }
    if (F.edit) V.slider(F.ctl, { label: 'n', min: 1, max: maxN, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    draw(); return { draw: draw };
  });
  function hanoiViz(el, o, F) {
    var S = { n: M.max(1, M.min(6, o.n || 3)), pegs: null, moves: 0, held: null, timer: null, onPlan: true };
    function where(d) { for (var i = 0; i < 3; i++) if (S.pegs[i].indexOf(d) >= 0) return i; return -1; }
    function first(k, t) { if (!k) return null; var s0 = where(k); if (s0 === t) return first(k - 1, t); return first(k - 1, 3 - s0 - t) || [s0, t]; }
    var s = svg(F.box, 360, 170, 'Tower of Hanoi. Click a peg to pick up its top disk, then another peg to drop it.'); s.setAttribute('tabindex', '0');
    function reset() { S.pegs = [[], [], []]; for (var d = S.n; d >= 1; d--) S.pegs[0].push(d); S.moves = 0; S.held = null; S.onPlan = true; stop(); draw(); }
    function stop() { if (S.timer) { S.timer.stop(); S.timer = null; } }
    function legal(a, b) { var pa = S.pegs[a], pb = S.pegs[b]; return pa.length && (!pb.length || pb[pb.length - 1] > pa[pa.length - 1]); }
    function doMove(a, b) { if (!legal(a, b)) return false; S.pegs[b].push(S.pegs[a].pop()); S.moves++; return true; }
    function draw() {
      clear(s); var base = 150, px = [70, 180, 290];
      sv('rect', { x: 10, y: base, width: 340, height: 8, rx: 4, style: 'fill:var(--dv-gray)' }, s);
      px.forEach(function (x, i) { var g = sv('g', { 'data-peg': i, style: F.edit ? 'cursor:pointer' : '' }, s); sv('rect', { x: x - 52, y: 20, width: 104, height: 132, style: 'fill:transparent' }, g); sv('rect', { x: x - 3, y: 40, width: 6, height: 110, rx: 3, style: 'fill:' + (S.held === i ? 'var(--dv-orange)' : 'var(--mv-muted)') }, g);
        S.pegs[i].forEach(function (d, j) { var w = 18 + d * 13; sv('rect', { x: x - w / 2, y: base - 16 * (j + 1), width: w, height: 14, rx: 7, style: 'fill:hsl(' + (200 + d * 28) + ',60%,52%);stroke:var(--mv-card)' }, g); }); });
      var min = M.pow(2, S.n) - 1, done = S.pegs[2].length === S.n;
      var phase = '', half = M.pow(2, S.n - 1) - 1; if (!done && S.onPlan) phase = S.moves < half ? 'Phase 1: move the top ' + (S.n - 1) + ' disk' + (S.n > 2 ? 's' : '') + ' to the middle peg.' : S.moves === half ? 'Phase 2: move the largest disk to the right peg.' : 'Phase 3: move the ' + (S.n - 1) + ' disk' + (S.n > 2 ? 's' : '') + ' back on top of it.';
      F.say('Moves: <b>' + S.moves + '</b>.' + (F.quiet ? '' : ' Fewest possible for ' + S.n + ' disk' + (S.n > 1 ? 's' : '') + ': 2' + '<sup>' + S.n + '</sup> − 1 = ' + min + ' (aₙ = 2aₙ₋₁ + 1).') + ' ' + (done ? '<span class="dv-ok">Done!</span>' : phase));
      if (F.quiet) F.out.el.hidden = false;
    }
    if (F.edit) {
      V.slider(F.ctl, { label: 'disks', min: 1, max: 6, step: 1, value: S.n, input: function (v) { S.n = v; reset(); } });
      btn(F.ctl, 'Step', function () { stop(); var mv = first(S.n, 2); if (mv) doMove(mv[0], mv[1]); draw(); }, 'pri');
      var pb = btn(F.ctl, '▶ Play', function () { if (S.timer) { stop(); pb.textContent = '▶ Play'; return; } if (!first(S.n, 2)) reset(); pb.textContent = 'Pause'; var acc = 0; S.timer = V.loop(el, function (dt) { acc += dt; if (acc < (V.reduced ? 0.9 : 0.45)) return; acc = 0; var mv = first(S.n, 2); if (!mv || !doMove(mv[0], mv[1])) { stop(); pb.textContent = '▶ Play'; } draw(); if (!first(S.n, 2)) { stop(); pb.textContent = '▶ Play'; } }); });
      btn(F.ctl, 'Reset', function () { reset(); pb.textContent = '▶ Play'; });
      s.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('g'); if (!g) return; var i = +g.dataset.peg; stop(); if (S.held === null) { if (S.pegs[i].length) S.held = i; } else { if (S.held !== i && legal(S.held, i)) { var best = first(S.n, 2); if (!best || best[0] !== S.held || best[1] !== i) S.onPlan = false; doMove(S.held, i); } S.held = null; } draw(); });
      s.addEventListener('keydown', function (e) { var k = { '1': 0, '2': 1, '3': 2 }[e.key]; if (k === undefined) return; if (S.held === null) { if (S.pegs[k].length) S.held = k; } else { if (S.held !== k && legal(S.held, k)) { var best = first(S.n, 2); if (!best || best[0] !== S.held || best[1] !== k) S.onPlan = false; doMove(S.held, k); } S.held = null; } draw(); e.preventDefault(); });
    }
    reset(); return { draw: draw };
  }

  // ================================================================ graphs: data, presets, layout
  var L26 = 'ABCDEFGHIJKLMNOP'.split('');
  function preset(name) {
    var m;
    if ((m = /^K(\d)(\d)$/.exec(name))) { var a = +m[1], b = +m[2], V2 = L26.slice(0, a + b), e = []; for (var i = 0; i < a; i++) for (var j = a; j < a + b; j++) e.push([V2[i], V2[j]]); var pos = {}; V2.forEach(function (x, k) { pos[x] = k < a ? [25, a === 1 ? 50 : 10 + 80 * k / (a - 1)] : [75, b === 1 ? 50 : 10 + 80 * (k - a) / (b - 1)]; }); return { v: V2, e: e, pos: pos }; }
    if ((m = /^K(\d+)$/.exec(name))) { var n = +m[1], V3 = L26.slice(0, n), e3 = []; for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) e3.push([V3[i], V3[j]]); return { v: V3, e: e3 }; }
    if ((m = /^C(\d+)$/.exec(name))) { n = +m[1]; var V4 = L26.slice(0, n); return { v: V4, e: V4.map(function (x, k) { return [x, V4[(k + 1) % n]]; }) }; }
    if ((m = /^P(\d+)$/.exec(name))) { n = +m[1]; var V5 = L26.slice(0, n), e5 = []; for (i = 0; i + 1 < n; i++) e5.push([V5[i], V5[i + 1]]); var p5 = {}; V5.forEach(function (x, k) { p5[x] = [8 + 84 * k / M.max(1, n - 1), 50 + (k % 2 ? -12 : 12)]; }); return { v: V5, e: e5, pos: p5 }; }
    if ((m = /^W(\d+)$/.exec(name))) { n = +m[1]; var V6 = L26.slice(0, n), H = L26[n], e6 = V6.map(function (x, k) { return [x, V6[(k + 1) % n]]; }).concat(V6.map(function (x) { return [H, x]; })), p6 = {}; V6.forEach(function (x, k) { var t = -M.PI / 2 + 2 * M.PI * k / n; p6[x] = [50 + 42 * M.cos(t), 50 + 42 * M.sin(t)]; }); p6[H] = [50, 50]; return { v: V6.concat([H]), e: e6, pos: p6 }; }
    if (name === 'petersen') { var o5 = 'ABCDE'.split(''), i5 = 'FGHIJ'.split(''), pp = {}; o5.forEach(function (x, k) { var t = -M.PI / 2 + 2 * M.PI * k / 5; pp[x] = [50 + 45 * M.cos(t), 52 + 45 * M.sin(t)]; pp[i5[k]] = [50 + 21 * M.cos(t), 52 + 21 * M.sin(t)]; });
      return { v: o5.concat(i5), e: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'], ['A', 'F'], ['B', 'G'], ['C', 'H'], ['D', 'I'], ['E', 'J'], ['F', 'H'], ['H', 'J'], ['J', 'G'], ['G', 'I'], ['I', 'F']], pos: pp }; }
    if (name === 'cube') return { v: 'ABCDEFGH'.split(''), e: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'], ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']], pos: { A: [8, 8], B: [92, 8], C: [92, 92], D: [8, 92], E: [32, 32], F: [68, 32], G: [68, 68], H: [32, 68] } };
    if (name === 'konigsberg') return { v: ['A', 'B', 'C', 'D'], e: [['A', 'B'], ['A', 'B'], ['A', 'C'], ['A', 'C'], ['A', 'D'], ['B', 'D'], ['C', 'D']], pos: { A: [45, 50], B: [45, 10], C: [45, 90], D: [92, 50] }, multi: true };
    return preset('K4');
  }
  function graphOf(spec) {
    var g = typeof spec === 'string' ? preset(spec) : { v: (spec && spec.v || ['A', 'B', 'C']).map(String), e: (spec && spec.e || []).map(function (e) { return [String(e[0]), String(e[1]), e[2]]; }), pos: spec && spec.pos };
    return { v: g.v.slice(), e: g.e.map(function (x) { return x.slice(); }), pos: g.pos ? JSON.parse(JSON.stringify(g.pos)) : null };
  }
  function layoutG(g, how) {
    var P = {};
    if (how !== 'circle' && g.pos && g.v.every(function (x) { return g.pos[x]; })) { g.v.forEach(function (x) { P[x] = g.pos[x].slice(); }); return P; }
    if (how === 'tree') { var adj = {}; g.v.forEach(function (x) { adj[x] = []; }); g.e.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); }); var lev = {}, rows = [], q = [g.v[0]]; lev[g.v[0]] = 0; g.v.forEach(function (s) { if (lev[s] === undefined) { lev[s] = 0; q.push(s); } while (q.length) { var x = q.shift(); (rows[lev[x]] = rows[lev[x]] || []).push(x); adj[x].forEach(function (y) { if (lev[y] === undefined) { lev[y] = lev[x] + 1; q.push(y); } }); } });
      rows.forEach(function (r, i) { r.forEach(function (x, j) { P[x] = [100 * (j + 1) / (r.length + 1), rows.length === 1 ? 50 : 8 + 84 * i / (rows.length - 1)]; }); }); return P; }
    var n = g.v.length; g.v.forEach(function (x, i) { var t = -M.PI / 2 + 2 * M.PI * i / n; P[x] = [50 + 44 * M.cos(t), 50 + 44 * M.sin(t)]; }); return P;
  }
  function adjOf(g) { var a = {}; g.v.forEach(function (x) { a[x] = []; }); g.e.forEach(function (e, i) { a[e[0]].push([e[1], i]); a[e[1]].push([e[0], i]); }); return a; }
  function degOf(g) { var d = {}; g.v.forEach(function (x) { d[x] = 0; }); g.e.forEach(function (e) { d[e[0]]++; d[e[1]]++; }); return d; }
  function connected(g) { if (!g.v.length) return true; var a = adjOf(g), seen = {}, st = [g.v[0]]; seen[g.v[0]] = 1; while (st.length) { var x = st.pop(); a[x].forEach(function (p) { if (!seen[p[0]]) { seen[p[0]] = 1; st.push(p[0]); } }); } return g.v.every(function (x) { return seen[x] || !a[x].length; }); }
  function segX(p1, p2, p3, p4) { function o2(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); } var d1 = o2(p3, p4, p1), d2 = o2(p3, p4, p2), d3 = o2(p1, p2, p3), d4 = o2(p1, p2, p4); if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) { var t = d1 / (d1 - d2); return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]; } return null; }

  // a drawn graph: svg + positions + drag + hit testing; o.onVertex(v), o.decorate(layer) hooks
  function GraphView(parent, g, o2) {
    var GV = { g: g, pos: layoutG(g, o2.layout), sel: null };
    var Wd = 340, Ht = o2.height || 300, pad = 26;
    var s = svg(parent, Wd, Ht, o2.label || 'Graph', o2.maxW || 520); s.setAttribute('tabindex', '0'); GV.svg = s;
    function X(p) { return pad + p[0] / 100 * (Wd - 2 * pad); } function Y(p) { return pad + p[1] / 100 * (Ht - 2 * pad); }
    GV.X = X; GV.Y = Y;
    GV.draw = function () {
      clear(s); var under = sv('g', {}, s), eg = sv('g', {}, s), vg = sv('g', {}, s), over = sv('g', {}, s);
      if (o2.under) o2.under(under, GV);
      var seen = {};
      g.e.forEach(function (e, i) {
        var a = GV.pos[e[0]], b = GV.pos[e[1]]; if (!a || !b) return; var k = [e[0], e[1]].sort().join('|'), idx = seen[k] = (seen[k] || 0) + 1, st = o2.edgeStyle ? o2.edgeStyle(e, i) : {};
        var mult = g.e.filter(function (f) { return [f[0], f[1]].sort().join('|') === k; }).length, off = mult > 1 ? (idx - (mult + 1) / 2) * 34 : 0;
        var x1 = X(a), y1 = Y(a), x2 = X(b), y2 = Y(b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = M.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
        var d = off ? 'M' + x1 + ',' + y1 + ' Q' + (mx + nx * off) + ',' + (my + ny * off) + ' ' + x2 + ',' + y2 : 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
        sv('path', { d: d, 'data-e': i, style: 'fill:none;stroke:' + (st.color || 'var(--mv-ink)') + ';stroke-width:' + (st.width || 2.2) + (st.dash ? ';stroke-dasharray:' + st.dash : '') + (st.opacity ? ';opacity:' + st.opacity : '') }, eg);
        sv('path', { d: d, 'data-e': i, style: 'fill:none;stroke:transparent;stroke-width:16;cursor:' + (o2.onEdge ? 'pointer' : 'default') }, eg);
        if (st.label !== undefined && st.label !== '') { var lx = mx + nx * off * 0.55, ly = my + ny * off * 0.55; sv('rect', { x: lx - 11, y: ly - 9, width: 22, height: 18, rx: 6, style: 'fill:var(--mv-card);stroke:' + (st.lcolor || 'var(--mv-line)') }, eg); stext(eg, lx, ly, String(st.label), { 'font-size': 12, 'font-weight': 700, style: 'fill:' + (st.lcolor || 'var(--mv-ink)') }); }
      });
      g.v.forEach(function (x) {
        var p = GV.pos[x], st = o2.vertexStyle ? o2.vertexStyle(x) : {}, gx = sv('g', { 'data-v': x, style: 'cursor:' + (o2.drag !== false || o2.onVertex ? 'pointer' : 'default') }, vg);
        if (st.ring) sv('circle', { cx: X(p), cy: Y(p), r: 19, style: 'fill:none;stroke:' + st.ring + ';stroke-width:3' + (st.ringDash ? ';stroke-dasharray:' + st.ringDash : '') }, gx);
        if (GV.sel === x) sv('circle', { cx: X(p), cy: Y(p), r: 20, style: 'fill:none;stroke:#b8963e;stroke-width:2.5;stroke-dasharray:4 3' }, gx);
        sv('circle', { cx: X(p), cy: Y(p), r: 14, style: 'fill:var(--mv-card)' }, gx);
        sv('circle', { cx: X(p), cy: Y(p), r: 14, style: 'fill:' + (st.fill || 'var(--mv-paper)') + ';stroke:' + (st.stroke || 'var(--mv-ink)') + ';stroke-width:' + (st.sw || 1.6) }, gx);
        stext(gx, X(p), Y(p), st.text !== undefined ? st.text : x, { 'font-size': 13, 'font-weight': 700, style: 'fill:' + (st.tcolor || 'var(--mv-ink)') });
        if (st.badge !== undefined) { var bx = X(p) + 14, by = Y(p) - 14; sv('circle', { cx: bx, cy: by, r: 9, style: 'fill:' + (st.badgeFill || 'var(--dv-purple)') }, gx); stext(gx, bx, by, String(st.badge), { 'font-size': 10.5, 'font-weight': 700, style: 'fill:#fff' }); }
        if (st.below) stext(gx, X(p), Y(p) + 24, st.below, { 'font-size': 11, 'font-weight': 700, style: 'fill:' + (st.belowColor || 'var(--dv-purple)') });
        if (st.tag) { var tw2 = M.max(20, String(st.tag).length * 8 + 8), tx = X(p) + 13, ty = Y(p) - 30; sv('rect', { x: tx, y: ty, width: tw2, height: 18, rx: 9, style: 'fill:var(--mv-card);stroke:' + (st.tagColor || 'var(--dv-purple)') + ';stroke-width:1.5' }, gx); stext(gx, tx + tw2 / 2, ty + 9, String(st.tag), { 'font-size': 11.5, 'font-weight': 700, style: 'fill:' + (st.tagColor || 'var(--dv-purple)') }); }
      });
      if (o2.over) o2.over(over, GV);
    };
    // pointer: drag vertices (when allowed) and click vertices / edges
    var drag = null, moved = false, start = null;
    s.addEventListener('pointerdown', function (e) { var gx = e.target.closest && e.target.closest('g[data-v]'); if (gx) { drag = gx.dataset.v; moved = false; start = svgPoint(s, e); try { s.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); } });
    s.addEventListener('pointermove', function (e) { if (!drag) return; var p = svgPoint(s, e); if (!moved && M.hypot(p[0] - start[0], p[1] - start[1]) < 6) return; if (o2.drag === false) return; moved = true; GV.pos[drag] = [M.max(0, M.min(100, (p[0] - pad) / (Wd - 2 * pad) * 100)), M.max(0, M.min(100, (p[1] - pad) / (Ht - 2 * pad) * 100))]; GV.draw(); if (o2.onMove) o2.onMove(); });
    s.addEventListener('pointerup', function () { if (drag && !moved && o2.onVertex) o2.onVertex(drag); drag = null; });
    s.addEventListener('pointercancel', function () { drag = null; });
    s.addEventListener('click', function (e) { var pe = e.target.closest && e.target.closest('path[data-e]'); if (pe && o2.onEdge && !(e.target.closest('g[data-v]'))) o2.onEdge(+pe.dataset.e); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'n' || e.key === 'N') { var i = GV.sel ? (g.v.indexOf(GV.sel) + 1) % g.v.length : 0; GV.sel = g.v[i]; GV.draw(); e.preventDefault(); return; }
      if (!GV.sel) { if (/^Arrow/.test(e.key) || e.key === 'Enter') { GV.sel = g.v[0]; GV.draw(); e.preventDefault(); } return; }
      if (e.key === 'Enter' || e.key === ' ') { if (o2.onVertex) o2.onVertex(GV.sel); e.preventDefault(); return; }
      var d = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key]; if (d && o2.drag !== false) { var p = GV.pos[GV.sel]; GV.pos[GV.sel] = [M.max(0, M.min(100, p[0] + d[0])), M.max(0, M.min(100, p[1] + d[1]))]; GV.draw(); if (o2.onMove) o2.onMove(); e.preventDefault(); }
    });
    return GV;
  }

  // ================================================================ disc-graph
  var COLORS = ['var(--dv-blue)', 'var(--dv-orange)', 'var(--dv-green)', 'var(--dv-purple)', 'var(--dv-pink)', 'var(--dv-teal)'];
  V.register('disc-graph', function (el, o) {
    o = opt(o, { graph: 'K4', mode: 'degrees', layout: 'given', k: 2 });
    var F = frame(el, o, 'Graph: ' + o.mode), g = graphOf(o.graph), mode = o.mode;
    if (mode === 'iso') return isoViz(el, o, F, g);
    var S = { walk: o.start ? [o.start] : [], col: {}, used: {}, join: null, hl: null, cell: null, msg: '' };
    var wrap = mode === 'matrix' ? mk('div', 'dv-row') : F.box; if (mode === 'matrix') F.box.appendChild(wrap);
    var side = null;
    var GV = GraphView(wrap, g, {
      layout: o.layout, drag: F.edit, label: 'Graph. Drag vertices to move them; N selects a vertex, arrow keys move it' + (mode === 'degrees' ? '.' : ', Enter picks it.'),
      onVertex: F.edit ? clickV : null, onMove: function () { refresh(false); },
      edgeStyle: function (e, i) {
        if (mode === 'walk' || mode === 'hamilton') { var w = S.walk, on = false, c = 0; for (var k = 1; k < w.length; k++) if ((w[k - 1] === e[0] && w[k] === e[1]) || (w[k - 1] === e[1] && w[k] === e[0])) { on = true; c++; } return on ? { color: 'var(--dv-blue)', width: 4.5, label: mode === 'walk' && c > 1 && !F.quiet ? '×' + c : '' } : {}; }
        if (mode === 'euler') return S.used[i] ? { color: 'var(--dv-gray)', dash: '6 5', width: 2, opacity: 0.8 } : { width: 2.6 };
        if (mode === 'color') { var a = S.col[e[0]], b = S.col[e[1]]; if (a !== undefined && a === b) return { color: 'var(--dv-red)', width: 4.5, dash: '7 4' }; if (S.hl && S.hl.indexOf(i) >= 0) return { color: 'var(--dv-red)', width: 4 }; return {}; }
        if (mode === 'planar') return S.cross && S.cross.edges[i] ? { color: 'var(--dv-red)', width: 2.6 } : { width: 2.4 };
        if (mode === 'matrix' && S.hl && S.hl.indexOf(i) >= 0) return { color: 'var(--dv-orange)', width: 4.5 };
        return {};
      },
      vertexStyle: function (x) {
        var d = degOf(g)[x], st = {};
        if (mode === 'degrees') { if (!F.quiet) { st.badge = d; if (d % 2) st.ring = 'var(--dv-gold)'; } if (S.join === x) st.ring = 'var(--dv-orange)'; }
        if (mode === 'walk' || mode === 'hamilton') { var idx = S.walk.indexOf(x); if (idx >= 0) { st.fill = 'var(--dv-okbg)'; st.stroke = 'var(--dv-blue)'; st.sw = 2.5; } if (S.walk[S.walk.length - 1] === x) st.ring = 'var(--dv-blue)'; if (S.walk[0] === x && S.walk.length > 1) st.below = 'start'; }
        if (mode === 'euler') { if (!F.quiet && d % 2) st.ring = 'var(--dv-gold)'; if (S.walk[S.walk.length - 1] === x) { st.fill = 'var(--dv-okbg)'; st.stroke = 'var(--dv-blue)'; st.sw = 3; } if (!F.quiet) st.badge = d; }
        if (mode === 'color' && S.col[x] !== undefined) { st.fill = COLORS[S.col[x]]; st.tcolor = '#fff'; st.stroke = COLORS[S.col[x]]; }
        if (mode === 'matrix' && S.cell && (S.cell[0] === x || S.cell[1] === x)) st.ring = 'var(--dv-orange)';
        return st;
      },
      under: function (layer, G2) { if (mode === 'planar' && S.faces && !F.quiet) S.faces.forEach(function (f, i) { if (f.outer) return; sv('polygon', { points: f.cyc.map(function (x) { return G2.X(G2.pos[x]) + ',' + G2.Y(G2.pos[x]); }).join(' '), style: 'fill:' + COLORS[i % COLORS.length] + ';opacity:.16' }, layer); }); },
      over: function (layer) { if (mode === 'planar' && S.cross) S.cross.pts.forEach(function (p) { sv('circle', { cx: GV.X(p), cy: GV.Y(p), r: 5, style: 'fill:var(--dv-red)' }, layer); }); }
    });
    if (mode === 'matrix') { side = mk('div', 'dv-side'); wrap.appendChild(side); }
    function clickV(x) {
      var adj = adjOf(g);
      if (mode === 'degrees') { if (!S.joinOn) return; if (!S.join) { S.join = x; refresh(); return; } if (S.join !== x) { var ix = -1; g.e.forEach(function (e, i) { if ((e[0] === S.join && e[1] === x) || (e[0] === x && e[1] === S.join)) ix = i; }); if (ix >= 0) g.e.splice(ix, 1); else g.e.push([S.join, x]); } S.join = null; refresh(); return; }
      if (mode === 'walk' || mode === 'hamilton') {
        var w = S.walk, last = w[w.length - 1];
        if (!w.length) { S.walk = [x]; S.msg = ''; refresh(); return; }
        if (!adj[last].some(function (p) { return p[0] === x; })) { S.msg = '<span class="dv-no">' + x + ' is not joined to ' + last + '.</span> '; refresh(); return; }
        if (mode === 'hamilton' && w.indexOf(x) >= 0 && !(x === w[0] && w.length === g.v.length)) { S.msg = '<span class="dv-no">' + x + ' was already visited.</span> '; refresh(); return; }
        S.walk.push(x); S.msg = ''; refresh(); return;
      }
      if (mode === 'euler') {
        if (!S.walk.length) { S.walk = [x]; refresh(); return; }
        var cur = S.walk[S.walk.length - 1], cand = -1; g.e.forEach(function (e, i) { if (cand < 0 && !S.used[i] && ((e[0] === cur && e[1] === x) || (e[1] === cur && e[0] === x))) cand = i; });
        if (cand < 0) { S.msg = '<span class="dv-no">No unused edge from ' + cur + ' to ' + x + '.</span> '; refresh(); return; }
        S.used[cand] = 1; S.walk.push(x); S.msg = ''; refresh(); return;
      }
      if (mode === 'color') { var c = S.col[x]; S.col[x] = c === undefined ? 0 : c + 1 < COLORS.length ? c + 1 : undefined; if (S.col[x] === undefined) delete S.col[x]; S.hl = null; refresh(); return; }
    }
    function classify(w) {
      if (w.length < 2) return '';
      var es = []; for (var k = 1; k < w.length; k++) es.push([w[k - 1], w[k]].sort().join(''));
      var repE = es.length !== new Set(es).size, closed = w[0] === w[w.length - 1], inner = closed ? w.slice(0, -1) : w, repV = inner.length !== new Set(inner).size;
      if (closed) return !repE && !repV && w.length >= 4 ? 'a <b>cycle</b> (closed, no repeated edge or vertex)' : !repE ? 'a <b>closed trail</b> (a circuit: no repeated edge, but a repeated vertex)' : 'a <b>closed walk</b> (an edge is used twice)';
      return !repV ? 'a <b>path</b> (no repeated vertex)' : !repE ? 'a <b>trail</b> (a vertex repeats, but no edge does)' : 'a <b>walk</b> (an edge is used more than once)';
    }
    function faces() { // planar embedding faces from the straight-line drawing (connected, no crossings)
      var P = GV.pos, adj = {}; g.v.forEach(function (x) { adj[x] = []; }); g.e.forEach(function (e) { if (adj[e[0]].indexOf(e[1]) < 0) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); } });
      g.v.forEach(function (x) { adj[x].sort(function (a, b) { return M.atan2(P[a][1] - P[x][1], P[a][0] - P[x][0]) - M.atan2(P[b][1] - P[x][1], P[b][0] - P[x][0]); }); });
      var used = {}, out = [];
      g.v.forEach(function (u) { adj[u].forEach(function (v) { if (used[u + '>' + v]) return; var cyc = [], a = u, b = v, guard = 0; while (!used[a + '>' + b] && guard++ < 200) { used[a + '>' + b] = 1; cyc.push(a); var nb = adj[b], i = nb.indexOf(a), c = nb[(i - 1 + nb.length) % nb.length]; a = b; b = c; } var area = 0; cyc.forEach(function (x, i) { var y = cyc[(i + 1) % cyc.length]; area += P[x][0] * P[y][1] - P[y][0] * P[x][1]; }); out.push({ cyc: cyc, area: area / 2 }); }); });
      // the outer face is the one with the opposite orientation (largest |area| with that sign)
      var oi = 0; out.forEach(function (f, i) { if (f.area < out[oi].area) oi = i; }); out.forEach(function (f, i) { f.outer = i === oi; }); return out;
    }
    function refresh(rebuild) {
      var d = degOf(g), sum = 0; g.v.forEach(function (x) { sum += d[x]; });
      var msg = S.msg || '';
      if (mode === 'planar') {
        var pts = [], ed = {}; for (var i = 0; i < g.e.length; i++) for (var j = i + 1; j < g.e.length; j++) { var a = g.e[i], b = g.e[j]; if (a[0] === b[0] || a[0] === b[1] || a[1] === b[0] || a[1] === b[1]) continue; var p = segX(GV.pos[a[0]], GV.pos[a[1]], GV.pos[b[0]], GV.pos[b[1]]); if (p) { pts.push(p); ed[i] = ed[j] = 1; } }
        S.cross = { pts: pts, edges: ed }; S.faces = !pts.length && connected(g) ? faces() : null;
      }
      GV.draw();
      if (F.quiet) { F.say(mode === 'walk' || mode === 'hamilton' || mode === 'euler' ? (S.walk.length ? 'Sequence: ' + S.walk.join(' → ') : 'Click vertices in turn.') : ''); if (mode === 'walk' || mode === 'hamilton' || mode === 'euler') F.out.el.hidden = false; return; }
      if (mode === 'degrees') { var odd = g.v.filter(function (x) { return d[x] % 2; }); msg += 'Degrees: ' + g.v.map(function (x) { return x + ' ' + d[x]; }).join(', ') + '. Sum = ' + sum + ' = 2 × ' + g.e.length + ' edges (each edge has two ends). ' + odd.length + ' vertices have odd degree' + (odd.length ? ' (ringed)' : '') + ': always an even number.'; }
      if (mode === 'walk') msg += S.walk.length < 2 ? 'Click vertices in turn to build a walk.' : S.walk.join(' → ') + ' (length ' + (S.walk.length - 1) + ') is ' + classify(S.walk) + '.';
      if (mode === 'hamilton') { var w = S.walk, all = new Set(w).size === g.v.length, closedH = w.length === g.v.length + 1 && w[0] === w[w.length - 1]; msg += !w.length ? 'Click vertices in turn; each vertex once.' : w.join(' → ') + '. ' + (closedH ? '<span class="dv-ok">A Hamilton cycle!</span>' : all ? '<span class="dv-ok">A Hamilton path.</span> ' + (adjOf(g)[w[w.length - 1]].some(function (p) { return p[0] === w[0]; }) ? 'Click ' + w[0] + ' to close it into a cycle.' : 'The last vertex is not joined to the first, so it does not close into a cycle.') : 'Visited ' + new Set(w).size + ' of ' + g.v.length + '.'); }
      if (mode === 'euler') { var n2 = Object.keys(S.used).length, cur = S.walk[S.walk.length - 1], oddE = g.v.filter(function (x) { return d[x] % 2; });
        if (!S.walk.length) msg += 'Pick a starting vertex, then click its neighbors to trace edges; each edge may be used once. ' + oddE.length + ' vertices have odd degree' + (oddE.length === 0 ? ': an Euler circuit exists.' : oddE.length === 2 ? ': an Euler path exists, from ' + oddE[0] + ' to ' + oddE[1] + '.' : ': no Euler path exists.');
        else if (n2 === g.e.length) msg += '<span class="dv-ok">Every edge used once:</span> an Euler ' + (S.walk[0] === cur ? 'circuit' : 'path') + '.';
        else { var free = g.e.some(function (e, i) { return !S.used[i] && (e[0] === cur || e[1] === cur); }); msg += 'Used ' + n2 + ' of ' + g.e.length + ' edges. ' + (free ? '' : '<span class="dv-no">Stuck at ' + cur + ':</span> its edges are used up. ' + (oddE.length > 2 ? 'With ' + oddE.length + ' odd vertices no Euler path exists.' : oddE.length === 2 && S.walk[0] !== oddE[0] && S.walk[0] !== oddE[1] ? 'Start at an odd vertex (' + oddE.join(' or ') + ').' : 'Try another route: take bridges last.')); } }
      if (mode === 'color') { var used = new Set(Object.keys(S.col).map(function (x) { return S.col[x]; })), clash = g.e.filter(function (e) { return S.col[e[0]] !== undefined && S.col[e[0]] === S.col[e[1]]; }).length, done = Object.keys(S.col).length === g.v.length;
        msg += (S.msg ? '' : 'Click a vertex to change its color. ') + (used.size ? used.size + ' color' + (used.size === 1 ? '' : 's') + ' used. ' : '') + (clash ? '<span class="dv-no">' + clash + ' clash' + (clash > 1 ? 'es' : '') + ' (dashed red).</span>' : done ? '<span class="dv-ok">A proper coloring.</span>' : ''); }
      if (mode === 'planar') { msg += S.cross.pts.length ? S.cross.pts.length + ' crossing' + (S.cross.pts.length > 1 ? 's' : '') + '. Drag the vertices to remove them.' + (g.e.length > 3 * g.v.length - 6 ? ' (This graph has e = ' + g.e.length + ' > 3v − 6 = ' + (3 * g.v.length - 6) + ', so it can never be drawn without crossings.)' : '') : S.faces ? '<span class="dv-ok">No crossings.</span> v − e + f = ' + g.v.length + ' − ' + g.e.length + ' + ' + S.faces.length + ' = ' + (g.v.length - g.e.length + S.faces.length) + ' (the outside face counts too).' : 'No crossings.'; }
      if (mode === 'matrix') { renderMatrix(); return; }
      F.say(msg);
    }
    function powA(k) { var n = g.v.length, A = g.v.map(function (x) { return g.v.map(function (y) { return g.e.filter(function (e) { return (e[0] === x && e[1] === y) || (e[0] === y && e[1] === x); }).length; }); }), R = A; for (var t = 1; t < k; t++) R = R.map(function (r) { return A[0].map(function (_, j) { return r.reduce(function (s2, v, i) { return s2 + v * A[i][j]; }, 0); }); }); return { A: A, R: R }; }
    function walksList(k, a, b) { var adj = adjOf(g), out = []; (function go(p) { if (out.length > 40) return; if (p.length === k + 1) { if (p[k] === b) out.push(p.slice()); return; } adj[p[p.length - 1]].forEach(function (q) { p.push(q[0]); go(p); p.pop(); }); })([a]); return out; }
    function renderMatrix() {
      var k = S.k || o.k, pw = powA(k), lab = g.v;
      var h = '<p class="dv-small">Adjacency matrix A' + (k > 1 ? ' and its power A<sup>' + k + '</sup>' : '') + '. Click an entry of A<sup>' + k + '</sup>.</p>';
      function table(Mx, clickable, name) { var t = '<table class="dv-mat" aria-label="' + name + '"><tr><th></th>' + lab.map(function (x) { return '<th scope="col">' + x + '</th>'; }).join('') + '</tr>'; Mx.forEach(function (r, i) { t += '<tr><th scope="row">' + lab[i] + '</th>' + r.map(function (v, j) { var sel = clickable && S.cell && S.cell[0] === lab[i] && S.cell[1] === lab[j]; return '<td class="' + (v ? 'on' : '') + (sel ? ' sel' : '') + '">' + (clickable ? '<button type="button" data-i="' + i + '" data-j="' + j + '" aria-label="Walks of length ' + k + ' from ' + lab[i] + ' to ' + lab[j] + '">' + (F.quiet ? '·' : v) + '</button>' : v) + '</td>'; }).join('') + '</tr>'; }); return t + '</table>'; }
      h += (k > 1 ? '<p class="dv-small"><b>A</b></p>' + table(pw.A, false, 'A') + '<p class="dv-small"><b>A<sup>' + k + '</sup></b></p>' : '') + table(pw.R, true, 'A to the power ' + k);
      side.innerHTML = h;
      side.querySelectorAll('button[data-i]').forEach(function (b) { b.addEventListener('click', function () { S.cell = [lab[+b.dataset.i], lab[+b.dataset.j]]; var ws = walksList(k, S.cell[0], S.cell[1]); S.hl = []; if (ws[0]) for (var t = 1; t < ws[0].length; t++) g.e.forEach(function (e, ix) { if ((e[0] === ws[0][t - 1] && e[1] === ws[0][t]) || (e[1] === ws[0][t - 1] && e[0] === ws[0][t])) S.hl.push(ix); }); GV.draw(); renderMatrix(); }); });
      if (S.cell && !F.quiet) { var ws = walksList(k, S.cell[0], S.cell[1]); F.say('Entry (' + S.cell[0] + ', ' + S.cell[1] + ') of A<sup>' + k + '</sup> = <b>' + ws.length + '</b> walks of length ' + k + (ws.length ? ': ' + ws.slice(0, 20).map(function (w) { return w.join('–'); }).join(', ') + (ws.length > 20 ? ', …' : '') + '. Repeated vertices and edges are allowed; the first one is highlighted.' : '.')); }
      else F.say(F.quiet ? '' : 'Entry (i, j) of A<sup>k</sup> counts the walks of length k from i to j.');
    }
    if (F.edit) {
      if (mode === 'degrees') { var jb = btn(F.ctl, 'Join or cut edges', function () { S.joinOn = !S.joinOn; S.join = null; jb.setAttribute('aria-pressed', String(!!S.joinOn)); jb.textContent = S.joinOn ? 'Done joining' : 'Join or cut edges'; refresh(); }); btn(F.ctl, 'Add a vertex', function () { var nm = L26.filter(function (c) { return g.v.indexOf(c) < 0; })[0]; if (!nm) return; g.v.push(nm); GV.pos[nm] = [50 + 30 * (M.random() - 0.5), 50 + 30 * (M.random() - 0.5)]; refresh(); }); }
      if (mode === 'walk' || mode === 'hamilton' || mode === 'euler') { btn(F.ctl, 'Undo', function () { if (mode === 'euler' && S.walk.length > 1) { var a = S.walk[S.walk.length - 2], b = S.walk[S.walk.length - 1]; for (var i = g.e.length - 1; i >= 0; i--) if (S.used[i] && ((g.e[i][0] === a && g.e[i][1] === b) || (g.e[i][1] === a && g.e[i][0] === b))) { delete S.used[i]; break; } } S.walk.pop(); S.msg = ''; refresh(); }); btn(F.ctl, 'Clear', function () { S.walk = []; S.used = {}; S.msg = ''; refresh(); }); }
      if (mode === 'color') {
        btn(F.ctl, 'Try two colors', function () { var adj = adjOf(g), side2 = {}, par = {}, bad = null; g.v.forEach(function (s0) { if (side2[s0] !== undefined || bad) return; side2[s0] = 0; var q = [s0]; while (q.length && !bad) { var x = q.shift(); adj[x].forEach(function (p) { if (bad) return; var y = p[0]; if (side2[y] === undefined) { side2[y] = 1 - side2[x]; par[y] = x; q.push(y); } else if (side2[y] === side2[x]) bad = [x, y]; }); } });
          S.col = {}; S.hl = null;
          if (!bad) { g.v.forEach(function (x) { S.col[x] = side2[x]; }); S.msg = '<span class="dv-ok">Two colors work:</span> no odd cycle. '; }
          else { var pa = [bad[0]], pb = [bad[1]]; while (par[pa[pa.length - 1]] !== undefined) pa.push(par[pa[pa.length - 1]]); while (par[pb[pb.length - 1]] !== undefined) pb.push(par[pb[pb.length - 1]]); var common = pa.filter(function (x) { return pb.indexOf(x) >= 0; })[0], cyc = pa.slice(0, pa.indexOf(common) + 1).concat(pb.slice(0, pb.indexOf(common)).reverse());
            S.hl = []; for (var t = 0; t < cyc.length; t++) { var a = cyc[t], b = cyc[(t + 1) % cyc.length]; g.e.forEach(function (e, i) { if ((e[0] === a && e[1] === b) || (e[1] === a && e[0] === b)) S.hl.push(i); }); }
            S.msg = '<span class="dv-no">Two colors fail:</span> the odd cycle ' + cyc.join('–') + '–' + cyc[0] + ' (red, length ' + cyc.length + ') can’t alternate. '; }
          refresh(); });
        btn(F.ctl, 'Greedy coloring', function () { var ord = o.order || g.v, adj = adjOf(g); S.col = {}; S.hl = null; ord.forEach(function (x) { var c = 0; while (adj[x].some(function (p) { return S.col[p[0]] === c; })) c++; S.col[x] = c % COLORS.length; }); S.msg = 'Greedy in the order ' + ord.join(', ') + ': each vertex takes the first color its colored neighbors don’t use. A different order can use fewer colors. '; refresh(); });
        btn(F.ctl, 'Clear', function () { S.col = {}; S.hl = null; S.msg = ''; refresh(); });
      }
      if (mode === 'matrix') { var ks = mk('label', 'dv-sel', 'power k '), sk = D.createElement('select'); [1, 2, 3, 4].forEach(function (k) { var op = D.createElement('option'); op.value = k; op.textContent = k; if (k === o.k) op.selected = true; sk.appendChild(op); }); ks.appendChild(sk); F.ctl.appendChild(ks); sk.addEventListener('change', function () { S.k = +sk.value; S.cell = null; S.hl = null; GV.draw(); renderMatrix(); }); }
    }
    V.onTheme(function () { GV.draw(); });
    refresh(); return { draw: refresh };
  });
  function isoViz(el, o, F, g) {
    var h = graphOf(o.graph2 || 'C6'), map = {}, pick = null;
    var row = mk('div', 'dv-iso'); F.box.appendChild(row);
    function tri(gr) { var c = 0, a = adjOf(gr); gr.v.forEach(function (x, i) { gr.v.forEach(function (y, j) { gr.v.forEach(function (z, k) { if (i < j && j < k && a[x].some(function (p) { return p[0] === y; }) && a[y].some(function (p) { return p[0] === z; }) && a[x].some(function (p) { return p[0] === z; })) c++; }); }); }); return c; }
    function ds(gr) { var d = degOf(gr); return gr.v.map(function (x) { return d[x]; }).sort(function (a, b) { return b - a; }).join(', '); }
    function hasE(gr, a, b) { return gr.e.some(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); }); }
    var L = GraphView(row, g, { layout: o.layout, drag: F.edit, height: 260, label: 'First graph', onVertex: F.edit ? function (x) { pick = x; draw(); } : null, onMove: function () { draw(); },
      edgeStyle: function (e) { var a = map[e[0]], b = map[e[1]]; if (a === undefined || b === undefined) return {}; return hasE(h, a, b) ? { color: 'var(--dv-green)', width: 4 } : { color: 'var(--dv-red)', width: 3.5, dash: '6 4' }; },
      vertexStyle: function (x) { var st = {}; if (pick === x) st.ring = 'var(--dv-orange)'; if (map[x] !== undefined) st.below = '→ ' + map[x]; return st; } });
    var R2 = GraphView(row, h, { layout: o.layout2 || o.layout, drag: F.edit, height: 260, label: 'Second graph', onVertex: F.edit ? function (y) { if (!pick) return; Object.keys(map).forEach(function (k) { if (map[k] === y) delete map[k]; }); map[pick] = y; pick = null; draw(); } : null, onMove: function () { draw(); },
      edgeStyle: function (e) { var inv = {}; Object.keys(map).forEach(function (k) { inv[map[k]] = k; }); var a = inv[e[0]], b = inv[e[1]]; if (a === undefined || b === undefined) return {}; return hasE(g, a, b) ? { color: 'var(--dv-green)', width: 4 } : { color: 'var(--dv-red)', width: 3.5, dash: '6 4' }; } });
    var tb = mk('div', 'dv-tblwrap'); if (!F.quiet) F.box.appendChild(tb);
    function draw() {
      L.draw(); R2.draw();
      if (F.quiet) return;
      var rows = [['vertices', g.v.length, h.v.length], ['edges', g.e.length, h.e.length], ['degree sequence', ds(g), ds(h)], ['triangles', tri(g), tri(h)]];
      tb.innerHTML = '<table class="dv-tt"><tr><th>invariant</th><th>left</th><th>right</th></tr>' + rows.map(function (r) { var same = String(r[1]) === String(r[2]); return '<tr' + (same ? '' : ' class="dv-diff"') + '><td style="text-align:left">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</table>';
      var diff = rows.filter(function (r) { return String(r[1]) !== String(r[2]); }), full = Object.keys(map).length === g.v.length, good = full && g.e.every(function (e) { return hasE(h, map[e[0]], map[e[1]]); }) && g.e.length === h.e.length;
      F.say((F.edit ? 'Click a vertex on the left, then the vertex on the right it should go to. Matched edges turn green; broken ones red. ' : '') + (good ? '<span class="dv-ok">Isomorphic:</span> this relabeling sends every edge to an edge.' : diff.length ? '<span class="dv-no">Not isomorphic:</span> the ' + diff[0][0] + ' differ' + (diff[0][0] === 'edges' || diff[0][0] === 'vertices' || diff[0][0] === 'triangles' ? '' : 's') + ', and an isomorphism keeps every invariant.' : 'All these invariants match. That does not prove the graphs are isomorphic; you need a relabeling that works.'));
      F.done(good);
    }
    if (F.edit) btn(F.ctl, 'Clear the relabeling', function () { map = {}; pick = null; draw(); });
    draw(); return { draw: draw };
  }

  // ================================================================ disc-graphalgo
  V.register('disc-graphalgo', function (el, o) {
    o = opt(o, { algo: 'kruskal', start: 'A', play: 'step' });
    var F = frame(el, o, { kruskal: 'Kruskal’s algorithm', prim: 'Prim’s algorithm', dijkstra: 'Dijkstra’s algorithm' }[o.algo] || 'Graph algorithm');
    var g = graphOf(o.graph || { v: ['A', 'B', 'C', 'D', 'E'], e: [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 5], ['B', 'D', 10], ['C', 'E', 3], ['D', 'E', 4], ['C', 'D', 8]] });
    g.e.forEach(function (e) { e[2] = +e[2]; });
    var algo = o.algo, S;
    var wrap = mk('div', 'dv-row'); F.box.appendChild(wrap);
    function reset() {
      S = { step: 0, status: {}, comp: {}, tree: [], total: 0, cyc: null, msg: '', dist: {}, done: {}, prev: {}, log: [], inT: {}, order: [] };
      g.v.forEach(function (x) { S.comp[x] = x; S.dist[x] = Infinity; }); S.dist[o.start] = 0; S.inT[o.start] = 1;
      S.sorted = g.e.map(function (e, i) { return i; }).sort(function (a, b) { return g.e[a][2] - g.e[b][2] || (g.e[a][0] + g.e[a][1] < g.e[b][0] + g.e[b][1] ? -1 : 1); });
    }
    function find(x) { while (S.comp[x] !== x) x = S.comp[x]; return x; }
    function pathIn(a, b) { // path between a and b using tree edges
      var adj = {}; g.v.forEach(function (x) { adj[x] = []; }); S.tree.forEach(function (i) { var e = g.e[i]; adj[e[0]].push([e[1], i]); adj[e[1]].push([e[0], i]); });
      var prev = {}, q = [a]; prev[a] = null; while (q.length) { var x = q.shift(); adj[x].forEach(function (p) { if (prev[p[0]] === undefined) { prev[p[0]] = [x, p[1]]; q.push(p[0]); } }); }
      var out = [], v = [b]; var c = b; while (prev[c]) { out.push(prev[c][1]); c = prev[c][0]; v.push(c); } return { edges: out, verts: v.reverse() };
    }
    function ew(i) { var e = g.e[i]; return e[0] + e[1] + ' (' + e[2] + ')'; }
    function finished() { return algo === 'dijkstra' ? g.v.every(function (x) { return S.done[x] || S.dist[x] === Infinity; }) || g.v.filter(function (x) { return !S.done[x] && S.dist[x] < Infinity; }).length === 0 : S.tree.length === g.v.length - 1; }
    function kruskalNext() { for (var k = 0; k < S.sorted.length; k++) if (!S.status[S.sorted[k]]) return S.sorted[k]; return -1; }
    function primCands() { return g.e.map(function (e, i) { return i; }).filter(function (i) { var e = g.e[i]; return !!S.inT[e[0]] !== !!S.inT[e[1]]; }); }
    function primNext() { var c = primCands(); c.sort(function (a, b) { return g.e[a][2] - g.e[b][2]; }); return c.length ? c[0] : -1; }
    function dijNext() { var best = null; g.v.forEach(function (x) { if (!S.done[x] && S.dist[x] < Infinity && (best === null || S.dist[x] < S.dist[best] || (S.dist[x] === S.dist[best] && x < best))) best = x; }); return best; }
    function doStep(choice) {
      if (finished()) return;
      if (algo === 'kruskal') {
        var i = choice !== undefined ? choice : kruskalNext(); if (i < 0) return; var e = g.e[i], a = find(e[0]), b = find(e[1]);
        if (choice !== undefined && i !== kruskalNext()) { var nx = kruskalNext(), ne = g.e[nx], closes = find(ne[0]) === find(ne[1]); if (find(e[0]) === find(e[1])) { var cy = pathIn(e[0], e[1]); S.msg = '<span class="dv-no">' + e[0] + e[1] + ' closes the cycle ' + cy.verts.join('–') + '–' + e[0] + '.</span> '; S.cyc = cy.edges.concat([i]); } else S.msg = '<span class="dv-no">Not yet:</span> ' + ew(nx) + ' is cheaper' + (closes ? ' (and must be checked, then skipped, first)' : '') + '. '; return; }
        if (a === b) { var cy2 = pathIn(e[0], e[1]); S.status[i] = 'no'; S.cyc = cy2.edges.concat([i]); S.msg = ew(i) + ': <span class="dv-no">skip</span>, it would close the cycle ' + cy2.verts.join('–') + '–' + e[0] + '. '; }
        else { S.comp[a] = b; S.status[i] = 'ok'; S.tree.push(i); S.total += e[2]; S.cyc = null; S.msg = ew(i) + ': <span class="dv-ok">add</span>. '; }
      } else if (algo === 'prim') {
        var j = choice !== undefined ? choice : primNext(); if (j < 0) return;
        if (choice !== undefined && j !== primNext()) { var c = primCands(); S.msg = c.indexOf(j) < 0 ? '<span class="dv-no">' + g.e[j][0] + g.e[j][1] + ' does not leave the tree.</span> ' : '<span class="dv-no">Not the cheapest:</span> ' + ew(primNext()) + ' is cheaper. '; return; }
        var e2 = g.e[j]; S.inT[e2[0]] = S.inT[e2[1]] = 1; S.status[j] = 'ok'; S.tree.push(j); S.total += e2[2]; S.msg = ew(j) + ': the cheapest edge leaving the tree. ';
        g.e.forEach(function (f, k) { if (!S.status[k] && S.inT[f[0]] && S.inT[f[1]]) S.status[k] = 'no'; });
      } else {
        var u = choice !== undefined ? choice : dijNext(); if (u === null || u === undefined) return;
        if (choice !== undefined && u !== dijNext()) { S.msg = S.done[u] ? '<span class="dv-no">' + u + ' is already settled.</span> ' : '<span class="dv-no">' + u + ' is not the closest unsettled vertex:</span> ' + dijNext() + ' is at ' + S.dist[dijNext()] + '. '; return; }
        S.done[u] = 1; S.order.push(u); var ch = [];
        g.e.forEach(function (f) { var v = f[0] === u ? f[1] : f[1] === u ? f[0] : null; if (v === null || S.done[v]) return; var nd = S.dist[u] + f[2]; if (nd < S.dist[v]) { ch.push(v + ': ' + (S.dist[v] === Infinity ? '∞' : S.dist[v]) + ' → ' + nd); S.dist[v] = nd; S.prev[v] = u; } });
        S.msg = 'Settle <b>' + u + '</b> at ' + S.dist[u] + '. ' + (ch.length ? 'Update ' + ch.join('; ') + '. ' : 'No distances improve. ');
      }
    }
    var GV = GraphView(wrap, g, {
      layout: 'given', drag: false, height: 280, label: 'Weighted graph',
      onEdge: F.edit && o.play === 'learner' && algo !== 'dijkstra' ? function (i) { doStep(i); refresh(); } : null,
      onVertex: F.edit && o.play === 'learner' && algo === 'dijkstra' ? function (x) { doStep(x); refresh(); } : null,
      edgeStyle: function (e, i) {
        var st = { label: e[2] };
        if (algo === 'dijkstra') { var tr = S.done[e[0]] && S.prev[e[0]] === e[1] || S.done[e[1]] && S.prev[e[1]] === e[0]; if (tr && finished()) return { label: e[2], color: 'var(--dv-green)', width: 4.5 }; if (tr) return { label: e[2], color: 'var(--dv-blue)', width: 3.5 }; return st; }
        if (S.status[i] === 'ok') return { label: e[2], color: 'var(--dv-green)', width: 4.5, lcolor: 'var(--dv-green)' };
        if (S.cyc && S.cyc.indexOf(i) >= 0) return { label: e[2], color: 'var(--dv-red)', width: 3.5, dash: S.status[i] === 'no' ? '7 4' : null, lcolor: 'var(--dv-red)' };
        if (S.status[i] === 'no') return { label: e[2], color: 'var(--dv-gray)', width: 2, dash: '6 5' };
        return st;
      },
      vertexStyle: function (x) {
        if (algo === 'dijkstra') { var d = S.dist[x], st = { tag: (F.quiet && !S.done[x] && x !== o.start) ? '' : d === Infinity ? '∞' : String(d), tagColor: S.done[x] ? 'var(--dv-green)' : 'var(--dv-purple)' }; if (F.quiet && x === o.start) st.tag = 'start'; if (S.done[x]) { st.fill = 'var(--dv-okbg)'; st.stroke = 'var(--dv-green)'; st.sw = 2.5; } if (x === o.start) st.ring = 'var(--dv-gold)'; return st; }
        if (algo === 'prim') return S.inT[x] ? { fill: 'var(--dv-okbg)', stroke: 'var(--dv-green)', sw: 2.5 } : {};
        var r = find(x), members = g.v.filter(function (y) { return find(y) === r; }); return members.length > 1 ? { fill: COLORS[g.v.indexOf(r) % COLORS.length], tcolor: '#fff', stroke: COLORS[g.v.indexOf(r) % COLORS.length] } : {};
      }
    });
    var side = mk('div', 'dv-side'); if (!(F.quiet && !F.edit)) wrap.appendChild(side);
    function refresh() {
      GV.draw();
      if (F.quiet && !F.edit) { F.say(''); return; }
      var h = '';
      if (algo === 'kruskal') h = '<table class="dv-vals" aria-label="Edges sorted by weight"><tr><th style="text-align:left">edge</th><th>weight</th><th style="text-align:left">status</th></tr>' + S.sorted.map(function (i) { var st = S.status[i]; return '<tr class="' + (i === kruskalNext() && !finished() ? 'hi' : '') + '"><td style="text-align:left">' + g.e[i][0] + g.e[i][1] + '</td><td>' + g.e[i][2] + '</td><td style="text-align:left">' + (st === 'ok' ? '<span class="dv-ok">added</span>' : st === 'no' ? '<span class="dv-no">skipped</span>' : finished() ? '<span class="dv-small">not needed</span>' : '') + '</td></tr>'; }).join('') + '</table>';
      else if (algo === 'prim') h = '<p class="dv-small">Tree: ' + g.v.filter(function (x) { return S.inT[x]; }).join(', ') + '</p><p class="dv-small">Edges leaving the tree: ' + (primCands().map(ew).join(', ') || 'none') + '</p>';
      else { var un = g.v.filter(function (x) { return !S.done[x]; }).sort(function (a, b) { return S.dist[a] - S.dist[b]; }); h = '<table class="dv-vals"><tr><th style="text-align:left">vertex</th><th>distance</th><th style="text-align:left">via</th></tr>' + g.v.map(function (x) { var hide = F.quiet && !S.done[x]; return '<tr class="' + (x === dijNext() && !finished() ? 'hi' : '') + '"><td style="text-align:left">' + x + (S.done[x] ? ' ✓' : '') + '</td><td>' + (hide ? '?' : S.dist[x] === Infinity ? '∞' : S.dist[x]) + '</td><td style="text-align:left">' + (S.prev[x] || '') + '</td></tr>'; }).join('') + '</table>' + (F.quiet ? '' : '<p class="dv-small">Settled in order: ' + (S.order.join(', ') || '—') + '</p>'); }
      side.innerHTML = h;
      var tail = finished() ? (algo === 'dijkstra' ? '<span class="dv-ok">Done.</span> ' + (F.quiet ? '' : 'Shortest distances from ' + o.start + ': ' + g.v.map(function (x) { return x + ' ' + S.dist[x]; }).join(', ') + '. Green edges form the shortest-path tree.') : '<span class="dv-ok">Done:</span> ' + (g.v.length - 1) + ' edges form a minimum spanning tree' + (F.quiet ? '.' : ' of total weight <b>' + S.total + '</b>.'))
        : (algo === 'dijkstra' ? 'Next: settle the unsettled vertex with the smallest distance (highlighted). A vertex is final only when it is settled.' : algo === 'kruskal' ? 'Next: the cheapest unchecked edge (highlighted). Add it unless it closes a cycle.' : 'Next: the cheapest edge with exactly one end in the tree.') + (F.quiet || algo === 'dijkstra' ? '' : ' Total so far: ' + S.total + '.');
      F.say(S.msg + tail);
    }
    if (F.edit) {
      if (o.play !== 'learner') { btn(F.ctl, 'Step', function () { doStep(); refresh(); }, 'pri'); btn(F.ctl, 'Finish', function () { var t = 0; while (!finished() && t++ < 100) doStep(); refresh(); }); }
      else F.box.appendChild(mk('p', 'dv-legend', algo === 'dijkstra' ? 'Click the vertex to settle next.' : 'Click the edge to consider next.'));
      btn(F.ctl, 'Start over', function () { reset(); refresh(); });
    }
    reset(); refresh(); return { draw: refresh };
  });
})(window, document);
