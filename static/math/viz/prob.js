/* Math Ladder visuals for Probability (course key prob). Registered on window.MathLadder.viz; needs viz/core.js and the
   CAS (homeschool/calc/cas.js) for density and event formulas; looks best with viz/adv.css (Probability pages load it).
   Styles for these visuals are injected below.

   Shared options on every visual here:
     task       an instruction line above the picture (HTML allowed)
     label      the aria-label of the whole visual (a sensible one is built when it is missing)
     height     canvas height in px (each visual picks a good one by default)
     edit       false freezes the picture: no handles, sliders or buttons (default true)
     quiet      true (or readout: false) hides every number the visual works out that a problem might ask for;
                each visual says below what quiet hides. Lessons leave it off; generators set it inside problems.
   Exact where the course is exact: discrete probabilities are exact fractions (BigInt inside), shown as "1/6" on the
   picture and as TeX fractions in the readout. Densities and areas are computed numerically and shown to 4 places
   (with the fraction beside them when the value is a simple fraction). Random pictures take a seed and repeat.

   prob-square   Probability as area: the sample space is a unit square, events are regions, P is area.
     opts: layout: "independent"   A is a vertical strip of width P(A), B a horizontal strip of height P(B): the overlap
                                   is a rectangle of area P(A)·P(B)
                   "disjoint"      A at the left, B at the right, no overlap: P(A ∩ B) = 0 although P(A) > 0
                   "free"          a mosaic: B's height inside A is P(B ∣ A), its height outside A is P(B ∣ Aᶜ);
                                   drag the three edges separately
                   "coins"         four equal cells HH, HT, TH, TT with A = first flip heads, B = second flip heads,
                                   C = the flips match: independent in pairs, not all three together
           pA: "2/5", pB: "1/2"    the probabilities (fractions as strings, or decimals)
           pAB: null                free layout only: P(A ∩ B) (default P(A)·P(B))
           condition: null | "A" | "B"   start conditioned: the condition's region is rescaled to fill the square, and the
                                   share of it covered by the other event is the conditional probability
           labels: {"A": "Rain", "B": "Late"}   names drawn in the regions (letters A and B in the formulas)
           frac: true               exact fractions (false: decimals)
           snap: 20                 dragged edges snap to multiples of 1/snap
           show: []                 with quiet, values still shown: any of "pA", "pB", "pAB", "pAgB", "pBgA"
     quiet hides P(A ∩ B), the conditional probabilities, the product P(A)P(B) and the independence verdict (and in
     the coins layout the pairwise and triple checks), except the values listed in show.

   prob-table    A joint pmf as a table with a heat map; row and column totals are the marginals.
     opts: x: [-1, 0, 1], y: [0, 1]     values of X (columns) and Y (rows); numbers, or words for categories
           p: [["1/6", "1/6", "1/6"], ["0", "1/4", "1/4"]]   p[i][j] = P(X = x[j], Y = y[i]): one row per y value
           preset: "x-xsq"          X = −1, 0, 1 equally likely and Y = X² (covariance 0, yet dependent)
                   "dice-max-min"   two dice: X = the larger number, Y = the smaller
           mode: "marginal"         click a cell: one cell is a joint probability, totals are marginals
                 "conditional"      click a row (Y = y) or a column (X = x): it is lifted out and divided by its
                                    total, drawn as bars that add to 1
                 "independence"     every cell compared with the product of its marginals (equal: green; not: red)
                 "covariance"       each cell's (x − μ_X)(y − μ_Y) sign, with E[XY], E[X]E[Y] and Cov(X, Y)
                 "cexp"             a column E[X ∣ Y = y] per row, and their weighted average, which is E[X]
           modes: [mode]            the modes offered as buttons (default: only the starting one)
           given: {"y": 1} or {"x": 0}   a starting condition (conditional mode)
           names: {"X": "X", "Y": "Y"}   the variables' names
           frac: true
     quiet hides the marginal totals, conditional values, E and Cov readouts and the independence verdict.

   prob-region   A joint density on the plane: the support shaded by f(x, y), an event region over it, a slice that
                 shows the inner limits of the double integral, the marginal density and random points.
     opts: support: "square" ([0, 1]²) | "triangle" (0 < x < y < 1) | "lower" (0 < y < x < 1) | "simplex" (x, y > 0,
                    x + y < 1) | "disk" (x² + y² < 1) | {"rect": [x0, x1, y0, y1]} | {"poly": [[x, y], …]}
           f: "uniform"             the density as a CAS string in x and y ("2", "x+y", "6x", "4x*y"); "uniform" is
                                    1 over the support's area
           event: "x<y"             the event: one or more comparisons joined by " and " ("abs(x-y)<1/4",
                                    "x+y<1", "x<1/2 and y>1/2"); "" for none
           eventLabel: ""           how to name the event in the readout (TeX allowed); default: built from event
           slices: "x"              "x" (a vertical slice at x = at), "y" (horizontal) or "" (none)
           at: 0.5                  where the slice starts
           marginal: false          plot the marginal density of the slice variable under the picture
           samples: 0               random points to start with (seeded); buttons add more
           seed: 1
     quiet hides the probability, the slice's limits, the marginal values and the share of points in the event.

   prob-density  Height, area and the CDF: f(x) on top (bars for a discrete X) with a shaded interval [a, b] you drag,
                 and F(x) below with F(b) − F(a) drawn as a gap. Tap or hover to read f(x): a density, not a probability.
     opts: dist: "uniform" {a, b} | "triangle" {a, c, b} | "exp" {lambda} | "normal" {mu, sigma}
                 | "poly" (f: "3x^2", params {lo, hi}) | "piecewise" (pieces: [["x", 0, 1], ["2-x", 1, 2]])
                 | "pmf" (pmf: {"x": [0, 1, 2], "p": ["1/4", "1/2", "1/4"]})
           params: {}               as listed for each dist
           a, b                     the interval (default: a central part of the support)
           closed: "(]"             discrete X only: which ends count, "(]" a < X ≤ b, "[]", "[)", "()"
           show: ["pdf", "cdf"]     the panels
           mean: false, median: false   a fulcrum at E[X], a line at the median (F = 1/2)
           transform: ""            a function g, like "x^2": the lower panel becomes the density of Y = g(X), and a
                                    thin strip at x (drag it) maps to a strip of width |g′(x)| dx at y = g(x)
           x0                       transform: where the strip starts
           xmin, xmax               the view
     quiet hides the probability of the shaded interval, the F values, the mean and median values, the density value
     under the cursor and the transformed density's value.

   prob-convolve Sums of independent variables. Pairs: the pairs (k, s − k) that make a total s light up and their
                 products add into the bar at s; for densities, one density slides across the flipped other and the
                 overlap area traces the density of the sum. Copies: S₁, S₂, …, Sₙ with the normal curve of mean nμ
                 and standard deviation σ√n laid over it; a switch shows the average instead (spread σ/√n).
     opts: X: "die" | "d4" | "coin" | "uniform" | "exp" | {"x": [...], "p": [...]}
           Y: X                     the second variable (pairs mode)
           mode: "pairs" | "copies"
           s: null                  the total to start on (pairs)
           n: 1                     copies mode: how many copies to start with (1 … 30)
           show: "sum" | "mean"     copies mode: the sum or the average
           normal: true             copies mode: lay the normal curve over the distribution
     quiet hides the bar values, P(X + Y = s), the mean and SD readout and the normal parameters.

   prob-poisson  Random arrivals on a timeline at rate λ (seeded).
     opts: lambda: 3, t: 1, T: 10   the rate, the window length, the timeline length
           mode: "counts"           drag a window of length t; count many windows into a histogram beside the
                                    Poisson(λt) pmf
                 "gaps"             the gaps between arrivals beside the exponential density with mean 1/λ
                 "memory"           "already waited s": the leftover waits have the same histogram as fresh waits
                 "slots"            the window cut into n slots, each with chance λt/n of an arrival:
                                    Binomial(n, λt/n) beside Poisson(λt)
           s: 1, n: 20, seed: 1
     quiet hides λt, the pmf values, the mean gap and the leftover average.

   prob-markov   A Markov chain: states as circles, arrows labeled with transition probabilities, and the matrix P
                 (row i = from state i; every row must add to 1, and the rows are checked).
     opts: P: [["1/2", "1/2"], ["1/4", "3/4"]]   the transition matrix (rows add to 1)
           names: ["Sunny", "Rainy"]
           pi0: [1, 0]              the starting distribution (a row vector)
           mode: "diagram"          the chain and its matrix only (for a picture in a problem)
                 "walk"             a token walks the chain (Step or Play; seeded) with visit counts
                 "distribution"     π₀, π₁ = π₀P, π₂, … as bars and fractions, with one entry's row-times-column sum
                 "absorb"           absorbing states (P[i][i] = 1) as double circles; first-step equations
                                    hᵢ = Σ pᵢⱼ hⱼ (absorption chances) and mᵢ = 1 + Σ pᵢⱼ mⱼ (expected steps), solved
                 "stationary"       the share of time in each state over a long walk beside π solving πP = π, Σπ = 1
           steps: 0                 distribution: how many steps to show at the start
           target: null             absorb: the absorbing state whose chance is computed (default the last one)
           layout: "ring" | "line"  states around a circle, or in a row (good for gambler's ruin)
           matrix: true             show the matrix P as a table under the diagram
           seed: 1
     quiet hides πₙ (after π₀), the absorption chances, the expected times and the stationary π.            */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/prob.js: load viz/core.js first'); return; }
  var M = Math, mk = V.el;

  // ================================================================ styles
  (function css() {
    if (D.getElementById('prob-viz-css')) return;
    var s = D.createElement('style'); s.id = 'prob-viz-css';
    s.textContent = [
      '.pv{overflow:hidden}',
      '.pv .pv-box{position:relative}',
      '.pv .mla-task{display:flex;gap:.55rem;align-items:flex-start;margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}',
      '.pv .ml-readout:empty{display:none}',
      '.pv .ml-readout{overflow-wrap:anywhere}',
      '.pv .pv-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:.55rem 0 0}',
      '.pv .pv-tbl{overflow-x:auto;max-width:100%;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card)}',
      '.pv .pv-tbl table{border-collapse:collapse;margin:0;width:100%;font-size:.9rem;font-variant-numeric:tabular-nums}',
      '.pv .pv-tbl th,.pv .pv-tbl td{padding:.38rem .45rem;text-align:center;border:1px solid var(--mv-line);white-space:nowrap;line-height:1.25}',
      '.pv .pv-tbl th{background:var(--mv-paper);color:var(--mv-muted);font-weight:600;font-size:.82rem}',
      '.pv .pv-tbl tr>*:first-child{border-left:0}.pv .pv-tbl tr>*:last-child{border-right:0}',
      '.pv .pv-tbl thead tr:first-child>*{border-top:0}.pv .pv-tbl tbody tr:last-child>*{border-bottom:0}',
      '.pv .pv-tbl [data-k]{cursor:pointer}',
      '.pv .pv-tbl [data-k]:focus-visible{outline:3px solid #b8963e;outline-offset:-3px}',
      '.pv .pv-tbl .pv-on{box-shadow:inset 0 0 0 3px #b8963e}',
      '.pv .pv-tbl .pv-dim{opacity:.38}',
      '.pv .pv-tbl .pv-tot{font-weight:700;color:var(--mv-ink);background:var(--mv-paper)}',
      '.pv .pv-tbl small{display:block;font-size:.72rem;color:var(--mv-muted);font-weight:500}',
      '.pv .pv-good{background:rgba(0,112,60,.13)}.pv .pv-badc{background:rgba(214,51,108,.13)}',
      'html[data-theme="dark"] .pv .pv-good{background:rgba(108,199,154,.2)}html[data-theme="dark"] .pv .pv-badc{background:rgba(255,135,135,.2)}',
      '.pv .pv-sg{display:inline-block;min-width:1.1em;padding:0 .2em;border-radius:4px;font-size:.72rem;font-weight:700;color:#fff;margin-left:.25em;vertical-align:.1em}',
      '.pv .pv-sg.p{background:#00703c}.pv .pv-sg.m{background:#d6336c}.pv .pv-sg.z{background:#5d6862}',
      'html[data-theme="dark"] .pv .pv-sg.p{background:#2f8f62}html[data-theme="dark"] .pv .pv-sg.m{background:#c2255c}',
      '.pv .pv-bars{display:flex;justify-content:center;align-items:flex-end;gap:8px;height:130px;margin:.7rem 0 0;padding:1.4rem .3rem 0;border-bottom:2px solid var(--mv-line)}',
      '.pv .pv-bar{flex:1 1 0;min-width:22px;max-width:90px;background:#1c6fd6;border-radius:5px 5px 0 0;position:relative;transition:height .35s}',
      'html[data-theme="dark"] .pv .pv-bar{background:#74c0fc}',
      '.pv .pv-bar span{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-size:.78rem;font-weight:700;white-space:nowrap;padding-bottom:2px;color:var(--mv-ink)}',
      '.pv .pv-barlab{display:flex;justify-content:center;gap:8px;padding:.2rem .3rem 0;font-size:.8rem;color:var(--mv-muted)}',
      '.pv .pv-barlab span{flex:1 1 0;min-width:22px;max-width:90px;text-align:center;overflow:hidden;text-overflow:ellipsis}',
      '.pv .pv-cap{font-size:.85rem;color:var(--mv-muted);margin:.35rem 0 0}',
      '.pv .pv-legend{display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:.85rem;color:var(--mv-muted);margin:.45rem 0 0}',
      '.pv .pv-legend i{display:inline-block;width:.85em;height:.85em;border-radius:3px;margin-right:.35em;vertical-align:-.05em}',
      '.pv .pv-ok{color:#00703c;font-weight:700}html[data-theme="dark"] .pv .pv-ok{color:#6cc79a}',
      '.pv .pv-no{color:#d6336c;font-weight:700}html[data-theme="dark"] .pv .pv-no{color:#ff8787}',
      '.pv .pv-split{display:flex;flex-wrap:wrap;gap:.7rem;align-items:flex-start}',
      '.pv .pv-split>*{flex:1 1 280px;min-width:0}',
      '.pv .pv-tog{display:flex;flex-wrap:wrap;gap:.3rem}',
      '.pv .pv-tog button{font:600 .85rem system-ui,sans-serif;min-height:36px;padding:.35rem .75rem;border-radius:999px;border:1px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);cursor:pointer}',
      '.pv .pv-tog button[aria-pressed="true"]{background:#004225;border-color:#004225;color:#fff}',
      'html[data-theme="dark"] .pv .pv-tog button[aria-pressed="true"]{background:#6cc79a;border-color:#6cc79a;color:#0f1a14}',
      '.pv .pv-eqs{margin:.5rem 0 0;padding:.45rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);font-size:.92rem;line-height:1.7;overflow-x:auto}',
      '.pv .pv-eqs:empty{display:none}',
      '@media (max-width:480px){.pv .pv-tbl th,.pv .pv-tbl td{padding:.32rem .28rem;font-size:.8rem}.pv .pv-bars{gap:5px}.pv .pv-barlab{gap:5px}}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ================================================================ helpers
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - M.pow(-2 * t + 2, 2) / 2; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rgba(hex, a) { if (!/^#/.test(hex)) return hex; var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function rng(seed) { var a = ((+seed || 1) * 2654435761) >>> 0 || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = M.imul(a ^ a >>> 15, 1 | a); t = t + M.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function expo(r, lam) { return -M.log(1 - r()) / lam; }
  function dec(v, d) { return V.fmt(v, d === undefined ? 4 : d); }
  function num(x, def) { if (typeof x === 'number') return x; if (x == null || x === '') return def; var f = fparse(x); return f ? fnum(f) : def; }

  // ---- exact fractions (BigInt)
  function bgcd(a, b) { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function Fr(n, d) { n = BigInt(n); d = d === undefined ? 1n : BigInt(d); if (d === 0n) throw new Error('fraction: division by zero'); if (d < 0n) { n = -n; d = -d; } var g = bgcd(n, d) || 1n; return { n: n / g, d: d / g }; }
  function fromNum(v) { // a float as a fraction: small denominators exactly, otherwise its decimal digits
    if (!isFinite(v)) return null;
    for (var d = 1; d <= 1000; d++) { var n = M.round(v * d); if (M.abs(n / d - v) < 1e-12) return Fr(n, d); }
    return fparse(String(+v.toPrecision(12)));
  }
  function fparse(x) {
    if (x && typeof x === 'object' && 'n' in x) return x;
    if (typeof x === 'number') return fromNum(x);
    var s = String(x == null ? '' : x).trim().replace(/−/g, '-').replace(/\s+/g, '');
    var m = /^(-?\d+)\/(\d+)$/.exec(s); if (m) return Fr(m[1], m[2]);
    m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(s);
    if (m && (m[2] || m[3])) { var fp = m[3] || ''; return Fr((m[1] || '') + (m[2] || '0') + fp, '1' + new Array(fp.length + 1).join('0')); }
    var v = +s; return isFinite(v) ? fromNum(v) : null;
  }
  function fadd(a, b) { return Fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return Fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  function fmul(a, b) { return Fr(a.n * b.n, a.d * b.d); }
  function fdiv(a, b) { return Fr(a.n * b.d, a.d * b.n); }
  function fz(a) { return a.n === 0n; }
  function fcmp(a, b) { var x = a.n * b.d, y = b.n * a.d; return x < y ? -1 : x > y ? 1 : 0; }
  function feq(a, b) { return fcmp(a, b) === 0; }
  function fnum(a) { return Number(a.n) / Number(a.d); }
  function fsum(arr) { return arr.reduce(fadd, Fr(0)); }
  var ONE = Fr(1), ZERO = Fr(0);
  function ftxt(a) { return (a.n < 0n ? '−' : '') + (a.n < 0n ? -a.n : a.n) + (a.d === 1n ? '' : '/' + a.d); }
  function ftex(a) { if (a.d === 1n) return String(a.n); return (a.n < 0n ? '-' : '') + '\\frac{' + (a.n < 0n ? -a.n : a.n) + '}{' + a.d + '}'; }
  function niceFrac(v, maxD) { // "7/16" when v is (very nearly) a fraction with a small denominator
    for (var d = 1; d <= (maxD || 64); d++) { var n = M.round(v * d); if (M.abs(n / d - v) < 2e-7) return d === 1 ? String(n) : n + '/' + d; }
    return null;
  }
  function niceTex(v) { var f = niceFrac(v); if (!f) return null; var p = f.split('/'); return p.length === 1 ? p[0] : (+p[0] < 0 ? '-' : '') + '\\frac{' + M.abs(+p[0]) + '}{' + p[1] + '}'; }

  // ---- compiling CAS strings
  function compile(src, vars) {
    var C = W.CAS; if (!C) throw new Error('viz/prob.js needs the CAS (homeschool/calc/cas.js)');
    var g = C.compile(C.parse(String(src)), vars);
    return function (a, b) { try { var v = +g(a, b); return isFinite(v) ? v : NaN; } catch (e) { return NaN; } };
  }
  function prettyMath(s) { // a CAS string for display in text: x<y -> x < y, abs(x-y) -> |x − y|
    return String(s).replace(/abs\(([^()]*)\)/g, '|$1|').replace(/<=/g, ' ≤ ').replace(/>=/g, ' ≥ ').replace(/([^ ≤≥])<([^=])/g, '$1 < $2').replace(/([^ ≤≥])>([^=])/g, '$1 > $2')
      .replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\*/g, '').replace(/-/g, ' − ').replace(/\+/g, ' + ').replace(/\s+/g, ' ').replace(/\( − /g, '(−').trim();
  }

  // ---- numerical integration (Gauss–Legendre, 5 nodes per panel)
  var GLX = [-0.9061798459386640, -0.5384693101056831, 0, 0.5384693101056831, 0.9061798459386640];
  var GLW = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];
  function integ(f, a, b, panels) {
    if (!(b > a)) return 0; var n = panels || 40, h = (b - a) / n, s = 0;
    for (var i = 0; i < n; i++) { var c = a + (i + 0.5) * h; for (var k = 0; k < 5; k++) { var v = f(c + GLX[k] * h / 2); if (isFinite(v)) s += GLW[k] * v; } }
    return s * h / 2;
  }

  // ---- canvas text
  function txt(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = (o.it ? 'italic ' : '') + (o.w || 600) + ' ' + (o.size || 13) + 'px ' + (o.serif ? 'Georgia,serif' : 'system-ui,sans-serif');
    ctx.fillStyle = o.color || V.colors().ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore();
  }
  function pill(ctx, s, x, y, col, o) { // a label on a soft background, kept inside the canvas
    o = o || {}; var k = V.colors(), sz = o.size || 12; ctx.save(); ctx.font = '700 ' + sz + 'px system-ui,sans-serif';
    var w = ctx.measureText(s).width + 10, h = sz + 7, bx = x - (o.align === 'left' ? 0 : o.align === 'right' ? w : w / 2), by = y - h / 2;
    if (o.W) bx = clamp(bx, 2, o.W - w - 2); if (o.H) by = clamp(by, 2, o.H - h - 2);
    ctx.fillStyle = rgba(k.bg, 0.88); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w, h, 6); else ctx.rect(bx, by, w, h); ctx.fill();
    ctx.fillStyle = col || k.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
    return { x: bx, y: by, w: w, h: h };
  }
  function fit(ctx, opts, maxW, size) { for (var i = 0; i < opts.length; i++) if (tw(ctx, opts[i], size || 11, 500) <= maxW) return opts[i]; return opts[opts.length - 1]; }
  function tw(ctx, s, size, wgt) { ctx.save(); ctx.font = (wgt || 600) + ' ' + (size || 13) + 'px system-ui,sans-serif'; var w = ctx.measureText(s).width; ctx.restore(); return w; }
  function arrowHead(ctx, x, y, ang, sz) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - sz * M.cos(ang - 0.42), y - sz * M.sin(ang - 0.42)); ctx.lineTo(x - sz * M.cos(ang + 0.42), y - sz * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); }
  function niceStep(span, px) { var raw = span / M.max(2, px / 70), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }

  // ---- the frame every visual here uses: task line, picture box, controls, readout
  function frame(el, o, label) {
    el.classList.add('mla', 'pv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'pv-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    F.row = function () { var r = mk('div', 'ml-ctl'); el.insertBefore(r, F.out.el); return r; };
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    F.canvas = function (q) { var c = V.canvas(F.box, { height: o.height || q.height, aspect: q.aspect, max: q.max, min: q.min }); c.cv.setAttribute('role', 'img'); return c; };
    if (!F.edit) { F.ctl.hidden = true; }
    return F;
  }
  // keyboard for a canvas with handles: arrows move the selected handle, Enter or N picks the next one
  function keyNav(cv, o) {
    cv.tabIndex = 0; var st = { i: 0, focus: false };
    cv.addEventListener('keydown', function (e) {
      var n = o.count(); if (!n) return;
      if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { st.i = (st.i + 1) % n; if (o.sel) o.sel(st.i); e.preventDefault(); return; }
      var dx = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, dy = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0;
      if (dx || dy) { o.move(st.i % n, dx, dy, e.shiftKey); e.preventDefault(); }
    });
    cv.addEventListener('focus', function () { st.focus = true; if (o.redraw) o.redraw(); });
    cv.addEventListener('blur', function () { st.focus = false; if (o.redraw) o.redraw(); });
    return st;
  }
  function animate(el, dur, fn, done) { // fn(t) for t in 0..1 over dur ms; instant with reduced motion
    if (V.reduced || !W.requestAnimationFrame) { fn(1); if (done) done(); return { stop: function () { } }; }
    var t0 = null, live = true;
    function fr(ts) { if (!live) return; if (t0 === null) t0 = ts; var t = M.min(1, (ts - t0) / dur); fn(t); if (t < 1) W.requestAnimationFrame(fr); else if (done) done(); }
    W.requestAnimationFrame(fr); return { stop: function () { live = false; } };
  }
  function toggleRow(parent, items, on, change) { // buttons that switch on and off independently
    var w = mk('div', 'pv-tog'); w.setAttribute('role', 'group'); var st = {};
    items.forEach(function (it) { st[it[0]] = on.indexOf(it[0]) >= 0; var b = mk('button', '', it[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(st[it[0]])); b.addEventListener('click', function () { st[it[0]] = !st[it[0]]; b.setAttribute('aria-pressed', String(st[it[0]])); change(st); }); w.appendChild(b); });
    parent.appendChild(w); return st;
  }
  function typeset(e) { if (ML.typeset) try { ML.typeset(e); } catch (er) { } }

  // ================================================================ prob-square
  V.register('prob-square', function (el, o) {
    o = Object.assign({ layout: 'independent', pA: '2/5', pB: '1/2', pAB: null, condition: null, labels: {}, frac: true, snap: 20, show: [] }, o || {});
    var lay = o.layout, F = frame(el, o, lay === 'coins' ? 'Two coin flips as four equal squares, with three events' : 'Probability as area in a unit square'), Q = F.quiet, show = {};
    (o.show || []).forEach(function (k) { show[k] = 1; });
    function vis(k) { return !Q || show[k]; }
    var LA = o.labels.A || 'A', LB = o.labels.B || 'B';
    var c = F.canvas({ aspect: 1.25, max: 420, min: 280 }), ctx = c.ctx;
    if (lay === 'coins') return coinsLayout();

    var S = { a: fparse(o.pA) || Fr(2, 5), b: fparse(o.pB) || Fr(1, 2), cond: null, t: 0 };
    S.a = clampF(S.a); S.b = clampF(S.b);
    if (lay === 'free') {
      var ab = o.pAB != null ? fparse(o.pAB) : fmul(S.a, S.b);
      S.b1 = fz(S.a) ? ZERO : clampF(fdiv(ab, S.a));
      S.b2 = feq(S.a, ONE) ? ZERO : clampF(fdiv(fsub(S.b, ab), fsub(ONE, S.a)));
    }
    if (lay === 'disjoint' && fcmp(fadd(S.a, S.b), ONE) > 0) S.b = fsub(ONE, S.a);
    function clampF(f) { return fcmp(f, ZERO) < 0 ? ZERO : fcmp(f, ONE) > 0 ? ONE : f; }
    function probs() {
      var pAB = lay === 'independent' ? fmul(S.a, S.b) : lay === 'disjoint' ? ZERO : fmul(S.a, S.b1);
      var pB = lay === 'free' ? fadd(fmul(S.a, S.b1), fmul(fsub(ONE, S.a), S.b2)) : S.b;
      return { A: S.a, B: pB, AB: pAB };
    }
    function cells() { // rectangles [x0, x1, y0, y1] in the unit square, y up
      var a = fnum(S.a), b = fnum(S.b);
      if (lay === 'independent') return { AB: [0, a, 0, b], ABc: [0, a, b, 1], AcB: [a, 1, 0, b], AcBc: [a, 1, b, 1] };
      if (lay === 'disjoint') return { AB: [0, 0, 0, 0], ABc: [0, a, 0, 1], AcB: [1 - b, 1, 0, 1], AcBc: [a, 1 - b, 0, 1] };
      var b1 = fnum(S.b1), b2 = fnum(S.b2);
      return { AB: [0, a, 0, b1], ABc: [0, a, b1, 1], AcB: [a, 1, 0, b2], AcBc: [a, 1, b2, 1] };
    }
    var IN = { AB: [1, 1], ABc: [1, 0], AcB: [0, 1], AcBc: [0, 0] };
    function targets(pr) { // where the condition's pieces go when it is rescaled to fill the square
      if (S.cond === 'B') { var r = fz(pr.B) ? 0 : fnum(pr.AB) / fnum(pr.B); return { AB: [0, r, 0, 1], AcB: [r, 1, 0, 1] }; }
      var s2 = fz(pr.A) ? 0 : fnum(pr.AB) / fnum(pr.A); return { AB: [0, 1, 0, s2], ABc: [0, 1, s2, 1] };
    }
    var G = {};
    function geom() { var pad = 26, s = M.min(c.w - 2 * pad, c.h - 2 * pad - 10); G = { s: s, x0: (c.w - s) / 2, y0: pad + 4 }; }
    function X(u) { return G.x0 + u * G.s; }
    function Y(v) { return G.y0 + (1 - v) * G.s; }
    function hatch(r, col, ang) {
      ctx.save(); ctx.beginPath(); ctx.rect(X(r[0]), Y(r[3]), (r[1] - r[0]) * G.s, (r[3] - r[2]) * G.s); ctx.clip();
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath();
      for (var d = -G.s * 2; d < G.s * 2; d += 9) { if (ang === 'h') { ctx.moveTo(G.x0, G.y0 + d); ctx.lineTo(G.x0 + G.s, G.y0 + d); } else { ctx.moveTo(G.x0 + d, G.y0 + G.s); ctx.lineTo(G.x0 + d + G.s, G.y0); } }
      ctx.stroke(); ctx.restore();
    }
    var kn = null, sel = 0;
    function handles() { if (!F.edit || S.cond) return []; return lay === 'independent' ? ['a', 'b'] : lay === 'disjoint' ? ['a', 'b'] : ['a', 'b1', 'b2']; }
    function draw() {
      geom(); var k = V.colors(), pr = probs(), C = cells(), t = S.cond ? ease(S.t) : 0, TG = S.cond ? targets(pr) : null;
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      ctx.fillStyle = k.panel; ctx.fillRect(G.x0, G.y0, G.s, G.s);
      Object.keys(C).forEach(function (key) {
        var inA = IN[key][0], inB = IN[key][1], inC = S.cond === 'A' ? inA : S.cond === 'B' ? inB : 1, r = C[key];
        if (S.cond && inC && TG[key]) r = r.map(function (v, i) { return lerp(v, TG[key][i], t); });
        if (r[1] - r[0] <= 1e-9 || r[3] - r[2] <= 1e-9) return;
        ctx.save(); ctx.globalAlpha = inC ? 1 : 1 - t;
        var px = X(r[0]), py = Y(r[3]), pw = (r[1] - r[0]) * G.s, ph = (r[3] - r[2]) * G.s;
        if (!inA && !inB) { ctx.fillStyle = k.panel; ctx.fillRect(px, py, pw, ph); }
        if (inA) { ctx.fillStyle = rgba(k.blue, D.documentElement.getAttribute('data-theme') === 'dark' ? 0.46 : 0.3); ctx.fillRect(px, py, pw, ph); }
        if (inB) { ctx.fillStyle = rgba(k.orange, 0.26); ctx.fillRect(px, py, pw, ph); hatch(r, rgba(k.orange, 0.55), 'd'); }
        ctx.strokeStyle = rgba(k.ink, 0.25); ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
        ctx.restore();
        // region label
        if ((!S.cond || inC) && pw > 34 && ph > 26) {
          var name = inA && inB ? LA + ' ∩ ' + LB : inA ? LA + (lay === 'disjoint' ? '' : ' only') : inB ? LB + (lay === 'disjoint' ? '' : ' only') : 'neither', val = null;
          if (inA && inB && vis('pAB')) val = pr.AB;
          var cx = px + pw / 2, cy = py + ph / 2;
          ctx.save(); ctx.globalAlpha = inC ? 1 : 1 - t;
          if (pw < 90 && name.length > 8) name = inA && inB ? '∩' : name.replace(' only', '');
          txt(ctx, name, cx, cy - (val ? 9 : 0), { size: 12, color: inA && inB ? k.ink : inA ? k.blue : inB ? k.orange : k.muted });
          if (val && !S.cond) txt(ctx, o.frac ? ftxt(val) : dec(fnum(val), 3), cx, cy + 9, { size: 13, w: 700 });
          if (S.cond && t > 0.98 && inA && inB && vis(S.cond === 'B' ? 'pAgB' : 'pBgA')) { var cv2 = fdiv(pr.AB, S.cond === 'B' ? pr.B : pr.A); txt(ctx, (S.cond === 'B' ? 'P(A ∣ B)' : 'P(B ∣ A)') + ' = ' + (o.frac ? ftxt(cv2) : dec(fnum(cv2), 3)), cx, cy + 14, { size: 12, w: 700 }); }
          ctx.restore();
        }
      });
      ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.strokeRect(G.x0, G.y0, G.s, G.s);
      if (!S.cond || t < 0.02) {
        // outlines of A and B
        var a = fnum(S.a), b = fnum(S.b);
        ctx.save(); ctx.lineWidth = 2.5; ctx.strokeStyle = k.blue; if (a > 0) ctx.strokeRect(X(0), Y(1), a * G.s, G.s); ctx.strokeStyle = k.orange; ctx.setLineDash([7, 4]); ctx.beginPath();
        if (lay === 'independent') ctx.rect(X(0), Y(b), G.s, b * G.s);
        else if (lay === 'disjoint') ctx.rect(X(1 - b), Y(1), b * G.s, G.s);
        else { var b1 = fnum(S.b1), b2 = fnum(S.b2); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(b1)); ctx.lineTo(X(a), Y(b1)); ctx.lineTo(X(a), Y(b2)); ctx.lineTo(X(1), Y(b2)); ctx.lineTo(X(1), Y(0)); ctx.closePath(); }
        ctx.stroke(); ctx.restore();
        // edge labels
        if (vis('pA')) txt(ctx, 'P(' + LA + ') = ' + (o.frac ? ftxt(S.a) : dec(fnum(S.a), 3)), X(a / 2), G.y0 + G.s + 13, { size: 12, color: k.blue });
        if (lay === 'independent' && vis('pB')) { ctx.save(); ctx.translate(G.x0 - 12, Y(b / 2)); ctx.rotate(-M.PI / 2); txt(ctx, 'P(' + LB + ') = ' + (o.frac ? ftxt(S.b) : dec(fnum(S.b), 3)), 0, 0, { size: 12, color: k.orange }); ctx.restore(); }
        if (lay === 'disjoint' && vis('pB')) txt(ctx, 'P(' + LB + ') = ' + (o.frac ? ftxt(S.b) : dec(fnum(S.b), 3)), X(1 - b / 2), G.y0 + G.s + 13, { size: 12, color: k.orange });
        // handles
        var hs = handles();
        hs.forEach(function (h, i) {
          var on = kn && kn.focus && i === sel % hs.length, hx, hy, vert;
          if (h === 'a') { hx = X(a); hy = Y(0.5); vert = true; }
          else if (h === 'b') { if (lay === 'disjoint') { hx = X(1 - b); hy = Y(0.5); vert = true; } else { hx = X(0.5); hy = Y(b); vert = false; } }
          else if (h === 'b1') { hx = X(a / 2); hy = Y(fnum(S.b1)); vert = false; }
          else { hx = X((1 + a) / 2); hy = Y(fnum(S.b2)); vert = false; }
          ctx.save(); ctx.fillStyle = h === 'a' ? k.blue : k.orange; ctx.strokeStyle = k.bg; ctx.lineWidth = 2;
          ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(hx - (vert ? 6 : 14), hy - (vert ? 14 : 6), vert ? 12 : 28, vert ? 28 : 12, 6); else ctx.rect(hx - 7, hy - 7, 14, 14); ctx.fill(); ctx.stroke();
          if (on) { ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy, 19, 0, 2 * M.PI); ctx.stroke(); }
          ctx.restore();
        });
      }
      if (S.cond && t > 0.98) txt(ctx, 'Inside ' + (S.cond === 'A' ? LA : LB) + ', rescaled to fill the square', c.w / 2, 12, { size: 12, color: k.muted });
      c.cv.setAttribute('aria-label', 'Unit square. ' + LA + ' has area ' + ftxt(pr.A) + (vis('pB') ? ', ' + LB + ' has area ' + ftxt(pr.B) : '') + (vis('pAB') ? ', the overlap has area ' + ftxt(pr.AB) : '') + '.' + (hs0() ? ' Arrow keys move an edge; Enter picks the next edge.' : ''));
      say(pr);
    }
    function hs0() { return handles().length > 0; }
    function P(s) { return '$' + s + '$'; }
    function fx(f) { return o.frac ? ftex(f) : dec(fnum(f), 3); }
    function say(pr) {
      var parts = [];
      if (vis('pA')) parts.push(P('P(A) = ' + fx(pr.A)));
      if (vis('pB')) parts.push(P('P(B) = ' + fx(pr.B)));
      if (vis('pAB')) parts.push(P('P(A \\cap B) = ' + fx(pr.AB)) + ' (the overlap)');
      var h = (LA !== 'A' || LB !== 'B' ? 'A = ' + esc(LA) + ', B = ' + esc(LB) + '. ' : '') + parts.join(', ') + (parts.length ? '. ' : '');
      if (!Q) {
        var prod = fmul(pr.A, pr.B), ind = feq(prod, pr.AB);
        h += P('P(A)\\,P(B) = ' + fx(prod)) + ': ' + (ind ? '<span class="pv-ok">equal, so A and B are independent.</span>' : '<span class="pv-no">not equal, so A and B are dependent' + (lay === 'disjoint' && !fz(pr.A) && !fz(pr.B) ? ' (disjoint events with positive probabilities never are independent)' : '') + '.</span>');
      }
      if (S.cond && (!Q || show[S.cond === 'B' ? 'pAgB' : 'pBgA'])) {
        var den = S.cond === 'B' ? pr.B : pr.A;
        if (fz(den)) h += ' ' + (S.cond === 'B' ? LB : LA) + ' has probability 0, so there is nothing to condition on.';
        else h += '<br>Given ' + S.cond + ': ' + P('P(' + (S.cond === 'B' ? 'A \\mid B' : 'B \\mid A') + ') = \\frac{P(A \\cap B)}{P(' + S.cond + ')} = ' + fx(fdiv(pr.AB, den))) + ', the share of the rescaled square that ' + (S.cond === 'B' ? 'A' : 'B') + ' covers.';
      }
      F.out.set(h);
    }
    function setVal(h, u) { // u in [0, 1], snapped
      var sn = o.snap || 20, f = Fr(M.round(clamp(u, 0, 1) * sn), sn);
      if (h === 'a') { if (lay === 'disjoint' && fcmp(fadd(f, S.b), ONE) > 0) f = fsub(ONE, S.b); S.a = f; }
      else if (h === 'b') { if (lay === 'disjoint') { f = fsub(ONE, f); if (fcmp(fadd(f, S.a), ONE) > 0) f = fsub(ONE, S.a); } S.b = f; }
      else S[h] = f;
    }
    function val(h) { return h === 'a' ? fnum(S.a) : h === 'b' ? (lay === 'disjoint' ? 1 - fnum(S.b) : fnum(S.b)) : fnum(S[h]); }
    function isVert(h) { return h === 'a' || (h === 'b' && lay === 'disjoint'); }
    if (F.edit) {
      V.drag(c.cv, {
        hit: function (px, py) {
          var hs = handles(), best = null, bd = 16, a = fnum(S.a);
          hs.forEach(function (h) {
            var d;
            if (isVert(h)) { d = py >= G.y0 - 4 && py <= G.y0 + G.s + 4 ? M.abs(px - X(val(h))) : 99; }
            else { var lo = h === 'b2' ? a : 0, hi = h === 'b1' ? a : 1; d = px >= X(lo) - 4 && px <= X(hi) + 4 ? M.abs(py - Y(val(h))) : 99; }
            if (d < bd) { bd = d; best = h; }
          });
          return best;
        },
        start: function (h) { sel = handles().indexOf(h); },
        move: function (h, px, py) { setVal(h, isVert(h) ? (px - G.x0) / G.s : 1 - (py - G.y0) / G.s); draw(); }
      });
      kn = keyNav(c.cv, { count: function () { return handles().length; }, sel: function (i) { sel = i; draw(); }, redraw: function () { draw(); },
        move: function (i, dx, dy) { var hs = handles(), h = hs[i]; if (!h) return; var d = isVert(h) ? dx : dy; if (!d) return; setVal(h, val(h) + d / (o.snap || 20)); draw(); } });
      var seg = V.seg(F.ctl, { label: 'Condition', items: [['', 'Whole square'], ['A', 'Given ' + LA], ['B', 'Given ' + LB]], value: o.condition || '', change: function (v) { condTo(v || null); } });
    }
    var anim = null;
    function condTo(v) {
      if (anim) anim.stop(); S.cond = v; S.t = 0;
      if (!v) { draw(); return; }
      anim = animate(el, 650, function (t) { S.t = t; draw(); });
    }
    c.onResize(draw);
    V.onTheme(draw);
    if (o.condition) { S.cond = o.condition; S.t = 1; }
    draw();
    return { update: function () { draw(); } };

    // ---------------------------------------------------------------- coins layout
    function coinsLayout() {
      var cellsC = [['HH', 0, 0], ['HT', 0, 1], ['TH', 1, 0], ['TT', 1, 1]];
      var EV = { A: { name: 'first flip heads', has: ['HH', 'HT'], col: 'blue', dir: 'h' }, B: { name: 'second flip heads', has: ['HH', 'TH'], col: 'orange', dir: 'v' }, C: { name: 'the flips match', has: ['HH', 'TT'], col: 'purple', dir: 'd' } };
      var on = { A: true, B: true, C: true };
      if (F.edit) on = toggleRow(F.ctl, [['A', 'A: first heads'], ['B', 'B: second heads'], ['C', 'C: flips match']], ['A', 'B', 'C'], function () { drawC(); });
      var leg = mk('div', 'pv-legend'); leg.innerHTML = Object.keys(EV).map(function (e) { return '<span><i style="background:' + V.colors()[EV[e].col] + '"></i>' + e + ' = ' + EV[e].name + '</span>'; }).join(''); F.box.appendChild(leg);
      function drawC() {
        var k = V.colors(), pad = 22, s = M.min(c.w - 2 * pad, c.h - 2 * pad), x0 = (c.w - s) / 2, y0 = (c.h - s) / 2, h2 = s / 2;
        ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
        cellsC.forEach(function (cl) {
          var x = x0 + cl[2] * h2, y = y0 + cl[1] * h2; ctx.fillStyle = k.panel; ctx.fillRect(x, y, h2, h2);
          Object.keys(EV).forEach(function (e, ei) {
            if (!on[e] || EV[e].has.indexOf(cl[0]) < 0) return;
            ctx.save(); ctx.beginPath(); ctx.rect(x, y, h2, h2); ctx.clip(); ctx.strokeStyle = rgba(k[EV[e].col], 0.75); ctx.lineWidth = 3; ctx.beginPath();
            for (var d = -h2; d < 2 * h2; d += 14) {
              if (EV[e].dir === 'h') { ctx.moveTo(x, y + d + 3); ctx.lineTo(x + h2, y + d + 3); }
              else if (EV[e].dir === 'v') { ctx.moveTo(x + d + 8, y); ctx.lineTo(x + d + 8, y + h2); }
              else { ctx.moveTo(x + d, y + h2); ctx.lineTo(x + d + h2, y); }
            }
            ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = k[EV[e].col]; ctx.strokeRect(x + 3 + ei * 5, y + 3 + ei * 5, h2 - 6 - ei * 10, h2 - 6 - ei * 10); ctx.restore();
          });
          pill(ctx, cl[0] + (Q ? '' : '  1/4'), x + h2 / 2, y + h2 / 2, k.ink, { size: 15 });
        });
        ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, s, s); ctx.beginPath(); ctx.moveTo(x0 + h2, y0); ctx.lineTo(x0 + h2, y0 + s); ctx.moveTo(x0, y0 + h2); ctx.lineTo(x0 + s, y0 + h2); ctx.stroke();
        txt(ctx, 'second flip: H', x0 + h2 / 2, y0 - 10, { size: 11, color: k.muted }); txt(ctx, 'second flip: T', x0 + 1.5 * h2, y0 - 10, { size: 11, color: k.muted });
        c.cv.setAttribute('aria-label', 'Four equally likely outcomes HH, HT, TH, TT. A = first flip heads (HH, HT), B = second flip heads (HH, TH), C = the flips match (HH, TT).');
        if (Q) { F.out.set('Each of the four outcomes has probability $\\frac{1}{4}$.'); return; }
        var rows = [['A', 'B'], ['A', 'C'], ['B', 'C']].map(function (pq) {
          var both = EV[pq[0]].has.filter(function (x) { return EV[pq[1]].has.indexOf(x) >= 0; }).length;
          return '$P(' + pq[0] + ' \\cap ' + pq[1] + ') = \\frac{' + both + '}{4}$' + (both === 1 ? ' $= \\frac{1}{2} \\cdot \\frac{1}{2}$ <span class="pv-ok">✓</span>' : ' <span class="pv-no">✗</span>');
        });
        F.out.set('Each event has probability $\\frac{1}{2}$. ' + rows.join('; ') + '. Every pair is independent. But $P(A \\cap B \\cap C) = P(\\{HH\\}) = \\frac{1}{4}$, while $P(A)P(B)P(C) = \\frac{1}{8}$ <span class="pv-no">✗</span>: knowing A and B happened makes C certain. The three are independent in pairs, not all together.');
      }
      c.onResize(drawC); V.onTheme(drawC); drawC();
      return { update: drawC };
    }
  });

  // ================================================================ prob-table
  V.register('prob-table', function (el, o) {
    o = Object.assign({ mode: 'marginal', frac: true, names: {}, given: null }, o || {});
    var xs, ys, P;
    if (o.preset === 'x-xsq') { xs = [-1, 0, 1]; ys = [0, 1]; P = [['0', '1/3', '0'], ['1/3', '0', '1/3']]; }
    else if (o.preset === 'dice-max-min') { xs = [1, 2, 3, 4, 5, 6]; ys = [1, 2, 3, 4, 5, 6]; P = ys.map(function (yv) { return xs.map(function (xv) { return yv === xv ? '1/36' : yv < xv ? '2/36' : '0'; }); }); }
    else { xs = o.x || [0, 1]; ys = o.y || [0, 1]; P = o.p || [['1/4', '1/4'], ['1/4', '1/4']]; }
    P = P.map(function (r) { return r.map(function (v) { return fparse(v) || ZERO; }); });
    var NX = o.names.X || 'X', NY = o.names.Y || 'Y';
    var F = frame(el, o, 'Joint distribution table of ' + NX + ' and ' + NY), Q = F.quiet;
    var nr = ys.length, nc = xs.length;
    var rowT = P.map(function (r) { return fsum(r); }), colT = xs.map(function (_, j) { return fsum(P.map(function (r) { return r[j]; })); }), tot = fsum(rowT);
    var numeric = xs.concat(ys).every(function (v) { return typeof v === 'number' || (typeof v === 'string' && fparse(v)); });
    var xv = numeric ? xs.map(function (v) { return fparse(v); }) : null, yv = numeric ? ys.map(function (v) { return fparse(v); }) : null;
    var pmax = 0; P.forEach(function (r) { r.forEach(function (v) { pmax = M.max(pmax, fnum(v)); }); });
    var modes = (o.modes || [o.mode]).filter(function (m) { return numeric || (m !== 'covariance' && m !== 'cexp'); });
    var S = { mode: modes.indexOf(o.mode) >= 0 ? o.mode : modes[0], sel: null, given: o.given ? (o.given.y != null ? { ax: 'y', i: idxOf(ys, o.given.y) } : { ax: 'x', i: idxOf(xs, o.given.x) }) : null };
    if (S.given && S.given.i < 0) S.given = null;
    function idxOf(arr, v) { for (var i = 0; i < arr.length; i++) if (String(arr[i]) === String(v)) return i; return -1; }
    function show(f) { return o.frac ? ftxt(f) : dec(fnum(f), 3); }
    function vt(v) { return typeof v === 'number' ? V.fmt(v, 4) : esc(v); }
    var wrap = mk('div', 'pv-tbl'); F.box.appendChild(wrap);
    var extra = mk('div', ''); F.box.appendChild(extra);
    if (modes.length > 1 && F.edit) V.seg(F.ctl, { label: 'View', items: modes.map(function (m) { return [m, { marginal: 'Marginals', conditional: 'Condition', independence: 'Independent?', covariance: 'Covariance', cexp: 'Conditional means' }[m] || m]; }), value: S.mode, change: function (m) { S.mode = m; S.sel = null; render(); } });
    var mu = numeric ? { x: fsum(xv.map(function (x, j) { return fmul(x, colT[j]); })), y: fsum(yv.map(function (y, i) { return fmul(y, rowT[i]); })) } : null;
    function heat(v) { var k = V.colors(); return rgba(k.blue, 0.06 + 0.42 * (pmax ? fnum(v) / pmax : 0)); }
    function render() {
      var m = S.mode, k = V.colors(), h = '<table><thead><tr><th scope="col">' + esc(NY) + ' \\ ' + esc(NX) + '</th>';
      xs.forEach(function (x, j) { h += '<th scope="col"' + (m === 'conditional' && F.edit ? ' data-k="c' + j + '" tabindex="0" role="button" aria-label="Condition on ' + esc(NX) + ' = ' + esc(String(x)) + '"' : '') + (S.given && S.given.ax === 'x' && S.given.i === j ? ' class="pv-on"' : '') + '>' + vt(x) + '</th>'; });
      var showTot = !Q;
      h += '<th scope="col">P(' + esc(NY) + ' = y)</th>' + (m === 'cexp' ? '<th scope="col">E[' + esc(NX) + ' ∣ ' + esc(NY) + ' = y]</th>' : '') + '</tr></thead><tbody>';
      var indep = true;
      ys.forEach(function (y, i) {
        var rowOn = S.given && S.given.ax === 'y' && S.given.i === i;
        h += '<tr><th scope="row"' + (m === 'conditional' && F.edit ? ' data-k="r' + i + '" tabindex="0" role="button" aria-label="Condition on ' + esc(NY) + ' = ' + esc(String(y)) + '"' : '') + (rowOn ? ' class="pv-on"' : '') + '>' + vt(y) + '</th>';
        xs.forEach(function (x, j) {
          var v = P[i][j], cls = [], sty = 'background:' + heat(v), inner = show(v);
          var dim = S.given && ((S.given.ax === 'y' && S.given.i !== i) || (S.given.ax === 'x' && S.given.i !== j));
          if (m === 'conditional' && dim) cls.push('pv-dim');
          if (m === 'marginal' && S.sel && S.sel[0] === i && S.sel[1] === j) cls.push('pv-on');
          if (m === 'independence') { var pr = fmul(rowT[i], colT[j]), eq = feq(pr, v); if (!eq) indep = false; sty = ''; if (!Q) cls.push(eq ? 'pv-good' : 'pv-badc'); inner += Q ? '' : '<small>' + (eq ? '= ' : '≠ ') + show(colT[j]) + '·' + show(rowT[i]) + '</small>'; }
          if (m === 'covariance') { var d = fmul(fsub(xv[j], mu.x), fsub(yv[i], mu.y)), sg = d.n > 0n ? 'p' : d.n < 0n ? 'm' : 'z'; if (!Q) inner += '<span class="pv-sg ' + sg + '" aria-label="' + (sg === 'p' ? 'positive' : sg === 'm' ? 'negative' : 'zero') + ' product">' + (sg === 'p' ? '+' : sg === 'm' ? '−' : '0') + '</span>'; }
          var act = m === 'marginal' && F.edit;
          h += '<td style="' + sty + '"' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + (act ? ' data-k="e' + i + '_' + j + '" tabindex="0" role="button" aria-label="P(' + esc(NX) + ' = ' + esc(String(x)) + ', ' + esc(NY) + ' = ' + esc(String(y)) + ') = ' + show(v) + '"' : '') + '>' + inner + '</td>';
        });
        h += '<td class="pv-tot">' + (showTot ? show(rowT[i]) : '?') + '</td>';
        if (m === 'cexp') h += '<td class="pv-tot">' + (Q ? '?' : fz(rowT[i]) ? '—' : show(fdiv(fsum(xv.map(function (x, j) { return fmul(x, P[i][j]); })), rowT[i]))) + '</td>';
        h += '</tr>';
      });
      h += '<tr><th scope="row">P(' + esc(NX) + ' = x)</th>' + xs.map(function (x, j) { return '<td class="pv-tot">' + (showTot ? show(colT[j]) : '?') + '</td>'; }).join('') + '<td class="pv-tot">' + show(tot) + '</td>' + (m === 'cexp' ? '<td></td>' : '') + '</tr></tbody></table>';
      wrap.innerHTML = h;
      extra.innerHTML = '';
      var say = '';
      if (!feq(tot, ONE)) say = '<span class="pv-no">The cells add to ' + show(tot) + ', not 1: this is not a joint distribution.</span> ';
      if (m === 'marginal') {
        if (S.sel && !Q) { var i0 = S.sel[0], j0 = S.sel[1]; say += 'One cell: $P(' + NX + ' = ' + xs[j0] + ',\\ ' + NY + ' = ' + ys[i0] + ') = ' + ftex(P[i0][j0]) + '$. The marginal $P(' + NX + ' = ' + xs[j0] + ') = ' + ftex(colT[j0]) + '$ adds its column, and $P(' + NY + ' = ' + ys[i0] + ') = ' + ftex(rowT[i0]) + '$ adds its row.'; }
        else if (!Q) say += 'Each cell is a joint probability. Add across a row or down a column for the marginals (the totals). Click a cell.';
      }
      if (m === 'conditional') {
        if (!S.given) say += F.edit ? 'Click a row label (' + NY + ' = y) or a column label (' + NX + ' = x) to condition on it.' : '';
        else {
          var gy = S.given.ax === 'y', gi = S.given.i, line = gy ? P[gi] : P.map(function (r) { return r[gi]; }), T = gy ? rowT[gi] : colT[gi], labs = gy ? xs : ys;
          var vals = line.map(function (v) { return fz(T) ? ZERO : fdiv(v, T); });
          var bars = '<div class="pv-bars" role="img" aria-label="Conditional distribution">' + vals.map(function (v) { return '<div class="pv-bar" style="height:' + (fnum(v) * 100).toFixed(1) + '%">' + (Q ? '' : '<span>' + show(v) + '</span>') + '</div>'; }).join('') + '</div><div class="pv-barlab">' + labs.map(function (l) { return '<span>' + vt(l) + '</span>'; }).join('') + '</div>';
          extra.innerHTML = '<p class="pv-cap">' + (gy ? NX : NY) + ' given ' + (gy ? NY + ' = ' + vt(ys[gi]) : NX + ' = ' + vt(xs[gi])) + ': the ' + (gy ? 'row' : 'column') + ' divided by its total' + (Q ? '' : ' ' + show(T)) + '.</p>' + bars;
          if (!Q) say += 'Given $' + (gy ? NY + ' = ' + ys[gi] : NX + ' = ' + xs[gi]) + '$: divide each cell of that ' + (gy ? 'row' : 'column') + ' by $' + ftex(T) + '$. ' + vals.map(function (v, q) { return '$P(' + (gy ? NX + ' = ' + xs[q] + ' \\mid ' + NY + ' = ' + ys[gi] : NY + ' = ' + ys[q] + ' \\mid ' + NX + ' = ' + xs[gi]) + ') = ' + ftex(v) + '$'; }).join(', ') + '; they add to 1.';
        }
      }
      if (m === 'independence' && !Q) say += indep ? '<span class="pv-ok">Every cell equals the product of its marginals: ' + NX + ' and ' + NY + ' are independent.</span>' : '<span class="pv-no">At least one cell (red) differs from the product of its marginals: ' + NX + ' and ' + NY + ' are dependent.</span> One matching cell is not enough; every cell must factor.';
      if (m === 'covariance' && !Q) {
        var exy = fsum(ys.map(function (y, i) { return fsum(xs.map(function (x, j) { return fmul(fmul(xv[j], yv[i]), P[i][j]); })); })), cov = fsub(exy, fmul(mu.x, mu.y));
        var vx = fsub(fsum(xv.map(function (x, j) { return fmul(fmul(x, x), colT[j]); })), fmul(mu.x, mu.x)), vy = fsub(fsum(yv.map(function (y, i) { return fmul(fmul(y, y), rowT[i]); })), fmul(mu.y, mu.y));
        var rho = fz(vx) || fz(vy) ? null : fnum(cov) / M.sqrt(fnum(vx) * fnum(vy));
        say += '$E[' + NX + '] = ' + ftex(mu.x) + '$, $E[' + NY + '] = ' + ftex(mu.y) + '$, $E[' + NX + NY + '] = ' + ftex(exy) + '$. $\\operatorname{Cov}(' + NX + ', ' + NY + ') = E[' + NX + NY + '] - E[' + NX + ']E[' + NY + '] = ' + ftex(cov) + '$' + (rho !== null ? ', $\\rho \\approx ' + dec(rho, 3) + '$' : '') + '. The badges show the sign of $(x - \\mu_X)(y - \\mu_Y)$ in each cell.';
      }
      if (m === 'cexp' && !Q) {
        var terms = ys.map(function (y, i) { return fz(rowT[i]) ? null : ftex(rowT[i]) + ' \\cdot ' + ftex(fdiv(fsum(xv.map(function (x, j) { return fmul(x, P[i][j]); })), rowT[i])); }).filter(Boolean);
        say += 'Each row\'s conditional mean, weighted by how likely the row is: $$E[' + NX + '] = \\sum_y P(' + NY + ' = y)\\,E[' + NX + ' \\mid ' + NY + ' = y]$$ $$= ' + terms.join(' + ') + ' = ' + ftex(mu.x) + '.$$';
      }
      F.out.set(say);
      wrap.querySelectorAll('[data-k]').forEach(function (e) {
        function act() { var key = e.getAttribute('data-k'); if (key[0] === 'e') { var p = key.slice(1).split('_'); S.sel = [+p[0], +p[1]]; } else if (key[0] === 'r') S.given = { ax: 'y', i: +key.slice(1) }; else S.given = { ax: 'x', i: +key.slice(1) }; render(); var again = wrap.querySelector('[data-k="' + key + '"]'); if (again) again.focus(); }
        e.addEventListener('click', act); e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); act(); } });
      });
      typeset(extra);
    }
    V.onTheme(render); render();
    return { update: render };
  });

  // ================================================================ prob-region
  function supportOf(sp) {
    if (sp && typeof sp === 'object' && sp.rect) { var r = sp.rect; return { box: [r[0], r[1], r[2], r[3]], has: function (x, y) { return x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3]; }, area: (r[1] - r[0]) * (r[3] - r[2]), poly: [[r[0], r[2]], [r[1], r[2]], [r[1], r[3]], [r[0], r[3]]], name: 'the rectangle' }; }
    if (sp && typeof sp === 'object' && sp.poly) {
      var pts = sp.poly, xs2 = pts.map(function (p) { return p[0]; }), ys2 = pts.map(function (p) { return p[1]; }), A = 0;
      for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; }
      return { box: [M.min.apply(M, xs2), M.max.apply(M, xs2), M.min.apply(M, ys2), M.max.apply(M, ys2)], area: M.abs(A) / 2, poly: pts, name: 'the region',
        has: function (x, y) { var ins = false; for (var i2 = 0, j = pts.length - 1; i2 < pts.length; j = i2++) { var a = pts[i2], b = pts[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins; } return ins; } };
    }
    switch (sp) {
      case 'triangle': return { box: [0, 1, 0, 1], area: 0.5, has: function (x, y) { return x >= 0 && x <= y && y <= 1; }, poly: [[0, 0], [1, 1], [0, 1]], name: 'the triangle 0 < x < y < 1' };
      case 'lower': return { box: [0, 1, 0, 1], area: 0.5, has: function (x, y) { return y >= 0 && y <= x && x <= 1; }, poly: [[0, 0], [1, 0], [1, 1]], name: 'the triangle 0 < y < x < 1' };
      case 'simplex': return { box: [0, 1, 0, 1], area: 0.5, has: function (x, y) { return x >= 0 && y >= 0 && x + y <= 1; }, poly: [[0, 0], [1, 0], [0, 1]], name: 'the triangle x, y > 0, x + y < 1' };
      case 'disk': return { box: [-1, 1, -1, 1], area: M.PI, has: function (x, y) { return x * x + y * y <= 1; }, circle: true, name: 'the unit disk' };
      default: return { box: [0, 1, 0, 1], area: 1, has: function (x, y) { return x >= 0 && x <= 1 && y >= 0 && y <= 1; }, poly: [[0, 0], [1, 0], [1, 1], [0, 1]], name: 'the unit square' };
    }
  }
  function eventOf(src) {
    src = String(src || '').trim(); if (!src) return null;
    var parts = src.split(/\s+and\s+|&&|\s*&\s*/).map(function (s) {
      var m = /^(.*?)(<=|>=|<|>)(.*)$/.exec(s); if (!m) throw new Error('event needs a comparison: ' + s);
      var g = compile('(' + m[1] + ')-(' + m[3] + ')', ['x', 'y']), op = m[2];
      return function (x, y) { var v = g(x, y); return op[0] === '<' ? v < 0 || (op === '<=' && v === 0) : v > 0 || (op === '>=' && v === 0); };
    });
    return function (x, y) { for (var i = 0; i < parts.length; i++) if (!parts[i](x, y)) return false; return true; };
  }
  // the intervals of y (or x) at a fixed x (or y) where test holds, found by sampling and bisection
  function runs(test, lo, hi, n) {
    var out = [], h = (hi - lo) / n, prev = test(lo), start = prev ? lo : null;
    function edge(a, b, va) { for (var k = 0; k < 44; k++) { var m = (a + b) / 2; if (test(m) === va) a = m; else b = m; } return (a + b) / 2; }
    for (var i = 1; i <= n; i++) { var u = lo + i * h, cur = test(u); if (cur !== prev) { var e = edge(u - h, u, prev); if (cur) start = e; else { out.push([start, e]); start = null; } prev = cur; } }
    if (prev && start !== null) out.push([start, hi]);
    return out;
  }
  V.register('prob-region', function (el, o) {
    o = Object.assign({ support: 'square', f: 'uniform', event: 'x<y', eventLabel: '', slices: 'x', at: 0.5, marginal: false, samples: 0, seed: 1 }, o || {});
    var F = frame(el, o, 'A joint density on the plane with an event region'), Q = F.quiet;
    var SP = supportOf(o.support), box = SP.box, uni = o.f === 'uniform' || o.f === '' || o.f == null;
    var fxy = uni ? function () { return 1 / SP.area; } : compile(o.f, ['x', 'y']);
    var ev = eventOf(o.event), evName = o.eventLabel || (o.event ? prettyMath(o.event) : '');
    function f(x, y) { return SP.has(x, y) ? M.max(0, fxy(x, y)) : 0; }
    var c = F.canvas({ aspect: 1.15, max: 430, min: 280 }), ctx = c.ctx, cm = null;
    if (o.marginal) { cm = V.canvas(F.box, { height: 120 }); cm.cv.style.marginTop = '6px'; cm.cv.setAttribute('role', 'img'); cm.cv.style.touchAction = 'pan-y'; }
    var S = { at: o.at, dir: o.slices || '', pts: [], r: rng(o.seed) };
    var pad = 30, G = {};
    function geom() { var w = c.w - 2 * pad, h = c.h - 2 * pad, sx = w / (box[1] - box[0]), sy = h / (box[3] - box[2]), s = M.min(sx, sy); G = { s: s, x0: (c.w - s * (box[1] - box[0])) / 2, y0: (c.h - s * (box[3] - box[2])) / 2 }; }
    function X(x) { return G.x0 + (x - box[0]) * G.s; } function Y(y) { return G.y0 + (box[3] - y) * G.s; }
    function ix(px) { return box[0] + (px - G.x0) / G.s; } function iy(py) { return box[3] - (py - G.y0) / G.s; }
    // probabilities: outer Gauss–Legendre over x, inner runs over y
    function dbl(test) {
      return integ(function (x) { var rs = runs(function (y) { return test(x, y); }, box[2], box[3], 160), s = 0; rs.forEach(function (r) { s += integ(function (y) { return f(x, y); }, r[0], r[1], 4); }); return s; }, box[0], box[1], 60);
    }
    var total = dbl(function (x, y) { return SP.has(x, y); }), pEv = ev ? dbl(function (x, y) { return SP.has(x, y) && ev(x, y); }) : null;
    var fmax = 0; for (var i = 0; i <= 60; i++) for (var j = 0; j <= 60; j++) { var xx = lerp(box[0], box[1], i / 60), yy = lerp(box[2], box[3], j / 60); fmax = M.max(fmax, f(xx, yy)); }
    var off = D.createElement('canvas'), img = null, imgKey = '';
    function paint() { // the shaded support and event, at CSS-pixel resolution
      var w = M.max(1, M.round((box[1] - box[0]) * G.s)), h = M.max(1, M.round((box[3] - box[2]) * G.s)), k = V.colors(), key = w + 'x' + h + k.bg;
      if (key === imgKey) return; imgKey = key; off.width = w; off.height = h; var cx2 = off.getContext('2d'), id = cx2.createImageData(w, h), d = id.data;
      function rgb(hex) { var v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
      var bg = rgb(k.bg), gr = rgb(k.green), or = rgb(k.orange), dark = D.documentElement.getAttribute('data-theme') === 'dark';
      for (var py = 0; py < h; py++) for (var px = 0; px < w; px++) {
        var x = box[0] + (px + 0.5) / G.s, y = box[3] - (py + 0.5) / G.s, o4 = (py * w + px) * 4, col = bg, a = 0;
        if (SP.has(x, y)) { var t = fmax ? f(x, y) / fmax : 0; var inE = ev && ev(x, y); col = inE ? or : gr; a = (inE ? 0.32 : 0.14) + (inE ? 0.42 : 0.5) * t; if (inE && ((px + py) % 9 < 2)) a = M.min(1, a + (dark ? 0.35 : 0.3)); }
        d[o4] = M.round(bg[0] * (1 - a) + col[0] * a); d[o4 + 1] = M.round(bg[1] * (1 - a) + col[1] * a); d[o4 + 2] = M.round(bg[2] * (1 - a) + col[2] * a); d[o4 + 3] = 255;
      }
      cx2.putImageData(id, 0, 0);
    }
    function sliceRuns(at) { var dirX = S.dir === 'x'; return { sup: runs(function (u) { return dirX ? SP.has(at, u) : SP.has(u, at); }, dirX ? box[2] : box[0], dirX ? box[3] : box[1], 240), evr: ev ? runs(function (u) { return dirX ? SP.has(at, u) && ev(at, u) : SP.has(u, at) && ev(u, at); }, dirX ? box[2] : box[0], dirX ? box[3] : box[1], 240) : [] }; }
    function marg(at) { var dirX = S.dir !== 'y', rs = sliceRuns(at).sup, s = 0; rs.forEach(function (r) { s += integ(function (u) { return dirX ? f(at, u) : f(u, at); }, r[0], r[1], 8); }); return s; }
    var mvals = null;
    function draw() {
      geom(); paint(); var k = V.colors();
      ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      // grid and axes
      var st = niceStep(box[1] - box[0], (box[1] - box[0]) * G.s);
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
      for (var gx = M.ceil(box[0] / st) * st; gx <= box[1] + 1e-9; gx += st) { ctx.moveTo(X(gx) + 0.5, Y(box[2])); ctx.lineTo(X(gx) + 0.5, Y(box[3])); }
      for (var gy = M.ceil(box[2] / st) * st; gy <= box[3] + 1e-9; gy += st) { ctx.moveTo(X(box[0]), Y(gy) + 0.5); ctx.lineTo(X(box[1]), Y(gy) + 0.5); }
      ctx.stroke(); ctx.restore();
      ctx.drawImage(off, X(box[0]), Y(box[3]), (box[1] - box[0]) * G.s, (box[3] - box[2]) * G.s);
      ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath();
      if (SP.circle) ctx.arc(X(0), Y(0), G.s, 0, 2 * M.PI); else SP.poly.forEach(function (p, q) { ctx[q ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); });
      ctx.closePath(); ctx.stroke(); ctx.restore();
      for (gx = M.ceil(box[0] / st) * st; gx <= box[1] + 1e-9; gx += st) if (!(S.dir === 'x' && M.abs(X(gx) - X(S.at)) < 16)) txt(ctx, V.fmt(gx, 3), X(gx), Y(box[2]) + 12, { size: 11, color: k.muted, w: 500 });
      for (gy = M.ceil(box[2] / st) * st; gy <= box[3] + 1e-9; gy += st) if (!(S.dir === 'y' && M.abs(Y(gy) - Y(S.at)) < 12)) txt(ctx, V.fmt(gy, 3), X(box[0]) - 6, Y(gy), { size: 11, color: k.muted, w: 500, align: 'right' });
      txt(ctx, 'x', X(box[1]) + 12, Y(box[2]) + 12, { it: true, serif: true, size: 14 }); txt(ctx, 'y', X(box[0]) - 14, Y(box[3]) - 12, { it: true, serif: true, size: 14 });
      // points
      S.pts.forEach(function (p) { ctx.fillStyle = p[2] ? k.orange : k.green; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 2.3, 0, 2 * M.PI); ctx.fill(); });
      // slice
      var sr = null;
      if (S.dir) {
        sr = sliceRuns(S.at); var dirX = S.dir === 'x';
        function segL(r, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); if (dirX) { ctx.moveTo(X(S.at), Y(r[0])); ctx.lineTo(X(S.at), Y(r[1])); } else { ctx.moveTo(X(r[0]), Y(S.at)); ctx.lineTo(X(r[1]), Y(S.at)); } ctx.stroke(); }
        ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = k.muted; ctx.lineWidth = 1.2; ctx.beginPath(); if (dirX) { ctx.moveTo(X(S.at), Y(box[2])); ctx.lineTo(X(S.at), Y(box[3])); } else { ctx.moveTo(X(box[0]), Y(S.at)); ctx.lineTo(X(box[1]), Y(S.at)); } ctx.stroke(); ctx.setLineDash([]);
        sr.sup.forEach(function (r) { segL(r, k.ink, 3); }); sr.evr.forEach(function (r) { segL(r, k.red, 5); });
        if (!Q) sr.evr.forEach(function (r) { [r[0], r[1]].forEach(function (u, q) { var px = dirX ? X(S.at) : X(u), py = dirX ? Y(u) : Y(S.at); ctx.fillStyle = k.red; ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * M.PI); ctx.fill(); pill(ctx, (dirX ? 'y = ' : 'x = ') + V.fmt(u, 2), px + (dirX ? 8 : (q ? -4 : 4)), py + (dirX ? 0 : -14), k.red, { align: dirX ? 'left' : (q ? 'right' : 'left'), W: c.w, H: c.h, size: 11 }); }); });
        // handle
        var hx = dirX ? X(S.at) : X(box[0]) - 1, hy = dirX ? Y(box[2]) + 1 : Y(S.at); ctx.fillStyle = k.red; ctx.beginPath();
        if (dirX) { ctx.moveTo(hx, hy); ctx.lineTo(hx - 8, hy + 12); ctx.lineTo(hx + 8, hy + 12); } else { ctx.moveTo(hx, hy); ctx.lineTo(hx - 12, hy - 8); ctx.lineTo(hx - 12, hy + 8); } ctx.closePath(); ctx.fill();
        if (kn && kn.focus) { ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx + (dirX ? 0 : -6), hy + (dirX ? 6 : 0), 14, 0, 2 * M.PI); ctx.stroke(); }
        ctx.restore();
      }
      c.cv.setAttribute('aria-label', 'Support: ' + SP.name + ', shaded by the density' + (ev ? '; the event ' + evName + ' in orange' : '') + '.' + (S.dir ? ' Arrow keys move the slice.' : ''));
      drawMarg(); say(sr);
    }
    function drawMarg() {
      if (!cm) return; var k = V.colors(), ct = cm.ctx, w = cm.w, h = cm.h, dirX = S.dir !== 'y', lo = dirX ? box[0] : box[2], hi = dirX ? box[1] : box[3];
      if (!mvals) { mvals = []; for (var i2 = 0; i2 <= 120; i2++) { var u = lerp(lo, hi, i2 / 120); mvals.push([u, marg(u)]); } }
      var top = 0; mvals.forEach(function (p) { top = M.max(top, p[1]); }); top = top * 1.2 || 1;
      var x0 = G.x0, x1 = G.x0 + (hi - lo) * G.s; function px(u) { return x0 + (u - lo) / (hi - lo) * (x1 - x0); } function py(v) { return h - 18 - v / top * (h - 30); }
      ct.clearRect(0, 0, w, h); ct.fillStyle = k.bg; ct.fillRect(0, 0, w, h);
      ct.strokeStyle = k.axis; ct.lineWidth = 1.2; ct.beginPath(); ct.moveTo(x0, py(0)); ct.lineTo(x1, py(0)); ct.stroke();
      ct.fillStyle = rgba(k.green, 0.22); ct.beginPath(); ct.moveTo(px(lo), py(0)); mvals.forEach(function (p) { ct.lineTo(px(p[0]), py(p[1])); }); ct.lineTo(px(hi), py(0)); ct.closePath(); ct.fill();
      ct.strokeStyle = k.green; ct.lineWidth = 2.5; ct.beginPath(); mvals.forEach(function (p, q) { ct[q ? 'lineTo' : 'moveTo'](px(p[0]), py(p[1])); }); ct.stroke();
      txt(ct, (dirX ? 'f_X(x)' : 'f_Y(y)') + ', the slice totals', x0, 9, { size: 11, color: k.muted, align: 'left', w: 500 });
      if (S.dir) { var mv = marg(S.at); ct.fillStyle = k.red; ct.beginPath(); ct.arc(px(S.at), py(mv), 4.5, 0, 2 * M.PI); ct.fill(); if (!Q) pill(ct, (dirX ? 'f_X(' : 'f_Y(') + V.fmt(S.at, 2) + ') = ' + V.fmt(mv, 3), px(S.at) + 8, py(mv) - 10, k.red, { align: 'left', W: w, H: h, size: 11 }); }
      cm.cv.setAttribute('aria-label', 'The marginal density of ' + (dirX ? 'X' : 'Y') + ': at each value, the total of the density along that slice.');
    }
    function say(sr) {
      var h = '';
      if (M.abs(total - 1) > 2e-4) h += '<span class="pv-no">The density has total ' + dec(total, 4) + ' over the support, not 1.</span> ';
      if (Q) { F.out.set(h); return; }
      if (ev) { var nt = niceTex(pEv); h += '$P(' + (o.eventLabel || evName.replace(/\|/g, '\\lvert ').replace(/</g, '<')) + ') = \\iint f\\,dA \\approx ' + dec(pEv, 4) + (nt ? ' = ' + nt : '') + '$' + (uni && ev ? ' (for a uniform density: the event\'s area over the support\'s area).' : '.'); }
      if (sr) {
        var dirX = S.dir === 'x', v = dirX ? 'y' : 'x', r = ev ? sr.evr : sr.sup;
        h += ' At $' + (dirX ? 'x' : 'y') + ' = ' + V.fmt(S.at, 2) + '$, ' + (r.length ? 'the slice runs over ' + r.map(function (q) { return '$' + V.fmt(q[0], 2) + ' \\le ' + v + ' \\le ' + V.fmt(q[1], 2) + '$'; }).join(' and ') : 'the slice misses the ' + (ev ? 'event' : 'support')) + ': these are the inner limits at this ' + (dirX ? 'x' : 'y') + '.';
      }
      if (S.pts.length && ev) { var inn = S.pts.filter(function (p) { return p[2]; }).length; h += ' Points: ' + inn + ' of ' + S.pts.length + ' in the event (' + dec(inn / S.pts.length, 3) + ').'; }
      F.out.set(h);
    }
    function addPts(n) { for (var q = 0; q < n; q++) { for (var tries = 0; tries < 200; tries++) { var x = lerp(box[0], box[1], S.r()), y = lerp(box[2], box[3], S.r()); if (!SP.has(x, y)) continue; if (S.r() * fmax > f(x, y)) continue; S.pts.push([x, y, ev ? ev(x, y) : false]); break; } } }
    if (o.samples) addPts(o.samples);
    var kn = null;
    if (S.dir && F.edit) {
      c.cv.style.touchAction = 'pan-y';
      V.drag(c.cv, { touchAction: 'pan-y', hit: function (px, py) { var dirX = S.dir === 'x'; return dirX ? (M.abs(px - X(S.at)) < 22 ? 1 : null) : (M.abs(py - Y(S.at)) < 22 ? 1 : null); },
        move: function (h, px, py) { var dirX = S.dir === 'x'; S.at = M.round(clamp(dirX ? ix(px) : iy(py), dirX ? box[0] : box[2], dirX ? box[1] : box[3]) * 100) / 100; draw(); } });
      kn = keyNav(c.cv, { count: function () { return 1; }, redraw: draw, move: function (i, dx, dy, big) { var dirX = S.dir === 'x', d = dirX ? dx : dy; if (!d) return; S.at = M.round(clamp(S.at + d * (big ? 0.1 : 0.01) * ((dirX ? box[1] - box[0] : box[3] - box[2])), dirX ? box[0] : box[2], dirX ? box[1] : box[3]) * 100) / 100; draw(); } });
    }
    if (F.edit) {
      var bt = mk('div', 'ml-seg'); F.ctl.appendChild(bt);
      V.button(bt, 'Add 100 random points', function () { addPts(100); draw(); }); V.button(bt, 'Clear points', function () { S.pts = []; draw(); });
    }
    var legend = mk('div', 'pv-legend'); legend.innerHTML = '<span><i style="background:' + rgba(V.colors().green, 0.5) + '"></i>support (darker = larger density)</span>' + (ev ? '<span><i style="background:' + rgba(V.colors().orange, 0.6) + '"></i>the event ' + esc(evName) + '</span>' : '');
    F.box.insertBefore(legend, F.box.firstChild.nextSibling);
    c.onResize(function () { imgKey = ''; draw(); }); V.onTheme(function () { imgKey = ''; draw(); });
    if (cm) cm.onResize(drawMarg);
    draw();
    return { update: draw };
  });

  // ================================================================ prob-density
  function erf(x) { // Abramowitz–Stegun 7.1.26 refined: |error| < 1.2e-7
    var s = x < 0 ? -1 : 1; x = M.abs(x); var t = 1 / (1 + 0.5 * x);
    var y = 1 - t * M.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return s * y;
  }
  function distOf(o) {
    var p = o.params || {}, d = o.dist || 'uniform';
    if (d === 'pmf') { var pm = o.pmf || { x: [0, 1, 2], p: ['1/4', '1/2', '1/4'] }, fr = pm.p.map(function (v) { return fparse(v) || ZERO; }); return { disc: true, xs: pm.x.map(Number), fr: fr, ps: fr.map(fnum), name: 'a discrete distribution' }; }
    var D2 = { brk: [] };
    if (d === 'uniform') { var a = num(p.a, 0), b = num(p.b, 1); D2.f = function (x) { return x >= a && x <= b ? 1 / (b - a) : 0; }; D2.lo = a; D2.hi = b; D2.name = 'uniform on [' + V.fmt(a, 3) + ', ' + V.fmt(b, 3) + ']'; }
    else if (d === 'triangle') { var a2 = num(p.a, 0), c2 = num(p.c, 1), b2 = num(p.b, 2), ht = 2 / (b2 - a2); D2.f = function (x) { return x < a2 || x > b2 ? 0 : x <= c2 ? (c2 === a2 ? ht : ht * (x - a2) / (c2 - a2)) : (b2 === c2 ? ht : ht * (b2 - x) / (b2 - c2)); }; D2.lo = a2; D2.hi = b2; D2.brk = [c2]; D2.name = 'a triangular density'; }
    else if (d === 'exp') { var L = num(p.lambda, 1); D2.f = function (x) { return x < 0 ? 0 : L * M.exp(-L * x); }; D2.F = function (x) { return x <= 0 ? 0 : 1 - M.exp(-L * x); }; D2.lo = 0; D2.hi = Infinity; D2.view = [-0.4 / L, 5 / L]; D2.name = 'exponential with rate ' + V.fmt(L, 3); }
    else if (d === 'normal') { var mu = num(p.mu, 0), sg = num(p.sigma, 1); D2.f = function (x) { return M.exp(-0.5 * M.pow((x - mu) / sg, 2)) / (sg * M.sqrt(2 * M.PI)); }; D2.F = function (x) { return 0.5 * (1 + erf((x - mu) / (sg * M.SQRT2))); }; D2.lo = -Infinity; D2.hi = Infinity; D2.view = [mu - 4 * sg, mu + 4 * sg]; D2.name = 'normal'; }
    else if (d === 'poly') { var g = compile(o.f || '2x', ['x']), lo = num(p.lo, 0), hi = num(p.hi, 1); D2.f = function (x) { return x >= lo && x <= hi ? M.max(0, g(x)) : 0; }; D2.lo = lo; D2.hi = hi; D2.name = 'f(x) = ' + prettyMath(o.f || '2x'); }
    else if (d === 'piecewise') { var pcs = (o.pieces || [['x', 0, 1], ['2-x', 1, 2]]).map(function (q) { return { g: compile(q[0], ['x']), a: num(q[1], 0), b: num(q[2], 1) }; }); D2.f = function (x) { for (var i = 0; i < pcs.length; i++) if (x >= pcs[i].a && x <= pcs[i].b) return M.max(0, pcs[i].g(x)); return 0; }; D2.lo = pcs[0].a; D2.hi = pcs[pcs.length - 1].b; D2.brk = pcs.map(function (q) { return q.a; }).concat(pcs.map(function (q) { return q.b; })); D2.name = 'a piecewise density'; }
    if (!D2.F) { var lo2 = D2.lo, brk = D2.brk.filter(function (v) { return v > lo2 && v < D2.hi; }).sort(function (u, v) { return u - v; });
      D2.F = function (x) { if (x <= lo2) return 0; var top = M.min(x, D2.hi), s = 0, a3 = lo2; brk.concat([top]).forEach(function (b3) { if (b3 > top) b3 = top; if (b3 > a3) { s += integ(D2.f, a3, b3, 24); a3 = b3; } }); return M.min(1, s); }; }
    return D2;
  }
  V.register('prob-density', function (el, o) {
    o = Object.assign({ dist: 'uniform', params: {}, show: ['pdf', 'cdf'], mean: false, median: false, transform: '', closed: '(]' }, o || {});
    var Ds = distOf(o), disc = !!Ds.disc, F = frame(el, o, 'Density and CDF of ' + (Ds.name || 'X')), Q = F.quiet, k0 = V.colors();
    var showCdf = o.show.indexOf('cdf') >= 0 || !!o.transform, tf = o.transform ? compile(o.transform, ['x']) : null;
    var lo, hi;
    if (disc) { lo = M.min.apply(M, Ds.xs); hi = M.max.apply(M, Ds.xs); var spn = M.max(1, hi - lo); lo -= spn * 0.15 + 0.6; hi += spn * 0.15 + 0.6; }
    else if (Ds.view) { lo = Ds.view[0]; hi = Ds.view[1]; }
    else { var sp2 = Ds.hi - Ds.lo; lo = Ds.lo - sp2 * 0.18; hi = Ds.hi + sp2 * 0.18; }
    if (o.xmin != null) lo = num(o.xmin, lo); if (o.xmax != null) hi = num(o.xmax, hi);
    // discrete helpers
    var dcum = null; if (disc) { var acc = ZERO; dcum = Ds.fr.map(function (v) { acc = fadd(acc, v); return acc; }); }
    function Fd(x) { var s = ZERO; Ds.xs.forEach(function (v, i) { if (v <= x + 1e-12) s = fadd(s, Ds.fr[i]); }); return s; }
    function Fdm(x) { var s = ZERO; Ds.xs.forEach(function (v, i) { if (v < x - 1e-12) s = fadd(s, Ds.fr[i]); }); return s; }
    function Fc(x) { return disc ? fnum(Fd(x)) : Ds.F(x); }
    var S = { a: o.a != null ? num(o.a, 0) : null, b: o.b != null ? num(o.b, 1) : null, cl: o.closed, cur: null, x0: o.x0 != null ? num(o.x0, 0) : null };
    if (S.a === null || S.b === null) { if (disc) { var n2 = Ds.xs.length; S.a = Ds.xs[M.floor(n2 / 4)]; S.b = Ds.xs[M.min(n2 - 1, M.ceil(3 * n2 / 4))]; } else { S.a = lerp(lo, hi, 0.35); S.b = lerp(lo, hi, 0.6); } }
    // mean and median
    var mean, median;
    if (disc) { mean = Ds.xs.reduce(function (s, x, i) { return s + x * Ds.ps[i]; }, 0); for (var q = 0; q < Ds.xs.length; q++) if (fnum(dcum[q]) >= 0.5 - 1e-12) { median = Ds.xs[q]; break; } }
    else {
      var mlo = isFinite(Ds.lo) ? Ds.lo : lo, mhi = isFinite(Ds.hi) ? Ds.hi : hi + (hi - lo) * 3;
      mean = integ(function (x) { return x * Ds.f(x); }, mlo, mhi, 200); var A = mlo, B = mhi; for (var it = 0; it < 60; it++) { var mid = (A + B) / 2; if (Ds.F(mid) < 0.5) A = mid; else B = mid; } median = (A + B) / 2;
    }
    // transform: density of Y = g(X) by summing over preimages
    var TY = null;
    if (tf) {
      var xa = isFinite(Ds.lo) ? Ds.lo : lo, xb = isFinite(Ds.hi) ? Ds.hi : hi, gs = [], gmin = Infinity, gmax = -Infinity;
      for (var i3 = 0; i3 <= 800; i3++) { var xg = lerp(xa, xb, i3 / 800), gv = tf(xg); gs.push([xg, gv]); if (isFinite(gv)) { gmin = M.min(gmin, gv); gmax = M.max(gmax, gv); } }
      var dg = function (x) { var h = 1e-5 * M.max(1, M.abs(x)); return (tf(x + h) - tf(x - h)) / (2 * h); };
      var fy = function (y) { var s = 0; for (var i4 = 1; i4 < gs.length; i4++) { var u = gs[i4 - 1], v = gs[i4]; if ((u[1] - y) * (v[1] - y) <= 0 && u[1] !== v[1]) { if (v[1] === y && i4 < gs.length - 1) continue; var A2 = u[0], B2 = v[0], sa = u[1] - y; for (var k = 0; k < 50; k++) { var m2 = (A2 + B2) / 2, sm = tf(m2) - y; if (sm * sa <= 0) B2 = m2; else { A2 = m2; sa = sm; } } var xr = (A2 + B2) / 2, d1 = M.abs(dg(xr)); if (d1 > 1e-12) s += Ds.f(xr) / d1; } } return s; };
      var ys2 = []; for (var i5 = 0; i5 <= 240; i5++) { var yv2 = lerp(gmin, gmax, i5 / 240); ys2.push([yv2, fy(yv2)]); }
      var srt = ys2.map(function (p) { return p[1]; }).filter(isFinite).sort(function (u, v) { return u - v; });
      TY = { fy: fy, pts: ys2, lo: gmin - (gmax - gmin) * 0.08, hi: gmax + (gmax - gmin) * 0.08, top: M.max(srt[M.floor(srt.length * 0.85)] * 1.5, srt[M.floor(srt.length / 2)] * 2.2) || 1, dg: dg };
      if (S.x0 === null) S.x0 = lerp(xa, xb, 0.55);
    }
    var fTop = 0; if (disc) fTop = M.max.apply(M, Ds.ps); else for (var i6 = 0; i6 <= 400; i6++) fTop = M.max(fTop, Ds.f(lerp(lo, hi, i6 / 400)));
    fTop = fTop * 1.18 || 1;
    var c = F.canvas({ aspect: showCdf ? 1.05 : 1.9, max: showCdf ? 470 : 300, min: showCdf ? 330 : 200 }), ctx = c.ctx;
    c.cv.style.touchAction = 'pan-y';
    var L = {};
    function lay() { var l = 46, r = 16, top1 = 18, h1 = showCdf ? (c.h - 58) * 0.56 : c.h - 44; L = { l: l, r: c.w - r, t1: top1, b1: top1 + h1, t2: top1 + h1 + 34, b2: c.h - 22 }; }
    function X(x) { return L.l + (x - lo) / (hi - lo) * (L.r - L.l); } function ix(px) { return lo + (px - L.l) / (L.r - L.l) * (hi - lo); }
    function Y1(v) { return L.b1 - v / fTop * (L.b1 - L.t1); }
    function Y2(v) { return L.b2 - v * (L.b2 - L.t2) / 1.08; }
    function YX(y) { return L.l + (y - TY.lo) / (TY.hi - TY.lo) * (L.r - L.l); } function Yv(v) { return L.b2 - M.min(v, TY.top) / TY.top * (L.b2 - L.t2); }
    function snapD(x) { if (!disc) return M.round(x * 100) / 100; var best = Ds.xs[0]; Ds.xs.forEach(function (v) { if (M.abs(v - x) < M.abs(best - x)) best = v; }); return best; }
    function inInt(x) { var A = S.cl[0] === '[' ? x >= S.a - 1e-12 : x > S.a + 1e-12, B = S.cl[1] === ']' ? x <= S.b + 1e-12 : x < S.b - 1e-12; return A && B; }
    function probAB() { if (disc) { var s = ZERO; Ds.xs.forEach(function (v, i) { if (inInt(v)) s = fadd(s, Ds.fr[i]); }); return s; } return M.max(0, Ds.F(S.b) - Ds.F(S.a)); }
    function axes(t, b, ylab, ticks, Xf, l2, h2, avoid) {
      var k = V.colors(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L.l, b); ctx.lineTo(L.r, b); ctx.moveTo(L.l, t - 4); ctx.lineTo(L.l, b); ctx.stroke();
      var a0 = l2 === undefined ? lo : l2, a1 = h2 === undefined ? hi : h2, st = niceStep(a1 - a0, L.r - L.l);
      for (var x = M.ceil(a0 / st) * st; x <= a1 + 1e-9; x += st) { var px = Xf(x); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(px, t); ctx.lineTo(px, b); ctx.stroke(); if (!(avoid || []).some(function (v) { return M.abs(Xf(v) - px) < 14; })) txt(ctx, V.fmt(x, 3), px, b + 10, { size: 11, color: k.muted, w: 500 }); }
      ticks.forEach(function (tk) { txt(ctx, tk[1], L.l - 5, tk[0], { size: 11, color: k.muted, w: 500, align: 'right' }); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(L.l, tk[0]); ctx.lineTo(L.r, tk[0]); ctx.stroke(); });
      txt(ctx, ylab, L.l + 4, t - 8, { size: 12, align: 'left', it: true, serif: true });
    }
    var kn = null, sel = 0;
    function draw() {
      lay(); var k = V.colors(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var tk1 = [], stp = niceStep(fTop, L.b1 - L.t1); for (var v = stp; v < fTop; v += stp) tk1.push([Y1(v), V.fmt(v, 3)]);
      axes(L.t1, L.b1, disc ? 'P(X = x)' : 'f(x)', tk1, X, undefined, undefined, tf ? [S.x0] : [S.a, S.b]);
      if (!tf) {
        // shaded interval
        if (!disc) { ctx.fillStyle = rgba(k.orange, 0.32); ctx.beginPath(); ctx.moveTo(X(S.a), Y1(0)); for (var i = 0; i <= 160; i++) { var x = lerp(S.a, S.b, i / 160); ctx.lineTo(X(x), Y1(Ds.f(x))); } ctx.lineTo(X(S.b), Y1(0)); ctx.closePath(); ctx.fill(); }
      } else {
        var dx = (hi - lo) / 40; ctx.fillStyle = rgba(k.orange, 0.45); ctx.fillRect(X(S.x0), Y1(Ds.f(S.x0 + dx / 2)), X(S.x0 + dx) - X(S.x0), Y1(0) - Y1(Ds.f(S.x0 + dx / 2)));
      }
      if (disc) {
        var bw = M.max(6, M.min(34, (X(lo + 1) - X(lo)) * 0.55));
        Ds.xs.forEach(function (x, i) { var on = inInt(x); ctx.fillStyle = on ? k.orange : rgba(k.blue, 0.75); ctx.fillRect(X(x) - bw / 2, Y1(Ds.ps[i]), bw, Y1(0) - Y1(Ds.ps[i])); if (!Q || o.showP) txt(ctx, o.frac === false ? V.fmt(Ds.ps[i], 3) : ftxt(Ds.fr[i]), X(x), Y1(Ds.ps[i]) - 8, { size: 11, color: k.ink }); });
      } else {
        ctx.strokeStyle = k.blue; ctx.lineWidth = 2.6; ctx.beginPath(); var pen = false;
        for (var j = 0; j <= 600; j++) { var xx = lerp(lo, hi, j / 600), yv = Ds.f(xx); if (!isFinite(yv)) { pen = false; continue; } var py = Y1(yv); if (pen) ctx.lineTo(X(xx), py); else { ctx.moveTo(X(xx), py); pen = true; } }
        ctx.stroke();
      }
      // a, b handles
      if (!tf) [['a', S.a], ['b', S.b]].forEach(function (h, i) {
        var px = X(h[1]); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, L.t1); ctx.lineTo(px, showCdf ? L.b2 : L.b1); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = k.red; ctx.beginPath(); ctx.arc(px, L.b1, 7, 0, 2 * M.PI); ctx.fill(); txt(ctx, h[0], px, L.b1 + 21, { size: 13, it: true, serif: true, color: k.red, w: 700 });
        if (kn && kn.focus && sel % 2 === i) { ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, L.b1, 13, 0, 2 * M.PI); ctx.stroke(); }
      });
      // mean and median
      if (o.mean) { ctx.fillStyle = k.ink; ctx.beginPath(); ctx.moveTo(X(mean), L.b1 + 1); ctx.lineTo(X(mean) - 9, L.b1 + 14); ctx.lineTo(X(mean) + 9, L.b1 + 14); ctx.closePath(); ctx.fill(); pill(ctx, Q ? 'mean' : 'E[X] = ' + V.fmt(mean, 3), X(mean), L.t1 + 10, k.ink, { W: c.w, size: 11 }); }
      if (o.median) { ctx.strokeStyle = k.purple; ctx.lineWidth = 2; ctx.setLineDash([7, 4]); ctx.beginPath(); ctx.moveTo(X(median), L.t1); ctx.lineTo(X(median), showCdf ? L.b2 : L.b1); ctx.stroke(); ctx.setLineDash([]); pill(ctx, Q ? 'median' : 'median ' + V.fmt(median, 3), X(median), L.t1 + 28, k.purple, { W: c.w, size: 11 }); }
      if (showCdf && !tf) {
        axes(L.t2, L.b2, 'F(x)', [[Y2(0.5), '0.5'], [Y2(1), '1']], X);
        ctx.strokeStyle = k.green; ctx.lineWidth = 2.6;
        if (disc) {
          var prev = 0, xsS = Ds.xs.slice().sort(function (u, w) { return u - w; }), lastX = lo;
          ctx.beginPath(); xsS.forEach(function (x) { ctx.moveTo(X(lastX), Y2(prev)); ctx.lineTo(X(x), Y2(prev)); prev = fnum(Fd(x)); lastX = x; }); ctx.moveTo(X(lastX), Y2(prev)); ctx.lineTo(X(hi), Y2(prev)); ctx.stroke();
          xsS.forEach(function (x) { var below = fnum(Fdm(x)), at = fnum(Fd(x)); ctx.fillStyle = k.bg; ctx.strokeStyle = k.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(x), Y2(below), 4.5, 0, 2 * M.PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = k.green; ctx.beginPath(); ctx.arc(X(x), Y2(at), 4.5, 0, 2 * M.PI); ctx.fill(); });
        } else { ctx.beginPath(); for (var j2 = 0; j2 <= 300; j2++) { var x2 = lerp(lo, hi, j2 / 300); ctx[j2 ? 'lineTo' : 'moveTo'](X(x2), Y2(Ds.F(x2))); } ctx.stroke(); }
        // the gap F(b) − F(a)
        var Fa = disc ? fnum(S.cl[0] === '[' ? Fdm(S.a) : Fd(S.a)) : Ds.F(S.a), Fb = disc ? fnum(S.cl[1] === ']' ? Fd(S.b) : Fdm(S.b)) : Ds.F(S.b), gx = M.min(L.r - 12, X(S.b) + 16);
        ctx.strokeStyle = k.orange; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(S.a), Y2(Fa)); ctx.lineTo(gx, Y2(Fa)); ctx.moveTo(X(S.b), Y2(Fb)); ctx.lineTo(gx, Y2(Fb)); ctx.stroke(); ctx.setLineDash([]);
        ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(gx, Y2(Fa)); ctx.lineTo(gx, Y2(Fb)); ctx.stroke();
        if (median !== undefined && o.median) { ctx.fillStyle = k.purple; ctx.beginPath(); ctx.arc(X(median), Y2(0.5), 5, 0, 2 * M.PI); ctx.fill(); }
      }
      if (tf) {
        var tk2 = [], st2 = niceStep(TY.top, L.b2 - L.t2); for (var v2 = st2; v2 < TY.top; v2 += st2) tk2.push([Yv(v2), V.fmt(v2, 3)]);
        axes(L.t2, L.b2, 'density of Y = ' + prettyMath(o.transform), tk2, YX, TY.lo, TY.hi);
        var dx2 = (hi - lo) / 40, y0 = tf(S.x0), y1 = tf(S.x0 + dx2), ya = M.min(y0, y1), yb = M.max(y0, y1), fm2 = TY.fy((ya + yb) / 2);
        ctx.fillStyle = rgba(k.orange, 0.45); ctx.fillRect(YX(ya), Yv(fm2), M.max(1, YX(yb) - YX(ya)), Yv(0) - Yv(fm2));
        ctx.save(); ctx.beginPath(); ctx.rect(L.l, L.t2 - 2, L.r - L.l, L.b2 - L.t2 + 3); ctx.clip(); ctx.strokeStyle = k.teal; ctx.lineWidth = 2.6; ctx.beginPath(); var pen2 = false; TY.pts.forEach(function (p) { if (!(p[1] > 0)) { pen2 = false; return; } var py = L.b2 - p[1] / TY.top * (L.b2 - L.t2); if (pen2) ctx.lineTo(YX(p[0]), py); else { ctx.moveTo(YX(p[0]), py); pen2 = true; } }); ctx.stroke(); ctx.restore();
        // connector
        ctx.strokeStyle = rgba(k.orange, 0.9); ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(S.x0 + dx2 / 2), L.b1); ctx.lineTo(YX((ya + yb) / 2), Yv(fm2)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = k.red; ctx.beginPath(); ctx.arc(X(S.x0), L.b1, 7, 0, 2 * M.PI); ctx.fill();
        if (kn && kn.focus) { ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(S.x0), L.b1, 13, 0, 2 * M.PI); ctx.stroke(); }
      }
      if (S.cur !== null && !Q && !disc && !tf) {
        var fv = Ds.f(S.cur); ctx.strokeStyle = k.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(S.cur), L.t1); ctx.lineTo(X(S.cur), L.b1); ctx.stroke();
        ctx.fillStyle = k.blue; ctx.beginPath(); ctx.arc(X(S.cur), Y1(fv), 4.5, 0, 2 * M.PI); ctx.fill();
        pill(ctx, 'f(' + V.fmt(S.cur, 2) + ') = ' + V.fmt(fv, 3) + ': a density, not a probability', X(S.cur), M.max(L.t1 + 8, Y1(fv) - 16), k.blue, { W: c.w, H: c.h, size: 11 });
      }
      c.cv.setAttribute('aria-label', (disc ? 'Bars of the pmf' : 'Density curve') + (showCdf && !tf ? ' with the CDF below' : '') + (tf ? ' and the density of Y = ' + o.transform + ' below' : '') + '. Arrow keys move ' + (tf ? 'the strip' : 'a and b; Enter switches between them') + '.');
      say();
    }
    function say() {
      var h = '';
      if (tf) {
        var dx = (hi - lo) / 40, xm = S.x0 + dx / 2, ym = tf(xm), d1 = M.abs(TY.dg(xm));
        if (Q) { F.out.set('The strip from $x$ to $x + dx$ and its image hold the same probability.'); return; }
        h = 'The strip at $x \\approx ' + V.fmt(xm, 2) + '$ holds probability $f_X(x)\\,dx \\approx ' + V.fmt(Ds.f(xm) * dx, 4) + '$. It lands on $y = g(x) \\approx ' + V.fmt(ym, 3) + '$ in a strip $|g\'(x)| \\approx ' + V.fmt(d1, 3) + '$ times as wide, so the height there is $f_X(x)/|g\'(x)| \\approx ' + V.fmt(d1 ? Ds.f(xm) / d1 : 0, 3) + '$';
        var tot = TY.fy(ym); h += M.abs(tot - (d1 ? Ds.f(xm) / d1 : 0)) > 1e-6 ? '; adding the other $x$ with the same $y$ gives $f_Y(y) \\approx ' + V.fmt(tot, 3) + '$.' : ' $= f_Y(y)$.';
        F.out.set(h); return;
      }
      var p = probAB(), pv = disc ? (o.frac === false ? dec(fnum(p), 4) : ftex(p)) : dec(p, 4), iv = disc ? ({ '(]': 'a < X \\le b', '[]': 'a \\le X \\le b', '[)': 'a \\le X < b', '()': 'a < X < b' }[S.cl]) : 'a \\le X \\le b';
      var lbl = '$a = ' + V.fmt(S.a, 3) + '$, $b = ' + V.fmt(S.b, 3) + '$. ';
      if (Q) { F.out.set(lbl); return; }
      if (disc) {
        var expl = { '(]': 'F(b) - F(a)', '[]': 'F(b) - F(a) + P(X = a)', '[)': 'F(b) - F(a) + P(X = a) - P(X = b)', '()': 'F(b) - F(a) - P(X = b)' }[S.cl];
        h = lbl + '$P(' + iv + ') = ' + expl + ' = ' + pv + '$: the orange bars. ' + (S.cl !== '(]' ? 'With a discrete X, an endpoint that carries probability matters.' : '');
      } else {
        var nt = niceTex(p); h = lbl + '$P(' + iv + ') = F(b) - F(a) \\approx ' + V.fmt(Ds.F(S.b), 4) + ' - ' + V.fmt(Ds.F(S.a), 4) + ' = ' + pv + (nt && nt !== pv ? ' = ' + nt : '') + '$: the orange area, and the gap on the CDF.';
        if (fTop / 1.18 > 1.001) h += ' The curve rises above 1, and that is fine: a density\'s height is not a probability. Only areas are.';
      }
      if (o.mean) h += ' $E[X] ' + (disc ? '= ' : '\\approx ') + V.fmt(mean, 4) + '$ is the balance point.';
      if (o.median) h += ' The median $' + (disc ? '' : '\\approx ') + V.fmt(median, 4) + '$ is where $F = \\tfrac{1}{2}$.';
      F.out.set(h);
    }
    if (F.edit) {
      V.drag(c.cv, { touchAction: 'pan-y',
        hit: function (px, py) { if (tf) return M.abs(px - X(S.x0)) < 22 && py <= L.b1 + 26 ? 'x0' : null; var da = M.abs(px - X(S.a)), db = M.abs(px - X(S.b)); if (M.min(da, db) > 20) { if (py <= L.b1) { S.cur = ix(px); draw(); } return null; } return da <= db ? 'a' : 'b'; },
        start: function (h) { sel = h === 'b' ? 1 : 0; S.cur = null; },
        move: function (h, px) { var x = clamp(ix(px), lo, hi); if (h === 'x0') { S.x0 = M.round(clamp(x, (isFinite(Ds.lo) ? Ds.lo : lo), (isFinite(Ds.hi) ? Ds.hi : hi) - (hi - lo) / 40) * 100) / 100; } else if (h === 'a') S.a = M.min(snapD(x), S.b); else S.b = M.max(snapD(x), S.a); draw(); } });
      c.cv.addEventListener('pointermove', function (e) { if (tf || disc || e.buttons) return; var r = c.cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; if (py >= L.t1 && py <= L.b1 && px >= L.l && px <= L.r) { S.cur = ix(px); draw(); } });
      c.cv.addEventListener('pointerleave', function () { if (S.cur !== null) { S.cur = null; draw(); } });
      kn = keyNav(c.cv, { count: function () { return tf ? 1 : 2; }, sel: function (i) { sel = i; draw(); }, redraw: draw,
        move: function (i, dx, dy, big) { var d = dx || dy; if (!d) return; if (tf) { S.x0 = M.round(clamp(S.x0 + d * (hi - lo) / 100, isFinite(Ds.lo) ? Ds.lo : lo, (isFinite(Ds.hi) ? Ds.hi : hi) - (hi - lo) / 40) * 100) / 100; draw(); return; }
          var stp = disc ? 1 : (big ? 0.1 : 0.01) * (hi - lo), key = i % 2 ? 'b' : 'a', x = S[key] + d * stp; x = disc ? snapD(x) : M.round(x * 1000) / 1000; if (key === 'a') S.a = clamp(x, lo, S.b); else S.b = clamp(x, S.a, hi); draw(); } });
      if (disc) V.seg(F.ctl, { label: 'Which ends count', items: [['(]', 'a < X ≤ b'], ['[]', 'a ≤ X ≤ b'], ['[)', 'a ≤ X < b'], ['()', 'a < X < b']], value: S.cl, change: function (v) { S.cl = v; draw(); } });
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  });

  // ================================================================ prob-convolve
  function rvOf(spec) {
    if (spec && typeof spec === 'object') { var fr = spec.p.map(function (v) { return fparse(v) || ZERO; }); return mkDisc(spec.x.map(Number), fr, spec.name || 'X'); }
    switch (spec) {
      case 'coin': return mkDisc([0, 1], [Fr(1, 2), Fr(1, 2)], 'a coin (heads = 1)');
      case 'd4': return mkDisc([1, 2, 3, 4], [1, 2, 3, 4].map(function () { return Fr(1, 4); }), 'a four-sided die');
      case 'uniform': return { cont: true, f: function (x) { return x >= 0 && x <= 1 ? 1 : 0; }, lo: 0, hi: 1, mu: 0.5, sd: M.sqrt(1 / 12), name: 'uniform on [0, 1]' };
      case 'exp': return { cont: true, f: function (x) { return x >= 0 ? M.exp(-x) : 0; }, lo: 0, hi: 9, mu: 1, sd: 1, name: 'exponential with mean 1' };
      default: return mkDisc([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6].map(function () { return Fr(1, 6); }), 'a fair die');
    }
  }
  function mkDisc(xs, fr, name) { var ps = fr.map(fnum), mu = xs.reduce(function (s, x, i) { return s + x * ps[i]; }, 0), v = xs.reduce(function (s, x, i) { return s + (x - mu) * (x - mu) * ps[i]; }, 0); return { cont: false, xs: xs, fr: fr, ps: ps, mu: mu, sd: M.sqrt(v), name: name }; }
  function convD(A, B) { // exact convolution of two discrete distributions (integer values)
    var out = {}; A.xs.forEach(function (x, i) { B.xs.forEach(function (y, j) { var s = x + y; out[s] = out[s] ? fadd(out[s], fmul(A.fr[i], B.fr[j])) : fmul(A.fr[i], B.fr[j]); }); });
    var xs = Object.keys(out).map(Number).sort(function (u, v) { return u - v; }); return mkDisc(xs, xs.map(function (s) { return out[s]; }), 'sum');
  }
  function normPdf(x, mu, sd) { return M.exp(-0.5 * M.pow((x - mu) / sd, 2)) / (sd * M.sqrt(2 * M.PI)); }
  V.register('prob-convolve', function (el, o) {
    o = Object.assign({ X: 'die', mode: 'pairs', n: 1, show: 'sum', normal: true, s: null }, o || {});
    var A = rvOf(o.X), B = rvOf(o.Y != null ? o.Y : o.X), F = frame(el, o, o.mode === 'copies' ? 'Sums of independent copies and the normal curve' : 'The distribution of a sum, built pair by pair'), Q = F.quiet;
    var c = F.canvas({ aspect: o.mode === 'copies' ? 1.7 : 1.15, max: o.mode === 'copies' ? 360 : 470, min: 260 }), ctx = c.ctx;
    c.cv.style.touchAction = 'pan-y';
    if (o.mode === 'copies') return copies();
    var cont = A.cont, Sd = cont ? null : convD(A, B), sLo = cont ? A.lo + B.lo : Sd.xs[0], sHi = cont ? A.hi + B.hi : Sd.xs[Sd.xs.length - 1];
    if (cont && o.X === 'exp') sHi = 8;
    var S = { s: o.s != null ? num(o.s, 0) : cont ? (sLo + sHi) / 2 : Sd.xs[M.floor(Sd.xs.length / 2)] };
    var fS = null; if (cont) { fS = function (s) { return integ(function (t) { return A.f(t) * B.f(s - t); }, M.max(A.lo, s - B.hi), M.min(A.hi, s - B.lo), 24); }; }
    var sl = null;
    if (F.edit) sl = V.slider(F.ctl, { label: 'total s', min: sLo, max: sHi, step: cont ? 0.01 : 1, value: S.s, fmt: function (v) { return V.fmt(v, 2); }, input: function (v) { S.s = v; draw(); } });
    function draw() {
      var k = V.colors(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      if (cont) drawCont(k); else drawDisc(k);
    }
    function drawDisc(k) {
      var nx = A.xs.length, ny = B.xs.length, gTop = 26, gH = M.min(c.h * 0.5, c.w * 0.55), cs = M.min((c.w - 70) / nx, (gH - 10) / ny), gx0 = (c.w - cs * nx) / 2 + 14, pm = 0;
      Sd.ps.forEach(function (p) { pm = M.max(pm, p); });
      txt(ctx, 'P(X = k) · P(Y = j)', c.w / 2, 11, { size: 12, color: k.muted });
      var pmx = 0; A.ps.forEach(function (pa) { B.ps.forEach(function (pb) { pmx = M.max(pmx, pa * pb); }); });
      for (var i = 0; i < ny; i++) for (var j = 0; j < nx; j++) {
        var x = gx0 + j * cs, y = gTop + i * cs, on = A.xs[j] + B.xs[i] === S.s, pr = fmul(A.fr[j], B.fr[i]);
        ctx.fillStyle = on ? rgba(k.orange, 0.55) : rgba(k.blue, 0.08 + 0.3 * fnum(pr) / pmx); ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
        if (on) { ctx.strokeStyle = k.orange; ctx.lineWidth = 2.5; ctx.strokeRect(x + 1.5, y + 1.5, cs - 3, cs - 3); }
        if (cs > 30) txt(ctx, Q && on ? '' : ftxt(pr), x + cs / 2, y + cs / 2, { size: cs > 44 ? 11 : 9, color: k.ink, w: 500 });
      }
      for (j = 0; j < nx; j++) txt(ctx, 'k=' + A.xs[j], gx0 + (j + 0.5) * cs, gTop + ny * cs + 10, { size: 10, color: k.muted, w: 500 });
      for (i = 0; i < ny; i++) txt(ctx, 'j=' + B.xs[i], gx0 - 6, gTop + (i + 0.5) * cs, { size: 10, color: k.muted, w: 500, align: 'right' });
      // bars of the sum
      var bTop = gTop + ny * cs + 34, bBot = c.h - 22, l = 30, r = c.w - 12, n = Sd.xs.length, bw = (r - l) / n;
      Sd.xs.forEach(function (s, q) {
        var x = l + q * bw, h = (bBot - bTop - 14) * Sd.ps[q] / pm, on = s === S.s;
        ctx.fillStyle = on ? k.orange : rgba(k.blue, 0.7); ctx.fillRect(x + bw * 0.12, bBot - h, bw * 0.76, h);
        if (bw > 16 || s % 2 === 0) txt(ctx, String(s), x + bw / 2, bBot + 10, { size: 10, color: k.muted, w: 500 });
        if (on && !Q) pill(ctx, ftxt(Sd.fr[q]), x + bw / 2, bBot - h - 12, k.orange, { W: c.w, size: 11 });
      });
      ctx.strokeStyle = k.axis; ctx.beginPath(); ctx.moveTo(l, bBot); ctx.lineTo(r, bBot); ctx.stroke();
      txt(ctx, 'P(X + Y = s)', l, bTop - 6, { size: 12, color: k.muted, align: 'left' });
      c.cv.setAttribute('aria-label', 'A grid of products P(X = k)P(Y = j); the cells with k + j = ' + S.s + ' are highlighted, and below, the distribution of the sum.');
      var cellsOn = []; A.xs.forEach(function (x, j2) { B.xs.forEach(function (y, i2) { if (x + y === S.s) cellsOn.push({ x: x, y: y, p: fmul(A.fr[j2], B.fr[i2]) }); }); });
      var idx = Sd.xs.indexOf(S.s);
      if (Q) { F.out.set('Highlighted: the pairs with $k + j = ' + S.s + '$.'); return; }
      var vs = cellsOn.map(function (q2) { return ftex(q2.p); }), sumT = vs.length <= 4 ? vs.join(' + ') : vs[0] + ' + ' + vs[1] + ' + \\cdots + ' + vs[vs.length - 1];
      F.out.set('$P(X + Y = ' + S.s + ') = \\sum_k P(X = k)\\,P(Y = ' + S.s + ' - k)$ adds the ' + cellsOn.length + ' highlighted ' + (cellsOn.length === 1 ? 'cell' : 'cells') + ': $' + (vs.length > 1 ? sumT + ' = ' : '') + (idx >= 0 ? ftex(Sd.fr[idx]) : '0') + '$.');
    }
    function drawCont(k) {
      var l = 34, r = c.w - 12, h1t = 26, h1b = c.h * 0.48, h2t = h1b + 40, h2b = c.h - 22, t0 = M.max(sLo - B.hi, A.lo - 0.3 * (sHi - sLo)) - 0.2, t1 = sHi + 0.2;
      function X(t) { return l + (t - t0) / (t1 - t0) * (r - l); }
      var top1 = 1.25 * M.max(A.f(A.lo + 1e-9), B.f(B.lo + 1e-9), 1); function Y1(v) { return h1b - v / top1 * (h1b - h1t); }
      var vals = []; for (var i = 0; i <= 200; i++) { var s = lerp(sLo, sHi, i / 200); vals.push([s, fS(s)]); } var top2 = 0; vals.forEach(function (p) { top2 = M.max(top2, p[1]); }); top2 *= 1.25; function Y2(v) { return h2b - v / top2 * (h2b - h2t); }
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(l, h1b); ctx.lineTo(r, h1b); ctx.moveTo(l, h2b); ctx.lineTo(r, h2b); ctx.stroke();
      var st = niceStep(t1 - t0, r - l); for (var x = M.ceil(t0 / st) * st; x <= t1; x += st) { txt(ctx, V.fmt(x, 2), X(x), h1b + 10, { size: 10, color: k.muted, w: 500 }); txt(ctx, V.fmt(x, 2), X(x), h2b + 10, { size: 10, color: k.muted, w: 500 }); }
      // overlap product
      ctx.fillStyle = rgba(k.purple, 0.35); ctx.beginPath(); ctx.moveTo(X(t0), Y1(0)); for (i = 0; i <= 400; i++) { var t = lerp(t0, t1, i / 400); ctx.lineTo(X(t), Y1(A.f(t) * B.f(S.s - t))); } ctx.lineTo(X(t1), Y1(0)); ctx.closePath(); ctx.fill();
      function curve(fn, col, dash) { ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.setLineDash(dash || []); ctx.beginPath(); for (var q = 0; q <= 400; q++) { var tt = lerp(t0, t1, q / 400); ctx[q ? 'lineTo' : 'moveTo'](X(tt), Y1(fn(tt))); } ctx.stroke(); ctx.setLineDash([]); }
      curve(A.f, k.blue); curve(function (tt) { return B.f(S.s - tt); }, k.orange, [6, 4]);
      txt(ctx, fit(ctx, ['f_X(t) and the flipped f_Y(s − t); purple: their product', 'f_X(t), flipped f_Y(s − t), product'], r - l), l, 12, { size: 11, color: k.muted, align: 'left', w: 500 });
      ctx.strokeStyle = rgba(k.teal, 0.35); ctx.lineWidth = 2; ctx.beginPath(); vals.forEach(function (p, q) { ctx[q ? 'lineTo' : 'moveTo'](X(p[0]), Y2(p[1])); }); ctx.stroke();
      ctx.strokeStyle = k.teal; ctx.lineWidth = 3; ctx.beginPath(); vals.filter(function (p) { return p[0] <= S.s; }).forEach(function (p, q) { ctx[q ? 'lineTo' : 'moveTo'](X(p[0]), Y2(p[1])); }); ctx.stroke();
      var fv = fS(S.s); ctx.fillStyle = k.purple; ctx.beginPath(); ctx.arc(X(S.s), Y2(fv), 5, 0, 2 * M.PI); ctx.fill();
      txt(ctx, 'f_S(s), the density of S = X + Y', l, h2t - 10, { size: 11, color: k.muted, align: 'left', w: 500 });
      ctx.strokeStyle = k.red; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(S.s), h2t); ctx.lineTo(X(S.s), h2b); ctx.stroke(); ctx.setLineDash([]);
      c.cv.setAttribute('aria-label', 'Top: the density of X and the flipped density of Y slid to s; the purple overlap area is the density of the sum at s. Bottom: that density traced out.');
      F.out.set(Q ? 'The purple area is the density of the sum at $s = ' + V.fmt(S.s, 2) + '$.' : '$f_S(' + V.fmt(S.s, 2) + ') = \\int f_X(t)\\,f_Y(' + V.fmt(S.s, 2) + ' - t)\\,dt \\approx ' + V.fmt(fv, 3) + '$, the purple area. Slide $s$ to trace $f_S$.');
    }
    if (F.edit && !cont) c.cv.addEventListener('click', function (e) { var r = c.cv.getBoundingClientRect(), px = e.clientX - r.left, l = 30, rr = c.w - 12, n = Sd.xs.length, q = M.floor((px - l) / ((rr - l) / n)); if (q >= 0 && q < n && e.clientY - r.top > c.h * 0.5) { S.s = Sd.xs[q]; if (sl) sl.set(S.s); draw(); } });
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };

    function copies() {
      var St = { n: clamp(M.round(num(o.n, 1)), 1, 30), show: o.show === 'mean' ? 'mean' : 'sum' }, dist = null;
      function build() {
        if (A.cont) { var dx = 0.01, g = []; for (var x = A.lo; x <= A.hi + 1e-9; x += dx) g.push(A.f(x + dx / 2)); var cur = g.slice(); for (var q = 1; q < St.n; q++) { var nx = new Array(cur.length + g.length - 1).fill(0); for (var i = 0; i < cur.length; i++) { if (!cur[i]) continue; for (var j = 0; j < g.length; j++) nx[i + j] += cur[i] * g[j] * dx; } cur = nx; } dist = { cont: true, dx: dx, lo: A.lo * St.n, vals: cur }; }
        else { var D3 = A; for (var q2 = 1; q2 < St.n; q2++) D3 = convD(D3, A); dist = D3; }
      }
      build();
      var nsl = null;
      if (F.edit) {
        nsl = V.slider(F.ctl, { label: 'copies n', min: 1, max: 30, step: 1, value: St.n, input: function (v) { St.n = v; build(); drawC(); } });
        V.seg(F.ctl, { label: 'Show', items: [['sum', 'Sum Sₙ'], ['mean', 'Average Sₙ/n']], value: St.show, change: function (v) { St.show = v; drawC(); } });
      }
      function drawC() {
        var k = V.colors(), n = St.n, mean = St.show === 'mean'; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
        var l = 34, r = c.w - 12, t = 24, b = c.h - 24, mu = n * A.mu, sd = A.sd * M.sqrt(n), sc = mean ? 1 / n : 1;
        var xlo = A.cont ? A.lo : A.xs[0], xhi = A.cont ? A.hi : A.xs[A.xs.length - 1];
        var x0 = mean ? xlo - 0.1 * (xhi - xlo) : n * xlo - 0.5, x1 = mean ? xhi + 0.1 * (xhi - xlo) : n * xhi + 0.5;
        if (!mean) { x0 = M.max(x0, mu - 4.5 * sd); x1 = M.min(x1, mu + 4.5 * sd); }
        function X(v) { return l + (v - x0) / (x1 - x0) * (r - l); }
        var pts = []; if (dist.cont) dist.vals.forEach(function (v, i) { pts.push([(dist.lo + (i + 0.5) * dist.dx) * sc, v / sc]); }); else dist.xs.forEach(function (x, i) { pts.push([x * sc, dist.ps[i] / sc]); });
        var spacing = A.cont ? 0 : (A.xs.length > 1 ? A.xs[1] - A.xs[0] : 1);
        var top = 0; pts.forEach(function (p) { if (p[0] >= x0 && p[0] <= x1) top = M.max(top, dist.cont ? p[1] : p[1] / spacing); }); top = M.max(top, normPdf(mu * sc, mu * sc, sd * sc)) * 1.15;
        function Y(v) { return b - v / top * (b - t); }
        ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(l, b); ctx.lineTo(r, b); ctx.stroke();
        var st = niceStep(x1 - x0, r - l); for (var x = M.ceil(x0 / st) * st; x <= x1 + 1e-9; x += st) txt(ctx, V.fmt(x, 2), X(x), b + 11, { size: 10, color: k.muted, w: 500 });
        if (dist.cont) { ctx.fillStyle = rgba(k.blue, 0.3); ctx.beginPath(); ctx.moveTo(X(pts[0][0]), Y(0)); pts.forEach(function (p) { ctx.lineTo(X(clamp(p[0], x0, x1)), Y(p[1])); }); ctx.lineTo(X(pts[pts.length - 1][0]), Y(0)); ctx.closePath(); ctx.fill(); }
        else { var bw = M.max(1.5, (X(x0 + spacing * sc) - X(x0)) * 0.78); pts.forEach(function (p) { if (p[0] < x0 || p[0] > x1) return; var hh = p[1] / spacing; ctx.fillStyle = rgba(k.blue, 0.7); ctx.fillRect(X(p[0]) - bw / 2, Y(hh), bw, Y(0) - Y(hh)); }); }
        if (o.normal) { ctx.strokeStyle = k.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (var i = 0; i <= 300; i++) { var xx = lerp(x0, x1, i / 300); ctx[i ? 'lineTo' : 'moveTo'](X(xx), Y(normPdf(xx, mu * sc, sd * sc))); } ctx.stroke(); }
        var cap1 = (mean ? 'average of ' : 'sum of ') + n + (n === 1 ? ' copy' : ' copies'); txt(ctx, fit(ctx, [cap1 + ' of ' + A.name + (o.normal ? '; orange: the normal curve' : ''), cap1 + (o.normal ? '; orange: normal curve' : ''), cap1], r - l), l, 11, { size: 11, color: k.muted, align: 'left', w: 500 });
        c.cv.setAttribute('aria-label', 'The distribution of the ' + (mean ? 'average' : 'sum') + ' of ' + n + ' independent copies, with a normal curve over it.');
        if (Q) { F.out.set(''); return; }
        F.out.set(mean ? 'The average $S_{' + n + '}/' + n + '$: mean $\\mu = ' + V.fmt(A.mu, 3) + '$, standard deviation $\\sigma/\\sqrt{n} = ' + V.fmt(A.sd, 3) + '/\\sqrt{' + n + '} \\approx ' + V.fmt(A.sd / M.sqrt(n), 3) + '$: it narrows as $n$ grows.' : 'The sum $S_{' + n + '}$: mean $n\\mu = ' + V.fmt(mu, 3) + '$, standard deviation $\\sigma\\sqrt{n} = ' + V.fmt(A.sd, 3) + '\\sqrt{' + n + '} \\approx ' + V.fmt(sd, 3) + '$: it spreads out as $n$ grows, and its shape turns normal.');
      }
      c.onResize(drawC); V.onTheme(drawC); drawC();
      return { update: drawC };
    }
  });

  // ================================================================ prob-poisson
  function poisPmf(k, m) { var lp = -m + k * M.log(m); for (var i = 2; i <= k; i++) lp -= M.log(i); return M.exp(lp); }
  function binPmf(k, n, p) { var lp = 0; for (var i = 1; i <= k; i++) lp += M.log((n - k + i) / i); return M.exp(lp + k * M.log(p) + (n - k) * M.log(1 - p)); }
  V.register('prob-poisson', function (el, o) {
    o = Object.assign({ lambda: 3, t: 1, T: 10, mode: 'counts', s: 1, n: 20, seed: 1, windows: 200 }, o || {});
    var lam = num(o.lambda, 3), tw2 = num(o.t, 1), T = num(o.T, 10), F = frame(el, o, 'Random arrivals on a timeline at rate ' + lam), Q = F.quiet;
    var S = { seed: +o.seed || 1, w: 0, counts: [], gaps: [], waits: [], s: num(o.s, 1), n: M.max(M.ceil(lam * tw2) + 1, M.round(num(o.n, 20))), mode: o.mode };
    var arr = [];
    function newArrivals() { var r = rng(S.seed), t = 0; arr = []; for (;;) { t += expo(r, lam); if (t > T) break; arr.push(t); } S.gaps = arr.map(function (a, i) { return i ? a - arr[i - 1] : a; }); S.w = M.min(S.w, T - tw2); var r2 = rng(S.seed * 7 + 3); S.waits = []; for (var i = 0; i < 1500; i++) S.waits.push(expo(r2, lam)); S.slots = null; }
    newArrivals();
    var c = F.canvas({ aspect: 1.7, max: 380, min: 300 }), ctx = c.ctx; c.cv.style.touchAction = 'pan-y';
    var rr = rng(S.seed * 31 + 5);
    function moreWindows(m) { for (var i = 0; i < m; i++) { var t = 0, n = 0; for (;;) { t += expo(rr, lam); if (t > tw2) break; n++; } S.counts.push(n); } }
    var nsl = null;
    if (F.edit) {
      var bt = mk('div', 'ml-seg'); F.ctl.appendChild(bt);
      if (S.mode === 'counts') { V.button(bt, 'Count 100 windows', function () { moreWindows(100); draw(); }, 'pri'); V.button(bt, 'Clear', function () { S.counts = []; draw(); }); }
      V.button(bt, 'New arrivals', function () { S.seed++; newArrivals(); rr = rng(S.seed * 31 + 5); draw(); });
      if (S.mode === 'memory') V.slider(F.ctl, { label: 'already waited s', min: 0, max: M.round(3 / lam * 100) / 100, step: M.round(1 / lam) / 20 || 0.05, value: S.s, fmt: function (v) { return V.fmt(v, 2); }, input: function (v) { S.s = v; draw(); } });
      if (S.mode === 'slots') nsl = V.slider(F.ctl, { label: 'slots n', min: M.ceil(lam * tw2) + 1, max: 200, step: 1, value: S.n, input: function (v) { S.n = v; S.slots = null; draw(); } });
    }
    var L = {};
    function draw() {
      var k = V.colors(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var l = 34, r = c.w - 14, tl = 34; L = { l: l, r: r, tl: tl };
      var span = S.mode === 'slots' ? tw2 : T;
      function TX(t) { return l + t / span * (r - l); }
      // timeline
      ctx.strokeStyle = k.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l, tl); ctx.lineTo(r, tl); ctx.stroke();
      var st = niceStep(span, r - l); for (var x = 0; x <= span + 1e-9; x += st) { ctx.beginPath(); ctx.moveTo(TX(x), tl - 4); ctx.lineTo(TX(x), tl + 4); ctx.stroke(); txt(ctx, V.fmt(x, 2), TX(x), tl + 14, { size: 10, color: k.muted, w: 500 }); }
      if (S.mode === 'slots') {
        var n = S.n, p = lam * tw2 / n; if (!S.slots) { var r3 = rng(S.seed * 13 + n); S.slots = []; for (var i = 0; i < n; i++) S.slots.push(r3() < p); }
        for (i = 0; i < n; i++) { var x0 = TX(i * tw2 / n), x1 = TX((i + 1) * tw2 / n); ctx.strokeStyle = rgba(k.ink, 0.25); ctx.lineWidth = 1; if (n <= 80) { ctx.beginPath(); ctx.moveTo(x0, tl - 9); ctx.lineTo(x0, tl + 1); ctx.stroke(); } if (S.slots[i]) { ctx.fillStyle = k.orange; ctx.fillRect(x0 + 0.5, tl - 12, M.max(1.5, x1 - x0 - 1), 10); } }
      } else {
        if (S.mode === 'counts') { ctx.fillStyle = rgba(k.orange, 0.22); ctx.fillRect(TX(S.w), tl - 20, TX(S.w + tw2) - TX(S.w), 28); ctx.strokeStyle = k.orange; ctx.lineWidth = 2; ctx.strokeRect(TX(S.w), tl - 20, TX(S.w + tw2) - TX(S.w), 28); }
        if (S.mode === 'memory') { ctx.fillStyle = rgba(k.muted, 0.25); ctx.fillRect(TX(0), tl - 20, TX(S.s) - TX(0), 28); }
        arr.forEach(function (a) { var on = S.mode === 'counts' && a >= S.w && a <= S.w + tw2; ctx.fillStyle = on ? k.orange : k.blue; ctx.beginPath(); ctx.arc(TX(a), tl - 6, on ? 5 : 4, 0, 2 * M.PI); ctx.fill(); });
      }
      txt(ctx, fit(ctx, S.mode === 'slots' ? ['a window of length ' + V.fmt(tw2, 2) + ' cut into ' + S.n + ' slots', S.n + ' slots'] : ['arrivals at rate λ = ' + V.fmt(lam, 3) + ' over ' + V.fmt(T, 2) + ' time units', 'rate λ = ' + V.fmt(lam, 3)], r - l), l, 10, { size: 11, color: k.muted, align: 'left', w: 500 });
      // histogram panel
      var ht = tl + 52, hb = c.h - 24; L.ht = ht; L.hb = hb;
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(l, hb); ctx.lineTo(r, hb); ctx.stroke();
      var say = '';
      if (S.mode === 'counts' || S.mode === 'slots') {
        var m = lam * tw2, kmax = M.max(4, M.ceil(m + 4 * M.sqrt(m) + 1)), bins = [], tot = S.counts.length;
        for (var q = 0; q <= kmax; q++) bins.push(0); S.counts.forEach(function (v) { if (v <= kmax) bins[v]++; });
        var pm = [], top = 0; for (q = 0; q <= kmax; q++) { pm.push(poisPmf(q, m)); top = M.max(top, pm[q], tot ? bins[q] / tot : 0); }
        var bp = null; if (S.mode === 'slots') { bp = []; for (q = 0; q <= kmax; q++) { bp.push(q <= S.n ? binPmf(q, S.n, m / S.n) : 0); top = M.max(top, bp[q]); } }
        top *= 1.18; var bw = (r - l) / (kmax + 1);
        function HY(v) { return hb - v / top * (hb - ht); }
        for (q = 0; q <= kmax; q++) {
          var cx = l + (q + 0.5) * bw;
          if (S.mode === 'counts' && tot) { ctx.fillStyle = rgba(k.blue, 0.65); ctx.fillRect(cx - bw * 0.36, HY(bins[q] / tot), bw * 0.72, hb - HY(bins[q] / tot)); }
          if (bp) { ctx.fillStyle = rgba(k.blue, 0.65); ctx.fillRect(cx - bw * 0.4, HY(bp[q]), bw * 0.38, hb - HY(bp[q])); ctx.fillStyle = rgba(k.orange, 0.75); ctx.fillRect(cx + bw * 0.02, HY(pm[q]), bw * 0.38, hb - HY(pm[q])); }
          else { ctx.strokeStyle = k.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - bw * 0.4, HY(pm[q])); ctx.lineTo(cx + bw * 0.4, HY(pm[q])); ctx.stroke(); ctx.fillStyle = k.orange; ctx.beginPath(); ctx.arc(cx, HY(pm[q]), 3, 0, 2 * M.PI); ctx.fill(); }
          if (bw > 13 || q % 2 === 0) txt(ctx, String(q), cx, hb + 10, { size: 10, color: k.muted, w: 500 });
        }
        txt(ctx, fit(ctx, S.mode === 'slots' ? ['blue: Binomial(n, λt/n); orange: Poisson(λt)'] : ['blue: share of windows with k arrivals; orange: Poisson(λt) pmf', 'blue: windows with k arrivals; orange: Poisson(λt)'], r - l), l, ht - 12, { size: 11, color: k.muted, align: 'left', w: 500 });
        if (S.mode === 'counts') {
          var inW = arr.filter(function (a) { return a >= S.w && a <= S.w + tw2; }).length, avg = tot ? S.counts.reduce(function (a, b) { return a + b; }, 0) / tot : 0;
          say = 'This window holds ' + inW + (inW === 1 ? ' arrival' : ' arrivals') + '. ' + (Q ? '' : 'Mean count per window: $\\lambda t = ' + V.fmt(lam, 3) + ' \\times ' + V.fmt(tw2, 3) + ' = ' + V.fmt(m, 3) + '$. ') + (tot ? tot + ' windows counted' + (Q ? '.' : ', average ' + V.fmt(avg, 3) + '.') : (F.edit ? 'Press "Count 100 windows".' : ''));
        } else {
          var mx = 0; for (q = 0; q <= kmax; q++) mx = M.max(mx, M.abs(bp[q] - pm[q]));
          say = Q ? 'Each slot gets an arrival with the same small chance.' : 'Each slot gets an arrival with chance $p = \\lambda t/n = ' + V.fmt(m / S.n, 4) + '$. The two pmfs differ by at most ' + V.fmt(mx, 4) + '; more, smaller slots make the binomial match the Poisson.';
        }
      } else {
        var data = S.mode === 'gaps' ? S.gaps : S.waits, xmax = 4 / lam, nb = 24, bw2 = xmax / nb;
        function hist(vals) { var h = []; for (var q2 = 0; q2 < nb; q2++) h.push(0); vals.forEach(function (v) { var q3 = M.floor(v / bw2); if (q3 < nb) h[q3]++; }); return h.map(function (v) { return vals.length ? v / vals.length / bw2 : 0; }); }
        var h1 = hist(data), left = S.mode === 'memory' ? S.waits.filter(function (v) { return v > S.s; }).map(function (v) { return v - S.s; }) : null, h2 = left ? hist(left) : null;
        var top2 = lam * 1.25; h1.forEach(function (v) { top2 = M.max(top2, v * 1.05); }); if (h2) h2.forEach(function (v) { top2 = M.max(top2, v * 1.05); });
        function GX(v) { return l + v / xmax * (r - l); } function GY(v) { return hb - v / top2 * (hb - ht); }
        for (q = 0; q < nb; q++) {
          ctx.fillStyle = h2 ? rgba(k.muted, 0.3) : rgba(k.blue, 0.6); ctx.fillRect(GX(q * bw2) + 1, GY(h1[q]), GX(bw2) - GX(0) - 2, hb - GY(h1[q]));
          if (h2) { ctx.strokeStyle = k.blue; ctx.lineWidth = 2; ctx.strokeRect(GX(q * bw2) + 2, GY(h2[q]), GX(bw2) - GX(0) - 4, hb - GY(h2[q])); }
        }
        ctx.strokeStyle = k.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (q = 0; q <= 200; q++) { var xv = xmax * q / 200; ctx[q ? 'lineTo' : 'moveTo'](GX(xv), GY(lam * M.exp(-lam * xv))); } ctx.stroke();
        var st2 = niceStep(xmax, r - l); for (var gx = 0; gx <= xmax + 1e-9; gx += st2) txt(ctx, V.fmt(gx, 2), GX(gx), hb + 10, { size: 10, color: k.muted, w: 500 });
        txt(ctx, fit(ctx, S.mode === 'gaps' ? ['histogram of the gaps; orange: λe^(−λx)'] : ['gray: all waits; blue outline: extra waits after s; orange: λe^(−λx)', 'gray: all waits; blue: extra waits after s'], r - l), l, ht - 12, { size: 11, color: k.muted, align: 'left', w: 500 });
        if (S.mode === 'gaps') { var mg = data.reduce(function (a, b) { return a + b; }, 0) / (data.length || 1); say = data.length + ' gaps between arrivals' + (Q ? '.' : '; their average is ' + V.fmt(mg, 3) + ', close to $1/\\lambda = ' + V.fmt(1 / lam, 3) + '$.'); }
        else { var ml = left.reduce(function (a, b) { return a + b; }, 0) / (left.length || 1); say = left.length + ' of ' + S.waits.length + ' waits lasted past $s = ' + V.fmt(S.s, 2) + '$.' + (Q ? '' : ' Their extra waiting averages ' + V.fmt(ml, 3) + ', the same as a fresh wait ($1/\\lambda = ' + V.fmt(1 / lam, 3) + '$): the process has no memory.'); }
      }
      c.cv.setAttribute('aria-label', 'Timeline of random arrivals at rate ' + lam + ' and a histogram below.' + (S.mode === 'counts' && F.edit ? ' Arrow keys move the window.' : ''));
      F.out.set(say);
    }
    if (F.edit && S.mode === 'counts') {
      V.drag(c.cv, { touchAction: 'pan-y', hit: function (px, py) { return py < L.tl + 30 ? 1 : null; }, move: function (h, px) { var t = (px - L.l) / (L.r - L.l) * T - tw2 / 2; S.w = M.round(clamp(t, 0, T - tw2) * 100) / 100; draw(); } });
      keyNav(c.cv, { count: function () { return 1; }, move: function (i, dx, dy, big) { var d = dx || dy; S.w = M.round(clamp(S.w + d * (big ? 1 : 0.1), 0, T - tw2) * 100) / 100; draw(); } });
    }
    if (S.mode === 'counts') moreWindows(F.edit ? M.max(0, +o.windows || 0) : 300);
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw };
  });

  // ================================================================ prob-markov
  function solveFr(A, b) { // exact Gaussian elimination; returns null when singular
    var n = A.length, Mx = A.map(function (r, i) { return r.slice().concat([b[i]]); });
    for (var c2 = 0; c2 < n; c2++) {
      var p = -1; for (var r2 = c2; r2 < n; r2++) if (!fz(Mx[r2][c2])) { p = r2; break; } if (p < 0) return null;
      var t = Mx[c2]; Mx[c2] = Mx[p]; Mx[p] = t;
      for (r2 = 0; r2 < n; r2++) { if (r2 === c2 || fz(Mx[r2][c2])) continue; var f = fdiv(Mx[r2][c2], Mx[c2][c2]); for (var j = c2; j <= n; j++) Mx[r2][j] = fsub(Mx[r2][j], fmul(f, Mx[c2][j])); }
    }
    return Mx.map(function (r, i) { return fdiv(r[n], r[i]); });
  }
  V.register('prob-markov', function (el, o) {
    o = Object.assign({ P: [['1/2', '1/2'], ['1/4', '3/4']], mode: 'walk', steps: 0, seed: 1, layout: 'ring', target: null }, o || {});
    var P = o.P.map(function (r) { return r.map(function (v) { return fparse(v) || ZERO; }); }), n = P.length;
    var names = (o.names || []).slice(); for (var i = 0; i < n; i++) if (names[i] == null) names[i] = String(i + 1);
    var F = frame(el, o, 'Markov chain diagram with ' + n + ' states'), Q = F.quiet, mode = o.mode;
    var rowsOk = P.map(function (r) { return feq(fsum(r), ONE); });
    var absorbing = P.map(function (r, i2) { return feq(r[i2], ONE); });
    var c = F.canvas({ aspect: o.layout === 'line' ? 2.3 : n === 2 ? 2.4 : 1.6, max: o.layout === 'line' ? 260 : n === 2 ? 240 : 380, min: n === 2 ? 170 : 220 }), ctx = c.ctx;
    c.cv.style.touchAction = 'pan-y';
    var matBox = mk('div', 'pv-tbl'); F.box.appendChild(matBox); if (o.matrix === false) matBox.hidden = true;
    var eqs = mk('div', 'pv-eqs'); F.box.appendChild(eqs);
    var S = { cur: 0, n: 0, visits: P.map(function () { return 0; }), pis: [], tok: null, r: rng(o.seed), playing: false, walkN: 0 };
    var pi0 = (o.pi0 || P.map(function (_, q) { return q === 0 ? 1 : 0; })).map(function (v) { return fparse(v) || ZERO; });
    S.pis = [pi0]; for (var q = 0; q < (o.steps || 0); q++) stepPi();
    S.cur = pi0.findIndex(function (v) { return !fz(v); }); if (S.cur < 0) S.cur = 0; S.visits[S.cur] = 1;
    function stepPi() { var last = S.pis[S.pis.length - 1]; S.pis.push(P[0].map(function (_, j) { return fsum(last.map(function (p, i3) { return fmul(p, P[i3][j]); })); })); }
    function pos() {
      var w = c.w, h = c.h, out = [];
      if (o.layout === 'line') { for (var i3 = 0; i3 < n; i3++) out.push([lerp(50, w - 50, n === 1 ? 0.5 : i3 / (n - 1)), h * 0.55]); return out; }
      if (n === 2) return [[w * 0.3, h * 0.52], [w * 0.7, h * 0.52]];
      var R = M.min(w * 0.33, h * 0.33); for (i3 = 0; i3 < n; i3++) { var a = -M.PI / 2 + 2 * M.PI * i3 / n; out.push([w / 2 + R * M.cos(a) * 1.15, h / 2 + 8 + R * M.sin(a)]); }
      return out;
    }
    function rad() { var r = 20; names.forEach(function (nm) { r = M.max(r, M.min(34, tw(ctx, nm, 12, 700) / 2 + 7)); }); return o.layout === 'line' ? M.min(r, (c.w - 100) / (n - 1) / 3.2) : r; }
    function draw() {
      var k = V.colors(), ps = pos(), r = rad(); ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var cen = [c.w / 2, c.h / 2];
      for (var i3 = 0; i3 < n; i3++) for (var j = 0; j < n; j++) {
        if (fz(P[i3][j])) continue; var a = ps[i3], b = ps[j], lab = ftxt(P[i3][j]);
        ctx.strokeStyle = rgba(k.ink, 0.6); ctx.fillStyle = rgba(k.ink, 0.6); ctx.lineWidth = 1.8;
        if (i3 === j) {
          if (absorbing[i3] && mode === 'absorb') { /* drawn as a double circle */ }
          var out = o.layout === 'line' ? [0, -1] : [a[0] - cen[0], a[1] - cen[1]], L2 = M.hypot(out[0], out[1]) || 1; out = [out[0] / L2, out[1] / L2];
          if (n === 2 && o.layout !== 'line') out = [i3 === 0 ? -1 : 1, 0];
          var lc = [a[0] + out[0] * (r + 14), a[1] + out[1] * (r + 14)];
          ctx.beginPath(); ctx.arc(lc[0], lc[1], 14, 0, 2 * M.PI); ctx.stroke();
          var ang = M.atan2(out[1], out[0]) + M.PI / 2, tip = [a[0] + out[0] * r + M.cos(ang) * 6, a[1] + out[1] * r + M.sin(ang) * 6];
          arrowHead(ctx, tip[0], tip[1], M.atan2(-out[1], -out[0]) + 0.5, 9);
          pill(ctx, lab, lc[0] + out[0] * 26, lc[1] + out[1] * 18, k.ink, { W: c.w, H: c.h, size: 11 });
          continue;
        }
        var both = !fz(P[j][i3]), dx = b[0] - a[0], dy = b[1] - a[1], d = M.hypot(dx, dy), nx = -dy / d, ny = dx / d, bend = both ? 22 : 0;
        if (o.layout === 'line' && M.abs(j - i3) > 1) bend = 46;
        var mx = (a[0] + b[0]) / 2 + nx * bend, my = (a[1] + b[1]) / 2 + ny * bend;
        var s0 = M.atan2(my - a[1], mx - a[0]), s1 = M.atan2(b[1] - my, b[0] - mx);
        var p0 = [a[0] + r * M.cos(s0), a[1] + r * M.sin(s0)], p1 = [b[0] - (r + 2) * M.cos(s1), b[1] - (r + 2) * M.sin(s1)];
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(mx, my, p1[0], p1[1]); ctx.stroke();
        arrowHead(ctx, p1[0], p1[1], M.atan2(p1[1] - my, p1[0] - mx), 10);
        pill(ctx, lab, (p0[0] + 2 * mx + p1[0]) / 4 + nx * 10, (p0[1] + 2 * my + p1[1]) / 4 + ny * 10, k.ink, { W: c.w, H: c.h, size: 11 });
      }
      var piN = S.pis[S.pis.length - 1];
      ps.forEach(function (p, i4) {
        var fill = k.panel; if (mode === 'distribution' && (!Q || S.pis.length === 1)) fill = rgba(k.blue, 0.12 + 0.6 * fnum(piN[i4]));
        ctx.fillStyle = fill; ctx.strokeStyle = absorbing[i4] && mode === 'absorb' ? k.red : k.green; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 2 * M.PI); ctx.fill(); ctx.stroke();
        if (absorbing[i4] && mode === 'absorb') { ctx.beginPath(); ctx.arc(p[0], p[1], r - 5, 0, 2 * M.PI); ctx.stroke(); }
        txt(ctx, names[i4], p[0], p[1], { size: names[i4].length > 5 ? 11 : 13, w: 700 });
      });
      if (mode === 'walk' || mode === 'stationary') {
        var tp = S.tok ? S.tok : ps[S.cur]; ctx.fillStyle = k.orange; ctx.strokeStyle = k.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tp[0], tp[1] - r - 2, 8, 0, 2 * M.PI); ctx.fill(); ctx.stroke();
      }
      c.cv.setAttribute('aria-label', 'Markov chain with states ' + names.join(', ') + '. ' + P.map(function (row, i5) { return 'From ' + names[i5] + ': ' + row.map(function (v, j2) { return fz(v) ? null : 'to ' + names[j2] + ' ' + ftxt(v); }).filter(Boolean).join(', '); }).join('. ') + '.');
      table(); text();
    }
    function table() {
      var h = '<table><thead><tr><th scope="col">from \\ to</th>' + names.map(function (nm) { return '<th scope="col">' + esc(nm) + '</th>'; }).join('') + '<th scope="col">row sum</th></tr></thead><tbody>';
      P.forEach(function (row, i3) { h += '<tr><th scope="row">' + esc(names[i3]) + '</th>' + row.map(function (v) { return '<td>' + ftxt(v) + '</td>'; }).join('') + '<td class="' + (rowsOk[i3] ? 'pv-good' : 'pv-badc') + '">' + ftxt(fsum(row)) + (rowsOk[i3] ? ' ✓' : ' ✗') + '</td></tr>'; });
      matBox.innerHTML = h + '</tbody></table>';
    }
    function vecTex(v) { return '\\left(' + v.map(ftex).join(',\\ ') + '\\right)'; }
    function text() {
      var bad = rowsOk.indexOf(false) >= 0, h = bad ? '<span class="pv-no">A row of P does not add to 1, so this is not a transition matrix.</span> ' : '', e = '';
      if (mode === 'diagram') { F.out.set(h); eqs.innerHTML = ''; return; }
      if (mode === 'walk') h += 'Step ' + S.walkN + ': at ' + esc(names[S.cur]) + '. Visits: ' + names.map(function (nm, i3) { return esc(nm) + ' ' + S.visits[i3]; }).join(', ') + '. The next state depends only on the current one.';
      if (mode === 'distribution') {
        var N = S.pis.length - 1;
        e = S.pis.map(function (v, q2) { return q2 > 0 && Q ? '$\\pi_{' + q2 + '} = \\ ?$' : '$\\pi_{' + q2 + '} = ' + vecTex(v) + '$'; }).join('<br>');
        if (N > 0 && !Q) { var j = n - 1, prev = S.pis[N - 1]; h += 'One entry of $\\pi_{' + N + '} = \\pi_{' + (N - 1) + '}P$ is a row times a column: $$\\pi_{' + N + '}(\\text{' + names[j] + '}) = ' + prev.map(function (p, i3) { return ftex(p) + ' \\cdot ' + ftex(P[i3][j]); }).join(' + ') + ' = ' + ftex(S.pis[N][j]) + '.$$'; }
        else h += 'The row vector $\\pi_0$ times $P$ gives $\\pi_1$: a row of probabilities times the matrix, rows of $P$ adding to 1.';
      }
      if (mode === 'absorb') {
        var abs2 = [], tr = []; absorbing.forEach(function (a, i3) { (a ? abs2 : tr).push(i3); });
        var tg = o.target != null ? (typeof o.target === 'number' ? o.target : names.indexOf(String(o.target))) : abs2[abs2.length - 1];
        if (!abs2.length || !tr.length) { h += 'This chain has no absorbing state (or nothing else).'; }
        else {
          var Am = tr.map(function (i3) { return tr.map(function (j2) { return fsub(i3 === j2 ? ONE : ZERO, P[i3][j2]); }); });
          var hs = solveFr(Am, tr.map(function (i3) { return P[i3][tg]; })), ms = solveFr(Am, tr.map(function () { return ONE; }));
          e = '<b>Absorption in ' + esc(names[tg]) + ':</b> $h_{\\text{' + names[tg] + '}} = 1$' + abs2.filter(function (a) { return a !== tg; }).map(function (a) { return ', $h_{\\text{' + names[a] + '}} = 0$'; }).join('') + '; for each other state, condition on the first step:<br>' +
            tr.map(function (i3) { return '$h_{\\text{' + names[i3] + '}} = ' + P[i3].map(function (p, j2) { return fz(p) ? null : ftex(p) + 'h_{\\text{' + names[j2] + '}}'; }).filter(Boolean).join(' + ') + '$'; }).join('<br>') +
            '<br><b>Expected steps:</b> absorbing states have $m = 0$; every other step adds 1:<br>' + tr.map(function (i3) { return '$m_{\\text{' + names[i3] + '}} = 1 + ' + P[i3].map(function (p, j2) { return fz(p) || absorbing[j2] ? null : ftex(p) + 'm_{\\text{' + names[j2] + '}}'; }).filter(Boolean).join(' + ') + '$'; }).join('<br>');
          if (!Q && hs && ms) h += 'Solution: ' + tr.map(function (i3, q2) { return '$h_{\\text{' + names[i3] + '}} = ' + ftex(hs[q2]) + '$'; }).join(', ') + '; ' + tr.map(function (i3, q2) { return '$m_{\\text{' + names[i3] + '}} = ' + ftex(ms[q2]) + '$'; }).join(', ') + '.';
        }
      }
      if (mode === 'stationary') {
        var Am2 = P[0].map(function (_, j2) { return P.map(function (row, i3) { return fsub(row[j2], i3 === j2 ? ONE : ZERO); }); }); Am2[n - 1] = P.map(function () { return ONE; });
        var pi = solveFr(Am2, P.map(function (_, i3) { return i3 === n - 1 ? ONE : ZERO; })), tot = S.visits.reduce(function (a, b) { return a + b; }, 0);
        e = 'Share of time so far (' + tot + (tot === 1 ? ' visit' : ' visits') + '): ' + names.map(function (nm, i3) { return esc(nm) + ' ' + V.fmt(tot ? S.visits[i3] / tot : 0, 3); }).join(', ');
        if (!Q) h += pi ? 'Solving $\\pi P = \\pi$ with $' + names.map(function (_, i3) { return '\\pi_{' + (i3 + 1) + '}'; }).join(' + ') + ' = 1$: $\\pi = ' + vecTex(pi) + '$ (about ' + pi.map(function (v) { return V.fmt(fnum(v), 3); }).join(', ') + '). Without the "adds to 1" equation, every multiple of $\\pi$ (even 0) would also solve $\\pi P = \\pi$.' : 'This chain has no single stationary distribution.';
      }
      F.out.set(h); eqs.innerHTML = e; typeset(eqs);
    }
    var anim = null;
    function walkStep(m) {
      for (var q2 = 0; q2 < m; q2++) { var u = S.r(), acc = 0, nx = n - 1; for (var j = 0; j < n; j++) { acc += fnum(P[S.cur][j]); if (u < acc) { nx = j; break; } } S.prev = S.cur; S.cur = nx; S.visits[nx]++; S.walkN++; }
      if (m === 1 && !V.reduced) { var ps = pos(), a = ps[S.prev], b = ps[S.cur]; if (anim) anim.stop(); anim = animate(el, 380, function (t) { var e2 = ease(t); S.tok = t >= 1 ? null : [lerp(a[0], b[0], e2), lerp(a[1], b[1], e2) - M.sin(M.PI * e2) * 26]; draw(); }); }
      else draw();
    }
    var playT = null;
    if (F.edit) {
      if (mode === 'walk' || mode === 'stationary') {
        V.button(F.ctl, 'Step', function () { walkStep(1); }, 'pri');
        if (mode === 'walk') { var pb = V.button(F.ctl, 'Play', function () { if (playT) { clearInterval(playT); playT = null; pb.textContent = 'Play'; return; } pb.textContent = 'Pause'; playT = setInterval(function () { if (!el.isConnected) { clearInterval(playT); return; } walkStep(1); }, V.reduced ? 900 : 650); }); }
        V.button(F.ctl, mode === 'stationary' ? 'Run 1,000 steps' : '+100 steps', function () { walkStep(mode === 'stationary' ? 1000 : 100); });
        V.button(F.ctl, 'Reset', function () { S.r = rng(o.seed); S.cur = pi0.findIndex(function (v) { return !fz(v); }); if (S.cur < 0) S.cur = 0; S.visits = P.map(function () { return 0; }); S.visits[S.cur] = 1; S.walkN = 0; draw(); });
      }
      if (mode === 'distribution') { V.button(F.ctl, 'Step: π times P', function () { if (S.pis.length < 12) { stepPi(); draw(); } }, 'pri'); V.button(F.ctl, 'Reset', function () { S.pis = [pi0]; draw(); }); }
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: draw, destroy: function () { if (playT) clearInterval(playT); } };
  });
})(window, document);
