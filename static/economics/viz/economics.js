/* Economics Ladder: the shared visual kit (names prefixed ec-), registered on window.MathLadder.viz.
   Load order: math/viz/core.js (+ viz.css), then this file (+ economics/viz/economics.css). The engine loads both for any
   visual whose name starts with ec- (MathLadder.needViz). Vanilla JS, no libraries, no network.

   Embed:  <div class="ml-viz" data-viz="ec-market" data-opts='{"demand":{"a":20,"b":2},"supply":{"c":-4,"d":2}}' aria-label="…"></div>

   COMMON OPTIONS (every graph visual)
     quiet: true  (alias readout: false)  hide every readout, equilibrium or optimum value, area value, verdict and "correct"
                  feedback that could give a problem's answer away. Axes, tick values, curve names and marks stay.
     interactive: false   a still picture (no dragging, sliders or buttons)
     marks: [{ label: 'A', x: 20, y: 6 }]   lettered points (x is the horizontal value)
     xMax, yMax, xLabel, yLabel, money: true (dollar signs on price ticks), caption (HTML under the visual), task (a line above),
     label (aria-label of the whole visual when the element has none), height (canvas px)
     step: the step to start on, for visuals with a sequence (Prev / Next buttons walk it)
   CONVENTIONS: price (or a rate, wage, price level) up, quantity across. Demand { a, b } is Qd = a − bP, or { p0, s } for
     P = p0 − sQ; supply { c, d } is Qs = c + dP, or { p0, s } for P = p0 + sQ. Shifts are horizontal, in quantity units
     (+ = right = an increase). Old curves dashed, new curves with subscripts (D₁ → D₂). Colors: demand side blue, supply side
     orange, averages purple/teal, long-run verticals green, consumer surplus blue, producer surplus orange, revenue and
     profit gold, losses and government cost red, deadweight loss a hatched gray area labeled DWL.
   ACCESSIBILITY: each canvas has role="img" and a live aria-label that states the picture in words; each draggable handle has a
     focusable proxy (Tab reaches it; arrow keys move it, Shift + arrow moves farther); readouts are aria-live. No animation
     runs by itself; steps animate briefly when pressed, and not at all for visitors who prefer less motion.
   MODELS: the math is in pure functions on MathLadder.econ (generators may call them): curve(spec, 'D'|'S') -> {p0, m, P(q),
     Q(p), shift(dq), up(dp)}, equilibrium(D, S), cs(D, price, q), ps(S, price, q), surplus(D, S, q), midpoint(q1, p1, q2, p2),
     pointElasticity(L, q), tax(D, S, t), subsidy(D, S, s), ceiling(D, S, p), floor(D, S, p), world(D, S, pw),
     tariff(D, S, pw, t), quota(D, S, pw, q), doubleShift(D, S, dD, dS), cost({F, a, b, c}), costRows(rows),
     monopoly({p0, s}, {m0, m1}, F), monopsony({w0, s}, {a, b}, minWage), lorenz(shares), gini(shares),
     bracketTax(brackets, income), rounds(first, ratio, n), bond(face, coupon, years, rate), pv(kind, amount, t, r),
     game(payoffs), backward(tree), forexMirror(Dd, Sd), utility(spec), demand(U, p1, p2, I), expend(U, p1, p2, u),
     cdDemand(a, b, p1, p2, I), edgeEq(aA, aB, xA, yA, X, Y), contractY(aA, aB, X, Y, x), longRunModel(o), fr(x), money(x).

   THE VISUALS AND THEIR OPTIONS
   ec-sort        card sorter. bins: ["Land", …]; cards: [{ text, bin (index), why }]; shuffle: true; check: true (Check button;
                  never in quiet mode); columns (bins per row); grid2x2: { rows: [r1, r2], cols: [c1, c2] } lays out four bins in
                  reading order (row 1 col 1, row 1 col 2, row 2 col 1, row 2 col 2). Drag (mouse, pen), tap a card then a bin
                  (touch), or focus a card and press a bin's number (0 puts it back).
   ec-ppc         goods: ["Robots", "Wheat"]; shape: 'bowed' | 'linear'; max: [x, y] (intercepts); points: [[0, 60], [10, 55], …]
                  (a table PPC); point: [x, y] (draggable; reports efficient / inefficient / unattainable); steps: true (the
                  opportunity-cost staircase); showCost: true (cost of one more x at the point); shift: { x: 1.25, y: 1 } (scale
                  factors of the new curve). A button moves an inside point to the curve ("idle resources back to work").
   ec-trade       producers: ["Ana", "Ben"]; goods: ["Bread", "Shirts"]; table: [[6, 3], [4, 4]] (rows = producers);
                  mode: 'output' (units per period) | 'input' (hours per unit; hours: 12 is the time available); showOC: true;
                  specialize: false; terms: units of good 2 per unit of good 1 (default: halfway between the two opportunity
                  costs); amount: units of good 1 traded; split: 0.5 (each producer's time on good 1 before trade).
                  quiet hides the opportunity-cost columns and the comparative-advantage sentence.
   ec-marginal    mode: 'benefit-cost' — rows: [{ q, tb, tc }], sunk: 50 (a toggle adds it to every total cost; the stopping
                  point does not move). mode: 'utility' — goods: [{ name, price, tu: [TU of 1, 2, … units] }], income (two goods:
                  "Spend on the next unit" buys the higher MU per dollar). mode: 'product' — rows: [{ L, TP }]. quiet hides
                  marginal values, net benefit and the stop marker.
   ec-market      demand, supply; mode: 'plain' | 'move' (drag a point along D: change in quantity demanded) | 'shift'
                  (determinant buttons) | 'both' (two panels: a price change and an income change) | 'double';
                  determinants: [{ label, curve: 'D'|'S', dir: 1|-1, size, why }]; shift: { D: 6, S: -4 } (with plain/shift
                  mode, Prev/Next walks start → shift → new equilibrium; step: 0–2); double: true (both shift; the ambiguous
                  variable's range is a gold band, hidden in quiet mode); price: 3 (a draggable price line); quantity: 8
                  (forced quantity for DWL); show: ['eq', 'cs', 'ps', 'dwl', 'gaps', 'equations'].
   ec-elasticity  mode: 'line' (demand, points: [[q1, p1], [q2, p2]] draggable along the line, midpoint method written out, revenue
                  rectangles, a total-revenue panel, elastic / inelastic stretches) | 'compare' (point: [q, p], slopes: [1, 0.25],
                  dp: price change) | 'extremes' (price, quantity) | 'supply' (supply; buttons for lines through the origin, from
                  the price axis, from the quantity axis, vertical) | 'constant' (Q = A·P^(−k): k, A, price, pmin, pmax;
                  a log–log toggle). show: ['midpoint', 'tr', 'trcurve', 'regions', 'point'].
   ec-intervention demand, supply; mode: 'ceiling' | 'floor' | 'tax' | 'subsidy' | 'world' | 'tariff' | 'quota'; level (legal
                  price, tax, subsidy or world price); tariff; quota; on: 'sellers' | 'buyers' (who sends the check);
                  show: ['cs', 'ps', 'revenue', 'dwl', 'incidence', 'gaps']; elasticities: true (εD, εS, the incidence formula,
                  and a small DWL-against-tax curve). Ceiling, floor and world-price lines are draggable.
   ec-costcurves  cost: { F, a, b, c } (TC = F + aq − bq² + cq³, b² < 3ac) or rows: [{ q, tc }] (must start at q = 0);
                  show: ['tc', 'vc', 'mc', 'atc', 'avc', 'afc'] (any of tc / vc adds a totals panel); q (draggable marker);
                  price (P = MR line with a slider: MR = MC quantity, profit or loss rectangle, break-even and shutdown prices);
                  supply: true (MC above min AVC thickened); shift: { F: 50 } or { a: 2 } … (old curves dashed only where they
                  move). mode: 'longrun': plants: [12, 25, 55, 90] (each plant's tangency quantity), mes: 40, q2: 70, cmin: 10,
                  econ, dis, kappa (a stylized model: LRATC is the exact lower envelope of the SRATC curves; see lrModel).
   ec-firmmarket  cost: { F, a, b, c } (default F 100, a 10, b 1, c 0.1: min ATC $20 at q = 10); demand: { a, b } (market,
                  Qd = a − bP); story: 'demandUp' | 'demandDown' | 'costDown'; shift (demand shift, default 200); cut (cost cut
                  in a, default 4); step; show: ['profit', 'efficiency', 'firms']. Market supply is n copies of the firm's MC above
                  min AVC, so the firm count (Q ÷ q) and both panels always agree.
   ec-monopoly    demand: { p0, s } (P = p0 − sQ); mc: { m0, m1 } (MC = m0 + m1·Q); atc: { F } (ATC = F/Q + m0 + m1·Q/2, consistent
                  with MC); mode: 'basic' | 'mr' (q: units sold now; gain and loss rectangles) | 'natural' (regulation buttons:
                  P = MC, P = ATC) | 'perfect' | 'third' (markets: [{ p0, s }, { p0, s }], shared constant MC) | 'monocomp'
                  (step: 0 short run, 1 long run) | 'twopart'; show: ['profit', 'cs', 'dwl', 'competitive'].
   ec-payoff      preset: 'pd' | 'cartel' | 'coordination' | 'chicken' | 'publicgoods' | 'pennies'; or players, rows, cols,
                  payoffs: [[[a, b], [c, d]], …] (row player first, up to 3×3); underline: true (learners tap payoffs, then Check;
                  the default unless show is given); show: ['best', 'dominant', 'nash']; mixed: true (2×2: sliders for p and q, and
                  each player's expected-payoff lines); repeated: true (delta: discount factor; grim-trigger comparison, δ*).
   ec-gametree    preset: 'entry' | 'stackelberg' | 'ultimatum'; or players: ['A', 'B'], tree: { player: 0, moves: [{ label,
                  to: {…} } | { label, pay: [a, b] }] } (player as an index or a name); solve: true (Prev/Next backward
                  induction); step; threat: [depth, move] (the entry preset has one: a "Show the threat" button).
   ec-factor      mode: 'firm' (rows: [{ L, TP }], price or mr: [MR per worker], wage (slider), market: true adds the labor
                  market panel) | 'shift' (demand, supply, events) | 'leastcost' (inputs: [{ name, price, mp: […] }], budget) |
                  'monopsony' (supply: { w0, s }, mrp: { a, b }, minWage (slider and toggle)).
   ec-externality demand, supply; mode: 'negative' | 'positive-consumption' | 'positive-production' | 'abatement';
                  external: { k, m } (marginal external cost or benefit = k + m·Q); tax / subsidy (slider);
                  abatement: mb: { p0, s }, mc: { m0, m1 }, level (draggable, percent of pollution cut).
   ec-lorenz      shares: [3, 8, 14, 23, 52] (bottom group first; any total; draggable, kept in order and summing to 100%);
                  compare: […]; labels: ["Country A", "Country B"]; show: ['table', 'areas', 'gini'].
   ec-circularflow sectors: ['government', 'financial', 'foreign']; label: true (numbered arrows and a list to label, then
                  Check); follow: true ("Follow a dollar": a dot travels the money loop; step by step with reduced motion).
   ec-valueadded  stages: [{ name, what, sale }]; countAll: false (toggle: add every sale instead).
   ec-basket      mode: 'cpi' (goods: [{ name, qty, prices: { 2022: 2.5, … } }], base) | 'gdp' (goods: [{ name, prices: {…},
                  qtys: {…} }], base) | 'real' (index: { year: value }, amounts: [{ label, year, value }], base). years optional.
                  quiet hides the computed columns.
   ec-laborforce  counts: { employed, unemployed, students, retired, caregivers, discouraged }; perIcon: 2; scenarios: true;
                  show: ['rate', 'participation', 'epop'].
   ec-cycle       preset: 'stylized' or series: [real GDP values], potential: [values]; recessions: [[i0, i1], …];
                  show: ['phases', 'gap', 'trend']; t (marker position); marks.
   ec-adas        mode: 'shock' (events: [{ label, curve: 'AD'|'SRAS', dir, size, why }]) | 'slope' | 'adjust' (start:
                  'recession' | 'inflation', size, step) | 'policy' (start, amount) | 'growth' (size); yf (potential output,
                  default 10); ad: { shift }, sras: { shift }; show: ['gap', 'labels', 'lras'].
   ec-multiplier  mode: 'spending' | 'tax' | 'balanced' | 'bank'; first: 100; mpc: 0.8; rr: 0.1; rounds: 12; show: ['total', 'limit'].
   ec-taxbrackets brackets: [[0, 0.10], [20000, 0.20], [60000, 0.30]] (threshold, rate) or preset: 'progressive' | 'proportional' |
                  'regressive' (a fixed amount: fixed: 3000); income; max (top of the income slider); show: ['average',
                  'marginal', 'chart']. Use made-up schedules, never a real year's tables.
   ec-bond        face: 1000; coupon: 0.05; years: 5; rate: 0.04; mode: 'bond' | 'pv' (pv: { kind: 'single' | 'annuity' |
                  'perpetuity', amount, t }).
   ec-tacct       rr: 0.1; start: { deposits, reserves, loans, securities, equity }; currency (held by the public); amount (cash
                  deposited); bonds (size of a central bank trade); steps: ['deposit', 'lend', 'spend', 'buy', 'sell']; chain: 3
                  (most banks shown); fill: true (type the new entries, then Check).
   ec-moneymarket mode: 'money' (ms, md: { shift }, events) | 'chain' (direction: 'expansionary' | 'contractionary', step) |
                  'reserves' (ample: true | false, reserves (supply), iorb). A stylized reserve demand that flattens at IORB.
   ec-loanable    mode: 'market' (supply, demand, events, deficitAs: 'demand' | 'supply') | 'identity' (values: { sp, tg, i }:
                  net exports follow from S_private + (T − G) = I + NX).
   ec-phillips    un: 5 (natural rate, %); expected: 2 (%); mode: 'linked' (AD–AS and the Phillips curves, matching points) |
                  'short' (a draggable point and shifts) | 'long' (step: expectations catch up while policy holds u below un).
   ec-forex       pair: ["dollar", "euro"]; rate: 0.9 (starting euros per dollar); events: [{ label, d: [shift of dollar demand,
                  shift of dollar supply], why }]; mirror: true (the euro market, derived exactly from the dollar market:
                  demand for euros = supply of dollars × rate, at the reciprocal price); nx: true (net exports and AD note).
   ec-choice      income; prices: [p1, p2]; utility: { type: 'cobbdouglas' (a, b) | 'substitutes' (a, b) | 'complements' (a, b) |
                  'quasilinear' (f: 'sqrt' | 'ln', k) }; bundle (draggable); levels; budgetOnly: true; change: { p1, p2, income }
                  (old line dashed); ration (most x allowed); tax: { t, above } (per-unit tax on x above a quantity; negative t is a
                  subsidy); offer: 'income' | 'price' (offer curve and a linked Engel or demand curve); goods: [name x, name y];
                  mode: 'goods' | 'labor' (hours: 24, wage, nonlabor) | 'intertemporal' (endowment: [m1, m2], rate) | 'revealed'
                  (budgets: [{ p: [p1, p2], I }, …], choices: [[x, y], [x, y]] draggable along their lines).
   ec-slutsky     utility, income, prices, newP1; method: 'slutsky' | 'hicks'; preset: 'normal' | 'inferior' | 'giffen'
                  (the last two use U = α·ln(x − g1) − β·ln(g2 − y), Haagsma 2012, checked numerically); cv: true (p₂ = 1;
                  compensating and equivalent variation and the change in consumer surplus).
   ec-isoquant    f: { type: 'cobbdouglas', A, alpha (capital), beta (labor) } (Q = A·K^α·L^β) | { type: 'substitutes' | 'fixed',
                  a (labor), b (capital) }; w; r; q; ray: true (isoquants for q, 2q, 3q along a ray); path: true (expansion path);
                  bundle (draggable: its output, cost and MRTS).
   ec-edgeworth   total: [X, Y]; endow: [xA, yA] (draggable); a: [aA, aB] (U = x^a·y^(1−a)); price (of x in units of y; slider,
                  and a button that finds the equilibrium); show: ['lens', 'contract', 'demands'].
   ec-risk        u: 'sqrt' | 'ln' | 'linear' (W/10) | 'convex' (W²/1000); outcomes: [w1, w2]; p (chance of w1); insurance: true
                  (premium, coverage sliders; the fair premium and the most worth paying for full cover).                       */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  var M = Math, TAU = 2 * M.PI;
  var fm = V ? V.fmt : function (v, d) { var s = (+v).toFixed(d === undefined ? 2 : d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); if (s === '-0') s = '0'; return s.replace('-', '−'); };

  // ---------- small helpers ----------
  function num(v, d) { var x = typeof v === 'string' && v !== '' ? +v : v; return typeof x === 'number' && isFinite(x) ? x : d; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o) if (o[k] !== undefined && o[k] !== null) r[k] = o[k]; return r; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function has(list, k) { return (list || []).indexOf(k) >= 0; }
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  function sub(n) { return String(n).split('').map(function (ch) { return SUB[ch] || ch; }).join(''); }
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function ratio(x, maxD) { if (!isFinite(x)) return null; for (var q = 1; q <= (maxD || 12); q++) { var p = M.round(x * q); if (M.abs(p / q - x) < 1e-9 * M.max(1, M.abs(x))) return [p, q]; } return null; }
  /* fr(x): an exact fraction when x is one with a small denominator (3/4, −5/2), else a decimal */
  function fr(x, d) { var r = ratio(x, 12); if (!r) return fm(x, d == null ? 2 : d); if (r[1] === 1) return fm(r[0], 0); return (r[0] < 0 ? '−' : '') + M.abs(r[0]) + '/' + r[1]; }
  /* money(x): $4.50, $12, −$3 (two decimals when there are cents) */
  function money(x, d) { var a = M.abs(x), s = M.abs(a - M.round(a)) < 1e-9 ? fm(a, 0) : a.toFixed(d == null ? 2 : d); s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (x < -1e-12 ? '−' : '') + '$' + s; }
  function big(x, d) { var s = fm(x, d == null ? 2 : d), p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function pct(x, d) { return fm(x * 100, d == null ? 1 : d) + '%'; }
  function seeded(seed) { var a = seed >>> 0 || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ t >>> 15, t | 1); t ^= t + M.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = M.imul(h, 16777619); } return h >>> 0; }
  /* root of f on [a, b] by bisection (f(a), f(b) of opposite signs) */
  function bisect(f, a, b, n) { var fa = f(a); for (var i = 0; i < (n || 80); i++) { var m = (a + b) / 2, fmv = f(m); if ((fmv <= 0) === (fa <= 0)) { a = m; fa = fmv; } else b = m; } return (a + b) / 2; }
  /* maximize a unimodal g on [a, b] (golden section) */
  function golden(g, a, b, n) { var r = (M.sqrt(5) - 1) / 2, c = b - r * (b - a), d = a + r * (b - a), gc = g(c), gd = g(d); for (var i = 0; i < (n || 90); i++) { if (gc < gd) { a = c; c = d; gc = gd; d = a + r * (b - a); gd = g(d); } else { b = d; d = c; gd = gc; c = b - r * (b - a); gc = g(c); } } return (a + b) / 2; }
  /* maximize g on [a, b]: a coarse scan, then golden section around the best sample (safe for -Infinity outside a domain) */
  function argmax(g, a, b, n) {
    n = n || 400; var bi = 0, bv = -Infinity;
    for (var i = 0; i <= n; i++) { var v = g(a + (b - a) * i / n); if (v > bv) { bv = v; bi = i; } }
    var lo = a + (b - a) * M.max(0, bi - 1) / n, hi = a + (b - a) * M.min(n, bi + 1) / n, x = golden(g, lo, hi, 70);
    var ends = [a, b, x]; return ends.reduce(function (best, t) { return g(t) > g(best) + 1e-12 ? t : best; }, x);
  }
  function niceStep(span, target) { var raw = span / (target || 6), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7 ? 5 : 10) * m; }

  // ---------- economics: the models every ec- visual draws (pure functions; MathLadder.econ) ----------
  /* Linear curves are kept in inverse form P = p0 + m·Q (m < 0 for demand, m > 0 for supply).
     Demand { a, b } means Qd = a − bP; { p0, s } means P = p0 − sQ. Supply { c, d } means Qs = c + dP; { p0, s } means
     P = p0 + sQ. A horizontal shift by dq (in quantity units; + is right) keeps the slope: P = p0 − m·dq + m·Q. */
  function line(p0, m) {
    var L = { p0: p0, m: m };
    L.P = function (q) { return p0 + m * q; };
    L.Q = function (p) { return (p - p0) / m; };
    L.shift = function (dq) { return line(p0 - m * (dq || 0), m); };
    L.up = function (dp) { return line(p0 + (dp || 0), m); };
    L.qform = function () { return { a: -p0 / m, b: -1 / m, c: -p0 / m, d: 1 / m }; }; // Q = a − bP (demand) or Q = c + dP (supply)
    return L;
  }
  function curve(spec, kind) {
    spec = spec || {};
    if (spec.p0 != null) { var s = M.abs(num(spec.s, 1)) || 1; return line(num(spec.p0, 10), kind === 'D' ? -s : s); }
    if (kind === 'D') { var a = num(spec.a, 20), b = M.abs(num(spec.b, 2)) || 1; return line(a / b, -1 / b); }
    var c = num(spec.c, -4), d = M.abs(num(spec.d, 2)) || 1; return line(-c / d, 1 / d);
  }
  function equilibrium(Dm, Sp) { var q = (Dm.p0 - Sp.p0) / (Sp.m - Dm.m); return { q: q, p: Dm.P(q) }; }
  /* consumer surplus: area between demand and the price paid, from 0 to q */
  function cs(Dm, price, q) { return (Dm.p0 - price) * q + Dm.m * q * q / 2; }
  /* producer surplus: area between the price received and supply (supply sits on the axis, P = 0, below its quantity intercept) */
  function ps(Sp, price, q) {
    if (q <= 0) return 0;
    if (Sp.p0 >= 0) return (price - Sp.p0) * q - Sp.m * q * q / 2;
    var q0 = M.min(q, -Sp.p0 / Sp.m); // supply is at price 0 up to q0
    return price * q0 + (price - Sp.p0) * (q - q0) - Sp.m * (q * q - q0 * q0) / 2;
  }
  function supplyP(Sp, q) { return M.max(0, Sp.P(q)); }
  /* total surplus (area between demand and supply) when quantity q is traded, and the deadweight loss against equilibrium */
  function surplus(Dm, Sp, q) {
    var e = equilibrium(Dm, Sp); if (q == null) q = e.q;
    var ts = function (x) { return (Dm.p0 * x + Dm.m * x * x / 2) - costArea(Sp, x); };
    return { q: q, total: ts(q), max: ts(e.q), dwl: ts(e.q) - ts(q), cs: cs(Dm, e.p, e.q), ps: ps(Sp, e.p, e.q), eq: e };
  }
  function costArea(Sp, q) { return -ps(Sp, 0, q); } // ∫0^q max(0, S(x)) dx
  function midpoint(q1, p1, q2, p2) { var dq = (q2 - q1) / ((q1 + q2) / 2), dp = (p2 - p1) / ((p1 + p2) / 2); return { dq: dq, dp: dp, e: dq / dp }; }
  function pointE(L, q) { return (1 / L.m) * (L.P(q) / q); }
  function tax(Dm, Sp, t) {
    var e = equilibrium(Dm, Sp), q = M.max(0, (Dm.p0 - Sp.p0 - t) / (Sp.m - Dm.m)), pb = Dm.P(q), pS = pb - t;
    return { q: q, pb: pb, ps: pS, rev: t * q, dwl: t * (e.q - q) / 2, cs: cs(Dm, pb, q), psur: ps(Sp, pS, q), buyer: t ? (pb - e.p) / t : 0, seller: t ? (e.p - pS) / t : 0, eq: e };
  }
  function subsidy(Dm, Sp, s) {
    var e = equilibrium(Dm, Sp), q = (Dm.p0 - Sp.p0 + s) / (Sp.m - Dm.m), pb = Dm.P(q), pS = pb + s;
    return { q: q, pb: pb, ps: pS, cost: s * q, dwl: s * (q - e.q) / 2, cs: cs(Dm, pb, q), psur: ps(Sp, pS, q), csGain: cs(Dm, pb, q) - cs(Dm, e.p, e.q), psGain: ps(Sp, pS, q) - ps(Sp, e.p, e.q), eq: e };
  }
  function ceiling(Dm, Sp, pc) {
    var e = equilibrium(Dm, Sp); if (pc >= e.p) return { binding: false, q: e.q, p: e.p, gap: 0, cs: cs(Dm, e.p, e.q), ps: ps(Sp, e.p, e.q), dwl: 0, eq: e };
    var qs = M.max(0, Sp.Q(pc)), qd = Dm.Q(pc);
    return { binding: true, q: qs, p: pc, qd: qd, qs: qs, gap: qd - qs, cs: cs(Dm, pc, qs), ps: ps(Sp, pc, qs), dwl: (Dm.P(qs) - supplyP(Sp, qs)) * (e.q - qs) / 2, eq: e };
  }
  function floor(Dm, Sp, pf) {
    var e = equilibrium(Dm, Sp); if (pf <= e.p) return { binding: false, q: e.q, p: e.p, gap: 0, cs: cs(Dm, e.p, e.q), ps: ps(Sp, e.p, e.q), dwl: 0, eq: e };
    var qd = M.max(0, Dm.Q(pf)), qs = Sp.Q(pf);
    return { binding: true, q: qd, p: pf, qd: qd, qs: qs, gap: qs - qd, cs: cs(Dm, pf, qd), ps: ps(Sp, pf, qd), dwl: (Dm.P(qd) - supplyP(Sp, qd)) * (e.q - qd) / 2, eq: e };
  }
  /* a small open economy at the world price pw (imports > 0, or exports when negative) */
  function world(Dm, Sp, pw) {
    var e = equilibrium(Dm, Sp), qd = M.max(0, Dm.Q(pw)), qs = M.max(0, Sp.Q(pw));
    var c1 = cs(Dm, pw, qd), p1 = ps(Sp, pw, qs), c0 = cs(Dm, e.p, e.q), p0 = ps(Sp, e.p, e.q);
    return { pw: pw, qd: qd, qs: qs, imports: qd - qs, cs: c1, ps: p1, dcs: c1 - c0, dps: p1 - p0, gain: c1 + p1 - c0 - p0, eq: e };
  }
  function tariff(Dm, Sp, pw, t) {
    var w0 = world(Dm, Sp, pw), e = w0.eq, pt = M.min(pw + t, e.p), w1 = world(Dm, Sp, pt), tt = pt - pw;
    return { pw: pw, p: pt, t: tt, free: w0, qd: w1.qd, qs: w1.qs, imports: w1.imports, rev: tt * M.max(0, w1.imports), dcs: w1.cs - w0.cs, dps: w1.ps - w0.ps,
      dwlProd: tt * (w1.qs - w0.qs) / 2, dwlCons: tt * (w0.qd - w1.qd) / 2, dwl: tt * (w1.qs - w0.qs) / 2 + tt * (w0.qd - w1.qd) / 2, prohibitive: pw + t >= e.p, eq: e };
  }
  function quota(Dm, Sp, pw, qq) {
    var w0 = world(Dm, Sp, pw), e = w0.eq;
    if (qq >= w0.imports) return { pw: pw, p: pw, binding: false, quota: qq, free: w0, qd: w0.qd, qs: w0.qs, imports: w0.imports, rent: 0, dwl: 0, eq: e };
    var p = (qq + Dm.p0 / Dm.m - Sp.p0 / Sp.m) / (1 / Dm.m - 1 / Sp.m); if (qq <= 0) p = e.p;
    var w1 = world(Dm, Sp, p), tt = p - pw;
    return { pw: pw, p: p, binding: true, quota: qq, free: w0, qd: w1.qd, qs: w1.qs, imports: w1.imports, rent: tt * w1.imports, dcs: w1.cs - w0.cs, dps: w1.ps - w0.ps,
      dwlProd: tt * (w1.qs - w0.qs) / 2, dwlCons: tt * (w0.qd - w1.qd) / 2, dwl: tt * (w1.qs - w0.qs) / 2 + tt * (w0.qd - w1.qd) / 2, eq: e };
  }
  /* a double shift: demand moves by dD and supply by dS (quantity units); the new equilibrium and the range of the ambiguous variable */
  function doubleShift(Dm, Sp, dD, dS) {
    var e0 = equilibrium(Dm, Sp), e1 = equilibrium(Dm.shift(dD), Sp.shift(dS)), eD = equilibrium(Dm.shift(dD), Sp), eS = equilibrium(Dm, Sp.shift(dS));
    var sameDir = (dD > 0) === (dS > 0); // both right (or both left): Q is certain, P is ambiguous
    return { e0: e0, e1: e1, onlyD: eD, onlyS: eS, ambiguous: sameDir ? 'p' : 'q', range: sameDir ? [M.min(eD.p, eS.p), M.max(eD.p, eS.p)] : [M.min(eD.q, eS.q), M.max(eD.q, eS.q)] };
  }

  /* Firm costs. A cubic TC = F + a·q − b·q² + c·q³ (a, b, c > 0, b² < 3ac so MC stays positive and U-shaped),
     or a table rows: [{ q, tc }] that starts at q = 0. */
  function cost(spec) {
    spec = spec || {};
    var F = num(spec.F, 50), a = num(spec.a, 20), b = num(spec.b, 4), c = num(spec.c, 0.4);
    var C = { F: F, a: a, b: b, c: c };
    C.VC = function (q) { return a * q - b * q * q + c * q * q * q; };
    C.TC = function (q) { return F + C.VC(q); };
    C.MC = function (q) { return a - 2 * b * q + 3 * c * q * q; };
    C.AVC = function (q) { return a - b * q + c * q * q; };
    C.AFC = function (q) { return F / q; };
    C.ATC = function (q) { return C.AVC(q) + F / q; };
    var qv = b / (2 * c); C.minAVC = { q: qv, v: C.AVC(qv) };
    var qt = F > 0 ? bisect(function (q) { return 2 * c * q * q * q - b * q * q - F; }, M.max(qv, 1e-9), M.max(qv, 1) * 10 + 100) : qv;
    C.minATC = { q: qt, v: C.ATC(qt) };
    C.minMC = { q: b / (3 * c), v: C.MC(b / (3 * c)) };
    /* the quantity a price taker chooses: MC = P on the rising part of MC, or 0 below the shutdown price (min AVC) */
    C.qFor = function (P) { if (P < C.minAVC.v - 1e-12) return 0; var disc = b * b - 3 * c * (a - P); return (b + M.sqrt(M.max(0, disc))) / (3 * c); };
    C.profit = function (P, q) { if (q == null) q = C.qFor(P); return P * q - C.TC(q); };
    return C;
  }
  function costRows(rows) {
    var r = rows.slice().sort(function (x, y) { return x.q - y.q; }), F = r[0].q === 0 ? r[0].tc : null;
    return r.map(function (x, i) {
      var o = { q: x.q, tc: x.tc };
      if (F != null) { o.fc = F; o.vc = x.tc - F; }
      if (i > 0) o.mc = (x.tc - r[i - 1].tc) / (x.q - r[i - 1].q);
      if (x.q > 0) { o.atc = x.tc / x.q; if (F != null) { o.avc = o.vc / x.q; o.afc = F / x.q; } }
      return o;
    });
  }
  /* A single-price seller: demand P = p0 − sQ, marginal revenue p0 − 2sQ, marginal cost m0 + m1·Q, average total cost F/Q + m0 + m1·Q/2 */
  function monopoly(dm, mc, F) {
    var p0 = num(dm.p0, 12), s = num(dm.s, 1), m0 = num(mc.m0, 2), m1 = num(mc.m1, 0); F = num(F, 0);
    var qm = (p0 - m0) / (2 * s + m1), pm = p0 - s * qm, qc = (p0 - m0) / (s + m1), pc = p0 - s * qc;
    var atc = function (q) { return F / q + m0 + m1 * q / 2; };
    return { p0: p0, s: s, m0: m0, m1: m1, F: F, qm: qm, pm: pm, mcm: m0 + m1 * qm, qc: qc, pc: pc,
      P: function (q) { return p0 - s * q; }, MR: function (q) { return p0 - 2 * s * q; }, MC: function (q) { return m0 + m1 * q; }, ATC: atc,
      profit: pm * qm - (F + m0 * qm + m1 * qm * qm / 2), cs: s * qm * qm / 2, csComp: s * qc * qc / 2, dwl: (pm - (m0 + m1 * qm)) * (qc - qm) / 2,
      lerner: (pm - (m0 + m1 * qm)) / pm, elasticity: -(1 / s) * (pm / qm) };
  }
  /* A monopsony employer: labor supply w = w0 + s·L, marginal factor cost w0 + 2s·L, MRP = a − b·L; optional minimum wage */
  function monopsony(sup, mrp, minWage) {
    var w0 = num(sup.w0, 4), s = num(sup.s, 0.5), a = num(mrp.a, 24), b = num(mrp.b, 0.5);
    var L = (a - w0) / (2 * s + b), w = w0 + s * L, Lc = (a - w0) / (s + b), wc = w0 + s * Lc;
    var r = { w0: w0, s: s, a: a, b: b, L: L, w: w, mrpAtL: a - b * L, Lc: Lc, wc: wc, S: function (l) { return w0 + s * l; }, MFC: function (l) { return w0 + 2 * s * l; }, MRP: function (l) { return a - b * l; } };
    if (minWage != null) { // with a wage floor the supply curve and MFC are flat at the floor until the floor meets supply
      var ls = (minWage - w0) / s, ld = (a - minWage) / b;
      r.min = { wage: minWage, L: minWage <= w ? L : M.max(0, M.min(ls, ld)), binding: minWage > w, ls: ls, ld: ld };
      if (minWage <= w) r.min.wage = w;
    }
    return r;
  }
  /* Lorenz curve and Gini coefficient from shares (bottom group first, any total; equal-sized groups) */
  function lorenz(shares) {
    var tot = shares.reduce(function (a, b) { return a + b; }, 0) || 1, n = shares.length, cum = [0], B = 0;
    shares.forEach(function (s, i) { cum.push(cum[i] + s / tot); B += (cum[i] + cum[i + 1]) / 2 / n; });
    return { cum: cum, B: B, A: 0.5 - B, gini: 1 - 2 * B, n: n };
  }
  function bracketTax(brackets, income) {
    var b = brackets.slice().sort(function (x, y) { return x[0] - y[0]; }), slices = [], tax = 0, marg = 0;
    b.forEach(function (br, i) {
      var lo = br[0], hi = i + 1 < b.length ? b[i + 1][0] : Infinity, amt = M.max(0, M.min(income, hi) - lo), t = amt * br[1];
      slices.push({ lo: lo, hi: hi, rate: br[1], amt: amt, tax: t }); tax += t; if (income >= lo) marg = br[1]; // the rate on the next dollar
    });
    return { slices: slices, tax: tax, avg: income > 0 ? tax / income : 0, marginal: marg, after: income - tax };
  }
  function rounds(first, r, n) { var out = [], v = first, tot = 0; for (var i = 0; i < n; i++) { tot += v; out.push({ v: v, total: tot }); v *= r; } return out; }
  function bond(face, coupon, years, rate) {
    var C = face * coupon, pays = [], price = 0;
    for (var t = 1; t <= years; t++) { var amt = C + (t === years ? face : 0), df = 1 / M.pow(1 + rate, t); pays.push({ t: t, amt: amt, df: df, pv: amt * df }); price += amt * df; }
    return { price: price, pays: pays, coupon: C };
  }
  function pv(kind, A, t, r) {
    if (kind === 'perpetuity') return r > 0 ? A / r : Infinity;
    if (kind === 'annuity') return r > 0 ? A * (1 - M.pow(1 + r, -t)) / r : A * t;
    return A / M.pow(1 + r, t);
  }
  /* 2-player matrix games: payoffs[i][j] = [row, column] */
  function game(P) {
    var R = P.length, Cn = P[0].length, brR = [], brC = [], nash = [], i, j;
    for (j = 0; j < Cn; j++) { var mx = -Infinity; for (i = 0; i < R; i++) mx = M.max(mx, P[i][j][0]); for (i = 0; i < R; i++) if (P[i][j][0] === mx) brR.push([i, j]); }
    for (i = 0; i < R; i++) { var my = -Infinity; for (j = 0; j < Cn; j++) my = M.max(my, P[i][j][1]); for (j = 0; j < Cn; j++) if (P[i][j][1] === my) brC.push([i, j]); }
    function isBR(list, a, b) { return list.some(function (x) { return x[0] === a && x[1] === b; }); }
    for (i = 0; i < R; i++) for (j = 0; j < Cn; j++) if (isBR(brR, i, j) && isBR(brC, i, j)) nash.push([i, j]);
    var domR = -1, domC = -1;
    for (i = 0; i < R; i++) { var ok = true; for (var k = 0; k < R && ok; k++) if (k !== i) for (j = 0; j < Cn; j++) if (!(P[i][j][0] > P[k][j][0])) { ok = false; break; } if (ok) domR = i; }
    for (j = 0; j < Cn; j++) { var ok2 = true; for (var l = 0; l < Cn && ok2; l++) if (l !== j) for (i = 0; i < R; i++) if (!(P[i][j][1] > P[i][l][1])) { ok2 = false; break; } if (ok2) domC = j; }
    var r = { brRow: brR, brCol: brC, nash: nash, domRow: domR, domCol: domC, isBR: isBR };
    if (R === 2 && Cn === 2) { // the mixed equilibrium: each player's mix makes the OTHER player indifferent
      var a = P[0][0][0], b = P[0][1][0], c = P[1][0][0], d = P[1][1][0], q = (d - b) / (a - b - c + d);
      var e = P[0][0][1], f = P[0][1][1], g = P[1][0][1], h = P[1][1][1], p = (h - g) / (e - g - f + h);
      r.mixed = isFinite(p) && isFinite(q) && p > 0 && p < 1 && q > 0 && q < 1 ? { p: p, q: q } : null; // p = P(row plays row 1), q = P(column plays column 1)
    }
    return r;
  }
  /* backward induction on a tree { player, moves: [{ label, to } | { label, pay }] }; returns solved copies and the order */
  function backward(node, path, order) {
    order = order || []; path = path || [];
    if (node.pay) return { pay: node.pay, order: order };
    var vals = node.moves.map(function (mv, i) { return mv.pay ? mv.pay : backward(mv.to, path.concat(i), order).pay; });
    var pl = node._p || 0, best = 0; vals.forEach(function (v, i) { if (v[pl] > vals[best][pl]) best = i; });
    node._best = best; node._vals = vals; order.push({ node: node, path: path, best: best });
    return { pay: vals[best], order: order };
  }
  function forexMirror(Dd, Sd) { // dollar market: Dd(e), Sd(e) quantities of dollars at e euros per dollar; euro market at x = 1/e dollars per euro
    return { De: function (x) { return Sd(1 / x) / x; }, Se: function (x) { return Dd(1 / x) / x; } };
  }

  /* Utility functions for two goods: { type: 'cobbdouglas', a, b } U = x^a·y^b; 'substitutes' U = a·x + b·y;
     'complements' U = min(a·x, b·y); 'quasilinear' U = k·f(x) + y with f = sqrt or ln; 'giffen' U = α·ln(x − g1) − β·ln(g2 − y)
     (β > α; Haagsma's function: good x is inferior, and a Giffen good when p2·g2 < income < p1·g1 + p2·g2). */
  function utility(spec) {
    spec = spec || {}; var t = spec.type || 'cobbdouglas', U = { type: t };
    if (t === 'substitutes') { var sa = num(spec.a, 1), sb = num(spec.b, 1); U.f = function (x, y) { return sa * x + sb * y; }; U.mrs = function () { return sa / sb; }; U.y = function (u, x) { return (u - sa * x) / sb; }; }
    else if (t === 'complements') { var ca = num(spec.a, 1), cb = num(spec.b, 1); U.f = function (x, y) { return M.min(ca * x, cb * y); }; U.mrs = function (x, y) { return ca * x < cb * y - 1e-9 ? Infinity : ca * x > cb * y + 1e-9 ? 0 : NaN; }; U.corner = function (u) { return [u / ca, u / cb]; }; U.ratio = ca / cb; }
    else if (t === 'quasilinear') { var k = num(spec.k, 1), ln = spec.f === 'ln'; U.f = function (x, y) { return k * (ln ? M.log(x) : M.sqrt(x)) + y; }; U.mrs = function (x) { return ln ? k / x : k / (2 * M.sqrt(x)); }; U.y = function (u, x) { return u - k * (ln ? M.log(x) : M.sqrt(x)); }; }
    else if (t === 'giffen') { var al = num(spec.alpha, 1), be = num(spec.beta, 2), g1 = num(spec.g1, 2), g2 = num(spec.g2, 10); U.g1 = g1; U.g2 = g2; U.f = function (x, y) { return x <= g1 || y >= g2 ? -Infinity : al * M.log(x - g1) - be * M.log(g2 - y); }; U.mrs = function (x, y) { return (al / (x - g1)) / (be / (g2 - y)); }; U.y = function (u, x) { return x <= g1 ? NaN : g2 - M.exp((al * M.log(x - g1) - u) / be); }; }
    else { var a = num(spec.a, 0.5), b = num(spec.b, 0.5); U.type = 'cobbdouglas'; U.a = a; U.b = b; U.f = function (x, y) { return x <= 0 || y <= 0 ? (x === 0 || y === 0 ? 0 : -Infinity) : M.pow(x, a) * M.pow(y, b); }; U.mrs = function (x, y) { return (a * y) / (b * x); }; U.y = function (u, x) { return M.pow(u / M.pow(x, a), 1 / b); }; }
    return U;
  }
  /* the best bundle on a budget frontier: y = top(x) for x in [0, xmax] (piecewise linear frontiers allowed) */
  function bestOn(Ut, top, xmax) {
    var g = function (x) { var y = top(x); return y < 0 ? -Infinity : Ut.f(x, M.max(0, y)); };
    var x = argmax(g, 0, xmax, 600); return [x, M.max(0, top(x)), g(x)];
  }
  function demand(Ut, p1, p2, I) { return bestOn(Ut, function (x) { return (I - p1 * x) / p2; }, I / p1); }
  /* income needed at prices p1, p2 to reach utility u (expenditure function, by bisection on income) */
  function expend(Ut, p1, p2, u) { var hi = 1; while (demand(Ut, p1, p2, hi)[2] < u && hi < 1e7) hi *= 2; return bisect(function (I) { return demand(Ut, p1, p2, I)[2] - u; }, 0, hi, 70); }
  function cdDemand(a, b, p1, p2, I) { return [a / (a + b) * I / p1, b / (a + b) * I / p2]; }
  /* Edgeworth box with Cobb-Douglas people (U = x^a·y^(1−a)): equilibrium price of x in units of y */
  function edgeEq(aA, aB, xA, yA, X, Y) { var xB = X - xA, yB = Y - yA; return (aA * yA + aB * yB) / ((1 - aA) * xA + (1 - aB) * xB); }
  function contractY(aA, aB, X, Y, x) { var ka = aA / (1 - aA), kb = aB / (1 - aB); return kb * x * Y / (ka * (X - x) + kb * x); }

  var econ = { line: line, curve: curve, equilibrium: equilibrium, cs: cs, ps: ps, surplus: surplus, midpoint: midpoint, pointElasticity: pointE, tax: tax, subsidy: subsidy,
    ceiling: ceiling, floor: floor, world: world, tariff: tariff, quota: quota, doubleShift: doubleShift, cost: cost, costRows: costRows, monopoly: monopoly, monopsony: monopsony,
    lorenz: lorenz, gini: function (s) { return lorenz(s).gini; }, bracketTax: bracketTax, rounds: rounds, bond: bond, pv: pv, game: game, backward: backward,
    forexMirror: forexMirror, utility: utility, bestOn: bestOn, demand: demand, expend: expend, cdDemand: cdDemand, edgeEq: edgeEq, contractY: contractY, longRunModel: lrModel, fr: fr, money: money };
  ML.econ = econ;
  if (!V) { if (W.console && W.document) W.console.warn('economics.js: load math/viz/core.js first'); return; }
  var mk = V.el;

  // ---------- colors ----------
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function rgb(hex) { var v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function rgba(hex, a) { var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  /* the palette: core colors plus the economics meanings (demand blue, supply orange, averages purple/teal, long run green) */
  function K() {
    var k = V.colors(), dk = isDark();
    k.dark = dk;
    k.acc = dk ? '#7cc8d2' : '#1d6f7a'; k.accSoft = rgba(k.acc, dk ? 0.26 : 0.16);
    k.blue2 = dk ? '#b5dcff' : '#123f86'; k.orange2 = dk ? '#ffd0a0' : '#a8400c';
    k.hatch = dk ? 'rgba(214,224,218,.62)' : 'rgba(70,82,76,.62)'; k.hatchFill = dk ? 'rgba(214,224,218,.10)' : 'rgba(70,82,76,.08)';
    k.card = k.bg; k.plot = dk ? '#16251d' : '#ffffff';
    k.redSoft2 = rgba(k.red, dk ? 0.34 : 0.22);
    return k;
  }

  // ---------- page pieces ----------
  /* frame(el, o, label): the visual's box (canvas area), a control row, a live readout and a caption.
     F.quiet: hide every number or verdict that could give a problem's answer away. F.inter: dragging and controls allowed. */
  function frame(el, o, label) {
    el.classList.add('ecv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { o: o, quiet: !!(o.quiet || o.readout === false), inter: o.interactive !== false, timers: [] };
    if (o.task) { F.task = mk('p', 'ecv-task', o.task); el.appendChild(F.task); }
    F.box = mk('div', 'ecv-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl ecv-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el); F.out.el.classList.add('ecv-out');
    if (F.quiet) F.out.el.hidden = true;
    if (o.caption) { F.cap = mk('p', 'ml-cap', o.caption); el.appendChild(F.cap); }
    F.row = function (cls) { var r = mk('div', 'ml-ctl ecv-ctl' + (cls ? ' ' + cls : '')); el.insertBefore(r, F.out.el); return r; };
    /* a canvas whose height follows its width: hf(w) -> px */
    F.canvas = function (hf) {
      var q = { height: 300 }, c = V.canvas(F.box, q);
      c.cv.setAttribute('role', 'img');
      var adj = function () { var w = F.box.clientWidth || 320, h = M.round(o.height || hf(w)); if (h !== q.height) { q.height = h; c.fit(); } };
      c.onResize(adj); adj(); F.c = c;
      F.layer = mk('div', 'ecv-layer'); F.box.appendChild(F.layer);
      return c;
    };
    F.say = function (s) { if (F.c) F.c.cv.setAttribute('aria-label', s); };
    F.set = function (html) { if (!F.quiet) F.out.set(html); };
    F.redraw = function (fn) { if (F.c) F.c.onResize(fn); V.onTheme(fn); };
    return F;
  }
  function hw(w, wide, narrow, cut) { return w >= (cut || 560) ? w / wide : w / narrow; } // height from width: aspect when wide / narrow
  function btn(parent, text, fn, cls) { var b = V.button(parent, text, fn, cls); return b; }
  function toggle(parent, text, on, fn) { var b = V.button(parent, text, function () { on = !on; b.setAttribute('aria-pressed', String(on)); fn(on); }); b.setAttribute('aria-pressed', String(!!on)); b.classList.add('ecv-tog'); return { el: b, get: function () { return on; }, set: function (v) { on = !!v; b.setAttribute('aria-pressed', String(on)); } }; }
  function group(parent, label, cls) { var g = mk('div', 'ecv-group' + (cls ? ' ' + cls : '')); g.setAttribute('role', 'group'); if (label) { g.setAttribute('aria-label', label); g.appendChild(mk('span', 'ecv-glab', label)); } parent.appendChild(g); return g; }
  /* stat tiles (live numbers, like the Science Lab's readouts) */
  function tiles(parent) {
    var g = mk('div', 'ecv-tiles'); parent.appendChild(g);
    return { el: g, set: function (items) { g.innerHTML = items.map(function (it) { return '<div' + (it.c ? ' style="--c:' + it.c + '"' : '') + (it.hi ? ' class="hi"' : '') + '><span>' + it.k + '</span><b>' + it.v + '</b></div>'; }).join(''); } };
  }
  /* Prev / Next through a sequence of steps; change(i) */
  function stepper(parent, n, start, change, labelFn) {
    var g = mk('div', 'ecv-steps'), i = clamp(start || 0, 0, n - 1); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Steps');
    var prev = V.button(g, '‹ Back', function () { go(i - 1); }), lab = mk('span', 'ecv-steplab'), next = V.button(g, 'Next ›', function () { go(i + 1); }, 'pri');
    lab.setAttribute('aria-live', 'polite'); g.insertBefore(lab, next); parent.appendChild(g);
    function show() { prev.disabled = i <= 0; next.disabled = i >= n - 1; lab.innerHTML = labelFn ? labelFn(i) : 'Step ' + (i + 1) + ' of ' + n; }
    function go(j, quietly) { j = clamp(j, 0, n - 1); var from = i; i = j; show(); if (!quietly) change(i, from); }
    show();
    return { el: g, get: function () { return i; }, go: go, setN: function (m) { n = m; i = clamp(i, 0, n - 1); show(); } };
  }
  /* a short eased animation; jumps straight to the end for visitors who prefer less motion */
  function tween(F, dur, fn, done) {
    if (F._tw) F._tw.stop = true;
    var tok = { stop: false }; F._tw = tok;
    if (V.reduced || !W.requestAnimationFrame) { fn(1); if (done) done(); return tok; }
    var t0 = null;
    function fr(t) { if (tok.stop) return; if (t0 == null) t0 = t; var u = M.min(1, (t - t0) / dur), e = u < 0.5 ? 2 * u * u : 1 - M.pow(-2 * u + 2, 2) / 2; fn(e); if (u < 1) W.requestAnimationFrame(fr); else if (done) done(); }
    W.requestAnimationFrame(fr); return tok;
  }

  // ---------- drawing in pixels ----------
  function font(sz, wt, it) { return (it ? 'italic ' : '') + (wt || 600) + ' ' + (sz || 12) + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; }
  function txt(ctx, s, x, y, o) { o = o || {}; ctx.save(); ctx.font = o.font || font(o.size, o.wt, o.it); ctx.fillStyle = o.color || K().muted; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  /* a text label on a soft pill; align: left | center | right of x; box: clamp inside {x, y, w, h} */
  function pill(ctx, s, x, y, o) {
    o = o || {}; var k = K(); ctx.save(); ctx.font = font(o.size || 12.5, o.wt || 700, o.it);
    var w = ctx.measureText(s).width + 10, h = (o.size || 12.5) + 7, al = o.align || 'center', bx = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, by = y - h / 2;
    if (o.box) { bx = clamp(bx, o.box.x + 1, o.box.x + o.box.w - w - 1); by = clamp(by, o.box.y + 1, o.box.y + o.box.h - h - 1); }
    ctx.fillStyle = o.bg || (k.dark ? 'rgba(20,33,26,.9)' : 'rgba(255,255,255,.9)'); rr(ctx, bx, by, w, h, 6); ctx.fill();
    if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.fillStyle = o.color || k.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
    return { x: bx, y: by, w: w, h: h };
  }
  function arrowPx(ctx, x1, y1, x2, y2, col, w, head, dash) {
    var ang = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(head || 9, L * 0.5);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = 'round'; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(ang), y2 - hs * 0.6 * M.sin(ang)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(ang - 0.42), y2 - hs * M.sin(ang - 0.42)); ctx.lineTo(x2 - hs * M.cos(ang + 0.42), y2 - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function polyPx(ctx, pts, fill, stroke, lw) { if (pts.length < 2) return; ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); }
  /* deadweight loss: a hatched gray region (never color alone) */
  function hatchPx(ctx, pts) {
    if (pts.length < 3) return; var k = K(), xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = M.min.apply(null, xs), x1 = M.max.apply(null, xs), y0 = M.min.apply(null, ys), y1 = M.max.apply(null, ys);
    ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = k.hatchFill; ctx.fill(); ctx.clip();
    ctx.strokeStyle = k.hatch; ctx.lineWidth = 1.3; ctx.beginPath();
    for (var t = x0 - (y1 - y0); t < x1 + 6; t += 7) { ctx.moveTo(t, y1); ctx.lineTo(t + (y1 - y0), y0); }
    ctx.stroke(); ctx.restore();
  }
  function knobPx(ctx, x, y, col, r) { var k = K(); r = r || 7; ctx.save(); ctx.fillStyle = k.plot; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, TAU); ctx.fill(); ctx.restore(); }
  function dotPx(ctx, x, y, col, r) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r || 5, 0, TAU); ctx.fill(); ctx.restore(); }
  function clearC(c) { var k = K(), ctx = c.ctx; ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.plot; ctx.fillRect(0, 0, c.w, c.h); ctx.restore(); }

  /* axes(c, o): an economics graph inside a rectangle of the canvas, first quadrant by default.
     o = { xmin, xmax, ymin, ymax, xLabel, yLabel, money, title, xTicks: false, yTicks: false, xfmt, yfmt }
     A.set({x, y, w, h}) places it; A.X(q), A.Y(p) map to pixels; A.q(px), A.p(py) map back. */
  function axes(c, o) {
    o = o || {}; var A = { o: o, xmin: num(o.xmin, 0), xmax: num(o.xmax, 10), ymin: num(o.ymin, 0), ymax: num(o.ymax, 10) };
    A.set = function (r) {
      var ml = o.ml != null ? o.ml : (o.yTicks === false ? 18 : o.money ? 50 : 44), mb = o.mb != null ? o.mb : (o.xTicks === false ? 26 : 40), mt = o.mt != null ? o.mt : 26, mr = o.mr != null ? o.mr : 14;
      A.r = r; A.L = r.x + ml; A.Rx = r.x + r.w - mr; A.T = r.y + mt; A.B = r.y + r.h - mb; A.W = M.max(10, A.Rx - A.L); A.H = M.max(10, A.B - A.T); return A;
    };
    A.X = function (q) { return A.L + (q - A.xmin) / (A.xmax - A.xmin) * A.W; };
    A.Y = function (p) { return A.B - (p - A.ymin) / (A.ymax - A.ymin) * A.H; };
    A.q = function (px) { return A.xmin + (px - A.L) / A.W * (A.xmax - A.xmin); };
    A.p = function (py) { return A.ymin + (A.B - py) / A.H * (A.ymax - A.ymin); };
    A.box = function () { return { x: A.L, y: A.T, w: A.W, h: A.H }; };
    A.yf = function (v) { return o.yfmt ? o.yfmt(v) : o.money ? money(v) : fm(v, 3); };
    A.xf = function (v) { return o.xfmt ? o.xfmt(v) : big(v, 3); };
    A.draw = function () {
      var k = K(), ctx = c.ctx, sx = o.xstep || niceStep(A.xmax - A.xmin, M.max(2, A.W / 62)), sy = o.ystep || niceStep(A.ymax - A.ymin, M.max(2, A.H / 44)), v;
      ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = k.grid; ctx.beginPath();
      if (o.grid !== false) {
        for (v = M.ceil(A.xmin / sx - 1e-9) * sx; v <= A.xmax + 1e-9; v += sx) { var gx = M.round(A.X(v)) + 0.5; ctx.moveTo(gx, A.T); ctx.lineTo(gx, A.B); }
        for (v = M.ceil(A.ymin / sy - 1e-9) * sy; v <= A.ymax + 1e-9; v += sy) { var gy = M.round(A.Y(v)) + 0.5; ctx.moveTo(A.L, gy); ctx.lineTo(A.Rx, gy); }
      }
      ctx.stroke();
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.L, A.T - 6); ctx.lineTo(A.L, A.B); ctx.lineTo(A.Rx + 4, A.B); ctx.stroke();
      ctx.fillStyle = k.muted; ctx.font = font(11.5, 500);
      if (o.xAt) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; o.xAt.forEach(function (t) { var px = A.X(t[0]); if (px < A.L - 2 || px > A.Rx + 2) return; ctx.fillText(t[1], px, A.B + 5); ctx.save(); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(M.round(px) + 0.5, A.T); ctx.lineTo(M.round(px) + 0.5, A.B); ctx.stroke(); ctx.restore(); }); }
      if (o.yAt) { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; o.yAt.forEach(function (t) { var py = A.Y(t[0]); if (py < A.T - 4 || py > A.B + 2) return; ctx.fillText(t[1], A.L - 6, py); ctx.save(); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(A.L, M.round(py) + 0.5); ctx.lineTo(A.Rx, M.round(py) + 0.5); ctx.stroke(); ctx.restore(); }); }
      if (o.xTicks !== false && !o.xAt) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; var lastR = -1e9; for (v = M.ceil(A.xmin / sx - 1e-9) * sx; v <= A.xmax + 1e-9; v += sx) { var px = A.X(v), s = A.xf(v), tw = ctx.measureText(s).width; if (px - tw / 2 < lastR + 4) continue; ctx.fillText(s, px, A.B + 5); lastR = px + tw / 2; } }
      if (o.yTicks !== false && !o.yAt) { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; for (v = M.ceil(A.ymin / sy - 1e-9) * sy; v <= A.ymax + 1e-9; v += sy) { var py = A.Y(v); if (py < A.T - 4) continue; ctx.fillText(A.yf(v), A.L - 6, py); } }
      ctx.fillStyle = k.ink; ctx.font = font(12.5, 650);
      if (o.yLabel) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(o.yLabel, A.r.x + 4, A.r.y + 11); }
      if (o.xLabel) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xLabel, A.Rx, A.r.y + A.r.h - 2); }
      if (o.title) { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = k.acc; ctx.font = font(12.5, 700); ctx.fillText(o.title, A.Rx, A.r.y + 11); }
      ctx.restore(); return A;
    };
    A.clip = function (fn) { var ctx = c.ctx; ctx.save(); ctx.beginPath(); ctx.rect(A.L + 1, A.T - 6, A.W + 4, A.H + 6); ctx.clip(); fn(); ctx.restore(); };
    function sty(ctx, col, so) { so = so || {}; ctx.strokeStyle = col; ctx.lineWidth = so.w || 2.8; ctx.setLineDash(so.dash || []); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = so.alpha == null ? 1 : so.alpha; }
    /* a linear curve P = p0 + m·Q (from linear(): {p0, m}); so: { w, dash, from, to } */
    A.lin = function (L, col, so) {
      so = so || {}; var a = so.from != null ? so.from : A.xmin, b = so.to != null ? so.to : A.xmax;
      A.clip(function () { var ctx = c.ctx; ctx.save(); sty(ctx, col, so); ctx.beginPath(); ctx.moveTo(A.X(a), A.Y(L.P(a))); ctx.lineTo(A.X(b), A.Y(L.P(b))); ctx.stroke(); ctx.restore(); });
    };
    /* any curve y = f(x) on [a, b] (breaks where f is not finite) */
    A.fn = function (f, col, so) {
      so = so || {}; var a = so.from != null ? so.from : A.xmin, b = so.to != null ? so.to : A.xmax, n = so.n || M.max(80, M.round(A.W / 2));
      A.clip(function () {
        var ctx = c.ctx; ctx.save(); sty(ctx, col, so); ctx.beginPath(); var pen = false;
        for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n, y = f(x); if (!isFinite(y) || y > A.ymax + (A.ymax - A.ymin) * 3 || y < A.ymin - (A.ymax - A.ymin) * 3) { pen = false; continue; } var px = A.X(x), py = A.Y(y); if (pen) ctx.lineTo(px, py); else { ctx.moveTo(px, py); pen = true; } }
        ctx.stroke(); ctx.restore();
      });
    };
    /* a parametric curve (q(t), p(t)) */
    A.par = function (fq, fp, t0, t1, col, so) { so = so || {}; A.clip(function () { var ctx = c.ctx, n = so.n || 160, pen = false; ctx.save(); sty(ctx, col, so); ctx.beginPath(); for (var i = 0; i <= n; i++) { var t = t0 + (t1 - t0) * i / n, x = fq(t), y = fp(t); if (!isFinite(x) || !isFinite(y)) { pen = false; continue; } if (pen) ctx.lineTo(A.X(x), A.Y(y)); else { ctx.moveTo(A.X(x), A.Y(y)); pen = true; } } ctx.stroke(); ctx.restore(); }); };
    A.vline = function (q, col, so) { so = so || {}; A.clip(function () { var ctx = c.ctx; ctx.save(); sty(ctx, col, so); ctx.beginPath(); ctx.moveTo(A.X(q), A.Y(so.from != null ? so.from : A.ymin)); ctx.lineTo(A.X(q), so.to != null ? A.Y(so.to) : A.T - 4); ctx.stroke(); ctx.restore(); }); };
    A.hline = function (p, col, so) { so = so || {}; A.clip(function () { var ctx = c.ctx; ctx.save(); sty(ctx, col, so); ctx.beginPath(); ctx.moveTo(A.X(so.from != null ? so.from : A.xmin), A.Y(p)); ctx.lineTo(so.to != null ? A.X(so.to) : A.Rx, A.Y(p)); ctx.stroke(); ctx.restore(); }); };
    A.seg = function (q1, p1, q2, p2, col, so) { A.clip(function () { var ctx = c.ctx; ctx.save(); sty(ctx, col, so); ctx.beginPath(); ctx.moveTo(A.X(q1), A.Y(p1)); ctx.lineTo(A.X(q2), A.Y(p2)); ctx.stroke(); ctx.restore(); }); };
    A.poly = function (pts, fill, stroke) { A.clip(function () { polyPx(c.ctx, pts.map(function (p) { return [A.X(p[0]), A.Y(p[1])]; }), fill, stroke); }); };
    A.area = function (f, g, a, b, fill) { if (!(b > a)) return; var pts = [], n = 60, i; for (i = 0; i <= n; i++) { var x = a + (b - a) * i / n; pts.push([x, f(x)]); } for (i = n; i >= 0; i--) { x = a + (b - a) * i / n; pts.push([x, g(x)]); } A.poly(pts, fill); };
    A.hatch = function (pts) { A.clip(function () { hatchPx(c.ctx, pts.map(function (p) { return [A.X(p[0]), A.Y(p[1])]; })); }); };
    A.dot = function (q, p, col, r) { dotPx(c.ctx, A.X(q), A.Y(p), col, r || 5.5); };
    A.knob = function (q, p, col, r) { knobPx(c.ctx, A.X(q), A.Y(p), col, r); };
    A.guide = function (q, p, col) { var k = K(); A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col || k.muted; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(A.X(A.xmin), A.Y(p)); ctx.lineTo(A.X(q), A.Y(p)); ctx.lineTo(A.X(q), A.Y(A.ymin)); ctx.stroke(); ctx.restore(); }); };
    A.arrow = function (q1, p1, q2, p2, col, w, dash) { arrowPx(c.ctx, A.X(q1), A.Y(p1), A.X(q2), A.Y(p2), col, w || 2.2, 10, dash); };
    /* value tags on the axes (a pill over the tick labels) */
    A.tagY = function (p, s, col) { if (p < A.ymin || p > A.ymax) return; pill(c.ctx, s, A.L - 3, A.Y(p), { align: 'right', color: col || K().ink, size: 11.5, border: col, box: { x: A.r.x, y: A.r.y, w: A.r.w, h: A.r.h } }); };
    A.tagX = function (q, s, col) { if (q < A.xmin || q > A.xmax) return; pill(c.ctx, s, A.X(q), A.B + 12, { color: col || K().ink, size: 11.5, border: col, box: { x: A.r.x, y: A.B, w: A.r.w, h: 40 } }); };
    A.label = function (s, q, p, col, lo) { lo = lo || {}; return pill(c.ctx, s, A.X(q) + (lo.dx || 0), A.Y(p) + (lo.dy || 0), { align: lo.align || 'center', color: col, size: lo.size || 12.5, box: A.box(), bg: lo.bg, border: lo.border, wt: lo.wt }); };
    A.inside = function (q, p) { return q >= A.xmin && q <= A.xmax && p >= A.ymin && p <= A.ymax; };
    /* the name of a linear curve near the end of its visible part */
    A.name = function (L, s, col, at) {
      var t = at == null ? 0.9 : at, lo = A.xmin, hi = A.xmax, i;
      // visible q range of the line inside the box
      var qs = [];
      for (i = 0; i <= 200; i++) { var q = A.xmin + (A.xmax - A.xmin) * i / 200, p = L.P(q); if (p >= A.ymin && p <= A.ymax) qs.push(q); }
      if (!qs.length) return; lo = qs[0]; hi = qs[qs.length - 1];
      var qq = lo + (hi - lo) * t, pp = L.P(qq);
      pill(c.ctx, s, A.X(qq) + (L.m > 0 ? 18 : 16), A.Y(pp) + (L.m > 0 ? 9 : -11), { color: col, box: A.box(), size: 13 });
    };
    A.nameAt = function (s, q, p, col, dx, dy) { pill(c.ctx, s, A.X(q) + (dx || 0), A.Y(p) + (dy || 0), { color: col, box: A.box(), size: 13 }); };
    return A;
  }
  /* lettered marks for "which point…" questions: [{ label: 'A', x, y }] */
  function marksOn(c, A, marks) {
    var k = K(); (marks || []).forEach(function (m) { var x = num(m.x, 0), y = num(m.y, 0); if (!A.inside(x, y)) return; dotPx(c.ctx, A.X(x), A.Y(y), k.ink, 5); pill(c.ctx, String(m.label || ''), A.X(x) + 13, A.Y(y) - 13, { color: k.ink, border: k.ink, box: A.box() }); });
  }

  /* knobs(F, c, list, change): draggable handles with mouse, touch and pen, and a focusable proxy for each one
     (Tab reaches every handle, arrow keys move it, Shift + arrow moves farther). The proxies sit over the handles,
     so the focus ring shows where the handle is.
     list item: { name, pos() -> [px, py] or null, drag(px, py), key(dx, dy, big), text() -> spoken value } */
  function knobs(F, c, list, change) {
    var cur = -1;
    list.forEach(function (h, i) {
      var e = mk('span', 'ecv-knob'); e.tabIndex = 0; e.setAttribute('role', 'slider'); e.setAttribute('aria-label', h.name + (h.hint ? '. ' + h.hint : '. Arrow keys move it.'));
      e.addEventListener('keydown', function (ev) {
        var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1], PageUp: [0, 1], PageDown: [0, -1] }[ev.key];
        if (!d) return; ev.preventDefault(); h.key(d[0], d[1], ev.shiftKey || ev.key.indexOf('Page') === 0); cur = i; change(i); upd();
      });
      e.addEventListener('focus', function () { cur = i; });
      F.layer.appendChild(e); h.el = e;
    });
    function upd() { list.forEach(function (h) { var p = h.pos(); if (!p) { h.el.hidden = true; return; } h.el.hidden = false; h.el.style.left = p[0] + 'px'; h.el.style.top = p[1] + 'px'; if (h.text) h.el.setAttribute('aria-valuetext', h.text()); }); }
    if (list.length) V.drag(c.cv, {
      hit: function (px, py) { var best = null, bd = 26; list.forEach(function (h, i) { var p = h.pos(); if (!p || h.off) return; var d = h.hitd ? h.hitd(px, py) : M.hypot(p[0] - px, p[1] - py); if (d < bd) { bd = d; best = i; } }); return best; },
      start: function (i) { cur = i; },
      move: function (i, px, py) { list[i].drag(px, py); change(i); upd(); },
      end: function () { }
    });
    else c.cv.style.touchAction = 'pan-y';
    return { place: upd, cur: function () { return cur; } };
  }
  /* '1 shirt', '2.5 shirts' from a plural name */
  function units(x, plural, d) { var t = fm(x, d == null ? 3 : d); return t + ' ' + (t === '1' ? String(plural).replace(/s$/, '') : plural); }
  /* quantity or price as text for readouts: money when asked */
  function P$(o, v, d) { return o.money ? money(v, d) : fm(v, d == null ? 2 : d); }

  // ---------- shared for supply-and-demand graphs ----------
  function niceCeil(v) { if (!(v > 0)) return 10; var m = M.pow(10, M.floor(M.log10(v))), f = v / m, L = [1, 1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10]; for (var i = 0; i < L.length; i++) if (f <= L[i] + 1e-9) return L[i] * m; return 10 * m; }
  /* axis ranges that show every demand curve down to the quantity axis */
  function sdRange(o, Ds, Ss) {
    var qx = 0, py = 0;
    Ds.forEach(function (d) { qx = M.max(qx, d.Q(0)); py = M.max(py, d.p0); });
    if (!Ds.length) Ss.forEach(function (s) { qx = M.max(qx, s.Q(s.p0 + 1) * 3); });
    var xMax = num(o.xMax, niceCeil(qx * 1.04)), yMax = num(o.yMax, 0);
    if (!yMax) { if (!Ds.length) Ss.forEach(function (s) { py = M.max(py, s.P(xMax)); }); yMax = niceCeil(py * (Ds.length ? 1.15 : 1.02)); }
    return { xMax: xMax, yMax: yMax };
  }
  function axOpts(o, r, extra) { return opt(extra || {}, { xmax: r.xMax, ymax: r.yMax, xLabel: o.xLabel || 'Quantity', yLabel: o.yLabel || (o.money ? 'Price ($)' : 'Price'), money: !!o.money }); }
  function keyHTML(col, s) { return '<span class="ecv-key" style="--c:' + col + '"></span>' + s; }
  function qForm(L, kind) { // "Qd = 20 − 2P" (or "Qs = −4 + 2P")
    var f = L.qform(), lead = kind === 'D' ? f.a : f.c, sl = kind === 'D' ? f.b : f.d, s = (kind === 'D' ? 'Q<sub>d</sub>' : 'Q<sub>s</sub>') + ' = ';
    if (M.abs(lead) > 1e-9) s += fr(lead) + (kind === 'D' ? ' − ' : (sl >= 0 ? ' + ' : ' − ')) + (fr(M.abs(sl)) === '1' ? '' : fr(M.abs(sl))) + '<i>P</i>';
    else s += (kind === 'D' ? '−' : '') + (fr(M.abs(sl)) === '1' ? '' : fr(M.abs(sl))) + '<i>P</i>';
    return s;
  }
  function pForm(L) { // "P = 10 − Q/2"
    var m = M.abs(L.m), r = ratio(m, 12), mt = r && r[0] === 1 && r[1] > 1 ? null : fr(m), sq = mt == null ? '<i>Q</i>/' + r[1] : (mt === '1' ? '' : mt) + '<i>Q</i>';
    if (M.abs(L.p0) < 1e-9) return '<i>P</i> = ' + (L.m < 0 ? '−' : '') + sq;
    return '<i>P</i> = ' + fr(L.p0) + (L.m < 0 ? ' − ' : ' + ') + sq;
  }
  /* the DWL label: inside the triangle when it is big enough, otherwise just above it */
  function dwlLabel(A, q1, pTop, pBot, q2, p2) {
    var cx = (2 * q1 + q2) / 3, cy = (pTop + pBot + p2) / 3, w = M.abs(A.X(q2) - A.X(q1)), h = M.abs(A.Y(pBot) - A.Y(pTop));
    if (w > 46 && h > 22) A.label('DWL', cx, cy, K().ink, { size: 11 }); else A.label('DWL', cx, M.max(pTop, p2), K().ink, { size: 11, dy: -14 });
  }
  var DEF_DET = [
    { label: 'Income rises (normal good)', curve: 'D', dir: 1, why: 'Buyers with more income want more of a normal good at every price' },
    { label: 'Price of a substitute rises', curve: 'D', dir: 1, why: 'Some buyers switch to this good from the pricier substitute' },
    { label: 'Price of a complement rises', curve: 'D', dir: -1, why: 'The pair of goods costs more to use together, so buyers want less of this one at every price' },
    { label: 'Tastes turn against it', curve: 'D', dir: -1, why: 'Buyers want less at every price' },
    { label: 'Input prices rise', curve: 'S', dir: -1, why: 'Each unit costs more to make, so sellers offer less at every price' },
    { label: 'New technology', curve: 'S', dir: 1, why: 'Each unit costs less to make, so sellers offer more at every price' },
    { label: 'More sellers', curve: 'S', dir: 1, why: 'More sellers offer more in total at every price' }
  ];

  /* ec-market: the supply and demand graph (see the header for options) */
  V.register('ec-market', function (el, o) {
    o = opt(o, { mode: 'plain', show: null });
    var mode = o.mode, F = frame(el, o, 'Supply and demand graph'), k = K();
    var D0 = curve(o.demand, 'D'), S0 = curve(o.supply, 'S'), show = o.show || (mode === 'plain' ? ['eq'].concat(o.price != null ? ['gaps'] : []) : ['eq']);
    var sh = { D: num(o.shift && o.shift.D, 0), S: num(o.shift && o.shift.S, 0) }, dets = (o.determinants || DEF_DET).map(function (d) { return { label: d.label, curve: d.curve === 'S' ? 'S' : 'D', dir: d.dir < 0 ? -1 : 1, size: num(d.size, 0), why: d.why || '' }; });
    var anim = 1, det = null, price = o.price != null ? num(o.price, 0) : null, moveP = null, bothP = null, bothS = num(o.shift && o.shift.D, 0) || 4;
    var e0 = equilibrium(D0, S0), defSize = M.max(1, M.round(e0.q * 0.35));
    if (mode === 'double' || o.double) { mode = 'double'; if (!sh.D) sh.D = defSize; if (!sh.S) sh.S = M.round(defSize * 0.7) || 1; }
    var Ds = [D0, D0.shift(sh.D), D0.shift(defSize), D0.shift(-defSize), D0.shift(bothS)], Ss = [S0, S0.shift(sh.S), S0.shift(defSize), S0.shift(-defSize)];
    var R = sdRange(o, Ds, Ss), twin = mode === 'both';
    var c = F.canvas(function (w) { return twin ? (w >= 560 ? w / 2.05 : w * 1.62) : hw(w, 1.55, 1.02); });
    var A = axes(c, axOpts(o, R)), A2 = twin ? axes(c, axOpts(o, R)) : null;
    if (twin) { A.o.title = 'A change in price'; A2.o.title = 'A change in income'; }
    if (mode === 'move') moveP = num(o.price, e0.p * 0.6);
    if (twin) bothP = num(o.price, e0.p * 0.6);
    var hasSteps = (mode === 'plain' || mode === 'shift') && (sh.D || sh.S), step = hasSteps ? clamp(num(o.step, 2), 0, 2) : 2;
    var eqs = has(show, 'equations') ? mk('p', 'ecv-note') : null; if (eqs) el.insertBefore(eqs, F.out.el);
    var T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);

    // controls
    var stp = null;
    if (hasSteps && F.inter) stp = stepper(F.ctl, 3, step, function (i) { step = i; anim = 0; tween(F, 650, function (t) { anim = t; draw(); }); }, function (i) {
      if (F.quiet) return 'Step ' + (i + 1) + ' of 3';
      return ['Step 1 of 3: the market starts at equilibrium <b>E₁</b>.', 'Step 2 of 3: ' + shiftWords() + ' At the old price there is now a ' + (excessAtOld() > 0 ? 'shortage' : 'surplus') + '.', 'Step 3 of 3: the price adjusts to the new equilibrium <b>E₂</b>; ' + alongWords() + '.'][i];
    });
    if (mode === 'shift' && F.inter) {
      var g1 = group(F.ctl, 'Demand'), g2 = group(F.ctl, 'Supply'), bs = [];
      dets.forEach(function (d, i) {
        var b = btn(d.curve === 'D' ? g1 : g2, d.label, function () { if (det === i) { det = null; sh.D = 0; sh.S = 0; } else { det = i; var size = d.size || defSize; sh.D = d.curve === 'D' ? d.dir * size : 0; sh.S = d.curve === 'S' ? d.dir * size : 0; } bs.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === det)); }); anim = 0; tween(F, 600, function (t) { anim = t; draw(); }); }, 'ecv-ev ' + d.curve.toLowerCase());
        b.setAttribute('aria-pressed', 'false'); bs.push(b);
      });
      if (!g2.querySelector('button')) g2.remove(); if (!g1.querySelector('button')) g1.remove();
    }
    if (mode === 'double' && F.inter) {
      V.slider(F.ctl, { label: 'Demand shift', min: -2 * defSize, max: 2 * defSize, step: 0.5, value: sh.D, fmt: function (v) { return (v > 0 ? 'right ' : v < 0 ? 'left ' : '') + fm(M.abs(v)); }, input: function (v) { sh.D = v; draw(); } });
      V.slider(F.ctl, { label: 'Supply shift', min: -2 * defSize, max: 2 * defSize, step: 0.5, value: sh.S, fmt: function (v) { return (v > 0 ? 'right ' : v < 0 ? 'left ' : '') + fm(M.abs(v)); }, input: function (v) { sh.S = v; draw(); } });
    }
    if (twin && F.inter) {
      V.slider(F.ctl, { label: 'Price (left graph)', min: R.yMax * 0.05, max: D0.p0 * 0.95, step: 0.25, value: bothP, fmt: function (v) { return P$(o, v); }, input: function (v) { bothP = v; draw(); } });
      V.slider(F.ctl, { label: 'Income change (right graph)', min: -defSize * 1.5, max: defSize * 1.5, step: 0.5, value: bothS, fmt: function (v) { return v > 0 ? 'demand right ' + fm(v) : v < 0 ? 'demand left ' + fm(-v) : 'none'; }, input: function (v) { bothS = v; draw(); } });
    }
    var KN = knobs(F, c, F.inter ? [
      { name: 'Price line', off: price == null, pos: function () { return price == null ? null : [A.X(A.xmin + (A.xmax - A.xmin) * 0.97), A.Y(price)]; }, hitd: function (px, py) { return price == null || px < A.L - 30 || px > A.Rx ? 99 : M.abs(py - A.Y(price)); }, drag: function (px, py) { price = clamp(A.p(py), 0, R.yMax); }, key: function (dx, dy, bg) { price = clamp(price + (dy || dx) * (bg ? 1 : 0.25) * (R.yMax / 20), 0, R.yMax); }, text: function () { return 'Price ' + P$(o, price); } },
      { name: 'Point on the demand curve', off: moveP == null, pos: function () { return moveP == null ? null : [A.X(D0.Q(moveP)), A.Y(moveP)]; }, drag: function (px, py) { var q = A.q(px), p = A.p(py), t = (p - D0.p0) * D0.m + q; var qq = clamp(t / (1 + D0.m * D0.m), 0, D0.Q(0)); moveP = clamp(D0.P(qq), 0.02 * R.yMax, D0.p0 * 0.98); }, key: function (dx, dy, bg) { moveP = clamp(moveP + (dy || -dx) * (bg ? 1 : 0.25) * (R.yMax / 20), 0.02 * R.yMax, D0.p0 * 0.98); }, text: function () { return 'Price ' + P$(o, moveP) + ', quantity demanded ' + fm(D0.Q(moveP)); } }
    ] : [], function () { draw(); });

    function cur() { var t = hasSteps ? (step >= 1 ? (step === 1 ? anim : 1) : 0) : anim; return { D: D0.shift(sh.D * t), S: S0.shift(sh.S * t), t: t }; }
    function excessAtOld() { var D1 = D0.shift(sh.D), S1 = S0.shift(sh.S); return D1.Q(e0.p) - S1.Q(e0.p); }
    function shiftWords() {
      var w = [];
      if (sh.D) w.push('demand ' + (sh.D > 0 ? 'increases: D shifts right' : 'decreases: D shifts left'));
      if (sh.S) w.push('supply ' + (sh.S > 0 ? 'increases: S shifts right' : 'decreases: S shifts left'));
      return w.join(' and ').replace(/^./, function (ch) { return ch.toUpperCase(); }) + '.';
    }
    function alongWords() {
      var e1 = equilibrium(D0.shift(sh.D), S0.shift(sh.S)), up = e1.p > e0.p + 1e-9;
      if (sh.D && !sh.S) return 'sellers move ' + (up ? 'up' : 'down') + ' along the supply curve. That is a change in quantity supplied, not a shift of supply';
      if (sh.S && !sh.D) return 'buyers move ' + (up ? 'up' : 'down') + ' along the demand curve. That is a change in quantity demanded, not a shift of demand';
      return 'both curves moved, and the price moves to where they cross';
    }
    function curveSet(Ac, Dc, Sc, Dold, Sold, nm) {
      if (Dold) { Ac.lin(Dold, k.blue, { dash: [7, 6], w: 2.2, alpha: 0.7 }); }
      if (Sold) { Ac.lin(Sold, k.orange, { dash: [7, 6], w: 2.2, alpha: 0.7 }); }
      Ac.lin(Dc, k.blue); Ac.lin(Sc, k.orange);
      if (Dold) Ac.name(Dold, 'D' + sub(1), k.blue, 0.93); Ac.name(Dc, Dold ? 'D' + sub(2) : 'D', k.blue, Dold ? 0.93 : 0.9);
      if (Sold) Ac.name(Sold, 'S' + sub(1), k.orange, 0.93); Ac.name(Sc, Sold ? 'S' + sub(2) : 'S', k.orange, Sold ? 0.93 : 0.9);
    }
    function shiftArrow(Ac, L0, L1, col, avoid) { // an arrow between two parallel lines, at a height where both are in view, away from the equilibria
      var ok = []; for (var i = 1; i < 60; i++) { var p = Ac.ymax * i / 60, a = L0.Q(p), b = L1.Q(p); if (a > Ac.xmax * 0.04 && b > Ac.xmax * 0.04 && a < Ac.xmax * 0.96 && b < Ac.xmax * 0.96) ok.push(p); }
      if (!ok.length) return; var pp = ok[M.floor(ok.length * (L0.m < 0 ? 0.7 : 0.3))];
      if (M.abs(L1.Q(pp) - L0.Q(pp)) < 1e-6) return; Ac.arrow(L0.Q(pp), pp, L1.Q(pp), pp, col, 2.4);
    }
    function eqPoint(Ac, e, name, showVals) {
      Ac.guide(e.q, e.p); Ac.dot(e.q, e.p, k.ink, 6);
      if (name) Ac.label(name, e.q, e.p, k.ink, { dx: 16, dy: -14, size: 12 });
      if (showVals && !F.quiet) { Ac.tagY(e.p, P$(o, e.p), k.ink); Ac.tagX(e.q, fm(e.q), k.ink); }
    }
    function surplusAreas(Ac, Dc, Sc) {
      var e = equilibrium(Dc, Sc), qf = o.quantity != null ? clamp(num(o.quantity, e.q), 0, R.xMax) : null, split = price != null && !has(show, 'gaps') ? price : e.p, qx = qf != null ? M.min(qf, e.q) : e.q;
      if (has(show, 'cs')) Ac.area(function (q) { return Dc.P(q); }, function () { return split; }, 0, M.min(qx, M.max(0, Dc.Q(split))), k.blueSoft);
      if (has(show, 'ps')) Ac.area(function () { return split; }, function (q) { return M.max(0, Sc.P(q)); }, 0, M.min(qx, M.max(0, Sc.Q(split))), k.orangeSoft);
      var res = { e: e, qf: qf, split: split };
      if (qf != null && has(show, 'dwl') && M.abs(qf - e.q) > 1e-9) {
        var a = M.min(qf, e.q), b = M.max(qf, e.q), pts = [], n = 30, i;
        for (i = 0; i <= n; i++) { var x = a + (b - a) * i / n; pts.push([x, Dc.P(x)]); }
        for (i = n; i >= 0; i--) { x = a + (b - a) * i / n; pts.push([x, M.max(0, Sc.P(x))]); }
        Ac.hatch(pts); Ac.vline(qf, k.muted, { w: 1.6, dash: [5, 4] });
        if (!F.quiet) dwlLabel(Ac, qf, Dc.P(qf), M.max(0, Sc.P(qf)), e.q, e.p);
        res.dwl = surplus(Dc, Sc, qf).dwl;
      }
      if (!F.quiet && has(show, 'cs') && Dc.Q(split) > 0) Ac.label('CS', qx * 0.3, split + (Dc.P(qx * 0.3) - split) * 0.38, k.blue, { size: 12 });
      if (!F.quiet && has(show, 'ps') && Sc.Q(split) > 0) Ac.label('PS', qx * 0.3, split - (split - M.max(0, Sc.P(qx * 0.3))) * 0.38, k.orange2, { size: 12 });
      res.cs = cs(Dc, split, M.min(qx, M.max(0, Dc.Q(split)))); res.ps = ps(Sc, split, M.min(qx, M.max(0, Sc.Q(split))));
      return res;
    }
    function draw() {
      k = K(); clearC(c);
      if (twin) { drawBoth(); KN.place(); return; }
      A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
      var C = cur(), Dc = C.D, Sc = C.S, moved = sh.D || sh.S, e = equilibrium(Dc, Sc), tl = [], say = [], txt = '';
      var sres = surplusAreas(A, Dc, Sc);
      if (mode === 'double' && !F.quiet) { // the range of the ambiguous variable
        var ds = doubleShift(D0, S0, sh.D, sh.S), r = ds.range;
        A.clip(function () { if (ds.ambiguous === 'p') polyPx(c.ctx, [[A.L, A.Y(r[0])], [A.Rx, A.Y(r[0])], [A.Rx, A.Y(r[1])], [A.L, A.Y(r[1])]], k.goldSoft); else polyPx(c.ctx, [[A.X(r[0]), A.T], [A.X(r[1]), A.T], [A.X(r[1]), A.B], [A.X(r[0]), A.B]], k.goldSoft); });
        if (ds.ambiguous === 'p') A.label('Price: depends on the sizes', A.xmin + (A.xmax - A.xmin) * 0.03, M.max(r[1], (r[0] + r[1]) / 2 + A.ymax * 0.06) + A.ymax * 0.035, k.gold, { align: 'left', size: 11 }); else A.label('Quantity: depends on the sizes', (r[0] + r[1]) / 2, A.ymax * 0.95, k.gold, { size: 11 });
      }
      curveSet(A, Dc, Sc, sh.D && C.t > 0 ? D0 : null, sh.S && C.t > 0 ? S0 : null);
      if (sh.D && C.t > 0.05) shiftArrow(A, D0, Dc, k.blue, e0.p);
      if (sh.S && C.t > 0.05) shiftArrow(A, S0, Sc, k.orange, e0.p);
      if (moved && has(show, 'eq')) {
        var e1 = equilibrium(D0.shift(sh.D), S0.shift(sh.S));
        eqPoint(A, e0, 'E' + sub(1), false);
        if (!hasSteps || step === 2) { eqPoint(A, step === 2 && hasSteps ? equilibrium(Dc, Sc) : e, 'E' + sub(2), false); if (!F.quiet) { A.tagY(e0.p, P$(o, e0.p), k.muted); A.tagY(e1.p, P$(o, e1.p), k.ink); A.tagX(e0.q, fm(e0.q), k.muted); A.tagX(e1.q, fm(e1.q), k.ink); } }
        if (hasSteps && step === 1 && !F.quiet) { // the gap at the old price
          var D1 = D0.shift(sh.D), S1 = S0.shift(sh.S), qd = D1.Q(e0.p), qs = S1.Q(e0.p);
          A.hline(e0.p, k.muted, { w: 1.4, dash: [4, 4] }); A.dot(qd, e0.p, k.blue, 4.5); A.dot(qs, e0.p, k.orange, 4.5);
          A.label((qd > qs ? 'Shortage ' : 'Surplus ') + fm(M.abs(qd - qs)), M.max(qd, qs), e0.p, k.red, { dy: 14, dx: 8, align: 'left', size: 11.5 });
        }
        tl.push({ k: 'Price', v: P$(o, e0.p) + ' → ' + P$(o, e1.p), c: k.ink }, { k: 'Quantity', v: fm(e0.q) + ' → ' + fm(e1.q), c: k.ink });
        if (mode === 'double') {
          var dsx = doubleShift(D0, S0, sh.D, sh.S), amb = dsx.ambiguous === 'p' ? 'price' : 'quantity', sure = dsx.ambiguous === 'p' ? (e1.q > e0.q ? 'rises' : 'falls') : (e1.p > e0.p ? 'rises' : 'falls');
          txt = 'Both curves moved. The ' + (amb === 'price' ? 'quantity' : 'price') + ' <b>' + sure + '</b> for sure. The ' + amb + ' <b>depends on the sizes</b> of the two shifts: with these sizes it ' + (M.abs((amb === 'price' ? e1.p - e0.p : e1.q - e0.q)) < 1e-9 ? 'stays the same' : ((amb === 'price' ? e1.p > e0.p : e1.q > e0.q) ? 'rises' : 'falls')) + '. Move the sliders to see it go either way.';
        } else if (det != null) { var dd = dets[det]; txt = '<b>' + dd.label + '.</b> ' + (dd.why ? dd.why + ': ' : '') + (dd.curve === 'D' ? 'a <b>change in demand</b>' : 'a <b>change in supply</b>') + ' (the whole curve shifts ' + (dd.dir > 0 ? 'right' : 'left') + '). The price goes from ' + P$(o, e0.p) + ' to ' + P$(o, e1.p) + ' and the quantity from ' + fm(e0.q) + ' to ' + fm(e1.q) + '. The other curve did not shift: ' + alongWords() + '.'; }
        else txt = shiftWords() + ' Equilibrium moves from E₁ (' + P$(o, e0.p) + ', ' + fm(e0.q) + ') to E₂ (' + P$(o, e1.p) + ', ' + fm(e1.q) + '); ' + alongWords() + '.';
        say.push(shiftWords(), F.quiet ? '' : 'Equilibrium price ' + (e1.p > e0.p ? 'rose' : e1.p < e0.p ? 'fell' : 'stayed') + ' from ' + fm(e0.p) + ' to ' + fm(e1.p) + '; quantity from ' + fm(e0.q) + ' to ' + fm(e1.q) + '.');
      } else if (has(show, 'eq')) {
        eqPoint(A, e, null, true); tl.push({ k: 'Equilibrium price', v: P$(o, e.p), c: k.ink }, { k: 'Equilibrium quantity', v: fm(e.q), c: k.ink });
        say.push('Demand and supply cross at a price of ' + (F.quiet ? 'the equilibrium' : fm(e.p)) + (F.quiet ? '.' : ' and a quantity of ' + fm(e.q) + '.'));
        if (mode === 'shift') txt = 'Pick an event. Each one shifts <b>one</b> curve. Watch the other curve: it does not move, but the price change moves buyers or sellers <b>along</b> it.';
      }
      if (mode === 'move') {
        var qa = e0.q, qb = D0.Q(moveP);
        A.dot(qa, e0.p, k.muted, 5); A.label('A', qa, e0.p, k.muted, { dx: 12, dy: -12, size: 12 });
        if (M.abs(qb - qa) > 0.05) A.par(function (t) { return lerp(qa, qb, t); }, function (t) { return D0.P(lerp(qa, qb, t)); }, 0, 1, k.gold, { w: 5, alpha: 0.55 });
        A.guide(qb, moveP); A.knob(qb, moveP, k.blue, 8); A.label('B', qb, moveP, k.blue, { dx: 14, dy: -14, size: 12 });
        if (!F.quiet) { A.tagY(moveP, P$(o, moveP), k.blue); A.tagX(qb, fm(qb), k.blue); }
        var dir = moveP < e0.p - 1e-9 ? 'fell' : moveP > e0.p + 1e-9 ? 'rose' : 'did not change';
        txt = 'The price ' + dir + (dir === 'did not change' ? '' : ' from ' + P$(o, e0.p) + ' to ' + P$(o, moveP)) + ', so quantity demanded ' + (qb > qa + 1e-9 ? 'rose' : qb < qa - 1e-9 ? 'fell' : 'stayed') + ' from ' + fm(qa) + ' to ' + fm(qb) + '. That is a movement <b>along</b> the demand curve: a <b>change in quantity demanded</b>. The curve itself did not move. Only something other than the good’s own price shifts it.';
        tl = [{ k: 'Price', v: P$(o, e0.p) + ' → ' + P$(o, moveP), c: k.blue }, { k: 'Quantity demanded', v: fm(qa) + ' → ' + fm(qb), c: k.blue }];
        say = ['A demand curve with point A and a draggable point B on it.' + (F.quiet ? '' : ' Price ' + fm(moveP) + ', quantity demanded ' + fm(qb) + '.')];
      }
      if (price != null) { // the price line, with quantity demanded and supplied
        var qd2 = M.max(0, Dc.Q(price)), qs2 = M.max(0, Sc.Q(price)), gap = qd2 - qs2, col = k.red;
        A.hline(price, k.ink, { w: 2, dash: [2, 0] });
        A.dot(qd2, price, k.blue, 5); A.dot(qs2, price, k.orange, 5);
        A.knob(A.xmin + (A.xmax - A.xmin) * 0.97, price, k.ink, 7);
        if (!F.quiet && has(show, 'gaps') && M.abs(gap) > 1e-6) {
          var yb = price + (gap > 0 ? -1 : 1) * R.yMax * 0.045;
          A.seg(qs2, yb, qd2, yb, col, { w: 2 }); A.seg(qs2, yb - R.yMax * 0.015, qs2, yb + R.yMax * 0.015, col, { w: 2 }); A.seg(qd2, yb - R.yMax * 0.015, qd2, yb + R.yMax * 0.015, col, { w: 2 });
          A.label((gap > 0 ? 'Shortage ' : 'Surplus ') + fm(M.abs(gap)), (qd2 + qs2) / 2, yb, col, { dy: gap > 0 ? 13 : -13, size: 11.5 });
          A.arrow(A.xmin + (A.xmax - A.xmin) * 0.03, price, A.xmin + (A.xmax - A.xmin) * 0.03, price + (gap > 0 ? 1 : -1) * R.yMax * 0.09, col, 2.4);
        }
        if (!F.quiet) { A.tagX(qd2, fm(qd2), k.blue); A.tagX(qs2, fm(qs2), k.orange); }
        tl.push({ k: 'At ' + P$(o, price) + ': demanded', v: fm(qd2), c: k.blue }, { k: 'supplied', v: fm(qs2), c: k.orange });
        if (has(show, 'gaps')) tl.push({ k: gap > 1e-9 ? 'Shortage' : gap < -1e-9 ? 'Surplus' : 'Gap', v: fm(M.abs(gap)), c: k.red, hi: true });
        txt = (txt ? txt + '<br>' : '') + 'At ' + P$(o, price) + ' buyers want ' + fm(qd2) + ' and sellers offer ' + fm(qs2) + '. ' + (gap > 1e-9 ? 'That is a <b>shortage</b> of ' + fm(gap) + ': buyers compete for the goods and push the price <b>up</b>.' : gap < -1e-9 ? 'That is a <b>surplus</b> of ' + fm(-gap) + ': sellers cut prices to sell, so the price is pushed <b>down</b>.' : 'No gap: this is the equilibrium price.');
        say.push('A price line at ' + (F.quiet ? 'a set price' : fm(price)) + '.');
      }
      if (has(show, 'cs') || has(show, 'ps') || sres.dwl != null) {
        if (has(show, 'cs')) tl.push({ k: 'Consumer surplus', v: P$(o, sres.cs), c: k.blue });
        if (has(show, 'ps')) tl.push({ k: 'Producer surplus', v: P$(o, sres.ps), c: k.orange });
        if (sres.dwl != null) tl.push({ k: 'Deadweight loss', v: P$(o, sres.dwl), c: k.muted, hi: true });
        if (!txt) txt = (has(show, 'cs') ? 'Consumer surplus is the blue area: what buyers would have paid above the price, added up over the units they buy. ' : '') + (has(show, 'ps') ? 'Producer surplus is the orange area: the price above each unit’s cost. ' : '') + (sres.dwl != null ? 'With ' + fm(sres.qf) + ' units instead of ' + fm(sres.e.q) + ', the hatched triangle is surplus that no one gets: the <b>deadweight loss</b>.' : '');
      }
      if (eqs) eqs.innerHTML = keyHTML(k.blue, '<b>D</b>: ') + qForm(Dc, 'D') + ', or ' + pForm(Dc) + ' &nbsp; ' + keyHTML(k.orange, '<b>S</b>: ') + qForm(Sc, 'S') + ', or ' + pForm(Sc);
      if (has(show, 'equations')) { A.dot(0, Dc.p0, k.blue, 4.5); A.dot(Dc.Q(0), 0, k.blue, 4.5); if (Sc.p0 >= 0) A.dot(0, Sc.p0, k.orange, 4.5); else A.dot(Sc.Q(0), 0, k.orange, 4.5); }
      marksOn(c, A, o.marks);
      T.set(tl); F.set(txt);
      F.say('Supply and demand graph. ' + say.join(' ')); KN.place();
    }
    function drawBoth() {
      var wide = c.w >= 560, gap = 14;
      if (wide) { A.set({ x: 0, y: 0, w: (c.w - gap) / 2, h: c.h }); A2.set({ x: (c.w + gap) / 2, y: 0, w: (c.w - gap) / 2, h: c.h }); }
      else { A.set({ x: 0, y: 0, w: c.w, h: (c.h - gap) / 2 }); A2.set({ x: 0, y: (c.h + gap) / 2, w: c.w, h: (c.h - gap) / 2 }); }
      A.draw(); A2.draw();
      // left: a movement along D
      A.lin(D0, k.blue); A.name(D0, 'D', k.blue);
      var qa = D0.Q(e0.p), qb = D0.Q(bothP);
      A.guide(qa, e0.p); A.guide(qb, bothP);
      A.dot(qa, e0.p, k.muted, 5.5); A.label('A', qa, e0.p, k.muted, { dx: 13, dy: -12, size: 12 });
      if (M.abs(qb - qa) > 0.05) A.par(function (t) { return lerp(qa, qb, t); }, function (t) { return D0.P(lerp(qa, qb, t)); }, 0, 1, k.gold, { w: 5, alpha: 0.6 });
      A.dot(qb, bothP, k.blue, 6.5); A.label('B', qb, bothP, k.blue, { dx: 13, dy: -12, size: 12 });
      // right: a shift of D
      var D2 = D0.shift(bothS);
      A2.lin(D0, k.blue, { dash: [7, 6], w: 2.2, alpha: 0.7 }); A2.lin(D2, k.blue); A2.name(D0, 'D' + sub(1), k.blue, 0.78); A2.name(D2, 'D' + sub(2), k.blue, 0.95);
      var qc = D2.Q(e0.p); A2.guide(qa, e0.p); A2.guide(qc, e0.p);
      A2.dot(qa, e0.p, k.muted, 5.5); A2.label('A', qa, e0.p, k.muted, { dx: -12, dy: -12, size: 12 });
      if (M.abs(qc - qa) > 0.05) A2.arrow(qa, e0.p, qc, e0.p, k.blue, 2.4);
      A2.dot(qc, e0.p, k.blue, 6.5); A2.label('B', qc, e0.p, k.blue, { dx: 12, dy: -12, size: 12 });
      if (!F.quiet) { A.tagX(qa, fm(qa), k.muted); A.tagX(qb, fm(qb), k.blue); A2.tagX(qc, fm(qc), k.blue); A2.tagX(qa, fm(qa), k.muted); }
      T.set([{ k: 'Left: quantity demanded', v: fm(qa) + ' → ' + fm(qb), c: k.blue }, { k: 'Right: demand at the same price', v: fm(qa) + ' → ' + fm(qc), c: k.blue }]);
      F.set('<b>Left:</b> only the price changed, so buyers moved <b>along</b> the same curve, from A to B: a <b>change in quantity demanded</b>. <b>Right:</b> the price stayed the same but income changed, so the <b>whole curve shifted</b>: a <b>change in demand</b>. Buyers want ' + (bothS >= 0 ? 'more' : 'less') + ' at every price.');
      F.say('Two demand graphs side by side. Left: a movement along one demand curve after a price change. Right: the demand curve shifts after an income change, at the same price.');
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-intervention: price controls, taxes, subsidies, a world price, tariffs and quotas (see the header) */
  V.register('ec-intervention', function (el, o) {
    o = opt(o, { mode: 'tax', on: 'sellers' });
    var mode = o.mode, F = frame(el, o, 'Supply and demand with a government policy'), k = K();
    var D0 = curve(o.demand, 'D'), S0 = curve(o.supply, 'S'), e = equilibrium(D0, S0);
    var defLevel = { ceiling: e.p * 0.7, floor: e.p * 1.3, tax: e.p / 2, subsidy: e.p / 3, world: e.p * 0.6, tariff: e.p * 0.6, quota: e.p * 0.6 }[mode];
    var lvl = num(o.level, M.round(defLevel * 4) / 4), on = o.on === 'buyers' ? 'buyers' : 'sellers';
    var w0 = (mode === 'tariff' || mode === 'quota') ? world(D0, S0, lvl) : null;
    var tf = num(o.tariff, w0 ? M.round((e.p - lvl) / 2 * 4) / 4 : 0), qta = num(o.quota, w0 ? M.round(w0.imports / 2) : 0);
    var show = o.show || { ceiling: ['cs', 'ps', 'dwl', 'gaps'], floor: ['cs', 'ps', 'dwl', 'gaps'], tax: ['cs', 'ps', 'revenue', 'dwl', 'incidence'], subsidy: ['revenue', 'dwl'], world: ['cs', 'ps', 'gaps'], tariff: ['cs', 'ps', 'revenue', 'dwl'], quota: ['cs', 'ps', 'revenue', 'dwl'] }[mode] || [];
    var R = sdRange(o, [D0, mode === 'subsidy' ? D0 : D0], [S0]);
    if (mode === 'tax' && on === 'sellers') R.yMax = M.max(R.yMax, niceCeil(D0.p0 * 1.08));
    var c = F.canvas(function (w) { return hw(w, 1.5, 0.98); }), A = axes(c, axOpts(o, R));
    var T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);
    var hasLine = mode === 'ceiling' || mode === 'floor' || mode === 'world' || mode === 'tariff' || mode === 'quota';
    if (F.inter) {
      if (mode === 'tax' || mode === 'subsidy') V.slider(F.ctl, { label: mode === 'tax' ? 'Tax per unit' : 'Subsidy per unit', min: 0, max: M.round(e.p * (mode === 'tax' ? 1.2 : 0.8) * 4) / 4, step: 0.25, value: lvl, fmt: function (v) { return P$(o, v); }, input: function (v) { lvl = v; draw(); } });
      if (mode === 'tax') V.seg(F.ctl, { label: 'Who sends the check to the government?', items: [['sellers', 'Sellers pay it'], ['buyers', 'Buyers pay it']], value: on, change: function (v) { on = v; draw(); } });
      if (mode === 'tariff') V.slider(F.ctl, { label: 'Tariff per unit', min: 0, max: M.round((e.p - lvl) * 1.2 * 4) / 4 || 1, step: 0.25, value: tf, fmt: function (v) { return P$(o, v); }, input: function (v) { tf = v; draw(); } });
      if (mode === 'quota') V.slider(F.ctl, { label: 'Import quota', min: 0, max: M.ceil(world(D0, S0, lvl).imports), step: 0.5, value: qta, input: function (v) { qta = v; draw(); } });
    }
    var KN = knobs(F, c, F.inter && hasLine ? [{ name: mode === 'ceiling' ? 'Price ceiling' : mode === 'floor' ? 'Price floor' : 'World price',
      pos: function () { return [A.X(A.xmin + (A.xmax - A.xmin) * 0.97), A.Y(lvl)]; }, hitd: function (px, py) { return px < A.L - 30 ? 99 : M.abs(py - A.Y(lvl)); },
      drag: function (px, py) { lvl = clamp(M.round(A.p(py) * 4) / 4, 0.25, R.yMax); }, key: function (dx, dy, bg) { lvl = clamp(lvl + (dy || dx) * (bg ? 1 : 0.25), 0.25, R.yMax); }, text: function () { return P$(o, lvl); } }] : [], function () { draw(); });

    function lab(s, q, p, col, lo) { if (!F.quiet) A.label(s, q, p, col, lo); }
    function tri(a, b, top, bot) { var pts = [], n = 24, i; for (i = 0; i <= n; i++) { var x = a + (b - a) * i / n; pts.push([x, top(x)]); } for (i = n; i >= 0; i--) { x = a + (b - a) * i / n; pts.push([x, bot(x)]); } return pts; }
    function Sp(q) { return M.max(0, S0.P(q)); }
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
      var tl = [], txt = '', say = '', qe = e.q;
      var cmon = function (top, a, b, price) { if (b > a) A.area(top, function () { return price; }, a, b, k.blueSoft); };
      var pmon = function (bot, a, b, price) { if (b > a) A.area(function () { return price; }, bot, a, b, k.orangeSoft); };
      if (mode === 'ceiling' || mode === 'floor') {
        var r = mode === 'ceiling' ? ceiling(D0, S0, lvl) : floor(D0, S0, lvl), qt = r.q, pp = r.binding ? lvl : e.p;
        if (has(show, 'cs')) cmon(D0.P, 0, qt, pp);
        if (has(show, 'ps')) pmon(Sp, 0, qt, pp);
        if (r.binding && has(show, 'dwl')) { A.hatch(tri(qt, qe, D0.P, Sp)); if (!F.quiet) dwlLabel(A, qt, D0.P(qt), Sp(qt), qe, e.p); }
        A.lin(D0, k.blue); A.lin(S0, k.orange); A.name(D0, 'D', k.blue); A.name(S0, 'S', k.orange);
        A.hline(lvl, k.red, { w: 2.6 }); A.knob(A.xmin + (A.xmax - A.xmin) * 0.97, lvl, k.red, 7);
        lab(mode === 'ceiling' ? 'Price ceiling' : 'Price floor', A.xmax * 0.95, lvl, k.red, { dy: mode === 'ceiling' ? 14 : -14, align: 'right', size: 11.5 });
        A.dot(qe, e.p, k.muted, 4.5);
        if (r.binding) {
          A.dot(r.qd, lvl, k.blue, 5); A.dot(r.qs, lvl, k.orange, 5); A.vline(qt, k.muted, { w: 1.2, dash: [3, 4], to: D0.P(qt) });
          if (has(show, 'gaps') && !F.quiet) { var y2 = lvl + (mode === 'ceiling' ? -1 : 1) * R.yMax * 0.06; A.seg(r.qs, y2, r.qd, y2, k.red, { w: 2 }); A.label((mode === 'ceiling' ? 'Shortage ' : 'Surplus ') + fm(r.gap), (r.qd + r.qs) / 2, y2, k.red, { dy: mode === 'ceiling' ? 12 : -12, size: 11.5 }); A.tagX(r.qd, fm(r.qd), k.blue); A.tagX(r.qs, fm(r.qs), k.orange); }
        }
        if (!F.quiet) { A.tagY(lvl, P$(o, lvl), k.red); if (!r.binding) A.tagY(e.p, P$(o, e.p), k.muted); }
        tl.push({ k: mode === 'ceiling' ? 'Ceiling' : 'Floor', v: P$(o, lvl), c: k.red }, { k: 'Binding?', v: r.binding ? 'Yes' : 'No', c: k.red, hi: r.binding });
        if (r.binding) tl.push({ k: mode === 'ceiling' ? 'Shortage' : 'Surplus', v: fm(r.gap), c: k.red }, { k: 'Quantity traded', v: fm(qt), c: k.ink });
        if (has(show, 'cs')) tl.push({ k: 'Consumer surplus', v: P$(o, r.cs), c: k.blue }); if (has(show, 'ps')) tl.push({ k: 'Producer surplus', v: P$(o, r.ps), c: k.orange }); if (has(show, 'dwl')) tl.push({ k: 'Deadweight loss', v: P$(o, r.dwl), c: k.muted });
        if (!r.binding) txt = 'The ' + (mode === 'ceiling' ? 'ceiling' : 'floor') + ' is ' + (mode === 'ceiling' ? 'above' : 'below') + ' the equilibrium price of ' + P$(o, e.p) + ', so it is <b>not binding</b>: the market price is legal, and nothing changes.';
        else txt = 'The ' + (mode === 'ceiling' ? 'ceiling' : 'floor') + ' at ' + P$(o, lvl) + ' is <b>binding</b>: it sits ' + (mode === 'ceiling' ? 'below' : 'above') + ' the equilibrium price of ' + P$(o, e.p) + '. Buyers want ' + fm(r.qd) + ' but sellers offer ' + fm(r.qs) + ', a <b>' + (mode === 'ceiling' ? 'shortage' : 'surplus') + '</b> of ' + fm(r.gap) + '. Only ' + fm(qt) + ' units are traded, the ' + (mode === 'ceiling' ? 'quantity supplied' : 'quantity demanded') + ' (the short side of the market), and the hatched triangle is lost.';
        say = 'A ' + (mode === 'ceiling' ? 'price ceiling' : 'price floor') + ' line on a supply and demand graph' + (F.quiet ? '.' : (r.binding ? ', binding, with a ' + (mode === 'ceiling' ? 'shortage' : 'surplus') + ' of ' + fm(r.gap) + '.' : ', not binding.'));
      } else if (mode === 'tax') {
        var t = tax(D0, S0, lvl), q = t.q;
        if (has(show, 'cs')) cmon(D0.P, 0, q, t.pb);
        if (has(show, 'ps')) pmon(Sp, 0, q, t.ps);
        if (has(show, 'revenue') && lvl > 0) { A.poly([[0, t.ps], [q, t.ps], [q, t.pb], [0, t.pb]], k.goldSoft); lab('Tax revenue', q / 2, (t.pb + t.ps) / 2, k.gold, { size: 11.5 }); }
        if (has(show, 'dwl') && lvl > 0) { A.hatch(tri(q, qe, D0.P, Sp)); if (!F.quiet) dwlLabel(A, q, t.pb, t.ps, qe, e.p); }
        A.lin(D0, k.blue); A.lin(S0, k.orange); A.name(D0, 'D', k.blue); A.name(S0, 'S', k.orange);
        if (lvl > 0) {
          if (on === 'sellers') { var St = S0.up(lvl); A.lin(St, k.orange2, { dash: [9, 5], w: 2.4 }); A.name(St, 'S + tax', k.orange2, 0.7); }
          else { var Dt = D0.up(-lvl); A.lin(Dt, k.blue2, { dash: [9, 5], w: 2.4 }); A.name(Dt, 'D − tax', k.blue2, 0.62); }
          A.hline(t.pb, k.blue, { w: 1.3, dash: [3, 4], to: q }); A.hline(t.ps, k.orange, { w: 1.3, dash: [3, 4], to: q }); A.vline(q, k.muted, { w: 1.3, dash: [3, 4], to: t.pb });
          A.dot(q, t.pb, k.blue, 5); A.dot(q, t.ps, k.orange, 5); A.dot(qe, e.p, k.muted, 4.5);
          if (has(show, 'incidence') && !F.quiet) { // the wedge split at the old price
            var bx = q + (A.xmax - A.xmin) * 0.025, ctx = c.ctx; ctx.save(); ctx.lineWidth = 6; ctx.lineCap = 'butt';
            ctx.strokeStyle = k.blue; ctx.beginPath(); ctx.moveTo(A.X(bx), A.Y(t.pb)); ctx.lineTo(A.X(bx), A.Y(e.p)); ctx.stroke();
            ctx.strokeStyle = k.orange; ctx.beginPath(); ctx.moveTo(A.X(bx), A.Y(e.p)); ctx.lineTo(A.X(bx), A.Y(t.ps)); ctx.stroke(); ctx.restore();
            A.label('Buyers ' + pct(t.buyer, 0), bx, (t.pb + e.p) / 2, k.blue, { dx: 8, align: 'left', size: 11 }); A.label('Sellers ' + pct(t.seller, 0), bx, (e.p + t.ps) / 2, k.orange2, { dx: 8, align: 'left', size: 11 });
          }
          if (!F.quiet) { A.tagY(t.pb, 'Pb ' + P$(o, t.pb), k.blue); A.tagY(t.ps, 'Ps ' + P$(o, t.ps), k.orange); A.tagX(q, fm(q), k.ink); }
        } else { A.guide(qe, e.p); A.dot(qe, e.p, k.ink, 6); }
        tl.push({ k: 'Buyers pay (Pb)', v: P$(o, t.pb), c: k.blue }, { k: 'Sellers keep (Ps)', v: P$(o, t.ps), c: k.orange }, { k: 'Quantity', v: fm(e.q) + ' → ' + fm(q), c: k.ink });
        if (has(show, 'revenue')) tl.push({ k: 'Tax revenue', v: P$(o, t.rev), c: k.gold }); if (has(show, 'dwl')) tl.push({ k: 'Deadweight loss', v: P$(o, t.dwl), c: k.muted });
        if (has(show, 'incidence')) tl.push({ k: 'Buyers’ share', v: pct(t.buyer, 0), c: k.blue }, { k: 'Sellers’ share', v: pct(t.seller, 0), c: k.orange });
        txt = lvl > 0 ? 'A tax of ' + P$(o, lvl) + ' per unit, sent in by ' + (on === 'sellers' ? 'sellers (supply shifts up by the tax)' : 'buyers (demand shifts down by the tax)') + '. Either way buyers pay <b>' + P$(o, t.pb) + '</b>, sellers keep <b>' + P$(o, t.ps) + '</b>, and ' + fm(q) + ' units are sold. The price buyers pay rises by ' + P$(o, t.pb - e.p) + ', not by the whole tax: buyers bear ' + pct(t.buyer, 0) + ' and sellers ' + pct(t.seller, 0) + '. The side that responds less to price bears more.' : 'Move the slider to put a tax on this market.';
        say = 'Supply and demand with a per-unit tax' + (F.quiet ? '.' : ' of ' + fm(lvl) + ': buyers pay ' + fm(t.pb) + ', sellers keep ' + fm(t.ps) + ', quantity ' + fm(q) + '.');
        if (o.elasticities) {
          var eD = M.abs(pointE(D0, qe)), eS = pointE(S0, qe), share = eS / (eS + eD);
          tl.push({ k: '|εD| at equilibrium', v: fm(eD, 3), c: k.blue }, { k: 'εS at equilibrium', v: fm(eS, 3), c: k.orange });
          txt += '<br>Incidence formula: buyers’ share = ε<sub>S</sub> ÷ (ε<sub>S</sub> + |ε<sub>D</sub>|) = ' + fm(eS, 3) + ' ÷ ' + fm(eS + eD, 3) + ' = <b>' + pct(share, 1) + '</b>. Deadweight loss grows with the <b>square</b> of the tax: double the tax and the triangle is four times as big.';
          inset(t);
        }
      } else if (mode === 'subsidy') {
        var u = subsidy(D0, S0, lvl), qs2 = u.q;
        if (has(show, 'revenue') && lvl > 0) { A.poly([[0, u.pb], [qs2, u.pb], [qs2, u.ps], [0, u.ps]], k.redSoft); lab('Cost to taxpayers', qs2 * 0.42, (u.pb + u.ps) / 2, k.red, { size: 11.5 }); }
        if (has(show, 'cs')) cmon(D0.P, 0, qs2, u.pb); if (has(show, 'ps')) pmon(Sp, 0, qs2, u.ps);
        if (has(show, 'dwl') && lvl > 0) { A.hatch(tri(qe, qs2, Sp, D0.P)); if (!F.quiet) A.label('DWL', (qe + 2 * qs2) / 3, (Sp(qs2) + D0.P(qs2) + e.p) / 3, k.ink, { size: 11 }); }
        A.lin(D0, k.blue); A.lin(S0, k.orange); A.name(D0, 'D', k.blue); A.name(S0, 'S', k.orange);
        if (lvl > 0) {
          var Ss = S0.up(-lvl); A.lin(Ss, k.orange2, { dash: [9, 5], w: 2.4 }); A.name(Ss, 'S − subsidy', k.orange2, 0.75);
          A.dot(qs2, u.pb, k.blue, 5); A.dot(qs2, u.ps, k.orange, 5); A.vline(qs2, k.muted, { w: 1.3, dash: [3, 4], to: u.ps }); A.dot(qe, e.p, k.muted, 4.5);
          if (!F.quiet) { A.tagY(u.pb, 'Pb ' + P$(o, u.pb), k.blue); A.tagY(u.ps, 'Ps ' + P$(o, u.ps), k.orange); A.tagX(qs2, fm(qs2), k.ink); }
        }
        tl.push({ k: 'Buyers pay', v: P$(o, u.pb), c: k.blue }, { k: 'Sellers get', v: P$(o, u.ps), c: k.orange }, { k: 'Quantity', v: fm(e.q) + ' → ' + fm(qs2), c: k.ink }, { k: 'Cost to taxpayers', v: P$(o, u.cost), c: k.red }, { k: 'Buyers + sellers gain', v: P$(o, u.csGain + u.psGain), c: k.green }, { k: 'Deadweight loss', v: P$(o, u.dwl), c: k.muted });
        txt = lvl > 0 ? 'A subsidy of ' + P$(o, lvl) + ' per unit. Buyers pay ' + P$(o, u.pb) + ', sellers receive ' + P$(o, u.ps) + ', and ' + fm(qs2) + ' units are sold. The subsidy costs taxpayers ' + P$(o, u.cost) + ' (the red rectangle reaches past the demand curve), but buyers and sellers gain only ' + P$(o, u.csGain + u.psGain) + '. The difference, ' + P$(o, u.dwl) + ', is the deadweight loss: units whose cost is more than they are worth to buyers.' : 'Move the slider to pay a subsidy on each unit sold.';
        say = 'Supply and demand with a per-unit subsidy.';
      } else { // world, tariff, quota
        var pw = lvl, wd = world(D0, S0, pw);
        var res = mode === 'tariff' ? tariff(D0, S0, pw, tf) : mode === 'quota' ? quota(D0, S0, pw, qta) : null, pd = res ? res.p : pw;
        var qd = res ? res.qd : wd.qd, qs = res ? res.qs : wd.qs;
        if (has(show, 'cs')) cmon(D0.P, 0, qd, pd);
        if (has(show, 'ps')) pmon(Sp, 0, qs, pd);
        if (!res && wd.imports > 0 && !F.quiet) A.area(function (q) { return M.min(D0.P(q), Sp(q)); }, function () { return pw; }, qs, qd, k.greenSoft); // the gains from trade
        if (!res && wd.imports < 0 && !F.quiet) A.area(function () { return pw; }, function (q) { return M.max(D0.P(q), Sp(q)); }, qd, qs, k.greenSoft);
        if (res && pd > pw + 1e-9) {
          if (has(show, 'revenue')) { A.poly([[qs, pw], [qd, pw], [qd, pd], [qs, pd]], k.goldSoft); lab(mode === 'quota' ? 'Quota rent (license holders)' : 'Tariff revenue', (qs + qd) / 2, (pw + pd) / 2, k.gold, { size: 11 }); }
          if (has(show, 'dwl')) { A.hatch(tri(res.free.qs, qs, Sp, function () { return pw; })); A.hatch(tri(qd, res.free.qd, D0.P, function () { return pw; })); }
          if (mode === 'quota') { var Sq = S0.shift(qta); A.fn(function (q) { var p = Sq.P(q); return p >= pw ? p : NaN; }, k.orange2, { dash: [9, 5], w: 2.2 }); A.name(Sq, 'S + quota', k.orange2, 0.55); }
        }
        A.lin(D0, k.blue); A.lin(S0, k.orange); A.name(D0, 'D', k.blue); A.name(S0, 'S', k.orange);
        A.hline(pw, k.green, { w: 2.6 }); lab('World price', A.xmax * 0.95, pw, k.green, { dy: 13, align: 'right', size: 11 });
        if (res && pd > pw + 1e-9) { A.hline(pd, k.red, { w: 2.2, dash: [8, 4] }); lab(mode === 'quota' ? 'Price with the quota' : 'World price + tariff', A.xmax * 0.95, pd, k.red, { dy: -13, align: 'right', size: 11 }); }
        A.knob(A.xmin + (A.xmax - A.xmin) * 0.97, pw, k.green, 7);
        A.dot(qd, pd, k.blue, 5); A.dot(qs, pd, k.orange, 5); A.dot(qe, e.p, k.muted, 4.5);
        var imp = qd - qs;
        if (has(show, 'gaps') && !F.quiet && M.abs(imp) > 1e-6) { var yy = pd - R.yMax * 0.06; A.seg(M.min(qs, qd), yy, M.max(qs, qd), yy, k.green, { w: 2 }); A.label((imp > 0 ? 'Imports ' : 'Exports ') + fm(M.abs(imp)), (qs + qd) / 2, yy, k.green, { dy: 12, size: 11.5 }); }
        if (!F.quiet) { A.tagY(pw, P$(o, pw), k.green); if (res && pd > pw + 1e-9) A.tagY(pd, P$(o, pd), k.red); A.tagX(qs, fm(qs), k.orange); A.tagX(qd, fm(qd), k.blue); }
        tl.push({ k: 'Domestic price', v: P$(o, pd), c: k.ink }, { k: 'Bought here', v: fm(qd), c: k.blue }, { k: 'Made here', v: fm(qs), c: k.orange }, { k: imp >= 0 ? 'Imports' : 'Exports', v: fm(M.abs(imp)), c: k.green });
        if (!res) {
          tl.push({ k: 'Change in CS', v: P$(o, wd.dcs), c: k.blue }, { k: 'Change in PS', v: P$(o, wd.dps), c: k.orange }, { k: 'Net gain', v: P$(o, wd.gain), c: k.green, hi: true });
          txt = pw < e.p ? 'At the world price of ' + P$(o, pw) + ' (below the price without trade, ' + P$(o, e.p) + ') the country <b>imports</b> ' + fm(imp) + ' units. Consumers gain ' + P$(o, wd.dcs) + ' and domestic producers lose ' + P$(o, -wd.dps) + ': the gains and losses fall on different people, and the gains are larger (green triangle, net ' + P$(o, wd.gain) + ').' : pw > e.p ? 'At the world price of ' + P$(o, pw) + ' (above the price without trade) the country <b>exports</b> ' + fm(-imp) + ' units. Producers gain ' + P$(o, wd.dps) + ', consumers here lose ' + P$(o, -wd.dcs) + ', and the net gain is ' + P$(o, wd.gain) + '.' : 'The world price equals the price without trade: no trade.';
        } else {
          tl.push({ k: mode === 'quota' ? 'Quota rent' : 'Tariff revenue', v: P$(o, mode === 'quota' ? res.rent : res.rev), c: k.gold }, { k: 'Consumers lose', v: P$(o, -(res.dcs || 0)), c: k.blue }, { k: 'Producers gain', v: P$(o, res.dps || 0), c: k.orange }, { k: 'Deadweight loss', v: P$(o, res.dwl || 0), c: k.muted });
          txt = mode === 'tariff' ? 'A tariff of ' + P$(o, res.t) + ' per unit raises the price here from ' + P$(o, pw) + ' to ' + P$(o, pd) + '. Buyers here pay it: foreign sellers still get the world price. Imports fall to ' + fm(imp) + '. Consumers lose ' + P$(o, -res.dcs) + '; producers here gain ' + P$(o, res.dps) + ', the government collects ' + P$(o, res.rev) + ', and the two hatched triangles (' + P$(o, res.dwl) + ') are lost to everyone.' + (res.prohibitive ? ' This tariff is high enough to stop imports.' : '') : 'A quota of ' + fm(qta) + ' units limits imports, so the price here rises to ' + P$(o, pd) + '. The rectangle that would be tariff revenue goes to whoever holds the import licenses: the <b>quota rent</b>. The deadweight loss is the same as for a tariff with the same price effect.';
        }
        say = 'Supply and demand in an open economy with a world price line' + (mode === 'tariff' ? ' and a tariff.' : mode === 'quota' ? ' and an import quota.' : '.');
      }
      marksOn(c, A, o.marks); T.set(tl); F.set(txt); F.say(say); KN.place();
    }
    function inset(t) { // deadweight loss against the tax: a parabola
      var w = M.min(170, A.W * 0.36), h = M.min(110, A.H * 0.32), x0 = A.Rx - w - 6, y0 = A.T + 4, ctx = c.ctx, tmax = M.max(lvl, e.p) * 1.2, dmax = tax(D0, S0, tmax).dwl || 1;
      ctx.save(); ctx.fillStyle = k.dark ? 'rgba(27,43,34,.94)' : 'rgba(251,248,240,.95)'; rr(ctx, x0, y0, w, h, 8); ctx.fill(); ctx.strokeStyle = k.grid; ctx.stroke();
      var X = function (v) { return x0 + 10 + (w - 20) * v / tmax; }, Y = function (v) { return y0 + h - 14 - (h - 30) * v / dmax; };
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(dmax) - 4); ctx.lineTo(X(0), Y(0)); ctx.lineTo(X(tmax), Y(0)); ctx.stroke();
      ctx.strokeStyle = k.muted; ctx.lineWidth = 2; ctx.beginPath(); for (var i = 0; i <= 40; i++) { var tv = tmax * i / 40, d = tax(D0, S0, tv).dwl; ctx[i ? 'lineTo' : 'moveTo'](X(tv), Y(d)); } ctx.stroke();
      dotPx(ctx, X(lvl), Y(t.dwl), k.red, 4.5); ctx.restore();
      txt2(ctx, 'DWL', x0 + 14, y0 + 10); txt2(ctx, 'tax', x0 + w - 8, y0 + h - 6, 'right');
    }
    function txt2(ctx, s, x, y, al) { txt(ctx, s, x, y, { size: 11, align: al || 'left', color: K().muted }); }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-elasticity: price elasticity along a line, revenue, steep vs flat, the extremes, supply, constant elasticity */
  V.register('ec-elasticity', function (el, o) {
    o = opt(o, { mode: 'line' });
    var mode = o.mode, F = frame(el, o, 'Price elasticity'), k = K(), T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);
    var isS = mode === 'supply' || (!!o.supply && !o.demand && mode === 'line');
    if (isS) mode = 'supply';
    var c, A, A2, KN, draw;
    function kind(E) { E = M.abs(E); return M.abs(E - 1) < 0.005 ? 'unit elastic (exactly 1)' : E > 1 ? 'elastic (greater than 1)' : 'inelastic (less than 1)'; }
    function mid(q1, p1, q2, p2, sign) { // the midpoint calculation, written out
      var r = midpoint(q1, p1, q2, p2), E = sign ? r.e : M.abs(r.e);
      return { E: r.e, html: '%ΔQ = (' + fm(q2) + ' − ' + fm(q1) + ') ÷ ' + fm((q1 + q2) / 2) + ' = <b>' + pct(r.dq) + '</b> &nbsp; %ΔP = (' + fm(p2) + ' − ' + fm(p1) + ') ÷ ' + fm((p1 + p2) / 2) + ' = <b>' + pct(r.dp) + '</b><br>Elasticity = ' + pct(M.abs(r.dq)) + ' ÷ ' + pct(M.abs(r.dp)) + ' = <b>' + (isFinite(E) ? fm(M.abs(E), 2) : '∞') + '</b>: ' + kind(r.e) + '.' };
    }
    if (mode === 'line' || mode === 'supply') {
      var stype = o.supply && o.supply.c != null ? (num(o.supply.c, 0) === 0 ? 'origin' : num(o.supply.c, 0) < 0 ? 'price' : 'qty') : 'origin';
      var SUP = { origin: { c: 0, d: 2 }, price: { c: -6, d: 2 }, qty: { c: 4, d: 2 } };
      var L = isS ? curve(o.supply || SUP[stype], 'S') : curve(o.demand, 'D'), vert = false;
      var Qint = isS ? 24 : L.Q(0), xMax = num(o.xMax, niceCeil(Qint * 1.02)), yMax = num(o.yMax, isS ? 12 : niceCeil(L.p0 * 1.1));
      var pts = (o.points || (isS ? [[6, 3], [12, 6]] : [[Qint * 0.2, 0], [Qint * 0.4, 0]])).map(function (p) { return num(p[0], 1); });
      var two = !isS && (o.show ? has(o.show, 'trcurve') : true);
      c = F.canvas(function (w) { return two ? (w >= 560 ? w / 1.05 : w * 1.45) : hw(w, 1.55, 1.02); });
      A = axes(c, axOpts(o, { xMax: xMax, yMax: yMax }, { title: isS ? '' : 'Demand' }));
      if (two) A2 = axes(c, { xmax: xMax, ymax: niceCeil(L.p0 * Qint / 4 * 1.12), xLabel: o.xLabel || 'Quantity', yLabel: 'Total revenue', money: !!o.money, title: 'Revenue = P × Q' });
      var show = o.show || ['midpoint', 'tr', 'trcurve', 'regions', 'point'];
      if (isS && F.inter && !o.supply) V.seg(F.ctl, { label: 'Kind of supply line', items: [['origin', 'Through the origin'], ['price', 'Starts on the price axis'], ['qty', 'Starts on the quantity axis'], ['vert', 'Vertical']], value: 'origin', change: function (v) { vert = v === 'vert'; if (!vert) L = curve(SUP[v], 'S'); draw(); } });
      var qMaxPt = isS ? xMax * 0.98 : Qint * 0.98;
      KN = knobs(F, c, F.inter ? [0, 1].map(function (i) {
        return { name: 'Point ' + 'AB'[i], pos: function () { var q = vert ? xMax * 0.5 : pts[i], p = vert ? yMax * (i ? 0.7 : 0.35) : L.P(q); return [A.X(q), A.Y(p)]; },
          drag: function (px) { if (vert) return; pts[i] = clamp(M.round(A.q(px) * 4) / 4, 0.25, qMaxPt); }, key: function (dx, dy, bg) { if (vert) return; pts[i] = clamp(pts[i] + (dx || (L.m < 0 ? -dy : dy)) * (bg ? 1 : 0.25), 0.25, qMaxPt); },
          text: function () { return vert ? 'vertical supply' : 'quantity ' + fm(pts[i]) + ', price ' + fm(L.P(pts[i])); } };
      }) : [], function () { draw(); });
      draw = function () {
        k = K(); clearC(c); var gap = 14;
        if (two) { var hh = (c.h - gap) * 0.56; A.set({ x: 0, y: 0, w: c.w, h: hh }); A2.set({ x: 0, y: hh + gap, w: c.w, h: c.h - hh - gap }); } else A.set({ x: 0, y: 0, w: c.w, h: c.h });
        var midq = Qint / 2, tl = [], txt = '';
        if (!isS && has(show, 'regions') && !F.quiet) {
          A.clip(function () { polyPx(c.ctx, [[A.X(0), A.T], [A.X(midq), A.T], [A.X(midq), A.B], [A.X(0), A.B]], k.tealSoft); polyPx(c.ctx, [[A.X(midq), A.T], [A.X(Qint), A.T], [A.X(Qint), A.B], [A.X(midq), A.B]], k.purpleSoft); });
        }
        A.draw();
        if (!isS && has(show, 'regions') && !F.quiet) { A.label('Elastic', midq * 0.5, A.ymax * 0.93, k.teal, { size: 11.5 }); A.label('Inelastic', midq * 1.5, A.ymax * 0.93, k.purple, { size: 11.5 }); A.dot(midq, L.P(midq), k.ink, 4.5); A.label('Unit elastic', midq, L.P(midq), k.ink, { dx: 12, dy: -14, align: 'left', size: 11 }); }
        var qa = pts[0], qb = pts[1], pa = L.P(qa), pb = L.P(qb);
        if (vert) { var vq = xMax * 0.5; A.vline(vq, k.orange, { w: 2.8 }); A.label('S', vq, yMax * 0.92, k.orange, { dx: 12 }); qa = qb = vq; pa = yMax * 0.35; pb = yMax * 0.7; }
        else { A.lin(L, isS ? k.orange : k.blue); A.name(L, isS ? 'S' : 'D', isS ? k.orange : k.blue); }
        if (!isS && has(show, 'tr') && !F.quiet) { A.poly([[0, 0], [qa, 0], [qa, pa], [0, pa]], k.goldSoft, k.gold); A.poly([[0, 0], [qb, 0], [qb, pb], [0, pb]], null, k.muted); }
        A.guide(qa, pa); A.guide(qb, pb); A.knob(qa, pa, k.ink, 7); A.knob(qb, pb, k.ink, 7);
        A.label('A', qa, pa, k.ink, { dx: 14, dy: -14, size: 12 }); A.label('B', qb, pb, k.ink, { dx: 14, dy: -14, size: 12 });
        if (two) {
          A2.draw(); var TR = function (q) { return q * L.P(q); };
          if (!F.quiet && has(show, 'regions')) { A2.fn(TR, k.teal, { from: 0, to: midq, w: 3.2 }); A2.fn(TR, k.purple, { from: midq, to: Qint, w: 3.2 }); } else A2.fn(TR, k.ink, { from: 0, to: Qint, w: 2.8 });
          A2.vline(qa, k.muted, { w: 1, dash: [3, 4], to: TR(qa) }); A2.vline(qb, k.muted, { w: 1, dash: [3, 4], to: TR(qb) });
          A2.dot(qa, TR(qa), k.ink, 5.5); A2.dot(qb, TR(qb), k.ink, 5.5); A2.label('A', qa, TR(qa), k.ink, { dx: -12, dy: -12, size: 11.5 }); A2.label('B', qb, TR(qb), k.ink, { dx: 12, dy: -12, size: 11.5 });
          if (!F.quiet) A2.label('Most revenue at unit elasticity', midq, TR(midq), k.ink, { dx: 10, dy: -12, align: 'left', size: 11 });
        }
        var m = mid(qa, pa, qb, pb, false), E = vert ? 0 : M.abs(m.E);
        if (vert) txt = 'A vertical supply curve: the quantity is the same at every price, so the percent change in quantity is 0 and the elasticity is <b>0</b> (perfectly inelastic).';
        else txt = (has(show, 'midpoint') ? m.html : '') + (isS && stype === 'origin' && L.p0 === 0 ? '<br>Any straight supply line through the origin has elasticity exactly 1 at every point: quantity and price change by the same percent.' : '') + (!isS ? '<br>The slope is the same everywhere on this line, but the elasticity is not: it is high where the price is high and the quantity small.' : '');
        if (!isS && has(show, 'tr')) { var ta = qa * pa, tb = qb * pb; tl.push({ k: 'Revenue at A', v: P$(o, ta), c: k.gold }, { k: 'Revenue at B', v: P$(o, tb), c: k.muted }); txt += ' Revenue ' + (tb > ta + 1e-9 ? 'rises' : tb < ta - 1e-9 ? 'falls' : 'stays the same') + ' from A to B (' + P$(o, ta) + ' → ' + P$(o, tb) + ').'; }
        tl.unshift({ k: 'Elasticity A→B', v: vert ? '0' : fm(E, 2), c: k.ink, hi: true });
        if (has(show, 'point') && !vert && !isS) tl.push({ k: 'Point elasticity at A', v: fm(M.abs(pointE(L, qa)), 2), c: k.ink });
        if (isS && !vert) tl.push({ k: 'Supply line', v: L.p0 === 0 ? 'through origin' : L.p0 > 0 ? 'starts on P axis' : 'starts on Q axis', c: k.orange });
        marksOn(c, A, o.marks); T.set(tl); F.set(txt);
        F.say((isS ? 'A supply curve' : 'A straight demand curve') + ' with points A and B' + (F.quiet ? '.' : '; the elasticity between them is ' + fm(E, 2) + '.')); KN.place();
      };
    } else if (mode === 'compare') {
      var p0 = num(o.point && o.point[1], 6), q0 = num(o.point && o.point[0], 10), dP = num(o.dp, 1), sl = o.slopes || [1, 0.25];
      var steep = line(p0 + sl[0] * q0, -sl[0]), flat = line(p0 + sl[1] * q0, -sl[1]);
      var xm = num(o.xMax, niceCeil(flat.Q(0) * 0.62)), ym = num(o.yMax, niceCeil(p0 * 1.8));
      c = F.canvas(function (w) { return hw(w, 1.55, 1.02); }); A = axes(c, axOpts(o, { xMax: xm, yMax: ym }));
      if (F.inter) V.slider(F.ctl, { label: 'Price change', min: -M.round(p0 * 2.4) / 4, max: M.round(p0 * 2.4) / 4, step: 0.25, value: -dP, fmt: function (v) { return (v > 0 ? '+' : '') + P$(o, v); }, input: function (v) { dP = -v; draw(); } });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        var p1 = p0 - dP, qs1 = steep.Q(p1), qf1 = flat.Q(p1);
        A.lin(steep, k.blue); A.lin(flat, k.teal); A.name(steep, 'Steep D', k.blue, 0.86); A.name(flat, 'Flat D', k.teal, 0.88);
        A.hline(p1, k.muted, { w: 1.2, dash: [4, 4] }); A.guide(q0, p0);
        A.dot(q0, p0, k.ink, 6); A.dot(qs1, p1, k.blue, 5.5); A.dot(qf1, p1, k.teal, 5.5);
        if (M.abs(dP) > 0.01) { A.arrow(q0, p1 + (ym * 0.03), qs1, p1 + ym * 0.03, k.blue, 2.2); A.arrow(q0, p1 - ym * 0.03, qf1, p1 - ym * 0.03, k.teal, 2.2); }
        var es = M.abs(midpoint(q0, p0, qs1, p1).e), ef = M.abs(midpoint(q0, p0, qf1, p1).e);
        if (!F.quiet) { A.tagX(qs1, fm(qs1), k.blue); A.tagX(qf1, fm(qf1), k.teal); A.tagX(q0, fm(q0), k.ink); }
        T.set([{ k: 'Steep: quantity', v: fm(q0) + ' → ' + fm(qs1), c: k.blue }, { k: 'Steep: elasticity', v: fm(es, 2), c: k.blue }, { k: 'Flat: quantity', v: fm(q0) + ' → ' + fm(qf1), c: k.teal }, { k: 'Flat: elasticity', v: fm(ef, 2), c: k.teal }]);
        F.set('The same price change from the same point: buyers on the <b>flat</b> curve change their quantity much more, so that demand is more elastic here. Comparing slopes works only at the same point; along one straight line the slope stays the same but the elasticity changes.');
        F.say('Two demand curves through one point, a steep one and a flat one, with the same price change.'); KN.place();
      };
    } else if (mode === 'extremes') {
      var pe = num(o.price, 5), qe2 = num(o.quantity, 6), pp = pe;
      c = F.canvas(function (w) { return w >= 560 ? w / 2.05 : w * 1.62; });
      A = axes(c, axOpts(o, { xMax: 12, yMax: 10 }, { title: 'Perfectly inelastic' })); A2 = axes(c, axOpts(o, { xMax: 12, yMax: 10 }, { title: 'Perfectly elastic' }));
      if (F.inter) V.slider(F.ctl, { label: 'Price', min: 1, max: 9, step: 0.25, value: pp, fmt: function (v) { return P$(o, v); }, input: function (v) { pp = v; draw(); } });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); var wide = c.w >= 560, g = 14;
        if (wide) { A.set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); A2.set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { A.set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); A2.set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); }
        A.draw(); A2.draw();
        A.vline(qe2, k.blue, { w: 3 }); A.label('D', qe2, 9.2, k.blue, { dx: 12 }); A.hline(pp, k.muted, { w: 1.2, dash: [4, 4] }); A.dot(qe2, pp, k.blue, 6);
        A2.hline(pe, k.blue, { w: 3 }); A2.label('D', 11, pe, k.blue, { dy: -13 }); A2.hline(pp, k.muted, { w: 1.2, dash: [4, 4] });
        if (M.abs(pp - pe) < 0.01) A2.label('Any quantity', 6, pe, k.blue, { dy: 15, size: 11.5 }); else if (pp > pe) { A2.dot(0, pp, k.red, 6); A2.label('Buyers buy none', 0.4, pp, k.red, { align: 'left', dy: -13, size: 11.5 }); } else A2.label('Buyers want all they can get', 6, pp, k.blue, { dy: 14, size: 11.5 });
        T.set([{ k: 'Inelastic: quantity', v: fm(qe2), c: k.blue }, { k: 'Elastic: quantity', v: M.abs(pp - pe) < 0.01 ? 'any amount' : pp > pe ? '0' : 'unlimited', c: k.blue }]);
        F.set('<b>Left:</b> a vertical demand curve. Buyers take ' + fm(qe2) + ' units whatever the price, so the percent change in quantity is 0 and the elasticity is <b>0</b>. <b>Right:</b> a horizontal demand curve at ' + P$(o, pe) + '. Charge even a little more and buyers buy none; the elasticity is <b>infinite</b>. Real markets sit between these two.');
        F.say('Two graphs: a vertical demand curve (perfectly inelastic) and a horizontal one (perfectly elastic).'); KN.place();
      };
    } else { // constant elasticity Q = A·P^(−k)
      var kk = num(o.k, 2), AA = num(o.A, 100), P = num(o.price, 2), lg = false;
      var Pmin = num(o.pmin, 0.5), Pmax = num(o.pmax, 10), Qf = function (p) { return AA * M.pow(p, -kk); };
      c = F.canvas(function (w) { return hw(w, 1.5, 1.0); });
      var lin_ = { xMax: niceCeil(Qf(Pmin * 1.6)), yMax: Pmax };
      A = axes(c, axOpts(o, lin_));
      if (F.inter) toggle(F.ctl, 'Log–log scales', false, function (v) { lg = v; setAx(); draw(); });
      function logTicks(a, b) { var out = []; [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(function (v) { if (v >= a * 0.999 && v <= b * 1.001) out.push([M.log(v), big(v)]); }); return out; }
      function setAx() {
        if (lg) { var qa = Qf(Pmax), qb = Qf(Pmin); A = axes(c, axOpts(o, { xMax: M.log(qb * 1.3), yMax: M.log(Pmax * 1.15) }, { xmin: M.log(qa / 1.3), ymin: M.log(Pmin / 1.15), xAt: logTicks(qa / 1.3, qb * 1.3), yAt: logTicks(Pmin / 1.15, Pmax * 1.15), grid: false, xLabel: 'Quantity (log scale)', yLabel: 'Price (log scale)' })); }
        else A = axes(c, axOpts(o, lin_));
      }
      var tq = function (q) { return lg ? M.log(q) : q; }, tp = function (p) { return lg ? M.log(p) : p; };
      KN = knobs(F, c, F.inter ? [{ name: 'Point on the curve', pos: function () { return [A.X(tq(Qf(P))), A.Y(tp(P))]; }, drag: function (px, py) { var p = lg ? M.exp(A.p(py)) : A.p(py); P = clamp(p, Pmin, Pmax); }, key: function (dx, dy, bg) { P = clamp(P * M.pow(1.05, (dy || -dx) * (bg ? 4 : 1)), Pmin, Pmax); }, text: function () { return 'price ' + fm(P) + ', quantity ' + fm(Qf(P)); } }] : [], function () { draw(); });
      draw = function () {
        k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        A.par(function (t) { return tq(Qf(t)); }, function (t) { return tp(t); }, Pmin, Pmax, k.blue, { n: 300 });
        var q = Qf(P), slope = -kk * AA * M.pow(P, -kk - 1);
        A.guide(tq(q), tp(P)); A.knob(tq(q), tp(P), k.blue, 8);
        if (!lg) { var dp = (A.ymax) * 0.12; A.seg(q - slope * dp, P - dp, q + slope * dp, P + dp, k.gold, { w: 2, dash: [6, 4] }); }
        T.set(F.quiet ? [] : [{ k: 'Price', v: P$(o, P), c: k.blue }, { k: 'Quantity', v: fm(q, 2), c: k.blue }, { k: 'dQ/dP here', v: fm(slope, 2), c: k.gold }, { k: 'Elasticity', v: fm(-kk, 2), c: k.ink, hi: true }]);
        F.set('<i>Q</i> = ' + fm(AA) + '·<i>P</i><sup>−' + fm(kk) + '</sup>. The slope dQ/dP changes along the curve (gold tangent), but the elasticity (dQ/dP)·(P/Q) is <b>−' + fm(kk) + '</b> at every point. ' + (lg ? 'On log scales the curve is a straight line: ln Q = ln ' + fm(AA) + ' − ' + fm(kk) + '·ln P, so each 1% rise in price lowers quantity by ' + fm(kk) + '%.' : 'Turn on log–log scales to see it straighten out.'));
        F.say('A constant-elasticity demand curve' + (lg ? ' on log scales, a straight line.' : '.')); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  function tableHTML(head, rows, hiRow) { return '<table><thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r, i) { return '<tr' + (i === hiRow ? ' class="hi"' : '') + '>' + r.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; }
  function tableBox(el, F, label) { var t = mk('div', 'ecv-tbl'); t.tabIndex = 0; t.setAttribute('role', 'region'); t.setAttribute('aria-label', label); el.insertBefore(t, F.out.el); return t; }

  /* ec-costcurves: a firm's cost curves (cubic or a table), price taking, cost shifts, and the long run */
  V.register('ec-costcurves', function (el, o) {
    o = opt(o, { mode: 'shortrun' });
    var F = frame(el, o, 'A firm’s cost curves'), k = K(), T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);
    if (o.mode === 'longrun') return longRun(el, o, F, T);
    var rows = o.rows ? costRows(o.rows) : null, C0 = cost(o.cost), C = C0;
    if (o.shift) C = cost({ F: C0.F + num(o.shift.F, 0), a: C0.a + num(o.shift.a, 0), b: C0.b + num(o.shift.b, 0), c: C0.c + num(o.shift.c, 0) });
    var show = o.show || (rows ? ['mc', 'atc', 'avc'] : ['mc', 'atc', 'avc']), price = o.price != null ? num(o.price, 0) : null;
    var two = has(show, 'tc') || has(show, 'vc');
    var qMax = num(o.xMax, rows ? niceCeil(rows[rows.length - 1].q) : niceCeil(M.max(C.minATC.q, C0.minATC.q) * 1.9));
    var yTop = rows ? M.max.apply(null, rows.map(function (r) { return M.max(r.mc || 0, r.atc && r.q >= rows[1].q * 1.5 ? r.atc : 0); })) : M.max(C.minATC.v, C0.minATC.v) * 2.3;
    var yMax = num(o.yMax, niceCeil(M.max(yTop, price ? price * 1.3 : 0)));
    var qm = num(o.q, rows ? rows[M.min(rows.length - 1, 3)].q : M.round(C.minATC.q));
    var c = F.canvas(function (w) { return two ? (w >= 560 ? w / 1.1 : w * 1.5) : hw(w, 1.55, 1.02); });
    var A = axes(c, { xmax: qMax, ymax: yMax, xLabel: o.xLabel || 'Quantity (q)', yLabel: o.yLabel || (two ? 'Cost per unit ($)' : 'Dollars per unit'), money: o.money !== false, title: two ? 'Per unit' : '' });
    var tcMax = rows ? niceCeil(rows[rows.length - 1].tc * 1.05) : niceCeil(M.max(C.TC(qMax), C0.TC(qMax)) * 1.02);
    var A2 = two ? axes(c, { xmax: qMax, ymax: num(o.tcMax, tcMax), xLabel: '', yLabel: 'Total cost ($)', money: o.money !== false, title: 'Totals', mb: 26 }) : null;
    var tb = rows ? tableBox(el, F, 'Cost table') : null;
    if (F.inter && price != null) V.slider(F.ctl, { label: 'Market price (P = MR)', min: 0, max: yMax * 0.9, step: 0.5, value: price, fmt: function (v) { return money(v); }, input: function (v) { price = v; draw(); } });
    var KN = knobs(F, c, F.inter && !rows ? [{ name: 'Quantity marker', pos: function () { return [A.X(qm), A.B - 12]; }, hitd: function (px, py) { return py < A.T || py > A.B + 10 ? 99 : M.abs(px - A.X(qm)); }, drag: function (px) { qm = clamp(M.round(A.q(px) * 4) / 4, 0.25, qMax); }, key: function (dx, dy, bg) { qm = clamp(qm + (dx || dy) * (bg ? 1 : 0.25), 0.25, qMax); }, text: function () { return 'quantity ' + fm(qm); } }] : [], function () { draw(); });
    var COLS = { mc: 'orange', atc: 'purple', avc: 'teal', afc: 'muted', tc: 'purple', vc: 'teal' };
    function moved(f0, f1) { return [1, 3, 7].some(function (q) { return M.abs(f0(q) - f1(q)) > 1e-9; }); }
    function draw() {
      k = K(); clearC(c); var g = 12;
      if (two) { var h1 = (c.h - g) * 0.42; A2.set({ x: 0, y: 0, w: c.w, h: h1 }); A.set({ x: 0, y: h1 + g, w: c.w, h: c.h - h1 - g }); A2.draw(); } else A.set({ x: 0, y: 0, w: c.w, h: c.h });
      A.draw(); var tl = [], txt = '';
      if (rows) return drawRows();
      var qs = price != null ? C.qFor(price) : null;
      if (price != null && qs > 0) { // profit or loss rectangle
        var atc = C.ATC(qs), pr = (price - atc) * qs;
        A.poly([[0, atc], [qs, atc], [qs, price], [0, price]], pr >= 0 ? k.goldSoft : k.redSoft2);
        if (!F.quiet) A.label(pr >= 0 ? 'Profit' : 'Loss', qs / 2, (atc + price) / 2, pr >= 0 ? k.gold : k.red, { size: 12 });
      }
      ['afc', 'avc', 'atc', 'mc'].forEach(function (nm) {
        if (!has(show, nm)) return; var key = nm.toUpperCase(), f1 = C[key], f0 = C0[key], col = k[COLS[nm]];
        if (o.shift && moved(f0, f1)) { A.fn(f0, col, { from: 0.05, dash: [7, 6], w: 2, alpha: 0.75 }); }
        A.fn(f1, col, { from: 0.05, w: nm === 'mc' ? 3 : 2.6 });
        var lq = nm === 'mc' ? M.min(qMax * 0.9, bisect(function (q) { return C.MC(q) - yMax * 0.88; }, C.minMC.q, qMax * 4)) : qMax * 0.93, lp = f1(lq);
        A.nameAt(key, lq, lp, col, nm === 'mc' ? -20 : 0, nm === 'mc' ? 0 : -13);
      });
      if (o.supply && has(show, 'mc')) { A.fn(C.MC, k.orange2, { from: C.minAVC.q, w: 6, alpha: 0.5 }); A.seg(0, 0, 0, C.minAVC.v, k.orange2, { w: 6, alpha: 0.5 }); if (!F.quiet) A.label('Firm’s supply curve', C.qFor(yMax * 0.86), yMax * 0.86, k.orange2, { dx: -12, align: 'right', size: 11 }); }
      if (has(show, 'mc')) { // MC crosses the averages at their lowest points
        if (has(show, 'avc')) { A.dot(C.minAVC.q, C.minAVC.v, k.teal, 5); if (!F.quiet) A.label(price != null ? 'shutdown price' : 'min AVC', C.minAVC.q, C.minAVC.v, k.teal, { dy: 14, dx: 6, align: 'left', size: 11 }); }
        if (has(show, 'atc')) { A.dot(C.minATC.q, C.minATC.v, k.purple, 5); if (!F.quiet) A.label(price != null ? 'break-even price' : 'min ATC', C.minATC.q, C.minATC.v, k.purple, { dy: 14, dx: 6, align: 'left', size: 11 }); }
      }
      if (price != null) {
        A.hline(price, k.blue, { w: 2.6 }); A.nameAt('P = MR', qMax * 0.97, price, k.blue, -26, -12);
        A.hline(C.minATC.v, k.purple, { w: 1.1, dash: [3, 4], to: C.minATC.q }); A.hline(C.minAVC.v, k.teal, { w: 1.1, dash: [3, 4], to: C.minAVC.q });
        if (!F.quiet) { A.tagY(C.minATC.v, money(C.minATC.v), k.purple); A.tagY(C.minAVC.v, money(C.minAVC.v), k.teal); }
        if (qs > 0) { A.vline(qs, k.ink, { w: 1.3, dash: [3, 4], to: price }); A.dot(qs, price, k.ink, 6); if (!F.quiet) { A.tagX(qs, 'q* = ' + fm(qs), k.ink); A.label('MR = MC', qs, price, k.ink, { dx: 12, dy: -14, align: 'left', size: 11 }); } }
        var prf = qs > 0 ? price * qs - C.TC(qs) : -C.F;
        tl.push({ k: 'Best quantity (MR = MC)', v: fm(qs), c: k.ink }, { k: qs > 0 ? 'ATC there' : 'Shut down', v: qs > 0 ? money(C.ATC(qs)) : 'q = 0', c: k.purple }, { k: prf >= 0 ? 'Profit' : 'Loss', v: money(M.abs(prf)), c: prf >= 0 ? k.gold : k.red, hi: true });
        txt = qs > 0 ? 'At a price of ' + money(price) + ' the firm makes ' + fm(qs) + ' units, where MR = MC. Profit per unit is P − ATC = ' + money(price) + ' − ' + money(C.ATC(qs)) + ', so ' + (prf >= 0 ? 'profit' : 'the loss') + ' is ' + money(M.abs(prf)) + '. ' + (price < C.minATC.v ? 'The price is below the break-even price but above the shutdown price, so the firm keeps producing: it covers its variable cost and part of its fixed cost.' : '') : 'The price is below the lowest AVC (' + money(C.minAVC.v) + '): producing would not even cover the variable cost, so the firm shuts down and loses only its fixed cost, ' + money(C.F) + '.';
      } else {
        var at = function (f) { return money(f(qm)); };
        A.vline(qm, k.gold, { w: 2 }); A.knob(qm, A.ymin + (A.ymax - A.ymin) * 0.03, k.gold, 7);
        show.forEach(function (nm) { if (nm === 'tc' || nm === 'vc') return; var f = C[nm.toUpperCase()]; if (f && f(qm) <= yMax) A.dot(qm, f(qm), k[COLS[nm]], 4.5); });
        if (!F.quiet) { tl.push({ k: 'Quantity', v: fm(qm), c: k.gold }, { k: 'TC', v: at(C.TC), c: k.purple }, { k: 'FC', v: money(C.F), c: k.muted }, { k: 'VC', v: at(C.VC), c: k.teal }, { k: 'MC', v: at(C.MC), c: k.orange }, { k: 'ATC = TC/q', v: at(C.ATC), c: k.purple }, { k: 'AVC = VC/q', v: at(C.AVC), c: k.teal }, { k: 'AFC = FC/q', v: at(C.AFC), c: k.muted }); }
        txt = 'Marginal cost is the <b>extra</b> cost of one more unit, the slope of total cost, not TC ÷ q. While MC is below an average, it pulls the average down; above it, it pulls the average up. So MC crosses AVC and ATC at their lowest points. ATC − AVC = AFC, which shrinks as fixed cost is spread over more units.';
        if (o.shift) txt = shiftText();
      }
      if (two) { // totals panel
        A2.fn(C.TC, k.purple, { from: 0 }); A2.fn(C.VC, k.teal, { from: 0 }); A2.nameAt('TC', qMax * 0.86, C.TC(qMax * 0.86), k.purple, -14, -12); A2.nameAt('VC', qMax * 0.9, C.VC(qMax * 0.9), k.teal, 16, 10);
        if (o.shift) { if (moved(C0.TC, C.TC)) A2.fn(C0.TC, k.purple, { from: 0, dash: [7, 6], w: 2, alpha: 0.7 }); if (moved(C0.VC, C.VC)) A2.fn(C0.VC, k.teal, { from: 0, dash: [7, 6], w: 2, alpha: 0.7 }); }
        A2.hline(C.F, k.muted, { w: 1.6, dash: [5, 4] }); if (!F.quiet) A2.nameAt('FC', qMax * 0.05, C.F, k.muted, 10, -11);
        if (price == null) { A2.vline(qm, k.gold, { w: 1.5 }); A2.dot(qm, C.TC(qm), k.purple, 4.5); A2.dot(qm, C.VC(qm), k.teal, 4.5); }
      }
      marksOn(c, A, o.marks); T.set(tl); F.set(txt);
      F.say('A firm’s cost curves: ' + show.map(function (s) { return s.toUpperCase(); }).join(', ') + (price != null ? ', with a price line' : '') + '.'); KN.place();
    }
    function shiftText() {
      var dF = num(o.shift.F, 0), varc = o.shift.a || o.shift.b || o.shift.c;
      if (dF && !varc) return 'Fixed cost ' + (dF > 0 ? 'rises' : 'falls') + ' by ' + money(M.abs(dF)) + ' (a license fee or a lump-sum tax). Only the curves that include fixed cost move: ATC, AFC and TC (dashed: before). MC and AVC stay put, so the quantity where MR = MC does not change.';
      return 'A change in variable cost (an input price) moves MC, AVC and ATC (dashed: before). Fixed cost and AFC stay the same.';
    }
    function drawRows() {
      var pts = function (key) { return rows.filter(function (r) { return r[key] != null; }).map(function (r, i) { return [key === 'mc' ? (r.q + rows[rows.indexOf(r) - 1].q) / 2 : r.q, r[key]]; }); };
      ['afc', 'avc', 'atc', 'mc'].forEach(function (nm) {
        if (!has(show, nm)) return; var ps = pts(nm), col = k[COLS[nm]]; if (ps.length < 2) return;
        A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.beginPath(); ps.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](A.X(p[0]), A.Y(p[1])); }); ctx.stroke(); ctx.restore(); });
        ps.forEach(function (p) { if (p[1] <= yMax) A.dot(p[0], p[1], col, 4); });
        var last = ps.filter(function (p) { return p[1] <= yMax; }).pop(); if (last) A.nameAt(nm.toUpperCase(), last[0], last[1], col, 18, -10);
      });
      if (two) { var tps = rows.map(function (r) { return [r.q, r.tc]; }); A2.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2.6; ctx.beginPath(); tps.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](A2.X(p[0]), A2.Y(p[1])); }); ctx.stroke(); ctx.restore(); }); tps.forEach(function (p) { A2.dot(p[0], p[1], k.purple, 4); }); }
      var q = F.quiet, f = function (v) { return v == null ? '' : q ? '?' : money(v); };
      tb.innerHTML = tableHTML(['q', 'TC', 'FC', 'VC', 'MC', 'ATC', 'AVC', 'AFC'], rows.map(function (r) { return [fm(r.q), money(r.tc), r.fc != null ? money(r.fc) : '', r.vc != null ? f(r.vc) : '', f(r.mc), f(r.atc), f(r.avc), f(r.afc)]; }));
      F.set('MC is the change in total cost from one row to the next (plotted halfway between the two quantities). ATC = TC ÷ q, AVC = VC ÷ q, AFC = FC ÷ q.');
      F.say('Cost curves drawn from a cost table.'); T.set([]); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });
  /* The long run: short-run ATC curves for several plant sizes and the long-run ATC as their lower envelope.
     A stylized model: LRATC(q) = c + A·(q1 − q)²/(q·q1) below q1 (economies of scale), c from q1 to q2 (constant returns),
     c + B·(q − q2)²/q2 above q2 (diseconomies); a plant built for q_k has SRATC(q) = LRATC(q) + κ·(q − q_k)²/(q·q_k), which
     touches the long-run curve only at q_k and is tangent there, so the long-run curve is the envelope of the short-run ones. */
  function lrModel(o) {
    var q1 = num(o.mes, 40), q2 = num(o.q2, 70), cm = num(o.cmin, 10), Aa = num(o.econ, 6), Bb = num(o.dis, 0.6), kap = num(o.kappa, 20);
    var LR = function (q) { return q < q1 ? cm + Aa * (q1 - q) * (q1 - q) / (q * q1) : q <= q2 ? cm : cm + Bb * (q - q2) * (q - q2) / q2; };
    return { q1: q1, q2: q2, cmin: cm, LR: LR, SR: function (qk) { return function (q) { return LR(q) + kap * (q - qk) * (q - qk) / (q * qk); }; } };
  }
  function longRun(el, o, F, T) {
    var m = lrModel(o), plants = (o.plants || [12, 25, 55, 90]).map(function (v) { return num(v, 20); }), k = K();
    var xMax = num(o.xMax, niceCeil(M.max(m.q2 * 1.55, plants[plants.length - 1] * 1.2))), yMax = num(o.yMax, niceCeil(m.cmin * 3.6));
    var c = F.canvas(function (w) { return hw(w, 1.55, 0.78); }), A = axes(c, { xmax: xMax, ymax: yMax, xLabel: o.xLabel || 'Quantity (q)', yLabel: o.yLabel || 'Average cost ($)', money: o.money !== false });
    var showEnv = true; if (F.inter) toggle(F.ctl, 'Long-run curve', true, function (v) { showEnv = v; draw(); });
    var KN = knobs(F, c, [], function () { });
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h });
      if (!F.quiet) A.clip(function () { var ctx = c.ctx; [[0, m.q1, rgba(k.teal, 0.09)], [m.q1, m.q2, rgba(k.green, 0.09)], [m.q2, xMax, rgba(k.red, 0.07)]].forEach(function (r) { polyPx(ctx, [[A.X(r[0]), A.T], [A.X(r[1]), A.T], [A.X(r[1]), A.B], [A.X(r[0]), A.B]], r[2]); }); });
      A.draw();
      var cols = [k.purple, k.teal, k.blue, k.orange, k.pink];
      plants.forEach(function (qk, i) {
        var f = m.SR(qk); A.fn(f, cols[i % cols.length], { from: qk * 0.25, w: 2.2 });
        var qmin = golden(function (q) { return -f(q); }, qk * 0.3, qk * 3); A.dot(qmin, f(qmin), cols[i % cols.length], 3.5);
        A.nameAt('SRATC' + sub(i + 1), qmin, f(qmin), cols[i % cols.length], 0, -16);
      });
      if (showEnv) { A.fn(m.LR, k.green, { from: 1, w: 4 }); plants.forEach(function (qk) { A.dot(qk, m.LR(qk), k.green, 5); }); A.nameAt('LRATC', xMax * 0.96, m.LR(xMax * 0.96), k.green, -20, -14); }
      if (!F.quiet) {
        A.label('Economies of scale', m.q1 / 2, yMax * 0.94, k.teal, { size: 11 }); A.label('Constant returns', (m.q1 + m.q2) / 2, yMax * 0.86, k.green, { size: 11 }); A.label('Diseconomies of scale', (m.q2 + xMax) / 2, yMax * 0.94, k.red, { size: 11 });
        A.vline(m.q1, k.ink, { w: 1.3, dash: [3, 4], to: m.cmin }); A.tagX(m.q1, 'MES ' + fm(m.q1), k.ink);
      }
      T.set(F.quiet ? [] : [{ k: 'Minimum efficient scale', v: fm(m.q1), c: k.ink }, { k: 'Lowest long-run cost', v: money(m.cmin), c: k.green }]);
      F.set('Each colored curve is the short-run ATC of one plant size (its lowest point is the small dot). The long-run ATC (green) is the lowest cost of making each quantity when the firm can pick any plant size: it touches each short-run curve once (big green dots). On the falling part it touches them to the left of their lowest points, on the rising part to the right; only at the bottom do the two lowest points coincide. Economies of scale come from the size of the whole operation, not from diminishing returns to one input.');
      F.say('Short-run average total cost curves for ' + plants.length + ' plant sizes and the long-run average cost curve that wraps them.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  }

  /* ec-monopoly: a single-price seller and its relatives (see the header for modes) */
  V.register('ec-monopoly', function (el, o) {
    o = opt(o, { mode: 'basic' });
    var mode = o.mode, F = frame(el, o, 'A monopoly graph'), k = K(), T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);
    var dm = o.demand || { p0: 12, s: 1 }, mc = o.mc || { m0: mode === 'natural' ? 3 : 2, m1: mode === 'monocomp' ? 0.6 : 0 };
    var Fc = o.atc ? num(o.atc.F, 0) : (mode === 'natural' ? 16 : mode === 'monocomp' ? 12 : 0);
    var Mo = monopoly(dm, mc, Fc), sr = mode === 'monocomp' ? (o.step === 1 ? 'long' : 'short') : null, qmr = num(o.q, 4);
    var two = mode === 'third';
    var xMax = num(o.xMax, niceCeil(Mo.p0 / Mo.s * 1.02)), yMax = num(o.yMax, niceCeil(Mo.p0 * 1.12));
    var c = F.canvas(function (w) { return two ? (w >= 560 ? w / 2.05 : w * 1.62) : hw(w, 1.5, 1.0); });
    var A = axes(c, axOpts(o, { xMax: xMax, yMax: yMax }, { money: o.money !== false, yLabel: o.yLabel || 'Price ($)' }));
    var mk2 = null, A2 = null;
    if (two) { var ms = o.markets || [{ p0: 12, s: 1 }, { p0: 20, s: 2 }]; mk2 = ms.map(function (m) { return monopoly(m, { m0: num(mc.m0, 2), m1: 0 }, 0); }); var xm = niceCeil(M.max(mk2[0].p0 / mk2[0].s, mk2[1].p0 / mk2[1].s)), ym = niceCeil(M.max(mk2[0].p0, mk2[1].p0) * 1.08); A = axes(c, axOpts(o, { xMax: xm, yMax: ym }, { money: o.money !== false, title: 'Market 1' })); A2 = axes(c, axOpts(o, { xMax: xm, yMax: ym }, { money: o.money !== false, title: 'Market 2' })); }
    var show = o.show || { basic: ['profit', 'cs', 'dwl', 'competitive'], natural: ['regulation'], perfect: ['profit'], monocomp: ['profit'], twopart: ['cs'], mr: [], third: [] }[mode] || [];
    if (F.inter && mode === 'mr') V.slider(F.ctl, { label: 'Units sold now', min: 1, max: M.floor(Mo.p0 / Mo.s) - 1, step: 1, value: qmr, input: function (v) { qmr = v; draw(); } });
    if (F.inter && mode === 'monocomp') V.seg(F.ctl, { label: 'Run', items: [['short', 'Short run'], ['long', 'Long run (after entry)']], value: sr, change: function (v) { sr = v; draw(); } });
    var reg = 'none'; if (F.inter && mode === 'natural') V.seg(F.ctl, { label: 'Regulation', items: [['none', 'Unregulated'], ['mc', 'Price = MC'], ['atc', 'Price = ATC']], value: reg, change: function (v) { reg = v; draw(); } });
    var KN = knobs(F, c, [], function () { });
    function base(Ac, m, mrOn, opts) {
      opts = opts || {};
      Ac.lin(line(m.p0, -m.s), k.blue); Ac.name(line(m.p0, -m.s), 'D', k.blue, 0.93);
      if (mrOn) { var MR = line(m.p0, -2 * m.s); Ac.lin(MR, k.blue2, { w: 2.3, to: m.p0 / (2 * m.s) }); Ac.nameAt('MR', m.p0 / (2 * m.s) * 0.88, MR.P(m.p0 / (2 * m.s) * 0.88), k.blue2, -16, 12); }
      if (!opts.noMC) { Ac.lin(line(m.m0, m.m1), k.orange); Ac.nameAt('MC', Ac.xmax * 0.95, m.m0 + m.m1 * Ac.xmax * 0.95, k.orange, -8, -12); }
    }
    function draw() {
      k = K(); clearC(c); var tl = [], txt = '', say = '';
      if (two) {
        var wide = c.w >= 560, g = 14; if (wide) { A.set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); A2.set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { A.set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); A2.set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); }
        [A, A2].forEach(function (Ac, i) {
          var m = mk2[i]; Ac.draw(); base(Ac, m, true);
          Ac.vline(m.qm, k.ink, { w: 1.2, dash: [3, 4], to: m.pm }); Ac.hline(m.pm, k.ink, { w: 1.2, dash: [3, 4], to: m.qm }); Ac.dot(m.qm, m.pm, k.ink, 6); Ac.dot(m.qm, m.m0, k.orange, 4.5);
          if (!F.quiet) { Ac.tagY(m.pm, money(m.pm), k.ink); Ac.tagX(m.qm, fm(m.qm), k.ink); }
          tl.push({ k: 'Market ' + (i + 1) + ': price', v: money(m.pm), c: k.ink }, { k: 'Market ' + (i + 1) + ': |ε| at that price', v: fm(M.abs(m.elasticity), 2), c: k.blue });
        });
        var hi = mk2[0].pm > mk2[1].pm ? 0 : 1;
        txt = 'One marginal cost (' + money(mk2[0].m0) + ') for both markets; the seller sets MR = MC in each. Market ' + (hi + 1) + ' has the less elastic demand at its price (|ε| = ' + fm(M.abs(mk2[hi].elasticity), 2) + ' versus ' + fm(M.abs(mk2[1 - hi].elasticity), 2) + '), so it pays the higher price. Check the markup rule: (P − MC) ÷ P = 1 ÷ |ε| in each market.';
        T.set(tl); F.set(txt); F.say('Two markets with different demand, one marginal cost, and a different price in each.'); KN.place(); return;
      }
      A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
      var m = Mo, Dl = line(m.p0, -m.s);
      if (mode === 'mr') {
        var q = qmr, p1 = m.P(q), p2 = m.P(q + 1), gain = p2, loss = q * (p1 - p2);
        A.poly([[q, 0], [q + 1, 0], [q + 1, p2], [q, p2]], k.greenSoft, k.green);
        A.poly([[0, p2], [q, p2], [q, p1], [0, p1]], k.redSoft2, k.red);
        base(A, m, true, { noMC: true });
        A.dot(q, p1, k.ink, 5); A.dot(q + 1, p2, k.ink, 5);
        if (!F.quiet) { A.label('Gain: the new unit sells for ' + money(p2), q + 1, p2 / 2, k.green, { dx: 8, align: 'left', size: 11 }); A.label('Loss: ' + fm(q) + ' units × ' + money(p1 - p2) + ' less', q / 2, (p1 + p2) / 2, k.red, { dy: -16, size: 11 }); }
        tl = [{ k: 'Price at ' + fm(q + 1) + ' units', v: money(p2), c: k.blue }, { k: 'Gain', v: money(gain), c: k.green }, { k: 'Loss', v: '−' + money(loss), c: k.red }, { k: 'MR = gain − loss', v: money(gain - loss), c: k.blue2, hi: true }];
        txt = 'To sell unit ' + fm(q + 1) + ', the seller must cut the price from ' + money(p1) + ' to ' + money(p2) + ' for <b>every</b> unit. Revenue gains ' + money(gain) + ' from the new unit (green) but loses ' + money(loss) + ' on the ' + fm(q) + ' units it was already selling (red). So MR = ' + money(gain - loss) + ', less than the price. That is why the MR curve lies below demand.';
        say = 'A demand curve with the gain and loss rectangles from selling one more unit.';
      } else if (mode === 'natural') {
        var atc = m.ATC, qm = m.qm, pm = m.pm, qMC = m.qc, qATC = (function () { var a = m.s + m.m1 / 2, b = -(m.p0 - m.m0), cc = m.F, d = b * b - 4 * a * cc; return d >= 0 ? (-b + M.sqrt(d)) / (2 * a) : NaN; })();
        A.fn(atc, k.purple, { from: 0.3 }); A.nameAt('ATC', A.xmax * 0.12, atc(A.xmax * 0.12), k.purple, 22, -8);
        base(A, m, true);
        if (reg === 'none') { A.poly([[0, atc(qm)], [qm, atc(qm)], [qm, pm], [0, pm]], pm > atc(qm) ? k.goldSoft : k.redSoft2); A.vline(qm, k.ink, { w: 1.2, dash: [3, 4], to: pm }); A.dot(qm, pm, k.ink, 6); if (!F.quiet) { A.tagY(pm, money(pm), k.ink); A.tagX(qm, fm(qm), k.ink); } tl = [{ k: 'Price', v: money(pm), c: k.ink }, { k: 'Quantity', v: fm(qm), c: k.ink }, { k: 'Profit', v: money((pm - atc(qm)) * qm), c: k.gold }]; txt = 'One firm can serve the whole market at a lower average cost than two could: average cost keeps falling across all of demand. Unregulated, it picks MR = MC and charges ' + money(pm) + '.'; }
        else if (reg === 'mc') { var pc = m.MC(qMC); A.poly([[0, pc], [qMC, pc], [qMC, atc(qMC)], [0, atc(qMC)]], k.redSoft2); if (!F.quiet) A.label('Loss: needs a subsidy', qMC / 2, (pc + atc(qMC)) / 2, k.red, { size: 11.5 }); A.dot(qMC, pc, k.ink, 6); if (!F.quiet) { A.tagY(pc, money(pc), k.ink); A.tagX(qMC, fm(qMC), k.ink); } tl = [{ k: 'Price = MC', v: money(pc), c: k.orange }, { k: 'Quantity', v: fm(qMC), c: k.ink }, { k: 'Loss', v: money((atc(qMC) - pc) * qMC), c: k.red, hi: true }]; txt = 'Price = MC gives the efficient quantity, ' + fm(qMC) + ', but the price ' + money(pc) + ' is below average cost (' + money(atc(qMC)) + '). The firm loses money on every unit and needs a subsidy to stay open.'; }
        else { var pa = m.P(qATC); A.dot(qATC, pa, k.ink, 6); A.hatch([[qATC, pa], [qMC, m.MC(qMC)], [qATC, m.MC(qATC)]]); if (!F.quiet) { A.tagY(pa, money(pa), k.ink); A.tagX(qATC, fm(qATC), k.ink); dwlLabel(A, qATC, pa, m.MC(qATC), qMC, m.MC(qMC)); } tl = [{ k: 'Price = ATC', v: money(pa), c: k.purple }, { k: 'Quantity', v: fm(qATC), c: k.ink }, { k: 'Economic profit', v: '$0', c: k.gold }, { k: 'Deadweight loss', v: money((pa - m.MC(qATC)) * (qMC - qATC) / 2), c: k.muted }]; txt = 'Price = ATC lets the firm cover its costs (zero economic profit) at ' + fm(qATC) + ' units. Output is close to the efficient amount, leaving only a small deadweight loss.'; }
        say = 'A natural monopoly: average total cost falls across the whole market.';
      } else if (mode === 'perfect') {
        A.area(m.P, m.MC, 0, m.qc, k.goldSoft); base(A, m, false);
        A.dot(m.qc, m.pc, k.ink, 6); if (!F.quiet) { A.label('All surplus is profit', m.qc / 3, (m.P(m.qc / 3) + m.MC(m.qc / 3)) / 2, k.gold, { size: 11.5 }); A.tagX(m.qc, fm(m.qc), k.ink); }
        tl = [{ k: 'Quantity', v: fm(m.qc), c: k.ink }, { k: 'Consumer surplus', v: '$0', c: k.blue }, { k: 'Profit', v: money(m.csComp + (m.pc - m.m0) * m.qc - (m.m1 * m.qc * m.qc / 2)), c: k.gold }, { k: 'Deadweight loss', v: '$0', c: k.muted }];
        txt = 'Perfect price discrimination: each buyer pays the most they are willing to pay. Then the extra revenue from one more unit is its own price, so MR follows the demand curve and the seller produces the competitive quantity, ' + fm(m.qc) + '. Consumer surplus is zero, and so is the deadweight loss: all the surplus goes to the seller.';
        say = 'Perfect price discrimination: output reaches the competitive level and all surplus goes to the seller.';
      } else if (mode === 'twopart') {
        var pu = m.m0, qq = m.qc, fee = m.csComp;
        A.area(m.P, function () { return pu; }, 0, qq, k.goldSoft); base(A, m, false); A.dot(qq, pu, k.ink, 6);
        if (!F.quiet) { A.label('Entry fee = ' + money(fee), qq / 3, (m.P(qq / 3) + pu) / 2, k.gold, { size: 11.5 }); A.tagX(qq, fm(qq), k.ink); }
        tl = [{ k: 'Price per unit (= MC)', v: money(pu), c: k.orange }, { k: 'Units bought', v: fm(qq), c: k.ink }, { k: 'Entry fee', v: money(fee), c: k.gold, hi: true }];
        txt = 'A two-part tariff for a buyer with this demand: charge a price per unit equal to marginal cost, so the buyer takes the efficient ' + fm(qq) + ' units, and an entry fee equal to the buyer’s whole consumer surplus at that price, ' + money(fee) + '.';
        say = 'A two-part tariff: a per-unit price at marginal cost and an entry fee equal to the consumer surplus triangle.';
      } else if (mode === 'monocomp') {
        var atc2 = m.ATC, qt = M.sqrt(m.F / (m.s + m.m1 / 2)), p0L = atc2(qt) + m.s * qt, mm = sr === 'long' ? monopoly({ p0: p0L, s: m.s }, { m0: m.m0, m1: m.m1 }, m.F) : m;
        A.fn(atc2, k.purple, { from: 0.4 }); A.nameAt('ATC', A.xmax * 0.9, atc2(A.xmax * 0.9), k.purple, 0, -12);
        if (sr === 'long') { A.lin(line(m.p0, -m.s), k.blue, { dash: [7, 6], w: 2, alpha: 0.6 }); }
        var qx = mm.qm, px = mm.pm, ax = atc2(qx);
        if (has(show, 'profit') && M.abs(px - ax) > 1e-6) { A.poly([[0, ax], [qx, ax], [qx, px], [0, px]], px > ax ? k.goldSoft : k.redSoft2); if (!F.quiet) A.label(px > ax ? 'Profit' : 'Loss', qx / 2, (px + ax) / 2, px > ax ? k.gold : k.red, { size: 11.5 }); }
        base(A, mm, true); A.vline(qx, k.ink, { w: 1.2, dash: [3, 4], to: px }); A.dot(qx, px, k.ink, 6);
        var qmin = M.sqrt(2 * m.F / m.m1);
        if (sr === 'long' && !F.quiet) { A.dot(qmin, atc2(qmin), k.purple, 5); A.seg(qx, atc2(qmin) * 0.5, qmin, atc2(qmin) * 0.5, k.red, { w: 2 }); A.label('Excess capacity', (qx + qmin) / 2, atc2(qmin) * 0.5, k.red, { dy: -13, size: 11 }); }
        if (!F.quiet) { A.tagY(px, money(px), k.ink); A.tagX(qx, fm(qx), k.ink); }
        tl = [{ k: 'Price', v: money(px), c: k.ink }, { k: 'Quantity', v: fm(qx), c: k.ink }, { k: 'ATC there', v: money(ax), c: k.purple }, { k: 'Economic profit', v: money((px - ax) * qx), c: k.gold }];
        txt = sr === 'long' ? 'New firms entered and took customers, so this firm’s demand moved left until it just touches ATC. At MR = MC the price equals ATC: zero economic profit. The firm still charges more than MC and produces less than the quantity with the lowest ATC (' + fm(qmin) + '): that gap is excess capacity.' : 'In the short run, a firm with a differentiated product picks MR = MC and charges a price above ATC: an economic profit. That profit draws new firms in.';
        say = 'Monopolistic competition, ' + (sr === 'long' ? 'long run: demand tangent to ATC.' : 'short run: profit.');
      } else { // basic
        var qm2 = m.qm, pm2 = m.pm, mcq = m.MC(qm2), hasAtc = !!o.atc;
        if (has(show, 'cs')) A.area(m.P, function () { return pm2; }, 0, qm2, k.blueSoft);
        if (has(show, 'profit')) { if (hasAtc) { var a2 = m.ATC(qm2); A.poly([[0, a2], [qm2, a2], [qm2, pm2], [0, pm2]], pm2 >= a2 ? k.goldSoft : k.redSoft2); } else A.area(function () { return pm2; }, m.MC, 0, qm2, k.goldSoft); }
        if (has(show, 'dwl')) { A.hatch([[qm2, pm2], [m.qc, m.pc], [qm2, mcq]]); }
        if (hasAtc) { A.fn(m.ATC, k.purple, { from: 0.4 }); A.nameAt('ATC', A.xmax * 0.1, m.ATC(A.xmax * 0.1), k.purple, 22, -6); }
        base(A, m, true);
        A.vline(qm2, k.ink, { w: 1.3, dash: [3, 4], to: pm2 }); A.hline(pm2, k.ink, { w: 1.3, dash: [3, 4], to: qm2 }); A.dot(qm2, mcq, k.orange, 5); A.dot(qm2, pm2, k.ink, 6.5);
        if (has(show, 'competitive')) { A.dot(m.qc, m.pc, k.muted, 5); if (!F.quiet) A.label('Competitive', m.qc, m.pc, k.muted, { dx: 10, dy: -13, align: 'left', size: 11 }); }
        if (!F.quiet) { A.label('MR = MC', qm2, mcq, k.ink, { dx: 10, dy: 13, align: 'left', size: 11 }); A.tagY(pm2, money(pm2), k.ink); A.tagX(qm2, fm(qm2), k.ink); if (has(show, 'profit')) A.label('Profit', qm2 / 2, (pm2 + (hasAtc ? m.ATC(qm2) : mcq)) / 2, k.gold, { size: 11.5 }); if (has(show, 'cs')) A.label('CS', qm2 / 3, pm2 + (m.p0 - pm2) * 0.3, k.blue, { size: 11.5 }); if (has(show, 'dwl')) dwlLabel(A, qm2, pm2, mcq, m.qc, m.pc); }
        var prof = hasAtc ? (pm2 - m.ATC(qm2)) * qm2 : (pm2 - m.m0) * qm2 - m.m1 * qm2 * qm2 / 2;
        tl = [{ k: 'Quantity (MR = MC)', v: fm(qm2), c: k.ink }, { k: 'Price (from demand)', v: money(pm2), c: k.blue }, { k: 'MC there', v: money(mcq), c: k.orange }, { k: hasAtc ? 'Profit' : 'Profit (no fixed cost)', v: money(prof), c: k.gold }, { k: 'Deadweight loss', v: money(m.dwl), c: k.muted }];
        txt = 'Step 1: find the quantity where <b>MR = MC</b> (' + fm(qm2) + '). Step 2: go <b>up to the demand curve</b> for the price buyers will pay (' + money(pm2) + '), not to MR or MC. A competitive market would make ' + fm(m.qc) + ' units at ' + money(m.pc) + '. Much of the monopoly’s profit is surplus moved from buyers to the seller; the hatched triangle is surplus that no one gets.';
        say = 'A monopoly graph with demand, marginal revenue and marginal cost' + (F.quiet ? '.' : ': quantity ' + fm(qm2) + ', price ' + fm(pm2) + '.');
      }
      marksOn(c, A, o.marks); T.set(tl); F.set(txt); F.say(say); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-ppc: a production possibilities curve with a draggable point, opportunity-cost steps and growth */
  V.register('ec-ppc', function (el, o) {
    o = opt(o, { goods: ['Robots', 'Wheat'], shape: 'bowed' });
    var F = frame(el, o, 'A production possibilities curve'), k = K(), T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);
    var g = o.goods, tbl = o.points ? o.points.map(function (p) { return [num(p[0], 0), num(p[1], 0)]; }).sort(function (a, b) { return a[0] - b[0]; }) : null;
    var X = tbl ? tbl[tbl.length - 1][0] : num(o.max && o.max[0], 100), Y = tbl ? tbl[0][1] : num(o.max && o.max[1], 100), shape = tbl ? 'table' : o.shape === 'linear' ? 'linear' : 'bowed';
    var sh = o.shift ? { x: num(o.shift.x, 1), y: num(o.shift.y, 1) } : null, showShift = !!sh;
    function yOf(x, sx, sy) { sx = sx || 1; sy = sy || 1; var u = x / (X * sx); if (u > 1 + 1e-9 || x < -1e-9) return NaN; u = M.min(1, u);
      if (shape === 'linear') return Y * sy * (1 - u); if (shape === 'bowed') return Y * sy * M.sqrt(M.max(0, 1 - u * u));
      var xx = x / sx; for (var i = 1; i < tbl.length; i++) if (xx <= tbl[i][0] + 1e-9) { var a = tbl[i - 1], b = tbl[i], t = (xx - a[0]) / (b[0] - a[0] || 1); return sy * (a[1] + (b[1] - a[1]) * t); } return NaN; }
    function slope(x) { var h = X * 1e-4; if (shape === 'table') { for (var i = 1; i < tbl.length; i++) if (x < tbl[i][0] - 1e-9 || i === tbl.length - 1) return (tbl[i][1] - tbl[i - 1][1]) / (tbl[i][0] - tbl[i - 1][0]); } return (yOf(M.min(X, x + h)) - yOf(M.max(0, x - h))) / (M.min(X, x + h) - M.max(0, x - h)); }
    var pt = o.point ? [num(o.point[0], X * 0.4), num(o.point[1], Y * 0.4)] : (o.interactive === false ? null : [X * 0.45, Y * 0.5]);
    var xMax = num(o.xMax, niceCeil(X * (sh ? sh.x : 1) * 1.1)), yMax = num(o.yMax, niceCeil(Y * (sh ? sh.y : 1) * 1.1));
    var c = F.canvas(function (w) { return hw(w, 1.45, 1.0); }), A = axes(c, { xmax: xMax, ymax: yMax, xLabel: g[0], yLabel: g[1] });
    if (F.inter && pt) btn(F.ctl, 'Put idle resources to work', function () { var s = pt.slice(), tgt = toCurve(pt); tween(F, 700, function (t) { pt = [lerp(s[0], tgt[0], t), lerp(s[1], tgt[1], t)]; draw(); }); });
    if (F.inter && sh) toggle(F.ctl, 'Show the new curve', showShift, function (v) { showShift = v; draw(); });
    function toCurve(p) { // along the diagonal (more of both goods) until the curve
      if (status(p) !== 'in') return p.slice(); var lo = 0, hi = M.max(X, Y);
      for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2, q = [p[0] + m * X / (X + Y), p[1] + m * Y / (X + Y)]; if (status(q) === 'in') lo = m; else hi = m; }
      return [p[0] + lo * X / (X + Y), p[1] + lo * Y / (X + Y)];
    }
    function status(p) { var yc = yOf(p[0]); if (!isFinite(yc) || p[1] > yc + Y * 0.012) return 'out'; if (p[1] >= yc - Y * 0.012) return 'on'; return 'in'; }
    var KN = knobs(F, c, F.inter && pt ? [{ name: 'Production point', pos: function () { return [A.X(pt[0]), A.Y(pt[1])]; }, drag: function (px, py) { pt = [clamp(A.q(px), 0, xMax), clamp(A.p(py), 0, yMax)]; snapOn(); }, key: function (dx, dy, bg) { var s = (bg ? 5 : 1) * niceStep(X, 20); pt = [clamp(pt[0] + dx * s, 0, xMax), clamp(pt[1] + dy * s, 0, yMax)]; }, text: function () { return fm(pt[0]) + ' ' + g[0] + ', ' + fm(pt[1]) + ' ' + g[1]; } }] : [], function () { draw(); });
    function snapOn() { var yc = yOf(pt[0]); if (isFinite(yc) && M.abs(pt[1] - yc) < Y * 0.025) pt[1] = yc; }
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw(); var tl = [], txt = '';
      var f = function (x) { return yOf(x); };
      A.area(function (x) { var v = f(x); return isFinite(v) ? v : 0; }, function () { return 0; }, 0, X, rgba(k.green, k.dark ? 0.1 : 0.07));
      if (sh && showShift) { A.fn(function (x) { return yOf(x, sh.x, sh.y); }, k.green, { from: 0, to: X * sh.x, w: 3 }); A.fn(f, k.green, { from: 0, to: X, w: 2.2, dash: [7, 6], alpha: 0.7 });
        var mx = X * 0.62, a = [mx, yOf(mx)], ang = M.atan2(a[1] / Y, a[0] / X), bb = [X * sh.x * M.cos(ang), Y * sh.y * M.sin(ang)];
        if (shape !== 'bowed') bb = [mx * sh.x, yOf(mx * sh.x, sh.x, sh.y)];
        if (M.hypot(bb[0] - a[0], bb[1] - a[1]) > 0.01) A.arrow(a[0], a[1], bb[0], bb[1], k.green, 2.4);
        A.nameAt('PPC' + sub(2), X * sh.x * 0.92, yOf(X * sh.x * 0.92, sh.x, sh.y), k.green, 18, -4); A.nameAt('PPC' + sub(1), X * 0.25, yOf(X * 0.25), k.green, -8, 16);
      } else { A.fn(f, k.green, { from: 0, to: X, w: 3 }); A.nameAt('PPC', X * 0.82, yOf(X * 0.82), k.green, 22, -8); }
      if (tbl) tbl.forEach(function (p, i) { A.dot(p[0], p[1], k.green, 4.5); if (o.marks == null && !F.quiet && tbl.length <= 7) A.label('ABCDEFG'[i], p[0], p[1], k.green, { dx: 11, dy: -11, size: 11 }); });
      if (o.steps) { // the opportunity-cost staircase
        var sp = tbl || [0, 1, 2, 3, 4, 5].map(function (i) { return [X * i / 5, yOf(X * i / 5)]; });
        for (var i = 1; i < sp.length; i++) {
          var a0 = sp[i - 1], b0 = sp[i]; A.seg(a0[0], a0[1], b0[0], a0[1], k.blue, { w: 2 }); A.seg(b0[0], a0[1], b0[0], b0[1], k.red, { w: 2.4 });
          if (!F.quiet) { A.label('+' + fm(b0[0] - a0[0]), (a0[0] + b0[0]) / 2, a0[1], k.blue, { dy: -11, size: 10.5 }); A.label('−' + fm(a0[1] - b0[1]), b0[0], (a0[1] + b0[1]) / 2, k.red, { dx: 8, align: 'left', size: 10.5 }); }
        }
        txt = 'Each step gives ' + g[0].toLowerCase() + ' (blue) and costs ' + g[1].toLowerCase() + ' (red). ' + (shape === 'linear' ? 'On a straight PPC every step costs the same: a constant opportunity cost.' : 'The red drops grow as you move right: each extra batch of ' + g[0].toLowerCase() + ' costs more ' + g[1].toLowerCase() + ', because the resources moved last are the ones least suited to it. That is increasing opportunity cost, and it bows the curve out.');
      }
      if (pt) {
        var st = status(pt), col = st === 'on' ? k.green : st === 'in' ? k.blue : k.red;
        A.guide(pt[0], pt[1]); A.knob(pt[0], pt[1], col, 8);
        if (!F.quiet) A.label(st === 'on' ? 'Efficient' : st === 'in' ? 'Inefficient: idle resources' : 'Unattainable for now', pt[0], pt[1], col, { dx: 14, dy: -15, align: 'left', size: 11.5 });
        tl.push({ k: g[0], v: fm(pt[0], 1), c: k.ink }, { k: g[1], v: fm(pt[1], 1), c: k.ink }, { k: 'This point is', v: st === 'on' ? 'efficient' : st === 'in' ? 'inefficient' : 'unattainable', c: col, hi: true });
        if (!o.steps) txt = st === 'on' ? 'On the curve: the economy uses all its resources well. Getting more ' + g[0].toLowerCase() + ' now means giving up some ' + g[1].toLowerCase() + '.' : st === 'in' ? 'Inside the curve: possible, but wasteful. Some workers or machines are idle (as in a recession). Putting them back to work moves the point toward the curve; that is a recovery, not growth, because the curve itself does not move.' : 'Outside the curve: not possible with today’s resources and technology. Growth (more resources or better technology) can shift the curve out to reach it later.';
        if (o.showCost && st !== 'out') { var s1 = -slope(M.min(pt[0], X * 0.999)), yc = yOf(pt[0]); A.seg(pt[0] - X * 0.12, yc + s1 * X * 0.12, pt[0] + X * 0.12, yc - s1 * X * 0.12, k.gold, { w: 2, dash: [6, 4] });
          tl.push({ k: 'Cost of 1 more ' + g[0].toLowerCase().replace(/s$/, ''), v: units(s1, g[1].toLowerCase(), 2), c: k.gold });
          txt += ' Opportunity cost here: about ' + units(s1, g[1].toLowerCase(), 2) + ' for each extra unit of ' + g[0].toLowerCase() + ' (the slope of the curve, gold). The cost of one unit of ' + g[1].toLowerCase() + ' is the flip: ' + units(1 / s1, g[0].toLowerCase(), 2) + '.'; }
      }
      if (sh && showShift) txt = (txt ? txt + ' ' : '') + (sh.x !== 1 && sh.y !== 1 ? 'The whole curve moved out: the economy can make more of both goods (economic growth).' : 'Only the ' + (sh.x !== 1 ? g[0] : g[1]).toLowerCase() + ' end moved: better technology in that one industry. The other intercept stays put, yet most points on the new curve offer more of both.');
      marksOn(c, A, o.marks); T.set(F.quiet ? [] : tl); F.set(txt);
      F.say('A production possibilities curve for ' + g[0] + ' and ' + g[1] + (pt && !F.quiet ? '. The point is ' + status(pt) .replace('in', 'inside the curve').replace('on', 'on the curve').replace('out', 'outside the curve') + '.' : '.')); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-trade: comparative advantage and the gains from trade for two producers */
  V.register('ec-trade', function (el, o) {
    o = opt(o, { producers: ['Ana', 'Ben'], goods: ['Bread', 'Shirts'], table: null, mode: 'output', showOC: true, specialize: false, hours: 12, split: 0.5 });
    var F = frame(el, o, 'Two producers and the gains from trade'), k = K(), P = o.producers, G = o.goods, inp = o.mode === 'input';
    var tb = o.table || (inp ? [[2, 4], [3, 3]] : [[6, 3], [4, 4]]);
    var mx = tb.map(function (r) { return inp ? [o.hours / r[0], o.hours / r[1]] : [r[0], r[1]]; });
    var oc = mx.map(function (m) { return m[1] / m[0]; }); // units of good 2 given up per unit of good 1
    var xs = oc[0] < oc[1] ? 0 : oc[0] > oc[1] ? 1 : -1, ys = xs < 0 ? -1 : 1 - xs; // who specializes in good 1 (x) and good 2 (y)
    var lo = M.min(oc[0], oc[1]), hi = M.max(oc[0], oc[1]), spec = !!o.specialize, terms = num(o.terms, (lo + hi) / 2), amt = num(o.amount, M.round(M.min(mx[0][0], mx[1][0]) / 2));
    var c = F.canvas(function (w) { return w >= 560 ? w / 2.1 : w * 1.6; });
    var xm = niceCeil(M.max(mx[0][0], mx[1][0]) * 1.15), ym = niceCeil(M.max(mx[0][1], mx[1][1]) * 1.15);
    var Ax = [0, 1].map(function (i) { return axes(c, { xmax: xm, ymax: ym, xLabel: G[0], yLabel: G[1], title: P[i] }); });
    var tbox = tableBox(el, F, 'Opportunity cost table'), T = tiles(F.quiet ? mk('div') : el); if (!F.quiet) el.insertBefore(T.el, F.out.el);
    if (F.inter) {
      var sp = toggle(F.ctl, 'Specialize and trade', spec, function (v) { spec = v; draw(); });
      if (xs < 0) sp.el.disabled = true;
      V.slider(F.ctl, { label: 'Terms of trade (' + G[1].toLowerCase() + ' per ' + G[0].toLowerCase().replace(/s$/, '') + ')', min: M.round(lo * 0.4 * 20) / 20, max: M.round(hi * 1.5 * 20) / 20 || 1, step: 0.05, value: terms, fmt: function (v) { return fm(v, 2); }, input: function (v) { terms = v; draw(); } });
      V.slider(F.ctl, { label: G[0] + ' traded', min: 0, max: M.max(mx[0][0], mx[1][0]), step: 0.5, value: amt, input: function (v) { amt = v; draw(); } });
    }
    var KN = knobs(F, c, [], function () { });
    function draw() {
      k = K(); clearC(c); var wide = c.w >= 560, gp = 14;
      if (wide) { Ax[0].set({ x: 0, y: 0, w: (c.w - gp) / 2, h: c.h }); Ax[1].set({ x: (c.w + gp) / 2, y: 0, w: (c.w - gp) / 2, h: c.h }); } else { Ax[0].set({ x: 0, y: 0, w: c.w, h: (c.h - gp) / 2 }); Ax[1].set({ x: 0, y: (c.h + gp) / 2, w: c.w, h: (c.h - gp) / 2 }); }
      var trade = spec && xs >= 0, prod = [], cons = [], tl = [], refuse = null;
      for (var i = 0; i < 2; i++) {
        if (!trade) { prod[i] = [mx[i][0] * o.split, mx[i][1] * (1 - o.split)]; cons[i] = prod[i]; }
        else { prod[i] = i === xs ? [mx[i][0], 0] : [0, mx[i][1]]; cons[i] = i === xs ? [mx[i][0] - amt, amt * terms] : [amt, mx[i][1] - amt * terms]; }
      }
      if (trade) { if (terms < oc[xs] - 1e-9) refuse = xs; else if (terms > oc[ys] + 1e-9) refuse = ys; }
      for (i = 0; i < 2; i++) {
        var A = Ax[i]; A.draw(); A.area(function (x) { return mx[i][1] * (1 - x / mx[i][0]); }, function () { return 0; }, 0, mx[i][0], rgba(k.green, 0.07));
        A.seg(0, mx[i][1], mx[i][0], 0, k.green, { w: 3 });
        var cc = cons[i], outside = cc[0] / mx[i][0] + cc[1] / mx[i][1] > 1 + 1e-9, bad = cc[0] < -1e-9 || cc[1] < -1e-9;
        if (trade) { A.dot(prod[i][0], prod[i][1], k.ink, 6); A.label('Makes', prod[i][0], prod[i][1], k.ink, { dx: prod[i][0] ? -8 : 10, dy: -14, align: prod[i][0] ? 'right' : 'left', size: 11 }); if (!bad) A.arrow(prod[i][0], prod[i][1], cc[0], cc[1], k.gold, 2, [5, 4]); }
        if (!bad) { A.knob(cc[0], cc[1], outside ? k.green : k.blue, 8); A.label(outside ? 'Only possible with trade' : trade ? 'Consumes' : 'Makes and consumes', cc[0], cc[1], outside ? k.green : k.blue, { dx: 12, dy: 15, align: 'left', size: 11 }); }
        tl.push({ k: P[i] + ' consumes', v: bad ? 'not possible' : fm(cc[0], 2) + ' ' + G[0].toLowerCase() + ', ' + fm(cc[1], 2) + ' ' + G[1].toLowerCase(), c: outside ? k.green : k.blue });
      }
      var q = F.quiet, rowsH = [0, 1].map(function (j) { return [P[j], fm(mx[j][0], 2), fm(mx[j][1], 2), q || !o.showOC ? '?' : units(oc[j], G[1].toLowerCase()), q || !o.showOC ? '?' : units(1 / oc[j], G[0].toLowerCase())]; });
      tbox.innerHTML = tableHTML(['', 'Most ' + G[0].toLowerCase() + (inp ? ' in ' + fm(o.hours) + ' h' : ''), 'Most ' + G[1].toLowerCase() + (inp ? ' in ' + fm(o.hours) + ' h' : ''), 'Cost of 1 ' + G[0].toLowerCase().replace(/s$/, ''), 'Cost of 1 ' + G[1].toLowerCase().replace(/s$/, '')], rowsH);
      var txt;
      if (xs < 0) txt = 'Both have the same opportunity costs, so neither has a comparative advantage and specializing gains nothing.';
      else if (!trade) txt = (inp ? 'The table gives hours per unit, so a <b>smaller</b> number is better. ' : '') + (q ? '' : P[xs] + ' gives up less ' + G[1].toLowerCase() + ' for each ' + G[0].toLowerCase().replace(/s$/, '') + ' (' + fm(oc[xs], 3) + ' versus ' + fm(oc[ys], 3) + '), so ' + P[xs] + ' has the <b>comparative advantage</b> in ' + G[0].toLowerCase() + ' and ' + P[ys] + ' in ' + G[1].toLowerCase() + ', whoever can make more of either. ') + 'Each now splits time between the two goods.';
      else if (refuse != null) txt = 'At ' + fm(terms, 2) + ' ' + G[1].toLowerCase() + ' per ' + G[0].toLowerCase().replace(/s$/, '') + ', <b>' + P[refuse] + ' would refuse</b>: ' + P[refuse] + ' can do better without trading. Terms have to fall between the two opportunity costs, ' + fm(lo, 3) + ' and ' + fm(hi, 3) + '.';
      else txt = P[xs] + ' makes only ' + G[0].toLowerCase() + ', ' + P[ys] + ' makes only ' + G[1].toLowerCase() + ', and they trade ' + fm(amt) + ' ' + G[0].toLowerCase() + ' for ' + fm(amt * terms, 2) + ' ' + G[1].toLowerCase() + '. ' + (cons.every(function (cc, j) { return cc[0] / mx[j][0] + cc[1] / mx[j][1] > 1 + 1e-9; }) ? 'Both end up <b>outside their own PPC</b>: trade is not a contest where one side must lose.' : 'Try other amounts or terms to put both outside their own curves.');
      T.set(tl); F.set(txt); F.say('Two production possibilities lines, one for ' + P[0] + ' and one for ' + P[1] + ', with their consumption points.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* bar charts on an axes() with whole-number categories */
  function catTicks(xs, f) { return xs.map(function (x) { return [x, f ? f(x) : String(x)]; }); }

  /* ec-marginal: totals and marginal values for benefit–cost, utility and production */
  V.register('ec-marginal', function (el, o) {
    o = opt(o, { mode: 'benefit-cost' });
    var mode = o.mode, F = frame(el, o, 'Totals and marginal values'), k = K(), q = F.quiet;
    var c = F.canvas(function (w) { return w >= 560 ? w / 1.2 : w * 1.45; }), tbox = tableBox(el, F, 'Table of totals and marginal values');
    var T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var A1, A2, draw, KN = knobs(F, c, [], function () { });
    function layout() { var g = 14, h1 = (c.h - g) * 0.48; A1.set({ x: 0, y: 0, w: c.w, h: h1 }); A2.set({ x: 0, y: h1 + g, w: c.w, h: c.h - h1 - g }); }
    if (mode === 'utility') {
      var goods = (o.goods || [{ name: 'Apples', price: 1, tu: [10, 18, 24, 28, 30, 31] }, { name: 'Books', price: 2, tu: [24, 40, 52, 60, 64, 66] }]).map(function (gd) { var tu = gd.tu || gd.totals || []; return { name: gd.name, price: num(gd.price, 1), tu: tu, mu: tu.map(function (v, i) { return v - (i ? tu[i - 1] : 0); }) }; });
      var one = goods.length === 1, income = num(o.income, one ? 0 : 9), bought = goods.map(function () { return 0; }), log = [];
      var n = M.max.apply(null, goods.map(function (gd) { return gd.tu.length; })), xs = []; for (var i = 1; i <= n; i++) xs.push(i);
      var muMax = M.max.apply(null, goods.map(function (gd) { return M.max.apply(null, gd.mu.map(function (v, j) { return one ? v : v / gd.price; })); })), muMin = M.min(0, M.min.apply(null, goods.map(function (gd) { return M.min.apply(null, gd.mu); })));
      A1 = axes(c, { xmin: 0.4, xmax: n + 0.6, ymax: niceCeil(M.max.apply(null, goods.map(function (gd) { return M.max.apply(null, gd.tu); })) * 1.1), xAt: catTicks(xs), xLabel: 'Units', yLabel: 'Total utility', title: one ? goods[0].name : 'Total utility' });
      A2 = axes(c, { xmin: 0.4, xmax: n + 0.6, ymin: muMin < 0 ? -niceCeil(-muMin * 1.2) : 0, ymax: niceCeil(muMax * 1.15), xAt: catTicks(xs), xLabel: 'Units', yLabel: one ? 'Marginal utility' : 'Marginal utility per dollar', title: one ? 'MU = change in TU' : 'MU ÷ price' });
      function spent() { return bought.reduce(function (s, b, j) { return s + b * goods[j].price; }, 0); }
      function nextBuy() { var best = -1, bv = -Infinity; goods.forEach(function (gd, j) { var u = bought[j]; if (u >= gd.mu.length || spent() + gd.price > income + 1e-9) return; var v = gd.mu[u] / gd.price; if (v > bv + 1e-12) { bv = v; best = j; } }); return bv > 0 ? best : -1; }
      if (!one && F.inter) { var nb = btn(F.ctl, 'Spend on the next unit', function () { var j = nextBuy(); if (j < 0) return; log.push(j); bought[j]++; draw(); }, 'pri'); btn(F.ctl, 'Start over', function () { bought = goods.map(function () { return 0; }); log = []; draw(); }); btn(F.ctl, 'Spend it all', function () { var j; while ((j = nextBuy()) >= 0) { bought[j]++; log.push(j); } draw(); }); }
      if (!one && !F.inter) { var jj; while ((jj = nextBuy()) >= 0) bought[jj]++; }
      draw = function () {
        k = K(); clearC(c); layout(); A1.draw(); A2.draw(); var cols = [k.blue, k.orange, k.green];
        goods.forEach(function (gd, j) {
          var off = one ? 0 : (j - (goods.length - 1) / 2) * 0.36, col = cols[j % 3];
          A1.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath(); gd.tu.forEach(function (v, i) { ctx[i ? 'lineTo' : 'moveTo'](A1.X(i + 1), A1.Y(v)); }); ctx.stroke(); ctx.restore(); });
          gd.tu.forEach(function (v, i) { A1.dot(i + 1, v, col, 4.5); });
          if (!one) A1.nameAt(gd.name, gd.tu.length, gd.tu[gd.tu.length - 1], col, -10, -13);
          gd.mu.forEach(function (v, i) { if (q) return; var val = one ? v : v / gd.price, mine = !one && i < bought[j]; A2.poly([[i + 1 + off - 0.16, 0], [i + 1 + off + 0.16, 0], [i + 1 + off + 0.16, val], [i + 1 + off - 0.16, val]], mine ? col : rgba(col, 0.25), col); });
        });
        var rows = [], head = ['Units'];
        goods.forEach(function (gd) { head.push(gd.name + ' TU', 'MU'); if (!one) head.push('MU ÷ $' + fm(gd.price, 2)); });
        for (var r = 0; r < n; r++) { var row = [String(r + 1)]; goods.forEach(function (gd, j) { row.push(gd.tu[r] != null ? fm(gd.tu[r]) : '', gd.mu[r] != null ? (q ? '?' : fm(gd.mu[r])) : ''); if (!one) row.push(gd.mu[r] != null ? (q ? '?' : fm(gd.mu[r] / gd.price, 2)) : ''); }); rows.push(row); }
        tbox.innerHTML = tableHTML(head, rows);
        if (one) { var gd = goods[0], top = gd.tu.indexOf(M.max.apply(null, gd.tu)); T.set([{ k: 'Most total utility at', v: fm(top + 1) + ' units', c: k.blue }]); F.set('Total utility rises as long as marginal utility is positive, even while MU shrinks. When MU turns negative, total utility falls.'); }
        else {
          var left = income - spent(), nx = nextBuy();
          T.set([{ k: 'Income', v: money(income), c: k.ink }, { k: 'Spent', v: money(spent()), c: k.ink }, { k: 'Left', v: money(left), c: k.gold, hi: true }].concat(goods.map(function (gd, j) { return { k: gd.name, v: fm(bought[j]) + ' bought', c: cols[j % 3] }; })));
          var last = log.length ? goods[log[log.length - 1]] : null;
          F.set(nx < 0 ? 'Income is spent. Compare the last units bought: ' + goods.map(function (gd, j) { return gd.name + ' ' + (bought[j] ? fm(gd.mu[bought[j] - 1] / gd.price, 2) : '—'); }).join(', ') + ' utils per dollar: about equal, so no swap of a dollar from one good to the other would raise total utility.' : (last ? 'Bought one more ' + last.name.toLowerCase().replace(/s$/, '') + '. ' : '') + 'Next: the good with the higher marginal utility <b>per dollar</b> is ' + goods[nx].name.toLowerCase() + ' (' + fm(goods[nx].mu[bought[nx]] / goods[nx].price, 2) + ' utils per dollar). Comparing MU alone, without dividing by price, would pick the wrong good.');
          if (nb) nb.disabled = nx < 0;
        }
        F.say('Bar charts of total and marginal utility' + (one ? '.' : ' per dollar for ' + goods.map(function (gd) { return gd.name; }).join(' and ') + '.')); KN.place();
      };
    } else if (mode === 'product') {
      var pr = (o.rows || [0, 10, 24, 36, 44, 48, 48, 44].map(function (v, i) { return { L: i, TP: v }; })).slice().sort(function (a, b) { return a.L - b.L; });
      var Ls = pr.map(function (r) { return r.L; }), TP = pr.map(function (r) { return r.TP; }), MP = TP.map(function (v, i) { return i ? (v - TP[i - 1]) / (Ls[i] - Ls[i - 1]) : null; }), AP = TP.map(function (v, i) { return Ls[i] ? v / Ls[i] : null; });
      var peak = 1; for (var j = 1; j < MP.length; j++) if (MP[j] > MP[peak]) peak = j; var neg = MP.findIndex(function (v) { return v != null && v < 0; });
      var L0 = Ls[0], Ln = Ls[Ls.length - 1], mmin = M.min(0, M.min.apply(null, MP.filter(function (v) { return v != null; })));
      A1 = axes(c, { xmin: L0, xmax: Ln + 0.5, ymax: niceCeil(M.max.apply(null, TP) * 1.12), xAt: catTicks(Ls), xLabel: o.xLabel || 'Workers', yLabel: 'Total product', title: 'Total product' });
      A2 = axes(c, { xmin: L0, xmax: Ln + 0.5, ymin: mmin < 0 ? -niceCeil(-mmin * 1.3) : 0, ymax: niceCeil(M.max.apply(null, MP.concat(AP).filter(function (v) { return v != null; })) * 1.15), xAt: catTicks(Ls), xLabel: o.xLabel || 'Workers', yLabel: 'Output per worker', title: 'Marginal and average product' });
      draw = function () {
        k = K(); clearC(c); layout();
        var dimFrom = Ls[peak] + (Ls[1] - Ls[0]), negFrom = neg > 0 ? Ls[neg] - 0.5 : null;
        [A1, A2].forEach(function (A) { if (!q) A.clip(function () { polyPx(c.ctx, [[A.X(dimFrom - 0.5), A.T], [A.X(negFrom != null ? negFrom : Ln + 0.5), A.T], [A.X(negFrom != null ? negFrom : Ln + 0.5), A.B], [A.X(dimFrom - 0.5), A.B]], rgba(k.gold, 0.12)); if (negFrom != null) polyPx(c.ctx, [[A.X(negFrom), A.T], [A.X(Ln + 0.5), A.T], [A.X(Ln + 0.5), A.B], [A.X(negFrom), A.B]], rgba(k.red, 0.1)); }); A.draw(); });
        A1.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.green; ctx.lineWidth = 2.8; ctx.beginPath(); Ls.forEach(function (L, i) { ctx[i ? 'lineTo' : 'moveTo'](A1.X(L), A1.Y(TP[i])); }); ctx.stroke(); ctx.restore(); });
        Ls.forEach(function (L, i) { A1.dot(L, TP[i], k.green, 4.5); });
        if (!q) {
          Ls.forEach(function (L, i) { if (MP[i] == null) return; A2.poly([[L - 0.42, 0], [L - 0.08, 0], [L - 0.08, MP[i]], [L - 0.42, MP[i]]], rgba(k.orange, 0.55), k.orange); });
          A2.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2.4; ctx.beginPath(); var pen = false; Ls.forEach(function (L, i) { if (AP[i] == null) return; ctx[pen ? 'lineTo' : 'moveTo'](A2.X(L), A2.Y(AP[i])); pen = true; }); ctx.stroke(); ctx.restore(); });
          Ls.forEach(function (L, i) { if (AP[i] != null) A2.dot(L, AP[i], k.purple, 4); });
          A1.label('Diminishing marginal returns', (dimFrom + (negFrom != null ? negFrom : Ln)) / 2, A1.ymax * 0.12, k.gold, { size: 11 }); if (negFrom != null) A1.label('Negative', (negFrom + Ln + 0.5) / 2, A1.ymax * 0.12, k.red, { size: 11 });
          A2.nameAt('MP (bars)', Ln, A2.ymax * 0.9, k.orange, -30, 0); A2.nameAt('AP', Ls[Ls.length - 1], AP[AP.length - 1], k.purple, 6, -12);
        }
        tbox.innerHTML = tableHTML([o.xLabel || 'Workers', 'Total product', 'Marginal product', 'Average product'], Ls.map(function (L, i) { return [fm(L), fm(TP[i]), MP[i] == null ? '' : q ? '?' : fm(MP[i], 2), AP[i] == null ? '' : q ? '?' : fm(AP[i], 2)]; }));
        T.set(q ? [] : [{ k: 'MP is highest at worker', v: fm(Ls[peak]), c: k.orange }, { k: 'Diminishing returns from worker', v: fm(Ls[peak] + (Ls[1] - Ls[0])), c: k.gold }].concat(neg > 0 ? [{ k: 'Negative returns from worker', v: fm(Ls[neg]), c: k.red }] : []));
        F.set('Marginal product is the extra output from one more worker. It rises at first (workers can specialize), then falls: <b>diminishing marginal returns</b>, because each new worker has less of the fixed equipment to use. Output still rises while MP is positive; only when MP turns negative does total product fall. MP above AP pulls the average up; below it, down.');
        F.say('Total product, and marginal and average product, for each number of workers.'); KN.place();
      };
    } else { // benefit-cost
      var br = o.rows || [0, 1, 2, 3, 4, 5, 6].map(function (qq, i) { return { q: qq, tb: [0, 20, 36, 48, 56, 60, 62][i], tc: [0, 6, 14, 24, 36, 50, 66][i] }; });
      br = br.slice().sort(function (a, b) { return a.q - b.q; });
      var sunk = num(o.sunk, 0), withSunk = false, Q = br.map(function (r) { return r.q; }), MB = br.map(function (r, i) { return i ? r.tb - br[i - 1].tb : null; }), MCv = br.map(function (r, i) { return i ? r.tc - br[i - 1].tc : null; });
      var stop = 0; for (var s = 1; s < br.length; s++) { if (MB[s] >= MCv[s]) stop = s; else break; }
      var tmax = M.max.apply(null, br.map(function (r) { return M.max(r.tb, r.tc + sunk); })), mmax = M.max.apply(null, MB.concat(MCv).filter(function (v) { return v != null; }));
      A1 = axes(c, { xmin: Q[0] - 0.5, xmax: Q[Q.length - 1] + 0.5, ymin: sunk ? -niceCeil(sunk * 1.1) : 0, ymax: niceCeil(tmax * 1.1), xAt: catTicks(Q), xLabel: o.xLabel || 'Units', yLabel: 'Total ($)', money: true, title: 'Totals' });
      A2 = axes(c, { xmin: Q[0] - 0.5, xmax: Q[Q.length - 1] + 0.5, ymax: niceCeil(mmax * 1.15), xAt: catTicks(Q), xLabel: o.xLabel || 'Units', yLabel: 'Marginal ($)', money: true, title: 'MB and MC of each unit' });
      if (sunk && F.inter) toggle(F.ctl, 'Count the ' + money(sunk) + ' already spent', false, function (v) { withSunk = v; draw(); });
      draw = function () {
        k = K(); clearC(c); layout(); A1.draw(); A2.draw();
        var sk = withSunk ? sunk : 0, line2 = function (A, vals, col, dash) { A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.setLineDash(dash || []); ctx.beginPath(); Q.forEach(function (x, i) { ctx[i ? 'lineTo' : 'moveTo'](A.X(x), A.Y(vals[i])); }); ctx.stroke(); ctx.restore(); }); Q.forEach(function (x, i) { A.dot(x, vals[i], col, 4); }); };
        var TB = br.map(function (r) { return r.tb; }), TC = br.map(function (r) { return r.tc + sk; }), NB = TB.map(function (v, i) { return v - TC[i]; });
        Q.forEach(function (x, i) { A1.poly([[x - 0.18, 0], [x + 0.18, 0], [x + 0.18, NB[i]], [x - 0.18, NB[i]]], NB[i] >= 0 ? rgba(k.green, 0.35) : rgba(k.red, 0.3), NB[i] >= 0 ? k.green : k.red); });
        line2(A1, TB, k.blue); line2(A1, TC, k.orange); if (sunk && withSunk) line2(A1, br.map(function (r) { return r.tc; }), k.orange, [6, 5]);
        A1.nameAt('Total benefit', Q[Q.length - 1], TB[TB.length - 1], k.blue, -46, -12); A1.nameAt('Total cost', Q[Q.length - 1], TC[TC.length - 1], k.orange, -40, 12); A1.nameAt('Net (bars)', Q[0], 0, k.green, 34, -12);
        if (!q) Q.forEach(function (x, i) { if (MB[i] == null) return; A2.poly([[x - 0.34, 0], [x - 0.02, 0], [x - 0.02, MB[i]], [x - 0.34, MB[i]]], rgba(k.blue, 0.5), k.blue); A2.poly([[x + 0.02, 0], [x + 0.34, 0], [x + 0.34, MCv[i]], [x + 0.02, MCv[i]]], rgba(k.orange, 0.5), k.orange); });
        if (!q) { A2.nameAt('MB', Q[1] - 0.18, MB[1], k.blue, 0, -11); A2.nameAt('MC', Q[1] + 0.18, MCv[1], k.orange, 0, -11); [A1, A2].forEach(function (A) { A.vline(Q[stop] + 0.5, k.gold, { w: 2.2, dash: [6, 4] }); }); A2.label('Stop here', Q[stop] + 0.5, A2.ymax * 0.9, k.gold, { size: 11.5 }); }
        tbox.innerHTML = tableHTML([o.xLabel || 'Units', 'Total benefit', 'Total cost', 'MB', 'MC', 'Net benefit'], br.map(function (r, i) { return [fm(r.q), money(r.tb), money(r.tc + sk), MB[i] == null ? '' : q ? '?' : money(MB[i]), MCv[i] == null ? '' : q ? '?' : money(MCv[i]), q ? '?' : money(NB[i])]; }), q ? -1 : stop);
        T.set(q ? [] : [{ k: 'Best quantity', v: fm(Q[stop]), c: k.gold, hi: true }, { k: 'Net benefit there', v: money(NB[stop]), c: k.green }, { k: 'Total benefit is highest at', v: fm(Q[TB.indexOf(M.max.apply(null, TB))]), c: k.blue }]);
        F.set('Keep going while the next unit’s marginal benefit is at least its marginal cost. That stops at ' + fm(Q[stop]) + ', where <b>net</b> benefit is largest, even though total benefit keeps rising after it.' + (sunk ? ' The ' + money(sunk) + ' already spent is a <b>sunk cost</b>: counting it lowers every net benefit by the same amount, so the best stopping point does not move.' : ''));
        F.say('Totals and marginal values: total benefit and total cost, and bars of marginal benefit and marginal cost for each unit.'); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-sort: a card sorter. Drag a card (mouse or pen) onto a bin, or tap a card and then a bin; with the keyboard, focus a
     card and press a bin's number (1–9), or 0 to send it back. Check marks each card and explains the wrong ones. */
  V.register('ec-sort', function (el, o) {
    o = opt(o, { bins: ['Land', 'Labor', 'Capital', 'Entrepreneurship'], shuffle: true, check: true });
    var F = frame(el, o, 'Sort the cards into the right groups'), q = F.quiet;
    var cards = (o.cards || [
      { text: 'A delivery van', bin: 2, why: 'A van is a tool made to produce other things: capital.' },
      { text: 'Crude oil still in the ground', bin: 0, why: 'Natural resources count as land.' },
      { text: 'A nurse’s work', bin: 1, why: 'Human effort is labor.' },
      { text: 'Fertile farmland', bin: 0, why: 'Land means every natural resource, including the soil.' },
      { text: 'Starting a food truck and taking the risk', bin: 3, why: 'Organizing resources and bearing the risk is entrepreneurship.' },
      { text: 'A factory building', bin: 2, why: 'A building made to produce goods is capital.' }
    ]).map(function (cd, i) { return { text: cd.text, bin: num(cd.bin, 0), why: cd.why || '', id: i, at: -1 }; });
    var bins = o.bins, sel = null, checked = false;
    if (o.shuffle !== false) { var r = seeded(hash(cards.map(function (cd) { return cd.text; }).join('|'))); for (var i = cards.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = cards[i]; cards[i] = cards[j]; cards[j] = t; } }
    var wrap = mk('div', 'ecv-sort'); F.box.appendChild(wrap);
    var pool = mk('div', 'ecv-pool'); pool.setAttribute('aria-label', 'Cards to sort'); pool.setAttribute('role', 'group');
    wrap.appendChild(mk('p', 'ecv-hint', 'Drag each card to a group, or tap a card and then a group. Keyboard: focus a card and press a group’s number' + (bins.length < 10 ? ' (1–' + bins.length + ')' : '') + '; 0 puts it back.'));
    wrap.appendChild(pool); pool.addEventListener('click', function (e) { if (sel && e.target === pool) place(sel, -1); });
    var grid = o.grid2x2, binWrap = mk('div', 'ecv-bins' + (grid ? ' g2' : '')); wrap.appendChild(binWrap);
    var cols = num(o.columns, 0); if (cols && !grid) binWrap.style.setProperty('--cols', cols);
    var binEls = [];
    if (grid) { binWrap.appendChild(mk('div', 'ecv-gh')); grid.cols.forEach(function (h) { binWrap.appendChild(mk('div', 'ecv-gh', h)); }); }
    bins.forEach(function (b, i) {
      if (grid && i % 2 === 0) binWrap.appendChild(mk('div', 'ecv-gh ecv-rh', grid.rows[i / 2] || ''));
      var be = mk('div', 'ecv-bin'), hd = mk('button', 'ecv-binh', '<span class="ecv-badge">' + (i + 1) + '</span> ' + esc(b)), zone = mk('div', 'ecv-zone');
      hd.type = 'button'; hd.setAttribute('aria-label', 'Group ' + (i + 1) + ': ' + b + '. Put the selected card here.');
      hd.addEventListener('click', function () { if (sel) place(sel, i); });
      be.addEventListener('click', function (e) { if (sel && (e.target === be || e.target === zone)) place(sel, i); });
      be.appendChild(hd); be.appendChild(zone); binWrap.appendChild(be); binEls.push({ el: be, zone: zone });
    });
    var ctl = F.ctl, chk = null;
    if (!q && o.check !== false) chk = btn(ctl, 'Check', function () { checked = true; render(); }, 'pri');
    btn(ctl, 'Start over', function () { cards.forEach(function (cd) { cd.at = -1; }); checked = false; sel = null; render(); });
    var fb = mk('div', 'ecv-fb'); fb.setAttribute('aria-live', 'polite'); el.insertBefore(fb, F.out.el);
    cards.forEach(function (cd) {
      var e = mk('button', 'ecv-card', esc(cd.text)); e.type = 'button'; cd.el = e;
      e.addEventListener('click', function (ev) { if (e._dragged) { e._dragged = false; return; } ev.stopPropagation(); sel = sel === cd ? null : cd; render(); });
      e.addEventListener('keydown', function (ev) { var n = parseInt(ev.key, 10); if (!isNaN(n)) { ev.preventDefault(); if (n === 0) place(cd, -1); else if (n <= bins.length) place(cd, n - 1); e.focus(); } else if (ev.key === 'Escape') { sel = null; render(); } });
      drag(cd);
    });
    function place(cd, b) { cd.at = b; sel = null; checked = false; render(); try { cd.el.focus({ preventScroll: true }); } catch (er) { } announce(cd.text + (b < 0 ? ' put back.' : ' placed in ' + bins[b] + '.')); }
    function announce(s) { F.out.el.hidden = false; F.out.set(s); }
    function drag(cd) { // mouse and pen drag; touch uses tap-then-tap so the page still scrolls
      var e = cd.el, st = null, ghost = null;
      e.addEventListener('pointerdown', function (ev) { if (ev.pointerType === 'touch' || ev.button) return; st = [ev.clientX, ev.clientY, ev.pointerId]; });
      e.addEventListener('pointermove', function (ev) {
        if (!st || ev.pointerId !== st[2]) return;
        if (!ghost && M.hypot(ev.clientX - st[0], ev.clientY - st[1]) > 6) { ghost = e.cloneNode(true); ghost.className = 'ecv-card ecv-ghost'; ghost.style.width = e.offsetWidth + 'px'; D.body.appendChild(ghost); try { e.setPointerCapture(st[2]); } catch (er) { } e.classList.add('ecv-lift'); }
        if (ghost) { ghost.style.left = ev.clientX - e.offsetWidth / 2 + 'px'; ghost.style.top = ev.clientY - 16 + 'px'; binEls.forEach(function (b) { var r = b.el.getBoundingClientRect(); b.el.classList.toggle('over', ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom); }); }
      });
      function end(ev) {
        if (!st) return; var was = !!ghost; st = null;
        if (ghost) { ghost.remove(); ghost = null; e.classList.remove('ecv-lift'); var hit = -2; binEls.forEach(function (b, i) { if (b.el.classList.contains('over')) hit = i; b.el.classList.remove('over'); }); var pr = pool.getBoundingClientRect(); if (hit < 0 && ev.clientX >= pr.left && ev.clientX <= pr.right && ev.clientY >= pr.top && ev.clientY <= pr.bottom) hit = -1; if (hit > -2) place(cd, hit); e._dragged = was; }
      }
      e.addEventListener('pointerup', end); e.addEventListener('pointercancel', end);
    }
    function render() {
      cards.forEach(function (cd) {
        var host = cd.at < 0 ? pool : binEls[cd.at].zone; if (cd.el.parentNode !== host) host.appendChild(cd.el);
        cd.el.setAttribute('aria-pressed', String(sel === cd));
        var ok = checked && cd.at >= 0 ? cd.at === cd.bin : null;
        cd.el.classList.toggle('ok', ok === true); cd.el.classList.toggle('no', ok === false);
        cd.el.setAttribute('aria-label', cd.text + (cd.at >= 0 ? ', in ' + bins[cd.at] : ', not sorted yet') + (ok === true ? ', right' : ok === false ? ', not right' : '') + '. Press 1 to ' + bins.length + ' to place it.');
      });
      pool.classList.toggle('empty', cards.every(function (cd) { return cd.at >= 0; }));
      binEls.forEach(function (b) { b.el.classList.toggle('target', !!sel); });
      if (checked) {
        var placed = cards.filter(function (cd) { return cd.at >= 0; }), right = placed.filter(function (cd) { return cd.at === cd.bin; }), wrong = placed.filter(function (cd) { return cd.at !== cd.bin; });
        fb.innerHTML = '<p><b>' + right.length + ' of ' + cards.length + ' right.</b>' + (placed.length < cards.length ? ' ' + (cards.length - placed.length) + ' still to sort.' : '') + (right.length === cards.length ? ' All sorted correctly.' : '') + '</p>' + (wrong.length ? '<ul>' + wrong.map(function (cd) { return '<li><b>' + esc(cd.text) + '</b> belongs in <b>' + esc(bins[cd.bin]) + '</b>. ' + cd.why + '</li>'; }).join('') + '</ul>' : '');
      } else fb.innerHTML = '';
    }
    render(); F.out.el.hidden = true;
    return { render: render };
  });

  var GAME_PRESETS = {
    pd: { players: ['Ann', 'Bob'], rows: ['Stay quiet', 'Confess'], cols: ['Stay quiet', 'Confess'], payoffs: [[[-1, -1], [-10, 0]], [[0, -10], [-5, -5]]], note: 'Payoffs are years in prison, written as negative numbers.' },
    cartel: { players: ['Firm A', 'Firm B'], rows: ['Keep the deal', 'Cheat'], cols: ['Keep the deal', 'Cheat'], payoffs: [[[50, 50], [20, 70]], [[70, 20], [30, 30]]], note: 'Payoffs are profits in thousands of dollars.' },
    coordination: { players: ['Firm A', 'Firm B'], rows: ['Standard X', 'Standard Y'], cols: ['Standard X', 'Standard Y'], payoffs: [[[5, 5], [0, 0]], [[0, 0], [3, 3]]] },
    chicken: { players: ['Driver A', 'Driver B'], rows: ['Swerve', 'Straight'], cols: ['Swerve', 'Straight'], payoffs: [[[0, 0], [-1, 1]], [[1, -1], [-10, -10]]] },
    publicgoods: { players: ['Pat', 'Sam'], rows: ['Contribute', 'Don’t'], cols: ['Contribute', 'Don’t'], payoffs: [[[6, 6], [-2, 8]], [[8, -2], [0, 0]]], note: 'Each puts in $10 or nothing; the pot is multiplied by 1.6 and split evenly. Payoffs are each person’s gain.' },
    pennies: { players: ['Row', 'Column'], rows: ['Heads', 'Tails'], cols: ['Heads', 'Tails'], payoffs: [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]] }
  };
  GAME_PRESETS['public-goods'] = GAME_PRESETS.publicgoods; GAME_PRESETS.prisoners = GAME_PRESETS.pd; GAME_PRESETS['matching-pennies'] = GAME_PRESETS.pennies;

  /* ec-payoff: a payoff matrix; tap payoffs to mark best responses, then Check; mixed strategies; repeated play */
  V.register('ec-payoff', function (el, o) {
    var pr = GAME_PRESETS[o.preset] || GAME_PRESETS[o.repeated ? 'cartel' : o.mixed ? 'pennies' : 'pd'];
    o = opt(o, { players: pr.players, rows: pr.rows, cols: pr.cols, payoffs: pr.payoffs, underline: !o.show, show: [] });
    var F = frame(el, o, 'A payoff matrix'), q = F.quiet, k = K(), Pm = o.payoffs, R = Pm.length, Cn = Pm[0].length, G = game(Pm), PL = o.players;
    var marks = {}, checked = false, show = q ? [] : o.show;
    var wrap = mk('div', 'ecv-game'); F.box.appendChild(wrap);
    var tbl = mk('table', 'ecv-mx'); wrap.appendChild(tbl);
    var note = o.preset && pr.note ? mk('p', 'ecv-note', pr.note) : null; if (note) wrap.appendChild(note);
    var learner = o.underline && !q && F.inter;
    if (learner) { btn(F.ctl, 'Check', function () { checked = true; render(); }, 'pri'); btn(F.ctl, 'Clear', function () { marks = {}; checked = false; render(); }); }
    if (!q && !learner && F.inter && !o.mixed && !o.repeated) { ['best', 'dominant', 'nash'].forEach(function (s) { toggle(F.ctl, { best: 'Best responses', dominant: 'Dominant strategies', nash: 'Nash equilibria' }[s], has(show, s), function (v) { show = show.filter(function (x) { return x !== s; }); if (v) show = show.concat([s]); render(); }); }); }
    function isBR(who, i, j) { return G.isBR(who ? G.brCol : G.brRow, i, j); }
    function render() {
      var h = '<caption class="ecv-sr">' + esc(PL[0]) + ' picks a row, ' + esc(PL[1]) + ' picks a column. Each cell lists (' + esc(PL[0]) + ', ' + esc(PL[1]) + ').</caption><thead><tr><th class="c0" rowspan="2"></th><th class="pl c" colspan="' + Cn + '">' + esc(PL[1]) + '</th></tr><tr>';
      for (var j = 0; j < Cn; j++) h += '<th scope="col" class="c">' + esc(o.cols[j]) + (has(show, 'dominant') && G.domCol === j ? '<span class="dom">dominant</span>' : '') + '</th>';
      h += '</tr></thead><tbody>';
      for (var i = 0; i < R; i++) {
        h += '<tr>' + (i === 0 ? '' : '') + '<th scope="row" class="r">' + (i === 0 ? '<span class="pl">' + esc(PL[0]) + '</span>' : '') + esc(o.rows[i]) + (has(show, 'dominant') && G.domRow === i ? '<span class="dom">dominant</span>' : '') + '</th>';
        for (j = 0; j < Cn; j++) {
          var ne = (has(show, 'nash') || checked) && G.nash.some(function (x) { return x[0] === i && x[1] === j; });
          h += '<td class="' + (ne ? 'ne' : '') + '">';
          [0, 1].forEach(function (w) {
            var id = i + '-' + j + '-' + w, mark = marks[id], br = isBR(w, i, j), cls = 'pv p' + w + ((has(show, 'best') && br) || (mark && !checked) ? ' u' : '') + (checked ? (mark && br ? ' u ok' : mark && !br ? ' u no' : !mark && br ? ' miss' : '') : '');
            var lab = (w ? PL[1] : PL[0]) + ' gets ' + Pm[i][j][w] + ' when ' + PL[0] + ' plays ' + o.rows[i] + ' and ' + PL[1] + ' plays ' + o.cols[j];
            h += (w ? '<span class="sep">,</span> ' : '') + (learner ? '<button type="button" class="' + cls + '" data-id="' + id + '" aria-pressed="' + !!mark + '" aria-label="' + esc(lab) + '. Mark as a best response.">' + fm(Pm[i][j][w], 2) + '</button>' : '<span class="' + cls + '" aria-label="' + esc(lab) + '">' + fm(Pm[i][j][w], 2) + '</span>');
          });
          h += (ne ? '<span class="nel">Nash</span>' : '') + '</td>';
        }
        h += '</tr>';
      }
      tbl.innerHTML = h + '</tbody>';
      tbl.querySelectorAll('button.pv').forEach(function (b) { b.addEventListener('click', function () { var id = b.dataset.id; marks[id] = !marks[id]; checked = false; render(); var nb = tbl.querySelector('[data-id="' + id + '"]'); if (nb) nb.focus(); }); });
      var txt = '';
      if (checked) {
        var all = 0, right = 0, extra = 0; for (i = 0; i < R; i++) for (j = 0; j < Cn; j++) [0, 1].forEach(function (w) { var br = isBR(w, i, j), m = !!marks[i + '-' + j + '-' + w]; if (br) { all++; if (m) right++; } else if (m) extra++; });
        txt = '<b>' + right + ' of ' + all + '</b> best responses found' + (extra ? ', and ' + extra + ' marked that are not best responses (red)' : '') + '. ' + summary();
        if (right < all || extra) txt += ' To find ' + esc(PL[0]) + '’s best response, fix a column and compare <b>' + esc(PL[0]) + '’s own</b> payoffs (the first numbers) down that column. For ' + esc(PL[1]) + ', fix a row and compare the second numbers across it.';
        F.out.el.hidden = false; F.out.set(txt);
      } else if (!q && !o.mixed && !o.repeated) F.set(learner ? 'Tap the best payoff for ' + esc(PL[0]) + ' in each column, and the best payoff for ' + esc(PL[1]) + ' in each row. Then press Check.' : summary());
    }
    function summary() {
      var s = '', nm = function (x) { return '(' + esc(o.rows[x[0]]) + ', ' + esc(o.cols[x[1]]) + ')'; };
      if (G.domRow >= 0) s += esc(PL[0]) + ' has a dominant strategy: <b>' + esc(o.rows[G.domRow]) + '</b>. '; if (G.domCol >= 0) s += esc(PL[1]) + ' has a dominant strategy: <b>' + esc(o.cols[G.domCol]) + '</b>. ';
      s += G.nash.length ? 'Nash equilibri' + (G.nash.length > 1 ? 'a' : 'um') + ' (both payoffs underlined): <b>' + G.nash.map(nm).join(', ') + '</b>.' : 'No cell has both payoffs underlined: no Nash equilibrium in pure strategies.';
      if (G.nash.length === 1 && R === 2 && Cn === 2) { var ne = G.nash[0], better = []; for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) if (Pm[i][j][0] > Pm[ne[0]][ne[1]][0] && Pm[i][j][1] > Pm[ne[0]][ne[1]][1]) better.push([i, j]); if (better.length) s += ' Yet both would be better off at ' + better.map(nm).join(', ') + ': an equilibrium can be bad for everyone.'; }
      return s;
    }
    render();
    // mixed strategies (2×2) and repeated play: a small chart below the matrix
    if ((o.mixed || o.repeated) && R === 2 && Cn === 2) {
      var c = F.canvas(function (w) { return o.mixed ? (w >= 560 ? w / 2.4 : w * 1.35) : (w >= 560 ? w / 2.3 : w / 1.2); }), T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
      var pp = 0.5, qq = 0.5, delta = num(o.delta, 0.6), Ax = [axes(c, { xmax: 1, ymin: 0, ymax: 1, xLabel: '', yLabel: '' }), axes(c, { xmax: 1, ymax: 1 })];
      var mn = M.min.apply(null, [].concat.apply([], Pm.map(function (r) { return [].concat.apply([], r); }))), mxv = M.max.apply(null, [].concat.apply([], Pm.map(function (r) { return [].concat.apply([], r); })));
      if (o.mixed) {
        Ax = [axes(c, { xmax: 1, ymin: M.min(0, mn) - 0.5, ymax: mxv + 0.5, xLabel: 'q = chance ' + PL[1] + ' plays ' + o.cols[0], yLabel: PL[0] + '’s expected payoff', title: '', xstep: 0.25 }), axes(c, { xmax: 1, ymin: M.min(0, mn) - 0.5, ymax: mxv + 0.5, xLabel: 'p = chance ' + PL[0] + ' plays ' + o.rows[0], yLabel: PL[1] + '’s expected payoff', xstep: 0.25 })];
        if (F.inter) { V.slider(F.ctl, { label: 'p (' + PL[0] + ')', min: 0, max: 1, step: 0.01, value: pp, fmt: function (v) { return fm(v, 2); }, input: function (v) { pp = v; drawC(); } }); V.slider(F.ctl, { label: 'q (' + PL[1] + ')', min: 0, max: 1, step: 0.01, value: qq, fmt: function (v) { return fm(v, 2); }, input: function (v) { qq = v; drawC(); } }); }
      } else {
        var rr = Pm[0][0][0], tt = Pm[1][0][0], pu = Pm[1][1][0], ds = (tt - rr) / (tt - pu);
        if (F.inter) V.slider(F.ctl, { label: 'Patience (discount factor δ)', min: 0.05, max: 0.95, step: 0.01, value: delta, fmt: function (v) { return fm(v, 2); }, input: function (v) { delta = v; drawC(); } });
      }
      var KN = knobs(F, c, [], function () { });
      var drawC = function () {
        k = K(); clearC(c); var wide = c.w >= 560, g = 16;
        if (o.mixed) {
          if (wide) { Ax[0].set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); Ax[1].set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { Ax[0].set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); Ax[1].set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); }
          Ax[0].draw(); Ax[1].draw();
          var r0 = function (x) { return Pm[0][0][0] * x + Pm[0][1][0] * (1 - x); }, r1 = function (x) { return Pm[1][0][0] * x + Pm[1][1][0] * (1 - x); };
          var c0 = function (x) { return Pm[0][0][1] * x + Pm[1][0][1] * (1 - x); }, c1 = function (x) { return Pm[0][1][1] * x + Pm[1][1][1] * (1 - x); };
          Ax[0].fn(r0, k.blue, { from: 0, to: 1 }); Ax[0].fn(r1, k.blue2, { from: 0, to: 1, dash: [7, 5] }); Ax[0].nameAt(o.rows[0], 0.9, r0(0.9), k.blue, -10, -12); Ax[0].nameAt(o.rows[1], 0.9, r1(0.9), k.blue2, -10, 12);
          Ax[1].fn(c0, k.orange, { from: 0, to: 1 }); Ax[1].fn(c1, k.orange2, { from: 0, to: 1, dash: [7, 5] }); Ax[1].nameAt(o.cols[0], 0.9, c0(0.9), k.orange, -10, -12); Ax[1].nameAt(o.cols[1], 0.9, c1(0.9), k.orange2, -10, 12);
          Ax[0].vline(qq, k.gold, { w: 2 }); Ax[1].vline(pp, k.gold, { w: 2 }); Ax[0].dot(qq, r0(qq), k.blue, 4.5); Ax[0].dot(qq, r1(qq), k.blue2, 4.5); Ax[1].dot(pp, c0(pp), k.orange, 4.5); Ax[1].dot(pp, c1(pp), k.orange2, 4.5);
          var mx = G.mixed, tl = [];
          if (mx && !q) { Ax[0].dot(mx.q, r0(mx.q), k.ink, 6); Ax[0].tagX(mx.q, 'q* = ' + fm(mx.q, 3), k.ink); Ax[1].dot(mx.p, c0(mx.p), k.ink, 6); Ax[1].tagX(mx.p, 'p* = ' + fm(mx.p, 3), k.ink); tl = [{ k: 'p* (' + PL[0] + ')', v: fm(mx.p, 3), c: k.blue }, { k: 'q* (' + PL[1] + ')', v: fm(mx.q, 3), c: k.orange }]; }
          T.set(tl);
          F.set(mx ? 'Left: ' + esc(PL[0]) + '’s expected payoff from each row as ' + esc(PL[1]) + '’s mix q changes. The lines cross at q* = ' + fm(mx.q, 3) + ', where ' + esc(PL[0]) + ' does not care which row to play. So ' + esc(PL[1]) + '’s equilibrium mix is set by <b>' + esc(PL[0]) + '’s</b> payoffs, and the other way around (right). Neither can gain by changing when p = ' + fm(mx.p, 3) + ' and q = ' + fm(mx.q, 3) + '.' : 'The lines do not cross between 0 and 1: this game has no equilibrium in which both players mix.');
          F.say('Two graphs of expected payoffs against the other player’s mixing probability.');
        } else {
          Ax[0].set({ x: 0, y: 0, w: c.w, h: c.h }); var A = Ax[0], coop = rr / (1 - delta), cheat = tt + delta * pu / (1 - delta), top = M.max(coop, cheat, rr / (1 - 0.95)) * 0.4 + M.max(coop, cheat) * 0.75;
          A.o.ymax = niceCeil(M.max(coop, cheat) * 1.2); A.o.xmax = 1; A.ymax = A.o.ymax; A.xmax = 1; A.o.xstep = 0.1; A.o.xLabel = 'Patience δ'; A.o.yLabel = 'Value of the stream'; A.o.money = false; A.draw();
          A.fn(function (d) { return rr / (1 - d); }, k.green, { from: 0, to: 0.98 }); A.fn(function (d) { return tt + d * pu / (1 - d); }, k.red, { from: 0, to: 0.98 });
          A.nameAt('Cooperate forever', 0.12, rr / 0.88, k.green, 30, 16); A.nameAt('Cheat once, then punished', 0.12, tt + 0.12 * pu / 0.88, k.red, 40, -14);
          A.vline(delta, k.gold, { w: 2 }); A.dot(delta, coop, k.green, 5.5); A.dot(delta, cheat, k.red, 5.5);
          if (!q) { A.vline(ds, k.ink, { w: 1.3, dash: [4, 4] }); A.tagX(ds, 'δ* = ' + fm(ds, 3), k.ink); }
          T.set(q ? [] : [{ k: 'Cooperate forever: R ÷ (1 − δ)', v: fm(coop, 1), c: k.green }, { k: 'Cheat: T + δP ÷ (1 − δ)', v: fm(cheat, 1), c: k.red }, { k: 'Threshold δ*', v: fm(ds, 3), c: k.ink, hi: true }]);
          F.set('Played over and over, each player compares keeping the deal forever (' + fm(rr) + ' every round) with cheating once (' + fm(tt) + ') and then getting the punishment payoff (' + fm(pu) + ') forever after. Cooperation holds when the player is patient enough: δ ≥ (T − R) ÷ (T − P) = ' + fm(ds, 3) + '. ' + (delta >= ds ? 'At δ = ' + fm(delta, 2) + ', keeping the deal is worth more.' : 'At δ = ' + fm(delta, 2) + ', cheating pays.'));
          F.say('Two lines: the value of cooperating forever and of cheating once, against the discount factor.');
        }
        KN.place();
      };
      F.redraw(drawC); drawC();
    }
    return { render: render };
  });

  var TREES = {
    entry: { players: ['Entrant', 'Incumbent'], threat: [1, 1], tree: { player: 0, moves: [{ label: 'Stay out', pay: [0, 10] }, { label: 'Enter', to: { player: 1, moves: [{ label: 'Accommodate', pay: [3, 5] }, { label: 'Fight', pay: [-2, -1] }] } }] },
      note: 'The incumbent threatens to fight a price war. The threat is empty: once the entrant is in, fighting pays the incumbent −1 instead of 5.' },
    stackelberg: { players: ['Leader', 'Follower'], tree: { player: 0, moves: [{ label: 'q = 4', to: { player: 1, moves: [{ label: 'q = 3', pay: [20, 15] }, { label: 'q = 4', pay: [16, 16] }] } }, { label: 'q = 6', to: { player: 1, moves: [{ label: 'q = 3', pay: [18, 9] }, { label: 'q = 4', pay: [12, 8] }] } }] },
      note: 'Market price P = 12 − total quantity, no costs; payoffs are profits. The leader moves first and plans for the follower’s reaction.' },
    ultimatum: { players: ['Proposer', 'Responder'], tree: { player: 0, moves: [{ label: 'Offer 5 of 10', to: { player: 1, moves: [{ label: 'Accept', pay: [5, 5] }, { label: 'Reject', pay: [0, 0] }] } }, { label: 'Offer 2 of 10', to: { player: 1, moves: [{ label: 'Accept', pay: [8, 2] }, { label: 'Reject', pay: [0, 0] }] } }] },
      note: 'With payoffs as written, the responder accepts any positive offer, so the proposer offers little. In experiments, many people turn down offers they see as unfair.' }
  };
  /* ec-gametree: a sequential game drawn top down, solved by backward induction one decision at a time */
  V.register('ec-gametree', function (el, o) {
    var pr = TREES[o.preset] || (o.tree ? null : TREES.entry);
    o = opt(o, { players: pr ? pr.players : ['A', 'B'], tree: pr ? pr.tree : null, solve: true });
    var F = frame(el, o, 'A game tree'), q = F.quiet, k = K(), PL = o.players;
    function idx(p) { if (typeof p === 'number') return p; var i = PL.indexOf(p); return i >= 0 ? i : (String(p).toUpperCase().charCodeAt(0) - 65) || 0; }
    var root = JSON.parse(JSON.stringify(o.tree)), leaves = [], nodes = [];
    (function prep(n, d, path) { n._d = d; n._path = path; if (n.pay) { leaves.push(n); return; } n._p = idx(n.player); nodes.push(n); n.moves.forEach(function (mv, i) { if (mv.pay) mv.to = { pay: mv.pay }; prep(mv.to, d + 1, path.concat(i)); }); })(root, 0, []);
    var order = backward(root).order, depth = M.max.apply(null, leaves.map(function (l) { return l._d; }));
    var step = clamp(num(o.step, 0), 0, order.length), threatOn = false;
    leaves.forEach(function (l, i) { l._x = (i + 0.5) / leaves.length; });
    (function px(n) { if (n.pay) return n._x; var xs = n.moves.map(function (mv) { return px(mv.to); }); n._x = (xs[0] + xs[xs.length - 1]) / 2; return n._x; })(root);
    var c = F.canvas(function (w) { return M.max(250, M.min(420, 120 + depth * 105)); }), T = null;
    if (F.inter && o.solve !== false && !q) stepper(F.ctl, order.length + 1, step, function (i) { step = i; draw(); }, function (i) { return i === 0 ? 'Start at the end of the game and work back.' : 'Solved ' + i + ' of ' + order.length + ' decisions: ' + esc(PL[order[i - 1].node._p]) + ' picks ' + esc(order[i - 1].node.moves[order[i - 1].best].label) + '.'; });
    var thr = pr && pr.threat ? pr.threat : o.threat;
    if (F.inter && thr && !q) toggle(F.ctl, 'Show the threat', false, function (v) { threatOn = v; draw(); });
    var KN = knobs(F, c, [], function () { });
    function nodeAt(path) { var n = root; path.forEach(function (i) { n = n.moves[i].to; }); return n; }
    function draw() {
      k = K(); clearC(c); var ctx = c.ctx, top = 50, bot = 46, X = function (x) { return 16 + x * (c.w - 32); }, Y = function (d) { return top + d * (c.h - top - bot) / depth; };
      var solved = order.slice(0, step), isSolved = function (n) { return solved.some(function (s) { return s.node === n; }); };
      (function edges(n) {
        if (n.pay) return; n.moves.forEach(function (mv, i) {
          var ch = mv.to, x1 = X(n._x), y1 = Y(n._d), x2 = X(ch._x), y2 = ch.pay ? Y(depth) : Y(ch._d), chosen = isSolved(n) && n._best === i;
          ctx.save(); ctx.strokeStyle = chosen ? k.acc : isSolved(n) ? rgba(k.muted.length === 7 ? k.muted : '#888888', 0.45) : k.axis; ctx.lineWidth = chosen ? 5 : 2; ctx.setLineDash(isSolved(n) && !chosen ? [5, 5] : []);
          if (threatOn && isThreat(n, i)) { ctx.strokeStyle = k.red; ctx.setLineDash([7, 5]); ctx.lineWidth = 3; }
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
          var tt2 = ch.pay ? (c.w < 560 ? 0.45 : 0.6) : 0.5, side = x2 < x1 - 1 ? -1 : x2 > x1 + 1 ? 1 : 0; pill(ctx, mv.label, x1 + (x2 - x1) * tt2 + side * 5, y1 + (y2 - y1) * tt2, { align: side < 0 ? 'right' : side > 0 ? 'left' : 'center', size: 11.5, color: chosen ? k.acc : threatOn && isThreat(n, i) ? k.red : k.ink, wt: chosen ? 700 : 600, box: { x: 0, y: 0, w: c.w, h: c.h } });
          edges(ch);
        });
      })(root);
      (function nodesDraw(n) {
        if (n.pay) { var s = '(' + n.pay.map(function (v) { return fm(v, 2); }).join(', ') + ')'; pill(ctx, s, X(n._x), Y(depth) + 14, { size: 12, color: k.ink, border: k.grid, box: { x: 0, y: 0, w: c.w, h: c.h } }); return; }
        var x = X(n._x), y = Y(n._d); dotPx(ctx, x, y, isSolved(n) ? k.acc : k.ink, 7);
        pill(ctx, PL[n._p], x, y - 17, { size: 11.5, color: n._p ? k.orange2 : k.blue, box: { x: 0, y: 0, w: c.w, h: c.h } });
        if (isSolved(n) && !q) pill(ctx, '→ (' + n._vals[n._best].map(function (v) { return fm(v, 2); }).join(', ') + ')', x + 12, y + 14, { align: 'left', size: 11, color: k.acc, border: k.acc, box: { x: 0, y: 0, w: c.w, h: c.h } });
        n.moves.forEach(function (mv) { nodesDraw(mv.to); });
      })(root);
      txt(ctx, 'Payoffs: (' + PL.join(', ') + ')', 8, 12, { align: 'left', size: 11.5 });
      var res = step >= order.length ? 'Backward induction is done: the thick path is what rational players do, ending at (' + order[order.length - 1].node._vals[order[order.length - 1].best].map(function (v) { return fm(v, 2); }).join(', ') + ').' : 'Solve from the end: at each last decision, the player picks the move with the best payoff <b>for that player</b>, and that payoff pair moves up the tree.';
      F.set(res + (threatOn && (pr && pr.note) ? ' ' + pr.note : pr && step >= order.length && o.preset !== 'entry' ? ' ' + pr.note : ''));
      F.say('A game tree with ' + nodes.length + ' decision points and ' + leaves.length + ' outcomes.' + (q ? '' : ' ' + step + ' decisions solved.'));
      KN.place();
    }
    function isThreat(n, i) { // threat: [depth of the node, move index] on the path of the other player's first non-terminal reply
      if (!thr) return false; return n._d === thr[0] && i === thr[1];
    }
    if (o.solve === true && !F.inter) step = order.length;
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* shared: a market panel with shifted curves (old dashed), arrows and both equilibria */
  function sdPanel(A, D0, S0, dD, dS, nm, o) {
    var k = K(); o = o || {}; var D1 = D0.shift(dD || 0), S1 = S0.shift(dS || 0), e0 = equilibrium(D0, S0), e1 = equilibrium(D1, S1), sub1 = sub(1), sub2 = sub(2);
    if (dD) { A.lin(D0, k.blue, { dash: [7, 6], w: 2.1, alpha: 0.7 }); A.name(D0, nm[0] + sub1, k.blue, 0.93); }
    if (dS) { A.lin(S0, k.orange, { dash: [7, 6], w: 2.1, alpha: 0.7 }); A.name(S0, nm[1] + sub1, k.orange, 0.93); }
    A.lin(D1, k.blue); A.lin(S1, k.orange); A.name(D1, nm[0] + (dD ? sub2 : ''), k.blue, 0.93); A.name(S1, nm[1] + (dS ? sub2 : ''), k.orange, 0.93);
    function arr(L0, L1, col) { var ok = []; for (var i = 1; i < 60; i++) { var p = A.ymin + (A.ymax - A.ymin) * i / 60, a = L0.Q(p), b = L1.Q(p); if (a > A.xmin + (A.xmax - A.xmin) * 0.04 && b > A.xmin + (A.xmax - A.xmin) * 0.04 && a < A.xmax * 0.96 && b < A.xmax * 0.96) ok.push(p); } if (!ok.length) return; var pp = ok[M.floor(ok.length * (L0.m < 0 ? 0.72 : 0.28))]; A.arrow(L0.Q(pp), pp, L1.Q(pp), pp, col, 2.4); }
    if (dD) arr(D0, D1, k.blue); if (dS) arr(S0, S1, k.orange);
    if (dD || dS) { A.guide(e0.q, e0.p, k.muted); A.dot(e0.q, e0.p, k.muted, 5); }
    A.guide(e1.q, e1.p); A.dot(e1.q, e1.p, k.ink, 6);
    if (!o.quiet) { if (dD || dS) { A.tagY(e0.p, o.yf ? o.yf(e0.p) : fm(e0.p), k.muted); A.tagX(e0.q, o.xf ? o.xf(e0.q) : fm(e0.q), k.muted); } A.tagY(e1.p, o.yf ? o.yf(e1.p) : fm(e1.p), k.ink); A.tagX(e1.q, o.xf ? o.xf(e1.q) : fm(e1.q), k.ink); }
    return { e0: e0, e1: e1, D1: D1, S1: S1 };
  }
  /* event buttons: one event at a time (press again to undo); ev: { label, curve, dir, size, why } */
  function eventButtons(F, events, groups, apply) {
    var cur = null, bs = [], gs = {};
    groups.forEach(function (g) { gs[g[0]] = group(F.ctl, g[1]); });
    events.forEach(function (ev, i) { var g = gs[ev.group || ev.curve] || gs[groups[0][0]], b = btn(g, ev.label, function () { cur = cur === i ? null : i; bs.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === cur)); }); apply(cur == null ? null : events[cur]); }, 'ecv-ev ' + (ev.side || (/^S/.test(ev.curve) ? 's' : 'd'))); b.setAttribute('aria-pressed', 'false'); bs.push(b); });
    Object.keys(gs).forEach(function (key) { if (!gs[key].querySelector('button')) gs[key].remove(); });
    return { set: function (i) { cur = i; bs.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === cur)); }); } };
  }
  function animShift(F, target, setter, draw) { var from = setter(); tween(F, 600, function (t) { setter(from.map(function (v, i) { return lerp(v, target[i], t); })); draw(); }); }

  /* ec-factor: labor markets: one firm's hiring, market shifts, the least-cost rule and monopsony */
  V.register('ec-factor', function (el, o) {
    o = opt(o, { mode: 'firm' });
    var mode = o.mode, F = frame(el, o, 'A labor market'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var c, draw, KN;
    if (mode === 'firm') {
      var rows = (o.rows || [0, 12, 22, 30, 36, 40, 42].map(function (v, i) { return { L: i, TP: v }; })).slice().sort(function (a, b) { return a.L - b.L; });
      var price = num(o.price, 5), wage = num(o.wage, 30), mr = o.mr || null, mkt = !!o.market;
      var W_ = rows.slice(1).map(function (r, i) { var mp = r.TP - rows[i].TP; return { L: r.L, TP: r.TP, MP: mp, MR: mr ? num(mr[i], price) : price, MRP: mp * (mr ? num(mr[i], price) : price) }; });
      var n = W_.length, mrpMax = M.max.apply(null, W_.map(function (w) { return w.MRP; }));
      var Dm = line(2 * wage, -wage / 50), Sm0 = line(0, wage / 50), sS = 0;
      c = F.canvas(function (w) { return mkt ? (w >= 560 ? w / 2.1 : w * 1.6) : hw(w, 1.7, 1.1); });
      var A = axes(c, { xmin: 0.3, xmax: n + 0.7, ymax: niceCeil(M.max(mrpMax, wage * 1.6) * 1.12), xAt: W_.map(function (w) { return [w.L, String(w.L)]; }), xLabel: 'Worker', yLabel: 'Dollars', money: true, title: mkt ? 'One firm' : '' });
      var Am = mkt ? axes(c, { xmax: 100, ymax: niceCeil(wage * 2.1), xLabel: 'Workers (market)', yLabel: 'Wage', money: true, title: 'The labor market' }) : null;
      var tb = tableBox(el, F, 'Marginal revenue product table');
      if (F.inter) { if (mkt) V.slider(F.ctl, { label: 'Workers available (labor supply shift)', min: -30, max: 30, step: 1, value: 0, fmt: function (v) { return (v > 0 ? '+' : '') + fm(v); }, input: function (v) { sS = v; draw(); } }); else V.slider(F.ctl, { label: 'Wage', min: 0, max: M.ceil(mrpMax * 1.1), step: 1, value: wage, fmt: function (v) { return money(v); }, input: function (v) { wage = v; draw(); } }); }
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); var g = 14;
        if (mkt) { var wide = c.w >= 560; if (wide) { Am.set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); A.set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { Am.set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); A.set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); }
          Am.draw(); var r = sdPanel(Am, Dm, Sm0, 0, sS, ['D', 'S'], { quiet: q, yf: money }); wage = r.e1.p; Am.hline(wage, k.orange, { w: 1.4, dash: [4, 3], from: r.e1.q });
          if (wide) arrowPx(c.ctx, Am.Rx - 2, Am.Y(wage), A.L + 6, A.Y(wage), rgba(k.orange, 0.5), 1.6, 8, [4, 4]);
        } else A.set({ x: 0, y: 0, w: c.w, h: c.h });
        A.draw();
        var hired = 0; W_.forEach(function (w) { if (w.MRP >= wage - 1e-9 && hired === w.L - 1) hired = w.L; });
        W_.forEach(function (w) { var on = w.L <= hired; A.poly([[w.L - 0.32, 0], [w.L + 0.32, 0], [w.L + 0.32, w.MRP], [w.L - 0.32, w.MRP]], on ? rgba(k.blue, 0.6) : rgba(k.blue, 0.15), k.blue); });
        A.hline(wage, k.orange, { w: 2.6 }); A.nameAt('Wage ' + money(wage), A.xmax - 0.2, wage, k.orange, -50, -12); A.nameAt('MRP', 1, W_[0].MRP, k.blue, 0, -12);
        tb.innerHTML = tableHTML(['Worker', 'Total product', 'MP', mr ? 'MR' : 'Price', 'MRP', 'Hire?'], W_.map(function (w) { return [fm(w.L), fm(w.TP), q ? '?' : fm(w.MP), money(w.MR), q ? '?' : money(w.MRP), q ? '?' : w.L <= hired ? 'yes' : 'no']; }), q ? -1 : hired - 1);
        T.set(q ? [] : [{ k: 'Workers hired', v: fm(hired), c: k.blue, hi: true }, { k: 'Wage', v: money(wage), c: k.orange }]);
        F.set('Each worker adds MP units of output, worth MP × ' + (mr ? 'MR' : 'price') + ' dollars: the <b>marginal revenue product</b>. Hire while MRP is at least the wage: compare the wage with MRP, not with MP (output is not dollars). ' + (mkt ? 'The wage is set in the whole labor market, so for one small firm it is a flat line.' : 'Lower the wage and the firm hires more: a movement along its labor demand (the MRP curve).'));
        F.say('Bars of marginal revenue product for each worker and a wage line' + (q ? '.' : ': ' + hired + ' workers hired.')); KN.place();
      };
    } else if (mode === 'shift') {
      var D0 = curve(o.demand || { p0: 30, s: 0.25 }, 'D'), S0 = curve(o.supply || { p0: 6, s: 0.15 }, 'S'), sh = [0, 0], evn = null;
      var evs = o.events || [
        { label: 'Price of the product rises', curve: 'D', dir: 1, why: 'Each worker’s output is worth more, so MRP rises: labor demand increases' },
        { label: 'Workers become more productive', curve: 'D', dir: 1, why: 'Higher marginal product raises MRP: labor demand increases' },
        { label: 'Demand for the product falls', curve: 'D', dir: -1, why: 'Labor demand is derived from product demand: it decreases' },
        { label: 'Machines that replace these workers get cheaper', curve: 'D', dir: -1, why: 'Firms switch toward the cheaper input; when that outweighs the boost to output, labor demand decreases' },
        { label: 'More people want this kind of work', curve: 'S', dir: 1, why: 'Labor supply increases' },
        { label: 'Pay rises in other jobs', curve: 'S', dir: -1, why: 'Some workers leave for the better-paying jobs: labor supply decreases' }];
      var e0 = equilibrium(D0, S0), size = M.round(e0.q * 0.3), R2 = sdRange(o, [D0, D0.shift(size)], [S0]);
      c = F.canvas(function (w) { return hw(w, 1.55, 1.02); }); var A2 = axes(c, { xmax: R2.xMax, ymax: R2.yMax, xLabel: o.xLabel || 'Workers', yLabel: o.yLabel || 'Wage ($)', money: true });
      if (F.inter) eventButtons(F, evs, [['D', 'Labor demand'], ['S', 'Labor supply']], function (ev) { evn = ev; var tg = ev ? [ev.curve === 'D' ? ev.dir * (ev.size || size) : 0, ev.curve === 'S' ? ev.dir * (ev.size || size) : 0] : [0, 0]; animShift(F, tg, function (v) { if (v) sh = v; return sh; }, draw); });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A2.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        var r = sdPanel(A2, D0, S0, sh[0], sh[1], ['D', 'S'], { quiet: q, yf: money });
        var tl = [{ k: 'Wage', v: money(r.e0.p) + ' → ' + money(r.e1.p), c: k.ink }, { k: 'Employment', v: fm(r.e0.q) + ' → ' + fm(r.e1.q), c: k.ink }];
        T.set(q ? [] : tl);
        F.set(evn ? '<b>' + evn.label + '.</b> ' + evn.why + '. ' + (evn.curve === 'S' ? 'The wage ' + (r.e1.p > r.e0.p ? 'rises' : 'falls') + ', and firms move <b>along</b> their labor demand curve: a wage change is a movement, not a shift.' : 'The new wage moves workers along the supply curve.') : 'Pick an event. Labor demand comes from what workers produce and what it sells for; labor supply comes from people’s choices about work.');
        marksOn(c, A2, o.marks); F.say('Labor supply and demand' + (evn ? ' after: ' + evn.label + '.' : '.')); KN.place();
      };
    } else if (mode === 'leastcost') {
      var inputs = (o.inputs || [{ name: 'Labor', price: 20, mp: [100, 90, 80, 60, 40, 20] }, { name: 'Capital', price: 40, mp: [240, 200, 160, 120, 80, 40] }]).map(function (x) { return { name: x.name, price: num(x.price, 1), mp: x.mp }; });
      var budget = num(o.budget, 160), used = inputs.map(function () { return 0; });
      function spent() { return used.reduce(function (s, u, j) { return s + u * inputs[j].price; }, 0); }
      function next() { var best = -1, bv = -Infinity; inputs.forEach(function (x, j) { if (used[j] >= x.mp.length || spent() + x.price > budget + 1e-9) return; var v = x.mp[used[j]] / x.price; if (v > bv + 1e-12) { bv = v; best = j; } }); return best; }
      var n2 = M.max.apply(null, inputs.map(function (x) { return x.mp.length; }));
      c = F.canvas(function (w) { return hw(w, 2.1, 1.3); });
      var A3 = axes(c, { xmin: 0.4, xmax: n2 + 0.6, ymax: niceCeil(M.max.apply(null, inputs.map(function (x) { return x.mp[0] / x.price; })) * 1.15), xAt: Array.apply(null, Array(n2)).map(function (_, i) { return [i + 1, String(i + 1)]; }), xLabel: 'Unit of the input', yLabel: 'Extra output per dollar (MP ÷ price)', title: '' });
      var tb2 = tableBox(el, F, 'Marginal product per dollar');
      if (F.inter) { btn(F.ctl, 'Add the next unit', function () { var j = next(); if (j >= 0) { used[j]++; draw(); } }, 'pri'); btn(F.ctl, 'Spend the budget', function () { var j; while ((j = next()) >= 0) used[j]++; draw(); }); btn(F.ctl, 'Start over', function () { used = used.map(function () { return 0; }); draw(); }); }
      else { var jj; while ((jj = next()) >= 0) used[jj]++; }
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A3.set({ x: 0, y: 0, w: c.w, h: c.h }).draw(); var cols = [k.blue, k.orange];
        if (!q) inputs.forEach(function (x, j) { var off = (j - 0.5) * 0.36; x.mp.forEach(function (v, i) { var val = v / x.price, mine = i < used[j]; A3.poly([[i + 1 + off - 0.16, 0], [i + 1 + off + 0.16, 0], [i + 1 + off + 0.16, val], [i + 1 + off - 0.16, val]], mine ? cols[j] : rgba(cols[j], 0.22), cols[j]); }); A3.nameAt(x.name, 1 + (j - 0.5) * 0.36, x.mp[0] / x.price, cols[j], 0, -12); });
        var head = ['Unit']; inputs.forEach(function (x) { head.push(x.name + ' MP', 'MP ÷ $' + fm(x.price)); });
        tb2.innerHTML = tableHTML(head, Array.apply(null, Array(n2)).map(function (_, i) { var r = [String(i + 1)]; inputs.forEach(function (x) { r.push(x.mp[i] != null ? fm(x.mp[i]) : '', x.mp[i] != null ? (q ? '?' : fm(x.mp[i] / x.price, 2)) : ''); }); return r; }));
        var nx = next();
        T.set(q ? [] : [{ k: 'Budget', v: money(budget), c: k.ink }, { k: 'Spent', v: money(spent()), c: k.ink }].concat(inputs.map(function (x, j) { return { k: x.name, v: fm(used[j]) + ' units', c: cols[j] }; })));
        F.set(nx < 0 ? 'Budget spent. At the last units, MP ÷ price is about the same for both inputs: no dollar moved from one input to the other would add output. That is the least-cost rule: MP<sub>L</sub> ÷ w = MP<sub>K</sub> ÷ r.' : 'Each step adds the input with the most extra output <b>per dollar</b>. Next: ' + inputs[nx].name.toLowerCase() + ' (' + fm(inputs[nx].mp[used[nx]] / inputs[nx].price, 2) + ' per dollar). Comparing MP without dividing by the input’s price would mislead.');
        F.say('Bars of marginal product per dollar for two inputs.'); KN.place();
      };
    } else { // monopsony
      var sp = o.supply || { w0: 2, s: 1 }, mrp = o.mrp || { a: 20, b: 1 }, mw = o.minWage != null ? num(o.minWage, 0) : null;
      var mo = monopsony(sp, mrp), xm = num(o.xMax, niceCeil(mo.a / mo.b * 1.02)), ym = num(o.yMax, niceCeil(mo.a * 1.15));
      c = F.canvas(function (w) { return hw(w, 1.5, 1.0); }); var A4 = axes(c, { xmax: xm, ymax: ym, xLabel: o.xLabel || 'Workers (L)', yLabel: 'Wage ($)', money: true });
      var useMW = mw != null;
      if (F.inter) { var mwS = V.slider(F.ctl, { label: 'Minimum wage', min: 0, max: M.round(mo.a * 0.9), step: 0.5, value: mw != null ? mw : M.round((mo.w + mo.wc) / 2), fmt: function (v) { return money(v); }, input: function (v) { mw = v; useMW = true; tg.set(true); draw(); } }); var tg = toggle(F.ctl, 'Minimum wage on', useMW, function (v) { useMW = v; if (v && mw == null) mw = mwS.get(); draw(); }); }
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A4.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        var m = monopsony(sp, mrp, useMW ? mw : null), Sl = line(m.w0, m.s), MFCl = line(m.w0, 2 * m.s), MRPl = line(m.a, -m.b);
        A4.lin(MRPl, k.blue); A4.name(MRPl, 'MRP = D', k.blue, 0.88); A4.lin(Sl, k.orange); A4.name(Sl, 'S', k.orange, 0.92);
        if (useMW && m.min && m.min.binding) { var lk = (mw - m.w0) / m.s; A4.seg(0, mw, lk, mw, k.orange2, { w: 2.6 }); A4.fn(function (l) { return l >= lk ? MFCl.P(l) : NaN; }, k.orange2, { w: 2.3, dash: [2, 0] }); A4.seg(lk, mw, lk, MFCl.P(lk), k.orange2, { w: 2.3, dash: [3, 3] }); A4.hline(mw, k.red, { w: 1.6, dash: [6, 4] }); A4.nameAt('Minimum wage', xm * 0.95, mw, k.red, -40, -12); }
        else { A4.lin(MFCl, k.orange2, { w: 2.3 }); }
        A4.nameAt('MFC', (ym * 0.9 - m.w0) / (2 * m.s), ym * 0.9, k.orange2, -22, 0);
        A4.vline(m.L, k.ink, { w: 1.3, dash: [3, 4], to: m.mrpAtL }); A4.dot(m.L, m.mrpAtL, k.ink, 4.5); A4.dot(m.L, m.w, k.ink, 6); A4.hline(m.w, k.ink, { w: 1.3, dash: [3, 4], to: m.L });
        A4.dot(m.Lc, m.wc, k.muted, 5); if (!q) A4.label('Competitive', m.Lc, m.wc, k.muted, { dx: 10, dy: 14, align: 'left', size: 11 });
        if (!q) { A4.label('MRP = MFC', m.L, m.mrpAtL, k.ink, { dx: -8, dy: -13, align: 'right', size: 11 }); A4.tagY(m.w, money(m.w), k.ink); A4.tagX(m.L, fm(m.L), k.ink); }
        var tl = [{ k: 'Monopsony: workers', v: fm(m.L), c: k.ink }, { k: 'Monopsony: wage (from S)', v: money(m.w), c: k.orange }, { k: 'Competitive: workers', v: fm(m.Lc), c: k.muted }, { k: 'Competitive wage', v: money(m.wc), c: k.muted }];
        var txt2 = 'The only big employer in town must raise the wage for <b>everyone</b> to hire one more worker, so the marginal factor cost (MFC) lies above supply. It hires where MRP = MFC (' + fm(m.L) + ' workers), then pays only what the supply curve says those workers need: <b>' + money(m.w) + '</b>. Read the wage from S, not from MFC or MRP.';
        if (useMW && m.min) {
          if (!q) { A4.dot(m.min.L, mw, k.red, 6); A4.tagX(m.min.L, fm(m.min.L), k.red); }
          tl.push({ k: 'With the minimum wage: workers', v: fm(m.min.L), c: k.red, hi: true });
          txt2 += ' With a minimum wage of ' + money(mw) + (m.min.binding ? ', the firm’s extra cost of a worker is flat at the minimum wage up to the supply curve, so in this model employment ' + (m.min.L > m.L + 1e-9 ? 'rises to ' : m.min.L < m.L - 1e-9 ? 'falls to ' : 'stays at ') + fm(m.min.L) + '. (In a competitive market a binding minimum wage lowers employment. Economists study and debate how real minimum wages affect jobs.)' : ', below the monopsony wage: it does not bind.');
        }
        T.set(q ? [] : tl); F.set(txt2);
        marksOn(c, A4, o.marks); F.say('A monopsony labor market: supply, marginal factor cost and marginal revenue product' + (q ? '.' : '; ' + fm(m.L) + ' workers at a wage of ' + fm(m.w) + '.')); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-externality: private and social curves, the efficient quantity, the corrective tax or subsidy; abatement */
  V.register('ec-externality', function (el, o) {
    o = opt(o, { mode: 'negative' });
    var mode = o.mode, F = frame(el, o, 'An externality'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var c = F.canvas(function (w) { return hw(w, 1.5, 1.0); }), A, draw;
    if (mode === 'abatement') {
      var mb = o.mb || { p0: 90, s: 0.8 }, mc = o.mc || { m0: 0, m1: 0.7 }, MBl = line(num(mb.p0, 90), -M.abs(num(mb.s, 0.8))), MCl = line(num(mc.m0, 0), M.abs(num(mc.m1, 0.7))), xe = equilibrium(MBl, MCl), xa = num(o.level, 100);
      A = axes(c, { xmax: 100, ymax: niceCeil(M.max(MBl.p0, MCl.P(100)) * 1.05), xLabel: o.xLabel || 'Pollution cut (percent)', yLabel: '$ per percent', money: true });
      var KN = knobs(F, c, F.inter ? [{ name: 'Amount of cleanup', pos: function () { return [A.X(xa), A.B - 12]; }, hitd: function (px, py) { return py < A.T || py > A.B + 10 ? 99 : M.abs(px - A.X(xa)); }, drag: function (px) { xa = clamp(M.round(A.q(px)), 0, 100); }, key: function (dx, dy, bg) { xa = clamp(xa + (dx || dy) * (bg ? 10 : 1), 0, 100); }, text: function () { return xa + ' percent'; } }] : [], function () { draw(); });
      draw = function () {
        k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        if (M.abs(xa - xe.q) > 0.5) { var a = M.min(xa, xe.q), b = M.max(xa, xe.q), pts = []; for (var i = 0; i <= 30; i++) { var x = a + (b - a) * i / 30; pts.push([x, MBl.P(x)]); } for (i = 30; i >= 0; i--) { x = a + (b - a) * i / 30; pts.push([x, MCl.P(x)]); } A.hatch(pts); }
        A.lin(MBl, k.blue); A.lin(MCl, k.orange); A.nameAt('MB of cleanup', 8, MBl.P(8), k.blue, 30, -12); A.nameAt('MC of cleanup', 92, MCl.P(92), k.orange, -30, -12);
        A.vline(xa, k.gold, { w: 2 }); A.knob(xa, A.ymin + (A.ymax - A.ymin) * 0.03, k.gold, 7); A.guide(xe.q, xe.p); A.dot(xe.q, xe.p, k.ink, 6);
        if (!q) { A.tagX(xe.q, fm(xe.q, 1) + '%', k.ink); A.label('Efficient', xe.q, xe.p, k.ink, { dx: 10, dy: -13, align: 'left', size: 11 }); }
        var loss = M.abs((MBl.P(xa) - MCl.P(xa)) * (xa - xe.q) / 2);
        T.set(q ? [] : [{ k: 'Efficient cleanup', v: fm(xe.q, 1) + '%', c: k.ink, hi: true }, { k: 'Chosen', v: fm(xa) + '%', c: k.gold }, { k: 'Lost net benefit', v: money(loss), c: k.muted }]);
        F.set('Cleaning up the first units of pollution is cheap and very valuable; the last units are costly and worth less. The efficient amount of cleanup is where marginal benefit equals marginal cost: ' + fm(xe.q, 1) + '%, <b>not 100%</b>. Pushing past it costs more than it is worth (hatched).');
        marksOn(c, A, o.marks); F.say('Marginal benefit and marginal cost of cutting pollution; they cross below 100 percent.'); KN.place();
      };
    } else {
      var Dm = curve(o.demand, 'D'), Sp = curve(o.supply, 'S'), ex = o.external || (mode === 'negative' ? { k: 1, m: 0.25 } : { k: 2, m: 0 }), ek = num(ex.k, 1), em = num(ex.m, 0.25), E = function (Q) { return ek + em * Q; };
      var neg = mode === 'negative', cons = mode === 'positive-consumption';
      var soc = neg ? function (Q) { return Sp.P(Q) + E(Q); } : cons ? function (Q) { return Dm.P(Q) + E(Q); } : function (Q) { return Sp.P(Q) - E(Q); };
      var SOCl = neg ? line(Sp.p0 + ek, Sp.m + em) : cons ? line(Dm.p0 + ek, Dm.m + em) : line(Sp.p0 - ek, Sp.m - em);
      var eM = equilibrium(Dm, Sp), eE = neg ? equilibrium(Dm, SOCl) : cons ? equilibrium(SOCl, Sp) : equilibrium(Dm, SOCl);
      var corr = E(eE.q), pol = num(neg ? o.tax : o.subsidy, 0);
      var R = sdRange(o, [Dm, cons ? SOCl : Dm], [Sp]); R.yMax = num(o.yMax, niceCeil(M.max(R.yMax, (cons ? SOCl.p0 : Dm.p0) * 1.12)));
      A = axes(c, axOpts(o, R));
      if (F.inter) V.slider(F.ctl, { label: neg ? 'Tax per unit' : 'Subsidy per unit', min: 0, max: M.ceil(corr * 2.2), step: 0.1, value: pol, fmt: function (v) { return P$(o, v); }, input: function (v) { pol = v; draw(); } });
      var KN2 = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        var Dp = neg || !cons ? Dm : Dm.up(pol), Spp = neg ? Sp.up(pol) : !cons ? Sp.up(-pol) : Sp, e = equilibrium(cons ? Dp : Dm, neg ? Spp : !cons ? Spp : Sp), qx = e.q;
        if (M.abs(qx - eE.q) > 1e-3) { // deadweight loss: between the social curve and the other private curve, from the efficient to the actual quantity
          var a = M.min(qx, eE.q), b = M.max(qx, eE.q), top = neg ? soc : cons ? soc : Dm.P, bot = neg ? Dm.P : cons ? Sp.P : soc, pts = [];
          for (var i = 0; i <= 30; i++) { var x = a + (b - a) * i / 30; pts.push([x, top(x)]); } for (i = 30; i >= 0; i--) { x = a + (b - a) * i / 30; pts.push([x, bot(x)]); }
          A.hatch(pts); if (!q) A.label('DWL', (2 * qx + eE.q) / 3, (top((2 * qx + eE.q) / 3) + bot((2 * qx + eE.q) / 3)) / 2, k.ink, { size: 11 });
        }
        A.lin(Dm, k.blue); A.lin(Sp, k.orange);
        if (neg) { A.lin(SOCl, k.red, { w: 2.8 }); A.name(Dm, 'D = MPB = MSB', k.blue, 0.85); A.name(Sp, 'S = MPC', k.orange, 0.9); A.name(SOCl, 'MSC', k.red, 0.8); }
        else if (cons) { A.lin(SOCl, k.blue2, { w: 2.8 }); A.name(Dm, 'D = MPB', k.blue, 0.88); A.name(SOCl, 'MSB', k.blue2, 0.88); A.name(Sp, 'S = MPC = MSC', k.orange, 0.9); }
        else { A.lin(SOCl, k.green, { w: 2.8 }); A.name(Dm, 'D = MPB = MSB', k.blue, 0.85); A.name(Sp, 'S = MPC', k.orange, 0.9); A.name(SOCl, 'MSC', k.green, 0.9); }
        if (pol > 0) { var Lp = cons ? Dp : Spp; A.lin(Lp, cons ? k.blue : k.orange, { dash: [8, 5], w: 2 }); A.name(Lp, cons ? 'D + subsidy' : neg ? 'S + tax' : 'S − subsidy', cons ? k.blue : k.orange2, 0.55); }
        A.guide(eM.q, eM.p, k.muted); A.dot(eM.q, eM.p, k.muted, 5.5); A.guide(eE.q, eE.p); A.dot(eE.q, eE.p, k.ink, 6.5);
        if (pol > 0) A.dot(qx, e.p, k.gold, 6);
        if (!q) { A.tagX(eM.q, fm(eM.q, 2), k.muted); A.tagX(eE.q, fm(eE.q, 2), k.ink); A.label('Market', eM.q, eM.p, k.muted, { dx: 10, dy: 14, align: 'left', size: 10.5 }); A.label('Efficient', eE.q, eE.p, k.ink, { dx: -10, dy: -14, align: 'right', size: 10.5 }); A.seg(eE.q, cons ? Dm.P(eE.q) : Sp.P(eE.q), eE.q, SOCl.P(eE.q), k.gold, { w: 3.5 }); }
        var hit = M.abs(pol - corr) < 0.051;
        T.set(q ? [] : [{ k: 'Market quantity', v: fm(eM.q, 2), c: k.muted }, { k: 'Efficient quantity', v: fm(eE.q, 2), c: k.ink }, { k: (neg ? 'External cost' : 'External benefit') + ' at the efficient quantity', v: P$(o, corr), c: k.gold }, { k: 'With this ' + (neg ? 'tax' : 'subsidy'), v: fm(qx, 2) + ' units', c: k.gold, hi: hit }]);
        F.set((neg ? 'Sellers ignore a cost they put on others (pollution), so the market makes <b>too much</b>: ' + fm(eM.q, 2) + ' units instead of ' + fm(eE.q, 2) + '. ' : cons ? 'Buyers ignore a benefit their use gives others, so the benefit sits on the demand side (MSB above demand) and the market makes <b>too little</b>. ' : 'Producing it benefits others too, so the social cost is below the private cost and the market makes <b>too little</b>. ') + 'A ' + (neg ? 'tax' : 'subsidy') + ' equal to the external ' + (neg ? 'cost' : 'benefit') + ' <b>at the efficient quantity</b> (gold bar, ' + P$(o, corr) + ') moves the market there' + (em ? ', not the larger or smaller amount measured at the market quantity (' + P$(o, E(eM.q)) + ')' : '') + '. ' + (hit ? '<b>This one does.</b>' : ''));
        marksOn(c, A, o.marks); F.say('A market with ' + (neg ? 'a negative externality' : 'a positive externality') + ': private and social curves and the efficient quantity.'); KN2.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-lorenz: the Lorenz curve and the Gini coefficient from income shares */
  V.register('ec-lorenz', function (el, o) {
    o = opt(o, { shares: [3, 8, 14, 23, 52], labels: ['Country A', 'Country B'], show: ['table', 'areas', 'gini'] });
    var F = frame(el, o, 'A Lorenz curve'), k = K(), q = F.quiet, sh = o.shares.map(function (v) { return num(v, 0); }), cmp = o.compare ? o.compare.map(function (v) { return num(v, 0); }) : null;
    var tot = sh.reduce(function (a, b) { return a + b; }, 0); sh = sh.map(function (v) { return v * 100 / tot; });
    var n = sh.length, cum = function () { var c2 = [0]; sh.forEach(function (v, i) { c2.push(c2[i] + v); }); return c2; };
    var c = F.canvas(function (w) { return M.min(w * 0.82, 470); }), A = axes(c, { xmax: 100, ymax: 100, xLabel: 'Share of people, poorest first (%)', yLabel: 'Share of income (%)', xstep: 100 / n >= 10 ? 100 / n : 20, ystep: 20 });
    var tb = has(o.show, 'table') ? tableBox(el, F, 'Income shares') : null, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var KN = knobs(F, c, F.inter ? sh.slice(0, n - 1).map(function (_, i) {
      return { name: 'Cumulative share of the poorest ' + fm(100 * (i + 1) / n) + '% of people', pos: function () { var cc = cum(); return [A.X(100 * (i + 1) / n), A.Y(cc[i + 1])]; },
        drag: function (px, py) { setCum(i + 1, A.p(py)); }, key: function (dx, dy, bg) { var cc = cum(); setCum(i + 1, cc[i + 1] + (dy || dx) * (bg ? 2 : 0.5)); }, text: function () { return fm(cum()[i + 1], 1) + '% of income'; } };
    }) : [], function () { draw(); });
    function setCum(j, v) { // keep shares in order (each group's share at least the one before) and the total at 100%
      var cc = cum(), lo = M.max(cc[j - 1] + (j >= 2 ? sh[j - 2] : 0), j + 1 <= n - 1 ? cc[j + 1] - sh[j + 1] : -Infinity), hi = (cc[j - 1] + cc[j + 1]) / 2;
      if (j === 1) lo = M.max(0, j + 1 <= n - 1 ? cc[2] - sh[2] : 0);
      v = clamp(M.round(v * 2) / 2, lo, hi); var d = v - cc[j]; sh[j - 1] += d; sh[j] -= d;
    }
    function draw() {
      k = K(); clearC(c); var side = M.min(c.w, c.h + 60); A.set({ x: (c.w - side) / 2, y: 0, w: side, h: c.h }).draw();
      var cc = cum(), pts = cc.map(function (v, i) { return [100 * i / n, v]; }), L = lorenz(sh);
      if (has(o.show, 'areas')) { A.poly([[0, 0], [100, 100]].concat(pts.slice().reverse()), k.goldSoft); A.poly(pts.concat([[100, 0]]), k.blueSoft); if (!q) { A.label('A', 55, 42, k.gold, { size: 13 }); A.label('B', 78, 22, k.blue, { size: 13 }); } }
      A.seg(0, 0, 100, 100, k.ink, { w: 1.8, dash: [6, 5] }); A.nameAt('Line of equality', 30, 30, k.muted, -6, -14);
      if (cmp) { var t2 = cmp.reduce(function (a, b) { return a + b; }, 0), c2 = [0]; cmp.forEach(function (v, i) { c2.push(c2[i] + v * 100 / t2); }); A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.orange; ctx.lineWidth = 2.6; ctx.setLineDash([7, 5]); ctx.beginPath(); c2.forEach(function (v, i) { ctx[i ? 'lineTo' : 'moveTo'](A.X(100 * i / cmp.length), A.Y(v)); }); ctx.stroke(); ctx.restore(); }); A.nameAt(o.labels[1], 100 * (cmp.length - 1) / cmp.length, c2[cmp.length - 1], k.orange, 34, 14); }
      A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](A.X(p[0]), A.Y(p[1])); }); ctx.stroke(); ctx.restore(); });
      pts.forEach(function (p, i) { if (i > 0 && i < n) A.knob(p[0], p[1], k.blue, 6.5); });
      if (cmp) A.nameAt(o.labels[0], 100 * (n - 1) / n, cc[n - 1], k.blue, -30, -16);
      if (tb) tb.innerHTML = tableHTML(['Group (poorest first)', 'Share of income', 'Cumulative share'], sh.map(function (v, i) { return [(n === 5 ? ['Bottom fifth', 'Second fifth', 'Middle fifth', 'Fourth fifth', 'Top fifth'][i] : 'Group ' + (i + 1)), fm(v, 1) + '%', q ? '?' : fm(cc[i + 1], 1) + '%']; }));
      var tl = q ? [] : [{ k: 'Gini = A ÷ (A + B)', v: fm(L.gini, 3), c: k.ink, hi: true }, { k: 'Area A (A + B = 0.5)', v: fm(L.A, 3), c: k.gold }];
      if (cmp && !q) tl.push({ k: 'Gini, ' + o.labels[1], v: fm(lorenz(cmp).gini, 3), c: k.orange });
      T.set(has(o.show, 'gini') ? tl : []);
      F.set('Add the shares from the poorest group up to get each point. The farther the curve sags below the line of equality, the less equal the incomes, and the higher the Gini coefficient (0 = everyone has the same income; 1 = one person has it all). Drag a point to change the shares; they always add to 100%.');
      F.say('A Lorenz curve with the line of equality' + (q ? '.' : '; Gini coefficient ' + fm(L.gini, 3) + '.')); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-circularflow: households, firms and the two markets; government, banks and the rest of the world as toggles */
  V.register('ec-circularflow', function (el, o) {
    o = opt(o, { sectors: [], label: false, follow: true });
    var F = frame(el, o, 'The circular flow of income and spending'), k = K(), q = F.quiet, sec = { government: has(o.sectors, 'government'), financial: has(o.sectors, 'financial'), foreign: has(o.sectors, 'foreign') };
    var c = F.canvas(function (w) { return w >= 560 ? w * 0.68 : w * (o.sectors && o.sectors.length || F.inter ? 1.3 : 1.05); }), lab = !!o.label, picks = {}, checked = false, dot = null, lap = 0, run = null;
    if (F.inter) {
      [['government', 'Government'], ['financial', 'Banks and financial markets'], ['foreign', 'Rest of the world']].forEach(function (s) { toggle(F.ctl, s[1], sec[s[0]], function (v) { sec[s[0]] = v; build(); draw(); }); });
      if (o.follow !== false) { var pb = btn(F.ctl, V.reduced ? 'Follow a dollar: next step' : '▶ Follow a dollar', function () { follow(); }); }
    }
    var labelBox = lab ? mk('div', 'ecv-cflabels') : null; if (labelBox) el.insertBefore(labelBox, F.out.el);
    if (lab && !q) { btn(F.ctl, 'Check', function () { checked = true; renderSel(); draw(); }, 'pri'); }
    var arrows = [], boxes = {};
    function build() {
      var W = c.w, H = c.h, nar = W < 560, cx = W / 2, cy = H / 2 + (sec.foreign ? 12 : 0), rx = W * (nar ? 0.36 : 0.36), ry = H * (nar ? 0.36 : 0.35), bw = nar ? 92 : 128, bh = nar ? 40 : 44;
      boxes = { H: { x: cx - rx, y: cy, t: 'Households', c: k.blue }, F: { x: cx + rx, y: cy, t: 'Firms', c: k.orange }, P: { x: cx, y: cy - ry, t: 'Product market', c: k.acc }, R: { x: cx, y: cy + ry, t: nar ? 'Resource market' : 'Resource (factor) market', c: k.acc } };
      if (sec.government) boxes.G = { x: cx, y: cy - (sec.financial ? ry * 0.28 : 0), t: 'Government', c: k.purple };
      if (sec.financial) boxes.B = { x: cx, y: cy + (sec.government ? ry * 0.3 : 0), t: nar ? 'Banks' : 'Financial markets', c: k.teal };
      if (sec.foreign) boxes.X = { x: cx + rx * 0.95, y: cy - ry * 1.0, t: nar ? 'Rest of world' : 'Rest of the world', c: k.pink };
      Object.keys(boxes).forEach(function (key) { boxes[key].w = key === 'P' || key === 'R' ? bw * (nar ? 1.4 : 1.55) : bw; boxes[key].h = bh; });
      var o1 = 1.0, i1 = 0.62;
      function corner(a, b, f) { return [boxes.P.x + (a === 'L' ? -rx : rx) * f, (b === 'T' ? boxes.P.y : boxes.R.y) + (b === 'T' ? ry : -ry) * (1 - f)]; }
      arrows = [
        { id: 'spend', from: [cx - rx, cy - bh / 2], to: [cx - bw * 0.62, cy - ry], ctl: [cx - rx, cy - ry], money: true, l: 'Spending', ln: 'Spending on goods and services' },
        { id: 'rev', from: [cx + bw * 0.62, cy - ry], to: [cx + rx, cy - bh / 2], ctl: [cx + rx, cy - ry], money: true, l: 'Revenue', ln: 'Revenue' },
        { id: 'pay', from: [cx + rx, cy + bh / 2], to: [cx + bw * 0.62, cy + ry], ctl: [cx + rx, cy + ry], money: true, l: nar ? 'Wages, rent, profit…' : 'Wages, rent, interest, profit', ln: 'Wages, rent, interest and profit' },
        { id: 'inc', from: [cx - bw * 0.62, cy + ry], to: [cx - rx, cy + bh / 2], ctl: [cx - rx, cy + ry], money: true, l: 'Income', ln: 'Income' },
        { id: 'gs1', from: [cx + rx - bw * 0.3, cy - bh / 2], to: [cx + bw * 0.4, cy - ry + bh / 2], ctl: [cx + rx * i1, cy - ry * i1], l: 'Goods and services', ln: 'Goods and services sold' },
        { id: 'gs2', from: [cx - bw * 0.4, cy - ry + bh / 2], to: [cx - rx + bw * 0.3, cy - bh / 2], ctl: [cx - rx * i1, cy - ry * i1], l: 'Goods and services', ln: 'Goods and services bought' },
        { id: 'res1', from: [cx - rx + bw * 0.3, cy + bh / 2], to: [cx - bw * 0.4, cy + ry - bh / 2], ctl: [cx - rx * i1, cy + ry * i1], l: nar ? 'Resources' : 'Land, labor, capital', ln: 'Land, labor, capital and entrepreneurship' },
        { id: 'res2', from: [cx + bw * 0.4, cy + ry - bh / 2], to: [cx + rx - bw * 0.3, cy + bh / 2], ctl: [cx + rx * i1, cy + ry * i1], l: 'Resources', ln: 'Resources hired by firms' }
      ];
      var G = boxes.G, B = boxes.B, X = boxes.X;
      if (G) arrows.push({ id: 'tax', from: [boxes.H.x + bw / 2, cy - 8], to: [G.x - G.w / 2, G.y - 6], ctl: [(boxes.H.x + G.x) / 2, G.y - 18], money: true, l: 'Taxes', ln: 'Taxes', side: 1, lt: 0.4 },
        { id: 'tr', from: [G.x - G.w / 2, G.y + 8], to: [boxes.H.x + bw / 2, cy + 8], ctl: [(boxes.H.x + G.x) / 2, G.y + 22], money: true, l: 'Transfers', ln: 'Transfer payments', side: 1, lt: 0.6 },
        { id: 'gp', from: [G.x + G.w * 0.2, G.y - bh / 2], to: [cx + bw * 0.2, cy - ry + bh / 2], ctl: [G.x + 28, (G.y + cy - ry) / 2], money: true, l: 'Purchases', ln: 'Government purchases', side: 1 });
      if (B) arrows.push({ id: 'save', from: [boxes.H.x + bw / 2, cy + bh / 2 - 4], to: [B.x - B.w / 2, B.y + 4], ctl: [(boxes.H.x + B.x) / 2, B.y + 26], money: true, l: 'Saving', ln: 'Saving', side: 1, lt: 0.32 },
        { id: 'inv', from: [B.x + B.w / 2, B.y + 4], to: [boxes.F.x - bw / 2, cy + bh / 2 - 4], ctl: [(boxes.F.x + B.x) / 2, B.y + 26], money: true, l: 'Investment', ln: 'Investment (borrowed by firms)', side: 1, lt: 0.68 });
      if (X) arrows.push({ id: 'ex', from: [X.x - X.w / 2, X.y + 6], to: [boxes.P.x + boxes.P.w / 2, boxes.P.y + 6], ctl: [(X.x + boxes.P.x) / 2 + 10, X.y + 18], money: true, l: 'Exports', ln: 'Foreign spending on exports', side: 1 },
        { id: 'im', from: [boxes.P.x + boxes.P.w / 2, boxes.P.y - 8], to: [X.x - X.w / 2, X.y - 8], ctl: [(X.x + boxes.P.x) / 2 + 10, X.y - 22], money: true, l: 'Imports', ln: 'Spending on imports', side: 1 });
      arrows.forEach(function (a, i) { a.n = i + 1; });
      if (lab) renderSel();
    }
    function bez(a, t) { var u = 1 - t; return [u * u * a.from[0] + 2 * u * t * a.ctl[0] + t * t * a.to[0], u * u * a.from[1] + 2 * u * t * a.ctl[1] + t * t * a.to[1]]; }
    function renderSel() {
      if (!labelBox) return; var opts = arrows.map(function (a) { return a.ln; }).sort();
      labelBox.innerHTML = arrows.map(function (a) { var p = picks[a.id] || '', ok = checked && p ? p === a.ln : null; return '<label class="ecv-cfsel' + (ok === true ? ' ok' : ok === false ? ' no' : '') + '"><span class="ecv-badge">' + a.n + '</span><select data-id="' + a.id + '" aria-label="Arrow ' + a.n + '"><option value="">Choose…</option>' + opts.map(function (s) { return '<option' + (s === p ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('') + '</select>' + (ok === false ? '<span class="ecv-bad"> ✗</span>' : ok ? '<span class="ecv-ok"> ✓</span>' : '') + '</label>'; }).join('');
      labelBox.querySelectorAll('select').forEach(function (s) { s.addEventListener('change', function () { picks[s.dataset.id] = s.value; checked = false; renderSel(); draw(); var ns = labelBox.querySelector('[data-id="' + s.dataset.id + '"]'); if (ns) ns.focus(); }); });
      if (checked) { var right = arrows.filter(function (a) { return picks[a.id] === a.ln; }).length; F.out.el.hidden = false; F.out.set('<b>' + right + ' of ' + arrows.length + '</b> arrows labeled correctly.' + (right < arrows.length ? ' Hint: green arrows carry money; blue arrows carry real things. Households sell resources and buy products; firms do the reverse.' : '')); }
    }
    function draw() {
      k = K(); clearC(c); var ctx = c.ctx, nar = c.w < 560;
      arrows.forEach(function (a) {
        var col = a.money ? k.green : k.blue; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = a.money ? 3 : 2.4; ctx.setLineDash(a.money ? [] : [7, 4]); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.from[0], a.from[1]); var e = bez(a, 0.96); ctx.quadraticCurveTo(a.ctl[0], a.ctl[1], e[0], e[1]); ctx.stroke(); ctx.restore();
        var p1 = bez(a, 0.9), ang = M.atan2(a.to[1] - p1[1], a.to[0] - p1[0]); arrowPx(ctx, p1[0], p1[1], a.to[0], a.to[1], col, 2.5, 10);
        var m = bez(a, a.lt || 0.5);
        if (lab) { var pk = picks[a.id], okk = checked && pk ? pk === a.ln : null; ctx.save(); ctx.fillStyle = okk === false ? k.red : okk ? k.green : k.acc; ctx.beginPath(); ctx.arc(m[0], m[1], 11, 0, TAU); ctx.fill(); ctx.fillStyle = k.plot; ctx.font = font(12, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(a.n), m[0], m[1] + 0.5); ctx.restore(); }
        else pill(ctx, a.l, m[0], m[1], { size: nar ? 10.5 : 11.5, color: col, box: { x: 0, y: 0, w: c.w, h: c.h } });
      });
      Object.keys(boxes).forEach(function (key) { var b = boxes[key]; ctx.save(); ctx.fillStyle = k.dark ? '#1f3328' : '#f6f2e6'; ctx.strokeStyle = b.c; ctx.lineWidth = 2.2; rr(ctx, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 10); ctx.fill(); ctx.stroke(); ctx.restore(); txt(ctx, b.t, b.x, b.y, { align: 'center', size: nar ? 11.5 : 13, wt: 700, color: k.ink }); });
      if (dot) { dotPx(ctx, dot[0], dot[1], k.gold, 9); txt(ctx, '$', dot[0], dot[1] + 0.5, { align: 'center', size: 12, wt: 800, color: k.dark ? '#1b2b22' : '#ffffff' }); }
      txt(ctx, '— money', 8, c.h - 26, { size: 11.5, color: k.green }); txt(ctx, '- - real goods and resources', 8, c.h - 10, { size: 11.5, color: k.blue });
      if (!lab && !run) F.set(sec.government || sec.financial || sec.foreign ? 'Money leaks out of the loop as taxes, saving and spending on imports, and comes back in as government purchases, investment and exports. When leakages equal injections, spending holds steady.' : 'Households sell resources (their labor, land and capital) in the resource market and buy goods and services in the product market; firms do the reverse. Every dollar spent is a dollar of someone’s income, so money goes around the loop instead of disappearing.');
      F.say('A circular flow diagram: households, firms, the product market and the resource market' + (sec.government ? ', with government' : '') + (sec.financial ? ', financial markets' : '') + (sec.foreign ? ', the rest of the world' : '') + '.');
    }
    var STOPS = ['spend', 'rev', 'pay', 'inc'], SAY = ['A household spends a dollar at a store: spending in the product market.', 'The dollar becomes the store’s revenue.', 'The firm pays it out as wages, rent, interest or profit in the resource market.', 'Now it is a household’s income, ready to be spent again. Spending is someone’s income: the dollar never vanished.'];
    function follow() {
      var path = STOPS.map(function (id) { return arrows.filter(function (a) { return a.id === id; })[0]; });
      if (V.reduced) { var a = path[lap % 4]; dot = bez(a, 0.5); F.out.el.hidden = false; F.out.set(SAY[lap % 4]); lap++; draw(); return; }
      if (run) { run.stop = true; run = null; dot = null; pb.textContent = '▶ Follow a dollar'; draw(); return; }
      pb.textContent = '■ Stop'; var tok = run = { stop: false }, t0 = null;
      function fr(t) { if (tok.stop) return; if (t0 == null) t0 = t; var u = (t - t0) / 1800, i = M.floor(u); if (i >= 4) { run = null; dot = null; pb.textContent = '▶ Follow a dollar'; draw(); return; } dot = bez(path[i], u - i); draw(); F.out.el.hidden = false; F.out.set(SAY[i]); W.requestAnimationFrame(fr); }
      W.requestAnimationFrame(fr);
    }
    c.onResize(function () { build(); draw(); }); V.onTheme(function () { build(); draw(); }); build(); draw();
    if (lab) F.out.el.hidden = true;
    return { draw: draw };
  });

  /* ec-valueadded: a production chain; value added at each stage adds up to the final price */
  V.register('ec-valueadded', function (el, o) {
    o = opt(o, { stages: [{ name: 'Farmer', what: 'wheat', sale: 30 }, { name: 'Miller', what: 'flour', sale: 50 }, { name: 'Baker', what: 'bread', sale: 80 }, { name: 'Grocer', what: 'bread, to you', sale: 100 }], countAll: false });
    var F = frame(el, o, 'Value added in a production chain'), k = K(), q = F.quiet, st = o.stages.map(function (s) { return { name: s.name, what: s.what || '', sale: num(s.sale, 0) }; }), all = !!o.countAll;
    st.forEach(function (s, i) { s.va = s.sale - (i ? st[i - 1].sale : 0); });
    var fin = st[st.length - 1].sale, sum = st.reduce(function (a, s) { return a + s.sale; }, 0);
    var c = F.canvas(function (w) { return w >= 560 ? w / 1.9 : w * 1.15; }), T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    if (F.inter) toggle(F.ctl, 'Count every sale instead', all, function (v) { all = v; draw(); });
    var KN = knobs(F, c, [], function () { }), cols = function () { return [k.green, k.gold, k.orange, k.purple, k.teal, k.pink, k.blue]; };
    function draw() {
      k = K(); clearC(c); var ctx = c.ctx, nar = c.w < 560, top = 10, chainH = nar ? 30 + st.length * 30 : 70, n = st.length;
      if (nar) { st.forEach(function (s, i) { var y = top + 14 + i * 30; pill(ctx, s.name + ' sells ' + s.what + ' for ' + money(s.sale), 10, y, { align: 'left', size: 12, color: cols()[i % 7], border: cols()[i % 7] }); }); }
      else { var bw = (c.w - 20) / n; st.forEach(function (s, i) { var x = 10 + bw * (i + 0.5); pill(ctx, s.name, x, top + 14, { size: 13, color: cols()[i % 7], border: cols()[i % 7] }); txt(ctx, s.what + ': ' + money(s.sale), x, top + 40, { align: 'center', size: 12, color: k.ink }); if (i) arrowPx(ctx, x - bw + 52, top + 14, x - 52, top + 14, k.muted, 1.8, 8); }); }
      var A = axes(c, { xmin: 0, xmax: 2, ymax: niceCeil(sum * 1.05), xAt: [[0.55, 'Value added'], [1.45, 'Every sale counted']], yLabel: 'Dollars', money: true, grid: true, xTicks: false }).set({ x: 0, y: chainH + 6, w: c.w, h: c.h - chainH - 6 }); A.o.xAt = [[0.55, 'Value added'], [1.45, 'All sales added']]; A.draw();
      var y0 = 0; st.forEach(function (s, i) { A.poly([[0.3, y0], [0.8, y0], [0.8, y0 + s.va], [0.3, y0 + s.va]], rgba(cols()[i % 7], 0.6), cols()[i % 7]); if (!q && s.va > A.ymax * 0.05) A.label(s.name + ' ' + money(s.va), 0.55, y0 + s.va / 2, k.ink, { size: 11 }); y0 += s.va; });
      A.hline(fin, k.ink, { w: 1.4, dash: [5, 4] }); A.nameAt('Final price ' + money(fin), 0.82, fin, k.ink, 6, -12);
      if (all) { y0 = 0; st.forEach(function (s, i) { A.poly([[1.2, y0], [1.7, y0], [1.7, y0 + s.sale], [1.2, y0 + s.sale]], rgba(cols()[i % 7], 0.35), cols()[i % 7]); if (s.sale > A.ymax * 0.05) A.label(s.name + ' ' + money(s.sale), 1.45, y0 + s.sale / 2, k.ink, { size: 11 }); y0 += s.sale; }); A.label('Overcounts by ' + money(sum - fin), 1.45, sum, k.red, { dy: -12, size: 11.5 }); }
      T.set(q ? [] : [{ k: 'Sum of value added', v: money(fin), c: k.green, hi: true }, { k: 'Final sale price', v: money(fin), c: k.ink }].concat(all ? [{ k: 'Every sale added up', v: money(sum), c: k.red }] : []));
      F.set('Each stage’s value added is what it sells for minus what it paid the stage before. ' + (q ? '' : 'Here: ' + st.map(function (s) { return money(s.va); }).join(' + ') + ' = ' + money(fin) + ', the price of the final product. ') + (all ? 'Adding every sale counts the wheat again inside the flour, and again inside the bread: intermediate goods counted ' + (n - 1) + ' extra times.' : 'Value added is also the income earned at each stage (wages, rent, interest and profit), which is why GDP can be measured either way.'));
      F.say('A production chain from ' + st[0].name + ' to ' + st[n - 1].name + ' and a bar of value added by stage.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-basket: a fixed market basket (CPI and inflation), nominal vs real GDP with the deflator, and real values */
  V.register('ec-basket', function (el, o) {
    o = opt(o, { mode: 'cpi' });
    var mode = o.mode, F = frame(el, o, mode === 'gdp' ? 'Nominal and real GDP' : mode === 'real' ? 'Real values' : 'A price index from a market basket'), k = K(), q = F.quiet;
    var c = F.canvas(function (w) { return mode === 'cpi' ? (w >= 560 ? w / 2.1 : w / 1.1) : (w >= 560 ? w / 2.6 : w / 1.4); }), tb = tableBox(el, F, 'Basket table'), tb2 = mode !== 'real' ? tableBox(el, F, 'Index table') : null;
    var T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var KN = knobs(F, c, [], function () { }), draw;
    function yrs(obj) { return Object.keys(obj || {}).map(Number).sort(function (a, b) { return a - b; }); }
    function f2(v) { return q ? '?' : v; }
    if (mode === 'gdp') {
      var goods = o.goods || [{ name: 'Pizzas', prices: { 2023: 10, 2024: 11, 2025: 12 }, qtys: { 2023: 100, 2024: 105, 2025: 108 } }, { name: 'Books', prices: { 2023: 20, 2024: 20, 2025: 21 }, qtys: { 2023: 50, 2024: 52, 2025: 55 } }];
      var years = o.years || yrs(goods[0].prices), base = num(o.base, years[0]);
      if (F.inter) V.seg(F.ctl, { label: 'Base year', items: years.map(function (y) { return [y, 'Base ' + y]; }), value: base, change: function (v) { base = +v; draw(); } });
      draw = function () {
        k = K(); clearC(c);
        var rows = years.map(function (y) { var nom = 0, real = 0; goods.forEach(function (g) { nom += num(g.prices[y], 0) * num(g.qtys[y], 0); real += num(g.prices[base], 0) * num(g.qtys[y], 0); }); return { y: y, nom: nom, real: real, def: nom / real * 100 }; });
        tb.innerHTML = tableHTML(['Year'].concat(goods.map(function (g) { return g.name + ': price × qty'; })), years.map(function (y) { return [String(y)].concat(goods.map(function (g) { return money(num(g.prices[y], 0)) + ' × ' + fm(num(g.qtys[y], 0)); })); }));
        tb2.innerHTML = tableHTML(['Year', 'Nominal GDP', 'Real GDP (' + base + ' prices)', 'Deflator', 'Nominal growth', 'Real growth'], rows.map(function (r, i) { return [String(r.y), f2(money(r.nom)), f2(money(r.real)), f2(fm(r.def, 1)), i ? f2(pct(r.nom / rows[i - 1].nom - 1)) : '', i ? f2(pct(r.real / rows[i - 1].real - 1)) : '']; }));
        var A = axes(c, { xmin: 0.4, xmax: years.length + 0.6, ymax: niceCeil(M.max.apply(null, rows.map(function (r) { return M.max(r.nom, r.real); })) * 1.12), xAt: years.map(function (y, i) { return [i + 1, String(y)]; }), yLabel: 'Dollars', money: true }).set({ x: 0, y: 0, w: c.w, h: c.h });
        A.draw();
        rows.forEach(function (r, i) { var x = i + 1; A.poly([[x - 0.34, 0], [x - 0.02, 0], [x - 0.02, r.nom], [x - 0.34, r.nom]], rgba(k.gold, 0.55), k.gold); A.poly([[x + 0.02, 0], [x + 0.34, 0], [x + 0.34, r.real], [x + 0.02, r.real]], rgba(k.green, 0.55), k.green); });
        A.nameAt('Nominal', 1 - 0.18, rows[0].nom, k.gold, 0, -12); A.nameAt('Real', 1 + 0.18, rows[0].real, k.green, 18, -26);
        var last = rows[rows.length - 1], first = rows[0];
        T.set(q ? [] : [{ k: 'Nominal growth, ' + first.y + '–' + last.y, v: pct(last.nom / first.nom - 1), c: k.gold }, { k: 'Real growth', v: pct(last.real / first.real - 1), c: k.green, hi: true }, { k: 'Deflator ' + last.y, v: fm(last.def, 1), c: k.ink }]);
        F.set('Nominal GDP uses each year’s own prices, so it rises when prices rise even if nothing more is made. Real GDP values every year’s output at ' + base + ' prices, so only the quantities can move it. The GDP deflator = nominal ÷ real × 100 (it is 100 in the base year).');
        F.say('Bars of nominal and real GDP for ' + years.join(', ') + '.'); KN.place();
      };
    } else if (mode === 'real') {
      var idx = o.index || { 2000: 80, 2010: 100, 2020: 120, 2025: 140 }, iy = yrs(idx), am = o.amounts || [{ label: 'Hourly wage, 2000', year: 2000, value: 12 }, { label: 'Hourly wage, 2010', year: 2010, value: 15.5 }, { label: 'Hourly wage, 2025', year: 2025, value: 22.4 }], b2 = num(o.base, iy[1] || iy[0]);
      if (F.inter) V.seg(F.ctl, { label: 'Express in dollars of', items: iy.map(function (y) { return [y, y + ' dollars']; }), value: b2, change: function (v) { b2 = +v; draw(); } });
      draw = function () {
        k = K(); clearC(c);
        var rv = am.map(function (a) { return { a: a, real: num(a.value, 0) * idx[b2] / idx[a.year] }; });
        tb.innerHTML = tableHTML(['Amount', 'Dollars of that year', 'Price index that year', 'In ' + b2 + ' dollars'], rv.map(function (r) { return [esc(r.a.label), money(r.a.value), fm(idx[r.a.year]), f2(money(r.real))]; }));
        var A = axes(c, { xmin: 0.4, xmax: am.length + 0.6, ymax: niceCeil(M.max.apply(null, rv.map(function (r) { return M.max(r.real, r.a.value); })) * 1.15), xAt: am.map(function (a, i) { return [i + 1, String(a.year)]; }), yLabel: 'Dollars', money: true }).set({ x: 0, y: 0, w: c.w, h: c.h });
        A.draw();
        rv.forEach(function (r, i) { var x = i + 1; A.poly([[x - 0.34, 0], [x - 0.02, 0], [x - 0.02, r.a.value], [x - 0.34, r.a.value]], rgba(k.gold, 0.5), k.gold); if (!q) A.poly([[x + 0.02, 0], [x + 0.34, 0], [x + 0.34, r.real], [x + 0.02, r.real]], rgba(k.green, 0.55), k.green); });
        A.nameAt('As paid', 1 - 0.18, am[0].value, k.gold, 0, -12); if (!q) A.nameAt('In ' + b2 + ' dollars', 1 + 0.18, rv[0].real, k.green, 30, -26);
        T.set(q ? [] : rv.map(function (r) { return { k: r.a.label, v: money(r.real) + ' in ' + b2 + ' $', c: k.green }; }));
        F.set('To compare dollars from different years, divide by the price index (over 100) and multiply by the index of the year you want: amount × index<sub>' + b2 + '</sub> ÷ index<sub>that year</sub>. A price index of ' + fm(idx[iy[iy.length - 1]]) + ' does not mean ' + money(idx[iy[iy.length - 1]]) + ': it means prices are ' + fm(idx[iy[iy.length - 1]] - 100, 1) + '% above the base period (index = 100).');
        F.say('Bars comparing amounts as paid with the same amounts in ' + b2 + ' dollars.'); KN.place();
      };
    } else { // cpi
      var gd = o.goods || [{ name: 'Bread (loaves)', qty: 10, prices: { 2022: 2.5, 2023: 2.8, 2024: 2.9, 2025: 2.9 } }, { name: 'Gasoline (gallons)', qty: 15, prices: { 2022: 3, 2023: 3.4, 2024: 3.4, 2025: 3.2 } }, { name: 'Haircut', qty: 1, prices: { 2022: 30, 2023: 31, 2024: 34, 2025: 35 } }];
      var ys = o.years || yrs(gd[0].prices), bs = num(o.base, ys[0]);
      if (F.inter) V.seg(F.ctl, { label: 'Base year', items: ys.map(function (y) { return [y, 'Base ' + y]; }), value: bs, change: function (v) { bs = +v; draw(); } });
      draw = function () {
        k = K(); clearC(c);
        var cost = ys.map(function (y) { return gd.reduce(function (s, g) { return s + num(g.qty, 0) * num(g.prices[y], 0); }, 0); }), cb = cost[ys.indexOf(bs)], ix = cost.map(function (v) { return v / cb * 100; }), inf = ix.map(function (v, i) { return i ? (v / ix[i - 1] - 1) * 100 : null; });
        tb.innerHTML = tableHTML(['Item', 'Quantity in the basket'].concat(ys.map(String)), gd.map(function (g) { return [esc(g.name), fm(g.qty)].concat(ys.map(function (y) { return money(num(g.prices[y], 0), 2); })); }));
        tb2.innerHTML = tableHTML(['Year', 'Basket cost', 'Index (' + bs + ' = 100)', 'Inflation rate'], ys.map(function (y, i) { return [String(y), money(cost[i], 2), f2(fm(ix[i], 1)), i ? f2(fm(inf[i], 1) + '%') : '']; }));
        var g = 14, wide = c.w >= 560, r1 = wide ? { x: 0, y: 0, w: (c.w - g) / 2, h: c.h } : { x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }, r2 = wide ? { x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h } : { x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 };
        var xa = ys.map(function (y, i) { return [i + 1, String(y)]; });
        var A1 = axes(c, { xmin: 0.5, xmax: ys.length + 0.5, ymin: niceCeil(M.min.apply(null, ix)) * 0 + M.floor(M.min.apply(null, ix) / 10) * 10 - 10, ymax: M.ceil(M.max.apply(null, ix) / 10) * 10 + 5, xAt: xa, yLabel: 'Price index', title: 'Price level' }).set(r1); A1.draw();
        var mi = M.min(0, M.min.apply(null, inf.filter(function (v) { return v != null; }))), ma = M.max.apply(null, inf.filter(function (v) { return v != null; }));
        var A2 = axes(c, { xmin: 0.5, xmax: ys.length + 0.5, ymin: mi < 0 ? -niceCeil(-mi * 1.3) : 0, ymax: niceCeil(ma * 1.2), xAt: xa, yLabel: 'Inflation (%)', title: 'Inflation rate' }).set(r2); A2.draw();
        if (!q) {
          A1.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 3; ctx.beginPath(); ix.forEach(function (v, i) { ctx[i ? 'lineTo' : 'moveTo'](A1.X(i + 1), A1.Y(v)); }); ctx.stroke(); ctx.restore(); }); ix.forEach(function (v, i) { A1.dot(i + 1, v, k.purple, 5); A1.label(fm(v, 1), i + 1, v, k.purple, { dy: -14, size: 11 }); });
          inf.forEach(function (v, i) { if (v == null) return; A2.poly([[i + 1 - 0.3, 0], [i + 1 + 0.3, 0], [i + 1 + 0.3, v], [i + 1 - 0.3, v]], v >= 0 ? rgba(k.red, 0.5) : rgba(k.blue, 0.5), v >= 0 ? k.red : k.blue); A2.label(fm(v, 1) + '%', i + 1, v, v >= 0 ? k.red : k.blue, { dy: v >= 0 ? -12 : 12, size: 11 }); });
          A2.hline(0, k.axis, { w: 1.2 });
        }
        var words = [];
        inf.forEach(function (v, i) { if (v == null || i < 2) return; if (v > 0 && v < inf[i - 1]) words.push(ys[i] + ': <b>disinflation</b>: inflation fell from ' + fm(inf[i - 1], 1) + '% to ' + fm(v, 1) + '%, but prices still rose.'); if (v < 0) words.push(ys[i] + ': <b>deflation</b>: the price level itself fell.'); });
        T.set(q ? [] : [{ k: 'Basket cost, ' + bs, v: money(cb, 2), c: k.ink }, { k: 'Index ' + ys[ys.length - 1], v: fm(ix[ix.length - 1], 1), c: k.purple }]);
        F.set('The index divides each year’s basket cost by the base year’s and multiplies by 100. The inflation rate is the percent change in the index. ' + (q ? '' : words.join(' ')));
        F.say('A price index line and inflation-rate bars for ' + ys.join(', ') + '.'); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-laborforce: who counts as unemployed; scenario buttons move people between groups */
  V.register('ec-laborforce', function (el, o) {
    o = opt(o, { counts: { employed: 120, unemployed: 8, students: 20, retired: 40, caregivers: 10, discouraged: 2 }, perIcon: 2, scenarios: true, show: ['rate', 'participation', 'epop'] });
    var F = frame(el, o, 'The labor force'), q = F.quiet, k = K(), c0 = o.counts, cnt = {}, per = M.max(1, num(o.perIcon, 2));
    ['employed', 'unemployed', 'students', 'retired', 'caregivers', 'discouraged'].forEach(function (key) { cnt[key] = num(c0[key], 0); });
    var start = JSON.parse(JSON.stringify(cnt)), last = '';
    var tree = mk('div', 'ecv-lf'); F.box.appendChild(tree);
    var T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var SC = [
      ['An unemployed person stops looking for work', 'unemployed', 'discouraged', 'They have no job but are not looking, so they leave the labor force. The unemployment rate falls, yet no one found a job.'],
      ['A student starts looking for work', 'students', 'unemployed', 'Looking for work counts them as unemployed: the labor force grows and so does the unemployment rate.'],
      ['An unemployed person finds a job', 'unemployed', 'employed', 'One fewer unemployed, one more employed.'],
      ['A worker retires', 'employed', 'retired', 'Retirees are not in the labor force.'],
      ['A caregiver takes a job', 'caregivers', 'employed', 'Joining the labor force as employed.'],
      ['A part-time worker wants full-time work', null, null, 'Still counted as employed: anyone who worked for pay at all counts. Being underemployed does not change the unemployment rate.']];
    if (o.scenarios && F.inter) { var g = group(F.ctl, 'What happens'); SC.forEach(function (s) { btn(g, s[0], function () { if (s[1] && cnt[s[1]] >= per) { cnt[s[1]] -= per; cnt[s[2]] += per; } last = s[3]; render(); }, 'ecv-ev'); }); btn(F.ctl, 'Start over', function () { cnt = JSON.parse(JSON.stringify(start)); last = ''; render(); }); }
    var ICON = '<svg viewBox="0 0 10 14" aria-hidden="true"><circle cx="5" cy="3" r="2.6"/><path d="M1 13.5V9.2C1 7 2.6 6 5 6s4 1 4 3.2v4.3z"/></svg>';
    function grp(key, title, cls) { var n = cnt[key], ic = ''; for (var i = 0; i < M.round(n / per); i++) ic += ICON; return '<div class="ecv-lfg ' + cls + '"><div class="ecv-lfh"><b>' + title + '</b><span>' + big(n) + '</span></div><div class="ecv-icons" aria-hidden="true">' + ic + '</div></div>'; }
    function render() {
      var E = cnt.employed, U = cnt.unemployed, LF = E + U, NI = cnt.students + cnt.retired + cnt.caregivers + cnt.discouraged, POP = LF + NI;
      tree.innerHTML = '<div class="ecv-lftop"><b>Adults (16 and over, not in an institution)</b> ' + big(POP) + '</div><div class="ecv-lfcols"><div class="ecv-lfcol in"><div class="ecv-lfsub"><b>In the labor force</b> ' + big(LF) + '</div>' + grp('employed', 'Employed', 'e') + grp('unemployed', 'Unemployed (no job, looking)', 'u') + '</div><div class="ecv-lfcol out"><div class="ecv-lfsub"><b>Not in the labor force</b> ' + big(NI) + '</div>' + grp('students', 'Students', 'n') + grp('retired', 'Retired', 'n') + grp('caregivers', 'Caring for family', 'n') + grp('discouraged', 'Discouraged (want work, stopped looking)', 'n') + '</div></div><p class="ecv-note">Each figure = ' + per + ' ' + (per === 1 ? 'person' : 'people') + '.</p>';
      var tl = [];
      if (has(o.show, 'rate')) tl.push({ k: 'Unemployment rate = U ÷ labor force', v: q ? '?' : fm(U / LF * 100, 2) + '%', c: k.red, hi: true });
      if (has(o.show, 'participation')) tl.push({ k: 'Participation = labor force ÷ adults', v: q ? '?' : fm(LF / POP * 100, 2) + '%', c: k.blue });
      if (has(o.show, 'epop')) tl.push({ k: 'Employed ÷ adults', v: q ? '?' : fm(E / POP * 100, 2) + '%', c: k.green });
      T.set(tl); F.set((last ? last + ' ' : '') + 'The unemployment rate divides by the <b>labor force</b> (employed + unemployed), not by all adults. People without jobs who are not looking for work are not unemployed: they are outside the labor force.');
      tree.setAttribute('aria-label', 'Adults: ' + POP + '. Employed ' + E + ', unemployed ' + U + ', not in the labor force ' + NI + '.'); tree.setAttribute('role', 'img');
    }
    render();
    return { render: render };
  });

  /* ec-cycle: real GDP around potential output; phases and the output gap */
  V.register('ec-cycle', function (el, o) {
    o = opt(o, { preset: 'stylized', show: ['phases', 'gap', 'trend'] });
    var F = frame(el, o, 'The business cycle'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var ser = o.series, pot = o.potential, N, Yf, Pf;
    if (ser) { N = ser.length; Yf = function (t) { var i = clamp(M.floor(t), 0, N - 2), u = t - i; return lerp(ser[i], ser[i + 1], u); }; Pf = pot ? function (t) { var i = clamp(M.floor(t), 0, N - 2), u = t - i; return lerp(pot[i], pot[i + 1], u); } : null; }
    else { N = 13; Pf = function (t) { return 100 * M.pow(1.025, t); }; Yf = function (t) { return Pf(t) * (1 + 0.035 * M.sin(2 * M.PI * (t - 0.6) / 6.2)); }; }
    var tm = num(o.t, ser ? (N - 1) * 0.5 : 4.2), tmax = N - 1;
    var ext = []; for (var i = 1; i < 600; i++) { var t = tmax * i / 600, d0 = Yf(t) - Yf(t - tmax / 600), d1 = Yf(t + tmax / 600) - Yf(t); if (d0 > 0 && d1 <= 0) ext.push({ t: t, kind: 'Peak' }); if (d0 < 0 && d1 >= 0) ext.push({ t: t, kind: 'Trough' }); }
    var vals = []; for (i = 0; i <= 200; i++) { vals.push(Yf(tmax * i / 200)); if (Pf) vals.push(Pf(tmax * i / 200)); }
    var ymin = M.floor(M.min.apply(null, vals) / 5) * 5 - 2, ymax = M.ceil(M.max.apply(null, vals) / 5) * 5 + 3;
    var c = F.canvas(function (w) { return hw(w, 1.9, 1.15); }), A = axes(c, { xmin: 0, xmax: tmax, ymin: ymin, ymax: ymax, xLabel: o.xLabel || 'Years', yLabel: o.yLabel || 'Real GDP' });
    var KN = knobs(F, c, F.inter ? [{ name: 'Time marker', pos: function () { return [A.X(tm), A.Y(Yf(tm))]; }, hitd: function (px, py) { return py < A.T || py > A.B + 10 ? 99 : M.abs(px - A.X(tm)); }, drag: function (px) { tm = clamp(A.q(px), 0, tmax); }, key: function (dx, dy, bg) { tm = clamp(tm + (dx || dy) * (bg ? 1 : 0.1), 0, tmax); }, text: function () { return 'year ' + fm(tm, 1); } }] : [], function () { draw(); });
    function phase(t) {
      var h = tmax / 400, g = (Yf(M.min(tmax, t + h)) - Yf(M.max(0, t - h))) / (M.min(tmax, t + h) - M.max(0, t - h)) / Yf(t);
      var near = ext.filter(function (e) { return M.abs(e.t - t) < tmax * 0.02; })[0];
      return { name: near ? near.kind : g > 0 ? 'Expansion' : 'Contraction', g: g };
    }
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h });
      if (has(o.show, 'phases') && !q) { var pts = [0].concat(ext.map(function (e) { return e.t; })).concat([tmax]); for (var j = 0; j < pts.length - 1; j++) { var mid = (pts[j] + pts[j + 1]) / 2, ph = phase(mid).name; if (ph === 'Contraction') A.clip(function () { polyPx(c.ctx, [[A.X(pts[j]), A.T], [A.X(pts[j + 1]), A.T], [A.X(pts[j + 1]), A.B], [A.X(pts[j]), A.B]], rgba(k.muted, 0.12)); }); } }
      (o.recessions || []).forEach(function (r) { A.clip(function () { polyPx(c.ctx, [[A.X(r[0]), A.T], [A.X(r[1]), A.T], [A.X(r[1]), A.B], [A.X(r[0]), A.B]], rgba(k.muted, 0.16)); }); });
      A.draw();
      if (Pf && has(o.show, 'gap') && !q) { A.area(function (t) { return M.max(Yf(t), Pf(t)); }, Pf, 0, tmax, k.goldSoft); A.area(Pf, function (t) { return M.min(Yf(t), Pf(t)); }, 0, tmax, k.redSoft); }
      if (Pf && has(o.show, 'trend')) { A.fn(Pf, k.green, { from: 0, to: tmax, w: 2.2, dash: [8, 5] }); A.nameAt('Potential output', tmax * 0.93, Pf(tmax * 0.93), k.green, -30, 16); }
      A.fn(Yf, k.blue, { from: 0, to: tmax, w: 3 }); A.nameAt('Real GDP', tmax * 0.05, Yf(tmax * 0.05), k.blue, 30, -14);
      if (has(o.show, 'phases') && !q) ext.forEach(function (e) { A.dot(e.t, Yf(e.t), k.ink, 4.5); A.label(e.kind, e.t, Yf(e.t), k.ink, { dy: e.kind === 'Peak' ? -14 : 14, size: 11 }); });
      var p = phase(tm), gap = Pf ? (Yf(tm) / Pf(tm) - 1) * 100 : null;
      A.vline(tm, k.gold, { w: 2 }); A.knob(tm, Yf(tm), k.gold, 7);
      marksOn(c, A, o.marks);
      T.set(q ? [] : [{ k: 'Phase here', v: p.name, c: k.blue, hi: true }, { k: 'Real GDP growth (yearly rate)', v: fm(p.g * 100, 1) + '%', c: k.blue }].concat(gap != null ? [{ k: 'Output gap', v: (gap >= 0 ? '+' : '') + fm(gap, 1) + '%', c: gap >= 0 ? k.gold : k.red }] : []));
      F.set(q ? '' : (p.name === 'Expansion' && p.g < 0.015 ? 'Real GDP is still rising, just slowly: slower growth is <b>not</b> a recession. A contraction means real output falls. ' : '') + 'Expansion runs from a trough up to a peak; contraction (a recession, when it is big enough) from a peak down to a trough.' + (Pf ? ' Gold: output above potential (an inflationary gap); red: below potential (a recessionary gap). Output can sit above potential for a while.' : ''));
      F.say('Real GDP over time around a rising potential output line, with peaks and troughs.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  var AD_EVENTS = [
    { label: 'Consumer confidence rises', curve: 'AD', dir: 1, why: 'Households spend more at every price level' },
    { label: 'Stock prices fall (wealth falls)', curve: 'AD', dir: -1, why: 'Feeling poorer, households spend less at every price level' },
    { label: 'Incomes abroad rise', curve: 'AD', dir: 1, why: 'Foreigners buy more of our exports' },
    { label: 'Government purchases rise', curve: 'AD', dir: 1, why: 'G is part of spending' },
    { label: 'Taxes rise', curve: 'AD', dir: -1, why: 'After-tax income falls, so consumption falls' },
    { label: 'Firms expect weaker sales', curve: 'AD', dir: -1, why: 'Investment spending falls' },
    { label: 'Oil prices rise', curve: 'SRAS', dir: -1, why: 'A key input costs more, so firms produce less at every price level' },
    { label: 'Oil prices fall', curve: 'SRAS', dir: 1, why: 'A key input costs less' },
    { label: 'Nominal wages rise', curve: 'SRAS', dir: -1, why: 'Labor costs more at every price level' }
  ];
  /* ec-adas: the AD–AS model (see the header for modes) */
  V.register('ec-adas', function (el, o) {
    o = opt(o, { mode: 'shock', yf: 10, show: ['gap', 'labels', 'lras'] });
    var mode = o.mode, F = frame(el, o, 'The AD–AS model'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var Yf = num(o.yf, 10), P0 = 100, sl = 6, AD0 = line(P0 + sl * Yf, -sl), SR0 = line(P0 - sl * Yf, sl);
    var s = { ad: num(o.ad && o.ad.shift, 0), sr: num(o.sras && o.sras.shift, 0), lr: 0 }, ev = null, txtX = '', slopeK = null, slopeT = 1;
    var c = F.canvas(function (w) { return hw(w, 1.55, 1.02); }), A = axes(c, { xmax: Yf * 2, ymin: 40, ymax: 160, xLabel: o.xLabel || 'Real GDP (Y)', yLabel: o.yLabel || 'Price level (P)' });
    var stp = null, steps = null;
    if (mode === 'shock' && F.inter) eventButtons(F, (o.events || AD_EVENTS).map(function (e) { return opt(e, { size: 3 }); }), [['AD', 'Demand shocks'], ['SRAS', 'Supply shocks']], function (e) { ev = e; var tg = { ad: e && e.curve === 'AD' ? e.dir * e.size : 0, sr: e && e.curve === 'SRAS' ? e.dir * e.size : 0 }, fr = { ad: s.ad, sr: s.sr }; tween(F, 600, function (t) { s.ad = lerp(fr.ad, tg.ad, t); s.sr = lerp(fr.sr, tg.sr, t); draw(); }); });
    if (mode === 'adjust') {
      var dir = o.start === 'inflation' ? 1 : -1, size = num(o.size, 3), n = 5;
      steps = function (i) { return { ad: i >= 1 ? dir * size : 0, sr: i >= 2 ? -dir * size * (i - 1) / (n - 2) : 0 }; };
      var stI = clamp(num(o.step, 1), 0, n);
      var setS = function (i) { var tg = steps(i), fr = { ad: s.ad, sr: s.sr }; tween(F, 650, function (t) { s.ad = lerp(fr.ad, tg.ad, t); s.sr = lerp(fr.sr, tg.sr, t); draw(); }); };
      var tg0 = steps(stI); s.ad = tg0.ad; s.sr = tg0.sr;
      if (F.inter) stp = stepper(F.ctl, n + 1, stI, function (i) { setS(i); }, function (i) { return q ? 'Step ' + (i + 1) + ' of ' + (n + 1) : ['Start: long-run equilibrium at full-employment output.', dir < 0 ? 'AD falls: output drops below potential, a recessionary gap.' : 'AD rises: output goes above potential, an inflationary gap.', dir < 0 ? 'With unemployment high, nominal wages begin to fall; SRAS shifts right.' : 'With labor scarce, nominal wages rise; SRAS shifts left.', 'Wages keep adjusting; SRAS keeps shifting.', 'Wages keep adjusting.', 'Back at potential output, at a ' + (dir < 0 ? 'lower' : 'higher') + ' price level. How fast this happens is debated: it may take years.'][i]; });
    }
    if (mode === 'policy') {
      var gapDir = o.start === 'inflation' ? 1 : -1; s.ad = gapDir * 3; var amt = num(o.amount, 3), pol = 0;
      if (F.inter) { var gp = group(F.ctl, 'Policy');
        [['Expansionary fiscal: more G or lower taxes', 1, 'fiscal'], ['Contractionary fiscal: less G or higher taxes', -1, 'fiscal'], ['Expansionary monetary: lower interest rates', 1, 'monetary'], ['Contractionary monetary: higher interest rates', -1, 'monetary']].forEach(function (p) { btn(gp, p[0], function () { var fr = s.ad, tg = gapDir * 3 + p[1] * amt; pol = p[1]; txtX = p[2] === 'fiscal' ? 'Fiscal policy changes government purchases or taxes, which shifts AD directly.' : 'Monetary policy moves interest rates, which changes investment and other interest-sensitive spending, which shifts AD.'; tween(F, 600, function (t) { s.ad = lerp(fr, tg, t); draw(); }); }, 'ecv-ev d'); });
        V.slider(F.ctl, { label: 'Size of the AD shift', min: 0.5, max: 6, step: 0.5, value: amt, input: function (v) { amt = v; } });
        btn(F.ctl, 'Start over', function () { s.ad = gapDir * 3; pol = 0; txtX = ''; draw(); }); }
    }
    if (mode === 'growth') { var gr = num(o.size, 3), adToo = false;
      if (F.inter) { btn(F.ctl, 'More capital, better technology or more workers', function () { var f1 = s.lr; tween(F, 600, function (t) { s.lr = lerp(f1, f1 ? 0 : gr, t); s.sr = s.lr; if (adToo) s.ad = s.lr; draw(); }); }, 'pri'); toggle(F.ctl, 'Spending grows too (AD shifts)', false, function (v) { adToo = v; s.ad = v ? s.lr : 0; draw(); }); }
      else { s.lr = gr; s.sr = gr; } }
    if (mode === 'slope') {
      var EFF = { wealth: ['Wealth effect', 'The price level falls, so the money and savings people hold buy more. Feeling richer, they spend more: real GDP demanded rises.'], interest: ['Interest-rate effect', 'The price level falls, so people need less money for their purchases and lend out the rest. Interest rates fall, and businesses and households borrow and spend more.'], exchange: ['Exchange-rate effect', 'The price level falls, so our goods get cheaper next to foreign goods. Exports rise and imports fall: net exports rise.'] };
      if (F.inter) { var gS = group(F.ctl, 'Why AD slopes down'), bS = []; Object.keys(EFF).forEach(function (key) { var b = btn(gS, EFF[key][0], function () { slopeK = key; bS.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); tween(F, 1100, function (t) { slopeT = t; draw(); }); }, 'ecv-ev d'); b.setAttribute('aria-pressed', 'false'); bS.push(b); }); }
    }
    var KN = knobs(F, c, [], function () { });
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h });
      if (mode === 'growth') { var LRg = Yf + s.lr, ADg = AD0.shift(s.ad); s.sr = LRg - (ADg.P(LRg) - SR0.p0) / SR0.m; } // SRAS meets AD on the new LRAS
      var AD = AD0.shift(s.ad), SR = SR0.shift(s.sr), LR = Yf + s.lr, e0 = equilibrium(AD0, SR0), e = equilibrium(AD, SR), tl = [], txt = '';
      var gapY = e.q - LR;
      if (has(o.show, 'gap') && M.abs(gapY) > 0.05 && !q) A.clip(function () { polyPx(c.ctx, [[A.X(M.min(e.q, LR)), A.T], [A.X(M.max(e.q, LR)), A.T], [A.X(M.max(e.q, LR)), A.B], [A.X(M.min(e.q, LR)), A.B]], gapY < 0 ? k.redSoft : k.goldSoft); });
      A.draw();
      if (has(o.show, 'lras')) { if (s.lr) { A.vline(Yf, k.green, { w: 2.2, dash: [7, 6], alpha: 0.7 }); } A.vline(LR, k.green, { w: 3 }); A.nameAt('LRAS', LR, 152, k.green, 0, 0); }
      if (s.ad) A.lin(AD0, k.blue, { dash: [7, 6], w: 2.1, alpha: 0.7 }); if (s.sr) A.lin(SR0, k.orange, { dash: [7, 6], w: 2.1, alpha: 0.7 });
      A.lin(AD, k.blue); A.lin(SR, k.orange); A.name(AD, s.ad ? 'AD' + sub(2) : 'AD', k.blue, 0.86); A.name(SR, s.sr ? 'SRAS' + sub(2) : 'SRAS', k.orange, 0.86);
      if (s.ad) A.name(AD0, 'AD' + sub(1), k.blue, 0.72); if (s.sr) A.name(SR0, 'SRAS' + sub(1), k.orange, 0.72);
      if (s.ad || s.sr) { A.guide(e0.q, e0.p, k.muted); A.dot(e0.q, e0.p, k.muted, 5); }
      A.guide(e.q, e.p); A.dot(e.q, e.p, k.ink, 6.5);
      if (has(o.show, 'gap') && M.abs(gapY) > 0.05 && !q) A.label(gapY < 0 ? 'Recessionary gap' : 'Inflationary gap', (e.q + LR) / 2, 54, gapY < 0 ? k.red : k.gold, { size: 11 });
      if (has(o.show, 'labels') && !q) { A.tagX(e.q, 'Y = ' + fm(e.q, 2), k.ink); A.tagY(e.p, fm(e.p, 1), k.ink); if (M.abs(LR - e.q) > 0.6) A.tagX(LR, 'Yf', k.green); }
      tl.push({ k: 'Real GDP', v: (s.ad || s.sr ? fm(e0.q, 2) + ' → ' : '') + fm(e.q, 2), c: k.ink }, { k: 'Price level', v: (s.ad || s.sr ? fm(e0.p, 1) + ' → ' : '') + fm(e.p, 1), c: k.ink }, { k: 'Output gap', v: M.abs(gapY) < 0.05 ? 'none' : (gapY < 0 ? 'recessionary ' : 'inflationary ') + fm(M.abs(gapY), 2), c: gapY < 0 ? k.red : k.gold });
      if (mode === 'shock') {
        if (!ev) txt = 'Pick a shock. Demand shocks move output and the price level in the <b>same</b> direction; supply shocks move them in <b>opposite</b> directions.';
        else { var up = e.p > e0.p + 1e-9, more = e.q > e0.q + 1e-9; txt = '<b>' + ev.label + '.</b> ' + ev.why + ': ' + (ev.curve === 'AD' ? 'AD' : 'SRAS') + ' shifts ' + (ev.dir > 0 ? 'right' : 'left') + '. Real GDP ' + (more ? 'rises' : 'falls') + ' and the price level ' + (up ? 'rises' : 'falls') + '.' + (!more && up ? ' Falling output with rising prices: <b>stagflation</b>.' : ''); }
      } else if (mode === 'slope') {
        var pA = 110, pB = 88, pp = lerp(pA, pB, slopeK ? slopeT : 0), qq = AD0.Q(pp);
        A.dot(AD0.Q(pA), pA, k.muted, 5); A.label('A', AD0.Q(pA), pA, k.muted, { dx: 12, dy: -12, size: 12 }); A.knob(qq, pp, k.blue, 7); if (slopeK) { A.label('B', AD0.Q(pB), pB, k.blue, { dx: 12, dy: -12, size: 12 }); A.guide(qq, pp); }
        txt = slopeK ? '<b>' + EFF[slopeK][0] + ':</b> ' + EFF[slopeK][1] + ' That is a movement <b>along</b> AD from A to B, not a shift. It is not the substitution effect from one market: here every price falls at once.' : 'Pick one of the three reasons a lower price level raises the quantity of real GDP demanded.';
        tl = [];
      } else if (mode === 'adjust') txt = 'Self-correction runs through SRAS: when output is ' + (o.start === 'inflation' ? 'above' : 'below') + ' potential, nominal wages and other input prices slowly ' + (o.start === 'inflation' ? 'rise' : 'fall') + ', shifting SRAS until output returns to potential. Economists debate how quickly this happens and whether policy should help it along.';
      else if (mode === 'policy') txt = (txtX ? txtX + ' ' : 'The economy starts with a ' + (s.ad < 0 ? 'recessionary' : 'inflationary') + ' gap. Pick a policy. ') + (M.abs(gapY) < 0.05 ? '<b>The gap is closed.</b>' : txtX ? 'A gap remains: ' + (gapY < 0 ? 'output is below' : 'output is above') + ' potential.' : '');
      else if (mode === 'growth') txt = 'Economic growth: more capital, better technology or more workers raise potential output, so <b>LRAS and SRAS shift right together</b>. LRAS moves only when the economy’s capacity changes, never because of the price level.' + (s.lr && !adToo ? ' With AD unchanged, the price level falls; usually spending grows too.' : '');
      T.set(q ? [] : tl); F.set(txt);
      marksOn(c, A, o.marks); F.say('An AD–AS graph with aggregate demand, short-run aggregate supply and long-run aggregate supply' + (q ? '.' : '; real GDP ' + fm(e.q, 2) + ', potential ' + fm(LR, 2) + '.')); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-multiplier: rounds of spending (or lending) and their running total */
  V.register('ec-multiplier', function (el, o) {
    o = opt(o, { mode: 'spending', first: 100, mpc: 0.8, rr: 0.1, rounds: 12, show: ['total', 'limit'] });
    var mode = o.mode, F = frame(el, o, mode === 'bank' ? 'The money multiplier, round by round' : 'The spending multiplier, round by round'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var mpc = num(o.mpc, 0.8), rr = num(o.rr, 0.1), first = num(o.first, 100), N = M.round(num(o.rounds, 12)), shown = N, play = null;
    var c = F.canvas(function (w) { return hw(w, 1.8, 1.1); });
    if (F.inter) {
      if (mode === 'bank') V.slider(F.ctl, { label: 'Reserve ratio', min: 0.05, max: 0.5, step: 0.01, value: rr, fmt: function (v) { return pct(v, 0); }, input: function (v) { rr = v; draw(); } });
      else V.slider(F.ctl, { label: 'MPC', min: 0.1, max: 0.95, step: 0.05, value: mpc, fmt: function (v) { return fm(v, 2); }, input: function (v) { mpc = v; draw(); } });
      var rs = V.slider(F.ctl, { label: 'Rounds shown', min: 1, max: N, step: 1, value: shown, input: function (v) { shown = v; draw(); } });
      var pb = btn(F.ctl, '▶ Play the rounds', function () { if (play) { clearInterval(play); play = null; pb.textContent = '▶ Play the rounds'; return; } shown = 1; rs.set(1); draw(); pb.textContent = '■ Stop'; play = setInterval(function () { if (shown >= N) { clearInterval(play); play = null; pb.textContent = '▶ Play the rounds'; return; } shown++; rs.set(shown); draw(); }, V.reduced ? 1200 : 500); });
    }
    var KN = knobs(F, c, [], function () { });
    function draw() {
      k = K(); clearC(c);
      var r = mode === 'bank' ? 1 - rr : mpc, f1 = mode === 'tax' ? mpc * first : first, rows = rounds(f1, r, N), lim = f1 / (1 - r);
      var neg = mode === 'balanced' ? rounds(-mpc * first, mpc, N) : null, limN = neg ? -mpc * first / (1 - mpc) : 0;
      var A = axes(c, { xmin: 0.4, xmax: N + 0.6, ymin: neg ? -niceCeil(-limN * 1.1) : 0, ymax: niceCeil(M.max(lim, first) * 1.1), xAt: rows.map(function (_, i) { return [i + 1, String(i + 1)]; }), xLabel: 'Round', yLabel: mode === 'bank' ? 'New deposits ($)' : 'Change in spending ($)', money: true }).set({ x: 0, y: 0, w: c.w, h: c.h });
      A.draw();
      rows.forEach(function (rw, i) { if (i >= shown) return; A.poly([[i + 1 - 0.3, 0], [i + 1 + 0.3, 0], [i + 1 + 0.3, rw.v], [i + 1 - 0.3, rw.v]], rgba(k.blue, 0.55), k.blue); if (neg) A.poly([[i + 1 - 0.3, 0], [i + 1 + 0.3, 0], [i + 1 + 0.3, neg[i].v], [i + 1 - 0.3, neg[i].v]], rgba(k.red, 0.5), k.red); });
      if (has(o.show, 'total')) { var tot = rows.map(function (rw, i) { return rw.total + (neg ? neg[i].total : 0); }); A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.green; ctx.lineWidth = 2.8; ctx.beginPath(); tot.forEach(function (v, i) { if (i < shown) ctx[i ? 'lineTo' : 'moveTo'](A.X(i + 1), A.Y(v)); }); ctx.stroke(); ctx.restore(); }); tot.forEach(function (v, i) { if (i < shown) A.dot(i + 1, v, k.green, 4); }); A.nameAt('Running total', 1, tot[0], k.green, 46, -14); }
      var L = lim + (neg ? limN : 0);
      if (has(o.show, 'limit') && !q) { A.hline(L, k.gold, { w: 2, dash: [7, 5] }); A.nameAt('Limit ' + money(L, 2), N + 0.4, L, k.gold, -40, -12); }
      var cum = rows[M.min(shown, N) - 1].total + (neg ? neg[M.min(shown, N) - 1].total : 0), mult = mode === 'bank' ? 1 / rr : 1 / (1 - mpc);
      var tl = [{ k: 'Total after ' + shown + ' round' + (shown > 1 ? 's' : ''), v: money(cum, 2), c: k.green }];
      if (!q) tl.push({ k: mode === 'bank' ? 'Money multiplier 1 ÷ rr' : mode === 'tax' ? 'Tax multiplier MPC ÷ MPS' : mode === 'balanced' ? 'Balanced-budget multiplier' : 'Multiplier 1 ÷ (1 − MPC)', v: mode === 'tax' ? fm(mpc / (1 - mpc), 2) : mode === 'balanced' ? '1' : fm(mult, 2), c: k.ink, hi: true }, { k: 'Limit', v: money(L, 2), c: k.gold });
      T.set(tl);
      var txt = mode === 'bank' ? 'A bank lends out ' + money(first) + ' of excess reserves. It is spent and deposited in another bank, which keeps ' + pct(rr, 0) + ' as reserves and lends the rest, and so on. The new deposits add up to ' + money(first) + ' ÷ ' + fm(rr, 2) + ' = ' + money(L, 2) + '. The multiplier applies to <b>excess</b> reserves, not to the whole first deposit. (The Federal Reserve set reserve requirements to zero in 2020; this simple model still shows how lending creates deposits.)'
        : mode === 'tax' ? 'A tax cut of ' + money(first) + ': households save part of it, so round 1 is only MPC × ' + money(first) + ' = ' + money(f1, 2) + '. Every later round is MPC times the one before. Total: ' + money(L, 2) + ', less than the same increase in government purchases would give.'
        : mode === 'balanced' ? 'Government purchases rise by ' + money(first) + ' (blue rounds) and taxes rise by the same amount (red rounds, starting at MPC × the tax). The two totals net to ' + money(L, 2) + ': a balanced-budget change raises GDP by about the amount of the spending.'
        : 'Round 1 is the new spending, ' + money(first) + '. It becomes someone’s income, and they spend MPC × it (' + money(first * mpc, 2) + ') in round 2, and so on. The total approaches ' + money(first) + ' × 1 ÷ (1 − ' + fm(mpc, 2) + ') = ' + money(L, 2) + '. The multiplier is 1 ÷ (1 − MPC), not MPC itself. Economists debate how big real-world multipliers are.';
      F.set(txt); F.say('Bars for each round of ' + (mode === 'bank' ? 'new deposits' : 'spending') + ' and a running total.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-taxbrackets: bracket rates fill like buckets; average and marginal rates */
  V.register('ec-taxbrackets', function (el, o) {
    var pre = { progressive: [[0, 0.10], [20000, 0.20], [60000, 0.30]], proportional: [[0, 0.15]], regressive: null };
    o = opt(o, { preset: 'progressive', show: ['average', 'marginal', 'chart'] });
    var F = frame(el, o, 'Tax brackets'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var preset = o.brackets ? 'custom' : o.preset, br = o.brackets || pre[preset], fixed = num(o.fixed, 3000), inc = num(o.income, 70000), top = num(o.max, 120000);
    var c = F.canvas(function (w) { return w >= 560 ? w / 2.1 : w * 1.45; });
    if (F.inter) {
      if (!o.brackets) V.seg(F.ctl, { label: 'Kind of tax', items: [['progressive', 'Progressive'], ['proportional', 'Proportional'], ['regressive', 'Regressive (fixed amount)']], value: preset, change: function (v) { preset = v; br = pre[v]; draw(); } });
      V.slider(F.ctl, { label: 'Income', min: 1000, max: top, step: 1000, value: inc, fmt: function (v) { return money(v); }, input: function (v) { inc = v; draw(); } });
    }
    var KN = knobs(F, c, [], function () { });
    function taxOf(x) { return br ? bracketTax(br, x) : { slices: [], tax: M.min(fixed, x), avg: x > 0 ? M.min(fixed, x) / x : 0, marginal: 0, after: x - M.min(fixed, x) }; }
    function draw() {
      k = K(); clearC(c); var g = 16, wide = c.w >= 560, r1 = wide ? { x: 0, y: 0, w: (c.w - g) * 0.46, h: c.h } : { x: 0, y: 0, w: c.w, h: (c.h - g) * 0.5 }, r2 = wide ? { x: (c.w - g) * 0.46 + g, y: 0, w: (c.w - g) * 0.54, h: c.h } : { x: 0, y: (c.h - g) * 0.5 + g, w: c.w, h: (c.h - g) * 0.5 };
      var t = taxOf(inc), ctx = c.ctx, cols = [k.teal, k.blue, k.purple, k.pink, k.orange];
      // buckets: one per bracket, stacked from the bottom; the income fills them in order
      var bx = r1.x + 64, bw = r1.w - 80, by0 = r1.y + r1.h - 14, H = r1.h - 40, sc = H / top;
      txt(ctx, 'Income fills the brackets', r1.x + 4, r1.y + 10, { size: 12.5, wt: 650, color: k.ink });
      if (br) t.slices.forEach(function (s, i) {
        var hi = M.min(s.hi, top), y1 = by0 - s.lo * sc, y2 = by0 - hi * sc, hpx = y1 - y2; if (hpx <= 0) return;
        ctx.save(); ctx.strokeStyle = cols[i % 5]; ctx.lineWidth = 1.5; ctx.strokeRect(bx, y2, bw, hpx);
        var fill = M.min(s.amt, hi - s.lo) * sc; ctx.fillStyle = rgba(cols[i % 5], 0.22); ctx.fillRect(bx, y1 - fill, bw, fill);
        ctx.fillStyle = rgba(cols[i % 5], 0.75); ctx.fillRect(bx, y1 - fill, bw * s.rate, fill); ctx.restore();
        txt(ctx, pct(s.rate, 0), bx - 6, (y1 + y2) / 2, { align: 'right', size: 12, wt: 700, color: cols[i % 5] });
        if (!q && s.amt > 0 && hpx > 16) pill(ctx, money(s.amt) + ' × ' + pct(s.rate, 0) + ' = ' + money(s.tax), bx + bw - 4, y1 - M.min(fill, hpx) / 2, { align: 'right', size: 11, color: k.ink, box: { x: r1.x, y: r1.y, w: r1.w, h: r1.h } });
        txt(ctx, s.lo ? money(s.lo) : '$0', bx - 6, y1 - 7, { align: 'right', size: 10.5 });
      });
      else { ctx.save(); ctx.strokeStyle = k.orange; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by0 - H, bw, H); ctx.fillStyle = rgba(k.orange, 0.2); ctx.fillRect(bx, by0 - inc * sc, bw, inc * sc); ctx.fillStyle = rgba(k.orange, 0.75); ctx.fillRect(bx, by0 - inc * sc, bw * M.min(1, fixed / inc), inc * sc); ctx.restore(); if (!q) pill(ctx, 'Tax ' + money(t.tax) + ' whatever the income', bx + bw / 2, by0 - inc * sc / 2, { size: 11 }); }
      ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 4, by0 - inc * sc); ctx.lineTo(bx + bw + 4, by0 - inc * sc); ctx.stroke(); ctx.restore(); pill(ctx, 'Income ' + money(inc), bx + bw / 2, by0 - inc * sc - 12, { size: 11, color: k.ink, border: k.ink, box: { x: r1.x, y: r1.y, w: r1.w, h: r1.h } });
      // rates against income
      var mr = 0.05 + M.max.apply(null, br ? br.map(function (b) { return b[1]; }) : [fixed / 5000]);
      var A = axes(c, { xmax: top, ymax: M.min(1, niceCeil(mr * 100) / 100), xLabel: 'Income ($)', yLabel: 'Tax rate', xfmt: function (v) { return v >= 1000 ? '$' + fm(v / 1000) + 'k' : '$' + fm(v); }, yfmt: function (v) { return pct(v, 0); } }).set(r2); A.draw();
      if (has(o.show, 'marginal')) { A.fn(function (x) { return taxOf(x).marginal; }, k.orange, { from: 1, to: top, w: 2.6, n: 600 }); A.nameAt('Marginal rate', top * 0.9, taxOf(top * 0.9).marginal, k.orange, -10, -12); }
      if (has(o.show, 'average')) { A.fn(function (x) { return taxOf(x).avg; }, k.blue, { from: br ? 500 : fixed * 0.9, to: top, w: 2.6 }); A.nameAt('Average rate', top * 0.9, taxOf(top * 0.9).avg, k.blue, -10, 14); }
      A.vline(inc, k.ink, { w: 1.4, dash: [4, 4] }); A.dot(inc, t.avg, k.blue, 5); A.dot(inc, t.marginal, k.orange, 5);
      T.set(q ? [] : [{ k: 'Total tax', v: money(t.tax), c: k.ink, hi: true }, { k: 'Average rate (tax ÷ income)', v: pct(t.avg, 1), c: k.blue }, { k: 'Marginal rate (on the next dollar)', v: pct(t.marginal, 0), c: k.orange }, { k: 'Kept after tax', v: money(t.after), c: k.green }]);
      F.set(br && br.length > 1 ? 'Each bracket’s rate applies only to the dollars <b>inside</b> that bracket. Crossing into a higher bracket raises the tax on the dollars above the line, not on all your income, so a raise never lowers your after-tax pay under bracket rates. The average rate stays below the top marginal rate. (Made-up brackets, not a real year’s tax table.)' : br ? 'A proportional (flat) tax: the same rate on every dollar, so the average and marginal rates are equal.' : 'A regressive tax: a fixed amount takes a bigger share of a small income than of a large one, so the average rate falls as income rises.');
      F.say('Tax brackets filled by an income, and a graph of the average and marginal tax rates.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-bond: a bond's payments discounted to the present; price against the market rate; present value */
  V.register('ec-bond', function (el, o) {
    o = opt(o, { face: 1000, coupon: 0.05, years: 5, rate: 0.04, mode: 'bond' });
    var F = frame(el, o, o.mode === 'pv' ? 'Present value' : 'A bond’s price and the interest rate'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var rate = num(o.rate, 0.04), pvo = o.pv || { kind: 'annuity', amount: 100, t: 5 }, kind = pvo.kind || 'annuity';
    var c = F.canvas(function (w) { return w >= 560 ? w / 2.3 : w * 1.25; });
    if (F.inter) { V.slider(F.ctl, { label: 'Market interest rate', min: 0.005, max: 0.15, step: 0.005, value: rate, fmt: function (v) { return pct(v, 1); }, input: function (v) { rate = v; draw(); } }); if (o.mode === 'pv' && !o.pv) V.seg(F.ctl, { label: 'Payments', items: [['single', 'One payment'], ['annuity', 'Every year (annuity)'], ['perpetuity', 'Forever (perpetuity)']], value: kind, change: function (v) { kind = v; draw(); } }); }
    var KN = knobs(F, c, [], function () { });
    function draw() {
      k = K(); clearC(c); var g = 16, wide = c.w >= 560, r1 = wide ? { x: 0, y: 0, w: (c.w - g) * 0.62, h: c.h } : { x: 0, y: 0, w: c.w, h: (c.h - g) * 0.58 }, r2 = wide ? { x: (c.w - g) * 0.62 + g, y: 0, w: (c.w - g) * 0.38, h: c.h } : { x: 0, y: (c.h - g) * 0.58 + g, w: c.w, h: (c.h - g) * 0.42 };
      var pays, price, label;
      if (o.mode === 'pv') { var Am = num(pvo.amount, 100), tn = M.round(num(pvo.t, 5)), n = kind === 'perpetuity' ? 20 : tn; pays = []; for (var t = 1; t <= n; t++) { if (kind === 'single' && t < tn) continue; var df = 1 / M.pow(1 + rate, t); pays.push({ t: t, amt: Am, df: df, pv: Am * df }); } price = pv(kind, Am, tn, rate); label = kind === 'perpetuity' ? 'Present value (all years)' : 'Present value'; }
      else { var b = bond(num(o.face, 1000), num(o.coupon, 0.05), M.round(num(o.years, 5)), rate); pays = b.pays; price = b.price; label = 'Bond price'; }
      var amax = M.max.apply(null, pays.map(function (p) { return p.amt; })), nT = pays.length ? pays[pays.length - 1].t : 1;
      var A = axes(c, { xmin: 0.4, xmax: nT + 0.6, ymax: niceCeil(amax * 1.12), xAt: pays.map(function (p) { return [p.t, String(p.t)]; }).filter(function (p, i, arr) { return arr.length <= 12 || p[0] % 5 === 0 || p[0] === 1; }), xLabel: 'Year', yLabel: 'Payment ($)', money: true, title: kind === 'perpetuity' && o.mode === 'pv' ? 'First 20 years shown' : '' }).set(r1); A.draw();
      var w = M.min(0.38, 0.4);
      pays.forEach(function (p) { A.poly([[p.t - w, 0], [p.t + w, 0], [p.t + w, p.amt], [p.t - w, p.amt]], null, k.muted); A.poly([[p.t - w, 0], [p.t + w, 0], [p.t + w, p.pv], [p.t - w, p.pv]], rgba(k.green, 0.6), k.green); if (!q && pays.length <= 8) A.label('× ' + fm(p.df, 3), p.t, p.amt, k.muted, { dy: -11, size: 10.5 }); });
      // price against the rate
      var lo = 0.005, hi = 0.15, pf = function (r) { return o.mode === 'pv' ? pv(kind, num(pvo.amount, 100), M.round(num(pvo.t, 5)), r) : bond(num(o.face, 1000), num(o.coupon, 0.05), M.round(num(o.years, 5)), r).price; };
      var A2 = axes(c, { xmin: 0, xmax: hi, ymin: 0, ymax: niceCeil(M.min(pf(lo), pf(lo + 0.01) * 4) * 1.08), xLabel: 'Interest rate', yLabel: label + ' ($)', money: true, xfmt: function (v) { return pct(v, 0); }, xstep: 0.05 }).set(r2); A2.draw();
      A2.fn(pf, k.purple, { from: lo, to: hi, w: 2.6 }); A2.dot(rate, price, k.purple, 6); if (!q) A2.tagY(price, money(price, 2), k.purple);
      if (o.mode !== 'pv') { A2.hline(num(o.face, 1000), k.muted, { w: 1.2, dash: [4, 4] }); A2.vline(num(o.coupon, 0.05), k.muted, { w: 1.2, dash: [4, 4] }); }
      T.set(q ? [] : [{ k: label, v: money(price, 2), c: k.purple, hi: true }, { k: 'Market rate', v: pct(rate, 1), c: k.ink }].concat(o.mode === 'pv' ? [] : [{ k: 'Coupon rate', v: pct(num(o.coupon, 0.05), 1), c: k.muted }]));
      F.set(o.mode === 'pv' ? 'A dollar received t years from now is worth 1 ÷ (1 + r)<sup>t</sup> dollars today: divide, once for each year of waiting. Green shows what each payment is worth today; their sum is the present value. ' + (kind === 'perpetuity' ? 'A payment every year forever is worth A ÷ r.' : '') : 'The bond pays ' + money(num(o.face, 1000) * num(o.coupon, 0.05)) + ' a year and ' + money(num(o.face, 1000)) + ' at the end. Each payment is discounted at the market rate (green), and the price is their sum. When market rates <b>rise</b>, those fixed payments are worth less today, so the price <b>falls</b>; when the market rate equals the coupon rate, the price equals the face value.');
      F.say('Bars of future payments and their present values, and a curve of price against the interest rate' + (q ? '.' : ': price ' + fm(price, 2) + '.')); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-tacct: a bank's T-account; deposits, loans, the next bank, and central bank bond trades */
  V.register('ec-tacct', function (el, o) {
    o = opt(o, { rr: 0.1, start: { deposits: 10000, reserves: 1000, loans: 7000, securities: 3000, equity: 1000 }, currency: 2000, steps: ['deposit', 'lend', 'spend', 'buy', 'sell'], chain: 3, amount: 1000, bonds: 1000 });
    var F = frame(el, o, 'A bank’s balance sheet'), k = K(), q = F.quiet, rr = num(o.rr, 0.1), s0 = o.start;
    function fresh() { return { banks: [{ R: num(s0.reserves, 0), L: num(s0.loans, 0), S: num(s0.securities, 0), D: num(s0.deposits, 0), E: num(s0.equity, 0) }], C: num(o.currency, 0), loan: 0, last: null, prev: null }; }
    var st = fresh(), fill = !!o.fill && !q, pending = false, typed = {};
    var wrap = mk('div', 'ecv-ta'); F.box.appendChild(wrap);
    var ribbon = mk('div', 'ecv-tiles'); F.box.appendChild(ribbon);
    var ACT = {
      deposit: ['A customer deposits ' + money(o.amount) + ' in cash', function (s) { var x = M.min(num(o.amount, 1000), s.C); s.C -= x; s.banks[0].R += x; s.banks[0].D += x; return 'Cash moves from the customer’s pocket into the bank: reserves and deposits both rise by ' + money(x) + '. The money supply does not change: currency fell and deposits rose by the same amount. Deposits are the bank’s <b>liabilities</b>: it owes them to customers.'; }],
      lend: ['The bank lends its excess reserves', function (s) { var i = s.banks.length - 1, b = s.banks[i], er = M.max(0, b.R - rr * b.D); if (er < 0.005) return 'This bank has no excess reserves to lend.'; b.R -= er; b.L += er; s.C += er; s.loan = er; return 'The bank lends its ' + money(er, 2) + ' of excess reserves: loans rise, reserves fall to exactly the required ' + money(rr * b.D, 2) + '. The borrower now holds ' + money(er, 2) + ' that did not exist as money before: <b>the money supply rises</b>.'; }],
      spend: ['The borrower spends; the seller deposits it in the next bank', function (s) { if (!s.loan) return 'Lend first: there is no new loan to spend.'; var x = s.loan; s.C -= x; s.loan = 0; if (s.banks.length < num(o.chain, 3)) s.banks.push({ R: 0, L: 0, S: 0, D: 0, E: 0 }); var b = s.banks[s.banks.length - 1]; b.R += x; b.D += x; return 'The seller deposits the ' + money(x, 2) + ' in ' + bankName(s.banks.length - 1) + '. Its reserves and deposits rise; it keeps ' + pct(rr, 0) + ' as required reserves and can lend the rest, ' + money(x * (1 - rr), 2) + '.'; }],
      buy: ['The central bank buys ' + money(o.bonds) + ' of bonds from the bank', function (s) { var b = s.banks[0], x = M.min(num(o.bonds, 1000), b.S); b.S -= x; b.R += x; return 'The bank swaps ' + money(x) + ' of securities for reserves. Excess reserves rise, so the bank can lend more: buying bonds is <b>expansionary</b>.'; }],
      sell: ['The central bank sells ' + money(o.bonds) + ' of bonds to the bank', function (s) { var b = s.banks[0], x = M.min(num(o.bonds, 1000), b.R); b.S += x; b.R -= x; return 'The bank pays for the bonds with reserves: excess reserves fall, so lending (and the money supply) shrinks: selling bonds is <b>contractionary</b>.'; }]
    };
    function bankName(i) { return 'Bank ' + 'ABCDEFGH'[i]; }
    var msg = 'Pick a step. The two sides of every T-account always balance: assets = liabilities + owners’ equity.';
    if (F.inter) { var g = group(F.ctl, 'Steps'); o.steps.forEach(function (key) { if (!ACT[key]) return; btn(g, ACT[key][0], function () { if (pending) return; st.prev = JSON.parse(JSON.stringify(st.banks)); st.prevM = money_(); msg = ACT[key][1](st); st.last = key; if (fill) { pending = true; typed = {}; } render(); }, 'ecv-ev'); }); btn(F.ctl, 'Start over', function () { st = fresh(); pending = false; msg = 'Back to the start.'; render(); }); if (fill) btn(F.ctl, 'Check my entries', function () { check(); }, 'pri'); }
    function money_() { return st.C + st.banks.reduce(function (a, b) { return a + b.D; }, 0); }
    var FIELDS = [['RR', 'Required reserves'], ['ER', 'Excess reserves'], ['L', 'Loans'], ['S', 'Securities (bonds)']], LIAB = [['D', 'Demand deposits'], ['E', 'Owners’ equity']];
    function val(b, f) { return f === 'RR' ? rr * b.D : f === 'ER' ? b.R - rr * b.D : b[f]; }
    function render() {
      wrap.innerHTML = st.banks.map(function (b, i) {
        var pb = st.prev && st.prev[i], cell = function (f) {
          var v = val(b, f), pv = pb ? val(pb, f) : (st.prev ? 0 : v), ch = st.prev && M.abs(v - pv) > 0.004, id = i + f;
          if (pending && ch) return '<td><input inputmode="decimal" data-id="' + id + '" aria-label="' + bankName(i) + ' ' + f + '" value="' + (typed[id] || '') + '"></td>';
          return '<td' + (ch ? ' class="chg"' : '') + '>' + money(v, 2) + (ch && !q ? '<span class="d">' + (v > pv ? '+' : '−') + money(M.abs(v - pv), 2).replace('−', '') + '</span>' : '') + '</td>';
        };
        var assets = b.R + b.L + b.S, ra = '', rl = '';
        FIELDS.forEach(function (f2) { ra += '<tr><th scope="row">' + f2[1] + '</th>' + cell(f2[0]) + '</tr>'; });
        LIAB.forEach(function (f2) { rl += '<tr><th scope="row">' + f2[1] + '</th>' + cell(f2[0]) + '</tr>'; });
        ra += '<tr class="tot"><th scope="row">Total assets</th><td>' + money(assets, 2) + '</td></tr>'; rl += '<tr class="sp"><th>&nbsp;</th><td>&nbsp;</td></tr><tr class="sp"><th>&nbsp;</th><td>&nbsp;</td></tr><tr class="tot"><th scope="row">Total liabilities and equity</th><td>' + money(b.D + b.E, 2) + '</td></tr>';
        return '<div class="ecv-tacc"><div class="ecv-tah">' + bankName(i) + '</div><div class="ecv-tgrid"><div class="ecv-tbl"><table><caption>Assets</caption><tbody>' + ra + '</tbody></table></div><div class="ecv-tbl"><table><caption>Liabilities and owners’ equity</caption><tbody>' + rl + '</tbody></table></div></div></div>';
      }).join('');
      wrap.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { typed[inp.dataset.id] = inp.value; }); });
      var R = st.banks.reduce(function (a, b) { return a + b.R; }, 0), Ms = money_();
      ribbon.innerHTML = q ? '' : '<div style="--c:' + k.green + '"><span>Money supply (currency + deposits)</span><b>' + money(Ms, 2) + (st.prevM != null && M.abs(Ms - st.prevM) > 0.004 ? ' (' + (Ms > st.prevM ? '+' : '−') + money(M.abs(Ms - st.prevM), 2).replace('−', '') + ')' : '') + '</b></div><div style="--c:' + k.blue + '"><span>Currency held by the public</span><b>' + money(st.C, 2) + '</b></div><div style="--c:' + k.orange + '"><span>Bank reserves</span><b>' + money(R, 2) + '</b></div><div><span>Reserve requirement</span><b>' + pct(rr, 0) + '</b></div>';
      F.out.el.hidden = false; F.out.set(pending ? 'Fill in the new amounts for the highlighted entries, then press Check.' : msg);
      wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'T-accounts');
    }
    function check() {
      if (!pending) return; var right = 0, all = 0;
      st.banks.forEach(function (b, i) { FIELDS.concat(LIAB).forEach(function (f) { var id = i + f[0], inp = wrap.querySelector('[data-id="' + id + '"]'); if (!inp) return; all++; var v = parseFloat(String(inp.value).replace(/[$,\s]/g, '')), ok = isFinite(v) && M.abs(v - val(b, f[0])) < 0.01; if (ok) right++; inp.classList.toggle('ok', ok); inp.classList.toggle('no', !ok); }); });
      if (right === all) { pending = false; render(); F.out.set('All ' + all + ' entries right. ' + msg); } else F.out.set(right + ' of ' + all + ' right. Remember: both sides must still balance.');
    }
    render();
    return { render: render };
  });

  /* ec-moneymarket: the money market, the policy chain to AD–AS, and the market for bank reserves */
  V.register('ec-moneymarket', function (el, o) {
    o = opt(o, { mode: 'money', ms: 10, ample: true, iorb: 4 });
    var mode = o.mode, F = frame(el, o, mode === 'reserves' ? 'The market for bank reserves' : 'The money market'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var c, draw, KN;
    var Ms0 = num(o.ms, 10), MD0 = line(9, -0.5).shift(num(o.md && o.md.shift, 0)), s = { ms: 0, md: 0 }, ev = null;
    function iOf(ms, md) { return MD0.shift(md).P(Ms0 + ms); }
    function moneyPanel(A, ms, md, old) {
      var Ms = Ms0 + ms, MD = MD0.shift(md);
      if (old && (ms || md)) { if (ms) A.vline(Ms0, k.orange, { w: 2.1, dash: [7, 6], alpha: 0.7 }); if (md) A.lin(MD0, k.blue, { w: 2.1, dash: [7, 6], alpha: 0.7 }); }
      A.vline(Ms, k.orange, { w: 3 }); A.nameAt(ms ? 'MS' + sub(2) : 'MS', Ms, A.ymax * 0.93, k.orange, 18, 0); if (ms && old) A.nameAt('MS' + sub(1), Ms0, A.ymax * 0.93, k.orange, -18, 0);
      A.lin(MD, k.blue); A.name(MD, md ? 'MD' + sub(2) : 'MD', k.blue, 0.88); if (md && old) A.name(MD0, 'MD' + sub(1), k.blue, 0.74);
      var i0 = iOf(0, 0), i1 = MD.P(Ms); if ((ms || md) && old) { A.guide(Ms0, i0, k.muted); A.dot(Ms0, i0, k.muted, 5); }
      A.guide(Ms, i1); A.dot(Ms, i1, k.ink, 6); if (!q) A.tagY(i1, fm(i1, 2) + '%', k.ink);
      if (ms && old && M.abs(ms) > 0.05) A.arrow(Ms0, A.ymax * 0.8, Ms, A.ymax * 0.8, k.orange, 2.4);
      return { i0: i0, i1: i1 };
    }
    if (mode === 'money') {
      c = F.canvas(function (w) { return hw(w, 1.55, 1.02); }); var A = axes(c, { xmax: 20, ymax: 10, xLabel: o.xLabel || 'Quantity of money', yLabel: o.yLabel || 'Nominal interest rate (%)', yfmt: function (v) { return fm(v) + '%'; } });
      var evs = o.events || [{ label: 'Central bank buys bonds', curve: 'MS', dir: 1, why: 'It pays with new reserves, so the money supply grows', side: 's' }, { label: 'Central bank sells bonds', curve: 'MS', dir: -1, why: 'Buyers pay with money, which leaves circulation', side: 's' }, { label: 'Price level rises', curve: 'MD', dir: 1, why: 'Buying the same things takes more money' }, { label: 'Real GDP falls', curve: 'MD', dir: -1, why: 'Fewer transactions need less money' }];
      if (F.inter) eventButtons(F, evs, [['MS', 'Money supply'], ['MD', 'Money demand']], function (e) { ev = e; var tg = { ms: e && e.curve === 'MS' ? e.dir * 3 : 0, md: e && e.curve === 'MD' ? e.dir * 3 : 0 }, fr = { ms: s.ms, md: s.md }; tween(F, 600, function (t) { s.ms = lerp(fr.ms, tg.ms, t); s.md = lerp(fr.md, tg.md, t); draw(); }); });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw(); var r = moneyPanel(A, s.ms, s.md, true);
        T.set(q ? [] : [{ k: 'Interest rate', v: fm(r.i0, 2) + '% → ' + fm(r.i1, 2) + '%', c: k.ink }, { k: 'Quantity of money', v: fm(Ms0) + ' → ' + fm(Ms0 + s.ms), c: k.orange }]);
        F.set(ev ? '<b>' + ev.label + '.</b> ' + ev.why + '. ' + (ev.curve === 'MS' ? 'The vertical money supply moves, and the interest rate ' + (r.i1 < r.i0 ? 'falls' : 'rises') + ': people move <b>along</b> money demand to hold the new amount of money.' : 'Money demand shifts, and with the money supply fixed by the central bank the interest rate ' + (r.i1 > r.i0 ? 'rises' : 'falls') + '.') : 'The money supply is vertical: the central bank sets it, whatever the interest rate. Money demand slopes down: the interest rate is what you give up by holding money instead of bonds.');
        marksOn(c, A, o.marks); F.say('A money market graph with a vertical money supply and a downward-sloping money demand' + (q ? '.' : '; interest rate ' + fm(r.i1, 2) + ' percent.')); KN.place();
      };
    } else if (mode === 'chain') {
      var dir = o.direction === 'contractionary' ? -1 : 1, n = 5, stI = clamp(num(o.step, 0), 0, n), ID = line(10, -0.4), AD0 = line(160, -6), SR = line(40, 6);
      c = F.canvas(function (w) { return w >= 760 ? w / 3.1 : w >= 560 ? w / 1.15 : w * 2.3; });
      var Am = axes(c, { xmax: 20, ymax: 10, xLabel: 'Money', yLabel: 'Interest rate (%)', title: '1. Money market', yfmt: function (v) { return fm(v) + '%'; } }), Ai = axes(c, { xmax: 25, ymax: 10, xLabel: 'Investment', yLabel: 'Interest rate (%)', title: '2. Investment', yfmt: function (v) { return fm(v) + '%'; } }), Aa = axes(c, { xmax: 20, ymin: 40, ymax: 160, xLabel: 'Real GDP', yLabel: 'Price level', title: '3. AD–AS' });
      var anim = 1, stepNow = stI;
      if (F.inter) stepper(F.ctl, n + 1, stI, function (i) { stepNow = i; anim = 0; tween(F, 600, function (t) { anim = t; draw(); }); }, function (i) { return q ? 'Step ' + (i + 1) + ' of ' + (n + 1) : ['Start: all three markets at rest.', dir > 0 ? 'The central bank buys bonds: the money supply shifts right.' : 'The central bank sells bonds: the money supply shifts left.', 'The interest rate ' + (dir > 0 ? 'falls' : 'rises') + ' (a movement along money demand).', 'At the ' + (dir > 0 ? 'lower' : 'higher') + ' rate, firms ' + (dir > 0 ? 'invest more' : 'invest less') + ': a movement along investment demand.', 'Investment is part of spending, so AD shifts ' + (dir > 0 ? 'right' : 'left') + '.', 'Real GDP and the price level both ' + (dir > 0 ? 'rise' : 'fall') + ' in the short run.'][i]; });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); var w = c.w, g = 14, three = w >= 760, mid = w >= 560 && !three;
        if (three) { var pw = (w - 2 * g) / 3; Am.set({ x: 0, y: 0, w: pw, h: c.h }); Ai.set({ x: pw + g, y: 0, w: pw, h: c.h }); Aa.set({ x: 2 * (pw + g), y: 0, w: pw, h: c.h }); }
        else if (mid) { var hh = (c.h - g) / 2, ww = (w - g) / 2; Am.set({ x: 0, y: 0, w: ww, h: hh }); Ai.set({ x: ww + g, y: 0, w: ww, h: hh }); Aa.set({ x: w / 4, y: hh + g, w: w / 2, h: hh }); }
        else { var h3 = (c.h - 2 * g) / 3; Am.set({ x: 0, y: 0, w: w, h: h3 }); Ai.set({ x: 0, y: h3 + g, w: w, h: h3 }); Aa.set({ x: 0, y: 2 * (h3 + g), w: w, h: h3 }); }
        Am.draw(); Ai.draw(); Aa.draw();
        var f = function (i) { return stepNow > i ? 1 : stepNow === i ? anim : 0; }, ms = dir * 4 * f(1), r = moneyPanel(Am, ms, 0, true), i0 = r.i0, iNow = stepNow >= 2 ? lerp(i0, r.i1, f(2)) : i0;
        if (stepNow >= 1 && stepNow < 2) { Am.hline(i0, k.muted, { w: 1.2, dash: [4, 4] }); }
        Ai.lin(ID, k.blue); Ai.name(ID, 'Investment demand', k.blue, 0.8); var iInv = stepNow >= 3 ? lerp(i0, r.i1, f(3)) : i0; if (stepNow >= 3) { Ai.dot(ID.Q(i0), i0, k.muted, 5); } Ai.guide(ID.Q(iInv), iInv); Ai.dot(ID.Q(iInv), iInv, k.ink, 6);
        if (stepNow >= 2) Ai.hline(iNow, k.gold, { w: 1.2, dash: [4, 4] });
        var adS = dir * 3 * f(4), AD = AD0.shift(adS); if (adS) { Aa.lin(AD0, k.blue, { dash: [7, 6], w: 2, alpha: 0.7 }); } Aa.lin(AD, k.blue); Aa.lin(SR, k.orange); Aa.name(AD, 'AD', k.blue, 0.88); Aa.name(SR, 'SRAS', k.orange, 0.88); Aa.vline(10, k.green, { w: 2.4 }); Aa.nameAt('LRAS', 10, 150, k.green, 0, 0);
        var e0 = equilibrium(AD0, SR), e1 = equilibrium(AD, SR); if (adS) { Aa.dot(e0.q, e0.p, k.muted, 5); } Aa.guide(e1.q, e1.p); Aa.dot(e1.q, e1.p, k.ink, 6);
        T.set(q ? [] : [{ k: 'Interest rate', v: fm(iNow, 2) + '%', c: k.ink }, { k: 'Investment', v: fm(ID.Q(stepNow >= 3 ? lerp(i0, r.i1, f(3)) : i0), 2), c: k.blue }, { k: 'Real GDP', v: fm(e1.q, 2), c: k.ink }]);
        F.set('Monetary policy travels in steps: money supply → interest rate → investment (and other interest-sensitive spending) → aggregate demand → real GDP and the price level. Only the first and fourth steps are shifts; the others are movements along curves.');
        F.say('Three linked graphs: the money market, investment demand and AD–AS.'); KN.place();
      };
    } else { // reserves
      var iorb = num(o.iorb, 4), ample = o.ample !== false, Rs = num(o.reserves, ample ? 75 : 22);
      var dem = function (R) { return iorb + 4 * M.exp(-R / 15); }; // stylized: steep when reserves are scarce, flat at IORB when they are ample
      c = F.canvas(function (w) { return hw(w, 1.6, 1.05); }); var Ar = axes(c, { xmax: 100, ymin: 0, ymax: niceCeil(iorb + 5.5), xLabel: o.xLabel || 'Quantity of reserves', yLabel: o.yLabel || 'Federal funds rate (%)', yfmt: function (v) { return fm(v) + '%'; } });
      if (F.inter) { V.slider(F.ctl, { label: 'Reserve supply (bond purchases or sales)', min: 10, max: 95, step: 1, value: Rs, input: function (v) { Rs = v; draw(); } }); V.slider(F.ctl, { label: 'Interest on reserve balances (IORB)', min: 0.25, max: 6, step: 0.25, value: iorb, fmt: function (v) { return fm(v, 2) + '%'; }, input: function (v) { iorb = v; draw(); } }); }
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); Ar.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        Ar.hline(iorb, k.green, { w: 1.6, dash: [6, 4] }); Ar.nameAt('Interest on reserves (IORB) ' + fm(iorb, 2) + '%', 98, iorb, k.green, -90, 13);
        Ar.fn(dem, k.blue, { from: 0, to: 100, w: 3 }); Ar.nameAt('Demand for reserves', 50, dem(50), k.blue, 0, -16);
        Ar.vline(Rs, k.orange, { w: 3 }); Ar.nameAt('Supply', Rs, 7.5, k.orange, 26, 0);
        var ff = dem(Rs); Ar.guide(Rs, ff); Ar.dot(Rs, ff, k.ink, 6); if (!q) Ar.tagY(ff, fm(ff, 2) + '%', k.ink);
        var flat = (dem(Rs - 1) - dem(Rs + 1)) < 0.02;
        T.set(q ? [] : [{ k: 'Federal funds rate', v: fm(ff, 2) + '%', c: k.ink, hi: true }, { k: 'Reserves are', v: flat ? 'ample' : 'limited', c: k.orange }]);
        F.set(flat ? 'With <b>ample</b> reserves, supply crosses demand on its flat part, near the interest rate the central bank pays on reserves. Buying or selling bonds barely moves the federal funds rate; raising or lowering IORB moves it. This is how the Federal Reserve has steered rates since 2008.' : 'With <b>limited</b> reserves, supply crosses demand on its steep part: open market purchases or sales move the federal funds rate. This is the classic textbook picture.');
        marksOn(c, Ar, o.marks); F.say('The market for bank reserves: a demand curve that flattens at the interest rate on reserves, and a vertical supply' + (q ? '.' : '; federal funds rate ' + fm(ff, 2) + ' percent.')); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-loanable: the loanable funds market and the saving–investment identity */
  V.register('ec-loanable', function (el, o) {
    o = opt(o, { mode: 'market', deficitAs: 'demand' });
    var F = frame(el, o, o.mode === 'identity' ? 'Saving, investment and the trade balance' : 'The loanable funds market'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var c, draw, KN = null;
    if (o.mode === 'identity') {
      var v = o.values || { sp: 20, tg: -5, i: 18 }, sp = num(v.sp, 20), tg = num(v.tg, -5), inv = num(v.i, 18);
      c = F.canvas(function (w) { return hw(w, 2.1, 1.25); });
      if (F.inter) { V.slider(F.ctl, { label: 'Private saving', min: 0, max: 40, step: 1, value: sp, input: function (x) { sp = x; draw(); } }); V.slider(F.ctl, { label: 'Government budget balance (T − G)', min: -20, max: 10, step: 1, value: tg, input: function (x) { tg = x; draw(); } }); V.slider(F.ctl, { label: 'Investment', min: 0, max: 40, step: 1, value: inv, input: function (x) { inv = x; draw(); } }); }
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); var nx = sp + tg - inv, A = axes(c, { xmin: 0.3, xmax: 2.7, ymin: -25, ymax: 50, xAt: [[1, 'Saving side: Sp + (T − G)'], [2, 'Use side: I + NX']], yLabel: 'Billions of dollars' }).set({ x: 0, y: 0, w: c.w, h: c.h }); A.draw();
        function seg2(x, a, b, col, lab) { if (M.abs(b - a) < 1e-9) return; A.poly([[x - 0.3, a], [x + 0.3, a], [x + 0.3, b], [x - 0.3, b]], rgba(col, 0.55), col); if (M.abs(b - a) > 3) A.label(lab, x, (a + b) / 2, k.ink, { size: 11 }); }
        seg2(1, 0, sp, k.green, 'Private saving ' + fm(sp)); seg2(1, sp, sp + tg, tg >= 0 ? k.purple : k.red, (tg >= 0 ? 'Surplus ' : 'Deficit ') + fm(M.abs(tg)));
        seg2(2, 0, inv, k.blue, 'Investment ' + fm(inv)); seg2(2, inv, inv + nx, nx >= 0 ? k.teal : k.orange, 'NX ' + fm(nx));
        A.hline(sp + tg, k.ink, { w: 1.4, dash: [5, 4] }); A.hline(0, k.axis, { w: 1.2 });
        T.set(q ? [] : [{ k: 'Sp + (T − G)', v: fm(sp + tg), c: k.green }, { k: 'I + NX', v: fm(inv + nx), c: k.blue }, { k: 'Net exports', v: fm(nx), c: nx >= 0 ? k.teal : k.orange, hi: true }]);
        F.set('An accounting identity: S<sub>private</sub> + (T − G) = I + NX always holds. When national saving falls short of investment, net exports are negative: the country borrows the difference from abroad. The trade balance changes only when saving or investment does.');
        F.say('Bars showing private saving plus the government budget balance equal to investment plus net exports.'); KN.place();
      };
    } else {
      var S0 = curve(o.supply || { p0: 1, s: 0.5 }, 'S'), D0 = curve(o.demand || { p0: 10, s: 0.5 }, 'D'), sh = [0, 0], ev = null, def = 4;
      var evs = o.events || [{ label: 'The government runs a deficit', key: 'deficit', curve: o.deficitAs === 'supply' ? 'S' : 'D', dir: o.deficitAs === 'supply' ? -1 : 1, why: o.deficitAs === 'supply' ? 'Public saving falls, so national saving (supply) decreases' : 'The government borrows, so demand for loanable funds increases' }, { label: 'Households save more', curve: 'S', dir: 1, why: 'More saving means more funds to lend' }, { label: 'Investment tax credit', curve: 'D', dir: 1, why: 'Firms want to borrow more for investment' }, { label: 'Foreign capital flows in', curve: 'S', dir: 1, why: 'Foreign savers lend here' }, { label: 'Capital flows out', curve: 'S', dir: -1, why: 'Savers send funds abroad' }];
      var R = sdRange(o, [D0, D0.shift(4)], [S0]); c = F.canvas(function (w) { return hw(w, 1.55, 1.0); }); var A2 = axes(c, { xmax: R.xMax, ymax: R.yMax, xLabel: o.xLabel || 'Quantity of loanable funds', yLabel: o.yLabel || 'Real interest rate (%)', yfmt: function (x) { return fm(x) + '%'; } });
      if (F.inter) eventButtons(F, evs, [['D', 'Demand (borrowing)'], ['S', 'Supply (saving)']], function (e) { ev = e; var tg = [e && e.curve === 'D' ? e.dir * def : 0, e && e.curve === 'S' ? e.dir * def : 0]; animShift(F, tg, function (x) { if (x) sh = x; return sh; }, draw); });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); A2.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
        var r = sdPanel(A2, D0, S0, sh[0], sh[1], ['D', 'S'], { quiet: q, yf: function (x) { return fm(x, 2) + '%'; } }), tl = [{ k: 'Real interest rate', v: fm(r.e0.p, 2) + '% → ' + fm(r.e1.p, 2) + '%', c: k.ink }, { k: 'Funds lent', v: fm(r.e0.q, 2) + ' → ' + fm(r.e1.q, 2), c: k.ink }], txt = '';
        if (ev && ev.key === 'deficit') {
          var priv = o.deficitAs === 'supply' ? r.e1.q : r.e1.q - def * (M.abs(sh[0]) / def || 0), out = r.e0.q - priv, y = A2.ymin + (A2.ymax - A2.ymin) * 0.07, ctx = c.ctx;
          if (o.deficitAs !== 'supply') { A2.poly([[0, y - 0.25], [priv, y - 0.25], [priv, y + 0.25], [0, y + 0.25]], rgba(k.blue, 0.6), k.blue); A2.poly([[priv, y - 0.25], [r.e1.q, y - 0.25], [r.e1.q, y + 0.25], [priv, y + 0.25]], rgba(k.purple, 0.6), k.purple); if (out > 0.01) { A2.hatch([[priv, y - 0.25], [r.e0.q, y - 0.25], [r.e0.q, y + 0.25], [priv, y + 0.25]]); } if (!q) { A2.label('Private', priv / 2, y, k.ink, { size: 10.5 }); A2.label('Gov’t', (priv + r.e1.q) / 2, y, k.ink, { size: 10.5, dy: -14 }); } }
          tl.push({ k: 'Private borrowing (investment)', v: fm(r.e0.q, 2) + ' → ' + fm(priv, 2), c: k.blue }, { k: 'Crowded out', v: fm(M.max(0, out), 2), c: k.muted, hi: true });
          txt = '<b>' + ev.label + '.</b> ' + ev.why + '. The real interest rate rises, so private borrowing for investment falls: <b>crowding out</b> (hatched). How much crowding out happens in real economies is debated; it depends on how strongly saving and investment respond to interest rates.';
        } else if (ev) txt = '<b>' + ev.label + '.</b> ' + ev.why + '. The real interest rate ' + (r.e1.p > r.e0.p ? 'rises' : 'falls') + '.';
        else txt = 'Saving supplies loanable funds and borrowing demands them; they set the <b>real</b> interest rate. (The money market sets the nominal rate in the short run.) Pick an event.';
        T.set(q ? [] : tl); F.set(txt);
        marksOn(c, A2, o.marks); F.say('The loanable funds market with saving as supply and borrowing as demand' + (ev ? '; ' + ev.label + '.' : '.')); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-phillips: AD–AS linked to the Phillips curves; expectations catching up */
  V.register('ec-phillips', function (el, o) {
    o = opt(o, { un: 5, expected: 2, mode: 'linked' });
    var mode = o.mode, F = frame(el, o, 'The Phillips curve'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var un = num(o.un, 5), pe0 = num(o.expected, 2), c, draw, KN;
    var Yf = 10, AD0 = line(160, -6), SR0 = line(40, 6), okun = 0.5, kap = 0.25; // u = un − 0.5·(Y − Yf); π = πe + 0.25·(P − 100) ⇒ short-run slope −3
    var s = { ad: 0, sr: 0 }, pts = [], beta = mode === 'linked' ? 3 : 1;
    function phAxes(title) { return axes(c, { xmin: 0, xmax: 10, ymin: -2, ymax: 12, xLabel: 'Unemployment rate (%)', yLabel: 'Inflation rate (%)', title: title, xfmt: function (v) { return fm(v) + '%'; }, yfmt: function (v) { return fm(v) + '%'; } }); }
    function srpc(pe, shift) { return line(pe + (shift || 0) + beta * un, -beta); } // π = πe + shift − β(u − un), as a line in (u, π)
    if (mode === 'linked') {
      c = F.canvas(function (w) { return w >= 560 ? w / 2.05 : w * 1.62; }); var A1 = axes(c, { xmax: 20, ymin: 40, ymax: 160, xLabel: 'Real GDP (Y)', yLabel: 'Price level', title: 'AD–AS' }), A2 = phAxes('Phillips curves'), ev = null;
      if (F.inter) eventButtons(F, [{ label: 'AD increases', curve: 'AD', dir: 1 }, { label: 'AD decreases', curve: 'AD', dir: -1 }, { label: 'Supply shock: oil prices rise', curve: 'SRAS', dir: -1 }, { label: 'Supply improves: oil prices fall', curve: 'SRAS', dir: 1 }], [['AD', 'Demand'], ['SRAS', 'Supply']], function (e) { ev = e; var tg = { ad: e && e.curve === 'AD' ? e.dir * 2 : 0, sr: e && e.curve === 'SRAS' ? e.dir * 2 : 0 }, fr = { ad: s.ad, sr: s.sr }; tween(F, 600, function (t) { s.ad = lerp(fr.ad, tg.ad, t); s.sr = lerp(fr.sr, tg.sr, t); draw(); }); });
      KN = knobs(F, c, [], function () { });
      draw = function () {
        k = K(); clearC(c); var wide = c.w >= 560, g = 14; if (wide) { A1.set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); A2.set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { A1.set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); A2.set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); }
        A1.draw(); A2.draw();
        var AD = AD0.shift(s.ad), SR = SR0.shift(s.sr), e0 = equilibrium(AD0, SR0), e1 = equilibrium(AD, SR), up = -SR0.m * s.sr * kap; // SRAS left by d raises P by 6d at each Y ⇒ SRPC up by 6d·κ
        if (s.ad) A1.lin(AD0, k.blue, { dash: [7, 6], w: 2, alpha: 0.7 }); if (s.sr) A1.lin(SR0, k.orange, { dash: [7, 6], w: 2, alpha: 0.7 });
        A1.lin(AD, k.blue); A1.lin(SR, k.orange); A1.name(AD, 'AD', k.blue, 0.88); A1.name(SR, 'SRAS', k.orange, 0.88); A1.vline(Yf, k.green, { w: 2.4 }); A1.nameAt('LRAS', Yf, 152, k.green, 0, 0);
        var u = function (Y) { return un - okun * (Y - Yf); }, pi = function (P) { return pe0 + kap * (P - 100); };
        var S1 = srpc(pe0, 0), S2 = srpc(pe0, up);
        if (M.abs(up) > 0.01) A2.lin(S1, k.orange, { dash: [7, 6], w: 2, alpha: 0.7 }); A2.lin(S2, k.orange); A2.name(S2, M.abs(up) > 0.01 ? 'SRPC' + sub(2) : 'SRPC', k.orange, 0.85); A2.vline(un, k.green, { w: 2.4 }); A2.nameAt('LRPC', un, 11, k.green, 22, 0); A2.hline(0, k.axis, { w: 1 });
        A1.dot(e0.q, e0.p, k.muted, 5.5); A1.label('A', e0.q, e0.p, k.muted, { dx: -12, dy: -12, size: 12 }); A2.dot(u(e0.q), pi(e0.p), k.muted, 5.5); A2.label('A', u(e0.q), pi(e0.p), k.muted, { dx: -12, dy: -12, size: 12 });
        if (s.ad || s.sr) { A1.guide(e1.q, e1.p); A1.dot(e1.q, e1.p, k.ink, 6.5); A1.label('B', e1.q, e1.p, k.ink, { dx: 12, dy: -12, size: 12 }); A2.guide(u(e1.q), pi(e1.p)); A2.dot(u(e1.q), pi(e1.p), k.ink, 6.5); A2.label('B', u(e1.q), pi(e1.p), k.ink, { dx: 12, dy: -12, size: 12 }); }
        T.set(q ? [] : [{ k: 'Unemployment', v: fm(u(e0.q), 2) + '% → ' + fm(u(e1.q), 2) + '%', c: k.ink }, { k: 'Inflation', v: fm(pi(e0.p), 2) + '% → ' + fm(pi(e1.p), 2) + '%', c: k.ink }]);
        F.set(!ev ? 'Point A is the same moment on both graphs: output at potential means unemployment at the natural rate (' + fm(un) + '%) and inflation at the expected ' + fm(pe0) + '%. Pick an event.' : ev.curve === 'AD' ? 'A shift of AD moves the economy <b>along</b> the short-run Phillips curve: ' + (ev.dir > 0 ? 'more output means less unemployment and higher inflation' : 'less output means more unemployment and lower inflation') + '. The short-run tradeoff.' : 'A supply shock <b>shifts</b> the short-run Phillips curve: ' + (ev.dir < 0 ? 'unemployment and inflation both rise (stagflation).' : 'unemployment and inflation both fall.'));
        marksOn(c, A2, o.marks); F.say('An AD–AS graph linked to a Phillips curve graph, with matching points A and B.'); KN.place();
      };
    } else {
      c = F.canvas(function (w) { return hw(w, 1.55, 1.02); }); var Ap = phAxes('');
      var stepsL = [{ pe: pe0, u: un, t: 'Point A: unemployment at the natural rate, inflation as expected.' }, { pe: pe0, u: un - 2, t: 'Policy pushes unemployment below the natural rate: up <b>along</b> the short-run curve to B. Inflation is now above what people expected.' }, { pe: pe0 + 2, u: un - 2, sh: true, t: 'Expectations catch up: people now expect the higher inflation, so the short-run curve <b>shifts up</b>.' }, { pe: pe0 + 2, u: un - 2, t: 'To hold unemployment below the natural rate, inflation must rise again (C).' }, { pe: pe0 + 4, u: un - 2, sh: true, t: 'Expectations catch up again; the curve shifts up again.' }, { pe: pe0 + 4, u: un, t: 'If policy stops pushing, unemployment returns to the natural rate at a higher inflation rate: the long-run Phillips curve is vertical, and the short-run tradeoff is not permanent.' }];
      var si = clamp(num(o.step, 0), 0, stepsL.length - 1), sp = { pe: pe0, u: un }, uDrag = num(o.u, un);
      if (mode === 'long' && F.inter) stepper(F.ctl, stepsL.length, si, function (i) { var fr = { pe: sp.pe, u: sp.u }, tg = stepsL[i]; si = i; tween(F, 600, function (t) { sp.pe = lerp(fr.pe, tg.pe, t); sp.u = lerp(fr.u, tg.u, t); draw(); }); }, function (i) { return q ? 'Step ' + (i + 1) + ' of ' + stepsL.length : stepsL[i].t; });
      if (mode === 'long') { sp.pe = stepsL[si].pe; sp.u = stepsL[si].u; }
      var shortPe = pe0;
      if (mode === 'short' && F.inter) { btn(F.ctl, 'Expected inflation rises', function () { var f0 = shortPe; tween(F, 500, function (t) { shortPe = lerp(f0, f0 + 2, t); draw(); }); }); btn(F.ctl, 'Expected inflation falls', function () { var f0 = shortPe; tween(F, 500, function (t) { shortPe = lerp(f0, f0 - 2, t); draw(); }); }); btn(F.ctl, 'Start over', function () { shortPe = pe0; uDrag = un; draw(); }); }
      KN = knobs(F, c, F.inter && mode === 'short' ? [{ name: 'Point on the short-run Phillips curve', pos: function () { return [Ap.X(uDrag), Ap.Y(srpc(shortPe).P(uDrag))]; }, drag: function (px) { uDrag = clamp(Ap.q(px), 0.5, 9.5); }, key: function (dx, dy, bg) { uDrag = clamp(uDrag + (dx || -dy) * (bg ? 1 : 0.1), 0.5, 9.5); }, text: function () { return fm(uDrag, 1) + '% unemployment, ' + fm(srpc(shortPe).P(uDrag), 1) + '% inflation'; } }] : [], function () { draw(); });
      draw = function () {
        k = K(); clearC(c); Ap.set({ x: 0, y: 0, w: c.w, h: c.h }).draw(); Ap.hline(0, k.axis, { w: 1 });
        Ap.vline(un, k.green, { w: 2.6 }); Ap.nameAt('LRPC', un, 11.2, k.green, 22, 0);
        if (mode === 'short') {
          if (M.abs(shortPe - pe0) > 0.01) Ap.lin(srpc(pe0), k.orange, { dash: [7, 6], w: 2, alpha: 0.7 }); var L = srpc(shortPe); Ap.lin(L, k.orange); Ap.name(L, 'SRPC', k.orange, 0.85);
          var pp = L.P(uDrag); Ap.guide(uDrag, pp); Ap.knob(uDrag, pp, k.orange, 7.5);
          T.set(q ? [] : [{ k: 'Unemployment', v: fm(uDrag, 1) + '%', c: k.ink }, { k: 'Inflation', v: fm(pp, 1) + '%', c: k.ink }, { k: 'Expected inflation', v: fm(shortPe, 1) + '%', c: k.orange }]);
          F.set('Moving the point is a movement <b>along</b> the short-run Phillips curve: lower unemployment comes with higher inflation. A change in expected inflation (or a supply shock) <b>shifts</b> the whole curve. At the natural rate of unemployment, inflation equals expected inflation.');
        } else {
          var seen = []; for (var j = 0; j <= si; j++) if (seen.indexOf(stepsL[j].pe) < 0) seen.push(stepsL[j].pe);
          seen.forEach(function (pe, i) { var cur = M.abs(pe - sp.pe) < 0.01; Ap.lin(srpc(pe), k.orange, cur ? {} : { dash: [7, 6], w: 2, alpha: 0.6 }); Ap.name(srpc(pe), 'SRPC' + sub(i + 1), k.orange, 0.9); });
          if (seen.indexOf(sp.pe) < 0) Ap.lin(srpc(sp.pe), k.orange);
          var lbl = 'ABCDEF', path = []; for (j = 0; j <= si; j++) { var st = stepsL[j]; if (j && st.sh) continue; path.push([st.u, srpc(st.pe).P(st.u)]); }
          path.forEach(function (p, i) { Ap.dot(p[0], p[1], i === path.length - 1 ? k.ink : k.muted, i === path.length - 1 ? 6.5 : 5); Ap.label(lbl[i], p[0], p[1], k.ink, { dx: -12, dy: -12, size: 12 }); });
          var cu = sp.u, cp = srpc(sp.pe).P(sp.u); Ap.knob(cu, cp, k.ink, 6);
          T.set(q ? [] : [{ k: 'Unemployment', v: fm(cu, 1) + '%', c: k.ink }, { k: 'Inflation', v: fm(cp, 1) + '%', c: k.ink }, { k: 'Expected inflation', v: fm(sp.pe, 1) + '%', c: k.orange }]);
          F.set(stepsL[si].t);
        }
        marksOn(c, Ap, o.marks); F.say('A Phillips curve graph: inflation against unemployment, with a short-run curve and a vertical long-run curve at ' + fm(un) + ' percent.'); KN.place();
      };
    }
    F.redraw(function () { draw(); }); draw();
    return { draw: function () { draw(); } };
  });

  /* ec-forex: the market for dollars and, mirrored, the market for euros */
  V.register('ec-forex', function (el, o) {
    o = opt(o, { pair: ['dollar', 'euro'], mirror: true, nx: false });
    var F = frame(el, o, 'The foreign exchange market'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var P = o.pair, s1 = P[0] === 'dollar' ? '$' : P[0].charAt(0).toUpperCase(), s2 = P[1] === 'euro' ? '€' : P[1].charAt(0).toUpperCase();
    // dollars per day: demand Q = 220 − 200·e, supply Q = −140 + 200·e, at e euros per dollar (equilibrium 0.90)
    var e0r = num(o.rate, 0.9), dA = 220 + (e0r - 0.9) * 200, sC = -140 - (e0r - 0.9) * 200, sh = [0, 0], ev = null, amt = 100;
    var Dd = function (e, d) { return dA + d - 200 * e; }, Sd = function (e, d) { return sC + d + 200 * e; };
    var mir = o.mirror !== false, c = F.canvas(function (w) { return mir ? (w >= 560 ? w / 2.05 : w * 1.62) : hw(w, 1.55, 1.02); });
    var A1 = axes(c, { xmax: 80, ymin: 0.5, ymax: 1.4, xLabel: 'Quantity of ' + P[0] + 's', yLabel: s2 + ' per ' + s1, title: 'Market for ' + P[0] + 's', yfmt: function (v) { return fm(v, 2); } }), A2 = mir ? axes(c, { xmax: 80, ymin: 0.7, ymax: 1.4, xLabel: 'Quantity of ' + P[1] + 's', yLabel: s1 + ' per ' + s2, title: 'Market for ' + P[1] + 's', yfmt: function (v) { return fm(v, 2); } }) : null;
    var EV = o.events || [
      { label: 'U.S. real interest rates rise', d: [20, 0], why: 'Foreign savers want U.S. assets, so they demand more dollars' },
      { label: 'Incomes in Europe rise', d: [20, 0], why: 'Europeans buy more U.S. goods, so they demand more dollars' },
      { label: 'U.S. inflation rises faster than Europe’s', d: [-15, 15], why: 'U.S. goods get pricier: Europeans want fewer dollars and Americans supply more dollars to buy European goods' },
      { label: 'Americans want more European goods', d: [0, 20], why: 'Americans supply dollars to buy euros' },
      { label: 'The Fed buys dollars with its euros', d: [20, 0], why: 'The central bank adds to the demand for dollars' }];
    if (F.inter) { var gE = group(F.ctl, 'Events'), bs = []; EV.forEach(function (e, i) { var b = btn(gE, e.label, function () { ev = ev === e ? null : e; bs.forEach(function (x, j) { x.setAttribute('aria-pressed', String(EV[j] === ev)); }); var tg = ev ? ev.d : [0, 0], fr = sh.slice(); tween(F, 600, function (t) { sh = [lerp(fr[0], tg[0], t), lerp(fr[1], tg[1], t)]; draw(); }); }, 'ecv-ev'); b.setAttribute('aria-pressed', 'false'); bs.push(b); }); var conv = mk('label', 'ecv-num', '<span>Convert</span>'); var ci = D.createElement('input'); ci.type = 'number'; ci.value = amt; ci.min = 0; ci.setAttribute('aria-label', 'Amount in ' + P[0] + 's'); conv.appendChild(ci); conv.appendChild(mk('span', '', P[0] + 's')); F.ctl.appendChild(conv); ci.addEventListener('input', function () { var v = parseFloat(ci.value); if (isFinite(v)) { amt = v; draw(); } }); }
    var KN = knobs(F, c, [], function () { });
    function eq(d1, d2) { var e = (dA + d1 - sC - d2) / 400; return { e: e, q: Dd(e, d1) }; }
    function draw() {
      k = K(); clearC(c); var g = 14;
      if (mir) { if (c.w >= 560) { A1.set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); A2.set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { A1.set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); A2.set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); } A2.draw(); } else A1.set({ x: 0, y: 0, w: c.w, h: c.h });
      A1.draw();
      var E0 = eq(0, 0), E1 = eq(sh[0], sh[1]), y0 = A1.ymin, y1 = A1.ymax;
      var cv = function (A, fq, col, so, nm, at) { A.par(fq, function (t) { return t; }, A.ymin, A.ymax, col, so); var t = A.ymin + (A.ymax - A.ymin) * at; if (nm) A.nameAt(nm, fq(t), t, col, 22, 0); };
      if (sh[0]) cv(A1, function (e) { return Dd(e, 0); }, k.blue, { dash: [7, 6], w: 2, alpha: 0.7 }); if (sh[1]) cv(A1, function (e) { return Sd(e, 0); }, k.orange, { dash: [7, 6], w: 2, alpha: 0.7 });
      cv(A1, function (e) { return Dd(e, sh[0]); }, k.blue, {}, 'D for ' + s1, 0.12); cv(A1, function (e) { return Sd(e, sh[1]); }, k.orange, {}, 'S of ' + s1, 0.9);
      if (sh[0] || sh[1]) { A1.guide(E0.q, E0.e, k.muted); A1.dot(E0.q, E0.e, k.muted, 5); } A1.guide(E1.q, E1.e); A1.dot(E1.q, E1.e, k.ink, 6); if (!q) A1.tagY(E1.e, fm(E1.e, 3), k.ink);
      if (mir) { // the mirror: demand for euros = supply of dollars converted, and the other way around (x = 1/e)
        var De = function (x, d) { return Sd(1 / x, d) / x; }, Se = function (x, d) { return Dd(1 / x, d) / x; };
        if (sh[1]) cv(A2, function (x) { return De(x, 0); }, k.blue, { dash: [7, 6], w: 2, alpha: 0.7 }); if (sh[0]) cv(A2, function (x) { return Se(x, 0); }, k.orange, { dash: [7, 6], w: 2, alpha: 0.7 });
        cv(A2, function (x) { return De(x, sh[1]); }, k.blue, {}, 'D for ' + s2, 0.12); cv(A2, function (x) { return Se(x, sh[0]); }, k.orange, {}, 'S of ' + s2, 0.9);
        var x0 = 1 / E0.e, x1 = 1 / E1.e; if (sh[0] || sh[1]) { A2.guide(E0.q * E0.e, x0, k.muted); A2.dot(E0.q * E0.e, x0, k.muted, 5); } A2.guide(E1.q * E1.e, x1); A2.dot(E1.q * E1.e, x1, k.ink, 6); if (!q) A2.tagY(x1, fm(x1, 3), k.ink);
      }
      var ch = E1.e / E0.e - 1, tl = [{ k: 'Exchange rate', v: fm(E1.e, 3) + ' ' + s2 + ' per ' + s1, c: k.ink }, { k: 'Price of 1 ' + s2, v: fm(1 / E1.e, 3) + ' ' + s1 + ' per ' + s2, c: k.ink }];
      if (M.abs(ch) > 1e-6) tl.push({ k: 'The ' + P[0], v: (ch > 0 ? 'appreciated ' : 'depreciated ') + pct(M.abs(ch), 1), c: ch > 0 ? k.green : k.red, hi: true }, { k: 'The ' + P[1], v: (ch < 0 ? 'appreciated ' : 'depreciated ') + pct(M.abs(E0.e / E1.e - 1), 1), c: ch < 0 ? k.green : k.red });
      tl.push({ k: fm(amt) + ' ' + P[0] + 's buy', v: fm(amt * E1.e, 2) + ' ' + P[1] + 's', c: k.blue });
      T.set(q ? [] : tl);
      var txt = 'Always read the units: ' + fm(E1.e, 3) + ' ' + P[1] + 's per ' + P[0] + '. A higher number means each ' + P[0] + ' buys more ' + P[1] + 's: the ' + P[0] + ' has <b>appreciated</b>. The euro market is the mirror image: demand for ' + P[0] + 's is supply of ' + P[1] + 's, and the two prices are reciprocals.';
      if (ev) txt = '<b>' + ev.label + '.</b> ' + ev.why + '. ' + (ch > 0 ? 'The ' + P[0] + ' appreciates and the ' + P[1] + ' depreciates.' : 'The ' + P[0] + ' depreciates and the ' + P[1] + ' appreciates.') + (o.nx ? ' ' + (ch > 0 ? 'A stronger dollar makes U.S. exports pricier abroad and imports cheaper here: net exports fall, and AD shifts left.' : 'A weaker dollar makes U.S. exports cheaper abroad: net exports rise, and AD shifts right.') : '');
      F.set(txt); marksOn(c, A1, o.marks); F.say('The market for ' + P[0] + 's' + (mir ? ' and the mirror market for ' + P[1] + 's.' : '.')); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  function icDraw(A, Ut, u, col, so) { // one indifference curve (or isoquant) at level u
    if (Ut.type === 'complements') { var cr = Ut.corner(u); A.seg(cr[0], cr[1], cr[0], A.ymax * 2, col, so); A.seg(cr[0], cr[1], A.xmax * 2, cr[1], col, so); return; }
    A.fn(function (x) { var y = Ut.y(u, x); return y >= 0 ? y : NaN; }, col, opt(so || {}, { from: 1e-3, n: 260 }));
  }
  function mrsText(m) { return !isFinite(m) ? 'very large' : isNaN(m) ? 'not defined (kink)' : fm(m, 3); }

  /* ec-choice: budget lines, indifference curves and the best affordable bundle */
  V.register('ec-choice', function (el, o) {
    o = opt(o, { income: 100, prices: [5, 10], utility: { type: 'cobbdouglas', a: 0.5, b: 0.5 }, mode: 'goods' });
    var mode = o.mode, F = frame(el, o, 'Consumer choice'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var Ut = utility(o.utility), I = num(o.income, 100), p1 = num(o.prices[0], 5), p2 = num(o.prices[1], 10), ch = o.change || null, chOn = !!ch, ration = o.ration != null ? num(o.ration, 0) : null, tx = o.tax || null;
    var Tt = num(o.hours, 24), N = num(o.nonlabor, 20), wage = num(o.wage, 10), en = o.endowment || [50, 50], rate = num(o.rate, 0.1);
    var names = mode === 'labor' ? ['Leisure (hours)', 'Consumption ($)'] : mode === 'intertemporal' ? ['Consumption now', 'Consumption later'] : o.goods || ['Good X', 'Good Y'];
    var off = o.offer, two = !!off, budgetOnly = !!o.budgetOnly;
    function cur() { // the active budget: { p1, p2, I, top(x), xmax, kink }
      if (mode === 'labor') return { top: function (l) { return l > Tt ? -1 : wage * (Tt - l) + N; }, xmax: Tt, p1: wage, p2: 1, I: wage * Tt + N };
      if (mode === 'intertemporal') { var m1 = num(en[0], 50), m2 = num(en[1], 50), W0 = m1 + m2 / (1 + rate); return { top: function (c1) { return m2 + (1 + rate) * (m1 - c1); }, xmax: W0, p1: 1 + rate, p2: 1, I: m2 + (1 + rate) * m1 }; }
      var P1 = chOn && ch && ch.p1 != null ? num(ch.p1, p1) : p1, P2 = chOn && ch && ch.p2 != null ? num(ch.p2, p2) : p2, II = chOn && ch && ch.income != null ? num(ch.income, I) : I;
      return budgetFor(P1, P2, II);
    }
    function budgetFor(P1, P2, II) {
      var t = tx ? num(tx.t, 0) : 0, ab = tx ? num(tx.above, 0) : 0;
      var cost = function (x) { return x <= ab ? P1 * x : P1 * ab + (P1 + t) * (x - ab); };
      var xm = ab ? (II <= P1 * ab ? II / P1 : ab + (II - P1 * ab) / (P1 + t)) : II / (P1 + t);
      if (ration != null) xm = M.min(xm, ration);
      return { top: function (x) { return x > xm + 1e-9 ? -1 : (II - cost(x)) / P2; }, xmax: xm, p1: P1, p2: P2, I: II };
    }
    var B0 = cur(), opt0 = bestOn(Ut, B0.top, B0.xmax);
    var bundle = o.bundle ? [num(o.bundle[0], 1), num(o.bundle[1], 1)] : budgetOnly ? [B0.xmax * 0.3, B0.top(0) * 0.4] : (mode === 'revealed' ? null : [opt0[0] * 0.6, M.max(0.5, opt0[1] * 0.8)]);
    var rvB = mode === 'revealed' ? (o.budgets || [{ p: [2, 4], I: 40 }, { p: [4, 2], I: 40 }]) : [];
    var xM = num(o.xMax, niceCeil(M.max(B0.xmax, mode === 'goods' && !o.offer ? I / p1 : 0, M.max.apply(null, [0].concat(rvB.map(function (b) { return b.I / b.p[0]; }))), mode === 'labor' ? Tt : 0, ch && ch.p1 ? I / num(ch.p1, p1) : 0, ch && ch.income ? num(ch.income, I) / p1 : 0) * 1.12)), yM = num(o.yMax, niceCeil(M.max(B0.top(0), mode === 'goods' && !o.offer ? I / p2 : 0, M.max.apply(null, [0].concat(rvB.map(function (b) { return b.I / b.p[1]; }))), ch && ch.p2 ? I / num(ch.p2, p2) : 0, ch && ch.income ? num(ch.income, I) / p2 : 0, mode === 'intertemporal' ? B0.top(0) : 0) * 1.12));
    var c = F.canvas(function (w) { return two ? (w >= 560 ? w / 1.05 : w * 1.5) : hw(w, 1.4, 1.0); }), A = axes(c, { xmax: xM, ymax: yM, xLabel: names[0], yLabel: names[1] }), A2 = null;
    var offP = off === 'price' ? p1 : I;
    if (two) A2 = axes(c, off === 'price' ? { xmax: xM, ymax: niceCeil(p1 * 2.2), xLabel: names[0], yLabel: 'Price of ' + names[0].toLowerCase(), title: 'Demand curve' } : { xmax: xM, ymax: niceCeil(I * 2.2), xLabel: names[0], yLabel: 'Income', title: 'Engel curve' });
    if (F.inter) {
      if (mode === 'labor') V.slider(F.ctl, { label: 'Wage per hour', min: 1, max: 30, step: 0.5, value: wage, fmt: function (v) { return money(v, 2); }, input: function (v) { wage = v; draw(); } });
      else if (mode === 'intertemporal') V.slider(F.ctl, { label: 'Interest rate', min: 0, max: 0.5, step: 0.01, value: rate, fmt: function (v) { return pct(v, 0); }, input: function (v) { rate = v; draw(); } });
      else if (two) V.slider(F.ctl, { label: off === 'price' ? 'Price of ' + names[0].toLowerCase() : 'Income', min: off === 'price' ? p1 * 0.3 : I * 0.2, max: off === 'price' ? p1 * 2 : I * 2, step: off === 'price' ? 0.1 : 1, value: offP, fmt: function (v) { return money(v, 2); }, input: function (v) { offP = v; if (off === 'price') p1 = v; else I = v; draw(); } });
      else if (mode !== 'revealed') { if (ch) toggle(F.ctl, 'Show the change', chOn, function (v) { chOn = v; draw(); }); else { V.slider(F.ctl, { label: 'Price of ' + names[0].toLowerCase(), min: 0.5, max: p1 * 3, step: 0.5, value: p1, fmt: function (v) { return money(v, 2); }, input: function (v) { p1 = v; draw(); } }); V.slider(F.ctl, { label: 'Income', min: I * 0.2, max: I * 2, step: 1, value: I, fmt: function (v) { return money(v); }, input: function (v) { I = v; draw(); } }); } }
    }
    var rv = o.budgets || [{ p: [2, 4], I: 40 }, { p: [4, 2], I: 40 }], rc = (o.choices || [[16, 2], [2, 16]]).map(function (b) { return [num(b[0], 1), num(b[1], 1)]; });
    var KN = knobs(F, c, F.inter ? (mode === 'revealed' ? [0, 1].map(function (i) { return { name: 'Chosen bundle on budget ' + (i + 1), pos: function () { return [A.X(rc[i][0]), A.Y(rc[i][1])]; }, drag: function (px) { var b = rv[i], x = clamp(A.q(px), 0, b.I / b.p[0]); rc[i] = [x, (b.I - b.p[0] * x) / b.p[1]]; }, key: function (dx, dy, bg) { var b = rv[i], x = clamp(rc[i][0] + (dx || -dy) * (bg ? 2 : 0.5), 0, b.I / b.p[0]); rc[i] = [x, (b.I - b.p[0] * x) / b.p[1]]; }, text: function () { return fm(rc[i][0], 2) + ', ' + fm(rc[i][1], 2); } }; }) : bundle ? [{ name: 'Bundle', pos: function () { return [A.X(bundle[0]), A.Y(bundle[1])]; }, drag: function (px, py) { bundle = [clamp(A.q(px), 0.05, xM), clamp(A.p(py), 0.05, yM)]; }, key: function (dx, dy, bg) { var st = niceStep(xM, 40) * (bg ? 5 : 1); bundle = [clamp(bundle[0] + dx * st, 0.05, xM), clamp(bundle[1] + dy * st, 0.05, yM)]; }, text: function () { return fm(bundle[0], 2) + ' and ' + fm(bundle[1], 2); } }] : []) : [], function () { draw(); });
    function budgetLine(Ac, Bd, col, so) { var pts = []; for (var i = 0; i <= 120; i++) { var x = Bd.xmax * i / 120, y = Bd.top(x); if (y >= -1e-9) pts.push([x, y]); } Ac.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = (so && so.w) || 3; ctx.setLineDash((so && so.dash) || []); ctx.globalAlpha = (so && so.alpha) || 1; ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](Ac.X(p[0]), Ac.Y(p[1])); }); if (ration != null && Bd.xmax < Bd.I / Bd.p1 - 1e-9) ctx.lineTo(Ac.X(Bd.xmax), Ac.Y(0)); ctx.stroke(); ctx.restore(); }); return pts; }
    function draw() {
      k = K(); clearC(c); var g = 14; if (two) { var h1 = (c.h - g) * 0.58; A.set({ x: 0, y: 0, w: c.w, h: h1 }); A2.set({ x: 0, y: h1 + g, w: c.w, h: c.h - h1 - g }); } else A.set({ x: 0, y: 0, w: c.w, h: c.h });
      var Bd = cur(), tl = [], txt = '';
      if (mode !== 'revealed') { var pts = budgetLine(A, Bd, k.green, { w: 0.01 }); A.poly([[0, 0]].concat(pts).concat([[pts[pts.length - 1][0], 0]]), rgba(k.green, 0.08)); }
      A.draw();
      if (mode === 'revealed') return drawRevealed();
      if (ch && chOn) budgetLine(A, budgetFor(p1, p2, I), k.green, { w: 2, dash: [7, 6], alpha: 0.7 });
      budgetLine(A, Bd, k.green);
      if (mode === 'labor') { A.vline(Tt, k.muted, { w: 1.2, dash: [4, 4] }); A.nameAt('All ' + fm(Tt) + ' hours', Tt, yM * 0.9, k.muted, -40, 0); }
      if (mode === 'intertemporal') { A.dot(num(en[0], 50), num(en[1], 50), k.gold, 6); A.label('Endowment', num(en[0], 50), num(en[1], 50), k.gold, { dx: 10, dy: 14, align: 'left', size: 11 }); }
      var best = bestOn(Ut, Bd.top, Bd.xmax), ub = best[2];
      if (!budgetOnly) {
        var lv = o.levels || [ub * 0.6, ub, ub * 1.45];
        lv.forEach(function (u, i) { icDraw(A, Ut, u, k.purple, { w: M.abs(u - ub) < 1e-9 * M.max(1, M.abs(ub)) ? 2.8 : 1.8, alpha: M.abs(u - ub) < 1e-9 * M.max(1, M.abs(ub)) ? 1 : 0.55 }); });
        if (!q) { A.dot(best[0], best[1], k.ink, 6.5); A.label('Best affordable', best[0], best[1], k.ink, { dx: 12, dy: -14, align: 'left', size: 11 }); A.guide(best[0], best[1]); }
      }
      if (!q || budgetOnly) { var x0 = Bd.xmax, y0 = Bd.top(0); A.tagX(x0, fm(x0, 2), k.green); A.tagY(y0, fm(y0, 2), k.green); }
      if (bundle) {
        var cost = Bd.p1 * bundle[0] + Bd.p2 * bundle[1], yTop = Bd.top(bundle[0]), aff = bundle[0] <= Bd.xmax + 1e-9 && bundle[1] <= yTop + Bd.I * 0.004, exact = aff && M.abs(bundle[1] - yTop) <= M.max(0.004 * yM, 1e-6);
        if (!budgetOnly && !q) icDraw(A, Ut, Ut.f(bundle[0], bundle[1]), k.gold, { w: 1.6, dash: [5, 4] });
        A.knob(bundle[0], bundle[1], aff ? k.blue : k.red, 7.5);
        var status = exact ? 'exactly spends the budget' : aff ? 'affordable, with money left over' : 'unaffordable';
        if (!q) A.label(exact ? 'On the line' : aff ? 'Affordable' : 'Unaffordable', bundle[0], bundle[1], aff ? k.blue : k.red, { dx: 12, dy: 15, align: 'left', size: 11 });
        if (!q) {
          tl.push({ k: 'Bundle', v: fm(bundle[0], 2) + ', ' + fm(bundle[1], 2), c: k.blue }, { k: 'It is', v: status, c: aff ? k.blue : k.red });
          if (!budgetOnly) { var m = Ut.mrs(bundle[0], bundle[1]), pr = Bd.p1 / Bd.p2; tl.push({ k: 'MRS (= MUx ÷ MUy)', v: mrsText(m), c: k.purple }, { k: 'Price ratio p₁ ÷ p₂', v: fm(pr, 3), c: k.green }, { k: 'Utility', v: fm(Ut.f(bundle[0], bundle[1]), 3), c: k.gold });
            txt = isNaN(m) ? 'At the kink of an L-shaped indifference curve the MRS is not defined: the best bundle sits at the kink, where tangency does not apply.' : M.abs(m - pr) < 0.01 * pr ? 'MRS equals the price ratio here: the rate at which you are willing to trade equals the rate the market allows.' : m > pr ? 'MRS is greater than the price ratio: one more unit of ' + names[0].toLowerCase() + ' is worth more to you (in ' + names[1].toLowerCase() + ') than it costs, so moving along the budget toward <b>more ' + names[0].toLowerCase() + '</b> raises utility.' : 'MRS is less than the price ratio: ' + names[0].toLowerCase() + ' is worth less to you than it costs, so moving toward <b>more ' + names[1].toLowerCase() + '</b> raises utility.'; }
        }
      }
      if (budgetOnly && !q) { txt = 'Budget line: ' + fm(Bd.p1, 2) + 'x + ' + fm(Bd.p2, 2) + 'y = ' + fm(Bd.I, 2) + '. Intercepts: all on ' + names[0].toLowerCase() + ' buys ' + fm(Bd.I / Bd.p1, 2) + '; all on ' + names[1].toLowerCase() + ' buys ' + fm(Bd.I / Bd.p2, 2) + '. Slope = −p₁ ÷ p₂ = −' + fm(Bd.p1 / Bd.p2, 3) + '. ' + (ch ? 'A change in one price rotates the line around the other intercept; a change in income shifts it in parallel.' : ''); tl.push({ k: 'Slope', v: '−' + fm(Bd.p1 / Bd.p2, 3), c: k.green }); }
      marksOn(c, A, o.marks);
      if (!q && !budgetOnly) {
        tl.unshift({ k: 'Best bundle', v: fm(best[0], 2) + ', ' + fm(best[1], 2), c: k.ink, hi: true });
        if (mode === 'labor') { tl.push({ k: 'Hours worked', v: fm(Tt - best[0], 2), c: k.ink }); txt = 'Leisure on the horizontal axis: every hour not worked costs the wage. A higher wage makes leisure more expensive (substitution effect: work more) but also makes you richer (income effect: buy more leisure, work less). Here you work ' + fm(Tt - best[0], 2) + ' hours.'; }
        if (mode === 'intertemporal') { tl.push({ k: best[0] < num(en[0], 50) ? 'Saves now' : 'Borrows now', v: money(M.abs(num(en[0], 50) - best[0]), 2), c: k.ink }); txt = 'The budget line rotates around the endowment as the interest rate changes: you can always consume exactly what you have in each period. A higher rate makes consumption now more expensive (a substitution effect toward saving); for a saver it also adds income.'; }
        if (ch && chOn) txt = (ch.income != null && ch.p1 == null && ch.p2 == null ? 'Income changed, so the budget line shifted in <b>parallel</b> (same slope). ' : 'A price changed, so the budget line <b>rotated</b> around the other intercept. ') + txt;
      }
      if (two) drawOffer(Bd);
      T.set(tl); F.set(txt + (Ut.type === 'substitutes' && !budgetOnly ? ' For perfect substitutes the best bundle is usually a corner: spend everything on the good with more utility per dollar.' : ''));
      F.say((budgetOnly ? 'A budget line' : 'A budget line with indifference curves') + ' for ' + names[0] + ' and ' + names[1] + '.'); KN.place();
    }
    function drawOffer(Bd) {
      A2.draw(); var vals = [], lo = off === 'price' ? num(o.prices[0], 5) * 0.3 : num(o.income, 100) * 0.2, hi = off === 'price' ? num(o.prices[0], 5) * 2 : num(o.income, 100) * 2;
      for (var i = 0; i <= 50; i++) { var v = lo + (hi - lo) * i / 50, b = off === 'price' ? budgetFor(v, p2, I) : budgetFor(p1, p2, v), bb = bestOn(Ut, b.top, b.xmax); vals.push([v, bb[0], bb[1]]); }
      A.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.4; ctx.setLineDash([2, 4]); ctx.beginPath(); vals.forEach(function (r, j) { ctx[j ? 'lineTo' : 'moveTo'](A.X(r[1]), A.Y(r[2])); }); ctx.stroke(); ctx.restore(); });
      A.nameAt(off === 'price' ? 'Price offer curve' : 'Income offer curve', vals[40][1], vals[40][2], k.gold, 10, -14);
      A2.clip(function () { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = off === 'price' ? k.blue : k.gold; ctx.lineWidth = 2.8; ctx.beginPath(); vals.forEach(function (r, j) { ctx[j ? 'lineTo' : 'moveTo'](A2.X(r[1]), A2.Y(r[0])); }); ctx.stroke(); ctx.restore(); });
      var b0 = bestOn(Ut, Bd.top, Bd.xmax); A2.dot(b0[0], off === 'price' ? p1 : I, k.ink, 6); A2.guide(b0[0], off === 'price' ? p1 : I);
    }
    function drawRevealed() {
      var cols = [k.blue, k.orange], bad = false;
      rv.forEach(function (b, i) { A.seg(0, b.I / b.p[1], b.I / b.p[0], 0, cols[i], { w: 2.8 }); A.nameAt('Budget ' + (i + 1), b.I / b.p[0] * 0.92, b.I / b.p[1] * 0.08, cols[i], 6, -14); A.knob(rc[i][0], rc[i][1], cols[i], 7.5); A.label('Choice ' + 'AB'[i], rc[i][0], rc[i][1], cols[i], { dx: 12, dy: -14, align: 'left', size: 11 }); });
      var costB1 = rv[0].p[0] * rc[1][0] + rv[0].p[1] * rc[1][1], costA2 = rv[1].p[0] * rc[0][0] + rv[1].p[1] * rc[0][1], diff = M.abs(rc[0][0] - rc[1][0]) + M.abs(rc[0][1] - rc[1][1]) > 1e-6;
      bad = diff && costB1 <= rv[0].I + 1e-9 && costA2 <= rv[1].I + 1e-9;
      T.set(q ? [] : [{ k: 'B affordable on budget 1?', v: costB1 <= rv[0].I + 1e-9 ? 'yes' : 'no', c: k.blue }, { k: 'A affordable on budget 2?', v: costA2 <= rv[1].I + 1e-9 ? 'yes' : 'no', c: k.orange }, { k: 'Weak axiom', v: bad ? 'violated' : 'satisfied', c: bad ? k.red : k.green, hi: true }]);
      F.set('If A was chosen when B was affordable, A is revealed preferred to B. The weak axiom says B must then never be chosen when A is affordable. ' + (q ? '' : bad ? 'Here both are true at once: the choices are <b>inconsistent</b>.' : 'These choices are consistent.'));
      F.say('Two budget lines with a chosen bundle on each.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  var SLUT = { normal: { utility: { type: 'cobbdouglas', a: 0.5, b: 0.5 }, income: 100, prices: [5, 10], newP1: 2.5, goods: ['Good X', 'Good Y'] },
    inferior: { utility: { type: 'giffen', alpha: 1, beta: 2, g1: 2, g2: 10 }, income: 8, prices: [1.2, 1], newP1: 1, goods: ['Good X (inferior)', 'Good Y'] },
    giffen: { utility: { type: 'giffen', alpha: 1, beta: 2, g1: 2, g2: 10 }, income: 11, prices: [1.2, 1], newP1: 1, goods: ['Good X (Giffen)', 'Good Y'] } };
  /* ec-slutsky: a price change split into substitution and income effects; CV and EV */
  V.register('ec-slutsky', function (el, o) {
    var pr = SLUT[o.preset] || SLUT.normal; o = opt(o, { utility: pr.utility, income: pr.income, prices: pr.prices, newP1: pr.newP1, method: 'slutsky', goods: pr.goods });
    var F = frame(el, o, 'Substitution and income effects'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var Ut = utility(o.utility), I = num(o.income, 100), p1 = num(o.prices[0], 5), p2 = o.cv ? 1 : num(o.prices[1], 10), np = num(o.newP1, p1 / 2), meth = o.method === 'hicks' ? 'hicks' : 'slutsky', G = o.goods;
    var xM = num(o.xMax, niceCeil(M.max(I / p1, I / np) * 1.08)), yM = num(o.yMax, niceCeil(I / p2 * 1.12));
    if (Ut.type === 'giffen') { xM = num(o.xMax, 12); yM = num(o.yMax, 12); }
    var c = F.canvas(function (w) { return hw(w, 1.35, 0.95); }), A = axes(c, { xmax: xM, ymax: yM, xLabel: G[0], yLabel: G[1] });
    if (F.inter) { V.seg(F.ctl, { label: 'Compensation', items: [['slutsky', 'Slutsky (old bundle affordable)'], ['hicks', 'Hicks (old utility)']], value: meth, change: function (v) { meth = v; draw(); } }); if (!o.preset) V.slider(F.ctl, { label: 'New price of ' + G[0].toLowerCase(), min: p1 * 0.3, max: p1 * 2, step: 0.1, value: np, fmt: function (v) { return money(v, 2); }, input: function (v) { np = v; draw(); } }); }
    var KN = knobs(F, c, [], function () { });
    function line2(P1, II, col, so) { A.seg(0, II / p2, II / P1, 0, col, so); }
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
      var a = demand(Ut, p1, p2, I), cc = demand(Ut, np, p2, I), Ic = meth === 'slutsky' ? np * a[0] + p2 * a[1] : expend(Ut, np, p2, a[2]), b = demand(Ut, np, p2, Ic);
      line2(p1, I, k.green, { w: 2.6 }); line2(np, I, k.green, { w: 2.6, dash: [2, 0] }); line2(np, Ic, k.teal, { w: 2, dash: [7, 5] });
      icDraw(A, Ut, a[2], k.purple, { w: 2 }); icDraw(A, Ut, cc[2], k.purple, { w: 2, alpha: 0.6 }); if (meth === 'slutsky') icDraw(A, Ut, b[2], k.purple, { w: 1.4, dash: [4, 4], alpha: 0.6 });
      [[a, 'A'], [b, 'B'], [cc, 'C']].forEach(function (p) { A.dot(p[0][0], p[0][1], k.ink, 6); A.label(p[1], p[0][0], p[0][1], k.ink, { dx: 12, dy: -13, size: 12 }); A.vline(p[0][0], k.muted, { w: 1, dash: [3, 4], to: p[0][1] }); });
      var se = b[0] - a[0], ie = cc[0] - b[0], yb = yM * 0.05;
      if (!q) { if (M.abs(se) > 1e-3) A.arrow(a[0], yb * 1.6, b[0], yb * 1.6, k.blue, 2.6); if (M.abs(ie) > 1e-3) A.arrow(b[0], yb * 0.6, cc[0], yb * 0.6, k.orange, 2.6); A.label('Substitution', (a[0] + b[0]) / 2, yb * 1.6, k.blue, { dy: -12, size: 10.5 }); A.label('Income', (b[0] + cc[0]) / 2, yb * 0.6, k.orange, { dy: -12, size: 10.5 }); }
      var tl = [{ k: 'Substitution effect A→B', v: (se >= 0 ? '+' : '') + fm(se, 3), c: k.blue }, { k: 'Income effect B→C', v: (ie >= 0 ? '+' : '') + fm(ie, 3), c: k.orange }, { k: 'Total A→C', v: (cc[0] - a[0] >= 0 ? '+' : '') + fm(cc[0] - a[0], 3), c: k.ink, hi: true }];
      if (o.cv) { var cv = expend(Ut, np, p2, a[2]) - I, ev = expend(Ut, p1, p2, cc[2]) - I, dcs = 0, n = 200; for (var i = 0; i < n; i++) { var pp = np + (p1 - np) * (i + 0.5) / n; dcs += demand(Ut, pp, p2, I)[0] * (p1 - np) / n; }
        line2(p1, I + ev, k.gold, { w: 1.6, dash: [3, 3] }); if (!q) { A.seg(0.15, I / p2, 0.15, (I + ev) / p2, k.gold, { w: 4 }); A.seg(0.45, I / p2, 0.45, (I + cv) / p2, k.pink, { w: 4 }); }
        tl.push({ k: 'Compensating variation', v: money(-cv, 2), c: k.pink }, { k: 'Equivalent variation', v: money(ev, 2), c: k.gold }, { k: 'Change in consumer surplus', v: money(dcs, 2), c: k.blue }); }
      T.set(q ? [] : tl);
      var fall = np < p1, sTxt = 'The substitution effect (A→B) always goes against the price change: ' + (fall ? 'cheaper' : 'pricier') + ' ' + G[0].toLowerCase() + ', so ' + (fall ? 'more' : 'less') + ' of it at the same level of well-being. ';
      var iTxt = ie * (fall ? 1 : -1) >= 0 ? 'The income effect (B→C) goes the same way: a normal good.' : M.abs(ie) > M.abs(se) ? 'The income effect goes the other way and is <b>bigger</b>: the quantity moves with the price. A Giffen good.' : 'The income effect goes the other way (an inferior good), but it is smaller, so demand still slopes down.';
      F.set(sTxt + (q ? '' : iTxt) + (meth === 'hicks' ? ' Hicks compensation keeps the old utility (the dashed line is tangent to the first indifference curve).' : ' Slutsky compensation gives just enough income to buy the old bundle A at the new prices.') + (o.cv && !q ? ' With income effects, compensating variation, equivalent variation and the change in consumer surplus differ.' : ''));
      F.say('Budget lines and indifference curves showing the substitution effect from A to B and the income effect from B to C.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-isoquant: isoquants, isocost lines, the cost-minimizing bundle, returns to scale and the expansion path */
  V.register('ec-isoquant', function (el, o) {
    o = opt(o, { f: { type: 'cobbdouglas', A: 1, alpha: 0.5, beta: 0.5 }, w: 20, r: 10, q: 10, ray: true, path: true });
    var F = frame(el, o, 'Isoquants and isocost lines'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var f = o.f, ty = f.type || 'cobbdouglas', Af = num(f.A, 1), al = num(f.alpha, 0.5), be = num(f.beta, 0.5), fa = num(f.a, 1), fb = num(f.b, 1), w = num(o.w, 20), r = num(o.r, 10), qq = num(o.q, 10);
    // as a "utility" in (L, K): L across, K up. Cobb-Douglas Q = A·K^α·L^β
    var Qf = ty === 'substitutes' ? function (L, Kk) { return fa * L + fb * Kk; } : ty === 'fixed' ? function (L, Kk) { return M.min(fa * L, fb * Kk); } : function (L, Kk) { return L <= 0 || Kk <= 0 ? 0 : Af * M.pow(Kk, al) * M.pow(L, be); };
    var iso = ty === 'fixed' ? { type: 'complements', corner: function (u) { return [u / fa, u / fb]; } } : ty === 'substitutes' ? { type: 'substitutes', y: function (u, L) { return (u - fa * L) / fb; } } : { type: 'cd', y: function (u, L) { return M.pow(u / (Af * M.pow(L, be)), 1 / al); } };
    function best(qv) { // cheapest bundle making qv: search along the isoquant
      if (ty === 'fixed') return [qv / fa, qv / fb];
      if (ty === 'substitutes') return fa / w >= fb / r ? [qv / fa, 0] : [0, qv / fb];
      var Lx = argmax(function (L) { var Kk = iso.y(qv, L); return -(w * L + r * Kk); }, 1e-3, qv * 50, 800); return [Lx, iso.y(qv, Lx)];
    }
    var b0 = best(qq), xM = num(o.xMax, niceCeil(b0[0] * 3.4 || 30)), yM = num(o.yMax, niceCeil(b0[1] * 3.4 || 30)), bundle = o.bundle ? [num(o.bundle[0], 5), num(o.bundle[1], 5)] : null;
    var c = F.canvas(function (wd) { return hw(wd, 1.3, 0.95); }), A = axes(c, { xmax: xM, ymax: yM, xLabel: 'Labor (L)', yLabel: 'Capital (K)' });
    if (F.inter) { V.slider(F.ctl, { label: 'Wage w', min: 1, max: 60, step: 1, value: w, fmt: function (v) { return money(v); }, input: function (v) { w = v; draw(); } }); V.slider(F.ctl, { label: 'Rental rate r', min: 1, max: 60, step: 1, value: r, fmt: function (v) { return money(v); }, input: function (v) { r = v; draw(); } }); V.slider(F.ctl, { label: 'Output q', min: 1, max: qq * 2.5, step: 0.5, value: qq, input: function (v) { qq = v; draw(); } }); }
    var KN = knobs(F, c, F.inter && bundle ? [{ name: 'Input bundle', pos: function () { return [A.X(bundle[0]), A.Y(bundle[1])]; }, drag: function (px, py) { bundle = [clamp(A.q(px), 0.05, xM), clamp(A.p(py), 0.05, yM)]; }, key: function (dx, dy, bg) { var s = niceStep(xM, 40) * (bg ? 5 : 1); bundle = [clamp(bundle[0] + dx * s, 0.05, xM), clamp(bundle[1] + dy * s, 0.05, yM)]; }, text: function () { return fm(bundle[0], 2) + ' labor, ' + fm(bundle[1], 2) + ' capital'; } }] : [], function () { draw(); });
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
      var b = best(qq), C = w * b[0] + r * b[1], tl = [];
      [1, 2, 3].forEach(function (m) { if (m > 1 && !o.ray) return; icDraw(A, iso, qq * m, k.purple, { w: m === 1 ? 2.8 : 1.8, alpha: m === 1 ? 1 : 0.6 }); });
      A.seg(0, C / r, C / w, 0, k.green, { w: 2.6 }); A.nameAt('Isocost: wL + rK = ' + money(C, 0), C / w * 0.55, C / r * 0.45, k.green, 14, -12);
      A.nameAt('q = ' + fm(qq), b[0] * 1.9, ty === 'fixed' ? b[1] : iso.type === 'cd' ? iso.y(qq, b[0] * 1.9) : b[1], k.purple, 10, -12);
      if ((o.ray || o.path) && ty === 'cobbdouglas') { var m = b[1] / b[0]; A.seg(0, 0, xM, m * xM, k.gold, { w: 1.8, dash: [6, 4] }); if (o.path) A.nameAt('Expansion path', M.min(xM * 0.85, yM / m * 0.85), M.min(xM * 0.85, yM / m * 0.85) * m, k.gold, -20, -12);
        if (o.ray) { var s = al + be; [1, 2, 3].forEach(function (mm) { var L = M.pow(qq * mm / (Af * M.pow(m, al)), 1 / s); A.dot(L, m * L, k.purple, 4.5); if (!q && mm > 1) A.label(fm(mm * qq) , L, m * L, k.purple, { dx: 12, dy: 10, align: 'left', size: 10.5 }); }); tl.push({ k: 'Returns to scale (α + β = ' + fm(s, 2) + ')', v: M.abs(s - 1) < 1e-9 ? 'constant' : s > 1 ? 'increasing' : 'decreasing', c: k.purple }); } }
      A.dot(b[0], b[1], k.ink, 6.5); if (!q) { A.label('Cheapest way to make ' + fm(qq), b[0], b[1], k.ink, { dx: 12, dy: -14, align: 'left', size: 11 }); A.guide(b[0], b[1]); }
      if (bundle) { var qb = Qf(bundle[0], bundle[1]), cb = w * bundle[0] + r * bundle[1]; A.knob(bundle[0], bundle[1], k.blue, 7); icDraw(A, iso, qb, k.blue, { w: 1.4, dash: [4, 4], alpha: 0.7 }); tl.push({ k: 'Your bundle makes', v: fm(qb, 2), c: k.blue }, { k: 'and costs', v: money(cb, 2), c: k.blue }); if (ty === 'cobbdouglas') tl.push({ k: 'MRTS = MPL ÷ MPK', v: fm(be * bundle[1] / (al * bundle[0]), 3), c: k.blue }); }
      tl.unshift({ k: 'Least cost', v: money(C, 2), c: k.green, hi: true }, { k: 'Bundle L, K', v: fm(b[0], 2) + ', ' + fm(b[1], 2), c: k.ink }, { k: 'w ÷ r', v: fm(w / r, 3), c: k.green });
      T.set(q ? [] : tl);
      F.set(ty === 'cobbdouglas' ? 'The cheapest bundle is where the isocost line just touches the isoquant: MRTS = MPL ÷ MPK = w ÷ r (the slope of the isoquant equals the slope of the isocost line, both as positive numbers). Along the ray, the isoquants for q, 2q and 3q are ' + (M.abs(al + be - 1) < 1e-9 ? 'evenly spaced: constant returns to scale, even though each input on its own has diminishing marginal product.' : al + be > 1 ? 'closer and closer: increasing returns to scale.' : 'farther and farther apart: decreasing returns to scale.') : ty === 'fixed' ? 'Fixed proportions: extra labor without extra capital adds nothing, so the cheapest bundle is at the corner, whatever the input prices.' : 'Perfect substitutes: use only the input with more output per dollar (a corner).');
      marksOn(c, A, o.marks); F.say('Isoquants for labor and capital with an isocost line touching the lowest-cost bundle.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-edgeworth: an Edgeworth box for two people with Cobb-Douglas preferences */
  V.register('ec-edgeworth', function (el, o) {
    o = opt(o, { total: [10, 10], endow: [8, 2], a: [0.5, 0.5], show: ['lens', 'contract', 'demands'] });
    var F = frame(el, o, 'An Edgeworth box'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var X = num(o.total[0], 10), Y = num(o.total[1], 10), en = [num(o.endow[0], 8), num(o.endow[1], 2)], aA = num(o.a[0], 0.5), aB = num(o.a[1], 0.5), p = num(o.price, 1);
    var UA = function (x, y) { return M.pow(x, aA) * M.pow(y, 1 - aA); }, UB = function (x, y) { return M.pow(X - x, aB) * M.pow(Y - y, 1 - aB); }; // B's utility, in A's coordinates
    var icA = function (u, x) { return M.pow(u / M.pow(x, aA), 1 / (1 - aA)); }, icB = function (u, x) { return Y - M.pow(u / M.pow(X - x, aB), 1 / (1 - aB)); };
    var c = F.canvas(function (w) { return M.min(w * 0.82, 480); }), A = axes(c, { xmax: X, ymax: Y, xLabel: 'Good x (A’s)', yLabel: 'Good y (A’s)', mt: 40, mr: 44 });
    if (F.inter) { var ps = V.slider(F.ctl, { label: 'Price of x (in units of y)', min: 0.1, max: 5, step: 0.01, value: p, fmt: function (v) { return fm(v, 2); }, input: function (v) { p = v; draw(); } }); btn(F.ctl, 'Find the equilibrium price', function () { var f0 = p, t1 = edgeEq(aA, aB, en[0], en[1], X, Y); tween(F, 700, function (t) { p = lerp(f0, t1, t); ps.set(p); draw(); }); }); }
    var KN = knobs(F, c, F.inter ? [{ name: 'Endowment point', pos: function () { return [A.X(en[0]), A.Y(en[1])]; }, drag: function (px, py) { en = [clamp(A.q(px), 0.1, X - 0.1), clamp(A.p(py), 0.1, Y - 0.1)]; }, key: function (dx, dy, bg) { var s = (bg ? 1 : 0.1) * X / 10; en = [clamp(en[0] + dx * s, 0.1, X - 0.1), clamp(en[1] + dy * s, 0.1, Y - 0.1)]; }, text: function () { return 'A has ' + fm(en[0], 2) + ' x and ' + fm(en[1], 2) + ' y'; } }] : [], function () { draw(); });
    function draw() {
      k = K(); clearC(c); var side = M.min(c.w - 30, c.h + 40); A.set({ x: (c.w - side) / 2, y: 0, w: side, h: c.h }).draw();
      var ctx = c.ctx; ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.L, A.T); ctx.lineTo(A.Rx, A.T); ctx.lineTo(A.Rx, A.B); ctx.stroke(); ctx.restore();
      txt(ctx, 'A', A.L - 18, A.B + 16, { size: 12, wt: 800, color: k.blue });
      txt(ctx, 'B', A.Rx + 6, A.T - 12, { size: 12, wt: 700, color: k.orange }); txt(ctx, 'B’s x ←', A.Rx, A.T - 26, { align: 'right', size: 11.5, color: k.orange }); txt(ctx, 'B’s y ↓', A.Rx + 6, A.T + 16, { size: 11, color: k.orange });
      for (var t = 0; t <= X; t += niceStep(X, 5)) txt(ctx, fm(X - t), A.X(t), A.T - 10, { align: 'center', size: 10.5 });
      var ua = UA(en[0], en[1]), ub = UB(en[0], en[1]);
      if (has(o.show, 'lens') && !q) { var lo = null, hi = null; for (var i = 1; i < 400; i++) { var x = X * i / 400; if (icB(ub, x) > icA(ua, x)) { if (lo == null) lo = x; hi = x; } } if (lo != null) A.area(function (x) { return M.min(Y, icB(ub, x)); }, function (x) { return icA(ua, x); }, lo, hi, k.goldSoft); }
      A.fn(function (x) { return icA(ua, x); }, k.blue, { from: 0.01, to: X, w: 2.4 }); A.fn(function (x) { return icB(ub, x); }, k.orange, { from: 0, to: X - 0.01, w: 2.4 });
      if (has(o.show, 'contract')) { A.fn(function (x) { return contractY(aA, aB, X, Y, x); }, k.green, { from: 0, to: X, w: 2.4, dash: [8, 5] }); A.nameAt('Contract curve', X * 0.7, contractY(aA, aB, X, Y, X * 0.7), k.green, -40, -12); }
      // the price line through the endowment and each person's demand on it
      var wA = p * en[0] + en[1], wB = p * (X - en[0]) + (Y - en[1]), dA = [aA * wA / p, (1 - aA) * wA], dB = [aB * wB / p, (1 - aB) * wB], dBa = [X - dB[0], Y - dB[1]];
      A.seg(en[0] - 20, en[1] + 20 * p, en[0] + 20, en[1] - 20 * p, k.ink, { w: 1.8 });
      if (has(o.show, 'demands') && !q) { A.dot(dA[0], dA[1], k.blue, 5.5); A.label('A wants', dA[0], dA[1], k.blue, { dx: -10, dy: -13, align: 'right', size: 11 }); A.dot(dBa[0], dBa[1], k.orange, 5.5); A.label('B wants', dBa[0], dBa[1], k.orange, { dx: 10, dy: 13, align: 'left', size: 11 }); }
      A.knob(en[0], en[1], k.ink, 7); A.label('Endowment', en[0], en[1], k.ink, { dx: 12, dy: -14, align: 'left', size: 11 });
      var exX = dA[0] + dB[0] - X, peq = edgeEq(aA, aB, en[0], en[1], X, Y), atEq = M.abs(exX) < 0.02;
      T.set(q ? [] : [{ k: 'Excess demand for x', v: fm(exX, 3), c: exX > 0 ? k.red : k.blue, hi: atEq }, { k: 'Excess demand for y', v: fm(-p * exX, 3), c: k.muted }, { k: 'Equilibrium price of x', v: fm(peq, 3), c: k.ink }]);
      F.set(atEq ? 'At this price both people want the same point: the market clears, and the allocation is on the contract curve, where their MRSs are equal (the indifference curves are tangent). It is efficient, though not necessarily fair: the corners of the box are efficient too.' : 'Each person sells some of their endowment at the price on the line, so income is the value of the endowment at prices being solved for. Here there is ' + (exX > 0 ? 'too much demand for x: its price should rise.' : 'too little demand for x: its price should fall.') + ' The gold lens holds the trades that make both better off.');
      marksOn(c, A, o.marks); F.say('An Edgeworth box with the endowment, each person’s indifference curve through it, the contract curve and a price line.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-risk: utility of wealth, a two-outcome lottery, the certainty equivalent and insurance */
  V.register('ec-risk', function (el, o) {
    o = opt(o, { u: 'sqrt', outcomes: [16, 100], p: 0.5, insurance: false });
    var F = frame(el, o, 'Risk and expected utility'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var U = { sqrt: [function (w) { return M.sqrt(w); }, function (v) { return v * v; }, '√W'], ln: [function (w) { return M.log(w); }, function (v) { return M.exp(v); }, 'ln W'], linear: [function (w) { return w / 10; }, function (v) { return v * 10; }, 'W ÷ 10'], convex: [function (w) { return w * w / 1000; }, function (v) { return M.sqrt(v * 1000); }, 'W² ÷ 1000'] }[o.u] || null;
    var uT = o.u in { sqrt: 1, ln: 1, linear: 1, convex: 1 } ? o.u : 'sqrt'; U = U || [M.sqrt, function (v) { return v * v; }, '√W'];
    var w1 = num(o.outcomes[0], 16), w2 = num(o.outcomes[1], 100), pr = num(o.p, 0.5), lo = M.min(w1, w2), hiW = M.max(w1, w2), pLo = w1 <= w2 ? pr : 1 - pr;
    var cov = num(o.coverage, hiW - lo), prem = num(o.premium, pLo * (hiW - lo));
    var xM = num(o.xMax, niceCeil(hiW * 1.15)), uMin = uT === 'ln' ? M.log(M.max(1, lo * 0.4)) : 0, c = F.canvas(function (w) { return hw(w, 1.5, 1.0); });
    var A = axes(c, { xmin: uT === 'ln' ? M.max(1, lo * 0.4) : 0, xmax: xM, ymin: uMin, ymax: niceCeil(U[0](xM) * 1.05) || 1, xLabel: 'Wealth (W)', yLabel: 'Utility  U = ' + U[2] });
    if (F.inter) { V.slider(F.ctl, { label: 'Chance of ' + fm(w1), min: 0, max: 1, step: 0.01, value: pr, fmt: function (v) { return fm(v, 2); }, input: function (v) { pr = v; pLo = w1 <= w2 ? pr : 1 - pr; draw(); } });
      if (o.insurance) { V.slider(F.ctl, { label: 'Coverage (paid if the loss happens)', min: 0, max: hiW - lo, step: 1, value: cov, input: function (v) { cov = v; draw(); } }); V.slider(F.ctl, { label: 'Premium', min: 0, max: hiW - lo, step: 0.5, value: prem, fmt: function (v) { return fm(v, 2); }, input: function (v) { prem = v; draw(); } }); } }
    var KN = knobs(F, c, [], function () { });
    function draw() {
      k = K(); clearC(c); A.set({ x: 0, y: 0, w: c.w, h: c.h }).draw();
      var f = U[0], inv = U[1], EW = pr * w1 + (1 - pr) * w2, EU = pr * f(w1) + (1 - pr) * f(w2), CE = inv(EU), RP = EW - CE;
      A.fn(f, k.purple, { from: A.xmin, to: xM, w: 3 }); A.nameAt('U(W)', xM * 0.9, f(xM * 0.9), k.purple, -6, -14);
      A.seg(w1, f(w1), w2, f(w2), k.blue, { w: 2, dash: [6, 4] }); A.dot(w1, f(w1), k.blue, 5.5); A.dot(w2, f(w2), k.blue, 5.5);
      A.guide(EW, EU, k.blue); A.dot(EW, EU, k.blue, 6.5); A.dot(EW, f(EW), k.purple, 6); A.vline(EW, k.purple, { w: 1, dash: [3, 4], to: f(EW) });
      A.hline(EU, k.gold, { w: 1.3, dash: [4, 4], to: EW }); A.dot(CE, EU, k.gold, 6); A.vline(CE, k.gold, { w: 1.2, dash: [3, 4], to: EU });
      if (!q) { A.label('E[U]', EW, EU, k.blue, { dx: 12, dy: 12, align: 'left', size: 11 }); A.label('U(E[W])', EW, f(EW), k.purple, { dx: 10, dy: -14, align: 'left', size: 11 }); A.tagX(EW, 'E[W] ' + fm(EW, 1), k.blue); A.tagX(CE, 'CE ' + fm(CE, 1), k.gold);
        if (M.abs(RP) > 0.3) { var yb = A.ymin + (A.ymax - A.ymin) * 0.08; A.seg(CE, yb, EW, yb, k.red, { w: 2.4 }); A.label('Risk premium ' + fm(RP, 2), (CE + EW) / 2, yb, k.red, { dy: -12, size: 11 }); } }
      var tl = [{ k: 'Expected wealth E[W]', v: fm(EW, 2), c: k.blue }, { k: 'Expected utility E[U]', v: fm(EU, 3), c: k.blue }, { k: 'U(E[W])', v: fm(f(EW), 3), c: k.purple }, { k: 'Certainty equivalent', v: fm(CE, 2), c: k.gold }, { k: 'Risk premium', v: fm(RP, 2), c: k.red, hi: true }], txt = '';
      if (o.insurance) {
        var wb = lo - prem + cov, wg = hiW - prem, EUi = pLo * f(wb) + (1 - pLo) * f(wg), fair = pLo * cov, maxFull = hiW - CE;
        A.seg(wb, f(wb), wg, f(wg), k.green, { w: 2, dash: [3, 3] }); var EWi = pLo * wb + (1 - pLo) * wg; A.dot(EWi, EUi, k.green, 6); if (!q) A.label('Insured', EWi, EUi, k.green, { dx: -10, dy: -12, align: 'right', size: 11 });
        tl.push({ k: 'Expected utility insured', v: fm(EUi, 3), c: k.green, hi: EUi > EU }, { k: 'Fair premium for this coverage', v: fm(fair, 2), c: k.ink }, { k: 'Most worth paying for full cover', v: fm(maxFull, 2), c: k.gold });
        txt = 'Insured, wealth is ' + fm(wb, 2) + ' after a loss and ' + fm(wg, 2) + ' otherwise. ' + (EUi > EU + 1e-9 ? 'Expected utility is <b>higher</b> than without insurance, so this policy is a good buy for this person' : 'Expected utility is lower than without insurance, so this policy is not worth it') + '. An actuarially fair premium equals the expected payout (' + fm(fair, 2) + '). A risk-averse person would pay up to ' + fm(maxFull, 2) + ' for full coverage: the expected loss plus the risk premium.';
      } else txt = uT === 'linear' ? 'A straight-line utility: risk neutral. Expected utility equals the utility of expected wealth, and the risk premium is zero.' : uT === 'convex' ? 'A utility curve that bends up: a risk lover. The chord lies above the curve, so the lottery is worth more than its expected value (a negative risk premium).' : 'The utility curve bends down (concave): each extra dollar adds less utility. So the chord lies below the curve, and the expected utility of the gamble, E[U(W)], is less than the utility of its expected value, U(E[W]). The certainty equivalent is the sure wealth with the same utility; the gap to E[W] is the risk premium: what removing the risk is worth.';
      T.set(q ? [] : tl); F.set(txt);
      marksOn(c, A, o.marks); F.say('A utility of wealth curve with a lottery between ' + fm(w1) + ' and ' + fm(w2) + (q ? '.' : '; certainty equivalent ' + fm(CE, 2) + '.')); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });

  /* ec-firmmarket: the market and one typical firm under perfect competition; entry and exit in steps */
  V.register('ec-firmmarket', function (el, o) {
    o = opt(o, { cost: { F: 100, a: 10, b: 1, c: 0.1 }, demand: { a: 1000, b: 25 }, story: 'demandUp', show: ['profit', 'efficiency', 'firms'] });
    var F = frame(el, o, 'A competitive market and one firm'), k = K(), q = F.quiet, T = tiles(q ? mk('div') : el); if (!q) el.insertBefore(T.el, F.out.el);
    var C0 = cost(o.cost), story = o.story, Dq = function (P, sft) { return num(o.demand.a, 1000) + (sft || 0) - num(o.demand.b, 25) * P; };
    var C1 = story === 'costDown' ? cost({ F: C0.F, a: C0.a - num(o.cut, 4), b: C0.b, c: C0.c }) : C0, dsh = num(o.shift, 200) * (story === 'demandDown' ? -1 : story === 'demandUp' ? 1 : 0);
    var Pstar = C0.minATC.v, n0 = Dq(Pstar) / C0.minATC.q, n1 = Dq(C1.minATC.v, dsh) / C1.minATC.q;
    function srP(Cc, n, sft) { return bisect(function (P) { return Dq(P, sft) - n * Cc.qFor(P); }, C0.minAVC.v * 0.5, num(o.demand.a, 1000) / num(o.demand.b, 25)); }
    var STEPS = story === 'costDown' ? ['Long-run equilibrium: the price equals the lowest ATC, so each firm earns zero economic profit.', 'New technology cuts costs: each firm’s cost curves shift down, and market supply shifts right.', 'The price falls a little, but less than costs did: each firm now earns a profit.', 'Profit draws new firms in: market supply keeps shifting right.', 'The price falls to the new lowest ATC. Zero economic profit again, more firms, and a lower price for buyers.']
      : [story === 'demandDown' ? 'Long-run equilibrium. Then buyers want less: demand falls.' : 'Long-run equilibrium: the price equals the lowest ATC, so each firm earns zero economic profit.', story === 'demandDown' ? 'Market demand shifts left.' : 'Market demand shifts right.', 'The market price ' + (dsh > 0 ? 'rises' : 'falls') + '. Each firm is a price taker: its demand curve (P = MR = d) is flat at the new price, and it moves along its MC to the quantity where P = MC.', dsh > 0 ? 'Price above ATC: each firm earns an economic profit (gold).' : 'Price below ATC: each firm takes a loss (red).', dsh > 0 ? 'Profit draws new firms in: market supply shifts right. The firms’ cost curves do not move.' : 'Losses push some firms out: market supply shifts left.', 'The price returns to the lowest ATC: zero economic profit, a normal return, with ' + (dsh > 0 ? 'more' : 'fewer') + ' firms.'];
    var N = STEPS.length, st = clamp(num(o.step, 0), 0, N - 1), anim = 1;
    var c = F.canvas(function (w) { return w >= 560 ? w / 2.05 : w * 1.62; });
    var Qmax = niceCeil(Dq(0, M.max(0, dsh)) * 0.75), Pmax = niceCeil(Pstar * 2.1);
    var Am = axes(c, { xmax: Qmax, ymax: Pmax, xLabel: 'Market quantity (Q)', yLabel: 'Price ($)', money: true, title: 'The market' }), Af = axes(c, { xmax: niceCeil(C0.minATC.q * 1.7), ymax: Pmax, xLabel: 'One firm’s quantity (q)', yLabel: 'Price ($)', money: true, title: 'One firm' });
    if (F.inter) stepper(F.ctl, N, st, function (i) { st = i; anim = 0; tween(F, 700, function (t) { anim = t; draw(); }); }, function (i) { return q ? 'Step ' + (i + 1) + ' of ' + N : 'Step ' + (i + 1) + ' of ' + N + ': ' + STEPS[i]; });
    var KN = knobs(F, c, [], function () { });
    function state() { // what the market looks like at this step (with the animation fraction)
      var a = anim, s = {};
      if (story === 'costDown') {
        var cf = st >= 1 ? (st === 1 ? a : 1) : 0, Cc = cf < 1 && cf > 0 ? cost({ F: C0.F, a: lerp(C0.a, C1.a, cf), b: C0.b, c: C0.c }) : cf ? C1 : C0;
        var nn = st >= 3 ? lerp(n0, n1, st === 3 ? a * 0.6 : st === 4 ? 0.6 + 0.4 * a : 1) : n0;
        s = { C: Cc, n: nn, dsh: 0, P: srP(Cc, nn, 0), old: st >= 1 ? C0 : null };
      } else {
        var df = st >= 1 ? (st === 1 ? a : 1) : 0, n = st >= 4 ? lerp(n0, n1, st === 4 ? a * 0.8 : st === 5 ? 0.8 + 0.2 * a : 1) : n0, P = st >= 2 ? srP(C0, n, dsh) : Pstar;
        if (st === 2) P = lerp(Pstar, srP(C0, n0, dsh), a);
        s = { C: C0, n: n, dsh: dsh * df, P: P };
      }
      return s;
    }
    function draw() {
      k = K(); clearC(c); var g = 14; if (c.w >= 560) { Am.set({ x: 0, y: 0, w: (c.w - g) / 2, h: c.h }); Af.set({ x: (c.w + g) / 2, y: 0, w: (c.w - g) / 2, h: c.h }); } else { Am.set({ x: 0, y: 0, w: c.w, h: (c.h - g) / 2 }); Af.set({ x: 0, y: (c.h + g) / 2, w: c.w, h: (c.h - g) / 2 }); }
      Am.draw(); Af.draw();
      var s = state(), Cc = s.C, qf = Cc.qFor(s.P), Qm = s.n * qf, atc = Cc.ATC(qf), prof = (s.P - atc) * qf;
      // market: demand (old dashed), supply = n firms' MC above min AVC
      if (s.dsh) Am.fn(function (Q) { return (num(o.demand.a, 1000) - Q) / num(o.demand.b, 25); }, k.blue, { dash: [7, 6], w: 2, alpha: 0.7 });
      Am.fn(function (Q) { return (num(o.demand.a, 1000) + s.dsh - Q) / num(o.demand.b, 25); }, k.blue); Am.nameAt('D', Qmax * 0.92, (num(o.demand.a, 1000) + s.dsh - Qmax * 0.92) / num(o.demand.b, 25), k.blue, 0, -12);
      var supQ = function (n, Cx) { return function (P) { return n * Cx.qFor(P); }; };
      if (M.abs(s.n - n0) > 0.01 || s.old) Am.par(supQ(n0, s.old || C0), function (P) { return P; }, (s.old || C0).minAVC.v, Pmax, k.orange, { dash: [7, 6], w: 2, alpha: 0.7 });
      Am.par(supQ(s.n, Cc), function (P) { return P; }, Cc.minAVC.v, Pmax, k.orange); Am.nameAt('S', s.n * Cc.qFor(Pmax * 0.9), Pmax * 0.9, k.orange, 12, 0);
      Am.guide(Qm, s.P); Am.dot(Qm, s.P, k.ink, 6); if (!q) { Am.tagY(s.P, money(s.P, 2), k.ink); }
      Am.hline(s.P, k.ink, { w: 1.2, dash: [3, 4] });
      arrowPx(c.ctx, Am.Rx - 4, Am.Y(s.P), Af.L + 4, Af.Y(s.P), rgba(k.ink.length === 7 ? k.ink : '#333333', 0.35), 1.4, 8, [4, 4]);
      // firm
      if (has(o.show, 'profit') && M.abs(prof) > 0.05 && qf > 0) { Af.poly([[0, atc], [qf, atc], [qf, s.P], [0, s.P]], prof > 0 ? k.goldSoft : k.redSoft2); if (!q) Af.label(prof > 0 ? 'Profit' : 'Loss', qf / 2, (atc + s.P) / 2, prof > 0 ? k.gold : k.red, { size: 11.5 }); }
      if (s.old) { Af.fn(s.old.MC, k.orange, { from: 0.3, dash: [7, 6], w: 2, alpha: 0.6 }); Af.fn(s.old.ATC, k.purple, { from: 0.8, dash: [7, 6], w: 2, alpha: 0.6 }); }
      Af.fn(Cc.MC, k.orange, { from: 0.3 }); Af.fn(Cc.ATC, k.purple, { from: 0.8 }); Af.nameAt('MC', bisect(function (x) { return Cc.MC(x) - Pmax * 0.88; }, Cc.minMC.q, 100), Pmax * 0.88, k.orange, -18, 0); Af.nameAt('ATC', Af.xmax * 0.95, Cc.ATC(Af.xmax * 0.95), k.purple, -10, -12);
      Af.hline(s.P, k.blue, { w: 2.6 }); Af.nameAt('P = MR = d', Af.xmax * 0.97, s.P, k.blue, -40, -12);
      Af.vline(qf, k.ink, { w: 1.2, dash: [3, 4], to: s.P }); Af.dot(qf, s.P, k.ink, 6); if (!q) Af.tagX(qf, fm(qf, 2), k.ink);
      var atLR = M.abs(s.P - Cc.minATC.v) < 0.02;
      if (has(o.show, 'efficiency') && atLR && !q) Af.label('P = MC (allocative) and P = min ATC (productive)', qf, s.P, k.green, { dy: 16, size: 10.5 });
      T.set(q ? [] : [{ k: 'Market price', v: money(s.P, 2), c: k.ink }, { k: 'Each firm makes', v: fm(qf, 2), c: k.ink }, { k: 'Profit per firm', v: money(prof, 2), c: prof >= -0.005 ? k.gold : k.red }].concat(has(o.show, 'firms') ? [{ k: 'Number of firms (Q ÷ q)', v: fm(s.n, 1), c: k.orange, hi: true }] : []));
      F.set(STEPS[st] + (st === 0 ? ' The single firm’s demand curve is flat at the market price, even though market demand slopes down: one small firm cannot move the price.' : ''));
      marksOn(c, Am, o.marks); F.say('Two graphs: the market with demand and supply, and one firm with marginal cost, average total cost and the price line.'); KN.place();
    }
    F.redraw(draw); draw();
    return { draw: draw };
  });
})(window, document);
