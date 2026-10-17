/* Math Ladder visuals for Abstract Algebra (course key aa). Registered on window.MathLadder.viz; needs viz/core.js and
   uses the frame styles of viz/adv.css (Abstract Algebra pages load both). Styles for these visuals are injected below.
   Everything is computed exactly (small groups as multiplication tables, polynomials mod p).
   Conventions (as in the lessons): permutations compose right to left (στ = do τ first); Dₙ has 2n elements rᵏ and
   rᵏs with sr = r⁻¹s, vertices numbered 1 … n counterclockwise and s the mirror through vertex 1.

   Shared options (all seven visuals)
     task      an instruction line above the picture (HTML and $…$ allowed)
     label     the aria-label (a sensible one is built when it is missing)
     quiet     true (or readout: false): hide every value a problem could ask for (each visual says what quiet hides)

   Group names used by aa-cayley, aa-cosets and aa-lattice: "Z" (ℤₙ, with n), "U" (U(n), with n), "S3", "D" (Dₙ, with n),
   "D3" … "D8", "ZxZ" (ℤₘ × ℤₙ, with m and n), "Z2xZ2", "Z2xZ4", "V" (= Z2xZ2), "Q8", "A4". Elements are named as strings:
   numbers for ℤₙ and U(n); "e", "r", "r^2", "s", "rs", "r^2s" for Dₙ; "e", "(1 2)", "(1 2 3)" for S₃ and A₄;
   "1", "-1", "i", "-i", "j", "-j", "k", "-k" for Q₈; "(1,2)" for products.

   aa-cayley   The Cayley table of a small group (or the · table of the ring ℤₙ). Click or tap a cell (or move with the
               arrow keys and press Enter) to read a ∗ b as row a, column b. Cells are tinted by their element, so every
               row and column is a rearrangement of the elements (a Latin square).
     opts: group: "Z", n: 6, m           the group (see above); "Zmul": multiplication table of the ring ℤₙ (not a group);
                                          "quot" with n and d: the quotient ℤₙ/⟨d⟩, written with cosets k + ⟨d⟩
           mode: "product"               "product" | "inverse" (the identity's cells ringed: each row has exactly one)
                                          | "subgroup" (rows and columns of H lit) | "cosets" (rows and columns regrouped
                                          by the left cosets of H, so a normal subgroup shows a block pattern)
           modes: ["product", …]          the modes offered as buttons (default: product and inverse, plus subgroup and
                                          cosets when h is given)
           h: ["r"]                        generators of a subgroup H (element names; a number for ℤₙ)
           sel: ["r", "s"]                 a cell selected at the start
           colors: true                    tint cells by element
     quiet: hides the product readout and the verdicts (the table itself stays)

   aa-perm     A permutation of {1, …, n} as arrows from a top row to a bottom row, and as cycles.
     opts: p: [2, 3, 1, 5, 4] or "(1 2 3)(4 5)"   the permutation σ (one-line images, or cycles)
           n: 5                            size (default: the largest number used)
           mode: "arrows"                  "arrows" (σ and its cycles; Build the cycles steps through the tracing)
                                          | "compose" (τ then σ: three rows, the product στ number by number)
           q: [ … ] or "( … )"             compose mode: τ, applied first
           order: "st"                     compose mode: "st" for στ (τ first) or "ts" for τσ
     quiet: hides the cycle notation, order, sign, the cycle rings and the product's result row

   aa-dihedral A regular n-gon you can rotate (r) and flip (s). Moves act on the polygon where it is, so pressing r and
               then s gives sr; the readout keeps the element in the normal form rᵏ or rᵏs and as a permutation of the
               positions. A gold dot on the edge from 1 to 2 shows which way round the labels run.
     opts: n: 5                            3 … 10 sides
           word: "rs"                      start from this element
           mode: "play"                    "play" | "orbit" (pick a group element to see where vertex 1 or the edge 1–2
                                          goes; the orbit and stabilizer are counted)
           target: "vertex"                orbit mode: "vertex" or "edge"
     quiet: hides the normal form, the permutation, the move list and the orbit and stabilizer counts

   aa-cosets   A group cut into cosets of a subgroup H, one color per coset; tap an element to light its coset.
     opts: group: "Z", n: 12, h: 4         ℤₙ on a circle, H = ⟨h⟩; or group "S3", "D4", … with h: ["(1 2)"] (generators)
           side: "left"                    "left" | "right" | "both" (left and right cosets side by side, with the
                                          normal-subgroup verdict)
           quotient: false                 also show the table of the quotient group (when H is normal)
           sel: "2"                        an element whose coset is lit at the start
     quiet: hides the coset lists, the count, the verdict and the quotient table (the coloring stays)

   aa-lattice  The lattice of subgroups (a Hasse diagram, bigger subgroups higher). Tap a subgroup to light it, the ones
               that contain it and the ones inside it; small numbers on the edges are indices.
     opts: group: "Z", n: 12               ℤₙ (subgroups ⟨d⟩ for d | n); or a named group "S3", "D4", "Q8", "Z2xZ2", "Z2xZ4",
                                          "D5", "A4"; or "field" with a, b: the subfields of ℚ(√a, √b)
           ideals: false                   ℤₙ only: name them as ideals (d) of the ring ℤₙ
           sel: "4"                        a subgroup (by its generator d, for ℤₙ) selected at the start
     quiet: hides orders, indices and the readout (the diagram and its labels stay)

   aa-burnside Colorings of a necklace (n beads) or of the corners of a square, and the symmetries that fix them.
     opts: shape: "necklace", n: 6, k: 2   "necklace" (3 … 8 beads) or "square" (4 corners); k colors (2 … 4)
           group: "rotation"               "rotation" | "dihedral" (with flips)
           g: 1                            the symmetry shown first (index: rotations by 0 … n − 1, then the flips)
           mode: "fixed"                   "fixed" (one symmetry: its cycles and the colorings it fixes) | "table" (every
                                          symmetry, its cycles and fixed count, and the average)
     quiet: hides fixed counts, the fixed colorings, the table's numbers and the view switch (cycles stay)

   aa-gf       The finite field GF(pⁿ) = ℤₚ[x]/(f) through the powers of a generator g: a log table of g⁰, g¹, … as
               polynomials, the order of each element (primitive ones starred), and multiplication by adding exponents.
     opts: p: 2, f: [1, 1, 0, 1]           f as coefficients from the constant term up (monic, irreducible): x³ + x + 1
           g: [0, 1]                       the generator (default x)
           mode: "log"                     "log" | "mul" (pick a and b, see ab through exponents)
     quiet: hides the table, the product and the generator's order                                                  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/aa.js: load viz/core.js first'); return; }
  var M = Math, mk = V.el, NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- styles
  (function css() {
    if (D.getElementById('aa-viz-css')) return;
    var s = D.createElement('style'); s.id = 'aa-viz-css';
    s.textContent = [
      '.aa-v{--aa-0:#00703c;--aa-1:#1c6fd6;--aa-2:#d6336c;--aa-3:#a86f00;--aa-4:#7048e8;--aa-5:#e8590c;--aa-6:#0c8599;--aa-7:#c2255c;--aa-hi:#b8963e;--aa-dim:#b4beb8;--aa-bg:#fff}',
      'html[data-theme="dark"] .aa-v{--aa-0:#6cc79a;--aa-1:#74c0fc;--aa-2:#ff8787;--aa-3:#ffd479;--aa-4:#b197fc;--aa-5:#ffa94d;--aa-6:#66d9e8;--aa-7:#f783ac;--aa-hi:#e0c070;--aa-dim:#4a5e53;--aa-bg:#14211a}',
      '.aa-v .aa-svg{display:block;max-width:100%;height:auto;margin:0 auto;overflow:visible;touch-action:manipulation}',
      '.aa-v .aa-svg text{font-family:system-ui,-apple-system,sans-serif;fill:var(--mv-ink);font-variant-numeric:tabular-nums}',
      '.aa-v .aa-svg .aa-mut{fill:var(--mv-muted)}',
      '.aa-v .aa-tw:focus-visible{outline:3px solid #b8963e;outline-offset:3px}',
      '.aa-v .aa-pic{background:var(--mv-card);border:1px solid var(--mv-line);border-radius:10px;padding:.5rem;box-sizing:border-box;max-width:100%}',
      '.aa-v .aa-row{display:flex;flex-wrap:wrap;gap:.45rem .6rem;align-items:center;margin:.55rem 0 0}',
      '.aa-v .aa-row:empty{display:none}',
      '.aa-v .aa-lab{font-size:.85rem;color:var(--mv-muted)}',
      '.aa-v .aa-tw{max-width:100%;overflow-x:auto;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card)}',
      '.aa-v table.aa-ct{border-collapse:separate;border-spacing:2px;margin:0 auto;font:600 .88rem system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:4px}',
      '.aa-v table.aa-ct th,.aa-v table.aa-ct td{min-width:2.1rem;height:2.1rem;padding:0 .3rem;text-align:center;border-radius:6px;white-space:nowrap;box-sizing:border-box}',
      '.aa-v table.aa-ct th{color:var(--mv-muted);background:var(--mv-paper);font-weight:700}',
      '@media (max-width:480px){.aa-v table.aa-ct{font-size:.78rem;border-spacing:1px;padding:2px}.aa-v table.aa-ct th,.aa-v table.aa-ct td{min-width:1.75rem;height:1.85rem;padding:0 .18rem}}',
      '.aa-v table.aa-ct th.op{background:transparent;color:var(--mv-ink);font-family:Georgia,serif;font-style:italic}',
      '.aa-v table.aa-ct td{background:var(--c,transparent);color:var(--mv-ink);cursor:pointer;border:1px solid transparent}',
      '.aa-v table.aa-ct td.cur{outline:2px dashed var(--mv-ink);outline-offset:-2px}',
      '.aa-v table.aa-ct td.sel{border-color:var(--mv-ink);box-shadow:0 0 0 2px var(--aa-hi);font-weight:800}',
      '.aa-v table.aa-ct td.ln,.aa-v table.aa-ct th.ln{box-shadow:inset 0 0 0 2px var(--aa-hi)}',
      '.aa-v table.aa-ct td.idn{box-shadow:inset 0 0 0 2.5px var(--aa-0);font-weight:800}',
      '.aa-v table.aa-ct td.dim{opacity:.3}',
      '.aa-v table.aa-ct th.hs{background:rgba(184,150,62,.3);color:var(--mv-ink)}',
      '.aa-v table.aa-ct td.bl{margin-left:4px;box-shadow:-3px 0 0 var(--mv-card)}.aa-v table.aa-ct td.bt{box-shadow:0 -3px 0 var(--mv-card)}',
      '.aa-v .aa-chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.1rem 0 0}',
      '.aa-v .aa-chip{display:inline-flex;align-items:center;gap:.25rem;min-height:36px;min-width:36px;justify-content:center;padding:.2rem .6rem;border-radius:999px;border:1px solid var(--mv-line);background:var(--mv-card);font:600 .88rem system-ui,sans-serif;color:var(--mv-ink);cursor:pointer;box-sizing:border-box}',
      '.aa-v .aa-chip.on{border-color:var(--mv-ink);box-shadow:0 0 0 2px var(--aa-hi)}',
      '.aa-v .aa-chip:focus-visible{outline:3px solid #b8963e;outline-offset:2px}',
      '.aa-v .aa-fix{display:flex;flex-wrap:wrap;gap:.3rem;margin:.5rem 0 0}',
      '.aa-v .aa-fix span{display:inline-block;background:var(--mv-card);border:1px solid var(--mv-line);border-radius:8px}',
      '.aa-v .aa-cols{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}',
      '@media (max-width:560px){.aa-v .aa-cols{grid-template-columns:1fr}}',
      '.aa-v .aa-h{font:700 .85rem system-ui,sans-serif;color:var(--mv-muted);margin:0 0 .35rem}',
      '.aa-v .aa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(4.4rem,1fr));gap:.3rem}',
      '.aa-v .aa-el{min-height:38px;border-radius:8px;border:1px solid var(--mv-line);background:var(--c,var(--mv-card));font:600 .9rem system-ui,sans-serif;color:var(--mv-ink);cursor:pointer;padding:.2rem .3rem}',
      '.aa-v .aa-el.on{border-color:var(--mv-ink);box-shadow:0 0 0 2px var(--aa-hi)}',
      '.aa-v .aa-el.dim{opacity:.4}',
      '.aa-v .aa-el:focus-visible{outline:3px solid #b8963e;outline-offset:1px}',
      '.aa-v .aa-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}',
      '.aa-v .aa-note{font-size:.88rem;color:var(--mv-muted);margin:.1rem 0 .4rem;line-height:1.45}',
      '.aa-v .aa-ok{color:var(--aa-0);font-weight:700}.aa-v .aa-no{color:var(--aa-2);font-weight:700}',
      '.aa-v .aa-node{cursor:pointer;outline:none}',
      '.aa-v .aa-node:focus-visible rect,.aa-v .aa-node:focus-visible circle{stroke:#b8963e;stroke-width:3.5}',
      '.aa-v .aa-tbl{max-width:100%;overflow-x:auto;margin:.6rem 0 0;border:1px solid var(--mv-line);border-radius:10px;background:var(--mv-card)}',
      '.aa-v .aa-tbl table{border-collapse:collapse;width:100%;font-size:.86rem;font-variant-numeric:tabular-nums;margin:0}',
      '.aa-v .aa-tbl th,.aa-v .aa-tbl td{padding:.3rem .55rem;text-align:center;border-bottom:1px solid var(--mv-line);white-space:nowrap}',
      '.aa-v .aa-tbl th{color:var(--mv-muted);font-weight:600;background:var(--mv-paper)}',
      '@media (max-width:480px){.aa-v .aa-tbl table{font-size:.8rem}.aa-v .aa-tbl th,.aa-v .aa-tbl td{padding:.28rem .3rem}}',

      '.aa-v .aa-tbl tr:last-child td{border-bottom:0}',
      '.aa-v .aa-tbl tr.hi td{background:rgba(184,150,62,.2);font-weight:700}',
      '.aa-v .aa-tbl tbody tr{cursor:default}',
      '.aa-v select{min-height:36px;border-radius:8px;border:1px solid var(--mv-line);background:var(--mv-card);color:var(--mv-ink);font:600 .9rem system-ui,sans-serif;padding:.2rem .4rem;max-width:100%}',
      '@media (prefers-reduced-motion:reduce){.aa-v *{transition:none!important;animation:none!important}}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ---------------------------------------------------------------- small exact helpers
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function mod(a, n) { var r = a % n; return r < 0 ? r + n : r; }
  function range(n) { var r = []; for (var i = 0; i < n; i++) r.push(i); return r; }
  function int(v, lo, hi, def) { v = M.round(+v); if (!isFinite(v)) v = def; return M.max(lo, M.min(hi, v)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var SUPS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  var SUBS = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  function sup(n) { return String(n).split('').map(function (c) { return SUPS[c] || c; }).join(''); }
  function sub(n) { return String(n).split('').map(function (c) { return SUBS[c] || c; }).join(''); }
  function pc(i) { return 'var(--aa-' + (((i % 8) + 8) % 8) + ')'; }
  var HUES = [145, 212, 340, 40, 265, 22, 188, 315, 95, 0, 240, 60, 170, 290, 120, 200];
  function tint(i, a) { return 'hsla(' + HUES[i % HUES.length] + ',70%,' + (i >= HUES.length ? 40 : 50) + '%,' + (a || 0.22) + ')'; }

  // ---------------------------------------------------------------- DOM and SVG helpers
  function S(tag, attrs, parent, text) {
    var e = D.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function svg(parent, label, w, h) { var s = S('svg', { class: 'aa-svg', role: 'img', 'aria-label': label, viewBox: '0 0 ' + w + ' ' + h, width: w, height: h }); parent.appendChild(s); return s; }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function frame(el, o, label) {
    el.classList.add('mla', 'aa-v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false) };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'aa-row'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    if (F.quiet) F.out.el.hidden = true;
    F.say = function (h) { F.out.set(F.quiet ? '' : h); };
    return F;
  }
  function btn(parent, text, fn, pri) { return V.button(parent, text, fn, pri ? 'pri' : ''); }
  function arrowDef(s, id) {
    var defs = S('defs', null, s), m = S('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse', markerUnits: 'strokeWidth' }, defs);
    S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:context-stroke' }, m);
    return 'url(#' + id + ')';
  }
  function watch(box, fn) { var last = 0; function go() { var w = box.clientWidth; if (w && w !== last) { last = w; fn(w); } } if ('ResizeObserver' in W) new ResizeObserver(go).observe(box); else W.addEventListener('resize', go); go(); if (!last) fn(320); }
  function chipRow(parent, items, cur, onPick, label) {
    var w = mk('div', 'aa-chips'); w.setAttribute('role', 'group'); if (label) w.setAttribute('aria-label', label);
    items.forEach(function (t, i) { var b = mk('button', 'aa-chip' + (i === cur ? ' on' : ''), esc(t)); b.type = 'button'; b.setAttribute('aria-pressed', String(i === cur)); b.addEventListener('click', function () { w.querySelectorAll('.aa-chip').forEach(function (x, j) { x.classList.toggle('on', j === i); x.setAttribute('aria-pressed', String(j === i)); }); onPick(i); }); w.appendChild(b); });
    parent.appendChild(w); return w;
  }

  // ---------------------------------------------------------------- permutations (arrays of images, 0-based)
  function pcomp(s, t) { return t.map(function (x) { return s[x]; }); } // s∘t: t first
  function pcycles(s) { var seen = [], out = []; for (var i = 0; i < s.length; i++) { if (seen[i]) continue; var c = [], j = i; while (!seen[j]) { seen[j] = 1; c.push(j); j = s[j]; } if (c.length > 1) out.push(c); } return out; }
  function pord(s) { return pcycles(s).reduce(function (a, c) { return lcm(a, c.length); }, 1); }
  function psign(s) { return pcycles(s).reduce(function (g, c) { return g * (c.length % 2 ? 1 : -1); }, 1); }
  function ptext(s) { var c = pcycles(s); return c.length ? c.map(function (x) { return '(' + x.map(function (v) { return v + 1; }).join(' ') + ')'; }).join('') : 'e'; }
  function parsePerm(v, n) { // array of 1-based images, or a cycle string -> 0-based images
    if (Array.isArray(v)) { var a = v.map(function (x) { return int(x, 1, 30, 1) - 1; }); while (a.length < (n || 0)) a.push(a.length); return a; }
    var cyc = String(v || '').match(/\(([^)]*)\)/g) || [], mx = n || 0, cs = cyc.map(function (c) { return c.replace(/[()]/g, '').split(/[\s,]+/).filter(Boolean).map(Number); });
    cs.forEach(function (c) { c.forEach(function (x) { mx = M.max(mx, x); }); });
    var s = range(mx);
    for (var k = cs.length - 1; k >= 0; k--) { var c = cs[k], t = range(mx); for (var i = 0; i < c.length; i++) t[c[i] - 1] = c[(i + 1) % c.length] - 1; s = pcomp(t, s); }
    return s;
  }

  // ---------------------------------------------------------------- small groups: { n, lab[i], key[i], mul(i, j), e, name, op, find(name) }
  function dmul(n, a, b) { return a[1] ? [mod(a[0] - b[0], n), 1 - b[1]] : [mod(a[0] + b[0], n), b[1]]; }
  function dlab(a) { var k = a[0], f = a[1]; if (!k && !f) return 'e'; return (k ? 'r' + (k > 1 ? sup(k) : '') : '') + (f ? 's' : ''); }
  function dkey(a) { var k = a[0], f = a[1]; if (!k && !f) return 'e'; return (k ? 'r' + (k > 1 ? '^' + k : '') : '') + (f ? 's' : ''); }
  function units(n) { return range(n).filter(function (k) { return k > 0 && gcd(k, n) === 1; }); }
  function fromEls(els, mul, lab, key, name, opSym) {
    var idx = {}; els.forEach(function (x, i) { idx[key(x)] = i; });
    var n = els.length, tbl = range(n).map(function (i) { return range(n).map(function (j) { return idx[key(mul(els[i], els[j]))]; }); });
    var e = -1; for (var i = 0; i < n && e < 0; i++) if (range(n).every(function (j) { return tbl[i][j] === j && tbl[j][i] === j; })) e = i;
    var labs = els.map(lab);
    return { n: n, lab: labs, short: labs.map(function (t) { return /^\(/.test(t) && n <= 24 ? t.replace(/ /g, '') : t; }), key: els.map(key), mul: function (a, b) { return tbl[a][b]; }, e: e, name: name, op: opSym || '∗',
      find: function (s) { s = String(s).replace(/[−]/g, '-').replace(/\s+/g, ' ').trim(); var k = idx[s]; if (k === undefined) k = idx[s.replace(/ /g, '')]; if (k === undefined) for (var j = 0; j < n; j++) if (this.key[j].replace(/ /g, '') === s.replace(/ /g, '')) k = j; return k === undefined ? -1 : k; } };
  }
  function permGroup(n, evenOnly, name) {
    var els = []; (function rec(p, rest) { if (!rest.length) { els.push(p); return; } rest.forEach(function (x, i) { rec(p.concat([x]), rest.slice(0, i).concat(rest.slice(i + 1))); }); })([], range(n));
    if (evenOnly) els = els.filter(function (s) { return psign(s) === 1; });
    els.sort(function (a, b) { return pord(a) - pord(b) || (ptext(a) < ptext(b) ? -1 : 1); });
    return fromEls(els, pcomp, ptext, ptext, name);
  }
  var QN = ['1', '-1', 'i', '-i', 'j', '-j', 'k', '-k'];
  function qmul(a, b) { var sa = a[0] === '-' ? -1 : 1, sb = b[0] === '-' ? -1 : 1, x = a.replace('-', ''), y = b.replace('-', ''), s = sa * sb, r; if (x === '1') r = y; else if (y === '1') r = x; else if (x === y) { r = '1'; s = -s; } else { r = { ij: 'k', jk: 'i', ki: 'j', ji: 'k', kj: 'i', ik: 'j' }[x + y]; if (/^(ji|kj|ik)$/.test(x + y)) s = -s; } return (s < 0 ? '-' : '') + r; }
  function makeGroup(o) {
    var g = String(o.group || 'Z'), n = int(o.n, 2, 24, 6), m = int(o.m, 2, 12, 2), dm = /^D(\d+)$/.exec(g), zm = /^Z(\d+)xZ(\d+)$/.exec(g);
    if (g === 'V') zm = [0, 2, 2];
    if (g === 'Z') return fromEls(range(n), function (a, b) { return (a + b) % n; }, String, String, 'ℤ' + sub(n), '+');
    if (g === 'U') return fromEls(units(n), function (a, b) { return a * b % n; }, String, String, 'U(' + n + ')', '·');
    if (g === 'Zmul') { var Gm = fromEls(range(n), function (a, b) { return a * b % n; }, String, String, 'ℤ' + sub(n), '·'); Gm.ring = true; return Gm; }
    if (g === 'quot') { var d = int(o.d, 2, n, 2); if (n % d) d = gcd(n, d); return fromEls(range(d), function (a, b) { return (a + b) % d; }, function (k) { return k + '+⟨' + d + '⟩'; }, String, 'ℤ' + sub(n) + '/⟨' + d + '⟩', '+'); }
    if (g === 'S3') return permGroup(3, false, 'S₃');
    if (g === 'A4') return permGroup(4, true, 'A₄');
    if (g === 'Q8') return fromEls(QN, qmul, function (x) { return x.replace('-', '−'); }, String, 'Q₈');
    if (g === 'D' || dm) { var k = dm ? int(dm[1], 3, 10, 4) : int(o.n, 3, 10, 4), els = []; for (var f = 0; f < 2; f++) for (var j = 0; j < k; j++) els.push([j, f]); return fromEls(els, function (a, b) { return dmul(k, a, b); }, dlab, dkey, 'D' + sub(k)); }
    if (g === 'ZxZ' || zm) { var a = zm ? +zm[1] : m, b = zm ? +zm[2] : n, els2 = []; for (var x = 0; x < a; x++) for (var y = 0; y < b; y++) els2.push([x, y]); var kf = function (u) { return '(' + u[0] + ',' + u[1] + ')'; }; return fromEls(els2, function (u, v) { return [(u[0] + v[0]) % a, (u[1] + v[1]) % b]; }, kf, kf, 'ℤ' + sub(a) + ' × ℤ' + sub(b), '+'); }
    return makeGroup({ group: 'Z', n: 6 });
  }
  function span(G, gens) { var H = [G.e], fr = [G.e]; while (fr.length) { var nx = []; fr.forEach(function (h) { gens.forEach(function (g) { var x = G.mul(h, g); if (H.indexOf(x) < 0) { H.push(x); nx.push(x); } }); }); fr = nx; } return H.sort(function (a, b) { return a - b; }); }
  function inv(G, a) { for (var j = 0; j < G.n; j++) if (G.mul(a, j) === G.e) return j; return -1; }
  function parseH(G, h) { if (h === undefined || h === null) return null; var arr = Array.isArray(h) ? h : [h], gens = arr.map(function (x) { return G.find(x); }).filter(function (i) { return i >= 0; }); return gens.length ? span(G, gens) : null; }
  function cosets(G, H, right) { var seen = [], out = []; for (var g = 0; g < G.n; g++) { if (seen[g]) continue; var C = H.map(function (h) { return right ? G.mul(h, g) : G.mul(g, h); }); C.forEach(function (x) { seen[x] = 1; }); out.push({ rep: g, els: C.slice().sort(function (a, b) { return a - b; }) }); } return out; }
  function isNormal(G, H) { for (var g = 0; g < G.n; g++) { var gi = inv(G, g); for (var i = 0; i < H.length; i++) if (H.indexOf(G.mul(G.mul(g, H[i]), gi)) < 0) return false; } return true; }
  function setText(G, A) { return '{' + A.map(function (i) { return G.lab[i]; }).join(', ') + '}'; }

  // ================================================================ aa-cayley
  V.register('aa-cayley', function (el, o) {
    var G = makeGroup(o), F = frame(el, o, (G.ring ? 'Multiplication table of the ring ' : 'Cayley table of the group ') + G.name);
    var H = parseH(G, o.h), modes = Array.isArray(o.modes) ? o.modes : ['product', 'inverse'].concat(H ? ['subgroup', 'cosets'] : []);
    if (G.ring) modes = ['product'];
    var mode = modes.indexOf(o.mode) >= 0 ? o.mode : modes[0], colors = o.colors !== false, cur = [0, 0], sel = null;
    if (Array.isArray(o.sel) && o.sel.length === 2) { var a0 = G.find(o.sel[0]), b0 = G.find(o.sel[1]); if (a0 >= 0 && b0 >= 0) sel = [a0, b0]; }
    var wrap = mk('div', 'aa-tw'); wrap.tabIndex = 0; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', (G.ring ? 'Multiplication table of ' : 'Cayley table of ') + G.name + '. Arrow keys move, Enter reads a product.');
    F.box.appendChild(wrap);
    var seg = modes.length > 1 ? V.seg(F.ctl, { label: 'What to show', items: modes.map(function (m) { return [m, { product: 'Products', inverse: 'Identity and inverses', subgroup: 'Subgroup H', cosets: 'Cosets of H' }[m]]; }), value: mode, change: function (v) { mode = v; draw(); } }) : null;
    function order() { if (mode !== 'cosets' || !H) return range(G.n); var out = []; cosets(G, H).forEach(function (c) { out = out.concat(c.els); }); return out; }
    function draw() {
      clear(wrap); var ord = order(), t = mk('table', 'aa-ct'), tr = mk('tr'), th = mk('th', 'op', G.op); th.scope = 'col'; tr.appendChild(th);
      var blockOf = {}; if (mode === 'cosets' && H) cosets(G, H).forEach(function (c, ci) { c.els.forEach(function (x) { blockOf[x] = ci; }); });
      if (sel) cur = [ord.indexOf(sel[0]), ord.indexOf(sel[1])];
      ord.forEach(function (j) { var h = mk('th', '', esc(G.short[j])); h.scope = 'col'; if (H && mode === 'subgroup' && H.indexOf(j) >= 0) h.classList.add('hs'); if (sel && j === sel[1] && mode === 'product') h.classList.add('ln'); tr.appendChild(h); });
      var thead = mk('thead'); thead.appendChild(tr); t.appendChild(thead); var tb = mk('tbody');
      ord.forEach(function (i, ri) {
        var row = mk('tr'), rh = mk('th', '', esc(G.short[i])); rh.scope = 'row'; if (H && mode === 'subgroup' && H.indexOf(i) >= 0) rh.classList.add('hs'); if (sel && i === sel[0] && mode === 'product') rh.classList.add('ln'); row.appendChild(rh);
        ord.forEach(function (j, cj) {
          var v = G.mul(i, j), td = mk('td', '', esc(G.short[v])); td.dataset.r = ri; td.dataset.c = cj;
          if (colors) td.style.setProperty('--c', mode === 'cosets' && H ? tint(blockOf[v], 0.34) : tint(v));
          if (mode === 'inverse' && v === G.e) td.classList.add('idn');
          if (mode === 'subgroup' && H && !(H.indexOf(i) >= 0 && H.indexOf(j) >= 0)) td.classList.add('dim');
          if (mode === 'cosets' && H) { if (cj > 0 && blockOf[ord[cj - 1]] !== blockOf[j]) td.classList.add('bl'); if (ri > 0 && blockOf[ord[ri - 1]] !== blockOf[i]) td.classList.add('bt'); }
          if ((mode === 'product' || G.ring) && sel && (i === sel[0] || j === sel[1])) td.classList.add(i === sel[0] && j === sel[1] ? 'sel' : 'ln');
          if (ri === cur[0] && cj === cur[1] && D.activeElement === wrap) td.classList.add('cur');
          row.appendChild(td);
        });
        tb.appendChild(row);
      });
      t.appendChild(tb); wrap.appendChild(t); say();
    }
    function say() {
      if (G.ring) { if (sel) { var pr = G.mul(sel[0], sel[1]); F.say('<b>' + sel[0] + ' · ' + sel[1] + ' = ' + pr + '</b> in ℤ' + sub(G.n) + (pr === 0 && sel[0] && sel[1] ? ': two nonzero elements with product 0, so both are zero divisors.' : pr === 1 ? ': so ' + sel[0] + ' and ' + sel[1] + ' are inverse units.' : '.')); } else F.say('Tap a cell: row a, column b holds a · b. Zeros away from the first row and column mark zero divisors; a 1 marks a pair of inverse units.'); return; }
      if (mode === 'product') { if (sel) { var a = sel[0], b = sel[1], ab = G.mul(a, b), ba = G.mul(b, a); F.say('<b>' + esc(G.lab[a]) + ' ' + G.op + ' ' + esc(G.lab[b]) + ' = ' + esc(G.lab[ab]) + '</b> (row ' + esc(G.lab[a]) + ', column ' + esc(G.lab[b]) + ')' + (ab !== ba ? '. The other order gives ' + esc(G.lab[b]) + ' ' + G.op + ' ' + esc(G.lab[a]) + ' = ' + esc(G.lab[ba]) + ': these two do not commute.' : '.')); } else F.say('Tap a cell: its row names the left factor and its column the right one. Every row and every column lists each element exactly once.'); }
      else if (mode === 'inverse') { var pairs = []; range(G.n).forEach(function (a) { var b = inv(G, a); if (a <= b && a !== G.e) pairs.push(a === b ? esc(G.lab[a]) + ' is its own inverse' : esc(G.lab[a]) + ' and ' + esc(G.lab[b]) + ' are inverses'); }); F.say('The identity is <b>' + esc(G.lab[G.e]) + '</b>: its row and column copy the headings. Ringed cells hold the identity, exactly one in each row and column: ' + pairs.join('; ') + '.'); }
      else if (mode === 'subgroup' && H) F.say('H = ' + esc(setText(G, H)) + '. Its corner of the table (the lit rows and columns) uses only elements of H: H is closed, holds ' + esc(G.lab[G.e]) + ' and the inverse of each of its elements.');
      else if (mode === 'cosets' && H) { var cs = cosets(G, H), nor = isNormal(G, H); F.say('Rows and columns are grouped by the left cosets ' + cs.map(function (c) { return esc(setText(G, c.els)); }).join(', ') + ', and each cell is colored by the coset its entry lies in. ' + (nor ? '<span class="aa-ok">Each block holds a single coset, so cosets multiply as blocks: H is normal, and the blocks form the table of G/H.</span>' : '<span class="aa-no">Some blocks mix different cosets, so "coset times coset" is not well defined: H is not normal.</span>')); }
    }
    function pick(ri, ci) { var ord = order(); sel = [ord[ri], ord[ci]]; if (mode !== 'product' && !G.ring && seg) { mode = 'product'; seg.set('product'); } draw(); }
    wrap.addEventListener('click', function (e) { var td = e.target.closest ? e.target.closest('td') : null; if (!td || td.dataset.r === undefined) return; cur = [+td.dataset.r, +td.dataset.c]; pick(cur[0], cur[1]); });
    wrap.addEventListener('keydown', function (e) {
      var k = e.key, r = cur[0], c = cur[1];
      if (k === 'ArrowRight') c = M.min(G.n - 1, c + 1); else if (k === 'ArrowLeft') c = M.max(0, c - 1); else if (k === 'ArrowDown') r = M.min(G.n - 1, r + 1); else if (k === 'ArrowUp') r = M.max(0, r - 1);
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); pick(r, c); return; } else return;
      e.preventDefault(); cur = [r, c]; var s0 = sel; sel = null; draw(); sel = s0;
    });
    wrap.addEventListener('focus', function () { draw(); });
    draw();
    return {};
  });

  // ================================================================ aa-perm
  V.register('aa-perm', function (el, o) {
    var mode = o.mode === 'compose' ? 'compose' : 'arrows', n0 = int(o.n, 0, 9, 0), s = parsePerm(o.p || '(1 2 3)', n0), t = mode === 'compose' ? parsePerm(o.q || '(1 2)', n0) : null;
    var n = M.max(s.length, t ? t.length : 0, n0); while (s.length < n) s.push(s.length); if (t) while (t.length < n) t.push(t.length);
    var F = frame(el, o, mode === 'compose' ? 'Composing two permutations: the first one applied, then the second' : 'The permutation ' + ptext(s) + ' as arrows and as cycles');
    var pic = mk('div', 'aa-pic'); F.box.appendChild(pic);
    var ord = o.order === 'ts' ? 'ts' : 'st', step = 0, built = 0, uid = V.uid('aap');
    var cyc = pcycles(s), colorOf = range(n).map(function () { return -1; }); cyc.forEach(function (c, ci) { c.forEach(function (x) { colorOf[x] = ci; }); });
    function trace() { var out = []; cyc.forEach(function (c) { c.forEach(function (v) { out.push(v); }); }); return out; }
    function cycDone() { var k = 0, used = 0; for (var ci = 0; ci < cyc.length; ci++) { used += cyc[ci].length; if (used <= built) k++; } return k; }
    function partial() { var out = '', used = 0; cyc.forEach(function (c) { if (used >= built) return; var take = M.min(c.length, built - used); out += '(' + c.slice(0, take).map(function (v) { return v + 1; }).join(' ') + (take === c.length ? ')' : ' …'); used += c.length; }); return out || '…'; }
    function draw(w) {
      clear(pic); var W2 = M.min(560, M.max(260, (w || 340) - 20)), gap = (W2 - 56) / M.max(1, n - 1), x = function (i) { return 38 + i * gap; };
      if (mode === 'arrows') {
        var tr = trace(), showRings = cyc.length && !F.quiet, Ht = 130 + (showRings ? 125 : 0), sv = svg(pic, 'σ = ' + ptext(s) + ': an arrow from each number to its image', W2, Ht), mark = arrowDef(sv, uid);
        S('text', { x: 2, y: 26, class: 'aa-mut', 'font-size': 12 }, sv, 'i');
        S('text', { x: 2, y: 106, class: 'aa-mut', 'font-size': 12 }, sv, 'σ(i)');
        range(n).forEach(function (i) {
          var lit = built === 0 || tr.slice(0, built).indexOf(i) >= 0, col = colorOf[i] >= 0 ? pc(colorOf[i]) : 'var(--aa-dim)';
          S('line', { x1: x(i), y1: 33, x2: x(s[i]), y2: 89, stroke: col, 'stroke-width': lit ? 2.6 : 1.3, opacity: lit ? 1 : 0.3, 'marker-end': mark }, sv);
        });
        range(n).forEach(function (i) { [22, 102].forEach(function (y) { S('circle', { cx: x(i), cy: y, r: 11, fill: 'var(--aa-bg)', stroke: colorOf[i] >= 0 ? pc(colorOf[i]) : 'var(--aa-dim)', 'stroke-width': 2 }, sv); S('text', { x: x(i), y: y + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }, sv, String(i + 1)); }); });
        if (showRings) {
          var cw = W2 / cyc.length;
          cyc.forEach(function (c, ci) {
            if (built > 0 && ci >= cycDone()) return;
            var cx = cw * (ci + 0.5), cy = 192, L = c.length, R = M.min(44, cw / 2 - 16, 14 + 7 * L);
            if (L === 2) R = M.min(R, 26);
            c.forEach(function (v, k) { var a = -M.PI / 2 + 2 * M.PI * k / L, b = -M.PI / 2 + 2 * M.PI * (k + 1) / L, x1 = cx + R * M.cos(a), y1 = cy + R * M.sin(a), x2 = cx + R * M.cos(b), y2 = cy + R * M.sin(b), bend = L === 2 ? 0.5 : 0.25, mx = cx + (R * (1 + bend)) * M.cos((a + b) / 2), my = cy + (R * (1 + bend)) * M.sin((a + b) / 2); S('path', { d: 'M' + (x1 + (mx - x1) * 0.3) + ',' + (y1 + (my - y1) * 0.3) + ' Q' + mx + ',' + my + ' ' + (x2 + (mx - x2) * 0.3) + ',' + (y2 + (my - y2) * 0.3), fill: 'none', stroke: pc(ci), 'stroke-width': 2, 'marker-end': mark }, sv); });
            c.forEach(function (v, k) { var a = -M.PI / 2 + 2 * M.PI * k / L; S('circle', { cx: cx + R * M.cos(a), cy: cy + R * M.sin(a), r: 11, fill: 'var(--aa-bg)', stroke: pc(ci), 'stroke-width': 2 }, sv); S('text', { x: cx + R * M.cos(a), y: cy + R * M.sin(a) + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }, sv, String(v + 1)); });
          });
        }
        if (built === 0) F.say('σ = <b class="aa-mono">' + ptext(s) + '</b>. Order = lcm of the cycle lengths = <b>' + pord(s) + '</b>. ' + (psign(s) === 1 ? 'Even' : 'Odd') + ': it is a product of ' + cyc.reduce(function (a, c) { return a + c.length - 1; }, 0) + ' transpositions.');
        else { var last = tr[built - 1]; F.say('Following ' + (last + 1) + ' → ' + (s[last] + 1) + ': <b class="aa-mono">' + partial() + '</b>' + (built >= tr.length ? '. Done: every moved number has been used once.' : '')); }
      } else {
        var sv2 = svg(pic, 'Three rows: the first permutation sends the top row to the middle row, the second sends the middle row to the bottom row', W2, 204), mk2 = arrowDef(sv2, uid), A = ord === 'st' ? t : s, B = ord === 'st' ? s : t, P = pcomp(B, A);
        S('text', { x: 2, y: 66, class: 'aa-mut', 'font-size': 13, 'font-style': 'italic' }, sv2, ord === 'st' ? 'τ' : 'σ');
        S('text', { x: 2, y: 146, class: 'aa-mut', 'font-size': 13, 'font-style': 'italic' }, sv2, ord === 'st' ? 'σ' : 'τ');
        var src = step > 0 ? step - 1 : -1;
        range(n).forEach(function (i) { var on = src < 0 || src === i; S('line', { x1: x(i), y1: 34, x2: x(A[i]), y2: 89, stroke: 'var(--aa-1)', 'stroke-width': on ? 2.6 : 1.2, opacity: on ? 1 : 0.22, 'marker-end': mk2 }, sv2); });
        range(n).forEach(function (j) { var on = src < 0 || A[src] === j; if (F.quiet && src < 0) on = true; S('line', { x1: x(j), y1: 114, x2: x(B[j]), y2: 169, stroke: 'var(--aa-0)', 'stroke-width': on ? 2.6 : 1.2, opacity: on ? 1 : 0.22, 'marker-end': mk2 }, sv2); });
        range(n).forEach(function (i) { [[22, 0], [102, 1], [182, 2]].forEach(function (yy) { var hl = src >= 0 && ((yy[1] === 0 && i === src) || (yy[1] === 1 && i === A[src]) || (yy[1] === 2 && i === P[src])); S('circle', { cx: x(i), cy: yy[0], r: 11, fill: hl ? 'var(--aa-hi)' : 'var(--aa-bg)', stroke: 'var(--mv-muted)', 'stroke-width': 1.5 }, sv2); S('text', { x: x(i), y: yy[0] + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }, sv2, String(i + 1)); }); });
        var nm = ord === 'st' ? 'στ' : 'τσ', f1 = ord === 'st' ? 'τ' : 'σ', f2 = ord === 'st' ? 'σ' : 'τ';
        if (src >= 0) F.say(nm + '(' + (src + 1) + '): first ' + f1 + ' sends ' + (src + 1) + ' to ' + (A[src] + 1) + ', then ' + f2 + ' sends ' + (A[src] + 1) + ' to <b>' + (P[src] + 1) + '</b>. So far ' + nm + ' = (' + range(step).map(function (k) { return P[k] + 1; }).join(', ') + (step < n ? ', …' : '') + ')' + (step === n ? ' = <b class="aa-mono">' + ptext(P) + '</b>.' : '.'));
        else F.say('σ = <span class="aa-mono">' + ptext(s) + '</span>, τ = <span class="aa-mono">' + ptext(t) + '</span>. ' + nm + ' means: ' + f1 + ' first (blue arrows), then ' + f2 + ' (green). Result: <b class="aa-mono">' + ptext(P) + '</b>.');
      }
    }
    var curW = 340; watch(pic, function (w) { curW = w; draw(w); });
    if (mode === 'arrows') {
      if (!F.quiet && cyc.length) {
        btn(F.ctl, 'Build the cycles', function () { var L = trace().length; built = built >= L ? 1 : built + 1; draw(curW); }, true);
        btn(F.ctl, 'Show all', function () { built = 0; draw(curW); });
      }
    } else {
      btn(F.ctl, 'Next number', function () { step = step >= n ? 1 : step + 1; draw(curW); }, true);
      btn(F.ctl, 'Show all', function () { step = 0; draw(curW); });
      V.seg(F.ctl, { label: 'Order of composition', items: [['st', 'στ: τ first'], ['ts', 'τσ: σ first']], value: ord, change: function (v) { ord = v; step = 0; draw(curW); } });
    }
    return {};
  });

  // ================================================================ aa-dihedral
  V.register('aa-dihedral', function (el, o) {
    var n = int(o.n, 3, 10, 5), mode = o.mode === 'orbit' ? 'orbit' : 'play', target = o.target === 'edge' ? 'edge' : 'vertex';
    var F = frame(el, o, 'A regular ' + n + '-gon and its ' + 2 * n + ' symmetries: rotations r and flips s');
    var pic = mk('div', 'aa-pic'); F.box.appendChild(pic);
    var state = [0, 0], moves = [], anim = 0, curW = 340, chosen = null;
    if (o.word) String(o.word).replace(/[^rs]/g, '').split('').reverse().forEach(function (ch) { state = dmul(n, ch === 'r' ? [1, 0] : [0, 1], state); moves.push(ch); });
    function base(j) { var a = M.PI / 2 + 2 * M.PI * j / n; return [M.cos(a), M.sin(a)]; } // vertex 1 on top, counterclockwise
    function mat(e) { var th = 2 * M.PI * e[0] / n, c = M.cos(th), s2 = M.sin(th); return e[1] ? [[-c, -s2], [-s2, c]] : [[c, -s2], [s2, c]]; } // rotate after the flip x -> -x
    function mul2(A, B) { return [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]]; }
    function apply(Mx, p) { return [Mx[0][0] * p[0] + Mx[0][1] * p[1], Mx[1][0] * p[0] + Mx[1][1] * p[1]]; }
    function perm(e) { return range(n).map(function (j) { return mod((e[1] ? -j : j) + e[0], n); }); } // label j sits at position perm[j]
    function draw(w, Mx) {
      clear(pic); var W2 = M.min(360, M.max(230, (w || 340) - 20)), H2 = M.round(W2 * 0.94), cx = W2 / 2, cy = H2 / 2 + 2, R = M.min(W2, H2) * 0.34, sv = svg(pic, 'Regular ' + n + '-gon in position ' + dlab(state), W2, H2);
      var P = function (p) { return [cx + R * p[0], cy - 6 - R * p[1]]; };
      Mx = Mx || mat(state);
      S('line', { x1: cx, y1: cy - R - 26, x2: cx, y2: cy + R + 30, stroke: 'var(--mv-muted)', 'stroke-dasharray': '5 5', 'stroke-width': 1.2 }, sv);
      S('text', { x: cx + 18, y: cy + R + 26, class: 'aa-mut', 'font-size': 11 }, sv, 'mirror of s');
      range(n).forEach(function (j) { var p = P(base(j)), q = [cx + (p[0] - cx) * 1.32, cy + (p[1] - cy) * 1.32]; S('text', { x: q[0], y: q[1] + 4, 'text-anchor': 'middle', 'font-size': 10.5, class: 'aa-mut' }, sv, 'p' + (j + 1)); });
      var pts = range(n).map(function (j) { return P(apply(Mx, base(j))); });
      S('polygon', { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: 'rgba(0,112,60,.10)', stroke: 'var(--aa-0)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, sv);
      var m12 = [(pts[0][0] * 0.5 + pts[1][0] * 0.5), (pts[0][1] * 0.5 + pts[1][1] * 0.5)]; S('circle', { cx: m12[0], cy: m12[1], r: 5, fill: 'var(--aa-hi)' }, sv);
      if (mode === 'orbit' && !F.quiet) range(n).forEach(function (j) { var hit = orbitPos().indexOf(j) >= 0, p = P(base(j)); if (hit && target === 'vertex') S('circle', { cx: p[0], cy: p[1], r: 18, fill: 'none', stroke: 'var(--aa-2)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, sv); });
      pts.forEach(function (p, j) { S('circle', { cx: p[0], cy: p[1], r: 13, fill: j === 0 ? 'var(--aa-hi)' : 'var(--aa-bg)', stroke: 'var(--aa-0)', 'stroke-width': 2 }, sv); S('text', { x: p[0], y: p[1] + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }, sv, String(j + 1)); });
      sayIt();
    }
    function orbitPos() { var out = []; range(2 * n).forEach(function (i) { var p = perm([i % n, i >= n ? 1 : 0]); if (out.indexOf(p[0]) < 0) out.push(p[0]); }); return out; }
    function sayIt() {
      if (mode === 'orbit') {
        var stab = [], orb = {}; range(2 * n).forEach(function (i) { var e = [i % n, i >= n ? 1 : 0], p = perm(e); if (target === 'vertex') { orb[p[0]] = 1; if (p[0] === 0) stab.push(dlab(e)); } else { var key = [p[0], p[1]].sort().join(); orb[key] = 1; if (key === '0,1') stab.push(dlab(e)); } });
        var tg = target === 'vertex' ? 'vertex 1' : 'the edge 1–2', no = Object.keys(orb).length;
        F.say((chosen ? '<b>' + dlab(chosen) + '</b> moves ' + tg + ' to ' + (target === 'vertex' ? 'position p' + (perm(chosen)[0] + 1) : 'positions p' + (perm(chosen)[0] + 1) + '–p' + (perm(chosen)[1] + 1)) + '. ' : 'Tap a group element. ') + 'Orbit of ' + tg + ': <b>' + no + '</b> places. Stabilizer {' + stab.join(', ') + '}: <b>' + stab.length + '</b> elements. ' + no + ' × ' + stab.length + ' = ' + 2 * n + ' = |D' + sub(n) + '|.');
        return;
      }
      var p = perm(state), pc2 = pcycles(p);
      F.say('Position <b>' + dlab(state) + '</b>' + (moves.length > 8 ? ', after ' + moves.length + ' moves' : moves.length ? ', reached by ' + moves.join(' then ') + '; as a product, newest move on the left: ' + moves.slice().reverse().join('') + ' = ' + dlab(state) : '') + '. Label i sits at position p<sub>σ(i)</sub> with σ = <span class="aa-mono">' + (pc2.length ? pc2.map(function (c) { return '(' + c.map(function (v) { return v + 1; }).join(' ') + ')'; }).join('') : 'e') + '</span>.');
    }
    function go(g, label) {
      if (anim) return; var from = state, to = dmul(n, g, state), Mf = mat(from), steps = V.reduced ? 1 : 24, k = 0;
      moves.push(label);
      function stepF() {
        k++; var t2 = k / steps, e = t2 < 0.5 ? 2 * t2 * t2 : 1 - M.pow(-2 * t2 + 2, 2) / 2, A;
        if (g[1]) A = [[1 - 2 * e, 0], [0, 1]]; else { var th = e * 2 * M.PI / n; A = [[M.cos(th), -M.sin(th)], [M.sin(th), M.cos(th)]]; }
        if (k >= steps) { anim = 0; state = to; draw(curW); return; }
        draw(curW, mul2(A, Mf)); anim = W.requestAnimationFrame(stepF);
      }
      anim = W.requestAnimationFrame(stepF);
    }
    watch(pic, function (w) { curW = w; draw(w); });
    if (mode === 'play') {
      btn(F.ctl, 'r: rotate ' + (M.round(3600 / n) / 10) + '°', function () { go([1, 0], 'r'); }, true);
      btn(F.ctl, 's: flip', function () { go([0, 1], 's'); }, true);
      btn(F.ctl, 'Start over', function () { state = [0, 0]; moves = []; draw(curW); });
    } else {
      var els = range(2 * n).map(function (i) { return [i % n, i >= n ? 1 : 0]; });
      chipRow(F.ctl, els.map(dlab), -1, function (i) { chosen = els[i]; state = els[i]; draw(curW); }, 'Group elements');
    }
    return {};
  });

  // ================================================================ aa-cosets
  V.register('aa-cosets', function (el, o) {
    var isZ = (o.group || 'Z') === 'Z', G = makeGroup(o), F = frame(el, o, 'The cosets of a subgroup of ' + G.name + ', one color each');
    var H = isZ ? span(G, [mod(int(o.h, 0, 99, 2), G.n)]) : (parseH(G, o.h) || [G.e]);
    var side = isZ ? 'left' : (o.side === 'right' || o.side === 'both' ? o.side : 'left'), sel = o.sel !== undefined ? G.find(o.sel) : -1, curW = 340;
    var L = cosets(G, H), Rc = cosets(G, H, true), nor = isNormal(G, H);
    function cosetOf(list, x) { for (var i = 0; i < list.length; i++) if (list[i].els.indexOf(x) >= 0) return i; return -1; }
    function nm(c) { return isZ ? c.rep + ' + H' : G.lab[c.rep] + 'H'; }
    var pic = mk('div', ''); F.box.appendChild(pic);
    function chipsFor(parent, list, title, right) {
      var w = mk('div', 'aa-pic'), h = mk('p', 'aa-h', title); w.appendChild(h); var g = mk('div', 'aa-grid'); w.appendChild(g);
      range(G.n).forEach(function (x) { var ci = cosetOf(list, x), b = mk('button', 'aa-el', esc(G.lab[x])); b.type = 'button'; b.style.setProperty('--c', tint(ci, 0.3)); if (sel >= 0) b.classList.add(list[ci].els.indexOf(sel) >= 0 ? 'on' : 'dim'); b.setAttribute('aria-label', G.lab[x] + (F.quiet ? '' : ', in ' + (right ? 'H' + G.lab[list[ci].rep] : G.lab[list[ci].rep] + 'H'))); b.addEventListener('click', function () { sel = x; draw(curW); }); g.appendChild(b); });
      parent.appendChild(w);
    }
    function draw(w) {
      clear(pic);
      if (isZ) {
        var W2 = M.min(340, M.max(230, (w || 340) - 20)), cx = W2 / 2, cy = W2 / 2, R = W2 * 0.38, wrapP = mk('div', 'aa-pic'); pic.appendChild(wrapP);
        var sv = svg(wrapP, G.name + ' on a circle, colored by the cosets of ' + '⟨' + (H[1] !== undefined ? H[1] : 0) + '⟩', W2, W2), rr = M.max(11, M.min(16, 110 / G.n + 7));
        S('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: 'var(--mv-line)', 'stroke-width': 2 }, sv);
        range(G.n).forEach(function (x) {
          var a = -M.PI / 2 + 2 * M.PI * x / G.n, px = cx + R * M.cos(a), py = cy + R * M.sin(a), ci = cosetOf(L, x), on = sel < 0 || L[ci].els.indexOf(sel) >= 0;
          var g = S('g', { class: 'aa-node', tabindex: 0, role: 'button', 'aria-label': String(x) }, sv);
          S('circle', { cx: px, cy: py, r: rr, fill: tint(ci, 0.55), stroke: on && sel >= 0 ? 'var(--mv-ink)' : 'var(--mv-line)', 'stroke-width': on && sel >= 0 ? 2.5 : 1, opacity: on ? 1 : 0.35 }, g);
          S('text', { x: px, y: py + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }, g, String(x));
          function choose() { sel = x; draw(curW); }
          g.addEventListener('click', choose); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
        });
        if (sel >= 0 && !F.quiet) S('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, sv, sel + ' + H');
      } else {
        var cols = mk('div', side === 'both' ? 'aa-cols' : ''); pic.appendChild(cols);
        if (side !== 'right') chipsFor(cols, L, 'Left cosets gH', false);
        if (side !== 'left') chipsFor(cols, Rc, 'Right cosets Hg', true);
      }
      if (o.quotient && nor && !F.quiet) {
        var tw = mk('div', 'aa-tbl'), t = mk('table'), hd = mk('tr'); hd.appendChild(mk('th', '', isZ ? '+' : '·'));
        L.forEach(function (c) { hd.appendChild(mk('th', '', esc(nm(c)))); }); var th = mk('thead'); th.appendChild(hd); t.appendChild(th); var tb = mk('tbody');
        L.forEach(function (a) { var r = mk('tr'); r.appendChild(mk('th', '', esc(nm(a)))); L.forEach(function (b) { var ci3 = cosetOf(L, G.mul(a.rep, b.rep)); var td = mk('td', '', esc(nm(L[ci3]))); td.style.background = tint(ci3, 0.3); r.appendChild(td); }); tb.appendChild(r); });
        t.appendChild(tb); tw.appendChild(t); pic.appendChild(tw);
      }
      var msg = 'H = ' + esc(setText(G, H)) + ': ' + L.length + ' cosets of ' + H.length + ' elements each (' + G.n + ' = ' + L.length + ' × ' + H.length + ').';
      if (sel >= 0) { var li = cosetOf(L, sel), ri = cosetOf(Rc, sel); msg = '<b>' + (isZ ? sel + ' + H' : esc(G.lab[sel]) + 'H') + ' = ' + esc(setText(G, L[li].els)) + '</b>' + (isZ ? '' : ', while H' + esc(G.lab[sel]) + ' = ' + esc(setText(G, Rc[ri].els))) + '. ' + msg; }
      if (!isZ) msg += ' ' + (nor ? '<span class="aa-ok">Every left coset is also a right coset: H is normal.</span>' : '<span class="aa-no">Some left coset is not a right coset: H is not normal.</span>');
      F.say(msg);
    }
    watch(pic, function (w) { curW = w; draw(w); });
    if (!isZ) V.seg(F.ctl, { label: 'Which cosets', items: [['left', 'Left'], ['right', 'Right'], ['both', 'Both']], value: side, change: function (v) { side = v; draw(curW); } });
    return {};
  });

  // ================================================================ aa-lattice
  function allSubs(G) { var subs = {}, list = []; function add(H) { var k = H.join(','); if (!subs[k]) { subs[k] = 1; list.push(H); return true; } return false; } for (var i = 0; i < G.n; i++) add(span(G, [i])); var grew = true; while (grew) { grew = false; var Ls = list.slice(); for (var a = 0; a < Ls.length; a++) for (var b = a + 1; b < Ls.length; b++) if (add(span(G, Ls[a].concat(Ls[b])))) grew = true; } return list.sort(function (x, y) { return x.length - y.length; }); }
  function genName(G, H) { // the shortest description: {e}, the whole group, ⟨g⟩ or ⟨g, h⟩
    if (H.length === 1) return '{' + G.lab[G.e] + '}'; if (H.length === G.n) return G.name;
    for (var i = 0; i < H.length; i++) if (span(G, [H[i]]).length === H.length) return '⟨' + G.lab[H[i]] + '⟩';
    for (i = 0; i < H.length; i++) for (var j = i + 1; j < H.length; j++) if (span(G, [H[i], H[j]]).length === H.length) return '⟨' + G.lab[H[i]] + ', ' + G.lab[H[j]] + '⟩';
    return setText(G, H);
  }
  V.register('aa-lattice', function (el, o) {
    var g = String(o.group || 'Z'), nodes = [], edges = [], title;
    if (g === 'field') {
      var a = int(o.a, 2, 99, 2), b = int(o.b, 2, 99, 3), ab = a * b; title = 'ℚ(√' + a + ', √' + b + ')';
      nodes = [{ id: 0, name: 'ℚ', lvl: 0, size: 1 }, { id: 1, name: 'ℚ(√' + a + ')', lvl: 1, size: 2 }, { id: 2, name: 'ℚ(√' + b + ')', lvl: 1, size: 2 }, { id: 3, name: 'ℚ(√' + ab + ')', lvl: 1, size: 2 }, { id: 4, name: title, lvl: 2, size: 4 }];
      edges = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4]];
    } else if (g === 'Z') {
      var n = int(o.n, 2, 120, 12), ds = range(n + 1).filter(function (d) { return d > 0 && n % d === 0; });
      var omega = function (x) { var c = 0, y = x; for (var p = 2; p <= y; p++) while (y % p === 0) { y /= p; c++; } return c; };
      ds.forEach(function (d, i) { nodes.push({ id: i, d: d, name: o.ideals ? '(' + (d === n ? 0 : d) + ')' : (d === n ? '{0}' : d === 1 ? 'ℤ' + sub(n) : '⟨' + d + '⟩'), lvl: omega(n / d), size: n / d }); });
      nodes.forEach(function (x) { nodes.forEach(function (y) { if (x.d % y.d === 0 && x.d !== y.d && omega(x.d / y.d) === 1) edges.push([x.id, y.id]); }); });
      title = o.ideals ? 'the ring ℤ' + sub(n) : 'ℤ' + sub(n);
    } else {
      var G = makeGroup({ group: g }), subs = allSubs(G); title = G.name;
      var sizes = []; subs.forEach(function (H) { if (sizes.indexOf(H.length) < 0) sizes.push(H.length); }); sizes.sort(function (x, y) { return x - y; });
      subs.forEach(function (H, i) { nodes.push({ id: i, H: H, name: genName(G, H), lvl: sizes.indexOf(H.length), size: H.length, els: setText(G, H) }); });
      var inside = function (A, B) { return A.every(function (e) { return B.indexOf(e) >= 0; }); };
      nodes.forEach(function (x) { nodes.forEach(function (y) { if (y.size > x.size && inside(x.H, y.H) && !nodes.some(function (z) { return z.size > x.size && z.size < y.size && inside(x.H, z.H) && inside(z.H, y.H); })) edges.push([x.id, y.id]); }); });
    }
    var F = frame(el, o, (g === 'field' ? 'The subfields of ' : o.ideals ? 'The ideals of ' : 'The subgroup lattice of ') + title), pic = mk('div', 'aa-pic'); F.box.appendChild(pic);
    var sel = -1, curW = 340;
    if (o.sel !== undefined) nodes.forEach(function (x) { if (String(x.d) === String(o.sel) || x.name === String(o.sel)) sel = x.id; });
    function reach(i, up) { var out = [i], fr = [i]; while (fr.length) { var nx = []; fr.forEach(function (x) { edges.forEach(function (e) { var from = up ? e[0] : e[1], to = up ? e[1] : e[0]; if (from === x && out.indexOf(to) < 0) { out.push(to); nx.push(to); } }); }); fr = nx; } return out; }
    function draw(w) {
      clear(pic); var lvls = M.max.apply(null, nodes.map(function (x) { return x.lvl; })) + 1, W2 = M.min(640, M.max(260, (w || 340) - 20)), rowH = 72, H2 = (lvls - 1) * rowH + 52, sv = svg(pic, 'Hasse diagram of ' + title + ': bigger ones higher', W2, H2);
      var pos = {}, byL = []; for (var L = 0; L < lvls; L++) byL[L] = nodes.filter(function (x) { return x.lvl === L; });
      var rel = function (x) { var i2 = byL[x.lvl].indexOf(x); return byL[x.lvl].length > 1 ? i2 / (byL[x.lvl].length - 1) : 0.5; };
      var bary = function (x, upward) { var ns = edges.filter(function (e) { return upward ? e[0] === x.id : e[1] === x.id; }).map(function (e) { return rel(nodes[upward ? e[1] : e[0]]); }); return ns.length ? ns.reduce(function (u, v) { return u + v; }, 0) / ns.length : 0.5; };
      for (var pass = 0; pass < 3; pass++) { for (L = lvls - 2; L >= 1; L--) { var bu = byL[L].map(function (x) { return [x, bary(x, true)]; }); bu.sort(function (u, v) { return u[1] - v[1]; }); byL[L] = bu.map(function (u) { return u[0]; }); } for (L = 1; L < lvls - 1; L++) { var bd = byL[L].map(function (x) { return [x, (bary(x, false) + bary(x, true)) / 2]; }); bd.sort(function (u, v) { return u[1] - v[1]; }); byL[L] = bd.map(function (u) { return u[0]; }); } }
      byL.forEach(function (at, L2) { at.forEach(function (x, k) { pos[x.id] = [W2 * (k + 1) / (at.length + 1), H2 - 26 - L2 * rowH]; }); });
      var up = sel >= 0 ? reach(sel, true) : [], down = sel >= 0 ? reach(sel, false) : [];
      edges.forEach(function (e) { var p = pos[e[0]], q = pos[e[1]], on = sel >= 0 && ((up.indexOf(e[0]) >= 0 && up.indexOf(e[1]) >= 0) || (down.indexOf(e[0]) >= 0 && down.indexOf(e[1]) >= 0)); S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: on ? 'var(--aa-hi)' : 'var(--mv-muted)', 'stroke-width': on ? 3 : 1.5, opacity: sel >= 0 && !on ? 0.4 : 1 }, sv); });
      if (!F.quiet && g !== 'field') edges.forEach(function (e) { var p = pos[e[0]], q = pos[e[1]], ix = nodes[e[1]].size / nodes[e[0]].size, lx = p[0] + (q[0] - p[0]) * 0.36, ly = p[1] + (q[1] - p[1]) * 0.36; S('rect', { x: lx - 6, y: ly - 7, width: 12, height: 13, rx: 4, fill: 'var(--mv-card)' }, sv); S('text', { x: lx, y: ly + 3.5, 'text-anchor': 'middle', 'font-size': 10, class: 'aa-mut' }, sv, String(ix)); });
      nodes.forEach(function (x) {
        var p = pos[x.id], lab = x.name, wbox = M.max(36, lab.length * 7.2 + 14), on = x.id === sel, rel = sel >= 0 && (up.indexOf(x.id) >= 0 || down.indexOf(x.id) >= 0);
        var gN = S('g', { class: 'aa-node', tabindex: 0, role: 'button', 'aria-label': lab + (F.quiet ? '' : ', order ' + x.size), 'aria-pressed': String(on) }, sv);
        S('rect', { x: p[0] - wbox / 2, y: p[1] - 14, width: wbox, height: 28, rx: 9, fill: on ? 'var(--aa-hi)' : rel ? 'rgba(184,150,62,.25)' : 'var(--aa-bg)', stroke: 'var(--aa-0)', 'stroke-width': on ? 2.5 : 1.5 }, gN);
        S('text', { x: p[0], y: p[1] + 4.5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700 }, gN, lab);
        function choose() { sel = sel === x.id ? -1 : x.id; draw(curW); var f = pic.querySelectorAll('.aa-node')[x.id]; if (f && f.focus) try { f.focus(); } catch (e2) { } }
        gN.addEventListener('click', choose); gN.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
      });
      if (sel < 0) F.say(g === 'field' ? 'Each edge is an extension of degree 2, so the top has degree 2 · 2 = 4 over ℚ (the tower law). Tap a field.' : 'Tap ' + (o.ideals ? 'an ideal' : 'a subgroup') + ' to light everything that contains it and everything inside it. The small numbers on the edges are indices.');
      else { var x2 = nodes[sel]; F.say('<b>' + esc(x2.name) + '</b>' + (g === 'field' ? ': degree ' + x2.size + ' over ℚ.' : ': ' + x2.size + ' element' + (x2.size > 1 ? 's' : '') + (x2.els ? ' ' + esc(x2.els) : g === 'Z' ? ' (the multiples of ' + x2.d + ')' : '') + '. ' + (up.length - 1) + ' above it, ' + (down.length - 1) + ' inside it.')); }
    }
    watch(pic, function (w) { curW = w; draw(w); });
    return {};
  });

  // ================================================================ aa-burnside
  V.register('aa-burnside', function (el, o) {
    var shape = o.shape === 'square' ? 'square' : 'necklace', n = shape === 'square' ? 4 : int(o.n, 3, 8, 6), k = int(o.k, 2, 4, 2), dih = o.group === 'dihedral', mode = o.mode === 'table' ? 'table' : 'fixed';
    var F = frame(el, o, (shape === 'square' ? 'Colorings of the corners of a square' : 'Necklaces of ' + n + ' beads') + ' in ' + k + ' colors, and the symmetries that fix them');
    var syms = range(n).map(function (j) { return { name: j === 0 ? 'e' : 'r' + (j > 1 ? sup(j) : ''), p: range(n).map(function (i) { return (i + j) % n; }) }; });
    if (dih) range(n).forEach(function (j) { syms.push({ name: (j ? 'r' + (j > 1 ? sup(j) : '') : '') + 's', p: range(n).map(function (i) { return mod(j - i, n); }) }); });
    var cur = int(o.g, 0, syms.length - 1, 1), curW = 340, COL = ['var(--aa-1)', 'var(--aa-3)', 'var(--aa-2)', 'var(--aa-0)'], uid = V.uid('aab');
    function cycles(p) { var seen = [], out = []; for (var i = 0; i < n; i++) { if (seen[i]) continue; var c = [], j = i; while (!seen[j]) { seen[j] = 1; c.push(j); j = p[j]; } out.push(c); } return out; }
    var pic = mk('div', 'aa-pic'); F.box.appendChild(pic); var extra = mk('div', ''); F.box.appendChild(extra);
    function posOf(i, cx, cy, R) { if (shape === 'square') { var sq = [[-1, -1], [1, -1], [1, 1], [-1, 1]][i]; return [cx + sq[0] * R * 0.75, cy + sq[1] * R * 0.75]; } var a = -M.PI / 2 + 2 * M.PI * i / n; return [cx + R * M.cos(a), cy + R * M.sin(a)]; }
    function drawShape(parent, size, coloring, cyc, label) {
      var sv = svg(parent, label, size, size), cx = size / 2, cy = size / 2, R = size * 0.36;
      if (shape === 'square') S('rect', { x: cx - R * 0.75, y: cy - R * 0.75, width: R * 1.5, height: R * 1.5, fill: 'none', stroke: 'var(--mv-muted)', 'stroke-width': 1.5 }, sv);
      else S('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: 'var(--mv-muted)', 'stroke-width': 1.5 }, sv);
      range(n).forEach(function (i) { var p = posOf(i, cx, cy, R), ci = -1; if (cyc) cyc.forEach(function (c, q) { if (c.indexOf(i) >= 0) ci = q; }); S('circle', { cx: p[0], cy: p[1], r: M.max(5, size * (coloring ? 0.09 : 0.065)), fill: coloring ? COL[coloring[i]] : 'var(--aa-bg)', stroke: cyc ? pc(ci + 1) : 'var(--mv-muted)', 'stroke-width': cyc ? 3.5 : 1 }, sv); });
      return sv;
    }
    function draw(w) {
      clear(pic); clear(extra);
      var sym = syms[cur], cyc = cycles(sym.p), big = M.min(250, M.max(190, (w || 340) - 40)), sv = drawShape(pic, big, null, cyc, 'The symmetry ' + sym.name + ': beads in the same cycle are ringed in the same color'), cx = big / 2, cy = big / 2, R = big * 0.36, mid = arrowDef(sv, uid);
      range(n).forEach(function (i) { var j = sym.p[i]; if (j === i) return; var a = posOf(i, cx, cy, R), b = posOf(j, cx, cy, R), mx = (a[0] + b[0]) / 2 + (cx - (a[0] + b[0]) / 2) * 0.35, my = (a[1] + b[1]) / 2 + (cy - (a[1] + b[1]) / 2) * 0.35; S('path', { d: 'M' + (a[0] + (mx - a[0]) * 0.25) + ',' + (a[1] + (my - a[1]) * 0.25) + ' Q' + mx + ',' + my + ' ' + (b[0] + (mx - b[0]) * 0.25) + ',' + (b[1] + (my - b[1]) * 0.25), fill: 'none', stroke: 'var(--mv-muted)', 'stroke-width': 1.4, 'marker-end': mid }, sv); });
      range(n).forEach(function (i) { var p = posOf(i, cx, cy, R); S('text', { x: p[0], y: p[1] + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700 }, sv, String(i + 1)); });
      var fixedCount = M.pow(k, cyc.length);
      if (F.quiet) { F.say(''); return; }
      if (mode === 'fixed') {
        if (fixedCount <= 36) { var grid = mk('div', 'aa-fix'); for (var t = 0; t < fixedCount; t++) { var col = [], x = t; cyc.forEach(function (c) { var v = x % k; x = M.floor(x / k); c.forEach(function (bb) { col[bb] = v; }); }); var cell = mk('span', ''); drawShape(cell, 50, col, null, 'a coloring fixed by ' + sym.name); grid.appendChild(cell); } extra.appendChild(grid); }
        F.say('<b>' + sym.name + '</b> splits the ' + (shape === 'square' ? 'corners' : 'beads') + ' into <b>' + cyc.length + '</b> cycle' + (cyc.length > 1 ? 's' : '') + ' (ringed by color). A coloring is fixed exactly when each cycle is a single color: <b>' + k + sup(cyc.length) + ' = ' + fixedCount + '</b> fixed colorings' + (fixedCount <= 36 ? ' (drawn small, under the picture).' : '.'));
      } else {
        var tw = mk('div', 'aa-tbl'), tb = mk('table'), head = mk('tr'); ['Symmetry', 'Cycles', 'Fixed colorings'].forEach(function (h) { head.appendChild(mk('th', '', h)); }); var th = mk('thead'); th.appendChild(head); tb.appendChild(th); var body = mk('tbody'), total = 0;
        syms.forEach(function (sy, i) { var c = cycles(sy.p).length, f = M.pow(k, c); total += f; var r = mk('tr', i === cur ? 'hi' : ''); [sy.name, String(c), k + sup(c) + ' = ' + f].forEach(function (v) { r.appendChild(mk('td', '', v)); }); body.appendChild(r); });
        tb.appendChild(body); tw.appendChild(tb); extra.appendChild(tw);
        F.say('Burnside: the number of different ' + (shape === 'square' ? 'colorings' : dih ? 'bracelets' : 'necklaces') + ' is the average number of fixed colorings: ' + total + ' / ' + syms.length + ' = <b>' + (total / syms.length) + '</b>.');
      }
    }
    chipRow(F.ctl, syms.map(function (s2) { return s2.name; }), cur, function (i) { cur = i; draw(curW); }, 'Symmetries');
    if (!F.quiet) V.seg(F.ctl, { label: 'View', items: [['fixed', 'Fixed colorings'], ['table', 'Burnside table']], value: mode, change: function (v) { mode = v; draw(curW); } });
    watch(pic, function (w) { curW = w; draw(w); });
    return {};
  });

  // ================================================================ aa-gf
  function ptrim(a) { a = a.slice(); while (a.length && !a[a.length - 1]) a.pop(); return a; }
  function pmulmod(a, b, f, p) { var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(0); a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] = (r[i + j] + x * y) % p; }); }); var d = f.length - 1, li = 1; for (var t = r.length - 1; t >= d; t--) { var c = r[t]; if (!c) continue; for (var j = 0; j <= d; j++) r[t - d + j] = mod(r[t - d + j] - c * f[j] * li, p); } r = r.slice(0, d); while (r.length < d) r.push(0); return r; }
  function ptex(a) { var out = []; for (var i = a.length - 1; i >= 0; i--) { var c = a[i]; if (!c) continue; out.push((c === 1 && i ? '' : String(c)) + (i ? 'x' + (i > 1 ? sup(i) : '') : '')); } return out.length ? out.join(' + ') : '0'; }
  V.register('aa-gf', function (el, o) {
    var p = int(o.p, 2, 13, 2), f = Array.isArray(o.f) ? o.f.map(function (c) { return mod(int(c, -99, 99, 0), p); }) : [1, 1, 0, 1]; f = ptrim(f); var d = f.length - 1, q = M.pow(p, d);
    var F = frame(el, o, 'The field with ' + q + ' elements, ℤ' + sub(p) + '[x]/(' + ptex(f) + ')');
    var g = Array.isArray(o.g) ? o.g.map(function (c) { return mod(int(c, 0, 99, 0), p); }) : [0, 1]; while (g.length < d) g.push(0); g = g.slice(0, d);
    var one = [1]; while (one.length < d) one.push(0);
    function key(a) { return a.join(','); }
    var pw = [one.slice()], x = one.slice(); for (var t = 1; t < q; t++) { x = pmulmod(x, g, f, p); if (key(x) === key(one)) break; pw.push(x); }
    var ordG = pw.length, primitive = ordG === q - 1;
    function ordOf(a) { var y = a.slice(), k2 = 1; while (key(y) !== key(one)) { y = pmulmod(y, a, f, p); k2++; if (k2 > q) return 0; } return k2; }
    var mode = o.mode === 'mul' ? 'mul' : 'log', box = mk('div', ''), aSel = M.min(1, ordG - 1), bSel = M.min(2, ordG - 1); F.box.appendChild(box);
    function draw() {
      clear(box);
      box.appendChild(mk('p', 'aa-note', 'Elements are remainders a₀ + a₁x + ⋯ of degree below ' + d + ', with coefficients mod ' + p + '. Since ' + ptex(f) + ' = 0 here, x' + sup(d) + ' = ' + ptex(f.slice(0, d).map(function (c) { return mod(-c, p); })) + '.' + (F.quiet ? '' : ' The generator g = ' + ptex(g) + (primitive ? ' is primitive: its powers run through all ' + (q - 1) + ' nonzero elements.' : ' has order ' + ordG + ', not ' + (q - 1) + ', so its powers miss some elements.'))));
      if (F.quiet) return;
      if (mode === 'log') {
        var tw = mk('div', 'aa-tbl'), tb = mk('table'), hr = mk('tr'); ['k', 'gᵏ', '(a₀, a₁, …)', 'order'].forEach(function (h) { hr.appendChild(mk('th', '', h)); }); var th = mk('thead'); th.appendChild(hr); tb.appendChild(th); var body = mk('tbody');
        pw.forEach(function (a, i) { var r = mk('tr'), oo = ordOf(a); [String(i), ptex(a), '(' + a.join(', ') + ')', oo + (oo === q - 1 ? ' ★' : '')].forEach(function (v) { r.appendChild(mk('td', '', v)); }); body.appendChild(r); });
        tb.appendChild(body); tw.appendChild(tb); box.appendChild(tw);
        F.say((primitive ? '★ marks the primitive elements. ' : 'No power of g is primitive here: every one has order dividing ' + ordG + '. ') + (primitive ?
 'Since g' + sup(q - 1) + ' = 1, exponents work mod ' + (q - 1) + ', and gᵏ has order ' + (q - 1) + '/gcd(' + (q - 1) + ', k).' : ''));
      } else {
        var row = mk('div', 'aa-row');
        function pickEl(label, val, set) { var l = mk('label', 'aa-lab', label + ' '), s = D.createElement('select'); pw.forEach(function (a, i) { var op = D.createElement('option'); op.value = i; op.textContent = ptex(a); if (i === val) op.selected = true; s.appendChild(op); }); s.addEventListener('change', function () { set(+s.value); draw(); }); l.appendChild(s); row.appendChild(l); }
        pickEl('a =', aSel, function (v) { aSel = v; }); pickEl('b =', bSel, function (v) { bSel = v; }); box.appendChild(row);
        var e2 = (aSel + bSel) % ordG, direct = pmulmod(pw[aSel], pw[bSel], f, p);
        F.say('a = g' + sup(aSel) + ' and b = g' + sup(bSel) + ', so ab = g' + sup(aSel + bSel) + (aSel + bSel >= ordG ? ' = g' + sup(e2) : '') + ' = <b>' + ptex(pw[e2]) + '</b>. Multiplying the polynomials and reducing by ' + ptex(f) + ' gives ' + ptex(direct) + ': the same.');
      }
    }
    if (!F.quiet) V.seg(F.ctl, { label: 'View', items: [['log', 'Powers of g'], ['mul', 'Multiply by adding exponents']], value: mode, change: function (v) { mode = v; draw(); } });
    draw();
    return {};
  });
})(window, document);
