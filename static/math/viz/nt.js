/* Math Ladder visuals for Number Theory (course key nt). Registered on window.MathLadder.viz; needs viz/core.js and
   uses the frame styles of viz/adv.css (Number Theory pages load both). Styles for these visuals are injected below.
   All arithmetic is exact: integers, with BigInt wherever a product could pass 2^53.

   Shared options (all six visuals)
     task      an instruction line above the picture (HTML and $…$ allowed)
     label     the aria-label (a sensible one is built when it is missing)
     edit      false: a fixed picture (no number boxes, sliders or step buttons; everything is shown at once)
     quiet     true (or readout: false): hide every number, label or verdict a problem might ask for (each visual
               says below exactly what quiet hides). Lessons leave it off; generators pass quiet: true.

   nt-euclid   The Euclidean algorithm as squares cut from an a-by-b rectangle. Each row of q equal squares is one
               division step a = bq + r; the leftover strip is r by b. The last square's side is the gcd, and a dotted
               grid of that size tiles the whole rectangle. A table lists the division steps.
     opts: a: 252, b: 198        the rectangle (whole numbers 1 … 99999)
           mode: "gcd"           the division steps and the gcd
                 "bezout"        adds a column writing each remainder as a·s + b·t (the extended Euclidean algorithm),
                                 a running check that ends with gcd(a, b) = ax + by
                 "cf"            the counts of squares are the partial quotients [q₀; q₁, …]; lists the convergents
           x: "sqrt7"            cf mode only: the continued fraction of √d (d = 2 … 999, not a square) instead of a/b;
                                 the squares never end and the counts repeat. Computed exactly with the integer
                                 algorithm m' = cq − m, c' = (d − m'²)/c, q' = ⌊(⌊√d⌋ + m')/c'⌋.
           steps: true           Next step / Show all / Start over buttons (false: the finished picture)
           table: true           the table of steps under the picture
     quiet: hides the gcd, the coefficients, the partial quotients and convergents, and the table (only a and b are
            labeled on the picture)

   nt-sieve    The sieve of Eratosthenes, a single trial-division test, or the count of primes against x/ln x.
     opts: mode: "sieve"         the numbers 1 … N in a grid; Next prime circles the next prime p and crosses out its
                                 multiples from p² on, one color per prime; once p² > N every number left is prime
                 "test"          trial division of one number n by the primes up to √n, one at a time
                 "count"         π(x) (a staircase) against x/ln x on one graph, with a table of exact counts at powers of 10
           N: 100                sieve: the last number (10 … 400); count: the right end of the graph (100 … 100000)
           cols: 10              sieve: numbers per row (6 lines up the primes above 3 in the columns 6k ± 1)
           n: 221                test: the number to test (2 … 10^9)
           step: true            sieve and test: start at the beginning with step buttons (false: the finished state)
     quiet: hides π(N), the estimate and the ratio, the remainders and the verdict in test mode (the trial divisors stay)

   nt-clock    Residues mod n as points on a circle, 0 at the top, going clockwise.
     opts: n: 12                 the modulus (2 … 60; with mode "affine", 26)
           mode: "add"           a jump of a steps from x (negative a goes backward); the landing point is x + a mod n
                 "mult"          an arrow from each x to ax mod n: a permutation when gcd(a, n) = 1; otherwise several
                                 points land together and some are never hit
                 "inverse"       the arrows of mult, with the one that lands on 1 picked out (or the reason none does)
                 "solve"         all x with ax ≡ b (mod n): d = gcd(a, n) of them, or none
                 "affine"        the letters A … Z (A = 0) around a 26-point clock, the map x ↦ ax + b mod 26, and the
                                 whole cipher alphabet; a repeated letter shows when gcd(a, 26) > 1
                 "squares"       an arrow from each x to x² mod n: x and −x land together and the nonsquares stay unhit
                 "wilson"        chords join each nonzero residue to its inverse; 1 and n − 1 are their own
           a: 5, b: 3, x: 7      the numbers the mode uses (x: the starting point or the chosen letter)
           letters: false        label the points A … Z instead of 0 … 25 (n = 26)
           negative: true        also label n − k as −k, outside the circle (add mode)
     quiet: hides result labels: the landing point, the inverse, the solution set, the image set and its size, the
            squares, the cipher alphabet and every verdict (the clock and its labels stay)

   nt-powers   Powers mod n.
     opts: mode: "cycle"         a, a², a³, … mod n as a row and as a path on a clock that returns to 1 after ord(a) steps
                 "table"         the power table: a row for each unit a mod n, columns k = 1 … φ(n), the 1s lit, the order
                                 of each row, and a star on each primitive root (n = 2 … 40)
                 "fast"          the exponent in binary, the repeated squares a, a², a⁴, … mod n, and the chosen ones
                                 multiplied together, reducing at every step
                 "exponent"      a huge exponent e reduced mod the period (ord(a), which divides p − 1 or φ(n))
                 "criterion"     a^((p − 1)/2) mod p for every a, all ±1, beside the squares mod p (Euler's criterion)
                 "dlog"          the powers g⁰, g¹, … mod p, one step at a time, until h appears
           n: 7, a: 3            the modulus and the base (g in dlog mode)
           e: 100                the exponent (fast, exponent)
           h: 5                  dlog: the target
     quiet: hides the final value, the order, the primitive-root stars, the discrete logarithm and the verdicts

   nt-crt      The Chinese remainder grid: rows are residues mod m, columns residues mod n. The numbers 0, 1, 2, … are
               placed one at a time, each one step down and one step right with wraparound. When gcd(m, n) = 1 they
               fill every cell once before reaching mn; otherwise the path returns to the start after lcm(m, n) steps
               and some cells stay empty. Clicking a cell says which number (if any) sits there.
     opts: m: 4, n: 5            the moduli (2 … 12)
           target: [1, 3]        a cell to find: x ≡ 1 (mod m), x ≡ 3 (mod n)
           fill: "animate"       place the numbers one at a time (reduced motion: all at once); "all": already placed;
                 "none"          an empty grid with a Place next button
           upto: null            how many numbers to place (default: until the path closes, lcm(m, n) numbers)
     quiet: hides the numbers in the cells (except ones the learner places) and the solution readout

   nt-lattice  Whole-number points on lines and curves.
     opts: mode: "line"          ax + by = c with the lattice points on it lit (none when gcd(a, b) does not divide c),
                                 the step (b/d, −a/d) between neighbors, and a slider for t along the general solution
                 "circle"        the unit circle; the line through (−1, 0) with slope n/m meets it at a rational point,
                                 which scales to the triple (m² − n², 2mn, m² + n²), drawn as a right triangle
                 "pell"          the hyperbola x² − dy² = 1 with its whole-number points (x₁, y₁), (x₂, y₂), …, each
                                 reached from the last by multiplying by x₁ + y₁√d (Next point zooms out)
           a: 4, b: 6, c: 10     line mode
           m: 2, n: 1            circle mode (m > n > 0)
           d: 2, count: 4        pell mode: d (2 … 99, not a square) and how many points to list
           window: [xmin, xmax, ymin, ymax]   line mode (default: around the solutions)
     quiet: hides the coordinates of the solutions, the general-solution formula and the triple                      */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/nt.js: load viz/core.js first'); return; }
  var M = Math, mk = V.el, NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- styles
  (function css() {
    if (D.getElementById('nt-viz-css')) return;
    var s = D.createElement('style'); s.id = 'nt-viz-css';
    s.textContent = [
      '.nt-v{--nt-p0:#00703c;--nt-p1:#1c6fd6;--nt-p2:#d6336c;--nt-p3:#a86f00;--nt-p4:#7048e8;--nt-p5:#e8590c;--nt-p6:#0c8599;--nt-p7:#c2255c;--nt-hi:#b8963e;--nt-dim:#b4beb8;--nt-bg:#fff}',
      'html[data-theme="dark"] .nt-v{--nt-p0:#6cc79a;--nt-p1:#74c0fc;--nt-p2:#ff8787;--nt-p3:#ffd479;--nt-p4:#b197fc;--nt-p5:#ffa94d;--nt-p6:#66d9e8;--nt-p7:#f783ac;--nt-hi:#e0c070;--nt-dim:#4a5e53;--nt-bg:#14211a}',
      '.nt-v .nt-svg{display:block;max-width:100%;height:auto;margin:0 auto;overflow:visible;touch-action:manipulation}',
      '.nt-v .nt-svg text{font-family:system-ui,-apple-system,sans-serif;fill:var(--mv-ink);font-variant-numeric:tabular-nums}',
      '.nt-v .nt-svg .nt-mut{fill:var(--mv-muted)}',
      '.nt-v .nt-svg:focus-visible{outline:3px solid #b8963e;outline-offset:3px;border-radius:8px}',
      '.nt-v .nt-pic{background:var(--mv-card);border:1px solid var(--mv-line);border-radius:10px;padding:.5rem;box-sizing:border-box;max-width:100%}',
      '.nt-v .nt-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:.55rem 0 0}',
      '.nt-v .nt-num{display:inline-flex;align-items:center;gap:.3rem;font-size:.88rem;color:var(--mv-muted)}',
      '.nt-v .nt-num input{width:5.2rem;min-height:36px;box-sizing:border-box;padding:.25rem .4rem;border:1px solid var(--mv-line);border-radius:8px;background:var(--mv-card);color:var(--mv-ink);font:600 .95rem system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:center}',
      '.nt-v .nt-num input.nt-w3{width:3.9rem}',
      '.nt-v .nt-num input:focus-visible{outline:3px solid #b8963e;outline-offset:1px}',
      '.nt-v .nt-tbl{max-width:100%;overflow-x:auto;margin:.6rem 0 0;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card)}',
      '.nt-v .nt-tbl table{display:table;border-collapse:collapse;width:100%;font-size:.86rem;font-variant-numeric:tabular-nums;margin:0}',
      '.nt-v .nt-tbl th,.nt-v .nt-tbl td{padding:.28rem .5rem;text-align:right;border-bottom:1px solid var(--mv-line);white-space:nowrap}',
      '.nt-v .nt-tbl th{color:var(--mv-muted);font-weight:600;background:var(--mv-paper)}',
      '.nt-v .nt-tbl td.l,.nt-v .nt-tbl th.l{text-align:left}',
      '.nt-v .nt-tbl tr:last-child td{border-bottom:0}',
      '.nt-v .nt-tbl tr.hi td{background:rgba(184,150,62,.18);font-weight:700}',
      '.nt-v .nt-tbl td.one{background:rgba(0,112,60,.16);color:var(--nt-p0);font-weight:700}',
      '.nt-v .nt-tbl td.neg{background:rgba(214,51,108,.12);color:var(--nt-p2);font-weight:700}',
      '.nt-v .nt-tbl tr.new td{animation:nt-in .4s ease-out}',
      '@keyframes nt-in{from{background:rgba(184,150,62,.35)}to{background:transparent}}',
      '.nt-v .nt-tbl caption{caption-side:top;text-align:left;font-size:.8rem;color:var(--mv-muted);padding:.3rem .5rem 0}',
      '.nt-v .nt-chips{display:flex;flex-wrap:wrap;gap:.3rem;margin:.55rem 0 0}',
      '.nt-v .nt-chip{display:inline-flex;align-items:baseline;gap:.15rem;padding:.2rem .5rem;border-radius:999px;border:1px solid var(--mv-line);background:var(--mv-card);font:600 .85rem system-ui,sans-serif;font-variant-numeric:tabular-nums;color:var(--mv-ink)}',
      '.nt-v .nt-chip.on{border-color:var(--nt-p0);background:rgba(0,112,60,.14);color:var(--nt-p0)}',
      '.nt-v .nt-chip.bad{border-color:var(--nt-p2);background:rgba(214,51,108,.12);color:var(--nt-p2)}',
      '.nt-v .nt-chip.hi{border-color:var(--nt-hi);background:rgba(184,150,62,.2)}',
      '.nt-v .nt-chip.dim{opacity:.55}',
      '.nt-v .nt-chip small{font-weight:500;color:var(--mv-muted)}',
      '.nt-v .nt-sieve{display:grid;gap:3px;max-width:560px;margin:0 auto}',
      '.nt-v .nt-c{position:relative;display:flex;align-items:center;justify-content:center;min-height:30px;border-radius:7px;border:1px solid var(--mv-line);background:var(--mv-card);font:600 .85rem system-ui,sans-serif;font-variant-numeric:tabular-nums;color:var(--mv-ink);transition:background .25s,color .25s,opacity .25s}',
      '.nt-v .nt-c.x{color:var(--mv-muted);opacity:.62;background:transparent}',
      '.nt-v .nt-c.x::after{content:"";position:absolute;left:18%;right:18%;top:50%;border-top:2px solid var(--xc,var(--mv-muted));transform:rotate(-24deg)}',
      '.nt-v .nt-c.p{color:var(--pc,var(--nt-p0));border:2px solid var(--pc,var(--nt-p0));font-weight:800;background:var(--nt-bg)}',
      '.nt-v .nt-c.pr{color:var(--nt-p0);border-color:var(--nt-p0);font-weight:800}',
      '.nt-v .nt-c.one{color:var(--mv-muted);border-style:dashed}',
      '.nt-v .nt-c.now{box-shadow:0 0 0 3px rgba(184,150,62,.55)}',
      '.nt-v .nt-crt{display:table;width:auto;border-collapse:separate;border-spacing:3px;margin:0 auto}',
      '.nt-v .nt-crt th{font:600 .78rem system-ui,sans-serif;color:var(--mv-muted);padding:0 .2rem;text-align:center}',
      '.nt-v .nt-crt td{padding:0}',
      '.nt-v .nt-crt button{width:100%;min-width:34px;min-height:34px;padding:0 .15rem;border-radius:7px;border:1px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);font:700 .85rem system-ui,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer}',
      '.nt-v .nt-crt button.f{background:rgba(28,111,214,.12);border-color:var(--nt-p1)}',
      '.nt-v .nt-crt button.last{box-shadow:0 0 0 3px rgba(184,150,62,.6)}',
      '.nt-v .nt-crt button.t{border:2px solid var(--nt-hi);background:rgba(184,150,62,.22)}',
      '.nt-v .nt-crt button.sel{outline:3px solid var(--nt-p2);outline-offset:1px}',
      '.nt-v .nt-crt button:focus-visible{outline:3px solid #b8963e;outline-offset:1px}',
      '.nt-v .nt-crtwrap{max-width:100%;overflow-x:auto;padding:.2rem 0}',
      '.nt-v .nt-crtlg{margin:0 0 .35rem;text-align:center;font-size:.82rem;color:var(--mv-muted)}',
      '@media (max-width:480px){.nt-v .nt-crt button{min-width:30px;min-height:32px;font-size:.8rem}.nt-v .nt-crt{border-spacing:2px}}',
      '.nt-v .nt-key{display:inline-block;width:.8em;height:.8em;border-radius:50%;margin:0 .3em 0 .6em;vertical-align:-.05em}',
      '.nt-v .nt-ok{color:var(--nt-p0);font-weight:700}',
      '.nt-v .nt-no{color:var(--nt-p2);font-weight:700}',
      '.nt-v .nt-cf{font:600 1.05rem Georgia,serif;margin:.5rem 0 0;text-align:center;overflow-wrap:anywhere}',
      '@media (max-width:480px){.nt-v .nt-c{min-height:27px;font-size:.78rem}.nt-v .nt-tbl table{font-size:.8rem}.nt-v .nt-tbl th,.nt-v .nt-tbl td{padding:.25rem .38rem}}',
      '@media (prefers-reduced-motion:reduce){.nt-v *{transition:none!important;animation:none!important}}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ---------------------------------------------------------------- exact helpers
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function mod(a, n) { var r = a % n; return r < 0 ? r + n : r; }
  function mulmod(a, b, n) { var p = a * b; return M.abs(p) < 9007199254740991 ? mod(p, n) : Number(((BigInt(a) * BigInt(b)) % BigInt(n) + BigInt(n)) % BigInt(n)); }
  function powmod(a, e, n) { if (n === 1) return 0; var A = BigInt(mod(a, n)), N = BigInt(n), r = 1n, E = BigInt(e); while (E > 0n) { if (E & 1n) r = r * A % N; A = A * A % N; E >>= 1n; } return Number(r); }
  function isPrime(n) { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (var d = 3; d * d <= n; d += 2) if (n % d === 0) return false; return true; }
  function factor(n) { var out = [], p = 2; while (p * p <= n) { if (n % p === 0) { var k = 0; while (n % p === 0) { n /= p; k++; } out.push([p, k]); } p += p === 2 ? 1 : 2; } if (n > 1) out.push([n, 1]); return out; }
  function phi(n) { var r = n; factor(n).forEach(function (f) { r = r / f[0] * (f[0] - 1); }); return r; }
  function ord(a, n) { if (n < 2 || gcd(a, n) !== 1) return 0; var x = mod(a, n), k = 1; while (x !== 1) { x = mulmod(x, a, n); k++; if (k > n) return 0; } return k; }
  function inv(a, n) { var r0 = n, r1 = mod(a, n), t0 = 0, t1 = 1; while (r1) { var q = M.floor(r0 / r1), t = r0 - q * r1; r0 = r1; r1 = t; t = t0 - q * t1; t0 = t1; t1 = t; } return r0 === 1 ? mod(t0, n) : null; }
  function isqrt(n) { var r = M.floor(M.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; }
  function int(v, lo, hi, def) { v = M.round(+v); if (!isFinite(v)) v = def; return M.max(lo, M.min(hi, v)); }
  var SUPS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '(': '⁽', ')': '⁾' };
  var SUBS = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '-': '₋' };
  function sup(n) { return String(n).split('').map(function (c) { return SUPS[c] || c; }).join(''); }
  function sub(n) { return String(n).split('').map(function (c) { return SUBS[c] || c; }).join(''); }
  function mi(n) { return String(n).replace(/-/g, '−'); } // a real minus sign
  function par(n) { return n < 0 ? '(' + mi(n) + ')' : String(n); }
  function grp(n) { var s = String(M.abs(n)); if (s.length > 4) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (n < 0 ? '−' : '') + s; } // 12,345
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pc(i) { return 'var(--nt-p' + (((i % 8) + 8) % 8) + ')'; }

  // ---------------------------------------------------------------- DOM and SVG helpers
  function S(tag, attrs, parent, text) {
    var e = D.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function svg(parent, label) { var s = S('svg', { class: 'nt-svg', role: 'img', 'aria-label': label }); parent.appendChild(s); return s; }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function watch(box, fn) { var last = 0; function go() { var w = box.clientWidth; if (w && w !== last) { last = w; fn(w); } } if ('ResizeObserver' in W) new ResizeObserver(go).observe(box); else W.addEventListener('resize', go); go(); if (!last) fn(320); }
  function frame(el, o, label) {
    el.classList.add('mla', 'nt-v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'nt-row'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    F.say = function (h) { F.out.set(h); };
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    F.after = function (node) { el.insertBefore(node, F.ctl); return node; }; // under the picture, above the controls
    F.tail = mk('div', 'nt-tail'); el.appendChild(F.tail); // under the readout (tables, lists)
    return F;
  }
  function numIn(parent, label, value, lo, hi, change, narrow) {
    var l = mk('label', 'nt-num'), s = mk('span', '', label), i = D.createElement('input');
    i.type = 'number'; i.step = 1; i.min = lo; i.max = hi; i.value = value; i.inputMode = 'numeric'; if (narrow) i.className = 'nt-w3';
    l.appendChild(s); l.appendChild(i); parent.appendChild(l);
    i.addEventListener('change', function () { var v = int(i.value, lo, hi, value); i.value = v; change(v); });
    return i;
  }
  function btn(parent, text, fn, pri) { return V.button(parent, text, fn, pri ? 'pri' : ''); }
  function table(parent, head, cap) {
    var w = mk('div', 'nt-tbl'), t = mk('table'), th = mk('thead'), tr = mk('tr'), tb = mk('tbody');
    if (cap) { var c = mk('caption', '', cap); t.appendChild(c); }
    head.forEach(function (h, i) { var x = mk('th', typeof h === 'object' ? h[1] : '', typeof h === 'object' ? h[0] : h); x.scope = 'col'; tr.appendChild(x); });
    th.appendChild(tr); t.appendChild(th); t.appendChild(tb); w.appendChild(t); parent.appendChild(w);
    w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', cap || 'Table');
    return { el: w, body: tb, row: function (cells, cls) { var r = mk('tr', cls || ''); cells.forEach(function (c) { var td = mk('td', typeof c === 'object' && c ? c[1] : '', typeof c === 'object' && c ? c[0] : c); r.appendChild(td); }); tb.appendChild(r); return r; }, clear: function () { clear(tb); } };
  }
  function arrowDef(s, id) {
    var defs = S('defs', null, s), m = S('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse', markerUnits: 'strokeWidth' }, defs);
    S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:context-stroke' }, m);
    return 'url(#' + id + ')';
  }

  // ================================================================ nt-euclid
  V.register('nt-euclid', function (el, o) {
    o = Object.assign({ a: 252, b: 198, mode: 'gcd', x: null, steps: true, table: true }, o || {});
    var F = frame(el, o, 'The Euclidean algorithm as squares cut from a rectangle');
    var mode = /^(gcd|bezout|cf)$/.test(o.mode) ? o.mode : 'gcd';
    var a = int(o.a, 1, 99999, 252), b = int(o.b, 1, 99999, 198), d = 0;
    if (mode === 'cf' && o.x) { var mm = /^sqrt\(?(\d+)\)?$/.exec(String(o.x).replace(/\s|√/g, function (c) { return c === '√' ? 'sqrt' : ''; })); if (mm) d = int(+mm[1], 2, 999, 7); if (d && isqrt(d) * isqrt(d) === d) d = 0; }
    var shown = (o.steps === false || !F.edit) ? Infinity : 0, steps = [], uid = V.uid('nte');
    var pic = mk('div', 'nt-pic'); F.box.appendChild(pic);
    var s = svg(pic, ''), cfLine = mk('p', 'nt-cf'); cfLine.setAttribute('aria-live', 'polite');
    var tbl = null, W0 = 320;
    if (mode === 'cf') F.after(cfLine);

    function compute() {
      steps = [];
      if (d) { // √d: exact complete quotients (√d + m)/c
        var a0 = isqrt(d), m = 0, c = 1, q = a0, seen = {};
        for (var k = 0; k < 40; k++) {
          var key = m + ',' + c, rep = seen[key] !== undefined ? seen[key] : -1; if (rep < 0 && k) seen[key] = k;
          steps.push({ q: q, m: m, c: c, rep: k && rep >= 0 ? rep : -1 });
          m = c * q - m; c = (d - m * m) / c; q = M.floor((a0 + m) / c);
        }
        var per = 0; for (var j = 1; j < steps.length; j++) if (steps[j].q === 2 * a0) { per = j; break; }
        steps.per = per;
      } else {
        var A = a, B = b, s0 = 1, t0 = 0, s1 = 0, t1 = 1;
        while (B) { var qq = M.floor(A / B), r = A - qq * B, s2 = s0 - qq * s1, t2 = t0 - qq * t1; steps.push({ A: A, B: B, q: qq, r: r, s: s2, t: t2, ps: s1, pt: t1 }); A = B; B = r; s0 = s1; t0 = t1; s1 = s2; t1 = t2; }
      }
      // convergents
      var p2 = 0, p1 = 1, q2 = 1, q1 = 0;
      steps.forEach(function (st) { var p = st.q * p1 + p2, qn = st.q * q1 + q2; st.p = p; st.qn = qn; p2 = p1; p1 = p; q2 = q1; q1 = qn; });
    }
    function nShow() { return d ? M.min(shown, 12) : M.min(shown, steps.length); }
    function total() { return d ? 12 : steps.length; }
    function g() { return d ? 0 : steps[steps.length - 1].B; }

    function draw(Wpx) {
      W0 = Wpx; clear(s);
      var pad = 22, maxH = M.min(380, M.max(220, Wpx * 0.75)), wA = d ? M.sqrt(d) : a, hB = d ? 1 : b;
      var sc = M.min((Wpx - 2 * pad) / wA, (maxH - 2 * pad) / hB), w = wA * sc, h = hB * sc, x0 = (Wpx - w) / 2, y0 = pad;
      s.setAttribute('viewBox', '0 0 ' + Wpx + ' ' + (h + 2 * pad)); s.setAttribute('width', Wpx); s.setAttribute('height', h + 2 * pad);
      S('rect', { x: x0, y: y0, width: w, height: h, style: 'fill:var(--nt-bg);stroke:var(--mv-ink);stroke-width:1.5' }, s);
      // squares, step by step: the current rectangle is (x, y) with the long side L along dir (0 across, 1 down) and short side Sd
      var x = x0, y = y0, dir = 0, L = w, Sd = h, n = nShow(), lens = [wA, hB];
      for (var i = 0; i < n; i++) {
        var st = steps[i], side = Sd, q = st.q, col = pc(i), lab = d ? '' : String(st.B);
        for (var k = 0; k < q; k++) {
          var sx = dir ? x : x + k * side, sy = dir ? y + k * side : y;
          S('rect', { x: sx, y: sy, width: side, height: side, style: 'fill:' + col + ';fill-opacity:.16;stroke:' + col + ';stroke-width:1.5' }, s);
          if (k === 0 && !F.quiet && side >= 26 && lab) S('text', { x: sx + side / 2, y: sy + side / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': M.min(16, side / 3), style: 'font-weight:700;fill:' + col }, s, lab);
        }
        if (q > 1 && !F.quiet && side >= 8 && side * q >= 40) { // a count badge on the row: "×3"
          var bx = dir ? x + side / 2 : x + q * side - 4, by = dir ? y + q * side - 4 : y + side / 2;
          if (side >= 26) S('text', { x: dir ? x + side - 4 : bx, y: dir ? by : y + side - 5, 'text-anchor': 'end', 'font-size': 11, style: 'font-weight:700;fill:' + col }, s, '×' + q);
        }
        var used = q * side;
        if (dir === 0) { x += used; L -= used; } else { y += used; L -= used; }
        // the leftover becomes the next rectangle, turned
        var nl = Sd, ns = L; L = nl; Sd = ns; dir = 1 - dir;
        if (Sd < 0.6) break;
      }
      // the gcd grid once finished
      if (!d && n >= steps.length && !F.quiet) {
        var gg = g(), cs = gg * sc;
        if (a / gg <= 90 && b / gg <= 90 && cs >= 8) {
          var path = '';
          for (var gx = 1; gx < a / gg; gx++) path += 'M' + (x0 + gx * cs) + ' ' + y0 + 'v' + h;
          for (var gy = 1; gy < b / gg; gy++) path += 'M' + x0 + ' ' + (y0 + gy * cs) + 'h' + w;
          if (path) S('path', { d: path, style: 'fill:none;stroke:var(--mv-ink);stroke-opacity:.35;stroke-width:1;stroke-dasharray:2 3' }, s);
        }
      }
      // side labels
      S('text', { x: x0 + w / 2, y: y0 - 7, 'text-anchor': 'middle', 'font-size': 13, style: 'font-weight:700' }, s, d ? '√' + d : String(a));
      var ly = S('text', { x: x0 - 7, y: y0 + h / 2, 'text-anchor': 'middle', 'font-size': 13, style: 'font-weight:700', transform: 'rotate(-90 ' + (x0 - 7) + ' ' + (y0 + h / 2) + ')' }, s, d ? '1' : String(b));
      ly.setAttribute('dominant-baseline', 'auto');
      s.setAttribute('aria-label', (d ? 'A √' + d + ' by 1 rectangle' : 'A ' + a + ' by ' + b + ' rectangle') + ' cut into squares, ' + n + ' step' + (n === 1 ? '' : 's') + ' shown');
    }

    function fillTable() {
      if (!tbl) return; tbl.clear(); var n = nShow();
      for (var i = 0; i < n; i++) {
        var st = steps[i], cls = (i === n - 1 && shown !== Infinity && i > 0) ? 'new' : '';
        if (d) {
          var x = st.m ? '(√' + d + ' + ' + st.m + ')' : '√' + d, cell = st.c === 1 ? x : x + ' / ' + st.c;
          tbl.row([String(i), [cell, 'l'], String(st.q), grp(st.p) + '/' + grp(st.qn), mi(st.p * st.p - d * st.qn * st.qn)], cls);
        } else if (mode === 'cf') {
          tbl.row([String(i), [grp(st.A) + ' = ' + grp(st.B) + ' · ' + st.q + ' + ' + grp(st.r), 'l'], String(st.q), grp(st.p) + '/' + grp(st.qn)], cls + (st.r === 0 ? ' hi' : ''));
        } else {
          var cells = [String(i + 1), [grp(st.A) + ' = ' + grp(st.B) + ' · ' + st.q + ' + ' + grp(st.r), 'l']];
          if (mode === 'bezout') cells.push(st.r ? [grp(st.r) + ' = ' + grp(a) + '·' + par(st.s) + ' + ' + grp(b) + '·' + par(st.t), 'l'] : ['—', 'l']);
          tbl.row(cells, cls + (i + 1 < steps.length && steps[i + 1].r === 0 && n >= steps.length ? ' hi' : ''));
        }
      }
    }
    function say() {
      var n = nShow(), done = n >= total();
      if (d) {
        var qs = steps.slice(0, n).map(function (st) { return st.q; });
        cfLine.textContent = F.quiet ? '' : '√' + d + ' = [' + (qs.length ? qs[0] + (qs.length > 1 ? '; ' + qs.slice(1).join(', ') : '') : '') + (done ? ', …]' : (n ? ', …]' : '…]'));
        if (F.quiet) { F.say('Each row of squares is one partial quotient; the leftover strip is never zero.'); return; }
        var per = steps.per, a0 = steps[0].q;
        F.say(n ? (done ? 'The pattern repeats forever: √' + d + ' = [' + a0 + '; ' + steps.slice(1, per + 1).map(function (st) { return st.q; }).join(', ') + ', …], with the block <b>' + steps.slice(1, per + 1).map(function (st) { return st.q; }).join(', ') + '</b> repeating (period ' + per + '). The last column, p² − ' + d + 'q², is always small.' : 'Step ' + (n - 1) + ': ' + steps[n - 1].q + ' square' + (steps[n - 1].q === 1 ? '' : 's') + '. The leftover strip has an irrational side, so it never runs out.') : 'Press <b>Next step</b> to cut off the largest squares that fit.');
        return;
      }
      var gg = g();
      if (mode === 'cf') {
        var qs2 = steps.slice(0, n).map(function (st) { return st.q; });
        cfLine.textContent = F.quiet ? '' : grp(a) + '/' + grp(b) + ' = [' + (qs2.length ? qs2[0] + (qs2.length > 1 ? '; ' + qs2.slice(1).join(', ') : '') : '') + (done ? ']' : (n ? ', …]' : '…]'));
      }
      if (F.quiet) { F.say(n ? 'Keep cutting off the largest squares that fit until nothing is left over.' : 'Cut off the largest squares that fit, again and again.'); return; }
      if (!n) { F.say('Press <b>Next step</b> to cut off the largest squares that fit.'); return; }
      var st = steps[n - 1];
      if (!done) { F.say('Step ' + n + ': ' + st.q + ' square' + (st.q === 1 ? '' : 's') + ' of side ' + grp(st.B) + ' fit along ' + grp(st.A) + ', leaving a strip ' + grp(st.r) + ' wide. Now cut squares from the ' + grp(st.B) + ' by ' + grp(st.r) + ' strip.'); return; }
      var last = steps.length > 1 ? steps[steps.length - 2] : null;
      if (mode === 'bezout') F.say('gcd(' + grp(a) + ', ' + grp(b) + ') = <b>' + grp(gg) + '</b> = ' + grp(a) + '·' + par(last ? last.s : 0) + ' + ' + grp(b) + '·' + par(last ? last.t : 1) + '. Every row of the last column checks itself: multiply out and you get that row\'s remainder.');
      else if (mode === 'cf') F.say('The quotients are the partial quotients. The last convergent is ' + grp(a / gg) + '/' + grp(b / gg) + ', the fraction in lowest terms.');
      else F.say('The remainder is 0, so the last nonzero remainder, <b>' + grp(gg) + '</b>, is gcd(' + grp(a) + ', ' + grp(b) + '). Squares of side ' + grp(gg) + ' tile the whole rectangle (dotted grid).');
      F.done(true);
    }
    function render() { draw(W0); fillTable(); say(); if (bNext) { bNext.disabled = nShow() >= total(); bAll.disabled = bNext.disabled; } }

    if (o.table !== false && !F.quiet) {
      var head = d ? ['k', ['complete quotient', 'l'], 'qₖ', 'pₖ/qₖ', 'p² − ' + d + 'q²'] : mode === 'cf' ? ['k', ['division', 'l'], 'qₖ', 'convergent'] : (mode === 'bezout' ? ['', ['division', 'l'], ['remainder = a·s + b·t', 'l']] : ['', ['division', 'l']]);
      tbl = table(F.tail, head, d ? 'Partial quotients and convergents of √' + d : 'The division steps');
    }
    var bNext = null, bAll = null;
    if (F.edit) {
      if (d) numIn(F.ctl, 'd', d, 2, 999, function (v) { if (isqrt(v) * isqrt(v) === v) v++; d = v; compute(); render(); }, true);
      else { numIn(F.ctl, 'a', a, 1, 99999, function (v) { a = v; compute(); render(); }); numIn(F.ctl, 'b', b, 1, 99999, function (v) { b = v; compute(); render(); }); }
      if (o.steps !== false) {
        bNext = btn(F.ctl, 'Next step', function () { if (shown === Infinity) shown = total(); shown = M.min(total(), shown + 1); render(); }, true);
        bAll = btn(F.ctl, 'Show all', function () { shown = Infinity; render(); });
        btn(F.ctl, 'Start over', function () { shown = 0; F.done(false); render(); });
      }
    }
    compute();
    watch(pic, function (w) { W0 = M.max(220, w - 18); render(); });
    return { update: function (q) { Object.assign(o, q); a = int(o.a, 1, 99999, a); b = int(o.b, 1, 99999, b); compute(); render(); } };
  });

  // ================================================================ nt-sieve
  V.register('nt-sieve', function (el, o) {
    o = Object.assign({ mode: 'sieve', N: 100, cols: 10, n: 221, step: true }, o || {});
    var F = frame(el, o, o.mode === 'test' ? 'Trial division' : o.mode === 'count' ? 'Counting primes' : 'The sieve of Eratosthenes');
    var mode = /^(sieve|test|count)$/.test(o.mode) ? o.mode : 'sieve';
    if (mode === 'count') return countMode(el, o, F);
    if (mode === 'test') return testMode(el, o, F);
    var N = int(o.N, 10, 400, 100), cols = o.cols === 6 ? 6 : int(o.cols, 4, 20, 10);
    var grid = mk('div', 'nt-sieve'); F.box.appendChild(grid);
    var cells = [], mark, primes, cur, finished;
    function build() {
      clear(grid); cells = [null];
      grid.style.gridTemplateColumns = 'repeat(' + cols + ',minmax(0,1fr))';
      for (var i = 1; i <= N; i++) { var c = mk('div', 'nt-c', String(i)); grid.appendChild(c); cells.push(c); }
      grid.setAttribute('role', 'img');
      reset();
    }
    function reset() { mark = new Array(N + 1).fill(0); primes = []; cur = 1; finished = false; cells[1].className = 'nt-c one'; for (var i = 2; i <= N; i++) { cells[i].className = 'nt-c'; cells[i].style.removeProperty('--xc'); cells[i].style.removeProperty('--pc'); } }
    function next() {
      if (finished) return;
      var p = cur + 1; while (p <= N && mark[p]) p++;
      if (p > N) { finish(); return; }
      cells.forEach(function (c) { if (c) c.classList.remove('now'); });
      if (p * p > N) { finish(p); return; }
      cur = p; primes.push(p); var col = pc(primes.length - 1);
      cells[p].className = 'nt-c p now'; cells[p].style.setProperty('--pc', col);
      var hit = [];
      for (var m = p * p; m <= N; m += p) { if (!mark[m]) { mark[m] = p; cells[m].className = 'nt-c x'; cells[m].style.setProperty('--xc', col); hit.push(m); } }
      mark[p] = -1;
      if (F.quiet) F.say('Crossed out the multiples of ' + p + ', starting at ' + p + '² = ' + p * p + '.');
      else F.say('<b>' + p + '</b> is prime. Cross out its multiples from ' + p + '² = ' + (p * p) + ': ' + (hit.length ? hit.slice(0, 14).join(', ') + (hit.length > 14 ? ', …' : '') : 'all of them were already crossed out') + '. (Smaller multiples like ' + (2 * p) + ' were already crossed out by smaller primes.)');
      el.setAttribute('aria-label', 'Sieve of Eratosthenes up to ' + N + ', primes so far: ' + primes.join(', '));
    }
    function finish(p) {
      finished = true; var cnt = 0, lead = p || (cur + 1);
      for (var i = 2; i <= N; i++) if (!mark[i] || mark[i] === -1) { cnt++; if (mark[i] !== -1) { cells[i].className = 'nt-c pr'; } }
      cells.forEach(function (c) { if (c) c.classList.remove('now'); });
      var nxt = lead; while (nxt <= N && mark[nxt] > 0) nxt++;
      if (F.quiet) F.say('Every number not crossed out (other than 1) is prime.');
      else F.say((nxt <= N ? 'The next prime is ' + nxt + ', and ' + nxt + '² = ' + nxt * nxt + ' > ' + N + ', so every number left is prime. ' : '') + 'There are <b>' + cnt + '</b> primes up to ' + N + ' (π(' + N + ') = ' + cnt + '); the estimate ' + N + '/ln ' + N + ' ≈ ' + V.fmt(N / M.log(N), 1) + '. 1 is neither prime nor composite.');
      F.done(true);
    }
    if (F.edit) {
      if (o.step !== false) { btn(F.ctl, 'Next prime', next, true); btn(F.ctl, 'Finish', function () { while (!finished) next(); }); btn(F.ctl, 'Start over', function () { reset(); F.done(false); F.say('Press <b>Next prime</b>. 1 is not prime, so start at 2.'); }); }
      numIn(F.ctl, 'up to', N, 10, 400, function (v) { N = v; build(); F.done(false); start(); }, true);
    }
    function start() { if (o.step === false || !F.edit) { while (!finished) next(); } else F.say('Press <b>Next prime</b>. 1 is not prime, so start at 2.'); }
    build(); start();
    return {};
  });
  function testMode(el, o, F) {
    var n = int(o.n, 2, 1e9, 221), list, idx, chips = mk('div', 'nt-chips'), head = mk('p', 'nt-cf');
    F.box.appendChild(head); F.box.appendChild(chips);
    function build() {
      var r = M.sqrt(n), lim = isqrt(n); list = []; for (var p = 2; p <= lim; p++) if (isPrime(p)) list.push(p);
      idx = 0; clear(chips);
      head.innerHTML = 'n = ' + grp(n) + ', &nbsp;√n ≈ ' + V.fmt(r, 2) + (F.quiet ? '' : '');
      list.forEach(function (p) { chips.appendChild(mk('span', 'nt-chip dim', String(p))); });
      list.els = [].slice.call(chips.children);
      if (!list.length) F.say(n < 4 ? 'There are no primes up to √' + n + ', so ' + n + ' is prime.' : '');
      else F.say('Try the primes up to √' + grp(n) + ' ≈ ' + V.fmt(r, 2) + ': ' + (list.length > 12 ? list.slice(0, 12).join(', ') + ', … (' + list.length + ' of them)' : list.join(', ')) + '.');
      if (o.step === false || !F.edit) { while (step()); }
    }
    function step() {
      if (idx >= list.length) return false;
      var p = list[idx], r = n % p, c = list.els[idx]; idx++;
      c.className = 'nt-chip ' + (r === 0 ? 'bad' : 'on');
      if (!F.quiet) c.innerHTML = p + ' <small>r ' + r + '</small>';
      if (r === 0) {
        list.els.slice(idx).forEach(function (e) { e.classList.add('dim'); });
        idx = list.length;
        F.say(F.quiet ? 'Divisor tests done.' : grp(n) + ' = ' + p + ' · ' + grp(n / p) + ', so ' + grp(n) + ' is <b>composite</b>. One divisor is enough.');
        return false;
      }
      if (idx >= list.length) { F.say(F.quiet ? 'Every prime up to √n has been tried.' : 'No prime up to √' + grp(n) + ' divides it, so ' + grp(n) + ' is <b>prime</b>. (A factor above √n would pair with one below it.)'); F.done(true); return false; }
      if (!F.quiet) F.say(grp(n) + ' ÷ ' + p + ' leaves remainder ' + r + '. Next try ' + list[idx] + '.');
      return true;
    }
    if (F.edit) { btn(F.ctl, 'Try next divisor', step, true); btn(F.ctl, 'All', function () { while (step()); }); numIn(F.ctl, 'n', n, 2, 1e9, function (v) { n = v; F.done(false); build(); }); }
    build();
    return {};
  }
  function countMode(el, o, F) {
    var N = int(o.N, 100, 100000, 1000), x = N, pi = null, maxN = 1000000;
    function sieve() { var s = new Uint8Array(maxN + 1), c = new Int32Array(maxN + 1), k = 0; for (var i = 2; i <= maxN; i++) { if (!s[i]) { k++; if (i <= 1000) for (var j = i * i; j <= maxN; j += i) s[j] = 1; } c[i] = k; } return c; }
    pi = sieve();
    var pic = mk('div', 'nt-pic'); F.box.appendChild(pic); var s = svg(pic, 'π(x) against x/ln x'), W0 = 320;
    function draw(Wpx) {
      W0 = Wpx; clear(s); var h = M.round(M.min(320, M.max(210, Wpx * 0.62))), L = 46, R = 12, T = 12, B = 28, w = Wpx - L - R, hh = h - T - B, ym = pi[N] * 1.15;
      s.setAttribute('viewBox', '0 0 ' + Wpx + ' ' + h); s.setAttribute('width', Wpx); s.setAttribute('height', h);
      function X(v) { return L + v / N * w; } function Y(v) { return T + hh - v / ym * hh; }
      S('path', { d: 'M' + L + ' ' + T + 'V' + (T + hh) + 'H' + (L + w), style: 'fill:none;stroke:var(--mv-muted);stroke-width:1.2' }, s);
      var tk = [0.25, 0.5, 0.75, 1].map(function (f) { return M.round(N * f); });
      tk.forEach(function (v, i) { S('text', { x: X(v), y: T + hh + 17, 'text-anchor': i === 3 ? 'end' : 'middle', 'font-size': 11, class: 'nt-mut' }, s, grp(v)); });
      [0.5, 1].forEach(function (f) { var v = M.round(pi[N] * f); S('text', { x: L - 5, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, class: 'nt-mut' }, s, grp(v)); S('path', { d: 'M' + L + ' ' + Y(v) + 'h' + w, style: 'stroke:var(--mv-line);stroke-width:1' }, s); });
      // staircase π(x)
      var d = 'M' + X(2) + ' ' + Y(0), stepN = M.max(1, M.floor(N / 1500));
      for (var v = 2; v <= N; v += stepN) d += 'H' + X(v).toFixed(1) + 'V' + Y(pi[v]).toFixed(1);
      S('path', { d: d, style: 'fill:none;stroke:var(--nt-p0);stroke-width:2' }, s);
      var e = ''; for (var i = 0; i <= 200; i++) { var t = 3 + (N - 3) * i / 200; e += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(t / M.log(t)).toFixed(1); }
      S('path', { d: e, style: 'fill:none;stroke:var(--nt-p1);stroke-width:2;stroke-dasharray:6 4' }, s);
      S('path', { d: 'M' + X(x) + ' ' + T + 'V' + (T + hh), style: 'stroke:var(--nt-hi);stroke-width:1.5' }, s);
      S('circle', { cx: X(x), cy: Y(pi[x]), r: 4.5, style: 'fill:var(--nt-p0)' }, s);
      S('circle', { cx: X(x), cy: Y(x / M.log(x)), r: 4.5, style: 'fill:var(--nt-p1)' }, s);
      S('text', { x: L + 6, y: T + 12, 'font-size': 12, style: 'font-weight:700;fill:var(--nt-p0)' }, s, 'π(x), the exact count');
      S('text', { x: L + 6, y: T + 28, 'font-size': 12, style: 'font-weight:700;fill:var(--nt-p1)' }, s, 'x / ln x, the estimate');
    }
    function say() {
      if (F.quiet) { F.say('The solid staircase counts primes; the dashed curve is the estimate x/ln x.'); return; }
      var est = x / M.log(x);
      F.say('x = ' + grp(x) + ': π(x) = <b>' + grp(pi[x]) + '</b>, x/ln x ≈ ' + grp(M.round(est)) + '. The estimate is low by ' + V.fmt(100 * (pi[x] - est) / pi[x], 1) + '% of the count.');
    }
    var sl = F.edit ? V.slider(F.ctl, { label: 'x', min: 0, max: N, step: M.max(1, M.round(N / 500)), value: x, fmt: function (v) { return grp(M.max(10, M.round(v))); }, input: function (v) { x = M.max(10, M.round(v)); draw(W0); say(); } }) : null;
    if (sl) sl.el.style.flexBasis = '100%';
    if (!F.quiet) {
      var t = table(F.tail, ['x', 'π(x)', 'x / ln x', 'ratio'], 'Exact counts and the estimate');
      [10, 100, 1000, 10000, 100000, 1000000].forEach(function (v) { var est = v / M.log(v); t.row([grp(v), grp(pi[v]), grp(M.round(est)), (pi[v] / est).toFixed(3)]); });
    }
    watch(pic, function (w) { draw(M.max(220, w - 18)); });
    say();
    return {};
  }

  // ================================================================ nt-clock
  V.register('nt-clock', function (el, o) {
    o = Object.assign({ n: 12, mode: 'add', a: 5, b: 3, x: 7, letters: false, negative: true }, o || {});
    var mode = /^(add|mult|inverse|solve|affine|squares|wilson)$/.test(o.mode) ? o.mode : 'add';
    var F = frame(el, o, 'Residues on a clock');
    var n = mode === 'affine' ? 26 : int(o.n, 2, 60, 12), a = M.round(+o.a) || 0, b = M.round(+o.b) || 0, x = M.round(+o.x) || 0;
    var letters = mode === 'affine' || (o.letters && n === 26);
    var pic = mk('div', 'nt-pic'); pic.style.maxWidth = '440px'; pic.style.margin = '0 auto'; F.box.appendChild(pic);
    var s = svg(pic, 'Residues mod ' + n), uid = V.uid('ntc'), Wpx = 320, extra = F.tail;
    s.setAttribute('tabindex', '0');
    function lab(k) { return letters ? String.fromCharCode(65 + k) : String(k); }
    function pos(k, r) { var t = 2 * M.PI * k / n - M.PI / 2; return [r * M.cos(t), r * M.sin(t)]; }
    function chord(p, q, R, cls) { // a curved arrow from residue p to residue q (inside the circle); p = q gives a small loop
      var A = pos(p, R), B = pos(q, R);
      if (p === q) { var t = 2 * M.PI * p / n - M.PI / 2, ox = M.cos(t), oy = M.sin(t), c1 = [A[0] - 0.42 * R * ox - 0.2 * R * oy, A[1] - 0.42 * R * oy + 0.2 * R * ox], c2 = [A[0] - 0.42 * R * ox + 0.2 * R * oy, A[1] - 0.42 * R * oy - 0.2 * R * ox]; return 'M' + A + 'C' + c1 + ' ' + c2 + ' ' + A; }
      var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, k = 0.35; // pull the control point toward the center
      return 'M' + A[0].toFixed(2) + ',' + A[1].toFixed(2) + 'Q' + (mx * k).toFixed(2) + ',' + (my * k).toFixed(2) + ' ' + B[0].toFixed(2) + ',' + B[1].toFixed(2);
    }
    function draw() {
      clear(s);
      var W = Wpx, R = W * 0.36, c = W / 2, fs = M.max(10, M.min(15, R * 2.6 / n + 4)), showEvery = n > 36 ? M.ceil(n / 24) : 1;
      s.setAttribute('viewBox', (-c) + ' ' + (-c) + ' ' + W + ' ' + W); s.setAttribute('width', W); s.setAttribute('height', W);
      var mark = arrowDef(s, uid + 'm');
      S('circle', { cx: 0, cy: 0, r: R, style: 'fill:none;stroke:var(--mv-line);stroke-width:2' }, s);
      var st = state(), hl = st.hl || {}, dim = st.dim || {};
      // arrows first
      var g = S('g', null, s);
      (st.arrows || []).forEach(function (ar) {
        var col = ar.col || 'var(--nt-p1)';
        S('path', { d: ar.d || chord(ar.p, ar.q, R - 8), style: 'fill:none;stroke:' + col + ';stroke-width:' + (ar.w || 1.8) + ';stroke-opacity:' + (ar.op || 0.85) + (ar.dash ? ';stroke-dasharray:' + ar.dash : ''), 'marker-end': ar.d || ar.p === ar.q ? null : mark }, g);
      });
      if (st.arc) drawArc(st.arc, R, mark);
      for (var k = 0; k < n; k++) {
        var P = pos(k, R), h = hl[k], dm = dim[k];
        S('circle', { cx: P[0], cy: P[1], r: h ? 7 : 5, style: 'fill:' + (h ? h : dm ? 'var(--nt-bg)' : 'var(--mv-ink)') + ';stroke:' + (h || (dm ? 'var(--nt-dim)' : 'var(--mv-ink)')) + ';stroke-width:2' }, s);
        if (k % showEvery === 0 || h) {
          var Lp = pos(k, R + fs * 1.15);
          S('text', { x: Lp[0], y: Lp[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs, style: 'font-weight:' + (h ? 800 : 600) + (dm ? ';fill:var(--mv-muted)' : '') }, s, lab(k));
          if (o.negative !== false && mode === 'add' && k && n <= 24) { var Ln = pos(k, R + fs * 2.45); S('text', { x: Ln[0], y: Ln[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs * 0.78, class: 'nt-mut' }, s, mi(k - n)); }
        }
      }
      if (st.center) S('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': M.min(22, R / 4), style: 'font-weight:800;fill:var(--nt-hi)' }, s, st.center);
      s.setAttribute('aria-label', st.aria || ('Clock with ' + n + ' points'));
      F.say(st.say || '');
      extra.innerHTML = st.extra || '';
      if (st.done) F.done(true);
    }
    function drawArc(arc, R, mark) { // a jump of `len` steps from `from`, drawn as a spiral just inside the circle
      var from = arc.from, len = arc.len; if (!len) return;
      var steps = M.abs(len), dirn = len > 0 ? 1 : -1, pts = [], N = M.max(12, steps * 8), laps = M.ceil(steps / n);
      for (var i = 0; i <= N; i++) { var f = i / N, k = from + dirn * steps * f, rr = R - 14 - 9 * (laps > 1 ? (steps * f) / n : 0), t = 2 * M.PI * k / n - M.PI / 2; pts.push((i ? 'L' : 'M') + (rr * M.cos(t)).toFixed(2) + ',' + (rr * M.sin(t)).toFixed(2)); }
      S('path', { d: pts.join(''), style: 'fill:none;stroke:var(--nt-p5);stroke-width:2.6;stroke-linecap:round', 'marker-end': mark }, s);
    }
    function units() { var u = []; for (var k = 1; k < n; k++) if (gcd(k, n) === 1) u.push(k); return u; }
    function setTxt(arr) { return '{' + arr.map(lab).join(', ') + '}'; }
    function state() {
      var st = { arrows: [], hl: {}, dim: {} }, q = F.quiet, k;
      if (mode === 'add') {
        var start = mod(x, n), land = mod(x + a, n);
        st.arc = { from: start, len: a }; st.hl[start] = 'var(--nt-p1)'; if (!q) st.hl[land] = 'var(--nt-p5)';
        st.say = q ? 'Start at ' + lab(start) + ' and take ' + M.abs(a) + ' step' + (M.abs(a) === 1 ? '' : 's') + (a < 0 ? ' backward' : '') + '.' : mi(x) + ' + ' + par(a) + ' = ' + mi(x + a) + ' ≡ <b>' + land + '</b> (mod ' + n + ')' + (x + a < 0 ? '. A negative number lands on a point from 0 to ' + (n - 1) + ', just like a positive one: ' + mi(x + a) + ' = ' + n + '·' + par(M.floor((x + a) / n)) + ' + ' + land + '.' : '.');
        st.aria = 'Clock mod ' + n + ': a jump of ' + a + ' from ' + start + (q ? '' : ' lands on ' + land);
        if (!q) st.center = String(land);
      } else if (mode === 'mult' || mode === 'inverse' || mode === 'solve') {
        var A = mod(a, n), img = {}, dd = gcd(A, n);
        for (k = 0; k < n; k++) img[mulmod(A, k, n)] = 1;
        var hit = Object.keys(img).map(Number).sort(function (p, r) { return p - r; });
        if (mode === 'mult') {
          for (k = 0; k < n; k++) st.arrows.push({ p: k, q: mulmod(A, k, n), col: 'var(--nt-p1)' });
          if (!q) for (k = 0; k < n; k++) if (!img[k]) st.dim[k] = 1;
          if (!q) hit.forEach(function (h) { if (dd > 1) st.hl[h] = 'var(--nt-p0)'; });
          st.say = q ? 'Each arrow goes from x to ' + A + 'x mod ' + n + '.' : (dd === 1 ? 'gcd(' + A + ', ' + n + ') = 1: every point is hit exactly once, so x ↦ ' + A + 'x is a shuffle (a permutation) of the residues. In particular something lands on 1.' : 'gcd(' + A + ', ' + n + ') = ' + dd + ': only the ' + hit.length + ' multiples of ' + dd + ', ' + setTxt(hit) + ', are hit, each by ' + dd + ' arrows. ' + (img[1] ? '' : 'Nothing lands on 1, so ' + A + ' has <b>no inverse</b> mod ' + n + '.'));
          st.aria = 'Arrows from each x to ' + A + 'x mod ' + n;
        } else if (mode === 'inverse') {
          var iv = inv(A, n);
          for (k = 0; k < n; k++) st.arrows.push({ p: k, q: mulmod(A, k, n), col: 'var(--nt-dim)', w: 1.2, op: 0.9 });
          st.hl[1] = 'var(--nt-p0)';
          if (iv !== null && !q) { st.arrows.push({ p: iv, q: 1, col: 'var(--nt-p5)', w: 3 }); st.hl[iv] = 'var(--nt-p5)'; }
          st.say = q ? 'Which arrow lands on 1?' : (iv !== null ? A + ' · ' + iv + ' = ' + A * iv + ' ≡ 1 (mod ' + n + '), so ' + A + '⁻¹ ≡ <b>' + iv + '</b> (mod ' + n + ').' : 'No arrow lands on 1: gcd(' + A + ', ' + n + ') = ' + dd + ', and every multiple of ' + A + ' mod ' + n + ' is a multiple of ' + dd + '. So ' + A + ' has <b>no inverse</b> mod ' + n + '.');
          if (!q) st.center = iv !== null ? A + '⁻¹ = ' + iv : 'none';
          st.aria = 'Arrows x to ' + A + 'x mod ' + n + (q ? '' : ', inverse ' + (iv === null ? 'none' : iv));
        } else {
          var B = mod(b, n), sols = [];
          for (k = 0; k < n; k++) { var y = mulmod(A, k, n); if (y === B) sols.push(k); }
          for (k = 0; k < n; k++) { var yy = mulmod(A, k, n); st.arrows.push({ p: k, q: yy, col: yy === B && !q ? 'var(--nt-p5)' : 'var(--nt-dim)', w: yy === B && !q ? 2.6 : 1.2 }); }
          st.hl[B] = 'var(--nt-p0)'; if (!q) sols.forEach(function (sx) { st.hl[sx] = 'var(--nt-p5)'; });
          st.say = q ? 'Find every x whose arrow lands on ' + B + '.' : (sols.length ? A + 'x ≡ ' + B + ' (mod ' + n + ') has ' + sols.length + ' solution' + (sols.length === 1 ? '' : 's') + ': x ∈ <b>' + setTxt(sols) + '</b>' + (sols.length > 1 ? ', spaced ' + (n / dd) + ' apart (d = gcd(' + A + ', ' + n + ') = ' + dd + ' divides ' + B + ').' : '.') : 'No arrow lands on ' + B + ': d = gcd(' + A + ', ' + n + ') = ' + dd + ' does not divide ' + B + ', so there is <b>no solution</b>.');
          if (!q) st.center = sols.length ? String(sols.length) + (sols.length === 1 ? ' solution' : ' solutions') : 'none';
          st.aria = 'Solutions of ' + A + 'x ≡ ' + B + ' mod ' + n;
        }
      } else if (mode === 'affine') {
        var A2 = mod(a, 26), B2 = mod(b, 26), X = mod(x, 26), Y = mod(A2 * X + B2, 26);
        if (!q) { st.arrows.push({ p: X, q: Y, col: 'var(--nt-p5)', w: 3 }); st.hl[X] = 'var(--nt-p1)'; st.hl[Y] = 'var(--nt-p5)'; }
        var map = [], cnt = {}; for (k = 0; k < 26; k++) { var z = mod(A2 * k + B2, 26); map.push(z); cnt[z] = (cnt[z] || 0) + 1; }
        var ok = gcd(A2, 26) === 1;
        if (!q) st.extra = '<div class="nt-chips" aria-label="The cipher alphabet">' + map.map(function (z, i) { return '<span class="nt-chip' + (i === X ? ' hi' : '') + (cnt[z] > 1 ? ' bad' : '') + '">' + String.fromCharCode(65 + i) + ' <small>→</small> ' + String.fromCharCode(65 + z) + '</span>'; }).join('') + '</div>';
        st.say = q ? 'Letters as numbers: A = 0, B = 1, …, Z = 25.' : String.fromCharCode(65 + X) + ' = ' + X + ' ↦ ' + A2 + '·' + X + ' + ' + B2 + ' = ' + (A2 * X + B2) + ' ≡ ' + Y + ' (mod 26) = <b>' + String.fromCharCode(65 + Y) + '</b>. ' + (ok ? 'gcd(' + A2 + ', 26) = 1, so every letter has its own cipher letter and the cipher can be undone.' : 'gcd(' + A2 + ', 26) = ' + gcd(A2, 26) + ' ≠ 1: different letters get the same cipher letter (red), so the message cannot be read back.');
        st.aria = 'Affine cipher wheel, x to ' + A2 + 'x + ' + B2 + ' mod 26';
      } else if (mode === 'squares') {
        var sq = {}; for (k = 0; k < n; k++) { var v = mulmod(k, k, n); sq[v] = (sq[v] || []).concat([k]); st.arrows.push({ p: k, q: v, col: 'var(--nt-p4)', w: 1.6 }); }
        var sqs = Object.keys(sq).map(Number).sort(function (p, r) { return p - r; });
        if (!q) { for (k = 0; k < n; k++) if (!sq[k]) st.dim[k] = 1; sqs.forEach(function (v) { st.hl[v] = 'var(--nt-p4)'; }); }
        var nz = sqs.filter(function (v) { return v; });
        st.say = q ? 'Each arrow goes from x to x² mod ' + n + '.' : 'The squares mod ' + n + ' are <b>' + setTxt(sqs) + '</b>. ' + (isPrime(n) && n > 2 ? 'x and −x always land together, so the ' + (n - 1) + ' nonzero residues give only ' + nz.length + ' = (' + n + ' − 1)/2 nonzero squares. The hollow points are the nonsquares.' : 'The hollow points are never squares mod ' + n + '.');
        st.aria = 'Squares mod ' + n;
      } else if (mode === 'wilson') {
        var us = units(), prod = 1, selfp = [];
        us.forEach(function (u) { var w = inv(u, n); prod = mulmod(prod, u, n); if (w === u) { selfp.push(u); if (!q) st.hl[u] = 'var(--nt-p5)'; } else if (u < w) st.arrows.push({ d: 'M' + pos(u, Wpx * 0.36 - 8).join(',') + 'L' + pos(w, Wpx * 0.36 - 8).join(','), col: pc(us.indexOf(u)), w: 2.2, op: 0.9 }); });
        for (k = 1; k < n; k++) if (gcd(k, n) > 1) st.dim[k] = 1;
        var fact = 1; for (k = 1; k < n; k++) fact = mulmod(fact, k, n);
        st.say = q ? 'Each chord joins a residue to its inverse.' : (isPrime(n) ? 'Each chord joins a pair whose product is 1 mod ' + n + '. Only ' + setTxt(selfp) + ' are their own inverses, so (' + n + ' − 1)! ≡ 1 · ' + (n - 1) + ' ≡ <b>−1</b> (mod ' + n + ').' : n + ' is not prime: the hollow points have no inverse, and (' + n + ' − 1)! ≡ ' + fact + ' (mod ' + n + '), not −1.');
        st.aria = 'Inverse pairs mod ' + n;
      }
      return st;
    }
    // controls
    var ctl = {};
    if (F.edit) {
      if (mode !== 'affine') ctl.n = numIn(F.ctl, 'n', n, 2, 60, function (v) { n = v; draw(); }, true);
      if (mode === 'add') { ctl.x = numIn(F.ctl, 'start', x, -999, 999, function (v) { x = v; draw(); }, true); ctl.a = numIn(F.ctl, 'add', a, -999, 999, function (v) { a = v; draw(); }, true); }
      if (mode === 'mult' || mode === 'inverse' || mode === 'solve' || mode === 'affine') ctl.a = numIn(F.ctl, 'a', a, -99, 99, function (v) { a = v; draw(); }, true);
      if (mode === 'solve' || mode === 'affine') ctl.b = numIn(F.ctl, 'b', b, -99, 99, function (v) { b = v; draw(); }, true);
      if (mode === 'affine') { ctl.x = numIn(F.ctl, 'letter', x, 0, 25, function (v) { x = v; draw(); }, true); }
    }
    // click a point to choose it (start in add mode, the letter in affine mode, a in mult and inverse modes)
    function pick(k) {
      if (!F.edit) return;
      if (mode === 'add' || mode === 'affine') { x = k; if (ctl.x) ctl.x.value = k; }
      else if (mode === 'mult' || mode === 'inverse' || mode === 'squares') { if (mode !== 'squares') { a = k; if (ctl.a) ctl.a.value = k; } }
      else if (mode === 'solve') { b = k; if (ctl.b) ctl.b.value = k; }
      draw();
    }
    s.addEventListener('click', function (e) {
      var r = s.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * Wpx - Wpx / 2, py = (e.clientY - r.top) / r.height * Wpx - Wpx / 2;
      var t = M.atan2(py, px) + M.PI / 2, k = mod(M.round(t / (2 * M.PI) * n), n), R = Wpx * 0.36;
      if (M.abs(M.hypot(px, py) - R) < M.max(22, R * 0.25)) pick(k);
    });
    s.addEventListener('keydown', function (e) {
      if (!F.edit) return;
      var dlt = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0; if (!dlt) return;
      e.preventDefault();
      if (mode === 'add' || mode === 'affine') pick(mod(x + dlt, n)); else if (mode === 'solve') pick(mod(b + dlt, n)); else pick(mod(a + dlt, n));
    });
    watch(pic, function (w) { Wpx = M.max(240, M.min(420, w - 18)); draw(); });
    return { update: function (q) { Object.assign(o, q); n = mode === 'affine' ? 26 : int(o.n, 2, 60, n); a = +o.a; b = +o.b; x = +o.x; draw(); } };
  });

  // ================================================================ nt-powers
  V.register('nt-powers', function (el, o) {
    o = Object.assign({ mode: 'cycle', n: 7, a: 3, e: 100, h: 5 }, o || {});
    var mode = /^(cycle|table|fast|exponent|criterion|dlog)$/.test(o.mode) ? o.mode : 'cycle';
    var F = frame(el, o, 'Powers mod ' + o.n);
    var n = int(o.n, 2, mode === 'table' ? 40 : mode === 'fast' || mode === 'exponent' ? 99999 : 97, 7), a = int(o.a, 0, 99999, 3), e = M.max(0, M.round(+o.e) || 0), h = int(o.h, 0, 99999, 5);
    var body = mk('div'), shown = 1; F.box.appendChild(body);
    function sp(x) { return '<span class="nt-chip' + (x.cls ? ' ' + x.cls : '') + '">' + x.t + '</span>'; }
    function render() {
      clear(body); F.done(false);
      var q = F.quiet, A = mod(a, n), k, i;
      if (mode === 'cycle') {
        var od = ord(A, n), L = od ? M.min(2 * od + 1, 40) : M.min(n + 2, 24), row = [], x = 1;
        for (k = 1; k <= L; k++) { x = mulmod(x, A, n); row.push({ t: A + sup(k) + ' <small>≡</small> ' + (q && k > 1 ? '?' : x), cls: (!q && x === 1 ? 'on' : '') + (od && k > od ? ' dim' : '') }); }
        body.innerHTML = '<div class="nt-chips" aria-label="Powers of ' + A + ' mod ' + n + '">' + row.map(sp).join('') + '</div>';
        if (n <= 40) body.appendChild(cycleClock(A, n, od, q));
        F.say(q ? 'The powers of ' + A + ' mod ' + n + ' repeat.' : (od ? 'The powers return to 1 at the ' + ord1(od) + ' power, so ord' + sub(n) + '(' + A + ') = <b>' + od + '</b>; after that they repeat with period ' + od + '. ' + (od === phi(n) ? 'Here the order equals φ(' + n + ') = ' + phi(n) + ': ' + A + ' is a <b>primitive root</b> mod ' + n + '.' : 'The order divides φ(' + n + ') = ' + phi(n) + ', but it need not equal it.') : 'gcd(' + A + ', ' + n + ') = ' + gcd(A, n) + ' > 1, so no power of ' + A + ' is ever 1 mod ' + n + ': ' + A + ' has no order.'));
        if (!q && od && od === phi(n)) F.done(true); // a task here asks for a primitive root
      } else if (mode === 'table') {
        var ph = phi(n), us = []; for (k = 1; k < n; k++) if (gcd(k, n) === 1) us.push(k);
        var head = [['a \\ k', 'l']].concat(Array.from({ length: ph }, function (_, j) { return String(j + 1); }));
        if (!q) head.push('order');
        var t = table(body, head, 'aᵏ mod ' + n + ' for each unit a (φ(' + n + ') = ' + ph + ')'), roots = [];
        us.forEach(function (u) {
          var cells = [[u + (ord(u, n) === ph && !q ? ' ★' : ''), 'l']], x = 1;
          for (var j = 1; j <= ph; j++) { x = mulmod(x, u, n); cells.push([String(x), x === 1 && !q ? 'one' : '']); }
          var oo = ord(u, n); if (oo === ph) roots.push(u); if (!q) cells.push([String(oo), '']);
          t.row(cells);
        });
        F.say(q ? 'Each row lists the powers of one unit.' : 'Every row reaches 1 in the column k = ' + ph + ', and the first 1 in each row (its order) is a divisor of φ(' + n + ') = ' + ph + '. ' + (roots.length ? 'Starred rows contain every unit: the primitive roots mod ' + n + ' are ' + roots.join(', ') + '.' : 'No row contains every unit, so there is no primitive root mod ' + n + '.'));
      } else if (mode === 'fast') {
        var bits = e.toString(2), sq = [], cur = A, prod = 1, rows = [];
        var t2 = table(body, ['i', '2<sup>i</sup>', 'bit', A + '<sup>2<sup>i</sup></sup> mod ' + n, 'product so far'], e + ' = ' + bits + ' in binary');
        for (i = 0; i < bits.length; i++) {
          var bit = bits[bits.length - 1 - i] === '1';
          if (i) cur = mulmod(cur, cur, n);
          if (bit) prod = mulmod(prod, cur, n);
          t2.row([String(i), grp(M.pow(2, i)), bit ? '1' : '0', String(cur), q ? (bit ? '×' : '') : (bit ? String(prod) : '·')], bit ? 'hi' : '');
        }
        F.say(q ? 'Square, reduce, and multiply in the rows whose bit is 1.' : A + sup(e) + ' ≡ <b>' + powmod(A, e, n) + '</b> (mod ' + n + '): ' + (bits.length - 1) + ' squarings and ' + (bits.split('1').length - 2) + ' multiplications, every number reduced mod ' + n + ' as soon as it appears.');
        if (!q) F.done(true);
      } else if (mode === 'exponent') {
        var od2 = ord(A, n), per = isPrime(n) ? n - 1 : phi(n);
        if (!od2) { F.say('gcd(' + A + ', ' + n + ') ≠ 1: the exponent cannot be reduced this way.'); return; }
        var row2 = [], x2 = 1; for (k = 1; k <= M.min(per, 30); k++) { x2 = mulmod(x2, A, n); row2.push({ t: A + sup(k) + ' <small>≡</small> ' + (q ? '?' : x2), cls: !q && k === (e % od2 || od2) ? 'hi' : (!q && x2 === 1 ? 'on' : '') }); }
        body.innerHTML = '<div class="nt-chips">' + row2.map(sp).join('') + '</div>';
        var r = e % per;
        F.say(q ? 'The powers of ' + A + ' repeat; use the period to shrink the exponent.' : (isPrime(n) ? 'Fermat: $' + A + '^{' + (n - 1) + '} \\equiv 1 \\pmod{' + n + '}$, so reduce the exponent mod $p - 1 = ' + per + '$: ' : 'Euler: $' + A + '^{\\varphi(' + n + ')} = ' + A + '^{' + per + '} \\equiv 1 \\pmod{' + n + '}$, so reduce the exponent mod $\\varphi(' + n + ') = ' + per + '$: ') + '$' + e + ' = ' + per + ' \\cdot ' + M.floor(e / per) + ' + ' + r + '$, so $' + A + '^{' + e + '} \\equiv ' + A + '^{' + r + '} \\equiv ' + powmod(A, e, n) + ' \\pmod{' + n + '}$.' + (od2 < per ? ' (The powers actually repeat every ' + od2 + ' steps, a divisor of ' + per + '.)' : ''));
        if (!q) F.done(true);
      } else if (mode === 'criterion') {
        if (!(isPrime(n) && n > 2)) { F.say(n + ' is not an odd prime. Euler\'s criterion is about an odd prime p.'); return; }
        var p = n, hlf = (p - 1) / 2, sqs = {};
        for (k = 1; k < p; k++) { var s2 = mulmod(k, k, p); (sqs[s2] = sqs[s2] || []).push(k); }
        var t3 = table(body, ['a', 'a<sup>' + hlf + '</sup> mod ' + p, 'x with x² ≡ a'], 'Euler\'s criterion mod ' + p);
        for (k = 1; k < p; k++) { var v = powmod(k, hlf, p); t3.row([String(k), q ? '?' : [v === 1 ? '1' : '−1', v === 1 ? 'one' : 'neg'], q ? '' : (sqs[k] ? sqs[k].join(', ') : '—')]); }
        F.say(q ? 'Compare each power with the squares.' : 'Every $a^{' + hlf + '}$ is $1$ or $-1$ ($-1$ is written for ' + (p - 1) + '). It is $1$ exactly in the rows where $a$ is a square, which is Euler\'s criterion: $\\left(\\frac{a}{' + p + '}\\right) \\equiv a^{(' + p + ' - 1)/2} \\pmod{' + p + '}$.');
      } else if (mode === 'dlog') {
        var p2 = n, H = mod(h, p2), pw = [], x3 = 1, found = -1;
        for (k = 0; k < shown && k < p2; k++) { if (k) x3 = mulmod(x3, A, p2); pw.push(x3); if (x3 === H && found < 0) { found = k; break; } }
        body.innerHTML = '<div class="nt-chips">' + pw.map(function (v, j) { return sp({ t: A + sup(j) + ' <small>≡</small> ' + v, cls: v === H && !q ? 'on' : '' }); }).join('') + '</div>';
        var od3 = ord(A, p2);
        if (found >= 0) { F.say(q ? 'Found it.' : A + sup(found) + ' ≡ ' + H + ' (mod ' + p2 + '), so the discrete logarithm is <b>' + found + '</b>' + (od3 ? ' (and also ' + found + ' + ' + od3 + 't for every integer t: logarithms live mod ' + od3 + ')' : '') + '. Checking an answer takes one power; finding it took ' + (found + 1) + ' tries.'); if (!q) F.done(true); }
        else if (pw.length >= p2 || (od3 && shown > od3)) F.say(q ? 'The powers have cycled.' : 'The powers of ' + A + ' cycled without reaching ' + H + ': no solution.');
        else F.say('Looking for k with ' + A + 'ᵏ ≡ ' + H + ' (mod ' + p2 + '). Press <b>Next power</b>.');
      }
    }
    function ord1(k) { return k + (k % 10 === 1 && k % 100 !== 11 ? 'st' : k % 10 === 2 && k % 100 !== 12 ? 'nd' : k % 10 === 3 && k % 100 !== 13 ? 'rd' : 'th'); }
    function cycleClock(A, n, od, q) {
      var wrap = mk('div', 'nt-pic'); wrap.style.maxWidth = '330px'; wrap.style.margin = '.6rem auto 0';
      var W = 300, R = 112, s = svg(wrap, 'The powers of ' + A + ' mod ' + n + ' on a clock'); s.setAttribute('viewBox', '-150 -150 300 300'); s.setAttribute('width', W); s.setAttribute('height', W);
      var mark = arrowDef(s, V.uid('ntp'));
      function P(k, r) { var t = 2 * M.PI * k / n - M.PI / 2; return [r * M.cos(t), r * M.sin(t)]; }
      S('circle', { cx: 0, cy: 0, r: R, style: 'fill:none;stroke:var(--mv-line);stroke-width:2' }, s);
      var x = 1, seen = {}, path = [1];
      for (var k = 1; k <= (od || n); k++) { x = mulmod(x, A, n); path.push(x); if (seen[x]) break; seen[x] = 1; }
      for (var i = 0; i + 1 < path.length; i++) {
        var p0 = P(path[i], R - 7), p1 = P(path[i + 1], R - 7), mx = (p0[0] + p1[0]) * 0.32, my = (p0[1] + p1[1]) * 0.32;
        S('path', { d: 'M' + p0 + 'Q' + mx + ',' + my + ' ' + p1, style: 'fill:none;stroke:' + pc(1) + ';stroke-width:2;stroke-opacity:.85', 'marker-end': mark }, s);
      }
      var fs = M.max(9, M.min(14, 230 / n + 4));
      for (k = 0; k < n; k++) {
        var p = P(k, R), on = path.indexOf(k) >= 0, u = gcd(k, n) === 1;
        S('circle', { cx: p[0], cy: p[1], r: k === 1 ? 6.5 : 4.5, style: 'fill:' + (k === 1 ? 'var(--nt-p0)' : on ? 'var(--nt-p1)' : 'var(--nt-bg)') + ';stroke:' + (on || k === 1 ? 'none' : u ? 'var(--mv-ink)' : 'var(--nt-dim)') + ';stroke-width:1.5' }, s);
        var lp = P(k, R + fs + 3); S('text', { x: lp[0], y: lp[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs, style: on ? 'font-weight:800' : '', class: on || k === 1 ? '' : 'nt-mut' }, s, String(k));
      }
      if (!q && od) S('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 18, style: 'font-weight:800;fill:var(--nt-hi)' }, s, 'order ' + od);
      return wrap;
    }
    if (F.edit) {
      if (mode !== 'criterion' && mode !== 'table') numIn(F.ctl, mode === 'dlog' ? 'g' : 'a', a, 0, 99999, function (v) { a = v; shown = 1; render(); }, true);
      numIn(F.ctl, mode === 'criterion' || mode === 'dlog' ? 'p' : 'n', n, 2, mode === 'table' ? 40 : mode === 'fast' || mode === 'exponent' ? 99999 : 97, function (v) { n = v; shown = 1; render(); }, true);
      if (mode === 'fast' || mode === 'exponent') numIn(F.ctl, 'exponent', e, 0, 1e9, function (v) { e = v; render(); });
      if (mode === 'dlog') { numIn(F.ctl, 'h', h, 0, 99999, function (v) { h = v; shown = 1; render(); }, true); btn(F.ctl, 'Next power', function () { shown++; render(); }, true); btn(F.ctl, 'All', function () { shown = n + 1; render(); }); }
    } else if (mode === 'dlog') shown = n + 1;
    render();
    return {};
  });

  // ================================================================ nt-crt
  V.register('nt-crt', function (el, o) {
    o = Object.assign({ m: 4, n: 5, target: [1, 3], fill: 'animate', upto: null }, o || {});
    var F = frame(el, o, 'The Chinese remainder grid');
    var m = int(o.m, 2, 12, 4), n = int(o.n, 2, 12, 5), tgt = Array.isArray(o.target) ? o.target.slice(0, 2) : null;
    var fill = /^(animate|all|none)$/.test(o.fill) ? o.fill : 'animate';
    if (!F.edit && fill !== 'none') fill = 'all';
    var wrap = mk('div', 'nt-crtwrap'), placed = 0, timer = 0, cells = [], sel = null; F.box.appendChild(wrap);
    function lcm() { return m * n / gcd(m, n); }
    function limit() { return o.upto ? M.min(int(o.upto, 1, m * n, m * n), m * n) : lcm(); }
    function build() {
      clear(wrap); cells = [];
      var lg = mk('p', 'nt-crtlg', 'Rows: <i>x</i> mod ' + m + ' &nbsp;·&nbsp; columns: <i>x</i> mod ' + n); wrap.appendChild(lg);
      var t = mk('table', 'nt-crt'), hr = mk('tr'); hr.appendChild(mk('th', '', ''));
      for (var j = 0; j < n; j++) hr.appendChild(mk('th', '', String(j)));
      t.appendChild(hr);
      for (var i = 0; i < m; i++) {
        var tr = mk('tr'); tr.appendChild(mk('th', '', String(i))); cells.push([]);
        for (j = 0; j < n; j++) {
          var td = mk('td'), b = mk('button', ''); b.type = 'button'; b.dataset.r = i; b.dataset.c = j; b.setAttribute('aria-label', 'remainder ' + i + ' mod ' + m + ', ' + j + ' mod ' + n);
          if (tgt && mod(tgt[0], m) === i && mod(tgt[1], n) === j) b.classList.add('t');
          b.addEventListener('click', cellClick); td.appendChild(b); tr.appendChild(td); cells[i].push(b);
        }
        t.appendChild(tr);
      }
      wrap.appendChild(t); placed = 0;
    }
    var learner = {};
    function place(show) {
      if (placed >= limit()) return false;
      var x = placed, b = cells[x % m][x % n];
      cells.forEach(function (r) { r.forEach(function (c) { c.classList.remove('last'); }); });
      b.classList.add('f', 'last'); if (!F.quiet || show) { b.textContent = String(x); learner[x] = 1; }
      b.setAttribute('aria-label', 'remainder ' + (x % m) + ' mod ' + m + ', ' + (x % n) + ' mod ' + n + (F.quiet && !show ? '' : ': ' + x));
      placed++; return true;
    }
    function sayState() {
      var L = lcm(), g = gcd(m, n), full = placed >= limit();
      if (F.quiet) { F.say(placed ? placed + ' number' + (placed === 1 ? '' : 's') + ' placed.' : 'Place 0, 1, 2, … one step down and one step right each time.'); return; }
      var t = '';
      if (tgt) {
        var tx = -1; for (var x = 0; x < L; x++) if (x % m === mod(tgt[0], m) && x % n === mod(tgt[1], n)) { tx = x; break; }
        t = tx >= 0 ? (tx < placed ? ' The marked cell holds <b>' + tx + '</b>: x ≡ ' + tx + ' (mod ' + L + ') solves x ≡ ' + mod(tgt[0], m) + ' (mod ' + m + ') and x ≡ ' + mod(tgt[1], n) + ' (mod ' + n + ').' : '') : (full ? ' The marked cell stays empty: x ≡ ' + mod(tgt[0], m) + ' (mod ' + m + ') and x ≡ ' + mod(tgt[1], n) + ' (mod ' + n + ') have <b>no common solution</b>.' : '');
        if (tx >= 0 && tx < placed) F.done(true);
      }
      if (!full) F.say((placed ? 'Placed 0 to ' + (placed - 1) + '.' : 'Each number goes one row down and one column right of the last, wrapping around.') + t);
      else if (g === 1) F.say('gcd(' + m + ', ' + n + ') = 1: the numbers 0 to ' + (m * n - 1) + ' fill all ' + m * n + ' cells, each exactly once. So every pair of remainders comes from exactly one x mod ' + m * n + '.' + t);
      else F.say('gcd(' + m + ', ' + n + ') = ' + g + ': the path is back at the start after lcm(' + m + ', ' + n + ') = ' + L + ' steps, so only ' + L + ' of the ' + m * n + ' cells are ever filled. The empty cells are pairs with no solution.' + t);
    }
    function cellClick(e) {
      var b = e.currentTarget, r = +b.dataset.r, c = +b.dataset.c, L = lcm(), x = -1;
      for (var k = 0; k < L; k++) if (k % m === r && k % n === c) { x = k; break; }
      if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel');
      if (F.quiet) { F.say('Cell: x ≡ ' + r + ' (mod ' + m + ') and x ≡ ' + c + ' (mod ' + n + ').'); return; }
      F.say('Row ' + r + ', column ' + c + ': x ≡ ' + r + ' (mod ' + m + ') and x ≡ ' + c + ' (mod ' + n + '). ' + (x >= 0 ? 'The smallest such x is <b>' + x + '</b>' + (gcd(m, n) === 1 ? '; all of them are ' + x + ' + ' + m * n + 't.' : '; all of them are ' + x + ' + ' + L + 't.') : 'No whole number has these two remainders (gcd(' + m + ', ' + n + ') = ' + gcd(m, n) + ' must divide ' + r + ' − ' + c + ').'));
    }
    function run() {
      clearInterval(timer);
      if (fill === 'all' || V.reduced) { while (place()); sayState(); return; }
      if (fill === 'none') { sayState(); return; }
      timer = setInterval(function () { if (!el.isConnected) { clearInterval(timer); return; } if (!place()) { clearInterval(timer); } sayState(); }, 380);
    }
    if (F.edit) {
      numIn(F.ctl, 'm', m, 2, 12, function (v) { m = v; restart(); }, true);
      numIn(F.ctl, 'n', n, 2, 12, function (v) { n = v; restart(); }, true);
      btn(F.ctl, 'Place next', function () { clearInterval(timer); place(true); sayState(); }, true);
      if (!F.quiet) btn(F.ctl, 'Fill all', function () { clearInterval(timer); while (place()); sayState(); });
      btn(F.ctl, 'Start over', function () { clearInterval(timer); build(); F.done(false); sayState(); });
    }
    function restart() { clearInterval(timer); F.done(false); build(); run(); }
    build(); run();
    return { destroy: function () { clearInterval(timer); } };
  });

  // ================================================================ nt-lattice
  V.register('nt-lattice', function (el, o) {
    o = Object.assign({ mode: 'line', a: 4, b: 6, c: 10, m: 2, n: 1, d: 2, count: 4 }, o || {});
    var mode = /^(line|circle|pell)$/.test(o.mode) ? o.mode : 'line';
    var F = frame(el, o, mode === 'line' ? 'Lattice points on a line' : mode === 'circle' ? 'Rational points on the unit circle' : 'Whole-number points on x² − dy² = 1');
    var pic = mk('div', 'nt-pic'); F.box.appendChild(pic);
    var s = svg(pic, ''), Wpx = 320, uid = V.uid('ntl'), extra = F.tail;
    var a = M.round(+o.a) || 4, b = M.round(+o.b) || 6, c = M.round(+o.c) || 0, t = 0, mm = int(o.m, 2, 12, 2), nn = int(o.n, 1, 11, 1), dd = int(o.d, 2, 99, 2), cnt = int(o.count, 2, 6, 4), shownP = cnt;
    if (nn >= mm) nn = mm - 1;
    function axes(X, Y, x0, x1, y0, y1, H, step) {
      var g = S('g', null, s), k;
      for (k = M.ceil(x0); k <= x1; k += step) S('path', { d: 'M' + X(k) + ' ' + Y(y0) + 'V' + Y(y1), style: 'stroke:var(--mv-line);stroke-width:' + (k === 0 ? 0 : 1) }, g);
      for (k = M.ceil(y0); k <= y1; k += step) S('path', { d: 'M' + X(x0) + ' ' + Y(k) + 'H' + X(x1), style: 'stroke:var(--mv-line);stroke-width:' + (k === 0 ? 0 : 1) }, g);
      if (x0 <= 0 && x1 >= 0) S('path', { d: 'M' + X(0) + ' ' + Y(y0) + 'V' + Y(y1), style: 'stroke:var(--mv-muted);stroke-width:1.4' }, g);
      if (y0 <= 0 && y1 >= 0) S('path', { d: 'M' + X(x0) + ' ' + Y(0) + 'H' + X(x1), style: 'stroke:var(--mv-muted);stroke-width:1.4' }, g);
    }
    function drawLine() {
      var g0 = gcd(a, b), ok = g0 && c % g0 === 0, x0 = 0, y0 = 0, sx = 0, sy = 0;
      if (ok && g0) {
        // a particular solution from the extended Euclidean algorithm, moved near the middle of the window
        var r0 = M.abs(a), r1 = M.abs(b), s0 = 1, s1 = 0, t0 = 0, t1 = 1;
        while (r1) { var q = M.floor(r0 / r1), tmp = r0 - q * r1; r0 = r1; r1 = tmp; tmp = s0 - q * s1; s0 = s1; s1 = tmp; tmp = t0 - q * t1; t0 = t1; t1 = tmp; }
        x0 = s0 * (a < 0 ? -1 : 1) * (c / g0); y0 = t0 * (b < 0 ? -1 : 1) * (c / g0); sx = b / g0; sy = -a / g0;
        var k0 = M.round(-(x0 * sx + y0 * sy) / (sx * sx + sy * sy)); x0 += k0 * sx; y0 += k0 * sy; // the solution nearest the origin
      }
      var win = Array.isArray(o.window) && o.window.length === 4 ? o.window : null;
      var span = win ? null : M.max(6, M.min(30, ok ? M.abs(sx) + M.abs(sy) + 3 : 8));
      var X0 = win ? win[0] : M.floor(x0 - span), X1 = win ? win[1] : M.ceil(x0 + span), Y0 = win ? win[2] : M.floor(y0 - span * 0.75), Y1 = win ? win[3] : M.ceil(y0 + span * 0.75);
      var H = M.round(M.min(380, M.max(240, Wpx * 0.72))), pad = 10, sc = M.min((Wpx - 2 * pad) / (X1 - X0), (H - 2 * pad) / (Y1 - Y0));
      var ox = (Wpx - sc * (X1 - X0)) / 2 - X0 * sc, oy = (H + sc * (Y1 - Y0)) / 2 + Y0 * sc;
      function X(v) { return ox + v * sc; } function Y(v) { return oy - v * sc; }
      s.setAttribute('viewBox', '0 0 ' + Wpx + ' ' + H); s.setAttribute('width', Wpx); s.setAttribute('height', H);
      var step = (X1 - X0) > 40 ? 5 : 1; axes(X, Y, X0, X1, Y0, Y1, H, step);
      if (sc * 1 >= 7) for (var i = M.ceil(X0); i <= X1; i++) for (var j = M.ceil(Y0); j <= Y1; j++) S('circle', { cx: X(i), cy: Y(j), r: 1.6, style: 'fill:var(--mv-muted);fill-opacity:.55' }, s);
      // the line ax + by = c, clipped to the window
      var pts = [];
      if (b) { pts.push([X0, (c - a * X0) / b], [X1, (c - a * X1) / b]); } else if (a) pts.push([c / a, Y0], [c / a, Y1]);
      if (pts.length) S('path', { d: 'M' + X(pts[0][0]) + ' ' + Y(pts[0][1]) + 'L' + X(pts[1][0]) + ' ' + Y(pts[1][1]), style: 'stroke:var(--nt-p1);stroke-width:2.2' }, s);
      var sol = [];
      if (ok && (sx || sy)) {
        for (var k = -80; k <= 80; k++) { var px = x0 + k * sx, py = y0 + k * sy; if (px >= X0 && px <= X1 && py >= Y0 && py <= Y1) sol.push([px, py, k]); }
        var mark = arrowDef(s, uid + 'a');
        var cur = [x0 + t * sx, y0 + t * sy];
        if (!F.quiet && sol.length > 1) { var nx = [cur[0] + sx, cur[1] + sy]; S('path', { d: 'M' + X(cur[0]) + ' ' + Y(cur[1]) + 'L' + X(nx[0]) + ' ' + Y(nx[1]), style: 'stroke:var(--nt-p5);stroke-width:2.6;fill:none', 'marker-end': mark }, s); }
        sol.forEach(function (p) { S('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5.5, style: 'fill:var(--nt-p0);stroke:var(--nt-bg);stroke-width:1.5' }, s); });
        if (cur[0] >= X0 && cur[0] <= X1 && cur[1] >= Y0 && cur[1] <= Y1) { S('circle', { cx: X(cur[0]), cy: Y(cur[1]), r: 8, style: 'fill:none;stroke:var(--nt-hi);stroke-width:3' }, s); if (!F.quiet) S('text', { x: X(cur[0]) + 10, y: Y(cur[1]) - 10, 'font-size': 13, style: 'font-weight:700' }, s, '(' + mi(cur[0]) + ', ' + mi(cur[1]) + ')'); }
      }
      s.setAttribute('aria-label', 'The line ' + a + 'x + ' + b + 'y = ' + c + ' with ' + (ok ? 'its lattice points' : 'no lattice points'));
      var eqn = mi(a) + 'x ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + 'y = ' + mi(c);
      if (F.quiet) F.say(ok ? 'Green dots: whole-number points on the line ' + eqn + '.' : 'The line ' + eqn + '.');
      else if (!ok) F.say('d = gcd(' + M.abs(a) + ', ' + M.abs(b) + ') = ' + g0 + ' does not divide ' + c + ', so the line ' + eqn + ' passes through <b>no</b> lattice point: the left side is always a multiple of ' + g0 + '.');
      else F.say('d = gcd(' + M.abs(a) + ', ' + M.abs(b) + ') = ' + g0 + ' divides ' + c + '. Solutions: <b>x = ' + mi(x0) + (sx < 0 ? ' − ' + (-sx) : ' + ' + sx) + 't, y = ' + mi(y0) + (sy < 0 ? ' − ' + (-sy) : ' + ' + sy) + 't</b>. Neighbors are ' + M.abs(sx) + ' apart across and ' + M.abs(sy) + ' apart up and down (b/d and a/d, not b and a). At t = ' + t + ': (' + mi(x0 + t * sx) + ', ' + mi(y0 + t * sy) + '), and ' + mi(a) + '·' + par(x0 + t * sx) + ' + ' + mi(b) + '·' + par(y0 + t * sy) + ' = ' + mi(c) + '.');
      if (ok && !F.quiet) F.done(true);
    }
    function drawCircle() {
      var H = M.round(M.min(330, M.max(230, Wpx * 0.6))), stack = Wpx < 470, cw = stack ? Wpx : Wpx * 0.5, chH = stack ? H : H;
      var tri = [mm * mm - nn * nn, 2 * mm * nn, mm * mm + nn * nn], g0 = gcd(gcd(tri[0], tri[1]), tri[2]);
      var totalH = stack ? chH * 2 + 10 : chH;
      s.setAttribute('viewBox', '0 0 ' + Wpx + ' ' + totalH); s.setAttribute('width', Wpx); s.setAttribute('height', totalH);
      // left (or top): the unit circle
      var R = M.min(cw, chH) * 0.38, cx = cw / 2, cy = chH / 2;
      function X(v) { return cx + v * R; } function Y(v) { return cy - v * R; }
      S('path', { d: 'M' + X(-1.25) + ' ' + Y(0) + 'H' + X(1.25) + 'M' + X(0) + ' ' + Y(-1.25) + 'V' + Y(1.25), style: 'stroke:var(--mv-muted);stroke-width:1.2' }, s);
      S('circle', { cx: cx, cy: cy, r: R, style: 'fill:none;stroke:var(--mv-ink);stroke-width:1.8' }, s);
      var sl = nn / mm, px = (mm * mm - nn * nn) / (mm * mm + nn * nn), py = 2 * mm * nn / (mm * mm + nn * nn);
      var xe = M.min(1.2, 1.22 / sl - 1);
      S('path', { d: 'M' + X(-1.2) + ' ' + Y(sl * (-0.2)) + 'L' + X(xe) + ' ' + Y(sl * (xe + 1)), style: 'stroke:var(--nt-p1);stroke-width:2' }, s);
      S('circle', { cx: X(-1), cy: Y(0), r: 5, style: 'fill:var(--mv-ink)' }, s);
      S('circle', { cx: X(px), cy: Y(py), r: 6, style: 'fill:var(--nt-p5)' }, s);
      S('text', { x: X(-1) - 4, y: Y(0) + 16, 'text-anchor': 'middle', 'font-size': 12 }, s, '(−1, 0)');
      if (!F.quiet) S('text', { x: X(px) + 8, y: Y(py) - 8, 'font-size': 12, style: 'font-weight:700' }, s, '(' + tri[0] + '/' + tri[2] + ', ' + tri[1] + '/' + tri[2] + ')');
      S('text', { x: X(-0.35), y: Y(sl * 0.65) + 18, 'text-anchor': 'middle', 'font-size': 12, style: 'fill:var(--nt-p1);font-weight:700' }, s, 'slope ' + nn + '/' + mm);
      // right (or bottom): the triangle
      var ox = stack ? 0 : cw, oy = stack ? chH + 10 : 0, A = tri[0], B = tri[1], C = tri[2], sc2 = M.min((cw - 70) / A, (chH - 60) / B);
      var tx = ox + 34, ty = oy + chH - 28;
      S('path', { d: 'M' + tx + ' ' + ty + 'h' + (A * sc2) + 'L' + tx + ' ' + (ty - B * sc2) + 'z', style: 'fill:var(--nt-p5);fill-opacity:.15;stroke:var(--nt-p5);stroke-width:2' }, s);
      S('path', { d: 'M' + (tx + 10) + ' ' + ty + 'v-10h-10', style: 'fill:none;stroke:var(--mv-ink);stroke-width:1.2' }, s);
      if (!F.quiet) {
        S('text', { x: tx + A * sc2 / 2, y: ty + 17, 'text-anchor': 'middle', 'font-size': 13, style: 'font-weight:700' }, s, String(A));
        S('text', { x: tx - 8, y: ty - B * sc2 / 2, 'text-anchor': 'end', 'font-size': 13, style: 'font-weight:700' }, s, String(B));
        S('text', { x: tx + A * sc2 / 2 + 8, y: ty - B * sc2 / 2 - 6, 'font-size': 13, style: 'font-weight:700;fill:var(--nt-p5)' }, s, String(C));
      }
      s.setAttribute('aria-label', 'Unit circle with the line of slope ' + nn + '/' + mm + ' through (−1, 0)' + (F.quiet ? '' : ', giving the triple ' + tri.join(', ')));
      if (F.quiet) { F.say('m = ' + mm + ', n = ' + nn + '.'); return; }
      var why = g0 === 1 ? 'm and n are coprime and of opposite parity, so the triple is <b>primitive</b>.' : (gcd(mm, nn) > 1 ? 'm and n share the factor ' + gcd(mm, nn) + ', so the triple is ' + g0 + ' × (' + tri.map(function (v) { return v / g0; }).join(', ') + '): <b>not primitive</b>.' : 'm and n are both odd, so every side is even: ' + g0 + ' × (' + tri.map(function (v) { return v / g0; }).join(', ') + '), <b>not primitive</b>.');
      F.say('Slope ' + nn + '/' + mm + ' meets the circle again at (' + tri[0] + '/' + tri[2] + ', ' + tri[1] + '/' + tri[2] + '). Clear denominators: (m² − n², 2mn, m² + n²) = <b>(' + tri.join(', ') + ')</b>, and ' + tri[0] + '² + ' + tri[1] + '² = ' + grp(tri[0] * tri[0] + tri[1] * tri[1]) + ' = ' + tri[2] + '². ' + why);
      if (g0 === 1) F.done(true);
    }
    function pellSol() { // fundamental solution from the continued fraction of √d (BigInt)
      var a0 = isqrt(dd), m = 0, c = 1, q = a0, p2 = 0n, p1 = 1n, q2 = 1n, q1 = 0n, D = BigInt(dd);
      for (var k = 0; k < 400; k++) { var p = BigInt(q) * p1 + p2, qq = BigInt(q) * q1 + q2; if (p * p - D * qq * qq === 1n) return [p, qq]; p2 = p1; p1 = p; q2 = q1; q1 = qq; m = c * q - m; c = (dd - m * m) / c; q = M.floor((a0 + m) / c); }
      return null;
    }
    function drawPell() {
      if (isqrt(dd) * isqrt(dd) === dd) dd++;
      var f = pellSol(), list = [[1n, 0n]], D = BigInt(dd);
      for (var k = 1; k <= cnt && f; k++) { var pv = list[k - 1]; list.push([pv[0] * f[0] + D * pv[1] * f[1], pv[0] * f[1] + pv[1] * f[0]]); }
      var upto = M.min(shownP, cnt), last = list[upto], xm = Number(last[0]) * 1.12, ym = Number(last[1]) * 1.25 + 1;
      var H = M.round(M.min(340, M.max(230, Wpx * 0.66))), L = 44, B = 26, w = Wpx - L - 12, hh = H - B - 12;
      s.setAttribute('viewBox', '0 0 ' + Wpx + ' ' + H); s.setAttribute('width', Wpx); s.setAttribute('height', H);
      function X(v) { return L + v / xm * w; } function Y(v) { return 12 + hh - v / ym * hh; }
      S('path', { d: 'M' + L + ' 12V' + (12 + hh) + 'H' + (L + w), style: 'fill:none;stroke:var(--mv-muted);stroke-width:1.2' }, s);
      S('text', { x: L + w, y: 12 + hh + 18, 'text-anchor': 'end', 'font-size': 12, class: 'nt-mut' }, s, 'x');
      S('text', { x: L - 8, y: 20, 'text-anchor': 'end', 'font-size': 12, class: 'nt-mut' }, s, 'y');
      var path = '', N = 160; for (var i = 0; i <= N; i++) { var yv = ym * i / N, xv = M.sqrt(1 + dd * yv * yv); if (xv > xm) break; path += (i ? 'L' : 'M') + X(xv).toFixed(1) + ' ' + Y(yv).toFixed(1); }
      S('path', { d: path, style: 'fill:none;stroke:var(--nt-p1);stroke-width:2.2' }, s);
      S('path', { d: 'M' + X(0) + ' ' + Y(0) + 'L' + X(xm) + ' ' + Y(xm / M.sqrt(dd)), style: 'stroke:var(--mv-muted);stroke-dasharray:5 4;stroke-width:1.2' }, s);
      S('text', { x: X(xm * 0.62), y: Y(xm * 0.62 / M.sqrt(dd)) - 10, 'text-anchor': 'end', 'font-size': 11, class: 'nt-mut' }, s, 'asymptote y = x/√' + dd);
      var lastLab = null;
      for (k = upto; k >= 0; k--) {
        var P = list[k], cx = X(Number(P[0])), cy = Y(Number(P[1]));
        S('circle', { cx: cx, cy: cy, r: k === upto ? 6.5 : 5, style: 'fill:' + (k === 0 ? 'var(--mv-muted)' : k === 1 ? 'var(--nt-p5)' : 'var(--nt-p0)') }, s);
        if (!F.quiet && (!lastLab || M.hypot(lastLab[0] - cx, lastLab[1] - cy) > 46)) { S('text', { x: k === upto && cx > Wpx * 0.7 ? cx - 10 : cx + 8, y: cy + (k === 0 ? -8 : 16), 'text-anchor': k === upto && cx > Wpx * 0.7 ? 'end' : 'start', 'font-size': 12, style: 'font-weight:700' }, s, '(' + grp(Number(P[0])) + ', ' + grp(Number(P[1])) + ')'); lastLab = [cx, cy]; }
      }
      s.setAttribute('aria-label', 'The hyperbola x² − ' + dd + 'y² = 1 with its whole-number points');
      clear(extra);
      if (!F.quiet && f) {
        var t = table(extra, ['k', 'xₖ', 'yₖ', 'xₖ² − ' + dd + 'yₖ²'], 'Each row is the last one times ' + f[0] + ' + ' + f[1] + '√' + dd);
        for (k = 0; k <= upto; k++) t.row([String(k), grp(Number(list[k][0])), grp(Number(list[k][1])), String(list[k][0] * list[k][0] - D * list[k][1] * list[k][1])], k === 1 ? 'hi' : '');
        F.say('(1, 0) is the trivial solution. The smallest solution with y > 0 is the fundamental one, <b>(' + f[0] + ', ' + f[1] + ')</b>. Multiplying by ' + f[0] + ' + ' + f[1] + '√' + dd + ' again and again gives every other solution: (x + y√' + dd + ')(' + f[0] + ' + ' + f[1] + '√' + dd + ') = (' + f[0] + 'x + ' + dd * Number(f[1]) + 'y) + (' + f[1] + 'x + ' + f[0] + 'y)√' + dd + '. The view zooms out at each step, because the points grow fast.');
        F.done(true);
      } else F.say('The whole-number points on x² − ' + dd + 'y² = 1 hug the asymptote and grow fast.');
    }
    function draw() { clear(s); if (mode === 'line') drawLine(); else if (mode === 'circle') drawCircle(); else drawPell(); }
    if (F.edit) {
      if (mode === 'line') {
        numIn(F.ctl, 'a', a, -40, 40, function (v) { a = v || 1; t = 0; draw(); }, true); numIn(F.ctl, 'b', b, -40, 40, function (v) { b = v || 1; t = 0; draw(); }, true); numIn(F.ctl, 'c', c, -200, 200, function (v) { c = v; t = 0; draw(); }, true);
        if (!F.quiet) { var sl = V.slider(F.ctl, { label: 't', min: -4, max: 4, step: 1, value: 0, input: function (v) { t = v; draw(); } }); sl.el.style.flexBasis = '100%'; }
      } else if (mode === 'circle') {
        var sm = V.slider(F.ctl, { label: 'm', min: 2, max: 9, step: 1, value: mm, input: function (v) { mm = v; if (nn >= mm) { nn = mm - 1; sn.set(nn); } draw(); } });
        var sn = V.slider(F.ctl, { label: 'n', min: 1, max: 8, step: 1, value: nn, input: function (v) { nn = M.min(v, mm - 1); sn.set(nn); draw(); } });
      } else {
        numIn(F.ctl, 'd', dd, 2, 99, function (v) { dd = v; shownP = 1; draw(); }, true);
        btn(F.ctl, 'Next point', function () { shownP = M.min(cnt, shownP + 1); draw(); }, true);
        btn(F.ctl, 'Start over', function () { shownP = 1; draw(); });
        shownP = 1;
      }
    }
    watch(pic, function (w) { Wpx = M.max(240, w - 18); draw(); });
    return {};
  });
})(window, document);
